# Capítulo 26: Darle Sentido a Todo

Los datos son en bruto: marcas de tiempo, clics, eventos, números. La información es lo que obtienes cuando los datos están organizados, procesados y tienen contexto. La brecha entre los dos es donde vive este capítulo.

Y en los sistemas en crecimiento, esa brecha se vuelve cara rápidamente.

Nimbus generaba enormes cantidades de datos. Cada pedido: registrado. Cada vista de menú: registrada. Cada actualización de restaurante: capturada. Cada interacción con el cliente: rastreada.

Tom tenía una pregunta.

"¿Cuál es nuestra hora más ocupada de pedidos los viernes?"

Leo lo miró. "Eso no está en nuestro panel de control."

"¿Podemos añadirlo?"

"Los datos están en DynamoDB. Y en los registros de CloudWatch. Y en S3 desde el trabajo de exportación de analítica." Leo hizo una pausa. "En tres lugares diferentes, en tres formatos diferentes."

Maya añadió: "Y la exportación de analítica solo se ejecuta una vez por noche. Si quieres los datos del viernes, tendrías que esperar hasta el sábado por la mañana."

Tom miró la pantalla. "Entonces tenemos los datos. Simplemente no podemos usarlos."

Esa frase describe la mitad de la analítica moderna.

Este es el problema de la ingeniería de datos: tienes datos, pero no están en una forma que puedas analizar cuando los necesitas.

**Tres Problemas Diferentes**

El problema de datos de Nimbus tenía tres dimensiones:

**Streaming en tiempo real**: Se están realizando pedidos ahora mismo. Quieres ver un panel de control en vivo de la velocidad de los pedidos: cuántos por minuto, por región, por restaurante. Los datos deben procesarse a medida que llegan.

**Transformación de datos**: Los datos están en S3 provenientes de varios sistemas, en diferentes formatos (JSON, CSV, Parquet). Antes de poder analizarlos, necesitas normalizarlos: mismo esquema, mismo formato, limpiados, unidos con datos de referencia.

**Análisis ad hoc**: Una vez que los datos están organizados, quieres ejecutar consultas SQL contra ellos sin tener que cargarlos primero en una base de datos. "Dame los 10 restaurantes principales por ingresos en los últimos 30 días." Sin cargar los datos en una base de datos.

Cada uno de estos es un problema distinto. AWS tiene un servicio dedicado para cada uno:

- **Amazon Kinesis**: Datos de streaming en tiempo real
- **AWS Glue**: Transformación y catalogación de datos
- **Amazon Athena**: Consultas SQL sin servidor en S3

**Amazon Kinesis: La Cinta Ticker en Tiempo Real**

**Amazon Kinesis Data Streams** es un servicio de streaming de datos en tiempo real. Los productores envían registros de datos al stream. Múltiples consumidores pueden leer del stream simultáneamente, cada uno a su propio ritmo.

Piensa en una máquina de cinta ticker: los precios se imprimen continuamente, todos pueden leer la cinta, y la cinta no se ralentiza para ningún lector individual.

Para Nimbus, cuando se realiza un pedido, la aplicación publica un evento en un stream de Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consumidores de este stream:

- Un panel de control en tiempo real (lee eventos a medida que llegan, actualiza métricas)
- Una Lambda de detección de fraudes (busca patrones de pedidos inusuales)
- Un stream a S3 para almacenamiento permanente

**Conceptos de Kinesis Data Streams**:

- **Shard**: La unidad básica de capacidad. Un shard gestiona 1 MB/s de escritura, 2 MB/s de lectura.
- **Período de retención**: Los datos permanecen en el stream durante 24 horas (predeterminado) hasta 7 días.
- **Número de secuencia**: Cada registro tiene un número de secuencia. Los consumidores rastrean su posición en el stream.

**Amazon Data Firehose** (antes **Kinesis Data Firehose**): El servicio de entrega gestionado entre productores de streaming y destinos como S3, Redshift y OpenSearch. Almacena en búfer, comprime, transforma y entrega datos automáticamente.

Para Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (formato Parquet, comprimido, particionado por fecha).

**AWS Glue: El Traductor**

Los datos en S3 son en bruto. Antes de poder analizarlos eficientemente, necesitas:

- Descubrir qué hay allí y su esquema (qué columnas, qué tipos)
- Transformarlo a un formato consistente
- Unir diferentes conjuntos de datos
- Gestionar registros incorrectos, cambios de esquema, valores faltantes

**AWS Glue** es un servicio ETL (Extracción, Transformación, Carga) totalmente gestionado. Tiene dos componentes principales:

**Catálogo de Datos de Glue**: Un almacén de metadatos que describe tus datos en S3: qué tablas existen, qué columnas tienen, dónde están los archivos de datos. Es como un catálogo de fichas para tu lago de datos.

**Crawlers de Glue**: Agentes automatizados que escanean S3, infieren el esquema y rellenan el Catálogo de Datos. Ejecuta un crawler en tu bucket de S3 y 10 minutos después tienes un catálogo de todas tus tablas.

**Jobs de Glue**: Jobs de Spark/Python sin servidor que realizan la transformación real. Escribes la lógica de transformación (o usas la herramienta ETL visual de Glue) y Glue la ejecuta en infraestructura gestionada.

Para Nimbus:

1. Glue Crawler escanea los datos de pedidos en S3 → crea una definición de tabla en el Catálogo de Datos de Glue
2. El Job de Glue transforma los eventos de pedidos JSON en bruto a un formato Parquet limpio y particionado
3. Los datos transformados se vuelven a escribir en S3 en un diseño optimizado para consultas

**Amazon Athena: El Bibliotecario**

**Amazon Athena** es un servicio de consultas interactivas sin servidor que ejecuta consultas SQL directamente en datos de S3. Sin base de datos que aprovisionar, sin datos que cargar. Defines una tabla (o usas el Catálogo de Datos de Glue), escribes SQL y Athena ejecuta la consulta contra los archivos de S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Los precios de Athena se basan en la cantidad de datos que escanea una consulta. En muchas regiones, las consultas SQL estándar comienzan en 5 USD por terabyte escaneado. Usar el formato Parquet (columnar) con poda de particiones (`WHERE year='2024' AND month='01'`) significa que Athena solo escanea los archivos que necesita, lo que reduce drásticamente el coste.

"Podemos ejecutar esta consulta para 30 días de datos," dijo Leo, "y puede costar sorprendentemente poco si lo almacenamos bien."

"¿Para cualquier pregunta arbitraria que se nos ocurra?" preguntó Tom.

"Cualquier pregunta que podamos expresar en SQL, contra cualquier dato que hayamos almacenado en S3."

Tom tenía la expresión de alguien recalculando el valor de todos los datos que había estado descartando.

**La Arquitectura del Lago de Datos**

Estos tres servicios se combinan en lo que se llama una **arquitectura de lago de datos**: un repositorio central de S3 para todos tus datos, con herramientas para procesarlos y consultarlos:

```
Aplicaciones (pedidos, menús, eventos)
    |
    | Eventos en tiempo real
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (en bruto)
                                                    |
                                                    | Glue Crawler descubre esquema
                                                    ↓
                                               Catálogo de Datos de Glue
                                                    |
                                                    | Glue Jobs transforman
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

Los datos en bruto siempre se conservan (en el bucket S3 original). Los datos transformados son consultables a través de Athena. Las nuevas preguntas siempre se pueden responder ejecutando nuevos Jobs de Glue en los datos en bruto.

**Amazon Redshift: Cuando Athena No Es Suficiente**

Para algunos casos de uso, Athena es demasiado lento o demasiado caro:

- Consultas muy complejas con muchas uniones
- Paneles de control que ejecutan la misma consulta miles de veces al día
- Aprendizaje automático en datos estructurados
- Requisitos de tiempo de respuesta inferior al segundo para herramientas de BI

**Amazon Redshift** es un almacén de datos totalmente gestionado: una base de datos de analítica columnar diseñada para cargas de trabajo analíticas grandes y repetidas. A diferencia de Athena, que consulta los datos donde viven en S3, Redshift carga los datos en almacenamiento de almacén optimizado y usa optimización de consultas, estrategias de ordenación y estrategias de distribución para acelerar la analítica compleja.

Redshift es significativamente más rápido para consultas analíticas complejas a expensas del coste (capacidad aprovisionada) y el requisito de cargar los datos antes de consultarlos.

**Redshift Serverless** elimina la carga de planificación de capacidad: consultas, Redshift escala. El coste es por consulta.

Para Nimbus en su escala actual: Athena es suficiente. Con cinco veces el volumen de datos y con herramientas de BI consultando los mismos paneles cientos de veces al día, Redshift se volvería rentable.

## Ventajas y Limitaciones

**Kinesis Data Streams**: Usa Kinesis cuando tus datos llegan continuamente y el orden importa: flujos de clics, transacciones financieras, telemetría de IoT. Kinesis preserva el orden de los registros dentro de un shard y permite la reproducción durante la ventana de retención configurada, lo que lo hace fundamentalmente diferente de SQS. La contrapartida es la complejidad operativa: en el modo aprovisionado, gestionas la capacidad de shards y el comportamiento del consumidor. Para colas de tareas simples donde el orden no importa y la reproducción no es necesaria, SQS es la opción más simple.

**AWS Glue**: Glue elimina la infraestructura de un clúster ETL tradicional. Escribes la lógica de transformación; AWS gestiona el entorno Spark. Esto es valioso cuando las transformaciones son complejas o los volúmenes de datos son grandes. La limitación es el coste y el arranque en frío: los Jobs de Glue tienen un retraso de inicio de varios minutos, lo que los hace inadecuados para transformaciones casi en tiempo real. Para conversiones simples de formato de archivo (CSV a Parquet), la sobrecarga de Glue puede no valer la pena comparada con una función Lambda o un script ligero.

**Amazon Athena**: Athena te permite consultar datos de S3 con SQL estándar sin infraestructura que gestionar. La restricción crítica es el coste: Athena cobra por terabyte de datos escaneados. Una consulta contra una tabla de 10 TB que escanea todo cuesta significativamente más que la misma consulta contra una tabla con formato Parquet y particionada que escanea 200 GB. Usa siempre formatos columnares (Parquet u ORC) y particiona tus datos antes de ejecutar Athena en producción. Sin estas optimizaciones, las facturas de Athena pueden sorprenderte.

## Resumen

- **Amazon Kinesis**: Streaming de datos en tiempo real. Los productores escriben registros; los consumidores leen a su propio ritmo. Amazon Data Firehose puede entonces entregar datos de streaming a S3, Redshift y otros destinos con menos trabajo operativo.
- **AWS Glue**: ETL y catalogación de datos. Los Crawlers descubren esquemas; los Jobs transforman datos; el Catálogo de Datos hace que los datos sean descubribles por Athena y otras herramientas.
- **Amazon Athena**: SQL sin servidor en S3. Consulta cualquier dato en S3 usando SQL estándar. Precio por TB escaneado: usa Parquet y particionado para minimizar el coste.
- **Amazon Redshift**: Almacén de datos gestionado para analítica de alto rendimiento. Carga los datos, optimiza para consultas analíticas repetidas y consulta rápido a escala de almacén.
- El **patrón de lago de datos**: datos en bruto a S3 → Glue los transforma → Athena los consulta → las herramientas de BI los visualizan.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.5)*

- **Kinesis vs SQS**: Kinesis = streaming ordenado en tiempo real, múltiples consumidores, reproducción dentro de la ventana de retención. SQS = cola de tareas, cada mensaje procesado una vez. "Múltiples consumidores leyendo el mismo stream simultáneamente" → Kinesis. "Un trabajador por mensaje" → SQS.
- **Señales del examen de Athena**: "SQL sin servidor en S3," "analizar datos de S3 sin cargarlos en una base de datos," "pago por consulta" → Athena.
- **Optimización del coste de Athena**: El formato columnar (Parquet u ORC) + particionado reduce drásticamente los datos escaneados y el coste. El examen puede preguntar cómo reducir los costes de Athena.
- **Glue Crawler**: "Descubrir automáticamente el esquema de datos en S3" → Glue Crawler.
- **Amazon Data Firehose**: "Cargar automáticamente datos de streaming a S3/Redshift/OpenSearch sin gestionar consumidores" → Amazon Data Firehose. Los materiales más antiguos todavía pueden llamarlo Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift para consultas de alta frecuencia y complejas en un conjunto de datos fijo (paneles de BI). Athena para consultas ad hoc en datos de S3 que cambian frecuentemente.
- **EMR (Elastic MapReduce)**: Clústeres de Hadoop/Spark gestionados por AWS. El examen usa esto cuando se mencionan "cargas de trabajo Hadoop/Spark existentes" o "marcos de procesamiento de datos personalizados." Glue es la alternativa gestionada para la mayoría de los casos de uso.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre Amazon Kinesis y Amazon SQS. ¿Cuándo usarías cada uno?

*(Pista: Piensa en cuántos consumidores pueden leer los mismos datos, si los mensajes se eliminan después de leerlos y si el orden importa.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa de transporte compartido quiere analizar los datos de los viajes. Se completan 1 millón de viajes al día. Los registros de viajes se almacenan en S3 como archivos JSON (aproximadamente 2 KB cada uno). El equipo de analítica quiere ejecutar consultas SQL ad hoc como "duración media del viaje por ciudad la semana pasada." Las consultas deben completarse en menos de 2 minutos. Los costes de almacenamiento deben minimizarse. El equipo ejecutará 20-30 consultas por semana.

¿Qué arquitectura cumple MEJOR con estos requisitos?

A) Cargar datos de viajes en RDS PostgreSQL diariamente; consultar usando SQL estándar  
B) Usar AWS Glue para convertir JSON a formato Parquet particionado por fecha y ciudad; consultar con Amazon Athena  
C) Usar Amazon Data Firehose para entregar datos de viajes a Amazon Redshift; consultar con Redshift  
D) Cargar datos de viajes en DynamoDB y usar PartiQL para consultas SQL

**Pista 1**: 20-30 consultas por semana es baja frecuencia. ¿Qué servicio es más rentable para consultas ocasionales?

**Pista 2**: El formato Parquet + particionado reduce drásticamente los datos escaneados por Athena y, por tanto, el coste.

**Pista 3**: 1 millón de viajes × 2 KB = ~2 GB por día. En una semana, ~14 GB. A 5 USD/TB para Athena, incluso sin optimización, esto es asequible.

**Respuesta**: B

**Explicación**: Glue convierte JSON a Parquet (el formato columnar reduce drásticamente los datos escaneados) particionado por fecha y ciudad (la poda de particiones significa que las consultas de "la semana pasada" solo escanean 7 días de particiones). Athena consulta S3 directamente con SQL estándar. Para 20-30 consultas por semana, Athena de pago por consulta es extremadamente rentable frente a Redshift siempre activo.

**¿Por qué no A?** Cargar 2 GB de datos diariamente en RDS y luego consultarlos requiere una instancia de base de datos funcionando 24/7. Para 20-30 consultas por semana, esto es excesivo y caro.

**¿Por qué no C?** Redshift es rentable para consultas de alta frecuencia (cientos por día en el mismo conjunto de datos). Para 20-30 consultas por semana, el clúster de Redshift siempre activo cuesta mucho más que el precio por consulta de Athena.

**¿Por qué no D?** DynamoDB es un almacén de clave-valor/documentos optimizado para acceso por clave, no para consultas analíticas ad hoc. PartiQL en DynamoDB no admite el tipo de agregaciones GROUP BY descritas.

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento — Tarea 3.5*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus quiere construir un sistema de detección de fraudes en tiempo real para los pedidos. El sistema debe:

- Detectar pedidos realizados por la misma cuenta más de 5 veces en 60 segundos
- Marcar pedidos superiores a 500 USD de cuentas nuevas (< 30 días de antigüedad)
- Enviar los pedidos marcados a una cola de revisión humana

Diseña la arquitectura. ¿Qué proporciona Kinesis? ¿Dónde se ejecuta la lógica de fraudes? ¿Cómo correlacionas "misma cuenta, ventana de 60 segundos"? ¿Qué servicio recibe los pedidos marcados?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de arquitectura de streaming en tiempo real.)*

## Escena Poscreditos

Tom ejecutó la primera consulta de Athena.

"Los 10 restaurantes principales por ingresos del último trimestre," dijo.

12 segundos después, los resultados aparecieron.

Los miró fijamente.

"El restaurante 47 fue el primero," dijo. Era el restaurante familiar de Maya, donde comenzó Nimbus.

"Por supuesto que sí," dijo Maya. "La arepa está así de buena."

Tom ejecutó otra consulta. Y otra. Cada una respondida en segundos, cada una costando fracciones de un centavo.

Después de una hora, tenía una imagen completa del negocio de Nimbus de una forma que nunca había tenido antes. Qué categorías de restaurantes crecieron más rápido. Qué cohortes de clientes retuvieron más tiempo. Qué elementos del menú generaron más pedidos repetidos.

"¿Por qué no construimos esto antes?" preguntó.

"Teníamos los datos," dijo Leo. "Solo no teníamos el pipeline para usarlos."

"Los datos siempre estuvieron ahí," dijo Maya en voz baja. "Solo que no podíamos verlos."

En el siguiente capítulo: ahora que podemos ver el negocio claramente, hablemos de cómo pagar por la infraestructura que lo ejecuta, de forma más eficiente.
