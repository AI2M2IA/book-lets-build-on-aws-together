# Capítulo 24: La Base de Datos que Crece Contigo

Imagina una biblioteca que empezó con dos estanterías y un bibliotecario. Eso fue suficiente, por un tiempo. El bibliotecario sabía dónde estaba todo. Las solicitudes se respondían rápidamente. Luego la biblioteca creció: diez estanterías, veinte, cuarenta. El mismo bibliotecario, el mismo escritorio, el mismo catálogo de fichas. Ahora encontrar cualquier cosa requiere esperar. El bibliotecario no es lento: simplemente hay más biblioteca de la que una persona puede atender al ritmo original.

La solución no es un bibliotecario más rápido. Es un tipo diferente de biblioteca.

---

Después de la reducción de costos de S3, Tom continuó su revisión. El nivel de la base de datos era un tipo diferente de problema: no datos inactivos en la clase de almacenamiento equivocada, sino un sistema luchando activamente bajo la carga de seis meses de crecimiento del tráfico.

---

Los números no eran cómodos.

Nimbus ejecutaba RDS PostgreSQL: Multi-AZ, instancia db.r6g.large. $340/mes.

Leo abrió el panel de métricas de CloudWatch. Los números tenían un patrón.

**DatabaseConnections**: 198 de un máximo de 200 durante el pico del viernes. Dos conexiones de la saturación. A 200, los nuevos intentos de conexión fallarían con "too many connections", un error que aparecería como HTTP 500 para los clientes que pedían la cena.

**CPUUtilization**: 89% de pico durante la hora pico de la cena del viernes. La instancia estaba diseñada para manejar picos —una db.r6g.large tiene 2 vCPUs y 16 GB de memoria— pero un 89% de CPU sostenido significaba que la base de datos estaba a capacidad antes de que llegara siquiera la hora pico.

**ReadLatency**: 840 milisegundos P95. Hace seis meses, había sido de 180ms. La degradación había sido gradual —de 10 a 20ms por semana— invisible hasta que fue catastrófica. La semana anterior a la revisión de Tom, la latencia P99 había cruzado un segundo completo. Los clientes que hacían clic en un menú de restaurante esperaban más de un segundo a que la página cargara.

**FreeStorageSpace**: 18% del almacenamiento aprovisionado restante. A las tasas de crecimiento actuales, la base de datos se quedaría sin almacenamiento aprovisionado en aproximadamente 11 semanas.

"Cada uno de estos es resoluble de forma aislada", dijo Leo, mirando el panel. "Pero tenemos los cuatro a la vez."

El pico de recuento de conexiones apuntaba a problemas de pooling de conexiones en la aplicación: demasiadas tareas de ECS abriendo sus propias conexiones a la base de datos. El problema de CPU apuntaba a consultas costosas. El problema de latencia y el problema de CPU eran casi con certeza el mismo problema: una consulta lenta ejecutándose con demasiada frecuencia.

"Espera, pero *¿por qué* estamos a 198 conexiones?", preguntó Maya. "Tenemos tres tareas de ECS. ¿Cómo tenemos casi 200 conexiones a la base de datos?"

Cada tarea de ECS usaba SQLAlchemy con un tamaño de pool predeterminado de 5 conexiones más un desbordamiento de 10. Tres tareas × 15 conexiones potenciales = 45 conexiones de la aplicación. Las otras 153 eran de las funciones de Lambda de análisis, los trabajadores de trabajos en segundo plano, el trabajo de ETL de Glue, las conexiones locales del equipo de desarrollo a través del host bastión, y varias conexiones que habían sido abiertas pero no cerradas correctamente por una versión antigua del código.

"El problema del recuento de conexiones", dijo Leo, "es en realidad un problema de aplicación que parece un problema de base de datos." Agregó PgBouncer (un pooler de conexiones) a la lista de tareas, pero el cuello de botella inmediato era la consulta lenta.

La CPU de la base de datos se disparaba al 89% durante la hora pico de la cena del viernes. Las consultas de lectura se encolaban. La latencia P95 de consultas se había duplicado en seis meses.

"La base de datos es el cuello de botella", dijo. "El tráfico ha crecido. La base de datos no ha escalado con él."

"¿No podemos simplemente hacer la instancia más grande?", preguntó Maya. "Espera, pero *¿por qué* tenemos una sola base de datos manejando todas las lecturas y escrituras? ¿Por qué no distribuimos esto desde el principio?"

"Sí", dijo Leo. "Eso es el escalado vertical. Pasamos de r6g.large a r6g.xlarge. Más CPU, más memoria. Costará más y nos comprará tiempo."

"Pero no soluciona el problema subyacente", dijo Priya. "Eventualmente llegaremos a la instancia más grande y necesitaremos un enfoque diferente. ¿Y hemos pensado en qué pasa si una escritura va a una réplica de lectura por accidente? La réplica la rechaza y el pedido falla silenciosamente."

"Hay dos enfoques", dijo Leo. "Réplicas de lectura, o Aurora."

"¿Cuál es la diferencia?"

"Piénsalo como una biblioteca", dijo Leo, tomando un marcador. "Un bibliotecario que tanto registra los libros como responde las preguntas de los usuarios. Cuando la biblioteca se vuelve popular, se forma una cola. La solución: contratar más bibliotecarios, pero solo para responder preguntas. El registro sigue pasando por el escritorio original."

"Eso es una réplica de lectura", dijo Priya.

"Exactamente. Aurora va un paso más allá: rediseña el propio sistema de estanterías para que cada bibliotecario comparta las mismas estanterías y siempre vea los mismos libros, sin retraso. Sin esperar a que las actualizaciones se filtren de un escritorio a otro."

**Réplicas de Lectura: Distribuir el Tráfico de Lectura**

La mayoría de las aplicaciones web leen datos mucho más a menudo de lo que los escriben. Un cliente navegando por el menú hace docenas de consultas SELECT. Realizar un pedido hace algunas consultas INSERT/UPDATE. La proporción es típicamente de 10:1 o más alta.

Una **réplica de lectura** es una instancia de RDS adicional que recibe una copia de todas las escrituras del primario y hace que esas escrituras estén disponibles para las consultas SELECT.

Cómo funciona:

1. Las escrituras de la aplicación (INSERT, UPDATE, DELETE) van a la base de datos primaria
2. El primario replica esos cambios de forma asincrónica a las réplicas de lectura
3. Las lecturas de la aplicación (SELECT) se distribuyen entre las réplicas de lectura
4. Las réplicas de lectura comparten la carga: cada una maneja una fracción del tráfico de lectura total

El resultado: la base de datos primaria maneja solo escrituras (y opcionalmente algunas lecturas). Las réplicas de lectura manejan la carga de lectura. Para una proporción de lectura/escritura de 10:1, agregar una réplica de lectura reduce aproximadamente a la mitad la carga total del primario.

**Limitación importante**: La replicación es **asincrónica**. Hay retraso de replicación: típicamente milisegundos, pero puede ser de segundos bajo carga. Una lectura de una réplica podría ver datos que están ligeramente atrasados respecto al primario. Para la mayoría de las lecturas (navegar por el menú, ver el historial de pedidos), esto es aceptable. Para "¿se procesó mi pedido?": lee del primario.

**Réplicas de Lectura: Los Detalles**

- Puedes tener hasta 15 réplicas de lectura por instancia primaria de RDS (MySQL, PostgreSQL, MariaDB)
- Las réplicas de lectura pueden estar en la misma región o en una región diferente (réplicas entre regiones)
- Las réplicas de lectura pueden tener ellas mismas réplicas de lectura (encadenamiento)
- Las réplicas de lectura son endpoints separados: tu aplicación debe dirigir las lecturas al endpoint de la réplica
- Las réplicas de lectura pueden promoverse a bases de datos independientes (útil para DR)

Para Nimbus, Leo agregó una réplica de lectura. "Estará bien", dijo cuando Priya le preguntó si había probado la lógica de enrutamiento de lectura/escritura de la aplicación antes de cambiar el tráfico. No lo había hecho. Pasó los siguientes cuarenta minutos verificando que las escrituras no fueran al endpoint de la réplica de lectura.

Actualizó la aplicación para:

- Operaciones de escritura → endpoint primario
- Navegación de menú, historial de pedidos → endpoint de réplica

La CPU del primario bajó del 89% al 41% en el pico.

**El Problema de la Consistencia de Lectura Después de Escritura**

Tres días después de habilitar la réplica de lectura, llegó un ticket de soporte. Un socio restaurante había actualizado su menú —eliminado un artículo descontinuado— y luego llamó para confirmar que estaba eliminado. El agente de servicio al cliente abrió el menú desde la interfaz de Nimbus. El artículo seguía ahí.

Veinte segundos después, había desaparecido.

Retraso de replicación asincrónica. La escritura (DELETE del artículo del menú) fue al primario. La lectura del agente de servicio al cliente fue a la réplica, que aún no había recibido el cambio. La réplica estaba 15 segundos atrasada en ese momento: nada inusual, pero visible.

"¿Y qué pasa si alguien intenta entrar por la fuerza a través de la ventana de consistencia eventual?", preguntó Priya. "O simplemente, ¿qué pasa si se realiza un pedido de un artículo del menú que acaba de eliminarse? Cobraríamos al cliente y el restaurante no tendría el artículo."

Esta era una preocupación de consistencia real, no solo una molestia de UX.

La solución: identificar qué lecturas tienen requisitos de consistencia y enrutarlas al primario.

**Lecturas que pueden ir a la réplica** (la consistencia eventual está bien):
- Cliente navegando por el menú de un restaurante (estar desactualizado por 1-2 segundos es imperceptible)
- Consultas de historial de pedidos (un usuario viendo su historial de pedidos de hace un minuto)
- Lecturas de tipo análisis (los mejores restaurantes de esta semana)

**Lecturas que deben ir al primario** (se requiere consistencia de lectura después de escritura):
- Inmediatamente después de una escritura, cuando la aplicación necesita confirmar que la escritura tuvo éxito
- Lecturas de estado de pedido inmediatamente después de realizar un pedido
- Lecturas de menú activadas por la interfaz de gestión del restaurante (el restaurante acaba de cambiar el menú)

La aplicación agregó una pista de enrutamiento en la capa de conexión a la base de datos: si la solicitud venía del panel de gestión del restaurante, enrutar al primario. Si venía de un cliente navegando, enrutar a la réplica. El encabezado HTTP `X-Read-Consistency: strong` servía como señal.

"No es tan difícil", dijo Leo. "Solo tienes que saber qué lecturas lo requieren."

"Y documentarlo", dijo Priya. "Para que la próxima persona que agregue un nuevo endpoint sepa qué pool usar."

"¿Cuánto cuesta eso al mes?", preguntó Tom. Era su pregunta de apertura estándar para cualquier servicio nuevo.

Una réplica de lectura del mismo tipo de instancia cuesta lo mismo que el primario. De $340/mes a $680/mes.

"Duplicamos el costo para reducir aproximadamente a la mitad la carga", dijo Tom.

"Sí. Pero la alternativa era pasar a un tipo de instancia más grande, que también costaría más y no distribuiría la carga de lectura."

Tom hizo las cuentas. Asintió, de mala gana.

"¿Y si el primario falla?", preguntó Maya, antes de que Tom pudiera pivotar a Aurora. "¿Qué le pasa a la réplica de lectura?"

Leo explicó la promoción de réplicas.

**Si la instancia primaria de RDS falla**, AWS hace failover automáticamente a la réplica en standby en la configuración Multi-AZ (un tipo diferente de réplica: un standby sincrónico, no una réplica de lectura). El standby de Multi-AZ se convierte en el nuevo primario. Las réplicas de lectura continúan sirviendo lecturas, ahora replicando del nuevo primario. Desde la perspectiva de la aplicación, el DNS del endpoint primario cambia para apuntar al antiguo standby, y la aplicación se reconecta.

El failover típicamente toma de 60 a 120 segundos para RDS PostgreSQL. Durante esa ventana, las escrituras fallan.

La **promoción de réplica de lectura** es una operación separada, y un escenario separado. Si quieres tomar una réplica de lectura y convertirla en una base de datos independiente y con capacidad de escritura (para DR, para migración a una nueva región, o porque el primario desapareció y necesitas promover en lugar de esperar el failover de Multi-AZ), puedes promover una réplica de lectura a un primario independiente. La promoción toma unos minutos, después de los cuales la réplica ya no está replicando del primario original: es su propia base de datos.

"¿Hemos pensado en qué pasa si el primario de us-west-2 cae por completo?", preguntó Priya. "No solo un failover al standby de Multi-AZ, sino toda la región."

"Si la región falla", dijo Leo, "el standby de Multi-AZ también está en us-west-2. Ambos fallan juntos."

"Así que para un verdadero escenario de DR regional", dijo Tom, "necesitaríamos una réplica de lectura en us-east-1 que pudiéramos promover."

"Sí. Una réplica de lectura entre regiones. Todavía no tenemos una."

"¿Cuánto cuesta eso al mes?", preguntó Tom. Ya sabía que la respuesta implicaría una decisión.

Una réplica de lectura entre regiones de una db.r6g.large en us-east-1: $340/mes (mismo costo de instancia). Más la transferencia de datos entre regiones para la replicación: mínima al volumen de escritura de Nimbus. Total: aproximadamente $350/mes para una réplica de DR.

"Eso son $4.200 al año", dijo Tom, "para protegerse contra un escenario que les ha ocurrido a las regiones de AWS menos de cinco veces en diez años."

"¿Y el costo de que Nimbus esté caído durante 24 horas durante un evento regional es?", preguntó Priya.

Tom calculó. No respondió en voz alta. Pero agregó "réplica de lectura entre regiones" al backlog de DR.

"¿Qué es Aurora?", preguntó.

**Amazon Aurora: Repensar el Motor de Base de Datos**

Aurora es el motor de base de datos relacional propietario de AWS, compatible con MySQL y PostgreSQL. Fue diseñado desde cero para cargas de trabajo en la nube, reimaginando cómo funciona la capa de almacenamiento de una base de datos relacional.

En una configuración tradicional de RDS (MySQL, PostgreSQL), el almacenamiento y el cómputo están fuertemente acoplados. El motor de base de datos gestiona los archivos de datos. La replicación copia los datos del primario a la réplica. La réplica debe rehacer cada operación de escritura.

Esto crea un techo en la velocidad de replicación: una réplica solo puede aplicar escrituras tan rápido como puede procesar el registro de replicación. Durante un período de muchas escrituras —una importación masiva, una venta flash, una actualización por lotes— la réplica puede quedarse atrás. El retraso de replicación no es un defecto en la implementación; es una consecuencia de la arquitectura.

Priya había señalado esto de inmediato cuando Leo propuso las réplicas de lectura. "¿Y hemos pensado en qué pasa si el retraso de replicación se dispara a 30 segundos durante la hora pico del viernes? La réplica está 30 segundos atrasada. Un cliente realiza un pedido, el espacio de la cocina se reserva en el primario, pero un segundo cliente consultando la réplica no ve la reserva. Dos pedidos, un espacio."

"Eso es un problema de consistencia de inventario", dijo Leo.

"Eso es exactamente un problema de consistencia de inventario", confirmó Priya. "Por lo cual las lecturas de inventario —'¿está este artículo todavía disponible?'— deben ir al primario."

La arquitectura de Aurora aborda el retraso directamente.

Aurora separa el almacenamiento del cómputo. Usa una capa de almacenamiento distribuida y tolerante a fallos que replica los datos automáticamente en tres Zonas de Disponibilidad en seis copias. La capa de cómputo (las instancias de base de datos) se sitúa encima de esta capa de almacenamiento.

**Lo que esto cambia**:

**Réplicas de lectura**: Las réplicas de Aurora no necesitan replicar datos: ya comparten la misma capa de almacenamiento. Esto significa:

- Hasta 15 réplicas de Aurora que comparten el volumen de almacenamiento (RDS regular también permite hasta 15 réplicas de lectura, pero cada una es una copia completa de datos)
- El retraso de replicación es típicamente inferior a 100 milisegundos (vs segundos para RDS bajo carga)
- Las réplicas pueden promoverse a primario en menos de 30 segundos (vs minutos)

**Failover**: Como las réplicas comparten el almacenamiento, el failover es mucho más rápido: la promoción no implica transferencia de datos, solo redirigir las escrituras.

**Almacenamiento**: Aurora escala automáticamente el almacenamiento en incrementos de 10GB, hasta 128 TiB (256 TiB en versiones recientes del motor). Nunca aprovisionas almacenamiento por adelantado.

**Rendimiento**: Aurora afirma 5 veces el rendimiento de MySQL estándar y 3 veces el de PostgreSQL estándar para tipos de instancia equivalentes.

Quizás te preguntes: si todas las réplicas comparten el mismo almacenamiento, ¿no se convierte ese almacenamiento en un punto único de fallo? La capa de almacenamiento de Aurora replica automáticamente los datos en seis copias en tres Zonas de Disponibilidad. El almacenamiento en sí es más resiliente que cualquier configuración Multi-AZ de RDS individual: está diseñado para sobrevivir a la pérdida de una AZ entera con cero pérdida de datos y sin necesidad de failover.

Una segunda pregunta común: si Aurora es compatible con MySQL/PostgreSQL, ¿puedes migrar de RDS PostgreSQL a Aurora PostgreSQL sin cambiar el código de la aplicación? Casi. La compatibilidad de Aurora PostgreSQL significa que Aurora implementa el protocolo de cable de PostgreSQL y admite la gran mayoría de la sintaxis y las características SQL de PostgreSQL. La mayoría de las aplicaciones migran sin cambios de código. Los casos límite: un pequeño número de extensiones de PostgreSQL no están disponibles en Aurora, algunas consultas del catálogo del sistema devuelven valores diferentes, y ciertas operaciones administrativas difieren. Para las migraciones de producción, prueba con tráfico de lectura paralelo antes de cambiar las escrituras.

Para Nimbus, la migración de RDS PostgreSQL a Aurora PostgreSQL tomó una tarde. La aplicación apuntó al endpoint de Aurora. La consulta de menú —después de que Leo agregó el índice que Performance Insights había señalado como el principal consumidor de carga de la base de datos— se ejecutó en 4ms en lugar de 620ms. El pool de conexiones ya no alcanzaba los 198 de 200. La latencia P95 bajó a 28ms.

"Es un motor de base de datos diferente", dijo Leo, "que la aplicación cree que es el mismo motor de base de datos."

"¿Y la parte interesante?", preguntó Maya.

"La clonación rápida de bases de datos."

"Anotado", dijo Sam en voz baja desde el otro lado de la sala, ya escribiendo. Sam era un ingeniero de backend que se había unido al equipo unas semanas antes para quitarle a Leo parte del trabajo de base de datos. Nadie preguntó qué estaba haciendo.

**Precios de Aurora: La Pregunta de Tom**

Los precios de Aurora son diferentes de los de RDS:

**Precio de instancia**: Similar al precio de instancia de RDS por tipo.

**Precio de almacenamiento**: $0,10 por GB al mes (pagas por lo que se almacena, escalado automáticamente).

**Precio de I/O**: Aurora cobra por solicitud de I/O (lectura/escritura al almacenamiento). Esto puede ser significativo para cargas de trabajo con muchas escrituras.

"Espera", dijo Tom. "¿Estamos pagando por el I/O por separado?"

"Aurora Serverless v2 y Aurora I/O-Optimized cambian este modelo de precios", dijo Leo. "Aurora I/O-Optimized no cobra tarifa de I/O pero tiene un precio de almacenamiento e instancia más alto. Mejor para cargas de trabajo con mucho I/O."

Tom miró el equilibrio. Para Nimbus, que tenía muchas lecturas (muchas consultas de menú, pocas escrituras), Aurora I/O-Optimized podría costar más. Los precios estándar de Aurora podrían ser apropiados.

Una heurística útil: si tus cargos de I/O exceden aproximadamente el 25% de tu factura total de Aurora, I/O-Optimized probablemente sea más barato. Para la carga de trabajo de muchas lecturas de Nimbus, los cargos de I/O eran bajos: se aplican los precios estándar. Para una carga de trabajo con muchas escrituras como un sistema de registro de eventos, I/O-Optimized podría reducir los costos significativamente.

Esta es una decisión de costo real que los ingenieros senior toman: necesitas conocer los patrones de I/O de tu carga de trabajo para elegir correctamente.

Si tu carga de trabajo es pequeña, estable y predecible, RDS PostgreSQL es más simple y significativamente más barato; pero si tu tráfico es impredecible, tu volumen de datos crece más allá de lo que puedes aprovisionar por adelantado, o necesitas failover automático en menos de 30 segundos, el modelo de almacenamiento compartido de Aurora justifica el mayor costo base.

**Aurora Serverless: Escalar Sin Pensar en Instancias**

**Aurora Serverless v2** es una configuración que escala automáticamente la capacidad de cómputo según la carga real de la base de datos. En lugar de elegir un tamaño de instancia fijo (db.r6g.large), estableces una capacidad mínima y máxima en Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Escala hacia arriba en segundos cuando la carga aumenta
- Escala hacia abajo durante los períodos de inactividad, y desde finales de 2024, puede auto-pausarse hasta 0 ACUs cuando no hay conexiones (reanudar toma ~15 segundos; la auto-pausa no funciona con RDS Proxy u otros proxies que mantienen conexiones)
- Costo: $0,12 por ACU-hora (más almacenamiento e I/O)

Para cargas de trabajo con tráfico variable —los picos del viernes de Nimbus vs la tranquilidad del lunes por la mañana— Serverless v2 reduce los costos durante los períodos de menor actividad y maneja los picos sin aprovisionamiento previo.

"Así que durante el pico del viernes", dijo Leo, "Aurora escala hacia arriba automáticamente. El domingo por la mañana, cuando casi no tenemos tráfico, escala de vuelta hacia abajo al mínimo."

"Y solo pagamos por la capacidad que estamos usando", dijo Tom.

"Correcto."

Después de un mes en Aurora Serverless v2, Leo abrió el gráfico de ACU (Aurora Capacity Unit) de la semana anterior.

El gráfico mostraba dos patrones distintos. Durante la semana, la base de datos corría a 2-4 ACUs: un murmullo tranquilo de consultas en segundo plano, verificaciones de salud de ECS, trabajos de ETL de Glue y pruebas de desarrollo. El viernes por la noche entre las 18:00 y las 22:00, el recuento de ACU subía:

```
Viernes 18:00  → 6 ACUs
Viernes 19:00  → 14 ACUs
Viernes 19:45  → 26 ACUs  (pico — los pedidos de pizza se disparan antes del kickoff de la NFL)
Viernes 20:30  → 18 ACUs
Viernes 21:00  → 12 ACUs
Viernes 22:30  → 4 ACUs
Sábado 02:00 → 2 ACUs  (mínimo)
```

El escalado era casi instantáneo: Aurora Serverless v2 escala en incrementos de 0,5 ACUs, y puede agregar capacidad en segundos en lugar de los minutos requeridos para aprovisionar una nueva instancia de RDS.

"¿Cuánto costó ese pico del viernes?", preguntó Tom.

A $0,12 por ACU-hora: el pico del viernes fue de 4 horas promediando 18 ACUs → $8,64 por el período pico. El resto de la semana a 3 ACUs de promedio × 164 horas × $0,12 = $59,04. Total de la semana: $67,68.

La instancia aprovisionada equivalente para manejar el pico del viernes (db.r6g.xlarge, 4 vCPUs, 32 GB) costaría $0,937/hora × 168 horas = **$157,42 por la semana**, materializara o no el pico del viernes.

"Serverless v2 son $67 por la semana. Una instancia aprovisionada dimensionada para el pico son $157", dijo Tom. "Eso es una reducción del 57%."

"En una base de datos que legítimamente usa 26 ACUs durante cuatro horas el viernes y 2 ACUs el resto de la semana", dijo Leo. "Si tu base de datos corre a una carga alta y constante toda la semana, una instancia aprovisionada es más barata. El ahorro viene de la variabilidad."

Tom asintió lentamente. Estaba agregando esto a un patrón en sus notas: cada historia de ahorro de este trimestre tenía la misma forma. Pagas por lo que usas, no por lo que podrías necesitar. Las políticas de ciclo de vida de S3 pagaban solo por la clase de almacenamiento que cada objeto merecía. Lambda pagaba solo por el tiempo de invocación. Fargate pagaba solo por la CPU y la memoria de la tarea. Aurora Serverless v2 pagaba solo por las ACUs que la base de datos realmente consumía.

Tom tenía la expresión de alguien que había encontrado exactamente lo que buscaba.

**Recuperarse de una Mala Migración: Clones, PITR y el Botón de Deshacer**

Dos semanas después de pasar a Aurora, Sam ejecutó un script de migración de base de datos en producción. El script se suponía que eliminaría la columna `legacy_menu_format` de la tabla `menu_items`. Lo ejecutó sin la cláusula WHERE que creía haber incluido.

El resultado no fue eliminar una columna. Fue una sentencia DELETE que borró 40.000 filas de la tabla `menu_items`, aproximadamente los datos de menú de 200 restaurantes, desaparecidos.

La alerta se disparó en 30 segundos. Los fallos de pedidos se dispararon. El servicio de menú empezó a devolver resultados vacíos para 200 restaurantes.

"Se suponía que tenía una cláusula WHERE", dijo Sam, mirando la consola.

La ruta de recuperación tradicional: restaurar desde la instantánea de copia de seguridad automatizada más reciente. Las copias de seguridad automatizadas se ejecutan una vez cada 24 horas, y una restauración-e-intercambio completa tomaría de 20 a 40 minutos —durante los cuales *todos* los restaurantes estarían a oscuras, no solo los 200 afectados— y cada pedido realizado desde la copia de seguridad se perdería.

Leo no hizo eso. Como el RDS estándar, Aurora mantiene copias de seguridad continuas para la **recuperación a un punto en el tiempo (PITR)**: puedes restaurar el clúster a cualquier segundo dentro de la ventana de retención de copias de seguridad, no solo a la última instantánea nocturna. Y críticamente, la restauración crea un clúster *nuevo*; producción permanece activa mientras te recuperas.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

La marca de tiempo: 15:42:00Z, cuatro minutos antes de que Sam ejecutara el script de migración. Mientras el clúster de recuperación se levantaba, el resto de producción siguió sirviendo a los restaurantes no afectados. Una vez disponible, Leo volcó las filas de `menu_items` de los 200 restaurantes afectados del clúster de recuperación y las insertó de vuelta en producción. Tiempo total desde la alerta hasta los menús completamente restaurados: poco menos de 40 minutos, y como reparó las filas quirúrgicamente en lugar de intercambiar toda la base de datos, no se perdió ningún pedido realizado después de las 15:42. El clúster de recuperación se eliminó después; había cumplido su propósito.

"¿Qué perdimos?", preguntó Maya.

Seis pedidos realizados contra los menús brevemente vacíos habían fallado al pagar: todos estaban en la cola de SQS y podían reproducirse. No se perdió permanentemente ningún dato de cliente.

"Y aquí es donde entra la **clonación rápida de bases de datos**", dijo Leo, reuniendo al equipo después. Aurora puede crear un **clon** de un clúster en minutos, sin importar el tamaño de la base de datos, usando copia en escritura (copy-on-write): el clon comparte la capa de almacenamiento del original y solo las páginas nuevas o modificadas consumen espacio adicional. Un clon de la base de datos de producción actual es barato, rápido y completamente aislado: las escrituras en el clon nunca tocan producción.

"Lo que significa", dijo Priya, mirando a Sam, "que el script de migración se prueba contra un clon de los datos de producción antes de ejecutarse en producción. Esa es la nueva regla."

Sam asintió. Ya lo había escrito en una nota adhesiva.

Una herramienta más pertenece a este panorama. Aurora MySQL —no Aurora PostgreSQL— tiene **Aurora Backtrack**: una característica que rebobina el clúster *en su sitio* a un punto específico en el tiempo, sin restaurar a un nuevo clúster en absoluto. Si el clúster de Nimbus hubiera sido Aurora MySQL, Leo podría haberlo rebobinado a las 15:42 en menos de tres minutos, aunque rebobinar todo el clúster también habría revertido el puñado de pedidos legítimos escritos después de la eliminación, que el enfoque quirúrgico de PITR preservó.

"¿Y qué pasa si alguien intenta entrar por la fuerza usando Backtrack, o una restauración a un punto en el tiempo?", preguntó Priya. "¿Podría un atacante rebobinar los registros de auditoría o los datos de cumplimiento?"

Backtrack requiere el permiso de API `rds:BacktrackDBCluster`, y las restauraciones requieren `rds:RestoreDBClusterToPointInTime`: acciones de IAM separadas de las operaciones normales de base de datos. Los roles de aplicación estándar no tienen estos permisos. Solo el equipo de operaciones, con una política de IAM explícita que se lo permita, podía usarlos. Ella agregó esto a la lista de verificación de revisión de permisos de IAM.

Las advertencias importantes: Aurora Backtrack solo está disponible para los clústeres compatibles con Aurora MySQL, no PostgreSQL. La ventana de Backtrack se configura en la creación del clúster (de 1 hora a 72 horas, cobra por hora de ventana de backtrack). Y Backtrack afecta a todo el clúster: no puedes hacer Backtrack de una tabla o un conjunto de filas. Para la recuperación quirúrgica a nivel de fila —en cualquiera de los dos motores— el enfoque de PITR a un clúster temporal que usó Leo es la herramienta.

**Aurora Global Database: Lecturas Multi-Región**

**Aurora Global Database** extiende Aurora a través de múltiples regiones de AWS:

- **Una región primaria** maneja todas las escrituras
- **Hasta cinco regiones secundarias** sirven lecturas con un retraso de replicación típicamente inferior a 1 segundo
- Las regiones secundarias pueden promoverse a primario en menos de 1 minuto (para escenarios de DR)

Para la expansión global de Nimbus, Aurora Global Database permitiría que un socio restaurante en Londres consultara su menú local desde la réplica de lectura de la UE, mientras que todos los pedidos (escrituras) siguen pasando por el primario de EE. UU.

**RDS vs Aurora: Cuándo Elegir Cada Uno**

| Factor              | RDS (PostgreSQL/MySQL)              | Aurora                                                          |
|---------------------|------------------------------------|----------------------------------------------------------------|
| Costo               | Menor para cargas pequeñas         | Base más alta, pero escala mejor                               |
| Compatibilidad      | Completa                           | Compatible con MySQL/PostgreSQL (con diferencias menores)       |
| Máx. réplicas       | 15 (cada una copia completa)       | 15 (volumen de almacenamiento compartido)                      |
| Retraso de réplica  | Puede ser de segundos              | Normalmente <100ms                                             |
| Almacenamiento      | Aprovisionamiento fijo             | Auto-escala a 128 TiB (256 TiB en versiones recientes)         |
| Tiempo de failover  | 60-120 segundos                    | <30 segundos                                                  |
| Opción serverless   | Limitada                           | Aurora Serverless v2                                          |
| Mejor para          | Cargas estables y predecibles      | Tráfico variable, alto volumen de lectura, necesidad de failover rápido |

**Más Allá de lo Relacional: La Familia de Propósito Específico**

El capítulo 9 presentó DocumentDB (documentos compatibles con MongoDB), Neptune (relaciones de grafo) y Keyspaces (columna ancha compatible con Cassandra), y el capítulo 10 presentó MemoryDB (base de datos primaria durable compatible con Redis). Dos nombres más completan la familia: no necesitas profundidad en ellos, solo la capacidad de reconocer qué forma de datos apunta a qué motor, porque aparecen constantemente como opciones de respuesta:

- **Amazon Timestream**: datos de **series temporales**: lecturas de sensores, métricas, telemetría. Señal del examen: "mediciones de IoT a lo largo del tiempo". (En el mundo real, la oferta actual es Timestream for InfluxDB; el sabor original "LiveAnalytics" cerró a nuevos clientes en 2025.)
- **Amazon QLDB**: todavía puedes encontrarlo en preguntas más antiguas como el "libro contable inmutable y verificable criptográficamente". AWS descontinuó QLDB en 2025 (recomendando Aurora PostgreSQL en su lugar): trátalo como un distractor heredado, no como un bloque de construcción.

La regla que vale la pena escribir en una pizarra: **filas relacionales → RDS/Aurora; clave-valor a escala → DynamoDB; documentos → DocumentDB; relaciones → Neptune; tiempo → Timestream; Cassandra → Keyspaces; Redis durable → MemoryDB.** Ajusta la forma, y la pregunta se responde sola.

## Fortalezas y Limitaciones

**Fortalezas de Aurora**:

- Failover significativamente más rápido que el RDS estándar
- Hasta 15 réplicas de lectura con retraso mínimo
- Almacenamiento de auto-escalado
- Serverless v2 para cargas de trabajo variables
- Global Database para despliegue multi-región

**Limitaciones de Aurora**:

- Mayor costo para cargas de trabajo pequeñas y estables
- El precio de I/O puede ser significativo para cargas de trabajo con muchas escrituras (usa I/O-Optimized para esto)
- Las diferencias menores de compatibilidad con MySQL/PostgreSQL pueden requerir cambios de código
- La reanudación de Serverless v2 desde la auto-pausa (~15 segundos) y el escalado rápido pueden causar picos de latencia

## Resumen

El trabajo de ciclo de vida de S3 del capítulo 23 redujo los costos moviendo los datos al nivel de almacenamiento correcto. Aurora hace el equivalente para el cómputo: en lugar de aprovisionar para la carga pico y pagarla todo el tiempo, Serverless v2 escala para igualar la demanda.

- Las **réplicas de lectura** distribuyen el tráfico de lectura del primario. Replicación asincrónica: un ligero retraso aceptable para la mayoría de las lecturas. Enruta las lecturas que requieren consistencia de escritura (lecturas inmediatamente posteriores a una escritura, lecturas de la interfaz de administración) al primario, no a la réplica.
- **Aurora** reimagina la capa de almacenamiento: distribuida, compartida entre réplicas, de auto-escalado.
- Aurora ofrece: 15 réplicas de lectura, <100ms de retraso de réplica, <30s de failover, hasta 128 TiB (256 TiB en versiones recientes) de almacenamiento de auto-escalado.
- **Performance Insights**: identifica las consultas SQL específicas que causan la carga de la base de datos antes de decidir cómo escalar. Un índice faltante puede eliminar la necesidad de una instancia más grande.
- **Métricas de base de datos de CloudWatch**: DatabaseConnections (cerca de la saturación significa que el pooling de conexiones de la aplicación está roto), CPUUtilization (CPU alta sostenida significa consultas costosas), ReadLatency (la degradación con el tiempo suele ser una tabla creciente con un índice faltante).
- **Aurora Serverless v2**: auto-escala el cómputo en incrementos de 0,5 ACUs. Se cobra por ACU-hora. Significativamente más barato que las instancias aprovisionadas para cargas de trabajo con alta variabilidad entre el pico y la baja actividad.
- **Recuperación a un punto en el tiempo (PITR)**: restaura un clúster de Aurora a cualquier segundo dentro de la ventana de retención de copias de seguridad, en un clúster *nuevo*, de modo que producción permanece activa mientras copias quirúrgicamente las filas perdidas de vuelta.
- **Clonación rápida de bases de datos**: clon de copia en escritura de un clúster en minutos sin importar el tamaño. Barato, aislado: úsalo para probar migraciones contra datos de producción antes de que se ejecuten en producción.
- **Aurora Backtrack** (solo compatible con MySQL, no PostgreSQL): rebobina el clúster en su sitio a un punto en el tiempo sin restaurar desde una copia de seguridad. Disponible para ventanas de hasta 72 horas. Requiere el permiso de IAM `rds:BacktrackDBCluster`: restríngelo al equipo de operaciones.
- **Aurora Global Database**: primario en una región, réplicas de lectura en hasta cinco regiones.
- **Promoción de réplica de lectura**: las réplicas de lectura entre regiones pueden promoverse a primarios independientes para el DR regional. Equilibra el beneficio de DR contra el costo de ejecutar una segunda instancia completa.
- Elige RDS para cargas de trabajo más pequeñas, estables y predecibles. Elige Aurora cuando necesites escala, failover rápido o manejo de tráfico variable.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.3)*

- **Réplica de Aurora vs réplica de lectura de RDS**: Las réplicas de Aurora comparten el almacenamiento (retraso casi nulo, <30s de failover). Las réplicas de lectura de RDS replican datos (retraso posible, minutos para el failover).
- **Aurora Serverless v2**: "auto-escalar la capacidad de la base de datos", "tráfico de base de datos impredecible o irregular" → Aurora Serverless v2. Precaución: históricamente solo Serverless **v1** escalaba a cero; el mínimo de v2 era 0,5 ACU hasta finales de 2024, cuando v2 ganó la auto-pausa a 0 ACUs. Las preguntas más antiguas del examen pueden todavía asumir que v2 no puede escalar a cero.
- **Aurora Global Database**: "base de datos multi-región", "leer desde la UE con baja latencia desde el primario de EE. UU.", "RTO < 1 minuto para el failover regional" → Aurora Global Database.
- **Tiempo de failover**: Aurora < 30 segundos. RDS Multi-AZ 60-120 segundos. Conoce ambos.
- **Bases de datos de propósito específico por forma de datos**: "grafo social / recomendaciones / anillos de fraude" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "series temporales / telemetría de IoT" → Timestream. "base de datos *primaria* compatible con Redis (durable)" → MemoryDB (vs ElastiCache = caché). "Libro contable criptográfico inmutable" → QLDB en preguntas antiguas (descontinuado en 2025).
- **Aurora I/O-Optimized**: Mayor costo de almacenamiento e instancia, sin cargo por I/O. Úsalo cuando los costos de I/O dominan (muchas escrituras). Aurora estándar: menor costo de almacenamiento, paga por I/O. Úsalo para muchas lecturas.
- **Aurora Backtrack**: Rebobina la base de datos en su sitio a un punto específico en el tiempo sin restaurar desde una instantánea de copia de seguridad. Disponible solo para Aurora compatible con MySQL: para Aurora PostgreSQL, la respuesta es la restauración a un punto en el tiempo (a un nuevo clúster) o un clon rápido. Señal del examen: "datos eliminados accidentalmente, necesidad de recuperar rápidamente sin restaurar una copia de seguridad completa" + MySQL → Backtrack.
- **Clonación rápida de bases de datos de Aurora**: clon de copia en escritura en minutos, sin importar el tamaño de la base de datos. Señal del examen: "probar contra una copia de los datos de producción de forma rápida y barata" → clon, no restauración de instantánea.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre Aurora y las réplicas de lectura estándar de RDS. ¿Por qué el retraso de replicación de Aurora es típicamente menor?

*(Pista: La diferencia clave es almacenamiento compartido vs replicación de datos. Piensa en lo que cada réplica debe hacer cuando llega una escritura.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: La base de datos MySQL de una plataforma de redes sociales está experimentando una alta latencia de lectura debido al aumento del tráfico. La aplicación tiene muchas lecturas (95% lecturas, 5% escrituras). El equipo necesita que la latencia de lectura sea consistente, incluso durante los picos de tráfico. Necesitan failover automático con un tiempo de inactividad mínimo (objetivo RTO < 30 segundos). El volumen de datos crece de forma impredecible.

¿Qué solución de base de datos cumple MEJOR con estos requisitos?

A) RDS MySQL Multi-AZ con cinco réplicas de lectura  
B) Aurora MySQL con réplicas de Aurora y Aurora Serverless v2  
C) RDS MySQL con un tipo de instancia más grande (escalado vertical)  
D) DynamoDB con DynamoDB DAX para caché de lecturas

**Pista 1**: "RTO < 30 segundos": ¿qué servicio logra esto? Comprueba el tiempo de failover de cada opción.

**Pista 2**: "Latencia de lectura consistente durante los picos": ¿qué servicio tiene réplicas con retraso casi nulo vs potenciales segundos de retraso?

**Pista 3**: "Volumen de datos que crece de forma impredecible": ¿qué servicio auto-escala el almacenamiento?

**Respuesta**: B

**Explicación**: Aurora MySQL con réplicas de Aurora proporciona un retraso de replicación casi nulo (milisegundos, no segundos) para un rendimiento de lectura consistente bajo carga. Aurora Serverless v2 auto-escala el cómputo durante los picos de tráfico sin sobreaprovisionar. El almacenamiento de Aurora se auto-escala a medida que crecen los datos. El failover de Aurora (promoción de una réplica) se completa en menos de 30 segundos, cumpliendo con el requisito de RTO.

**¿Por qué no A?** El failover de RDS Multi-AZ toma de 60 a 120 segundos: no cumple con el RTO < 30 segundos. El retraso de las réplicas de lectura estándar de RDS puede llegar a segundos bajo carga: la latencia de lectura "consistente" es más difícil de garantizar.

**¿Por qué no C?** El escalado vertical (instancia más grande) aumenta la capacidad pero no distribuye la carga de lectura. La base de datos sigue siendo un punto único de fallo para las lecturas.

**¿Por qué no D?** DynamoDB es NoSQL: migrar de MySQL a DynamoDB requiere rearquitectura del modelo de datos y de las consultas de la aplicación, lo cual está mucho más allá del alcance de esta tarea de mejora de rendimiento.

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento — Tarea 3.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está diseñando una expansión global. Quieren que los socios restaurantes en la Costa Este, en Alemania y en Australia vean sus propios datos de pedidos rápidamente, sin latencia entre regiones. Sin embargo, todas las escrituras deben pasar por el único primario de us-west-2 para mantener la consistencia.

Diseña la arquitectura de base de datos usando Aurora. ¿Cómo estructurarías la Global Database, por ejemplo, clústeres secundarios en us-east-1, eu-central-1 y ap-southeast-2? ¿Qué pasa si el primario de us-west-2 cae? ¿Cómo manejarías el proceso de promoción?

*(No existe una única respuesta correcta. El objetivo es practicar el diseño de bases de datos multi-región.)*

## Escena Post-Créditos

Leo migró a Aurora con Serverless v2.

El pico del viernes vino y se fue. La CPU nunca excedió el 60%. La latencia de consultas se mantuvo consistente. Aurora había escalado hacia arriba para manejar la carga automáticamente, luego escaló de vuelta hacia abajo después de la hora pico.

"¿Cuánto costó esto comparado con el viernes pasado?", le preguntó Tom el lunes por la mañana.

Leo abrió el explorador de facturación. "El viernes promedió unos $2,16/hora durante el pico de la tarde. El sábado por la mañana fue $0,24/hora."

Tom no dijo nada.

"La configuración antigua era un fijo de $0,47/hora sin importar la carga", agregó Leo.

"Así que pagamos más durante el pico que antes", dijo Tom.

"Sí. Pero significativamente menos durante las horas de menor actividad. El costo neto durante la semana es menor."

Tom calculó. Luego asintió.

"Hay una lección aquí", dijo. "La pregunta correcta no es '¿es esto más barato?'. Es '¿es esto más barato para nuestro patrón de uso real?'."

"Eso", dijo Priya desde el otro lado de la sala, "es el instinto de un ingeniero senior."

Tom parecía ligeramente alarmado de ser descrito de esa manera.

En el próximo capítulo: cuando tu red es el cuello de botella, y por qué una autopista privada podría valer el peaje.
