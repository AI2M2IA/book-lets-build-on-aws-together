# Apéndice B: Mapa de Dominios del SAA-C03

El examen AWS Solutions Architect Associate (SAA-C03) está organizado en cuatro dominios. Este apéndice mapea cada capítulo del libro al dominio y la tarea relevantes, para que puedas estudiar por área de examen en lugar de por orden de capítulos.

---

## Resumen de Dominios

| Dominio                                          | Peso  | Descripción                                            |
|--------------------------------------------------|-------|--------------------------------------------------------|
| Dominio 1: Diseñar Arquitecturas Seguras         | 30%   | IAM, seguridad de red, protección de datos             |
| Dominio 2: Diseñar Arquitecturas Resilientes     | 26%   | Alta disponibilidad, tolerancia a fallos, recuperación ante desastres |
| Dominio 3: Diseñar Arquitecturas de Alto Rendimiento | 24% | Rendimiento de cómputo, almacenamiento, base de datos y red |
| Dominio 4: Diseñar Arquitecturas Optimizadas en Costos | 20% | Modelos de precios, gestión de costos, optimización de recursos |

---

## Dominio 1: Diseñar Arquitecturas Seguras (30%)

**Tarea 1.1 — Diseñar acceso seguro a los recursos de AWS**

Conceptos centrales: Usuarios, grupos, roles y políticas de IAM. Principio de mínimo privilegio. Acceso entre cuentas. Roles de servicio. SCP (Service Control Policies) en AWS Organizations.

| Capítulo   | Tema                                                                          |
|------------|-------------------------------------------------------------------------------|
| Capítulo 3  | Fundamentos de IAM: usuarios, grupos, roles, políticas, evaluación de políticas |
| Capítulo 14 | IAM avanzado: roles para servicios, permission boundaries, roles entre cuentas |
| Capítulo 3  | Lógica de evaluación de políticas: denegación explícita > permiso explícito > denegación implícita |
| Capítulo 14 | AWS Organizations, SCPs, Control Tower, Account Factory                       |
| Capítulo 14 | Cognito: User Pools (inicio de sesión de apps, JWTs) e Identity Pools (credenciales temporales de AWS) |

Patrones clave del examen:

- "EC2 necesita acceder a S3 sin credenciales codificadas" → rol de IAM con política de S3 adjunta al perfil de instancia de EC2
- "Diferentes cuentas necesitan compartir recursos" → rol de IAM con política de confianza entre cuentas
- "Impedir que todos los usuarios de IAM en una OU accedan a un servicio" → SCP en AWS Organizations

---

**Tarea 1.2 — Diseñar cargas de trabajo y aplicaciones seguras**

Conceptos centrales: Diseño de VPC, grupos de seguridad vs. NACLs, aislamiento de red, protección contra DDoS, WAF, GuardDuty.

| Capítulo   | Tema                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| Capítulo 11 | Diseño de VPC: subredes públicas/privadas, NAT Gateway, Internet Gateway, tablas de enrutamiento |
| Capítulo 15 | Grupos de seguridad (con estado, a nivel de instancia) vs. NACLs (sin estado, a nivel de subred) |
| Capítulo 17 | Shield (DDoS), WAF (firewall de aplicaciones), GuardDuty (detección de amenazas), Inspector (escaneo de CVE) |
| Capítulo 17 | Macie: descubrimiento de datos sensibles en S3 (PII, credenciales)                         |
| Capítulo 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                          |

Patrones clave del examen:

- "Bloquear una IP específica de la subred" → regla de denegación de NACL
- "Permitir HTTP entrante, permitir automáticamente la respuesta HTTP saliente" → grupo de seguridad (con estado)
- "Proteger una aplicación web contra inyección SQL" → WAF con regla de inyección SQL
- "Detectar credenciales de IAM comprometidas" → GuardDuty

---

**Tarea 1.3 — Determinar los controles de seguridad de datos apropiados**

Conceptos centrales: Cifrado en reposo y en tránsito, KMS, Secrets Manager, Parameter Store, cifrado del lado del servidor de S3.

| Capítulo   | Tema                                                                     |
|------------|--------------------------------------------------------------------------|
| Capítulo 16 | KMS: claves administradas por el cliente, rotación de claves, cifrado de sobre |
| Capítulo 16 | Secrets Manager: rotación automática de credenciales, recuperación de secretos en tiempo de ejecución |
| Capítulo 16 | ACM (AWS Certificate Manager): certificados SSL/TLS para ALB, CloudFront |
| Capítulo 5  | Opciones de cifrado de S3: SSE-S3, SSE-KMS, SSE-C                        |
| Capítulo 8  | Cifrado en reposo de RDS (debe habilitarse en la creación)              |

Patrones clave del examen:

- "Rotar credenciales de base de datos automáticamente" → Secrets Manager con integración de RDS
- "Controlar quién puede usar las claves de cifrado entre cuentas" → política de clave de KMS
- "Almacenar valores de configuración no secretos" → SSM Parameter Store (no Secrets Manager)
- "Cifrar objetos de S3 con claves administradas por la empresa" → SSE-KMS con CMK

---

## Dominio 2: Diseñar Arquitecturas Resilientes (26%)

**Tarea 2.1 — Diseñar arquitecturas escalables y débilmente acopladas**

Conceptos centrales: Auto Scaling, balanceadores de carga, desacoplamiento con SQS/SNS, disparadores de eventos de Lambda, ECS/EKS, Step Functions.

| Capítulo   | Tema                                                              |
|------------|-------------------------------------------------------------------|
| Capítulo 7  | Auto Scaling Groups, Application Load Balancer, políticas de escalado |
| Capítulo 19 | SQS (desacoplamiento con colas), SNS (notificaciones de fan-out)  |
| Capítulo 20 | Lambda: cómputo sin servidor, disparadores de eventos, concurrencia |
| Capítulo 20 | API Gateway: APIs gestionadas REST/HTTP/WebSocket, independientes o + Lambda |
| Capítulo 21 | ECS y EKS: microservicios en contenedores                         |
| Capítulo 22 | Step Functions: orquestación de flujos de trabajo                 |
| Capítulo 26 | Kinesis: transmisión de datos en tiempo real                      |

Patrones clave del examen:

- "Desacoplar el procesamiento de pedidos de la actualización de inventario" → cola SQS entre servicios
- "Notificar a múltiples servicios cuando se realiza un nuevo pedido" → tema SNS con suscripciones SQS (fan-out)
- "Procesar cargas de S3 automáticamente" → notificación de evento de S3 → Lambda
- "Ejecutar un flujo de trabajo de múltiples pasos con lógica de reintentos" → Step Functions

---

**Tarea 2.2 — Diseñar arquitecturas de alta disponibilidad y/o tolerantes a fallos**

Conceptos centrales: Multi-AZ, Multi-Región, failover de Route 53, réplicas de lectura de RDS, Aurora Global Database, backup y restore.

| Capítulo   | Tema                                                                                        |
|------------|---------------------------------------------------------------------------------------------|
| Capítulo 2  | Infraestructura global de AWS: Regiones, AZs, ubicaciones de borde                          |
| Capítulo 7  | ALB entre múltiples AZs, ASG reemplaza instancias en mal estado                             |
| Capítulo 8  | RDS Multi-AZ: replicación sincrónica, failover automático                                   |
| Capítulo 12 | Route 53: enrutamiento de failover, enrutamiento por latencia, verificaciones de estado     |
| Capítulo 18 | Multi-AZ vs. Multi-Región: RTO/RPO, estrategias de DR (pilot light, warm standby, activo-activo) |
| Capítulo 18 | AWS Backup (copias de seguridad centralizadas, entre cuentas), Elastic Disaster Recovery (pilot light gestionado) |
| Capítulo 24 | Aurora Global Database: réplicas de lectura entre regiones, < 1s de retraso de replicación   |

Patrones clave del examen:

- "Failover automático si falla el RDS primario" → RDS Multi-AZ (no Read Replica)
- "Servir lecturas globalmente con baja latencia" → Aurora Global Database
- "Enrutar el tráfico a una región secundaria si la primaria no está disponible" → Route 53 con enrutamiento de Failover + verificaciones de estado
- "RTO de 1 minuto, RPO de 0" → despliegue Multi-AZ (no Multi-Región)
- "RTO de 15 minutos, entre regiones" → estrategia Pilot Light

---

## Dominio 3: Diseñar Arquitecturas de Alto Rendimiento (24%)

**Tarea 3.1 — Determinar soluciones de almacenamiento de alto rendimiento y/o escalables**

Conceptos centrales: S3 vs. EBS vs. EFS, selección de clase de almacenamiento, S3 Transfer Acceleration, carga multiparte, CloudFront para activos.

| Capítulo   | Tema                                                                    |
|------------|-------------------------------------------------------------------------|
| Capítulo 5  | S3: almacenamiento de objetos, clases de almacenamiento, versionado, ciclo de vida |
| Capítulo 6  | EBS: tipos de almacenamiento en bloque (gp3, io2, st1), EFS: almacenamiento de archivos compartido |
| Capítulo 6  | Storage Gateway: puente híbrido de las instalaciones a S3 (File, Volume, Tape) |
| Capítulo 23 | Transiciones de clase de almacenamiento de S3, opciones de recuperación de Glacier |
| Capítulo 25 | DataSync (sincronización de archivos en línea), Transfer Family (SFTP gestionado→S3), Snow Family (transferencia masiva sin conexión — heredado: cerrado a nuevos clientes en noviembre de 2025; AWS ahora apunta a DataSync y a las Data Transfer Terminals), MGN (realojamiento de servidores) |
| Capítulo 28 | Right-sizing de EBS, migración gp2→gp3, gestión de instantáneas         |

Patrones clave del examen:

- "Sistema de archivos compartido accesible desde múltiples instancias de EC2" → EFS (no EBS; EBS se adjunta a una sola instancia)
- "Alto IOPS para carga de trabajo de base de datos" → io2 EBS
- "Reducir costo para archivos no accedidos en 90 días" → política de ciclo de vida de S3 → Glacier
- "Cargar archivos grandes desde ubicaciones distantes más rápido" → S3 Transfer Acceleration
- "Semanas de transferencia sobre ancho de banda limitado" → el examen SAA-C03 todavía espera Snowball, a pesar del cierre de la Snow Family a nuevos clientes en 2025

---

**Tarea 3.2 — Determinar soluciones de cómputo de alto rendimiento y/o escalables**

Conceptos centrales: Familias de instancias de EC2, procesadores Graviton, Auto Scaling, Lambda, Fargate, Instancias Spot.

| Capítulo   | Tema                                                                                    |
|------------|-----------------------------------------------------------------------------------------|
| Capítulo 4  | Tipos de instancia de EC2: optimizadas para cómputo (c), optimizadas para memoria (r), propósito general (m, t) |
| Capítulo 7  | Auto Scaling: escalado horizontal para capas web                                        |
| Capítulo 20 | Lambda: concurrencia, concurrencia aprovisionada (para latencia consistente)            |
| Capítulo 21 | ECS Fargate: contenedores sin servidor                                                  |
| Capítulo 21 | AWS Batch: cómputo por lotes gestionado para contenedores Docker, respaldado por Spot   |
| Capítulo 27 | Instancias Spot para cargas de trabajo por lotes tolerantes a fallos                    |

Patrones clave del examen:

- "Carga de trabajo de entrenamiento de ML, minimizar costo, puede interrumpirse" → Instancias Spot
- "Respuesta consistente de Lambda sub-100ms" → Concurrencia aprovisionada (elimina el arranque en frío)
- "Microservicio en contenedor, sin gestión de infraestructura" → ECS Fargate

---

**Tarea 3.3 — Determinar soluciones de base de datos de alto rendimiento**

Conceptos centrales: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, patrones de acceso, réplicas de lectura, DAX.

| Capítulo   | Tema                                                              |
|------------|-------------------------------------------------------------------|
| Capítulo 8  | RDS: bases de datos relacionales gestionadas, cuándo usar un RDBMS |
| Capítulo 9  | DynamoDB: NoSQL, claves de partición, GSI, DAX (caché en memoria) |
| Capítulo 10 | ElastiCache: Redis vs. Memcached, estrategias de caché            |
| Capítulo 10 | MemoryDB for Redis: base de datos primaria durable compatible con Redis |
| Capítulo 24 | Aurora: rendimiento, Serverless v2, réplicas de lectura, Global Database |
| Capítulo 29 | DynamoDB bajo demanda vs. capacidad aprovisionada con Auto Scaling |

Patrones clave del examen:

- "Lecturas en microsegundos para un almacén de sesiones" → ElastiCache Redis o DAX (si el backend es DynamoDB)
- "Acceso de clave-valor de alto rendimiento con esquema flexible" → DynamoDB
- "Joins complejos y transacciones ACID" → Aurora o RDS
- "Analítica sobre petabytes de datos estructurados" → Redshift (no cubierto en detalle pero la señal es: "data warehouse" → Redshift)

---

**Tarea 3.4 — Determinar arquitecturas de red de alto rendimiento y/o escalables**

Conceptos centrales: CloudFront, Global Accelerator, Direct Connect, VPN, grupos de colocación, redes mejoradas.

| Capítulo   | Tema                                                              |
|------------|-------------------------------------------------------------------|
| Capítulo 7  | NLB (Capa 4) y GWLB (Gateway Load Balancer para dispositivos de red) |
| Capítulo 11 | Client VPN: acceso cifrado de dispositivo individual a VPC         |
| Capítulo 12 | Route 53: políticas de enrutamiento: basado en latencia, geolocalización, ponderado |
| Capítulo 13 | CloudFront: CDN, almacenamiento en caché en el borde, Lambda@Edge  |
| Capítulo 25 | AWS Global Accelerator: enrutamiento Anycast hacia la red troncal de AWS |
| Capítulo 25 | Direct Connect: conectividad privada dedicada                     |
| Capítulo 30 | VPC Endpoints: conectividad privada a servicios de AWS            |

Patrones clave del examen:

- "Reducir la latencia para usuarios globales que acceden a respuestas de API dinámicas" → Global Accelerator (no CloudFront, que es mejor para contenido almacenable en caché)
- "Reducir la latencia para activos estáticos globalmente" → CloudFront
- "Conectividad privada consistente a AWS desde las instalaciones" → Direct Connect
- "Carga rápida desde clientes de todo el mundo hacia tu bucket de S3" → S3 Transfer Acceleration

---

**Tarea 3.5 — Determinar soluciones de ingesta y transformación de datos de alto rendimiento**

Conceptos centrales: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Capítulo   | Tema                                                               |
|------------|--------------------------------------------------------------------|
| Capítulo 26 | Kinesis Data Streams: procesamiento de eventos ordenados en tiempo real |
| Capítulo 26 | Amazon Data Firehose (ex-Kinesis Data Firehose): entrega gestionada a S3, Redshift, OpenSearch |
| Capítulo 26 | AWS Glue: ETL sin servidor, Data Catalog, Crawlers                 |
| Capítulo 26 | Athena: SQL sin servidor sobre S3                                  |
| Capítulo 26 | QuickSight: dashboards de BI gestionados, motor en memoria SPICE   |
| Capítulo 26 | Lake Formation: control de acceso granular a lagos de datos        |

Patrones clave del examen:

- "Procesar datos de clickstream en tiempo real" → Kinesis Data Streams + Lambda o Managed Service for Apache Flink (anteriormente Kinesis Data Analytics)
- "Entregar datos en streaming a S3 para análisis posterior" → Amazon Data Firehose
- "Transformar y catalogar datos de múltiples fuentes" → AWS Glue
- "Consultar datos históricos almacenados en S3 con SQL" → Athena

---

## Dominio 4: Diseñar Arquitecturas Optimizadas en Costos (20%)

**Tarea 4.1 — Diseñar soluciones de almacenamiento optimizadas en costos**

| Capítulo   | Tema                                                              |
|------------|-------------------------------------------------------------------|
| Capítulo 23 | Políticas de ciclo de vida de S3, transiciones de clase de almacenamiento |
| Capítulo 28 | Right-sizing de EBS, migración gp2→gp3, reglas de ciclo de vida de versionado de S3 |
| Capítulo 28 | EFS Intelligent-Tiering, etiquetas de asignación de costos, AWS Budgets |

Patrones clave del examen:

- "Identificar qué equipo está generando la mayor parte de los costos de S3" → etiquetas de asignación de costos + Cost Explorer
- "Reducir costos para objetos de acceso poco frecuente automáticamente" → S3 Intelligent-Tiering
- "Alertar cuando los costos mensuales superen los $10,000" → AWS Budgets

---

**Tarea 4.2 — Diseñar soluciones de cómputo optimizadas en costos**

| Capítulo   | Tema                                                                            |
|------------|---------------------------------------------------------------------------------|
| Capítulo 2  | Outposts: rack de AWS en las instalaciones (compromiso costo de capital vs. opex de la nube) |
| Capítulo 2  | Wavelength: cómputo en el borde 5G (asociación con telecomunicaciones, colocación impulsada por la latencia) |
| Capítulo 27 | Precios de EC2: bajo demanda, Instancias Reservadas, Savings Plans, Spot, Dedicated Hosts |
| Capítulo 20 | Lambda: paga por invocación (cero costo de inactividad)                          |

Patrones clave del examen:

- "Reducir costos para cargas de trabajo de producción en estado estable" → Savings Plans (más flexible) o Instancias Reservadas
- "Minimizar costos para trabajos por lotes que pueden interrumpirse" → Instancias Spot
- "Procesamiento basado en eventos con cero costo de inactividad" → Lambda

---

**Tarea 4.3 — Diseñar soluciones de base de datos optimizadas en costos**

| Capítulo   | Tema                                              |
|------------|---------------------------------------------------|
| Capítulo 29 | DynamoDB bajo demanda vs. aprovisionado + Auto Scaling |
| Capítulo 29 | Instancias/Nodos Reservados de RDS y ElastiCache  |
| Capítulo 29 | Gestión de instantáneas de RDS                    |

Patrones clave del examen:

- "Tráfico impredecible de DynamoDB" → modo de capacidad bajo demanda
- "Tráfico consistente de DynamoDB con picos conocidos" → Aprovisionado + Auto Scaling
- "Reducir costos de RDS para una carga de trabajo estable" → Instancias Reservadas (1 o 3 años)

---

**Tarea 4.4 — Diseñar arquitecturas de red optimizadas en costos**

| Capítulo   | Tema                                                                                         |
|------------|----------------------------------------------------------------------------------------------|
| Capítulo 30 | Precios de transferencia de datos: entrante (gratis), entre AZs ($0.01/GB), entre regiones, internet ($0.09/GB) |
| Capítulo 30 | NAT Gateway ($0.045/GB) vs. VPC Endpoints (Gateway: gratis; Interface: tarifado)             |
| Capítulo 30 | CloudFront como optimizador de costos de transferencia de datos                              |

Patrones clave del examen:

- "EC2 en subred privada llama a S3 — eliminar costos de NAT Gateway" → S3 Gateway Endpoint (gratis)
- "EC2 en subred privada llama a SQS — reducir costos de NAT Gateway" → SQS Interface Endpoint
- "Reducir costos de transferencia de datos para entrega de contenido global" → CloudFront (el almacenamiento en caché reduce las solicitudes al origen)

---

## Temas Transversales

Algunos temas aparecen en múltiples dominios:

| Tema                               | Dominios | Capítulos    |
|------------------------------------|----------|--------------|
| Well-Architected Framework         | Todos    | 31           |
| Revisiones de arquitectura y ADRs  | Todos    | 32           |
| Razonamiento de compromisos ("depende") | Todos | 33         |
| Diseño Multi-AZ                    | 2, 3     | 7, 8, 18, 24 |
| Monitoreo y observabilidad         | 1, 2     | A lo largo del libro |
| CloudFront                         | 3, 4     | 13, 30       |

---

## Lista de Verificación Previa al Examen

Antes de presentar el SAA-C03:

**Áreas de alto peso (con mayor probabilidad de aparecer)**

- [ ] Lógica de evaluación de políticas de IAM (denegación explícita → permiso explícito → denegación implícita)
- [ ] Componentes de VPC: subredes, tablas de enrutamiento, IGW, NAT Gateway, grupos de seguridad, NACLs
- [ ] Clases de almacenamiento de S3 y cuándo usar cada una
- [ ] RDS Multi-AZ vs. Read Replica (failover vs. escalado de lectura)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. enrutamiento de eventos)
- [ ] Modelos de precios de EC2: Spot para tolerante a fallos, Savings Plans para cargas de trabajo comprometidas
- [ ] Disparadores y concurrencia de Lambda
- [ ] DynamoDB vs. Aurora vs. Redshift (el patrón de acceso determina la elección)
- [ ] CloudFront: CDN para estático, Global Accelerator para dinámico

**Trampas comunes**

- [ ] EBS se adjunta a UNA instancia; EFS es compartido
- [ ] Las Read Replicas de RDS son para escalado de lectura, NO para failover automático (eso es Multi-AZ)
- [ ] Las NACLs son sin estado (necesitan reglas tanto de entrada como de salida)
- [ ] Los Gateway Endpoints son gratuitos y solo para S3 y DynamoDB
- [ ] Kinesis retiene y reproduce; SQS elimina al consumir
- [ ] "Desacoplar" no siempre significa SQS — el fan-out de SNS y EventBridge también son patrones de desacoplamiento
- [ ] Shield Standard es gratuito y automático; Advanced es una suscripción de pago
- [ ] ElastiCache vs. MemoryDB: ElastiCache = caché (pérdida de datos aceptable). MemoryDB = base de datos primaria durable.
- [ ] Client VPN vs. Site-to-Site VPN: Client VPN = dispositivos individuales. Site-to-Site = red a red.
- [ ] Outposts vs. Wavelength: Outposts = rack de AWS en las instalaciones. Wavelength = borde 5G.
- [ ] DMS: homogénea = DMS directo. Heterogénea = SCT primero, luego DMS.
- [ ] DataSync mueve *archivos*; DMS mueve *bases de datos*; MGN mueve *servidores completos*.

**La estructura del examen**

- 65 preguntas, 130 minutos (2 horas 10 minutos)
- Opción múltiple (una correcta) y respuesta múltiple (selecciona N correctas)
- Puntaje de aprobación: 720 de 1000
- Las preguntas no puntuadas están integradas; no puedes saber cuáles son
- Gestiona el tiempo: ~2 minutos por pregunta; marca las difíciles y vuelve a ellas
