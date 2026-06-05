# Appendice B: Mappa del Dominio SAA-C03

L'esame AWS Solutions Architect Associate (SAA-C03) è organizzato in quattro domini. Questo appendice mappa ogni capitolo del libro al dominio e all'attività pertinenti, in modo che tu possa studiare per area d'esame anziché per ordine dei capitoli.

---

## Panoramica del Dominio

| Dominio                                         | Peso  | Descrizione                                            |
|------------------------------------------------|-------|--------------------------------------------------------|
| Dominio 1: Progetta Architetture Sicure          | 30%   | IAM, sicurezza di rete, protezione dei dati                 |
| Dominio 2: Progetta Architetture Resilienti       | 26%   | Alta disponibilità, tolleranza agli errori, disaster recovery |
| Dominio 3: Progetta Architetture ad Alte Prestazioni | 24%   | Calcolo, storage, database, prestazioni di rete        |
| Dominio 4: Progetta Architetture Ottimizzate per i Costi | 20%   | Modelli di prezzi, gestione dei costi, ottimizzazione delle risorse |

---

## Dominio 1: Progetta Architetture Sicure (30%)

**Attività 1.1 — Progetta l'accesso sicuro alle risorse AWS**

Concetti chiave: utenti IAM, gruppi, ruoli, policy. Principio del minimo privilegio. Accesso tra account. Ruoli di servizio. SCP (Service Control Policies) in AWS Organizations.

| Capitolo | Argomento                                                                        |
|----------|----------------------------------------------------------------------------------|
| Capitolo 3 | Fondamenti IAM: utenti, gruppi, ruoli, policy, valutazione della policy          |
| Capitolo 14| IAM avanzato: ruoli per servizi, confini di autorizzazione, ruoli tra account |
| Capitolo 3 | Logica di valutazione della policy: negazione esplicita > autorizzazione esplicita > negazione implicita |
| Capitolo 14| AWS Organizations e SCPs                                                       |

Modelli di esame chiave:

- "Un EC2 ha bisogno di accedere a S3 senza credenziali codificate" → Ruolo IAM con policy S3 allegata al profilo dell'istanza EC2
- "Account diversi hanno bisogno di condividere risorse" → Ruolo IAM con policy di fiducia tra account
- "Prevenire tutti gli utenti IAM in un OU dall'accesso a un servizio" → SCP in AWS Organizations

---

**Attività 1.2 — Progetta carichi di lavoro e applicazioni sicuri**

Concetti chiave: progettazione VPC, gruppi di sicurezza vs. NACL, isolamento di rete, protezione DDoS, WAF, GuardDuty.

| Capitolo | Argomento                                                                              |
|----------|----------------------------------------------------------------------------------------|
| Capitolo 11| Progettazione VPC: sottoreti pubbliche/private, NAT Gateway, Internet Gateway, route table |
| Capitolo 15| Gruppi di sicurezza (stateless, a livello di istanza) vs. NACL (stateful, a livello di sottorete) |
| Capitolo 17| Shield (protezione DDoS), WAF (firewall applicativo), GuardDuty (rilevamento minacce) |
| Capitolo 25| Direct Connect, VPN, Transit Gateway, PrivateLink                                   |

Modelli di esame chiave:

- "Bloccare un indirizzo IP specifico dal sottorete" → Regola NACL di negazione
- "Consentire HTTP in, consentire automaticamente HTTP response out" → Gruppo di sicurezza (stateful)
- "Proteggere un'applicazione web da SQL injection" → WAF con regola di SQL injection
- "Rilevare credenziali IAM compromesse" → GuardDuty

---

**Attività 1.3 — Determina i controlli di sicurezza dei dati appropriati**

Concetti chiave: crittografia a riposo e in transito, KMS, Secrets Manager, Parameter Store, crittografia lato server di S3.

| Capitolo | Argomento                                                                    |
|----------|--------------------------------------------------------------------------|
| Capitolo 16| KMS: chiavi gestite dal cliente, rotazione delle chiavi, crittografia a involucro |
| Capitolo 16| Secrets Manager: rotazione automatica delle credenziali, recupero delle credenziali in runtime |
| Capitolo 5 | Opzioni di crittografia S3: SSE-S3, SSE-KMS, SSE-C                            |
| Capitolo 8 | Crittografia a riposo RDS (da abilitare alla creazione)                     |

Modelli di esame chiave:

- "Ruotare automaticamente le credenziali del database" → Secrets Manager con integrazione RDS
- "Controllare chi può utilizzare le chiavi di crittografia tra account" → Policy chiave KMS
- "Memorizzare i valori di configurazione non segreti" → SSM Parameter Store (non Secrets Manager)
- "Crittografare gli oggetti S3 con chiavi gestite dall'azienda" → SSE-KMS con CMK

---

## Dominio 2: Progetta Architetture Resilienti (26%)

**Attività 2.1 — Progetta architetture scalabili e accoppiate in modo rilassato**

Concetti chiave: Auto Scaling, bilanciatori di carico, SQS/SNS decoupling, trigger Lambda, ECS/EKS, Step Functions.

| Chapter    | Topic                                                            |
|------------|------------------------------------------------------------------|
| Chapter 7  | Gruppi di Auto Scaling, Load Balancer Applicativo, politiche di scalabilità |
| Chapter 19 | SQS (de-accoppiamento con code), SNS (notifiche a diffusione)        |
| Chapter 20 | Lambda: calcolo serverless, trigger di eventi, concorrenza          |
| Chapter 21 | ECS e EKS: microservizi containerizzati                         |
| Chapter 22 | Step Functions: orchestrazione del flusso di lavoro                           |
| Chapter 26 | Kinesis: streaming di dati in tempo reale                                |

---

**Task 2.2 — Progettare architetture altamente disponibili e/o tolleranti ai guasti**

Concetti chiave: Multi-AZ, Multi-Regione, Route 53 failover, Replica di lettura RDS, Aurora Global Database, backup e ripristino.

| Chapter    | Topic                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| Chapter 2  | Infrastruttura globale AWS: Regioni, AZ, posizioni edge                                      |
| Chapter 7  | ALB su più AZ, ASG sostituisce le istanze non operative                                    |
| Chapter 8  | RDS Multi-AZ: replica sincrona, failover automatico                                    |
| Chapter 12 | Route 53: routing failover, routing per latenza, controlli di salute                                   |
| Chapter 18 | Multi-AZ vs. Multi-Regione: RTO/RPO, strategie DR (pilot light, standby caldo, attivo-attivo) |
| Chapter 24 | Aurora Global Database: replica cross-region, ritardo di replica inferiore a 1 secondo                     |

Key exam patterns:

- "Decouple l'elaborazione degli ordini dall'aggiornamento dell'inventario" → coda SQS tra i servizi
- "Notifica a più servizi quando viene effettuato un nuovo ordine" → argomento SNS con sottoscrizioni SQS (diffusione)
- "Elabora automaticamente i caricamenti S3" → notifica di evento S3 → Lambda
- "Esegui un flusso di lavoro a più fasi con logica di retry" → Step Functions

---

**Task 3.1 — Determinare soluzioni di archiviazione ad alte prestazioni e/o scalabili**

Concetti chiave: S3 vs. EBS vs. EFS, selezione della classe di archiviazione, S3 Transfer Acceleration, caricamento multipartito, CloudFront per gli asset.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 5  | S3: archiviazione oggetti, classi di archiviazione, versioning, ciclo di vita         |
| Chapter 6  | EBS: tipi di archiviazione a blocchi (gp3, io2, st1), EFS: archiviazione file condivisa |
| Chapter 23 | Transizioni di classe di archiviazione S3, opzioni di recupero Glacier            |
| Chapter 28 | Ridimensionamento EBS, migrazione gp2→gp3, gestione degli snapshot           |

Key exam patterns:

- "Sistema di file condiviso accessibile da più istanze EC2" → EFS (non EBS; EBS si attacca a una singola istanza)
- "IOPS elevati per il carico di lavoro del database" → EBS io2
- "Ridurre i costi per i file non accessibili per 90 giorni" → politica di ciclo di vita S3 → Glacier
- "Carica file di grandi dimensioni più velocemente da posizioni distanti" → S3 Transfer Acceleration

---

**Task 3.2 — Determinare soluzioni di calcolo ad alte prestazioni e/o scalabili**

Concetti chiave: Famiglie di istanze EC2, processori Graviton, Auto Scaling, Lambda, Fargate, Istanze Spot.

| Chapter    | Topic                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Chapter 4  | Tipi di istanze EC2: ottimizzati per il calcolo (c), ottimizzati per la memoria (r), a uso generale (m, t) |
| Chapter 7  | Auto Scaling: scalabilità orizzontale per i livelli web                                          |
| Chapter 20 | Lambda: concorrenza, concorrenza prevista (per la latenza coerente)                   |
| Chapter 21 | ECS Fargate: contenitori serverless                                                      |
| Chapter 27 | Istanze Spot per carichi di lavoro di batch fault-tolerant                                       |

Key exam patterns:

- "Carico di lavoro di training ML, minimizzare i costi, può essere interrotto" → Istanze Spot
- "Risposta Lambda coerente inferiore a 100 ms" → Concorrenza prevista (elimina il cold start)
- "Microservizio containerizzato, nessuna gestione dell'infrastruttura" → ECS Fargate

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Capitolo 8  | RDS: database relazionali gestite, quando utilizzare RDBMS               |
| Capitolo 9  | DynamoDB: NoSQL, chiavi di partizione, GSI, DAX (cache in-memory)        |
| Capitolo 10 | ElastiCache: Redis vs. Memcached, strategie di caching                 |
| Capitolo 24 | Aurora: prestazioni, Serverless v2, replica di lettura, Database Globale |
| Capitolo 29 | DynamoDB on-demand vs. capacità provisionata con Auto Scaling      |

Patterni d'esame chiave:

- "Letture a microsecondo per uno store di sessioni" → ElastiCache Redis o DAX (se backend DynamoDB)
- "Accesso chiave-valore ad alto throughput con schema flessibile" → DynamoDB
- "Join complessi e transazioni ACID" → Aurora o RDS
- "Analisi di petabyte di dati strutturati" → Redshift (non coperta in dettaglio ma segnale: "data warehouse" → Redshift)

---

| Capitolo    | Topic                                                            |
|------------|------------------------------------------------------------------|
| Capitolo 12 | Route 53: politiche di routing: basate sulla latenza, sulla geolocalizzazione, ponderate |
| Capitolo 13 | CloudFront: CDN, caching edge, Lambda@Edge                       |
| Capitolo 25 | Direct Connect: connessione privata dedicata                   |
| Capitolo 25 | AWS Global Accelerator: routing Anycast al bordo AWS più vicino      |
| Capitolo 30 | VPC Endpoints: connessione privata ai servizi AWS              |

Patterni d'esame chiave:

- "Ridurre la latenza per gli utenti globali che accedono a risposte API dinamiche" → Global Accelerator (non CloudFront, che è migliore per contenuti memorizzabili)
- "Ridurre la latenza per gli asset statici globalmente" → CloudFront
- "Connessione privata e coerente a AWS da on-premises" → Direct Connect
- "Upload veloce da clienti in tutto il mondo al tuo bucket S3" → S3 Transfer Acceleration

---

| Capitolo    | Topic                                                               |
|------------|---------------------------------------------------------------------|
| Capitolo 26 | Kinesis Data Streams: elaborazione di eventi ordinata in tempo reale           |
| Capitolo 26 | Kinesis Data Firehose: consegna gestita a S3, Redshift, OpenSearch |
| Capitolo 26 | AWS Glue: ETL serverless, Data Catalog, Crawlers                    |
| Capitolo 26 | Athena: SQL serverless su S3                                        |

Patterni d'esame chiave:

- "Elaborare i dati di clickstream in tempo reale" → Kinesis Data Streams + Lambda o KDA
- "Consegnare i dati in streaming a S3 per l'analisi successiva" → Kinesis Firehose
- "Trasformare e catalogare i dati da più fonti" → AWS Glue
- "Interrogare i dati storici memorizzati in S3 con SQL" → Athena

---

## Dominio 4: Progettare Architetture Ottimizzate per i Costi (20%)

**Task 4.1 — Progettare soluzioni di archiviazione ottimizzate per i costi**

| Capitolo    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Capitolo 23 | Politiche di ciclo di vita di S3, transizioni di classe di storage       |
| Capitolo 28 | Ridimensionamento di EBS, migrazione da gp2 a gp3, regole di ciclo di vita di versioning di S3 |
| Capitolo 28 | EFS Intelligent-Tiering, tag di allocazione dei costi, AWS Budgets         |

Patterni d'esame chiave:

- "Identificare quale team genera il maggior numero di costi S3" → Tag di allocazione dei costi + Cost Explorer
- "Ridurre i costi per gli oggetti raramente accessibili automaticamente" → S3 Intelligent-Tiering
- "Avvisare quando il costo mensile supera i $10.000" → AWS Budgets

---

**Task 4.2 — Progettare soluzioni di calcolo ottimizzate per i costi**

| Capitolo    | Topic                                                                            |
|------------|----------------------------------------------------------------------------------|
| Capitolo 27 | Prezzi di EC2: On-Demand, Riserve, Savings Plans, Spot, Host Dedicati |
| Capitolo 20 | Lambda: costo per invocazione (costo inattivo zero)                                      |

Patterni d'esame chiave:

- "Ridurre i costi per i carichi di lavoro di produzione a stato stazionario" → Savings Plans (più flessibile) o Riserve
- "Minimizzare i costi per i job batch che possono essere interrotti" → Spot Instances
- "Elaborazione guidata da eventi con costo inattivo zero" → Lambda

---

**Task 4.3 — Progettare soluzioni di database ottimizzate per i costi**

| Capitolo    | Topic                                             |
|------------|---------------------------------------------------|
| Capitolo 29 | DynamoDB on-demand vs. provisionata + Auto Scaling |
| Capitolo 29 | Riserve/Nodi RDS e ElastiCache                   |
| Capitolo 29 | Gestione delle snapshot di RDS                           |

Patterni d'esame chiave:

- "Traffico DynamoDB imprevedibile" → Modalità di capacità on-demand
- "Traffico DynamoDB coerente con picchi noti" → Provisionato + Auto Scaling
- "Ridurre i costi di RDS per carichi di lavoro stabili" → Istanza riservata (1 o 3 anni)

---

**Compito 4.4 — Progettare architetture di rete ottimizzate per i costi**

| Capitolo    | Argomento                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| Capitolo 30 | Prezzi del trasferimento dati: in entrata (gratuito), tra AZ ($0,01/GB), tra regioni, internet ($0,09/GB) |
| Capitolo 30 | NAT Gateway ($0,045/GB) vs. Endpoint VPC (Gateway: gratuito; Interfaccia: a pagamento)                  |
| Capitolo 30 | CloudFront come ottimizzatore dei costi di trasferimento dati                                                    |

Modelli di esame chiave:

- "EC2 in subnet privata chiama S3 — eliminare i costi del NAT Gateway" → Endpoint S3 Gateway (gratuito)
- "EC2 in subnet privata chiama SQS — ridurre i costi del NAT Gateway" → Endpoint SQS Interfaccia
- "Ridurre i costi di trasferimento dati per la consegna di contenuti globale" → CloudFront (la memorizzazione nella cache riduce le richieste all'origine)

---

## Argomenti Trasversali

Alcuni argomenti appaiono in più domini:

| Argomento                              | Domini | Capitoli     |
|------------------------------------|---------|--------------|
| Framework dell'Architettura Ben Progettata | Tutti   | 31           |
| Revisioni dell'architettura e ADR | Tutti   | 32           |
| Ragionamento sui compromessi ("dipende") | Tutti   | 33           |
| Progettazione Multi-AZ               | 2, 3    | 7, 8, 18, 24 |
| Monitoraggio e osservabilità       | 1, 2    | Durante tutto |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Lista di Controllo Pre-Esame

Prima di sostenere l'SAA-C03:

**Aree ad alto peso (più probabili di apparire)**

- [ ] Logica di valutazione delle policy IAM (negazione esplicita → permesso esplicito → negazione implicita)
- [ ] Componenti VPC: subnet, tabelle di routing, IGW, NAT Gateway, gruppi di sicurezza, NACL
- [ ] Classi di storage S3 e quando usarle
- [ ] RDS Multi-AZ vs. Replica di lettura (failover vs. scalabilità di lettura)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. routing degli eventi)
- [ ] Modelli di prezzo EC2: Spot per carichi di lavoro tolleranti agli errori, Savings Plans per carichi di lavoro impegnati
- [ ] Trigger Lambda e concorrenza
- [ ] DynamoDB vs. Aurora vs. Redshift (il modello di accesso determina la scelta)
- [ ] CloudFront: CDN per statico, Global Accelerator per dinamico

**Trappole comuni**

- [ ] EBS si attacca a UN'istanza; EFS è condiviso
- [ ] Le repliche di lettura RDS sono per la scalabilità di lettura, NON per il failover automatico (quello è Multi-AZ)
- [ ] I NACL sono stateless (richiedono regole sia in entrata che in uscita)
- [ ] Gli Endpoint Gateway sono gratuiti e sono disponibili solo per S3 e DynamoDB
- [ ] Kinesis conserva e riproduce; SQS elimina al consumo
- [ ] "Decoupling" non significa sempre SQS — SNS fan-out e EventBridge sono anche modelli di decoupling
- [ ] Shield Standard è gratuito e automatico; Advanced è un abbonamento a pagamento

**La struttura dell'esame**

- 65 domande, 130 minuti (2 ore e 10 minuti)
- Scelta multipla (una risposta corretta) e risposta multipla (selezionare N risposte corrette)
- Punteggio minimo: 720 su 1000
- Le domande non valutate sono incorporate; non è possibile sapere quali sono
- Gestire il tempo: ~2 minuti per domanda; contrassegnare le domande difficili e ritornare a esse
