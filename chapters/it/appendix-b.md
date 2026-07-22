# Appendice B: Mappa dei Domini SAA-C03

L'esame AWS Solutions Architect Associate (SAA-C03) è organizzato in quattro domini. Questa appendice mappa ogni capitolo del libro al dominio e all'attività pertinenti, in modo che tu possa studiare per area d'esame anziché per ordine dei capitoli.

---

## Panoramica dei Domini

| Dominio                                                  | Peso | Descrizione                                                         |
|----------------------------------------------------------|------|---------------------------------------------------------------------|
| Dominio 1: Progettare Architetture Sicure                | 30%  | IAM, sicurezza di rete, protezione dei dati                         |
| Dominio 2: Progettare Architetture Resilienti            | 26%  | Alta disponibilità, tolleranza ai guasti, disaster recovery         |
| Dominio 3: Progettare Architetture ad Alte Prestazioni   | 24%  | Compute, storage, database, prestazioni di rete                     |
| Dominio 4: Progettare Architetture Ottimizzate per i Costi | 20% | Modelli di prezzo, gestione dei costi, ottimizzazione delle risorse |

---

## Dominio 1: Progettare Architetture Sicure (30%)

**Attività 1.1 — Progettare l'accesso sicuro alle risorse AWS**

Concetti chiave: utenti IAM, gruppi, ruoli, policy. Principio del minimo privilegio. Accesso cross-account. Ruoli di servizio. SCP (Service Control Policies) in AWS Organizations.

| Capitolo    | Argomento                                                                                       |
|-------------|--------------------------------------------------------------------------------------------------|
| Capitolo 3  | Fondamenti IAM: utenti, gruppi, ruoli, policy, valutazione delle policy                         |
| Capitolo 14 | IAM avanzato: ruoli per servizi, confini delle autorizzazioni, ruoli cross-account              |
| Capitolo 3  | Logica di valutazione delle policy: deny esplicito > allow esplicito > deny implicito           |
| Capitolo 14 | AWS Organizations, SCP, Control Tower, Account Factory                                         |
| Capitolo 14 | Cognito: User Pools (accesso all'app, JWT) e Identity Pools (credenziali AWS temporanee)        |

Pattern d'esame chiave:

- "EC2 deve accedere a S3 senza credenziali hardcoded" → Ruolo IAM con policy S3 allegata al profilo dell'istanza EC2
- "Account diversi devono condividere risorse" → Ruolo IAM con policy di trust cross-account
- "Impedire a tutti gli utenti IAM in un'OU di accedere a un servizio" → SCP in AWS Organizations

---

**Attività 1.2 — Progettare carichi di lavoro e applicazioni sicuri**

Concetti chiave: progettazione VPC, security group vs. NACL, isolamento di rete, protezione DDoS, WAF, GuardDuty.

| Capitolo    | Argomento                                                                                              |
|-------------|--------------------------------------------------------------------------------------------------------|
| Capitolo 11 | Progettazione VPC: subnet pubbliche/private, NAT Gateway, Internet Gateway, route table               |
| Capitolo 15 | Security group (stateful, a livello di istanza) vs. NACL (stateless, a livello di subnet)             |
| Capitolo 17 | Shield (DDoS), WAF (firewall applicativo), GuardDuty (rilevamento minacce), Inspector (scansione CVE) |
| Capitolo 17 | Macie: individuazione di dati sensibili in S3 (PII, credenziali)                                      |
| Capitolo 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                                     |

Pattern d'esame chiave:

- "Bloccare un IP specifico dalla subnet" → Regola di deny su NACL
- "Permettere HTTP in entrata, permettere automaticamente la risposta HTTP in uscita" → Security group (stateful)
- "Proteggere un'applicazione web da SQL injection" → WAF con regola SQL injection
- "Rilevare credenziali IAM compromesse" → GuardDuty

---

**Attività 1.3 — Determinare i controlli di sicurezza dei dati appropriati**

Concetti chiave: crittografia a riposo e in transito, KMS, Secrets Manager, Parameter Store, cifratura lato server di S3.

| Capitolo    | Argomento                                                                              |
|-------------|----------------------------------------------------------------------------------------|
| Capitolo 16 | KMS: chiavi gestite dal cliente, rotazione delle chiavi, envelope encryption           |
| Capitolo 16 | Secrets Manager: rotazione automatica delle credenziali, recupero delle credenziali a runtime |
| Capitolo 16 | ACM (AWS Certificate Manager): certificati SSL/TLS per ALB, CloudFront                |
| Capitolo 5  | Opzioni di crittografia S3: SSE-S3, SSE-KMS, SSE-C                                    |
| Capitolo 8  | Crittografia a riposo di RDS (deve essere abilitata alla creazione)                    |

Pattern d'esame chiave:

- "Ruotare automaticamente le credenziali del database" → Secrets Manager con integrazione RDS
- "Controllare chi può usare le chiavi di crittografia tra account" → Policy della chiave KMS
- "Memorizzare valori di configurazione non segreti" → SSM Parameter Store (non Secrets Manager)
- "Cifrare gli oggetti S3 con chiavi gestite dall'azienda" → SSE-KMS con CMK

---

## Dominio 2: Progettare Architetture Resilienti (26%)

**Attività 2.1 — Progettare architetture scalabili e a basso accoppiamento**

Concetti chiave: Auto Scaling, load balancer, disaccoppiamento SQS/SNS, trigger Lambda, ECS/EKS, Step Functions.

| Capitolo    | Argomento                                                                              |
|-------------|----------------------------------------------------------------------------------------|
| Capitolo 7  | Auto Scaling Group, Application Load Balancer, policy di scaling                       |
| Capitolo 19 | SQS (disaccoppiamento tramite code), SNS (notifiche fan-out)                           |
| Capitolo 20 | Lambda: compute serverless, trigger di eventi, concorrenza                             |
| Capitolo 20 | API Gateway: API REST/HTTP/WebSocket gestite, standalone o + Lambda                    |
| Capitolo 21 | ECS e EKS: microservizi containerizzati                                                |
| Capitolo 22 | Step Functions: orchestrazione dei workflow                                            |
| Capitolo 26 | Kinesis: streaming di dati in tempo reale                                              |

Pattern d'esame chiave:

- "Disaccoppiare l'elaborazione degli ordini dall'aggiornamento dell'inventario" → Coda SQS tra i servizi
- "Notificare più servizi quando viene effettuato un nuovo ordine" → Topic SNS con sottoscrizioni SQS (fan-out)
- "Elaborare automaticamente i caricamenti su S3" → Notifica di evento S3 → Lambda
- "Eseguire un workflow a più passi con logica di retry" → Step Functions

---

**Attività 2.2 — Progettare architetture ad alta disponibilità e/o fault-tolerant**

Concetti chiave: Multi-AZ, Multi-Region, failover Route 53, read replica RDS, Aurora Global Database, backup e ripristino.

| Capitolo    | Argomento                                                                                                |
|-------------|----------------------------------------------------------------------------------------------------------|
| Capitolo 2  | Infrastruttura globale AWS: Region, AZ, edge location                                                    |
| Capitolo 7  | ALB su più AZ, ASG sostituisce le istanze non sane                                                       |
| Capitolo 8  | RDS Multi-AZ: replica sincrona, failover automatico                                                      |
| Capitolo 12 | Route 53: routing failover, routing per latenza, health check                                            |
| Capitolo 18 | Multi-AZ vs. Multi-Region: RTO/RPO, strategie DR (pilot light, warm standby, active-active)             |
| Capitolo 18 | AWS Backup (backup centralizzati e cross-account), Elastic Disaster Recovery (pilot light gestito)       |
| Capitolo 24 | Aurora Global Database: read replica cross-region, lag di replica inferiore a 1 secondo                  |

Pattern d'esame chiave:

- "Failover automatico in caso di guasto dell'RDS primario" → RDS Multi-AZ (non Read Replica)
- "Servire letture globalmente con bassa latenza" → Aurora Global Database
- "Instradare il traffico verso la region secondaria se la primaria non è disponibile" → Route 53 con routing Failover + health check
- "RTO di 1 minuto, RPO di 0" → Deployment Multi-AZ (non Multi-Region)
- "RTO di 15 minuti, cross-region" → Strategia Pilot Light

---

## Dominio 3: Progettare Architetture ad Alte Prestazioni (24%)

**Attività 3.1 — Determinare soluzioni di storage ad alte prestazioni e/o scalabili**

Concetti chiave: S3 vs. EBS vs. EFS, selezione della storage class, S3 Transfer Acceleration, upload multipart, CloudFront per gli asset.

| Capitolo    | Argomento                                                                                                                                                                                                                              |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Capitolo 5  | S3: object storage, storage class, versioning, lifecycle                                                                                                                                                                               |
| Capitolo 6  | EBS: tipi di block storage (gp3, io2, st1), EFS: file storage condiviso                                                                                                                                                                |
| Capitolo 6  | Storage Gateway: bridge ibrido da on-premises a S3 (File, Volume, Tape)                                                                                                                                                               |
| Capitolo 23 | Transizioni di storage class S3, opzioni di recupero Glacier                                                                                                                                                                          |
| Capitolo 25 | DataSync (sincronizzazione file online), Transfer Family (SFTP→S3 gestito), Snow Family (trasferimento bulk offline — legacy: chiuso ai nuovi clienti a novembre 2025; AWS ora rimanda a DataSync e Data Transfer Terminal), MGN (rehost di server) |
| Capitolo 28 | Right-sizing EBS, migrazione da gp2 a gp3, gestione degli snapshot                                                                                                                                                                    |

Pattern d'esame chiave:

- "File system condiviso accessibile da più istanze EC2" → EFS (non EBS; EBS si collega a una sola istanza)
- "IOPS elevati per carichi di lavoro database" → io2 EBS
- "Ridurre i costi per i file non acceduti in 90 giorni" → Policy lifecycle S3 → Glacier
- "Caricare file di grandi dimensioni da posizioni distanti più velocemente" → S3 Transfer Acceleration
- "Settimane di trasferimento con larghezza di banda limitata" → L'esame SAA-C03 si aspetta ancora Snowball, nonostante la chiusura della Snow Family ai nuovi clienti nel 2025

---

**Attività 3.2 — Determinare soluzioni di compute ad alte prestazioni e/o scalabili**

Concetti chiave: famiglie di istanze EC2, processori Graviton, Auto Scaling, Lambda, Fargate, Spot Instance.

| Capitolo    | Argomento                                                                                          |
|-------------|----------------------------------------------------------------------------------------------------|
| Capitolo 4  | Tipi di istanza EC2: ottimizzate per il compute (c), ottimizzate per la memoria (r), uso generale (m, t) |
| Capitolo 7  | Auto Scaling: scaling orizzontale per i livelli web                                                |
| Capitolo 20 | Lambda: concorrenza, concorrenza provisionata (per latenza costante)                               |
| Capitolo 21 | ECS Fargate: container serverless                                                                  |
| Capitolo 21 | AWS Batch: compute batch gestito per container Docker, supportato da Spot                          |
| Capitolo 27 | Spot Instance per carichi di lavoro batch fault-tolerant                                           |

Pattern d'esame chiave:

- "Carico di lavoro di training ML, minimizzare i costi, può essere interrotto" → Spot Instance
- "Risposta Lambda costante sotto i 100 ms" → Concorrenza provisionata (elimina il cold start)
- "Microservizio containerizzato, senza gestione dell'infrastruttura" → ECS Fargate

---

**Attività 3.3 — Determinare soluzioni di database ad alte prestazioni**

Concetti chiave: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, pattern di accesso, read replica, DAX.

| Capitolo    | Argomento                                                                |
|-------------|--------------------------------------------------------------------------|
| Capitolo 8  | RDS: database relazionali gestiti, quando usare un RDBMS                 |
| Capitolo 9  | DynamoDB: NoSQL, partition key, GSI, DAX (cache in-memory)               |
| Capitolo 10 | ElastiCache: Redis vs. Memcached, strategie di cache                     |
| Capitolo 10 | MemoryDB for Redis: database primario durevole compatibile con Redis      |
| Capitolo 24 | Aurora: prestazioni, Serverless v2, read replica, Global Database        |
| Capitolo 29 | DynamoDB on-demand vs. capacità provisionata con Auto Scaling            |

Pattern d'esame chiave:

- "Letture al microsecondo per un session store" → ElastiCache Redis o DAX (se il backend è DynamoDB)
- "Accesso key-value ad alto throughput con schema flessibile" → DynamoDB
- "Join complessi e transazioni ACID" → Aurora o RDS
- "Analytics su petabyte di dati strutturati" → Redshift (non trattato in dettaglio ma segnale: "data warehouse" → Redshift)

---

**Attività 3.4 — Determinare architetture di rete ad alte prestazioni e/o scalabili**

Concetti chiave: CloudFront, Global Accelerator, Direct Connect, VPN, placement group, enhanced networking.

| Capitolo    | Argomento                                                                           |
|-------------|-------------------------------------------------------------------------------------|
| Capitolo 7  | NLB (Layer 4) e GWLB (Gateway Load Balancer per appliance di rete)                 |
| Capitolo 11 | Client VPN: accesso cifrato da singolo dispositivo a VPC                            |
| Capitolo 12 | Route 53: policy di routing: basato sulla latenza, geolocalizzazione, ponderato     |
| Capitolo 13 | CloudFront: CDN, edge caching, Lambda@Edge                                          |
| Capitolo 25 | AWS Global Accelerator: routing Anycast sul backbone AWS                            |
| Capitolo 25 | Direct Connect: connettività privata dedicata                                       |
| Capitolo 30 | VPC Endpoint: connettività privata ai servizi AWS                                   |

Pattern d'esame chiave:

- "Ridurre la latenza per gli utenti globali che accedono a risposte API dinamiche" → Global Accelerator (non CloudFront, che è ottimale per contenuti memorizzabili in cache)
- "Ridurre la latenza per asset statici globalmente" → CloudFront
- "Connettività privata e costante ad AWS da on-premises" → Direct Connect
- "Upload rapido da clienti di tutto il mondo al tuo bucket S3" → S3 Transfer Acceleration

---

**Attività 3.5 — Determinare soluzioni di ingestione e trasformazione dei dati ad alte prestazioni**

Concetti chiave: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Capitolo    | Argomento                                                                                              |
|-------------|--------------------------------------------------------------------------------------------------------|
| Capitolo 26 | Kinesis Data Streams: elaborazione di eventi ordinata in tempo reale                                   |
| Capitolo 26 | Amazon Data Firehose (ex-Kinesis Data Firehose): consegna gestita a S3, Redshift, OpenSearch          |
| Capitolo 26 | AWS Glue: ETL serverless, Data Catalog, Crawler                                                        |
| Capitolo 26 | Athena: SQL serverless su S3                                                                           |
| Capitolo 26 | QuickSight: dashboard BI gestite, motore in-memory SPICE                                               |
| Capitolo 26 | Lake Formation: controllo degli accessi dettagliato al data lake                                       |

Pattern d'esame chiave:

- "Elaborare dati di clickstream in tempo reale" → Kinesis Data Streams + Lambda o Managed Service for Apache Flink (ex-Kinesis Data Analytics)
- "Consegnare dati in streaming a S3 per analisi successive" → Amazon Data Firehose
- "Trasformare e catalogare dati da più fonti" → AWS Glue
- "Interrogare dati storici archiviati in S3 con SQL" → Athena

---

## Dominio 4: Progettare Architetture Ottimizzate per i Costi (20%)

**Attività 4.1 — Progettare soluzioni di storage ottimizzate per i costi**

| Capitolo    | Argomento                                                                       |
|-------------|---------------------------------------------------------------------------------|
| Capitolo 23 | Policy lifecycle S3, transizioni di storage class                               |
| Capitolo 28 | Right-sizing EBS, migrazione da gp2 a gp3, regole lifecycle del versioning S3  |
| Capitolo 28 | EFS Intelligent-Tiering, tag di allocazione dei costi, AWS Budgets              |

Pattern d'esame chiave:

- "Identificare quale team genera più costi S3" → Tag di allocazione dei costi + Cost Explorer
- "Ridurre automaticamente i costi per gli oggetti raramente acceduti" → S3 Intelligent-Tiering
- "Avvisare quando i costi mensili superano i $10.000" → AWS Budgets

---

**Attività 4.2 — Progettare soluzioni di compute ottimizzate per i costi**

| Capitolo    | Argomento                                                                                  |
|-------------|--------------------------------------------------------------------------------------------|
| Capitolo 2  | Outposts: rack AWS on-premises (trade-off costo capitale vs. opex cloud)                   |
| Capitolo 2  | Wavelength: edge compute 5G (partnership telco, posizionamento guidato dalla latenza)      |
| Capitolo 27 | Prezzi EC2: On-Demand, Reserved Instance, Savings Plan, Spot, Dedicated Host              |
| Capitolo 20 | Lambda: costo per invocazione (zero costo a riposo)                                        |

Pattern d'esame chiave:

- "Ridurre i costi per carichi di lavoro produttivi a stato stazionario" → Savings Plan (più flessibile) o Reserved Instance
- "Minimizzare i costi per job batch che possono essere interrotti" → Spot Instance
- "Elaborazione event-driven con zero costo a riposo" → Lambda

---

**Attività 4.3 — Progettare soluzioni di database ottimizzate per i costi**

| Capitolo    | Argomento                                                      |
|-------------|----------------------------------------------------------------|
| Capitolo 29 | DynamoDB on-demand vs. provisionata + Auto Scaling             |
| Capitolo 29 | Reserved Instance/Node per RDS e ElastiCache                   |
| Capitolo 29 | Gestione degli snapshot RDS                                    |

Pattern d'esame chiave:

- "Traffico DynamoDB imprevedibile" → Modalità di capacità on-demand
- "Traffico DynamoDB costante con picchi noti" → Provisionata + Auto Scaling
- "Ridurre i costi di RDS per carichi di lavoro stabili" → Reserved Instance (1 o 3 anni)

---

**Attività 4.4 — Progettare architetture di rete ottimizzate per i costi**

| Capitolo    | Argomento                                                                                            |
|-------------|------------------------------------------------------------------------------------------------------|
| Capitolo 30 | Prezzi del trasferimento dati: in entrata (gratuito), cross-AZ ($0,01/GB), cross-region, internet ($0,09/GB) |
| Capitolo 30 | NAT Gateway ($0,045/GB) vs. VPC Endpoint (Gateway: gratuito; Interface: a pagamento)                |
| Capitolo 30 | CloudFront come ottimizzatore dei costi di trasferimento dati                                        |

Pattern d'esame chiave:

- "EC2 in subnet privata chiama S3 — eliminare i costi del NAT Gateway" → S3 Gateway Endpoint (gratuito)
- "EC2 in subnet privata chiama SQS — ridurre i costi del NAT Gateway" → SQS Interface Endpoint
- "Ridurre i costi di trasferimento dati per la distribuzione di contenuti globale" → CloudFront (la cache riduce le richieste all'origin)

---

## Argomenti Trasversali ai Domini

Alcuni argomenti compaiono in più domini:

| Argomento                                      | Domini | Capitoli     |
|------------------------------------------------|--------|--------------|
| Well-Architected Framework                     | Tutti  | 31           |
| Revisioni architetturali e ADR                 | Tutti  | 32           |
| Ragionamento sui trade-off ("dipende")         | Tutti  | 33           |
| Progettazione Multi-AZ                         | 2, 3   | 7, 8, 18, 24 |
| Monitoraggio e observability                   | 1, 2   | Throughout   |
| CloudFront                                     | 3, 4   | 13, 30       |

---

## Checklist Pre-Esame

Prima di sostenere l'SAA-C03:

**Aree ad alto peso (con maggiore probabilità di comparire)**

- [ ] Logica di valutazione delle policy IAM (deny esplicito → allow esplicito → deny implicito)
- [ ] Componenti VPC: subnet, route table, IGW, NAT Gateway, security group, NACL
- [ ] Storage class S3 e quando usare ciascuna
- [ ] RDS Multi-AZ vs. Read Replica (failover vs. scaling in lettura)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. event routing)
- [ ] Modelli di prezzo EC2: Spot per carichi fault-tolerant, Savings Plan per carichi impegnati
- [ ] Trigger Lambda e concorrenza
- [ ] DynamoDB vs. Aurora vs. Redshift (il pattern di accesso determina la scelta)
- [ ] CloudFront: CDN per i contenuti statici, Global Accelerator per i contenuti dinamici

**Trappole comuni**

- [ ] EBS si collega a UNA sola istanza; EFS è condiviso
- [ ] Le Read Replica RDS servono per lo scaling in lettura, NON per il failover automatico (quello è Multi-AZ)
- [ ] I NACL sono stateless (richiedono regole sia in entrata che in uscita)
- [ ] I Gateway Endpoint sono gratuiti e disponibili solo per S3 e DynamoDB
- [ ] Kinesis conserva e riproduce i messaggi; SQS li elimina al consumo
- [ ] "Disaccoppiamento" non significa sempre SQS — fan-out SNS ed EventBridge sono anch'essi pattern di disaccoppiamento
- [ ] Shield Standard è gratuito e automatico; Advanced è un abbonamento a pagamento
- [ ] ElastiCache vs. MemoryDB: ElastiCache = cache (perdita di dati accettabile). MemoryDB = database primario durevole.
- [ ] Client VPN vs. Site-to-Site VPN: Client VPN = singoli dispositivi. Site-to-Site = rete-a-rete.
- [ ] Outposts vs. Wavelength: Outposts = rack AWS on-premises. Wavelength = edge 5G.
- [ ] DMS: omogeneo = DMS diretto. Eterogeneo = SCT prima, poi DMS.
- [ ] DataSync sposta *file*; DMS sposta *database*; MGN sposta *interi server*.

**La struttura dell'esame**

- 65 domande, 130 minuti (2 ore e 10 minuti)
- Scelta multipla (una risposta corretta) e risposta multipla (selezionare N risposte corrette)
- Punteggio minimo: 720 su 1000
- Le domande non valutate sono incorporate; non è possibile sapere quali sono
- Gestisci il tempo: circa 2 minuti per domanda; contrassegna le domande difficili e tornaci
