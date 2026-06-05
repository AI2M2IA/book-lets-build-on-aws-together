# Capítulo 9: Cuando la Tabla se Hace Grande

La tabla del menú tenía 50.000 elementos.

Eran de 287 restaurantes, cada uno con especialidades diarias, platos de temporada y variaciones
regionales. Algunos elementos tenían modificadores — tamaño, nivel de picante, elección de proteína. Algunos tenían
menús combinados que hacían referencia a otros elementos. Algunos aparecían en el menú solo los días de semana,
o solo durante el almuerzo, o solo en ciertas ciudades.

La consulta SQL que recuperaba el menú completo de un restaurante solía devolver resultados en 200 milisegundos.

Ahora tardaba cuatro segundos.

Cuatro segundos es la diferencia entre que alguien haga un pedido y que alguien cierre
la app. Leo había ejecutado el plan de consulta. Tom había revisado la configuración del índice. Priya
había aumentado el recuento de réplicas de lectura. Nada de eso había marcado una diferencia significativa.

Y eso cambió el ambiente en la sala.

Cuando un problema sobrevive a la indexación, los intentos de caché y una réplica extra, las personas dejan de
asumir que la solución va a ser ingeniosa.

A veces la solución es que la forma del sistema es incorrecta.

«El problema», dijo Leo, «es la forma de los datos. SQL quiere todo en filas y
columnas. Nuestros menús no tienen una forma fija.»

Ese fue el comienzo de una conversación más larga.

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
  "name": "Arepa de Camarón",
  "price": 3200,
  "modifiers": [
    { "name": "Nivel de Picante", "options": ["suave", "medio", "picante"] },
    { "name": "Proteína", "options": ["camarón", "pescado", "mixto"] }
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
  "name": "Festín Familiar",
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

**Cómo DynamoDB Almacena los Datos Internamente**

DynamoDB está construido para escalar horizontalmente a tamaños enormes. Lo logra mediante la *partición* — los datos se dividen en muchas máquinas físicas basándose en la clave de partición.

Cuando escribes un elemento, DynamoDB genera un hash del valor de la clave de partición y usa ese hash para determinar qué partición física (y por lo tanto qué servidor) almacena el elemento. Cuando lees un elemento, DynamoDB hace el mismo cálculo para encontrarlo instantáneamente.

Piénsalo como un sistema postal. Si cada sobre tiene un código postal, el servicio postal no lee cada sobre para saber dónde pertenece — lo ordena por código postal. DynamoDB ordena por hash de la clave de partición.

Por eso importa elegir una buena clave de partición:

- **Buena**: Alta cardinalidad, valores distribuidos uniformemente (`restaurantId` con muchos restaurantes)
- **Mala**: Baja cardinalidad (`verdadero/falso`, `categoría`) — la mayoría de los datos se acumulan en unas pocas particiones, creando «puntos calientes»

Un punto caliente significa que una partición recibe la mayoría del tráfico. Esa partición se convierte en el cuello de botella. DynamoDB empieza a limitar las solicitudes. Los usuarios empiezan a ver errores.

«Entonces si uso `available: true` como clave de partición», dijo Leo lentamente, «todos los elementos disponibles se apilarían en la misma partición.»

«Y tu base de datos se fundiría en la hora punta de la cena», confirmó Priya.

Leo cerró su portátil lentamente.

**Leer y Escribir a Escala**

DynamoDB puede manejar millones de solicitudes por segundo. Pero necesita saber cuánta capacidad aprovisionar.

Hay dos modos de capacidad:

**Capacidad aprovisionada**: Especificas cuántas unidades de lectura y escritura quieres. DynamoDB reserva esa capacidad para ti y limita el tráfico que la supera. Coste predecible, precio más bajo por solicitud.

**Capacidad bajo demanda**: DynamoDB escala automáticamente con tu tráfico real. No requiere planificación de capacidad rutinaria. Mayor coste por solicitud y mucho más simple operativamente, aunque los picos repentinos muy por encima del patrón de tráfico reciente de una tabla todavía pueden causar limitación si se incrementan demasiado rápido.

Para Nimbus, el menú se lee con mucha más frecuencia de lo que se escribe. Un cliente abre la app, navega por el menú — eso son muchas lecturas. Un socio restaurador actualiza su menú dos veces por semana — eso son escrituras ocasionales.

«El modo bajo demanda tiene sentido por ahora», dijo Tom. «Todavía no conocemos nuestros patrones de tráfico. Mejor pagar más por solicitud que aprovisionar de menos y recibir limitación.»

Sabiduría de infraestructura reluctante. De Tom. El equipo había crecido oficialmente.

**Consistencia: ¿Qué Tan Actualizados Están Tus Datos?**

DynamoDB replica datos en múltiples Zonas de Disponibilidad automáticamente. Eso es excelente para la durabilidad, pero también significa que debes pensar con claridad sobre la consistencia de lectura.

Cuando lees de DynamoDB, tienes una elección:

**Lectura eventualmente consistente**: Este es el valor predeterminado. Es más barata y el resultado podría quedar brevemente por detrás de una escritura reciente completada.

**Lectura fuertemente consistente**: Para lecturas contra una tabla o un índice secundario local, DynamoDB puede devolver el último valor confirmado de escrituras previas exitosas. Esto cuesta más capacidad de lectura y no está disponible para los índices secundarios globales.

Para los datos del menú, la consistencia eventual está bien. Un elemento del menú que tiene un milisegundo de retraso no importa.

Para los datos de confirmación de pedidos — «¿se ha realizado este pedido?» — querrías consistencia fuerte. El cliente no debería ver un mensaje de «inténtalo de nuevo» cuando su pedido acaba de guardarse.

«Es como la diferencia entre consultar tu saldo bancario en la app frente a llamar al banco directamente», dijo Maya. «La app puede ir treinta segundos por detrás. La llamada telefónica siempre está al día.»

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

**Cuándo Usar Cada Una**

| Situación                                                     | Usa                        |
|---------------------------------------------------------------|----------------------------|
| Datos estructurados, consultas complejas, informes            | RDS (PostgreSQL, MySQL)    |
| Formas de datos flexibles, acceso basado en clave, escala masiva | DynamoDB                |
| Alta escritura con relaciones complejas                       | RDS                        |
| Alta lectura con patrones de acceso predecibles               | DynamoDB                   |
| Necesitas uniones y agregados                                 | RDS                        |
| Necesitas latencia en milisegundos a millones de req/seg      | DynamoDB                   |
| Transacciones entre múltiples entidades                       | RDS (generalmente)         |
| Serverless / picos de tráfico impredecibles                   | DynamoDB bajo demanda      |

La respuesta incorrecta siempre es «usa siempre una u otra». Nimbus terminó usando ambas: RDS para el historial de pedidos y los registros financieros (estructurados, relacionales, necesita informes), DynamoDB para el menú (esquema flexible, alto volumen de lectura, acceso por ID de restaurante).

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

## Resumen

- DynamoDB es el servicio de base de datos NoSQL gestionado de AWS.
- Los elementos se almacenan como documentos flexibles — no se requiere un esquema fijo.
- Cada elemento debe tener una **clave primaria**: una clave de partición sola, o una clave de partición + clave de clasificación.
- La clave de partición determina qué partición física almacena el elemento. Elígela para una distribución uniforme.
- La capacidad **bajo demanda** se autoescala; la capacidad **aprovisionada** es más barata si tu tráfico es predecible.
- Las lecturas **eventualmente consistentes** son más baratas y rápidas. Las lecturas **fuertemente consistentes** siempre están al día.
- DynamoDB sobresale en el acceso basado en clave a escala masiva. Tiene problemas con las consultas ad hoc y las uniones.
- Usa RDS para datos relacionales. Usa DynamoDB para datos de documentos/clave-valor. Usa ambas cuando la situación lo requiera.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.3)*

- Conoce las reglas de la clave de partición: **alta cardinalidad, distribución uniforme**. Los puntos calientes de partición son una trampa común del examen.
- **Bajo demanda vs aprovisionado**: bajo demanda para tráfico impredecible; aprovisionado (con Auto Scaling) para cargas de trabajo predecibles.
- **DynamoDB Streams**: captura cambios a nivel de elemento en tiempo real. Escenario común del examen: «activar una función Lambda cuando cambia un registro».
- **Tablas Globales**: replicación multi-Región y multi-activa para aplicaciones distribuidas globalmente y escenarios de recuperación ante desastres. En el examen, esto es una señal clara cuando la carga de trabajo necesita lecturas y escrituras locales en más de una Región.
- **DAX (DynamoDB Accelerator)**: capa de caché en memoria para DynamoDB. Reduce la latencia de lectura de milisegundos a microsegundos. El examen usa esto cuando las réplicas de lectura de RDS no ayudarán (porque es una caché específica de DynamoDB).
- **Clave primaria compuesta**: clave de partición + clave de clasificación permite consultas flexibles dentro de una partición. Ejemplo: recuperar todos los pedidos de un cliente entre dos fechas — `customerId` es la clave de partición, `orderDate` es la clave de clasificación.
- Sabe cuándo NO usar DynamoDB: uniones complejas, informes ad hoc, transacciones con múltiples entidades → RDS suele ser la respuesta.

## Ejercicios

**Ejercicio 1 — Recordar**

Explica la diferencia entre una clave de partición y una clave de clasificación. ¿Cuándo usarías ambas?

*(Pista: Piensa en el menú de Nimbus — ¿por qué tener restaurantId como clave de partición e itemId como clave de clasificación hace que recuperar el menú completo de un restaurante sea eficiente?)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa de juegos global almacena perfiles de jugadores en DynamoDB. Cada perfil incluye campos como nombre de usuario, nivel, logros e inventario. Algunos jugadores tienen 10 elementos de inventario; otros tienen 5.000 configuraciones personalizadas. La empresa necesita una latencia de lectura de un solo dígito en milisegundos para las búsquedas de perfiles durante el juego activo.

¿Qué enfoque de diseño MEJOR admite este requisito?

A) Migrar a RDS Aurora con réplicas de lectura en cada región  
B) Usar DynamoDB con `playerId` como clave de partición y almacenar todo el perfil como un único elemento  
C) Usar DynamoDB con `level` como clave de partición para agrupar jugadores de habilidad similar  
D) Usar ElastiCache delante de RDS para lograr latencia inferior al milisegundo

**Pista 1**: El patrón de acceso es «buscar un jugador específico por ID». ¿Qué clave hace eso eficiente?

**Pista 2**: Una opción crea un terrible punto caliente de partición. ¿Qué atributo tiene muy baja cardinalidad?

**Pista 3**: DynamoDB ya ofrece latencia de un solo dígito en milisegundos de forma nativa.

**Respuesta**: B

**Explicación**: Usar `playerId` como clave de partición distribuye los datos uniformemente entre las particiones y permite búsquedas instantáneas por ID de jugador — exactamente el patrón de acceso descrito. El modelo de documento flexible de DynamoDB maneja tamaños de inventario variables sin cambios de esquema.

**¿Por qué no A?** RDS Aurora con réplicas de lectura añade complejidad y sigue sin ser la primera opción natural para este tipo de búsqueda de perfiles basada en clave a escala de juegos.

**¿Por qué no C?** Usar `level` como clave de partición crea puntos calientes severos — la mayor parte del tráfico va al nivel 1 (jugadores nuevos) o al nivel máximo (veteranos activos), dejando otras particiones inactivas.

**¿Por qué no D?** La pregunta describe DynamoDB, no RDS. Añadir ElastiCache delante de RDS introduce dos nuevos servicios cuando DynamoDB solo resuelve el problema.

*Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento — Tarea 3.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está añadiendo una función de «favoritos»: los clientes pueden guardar sus elementos de menú favoritos y volver a pedirlos con un toque.

Diseña la tabla de DynamoDB para esta función. ¿Cuál sería la clave de partición? ¿Usarías una clave de clasificación? ¿Cómo sería la estructura del elemento?

Luego considera: ¿qué pasa si necesitas mostrar «los 100 elementos más agregados como favoritos entre todos los clientes»? ¿Puede DynamoDB responder a eso eficientemente? Si no, ¿qué añadirías a la arquitectura?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño para los patrones de acceso.)*

## Escena Post-Créditos

Leo había migrado el menú a DynamoDB al final de la semana. Las lecturas eran rápidas. El esquema era flexible. Los socios restauradores podían añadir cualquier campo de modificador que quisieran.

Se sentía bien consigo mismo.

Luego Priya miró el panel de monitorización.

«Leo», dijo, «cada carga de página está haciendo cuarenta y siete solicitudes a DynamoDB.»

«Una por restaurante», confirmó Leo. «Porque el cliente está en la página de exploración general.»

«Y cada una de esas solicitudes tarda unos cuatro milisegundos.»

Leo hizo los cálculos. Cuarenta y siete por cuatro. «Eso es... ciento ochenta y ocho milisegundos solo para el menú. Antes de renderizar.»

«En cada carga de página.»

«Para cada cliente.»

Miraba la pantalla.

«Necesitamos una caché», dijo.

En el próximo capítulo: la capa entre la aplicación de Nimbus y su base de datos que hace que las consultas lentas sean rápidas.
