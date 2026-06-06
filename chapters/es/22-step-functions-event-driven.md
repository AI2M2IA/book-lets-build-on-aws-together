# Capítulo 22: El Diagrama de Flujo que Se Ejecuta Solo

Leo llevaba una hora mirando el mismo archivo de registro. Las trazas de pila eran lo bastante claras individualmente, pero el patrón entre ellas —la manera en que un paso fallaba silenciosamente y el siguiente paso se ejecutaba de todos modos— le había llevado un rato verlo. Finalmente se recostó, dejó su café y escribió una sola palabra en su libreta: *coordinación*.

Imagina a un director de orquesta bajándose del podio a mitad de la actuación. La orquesta sigue tocando, pero no hay nadie que haga entrar a los metales en el compás 47, nadie que marque el silencio antes del final. Los músicos individuales tocan sus partes correctamente. La actuación se desmorona de todos modos, porque las partes dependen de una coordinación que nadie está gestionando.

Ese es el problema que Leo había encontrado en el código de confirmación de pedidos. No un bug en ningún paso individual. Un fallo de coordinación.

---

Los contenedores se estaban ejecutando correctamente y desplegándose de forma limpia. El pipeline de despliegue de ECS era sólido. Pero dentro del código de la aplicación, un tipo diferente de fallo había estado acumulándose durante semanas. Los contenedores estaban bien. La lógica dentro de uno de ellos no.

Leo había estado rastreando el patrón en los registros pero no lo había entendido hasta que contó las ocurrencias.

Once veces. En dos semanas.

---

Una confirmación de pedido en Nimbus requería que sucedieran cinco cosas en secuencia: cobrar la tarjeta, enviar el correo de confirmación, notificar al restaurante, actualizar el inventario y registrar la transacción para la contabilidad.

Cuando Leo había escrito la función original de confirmación de pedidos, había envuelto todo en un solo bloque `try/except` y dijo "estará bien, capturaremos los errores en los registros". Eso fue hace ocho meses.

No estaba bien.

Si el paso tres fallaba —si la notificación al restaurante agotaba el tiempo de espera—, los pasos uno y dos ya habían ocurrido. El cliente había sido cobrado. El correo había sido enviado. Pero el restaurante no sabía que el pedido existía.

Leo tenía un nombre para esta categoría de error: el éxito parcial. "Todo funcionó", dijo, "excepto la parte que importaba."

"¿Cuántas veces ha pasado esto?", preguntó Maya.

"Once veces en las últimas dos semanas. Detectamos la mayoría por llamadas furiosas al restaurante. Dos las encontramos en los registros, después del hecho."

"Así que no tenemos coordinación", dijo Priya. "Cinco pasos, ejecutándose como un script, sin garantía de que todos se completen. ¿Y qué pasa si alguien intenta entrar por la fuerza durante el paso dos, después de que el cobro se procesa pero antes de que se notifique al restaurante? Ya le hemos facturado al cliente un pedido que el restaurante no tiene."

"O de que se completen en el orden correcto."

"O de que sepamos cuál falló."

Leo abrió el código en el proyector. Era una función de Python: cincuenta líneas, cinco llamadas a API secuenciales, un único bloque try/except alrededor de todo.

"Necesitamos un flujo de trabajo", dijo Maya. "Algo que rastree cada paso. Espera, pero *¿por qué* no podemos simplemente agregar un mejor manejo de errores a la función de Python existente? ¿Por qué necesitamos un servicio completamente nuevo?"

"Porque un mejor manejo de errores todavía se ejecuta en un solo proceso que puede fallar en cualquier punto", dijo Leo. "Si el servidor se reinicia a mitad de la ejecución, el manejo de errores se reinicia con él. Step Functions persiste el estado externamente."

Piensa en una lista de verificación de fabricación, una donde cada estación confirma la finalización antes de pasar a la siguiente, y donde toda la línea mantiene su posición cuando algo falla. La línea no se reinicia desde el principio. Se reanuda desde la estación exacta que falló. El estado de esa estación queda registrado. Los pasos anteriores están hechos y no se repiten. Los pasos posteriores esperan hasta que el problema se resuelva.

Eso es lo que necesitaba el flujo de confirmación de pedidos. No más código alrededor del problema. Un sistema diseñado para gestionar el problema.

**AWS Step Functions: Orquestar Flujos de Trabajo**

**AWS Step Functions** es un servicio de orquestación sin servidor que coordina los pasos de una aplicación como un flujo de trabajo visual. Cada paso es un **estado** en una **máquina de estados**.

En lugar de un script de Python que se ejecuta de arriba abajo y falla, defines el flujo de trabajo como una máquina de estados en JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Cada estado puede:

- **Ejecutar una función de Lambda** (el patrón más común)
- **Ejecutar una tarea de ECS** (para trabajo de mayor duración)
- **Esperar un momento específico** o un **evento** (pausar el flujo de trabajo hasta que algo externo ocurra)
- **Elegir una ruta** según condiciones (lógica if/else)
- **Ejecutar ramas paralelas** simultáneamente
- **Reintentar ante un fallo** con backoff configurable
- **Capturar errores** y enrutarlos a estados de manejo de errores

Step Functions gestiona el estado de ejecución de forma durable. Si el paso 3 falla, la ejecución se pausa en el paso 3. Puedes inspeccionar la ejecución fallida en la consola, corregir el problema y reiniciar desde el paso 3, sin repetir los pasos 1 y 2.

Quizás te preguntes: ¿no puedes simplemente escribir la lógica de reintentos en tu función de Lambda? Sí, pero entonces también estás escribiendo el rastreo de fallos, la persistencia de estado y el registro de auditoría en código. Y cuando el paso 3 de 7 falla, necesitas saber qué restaurante se estaba procesando, qué ocurrió antes y dónde reanudar. Step Functions hace todo eso.

**El Flujo de Pedidos de Nimbus: Máquina de Estados Anotada**

Aquí hay una versión simplificada de la máquina de estados real de Step Functions que Nimbus construyó para la confirmación de pedidos, anotada para que puedas ver qué hace cada pieza:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Algunas cosas a notar:

**`ChargeCard` tiene dos cláusulas Catch.** Una para `PaymentDeclinedError` (un fallo conocido y esperado: la tarjeta fue rechazada, no un error del sistema) y una para `States.ALL` (cualquier otra cosa: una caída del sistema, un timeout, una excepción inesperada). Se enrutan a estados diferentes porque significan cosas diferentes.

**`NotifyRestaurant` tiene un Catch que enruta a `RestaurantNotificationFailed`.** Este es el bug que causó los once incidentes. En el viejo script de Python, no había equivalente: si la notificación fallaba, la función o bien fallaba silenciosamente o bien registraba un error y continuaba. Step Functions hace explícita la ruta del fallo: va a algún lugar específico, y ese lugar alerta al equipo de soporte antes de que alguien tenga que llamar.

**Cada Task tiene Retry.** Si el servicio de correo electrónico tiene un timeout transitorio, reintenta automáticamente, tres veces, con backoff creciente. El cliente nunca ve esto. El pedido no se pierde.

**El flujo es un grafo, no un script.** Si `NotifyRestaurant` falla permanentemente (tras los reintentos), la ejecución no continúa a `UpdateInventory`. El flujo de trabajo se detiene en `RestaurantNotificationFailed`. El inventario no se actualiza para un restaurante que no conoce el pedido. Este es el comportamiento correcto.

"Espera, pero *¿por qué* necesitamos rutas de fallo separadas para tarjeta rechazada vs error del sistema?", preguntó Maya.

"Porque requieren respuestas completamente diferentes", dijo Leo. "Una tarjeta rechazada significa que enviamos un correo al cliente y le pedimos que lo intente de nuevo. Un error del sistema en la función de cobro significa que necesitamos un ingeniero que investigue por qué la función de Lambda está fallando. El mismo resultado observable —el pedido no se procesó— pero una remediación completamente diferente."

**Tipos de Estado: Los Bloques de Construcción**

**Task**: Ejecutar una acción: llamar a una función de Lambda, iniciar una tarea de ECS, llamar a una API. Aquí es donde ocurre el trabajo real.

**Choice**: Ramificar según condiciones en los datos de entrada. Como un if/else en código.

**Parallel**: Ejecutar múltiples ramas simultáneamente y esperar a que todas se completen.

**Map**: Aplicar un conjunto de estados a cada elemento de una lista. Procesar 50 elementos de menú de un restaurante en paralelo.

Cuando Nimbus importaba el menú de un restaurante, el menú podía contener entre 8 y 200 elementos. Para cada elemento, el proceso de importación necesitaba: validar el formato, comprobar los datos de alérgenos, redimensionar la foto y escribir el registro en DynamoDB.

Sin el estado Map, esto sería una sola Lambda procesando los elementos secuencialmente: 200 elementos × 200ms por elemento = 40 segundos de tiempo de procesamiento. Con el estado Map, Step Functions lanza ejecuciones concurrentes de los estados de procesamiento —hasta el límite de concurrencia configurado— y espera a que todas se completen. Los mismos 200 elementos pueden terminar en menos de 5 segundos.

**Wait**: Pausar durante un tiempo especificado o hasta una marca de tiempo. Útil para retrasos programados.

**Pass**: Pasar la entrada a la salida sin hacer trabajo. Se usa para la transformación de datos y las pruebas.

**Succeed/Fail**: Estados terminales que finalizan la ejecución.

Para la incorporación de restaurantes, Leo diseñó un flujo de trabajo:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, con 3 reintentos)
3. Rama paralela:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, espera a que la rama paralela se complete)
5. NotifySalesTeam (Task → Lambda)

Los pasos 3a y 3b se ejecutan en paralelo: no dependen el uno del otro, y ejecutarlos simultáneamente ahorra tiempo.

Después de que la primera cohorte de restaurantes completara la incorporación, surgió un requisito de cumplimiento: antes de que un socio restaurante pudiera ponerse en marcha, un gestor de cuentas de Nimbus tenía que revisar y aprobar manualmente la documentación de la licencia. Esto podía tardar de uno a tres días hábiles.

"¿Y qué pasa si alguien intenta entrar por la fuerza durante esa ventana?", preguntó Priya. "Si el restaurante está parcialmente configurado —cuenta de pago creada pero aún no aprobada— y alguien descubre el estado pendiente, podría intentar explotar la configuración a medio abrir."

Más prácticamente: ¿cómo pausas un flujo de trabajo de Step Functions durante tres días esperando a un humano?

La respuesta es el **patrón de callback con un token de tarea**.

Cuando `ValidateLicense` se ejecuta, en lugar de completarse automáticamente, llama a una Lambda que hace tres cosas:

1. Envía un correo al gestor de cuentas con los documentos del restaurante
2. Registra un **token de tarea** (un identificador único que Step Functions genera para esta ejecución y estado específicos) en una base de datos, asociado a esa revisión pendiente
3. Retorna a Step Functions con `.waitForTaskToken`, lo que le indica a Step Functions que pause la ejecución en este estado indefinidamente

Step Functions aparca la ejecución. Nada más se bloquea: ningún servidor queda esperando. La máquina de estados simplemente espera, sin consumir recursos de cómputo.

Tres días después, el gestor de cuentas hace clic en "Aprobar" en la herramienta interna de administración. La herramienta de administración busca el token de tarea en la base de datos y llama:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions se reanuda. La ejecución continúa desde el paso 2 (`ImportMenu`), con la información del revisor disponible en el estado del flujo de trabajo.

"La ejecución estuvo pausada durante tres días", dijo Leo, "y lo único que ocurrió cuando la aprobé fue una llamada a la API."

"¿Y si el gestor de cuentas la rechaza?", preguntó Maya.

"Llamamos a `send_task_failure` en su lugar. La máquina de estados captura eso y enruta a un estado `NotifyRejection` que envía un correo al socio restaurante."

Step Functions no sondea. No reintenta. No agota el tiempo (a menos que establezcas un timeout de heartbeat). Simplemente espera hasta que el callback llega, luego continúa. Esto es fundamentalmente diferente de sondear una base de datos o una cola, y es por eso que Step Functions es muy adecuado para flujos de trabajo que mezclan pasos automatizados y manuales.

**Leer la Consola de Ejecución: Cómo Se Ve un Fallo**

Cuando la Lambda de notificación al restaurante agotó el tiempo durante la primera semana de Nimbus con Step Functions, Leo abrió la consola de Step Functions e hizo clic en la ejecución fallida.

El **Historial de Eventos de Ejecución** mostraba una línea de tiempo de exactamente lo que ocurrió:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

En 42 segundos, Step Functions había cobrado la tarjeta, enviado el correo, intentado la notificación al restaurante tres veces, capturado el fallo, alertado al equipo de soporte y registrado el historial completo. Antes de Step Functions, este fallo habría sido invisible: la función de Python habría registrado "notificación fallida" y devuelto 200 al llamante como si nada estuviera mal.

"La línea de tiempo muestra exactamente dónde salieron mal las cosas y cuándo", dijo Leo. "Y cada intento de reintento tiene marca de tiempo. Puedes ver los intervalos de backoff."

Priya miró la consola. "¿Y este historial se almacena durante cuánto tiempo?"

El historial de ejecución de los flujos de trabajo Standard se almacena durante 90 días. Para el cumplimiento o la auditoría a largo plazo, los eventos de ejecución también pueden exportarse a CloudWatch Logs y conservarse indefinidamente.

**Flujos de Trabajo Standard vs Express**

Step Functions ofrece dos tipos de flujos de trabajo:

**Flujos de trabajo Standard**:

- Duración máxima: 1 año
- Las ejecuciones son durables: el estado se persiste, puede inspeccionarse y auditarse
- Ejecución exactamente una vez (una tarea nunca se ejecuta más de una vez a menos que configures un Retry)
- Precio por transición de estado
- Mejor para flujos de trabajo de larga duración e importantes (procesamiento de pedidos, incorporación, flujos de pago)

**Flujos de trabajo Express**:

- Duración máxima: 5 minutos
- Mayor rendimiento: hasta 100.000 por segundo
- Ejecución al menos una vez (asincrónica) o como máximo una vez (sincrónica): diseña las tareas para que sean idempotentes
- Precio por duración (como Lambda)
- Mejor para flujos de trabajo de alto volumen y corta duración (procesamiento de eventos en tiempo real, ingesta de datos de IoT)

"¿Cuánto cuesta eso al mes?", preguntó Tom, abriendo la página de precios. "Por transición de estado para Standard: eso se suma si tienes muchos pasos."

Leo recorrió las cuentas. Para el flujo de trabajo de incorporación de restaurantes (seis estados de tarea por ejecución, aproximadamente 12-15 nuevos restaurantes al mes): menos de cien transiciones de estado, menos de un centavo, y enteramente dentro de la capa gratuita mensual de 4.000 transiciones, así que efectivamente $0. Para el flujo de trabajo de confirmación de pedidos al tráfico completo de Nimbus: más significativo, pero todavía muy por debajo del costo de depurar once éxitos parciales al mes manualmente.

"El tiempo de depuración es el costo oculto", dijo Leo.

"Ese siempre es el costo oculto", dijo Tom.

Tom sacó los números con más cuidado, porque eso era Tom.

**Costo del flujo de trabajo Standard para el flujo de confirmación de pedidos de Nimbus**: cinco estados por pedido en la ruta feliz, a $0,000025 por transición de estado. Cinco transiciones de estado × $0,000025 × 15.000 pedidos al mes = **$1,88/mes**. A diez veces el volumen de pedidos: unos $19/mes. El costo de depuración de un solo incidente de éxito parcial (24 minutos de tiempo de un ingeniero de soporte) excedía la factura mensual de Step Functions muchas veces.

La comparación se vuelve importante si alguien sugiere usar flujos de trabajo Standard para eventos de análisis de alta frecuencia. Supón que Nimbus quisiera usar Step Functions para procesar cada evento bruto del clickstream: cada vista de página de menú, cada scroll, cada búsqueda. Eso son aproximadamente 800.000 eventos por día a su escala actual. Un flujo de trabajo Standard de cinco estados para cada evento: 800.000 × 5 × $0,000025 × 30 días = **$3.000/mes**. Eso es dinero real para un pipeline de análisis.

Los flujos de trabajo Express para ese mismo volumen: precio por solicitud más duración, no por transición de estado. Las 24 millones de ejecuciones mensuales cuestan $1,00 por millón de solicitudes = $24. Duración: 24M × 500ms al mínimo de facturación de 64MB ≈ 208 GB-horas × $0,06 = $12,50. Total ≈ **$36,50/mes**, casi dos órdenes de magnitud más barato que los $3.000 de Standard.

"Entonces el tipo de flujo de trabajo no es solo una decisión arquitectónica", dijo Tom. "Es una decisión de costo. El mismo número de estados puede costar casi cien veces más dependiendo de qué tipo de flujo de trabajo uses."

"Y cuál es mejor depende enteramente de lo que haga el flujo de trabajo", dijo Leo. "Confirmación de pedidos: Standard. Es importante, tiene rutas de fallo significativas, queremos el rastro de auditoría. Procesamiento de eventos de análisis: Express. Es de alto volumen, corta duración, y no necesitamos un historial de ejecución de 90 días para cada vista de página."

Si tu proceso tiene dos pasos y no necesita un rastro de auditoría, una simple función de Lambda es más barata y no requiere sintaxis de máquina de estados en JSON; pero si cualquier paso puede fallar de forma independiente y necesita reintentarse o reiniciarse sin repetir los pasos anteriores, Step Functions se paga solo en depuración reducida y remediación manual.

Para la incorporación de restaurantes de Nimbus: Standard (es importante, durable, puede tardar horas si hay pasos manuales involucrados).

Para las actualizaciones de estado de pedidos en tiempo real de Nimbus: Express (alto volumen, corta duración, menos crítico).

**Arquitectura Basada en Eventos: El Panorama Más Amplio**

Step Functions es una pieza de un patrón más grande: la **arquitectura basada en eventos**. En lugar de que los servicios se llamen directamente entre sí (acoplamiento fuerte), los servicios emiten eventos, y otros servicios reaccionan a esos eventos.

Hemos visto esto a lo largo del libro:

- Pedidos realizados → SNS publica un evento → las colas de SQS lo entregan a los consumidores
- Archivo subido a S3 → Lambda activada para procesarlo
- Registro de DynamoDB modificado → DynamoDB Streams → Lambda actualiza una caché

**Amazon EventBridge** (anteriormente CloudWatch Events) es el bus de eventos avanzado para este patrón. Enruta eventos de los servicios de AWS y de tus propias aplicaciones a destinos (Lambda, SQS, Step Functions, etc.) según reglas.

EventBridge permite el acoplamiento débil a nivel arquitectónico: el servicio de pedidos publica eventos `order.placed` sin saber quién está escuchando. El servicio de análisis, el servicio de notificaciones y el servicio de puntos de lealtad escuchan todos de forma independiente. Agregar un nuevo oyente no requiere cambiar el servicio de pedidos.

EventBridge también se integra de forma nativa con docenas de servicios de AWS como **fuentes de eventos**. Cuando una llamada a la API de CloudTrail coincide con un patrón, EventBridge puede disparar una regla. Cuando una instancia de EC2 cambia de estado, EventBridge puede activar una Lambda. Cuando una instancia de RDS hace failover, EventBridge puede alertar al ingeniero de guardia. Puedes tratar todo el plano de control de AWS como un flujo de eventos.

Para Nimbus, una regla de EventBridge particularmente útil: activar una Lambda cada vez que se sube una nueva imagen a ECR. La Lambda comprueba el resultado del escaneo de la imagen y publica en el canal de Slack de ingeniería si se encuentran CVEs HIGH o CRITICAL, antes de que alguien despliegue la imagen. Esto combina el escaneo de seguridad de ECR (del capítulo 21) con el enrutamiento de eventos de EventBridge en una puerta de seguridad automatizada.

El principio de la arquitectura basada en eventos es el mismo que la lógica de reintentos de Step Functions: hacer el fallo explícito y enrutado, no silencioso y tragado. Los servicios que se comunican a través de eventos fallan de forma elegante: si la Lambda de puntos de lealtad está caída cuando un evento `OrderConfirmed` se dispara, EventBridge puede reintentar la entrega o enviarla a una cola de mensajes fallidos. La confirmación de pedido en sí no se ve afectada. El desacoplamiento es la resiliencia.

**EventBridge: Desacoplar los Efectos Secundarios del Flujo Principal**

Después de que la máquina de estados de confirmación de pedidos se estuviera ejecutando de forma limpia, Maya planteó una pregunta en la siguiente revisión de arquitectura.

"Queremos agregar puntos de lealtad cuando se confirma un pedido. El cliente obtiene un punto por cada dólar gastado. ¿Dónde va eso en la máquina de estados?"

El primer instinto de Leo: agregar un estado `GrantLoyaltyPoints` después de `LogTransaction`.

La respuesta de Priya: "¿Y luego cuando agreguemos bonos de referidos? ¿Y encuestas post-pedido? ¿Y solicitudes de calificación de restaurantes? Cada una agrega un estado a la ruta crítica. Si la Lambda de puntos de lealtad falla, toda la confirmación de pedido falla."

"El flujo de confirmación de pedidos debería hacer una sola cosa", dijo. "Confirmar el pedido. Todo lo demás es un efecto secundario."

Este es el argumento arquitectónico a favor de **Amazon EventBridge** como el mecanismo para desacoplar débilmente los efectos secundarios del flujo de trabajo principal.

El enfoque revisado: cuando el estado `LogTransaction` se completa con éxito, la Lambda publica un evento en EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Luego las reglas de EventBridge enrutan ese evento a destinos independientes:

- **Regla 1**: `OrderConfirmed` → Lambda de Puntos de Lealtad (otorga 32 puntos por un pedido de $32)
- **Regla 2**: `OrderConfirmed` → Lambda de Encuesta Post-Pedido (encola una encuesta para 2 horas después de la entrega)
- **Regla 3**: `OrderConfirmed` → Stream de Kinesis de Análisis (alimenta el panel en tiempo real)

Cada regla es independiente. La Lambda de Puntos de Lealtad puede fallar sin afectar la cola de encuestas. El pipeline de análisis puede quedarse atrás sin bloquear el sistema de lealtad. Agregar un nuevo efecto secundario (una solicitud de calificación de restaurante, una notificación de cashback) requiere crear una nueva regla de EventBridge, no modificar la máquina de estados.

"¿Y qué pasa si alguien intenta entrar por la fuerza a través de una regla de EventBridge?", preguntó Priya. "Si el evento contiene PII del cliente, cada Lambda que lo recibe es ahora un punto de acceso a PII."

El evento se diseñó cuidadosamente: solo los IDs, no los nombres, direcciones o detalles de pago. Cualquier Lambda que necesitara datos del cliente los buscaría en la base de datos usando el ID del cliente, con sus propios permisos de IAM controlando a qué podía acceder.

"El evento es una señal", dijo Priya. "No un volcado de datos."

**Cuándo Step Functions Es la Herramienta Correcta**

Step Functions sobresale cuando tienes:

**Flujos de trabajo de múltiples pasos** que necesitan rastrear el progreso a través de los pasos

**Procesos con humano en el bucle**: Step Functions puede esperar indefinidamente un evento externo (como un humano aprobando algo) y luego continuar

**Manejo de errores a escala**: lógica de reintentos, captura y respaldo integrada a través de muchos pasos

**Procesos auditables**: cada ejecución registra cada transición de estado. Puedes ver exactamente qué ocurrió y cuándo.

**Lógica paralela o secuencial compleja**: el flujo de trabajo visual hace que sea más fácil de razonar que el código equivalente

Step Functions es exagerado para procesos simples de dos pasos. Úsalo cuando la coordinación en sí es valiosa y los escenarios de fallo son importantes.

**Cuándo Step Functions Es la Herramienta Equivocada**

"Espera, pero *¿por qué* no usaríamos Step Functions para todo?", preguntó Maya al final de la sesión de diseño. "Hemos construido el flujo de incorporación de restaurantes. Tenemos el flujo de confirmación de pedidos. ¿Por qué no convertir todo en máquinas de estados?"

La respuesta honesta: porque Step Functions agrega una sobrecarga que no todo flujo de trabajo justifica.

**Procesos simples de dos pasos**: Si tienes una Lambda que procesa un archivo subido llamando a una segunda Lambda, la sobrecarga de coordinación de una máquina de estados no vale el beneficio operativo. Dos Lambdas llamadas secuencialmente dentro de una sola función es más simple, más fácil de probar y no tiene costo por transición de estado.

**Flujos de trabajo de frecuencia ultra alta y sub-segundo**: Los flujos de trabajo Standard tienen un costo por transición de estado no trivial que se acumula a alto volumen (como mostró el ejemplo de análisis anterior). Los flujos de trabajo Express resuelven el problema del costo pero no proporcionan un historial de estado durable. A muy alta frecuencia con muy corta duración, SQS más Lambda (el patrón del capítulo 19) es más simple y más barato que cualquiera de los tipos de Step Functions.

**Distribución en abanico pura sin coordinación**: Si necesitas enviar el mismo evento a veinte consumidores y no te importa el resultado de cada uno, SNS es la herramienta. Step Functions agrega un rastreo de estado que no necesitas y que pagarías innecesariamente.

**Interacciones de usuario sincrónicas en tiempo real**: Las ejecuciones de Step Functions son asincrónicas. Si un usuario está esperando en una pantalla de pago una respuesta sincrónica en menos de 500ms, un flujo de trabajo Standard de Step Functions no está diseñado para esto (los flujos de trabajo Express pueden invocarse de forma sincrónica, pero la sobrecarga de latencia sigue siendo mayor que una llamada directa a Lambda). Para los flujos sincrónicos de cara al usuario, Lambda + API Gateway con un manejo de errores bien diseñado suele ser más apropiado.

El principio: usa Step Functions cuando la *coordinación* de los pasos sea en sí misma compleja —cuando los pasos puedan fallar de forma independiente, cuando necesites reintentar pasos individuales sin repetir los anteriores, cuando el historial de ejecución tenga valor de cumplimiento o depuración, o cuando el flujo de trabajo involucre pasos de aprobación humana que puedan tardar días. No lo uses para agregar sobrecarga de orquestación a una lógica secuencial simple que funciona bien como una sola función.

## Fortalezas y Limitaciones

**Por qué Step Functions es poderoso**:

- Historial de ejecución visual: ve exactamente dónde está un flujo de trabajo (o dónde falló)
- Reintentos y manejo de errores integrados: sin código de reintentos personalizado
- Estado durable: las ejecuciones sobreviven a reinicios de servicio y caídas
- Integraciones directas con más de 200 servicios de AWS (no solo Lambda)
- El flujo de trabajo visual se autodocumenta
- El patrón de callback permite la espera indefinida de acciones humanas sin consumir cómputo

**Donde se complica**:

- Los flujos de trabajo Standard tienen precio por transición de estado: los flujos de trabajo complejos con muchos estados pueden volverse costosos a escala
- El formato JSON de ASL (Amazon States Language) tiene una curva de aprendizaje
- El tamaño máximo de payload es de 256KB: los datos grandes deben pasarse mediante referencias de S3, no directamente a través del flujo de trabajo
- Los flujos de trabajo de larga duración con muchos pasos manuales requieren una configuración cuidadosa de timeouts
- Depurar errores de ASL requiere ejecutar ejecuciones; no hay un emulador local tan capaz como el servicio real
- Los permisos de IAM deben otorgarse por separado para cada recurso que la máquina de estados llama: olvidar un permiso causa un error confuso en tiempo de ejecución

## Resumen

Los contenedores del capítulo 21 hicieron que los despliegues fueran fiables. Step Functions hace que los procesos de negocio de múltiples pasos sean fiables: el mismo principio de "eliminar el riesgo del traspaso" aplicado a la lógica de la aplicación.

- **Step Functions** orquesta flujos de trabajo de múltiples pasos como máquinas de estados.
- Cada **estado** puede ejecutar una función de Lambda, ejecutar una tarea de ECS, esperar, ramificar o ejecutar pasos paralelos.
- **Retry y catch** están integrados en cada estado: no se necesita código de reintentos personalizado.
- **Flujos de trabajo Standard**: de larga duración (hasta 1 año), durables, exactamente una vez. Para procesos de negocio críticos.
- **Flujos de trabajo Express**: de corta duración (hasta 5 minutos), de alto rendimiento. Para el procesamiento de eventos de alto volumen.
- **Patrón de callback con token de tarea**: pausa un flujo de trabajo indefinidamente esperando un evento externo o una acción humana; reanúdalo con una sola llamada a la API.
- **Estado Map**: procesa una lista de elementos de forma concurrente: reemplaza los bucles secuenciales con distribución en abanico paralela.
- **Integraciones directas con el SDK**: llama a DynamoDB, S3, SQS y más de 200 servicios de AWS directamente desde un estado, sin un envoltorio de Lambda.
- **EventBridge**: desacopla los efectos secundarios del flujo de trabajo principal: publica un solo evento, deja que reglas independientes lo enruten a los servicios de puntos de lealtad, análisis y encuestas sin modificar la máquina de estados central.
- **Costo Standard vs Express**: Standard a $0,000025 por transición de estado funciona bien para flujos de trabajo críticos de bajo volumen (confirmación de pedidos a $1,88/mes para Nimbus). Express con precio por solicitud más duración es apropiado para eventos de alta frecuencia donde Standard costaría docenas de veces más (~80x en las cuentas del clickstream de Nimbus).
- La **arquitectura basada en eventos** usa servicios como SNS, SQS, Lambda y EventBridge para desacoplar los sistemas en torno a eventos en lugar de llamadas directas.
- Usa Step Functions cuando la coordinación de los pasos sea en sí misma compleja y cuando la auditabilidad importe. No lo uses para secuencias simples de dos pasos, flujos de trabajo de frecuencia ultra alta, distribución en abanico pura o flujos sincrónicos de cara al usuario.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.1)*

- **Señales de caso de uso de Step Functions**: "orquestar múltiples funciones de Lambda", "flujo de trabajo con reintentos y manejo de errores", "paso de aprobación humana en un flujo de trabajo automatizado", "rastro de auditoría de cada paso del flujo de trabajo" → Step Functions.
- **Standard vs Express**: Standard para flujos de trabajo de larga duración, auditables y críticos para el negocio. Express para el procesamiento de eventos de alto rendimiento y corta duración.
- **SQS vs Step Functions**: SQS para colas de tareas simples (productor/consumidor). Step Functions para flujos de trabajo de múltiples pasos con lógica compleja, reintentos y rastreo de estado.
- **Señales de EventBridge**: "enrutar eventos de los servicios de AWS a destinos", "integración basada en eventos entre servicios", "programar una función de Lambda" → EventBridge (anteriormente CloudWatch Events).
- **Patrón de callback**: Step Functions puede pausar la ejecución y esperar un callback externo (un token de tarea). El trabajador hace el callback cuando termina. Útil para tareas de ECS de larga duración donde no quieres el límite de 15 minutos de Lambda.
- **Integraciones directas con el SDK**: Step Functions puede llamar a los servicios de AWS directamente (DynamoDB, S3, SQS, etc.) sin pasar por Lambda. Reduce el costo y la latencia para llamadas a servicios simples. Por ejemplo, escribir un registro de pedido en DynamoDB puede ser una llamada directa al SDK desde la máquina de estados sin una función de Lambda: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Esto elimina el arranque en frío de Lambda, el costo de ejecución de Lambda y el código que solo llama a `dynamodb.put_item(...)` y retorna.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica por qué Step Functions es útil para los flujos de trabajo de múltiples pasos. ¿Qué proporciona que una simple función de Lambda llamando a otras funciones de Lambda no proporciona?

*(Pista: Piensa en qué ocurre cuando el paso 3 de 5 falla en cada enfoque. ¿Cómo sabes qué ocurrió? ¿Cómo reintentas solo el paso 3?)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa de servicios financieros procesa solicitudes de préstamo en múltiples pasos: verificación de crédito, verificación de ingresos, validación de documentos, revisión del suscriptor (manual) y notificación de la decisión. Cada paso puede tardar desde segundos (verificación de crédito) hasta días (revisión del suscriptor). La empresa necesita un rastro de auditoría completo de cada paso para el cumplimiento. Los pasos automatizados fallidos deben reintentarse automáticamente; los pasos manuales deben pausarse y esperar una decisión humana.

¿Qué servicio cumple MEJOR con estos requisitos?

A) Funciones de AWS Lambda encadenadas con colas de SQS entre cada paso  
B) Flujos de trabajo Standard de AWS Step Functions con un patrón de espera de callback para el paso de revisión del suscriptor  
C) Flujos de trabajo Express de AWS Step Functions para los pasos automatizados y SQS FIFO para el paso manual  
D) Amazon EventBridge con reglas de eventos enrutando entre funciones de Lambda para cada paso

**Pista 1**: Duración "de hasta días": ¿qué tipo de Step Functions admite esto?

**Pista 2**: "Esperar una decisión humana": ¿qué patrón de Step Functions está diseñado para esto?

**Pista 3**: "Rastro de auditoría completo para el cumplimiento": ¿qué servicio proporciona un historial de estado por ejecución?

**Respuesta**: B

**Explicación**: Los flujos de trabajo Standard de Step Functions pueden ejecutarse hasta 1 año, admitiendo el paso de revisión del suscriptor que dura días. El patrón de espera de callback pausa la ejecución en el paso del suscriptor con un token de tarea; cuando el suscriptor toma una decisión, hace el callback con el token para continuar el flujo de trabajo. Los flujos de trabajo Standard registran cada transición de estado: rastro de auditoría completo para el cumplimiento.

**¿Por qué no A?** Lambda encadenada vía SQS no proporciona rastreo de estado ni rastro de auditoría integrados. Los pasos fallidos requieren lógica de reintentos personalizada. Reiniciar desde un paso fallido específico requiere una implementación personalizada.

**¿Por qué no C?** Los flujos de trabajo Express tienen una duración máxima de 5 minutos: incompatible con un paso que puede tardar días.

**¿Por qué no D?** EventBridge enruta eventos entre servicios pero no mantiene el estado del flujo de trabajo ni proporciona reintentos/auditoría integrados. Construir esto solo sobre EventBridge requiere una gestión de estado personalizada.

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está construyendo un proceso de resolución de disputas de calidad de la comida. Cuando un cliente reporta una mala experiencia:

1. El reporte se valida automáticamente (comprueba si el pedido existe, si es lo bastante reciente)
2. Se notifica automáticamente al restaurante
3. Un agente de soporte de Nimbus revisa la queja (paso manual: puede tardar de 1 a 3 días hábiles)
4. Según la decisión del agente: emitir reembolso (Lambda → procesador de pagos) O enviar un cupón de disculpa (Lambda → servicio de cupones) O escalar a la gerencia (subflujo de Step Functions)
5. Se notifica al cliente del resultado

Diseña esto como un flujo de trabajo de Step Functions. ¿Qué tipo de estado maneja cada paso? ¿Cómo manejarías la espera de 1 a 3 días? ¿Cómo modelarías la ramificación en el paso 4?

*(No existe una única respuesta correcta. El objetivo es practicar el diseño de estados de Step Functions.)*

**Extensión**: Después de que la máquina de estados se complete (cualquiera que sea la rama), publica un evento `OrderDisputeResolved` en EventBridge. ¿Qué efectos secundarios podrían escuchar este evento? Considera: el sistema de calificación del restaurante, los puntos de lealtad del cliente (los reembolsos podrían descontar puntos), el pipeline de análisis (la tasa de disputas es una métrica clave de la calidad del restaurante) y el panel de seguimiento de SLA del equipo de soporte al cliente. ¿Cómo evita usar EventBridge aquí que la máquina de estados de disputas se convierta en una araña de dependencias?

## Escena Post-Créditos

El flujo de trabajo de incorporación de restaurantes estaba en producción.

Durante el mes siguiente, se incorporaron 12 nuevos socios restaurantes. Dos tuvieron fallos durante el paso de procesamiento de pagos (paso 3). En ambos casos, Step Functions capturó el error exacto, guardó el estado de la ejecución y envió una alerta al equipo de Nimbus.

Leo corrigió la causa raíz (una clave de API mal configurada para el proveedor de pagos) y reintentó ambas ejecuciones desde el paso 3. Las ejecuciones se completaron en 23 segundos cada una, retomando desde exactamente donde habían fallado.

Ningún restaurante necesitó ser reimportado. No se crearon roles de IAM por duplicado. No se enviaron correos de bienvenida duplicados.

"Antes de Step Functions", le dijo Leo a Maya, "esto habría requerido que alguien rastreara manualmente lo que se había hecho y lo que no para cada restaurante, y volviera a ejecutar manualmente los pasos faltantes."

"¿Y ahora?"

"Ahora hago clic en reintentar en la consola. El sistema sabe qué está hecho."

Maya pensó en esto.

"Eso no es solo una mejora técnica", dijo. "Esa es la diferencia entre un proceso que escala y uno que no."

En el próximo capítulo: qué hacer con los datos a los que no estás accediendo ahora mismo, pero que definitivamente quieres conservar para siempre.
