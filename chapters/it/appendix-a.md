# Appendice A: Servizi AWS di Riferimento Rapido

Ogni servizio trattato in questo libro, nell'ordine in cui viene introdotto. Usalo come riferimento di studio e come rapida consultazione durante la preparazione all'esame.

---

## Compute

**EC2 — Elastic Compute Cloud** *(Capitolo 4)*

Macchine virtuali nel cloud. Scegli il tipo di istanza (CPU, memoria, storage), il sistema operativo e la regione. Paghi all'ora (On-Demand), per impegno (Reserved Instances / Savings Plans) o per slot di capacità libera (Spot). Il primitivo di compute fondamentale.

Concetti chiave: AMI (Amazon Machine Image), tipi di istanza (famiglie t3, m6g, r6g, c6g), key pair, instance profile, placement group.

Segnale d'esame: Quando uno scenario richiede compute persistente, con stato o a lunga durata — EC2 o ECS. Quando uno scenario richiede compute a breve durata, attivato da eventi o a costo-zero in idle — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Capitolo 7)*

Gli Auto Scaling Group (ASG) aggiungono e rimuovono istanze EC2 in base al carico. Gli Application Load Balancer (ALB) distribuiscono il traffico tra le istanze e instradano per path o host. Insieme formano lo strato di scalabilità orizzontale.

Concetti chiave: Launch template, policy di scaling (target tracking, step, scheduled), health check, target group ALB, regole del listener, weighted routing.

Segnale d'esame: "Gestire carichi variabili" o "alta disponibilità tra AZ" → ASG + ALB.

---

**Lambda** *(Capitolo 20)*

Funzioni serverless. Scrivi il codice; AWS lo esegue in risposta a eventi. Nessun server da gestire. Paghi per invocazione e per millisecondo di esecuzione. Scala automaticamente fino a migliaia di esecuzioni concorrenti.

Concetti chiave: Event source (API Gateway, S3, SQS, EventBridge, Kinesis), execution role, limiti di concorrenza, concorrenza riservata e provisioned, cold start, Layer, durata massima di 15 minuti.

Segnale d'esame: "Serverless", "event-driven", "attività a breve durata", "nessun costo in idle" → Lambda.

---

**ECS — Elastic Container Service** *(Capitolo 21)*

Esegue container Docker su AWS. Due launch type: EC2 (gestisci tu l'host) e Fargate (AWS gestisce l'host). ECS si occupa di task definition, service, scheduling del cluster e integrazione con load balancer e service discovery.

Concetti chiave: Task definition, ECS service, Fargate vs. EC2 launch type, ECR (container registry), task IAM role, service auto scaling.

Segnale d'esame: "Workload containerizzati", "microservizi", "Docker su AWS" → ECS (di norma Fargate per container serverless).

---

**EKS — Elastic Kubernetes Service** *(Capitolo 21)*

Kubernetes gestito. AWS esegue il control plane; tu esegui i worker node (EC2 o Fargate). Usa EKS quando il tuo team già utilizza Kubernetes o ha workload che richiedono funzionalità specifiche di Kubernetes.

Segnale d'esame: "Kubernetes", "migrare workload K8s esistenti" → EKS. "Solo container senza l'overhead di K8s" → ECS.

---

**AWS Batch** *(Capitolo 21)*

Compute batch gestito per container Docker. Definisci un job (immagine Docker + comando), una job queue e un compute environment (EC2 o Fargate). AWS Batch provisiona e scala il compute automaticamente, poi lo termina al termine del job. Supporta Spot Instance per ridurre i costi.

Concetti chiave: Job definition (cosa eseguire), job queue (dove i job attendono), compute environment (EC2 o Fargate, On-Demand o Spot), array job (esegue molte copie parallele dello stesso job).

Segnale d'esame: "Elaborazione batch che supera il timeout di 15 minuti di Lambda", "job di compute finiti su container", "workload HPC su AWS" → AWS Batch.

---

**AWS Outposts** *(Capitolo 2)*

Un rack di hardware AWS completamente gestito, installato nel tuo data center o co-location. Esegue gli stessi servizi AWS, API e strumenti del cloud pubblico (EC2, EBS, RDS, EKS, S3 on Outposts) ma fisicamente on-premises.

Concetti chiave: Stesse API AWS on-premises, AWS gestisce installazione e patching, il cliente fornisce spazio rack e alimentazione, Local Gateway (LGW) collega Outposts alle reti on-premises.

Segnale d'esame: "Eseguire AWS nel proprio data center", "la residenza dei dati richiede che il compute rimanga on-premises", "API AWS senza dipendenza da Internet" → Outposts.

---

**AWS Wavelength** *(Capitolo 2)*

Infrastruttura AWS distribuita all'interno delle reti dei provider di telecomunicazioni 5G. Le Wavelength Zone si trovano al margine della rete 5G, abilitando latenza a singola cifra di millisecondi verso i dispositivi mobili.

Concetti chiave: Le Wavelength Zone sono estensioni delle AWS Region all'interno delle reti telecom; il traffico rimane sulla rete del carrier tra il dispositivo e la Wavelength Zone.

Segnale d'esame: "Latenza a singola cifra di millisecondi verso utenti mobili 5G", "AR/VR mobile", "gaming in tempo reale su mobile", "telemetria di veicoli autonomi" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Capitolo 25)*

Servizio di migrazione rehost (lift-and-shift). Un agente replica i dischi dei server sorgente blocco per blocco in un'area di staging a basso costo in AWS; lanci copie di test on-demand; al cutover, MGN converte i server replicati in istanze EC2 native. Non sono necessarie modifiche all'applicazione.

Concetti chiave: Replica continua a livello di blocco, area di staging, lanci di test prima del cutover, le "7 R" delle strategie di migrazione (MGN = rehost).

Segnale d'esame: "Migrare centinaia di VM rapidamente senza modifiche al codice", "lift-and-shift dei server su EC2" → MGN. DataSync sposta *file*; DMS sposta *database*; MGN sposta *interi server*.

---

## Storage

**S3 — Simple Storage Service** *(Capitolo 5)*

Object storage. Capacità illimitata, durabilità del 99,999999999% (undici nove). Memorizza i file come oggetti in bucket. I bucket risiedono in una region. Gli oggetti possono variare da 0 byte a 5 TB.

Concetti chiave: Bucket policy, object ACL, versioning, static website hosting, presigned URL, multipart upload, Transfer Acceleration, classi di storage (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, più S3 Express One Zone per workload directory-bucket a singola AZ e latenza critica).

Segnale d'esame: "Memorizzare e recuperare file", "asset statici", "backup", "data lake" → S3. La classe di storage corretta dipende dalla frequenza di accesso e dalla velocità di recupero.

---

**EBS — Elastic Block Store** *(Capitolo 6)*

Block storage collegato a una singola istanza EC2. Si comporta come un disco rigido. Persiste indipendentemente dal ciclo di vita dell'istanza (puoi scollegarlo e ricollegarlo). Tipi più comuni: gp3 (SSD general purpose, il default), io2 (IOPS provisioned per database), st1 (HDD throughput-optimized per letture sequenziali).

Concetti chiave: Snapshot (incrementali, memorizzati in S3), crittografia (KMS), Multi-Attach (solo io1/io2), provisioning di IOPS e throughput.

Segnale d'esame: "Storage persistente per EC2", "storage per database", "richiede accesso a blocchi a bassa latenza" → EBS.

---

**EFS — Elastic File System** *(Capitolo 6)*

File system condiviso, accessibile da più istanze EC2 contemporaneamente. Protocollo NFS. Scala automaticamente. Più costoso di EBS per GB. Le classi di storage includono Standard, Infrequent Access e Archive. Intelligent-Tiering sposta i file automaticamente.

Segnale d'esame: "File system condiviso", "più istanze EC2 hanno bisogno degli stessi file", "NFS" → EFS.

---

**FSx Family** *(Capitolo 6)*

File server gestiti per tecnologie specifiche. FSx for Windows File Server: protocollo SMB, NTFS, integrazione Active Directory, Multi-AZ. FSx for Lustre: file system ad alte prestazioni parallelo per HPC/ML, presenta gli oggetti S3 come file (lazy loading). FSx for NetApp ONTAP: multi-protocollo (NFS + SMB + iSCSI), snapshot, replica SnapMirror. FSx for OpenZFS: NFS a bassa latenza, snapshot istantanei e clone scrivibili.

Segnale d'esame: "SMB/Active Directory" → FSx for Windows. "HPC/ML training su dati S3" → FSx for Lustre. "NFS e SMB sugli stessi dati / migrazione NetApp" → FSx for ONTAP. "Migrazione ZFS / cloni istantanei" → FSx for OpenZFS.

---

**S3 Storage Classes and Lifecycle Policies** *(Capitolo 23)*

S3 Intelligent-Tiering sposta automaticamente gli oggetti tra livelli di accesso in base alla frequenza di accesso. Le lifecycle policy trasferiscono gli oggetti tra classi (Standard → Standard-IA → Glacier) in base a regole di età. Le classi di storage Glacier hanno ritardi di recupero che vanno da millisecondi (Glacier Instant Retrieval) a 12 ore (Glacier Deep Archive).

Segnale d'esame: "Ridurre i costi di storage per dati a cui si accede raramente" → lifecycle policy, Intelligent-Tiering o Glacier.

---

**AWS Storage Gateway** *(Capitolo 6)*

Servizio di storage ibrido che collega ambienti on-premises allo storage AWS. Presenta lo storage tramite i protocolli già compresi dalle applicazioni, mentre i dati vengono persistiti in S3, S3 Glacier o come snapshot EBS.

Concetti chiave: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, modalità cached o stored), Tape Gateway (virtual tape library → Glacier).

Segnale d'esame: "L'applicazione on-premises ha bisogno di storage cloud senza modifiche al codice" → Storage Gateway. "Sostituire il backup su nastro" → Tape Gateway.

---

**AWS DataSync** *(Capitolo 25)*

Servizio di migrazione e replica dati basato su agente. Un agente leggero si connette ai file server on-premises tramite NFS o SMB e sincronizza le share verso S3, EFS o FSx — con scheduling, throttling della banda e verifica dell'integrità integrati.

Concetti chiave: DataSync agent (VM on-premises o EC2), sorgenti NFS/SMB, destinazioni S3/EFS/FSx, trasferimenti incrementali schedulati.

Segnale d'esame: "Migrare o sincronizzare continuamente un gran numero di file da NAS on-premises ad AWS tramite rete" → DataSync.

---

**AWS Transfer Family** *(Capitolo 25)*

Server SFTP, FTPS e FTP completamente gestito, supportato da S3 o EFS come destinazione di storage. I client si connettono con il loro software SFTP esistente; i file caricati arrivano direttamente in un bucket o file system.

Concetti chiave: Endpoint gestito (opzionalmente con IP statico), storage di supporto S3 o EFS, compatibilità con protocolli esistenti per i partner esterni.

Segnale d'esame: "I partner devono continuare a caricare tramite SFTP, ma i file devono arrivare in S3" → Transfer Family.

---

**AWS Snow Family** *(Capitolo 25)*

Dispositivi fisici per il trasferimento dati offline e la migrazione bulk. Snowball Edge Storage Optimized: 80 TB utilizzabili, alloggiamento rinforzato, viene spedito nella tua sede; carichi i dati localmente e rispedisci il dispositivo per l'ingestione in S3.

Concetti chiave: Esegui prima il calcolo del trasferimento — se il trasferimento di rete richiederebbe all'incirca una settimana o più, il dispositivo fisico vince. *Nota legacy (2026)*: AWS ha progressivamente ritirato la famiglia — Snowmobile (2024) e Snowcone (fine 2024) non sono più disponibili, e i dispositivi Snow sono stati chiusi ai nuovi clienti a novembre 2025 (AWS ora indica DataSync e i Data Transfer Terminal). Il question bank dell'SAA-C03 è precedente a questa scadenza, quindi l'esame si aspetta ancora Snowball come risposta.

Segnale d'esame: "Migrazione su scala petabyte", "banda limitata, settimane di tempo di trasferimento" → Snow Family.

---

**AWS Backup** *(Capitoli 18 e 23)*

Servizio di backup centralizzato e basato su policy per EBS, RDS, DynamoDB, EFS e Storage Gateway. I backup plan definiscono schedule e retention; i vault memorizzano i recovery point.

Concetti chiave: Backup plan e vault, copie cross-region e cross-account, Vault Lock per l'immutabilità.

Segnale d'esame: "Centralizzare e automatizzare i backup su più servizi AWS", "copie di backup cross-account per protezione da ransomware/compromissione dell'account" → AWS Backup.

---

## Databases

**RDS — Relational Database Service** *(Capitolo 8)*

Database relazionali gestiti. Motori supportati: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server e Aurora (il motore proprietario di AWS). AWS gestisce backup, patching, failover e replica. Tu gestisci il design dello schema, le query e il sizing dell'istanza.

Concetti chiave: Multi-AZ deployment (failover automatico, replica sincrona), Read Replica (asincrone, per il read scaling), backup automatici (retention da 1 a 35 giorni), snapshot manuali (conservati fino alla cancellazione), RDS Proxy (connection pooling).

Segnale d'esame: "Database relazionale", "transazioni ACID", "workload SQL esistente" → RDS o Aurora.

---

**Aurora** *(Capitolo 24)*

Il motore di database relazionale di AWS, compatibile con MySQL e PostgreSQL. Storage engine distribuito che replica i dati su 3 AZ in 6 copie. Tipicamente 5 volte più veloce di MySQL. Aurora Serverless v2 scala la capacità automaticamente (misurata in ACU — Aurora Capacity Unit) e, sulle versioni del motore supportate, può auto-sospendersi a 0 ACU quando non ci sono connessioni aperte.

Concetti chiave: Cluster Aurora (writer + fino a 15 Aurora Replica dietro un singolo reader endpoint), Aurora Global Database (read replica cross-region con lag di replica < 1 secondo), Aurora Serverless v2, ACU, comportamento di auto-pause/resume.

Segnale d'esame: "Database relazionale ad alte prestazioni", "compatibile con MySQL/PostgreSQL", "letture globali", "workload variabile" → Aurora.

---

**DynamoDB** *(Capitolo 9)*

Database NoSQL completamente gestito. Modello chiave-valore e documento. Scala a qualsiasi throughput con prestazioni a singola cifra di millisecondi. Due modalità di capacità: on-demand (paghi per richiesta) e provisioned (paghi per unità di capacità all'ora, con Auto Scaling).

Concetti chiave: Partition key (obbligatoria), sort key (opzionale), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (change data capture), DynamoDB Accelerator (DAX) — cache in-memory, TTL (Time to Live), transazioni.

Segnale d'esame: "Accesso basato su chiave ad alto throughput", "schema flessibile", "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Capitolo 10)*

Caching in-memory gestito. Motori: Valkey, Redis OSS (persistente, pub/sub, scripting Lua, strutture dati) e Memcached (cache pura, più semplice, multi-thread). Valkey è il fork open-source di Redis aggiunto da AWS nell'ottobre 2024 e ora predefinito — API-compatibile con Redis ma con prezzo inferiore; tutto quanto detto su Redis si applica anche a esso. Usalo per ridurre il carico sul database e servire dati letti frequentemente in microsecondi. (L'esame SAA-C03 formula ancora questa voce come "Redis e Memcached".)

Concetti chiave: Pattern cache-aside, pattern write-through, policy di eviction, TTL, modalità cluster (Redis), Multi-AZ con failover automatico.

Segnale d'esame: "Ridurre il carico sul database", "latenza di lettura inferiore al millisecondo", "gestione delle sessioni", "leaderboard in tempo reale" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Capitolo 10)*

Database primario in-memory durevole e compatibile con Redis. A differenza di ElastiCache (che è una cache in cui la perdita di dati è accettabile), MemoryDB memorizza un transaction log Multi-AZ e garantisce la durabilità. Puoi usare MemoryDB come database primario — non solo come cache davanti a un altro database.

Concetti chiave: Compatibilità API Redis, transaction log Multi-AZ (garanzia di durabilità), prestazioni in-memory, database primario (non uno strato di cache).

Segnale d'esame: "Compatibile con Redis E la perdita di dati non è accettabile", "database in-memory durevole" → MemoryDB. "Redis come cache, perdita di dati accettabile" → ElastiCache Redis.

---

**Purpose-Built Databases** *(Capitoli 9, 10 e 24)*

Abbina la forma dei dati al motore giusto. DocumentDB: documenti compatibili con MongoDB. Neptune: database a grafo (relazioni, traversal — Gremlin/SPARQL). Keyspaces: wide-column compatibile con Cassandra. Timestream: time-series (offerta attuale: Timestream for InfluxDB). MemoryDB: database *primario* compatibile con Redis e durevole (vs ElastiCache = cache). QLDB ("ledger crittografico immutabile") è stato dismesso nel 2025 — consideralo un'opzione distrattore legacy.

Segnale d'esame: "social graph / raccomandazioni / reti di frode" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "Telemetria IoT nel tempo" → Timestream.

---

**AWS DMS — Database Migration Service** *(Capitolo 8)*

Migra database su AWS con downtime minimo. Supporta il full load (copia iniziale) più CDC (Change Data Capture) per mantenere sorgente e destinazione sincronizzati durante la migrazione. Quando si migra tra lo stesso tipo di motore (MySQL → MySQL, PostgreSQL → PostgreSQL), usa DMS direttamente. Quando si migra tra tipi di motore diversi (Oracle → Aurora PostgreSQL), usa prima l'AWS Schema Conversion Tool (SCT) per convertire lo schema, poi DMS per i dati.

Concetti chiave: Replication instance, endpoint sorgente e destinazione, full load + CDC, SCT (Schema Conversion Tool) per migrazioni eterogenee.

Segnale d'esame: "Migrare database con downtime minimo" → DMS. "Oracle verso Aurora" o qualsiasi migrazione eterogenea → SCT + DMS. "Stesso motore, stesso tipo" → DMS diretto.

---

## Networking

**VPC — Virtual Private Cloud** *(Capitolo 11)*

Una rete isolata all'interno di AWS. Si estende a tutte le AZ di una region. Definisci lo spazio degli indirizzi IP (blocco CIDR), crei le subnet (pubbliche o private), configuri le route table e controlli l'accesso tramite security group e NACL.

Concetti chiave: Subnet pubblica (route verso Internet Gateway), subnet privata (route verso NAT Gateway per l'outbound), Internet Gateway (inbound + outbound verso Internet), NAT Gateway (solo outbound per istanze private), VPC Peering (collega due VPC), VPC Endpoint (connette ai servizi AWS senza Internet).

Segnale d'esame: "Rete privata su AWS", "isolare le risorse da Internet", "controllare il traffico di rete" → VPC.

---

**Security Group e NACL** *(Capitolo 15)*

I security group sono firewall stateful a livello di istanza — solo regole allow, il traffico di risposta è automatico. Le NACL (Network Access Control List) sono firewall stateless a livello di subnet — richiedono sia regole inbound che outbound, valutate in ordine per numero di regola.

Segnale d'esame: "Bloccare un indirizzo IP specifico dall'accesso alla subnet" → NACL. "Controllare il traffico verso/da un'istanza" → security group.

---

**Route 53** *(Capitolo 12)*

Il servizio DNS di AWS e domain registrar. Instrada il traffico Internet verso risorse AWS ed endpoint esterni. Policy di routing: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer.

Concetti chiave: Hosted zone (pubbliche e private), tipi di record (A, AAAA, CNAME, Alias), health check, Traffic Flow (editor visivo delle policy — nota che la geoproximity è disponibile anche come routing policy diretta sui record, con un bias regolabile, senza richiedere Traffic Flow).

Segnale d'esame: "Routing DNS", "failover tra region", "instradare in base alla latenza o alla posizione" → Route 53 con la policy di routing appropriata.

---

**CloudFront** *(Capitolo 13)*

Content Delivery Network (CDN). Mette in cache i contenuti nelle edge location (750+ punti di presenza nel mondo). Riduce la latenza per gli utenti finali. Riduce i costi di trasferimento dall'origine grazie al caching. Si integra con S3, EC2, ALB e API Gateway come origine.

Concetti chiave: Distribution, origin, behavior (routing basato su path verso le origin), TTL (cache control), invalidazione della cache, URL e cookie firmati (controllo degli accessi), Lambda@Edge e CloudFront Functions (esegui codice all'edge), Origin Shield (riduce il carico sull'origin).

Segnale d'esame: "Bassa latenza globale", "mettere in cache contenuti statici", "ridurre il carico sull'origin", "proteggere da DDoS con Shield" → CloudFront.

---

**Direct Connect e VPN** *(Capitolo 25)*

AWS Direct Connect è una connessione fisica di rete dedicata dal tuo data center on-premises ad AWS. Evita l'Internet pubblico. Offre banda e latenza più costanti. AWS Site-to-Site VPN è un tunnel cifrato sull'Internet pubblico — più rapido da configurare, costo inferiore, ma prestazioni variabili.

Concetti chiave: Virtual Interface (VIF), Direct Connect Gateway (connette a più region), Transit Gateway (topologia di rete hub-and-spoke), ridondanza del tunnel VPN.

Segnale d'esame: "Connessione privata dedicata ad AWS" → Direct Connect. "Connessione cifrata, configurazione più rapida" → VPN. "Connettere più VPC" → Transit Gateway.

---

**VPC Endpoint** *(Capitolo 30)*

Connette risorse private ai servizi AWS senza usare l'Internet pubblico o il NAT Gateway. Gateway Endpoint: gratuiti, disponibili solo per S3 e DynamoDB. Interface Endpoint (PrivateLink): a pagamento per ora + per GB, disponibili per la maggior parte dei servizi AWS.

Segnale d'esame: "EC2 in subnet privata chiama S3/DynamoDB — ridurre i costi del NAT Gateway" → Gateway Endpoint (gratuito). "Connessione privata a SQS, SSM, Secrets Manager da subnet privata" → Interface Endpoint.

---

**AWS Client VPN** *(Capitolo 11)*

Endpoint OpenVPN gestito che consente a singoli dispositivi (laptop, workstation) di connettersi in modo sicuro a un VPC tramite Internet. Opzioni di autenticazione: Active Directory, federazione SAML 2.0 con un identity provider, o mutual TLS (basato su certificato). Supporta split-tunnel (solo il traffico destinato al VPC passa attraverso il tunnel) e full-tunnel (tutto il traffico viene instradato attraverso AWS).

Concetti chiave: Client VPN endpoint, target network (associazione con subnet VPC), authorization rule, split-tunnel vs. full-tunnel.

Segnale d'esame: "I tecnici da remoto hanno bisogno di accesso sicuro a un VPC da casa", "connettività da singolo dispositivo a VPC" → Client VPN. Confronto: Site-to-Site VPN = rete-a-rete. Client VPN = dispositivo-a-rete.

---

**Network Load Balancer (NLB) e Gateway Load Balancer (GWLB)** *(Capitolo 7)*

NLB opera al Layer 4 (TCP/UDP/TLS): nessuna ispezione HTTP, solo routing dei pacchetti a velocità estrema — milioni di richieste al secondo, con un IP statico per AZ e la preservazione dell'IP sorgente. GWLB opera al Layer 3 ed esiste per un solo scopo: inserire appliance virtuali di rete di terze parti (firewall, IDS/IPS, deep packet inspection) in linea nei flussi di traffico.

Concetti chiave: NLB = Layer 4, IP statici, latenza ultra-bassa, protocolli non-HTTP. GWLB = Layer 3, incapsulamento GENEVE, fleet di appliance dietro un singolo punto di ingresso. ALB = Layer 7 (routing per path/host).

Segnale d'esame: "Milioni di richieste TCP al secondo", "IP statico per il load balancer", "preservare l'IP sorgente" → NLB. "Inserire appliance di sicurezza di terze parti nel percorso del traffico" → GWLB.

---

**AWS Global Accelerator** *(Capitolo 25)*

Instrada il traffico degli utenti sul backbone globale privato di AWS alla edge location più vicina, invece di attraversare l'Internet pubblico. Fornisce due indirizzi IP Anycast statici che fanno da front-end per ALB, NLB o istanze EC2 in una o più region. Migliora la latenza e la consistenza per il traffico *dinamico* (non cacheable).

Concetti chiave: IP Anycast statici, onboarding sull'edge verso il backbone AWS, failover regionale basato su health check in pochi secondi, endpoint group con traffic dial.

Segnale d'esame: "Utenti globali, traffico dinamico/non-HTTP, IP statico, failover regionale rapido" → Global Accelerator. "Contenuto cacheable/statico" → CloudFront.

---

## Security and Identity

**IAM — Identity and Access Management** *(Capitoli 3 e 14)*

Controlla chi può fare cosa nel tuo account AWS. User (credenziali a lungo termine), Group (utenti che condividono i permessi), Role (credenziali temporanee per servizi e accesso cross-account), Policy (documenti JSON che definiscono regole allow/deny).

Concetti chiave: Principal, Action, Resource, Condition, deny esplicito > allow esplicito > deny implicito, SCP (Service Control Policy in AWS Organizations), Permission boundary, AssumeRole.

Segnale d'esame: IAM è coinvolto in ogni domanda di sicurezza. Pattern chiave: i servizi usano IAM role (non user). L'accesso cross-account usa l'assunzione di ruolo. Least privilege — concedi solo ciò che è necessario.

---

**KMS — Key Management Service** *(Capitolo 16)*

Servizio gestito per le chiavi di crittografia. Crea, memorizza e controlla le chiavi crittografiche. Le customer-managed key (CMK) ti consentono di definire rotation, utilizzo e policy di accesso. Le AWS-managed key sono gestite automaticamente.

Concetti chiave: Key policy (separata dalla IAM policy), envelope encryption (i dati vengono cifrati con una data key; la data key viene cifrata con la CMK), rotazione automatica delle chiavi, multi-region key, Grant.

Segnale d'esame: "Cifrare i dati a riposo", "chiavi di crittografia gestite dal cliente", "rotazione delle chiavi" → KMS.

---

**Secrets Manager** *(Capitolo 16)*

Memorizza e ruota automaticamente valori sensibili: credenziali di database, chiavi API, token OAuth. Si integra con RDS per la rotazione automatica delle password. Le applicazioni recuperano i secret in fase di esecuzione tramite API — non hardcodare mai le credenziali.

Segnale d'esame: "Memorizzare e ruotare le credenziali del database", "evitare secret hardcodati" → Secrets Manager. "Memorizzare valori di configurazione, non secret" → Parameter Store (SSM).

---

**AWS Shield** *(Capitolo 17)*

Protezione DDoS. Shield Standard è automatico e gratuito — protegge contro attacchi volumetrici e di protocollo comuni. Shield Advanced aggiunge protezione finanziaria, team di risposta DDoS 24/7 e visibilità dettagliata degli attacchi.

Segnale d'esame: "Proteggere da DDoS" → Shield Standard (automatico) o Shield Advanced (enterprise, con SLA).

---

**WAF — Web Application Firewall** *(Capitolo 17)*

Filtra il traffico HTTP/HTTPS in base a regole: blocchi di IP, rate limit, pattern di SQL injection, pattern XSS, restrizioni geografiche, regole personalizzate. Si collega a CloudFront, ALB, API Gateway o AppSync.

Segnale d'esame: "Bloccare indirizzi IP specifici", "prevenire SQL injection all'edge", "limitare la velocità delle chiamate API" → WAF.

---

**GuardDuty** *(Capitolo 17)*

Servizio di rilevamento delle minacce. Analizza i log di CloudTrail, i VPC Flow Log e i log DNS usando ML e threat intelligence. Rileva attività API anomale, comunicazioni con IP malevoli noti, credenziali compromesse.

Segnale d'esame: "Rilevare attività anomale", "identificare credenziali IAM compromesse", "monitoraggio continuo delle minacce" → GuardDuty.

---

**Amazon Inspector** *(Capitolo 17)*

Servizio di vulnerability assessment automatizzato. Analizza continuamente istanze EC2, immagini container Amazon ECR e funzioni Lambda alla ricerca di vulnerabilità software (CVE) ed esposizione di rete non intenzionale. I finding vengono inviati ad AWS Security Hub per la gestione centralizzata.

Concetti chiave: Scansione CVE, assessment continuo (non one-shot), copertura EC2 + ECR + Lambda, integrazione con Security Hub.

Segnale d'esame: "Scansionare automaticamente EC2 per vulnerabilità note", "scansione CVE per immagini container", "vulnerability assessment continuo" → Inspector.

---

**Amazon Cognito** *(Capitolo 14)*

Autenticazione gestita per gli utenti finali della tua applicazione — una user directory che non devi costruire tu. Gli User Pool gestiscono sign-up, sign-in, MFA, reset della password e identity provider social (Google, Facebook, qualsiasi provider OIDC), emettendo JWT che la tua applicazione valida. Gli Identity Pool scambiano quei token con credenziali AWS temporanee.

Concetti chiave: User Pool (autenticazione, JWT) vs. Identity Pool (credenziali AWS temporanee), hosted UI, federazione social/OIDC/SAML, Cognito authorizer per API Gateway.

Segnale d'esame: "L'applicazione ha bisogno di sign-up/sign-in per gli utenti", "login social", "dare agli utenti di app mobile accesso temporaneo alle risorse AWS" → Cognito. Confronto: IAM è per i tuoi tecnici e servizi; Cognito è per i tuoi clienti.

---

**AWS Certificate Manager (ACM)** *(Capitolo 16)*

Provisiona certificati TLS/SSL pubblici gratuiti per i servizi gestiti da AWS (ALB, CloudFront, API Gateway) e gestisce l'intero ciclo di vita — nessun calendario di rinnovo, nessuna gestione della chiave privata. Rinnova automaticamente tramite DNS validation.

Concetti chiave: DNS vs. email validation, rinnovo automatico, i certificati per CloudFront devono essere in us-east-1, i certificati pubblici gratuiti non possono essere esportati (un'opzione esportabile a pagamento esiste dal 2025).

Segnale d'esame: "HTTPS su un load balancer o CDN", "rinnovo automatico del certificato" → ACM.

---

**Amazon Macie** *(Capitolo 17)*

Servizio di data discovery per i dati sensibili in S3. Usa machine learning e pattern matching per trovare PII (nomi, numeri di carta, credenziali) nei bucket e segnala rischi di accesso come l'esposizione pubblica. Complementa GuardDuty: GuardDuty monitora il comportamento; Macie verifica cosa è memorizzato.

Concetti chiave: Managed data identifier (pattern PII), scope limitato a S3, finding verso Security Hub/EventBridge.

Segnale d'esame: "Scoprire PII in S3", "identificare l'esposizione di dati sensibili" → Macie.

---

**AWS Control Tower** *(Capitolo 14)*

Automatizza la configurazione e la governance di un ambiente multi-account. Crea una landing zone — account di management, log archive e audit pre-configurati con Organizations, CloudTrail, Config e guardrail — in minuti invece di giorni di configurazione manuale.

Concetti chiave: Landing zone, guardrail (preventivi = SCP, detective = regole Config), Account Factory per la creazione standardizzata di nuovi account.

Segnale d'esame: "Configurare e governare un nuovo ambiente multi-account con best practice in modo automatico" → Control Tower. Confronto: Organizations è il blocco costruttivo di base; Control Tower è il montaggio automatizzato.

---

## Messaging and Event Processing

**SQS — Simple Queue Service** *(Capitolo 19)*

Coda di messaggi gestita. I producer inviano messaggi; i consumer li leggono e li eliminano. Disaccoppia i servizi: il mittente non ha bisogno di sapere se il destinatario è disponibile. Code standard: consegna almeno una volta, ordinamento best-effort. Code FIFO: elaborazione esattamente una volta, ordinamento rigoroso.

Concetti chiave: Visibility timeout (il messaggio è nascosto agli altri consumer durante l'elaborazione), Dead Letter Queue (DLQ) per i messaggi che falliscono ripetutamente, Message retention (4 giorni di default, fino a 14), Long polling (riduce le risposte vuote), payload massimo 256 KB di default (aumentabile a 1 MiB dal 2025; per payload più grandi, la Extended Client Library memorizza il body in S3).

Segnale d'esame: "Disaccoppiare i servizi", "bufferizzare le richieste durante i picchi di carico", "elaborazione asincrona" → SQS. "L'ordine è importante e l'elaborazione esattamente una volta è richiesta" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Capitolo 19)*

Servizio pub/sub gestito. I publisher inviano un messaggio a un topic; tutti i subscriber ricevono una copia. Pattern fan-out: un messaggio → molti consumer. Protocolli: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push.

Concetti chiave: Topic, subscription, pattern fan-out (SNS → più code SQS), message filtering (i subscriber ricevono solo i messaggi corrispondenti).

Segnale d'esame: "Inviare notifiche a più endpoint contemporaneamente", "fan-out di un singolo evento verso più consumer" → SNS. Pattern comune: SNS + SQS per fan-out durevole.

---

**EventBridge** *(Capitolo 22)*

Event bus per la costruzione di architetture event-driven. Instrada eventi da servizi AWS, partner SaaS e sorgenti personalizzate verso Lambda, SQS, SNS, Step Functions e altri target. Supporta regole schedulate (cron) e pattern matching.

Segnale d'esame: "Instradare eventi dai servizi AWS verso target", "schedulare funzioni Lambda", "orchestrazione event-driven" → EventBridge.

---

**Step Functions** *(Capitolo 22)*

Orchestrazione serverless di workflow. Coordina funzioni Lambda, task ECS, DynamoDB, SNS, SQS e altri servizi in state machine visive. Gestisce retry, error handling, branch paralleli e stati di attesa.

Concetti chiave: State machine, tipi di stato (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflow (exactly-once, long-running) vs. Express Workflow: Asincrono (at-least-once, alto volume — progetta i task in modo idempotente) e Sincrono (at-most-once, restituisce il risultato direttamente come una chiamata API).

Segnale d'esame: "Orchestrare più funzioni Lambda", "workflow a lunga durata con logica di retry", "passaggi di approvazione umana" → Step Functions.

---

**Kinesis** *(Capitolo 26)*

Streaming di dati in tempo reale. Kinesis Data Streams: stream durevole e ordinato di record (come un commit log distribuito). I consumer elaborano i record; i dati vengono conservati per 24 ore (default) fino a 365 giorni (con Extended Data Retention). Amazon Data Firehose (ex Kinesis Data Firehose): consegna completamente gestita a S3, Redshift, OpenSearch, Splunk — nessuna gestione dei consumer necessaria.

Concetti chiave: Shard (unità di throughput: 1 MB/s in scrittura, 2 MB/s in lettura), partition key (determina l'assegnazione allo shard), sequence number, checkpointing (KCL o Lambda), Firehose vs. Streams.

Segnale d'esame: "Streaming in tempo reale", "record ordinati", "riprodurre eventi" → Kinesis Data Streams. "Consegnare dati in streaming a S3/Redshift senza gestire consumer" → Amazon Data Firehose (le domande più vecchie potrebbero dire "Kinesis Data Firehose"). "SQL su dati in streaming" → Amazon Managed Service for Apache Flink (ex Kinesis Data Analytics). Confronto con SQS: Kinesis conserva e riproduce; SQS elimina al consumo.

---

**Amazon MQ** *(Capitolo 19)*

Servizio di message broker gestito che supporta Apache ActiveMQ e RabbitMQ. Supporta i protocolli di messaggistica standard del settore: AMQP, STOMP, MQTT, OpenWire e WebSocket. Il caso d'uso principale è la migrazione lift-and-shift di workload di message broker on-premises — le applicazioni che già usano ActiveMQ o RabbitMQ possono connettersi senza modifiche al codice.

Concetti chiave: Scelta del motore ActiveMQ vs. RabbitMQ, supporto protocolli (AMQP/STOMP/MQTT), configurazione broker a istanza singola o active/standby per l'alta disponibilità.

Segnale d'esame: "Migrare ActiveMQ o RabbitMQ on-premises su AWS senza cambiare il codice applicativo" → Amazon MQ. "Messaggistica AWS-native greenfield" → SQS o SNS (più semplici, più scalabili).

---

## Analytics

**Athena** *(Capitolo 26)*

Query SQL serverless su dati memorizzati in S3. Nessuna infrastruttura da gestire. Paghi per query (per TB scansionato). Funziona meglio con formati colonnari (Parquet, ORC) e dati partizionati.

Segnale d'esame: "Interrogare dati S3 con SQL", "analisi ad hoc su data lake", "nessuna gestione dell'infrastruttura" → Athena.

---

**Glue** *(Capitolo 26)*

Servizio ETL (Extract, Transform, Load) serverless. I Glue Crawler scoprono i dati e aggiornano il Glue Data Catalog. I Glue Job eseguono trasformazioni Spark o Python. Il Data Catalog si integra con Athena, Redshift Spectrum e EMR.

Segnale d'esame: "Trasformare e caricare dati per l'analisi", "scoprire lo schema dei dati S3", "pipeline ETL" → Glue.

---

**Amazon QuickSight** *(Capitolo 26)*

Servizio di business intelligence e visualizzazione dati gestito. Usa SPICE (Super-fast, Parallel, In-memory Calculation Engine), un motore in-memory che mette in cache i dati importati per il rendering rapido delle dashboard. Si connette ad Athena, S3, Redshift, RDS e altre sorgenti dati AWS. Nessun server BI da gestire.

Concetti chiave: SPICE (motore in-memory), dataset, analisi, dashboard, ML Insight (rilevamento anomalie, previsione), sicurezza a livello di riga e colonna.

Segnale d'esame: "Dashboard BI su AWS senza gestire un server", "visualizzare dati da Athena o Redshift" → QuickSight.

---

**AWS Lake Formation** *(Capitolo 26)*

Strato di controllo degli accessi centralizzato per data lake su S3 e il Glue Data Catalog. Fornisce permessi granulari a livello di tabella, colonna e riga — più granulari delle sole bucket policy S3. Semplifica la creazione di un data lake sicuro: Lake Formation gestisce il modello dei permessi; Glue gestisce il catalog; S3 conserva i dati.

Concetti chiave: Permessi data lake (livello tabella/colonna/riga), integrazione con Glue Data Catalog, LF-tag per il controllo degli accessi basato su attributi, grant/revoke centralizzato per le query Athena e Redshift Spectrum.

Segnale d'esame: "Controllo degli accessi granulare sul data lake", "sicurezza a livello di colonna o riga sui dati S3" → Lake Formation.

---

## High Availability and Disaster Recovery

**Multi-AZ e Multi-Region** *(Capitolo 18)*

Multi-AZ: replica sincrona all'interno di una region per il failover automatico (RDS Multi-AZ, load balancer tra AZ). RPO ~0, RTO ~60 s per RDS. Multi-Region: replica asincrona per la ridondanza geografica e latenza inferiore per gli utenti globali.

Concetti chiave: RTO (Recovery Time Objective — quanto tempo occorre per il ripristino), RPO (Recovery Point Objective — quanta perdita di dati è accettabile). Strategie DR Pilot Light, Warm Standby, Active-Active.

Segnale d'esame: Distingui tra guasti a livello di AZ (gestiti da Multi-AZ) e guasti regionali (gestiti da Multi-Region). Costo e complessità aumentano significativamente con Multi-Region.

---

**AWS Elastic Disaster Recovery (DRS)** *(Capitolo 18)*

Disaster recovery gestito per server (on-premises o EC2). Replica continuamente i server sorgente blocco per blocco in un'area di staging a basso costo e avvia istanze di recovery complete in pochi minuti quando necessario — un pilot light gestito: tempi di recovery vicini a warm-standby a costi prossimi a backup-and-restore.

Concetti chiave: Replica continua a livello di blocco, area di staging a basso costo, avvio del recovery on-demand, recovery point-in-time.

Segnale d'esame: "Minimizzare downtime e perdita di dati per workload basati su server con un servizio DR gestito", "pilot light senza costruirlo da soli" → DRS.

---

## Cost Optimization

**EC2 Pricing Models** *(Capitolo 27)*

On-Demand: prezzo pieno, nessun impegno. Reserved Instance (1 o 3 anni): sconto del 30-72% per tipo di istanza specifico. Savings Plan (Compute o EC2 Instance): spesa oraria impegnata per flessibilità. Spot: sconto del 60-90% per workload interrompibili.

Segnale d'esame: "Minimizzare il costo per un workload prevedibile" → Savings Plan o Reserved Instance. "Elaborazione batch fault-tolerant" → Spot. "Imprevedibile o a breve termine" → On-Demand.

---

**Data Transfer Pricing** *(Capitolo 30)*

Inbound verso AWS: gratuito. Stessa AZ: gratuito. Cross-AZ: $0,01/GB per direzione. Cross-region: $0,02-0,08/GB. Internet (outbound): ~$0,09/GB. Elaborazione NAT Gateway: $0,045/GB. Il trasferimento dati CloudFront è più economico del trasferimento diretto EC2-a-Internet, e il caching riduce il volume totale.

Segnale d'esame: "Ridurre i costi di trasferimento dati per S3/DynamoDB da subnet privata" → Gateway Endpoint (gratuito). "Ridurre i costi del NAT Gateway per altri servizi" → Interface Endpoint.

---

## Observability

**CloudWatch** *(riferimento in tutto il libro)*

Monitoraggio e osservabilità. CloudWatch Metric: dati numerici a serie temporale da servizi AWS e applicazioni personalizzate. CloudWatch Logs: raccoglie, ricerca e analizza i dati di log. CloudWatch Alarm: attiva notifiche o auto scaling in base alle soglie delle metriche. CloudWatch Dashboard: visualizza le metriche.

Concetti chiave: Dimensioni delle metriche, periodi di retention, log group e log stream, metric filter, CloudWatch Agent (per metriche e log a livello OS da EC2), Container Insights.

---

**CloudTrail** *(riferimento in tutto il libro)*

Registra ogni chiamata API effettuata nel tuo account AWS: chi l'ha effettuata, da dove, quando e qual è stata la risposta. Un trail multi-region memorizza i log in S3 a tempo indeterminato. Usato per l'audit di sicurezza, la conformità e le indagini sugli incidenti.

Segnale d'esame: "Chi ha eliminato quella risorsa?" "Verifica tutta l'attività API" → CloudTrail.

---

**X-Ray** *(Capitolo 20)*

Distributed tracing: segue le singole richieste attraverso i servizi (trace → segment → subsegment), costruisce una service map con latenza e tasso di errore per ogni hop. Il sampling mantiene basso l'overhead; le annotation rendono le trace ricercabili. Il tracing attivo si abilita sulle stage Lambda e API Gateway.

Segnale d'esame: "Tracciare le richieste tra microservizi", "trovare il collo di bottiglia tra i servizi" → X-Ray (non CloudWatch, non CloudTrail).

---

**AWS Config** *(riferimento nel Capitolo 31)*

Traccia le modifiche alla configurazione delle risorse nel tempo. Valuta le risorse rispetto alle regole di conformità. Registra la cronologia di ogni modifica alla configurazione per ogni risorsa. Si integra con Systems Manager per la remediation.

Segnale d'esame: "Questa risorsa è conforme alla nostra policy di sicurezza?" "Com'era la configurazione di questa risorsa la settimana scorsa?" → AWS Config.

---

## Well-Architected

**I Sei Pilastri** *(Capitolo 31)*

| Pilastro                        | Domanda fondamentale                            | Servizi chiave                                      |
|---------------------------------|-------------------------------------------------|-----------------------------------------------------|
| Operational Excellence          | Stiamo operando bene?                           | CloudWatch, CloudTrail, SSM, Config                 |
| Security                        | Siamo protetti?                                 | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager  |
| Reliability                     | Ci riprendiamo dai guasti?                      | Multi-AZ, Route 53 failover, backup/restore, SQS    |
| Performance Efficiency          | Stiamo usando le risorse giuste?                | Right-sizing, Auto Scaling, CloudFront, Kinesis     |
| Cost Optimization               | Stiamo spendendo in modo oculato?               | Savings Plans, Spot, S3 lifecycle, VPC Endpoint     |
| Sustainability                  | Stiamo minimizzando l'impatto ambientale?       | Right-sizing, Graviton, livelli di storage efficienti |

AWS Well-Architected Tool: valuta la tua architettura rispetto ai sei pilastri. Usalo prima dell'esame per comprendere il ragionamento alla base delle domande di ciascun pilastro.
