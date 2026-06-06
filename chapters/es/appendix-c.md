# Apéndice C: Registro de Conceptos

Cada concepto clave introducido en el libro, mapeado a su capítulo, la analogía utilizada y el dominio del SAA-C03 donde aparece.

Úsalo como índice de estudio: si tienes dudas sobre un concepto antes del examen, encuéntralo aquí y vuelve a su capítulo para obtener contexto.

---

## A

**ACM (AWS Certificate Manager)** — Certificados TLS públicos gratuitos para ALB, CloudFront y API Gateway, con renovación automática mediante validación por DNS. Los certificados de CloudFront deben vivir en us-east-1. Capítulo 16. Dominio 1.

**ACU (Aurora Capacity Unit)** — La unidad de medida de la capacidad de Aurora Serverless v2. Escala automáticamente y, en las versiones de motor compatibles, puede pausarse automáticamente hasta 0 ACUs cuando no hay conexiones abiertas. Capítulo 24. Dominio 3.

**Alarma (CloudWatch)** — Una regla que se activa cuando una métrica cruza un umbral, disparando una notificación o una acción de escalado automático. Capítulo 7. Dominio 2.

**ALB (Application Load Balancer)** — Balanceador de carga de Capa 7 que enruta el tráfico HTTP/HTTPS según reglas de ruta y host. Capítulo 7. Dominio 2.

**AMI (Amazon Machine Image)** — Una plantilla que contiene el SO, el software y la configuración de una instancia de EC2. Capítulo 4. Dominio 3.

**Mentalidad de arquitecto** — Preguntar "¿qué se rompe primero, cómo lo sabemos y qué hace alguien a las 3 de la madrugada?" en lugar de solo "¿cómo funciona esto?". Capítulo 32, Capítulo 34. Transversal.

**Architecture Decision Record (ADR)** — Un documento breve que captura una decisión, sus alternativas, su justificación y qué causaría reconsiderarla. Capítulo 32. Transversal.

**Revisión de arquitectura** — Un proceso estructurado que cubre: restricciones → incógnitas → opciones → modos de fallo → monitoreo → runbooks. Capítulo 32. Transversal.

**Athena** — Servicio de consultas SQL sin servidor para datos en S3. Paga por TB escaneado. Funciona mejor con formatos columnares Parquet/ORC. Capítulo 26. Dominio 3.

**Auto Scaling Group (ASG)** — Un grupo de instancias de EC2 gestionadas en conjunto, que reemplaza automáticamente las instancias en mal estado y escala según la carga. Capítulo 7. Dominio 2, 3.

**Zona de Disponibilidad (AZ)** — Uno o más centros de datos físicamente separados dentro de una región, conectados por enlaces de baja latencia. Capítulo 2. Dominio 2.

---

## B

**AWS Backup** — Copias de seguridad centralizadas y basadas en políticas a través de EBS, RDS, DynamoDB, EFS y Storage Gateway. Admite copias entre regiones y entre cuentas. Capítulos 18, 23. Dominio 2.

**AWS Batch** — Cómputo por lotes gestionado para contenedores Docker. Compuesto por una definición de trabajo (qué ejecutar), una cola de trabajos (dónde esperan los trabajos) y un entorno de cómputo (EC2 o Fargate, bajo demanda o Spot). Para cargas de trabajo que exceden el límite de 15 minutos de Lambda. Capítulo 21. Dominio 3.

**Bucket (S3)** — Un contenedor para objetos de S3. Los buckets tienen nombres globales únicos y viven en una región específica. Capítulo 5. Dominio 3.

**Política de bucket** — Una política basada en recursos adjunta a un bucket de S3 que controla el acceso para los principales de IAM y las cuentas externas. Capítulo 5. Dominio 1.

---

## C

**Patrón cache-aside** — La aplicación verifica primero el caché; en caso de fallo, consulta la base de datos y luego almacena el resultado en el caché. Capítulo 10. Dominio 3.

**Tasa de aciertos de caché** — Porcentaje de solicitudes servidas desde el caché en lugar del origen. Más alto es mejor. Capítulo 13. Dominio 3.

**AWS Client VPN** — Endpoint de OpenVPN gestionado. Conecta dispositivos individuales (laptops, estaciones de trabajo) a una VPC a través de internet. Autenticación mediante Active Directory, federación SAML 2.0 con un proveedor de identidad o TLS mutuo. Admite modos split-tunnel y full-tunnel. Contraste con Site-to-Site VPN (red a red). Capítulo 11. Dominio 1.

**CloudFront** — El CDN de AWS. Almacena contenido en caché en más de 750 ubicaciones de borde en todo el mundo. Reduce la latencia y los costos de transferencia de datos desde el origen. Capítulo 13. Dominio 3, 4.

**CloudTrail** — Registra cada llamada a la API de AWS: quién, qué, cuándo, desde dónde. Almacenado en S3. Se usa para auditoría e investigación de incidentes. Dominio 1.

**CloudWatch** — Métricas, registros, alarmas y dashboards para recursos de AWS y aplicaciones personalizadas. Referenciado a lo largo del libro. Todos los dominios.

**Amazon Cognito** — Autenticación para los usuarios finales de tu aplicación: los User Pools son un directorio de usuarios gestionado (registro, inicio de sesión, MFA, inicio de sesión social, JWTs); los Identity Pools emiten credenciales temporales de AWS. IAM es para tus ingenieros; Cognito es para tus clientes. Capítulo 14. Dominio 1.

**Arranque en frío (Lambda)** — Retraso en la primera invocación (o tras inactividad) mientras Lambda inicializa el entorno de ejecución. Usa concurrencia aprovisionada para eliminarlo. Capítulo 20. Dominio 3.

**Compute Savings Plan** — Compromiso de un monto en dólares de gasto por hora en EC2, aplicable a cualquier tipo o tamaño de instancia. Capítulo 27. Dominio 4.

**Config (AWS)** — Rastrea los cambios de configuración de los recursos de AWS a lo largo del tiempo y evalúa el cumplimiento frente a reglas. Capítulo 31. Dominio 1.

**AWS Control Tower** — Automatiza el gobierno multicuenta: construye una landing zone (cuentas de gestión, archivo de registros y auditoría) con guardrails en minutos — la versión prefabricada de cablear Organizations, CloudTrail y Config a mano. Capítulo 14. Dominio 1.

**Transferencia de datos entre AZs** — Tráfico entre Zonas de Disponibilidad dentro de una región. Tarifado a $0.01/GB en cada dirección. Capítulo 30. Dominio 4.

**Replicación entre regiones** — Copiar datos (S3 CRR, Aurora Global, DynamoDB Global Tables) a una región diferente. Incurre en cargos de transferencia de datos. Capítulos 18, 23, 30. Dominio 2.

---

## D

**AWS DataSync** — Migración y sincronización basada en agentes de recursos compartidos de archivos (NFS/SMB) hacia S3, EFS o FSx. "rsync con esteroides, con una consola de AWS." Capítulo 25. Dominio 3.

**DAX (DynamoDB Accelerator)** — Caché en memoria específico para DynamoDB. Latencia de lectura en microsegundos. Capítulo 9. Dominio 3.

**Dead Letter Queue (DLQ)** — Una cola a la que se envían los mensajes que fallan en su procesamiento repetidamente, evitando el bloqueo de la cola. Capítulo 19. Dominio 2.

**AWS DMS (Database Migration Service)** — Migra bases de datos a AWS con un tiempo de inactividad mínimo. La carga completa (copia inicial) más CDC (Change Data Capture) mantiene el origen y el destino sincronizados durante la migración. Migraciones homogéneas (mismo tipo de motor): usa DMS directamente. Migraciones heterogéneas (distintos tipos de motor, p. ej. Oracle → Aurora PostgreSQL): usa primero SCT (Schema Conversion Tool), luego DMS. Capítulo 8. Dominio 3.

**Dedicated Host** — Un servidor físico de EC2 reservado exclusivamente para tu uso. Requerido para ciertas licencias de software. Capítulo 27. Dominio 4.

**Defensa en profundidad** — Superponer múltiples controles de seguridad (IAM + grupos de seguridad + NACLs + WAF + GuardDuty) para que el compromiso de una capa no exponga el sistema. Capítulo 33. Dominio 1.

**Direct Connect** — Una conexión de red privada dedicada desde una ubicación local hacia AWS. Más consistente que VPN. Capítulo 25. Dominio 3.

**DLQ** — Ver Dead Letter Queue.

**DynamoDB** — Base de datos NoSQL completamente gestionada con latencia de milisegundos de un solo dígito a cualquier escala. Modelo de clave-valor y documento. Capítulo 9. Dominio 3.

**DynamoDB Auto Scaling** — Ajusta automáticamente la capacidad de lectura/escritura aprovisionada según métricas de CloudWatch. Capítulo 29. Dominio 4.

**DynamoDB Streams** — Un registro de cambios ordenado en el tiempo de todos los cambios de elementos en una tabla de DynamoDB. Se usa con Lambda para procesamiento basado en eventos. Capítulo 9. Dominio 2.

---

## E

**EBS (Elastic Block Store)** — Almacenamiento en bloque adjunto a una sola instancia de EC2. Persiste independientemente. Tipos: gp3, io2, st1. Capítulo 6. Dominio 3.

**EC2 (Elastic Compute Cloud)** — Máquinas virtuales en la nube. Capítulo 4. Dominio 3.

**ECS (Elastic Container Service)** — Orquestación de contenedores gestionada. El tipo de lanzamiento Fargate elimina la gestión de servidores. Capítulo 21. Dominio 2, 3.

**EFS (Elastic File System)** — Sistema de archivos NFS compartido accesible desde múltiples instancias de EC2. Escala automáticamente. Las clases de almacenamiento incluyen Standard, Infrequent Access y Archive, con Intelligent-Tiering para el movimiento automático entre niveles. Capítulo 6. Dominio 3.

**EKS (Elastic Kubernetes Service)** — Plano de control de Kubernetes gestionado en AWS. Capítulo 21. Dominio 3.

**Elastic Disaster Recovery (DRS)** — Replicación continua a nivel de bloque de servidores (locales o EC2) en un área de preparación de bajo costo, con instancias de recuperación lanzadas en minutos — un pilot light gestionado. Capítulo 18. Dominio 2.

**ElastiCache** — Caché en memoria gestionado. Redis (características más ricas) o Memcached (más simple). Capítulo 10. Dominio 3.

**Elastic IP** — Una dirección IP pública estática que puedes asignar y reasociar con instancias de EC2. Capítulo 11. Dominio 3.

**Cifrado de sobre** — Un patrón en el que los datos se cifran con una clave de datos (DEK), y la DEK se cifra con una clave maestra (CMK en KMS). Capítulo 16. Dominio 1.

**EventBridge** — Bus de eventos para enrutar eventos desde servicios de AWS, socios SaaS y fuentes personalizadas hacia destinos. Admite reglas programadas. Capítulo 22. Dominio 2.

**Denegación explícita** — Una declaración de denegación de IAM que no puede ser anulada por ningún permiso. Tiene precedencia sobre todos los permisos. Capítulo 3. Dominio 1.

---

## F

**Enrutamiento de failover (Route 53)** — Enruta el tráfico a un endpoint secundario cuando el primario falla las verificaciones de estado. Capítulo 12. Dominio 2.

**Fargate** — Motor de cómputo sin servidor para ECS y EKS. Sin instancias de EC2 que gestionar. Capítulo 21. Dominio 3.

**Patrón de fan-out** — Un tema SNS entrega el mismo mensaje a múltiples colas SQS simultáneamente. Capítulo 19. Dominio 2.

**Cola FIFO (SQS)** — Procesamiento exactamente una vez, ordenamiento estricto. Menor rendimiento que las colas estándar. Capítulo 19. Dominio 2.

**Modo de fallo** — Una forma específica en que un sistema puede fallar. Identificar los modos de fallo antes de producción es el núcleo de la revisión de arquitectura. Capítulo 32. Transversal.

---

## G

**Gateway Endpoint** — Un tipo de VPC endpoint gratuito para S3 y DynamoDB. Enruta el tráfico a través de la red privada de AWS, eliminando los cargos del NAT Gateway. Capítulo 30. Dominio 4.

**Gateway Load Balancer (GWLB)** — Balanceador de carga de Capa 3 para insertar dispositivos de red virtuales de terceros (firewalls, IDS/IPS) en línea dentro de los flujos de tráfico. Capítulo 7. Dominio 1.

**Enrutamiento de geolocalización (Route 53)** — Enruta según la ubicación geográfica del origen de la consulta DNS. Capítulo 12. Dominio 3.

**Global Accelerator** — Enruta el tráfico hacia el borde de AWS más cercano vía Anycast, mejorando la latencia para aplicaciones dinámicas. Capítulo 25. Dominio 3.

**Glue (AWS)** — ETL sin servidor. Los Glue Crawlers descubren el esquema; los Glue Jobs transforman los datos; el Data Catalog almacena los metadatos. Capítulo 26. Dominio 3.

**GSI (Global Secondary Index)** — Un índice alternativo en una tabla de DynamoDB con una clave de partición diferente y una clave de ordenamiento opcional. Habilita patrones de consulta flexibles. Capítulo 9. Dominio 3.

**GuardDuty** — Servicio de detección de amenazas que usa ML sobre CloudTrail, VPC Flow Logs y registros de DNS para detectar actividad inusual. Capítulo 17. Dominio 1.

---

## H

**Verificación de estado (Route 53)** — Monitorea la disponibilidad del endpoint. Las verificaciones de estado fallidas activan el enrutamiento de failover. Capítulo 12. Dominio 2.

**Partición caliente (DynamoDB)** — Una partición que recibe tráfico desproporcionado porque muchas solicitudes comparten la misma clave de partición. Capítulo 9. Dominio 3.

---

## I

**IAM (Identity and Access Management)** — Controla la autenticación y autorización para las cuentas de AWS. Usuarios, grupos, roles, políticas. Capítulo 3, 14. Dominio 1.

**Rol de IAM** — Una identidad de IAM con credenciales temporales, asumida por servicios, usuarios u otras cuentas. Capítulo 3, 14. Dominio 1.

**Idempotencia** — La propiedad de una operación que produce el mismo resultado tanto si se llama una vez como muchas. Crítica para sistemas distribuidos (reembolsos, pagos, procesamiento de pedidos). Capítulo 32. Transversal.

**Clave de idempotencia** — Un identificador único para una operación, verificado antes de la ejecución para evitar el procesamiento duplicado. Capítulo 32. Transversal.

**Interface Endpoint (PrivateLink)** — Un VPC endpoint para la mayoría de los servicios de AWS. Tarifado por hora + por GB. Proporciona conectividad privada sin internet ni NAT. Capítulo 30. Dominio 4.

**Internet Gateway (IGW)** — Permite que las instancias en subredes públicas se comuniquen con internet. Requiere que la tabla de enrutamiento de la subred tenga una ruta hacia el IGW. Capítulo 11. Dominio 3.

**"Depende"** — La respuesta honesta a la mayoría de las preguntas de arquitectura, que siempre debe completarse: "Depende del patrón de acceso / la escala / la consecuencia del fallo / la restricción de costos." Capítulo 33. Transversal.

---

## K

**Kinesis Data Firehose** — Antiguo nombre de Amazon Data Firehose: entrega gestionada de datos en streaming a S3, Redshift, OpenSearch. Sin gestión de consumidores. Las preguntas más antiguas del examen aún pueden usar el nombre anterior. Capítulo 26. Dominio 3.

**Kinesis Data Streams** — Flujo de eventos ordenado en tiempo real. Durable, reproducible dentro de la ventana de retención (24 horas por defecto, hasta 365 días). Medido en shards. Capítulo 26. Dominio 3.

**KMS (Key Management Service)** — Crea, almacena y controla claves criptográficas para el cifrado en reposo. Capítulo 16. Dominio 1.

---

## L

**Lambda** — Funciones sin servidor activadas por eventos. Paga por invocación y por ms. Duración máxima de 15 minutos. Capítulo 20. Dominio 2, 3, 4.

**Lambda@Edge** — Funciones de Lambda que se ejecutan en las ubicaciones de borde de CloudFront, modificando solicitudes y respuestas. Capítulo 13. Dominio 3.

**AWS Lake Formation** — Capa centralizada de control de acceso para lagos de datos sobre S3 y el Glue Data Catalog. Proporciona permisos granulares a nivel de tabla, columna y fila. Simplifica la configuración segura de lagos de datos. Capítulo 26. Dominio 3.

**Enrutamiento basado en latencia (Route 53)** — Enruta las consultas DNS hacia la región de AWS con la menor latencia medida. Capítulo 12. Dominio 3.

**Plantilla de lanzamiento** — Una plantilla versionada que especifica la configuración de instancia de EC2 para los Auto Scaling Groups. Capítulo 7. Dominio 3.

**Mínimo privilegio** — Mejor práctica de IAM: otorga solo los permisos necesarios, no más. Capítulo 3. Dominio 1.

**Política de ciclo de vida (S3)** — Reglas que hacen la transición automática de objetos a clases de almacenamiento más baratas o los eliminan según su antigüedad. Capítulo 23. Dominio 4.

**LSI (Local Secondary Index)** — Un índice alternativo en una tabla de DynamoDB que usa la misma clave de partición pero una clave de ordenamiento diferente. Debe crearse en la creación de la tabla. Capítulo 9. Dominio 3.

---

## M

**Amazon Macie** — Descubrimiento basado en ML de datos sensibles (PII) en S3 y señalamiento de riesgos de exposición. GuardDuty observa el comportamiento; Macie audita lo que está almacenado. Capítulo 17. Dominio 1.

**Memcached** — Motor de caché en memoria simple y multihilo. Sin persistencia, sin estructuras de datos. Usa Redis a menos que necesites específicamente el multihilo a costa de las características. Capítulo 10. Dominio 3.

**Amazon MemoryDB for Redis** — Base de datos primaria en memoria, durable y compatible con Redis. A diferencia de ElastiCache, MemoryDB escribe en un registro de transacciones Multi-AZ, garantizando la durabilidad de los datos. Úsalo cuando se requiera compatibilidad con la API de Redis Y la pérdida de datos no sea aceptable. Capítulo 10. Dominio 3.

**MGN (AWS Application Migration Service)** — Realojamiento/lift-and-shift: replicación a nivel de bloque de servidores completos en AWS, lanzamientos de prueba y luego transición a instancias EC2 nativas. DataSync mueve archivos; DMS mueve bases de datos; MGN mueve servidores. Capítulo 25. Dominio 3.

**Amazon MQ** — Broker gestionado ActiveMQ/RabbitMQ que habla protocolos estándar (AMQP, MQTT, STOMP). Para lift-and-shift de cargas de trabajo de brokers existentes sin cambios de código; mensajería desde cero → SQS/SNS. Capítulo 19. Dominio 2.

**Multi-AZ (RDS)** — Réplica en espera sincrónica en una AZ diferente con failover automático. RPO ~0, RTO ~60 segundos. Para alta disponibilidad, no para escalado de lectura. Capítulo 8, 18. Dominio 2.

**Multi-Región** — Desplegar componentes de aplicación en múltiples regiones de AWS para redundancia geográfica y rendimiento global. Mayor complejidad y costo. Capítulo 18. Dominio 2.

---

## N

**Network Load Balancer (NLB)** — Balanceador de carga de Capa 4 (TCP/UDP/TLS): millones de solicitudes por segundo, IP estática por AZ, preserva la IP de origen. Sin conciencia de HTTP — ese es el trabajo del ALB. Capítulo 7. Dominio 3.

**NACL (Network Access Control List)** — Firewall sin estado a nivel de subred. Requiere reglas tanto de entrada como de salida. Las reglas se evalúan en orden numérico. Capítulo 15. Dominio 1.

**NAT Gateway** — Permite que las instancias en subredes privadas realicen conexiones salientes a internet. Cobra $0.045/GB procesado. Capítulo 11, 30. Dominio 4.

---

## O

**Objeto (S3)** — Un archivo almacenado en S3. Consta de clave (nombre), valor (datos) y metadatos. Tamaño máximo de 5 TB. Capítulo 5. Dominio 3.

**Capacidad bajo demanda (DynamoDB)** — Modo de pago por solicitud. Más caro por solicitud que el aprovisionado, pero sin necesidad de planificación de capacidad. Capítulo 29. Dominio 4.

**Instancias bajo demanda (EC2)** — Paga por hora sin compromiso. Máxima flexibilidad, máximo precio. Capítulo 27. Dominio 4.

**AWS Outposts** — Un rack de hardware de AWS completamente gestionado instalado en el propio centro de datos del cliente o instalación de co-ubicación. Ejecuta los mismos servicios, APIs y herramientas de AWS que la nube pública en las instalaciones. AWS gestiona la instalación y los parches; el cliente proporciona el espacio del rack y la energía. Para residencia de datos, cargas de trabajo locales de baja latencia o escenarios desconectados. Capítulo 2. Dominio 4.

---

## P

**Clave de partición (DynamoDB)** — El componente de clave primaria que determina qué partición almacena un elemento. Elige una clave de alta cardinalidad para una distribución uniforme. Capítulo 9. Dominio 3.

**Permission boundary** — Una política de IAM que establece los permisos máximos que puede tener una identidad de IAM, incluso si otras políticas otorgan más. Capítulo 14. Dominio 1.

**Grupo de colocación** — Controla la ubicación física de las instancias de EC2 para minimizar la latencia (cluster) o maximizar la disponibilidad (spread). Capítulo 4. Dominio 3.

**PrivateLink** — Servicio de AWS para crear endpoints privados hacia servicios alojados en AWS, accesibles vía Interface Endpoints. Capítulo 30. Dominio 1.

**Concurrencia aprovisionada (Lambda)** — Entornos de ejecución preinicializados que eliminan los retrasos de arranque en frío. Capítulo 20. Dominio 3.

**Capacidad aprovisionada (DynamoDB)** — Rendimiento de lectura y escritura preasignado, medido en unidades de capacidad por segundo. Más barato que bajo demanda para tráfico predecible. Capítulo 9, 29. Dominio 4.

---

## Q

**Amazon QuickSight** — Servicio gestionado de inteligencia de negocios y visualización de datos. Usa SPICE (Super-fast, Parallel, In-memory Calculation Engine) para almacenar datos en caché y renderizar dashboards rápidamente. Se conecta a Athena, S3, Redshift, RDS y otras fuentes de datos de AWS. Sin servidor de BI que gestionar. Capítulo 26. Dominio 3.

---

## R

**RDS (Relational Database Service)** — Base de datos relacional gestionada. Gestiona las copias de seguridad, los parches, el failover. Capítulo 8. Dominio 3.

**RDS Proxy** — Gestiona un pool de conexiones entre Lambda/la aplicación y RDS, evitando el agotamiento de conexiones. Capítulo 8. Dominio 3.

**Read Replica (RDS)** — Copia asincrónica de la base de datos para escalado de lectura. NO proporciona failover automático. Capítulo 8, 24. Dominio 3.

**Redis** — Almacén de estructuras de datos en memoria usado para almacenamiento en caché, gestión de sesiones, tablas de clasificación en tiempo real, pub/sub. Capítulo 10. Dominio 3.

**Reserved Instance (EC2)** — Un compromiso de usar un tipo de instancia específico en una región específica durante 1 o 3 años a cambio de un descuento. Capítulo 27. Dominio 4.

**Route 53** — Servicio de DNS y registrador de dominios de AWS. Admite múltiples políticas de enrutamiento. Capítulo 12. Dominio 2, 3.

**RPO (Recovery Point Objective)** — Máxima pérdida de datos aceptable medida en tiempo. "¿Cuántos datos podemos permitirnos perder?" Capítulo 18. Dominio 2.

**RTO (Recovery Time Objective)** — Máximo tiempo aceptable para restaurar el servicio tras un fallo. "¿Cuánto tiempo podemos estar caídos?" Capítulo 18. Dominio 2.

**Runbook** — Instrucciones paso a paso para operar un sistema, específicamente para la respuesta a incidentes. "¿Qué hace alguien a las 3 de la madrugada?" Capítulo 32. Transversal.

---

## S

**S3 Intelligent-Tiering** — Mueve automáticamente los objetos de S3 entre niveles de acceso según los patrones de acceso. Sin tarifa de recuperación. Capítulo 23. Dominio 4.

**S3 Select** — Recupera un subconjunto del contenido de un objeto de S3 usando expresiones SQL, reduciendo la transferencia de datos. Heredado: no disponible para nuevos clientes desde mediados de 2024 — Athena es ahora la vía principal para filtrar y consultar datos en S3. S3 Object Lambda, antaño la alternativa sugerida, es a su vez heredado (cerrado a nuevos clientes en noviembre de 2025; las cargas de trabajo existentes siguen funcionando). Capítulo 30. Dominio 4.

**Savings Plan** — Un modelo de precios flexible que compromete un monto en dólares de gasto por hora a cambio de un descuento. Más flexible que las Instancias Reservadas. Capítulo 27. Dominio 4.

**SCP (Service Control Policy)** — Política de AWS Organizations que restringe los permisos máximos disponibles para las cuentas en una OU. Capítulo 14. Dominio 1.

**Secrets Manager** — Almacena y rota automáticamente secretos (contraseñas de bases de datos, claves de API). Capítulo 16. Dominio 1.

**Grupo de seguridad** — Un firewall virtual con estado a nivel de instancia. Solo reglas de permiso; el tráfico de retorno es automático. Capítulo 15. Dominio 1.

**Shard (Kinesis)** — La unidad base de rendimiento en Kinesis Data Streams: 1 MB/s de escritura, 2 MB/s de lectura. Capítulo 26. Dominio 3.

**Modelo de Responsabilidad Compartida** — AWS es responsable de la seguridad *de* la nube (infraestructura); tú eres responsable de la seguridad *en* la nube (datos, configuración, acceso). Capítulo 1. Dominio 1.

**Shield** — Protección contra DDoS. Standard: gratuito, automático. Advanced: de pago, con soporte del DRT y protección financiera. Capítulo 17. Dominio 1.

**Snow Family** — Dispositivos físicos para transferencia masiva de datos sin conexión (Snowball Edge: 80 TB) — fletar un vuelo de carga en lugar de conducir por la carretera. Heredado (2026): Snowmobile y Snowcone descontinuados; los dispositivos Snow cerrados a nuevos clientes en noviembre de 2025 (AWS apunta a DataSync y a las Data Transfer Terminals), pero el examen SAA-C03 todavía espera Snowball para "semanas de transferencia, ancho de banda limitado." Capítulo 25. Dominio 3.

**SNS (Simple Notification Service)** — Mensajería pub/sub. Empuja mensajes a todos los suscriptores simultáneamente. Patrón de fan-out. Capítulo 19. Dominio 2.

**Clave de ordenamiento (DynamoDB)** — Segundo componente opcional de la clave primaria. Habilita consultas de rango dentro de una partición. Capítulo 9. Dominio 3.

**Instancias Spot** — Instancias de EC2 que usan capacidad sobrante con un descuento del 60-90%. Pueden interrumpirse con un aviso de 2 minutos. Solo para cargas de trabajo tolerantes a fallos. Capítulo 27. Dominio 4.

**SQS (Simple Queue Service)** — Cola de mensajes gestionada. Desacopla a los productores de los consumidores. Colas estándar (al menos una vez) y FIFO (exactamente una vez). Capítulo 19. Dominio 2.

**Step Functions** — Servicio de orquestación de flujos de trabajo sin servidor. Máquinas de estados para coordinar servicios de AWS. Capítulo 22. Dominio 2.

**AWS Storage Gateway** — El puente entre el almacenamiento local y el de la nube: presenta interfaces NFS/SMB (File), iSCSI (Volume) o cinta virtual (Tape) localmente, mientras persiste los datos en S3, Glacier o instantáneas de EBS. Capítulo 6. Dominio 3.

---

## T

**Escalado por seguimiento de objetivo** — Política de Auto Scaling que ajusta la capacidad para mantener un valor de métrica objetivo (p. ej., 60% de uso de CPU). Capítulo 7. Dominio 2.

**AWS Transfer Family** — Endpoint gestionado SFTP/FTPS/FTP respaldado por S3 o EFS. Los socios conservan sus clientes SFTP existentes; los archivos aterrizan directamente en tu bucket. Capítulo 25. Dominio 3.

**Transit Gateway** — Topología de red en estrella que conecta múltiples VPCs y redes locales a través de un gateway central. Capítulo 25. Dominio 3.

**TTL (Time to Live)** — Una marca de tiempo después de la cual DynamoDB elimina automáticamente un elemento. También se usa en DNS (cuánto tiempo los resolutores almacenan en caché un registro) y en el almacenamiento en caché (cuánto tiempo es válido un valor en caché). Capítulos 9, 12. Dominio 3.

---

## V

**VIF (Virtual Interface)** — La conexión lógica usada con AWS Direct Connect. La VIF pública accede a los endpoints públicos de AWS; la VIF privada accede a los recursos de la VPC. Capítulo 25. Dominio 3.

**Tiempo de espera de visibilidad (SQS)** — El período durante el cual un mensaje recibido se oculta de otros consumidores. Permite el procesamiento sin que otros consumidores vean el mismo mensaje. Capítulo 19. Dominio 2.

**VPC (Virtual Private Cloud)** — Una red virtual aislada en AWS. Contiene subredes, tablas de enrutamiento y gateways. Capítulo 11. Dominio 1.

**VPC Endpoint** — Conecta los recursos de la VPC con los servicios de AWS a través de la red privada de AWS. Gateway (gratis, S3/DynamoDB) e Interface (tarifado, la mayoría de los demás servicios). Capítulo 30. Dominio 1, 4.

**VPC Flow Logs** — Captura información sobre el tráfico IP que entra y sale de las interfaces de red en una VPC. Usado por GuardDuty y para la resolución de problemas de red. Capítulo 17. Dominio 1.

**VPC Peering** — Una conexión de red entre dos VPCs que permite que el tráfico se enrute entre ellas usando direcciones IP privadas. Capítulo 11. Dominio 3.

---

## W

**WAF (Web Application Firewall)** — Filtra el tráfico HTTP/HTTPS usando reglas (bloqueos de IP, inyección SQL, límites de tasa). Se adjunta a CloudFront, ALB o API Gateway. Capítulo 17. Dominio 1.

**AWS Wavelength** — Infraestructura de AWS desplegada dentro de las redes de los proveedores de telecomunicaciones 5G en el borde de radio. Permite una latencia de un solo dígito de milisegundos hacia los dispositivos móviles. Para AR/VR móvil, juegos en tiempo real, telemetría de vehículos autónomos y video en vivo en el borde 5G. Las Wavelength Zones son extensiones de las Regiones de AWS dentro de las redes de telecomunicaciones. Capítulo 2. Dominio 3.

**Well-Architected Framework** — El marco de evaluación de seis pilares de AWS: Excelencia Operativa, Seguridad, Fiabilidad, Eficiencia del Rendimiento, Optimización de Costos, Sostenibilidad. Capítulo 31. Transversal.

**Enrutamiento ponderado (Route 53)** — Distribuye las consultas DNS entre endpoints según un peso. Usado para despliegues blue-green y pruebas A/B. Capítulo 12. Dominio 3.

**Almacenamiento en caché write-through** — Actualiza el caché cada vez que se actualiza la base de datos. Los datos siempre son consistentes, pero el caché puede contener muchos elementos que nunca se vuelven a leer. Capítulo 10. Dominio 3.

---

## Referencia Rápida de Patrones del SAA-C03

| Si el examen dice...                          | Piensa en...                                 |
|-----------------------------------------------|----------------------------------------------|
| "Desacoplar servicios"                        | SQS, SNS, EventBridge                        |
| "Fan-out a múltiples consumidores"            | SNS + suscripciones SQS                      |
| "Eventos ordenados en tiempo real"            | Kinesis Data Streams                         |
| "Sin servidor"                                | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Baja latencia global (dinámico)"             | Global Accelerator                           |
| "Baja latencia global (estático/en caché)"    | CloudFront                                   |
| "Protección contra DDoS"                      | Shield (Standard: gratis; Advanced: de pago) |
| "Bloquear inyección SQL en el borde"          | WAF                                          |
| "Detectar credenciales comprometidas"         | GuardDuty                                    |
| "Auditar actividad de la API"                 | CloudTrail                                   |
| "Rotar credenciales de base de datos"         | Secrets Manager                              |
| "Cifrar datos en reposo, claves administradas por el cliente" | KMS con CMK                   |
| "Almacenar valores de configuración"          | SSM Parameter Store                          |
| "Almacenamiento de base de datos de alto IOPS"| io2 EBS                                      |
| "Sistema de archivos compartido para EC2"     | EFS                                          |
| "Consultar datos de S3 con SQL"               | Athena                                       |
| "Pipeline ETL para analítica"                 | AWS Glue                                     |
| "Entregar datos en streaming a S3"            | Amazon Data Firehose                         |
| "Trabajos por lotes tolerantes a fallos, minimizar costo" | Instancias Spot                  |
| "Carga de trabajo de producción comprometida y estable" | Savings Plans                      |
| "Subred privada → S3 sin NAT"                 | S3 Gateway Endpoint                          |
| "Subred privada → SQS sin NAT"                | SQS Interface Endpoint                       |
| "Multi-AZ para RDS"                           | Failover automático (no escalado de lectura) |
| "Read Replica para RDS"                       | Escalado de lectura (no failover automático) |
| "Tiempo de recuperación de 1–2 minutos, entre AZs" | Multi-AZ (failover de RDS: 60–120 segundos) |
| "Recuperación entre regiones, RTO en minutos" | Pilot Light o Warm Standby                   |
| "Activo-Activo, RTO cero"                     | Multi-Región Activo-Activo (lo más complejo) |
| "Procesamiento por lotes más allá del tiempo límite de Lambda" | AWS Batch                   |
| "Compatible con Redis Y durable"              | MemoryDB for Redis                           |
| "Ingenieros remotos acceden a la VPC desde casa" | Client VPN                                |
| "Migrar base de datos con tiempo de inactividad mínimo" | DMS (+ SCT para heterogénea)        |
| "Dashboard de BI en AWS"                      | QuickSight                                   |
| "Ejecutar AWS en tu propio centro de datos"   | Outposts                                     |
| "Cómputo en el borde móvil 5G"                | Wavelength                                   |
