# Anhang A: AWS-Dienste Schnellreferenz

Jeder in diesem Buch behandelte Dienst, in der Reihenfolge der Einführung. Verwenden Sie dies als Studienreferenz und für einen schnellen Überblick während der Prüfungsvorbereitung.

---

## Compute

**EC2 — Elastic Compute Cloud** *(Kapitel 4)*

Virtuelle Maschinen in der Cloud. Sie wählen den Instanztyp (CPU, Speicher, Festplatte), das Betriebssystem und die Region. Sie zahlen pro Stunde (On-Demand), pro Engagement (Reservierte Instanzen / Savings Plans) oder pro verfügbarem Kapazitätsplatz (Spot). Das grundlegende Compute-Primitive.

Wichtige Konzepte: AMI (Amazon Machine Image), Instanztypen (t3, m6g, r6g, c6g Familien), Schlüsselpaare, Instanzprofile, Platzierungsgruppen.

Prüfungszeichen: Wenn ein Szenario eine persistente, zustandsbehaftete oder langlaufende Compute-Anforderung darstellt – EC2 oder ECS. Wenn ein Szenario eine kurzfristige, ereignisgesteuerte oder kostenlose Leerlauf-Compute-Anforderung darstellt – Lambda.

---

**Auto Scaling + Application Load Balancer** *(Kapitel 7)*

Auto Scaling Groups (ASGs) fügen Instanzen von EC2 basierend auf der Last hinzu und entfernt sie. Application Load Balancer (ALBs) verteilen den Traffic auf Instanzen und leiten ihn anhand von Pfaden oder Hostnamen. Gemeinsam bilden sie die horizontale Skalierungsschicht.

Wichtige Konzepte: Launch Template, Skalierungsrichtlinien (Zielverfolgung, Schritt, zeitgesteuert), Gesundheitsprüfungen, ALB Target Groups, Listener-Regeln, gewichtete Routen.

Prüfungszeichen: "Variable Last verarbeiten" oder "Hohe Verfügbarkeit über AZs" → ASG + ALB.

---

**Lambda** *(Kapitel 20)*

Serverlose Funktionen. Sie schreiben Code; AWS führt ihn als Reaktion auf Ereignisse aus. Keine Server, die verwaltet werden müssen. Sie zahlen pro Aufruf und pro Millisekunde der Ausführungszeit. Skaliert automatisch auf Tausende gleichzeitiger Ausführungen.

Wichtige Konzepte: Ereignisquellen (API Gateway, S3, SQS, EventBridge, Kinesis), Rollenfunktion, Konkurrenzl Grenzwerte, reservierte und provisionierte Konkurrenz, Kaltstart, Schichten, maximale Dauer von 15 Minuten.

Prüfungszeichen: "Serverless", "ereignisgesteuert", "kurzlebige Aufgaben", "keine Leerlaufkosten" → Lambda.

---

**ECS — Elastic Container Service** *(Kapitel 21)*

Führt Docker-Container auf AWS aus. Es gibt zwei Launch-Typen: EC2 (Sie verwalten den Host) und Fargate (AWS verwaltet den Host). ECS verwaltet Task-Definitionen, Service-Scheduling, Cluster-Scheduling und Integration mit Load Balancern und Service Discovery.

Wichtige Konzepte: Task-Definition, ECS Service, Fargate vs. EC2 Launch-Typ, ECR (Container Registry), IAM-Rolle für Task, Service Auto Scaling.

Prüfungszeichen: "Containerisierte Workloads", "Microservices", "Docker auf AWS" → ECS (meist Fargate für serverlose Container).

---

**EKS — Elastic Kubernetes Service** *(Kapitel 21)*

Managed Kubernetes. AWS verwaltet die Control Plane; Sie verwalten die Worker Nodes (EC2 oder Fargate). Verwenden Sie EKS, wenn Ihr Team bereits Kubernetes verwendet oder Workloads benötigt, die Kubernetes-spezifische Funktionen erfordern.

Prüfungszeichen: "Kubernetes", "Bedarf an Migration bestehender K8s Workloads" → EKS. "Benötigen Container ohne K8s Overhead" → ECS.

---

## Storage

**S3 — Simple Storage Service** *(Kapitel 5)*

Objekt-Speicher. Unbegrenzte Kapazität, 99,999999999% (elf schlafende Nullen) Ausfallsicherheit. Speichert Dateien als Objekte in Buckets. Buckets leben in einer Region. Objekte können von 0 Bytes bis 5TB reichen.

Wichtige Konzepte: Bucket-Richtlinie, Objekt-ACL, Versionierung, statische Website-Hosting, vorab signierte URLs, Multipart Upload, Transfer Acceleration, Speicherklassen (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Prüfungszeichen: "Speichern und Abrufen von Dateien", "Statische Assets", "Backups", "Data Lake" → S3. Die richtige Speicherklasse hängt von der Zugriffshäufigkeit und der Abrufgeschwindigkeit ab.

---

**EBS — Elastic Block Store** *(Kapitel 6)*

Block-Speicher, der an eine einzelne EC2-Instanz angeschlossen ist. Funktioniert wie eine Festplatte. Persistiert unabhängig vom Lebenszyklus der Instanz (Sie können sie abtrennen und neu anschließen). Die häufigsten Typen: gp3 (allgemeiner Zweck SSD, der Standard), io2 (provisionierte IOPS für Datenbanken), st1 (Durchsatz-optimierte HDD für sequentielle Reads).

Wichtige Konzepte: Snapshots (inkrementell, gespeichert in S3), Verschlüsselung (KMS), Multi-Attach (nur io1/io2), IOPS und Durchsatz-Provisionierung.

Prüfungszeichen: "Persistenter Speicher für EC2", "Datenbank-Speicher", "Benötigt niedrige Latenz Block-Zugriff" → EBS.

---

**EFS — Elastic File System** *(Kapitel 6)*

Gemeinsamer Dateisystem, der von mehreren EC2-Instanzen gleichzeitig zugänglich ist. NFS-Protokoll. Skaliert automatisch. Teurer als EBS pro GB. Zwei Speicherklassen: Standard und Selten Zugriff. Intelligent-Tiering verschiebt Dateien automatisch zwischen den Schichten.

Prüfungszeichen: "Gemeinsames Dateisystem", "Mehrere EC2-Instanzen benötigen dieselben Dateien", "NFS" → EFS.

---

**S3 Speicherklassen und Lebenszyklusrichtlinien** *(Kapitel 23)*

S3 Intelligent-Tiering verschiebt Objekte automatisch zwischen Zugriffsschichten basierend auf der Zugriffshäufigkeit. Lebenszyklusrichtlinien verschieben Objekte basierend auf Altersregeln zwischen Klassen (Standard → Standard-IA → Glacier)

Prüfungszeichen: "Reduzieren Sie die Speicherkosten für selten genutzte Daten" → Lebenszyklusrichtlinien, Intelligent-Tiering, oder Glacier.

---

## Datenbanken

Verwaltete relationale Datenbanken. Unterstützte Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server und Aurora (der proprietären Engine von AWS). AWS übernimmt die Verwaltung von Backups, Patches, Failover und Replikation. Sie verwalten Schema-Design, Abfragen und Instanzgrößen.

Kernkonzepte: Multi-AZ-Bereitstellung (automatische Failover, synchrone Replikation), Read Replicas (asynchron, für die Skalierung der Leseleistung), automatisierte Backups (Retentionsdauer von 1-35 Tagen), manuelle Snapshots (werden aufbewahrt, bis sie gelöscht werden), RDS Proxy (Verbindungs-Pooling).

Prüfungssignal: „Relationale Datenbank“, „ACID-Transaktionen“, „bestehender SQL-Workload“ → RDS oder Aurora.

---

**Aurora** *(Kapitel 24)*

Die relationale Datenbank-Engine von AWS, kompatibel mit MySQL und PostgreSQL. Eine verteilte Speicher-Engine, die Daten über 3 AZs in 6 Kopien repliziert. Typischerweise 5x schneller als MySQL. Aurora Serverless v2 skaliert die Kapazität automatisch (gemessen in ACUs – Aurora Capacity Units).

Kernkonzepte: Aurora Cluster (Writer + bis zu 15 Reader Endpoints), Aurora Global Database (Cross-Region Read Replicas mit < 1 Sekunde Replikationslatenz), Aurora Serverless v2.

Prüfungssignal: „Hochleistungs-relationale Datenbank“, „Kompatibel mit MySQL/PostgreSQL“, „globale Reads“, „variable Workload“ → Aurora.

---

**DynamoDB** *(Kapitel 9)*

Eine vollständig verwaltete NoSQL-Datenbank. Key-Value- und Dokumentenmodell. Skaliert mit jeder Durchsatzleistung mit Millisekunden-Performance im Einzeldigit. Zwei Kapazitätsmodi: On-Demand (Pay per Request) und Provisioned (Pay per Capacity Unit pro Stunde, mit Auto Scaling).

Kernkonzepte: Partition Key (erforderlich), Sort Key (optional), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (Change Data Capture), DynamoDB Accelerator (DAX) – In-Memory Cache, TTL (Time to Live), Transaktionen.

Prüfungssignal: „Hoher Durchsatz für Key-basierter Zugriff“, „Flexibles Schema“, „Serverless NoSQL“ → DynamoDB.

---

**ElastiCache** *(Kapitel 10)*

Eine verwaltete In-Memory-Cache. Zwei Engines: Redis (persistent, pub/sub, Lua Scripting, Datenstrukturen) und Memcached (reiner Cache, einfacher, mehrfädige). Verwenden Sie sie, um die Datenbanklast zu reduzieren und häufig gelesene Daten in Mikrosekunden zu bedienen.

Kernkonzepte: Cache-Aside-Pattern, Write-Through-Pattern, Eviction Policies, TTL, Cluster-Modus (Redis), Multi-AZ mit automatischem Failover.

Prüfungssignal: „Reduzieren Sie die Datenbanklast“, „Sub-Millisekunden-Lese-Latenz“, „Sitzungsmanagement“, „Echtzeit-Leaderboard“ → ElastiCache Redis.

---

## Networking

**VPC – Virtual Private Cloud** *(Kapitel 11)*

Ein isoliertes Netzwerk innerhalb von AWS. Erstreckt sich über alle AZs in einer Region. Sie definieren den IP-Adressraum (CIDR-Block), erstellen Subnetze (öffentlich oder privat), konfigurieren Routentabellen und steuern den Zugriff über Sicherheitsgruppen und NACLs.

Kernkonzepte: Öffentliches Subnetz (Route zum Internet Gateway), privates Subnetz (Route zum NAT Gateway für ausgehende Verbindungen), Internet Gateway (Eingehende + ausgehende Verbindungen zum Internet), NAT Gateway (nur ausgehende Verbindungen für private Instanzen), VPC Peering (Verbinden Sie zwei VPCs), VPC Endpoints (Verbinden Sie sich mit AWS-Diensten ohne Internet).

Prüfungssignal: „Privates Netzwerk auf AWS“, „Ressourcen vom Internet isolieren“, „Netzwerkverkehr steuern“ → VPC.

---

**Sicherheitsgruppen und NACLs** *(Kapitel 15)*

Sicherheitsgruppen sind zustandsbehaftete Firewalls auf Instansechen Niveau – erlauben Regeln nur, automatische Rückverkehr ist möglich. NACLs (Network Access Control Lists) sind zustandslose Firewalls auf Subnetz Ebene – erfordern sowohl eingehende als auch ausgehende Regeln, werden in der Reihenfolge der Regelnummer ausgewertet.

Prüfungssignal: „Ein bestimmtes IP-Adressen von dem Subnetz blockieren“ → NACL. „Verkehr zu/von einer Instanz steuern“ → Sicherheitsgruppe.

---

**Route 53** *(Kapitel 12)*

Der DNS-Dienst und Domain-Registrar von AWS. Leitet Internetverkehr zu AWS-Ressourcen und externen Endpunkten weiter. Routing-Richtlinien: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multi-value Answer.

Kernkonzepte: Hosted Zones (öffentlich und privat), Record-Typen (A, AAAA, CNAME, Alias), Health Checks, Traffic Flow (visueller Policy-Editor).

Prüfungssignal: „DNS-Routing“, „Failover zwischen Regionen“, „Routen basierend auf Latenz oder Standort“ → Route 53 mit der entsprechenden Routing-Richtlinie.

---

**CloudFront** *(Kapitel 13)*

Ein Content Delivery Network (CDN). Cacht Inhalte an Randstandorten (400+ weltweit). Reduziert die Latenz für Endbenutzer. Reduziert die Übertragungskosten an den Ursprung durch Caching. Integriert sich mit S3, EC2, ALB und API Gateway als Ursprünge.

Kernkonzepte: Distribution, Ursprünge, Behaviors (Pfad-basierte Routing zu Ursprüngen), TTL (Cache-Kontrolle), Cache-Invalidierung, signierte URLs und Cookies (Zugriffskontrolle), Lambda@Edge und CloudFront Functions (Code an der Edge ausführen), Origin Shield (Reduziert die Last des Ursprungs).

Prüfungssignal: „Globale niedrige Latenz“, „Cachen Sie statische Inhalte“, „Reduzieren Sie die Last des Ursprungs“, „Schützen Sie sich vor DDoS mit Shield“ → CloudFront.

---

**Direct Connect und VPN** *(Kapitel 25)*

AWS Direct Connect ist eine dedizierte physische Netzwerkverbindung von Ihrem On-Premises-Rechenzentrum zu AWS. Umgeht das öffentliche Internet. Konsistente Bandbreite und Latenz. AWS Site-to-Site VPN ist ein verschlüsselter Tunnel über das öffentliche Internet – schneller einzurichten, geringere Kosten, aber variable Leistung.

Kernkonzepte: Virtuelles Interface (VIF), Direct Connect Gateway (verbindet sich mit mehreren Regionen), Transit Gateway (Hub-and-Spoke Netzwerk-Topologie), VPN-Tunnel Redundanz.

```markdown
Exam signal: "Dedicated private connection to AWS" → Direct Connect. "Encrypted connection, faster setup" → VPN. "Connect multiple VPCs" → Transit Gateway.

---

**VPC Endpoints** *(Kapitel 30)*

Verbinden Sie private Ressourcen mit AWS-Diensten, ohne das öffentliche Internet oder den NAT Gateway zu verwenden. Gateway Endpunkte: kostenlos, nur für S3 und DynamoDB verfügbar. Interface Endpunkte (PrivateLink): Preis pro Stunde + pro GB, für die meisten AWS-Dienste verfügbar.

Exam signal: "EC2 in private subnet calls S3/DynamoDB — reduce NAT Gateway costs" → Gateway Endpoint (kostenlos). "Private connection to SQS, SSM, Secrets Manager from private subnet" → Interface Endpoint.

---

## Sicherheit und Identität

**IAM — Identity and Access Management** *(Kapitel 3 und 14)*

Steuert, wer was in Ihrem AWS-Konto tun kann. Benutzer (langfristige Anmeldeinformationen), Gruppen (Benutzer mit gemeinsamen Berechtigungen), Rollen (vorübergehende Anmeldeinformationen für Dienste und Cross-Account-Zugriff), Richtlinien (JSON-Dokumente, die Erlauben/Verbot-Regeln definieren).

Wichtige Konzepte: Principal, Aktion, Ressource, Bedingung, explizites Verbot > explizites Erlaubnis > implizites Verbot, SCP (Service Control Policy in AWS Organizations), Berechtigungsgrenze, AssumeRole.

Exam signal: IAM ist an jeder Sicherheitsfrage beteiligt. Wichtiges Muster: Dienste verwenden IAM-Rollen (nicht Benutzer). Cross-Account-Zugriff verwendet Rollenübernahme. Least privilege – gewähren Sie nur das, was erforderlich ist.

---

**KMS — Key Management Service** *(Kapitel 16)*

Verwalteter Verschlüsselungsschlüsseldienst. Erstellt, speichert und kontrolliert kryptografische Schlüssel. Kundenverwaltete Schlüssel (CMKs) ermöglichen es Ihnen, Rotations-, Nutzungs- und Zugriffspolitiken zu definieren. AWS-verwaltete Schlüssel werden automatisch verwaltet.

Wichtige Konzepte: Key Policy (separat von IAM Policy), Envelope-Verschlüsselung (Daten werden mit einem Daten-Schlüssel verschlüsselt; der Daten-Schlüssel wird mit dem CMK verschlüsselt), automatische Schlüsselrotation, Multi-Region-Schlüssel, Grants.

Exam signal: "Encrypt data at rest," "customer-managed encryption keys," "key rotation" → KMS.

---

**Secrets Manager** *(Kapitel 16)*

Speichert und rotiert sensible Werte: Datenbank-Anmeldeinformationen, API-Schlüssel, OAuth-Token. Integriert sich mit RDS für automatische Passwort-Rotation. Anwendungen holen Geheimnisse zur Laufzeit über eine API ab – speichern Sie keine Anmeldeinformationen.

Exam signal: "Store and rotate database credentials," "avoid hardcoded secrets" → Secrets Manager. "Store configuration values, not secrets" → Parameter Store (SSM).

---

**AWS Shield** *(Kapitel 17)*

DDoS-Schutz. Shield Standard ist automatisch und kostenlos – schützt vor häufigen Volumendaten- und Protokollangriffen. Shield Advanced fügt finanzielle Schutz, 24/7 DDoS-Reaktionsteam und detaillierte Angriffssichtbarkeit hinzu.

Exam signal: "Protect against DDoS" → Shield Standard (automatisch) oder Shield Advanced (Enterprise, mit SLA).

---

**WAF — Web Application Firewall** *(Kapitel 17)*

Filtert HTTP/HTTPS-Traffic basierend auf Regeln: IP-Blockierung, Ratenbegrenzung, SQL-Injection-Muster, XSS-Muster, geografische Beschränkungen, benutzerdefinierte Regeln. Wird an CloudFront, ALB, API Gateway oder AppSync angehängt.

Exam signal: "Block specific IP addresses," "prevent SQL injection at the edge," "rate limit API calls" → WAF.

---

**GuardDuty** *(Kapitel 17)*

Bedrohungserkennungsdienst. Analysiert CloudTrail-Protokolle, VPC Flow Logs und DNS-Protokolle mit ML und Bedrohungsinformationen. Erkennt ungewöhnliche API-Aktivitäten, Kommunikation mit bekannten bösartigen IP-Adressen, kompromittierte Anmeldeinformationen.

Exam signal: "Detect unusual activity," "identify compromised IAM credentials," "continuous threat monitoring" → GuardDuty.

---

## Messaging und Event Processing

**SQS — Simple Queue Service** *(Kapitel 19)*

Verwaltete Nachrichtenwarteschlange. Produzenten senden Nachrichten; Konsumenten lesen und löschen sie. Entkoppelt Dienste: Der Sender muss nicht wissen, ob der Empfänger verfügbar ist. Standardwarteschlangen: At-least-once-Lieferung, best-effort-Ordering. FIFO-Warteschlangen: Exactly-once-Verarbeitung, strenges Ordering.

Wichtige Konzepte: Visibility Timeout (Nachricht wird für die Verarbeitung von anderen Konsumenten verborgen), Dead Letter Queue (DLQ) für Nachrichten, die sich wiederholt versagen, Message Retention (4 Tage Standard, bis zu 14), Long Polling (reduziert leere Antworten).

Exam signal: "Decouple services," "buffer requests during load spikes," "async processing" → SQS. "Order matters and exactly-once is required" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Kapitel 19)*

Verwalteter Pub/Sub-Dienst. Verleger senden eine Nachricht an ein Thema; alle Abonnenten erhalten eine Kopie. Fan-out-Muster: eine Nachricht → viele Konsumenten. Protokolle: SQS, Lambda, HTTP/HTTPS, E-Mail, SMS, mobile Push.

Wichtige Konzepte: Topic, Subscription, Fan-out-Muster (SNS → mehrere SQS-Warteschlangen), Message Filtering (Abonnenten erhalten nur übereinstimmende Nachrichten).

Exam signal: "Send notifications to multiple endpoints simultaneously," "fan-out a single event to multiple consumers" → SNS. Häufiges Muster: SNS + SQS für dauerhaften Fan-out.

---

**EventBridge** *(Kapitel 22)*

Event Bus für den Aufbau ereignisgesteuerter Architekturen. Leitet Ereignisse von AWS-Diensten, SaaS-Partnern und benutzerdefinierten Quellen an Lambda, SQS, SNS, Step Functions und andere Ziele weiter. Unterstützt geplante Regeln (Cron) und Mustervergleich.

Exam signal: "Route events from AWS services to targets," "schedule Lambda functions," "event-driven orchestration" → EventBridge.
```

**Step Functions** *(Kapitel 22)*

Serverless Workflow-Orchestrierung. Koordiniert Lambda-Funktionen, ECS-Aufgaben, DynamoDB, SNS, SQS und andere Dienste in visuellen Zustandsmaschinen. Behandelt Wiederholungen, Fehlerbehandlung, parallele Zweige und Wartezeiten.

Schlüsselkonzepte: Zustandsmaschine, Zustandsarten (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (genau-einmal, langlaufend) vs. Express Workflows (mindestens-einmal, hochvolumig).

Prüfungssignal: "Orchestriere mehrere Lambda-Funktionen", "langlaufende Workflows mit Wiederholungslogik", "menschliche Genehmigungsschritte" → Step Functions.

---

**Kinesis** *(Kapitel 26)*

Echtzeit-Datensendung. Kinesis Data Streams: dauerhafter, geordneter Datenstrom von Aufzeichnungen (wie ein verteilter Commit-Log). Konsumenten verarbeiten Aufzeichnungen; Daten werden bis zu 24 Stunden oder 7 Tagen aufbewahrt. Kinesis Data Firehose: vollumfassende Verwaltungslieferung an S3, Redshift, OpenSearch, Splunk – keine Konsumentenverwaltung erforderlich.

Schlüsselkonzepte: Shard (Durchsatz-Einheit: 1 MB/s Schreib, 2 MB/s Lesen), Partition Key (bestimmt Shard-Zuweisung), Sequenznummer, Checkpointing (KCL oder Lambda), Firehose vs. Streams.

Prüfungssignal: "Echtzeit-Streaming", "geordnete Aufzeichnungen", "Wiedergeben von Ereignissen" → Kinesis Data Streams. "Liefern Streaming-Daten an S3/Redshift ohne Konsumentenverwaltung" → Kinesis Firehose. Gegensatz zu SQS: Kinesis speichert und spielt ab; SQS löscht bei Konsum.

---

## Analytics

**Athena** *(Kapitel 26)*

Serverless SQL-Abfragen auf Daten, die in S3 gespeichert sind. Keine Infrastruktur erforderlich. Kosten pro Abfrage (pro TB gescannt). Bester Einsatz für spaltenorientierte Formate (Parquet, ORC) und partitionierte Daten.

Prüfungssignal: "Abfragen von S3-Daten mit SQL", "Ad-hoc-Analysen auf einem Datensee", "keine Infrastrukturverwaltung" → Athena.

---

**Glue** *(Kapitel 26)*

Serverless ETL-Dienst (Extract, Transform, Load). Glue Crawler entdecken Daten und aktualisieren den Glue Data Catalog. Glue Jobs führen Spark- oder Python-Transformationen aus. Der Data Catalog integriert sich mit Athena, Redshift Spectrum und EMR.

Prüfungssignal: "Transformiere und lade Daten für Analysen", "entdecke das Schema von S3-Daten", "ETL-Pipeline" → Glue.

---

## Hochverfügbarkeit und Disaster Recovery

**Multi-AZ und Multi-Region** *(Kapitel 18)*

Multi-AZ: synchrone Replikation innerhalb einer Region für automatische Failover (RDS Multi-AZ, Load Balancer über AZs). RPO ~0, RTO ~60s für RDS. Multi-Region: asynchrone Replikation für geografische Redundanz und geringere Latenz für globale Benutzer.

Schlüsselkonzepte: RTO (Recovery Time Objective – wie lange zur Wiederherstellung), RPO (Recovery Point Objective – wie viel Daten können verloren gehen). Pilot Light, Warm Standby, Active-Active DR Strategien.

Prüfungssignal: Unterscheide zwischen AZ-Ebene-Fehlern (Multi-AZ behandelt) vs. regionalen Fehlern (Multi-Region behandelt). Die Kosten und die Komplexität steigen erheblich mit Multi-Region.

---

## Kostenoptimierung

**EC2-Preismodelle** *(Kapitel 27)*

On-Demand: Voller Preis, keine Verpflichtung. Reserved Instances (1 oder 3 Jahre): 30-72% Rabatt für bestimmte Instanztypen. Savings Plans (Compute oder EC2 Instance): Verpflichtung für stündliche Ausgaben für Flexibilität. Spot: 60-90% Rabatt für unterbrechungsfähige Arbeitslasten.

Prüfungssignal: "Minimiere die Kosten für eine vorhersehbare Arbeitslast" → Savings Plans oder Reserved Instances. "Fehlertolerner Batch-Verarbeitung" → Spot. "Unvorhersehbar oder kurzfristig" → On-Demand.

---

**Datenübertragungs-Preisgestaltung** *(Kapitel 30)*

Inbound zu AWS: Kostenlos. Same-AZ: Kostenlos. Cross-AZ: 0,01 €/GB in jede Richtung. Cross-Region: 0,02 - 0,08 €/GB. Internet (Outbound): ca. 0,09 €/GB. NAT Gateway Verarbeitung: 0,045 €/GB. CloudFront Datenübertragung ist günstiger als direkte EC2-zu-Internet und Caching reduziert das Gesamtvolumen.

Prüfungssignal: "Reduziere die Datenübertragungskosten für S3/DynamoDB von einem privaten Subnetz" → Gateway Endpoints (kostenlos). "Reduziere NAT Gateway Kosten für andere Dienste" → Interface Endpoints.

---

## Beobachtbarkeit

**CloudWatch** *(verfügbar im gesamten Buch)*

Überwachung und Beobachtbarkeit. CloudWatch Metriken: numerische Zeitreihendaten von AWS-Diensten und benutzerdefinierten Anwendungen. CloudWatch Logs: Sammeln, Suchen und Analysieren von Protokolldaten. CloudWatch Alarme: Auslösen von Benachrichtigungen oder Auto Scaling basierend auf Metrik-Schwellenwerten. CloudWatch Dashboards: Visualisieren von Metriken.

Schlüsselkonzepte: Metrik-Dimensionen, Aufbewahrungsperioden, Log-Gruppen und Log-Streams, Metrik-Filter, CloudWatch Agent (für OS-Level Metriken und Logs von EC2), Container Insights.

---

**CloudTrail** *(verfügbar im gesamten Buch)*

Protokolliert jeden API-Aufruf, der in Ihrem AWS-Konto ausgeführt wird: wer ihn ausgeführt hat, von wo aus, wann und welche Antwort er erhalten hat. Multi-Region Trail speichert Protokolle dauerhaft in S3. Wird für die Sicherheitsüberprüfung, die Einhaltung von Vorschriften und die Untersuchung von Vorfällen verwendet.

Prüfungssignal: "Wer hat diese Ressource gelöscht?" "Überprüfe alle API-Aktivitäten" → CloudTrail.

---

**AWS Config** *(verfügbar in Kapitel 31)*

Verfolgt Konfigurationsänderungen von Ressourcen im Laufe der Zeit. Bewertet Ressourcen anhand von Compliance-Regeln. Protokolliert die Historie jeder Konfigurationsänderung für jede Ressource. Integriert sich mit Systems Manager für die Behebung von Problemen.

Prüfungssignal: "Entspricht diese Ressource unserer Sicherheitsrichtlinie?" "Wie sah die Konfiguration dieser Ressource letzte Woche aus?" → AWS Config.

---

## Gut Gewährstand

**Die sechs Säulen** *(Kapitel 31)*

| Säule                   | Kernfrage                               | Schlüssel-Services                               |
|------------------------|------------------------------------------|--------------------------------------------------|
| Betriebliche Exzellenz | Werden wir gut betrieben?                | CloudWatch, CloudTrail, SSM, Config               |
| Sicherheit             | Sind wir geschützt?                      | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Zuverlässigkeit         | Erholen wir uns von Ausfällen?            | Multi-AZ, Route 53 Failover, Backup/Restore, SQS  |
| Leistungsfähigkeit     | Nutzen wir die richtigen Ressourcen?       | Rightsizing, Auto Scaling, CloudFront, Kinesis   |
| Kostenoptimierung      | Verbessern wir unsere Ausgaben?          | Savings Plans, Spot, S3 Lifecycle, VPC Endpoints  |
| Nachhaltigkeit         | Minimieren wir unseren Umweltausstoß?    | Rightsizing, Graviton, effiziente Speichertypen |

AWS Well-Architected Tool: Bewertet Ihre Architektur anhand der sechs Säulen. Verwenden Sie es vor der Prüfung, um die Gründe hinter den Fragen jeder Säule zu verstehen.
