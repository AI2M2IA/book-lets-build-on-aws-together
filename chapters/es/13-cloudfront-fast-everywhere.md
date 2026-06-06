# Capítulo 13: Rápido en Todas Partes

Una foto que viaja desde un servidor en Oregón hasta un teléfono en Boston recorre aproximadamente 4.100 kilómetros de cable de fibra óptica. A dos tercios de la velocidad de la luz, eso representa unos 25 milisegundos de pura física: inevitables, no negociables, grabados en las leyes del universo.

Luego hay que sumar el viaje de ida y vuelta. Luego el tiempo de procesamiento. El navegador todavía no ha empezado a renderizar y ya han pasado 80 milisegundos.

---

*`eatnimbus.com` estaba en producción y el nombre de dominio era real. Los usuarios podían encontrar la app. Pero encontrarla no era lo mismo que disfrutarla. Tom había estado tomando mediciones de latencia desde diferentes ciudades, y los números de la Costa Este y Sudamérica no eran buenos. El problema del nombre de dominio estaba resuelto. El problema de la física no.*

---

`eatnimbus.com` estaba en producción. Leo había revisado las métricas de latencia de los usuarios de la Costa Este: 80-100 milisegundos por solicitud. Puede parecer poco, pero se acumula.

Cargar el menú: 90ms. Cargar la lista de restaurantes: 80ms. Cargar las fotos del restaurante: 200ms (las imágenes son grandes). Tiempo total antes de que un usuario pueda realizar un pedido: más de medio segundo con una buena conexión.

«El problema es la física», dijo Leo. «Los servidores están en Oregón. El crecimiento está en la Costa Este — y en São Paulo.»

«Entonces muda los servidores a la Costa Este», dijo Tom.

«Eso cuesta dinero.»

«¿Cuánto cuesta eso al mes?» preguntó Tom.

«¿Ejecutar un duplicado completo de nuestra infraestructura en us-east-1? Probablemente triplicar nuestros costes actuales. Y crea un problema completamente nuevo: mantener sincronizadas la base de datos de la Costa Oeste y la de la Costa Este.»

Priya levantó la vista de su portátil. «O no movemos los servidores. Movemos el *contenido*.»

Maya levantó la vista. «¿Cuál es la diferencia? Si el contenido está en un servidor, y el servidor está en Oregón, el contenido está en Oregón.»

«La mayor parte de lo que entrega una página es estático», dijo Priya. «Imágenes, hojas de estilo, archivos JavaScript, fuentes. Esos son los mismos para cada usuario. No vienen de la base de datos. Viven en S3. Y los objetos de S3 se pueden servir desde cualquier lugar.»

«¿Así que los copiamos a servidores más cercanos a los usuarios?»

«Dejamos que un servicio gestione eso por nosotros. Una sola fuente de verdad. Copias en todos los lugares donde se necesiten.»

Tom ya había abierto la página de precios. Estaba calculando antes de que Priya terminara de explicar.

**La Analogía del Almacén Pre-Abastecido**

Imagina Amazon como minorista, no como empresa de nube. Tienen un almacén enorme en un solo lugar con todos los productos. Si enviaran cada pedido desde ese único almacén, los clientes en ciudades lejanas esperarían días.

En cambio, Amazon tiene centros de distribución cerca de los principales centros de población. Cuando un producto es popular, pre-abastecen esos almacenes locales. Cuando un cliente en Seattle pide un libro, se envía desde el centro de distribución local, no desde el otro lado del país.

Esto es una **Red de Distribución de Contenido (CDN)**: una red de servidores distribuidos geográficamente que almacenan en caché copias de tu contenido cerca de tus usuarios.

Cuando un usuario en Boston solicita tu página de inicio, la CDN la sirve desde un servidor en Boston. No desde Oregón. La solicitud nunca atraviesa el país.

**Conoce CloudFront**

Amazon CloudFront es la CDN de AWS. Opera a través de una red global de **ubicaciones de borde** — servidores de caché situados en ciudades de todo el mundo. Al momento de escribir esto, hay más de 750 puntos de presencia en más de 100 ciudades.

Cuando configuras CloudFront, especificas un **origen**: la fuente de tu contenido real. Tu origen puede ser:

- Un bucket de S3 (archivos estáticos: imágenes, CSS, JavaScript, PDFs)
- Un Application Load Balancer (contenido dinámico de tu aplicación)
- Una instancia de EC2
- Un servidor HTTP en cualquier lugar de internet

CloudFront se sitúa frente a tu origen. Las solicitudes llegan a la ubicación de borde más cercana. Si el borde tiene el contenido en caché, lo devuelve de inmediato. Si no (un *cache miss*), lo obtiene de tu origen, lo almacena en caché y lo devuelve.

**Cómo Funciona el Almacenamiento en Caché de CloudFront**

La primera solicitud de cualquier contenido siempre es un cache miss: va al origen. Todas las solicitudes posteriores llegan al caché en la ubicación de borde.

Para Nimbus, las fotos del menú son candidatos perfectos para CloudFront. Las fotos de restaurantes cambian con poca frecuencia (quizás cuando el restaurante actualiza su perfil). Con CloudFront:

1. Un usuario en Boston solicita `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront consulta la ubicación de borde en Boston — todavía no está en caché (cache miss)
3. CloudFront obtiene desde S3 en us-west-2 (~80ms)
4. CloudFront almacena la foto en la ubicación de borde de Boston
5. El siguiente usuario en Boston solicita la misma foto
6. CloudFront la sirve desde el caché de borde local (~5ms)

La misma penalización de 80ms para la primera solicitud. Pero la milésima solicitud desde la misma ciudad tarda 5 milisegundos.

Los **encabezados Cache-Control** y las **configuraciones de TTL** en CloudFront determinan cuánto tiempo permanece el contenido en caché en el borde. Los archivos de imagen pueden almacenarse en caché durante horas o días. Las páginas HTML (que cambian con mayor frecuencia) pueden almacenarse en caché durante minutos o segundos.

Quizás te estés preguntando: ¿por qué no simplemente alojar toda la aplicación en múltiples regiones en lugar de usar una CDN? Si los datos están en Oregón, ¿por qué no poner una copia completa en Nueva York, Tokio y São Paulo? Podrías. Pero eso significa mantener múltiples bases de datos sincronizadas, gestionar despliegues en varias regiones simultáneamente, manejar escenarios de split-brain donde las regiones no coinciden. Una CDN es una respuesta mucho más simple para el contenido estático y semiestático: un origen, muchas copias en caché en el borde. Solo añades la complejidad multirregión cuando realmente necesitas operaciones de cómputo o de base de datos cerca del usuario — para la mayoría del contenido, el almacenamiento en caché en el borde es suficiente.

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «¿Por qué poner la caché en el borde en lugar de simplemente añadir un clúster de ElastiCache más grande en Oregón?»

«Porque la física sigue siendo el problema», dijo Priya. «Incluso si Oregón responde en un milisegundo, esa respuesta todavía tiene que viajar a Boston. El tiempo de ida y vuelta es de 70 milisegundos mínimo — a la velocidad de la luz no le importa lo rápidos que sean nuestros servidores. El almacenamiento en caché en el borde acerca la respuesta a la pregunta.»

**Contenido Dinámico: CloudFront para Más que Solo Caché**

«¿Pero qué pasa con las respuestas de nuestra API?» preguntó Leo. «Son dinámicas: cambian por usuario, por solicitud. No se puede poner en caché un historial de pedidos.»

Cierto. Pero CloudFront sigue siendo útil para el contenido dinámico.

Incluso cuando el contenido no puede almacenarse en caché, CloudFront enruta la solicitud desde la ubicación de borde hasta el origen a través de la red troncal privada de AWS: la fibra de alta velocidad que conecta la infraestructura de AWS globalmente. Esto es más rápido y fiable que enrutar por internet público, donde el tráfico puede rebotar a través de múltiples operadores.

El resultado: las solicitudes dinámicas siguen siendo un 20-40% más rápidas a través de CloudFront que yendo directamente al origen por internet público. No por el almacenamiento en caché, sino por la ruta de red.

«Eso no cuadra», dijo Maya. «Si la respuesta de la API todavía tiene que viajar de Oregón al borde y luego a Boston, ¿cómo es eso más rápido que ir directamente de Oregón a Boston?»

«Dos razones», dijo Priya. «Primero, la red troncal privada de AWS es más rápida y fiable que el internet público. El tráfico de internet público se enruta a través de múltiples operadores, cada uno añadiendo su propia latencia y variabilidad. La red troncal es fibra directa de baja latencia. Segundo, la terminación SSL ocurre en el borde. El usuario establece una conexión TLS con la ubicación de borde de CloudFront más cercana — el handshake es rápido. CloudFront mantiene entonces una conexión persistente y preestablecida con el origen. Dos conexiones de corta distancia en lugar de una de larga distancia.»

«Así que incluso para contenido no almacenado en caché, CloudFront recorta tiempo de la sobrecarga de conexión», dijo Leo.

«Normalmente del diez al cuarenta por ciento. No tan dramático como el almacenamiento en caché. Pero real.»

Además, CloudFront proporciona:

**Terminación SSL/TLS**: CloudFront gestiona HTTPS en el borde. La conexión entre el usuario y CloudFront está cifrada. CloudFront puede conectarse a tu origen a través de HTTP internamente (reduciendo la carga del origen) o HTTPS (para cifrado de extremo a extremo).

**Protección DDoS**: CloudFront está integrado con AWS Shield Standard. El tráfico distribuido entre cientos de ubicaciones de borde significa que los ataques se absorben en el borde en lugar de golpear directamente tu origen.

**Restricción geográfica**: Bloquea el acceso desde países específicos. Si Nimbus solo tiene licencia para operar en ciertos mercados, CloudFront puede aplicarlo en el borde sin que la solicitud llegue jamás a tus servidores.

**¿Y qué pasa si alguien intenta entrar a la fuerza a través de la CDN?** preguntó Priya. «Envenenamiento de caché (cache poisoning) — ¿qué pasa si alguien logra inyectar contenido malo en la caché del borde?»

«CloudFront tiene controles de clave de caché», dijo Leo. «Defines exactamente qué atributos determinan si dos solicitudes obtienen la misma respuesta en caché. Encabezados, cadenas de consulta, cookies. Un atacante no puede inyectar una respuesta en caché diferente sin coincidir con la clave de caché exacta.»

«Y el Control de Acceso al Origen significa que el bucket de S3 no servirá nada que no venga a través de CloudFront», dijo Priya. «Una superficie de ataque en lugar de dos.»

**Comportamientos de CloudFront: Reglas de Caché Detalladas**

Una distribución de CloudFront puede tener múltiples **comportamientos** — reglas de enrutamiento basadas en patrones de URL.

Para Nimbus:

- `/images/*` → Almacenar en caché en el borde durante 7 días (las fotos no cambian con frecuencia)
- `/static/*` → Almacenar en caché en el borde durante 30 días (CSS y JavaScript con nombres de archivo versionados)
- `/api/*` → No almacenar en caché; reenviar directamente al balanceador de carga
- `/*` → Almacenar en caché durante 5 minutos (páginas HTML)

Esto permite que CloudFront sea inteligente: almacena agresivamente en caché lo que es estable y deja pasar lo que es dinámico.

Los comportamientos se evalúan de más específico a menos específico. `/images/hero.jpg` coincide con `/images/*` antes de coincidir con `/*`. El comodín `/*` al final es el predeterminado — se aplica a cualquier cosa que no coincida con un patrón más específico.

«¿Qué pasa si queremos un almacenamiento en caché diferente para usuarios autenticados frente a no autenticados?» preguntó Priya. «La misma URL podría devolver contenido diferente dependiendo de si un usuario ha iniciado sesión.»

«Entonces incluyes la cookie de sesión en la clave de caché», dijo Leo. «Pero eso significa que cada usuario conectado obtiene su propia entrada de caché. Tu tasa de aciertos se desploma para el contenido autenticado.»

«Por eso separas el contenido autenticado del contenido público a nivel de URL», dijo Priya. «Cualquier cosa que requiera autenticación va a `/app/*` y no se almacena en caché. El contenido público va a `/browse/*` y se almacena en caché agresivamente. Un límite claro.»

La lección: CloudFront funciona mejor cuando la estructura de tus URLs refleja la intención de almacenamiento en caché. Las URLs que apuntan a datos totalmente públicos y estáticos deberían verse diferentes de las URLs que devuelven datos personalizados y dinámicos. Si se ven iguales para CloudFront, o la caché está rota o se sirve el contenido equivocado.

Leo reestructuró el esquema de URLs de Nimbus durante un fin de semana. Los endpoints de exploración se movieron a `/browse/`. Los endpoints de API se movieron a `/api/`. La interfaz de la app autenticada se movió a `/app/`. Tres comportamientos, tres políticas de caché claras, cero ambigüedad.

«Es un poco de refactorización», dijo.

«Es la estructura correcta», dijo Priya. «La habrías necesitado eventualmente.»

**Control de Acceso al Origen: Proteger S3 con CloudFront**

Si tu bucket de S3 contiene contenido privado que solo debe servirse a través de CloudFront (no directamente), puedes usar el **Control de Acceso al Origen (OAC)** para garantizar que S3 rechace las solicitudes que no provengan de CloudFront.

De esta manera:

- `d1234abcd.cloudfront.net/image.jpg` → Se sirve (CloudFront tiene permiso)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Bloqueado (acceso directo a S3 denegado)

Tu contenido solo es accesible a través de tu distribución, con tus reglas de caché y configuraciones de seguridad aplicadas.

---

**El Incidente de la Foto Obsoleta**

El Restaurante 112 — el local colombiano en el Eastside — envió un correo a soporte un jueves por la mañana. Un cliente se había quejado de que la foto principal del restaurante todavía mostraba la antigua fachada, aunque el dueño había subido una nueva hacía dos días.

Leo abrió la configuración de la distribución de CloudFront.

El comportamiento para `/images/*` tenía un TTL de siete días. El portal de socios restauradores había subido una foto nueva hacía dos días, reemplazando el archivo en la misma ruta de clave de S3: `restaurant-112/hero.jpg`. El archivo antiguo había desaparecido de S3. Pero CloudFront todavía lo servía desde la caché en cada ubicación de borde que lo hubiera obtenido en los últimos siete días.

«Cambiamos el contenido en el origen», dijo Leo. «Pero CloudFront no lo sabe. Tiene una copia en caché y no va a comprobarlo durante siete días.»

«Ya lo desplegué — oh.» Había asumido que reemplazar el archivo de S3 refrescaría automáticamente la caché de CloudFront. No lo hace. CloudFront no tiene ningún mecanismo para detectar que el contenido en una clave de S3 ha cambiado — simplemente sirve lo que tenga en caché hasta que el TTL expire.

Dos opciones:

**Opción uno: Invalidación.** Enviar a CloudFront una solicitud de invalidación para `/images/restaurant-112/hero.jpg`. CloudFront marca esa ruta como obsoleta en todas las ubicaciones de borde. La siguiente solicitud de esa ruta obtiene contenido fresco de S3. Coste: las primeras 1.000 rutas de invalidación cada mes son gratis; más allá, $0,005 *por ruta*. Para un archivo, gratis. Para invalidar miles de archivos durante una actualización masiva, los costes se acumulan.

**Opción dos: Nombres de archivo versionados.** En lugar de `hero.jpg`, nombra el archivo `hero-v2.jpg`. Actualiza la referencia en la base de datos. CloudFront no tiene ninguna entrada en caché para `hero-v2.jpg` — la primera solicitud lo obtiene de S3, y los usuarios lo ven de inmediato. El antiguo `hero.jpg` permanece en caché pero ya no está referenciado en ningún lugar. Expira naturalmente después de siete días.

«Para el contenido subido por los usuarios», dijo Priya, «los nombres versionados son el patrón correcto. Añade un hash o una marca de tiempo al nombre del archivo. Cada nueva subida es una nueva entrada de caché. Sin coste de invalidación, sin contenido obsoleto.»

Leo actualizó el portal de socios. Las nuevas subidas ahora se almacenarían como `hero-{timestamp}.jpg`. El registro de la base de datos se actualizó con la nueva ruta. La antigua ruta en caché era irrelevante.

«¿Y el caso del despliegue?» preguntó Maya. «¿Cuando subimos una nueva versión de la app y el JavaScript cambia?»

«El mismo principio», dijo Priya. «Las herramientas de compilación como Webpack generan nombres de archivo con hash: `app.a3b9c2d4.js`. Despliega una nueva versión y el hash cambia: `app.f7e1b3c5.js`. CloudFront sirve ambos desde la caché — los usuarios antiguos obtienen el archivo antiguo, los nuevos usuarios obtienen el archivo nuevo. Sin invalidación, sin problema de coordinación.»

«La página HTML referencia el hash actual», dijo Leo. «Así que los nuevos usuarios obtienen el nuevo HTML con el nuevo hash de JS, y la CDN sirve el archivo correcto.»

«Práctica estándar», confirmó Priya.

---

**Latencia con Números Reales**

Tom había estado tomando mediciones de latencia desde tres ciudades.

| Ubicación | Sin CloudFront | Con CloudFront | Mejora |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| Nueva York | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tokio | 260ms | 28ms | 89% |

«La mejora es mayor donde el problema de la física es peor», observó Tom. «De São Paulo a Oregón son más de doscientos milisegundos. Eso es más de un cuarto de segundo, solo para iniciar la conversación.»

«Y el contenido nunca llega a São Paulo la segunda vez», dijo Leo. «El primer usuario en São Paulo lo obtiene de Oregón y lo almacena en caché localmente. Cada usuario después de ese obtiene treinta y cinco milisegundos.»

«El primer usuario en São Paulo asume el coste», dijo Tom. «Todos los demás se benefician.»

«Así es como funcionan las CDN», dijo Priya. «La primera solicitud puebla la caché. Cada acierto de caché después de eso es casi gratis.»

La implicación para los productos globales es significativa. Sin CloudFront, un usuario en Tokio esperando 260 milisegundos por tu imagen principal está esperando debido a la física — cables de fibra óptica y la velocidad de la luz. Con CloudFront, pones una copia de esa imagen en Tokio, y el problema de la física esencialmente desaparece.

---

**Múltiples Orígenes: ALB y S3 Juntos**

«Tenemos nuestras imágenes en S3 y nuestra API en el balanceador de carga», dijo Maya. «¿Necesitamos dos distribuciones de CloudFront?»

«No», dijo Leo. «Una distribución, múltiples orígenes.»

Una sola distribución de CloudFront puede enrutar diferentes patrones de URL a diferentes orígenes. Este es el patrón multiorigen:

```
eatnimbus.com/*         → Origen: ALB en us-west-2 (contenido dinámico)
eatnimbus.com/images/*  → Origen: bucket de S3 (imágenes estáticas)
eatnimbus.com/static/*  → Origen: bucket de S3 (CSS, JS, fuentes)
```

CloudFront evalúa los comportamientos en orden de especificidad. Una solicitud a `/images/hero.jpg` coincide con el comportamiento `/images/*` y va a S3. Una solicitud a `/api/orders` coincide con el comodín `/*` y va al ALB.

El beneficio: un dominio, un certificado SSL, una distribución de CloudFront, múltiples backends. Los usuarios ven un dominio unificado. El enrutamiento es invisible para ellos.

Un detalle operativo que también es un hecho garantizado del examen: ese certificado SSL viene de AWS Certificate Manager (ACM), y **un certificado usado por CloudFront debe solicitarse o importarse en `us-east-1`** — independientemente de dónde vivan tus orígenes. CloudFront es un servicio global cuyo plano de control vive en us-east-1; un certificado situado en us-west-2 simplemente no aparecerá en el desplegable de la distribución. (Para servicios regionales como un ALB, el certificado vive en la propia región del ALB.)

«¿Y el ALB no está orientado al público?» preguntó Priya.

«Solo CloudFront habla con el ALB», dijo Leo. «Restringimos el grupo de seguridad del ALB a la lista de prefijos gestionada de CloudFront. Las conexiones directas al ALB desde internet están bloqueadas.»

«Así que la única forma de llegar a la aplicación es a través de CloudFront.»

«Lo que significa que las reglas de WAF, la terminación SSL y la protección DDoS se aplican a todo el tráfico antes de que llegue a nosotros.»

---

**CloudFront Functions vs Lambda@Edge**

«¿Hemos pensado en lo que haríamos si necesitáramos reescribir una URL en el borde?» preguntó Priya. «¿O añadir un encabezado de seguridad a cada respuesta?»

«¿No podemos hacer eso en la aplicación?» preguntó Leo.

«Podemos. Pero si ocurre en el borde — antes de que CloudFront sirva desde la caché — ahorramos un viaje de ida y vuelta al origen.»

CloudFront admite dos mecanismos para ejecutar código en el borde:

**CloudFront Functions** son funciones JavaScript ligeras que se ejecutan en cada ubicación de borde. Se ejecutan en menos de un milisegundo, manejan millones de solicitudes por segundo y están diseñadas para transformaciones simples: reescrituras de URL, manipulación de encabezados, normalización de cadenas de consulta, redirecciones simples. Pueden ejecutarse en las solicitudes del visor y las respuestas del visor (antes y después de la caché, desde la perspectiva del usuario). No pueden hacer llamadas de red. Coste: $0,10 por millón de invocaciones.

**Lambda@Edge** ejecuta funciones Lambda reales en las ubicaciones de borde regionales de CloudFront (no en cada PoP, sino en docenas de las principales a nivel mundial). Lambda@Edge puede hacer llamadas de red, acceder a bases de datos, generar respuestas dinámicas, hacer lógica de autenticación compleja. Se ejecuta en las solicitudes del visor, las solicitudes del origen, las respuestas del origen y las respuestas del visor — dándote cuatro puntos de intervención en el ciclo de vida de la solicitud. Coste: más alto que CloudFront Functions, facturado por solicitud y duración.

El modelo mental:

| Caso de uso | Herramienta |
|---|---|
| Reescribir `/old-path` a `/new-path` | CloudFront Functions |
| Añadir el encabezado `Strict-Transport-Security` | CloudFront Functions |
| Normalizar cadenas de consulta antes de la búsqueda en caché | CloudFront Functions |
| Prueba A/B: asignar una cookie de prueba en la solicitud del visor | CloudFront Functions |
| Prueba A/B: enrutar el 10% de los usuarios a un origen diferente | Lambda@Edge (solicitud del origen — CloudFront Functions no puede cambiar el origen) |
| Autenticar un token JWT (requiere biblioteca de cifrado) | Lambda@Edge |
| Obtener contenido personalizado de una base de datos en el borde | Lambda@Edge |
| Generar una miniatura de imagen bajo demanda en el borde | Lambda@Edge |

Para Nimbus: usaron una CloudFront Function para añadir encabezados de seguridad a cada respuesta — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Dos docenas de líneas de JavaScript. Ejecución en menos de un milisegundo. Sin necesidad de un viaje de ida y vuelta al origen.

«Tardaría más en explicar los encabezados a un ingeniero junior», dijo Leo, «que en escribir la función.»

---

**Clases de Precio: Elegir Qué Ubicaciones de Borde**

«¿Hemos pensado en lo que cuesta esto a escala?» preguntó Tom, desplazándose por la página de precios de CloudFront.

«¿Cuánto cuesta eso al mes?» eran técnicamente dos preguntas aquí. La primera: ¿qué cobra CloudFront? La segunda: ¿necesitas cada ubicación de borde del mundo?

El precio de transferencia de datos de CloudFront varía según la región. El tráfico servido desde ubicaciones de borde en Norteamérica y Europa es el más barato. El tráfico de Sudamérica, Asia-Pacífico, Australia e India es más caro — porque la infraestructura cuesta más allí.

AWS te permite elegir una **clase de precio** para tu distribución:

- **Price Class All**: Usa todas las ubicaciones de borde globalmente. El mejor rendimiento en todas partes. El coste de transferencia de datos más alto para las regiones fuera de Norteamérica y Europa.
- **Price Class 200**: Usa la mayoría de las ubicaciones de borde (Norteamérica, Europa, Asia, Oriente Medio, África). Excluye las ubicaciones más caras de Sudamérica y algunas de Oceanía.
- **Price Class 100**: Usa solo las ubicaciones de borde de Norteamérica y Europa. La más barata. Los usuarios en São Paulo, Tokio y Sídney siguen siendo servidos — pero desde un borde norteamericano o europeo, no desde el más cercano a ellos.

«Entonces si elegimos Price Class 100», dijo Tom, «un usuario en São Paulo es servido desde... ¿Miami? ¿Nueva York?»

«Desde donde esté el borde incluido más cercano. Quizás 50 milisegundos en lugar de 230 milisegundos directos a Oregón», dijo Priya. «Sigue siendo una mejora significativa. No tan buena como Price Class All.»

«¿Y la diferencia de coste?»

«La transferencia de datos saliente de Sudamérica cuesta aproximadamente el doble que la de Norteamérica. Para una startup que todavía está construyendo tráfico, Price Class 200 es un compromiso razonable — obtienes Asia y Europa a un coste menor que Price Class All, y la mayoría de tus usuarios están cubiertos.»

«Empieza con 200», dijo Tom. «Cuando tengamos datos de tráfico reales de cada región, decidiremos si All vale la pena.»

La clase de precio correcta depende de dónde estén tus usuarios. Si no tienes usuarios en Sudamérica, pagar por ubicaciones de borde sudamericanas es coste puro. Si el veinte por ciento de tus ingresos viene de Brasil, la mejora de rendimiento de Price Class All probablemente se paga sola.

---

**Diseño de la Clave de Caché**

«¿Hemos pensado en lo que pasa cuando dos usuarios diferentes solicitan la misma URL pero obtienen contenido diferente?» preguntó Priya.

Leo lo pensó. «Páginas personalizadas.»

«O páginas específicas de un idioma. O versiones móviles frente a de escritorio. O páginas que varían según una cookie.»

Por defecto, CloudFront usa solo la ruta de la URL como clave de caché. Dos solicitudes a `/browse` obtienen la misma respuesta en caché, independientemente de la preferencia de idioma del usuario, el tipo de dispositivo o la cookie de sesión.

Si tu aplicación sirve contenido diferente basándose en cadenas de consulta, encabezados o cookies — y quieres que CloudFront almacene en caché esas variaciones por separado — necesitas incluir esos atributos en la **clave de caché**.

Para Nimbus:

- `/browse?city=miami` debería almacenarse en caché por separado de `/browse?city=boston` — listas de restaurantes diferentes. Incluye las cadenas de consulta en la clave de caché.
- Los usuarios móviles podrían obtener un diseño diferente. Incluye un tipo de dispositivo normalizado (derivado del encabezado `User-Agent`) en la clave de caché.
- El encabezado `Accept-Language` determina en qué idioma se renderiza la página. Inclúyelo en la clave de caché.

Ten cuidado, sin embargo. Cada atributo de clave de caché que añades crea más variaciones de caché. Si incluyes toda la cadena `User-Agent` (que varía según la versión del navegador, la versión del SO y el nivel de parche), efectivamente rompes el almacenamiento en caché — cada usuario tiene un User-Agent ligeramente diferente, así que cada solicitud es un cache miss.

La disciplina: normaliza antes de almacenar en caché. Reduce «iPhone 15 Pro Safari 17.4.1» a «móvil». Reduce todos los idiomas aceptados a los dos o tres que realmente admites. Incluye solo lo que genuinamente cambia la respuesta.

«Cuanto más específica sea tu clave de caché», dijo Leo, «peor será tu tasa de aciertos.»

«Y cuanto más genérica», dijo Priya, «más probable es que sirvas el contenido equivocado al usuario equivocado.»

«Así que el diseño de la clave de caché es la misma concesión que todo lo demás en el almacenamiento en caché.»

«Sí», dijo Priya. «Siempre es la misma concesión.»

---

## Cuándo CloudFront No Es la Respuesta: Global Accelerator

La app móvil de Nimbus tenía una función que Tom había estado vigilando en silencio durante dos meses: el estado del pedido en tiempo real. Cuando un cliente realizaba un pedido, la app permanecía conectada vía WebSocket y la pantalla de gestión de pedidos de la cocina se actualizaba en tiempo real. Sin botón de actualizar. Sin sondeo (polling). Una conexión en vivo que enviaba actualizaciones en el instante en que una cocina marcaba un elemento como listo.

«Esto usa WebSockets», dijo Tom, mirando las métricas de latencia una mañana. «Desde los usuarios en São Paulo, el establecimiento de la conexión está tardando 340 milisegundos. Algo no va bien.»

«CloudFront no almacena en caché las conexiones WebSocket», dijo Leo. «Las hace de proxy — las pasa al origen. Sin beneficio de caché.»

«Cierto. ¿Entonces por qué sigue siendo lento?»

«Porque el WebSocket todavía viaja de São Paulo a nuestros servidores en Oregón por internet público», dijo Leo. «CloudFront ayuda, porque termina el handshake TLS en el borde y luego usa la red troncal de AWS hasta el origen. Pero para una conexión WebSocket persistente, eso sigue siendo una conexión de larga distancia.»

«Hay un servicio exactamente para este problema», dijo Priya.

**AWS Global Accelerator** no es una CDN. No almacena nada en caché. No sirve contenido desde ubicaciones de borde. Lo que hace es darte dos direcciones IP Anycast estáticas que se anuncian globalmente desde todas las ubicaciones de borde de AWS simultáneamente — y luego enrutar el tráfico de tus usuarios por la red troncal privada de AWS en lugar del internet público.

Cuando un cliente en São Paulo abre la app de Nimbus, su dispositivo se conecta a la ubicación de borde de AWS más cercana (que podría estar en la propia São Paulo). Desde esa ubicación de borde, el tráfico viaja a los servidores de Nimbus en Oregón por la red de fibra privada, monitoreada y optimizada de AWS — no por el internet público donde los paquetes rebotan a través de operadores y saltos de enrutamiento impredecibles.

El internet público no está diseñado para la latencia. Está diseñado para la resiliencia — los paquetes pueden tomar cualquier ruta disponible. La red troncal de AWS está diseñada de forma diferente: es directa, de baja congestión y bajo el control operativo de AWS.

Tom comparó la diferencia.

| Ruta | Latencia (São Paulo a Oregón) |
|---|---|
| Internet público | 340ms |
| Vía Global Accelerator | 180ms |

Una reducción del 47%. No por almacenamiento en caché — por una mejor ruta de red.

«¿Entonces por qué no usaríamos simplemente CloudFront para todo?» preguntó Maya. «CloudFront ya enruta por la red troncal de AWS para el contenido dinámico.»

«CloudFront es solo HTTP y HTTPS», dijo Priya. «Los WebSockets funcionan con CloudFront, pero solo mediante actualización HTTP (HTTP upgrade). Y algunos de nuestros protocolos — los datos de sensores IoT, por ejemplo — son TCP o UDP puros. CloudFront no maneja esos. Global Accelerator es agnóstico al protocolo. TCP, UDP, WebSockets, lo que sea. Mueve paquetes, no solicitudes HTTP.»

Había otra diferencia que Priya anotó en su documentación de seguridad.

«Global Accelerator nos da dos IPs Anycast estáticas», dijo. «Esas IPs nunca cambian. Eso significa que podemos añadirlas a nuestra política de seguridad, añadirlas a las listas blancas de socios, añadirlas a las reglas del cortafuegos. Las direcciones IP de CloudFront cambian con el tiempo — son gestionadas por AWS y no son fijas.»

«¿Y el failover?» preguntó Leo.

«Instantáneo», dijo Priya. «Si nuestra aplicación en us-west-2 tiene un problema, Global Accelerator puede desplazar el tráfico a un respaldo en us-east-1 en menos de 30 segundos — sin cambiar la dirección IP a la que se conectan los usuarios. El failover de DNS a través de Route 53 tarda de 60 a 300 segundos dependiendo del TTL. Global Accelerator es más rápido.»

**CloudFront vs. Global Accelerator — el modelo mental:**

CloudFront mejora la entrega mediante el almacenamiento en caché. Está construido para HTTP/HTTPS y el beneficio es mayor cuando el contenido se puede almacenar en caché cerca de los usuarios — archivos estáticos, imágenes, JavaScript. Cuando el contenido no se puede almacenar en caché, CloudFront sigue ayudando mediante el enrutamiento por la red troncal, pero la mejora es menor.

Global Accelerator mejora la entrega mediante el enrutamiento. No mueve contenido. No almacena nada en caché. El beneficio se aplica a cada paquete — en caché o no, HTTP o no, estático o dinámico. Las dos IPs estáticas funcionan globalmente. El failover es casi instantáneo. Los casos de uso donde CloudFront no es suficiente — WebSockets en tiempo real, protocolos basados en UDP, tráfico no HTTP, aplicaciones globales que requieren IPs fijas — son donde Global Accelerator es la herramienta correcta.

Tom actualizó la app móvil de Nimbus para conectarse al endpoint de Global Accelerator para la función de estado del pedido en tiempo real. El establecimiento de la conexión WebSocket en São Paulo bajó de 340ms a 180ms. Las actualizaciones de la cocina seguían sintiéndose instantáneas — porque ahora, para los usuarios fuera de Norteamérica, realmente lo eran.

## Fortalezas y Limitaciones

**Por qué CloudFront es poderoso**:

- Más de 750 puntos de presencia en más de 100 ciudades — la mayoría de los usuarios obtiene contenido a menos de 20ms de distancia
- Contenido estático servido en milisegundos de un solo dígito después del primer caché
- Reduce significativamente la carga del origen (el tráfico repetido nunca llega a tus servidores)
- Integrado con AWS Shield, WAF y Certificate Manager
- No se necesita planificación de capacidad: CloudFront escala automáticamente
- Las distribuciones multiorigen enrutan diferentes rutas a diferentes backends desde un solo dominio
- CloudFront Functions maneja la lógica ligera del borde con latencia inferior al milisegundo

**Donde se complica**:

- El contenido en caché puede quedar desactualizado: la invalidación de caché tiene un costo ($0,005 por ruta después de las primeras 1.000 rutas gratis cada mes). Usa nombres de archivo versionados en su lugar.
- Los encabezados Cache-Control deben configurarse correctamente en el origen: los errores provocan contenido obsoleto
- El contenido dinámico se beneficia de la optimización del enrutamiento, pero no del almacenamiento en caché
- Depurar el comportamiento del caché (qué está en caché, dónde y por cuánto tiempo) requiere entender múltiples capas: encabezados del origen, configuraciones de TTL de CloudFront, reglas de comportamiento
- La transferencia de datos salientes a través de CloudFront tiene un costo, aunque menor que la transferencia de datos estándar
- El diseño de la clave de caché requiere una reflexión cuidadosa — demasiado específico rompe el almacenamiento en caché, demasiado genérico sirve el contenido equivocado

## Resumen

CloudFront no cambió la física. La luz sigue viajando a la misma velocidad. Pero cambió dónde vivía la respuesta — y para la mayoría de los usuarios, la respuesta ahora estaba a unos pocos milisegundos en lugar de a unos pocos cientos. Tasa de aciertos de caché tras el despliegue: 83%. Eso significaba que 830.000 de cada millón de solicitudes nunca llegaban a los servidores de origen. Los usuarios en São Paulo pasaron de 290 milisegundos a 35 milisegundos. Los usuarios en Tokio de 260 a 28.

- Una **CDN** almacena en caché copias de tu contenido en ubicaciones de borde cerca de tus usuarios, reduciendo la latencia y la carga del origen.
- **CloudFront** es la CDN de AWS, con más de 750 puntos de presencia a nivel mundial.
- Los cache misses obtienen desde el **origen** (S3, ALB, EC2). Los cache hits se sirven desde el borde: milisegundos, no cientos de milisegundos.
- Los **comportamientos** permiten establecer diferentes reglas de caché para diferentes patrones de URL. Una distribución puede servir `/images/*` desde S3 y `/*` desde un ALB.
- El contenido dinámico no se almacena en caché, pero CloudFront sigue mejorando el rendimiento a través de la red troncal privada de AWS.
- **Evita el contenido obsoleto** usando nombres de archivo versionados (p. ej., `hero-v2.jpg`) en lugar de invalidaciones — más barato y más fiable.
- **CloudFront Functions** maneja la lógica ligera del borde (manipulación de encabezados, reescrituras de URL) a una velocidad inferior al milisegundo. **Lambda@Edge** maneja el procesamiento más pesado que requiere llamadas de red.
- Las **clases de precio** te permiten controlar qué ubicaciones de borde sirven tu tráfico — y por lo tanto tu coste de transferencia de datos.
- El **diseño de la clave de caché** determina qué atributos de la solicitud crean variaciones en caché separadas. Claves más específicas = menor tasa de aciertos. Menos específicas = riesgo de servir contenido equivocado.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.4)*

- **CloudFront + S3**: Patrón clásico del examen para servir sitios web estáticos globalmente. Bucket de S3 como origen, CloudFront como CDN, Control de Acceso al Origen para evitar el acceso directo a S3.
- **Ubicaciones de borde vs Regiones vs AZs**: Las ubicaciones de borde son más numerosas y existen únicamente para propósitos de caché/CDN. No son lo mismo que las AZs (que ejecutan tu cómputo).
- **Invalidación de caché**: Crea una invalidación `/images/*` para forzar a CloudFront a obtener contenido actualizado. Tiene un costo — el examen puede preguntar por la alternativa rentable: las URL versionadas (`image-v2.jpg` en lugar de `image.jpg`), que naturalmente evitan el caché.
- **Control de TTL**: `Cache-Control: max-age=3600` en el origen establece un TTL de caché de 1 hora. CloudFront respeta estos encabezados. El TTL mínimo, el TTL máximo y el TTL predeterminado también pueden configurarse en el comportamiento de la distribución.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions se ejecutan en el borde para la manipulación liviana de solicitudes/respuestas (submilisegundos). Lambda@Edge ejecuta tu código Lambda en ubicaciones de borde regionales para un procesamiento más pesado. El examen los distingue según la complejidad del caso de uso. CloudFront Functions no puede hacer llamadas de red; Lambda@Edge sí.
- **URL firmadas y Cookies firmadas**: Controlan quién puede acceder al contenido a través de CloudFront. Las URL firmadas dan acceso a archivos específicos; las cookies firmadas dan acceso a múltiples archivos. El examen las usa para «contenido de suscriptores de pago».
- **Clase de precio**: El examen puede preguntar qué clase de precio elegir para una audiencia global frente a una audiencia de Norteamérica/Europa. Price Class All = mejor rendimiento, mayor coste. Price Class 100 = solo Norteamérica y Europa, menor coste.
- **Clave de caché**: La clave de caché predeterminada es la URL. Añadir cadenas de consulta, encabezados o cookies a la clave de caché crea variaciones en caché separadas — pero aumenta la tasa de cache miss. El examen puede presentar un escenario donde el contenido varía según un parámetro de consulta y preguntar cómo configurar el almacenamiento en caché.
- **Failover de origen**: CloudFront admite un grupo de origen con un origen primario y uno secundario. Si el origen primario devuelve un error 5xx, CloudFront reintenta automáticamente con el secundario. Diferente del failover de Route 53 — esto es dentro de una sola distribución de CloudFront.
- **Comportamientos multiorigen**: Una sola distribución puede enrutar `/images/*` a S3 y `/*` a un ALB. El examen puede presentar esto como «cómo servir contenido estático y dinámico desde un dominio sin dos distribuciones».
- **CloudFront vs. Global Accelerator:** CloudFront = CDN HTTP/HTTPS, almacena contenido en caché en ubicaciones de borde, reduce la carga del origen, mejor para contenido estático y almacenable en caché. Global Accelerator = cualquier protocolo TCP/UDP, no almacena nada en caché, enruta el tráfico por la red troncal privada de AWS, proporciona 2 IPs Anycast estáticas, admite failover regional casi instantáneo. Desencadenante del examen: «mejorar la latencia para tráfico no HTTP» o «IP estática para una aplicación global» o «rendimiento de WebSocket para usuarios globales» o «failover regional más rápido que el DNS» → Global Accelerator. «Servir archivos estáticos globalmente con baja latencia» → CloudFront.

## Ejercicios

**Ejercicio 1 — Recordar**

Explica la diferencia entre un cache hit y un cache miss en CloudFront. ¿Qué ocurre en cada caso?

*(Pista: Piensa en de dónde proviene el contenido y cómo difiere el tiempo de respuesta entre los dos casos.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa de software distribuye archivos de instalación grandes (~2 GB cada uno) desde un bucket de S3 a clientes en todo el mundo. Las velocidades de descarga son lentas para los clientes en Asia. El equipo quiere mejorar el rendimiento sin replicar el bucket de S3 en múltiples regiones. También necesitan asegurarse de que solo los clientes de pago puedan descargar los instaladores.

¿Qué solución cumple MEJOR con estos requisitos?

A) Habilitar S3 Transfer Acceleration en el bucket y generar URL prefirmadas para clientes de pago  
B) Usar CloudFront con el bucket de S3 como origen, habilitar el Control de Acceso al Origen y usar URL firmadas de CloudFront para clientes de pago  
C) Crear un bucket de S3 en cada región de AWS y usar el enrutamiento de geolocalización de Route 53 para dirigir a los clientes al bucket más cercano  
D) Usar un Application Load Balancer en cada región con instancias de EC2 que sirvan los archivos de instalación

**Pista 1**: El requisito es mejorar el rendimiento global *sin* replicar el bucket. ¿Qué opción no requiere múltiples buckets?

**Pista 2**: ¿Qué servicio controla específicamente quién puede acceder al contenido servido a través de CloudFront?

**Pista 3**: S3 Transfer Acceleration está optimizado para cargas de larga distancia *hacia* S3. Para distribuir contenido *desde* S3 a usuarios globales, CloudFront es la herramienta adecuada.

**Respuesta**: B

**Explicación**: CloudFront almacena en caché los archivos de instalación en ubicaciones de borde globalmente después de la primera descarga. Las descargas posteriores desde la misma región provienen del borde, mucho más rápidas que cruzar el Pacífico desde S3 en us-west-2. El Control de Acceso al Origen garantiza que el bucket de S3 solo sea accesible a través de CloudFront. Las URL firmadas restringen el acceso a los clientes de pago.

**¿Por qué no A?** S3 Transfer Acceleration está optimizado para cargas de larga distancia *hacia* S3, no para distribuir contenido *desde* S3 a una audiencia global. Para eso, CloudFront es la herramienta correcta. Las URL prefirmadas controlan el acceso pero no mejoran el rendimiento global.

**¿Por qué no C?** Crear un bucket de S3 por región funciona para el rendimiento, pero contradice el requisito de evitar la replicación. También requiere una estrategia de sincronización de datos entre buckets.

**¿Por qué no D?** Las instancias de EC2 detrás de un balanceador de carga en cada región son significativamente más costosas que CloudFront y requieren gestionar servidores en múltiples regiones.

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento — Tarea 3.4*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus quiere agregar contenido de video: breves videos tutoriales de cocina de restaurantes asociados. Los videos pueden pesar entre 50 y 500 MB. Esperan que el mismo video sea visto por miles de usuarios en la misma ciudad pocas horas después de su publicación.

Diseña la arquitectura de almacenamiento y distribución. ¿Usarías S3 y CloudFront? ¿Cómo manejarías la primera solicitud (arranque en frío) para minimizar el retraso antes de que el video quede en caché? ¿Qué TTL de caché establecerías para un video que no cambiará después de publicarse?

*(No existe una única respuesta correcta. El objetivo es practicar las decisiones de diseño de CDN.)*

## Escena Post-Créditos

«Ya lo desplegué — oh.» Leo había apuntado la distribución de CloudFront al origen equivocado — el bucket de S3 de desarrollo en lugar del de producción. Durante unos cuatro minutos, algunos usuarios de la Costa Oeste habían visto una versión antigua de la app. Había corregido la configuración del origen, invalidado la caché y actualizado discretamente el registro de incidentes.

Priya observó las métricas de CloudFront después del despliegue.

Tasa de cache hit: 83%.

«¿Qué significa eso?» preguntó Tom.

«Significa que el 83% de nuestros usuarios obtiene contenido desde una ubicación de borde cercana a ellos, no desde us-west-2.»

«¿Y el otro 17%?»

«Primeras solicitudes. Contenido que todavía no está en caché en esa ubicación de borde.»

Tom miró las métricas fijamente. «Entonces estamos sirviendo casi un millón de solicitudes al día desde los nodos de borde de CloudFront. Y solo 170.000 de esas realmente llegan a nuestros servidores.»

«Sí.»

«Entonces si no tuviéramos CloudFront, nuestros servidores estarían manejando un millón de solicitudes.»

«A 140-160 milisegundos cada una, para usuarios globales.»

Tom se recostó en su silla. Tenía una expresión que Maya reconoció: la de alguien que recalcula el coste en tiempo real.

«Vale la pena», dijo.

Maya ya estaba en su portátil. «Dos nuevos ingenieros se unen la próxima semana. Soo-Jin, del equipo de plataforma de su última empresa, y Rafael, que se especializó en seguridad. Quiero que estén al día con IAM antes de su primer día.»

«¿IAM avanzado?» preguntó Leo.

«Roles, políticas, acceso entre cuentas. El material de verdad.»

En el próximo capítulo: los permisos detallados que permiten que una parte del sistema hable con otra, de forma segura.
