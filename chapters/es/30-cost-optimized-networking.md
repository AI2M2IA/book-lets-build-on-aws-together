# Capítulo 30: El Coste Oculto

Los costes de almacenamiento aparecen como una línea: "S3: 198 USD." Los costes de cómputo aparecen como una línea: "EC2: 2.340 USD." Los costes de red se dispersan en una docena de líneas con nombres como "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer" y "CloudFront Data Transfer." La mayoría de los ingenieros los suman una vez, parpadean y los suman de nuevo.

Tom había dicho: "Los costes de red. Ese es el siguiente."

Abrió la factura. Encontró la sección de transferencia de datos. Sumó todas las líneas.

Los costes de red en AWS son como el sistema de peaje de una ciudad: entrar a la ciudad es gratuito, pero cada túnel que tomas de salida cuesta dinero, y circular entre barrios también cuesta un poco. La mayoría de la gente no piensa en los peajes hasta que recibe la factura a final de mes y se da cuenta de que ha estado tomando el túnel todos los días cuando había una carretera de superficie gratuita todo el tiempo. El objetivo de este capítulo es entender cada caseta de peaje, y decidir cuáles vale la pena pagar.

847 USD/mes.

"Estamos gastando 847 dólares al mes en transferencia de datos," dijo.

"¿Es mucho?" preguntó Leo.

"Es más que nuestra factura de S3 antes de optimizarla. Y ni siquiera sabía que teníamos una factura de transferencia de datos de este tamaño."

Maya miró. "¿Qué es exactamente la transferencia de datos?"

"Es lo que AWS cobra por mover bytes. Bytes entrantes a AWS: generalmente gratuito. Bytes salientes de AWS a internet: cobrado. Bytes entre servicios en diferentes regiones: cobrado. Bytes que pasan por un NAT Gateway: cobrado."

"¿Puedes desglosarlo?"

Tom podía. Y lo que encontró cambió la forma en que el equipo pensaba sobre su arquitectura.

**Cómo AWS Cobra la Transferencia de Datos**

Los precios de transferencia de datos de AWS son asimétricos:

**Entrante a AWS (inbound)**: Gratuito. Puedes cargar tantos datos como quieras.

**Saliente de AWS a internet (outbound)**: Cobrado. Los primeros 100 GB/mes son gratuitos. Después:

- 0,09 USD/GB para los primeros 10 TB/mes (regiones de EE. UU.)
- 0,085 USD/GB para los siguientes 40 TB
- Menor a volúmenes más altos

**Dentro de la misma Zona de Disponibilidad**: Gratuito. Las instancias EC2 que se comunican entre sí en la misma AZ no pagan nada.

**Entre Zonas de Disponibilidad (misma región)**: 0,01 USD/GB en cada dirección. Un coste pequeño pero real.

**Entre Regiones**: 0,02-0,08 USD/GB dependiendo de las regiones. El tráfico entre regiones es significativamente más caro.

**NAT Gateway**: 0,045 USD/GB procesado. Cada byte que tu instancia EC2 privada envía a través del NAT Gateway para llegar a internet, y cada byte que regresa, se cobra.

**CloudFront**: Tasas de transferencia de datos más bajas que directo de AWS a internet. 0,085 USD/GB para los primeros 10 TB (ligeramente menos que la transferencia de datos de salida directa). CloudFront a menudo reduce los costes totales de transferencia porque su caché en el edge significa que el origen sirve los datos con menos frecuencia.

**El Desglose de Tom**

Después de categorizar cada línea:

**Datos de salida a internet**: 214 USD/mes

- Respuestas de API a clientes a nivel global
- Rellenos de caché de CloudFront (cuando las ubicaciones edge obtienen del origen)

**Procesamiento del NAT Gateway**: 289 USD/mes

- Servidores de aplicación llamando a API externas (procesador de pagos, servicio de correo electrónico, datos de mapas)
- Llamadas de DynamoDB pasando por el NAT Gateway (antes de configurar los endpoints de VPC para algunas tablas)

**Transferencia de datos entre AZ**: 178 USD/mes

- Del balanceador de carga a instancias EC2 (el balanceador de carga está en una AZ, algunas instancias en otra)
- Del servidor de aplicación a la réplica de lectura de RDS (en una AZ diferente)

**Transferencia de datos entre regiones**: 166 USD/mes

- Replicación de Aurora Global Database (primario en us-east-1, lector en us-west-2)
- Replicación entre regiones de S3 para respaldos

**NAT Gateway: La Mayor Sorpresa**

289 USD/mes en tarifas de procesamiento del NAT Gateway era el elemento más grande. Y en parte era innecesario.

En el capítulo 11, Tom había configurado endpoints de gateway de VPC para S3 y DynamoDB. Estos eran gratuitos. Pero había pasado por alto la configuración de endpoints de interfaz para varios otros servicios:

- Systems Manager (SSM) para la gestión de parches
- Secrets Manager para la recuperación de credenciales
- CloudWatch para el envío de métricas y registros
- SQS para el sondeo de mensajes

Cada llamada a estos servicios desde instancias EC2 privadas pasaba por el NAT Gateway. Cada llamada cobraba 0,045 USD/GB.

Los **endpoints de interfaz** para estos servicios: 0,01 USD/hora por AZ + 0,01 USD/GB de datos procesados.

Al volumen de Nimbus, el endpoint de interfaz de SSM costaría aproximadamente 15 USD/mes y ahorraría aproximadamente 43 USD/mes en cargos del NAT Gateway (porque SSM genera un volumen de datos significativo para la gestión de parches y las llamadas al almacén de parámetros).

Los costes y ahorros del endpoint variaban según el servicio y el volumen. Tom calculó que configurar endpoints de interfaz para los cuatro servicios de alto tráfico costaría 62 USD/mes en total y ahorraría aproximadamente 140 USD/mes en procesamiento del NAT Gateway.

Ahorro neto: 78 USD/mes solo con la configuración de endpoints.

**Tráfico entre AZ: Una Cuestión Arquitectónica**

Los 178 USD/mes en transferencia de datos entre AZ eran más complicados.

Parte de ello era inevitable: el balanceador de carga distribuye el tráfico entre AZ, por lo que algunas solicitudes se originan en una AZ y el balanceador de carga las reenvía a una instancia en otra AZ.

Parte era optimizable: la aplicación estaba configurada para escribir en la primaria de RDS (en us-east-1a) y leer de la réplica de lectura (en us-east-1b). Cada consulta de lectura cruzaba los límites de la AZ.

Para las lecturas, una solución: configurar la aplicación para que prefiera una réplica de lectura en la misma AZ que la instancia que realiza la solicitud. Cada AZ obtiene su propia réplica de lectura. El tráfico permanece local.

Compensación: más réplicas de lectura = más coste. Si el coste del tráfico entre AZ es de 50 USD/mes y una réplica de lectura adicional cuesta 190 USD/mes, la optimización local de AZ no merece la pena.

Tom calculó: a su volumen actual de consultas, el tráfico entre AZ era solo de 31 USD/mes del total de 178 USD. No valía la pena añadir réplicas por eso.

Los otros costes entre AZ eran el enrutamiento del balanceador de carga y la comunicación entre servicios, en gran medida inevitables al nivel de arquitectura actual.

"Este es uno de esos casos donde entender el coste no significa que debas corregirlo," dijo Tom.

"¿Cuánto costaría eliminar el tráfico entre AZ por completo?" preguntó Maya.

"Poner todo en una AZ derrota el propósito de Multi-AZ. Eso es un ahorro de 31 USD/mes al coste de perder alta disponibilidad."

"Entonces lo dejamos," dijo ella.

"Lo dejamos."

Esta es la conversación madura sobre costes: a veces pagas por algo porque la alternativa cuesta más en riesgo.

**CloudFront: El Descuento en Transferencia de Datos**

Aquí hay un hecho contraintuitivo: servir datos a través de CloudFront es generalmente más barato que servirlos directamente desde EC2 o S3.

**Directo de EC2 a internet**: 0,09 USD/GB
**CloudFront a internet**: 0,085 USD/GB (ligeramente más barato)

Pero el ahorro real no está en la tarifa por GB, sino en que CloudFront almacena datos en caché en las ubicaciones edge. Si 1.000 usuarios solicitan la misma foto del menú:

- **Sin CloudFront**: 1.000 solicitudes llegan al origen de S3 × tamaño de la foto × 0,09 USD/GB
- **Con CloudFront**: 1 solicitud llega a S3 (fallo de caché) + 999 solicitudes servidas desde la caché edge a tarifas de CloudFront

Para Nimbus con una tasa de aciertos de caché del 83% (del capítulo 13), estaban sirviendo el 83% de las solicitudes desde la caché edge. La transferencia de datos real del origen era del 17% del total de solicitudes: el 83% de su tráfico "de salida" estaba almacenado en caché en el edge.

"CloudFront no es solo una CDN para el rendimiento," dijo Tom. "También es una optimización de costes para la transferencia de datos."

Leo parecía pensativo. "Deberíamos mover toda la entrega de contenido estático a través de CloudFront, incluso para activos que no son sensibles a la latencia."

"Correcto. Si los usuarios lo están descargando desde AWS, debería pasar por CloudFront."

**S3 Select: Reduciendo la Transferencia de Datos en las Consultas**

Una optimización sutil: **S3 Select** te permite recuperar solo las filas y columnas que necesitas de un objeto S3 (CSV, JSON, Parquet), en lugar de descargar el archivo completo para filtrarlo en tu aplicación.

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

S3 Select reduce los datos transferidos de S3 a tu aplicación. Para archivos grandes con consultas selectivas, esto puede ser una reducción de 10 a 100 veces en el volumen de datos, y por tanto en el coste.

**La Optimización de Red Completa**

Después de tres semanas de análisis e implementación:

| Elemento de Coste                              | Antes    | Después  | Ahorro Mensual |
|------------------------------------------------|----------|----------|----------------|
| NAT Gateway (endpoints de interfaz)            | 289 USD  | 211 USD  | 78 USD         |
| Optimización de CloudFront (mover más activos) | 214 USD  | 147 USD  | 67 USD         |
| Tráfico entre AZ (aceptado tal cual)           | 178 USD  | 178 USD  | 0 USD          |
| Tráfico entre regiones (aceptado tal cual)     | 166 USD  | 166 USD  | 0 USD          |
| **Total**                                      | **847 USD** | **702 USD** | **145 USD/mes** |

145 USD/mes, 1.740 USD/año en ahorros de red. Modestos comparados con el cómputo y el almacenamiento, pero significativos.

Más importante: Tom ahora entendía cada línea de la factura de red. Podía explicar cada coste y había decidido conscientemente cuáles optimizar y cuáles aceptar.

## Ventajas y Limitaciones

**Costes del NAT Gateway**:

- Los grandes volúmenes de datos a través del NAT Gateway se acumulan rápidamente
- Los endpoints de VPC eliminan algunos costes de NAT por completo
- Revisa a qué servicios llaman tus instancias privadas y si hay endpoints disponibles

**CloudFront para el coste**:

- La tasa de aciertos de caché determina directamente los ahorros de costes
- Alta tasa de aciertos de caché = menor transferencia de origen + menor coste general de transferencia
- Mueve toda la entrega de activos estáticos a través de CloudFront

**Compensaciones entre AZ**:

- Eliminar el tráfico entre AZ normalmente requiere cambios arquitectónicos que cuestan más que los ahorros
- Calcula cuidadosamente antes de optimizar

**S3 Select**:

- Ahorros significativos para consultas selectivas en objetos grandes de S3
- No ayuda cuando necesitas el archivo completo

En el siguiente capítulo: el marco de seis pilares que hace las preguntas con las que debería comenzar toda revisión de arquitectura.

## Resumen

- AWS cobra por **datos de salida** (internet: ~0,09 USD/GB), **tráfico entre AZ** (0,01 USD/GB en cada dirección), **tráfico entre regiones** (0,02-0,08 USD/GB) y **procesamiento del NAT Gateway** (0,045 USD/GB).
- Los **datos de entrada** son gratuitos. El **tráfico en la misma AZ** es gratuito.
- Los **endpoints de gateway de VPC** (S3, DynamoDB): Gratuitos. Eliminan los costes del NAT Gateway para estos servicios.
- Los **endpoints de interfaz de VPC**: Precio por hora más por GB. Más baratos que el NAT Gateway para servicios de alto volumen.
- **CloudFront** sirve datos a tarifas más bajas que directo de EC2 a internet y reduce drásticamente el volumen de transferencia del origen mediante el almacenamiento en caché.
- **S3 Select** reduce la transferencia de datos desde S3 filtrando en el origen.
- Algunos costes de red son compensaciones arquitectónicas (entre AZ para alta disponibilidad): entiéndelos, no los elimines siempre.

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
- **PrivateLink (endpoints de interfaz de VPC)**: Proporciona conectividad privada a los servicios de AWS y a los servicios alojados por otros clientes de AWS. Más seguro que pasar por NAT, a menudo más barato para servicios de alto volumen.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre un endpoint de gateway de VPC y un endpoint de interfaz de VPC. ¿Para qué servicios de AWS está disponible cada uno, y cuál es el coste de cada uno?

*(Pista: Los endpoints de gateway son gratuitos pero solo para S3 y DynamoDB. Los endpoints de interfaz cuestan por hora pero funcionan para la mayoría de los demás servicios de AWS.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: La aplicación de una empresa se ejecuta en instancias EC2 en subredes privadas. Las instancias realizan llamadas frecuentes a la API de Amazon SQS y Amazon S3. Actualmente, todo el tráfico sale por un NAT Gateway. El equipo quiere reducir los costes del NAT Gateway. La seguridad de los datos debe mantenerse: ningún tráfico debe atravesar la internet pública.

¿Qué enfoque cumple MEJOR con estos requisitos con el menor coste continuo?

A) Crear un endpoint de gateway para SQS y un endpoint de gateway para S3  
B) Crear un endpoint de interfaz para SQS y un endpoint de gateway para S3  
C) Crear endpoints de interfaz tanto para SQS como para S3  
D) Eliminar el NAT Gateway y usar el Internet Gateway directamente para las llamadas a la API

**Pista 1**: Los endpoints de gateway solo están disponibles para S3 y DynamoDB.

**Pista 2**: Los endpoints de interfaz están disponibles para SQS y muchos otros servicios (pero cuestan dinero).

**Pista 3**: Un Internet Gateway en la tabla de rutas de la subred privada la convertiría en una subred pública, violando los requisitos de seguridad.

**Respuesta**: B

**Explicación**: S3 usa un endpoint de gateway (gratuito). SQS requiere un endpoint de interfaz (con precio). Esta combinación elimina los costes de procesamiento de datos del NAT Gateway para ambos servicios. Todo el tráfico permanece dentro de la red privada de AWS: sin traversal de internet pública.

**¿Por qué no A?** Los endpoints de gateway no están disponibles para SQS. Solo S3 y DynamoDB tienen endpoints de gateway.

**¿Por qué no C?** Aunque funciona, usar un endpoint de interfaz para S3 (en lugar del endpoint de gateway gratuito) incurre en cargos por hora innecesarios. Usa siempre el endpoint de gateway gratuito para S3 y DynamoDB.

**¿Por qué no D?** Añadir una ruta al Internet Gateway desde la subred privada la convierte en una subred pública. Las instancias EC2 en subredes privadas normalmente no tienen IPs elásticas, por lo que en realidad no podrían enrutar a través de un Internet Gateway sin cambios adicionales, y hacerlo las expondría al tráfico de internet entrante.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste — Tarea 4.4*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Los usuarios de la Costa Oeste de Nimbus generan un tráfico significativo. La aplicación les sirve desde us-east-1 (Virginia). Actualmente:

- Las respuestas de la API van directamente desde instancias EC2 de us-east-1 a usuarios de la Costa Oeste (~80 ms, 0,09 USD/GB)
- Las fotos del menú van desde S3 us-east-1 a través del edge de CloudFront en Seattle (~8 ms después del almacenamiento en caché)

El equipo está considerando añadir una segunda región de aplicación en us-west-2 (Oregón) para que los usuarios de la Costa Oeste reduzcan la latencia de la API.

Analiza los costes de transferencia de datos de este cambio. ¿Qué nuevos costes de transferencia de datos entre regiones incurriría la configuración de doble región? ¿El enrutamiento basado en latencia de Route 53 reduciría o aumentaría los costes totales de transferencia? ¿En qué condiciones (volumen de tráfico, sensibilidad a la latencia) compensaría la configuración de doble región?

*(No hay una única respuesta correcta. El objetivo es practicar el análisis de coste-beneficio multi-región.)*

## Escena Poscreditos

Tom cerró el análisis de red.

Impacto total del proyecto de optimización de tres meses:

- Savings Plans de EC2: -14.200 USD/año
- Almacenamiento (S3 + EBS): -6.200 USD/año
- Nivel de base de datos: -11.220 USD/año
- Red: -1.740 USD/año
- **Total: -33.360 USD/año**

Lo escribió en una pizarra en la sala de reuniones.

Leo lo miró fijamente. "Treinta y tres mil."

"Y pico," dijo Tom.

"Al año."

"Al año."

Priya hizo los cálculos. "Eso son 2.780 dólares al mes que estábamos gastando en cosas que no creaban valor."

"No todo," corrigió Tom. "Parte de ello eran cosas de las que obteníamos valor, pero pagando demasiado. Los Savings Plans: obteníamos exactamente la misma capacidad de EC2, solo a un mejor precio."

Maya se quedó de pie frente a la pizarra durante un buen rato.

"Cuando empezamos Nimbus," dijo, "cada dólar contaba. Apenas podíamos pagar la primera instancia EC2."

"Sí," dijo Tom.

"Y en algún momento del camino, dejamos de vigilar los dólares tan de cerca."

"El crecimiento hace eso," dijo Priya. "El foco se desplaza a construir, no a optimizar."

"Ambos importan," dijo Maya. "Ambos, siempre. Añade esto al wiki. Y establece una revisión trimestral de costes."

Tom ya estaba abriendo su calendario.

En los siguientes capítulos: hacemos zoom desde los servicios individuales y empezamos a pensar como arquitectos.
