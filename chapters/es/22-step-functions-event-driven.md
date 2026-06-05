# Capítulo 22: El Diagrama de Flujo que Se Ejecuta Solo

Una confirmación de pedido en Nimbus requería que sucedieran cinco cosas en secuencia: cobrar la tarjeta, enviar el correo de confirmación, notificar al restaurante, actualizar el inventario y registrar la transacción para la contabilidad. Si el paso tres fallaba —si la notificación al restaurante agotaba el tiempo de espera—, los pasos uno y dos ya habían ocurrido. El cliente había sido cobrado. El correo había sido enviado. Pero el restaurante no sabía que el pedido existía.

Leo tenía un nombre para esta categoría de error: el éxito parcial. "Todo funcionó," dijo, "excepto la parte que importaba."

"¿Cuántas veces ha sucedido esto?" preguntó Maya.

"Once veces en las últimas dos semanas. Detectamos la mayoría por las llamadas de queja de los restaurantes. Dos las encontramos en los registros, después del hecho."

"Entonces no tenemos coordinación," dijo Priya. "Cinco pasos, ejecutándose como un script, sin garantía de que todos se completen."

"Ni de que se completen en el orden correcto."

"Ni de que sepamos cuál falló."

Leo mostró el código en el proyector. Era una función Python: cincuenta líneas, cinco llamadas secuenciales a API, un único bloque try/except alrededor de todo. "Si cualquier cosa dentro lanza una excepción, obtenemos un 500 y el cliente ve un error. Pero los cobros y los correos no se revierten."

"Necesitamos un flujo de trabajo," dijo Maya. "Algo que rastree cada paso."

**AWS Step Functions: Orquestando Flujos de Trabajo**

**AWS Step Functions** es un servicio de orquestación sin servidor que coordina los pasos de una aplicación como un flujo de trabajo visual. Cada paso es un **estado** en una **máquina de estados**.

En lugar de un script Python que se ejecuta de arriba abajo y se bloquea, defines el flujo de trabajo como una máquina de estados JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["*"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["*"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Cada estado puede:

- **Ejecutar una función Lambda** (el patrón más común)
- **Ejecutar una tarea ECS** (para trabajo de mayor duración)
- **Esperar un tiempo específico** o **evento** (pausar el flujo de trabajo hasta que ocurra algo externo)
- **Elegir un camino** basado en condiciones (lógica if/else)
- **Ejecutar ramas en paralelo** simultáneamente
- **Reintentar en caso de fallo** con retroceso configurable
- **Capturar errores** y enrutar a estados de gestión de errores

Step Functions gestiona el estado de ejecución de forma duradera. Si el paso 3 falla, la ejecución se pausa en el paso 3. Puedes inspeccionar la ejecución fallida en la consola, corregir el problema y reiniciar desde el paso 3, sin repetir los pasos 1 y 2.

**Tipos de Estado: Los Bloques de Construcción**

**Task (Tarea)**: Ejecuta una acción: llama a una función Lambda, inicia una tarea ECS, llama a una API. Aquí es donde ocurre el trabajo real.

**Choice (Elección)**: Ramifica basándose en condiciones en los datos de entrada. Como un if/else en el código.

**Parallel (Paralelo)**: Ejecuta múltiples ramas simultáneamente y espera a que todas se completen.

**Map**: Aplica un conjunto de estados a cada elemento de una lista. Procesa 50 elementos del menú de un restaurante en paralelo.

**Wait (Espera)**: Pausa durante un tiempo especificado o hasta una marca de tiempo. Útil para retrasos programados.

**Pass (Pasar)**: Pasa la entrada a la salida sin hacer trabajo. Se usa para la transformación de datos y pruebas.

**Succeed/Fail (Éxito/Fallo)**: Estados terminales que finalizan la ejecución.

Para la incorporación del restaurante, Leo diseñó un flujo de trabajo:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, con 3 reintentos)
3. Rama paralela:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, espera a que se complete el paralelo)
5. NotifySalesTeam (Task → Lambda)

Los pasos 3a y 3b se ejecutan en paralelo: no dependen el uno del otro, y ejecutarlos simultáneamente ahorra tiempo.

**Flujos de Trabajo Estándar vs Express**

Step Functions ofrece dos tipos de flujos de trabajo:

**Flujos de trabajo estándar**:

- Duración máxima: 1 año
- Las ejecuciones son duraderas: el estado se persiste, puede inspeccionarse y auditarse
- Ejecución al menos una vez (cada tarea se ejecuta al menos una vez)
- Precio por transición de estado
- Ideal para flujos de trabajo largos e importantes (procesamiento de pedidos, incorporación, flujos de pago)

**Flujos de trabajo express**:

- Duración máxima: 5 minutos
- Mayor rendimiento: hasta 100.000 por segundo
- Al menos una vez o como máximo una vez (configurable)
- Precio por duración (como Lambda)
- Ideal para flujos de trabajo de alto volumen y corta duración (procesamiento de eventos en tiempo real, ingestión de datos de IoT)

Para la incorporación de restaurantes de Nimbus: Estándar (es importante, duradero, puede llevar horas si hay pasos manuales).

Para las actualizaciones de estado de pedidos en tiempo real de Nimbus: Express (alto volumen, corta duración, menos crítico).

**Arquitectura Orientada a Eventos: El Panorama General**

Step Functions es una pieza de un patrón más amplio: la **arquitectura orientada a eventos**. En lugar de que los servicios se llamen directamente entre sí (acoplamiento estrecho), los servicios emiten eventos y otros servicios reaccionan a esos eventos.

Hemos visto esto a lo largo del libro:

- Pedidos realizados → SNS publica el evento → las colas SQS entregan a los consumidores
- Archivo de S3 cargado → Lambda activado para procesarlo
- Registro de DynamoDB cambiado → DynamoDB Streams → Lambda actualiza una caché

**Amazon EventBridge** (antes CloudWatch Events) es el bus de eventos avanzado para este patrón. Enruta eventos de los servicios de AWS y de tus propias aplicaciones a destinos (Lambda, SQS, Step Functions, etc.) basándose en reglas.

EventBridge permite el desacoplamiento flexible a nivel arquitectónico: el servicio de pedidos publica eventos `order.placed` sin saber quién escucha. El servicio de analítica, el servicio de notificaciones y el servicio de puntos de fidelidad escuchan de forma independiente. Añadir un nuevo escuchador no requiere cambiar el servicio de pedidos.

**Cuándo Step Functions Es la Herramienta Adecuada**

Step Functions destaca cuando tienes:

**Flujos de trabajo de varios pasos** que necesitan rastrear el progreso entre pasos

**Procesos con intervención humana**: Step Functions puede esperar indefinidamente un evento externo (como una aprobación humana) y luego continuar

**Gestión de errores a escala**: lógica integrada de reintento, captura y alternativa en muchos pasos

**Procesos auditables**: cada ejecución registra cada transición de estado. Puedes ver exactamente qué ocurrió y cuándo.

**Lógica paralela o secuencial compleja**: el flujo de trabajo visual facilita el razonamiento sobre el código equivalente

Step Functions es excesivo para procesos simples de dos pasos. Úsalo cuando la coordinación en sí misma es valiosa y los escenarios de fallo son importantes.

## Ventajas y Limitaciones

**Por qué Step Functions es poderoso**:

- Historial de ejecución visual: ve exactamente dónde está (o falló) un flujo de trabajo
- Reintento y gestión de errores integrados: sin código de reintento personalizado
- Estado duradero: las ejecuciones sobreviven a reinicios de servicio e interrupciones
- Integraciones directas con más de 200 servicios de AWS (no solo Lambda)
- El flujo de trabajo visual es autodocumentado

**Dónde se complica**:

- Los flujos de trabajo estándar tienen precio por transición de estado: los flujos de trabajo complejos con muchos estados pueden volverse caros a escala
- El formato JSON de ASL (Amazon States Language) tiene una curva de aprendizaje
- El tamaño máximo de la carga útil es 256 KB: los datos grandes deben pasarse a través de referencias de S3, no directamente a través del flujo de trabajo
- Los flujos de trabajo de larga duración con muchos pasos manuales requieren una configuración cuidadosa del tiempo de espera

## Resumen

- **Step Functions** orquesta flujos de trabajo de varios pasos como máquinas de estados.
- Cada **estado** puede ejecutar una función Lambda, ejecutar una tarea ECS, esperar, ramificar o ejecutar pasos en paralelo.
- **Reintento y captura** están integrados en cada estado: no se necesita código de reintento personalizado.
- **Flujos de trabajo estándar**: larga duración (hasta 1 año), duraderos, al menos una vez. Para procesos de negocio críticos.
- **Flujos de trabajo express**: corta duración (hasta 5 minutos), alto rendimiento. Para procesamiento de eventos de alto volumen.
- La **arquitectura orientada a eventos** usa servicios como SNS, SQS, Lambda y EventBridge para desacoplar los sistemas en torno a eventos en lugar de llamadas directas.
- Usa Step Functions cuando la coordinación de pasos es en sí misma compleja y cuando la auditabilidad es importante.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.1)*

- **Señales de casos de uso de Step Functions**: "orquestar múltiples funciones Lambda," "flujo de trabajo con reintentos y gestión de errores," "paso de aprobación humana en un flujo de trabajo automatizado," "registro de auditoría de cada paso del flujo de trabajo" → Step Functions.
- **Estándar vs Express**: Estándar para flujos de trabajo de larga duración, auditables y críticos para el negocio. Express para procesamiento de eventos de alto rendimiento y corta duración.
- **SQS vs Step Functions**: SQS para colas de tareas simples (productor/consumidor). Step Functions para flujos de trabajo de varios pasos con lógica compleja, reintentos y seguimiento de estado.
- **Señales de EventBridge**: "enrutar eventos de servicios AWS a destinos," "integración orientada a eventos entre servicios," "programar una función Lambda" → EventBridge (antes CloudWatch Events).
- **Patrón de callback**: Step Functions puede pausar la ejecución y esperar una callback externa (un token de tarea). El trabajador llama de vuelta cuando termina. Útil para tareas ECS de larga duración donde no quieres el límite de 15 minutos de Lambda.
- **Integraciones directas con SDK**: Step Functions puede llamar a servicios de AWS directamente (DynamoDB, S3, SQS, etc.) sin pasar por Lambda. Reduce el coste y la latencia para llamadas simples a servicios.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica por qué Step Functions es útil para flujos de trabajo de varios pasos. ¿Qué proporciona que una función Lambda simple que llama a otras funciones Lambda no tiene?

*(Pista: Piensa en qué ocurre cuando el paso 3 de 5 falla en cada enfoque. ¿Cómo sabes qué ocurrió? ¿Cómo reintentarías solo el paso 3?)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa de servicios financieros procesa solicitudes de préstamos en múltiples pasos: verificación de crédito, verificación de ingresos, validación de documentos, revisión del evaluador (manual) y notificación de decisión. Cada paso puede tardar desde segundos (verificación de crédito) hasta días (revisión del evaluador). La empresa necesita un registro de auditoría completo de cada paso para cumplimiento. Los pasos automatizados fallidos deben reintentarse automáticamente; los pasos manuales deben pausarse y esperar una decisión humana.

¿Qué servicio cumple MEJOR con estos requisitos?

A) Funciones Lambda de AWS encadenadas con colas SQS entre cada paso  
B) Flujos de trabajo estándar de AWS Step Functions con un patrón de espera de callback para el paso de revisión del evaluador  
C) Flujos de trabajo express de AWS Step Functions para los pasos automatizados y SQS FIFO para el paso manual  
D) Amazon EventBridge con reglas de eventos que enrutan entre funciones Lambda para cada paso

**Pista 1**: Duración de "hasta días": ¿qué tipo de Step Functions soporta esto?

**Pista 2**: "Esperar una decisión humana": ¿qué patrón de Step Functions está diseñado para esto?

**Pista 3**: "Registro de auditoría completo para cumplimiento": ¿qué servicio proporciona historial de estado por ejecución?

**Respuesta**: B

**Explicación**: Los flujos de trabajo estándar de Step Functions pueden ejecutarse hasta 1 año, soportando el paso de revisión del evaluador que puede durar días. El patrón de espera de callback pausa la ejecución en el paso del evaluador con un token de tarea; cuando el evaluador toma una decisión, llama de vuelta con el token para continuar el flujo de trabajo. Los flujos de trabajo estándar registran cada transición de estado: registro de auditoría completo para cumplimiento.

**¿Por qué no A?** Lambda encadenado a través de SQS no proporciona seguimiento de estado integrado ni registro de auditoría. Los pasos fallidos requieren lógica de reintento personalizada. Reiniciar desde un paso fallido específico requiere implementación personalizada.

**¿Por qué no C?** Los flujos de trabajo express tienen una duración máxima de 5 minutos, incompatible con un paso que puede tardar días.

**¿Por qué no D?** EventBridge enruta eventos entre servicios, pero no mantiene el estado del flujo de trabajo ni proporciona reintento/auditoría integrados. Construir esto solo en EventBridge requiere gestión de estado personalizada.

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está construyendo un proceso de resolución de disputas sobre calidad de la comida. Cuando un cliente reporta una mala experiencia:

1. El informe se valida automáticamente (comprueba si el pedido existe, si es lo suficientemente reciente)
2. El restaurante es notificado automáticamente
3. Un agente de soporte de Nimbus revisa la queja (paso manual: puede llevar de 1 a 3 días hábiles)
4. En función de la decisión del agente: emitir reembolso (Lambda → procesador de pagos) O enviar cupón de disculpa (Lambda → servicio de cupones) O escalar a la dirección (subflujo de trabajo de Step Functions)
5. Se notifica al cliente del resultado

Diseña esto como un flujo de trabajo de Step Functions. ¿Qué tipo de estado gestiona cada paso? ¿Cómo gestionarías la espera de 1 a 3 días? ¿Cómo modelarías la ramificación en el paso 4?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de estados de Step Functions.)*

## Escena Poscreditos

El flujo de trabajo de incorporación del restaurante estaba activo.

Durante el mes siguiente, 12 nuevos socios restauradores se incorporaron. Dos tuvieron fallos durante el paso de procesamiento de pagos (paso 3). En ambos casos, Step Functions capturó el error exacto, guardó el estado de la ejecución y envió una alerta al equipo de Nimbus.

Leo corrigió la causa raíz (una clave API mal configurada del proveedor de pagos) y reintentó ambas ejecuciones desde el paso 3. Las ejecuciones se completaron en 23 segundos cada una, retomando exactamente donde habían fallado.

Ningún restaurante necesitó ser reimportado. No se crearon roles IAM dobles. No se enviaron correos de bienvenida duplicados.

"Antes de Step Functions," le dijo Leo a Maya, "esto habría requerido que alguien rastreara manualmente qué se había hecho y qué no para cada restaurante, y que volviera a ejecutar manualmente los pasos que faltaban."

"¿Y ahora?"

"Ahora hago clic en reintentar en la consola. El sistema sabe lo que está hecho."

Maya pensó en esto.

"Eso no es solo una mejora técnica," dijo. "Es la diferencia entre un proceso que escala y uno que no."

En el siguiente capítulo: qué hacer con los datos a los que no accedes ahora mismo, pero que definitivamente quieres conservar para siempre.
