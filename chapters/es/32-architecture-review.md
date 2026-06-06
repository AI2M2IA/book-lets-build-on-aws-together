# Capítulo 32: Defendiendo el Plan

Carlos había vuelto, unas semanas después de la sesión Well-Architected. Esta vez el portátil se quedó en su bolsa; en su lugar tomó un rotulador para la pizarra, saludó a cada persona de la sala, encontró un sitio cerca de la pizarra y destapó el rotulador.

"Cuéntenme sobre Nimbus", dijo. Como si nunca hubiera oído hablar de ello.

**Recapitulación: De la Revisión al Ajuste de Cuentas**

La Well-Architected Review del capítulo 31 había sacado a la luz tres hallazgos de alto riesgo y la creciente conciencia de Maya de que había una brecha entre las decisiones que el equipo había tomado y las decisiones que habían *meditado*. El marco les había dado un vocabulario para la brecha. Lo que no podía darles era la práctica de cerrarla en tiempo real, antes de que se lanzara una funcionalidad, no después. Para eso estaba Carlos. Maya lo había invitado específicamente porque Nimbus estaba a punto de construir algo significativo, y quería un cuestionamiento estructurado antes de que se escribiera la primera línea de código de producción.

Una buena revisión de arquitectura es como una lista de verificación previa al vuelo para un piloto. El avión puede parecer perfectamente listo para volar: motores en marcha, combustible lleno, pasajeros a bordo. Pero la lista de verificación existe porque los pilotos experimentados saben que las cosas más propensas a causar problemas son precisamente las que parecen estar bien hasta que no lo están. La lista de verificación no significa que el piloto no sepa lo que está haciendo. Significa que ha interiorizado que incluso los expertos pasan cosas por alto cuando omiten el proceso estructurado.

**El Primer Movimiento del Arquitecto**

Lo que ocurrió después sorprendió al equipo.

Maya empezó a describir el sistema: instancias de EC2, Aurora, CloudFront, ElastiCache, DynamoDB para el menú, VPC con subredes privadas...

Carlos la detuvo suavemente.

"Empieza por el negocio", dijo. "No por la tecnología."

Ella hizo una pausa. Luego: "Nimbus es una plataforma de pedidos de restaurantes. Tenemos 287 socios restaurantes. Procesamos unos 4.200 pedidos al día. El valor promedio de un pedido es de $34. Estamos creciendo un 18% trimestre a trimestre."

"Bien. ¿Cuál es la cosa más importante que Nimbus debe hacer?"

"Procesar pedidos", dijo Leo.

"Concretamente", presionó Carlos.

"Un pedido debe llegar al restaurante en los cinco segundos posteriores a su realización", dijo Priya, "o la cocina pierde la ventana de tiempo."

"¿Qué ocurre si no lo hace?"

"El restaurante comete un error. El cliente recibe la comida equivocada o espera demasiado. Se quejan. Perdemos un socio restaurante."

"Entonces el SLA de cinco segundos", dijo Carlos, "no es un objetivo técnico. Es un requisito de supervivencia empresarial."

Silencio.

"Eso", dijo, "es por qué las conversaciones de arquitectura deben comenzar con los requisitos empresariales. La tecnología está corriente abajo de la restricción."

**La Estructura de la Revisión de Arquitectura**

Una revisión de arquitectura real, del tipo que ocurre antes de construir algo importante, o cuando se evalúa si se debe escalar, tiene una estructura.

Carlos la escribió en la pizarra:

**1. Entender las restricciones**

¿Qué debe ser verdad? ¿Qué no puede ocurrir? (No "qué queremos." Cuáles son los elementos no negociables.)

**2. Entender las incógnitas**

¿Qué no sabemos? ¿Dónde estamos haciendo suposiciones? ¿Qué ocurre si esas suposiciones son incorrectas?

**3. Evaluar las opciones**

¿Cuáles son las alternativas realistas? ¿Cuáles son las compensaciones de cada una?

**4. Identificar los modos de fallo**

¿Cómo se rompe esto? ¿Cuál es la secuencia de eventos cuando se activa cada modo de fallo?

**5. Validar el monitoreo**

¿Cómo sabrás cuando algo va mal? ¿Antes de que te lo digan los usuarios?

**6. Definir el runbook**

¿Qué hace alguien a las 3 AM cuando esto se rompe?

Esto no es una lista de verificación que seguir mecánicamente. Es un marco de pensamiento. El objetivo es garantizar que las preguntas importantes se hagan *antes* de estar en producción.

**Ejecutando la Revisión: La Nueva Funcionalidad de Nimbus**

Carlos había sido invitado específicamente porque Nimbus estaba a punto de construir algo nuevo.

**La funcionalidad**: "Nimbus Instant", una garantía de entrega en 15 minutos. Si un restaurante socio no cumple la ventana de 15 minutos más de una vez por semana, Nimbus reembolsaría automáticamente al cliente.

"Guíenme por los requisitos técnicos", dijo Carlos.

Priya empezó. "Necesitamos seguimiento en tiempo real desde la realización del pedido hasta la entrega. Necesitamos comparar el tiempo real de entrega con el SLA de 15 minutos. Necesitamos activar los reembolsos automáticamente."

"¿Cuál es el requisito de latencia para los datos de seguimiento?"

"Casi en tiempo real. Los clientes ven actualizaciones de estado en sus teléfonos."

"¿En cuánto tiempo?"

"Cinco segundos probablemente."

"¿Probablemente?"

"En cinco segundos. Ese es el requisito del producto."

"Bien. Kinesis para el flujo de eventos entonces. ¿Cuál es el modo de fallo si Kinesis tiene retraso?"

"Las actualizaciones de estado llegan tarde al cliente."

"¿Es eso aceptable?"

"¿Por 10 segundos? Probablemente. ¿Por 60 segundos? No."

"¿Entonces cuál es el SLA para el sistema de seguimiento?"

Priya miró a Leo. "Todavía no tenemos uno."

Carlos escribió en la pizarra: *Incógnita: SLA del sistema de seguimiento.*

"Esto importa", dijo. "Porque el SLA determina el diseño de infraestructura. Si tu SLA es de 5 segundos, necesitas una solución diferente a la que necesitarías si fuera de 60 segundos."

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya. "¿Por qué no usar simplemente un mecanismo de sondeo que la app comprueba cada pocos segundos en lugar de un push en tiempo real?"

"Latencia y coste", dijo Carlos. "Un enfoque de sondeo a escala —digamos, 10.000 pedidos activos, cada app sondeando cada 5 segundos— son 2.000 solicitudes por segundo, o 120.000 solicitudes por minuto. Un modelo push a través de Kinesis entrega actualizaciones solo cuando el estado cambia. Menos solicitudes, menor latencia, y el compromiso del SLA es más fácil de auditar desde un log de eventos. El sondeo funciona a pequeña escala. A la escala hacia la que Nimbus se dirige, el push es la base correcta."

Leo había estado callado durante la explicación de Carlos. Luego: "Iba a construir esto con WebSockets."

Carlos lo miró. "Explícamelo."

"Cada pedido recibe una conexión WebSocket. El cliente se conecta cuando se realiza el pedido. El servidor empuja los cambios de estado —confirmado, en preparación, en camino, entregado— a medida que ocurren. Sin sondeo, baja latencia, modelo simple."

"¿Qué mantiene la conexión WebSocket?"

"Un endpoint WebSocket de API Gateway. Funciones Lambda gestionan los eventos de conexión y de mensaje. DynamoDB almacena los IDs de conexión."

Carlos lo escribió en la pizarra. "¿Y el modo de fallo cuando la red del cliente se cae durante 15 segundos?"

"La conexión se termina. El cliente se reconecta y pide el estado actual."

"¿Desde dónde?"

"Desde... el manejador de Lambda, que lee de DynamoDB."

"Así que tienes tanto una ruta push como una ruta pull", dijo Carlos. "El push de WebSocket es el camino feliz. La lectura de DynamoDB es el camino de recuperación. ¿Cómo aseguras que la conexión se restablezca antes de que el cliente note que el estado está obsoleto?"

Leo pensó. "El cliente detecta la desconexión y se reconecta en pocos segundos. La lógica de reconexión es sencilla."

"A 10.000 pedidos activos simultáneamente —que es hacia donde se dirige Nimbus—, ¿cuántas conexiones WebSocket concurrentes son?"

"10.000."

"WebSocket de API Gateway tiene una cuota predeterminada de 500 **nuevas conexiones por segundo** por cuenta", dijo Carlos. "No conexiones concurrentes, sino *tasa* de conexión. 10.000 conexiones estables está bien. El problema es la tormenta de reconexiones: cuando un parpadeo de red deja caer unos pocos miles de clientes a la vez y todos se reconectan en los mismos dos segundos, alcanzas la cuota de tasa y las reconexiones empiezan a fallar exactamente cuando los usuarios prestan más atención. Puedes solicitar un aumento, pero es una cuota que estarías revisando a medida que creces. Además: WebSocket de API Gateway cobra 0,25 USD por millón de minutos de conexión, más 1,00 USD por millón de mensajes. A 10.000 pedidos al día con una ventana de seguimiento promedio de 40 minutos, eso son solo unos 400.000 minutos de conexión al día: centavos. A 10.000 pedidos activos simultáneamente, es una escala diferente."

"Eso no es mucho", dijo Leo.

"No a 10.000 pedidos activos", dijo Carlos. "A esa escala, digamos aproximadamente 150 USD al mes con los cargos de minutos de conexión y mensajes. El coste no es el argumento contra los WebSockets aquí. La cuota de tasa de conexión bajo tormentas de reconexión, y la gestión del estado de conexión, sí lo son."

"Así que los WebSockets se complican a escala", dijo Maya.

"Se vuelven manejables a escala si diseñas para ello", dijo Carlos. "No están mal, es un conjunto diferente de compensaciones. Ahora déjenme mostrarles la alternativa del sondeo."

Dibujó la segunda opción.

"Sondeo: el cliente envía una solicitud GET a `/orders/{order_id}/status` cada 5 segundos. El backend lee de DynamoDB. Devuelve el estado actual."

"Eso son muchas solicitudes", dijo Priya.

"10.000 pedidos activos × 1 sondeo cada 5 segundos = 2.000 solicitudes por segundo. Tu API necesita gestionar 2.000 RPS. DynamoDB autoescala. API Gateway gestiona la carga. El coste: 2.000 RPS × 3.600 segundos × 24 horas × 30 días = 5.180 millones de solicitudes al mes. Precio de la REST API de API Gateway: 3,50 USD por millón de solicitudes = 18.130 USD/mes."

La sala se quedó en silencio.

"Esa no es una opción viable a escala", dijo Tom.

"Correcto", dijo Carlos. "El sondeo en intervalos de 5 segundos es la implementación más simple y la más cara a escala. También genera carga proporcional a las conexiones activas, no proporcional a los cambios de estado. Si un pedido se queda en 'en preparación' durante 20 minutos, el sondeo genera 240 solicitudes que todas devuelven el mismo estado. Eso es desperdicio."

"¿Y Kinesis?" preguntó Maya.

"Kinesis genera un evento por cambio de estado. Una confirmación de pedido: un evento. Aceptación de la cocina: un evento. Recogida del repartidor: un evento. Entrega: un evento. Cuatro eventos por pedido, independientemente de cuánto tarde cada estado. El consumidor —tu backend— lee del flujo de Kinesis y empuja la actualización al cliente a través de cualquier mecanismo de entrega que elijas."

"Pero el cliente todavía necesita una forma de recibir el push", dijo Leo.

"Sí. Puedes usar Server-Sent Events, un endpoint de long-poll o WebSockets para la entrega de última milla. Kinesis gestiona el flujo de eventos fiable, ordenado y reproducible para tu backend. El mecanismo de entrega al cliente es una decisión separada. La ventaja clave: Kinesis desacopla el origen del evento del consumidor. El sistema de seguimiento de entregas, el sistema de reembolsos, el sistema de notificación a restaurantes y la pantalla de estado del cliente consumen todos del mismo flujo de Kinesis de forma independiente."

"Así que no es Kinesis en lugar de WebSockets", dijo Maya. "Es Kinesis más un mecanismo de entrega al cliente más ligero."

"Exacto. El análisis de compensaciones:"

Lo escribió:

| Opción | Latencia | Coste (500 / 10K pedidos activos) | Complejidad |
|---|---|---|---|
| Solo WebSockets | ~50ms | 8 USD / 150 USD al mes | Media |
| Sondeo (5s) | 0–5s | 906 USD / 18.130 USD al mes | Baja |
| Kinesis + SSE | ~200ms | 8 USD / 75 USD al mes | Media-alta |

"La opción de sondeo queda eliminada por el coste", dijo Carlos. "Los WebSockets son viables pero requieren gestión de conexiones a escala. Kinesis más Server-Sent Events tiene una latencia ligeramente mayor y un coste comparable: lo que te compra es el log de eventos duradero y reproducible que necesitas para el sistema de reembolsos, y consumidores desacoplados."

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya. "Si los WebSockets tienen menor latencia, ¿por qué aceptar mayor latencia de Kinesis más SSE?"

"¿Son 200ms frente a 50ms perceptibles para un cliente que mira una actualización de estado de entrega?" preguntó Carlos.

"No", dijo ella.

"Entonces la diferencia de latencia está por debajo del umbral de percepción. La diferencia de coste a diez mil pedidos activos es modesta: 75 USD frente a 150 USD al mes. La diferencia arquitectónica es el verdadero argumento: Kinesis te da un log de eventos duradero y reproducible —que necesitarás para el rastro de auditoría de reembolsos— y desacopla tus consumidores de seguimiento. Los WebSockets te obligarían a reconstruir el desacoplamiento más tarde."

Leo miró la tabla. "Casi lanzamos la versión de WebSocket."

"Habría funcionado", dijo Carlos. "Eso es lo importante de entender. Los WebSockets habrían funcionado. La pregunta en arquitectura rara vez es '¿funciona esto?' La pregunta es '¿qué cuesta esto a medida que crece, y qué tenemos que reconstruir más tarde?'"


**Las Preguntas que Hacen los Arquitectos**

Durante las siguientes dos horas, Carlos guió al equipo a través de la revisión. Una selección de sus preguntas:

**Sobre el almacenamiento de datos**:

"¿Dónde se almacena el estado del pedido durante el cumplimiento? Si la aplicación se cae a mitad de una entrega, ¿cuál es el proceso de recuperación? ¿Se puede reconstruir el estado solo a partir de los eventos?"

**Sobre el mecanismo de reembolso**:

"El reembolso se activa automáticamente. ¿Qué impide que se emita un reembolso dos veces? ¿Qué pasa si el procesador de pagos agota el tiempo de espera y no estás seguro de si el reembolso fue aceptado?"

**Sobre el seguimiento de la entrega**:

"Dependes de los datos GPS del mensajero. ¿Qué ocurre si la señal GPS se pierde durante 90 segundos? ¿Cómo distingues entre 'GPS perdido', 'entrega en progreso' y 'problema de entrega'?"

**Sobre el manejo de fallos**:

"Si el servicio de reembolsos está caído, ¿el pedido sigue adelante? ¿El cliente sigue recibiendo su comida? ¿Cuál es la experiencia del usuario durante un fallo parcial del sistema?"

**Sobre la observabilidad**:

"¿Cómo sabes ahora mismo cuántos pedidos están actualmente a 5 minutos del SLA de 15 minutos? Si ese número se dispara, ¿quién es notificado?"

Cada pregunta reveló una suposición que el equipo había estado haciendo sin darse cuenta.

"Ya lo había desplegado... ah", dijo Leo. "El endpoint de reembolso. Simplemente iba a llamar a la API de pago directamente. No habíamos pensado en llamarla dos veces." Hizo una pausa. "Así que si la primera llamada tiene éxito pero nuestra confirmación se pierde en tránsito, llamamos de nuevo y el cliente recibe dos reembolsos."

"¿Hemos pensado en qué pasa si la API de pago acepta la primera llamada pero nuestra confirmación se pierde en tránsito?" preguntó Priya.

"Eso es idempotencia", dijo Carlos.

"Una clave de idempotencia: un ID único por intento de reembolso, almacenado en una base de datos antes de llamar a la API de pago", dijo Priya. "Si llamamos dos veces con la misma clave, la API de pago ignora la segunda llamada."

"Lo que significa", añadió Carlos, "que necesitas un almacén de estado persistente para las operaciones de reembolso, no solo un evento en una cola."


"El monitoreo que hemos discutido", dijo Carlos, "es todo monitoreo de infraestructura. CPU. Número de conexiones. Retraso de Kinesis. Estos son importantes, pero no son el monitoreo que te dice si Nimbus Instant está funcionando."

"¿Cuál es el monitoreo que nos dice que está funcionando?" preguntó Maya.

"Tiempo de confirmación en p95 por restaurante. ¿Cuánto tarda, en el percentil 95, desde la realización del pedido hasta la confirmación del restaurante, medido por separado para cada socio restaurante?"

"No tenemos esa métrica", dijo Priya.

"Esa es la brecha", dijo Carlos. "Puedes tener una infraestructura perfecta —CloudWatch en verde en cada alarma— y aun así tener un socio restaurante cuya latencia de confirmación lleva tres semanas degradándose porque el software de su tablet tiene un error. La infraestructura está bien. El SLA del negocio está siendo violado. Y no lo sabrás hasta que el restaurante llame a quejarse."

"¿Cómo capturamos eso?" preguntó Leo.

"Emite una métrica personalizada de CloudWatch o empuja a tu pipeline de analítica cada vez que se recibe una confirmación de pedido. Marca el tiempo de la realización del pedido. Marca el tiempo de la confirmación. Calcula la diferencia. Emítela etiquetada con `restaurant_id`. Construye un panel de CloudWatch que muestre el tiempo de confirmación en p95 por restaurante en los últimos 7 días."

"¿Y alarma cuando se degrada?" preguntó Tom.

"Alarma cuando el p95 de un restaurante específico supere los 90 segundos durante más de 5 minutos consecutivos", dijo Carlos. "Esa es una anomalía que justifica un contacto proactivo, no una respuesta de esperar-a-la-queja."

"Esta es la diferencia entre monitorear la infraestructura y monitorear el producto", dijo Priya.

"Exacto", dijo Carlos. "El monitoreo de infraestructura te dice si tus sistemas están sanos. El monitoreo a nivel de negocio te dice si tus clientes están experimentando lo que les prometiste. Necesitas ambos. La mayoría de los equipos solo tienen el primero."

Maya lo añadió al apéndice del ADR: rastrear el tiempo de confirmación en p95 por restaurante además de las métricas de salud de la infraestructura. Los umbrales de alarma serán definidos por el equipo de producto en consulta con el equipo de éxito de restaurantes.

"Aquí es también donde se cruzan el monitoreo de costes y el monitoreo de negocio", dijo Tom. "Si nuestra latencia de confirmación se dispara para un subconjunto de restaurantes los viernes por la noche, la causa raíz podría ser un arranque en frío de Lambda golpeando los shards de esos restaurantes en Kinesis. La métrica de negocio revela el síntoma. Las métricas de infraestructura revelan la causa."

"Y la solución podría no ser más infraestructura", dijo Carlos. "Podría ser concurrencia aprovisionada en la función Lambda específica. O podría ser un rebalanceo de shards. O podría ser un error en el endpoint de confirmación del restaurante. No puedes saber cuál hasta que tengas ambas capas de observabilidad."

"¿Hemos pensado en qué pasa si arreglamos la infraestructura y la métrica de negocio sigue sin mejorar?" preguntó Priya.

"Entonces la causa raíz no está en la infraestructura", dijo Carlos. "Lo cual es información valiosa. Sin la métrica de negocio, estarías persiguiendo mejoras de infraestructura para un problema que vive en otro lugar."


"¿Cuánto cuesta eso por mes cuando tenemos 500 entregas concurrentes siendo rastreadas?" preguntó Tom. "¿El almacén de estado, el flujo de Kinesis, las funciones Lambda procesando los eventos?"

Carlos asintió. "Esa es la pregunta correcta que hacer ahora, mientras diseñas, no después de haberlo construido."

Este es el tipo de detalle arquitectónico que emerge en una revisión estructurada y que a menudo no emerge cuando simplemente estás construyendo.

**El Registro de Decisiones de Arquitectura**

Después de la revisión, Carlos recomendó al equipo que documentara sus decisiones en **Registros de Decisiones de Arquitectura (ADRs)**: documentos cortos que capturan:

- **Qué decisión se tomó**
- **Qué alternativas se consideraron**
- **Por qué se tomó esta decisión (el contexto y las restricciones en ese momento)**
- **Cuáles son las compensaciones**
- **Qué nos haría reconsiderar esta decisión**

Quizás te preguntes: ¿los ADRs tienen que ser documentos formales? No. Un ADR puede ser un párrafo en un hilo de Slack si ahí es donde trabaja tu equipo. El formato es irrelevante. El acto de escribir qué decidiste y por qué —antes de seguir adelante— es lo que crea la memoria institucional.

"Los ADRs son para tu yo futuro", dijo Carlos. "En 18 meses, mirarás una pieza de arquitectura y te preguntarás por qué se hizo de esa manera. Si tienes un ADR, entenderás el contexto. Si no, o lo dejarás así (porque tienes miedo de tocarlo) o lo cambiarás (porque no entendiste por qué se hizo de esa manera)."

Leo escribió el primer ADR esa tarde: la decisión de usar Kinesis para los eventos de seguimiento de entregas, con el contexto, las alternativas consideradas (SQS, EventBridge, sondeo) y las compensaciones.

Carlos miró el ADR que Leo había redactado. Lo leyó en treinta segundos. Luego dijo: "Muéstrale al equipo cómo se ve el ADR-007."

Leo lo proyectó.

---

**ADR-007: Infraestructura de Eventos de Seguimiento de Entregas**

**Fecha**: 2025-03-14
**Estado**: Aceptado
**Autor**: Leo (con revisión de Carlos, Priya)

---

**Problema**

Nimbus Instant requiere seguimiento del estado de entrega en tiempo real. Los pedidos deben actualizar su estado (confirmado → en preparación → en camino → entregado) y mostrar esas actualizaciones en la app móvil del cliente dentro de los 5 segundos posteriores al cambio de estado. El sistema de reembolsos también necesita un log de eventos de entrega auditable y reproducible para determinar el cumplimiento del SLA.

---

**Opciones Consideradas**

**Opción 1: WebSocket de API Gateway + estado en DynamoDB**
- El cliente mantiene una conexión WebSocket por pedido
- El backend empuja los cambios de estado sobre la conexión abierta
- En la reconexión, el cliente extrae el estado actual de DynamoDB
- Coste estimado a escala (10K pedidos activos simultáneamente): ~150 USD/mes
- Debilidad: Gestión del límite de conexiones a escala; sin reproducción integrada para auditoría

**Opción 2: Sondeo del cliente (intervalo de 5 segundos)**
- El cliente sondea `/orders/{order_id}/status` cada 5 segundos
- El backend lee de DynamoDB en cada sondeo
- La implementación más simple
- Coste estimado a escala (10K pedidos activos simultáneamente): 18.130 USD/mes
- Eliminada por el coste

**Opción 3: Kinesis Data Streams + Server-Sent Events**
- Los cambios de estado de entrega se publican en un flujo de Kinesis, dimensionado por rendimiento: un shard ingiere 1 MB/s o 1.000 registros/s. A 10K pedidos activos (~4 eventos de cambio de estado por pedido, cargas JSON pequeñas), la tasa de escritura pico es de ~40-50 eventos/s: el equivalente de un solo shard. Aprovisionar 3 shards para distribución de particiones y margen de consumidores.
- El endpoint SSE se suscribe al shard de Kinesis asignado a la partición del pedido
- El cliente recibe eventos SSE; se reconecta usando la API estándar EventSource
- Coste estimado a escala (10K pedidos activos simultáneamente): ~75 USD/mes
- Proporciona un log de eventos duradero y reproducible; desacopla todos los consumidores

---

**Decisión**

Opción 3: Kinesis Data Streams + SSE.

Justificación: la ventaja de coste es significativa a escala; el log de eventos de Kinesis satisface el requisito de auditoría de reembolsos sin una implementación de rastro de auditoría separada; la gestión de reconexión de SSE es más simple que la gestión de conexiones WebSocket a escala.

---

**Consecuencias**

- *Positivo*: El sistema de reembolsos, el sistema de notificación a restaurantes y la app del cliente consumen todos del mismo flujo de Kinesis de forma independiente. Se pueden añadir nuevos consumidores sin modificar el productor.
- *Positivo*: Los eventos son reproducibles hasta por 7 días (nuestra retención extendida configurada; Kinesis admite hasta 365 días con coste adicional). Si la Lambda de procesamiento de reembolsos falla, puede reproducir los eventos perdidos.
- *Negativo*: La latencia de SSE (~200ms) es mayor que la latencia de WebSocket (~50ms). Aceptable porque esta diferencia está por debajo del umbral de percepción del cliente para las actualizaciones de estado.
- *Negativo*: Los precios aprovisionados de Kinesis escalan con las horas de shard, y la retención extendida aproximadamente duplica el coste por shard. El margen de rendimiento es amplio (un shard ingiere 1.000 registros/s), pero a medida que el número de consumidores y la carga de lectura por consumidor crezcan más allá de aproximadamente 50K pedidos activos diarios, habrá que revisar el número de shards, y una estrategia de re-shard/fan-out de consumidores.

**Qué nos haría reconsiderar esta decisión**: Si el volumen de pedidos crece hasta el punto en que los costes de shard de Kinesis superen los costes de WebSocket a la nueva escala, o si la latencia de SSE de 200ms se convierte en un problema de diferenciación del producto.

---

"La última línea", dijo Maya. "Esa es la que no había pensado."

"El disparador para reconsiderar", dijo Carlos. "Cada decisión tiene condiciones bajo las cuales se vuelve incorrecta. Escribirlas significa que las reconocerás cuando aparezcan."

"En lugar de descubrirlas en un postmortem", dijo Priya.

"En lugar de eso, sí."

Tom estaba leyendo la consecuencia de coste. "La estrategia de re-shard y fan-out: todavía no la tenemos."

"No la necesitas hasta los 50K pedidos activos diarios", dijo Carlos. "A tus 287 restaurantes y 4.200 pedidos diarios actuales, tienes un margen significativo. El ADR te dice qué construir antes de que se vuelva urgente, no antes de que se vuelva relevante."

Leo había estado tomando notas. "El ADR está haciendo dos cosas", dijo. "Está documentando lo que decidimos. Y está documentando lo que tendríamos que decidir a continuación si la situación cambia."

"Eso es lo que hace que un ADR sea útil durante dieciocho meses", dijo Carlos. "No la decisión en sí: las decisiones se vuelven obsoletas. El razonamiento. El razonamiento te dice si la decisión debería reconsiderarse, incluso cuando la decisión sigue vigente."


**Qué Hace a un Arquitecto**

Al final de la sesión, Maya hizo a Carlos la pregunta original: "¿Cuál es la diferencia entre tomar decisiones arquitectónicas y pensar como un arquitecto?"

Él lo consideró.

"Un arquitecto no sabe más tecnología que un ingeniero senior", dijo. "Un buen arquitecto probablemente sabe un poco menos de los últimos frameworks. Pero un arquitecto tiene un conjunto de preguntas predeterminadas diferente."

"¿Qué quieres decir?"

"Cuando eres un ingeniero senior mirando una nueva funcionalidad, tus primeras preguntas suelen ser: '¿Qué construimos? ¿Cómo funciona? ¿Cuál es la mejor biblioteca para esto?' Cuando un arquitecto mira la misma funcionalidad, las primeras preguntas son: '¿Qué problema resuelve esto? ¿Qué falla primero cuando el tráfico se duplica? ¿Cómo sabemos cuándo está degradado? ¿Cuál es la experiencia del usuario cuando el procesador de pagos está lento?'"

"El arquitecto pregunta por el sistema bajo estrés", dijo Leo.

"Y sobre la consecuencia empresarial de cada fallo", añadió Priya.

"Y", dijo Tom, "sobre lo que le pasa a la factura cuando esto escala."

Carlos asintió. "Todos ustedes ya están haciendo esto. Lo han estado haciendo desde el Capítulo 1. La diferencia entre un ingeniero senior y un arquitecto no es una certificación o un título. Es un hábito de hacer la siguiente pregunta: la que revela lo que todavía no habías pensado."

**Variación: Cuando una Revisión de Arquitectura Añade Riesgo en Lugar de Eliminarlo**

Si tu revisión se trata como una puerta de aprobación en lugar de un proceso de aprendizaje, los equipos empezarán a ocultar las decisiones de diseño para evitar el retraso, y los modos de fallo seguirán existiendo, solo que sin documentar. Una revisión de arquitectura que ralentiza el lanzamiento sin mejorar la calidad es peor que ninguna revisión.

Si el problema de idempotencia del servicio de reembolsos se hubiera tratado como un retraso inesperado para el lanzamiento de la funcionalidad en lugar de como un descubrimiento necesario, Leo habría lanzado el endpoint original, el doble reembolso eventualmente ocurriría, y el equipo se habría enterado por un cliente enfadado. La revisión saca a la luz el problema en un punto donde arreglarlo cuesta un día, no un rollback.

El valor de la revisión es proporcional a cuán dispuesto esté el equipo a dejar que cambie el diseño.

## Ventajas y Limitaciones

**Revisiones de arquitectura**:

- Detectan los modos de fallo antes de que estén en producción
- Crean comprensión compartida entre los miembros del equipo que a menudo tienen conocimiento compartimentado
- Generan documentación (ADRs) que paga dividendos durante años
- Ralentizan la toma de decisiones de manera beneficiosa: "moverse rápido" sin una revisión es "moverse rápido y chocar con la pared que no veías"

**Donde se complican**:

- Requieren alguien lo suficientemente hábil como para hacer las preguntas correctas: la revisión es tan buena como el revisor
- Pueden volverse burocráticas si se tratan como una casilla para marcar en lugar de una conversación
- Algunas decisiones arquitectónicas genuinamente no necesitan una revisión completa: saber cuáles sí es en sí mismo una habilidad arquitectónica
- El resultado (ADRs, diagramas, registros de decisiones) debe mantenerse a medida que el sistema evoluciona

## Resumen

La revisión con Carlos había tomado dos horas y producido tres ADRs, una lista de seis incógnitas que resolver antes de construir la funcionalidad, y un cambio arquitectónico (el almacén de estado de idempotencia) que habría sido doloroso de adaptar después del lanzamiento. La metáfora de la lista de verificación previa al vuelo se había sostenido todo el tiempo: no se descubrió nada catastrófico, pero varias cosas que habrían causado problemas más tarde fueron detectadas y documentadas mientras todavía eran fáciles de arreglar.

- Las revisiones de arquitectura comienzan con **los requisitos empresariales, no la tecnología**.
- La estructura de la revisión: restricciones → incógnitas → opciones → modos de fallo → monitoreo → runbooks.
- Los arquitectos preguntan: ¿Qué falla primero? ¿Cómo sabemos que está degradado? ¿Cuál es la experiencia del usuario durante el fallo? ¿Cuál es el coste a escala?
- Los **Registros de Decisiones de Arquitectura (ADRs)** capturan qué se decidió, por qué y qué causaría la reconsideración.
- Pensar como un arquitecto es un hábito: hacer la siguiente pregunta, especialmente sobre los modos de fallo, la consecuencia empresarial y la economía de escala.

## Consejos para el Examen

*Dominio SAA-C03: Transversal — razonamiento arquitectónico*

Este capítulo trata menos sobre temas específicos del examen y más sobre la mentalidad que evalúa el examen.

- Los **escenarios del SAA-C03** casi siempre describen primero una restricción empresarial ("la empresa no puede permitirse más de 1 hora de tiempo de inactividad") y te piden que selecciones la arquitectura que la satisface. Practica traducir las restricciones empresariales en requisitos técnicos.
- **Pensamiento en modos de fallo**: Muchas preguntas del examen describen un sistema y preguntan qué ocurre cuando un componente falla. Practica preguntar "¿qué falla primero?" para las arquitecturas que encuentres.
- **Pensamiento en compensaciones**: El examen rara vez tiene una respuesta "perfecta". Pide la respuesta *mejor* dado un conjunto de restricciones. Acostúmbrate a "esta opción es correcta dados estos requisitos específicos, aunque otra opción sería mejor con requisitos diferentes."
- **Registros de Decisiones de Arquitectura**: No es un servicio de AWS, sino una mejor práctica que refleja el pilar de Excelencia Operativa del Well-Architected Framework.
- **Kinesis para streaming de eventos en tiempo real**: La funcionalidad Nimbus Instant del capítulo usa Kinesis para el streaming de eventos de entrega. Señal de examen: "ingesta de eventos en tiempo real con procesamiento ordenado" → Kinesis Data Streams. "Desacoplar componentes, entrega al menos una vez" → SQS. Saber cuándo recurrir a cada uno es un patrón recurrente del examen.
- **Idempotencia como patrón evaluable**: El SAA-C03 evalúa frecuentemente la idempotencia en sistemas distribuidos. El patrón central: generar una clave de idempotencia única antes de llamar a un sistema externo; persistir la clave y el resultado; en el reintento, comprobar la clave existente antes de volver a ejecutar. Si se encuentra, devolver el resultado previamente almacenado sin volver a ejecutar. Esto evita cargos dobles, envíos dobles y mutaciones de estado duplicadas cuando ocurren reintentos después de un timeout de red. Señal de examen: "evitar operaciones duplicadas cuando se reintenta una llamada a un servicio" o "garantizar el procesamiento exactamente una vez de eventos de pago" → clave de idempotencia almacenada en DynamoDB con escritura condicional.
- **Server-Sent Events vs WebSockets**: SSE es unidireccional (servidor a cliente), usa HTTP estándar y se reconecta automáticamente vía la API EventSource. Los WebSockets son bidireccionales, requieren gestión de conexiones y son apropiados cuando el cliente también necesita enviar datos al servidor. Para las actualizaciones de estado de entrega (solo servidor a cliente), SSE es más simple y más barato que los WebSockets a escala.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Carlos hizo seis tipos de preguntas durante la revisión de arquitectura. ¿Puedes reconstruir las seis áreas sin mirar el capítulo?

*(Pista: Están enumeradas en la sección "Estructura de la Revisión de Arquitectura". Intenta recordarlas de memoria: el acto de intentar recordarlas (aunque falles) fortalece la retención a largo plazo.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa está construyendo un sistema de gestión de pujas en tiempo real para publicidad en línea. Las pujas deben evaluarse y responderse en 100 milisegundos. El sistema procesa 1 millón de pujas por segundo en el pico. Si el sistema de pujas está caído, la empresa pierde ingresos publicitarios. El equipo de base de datos de la empresa propone usar RDS Aurora con 10 réplicas de lectura. El arquitecto de soluciones debe evaluar si la propuesta es fundamentalmente viable antes de revisar sus características secundarias.

¿Qué preocupación debería plantear el arquitecto PRIMERO?

A) El coste de 10 réplicas de lectura de Aurora es demasiado alto para el presupuesto  
B) Las réplicas de lectura de Aurora tienen retraso de replicación que puede causar problemas de consistencia  
C) La latencia de consulta típica de Aurora de 1-5ms puede no cumplir el SLA de respuesta de 100ms  
D) RDS Aurora no soporta los volúmenes de transacciones de 1 millón de solicitudes por segundo con este requisito de latencia

**Pista 1**: La restricción principal es un tiempo de respuesta total de 100ms a 1 millón de solicitudes/segundo. ¿Cuál de estas preocupaciones, si es válida, hace inviable la propuesta sin importar cómo se aborden las otras tres?

**Pista 2**: La latencia de consulta de Aurora es típicamente de 1-5ms. 1-5ms para la consulta de base de datos deja 95-99ms para la red, la lógica de la aplicación y la serialización. ¿Está en riesgo la restricción de 100ms?

**Pista 3**: Aurora puede manejar un alto IOPS, pero 1 millón de solicitudes por segundo es una tasa extraordinaria. ¿Qué le ocurre a la arquitectura a esa escala?

**Respuesta**: D

**Explicación**: Aunque Aurora tiene un alto rendimiento, 1 millón de solicitudes por segundo con un tiempo de respuesta total de 100ms es un requisito extremo: es el bloqueador arquitectónico que determina si la propuesta puede existir siquiera. El arquitecto debe primero cuestionar si Aurora (o cualquier base de datos relacional) puede servir como sistema principal de búsqueda a esta escala y latencia. Los sistemas como este suelen usar almacenes de datos en memoria (Redis) o bases de datos especializadas de baja latencia, no bases de datos relacionales con semántica SQL completa. El SLA de 100ms es alcanzable para las consultas de Aurora por sí solas, pero la combinación de 1 millón de solicitudes por segundo y un SLA total de 100ms supera las características de rendimiento típicas de Aurora. "PRIMERO" significa factibilidad antes que refinamiento: si el motor no puede sostener la carga, cualquier otra preocupación sobre la propuesta es irrelevante.

**¿Por qué no A?** El coste es una preocupación válida, pero la primera preocupación debe ser si la arquitectura es técnicamente factible con los requisitos declarados.

**¿Por qué no B?** El retraso de replicación es una característica real pero *secundaria* de la propuesta: una propiedad que ajustas una vez que la arquitectura es viable. El retraso de réplica de Aurora es típicamente inferior a 100ms y aceptable para la mayoría de los casos de uso; plantearlo primero significaría debatir el comportamiento de consistencia de un sistema que no puede sostener el rendimiento requerido en primer lugar. La pregunta de factibilidad (D) lo subsume.

**¿Por qué no C?** La latencia de Aurora de 1-5ms está bien dentro del SLA de 100ms para la parte de la consulta de base de datos. Esta no es la preocupación principal.

*Dominio SAA-C03: Transversal — diseño de sistemas*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Aplica la estructura de revisión de arquitectura a un sistema real o hipotético:

Una startup quiere construir un juego de trivia multijugador en tiempo real. Los jugadores se unen a salas de juego (hasta 10 jugadores cada una). Cada ronda muestra una pregunta durante 15 segundos; todos los jugadores responden simultáneamente. Las puntuaciones se calculan al instante después de cada pregunta. Los juegos duran 10 rondas. Uso máximo: 50.000 juegos concurrentes.

Recorre los seis pasos de la revisión:

1. ¿Cuáles son las restricciones no negociables?
2. ¿Cuáles son las incógnitas y suposiciones?
3. ¿Cuáles son las opciones tecnológicas realistas?
4. ¿Cuáles son los modos de fallo?
5. ¿Cómo sabrás cuando está degradado?
6. ¿Cómo es el runbook de las 3 AM?

*(No existe una única respuesta correcta. El objetivo es practicar la estructura de revisión como herramienta de pensamiento.)*

## Escena Poscréditos

Carlos salió de la oficina a las 6 PM.

El equipo se quedó sentado un rato después, sin hacer nada en particular.

"Siento que aprendí más en esas dos horas que en cualquier capítulo individual de un servicio de AWS", dijo Leo.

"Eso es porque esos capítulos eran sobre herramientas", dijo Maya. "Esto fue sobre el juicio."

"¿El juicio se puede enseñar?", preguntó.

"Sí", dijo Priya. "Pero no leyendo. Mediante la práctica. Tomando decisiones, viendo qué se rompe, pensando en el por qué."

"A través de la experiencia", dijo Tom.

"A través de la experiencia estructurada", corrigió Priya. "La experiencia sin reflexión no construye juicio. Hay que hacer las preguntas después."

Maya miró la pizarra. Las notas de la revisión todavía estaban ahí: restricciones, incógnitas, modos de fallo, preguntas de monitoreo. Llenaba dos pizarras.

"Esto debería ir en el ADR", dijo.

Leo ya estaba tecleando.

En el capítulo final: lo único que ninguna herramienta o framework puede darte, y por qué "depende" es la respuesta más honesta y poderosa en la arquitectura de software.
