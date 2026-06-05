# Appendice A: Servizi AWS di Riferimento Rapido

Ogni servizio trattato in questo libro, nell'ordine in cui viene introdotto. Usalo come riferimento di studio e come rapida consultazione durante la preparazione per l'esame.

---

## Calcolo

**EC2 — Elastic Compute Cloud** *(Capitolo 4)*

Macchine virtuali nel cloud. Tu scegli il tipo di istanza (CPU, memoria, storage), il sistema operativo e la regione. Paghi all'ora (On-Demand), per impegno (Istanza Dedicata / Piani di Risparmio) o per slot di capacità in eccesso (Spot). Il primitivo di calcolo fondamentale.

Concetti chiave: AMI (Amazon Machine Image), tipi di istanza (famiglie t3, m6g, r6g, c6g), coppie chiavi, ruoli di istanza, gruppi di posizionamento.

Segnale dell'esame: Quando un scenario richiede un calcolo persistente, di stato o a lunga durata — EC2 o ECS. Quando un scenario richiede una durata breve, attivata da eventi o un costo di inattività zero — Lambda.

---

**Auto Scaling + Load Balancer Applicativo** *(Capitolo 7)*

I Gruppi di Auto Scaling (ASG) aggiungono e rimuovono istanze EC2 in base al carico. I Load Balancer Applicativi (ALB) distribuiscono il traffico tra le istanze e indirizzano in base al percorso o all'host. Insieme, formano lo strato di scalabilità orizzontale.

Concetti chiave: Modello di lancio, politiche di scalabilità (tracciamento del target, passo, programmata), controlli di salute, gruppi di destinazione ALB, regole di listener, routing ponderato.

Segnale dell'esame: "Gestisci carichi variabili" o "alta disponibilità tra AZ" → ASG + ALB.

---

**Lambda** *(Capitolo 20)*

Funzioni serverless. Scrivi il codice; AWS lo esegue in risposta a eventi. Nessun server da gestire. Paghi per ogni invocazione e per il millisecondo di esecuzione. Scala automaticamente a migliaia di esecuzioni concorrenti.

Concetti chiave: Fonti di eventi (API Gateway, S3, SQS, EventBridge, Kinesis), ruolo di accesso, limiti di concorrenza, concorrenza riservata e provisionata, cold start, Livelli, durata massima di 15 minuti.

Segnale dell'esame: "Serverless", "event-driven", "attività a durata breve", "nessun costo di inattività" → Lambda.

---

**ECS — Elastic Container Service** *(Capitolo 21)*

Esegue i container Docker su AWS. Due tipi di lancio: EC2 (tu gestisci l'host) e Fargate (AWS gestisce l'host). ECS gestisce le definizioni delle attività, i servizi, la pianificazione del cluster, l'integrazione con i load balancer e la discovery dei servizi.

Concetti chiave: Definizione dell'attività, servizio ECS, tipo di lancio Fargate vs. EC2, ECR (registro container), ruolo IAM dell'attività, auto scalabilità del servizio.

Segnale dell'esame: "Lavori containerizzati", "microservizi", "Docker su AWS" → ECS (solitamente Fargate per i container serverless).

---

**EKS — Elastic Kubernetes Service** *(Capitolo 21)*

Kubernetes gestito. AWS esegue il piano di controllo; tu esegui i nodi worker (EC2 o Fargate). Usa EKS quando il tuo team utilizza già Kubernetes o ha carichi di lavoro che richiedono funzionalità specifiche di Kubernetes.

Segnale dell'esame: "Kubernetes", "hai bisogno di migrare carichi di lavoro K8s esistenti" → EKS. "Hai solo bisogno di contenitori senza l'overhead di K8s" → ECS.

---

## Storage

**S3 — Simple Storage Service** *(Capitolo 5)*

Storage di oggetti. Capacità illimitata, durabilità del 99,999,999,99% (undici nove). Memorizza i file come oggetti in bucket. I bucket vivono in una regione. Gli oggetti possono variare da 0 byte a 5 TB.

Concetti chiave: Politica del bucket, ACL dell'oggetto, versioning, hosting di siti web statici, URL presigned, caricamento multipart, Transfer Acceleration, classi di storage (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Segnale dell'esame: "Memorizza e recupera file", "asset statici", "backup", "data lake" → S3. La classe di storage appropriata dipende dalla frequenza di accesso e dalla velocità di recupero.

---

**EBS — Elastic Block Store** *(Capitolo 6)*

Storage a blocchi collegato a una singola istanza EC2. Funziona come un disco rigido. Persiste in modo indipendente dal ciclo di vita dell'istanza (puoi scollegarlo e ricollegarlo). Tipi più comuni: gp3 (general purpose SSD, il predefinito), io2 (IOPS provisionati per i database), st1 (throughput-optimized HDD per letture sequenziali).

Concetti chiave: Snapshot (incrementali, memorizzati in S3), crittografia (KMS), Multi-Attach (solo io1/io2), provisioning di IOPS e throughput.

Segnale dell'esame: "Storage persistente per EC2", "storage per database", "richiede un accesso a blocchi a bassa latenza" → EBS.

---

**EFS — Elastic File System** *(Capitolo 6)*

Sistema di file condiviso, accessibile da più istanze EC2 contemporaneamente. Protocollo NFS. Scala automaticamente. Più costoso di EBS per GB. Due classi di storage: Standard e Infrequente Accesso. Intelligent-Tiering sposta automaticamente i file tra i livelli di accesso.

Segnale dell'esame: "Sistema di file condiviso", "più istanze EC2 hanno bisogno degli stessi file", "NFS" → EFS.

---

**Classi di Storage S3 e Politiche di Ciclo di Vita** *(Capitolo 23)*

S3 Intelligent-Tiering sposta automaticamente gli oggetti tra i livelli di accesso in base alla frequenza di accesso. Le politiche di ciclo di vita trasferiscono gli oggetti tra le classi (Standard → Standard-IA → Glacier) in base alle regole di età. Le classi di storage Glacier hanno tempi di recupero che vanno da minuti (Glacier Instant) a 12 ore (Glacier Deep Archive).

Esame segnali: "Ridurre i costi di archiviazione per i dati a cui si accede raramente" → politiche di ciclo di vita, Intelligent-Tiering o Glacier.

---

## Database

**RDS — Servizio di Database Relazionale** *(Capitolo 8)*

Database relazionali gestite. Motori supportati: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server e Aurora (motore proprietario di AWS). AWS gestisce i backup, i patch, il failover e la replica. Gestisci la progettazione dello schema, le query e la dimensione dell'istanza.

Concetti chiave: Distribuzione Multi-AZ (failover automatico, replica sincrona), Read Replicas (asincrona, per il bilanciamento del carico di lettura), backup automatici (ritenzione da 1 a 35 giorni), snapshot manuali (mantenuti fino alla cancellazione), RDS Proxy (pool di connessioni).

Esame segnale: "Database relazionale", "transazioni ACID", "carico di lavoro SQL esistente" → RDS o Aurora.

---

**Aurora** *(Capitolo 24)*

Motore di database relazionale di AWS, compatibile con MySQL e PostgreSQL. Motore di archiviazione distribuito che replica i dati su 3 AZ in 6 copie. Tipicamente 5 volte più veloce di MySQL. Aurora Serverless v2 scala la capacità automaticamente (misurata in ACU - Unità di Capacità di Aurora -).

Concetti chiave: Cluster Aurora (scrittore + fino a 15 endpoint di lettura), Aurora Global Database (repliche di lettura cross-region con ritardo di replica inferiore a 1 secondo), Aurora Serverless v2.

Esame segnale: "Database relazionale ad alte prestazioni", "compatibile con MySQL/PostgreSQL", "letture globali", "carico di lavoro variabile" → Aurora.

---

**DynamoDB** *(Capitolo 9)*

Database NoSQL gestito completamente. Modello chiave-valore e documento. Scala alla capacità con prestazioni a millisecondi a singola cifra. Due modalità di capacità: on-demand (paghi per richiesta) e provisionata (paghi per unità di capacità all'ora, con Auto Scaling).

Concetti chiave: Chiave di partizione (richiesta), chiave di ordinamento (opzionale), Indice secondario globale (GSI), Indice secondario locale (LSI), DynamoDB Streams (acquisizione dei dati di modifica), DynamoDB Accelerator (DAX) — cache in memoria, TTL (Tempo di Vita), transazioni.

Esame segnale: "Accesso basato su chiave ad alto throughput", "schema flessibile", "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Capitolo 10)*

Cache in memoria gestita. Due motori: Redis (persistente, pub/sub, scripting Lua, strutture dati) e Memcached (cache pura, più semplice, multithread). Utilizza per ridurre il carico del database e servire i dati letti frequentemente in microsecondi.

Concetti chiave: Pattern cache-aside, pattern write-through, politiche di eviction, TTL, modalità cluster (Redis), Multi-AZ con failover automatico.

Esame segnale: "Ridurre il carico del database", "latenza di lettura inferiore a millisecondi", "gestione delle sessioni", "leaderboard in tempo reale" → ElastiCache Redis.

---

## Networking

**VPC — Virtual Private Cloud** *(Capitolo 11)*

Una rete isolata all'interno di AWS. Si estende a tutte le AZ in una regione. Definisci lo spazio degli indirizzi IP (blocco CIDR), crea subnet (pubbliche o private), configura tabelle di routing e controlla l'accesso tramite gruppi di sicurezza e NACL.

Concetti chiave: Subnet pubblica (route all'Internet Gateway), subnet privata (route al NAT Gateway per le uscite), Internet Gateway (inbound + outbound all'internet), NAT Gateway (outbound solo per le istanze private), VPC Peering (connetti due VPC), VPC Endpoints (connetti ai servizi AWS senza internet).

Esame segnale: "Rete privata su AWS", "isolare le risorse dall'internet", "controllare il traffico di rete" → VPC.

---

**Security Groups e NACL** *(Capitolo 15)*

I gruppi di sicurezza sono firewall dichiarativi a livello di istanza — consentono solo le regole, il traffico di ritorno è automatico. Le NACL (Liste di controllo degli accessi di rete) sono firewall imperativi a livello di subnet — richiedono sia le regole di inbound che di outbound, valutate in ordine per numero di regola.

Esame segnale: "Bloccare un indirizzo IP specifico dall'accesso alla subnet" → NACL. "Controllare il traffico verso/da un'istanza" → gruppo di sicurezza.

---

**Route 53** *(Capitolo 12)*

Servizio DNS di AWS e registrar di dominio. Instrada il traffico internet verso le risorse AWS e gli endpoint esterni. Politiche di routing: Semplice, Ponderata, Latency-based, Failover, Geolocation, Geoproximity, Multi-value answer.

Concetti chiave: Zone ospitate (pubbliche e private), tipi di record (A, AAAA, CNAME, Alias), controlli di salute, Traffic Flow (editor di politica visivo).

Esame segnale: "Routing DNS", "failover tra regioni", "instradare in base alla latenza o alla posizione" → Route 53 con la politica di routing appropriata.

---

**CloudFront** *(Capitolo 13)*

Content Delivery Network (CDN). Memorizza nella cache i contenuti nelle posizioni edge (400+ in tutto il mondo). Riduce la latenza per gli utenti finali. Riduce il trasferimento dati dall'origine tramite la memorizzazione nella cache. Si integra con S3, EC2, ALB e API Gateway come origini.

Concetti chiave: Distribuzione, origini, comportamenti (instradamento basato su percorso alle origini), TTL (controllo della memorizzazione nella cache), invalidazione della memorizzazione nella cache, URL firmati e cookie (controllo degli accessi), Lambda@Edge e CloudFront Functions (esegui il codice all'edge), Shield dell'origine (riduci il carico dell'origine).

Esame segnale: "Bassa latenza globale", "memorizzare nella cache i contenuti statici", "ridurre il carico dell'origine", "proteggere da DDoS con Shield" → CloudFront.

---

**Direct Connect e VPN** *(Capitolo 25)*

AWS Direct Connect è una connessione fisica dedicata alla rete dal tuo data center on-premises ad AWS. Evita l'utilizzo di Internet pubblico. Offre una larghezza di banda e latenza più costanti. AWS Site-to-Site VPN è un tunnel crittografato sull'Internet pubblico – più facile da configurare, costo inferiore, ma prestazioni variabili.

Concetti chiave: Interfaccia Virtuale (VIF), Gateway Direct Connect (per connettersi a più regioni), Transit Gateway (topologia di rete hub-and-spoke), ridondanza del tunnel VPN.

Segnali d'esame: "Connessione privata dedicata ad AWS" → Direct Connect. "Connessione crittografata, configurazione più rapida" → VPN. "Connettere più VPC" → Transit Gateway.

---

**Endpoint VPC** *(Capitolo 30)*

Connetti risorse private ai servizi AWS senza utilizzare Internet pubblico o NAT Gateway. Gateway Endpoint: gratuito, disponibile solo per S3 e DynamoDB. Interface Endpoint (PrivateLink): a pagamento a ore + per GB, disponibile per la maggior parte dei servizi AWS.

Segnali d'esame: "EC2 in subnet privata chiama S3/DynamoDB – riduce i costi del NAT Gateway" → Gateway Endpoint (gratuito). "Connessione privata a SQS, SSM, Secrets Manager da subnet privata" → Interface Endpoint.

---

## Sicurezza e Identità

**IAM — Identity and Access Management** *(Capitoli 3 e 14)*

Controlla chi può fare cosa nel tuo account AWS. Utenti (credenziali a lungo termine), Gruppi (utenti che condividono le autorizzazioni), Ruoli (credenziali temporanee per servizi e accesso cross-account), Politiche (documenti JSON che definiscono regole di permesso/negazione).

Concetti chiave: Principale, Azione, Risorsa, Condizione, negazione esplicita > negazione esplicita > negazione implicita, SCP (Service Control Policy in AWS Organizations), Confine dei permessi, AssumeRole.

Segnali d'esame: IAM è coinvolto in ogni domanda di sicurezza. Modello chiave: i servizi utilizzano ruoli IAM (non utenti). L'accesso cross-account utilizza l'assegnazione di ruoli. Minimo privilegio – concedi solo ciò che è necessario.

---

**KMS — Key Management Service** *(Capitolo 16)*

Servizio gestito per la gestione delle chiavi. Crea, memorizza e controlla le chiavi crittografiche. Chiavi gestite dal cliente (CMK) consentono di definire rotazione, utilizzo e politiche di accesso. Chiavi gestite da AWS sono gestite automaticamente.

Concetti chiave: Politica della chiave (separata dalla politica IAM), crittografia a involucro (dati crittografati con una chiave dati; chiave dati crittografata con CMK), rotazione automatica delle chiavi, chiavi multi-regione, concessioni.

Segnali d'esame: "Crittografa i dati a riposo", "chiavi di crittografia gestite dal cliente", "rotazione delle chiavi" → KMS.

---

**Secrets Manager** *(Capitolo 16)*

Memorizza e ruota automaticamente i valori sensibili: credenziali del database, chiavi API, token OAuth. Si integra con RDS per la rotazione automatica delle password. Le applicazioni recuperano i segreti in fase di esecuzione tramite API – non codificare mai le credenziali.

Segnali d'esame: "Memorizza e ruota le credenziali del database", "evita di codificare segreti" → Secrets Manager. "Memorizza i valori di configurazione, non i segreti" → Parameter Store (SSM).

---

**AWS Shield** *(Capitolo 17)*

Protezione DDoS. Shield Standard è automatico e gratuito – protegge contro gli attacchi volumetrici e di protocollo comuni. Shield Advanced aggiunge protezione finanziaria, team di risposta DDoS 24/7 e visibilità dettagliata degli attacchi.

Segnali d'esame: "Proteggi contro DDoS" → Shield Standard (automatico) o Shield Advanced (enterprise, con SLA).

---

**WAF — Web Application Firewall** *(Capitolo 17)*

Filtra il traffico HTTP/HTTPS in base alle regole: blocchi di indirizzi IP, limiti di velocità, modelli di SQL injection, modelli XSS, restrizioni geografiche, regole personalizzate. Si collega a CloudFront, ALB, API Gateway o AppSync.

Segnali d'esame: "Blocca indirizzi IP specifici", "previene l'SQL injection al limite", "limita la velocità delle chiamate API" → WAF.

---

**GuardDuty** *(Capitolo 17)*

Servizio di rilevamento delle minacce. Analizza i log CloudTrail, i log di flusso VPC e i log DNS utilizzando ML e intelligence sulle minacce. Rileva attività API insolite, comunicazione con indirizzi IP dannosi noti, credenziali compromesse.

Segnali d'esame: "Rileva attività insolite", "identifica credenziali IAM compromesse", "monitoraggio continuo delle minacce" → GuardDuty.

---

## Messaggistica e Elaborazione Eventi

**SQS — Simple Queue Service** *(Capitolo 19)*

Coda di messaggi gestita. I produttori inviano messaggi; i consumatori leggono e li eliminano. Decoppia i servizi: il mittente non deve sapere se il destinatario è disponibile. Code standard: consegna almeno una volta, ordinamento a miglior sforzo. Code FIFO: elaborazione una volta in modo esatto, ordinamento rigoroso.

Concetti chiave: Timeout di visibilità (il messaggio è nascosto agli altri consumatori durante l'elaborazione), Coda di messaggi deceduti (DLQ) per i messaggi che falliscono ripetutamente, Retention del messaggio (4 giorni di default, fino a 14), polling a lungo (riduce le risposte vuote).

Segnali d'esame: "Decoppia i servizi", "bufferizza le richieste durante i picchi di carico", "elaborazione asincrona" → SQS. "L'ordine è importante e l'elaborazione una volta in modo esatto è richiesta" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Capitolo 19)*

Servizio pub/sub gestito. Gli editori inviano un messaggio a un argomento; tutti gli abbonati ricevono una copia. Modello fan-out: un messaggio → molti consumatori. Protocolli: SQS, Lambda, HTTP/HTTPS, email, SMS, push mobile.

Key concepts: Topic, subscription, pattern di fan-out (SNS → multiple code di SQS), filtraggio dei messaggi (gli abbonati ricevono solo messaggi corrispondenti).

Segnale d'esame: "Invia notifiche a più endpoint simultaneamente", "fan-out un singolo evento a più consumatori" → SNS. Modello comune: SNS + SQS per un fan-out duraturo.

---

**EventBridge** *(Capitolo 22)*

Bus di eventi per la costruzione di architetture basate su eventi. Instrada gli eventi dai servizi AWS, partner SaaS e fonti personalizzate verso Lambda, SQS, SNS, Step Functions e altri target. Supporta regole programmate (cron) e corrispondenza di modelli.

Segnale d'esame: "Instrada eventi dai servizi AWS verso target", "pianifica le funzioni Lambda", "orchestrazione basata su eventi" → EventBridge.

---

**Step Functions** *(Capitolo 22)*

Orchestrazione serverless di workflow. Coordina le funzioni Lambda, attività ECS, DynamoDB, SNS, SQS e altri servizi in visual state machine. Gestisce i tentativi di ripristino, la gestione degli errori, i rami paralleli e gli stati di attesa.

Key concepts: Stato macchina, tipi di stato (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Workflows Standard (exactly-once, long-running) vs. Workflows Express (at-least-once, high-volume).

Segnale d'esame: "Orchestra più funzioni Lambda", "workflow di lunga durata con logica di ripristino", "passaggi di approvazione umana" → Step Functions.

---

**Kinesis** *(Capitolo 26)*

Streaming di dati in tempo reale. Kinesis Data Streams: flusso duraturo e ordinato di record (come un commit log distribuito). I consumatori elaborano i record; i dati vengono conservati per 24 ore o 7 giorni. Kinesis Data Firehose: consegna gestita completamente a S3, Redshift, OpenSearch, Splunk — non è necessario gestire i consumatori.

Key concepts: Shard (unità di throughput: 1 MB/s di scrittura, 2 MB/s di lettura), chiave di partizione (determina l'assegnazione dello shard), numero di sequenza, checkpointing (KCL o Lambda), Firehose vs. Streams.

Segnale d'esame: "Streaming in tempo reale", "record ordinati", "riprodurre eventi" → Kinesis Data Streams. "Consegna dati di streaming a S3/Redshift senza gestire i consumatori" → Kinesis Firehose. Contrasto con SQS: Kinesis conserva e riproduce; SQS elimina al consumo.

---

## Analisi

**Athena** *(Capitolo 26)*

Query SQL serverless su dati memorizzati in S3. Nessuna infrastruttura da gestire. Pagamento per query (per TB scansionato). Migliore con formati a colonne (Parquet, ORC) e dati partizionati.

Segnale d'esame: "Interroga i dati S3 con SQL", "analisi ad hoc su un data lake", "nessuna gestione dell'infrastruttura" → Athena.

---

**Glue** *(Capitolo 26)*

Servizio ETL serverless (Extract, Transform, Load). I crawler Glue scoprono i dati e aggiornano il Catalogo Glue. I job Glue eseguono trasformazioni Spark o Python. Il Catalogo integra con Athena, Redshift Spectrum ed EMR.

Segnale d'esame: "Trasforma e carica i dati per l'analisi", "scopri lo schema dei dati S3", "pipeline ETL" → Glue.

---

## Alta Disponibilità e Disaster Recovery

**Multi-AZ e Multi-Regione** *(Capitolo 18)*

Multi-AZ: replica sincrona all'interno di una regione per il failover automatico (RDS Multi-AZ, bilanciatore di carico tra AZ). RPO ~0, RTO ~60s per RDS. Multi-Regione: replica asincrona per la ridondanza geografica e la latenza inferiore per gli utenti globali.

Key concepts: RTO (Recovery Time Objective — quanto tempo ci vuole per ripristinare), RPO (Recovery Point Objective — quanti dati possono essere persi). Strategie di Pilot Light, Warm Standby, Active-Active DR.

Segnale d'esame: Distinguere tra guasti a livello di AZ (Multi-AZ gestisce) rispetto ai guasti regionali (Multi-Regione gestisce). Il costo e la complessità aumentano notevolmente con Multi-Regione.

---

## Ottimizzazione dei Costi

**Modelli di Prezzo EC2** *(Capitolo 27)*

On-Demand: prezzo completo, nessun impegno. Istanza Salva (1 o 3 anni): sconto del 30-72% per tipo di istanza specifico. Piani di Risparmio (Compute o EC2 Instance): spesa oraria impegnata per la flessibilità. Spot: 60-90% di sconto per carichi di lavoro interrompibili.

Segnale d'esame: "Minimizza il costo per un carico di lavoro prevedibile" → Piani di Risparmio o Istanza Salva. "Elaborazione batch a riluttanza" → Spot. "Imprevedibile o a breve termine" → On-Demand.

---

**Prezzi del Trasferimento Dati** *(Capitolo 30)*

Inbound a AWS: gratuito. All'interno della stessa AZ: gratuito. Tra le stesse AZ: $0,01/GB in entrambe le direzioni. Tra regioni diverse: $0,02-0,08/GB. Internet (outbound): ~$0,09/GB. Elaborazione Gateway NAT: $0,045/GB. Il trasferimento dati da CloudFront è più economico rispetto al trasferimento diretto da EC2 a Internet e la memorizzazione nella cache riduce il volume totale.

Segnale d'esame: "Riduce i costi di trasferimento dati per S3/DynamoDB da una sottorete privata" → Endpoint Gateway (gratuito). "Riduce i costi del Gateway NAT per altri servizi" → Endpoint Interfaccia.

---

## Osservabilità

**CloudWatch** *(riferimento in tutto il libro)*

Monitoraggio e osservabilità. Metriche CloudWatch: dati a serie temporanee numeriche da servizi AWS e applicazioni personalizzate. Log CloudWatch: raccoglie, cerca e analizza i dati dei log. Allarmi CloudWatch: attiva notifiche o scalabilità automatica in base alle soglie delle metriche. Dashboard CloudWatch: visualizza le metriche.

Key concepts: Dimensioni metriche, periodi di conservazione, gruppi di log e flussi di log, filtri metriche, CloudWatch Agent (per metriche e log di livello OS da EC2), Container Insights.

---

**CloudTrail** *(riferimento in tutto il libro)*

Registra ogni chiamata API effettuata nel tuo account AWS: chi l'ha fatta, da dove, quando e qual è stata la risposta. Il percorso multi-regione memorizza i log in S3 indefinitamente. Viene utilizzato per l'audit di sicurezza, la conformità e l'indagine sugli incidenti.

Segnale d'esame: "Chi ha eliminato quella risorsa?" "Verifica tutte le attività API" → CloudTrail.

---

**AWS Config** *(riferimento nel Capitolo 31)*

Traccia le modifiche alla configurazione delle risorse nel tempo. Valuta le risorse rispetto alle regole di conformità. Registra la cronologia di ogni modifica alla configurazione per ogni risorsa. Si integra con Systems Manager per la risoluzione dei problemi.

Segnale d'esame: "Questa risorsa è conforme alla nostra politica di sicurezza?" "Come appariva la configurazione di questa risorsa la settimana scorsa?" → AWS Config.

---

## Architettura Ben Progettata

**I Sei Pilastri** *(Capitolo 31)*

| Pilastro                | Domanda fondamentale                   | Servizi chiave                                     |
|------------------------|-----------------------------------------|--------------------------------------------------|
| Eccellenza Operativa   | Stiamo operando bene?                    | CloudWatch, CloudTrail, SSM, Config               |
| Sicurezza               | Siamo protetti?                       | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Affidabilità            | Ci riprendiamo dai guasti?             | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Efficienza delle Prestazioni | Stiamo utilizzando le risorse giuste?       | Ridimensionamento, Auto Scaling, CloudFront, Kinesis |
| Ottimizzazione dei Costi | Stiamo spendendo saggiamente?            | Savings Plans, Spot, ciclo di vita di S3, VPC Endpoints |
| Sostenibilità          | Stiamo minimizzando l'impatto ambientale? | Ridimensionamento, Graviton, livelli di archiviazione efficienti |

AWS Well-Architected Tool: valuta la tua architettura rispetto ai sei pilastri. Usalo prima dell'esame per comprendere il ragionamento alla base di ogni domanda dei pilastri.
