# Anhang C: Konzeptregister

Jedes im Buch eingeführte Schlüsselkonzept, zugeordnet zu seinem Kapitel, der verwendeten Analogie und der SAA-C03-Domäne, in der es vorkommt.

Verwenden Sie dies als Studienindex: Wenn Sie sich bei einem Konzept vor der Prüfung unsicher sind, finden Sie es hier und kehren für den Kontext zu seinem Kapitel zurück.

---

## A

**ACM (AWS Certificate Manager)** — Kostenlose öffentliche TLS-Zertifikate für ALB, CloudFront und API Gateway, mit automatischer Erneuerung per DNS-Validierung. CloudFront-Zertifikate müssen in us-east-1 liegen. Kapitel 16. Domäne 1.

**ACU (Aurora Capacity Unit)** — Die Maßeinheit für die Kapazität von Aurora Serverless v2. Skaliert automatisch und kann auf unterstützten Engine-Versionen automatisch auf 0 ACUs pausieren, wenn keine Verbindungen offen gehalten werden. Kapitel 24. Domäne 3.

**Alarm (CloudWatch)** — Eine Regel, die auslöst, wenn eine Metrik einen Schwellenwert überschreitet, und dadurch eine Benachrichtigung oder eine Auto-Scaling-Aktion auslöst. Kapitel 7. Domäne 2.

**ALB (Application Load Balancer)** — Layer-7-Load-Balancer, der HTTP/HTTPS-Traffic anhand von Pfad- und Host-Regeln routet. Kapitel 7. Domäne 2.

**AMI (Amazon Machine Image)** — Eine Vorlage, die das Betriebssystem, die Software und die Konfiguration für eine EC2-Instanz enthält. Kapitel 4. Domäne 3.

**Architektenmentalität** — „Was bricht zuerst, woran erkennen wir es, und was tut jemand um 3 Uhr nachts?" zu fragen, anstatt nur „Wie funktioniert das?". Kapitel 32, Kapitel 34. Domänenübergreifend.

**Architecture Decision Record (ADR)** — Ein kurzes Dokument, das eine Entscheidung, ihre Alternativen, ihre Begründung und das festhält, was zu einer Neubewertung führen würde. Kapitel 32. Domänenübergreifend.

**Architekturreview** — Ein strukturierter Prozess, der Folgendes abdeckt: Einschränkungen → Unbekannte → Optionen → Fehlermodi → Monitoring → Runbooks. Kapitel 32. Domänenübergreifend.

**Athena** — Serverloser SQL-Abfragedienst für Daten in S3. Zahlung pro gescanntem TB. Am besten mit spaltenorientierten Formaten (Parquet/ORC). Kapitel 26. Domäne 3.

**Auto Scaling Group (ASG)** — Eine Gruppe gemeinsam verwalteter EC2-Instanzen, die fehlerhafte Instanzen automatisch ersetzt und basierend auf der Last skaliert. Kapitel 7. Domäne 2, 3.

**Availability Zone (AZ)** — Ein oder mehrere physisch getrennte Rechenzentren innerhalb einer Region, verbunden durch Verbindungen mit niedriger Latenz. Kapitel 2. Domäne 2.

---

## B

**AWS Backup** — Zentralisiertes, richtlinienbasiertes Backup über EBS, RDS, DynamoDB, EFS und Storage Gateway hinweg. Unterstützt regionsübergreifende und kontoübergreifende Kopien. Kapitel 18, 23. Domäne 2.

**AWS Batch** — Verwaltetes Batch-Compute für Docker-Container. Besteht aus einer Job-Definition (was ausgeführt wird), einer Job Queue (wo Jobs warten) und einer Compute Environment (EC2 oder Fargate, On-Demand oder Spot). Für Workloads, die das 15-Minuten-Limit von Lambda überschreiten. Kapitel 21. Domäne 3.

**Bucket (S3)** — Ein Container für S3-Objekte. Buckets haben global eindeutige Namen und liegen in einer bestimmten Region. Kapitel 5. Domäne 3.

**Bucket-Policy** — Eine ressourcenbasierte Policy, die an einen S3-Bucket angehängt ist und den Zugriff für IAM-Principals und externe Konten steuert. Kapitel 5. Domäne 1.

---

## C

**Cache-Aside-Pattern** — Die Anwendung prüft zuerst den Cache; bei einem Miss fragt sie die Datenbank ab und speichert das Ergebnis dann im Cache. Kapitel 10. Domäne 3.

**Cache-Hit-Rate** — Anteil der Anfragen, die aus dem Cache statt vom Origin bedient werden. Höher ist besser. Kapitel 13. Domäne 3.

**AWS Client VPN** — Verwalteter OpenVPN-Endpunkt. Verbindet einzelne Geräte (Laptops, Workstations) über das Internet mit einer VPC. Authentifizierung über Active Directory, SAML-2.0-Föderation mit einem Identity Provider oder Mutual TLS. Unterstützt Split-Tunnel- und Full-Tunnel-Modus. Kontrast zu Site-to-Site VPN (Netzwerk-zu-Netzwerk). Kapitel 11. Domäne 1.

**CloudFront** — Das AWS-CDN. Cacht Inhalte an 750+ Edge Locations weltweit. Reduziert Latenz und Origin-Datenübertragungskosten. Kapitel 13. Domäne 3, 4.

**CloudTrail** — Protokolliert jeden AWS-API-Aufruf: wer, was, wann, von wo. In S3 gespeichert. Wird für Audits und die Untersuchung von Vorfällen verwendet. Domäne 1.

**CloudWatch** — Metriken, Logs, Alarme und Dashboards für AWS-Ressourcen und benutzerdefinierte Anwendungen. Durchgängig referenziert. Alle Domänen.

**Amazon Cognito** — Authentifizierung für die Endnutzer Ihrer Anwendung: User Pools sind ein verwaltetes Benutzerverzeichnis (Registrierung, Anmeldung, MFA, Social Login, JWTs); Identity Pools stellen temporäre AWS-Anmeldedaten aus. IAM ist für Ihre Ingenieure; Cognito ist für Ihre Kunden. Kapitel 14. Domäne 1.

**Cold Start (Lambda)** — Verzögerung beim ersten Aufruf (oder nach Inaktivität), während Lambda die Ausführungsumgebung initialisiert. Mit Provisioned Concurrency eliminierbar. Kapitel 20. Domäne 3.

**Compute Savings Plan** — Verpflichtung zu einem Dollarbetrag stündlicher EC2-Ausgaben, anwendbar auf jeden Instanztyp oder jede Größe. Kapitel 27. Domäne 4.

**Config (AWS)** — Verfolgt Konfigurationsänderungen an AWS-Ressourcen im Zeitverlauf und bewertet die Compliance anhand von Regeln. Kapitel 31. Domäne 1.

**AWS Control Tower** — Automatisiert die Governance mehrerer Konten: baut eine Landing Zone (Management-, Log-Archiv- und Audit-Konten) mit Guardrails in Minuten — die Fertigvariante zum manuellen Verdrahten von Organizations, CloudTrail und Config. Kapitel 14. Domäne 1.

**Cross-AZ-Datenübertragung** — Traffic zwischen Availability Zones innerhalb einer Region. Wird mit $0.01/GB in jede Richtung berechnet. Kapitel 30. Domäne 4.

**Cross-Region-Replikation** — Kopieren von Daten (S3 CRR, Aurora Global, DynamoDB Global Tables) in eine andere Region. Verursacht Datenübertragungskosten. Kapitel 18, 23, 30. Domäne 2.

---

## D

**AWS DataSync** — Agentenbasierte Migration und Synchronisation von Dateifreigaben (NFS/SMB) zu S3, EFS oder FSx. „rsync auf Steroiden, mit einer AWS-Konsole." Kapitel 25. Domäne 3.

**DAX (DynamoDB Accelerator)** — In-Memory-Cache speziell für DynamoDB. Lese-Latenz im Mikrosekundenbereich. Kapitel 9. Domäne 3.

**Dead Letter Queue (DLQ)** — Eine Queue, an die Nachrichten gesendet werden, die wiederholt bei der Verarbeitung fehlschlagen, um eine Blockade der Queue zu verhindern. Kapitel 19. Domäne 2.

**AWS DMS (Database Migration Service)** — Migriert Datenbanken mit minimaler Ausfallzeit zu AWS. Full Load (Erstkopie) plus CDC (Change Data Capture) hält Quelle und Ziel während der Migration synchron. Homogene Migrationen (gleicher Engine-Typ): DMS direkt verwenden. Heterogene Migrationen (verschiedene Engine-Typen, z. B. Oracle → Aurora PostgreSQL): zuerst SCT (Schema Conversion Tool), dann DMS. Kapitel 8. Domäne 3.

**Dedicated Host** — Ein physischer EC2-Server, der ausschließlich für Ihre Nutzung reserviert ist. Für bestimmte Softwarelizenzen erforderlich. Kapitel 27. Domäne 4.

**Defense in Depth** — Schichtung mehrerer Sicherheitskontrollen (IAM + Security Groups + NACLs + WAF + GuardDuty), sodass die Kompromittierung einer Schicht das System nicht offenlegt. Kapitel 33. Domäne 1.

**Direct Connect** — Eine dedizierte private Netzwerkverbindung von einem On-Premises-Standort zu AWS. Konsistenter als VPN. Kapitel 25. Domäne 3.

**DLQ** — Siehe Dead Letter Queue.

**DynamoDB** — Vollständig verwaltete NoSQL-Datenbank mit einstelliger Millisekunden-Latenz in jedem Maßstab. Key-Value- und Dokumentmodell. Kapitel 9. Domäne 3.

**DynamoDB Auto Scaling** — Passt die provisionierte Lese-/Schreibkapazität automatisch anhand von CloudWatch-Metriken an. Kapitel 29. Domäne 4.

**DynamoDB Streams** — Ein zeitlich geordnetes Änderungsprotokoll aller Item-Änderungen in einer DynamoDB-Tabelle. Wird mit Lambda für ereignisgesteuerte Verarbeitung verwendet. Kapitel 9. Domäne 2.

---

## E

**EBS (Elastic Block Store)** — Blockspeicher, der an eine einzelne EC2-Instanz angehängt ist. Bleibt unabhängig bestehen. Typen: gp3, io2, st1. Kapitel 6. Domäne 3.

**EC2 (Elastic Compute Cloud)** — Virtuelle Maschinen in der Cloud. Kapitel 4. Domäne 3.

**ECS (Elastic Container Service)** — Verwaltete Container-Orchestrierung. Der Fargate-Launch-Typ entfernt die Serververwaltung. Kapitel 21. Domäne 2, 3.

**EFS (Elastic File System)** — Gemeinsam genutztes NFS-Dateisystem, von mehreren EC2-Instanzen erreichbar. Skaliert automatisch. Zu den Speicherklassen gehören Standard, Infrequent Access und Archive, mit Intelligent-Tiering für die automatische Verschiebung zwischen Schichten. Kapitel 6. Domäne 3.

**EKS (Elastic Kubernetes Service)** — Verwaltete Kubernetes-Control-Plane auf AWS. Kapitel 21. Domäne 3.

**Elastic Disaster Recovery (DRS)** — Kontinuierliche Replikation von Servern (on-premises oder EC2) auf Blockebene in einen kostengünstigen Staging-Bereich, mit in Minuten gestarteten Recovery-Instanzen — ein verwaltetes Pilot Light. Kapitel 18. Domäne 2.

**ElastiCache** — Verwaltetes In-Memory-Caching. Redis (umfangreichere Funktionen) oder Memcached (einfacher). Kapitel 10. Domäne 3.

**Elastic IP** — Eine statische öffentliche IP-Adresse, die Sie zuweisen und EC2-Instanzen neu zuordnen können. Kapitel 11. Domäne 3.

**Envelope Encryption** — Ein Muster, bei dem Daten mit einem Data Key (DEK) verschlüsselt werden und der DEK mit einem Master Key (CMK in KMS) verschlüsselt wird. Kapitel 16. Domäne 1.

**EventBridge** — Event Bus zum Routen von Ereignissen aus AWS-Diensten, SaaS-Partnern und benutzerdefinierten Quellen an Ziele. Unterstützt zeitgesteuerte Regeln. Kapitel 22. Domäne 2.

**Explizites Deny** — Eine IAM-Deny-Anweisung, die durch kein Allow überschrieben werden kann. Hat Vorrang vor allen Allows. Kapitel 3. Domäne 1.

---

## F

**Failover-Routing (Route 53)** — Routet Traffic zu einem sekundären Endpunkt, wenn der primäre die Health Checks nicht besteht. Kapitel 12. Domäne 2.

**Fargate** — Serverlose Compute-Engine für ECS und EKS. Keine zu verwaltenden EC2-Instanzen. Kapitel 21. Domäne 3.

**Fan-out-Pattern** — Ein SNS-Topic stellt dieselbe Nachricht gleichzeitig an mehrere SQS-Queues zu. Kapitel 19. Domäne 2.

**FIFO-Queue (SQS)** — Exactly-once-Verarbeitung, strenge Reihenfolge. Geringerer Durchsatz als Standard-Queues. Kapitel 19. Domäne 2.

**Fehlermodus** — Eine konkrete Art, auf die ein System ausfallen kann. Das Identifizieren von Fehlermodi vor der Produktion ist der Kern des Architekturreviews. Kapitel 32. Domänenübergreifend.

---

## G

**Gateway Endpoint** — Ein kostenloser VPC-Endpunkttyp für S3 und DynamoDB. Routet Traffic über das private AWS-Netzwerk und eliminiert NAT-Gateway-Kosten. Kapitel 30. Domäne 4.

**Gateway Load Balancer (GWLB)** — Layer-3-Load-Balancer zum Einfügen virtueller Netzwerk-Appliances von Drittanbietern (Firewalls, IDS/IPS) inline in Traffic-Flüsse. Kapitel 7. Domäne 1.

**Geolocation-Routing (Route 53)** — Routet basierend auf dem geografischen Standort des Ursprungs der DNS-Abfrage. Kapitel 12. Domäne 3.

**Global Accelerator** — Routet Traffic per Anycast an die nächstgelegene AWS-Edge und verbessert die Latenz für dynamische Anwendungen. Kapitel 25. Domäne 3.

**Glue (AWS)** — Serverloses ETL. Glue Crawler entdecken das Schema; Glue Jobs transformieren Daten; der Data Catalog speichert Metadaten. Kapitel 26. Domäne 3.

**GSI (Global Secondary Index)** — Ein alternativer Index auf einer DynamoDB-Tabelle mit einem anderen Partition Key und optionalem Sort Key. Ermöglicht flexible Abfragemuster. Kapitel 9. Domäne 3.

**GuardDuty** — Bedrohungserkennungsdienst, der ML auf CloudTrail, VPC Flow Logs und DNS-Logs anwendet, um ungewöhnliche Aktivität zu erkennen. Kapitel 17. Domäne 1.

---

## H

**Health Check (Route 53)** — Überwacht die Verfügbarkeit von Endpunkten. Fehlgeschlagene Health Checks lösen Failover-Routing aus. Kapitel 12. Domäne 2.

**Hot Partition (DynamoDB)** — Eine Partition, die überproportional viel Traffic erhält, weil viele Anfragen denselben Partition Key teilen. Kapitel 9. Domäne 3.

---

## I

**IAM (Identity and Access Management)** — Steuert Authentifizierung und Autorisierung für AWS-Konten. Users, Groups, Roles, Policies. Kapitel 3, 14. Domäne 1.

**IAM-Rolle** — Eine IAM-Identität mit temporären Anmeldedaten, die von Diensten, Usern oder anderen Konten übernommen wird. Kapitel 3, 14. Domäne 1.

**Idempotenz** — Die Eigenschaft einer Operation, dasselbe Ergebnis zu erzeugen, egal ob sie einmal oder mehrmals aufgerufen wird. Entscheidend für verteilte Systeme (Rückerstattungen, Zahlungen, Auftragsverarbeitung). Kapitel 32. Domänenübergreifend.

**Idempotenzschlüssel** — Eine eindeutige Kennung für eine Operation, die vor der Ausführung geprüft wird, um Doppelverarbeitung zu verhindern. Kapitel 32. Domänenübergreifend.

**Interface Endpoint (PrivateLink)** — Ein VPC-Endpunkt für die meisten AWS-Dienste. Preis pro Stunde + pro GB. Bietet private Konnektivität ohne Internet oder NAT. Kapitel 30. Domäne 4.

**Internet Gateway (IGW)** — Ermöglicht Instanzen in öffentlichen Subnetzen die Kommunikation mit dem Internet. Erfordert, dass die Routing-Tabelle des Subnetzes eine Route zum IGW hat. Kapitel 11. Domäne 3.

**„Es kommt darauf an"** — Die ehrliche Antwort auf die meisten Architekturfragen, die immer vervollständigt werden muss: „Es kommt auf das Zugriffsmuster / den Maßstab / die Fehlerfolge / die Kostenbeschränkung an." Kapitel 33. Domänenübergreifend.

---

## K

**Kinesis Data Firehose** — Früherer Name von Amazon Data Firehose: verwaltete Auslieferung von Streaming-Daten an S3, Redshift, OpenSearch. Keine Consumer-Verwaltung. Ältere Prüfungsfragen verwenden möglicherweise noch den alten Namen. Kapitel 26. Domäne 3.

**Kinesis Data Streams** — Geordneter Echtzeit-Ereignisstrom. Beständig, innerhalb des Aufbewahrungsfensters wiedergebbar (Standard 24 Stunden, bis zu 365 Tage). Gemessen in Shards. Kapitel 26. Domäne 3.

**KMS (Key Management Service)** — Erstellt, speichert und kontrolliert kryptografische Schlüssel für die Verschlüsselung im Ruhezustand. Kapitel 16. Domäne 1.

---

## L

**Lambda** — Serverlose Funktionen, die durch Ereignisse ausgelöst werden. Zahlung pro Aufruf und pro ms. Maximale Dauer von 15 Minuten. Kapitel 20. Domäne 2, 3, 4.

**Lambda@Edge** — Lambda-Funktionen, die an CloudFront-Edge-Locations laufen und Anfragen und Antworten modifizieren. Kapitel 13. Domäne 3.

**AWS Lake Formation** — Zentralisierte Zugriffskontrollschicht für Data Lakes auf S3 und dem Glue Data Catalog. Bietet feingranulare Berechtigungen auf Tabellen-, Spalten- und Zeilenebene. Vereinfacht die Einrichtung eines sicheren Data Lakes. Kapitel 26. Domäne 3.

**Latency-based Routing (Route 53)** — Routet DNS-Abfragen zur AWS-Region mit der niedrigsten gemessenen Latenz. Kapitel 12. Domäne 3.

**Launch Template** — Eine versionierte Vorlage, die die EC2-Instanzkonfiguration für Auto Scaling Groups festlegt. Kapitel 7. Domäne 3.

**Least Privilege** — IAM-Best-Practice: nur die benötigten Berechtigungen gewähren, nicht mehr. Kapitel 3. Domäne 1.

**Lebenszyklusrichtlinie (S3)** — Regeln, die Objekte basierend auf dem Alter automatisch in günstigere Speicherklassen verschieben oder löschen. Kapitel 23. Domäne 4.

**LSI (Local Secondary Index)** — Ein alternativer Index auf einer DynamoDB-Tabelle, der denselben Partition Key, aber einen anderen Sort Key verwendet. Muss bei der Tabellenerstellung angelegt werden. Kapitel 9. Domäne 3.

---

## M

**Amazon Macie** — ML-basierte Erkennung sensibler Daten (PII) in S3 und Kennzeichnung von Expositionsrisiken. GuardDuty beobachtet das Verhalten; Macie prüft, was gespeichert ist. Kapitel 17. Domäne 1.

**Memcached** — Einfache, multithreaded In-Memory-Cache-Engine. Keine Persistenz, keine Datenstrukturen. Verwenden Sie Redis, es sei denn, Sie benötigen ausdrücklich Multithreading auf Kosten von Funktionen. Kapitel 10. Domäne 3.

**Amazon MemoryDB for Redis** — Beständige, Redis-kompatible In-Memory-Primärdatenbank. Anders als ElastiCache schreibt MemoryDB in ein Multi-AZ-Transaktionsprotokoll und garantiert so Datenbeständigkeit. Verwenden, wenn Redis-API-Kompatibilität erforderlich ist UND Datenverlust nicht hinnehmbar ist. Kapitel 10. Domäne 3.

**MGN (AWS Application Migration Service)** — Rehost/Lift-and-Shift: Replikation ganzer Server auf Blockebene in AWS, Test-Launches, dann Cutover zu nativen EC2-Instanzen. DataSync verschiebt Dateien; DMS verschiebt Datenbanken; MGN verschiebt Server. Kapitel 25. Domäne 3.

**Amazon MQ** — Verwalteter ActiveMQ/RabbitMQ-Broker, der Standardprotokolle spricht (AMQP, MQTT, STOMP). Für Lift-and-Shift bestehender Broker-Workloads ohne Codeänderungen; Greenfield-Messaging → SQS/SNS. Kapitel 19. Domäne 2.

**Multi-AZ (RDS)** — Synchrone Standby-Replik in einer anderen AZ mit automatischem Failover. RPO ~0, RTO ~60 Sekunden. Für Hochverfügbarkeit, nicht für Lese-Skalierung. Kapitel 8, 18. Domäne 2.

**Multi-Region** — Bereitstellung von Anwendungskomponenten über mehrere AWS-Regionen hinweg für geografische Redundanz und globale Performance. Höhere Komplexität und Kosten. Kapitel 18. Domäne 2.

---

## N

**Network Load Balancer (NLB)** — Layer-4-Load-Balancer (TCP/UDP/TLS): Millionen Anfragen pro Sekunde, statische IP pro AZ, erhält die Source-IP. Kein HTTP-Bewusstsein — das ist die Aufgabe des ALB. Kapitel 7. Domäne 3.

**NACL (Network Access Control List)** — Zustandslose Firewall auf Subnetzebene. Erfordert sowohl eingehende als auch ausgehende Regeln. Regeln werden in numerischer Reihenfolge ausgewertet. Kapitel 15. Domäne 1.

**NAT Gateway** — Ermöglicht Instanzen in privaten Subnetzen ausgehende Verbindungen zum Internet. Berechnet $0.045/GB verarbeitet. Kapitel 11, 30. Domäne 4.

---

## O

**Objekt (S3)** — Eine in S3 gespeicherte Datei. Besteht aus Key (Name), Value (Daten) und Metadaten. Maximale Größe 5 TB. Kapitel 5. Domäne 3.

**On-Demand-Kapazität (DynamoDB)** — Modus mit Zahlung pro Anfrage. Pro Anfrage teurer als Provisioned, aber ohne Kapazitätsplanung. Kapitel 29. Domäne 4.

**On-Demand-Instanzen (EC2)** — Zahlung pro Stunde ohne Verpflichtung. Maximale Flexibilität, maximaler Preis. Kapitel 27. Domäne 4.

**AWS Outposts** — Ein vollständig verwaltetes Rack mit AWS-Hardware, installiert im eigenen Rechenzentrum oder Colocation-Standort eines Kunden. Führt dieselben AWS-Dienste, APIs und Tools wie die öffentliche Cloud on-premises aus. AWS verwaltet Installation und Patching; der Kunde stellt Rack-Platz und Strom bereit. Für Datenresidenz, latenzarme On-Premises-Workloads oder getrennte Szenarien. Kapitel 2. Domäne 4.

---

## P

**Partition Key (DynamoDB)** — Die Primärschlüsselkomponente, die bestimmt, welche Partition ein Item speichert. Wählen Sie einen Schlüssel mit hoher Kardinalität für gleichmäßige Verteilung. Kapitel 9. Domäne 3.

**Permission Boundary** — Eine IAM-Policy, die die maximalen Berechtigungen festlegt, die eine IAM-Identität haben kann, selbst wenn andere Policies mehr gewähren. Kapitel 14. Domäne 1.

**Placement Group** — Steuert die physische Platzierung von EC2-Instanzen, um die Latenz zu minimieren (Cluster) oder die Verfügbarkeit zu maximieren (Spread). Kapitel 4. Domäne 3.

**PrivateLink** — AWS-Dienst zum Erstellen privater Endpunkte für in AWS gehostete Dienste, erreichbar über Interface Endpoints. Kapitel 30. Domäne 1.

**Provisioned Concurrency (Lambda)** — Vorinitialisierte Ausführungsumgebungen, die Cold-Start-Verzögerungen eliminieren. Kapitel 20. Domäne 3.

**Provisioned Capacity (DynamoDB)** — Vorab zugewiesener Lese- und Schreibdurchsatz, gemessen in Kapazitätseinheiten pro Sekunde. Günstiger als On-Demand bei vorhersehbarem Traffic. Kapitel 9, 29. Domäne 4.

---

## Q

**Amazon QuickSight** — Verwalteter Dienst für Business Intelligence und Datenvisualisierung. Verwendet SPICE (Super-fast, Parallel, In-memory Calculation Engine), um Daten für schnelles Dashboard-Rendering zu cachen. Verbindet sich mit Athena, S3, Redshift, RDS und anderen AWS-Datenquellen. Kein zu verwaltender BI-Server. Kapitel 26. Domäne 3.

---

## R

**RDS (Relational Database Service)** — Verwaltete relationale Datenbank. Übernimmt Backups, Patching, Failover. Kapitel 8. Domäne 3.

**RDS Proxy** — Verwaltet einen Connection Pool zwischen Lambda/Anwendung und RDS und verhindert die Erschöpfung von Verbindungen. Kapitel 8. Domäne 3.

**Read Replica (RDS)** — Asynchrone Kopie der Datenbank zur Lese-Skalierung. Bietet KEIN automatisches Failover. Kapitel 8, 24. Domäne 3.

**Redis** — In-Memory-Datenstrukturspeicher, verwendet für Caching, Session-Management, Echtzeit-Bestenlisten, Pub/Sub. Kapitel 10. Domäne 3.

**Reserved Instance (EC2)** — Eine Verpflichtung, einen bestimmten Instanztyp in einer bestimmten Region für 1 oder 3 Jahre zu nutzen, im Austausch gegen einen Rabatt. Kapitel 27. Domäne 4.

**Route 53** — Der DNS-Dienst und Domain-Registrar von AWS. Unterstützt mehrere Routing-Richtlinien. Kapitel 12. Domäne 2, 3.

**RPO (Recovery Point Objective)** — Maximal akzeptabler Datenverlust, gemessen in Zeit. „Wie viele Daten können wir uns leisten zu verlieren?" Kapitel 18. Domäne 2.

**RTO (Recovery Time Objective)** — Maximal akzeptable Zeit zur Wiederherstellung des Dienstes nach einem Ausfall. „Wie lange können wir ausfallen?" Kapitel 18. Domäne 2.

**Runbook** — Schritt-für-Schritt-Anleitungen zum Betrieb eines Systems, speziell für die Reaktion auf Vorfälle. „Was tut jemand um 3 Uhr nachts?" Kapitel 32. Domänenübergreifend.

---

## S

**S3 Intelligent-Tiering** — Verschiebt S3-Objekte automatisch zwischen Zugriffsschichten basierend auf Zugriffsmustern. Keine Abrufgebühr. Kapitel 23. Domäne 4.

**S3 Select** — Ruft eine Teilmenge des Inhalts eines S3-Objekts per SQL-Ausdrücken ab und reduziert die Datenübertragung. Altbestand: für Neukunden seit Mitte 2024 nicht verfügbar — Athena ist nun der primäre Weg zum Filtern und Abfragen von Daten in S3. S3 Object Lambda, einst die vorgeschlagene Alternative, ist selbst Altbestand (im November 2025 für Neukunden geschlossen; bestehende Workloads funktionieren weiter). Kapitel 30. Domäne 4.

**Savings Plan** — Ein flexibles Preismodell, das sich zu einem Dollarbetrag stündlicher Ausgaben verpflichtet, im Austausch gegen einen Rabatt. Flexibler als Reserved Instances. Kapitel 27. Domäne 4.

**SCP (Service Control Policy)** — AWS-Organizations-Policy, die die maximal verfügbaren Berechtigungen für Konten in einer OU einschränkt. Kapitel 14. Domäne 1.

**Secrets Manager** — Speichert und rotiert automatisch Secrets (Datenbankpasswörter, API-Schlüssel). Kapitel 16. Domäne 1.

**Security Group** — Eine zustandsbehaftete virtuelle Firewall auf Instanzebene. Nur Allow-Regeln; Rückverkehr ist automatisch. Kapitel 15. Domäne 1.

**Shard (Kinesis)** — Die Basiseinheit des Durchsatzes in Kinesis Data Streams: 1 MB/s Schreiben, 2 MB/s Lesen. Kapitel 26. Domäne 3.

**Shared Responsibility Model** — AWS ist verantwortlich für die Sicherheit *der* Cloud (Infrastruktur); Sie sind verantwortlich für die Sicherheit *in* der Cloud (Daten, Konfiguration, Zugriff). Kapitel 1. Domäne 1.

**Shield** — DDoS-Schutz. Standard: kostenlos, automatisch. Advanced: kostenpflichtig, mit DRT-Support und finanziellem Schutz. Kapitel 17. Domäne 1.

**Snow Family** — Physische Geräte für Offline-Bulk-Datentransfer (Snowball Edge: 80 TB) — wie ein gecharterter Frachtflug statt einer Fahrt über die Autobahn. Altbestand (2026): Snowmobile und Snowcone eingestellt; Snow-Geräte im November 2025 für Neukunden geschlossen (AWS verweist auf DataSync und Data Transfer Terminals), aber die SAA-C03-Prüfung erwartet bei „wochenlanger Transfer, begrenzte Bandbreite" weiterhin Snowball. Kapitel 25. Domäne 3.

**SNS (Simple Notification Service)** — Pub/Sub-Messaging. Schiebt Nachrichten gleichzeitig an alle Subscriber. Fan-out-Pattern. Kapitel 19. Domäne 2.

**Sort Key (DynamoDB)** — Optionale zweite Komponente des Primärschlüssels. Ermöglicht Bereichsabfragen innerhalb einer Partition. Kapitel 9. Domäne 3.

**Spot Instances** — EC2-Instanzen, die Restkapazität mit 60–90 % Rabatt nutzen. Können mit 2-minütiger Vorwarnung unterbrochen werden. Nur für fehlertolerante Workloads. Kapitel 27. Domäne 4.

**SQS (Simple Queue Service)** — Verwaltete Nachrichtenwarteschlange. Entkoppelt Producer von Consumern. Standard-Queues (At-least-once) und FIFO-Queues (Exactly-once). Kapitel 19. Domäne 2.

**Step Functions** — Serverloser Dienst zur Workflow-Orchestrierung. State Machines zur Koordination von AWS-Diensten. Kapitel 22. Domäne 2.

**AWS Storage Gateway** — Die Brücke zwischen On-Premises- und Cloud-Speicher: stellt lokal NFS/SMB- (File), iSCSI- (Volume) oder virtuelle Tape- (Tape) Schnittstellen bereit und persistiert die Daten in S3, Glacier oder als EBS-Snapshots. Kapitel 6. Domäne 3.

---

## T

**Target-Tracking-Scaling** — Auto-Scaling-Richtlinie, die die Kapazität anpasst, um einen Zielwert einer Metrik zu halten (z. B. 60 % CPU-Auslastung). Kapitel 7. Domäne 2.

**AWS Transfer Family** — Verwalteter SFTP-/FTPS-/FTP-Endpunkt mit S3 oder EFS als Backend. Partner behalten ihre vorhandenen SFTP-Clients; Dateien landen direkt in Ihrem Bucket. Kapitel 25. Domäne 3.

**Transit Gateway** — Hub-and-Spoke-Netzwerktopologie, die mehrere VPCs und On-Premises-Netzwerke über ein zentrales Gateway verbindet. Kapitel 25. Domäne 3.

**TTL (Time to Live)** — Ein Zeitstempel, nach dem DynamoDB ein Item automatisch löscht. Wird auch in DNS (wie lange Resolver einen Record cachen) und beim Caching (wie lange ein gecachter Wert gültig ist) verwendet. Kapitel 9, 12. Domäne 3.

---

## V

**VIF (Virtual Interface)** — Die logische Verbindung, die mit AWS Direct Connect verwendet wird. Public VIF greift auf öffentliche AWS-Endpunkte zu; Private VIF greift auf VPC-Ressourcen zu. Kapitel 25. Domäne 3.

**Visibility Timeout (SQS)** — Der Zeitraum, in dem eine empfangene Nachricht für andere Consumer verborgen ist. Ermöglicht die Verarbeitung, ohne dass andere Consumer dieselbe Nachricht sehen. Kapitel 19. Domäne 2.

**VPC (Virtual Private Cloud)** — Ein isoliertes virtuelles Netzwerk in AWS. Enthält Subnetze, Routing-Tabellen und Gateways. Kapitel 11. Domäne 1.

**VPC Endpoint** — Verbindet VPC-Ressourcen über das private AWS-Netzwerk mit AWS-Diensten. Gateway (kostenlos, S3/DynamoDB) und Interface (kostenpflichtig, die meisten anderen Dienste). Kapitel 30. Domäne 1, 4.

**VPC Flow Logs** — Erfasst Informationen über IP-Traffic zu und von Netzwerkschnittstellen in einer VPC. Wird von GuardDuty und zur Netzwerk-Fehlersuche verwendet. Kapitel 17. Domäne 1.

**VPC Peering** — Eine Netzwerkverbindung zwischen zwei VPCs, die das Routen von Traffic zwischen ihnen über private IP-Adressen ermöglicht. Kapitel 11. Domäne 3.

---

## W

**WAF (Web Application Firewall)** — Filtert HTTP/HTTPS-Traffic mit Regeln (IP-Blockaden, SQL-Injection, Rate Limits). Wird an CloudFront, ALB oder API Gateway angehängt. Kapitel 17. Domäne 1.

**AWS Wavelength** — AWS-Infrastruktur, die innerhalb der Netzwerke von 5G-Telekommunikationsanbietern am Funk-Edge bereitgestellt wird. Ermöglicht einstellige Millisekunden-Latenz zu mobilen Geräten. Für mobiles AR/VR, Echtzeit-Gaming, Telemetrie autonomer Fahrzeuge und Live-Video am 5G-Edge. Wavelength Zones sind Erweiterungen von AWS-Regionen innerhalb von Telekommunikationsnetzwerken. Kapitel 2. Domäne 3.

**Well-Architected Framework** — Das Sechs-Säulen-Bewertungsframework von AWS: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Kapitel 31. Domänenübergreifend.

**Weighted Routing (Route 53)** — Verteilt DNS-Abfragen nach Gewichtung über Endpunkte. Verwendet für Blue-Green-Deployments und A/B-Tests. Kapitel 12. Domäne 3.

**Write-Through-Caching** — Aktualisiert den Cache, wann immer die Datenbank aktualisiert wird. Daten sind stets konsistent, aber der Cache kann viele Items enthalten, die nie erneut gelesen werden. Kapitel 10. Domäne 3.

---

## SAA-C03 Schnellreferenz für Muster

| Wenn die Prüfung sagt …                       | Denken Sie an …                              |
|-----------------------------------------------|----------------------------------------------|
| „Dienste entkoppeln"                          | SQS, SNS, EventBridge                        |
| „Fan-out an mehrere Consumer"                 | SNS + SQS-Subscriptions                      |
| „Geordnete Echtzeit-Ereignisse"              | Kinesis Data Streams                         |
| „Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| „Globale niedrige Latenz (dynamisch)"        | Global Accelerator                           |
| „Globale niedrige Latenz (statisch/gecacht)" | CloudFront                                   |
| „DDoS-Schutz"                                 | Shield (Standard: kostenlos; Advanced: kostenpflichtig) |
| „SQL-Injection an der Edge blockieren"       | WAF                                          |
| „Kompromittierte Anmeldedaten erkennen"      | GuardDuty                                    |
| „API-Aktivität auditieren"                   | CloudTrail                                   |
| „Datenbank-Anmeldedaten rotieren"            | Secrets Manager                              |
| „Daten im Ruhezustand verschlüsseln, kundenverwaltete Schlüssel" | KMS mit CMK               |
| „Konfigurationswerte speichern"              | SSM Parameter Store                          |
| „Hohe IOPS für Datenbankspeicher"            | io2 EBS                                      |
| „Gemeinsames Dateisystem für EC2"            | EFS                                          |
| „S3-Daten mit SQL abfragen"                  | Athena                                       |
| „ETL-Pipeline für Analysen"                  | AWS Glue                                     |
| „Streaming-Daten an S3 liefern"              | Amazon Data Firehose                         |
| „Fehlertolerante Batch-Jobs, Kosten minimieren" | Spot Instances                            |
| „Zugesagter, stabiler Produktions-Workload"  | Savings Plans                                |
| „Privates Subnetz → S3 ohne NAT"             | S3 Gateway Endpoint                          |
| „Privates Subnetz → SQS ohne NAT"            | SQS Interface Endpoint                       |
| „Multi-AZ für RDS"                            | Automatisches Failover (nicht Lese-Skalierung) |
| „Read Replica für RDS"                        | Lese-Skalierung (nicht automatisches Failover) |
| „Wiederherstellungszeit von 1–2 Minuten, Cross-AZ" | Multi-AZ (RDS-Failover: 60–120 Sekunden) |
| „Wiederherstellung über Regionen, RTO in Minuten" | Pilot Light oder Warm Standby           |
| „Active-Active, RTO null"                     | Multi-Region Active-Active (am komplexesten) |
| „Batch-Verarbeitung über das Lambda-Timeout hinaus" | AWS Batch                              |
| „Redis-kompatibel UND beständig"             | MemoryDB for Redis                           |
| „Remote-Ingenieure greifen von zu Hause auf VPC zu" | Client VPN                            |
| „Datenbank mit minimaler Ausfallzeit migrieren" | DMS (+ SCT für heterogen)                |
| „BI-Dashboard auf AWS"                        | QuickSight                                   |
| „AWS im eigenen Rechenzentrum betreiben"     | Outposts                                     |
| „5G-Mobile-Edge-Compute"                     | Wavelength                                   |
