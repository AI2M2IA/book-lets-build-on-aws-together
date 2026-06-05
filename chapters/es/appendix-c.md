# Apéndice C: Registro de Conceptos

Cada concepto clave introducido en el libro, mapeado a su capítulo, la analogía utilizada y el dominio del SAA-C03 donde aparece.

Úsalo como índice de estudio: si tienes dudas sobre un concepto antes del examen, encuéntralo aquí y vuelve a su capítulo para el contexto.

---

## A

**ACU (Aurora Capacity Unit)** — La unidad de medida para la capacidad de Aurora Serverless v2. Escala automáticamente. Capítulo 24. Dominio 3.

**Alarma (CloudWatch)** — Una regla que se activa cuando una métrica supera un umbral, desencadenando una notificación o una acción de escalado automático. Capítulo 7. Dominio 2.

**ALB (Application Load Balancer)** — Balanceador de carga de capa 7 que enruta el tráfico HTTP/HTTPS según reglas de ruta y host. Capítulo 7. Dominio 2.

**AMI (Amazon Machine Image)** — Una plantilla que contiene el SO, el software y la configuración de una instancia de EC2. Capítulo 4. Dominio 3.

**Mentalidad de arquitecto** — Preguntar "¿qué falla primero, cómo lo sabemos y qué hace alguien a las 3 AM?" en lugar de solo "¿cómo funciona esto?" Capítulo 32, Capítulo 34. Transversal.

**Registro de Decisiones de Arquitectura (ADR)** — Un documento corto que captura una decisión, sus alternativas, su justificación y qué causaría la reconsideración. Capítulo 32. Transversal.

**Revisión de arquitectura** — Un proceso estructurado que cubre: restricciones → incógnitas → opciones → modos de fallo → monitoreo → runbooks. Capítulo 32. Transversal.

**Athena** — Servicio de consultas SQL sin servidor para datos en S3. Pago por TB escaneado. Mejor con formatos en columnas Parquet/ORC. Capítulo 26. Dominio 3.

**Auto Scaling Group (ASG)** — Un grupo de instancias de EC2 gestionadas conjuntamente, que reemplaza automáticamente las instancias no saludables y escala según la carga. Capítulo 7. Dominios 2, 3.

**Zona de Disponibilidad (AZ)** — Uno o más centros de datos físicamente separados dentro de una región, conectados por enlaces de baja latencia. Capítulo 2. Dominio 2.

---

## B

**Bucket (S3)** — Un contenedor para los objetos de S3. Los buckets tienen nombres únicos globales y viven en una región específica. Capítulo 5. Dominio 3.

**Política de bucket** — Una política basada en recursos adjunta a un bucket de S3 que controla el acceso para los principales de IAM y las cuentas externas. Capítulo 5. Dominio 1.

---

## C

**Patrón cache-aside** — La aplicación comprueba primero el caché; ante un miss, consulta la base de datos y luego almacena el resultado en caché. Capítulo 10. Dominio 3.

**Tasa de cache hit** — Porcentaje de solicitudes servidas desde el caché en lugar del origen. Cuanto mayor, mejor. Capítulo 13. Dominio 3.

**CloudFront** — CDN de AWS. Almacena en caché el contenido en más de 400 ubicaciones de borde en todo el mundo. Reduce la latencia y los costos de transferencia de datos del origen. Capítulo 13. Dominios 3, 4.

**CloudTrail** — Registra cada llamada a la API de AWS: quién, qué, cuándo, desde dónde. Almacenado en S3. Usado para auditoría e investigación de incidentes. Dominio 1.

**CloudWatch** — Métricas, registros, alarmas y paneles para los recursos de AWS y las aplicaciones personalizadas. Referenciado a lo largo del libro. Todos los dominios.

**Arranque en frío (Lambda)** — Retraso en la primera invocación (o tras inactividad) mientras Lambda inicializa el entorno de ejecución. Usa la concurrencia aprovisionada para eliminarlo. Capítulo 20. Dominio 3.

**Compute Savings Plan** — Compromiso de un importe en dólares del gasto horario en EC2, aplicable a cualquier tipo o tamaño de instancia. Capítulo 27. Dominio 4.

**Config (AWS)** — Rastrea los cambios de configuración de los recursos de AWS a lo largo del tiempo y evalúa el cumplimiento según las reglas. Capítulo 31. Dominio 1.

**Transferencia de datos entre AZs** — Tráfico entre Zonas de Disponibilidad dentro de una región. Se cobra a $0,01/GB en cada dirección. Capítulo 30. Dominio 4.

**Replicación entre regiones** — Copiar datos (S3 CRR, Aurora Global, DynamoDB Global Tables) a una región diferente. Incurre en cargos de transferencia de datos. Capítulos 18, 30. Dominio 2.

---

## D

**DAX (DynamoDB Accelerator)** — Caché en memoria específico para DynamoDB. Latencia de lectura en microsegundos. Capítulo 9. Dominio 3.

**Cola de Mensajes Fallidos (DLQ)** — Una cola donde se envían los mensajes que fallan el procesamiento repetidamente, evitando el bloqueo de la cola. Capítulo 19. Dominio 2.

**Host Dedicado** — Un servidor físico de EC2 reservado exclusivamente para tu uso. Requerido para ciertas licencias de software. Capítulo 27. Dominio 4.

**Defensa en profundidad** — Apilar múltiples controles de seguridad (IAM + grupos de seguridad + NACLs + WAF + GuardDuty) de modo que el compromiso de una capa no exponga el sistema. Capítulo 33. Dominio 1.

**Direct Connect** — Una conexión de red física privada dedicada desde una ubicación en instalaciones propias hasta AWS. Más consistente que VPN. Capítulo 25. Dominio 3.

**DLQ** — Ver Cola de Mensajes Fallidos.

**DynamoDB** — Base de datos NoSQL completamente gestionada con latencia de milisegundos de un solo dígito a cualquier escala. Modelo de clave-valor y documento. Capítulo 9. Dominio 3.

**DynamoDB Auto Scaling** — Ajusta automáticamente la capacidad de lectura/escritura aprovisionada en función de las métricas de CloudWatch. Capítulo 29. Dominio 4.

**DynamoDB Streams** — Un registro cronológicamente ordenado de todos los cambios de elementos en una tabla de DynamoDB. Usado con Lambda para el procesamiento basado en eventos. Capítulo 9. Dominio 2.

---

## E

**EBS (Elastic Block Store)** — Almacenamiento en bloque adjunto a una sola instancia de EC2. Persiste de forma independiente. Tipos: gp3, io2, st1. Capítulo 6. Dominio 3.

**EC2 (Elastic Compute Cloud)** — Máquinas virtuales en la nube. Capítulo 4. Dominio 3.

**ECS (Elastic Container Service)** — Orquestación de contenedores gestionada. El tipo de lanzamiento Fargate elimina la gestión de servidores. Capítulo 21. Dominios 2, 3.

**EFS (Elastic File System)** — Sistema de archivos NFS compartido accesible desde múltiples instancias de EC2. Escala automáticamente. Capítulo 6. Dominio 3.

**EKS (Elastic Kubernetes Service)** — Plano de control de Kubernetes gestionado en AWS. Capítulo 21. Dominio 3.

**ElastiCache** — Almacenamiento en caché en memoria gestionado. Redis (características más ricas) o Memcached (más simple). Capítulo 10. Dominio 3.

**IP Elástica** — Una dirección IP pública estática que puedes asignar y reasociar a instancias de EC2. Capítulo 11. Dominio 3.

**Cifrado de sobre** — Un patrón en el que los datos se cifran con una clave de datos (DEK), y la DEK se cifra con una clave maestra (CMK en KMS). Capítulo 16. Dominio 1.

**EventBridge** — Bus de eventos para enrutar eventos de servicios de AWS, socios SaaS y fuentes personalizadas hacia destinos. Admite reglas programadas. Capítulo 22. Dominio 2.

**Denegación explícita** — Una declaración de denegación de IAM que no puede ser anulada por ningún permiso. Tiene prioridad sobre todos los permisos. Capítulo 3. Dominio 1.

---

## F

**Enrutamiento de failover (Route 53)** — Enruta el tráfico a un endpoint secundario cuando el primario falla las verificaciones de estado. Capítulo 12. Dominio 2.

**Fargate** — Motor de cómputo sin servidor para ECS y EKS. Sin instancias de EC2 que gestionar. Capítulo 21. Dominio 3.

**Patrón de distribución en abanico** — Un tema de SNS entrega el mismo mensaje a múltiples colas de SQS simultáneamente. Capítulo 19. Dominio 2.

**Cola FIFO (SQS)** — Procesamiento exactamente una vez, orden estricto. Menor rendimiento que las colas estándar. Capítulo 19. Dominio 2.

**Modo de fallo** — Una forma específica en que puede fallar un sistema. Identificar los modos de fallo antes de la producción es el núcleo de la revisión de arquitectura. Capítulo 32. Transversal.

---

## G

**Endpoint de puerta de enlace** — Un tipo de VPC endpoint gratuito para S3 y DynamoDB. Enruta el tráfico a través de la red privada de AWS, eliminando los cargos de NAT Gateway. Capítulo 30. Dominio 4.

**Enrutamiento de geolocalización (Route 53)** — Enruta según la ubicación geográfica del origen de la consulta DNS. Capítulo 12. Dominio 3.

**Global Accelerator** — Enruta el tráfico al borde de AWS más cercano a través de Anycast, mejorando la latencia para las aplicaciones dinámicas. Capítulo 25. Dominio 3.

**Glue (AWS)** — ETL sin servidor. Los Glue Crawlers descubren el esquema; los Glue Jobs transforman los datos; el Data Catalog almacena los metadatos. Capítulo 26. Dominio 3.

**GSI (Global Secondary Index)** — Un índice alternativo en una tabla de DynamoDB con una clave de partición diferente y una clave de clasificación opcional. Permite patrones de consulta flexibles. Capítulo 9. Dominio 3.

**GuardDuty** — Servicio de detección de amenazas que utiliza ML en CloudTrail, VPC Flow Logs y registros DNS para detectar actividad inusual. Capítulo 17. Dominio 1.

---

## H

**Verificación de estado (Route 53)** — Monitorea la disponibilidad del endpoint. Las verificaciones de estado fallidas activan el enrutamiento de failover. Capítulo 12. Dominio 2.

**Partición caliente (DynamoDB)** — Una partición que recibe tráfico desproporcionado porque muchas solicitudes comparten la misma clave de partición. Capítulo 9. Dominio 3.

---

## I

**IAM (Identity and Access Management)** — Controla la autenticación y la autorización para las cuentas de AWS. Usuarios, grupos, roles, políticas. Capítulos 3, 14. Dominio 1.

**Rol de IAM** — Una identidad de IAM con credenciales temporales, asumida por servicios, usuarios u otras cuentas. Capítulos 3, 14. Dominio 1.

**Idempotencia** — La propiedad de una operación que produce el mismo resultado tanto si se llama una vez como varias veces. Crítica para los sistemas distribuidos (reembolsos, pagos, procesamiento de pedidos). Capítulo 32. Transversal.

**Clave de idempotencia** — Un identificador único para una operación, comprobado antes de la ejecución para evitar el procesamiento duplicado. Capítulo 32. Transversal.

**Endpoint de interfaz (PrivateLink)** — Un VPC endpoint para la mayoría de los servicios de AWS. Precio por hora + por GB. Proporciona conectividad privada sin internet ni NAT. Capítulo 30. Dominio 4.

**Internet Gateway (IGW)** — Permite que las instancias en subredes públicas se comuniquen con internet. Requiere que la tabla de rutas de la subred tenga una ruta al IGW. Capítulo 11. Dominio 3.

**"Depende"** — La respuesta honesta a la mayoría de las preguntas de arquitectura, que siempre debe completarse: "Depende del patrón de acceso / escala / consecuencia del fallo / restricción de costo." Capítulo 33. Transversal.

---

## K

**Kinesis Data Firehose** — Entrega gestionada de datos de transmisión a S3, Redshift, OpenSearch. Sin gestión de consumidores. Capítulo 26. Dominio 3.

**Kinesis Data Streams** — Flujo de eventos en tiempo real y ordenado. Duradero, reproducible. Medido en shards. Capítulo 26. Dominio 3.

**KMS (Key Management Service)** — Crea, almacena y controla las claves criptográficas para el cifrado en reposo. Capítulo 16. Dominio 1.

---

## L

**Lambda** — Funciones sin servidor activadas por eventos. Pago por invocación y por ms. Duración máxima de 15 minutos. Capítulo 20. Dominios 2, 3, 4.

**Lambda@Edge** — Funciones de Lambda que se ejecutan en las ubicaciones de borde de CloudFront, modificando solicitudes y respuestas. Capítulo 13. Dominio 3.

**Enrutamiento basado en latencia (Route 53)** — Enruta las consultas DNS a la región de AWS con la latencia medida más baja. Capítulo 12. Dominio 3.

**Plantilla de lanzamiento** — Una plantilla versionada que especifica la configuración de instancias de EC2 para los Auto Scaling Groups. Capítulo 7. Dominio 3.

**Privilegio mínimo** — Mejor práctica de IAM: otorgar solo los permisos necesarios, nada más. Capítulo 3. Dominio 1.

**Política de ciclo de vida (S3)** — Reglas que hacen la transición automática de los objetos a clases de almacenamiento más económicas o los eliminan según su antigüedad. Capítulo 23. Dominio 4.

**LSI (Local Secondary Index)** — Un índice alternativo en una tabla de DynamoDB que usa la misma clave de partición pero una clave de clasificación diferente. Debe crearse al crear la tabla. Capítulo 9. Dominio 3.

---

## M

**Memcached** — Motor de almacenamiento en caché en memoria simple y multinúcleo. Sin persistencia, sin estructuras de datos. Usa Redis a menos que necesites específicamente multinúcleo a costa de las características. Capítulo 10. Dominio 3.

**Multi-AZ (RDS)** — Réplica standby sincrónica en una AZ diferente con failover automático. RPO ~0, RTO ~60 segundos. Para alta disponibilidad, no para escalado de lectura. Capítulos 8, 18. Dominio 2.

**Multi-Región** — Despliegue de componentes de la aplicación en múltiples regiones de AWS para redundancia geográfica y rendimiento global. Mayor complejidad y costo. Capítulo 18. Dominio 2.

---

## N

**NACL (Network Access Control List)** — Cortafuegos stateless a nivel de subred. Requiere reglas de entrada y salida. Las reglas se evalúan en orden numérico. Capítulo 15. Dominio 1.

**NAT Gateway** — Permite que las instancias en subredes privadas realicen conexiones salientes a internet. Cobra $0,045/GB procesado. Capítulos 11, 30. Dominio 4.

---

## O

**Objeto (S3)** — Un archivo almacenado en S3. Consiste en una clave (nombre), un valor (datos) y metadatos. Tamaño máximo de 5 TB. Capítulo 5. Dominio 3.

**Capacidad bajo demanda (DynamoDB)** — Modo de pago por solicitud. Más caro por solicitud que el aprovisionado, pero sin necesidad de planificación de capacidad. Capítulo 29. Dominio 4.

**Instancias bajo demanda (EC2)** — Pago por hora sin compromiso. Máxima flexibilidad, precio máximo. Capítulo 27. Dominio 4.

---

## P

**Clave de partición (DynamoDB)** — El componente de clave primaria que determina qué partición almacena un elemento. Elige una clave de alta cardinalidad para una distribución uniforme. Capítulo 9. Dominio 3.

**Límite de permisos** — Una política de IAM que establece los permisos máximos que puede tener una identidad de IAM, aunque otras políticas otorguen más. Capítulo 14. Dominio 1.

**Grupo de colocación** — Controla la colocación física de las instancias de EC2 para minimizar la latencia (clúster) o maximizar la disponibilidad (distribuido). Capítulo 4. Dominio 3.

**PrivateLink** — Servicio de AWS para crear endpoints privados a servicios alojados en AWS, accesibles a través de Endpoints de interfaz. Capítulo 30. Dominio 1.

**Concurrencia aprovisionada (Lambda)** — Entornos de ejecución pre-inicializados que eliminan los retrasos de arranque en frío. Capítulo 20. Dominio 3.

**Capacidad aprovisionada (DynamoDB)** — Rendimiento de lectura y escritura pre-asignado, medido en unidades de capacidad por segundo. Más barato que bajo demanda para tráfico predecible. Capítulos 9, 29. Dominio 4.

---

## R

**RDS (Relational Database Service)** — Base de datos relacional gestionada. Gestiona las copias de seguridad, los parches y el failover. Capítulo 8. Dominio 3.

**RDS Proxy** — Gestiona un pool de conexiones entre Lambda/aplicación y RDS, evitando el agotamiento de conexiones. Capítulo 8. Dominio 3.

**Réplica de Lectura (RDS)** — Copia asincrónica de la base de datos para el escalado de lectura. NO proporciona failover automático. Capítulos 8, 24. Dominio 3.

**Redis** — Almacén de estructuras de datos en memoria usado para almacenamiento en caché, gestión de sesiones, rankings en tiempo real, pub/sub. Capítulo 10. Dominio 3.

**Instancia Reservada (EC2)** — Un compromiso de usar un tipo de instancia específico en una región específica durante 1 o 3 años a cambio de un descuento. Capítulo 27. Dominio 4.

**Route 53** — Servicio DNS y registrador de dominios de AWS. Admite múltiples políticas de enrutamiento. Capítulo 12. Dominios 2, 3.

**RPO (Recovery Point Objective)** — Pérdida máxima aceptable de datos medida en tiempo. "¿Cuántos datos podemos permitirnos perder?" Capítulo 18. Dominio 2.

**RTO (Recovery Time Objective)** — Tiempo máximo aceptable para restaurar el servicio después de un fallo. "¿Cuánto tiempo podemos estar caídos?" Capítulo 18. Dominio 2.

**Runbook** — Instrucciones paso a paso para operar un sistema, específicamente para la respuesta a incidentes. "¿Qué hace alguien a las 3 AM?" Capítulo 32. Transversal.

---

## S

**S3 Intelligent-Tiering** — Mueve automáticamente los objetos de S3 entre niveles de acceso según los patrones de acceso. Sin tarifa de recuperación. Capítulo 23. Dominio 4.

**S3 Select** — Recupera un subconjunto del contenido de un objeto de S3 usando expresiones SQL, reduciendo la transferencia de datos. Capítulo 30. Dominio 4.

**Savings Plan** — Un modelo de precios flexible que se compromete a un importe en dólares del gasto horario a cambio de un descuento. Más flexible que las Instancias Reservadas. Capítulo 27. Dominio 4.

**SCP (Service Control Policy)** — Política de AWS Organizations que restringe los permisos máximos disponibles para las cuentas de una OU. Capítulo 14. Dominio 1.

**Secrets Manager** — Almacena y rota automáticamente los secretos (contraseñas de bases de datos, claves de API). Capítulo 16. Dominio 1.

**Grupo de seguridad** — Un cortafuegos virtual stateful a nivel de instancia. Solo reglas de permitir; el tráfico de retorno es automático. Capítulo 15. Dominio 1.

**Shard (Kinesis)** — La unidad base de rendimiento en Kinesis Data Streams: 1 MB/s de escritura, 2 MB/s de lectura. Capítulo 26. Dominio 3.

**Modelo de Responsabilidad Compartida** — AWS es responsable de la seguridad *de* la nube (infraestructura); tú eres responsable de la seguridad *en* la nube (datos, configuración, acceso). Capítulo 1. Dominio 1.

**Shield** — Protección DDoS. Standard: gratuito, automático. Advanced: de pago, con soporte DRT y protección financiera. Capítulo 17. Dominio 1.

**SNS (Simple Notification Service)** — Mensajería pub/sub. Envía mensajes a todos los suscriptores simultáneamente. Patrón de distribución en abanico. Capítulo 19. Dominio 2.

**Clave de clasificación (DynamoDB)** — Segundo componente opcional de la clave primaria. Permite consultas de rango dentro de una partición. Capítulo 9. Dominio 3.

**Instancias Spot** — Instancias de EC2 que usan capacidad de reserva con un descuento del 60-90%. Pueden ser interrumpidas con 2 minutos de aviso. Solo para cargas de trabajo tolerantes a fallos. Capítulo 27. Dominio 4.

**SQS (Simple Queue Service)** — Cola de mensajes gestionada. Desacopla productores de consumidores. Colas Standard (al menos una vez) y FIFO (exactamente una vez). Capítulo 19. Dominio 2.

**Step Functions** — Servicio de orquestación de flujos de trabajo sin servidor. Máquinas de estado para coordinar servicios de AWS. Capítulo 22. Dominio 2.

---

## T

**Escalado de seguimiento de objetivo** — Política de Auto Scaling que ajusta la capacidad para mantener un valor de métrica objetivo (por ejemplo, 60% de utilización de CPU). Capítulo 7. Dominio 2.

**Transit Gateway** — Topología de red en forma de hub-y-radio que conecta múltiples VPCs y redes en instalaciones propias a través de una puerta de enlace central. Capítulo 25. Dominio 3.

**TTL (Time to Live)** — Una marca de tiempo después de la cual DynamoDB elimina automáticamente un elemento. También se usa en DNS (cuánto tiempo los resolvers almacenan en caché un registro) y en almacenamiento en caché (cuánto tiempo es válido un valor en caché). Capítulos 9, 12. Dominio 3.

---

## V

**VIF (Virtual Interface)** — La conexión lógica usada con AWS Direct Connect. La VIF pública accede a los endpoints públicos de AWS; la VIF privada accede a los recursos de VPC. Capítulo 25. Dominio 3.

**Tiempo de espera de visibilidad (SQS)** — El período durante el cual un mensaje recibido está oculto para otros consumidores. Permite el procesamiento sin que otros consumidores vean el mismo mensaje. Capítulo 19. Dominio 2.

**VPC (Virtual Private Cloud)** — Una red virtual aislada en AWS. Contiene subredes, tablas de rutas y puertas de enlace. Capítulo 11. Dominio 1.

**VPC Endpoint** — Conecta los recursos de la VPC a los servicios de AWS a través de la red privada de AWS. Puerta de enlace (gratuita, S3/DynamoDB) e Interfaz (con precio, la mayoría de los otros servicios). Capítulo 30. Dominios 1, 4.

**VPC Flow Logs** — Captura información sobre el tráfico IP que va hacia y desde las interfaces de red de una VPC. Usado por GuardDuty y para la resolución de problemas de red. Capítulo 17. Dominio 1.

**VPC Peering** — Una conexión de red entre dos VPCs que permite enrutar el tráfico entre ellas usando direcciones IP privadas. Capítulo 11. Dominio 3.

---

## W

**WAF (Web Application Firewall)** — Filtra el tráfico HTTP/HTTPS usando reglas (bloqueos de IP, inyección SQL, límites de velocidad). Se adjunta a CloudFront, ALB o API Gateway. Capítulo 17. Dominio 1.

**Well-Architected Framework** — El marco de evaluación de seis pilares de AWS: Excelencia Operativa, Seguridad, Fiabilidad, Eficiencia de Rendimiento, Optimización de Costos, Sostenibilidad. Capítulo 31. Transversal.

**Enrutamiento ponderado (Route 53)** — Distribuye las consultas DNS entre endpoints por peso. Usado para despliegues azul-verde y pruebas A/B. Capítulo 12. Dominio 3.

**Almacenamiento en caché write-through** — Actualiza el caché cada vez que se actualiza la base de datos. Los datos siempre son consistentes, pero el caché puede contener muchos elementos que nunca se vuelven a leer. Capítulo 10. Dominio 3.

---

## Referencia Rápida de Patrones del SAA-C03

| Si el examen dice...                             | Piensa en...                                         |
|--------------------------------------------------|------------------------------------------------------|
| "Desacoplar servicios"                           | SQS, SNS, EventBridge                                |
| "Distribución en abanico a múltiples consumidores" | SNS + suscripciones de SQS                         |
| "Eventos ordenados en tiempo real"               | Kinesis Data Streams                                 |
| "Sin servidor"                                   | Lambda, DynamoDB, Aurora Serverless, Fargate         |
| "Baja latencia global (dinámico)"                | Global Accelerator                                   |
| "Baja latencia global (estático/caché)"          | CloudFront                                           |
| "Protección DDoS"                                | Shield (Standard: gratuito; Advanced: de pago)       |
| "Bloquear inyección SQL en el borde"             | WAF                                                  |
| "Detectar credenciales comprometidas"            | GuardDuty                                            |
| "Auditar la actividad de la API"                 | CloudTrail                                           |
| "Rotar credenciales de bases de datos"           | Secrets Manager                                      |
| "Cifrar datos en reposo, claves administradas por el cliente" | KMS con CMK                              |
| "Almacenar valores de configuración"             | SSM Parameter Store                                  |
| "Almacenamiento de base de datos con IOPS alto"  | io2 EBS                                              |
| "Sistema de archivos compartido para EC2"        | EFS                                                  |
| "Consultar datos de S3 con SQL"                  | Athena                                               |
| "Pipeline ETL para análisis"                     | AWS Glue                                             |
| "Entregar datos de transmisión a S3"             | Kinesis Firehose                                     |
| "Trabajos por lotes tolerantes a fallos, minimizar costo" | Instancias Spot                             |
| "Carga de trabajo de producción estable y comprometida" | Savings Plans                                 |
| "Subred privada → S3 sin NAT"                    | S3 Gateway Endpoint                                  |
| "Subred privada → SQS sin NAT"                   | SQS Interface Endpoint                               |
| "Multi-AZ para RDS"                              | Failover automático (no escalado de lectura)         |
| "Réplica de Lectura para RDS"                    | Escalado de lectura (no failover automático)         |
| "Tiempo de recuperación < 1 minuto, entre AZs"  | Multi-AZ                                             |
| "Recuperación entre regiones, RTO de minutos"   | Luz Piloto o Standby en Caliente                     |
| "Activo-Activo, RTO cero"                        | Multi-Región Activo-Activo (el más complejo)         |
