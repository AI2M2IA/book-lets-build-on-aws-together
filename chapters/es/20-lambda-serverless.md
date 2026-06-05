# Capítulo 20: El Modelo del Freelancer

La función de notificación de pedidos se ejecutaba exactamente una vez por pedido. Entre pedidos, no hacía nada. Durante diecisiete horas de un martes, no llegó ningún pedido. Durante esas diecisiete horas, la función no costó nada. Ni un centavo. Sin servidor inactivo, sin instancia en espera, sin capacidad reservada sin usar. La función existía. Simplemente no se ejecutaba.

El fan-out de SNS/SQS estaba funcionando. El servicio de analítica, el servicio de notificaciones y el servicio de correo electrónico consumían cada uno de sus propias colas SQS.

Pero Priya había notado algo.

"El servicio de correo electrónico", dijo. "¿Cuántos correos enviamos por hora?"

Leo revisó las métricas. "Un promedio de 400. Un pico de alrededor de 1.200 los viernes por la noche."

"¿Y la instancia EC2 que ejecuta el servicio de correo electrónico, cuánto tiempo funciona?"

"Siempre. 24/7."

"¿Incluso a las 3 AM cuando enviamos cero correos?"

Silencio.

"Estamos pagando por un computador sentado sin hacer nada," dijo Leo.

"¿Cuántas horas al día?"

Más silencio.

"Unas 18."

Tom estaba muy atento ahora.

**El Servidor No Siempre Es la Respuesta**

Las instancias EC2 son permanentes. Arrancas una y funciona hasta que la detienes: 24 horas al día, 7 días a la semana, independientemente del uso real. Para tu servidor web (que maneja tráfico a todas horas), eso es correcto. Para el servicio de correo electrónico (que envía ráfagas de correos y luego está inactivo durante horas), es un desperdicio.

El Auto Scaling Group puede reducir el servicio de correo electrónico a una instancia durante las horas de menor demanda. Pero una instancia sigue funcionando constantemente.

¿Qué pasaría si el código solo se ejecutara cuando hubiera trabajo que hacer?

Esa es la premisa de la **computación sin servidor**.

**AWS Lambda: Código Sin Servidores**

**AWS Lambda** te permite ejecutar código en respuesta a eventos sin aprovisionar ni gestionar servidores. Cargas una función, especificas qué la activa y Lambda la ejecuta cuando el disparador se activa.

Una función Lambda:

- No tiene estado persistente (cada invocación es independiente)
- Se ejecuta hasta 15 minutos por invocación
- Escala automáticamente de 0 a miles de invocaciones concurrentes
- Se factura solo cuando está en ejecución (por cada 1 ms de ejecución, redondeado hacia arriba, por GB de memoria asignada)

Cuando no hay ningún disparador, Lambda no cuesta nada. Cuando los disparadores se activan, Lambda se ejecuta y cobra. Cuando 10.000 disparadores se activan simultáneamente, Lambda ejecuta 10.000 invocaciones concurrentes. El escalado es automático y casi instantáneo.

**Disparadores de Eventos: Qué Activa Lambda**

Las funciones Lambda no se ejecutan por sí solas: responden a eventos. Los disparadores comunes incluyen:

- **Cola SQS**: Procesa mensajes de una cola. Lambda consulta la cola e invoca la función con lotes de mensajes.
- **API Gateway**: Llega una solicitud HTTP. API Gateway activa Lambda. Lambda genera una respuesta.
- **Evento de S3**: Se carga un archivo en S3. Lambda lo procesa (redimensionar una imagen, analizar un CSV, validar un documento).
- **SNS**: Se publica un mensaje en un tema. Se notifica a Lambda.
- **DynamoDB Streams**: Un registro en DynamoDB cambia. Lambda procesa el cambio.
- **CloudWatch Events (EventBridge)**: Un evento programado (como un cron job) se ejecuta en un momento definido.
- **ALB**: Llega una solicitud HTTP al balanceador de carga. Lambda puede gestionar ciertas rutas.

Para Nimbus, el servicio de correo electrónico se convirtió en una función Lambda activada por su cola SQS. Cuando llega un mensaje a la cola, Lambda es invocado con el contenido del mensaje, envía el correo electrónico a través de SES (Simple Email Service) y finaliza.

Cero servidores. Cero tiempo inactivo. Cero coste cuando está inactivo.

**El Problema del Arranque en Frío**

Las funciones Lambda se ejecutan en **entornos de ejecución**: pequeños contenedores aislados. Cuando se invoca una función:

1. AWS comprueba si hay un entorno de ejecución en caliente disponible (uno que haya gestionado una invocación reciente)
2. Si está en caliente: la función se ejecuta de inmediato
3. Si está en frío: AWS inicializa un nuevo entorno de ejecución, descarga tu código, inicia el runtime, ejecuta el código de inicialización y luego ejecuta la función

Un **arranque en frío** añade entre 100 ms y varios segundos de latencia dependiendo del runtime (Java y .NET tienen arranques en frío más largos que Python y Node.js) y del tamaño de tu paquete de código.

Para el procesamiento asíncrono (envío de correos, redimensionamiento de imágenes), los arranques en frío son invisibles para los usuarios.

Para las API síncronas (solicitudes HTTP donde un usuario espera una respuesta), los arranques en frío pueden causar respuestas ocasionalmente lentas.

**Mitigaciones**:

- **Concurrencia aprovisionada**: Precalienta un número especificado de entornos de ejecución. Siempre están listos. Pagas por esto incluso cuando no están procesando solicitudes.
- **Paquetes de menor tamaño**: El código más pequeño se inicializa más rápido.
- **Invocaciones de calentamiento**: Pings programados para mantener las funciones en caliente (un enfoque común pero poco elegante).
- **Elige el runtime adecuado**: Python y Node.js arrancan en frío más rápido que Java.

**Precios de Lambda: Por Qué Tom Sonrió**

Los precios de Lambda tienen dos componentes:

1. **Cargo por solicitud**: 0,20 USD por millón de invocaciones
2. **Cargo por duración**: 0,0000166667 USD por GB-segundo (memoria asignada × segundos en ejecución)

El primer millón de solicitudes al mes son gratuitas (siempre, no solo en el primer año).

Tom hizo los cálculos para el servicio de correo electrónico:

- 1.200 correos por día × 30 días = 36.000 invocaciones al mes
- Cada invocación tarda ~2 segundos con 256 MB de memoria
- Duración: 36.000 × 2 × 0,25 GB × 0,0000166667 USD = 0,30 USD/mes
- Solicitudes: 36.000 << 1.000.000 (nivel gratuito) = 0,00 USD/mes

La instancia EC2 para el servicio de correo electrónico: 18 USD/mes.

Tom guardó silencio un momento. Luego: "Deberíamos hacer esto para todo."

**Para Qué Es Bueno Lambda (y Para Qué No)**

Lambda es excelente para:

- **Procesamiento orientado a eventos**: Responder a eventos (cargas de archivos, mensajes en cola, tareas programadas)
- **Tareas de corta duración**: Procesamiento que se completa bien dentro de los 15 minutos
- **Tráfico puntual e impredecible**: Lambda escala de 0 a miles de forma instantánea, sin aprovisionamiento previo
- **Operaciones infrecuentes**: Un informe que se ejecuta a las 2 AM diariamente. Una tarea de limpieza que se ejecuta semanalmente.
- **Código de pegamento**: Funciones pequeñas que mueven datos entre servicios

Lambda es deficiente para:

- **Procesos de larga duración**: El límite de 15 minutos es una barrera infranqueable
- **Aplicaciones con estado**: Las funciones Lambda son sin estado por diseño: cada invocación es independiente
- **API de alto rendimiento y baja latencia**: Los arranques en frío pueden causar picos de latencia; la concurrencia aprovisionada mitiga esto pero añade coste
- **Aplicaciones que necesitan conexiones persistentes**: Lambda no puede mantener fácilmente un grupo de conexiones de base de datos de larga duración (aunque herramientas de agrupación de conexiones como RDS Proxy ayudan)
- **Servidores web tradicionales**: Posible, pero no el encaje natural

"Entonces Lambda no es un reemplazo de EC2," dijo Maya. "Es una herramienta diferente para trabajos diferentes."

"La API web de Nimbus se queda en EC2 o ECS," confirmó Leo. "El servicio de correo electrónico, el redimensionador de imágenes, el generador de informes nocturnos, el limpiador de registros: esos se mueven a Lambda."

**La Filosofía Sin Servidor**

Lambda es parte de un concepto más amplio: **sin servidor (serverless)**, construir aplicaciones donde no gestionas ningún servidor, solo código.

Una pila de Nimbus completamente sin servidor podría verse así:

- API Gateway + Lambda (en lugar de EC2 con un servidor web)
- DynamoDB (en lugar de RDS, también sin servidor, sin gestión de servidor)
- S3 (activos estáticos, inherentemente sin servidor)
- SNS + SQS (mensajería, sin servidor)
- Lambda (todo el procesamiento en segundo plano)

El atractivo: escribes código; AWS gestiona todo lo demás. Sin parches, sin configuración de escalado, sin planificación de capacidad.

La realidad: el modelo sin servidor tiene su propia complejidad operativa: depurar funciones Lambda distribuidas, gestionar los arranques en frío, comprender los límites de concurrencia. No es más simple, solo diferente.

## Ventajas y Limitaciones

**Por qué Lambda es poderoso**:

- Pago real por uso: coste cero cuando está inactivo
- Escalado automático sin configuración
- Sin servidores que parchear o mantener
- Nivel gratuito generoso (1 millón de solicitudes al mes, gratis para siempre)
- Integración estrecha con el resto de AWS

**Dónde se complica**:

- Los arranques en frío son reales y requieren un manejo cuidadoso para cargas de trabajo sensibles a la latencia
- El límite de ejecución de 15 minutos excluye las tareas de larga duración
- La depuración es más difícil: no hay servidor persistente al que acceder por SSH
- El diseño sin estado requiere externalizar todo el estado (base de datos, caché, S3)
- Los límites de concurrencia (1.000 invocaciones concurrentes predeterminadas por cuenta) pueden generar limitaciones a escala
- Las funciones Lambda conectadas a VPC tienen latencia adicional y problemas de arranque en frío

## Resumen

- **AWS Lambda** ejecuta código en respuesta a eventos sin gestionar servidores.
- **Pago por uso**: se factura por invocación y por cada 1 ms de ejecución (redondeado hacia arriba). Coste cero cuando está inactivo.
- Escala automáticamente de 0 a miles de invocaciones concurrentes.
- **Arranques en frío**: latencia de inicialización cuando no existe un entorno de ejecución en caliente. Se mitiga con concurrencia aprovisionada o runtimes ligeros.
- Ideal para: cargas de trabajo orientadas a eventos, de corta duración, puntuales o infrecuentes.
- No ideal para: tareas de larga duración, aplicaciones con estado, API de alto rendimiento y baja latencia sin concurrencia aprovisionada.
- **Sin servidor** es una filosofía de diseño: gestionas el código, no la infraestructura.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.1)*

- **Lambda + S3**: Patrón clásico: archivo cargado en S3 activa Lambda para su procesamiento (generación de miniaturas, análisis de virus, transformación de datos). No se necesita servidor.
- **Lambda + SQS**: Lambda consulta SQS y procesa lotes. SQS proporciona el mecanismo de reintento/DLQ. Lambda proporciona el procesamiento.
- **Lambda + API Gateway**: API HTTP sin servidor. API Gateway gestiona el enrutamiento, la autenticación y la limitación de velocidad. Lambda gestiona la lógica de negocio.
- **Señales de arranque en frío**: "picos de latencia en la primera solicitud," "tiempos de respuesta inconsistentes" → arranque en frío. Solución: concurrencia aprovisionada (cuesta dinero), paquete más pequeño, runtime más ligero.
- **Límites de ejecución**: máximo 15 minutos. 10 GB máximo de memoria. 512 MB de almacenamiento efímero /tmp por defecto (configurable hasta 10 GB). Estos límites aparecen en los escenarios del examen.
- **Concurrencia de Lambda**: 1.000 ejecuciones concurrentes predeterminadas por cuenta (puede aumentarse). **Concurrencia reservada**: garantiza que una función obtenga un número específico de ejecuciones; impide que otras funciones las consuman. **Concurrencia aprovisionada**: precalienta un número de entornos de ejecución.
- **Mapeo de fuentes de eventos**: La característica de Lambda que conecta SQS/DynamoDB Streams/Kinesis a Lambda. Lambda consulta la fuente y agrupa registros.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica el problema del arranque en frío. ¿En qué tipo de aplicación serían más problemáticos los arranques en frío? ¿En qué tipo serían aceptables?

*(Pista: Compara una API en tiempo real (usuario esperando una respuesta) con un trabajo en segundo plano asíncrono (el usuario ya recibió su confirmación y está haciendo otras cosas).)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa recibe imágenes de productos de sus proveedores a través de un bucket de S3. Cada imagen debe redimensionarse a cuatro dimensiones estándar (miniatura, pequeña, mediana, grande) y almacenarse de nuevo en S3. El volumen es impredecible: algunos días 10 imágenes, otros 100.000. El procesamiento debe completarse en 10 minutos por imagen. El coste debe minimizarse.

¿Qué arquitectura cumple MEJOR con estos requisitos?

A) Instancias EC2 en un Auto Scaling Group que monitoriza el bucket de S3 con sondeo largo  
B) Notificación de evento de S3 que activa una función Lambda que redimensiona las imágenes y almacena los resultados en S3  
C) Tareas de ECS Fargate activadas por una cola SQS, con eventos de S3 publicando en la cola  
D) Una instancia EC2 dedicada con un cron job que comprueba S3 cada minuto en busca de nuevas imágenes

**Pista 1**: El volumen impredecible favorece el escalado a cero. ¿Qué opción hace eso?

**Pista 2**: 10 minutos por imagen está dentro del límite de 15 minutos de Lambda. Comprueba si el trabajo de redimensionamiento de imágenes encaja con las restricciones de Lambda.

**Pista 3**: Una instancia EC2 dedicada funcionando 24/7 es cara y no escala.

**Respuesta**: B

**Explicación**: Las notificaciones de eventos de S3 activan Lambda cuando se carga una imagen. Lambda redimensiona la imagen a cuatro dimensiones y almacena los resultados en S3. Lambda escala de 0 a miles de invocaciones concurrentes automáticamente, gestionando el volumen impredecible sin aprovisionamiento previo. Coste cero cuando no se procesan imágenes.

**¿Por qué no A?** EC2 en un ASG no escala a cero: siempre se ejecuta una instancia como mínimo. El sondeo largo de S3 no es un mecanismo nativo de eventos de S3. Mayor coste que Lambda para cargas de trabajo puntuales.

**¿Por qué no C?** ECS Fargate funciona, pero es más complejo (requiere gestión de contenedores, ECR, definiciones de tareas) y tiene una latencia de arranque en frío ligeramente mayor que Lambda para cargas de trabajo puntuales. Lambda es más simple para este caso de uso.

**¿Por qué no D?** Una instancia EC2 dedicada es un punto único de fallo, no escala, funciona 24/7 y un enfoque basado en cron tiene hasta 60 segundos de retraso en la detección.

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus quiere generar un informe diario a las 5 AM con los 10 mejores restaurantes del día anterior por volumen de pedidos. El informe se genera a partir de datos de DynamoDB, se formatea como PDF, se almacena en S3 y se envía por correo electrónico a todos los socios restauradores.

Diseña el pipeline completo basado en Lambda para esto. ¿Qué activa Lambda? ¿Qué pasa si la generación del PDF tarda 12 minutos? ¿Y si hay 5.000 socios restauradores y enviarles correos lleva tiempo? ¿Usarías una Lambda o varias?

*(No hay una única respuesta correcta. El objetivo es practicar la composición de Lambda con otros servicios.)*

## Escena Poscreditos

Tom revisó la factura al final del mes.

El servicio de correo electrónico: desaparecido de la factura de EC2.
El trabajo de redimensionamiento de imágenes: desaparecido.
La tarea de limpieza nocturna: desaparecida.
El informe de analítica diario: desaparecido.

Cargos totales de Lambda para el mes: 4,23 USD.

"Cuatro dólares," dijo Tom.

"Y veintitrés centavos," añadió Leo amablemente.

Tom miró la factura del mes anterior, cuando esos servicios estaban todos en instancias EC2.

"Estábamos pagando 187 dólares por esas mismas cargas de trabajo."

"Lambda no cobra por el tiempo inactivo," dijo Leo. "Y la mayoría de esos servicios estaban inactivos el 90% del tiempo."

Tom se quedó mirando la pantalla durante un buen rato.

"Retiro todo lo que dije sobre que serverless era una palabra de moda," dijo.

En el siguiente capítulo: el contenedor de envío que hace que cualquier servidor se sienta como en casa.
