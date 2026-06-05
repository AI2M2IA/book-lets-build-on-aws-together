# Capítulo 10: Cuando la Base de Datos Es Demasiado Lenta

Las métricas de carga de página estaban abiertas en la pantalla. Leo llevaba veinte minutos mirándolas sin decir nada.

Cuarenta y siete solicitudes a DynamoDB por carga de página. Ciento ochenta y ocho milisegundos solo para recuperar los datos — antes de que el navegador renderizara un solo píxel.

Había hecho los cálculos. Diez mil usuarios simultáneos un viernes por la noche: cuatrocientas setenta mil lecturas de DynamoDB por minuto. El coste era real. Pero la latencia era el problema real. Un usuario que abría la página de exploración de Nimbus esperaba casi doscientos milisegundos antes de que apareciera nada — y eso era en una conexión rápida.

«La base de datos está respondiendo en cuatro milisegundos por solicitud», dijo Leo. «Eso es realmente rápido. DynamoDB está haciendo su trabajo.»

«¿Entonces por qué la página es lenta?» preguntó Maya.

«Porque la estamos llamando cuarenta y siete veces por carga de página», dijo Priya. «El problema no es la base de datos. El problema es que hablamos con ella demasiado.»

Tom se inclinó hacia adelante. Tenía la mirada que ponía cuando un problema estaba a punto de convertirse en una conversación sobre costes. «¿Entonces la solución es hablar con ella menos?»

«Hablar con ella menos. Recordar más.»

**La Analogía del Restaurante**

Imagina la cocina de un restaurante. Cada vez que un camarero necesita saber los platos del día, camina hasta la parte de atrás, le pregunta al chef y vuelve a la mesa.

Eso funciona bien si tienes dos camareros y tres mesas.

Ahora imagina doscientos camareros y mil mesas. Todos ellos caminando hacia la parte de atrás para la misma pregunta. La cocina se convierte en el cuello de botella. El chef está respondiendo la misma pregunta cuatrocientas veces por hora.

La solución obvia: escribir los platos del día en una pizarra al frente del restaurante. Cada camarero lee de la pizarra. La cocina descansa. La pizarra se actualiza cuando cambian los platos.

Esa pizarra es una caché.

Una caché es un almacén rápido y local de datos recuperados recientemente. En lugar de obtener la misma cosa de una fuente lenta repetidamente, la obtienes una vez y la mantienes cerca.

**¿Por Qué No Usar Simplemente la Memoria?**

«¿No podemos simplemente almacenar el menú en la memoria de la aplicación?» preguntó Leo.

Pregunta válida.

Puedes hacerlo. Para una aplicación de un solo servidor, el almacenamiento en caché en memoria funciona bien. Pero Nimbus se ejecuta detrás de un balanceador de carga, en múltiples instancias EC2. Si una instancia almacena en caché el menú en su memoria, las otras instancias no tienen esos datos. Cada una mantiene cachés separadas. Cuando el menú se actualiza, tendrías que invalidar todas ellas.

Este es el *problema de coherencia de caché* — mantener múltiples cachés consistentes.

ElastiCache resuelve esto proporcionando una caché *centralizada* que todas tus instancias comparten. En lugar de que cada servidor tenga su propia memoria, todos los servidores leen y escriben en la misma caché. Una actualización se propaga a todos.

**Conoce ElastiCache**

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

«Solo hay dos problemas difíciles en informática», citó Leo, con la entrega practicada de alguien que lo había dicho antes. «La invalidación de caché y nombrar cosas.»

«¿Por qué es difícil la invalidación de caché?» preguntó Maya.

«Porque ¿cuándo cambian los datos *realmente*? ¿Cambió el menú porque un socio restaurador lo actualizó? ¿O porque se ejecutó un cron job? ¿O porque un administrador lo editó manualmente? Cada lugar que puede cambiar los datos necesita saber que tiene que avisar a la caché.»

Por eso los ingenieros senior empiezan una conversación sobre caché con «¿cuáles son los caminos de escritura?» en lugar de «añadamos Redis».

**Desalojo de Caché: Cuando la Pizarra Se Llena**

La pizarra de los platos tiene espacio limitado. Cuando se llena, tienes que borrar algo para hacer espacio.

Redis (y las cachés en general) tienen *políticas de desalojo* que determinan qué se elimina cuando la memoria está llena:

- **LRU (Menos Recientemente Usado)**: Eliminar los elementos a los que no se ha accedido en el tiempo más largo.
- **LFU (Menos Frecuentemente Usado)**: Eliminar los elementos a los que se accede con menos frecuencia.
- **allkeys-random**: Desalojo aleatorio. Simple, no óptimo.
- **noeviction**: Devolver un error cuando la memoria está llena (la aplicación debe manejar esto).

Para la mayoría de las aplicaciones web: LRU. Las cosas que no has mirado recientemente son probablemente menos necesarias.

**ElastiCache para Redis: Lo que Obtienes Gestionado**

Como RDS, ElastiCache toma una herramienta de código abierto y maneja el trabajo operativo:

- **Respaldos automatizados**: Instantáneas de Redis en un programa
- **Replicación Multi-AZ**: Nodo primario + réplicas de lectura en diferentes AZs
- **Failover automático**: Si el nodo Redis primario falla, una réplica se promueve automáticamente
- **Modo clúster**: Fragmentación horizontal en múltiples nodos para cachés muy grandes
- **Cifrado**: Cifrado en tránsito y en reposo para cumplimiento
- **Integración VPC**: La caché se ejecuta en tu red privada, no accesible públicamente

Tom miró la lista de características. «¿Cuánto cuesta?»

«Menos que las lecturas de DynamoDB que estamos reemplazando», dijo Leo. «Hice los cálculos.»

La expresión de Tom pasó de escéptica a interesada. Eso era un avance.

## Fortalezas y Limitaciones

**Por qué el almacenamiento en caché es potente**:

- Reduce drásticamente la carga de la base de datos (menos consultas, menores costes)
- Tiempos de respuesta inferiores al milisegundo para los aciertos de caché
- Protege tu base de datos de los picos de tráfico
- Redis admite estructuras de datos más ricas que un simple almacén de clave-valor

**Donde el almacenamiento en caché se complica**:

- La invalidación de caché es genuinamente difícil — los datos obsoletos causan errores
- Añade complejidad operativa (otro servicio que monitorear, otro punto de fallo)
- Problema de arranque en frío: cuando despliegas de nuevo, la caché está vacía — la base de datos asume la carga completa
- Avalancha de caché: si muchas entradas expiran a la vez, todas las solicitudes llegan a la base de datos simultáneamente
- Los nodos de ElastiCache no son gratuitos — pagas por ellos incluso cuando están inactivos

**ElastiCache vs DynamoDB DAX**:

Si estás almacenando en caché datos de DynamoDB específicamente, AWS ofrece **DAX (DynamoDB Accelerator)** — una caché en memoria diseñada específicamente para DynamoDB. DAX es transparente para el código de tu aplicación (misma API), reduce la latencia de lectura de DynamoDB a microsegundos y maneja la invalidación de caché automáticamente.

Usa DAX cuando el cuello de botella son las lecturas de DynamoDB. Usa ElastiCache cuando necesitas una caché de propósito general para cualquier fuente de datos.

## Resumen

- Una caché es un almacén rápido de datos recuperados recientemente — preguntas una vez, recuerdas la respuesta.
- ElastiCache es el servicio de caché gestionado de AWS, que admite Redis y Memcached.
- **Redis** es más rico (estructuras de datos complejas, persistencia, pub/sub). **Memcached** es más simple (pura clave-valor, escalable horizontalmente).
- El **patrón caché-aside** (carga diferida): comprueba primero la caché, cae de vuelta a la base de datos en el fallo.
- **TTL** controla cuánto tiempo permanecen los datos en caché. TTL corto = frescos, muchos fallos. TTL largo = rápido, potencialmente obsoleto.
- La invalidación de caché es difícil. Conoce todos los caminos de escritura antes de añadir una caché.
- ElastiCache gestiona la replicación, el failover, los respaldos y el cifrado — tú te centras en el diseño de la caché.
- **DAX** es la caché específica de DynamoDB. ElastiCache es de propósito general.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.3)*

- **Redis vs Memcached en el examen**: Redis = persistencia, replicación, estructuras complejas, pub/sub. Memcached = clave-valor simple, escalado horizontal puro. Cuando el escenario menciona «no puedes perder los datos en caché», la respuesta es Redis (persiste en el disco).
- **Señales del caso de uso de ElastiCache**: «la base de datos es un cuello de botella», «carga de trabajo intensiva en lectura», «reducir la latencia», «almacén de sesiones» — todo apunta a ElastiCache.
- **Señal de DAX**: «reducir la latencia de lectura de DynamoDB» o «las lecturas de DynamoDB son demasiado lentas» → DAX, no ElastiCache.
- **Gestión de sesiones**: ElastiCache Redis es la respuesta canónica para almacenar datos de sesión de usuario. Aplicación sin estado + almacén de sesiones de Redis = escalado horizontal con sesiones consistentes.
- **Write-through vs caché-aside**: Caché-aside (carga diferida) es el más común. Write-through actualiza la caché en cada escritura — nunca obsoleto, pero más operaciones de escritura. El examen puede distinguirlos.
- **Políticas de desalojo de caché**: LRU (menos recientemente usado) es la respuesta más común del examen para cargas de trabajo web generales.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es la invalidación de caché y por qué es difícil?

*(Pista: Piensa en todos los lugares en Nimbus donde los datos del menú podrían actualizarse — el portal de socios restauradores, una herramienta de administración, un cron job. Cada uno de esos caminos necesita saber sobre la caché.)*

**Ejercicio 2 — Práctica de Examen**

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
