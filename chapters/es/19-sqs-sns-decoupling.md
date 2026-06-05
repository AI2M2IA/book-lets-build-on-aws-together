# Capítulo 19: La Máquina de Números

La máquina de números fue una revolución silenciosa. Tomas un número, esperas a que te llamen. La cola se convierte en una fila. La gente puede sentarse. La ventanilla de servicio trabaja a su propio ritmo. Nadie bloquea a nadie.

Nimbus tenía un problema que no parecía un problema hasta que los pedidos se volvieron populares.

Cada vez que se realizaba un pedido, el servidor de la API tenía que:

1. Guardar el pedido en la base de datos
2. Enviar una notificación a la tableta del restaurante
3. Enviar un correo electrónico de confirmación al cliente
4. Actualizar el panel de análisis del restaurante
5. Registrar el evento para la facturación

Todo esto tenía que ocurrir de forma sincrónica antes de que la API pudiera responder al cliente. Si el servicio de correo electrónico era lento (a veces lo era), el cliente esperaba. Si el panel de análisis estaba caído (a veces lo estaba), el pedido fallaba.

"Estamos fuertemente acoplados", dijo Priya. "Si falla algún paso descendente, falla todo el pedido."

"¿Qué pasa si podemos guardar el pedido e inmediatamente confirmar al cliente", dijo Leo, "y luego procesar el resto en segundo plano?"

"Eso es una cola", dijo Priya.

**El Modelo del Mostrador de Charcutería**

En un mostrador de charcutería concurrido, la persona en la caja registradora no espera a que el cortador termine de filetear antes de pasar al siguiente cliente. Toman el pedido, se lo pasan a la cocina y empiezan a atender a la siguiente persona. La cocina trabaja los pedidos a su propio ritmo.

El cliente recibe un servicio más rápido. La cocina no se ve abrumada por ráfagas repentinas. Si la cocina tiene un momento lento, los pedidos se acumulan en la cola en lugar de provocar errores en la caja registradora.

Esto es el **desacoplamiento**: separar el componente que acepta trabajo de los componentes que lo procesan.

En los sistemas de software, la cola suele ser un intermediario de mensajes: un servicio que acepta mensajes de los productores y los entrega a los consumidores.

**Amazon SQS: La Cola**

**Amazon SQS (Simple Queue Service)** es el servicio de cola de mensajes gestionado de AWS. Almacena mensajes de forma durable hasta que son procesados por un consumidor.

El flujo básico:

1. El **productor** (el servidor de la API) coloca un mensaje en la cola: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. La API responde inmediatamente al cliente: "¡Pedido confirmado!"
3. Los **consumidores** (servicios trabajadores separados) leen los mensajes de la cola y los procesan: envían la notificación al restaurante, envían el correo electrónico de confirmación, actualizan los análisis

La experiencia del cliente: confirmación instantánea. El procesamiento descendente: ocurre de forma asincrónica, al ritmo de los trabajadores.

**Conceptos Clave de SQS**

**Tiempo de espera de visibilidad del mensaje**: Cuando un consumidor lee un mensaje de SQS, el mensaje se vuelve *invisible* para otros consumidores durante un período (predeterminado: 30 segundos). Esto le da tiempo al consumidor para procesarlo. Si el consumidor termina con éxito, elimina el mensaje. Si el consumidor falla, el tiempo de espera de visibilidad expira y el mensaje se vuelve visible de nuevo para que otro consumidor lo reintente.

Esto garantiza la entrega al menos una vez: cada mensaje será procesado al menos una vez, aunque un consumidor falle a mitad del procesamiento.

**Colas de mensajes fallidos (DLQ)**: Si un mensaje falla el procesamiento demasiadas veces (configurable, por ejemplo, 5 reintentos), SQS lo mueve a una cola de mensajes fallidos. Inspeccionas la DLQ para entender por qué están fallando los mensajes sin perderlos.

**Tipos de cola**:

**Colas estándar**: Máximo rendimiento (mensajes ilimitados por segundo). El orden de entrega es de mejor esfuerzo (no garantizado). Entrega al menos una vez (muy raramente, un mensaje puede entregarse dos veces).

**Colas FIFO**: Orden estricto primero en entrar, primero en salir. Entrega exactamente una vez. Limitado a 3.000 mensajes por segundo con procesamiento por lotes, 300 sin él. Úsalas cuando el orden importa (transacciones financieras, cambios de estado secuenciales).

Para Nimbus, la mayoría de las colas usaban colas estándar. La cola de facturación usaba FIFO para garantizar que los cargos se procesaran en orden.

**Amazon SNS: El Difusor**

**Amazon SNS (Simple Notification Service)** es un servicio de mensajes de publicación/suscripción (pub/sub). En lugar de un productor, un consumidor (cola), SNS admite que un mensaje sea entregado a *muchos* suscriptores simultáneamente.

El modelo:

1. Un **publicador** envía un mensaje a un **tema** de SNS
2. Todos los **suscriptores** de ese tema reciben el mensaje simultáneamente (distribución en abanico)

Los suscriptores pueden ser:

- Colas de SQS (envía el mensaje a una cola para procesamiento asincrónico)
- Funciones de Lambda (activa la función directamente)
- Endpoints HTTP/HTTPS (entrega de webhook)
- Direcciones de correo electrónico
- SMS (números de teléfono)

Para Nimbus, el evento de pedido realizado se publica en un tema de SNS llamado `order-events`:

- El servicio de notificaciones a restaurantes se suscribe (recibe en su cola de SQS)
- El servicio de correo electrónico se suscribe (recibe en su cola de SQS)
- El servicio de análisis se suscribe (recibe en su cola de SQS)
- El servicio de facturación se suscribe (recibe en su cola FIFO de SQS)

Un evento de pedido. Cuatro suscriptores. Todos notificados simultáneamente. Cada uno procesa a su propio ritmo.

"Entonces SNS es el anuncio", dijo Maya, "y SQS es la bandeja de entrada donde cada equipo procesa el anuncio a su propia velocidad."

"Exactamente", dijo Leo. "La distribución en abanico de SNS/SQS es el patrón estándar."

**El Patrón de Distribución en Abanico SNS/SQS**

Esta combinación, un tema de SNS que alimenta múltiples colas de SQS, es uno de los patrones arquitectónicos más importantes en AWS:

```
Servidor de API
    |
    | publica en
    ↓
Tema SNS: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
Cola SQS          Cola SQS          Cola SQS
(notificaciones) (servicio email)  (análisis)
    |                 |                 |
    ↓                 ↓                 ↓
Trabajador        Trabajador        Trabajador
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

Cada cola es independiente. El servicio de análisis puede ser lento: su cola se llena, pero los servicios de notificaciones y correo electrónico continúan sin verse afectados. Si el servicio de análisis cae, sus mensajes esperan en la cola hasta que vuelva a estar activo. No se pierde nada.

Esta es la propiedad clave: el **fallo independiente**. Los problemas en un consumidor no se propagan a los demás.

**Filtrado de Mensajes: No Todo Mensaje para Todo Suscriptor**

A medida que los sistemas crecen, no quieres que cada suscriptor procese cada mensaje. Un servicio de análisis no debería recibir mensajes sobre el procesamiento de pagos fallidos si solo le importan los pedidos completados.

El **filtrado de mensajes de SNS** permite a los suscriptores especificar políticas de filtro: solo entrega mensajes que coincidan con ciertos atributos.

El servicio de notificaciones a restaurantes se suscribe con un filtro: solo mensajes donde `status = "confirmed"`.

El servicio de alertas de errores se suscribe con un filtro: solo mensajes donde `status = "failed"`.

Cada suscriptor recibe solo lo que necesita.

**Cuándo Usar SQS vs SNS**

**SQS solo**: Un productor, un consumidor (o múltiples consumidores en competencia en la misma cola). Los mensajes deben procesarse una vez, en orden (FIFO) o no (estándar). Patrón de cola de trabajadores: una cola, múltiples trabajadores consumiendo de ella.

**SNS solo**: Notificaciones de disparar y olvidar. Envío a correo electrónico, SMS o endpoints HTTP. Sin necesidad de encolar el mensaje: solo notifica y sigue adelante.

**SNS + SQS (distribución en abanico)**: Un evento, múltiples consumidores independientes. Cada consumidor tiene su propia cola, procesa de forma independiente y puede fallar de forma independiente.

## Fortalezas y Limitaciones

**Por qué SQS y SNS son poderosos**:

- SQS proporciona entrega de mensajes durable y fiable: los mensajes se almacenan en múltiples AZs
- El desacoplamiento permite el escalado y el despliegue independientes de los servicios productor y consumidor
- Las colas de mensajes fallidos garantizan que ningún mensaje se pierda silenciosamente ante un fallo
- El patrón de distribución en abanico de SNS permite agregar nuevos consumidores sin cambiar el productor

**Donde se complica**:

- La entrega al menos una vez significa que los consumidores deben ser *idempotentes*: procesar el mismo mensaje dos veces no debe causar problemas (pedidos duplicados, cargos duplicados)
- Las colas FIFO son más costosas y tienen límites de rendimiento
- Depurar mensajes fallidos en múltiples colas y servicios requiere un buen registro y observabilidad
- Las garantías de orden de mensajes son limitadas: si el orden estricto importa en múltiples servicios, el diseño se complica

## Resumen

- El **desacoplamiento** separa los componentes que producen trabajo de los que lo procesan.
- **SQS** es una cola gestionada. Los productores envían mensajes; los consumidores los leen y procesan de forma asincrónica.
- **SQS Estándar**: alto rendimiento, orden de mejor esfuerzo, entrega al menos una vez.
- **SQS FIFO**: orden estricto, entrega exactamente una vez, menor rendimiento.
- **SNS** es un servicio pub/sub. Un mensaje, muchos suscriptores simultáneamente.
- **Distribución en abanico SNS + SQS**: el patrón estándar para que un evento active múltiples pipelines de procesamiento independientes.
- **Colas de mensajes fallidos**: capturan mensajes que fallan el procesamiento después de demasiados reintentos.
- **Idempotencia**: diseña consumidores para procesar de forma segura mensajes duplicados.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.1)*

- **SQS Estándar vs FIFO**: El examen distingue por las garantías de orden y entrega. "Debe procesarse en orden" → FIFO. "Máximo rendimiento" → Estándar.
- **Tiempo de espera de visibilidad**: Concepto clave para la entrega al menos una vez. Si un consumidor falla, el mensaje se vuelve visible de nuevo después del tiempo de espera. Escenario del examen: "los mensajes se están procesando dos veces" → el tiempo de espera de visibilidad es demasiado corto (el consumidor tarda más que el tiempo de espera en procesar).
- **Cola de mensajes fallidos**: Los mensajes que fallan después de N reintentos se mueven aquí. Escenario del examen: "asegurarse de que ningún mensaje se pierda, aunque el procesamiento falle repetidamente" → DLQ.
- **Distribución en abanico de SNS**: Patrón clásico del examen para que un evento active múltiples consumidores. "La notificación de pedido realizado debe activar email, SMS y actualización de inventario simultáneamente" → tema de SNS con suscripciones de SQS.
- **SQS + Lambda**: Lambda puede configurarse para sondear una cola de SQS y activarse en cada lote de mensajes. El examen usa esto para el procesamiento basado en eventos a escala.
- **Sondeo largo de SQS**: En lugar de que los consumidores sondeen cada pocos segundos (sondeo corto, desperdicia llamadas a la API), el sondeo largo espera hasta 20 segundos por un mensaje. Reduce costos y respuestas vacías falsas.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica el patrón de distribución en abanico SNS/SQS. ¿Por qué el patrón usa colas de SQS en lugar de hacer que los servicios se suscriban directamente al tema de SNS con endpoints HTTP?

*(Pista: Piensa en qué ocurre si uno de los endpoints HTTP está caído cuando SNS publica un mensaje.)*

**Ejercicio 2 — Práctica para el Examen**

*Escenario*: Una plataforma de comercio electrónico procesa 10.000 pedidos por hora. Cuando se realiza un pedido, el sistema debe: (1) almacenar el pedido en la base de datos, (2) descontar el inventario, (3) enviar un correo electrónico de confirmación y (4) actualizar el panel de análisis. Actualmente, los cuatro pasos ocurren de forma sincrónica: si el servicio de análisis es lento, los clientes esperan. El equipo quiere mejorar el tiempo de respuesta al cliente sin perder ningún pedido.

¿Qué arquitectura aborda MEJOR este requisito?

A) Usar colas FIFO de SQS para procesar los cuatro pasos en secuencia  
B) Hacer que la API guarde el pedido e inmediatamente confirme al cliente; publicar un evento en un tema de SNS; hacer que los servicios de inventario, correo electrónico y análisis se suscriban a través de colas de SQS  
C) Usar instancias de EC2 paralelas para procesar cada paso simultáneamente, de forma sincrónica  
D) Usar un API Gateway con validación de solicitudes para acelerar el procesamiento de pedidos

**Pista 1**: La confirmación al cliente debe ser inmediata. ¿Qué pasos deben ocurrir antes de la respuesta y cuáles pueden ocurrir después?

**Pista 2**: La lentitud del servicio de análisis no debe afectar a los servicios de correo electrónico o inventario.

**Pista 3**: La distribución en abanico de SNS permite que los tres servicios descendentes reciban el evento simultáneamente.

**Respuesta**: B

**Explicación**: La API guarda el pedido en la base de datos (sincrónico: debe hacerse antes de confirmar) y devuelve inmediatamente una confirmación. Luego publica un evento `order-placed` en un tema de SNS. Los servicios de inventario, correo electrónico y análisis se suscriben a través de colas de SQS independientes. Procesan a su propio ritmo: si el análisis es lento, su cola crece pero los demás servicios no se ven afectados. Si algún servicio falla, sus mensajes permanecen en la cola de SQS y se reintentan; después del número de reintentos fallidos configurado se mueven a la DLQ.

**¿Por qué no A?** Las colas FIFO procesan los mensajes en secuencia: esto no ayuda con la lentitud sincrónica. Además, el procesamiento secuencial significa que la lentitud del análisis sigue bloqueando el correo electrónico.

**¿Por qué no C?** "Instancias de EC2 paralelas procesando de forma sincrónica" todavía requiere que todos los pasos se completen antes de responder al cliente. Agregar instancias no resuelve el acoplamiento sincrónico.

**¿Por qué no D?** API Gateway acelera el enrutamiento y la validación de API, pero no desacopla los pasos de procesamiento descendente.

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está construyendo un sistema de notificaciones para los socios restaurantes. Cuando un cliente realiza un pedido, el restaurante necesita ser notificado a través de:

- Su aplicación de tableta (notificación push)
- Un sistema de visualización de cocina (webhook HTTP a su hardware local)
- Un SMS de respaldo (si falla la notificación de la tableta)

El servicio de notificaciones de la tableta es fiable. El webhook de cocina a veces está caído (los restaurantes apagan su hardware al cierre). El SMS solo debe enviarse si falla la notificación de la tableta.

Diseña la arquitectura usando SNS y SQS. ¿Cómo manejarías el requisito de "SMS solo si falla la tableta"? ¿Cómo garantizarías que el webhook de cocina no bloquee la notificación de la tableta cuando está desconectado?

*(No existe una única respuesta correcta. El objetivo es practicar el diseño de distribución en abanico con enrutamiento condicional.)*

## Escena Post-Créditos

El nuevo flujo de pedidos estaba en producción.

Los clientes realizaban pedidos. La API respondía en 95 milisegundos. La confirmación aparecía en sus teléfonos al instante.

Detrás de escena: cuatro servicios procesando de forma asincrónica. El servicio de análisis tenía un bug que hacía que fallara con pedidos que contenían ciertos caracteres especiales en el nombre del artículo. Su cola se acumuló a 3.200 mensajes en dos horas.

Los clientes nunca lo notaron.

Cuando Leo corrigió el bug y el servicio de análisis se reinició, procesó el retraso en 18 minutos. No se perdió ningún dato. La DLQ estaba vacía.

"Esto es lo que significa el desacoplamiento", dijo Priya.

Tom estaba leyendo la página de precios de SQS. "Por millón de solicitudes, 0,40 dólares."

"¿Eso es malo?"

"Con nuestro volumen actual, unos doce dólares al mes." Miró la pantalla. "Esperaba más."

Tenía el aspecto de alguien que descubría que algo inesperadamente barato también era inesperadamente bueno.

En el próximo capítulo: la función que solo se ejecuta cuando alguien llama, y que no cuesta nada cuando no lo hacen.
