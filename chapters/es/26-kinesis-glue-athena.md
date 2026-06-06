# Capítulo 26: Darle Sentido a Todo

Tom miraba fijamente una impresión.

Eran dos páginas de números: recuentos de pedidos, totales de ingresos, marcas de tiempo, códigos de región. Le había pedido a Leo que reuniera todo lo disponible sobre los patrones de pedidos del viernes. Leo había pasado una hora escribiendo un script que unía tres fuentes de datos diferentes —DynamoDB, registros de CloudWatch y una exportación de análisis de S3— y esto fue lo que salió.

Los números estaban todos ahí. No le decían nada.

Podía ver que se habían realizado 847 pedidos el viernes. No podía decir cuándo se realizaron, qué restaurantes habían estado más ocupados ni cuál había sido la hora pico. Esa información estaba en los datos. Simplemente era invisible.

---

Toda la optimización de red del capítulo 25 había hecho la infraestructura de Nimbus más rápida y más barata. Pero los datos que esa infraestructura generaba —en DynamoDB, en los registros de CloudWatch, en la exportación de análisis de S3 que se ejecutaba una vez por noche— estaban en tres lugares diferentes, en tres formatos diferentes, sin conexión con nada que Tom pudiera usar realmente.

La pregunta de Maya lo hizo concreto. "¿Cuál es nuestra hora de pedidos más ocupada los viernes?"

Leo la miró. "Eso no está en nuestro panel."

"¿Podemos agregarlo?"

"Los datos están en DynamoDB. Y en los registros de CloudWatch. Y en S3, del trabajo de exportación de análisis." Leo hizo una pausa. "En tres lugares diferentes, en tres formatos diferentes."

Maya agregó: "Y la exportación de análisis solo se ejecuta una vez por noche. Si quieres los datos del viernes, tendrías que esperar hasta el sábado por la mañana."

Tom miró la impresión. "Así que tenemos los datos. Simplemente no podemos usarlos."

Esa frase describe la mitad del análisis moderno.

---

**La Pizarra**

Maya llegó temprano a la oficina y ya había llenado la mitad de la pizarra para cuando Leo llegó.

Siete preguntas, escritas en dos columnas, todas ellas preguntas de negocio, ninguna de ellas respondible desde los paneles actuales:

1. ¿Qué restaurantes tienen la tasa de cancelación de pedidos más alta en los primeros 30 días?
2. ¿Cuál es el tiempo promedio entre que un restaurante recibe una notificación de pedido y la confirma? ¿Cómo varía esto por restaurante y por día de la semana?
3. ¿Qué ciudades tienen la tasa más alta de clientes que vuelven a pedir del mismo restaurante en un plazo de 14 días?
4. ¿Qué porcentaje de pedidos se realizan dentro de la primera sesión de la app vs. sesiones de retorno?
5. ¿Qué categorías de menú generan los mayores ingresos por restaurante?
6. ¿Cuál es la correlación entre el tiempo de respuesta del restaurante y la tasa de repetición de pedidos del cliente?
7. ¿Cómo cambia el volumen de pedidos en las 48 horas antes y después de que un socio restaurante publique en redes sociales?

"¿Podemos responder alguna de estas?", preguntó.

Leo miró la lista. Miró el panel actual: recuento de pedidos, total de ingresos, restaurantes activos.

"La número uno", dijo lentamente. "Parcialmente. Tenemos registros de cancelaciones. Pero tendríamos que unirlos a las fechas de incorporación de los restaurantes, y eso está en un sistema diferente."

"¿La número dos?", preguntó Tom.

"Almacenamos la marca de tiempo de la notificación. Almacenamos la marca de tiempo de la confirmación. Están en tablas diferentes en formatos diferentes. Tendríamos que hacer un JOIN y calcular el delta."

"Así que los datos existen", dijo Maya.

"Los datos existen", confirmó Leo. "Simplemente no tenemos manera de consultarlos de forma cruzada."

"Espera, pero *¿por qué* no podemos simplemente consultar la base de datos?", preguntó Maya. "Tenemos PostgreSQL. Tenemos todos estos datos."

"Porque los datos están en tres lugares", dijo Leo. "Los eventos de pedidos están en DynamoDB. Las marcas de tiempo de las notificaciones están en los registros de CloudWatch. Las fechas de incorporación están en la base de datos RDS PostgreSQL. Y algunos de ellos —las exportaciones de análisis— están en S3 como archivos JSON que nadie ha unido jamás a nada."

Tom miró la pizarra. "Hemos estado generando estos datos durante 18 meses", dijo. "Hemos estado volando a ciegas durante 18 meses."

"A ciegas no", dijo Maya. "Solo cortos de vista. Podíamos ver lo que estaba inmediatamente frente a nosotros. No podíamos ver patrones."

Ese era el encuadre correcto. Los puntos de datos individuales estaban ahí. El sistema para conectarlos no lo estaba.

**Tres Problemas Diferentes**

El problema de datos de Nimbus tenía tres dimensiones:

**Streaming en tiempo real**: Se están realizando pedidos ahora mismo. Quieres ver un panel en vivo de la velocidad de pedidos: cuántos por minuto, por región, por restaurante. Los datos necesitan procesarse a medida que llegan.

**Transformación de datos**: Los datos están en S3 de varios sistemas, en formatos diferentes (JSON, CSV, Parquet). Antes de poder analizarlos, necesitas normalizarlos: mismo esquema, mismo formato, limpios, unidos con datos de referencia.

**Análisis ad-hoc**: Una vez que los datos están organizados, quieres ejecutar consultas SQL contra ellos sin tener que cargarlos primero en una base de datos. "Dame los 10 mejores restaurantes por ingresos de los últimos 30 días." Sin cargar los datos en una base de datos.

Cada uno de estos es un problema distinto. AWS tiene un servicio dedicado para cada uno.

**El Stream en Tiempo Real: Una Cinta de Teletipo para Datos**

Imagina una máquina de cinta de teletipo, del tipo que imprimía los precios de las acciones en un rollo continuo de papel. Los precios se imprimían a medida que cambiaban. Cualquiera que quisiera el precio actual podía leer la cinta. Nadie tenía que esperar a nadie más; la cinta seguía imprimiéndose sin importar cuántas personas la estuvieran leyendo.

Ese es el modelo del streaming de datos en tiempo real. Los productores envían datos a medida que ocurren. Múltiples consumidores pueden leer el stream simultáneamente, cada uno a su propio ritmo, cada uno obteniendo la imagen completa.

**Amazon Kinesis Data Streams** es esa máquina para Nimbus. Cuando se realiza un pedido, la aplicación publica un evento en un stream de Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consumidores de este stream:

- Un panel en tiempo real (lee los eventos a medida que llegan, actualiza las métricas)
- Una Lambda de detección de fraude (busca patrones de pedidos inusuales)
- Un stream a S3 para almacenamiento permanente

**Conceptos de Kinesis Data Streams**:

- **Shard**: La unidad básica de capacidad. Un shard maneja 1 MB/s de escritura, 2 MB/s de lectura.
- **Período de retención**: Los datos permanecen en el stream durante 24 horas (predeterminado), extensible a **365 días** (1 año) con la Retención de Datos Extendida.
- **Número de secuencia**: Cada registro tiene un número de secuencia. Los consumidores rastrean su posición en el stream.

**Amazon Data Firehose** (anteriormente **Kinesis Data Firehose**): El servicio de entrega gestionado entre los productores de streaming y los destinos como S3, Redshift y OpenSearch. Almacena en búfer, comprime, transforma y entrega los datos automáticamente.

Para Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (formato Parquet, comprimido, particionado por fecha).

"Ya lo desplegué... ah." Leo había establecido el recuento de shards en uno sin calcular primero el rendimiento de escritura. Al volumen de pedidos de Nimbus, un shard estaba bien. Lo confirmó antes de que nadie notara que había adivinado.

**El Traductor: Darle Sentido a los Datos Brutos**

Los datos en S3 son brutos. Antes de poder analizarlos de forma eficiente, necesitas descubrir qué hay ahí, transformarlos a un formato consistente, unir diferentes conjuntos de datos y manejar los registros incorrectos y los valores faltantes.

Ese es un trabajo para una capa de traducción dedicada.

**AWS Glue** es un servicio de ETL (Extraer, Transformar, Cargar) totalmente gestionado. Tiene dos componentes principales:

**Glue Data Catalog**: Un almacén de metadatos que describe tus datos de S3: qué tablas existen, qué columnas tienen, dónde están los archivos de datos. Es como un catálogo de fichas para tu data lake.

**Glue Crawlers**: Agentes automatizados que escanean S3, infieren el esquema y pueblan el Data Catalog. Ejecuta un crawler en tu bucket de S3 y 10 minutos después tienes un catálogo de todas tus tablas.

**Glue Jobs**: Trabajos de Spark/Python sin servidor que realizan la transformación real. Escribes la lógica de transformación (o usas la herramienta de ETL visual de Glue), y Glue la ejecuta en infraestructura gestionada.

Para Nimbus:

1. El Glue Crawler escanea los datos de pedidos en S3 → crea una definición de tabla en el Glue Data Catalog
2. El Glue Job transforma los eventos de pedidos JSON brutos en un formato Parquet limpio y particionado
3. Los datos transformados se escriben de vuelta en S3 en un diseño optimizado para consultas

**Cuando el ETL Se Rompe: El Problema de la Evolución del Esquema**

El pipeline de Glue se ejecutó de forma limpia durante las primeras tres semanas. Luego el socio restaurante #412 agregó un nuevo campo a su exportación de menú: `allergen_tags`. El campo era un array de strings —`["gluten", "dairy", "nuts"]`— y apareció en la exportación de datos nocturna del restaurante.

El esquema del Glue job era estricto. Había sido escrito para esperar campos específicos en el JSON del pedido. Cuando encontró `allergen_tags` —un campo que no estaba en el esquema— el Glue job falló.

Seis horas de datos de pedidos de 47 restaurantes (todos usando el mismo formato de exportación de menú que el socio #412) se acumularon en S3 sin procesarse. La ejecución nocturna de Glue que se suponía que haría que los pedidos de la noche anterior fueran consultables por la mañana se había detenido en su lugar a las 2:47 AM y escrito un registro de fallo en CloudWatch.

Tom lo encontró cuando intentó ejecutar una consulta de Athena a las 9 AM y obtuvo `0 rows returned` para las 12 horas anteriores.

"¿El ETL se rompió porque los datos de origen cambiaron?", preguntó Maya, cuando Leo explicó lo que había pasado.

"El ETL se rompió porque el ETL no sabía cómo manejar un cambio de esquema", dijo Leo. "Escribimos un trabajo estricto que esperaba exactamente estos campos. Cuando apareció un nuevo campo, entró en pánico."

"¿Y qué pasa si alguien intenta entrar por la fuerza a través de un cambio de esquema?", preguntó Priya. "¿Un socio restaurante malicioso enviando deliberadamente campos inesperados para colapsar el pipeline?"

La pregunta valía la pena considerarla. Un pipeline de ETL que se colapsa con una entrada inesperada es un vector de denegación de servicio: envía un formato de datos inusual, colapsa el pipeline, y ese restaurante (y todos los demás que comparten el formato) deja de procesarse.

La corrección tenía dos partes:

**Evolución del esquema de Glue**: El dynamic frame de Glue admite la evolución del esquema: los campos que no están en el esquema esperado se pasan en lugar de causar fallos. Habilítalo usando DynamicFrames en lugar de DataFrames en el script del trabajo, con `mergeSchema` establecido en las opciones adicionales. Los nuevos campos se agregan al esquema automáticamente en la próxima ejecución del crawler.

```python
# Antes (estricto, se rompe con nuevos campos)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Después (evolución del esquema habilitada)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Alertas del Glue job**: El fallo del pipeline fue silencioso durante unas seis horas antes de que Tom lo notara. Una alarma de CloudWatch sobre el estado de ejecución del Glue job (`FAILED`) habría alertado al ingeniero de guardia en 5 minutos. El costo de la alarma: diez centavos al mes, efectivamente gratis (la métrica en sí no cuesta nada, y las primeras diez alarmas caen bajo la capa gratuita).

"Seis horas de datos se quedaron sin procesar en S3", dijo Leo, después de volver a ejecutar el Glue job manualmente para ponerse al día. "No se perdió nada, pero el análisis estaba tan atrasado. Si hubiéramos tenido la alarma, el retraso habría sido de 30 minutos."

La lección más amplia: los pipelines de ETL que procesan datos externos necesitan manejar los cambios de esquema de forma elegante. Los socios externos —restaurantes, proveedores de pagos, servicios de entrega— cambiarán sus formatos de datos. El pipeline no debe ser frágil ante esos cambios.

**La Capa de Consulta: SQL Directamente sobre S3**

Ahora los datos estaban en S3, en formato Parquet, particionados por fecha. La pieza final: una manera de hacerles preguntas sin cargarlos primero en una base de datos.

**Amazon Athena** es un servicio de consultas interactivo y sin servidor que ejecuta consultas SQL directamente sobre los datos de S3. Sin base de datos que aprovisionar, sin datos que cargar. Defines una tabla (o usas el Glue Data Catalog), escribes SQL, y Athena ejecuta la consulta contra los archivos de S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

El precio de Athena se basa en cuántos datos escanea una consulta. En us-east-1, us-west-2 y la mayoría de las regiones principales, las consultas SQL estándar cuestan $5 por terabyte escaneado. Usar el formato Parquet (columnar) con poda de particiones (`WHERE year='2024' AND month='09'`) significa que Athena solo escanea los archivos que necesita, lo que reduce drásticamente el costo.

"Podemos ejecutar esta consulta para 30 días de datos", dijo Leo, "y puede costar sorprendentemente poco si los almacenamos bien."

"¿Cómo puede costar tan poco?", preguntó Maya. "Si está escaneando terabytes de datos, ¿cómo no es eso caro?"

Leo explicó Parquet. En un formato basado en filas (JSON, CSV), una consulta que busca dos columnas de veinte tiene que leer las veinte. En un formato columnar como Parquet, lee solo las dos que necesita. Para un conjunto de datos de 50TB, una consulta bien optimizada podría escanear 200GB. A $5/TB, eso es un dólar.

"¿Y qué pasa si alguien consulta toda la tabla por accidente?", insistió Maya.

"Ese es el verdadero riesgo de costo", dijo Leo.

Quizás te preguntes: si Athena cobra por terabyte escaneado, ¿podría una consulta mal escrita generar una factura grande e inesperada? Sí, y esto ocurre en entornos de producción reales. Una consulta contra una tabla no optimizada de 50TB puede costar más que toda tu factura mensual de S3. Por eso el formato Parquet y la partición no son optimizaciones opcionales: son los controles de costo. Athena también admite límites de escaneo de consultas por grupo de trabajo que limitan cuántos datos puede escanear una sola consulta.

"¿Para cualquier pregunta arbitraria que se nos ocurra?", preguntó Tom.

"Cualquier pregunta que podamos expresar en SQL, contra cualquier dato que hayamos almacenado en S3."

Tom se sentó en el portátil de Leo y escribió la primera consulta:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

La consulta se ejecutó durante 11 segundos. El resultado: 20 restaurantes, ordenados por el tiempo de confirmación promedio más rápido, con sus tasas de repetición de pedidos al lado.

Tom miró fijamente la salida.

Los restaurantes que confirmaban más rápido —los que reconocían y confirmaban los pedidos en un promedio de 3-4 minutos— tenían una tasa de repetición de pedidos promedio del 41%. Los restaurantes que confirmaban más lento (tiempo de confirmación promedio de 18-22 minutos) tenían una tasa de repetición del 13%.

"Los restaurantes que confirman rápido obtienen tres veces el negocio recurrente", dijo Tom.

"Esa es una brecha enorme", dijo Maya. "¿Por qué la velocidad de confirmación afectaría tanto la tasa de repetición?"

"Porque el cliente realizó un pedido y luego se quedó ahí mirando su teléfono", dijo Leo. "Si la confirmación llega en 3 minutos, se siente seguro. Si llega en 22 minutos —o nunca— se siente ansioso. La ansiedad es el fallo del producto, aunque la comida llegue bien."

"Esto es una idea de producto", dijo Maya. "No solo una idea de análisis. Deberíamos mostrarles a los restaurantes su punto de referencia de tiempo de confirmación comparado con el promedio de la categoría."

La consulta de Athena había escaneado 1,2 GB de datos (dos meses de pedidos en formato Parquet, particionados por año y mes). Costo: $0,006.

Medio centavo. Por una idea de negocio que cambió cómo Nimbus diseñaría la incorporación de restaurantes: qué restaurantes priorizar para el coaching de éxito, qué objetivos de tiempo de confirmación establecer como parte de los SLAs de los socios.

Tom tenía el aspecto de alguien que recalculaba el valor de todos los datos que habían estado tirando.

"¿Y qué pasa si alguien intenta entrar por la fuerza a través de la capa de consulta?", preguntó Priya. "O simplemente un analista que accidentalmente exporta las direcciones de los clientes de los datos de pedidos brutos. PII de los clientes, historiales de pedidos, registros financieros: ¿quién controla qué tablas son siquiera visibles?"

Antes de que terminara la pregunta, Leo también se había dado cuenta del problema operativo: ¿cómo evitas que un equipo ejecute un escaneo de tabla completo catastrófico que genera una factura de Athena de $500 en una sola consulta?

Los **grupos de trabajo de Athena** resuelven ambos problemas simultáneamente.

Un grupo de trabajo es una configuración nombrada que agrupa a los usuarios de Athena y aplica ajustes compartidos: ubicación de los resultados de las consultas, cifrado y —críticamente— límites de escaneo de datos por consulta.

```
Grupo de trabajo: analytics-team
  Límite de escaneo de consulta: 10 GB por consulta
  Acción al exceder el límite: Cancelar consulta

Grupo de trabajo: engineering-team
  Límite de escaneo de consulta: 100 GB por consulta
  Acción al exceder el límite: Solo advertir

Grupo de trabajo: finance-reports
  Límite de escaneo de consulta: 1 GB por consulta
  Acción al exceder el límite: Cancelar consulta
```

Un analista en el grupo de trabajo `analytics-team` no puede escanear accidentalmente 50TB de datos y generar un cargo de Athena de $250. La consulta se cancela cuando excedería los 10GB de datos escaneados. El analista ve un mensaje de error y sabe que necesita agregar un filtro de partición.

Los grupos de trabajo también imponen ubicaciones de resultados separadas por equipo: los resultados de las consultas del equipo de ingeniería van a `s3://nimbus-query-results/engineering/`; los resultados del equipo de finanzas van a `s3://nimbus-query-results/finance/`. Sin acceso a los resultados de consultas entre equipos.

IAM controla qué usuarios pueden usar qué grupo de trabajo. Una función de Lambda que ejecuta reportes automatizados usa el grupo de trabajo `finance-reports` (estrictamente limitado). Un ingeniero depurando un problema de producción usa el grupo de trabajo `engineering-team` (límite más amplio, advertir no cancelar). El acceso a la tabla de eventos brutos (que contiene PII de los clientes) está restringido al grupo de trabajo `engineering-team` mediante una condición de IAM en la tabla del Glue Data Catalog.

"Eso no es solo control de costos", dijo Priya. "Es control de acceso. Los grupos de trabajo son el punto de aplicación."

Respondía su pregunta por completo. Toda discusión de pipeline de datos que omite el control de acceso eventualmente se convierte en un incidente de cumplimiento, y aquí, el equipo de análisis veía solo las tablas de pedidos agregadas, mientras que los eventos brutos con PII de los clientes se quedaban detrás de una autorización explícita de IAM. El Glue Data Catalog no era solo un directorio de esquemas. Era un límite de control de acceso.

"Eso no es trabajo extra", dijo Priya. "Es el diseño."

**La Arquitectura del Data Lake**

Estos tres servicios se combinan en lo que se llama una **arquitectura de data lake**: un repositorio centralizado de S3 para todos tus datos, con herramientas para procesarlos y consultarlos:

```
Aplicaciones (pedidos, menús, eventos)
    |
    | Eventos en tiempo real
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (bruto)
                                                   |
                                                   | El Glue Crawler descubre el esquema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Los Glue Jobs transforman
                                                   ↓
                                              S3 (limpio, Parquet, particionado)
                                                   |
                                                   | Consultas SQL
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Herramientas de Inteligencia de Negocio
                                       (QuickSight, Tableau, etc.)
```

Los datos brutos siempre se preservan (en el bucket de S3 original). Los datos transformados son consultables vía Athena. Siempre se pueden responder nuevas preguntas ejecutando nuevos Glue jobs sobre los datos brutos.

**Amazon Redshift: Cuando Athena No Es Suficiente**

Para algunos casos de uso, Athena es demasiado lento o demasiado caro:

- Consultas muy complejas con muchos joins
- Paneles que ejecutan la misma consulta miles de veces al día
- Aprendizaje automático sobre datos estructurados
- Requisitos de tiempo de respuesta sub-segundo para herramientas de BI

**Amazon Redshift** es un data warehouse totalmente gestionado: una base de datos de análisis columnar diseñada para cargas de trabajo analíticas grandes y repetidas. A diferencia de Athena, que consulta los datos donde viven en S3, Redshift carga los datos en almacenamiento de warehouse optimizado y usa optimización de consultas, estrategias de ordenamiento y estrategias de distribución para acelerar los análisis complejos.

Si tu volumen de datos es pequeño y tus consultas se ejecutan con poca frecuencia (semanal o mensualmente), Athena con datos de S3 bien organizados es suficiente y casi gratis; pero si ejecutas los mismos paneles analíticos cientos de veces al día, el almacenamiento columnar pre-optimizado de Redshift será más rápido y, en última instancia, más rentable, a pesar de requerir que los datos se carguen por adelantado.

Redshift es significativamente más rápido para las consultas analíticas complejas a expensas del costo (capacidad aprovisionada) y del requisito de cargar los datos antes de consultarlos.

**Redshift Serverless** elimina la carga de la planificación de capacidad: consultas, y Redshift escala. El costo se basa en la capacidad de cómputo realmente usada, medida en **RPU-horas** y facturada por segundo (con un mínimo de 60 segundos por activación), más el almacenamiento gestionado por GB-mes, y nada por el cómputo mientras el warehouse está inactivo. (Athena es el que tiene precio por consulta: $5 por TB escaneado.)

Para Nimbus a su escala actual: Athena es suficiente. A cinco veces el volumen de datos y con herramientas de BI consultando los mismos paneles cientos de veces al día, Redshift se volvería rentable.

**Cuándo Athena Es la Herramienta Equivocada**

"Entonces, ¿cuál es la trampa?", preguntó Maya. "¿Por qué no usaríamos Athena para todo? Es sin servidor, pago por consulta, sin infraestructura: suena perfecto."

Los casos donde Athena no es la respuesta correcta:

**Paneles de alta frecuencia**: Un panel de análisis de cara al cliente que se actualiza cada 30 segundos y ejecuta 50 consultas por minuto no es un buen caso de uso para Athena. A $5/TB escaneado, esas consultas necesitan estar extremadamente bien optimizadas para ser rentables a esa frecuencia. Redshift o una base de datos pre-agregada (incluso RDS) es más apropiado para los paneles con requisitos de tiempo de respuesta sub-segundo.

**Consultas operativas con requisitos de baja latencia**: Si un agente de servicio al cliente necesita buscar un pedido específico en menos de 500ms, Athena no es la herramienta: una búsqueda en DynamoDB o una consulta de RDS lo es. Athena está optimizado para el rendimiento analítico, no para la latencia operativa. Incluso una consulta de Athena bien afinada sobre un conjunto de datos pequeño tiene una sobrecarga de arranque en frío de 1-3 segundos.

**Sistemas transaccionales**: Athena es de solo lectura. No puedes hacer INSERT, UPDATE ni DELETE de registros en Athena (excepto a través de integraciones específicas como Lake Formation o el formato de tabla Iceberg, que tienen su propia complejidad). Para las cargas de trabajo de escritura operativa, usa una base de datos transaccional.

**Conjuntos de datos muy pequeños y que cambian con frecuencia**: Si tu conjunto de datos cambia cada minuto y solo es de 1GB, cargarlo en RDS o DynamoDB y consultar allí es más simple y rápido que ejecutar consultas de Athena contra archivos de S3 que podrían estar desactualizados. Athena consulta los archivos de S3 tal como estaban en el momento de la consulta: si los archivos se escribieron hace 2 minutos, esa es la frescura que obtienes.

El patrón que emerge: Athena es excelente para las consultas analíticas ad-hoc, a gran escala y poco frecuentes, contra datos de S3. Para cualquier cosa operativa, transaccional o que requiera latencia sub-segundo, usa la base de datos operativa apropiada.

**Kinesis vs SQS: Aclarando la Confusión**

Esta es la pregunta que surge en toda discusión de arquitectura de datos. Kinesis y SQS ambos lidian con mensajes. ¿Cuándo usas cada uno?

La confusión viene de la similitud superficial: ambos aceptan mensajes de los productores. Ambos entregan esos mensajes a los consumidores. Ambos son servicios gestionados de AWS. Pero sus modelos de datos son fundamentalmente diferentes.

**SQS (Simple Queue Service)** es una cola de tareas. Pones un mensaje. Un consumidor lo saca y lo procesa. Cuando el procesamiento se completa, el mensaje se elimina. Si tienes diez consumidores, cada mensaje va a exactamente uno de ellos. El mensaje desaparece después del consumo.

**Kinesis Data Streams** es un log. Pones un registro. Cada consumidor lee cada registro. El consumidor A los lee todos. El consumidor B también los lee todos, a su propio ritmo. Ningún consumidor elimina el registro: permanece en el stream hasta que expira el período de retención. Puedes agregar un tercer consumidor en cualquier momento, y puede leer desde el principio del stream (dentro de la ventana de retención).

"¿Cuándo querrías realmente que cada consumidor viera cada mensaje?", preguntó Maya.

La respuesta son los casos de uso donde Kinesis brilla:

**Panel en tiempo real + detección de fraude + archivo en S3**: Los tres consumen el mismo stream de eventos de pedidos simultáneamente. Si usaras SQS, necesitarías publicar en tres colas separadas, y quien publica debe conocer los tres consumidores. Con Kinesis, el productor publica una vez; cualquier número de consumidores puede leer de forma independiente.

**Replay**: Un consumidor falla durante 2 horas (se alcanzó el límite de concurrencia de Lambda, el servicio descendente está caído). Con SQS, esos mensajes ya se eliminaron (o tienen un tiempo de espera de visibilidad definido). Con Kinesis, el consumidor se reanuda desde su último punto de control y procesa las 2 horas de registros perdidos. Los datos se retuvieron en el stream (hasta 365 días con la Retención de Datos Extendida).

**Orden dentro de un shard**: Los registros con la misma clave de partición siempre van al mismo shard, preservando el orden. Para un sistema de trading de acciones donde necesitas que todas las operaciones del símbolo `AMZN` se procesen en secuencia, Kinesis garantiza esto. SQS FIFO proporciona orden por grupo pero a menor rendimiento (hasta 3.000 mensajes/segundo por cola con procesamiento por lotes en modo estándar —el modo de alto rendimiento eleva esto a decenas de miles— vs. el 1 MB/s o 1.000 registros/s por shard de Kinesis, multiplicado por tantos shards como necesites).

La pregunta decisiva: **¿Necesita cada mensaje ser consumido por exactamente un consumidor y luego descartado?** → SQS. **¿Necesita cada mensaje ser visto por múltiples consumidores de forma independiente, o necesitas capacidad de replay?** → Kinesis.

Para el panel en tiempo real de Nimbus: Kinesis. Múltiples consumidores (panel, detección de fraude, archivo en S3) leyendo todos el mismo stream.

Para la cola de procesamiento de pedidos de Nimbus (un pedido realizado → una tarea de ECS lo procesa): SQS. Un consumidor, sin necesidad de replay, sin necesidad de distribución en abanico.

## Visualizar los Datos: Amazon QuickSight

Athena consulta los datos. Glue los prepara. Pero en algún momento alguien necesita ver un gráfico, y no ejecutando consultas SQL en la consola.

"¿Realmente necesitamos otro servicio para eso?", preguntó Maya. "¿No puedo simplemente exportar los resultados de Athena a una hoja de cálculo?"

"Para una consulta, sí", dijo Tom. Tenía el aspecto de alguien que ya lo había intentado. "Para un panel que quieres compartir con todo el equipo, eso es una nueva hoja de cálculo cada mañana."

**Amazon QuickSight** es el servicio de inteligencia de negocio (BI) gestionado de AWS. Se conecta directamente a Athena, S3, RDS, Redshift y otras fuentes, y te permite construir paneles y visualizaciones sin un servidor de BI separado.

Características clave:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight puede importar conjuntos de datos a su motor en memoria para un rendimiento de consulta sub-segundo a escala, sin volver a consultar Athena en cada carga del panel
- **ML Insights:** detección de anomalías y pronóstico integrados, sin necesidad de ciencia de datos
- **Paneles incrustados:** puedes incrustar los paneles de QuickSight en tu propia aplicación web a través de una URL

Tom conectó QuickSight a la fuente de datos de Athena y tuvo un panel funcional mostrando los pedidos diarios, los ingresos por restaurante y el embudo de conversión en una tarde.

"¿Cuánto cuesta eso al mes?", preguntó, y luego respondió su propia pregunta antes de que nadie más pudiera. "QuickSight cuesta unos $24/mes por autor —las personas que construyen los paneles— y $3/mes por lector. Tenemos cuatro personas que lo usarían."

"Así que unos cien dólares al mes", dijo Maya.

"Por un servicio de BI que de otra manera requeriría ejecutar un servidor de análisis separado", dijo Priya. "Sí."

Tom publicó el panel. A la mañana siguiente, en lugar de ejecutar consultas de Athena, todo el equipo abrió una URL.

> **Consejo para el Examen — QuickSight**
>
> QuickSight es el servicio de BI y visualización gestionado de AWS. Se conecta a Athena, S3, Redshift, RDS. SPICE es el motor de consultas en memoria que acelera las consultas repetidas de los paneles. Disparador del examen: "panel de inteligencia de negocio en AWS" o "visualizar datos de Athena/Redshift" → QuickSight.

## Gobernar el Lake: AWS Lake Formation

A medida que el data lake de Nimbus crecía, el acceso a los datos se convirtió en un problema de gobernanza.

"¿Quién puede consultar los registros de transacciones brutos?", preguntó Priya, en la siguiente revisión de arquitectura. "¿Quién puede ver la PII de los clientes? ¿Quién puede acceder a las tablas de resumen financiero?"

"Ingeniería tiene acceso completo", dijo Leo. "El equipo de análisis tiene acceso a las tablas agregadas. Finanzas tiene acceso a las tablas de ingresos."

"¿Configurado dónde?"

Leo hizo una pausa. "En... unos cuantos lugares diferentes. Las políticas de bucket de S3, las políticas de IAM, los permisos del catálogo de Glue."

"Tres sistemas separados, todos los cuales tienen que ser consistentes", dijo Priya. "¿Qué pasa cuando agregamos un nuevo analista? ¿O cuando decidimos restringir el acceso a una columna específica —digamos, los números de teléfono de los clientes— del equipo de análisis?"

Esa pregunta expuso la brecha. Gestionar el acceso a datos de grano fino a través de las políticas de bucket de S3, IAM y el Glue Data Catalog simultáneamente era frágil.

**AWS Lake Formation** es un servicio gestionado que centraliza el control de acceso para tu data lake. En lugar de gestionar las políticas de bucket, las políticas de IAM y los permisos del catálogo de Glue por separado, Lake Formation proporciona un único lugar para otorgar permisos a nivel de columna, fila y tabla sobre tus datos.

Características clave:

- Se sitúa encima de S3 y el Glue Data Catalog: sin migración de datos requerida
- **Control de acceso de grano fino:** otorga a usuarios o roles específicos acceso a tablas, columnas o incluso filas filtradas específicas, el equivalente de los permisos a nivel de base de datos sobre los datos de S3
- **Filtrado de datos:** cuando un usuario consulta una tabla gobernada por Lake Formation vía Athena, Lake Formation filtra automáticamente las columnas o filas que no tiene permitido ver

Priya configuró Lake Formation con tres niveles de permisos, con Rafael redactando las reglas a nivel de columna: el rol de ingeniería veía todas las tablas y todas las columnas. El rol de análisis veía las tablas de pedidos agregadas pero no las columnas de PII de los clientes. El rol de finanzas veía las tablas de ingresos con los identificadores de los clientes enmascarados.

"Así que el analista ejecuta la misma consulta de Athena", confirmó Leo. "¿Pero Lake Formation la intercepta y elimina las columnas que no está autorizado a ver?"

"Correcto. El filtrado es automático. El analista no necesita saber que está ocurriendo, y no puede sortearlo consultando los archivos de S3 brutos directamente, porque Lake Formation controla el acceso a nivel del catálogo."

"Eso no es trabajo extra", dijo Priya. "Es el diseño."

> **Consejo para el Examen — Lake Formation**
>
> Lake Formation centraliza el control de acceso para un data lake construido sobre S3 y el Glue Data Catalog. Admite permisos de grano fino a nivel de tabla, columna y fila. Disparador del examen: "restringir el acceso a columnas específicas en un data lake de S3" o "centralizar la gobernanza del data lake" → Lake Formation. La distinción clave de IAM puro: Lake Formation impone el filtrado a nivel de columna y fila que las políticas de IAM por sí solas no pueden expresar.

## Fortalezas y Limitaciones

**Kinesis Data Streams**: Usa Kinesis cuando tus datos llegan continuamente y el orden importa: clickstreams, transacciones financieras, telemetría de IoT. Kinesis preserva el orden de los registros dentro de un shard y permite el replay durante la ventana de retención configurada (24 horas de forma predeterminada, hasta 365 días con la Retención de Datos Extendida), lo que lo hace fundamentalmente diferente de SQS. La contrapartida es la complejidad operativa: en el modo aprovisionado, gestionas la capacidad de los shards y el comportamiento de los consumidores. Para colas de tareas simples donde el orden no importa y el replay no se necesita, SQS es la opción más simple.

**AWS Glue**: Glue elimina la infraestructura de un clúster de ETL tradicional. Escribes la lógica de transformación; AWS gestiona el entorno de Spark. Esto es valioso cuando las transformaciones son complejas o los volúmenes de datos son grandes. La limitación es el costo y el arranque en frío: los Glue jobs tienen un retraso de inicio de varios minutos, lo que los hace inadecuados para transformaciones casi en tiempo real. Para conversiones de formato de archivo simples (CSV a Parquet), la sobrecarga de Glue puede no valer la pena comparada con una función de Lambda o un script ligero.

**Amazon Athena**: Athena te permite consultar datos de S3 con SQL estándar y sin infraestructura que gestionar. La restricción crítica es el costo: Athena cobra por terabyte de datos escaneado. Una consulta contra una tabla de 10 TB que la escanea entera cuesta significativamente más que la misma consulta contra una tabla en formato Parquet y particionada que escanea 200 GB. Usa siempre formatos columnares (Parquet u ORC) y particiona tus datos antes de ejecutar Athena en producción. Sin estas optimizaciones, las facturas de Athena pueden sorprenderte.

## Resumen

El trabajo de red del capítulo 25 hizo posible el pipeline de datos de Nimbus. Este capítulo es para qué sirve ese pipeline: hacer que todos los datos que Nimbus ha estado generando sean realmente visibles y accionables.

- **Amazon Kinesis**: Streaming de datos en tiempo real. Los productores escriben registros; los consumidores leen a su propio ritmo. Amazon Data Firehose puede luego entregar los datos de streaming a S3, Redshift y otros destinos con menos trabajo operativo.
- **AWS Glue**: ETL y catalogación de datos. Los crawlers descubren esquemas; los Jobs transforman los datos; el Data Catalog hace que los datos sean detectables por Athena y otras herramientas.
- **Amazon Athena**: SQL sin servidor sobre S3. Consulta cualquier dato en S3 usando SQL estándar. Precio por TB escaneado: usa Parquet y particiones para minimizar el costo.
- **Amazon Redshift**: Data warehouse gestionado para análisis de alto rendimiento. Carga los datos, optimiza para consultas analíticas repetidas, y consulta rápido a escala de warehouse.
- El **patrón de data lake**: datos brutos a S3 → Glue los transforma → Athena los consulta → las herramientas de BI los visualizan.
- **Evolución del esquema de Glue**: los pipelines de ETL que procesan datos externos deben manejar los cambios de esquema de forma elegante. Usa DynamicFrames con `mergeSchema: true` para evitar fallos del pipeline cuando los datos de origen agregan nuevos campos.
- **Grupos de trabajo de Athena**: límites de escaneo de datos y ubicaciones de resultados por equipo. Control de costos y control de acceso en una configuración. Requerido para cualquier despliegue de Athena multi-equipo.
- **Kinesis vs SQS**: Kinesis para la distribución en abanico a múltiples consumidores y la capacidad de replay. SQS Estándar para colas de tareas simples; SQS FIFO para el procesamiento de tareas ordenado y deduplicado. La pregunta decisiva: ¿necesita cada consumidor ver cada mensaje, o cada mensaje va a un consumidor?
- **Cuándo Athena es incorrecto**: paneles de alta frecuencia (usa Redshift), consultas operativas (usa RDS o DynamoDB), conjuntos de datos muy pequeños que cambian con frecuencia (simplemente usa una base de datos).
- **Amazon QuickSight**: El servicio de BI gestionado de AWS. Se conecta a Athena, S3, Redshift y RDS para construir paneles sin ejecutar un servidor de BI separado. SPICE es el motor en memoria que acelera las consultas repetidas de los paneles.
- **AWS Lake Formation**: Control de acceso centralizado para data lakes sobre S3 + Glue Data Catalog. Habilita permisos a nivel de columna, fila y tabla: gobernanza de datos de grano fino que IAM por sí solo no puede expresar.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.5)*

- **Kinesis vs SQS**: Kinesis = streaming ordenado en tiempo real, múltiples consumidores, replay dentro de la ventana de retención (24 horas predeterminado, hasta 365 días). SQS = cola de tareas, cada mensaje procesado una vez. "Múltiples consumidores leyendo el mismo stream simultáneamente" → Kinesis. "Un trabajador por mensaje" → SQS.
- **Señales de Athena en el examen**: "SQL sin servidor sobre S3", "analizar datos de S3 sin cargarlos en una base de datos", "pago por consulta" → Athena.
- **Optimización de costos de Athena**: El formato columnar (Parquet u ORC) + particiones reduce drásticamente los datos escaneados y el costo. El examen puede preguntar cómo reducir los costos de Athena.
- **Precios de Athena**: $5 por TB escaneado (us-east-1, us-west-2 y la mayoría de las regiones principales). El costo se calcula sobre los datos escaneados, no los datos devueltos: optimiza siempre el formato de almacenamiento antes de ejecutar consultas de producción.
- **Glue Crawler**: "Descubrir el esquema de los datos de S3 automáticamente" → Glue Crawler.
- **Amazon Data Firehose**: "Cargar automáticamente datos de streaming a S3/Redshift/OpenSearch sin gestionar consumidores" → Amazon Data Firehose. El material más antiguo puede todavía llamarlo Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift para consultas complejas y de alta frecuencia sobre un conjunto de datos fijo (paneles de BI). Athena para consultas ad-hoc sobre datos de S3 que cambian con frecuencia.
- **EMR (Elastic MapReduce)**: Clústeres de Hadoop/Spark gestionados por AWS. El examen usa esto cuando se mencionan "cargas de trabajo de Hadoop/Spark existentes" o "frameworks de procesamiento de datos personalizados". Glue es la alternativa gestionada para la mayoría de los casos de uso.
- **QuickSight:** BI y visualización gestionados de AWS. Se conecta a Athena, S3, Redshift, RDS. SPICE = motor en memoria para consultas repetidas rápidas. Disparador del examen: "panel de inteligencia de negocio en AWS" → QuickSight.
- **Lake Formation:** Control de acceso centralizado para un data lake (S3 + Glue Data Catalog). Permisos de grano fino: a nivel de tabla, columna y fila. Disparador del examen: "restringir el acceso a columnas específicas en un data lake de S3" o "centralizar la gobernanza del data lake" → Lake Formation.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre Amazon Kinesis y Amazon SQS. ¿Cuándo usarías cada uno?

*(Pista: Piensa en cuántos consumidores pueden leer los mismos datos, si los mensajes se eliminan después de leerse, y si el orden importa.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa de viajes compartidos quiere analizar los datos de los viajes. Se completan 1 millón de viajes diariamente. Los registros de viajes se almacenan en S3 como archivos JSON (aproximadamente 2KB cada uno). El equipo de análisis quiere ejecutar consultas SQL ad-hoc como "duración promedio de viaje por ciudad la semana pasada". Las consultas deben completarse en menos de 2 minutos. Los costos de almacenamiento deben minimizarse. El equipo ejecutará 20-30 consultas por semana.

¿Qué arquitectura cumple MEJOR con estos requisitos?

A) Usar AWS Glue para convertir JSON a formato Parquet particionado por fecha y ciudad; consultar con Amazon Athena  
B) Cargar los datos de viajes en RDS PostgreSQL diariamente; consultar usando SQL estándar  
C) Usar Amazon Data Firehose para entregar los datos de viajes a Amazon Redshift; consultar con Redshift  
D) Cargar los datos de viajes en DynamoDB y usar PartiQL para las consultas SQL

**Pista 1**: 20-30 consultas por semana es baja frecuencia. ¿Qué servicio es más rentable para consultas ocasionales?

**Pista 2**: El formato Parquet + particiones reduce drásticamente los datos escaneados por Athena, y por lo tanto el costo.

**Pista 3**: 1 millón de viajes × 2KB = ~2GB por día. Durante una semana, ~14GB. A $5/TB para Athena, incluso sin optimización, esto es asequible.

**Respuesta**: A

**Explicación**: Glue convierte JSON a Parquet (el formato columnar reduce drásticamente los datos escaneados) particionado por fecha y ciudad (la poda de particiones significa que las consultas de "la semana pasada" solo escanean 7 días de particiones). Athena consulta S3 directamente con SQL estándar. Para 20-30 consultas por semana, Athena con pago por consulta es extremadamente rentable frente a un Redshift siempre encendido.

**¿Por qué no B?** Cargar 2GB de datos diariamente en RDS, y luego consultar, requiere una instancia de base de datos corriendo 24/7. Para 20-30 consultas por semana, esto está enormemente sobredimensionado y es caro.

**¿Por qué no C?** Redshift es rentable para consultas de alta frecuencia (cientos por día sobre el mismo conjunto de datos). Para 20-30 consultas por semana, el clúster de Redshift siempre encendido cuesta mucho más que el precio por consulta de Athena.

**¿Por qué no D?** DynamoDB es un almacén clave-valor/documento optimizado para el acceso basado en clave, no para consultas analíticas ad-hoc. PartiQL sobre DynamoDB no admite el tipo de agregaciones GROUP BY descritas.

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento — Tarea 3.5*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus quiere construir un sistema de detección de fraude en tiempo real para los pedidos. El sistema debería:

- Detectar pedidos realizados por la misma cuenta más de 5 veces en 60 segundos
- Marcar los pedidos por encima de $500 de cuentas nuevas (< 30 días de antigüedad)
- Enviar los pedidos marcados a una cola de revisión humana

Diseña la arquitectura. ¿Qué proporciona Kinesis? ¿Dónde se ejecuta la lógica de fraude? ¿Cómo correlacionas "misma cuenta, ventana de 60 segundos"? ¿Qué servicio recibe los pedidos marcados?

*(No existe una única respuesta correcta. El objetivo es practicar el diseño de arquitectura de streaming en tiempo real.)*

## Escena Post-Créditos

Tom ejecutó la primera consulta de Athena.

"Los 10 mejores restaurantes por ingresos del último trimestre", dijo.

12 segundos después, aparecieron los resultados.

Los miró fijamente.

"El restaurante 47 fue el primero", dijo. Era el restaurante de la familia de Maya, el lugar donde Nimbus empezó.

"Por supuesto que lo fue", dijo Maya. "La arepa es así de buena."

Tom ejecutó otra consulta. Y otra. "¿Cuánto cuesta eso al mes?", preguntó Tom antes de que Leo pudiera decir nada. Leo revisó el historial de escaneo de consultas. Tres consultas, datos totales escaneados: 1,2GB. Costo: menos de un centavo.

Después de una hora, Tom tenía una imagen completa del negocio de Nimbus de una manera que nunca había tenido antes. Qué categorías de restaurantes crecían más rápido. Qué cohortes de clientes retenían más tiempo. Qué artículos del menú generaban la mayor cantidad de pedidos repetidos.

"¿Por qué no construimos esto antes?", preguntó.

"Teníamos los datos", dijo Leo. "Simplemente no teníamos el pipeline para usarlos."

"Los datos siempre estuvieron ahí", dijo Maya en voz baja. "Simplemente no podíamos verlos."

En el próximo capítulo: ahora que podemos ver el negocio con claridad, hablemos de cómo pagar la infraestructura que lo hace funcionar, de forma más eficiente.
