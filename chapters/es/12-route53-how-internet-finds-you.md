# Capítulo 12: Cómo Te Encuentra Internet

Nimbus estaba funcionando. El balanceador de carga tenía una IP pública. Las instancias EC2 tenían una IP privada. Las bases de datos estaban bloqueadas en subredes privadas. Priya había asentido aprobadoramente ante el diagrama de red.

Tom miraba la URL del balanceador de carga: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

«¿Eso es lo que escriben los clientes en su navegador?» preguntó.

«Eso es lo que AWS asigna automáticamente», dijo Maya.

«No voy a poner eso en una tarjeta de visita.»

«Yo tampoco.»

Necesitaban un nombre de dominio. Compraron `eatnimbus.com` en un registrador de dominios. Ahora necesitaban conectar ese nombre a su infraestructura de AWS.

«¿Cómo sabe internet que `eatnimbus.com` significa el balanceador de carga en us-east-1?» preguntó Leo.

Buena pregunta, Leo.

**La Analogía de la Guía Telefónica**

Antes de los smartphones, cada ciudad tenía una guía telefónica. Si querías llegar a «La Pizzería de Mario», no memorizabas su número de teléfono — buscabas el nombre, obtenías el número y llamabas.

Internet tiene su propia guía telefónica: el **Sistema de Nombres de Dominio (DNS)**.

DNS traduce nombres legibles por humanos (como `eatnimbus.com`) en direcciones IP legibles por máquinas (como `203.0.113.42`). Cada vez que visitas un sitio web, tu ordenador busca silenciosamente el nombre de dominio en DNS y obtiene la dirección IP a la que conectarse.

Si cambiabas la dirección IP de tu servidor, actualizabas el registro DNS — como cambiar tu número en la guía telefónica — e internet te encontraría en tu nueva ubicación.

**Conoce Route 53**

Amazon Route 53 es el servicio DNS gestionado de AWS. Se llama Route 53 porque el puerto 53 es el puerto DNS estándar. (A veces AWS nombra las cosas de forma directa.)

Route 53 hace varias cosas:

**Registro de dominios**: Puedes comprar nombres de dominio directamente a través de Route 53.

**Alojamiento DNS (zonas alojadas)**: Creas una *zona alojada* para tu dominio y Route 53 gestiona los registros DNS que le dicen al mundo dónde encontrarte.

**Comprobaciones de salud**: Route 53 puede monitorear tus endpoints y enrutar el tráfico lejos de los que no están sanos.

**Políticas de enrutamiento de tráfico**: Route 53 admite múltiples estrategias de enrutamiento más allá del DNS simple — ponderado, basado en latencia, geolocalización, failover.

**Registros DNS: Las Entradas de la Guía Telefónica**

Un registro DNS mapea un nombre a un destino. Los tipos más comunes:

**Registro A**: Mapea un nombre a una dirección IPv4.
`eatnimbus.com → 203.0.113.42`

**Registro AAAA**: Mapea un nombre a una dirección IPv6.

**Registro CNAME**: Mapea un nombre a otro nombre (un alias).
`www.eatnimbus.com → eatnimbus.com`

**Registro MX**: Especifica qué servidores gestionan el correo electrónico para el dominio.

**Registro TXT**: Almacena texto arbitrario. Comúnmente se usa para verificación de dominio (demostrar que eres el propietario del dominio) y autenticación de correo electrónico (SPF, DKIM).

Para Nimbus, la configuración principal:

- `eatnimbus.com` → Registro A apuntando a la IP del balanceador de carga
- `www.eatnimbus.com` → CNAME apuntando a `eatnimbus.com`
- `api.eatnimbus.com` → Registro A apuntando al balanceador de carga de la API

«Espera», dijo Tom. «La IP del balanceador de carga puede cambiar. AWS lo dijo en la documentación.»

Buena observación, Tom.

**Registros Alias: La Solución de AWS a las IP Dinámicas**

Los balanceadores de carga, las distribuciones de CloudFront y los sitios web de S3 tienen nombres DNS, no direcciones IP estáticas. Las IP subyacentes pueden cambiar.

Si creas un CNAME apuntando al nombre DNS de un balanceador de carga, funciona — pero no puedes usar CNAMEs para dominios raíz (`eatnimbus.com` sin el `www`) debido a los estándares DNS.

Route 53 resuelve esto con los **registros Alias** — una extensión específica de AWS al DNS. Un registro Alias mapea un nombre directamente a un recurso de AWS (balanceador de carga, distribución de CloudFront, sitio web de S3) y Route 53 gestiona automáticamente la resolución de IP dinámica. Los registros Alias se pueden usar a nivel del dominio raíz. Y a diferencia de las consultas DNS regulares a servicios externos, las consultas de registros Alias a recursos de AWS son gratuitas.

«Entonces usamos un registro Alias para `eatnimbus.com` apuntando al balanceador de carga», confirmó Leo.

«Y Route 53 maneja cualquier IP que esté usando el balanceador de carga en un momento dado», añadió Priya.

«Gratis», dijo Tom, de repente muy interesado.

**Políticas de Enrutamiento: Más que Solo «¿Dónde Está?»**

Aquí es donde Route 53 se pone interesante. El DNS no es solo un servicio de búsqueda — puede ser una herramienta de gestión de tráfico.

**Enrutamiento simple**: Un registro, un destino. DNS estándar.

**Enrutamiento ponderado**: Divide el tráfico entre múltiples destinos por peso. Envía el 90% al nuevo servidor y el 10% al antiguo durante una migración. Ajusta los pesos hasta que tengas confianza en el nuevo servidor y luego cambia al 100%.

**Enrutamiento basado en latencia**: Enruta a los usuarios a la Región de AWS con la menor latencia para ellos. Un usuario en Seattle es enrutado a `us-west-2`. Un usuario en Tokio es enrutado a `ap-northeast-1`. El mismo nombre de dominio, destinos diferentes.

**Enrutamiento por geolocalización**: Enruta según la ubicación geográfica del usuario. Todos los usuarios europeos van a `eu-west-1`. Todos los usuarios norteamericanos van a `us-east-1`. Útil para la soberanía de datos (mantener los datos de usuarios de la UE en Regiones de la UE) o la personalización de contenido (idioma, moneda).

**Enrutamiento por failover**: Designa un endpoint primario y uno secundario. Si el primario falla la comprobación de salud de Route 53, el tráfico se redirige automáticamente al secundario. Esta es la capa DNS de la recuperación ante desastres.

**Enrutamiento de respuesta multivalor**: Devuelve hasta ocho direcciones IP sanas para una consulta, permitiendo al cliente elegir. Una alternativa simple a un balanceador de carga para distribuir tráfico entre múltiples servidores.

«Entonces Route 53 no es solo una guía telefónica», dijo Maya. «Es una guía telefónica inteligente que puede enrutar llamadas según desde dónde llamas.»

«Y desconectarte si el número no está sano», añadió Priya.

**Comprobaciones de Salud: Enrutar Alrededor de los Fallos**

Route 53 puede monitorear tus endpoints con comprobaciones de salud. Si un endpoint falla, Route 53 puede:

- Eliminarlo de las respuestas DNS (dejar de enviar tráfico allí)
- Activar un failover a un endpoint de respaldo
- Enviar una alerta a través de CloudWatch

Las comprobaciones de salud son el vínculo entre el enrutamiento DNS y la salud real de la aplicación. En una configuración de failover: Route 53 monitorea el endpoint primario cada 30 segundos. Si tres comprobaciones consecutivas fallan, Route 53 empieza a devolver la dirección del endpoint secundario.

Esto no es instantáneo — el DNS tiene un tiempo de propagación. Una vez que Route 53 cambia un registro DNS, los resolvers DNS de todo el mundo necesitan recibir el cambio, lo que puede tardar de segundos a minutos dependiendo de los ajustes de TTL.

**TTL: La Caché del DNS**

Las respuestas DNS se almacenan en caché en múltiples niveles — en tu router, en tu ISP, en tu navegador. El **TTL (Time-To-Live)** en un registro DNS indica a las cachés cuánto tiempo recordar la respuesta antes de volver a comprobarlo.

TTL alto (1 hora o más): Menos consultas DNS, menos carga en Route 53, pero los cambios tardan más en propagarse.

TTL bajo (60 segundos o menos): Los cambios se propagan rápidamente, pero se necesitan más consultas DNS.

Antes de una migración planificada (actualizar DNS para apuntar a un nuevo servidor), baja tu TTL a 60 segundos con un día de antelación. Entonces cuando hagas el cambio, se propagará en aproximadamente un minuto. Después de la migración, súbelo de vuelta al valor normal.

«Si solo lo bajamos durante la migración y no antes», dijo Leo lentamente, «el TTL antiguo significa que algunos usuarios verán el servidor antiguo durante una hora.»

«Exactamente», dijo Priya. «Las migraciones de DNS requieren planificación antes de la migración, no solo durante.»

## Fortalezas y Limitaciones

**Route 53 es la elección correcta para**: registrar y gestionar nombres de dominio completamente dentro de AWS; enrutar tráfico basándose en latencia, geolocalización o distribución ponderada en múltiples endpoints; failover basado en comprobaciones de salud entre Regiones o entre un endpoint primario y uno de recuperación ante desastres; integrar DNS con otros servicios de AWS a través de registros Alias.

**Cuándo Route 53 no es lo que necesitas**: Route 53 es un servicio DNS, no un balanceador de carga. Si necesitas distribuir tráfico entre múltiples servidores o contenedores dentro de una Región, usa un Application Load Balancer — Route 53 no puede hacer round-robin ponderado a nivel de conexión como lo puede hacer un balanceador de carga. El enrutamiento basado en latencia entre Regiones añade coste y complejidad operativa que solo tiene sentido cuando tus usuarios están genuinamente distribuidos globalmente y los milisegundos importan para la conversión. Para la mayoría de las aplicaciones de una sola Región, un único registro A apuntando a un ALB es toda la configuración de Route 53 que necesitas.

## Resumen

- **DNS** traduce nombres de dominio en direcciones IP — la guía telefónica de internet.
- **Route 53** es el servicio DNS gestionado de AWS: registro de dominios, alojamiento DNS, comprobaciones de salud y políticas de enrutamiento.
- Los **registros A** mapean nombres a direcciones IPv4. Los **CNAME** mapean nombres a otros nombres. Los **registros Alias** mapean nombres a recursos de AWS (balanceadores de carga, CloudFront, S3).
- Usa registros Alias (no CNAME) para dominios raíz y para recursos con IPs dinámicas.
- Las políticas de enrutamiento van más allá del DNS simple: **ponderado** (división de tráfico), **basado en latencia** (rendimiento), **geolocalización** (soberanía de datos), **failover** (recuperación ante desastres).
- Las **comprobaciones de salud** monitorizan los endpoints y eliminan automáticamente los objetivos no sanos de las respuestas DNS.
- Planifica los cambios de TTL antes de las migraciones — baja el TTL con antelación para que los cambios se propaguen rápidamente.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.4)*

- **Alias vs CNAME**: Los registros Alias se pueden usar en el dominio raíz; los CNAME no. Las consultas DNS de registros Alias a recursos de AWS son gratuitas; las consultas CNAME tienen precio. Cuando el examen pregunte sobre mapear un dominio raíz a un balanceador de carga → registro Alias.
- **Casos de uso de políticas de enrutamiento** (escenarios comunes del examen):
  - «Migrar gradualmente el tráfico a una nueva versión» → Enrutamiento ponderado
  - «Enrutar usuarios a la Región de AWS más cercana» → Enrutamiento basado en latencia
  - «Mantener los datos de usuarios de la UE en Regiones de la UE» → Enrutamiento por geolocalización
  - «Failover automático de DNS cuando el primario cae» → Enrutamiento por failover con comprobaciones de salud
- **Comprobaciones de salud de Route 53**: Pueden comprobar endpoints HTTP/HTTPS/TCP y pueden activar alarmas de CloudWatch. El examen los usa en escenarios de recuperación ante desastres.
- **TTL y propagación**: Sabe que el TTL controla cuánto tiempo almacenan en caché los resolvers DNS un registro. TTL corto = cambios más rápidos. Escenario del examen: «el equipo actualizó el DNS pero los usuarios siguen llegando al servidor antiguo» → TTL demasiado alto.
- **Zonas alojadas privadas**: Route 53 puede crear registros DNS que solo se resuelven dentro de una VPC. El examen usa esto para el descubrimiento de servicios internos (p. ej., `database.internal` resolviendo a un endpoint privado de RDS).
- Route 53 es **global** — no se despliega en una Región. No es necesaria la selección de Región al crear zonas alojadas.

## Ejercicios

**Ejercicio 1 — Recordar**

Explica la diferencia entre un registro CNAME y un registro Alias. ¿Cuándo usarías cada uno?

*(Pista: Considera las restricciones de CNAME en los dominios raíz y el comportamiento de los registros Alias con los recursos dinámicos de AWS.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa de medios opera un sitio web desde dos Regiones de AWS: `us-east-1` (primaria) y `eu-west-1` (secundaria). El equipo quiere que el tráfico se enrute automáticamente a `eu-west-1` si la Región primaria no está disponible. La empresa también quiere verificar que este mecanismo de failover funciona correctamente sin tener que cerrar realmente la Región primaria.

¿Qué configuración de Route 53 satisface MEJOR estos requisitos?

A) Enrutamiento ponderado con 100% de peso en `us-east-1` y 0% en `eu-west-1`  
B) Enrutamiento basado en latencia con comprobaciones de salud en ambos endpoints  
C) Enrutamiento por failover con una comprobación de salud en el endpoint primario y un registro secundario apuntando a `eu-west-1`  
D) Enrutamiento por geolocalización con Norteamérica apuntando a `us-east-1` y Europa apuntando a `eu-west-1`

**Pista 1**: El requisito es el failover automático cuando el primario cae. ¿Qué política de enrutamiento está diseñada exactamente para esto?

**Pista 2**: «Probar sin cerrar la Región primaria» — las comprobaciones de salud se pueden configurar manualmente como «no sano» para pruebas.

**Pista 3**: El enrutamiento basado en latencia optimiza la velocidad, no el failover.

**Respuesta**: C

**Explicación**: El enrutamiento por failover está diseñado exactamente para este caso de uso. El registro primario apunta a `us-east-1` con una comprobación de salud. El registro secundario apunta a `eu-west-1`. Si la comprobación de salud falla, Route 53 sirve automáticamente el registro secundario. Las comprobaciones de salud se pueden forzar manualmente a fallar para pruebas sin interrumpir realmente la Región primaria.

**¿Por qué no A?** El enrutamiento ponderado con 100%/0% es efectivamente estático — no cambia automáticamente cuando falla el primario.

**¿Por qué no B?** El enrutamiento basado en latencia elige el endpoint más rápido para cada usuario. No excluye automáticamente una Región basándose en la salud — todavía enrutaría algo de tráfico a un `us-east-1` no sano si la latencia lo favorece.

**¿Por qué no D?** El enrutamiento por geolocalización enruta según la ubicación del usuario, no según la salud del endpoint. Los usuarios europeos estarían atrapados en `eu-west-1` incluso si `us-east-1` está sano, y los usuarios norteamericanos no harían failover a `eu-west-1` incluso si `us-east-1` cae.

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento — Tarea 3.4*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus se está expandiendo internacionalmente. Quieren que `eatnimbus.com` cargue rápidamente para usuarios en la Costa Oeste, la Costa Este y Australia. También tienen un requisito regulatorio: los pedidos realizados por usuarios europeos deben ser procesados por servidores en la UE.

Diseña una estrategia de enrutamiento de Route 53 que aborde ambos requisitos. ¿Qué política de enrutamiento o combinación de políticas usarías? ¿Qué infraestructura en cada Región necesitarías?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de enrutamiento multi-Región.)*

## Escena Post-Créditos

`eatnimbus.com` estaba en vivo.

Maya lo había escrito en su navegador y la página de pedidos de Nimbus había cargado. Había pedido arepa del restaurante de su propia familia, solo para probar el flujo. El pedido había llegado. La cocina lo había recibido.

Se recostó en su silla.

Tom ya estaba leyendo los registros de comprobaciones de salud de Route 53. «El tiempo de respuesta es de 47 milisegundos desde us-east-1.»

«¿Es eso rápido?» preguntó Maya.

«¿Para DNS? Sí.»

«¿Pero para un usuario en Seattle?»

Tom miró el gráfico de latencia. «Unos 80 milisegundos.»

Maya pensó en eso. «Si la mayoría de nuestros clientes están en la Costa Oeste y nuestros servidores están en Virginia...»

«Cada solicitud viaja de Seattle a Virginia y vuelta», dijo Leo desde el otro lado de la sala. «Velocidad de la luz. No puedes vencer a la física.»

«Entonces necesitamos servidores más cerca de Seattle.»

«O algo más cerca de Seattle que sirva contenido en su nombre.»

Ese pensamiento quedó flotando en el aire.

En el próximo capítulo: los almacenes que ponen el contenido de Nimbus a un milisegundo de cada usuario, en todas partes.
