# Anhang B: Domänenkarte SAA-C03

Die Prüfung AWS Solutions Architect Associate (SAA-C03) ist in vier Domänen organisiert. Dieser Anhang ordnet jedes Kapitel des Buches der relevanten Domäne und Aufgabe zu, damit Sie nach Prüfungsbereich statt nach Kapitelreihenfolge lernen können.

---

## Domänenübersicht

| Domäne                                              | Gewicht | Beschreibung                                            |
|-----------------------------------------------------|---------|--------------------------------------------------------|
| Domäne 1: Gestaltung sicherer Architekturen         | 30 %    | IAM, Netzwerksicherheit, Datenschutz                   |
| Domäne 2: Gestaltung widerstandsfähiger Architekturen | 26 %  | Hochverfügbarkeit, Fehlertoleranz, Disaster Recovery   |
| Domäne 3: Gestaltung leistungsstarker Architekturen | 24 %    | Compute-, Storage-, Datenbank-, Netzwerk-Performance   |
| Domäne 4: Gestaltung kostenoptimierter Architekturen | 20 %   | Preismodelle, Kostenmanagement, Ressourcenoptimierung  |

---

## Domäne 1: Gestaltung sicherer Architekturen (30 %)

**Aufgabe 1.1 — Sicheren Zugriff auf AWS-Ressourcen gestalten**

Kernkonzepte: IAM-Users, -Groups, -Roles, -Policies. Prinzip der geringsten Privilegien. Cross-Account-Zugriff. Service-Rollen. SCP (Service Control Policies) in AWS Organizations.

| Kapitel    | Thema                                                                        |
|------------|------------------------------------------------------------------------------|
| Kapitel 3  | IAM-Grundlagen: Users, Groups, Roles, Policies, Policy-Bewertung             |
| Kapitel 14 | IAM Fortgeschritten: Rollen für Dienste, Permission Boundaries, Cross-Account-Rollen |
| Kapitel 3  | Logik der Policy-Bewertung: explizites Deny > explizites Allow > implizites Deny |
| Kapitel 14 | AWS Organizations, SCPs, Control Tower, Account Factory                      |
| Kapitel 14 | Cognito: User Pools (App-Anmeldung, JWTs) und Identity Pools (temporäre AWS-Anmeldedaten) |

Wichtige Prüfungsmuster:

- „EC2 muss ohne hartcodierte Anmeldedaten auf S3 zugreifen" → IAM-Rolle mit S3-Policy, an das EC2-Instanzprofil angehängt
- „Verschiedene Konten müssen Ressourcen teilen" → IAM-Rolle mit Cross-Account-Trust-Policy
- „Allen IAM-Users in einer OU den Zugriff auf einen Dienst verwehren" → SCP in AWS Organizations

---

**Aufgabe 1.2 — Sichere Workloads und Anwendungen gestalten**

Kernkonzepte: VPC-Design, Security Groups vs. NACLs, Netzwerkisolation, DDoS-Schutz, WAF, GuardDuty.

| Kapitel    | Thema                                                                                      |
|------------|--------------------------------------------------------------------------------------------|
| Kapitel 11 | VPC-Design: öffentliche/private Subnetze, NAT Gateway, Internet Gateway, Routing-Tabellen   |
| Kapitel 15 | Security Groups (zustandsbehaftet, Instanzebene) vs. NACLs (zustandslos, Subnetzebene)      |
| Kapitel 17 | Shield (DDoS), WAF (App-Firewall), GuardDuty (Bedrohungserkennung), Inspector (CVE-Scanning) |
| Kapitel 17 | Macie: Erkennung sensibler Daten in S3 (PII, Anmeldedaten)                                  |
| Kapitel 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                           |

Wichtige Prüfungsmuster:

- „Eine bestimmte IP vom Subnetz blockieren" → NACL-Deny-Regel
- „HTTP eingehend erlauben, HTTP-Antwort automatisch ausgehend erlauben" → Security Group (zustandsbehaftet)
- „Webanwendung vor SQL-Injection schützen" → WAF mit SQL-Injection-Regel
- „Kompromittierte IAM-Anmeldedaten erkennen" → GuardDuty

---

**Aufgabe 1.3 — Geeignete Datensicherheitskontrollen bestimmen**

Kernkonzepte: Verschlüsselung im Ruhezustand und während der Übertragung, KMS, Secrets Manager, Parameter Store, S3 Server-Side Encryption.

| Kapitel    | Thema                                                                    |
|------------|--------------------------------------------------------------------------|
| Kapitel 16 | KMS: Customer-Managed Keys, Schlüsselrotation, Envelope Encryption       |
| Kapitel 16 | Secrets Manager: automatische Rotation von Anmeldedaten, Abruf von Secrets zur Laufzeit |
| Kapitel 16 | ACM (AWS Certificate Manager): SSL/TLS-Zertifikate für ALB, CloudFront   |
| Kapitel 5  | S3-Verschlüsselungsoptionen: SSE-S3, SSE-KMS, SSE-C                       |
| Kapitel 8  | RDS-Verschlüsselung im Ruhezustand (muss bei der Erstellung aktiviert werden) |

Wichtige Prüfungsmuster:

- „Datenbank-Anmeldedaten automatisch rotieren" → Secrets Manager mit RDS-Integration
- „Steuern, wer Verschlüsselungsschlüssel kontoübergreifend nutzen darf" → KMS Key Policy
- „Nicht geheime Konfigurationswerte speichern" → SSM Parameter Store (nicht Secrets Manager)
- „S3-Objekte mit unternehmenseigenen Schlüsseln verschlüsseln" → SSE-KMS mit CMK

---

## Domäne 2: Gestaltung widerstandsfähiger Architekturen (26 %)

**Aufgabe 2.1 — Skalierbare und lose gekoppelte Architekturen gestalten**

Kernkonzepte: Auto Scaling, Load Balancer, Entkopplung mit SQS/SNS, Lambda-Ereignis-Trigger, ECS/EKS, Step Functions.

| Kapitel    | Thema                                                              |
|------------|--------------------------------------------------------------------|
| Kapitel 7  | Auto Scaling Groups, Application Load Balancer, Skalierungsrichtlinien |
| Kapitel 19 | SQS (Entkopplung mit Queues), SNS (Fan-out-Benachrichtigungen)     |
| Kapitel 20 | Lambda: serverloses Compute, Ereignis-Trigger, Concurrency          |
| Kapitel 20 | API Gateway: verwaltete REST-/HTTP-/WebSocket-APIs, eigenständig oder + Lambda |
| Kapitel 21 | ECS und EKS: containerisierte Microservices                        |
| Kapitel 22 | Step Functions: Workflow-Orchestrierung                            |
| Kapitel 26 | Kinesis: Echtzeit-Daten-Streaming                                  |

Wichtige Prüfungsmuster:

- „Auftragsverarbeitung von der Bestandsaktualisierung entkoppeln" → SQS-Queue zwischen Diensten
- „Mehrere Dienste benachrichtigen, wenn eine neue Bestellung aufgegeben wird" → SNS-Topic mit SQS-Subscriptions (Fan-out)
- „S3-Uploads automatisch verarbeiten" → S3-Ereignisbenachrichtigung → Lambda
- „Einen mehrstufigen Workflow mit Retry-Logik ausführen" → Step Functions

---

**Aufgabe 2.2 — Hochverfügbare und/oder fehlertolerante Architekturen gestalten**

Kernkonzepte: Multi-AZ, Multi-Region, Route 53 Failover, RDS Read Replicas, Aurora Global Database, Backup and Restore.

| Kapitel    | Thema                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| Kapitel 2  | Globale AWS-Infrastruktur: Regionen, AZs, Edge Locations                                     |
| Kapitel 7  | ALB über mehrere AZs, ASG ersetzt fehlerhafte Instanzen                                      |
| Kapitel 8  | RDS Multi-AZ: synchrone Replikation, automatisches Failover                                  |
| Kapitel 12 | Route 53: Failover-Routing, Latency-Routing, Health Checks                                   |
| Kapitel 18 | Multi-AZ vs. Multi-Region: RTO/RPO, DR-Strategien (Pilot Light, Warm Standby, Active-Active) |
| Kapitel 18 | AWS Backup (zentralisierte, kontoübergreifende Backups), Elastic Disaster Recovery (verwaltetes Pilot Light) |
| Kapitel 24 | Aurora Global Database: regionsübergreifende Read Replicas, < 1 s Replikationslatenz         |

Wichtige Prüfungsmuster:

- „Automatisches Failover, wenn die primäre RDS ausfällt" → RDS Multi-AZ (nicht Read Replica)
- „Lesevorgänge global mit niedriger Latenz bedienen" → Aurora Global Database
- „Traffic zur sekundären Region routen, wenn die primäre nicht verfügbar ist" → Route 53 mit Failover-Routing + Health Checks
- „RTO von 1 Minute, RPO von 0" → Multi-AZ-Deployment (nicht Multi-Region)
- „RTO von 15 Minuten, regionsübergreifend" → Pilot-Light-Strategie

---

## Domäne 3: Gestaltung leistungsstarker Architekturen (24 %)

**Aufgabe 3.1 — Leistungsstarke und/oder skalierbare Storage-Lösungen bestimmen**

Kernkonzepte: S3 vs. EBS vs. EFS, Auswahl der Speicherklasse, S3 Transfer Acceleration, Multipart-Upload, CloudFront für Assets.

| Kapitel    | Thema                                                                   |
|------------|-------------------------------------------------------------------------|
| Kapitel 5  | S3: Objektspeicher, Speicherklassen, Versionierung, Lebenszyklus        |
| Kapitel 6  | EBS: Block-Storage-Typen (gp3, io2, st1), EFS: gemeinsamer Dateispeicher |
| Kapitel 6  | Storage Gateway: hybride Brücke von On-Premises zu S3 (File, Volume, Tape) |
| Kapitel 23 | S3-Speicherklassenübergänge, Glacier-Abrufoptionen                       |
| Kapitel 25 | DataSync (Online-Dateisynchronisation), Transfer Family (verwaltetes SFTP→S3), Snow Family (Offline-Bulk-Transfer — Altbestand: im November 2025 für Neukunden geschlossen; AWS verweist jetzt auf DataSync und Data Transfer Terminals), MGN (Server-Rehost) |
| Kapitel 28 | EBS-Right-Sizing, gp2→gp3-Migration, Snapshot-Verwaltung                |

Wichtige Prüfungsmuster:

- „Gemeinsames Dateisystem, von mehreren EC2-Instanzen erreichbar" → EFS (nicht EBS; EBS wird an eine Instanz angehängt)
- „Hohe IOPS für Datenbank-Workload" → io2 EBS
- „Kosten für seit 90 Tagen nicht abgerufene Dateien senken" → S3-Lebenszyklusrichtlinie → Glacier
- „Große Dateien aus weit entfernten Standorten schneller hochladen" → S3 Transfer Acceleration
- „Wochenlanger Transfer über begrenzte Bandbreite" → die SAA-C03-Prüfung erwartet trotz der Schließung der Snow Family für Neukunden 2025 weiterhin Snowball

---

**Aufgabe 3.2 — Leistungsstarke und/oder skalierbare Compute-Lösungen bestimmen**

Kernkonzepte: EC2-Instanzfamilien, Graviton-Prozessoren, Auto Scaling, Lambda, Fargate, Spot Instances.

| Kapitel    | Thema                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Kapitel 4  | EC2-Instanztypen: Compute-optimiert (c), Memory-optimiert (r), General Purpose (m, t)    |
| Kapitel 7  | Auto Scaling: horizontale Skalierung für Web-Tiers                                       |
| Kapitel 20 | Lambda: Concurrency, Provisioned Concurrency (für konsistente Latenz)                    |
| Kapitel 21 | ECS Fargate: serverlose Container                                                        |
| Kapitel 21 | AWS Batch: verwaltetes Batch-Compute für Docker-Container, Spot-gestützt                 |
| Kapitel 27 | Spot Instances für fehlertolerante Batch-Workloads                                       |

Wichtige Prüfungsmuster:

- „ML-Trainings-Workload, Kosten minimieren, kann unterbrochen werden" → Spot Instances
- „Konsistente Lambda-Antwort unter 100 ms" → Provisioned Concurrency (eliminiert Cold Start)
- „Containerisierter Microservice, keine Infrastrukturverwaltung" → ECS Fargate

---

**Aufgabe 3.3 — Leistungsstarke Datenbanklösungen bestimmen**

Kernkonzepte: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, Zugriffsmuster, Read Replicas, DAX.

| Kapitel    | Thema                                                              |
|------------|--------------------------------------------------------------------|
| Kapitel 8  | RDS: verwaltete relationale Datenbanken, wann ein RDBMS einzusetzen ist |
| Kapitel 9  | DynamoDB: NoSQL, Partition Keys, GSI, DAX (In-Memory-Cache)        |
| Kapitel 10 | ElastiCache: Redis vs. Memcached, Cache-Strategien                 |
| Kapitel 10 | MemoryDB for Redis: beständige, Redis-kompatible Primärdatenbank   |
| Kapitel 24 | Aurora: Performance, Serverless v2, Read Replicas, Global Database |
| Kapitel 29 | DynamoDB On-Demand vs. Provisioned Capacity mit Auto Scaling       |

Wichtige Prüfungsmuster:

- „Mikrosekunden-Lesevorgänge für einen Session Store" → ElastiCache Redis oder DAX (bei DynamoDB-Backend)
- „Schlüssel-Wert-Zugriff mit hohem Durchsatz und flexiblem Schema" → DynamoDB
- „Komplexe Joins und ACID-Transaktionen" → Aurora oder RDS
- „Analysen auf Petabytes strukturierter Daten" → Redshift (nicht im Detail behandelt, aber Signal: „Data Warehouse" → Redshift)

---

**Aufgabe 3.4 — Leistungsstarke und/oder skalierbare Netzwerkarchitekturen bestimmen**

Kernkonzepte: CloudFront, Global Accelerator, Direct Connect, VPN, Placement Groups, Enhanced Networking.

| Kapitel    | Thema                                                              |
|------------|--------------------------------------------------------------------|
| Kapitel 7  | NLB (Layer 4) und GWLB (Gateway Load Balancer für Netzwerk-Appliances) |
| Kapitel 11 | Client VPN: verschlüsselter Zugriff einzelner Geräte auf die VPC   |
| Kapitel 12 | Route 53: Routing-Richtlinien: Latency-based, Geolocation, Weighted |
| Kapitel 13 | CloudFront: CDN, Edge Caching, Lambda@Edge                         |
| Kapitel 25 | AWS Global Accelerator: Anycast-Routing auf das AWS-Backbone       |
| Kapitel 25 | Direct Connect: dedizierte private Konnektivität                   |
| Kapitel 30 | VPC Endpoints: private Konnektivität zu AWS-Diensten               |

Wichtige Prüfungsmuster:

- „Latenz für globale Nutzer beim Zugriff auf dynamische API-Antworten senken" → Global Accelerator (nicht CloudFront, das am besten für cachebare Inhalte geeignet ist)
- „Latenz für statische Assets global senken" → CloudFront
- „Konsistente private Konnektivität zu AWS von On-Premises" → Direct Connect
- „Schneller Upload von Kunden weltweit in Ihren S3-Bucket" → S3 Transfer Acceleration

---

**Aufgabe 3.5 — Leistungsstarke Lösungen zur Datenaufnahme und -transformation bestimmen**

Kernkonzepte: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Kapitel    | Thema                                                               |
|------------|---------------------------------------------------------------------|
| Kapitel 26 | Kinesis Data Streams: geordnete Echtzeit-Ereignisverarbeitung       |
| Kapitel 26 | Amazon Data Firehose (ehem. Kinesis Data Firehose): verwaltete Auslieferung an S3, Redshift, OpenSearch |
| Kapitel 26 | AWS Glue: serverloses ETL, Data Catalog, Crawler                    |
| Kapitel 26 | Athena: serverloses SQL auf S3                                      |
| Kapitel 26 | QuickSight: verwaltete BI-Dashboards, SPICE-In-Memory-Engine        |
| Kapitel 26 | Lake Formation: feingranulare Zugriffskontrolle für Data Lakes      |

Wichtige Prüfungsmuster:

- „Clickstream-Daten in Echtzeit verarbeiten" → Kinesis Data Streams + Lambda oder Managed Service for Apache Flink (früher Kinesis Data Analytics)
- „Streaming-Daten an S3 für spätere Analyse liefern" → Amazon Data Firehose
- „Daten aus mehreren Quellen transformieren und katalogisieren" → AWS Glue
- „In S3 gespeicherte historische Daten mit SQL abfragen" → Athena

---

## Domäne 4: Gestaltung kostenoptimierter Architekturen (20 %)

**Aufgabe 4.1 — Kostenoptimierte Storage-Lösungen gestalten**

| Kapitel    | Thema                                                              |
|------------|--------------------------------------------------------------------|
| Kapitel 23 | S3-Lebenszyklusrichtlinien, Speicherklassenübergänge              |
| Kapitel 28 | EBS-Right-Sizing, gp2→gp3-Migration, S3-Versionierungs-Lebenszyklusregeln |
| Kapitel 28 | EFS Intelligent-Tiering, Cost Allocation Tags, AWS Budgets         |

Wichtige Prüfungsmuster:

- „Identifizieren, welches Team die meisten S3-Kosten verursacht" → Cost Allocation Tags + Cost Explorer
- „Kosten für selten genutzte Objekte automatisch senken" → S3 Intelligent-Tiering
- „Warnen, wenn die monatlichen Kosten 10.000 $ überschreiten" → AWS Budgets

---

**Aufgabe 4.2 — Kostenoptimierte Compute-Lösungen gestalten**

| Kapitel    | Thema                                                                            |
|------------|----------------------------------------------------------------------------------|
| Kapitel 2  | Outposts: On-Premises-AWS-Rack (Abwägung Investitionskosten vs. Cloud-OpEx)       |
| Kapitel 2  | Wavelength: 5G-Edge-Compute (Telekommunikationspartnerschaft, latenzgetriebene Platzierung) |
| Kapitel 27 | EC2-Preise: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts  |
| Kapitel 20 | Lambda: Zahlung pro Aufruf (keine Leerlaufkosten)                                |

Wichtige Prüfungsmuster:

- „Kosten für stabile Produktions-Workloads senken" → Savings Plans (flexibler) oder Reserved Instances
- „Kosten für unterbrechbare Batch-Jobs minimieren" → Spot Instances
- „Ereignisgesteuerte Verarbeitung ohne Leerlaufkosten" → Lambda

---

**Aufgabe 4.3 — Kostenoptimierte Datenbanklösungen gestalten**

| Kapitel    | Thema                                             |
|------------|---------------------------------------------------|
| Kapitel 29 | DynamoDB On-Demand vs. Provisioned + Auto Scaling |
| Kapitel 29 | RDS- und ElastiCache-Reserved Instances/Nodes     |
| Kapitel 29 | RDS-Snapshot-Verwaltung                           |

Wichtige Prüfungsmuster:

- „Unvorhersehbarer DynamoDB-Traffic" → On-Demand-Kapazitätsmodus
- „Konsistenter DynamoDB-Traffic mit bekannten Spitzen" → Provisioned + Auto Scaling
- „RDS-Kosten für einen stabilen Workload senken" → Reserved Instances (1 oder 3 Jahre)

---

**Aufgabe 4.4 — Kostenoptimierte Netzwerkarchitekturen gestalten**

| Kapitel    | Thema                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| Kapitel 30 | Datenübertragungspreise: eingehend (kostenlos), Cross-AZ ($0.01/GB), Cross-Region, Internet ($0.09/GB) |
| Kapitel 30 | NAT Gateway ($0.045/GB) vs. VPC Endpoints (Gateway: kostenlos; Interface: kostenpflichtig)    |
| Kapitel 30 | CloudFront als Optimierer der Datenübertragungskosten                                          |

Wichtige Prüfungsmuster:

- „EC2 im privaten Subnetz ruft S3 auf — NAT-Gateway-Kosten eliminieren" → S3 Gateway Endpoint (kostenlos)
- „EC2 im privaten Subnetz ruft SQS auf — NAT-Gateway-Kosten senken" → SQS Interface Endpoint
- „Datenübertragungskosten für globale Content-Auslieferung senken" → CloudFront (Caching reduziert Origin-Anfragen)

---

## Domänenübergreifende Themen

Einige Themen erscheinen über mehrere Domänen hinweg:

| Thema                              | Domänen | Kapitel      |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | Alle    | 31           |
| Architekturreviews und ADRs        | Alle    | 32           |
| Trade-off-Reasoning („es kommt darauf an") | Alle | 33        |
| Multi-AZ-Design                    | 2, 3    | 7, 8, 18, 24 |
| Monitoring und Observability       | 1, 2    | Durchgängig  |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Checkliste vor der Prüfung

Bevor Sie die SAA-C03 ablegen:

**Stark gewichtete Bereiche (am wahrscheinlichsten zu erscheinen)**

- [ ] Logik der IAM-Policy-Bewertung (explizites Deny → explizites Allow → implizites Deny)
- [ ] VPC-Komponenten: Subnetze, Routing-Tabellen, IGW, NAT Gateway, Security Groups, NACLs
- [ ] S3-Speicherklassen und wann welche zu verwenden ist
- [ ] RDS Multi-AZ vs. Read Replica (Failover vs. Lese-Skalierung)
- [ ] SQS vs. SNS vs. EventBridge (Pull vs. Push vs. Event-Routing)
- [ ] EC2-Preismodelle: Spot für fehlertolerant, Savings Plans für zugesagte Workloads
- [ ] Lambda-Trigger und Concurrency
- [ ] DynamoDB vs. Aurora vs. Redshift (das Zugriffsmuster bestimmt die Wahl)
- [ ] CloudFront: CDN für statisch, Global Accelerator für dynamisch

**Häufige Fallen**

- [ ] EBS wird an EINE Instanz angehängt; EFS ist gemeinsam genutzt
- [ ] RDS Read Replicas dienen der Lese-Skalierung, NICHT dem automatischen Failover (das ist Multi-AZ)
- [ ] NACLs sind zustandslos (benötigen sowohl eingehende als auch ausgehende Regeln)
- [ ] Gateway Endpoints sind kostenlos und nur für S3 und DynamoDB
- [ ] Kinesis bewahrt auf und gibt wieder; SQS löscht bei Konsum
- [ ] „Entkoppeln" bedeutet nicht immer SQS — SNS-Fan-out und EventBridge sind ebenfalls Entkopplungsmuster
- [ ] Shield Standard ist kostenlos und automatisch; Advanced ist ein kostenpflichtiges Abonnement
- [ ] ElastiCache vs. MemoryDB: ElastiCache = Cache (Datenverlust OK). MemoryDB = beständige Primärdatenbank.
- [ ] Client VPN vs. Site-to-Site VPN: Client VPN = einzelne Geräte. Site-to-Site = Netzwerk-zu-Netzwerk.
- [ ] Outposts vs. Wavelength: Outposts = On-Premises-AWS-Rack. Wavelength = 5G-Edge.
- [ ] DMS: homogen = DMS direkt. Heterogen = zuerst SCT, dann DMS.
- [ ] DataSync verschiebt *Dateien*; DMS verschiebt *Datenbanken*; MGN verschiebt *ganze Server*.

**Der Prüfungsaufbau**

- 65 Fragen, 130 Minuten (2 Stunden 10 Minuten)
- Multiple Choice (eine richtige Antwort) und Multiple Response (N richtige auswählen)
- Bestehensschwelle: 720 von 1000
- Unbewertete Fragen sind eingebettet; Sie können nicht erkennen, welche es sind
- Zeit managen: ~2 Minuten pro Frage; schwierige markieren und zurückkehren
