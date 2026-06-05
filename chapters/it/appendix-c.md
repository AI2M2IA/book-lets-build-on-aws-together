# Appendice C: Concept Registry

Ogni concetto chiave introdotto nel libro, mappato al suo capitolo, l'analogia utilizzata e il dominio SAA-C03 in cui compare.

Utilizzate questo come indice di studio: se siete incerti su un concetto prima dell'esame, trovate qui e ritornate al suo capitolo per il contesto.

---

## A

**ACU (Aurora Capacity Unit)** — L'unità di misura per la capacità di Aurora Serverless v2. Si scala automaticamente. Capitolo 24. Dominio 3.

**Allarme (CloudWatch)** — Una regola che si attiva quando una metrica supera una soglia, innescando una notifica o un'azione di autoscaling. Capitolo 7. Dominio 2.

**ALB (Application Load Balancer)** — Load balancer di livello 7 che indirizza il traffico HTTP/HTTPS in base a regole di percorso e host. Capitolo 7. Dominio 2.

**AMI (Amazon Machine Image)** — Un modello contenente il sistema operativo, il software e la configurazione per un'istanza EC2. Capitolo 4. Dominio 3.

**Mentalità Architettonica** — Porre la domanda "cosa si rompe per primo, come lo sappiamo e cosa fa qualcuno alle 3 del mattino?" piuttosto che solo "come funziona questo?". Capitolo 32, Capitolo 34. Dominio trasversale.

**Registro Decisione Architetturale (ADR)** — Un breve documento che cattura una decisione, le sue alternative, la sua motivazione e cosa causerebbe una riesame. Capitolo 32. Dominio trasversale.

**Revisione Architetturale** — Un processo strutturato che copre: vincoli → incognite → opzioni → modalità di guasto → monitoraggio → manuali operativi. Capitolo 32. Dominio trasversale.

**Athena** — Servizio di query SQL serverless per i dati in S3. Pagamento per TB scansionati. Migliore con i formati a colonne Parquet/ORC. Capitolo 26. Dominio 3.

**Gruppo di Autoscaling (ASG)** — Un gruppo di istanze EC2 gestite insieme, che sostituisce automaticamente le istanze non funzionanti e scala in base al carico. Capitolo 7. Dominio 2, 3.

**Zona di Disponibilità (AZ)** — Un data center fisico o più data center connessi da collegamenti a bassa latenza all'interno di una regione. Capitolo 2. Dominio 2.

---

## B

**Bucket (S3)** — Un contenitore per gli oggetti S3. I bucket hanno nomi globali univoci e vivono in una regione specifica. Capitolo 5. Dominio 3.

**Politica del Bucket** — Una politica basata sulle risorse allegata a un bucket S3 che controlla l'accesso per gli IAM principal e gli account esterni. Capitolo 5. Dominio 1.

---

## C

**Pattern Cache-Aside** — L'applicazione controlla prima la cache; se manca, interroga il database, quindi memorizza il risultato nella cache. Capitolo 10. Dominio 3.

**Tasso di Hit della Cache** — La percentuale di richieste servite dalla cache piuttosto che dall'origine. Più alto è, meglio è. Capitolo 13. Dominio 3.

**CloudFront** — CDN AWS. Memorizza i contenuti in più di 400 posizioni edge in tutto il mondo. Riduce la latenza e i costi di trasferimento dei dati dell'origine. Capitolo 13. Dominio 3, 4.

**CloudTrail** — Registra ogni chiamata API AWS: chi, cosa, quando, da dove. Memorizzato in S3. Utilizzato per l'audit e l'indagine sugli incidenti. Dominio 1.

**CloudWatch** — Metriche, log, allarmi e dashboard per le risorse AWS e le applicazioni personalizzate. Riferimento in tutto. Tutti i domini.

**Cold Start (Lambda)** — Ritardo alla prima invocazione (o dopo l'inattività) mentre Lambda inizializza l'ambiente di esecuzione. Utilizzare la concorrenza provisionata per eliminarlo. Capitolo 20. Dominio 3.

**Piano di Risparmio Compute** — Un impegno di un importo di ore di spesa per istanze EC2, applicabile a qualsiasi tipo o dimensione di istanza. Capitolo 27. Dominio 4.

**Config (AWS)** — Traccia le modifiche alla configurazione delle risorse AWS nel tempo e valuta la conformità rispetto alle regole. Capitolo 31. Dominio 1.

**Trasferimento Dati Cross-AZ** — Traffico tra le Zone di Disponibilità all'interno di una regione. Addebitato a $0,01/GB in ogni direzione. Capitolo 30. Dominio 4.

**Replicazione Cross-Regione** — Copia dei dati (CRR S3, Aurora Global, DynamoDB Global Tables) in un'altra regione. Incurre costi di trasferimento dati. Capitoli 18, 30. Dominio 2.

---

## D

**DAX (DynamoDB Accelerator)** — Cache in memoria specificamente per DynamoDB. Latenza di lettura microseconda. Capitolo 9. Dominio 3.

**Coda di Messaggi Morti (DLQ)** — Una coda in cui i messaggi che falliscono nel processing ripetutamente vengono inviati, prevenendo il blocco della coda. Capitolo 19. Dominio 2.

**Host Dedicato** — Un server EC2 fisico riservato esclusivamente al tuo utilizzo. Richiesto per determinate licenze software. Capitolo 27. Dominio 4.

**Difesa a Strati** — Strati multipli di controlli di sicurezza (IAM + gruppi di sicurezza + ACL + WAF + GuardDuty) in modo che la compromissione di uno strato non esponga il sistema. Capitolo 33. Dominio 1.

**Direct Connect** — Una connessione di rete privata dedicata da una posizione on-premises a AWS. Più coerente rispetto a VPN. Capitolo 25. Dominio 3.

**DLQ** — Vedi Coda di Messaggi Morti.

**DynamoDB** — Database NoSQL gestito completamente con latenza a singola cifra millisecondi su qualsiasi scala. Modello chiave-valore e documento. Capitolo 9. Dominio 3.

**DynamoDB Auto Scaling** — Regola automaticamente la capacità di lettura/scrittura provisionata in base alle metriche CloudWatch. Capitolo 29. Dominio 4.

**DynamoDB Streams** — Un log di modifiche temporale di tutti gli elementi in una tabella DynamoDB. Utilizzato con Lambda per l'elaborazione guidata da eventi. Capitolo 9. Dominio 2.

---

## E

**EBS (Elastic Block Store)** — Archiviazione a blocchi allegata a un'istanza EC2. Persiste in modo indipendente. Tipi: gp3, io2, st1. Capitolo 6. Dominio 3.

**EC2 (Elastic Compute Cloud)** — Macchine virtuali nel cloud. Capitolo 4. Dominio 3.

**ECS (Elastic Container Service)** — Orchestrazione di container gestita. Il tipo di lancio Fargate elimina la gestione dei server. Capitolo 21. Dominio 2, 3.

**EFS (Elastic File System)** — File system NFS condiviso accessibile da più istanze EC2. Si scala automaticamente. Capitolo 6. Dominio 3.

**EKS (Elastic Kubernetes Service)** — Piano di controllo Kubernetes gestito su AWS. Capitolo 21. Dominio 3.

**ElastiCache** — Cache in-memory gestita. Redis (funzionalità più ricche) o Memcached (più semplice). Capitolo 10. Dominio 3.

**Elastic IP** — Un indirizzo IP pubblico statico che puoi allocare e riassociare alle istanze EC2. Capitolo 11. Dominio 3.

**Crittografia Envelope** — Un modello in cui i dati sono crittografati con una chiave di dati (DEK) e la DEK è crittografata con una chiave principale (CMK in KMS). Capitolo 16. Dominio 1.

**EventBridge** — Bus di eventi per il routing di eventi da servizi AWS, partner SaaS e fonti personalizzate verso destinazioni. Supporta regole programmate. Capitolo 22. Dominio 2.

**Rifiuto Esplicito** — Un'istruzione IAM di rifiuto che non può essere annullata da qualsiasi istruzione di permesso. Ha la precedenza su tutti i permessi. Capitolo 3. Dominio 1.

---

## F

**Routing di Failover (Route 53)** — Invia il traffico a un endpoint secondario quando l'endpoint primario fallisce i controlli di salute. Capitolo 12. Dominio 2.

**Fargate** — Motore di calcolo serverless per ECS e EKS. Nessuna istanza EC2 da gestire. Capitolo 21. Dominio 3.

**Pattern di "Fan-out"** — Un argomento SNS singolo consegna lo stesso messaggio a più code SQS simultaneamente. Capitolo 19. Dominio 2.

**FIFO Queue (SQS)** — Elaborazione "exactly-once", ordinamento rigoroso. Minore throughput rispetto alle code standard. Capitolo 19. Dominio 2.

**Modalità di Fallimento** — Un modo specifico in cui un sistema può fallire. L'identificazione delle modalità di fallimento prima della produzione è al centro della revisione dell'architettura. Capitolo 32. Dominio trasversale.

---

## G

**Gateway Endpoint** — Tipo di endpoint VPC gratuito per S3 e DynamoDB. Invia il traffico attraverso la rete privata AWS, eliminando le spese per i NAT Gateway. Capitolo 30. Dominio 4.

**Routing Geografico (Route 53)** — Invia il traffico in base alla posizione geografica dell'origine della query DNS. Capitolo 12. Dominio 3.

**Global Accelerator** — Invia il traffico al punto di presenza AWS più vicino tramite Anycast, migliorando la latenza per le applicazioni dinamiche. Capitolo 25. Dominio 3.

**Glue (AWS)** — ETL serverless. I crawler Glue scoprono gli schemi; i job Glue trasformano i dati; il Catalogo Dati memorizza i metadati. Capitolo 26. Dominio 3.

**GSI (Global Secondary Index)** — Un indice alternativo su una tabella DynamoDB con una chiave di partizione e una chiave di ordinamento opzionale diverse. Consente modelli di query flessibili. Capitolo 9. Dominio 3.

**GuardDuty** — Servizio di rilevamento delle minacce che utilizza il machine learning su CloudTrail, VPC Flow Logs e log DNS per rilevare attività anomale. Capitolo 17. Dominio 1.

---

## H

**Controllo di Salute (Route 53)** — Monitora la disponibilità dell'endpoint. I controlli di salute falliti innescano il routing di failover. Capitolo 12. Dominio 2.

**Partizione Calda (DynamoDB)** — Una partizione che riceve un traffico sproporzionato perché molte richieste condividono la stessa chiave di partizione. Capitolo 9. Dominio 3.

---

## I

**IAM (Identity and Access Management)** — Controlla l'autenticazione e l'autorizzazione per gli account AWS. Utenti, gruppi, ruoli, politiche. Capitolo 3, 14. Dominio 1.

**IAM role** — Un'identità IAM con credenziali temporanee, assunta da servizi, utenti o altri account. Capitolo 3, 14. Dominio 1.

**Idempotenza** — La proprietà di un'operazione che produce lo stesso risultato indipendentemente dal numero di volte in cui viene chiamata. Critico per i sistemi distribuiti (rimborsi, pagamenti, elaborazione degli ordini). Capitolo 32. Dominio trasversale.

**Idempotency key** — Un identificatore univoco per un'operazione, controllato prima dell'esecuzione per prevenire l'elaborazione duplicata. Capitolo 32. Dominio trasversale.

**Interface Endpoint (PrivateLink)** — Un endpoint VPC per la maggior parte dei servizi AWS. Prezzato per ora + per GB. Fornisce connettività privata senza internet o NAT. Capitolo 30. Dominio 4.

**Internet Gateway (IGW)** — Consente alle istanze nei subnet pubbliche di comunicare con internet. Richiede che la tabella di routing del sottorete abbia una rotta all'IGW. Capitolo 11. Dominio 3.

**"It depends"** — La risposta onesta alla maggior parte delle domande di architettura, che deve sempre essere completata: "Dipende dal modello di accesso / scala / conseguenza del fallimento / vincolo di costo." Capitolo 33. Dominio trasversale.

---

## K

**Kinesis Data Firehose** — Consegna gestita dei dati in streaming a S3, Redshift, OpenSearch. Nessun gestione del consumatore. Capitolo 26. Dominio 3.

**Kinesis Data Streams** — Flusso di eventi in tempo reale ordinato. Durabile, riproducibile. Misurato in shard. Capitolo 26. Dominio 3.

**KMS (Key Management Service)** — Crea, memorizza e controlla le chiavi crittografiche per la crittografia a riposo. Capitolo 16. Dominio 1.

**Routing basato sul latenza (Route 53)** — Instrada le query DNS alla regione AWS con la latenza misurata più bassa. Capitolo 12. Dominio 3.

**Modello di lancio** — Un modello versionato che specifica la configurazione dell'istanza EC2 per i Gruppi di Autoscaling. Capitolo 7. Dominio 3.

**Minimo privilegio** — Best practice IAM: concede solo le autorizzazioni necessarie, nessuna di più. Capitolo 3. Dominio 1.

**Politica di ciclo di vita (S3)** — Regole che automatizzano la transizione degli oggetti a classi di storage più economiche o li eliminano in base all'età. Capitolo 23. Dominio 4.

**Indice secondario locale (LSI)** — Un indice alternativo su una tabella DynamoDB utilizzando la stessa chiave di partizione ma una chiave di ordinamento diversa. Deve essere creato alla creazione della tabella. Capitolo 9. Dominio 3.

---

## M

**Memcached** — Motore di caching in memoria multi-thread, semplice. Nessuna persistenza, nessuna struttura di dati. Utilizza Redis a meno che tu non abbia bisogno specificamente del multi-threading a costo di funzionalità. Capitolo 10. Dominio 3.

**Multi-AZ (RDS)** — Replica di standby sincrona in un altro AZ con failover automatico. RPO ~0, RTO ~60 secondi. Per l'alta disponibilità, non per il bilanciamento del carico in lettura. Capitolo 8, 18. Dominio 2.

**Multi-Regione** — Distribuzione dei componenti dell'applicazione su più regioni AWS per la ridondanza geografica e le prestazioni globali. Maggiore complessità e costo. Capitolo 18. Dominio 2.

---

## N

**NACL (Lista di controllo di accesso alla rete)** — Firewall stateless a livello di subnet. Richiede sia regole di ingresso che di uscita. Le regole vengono valutate in ordine numerico. Capitolo 15. Dominio 1.

**NAT Gateway** — Consente alle istanze nei subnet privati di effettuare connessioni in uscita verso Internet. Costa $0.045/GB elaborato. Capitolo 11, 30. Dominio 4.

---

## O

**Oggetto (S3)** — Un file memorizzato in S3. Consiste in chiave (nome), valore (dati) e metadati. Dimensione massima 5TB. Capitolo 5. Dominio 3.

**Capacità on-demand (DynamoDB)** — Modalità di pagamento per richiesta. Più costoso per richiesta rispetto alla capacità preallocata, ma non è necessario pianificare la capacità. Capitolo 29. Dominio 4.

**Istanza on-demand (EC2)** — Pagamento a ore senza impegno. Massima flessibilità, massimo prezzo. Capitolo 27. Dominio 4.

---

## P

**Chiave di partizione (DynamoDB)** — Il componente chiave primario che determina in quale partizione viene memorizzato un elemento. Scegli una chiave ad alta cardinalità per una distribuzione uniforme. Capitolo 9. Dominio 3.

**Confine di autorizzazione** — Una politica IAM che imposta i permessi massimi che un'identità IAM può avere, anche se altre politiche concedono più permessi. Capitolo 14. Dominio 1.

**Gruppo di posizionamento** — Controlla il posizionamento fisico delle istanze EC2 per minimizzare la latenza (cluster) o massimizzare la disponibilità (diffusione). Capitolo 4. Dominio 3.

**PrivateLink** — Servizio AWS per la creazione di endpoint privati per i servizi ospitati in AWS, accessibili tramite Endpoint Interfaccia. Capitolo 30. Dominio 1.

**Concurrency preallocata (Lambda)** — Ambienti di esecuzione preinizializzati che eliminano i ritardi di avvio a freddo. Capitolo 20. Dominio 3.

**Capacità preallocata (DynamoDB)** — Capacità preassegnate di lettura e scrittura misurate in unità di capacità al secondo. Più economico rispetto al pagamento on-demand per il traffico prevedibile. Capitolo 9, 29. Dominio 4.

---

## R

**RDS (Servizio di database relazionale)** — Database relazionale gestito. Gestisce i backup, i patch, il failover. Capitolo 8. Dominio 3.

**RDS Proxy** — Gestisce una pool di connessioni tra Lambda/applicazione e RDS, prevenendo l'esaurimento delle connessioni. Capitolo 8. Dominio 3.

**Replica di lettura (RDS)** — Copia asincrona del database per il bilanciamento del carico in lettura. Non fornisce il failover automatico. Capitolo 8, 24. Dominio 3.

**Redis** — Memorizzazione dati in memoria utilizzata per la cache, la gestione delle sessioni, i leaderboard in tempo reale, pub/sub. Capitolo 10. Dominio 3.

**Istanza riservata (EC2)** — Un impegno per utilizzare un tipo di istanza specifico in una regione specifica per 1 o 3 anni in cambio di uno sconto. Capitolo 27. Dominio 4.

**Route 53** — Servizio DNS AWS e registrar di dominio. Supporta più politiche di routing. Capitolo 12. Dominio 2, 3.

**RPO (Obiettivo di ripristino del punto)** — La perdita di dati massima accettabile misurata nel tempo. "Quanto dati possiamo permetterci di perdere?" Capitolo 18. Dominio 2.

**RTO (Obiettivo di ripristino del tempo)** — Il tempo massimo accettabile per ripristinare il servizio dopo un guasto. "Quanto tempo possiamo essere inattivi?" Capitolo 18. Dominio 2.

**Runbook** — Istruzioni passo-passo per l'operazione di un sistema, specificamente per la risposta all'incidente. "Cosa fa qualcuno alle 3 del mattino?" Capitolo 32. Dominio incrociato.

---

## S

**S3 Intelligent-Tiering** — Sposta automaticamente gli oggetti S3 tra i livelli di accesso in base ai modelli di accesso. Nessuna tariffa di recupero. Capitolo 23. Dominio 4.

**S3 Select** — Recupera un sottoinsieme del contenuto dell'oggetto S3 utilizzando espressioni SQL, riducendo il trasferimento dati. Capitolo 30. Dominio 4.

**Piano di risparmio (Savings Plan)** — Un modello di prezzo flessibile che si impegna a una spesa oraria di dollari in cambio di uno sconto. Più flessibile rispetto alle istanze riservate. Capitolo 27. Dominio 4.

**SCP (Politica di controllo dei servizi)** — Politica AWS Organizations che limita i permessi massimi disponibili per gli account in un OU. Capitolo 14. Dominio 1.

**Secrets Manager** — Memorizza e ruota automaticamente i segreti (password di database, chiavi API). Capitolo 16. Dominio 1.

**Security group** — Un firewall virtuale a livello di istanza, dello stato. Permettono solo regole di accesso; il traffico di ritorno è automatico. Capitolo 15. Dominio 1.

**Shard (Kinesis)** — L'unità base di throughput in Kinesis Data Streams: 1 MB/s di scrittura, 2 MB/s di lettura. Capitolo 26. Dominio 3.

**Shared Responsibility Model** — AWS è responsabile della sicurezza *della* nuvola (infrastruttura); tu sei responsabile della sicurezza *nella* nuvola (dati, configurazione, accesso). Capitolo 1. Dominio 1.

**Shield** — Protezione DDoS. Standard: gratuito, automatico. Avanzato: a pagamento, con supporto DRT e protezione finanziaria. Capitolo 17. Dominio 1.

**SNS (Simple Notification Service)** — Pub/sub messaging. Invia messaggi a tutti gli abbonati simultaneamente. Pattern "fan-out". Capitolo 19. Dominio 2.

**Sort key (DynamoDB)** — Secondo componente opzionale della chiave primaria. Consente query di intervallo all'interno di una partizione. Capitolo 9. Dominio 3.

**Spot Instances** — Istanze EC2 che utilizzano capacità inutilizzata con uno sconto del 60-90%. Possono essere interrotte con un preavviso di 2 minuti. Solo per carichi di lavoro tolleranti ai guasti. Capitolo 27. Dominio 4.

**SQS (Simple Queue Service)** — Coda di messaggi gestita. Decoppia i produttori dai consumatori. Code standard (almeno una volta) e FIFO (esattamente una volta). Capitolo 19. Dominio 2.

**Step Functions** — Servizio di orchestrazione serverless per flussi di lavoro. Macchine a stati per la coordinazione dei servizi AWS. Capitolo 22. Dominio 2.

---

## T

**Target tracking scaling** — Politica di scalabilità automatica che regola la capacità per mantenere un valore di metrica di riferimento (ad esempio, l'utilizzo del 60% della CPU). Capitolo 7. Dominio 2.

**Transit Gateway** — Topologia di rete hub-and-spoke che collega più VPC e reti on-premises tramite un gateway centrale. Capitolo 25. Dominio 3.

**TTL (Time to Live)** — Un timestamp dopo il quale DynamoDB elimina automaticamente un elemento. Utilizzato anche in DNS (per quanto tempo i resolver memorizzano nella cache un record) e nella caching (per quanto tempo un valore memorizzato nella cache è valido). Capitoli 9, 12. Dominio 3.

---

## V

**VIF (Virtual Interface)** — La connessione logica utilizzata con AWS Direct Connect. VIF pubblico accede agli endpoint pubblici AWS; VIF privato accede alle risorse VPC. Capitolo 25. Dominio 3.

**Visibility timeout (SQS)** — Il periodo durante il quale un messaggio ricevuto è nascosto agli altri consumatori. Consente l'elaborazione senza che altri consumatori lo vedano. Capitolo 19. Dominio 2.

**VPC (Virtual Private Cloud)** — Una rete virtuale isolata in AWS. Contiene subnet, tabelle di routing e gateway. Capitolo 11. Dominio 1.

**VPC Endpoint** — Connette le risorse VPC ai servizi AWS tramite la rete privata AWS. Gateway (gratuito, S3/DynamoDB) e Interfaccia (a pagamento, la maggior parte degli altri servizi). Capitolo 30. Dominio 1, 4.

**VPC Flow Logs** — Cattura informazioni sul traffico IP che va e viene dalle interfacce di rete in una VPC. Utilizzato da GuardDuty e per il troubleshooting di rete. Capitolo 17. Dominio 1.

**VPC Peering** — Una connessione di rete tra due VPC che consente il routing del traffico tra di esse utilizzando indirizzi IP privati. Capitolo 11. Dominio 3.

---

## W

**WAF (Web Application Firewall)** — Filtra il traffico HTTP/HTTPS utilizzando regole (blocchi di IP, SQL injection, limiti di velocità). Si applica a CloudFront, ALB o API Gateway. Capitolo 17. Dominio 1.

**Well-Architected Framework** — Il framework di valutazione a sei pilastri di AWS: Eccellenza Operativa, Sicurezza, Affidabilità, Efficienza delle Prestazioni, Ottimizzazione dei Costi, Sostenibilità. Capitolo 31. Dominio incrociato.

**Weighted routing (Route 53)** — Distribuisce le query DNS agli endpoint in base al peso. Utilizzato per i deployment blue-green e A/B testing. Capitolo 12. Dominio 3.

**Write-through caching** — Aggiorna la cache ogni volta che il database viene aggiornato. I dati sono sempre coerenti, ma la cache può contenere molti elementi che non vengono mai riletti. Capitolo 10. Dominio 3.

---

## SAA-C03 Quick Pattern Reference

| Se l'esame dice...                           | Pensa...                                     |
|-----------------------------------------------|----------------------------------------------|
| "Decouple services"                           | SQS, SNS, EventBridge                        |
| "Fan-out to multiple consumers"               | SNS + Sottoscrizioni SQS                      |
| "Real-time ordered events"                    | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Global low latency (dynamic)"                | Global Accelerator                           |
| "Global low latency (static/cached)"          | CloudFront                                   |
| "DDoS protection"                             | Shield (Standard: gratuito; Advanced: a pagamento)      |
| "Block SQL injection at edge"                 | WAF                                          |
| "Detect compromised credentials"              | GuardDuty                                    |
| "Audit API activity"                          | CloudTrail                                   |
| "Rotate database credentials"                 | Secrets Manager                              |
| "Encrypt data at rest, customer-managed keys" | KMS con CMK                                 |
| "Store configuration values"                  | SSM Parameter Store                          |
| "High IOPS database storage"                  | io2 EBS                                      |
| "Shared file system for EC2"                  | EFS                                          |
| "Query S3 data with SQL"                      | Athena                                       |
| "ETL pipeline for analytics"                  | AWS Glue                                     |
| "Deliver streaming data to S3"                | Kinesis Firehose                             |
| "Fault-tolerant batch jobs, minimize cost"    | Spot Instances                               |
| "Committed, stable production workload"       | Savings Plans                                |
| "Private subnet → S3 without NAT"             | S3 Gateway Endpoint                          |
| "Private subnet → SQS without NAT"            | SQS Interface Endpoint                       |
| "Multi-AZ for RDS"                            | Failover automatico (non scalabilità in lettura)        |
| "Read Replica for RDS"                        | Scalabilità in lettura (non failover automatico)        |
| "Recovery time < 1 minute, cross-AZ"          | Multi-AZ                                     |
| "Recovery across regions, minutes RTO"        | Pilot Light o Standby Tiepido                  |
| "Active-Active, zero RTO"                     | Multi-Regione Active-Active (più complesso)    |
