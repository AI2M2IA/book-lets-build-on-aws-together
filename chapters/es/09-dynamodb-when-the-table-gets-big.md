# Capítulo 9: Cuando la Tabla se Hace Grande

La cocina del primer restaurante socio de Nimbus olía a ajo y pan caliente incluso a las diez de la mañana. Maya había estado allí para una demostración, observando a un cocinero deslizar el dedo por la app para registrar una sustitución — pescado en lugar de camarón, temporalmente agotado. El deslizamiento ocurrió. El menú se actualizó. Un cliente en otra parte de la ciudad vio el cambio en cuestión de segundos.

Eso había parecido magia.

De vuelta en la oficina, la magia había empezado a frenarse.

La tabla del menú tenía 50.000 elementos.

Eran de 287 restaurantes — el recuento de socios había explotado de los cuarenta y siete de los días del balanceador de carga a casi trescientos en menos de un año — cada uno con especialidades diarias, platos de temporada y variaciones regionales. Algunos elementos tenían modificadores — tamaño, nivel de picante, elección de proteína. Algunos tenían menús combinados que hacían referencia a otros elementos. Algunos aparecían en el menú solo los días de semana, o solo durante el almuerzo, o solo en ciertas ciudades.

La consulta SQL que recuperaba el menú completo de un restaurante solía devolver resultados en 200 milisegundos.

Ahora tardaba cuatro segundos.

Cuatro segundos es la diferencia entre que alguien haga un pedido y que alguien cierre la app. Leo había ejecutado el plan de consulta. Tom había revisado la configuración del índice. Priya había aumentado el recuento de réplicas de lectura. Nada de eso había marcado una diferencia significativa.

Y eso cambió el ambiente en la sala.

---

**El Primer Intento: Más Índices**

Leo tenía el plan de consulta abierto. Lo recorrió con cuidado.

«El problema es esta unión», dijo. «Cuando extraemos el menú de un restaurante, unimos la tabla menu_items con la tabla modifiers, luego con la tabla combos y luego con la tabla availability_windows. Cuatro tablas, tres uniones, cincuenta mil filas.»

Añadió un índice en `restaurantId` en cada tabla. Ejecutó la consulta de nuevo. Dos segundos. Mejor, pero no lo suficientemente bueno.

Tom había leído algo sobre las sugerencias de consulta (query hints). Pasó una tarde haciendo ajustes. Un coma tres segundos. Todavía no era bueno.

«¿Y si desnormalizamos?» preguntó Leo. «Combinar los modificadores en una columna JSON directamente en la tabla menu_items. Menos uniones.»

Lo intentaron. Un segundo justo. Pareció un progreso. Maya envió un mensaje a los socios restauradores diciéndoles que habían solucionado el problema de velocidad. Eso fue un martes.

Para el jueves la consulta había vuelto a 2,8 segundos. Sus datos habían crecido. Se habían incorporado más restaurantes. Más elementos por restaurante. La consulta que parecía resuelta no estaba resuelta.

«El enfoque de los índices se mantiene al día con los datos de hoy», dijo Priya. «Pero estamos añadiendo cuarenta restaurantes por semana. Para el próximo trimestre tendremos el doble de elementos. ¿Cómo se verá la consulta entonces?»

«Tres segundos como mínimo», dijo Leo. «Probablemente cinco.»

«Así que nos hemos comprado unas pocas semanas.»

«Sí.»

Se quedaron con eso. Una solución que caduca no es realmente una solución.

---

**El Segundo Intento: Réplicas de Lectura**

Priya ya había aumentado el recuento de réplicas de lectura una vez. Lo intentó de nuevo — dos réplicas de lectura ahora, y la aplicación balanceaba la carga entre ellas. La teoría era sólida: repartir el tráfico de lectura, cada réplica hace menos trabajo.

Ayudó un poco. La carga pico bajó de 2,8 segundos a 2,2 segundos.

«Eso es porque el cuello de botella no es el número de lecturas», dijo Tom, mirando las métricas de la base de datos. «Es la consulta en sí. Más réplicas significa más servidores ejecutando la misma consulta lenta. La consulta sigue siendo lenta.»

«¿Cuánto cuesta eso al mes?» añadió, porque siempre preguntaba. «Dos réplicas de lectura adicionales en una db.r5.large — eso son unos 350 dólares al mes. Para una mejora de dos segundos.»

Leo cerró el panel de réplicas.

«Así que más hardware no arregla una consulta mala», dijo Maya.

«Cuando un problema sobrevive a la indexación, los intentos de caché y réplicas adicionales», dijo Leo despacio, «quizás el problema no es la configuración. Quizás es la forma del sistema.»

Ese fue el comienzo de una conversación más larga.

---

*La semana anterior, el equipo finalmente había puesto RDS bajo control. Standby Multi-AZ, respaldos automatizados, una réplica de lectura encargándose de las consultas de informes. El problema del DBA — el que solía despertar a Leo por las noches — estaba resuelto. La capa de base de datos gestionada era estable. Pero estable no significaba rápida, y rápida era ahora el problema. La tabla del menú había empezado a chocar con límites que más réplicas no podían arreglar. La forma misma de los datos era incorrecta.*

---

**El Problema de Encajar Todo en una Tabla**

Aquí está la tensión fundamental de las bases de datos relacionales: están diseñadas para almacenar datos *estructurados* en formas *fijas*.

Si cada elemento del menú tuviera los mismos campos — nombre, precio, descripción, categoría — SQL sería perfecto. Tendrías una tabla `menu_items` limpia, filas para cada elemento y consultas que tienen sentido.

Pero los menús reales no funcionan así.

Un elemento podría tener un modificador de «nivel de picante». Otro podría tener una «elección de proteína». Un tercero podría tener combinaciones anidadas — «pide el menú familiar y obtienes dos platos principales, dos acompañamientos y una bebida». La estructura de los datos varía *por elemento*.

En SQL, tienes dos opciones:

**Opción 1**: Crear una columna para cada modificador posible. Esto produce una tabla muy ancha donde la mayoría de las columnas están vacías la mayor parte del tiempo.

**Opción 2**: Crear una tabla de modificadores separada y unirla a la tabla de elementos del menú. Esto funciona, pero los menús complejos requieren múltiples uniones y, con cincuenta mil elementos y un alto volumen de lectura, esas uniones se vuelven costosas.

«Hay una tercera opción», dijo Priya, que había estado leyendo documentación en silencio en un rincón.

Abrió una nueva pestaña. «¿Y si los datos no tuvieran que encajar en una tabla?»

**Una Forma Diferente de Pensar los Datos**

Las bases de datos relacionales almacenan datos como filas en tablas. Cada fila debe ajustarse al esquema de la tabla. El esquema se acuerda de antemano.

Las bases de datos NoSQL almacenan datos de manera diferente. Un enfoque común es el *modelo de documento*: cada registro se almacena como un documento autónomo (normalmente JSON) y los documentos de la misma colección no tienen que tener los mismos campos.

Un elemento del menú en un modelo de documento podría verse así:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Otro elemento podría verse completamente diferente:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Formas diferentes. La misma colección. Sin problema.

«Entonces la base de datos se parece más a un sistema de archivo que a una tabla», dijo Maya.

«Exactamente», dijo Priya. «Puedes poner cualquier documento en cualquier cajón. No tienes que cortar el documento para que encaje en un tamaño fijo.»

**Conoce DynamoDB**

Amazon DynamoDB es el servicio de base de datos NoSQL gestionado de AWS. Almacena datos como elementos (no filas) y los elementos se recopilan en tablas (la nomenclatura es similar a SQL, pero el comportamiento es diferente).

Cada elemento en una tabla de DynamoDB debe tener una **clave primaria**, que lo identifica de forma única. Todo lo demás es flexible.

La clave primaria puede tener una de dos formas:

**Solo clave de partición**: Un único atributo que debe ser único en todos los elementos.

**Clave de partición + clave de clasificación (clave primaria compuesta)**: Dos atributos que *juntos* forman una combinación única. Esto te permite tener múltiples elementos con la misma clave de partición, diferenciados por su clave de clasificación.

Para el menú de Nimbus:

- Clave de partición: `restaurantId`
- Clave de clasificación: `itemId`

Esto significa que puedes recuperar todos los elementos de un restaurante específico de forma eficiente — DynamoDB sabe exactamente en qué partición buscar.

«¿Por qué se llama clave de partición?» preguntó Tom.

«¿Y qué pasa si alguien intenta entrar a la fuerza?» preguntó Priya. «Si la clave de partición es adivinable, ¿podría alguien saturar una partición con escrituras y provocar la condición de punto caliente intencionadamente?»

«Sí», dijo Leo. «Eso es en realidad un vector de denegación de servicio para tablas mal diseñadas. Lo cual es una razón más para elegir claves de alta cardinalidad.»

Priya lo anotó.

**Cómo DynamoDB Almacena los Datos Internamente**

DynamoDB está construido para escalar horizontalmente a tamaños enormes. Lo logra mediante la *partición* — los datos se dividen en muchas máquinas físicas basándose en la clave de partición.

Cuando escribes un elemento, DynamoDB genera un hash del valor de la clave de partición y usa ese hash para determinar qué partición física (y por lo tanto qué servidor) almacena el elemento. Cuando lees un elemento, DynamoDB hace el mismo cálculo para encontrarlo instantáneamente.

Piénsalo como un sistema postal. Si cada sobre tiene un código postal, el servicio postal no lee cada sobre para saber dónde pertenece — lo ordena por código postal. DynamoDB ordena por hash de la clave de partición.

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «¿Por qué importa tanto la elección de la clave de partición? ¿No podemos simplemente elegir cualquier cosa?»

Esta es la pregunta correcta. La clave de partición es la decisión de diseño más importante en un esquema de DynamoDB. Aquí está el porqué:

Si eliges una clave de partición con baja cardinalidad — digamos, `available: true/false`, o `category: "main/side/drink"` — la mayoría de tus datos aterrizan en las mismas pocas particiones. DynamoDB llama a esto una «partición caliente». Un servidor maneja la mayoría del tráfico. Se sobrecarga. DynamoDB empieza a limitar las solicitudes. Los usuarios empiezan a ver errores.

- **Buena**: Alta cardinalidad, valores distribuidos uniformemente (`restaurantId` con muchos restaurantes)
- **Mala**: Baja cardinalidad (`true/false`, `category`) — la mayoría de los datos aterrizan en unas pocas particiones, creando «puntos calientes»

«Entonces si usara `available: true` como clave de partición», dijo Leo lentamente, «todos los elementos disponibles se apilarían en la misma partición.»

«Y tu base de datos se fundiría en la hora punta de la cena», confirmó Priya.

Leo cerró su portátil lentamente.

---

**El Incidente de la Partición Caliente**

No tendrían que imaginarlo. Meses más tarde — durante su segundo mes con DynamoDB, antes de que hubieran interiorizado realmente la regla — lo aprenderían por las malas.

El equipo había lanzado una nueva función: una insignia de «Elementos Destacados». Los socios restauradores podían marcar hasta cinco elementos como destacados. La función almacenaba un atributo `featured: true` en cada elemento.

Leo pensó que sería útil consultar todos los elementos destacados de todos los restaurantes — para un widget de «elementos en tendencia» en la página de inicio. Había creado un índice secundario para admitir esta consulta. El índice usaba `featured` como su clave de partición.

«Estará bien», había dicho. «¿Cuántos elementos destacados puede haber?»

Unos mil doscientos, repartidos en doscientos cuarenta restaurantes.

Pero el widget de «elementos en tendencia» se cargaba en cada página. Cada carga de página activaba una consulta contra el índice `featured`. Los mil doscientos elementos vivían en dos particiones — `true` y `false`. La partición `true` recibía cada golpe.

Hora punta de la cena del viernes por la noche. Ocho mil usuarios concurrentes. Todos cargando la página de inicio.

La tasa de error de DynamoDB se disparó al dieciocho por ciento. Algunos usuarios obtuvieron un widget de tendencias vacío. Algunos obtuvieron indicadores de carga giratorios. Algunos obtuvieron errores que se propagaron hasta el flujo de pedidos.

Leo extrajo las métricas. «La partición del índice está siendo limitada», dijo. «Estamos alcanzando el límite de rendimiento en una sola partición.»

«¿Cómo?» preguntó Priya.

«La clave `featured` solo tiene dos valores. Los mil doscientos elementos destacados viven en la misma partición. Cada carga de la página de inicio golpea esa partición.»

Desactivaron el widget de tendencias en tres minutos. La tasa de error bajó a cero.

«Así que una clave de partición de dos valores nos limitó un viernes por la noche», dijo Tom.

«Sí», dijo Leo.

«¿Cuánto nos costó eso?»

«Unos cuarenta minutos de experiencia degradada para ocho mil usuarios», dijo Priya. «Impacto en ingresos, probablemente unos pocos cientos de pedidos.»

Leo reemplazó el índice con un diseño diferente: una tabla de DynamoDB dedicada llamada `featured_items` con `restaurantId` como clave de partición y una Lambda programada — un pequeño fragmento de código que AWS ejecuta por ti (Capítulo 20) — que la actualizaba cada quince minutos desde la tabla principal. La consulta se convirtió en un escaneo sobre una tabla pequeña y aislada en lugar de una partición caliente en la principal.

«Diseña tus patrones de acceso primero», dijo Priya. «Luego elige tu modelo de datos.»

«Lo sé», dijo Leo. «Ahora lo sé.»

---

**Leer y Escribir a Escala**

DynamoDB puede manejar millones de solicitudes por segundo. Pero necesita saber cuánta capacidad aprovisionar.

Hay dos modos de capacidad:

**Capacidad aprovisionada**: Especificas cuántas unidades de lectura y escritura quieres. DynamoDB reserva esa capacidad para ti y limita el tráfico que la supera. Coste predecible, precio más bajo por solicitud.

Las unidades tienen definiciones precisas, y el examen espera que las conozcas: una **Unidad de Capacidad de Lectura (RCU)** es una lectura fuertemente consistente por segundo de un elemento de hasta 4 KB — o dos lecturas eventualmente consistentes del mismo tamaño. Una **Unidad de Capacidad de Escritura (WCU)** es una escritura por segundo de un elemento de hasta 1 KB. Los elementos más grandes consumen proporcionalmente más: leer un elemento de 12 KB de forma fuertemente consistente cuesta 3 RCU; escribir un elemento de 3 KB cuesta 3 WCU.

**Capacidad bajo demanda**: DynamoDB escala automáticamente con tu tráfico real. No requiere planificación de capacidad rutinaria. Mayor coste por solicitud y mucho más simple operativamente, aunque los picos repentinos muy por encima del patrón de tráfico reciente de una tabla todavía pueden causar limitación si se incrementan demasiado rápido.

Para Nimbus, el menú se lee con mucha más frecuencia de lo que se escribe. Un cliente abre la app, navega por el menú — eso son muchas lecturas. Un socio restaurador actualiza su menú dos veces por semana — eso son escrituras ocasionales.

«El modo bajo demanda tiene sentido por ahora», dijo Tom. «Todavía no conocemos nuestros patrones de tráfico. Mejor pagar más por solicitud que aprovisionar de menos y recibir limitación.»

Sabiduría de infraestructura reluctante. De Tom. El equipo había crecido oficialmente.

«¿Cuánto cuesta eso al mes?» preguntó Tom, abriendo la calculadora de precios.

«A nuestro volumen de lectura actual — unas cuarenta mil lecturas por día — bajo demanda son alrededor de doce dólares al mes», dijo Leo. «Aprovisionado, si lo ajustamos bien, está más cerca de cuatro. Pero tendríamos que configurar la capacidad manualmente y arriesgarnos a la limitación si nos equivocamos.»

Tom anotó ambas cifras. Siempre anotaba las cifras.

**Consistencia: ¿Qué Tan Actualizados Están Tus Datos?**

DynamoDB replica datos en múltiples Zonas de Disponibilidad automáticamente. Eso es excelente para la durabilidad, pero también significa que debes pensar con claridad sobre la consistencia de lectura.

Cuando lees de DynamoDB, tienes una elección:

**Lectura eventualmente consistente**: Este es el valor predeterminado. Es más barata y el resultado podría quedar brevemente por detrás de una escritura reciente completada.

**Lectura fuertemente consistente**: Para lecturas contra una tabla o un índice secundario local, DynamoDB puede devolver el último valor confirmado de escrituras previas exitosas. Esto cuesta más capacidad de lectura y no está disponible para los índices secundarios globales.

Para los datos del menú, la consistencia eventual está bien. Un elemento del menú que tiene un milisegundo de retraso no importa.

Para los datos de confirmación de pedidos — «¿se ha realizado este pedido?» — querrías consistencia fuerte. El cliente no debería ver un mensaje de «inténtalo de nuevo» cuando su pedido acaba de guardarse.

«Es como la diferencia entre consultar tu saldo bancario en la app frente a llamar al banco directamente», dijo Maya. «La app puede ir treinta segundos por detrás. La llamada telefónica siempre está al día.»

Quizás te estés preguntando: si DynamoDB replica en múltiples AZ automáticamente, ¿por qué importa siquiera el modo de consistencia? Aquí está la respuesta: la replicación tarda una cantidad de tiempo pequeña pero distinta de cero — milisegundos, normalmente. Una lectura eventualmente consistente podría ser servida desde una réplica que aún no ha recibido la última escritura. Una lectura fuertemente consistente siempre contacta la copia primaria de los datos. Para la mayoría de los casos de uso (elementos de menú, catálogos de productos, perfiles de usuario) el retraso es imperceptible. Para los casos de uso donde la corrección importa en el momento de la lectura (confirmación de pago, disponibilidad de inventario), quieres consistencia fuerte.

**Índices Secundarios: Consultar Más Allá de la Clave Primaria**

¿Qué pasa si necesitas acceder a los datos de una forma diferente a la que permite la clave primaria?

DynamoDB admite **índices secundarios** — claves alternativas que te permiten consultar los mismos datos usando atributos diferentes.

**Índice Secundario Local (LSI)**: Usa la misma clave de partición que la tabla, pero una clave de clasificación diferente. Debe definirse en el momento de creación de la tabla y no se puede añadir después. Comparte la capacidad aprovisionada de la tabla. Como los LSI comparten la partición, admiten lecturas fuertemente consistentes.

**Índice Secundario Global (GSI)**: Un índice completamente separado con su propia clave de partición y clave de clasificación — diferente de la clave primaria de la tabla. Se puede añadir o eliminar después de que exista la tabla, lo que te da flexibilidad. Tiene sus propias configuraciones de capacidad aprovisionada, separadas de la tabla.

Para Nimbus: si necesitaran consultar elementos por rango de precio, un GSI podría admitir eso — pero con una regla en mente: una clave de partición solo acepta comparaciones de *igualdad*, así que `price` (sobre el que quieres hacer rangos) debe ser la **clave de clasificación**, con un atributo de agrupación como la categoría o `cuisineType#region` como clave de partición del GSI. Ese es exactamente el índice construido en el recorrido a continuación.

Si eliges un LSI, entonces obtienes consistencia fuerte y capacidad compartida, pero quedas atado a ese diseño en la creación de la tabla; si eliges un GSI, entonces obtienes flexibilidad para añadirlo después y escalado independiente, pero pierdes la capacidad de hacer lecturas fuertemente consistentes contra el índice.

---

**Un Recorrido por una Consulta GSI**

Priya recorrió un ejemplo concreto. Nimbus quería admitir una función de «explorar por cocina»: mostrar todos los platos disponibles de un tipo de cocina particular en todos los restaurantes socios.

La tabla principal tiene `restaurantId` como clave de partición e `itemId` como clave de clasificación. No puedes consultar «todos los elementos con cuisineType = Colombian» de forma eficiente — eso requeriría un escaneo en todas las particiones.

Crearon un GSI:

- Clave de partición del GSI: `cuisineType#region` (p. ej., "Colombian#NYC", "Mexican#Chicago")
- Clave de clasificación del GSI: `price`

El GSI duplica una proyección de cada elemento — solo los campos necesarios para la página de exploración — en el almacenamiento del índice. Ahora una consulta contra el GSI con `cuisineType#region = "Colombian#NYC"` va directamente a esa partición del índice.

«¿Por qué no usar simplemente `cuisineType` solo?» preguntó Leo.

«Porque cuisineType solo tiene baja cardinalidad», dijo Priya. «Colombiana, mexicana, tailandesa — veinte valores en total. Particiones calientes de nuevo. Añadir la región nos da Colombian#NYC, Colombian#Chicago, Colombian#LA. Más particiones, mejor distribución.»

«Eso parece un poco chapucero.»

«Es un patrón estándar de DynamoDB. Se llama fragmentación de clave de partición (partition key sharding). A veces tienes que trabajar con la herramienta.»

La consulta GSI en código se veía así:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Eso devolvió todos los platos colombianos en la ciudad de Nueva York con un precio entre $10 y $25, ordenados por precio, en unos 4 milisegundos.

«Eso es mil veces más rápido que la antigua consulta SQL», dijo Leo.

«Porque solo toca una partición de un índice», confirmó Priya. «No escanea cada fila de una tabla unida.»

---

**DynamoDB Streams: Reaccionar a los Cambios**

«¿Hemos pensado en lo que pasa cuando se actualiza un elemento del menú?» preguntó Priya una mañana. «Un socio restaurador cambia un precio. Necesitamos actualizar el índice de búsqueda. Necesitamos invalidar la entrada de ElastiCache» — el servicio de caché que conoceremos en el próximo capítulo — «y necesitamos registrar el cambio para nuestra canalización de analítica.»

«Podríamos hacer todo eso en el manejador de la API», dijo Leo. «Cuando ocurre la escritura, activar todas las actualizaciones posteriores.»

«¿Y si una de ellas falla?»

«Entonces... reintentamos.»

«¿Qué pasa si la instancia EC2 se cae después de la escritura pero antes de las actualizaciones posteriores? Los datos están guardados, pero nada sabe del cambio.»

Leo lo pensó.

«Necesitamos que la actualización esté garantizada», dijo. «Incluso si nuestro código de aplicación falla a mitad de camino.»

Esto es lo que resuelve **DynamoDB Streams**.

DynamoDB Streams captura un registro ordenado en el tiempo de cada modificación de elemento en una tabla de DynamoDB. Cada inserción, actualización y eliminación se escribe en el stream como un evento. El stream retiene los eventos durante 24 horas.

Puedes adjuntar una función Lambda al stream. Cada vez que cambia un elemento, la función Lambda se invoca con el estado anterior y posterior del elemento. La Lambda puede entonces:

- Actualizar un índice de búsqueda (OpenSearch)
- Invalidar una entrada de caché en ElastiCache
- Enviar una notificación a otro sistema
- Alimentar una canalización de analítica
- Replicar el cambio a otra tabla o base de datos

La diferencia crítica: Streams desacopla la escritura de los efectos posteriores. La escritura en DynamoDB tiene éxito independientemente de si la Lambda tiene éxito. Si la Lambda falla, DynamoDB la reintenta. Si la aplicación se cae después de la escritura, el evento del stream sigue ahí — la Lambda lo procesará cuando las cosas se recuperen.

«Así que escribimos en DynamoDB», dijo Leo despacio, «y DynamoDB garantiza que el procesamiento posterior ocurre eventualmente, incluso si nos caemos.»

«Exactamente», dijo Priya. «Es la diferencia entre esperar que todos tus efectos secundarios se ejecuten y que la base de datos los garantice.»

Para Nimbus, conectaron DynamoDB Streams en la tabla del menú a una Lambda que invalidaba las entradas de ElastiCache cuando los elementos del menú cambiaban. La caché se mantenía consistente con la base de datos, automáticamente, sin ningún código de aplicación gestionando la invalidación.

«¿Cuánto cuesta Streams?» preguntó Tom.

«Pagas por leer del stream — cada invocación de Lambda lee de él. A nuestro volumen, probablemente dos o tres dólares al mes.»

Tom lo aprobó sin más preguntas. Había aprendido cuándo dos dólares al mes valían la pena.

**La Concesión: Lo que DynamoDB No Puede Hacer**

NoSQL no es estrictamente mejor que SQL. Es una herramienta diferente para un trabajo diferente.

Lo que DynamoDB sacrifica:

**Consultas flexibles**: En SQL, puedes filtrar y ordenar por cualquier columna. En DynamoDB, solo puedes consultar eficientemente por clave primaria. Consultar por campos arbitrarios requiere un *escaneo* (leer cada elemento de la tabla), que es caro y lento a escala.

**Uniones**: DynamoDB no hace uniones. Si necesitas datos de dos tablas, haces dos lecturas separadas en el código de tu aplicación.

**Transacciones**: DynamoDB admite transacciones, pero las bases de datos relacionales siguen siendo la opción más natural para muchos flujos de trabajo con múltiples entidades, sistemas con muchos informes y diseños con muchas uniones.

**Familiaridad**: Décadas de herramientas, habilidades y modelos mentales de SQL no se transfieren directamente.

Lo que DynamoDB hace de maravilla:

- Patrones de acceso de clave-valor y documento
- Escala masiva (latencia de un solo dígito en milisegundos a cualquier tamaño)
- Serverless, sin gestión de infraestructura
- Escalado automático, replicación Multi-AZ, respaldos
- Rendimiento predecible independientemente del volumen de datos

«Entonces la regla es», dijo Maya, «usa DynamoDB cuando sabes *exactamente* cómo accederás a los datos. Usa SQL cuando todavía no lo sabes.»

Priya asintió. «Diseña tus patrones de acceso primero. Luego elige tu base de datos.»

Esta es una de las cosas más senior que puede producir una conversación sobre bases de datos.

---

**Cuándo DynamoDB Es la Elección Equivocada**

Tom, que se había encargado del módulo de informes financieros, tenía una pregunta.

«Estamos construyendo los informes financieros», dijo. «Resúmenes mensuales de ingresos por restaurante, cálculos de impuestos, historial de facturas. ¿Podemos poner eso también en DynamoDB?»

El equipo se miró entre sí.

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya, antes de que Priya pudiera.

Priya sonrió. Maya estaba adquiriendo la costumbre.

«Cuéntanos las consultas», le dijo Priya a Tom.

Él abrió la especificación. «Necesitamos: ingresos totales por restaurante, agrupados por semana. Los elementos de mejor rendimiento por cantidad de pedidos, en todos los restaurantes. Ingresos desglosados por tipo de cocina. Valor promedio de pedido por ciudad. Comparación interanual para los informes de socios.»

Leo leyó la lista. «Cada una de esas es una agregación. Suma, agrupación, promedio, comparación.»

«DynamoDB no tiene funciones de agregación», dijo Priya. «Sin GROUP BY. Sin SUM. Sin AVG. Para responder "ingresos totales por restaurante esta semana", tendrías que escanear cada pedido de la semana, extraerlo todo a la memoria de la aplicación y calcularlo tú mismo.»

«Eso suena mal», dijo Tom.

«A nuestra escala, son decenas de miles de registros extraídos a la memoria por cada solicitud de informe. Sería lento y caro. Y cada vez que añadiéramos un nuevo requisito de informe, estaríamos escribiendo nuevo código de escaneo y cálculo.»

«¿Entonces qué usamos?»

«¿Para informes financieros? RDS. PostgreSQL con índices adecuados. Las consultas que describiste son exactamente para lo que se diseñó SQL. Serían diez líneas de SQL. Serían doscientas líneas de código de escaneo de DynamoDB.»

DynamoDB es la opción equivocada cuando:

- No conoces tus patrones de acceso de antemano (los informes son inherentemente exploratorios)
- Necesitas agregaciones (SUM, GROUP BY, COUNT) en grandes conjuntos de datos
- Tus datos tienen relaciones complejas y necesitas uniones
- Necesitas flexibilidad de consulta ad hoc — para hacer preguntas en las que aún no has pensado
- Tus datos tienen una estructura fundamentalmente relacional que no se mapea de forma natural a clave-valor

«Así que la elección no es "la nueva tecnología es mejor"», dijo Maya.

«La elección es "qué forma tienen tus datos y cómo accederás a ellos"», confirmó Priya. «DynamoDB es genuinamente mejor para el menú. Sería genuinamente peor para los informes financieros. Ambas afirmaciones son ciertas al mismo tiempo.»

Tom construyó los informes financieros sobre PostgreSQL. La primera consulta GROUP BY que escribió devolvió resultados en 80 milisegundos. No tuvo que escribir una sola línea de código de escaneo.

---

**Cuándo Usar Cada Una**

| Situación                                             | Recurre a               |
|-------------------------------------------------------|-------------------------|
| Datos estructurados, consultas complejas, informes     | RDS (PostgreSQL, MySQL) |
| Formas de datos flexibles, acceso por clave, escala masiva | DynamoDB           |
| Alta escritura con relaciones complejas               | RDS                     |
| Alta lectura con patrones de acceso predecibles        | DynamoDB                |
| Necesitas uniones y agregados                         | RDS                     |
| Necesitas latencia en milisegundos a millones de req/seg | DynamoDB             |
| Transacciones entre múltiples entidades               | RDS (generalmente)      |
| Serverless / picos de tráfico impredecibles           | DynamoDB bajo demanda   |
| Informes financieros, analítica ad hoc                | RDS o un data warehouse |
| Event sourcing, captura de cambios, procesamiento en tiempo real | DynamoDB + Streams |

La respuesta incorrecta siempre es «usa siempre una u otra». Nimbus terminó usando ambas: RDS para el historial de pedidos y los registros financieros (estructurados, relacionales, necesita informes), DynamoDB para el menú (esquema flexible, alto volumen de lectura, acceso por ID de restaurante).

## La Base de Datos Correcta para la Carga de Trabajo Correcta

Avanza seis meses — mucho después de que la migración a DynamoDB se hubiera asentado — y Nimbus tenía tres proyectos nuevos sobre la mesa. Maya guió al equipo a través de ellos un martes por la mañana.

«Primero: un motor de recomendaciones. Queremos mostrar a los clientes platos que es probable que pidan basándonos en su historial y en lo que pidieron personas con gustos similares. Segundo: estamos moviendo los datos del menú para admitir contenido más rico — documentos de menú completos en JSON, estructura diferente por restaurante, esquema flexible. Tercero: estamos a punto de cerrar la adquisición de Barato, y su equipo de datos ejecuta un clúster de Cassandra para los datos de comportamiento de los clientes. Quieren llevarlo a AWS sin reescribir sus canalizaciones.»

Tres proyectos. Tres requisitos de datos muy diferentes. Ninguno de ellos encajaba de forma obvia con DynamoDB.

«Todos estos necesitan bases de datos diferentes», dijo Priya.

«Tenemos DynamoDB», dijo Leo.

«Tenemos el derecho de elegir la herramienta correcta», dijo Priya.

**Amazon DocumentDB: Cuando Tu Carga de Trabajo Habla MongoDB**

El segundo proyecto — documentos de menú JSON ricos con esquemas flexibles por restaurante — describía una base de datos de documentos. Nimbus ya usaba el esquema flexible de DynamoDB para el menú, pero a medida que el equipo construía funciones de menú más sofisticadas (modificadores anidados, precios basados en el tiempo, estructuras de combos complejas), el modelo de consulta de DynamoDB estaba mostrando sus límites. El equipo quería consultas de documentos más ricas: encontrar todos los elementos del menú donde un modificador anidado contiene una opción específica, filtrar por campos arbitrarios dentro de la estructura JSON.

«Ese es un patrón de base de datos de documentos», dijo Priya. «MongoDB.»

«Podríamos ejecutar MongoDB en EC2», ofreció Leo.

«O podríamos usar DocumentDB», dijo Priya.

**Amazon DocumentDB** es una base de datos de documentos gestionada compatible con MongoDB. Almacena datos como documentos similares a JSON con esquemas flexibles — diferentes documentos en la misma colección pueden tener campos diferentes. DocumentDB admite el lenguaje de consulta, las API y los controladores de MongoDB. Si tu carga de trabajo se ejecuta actualmente en MongoDB, DocumentDB habla el mismo idioma. La ruta de migración es mover una cadena de conexión, no reescribir una aplicación.

DocumentDB está completamente gestionado: sin parches, respaldos automatizados, alta disponibilidad Multi-AZ, réplicas de lectura y almacenamiento que crece automáticamente a medida que crecen tus datos.

«Así que migramos el menú a DocumentDB», dijo Leo. «¿Y las consultas que ya tenemos en sintaxis de MongoDB simplemente funcionan?»

«Con pruebas menores de compatibilidad, sí», confirmó Priya. «DocumentDB admite la mayoría de la API de consultas de MongoDB. Revisa la matriz de compatibilidad antes de asumir cobertura total, pero para las consultas de documentos y las agregaciones, es sencillo.»

La señal del examen para DocumentDB es simple: **"compatible con MongoDB"** o **"almacén de documentos"**. Si un escenario menciona MongoDB o datos orientados a documentos, DocumentDB es la respuesta gestionada de AWS.

**Amazon Neptune: Cuando las Relaciones Son los Datos**

El motor de recomendaciones era un problema más difícil.

La pregunta no era «¿qué pidió este cliente?» — eso era una simple búsqueda en DynamoDB. La pregunta era: «¿qué clientes tienen perfiles de gusto similares a este cliente, y qué platos les han gustado a esos clientes que este cliente aún no ha probado?»

Eso es un problema de grafos. El modelo de datos no es una tabla de filas ni una colección de documentos. Es una red de relaciones: clientes conectados a platos (pedidos, valorados, vistos), platos conectados a restaurantes y tipos de cocina, restaurantes conectados a barrios y ciudades. La recomendación no está en los puntos de datos — está en los caminos entre ellos.

«Necesitamos una base de datos de grafos», dijo Priya.

**Amazon Neptune** es una base de datos de grafos completamente gestionada. Admite dos modelos de grafos: **grafo de propiedades** (consultado con el lenguaje de recorrido Gremlin) y **RDF** (consultado con SPARQL). Eliges en función de tu pila de grafos existente o de la preferencia del equipo; ambos se ejecutan sobre la misma infraestructura de Neptune.

Las bases de datos de grafos están diseñadas específicamente para cargas de trabajo donde las relaciones entre los puntos de datos son tan importantes como los datos en sí: redes sociales (quién está conectado con quién), motores de recomendaciones (qué les ha gustado a usuarios similares), detección de fraude (qué transacciones comparten patrones sospechosos entre cuentas) y grafos de conocimiento (cómo se relacionan los conceptos).

Para el motor de recomendaciones de Nimbus: los clientes y los platos se convirtieron en nodos en Neptune. Los eventos de pedido se convirtieron en aristas. Un recorrido de Gremlin podía encontrar, en una sola consulta, todos los platos que los clientes con historiales de pedidos similares habían valorado altamente, ordenados por la fuerza de la conexión — sin las complejas cadenas de JOIN que se requerirían en una base de datos relacional ni las múltiples consultas de ida y vuelta que se necesitarían en DynamoDB.

La señal del examen para Neptune: **"red social", "motor de recomendaciones", "grafo de conocimiento", "detección de fraude"** o **"recorrido de grafos"**. Si un escenario describe datos donde las conexiones importan tanto como los datos en sí, Neptune es la respuesta.

**Amazon Keyspaces: Cassandra Sin las Operaciones**

La adquisición de Barato trajo un clúster de Cassandra al panorama. Cassandra es una base de datos NoSQL de columnas anchas (wide-column) — diseñada para un rendimiento de escritura muy alto y escalabilidad horizontal, comúnmente usada para datos de series temporales, registros de actividad de usuarios y telemetría de IoT. El equipo de datos de Barato la usaba para rastrear el comportamiento de los clientes: qué elementos se veían, cuáles se añadían al carrito, cuáles se abandonaban.

Migrar Cassandra a AWS tenía dos opciones: ejecutarlo en EC2 (la carga operativa de gestionar el clúster, las actualizaciones, el escalado) o usar la opción gestionada.

«Amazon Keyspaces», dijo Priya.

**Amazon Keyspaces** es una base de datos gestionada serverless compatible con Cassandra. Admite el Lenguaje de Consulta de Cassandra (CQL) — el mismo lenguaje de consulta que las canalizaciones de Barato ya estaban usando. Al igual que DocumentDB para MongoDB, Keyspaces es la ruta gestionada: mantén el código de la aplicación tal cual, apúntalo a un punto de conexión de Keyspaces en lugar del clúster autogestionado, y deja que AWS maneje la infraestructura.

Keyspaces escala automáticamente con el tráfico, no requiere planificación de capacidad y es serverless — pagas por las lecturas y escrituras que realmente realizas. Para los datos de rastreo de comportamiento de Barato, este era el modelo correcto: volumen extremadamente variable (hora punta de la cena vs 3 de la madrugada), esquema de columnas anchas, alto rendimiento de escritura.

La señal del examen: **"compatible con Cassandra", "columnas anchas", "CQL"** o **"carga de trabajo de Cassandra"**.

**Elegir la Base de Datos Correcta: Una Tabla de Referencia**

A estas alturas de la historia, el panorama de bases de datos de Nimbus no se parecía en nada al del capítulo siete. La herramienta correcta para cada carga de trabajo:

| Frase Desencadenante | Base de Datos |
|---|---|
| "Compatible con MongoDB" o "almacén de documentos" | DocumentDB |
| "Relaciones de grafos", "red social", "motor de recomendaciones" | Neptune |
| "Compatible con Cassandra" o "columnas anchas" | Keyspaces |
| "Clave-valor a cualquier escala", "latencia de un solo dígito en milisegundos" | DynamoDB |
| "Relacional + serverless", "SQL con autoescalado" | Aurora Serverless |
| "Datos estructurados, consultas complejas, informes" | RDS (PostgreSQL, MySQL) |

«¿Esto va a seguir creciendo?» preguntó Leo, mirando la lista.

«Sí», dijo Maya. «Porque diferentes problemas tienen diferentes formas. Y usar la forma incorrecta te cuesta o rendimiento, o tiempo de desarrollo, o ambos.»

«La pregunta correcta no es "¿qué base de datos deberíamos usar?"», añadió Priya. «Es "¿qué forma tienen nuestros datos y cómo accederemos a ellos?" La base de datos se deriva de la respuesta.»

Eso fue lo más importante que ella había dicho sobre bases de datos en dos años.

## Fortalezas y Limitaciones

**Por qué DynamoDB es potente**:

- Latencia de un solo dígito en milisegundos a cualquier escala
- Completamente gestionado — sin parches, sin configuración de replicación, sin ventanas de mantenimiento
- Replicación Multi-AZ automática (durabilidad incorporada)
- El escalado bajo demanda significa cero planificación de capacidad
- Integración nativa con Lambda, API Gateway, Streams
- Recuperación a un punto en el tiempo (similar a los respaldos automatizados de RDS)
- DynamoDB Streams — captura cada cambio como un evento (útil para procesamiento en tiempo real)

**Donde DynamoDB se complica**:

- El diseño del patrón de acceso es innegociable — los errores son costosos de deshacer
- Las consultas complejas requieren índices secundarios (añade coste y complejidad)
- Los escaneos son caros — evítalos en producción
- El «límite de tamaño de elemento» es 400 KB — los elementos grandes necesitan un almacenamiento diferente
- Los precios pueden sorprenderte si no entiendes los costes de las unidades de lectura/escritura
- Las particiones calientes son asesinas silenciosas — no hay errores hasta que comienza la limitación

## Resumen

El rediseño del esquema había llevado dos días y mucho espacio de pizarra. Elegir una base de datos NoSQL no es solo una decisión técnica — cambia por completo cómo piensas sobre los datos. Pero el resultado fue una tabla de menú que podía crecer a cualquier tamaño sin ralentizarse. Igualmente importante: el equipo aprendió dónde están los límites de DynamoDB, y a qué bases de datos especializadas recurrir cuando el problema cambia de forma.

- DynamoDB es el servicio de base de datos NoSQL gestionado de AWS. Los elementos son documentos flexibles — sin esquema fijo. Cada elemento debe tener una **clave primaria**: una clave de partición sola, o una clave de partición + clave de clasificación. Elige la clave de partición para una distribución uniforme — las particiones calientes causan limitación.
- La capacidad **bajo demanda** se autoescala; la capacidad **aprovisionada** es más barata para tráfico predecible. Las lecturas **eventualmente consistentes** son más baratas; las lecturas **fuertemente consistentes** siempre están al día pero no están disponibles en los GSI.
- **DynamoDB Streams** captura cambios a nivel de elemento en tiempo real — úsalo para impulsar la invalidación de caché, las actualizaciones de índices de búsqueda y las canalizaciones de analítica.
- DynamoDB es la elección equivocada para informes, uniones complejas y consultas ad hoc — usa RDS para eso.
- **DocumentDB** (compatible con MongoDB), **Neptune** (base de datos de grafos) y **Keyspaces** (compatible con Cassandra) son alternativas gestionadas de AWS para cargas de trabajo que no encajan en el modelo de clave-valor de DynamoDB.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.3)*

- Conoce las reglas de la clave de partición: **alta cardinalidad, distribución uniforme**. Los puntos calientes de partición son una trampa común del examen.
- **Bajo demanda vs aprovisionado**: bajo demanda para tráfico impredecible; aprovisionado (con Auto Scaling) para cargas de trabajo predecibles.
- **DynamoDB Streams**: captura cambios a nivel de elemento en tiempo real. Escenario común del examen: «activar una función Lambda cuando cambia un registro».
- **Tablas Globales**: replicación multi-Región y multi-activa para aplicaciones distribuidas globalmente y escenarios de recuperación ante desastres. En el examen, esto es una señal clara cuando la carga de trabajo necesita lecturas y escrituras locales en más de una Región.
- **DynamoDB TTL (Time to Live)**: establece un atributo de marca de tiempo de expiración en los elementos y DynamoDB los elimina automáticamente tras la expiración — **sin coste**, sin consumir capacidad de escritura. Desencadenante del examen: «los datos de sesión/elementos temporales deben eliminarse automáticamente después de N horas al menor coste» → TTL, nunca un escaneo programado con Lambda. Los elementos expirados también pueden fluir a DynamoDB Streams para su archivado.
- **DAX (DynamoDB Accelerator)**: capa de caché en memoria para DynamoDB. Reduce la latencia de lectura de milisegundos a microsegundos. El examen usa esto cuando las réplicas de lectura de RDS no ayudarán (porque es una caché específica de DynamoDB).
- **Clave primaria compuesta**: clave de partición + clave de clasificación permite consultas flexibles dentro de una partición. Ejemplo: recuperar todos los pedidos de un cliente entre dos fechas — `customerId` es la clave de partición, `orderDate` es la clave de clasificación.
- **GSI vs LSI**: el GSI se puede añadir después de la creación de la tabla; el LSI no. El LSI admite lecturas fuertemente consistentes; el GSI no. El LSI comparte la capacidad de la tabla; el GSI tiene la suya propia.
- Sabe cuándo NO usar DynamoDB: uniones complejas, informes ad hoc, transacciones con múltiples entidades → RDS suele ser la respuesta.
- **Selección de base de datos especializada** — el examen presenta con frecuencia un escenario y pregunta qué base de datos encaja. Usa esto como tu referencia rápida: «compatible con MongoDB» → DocumentDB. «Grafo/red social/motor de recomendaciones/grafo de conocimiento» → Neptune. «Compatible con Cassandra/columnas anchas» → Keyspaces. «Clave-valor a cualquier escala/latencia en milisegundos» → DynamoDB. «Relacional/consultas complejas/informes» → RDS o Aurora.

## Ejercicios

**Ejercicio 1 — Recordar**

Explica la diferencia entre una clave de partición y una clave de clasificación. ¿Cuándo usarías ambas?

*(Pista: Piensa en el menú de Nimbus — ¿por qué tener restaurantId como clave de partición e itemId como clave de clasificación hace que recuperar el menú completo de un restaurante sea eficiente?)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa de juegos global almacena perfiles de jugadores en DynamoDB. Cada perfil incluye campos como nombre de usuario, nivel, logros e inventario. Algunos jugadores tienen 10 elementos de inventario; otros tienen unos pocos cientos — los perfiles varían en forma pero cada uno se mantiene cómodamente por debajo del límite de tamaño de elemento de 400 KB de DynamoDB. La empresa necesita una latencia de lectura de un solo dígito en milisegundos para las búsquedas de perfiles durante el juego activo.

¿Qué enfoque de diseño MEJOR admite este requisito?

A) Usar DynamoDB con `playerId` como clave de partición y almacenar todo el perfil como un único elemento  
B) Migrar a RDS Aurora con réplicas de lectura en cada región  
C) Usar DynamoDB con `level` como clave de partición para agrupar jugadores de habilidad similar  
D) Usar ElastiCache delante de RDS para lograr latencia inferior al milisegundo

**Pista 1**: El patrón de acceso es «buscar un jugador específico por ID». ¿Qué clave hace eso eficiente?

**Pista 2**: Una opción crea un terrible punto caliente de partición. ¿Qué atributo tiene muy baja cardinalidad?

**Pista 3**: DynamoDB ya ofrece latencia de un solo dígito en milisegundos de forma nativa.

**Respuesta**: A

**Explicación**: Usar `playerId` como clave de partición distribuye los datos uniformemente entre las particiones y permite búsquedas instantáneas por ID de jugador — exactamente el patrón de acceso descrito. El modelo de documento flexible de DynamoDB maneja tamaños de inventario variables sin cambios de esquema.

**¿Por qué no B?** RDS Aurora con réplicas de lectura añade complejidad y sigue sin ser la primera opción natural para este tipo de búsqueda de perfiles basada en clave a escala de juegos.

**¿Por qué no C?** Usar `level` como clave de partición crea puntos calientes severos — la mayor parte del tráfico va al nivel 1 (jugadores nuevos) o al nivel máximo (veteranos activos), dejando otras particiones inactivas.

**¿Por qué no D?** La pregunta describe DynamoDB, no RDS. Añadir ElastiCache delante de RDS introduce dos nuevos servicios cuando DynamoDB solo resuelve el problema.

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento — Tarea 3.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está añadiendo una función de «favoritos»: los clientes pueden guardar sus elementos de menú favoritos y volver a pedirlos con un toque.

Diseña la tabla de DynamoDB para esta función. ¿Cuál sería la clave de partición? ¿Usarías una clave de clasificación? ¿Cómo sería la estructura del elemento?

Luego considera: ¿qué pasa si necesitas mostrar «los 100 elementos más agregados como favoritos entre todos los clientes»? ¿Puede DynamoDB responder a eso eficientemente? Si no, ¿qué añadirías a la arquitectura?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño para los patrones de acceso.)*

## Escena Post-Créditos

«Ya lo desplegué — oh.» Leo había ejecutado la migración del menú a DynamoDB el jueves por la noche sin decírselo a nadie. Funcionó. Las lecturas eran rápidas. El esquema era flexible. Los socios restauradores podían añadir cualquier campo de modificador que quisieran. Pero se le había olvidado actualizar los paneles de monitorización, y Priya había pasado veinte minutos el viernes por la mañana preguntándose por qué las métricas de la base de datos se habían quedado planas.

Aun así, se sentía bien consigo mismo.

Luego Priya, con los paneles restaurados, miró las métricas.

«Leo», dijo, «cada carga de página está haciendo cuarenta y siete solicitudes a DynamoDB.»

«Una por restaurante mostrado», confirmó Leo. «La página de exploración carga los cuarenta y siete restaurantes más cercanos a la ubicación del cliente.»

«Y cada una de esas solicitudes tarda unos cuatro milisegundos.»

Leo hizo los cálculos. Cuarenta y siete por cuatro. «Eso es... ciento ochenta y ocho milisegundos solo para el menú. Antes de renderizar.»

«En cada carga de página.»

«Para cada cliente.»

Miraba la pantalla.

«Necesitamos una caché», dijo.

En el próximo capítulo: la capa entre la aplicación de Nimbus y su base de datos que hace que las consultas lentas sean rápidas.
