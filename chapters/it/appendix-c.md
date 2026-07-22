# Appendice C: Concept Registry

Ogni concetto chiave introdotto nel libro, mappato al suo capitolo, all'analogia utilizzata e al dominio SAA-C03 in cui compare.

Usa questo come indice di studio: se sei incerto su un concetto prima dell'esame, cercalo qui e torna al suo capitolo per il contesto.

---

## A

**ACM (AWS Certificate Manager)** — Certificati TLS pubblici gratuiti per ALB, CloudFront e API Gateway, con rinnovo automatico tramite validazione DNS. I certificati per CloudFront devono risiedere in us-east-1. Capitolo 16. Dominio 1.

**ACU (Aurora Capacity Unit)** — L'unità di misura per la capacità di Aurora Serverless v2. Si scala automaticamente e, sulle versioni di motore supportate, può auto-sospendersi a 0 ACU quando non ci sono connessioni attive. Capitolo 24. Dominio 3.

**Alarm (CloudWatch)** — Una regola che si attiva quando una metrica supera una soglia, innescando una notifica o un'azione di auto scaling. Capitolo 7. Dominio 2.

**ALB (Application Load Balancer)** — Load balancer di livello 7 che instrada il traffico HTTP/HTTPS in base a regole di path e host. Capitolo 7. Dominio 2.

**AMI (Amazon Machine Image)** — Un template contenente il sistema operativo, il software e la configurazione per un'istanza EC2. Capitolo 4. Dominio 3.

**Architect mindset** — Porsi le domande "cosa si rompe per primo, come lo sappiamo e cosa fa qualcuno alle 3 di notte?" invece di limitarsi a "come funziona questo?". Capitolo 32, Capitolo 34. Trasversale a tutti i domini.

**Architecture Decision Record (ADR)** — Un breve documento che cattura una decisione, le sue alternative, la sua motivazione e ciò che ne causerebbe il riesame. Capitolo 32. Trasversale a tutti i domini.

**Architecture review** — Un processo strutturato che copre: vincoli → incognite → opzioni → modalità di guasto → monitoraggio → runbook. Capitolo 32. Trasversale a tutti i domini.

**Athena** — Servizio di query SQL serverless per i dati in S3. Si paga per TB scansionato. Funziona meglio con formati colonnari Parquet/ORC. Capitolo 26. Dominio 3.

**Auto Scaling Group (ASG)** — Un gruppo di istanze EC2 gestite insieme, che sostituisce automaticamente le istanze non integre e scala in base al carico. Capitolo 7. Dominio 2, 3.

**Availability Zone (AZ)** — Uno o più data center fisicamente separati all'interno di una region, collegati da link a bassa latenza. Capitolo 2. Dominio 2.

---

## B

**AWS Backup** — Backup centralizzato e basato su policy per EBS, RDS, DynamoDB, EFS e Storage Gateway. Supporta copie cross-region e cross-account. Capitoli 18, 23. Dominio 2.

**AWS Batch** — Compute batch gestito per container Docker. Composto da una job definition (cosa eseguire), una job queue (dove i job attendono) e un compute environment (EC2 o Fargate, On-Demand o Spot). Per workload che superano il limite di 15 minuti di Lambda. Capitolo 21. Dominio 3.

**Bucket (S3)** — Un contenitore per gli oggetti S3. I bucket hanno nomi globalmente univoci e risiedono in una region specifica. Capitolo 5. Dominio 3.

**Bucket policy** — Una policy resource-based allegata a un bucket S3 che controlla l'accesso per i principal IAM e gli account esterni. Capitolo 5. Dominio 1.

---

## C

**Cache-aside pattern** — L'applicazione controlla prima la cache; in caso di miss, interroga il database, poi memorizza il risultato nella cache. Capitolo 10. Dominio 3.

**Cache hit rate** — Percentuale di richieste servite dalla cache anziché dall'origine. Più alta è, meglio è. Capitolo 13. Dominio 3.

**AWS Client VPN** — Endpoint OpenVPN gestito. Connette singoli dispositivi (laptop, workstation) a un VPC tramite internet. Autenticazione tramite Active Directory, federazione SAML 2.0 con un identity provider, o mutual TLS. Supporta modalità split-tunnel e full-tunnel. Da non confondere con Site-to-Site VPN (network-to-network). Capitolo 11. Dominio 1.

**CloudFront** — CDN di AWS. Memorizza nella cache i contenuti in oltre 750 edge location in tutto il mondo. Riduce la latenza e i costi di trasferimento dati verso l'origine. Capitolo 13. Dominio 3, 4.

**CloudTrail** — Registra ogni chiamata API AWS: chi, cosa, quando, da dove. Archiviato in S3. Usato per audit e indagini sugli incidenti. Dominio 1.

**CloudWatch** — Metriche, log, allarmi e dashboard per le risorse AWS e le applicazioni personalizzate. Citato in tutto il libro. Tutti i domini.

**Amazon Cognito** — Autenticazione per gli utenti finali della tua applicazione: User Pool sono una directory utenti gestita (registrazione, login, MFA, social login, JWT); Identity Pool emettono credenziali AWS temporanee. IAM è per i tuoi sviluppatori; Cognito è per i tuoi clienti. Capitolo 14. Dominio 1.

**Cold start (Lambda)** — Ritardo alla prima invocazione (o dopo inattività) mentre Lambda inizializza l'ambiente di esecuzione. Usa la provisioned concurrency per eliminarlo. Capitolo 20. Dominio 3.

**Compute Savings Plan** — Impegno su un importo di spesa oraria in EC2, applicabile a qualsiasi tipo o dimensione di istanza. Capitolo 27. Dominio 4.

**Config (AWS)** — Traccia le modifiche alla configurazione delle risorse AWS nel tempo e valuta la conformità rispetto alle regole. Capitolo 31. Dominio 1.

**AWS Control Tower** — Automatizza la governance multi-account: costruisce una landing zone (account di gestione, log archive e audit) con guardrail in pochi minuti — la versione prefabbricata del collegamento manuale di Organizations, CloudTrail e Config. Capitolo 14. Dominio 1.

**Cross-AZ data transfer** — Traffico tra Availability Zone all'interno di una region. Addebitato a $0,01/GB per direzione. Capitolo 30. Dominio 4.

**Cross-region replication** — Copia dei dati (S3 CRR, Aurora Global, DynamoDB Global Tables) in una region diversa. Comporta costi di trasferimento dati. Capitoli 18, 23, 30. Dominio 2.

---

## D

**AWS DataSync** — Migrazione e sincronizzazione basata su agent di file share (NFS/SMB) verso S3, EFS o FSx. "rsync con gli steroidi, con una console AWS." Capitolo 25. Dominio 3.

**DAX (DynamoDB Accelerator)** — Cache in memoria specificamente per DynamoDB. Latenza di lettura in microsecondi. Capitolo 9. Dominio 3.

**Dead Letter Queue (DLQ)** — Una coda in cui vengono inviati i messaggi che falliscono ripetutamente l'elaborazione, evitando il blocco della coda. Capitolo 19. Dominio 2.

**AWS DMS (Database Migration Service)** — Migra database su AWS con tempi di inattività minimi. Full load (copia iniziale) più CDC (Change Data Capture) mantiene sincronizzati sorgente e destinazione durante la migrazione. Migrazioni omogenee (stesso tipo di motore): usa DMS direttamente. Migrazioni eterogenee (tipi di motore diversi, es. Oracle → Aurora PostgreSQL): usa prima SCT (Schema Conversion Tool), poi DMS. Capitolo 8. Dominio 3.

**Dedicated Host** — Un server EC2 fisico riservato esclusivamente al tuo utilizzo. Richiesto per determinate licenze software. Capitolo 27. Dominio 4.

**Defense in depth** — Stratificazione di più controlli di sicurezza (IAM + security group + NACL + WAF + GuardDuty) in modo che la compromissione di un livello non esponga il sistema. Capitolo 33. Dominio 1.

**Direct Connect** — Una connessione di rete privata dedicata da una sede on-premises ad AWS. Più stabile di una VPN. Capitolo 25. Dominio 3.

**DLQ** — Vedi Dead Letter Queue.

**DynamoDB** — Database NoSQL completamente gestito con latenza a singola cifra di millisecondi a qualsiasi scala. Modello chiave-valore e documento. Capitolo 9. Dominio 3.

**DynamoDB Auto Scaling** — Regola automaticamente la capacità di lettura/scrittura provisioned in base alle metriche CloudWatch. Capitolo 29. Dominio 4.

**DynamoDB Streams** — Un log ordinato nel tempo di tutte le modifiche agli elementi in una tabella DynamoDB. Usato con Lambda per l'elaborazione event-driven. Capitolo 9. Dominio 2.

---

## E

**EBS (Elastic Block Store)** — Block storage collegato a una singola istanza EC2. Persiste in modo indipendente. Tipi: gp3, io2, st1. Capitolo 6. Dominio 3.

**EC2 (Elastic Compute Cloud)** — Macchine virtuali nel cloud. Capitolo 4. Dominio 3.

**ECS (Elastic Container Service)** — Orchestrazione di container gestita. Il launch type Fargate elimina la gestione dei server. Capitolo 21. Dominio 2, 3.

**EFS (Elastic File System)** — File system NFS condiviso accessibile da più istanze EC2. Si scala automaticamente. Le storage class includono Standard, Infrequent Access e Archive, con Intelligent-Tiering per lo spostamento automatico tra i livelli. Capitolo 6. Dominio 3.

**EKS (Elastic Kubernetes Service)** — Control plane Kubernetes gestito su AWS. Capitolo 21. Dominio 3.

**Elastic Disaster Recovery (DRS)** — Replica a livello di blocco in continuo di server (on-premises o EC2) in un'area di staging a basso costo, con istanze di recovery avviate in pochi minuti — un pilot light gestito. Capitolo 18. Dominio 2.

**ElastiCache** — Caching in memoria gestito. Valkey o Redis OSS (funzionalità più ricche) o Memcached (più semplice). Valkey è il fork open-source di Redis che AWS usa ora come default — compatibile con l'API, a prezzo inferiore; l'esame SAA-C03 dice ancora "Redis e Memcached." Capitolo 10. Dominio 3.

**Elastic IP** — Un indirizzo IP pubblico statico che puoi allocare e riassociare alle istanze EC2. Capitolo 11. Dominio 3.

**Envelope encryption** — Un pattern in cui i dati vengono crittografati con una data key (DEK) e la DEK viene crittografata con una master key (CMK in KMS). Capitolo 16. Dominio 1.

**EventBridge** — Event bus per il routing di eventi da servizi AWS, partner SaaS e sorgenti personalizzate verso target. Supporta regole schedulate. Capitolo 22. Dominio 2.

**Explicit deny** — Un'istruzione IAM di deny che non può essere annullata da alcun allow. Ha la precedenza su tutti gli allow. Capitolo 3. Dominio 1.

---

## F

**Failover routing (Route 53)** — Instrada il traffico verso un endpoint secondario quando quello primario non supera i health check. Capitolo 12. Dominio 2.

**Fargate** — Motore di compute serverless per ECS e EKS. Nessuna istanza EC2 da gestire. Capitolo 21. Dominio 3.

**Fan-out pattern** — Un topic SNS consegna lo stesso messaggio a più code SQS simultaneamente. Capitolo 19. Dominio 2.

**FIFO queue (SQS)** — Elaborazione exactly-once, ordinamento rigoroso. Throughput inferiore rispetto alle code standard. Capitolo 19. Dominio 2.

**Failure mode** — Un modo specifico in cui un sistema può guastarsi. Identificare i failure mode prima della messa in produzione è il nucleo dell'architecture review. Capitolo 32. Trasversale a tutti i domini.

---

## G

**Gateway Endpoint** — Un tipo di VPC endpoint gratuito per S3 e DynamoDB. Instrada il traffico attraverso la rete privata AWS, eliminando i costi del NAT Gateway. Capitolo 30. Dominio 4.

**Gateway Load Balancer (GWLB)** — Load balancer di livello 3 per inserire inline nel flusso di traffico appliance di rete virtuali di terze parti (firewall, IDS/IPS). Capitolo 7. Dominio 1.

**Geolocation routing (Route 53)** — Instrada in base alla posizione geografica dell'origine della query DNS. Capitolo 12. Dominio 3.

**Global Accelerator** — Instrada il traffico verso l'edge AWS più vicino tramite Anycast, migliorando la latenza per le applicazioni dinamiche. Capitolo 25. Dominio 3.

**Glue (AWS)** — ETL serverless. I Glue Crawler scoprono lo schema; i Glue Job trasformano i dati; il Data Catalog archivia i metadati. Capitolo 26. Dominio 3.

**GSI (Global Secondary Index)** — Un indice alternativo su una tabella DynamoDB con una partition key diversa e una sort key opzionale. Consente pattern di query flessibili. Capitolo 9. Dominio 3.

**GuardDuty** — Servizio di rilevamento delle minacce che usa il ML su CloudTrail, VPC Flow Log e log DNS per individuare attività anomale. Capitolo 17. Dominio 1.

---

## H

**Health check (Route 53)** — Monitora la disponibilità di un endpoint. I health check falliti innescano il failover routing. Capitolo 12. Dominio 2.

**Hot partition (DynamoDB)** — Una partizione che riceve traffico sproporzionato perché molte richieste condividono la stessa partition key. Capitolo 9. Dominio 3.

---

## I

**IAM (Identity and Access Management)** — Controlla autenticazione e autorizzazione per gli account AWS. Utenti, gruppi, ruoli, policy. Capitolo 3, 14. Dominio 1.

**IAM role** — Un'identità IAM con credenziali temporanee, assunta da servizi, utenti o altri account. Capitolo 3, 14. Dominio 1.

**Idempotency** — La proprietà di un'operazione che produce lo stesso risultato indipendentemente da quante volte viene chiamata. Critica per i sistemi distribuiti (rimborsi, pagamenti, elaborazione degli ordini). Capitolo 32. Trasversale a tutti i domini.

**Idempotency key** — Un identificatore univoco per un'operazione, verificato prima dell'esecuzione per prevenire l'elaborazione duplicata. Capitolo 32. Trasversale a tutti i domini.

**Interface Endpoint (PrivateLink)** — Un VPC endpoint per la maggior parte dei servizi AWS. Tariffato per ora + per GB. Fornisce connettività privata senza internet o NAT. Capitolo 30. Dominio 4.

**Internet Gateway (IGW)** — Consente alle istanze nelle subnet pubbliche di comunicare con internet. Richiede che la route table della subnet abbia una route verso l'IGW. Capitolo 11. Dominio 3.

**"It depends"** — La risposta onesta alla maggior parte delle domande di architettura, che deve sempre essere completata: "Dipende dall'access pattern / dalla scala / dalla conseguenza del guasto / dal vincolo di costo." Capitolo 33. Trasversale a tutti i domini.

---

## K

**Kinesis Data Firehose** — Nome precedente di Amazon Data Firehose: consegna gestita di dati in streaming verso S3, Redshift, OpenSearch. Nessuna gestione dei consumer. Le domande d'esame più vecchie potrebbero usare ancora il vecchio nome. Capitolo 26. Dominio 3.

**Kinesis Data Streams** — Stream di eventi in tempo reale ordinati. Durabile, riproducibile entro la finestra di retention (24 ore di default, fino a 365 giorni). Misurato in shard. Capitolo 26. Dominio 3.

**KMS (Key Management Service)** — Crea, archivia e controlla le chiavi crittografiche per la crittografia a riposo. Capitolo 16. Dominio 1.

---

## L

**Lambda** — Funzioni serverless attivate da eventi. Si paga per invocazione e per ms. Durata massima 15 minuti. Capitolo 20. Dominio 2, 3, 4.

**Lambda@Edge** — Funzioni Lambda che vengono eseguite nelle edge location di CloudFront, modificando richieste e risposte. Capitolo 13. Dominio 3.

**AWS Lake Formation** — Layer centralizzato di controllo degli accessi al data lake su S3 e il Glue Data Catalog. Fornisce permessi granulari a livello di tabella, colonna e riga. Semplifica la configurazione sicura di un data lake. Capitolo 26. Dominio 3.

**Latency-based routing (Route 53)** — Instrada le query DNS alla region AWS con la latenza misurata più bassa. Capitolo 12. Dominio 3.

**Launch template** — Un template versionato che specifica la configurazione delle istanze EC2 per gli Auto Scaling Group. Capitolo 7. Dominio 3.

**Least privilege** — Best practice IAM: concedi solo i permessi necessari, niente di più. Capitolo 3. Dominio 1.

**Lifecycle policy (S3)** — Regole che spostano automaticamente gli oggetti verso storage class più economiche o li eliminano in base all'età. Capitolo 23. Dominio 4.

**LSI (Local Secondary Index)** — Un indice alternativo su una tabella DynamoDB che usa la stessa partition key ma una sort key diversa. Deve essere creato al momento della creazione della tabella. Capitolo 9. Dominio 3.

---

## M

**Amazon Macie** — Individuazione basata su ML di dati sensibili (PII) in S3 e segnalazione dei rischi di esposizione. GuardDuty osserva i comportamenti; Macie controlla cosa è archiviato. Capitolo 17. Dominio 1.

**Memcached** — Motore di caching in memoria semplice e multi-thread. Nessuna persistenza, nessuna struttura dati. Usa Redis a meno che tu non abbia specificamente bisogno del multi-threading a scapito delle funzionalità. Capitolo 10. Dominio 3.

**Amazon MemoryDB for Redis** — Database primario in memoria durevole e compatibile con Redis. A differenza di ElastiCache, MemoryDB scrive su un transaction log Multi-AZ, garantendo la durabilità dei dati. Da usare quando è richiesta la compatibilità con l'API Redis E la perdita di dati non è accettabile. Capitolo 10. Dominio 3.

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: replica a livello di blocco di interi server in AWS, avvio di test, poi cutover su istanze EC2 native. DataSync sposta i file; DMS sposta i database; MGN sposta i server. Capitolo 25. Dominio 3.

**Amazon MQ** — Broker ActiveMQ/RabbitMQ gestito che parla protocolli standard (AMQP, MQTT, STOMP). Per il lift-and-shift di workload broker esistenti senza modifiche al codice; per la messaggistica greenfield → SQS/SNS. Capitolo 19. Dominio 2.

**Multi-AZ (RDS)** — Replica standby sincrona in una diversa AZ con failover automatico. RPO ~0, RTO ~60 secondi. Per l'alta disponibilità, non per il read scaling. Capitolo 8, 18. Dominio 2.

**Multi-Region** — Distribuzione dei componenti dell'applicazione su più region AWS per la ridondanza geografica e le prestazioni globali. Maggiore complessità e costo. Capitolo 18. Dominio 2.

---

## N

**Network Load Balancer (NLB)** — Load balancer di livello 4 (TCP/UDP/TLS): milioni di richieste al secondo, IP statico per AZ, preserva l'IP sorgente. Nessuna consapevolezza HTTP — quello è il lavoro dell'ALB. Capitolo 7. Dominio 3.

**NACL (Network Access Control List)** — Firewall stateless a livello di subnet. Richiede sia regole in entrata che in uscita. Le regole vengono valutate in ordine numerico. Capitolo 15. Dominio 1.

**NAT Gateway** — Consente alle istanze nelle subnet private di effettuare connessioni in uscita verso internet. Addebita $0,045/GB elaborato. Capitolo 11, 30. Dominio 4.

---

## O

**Object (S3)** — Un file archiviato in S3. È composto da chiave (nome), valore (dati) e metadati. Dimensione massima 5 TB. Capitolo 5. Dominio 3.

**On-Demand capacity (DynamoDB)** — Modalità di pagamento per richiesta. Più costosa per richiesta rispetto alla modalità provisioned, ma non richiede pianificazione della capacità. Capitolo 29. Dominio 4.

**On-Demand instances (EC2)** — Pagamento a ore senza impegno. Massima flessibilità, prezzo massimo. Capitolo 27. Dominio 4.

**AWS Outposts** — Un rack di hardware AWS completamente gestito installato nel data center del cliente o in una struttura di co-location. Esegue gli stessi servizi AWS, API e strumenti del cloud pubblico on-premises. AWS gestisce l'installazione e il patching; il cliente fornisce lo spazio nel rack e l'alimentazione. Per la residenza dei dati, workload on-premises a bassa latenza o scenari disconnessi. Capitolo 2. Dominio 4.

---

## P

**Partition key (DynamoDB)** — Il componente della chiave primaria che determina in quale partizione viene archiviato un elemento. Scegli una chiave ad alta cardinalità per una distribuzione uniforme. Capitolo 9. Dominio 3.

**Permission boundary** — Una policy IAM che imposta i permessi massimi che un'identità IAM può avere, anche se altre policy ne concedono di più. Capitolo 14. Dominio 1.

**Placement group** — Controlla il posizionamento fisico delle istanze EC2 per minimizzare la latenza (cluster) o massimizzare la disponibilità (spread). Capitolo 4. Dominio 3.

**PrivateLink** — Servizio AWS per la creazione di endpoint privati verso servizi ospitati in AWS, accessibili tramite Interface Endpoint. Capitolo 30. Dominio 1.

**Provisioned concurrency (Lambda)** — Ambienti di esecuzione pre-inizializzati che eliminano i ritardi di cold start. Capitolo 20. Dominio 3.

**Provisioned capacity (DynamoDB)** — Throughput di lettura e scrittura pre-allocato, misurato in capacity unit al secondo. Più economico della modalità on-demand per traffico prevedibile. Capitolo 9, 29. Dominio 4.

---

## Q

**Amazon QuickSight** — Servizio di business intelligence e visualizzazione dati gestito. Usa SPICE (Super-fast, Parallel, In-memory Calculation Engine) per mettere in cache i dati e rendere le dashboard veloci. Si connette ad Athena, S3, Redshift, RDS e altre sorgenti dati AWS. Nessun server BI da gestire. Capitolo 26. Dominio 3.

---

## R

**RDS (Relational Database Service)** — Database relazionale gestito. Gestisce backup, patching e failover. Capitolo 8. Dominio 3.

**RDS Proxy** — Gestisce un connection pool tra Lambda/applicazione e RDS, prevenendo l'esaurimento delle connessioni. Capitolo 8. Dominio 3.

**Read Replica (RDS)** — Copia asincrona del database per il read scaling. NON fornisce failover automatico. Capitolo 8, 24. Dominio 3.

**Redis** — Store di strutture dati in memoria usato per caching, gestione delle sessioni, leaderboard in tempo reale, pub/sub. Su AWS, ora offerto come "Redis OSS" insieme a **Valkey**, il fork open-source compatibile con l'API che AWS usa come default. Capitolo 10. Dominio 3.

**Reserved Instance (EC2)** — Un impegno a usare un tipo di istanza specifico in una region specifica per 1 o 3 anni in cambio di uno sconto. Capitolo 27. Dominio 4.

**Route 53** — Servizio DNS e domain registrar di AWS. Supporta molteplici routing policy. Capitolo 12. Dominio 2, 3.

**RPO (Recovery Point Objective)** — La massima perdita di dati accettabile misurata nel tempo. "Quanti dati possiamo permetterci di perdere?" Capitolo 18. Dominio 2.

**RTO (Recovery Time Objective)** — Il tempo massimo accettabile per ripristinare il servizio dopo un guasto. "Per quanto tempo possiamo rimanere offline?" Capitolo 18. Dominio 2.

**Runbook** — Istruzioni passo per passo per l'operazione di un sistema, specificamente per la risposta agli incidenti. "Cosa fa qualcuno alle 3 di notte?" Capitolo 32. Trasversale a tutti i domini.

---

## S

**S3 Intelligent-Tiering** — Sposta automaticamente gli oggetti S3 tra i livelli di accesso in base ai pattern di accesso. Nessuna tariffa di recupero. Capitolo 23. Dominio 4.

**S3 Select** — Recupera un sottoinsieme del contenuto di un oggetto S3 usando espressioni SQL, riducendo il trasferimento dati. Legacy: non disponibile per i nuovi clienti dalla metà del 2024 — Athena è ora il percorso principale per filtrare e interrogare i dati in S3. S3 Object Lambda, un tempo l'alternativa suggerita, è anch'essa legacy (chiusa ai nuovi clienti a novembre 2025; i workload esistenti continuano a funzionare). Capitolo 30. Dominio 4.

**Savings Plan** — Un modello di prezzo flessibile che prevede un impegno su un importo di spesa oraria in cambio di uno sconto. Più flessibile delle Reserved Instance. Capitolo 27. Dominio 4.

**SCP (Service Control Policy)** — Policy di AWS Organizations che limita i permessi massimi disponibili per gli account in una OU. Capitolo 14. Dominio 1.

**Secrets Manager** — Archivia e ruota automaticamente i secret (password di database, chiavi API). Capitolo 16. Dominio 1.

**Security group** — Un firewall virtuale stateful a livello di istanza. Solo regole di allow; il traffico di ritorno è automatico. Capitolo 15. Dominio 1.

**Shard (Kinesis)** — L'unità base di throughput in Kinesis Data Streams: 1 MB/s in scrittura, 2 MB/s in lettura. Capitolo 26. Dominio 3.

**Shared Responsibility Model** — AWS è responsabile della sicurezza *del* cloud (infrastruttura); tu sei responsabile della sicurezza *nel* cloud (dati, configurazione, accessi). Capitolo 1. Dominio 1.

**Shield** — Protezione DDoS. Standard: gratuito, automatico. Advanced: a pagamento, con supporto DRT e protezione finanziaria. Capitolo 17. Dominio 1.

**Snow Family** — Dispositivi fisici per il trasferimento bulk di dati offline (Snowball Edge: 80 TB) — come noleggiare un volo cargo invece di guidare in autostrada. Legacy (2026): Snowmobile e Snowcone dismessi; i dispositivi Snow chiusi ai nuovi clienti a novembre 2025 (AWS rimanda a DataSync e Data Transfer Terminal), ma l'esame SAA-C03 si aspetta ancora Snowball per "settimane di trasferimento, larghezza di banda limitata." Capitolo 25. Dominio 3.

**SNS (Simple Notification Service)** — Messaggistica pub/sub. Invia messaggi a tutti i subscriber simultaneamente. Fan-out pattern. Capitolo 19. Dominio 2.

**Sort key (DynamoDB)** — Secondo componente opzionale della chiave primaria. Consente query di intervallo all'interno di una partizione. Capitolo 9. Dominio 3.

**Spot Instances** — Istanze EC2 che sfruttano la capacità inutilizzata con uno sconto del 60-90%. Possono essere interrotte con un preavviso di 2 minuti. Solo per workload fault-tolerant. Capitolo 27. Dominio 4.

**SQS (Simple Queue Service)** — Coda di messaggi gestita. Disaccoppia i producer dai consumer. Code Standard (at-least-once) e FIFO (exactly-once). Capitolo 19. Dominio 2.

**Step Functions** — Servizio di orchestrazione serverless per workflow. State machine per coordinare i servizi AWS. Capitolo 22. Dominio 2.

**AWS Storage Gateway** — Il ponte tra lo storage on-premises e il cloud: presenta interfacce NFS/SMB (File), iSCSI (Volume) o nastro virtuale (Tape) in locale, archiviando i dati in S3, Glacier o snapshot EBS. Capitolo 6. Dominio 3.

---

## T

**Target tracking scaling** — Policy di Auto Scaling che regola la capacità per mantenere un valore target di una metrica (es. 60% di utilizzo CPU). Capitolo 7. Dominio 2.

**AWS Transfer Family** — Endpoint SFTP/FTPS/FTP gestito supportato da S3 o EFS. I partner mantengono i loro client SFTP esistenti; i file atterrano direttamente nel tuo bucket. Capitolo 25. Dominio 3.

**Transit Gateway** — Topologia di rete hub-and-spoke che connette più VPC e reti on-premises attraverso un gateway centrale. Capitolo 25. Dominio 3.

**TTL (Time to Live)** — Un timestamp dopo il quale DynamoDB elimina automaticamente un elemento. Usato anche nel DNS (per quanto tempo i resolver memorizzano nella cache un record) e nel caching (per quanto tempo un valore in cache è valido). Capitoli 9, 12. Dominio 3.

---

## V

**VIF (Virtual Interface)** — La connessione logica usata con AWS Direct Connect. La VIF pubblica accede agli endpoint pubblici AWS; la VIF privata accede alle risorse VPC. Capitolo 25. Dominio 3.

**Visibility timeout (SQS)** — Il periodo durante il quale un messaggio ricevuto è nascosto agli altri consumer. Consente l'elaborazione senza che altri consumer vedano lo stesso messaggio. Capitolo 19. Dominio 2.

**VPC (Virtual Private Cloud)** — Una rete virtuale isolata in AWS. Contiene subnet, route table e gateway. Capitolo 11. Dominio 1.

**VPC Endpoint** — Connette le risorse VPC ai servizi AWS tramite la rete privata AWS. Gateway (gratuito, S3/DynamoDB) e Interface (a pagamento, la maggior parte degli altri servizi). Capitolo 30. Dominio 1, 4.

**VPC Flow Logs** — Cattura informazioni sul traffico IP in entrata e in uscita dalle interfacce di rete in un VPC. Usato da GuardDuty e per il troubleshooting di rete. Capitolo 17. Dominio 1.

**VPC Peering** — Una connessione di rete tra due VPC che consente al traffico di instradare tra di essi usando indirizzi IP privati. Capitolo 11. Dominio 3.

---

## W

**WAF (Web Application Firewall)** — Filtra il traffico HTTP/HTTPS usando regole (blocchi IP, SQL injection, rate limit). Si collega a CloudFront, ALB o API Gateway. Capitolo 17. Dominio 1.

**AWS Wavelength** — Infrastruttura AWS distribuita all'interno delle reti dei provider di telecomunicazioni 5G al radio edge. Consente latenza a singola cifra di millisecondi verso i dispositivi mobili. Per AR/VR mobile, gaming in tempo reale, telemetria dei veicoli autonomi e video live al 5G edge. Le Wavelength Zone sono estensioni delle Region AWS all'interno delle reti telecom. Capitolo 2. Dominio 3.

**Well-Architected Framework** — Il framework di valutazione a sei pilastri di AWS: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Capitolo 31. Trasversale a tutti i domini.

**Weighted routing (Route 53)** — Distribuisce le query DNS tra gli endpoint in base al peso. Usato per i deployment blue-green e per i test A/B. Capitolo 12. Dominio 3.

**Write-through caching** — Aggiorna la cache ogni volta che il database viene aggiornato. I dati sono sempre consistenti, ma la cache può contenere molti elementi che non verranno mai riletti. Capitolo 10. Dominio 3.

---

## SAA-C03 Quick Pattern Reference

| Se l'esame dice...                                     | Pensa...                                             |
|--------------------------------------------------------|------------------------------------------------------|
| "Decouple services"                                    | SQS, SNS, EventBridge                                |
| "Fan-out to multiple consumers"                        | SNS + sottoscrizioni SQS                             |
| "Real-time ordered events"                             | Kinesis Data Streams                                 |
| "Serverless"                                           | Lambda, DynamoDB, Aurora Serverless, Fargate         |
| "Global low latency (dynamic)"                         | Global Accelerator                                   |
| "Global low latency (static/cached)"                   | CloudFront                                           |
| "DDoS protection"                                      | Shield (Standard: gratuito; Advanced: a pagamento)   |
| "Block SQL injection at edge"                          | WAF                                                  |
| "Detect compromised credentials"                       | GuardDuty                                            |
| "Audit API activity"                                   | CloudTrail                                           |
| "Rotate database credentials"                          | Secrets Manager                                      |
| "Encrypt data at rest, customer-managed keys"          | KMS con CMK                                          |
| "Store configuration values"                           | SSM Parameter Store                                  |
| "High IOPS database storage"                           | io2 EBS                                              |
| "Shared file system for EC2"                           | EFS                                                  |
| "Query S3 data with SQL"                               | Athena                                               |
| "ETL pipeline for analytics"                           | AWS Glue                                             |
| "Deliver streaming data to S3"                         | Amazon Data Firehose                                 |
| "Fault-tolerant batch jobs, minimize cost"             | Spot Instances                                       |
| "Committed, stable production workload"                | Savings Plans                                        |
| "Private subnet → S3 without NAT"                      | S3 Gateway Endpoint                                  |
| "Private subnet → SQS without NAT"                     | SQS Interface Endpoint                               |
| "Multi-AZ for RDS"                                     | Failover automatico (non read scaling)               |
| "Read Replica for RDS"                                 | Read scaling (non failover automatico)               |
| "Recovery time of 1–2 minutes, cross-AZ"               | Multi-AZ (RDS failover: 60–120 secondi)              |
| "Recovery across regions, minutes RTO"                 | Pilot Light o Warm Standby                           |
| "Active-Active, zero RTO"                              | Multi-Region Active-Active (la più complessa)        |
| "Batch processing beyond Lambda timeout"               | AWS Batch                                            |
| "Redis-compatible AND durable"                         | MemoryDB for Redis                                   |
| "Remote engineers access VPC from home"                | Client VPN                                           |
| "Migrate database with minimal downtime"               | DMS (+ SCT per le migrazioni eterogenee)             |
| "BI dashboard on AWS"                                  | QuickSight                                           |
| "Run AWS in your own data center"                      | Outposts                                             |
| "5G mobile edge compute"                               | Wavelength                                           |
