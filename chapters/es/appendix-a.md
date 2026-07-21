# Apéndice A: Referencia Rápida de Servicios de AWS

Cada servicio cubierto en este libro, en el orden en que fue introducido. Úsalo como referencia de estudio y consulta rápida durante la preparación para el examen.

---

## Cómputo

**EC2 — Elastic Compute Cloud** *(Capítulo 4)*

Máquinas virtuales en la nube. Eliges el tipo de instancia (CPU, memoria, almacenamiento), el sistema operativo y la región. Pagas por hora (bajo demanda), por compromiso (Instancias Reservadas / Savings Plans) o por franja de capacidad sobrante (Spot). La primitiva de cómputo fundamental.

Conceptos clave: AMI (Amazon Machine Image), tipos de instancia (familias t3, m6g, r6g, c6g), pares de claves, perfiles de instancia, grupos de colocación.

Señal del examen: Cuando un escenario requiere cómputo persistente, con estado o de larga duración → EC2 o ECS. Cuando un escenario requiere cómputo de corta duración, activado por eventos o con costo cero de inactividad → Lambda.

---

**Auto Scaling + Application Load Balancer** *(Capítulo 7)*

Los Auto Scaling Groups (ASGs) agregan y eliminan instancias de EC2 en función de la carga. Los Application Load Balancers (ALBs) distribuyen el tráfico entre instancias y enrutan por ruta o host. Juntos forman la capa de escalado horizontal.

Conceptos clave: Plantilla de lanzamiento, políticas de escalado (seguimiento de objetivo, paso, programado), verificaciones de estado, grupos de destino de ALB, reglas de escucha, enrutamiento ponderado.

Señal del examen: "Manejar carga variable" o "alta disponibilidad entre AZs" → ASG + ALB.

---

**Lambda** *(Capítulo 20)*

Funciones sin servidor. Escribes el código; AWS lo ejecuta en respuesta a eventos. Sin servidores que gestionar. Pagas por invocación y por milisegundo de ejecución. Escala automáticamente a miles de ejecuciones concurrentes.

Conceptos clave: Fuentes de eventos (API Gateway, S3, SQS, EventBridge, Kinesis), rol de ejecución, límites de concurrencia, concurrencia reservada y aprovisionada, arranque en frío, Layers, duración máxima de 15 minutos.

Señal del examen: "Sin servidor", "basado en eventos", "tareas de corta duración", "sin costo de inactividad" → Lambda.

---

**ECS — Elastic Container Service** *(Capítulo 21)*

Ejecuta contenedores Docker en AWS. Dos tipos de lanzamiento: EC2 (tú gestionas el host) y Fargate (AWS gestiona el host). ECS gestiona las definiciones de tareas, los servicios, la programación del clúster y la integración con balanceadores de carga y descubrimiento de servicios.

Conceptos clave: Definición de tarea, servicio ECS, tipo de lanzamiento Fargate vs. EC2, ECR (registro de contenedores), rol de IAM de tarea, escalado automático de servicios.

Señal del examen: "Cargas de trabajo en contenedores", "microservicios", "Docker en AWS" → ECS (generalmente Fargate para contenedores sin servidor).

---

**EKS — Elastic Kubernetes Service** *(Capítulo 21)*

Kubernetes gestionado. AWS ejecuta el plano de control; tú ejecutas los nodos trabajadores (EC2 o Fargate). Usa EKS cuando tu equipo ya usa Kubernetes o tiene cargas de trabajo que requieren características específicas de Kubernetes.

Señal del examen: "Kubernetes", "necesidad de migrar cargas de trabajo K8s existentes" → EKS. "Solo necesito contenedores sin la sobrecarga de K8s" → ECS.

---

**AWS Batch** *(Capítulo 21)*

Cómputo por lotes gestionado para contenedores Docker. Defines un trabajo (imagen Docker + comando), una cola de trabajos y un entorno de cómputo (EC2 o Fargate). AWS Batch aprovisiona y escala el cómputo automáticamente, y luego lo termina cuando el trabajo finaliza. Admite Instancias Spot para reducir costos.

Conceptos clave: Definición de trabajo (qué ejecutar), cola de trabajos (dónde esperan los trabajos), entorno de cómputo (EC2 o Fargate, bajo demanda o Spot), trabajos de matriz (ejecutar muchas copias paralelas del mismo trabajo).

Señal del examen: "Procesamiento por lotes que excede el tiempo límite de 15 minutos de Lambda", "trabajos de cómputo finitos en contenedores", "cargas de trabajo HPC en AWS" → AWS Batch.

---

**AWS Outposts** *(Capítulo 2)*

Un rack de hardware de AWS completamente gestionado instalado en tu propio centro de datos o instalación de co-ubicación. Ejecuta los mismos servicios, APIs y herramientas de AWS que la nube pública (EC2, EBS, RDS, EKS, S3 en Outposts), pero físicamente en las instalaciones.

Conceptos clave: Las mismas APIs de AWS en las instalaciones, AWS gestiona la instalación y los parches, el cliente proporciona el espacio del rack y la energía, el Local Gateway (LGW) conecta Outposts con las redes locales.

Señal del examen: "Ejecutar AWS en tu propio centro de datos", "la residencia de datos requiere que el cómputo permanezca en las instalaciones", "APIs de AWS sin dependencia de internet" → Outposts.

---

**AWS Wavelength** *(Capítulo 2)*

Infraestructura de AWS desplegada dentro de las redes de los proveedores de telecomunicaciones 5G. Las Wavelength Zones se ubican en el borde de la red 5G, lo que permite una latencia de un solo dígito de milisegundos hacia los dispositivos móviles.

Conceptos clave: Las Wavelength Zones son extensiones de las Regiones de AWS dentro de las redes de telecomunicaciones, el tráfico permanece en la red del operador entre el dispositivo y la Wavelength Zone.

Señal del examen: "Latencia de un solo dígito de milisegundos hacia usuarios móviles 5G", "AR/VR móvil", "juegos en tiempo real en móviles", "telemetría de vehículos autónomos" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Capítulo 25)*

Servicio de migración por realojamiento (lift-and-shift). Un agente replica los discos de los servidores de origen bloque por bloque en un área de preparación de bajo costo en AWS; lanzas copias de prueba bajo demanda; en el momento de la transición, MGN convierte los servidores replicados en instancias EC2 nativas. No se requieren cambios en la aplicación.

Conceptos clave: Replicación continua a nivel de bloque, área de preparación, lanzamientos de prueba antes de la transición, las "7 R" de las estrategias de migración (MGN = realojamiento).

Señal del examen: "Migrar cientos de VMs rápidamente sin cambios de código", "lift-and-shift de servidores a EC2" → MGN. DataSync mueve *archivos*; DMS mueve *bases de datos*; MGN mueve *servidores completos*.

---

## Almacenamiento

**S3 — Simple Storage Service** *(Capítulo 5)*

Almacenamiento de objetos. Capacidad ilimitada, durabilidad del 99.999999999% (once nueves). Almacena archivos como objetos en buckets. Los buckets viven en una región. Los objetos pueden variar de 0 bytes a 5 TB.

Conceptos clave: Política de bucket, ACL de objeto, versionado, alojamiento de sitios web estáticos, URL prefirmadas, carga multiparte, Transfer Acceleration, clases de almacenamiento (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, más S3 Express One Zone para cargas de trabajo de directory-bucket de una sola AZ y latencia crítica).

Señal del examen: "Almacenar y recuperar archivos", "activos estáticos", "copias de seguridad", "lago de datos" → S3. La clase de almacenamiento correcta depende de la frecuencia de acceso y la velocidad de recuperación.

---

**EBS — Elastic Block Store** *(Capítulo 6)*

Almacenamiento en bloque adjunto a una sola instancia de EC2. Actúa como un disco duro. Persiste independientemente del ciclo de vida de la instancia (puedes desconectarlo y volver a conectarlo). Los tipos más comunes: gp3 (SSD de propósito general, el predeterminado), io2 (IOPS aprovisionado para bases de datos), st1 (HDD optimizado para rendimiento para lecturas secuenciales).

Conceptos clave: Instantáneas (incrementales, almacenadas en S3), cifrado (KMS), Multi-Attach (solo io1/io2), aprovisionamiento de IOPS y rendimiento.

Señal del examen: "Almacenamiento persistente para EC2", "almacenamiento de bases de datos", "requiere acceso en bloque de baja latencia" → EBS.

---

**EFS — Elastic File System** *(Capítulo 6)*

Sistema de archivos compartido, accesible desde múltiples instancias de EC2 simultáneamente. Protocolo NFS. Escala automáticamente. Más caro que EBS por GB. Las clases de almacenamiento incluyen Standard, Infrequent Access y Archive. Intelligent-Tiering mueve los archivos automáticamente.

Señal del examen: "Sistema de archivos compartido", "múltiples instancias de EC2 necesitan los mismos archivos", "NFS" → EFS.

---

**Familia FSx** *(Capítulo 6)*

Servidores de archivos gestionados para tecnologías específicas. FSx for Windows File Server: protocolo SMB, NTFS, integración con Active Directory, Multi-AZ. FSx for Lustre: sistema de archivos paralelo de alto rendimiento para HPC/ML, presenta los objetos de S3 como archivos (carga diferida). FSx for NetApp ONTAP: multiprotocolo (NFS + SMB + iSCSI), instantáneas, replicación SnapMirror. FSx for OpenZFS: NFS de baja latencia, instantáneas instantáneas y clones con permisos de escritura.

Señal del examen: "SMB/Active Directory" → FSx for Windows. "Entrenamiento HPC/ML sobre datos de S3" → FSx for Lustre. "NFS y SMB sobre los mismos datos / migración de NetApp" → FSx for ONTAP. "Migración de ZFS / clones instantáneos" → FSx for OpenZFS.

---

**Clases de Almacenamiento de S3 y Políticas de Ciclo de Vida** *(Capítulo 23)*

S3 Intelligent-Tiering mueve automáticamente los objetos entre niveles de acceso según la frecuencia de acceso. Las políticas de ciclo de vida hacen la transición de objetos entre clases (Standard → Standard-IA → Glacier) según reglas de antigüedad. Las clases de almacenamiento Glacier tienen un retraso de recuperación que va de milisegundos (Glacier Instant Retrieval) a 12 horas (Glacier Deep Archive).

Señal del examen: "Reducir costos de almacenamiento para datos de acceso infrecuente" → políticas de ciclo de vida, Intelligent-Tiering o Glacier.

---

**AWS Storage Gateway** *(Capítulo 6)*

Servicio de almacenamiento híbrido que conecta los entornos locales con el almacenamiento de AWS. Presenta el almacenamiento mediante los protocolos que las aplicaciones ya entienden, mientras persiste los datos en S3, S3 Glacier o como instantáneas de EBS.

Conceptos clave: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, modo en caché o almacenado), Tape Gateway (biblioteca de cintas virtuales → Glacier).

Señal del examen: "Una aplicación local necesita almacenamiento en la nube sin cambios de código" → Storage Gateway. "Reemplazar copias de seguridad en cinta" → Tape Gateway.

---

**AWS DataSync** *(Capítulo 25)*

Servicio de migración y replicación de datos basado en agentes. Un agente ligero se conecta a servidores de archivos locales mediante NFS o SMB y sincroniza los recursos compartidos hacia S3, EFS o FSx, con programación, limitación de ancho de banda y verificación de integridad integradas.

Conceptos clave: Agente de DataSync (VM en las instalaciones o EC2), orígenes NFS/SMB, destinos S3/EFS/FSx, transferencias incrementales programadas.

Señal del examen: "Migrar o sincronizar continuamente grandes cantidades de archivos desde un NAS local hacia AWS a través de la red" → DataSync.

---

**AWS Transfer Family** *(Capítulo 25)*

Servidor SFTP, FTPS y FTP completamente gestionado, respaldado por S3 o EFS como destino de almacenamiento. Los clientes se conectan con su software SFTP existente; los archivos cargados aterrizan directamente en un bucket o sistema de archivos.

Conceptos clave: Endpoint gestionado (opcionalmente con IP estática), almacenamiento de respaldo en S3 o EFS, compatibilidad con protocolos existentes para socios externos.

Señal del examen: "Los socios deben seguir cargando vía SFTP, pero los archivos deben aterrizar en S3" → Transfer Family.

---

**AWS Snow Family** *(Capítulo 25)*

Dispositivos físicos de transferencia de datos para la migración masiva de datos sin conexión. Snowball Edge Storage Optimized: 80 TB utilizables, carcasa reforzada, se envía a tu ubicación; cargas los datos localmente y lo devuelves para su ingesta en S3.

Conceptos clave: Haz primero el cálculo de la transferencia: si la transferencia por red tardara aproximadamente una semana o más, gana un dispositivo físico. *Nota heredada (2026)*: AWS ha estado retirando la familia: Snowmobile (2024) y Snowcone (finales de 2024) ya no existen, y los dispositivos Snow se cerraron a nuevos clientes en noviembre de 2025 (AWS ahora apunta a DataSync y a las Data Transfer Terminals). El banco de preguntas del SAA-C03 es anterior a esto, por lo que el examen todavía espera Snowball como respuesta.

Señal del examen: "Migración a escala de petabytes", "ancho de banda limitado, semanas de tiempo de transferencia" → Snow Family.

---

**AWS Backup** *(Capítulos 18 y 23)*

Servicio de copias de seguridad centralizado y basado en políticas, a través de EBS, RDS, DynamoDB, EFS y Storage Gateway. Los planes de copia de seguridad definen los horarios y la retención; los almacenes (vaults) guardan los puntos de recuperación.

Conceptos clave: Planes de copia de seguridad y almacenes, copias entre regiones y entre cuentas, Vault Lock para inmutabilidad.

Señal del examen: "Centralizar y automatizar copias de seguridad en múltiples servicios de AWS", "copias de seguridad entre cuentas para protección contra ransomware/compromiso de cuenta" → AWS Backup.

---

## Bases de Datos

**RDS — Relational Database Service** *(Capítulo 8)*

Bases de datos relacionales gestionadas. Motores compatibles: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server y Aurora (el motor propio de AWS). AWS gestiona las copias de seguridad, los parches, el failover y la replicación. Tú gestionas el diseño del esquema, las consultas y el dimensionamiento de las instancias.

Conceptos clave: Despliegue Multi-AZ (failover automático, replicación sincrónica), Réplicas de Lectura (asincrónicas, para escalado de lectura), copias de seguridad automatizadas (retención de 1 a 35 días), instantáneas manuales (conservadas hasta su eliminación), RDS Proxy (agrupación de conexiones).

Señal del examen: "Base de datos relacional", "transacciones ACID", "carga de trabajo SQL existente" → RDS o Aurora.

---

**Aurora** *(Capítulo 24)*

El motor de base de datos relacional de AWS, compatible con MySQL y PostgreSQL. Motor de almacenamiento distribuido que replica los datos en 3 AZs en 6 copias. Típicamente 5 veces más rápido que MySQL. Aurora Serverless v2 escala la capacidad automáticamente (medida en ACUs: Aurora Capacity Units) y, en las versiones de motor compatibles, puede pausarse automáticamente hasta 0 ACUs cuando no hay conexiones abiertas.

Conceptos clave: Clúster de Aurora (escritor + hasta 15 Aurora Replicas detrás de un único endpoint de lectura), Aurora Global Database (réplicas de lectura entre regiones con menos de 1 segundo de retraso de replicación), Aurora Serverless v2, ACUs, comportamiento de pausa/reanudación automática.

Señal del examen: "Base de datos relacional de alto rendimiento", "compatible con MySQL/PostgreSQL", "lecturas globales", "carga de trabajo variable" → Aurora.

---

**DynamoDB** *(Capítulo 9)*

Base de datos NoSQL completamente gestionada. Modelo de clave-valor y documento. Escala a cualquier rendimiento con un rendimiento de milisegundos de un solo dígito. Dos modos de capacidad: bajo demanda (paga por solicitud) y aprovisionado (paga por unidad de capacidad por hora, con Auto Scaling).

Conceptos clave: Clave de partición (obligatoria), clave de ordenamiento (opcional), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (captura de cambios de datos), DynamoDB Accelerator (DAX) — caché en memoria, TTL (Time to Live), transacciones.

Señal del examen: "Acceso de alto rendimiento basado en claves", "esquema flexible", "NoSQL sin servidor" → DynamoDB.

---

**ElastiCache** *(Capítulo 10)*

Caché en memoria gestionado. Dos motores: Redis (persistente, pub/sub, scripting Lua, estructuras de datos) y Memcached (caché puro, más simple, multihilo). Úsalo para reducir la carga de la base de datos y servir datos de lectura frecuente en microsegundos.

Conceptos clave: Patrón cache-aside, patrón write-through, políticas de expulsión, TTL, modo de clúster (Redis), Multi-AZ con failover automático.

Señal del examen: "Reducir la carga de la base de datos", "latencia de lectura de submilisegundos", "gestión de sesiones", "tabla de clasificación en tiempo real" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Capítulo 10)*

Base de datos primaria en memoria, durable y compatible con Redis. A diferencia de ElastiCache (que es un caché donde la pérdida de datos es aceptable), MemoryDB almacena un registro de transacciones Multi-AZ y garantiza la durabilidad. Puedes usar MemoryDB como tu base de datos primaria, no solo como un caché frente a otra base de datos.

Conceptos clave: Compatibilidad con la API de Redis, registro de transacciones Multi-AZ (garantía de durabilidad), rendimiento en memoria, base de datos primaria (no una capa de caché).

Señal del examen: "Compatible con Redis Y la pérdida de datos no es aceptable", "base de datos en memoria durable" → MemoryDB. "Redis como caché, pérdida de datos aceptable" → ElastiCache Redis.

---

**Bases de Datos Especializadas** *(Capítulos 9, 10 y 24)*

Ajusta la forma de los datos al motor. DocumentDB: documentos compatibles con MongoDB. Neptune: base de datos de grafos (relaciones, recorridos — Gremlin/SPARQL). Keyspaces: columnas anchas compatibles con Cassandra. Timestream: series temporales (oferta actual: Timestream for InfluxDB). MemoryDB: base de datos *primaria* durable y compatible con Redis (vs. ElastiCache = caché). QLDB ("registro criptográfico inmutable") se descontinuó en 2025: trátalo como un distractor heredado.

Señal del examen: "grafo social / recomendaciones / anillos de fraude" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "telemetría IoT a lo largo del tiempo" → Timestream.

---

**AWS DMS — Database Migration Service** *(Capítulo 8)*

Migra bases de datos a AWS con un tiempo de inactividad mínimo. Admite carga completa (copia inicial) más CDC (Change Data Capture) para mantener el origen y el destino sincronizados mientras se ejecuta la migración. Al migrar entre el mismo tipo de motor (MySQL → MySQL, PostgreSQL → PostgreSQL), usa DMS directamente. Al migrar entre distintos tipos de motor (Oracle → Aurora PostgreSQL), usa primero la AWS Schema Conversion Tool (SCT) para convertir el esquema, y luego DMS para los datos.

Conceptos clave: Instancia de replicación, endpoints de origen y destino, carga completa + CDC, SCT (Schema Conversion Tool) para migraciones heterogéneas.

Señal del examen: "Migrar una base de datos con un tiempo de inactividad mínimo" → DMS. "Oracle a Aurora" o cualquier migración heterogénea → SCT + DMS. "Mismo motor, mismo tipo" → DMS directo.

---

## Redes

**VPC — Virtual Private Cloud** *(Capítulo 11)*

Una red aislada dentro de AWS. Abarca todas las AZs de una región. Defines el espacio de direcciones IP (bloque CIDR), creas subredes (públicas o privadas), configuras tablas de enrutamiento y controlas el acceso mediante grupos de seguridad y NACLs.

Conceptos clave: Subred pública (ruta hacia el Internet Gateway), subred privada (ruta hacia el NAT Gateway para tráfico saliente), Internet Gateway (entrante + saliente hacia internet), NAT Gateway (solo saliente para instancias privadas), VPC Peering (conectar dos VPCs), VPC Endpoints (conectar a servicios de AWS sin internet).

Señal del examen: "Red privada en AWS", "aislar recursos de internet", "controlar el tráfico de red" → VPC.

---

**Grupos de Seguridad y NACLs** *(Capítulo 15)*

Los grupos de seguridad son firewalls con estado a nivel de instancia: solo reglas de permiso, el tráfico de retorno es automático. Las NACLs (Network Access Control Lists) son firewalls sin estado a nivel de subred: requieren reglas tanto de entrada como de salida, evaluadas en orden por número de regla.

Señal del examen: "Bloquear una IP específica para que no acceda a la subred" → NACL. "Controlar el tráfico hacia/desde una instancia" → grupo de seguridad.

---

**Route 53** *(Capítulo 12)*

El servicio de DNS y registrador de dominios de AWS. Enruta el tráfico de internet hacia recursos de AWS y endpoints externos. Políticas de enrutamiento: Simple, Ponderado, Basado en latencia, Failover, Geolocalización, Geoproximidad, Respuesta de múltiples valores.

Conceptos clave: Zonas alojadas (públicas y privadas), tipos de registro (A, AAAA, CNAME, Alias), verificaciones de estado, Traffic Flow (editor visual de políticas — ten en cuenta que la geoproximidad también está disponible como política de enrutamiento directa en los registros, con un sesgo ajustable, sin necesidad de Traffic Flow).

Señal del examen: "Enrutamiento DNS", "failover entre regiones", "enrutar según latencia o ubicación" → Route 53 con la política de enrutamiento apropiada.

---

**CloudFront** *(Capítulo 13)*

Red de Entrega de Contenido (CDN). Almacena contenido en caché en ubicaciones de borde (más de 750 puntos de presencia en todo el mundo). Reduce la latencia para los usuarios finales. Reduce los costos de transferencia desde el origen mediante el almacenamiento en caché. Se integra con S3, EC2, ALB y API Gateway como orígenes.

Conceptos clave: Distribución, orígenes, comportamientos (enrutamiento basado en rutas hacia los orígenes), TTL (control de caché), invalidación de caché, URLs y cookies firmadas (control de acceso), Lambda@Edge y CloudFront Functions (ejecutar código en el borde), Origin Shield (reducir la carga del origen).

Señal del examen: "Baja latencia global", "almacenar contenido estático en caché", "reducir la carga del origen", "proteger contra DDoS con Shield" → CloudFront.

---

**Direct Connect y VPN** *(Capítulo 25)*

AWS Direct Connect es una conexión de red física dedicada desde tu centro de datos local hacia AWS. Evita la internet pública. Ancho de banda y latencia más consistentes. AWS Site-to-Site VPN es un túnel cifrado sobre la internet pública: más rápido de configurar, de menor costo, pero con rendimiento variable.

Conceptos clave: Virtual Interface (VIF), Direct Connect Gateway (conectar a múltiples regiones), Transit Gateway (topología de red en estrella), redundancia de túneles VPN.

Señal del examen: "Conexión privada dedicada a AWS" → Direct Connect. "Conexión cifrada, configuración más rápida" → VPN. "Conectar múltiples VPCs" → Transit Gateway.

---

**VPC Endpoints** *(Capítulo 30)*

Conectan recursos privados con servicios de AWS sin usar la internet pública ni un NAT Gateway. Gateway Endpoints: gratuitos, disponibles solo para S3 y DynamoDB. Interface Endpoints (PrivateLink): tarifados por hora + por GB, disponibles para la mayoría de los servicios de AWS.

Señal del examen: "EC2 en subred privada llama a S3/DynamoDB — reducir costos del NAT Gateway" → Gateway Endpoint (gratuito). "Conexión privada a SQS, SSM, Secrets Manager desde una subred privada" → Interface Endpoint.

---

**AWS Client VPN** *(Capítulo 11)*

Endpoint de OpenVPN gestionado que permite que dispositivos individuales (laptops, estaciones de trabajo) se conecten de forma segura a una VPC a través de internet. Opciones de autenticación: Active Directory, federación SAML 2.0 con un proveedor de identidad o TLS mutuo (basado en certificados). Admite split-tunnel (solo el tráfico destinado a la VPC pasa por el túnel) y full-tunnel (todo el tráfico se enruta a través de AWS).

Conceptos clave: Endpoint de Client VPN, red de destino (asociación de subred de la VPC), reglas de autorización, split-tunnel vs. full-tunnel.

Señal del examen: "Ingenieros remotos necesitan acceso seguro a una VPC desde casa", "conectividad de dispositivo individual a VPC" → Client VPN. Contraste: Site-to-Site VPN = red a red. Client VPN = dispositivo a red.

---

**Network Load Balancer (NLB) y Gateway Load Balancer (GWLB)** *(Capítulo 7)*

El NLB opera en la Capa 4 (TCP/UDP/TLS): sin inspección HTTP, solo enrutamiento de paquetes a velocidad extrema — millones de solicitudes por segundo, con una IP estática por AZ y preservación de la IP de origen. El GWLB opera en la Capa 3 y existe para un solo propósito: insertar dispositivos de red virtuales de terceros (firewalls, IDS/IPS, inspección profunda de paquetes) en línea dentro de los flujos de tráfico.

Conceptos clave: NLB = Capa 4, IPs estáticas, latencia ultrabaja, protocolos no HTTP. GWLB = Capa 3, encapsulación GENEVE, flotas de dispositivos detrás de un único punto de entrada. ALB = Capa 7 (enrutamiento por ruta/host).

Señal del examen: "Millones de solicitudes TCP por segundo", "IP estática para el balanceador de carga", "preservar la IP de origen" → NLB. "Insertar dispositivos de seguridad de terceros en la ruta del tráfico" → GWLB.

---

**AWS Global Accelerator** *(Capítulo 25)*

Enruta el tráfico de los usuarios hacia la red troncal global privada de AWS en la ubicación de borde más cercana, en lugar de cruzar la internet pública. Proporciona dos direcciones IP Anycast estáticas que dan fachada a tus ALBs, NLBs o instancias EC2 en una o más regiones. Mejora la latencia y la consistencia para el tráfico *dinámico* (no almacenable en caché).

Conceptos clave: IPs Anycast estáticas, incorporación de borde a la red troncal de AWS, failover regional basado en verificaciones de estado en segundos, grupos de endpoints con diales de tráfico.

Señal del examen: "Usuarios globales, tráfico dinámico/no HTTP, IP estática, failover regional rápido" → Global Accelerator. "Contenido almacenable en caché/estático" → CloudFront en su lugar.

---

## Seguridad e Identidad

**IAM — Identity and Access Management** *(Capítulos 3 y 14)*

Controla quién puede hacer qué en tu cuenta de AWS. Usuarios (credenciales de largo plazo), Grupos (usuarios que comparten permisos), Roles (credenciales temporales para servicios y acceso entre cuentas), Políticas (documentos JSON que definen reglas de permiso/denegación).

Conceptos clave: Principal, Acción, Recurso, Condición, denegación explícita > permiso explícito > denegación implícita, SCP (Service Control Policy en AWS Organizations), Permission boundary, AssumeRole.

Señal del examen: IAM está involucrado en cada pregunta de seguridad. Patrón clave: los servicios usan roles de IAM (no usuarios). El acceso entre cuentas usa la asunción de roles. Mínimo privilegio: otorga solo lo que se requiere.

---

**KMS — Key Management Service** *(Capítulo 16)*

Servicio gestionado de claves de cifrado. Crea, almacena y controla claves criptográficas. Las claves administradas por el cliente (CMKs) te permiten definir la rotación, el uso y las políticas de acceso. Las claves administradas por AWS se gestionan automáticamente.

Conceptos clave: Política de clave (separada de la política de IAM), Cifrado de sobre (los datos se cifran con una clave de datos; la clave de datos se cifra con la CMK), Rotación automática de claves, Claves multirregión, Concesiones (Grants).

Señal del examen: "Cifrar datos en reposo", "claves de cifrado administradas por el cliente", "rotación de claves" → KMS.

---

**Secrets Manager** *(Capítulo 16)*

Almacena y rota automáticamente valores sensibles: credenciales de bases de datos, claves de API, tokens OAuth. Se integra con RDS para la rotación automática de contraseñas. Las aplicaciones recuperan los secretos en tiempo de ejecución vía API: nunca codifiques credenciales en el código.

Señal del examen: "Almacenar y rotar credenciales de base de datos", "evitar secretos codificados en el código" → Secrets Manager. "Almacenar valores de configuración, no secretos" → Parameter Store (SSM).

---

**AWS Shield** *(Capítulo 17)*

Protección contra DDoS. Shield Standard es automático y gratuito: protege contra ataques volumétricos y de protocolo comunes. Shield Advanced agrega protección financiera, un equipo de respuesta a DDoS 24/7 y visibilidad detallada de los ataques.

Señal del examen: "Proteger contra DDoS" → Shield Standard (automático) o Shield Advanced (empresarial, con SLA).

---

**WAF — Web Application Firewall** *(Capítulo 17)*

Filtra el tráfico HTTP/HTTPS según reglas: bloqueos de IP, límites de tasa, patrones de inyección SQL, patrones de XSS, restricciones geográficas, reglas personalizadas. Se adjunta a CloudFront, ALB, API Gateway o AppSync.

Señal del examen: "Bloquear direcciones IP específicas", "prevenir inyección SQL en el borde", "limitar la tasa de llamadas a la API" → WAF.

---

**GuardDuty** *(Capítulo 17)*

Servicio de detección de amenazas. Analiza los registros de CloudTrail, los VPC Flow Logs y los registros de DNS mediante ML e inteligencia de amenazas. Detecta actividad inusual de API, comunicación con IPs maliciosas conocidas, credenciales comprometidas.

Señal del examen: "Detectar actividad inusual", "identificar credenciales de IAM comprometidas", "monitoreo continuo de amenazas" → GuardDuty.

---

**Amazon Inspector** *(Capítulo 17)*

Servicio automatizado de evaluación de vulnerabilidades. Escanea continuamente instancias de EC2, imágenes de contenedores de Amazon ECR y funciones de Lambda en busca de vulnerabilidades de software (CVEs) y exposición de red no intencionada. Los hallazgos se envían a AWS Security Hub para una gestión centralizada.

Conceptos clave: Escaneo de CVE, evaluación continua (no de una sola vez), cobertura de EC2 + ECR + Lambda, integración con Security Hub.

Señal del examen: "Escanear automáticamente EC2 en busca de vulnerabilidades conocidas", "escaneo de CVE para imágenes de contenedores", "evaluación continua de vulnerabilidades" → Inspector.

---

**Amazon Cognito** *(Capítulo 14)*

Autenticación gestionada para los usuarios finales de tu aplicación: un directorio de usuarios que no tienes que construir. Los User Pools gestionan el registro, el inicio de sesión, el MFA, el restablecimiento de contraseñas y los proveedores de identidad social (Google, Facebook, cualquier proveedor OIDC), emitiendo JWTs que tu aplicación valida. Los Identity Pools intercambian esos tokens por credenciales temporales de AWS.

Conceptos clave: User Pool (autenticación, JWTs) vs. Identity Pool (credenciales temporales de AWS), UI alojada, federación social/OIDC/SAML, autorizador Cognito de API Gateway.

Señal del examen: "La aplicación necesita registro/inicio de sesión de usuarios", "inicio de sesión social", "dar a los usuarios de una app móvil acceso temporal a recursos de AWS" → Cognito. Contraste: IAM es para tus ingenieros y servicios; Cognito es para tus clientes.

---

**AWS Certificate Manager (ACM)** *(Capítulo 16)*

Aprovisiona certificados TLS/SSL públicos gratuitos para servicios gestionados por AWS (ALB, CloudFront, API Gateway) y gestiona todo el ciclo de vida: sin calendario de renovación, sin manejo de claves privadas. Se renueva automáticamente mediante validación por DNS.

Conceptos clave: Validación por DNS vs. por correo electrónico, renovación automática, los certificados para CloudFront deben estar en us-east-1, los certificados públicos gratuitos no se pueden exportar (existe una opción exportable de pago desde 2025).

Señal del examen: "HTTPS en un balanceador de carga o CDN", "renovación automática de certificados" → ACM.

---

**Amazon Macie** *(Capítulo 17)*

Descubrimiento de datos sensibles para S3. Usa aprendizaje automático y coincidencia de patrones para encontrar PII (nombres, números de tarjeta, credenciales) en los buckets y señala riesgos de acceso como la exposición pública. Complementa a GuardDuty: GuardDuty observa el comportamiento; Macie audita lo que está almacenado.

Conceptos clave: Identificadores de datos gestionados (patrones de PII), alcance limitado a S3, hallazgos hacia Security Hub/EventBridge.

Señal del examen: "Descubrir PII en S3", "identificar exposición de datos sensibles" → Macie.

---

**AWS Control Tower** *(Capítulo 14)*

Automatiza la configuración y el gobierno de un entorno multicuenta. Crea una landing zone — cuentas de gestión, archivo de registros y auditoría precableadas con Organizations, CloudTrail, Config y guardrails — en minutos, en lugar de días de cableado manual.

Conceptos clave: Landing zone, guardrails (preventivos = SCPs, detectivos = reglas de Config), Account Factory para nuevas cuentas estandarizadas.

Señal del examen: "Configurar y gobernar un nuevo entorno multicuenta con mejores prácticas automáticamente" → Control Tower. Contraste: Organizations es el bloque de construcción básico; Control Tower es el ensamblaje automatizado.

---

## Mensajería y Procesamiento de Eventos

**SQS — Simple Queue Service** *(Capítulo 19)*

Cola de mensajes gestionada. Los productores envían mensajes; los consumidores los leen y los eliminan. Desacopla servicios: el emisor no necesita saber si el receptor está disponible. Colas estándar: entrega al menos una vez, ordenamiento de mejor esfuerzo. Colas FIFO: procesamiento exactamente una vez, ordenamiento estricto.

Conceptos clave: Tiempo de espera de visibilidad (el mensaje se oculta de otros consumidores mientras se procesa), Dead Letter Queue (DLQ) para mensajes que fallan repetidamente, Retención de mensajes (4 días por defecto, hasta 14), Sondeo largo (reduce las respuestas vacías), Carga máxima de 256 KB por defecto (ampliable a 1 MiB desde 2025; para cargas mayores, la Extended Client Library almacena el cuerpo en S3).

Señal del examen: "Desacoplar servicios", "amortiguar solicitudes durante picos de carga", "procesamiento asíncrono" → SQS. "El orden importa y se requiere exactamente una vez" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Capítulo 19)*

Servicio pub/sub gestionado. Los publicadores envían un mensaje a un tema; todos los suscriptores reciben una copia. Patrón de fan-out: un mensaje → muchos consumidores. Protocolos: SQS, Lambda, HTTP/HTTPS, correo electrónico, SMS, notificaciones push móviles.

Conceptos clave: Tema, suscripción, patrón de fan-out (SNS → múltiples colas SQS), filtrado de mensajes (los suscriptores reciben solo los mensajes coincidentes).

Señal del examen: "Enviar notificaciones a múltiples endpoints simultáneamente", "distribuir un solo evento a múltiples consumidores" → SNS. Patrón común: SNS + SQS para fan-out durable.

---

**EventBridge** *(Capítulo 22)*

Bus de eventos para construir arquitecturas basadas en eventos. Enruta eventos desde servicios de AWS, socios SaaS y fuentes personalizadas hacia Lambda, SQS, SNS, Step Functions y otros destinos. Admite reglas programadas (cron) y coincidencia de patrones.

Señal del examen: "Enrutar eventos desde servicios de AWS hacia destinos", "programar funciones de Lambda", "orquestación basada en eventos" → EventBridge.

---

**Step Functions** *(Capítulo 22)*

Orquestación de flujos de trabajo sin servidor. Coordina funciones de Lambda, tareas de ECS, DynamoDB, SNS, SQS y otros servicios en máquinas de estados visuales. Gestiona los reintentos, el manejo de errores, las ramas paralelas y los estados de espera.

Conceptos clave: Máquina de estados, tipos de estado (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (exactamente una vez, larga duración) vs. Express Workflows: Asíncronos (al menos una vez, alto volumen — diseña las tareas para que sean idempotentes) y Síncronos (a lo sumo una vez, devuelven el resultado directamente como una llamada a la API).

Señal del examen: "Orquestar múltiples funciones de Lambda", "flujos de trabajo de larga duración con lógica de reintentos", "pasos de aprobación humana" → Step Functions.

---

**Kinesis** *(Capítulo 26)*

Transmisión de datos en tiempo real. Kinesis Data Streams: flujo durable y ordenado de registros (como un registro de confirmación distribuido). Los consumidores procesan los registros; los datos se retienen de 24 horas (por defecto) a 365 días (con Extended Data Retention). Amazon Data Firehose (anteriormente Kinesis Data Firehose): entrega completamente gestionada a S3, Redshift, OpenSearch, Splunk — sin necesidad de gestionar consumidores.

Conceptos clave: Shard (unidad de rendimiento: 1 MB/s de escritura, 2 MB/s de lectura), clave de partición (determina la asignación de shard), número de secuencia, checkpointing (KCL o Lambda), Firehose vs. Streams.

Señal del examen: "Transmisión en tiempo real", "registros ordenados", "reproducir eventos" → Kinesis Data Streams. "Entregar datos en streaming a S3/Redshift sin gestionar consumidores" → Amazon Data Firehose (las preguntas más antiguas pueden decir "Kinesis Data Firehose"). "SQL sobre datos en streaming" → Amazon Managed Service for Apache Flink (anteriormente Kinesis Data Analytics). Contraste con SQS: Kinesis retiene y reproduce; SQS elimina al consumir.

---

**Amazon MQ** *(Capítulo 19)*

Servicio de broker de mensajes gestionado que admite Apache ActiveMQ y RabbitMQ. Admite protocolos de mensajería estándar de la industria: AMQP, STOMP, MQTT, OpenWire y WebSocket. El caso de uso principal es la migración lift-and-shift de cargas de trabajo de brokers de mensajes locales: las aplicaciones que ya usan ActiveMQ o RabbitMQ pueden conectarse sin cambios de código.

Conceptos clave: Elección de motor ActiveMQ vs. RabbitMQ, soporte de protocolos (AMQP/STOMP/MQTT), configuración de broker de instancia única o activo/en espera para alta disponibilidad.

Señal del examen: "Migrar ActiveMQ o RabbitMQ local a AWS sin cambiar el código de la aplicación" → Amazon MQ. "Mensajería nativa de AWS desde cero" → SQS o SNS (más simples, más escalables).

---

## Analítica

**Athena** *(Capítulo 26)*

Consultas SQL sin servidor sobre datos almacenados en S3. Sin infraestructura que gestionar. Paga por consulta (por TB escaneado). Funciona mejor con formatos columnares (Parquet, ORC) y datos particionados.

Señal del examen: "Consultar datos de S3 con SQL", "analítica ad-hoc sobre un lago de datos", "sin gestión de infraestructura" → Athena.

---

**Glue** *(Capítulo 26)*

Servicio de ETL (Extract, Transform, Load) sin servidor. Los Glue Crawlers descubren datos y actualizan el Glue Data Catalog. Los Glue Jobs ejecutan transformaciones de Spark o Python. El Data Catalog se integra con Athena, Redshift Spectrum y EMR.

Señal del examen: "Transformar y cargar datos para analítica", "descubrir el esquema de datos de S3", "pipeline ETL" → Glue.

---

**Amazon QuickSight** *(Capítulo 26)*

Servicio gestionado de inteligencia de negocios y visualización de datos. Usa SPICE (Super-fast, Parallel, In-memory Calculation Engine), un motor en memoria que almacena en caché los datos importados para un renderizado rápido de dashboards. Se conecta a Athena, S3, Redshift, RDS y otras fuentes de datos de AWS. Sin servidor de BI que gestionar.

Conceptos clave: SPICE (motor en memoria), conjuntos de datos, análisis, dashboards, ML Insights (detección de anomalías, pronósticos), seguridad a nivel de fila y de columna.

Señal del examen: "Dashboard de BI en AWS sin gestionar un servidor", "visualizar datos de Athena o Redshift" → QuickSight.

---

**AWS Lake Formation** *(Capítulo 26)*

Capa centralizada de control de acceso para lagos de datos sobre S3 y el Glue Data Catalog. Proporciona permisos granulares a nivel de tabla, columna y fila — más granulares que las políticas de bucket de S3 por sí solas. Simplifica la configuración de un lago de datos seguro: Lake Formation gestiona el modelo de permisos; Glue gestiona el catálogo; S3 contiene los datos.

Conceptos clave: Permisos de lago de datos (a nivel de tabla/columna/fila), integración con el Glue Data Catalog, LF-tags para control de acceso basado en atributos, otorgamiento/revocación centralizada para consultas de Athena y Redshift Spectrum.

Señal del examen: "Control de acceso granular en un lago de datos", "seguridad a nivel de columna o de fila sobre datos de S3" → Lake Formation.

---

## Alta Disponibilidad y Recuperación ante Desastres

**Multi-AZ y Multi-Región** *(Capítulo 18)*

Multi-AZ: replicación sincrónica dentro de una región para failover automático (RDS Multi-AZ, balanceador de carga entre AZs). RPO ~0, RTO ~60s para RDS. Multi-Región: replicación asincrónica para redundancia geográfica y menor latencia para usuarios globales.

Conceptos clave: RTO (Recovery Time Objective — cuánto tiempo se tarda en recuperar), RPO (Recovery Point Objective — cuántos datos se pueden perder). Estrategias de DR Pilot Light, Warm Standby, Activo-Activo.

Señal del examen: Distingue entre fallas a nivel de AZ (Multi-AZ las maneja) vs. fallas regionales (Multi-Región las maneja). El costo y la complejidad aumentan significativamente con Multi-Región.

---

**AWS Elastic Disaster Recovery (DRS)** *(Capítulo 18)*

Recuperación ante desastres gestionada para servidores (locales o EC2). Replica continuamente los servidores de origen bloque por bloque en un área de preparación de bajo costo y lanza instancias de recuperación completas en minutos cuando se necesita — un pilot light gestionado: tiempos de recuperación cercanos a warm standby a precios cercanos a backup-and-restore.

Conceptos clave: Replicación continua a nivel de bloque, área de preparación de bajo costo, lanzamiento de recuperación bajo demanda, recuperación a un punto en el tiempo.

Señal del examen: "Minimizar el tiempo de inactividad y la pérdida de datos para cargas de trabajo basadas en servidores con un servicio de DR gestionado", "pilot light sin construirlo tú mismo" → DRS.

---

## Optimización de Costos

**Modelos de Precios de EC2** *(Capítulo 27)*

Bajo demanda: precio completo, sin compromiso. Instancias Reservadas (1 o 3 años): 30-72% de descuento para un tipo de instancia específico. Savings Plans (Compute o EC2 Instance): gasto por hora comprometido a cambio de flexibilidad. Spot: 60-90% de descuento para cargas de trabajo interrumpibles.

Señal del examen: "Minimizar el costo para una carga de trabajo predecible" → Savings Plans o Instancias Reservadas. "Procesamiento por lotes tolerante a fallos" → Spot. "Impredecible o de corto plazo" → bajo demanda.

---

**Precios de Transferencia de Datos** *(Capítulo 30)*

Entrante a AWS: gratis. Misma AZ: gratis. Entre AZs: $0.01/GB en cada dirección. Entre regiones: $0.02-0.08/GB. Internet (saliente): ~$0.09/GB. Procesamiento de NAT Gateway: $0.045/GB. La transferencia de datos de CloudFront es más barata que la transferencia directa de EC2 a internet, y el almacenamiento en caché reduce el volumen total.

Señal del examen: "Reducir costos de transferencia de datos para S3/DynamoDB desde una subred privada" → Gateway Endpoints (gratuitos). "Reducir costos de NAT Gateway para otros servicios" → Interface Endpoints.

---

## Observabilidad

**CloudWatch** *(referenciado a lo largo del libro)*

Monitoreo y observabilidad. CloudWatch Metrics: datos numéricos de series temporales de servicios de AWS y aplicaciones personalizadas. CloudWatch Logs: recopila, busca y analiza datos de registro. CloudWatch Alarms: activa notificaciones o escalado automático según umbrales de métricas. CloudWatch Dashboards: visualiza métricas.

Conceptos clave: Dimensiones de métricas, períodos de retención, grupos de registros y flujos de registros, filtros de métricas, CloudWatch Agent (para métricas y registros a nivel de SO desde EC2), Container Insights.

---

**CloudTrail** *(referenciado a lo largo del libro)*

Registra cada llamada a la API realizada en tu cuenta de AWS: quién la hizo, desde dónde, cuándo y cuál fue la respuesta. Un trail multirregión almacena los registros en S3 indefinidamente. Se usa para auditoría de seguridad, cumplimiento e investigación de incidentes.

Señal del examen: "¿Quién eliminó ese recurso?" "Auditar toda la actividad de la API" → CloudTrail.

---

**X-Ray** *(Capítulo 20)*

Trazado distribuido: sigue solicitudes individuales a través de los servicios (trazas → segmentos → subsegmentos), construye un mapa de servicios con latencia y tasas de error por salto. El muestreo mantiene baja la sobrecarga; las anotaciones hacen que las trazas sean buscables. El trazado activo se activa en las etapas de Lambda y API Gateway.

Señal del examen: "Trazar solicitudes a través de microservicios", "encontrar el cuello de botella entre servicios" → X-Ray (no CloudWatch, no CloudTrail).

---

**AWS Config** *(referenciado en el Capítulo 31)*

Rastrea los cambios de configuración de los recursos a lo largo del tiempo. Evalúa los recursos frente a reglas de cumplimiento. Registra el historial de cada cambio de configuración de cada recurso. Se integra con Systems Manager para la remediación.

Señal del examen: "¿Este recurso cumple con nuestra política de seguridad?" "¿Cómo se veía la configuración de este recurso la semana pasada?" → AWS Config.

---

## Well-Architected

**Los Seis Pilares** *(Capítulo 31)*

| Pilar                       | Pregunta central                          | Servicios clave                                   |
|-----------------------------|-------------------------------------------|---------------------------------------------------|
| Excelencia Operativa        | ¿Estamos operando bien?                   | CloudWatch, CloudTrail, SSM, Config               |
| Seguridad                   | ¿Estamos protegidos?                      | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Fiabilidad                  | ¿Nos recuperamos de los fallos?           | Multi-AZ, failover de Route 53, backup/restore, SQS |
| Eficiencia del Rendimiento  | ¿Estamos usando los recursos correctos?   | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Optimización de Costos      | ¿Estamos gastando con prudencia?          | Savings Plans, Spot, ciclo de vida de S3, VPC Endpoints |
| Sostenibilidad              | ¿Estamos minimizando el impacto ambiental?| Right-sizing, Graviton, niveles de almacenamiento eficientes |

AWS Well-Architected Tool: evalúa tu arquitectura frente a los seis pilares. Úsala antes del examen para entender el razonamiento detrás de las preguntas de cada pilar.
