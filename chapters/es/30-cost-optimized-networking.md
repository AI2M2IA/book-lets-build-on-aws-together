# Capítulo 30: El Coste Oculto

Tom tenía una pizarra en la sala de reuniones con tres columnas: cómputo, almacenamiento, red. Las dos primeras estaban rellenas: números, fechas, nombres de optimizaciones completadas. Se quedó frente a la pizarra un momento antes de escribir nada en la tercera columna. Las líneas de red de la factura de AWS se dispersaban por la página de una forma en que las otras no. Cada una tenía un nombre diferente, una unidad diferente, una justificación diferente de por qué el dinero salía.

Destapó el rotulador.

**Recapitulación: La Última Incógnita de la Factura**

La auditoría de bases de datos había cerrado la última partida importante en la que Tom había estado trabajando activamente: 491 USD/mes recuperados, 5.892 USD al año. Añade los Savings Plans de EC2, las políticas de ciclo de vida de S3 y la limpieza de almacenamiento, y el total acumulado era de 34.092 USD en ahorros anuales a lo largo de tres meses de trabajo. Pero Tom había notado, durante el análisis profundo de las bases de datos, que una categoría apenas había sido examinada. Los costes de almacenamiento aparecían como una línea: "S3: 198 USD." Los costes de cómputo aparecían como una línea: "EC2: 2.340 USD", antes de que llegaran los descuentos del Savings Plan del capítulo 27. Los costes de red se dispersaban en una docena de líneas con nombres como "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer" y "CloudFront Data Transfer." Nunca los había sumado y mirado el total. Ese era el trabajo de hoy.

Tom abrió la factura. Encontró la sección de transferencia de datos. Sumó todas las líneas.

Los costes de red en AWS son como el sistema de peaje de una ciudad: entrar a la ciudad es gratuito, pero cada túnel que tomas de salida cuesta dinero, y circular entre barrios también cuesta un poco. La mayoría de la gente no piensa en los peajes hasta que recibe la factura a final de mes y se da cuenta de que ha estado tomando el túnel todos los días cuando había una carretera de superficie gratuita todo el tiempo. El objetivo de este capítulo es entender cada caseta de peaje, y decidir cuáles vale la pena pagar.

847 USD/mes.

"Estamos gastando 847 dólares al mes en transferencia de datos," dijo.

"¿Es mucho?" preguntó Leo.

"Es exactamente lo que era nuestra factura de S3 antes de optimizarla. Y ni siquiera sabía que teníamos una factura de transferencia de datos de este tamaño."

Maya miró. "¿Qué es exactamente la transferencia de datos?"

"Es lo que AWS cobra por mover bytes. Bytes entrantes a AWS: generalmente gratuito. Bytes salientes de AWS a internet: cobrado. Bytes entre servicios en diferentes regiones: cobrado. Bytes que pasan por un NAT Gateway: cobrado."

"¿Puedes desglosarlo?"

Tom podía. Pero esta vez no se detuvo en la consola de facturación. Habilitó VPC Flow Logs en todas sus VPC y los alimentó a CloudWatch Logs Insights. Esto le permitió consultar los flujos de tráfico reales —no solo cantidades de dinero, sino qué orígenes enviaban datos adónde, y cuánto—.

La consulta tardó dos minutos en ejecutarse. Combinada con otra fuente de logs que extraería poco después, la salida fue lo bastante específica como para actuar sobre ella.

**Análisis de Tráfico: Qué Genera Realmente la Factura**

Los cinco principales flujos de tráfico por volumen, en orden:

1. Servidores de aplicación EC2 → NAT Gateway → servicios de AWS (SSM, Secrets Manager, CloudWatch, SQS): 3,9TB/mes
2. Servidores de aplicación EC2 → NAT Gateway → API externas: 1,3TB/mes
3. Endpoint lector de Aurora → servidores de aplicación EC2 (entre AZ): 0,4TB/mes
4. Pipeline de analítica → bucket de S3 en us-east-1 (entre regiones): 0,3TB/mes
5. CloudFront → origen de S3 (fallos de caché): 0,2TB/mes

Los primeros cuatro salieron directamente de los Flow Logs. El quinto no podría haberlo hecho: los VPC Flow Logs solo ven el tráfico que cruza interfaces de red dentro de tus VPC, y un fallo de caché de CloudFront que obtiene de S3 nunca toca la VPC en absoluto: es CloudFront hablando directamente con S3. Para ese flujo, Tom extrajo los logs de acceso estándar de CloudFront y filtró por el campo `x-edge-result-type`: cada entrada marcada como `Miss` es una solicitud que CloudFront tuvo que obtener del origen, y sumar los bytes le dio los 0,2TB. Una factura, dos instrumentos, cada uno ciego a lo que ve el otro.

"Flujo número cuatro," dijo Priya. "¿Por qué nuestro pipeline de analítica habla con un bucket en us-east-1?"

Leo tenía una expresión en la cara que Tom reconoció.

"Ya lo había desplegado... ah," dijo Leo. "Hace seis meses estaba probando si nuestro pipeline de analítica podía distribuirse a múltiples regiones en paralelo. Levanté un bucket de prueba en us-east-1, apunté el pipeline hacia él, y lo ejecuté durante una semana. La prueba terminó pero olvidé quitar el destino us-east-1 de la configuración del pipeline."

"Así que durante cinco meses," dijo Tom, "hemos estado escribiendo una copia de cada resultado de analítica a un bucket en Virginia."

"¿Cuánto cuesta eso por mes?" preguntó Tom.

Transferencia entre regiones de us-west-2 a us-east-1: 0,02 USD/GB. 300GB/mes = 6 USD/mes por la transferencia. Más el almacenamiento de S3 para los datos duplicados en us-east-1: 300GB × 5 meses × 0,023 USD/GB = 34,50 USD en datos almacenados.

"No es enorme," dijo Leo.

"No es enorme por mes," dijo Tom. "Pero lleva cinco meses funcionando y nadie lo sabía. Es coste no intencional. La pregunta no es si 6 USD importan, sino si sabemos por qué se gasta cada dólar."

Leo eliminó el bucket de prueba de us-east-1 y quitó el destino de la configuración del pipeline.

El hallazgo más accionable de la salida de los flow logs era el flujo número uno: servidores de aplicación EC2 llamando a servicios de AWS a través del NAT Gateway.

Tom extrajo las entradas de log específicas para la consulta de CloudWatch Logs Insights, filtradas para mostrar solo el tráfico destinado a los rangos de IP de los servicios de AWS:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

La salida mostró algo que no esperaba: aproximadamente 300 GB al mes de tráfico de S3 en la misma región —separado del flujo entre regiones al bucket us-east-1 de Leo— pasaba por el NAT Gateway. Pero Tom ya había configurado endpoints de gateway de S3 meses atrás.

"Tenemos un endpoint de gateway de S3," dijo Leo. "¿Por qué el tráfico de S3 sigue pasando por NAT?"

Tom miró la tabla de rutas. El endpoint de gateway estaba configurado, pero solo para la VPC de la aplicación. El pipeline de analítica se ejecutaba en una VPC separada que había sido creada hacía nueve meses para el aislamiento de datos. Esa VPC no tenía endpoint de gateway de S3. Cada llamada a S3 desde las instancias EC2 del pipeline de analítica se enrutaba a través del NAT Gateway de esa VPC.

"0,3TB de tráfico del pipeline de analítica × 0,045 USD/GB = 13,50 USD/mes," dijo Tom. "Solo por el endpoint que falta en la segunda VPC."

"¿Cuánto costaría añadir el endpoint?" preguntó Leo.

"Cero," dijo Tom. "Los endpoints de gateway de S3 son gratuitos. Es una entrada en la tabla de rutas."

Añadir el endpoint de gateway a la VPC de analítica tomaría cuatro minutos y recortaría 13,50 USD del cargo mensual del NAT Gateway: un número absoluto pequeño, pero el hallazgo era el principio. Habían añadido un control de costes en una VPC y olvidado replicarlo cuando crearon la segunda. La consistencia requería proceso, no solo conocimiento.

Tom añadió a la lista de comprobación de despliegue: al crear una nueva VPC, añadir endpoints de gateway de S3 y DynamoDB antes de adjuntar cualquier carga de trabajo.

El segundo hallazgo específico de los flow logs era más caro. El tráfico de las funciones Lambda que ejecutaban el sistema de notificación de pedidos —acceso a S3 para leer archivos de configuración de restaurantes— pasaba por el NAT Gateway en lugar del endpoint de S3. Las funciones Lambda se ejecutaban dentro de la VPC (para el acceso a RDS), y el endpoint de S3 de la VPC estaba configurado solo para las instancias EC2 en la subred de la aplicación. Las funciones Lambda en la subred de Lambda se enrutaban a través de NAT.

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya. "Tenemos el endpoint. ¿Por qué Lambda no lo usa?"

"Los endpoints de gateway de VPC se aplican por subred según las tablas de rutas," dijo Tom. "Las funciones Lambda están en su propia subred con su propia tabla de rutas. Esa tabla de rutas no tenía la ruta del endpoint. La añadí para la subred de la aplicación. Me salté la subred de Lambda."

Añadir la ruta del endpoint de S3 a la tabla de rutas de la subred de Lambda ahorraría otros 41 USD/mes en tarifas de procesamiento del NAT Gateway que habían estado cobrando por llamadas a S3 que deberían haber sido gratuitas.

El análisis de los flow logs se había amortizado. Tres horas de tiempo de consulta, tres hallazgos concretos: el endpoint olvidado de la VPC de analítica (13,50 USD/mes), la brecha de enrutamiento de la subred de Lambda (41 USD/mes), y el hallazgo grande original que se convirtió en la base de las decisiones sobre los endpoints de interfaz. Ahorro mensual adicional total identificado por el análisis de los flow logs: 54,50 USD, además de los 78 USD de los endpoints de interfaz que el análisis ya había sacado a la luz. Esas dos correcciones más pequeñas pasaron al backlog para el siguiente sprint; la tabla de ahorros al final de este capítulo cuenta solo lo que se entregó.

"La lección es que los endpoints de VPC no son una configuración de una sola vez," dijo Tom. "Cada nueva VPC, cada nueva subred, cada nuevo tipo de carga de trabajo requiere la misma comprobación. El comportamiento predeterminado para cualquier cosa en una subred privada es enrutar a través de NAT. La comprobación es: ¿esta carga de trabajo llama a S3, DynamoDB o alguno de los servicios de AWS de alto tráfico? Si es así, ¿tiene una ruta de endpoint?"

"¿Hemos pensado en automatizar esa comprobación?" preguntó Priya. "¿Una regla de AWS Config que alerte cuando se crea una subred privada sin una ruta de endpoint de S3?"

"Está en la lista," dijo Tom. "Justo después de la alerta de volúmenes huérfanos."


Y con eso, Tom tenía su respuesta a la pregunta que había iniciado el análisis. Los costes de red no eran un solo problema. Eran cinco problemas diferentes, cada uno con una solución diferente.

**Cómo AWS Cobra la Transferencia de Datos**

Los precios de transferencia de datos de AWS son asimétricos:

**Entrante a AWS (inbound)**: Gratuito. Puedes cargar tantos datos como quieras.

**Saliente de AWS a internet (outbound)**: Cobrado. Los primeros 100GB/mes son gratuitos. Después:

- 0,09 USD/GB para los primeros 10TB/mes (regiones de EE. UU.)
- 0,085 USD/GB para los siguientes 40TB
- Menor a volúmenes más altos

**Dentro de la misma Zona de Disponibilidad**: Gratuito. Las instancias EC2 que se comunican entre sí en la misma AZ no pagan nada.

**Entre Zonas de Disponibilidad (misma región)**: 0,01 USD/GB en cada dirección. Un coste pequeño pero real.

**Entre Regiones**: 0,02-0,08 USD/GB dependiendo de las regiones. El tráfico entre regiones es significativamente más caro.

**NAT Gateway**: 0,045 USD/GB procesado. Cada byte que tu instancia EC2 privada envía a través del NAT Gateway para llegar a internet, y cada byte que regresa, se cobra.

**CloudFront**: Tasas de transferencia de datos más bajas que directo de AWS a internet. 0,085 USD/GB para los primeros 10TB (ligeramente menos que la transferencia de datos de salida directa). CloudFront a menudo reduce los costes totales de transferencia porque su caché en el edge significa que el origen sirve los datos con menos frecuencia.

**El Desglose de Tom**

"¿Cuánto cuesta eso por mes?" se preguntó Tom, para cada línea por turno. Las añadió a una pestaña aparte de la hoja de cálculo: no el total mensual, sino cada categoría desglosada. El total era menos útil que entender qué parte de la factura era qué tipo de coste.

Después de categorizar cada línea:

**Datos de salida a internet**: 214 USD/mes

- Respuestas de API a clientes a nivel global
- Activos todavía servidos directamente desde S3 y el ALB a los clientes, evitando CloudFront (los rellenos de caché en sí —CloudFront obteniendo de un origen de AWS— son gratuitos: AWS exime la transferencia de origen a CloudFront)

**Procesamiento del NAT Gateway**: 289 USD/mes

- Servidores de aplicación llamando a API externas (procesador de pagos, servicio de correo electrónico, datos de mapas)
- Llamadas de DynamoDB pasando por el NAT Gateway (antes de configurar los endpoints de VPC para algunas tablas)

**Transferencia de datos entre AZ**: 178 USD/mes

- Del balanceador de carga a instancias EC2 (el balanceador de carga está en una AZ, algunas instancias en otra)
- Del servidor de aplicación a la réplica de lectura de RDS (en una AZ diferente)

**Transferencia de datos entre regiones**: 166 USD/mes

- Replicación de Aurora Global Database (primario en us-west-2, lector en us-east-1)
- Replicación entre regiones de S3 para respaldos
- El pipeline de prueba olvidado de Leo (6 USD/mes de este total)

**NAT Gateway: La Mayor Sorpresa**

289 USD/mes en tarifas de procesamiento del NAT Gateway era el elemento más grande. Y el análisis de los VPC Flow Logs lo había hecho específico: el principal consumidor eran los servidores de aplicación llamando a las API de los servicios de AWS (SSM, Secrets Manager, CloudWatch Logs) a través del NAT Gateway.

En el capítulo 11, Tom había configurado endpoints de gateway de VPC para S3 y DynamoDB. Estos eran gratuitos. Pero había pasado por alto la configuración de endpoints de interfaz para varios otros servicios:

- Systems Manager (SSM) para la gestión de parches
- Secrets Manager para la recuperación de credenciales
- CloudWatch para el envío de métricas y registros
- SQS para el sondeo de mensajes

Cada llamada a estos servicios desde instancias EC2 privadas pasaba por el NAT Gateway. Cada llamada cobraba 0,045 USD/GB.

Quizás te preguntes por qué AWS cobra por el tráfico que pasa por el NAT Gateway cuando ya estás dentro de la red de AWS. La respuesta es que el propio NAT Gateway es un servicio gestionado: cuesta dinero ejecutarlo, y AWS traslada ese coste por gigabyte. Los endpoints de VPC eliminan al intermediario, que es por lo que reducen la factura.

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya, cuando Tom mostró los números. "Configuramos endpoints de gateway para S3 y DynamoDB. ¿Por qué no hicimos lo mismo para SSM y CloudWatch?"

"Los endpoints de gateway solo están disponibles para S3 y DynamoDB," dijo Tom. "Para todo lo demás —SSM, Secrets Manager, SQS— necesitas endpoints de interfaz. No son gratuitos, pero son más baratos que enrutar a través del NAT al volumen que estamos generando."

Los **endpoints de interfaz** para estos servicios: 0,01 USD/hora por AZ + 0,01 USD/GB de datos procesados.

Al volumen de Nimbus, el endpoint de interfaz de SSM costaría aproximadamente 25 USD/mes (cargos por hora más el procesamiento por GB) y ahorraría aproximadamente 45 USD/mes en cargos del NAT Gateway (porque SSM genera un volumen de datos significativo para la gestión de parches y las llamadas al almacén de parámetros).

Los costes y ahorros del endpoint variaban según el servicio y el volumen. Tom calculó que configurar endpoints de interfaz para los cuatro servicios de alto tráfico —dos AZ cada uno, más el procesamiento de 0,01 USD/GB sobre los 3,9TB que transportarían— costaría aproximadamente 97 USD/mes en total y ahorraría aproximadamente 176 USD/mes en procesamiento del NAT Gateway.

Ahorro neto: 78 USD/mes solo con la configuración de endpoints.

"¿Y qué pasa si alguien intenta entrar?" dijo Priya, cuando la conversación sobre los endpoints de VPC giró hacia la implementación. "El endpoint de VPC significa que el tráfico nunca toca la internet pública: eso no es solo coste, es reducción de la superficie de amenaza. Deberíamos haber hecho esto solo por el beneficio de seguridad."

"De acuerdo," dijo Tom. "Los ahorros de costes son un extra."

Leo miró la lista de servicios que habían estado enrutando a través de NAT. "Puede que haya configurado los endpoints de logs de CloudWatch sin comprobar si había un endpoint de VPC para ello," dijo. "Irá bien por ahora, pero sí, eso ha estado pasando por NAT durante seis meses."

"Está en la lista," dijo Tom. "CloudWatch es uno de los cuatro que estamos arreglando."

**El Cálculo de PrivateLink: Cuándo Tiene Sentido**

Hay una versión más compleja de esta conversación que surge a medida que crecen las arquitecturas: usar AWS PrivateLink para proporcionar conectividad privada a servicios alojados por otros clientes de AWS (o tus propios servicios en otras VPC).

Los endpoints de interfaz de PrivateLink cuestan 0,01 USD/hora por AZ más 0,01 USD/GB. Para un servicio que genera 1TB/mes de tráfico a través del endpoint:

- Coste de PrivateLink: 0,01 USD × 2 AZ × 730 horas + 0,01 USD × 1.000GB = 14,60 USD + 10 USD = 24,60 USD/mes
- Enrutar el mismo tráfico a través del NAT Gateway existente en su lugar: 0,045 USD × 1.000GB = 45 USD/mes de cargos de procesamiento incrementales

La comparación es *incremental*, porque el NAT Gateway se queda de cualquier modo: sigue sirviendo al resto del tráfico destinado a internet, así que su coste por hora (0,045 USD × 2 × 730 = 65,70 USD) no desaparece cuando este servicio se mueve a un endpoint. Para este volumen de tráfico, PrivateLink ahorra aproximadamente 20 USD/mes. El punto de equilibrio es de aproximadamente 420GB/mes: por debajo de eso, el coste por hora del propio endpoint supera el ahorro por GB respecto al procesamiento de NAT.

"Espera, ¿pero *por qué* usaríamos PrivateLink en lugar de simplemente una VPN o peering?" preguntó Maya.

"VPC Peering es más simple y gratuito para las transferencias dentro de la misma región," dijo Tom. "Pero el peering crea una conexión totalmente enrutada entre VPC: cualquier cosa en la VPC A puede potencialmente alcanzar cualquier cosa en la VPC B. PrivateLink es más quirúrgico. El endpoint expone un servicio específico, no una ruta de red completa. Para arquitecturas conscientes de la seguridad, esa especificidad importa."

"¿Y qué pasa si alguien intenta entrar en una VPC con peering?" preguntó Priya. "El peering completo significa que una instancia comprometida en una VPC tiene una ruta a cada instancia de la VPC con peering."

"Ese es el argumento a favor de PrivateLink sobre el peering cuando te conectas a un servicio de terceros o a un servicio de un equipo separado," dijo Tom. "Peering para VPC internas de confianza. PrivateLink para cualquier cosa donde quieras la conexión de mínima exposición."

**Tráfico entre AZ: Una Cuestión Arquitectónica**

Los 178 USD/mes en transferencia de datos entre AZ eran más complicados.

Parte de ello era inevitable: el balanceador de carga distribuye el tráfico entre AZ, por lo que algunas solicitudes se originan en una AZ y el balanceador de carga las reenvía a una instancia en otra AZ.

Parte era optimizable: la aplicación estaba configurada para escribir en la primaria de RDS (en us-west-2a) y leer de la réplica de lectura (en us-west-2b). Cada consulta de lectura cruzaba los límites de la AZ.

Para las lecturas, una solución: configurar la aplicación para que prefiera una réplica de lectura en la misma AZ que la instancia que realiza la solicitud. Cada AZ obtiene su propia réplica de lectura. El tráfico permanece local.

Compensación: más réplicas de lectura = más coste. Si el coste del tráfico entre AZ es de 50 USD/mes y una réplica de lectura adicional cuesta 190 USD/mes, la optimización local de AZ no merece la pena.

Tom calculó: a su volumen actual de consultas, el tráfico entre AZ era solo de 31 USD/mes del total de 178 USD. No valía la pena añadir réplicas por eso.

Los otros costes entre AZ eran el enrutamiento del balanceador de carga y la comunicación entre servicios, en gran medida inevitables al nivel de arquitectura actual.

"Este es uno de esos casos donde entender el coste no significa que debas corregirlo," dijo Tom.

"¿Cuánto costaría eliminar el tráfico entre AZ por completo?" preguntó Maya.

"Poner todo en una AZ derrota el propósito de Multi-AZ. Eso es un ahorro de 31 USD/mes al coste de perder alta disponibilidad."

"Entonces lo dejamos," dijo ella.

"Lo dejamos."

**S3 Select: Reduciendo la Transferencia de Datos en las Consultas**

Mientras revisaba el pipeline de analítica, Tom encontró otra optimización específica de cómo el equipo de analítica consultaba archivos grandes de S3.

El patrón: cada mañana, un trabajo de analítica descargaba un archivo Parquet de 500MB de S3 para filtrarlo en memoria en busca de datos de pedidos específicos de restaurantes. Aproximadamente el 95% del archivo se descartaba después de la descarga.

**S3 Select** te permite recuperar solo las filas y columnas que necesitas de un objeto S3 (CSV, JSON, Parquet), en lugar de descargar el archivo completo para filtrarlo en tu aplicación.

> **Actualización importante**: a mediados de 2024, AWS dejó de ofrecer S3 Select a nuevos clientes; los usuarios existentes lo conservan, pero es un callejón sin salida para las arquitecturas nuevas. El principio que enseña esta sección (filtrar en la capa de almacenamiento, no enviar el archivo entero) es atemporal; la herramienta moderna para ello es **Amazon Athena** (SQL directamente sobre S3, incluyendo uniones y agregaciones que S3 Select nunca tuvo). **S3 Object Lambda**, antes la otra alternativa, siguió a S3 Select hacia el estado heredado: desde el 7 de noviembre de 2025 también está cerrado a nuevos clientes (las cargas de trabajo existentes siguen funcionando). En un examen actual, "consultar datos en su lugar en S3" apunta a Athena. La historia siguiente se conserva porque el *razonamiento* —medir primero, mover el filtro a los datos— es la lección.

Sin S3 Select:
```python
# Descarga el archivo de 500 MB, procésalo en memoria
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Con S3 Select:
```python
# Deja que S3 filtre primero, transfiere solo las filas que coinciden (~2 MB en lugar de 500 MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select reduce los datos transferidos de S3 a tu aplicación. Para archivos grandes con consultas selectivas, esto puede ser una reducción de 10 a 100 veces en el volumen de datos, y, dado que la instancia de analítica se ejecuta en la misma región que el bucket, la ganancia no es una factura de transferencia (la transferencia de S3 a EC2 en la misma región es gratuita): es el cómputo, la memoria y el tiempo gastados descargando y filtrando datos que inmediatamente desechas.

Tom lo planteó al equipo de analítica. Al principio se resistieron.

"Ya sabemos escribir pandas," dijo un analista.

"Esto no se trata de pandas," dijo Tom. "Se trata del hecho de que estáis descargando 500MB para obtener 2MB de datos. La descarga en sí es gratuita —misma región—, pero la instancia no. Ejecutáis esto para cada restaurante: 287 restaurantes, 287 consultas, 140GB extraídos y filtrados en pandas cada noche. Eso es lo que mantiene la instancia de analítica ocupada durante dos horas, y por eso es una xlarge."

"¿Y S3 Select?"

"S3 Select cobra 0,002 USD por GB escaneado y 0,0007 USD por GB devuelto: alrededor de una décima de centavo por consulta. A cambio, la instancia recibe 600MB por noche en lugar de 140GB, el trabajo termina en minutos, y la instancia puede bajar un tamaño."

"Eso son 450 dólares al mes," dijo el analista, después de hacer las cuentas de la instancia: una estimación a ojo a partir de la tarifa horaria de la instancia y las horas que pasaba trabajando duro.

"Por eso estoy aquí," dijo Tom. El número real resultaría ser más bajo: cuando Tom más tarde extrajo el gasto de cómputo real atribuible al trabajo nocturno, fue de 202 USD/mes, no 450. Las cuentas en una servilleta encuentran el problema; la medición lo dimensiona.

Tom lo planteó primero con Leo, antes de involucrar al equipo de analítica en la conversación. Sabía que Leo se resistiría, y quería entender la resistencia antes de que se convirtiera en un debate a nivel de sala.

"S3 Select ahorraría 180 USD/mes en las consultas del pipeline de analítica," dijo Tom.

"Eso requiere reescribir cada consulta," dijo Leo.

"Requiere cambiar el patrón de acceso a datos de 'descargar y filtrar' a 'consultar vía la API de S3 Select'."

"Lo cual es una reescritura."

"Es un cambio en las llamadas a la biblioteca cliente," dijo Tom. "La lógica de la consulta —las expresiones de filtrado— se queda igual. Lo que cambia es dónde ocurre el filtrado. Actualmente: EC2. Con S3 Select: S3."

"He leído la documentación de S3 Select," dijo Leo. "No puedes hacer uniones. No puedes hacer agregaciones más complejas que SUM y COUNT básicas. Algunas de nuestras consultas de analítica son más sofisticadas que eso."

"Lo sé," dijo Tom. "Por eso no propongo S3 Select para todas las consultas. Lo propongo para las consultas de resumen diario específicas de restaurantes. Ese es el archivo Parquet de 500MB filtrado por restaurant_id, extrayendo dos columnas. Esa consulta es un puro filtrar-y-proyectar. S3 Select es exactamente la herramienta correcta para ese caso."

Leo se quedó callado un momento. Abrió la consulta en cuestión.

```python
# Actual: descarga 500 MB, filtra en memoria
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"La versión de S3 Select sería... ¿la llamada a select_object_content?"

"Sí," dijo Tom. "Reemplazarías la llamada a read_parquet con una llamada a select_object_content que empuja la cláusula WHERE a S3. El resultado vuelve ya filtrado. Obtienes un flujo de registros coincidentes en lugar del archivo Parquet completo."

"Y tendría que gestionar la respuesta de forma diferente."

"El formato de respuesta es CSV por defecto. Necesitarías un pequeño envoltorio para volver a parsearlo a un DataFrame, o usas el formato de salida Parquet si quieres mantener la lógica de parseo actual."

Leo lo miró. "¿Cuánto trabajo es eso?"

"Medio día," dijo Tom. "Quizás un día si quieres probarlo a fondo en los 287 IDs de restaurantes del lote nocturno."

"Por 180 USD/mes."

"2.160 USD al año," dijo Tom. "Y el enfoque escala. A 2.000 restaurantes, la misma consulta sobre el mismo tamaño de archivo cuesta aún más sin S3 Select. Estás invirtiendo un día hoy para evitar un problema mucho mayor más adelante."

Leo cerró el notebook. "Las consultas donde S3 Select no funciona —las consultas de agregación, las comparaciones entre restaurantes—, ¿esas se quedan tal cual?"

"Esas se quedan tal cual," confirmó Tom. "No estoy intentando reescribir el pipeline de analítica. Estoy intentando dejar de descargar 500 MB para usar 2 MB de ellos."

"Vale," dijo Leo. "Lo haré esta semana."

Lo hizo. La implementación tomó seis horas. Envolvió la llamada a S3 Select en una función de utilidad que coincidía con la misma interfaz que la llamada existente a read_parquet: el código que llamaba en el lote nocturno no necesitó cambios en absoluto. Solo cambió la capa de acceso a datos.

El mes siguiente, la factura de cómputo nocturno del pipeline de analítica bajó de 202 USD a 22 USD: el trabajo terminaba en minutos en lugar de horas, en una instancia más pequeña. El ahorro de 180 USD/mes había costado seis horas de tiempo de ingeniería. Anualizado, eso era un retorno del 1.800% sobre la inversión de tiempo.

"La parte a la que me resistí," dijo Leo, en la revisión mensual, "fue la reescritura. Resultó ser un reemplazo de función, no una reescritura. Estaba resolviendo un problema imaginado."

"Eso vale la pena anotarlo," dijo Tom. "Cuando estás evaluando si implementar una optimización, sé específico sobre cuál es realmente el trabajo. 'Requiere reescribir consultas' era la versión imaginada. 'Requiere cambiar la función de acceso a datos' era la versión real."


**"Coste Intencional vs No Intencional"**

Al final del análisis de red de tres semanas, Tom llevó el desglose completo de vuelta al equipo. Tenía una nueva columna en su hoja de cálculo: "¿Intencional?" con un sí o un no para cada línea.

"Ese es el marco que estoy usando ahora," dijo. "No solo 'cuánto cuesta', sino '¿decidimos gastar esto?'"

"¿Qué es un coste intencional?" preguntó Maya.

"La replicación de Aurora Global Database. Decidimos replicar a us-east-1 porque tenemos socios de restaurantes en la Costa Este. Eso son 120 USD/mes en replicación entre regiones: aproximadamente el doble de la estimación a ojo de los días de planificación de la recuperación ante desastres. Elegimos ese coste por una razón específica."

"¿Y no intencional?"

"El pipeline de analítica de Leo escribiendo a us-east-1 durante cinco meses después de que terminara una prueba. Nadie eligió eso. Estaba ocurriendo porque nadie estaba mirando."

"¿Y los cargos del NAT Gateway por las llamadas a servicios de AWS?"

"En algún punto intermedio," dijo Tom. "No decidimos explícitamente enrutar SSM a través del NAT Gateway: eso era el comportamiento predeterminado. No sabíamos que había una opción más barata. ¿Es eso intencional? Tomamos una decisión, simplemente no sabíamos lo que estábamos eligiendo."

"Esa es la categoría más peligrosa," dijo Priya. "Las decisiones que no sabes que estás tomando."

"Por eso importa el análisis de los VPC Flow Logs," dijo Tom. "Hace visible lo invisible. Cada byte que cruza un límite tiene ahora una historia que podemos rastrear."

"¿Hemos pensado en qué pasa si dejamos que esto vuelva a desviarse?" preguntó Priya. "Hemos hecho un análisis de una sola vez. En seis meses, Leo habrá creado otro bucket de prueba en algún lugar."

"Estaré justo aquí," dijo Leo. "La próxima vez lo haré en eu-west-1 para que al menos cueste más por GB y os deis cuenta más rápido."

"Revisión mensual de los VPC Flow Logs," dijo Tom. "La añadiré a la revisión trimestral de costes. Si vemos un nuevo flujo entre regiones o un pico del NAT Gateway, lo rastreamos antes de la siguiente factura."

**Variación: La Compensación que Aceptas**

Si eliminas el tráfico entre AZ ejecutando todo en una sola Zona de Disponibilidad, ahorras aproximadamente 31 USD/mes al volumen actual de Nimbus, pero pierdes la redundancia Multi-AZ que vale mucho más que eso en riesgo de incidentes. La conversación madura sobre costes no siempre se trata de encontrar ahorros; a veces se trata de entender exactamente por qué estás pagando y decidir que vale la pena.

El cargo entre AZ es el precio de la resiliencia. Algunos costes de red son compromisos arquitectónicos, no ineficiencias.

Conexión con SAA-C03: el examen presenta frecuentemente escenarios donde una "optimización de costes" eliminaría una redundancia. La respuesta correcta suele ser preservar la redundancia y optimizar en otro lugar: conoce la diferencia entre desperdicio y el coste de la fiabilidad.

**CloudFront: El Descuento en Transferencia de Datos**

Aquí hay un hecho contraintuitivo: servir datos a través de CloudFront es generalmente más barato que servirlos directamente desde EC2 o S3.

**Directo de EC2 a internet**: 0,09 USD/GB
**CloudFront a internet**: 0,085 USD/GB (ligeramente más barato)

Pero el ahorro real no está en la tarifa por GB, sino en que CloudFront almacena datos en caché en las ubicaciones edge. Si 1.000 usuarios solicitan la misma foto del menú:

- **Sin CloudFront**: 1.000 solicitudes salen de S3 directamente a internet × tamaño de la foto × 0,09 USD/GB
- **Con CloudFront**: los clientes obtienen la foto del edge a la tarifa de CloudFront (0,085 USD/GB), y el relleno de caché —CloudFront obteniendo de S3 en el 1 fallo— es **gratuito** (AWS exime la transferencia de origen a CloudFront; solo pagas las solicitudes GET del origen)

Para Nimbus con una tasa de aciertos de caché del 83% (del capítulo 13), el 83% de las solicitudes nunca tocaban el origen en absoluto: menos solicitudes al origen, menos carga en el origen, y cada byte facturado a la tarifa del edge en lugar de la tarifa de internet de S3.

"CloudFront no es solo una CDN para el rendimiento," dijo Tom. "También es una optimización de costes para la transferencia de datos."

Leo parecía pensativo. "Deberíamos mover toda la entrega de contenido estático a través de CloudFront, incluso para activos que no son sensibles a la latencia."

"Correcto. Si los usuarios lo están descargando desde AWS, debería pasar por CloudFront."

**La Optimización de Red Completa**

Después de tres semanas de análisis e implementación:

| Elemento de Coste                              | Antes    | Después  | Ahorro Mensual |
|------------------------------------------------|----------|----------|----------------|
| NAT Gateway (endpoints de interfaz)            | 289 USD  | 211 USD  | 78 USD         |
| Optimización de CloudFront (mover más activos) | 214 USD  | 147 USD  | 67 USD         |
| Tráfico entre AZ (aceptado tal cual)           | 178 USD  | 178 USD  | 0 USD          |
| Tráfico entre regiones (bucket de prueba de Leo) | 166 USD  | 160 USD  | 6 USD          |
| **Total**                                      | **847 USD** | **696 USD** | **151 USD/mes** |

151 USD/mes, 1.812 USD/año en ahorros de red. Modestos comparados con el cómputo y el almacenamiento, pero significativos.

Más importante: Tom ahora entendía cada línea de la factura de red. Podía explicar cada coste y había decidido conscientemente cuáles optimizar y cuáles aceptar. La distinción entre coste intencional y no intencional era ahora explícita y estaba documentada.

## Ventajas y Limitaciones

**Costes del NAT Gateway**:

- Los grandes volúmenes de datos a través del NAT Gateway se acumulan rápidamente
- Los endpoints de VPC eliminan algunos costes de NAT por completo
- Revisa a qué servicios llaman tus instancias privadas y si hay endpoints disponibles

**CloudFront para el coste**:

- La tasa de aciertos de caché determina directamente los ahorros de costes
- Alta tasa de aciertos de caché = menos solicitudes al origen y menos carga en el origen, además de más bytes facturados a la tarifa más barata del lado del visualizador de CloudFront (la transferencia de origen a CloudFront desde orígenes de AWS no se cobra en absoluto)
- Mueve toda la entrega de activos estáticos a través de CloudFront

**Compensaciones entre AZ**:

- Eliminar el tráfico entre AZ normalmente requiere cambios arquitectónicos que cuestan más que los ahorros
- Calcula cuidadosamente antes de optimizar

**S3 Select** (heredado: no disponible para nuevos clientes desde 2024; usa Athena en su lugar. S3 Object Lambda también es heredado ahora: cerrado a nuevos clientes desde noviembre de 2025, las cargas de trabajo existentes no se ven afectadas):

- El principio se mantiene: filtra en la capa de almacenamiento en lugar de descargar objetos grandes de S3; los ahorros aparecen en el tiempo de cómputo, el tamaño de la instancia y la duración del trabajo (la transferencia de S3 en la misma región ya es gratuita)
- No ayuda cuando necesitas el archivo completo

## Resumen

Tom cerró el análisis de red con un número en la pizarra y una comprensión más clara de lo que realmente era la última incógnita de la factura. Los 847 USD/mes en costes de red no habían sido un misterio de incompetencia: eran el coste esperado de un sistema distribuido que abarcaba zonas de disponibilidad, servía a usuarios globales y replicaba datos entre regiones. La mayor parte valía la pena pagarla. Otra parte no. El avance clave fue poder distinguir cuál era cuál.

- AWS cobra por **datos de salida** (internet: ~0,09 USD/GB), **tráfico entre AZ** (0,01 USD/GB en cada dirección), **tráfico entre regiones** (0,02-0,08 USD/GB) y **procesamiento del NAT Gateway** (0,045 USD/GB).
- Los **datos de entrada** son gratuitos. El **tráfico en la misma AZ** es gratuito.
- Los **VPC Flow Logs** revelan qué flujos de tráfico específicos dentro de tus VPC generan cada categoría de coste: esenciales para la optimización dirigida. Los flujos que nunca cruzan una interfaz de red de VPC (como CloudFront obteniendo de un origen de S3) necesitan sus propios instrumentos: logs estándar de CloudFront o logs de acceso al servidor de S3.
- Los **endpoints de gateway de VPC** (S3, DynamoDB): Gratuitos. Eliminan los costes del NAT Gateway para estos servicios.
- Los **endpoints de interfaz de VPC**: Precio por hora más por GB. Más baratos que el NAT Gateway para servicios de alto volumen.
- **CloudFront** sirve datos a tarifas más bajas que directo de EC2 a internet y reduce drásticamente el volumen de transferencia del origen mediante el almacenamiento en caché.
- La pregunta crítica no es solo "cuánto" sino "¿es este coste intencional?" Los costes no intencionales —pipelines de prueba olvidados, enrutamiento predeterminado a través de NAT— son donde se esconden los ahorros reales.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste (Dominio 4, Tarea 4.4)*

- **NAT Gateway vs endpoints de VPC**: Escenario del examen: "EC2 en subred privada llama frecuentemente a S3/DynamoDB, ¿cómo reducir los costes del NAT Gateway?" → Endpoints de gateway de VPC (gratuitos para S3 y DynamoDB).
- **Reglas de precios de transferencia de datos**:
  - Entrante a AWS: gratuito
  - Misma AZ: gratuito
  - Entre AZ: cobrado
  - Entre regiones: cobrado (tarifa más alta)
  - Internet: cobrado (tarifa significativa)
- **CloudFront como optimización de costes**: "Reducir los costes de transferencia de datos para la entrega de contenido global" → CloudFront. La capa de caché reduce las solicitudes al origen.
- **S3 Transfer Acceleration**: Acelera las cargas *hacia* S3 usando las ubicaciones edge de CloudFront. Mayor coste que S3 estándar. Úsalo para clientes que cargan archivos grandes desde ubicaciones geográficamente distantes.
- **Costes de replicación entre regiones**: Replicar datos entre regiones incurre en cargos de transferencia de datos. Para S3 CRR, pagas tanto la tarifa de transferencia de datos de salida como el coste de la solicitud de S3.
- **PrivateLink (endpoints de interfaz de VPC)**: Proporciona conectividad privada a los servicios de AWS y a los servicios alojados por otros clientes de AWS. Más seguro que pasar por NAT, a menudo más barato para servicios de alto volumen. El punto de equilibrio frente al procesamiento del NAT Gateway es de aproximadamente 420GB/mes (contando el coste por hora por AZ del propio endpoint, y asumiendo que el NAT Gateway permanece para otro tráfico).

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre un endpoint de gateway de VPC y un endpoint de interfaz de VPC. ¿Para qué servicios de AWS está disponible cada uno, y cuál es el coste de cada uno?

*(Pista: Los endpoints de gateway son gratuitos pero solo para S3 y DynamoDB. Los endpoints de interfaz cuestan por hora pero funcionan para la mayoría de los demás servicios de AWS.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: La aplicación de una empresa se ejecuta en instancias EC2 en subredes privadas. Las instancias realizan llamadas frecuentes a la API de Amazon SQS y Amazon S3. Actualmente, todo el tráfico sale por un NAT Gateway. El equipo quiere reducir los costes del NAT Gateway. La seguridad de los datos debe mantenerse: ningún tráfico debe atravesar la internet pública.

¿Qué enfoque cumple MEJOR con estos requisitos con el menor coste continuo?

A) Crear un endpoint de gateway para SQS y un endpoint de gateway para S3  
B) Crear endpoints de interfaz tanto para SQS como para S3  
C) Crear un endpoint de interfaz para SQS y un endpoint de gateway para S3  
D) Eliminar el NAT Gateway y usar el Internet Gateway directamente para las llamadas a la API

**Pista 1**: Los endpoints de gateway solo están disponibles para S3 y DynamoDB.

**Pista 2**: Los endpoints de interfaz están disponibles para SQS y muchos otros servicios (pero cuestan dinero).

**Pista 3**: Un Internet Gateway en la tabla de rutas de la subred privada la convertiría en una subred pública, violando los requisitos de seguridad.

**Respuesta**: C

**Explicación**: S3 usa un endpoint de gateway (gratuito). SQS requiere un endpoint de interfaz (con precio). Esta combinación elimina los costes de procesamiento de datos del NAT Gateway para ambos servicios. Todo el tráfico permanece dentro de la red privada de AWS: sin traversal de internet pública.

**¿Por qué no A?** Los endpoints de gateway no están disponibles para SQS. Solo S3 y DynamoDB tienen endpoints de gateway.

**¿Por qué no B?** Aunque funciona, usar un endpoint de interfaz para S3 (en lugar del endpoint de gateway gratuito) incurre en cargos por hora innecesarios. Usa siempre el endpoint de gateway gratuito para S3 y DynamoDB.

**¿Por qué no D?** Añadir una ruta al Internet Gateway desde la subred privada la convierte en una subred pública. Las instancias EC2 en subredes privadas normalmente no tienen IPs elásticas, por lo que en realidad no podrían enrutar a través de un Internet Gateway sin cambios adicionales, y hacerlo las expondría al tráfico de internet entrante.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste — Tarea 4.4*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Los usuarios de la Costa Este de Nimbus generan un tráfico significativo. La aplicación les sirve desde us-west-2 (Oregón). Actualmente:

- Las respuestas de la API van directamente desde instancias EC2 de us-west-2 a usuarios de la Costa Este (~80 ms, 0,09 USD/GB)
- Las fotos del menú van desde S3 us-west-2 a través del edge de CloudFront en Boston (~8 ms después del almacenamiento en caché)

El equipo está considerando añadir una segunda región de aplicación en us-east-1 (Norte de Virginia) para que los usuarios de la Costa Este reduzcan la latencia de la API.

Analiza los costes de transferencia de datos de este cambio. ¿Qué nuevos costes de transferencia de datos entre regiones incurriría la configuración de doble región? ¿El enrutamiento basado en latencia de Route 53 reduciría o aumentaría los costes totales de transferencia? ¿En qué condiciones (volumen de tráfico, sensibilidad a la latencia) compensaría la configuración de doble región?

*(No hay una única respuesta correcta. El objetivo es practicar el análisis de coste-beneficio multi-región.)*

## Escena Poscréditos

Tom cerró el análisis de red.

Impacto total del proyecto de optimización de tres meses:

- Savings Plans de EC2: -14.200 USD/año
- Políticas de ciclo de vida de S3: -7.800 USD/año
- Almacenamiento (S3 + EBS): -6.200 USD/año
- Nivel de base de datos: -5.892 USD/año
- Red: -1.812 USD/año
- **Total: -35.904 USD/año**

Lo escribió en una pizarra en la sala de reuniones.

Leo lo miró fijamente. "Treinta y cinco mil."

"Y pico," dijo Tom.

"Al año."

"Al año."

Priya hizo los cálculos. "Eso son 2.992 dólares al mes que estábamos gastando en cosas que no creaban valor."

"No todo," corrigió Tom. "Parte de ello eran cosas de las que obteníamos valor, pero pagando demasiado. Los Savings Plans: obteníamos exactamente la misma capacidad de EC2, solo a un mejor precio."

Maya se quedó de pie frente a la pizarra durante un buen rato.

"Cuando empezamos Nimbus," dijo, "cada dólar contaba. Apenas podíamos pagar la primera instancia EC2."

"Sí," dijo Tom.

"Y en algún momento del camino, dejamos de vigilar los dólares tan de cerca."

"El crecimiento hace eso," dijo Priya. "El foco se desplaza a construir, no a optimizar."

"Ambos importan," dijo Maya. "Ambos, siempre. Añade esto al wiki. Y establece una revisión trimestral de costes."

Tom ya estaba abriendo su calendario.

En los siguientes capítulos: hacemos zoom desde los servicios individuales y empezamos a pensar como arquitectos.
