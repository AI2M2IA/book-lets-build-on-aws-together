# Capítulo 13: Rápido en Todas Partes

Una foto que viaja desde un servidor en Virginia hasta un teléfono en Seattle recorre aproximadamente 4.400 kilómetros de cable de fibra óptica. A dos tercios de la velocidad de la luz, eso representa unos 25 milisegundos de pura física: inevitables, no negociables, grabados en las leyes del universo.

Luego hay que sumar el viaje de ida y vuelta. Luego el tiempo de procesamiento. El navegador todavía no ha empezado a renderizar y ya han pasado 80 milisegundos.

`eatnimbus.com` estaba en producción. Leo había revisado las métricas de latencia de los usuarios de la Costa Oeste: 80-100 milisegundos por solicitud. Puede parecer poco, pero se acumula.

Cargar el menú: 90ms. Cargar la lista de restaurantes: 80ms. Cargar las fotos del restaurante: 200ms (las imágenes son grandes). Tiempo total antes de que un usuario pueda realizar un pedido: más de medio segundo con una buena conexión.

"El problema es la física", dijo Leo. "Los servidores están en Virginia. Los usuarios están en la Costa Oeste."

"Entonces muda los servidores a la Costa Oeste", dijo Tom.

"Eso cuesta dinero."

"¿Cuánto?"

"Mucho. Y crea un problema completamente nuevo: mantener sincronizadas la base de datos de la Costa Este y la de la Costa Oeste."

Priya levantó la vista de su portátil. "O no movemos los servidores. Movemos el *contenido*."

**La Analogía del Almacén Pre-Abastecido**

Imagina Amazon como minorista, no como empresa de nube. Tienen un almacén enorme en un solo lugar con todos los productos. Si enviaran cada pedido desde ese único almacén, los clientes en ciudades lejanas esperarían días.

En cambio, Amazon tiene centros de distribución cerca de los principales centros de población. Cuando un producto es popular, pre-abastecen esos almacenes locales. Cuando un cliente en Seattle pide un libro, se envía desde el centro de distribución local, no desde Virginia.

Esto es una **Red de Distribución de Contenido (CDN)**: una red de servidores distribuidos geográficamente que almacenan en caché copias de tu contenido cerca de tus usuarios.

Cuando un usuario en Seattle solicita tu página de inicio, la CDN la sirve desde un servidor en Seattle. No desde Virginia. La solicitud nunca atraviesa el país.

**Conoce CloudFront**

Amazon CloudFront es la CDN de AWS. Opera a través de una red global de **ubicaciones de borde** — servidores de caché situados en ciudades de todo el mundo. Al momento de escribir esto, hay más de 500 ubicaciones de borde en más de 90 ciudades.

Cuando configuras CloudFront, especificas un **origen**: la fuente de tu contenido real. Tu origen puede ser:

- Un bucket de S3 (archivos estáticos: imágenes, CSS, JavaScript, PDFs)
- Un Application Load Balancer (contenido dinámico de tu aplicación)
- Una instancia de EC2
- Un servidor HTTP en cualquier lugar de internet

CloudFront se sitúa frente a tu origen. Las solicitudes llegan a la ubicación de borde más cercana. Si el borde tiene el contenido en caché, lo devuelve de inmediato. Si no (un *cache miss*), lo obtiene de tu origen, lo almacena en caché y lo devuelve.

**Cómo Funciona el Almacenamiento en Caché de CloudFront**

La primera solicitud de cualquier contenido siempre es un cache miss: va al origen. Todas las solicitudes posteriores llegan al caché en la ubicación de borde.

Para Nimbus, las fotos del menú son candidatos perfectos para CloudFront. Las fotos de restaurantes cambian con poca frecuencia (quizás cuando el restaurante actualiza su perfil). Con CloudFront:

1. Un usuario en Seattle solicita `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront consulta la ubicación de borde en Seattle — todavía no está en caché (cache miss)
3. CloudFront obtiene desde S3 en us-east-1 (~80ms)
4. CloudFront almacena la foto en la ubicación de borde de Seattle
5. El siguiente usuario en Seattle solicita la misma foto
6. CloudFront la sirve desde el caché de borde local (~5ms)

La misma penalización de 80ms para la primera solicitud. Pero la milésima solicitud desde la misma ciudad tarda 5 milisegundos.

Los **encabezados Cache-Control** y las **configuraciones de TTL** en CloudFront determinan cuánto tiempo permanece el contenido en caché en el borde. Los archivos de imagen pueden almacenarse en caché durante horas o días. Las páginas HTML (que cambian con mayor frecuencia) pueden almacenarse en caché durante minutos o segundos.

**Contenido Dinámico: CloudFront para Más que Solo Caché**

"¿Pero qué pasa con las respuestas de nuestra API?", preguntó Leo. "Son dinámicas: cambian por usuario, por solicitud. No se puede poner en caché un historial de pedidos."

Cierto. Pero CloudFront sigue siendo útil para el contenido dinámico.

Incluso cuando el contenido no puede almacenarse en caché, CloudFront enruta la solicitud desde la ubicación de borde hasta el origen a través de la red troncal privada de AWS: la fibra de alta velocidad que conecta la infraestructura de AWS globalmente. Esto es más rápido y fiable que enrutar por internet público, donde el tráfico puede rebotar a través de múltiples operadores.

El resultado: las solicitudes dinámicas siguen siendo un 20-40% más rápidas a través de CloudFront que yendo directamente al origen por internet público. No por el almacenamiento en caché, sino por la ruta de red.

Además, CloudFront proporciona:

**Terminación SSL/TLS**: CloudFront gestiona HTTPS en el borde. La conexión entre el usuario y CloudFront está cifrada. CloudFront puede conectarse a tu origen a través de HTTP internamente (reduciendo la carga del origen) o HTTPS (para cifrado de extremo a extremo).

**Protección DDoS**: CloudFront está integrado con AWS Shield Standard. El tráfico distribuido entre cientos de ubicaciones de borde significa que los ataques se absorben en el borde en lugar de golpear directamente tu origen.

**Restricción geográfica**: Bloquea el acceso desde países específicos. Si Nimbus solo tiene licencia para operar en ciertos mercados, CloudFront puede aplicarlo en el borde sin que la solicitud llegue jamás a tus servidores.

**Comportamientos de CloudFront: Reglas de Caché Detalladas**

Una distribución de CloudFront puede tener múltiples **comportamientos** — reglas de enrutamiento basadas en patrones de URL.

Para Nimbus:

- `/images/*` → Almacenar en caché en el borde durante 7 días (las fotos no cambian con frecuencia)
- `/static/*` → Almacenar en caché en el borde durante 30 días (CSS y JavaScript con nombres de archivo versionados)
- `/api/*` → No almacenar en caché; reenviar directamente al balanceador de carga
- `/*` → Almacenar en caché durante 5 minutos (páginas HTML)

Esto permite que CloudFront sea inteligente: almacena agresivamente en caché lo que es estable y deja pasar lo que es dinámico.

**Control de Acceso al Origen: Proteger S3 con CloudFront**

Si tu bucket de S3 contiene contenido privado que solo debe servirse a través de CloudFront (no directamente), puedes usar el **Control de Acceso al Origen (OAC)** para garantizar que S3 rechace las solicitudes que no provengan de CloudFront.

De esta manera:

- `d1234abcd.cloudfront.net/image.jpg` Se sirve (CloudFront tiene permiso)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Bloqueado (acceso directo a S3 denegado)

Tu contenido solo es accesible a través de tu distribución, con tus reglas de caché y configuraciones de seguridad aplicadas.

## Fortalezas y Limitaciones

**Por qué CloudFront es poderoso**:

- Ubicaciones de borde en más de 90 ciudades — la mayoría de los usuarios obtiene contenido a menos de 20ms de distancia
- Contenido estático servido en milisegundos de un solo dígito después del primer caché
- Reduce significativamente la carga del origen (el tráfico repetido nunca llega a tus servidores)
- Integrado con AWS Shield, WAF y Certificate Manager
- No se necesita planificación de capacidad: CloudFront escala automáticamente

**Donde se complica**:

- El contenido en caché puede quedar desactualizado: la invalidación de caché tiene un costo ($0.005 por 1.000 rutas)
- Los encabezados Cache-Control deben configurarse correctamente en el origen: los errores provocan contenido obsoleto
- El contenido dinámico se beneficia de la optimización del enrutamiento, pero no del almacenamiento en caché
- Depurar el comportamiento del caché (qué está en caché, dónde y por cuánto tiempo) requiere entender múltiples capas: encabezados del origen, configuraciones de TTL de CloudFront, reglas de comportamiento
- La transferencia de datos salientes a través de CloudFront tiene un costo, aunque menor que la transferencia de datos estándar

## Resumen

- Una **CDN** almacena en caché copias de tu contenido en ubicaciones de borde cerca de tus usuarios, reduciendo la latencia y la carga del origen.
- **CloudFront** es la CDN de AWS, con más de 500 ubicaciones de borde en todo el mundo.
- Los cache misses obtienen desde el **origen** (S3, ALB, EC2). Los cache hits se sirven desde el borde: milisegundos, no cientos de milisegundos.
- Los **comportamientos** permiten establecer diferentes reglas de caché para diferentes patrones de URL.
- El contenido dinámico no se almacena en caché, pero CloudFront sigue mejorando el rendimiento a través de la red troncal privada de AWS.
- El **Control de Acceso al Origen** restringe el acceso directo a S3: el contenido solo se sirve a través de CloudFront.
- Integrado con Shield (DDoS), WAF (firewall de aplicaciones) y ACM (certificados SSL).

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.4)*

- **CloudFront + S3**: Patrón clásico del examen para servir sitios web estáticos globalmente. Bucket de S3 como origen, CloudFront como CDN, Control de Acceso al Origen para evitar el acceso directo a S3.
- **Ubicaciones de borde vs Regiones vs AZs**: Las ubicaciones de borde son más numerosas y existen únicamente para propósitos de caché/CDN. No son lo mismo que las AZs (que ejecutan tu cómputo).
- **Invalidación de caché**: Crea una invalidación `/images/*` para forzar a CloudFront a obtener contenido actualizado. Tiene un costo: la alternativa rentable del examen son las URL versionadas (`image-v2.jpg` en lugar de `image.jpg`), que naturalmente evitan el caché.
- **Control de TTL**: `Cache-Control: max-age=3600` en el origen establece un TTL de caché de 1 hora. CloudFront respeta estos encabezados.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions se ejecutan en el borde para la manipulación liviana de solicitudes/respuestas (submilisegundos). Lambda@Edge ejecuta tu código Lambda en ubicaciones de borde para un procesamiento más pesado. El examen los distingue según la complejidad del caso de uso.
- **URL firmadas y Cookies firmadas**: Controlan quién puede acceder al contenido a través de CloudFront. Las URL firmadas dan acceso a archivos específicos; las cookies firmadas dan acceso a múltiples archivos. El examen las usa para "contenido de suscriptores de pago."

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre un cache hit y un cache miss en CloudFront. ¿Qué ocurre en cada caso?

*(Pista: Piensa en de dónde proviene el contenido y cómo difiere el tiempo de respuesta entre los dos casos.)*

**Ejercicio 2 — Práctica para el Examen**

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

**Explicación**: CloudFront almacena en caché los archivos de instalación en ubicaciones de borde globalmente después de la primera descarga. Las descargas posteriores desde la misma región provienen del borde, mucho más rápidas que cruzar el Pacífico desde S3 en us-east-1. El Control de Acceso al Origen garantiza que el bucket de S3 solo sea accesible a través de CloudFront. Las URL firmadas restringen el acceso a los clientes de pago.

**¿Por qué no A?** S3 Transfer Acceleration está optimizado para cargas de larga distancia *hacia* S3, no para distribuir contenido *desde* S3 a una audiencia global. Para eso, CloudFront es la herramienta correcta. Las URL prefirmadas controlan el acceso pero no mejoran el rendimiento global.

**¿Por qué no C?** Crear un bucket de S3 por región funciona para el rendimiento, pero contradice el requisito de evitar la replicación. También requiere una estrategia de sincronización de datos entre buckets.

**¿Por qué no D?** Las instancias de EC2 detrás de un balanceador de carga en cada región son significativamente más costosas que CloudFront y requieren gestionar servidores en múltiples regiones.

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento — Tarea 3.4*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus quiere agregar contenido de video: breves videos tutoriales de cocina de restaurantes asociados. Los videos pueden pesar entre 50 y 500 MB. Esperan que el mismo video sea visto por miles de usuarios en la misma ciudad pocas horas después de su publicación.

Diseña la arquitectura de almacenamiento y distribución. ¿Usarías S3 y CloudFront? ¿Cómo manejarías la primera solicitud (arranque en frío) para minimizar el retraso antes de que el video quede en caché? ¿Qué TTL de caché establecerías para un video que no cambiará después de publicarse?

*(No existe una única respuesta correcta. El objetivo es practicar las decisiones de diseño de CDN.)*

## Escena Post-Créditos

Priya observó las métricas de CloudFront después del despliegue.

Tasa de cache hit: 83%.

"¿Qué significa eso?", preguntó Tom.

"Significa que el 83% de nuestros usuarios obtiene contenido desde una ubicación de borde cercana a ellos, no desde us-east-1."

"¿Y el otro 17%?"

"Primeras solicitudes. Contenido que todavía no está en caché en esa ubicación de borde."

Tom miró las métricas fijamente. "Entonces estamos sirviendo casi un millón de solicitudes al día desde los nodos de borde de CloudFront. Y solo 170.000 de esas realmente llegan a nuestros servidores."

"Sí."

"Entonces si no tuviéramos CloudFront, nuestros servidores estarían manejando un millón de solicitudes."

"A 140-160 milisegundos cada una, para usuarios globales."

Tom se recostó en su silla. Tenía una expresión que Maya reconoció: la de alguien que recalcula el costo en tiempo real.

"Vale la pena", dijo.

Maya ya estaba en su portátil. "Dos nuevos ingenieros se unen la próxima semana. Soo-Jin, del equipo de plataforma de su última empresa, y Rafael, que se especializó en seguridad. Quiero que estén al día con IAM antes de su primer día."

"¿IAM avanzado?", preguntó Leo.

"Roles, políticas, acceso entre cuentas. El material de verdad."

En el próximo capítulo: los permisos detallados que permiten que una parte del sistema hable con otra, de forma segura.
