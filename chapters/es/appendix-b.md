# Apéndice B: Mapa de Dominios del SAA-C03

El examen de AWS Solutions Architect Associate (SAA-C03) está organizado en cuatro dominios. Este apéndice mapea cada capítulo del libro al dominio y tarea relevantes, para que puedas estudiar por área del examen en lugar de seguir el orden de los capítulos.

---

## Descripción General de los Dominios

| Dominio                                            | Peso | Descripción                                                      |
|----------------------------------------------------|------|------------------------------------------------------------------|
| Dominio 1: Diseño de Arquitecturas Seguras         | 30%  | IAM, seguridad de red, protección de datos                       |
| Dominio 2: Diseño de Arquitecturas Resilientes     | 26%  | Alta disponibilidad, tolerancia a fallos, recuperación ante desastres |
| Dominio 3: Diseño de Arquitecturas de Alto Rendimiento | 24%  | Rendimiento de cómputo, almacenamiento, base de datos y red      |
| Dominio 4: Diseño de Arquitecturas Optimizadas en Costo | 20%  | Modelos de precios, gestión de costos, optimización de recursos  |

---

## Dominio 1: Diseño de Arquitecturas Seguras (30%)

**Tarea 1.1 — Diseñar acceso seguro a los recursos de AWS**

Conceptos centrales: usuarios, grupos, roles y políticas de IAM. Principio de privilegio mínimo. Acceso entre cuentas. Roles de servicio. SCP (Políticas de Control de Servicios) en AWS Organizations.

| Capítulo    | Tema                                                                                        |
|-------------|---------------------------------------------------------------------------------------------|
| Capítulo 3  | Fundamentos de IAM: usuarios, grupos, roles, políticas, evaluación de políticas             |
| Capítulo 14 | IAM avanzado: roles para servicios, límites de permisos, roles entre cuentas                |
| Capítulo 3  | Lógica de evaluación de políticas: denegación explícita > permiso explícito > denegación implícita |
| Capítulo 14 | AWS Organizations y SCPs                                                                    |

Patrones clave del examen:

- "EC2 necesita acceder a S3 sin credenciales codificadas" → rol de IAM con política de S3 adjunta al perfil de instancia de EC2
- "Cuentas diferentes necesitan compartir recursos" → rol de IAM con política de confianza entre cuentas
- "Evitar que todos los usuarios de IAM de una OU accedan a un servicio" → SCP en AWS Organizations

---

**Tarea 1.2 — Diseñar cargas de trabajo y aplicaciones seguras**

Conceptos centrales: diseño de VPC, grupos de seguridad vs NACLs, aislamiento de red, protección DDoS, WAF, GuardDuty.

| Capítulo    | Tema                                                                                        |
|-------------|---------------------------------------------------------------------------------------------|
| Capítulo 11 | Diseño de VPC: subredes públicas/privadas, NAT Gateway, Internet Gateway, tablas de rutas   |
| Capítulo 15 | Grupos de seguridad (stateful, nivel de instancia) vs NACLs (stateless, nivel de subred)    |
| Capítulo 17 | Shield (protección DDoS), WAF (cortafuegos de aplicación), GuardDuty (detección de amenazas) |
| Capítulo 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                           |

Patrones clave del examen:

- "Bloquear una IP específica de la subred" → regla de denegación de NACL
- "Permitir la entrada de HTTP, permitir automáticamente la respuesta HTTP de salida" → grupo de seguridad (stateful)
- "Proteger la aplicación web de la inyección SQL" → WAF con regla de inyección SQL
- "Detectar credenciales de IAM comprometidas" → GuardDuty

---

**Tarea 1.3 — Determinar los controles de seguridad de datos apropiados**

Conceptos centrales: Cifrado en reposo y en tránsito, KMS, Secrets Manager, Parameter Store, cifrado del lado del servidor de S3.

| Capítulo    | Tema                                                                                      |
|-------------|-------------------------------------------------------------------------------------------|
| Capítulo 16 | KMS: claves administradas por el cliente, rotación de claves, cifrado de sobre             |
| Capítulo 16 | Secrets Manager: rotación automática de credenciales, recuperación de secretos en tiempo de ejecución |
| Capítulo 5  | Opciones de cifrado de S3: SSE-S3, SSE-KMS, SSE-C                                         |
| Capítulo 8  | Cifrado de RDS en reposo (debe habilitarse en el momento de la creación)                   |

Patrones clave del examen:

- "Rotar credenciales de bases de datos automáticamente" → Secrets Manager con integración de RDS
- "Controlar quién puede usar claves de cifrado entre cuentas" → política de clave de KMS
- "Almacenar valores de configuración no secretos" → SSM Parameter Store (no Secrets Manager)
- "Cifrar objetos de S3 con claves administradas por la empresa" → SSE-KMS con CMK

---

## Dominio 2: Diseño de Arquitecturas Resilientes (26%)

**Tarea 2.1 — Diseñar arquitecturas escalables y con bajo acoplamiento**

Conceptos centrales: Auto Scaling, balanceadores de carga, desacoplamiento con SQS/SNS, activadores de eventos de Lambda, ECS/EKS, Step Functions.

| Capítulo    | Tema                                                                              |
|-------------|-----------------------------------------------------------------------------------|
| Capítulo 7  | Auto Scaling Groups, Application Load Balancer, políticas de escalado             |
| Capítulo 19 | SQS (desacoplamiento con colas), SNS (notificaciones de distribución en abanico)  |
| Capítulo 20 | Lambda: cómputo sin servidor, activadores de eventos, concurrencia                |
| Capítulo 21 | ECS y EKS: microservicios en contenedores                                         |
| Capítulo 22 | Step Functions: orquestación de flujos de trabajo                                 |
| Capítulo 26 | Kinesis: transmisión de datos en tiempo real                                      |

Patrones clave del examen:

- "Desacoplar el procesamiento de pedidos de la actualización de inventario" → cola de SQS entre servicios
- "Notificar a múltiples servicios cuando se realiza un nuevo pedido" → tema de SNS con suscripciones de SQS (distribución en abanico)
- "Procesar cargas de S3 automáticamente" → notificación de evento de S3 → Lambda
- "Ejecutar un flujo de trabajo de múltiples pasos con lógica de reintentos" → Step Functions

---

**Tarea 2.2 — Diseñar arquitecturas de alta disponibilidad y/o tolerantes a fallos**

Conceptos centrales: Multi-AZ, Multi-Región, failover de Route 53, réplicas de lectura de RDS, Aurora Global Database, respaldo y restauración.

| Capítulo    | Tema                                                                                              |
|-------------|---------------------------------------------------------------------------------------------------|
| Capítulo 2  | Infraestructura global de AWS: Regiones, AZs, ubicaciones de borde                               |
| Capítulo 7  | ALB en múltiples AZs, ASG reemplaza instancias no saludables                                      |
| Capítulo 8  | RDS Multi-AZ: replicación sincrónica, failover automático                                         |
| Capítulo 12 | Route 53: enrutamiento de failover, enrutamiento por latencia, verificaciones de estado           |
| Capítulo 18 | Multi-AZ vs Multi-Región: RTO/RPO, estrategias de DR (luz piloto, standby en caliente, activo-activo) |
| Capítulo 24 | Aurora Global Database: réplicas de lectura entre regiones, retraso de replicación <1s            |

Patrones clave del examen:

- "Failover automático si el RDS primario falla" → RDS Multi-AZ (no Réplica de Lectura)
- "Servir lecturas globalmente con baja latencia" → Aurora Global Database
- "Enrutar el tráfico a la región secundaria si la primaria no está disponible" → Route 53 con enrutamiento de Failover + verificaciones de estado
- "RTO de 1 minuto, RPO de 0" → despliegue Multi-AZ (no Multi-Región)
- "RTO de 15 minutos, entre regiones" → estrategia de Luz Piloto

---

## Dominio 3: Diseño de Arquitecturas de Alto Rendimiento (24%)

**Tarea 3.1 — Determinar soluciones de almacenamiento de alto rendimiento y/o escalables**

Conceptos centrales: S3 vs EBS vs EFS, selección de clase de almacenamiento, S3 Transfer Acceleration, carga multiparte, CloudFront para activos.

| Capítulo    | Tema                                                                               |
|-------------|------------------------------------------------------------------------------------|
| Capítulo 5  | S3: almacenamiento de objetos, clases de almacenamiento, versionado, ciclo de vida |
| Capítulo 6  | EBS: tipos de almacenamiento en bloque (gp3, io2, st1), EFS: almacenamiento de archivos compartido |
| Capítulo 23 | Transiciones de clases de almacenamiento de S3, opciones de recuperación de Glacier |
| Capítulo 28 | Ajuste de tamaño de EBS, migración gp2→gp3, gestión de instantáneas               |

Patrones clave del examen:

- "Sistema de archivos compartido accesible desde múltiples instancias de EC2" → EFS (no EBS; EBS se adjunta a una instancia)
- "IOPS alto para carga de trabajo de base de datos" → io2 EBS
- "Reducir costos para archivos no accedidos en 90 días" → política de ciclo de vida de S3 → Glacier
- "Subir archivos grandes desde ubicaciones distantes más rápidamente" → S3 Transfer Acceleration

---

**Tarea 3.2 — Determinar soluciones de cómputo de alto rendimiento y/o escalables**

Conceptos centrales: familias de instancias de EC2, procesadores Graviton, Auto Scaling, Lambda, Fargate, Instancias Spot.

| Capítulo    | Tema                                                                                       |
|-------------|--------------------------------------------------------------------------------------------|
| Capítulo 4  | Tipos de instancias de EC2: optimizadas para cómputo (c), optimizadas para memoria (r), propósito general (m, t) |
| Capítulo 7  | Auto Scaling: escalado horizontal para niveles web                                         |
| Capítulo 20 | Lambda: concurrencia, concurrencia aprovisionada (para latencia consistente)               |
| Capítulo 21 | ECS Fargate: contenedores sin servidor                                                     |
| Capítulo 27 | Instancias Spot para cargas de trabajo por lotes tolerantes a fallos                       |

Patrones clave del examen:

- "Carga de trabajo de entrenamiento de ML, minimizar costos, puede ser interrumpida" → Instancias Spot
- "Respuesta de Lambda consistente por debajo de 100ms" → Concurrencia aprovisionada (elimina el arranque en frío)
- "Microservicio en contenedor, sin gestión de infraestructura" → ECS Fargate

---

**Tarea 3.3 — Determinar soluciones de base de datos de alto rendimiento**

Conceptos centrales: RDS vs DynamoDB vs Aurora vs Redshift vs ElastiCache, patrones de acceso, réplicas de lectura, DAX.

| Capítulo    | Tema                                                                                |
|-------------|-------------------------------------------------------------------------------------|
| Capítulo 8  | RDS: bases de datos relacionales gestionadas, cuándo usar RDBMS                     |
| Capítulo 9  | DynamoDB: NoSQL, claves de partición, GSI, DAX (caché en memoria)                   |
| Capítulo 10 | ElastiCache: Redis vs Memcached, estrategias de caché                               |
| Capítulo 24 | Aurora: rendimiento, Serverless v2, réplicas de lectura, Global Database            |
| Capítulo 29 | DynamoDB bajo demanda vs capacidad aprovisionada con Auto Scaling                   |

Patrones clave del examen:

- "Lecturas en microsegundos para un almacén de sesiones" → ElastiCache Redis o DAX (si el backend es DynamoDB)
- "Acceso de alta velocidad basado en clave con esquema flexible" → DynamoDB
- "Uniones complejas y transacciones ACID" → Aurora o RDS
- "Análisis en petabytes de datos estructurados" → Redshift (no cubierto en detalle, pero la señal es: "almacén de datos" → Redshift)

---

**Tarea 3.4 — Determinar arquitecturas de red de alto rendimiento y/o escalables**

Conceptos centrales: CloudFront, Global Accelerator, Direct Connect, VPN, grupos de colocación, redes mejoradas.

| Capítulo    | Tema                                                                                |
|-------------|-------------------------------------------------------------------------------------|
| Capítulo 12 | Route 53: políticas de enrutamiento: basado en latencia, geolocalización, ponderado |
| Capítulo 13 | CloudFront: CDN, caché en borde, Lambda@Edge                                        |
| Capítulo 25 | Direct Connect: conectividad privada dedicada                                       |
| Capítulo 25 | AWS Global Accelerator: enrutamiento Anycast al borde de AWS más cercano            |
| Capítulo 30 | VPC Endpoints: conectividad privada a servicios de AWS                              |

Patrones clave del examen:

- "Reducir la latencia para usuarios globales que acceden a respuestas de API dinámicas" → Global Accelerator (no CloudFront, que es mejor para contenido cacheable)
- "Reducir la latencia para activos estáticos globalmente" → CloudFront
- "Conectividad privada consistente a AWS desde instalaciones propias" → Direct Connect
- "Carga rápida desde clientes en todo el mundo hacia tu bucket de S3" → S3 Transfer Acceleration

---

**Tarea 3.5 — Determinar soluciones de ingesta y transformación de datos de alto rendimiento**

Conceptos centrales: Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR.

| Capítulo    | Tema                                                                                    |
|-------------|-----------------------------------------------------------------------------------------|
| Capítulo 26 | Kinesis Data Streams: procesamiento de eventos ordenados en tiempo real                 |
| Capítulo 26 | Kinesis Data Firehose: entrega gestionada a S3, Redshift, OpenSearch                   |
| Capítulo 26 | AWS Glue: ETL sin servidor, Data Catalog, Crawlers                                      |
| Capítulo 26 | Athena: SQL sin servidor sobre S3                                                       |

Patrones clave del examen:

- "Procesar datos de flujo de clics en tiempo real" → Kinesis Data Streams + Lambda o KDA
- "Entregar datos de transmisión a S3 para análisis posterior" → Kinesis Firehose
- "Transformar y catalogar datos de múltiples fuentes" → AWS Glue
- "Consultar datos históricos almacenados en S3 con SQL" → Athena

---

## Dominio 4: Diseño de Arquitecturas Optimizadas en Costo (20%)

**Tarea 4.1 — Diseñar soluciones de almacenamiento optimizadas en costo**

| Capítulo    | Tema                                                                                     |
|-------------|------------------------------------------------------------------------------------------|
| Capítulo 23 | Políticas de ciclo de vida de S3, transiciones de clases de almacenamiento               |
| Capítulo 28 | Ajuste de tamaño de EBS, migración gp2→gp3, reglas de ciclo de vida de versionado de S3  |
| Capítulo 28 | EFS Intelligent-Tiering, etiquetas de asignación de costos, AWS Budgets                  |

Patrones clave del examen:

- "Identificar qué equipo está generando más costos de S3" → etiquetas de asignación de costos + Cost Explorer
- "Reducir costos para objetos raramente accedidos automáticamente" → S3 Intelligent-Tiering
- "Alertar cuando los costos mensuales superen los $10.000" → AWS Budgets

---

**Tarea 4.2 — Diseñar soluciones de cómputo optimizadas en costo**

| Capítulo    | Tema                                                                                          |
|-------------|-----------------------------------------------------------------------------------------------|
| Capítulo 27 | Precios de EC2: Bajo Demanda, Instancias Reservadas, Savings Plans, Spot, Hosts Dedicados     |
| Capítulo 20 | Lambda: pago por invocación (costo de inactividad cero)                                       |

Patrones clave del examen:

- "Reducir costos para cargas de trabajo de producción de estado estacionario" → Savings Plans (más flexible) o Instancias Reservadas
- "Minimizar costos para trabajos por lotes que pueden ser interrumpidos" → Instancias Spot
- "Procesamiento basado en eventos con costo de inactividad cero" → Lambda

---

**Tarea 4.3 — Diseñar soluciones de base de datos optimizadas en costo**

| Capítulo    | Tema                                                                        |
|-------------|-----------------------------------------------------------------------------|
| Capítulo 29 | DynamoDB bajo demanda vs aprovisionado + Auto Scaling                       |
| Capítulo 29 | Instancias/Nodos Reservados de RDS y ElastiCache                            |
| Capítulo 29 | Gestión de instantáneas de RDS                                              |

Patrones clave del examen:

- "Tráfico de DynamoDB impredecible" → modo de capacidad bajo demanda
- "Tráfico de DynamoDB consistente con picos conocidos" → Aprovisionado + Auto Scaling
- "Reducir costos de RDS para carga de trabajo estable" → Instancias Reservadas (1 o 3 años)

---

**Tarea 4.4 — Diseñar arquitecturas de red optimizadas en costo**

| Capítulo    | Tema                                                                                                     |
|-------------|----------------------------------------------------------------------------------------------------------|
| Capítulo 30 | Precios de transferencia de datos: entrada (gratis), entre AZs ($0,01/GB), entre regiones, internet ($0,09/GB) |
| Capítulo 30 | NAT Gateway ($0,045/GB) vs VPC Endpoints (Puerta de enlace: gratis; Interfaz: con precio)               |
| Capítulo 30 | CloudFront como optimizador de costos de transferencia de datos                                          |

Patrones clave del examen:

- "EC2 en subred privada llama a S3: eliminar costos de NAT Gateway" → S3 Gateway Endpoint (gratis)
- "EC2 en subred privada llama a SQS: reducir costos de NAT Gateway" → SQS Interface Endpoint
- "Reducir costos de transferencia de datos para entrega de contenido global" → CloudFront (el almacenamiento en caché reduce las solicitudes de origen)

---

## Temas Transversales

Algunos temas aparecen en múltiples dominios:

| Tema                                      | Dominios | Capítulos    |
|-------------------------------------------|----------|--------------|
| Well-Architected Framework                | Todos    | 31           |
| Revisiones de arquitectura y ADRs         | Todos    | 32           |
| Razonamiento sobre compensaciones ("depende") | Todos | 33           |
| Diseño Multi-AZ                           | 2, 3     | 7, 8, 18, 24 |
| Monitoreo y observabilidad                | 1, 2     | A lo largo   |
| CloudFront                                | 3, 4     | 13, 30       |

---

## Lista de Verificación Pre-Examen

Antes de presentarte al SAA-C03:

**Áreas de alto peso (más probables de aparecer)**

- [ ] Lógica de evaluación de políticas de IAM (denegación explícita → permiso explícito → denegación implícita)
- [ ] Componentes de VPC: subredes, tablas de rutas, IGW, NAT Gateway, grupos de seguridad, NACLs
- [ ] Clases de almacenamiento de S3 y cuándo usar cada una
- [ ] RDS Multi-AZ vs Réplica de Lectura (failover vs escalado de lectura)
- [ ] SQS vs SNS vs EventBridge (pull vs push vs enrutamiento de eventos)
- [ ] Modelos de precios de EC2: Spot para tolerantes a fallos, Savings Plans para cargas de trabajo comprometidas
- [ ] Activadores y concurrencia de Lambda
- [ ] DynamoDB vs Aurora vs Redshift (el patrón de acceso determina la elección)
- [ ] CloudFront: CDN para estático, Global Accelerator para dinámico

**Trampas comunes**

- [ ] EBS se adjunta a UNA instancia; EFS es compartido
- [ ] Las Réplicas de Lectura de RDS son para escalado de lectura, NO para failover automático (eso es Multi-AZ)
- [ ] Las NACLs son stateless (necesitan reglas de entrada y salida)
- [ ] Los Endpoints de puerta de enlace son gratuitos y solo para S3 y DynamoDB
- [ ] Kinesis retiene y reproduce; SQS elimina al consumir
- [ ] "Desacoplar" no siempre significa SQS: la distribución en abanico de SNS y EventBridge también son patrones de desacoplamiento
- [ ] Shield Standard es gratuito y automático; Advanced es una suscripción de pago

**La estructura del examen**

- 65 preguntas, 130 minutos (2 horas 10 minutos)
- Opción múltiple (una correcta) y respuesta múltiple (seleccionar N correctas)
- Puntuación aprobatoria: 720 sobre 1.000
- Las preguntas sin puntuación están integradas; no puedes saber cuáles son
- Gestiona el tiempo: ~2 minutos por pregunta; marca las difíciles y vuelve a ellas
