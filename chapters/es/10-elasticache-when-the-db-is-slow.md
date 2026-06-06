# Capítulo 10: Cuando la Base de Datos Es Demasiado Lenta

Las métricas de carga de página estaban abiertas en la pantalla. Leo llevaba veinte minutos mirándolas sin decir nada.

Cuarenta y siete solicitudes a DynamoDB por carga de página. Ciento ochenta y ocho milisegundos solo para recuperar los datos — antes de que el navegador renderizara un solo píxel.

Había hecho los cálculos. Diez mil usuarios simultáneos un viernes por la noche, cada uno cargando la página de exploración aproximadamente una vez por minuto: cuatrocientas setenta mil lecturas de DynamoDB por minuto. El coste era real. Pero la latencia era el problema real. Un usuario que abría la página de exploración de Nimbus esperaba casi doscientos milisegundos antes de que apareciera nada — y eso era en una conexión rápida.

---

*La semana anterior, el rediseño del esquema de DynamoDB había funcionado. La tabla del menú ahora era flexible — cualquier restaurante podía añadir cualquier modificador, cualquier estructura de combo, cualquier variación estacional. El rendimiento en las búsquedas individuales era excelente. Pero búsquedas individuales excelentes, multiplicadas por cuarenta y siete por página, seguían sumando páginas lentas. El problema de DynamoDB estaba resuelto. Un nuevo problema había ocupado su lugar.*

---

«La base de datos está respondiendo en cuatro milisegundos por solicitud», dijo Leo. «Eso es realmente rápido. DynamoDB está haciendo su trabajo.»

«¿Entonces por qué la página es lenta?» preguntó Maya.

«Porque la estamos llamando cuarenta y siete veces por carga de página», dijo Priya. «El problema no es la base de datos. El problema es que hablamos con ella demasiado.»

Tom se inclinó hacia adelante. Tenía la mirada que ponía cuando un problema estaba a punto de convertirse en una conversación sobre costes. «¿Entonces la solución es hablar con ella menos?»

«Hablar con ella menos. Recordar más.»

---

**El Primer Intento Equivocado**

El primer instinto de Leo fue almacenar en caché los datos por usuario. Cada usuario tenía una sesión, y la sesión cargaba su perfil: direcciones guardadas, métodos de pago, resumen del historial de pedidos. Quizás almacenar eso en caché aceleraría las cosas.

Lo implementó. Formato de clave de Redis: `user:{userId}:profile`. TTL: diez minutos.

Ejecutó la prueba de carga. La carga de página bajó en seis milisegundos.

«Eso no es mucho», observó Tom.

«No», dijo Leo.

«¿Por qué no?»

Leo miró el gráfico por un momento. «Porque el perfil de usuario es solo una solicitud. Todavía hay cuarenta y seis llamadas a DynamoDB por página. Y esas son las llamadas del menú — una por restaurante en la página de exploración. Almacené en caché lo equivocado.»

Este es un error común en el almacenamiento en caché: optimizar lo que no es el cuello de botella. El perfil de usuario se cargaba en dos milisegundos. Almacenar en caché algo tan rápido no ahorraba casi nada. Los datos del menú — obtenidos cuarenta y siete veces, tardando cuatro milisegundos cada uno — eran el problema real.

«Necesitas almacenar en caché por menú, no por usuario», dijo Priya. «El menú del Restaurante 047 es el mismo para cada usuario que lo explora. Esos son los datos que vale la pena almacenar en caché — son idénticos en miles de solicitudes.»

Las cachés por usuario son valiosas cuando los usuarios tienen un estado personalizado costoso. Las cachés por entidad (menús, catálogos de productos, configuración) son valiosas cuando los mismos datos se sirven a miles de usuarios. Sabe qué problema tienes antes de escribir el código.

Leo rediseñó las claves de caché: `menu:{restaurantId}`. Una entrada de caché por restaurante, compartida por cada usuario que explora ese restaurante.

Ejecutó la prueba de carga de nuevo. La carga de página bajó de 188 milisegundos a 12 milisegundos. Esa era la mejora que habían estado buscando.

---

**La Analogía del Restaurante**

Imagina la cocina de un restaurante. Cada vez que un camarero necesita saber los platos del día, camina hasta la parte de atrás, le pregunta al chef y vuelve a la mesa.

Eso funciona bien si tienes dos camareros y tres mesas.

Ahora imagina doscientos camareros y mil mesas. Todos ellos caminando hacia la parte de atrás para la misma pregunta. La cocina se convierte en el cuello de botella. El chef está respondiendo la misma pregunta cuatrocientas veces por hora.

La solución obvia: escribir los platos del día en una pizarra al frente del restaurante. Cada camarero lee de la pizarra. La cocina descansa. La pizarra se actualiza cuando cambian los platos del día.

Esa pizarra es una caché.

Una caché es un almacén rápido y local de datos recuperados recientemente. En lugar de obtener la misma cosa de una fuente lenta repetidamente, la obtienes una vez y la mantienes cerca.

Hay otra analogía que los ingenieros encuentran útil: el estante de reserva de la biblioteca. Cuando se devuelve un libro popular, el bibliotecario sabe que se solicitará de nuevo pronto, así que lo pone en el estante de reserva cerca del mostrador en lugar de archivarlo en las estanterías. El siguiente usuario no tiene que recorrer toda la biblioteca — lo encuentra justo en el mostrador. El estante de reserva tiene espacio limitado. Si se llena, los libros más antiguos se devuelven a las estanterías para hacer espacio a los más nuevos. Una caché funciona de forma idéntica: los datos a los que se accede con frecuencia permanecen al frente, los datos a los que se accede con poca frecuencia se desalojan para hacer espacio.

**¿Por Qué No Usar Simplemente la Memoria?**

«¿No podemos simplemente almacenar el menú en la memoria de la aplicación?» preguntó Leo.

Pregunta válida.

Puedes hacerlo. Para una aplicación de un solo servidor, el almacenamiento en caché en memoria funciona bien. Pero Nimbus se ejecuta detrás de un balanceador de carga, en múltiples instancias EC2. Si una instancia almacena en caché el menú en su memoria, las otras instancias no tienen esos datos. Cada una mantiene cachés separadas. Cuando el menú se actualiza, tendrías que invalidar todas ellas.

Este es el *problema de coherencia de caché* — mantener múltiples cachés consistentes.

ElastiCache resuelve esto proporcionando una caché *centralizada* que todas tus instancias comparten. En lugar de que cada servidor tenga su propia memoria, todos los servidores leen y escriben en la misma caché. Una actualización se propaga a todos.

**Conoce ElastiCache**

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «¿Por qué un servicio completamente nuevo? ¿Por qué no simplemente añadir más capacidad de base de datos?»

Buena pregunta. La respuesta es que añadir más capacidad de base de datos — instancias más grandes, más réplicas de lectura — no soluciona el problema fundamental. Cada una de esas cuarenta y siete solicitudes por carga de página sigue costando tiempo y dinero, incluso en una base de datos más rápida. Una caché no hace que la base de datos sea más rápida; significa que a la base de datos se le hace la misma pregunta con mucha menos frecuencia. Para datos que se leen repetidamente y cambian con poca frecuencia — como el menú de un restaurante — una caché significa que la base de datos podría responder esa pregunta una vez cada cinco minutos en lugar de cuarenta y siete veces por carga de página.

Amazon ElastiCache es un servicio de caché gestionado. Ejecuta motores de caché populares — Redis y Memcached — sin que tengas que gestionar los servidores.

**Redis** es el más potente de los dos. Admite estructuras de datos complejas (cadenas, listas, conjuntos, hashes, conjuntos ordenados), persistencia (los datos sobreviven a los reinicios), replicación y mensajería pub/sub. Redis puede hacer más que almacenamiento en caché — puede funcionar como un almacén de datos ligero.

**Memcached** es más simple. Caché pura de clave-valor, escalable horizontalmente, sin persistencia. Más rápido para casos de uso simples pero con menos características.

Para Nimbus: Redis. Necesitaban almacenar en caché datos del menú (estructurado), tokens de sesión (clave-valor) y más adelante querrían conjuntos ordenados para las clasificaciones de «restaurantes populares».

**Cómo Funciona el Almacenamiento en Caché en la Práctica**

El patrón básico de almacenamiento en caché se llama **caché-aside** (también llamado lazy loading o carga diferida):

1. La aplicación necesita datos
2. Comprueba primero la caché
3. Si se encuentra (*acierto de caché*): devuelve los datos inmediatamente
4. Si no se encuentra (*fallo de caché*): va a la base de datos, obtiene los datos, los almacena en la caché, los devuelve

En pseudocódigo:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Caché durante 5 minutos
return menuData
```

La primera solicitud siempre llega a la base de datos. Cada solicitud posterior llega a la caché. Con una caché, las cuarenta y siete lecturas de DynamoDB de Nimbus por carga de página se convierten en una o dos búsquedas en caché. Rápidas, baratas y escalables.

**El TTL: ¿Cuánto Tiempo Recuerdas?**

Cada entrada de caché tiene un **Time-To-Live (TTL)** (Tiempo de Vida): la duración después de la cual la entrada expira y la siguiente solicitud vuelve a la base de datos para obtener datos frescos.

Esta es la tensión central del almacenamiento en caché: frescura frente a rendimiento.

- **TTL corto (segundos)**: Datos muy frescos, pero muchos fallos de caché. La caché apenas ayuda.
- **TTL largo (horas o días)**: Muy rápido, pero los datos pueden quedar obsoletos. El cliente ve el menú de ayer.

Para los datos del menú, cinco minutos es razonable. El menú no cambia cada segundo. Si un restaurante actualiza su menú, los clientes podrían ver la versión antigua durante hasta cinco minutos — aceptable.

Para los tokens de sesión (¿está este usuario conectado?), un TTL más corto tiene sentido, o actualizas la caché inmediatamente cuando cambia la sesión.

Para los datos financieros (totales de pedidos, registros de pagos), no los almacenes en caché — o si lo haces, invalida inmediatamente al escribir.

Quizás te estés preguntando: ¿por qué no simplemente añadir más capacidad de base de datos en lugar de introducir una capa de caché completamente nueva? Más réplicas, una instancia más grande — ¿por qué no eso? La respuesta es que la capacidad adicional de la base de datos multiplica tu capacidad para manejar solicitudes simultáneas, pero no reduce el número de solicitudes. Si diez mil usuarios están activando cada uno cuarenta y siete lecturas por carga de página, añadir una segunda réplica de lectura solo significa que cada réplica maneja veintitrés mil solicitudes en lugar de cuarenta y siete mil — el trabajo total no se reduce. Una caché elimina el trabajo redundante por completo: esos diez mil usuarios comparten el mismo resultado en caché.

«Solo hay dos problemas difíciles en informática», citó Leo, con la entrega practicada de alguien que lo había dicho antes. «La invalidación de caché y nombrar cosas.»

«¿Por qué es difícil la invalidación de caché?» preguntó Maya.

«Porque ¿cuándo cambian los datos *realmente*? ¿Cambió el menú porque un socio restaurador lo actualizó? ¿O porque se ejecutó un cron job? ¿O porque un administrador lo editó manualmente? Cada lugar que puede cambiar los datos necesita saber que tiene que avisar a la caché.»

Por eso los ingenieros senior empiezan una conversación sobre caché con «¿cuáles son los caminos de escritura?» en lugar de «añadamos Redis».

---

**La Historia de la Invalidación de Caché**

Descubrieron lo difícil que era la invalidación de caché la primera vez que un socio restaurador se quejó.

El Restaurante 112 — un local colombiano en el Eastside — había actualizado sus precios un jueves por la tarde. Habían subido la arepa de $8 a $9. Llamaron al soporte de Nimbus veinte minutos más tarde.

«Nuestro menú todavía muestra el precio antiguo», dijo el dueño. «Los clientes están haciendo pedidos a $8. Ahora tenemos que respetar ese precio.»

Tom calculó la pérdida mientras Priya rastreaba el error. Cada pedido realizado en esos veinte minutos había cobrado $8. El restaurante había querido $9. Nimbus tendría que absorber la diferencia.

El TTL de cinco minutos debería haber expirado hacía mucho. Habían pasado veinte minutos. Priya sacó el código.

La clave de caché era `menu:restaurant-112`. Se había configurado con un TTL de 300 segundos. Comprobó cuándo se había escrito por última vez.

«Se configuró a las 2:03 PM», dijo. «Hace veintidós minutos.»

«Pero el TTL es de cinco minutos», dijo Leo.

«El TTL es de cinco minutos desde que se almacenó por primera vez. Pero cada solicitud que llegaba a la caché refrescaba el TTL. La entrada de caché estaba siendo tocada cada pocos segundos por las solicitudes entrantes, y el TTL se reiniciaba.»

«Así que nunca expiró.»

«No en esta implementación. Configuramos el TTL en cada lectura de caché. Ventana deslizante. La entrada permanecía viva mientras alguien la golpeara.»

La solución: usar un TTL fijo configurado solo al escribir, nunca extendido al leer. La entrada expira exactamente cinco minutos después de almacenarse, independientemente de cuántas veces se lea. Cuando el restaurante actualizara su menú, la entrada antigua expiraría en cinco minutos y la siguiente solicitud obtendría datos frescos.

«¿Y para los casos en que un restaurante actualiza precios y necesitamos que se refleje inmediatamente?» preguntó Tom.

«Invalidación activa», dijo Priya. «Cuando el portal de socios restauradores envía una actualización, la API llama a `cache.delete('menu:restaurant-112')` antes de devolver. La siguiente solicitud obtiene datos frescos inmediatamente.»

«Pero eso requiere que el portal sepa de la caché.»

«Cada camino de escritura a la base de datos necesita saber de la caché. Eso es lo que Leo dijo antes. Ahora lo hemos vivido.»

«Ya lo desplegué — oh.» Leo había implementado la invalidación en el portal pero había olvidado la interfaz de edición de administración. Dos semanas después, un administrador había actualizado un menú a través del panel interno, y el precio antiguo había persistido en caché durante cinco minutos. Una versión más pequeña del mismo incidente.

Añadieron un manejador de DynamoDB Streams — del capítulo anterior — que invalidaba automáticamente la caché cada vez que un elemento del menú cambiaba, independientemente de qué sistema hubiera activado la escritura. Un manejador, todos los caminos de escritura cubiertos.

---

**Desalojo de Caché: Cuando la Pizarra Se Llena**

La pizarra de los platos tiene espacio limitado. Cuando se llena, tienes que borrar algo para hacer espacio.

Redis (y las cachés en general) tienen *políticas de desalojo* que determinan qué se elimina cuando la memoria está llena:

- **LRU (Menos Recientemente Usado)**: Eliminar los elementos a los que no se ha accedido en el tiempo más largo.
- **LFU (Menos Frecuentemente Usado)**: Eliminar los elementos a los que se accede con menos frecuencia.
- **allkeys-random**: Desalojo aleatorio. Simple, no óptimo.
- **noeviction**: Devolver un error cuando la memoria está llena (la aplicación debe manejar esto).

Para la mayoría de las aplicaciones web: LRU. Las cosas que no has mirado recientemente son probablemente menos necesarias.

---

**El Problema de la Avalancha de Caché**

«¿Hemos pensado en lo que pasa si toda la caché se vacía a la vez?» preguntó Priya.

«¿Cuándo pasaría eso?» dijo Leo.

«Cuando despliegas un nuevo clúster de ElastiCache. Cuando el TTL de un gran lote de entradas expira simultáneamente. Cuando vacías la caché para forzar un refresco después de corregir un error.»

Leo lo pensó. «Si la caché está vacía, cada solicitud va a la base de datos. Todas a la vez. Durante unos segundos, la base de datos maneja la carga completa de cada usuario simultáneo.»

«Sin ninguna caché delante de ella.»

«Eso dolería.» Leo miró la configuración de capacidad de la base de datos. «Nos limitarían seguro.»

Esto se llama una **avalancha de caché** (también llamada thundering herd o estampida). Ocurre cuando muchas entradas de caché expiran al mismo tiempo — a menudo porque todas se crearon al mismo tiempo durante un despliegue o arranque en frío — y la ola repentina de fallos de caché golpea toda la base de datos simultáneamente.

Estrategias de mitigación:

**Jitter en el TTL**: En lugar de configurar cada entrada de menú a exactamente 300 segundos, añade variación aleatoria: de 270 a 330 segundos. Las entradas expiran en momentos ligeramente diferentes, repartiendo la ola de fallos de caché a lo largo de un minuto en lugar de golpear simultáneamente.

**Expiración temprana probabilística**: Antes de que una entrada expire, un pequeño porcentaje de solicitudes la refresca proactivamente. Esto mantiene las entradas frescas antes de que queden obsoletas, evitando que la expiración llegue a convertirse en un fallo.

**Fusión de solicitudes (mutex/lock)**: Cuando ocurre un fallo de caché, adquiere un bloqueo antes de golpear la base de datos. Otras solicitudes concurrentes para la misma clave esperan a que la primera solicitud se complete y vuelva a poblar la caché, y luego leen de la caché. Solo se hace una solicitud a la base de datos por fallo de caché, incluso bajo alta concurrencia.

Para Nimbus, implementaron jitter en el TTL. Simple, efectivo, sin complejidad adicional.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

«Dos líneas de código», dijo Leo. «Para prevenir una posible caída de la base de datos durante los despliegues.»

«La mayoría de las mejoras de fiabilidad son así», dijo Priya. «Baratas de implementar, caras de aprender que las necesitabas.»

---

**Estructuras de Datos de Redis: Más que Clave-Valor**

Cuando Nimbus añadió la función de «restaurantes populares», Leo inicialmente almacenó la clasificación como una lista JSON simple: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Funcionaba, pero actualizarla era incómodo. Para añadir un nuevo restaurante o actualizar una puntuación, tenía que leer la lista completa, modificarla en el código de la aplicación y escribir todo de vuelta. Bajo escrituras concurrentes de la canalización de analítica, las condiciones de carrera causaban que las puntuaciones se sobrescribieran.

Priya le señaló los conjuntos ordenados de Redis.

Un **conjunto ordenado** (sorted set) en Redis almacena miembros con puntuaciones numéricas asociadas. Los miembros se ordenan automáticamente por puntuación. Las operaciones son atómicas — sin condiciones de carrera por actualizaciones concurrentes.

```
# Añadir/actualizar la puntuación de un restaurante
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Obtener los 10 mejores restaurantes por puntuación (el más alto primero)
ZREVRANGE trending:global 0 9 WITHSCORES

# Incrementar la puntuación de un restaurante atómicamente
ZINCRBY trending:global 50 "NIMBUS-047"
```

La Lambda de analítica llamaba a `ZINCRBY` cada vez que se realizaba un pedido, incrementando la puntuación del restaurante. La página de inicio llamaba a `ZREVRANGE` para obtener los diez mejores. Sin bloqueos, sin condiciones de carrera, sin ciclos de leer-modificar-escribir.

Redis admite varias otras estructuras de datos más allá del simple clave-valor:

**Listas**: Secuencias ordenadas. Añade al frente o al final. Úsalas para colas, feeds de actividad reciente, flujos de registros.

**Conjuntos**: Colecciones desordenadas sin duplicados. Operaciones de unión, intersección, diferencia. Úsalos para «¿qué usuarios han visto esta notificación?» o «¿qué restaurantes están en esta categoría?».

**Hashes**: Campos nombrados dentro de una clave. Úsalos para objetos estructurados donde quieres actualizar campos individuales sin reescribir el objeto completo.

**HyperLogLog**: Estimación probabilística de cardinalidad. Cuenta visitantes únicos a una página sin almacenar cada ID de visitante. Compacto y rápido.

**Pub/Sub**: Publica mensajes a canales; los suscriptores los reciben en tiempo real. Úsalo para notificaciones ligeras en tiempo real entre servicios.

«Redis no es solo una caché», dijo Leo. «Es un servidor de estructuras de datos.»

«Esa es su descripción oficial», dijo Priya.

«Pensaba que era solo un diccionario sofisticado.»

«Empezó así.»

---

**Write-Through: El Otro Patrón de Almacenamiento en Caché**

Caché-aside (carga diferida) es el patrón más común. Pero hay un segundo que vale la pena conocer: **write-through** (escritura directa).

En el almacenamiento en caché write-through, cada vez que tu aplicación escribe en la base de datos, también escribe en la caché inmediatamente.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

La ventaja: la caché siempre está al día. No hay datos obsoletos entre una escritura y la expiración del TTL.

La desventaja: cada escritura va a dos lugares. Y pueblas la caché con datos que quizás nunca se lean. Si diez restaurantes actualizan sus menús pero solo dos de ellos reciben tráfico significativo en los próximos cinco minutos, has hecho trabajo de write-through para ocho cachés que no se usarán antes de que expiren.

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «Si escribimos en la caché en cada actualización, estamos haciendo más trabajo por escritura que antes. ¿Cómo es eso mejor?»

«No siempre es mejor», dijo Priya. «Write-through tiene sentido cuando no puedes tolerar ninguna ventana de datos obsoletos después de una escritura. Caché-aside acepta hasta un TTL de obsolescencia a cambio de no hacer trabajo extra en cada escritura.»

Para Nimbus: caché-aside era la elección correcta. Los menús se leían con mucha más frecuencia de lo que se escribían. Una ventana de obsolescencia de cinco minutos era aceptable. Para un sistema de trading financiero donde cada actualización de precio necesitaba reflejarse inmediatamente, write-through sería más apropiado.

La decisión se reduce a dos preguntas: ¿cuál es tu relación escritura-lectura, y qué tan tolerante eres a las lecturas obsoletas después de una escritura?


---

**ElastiCache para Redis: Lo que Obtienes Gestionado**

Como RDS, ElastiCache toma una herramienta de código abierto y maneja el trabajo operativo:

- **Respaldos automatizados**: Instantáneas de Redis en un programa
- **Replicación Multi-AZ**: Nodo primario + réplicas de lectura en diferentes AZs
- **Failover automático**: Si el nodo Redis primario falla, una réplica se promueve automáticamente
- **Modo clúster**: Fragmentación horizontal en múltiples nodos para cachés muy grandes
- **Cifrado**: Cifrado en tránsito y en reposo para cumplimiento
- **Integración VPC**: La caché se ejecuta en tu red privada, no accesible públicamente

«¿Cuánto cuesta eso al mes?» preguntó Tom.

«Menos que las lecturas de DynamoDB que estamos reemplazando», dijo Leo. «Unos doscientos dólares al mes menos.»

Leo abrió la página de precios. Ya había hecho los cálculos, pero se los explicó a Tom.

Un `cache.t3.micro` — el nodo más pequeño — costaba unos $12 al mes. Tenía 0,5 GB de memoria. Suficiente para una aplicación pequeña con unos pocos cientos de claves de caché.

Un `cache.r6g.large` — el nivel apropiado para el tráfico de Nimbus — tenía 13 GB de memoria y costaba unos $140 al mes. En comparación, Nimbus había estado gastando aproximadamente $400 al mes en lecturas de DynamoDB antes del almacenamiento en caché. Tras el almacenamiento en caché, esas lecturas habían bajado en alrededor del 89 por ciento. Las cuentas daban aproximadamente $356 al mes ahorrados en lecturas de DynamoDB, menos $140 gastados en ElastiCache — un ahorro neto de unos $216 al mes.

La expresión de Tom pasó de escéptica a satisfecha. «Haz bien las cuentas antes de que escalemos, pero eso cuadra.» Lo anotó.

«¿Y qué pasa si alguien intenta entrar a la fuerza?» dijo Priya. «La caché podría tener tokens de sesión. Datos de usuario. Necesitamos tokens de autenticación en la instancia de Redis y nada de acceso público.»

«Estará en la subred privada», dijo Leo.

«Bien. Pero "estará bien" no es una postura de seguridad», dijo. «Token de autenticación. Cifrado en tránsito. Solo VPC.»

Leo asintió. Tenía razón.

---

**Monitorizar la Caché**

«¿Hemos pensado en lo que pasa cuando la caché no funciona correctamente?» preguntó Priya, una semana después del despliegue de Redis. «No que falle completamente — funciona, pero mal. Alta tasa de fallos. Alta tasa de desalojo. La latencia subiendo poco a poco.»

«Lo notaría cuando los tiempos de carga de página aumentaran», dijo Leo.

«Y para entonces la base de datos ya está sufriendo», dijo ella.

ElastiCache expone métricas a través de CloudWatch. Las que más importan:

**CacheHitRate**: El porcentaje de lecturas de caché que devolvieron un resultado. Idealmente por encima del 80% para una caché madura. Una tasa de aciertos en descenso señala que tus datos más accedidos no están en la caché — o los TTL son demasiado cortos, la caché es demasiado pequeña, o tus patrones de acceso han cambiado.

**CacheMisses**: Recuento absoluto de fallos de caché. Un pico repentino aquí significa que la caché no está ayudando y la base de datos asume la carga completa.

**Evictions**: El número de elementos de caché desalojados para hacer espacio a otros nuevos. Altas tasas de desalojo significan que tu caché es demasiado pequeña para tu conjunto de trabajo. Necesitas más memoria o una estrategia de caché más selectiva.

**CurrConnections**: Conexiones de cliente actuales a Redis. Demasiadas conexiones pueden agotar el límite de conexiones de Redis. Las aplicaciones deberían usar pooling de conexiones para evitar abrir una nueva conexión en cada solicitud.

**ReplicationLag**: Cuánto retraso lleva la réplica de lectura respecto al primario. Si esto crece, las lecturas de réplica pueden devolver datos obsoletos.

Leo configuró dos alarmas de CloudWatch. Primera: alertar si la tasa de aciertos de caché bajaba del 70% durante quince minutos consecutivos — eso señalaría un problema que valía la pena investigar antes de que la base de datos lo sintiera. Segunda: alertar si la tasa de desalojo superaba los 100 desalojos por minuto — eso señalaría que la caché estaba infradimensionada.

«Dos alarmas», dijo Priya, revisando la configuración. «Es un buen comienzo.»

«También añadí un panel», dijo Leo. «Tasa de aciertos, tasa de fallos, desalojos, latencia. Todo visible en un solo lugar.»

«Eso es mejor que esperar a que la página se vuelva lenta.»

«Considerablemente mejor», coincidió Leo.


---

**ElastiCache vs DAX: ¿Qué Caché para DynamoDB?**

«Si estamos almacenando en caché datos de DynamoDB», preguntó Maya, «¿por qué no usar DAX en lugar de ElastiCache? Lo vi en la documentación.»

Buena pregunta.

**DAX (DynamoDB Accelerator)** es una caché en memoria diseñada específicamente para DynamoDB. Intercepta las llamadas a la API de DynamoDB a nivel de cliente — el código de tu aplicación habla con DAX usando el mismo SDK de DynamoDB. Los fallos de caché se obtienen automáticamente de DynamoDB. Los aciertos de caché devuelven resultados en microsegundos. La invalidación se maneja automáticamente cuando los datos cambian.

**ElastiCache** es una caché de propósito general. Tú gestionas las claves de caché, la lógica del TTL, la invalidación — todo. Más control, más responsabilidad.

Cuándo usar cada una:

| Escenario | Recomendación |
|---|---|
| Estás almacenando en caché lecturas de DynamoDB y quieres cero cambios en la aplicación | DAX |
| Necesitas latencia en microsegundos en lecturas de DynamoDB | DAX |
| Estás almacenando en caché de múltiples fuentes (DynamoDB + RDS + APIs externas) | ElastiCache |
| Necesitas estructuras de datos de Redis (conjuntos ordenados, pub/sub, HyperLogLog) | ElastiCache |
| Necesitas control granular del TTL y lógica de invalidación personalizada | ElastiCache |
| Necesitas almacenamiento de sesiones, limitación de tasa o bloqueos distribuidos | ElastiCache |

Para Nimbus: eligieron ElastiCache porque estaban almacenando en caché datos de múltiples fuentes — DynamoDB para los menús, RDS para los resúmenes del historial de pedidos, APIs externas para las valoraciones de restaurantes. DAX solo funciona con DynamoDB. Y necesitaban conjuntos ordenados de Redis para las clasificaciones de populares.

«Si fuera puramente un problema de almacenamiento en caché de DynamoDB», dijo Priya, «DAX sería la respuesta más simple. Un servicio, invalidación automática, la misma API. Pero tenemos más de una fuente de datos.»

«Así que DAX es más simple cuando eres solo DynamoDB», resumió Maya. «ElastiCache cuando necesitas la caja de herramientas completa.»

«Esa es la concesión.»

### Cuando los Datos en Caché No Pueden Perderse: Amazon MemoryDB

«¿Por qué alguien usaría Redis como base de datos primaria?» preguntó Maya. «¿No es una caché?»

Esa es exactamente la pregunta correcta.

ElastiCache para Redis es una caché — rápida, en memoria y, por diseño, no la fuente de verdad. Si un nodo de ElastiCache falla, la caché está vacía al reiniciar. Las aplicaciones la recalientan desde la base de datos. Eso está bien para una caché.

Pero algunos casos de uso tratan a Redis no como una caché sino como un almacén de datos primario — estado de sesión que debe sobrevivir a los reinicios, una tabla de clasificación en tiempo real que no se puede perder, un carrito de compras que debe persistir a través de un fallo de AZ. Para estos casos de uso, la durabilidad eventual de ElastiCache es un riesgo.

**Amazon MemoryDB para Redis** es una base de datos en memoria duradera, completamente gestionada y compatible con Redis. A diferencia de ElastiCache, MemoryDB usa un registro de transacciones distribuido almacenado en múltiples AZs que hace que cada escritura sea duradera antes de ser confirmada. Los datos sobreviven a los fallos de nodo — no porque se reproduzcan desde una base de datos más lenta, sino porque nunca estuvieron solo en un lugar.

La distinción clave:

| | ElastiCache para Redis | MemoryDB para Redis |
|---|---|---|
| Rol | Capa de caché | Base de datos primaria |
| Durabilidad | No garantizada en caso de fallo | Registro de transacciones Multi-AZ |
| Latencia | Lecturas y escrituras en microsegundos | Lecturas en microsegundos, escrituras en milisegundos de un solo dígito |

Ambos admiten los mismos comandos y estructuras de datos de Redis. La API es la misma. La garantía de durabilidad no lo es.

Para Nimbus: el equipo quiere almacenar los recuentos de pedidos por restaurante en tiempo real como un conjunto ordenado de Redis — y tiene que sobrevivir a un fallo de AZ sin resembrarse desde la base de datos. Ese requisito — compatible con Redis *y* duradero — es la señal exacta para MemoryDB.

«¿Así que no tenemos que recalentarla después de un fallo?» preguntó Leo.

«Ese es el punto», dijo Priya. «Si el nodo falla y vuelve, los datos están ahí. El registro de transacciones los conservó.»

Leo miró la página de precios por un momento. «Cuesta más que ElastiCache.»

«Todo lo que vale la pena confiar lo hace», dijo Priya.

## Fortalezas y Limitaciones

**Por qué el almacenamiento en caché es potente**:

- Reduce drásticamente la carga de la base de datos (menos consultas, menores costes)
- Tiempos de respuesta inferiores al milisegundo para los aciertos de caché
- Protege tu base de datos de los picos de tráfico
- Redis admite estructuras de datos más ricas que un simple almacén de clave-valor
- La mitigación de avalanchas de caché (jitter del TTL, fusión) protege contra las oleadas de arranque en frío

**Donde el almacenamiento en caché se complica**:

- La invalidación de caché es genuinamente difícil — los datos obsoletos causan errores
- Añade complejidad operativa (otro servicio que monitorear, otro punto de fallo)
- Problema de arranque en frío: cuando despliegas de nuevo, la caché está vacía — la base de datos asume la carga completa
- Avalancha de caché: si muchas entradas expiran a la vez, todas las solicitudes llegan a la base de datos simultáneamente
- Los nodos de ElastiCache no son gratuitos — pagas por ellos incluso cuando están inactivos

**ElastiCache vs DynamoDB DAX**:

Si estás almacenando en caché datos de DynamoDB específicamente, AWS ofrece **DAX (DynamoDB Accelerator)** — una caché en memoria diseñada específicamente para DynamoDB. DAX es transparente para el código de tu aplicación (misma API), reduce la latencia de lectura de DynamoDB a microsegundos y maneja la invalidación de caché automáticamente.

Usa DAX cuando tu cuello de botella son las lecturas de DynamoDB y quieres almacenamiento en caché sin cambios. Usa ElastiCache cuando necesitas una caché de propósito general para cualquier fuente de datos, o cuando necesitas estructuras de datos de Redis.

## Resumen

Cuarenta y siete llamadas a la base de datos se convirtieron en una búsqueda en caché. La página pasó de 188 milisegundos a 12. Añadir una capa de caché es uno de los cambios de mayor apalancamiento que puede hacer una aplicación en crecimiento — pero solo cuando la caché se diseña con cuidado, con respuestas claras a la pregunta «¿cuándo cambian estos datos?».

- Una caché es un almacén rápido de datos recuperados recientemente — preguntas una vez, recuerdas la respuesta. ElastiCache es el servicio de caché gestionado de AWS, que admite **Redis** (persistencia, estructuras de datos complejas, pub/sub) y **Memcached** (pura clave-valor, escalado horizontal).
- El **patrón caché-aside** (carga diferida): comprueba primero la caché, cae de vuelta a la base de datos en el fallo. El **TTL** controla cuánto tiempo permanecen los datos en caché — un TTL corto significa datos más frescos y más fallos; un TTL largo significa respuestas más rápidas y posible obsolescencia.
- Almacena en caché lo correcto: datos por entidad compartidos entre muchos usuarios, no datos por usuario únicos de cada sesión. La avalancha de caché ocurre cuando muchas entradas expiran simultáneamente — mitígala con jitter del TTL.
- **DAX** es la elección correcta para el almacenamiento en caché exclusivo de DynamoDB. **ElastiCache** es más flexible para el almacenamiento en caché de múltiples fuentes y las estructuras de datos de Redis.
- La parte más difícil del almacenamiento en caché es la invalidación: saber cuándo cambian los datos y actualizar la caché en todos los caminos de código que la escriben. Una caché es tan confiable como su estrategia de invalidación.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.3)*

- **Redis vs Memcached en el examen**: Redis = persistencia, replicación, estructuras complejas, pub/sub. Memcached = clave-valor simple, escalado horizontal puro. Cuando el escenario menciona «no puedes perder los datos en caché», la respuesta es Redis (persiste en el disco).
- **Señales del caso de uso de ElastiCache**: «la base de datos es un cuello de botella», «carga de trabajo intensiva en lectura», «reducir la latencia», «almacén de sesiones» — todo apunta a ElastiCache.
- **Señal de DAX**: «reducir la latencia de lectura de DynamoDB» o «las lecturas de DynamoDB son demasiado lentas» → DAX, no ElastiCache.
- **Gestión de sesiones**: ElastiCache Redis es la respuesta canónica para almacenar datos de sesión de usuario. Aplicación sin estado + almacén de sesiones de Redis = escalado horizontal con sesiones consistentes.
- **Write-through vs caché-aside**: Caché-aside (carga diferida) es el más común. Write-through actualiza la caché en cada escritura — nunca obsoleto, pero más operaciones de escritura. El examen puede distinguirlos.
- **Políticas de desalojo de caché**: LRU (menos recientemente usado) es la respuesta más común del examen para cargas de trabajo web generales.
- **ElastiCache vs. MemoryDB:** ElastiCache = capa de caché, rápida, pérdida de datos aceptable en caso de fallo. MemoryDB = base de datos primaria en memoria duradera, compatible con Redis, registro de transacciones Multi-AZ. Desencadenante del examen: «compatible con Redis Y duradero» o «almacén de datos primario en Redis» → MemoryDB, no ElastiCache.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es la invalidación de caché y por qué es difícil?

*(Pista: Piensa en todos los lugares en Nimbus donde los datos del menú podrían actualizarse — el portal de socios restauradores, una herramienta de administración, un cron job. Cada uno de esos caminos necesita saber sobre la caché.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una plataforma de streaming de vídeo sirve a millones de usuarios. El catálogo de películas disponibles cambia con poca frecuencia (se actualiza por la noche). La aplicación está experimentando un alto uso de CPU en la base de datos porque cada solicitud de usuario consulta el catálogo. El equipo quiere reducir la carga de la base de datos manteniendo los datos del catálogo precisos dentro de una hora de las actualizaciones.

¿Qué solución satisface MEJOR estos requisitos?

A) Añadir réplicas de lectura a la base de datos RDS para distribuir la carga  
B) Migrar el catálogo a DynamoDB con capacidad bajo demanda  
C) Usar ElastiCache para Redis con un TTL de 1 hora para los datos del catálogo  
D) Aumentar el tamaño de la instancia de RDS para manejar más consultas concurrentes

**Pista 1**: Los datos son de lectura intensiva y cambian con poca frecuencia. ¿Qué patrón es ideal para esto?

**Pista 2**: «Preciso dentro de una hora» se traduce directamente en un parámetro de configuración de caché específico.

**Pista 3**: El objetivo es reducir la carga de la base de datos, no solo manejar más de ella.

**Respuesta**: C

**Explicación**: ElastiCache con un TTL de una hora almacena en caché los datos del catálogo después de la primera solicitud por clave. Las solicitudes posteriores devuelven resultados de la caché sin tocar la base de datos. Cuando se ejecuta la actualización nocturna, las entradas expiran dentro de una hora y los datos frescos se cargan en la siguiente solicitud.

**¿Por qué no A?** Las réplicas de lectura distribuyen el tráfico de lectura en más nodos de base de datos, pero no reducen el número total de consultas. Son útiles para escalar las lecturas, no para reducir la carga de la base de datos de consultas frecuentemente repetidas.

**¿Por qué no B?** Migrar a DynamoDB no resuelve el problema subyacente — los datos del catálogo seguirían recuperándose de la base de datos (DynamoDB) en cada solicitud de usuario.

**¿Por qué no D?** Escalar la instancia maneja más consultas concurrentes pero no reduce el número de consultas. La ineficiencia fundamental permanece.

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento — Tarea 3.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus quiere añadir una función de «restaurantes populares»: una lista clasificada de los 10 principales restaurantes por volumen de pedidos en las últimas 24 horas, actualizada cada 15 minutos.

¿Cómo implementarías esto con ElastiCache Redis? ¿Qué estructura de datos de Redis usarías para la clasificación? ¿Cuál sería tu TTL de caché y cuándo exactamente actualizarías la caché?

Considera también: ¿qué pasa si el nodo de ElastiCache cae? ¿Se rompe la función? ¿Cómo diseñarías en torno a este fallo?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de caché y el pensamiento sobre fallos.)*

## Escena Post-Créditos

«Ya lo desplegué — oh.» Leo había subido la integración de Redis a producción antes de actualizar la configuración del pool de conexiones. Bajo carga, la aplicación estaba abriendo demasiadas conexiones de Redis. Había tenido que revertirlo y desplegar de nuevo con la configuración correcta.

Leo añadió el almacenamiento en caché de Redis para el menú. El tiempo de carga de la página bajó de 188 milisegundos a 12 milisegundos.

Las cuarenta y siete llamadas a DynamoDB se convirtieron en una búsqueda en Redis. La llamada fue de 0,8 milisegundos.

Lo anunció en el standup del lunes.

«Buen trabajo», dijo Priya, sin levantar la vista de su portátil.

«Gracias», dijo Leo.

«¿Cuándo rotaste por última vez el token de autenticación de Redis?»

Leo miró sus notas. «Creo que no configuré ninguno.»

«Entonces la caché no está autenticada.»

«Está dentro de la VPC.»

«Como todo lo demás que está comprometido.» Finalmente levantó la vista. «Si el portátil de Leo se infecta y alguien penetra en la VPC, tu caché no tiene contraseña.»

Leo la miró fijamente.

«Configuraré el token de autenticación», dijo.

En el próximo capítulo: la red privada que separa lo que Nimbus posee del resto de internet.
