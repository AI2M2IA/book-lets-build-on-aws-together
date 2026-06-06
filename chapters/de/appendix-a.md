# Anhang A: AWS-Dienste Schnellreferenz

Jeder in diesem Buch behandelte Dienst, in der Reihenfolge seiner Einführung. Verwenden Sie dies als Studienreferenz und für ein schnelles Nachschlagen während der Prüfungsvorbereitung.

---

## Compute

**EC2 — Elastic Compute Cloud** *(Kapitel 4)*

Virtuelle Maschinen in der Cloud. Sie wählen den Instanztyp (CPU, Arbeitsspeicher, Storage), das Betriebssystem und die Region. Sie zahlen pro Stunde (On-Demand), pro Verpflichtung (Reserved Instances / Savings Plans) oder pro Restkapazitätsplatz (Spot). Das grundlegende Compute-Primitiv.

Wichtige Konzepte: AMI (Amazon Machine Image), Instanztypen (Familien t3, m6g, r6g, c6g), Schlüsselpaare, Instanzprofile, Platzierungsgruppen.

Prüfungssignal: Wenn ein Szenario persistente, zustandsbehaftete oder langlaufende Compute-Leistung erfordert — EC2 oder ECS. Wenn ein Szenario kurzlebige, ereignisgesteuerte oder leerlauffreie Compute-Leistung erfordert — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Kapitel 7)*

Auto Scaling Groups (ASGs) fügen EC2-Instanzen basierend auf der Last hinzu und entfernen sie. Application Load Balancer (ALBs) verteilen den Traffic über Instanzen und routen anhand von Pfad oder Host. Gemeinsam bilden sie die Schicht für horizontale Skalierung.

Wichtige Konzepte: Launch Template, Skalierungsrichtlinien (Target Tracking, Step, Scheduled), Health Checks, ALB Target Groups, Listener-Regeln, gewichtetes Routing.

Prüfungssignal: „Variable Last bewältigen" oder „Hochverfügbarkeit über AZs hinweg" → ASG + ALB.

---

**Lambda** *(Kapitel 20)*

Serverlose Funktionen. Sie schreiben Code; AWS führt ihn als Reaktion auf Ereignisse aus. Keine zu verwaltenden Server. Sie zahlen pro Aufruf und pro Millisekunde Ausführungszeit. Skaliert automatisch auf Tausende gleichzeitiger Ausführungen.

Wichtige Konzepte: Ereignisquellen (API Gateway, S3, SQS, EventBridge, Kinesis), Ausführungsrolle, Concurrency-Limits, reservierte und provisionierte Concurrency, Cold Start, Layers, maximale Dauer von 15 Minuten.

Prüfungssignal: „Serverless", „ereignisgesteuert", „kurzlebige Aufgaben", „keine Leerlaufkosten" → Lambda.

---

**ECS — Elastic Container Service** *(Kapitel 21)*

Führt Docker-Container auf AWS aus. Zwei Launch-Typen: EC2 (Sie verwalten den Host) und Fargate (AWS verwaltet den Host). ECS verwaltet Task-Definitionen, Services, Cluster-Scheduling und die Integration mit Load Balancern und Service Discovery.

Wichtige Konzepte: Task-Definition, ECS Service, Fargate vs. EC2 Launch-Typ, ECR (Container Registry), IAM-Rolle für Tasks, Service Auto Scaling.

Prüfungssignal: „Containerisierte Workloads", „Microservices", „Docker auf AWS" → ECS (meist Fargate für serverlose Container).

---

**EKS — Elastic Kubernetes Service** *(Kapitel 21)*

Managed Kubernetes. AWS betreibt die Control Plane; Sie betreiben die Worker Nodes (EC2 oder Fargate). Verwenden Sie EKS, wenn Ihr Team bereits Kubernetes nutzt oder Workloads betreibt, die Kubernetes-spezifische Funktionen erfordern.

Prüfungssignal: „Kubernetes", „bestehende K8s-Workloads müssen migriert werden" → EKS. „Brauche nur Container ohne K8s-Overhead" → ECS.

---

**AWS Batch** *(Kapitel 21)*

Managed Batch-Compute für Docker-Container. Sie definieren einen Job (Docker-Image + Befehl), eine Job Queue und eine Compute Environment (EC2 oder Fargate). AWS Batch stellt die Compute-Leistung automatisch bereit und skaliert sie, und beendet sie dann, wenn der Job abgeschlossen ist. Unterstützt Spot Instances zur Kostensenkung.

Wichtige Konzepte: Job-Definition (was ausgeführt wird), Job Queue (wo Jobs warten), Compute Environment (EC2 oder Fargate, On-Demand oder Spot), Array Jobs (viele parallele Kopien desselben Jobs ausführen).

Prüfungssignal: „Batch-Verarbeitung, die das 15-Minuten-Timeout von Lambda überschreitet", „endliche Compute-Jobs auf Containern", „HPC-Workloads auf AWS" → AWS Batch.

---

**AWS Outposts** *(Kapitel 2)*

Ein vollständig verwaltetes Rack mit AWS-Hardware, installiert in Ihrem eigenen Rechenzentrum oder Colocation-Standort. Führt dieselben AWS-Dienste, APIs und Tools wie die öffentliche Cloud aus (EC2, EBS, RDS, EKS, S3 on Outposts), aber physisch on-premises.

Wichtige Konzepte: Dieselben AWS-APIs on-premises, AWS verwaltet Installation und Patching, der Kunde stellt Rack-Platz und Strom bereit, Local Gateway (LGW) verbindet Outposts mit On-Premises-Netzwerken.

Prüfungssignal: „AWS im eigenen Rechenzentrum betreiben", „Datenresidenz erfordert, dass Compute on-premises bleibt", „AWS-APIs ohne Internetabhängigkeit" → Outposts.

---

**AWS Wavelength** *(Kapitel 2)*

AWS-Infrastruktur, die innerhalb der Netzwerke von 5G-Telekommunikationsanbietern bereitgestellt wird. Wavelength Zones liegen am Rand des 5G-Netzwerks und ermöglichen einstellige Millisekunden-Latenz zu mobilen Geräten.

Wichtige Konzepte: Wavelength Zones sind Erweiterungen von AWS-Regionen innerhalb von Telekommunikationsnetzwerken, der Traffic bleibt zwischen dem Gerät und der Wavelength Zone im Netz des Mobilfunkanbieters.

Prüfungssignal: „Einstellige Millisekunden-Latenz zu 5G-Mobilnutzern", „mobiles AR/VR", „Echtzeit-Gaming auf dem Mobilgerät", „Telemetrie autonomer Fahrzeuge" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Kapitel 25)*

Rehost-Migrationsdienst (Lift-and-Shift). Ein Agent repliziert die Festplatten der Quellserver Block für Block in einen kostengünstigen Staging-Bereich in AWS; Sie starten bei Bedarf Testkopien; beim Cutover wandelt MGN die replizierten Server in native EC2-Instanzen um. Keine Anwendungsänderungen erforderlich.

Wichtige Konzepte: Kontinuierliche Replikation auf Blockebene, Staging-Bereich, Test-Launches vor dem Cutover, die „7 Rs"-Migrationsstrategien (MGN = Rehost).

Prüfungssignal: „Hunderte von VMs schnell ohne Codeänderungen migrieren", „Server per Lift-and-Shift zu EC2 verschieben" → MGN. DataSync verschiebt *Dateien*; DMS verschiebt *Datenbanken*; MGN verschiebt *ganze Server*.

---

## Storage

**S3 — Simple Storage Service** *(Kapitel 5)*

Objektspeicher. Unbegrenzte Kapazität, 99,999999999 % (elf Neunen) Beständigkeit. Speichert Dateien als Objekte in Buckets. Buckets liegen in einer Region. Objekte können von 0 Byte bis 5 TB groß sein.

Wichtige Konzepte: Bucket-Policy, Objekt-ACL, Versionierung, statisches Website-Hosting, vorsignierte URLs, Multipart-Upload, Transfer Acceleration, Speicherklassen (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, dazu S3 Express One Zone für latenzkritische Directory-Bucket-Workloads in einer einzelnen AZ).

Prüfungssignal: „Dateien speichern und abrufen", „statische Assets", „Backups", „Data Lake" → S3. Die richtige Speicherklasse hängt von der Zugriffshäufigkeit und der Abrufgeschwindigkeit ab.

---

**EBS — Elastic Block Store** *(Kapitel 6)*

Blockspeicher, der an eine einzelne EC2-Instanz angeschlossen ist. Verhält sich wie eine Festplatte. Bleibt unabhängig vom Lebenszyklus der Instanz bestehen (Sie können ihn abtrennen und wieder anhängen). Die häufigsten Typen: gp3 (General Purpose SSD, der Standard), io2 (Provisioned IOPS für Datenbanken), st1 (durchsatzoptimierte HDD für sequenzielle Lesevorgänge).

Wichtige Konzepte: Snapshots (inkrementell, in S3 gespeichert), Verschlüsselung (KMS), Multi-Attach (nur io1/io2), Provisionierung von IOPS und Durchsatz.

Prüfungssignal: „Persistenter Speicher für EC2", „Datenbankspeicher", „erfordert Blockzugriff mit niedriger Latenz" → EBS.

---

**EFS — Elastic File System** *(Kapitel 6)*

Gemeinsam genutztes Dateisystem, gleichzeitig von mehreren EC2-Instanzen erreichbar. NFS-Protokoll. Skaliert automatisch. Pro GB teurer als EBS. Zu den Speicherklassen gehören Standard, Infrequent Access und Archive. Intelligent-Tiering verschiebt Dateien automatisch.

Prüfungssignal: „Gemeinsames Dateisystem", „mehrere EC2-Instanzen benötigen dieselben Dateien", „NFS" → EFS.

---

**FSx-Familie** *(Kapitel 6)*

Verwaltete Dateiserver für benannte Technologien. FSx for Windows File Server: SMB-Protokoll, NTFS, Active-Directory-Integration, Multi-AZ. FSx for Lustre: paralleles Hochleistungsdateisystem für HPC/ML, stellt S3-Objekte als Dateien dar (Lazy Loading). FSx for NetApp ONTAP: Multi-Protokoll (NFS + SMB + iSCSI), Snapshots, SnapMirror-Replikation. FSx for OpenZFS: NFS mit niedriger Latenz, sofortige Snapshots und beschreibbare Klone.

Prüfungssignal: „SMB/Active Directory" → FSx for Windows. „HPC/ML-Training auf S3-Daten" → FSx for Lustre. „NFS und SMB auf dieselben Daten / NetApp-Migration" → FSx for ONTAP. „ZFS-Migration / sofortige Klone" → FSx for OpenZFS.

---

**S3-Speicherklassen und Lebenszyklusrichtlinien** *(Kapitel 23)*

S3 Intelligent-Tiering verschiebt Objekte automatisch zwischen Zugriffsschichten basierend auf der Zugriffshäufigkeit. Lebenszyklusrichtlinien verschieben Objekte basierend auf Altersregeln zwischen Klassen (Standard → Standard-IA → Glacier). Die Glacier-Speicherklassen haben eine Abrufverzögerung von Minuten (Glacier Instant) bis zu 12 Stunden (Glacier Deep Archive).

Prüfungssignal: „Speicherkosten für selten genutzte Daten senken" → Lebenszyklusrichtlinien, Intelligent-Tiering oder Glacier.

---

**AWS Storage Gateway** *(Kapitel 6)*

Hybrider Speicherdienst, der On-Premises-Umgebungen mit AWS-Speicher verbindet. Stellt Speicher über die Protokolle bereit, die Anwendungen bereits verstehen, und persistiert die Daten in S3, S3 Glacier oder als EBS-Snapshots.

Wichtige Konzepte: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, Cached- oder Stored-Modus), Tape Gateway (virtuelle Tape Library → Glacier).

Prüfungssignal: „On-Premises-Anwendung benötigt Cloud-Speicher ohne Codeänderungen" → Storage Gateway. „Tape-Backup ersetzen" → Tape Gateway.

---

**AWS DataSync** *(Kapitel 25)*

Agentenbasierter Dienst zur Datenmigration und -replikation. Ein leichtgewichtiger Agent verbindet sich über NFS oder SMB mit On-Premises-Dateiservern und synchronisiert Freigaben zu S3, EFS oder FSx — mit eingebautem Scheduling, Bandbreitendrosselung und Integritätsprüfung.

Wichtige Konzepte: DataSync-Agent (VM on-premises oder EC2), NFS/SMB-Quellen, S3/EFS/FSx-Ziele, geplante inkrementelle Übertragungen.

Prüfungssignal: „Große Mengen an Dateien von On-Premises-NAS über das Netzwerk zu AWS migrieren oder kontinuierlich synchronisieren" → DataSync.

---

**AWS Transfer Family** *(Kapitel 25)*

Vollständig verwalteter SFTP-, FTPS- und FTP-Server mit S3 oder EFS als Speicherziel. Clients verbinden sich mit ihrer vorhandenen SFTP-Software; hochgeladene Dateien landen direkt in einem Bucket oder Dateisystem.

Wichtige Konzepte: Verwalteter Endpunkt (optional mit statischer IP), S3- oder EFS-Backing-Storage, Kompatibilität mit bestehenden Protokollen für externe Partner.

Prüfungssignal: „Partner müssen weiterhin per SFTP hochladen, die Dateien sollen aber in S3 landen" → Transfer Family.

---

**AWS Snow Family** *(Kapitel 25)*

Physische Datenübertragungsgeräte für die Offline-Migration großer Datenmengen. Snowball Edge Storage Optimized: 80 TB nutzbar, gehärtetes Gehäuse, wird an Ihren Standort versandt; Sie laden die Daten lokal und schicken das Gerät zur Aufnahme in S3 zurück.

Wichtige Konzepte: Rechnen Sie die Übertragung zuerst durch — wenn die Netzwerkübertragung etwa eine Woche oder länger dauern würde, gewinnt ein physisches Gerät. *Hinweis zum Altbestand (2026)*: AWS hat die Familie nach und nach eingestellt — Snowmobile (2024) und Snowcone (Ende 2024) sind weg, und die Snow-Geräte wurden im November 2025 für Neukunden geschlossen (AWS verweist jetzt auf DataSync und Data Transfer Terminals). Die SAA-C03-Fragendatenbank ist älter als diese Änderung, daher erwartet die Prüfung weiterhin Snowball als Antwort.

Prüfungssignal: „Migration im Petabyte-Bereich", „begrenzte Bandbreite, Übertragungszeit von Wochen" → Snow Family.

---

**AWS Backup** *(Kapitel 18 und 23)*

Zentralisierter, richtlinienbasierter Backup-Dienst über EBS, RDS, DynamoDB, EFS und Storage Gateway hinweg. Backup-Pläne legen Zeitpläne und Aufbewahrung fest; Vaults speichern die Wiederherstellungspunkte.

Wichtige Konzepte: Backup-Pläne und Vaults, regionsübergreifende und kontoübergreifende Kopien, Vault Lock für Unveränderlichkeit.

Prüfungssignal: „Backups über mehrere AWS-Dienste zentralisieren und automatisieren", „kontoübergreifende Backup-Kopien zum Schutz vor Ransomware/Kontokompromittierung" → AWS Backup.

---

## Datenbanken

**RDS — Relational Database Service** *(Kapitel 8)*

Verwaltete relationale Datenbanken. Unterstützte Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server und Aurora (die proprietäre Engine von AWS). AWS übernimmt Backups, Patching, Failover und Replikation. Sie verwalten Schemadesign, Abfragen und die Dimensionierung der Instanzen.

Wichtige Konzepte: Multi-AZ-Deployment (automatisches Failover, synchrone Replikation), Read Replicas (asynchron, zur Skalierung von Lesevorgängen), automatisierte Backups (1–35 Tage Aufbewahrung), manuelle Snapshots (bleiben bis zur Löschung erhalten), RDS Proxy (Connection Pooling).

Prüfungssignal: „Relationale Datenbank", „ACID-Transaktionen", „bestehender SQL-Workload" → RDS oder Aurora.

---

**Aurora** *(Kapitel 24)*

Die relationale Datenbank-Engine von AWS, kompatibel mit MySQL und PostgreSQL. Verteilte Storage-Engine, die Daten über 3 AZs in 6 Kopien repliziert. Typischerweise 5× schneller als MySQL. Aurora Serverless v2 skaliert die Kapazität automatisch (gemessen in ACUs — Aurora Capacity Units) und kann auf unterstützten Engine-Versionen automatisch auf 0 ACUs pausieren, wenn keine Verbindungen offen gehalten werden.

Wichtige Konzepte: Aurora-Cluster (Writer + bis zu 15 Aurora Replicas hinter einem einzigen Reader-Endpunkt), Aurora Global Database (regionsübergreifende Read Replicas mit < 1 Sekunde Replikationslatenz), Aurora Serverless v2, ACUs, Auto-Pause-/Resume-Verhalten.

Prüfungssignal: „Hochleistungsfähige relationale Datenbank", „MySQL/PostgreSQL-kompatibel", „globale Lesevorgänge", „variabler Workload" → Aurora.

---

**DynamoDB** *(Kapitel 9)*

Vollständig verwaltete NoSQL-Datenbank. Key-Value- und Dokumentmodell. Skaliert auf jeden Durchsatz mit einstelliger Millisekunden-Performance. Zwei Kapazitätsmodi: On-Demand (Zahlung pro Anfrage) und Provisioned (Zahlung pro Kapazitätseinheit pro Stunde, mit Auto Scaling).

Wichtige Konzepte: Partition Key (erforderlich), Sort Key (optional), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (Change Data Capture), DynamoDB Accelerator (DAX) — In-Memory-Cache, TTL (Time to Live), Transaktionen.

Prüfungssignal: „Hoher Durchsatz bei schlüsselbasiertem Zugriff", „flexibles Schema", „serverloses NoSQL" → DynamoDB.

---

**ElastiCache** *(Kapitel 10)*

Verwaltetes In-Memory-Caching. Zwei Engines: Redis (persistent, Pub/Sub, Lua-Scripting, Datenstrukturen) und Memcached (reiner Cache, einfacher, multithreaded). Wird verwendet, um die Datenbanklast zu senken und häufig gelesene Daten in Mikrosekunden bereitzustellen.

Wichtige Konzepte: Cache-Aside-Pattern, Write-Through-Pattern, Eviction-Policies, TTL, Cluster-Modus (Redis), Multi-AZ mit automatischem Failover.

Prüfungssignal: „Datenbanklast senken", „Lese-Latenz im Submillisekundenbereich", „Session-Management", „Echtzeit-Bestenliste" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Kapitel 10)*

Beständige, Redis-kompatible In-Memory-Primärdatenbank. Anders als ElastiCache (das ein Cache ist, bei dem Datenverlust hinnehmbar ist) speichert MemoryDB ein Multi-AZ-Transaktionsprotokoll und garantiert Beständigkeit. Sie können MemoryDB als Ihre primäre Datenbank verwenden — nicht nur als Cache vor einer anderen Datenbank.

Wichtige Konzepte: Redis-API-Kompatibilität, Multi-AZ-Transaktionsprotokoll (Beständigkeitsgarantie), In-Memory-Performance, Primärdatenbank (kein Cache-Layer).

Prüfungssignal: „Redis-kompatibel UND Datenverlust ist nicht hinnehmbar", „beständige In-Memory-Datenbank" → MemoryDB. „Redis als Cache, Datenverlust hinnehmbar" → ElastiCache Redis.

---

**Speziell entwickelte Datenbanken (Purpose-Built Databases)** *(Kapitel 9, 10 und 24)*

Passen Sie die Datenform an die Engine an. DocumentDB: MongoDB-kompatible Dokumente. Neptune: Graphdatenbank (Beziehungen, Traversierungen — Gremlin/SPARQL). Keyspaces: Cassandra-kompatibel, Wide-Column. Timestream: Zeitreihen (aktuelles Angebot: Timestream for InfluxDB). MemoryDB: beständige, Redis-kompatible *Primär*datenbank (vs. ElastiCache = Cache). QLDB („unveränderliches kryptografisches Ledger") wurde 2025 eingestellt — als veralteten Ablenker behandeln.

Prüfungssignal: „Social Graph / Empfehlungen / Betrugsringe" → Neptune. „MongoDB" → DocumentDB. „Cassandra" → Keyspaces. „IoT-Telemetrie über die Zeit" → Timestream.

---

**AWS DMS — Database Migration Service** *(Kapitel 8)*

Migriert Datenbanken mit minimaler Ausfallzeit zu AWS. Unterstützt Full Load (Erstkopie) plus CDC (Change Data Capture), um Quelle und Ziel während der laufenden Migration synchron zu halten. Bei der Migration zwischen demselben Engine-Typ (MySQL → MySQL, PostgreSQL → PostgreSQL) verwenden Sie DMS direkt. Bei der Migration zwischen verschiedenen Engine-Typen (Oracle → Aurora PostgreSQL) verwenden Sie zuerst das AWS Schema Conversion Tool (SCT), um das Schema zu konvertieren, und dann DMS für die Daten.

Wichtige Konzepte: Replication Instance, Quell- und Ziel-Endpunkte, Full Load + CDC, SCT (Schema Conversion Tool) für heterogene Migrationen.

Prüfungssignal: „Datenbank mit minimaler Ausfallzeit migrieren" → DMS. „Oracle zu Aurora" oder jede heterogene Migration → SCT + DMS. „Gleiche Engine, gleicher Typ" → DMS direkt.

---

## Networking

**VPC — Virtual Private Cloud** *(Kapitel 11)*

Ein isoliertes Netzwerk innerhalb von AWS. Erstreckt sich über alle AZs in einer Region. Sie definieren den IP-Adressraum (CIDR-Block), erstellen Subnetze (öffentlich oder privat), konfigurieren Routing-Tabellen und steuern den Zugriff über Security Groups und NACLs.

Wichtige Konzepte: Öffentliches Subnetz (Route zum Internet Gateway), privates Subnetz (Route zum NAT Gateway für ausgehenden Traffic), Internet Gateway (eingehend + ausgehend zum Internet), NAT Gateway (nur ausgehend für private Instanzen), VPC Peering (zwei VPCs verbinden), VPC Endpoints (Verbindung zu AWS-Diensten ohne Internet).

Prüfungssignal: „Privates Netzwerk auf AWS", „Ressourcen vom Internet isolieren", „Netzwerk-Traffic steuern" → VPC.

---

**Security Groups und NACLs** *(Kapitel 15)*

Security Groups sind zustandsbehaftete Firewalls auf Instanzebene — nur Allow-Regeln, Rückverkehr ist automatisch. NACLs (Network Access Control Lists) sind zustandslose Firewalls auf Subnetzebene — erfordern sowohl eingehende als auch ausgehende Regeln, ausgewertet in der Reihenfolge der Regelnummern.

Prüfungssignal: „Eine bestimmte IP am Zugriff auf das Subnetz hindern" → NACL. „Traffic zu/von einer Instanz steuern" → Security Group.

---

**Route 53** *(Kapitel 12)*

Der DNS-Dienst und Domain-Registrar von AWS. Leitet Internet-Traffic zu AWS-Ressourcen und externen Endpunkten. Routing-Richtlinien: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue Answer.

Wichtige Konzepte: Hosted Zones (öffentlich und privat), Record-Typen (A, AAAA, CNAME, Alias), Health Checks, Traffic Flow (visueller Policy-Editor — beachten Sie, dass Geoproximity auch als direkte Routing-Richtlinie auf Records verfügbar ist, mit einstellbarem Bias, ohne dass Traffic Flow erforderlich ist).

Prüfungssignal: „DNS-Routing", „Failover zwischen Regionen", „Routing basierend auf Latenz oder Standort" → Route 53 mit der passenden Routing-Richtlinie.

---

**CloudFront** *(Kapitel 13)*

Content Delivery Network (CDN). Cacht Inhalte an Edge Locations (750+ Points of Presence weltweit). Reduziert die Latenz für Endnutzer. Senkt die Origin-Transferkosten durch Caching. Integriert sich mit S3, EC2, ALB und API Gateway als Origins.

Wichtige Konzepte: Distribution, Origins, Behaviors (pfadbasiertes Routing zu Origins), TTL (Cache-Steuerung), Cache-Invalidierung, signierte URLs und Cookies (Zugriffskontrolle), Lambda@Edge und CloudFront Functions (Code an der Edge ausführen), Origin Shield (Origin-Last reduzieren).

Prüfungssignal: „Globale niedrige Latenz", „statische Inhalte cachen", „Origin-Last reduzieren", „mit Shield vor DDoS schützen" → CloudFront.

---

**Direct Connect und VPN** *(Kapitel 25)*

AWS Direct Connect ist eine dedizierte physische Netzwerkverbindung von Ihrem On-Premises-Rechenzentrum zu AWS. Umgeht das öffentliche Internet. Konsistentere Bandbreite und Latenz. AWS Site-to-Site VPN ist ein verschlüsselter Tunnel über das öffentliche Internet — schneller einzurichten, geringere Kosten, aber variable Performance.

Wichtige Konzepte: Virtual Interface (VIF), Direct Connect Gateway (Verbindung zu mehreren Regionen), Transit Gateway (Hub-and-Spoke-Netzwerktopologie), Redundanz von VPN-Tunneln.

Prüfungssignal: „Dedizierte private Verbindung zu AWS" → Direct Connect. „Verschlüsselte Verbindung, schnellere Einrichtung" → VPN. „Mehrere VPCs verbinden" → Transit Gateway.

---

**VPC Endpoints** *(Kapitel 30)*

Verbinden private Ressourcen mit AWS-Diensten, ohne das öffentliche Internet oder ein NAT Gateway zu nutzen. Gateway Endpoints: kostenlos, nur für S3 und DynamoDB verfügbar. Interface Endpoints (PrivateLink): Preis pro Stunde + pro GB, für die meisten AWS-Dienste verfügbar.

Prüfungssignal: „EC2 im privaten Subnetz ruft S3/DynamoDB auf — NAT-Gateway-Kosten senken" → Gateway Endpoint (kostenlos). „Private Verbindung zu SQS, SSM, Secrets Manager aus dem privaten Subnetz" → Interface Endpoint.

---

**AWS Client VPN** *(Kapitel 11)*

Verwalteter OpenVPN-Endpunkt, der einzelnen Geräten (Laptops, Workstations) eine sichere Verbindung zu einer VPC über das Internet ermöglicht. Authentifizierungsoptionen: Active Directory, SAML-2.0-Föderation mit einem Identity Provider oder Mutual TLS (zertifikatbasiert). Unterstützt Split-Tunnel (nur an die VPC gerichteter Traffic geht durch den Tunnel) und Full-Tunnel (gesamter Traffic wird über AWS geroutet).

Wichtige Konzepte: Client-VPN-Endpunkt, Target Network (Zuordnung eines VPC-Subnetzes), Autorisierungsregeln, Split-Tunnel vs. Full-Tunnel.

Prüfungssignal: „Remote-Ingenieure benötigen von zu Hause sicheren Zugriff auf eine VPC", „Konnektivität von einzelnen Geräten zur VPC" → Client VPN. Kontrast: Site-to-Site VPN = Netzwerk-zu-Netzwerk. Client VPN = Gerät-zu-Netzwerk.

---

**Network Load Balancer (NLB) und Gateway Load Balancer (GWLB)** *(Kapitel 7)*

Der NLB arbeitet auf Layer 4 (TCP/UDP/TLS): keine HTTP-Inspektion, nur Paket-Routing mit extremer Geschwindigkeit — Millionen Anfragen pro Sekunde, mit einer statischen IP pro AZ und Source-IP-Erhaltung. Der GWLB arbeitet auf Layer 3 und existiert zu einem einzigen Zweck: virtuelle Netzwerk-Appliances von Drittanbietern (Firewalls, IDS/IPS, Deep Packet Inspection) inline in Traffic-Flüsse einzufügen.

Wichtige Konzepte: NLB = Layer 4, statische IPs, extrem niedrige Latenz, Nicht-HTTP-Protokolle. GWLB = Layer 3, GENEVE-Kapselung, Appliance-Flotten hinter einem einzigen Einstiegspunkt. ALB = Layer 7 (Pfad-/Host-Routing).

Prüfungssignal: „Millionen TCP-Anfragen pro Sekunde", „statische IP für den Load Balancer", „Source-IP erhalten" → NLB. „Sicherheits-Appliances von Drittanbietern in den Traffic-Pfad einfügen" → GWLB.

---

**AWS Global Accelerator** *(Kapitel 25)*

Leitet Nutzer-Traffic an der nächstgelegenen Edge Location auf das private globale Backbone von AWS, anstatt das öffentliche Internet zu durchqueren. Stellt zwei statische Anycast-IP-Adressen bereit, die Ihren ALBs, NLBs oder EC2-Instanzen in einer oder mehreren Regionen vorgelagert sind. Verbessert Latenz und Konsistenz für *dynamischen* (nicht cachebaren) Traffic.

Wichtige Konzepte: Statische Anycast-IPs, Edge-Onboarding auf das AWS-Backbone, gesundheitsprüfungsbasiertes regionales Failover in Sekunden, Endpoint Groups mit Traffic Dials.

Prüfungssignal: „Globale Nutzer, dynamischer/Nicht-HTTP-Traffic, statische IP, schnelles regionales Failover" → Global Accelerator. „Cachebare/statische Inhalte" → stattdessen CloudFront.

---

## Sicherheit und Identität

**IAM — Identity and Access Management** *(Kapitel 3 und 14)*

Steuert, wer was in Ihrem AWS-Konto tun darf. Users (langfristige Anmeldedaten), Groups (Benutzer, die Berechtigungen teilen), Roles (temporäre Anmeldedaten für Dienste und kontoübergreifenden Zugriff), Policies (JSON-Dokumente, die Allow-/Deny-Regeln definieren).

Wichtige Konzepte: Principal, Action, Resource, Condition, explizites Deny > explizites Allow > implizites Deny, SCP (Service Control Policy in AWS Organizations), Permission Boundary, AssumeRole.

Prüfungssignal: IAM ist an jeder Sicherheitsfrage beteiligt. Schlüsselmuster: Dienste verwenden IAM-Rollen (nicht Users). Kontoübergreifender Zugriff nutzt Rollenübernahme. Least Privilege — gewähren Sie nur, was erforderlich ist.

---

**KMS — Key Management Service** *(Kapitel 16)*

Verwalteter Dienst für Verschlüsselungsschlüssel. Erstellt, speichert und kontrolliert kryptografische Schlüssel. Customer-Managed Keys (CMKs) erlauben Ihnen, Rotation, Nutzung und Zugriffsrichtlinien zu definieren. AWS-Managed Keys werden automatisch verwaltet.

Wichtige Konzepte: Key Policy (getrennt von der IAM-Policy), Envelope Encryption (Daten werden mit einem Data Key verschlüsselt; der Data Key wird mit dem CMK verschlüsselt), automatische Schlüsselrotation, Multi-Region Keys, Grants.

Prüfungssignal: „Daten im Ruhezustand verschlüsseln", „kundenverwaltete Verschlüsselungsschlüssel", „Schlüsselrotation" → KMS.

---

**Secrets Manager** *(Kapitel 16)*

Speichert und rotiert automatisch sensible Werte: Datenbank-Anmeldedaten, API-Schlüssel, OAuth-Token. Integriert sich mit RDS für die automatische Passwortrotation. Anwendungen rufen Secrets zur Laufzeit über die API ab — niemals Anmeldedaten hartcodieren.

Prüfungssignal: „Datenbank-Anmeldedaten speichern und rotieren", „hartcodierte Secrets vermeiden" → Secrets Manager. „Konfigurationswerte speichern, keine Secrets" → Parameter Store (SSM).

---

**AWS Shield** *(Kapitel 17)*

DDoS-Schutz. Shield Standard ist automatisch und kostenlos — schützt vor gängigen Volumen- und Protokollangriffen. Shield Advanced ergänzt finanziellen Schutz, ein DDoS-Reaktionsteam rund um die Uhr und detaillierte Angriffstransparenz.

Prüfungssignal: „Vor DDoS schützen" → Shield Standard (automatisch) oder Shield Advanced (Enterprise, mit SLA).

---

**WAF — Web Application Firewall** *(Kapitel 17)*

Filtert HTTP/HTTPS-Traffic basierend auf Regeln: IP-Blockaden, Rate Limits, SQL-Injection-Muster, XSS-Muster, geografische Einschränkungen, benutzerdefinierte Regeln. Wird an CloudFront, ALB, API Gateway oder AppSync angehängt.

Prüfungssignal: „Bestimmte IP-Adressen blockieren", „SQL-Injection an der Edge verhindern", „API-Aufrufe ratenbegrenzen" → WAF.

---

**GuardDuty** *(Kapitel 17)*

Bedrohungserkennungsdienst. Analysiert CloudTrail-Logs, VPC Flow Logs und DNS-Logs mit ML und Threat Intelligence. Erkennt ungewöhnliche API-Aktivität, Kommunikation mit bekannten bösartigen IPs, kompromittierte Anmeldedaten.

Prüfungssignal: „Ungewöhnliche Aktivität erkennen", „kompromittierte IAM-Anmeldedaten identifizieren", „kontinuierliche Bedrohungsüberwachung" → GuardDuty.

---

**Amazon Inspector** *(Kapitel 17)*

Automatisierter Dienst zur Schwachstellenbewertung. Scannt EC2-Instanzen, Amazon-ECR-Container-Images und Lambda-Funktionen kontinuierlich auf Softwareschwachstellen (CVEs) und unbeabsichtigte Netzwerk-Exposition. Die Befunde werden zur zentralen Verwaltung an AWS Security Hub gesendet.

Wichtige Konzepte: CVE-Scanning, kontinuierliche (nicht einmalige) Bewertung, Abdeckung von EC2 + ECR + Lambda, Security-Hub-Integration.

Prüfungssignal: „EC2 automatisch auf bekannte Schwachstellen scannen", „CVE-Scanning für Container-Images", „kontinuierliche Schwachstellenbewertung" → Inspector.

---

**Amazon Cognito** *(Kapitel 14)*

Verwaltete Authentifizierung für die Endnutzer Ihrer Anwendung — ein Benutzerverzeichnis, das Sie nicht selbst bauen müssen. User Pools übernehmen Registrierung, Anmeldung, MFA, Passwortzurücksetzung und Social-Identity-Provider (Google, Facebook, jeder OIDC-Provider) und stellen JWTs aus, die Ihre Anwendung validiert. Identity Pools tauschen diese Token gegen temporäre AWS-Anmeldedaten ein.

Wichtige Konzepte: User Pool (Authentifizierung, JWTs) vs. Identity Pool (temporäre AWS-Anmeldedaten), Hosted UI, Social-/OIDC-/SAML-Föderation, API-Gateway-Cognito-Authorizer.

Prüfungssignal: „Anwendung benötigt Registrierung/Anmeldung von Nutzern", „Social Login", „Nutzern einer Mobile-App temporären Zugriff auf AWS-Ressourcen geben" → Cognito. Kontrast: IAM ist für Ihre Ingenieure und Dienste; Cognito ist für Ihre Kunden.

---

**AWS Certificate Manager (ACM)** *(Kapitel 16)*

Stellt kostenlose öffentliche TLS/SSL-Zertifikate für AWS-verwaltete Dienste (ALB, CloudFront, API Gateway) bereit und übernimmt den gesamten Lebenszyklus — kein Verlängerungskalender, keine Handhabung privater Schlüssel. Erneuert sich automatisch per DNS-Validierung.

Wichtige Konzepte: DNS- vs. E-Mail-Validierung, automatische Erneuerung, Zertifikate für CloudFront müssen in us-east-1 liegen, kostenlose öffentliche Zertifikate können nicht exportiert werden (eine kostenpflichtige exportierbare Option existiert seit 2025).

Prüfungssignal: „HTTPS auf einem Load Balancer oder CDN", „automatische Zertifikatserneuerung" → ACM.

---

**Amazon Macie** *(Kapitel 17)*

Erkennung sensibler Daten für S3. Verwendet maschinelles Lernen und Mustererkennung, um PII (Namen, Kartennummern, Anmeldedaten) in Buckets zu finden, und kennzeichnet Zugriffsrisiken wie öffentliche Exposition. Ergänzt GuardDuty: GuardDuty beobachtet das Verhalten; Macie prüft, was gespeichert ist.

Wichtige Konzepte: Managed Data Identifiers (PII-Muster), nur auf S3 beschränkter Umfang, Befunde an Security Hub/EventBridge.

Prüfungssignal: „PII in S3 entdecken", „Exposition sensibler Daten identifizieren" → Macie.

---

**AWS Control Tower** *(Kapitel 14)*

Automatisiert Einrichtung und Governance einer Multi-Account-Umgebung. Erstellt eine Landing Zone — Management-, Log-Archiv- und Audit-Konten, vorverdrahtet mit Organizations, CloudTrail, Config und Guardrails — in Minuten statt in Tagen manueller Konfiguration.

Wichtige Konzepte: Landing Zone, Guardrails (präventiv = SCPs, detektivisch = Config-Regeln), Account Factory für standardisierte neue Konten.

Prüfungssignal: „Eine neue Multi-Account-Umgebung mit Best Practices automatisch einrichten und steuern" → Control Tower. Kontrast: Organizations ist der reine Baustein; Control Tower ist die automatisierte Montage.

---

## Messaging und Event Processing

**SQS — Simple Queue Service** *(Kapitel 19)*

Verwaltete Nachrichtenwarteschlange. Producer senden Nachrichten; Consumer lesen und löschen sie. Entkoppelt Dienste: Der Sender muss nicht wissen, ob der Empfänger verfügbar ist. Standard-Queues: At-least-once-Zustellung, Best-Effort-Reihenfolge. FIFO-Queues: Exactly-once-Verarbeitung, strenge Reihenfolge.

Wichtige Konzepte: Visibility Timeout (Nachricht ist während der Verarbeitung für andere Consumer verborgen), Dead Letter Queue (DLQ) für Nachrichten, die wiederholt fehlschlagen, Message Retention (Standard 4 Tage, bis zu 14), Long Polling (reduziert leere Antworten), maximale Payload standardmäßig 256 KB (seit 2025 auf 1 MiB anhebbar; für größere Payloads speichert die Extended Client Library den Inhalt in S3).

Prüfungssignal: „Dienste entkoppeln", „Anfragen während Lastspitzen puffern", „asynchrone Verarbeitung" → SQS. „Reihenfolge zählt und Exactly-once ist erforderlich" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Kapitel 19)*

Verwalteter Pub/Sub-Dienst. Publisher senden eine Nachricht an ein Topic; alle Subscriber erhalten eine Kopie. Fan-out-Muster: eine Nachricht → viele Consumer. Protokolle: SQS, Lambda, HTTP/HTTPS, E-Mail, SMS, Mobile Push.

Wichtige Konzepte: Topic, Subscription, Fan-out-Muster (SNS → mehrere SQS-Queues), Message Filtering (Subscriber erhalten nur passende Nachrichten).

Prüfungssignal: „Benachrichtigungen gleichzeitig an mehrere Endpunkte senden", „ein einzelnes Ereignis an mehrere Consumer fanouten" → SNS. Häufiges Muster: SNS + SQS für beständigen Fan-out.

---

**EventBridge** *(Kapitel 22)*

Event Bus zum Aufbau ereignisgesteuerter Architekturen. Leitet Ereignisse von AWS-Diensten, SaaS-Partnern und benutzerdefinierten Quellen an Lambda, SQS, SNS, Step Functions und andere Ziele weiter. Unterstützt zeitgesteuerte Regeln (Cron) und Mustererkennung.

Prüfungssignal: „Ereignisse von AWS-Diensten an Ziele routen", „Lambda-Funktionen zeitgesteuert ausführen", „ereignisgesteuerte Orchestrierung" → EventBridge.

---

**Step Functions** *(Kapitel 22)*

Serverlose Workflow-Orchestrierung. Koordiniert Lambda-Funktionen, ECS-Tasks, DynamoDB, SNS, SQS und andere Dienste in visuellen State Machines. Übernimmt Retries, Fehlerbehandlung, parallele Zweige und Wartezustände.

Wichtige Konzepte: State Machine, Zustandstypen (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (Exactly-once, langlaufend) vs. Express Workflows: Asynchron (At-least-once, hochvolumig — Tasks idempotent gestalten) und Synchron (At-most-once, gibt das Ergebnis direkt zurück wie ein API-Aufruf).

Prüfungssignal: „Mehrere Lambda-Funktionen orchestrieren", „langlaufende Workflows mit Retry-Logik", „menschliche Genehmigungsschritte" → Step Functions.

---

**Kinesis** *(Kapitel 26)*

Echtzeit-Daten-Streaming. Kinesis Data Streams: beständiger, geordneter Strom von Records (wie ein verteiltes Commit-Log). Consumer verarbeiten Records; Daten werden 24 Stunden (Standard) bis 365 Tage (mit Extended Data Retention) aufbewahrt. Amazon Data Firehose (früher Kinesis Data Firehose): vollständig verwaltete Auslieferung an S3, Redshift, OpenSearch, Splunk — keine Consumer-Verwaltung nötig.

Wichtige Konzepte: Shard (Durchsatzeinheit: 1 MB/s Schreiben, 2 MB/s Lesen), Partition Key (bestimmt die Shard-Zuweisung), Sequence Number, Checkpointing (KCL oder Lambda), Firehose vs. Streams.

Prüfungssignal: „Echtzeit-Streaming", „geordnete Records", „Ereignisse wiedergeben" → Kinesis Data Streams. „Streaming-Daten an S3/Redshift liefern, ohne Consumer zu verwalten" → Amazon Data Firehose (ältere Fragen sagen vielleicht „Kinesis Data Firehose"). „SQL auf Streaming-Daten" → Amazon Managed Service for Apache Flink (früher Kinesis Data Analytics). Kontrast zu SQS: Kinesis bewahrt auf und gibt wieder; SQS löscht bei Konsum.

---

**Amazon MQ** *(Kapitel 19)*

Verwalteter Message-Broker-Dienst, der Apache ActiveMQ und RabbitMQ unterstützt. Unterstützt branchenübliche Messaging-Protokolle: AMQP, STOMP, MQTT, OpenWire und WebSocket. Der primäre Anwendungsfall ist die Lift-and-Shift-Migration von On-Premises-Message-Broker-Workloads — Anwendungen, die bereits ActiveMQ oder RabbitMQ nutzen, können sich ohne Codeänderungen verbinden.

Wichtige Konzepte: Wahl der Engine ActiveMQ vs. RabbitMQ, Protokollunterstützung (AMQP/STOMP/MQTT), Single-Instance- oder Active/Standby-Broker-Konfiguration für HA.

Prüfungssignal: „On-Premises-ActiveMQ oder -RabbitMQ ohne Änderung des Anwendungscodes zu AWS migrieren" → Amazon MQ. „Greenfield-AWS-natives Messaging" → SQS oder SNS (einfacher, skalierbarer).

---

## Analytics

**Athena** *(Kapitel 26)*

Serverlose SQL-Abfragen auf in S3 gespeicherten Daten. Keine zu verwaltende Infrastruktur. Zahlung pro Abfrage (pro gescanntem TB). Am besten mit spaltenorientierten Formaten (Parquet, ORC) und partitionierten Daten.

Prüfungssignal: „S3-Daten mit SQL abfragen", „Ad-hoc-Analysen auf einem Data Lake", „keine Infrastrukturverwaltung" → Athena.

---

**Glue** *(Kapitel 26)*

Serverloser ETL-Dienst (Extract, Transform, Load). Glue Crawler entdecken Daten und aktualisieren den Glue Data Catalog. Glue Jobs führen Spark- oder Python-Transformationen aus. Der Data Catalog integriert sich mit Athena, Redshift Spectrum und EMR.

Prüfungssignal: „Daten für Analysen transformieren und laden", „das Schema von S3-Daten entdecken", „ETL-Pipeline" → Glue.

---

**Amazon QuickSight** *(Kapitel 26)*

Verwalteter Dienst für Business Intelligence und Datenvisualisierung. Verwendet SPICE (Super-fast, Parallel, In-memory Calculation Engine), eine In-Memory-Engine, die importierte Daten für schnelles Dashboard-Rendering cacht. Verbindet sich mit Athena, S3, Redshift, RDS und anderen AWS-Datenquellen. Kein zu verwaltender BI-Server.

Wichtige Konzepte: SPICE (In-Memory-Engine), Datasets, Analyses, Dashboards, ML Insights (Anomalieerkennung, Prognose), Sicherheit auf Zeilen- und Spaltenebene.

Prüfungssignal: „BI-Dashboard auf AWS ohne Verwaltung eines Servers", „Daten aus Athena oder Redshift visualisieren" → QuickSight.

---

**AWS Lake Formation** *(Kapitel 26)*

Zentralisierte Zugriffskontrollschicht für Data Lakes auf S3 und dem Glue Data Catalog. Bietet feingranulare Berechtigungen auf Tabellen-, Spalten- und Zeilenebene — granularer als reine S3-Bucket-Policies. Vereinfacht die Einrichtung eines sicheren Data Lakes: Lake Formation übernimmt das Berechtigungsmodell; Glue übernimmt den Katalog; S3 hält die Daten.

Wichtige Konzepte: Data-Lake-Berechtigungen (Tabellen-/Spalten-/Zeilenebene), Integration mit dem Glue Data Catalog, LF-Tags für attributbasierte Zugriffskontrolle, zentrales Grant/Revoke für Athena- und Redshift-Spectrum-Abfragen.

Prüfungssignal: „Feingranulare Zugriffskontrolle auf einen Data Lake", „Sicherheit auf Spalten- oder Zeilenebene für S3-Daten" → Lake Formation.

---

## Hochverfügbarkeit und Disaster Recovery

**Multi-AZ und Multi-Region** *(Kapitel 18)*

Multi-AZ: synchrone Replikation innerhalb einer Region für automatisches Failover (RDS Multi-AZ, Load Balancer über AZs). RPO ~0, RTO ~60 s für RDS. Multi-Region: asynchrone Replikation für geografische Redundanz und geringere Latenz für globale Nutzer.

Wichtige Konzepte: RTO (Recovery Time Objective — wie lange bis zur Wiederherstellung), RPO (Recovery Point Objective — wie viele Daten verloren gehen dürfen). DR-Strategien Pilot Light, Warm Standby, Active-Active.

Prüfungssignal: Unterscheiden Sie zwischen AZ-Ausfällen (von Multi-AZ behandelt) und regionalen Ausfällen (von Multi-Region behandelt). Kosten und Komplexität steigen mit Multi-Region erheblich.

---

**AWS Elastic Disaster Recovery (DRS)** *(Kapitel 18)*

Verwaltete Disaster Recovery für Server (on-premises oder EC2). Repliziert Quellserver kontinuierlich Block für Block in einen kostengünstigen Staging-Bereich und startet bei Bedarf vollständige Recovery-Instanzen in Minuten — ein verwaltetes Pilot Light: Recovery-Zeiten nahe Warm Standby zu nahezu Backup-and-Restore-Preisen.

Wichtige Konzepte: Kontinuierliche Replikation auf Blockebene, kostengünstiger Staging-Bereich, On-Demand-Recovery-Start, Point-in-Time Recovery.

Prüfungssignal: „Ausfallzeit und Datenverlust für serverbasierte Workloads mit einem verwalteten DR-Dienst minimieren", „Pilot Light, ohne es selbst zu bauen" → DRS.

---

## Kostenoptimierung

**EC2-Preismodelle** *(Kapitel 27)*

On-Demand: voller Preis, keine Verpflichtung. Reserved Instances (1 oder 3 Jahre): 30–72 % Rabatt für einen bestimmten Instanztyp. Savings Plans (Compute oder EC2 Instance): zugesagte stündliche Ausgaben für Flexibilität. Spot: 60–90 % Rabatt für unterbrechbare Workloads.

Prüfungssignal: „Kosten für einen vorhersehbaren Workload minimieren" → Savings Plans oder Reserved Instances. „Fehlertolerante Batch-Verarbeitung" → Spot. „Unvorhersehbar oder kurzfristig" → On-Demand.

---

**Datenübertragungspreise** *(Kapitel 30)*

Eingehend zu AWS: kostenlos. Gleiche AZ: kostenlos. Cross-AZ: $0.01/GB in jede Richtung. Cross-Region: $0.02–0.08/GB. Internet (ausgehend): ~$0.09/GB. NAT-Gateway-Verarbeitung: $0.045/GB. CloudFront-Datenübertragung ist günstiger als direkter EC2-zu-Internet-Transfer, und Caching reduziert das Gesamtvolumen.

Prüfungssignal: „Datenübertragungskosten für S3/DynamoDB aus dem privaten Subnetz senken" → Gateway Endpoints (kostenlos). „NAT-Gateway-Kosten für andere Dienste senken" → Interface Endpoints.

---

## Observability

**CloudWatch** *(durchgängig referenziert)*

Monitoring und Observability. CloudWatch Metrics: numerische Zeitreihendaten von AWS-Diensten und benutzerdefinierten Anwendungen. CloudWatch Logs: Log-Daten sammeln, durchsuchen und analysieren. CloudWatch Alarms: lösen basierend auf Metrik-Schwellenwerten Benachrichtigungen oder Auto Scaling aus. CloudWatch Dashboards: Metriken visualisieren.

Wichtige Konzepte: Metrik-Dimensionen, Aufbewahrungszeiträume, Log Groups und Log Streams, Metric Filters, CloudWatch Agent (für Metriken und Logs auf Betriebssystemebene von EC2), Container Insights.

---

**CloudTrail** *(durchgängig referenziert)*

Protokolliert jeden API-Aufruf, der in Ihrem AWS-Konto erfolgt: wer ihn ausgeführt hat, von wo, wann und wie die Antwort lautete. Ein Multi-Region-Trail speichert Logs unbegrenzt in S3. Wird für Sicherheitsaudits, Compliance und die Untersuchung von Vorfällen verwendet.

Prüfungssignal: „Wer hat diese Ressource gelöscht?" „Alle API-Aktivitäten auditieren" → CloudTrail.

---

**X-Ray** *(Kapitel 20)*

Verteiltes Tracing: verfolgt einzelne Anfragen über Dienste hinweg (Traces → Segments → Subsegments), erstellt eine Service Map mit Latenz und Fehlerraten pro Hop. Sampling hält den Overhead niedrig; Annotations machen Traces durchsuchbar. Active Tracing lässt sich für Lambda und API-Gateway-Stages aktivieren.

Prüfungssignal: „Anfragen über Microservices hinweg verfolgen", „den Engpass zwischen Diensten finden" → X-Ray (nicht CloudWatch, nicht CloudTrail).

---

**AWS Config** *(referenziert in Kapitel 31)*

Verfolgt Konfigurationsänderungen von Ressourcen im Zeitverlauf. Bewertet Ressourcen anhand von Compliance-Regeln. Zeichnet die Historie jeder Konfigurationsänderung für jede Ressource auf. Integriert sich mit Systems Manager zur Behebung.

Prüfungssignal: „Entspricht diese Ressource unserer Sicherheitsrichtlinie?" „Wie sah die Konfiguration dieser Ressource letzte Woche aus?" → AWS Config.

---

## Well-Architected

**Die sechs Säulen** *(Kapitel 31)*

| Säule                  | Kernfrage                               | Schlüsseldienste                                  |
|------------------------|-----------------------------------------|---------------------------------------------------|
| Operational Excellence | Betreiben wir gut?                      | CloudWatch, CloudTrail, SSM, Config               |
| Security               | Sind wir geschützt?                     | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability            | Erholen wir uns von Ausfällen?          | Multi-AZ, Route 53 Failover, Backup/Restore, SQS  |
| Performance Efficiency | Nutzen wir die richtigen Ressourcen?    | Right-Sizing, Auto Scaling, CloudFront, Kinesis   |
| Cost Optimization      | Geben wir klug aus?                     | Savings Plans, Spot, S3 Lifecycle, VPC Endpoints  |
| Sustainability         | Minimieren wir die Umweltauswirkungen?  | Right-Sizing, Graviton, effiziente Speicherklassen |

AWS Well-Architected Tool: bewertet Ihre Architektur anhand der sechs Säulen. Verwenden Sie es vor der Prüfung, um die Begründung hinter den Fragen jeder Säule zu verstehen.
