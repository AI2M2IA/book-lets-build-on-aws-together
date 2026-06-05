# Anhang C: Konzeptregister

Jeder Schlüsselkonzept, das im Buch eingeführt wird, zusammen mit seinem Kapitel, der verwendeten Analogie und dem SAA-C03-Domäne, in dem es vorkommt.

Verwenden Sie dies als Studienindex: Wenn Sie sich bei einem Konzept vor der Prüfung unsicher sind, finden Sie es hier und kehren Sie zu seinem Kapitel zurück, um den Kontext zu erhalten.

---

## A

**ACU (Aurora Capacity Unit)** – Die Maßeinheit für Aurora Serverless v2-Kapazität. Skaliert automatisch. Kapitel 24. Domäne 3.

**Alarm (CloudWatch)** – Eine Regel, die ausgelöst wird, wenn ein Metrik einen Schwellenwert überschreitet, wodurch eine Benachrichtigung oder eine Skalierung ausgelöst wird. Kapitel 7. Domäne 2.

**ALB (Application Load Balancer)** – Layer-7-Loadbalancer, der HTTP/HTTPS-Traffic basierend auf Pfad- und Host-Regeln leitet. Kapitel 7. Domäne 2.

**AMI (Amazon Machine Image)** – Eine Vorlage, die das Betriebssystem, die Software und die Konfiguration für eine EC2-Instanz enthält. Kapitel 4. Domäne 3.

**Architektur-Denkmuster** – Das Stellen der Frage "Was bricht zuerst, wie wissen wir das und was macht jemand um 3 Uhr morgens?", anstatt nur "Wie funktioniert das?". Kapitel 32, Kapitel 34. Querverweis.

**Architektur-Entscheidungsdokument (ADR)** – Ein kurzes Dokument, das eine Entscheidung, ihre Alternativen, ihre Begründung und was eine Neubewertung auslösen würde, erfasst. Kapitel 32. Querverweis.

**Architekturüberprüfung** – Ein strukturierter Prozess, der Folgendes abdeckt: Einschränkungen → Unbekannte → Optionen → Ausfallmodi → Überwachung → Runbooks. Kapitel 32. Querverweis.

**Athena** – Serverless-SQL-Query-Dienst für Daten in S3. Kosten pro TB gescannte. Bester Einsatz mit spaltenorientierten Formaten Parquet/ORC. Kapitel 26. Domäne 3.

**Auto Scaling Group (ASG)** – Eine Gruppe von EC2-Instanzen, die gemeinsam verwaltet werden, die ungesunden Instanzen automatisch ersetzt und die Skalierung basierend auf der Last steuert. Kapitel 7. Domäne 2, 3.

**Verfügbarkeitszone (AZ)** – Ein oder mehrere physisch getrennte Datenzentren innerhalb einer Region, die über Low-Latency-Verbindungen miteinander verbunden sind. Kapitel 2. Domäne 2.

---

## B

**Bucket (S3)** – Ein Container für S3-Objekte. Buckets haben eindeutige globale Namen und befinden sich in einer bestimmten Region. Kapitel 5. Domäne 3.

**Bucket-Richtlinie** – Eine ressourcengestützte Richtlinie, die an einen S3-Bucket angehängt ist und den Zugriff für IAM-Principalen und externen Konten steuert. Kapitel 5. Domäne 1.

---

## C

**Cache-aside-Muster** – Die Anwendung prüft zuerst den Cache; wenn er leer ist, wird eine Datenbankabfrage durchgeführt, die dann in den Cache gespeichert wird. Kapitel 10. Domäne 3.

**Cache-Hit-Rate** – Der Prozentsatz der Anfragen, die aus dem Cache anstelle der Ursprungsquelle bedient werden. Je höher, desto besser. Kapitel 13. Domäne 3.

**CloudFront** – AWS CDN. Cacht Inhalte an über 400 Edge-Standorten weltweit. Reduziert Latenz und die Datenübertragungskosten an die Ursprungsquelle. Kapitel 13. Domäne 3, 4.

**CloudTrail** – Protokolliert jeden AWS API-Aufruf: Wer, was, wann, von wo. Gespeichert in S3. Wird für Audits und Vorfalluntersuchungen verwendet. Domäne 1.

**CloudWatch** – Metriken, Protokolle, Alarme und Dashboards für AWS-Ressourcen und benutzerdefinierte Anwendungen. Wird im gesamten Dokument verwendet. Alle Domänen.

**Kaltstart (Lambda)** – Verzögerung bei der ersten Ausführung (oder nach Inaktivität), während Lambda die Ausführungsumgebung initialisiert. Verwenden Sie Provisioned Concurrency, um dies zu eliminieren. Kapitel 20. Domäne 3.

**Compute Savings Plan** – Verpflichtung zu einer Dollar-Menge an stündlicher EC2-Ausgabe, die auf jede Instanztyp oder -größe angewendet wird. Kapitel 27. Domäne 4.

**Config (AWS)** – Verfolgt Konfigurationsänderungen für AWS-Ressourcen im Laufe der Zeit und bewertet die Einhaltung von Regeln. Kapitel 31. Domäne 1.

**Cross-AZ-Datenübertragung** – Verkehr zwischen Verfügbarkeitszonen innerhalb einer Region. Wird mit 0,01 USD/GB in jede Richtung abgerechnet. Kapitel 30. Domäne 4.

**Cross-region-Replikation** – Kopieren von Daten (S3 CRR, Aurora Global, DynamoDB Global Tables) in eine andere Region. Verursacht Datenübertragungskosten. Kapitel 18, 30. Domäne 2.

---

## D

**DAX (DynamoDB Accelerator)** – In-Memory-Cache, der speziell für DynamoDB entwickelt wurde. Mikrosekunden-Lese-Latenz. Kapitel 9. Domäne 3.

**Dead Letter Queue (DLQ)** – Eine Warteschlange, in der Nachrichten, die das Verarbeiten wiederholt fehlschlagen, gesendet werden, um Blockierungen von Warteschlangen zu verhindern. Kapitel 19. Domäne 2.

**Dedizierter Host** – Ein physischer EC2-Server, der ausschließlich für Ihren Gebrauch reserviert ist. Erforderlich für bestimmte Softwarelizenzen. Kapitel 27. Domäne 4.

**Defense in Depth** – Schichten Sie mehrere Sicherheitskontrollen (IAM + Sicherheitsgruppen + NACLs + WAF + GuardDuty) ein, damit eine Kompromittierung einer Schicht das System nicht gefährdet. Kapitel 33. Domäne 1.

**Direct Connect** – Eine dedizierte private Netzwerkverbindung von einem On-Premises-Standort zu AWS. Konsistenter als VPN. Kapitel 25. Domäne 3.

**DLQ** – Siehe Dead Letter Queue.

**DynamoDB** – Vollständig verwaltete NoSQL-Datenbank mit Latenzzeiten im Millisekundenbereich bei jeder Skalierung. Key-Value- und Dokumentenmodell. Kapitel 9. Domäne 3.

**DynamoDB Auto Scaling** – Passt die bereitgestellten Lese-/Schreibkapazitäten automatisch an, basierend auf CloudWatch-Metriken. Kapitel 29. Domäne 4.

**DynamoDB Streams** – Ein zeitgeordneter Änderungs-Log aller Elementeänderungen in einer DynamoDB-Tabelle. Wird mit Lambda für ereignisgesteuerte Verarbeitung verwendet. Kapitel 9. Domäne 2.

---

## E

**EBS (Elastic Block Store)** – Block-Storage, das an eine einzelne EC2-Instanz angehängt wird. Persistiert unabhängig. Typen: gp3, io2, st1. Kapitel 6. Domäne 3.

**EC2 (Elastic Compute Cloud)** – Virtuelle Maschinen in der Cloud. Kapitel 4. Domäne 3.

```markdown
**ECS (Elastic Container Service)** — Managed container orchestration. Fargate Launch Type removes server management. Kapitel 21. Domain 2, 3.

**EFS (Elastic File System)** — Gemeinsamer NFS-Dateisystem, das von mehreren EC2-Instanzen zugänglich ist. Automatische Skalierung. Kapitel 6. Domain 3.

**EKS (Elastic Kubernetes Service)** — Managed Kubernetes Control Plane auf AWS. Kapitel 21. Domain 3.

**ElastiCache** — Managed In-Memory-Caching. Redis (reichere Funktionen) oder Memcached (einfacher). Kapitel 10. Domain 3.

**Elastic IP** — Eine statische öffentliche IP-Adresse, die Sie zuweisen und mit EC2-Instanzen neu verknüpfen können. Kapitel 11. Domain 3.

**Umschließungsverschlüsselung** — Ein Muster, bei dem Daten mit einem Daten-Schlüssel (DEK) verschlüsselt werden und der DEK mit einem Master-Schlüssel (CMK in KMS) verschlüsselt wird. Kapitel 16. Domain 1.

**EventBridge** — Event Bus zum Weiterleiten von Ereignissen von AWS-Diensten, SaaS-Partnern und benutzerdefinierten Quellen an Ziele. Unterstützt geplante Regeln. Kapitel 22. Domain 2.

**Explizite Ablehnung** — Eine IAM-Ablehnungserklärung, die von keiner Erlaubnis überschrieben werden kann. Sie hat Vorrang vor allen Erlaubnissen. Kapitel 3. Domain 1.

---

## F

**Fehlerübernahme (Route 53)** — Leitet den Datenverkehr an einen sekundären Endpunkt weiter, wenn der primäre die Gesundheitsprüfungen nicht besteht. Kapitel 12. Domain 2.

**Fargate** — Serverless Compute Engine für ECS und EKS. Keine EC2-Instanzen, die verwaltet werden müssen. Kapitel 21. Domain 3.

**Verzweigungsmuster** — Ein SNS-Thema liefert dieselbe Nachricht gleichzeitig an mehrere SQS-Warteschlangen. Kapitel 19. Domain 2.

**FIFO-Warteschlange (SQS)** — Genau-einmal-Verarbeitung, strenge Reihenfolge. Geringere Durchsatzrate als Standardwarteschlangen. Kapitel 19. Domain 2.

**Ausfallmodus** — Eine bestimmte Art, wie ein System ausfallen kann. Die Identifizierung von Ausfallmodi vor der Produktion ist das Kernstück der Architekturprüfung. Kapitel 32. Cross-Domain.

---

## G

**Gateway-Endpunkt** — Ein kostenloser VPC-Endpunkttyp für S3 und DynamoDB. Leitet den Datenverkehr über das private AWS-Netzwerk weiter und eliminiert NAT-Gateway-Gebühren. Kapitel 30. Domain 4.

**Geolokalisierungs-Routing (Route 53)** — Routing basierend auf der geografischen Lage der DNS-Query-Quelle. Kapitel 12. Domain 3.

**Global Accelerator** — Leitet den Datenverkehr über Anycast zum nächsten AWS-Edge-Standort, wodurch die Latenz für dynamische Anwendungen verbessert wird. Kapitel 25. Domain 3.

**Glue (AWS)** — Serverless ETL. Glue Crawler entdecken Schemas; Glue Jobs transformieren Daten; Data Catalog speichert Metadaten. Kapitel 26. Domain 3.

**GSI (Global Secondary Index)** — Ein alternativer Index für eine DynamoDB-Tabelle mit einem anderen Partition-Schlüssel und optionalem Sortierschlüssel. Ermöglicht flexible Abfrage-Muster. Kapitel 9. Domain 3.

**GuardDuty** — Bedrohungserkennungsdienst mit ML auf CloudTrail, VPC Flow Logs und DNS Logs zur Erkennung ungewöhnlicher Aktivitäten. Kapitel 17. Domain 1.

---

## H

**Gesundheitsprüfung (Route 53)** — Überwacht die Verfügbarkeit von Endpunkten. Fehlgeschlagene Gesundheitsprüfungen lösen die Fehlerübernahme aus. Kapitel 12. Domain 2.

**Heißer Partition (DynamoDB)** — Eine Partition, die unverhältnismäßig viel Traffic erhält, weil viele Anfragen denselben Partition-Schlüssel teilen. Kapitel 9. Domain 3.

---

## I

**IAM (Identity and Access Management)** — Steuert die Authentifizierung und Autorisierung für AWS-Konten. Benutzer, Gruppen, Rollen, Richtlinien. Kapitel 3, 14. Domain 1.

**IAM-Rolle** — Eine IAM-Identität mit temporären Anmeldeinformationen, die von Diensten, Benutzern oder anderen Konten übernommen wird. Kapitel 3, 14. Domain 1.

**Idempotenz** — Die Eigenschaft einer Operation, die dasselbe Ergebnis erzeugt, ob sie einmal oder mehrmals aufgerufen wird. Kritisch für verteilte Systeme (Rückerstattungen, Zahlungen, Bestellabwicklung). Kapitel 32. Cross-Domain.

**Idempotenzschlüssel** — Ein eindeutiger Bezeichner für eine Operation, der vor der Ausführung überprüft wird, um doppelte Verarbeitung zu verhindern. Kapitel 32. Cross-Domain.

**Schnittstellen-Endpunkt (PrivateLink)** — Ein VPC-Endpunkt für die meisten AWS-Dienste. Preis pro Stunde + pro GB. Bietet private Konnektivität ohne Internet oder NAT. Kapitel 30. Domain 4.

**Internet Gateway (IGW)** — Ermöglicht Instanzen in öffentlichen Subnetzen die Kommunikation mit dem Internet. Das Subnetz-Routing-Tabellen muss einen Routen zu dem IGW haben. Kapitel 11. Domain 3.

**"Es hängt davon ab"** — Die ehrliche Antwort auf die meisten Architekturfragen, die immer ergänzt werden muss: "Es hängt vom Zugriffsverhalten / Maßstab / Ausfallfolge / Kostenbeschränkung ab." Kapitel 33. Cross-Domain.

---

## K

**Kinesis Data Firehose** — Managed Lieferung von Streaming-Daten zu S3, Redshift, OpenSearch. Kein Consumer-Management. Kapitel 26. Domain 3.

**Kinesis Data Streams** — Echtzeit-geordnete Ereignisstrom. Dauerhaft, wiederholbar. Gemessen in Shards. Kapitel 26. Domain 3.

**KMS (Key Management Service)** — Erstellt, speichert und kontrolliert kryptografische Schlüssel für die Verschlüsselung im Ruhezustand. Kapitel 16. Domain 1.

---

## L

**Lambda** — Serverless Funktionen, die durch Ereignisse ausgelöst werden. Preis pro Aufruf und pro ms. Max. 15-minütige Dauer. Kapitel 20. Domain 2, 3, 4.

**Lambda@Edge** — Lambda-Funktionen, die an CloudFront Edge-Standorten ausgeführt werden und Anfragen und Antworten ändern. Kapitel 13. Domain 3.

**Latenzbasierte Routing (Route 53)** — Routet DNS-Abfragen zum AWS-Region mit der geringsten gemessenen Latenz. Kapitel 12. Domain 3.

**Launch-Vorlage** — Eine versionierte Vorlage, die die EC2-Instanzkonfiguration für Auto Scaling Groups festlegt. Kapitel 7. Domain 3.
```

```markdown
**Least privilege** — IAM Best Practice: Erlauben Sie nur die erforderlichen Berechtigungen, keine darüber hinausgehenden. Kapitel 3. Domäne 1.

**Lifecycle policy (S3)** — Regeln, die Objekte automatisch in kostengünstigere Speicherklassen überführen oder basierend auf dem Alter löschen. Kapitel 23. Domäne 4.

**LSI (Local Secondary Index)** — Ein alternativer Index für eine DynamoDB-Tabelle mit demselben Partition Key, aber einem anderen Sort Key. Muss bei der Tabellenerstellung erstellt werden. Kapitel 9. Domäne 3.

---

## M

**Memcached** — Einfache, mehrfädige In-Memory-Caching-Engine. Keine Persistenz, keine Datenstrukturen. Verwenden Sie Redis, es sei denn, Sie benötigen explizit Multithreading zum Austausch von Funktionen und Merkmalen. Kapitel 10. Domäne 3.

**Multi-AZ (RDS)** — Synchroner Standby-Replikat in einer anderen AZ mit automatischer Failover. RPO ~0, RTO ~60 Sekunden. Für Hochverfügbarkeit, nicht für Lese-Skalierung. Kapitel 8, 18. Domäne 2.

**Multi-Region** — Bereitstellung von Anwendungskomponenten über mehrere AWS-Regionen für geografische Redundanz und globale Leistung. Höhere Komplexität und Kosten. Kapitel 18. Domäne 2.

---

## N

**NACL (Network Access Control List)** — Stateless-Firewall auf Subnetzebene. Benötigt sowohl Inbound- als auch Outbound-Regeln. Regeln werden in numerischer Reihenfolge ausgewertet. Kapitel 15. Domäne 1.

**NAT Gateway** — Ermöglicht Instanzen in privaten Subnetzen, Verbindungen zum Internet herzustellen. Kosten 0,045 $/GB verarbeiteter Daten. Kapitel 11, 30. Domäne 4.

---

## O

**Object (S3)** — Eine Datei, die in S3 gespeichert ist. Besteht aus Key (Name), Value (Daten) und Metadaten. Maximale Größe 5 TB. Kapitel 5. Domäne 3.

**On-Demand capacity (DynamoDB)** — Pay-per-Request-Modus. Teurer pro Request als provisioniert, aber keine Kapazitätsplanung erforderlich. Kapitel 29. Domäne 4.

**On-Demand instances (EC2)** — Pay-per-Stunde mit keiner Verpflichtung. Maximale Flexibilität, maximaler Preis. Kapitel 27. Domäne 4.

---

## P

**Partition key (DynamoDB)** — Der primäre Key-Komponent, der bestimmt, in welcher Partition ein Item gespeichert wird. Wählen Sie einen hochcardinalen Key für eine gleichmäßige Verteilung. Kapitel 9. Domäne 3.

**Permission boundary** — Eine IAM-Policy, die die maximalen Berechtigungen festlegt, die eine IAM-Identität haben kann, selbst wenn andere Policies mehr gewähren. Kapitel 14. Domäne 1.

**Placement group** — Steuert die physische Platzierung von EC2-Instanzen, um Latenz zu minimieren (Cluster) oder die Verfügbarkeit zu maximieren (Verteilung). Kapitel 4. Domäne 3.

**PrivateLink** — AWS-Dienst zum Erstellen privater Endpunkte für Dienste, die in AWS gehostet werden, über Interface Endpoints zugänglich. Kapitel 30. Domäne 1.

**Provisioned concurrency (Lambda)** — Vorinitialisierte Ausführungsumgebungen, die Cold-Start-Verzögerungen eliminieren. Kapitel 20. Domäne 3.

**Provisioned capacity (DynamoDB)** — Vorbereiteter Lese- und Schreibdurchsatz, gemessen in Capacity Units pro Sekunde. Günstiger als On-Demand für vorhersehbaren Traffic. Kapitel 9, 29. Domäne 4.

---

## R

**RDS (Relational Database Service)** — Verwalteter relationaler Datenbankdienst. Behandelt Backups, Patches, Failover. Kapitel 8. Domäne 3.

**RDS Proxy** — Verwaltet einen Connection Pool zwischen Lambda/Anwendung und RDS, um Connection-Erstickungen zu verhindern. Kapitel 8. Domäne 3.

**Read Replica (RDS)** — Asynchroner Copy der Datenbank für Lese-Skalierung. Stellt KEIN automatischen Failover bereit. Kapitel 8, 24. Domäne 3.

**Redis** — In-Memory-Datenstruktur-Store für Caching, Session Management, Echtzeit-Leaderboards, Pub/Sub. Kapitel 10. Domäne 3.

**Reserved Instance (EC2)** — Eine Verpflichtung, eine bestimmte Instanztyp in einer bestimmten Region für 1 oder 3 Jahre zu verwenden, im Austausch für einen Rabatt. Kapitel 27. Domäne 4.

**Route 53** — AWS DNS-Service und Domain-Registrierer. Unterstützt mehrere Routing-Richtlinien. Kapitel 12. Domäne 2, 3.

**RPO (Recovery Point Objective)** — Maximal zulässiger Datenverlust gemessen in Zeit. "Wie viel Daten können wir uns leisten, zu verlieren?" Kapitel 18. Domäne 2.

**RTO (Recovery Time Objective)** — Maximal zulässige Zeit für die Wiederherstellung des Dienstes nach einem Ausfall. "Wie lange können wir ausfallen?" Kapitel 18. Domäne 2.

**Runbook** — Schritt-für-Schritt-Anweisungen für den Betrieb eines Systems, insbesondere für Incident Response. "Was macht jemand um 3 Uhr morgens?" Kapitel 32. Cross-domain.

---

## S

**S3 Intelligent-Tiering** — Überträgt S3-Objekte automatisch zwischen Zugriffsebenen basierend auf Zugriffsmustern. Keine Retrieval-Gebühr. Kapitel 23. Domäne 4.

**S3 Select** — Ruft einen Teil des S3-Objektinhalts mit SQL-Ausdrücken ab, wodurch Datenübertragungen reduziert werden. Kapitel 30. Domäne 4.

**Savings Plan** — Ein flexibler Preismodell, das sich einer Dollar-Menge stündlicher Ausgaben für 1 oder 3 Jahre verpflichtet, im Austausch für einen Rabatt. Flexibler als Reserved Instances. Kapitel 27. Domäne 4.

**SCP (Service Control Policy)** — AWS Organizations-Policy, die die maximalen Berechtigungen einschränkt, die Accounts in einer OU haben können. Kapitel 14. Domäne 1.

**Secrets Manager** — Speichert und rotiert Secrets (Datenbankpasswörter, API-Schlüssel) automatisch. Kapitel 16. Domäne 1.

**Security group** — Eine stateful virtuelle Firewall auf Instansebene. Erlaubt Regeln nur; Rückverkehr ist automatisch. Kapitel 15. Domäne 1.

**Shard (Kinesis)** — Die Basiseinheit des Durchsatzes in Kinesis Data Streams: 1 MB/s Schreib, 2 MB/s Les. Kapitel 26. Domäne 3.
```

**Das Shared Responsibility Model** — AWS ist für die Sicherheit *der* Cloud (Infrastruktur) verantwortlich; Sie sind für die Sicherheit *in* der Cloud (Daten, Konfiguration, Zugriff) verantwortlich. Kapitel 1. Domäne 1.

**Shield** — DDoS-Schutz. Standard: kostenlos, automatisch. Advanced: kostenpflichtig, mit DRT-Unterstützung und finanzieller Absicherung. Kapitel 17. Domäne 1.

**SNS (Simple Notification Service)** — Pub/Sub-Messaging. Sendet Nachrichten gleichzeitig an alle Abonnenten. Fan-Out-Muster. Kapitel 19. Domäne 2.

**Sort Key (DynamoDB)** — Optionaler zweiter Bestandteil des Primärschlüssels. Ermöglicht Bereichsabfragen innerhalb einer Partition. Kapitel 9. Domäne 3.

**Spot Instances** — EC2-Instanzen, die bei Nutzung von freiem Kapazitätsspielraum mit 60–90 % Rabatt eingesetzt werden. Können mit einer 2-minütigen Vorwarnung unterbrochen werden. Nur für fehlertolerante Arbeitslasten. Kapitel 27. Domäne 4.

**SQS (Simple Queue Service)** — Verwaltete Nachrichtenwarteschlange. Trennt Produzenten von Konsumenten. Standard (mindestens einmal) und FIFO (genau einmal) Warteschlangen. Kapitel 19. Domäne 2.

**Step Functions** — Serverless-Workflow-Orchestrierungsservice. Zustandsautomaten zur Koordination von AWS-Diensten. Kapitel 22. Domäne 2.

---

## T

**Zielverfolgungsskalierung** — Auto Scaling-Richtlinie, die die Kapazität anpasst, um einen Zielwert für ein Metrik zu halten (z. B. 60 % CPU-Auslastung). Kapitel 7. Domäne 2.

**Transit Gateway** — Hub-and-Spoke-Netzwerktopologie, die mehrere VPCs und On-Premises-Netzwerke über einen zentralen Gateway verbindet. Kapitel 25. Domäne 3.

**TTL (Time to Live)** — Ein Zeitstempel, nach dem DynamoDB ein Element automatisch löscht. Wird auch in DNS (wie lange Resolver einen Eintrag zwischenspeichern) und Caching (wie lange ein gecachteter Wert gültig ist) verwendet. Kapitel 9, 12. Domäne 3.

---

## V

**VIF (Virtual Interface)** — Die logische Verbindung, die mit AWS Direct Connect verwendet wird. Ein öffentliches VIF greift auf öffentliche AWS-Endpunkte zu; ein privates VIF greift auf VPC-Ressourcen zu. Kapitel 25. Domäne 3.

**Sichtzeitüberschreitung (SQS)** — Der Zeitraum, in dem eine empfangene Nachricht von anderen Konsumenten verborgen wird. Ermöglicht die Verarbeitung, ohne dass andere Konsumenten dieselbe Nachricht sehen. Kapitel 19. Domäne 2.

**VPC (Virtual Private Cloud)** — Ein isoliertes virtuelles Netzwerk in AWS. Enthält Subnetze, Routentabellen und Gateways. Kapitel 11. Domäne 1.

**VPC Endpoint** — Verbindet VPC-Ressourcen mit AWS-Diensten über das AWS private Netzwerk. Gateway (kostenlos, S3/DynamoDB) und Interface (preisbasiert, die meisten anderen Dienste). Kapitel 30. Domäne 1, 4.

**VPC Flow Logs** — Erfasst Informationen über IP-Traffic, der zu und von Netzwerkinterfaces in einer VPC geht. Wird von GuardDuty verwendet und für die Netzwerk-Fehlerbehebung. Kapitel 17. Domäne 1.

**VPC Peering** — Eine Netzwerkverbindung zwischen zwei VPCs, die den Datenverkehr zwischen ihnen mithilfe privater IP-Adressen ermöglicht. Kapitel 11. Domäne 3.

---

## W

**WAF (Web Application Firewall)** — Filtert HTTP/HTTPS-Traffic anhand von Regeln (IP-Blöcke, SQL-Injection, Ratenbegrenzung). Wird an CloudFront, ALB oder API Gateway angehängt. Kapitel 17. Domäne 1.

**Well-Architected Framework** — Das sechs-Pillar-Bewertungsrahmen von AWS: Betriebliche Exzellenz, Sicherheit, Zuverlässigkeit, Leistungs-Effizienz, Kostenoptimierung, Nachhaltigkeit. Kapitel 31. Cross-Domäne.

**Gewichtete Routierung (Route 53)** — Verteilt DNS-Abfragen über Endpunkte nach Gewicht. Wird für Blue-Green-Deployments und A/B-Tests verwendet. Kapitel 12. Domäne 3.

**Write-Through-Caching** — Aktualisiert den Cache, wenn die Datenbank aktualisiert wird. Die Daten sind immer konsistent, aber der Cache kann viele Elemente enthalten, die nie erneut gelesen werden. Kapitel 10. Domäne 3.

---

## SAA-C03 Quick Pattern Reference

| Wenn die Prüfung sagt...                           | Denke...                                     |
|-----------------------------------------------|----------------------------------------------|
| "Entkoppeln Sie Dienste"                           | SQS, SNS, EventBridge                        |
| "Leiten Sie das Signal an mehrere Konsumenten aus" | SNS + SQS-Subscriptions                      |
| "Geordnete Ereignisse in Echtzeit"                    | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Globale niedrige Latenz (dynamisch)"                | Global Accelerator                           |
| "Globale niedrige Latenz (statisch/cachiert)"          | CloudFront                                   |
| "DDoS-Schutz"                                 | Shield (Standard: kostenlos; Advanced: kostenpflichtig)      |
| "Blockieren Sie SQL-Injections an der Edge"          | WAF                                          |
| "Erkennen Sie kompromittierte Anmeldeinformationen" | GuardDuty                                    |
| "Überprüfen Sie API-Aktivitäten"                  | CloudTrail                                   |
| "Rotieren Sie Datenbankanmeldeinformationen"        | Secrets Manager                              |
| "Verschlüsseln Sie Daten im Ruhezustand, kundenseitig verwaltete Schlüssel" | KMS mit CMK                                 |
| "Speichern Sie Konfigurationswerte"                  | SSM Parameter Store                          |
| "Hoher IOPS-Datenbankspeicher"                  | io2 EBS                                      |
| "Gemeinsames Dateisystem für EC2"                  | EFS                                          |
| "Abfragen Sie S3-Daten mit SQL"                      | Athena                                       |
| "ETL-Pipeline für Analysen"                  | AWS Glue                                     |
| "Liefern Sie Streaming-Daten an S3"                | Kinesis Firehose                             |
| "Fehlertolerante Batch-Jobs, minimieren Sie die Kosten" | Spot Instances                               |
| "Verpflichtend, stabile Produktionslast"       | Savings Plans                                |
| "Privates Subnetz → S3 ohne NAT"             | S3 Gateway Endpoint                          |
| "Privates Subnetz → SQS ohne NAT"            | SQS Interface Endpoint                       |
| "Multi-AZ für RDS"                            | Automatische Ausfallsicherheit (nicht Lese-Skalierung)        |
| "Lese-Replika für RDS"                        | Lese-Skalierung (nicht automatische Ausfallsicherheit)        |
| "Wiederherstellungszeit < 1 Minute, über AZ"          | Multi-AZ                                     |
| "Wiederherstellung über Regionen, RTO Minuten"        | Pilot Light oder Warm Standby                  |
| "Active-Active, kein RTO"                     | Multi-Region Active-Active (komplexestes)    |
