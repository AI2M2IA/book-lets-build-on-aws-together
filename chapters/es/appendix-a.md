# Apéndice A: Referencia Rápida de Servicios de AWS

Cada servicio cubierto en este libro, en el orden en que fue introducido. Úsalo como referencia de estudio y consulta rápida durante la preparación para el examen.

---

## Cómputo

**EC2 — Elastic Compute Cloud** *(Capítulo 4)*

Máquinas virtuales en la nube. Eliges el tipo de instancia (CPU, memoria, almacenamiento), el sistema operativo y la región. Pagas por hora (bajo demanda), por compromiso (Instancias Reservadas / Savings Plans) o por franja de capacidad de reserva (Spot). La primitiva de cómputo fundamental.

Conceptos clave: AMI (Amazon Machine Image), tipos de instancia (familias t3, m6g, r6g, c6g), pares de claves, perfiles de instancia, grupos de colocación.

Señal del examen: Cuando un escenario requiere cómputo persistente, con estado o de larga duración → EC2 o ECS. Cuando requiere cómputo de corta duración, activado por eventos o con costo cero de inactividad → Lambda.

---

**Auto Scaling + Application Load Balancer** *(Capítulo 7)*

Los Auto Scaling Groups (ASGs) agregan y eliminan instancias de EC2 en función de la carga. Los Application Load Balancers (ALBs) distribuyen el tráfico entre instancias y enrutan por ruta o host. Juntos forman la capa de escalado horizontal.

Conceptos clave: Plantilla de lanzamiento, políticas de escalado (seguimiento de objetivo, paso, programado), verificaciones de estado, grupos de destino de ALB, reglas de escucha, enrutamiento ponderado.

Señal del examen: "Manejar carga variable" o "alta disponibilidad en AZs" → ASG + ALB.

---

**Lambda** *(Capítulo 20)*

Funciones sin servidor. Escribes el código; AWS lo ejecuta en respuesta a eventos. Sin servidores que gestionar. Pagas por invocación y por milisegundo de ejecución. Escala automáticamente a miles de ejecuciones concurrentes.

Conceptos clave: Fuentes de eventos (API Gateway, S3, SQS, EventBridge, Kinesis), rol de ejecución, límites de concurrencia, concurrencia reservada y aprovisionada, arranque en frío, Capas, duración máxima de 15 minutos.

Señal del examen: "Sin servidor", "basado en eventos", "tareas de corta duración", "sin costo de inactividad" → Lambda.

---

**ECS — Elastic Container Service** *(Capítulo 21)*

Ejecuta contenedores Docker en AWS. Dos tipos de lanzamiento: EC2 (tú gestionas el host) y Fargate (AWS gestiona el host). ECS gestiona las definiciones de tareas, los servicios, la programación del clúster y la integración con balanceadores de carga y la descubierta de servicios.

Conceptos clave: Definición de tarea, servicio ECS, tipo de lanzamiento Fargate vs EC2, ECR (registro de contenedores), rol de IAM de tarea, escalado automático de servicios.

Señal del examen: "Cargas de trabajo en contenedores", "microservicios", "Docker en AWS" → ECS (generalmente Fargate para contenedores sin servidor).

---

**EKS — Elastic Kubernetes Service** *(Capítulo 21)*

Kubernetes gestionado. AWS ejecuta el plano de control; tú ejecutas los nodos trabajadores (EC2 o Fargate). Usa EKS cuando tu equipo ya usa Kubernetes o tiene cargas de trabajo que requieren características específicas de Kubernetes.

Señal del examen: "Kubernetes", "necesidad de migrar cargas de trabajo K8s existentes" → EKS. "Solo necesito contenedores sin la sobrecarga de K8s" → ECS.

---

## Almacenamiento

**S3 — Simple Storage Service** *(Capítulo 5)*

Almacenamiento de objetos. Capacidad ilimitada, durabilidad del 99.999999999% (once nueves). Almacena archivos como objetos en buckets. Los buckets viven en una región. Los objetos pueden variar de 0 bytes a 5 TB.

Conceptos clave: Política de bucket, ACL de objeto, versionado, alojamiento de sitios web estáticos, URL prefirmadas, carga multiparte, Transfer Acceleration, clases de almacenamiento (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Señal del examen: "Almacenar y recuperar archivos", "activos estáticos", "copias de seguridad", "lago de datos" → S3. La clase de almacenamiento correcta depende de la frecuencia de acceso y la velocidad de recuperación.

---

**EBS — Elastic Block Store** *(Capítulo 6)*

Almacenamiento en bloque adjunto a una sola instancia de EC2. Actúa como un disco duro. Persiste independientemente del ciclo de vida de la instancia (puedes desconectarlo y volver a conectarlo). Los tipos más comunes: gp3 (SSD de propósito general, el predeterminado), io2 (IOPS aprovisionado para bases de datos), st1 (HDD optimizado para rendimiento para lecturas secuenciales).

Conceptos clave: Instantáneas (incrementales, almacenadas en S3), cifrado (KMS), adjunto múltiple (solo io1/io2), aprovisionamiento de IOPS y rendimiento.

Señal del examen: "Almacenamiento persistente para EC2", "almacenamiento de bases de datos", "requiere acceso en bloque de baja latencia" → EBS.

---

**EFS — Elastic File System** *(Capítulo 6)*

Sistema de archivos compartido, accesible desde múltiples instancias de EC2 simultáneamente. Protocolo NFS. Escala automáticamente. Más caro que EBS por GB. Dos clases de almacenamiento: Standard e Infrequent Access. Intelligent-Tiering mueve los archivos automáticamente.

Señal del examen: "Sistema de archivos compartido", "múltiples instancias de EC2 necesitan los mismos archivos", "NFS" → EFS.

---

**Clases de Almacenamiento de S3 y Políticas de Ciclo de Vida** *(Capítulo 23)*

S3 Intelligent-Tiering mueve automáticamente los objetos entre niveles de acceso según la frecuencia de acceso. Las políticas de ciclo de vida hacen la transición de objetos entre clases (Standard → Standard-IA → Glacier) según reglas de antigüedad. Las clases de almacenamiento Glacier tienen un retraso de recuperación que va de minutos (Glacier Instant) a 12 horas (Glacier Deep Archive).

Señal del examen: "Reducir costos de almacenamiento para datos de acceso infrecuente" → políticas de ciclo de vida, Intelligent-Tiering o Glacier.

---

## Bases de Datos

**RDS — Relational Database Service** *(Capítulo 8)*

Bases de datos relacionales gestionadas. Motores compatibles: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server y Aurora (el motor propio de AWS). AWS gestiona las copias de seguridad, los parches, el failover y la replicación. Tú gestionas el diseño del esquema, las consultas y el dimensionamiento de las instancias.

Conceptos clave: Despliegue Multi-AZ (failover automático, replicación sincrónica), Réplicas de Lectura (asincrónicas, para escalado de lectura), copias de seguridad automatizadas (retención de 1 a 35 días), instantáneas manuales (conservadas hasta su eliminación), RDS Proxy (agrupación de conexiones).

Señal del examen: "Base de datos relacional", "transacciones ACID", "carga de trabajo SQL existente" → RDS o Aurora.

---

**Aurora** *(Capítulo 24)*

El motor de base de datos relacional de AWS, compatible con MySQL y PostgreSQL. Motor de almacenamiento distribuido que replica datos en 3 AZs en 6 copias. Típicamente 5 veces más rápido que MySQL. Aurora Serverless v2 escala la capacidad automáticamente (medida en ACUs: Aurora Capacity Units).

Conceptos clave: Clúster de Aurora (escritor + hasta 15 endpoints de lectura), Aurora Global Database (réplicas de lectura entre regiones con menos de 1 segundo de retraso de replicación), Aurora Serverless v2.

Señal del examen: "Base de datos relacional de alto rendimiento", "compatible con MySQL/PostgreSQL", "lecturas globales", "carga de trabajo variable" → Aurora.

---

**DynamoDB** *(Capítulo 9)*

Base de datos NoSQL completamente gestionada. Modelo de clave-valor y documento. Escala a cualquier rendimiento con rendimiento de milisegundos de un solo dígito. Dos modos de capacidad: bajo demanda (paga por solicitud) y aprovisionado (paga por unidad de capacidad por hora, con Auto Scaling).

Conceptos clave: Clave de partición (obligatoria), clave de clasificación (opcional), Índice Secundario Global (GSI), Índice Secundario Local (LSI), DynamoDB Streams (captura de datos de cambios), DynamoDB Accelerator (DAX): caché en memoria, TTL (Time to Live), transacciones.

Señal del examen: "Acceso basado en clave de alto rendimiento", "esquema flexible", "NoSQL sin servidor" → DynamoDB.

---

**ElastiCache** *(Capítulo 10)*

Almacenamiento en caché en memoria gestionado. Dos motores: Redis (persistente, pub/sub, scripting Lua, estructuras de datos) y Memcached (caché puro, más simple, multinúcleo). Úsalo para reducir la carga de la base de datos y servir datos leídos con frecuencia en microsegundos.

Conceptos clave: Patrón cache-aside, patrón write-through, políticas de evicción, TTL, modo clúster (Redis), Multi-AZ con failover automático.

Señal del examen: "Reducir la carga de la base de datos", "latencia de lectura submilisegundo", "gestión de sesiones", "ranking en tiempo real" → ElastiCache Redis.

---

## Redes

**VPC — Virtual Private Cloud** *(Capítulo 11)*

Una red aislada dentro de AWS. Abarca todas las AZs en una región. Defines el espacio de direcciones IP (bloque CIDR), creas subredes (públicas o privadas), configuras tablas de rutas y controlas el acceso a través de grupos de seguridad y NACLs.

Conceptos clave: Subred pública (ruta a Internet Gateway), subred privada (ruta a NAT Gateway para salida), Internet Gateway (entrada + salida a internet), NAT Gateway (solo salida para instancias privadas), VPC Peering (conectar dos VPCs), VPC Endpoints (conectarse a servicios de AWS sin internet).

Señal del examen: "Red privada en AWS", "aislar recursos de internet", "controlar el tráfico de red" → VPC.

---

**Grupos de Seguridad y NACLs** *(Capítulo 15)*

Los grupos de seguridad son cortafuegos stateful a nivel de instancia: solo reglas de permitir, el tráfico de retorno es automático. Las NACLs (Listas de Control de Acceso de Red) son cortafuegos stateless a nivel de subred: requieren reglas de entrada y salida, evaluadas en orden por número de regla.

Señal del examen: "Bloquear una IP específica para que no acceda a la subred" → NACL. "Controlar el tráfico hacia/desde una instancia" → grupo de seguridad.

---

**Route 53** *(Capítulo 12)*

El servicio DNS y registrador de dominios de AWS. Enruta el tráfico de internet hacia recursos de AWS y endpoints externos. Políticas de enrutamiento: Simple, Ponderado, Basado en Latencia, Failover, Geolocalización, Geoproximidad, Respuesta de múltiples valores.

Conceptos clave: Zonas alojadas (públicas y privadas), tipos de registro (A, AAAA, CNAME, Alias), verificaciones de estado, Traffic Flow (editor visual de políticas).

Señal del examen: "Enrutamiento DNS", "failover entre regiones", "enrutar según latencia o ubicación" → Route 53 con la política de enrutamiento adecuada.

---

**CloudFront** *(Capítulo 13)*

Red de Distribución de Contenido (CDN). Almacena en caché el contenido en ubicaciones de borde (más de 400 en todo el mundo). Reduce la latencia para los usuarios finales. Reduce los costos de transferencia del origen mediante el almacenamiento en caché. Se integra con S3, EC2, ALB y API Gateway como orígenes.

Conceptos clave: Distribución, orígenes, comportamientos (enrutamiento basado en rutas a orígenes), TTL (control de caché), invalidación de caché, URL firmadas y cookies (control de acceso), Lambda@Edge y CloudFront Functions (ejecutar código en el borde), Origin Shield (reducir la carga del origen).

Señal del examen: "Baja latencia global", "almacenar en caché contenido estático", "reducir la carga del origen", "proteger contra DDoS con Shield" → CloudFront.

---

**Direct Connect y VPN** *(Capítulo 25)*

AWS Direct Connect es una conexión de red física dedicada desde tu centro de datos en instalaciones propias hasta AWS. Evita el internet público. Ancho de banda y latencia más consistentes. AWS Site-to-Site VPN es un túnel cifrado sobre el internet público: más rápido de configurar, menor costo, pero rendimiento variable.

Conceptos clave: Interfaz Virtual (VIF), Direct Connect Gateway (conectarse a múltiples regiones), Transit Gateway (topología de red en forma de hub-y-radio), redundancia de túnel VPN.

Señal del examen: "Conexión privada dedicada a AWS" → Direct Connect. "Conexión cifrada, configuración más rápida" → VPN. "Conectar múltiples VPCs" → Transit Gateway.

---

**VPC Endpoints** *(Capítulo 30)*

Conecta recursos privados a servicios de AWS sin usar el internet público ni NAT Gateway. Endpoints de puerta de enlace: gratuitos, disponibles solo para S3 y DynamoDB. Endpoints de interfaz (PrivateLink): precio por hora + por GB, disponibles para la mayoría de los servicios de AWS.

Señal del examen: "EC2 en subred privada llama a S3/DynamoDB: reducir costos de NAT Gateway" → Endpoint de puerta de enlace (gratuito). "Conexión privada a SQS, SSM, Secrets Manager desde subred privada" → Endpoint de interfaz.

---

## Seguridad e Identidad

**IAM — Identity and Access Management** *(Capítulos 3 y 14)*

Controla quién puede hacer qué en tu cuenta de AWS. Usuarios (credenciales de largo plazo), Grupos (usuarios que comparten permisos), Roles (credenciales temporales para servicios y acceso entre cuentas), Políticas (documentos JSON que definen reglas de permitir/denegar).

Conceptos clave: Principal, Acción, Recurso, Condición, denegación explícita > permiso explícito > denegación implícita, SCP (Política de Control de Servicios en AWS Organizations), límite de permisos, AssumeRole.

Señal del examen: IAM está involucrado en cada pregunta de seguridad. Patrón clave: los servicios usan roles de IAM (no usuarios). El acceso entre cuentas usa la asunción de roles. Privilegio mínimo: otorga solo lo necesario.

---

**KMS — Key Management Service** *(Capítulo 16)*

Servicio de claves de cifrado gestionado. Crea, almacena y controla las claves criptográficas. Las claves administradas por el cliente (CMKs) te permiten definir la rotación, el uso y las políticas de acceso. Las claves administradas por AWS se gestionan automáticamente.

Conceptos clave: Política de clave (independiente de la política de IAM), cifrado de sobre (datos cifrados con una clave de datos; clave de datos cifrada con CMK), rotación automática de claves, claves multi-región, concesiones.

Señal del examen: "Cifrar datos en reposo", "claves de cifrado administradas por el cliente", "rotación de claves" → KMS.

---

**Secrets Manager** *(Capítulo 16)*

Almacena y rota automáticamente valores sensibles: credenciales de bases de datos, claves de API, tokens OAuth. Se integra con RDS para la rotación automática de contraseñas. Las aplicaciones recuperan los secretos en tiempo de ejecución a través de la API: nunca codifiques las credenciales.

Señal del examen: "Almacenar y rotar credenciales de bases de datos", "evitar secretos codificados" → Secrets Manager. "Almacenar valores de configuración, no secretos" → Parameter Store (SSM).

---

**AWS Shield** *(Capítulo 17)*

Protección DDoS. Shield Standard es automático y gratuito: protege contra los ataques volumétricos y de protocolo más comunes. Shield Advanced añade protección financiera, equipo de respuesta DDoS las 24 horas y visibilidad detallada de los ataques.

Señal del examen: "Proteger contra DDoS" → Shield Standard (automático) o Shield Advanced (empresarial, con SLA).

---

**WAF — Web Application Firewall** *(Capítulo 17)*

Filtra el tráfico HTTP/HTTPS según reglas: bloqueos de IP, límites de velocidad, patrones de inyección SQL, patrones XSS, restricciones geográficas, reglas personalizadas. Se adjunta a CloudFront, ALB, API Gateway o AppSync.

Señal del examen: "Bloquear direcciones IP específicas", "prevenir la inyección SQL en el borde", "limitar la velocidad de las llamadas a la API" → WAF.

---

**GuardDuty** *(Capítulo 17)*

Servicio de detección de amenazas. Analiza los registros de CloudTrail, VPC Flow Logs y los registros DNS usando ML e inteligencia de amenazas. Detecta actividad inusual de API, comunicación con IPs maliciosas conocidas, credenciales comprometidas.

Señal del examen: "Detectar actividad inusual", "identificar credenciales de IAM comprometidas", "monitoreo continuo de amenazas" → GuardDuty.

---

## Mensajería y Procesamiento de Eventos

**SQS — Simple Queue Service** *(Capítulo 19)*

Cola de mensajes gestionada. Los productores envían mensajes; los consumidores los leen y eliminan. Desacopla los servicios: el remitente no necesita saber si el receptor está disponible. Colas estándar: entrega al menos una vez, orden de mejor esfuerzo. Colas FIFO: procesamiento exactamente una vez, orden estricto.

Conceptos clave: Tiempo de espera de visibilidad (mensaje oculto para otros consumidores mientras se procesa), Cola de Mensajes Fallidos (DLQ) para mensajes que fallan repetidamente, Retención de mensajes (4 días predeterminado, hasta 14), Sondeo largo (reduce respuestas vacías).

Señal del examen: "Desacoplar servicios", "amortiguar solicitudes durante picos de carga", "procesamiento asincrónico" → SQS. "El orden importa y se requiere exactamente una vez" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Capítulo 19)*

Servicio pub/sub gestionado. Los publicadores envían un mensaje a un tema; todos los suscriptores reciben una copia. Patrón de distribución en abanico: un mensaje → muchos consumidores. Protocolos: SQS, Lambda, HTTP/HTTPS, correo electrónico, SMS, push móvil.

Conceptos clave: Tema, suscripción, patrón de distribución en abanico (SNS → múltiples colas de SQS), filtrado de mensajes (los suscriptores reciben solo los mensajes coincidentes).

Señal del examen: "Enviar notificaciones a múltiples endpoints simultáneamente", "distribuir en abanico un único evento a múltiples consumidores" → SNS. Patrón común: SNS + SQS para distribución durable.

---

**EventBridge** *(Capítulo 22)*

Bus de eventos para construir arquitecturas basadas en eventos. Enruta eventos de servicios de AWS, socios SaaS y fuentes personalizadas hacia Lambda, SQS, SNS, Step Functions y otros destinos. Admite reglas programadas (cron) y coincidencia de patrones.

Señal del examen: "Enrutar eventos de servicios de AWS hacia destinos", "programar funciones de Lambda", "orquestación basada en eventos" → EventBridge.

---

**Step Functions** *(Capítulo 22)*

Orquestación de flujos de trabajo sin servidor. Coordina funciones de Lambda, tareas de ECS, DynamoDB, SNS, SQS y otros servicios en máquinas de estado visuales. Gestiona reintentos, manejo de errores, ramas paralelas y estados de espera.

Conceptos clave: Máquina de estado, tipos de estado (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Flujos de Trabajo Estándar (exactamente una vez, de larga duración) vs Flujos de Trabajo Express (al menos una vez, alto volumen).

Señal del examen: "Orquestar múltiples funciones de Lambda", "flujos de trabajo de larga duración con lógica de reintentos", "pasos de aprobación humana" → Step Functions.

---

**Kinesis** *(Capítulo 26)*

Transmisión de datos en tiempo real. Kinesis Data Streams: flujo duradero y ordenado de registros (como un registro de confirmación distribuido). Los consumidores procesan los registros; los datos se retienen de 24 horas a 7 días. Kinesis Data Firehose: entrega completamente gestionada a S3, Redshift, OpenSearch, Splunk: sin gestión de consumidores.

Conceptos clave: Shard (unidad de rendimiento: 1 MB/s de escritura, 2 MB/s de lectura), clave de partición (determina la asignación de shard), número de secuencia, checkpointing (KCL o Lambda), Firehose vs Streams.

Señal del examen: "Transmisión en tiempo real", "registros ordenados", "reproducir eventos" → Kinesis Data Streams. "Entregar datos de transmisión a S3/Redshift sin gestionar consumidores" → Kinesis Firehose. Contraste con SQS: Kinesis retiene y reproduce; SQS elimina al consumir.

---

## Análisis

**Athena** *(Capítulo 26)*

Consultas SQL sin servidor sobre datos almacenados en S3. Sin infraestructura que gestionar. Pago por consulta (por TB escaneado). Mejor con formatos en columnas (Parquet, ORC) y datos particionados.

Señal del examen: "Consultar datos de S3 con SQL", "análisis ad hoc en lago de datos", "sin gestión de infraestructura" → Athena.

---

**Glue** *(Capítulo 26)*

Servicio ETL (Extracción, Transformación, Carga) sin servidor. Los Glue Crawlers descubren datos y actualizan el Glue Data Catalog. Los Glue Jobs ejecutan transformaciones con Spark o Python. El Data Catalog se integra con Athena, Redshift Spectrum y EMR.

Señal del examen: "Transformar y cargar datos para análisis", "descubrir esquema de datos de S3", "pipeline ETL" → Glue.

---

## Alta Disponibilidad y Recuperación ante Desastres

**Multi-AZ y Multi-Región** *(Capítulo 18)*

Multi-AZ: replicación sincrónica dentro de una región para failover automático (RDS Multi-AZ, balanceador de carga en AZs). RPO ~0, RTO ~60s para RDS. Multi-Región: replicación asincrónica para redundancia geográfica y menor latencia para usuarios globales.

Conceptos clave: RTO (Recovery Time Objective: cuánto tardar en recuperarse), RPO (Recovery Point Objective: cuántos datos pueden perderse). Estrategias de DR: Luz Piloto, Standby en Caliente, Activo-Activo.

Señal del examen: Distingue entre fallos a nivel de AZ (Multi-AZ los gestiona) vs fallos regionales (Multi-Región los gestiona). El costo y la complejidad aumentan significativamente con Multi-Región.

---

## Optimización de Costos

**Modelos de Precios de EC2** *(Capítulo 27)*

Bajo Demanda: precio completo, sin compromiso. Instancias Reservadas (1 o 3 años): descuento del 30-72% para un tipo de instancia específico. Savings Plans (Compute o EC2 Instance): gasto horario comprometido por flexibilidad. Spot: 60-90% de descuento para cargas de trabajo interrumpibles.

Señal del examen: "Minimizar costos para carga de trabajo predecible" → Savings Plans o Instancias Reservadas. "Procesamiento por lotes tolerante a fallos" → Spot. "Impredecible o a corto plazo" → Bajo Demanda.

---

**Precios de Transferencia de Datos** *(Capítulo 30)*

Entrada a AWS: gratuita. Misma AZ: gratuita. Entre AZs: $0,01/GB en cada dirección. Entre regiones: $0,02-0,08/GB. Internet (salida): ~$0,09/GB. Procesamiento de NAT Gateway: $0,045/GB. La transferencia de datos de CloudFront es más barata que la de EC2 directo a internet, y el almacenamiento en caché reduce el volumen total.

Señal del examen: "Reducir costos de transferencia de datos para S3/DynamoDB desde subred privada" → Endpoints de puerta de enlace (gratuitos). "Reducir costos de NAT Gateway para otros servicios" → Endpoints de interfaz.

---

## Observabilidad

**CloudWatch** *(referenciado a lo largo del libro)*

Monitoreo y observabilidad. CloudWatch Metrics: datos de series temporales numéricas de servicios de AWS y aplicaciones personalizadas. CloudWatch Logs: recopilar, buscar y analizar datos de registros. CloudWatch Alarms: activar notificaciones o escalado automático según umbrales de métricas. CloudWatch Dashboards: visualizar métricas.

Conceptos clave: Dimensiones de métricas, períodos de retención, grupos de registros y flujos de registros, filtros de métricas, CloudWatch Agent (para métricas a nivel de SO y registros de EC2), Container Insights.

---

**CloudTrail** *(referenciado a lo largo del libro)*

Registra cada llamada a la API realizada en tu cuenta de AWS: quién la hizo, desde dónde, cuándo y cuál fue la respuesta. El trail multi-región almacena registros en S3 indefinidamente. Usado para auditoría de seguridad, cumplimiento e investigación de incidentes.

Señal del examen: "¿Quién eliminó ese recurso?" "Auditar toda la actividad de la API" → CloudTrail.

---

**AWS Config** *(referenciado en el Capítulo 31)*

Rastrea los cambios de configuración de los recursos de AWS a lo largo del tiempo. Evalúa los recursos según las reglas de cumplimiento. Registra el historial de cada cambio de configuración para cada recurso. Se integra con Systems Manager para la remediación.

Señal del examen: "¿Cumple este recurso con nuestra política de seguridad?" "¿Cómo era la configuración de este recurso la semana pasada?" → AWS Config.

---

## Well-Architected

**Los Seis Pilares** *(Capítulo 31)*

| Pilar                          | Pregunta central                            | Servicios clave                                         |
|--------------------------------|---------------------------------------------|---------------------------------------------------------|
| Excelencia Operativa           | ¿Estamos funcionando bien?                  | CloudWatch, CloudTrail, SSM, Config                     |
| Seguridad                      | ¿Estamos protegidos?                        | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager       |
| Fiabilidad                     | ¿Nos recuperamos de los fallos?             | Multi-AZ, failover de Route 53, respaldo/restauración, SQS |
| Eficiencia de Rendimiento      | ¿Estamos usando los recursos adecuados?     | Ajuste de tamaño, Auto Scaling, CloudFront, Kinesis     |
| Optimización de Costos         | ¿Estamos gastando sabiamente?               | Savings Plans, Spot, ciclo de vida de S3, VPC Endpoints |
| Sostenibilidad                 | ¿Estamos minimizando el impacto ambiental?  | Ajuste de tamaño, Graviton, niveles de almacenamiento eficientes |

AWS Well-Architected Tool: evalúa tu arquitectura según los seis pilares. Úsalo antes del examen para entender el razonamiento detrás de las preguntas de cada pilar.
