# Anhang B: Domänenkarte SAA-C03

Die AWS Solutions Architect Associate Prüfung (SAA-C03) ist in vier Domänen organisiert. Dieser Anhang ordnet jeden Kapitel des Buches der entsprechenden Domäne und Aufgabe zu, damit Sie sich gezielt auf die Prüfungsinhalte konzentrieren können.

---

## Domänenübersicht

| Domäne                                         | Gewicht | Beschreibung                                            |
|------------------------------------------------|--------|--------------------------------------------------------|
| Domäne 1: Gestaltung sicherer Architekturen          | 30%    | IAM, Netzwerksicherheit, Datensicherheit                 |
| Domäne 2: Gestaltung widerstandsfähiger Architekturen | 26%    | Hochverfügbarkeit, Fehlertoleranz, Disaster Recovery  |
| Domäne 3: Gestaltung leistungsstarker Architekturen | 24%    | Compute, Storage, Datenbank, Netzwerkleistung        |
| Domäne 4: Gestaltung kosteneffizienter Architekturen | 20%    | Preismodelle, Kostenmanagement, Ressourcenzuordnung |

---

## Domäne 1: Gestaltung sicherer Architekturen (30%)

**Aufgabe 1.1 — Gestaltung des Zugriffs auf AWS-Ressourcen**

Kernkonzepte: IAM-Benutzer, -Gruppen, -Rollen, -Richtlinien. Prinzip der geringsten Privilegien. Cross-Account-Zugriff. Service-Rollen. SCP (Service Control Policies) in AWS Organizations.

| Kapitel    | Thema                                                                        |
|------------|------------------------------------------------------------------------------|
| Kapitel 3  | IAM-Grundlagen: Benutzer, Gruppen, Rollen, Richtlinien, Richtlinienbewertung          |
| Kapitel 14 | IAM-Erweiterte Funktionen: Rollen für Services, Berechtigungsbereiche, Cross-Account-Rollen |
| Kapitel 3  | Richtlinienbewertungslogik: Explizites Verbot > Explizites Erlauben > Implizites Verbot      |
| Kapitel 14 | AWS Organizations und SCPs                                                   |

Wichtige Prüfungsmuster:

- "EC2 benötigt Zugriff auf S3 ohne hartcodierte Anmeldeinformationen" → IAM-Rolle mit S3-Richtlinie, die der EC2-Instanzprofil zugewiesen wird
- "Verschiedene Konten benötigen den Zugriff auf Ressourcen" → IAM-Rolle mit Cross-Account-Vertrauensrichtlinie
- "Alle IAM-Benutzer in einer OU sollen keinen Zugriff auf einen Service erhalten" → SCP in AWS Organizations

---

**Aufgabe 1.2 — Gestaltung sicherer Arbeitslasten und Anwendungen**

Kernkonzepte: VPC-Design, Sicherheitsgruppen vs. NACLs, Netzwerkisolierung, DDoS-Schutz, WAF, GuardDuty.

| Kapitel    | Thema                                                                              |
|------------|------------------------------------------------------------------------------------|
| Kapitel 11 | VPC-Design: öffentliche/private Subnetze, NAT Gateway, Internet Gateway, Routentabellen    |
| Kapitel 15 | Sicherheitsgruppen (zustandsbehaftet, instanzspezifisch) vs. NACLs (zustandslos, Subnetz-spezifisch)     |
| Kapitel 17 | Shield (DDoS-Schutz), WAF (Anwendungsbrandwand), GuardDuty (Bedrohungserkennung) |
| Kapitel 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                  |

Wichtige Prüfungsmuster:

- "Blockieren Sie eine bestimmte IP-Adresse aus dem Subnetz" → NACL-Verbotsvorschrift
- "Erlauben Sie HTTP-Eingangsverkehr und erlauben Sie HTTP-Antwortverkehr automatisch" → Sicherheitsgruppe (zustandsbehaftet)
- "Schützen Sie eine Webanwendung vor SQL-Injections" → WAF mit SQL-Injection-Regel
- "Erkennen Sie kompromittierte IAM-Anmeldeinformationen" → GuardDuty

---

**Aufgabe 1.3 — Ermittlung geeigneter Datensicherheitskontrollen**

Kernkonzepte: Verschlüsselung im Ruhezustand und während der Übertragung, KMS, Secrets Manager, Parameter Store, S3-Verschlüsselung mit serverseitiger Verschlüsselung.

| Kapitel    | Thema                                                                    |
|------------|--------------------------------------------------------------------------|
| Kapitel 16 | KMS: Kundenspezifische Schlüssel, Schlüsselrotation, Umschlagverschlüsselung            |
| Kapitel 16 | Secrets Manager: Automatische Anmeldeinformationsrotation, Laufzeit-Anmeldeinformationsabruf |
| Kapitel 5  | S3-Verschlüsselungsoptionen: SSE-S3, SSE-KMS, SSE-C                            |
| Kapitel 8  | RDS-Verschlüsselung im Ruhezustand (muss bei der Erstellung aktiviert werden)                     |

Wichtige Prüfungsmuster:

- "Rotieren Sie Datenbankanmeldeinformationen automatisch" → Secrets Manager mit RDS-Integration
- "Steuern Sie, wer die Verschlüsselungsschlüssel über Konten hinweg verwenden kann" → KMS-Schlüsselrichtlinie
- "Speichern Sie nicht-geheime Konfigurationswerte" → SSM Parameter Store (nicht Secrets Manager)
- "Verschlüsseln Sie S3-Objekte mit von Ihnen verwalteten Schlüsseln" → SSE-KMS mit CMK

---

## Domäne 2: Gestaltung widerstandsfähiger Architekturen (26%)

**Aufgabe 2.1 — Gestaltung skalierbarer und lose gekoppelter Architekturen**

Kernkonzepte: Auto Scaling, Load Balancer, SQS/SNS-Entkopplung, Lambda-Ereignis-Trigger, ECS/EKS, Step Functions.

| Kapitel    | Thema                                                            |
|------------|------------------------------------------------------------------|
| Kapitel 7  | Auto Scaling Groups, Application Load Balancer, Skalierungsrichtlinien |
| Kapitel 19 | SQS (Entkopplung mit Warteschlangen), SNS (Ausbreitung von Benachrichtigungen)        |
| Kapitel 20 | Lambda: Serverless-Compute, Ereignis-Trigger, Konkurrenz          |
| Kapitel 21 | ECS und EKS: Containerisierte Microservices                         |
| Kapitel 22 | Step Functions: Workflow-Orchestrierung                           |
| Kapitel 26 | Kinesis: Echtzeit-Daten-Streaming                                |

Wichtige Prüfungsmuster:

- "Low-latency access to frequently accessed data" → DynamoDB with DAX
- "High-performance analytics queries" → Redshift
- "Relational data with high read/write throughput" → Aurora
- "Caching frequently accessed data" → ElastiCache (Redis or Memcached)
- "Simple key-value store" → DynamoDB
---

**Aufgabe 2.2 — Entwerfen hochverfügbarer und/oder fehlertoleranter Architekturen**

Kernkonzepte: Multi-AZ, Multi-Region, Route 53 Failover, RDS Read Replikate, Aurora Global Database, Backup und Wiederherstellung.

| Kapitel    | Thema                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| Kapitel 2  | AWS globale Infrastruktur: Regionen, AZs, Edge Locations                                      |
| Kapitel 7  | ALB über mehrere AZs, ASG ersetzt ungesunde Instanzen                                    |
| Kapitel 8  | RDS Multi-AZ: synchrone Replikation, automatischer Failover                                    |
| Kapitel 12 | Route 53: Failover Routing, Latenz Routing, Health Checks                                   |
| Kapitel 18 | Multi-AZ vs. Multi-Region: RTO/RPO, DR Strategien (Pilot Light, Warm Standby, Active-Active) |
| Kapitel 24 | Aurora Global Database: Cross-Region Read Replikate, < 1s Replikationsverzögerung                     |

Wichtige Prüfungsmuster:

- "Automatische Failover, wenn primäre RDS fehlschlägt" → RDS Multi-AZ (nicht Read Replica)
- "Globale Reads mit geringer Latenz bereitstellen" → Aurora Global Database
- "Verkehr an sekundäre Region leiten, wenn primäre Region nicht verfügbar ist" → Route 53 mit Failover Routing + Health Checks
- "RTO von 1 Minute, RPO von 0" → Multi-AZ Deployment (nicht Multi-Region)
- "RTO von 15 Minuten, Cross-Region" → Pilot Light Strategie

---

**Aufgabe 3.1 — Bestimmen hochleistungsfähige und/oder skalierbare Speicherlösungen**

Kernkonzepte: S3 vs. EBS vs. EFS, Speicherklassenwahl, S3 Transfer Acceleration, Multipart Upload, CloudFront für Assets.

| Kapitel    | Thema                                                              |
|------------|--------------------------------------------------------------------|
| Kapitel 5  | S3: Objektspeicher, Speicherklassen, Versionierung, Lebenszyklus         |
| Kapitel 6  | EBS: Block Speicher Typen (gp3, io2, st1), EFS: Gemeinsamer Dateispeicher |
| Kapitel 23 | S3 Speicherklassen Übergänge, Glacier-Wiederherstellungsoptionen            |
| Kapitel 28 | EBS Größenoptimierung, gp2→gp3 Migration, Snapshot Management           |

Wichtige Prüfungsmuster:

- "Gemeinsamer Dateispeicher, der von mehreren EC2 Instanzen zugänglich ist" → EFS (nicht EBS; EBS wird an eine Instanz angehängt)
- "Hohe IOPS für Datenbanklast" → io2 EBS
- "Kosten reduzieren für Dateien, die nicht innerhalb von 90 Tagen abgerufen werden" → S3 Lifecycle Policy → Glacier
- "Große Dateien schneller von entfernten Standorten hochladen" → S3 Transfer Acceleration

---

**Aufgabe 3.2 — Bestimmen hochleistungsfähige und/oder skalierbare Compute-Lösungen**

Kernkonzepte: EC2 Instanzfamilien, Graviton Prozessoren, Auto Scaling, Lambda, Fargate, Spot Instanzen.

| Kapitel    | Thema                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Kapitel 4  | EC2 Instanztypen: Compute-Optimiert (c), Memory-Optimiert (r), Allgemein (m, t) |
| Kapitel 7  | Auto Scaling: Horizontale Skalierung für Web-Tier                                          |
| Kapitel 20 | Lambda: Konkurrenz, Provisionierte Konkurrenz (für konsistente Latenz)                   |
| Kapitel 21 | ECS Fargate: Serverlose Container                                                      |
| Kapitel 27 | Spot Instanzen für fehlertolerante Batch-Workloads                                       |

Wichtige Prüfungsmuster:

- "ML-Training-Workload, minimiere Kosten, kann unterbrochen werden" → Spot Instanzen
- "Konsistente Sub-100ms Lambda-Antwort" → Provisionierte Konkurrenz (eliminiert Cold Starts)
- "Containerisierte Microservice, keine Infrastrukturverwaltung" → ECS Fargate

---

**Aufgabe 3.3 — Bestimmen hochleistungsfähige Datenbanklösungen**

Kernkonzepte: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, Zugriffsmuster, Read Replikate, DAX.

| Kapitel    | Thema                                                              |
|------------|--------------------------------------------------------------------|
| Kapitel 8  | RDS: Verwaltete relationale Datenbanken, wann RDBMS verwenden        |
| Kapitel 9  | DynamoDB: NoSQL, Partition Keys, GSI, DAX (In-Memory Cache)        |
| Kapitel 10 | ElastiCache: Redis vs. Memcached, Cache Strategien                 |
| Kapitel 24 | Aurora: Performance, Serverless v2, Read Replikate, Global Database |
| Kapitel 29 | DynamoDB On-Demand vs. Provisionierte Kapazität mit Auto Scaling      |

Wichtige Prüfungsmuster:

- "Microsecond reads for a session store" → ElastiCache Redis oder DAX (falls DynamoDB Backend)
- "High-throughput key-value access mit flexibler Schema" → DynamoDB
- "Komplexe Joins und ACID-Transaktionen" → Aurora oder RDS
- "Analysen auf Petabytes von strukturierten Daten" → Redshift (nicht im Detail behandelt, aber Signal: „Data Warehouse“ → Redshift)

---

**Aufgabe 3.4 — Bestimmte Hochleistungs- und/oder Skalierbare Netzwerkarchitekturen**

Kernkonzepte: CloudFront, Global Accelerator, Direct Connect, VPN, Platzierungsgruppen, Enhanced Networking.

| Kapitel    | Thema                                                              |
|------------|------------------------------------------------------------------|
| Kapitel 12 | Route 53: Routingrichtlinien: Latenzbasierend, Geolocation, Gewichtung |
| Kapitel 13 | CloudFront: CDN, Edge-Caching, Lambda@Edge                       |
| Kapitel 25 | Direct Connect: Dedizierte private Konnektivität                   |
| Kapitel 25 | AWS Global Accelerator: Anycast-Routing zum nächsten AWS Edge        |
| Kapitel 30 | VPC Endpoints: Private Konnektivität zu AWS-Diensten              |

Schlüsselprüfungsmuster:

- "Reduziere die Latenz für globale Benutzer, die dynamische API-Antworten abrufen" → Global Accelerator (nicht CloudFront, das sich für cachefähigen Inhalt eignet)
- "Reduziere die Latenz für statische Assets global" → CloudFront
- "Konsistente private Konnektivität zu AWS von On-Premises" → Direct Connect
- "Schneller Upload von Kunden weltweit zu deinem S3 Bucket" → S3 Transfer Acceleration

---

**Aufgabe 3.5 — Bestimmte Hochleistungs-Daten-Ingestion und Transformationslösungen**

Kernkonzepte: Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR.

| Kapitel    | Thema                                                               |
|------------|---------------------------------------------------------------------|
| Kapitel 26 | Kinesis Data Streams: Echtzeit-geordnete Ereignisverarbeitung            |
| Kapitel 26 | Kinesis Data Firehose: Managed Delivery zu S3, Redshift, OpenSearch |
| Kapitel 26 | AWS Glue: Serverless ETL, Data Catalog, Crawlers                    |
| Kapitel 26 | Athena: Serverless SQL auf S3                                        |

Schlüsselprüfungsmuster:

- "Verarbeite Clickstream-Daten in Echtzeit" → Kinesis Data Streams + Lambda oder KDA
- "Liefern Streaming-Daten an S3 für spätere Analyse" → Kinesis Firehose
- "Transformiere und katalogisiere Daten aus mehreren Quellen" → AWS Glue
- "Frage historische Daten ab, die in S3 gespeichert sind, mit SQL" → Athena

---

## Domäne 4: Gestaltung Kostenoptimierter Architekturen (20%)

**Aufgabe 4.1 — Gestaltung Kostenoptimierter Speicherlösungen**

| Kapitel    | Thema                                                              |
|------------|--------------------------------------------------------------------|
| Kapitel 23 | S3 Lifecycle Policies, Speicherklassen-Übergänge                   |
| Kapitel 28 | EBS Right-Sizing, gp2→gp3 Migration, S3 Versioning Lifecycle Rules |
| Kapitel 28 | EFS Intelligent-Tiering, Kostenaufteilung-Tags, AWS Budgets         |

Schlüsselprüfungsmuster:

- "Identifiziere, welches Team die meisten S3-Kosten verursacht" → Kostenaufteilung-Tags + Cost Explorer
- "Reduziere die Kosten für selten genutzte Objekte automatisch" → S3 Intelligent-Tiering
- "Benachrichtige, wenn monatliche Kosten 10.000 $ überschreiten" → AWS Budgets

---

**Aufgabe 4.2 — Gestaltung Kostenoptimierter Compute-Lösungen**

| Kapitel    | Thema                                                                            |
|------------|----------------------------------------------------------------------------------|
| Kapitel 27 | EC2-Preise: On-Demand, Reservierte Instanzen, Savings Plans, Spot, Dedizierte Hosts |
| Kapitel 20 | Lambda: Pay per Invocation (keine Leerlaufkosten)                                      |

Schlüsselprüfungsmuster:

- "Reduziere die Kosten für Steady-State-Produktionslasten" → Savings Plans (flexibler) oder Reservierte Instanzen
- "Minimiere die Kosten für Batch-Jobs, die unterbrochen werden können" → Spot Instanzen
- "Ereignisgesteuerte Verarbeitung mit keiner Leerlaufkosten" → Lambda

---

**Aufgabe 4.3 — Gestaltung Kostenoptimierter Datenbanklösungen**

| Kapitel    | Thema                                             |
|------------|---------------------------------------------------|
| Kapitel 29 | DynamoDB On-Demand vs. Provisioned + Auto Scaling |
| Kapitel 29 | RDS und ElastiCache Reservierte Instanzen/Nodes      |
| Kapitel 29 | RDS Snapshot Management                           |

Schlüsselprüfungsmuster:

- "Unvorhersehbare DynamoDB-Traffic" → On-Demand Kapazitätsmodus
- "Konsistenter DynamoDB-Traffic mit bekannten Spitzen" → Provisioned + Auto Scaling
- "Reduziere die RDS-Kosten für stabile Workloads" → Reservierte Instanzen (1- oder 3-Jahres-Laufzeit)

---

**Aufgabe 4.4 — Gestaltung Kostenoptimierter Netzwerkarchitekturen**

```markdown
| Kapitel    | Thema                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| Kapitel 30 | Datenübertragungskosten: eingehend (kostenlos), innerhalb derselben Availability Zone ($0,01/GB), zwischen Regionen, zum Internet ($0,09/GB) |
| Kapitel 30 | NAT Gateway ($0,045/GB) vs. VPC Endpoints (Gateway: kostenlos; Interface: abrechenbar)                  |
| Kapitel 30 | CloudFront als Optimierer für Datenübertragungskosten                                                    |

Wichtige Prüfungsmuster:

- "EC2 in einem privaten Subnetz ruft S3 auf – eliminieren Sie die Kosten für NAT Gateway" → S3 Gateway Endpoint (kostenlos)
- "EC2 in einem privaten Subnetz ruft SQS auf – reduzieren Sie die Kosten für NAT Gateway" → SQS Interface Endpoint
- "Reduzieren Sie die Datenübertragungskosten für globale Content Delivery" → CloudFront (Caching reduziert Origin-Anfragen)

---

## Themen über mehrere Domains

Einige Themen treten in mehreren Domains auf:

| Thema                              | Domains | Kapitel     |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | Alle    | 31           |
| Architekturprüfungen und ADRs      | Alle    | 32           |
| Abwägungsgrundlagen ("es hängt davon ab") | Alle    | 33           |
| Multi-AZ-Design                    | 2, 3    | 7, 8, 18, 24 |
| Überwachung und Beobachtbarkeit       | 1, 2    | Überall      |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Vorprüfliste

Bevor Sie die SAA-C03-Prüfung ablegen:

**Schwerpunktbereiche (am wahrscheinlichsten zu finden)**

- [ ] Bewertung der IAM-Richtliniologie (explizites Verbot → explizite Erlaubnis → implizites Verbot)
- [ ] VPC-Komponenten: Subnetze, Routingtabellen, IGW, NAT Gateway, Sicherheitsgruppen, NACLs
- [ ] S3-Speicherklassen und wann man sie verwendet
- [ ] RDS Multi-AZ vs. Read Replica (Failover vs. Read-Skalierung)
- [ ] SQS vs. SNS vs. EventBridge (Pull vs. Push vs. Ereignisrouting)
- [ ] EC2-Preismodelle: Spot für fehlertolerante, Savings Plans für kommissionierte Arbeitslasten
- [ ] Lambda-Trigger und Konkurrenz
- [ ] DynamoDB vs. Aurora vs. Redshift (Zugriffsmodus bestimmt die Wahl)
- [ ] CloudFront: CDN für statische Inhalte, Global Accelerator für dynamische Inhalte

**Häufige Stolpersteine**

- [ ] EBS wird an eine einzige Instanz angehängt; EFS wird gemeinsam genutzt
- [ ] RDS Read Replicas dienen der Read-Skalierung, NICHT der automatischen Failover (das ist Multi-AZ)
- [ ] NACLs sind zustandsbehaftet (benötigen sowohl eingehende als auch ausgehende Regeln)
- [ ] Gateway Endpoints sind kostenlos und nur für S3 und DynamoDB
- [ ] Kinesis speichert und spielt Ereignisse ab; SQS löscht bei Verbrauch
- [ ] "Decouple" bedeutet nicht immer SQS – SNS Fan-Out und EventBridge sind ebenfalls Decoupling-Muster
- [ ] Shield Standard ist kostenlos und automatisch; Advanced ist ein kostenpflichtiges Abonnement

**Die Prüfungsstruktur**

- 65 Fragen, 130 Minuten (2 Stunden 10 Minuten)
- Multiple Choice (eine korrekte Antwort) und Multiple Response (wähle N korrekte Antworten)
- Bestehensgrenze: 720 von 1000
- Unbewertete Fragen sind eingebettet; Sie können nicht erkennen, welche es sind
- Zeitmanagement: ~2 Minuten pro Frage; markiere schwierige Fragen und kehre zu ihnen zurück
```
