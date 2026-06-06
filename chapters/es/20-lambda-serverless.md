# Capítulo 20: El Modelo del Freelancer

Era una tarde tranquila de miércoles. Priya tenía los auriculares quitados por una vez, y la oficina tenía esa clase de murmullo bajo que significaba que todos estaban concentrados pero nadie entraba en pánico. Leo tenía un panel de costos abierto en una pantalla y la lista de instancias de EC2 en la otra.

Piensa en un freelancer que trabaja de guardia. No se sienta en un escritorio de nueve a cinco. Espera. Suena el teléfono, hace el trabajo, envía una factura, vuelve a esperar. Sin trabajo, sin costo. Una ráfaga de solicitudes, las maneja todas simultáneamente. Solo pagas por las horas realmente trabajadas, no por las horas que pasó disponible.

Ese es el modelo del que trata este capítulo.

Hay una sutileza aquí que vale la pena retener. El modelo tradicional es: contratas a un empleado, pagas por 8 horas, obtienes una producción variable. El modelo del freelancer es: pagas solo cuando suena el teléfono, obtienes exactamente lo que se solicitó. Para una empresa con demanda predecible y constante, el modelo del empleado es más eficiente: sabes que el teléfono sonará constantemente, así que pagar por hora es equivalente y no hay sobrecarga de contratación y desvinculación. Para una empresa con demanda variable, irregular o poco frecuente, el modelo del freelancer es drásticamente más barato.

AWS ofrece ese modelo para el cómputo, y si tiene sentido o no depende de tu patrón de demanda. La primera pregunta nunca es "¿es bueno este modelo?", sino "¿cómo es realmente mi carga de trabajo?".

Para la mayoría de las cargas de trabajo más grandes que las de una startup: una mezcla. Algunas cosas se ejecutan constantemente (el servidor de la API, la base de datos). Algunas cosas se ejecutan solo cuando se activan (procesamiento de eventos, generación de reportes, redimensionamiento de imágenes). El modelo del freelancer es para la segunda categoría, y Nimbus estaba a punto de descubrir cuánto de su factura pertenecía allí.

---

La distribución en abanico de SQS/SNS había desacoplado el flujo de pedidos, pero los trabajadores que consumían esas colas todavía corrían en instancias de EC2 que cobraban por hora, sin importar cuántos correos electrónicos enviaban realmente. La arquitectura era correcta; el modelo de costos todavía tenía una fuga.

Priya lo había notado primero.

"El servicio de correo electrónico", dijo. "¿Cuántos correos enviamos por día?"

Leo revisó las métricas. "Un promedio de 400 al día. Un pico de alrededor de 1.200 los viernes por la noche."

"¿Y la instancia de EC2 que ejecuta el servicio de correo electrónico, cuánto tiempo funciona?"

"Siempre. 24/7."

"¿Incluso a las 3 AM cuando enviamos cero correos?"

Silencio.

Leo abrió el gráfico de CPU de CloudWatch de la instancia de EC2 del servicio de correo electrónico. El gráfico mostraba 18 horas de operación continua. En el pico del viernes: CPU al 38%, manejando la ráfaga de correos. Después de medianoche: la CPU bajaba al 3%. Se quedaba ahí hasta que empezaban los pedidos del almuerzo.

Tres por ciento de CPU durante 18 horas seguidas. La instancia estaba en ejecución. Estaba facturando. No estaba haciendo nada significativo.

"Estamos pagando por un computador sentado sin hacer nada", dijo Leo.

"¿Cuántas horas al día?"

Más silencio.

"Unas 18."

Tom estaba muy atento ahora.

"Y no es solo el servicio de correo electrónico", agregó Priya. "El servicio de redimensionamiento de imágenes para las fotos de los restaurantes corre al 1% de CPU la mayor parte del tiempo. Solo se dispara cuando un restaurante sube un nuevo menú. Lo cual ocurre, ¿qué, unas pocas veces al día por restaurante?"

"Sí", confirmó Leo.

"El trabajo de limpieza nocturno que elimina archivos temporales se ejecuta durante 4 minutos a las 2 AM y luego permanece completamente inactivo durante 23 horas y 56 minutos."

"También sí."

El patrón era el mismo en todos los servicios más pequeños de Nimbus: cómputo pagado las 24 horas del día, usado durante una fracción de eso.

---

**El Servidor No Es Siempre la Respuesta**

Las instancias de EC2 son permanentes. Inicias una y se ejecuta hasta que la detienes: 24 horas al día, 7 días a la semana, sin importar el uso real. Para tu servidor web (que maneja tráfico a todas horas), eso es correcto. Para el servicio de correo electrónico (que envía ráfagas de correos y luego está inactivo durante horas), es un desperdicio.

El Auto Scaling Group puede reducir el servicio de correo electrónico a una instancia durante las horas de menor actividad. Pero una instancia sigue ejecutándose constantemente.

Esta es la pregunta a la que Tom seguía volviendo al mirar la factura: ¿qué estaba haciendo realmente cada servicio durante esas 18 horas de 3% de CPU? No nada, técnicamente: la instancia estaba esperando, comprobando eventos, manteniendo su estado. Pero desde una perspectiva de negocio: nada. El servicio no estaba entregando valor. Estaba facturando.

Para las cargas de trabajo que están verdaderamente inactivas la mayor parte del tiempo, una instancia de EC2 siempre encendida es como pagar el alquiler de un apartamento que solo visitas los fines de semana. El apartamento es tuyo; el alquiler no se detiene.

El modelo del freelancer resuelve esto por completo. El código existe. Simplemente no se ejecuta hasta que hay una razón para ejecutarlo. Sin costo de inactividad. Sin capacidad reservada. Sin servidor esperando junto al teléfono.

Esa es la premisa del **cómputo serverless**.

**AWS Lambda: Código Sin Servidores**

**AWS Lambda** te permite ejecutar código en respuesta a eventos sin aprovisionar ni gestionar servidores. Subes una función, especificas qué la activa, y Lambda la ejecuta cuando se dispara el disparador.

Una función de Lambda:

- No tiene estado persistente (cada invocación es independiente)
- Se ejecuta durante hasta 15 minutos por invocación
- Escala automáticamente de 0 a miles de invocaciones concurrentes
- Se factura solo cuando se ejecuta (por cada 1 ms de ejecución, redondeado hacia arriba, por GB de memoria asignada)

Cuando no hay disparador, Lambda no cuesta nada. Cuando los disparadores se disparan, Lambda se ejecuta y cobra. Cuando 10.000 disparadores se disparan simultáneamente, Lambda ejecuta 10.000 invocaciones concurrentes. El escalado es automático y casi instantáneo.

**Disparadores de Eventos: Qué Despierta a Lambda**

Las funciones de Lambda no se ejecutan por sí solas: responden a eventos. Los disparadores comunes incluyen:

- **Cola de SQS**: Procesa mensajes de una cola. Lambda sondea la cola e invoca la función con lotes de mensajes.
- **API Gateway**: Llega una solicitud HTTP. API Gateway activa Lambda. Lambda genera una respuesta.
- **Evento de S3**: Se sube un archivo a S3. Lambda lo procesa (redimensiona una imagen, parsea un CSV, valida un documento).
- **SNS**: Se publica un mensaje en un tema. Se notifica a Lambda.
- **DynamoDB Streams**: Un registro en DynamoDB cambia. Lambda procesa el cambio.
- **CloudWatch Events (EventBridge)**: Un evento programado (como un trabajo cron) se ejecuta a una hora definida.
- **ALB**: Llega una solicitud HTTP al balanceador de carga. Lambda puede manejar ciertas rutas.

Para Nimbus, el servicio de correo electrónico se convirtió en una función de Lambda activada por su cola de SQS. Cuando llega un mensaje a la cola, Lambda se invoca con el contenido del mensaje, envía el correo electrónico a través de SES (Simple Email Service) y sale.

Cero servidores. Cero tiempo de inactividad. Cero costo cuando está inactivo.

El patrón de Lambda + SQS vale la pena internalizarlo: SQS maneja la cola, la durabilidad, la lógica de reintentos y la DLQ. Lambda maneja el procesamiento. Obtienes los beneficios de desacoplamiento de SQS con la economía de escalar a cero de Lambda. Ningún servicio hace el trabajo del otro. Se componen de forma limpia.

"¿Qué pasa con un mensaje malformado en la cola?", preguntó Priya. "¿Puede una entrada incorrecta hacer que Lambda falle de una manera que afecte a otras funciones de la cuenta?"

Las invocaciones de Lambda están aisladas entre sí. Una función que falla no afecta a otras funciones. Una Lambda que lanza una excepción no manejada ante un mensaje malformado: el mensaje vuelve a la cola, se reintenta hasta el límite configurado, luego se mueve a la DLQ. La Lambda en sí permanece disponible para el siguiente mensaje. La validación de entrada dentro del manejador de Lambda sigue siendo importante —para detectar datos malformados antes de intentar procesarlos— pero un solo mensaje incorrecto no puede derribar la función.

**El Problema del Arranque en Frío**

Las funciones de Lambda se ejecutan en **entornos de ejecución**: contenedores pequeños y aislados. Cuando se invoca una función:

1. AWS comprueba si hay un entorno de ejecución en caliente disponible (uno que manejó una invocación reciente)
2. Si está en caliente: la función se ejecuta inmediatamente
3. Si está en frío: AWS inicializa un nuevo entorno de ejecución —descarga tu código, inicia el runtime, ejecuta tu código de inicialización— y luego ejecuta la función

Un **arranque en frío** agrega de 100ms a varios segundos de latencia dependiendo del runtime (Java y .NET tienen arranques en frío más largos que Python y Node.js) y del tamaño de tu paquete de código.

Quizás te preguntes: si Lambda arranca desde cero cada vez, ¿no lo hace eso más lento que un servidor que ya está en ejecución? Sí, a veces. Ese es el problema del arranque en frío, y importa para las APIs de cara al usuario sensibles al tiempo. No importa en absoluto para los trabajos en segundo plano donde el usuario ya recibió su confirmación. Un arranque en frío de 200ms en un servicio de correo electrónico que se ejecuta en segundo plano es invisible para cualquiera.

Para el procesamiento asincrónico (envío de correos, redimensionamiento de imágenes), los arranques en frío son invisibles para los usuarios.

Para las APIs sincrónicas (solicitudes HTTP donde un usuario está esperando una respuesta), los arranques en frío pueden causar respuestas ocasionalmente lentas.

**Mitigaciones**:

- **Concurrencia aprovisionada**: Pre-calienta un número específico de entornos de ejecución. Siempre están listos. Pagas por esto incluso cuando no están procesando solicitudes.
- **Tamaños de paquete más pequeños**: El código más pequeño se inicializa más rápido.
- **Invocaciones de calentamiento**: Pings programados para mantener las funciones en caliente (un enfoque común pero poco elegante).
- **Elige el runtime correcto**: Python y Node.js arrancan en frío más rápido que Java.

**Una Investigación Real de Arranque en Frío**

Dos semanas después de la migración a Lambda, Leo recibió un mensaje de Slack de un socio restaurante: "La confirmación del pedido a veces tarda 3 segundos. Normalmente es rápida. ¿Qué está pasando?"

Leo abrió las métricas de CloudWatch para la función de Lambda. En el gráfico de "Duration", pudo ver un patrón: la primera invocación después de cualquier intervalo de más de 15-20 minutos se disparaba a 2.800-3.200 milisegundos. Las invocaciones posteriores: 180-220 milisegundos.

Arranques en frío clásicos.

Sacó la traza de X-Ray para una de las invocaciones de 3 segundos. La línea de tiempo lo mostraba claramente:

- Fase de inicialización: 2.640ms (descargando el código de la función, iniciando el runtime de Node.js, ejecutando el código de inicialización a nivel de módulo)
- Ejecución de la función manejadora: 290ms

La fase de inicialización era el problema. Miró el código de inicialización. La función estaba importando un SDK grande, inicializando una conexión a la base de datos y cargando la configuración desde AWS Secrets Manager, todo al arrancar.

"Parte de esta inicialización solo necesita ocurrir una vez por entorno de ejecución", dijo Leo. "Pero está ocurriendo en cada arranque en frío."

Reestructuró el código de Lambda para inicializar la conexión a la base de datos fuera de la función manejadora (de modo que se reutilice entre invocaciones en caliente) y redujo el tamaño del paquete eliminando módulos del SDK no usados. También cambió de incluir todo el SDK de AWS a importar solo los servicios específicos que necesitaba.

Después de la optimización:

- Duración del arranque en frío: 1.100ms (todavía presente, pero menos severo)
- Invocaciones en caliente: 165ms

El arranque en frío de 1,1 segundos todavía ocurría ocasionalmente. Para el servicio de correo electrónico (asincrónico, retraso de cara al usuario invisible), esto era aceptable. Para la Lambda de notificaciones a restaurantes (de cara al cliente, ordenada desde una tableta), Priya presionó por la concurrencia aprovisionada: dos entornos pre-calentados siempre listos.

"¿Cuánto cuesta eso al mes?", preguntó Tom.

Dos entornos de concurrencia aprovisionada a 256MB: unos $5,40/mes. Los picos de latencia se detuvieron.

**Precios de Lambda: Por Qué Tom Sonrió**

Los precios de Lambda tienen dos componentes:

1. **Cargo por solicitud**: $0,20 por millón de invocaciones
2. **Cargo por duración**: $0,0000166667 por GB-segundo (memoria asignada × segundos en ejecución)

El primer millón de solicitudes al mes es gratis (siempre, no solo en el primer año).

"¿Cuánto cuesta eso al mes?", preguntó Tom antes de que Leo pudiera abrir la calculadora.

Tom hizo las cuentas para el servicio de correo electrónico él mismo:

- Supón que cada día es un viernes, el peor caso: 1.200 correos por día × 30 días = 36.000 invocaciones por mes
- Cada invocación tarda ~2 segundos a 256MB de memoria
- Duración: 36.000 × 2 × 0,25GB × $0,0000166667 = $0,30/mes
- Solicitudes: 36.000 << 1.000.000 (capa gratuita) = $0,00/mes

"Y esos 18.000 GB-segundos están bien dentro de los 400.000 GB-segundos de duración que siempre es gratis", agregó Tom. "Así que el cargo real sería cero. Pero estoy ignorando la capa gratuita a propósito: quiero saber el costo unitario real."

La instancia de EC2 para el servicio de correo electrónico: $18/mes.

"Ya lo desplegué... ah." Leo se detuvo. Había llevado la Lambda del servicio de correo electrónico a producción antes de terminar la configuración de la DLQ. "Dame cinco minutos."

Tom estuvo callado un momento. Luego: "Deberíamos hacer esto para todo."

**En Qué Es Buena Lambda (y en Qué No)**

"Espera, pero *¿por qué* no usaríamos simplemente Lambda para todo, entonces?", preguntó Maya. "Si es más barato y escala automáticamente, ¿cuál es la trampa?"

"El límite de 15 minutos", dijo Leo. "Y los arranques en frío para cualquier cosa de cara al usuario. Y la ausencia de estado: no puedes mantener nada en memoria entre invocaciones."

Si tu carga de trabajo es irregular, basada en eventos y se completa en menos de 15 minutos, Lambda costará una fracción de una instancia de EC2 siempre encendida; pero si tu carga de trabajo es un trabajo de procesamiento de datos de larga duración que se acerca o excede el límite de 15 minutos, Lambda es la herramienta equivocada y necesitarás ECS, Batch o un enfoque basado en EC2.

Lambda es excelente para:

- **Procesamiento basado en eventos**: Responder a eventos (subidas de archivos, mensajes de cola, tareas programadas)
- **Tareas de corta duración**: Procesamiento que se completa cómodamente dentro de 15 minutos
- **Tráfico irregular e impredecible**: Lambda escala de 0 a miles al instante, sin aprovisionamiento previo
- **Operaciones poco frecuentes**: Un reporte que se ejecuta a las 2 AM diariamente. Un trabajo de limpieza que se ejecuta semanalmente.
- **Código de pegamento**: Pequeñas funciones que mueven datos entre servicios

Quizás te preguntes: ¿qué le pasa al escalado de Lambda cuando una ráfaga repentina de 10.000 eventos llega simultáneamente? El límite de concurrencia predeterminado de Lambda es de 1.000 ejecuciones concurrentes por cuenta. Si 10.000 eventos llegan a la vez, hasta 1.000 invocaciones se ejecutan de inmediato; el resto espera en la cola de SQS (si se activa a través de SQS) y se procesan a medida que se libera capacidad. Esto normalmente está bien para el procesamiento basado en colas. Para casos de uso sensibles a la latencia, el límite de ráfaga de Lambda (la tasa inicial a la que se agregan nuevas ejecuciones concurrentes) puede causar un throttling breve durante picos repentinos; la concurrencia aprovisionada esquiva esto al tener capacidad preasignada.

Para el servicio de correo electrónico de Nimbus a su escala actual, 1.000 invocaciones concurrentes era mucho más de lo que jamás necesitarían. Pero es la restricción correcta que conviene conocer antes de alcanzarla.

Lambda es pobre para:

- **Procesos de larga duración**: El límite de 15 minutos es un muro infranqueable
- **Aplicaciones con estado**: Las funciones de Lambda no tienen estado por diseño: cada invocación es independiente
- **APIs de alto rendimiento y baja latencia**: Los arranques en frío pueden causar picos de latencia; la concurrencia aprovisionada lo mitiga pero agrega costo
- **Aplicaciones que necesitan conexiones persistentes**: Lambda no puede mantener fácilmente un pool de conexiones de base de datos de larga duración (aunque herramientas de pooling de conexiones como RDS Proxy ayudan)
- **Servidores web tradicionales**: Posible, pero no el ajuste natural

**El Muro de los 15 Minutos: Cuando Lambda Es la Herramienta Equivocada**

Tres semanas después de la migración, Leo intentó mover una carga de trabajo más a Lambda: el generador de reportes de análisis nocturno. Extraía datos de pedidos de la base de datos, los unía con los metadatos de los restaurantes, calculaba estadísticas y generaba un PDF.

La primera noche, la invocación de Lambda falló con un error de timeout.

"La generación del reporte tardó 17 minutos", dijo Leo a la mañana siguiente.

"El máximo de Lambda es 15", dijo Priya.

"Sí. Ahora lo sé."

Había revisado el tiempo de procesamiento promedio (8 minutos) y asumió que Lambda funcionaría. No había revisado la cola: las noches en que el volumen de datos era mayor y la consulta tardaba más. En esas noches, 15 minutos no eran suficientes.

"Entonces, ¿el reporte simplemente... no se genera?", preguntó Maya.

"Correcto. Sin notificación de error. Sin reporte parcial. Solo silencio."

"Ya lo desplegué... ah", dijo Leo.

Esta era una de las maneras específicas en que Lambda falla de forma poco elegante: un timeout no produce salida, ni mensaje de error en la aplicación, solo un registro de error de CloudWatch. Si no estás monitoreando específicamente los errores de timeout de Lambda, podrías no darte cuenta durante días.

La corrección: mover el generador de reportes a ECS Fargate —contenedores sin gestionar servidores; el próximo capítulo— que no tiene límite de tiempo. Lambda era la herramienta equivocada para cargas de trabajo que pudieran exceder los 15 minutos incluso ocasionalmente. La lección no era "Lambda es mala". La lección era "Lambda es la herramienta correcta para cargas de trabajo que encajan dentro de sus restricciones, y una fuente de fallos sorprendentes cuando no lo hacen".

**RDS Proxy: Pooling de Conexiones para Lambda**

La naturaleza sin estado de Lambda crea un problema específico de base de datos.

Cuando una instancia de EC2 se conecta a RDS, mantiene un pool de conexiones persistente. La aplicación reutiliza las conexiones del pool. RDS puede manejar, digamos, 200 conexiones simultáneas.

Cuando Lambda maneja 500 invocaciones simultáneas, cada invocación intenta abrir su propia conexión a la base de datos. Eso son 500 conexiones nuevas, abrumando una base de datos que admite 200.

**Amazon RDS Proxy** se sitúa entre las funciones de Lambda y RDS, manteniendo un pool de conexiones persistente y multiplexando las conexiones de corta duración de Lambda a través de él.

En lugar de: invocación de Lambda → nueva conexión de RDS (para cada una de las 500 invocaciones concurrentes)

Con RDS Proxy: invocación de Lambda → RDS Proxy → pool de 20 conexiones de RDS persistentes

"El proxy necesita las credenciales de RDS", dijo Priya. "¿Dónde viven? ¿Las almacena?"

RDS Proxy almacena las credenciales en Secrets Manager y las rota automáticamente. El rol de IAM de la función de Lambda le otorga acceso al proxy (usando autenticación de IAM), no a las credenciales de RDS directamente. Las credenciales nunca se exponen al código de Lambda.

"Entonces la función de Lambda se autentica vía IAM", confirmó Leo, "y el proxy maneja las credenciales reales de la base de datos."

Para la Lambda de procesamiento de pedidos de Nimbus (la que consulta RDS para la validación de pedidos), RDS Proxy eliminó el agotamiento del pool de conexiones durante el tráfico pico del viernes.

**Lambda Layers: Dependencias Compartidas**

La Lambda del servicio de correo electrónico, la Lambda de notificaciones y la Lambda de reportes compartían todas el mismo código de biblioteca interna: funciones de utilidad para formatear moneda, sanear entradas, registrar en el formato estándar.

Sin Lambda Layers, ese código compartido tenía que incluirse en el paquete de despliegue de cada función. Tres funciones, tres copias de la misma biblioteca de 2MB. Cuando la biblioteca se actualizaba, las tres funciones necesitaban nuevos despliegues.

Las **Lambda Layers** son paquetes separados que las funciones de Lambda pueden referenciar en tiempo de ejecución. La biblioteca compartida se extrajo a una layer. Las tres funciones referenciaban la layer. Las actualizaciones a la biblioteca compartida significaban actualizar la versión de la layer, no volver a desplegar las tres funciones.

Beneficio adicional: los paquetes de funciones individuales más pequeños significan arranques en frío más rápidos.

"Una cosa que las layers no cambian: el rol de ejecución", dijo Priya. "Si una Lambda tiene permisos demasiado amplios, una función comprometida puede acceder a todo en la cuenta."

"El mismo principio que los roles de EC2", dijo Leo. "Mínimo privilegio. Cada Lambda obtiene solo los permisos que realmente necesita."

"Entonces Lambda no es un reemplazo de EC2", dijo Maya. "Es una herramienta diferente para trabajos diferentes."

"La API web de Nimbus se queda en EC2 o ECS", confirmó Leo. "El servicio de correo electrónico, el redimensionador de imágenes, el generador de reportes nocturnos, el limpiador de registros: esos se mueven a Lambda."

**La Filosofía Serverless**

Lambda es parte de un concepto más amplio: **serverless**, construir aplicaciones donde no gestionas servidores, solo código.

Un stack de Nimbus completamente serverless podría verse así:

- API Gateway + Lambda (en lugar de EC2 con un servidor web)
- DynamoDB (en lugar de RDS, también serverless, sin gestión de servidores)
- S3 (activos estáticos, inherentemente serverless)
- SNS + SQS (mensajería, serverless)
- Lambda (todo el procesamiento en segundo plano)

El atractivo: escribes código; AWS gestiona todo lo demás. Sin parcheo, sin configuración de escalado, sin planificación de capacidad.

## Amazon API Gateway

La lista de disparadores de Lambda mencionó API Gateway brevemente: llega una solicitud HTTP, API Gateway activa Lambda. Eso es preciso, pero subvalora lo que API Gateway realmente es.

"Espera, pero *¿por qué* pondríamos API Gateway delante de Lambda?", preguntó Maya. "¿No puede Lambda simplemente recibir solicitudes HTTP directamente?"

Lambda puede recibir solicitudes HTTP a través de una URL de función: un endpoint HTTPS simple y directo. Pero no maneja el enrutamiento, la autorización, el throttling, el caché ni la transformación de solicitudes. Para una API de producción, esas preocupaciones existen sin importar si tu backend es Lambda o EC2.

**Amazon API Gateway** es un servicio totalmente gestionado para crear, desplegar y gestionar APIs a cualquier escala. Maneja la gestión del tráfico, la autorización, el throttling, el caché y el monitoreo para que tu función de Lambda (o EC2, o cualquier backend HTTP) no tenga que implementarlos por sí misma.

**Tres tipos de API:**

**REST API** es la opción más rica en funciones. Admite transformación de solicitudes y respuestas, caché de respuestas, planes de uso vinculados a claves de API y todos los tipos de autorización. La mayoría de las preguntas del examen SAA-C03 que mencionan API Gateway involucran la REST API.

**HTTP API** es más simple y más barata: aproximadamente un 70% menos de costo que la REST API. Está diseñada para backends de Lambda y proxies HTTP. Admite autorización OIDC y OAuth 2.0 pero no transformación de solicitudes ni caché. Si no necesitas las funciones avanzadas de la REST API, la HTTP API es la opción correcta.

**WebSocket API** gestiona conexiones bidireccionales persistentes. API Gateway maneja el ciclo de vida de la conexión y enruta los mensajes a Lambda según el contenido del mensaje. La función de Lambda no necesita gestionar el estado del socket: API Gateway lo hace.

**Opciones de autorización** (las que el examen evalúa):

El **autorizador de Cognito User Pool** valida un JWT de un Cognito User Pool. No se requiere Lambda. API Gateway comprueba el token por sí mismo. Si es válido, la solicitud pasa.

El **autorizador de Lambda** ejecuta tu propia función de Lambda para validar un token: un JWT personalizado, un token OAuth de un proveedor de identidad de terceros, una clave de API en un formato propietario. La Lambda devuelve una política de IAM. Si la política permite la acción, la solicitud procede.

La **clave de API** es una clave simple pasada en un encabezado de solicitud. Las claves de API son para limitar la tasa por cliente, no para autenticación. No las uses como mecanismo de seguridad: no son secretos, son identificadores.

**Throttling y planes de uso:**

De forma predeterminada, API Gateway permite 10.000 solicitudes por segundo a nivel de cuenta (un límite blando), con una ráfaga de 5.000. Si lo superas, los clientes reciben un `429 Too Many Requests`: tu backend ni siquiera lo siente. Cuando necesitas límites por cliente, creas un plan de uso: lo adjuntas a una clave de API, estableces una tasa de solicitudes y una cuota diaria o mensual. Las ráfagas de un cliente no consumen la asignación de otro cliente.

Dos números que vale la pena retener: el payload máximo es de **10 MB**, y el timeout de integración predeterminado es de **29 segundos**: si tu backend tarda más, el gateway se rinde. (Desde 2024, ese timeout puede elevarse más allá de los 29 segundos para las REST APIs regionales y privadas a través de un aumento de cuota, pero el predeterminado de 29 segundos sigue siendo lo que el examen espera.) API Gateway es para APIs de solicitud/respuesta, no para trabajos de larga duración; para esos, entrega el trabajo a SQS o Step Functions y responde de inmediato.

"¿Cuánto cuesta esto al mes?", preguntó Tom.

Para la REST API: $3,50 por millón de llamadas a la API, más $0,09 por GB de transferencia de datos. Para tráfico de pequeño a mediano, es esencialmente gratis. Para APIs de alto volumen, el punto de precio más bajo de la HTTP API se vuelve significativo.

Leo señaló la lista de disparadores de Lambda que había escrito antes. "Entonces API Gateway no es solo una manera de activar Lambda. Es lo que hace que Lambda se sienta como una API de verdad."

"La función de Lambda maneja la lógica de negocio", dijo Priya. "API Gateway maneja todo lo que está delante de ella: enrutamiento, autenticación, throttling, monitoreo. Cada uno hace una cosa."

"¿Y qué pasa si alguien intenta llamar a la Lambda directamente, evitando API Gateway?"

"La política de ejecución de la Lambda solo permite invocaciones desde API Gateway", dijo Priya. "La política basada en recursos de la Lambda deniega todo lo demás."

La realidad: serverless tiene una complejidad operativa propia: depurar funciones de Lambda distribuidas, gestionar arranques en frío, entender los límites de concurrencia. No es más simple, solo diferente.

"Espera, pero *¿por qué* serverless 'no es más simple'?", preguntó Maya. "Todo el discurso es que elimina la carga operativa."

"Elimina parte de la carga operativa", dijo Leo. "El aprovisionamiento de infraestructura, el parcheo, la configuración de escalado: esos desaparecen. Lo que queda es diferente: gestión de arranques en frío, rastreo distribuido a través de funciones a las que no puedes hacer SSH, límites de concurrencia, gestión de versiones y alias de funciones, entender cómo se propagan las actualizaciones de Layer, lidiar de forma elegante con los timeouts de 15 minutos."

"Entonces la carga se desplaza", dijo Priya. "De las operaciones de infraestructura a las operaciones de funciones."

"Sí. Para muchas cargas de trabajo —especialmente las basadas en eventos, pequeñas e irregulares— ese es un mejor trato. Para un servidor de aplicación de larga duración con el que los ingenieros necesitan interactuar y depurar, EC2 o contenedores a menudo siguen siendo la elección correcta."

Quizás te preguntes: ¿es serverless el futuro, y debería todo eventualmente moverse a Lambda? La respuesta honesta es que depende de la carga de trabajo. Serverless ha dominado el procesamiento basado en eventos. Ha hecho avances significativos en las APIs HTTP (vía API Gateway + Lambda). No ha reemplazado a los servidores de aplicación siempre encendidos, el procesamiento por lotes de larga duración ni los servicios con estado, y probablemente no lo hará, porque esos casos de uso no se benefician del modelo de Lambda. La pregunta de la herramienta correcta nunca desaparece; simplemente se aplica a opciones diferentes con el tiempo.

## Fortalezas y Limitaciones

**Por qué Lambda es poderoso**:

- Verdadero pago por uso: cero costo cuando está inactivo
- Escalado automático sin configuración
- Sin servidores que parchear o mantener
- Generosa capa gratuita (1 millón de solicitudes al mes, gratis para siempre)
- Integración estrecha con el resto de AWS
- RDS Proxy y Lambda Layers abordan dos de los puntos débiles más comunes de Lambda (pooling de conexiones y compartición de código) sin requerir cambios arquitectónicos

**Donde se complica**:

- Los arranques en frío son reales y requieren un manejo cuidadoso para las cargas de trabajo sensibles a la latencia
- El límite de ejecución de 15 minutos excluye las tareas de larga duración
- La depuración es más difícil: no hay un servidor persistente al que hacer SSH
- El diseño sin estado requiere externalizar todo el estado (base de datos, caché, S3)
- Los límites de concurrencia (1.000 invocaciones concurrentes por cuenta de forma predeterminada) pueden hacer throttling a escala
- Las funciones de Lambda conectadas a una VPC tienen latencia adicional y problemas de arranque en frío

**Monitorear Lambda Sin SSH**

La primera vez que algo se rompió en una función de Lambda, el instinto de Leo fue hacer SSH y mirar el proceso. No hay proceso al que hacer SSH. Los entornos de ejecución de Lambda son efímeros e inaccesibles.

Depurar Lambda requiere aprender un conjunto de herramientas diferente:

**CloudWatch Logs**: Cada invocación de Lambda escribe su stdout/stderr en un grupo de registros de CloudWatch. El registro estructurado (formato JSON) los hace filtrables. Los campos más útiles: nombre de la función, ID de invocación, duración, tipo de error y tu ID de correlación personalizado.

**CloudWatch Metrics**: Lambda publica automáticamente las métricas Invocations, Duration, Errors, Throttles y ConcurrentExecutions. Establecer alarmas en Errors y Throttles debería ser el día uno de cualquier despliegue de Lambda.

**AWS X-Ray**: Rastreo distribuido para Lambda. Agrega una pequeña sobrecarga (2-5ms por invocación) pero te da un gráfico de llamas de dónde se gasta el tiempo dentro de la función. Esencial para el análisis de arranques en frío: X-Ray muestra la fase de inicialización por separado de la fase del manejador.

**Lambda Insights**: Monitoreo mejorado para Lambda, disponible a través de CloudWatch Lambda Insights. Agrega el uso de memoria, el tiempo de CPU y la duración de inicialización a las métricas estándar. Cuesta un poco más pero vale la pena para las funciones de producción.

"¿Y qué pasa si alguien intenta entrar por la fuerza a través del entorno de ejecución?", preguntó Priya. "Las funciones de Lambda corren en contenedores aislados, pero si una dependencia tiene una vulnerabilidad, ¿podría un atacante obtener ejecución de código dentro de nuestra Lambda?"

Las mitigaciones: mantener las dependencias mínimas y actualizadas (el análisis de arranques en frío ya había empujado a Leo a reducir los tamaños de paquete), usar Lambda Layers para versionar las bibliotecas compartidas y otorgar al rol de ejecución de la Lambda los permisos mínimos requeridos. Si la función solo puede escribir en un bucket de S3 específico y consultar una tabla de DynamoDB específica, el radio de impacto de una función comprometida se limita exactamente a eso.

"El mínimo privilegio para los roles de ejecución de Lambda no es opcional", dijo Priya. "Es lo que limita el daño cuando algo sale mal."

Tenía razón. Y como la mayoría de los consejos de seguridad, también era simplemente buena ingeniería.

## Resumen

La arquitectura SQS/SNS del capítulo 19 separó las preocupaciones de aceptar trabajo y procesarlo. Lambda lleva eso más lejos: separa las preocupaciones de procesar el trabajo y pagar por la capacidad de hacerlo.

- **AWS Lambda** ejecuta código en respuesta a eventos sin gestionar servidores.
- **Pago por uso**: se factura por invocación y por cada 1 ms de ejecución (redondeado hacia arriba). Cero costo cuando está inactivo.
- Escala automáticamente de 0 a miles de invocaciones concurrentes.
- **Arranques en frío**: latencia de inicialización cuando no existe un entorno de ejecución en caliente. Se mitiga con concurrencia aprovisionada o runtimes ligeros.
- **Lambda Layers**: paquetes de código compartido que múltiples funciones pueden referenciar, reduciendo la duplicación y el tamaño del paquete.
- **RDS Proxy**: resuelve el problema de agotamiento de conexiones de Lambda al mantener un pool de conexiones de base de datos persistente entre Lambda y RDS.
- **Monitoreo**: usa CloudWatch Logs, Metrics, rastreo de X-Ray y Lambda Insights; no hay servidor al que hacer SSH.
- Mejor para: cargas de trabajo basadas en eventos, de corta duración, irregulares o poco frecuentes.
- No ideal para: tareas de larga duración (límite infranqueable de 15 minutos), aplicaciones con estado, APIs de alto rendimiento y baja latencia sin concurrencia aprovisionada.
- **Serverless** es una filosofía de diseño: gestionas código, no infraestructura. La complejidad operativa se desplaza, no desaparece.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.1)*

- **Lambda + S3**: Patrón clásico: un archivo subido a S3 activa Lambda para su procesamiento (generación de miniaturas, escaneo de virus, transformación de datos). No se necesita servidor.
- **Lambda + SQS**: Lambda sondea SQS y procesa lotes. SQS proporciona el mecanismo de reintento/DLQ. Lambda proporciona el procesamiento.
- **Lambda + API Gateway**: API HTTP serverless. API Gateway maneja el enrutamiento, la autenticación, el throttling. Lambda maneja la lógica de negocio.
- **Tipos de API Gateway:** REST API = funciones completas, transformación de solicitudes, caché, planes de uso. HTTP API = más simple, más barata, solo OIDC/OAuth. WebSocket API = conexiones bidireccionales persistentes. **Autorización:** autorizador de Cognito = validar JWT de Cognito de forma nativa. Autorizador de Lambda = lógica de validación de token personalizada. Clave de API = limitación de tasa por cliente (no autenticación). Disparador del examen: "API REST serverless" → API Gateway + Lambda.
- **Señales de arranque en frío**: "picos de latencia en la primera solicitud", "tiempos de respuesta inconsistentes" → arranque en frío. Solución: concurrencia aprovisionada (cuesta dinero), paquete más pequeño, runtime más ligero.
- **Límites de ejecución**: máximo 15 minutos. Máximo 10GB de memoria. 512MB de almacenamiento efímero /tmp de forma predeterminada (configurable hasta 10GB). Estos límites aparecen en los escenarios del examen.
- **Los errores de timeout de Lambda son silenciosos**: Si una función de Lambda agota el tiempo, produce un error de CloudWatch pero ninguna respuesta de error a nivel de aplicación. Monitorea los errores de timeout de Lambda de CloudWatch explícitamente. Así fue como el generador de reportes de 17 minutos de Leo falló en su primera noche sin ninguna alarma a nivel de aplicación.
- **Arranques en frío de Lambda en VPC**: Las funciones de Lambda dentro de una VPC tienen latencia adicional de arranque en frío (aprovisionamiento de ENI). AWS mejoró esto significativamente con las ENIs de Hyperplane, pero los arranques en frío de Lambda en VPC siguen siendo más lentos que los que no están en VPC. Evita la VPC para las funciones de Lambda que no necesitan recursos de VPC (es decir, que no se conectan a RDS, ElastiCache u otros recursos exclusivos de VPC).
- **Concurrencia de Lambda**: 1.000 ejecuciones concurrentes por cuenta de forma predeterminada (se puede aumentar). **Concurrencia reservada**: garantiza que una función obtenga un número específico de ejecuciones; evita que otras funciones las consuman. **Concurrencia aprovisionada**: pre-calienta un número de entornos de ejecución.
- **Event source mapping**: La función de Lambda que conecta SQS/DynamoDB Streams/Kinesis a Lambda. Lambda sondea la fuente y agrupa los registros en lotes.
- **Alcanzar los límites de cuenta**: "la aplicación está siendo limitada / LimitExceeded a medida que escala" → comprueba el límite en **Service Quotas** y solicita un aumento allí (muchas cuotas, como la concurrencia de Lambda, son ajustables; algunas son límites infranqueables).
- **RDS Proxy**: Señal del examen: "funciones de Lambda causando demasiadas conexiones a la base de datos", "agotamiento del pool de conexiones con Lambda". → RDS Proxy mantiene conexiones persistentes y multiplexa las conexiones de corta duración de Lambda.
- **Lambda Layers**: Señal del examen: "compartir código entre múltiples funciones de Lambda", "reducir el tamaño del paquete de despliegue" → Lambda Layers.
- **Lambda + X-Ray**: Rastreo distribuido para Lambda. Escenario del examen: "rastrear solicitudes a través de múltiples funciones de Lambda y servicios" → habilitar el rastreo de X-Ray en Lambda.
- **Lambda Destinations:** Para las invocaciones asincrónicas de Lambda, puedes configurar un Destination tanto para los resultados de éxito como de fallo. Envía los resultados exitosos a SQS, SNS, EventBridge u otra función de Lambda. Envía los fallos a SQS o SNS para alertas. Esta es la alternativa preferida a las DLQs para las invocaciones asincrónicas porque captura tanto el éxito como el fallo, no solo el fallo. Señal del examen: "enrutar los resultados exitosos de Lambda a otro servicio" o "capturar tanto los resultados de éxito como de fallo de una Lambda asincrónica" → Lambda Destinations. "Solo capturar los mensajes fallidos para una invocación asincrónica" → la DLQ sigue siendo válida pero Destinations es la solución más completa.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica el problema del arranque en frío. ¿En qué tipo de aplicación serían los arranques en frío más problemáticos? ¿En qué tipo serían aceptables?

*(Pista: Compara una API en tiempo real (usuario esperando una respuesta) con un trabajo asincrónico en segundo plano (el usuario ya recibió su confirmación y está haciendo otras cosas).)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa recibe imágenes de productos de sus proveedores a través de un bucket de S3. Cada imagen necesita ser redimensionada a cuatro dimensiones estándar (miniatura, pequeña, mediana, grande) y almacenada de nuevo en S3. El volumen es impredecible: algunos días 10 imágenes, algunos días 100.000. El procesamiento debe completarse en 10 minutos por imagen. El costo debe minimizarse.

¿Qué arquitectura cumple MEJOR con estos requisitos?

A) Instancias de EC2 en un Auto Scaling Group monitoreando el bucket de S3 con sondeo largo  
B) Una instancia de EC2 dedicada con un trabajo cron que comprueba S3 cada minuto en busca de nuevas imágenes  
C) Tareas de ECS Fargate activadas por una cola de SQS, con eventos de S3 publicando en la cola  
D) Notificación de evento de S3 activando una función de Lambda que redimensiona las imágenes y almacena los resultados en S3

**Pista 1**: El volumen impredecible favorece el escalado a cero. ¿Qué opción hace eso?

**Pista 2**: 10 minutos por imagen está dentro del límite de 15 minutos de Lambda. Comprueba si el trabajo de redimensionamiento de imágenes encaja en las restricciones de Lambda.

**Pista 3**: Una instancia de EC2 dedicada que corre 24/7 es costosa y no escala.

**Respuesta**: D

**Explicación**: Las notificaciones de evento de S3 activan Lambda cuando se sube una imagen. Lambda redimensiona la imagen a cuatro dimensiones y almacena los resultados en S3. Lambda escala de 0 a miles de invocaciones concurrentes automáticamente, manejando el volumen impredecible sin aprovisionamiento previo. Cero costo cuando no se están procesando imágenes.

**¿Por qué no A?** EC2 en un ASG no escala a cero: siempre hay un mínimo de una instancia en ejecución. El sondeo largo de S3 no es un mecanismo de evento nativo de S3. Mayor costo que Lambda para cargas de trabajo irregulares.

**¿Por qué no B?** Una instancia de EC2 dedicada es un punto único de fallo, no escala, corre 24/7, y un enfoque basado en cron tiene hasta 60 segundos de retraso de detección.

**¿Por qué no C?** ECS Fargate funciona, pero es más complejo (requiere gestión de contenedores, ECR, definiciones de tareas) y el inicio de una tarea de Fargate tarda de decenas de segundos a minutos, mucho más lento que un arranque en frío de Lambda, lo que lo hace un mal ajuste para el trabajo irregular basado en eventos. Lambda es más simple para este caso de uso.

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus quiere generar un reporte diario a las 5 AM con los 10 mejores restaurantes del día anterior por volumen de pedidos. El reporte se genera a partir de datos de DynamoDB, se formatea como PDF, se almacena en S3 y se envía por correo electrónico a todos los socios restaurantes.

Diseña el pipeline completo basado en Lambda para esto. ¿Qué activa la Lambda? ¿Qué pasa si la generación del PDF tarda 12 minutos? ¿Qué pasa si hay 5.000 socios restaurantes y enviarles correos a todos lleva tiempo? ¿Usarías una Lambda o varias?

Considera también: ¿qué pasa si la Lambda agota el tiempo después de 14 minutos, habiendo procesado 4.500 de 5.000 correos de restaurantes? ¿Cómo evitas enviar correos duplicados cuando la Lambda se reintenta? ¿Qué permisos de IAM necesita esta Lambda, y cuál es el conjunto mínimo necesario?

*(No existe una única respuesta correcta. El objetivo es practicar la composición de Lambda con otros servicios.)*

## Escena Post-Créditos

Tom revisó la factura al final del mes.

El servicio de correo electrónico: había desaparecido de la factura de EC2.
El trabajo de redimensionamiento de imágenes: desaparecido.
La tarea de limpieza nocturna: desaparecida.
El reporte de análisis diario: desaparecido. (El generador de reportes había sido movido a ECS Fargate después del incidente del timeout de 17 minutos, pero el costo de cómputo de Lambda era cero porque ahora se orquestaba de otra manera.)

Cargos totales de Lambda del mes: $5,47.

"Cinco dólares", dijo Tom.

"Y cuarenta y siete centavos", agregó Leo servicialmente.

Tom miró la factura del mes anterior, cuando todos esos servicios estaban en instancias de EC2.

"Estábamos pagando $187 por esas mismas cargas de trabajo."

"Lambda no cobra por el tiempo de inactividad", dijo Leo. "Y la mayoría de esos servicios estaban inactivos el 90% del tiempo."

Tom abrió los gráficos de CloudWatch una vez más. La Lambda del servicio de correo electrónico había sido invocada 36.412 veces. Duración total: unos 18.200 GB-segundos. A $0,0000166667 por GB-segundo: $0,30, y hasta eso era nominal, ya que 18.200 GB-segundos cabían cómodamente dentro de los 400.000 GB-segundos de duración siempre gratuita. La línea de cargo real era cero.

"La instancia de EC2 costaba $18 al mes", dijo Tom. "Gastamos treinta centavos, y eso es ignorando la capa gratuita, para que sepamos el costo unitario real. La factura dice cero."

"La mayor parte de los $5,47 era la concurrencia aprovisionada en la Lambda de notificaciones: esa factura tanto si se ejecuta como si no. El redimensionador de imágenes, la tarea de limpieza y el resto caben dentro de la capa gratuita."

Tom miró la pantalla durante mucho tiempo.

"Retiro todo lo que dije sobre que serverless es una palabra de moda", dijo.

"Nunca dijiste eso", dijo Leo.

"Lo pensé muy fuerte."

En el próximo capítulo: el contenedor de transporte que hace que cualquier servidor se sienta como en casa.
