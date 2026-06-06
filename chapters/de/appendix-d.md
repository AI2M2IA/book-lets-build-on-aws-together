# Anhang D: Vollständige Übungsprüfung (65 Fragen)

Dies ist eine vollständige SAA-C03-Übungsprüfung: 65 Fragen, die die Domänengewichte der echten Prüfung widerspiegeln — Gestaltung sicherer Architekturen (Fragen 1–20, ~30 %), Gestaltung widerstandsfähiger Architekturen (21–37, ~26 %), Gestaltung leistungsstarker Architekturen (38–53, ~24 %) und Gestaltung kostenoptimierter Architekturen (54–65, ~20 %).

**So legen Sie sie ab:**

- Stellen Sie einen Timer auf **130 Minuten** — die Dauer der echten Prüfung. Üben Sie das Tempo: das sind zwei Minuten pro Frage.
- Sieben Fragen lauten **„(Wählen Sie ZWEI.)"** — sie haben fünf Optionen und genau zwei richtige Antworten, genau wie die Multiple-Response-Items der echten Prüfung. Beide müssen korrekt sein, um die Frage zu werten.
- Schauen Sie nicht in den Antwortschlüssel, bevor Sie alle 65 beendet haben. In der echten Prüfung gibt es kein Feedback während des Ablaufs, und Ihre Toleranz für Ungewissheit zu trainieren, ist Teil der Vorbereitung.
- Die echte Prüfung enthält 15 unbewertete Versuchsfragen, die Sie nicht identifizieren können. Alle 65 hier sind „bewertet". Eine Bestehensschwelle: **47 oder mehr richtig (~72 %)** bringt Sie in den Bereich des skalierten Bestehensergebnisses von 720/1000. Unter 47 sollten Sie die in Anhang B aufgeführten Kapitel für Ihre schwachen Domänen erneut durchgehen, bevor Sie die Prüfung buchen.
- Lesen Sie für jede Frage, die Sie falsch beantworten — und jede Frage, die Sie richtig haben, bei der Sie aber gezögert haben —, die Distraktor-Analyse. Die Prüfung testet die *Unterschiede* zwischen plausiblen Optionen, und genau dort steckt das Lernen.

---

## Teil 1 — Gestaltung sicherer Architekturen (Fragen 1–20)

**Frage 1** *(Domäne 1 — Aufgabe 1.1)*
Ein Finanzdienstleistungsunternehmen nutzt AWS Organizations mit aktivierten All-Features. Das Sicherheitsteam hat eine Service Control Policy (SCP) an die Root der Organisation angehängt, die die Nutzung aller AWS-Regionen außer eu-west-1 verbietet. Während eines Audits stellt das Team fest, dass ein Administrator in einem Konto trotz der SCP weiterhin EC2-Instanzen in us-east-2 starten konnte. Welches Konto hat diese Aktion am wahrscheinlichsten erlaubt?

A) Ein Mitgliedskonto in einer verschachtelten Organizational Unit (OU), da SCPs sich nicht auf verschachtelte OUs übertragen
B) Das Management-Konto, da SCPs nicht für das Management-Konto gelten
C) Ein Mitgliedskonto, dessen IAM-Administratorrichtlinie ein explizites Allow enthält, das SCPs überschreibt
D) Ein Mitgliedskonto, das nach dem Anhängen der SCP erstellt wurde, da SCPs nur für Konten gelten, die zum Zeitpunkt des Anhängens existierten

**Frage 2** *(Domäne 1 — Aufgabe 1.1)*
Ein Startup möchte seinen Entwicklern erlauben, IAM-Rollen für ihre Anwendungen zu erstellen, aber das Sicherheitsteam ist besorgt, dass Entwickler Rollen mit mehr Berechtigungen erstellen könnten, als die Entwickler selbst haben, was zu Privilege Escalation führt. Das Sicherheitsteam möchte, dass Entwickler die Self-Service-Rollenerstellung behalten. Was ist die GEEIGNETSTE Lösung?

A) Entwickler verpflichten, Anfragen zur Rollenerstellung über ein Ticketing-System einzureichen, das vom Sicherheitsteam geprüft wird
B) Eine SCP an die Konten der Entwickler anhängen, die die Aktion iam:CreateRole vollständig verbietet
C) Verlangen, dass alle von Entwicklern erstellten Rollen eine bestimmte Permission Boundary enthalten, durchgesetzt mit einer IAM-Bedingung auf iam:CreateRole und iam:AttachRolePolicy
D) AWS CloudTrail aktivieren und Warnungen konfigurieren, wann immer ein Entwickler eine neue IAM-Rolle erstellt

**Frage 3** *(Domäne 1 — Aufgabe 1.1)*
Ein SaaS-Anbieter muss auf Ressourcen in den AWS-Konten seiner Kunden zugreifen, um eine automatisierte Kostenanalyse durchzuführen. Kunden erstellen eine IAM-Rolle, die das Konto des SaaS-Anbieters übernehmen kann. Ein Sicherheitsberater warnt, dass ein Dritter, der die Rollen-ARN eines Kunden erfährt, den SaaS-Anbieter dazu verleiten könnte, im Auftrag des Dritten auf das Konto dieses Kunden zuzugreifen. Welcher Mechanismus mindert dieses „Confused Deputy"-Risiko?

A) Multi-Faktor-Authentifizierung (MFA) in der Trust Policy der Cross-Account-Rolle verlangen
B) Verlangen, dass der SaaS-Anbieter eine eindeutige, vom Kunden definierte ExternalId im sts:AssumeRole-Aufruf übergibt, die durch eine Bedingung in der Trust Policy der Rolle validiert wird
C) Die Rollen-ARN mit AWS KMS verschlüsseln, bevor sie mit dem SaaS-Anbieter geteilt wird
D) Die Cross-Account-Rolle durch einen IAM-User ersetzen, dessen Access Keys alle 90 Tage rotiert werden

**Frage 4** *(Domäne 1 — Aufgabe 1.1)*
Ein Unternehmen mit 40 AWS-Konten in AWS Organizations möchte, dass sich seine Mitarbeiter einmal mit ihren vorhandenen Microsoft-Entra-ID-Anmeldedaten (Azure AD) anmelden und über ein einziges Portal auf alle AWS-Konten zugreifen, wobei die Berechtigungen zentral pro Konto zugewiesen werden. Welche Lösung erfüllt diese Anforderungen mit dem GERINGSTEN betrieblichen Aufwand?

A) IAM-Users in jedem der 40 Konten erstellen und Passwörter mit Entra ID synchronisieren
B) AWS IAM Identity Center mit Entra ID als externem Identity Provider konfigurieren und Permission Sets pro Konto Usern und Gruppen zuweisen
C) Amazon Cognito User Pools in jedem Konto bereitstellen und sie zu Entra ID föderieren
D) Einen SAML Identity Provider in jedem Konto erstellen und pro Konto IAM-Rollen und Trust Policies manuell schreiben

**Frage 5** *(Domäne 1 — Aufgabe 1.1)*
Ein Mobile-Gaming-Unternehmen baut eine App, in der sich Spieler mit einer E-Mail-Adresse oder Social Login registrieren, und nach der Authentifizierung muss die App Screenshots der Spieler mit temporären AWS-Anmeldedaten direkt in einen Amazon-S3-Bucket hochladen. Welche Kombination von Diensten sollte der Solutions Architect empfehlen?

A) Ein Amazon Cognito user pool für Registrierung/Anmeldung und ein Amazon Cognito identity pool, um das authentifizierte Token gegen temporäre AWS-Anmeldedaten einzutauschen
B) Ein Amazon Cognito identity pool für Registrierung/Anmeldung und ein Amazon Cognito user pool, um temporäre AWS-Anmeldedaten auszustellen
C) AWS IAM Identity Center für Registrierung/Anmeldung und AWS STS GetSessionToken für Anmeldedaten
D) Ein Amazon Cognito user pool allein, da user-pool-Token direkten Zugriff auf S3 gewähren

**Frage 6** *(Domäne 1 — Aufgabe 1.3)*
Ein Gesundheitsunternehmen muss Daten in Amazon S3 mit einem Schlüssel verschlüsseln, der eine automatische jährliche, von AWS verwaltete Rotation unterstützt, während es dem Unternehmen weiterhin möglich sein muss, die Key Policy zu definieren, das CloudTrail-Logging der Schlüsselnutzung zu aktivieren und den Schlüssel bei Bedarf zu deaktivieren. Welcher KMS-Schlüsseltyp erfüllt diese Anforderungen?

A) Ein AWS managed key (aws/s3)
B) Ein customer managed key mit aktivierter automatischer Rotation
C) Ein AWS owned key
D) Ein customer managed key mit importiertem Schlüsselmaterial (BYOK) und aktivierter automatischer Rotation

**Frage 7** *(Domäne 1 — Aufgabe 1.3)*
Ein Solutions Architect erklärt, wie AWS KMS eine 4-GB-Datei verschlüsselt, die von einer Anwendung gespeichert wird, angesichts der Tatsache, dass KMS direkt nur bis zu 4 KB Daten verschlüsseln kann. Welche Aussage beschreibt Envelope Encryption korrekt?

A) KMS teilt die Datei in 4-KB-Chunks und verschlüsselt jeden Chunk mit dem KMS-Schlüssel
B) Die Anwendung fordert einen Data Key von KMS an, verschlüsselt die Datei lokal mit dem Klartext-Data-Key, speichert dann den verschlüsselten Data Key neben den Daten und verwirft den Klartext-Data-Key
C) KMS streamt die Datei durch die KMS-API, die sie serverseitig mit dem KMS-Schlüssel verschlüsselt
D) Die Anwendung verschlüsselt die Datei mit einem hartcodierten symmetrischen Schlüssel, und KMS signiert das Ergebnis zur Integrität

**Frage 8** *(Domäne 1 — Aufgabe 1.3)*
Ein Unternehmen speichert ein Master-Passwort für Amazon RDS for PostgreSQL und benötigt, dass es ohne Anwendungsausfallzeit alle 30 Tage automatisch rotiert wird. Die Anwendung hält langlebige Datenbankverbindungen, daher möchte das Team eine Rotationsstrategie, bei der die vorherige Anmeldeinformation gültig bleibt, während die neue aktiviert wird. Welche Lösung erfüllt diese Anforderungen?

A) AWS Systems Manager Parameter Store SecureString-Parameter mit einer monatlich ausgelösten Lambda-Funktion
B) AWS Secrets Manager mit der Single-User-Rotationsstrategie
C) AWS Secrets Manager mit der Alternating-Users-Rotationsstrategie, die zwischen zwei Datenbankbenutzern wechselt, sodass immer eine Anmeldeinformation gültig bleibt
D) AWS KMS automatische Schlüsselrotation, angewendet auf das Datenbankpasswort

**Frage 9** *(Domäne 1 — Aufgabe 1.3)*
Ein Medienunternehmen speichert Rohvideos in Amazon S3. Die Compliance verlangt, dass das Unternehmen seine eigenen Verschlüsselungsschlüssel verwaltet und bereitstellt, dass AWS diese Schlüssel niemals speichert und dass die Schlüssel mit jeder Anfrage bereitgestellt werden. Welche Verschlüsselungsoption erfüllt diese Anforderungen?

A) SSE-S3
B) SSE-KMS mit einem customer managed key
C) SSE-C
D) Client-seitige Verschlüsselung mit dem AWS managed key aws/s3

**Frage 10** *(Domäne 1 — Aufgabe 1.3)*
Ein Broker-Dealer muss Handelsaufzeichnungen sieben Jahre lang in Amazon S3 so aufbewahren, dass niemand — einschließlich des AWS-Konto-Root-Users — die Objekte während des Aufbewahrungszeitraums löschen oder überschreiben kann, um SEC Rule 17a-4 zu erfüllen. Welche Konfiguration erfüllt diese Anforderung?

A) S3 Object Lock im Governance-Modus mit einem 7-jährigen Aufbewahrungszeitraum
B) S3 Object Lock im Compliance-Modus mit einem 7-jährigen Aufbewahrungszeitraum auf einem Bucket mit aktivierter Versionierung
C) Eine S3-Bucket-Policy, die s3:DeleteObject für alle Principals verweigert
D) S3 Glacier Deep Archive mit einer Lebenszyklusregel, die Objekte nach 7 Jahren ablaufen lässt

**Frage 11** *(Domäne 1 — Aufgabe 1.2)*
Eine Webanwendung läuft auf EC2-Instanzen hinter einem Application Load Balancer. Ein Netzwerkingenieur fügt dem Subnetz eine Network-ACL-Regel hinzu, die eingehenden TCP-Port 443 von 0.0.0.0/0 erlaubt, aber Clients können HTTPS-Anfragen weiterhin nicht abschließen. Die Security Groups sind korrekt konfiguriert. Was ist die WAHRSCHEINLICHSTE Ursache?

A) Die Network ACL ist zustandsbehaftet und erfordert eine Connection-Tracking-Regel
B) Die Network ACL hat keine ausgehende Regel, die ephemere Ports (1024–65535) erlaubt, sodass der Rückverkehr blockiert wird, weil NACLs zustandslos sind
C) Die Security Group muss auch ausgehenden Port 443 erlauben, da Security Groups zustandslos sind
D) Network ACLs können keinen Traffic von 0.0.0.0/0 erlauben; ein bestimmtes CIDR ist erforderlich

**Frage 12** *(Domäne 1 — Aufgabe 1.2)*
Welche ZWEI Aussagen über Security Groups und Network ACLs in einer VPC sind zutreffend? (Wählen Sie ZWEI.)

A) Security Groups sind zustandsbehaftet, sodass der Rückverkehr unabhängig von ausgehenden Regeln automatisch erlaubt ist
B) Network ACLs werten Regeln in numerischer Reihenfolge aus und unterstützen explizite Deny-Regeln
C) Security Groups unterstützen sowohl Allow- als auch Deny-Regeln
D) Network ACLs werden an einzelne Elastic Network Interfaces angehängt
E) Security-Group-Regeln werden in numerischer Reihenfolge ausgewertet und stoppen beim ersten Treffer

**Frage 13** *(Domäne 1 — Aufgabe 1.2)*
Ein E-Commerce-Unternehmen, das eine öffentlich zugängliche Anwendung auf CloudFront und ALB betreibt, ist über große, ausgefeilte DDoS-Angriffe besorgt. Das Unternehmen möchte 24/7-Zugang zum AWS Shield Response Team, Kostenschutz gegen durch Angriffe verursachte Skalierungskosten und Angriffsdiagnostik. Welchen Dienst sollte es nutzen?

A) AWS Shield Standard, das automatisch und kostenlos aktiviert ist
B) AWS Shield Advanced
C) AWS WAF mit Rate-based Rules
D) Amazon GuardDuty mit dem EC2-Schutzplan

**Frage 14** *(Domäne 1 — Aufgabe 1.2)*
Eine REST-API hinter einem Application Load Balancer wird mit SQL-Injection-Versuchen und übermäßigen Anfragen von einer kleinen Anzahl von IP-Adressen angegriffen. Welche Lösung blockiert die bösartigen Anfragemuster am Rand der Anwendung mit dem GERINGSTEN Entwicklungsaufwand?

A) Eingabevalidierungscode zu jedem API-Handler hinzufügen
B) AWS WAF mit dem ALB verknüpfen, unter Verwendung der SQL-Injection-Managed-Rule-Group und einer Rate-based Rule
C) AWS Shield Standard auf dem ALB aktivieren
D) Die ALB-Security-Group so konfigurieren, dass sie Anfragen ablehnt, die SQL-Schlüsselwörter enthalten

**Frage 15** *(Domäne 1 — Aufgabe 1.2)*
Ein Unternehmen möchte drei Sicherheitsbedürfnisse adressieren: (1) kontinuierlich kompromittierte EC2-Instanzen und anomale API-Aktivität mithilfe von Threat Intelligence erkennen, (2) personenbezogene Daten (PII), die in S3-Buckets gespeichert sind, entdecken und klassifizieren und (3) EC2-Instanzen und Container-Images auf Softwareschwachstellen (CVEs) scannen. Welche Zuordnung von AWS-Diensten zu Bedürfnissen ist korrekt?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Frage 16** *(Domäne 1 — Aufgabe 1.2)*
Eine Anwendung, die auf EC2-Instanzen in privaten Subnetzen läuft, muss Objekte zu Amazon S3 hochladen und Amazon DynamoDB aufrufen. Die Unternehmensrichtlinie verbietet, dass der Traffic das öffentliche Internet durchquert, und das Team möchte die kostengünstigste Option für beide Dienste. Welche Lösung erfüllt diese Anforderungen?

A) Ein NAT Gateway in einem öffentlichen Subnetz
B) Gateway VPC Endpoints für S3 und DynamoDB, referenziert in den Routing-Tabellen der Subnetze
C) Interface VPC Endpoints (AWS PrivateLink) für S3 und DynamoDB
D) Ein Internet Gateway mit restriktiven Security-Group-Regeln

**Frage 17** *(Domäne 1 — Aufgabe 1.3)*
Nach einem Vorfall mit Server-Side Request Forgery (SSRF), bei dem ein Angreifer über eine verwundbare Webanwendung IAM-Rollen-Anmeldedaten aus dem Metadata Service einer EC2-Instanz abrief, möchte ein Sicherheitsteam alle Instanzen gegen diese Angriffsklasse härten. Was sollte das Team tun?

A) IMDSv2 erzwingen, indem Session-Token verlangt werden (HttpTokens=required), sodass Metadaten-Anfragen ein per PUT erhaltenes Token benötigen, das einfache SSRF-Anfragen nicht erlangen können
B) Den Instance Metadata Service auf allen Instanzen deaktivieren, da Anwendungen ihn nie benötigen
C) 169.254.169.254 in der Network ACL des Subnetzes blockieren
D) Die Anmeldedaten der Instanzrolle in eine Konfigurationsdatei auf der Instanz verschieben

**Frage 18** *(Domäne 1 — Aufgabe 1.3)*
Ein Solutions Architect muss etwa 200 Klartext-Anwendungskonfigurationswerte (Feature Flags, Umgebungsnamen, Endpunkt-URLs) und 5 Datenbankpasswörter speichern. Die Passwörter erfordern eine automatische Rotation; die Konfigurationswerte nicht, und das Team möchte die Kosten minimieren. Welche Kombination ist am KOSTENEFFEKTIVSTEN?

A) Alles in AWS Secrets Manager speichern
B) Alles in AWS Systems Manager Parameter Store Standard-Parametern speichern
C) Konfigurationswerte in Parameter Store Standard-Parametern speichern (kostenlos) und die Passwörter in AWS Secrets Manager mit aktivierter Rotation
D) Konfigurationswerte in S3 und die Passwörter in Parameter Store SecureString-Parametern mit eingebauter automatischer Rotation speichern

**Frage 19** *(Domäne 1 — Aufgabe 1.3)*
Ein Unternehmen verschlüsselt S3-Objekte mit SSE-KMS unter Verwendung eines customer managed key. Eine Anwendung im selben Konto liest diese Objekte tausende Male pro Sekunde, und das Team beobachtet Throttling und Kostenbedenken durch KMS-API-Aufrufe. Welche Änderung reduziert den KMS-Request-Traffic und behält gleichzeitig die SSE-KMS-Verschlüsselung bei?

A) Den Bucket auf SSE-S3 umstellen, das keine Schlüssel verwendet
B) S3 Bucket Keys aktivieren, sodass S3 einen kurzlebigen Schlüssel auf Bucket-Ebene verwendet, um die Aufrufe an KMS zu reduzieren
C) Die automatische Schlüsselrotation für den customer managed key deaktivieren
D) Den customer managed key durch importiertes Schlüsselmaterial ersetzen

**Frage 20** *(Domäne 1 — Aufgabe 1.1)*
Welche ZWEI Aussagen über IAM-Policy-Bewertung und AWS Organizations sind zutreffend? (Wählen Sie ZWEI.)

A) SCPs gewähren IAM-Usern und -Rollen in Mitgliedskonten Berechtigungen
B) Ein explizites Deny in einer anwendbaren Policy überschreibt immer jedes Allow
C) Ressourcenbasierte Policies können ohne eine SCP keinen Cross-Account-Zugriff gewähren
D) Eine Permission Boundary legt die maximalen Berechtigungen fest, die eine identitätsbasierte Policy einem User oder einer Rolle gewähren kann, gewährt aber von sich aus nichts
E) Wenn keine Policy eine Aktion erwähnt, ist die Aktion für IAM-User standardmäßig erlaubt

---

## Teil 2 — Gestaltung widerstandsfähiger Architekturen (Fragen 21–37)

**Frage 21** *(Domäne 2 — Aufgabe 2.2)*
Ein Online-Händler betreibt Amazon RDS for MySQL. Die Datenbank erfährt starken Lese-Traffic von Reporting-Dashboards, und das Unternehmen benötigt zudem, dass die Datenbank einen Availability-Zone-Ausfall mit automatischem Failover und ohne manuellen Eingriff übersteht. Welche Kombination adressiert BEIDE Anforderungen?

A) Nur Multi-AZ-Deployment aktivieren; die Standby-Instanz kann die Reporting-Lesevorgänge bedienen
B) Nur Read Replicas erstellen; eine Replica wird automatisch hochgestuft, wenn die AZ des Primärs ausfällt
C) Multi-AZ-Deployment für automatisches Failover aktivieren und Read Replicas hinzufügen, um die Reporting-Lesevorgänge auszulagern
D) Auf eine größere Single-AZ-Instanzklasse migrieren, um beide Workloads zu bewältigen

**Frage 22** *(Domäne 2 — Aufgabe 2.2)*
Ein Unternehmen möchte RDS-Hochverfügbarkeit über Availability Zones hinweg, lehnt es aber ab, für eine traditionelle Multi-AZ-Standby-Instanz zu zahlen, die keinen Traffic bedient. Welche RDS-Deployment-Option bietet automatisches Failover UND erlaubt der Standby-Kapazität, Lese-Traffic zu bedienen?

A) RDS Multi-AZ DB instance deployment (ein Standby)
B) RDS Multi-AZ DB cluster deployment, das zwei lesbare Standby-Instanzen mit einem Reader-Endpunkt hat
C) RDS Read Replicas in drei AZs mit einem Application Load Balancer
D) RDS Single-AZ mit automatisierten Backups

**Frage 23** *(Domäne 2 — Aufgabe 2.2)*
Eine globale Zahlungsplattform auf Amazon Aurora muss auf eine zweite AWS-Region umschalten, wenn die primäre Region nicht verfügbar wird. Das Compliance-Team fragt, ob Aurora Global Database null Datenverlust (RPO = 0) über Regionen hinweg garantieren kann. Was sollte der Solutions Architect ihnen sagen?

A) Ja — Aurora Global Database repliziert synchron über Regionen, sodass das RPO genau 0 ist
B) Nein — Aurora Global Database verwendet asynchrone, speicherbasierte Replikation mit typischer Latenz unter 1 Sekunde, sodass das regionsübergreifende RPO nahe null liegt, aber nie garantiert genau 0 ist
C) Ja — aber nur, wenn Write Forwarding in der sekundären Region aktiviert ist
D) Nein — Aurora Global Database repliziert nach einem 5-Minuten-Zeitplan, was ein RPO von 5 Minuten ergibt

**Frage 24** *(Domäne 2 — Aufgabe 2.2)*
Der Disaster-Recovery-Plan eines Unternehmens besagt: „Nach einem regionalen Ausfall muss das Bestellsystem innerhalb von 4 Stunden wieder laufen, und es dürfen nicht mehr als 15 Minuten an Transaktionen verloren gehen." Welche Aussage ordnet diese Zahlen korrekt den DR-Metriken zu?

A) RTO = 15 Minuten; RPO = 4 Stunden
B) RTO = 4 Stunden; RPO = 15 Minuten
C) MTBF = 4 Stunden; MTTR = 15 Minuten
D) RPO = 4 Stunden; SLA = 15 Minuten

**Frage 25** *(Domäne 2 — Aufgabe 2.2)*
Ein Versicherungsunternehmen benötigt eine DR-Strategie für eine kritische Anwendung. Anforderungen: Daten müssen kontinuierlich in die DR-Region repliziert werden; die Kerninfrastruktur (Datenbank, AMIs, minimaler Stack) muss in der DR-Region bereits existieren, aber Compute soll bis zu einer Katastrophe ausgeschaltet bleiben, um die Kosten zu kontrollieren; ein RTO von einigen zehn Minuten ist akzeptabel. Welche DR-Strategie passt?

A) Backup and Restore
B) Pilot Light — Kernelemente in der DR-Region bereitgestellt mit live replizierten Daten, aber Compute aus bis zum Failover
C) Warm Standby — eine verkleinerte, aber stets laufende vollständige Kopie des Workloads
D) Multi-Site Active/Active

**Frage 26** *(Domäne 2 — Aufgabe 2.2)*
Welche ZWEI Aussagen über AWS-Disaster-Recovery-Strategien sind zutreffend? (Wählen Sie ZWEI.)

A) Backup and Restore erfordert, dass Ressourcen in der Recovery-Region vorab bereitgestellt sind und laufen
B) Backup and Restore bietet das niedrigste RTO der vier Strategien
C) Multi-Site Active/Active bedient Traffic gleichzeitig aus mehreren Regionen und bietet ein RTO nahe null zu den höchsten Kosten
D) Pilot Light hält eine Kopie der Anwendung mit voller Kapazität, die in der Recovery-Region Produktions-Traffic bedient
E) Warm Standby hält eine verkleinerte, aber voll funktionsfähige Kopie des Workloads, die in der Recovery-Region stets läuft

**Frage 27** *(Domäne 2 — Aufgabe 2.1)*
Eine Bildverarbeitungsanwendung liest Nachrichten aus einer Amazon SQS Standard-Queue. Die Verarbeitung eines Bildes dauert bis zu 3 Minuten, aber das Visibility Timeout der Queue ist auf 30 Sekunden gesetzt. Nutzer berichten, dass einige Bilder zwei- oder dreimal verarbeitet werden. Was ist die WAHRSCHEINLICHSTE Ursache und Behebung?

A) Die Queue ist FIFO; auf eine Standard-Queue umstellen
B) Das Visibility Timeout läuft ab, bevor die Verarbeitung abgeschlossen ist, wodurch die Nachricht wieder für andere Consumer sichtbar wird; das Visibility Timeout über die Verarbeitungszeit hinaus erhöhen
C) Long Polling ist deaktiviert; eine 20-sekündige ReceiveMessageWaitTime aktivieren
D) Der Message-Retention-Zeitraum ist zu kurz; ihn auf 14 Tage erhöhen

**Frage 28** *(Domäne 2 — Aufgabe 2.1)*
Eine Abrechnungsanwendung konsumiert Nachrichten aus einer SQS-Queue. Gelegentlich führt eine fehlerhafte Nachricht dazu, dass der Consumer wiederholt fehlschlägt, und die Nachricht kreist für immer durch die Queue und verschwendet Compute. Was sollte der Architect konfigurieren?

A) Eine Dead-Letter-Queue mit einer maxReceiveCount-Redrive-Policy, sodass Nachrichten, die wiederholt fehlschlagen, zur Analyse beiseitegelegt werden
B) Ein kürzeres Visibility Timeout, damit die fehlerhafte Nachricht schneller wiederholt wird
C) FIFO-Ordering, das fehlerhafte Nachrichten automatisch verwirft
D) Ein Message-Retention-Zeitraum von 1 Minute, damit fehlerhafte Nachrichten schnell ablaufen

**Frage 29** *(Domäne 2 — Aufgabe 2.1)*
Ein Brokerhaus verarbeitet Handelsereignisse pro Kundenkonto. Ereignisse für dasselbe Konto müssen streng in Reihenfolge und genau einmal verarbeitet werden, aber Ereignisse für verschiedene Konten dürfen für den Durchsatz parallel verarbeitet werden. Welche Lösung erfüllt diese Anforderungen?

A) Eine SQS Standard-Queue mit einem Consumer-Thread
B) Eine SQS FIFO-Queue, die die Kundenkonto-ID als MessageGroupId verwendet, was die Reihenfolge innerhalb jeder Gruppe bewahrt und gleichzeitig Parallelität über Gruppen hinweg ermöglicht
C) Ein SNS Standard-Topic mit Message Filtering nach Konto-ID
D) Eine SQS FIFO-Queue mit einer einzigen MessageGroupId für alle Kunden

**Frage 30** *(Domäne 2 — Aufgabe 2.1)*
Wenn eine Bestellung aufgegeben wird, muss eine E-Commerce-Plattform gleichzeitig drei unabhängige Prozesse auslösen: Rechnungserstellung, Lagerabwicklung und Analytics-Aufnahme. Jeder Prozess muss jedes Bestellereignis erhalten, es beständig puffern und in seinem eigenen Tempo verarbeiten. Welche Architektur erfüllt diese Anforderungen?

A) Eine SQS-Queue mit drei Consumern, die dieselbe Queue abfragen
B) Ein SNS-Topic, das per Fan-out an drei SQS-Queues verteilt, eine pro Prozess abonniert
C) Drei Lambda-Funktionen, die nacheinander von Step Functions aufgerufen werden
D) Ein SNS-Topic mit drei E-Mail-Abonnements

**Frage 31** *(Domäne 2 — Aufgabe 2.1)*
Während eines Flash Sale beginnt eine durch API Gateway ausgelöste Lambda-Funktion, 429-Throttling-Fehler zurückzugeben, während auch andere kritische Lambda-Funktionen im selben Konto gedrosselt werden. Das Konto liegt an seinem standardmäßigen Concurrency-Kontingent. Welche Aktion schützt die kritischen Funktionen davor, von der Sale-Funktion ausgehungert zu werden?

A) Das Timeout der Sale-Funktion von 3 Sekunden auf das Maximum von 15 Minuten erhöhen
B) Reserved Concurrency auf den kritischen Funktionen konfigurieren (und optional die Sale-Funktion begrenzen), wodurch ihnen dedizierte Concurrency aus dem Konto-Pool garantiert wird
C) Provisioned Concurrency auf der Sale-Funktion aktivieren, was das kontoweite Kontingent erhöht
D) Die kritischen Funktionen auf eine Speicherkonfiguration von 10 GB umstellen

**Frage 32** *(Domäne 2 — Aufgabe 2.1)*
Ein Medienunternehmen hat einen Video-Publishing-Workflow mit einem Schritt, der bis zu 2 Tage darauf wartet, dass ein menschlicher Moderator Inhalte über ein externes Tool freigibt, bevor er fortfährt. Der Workflow muss auditierbar sein, tagelang laufen und genau dort fortsetzen, wo er pausierte, sobald der Moderator antwortet. Welche Lösung passt am BESTEN?

A) Ein Express-Step-Functions-Workflow mit einem Wait-State
B) Ein Standard-Step-Functions-Workflow, der das Callback-Pattern verwendet: ein Task-Token (waitForTaskToken) wird an das Moderationssystem gesendet, und der Workflow setzt fort, wenn SendTaskSuccess aufgerufen wird
C) Eine Lambda-Funktion, die schläft, bis der Moderator freigibt
D) Eine EventBridge-Regel mit einer 2-tägigen geplanten Verzögerung

**Frage 33** *(Domäne 2 — Aufgabe 2.1)*
Ein Unternehmen betreibt eine IoT-Aufnahme-Pipeline mit hohem Volumen, die etwa 90.000 kurze Workflow-Ausführungen pro Sekunde durchführt, von denen jede in unter 5 Sekunden abgeschlossen wird. Exactly-once-Ausführungssemantik ist nicht erforderlich, aber die Kosten müssen minimiert werden. Separat läuft ein monatlicher finanzieller Abgleich-Workflow 12 Stunden lang und erfordert Exactly-once-Ausführung mit vollständiger Ausführungshistorie. Welche Step-Functions-Workflow-Typen sollten verwendet werden?

A) Express-Workflows für die IoT-Pipeline; Standard-Workflows für den Abgleich
B) Standard-Workflows für beide
C) Express-Workflows für beide, da Express bis zu einem Jahr Ausführung unterstützt
D) Standard-Workflows für die IoT-Pipeline; Express-Workflows für den Abgleich

**Frage 34** *(Domäne 2 — Aufgabe 2.2)*
Ein Unternehmen hostet seine primäre Webanwendung auf einem ALB in us-east-1 und eine passive Recovery-Kopie in us-west-2. Das Unternehmen möchte, dass Route 53 den gesamten Traffic an us-east-1 sendet und Nutzer nur dann automatisch zu us-west-2 umleitet, wenn der primäre Endpunkt fehlerhaft wird. Welche Route-53-Konfiguration erfüllt diese Anforderung?

A) Weighted Routing mit 50/50-Gewichten
B) Failover Routing mit einem Health Check auf dem primären Record und dem us-west-2-Record als Sekundär
C) Latency-based Routing zwischen den beiden Regionen
D) Geolocation Routing mit einem Standard-Record, der auf us-west-2 zeigt

**Frage 35** *(Domäne 2 — Aufgabe 2.2)*
Eine Auto Scaling Group betreibt EC2-Webserver hinter einem Application Load Balancer über drei Availability Zones. Der ALB markiert einige Instanzen als fehlerhaft, weil der Webserver-Prozess abstürzt, doch die Auto Scaling Group ersetzt sie nie, weil die EC2-Instanzen selbst weiterhin die Status Checks bestehen. Was sollte der Solutions Architect ändern?

A) Detailliertes CloudWatch-Monitoring auf den Instanzen aktivieren
B) Die Auto Scaling Group so konfigurieren, dass sie zusätzlich zu den EC2-Status-Checks ELB-Health-Checks verwendet, sodass Instanzen, die die ALB-Target-Health nicht bestehen, beendet und ersetzt werden
C) Die ASG-Health-Check-Grace-Period erhöhen
D) Den ALB auf einen Network Load Balancer umstellen

**Frage 36** *(Domäne 2 — Aufgabe 2.1)*
Eine Handelsfirma benötigt einen Load Balancer für ein benutzerdefiniertes TCP-Protokoll, der Millionen Anfragen pro Sekunde mit extrem niedriger Latenz bewältigen und eine statische IP-Adresse pro Availability Zone bereitstellen muss. Welchen Load Balancer sollte die Firma wählen?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Frage 37** *(Domäne 2 — Aufgabe 2.2)*
Welche ZWEI Aussagen über den Aufbau widerstandsfähigen Speichers auf AWS sind zutreffend? (Wählen Sie ZWEI.)

A) S3 Cross-Region Replication kopiert rückwirkend alle Objekte, die existierten, bevor die Replikation konfiguriert wurde, ohne zusätzliche Maßnahme
B) Die Speicherklasse Amazon EFS Standard speichert Daten redundant über mehrere Availability Zones und kann gleichzeitig von Instanzen in verschiedenen AZs gemountet werden
C) S3 Cross-Region Replication erfordert, dass die Versionierung sowohl auf dem Quell- als auch auf dem Ziel-Bucket aktiviert ist
D) Amazon-EFS-Volumes können wie EBS jeweils nur an eine EC2-Instanz angehängt werden
E) Das Aktivieren der S3-Versionierung repliziert Objekte automatisch in eine andere Region

---

## Teil 3 — Gestaltung leistungsstarker Architekturen (Fragen 38–53)

**Frage 38** *(Domäne 3 — Aufgabe 3.1)*
Ein Medienanalyseunternehmen betreibt eine PostgreSQL-Datenbank auf Amazon RDS unter Verwendung eines gp3-EBS-Volumes. Ein neuer Reporting-Workload erfordert dauerhaft 50.000 IOPS mit Submillisekunden-Latenz und einer Beständigkeitsgarantie von 99,999 %. Das Volume muss dies konsistent ohne Bursting unterstützen. Welchen EBS-Volume-Typ sollte ein Solutions Architect empfehlen?

A) gp3, provisioniert mit maximalen IOPS
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 mit einer Volume-Größe von 16 TiB

**Frage 39** *(Domäne 3 — Aufgabe 3.1)*
Ein Genomforschungsunternehmen benötigt gemeinsam genutzten Dateispeicher für einen Linux-basierten High-Performance-Computing-(HPC-)Cluster aus 500 EC2-Instanzen. Der Workload erfordert Submillisekunden-Latenzen und einen aggregierten Durchsatz von Hunderten GB/s, und die Eingabedatensätze werden in Amazon S3 bereitgestellt. Welcher Storage-Dienst erfüllt diese Anforderungen am besten?

A) Amazon EFS mit Max-I/O-Performance-Modus
B) Amazon FSx for Windows File Server mit SSD-Speicher
C) Amazon FSx for Lustre, verknüpft mit dem S3-Bucket
D) Amazon S3, zugegriffen über Mountpoint auf jeder Instanz

**Frage 40** *(Domäne 3 — Aufgabe 3.1)*
Ein Unternehmen migriert eine On-Premises-Windows-Anwendung, die auf SMB-File-Shares und Active-Directory-integrierte Zugriffskontrolllisten angewiesen ist. Die Anwendung wird auf EC2-Windows-Instanzen in zwei Availability Zones laufen und muss ihre vorhandenen NTFS-Berechtigungen beibehalten. Welchen AWS-Storage-Dienst sollte der Solutions Architect wählen?

A) Amazon EFS mit POSIX-Berechtigungen
B) Amazon FSx for Windows File Server im Multi-AZ-Deployment-Modus
C) Amazon S3 mit Bucket-Policies, die AD-Gruppen zugeordnet sind
D) Amazon FSx for Lustre mit Persistent Storage

**Frage 41** *(Domäne 3 — Aufgabe 3.1)*
Ein Videoproduktionsunternehmen in Singapur lädt 40-GB-Rohmaterialdateien von Büros weltweit in einen S3-Bucket in us-east-1 hoch. Uploads schlagen über das öffentliche Internet häufig mittendrin fehl, was vollständige Neustarts erzwingt, und die Übertragungszeiten sind insgesamt langsam. Welche Kombination von Maßnahmen sollte ein Solutions Architect empfehlen? (Wählen Sie ZWEI.)

A) Den Bucket auf S3 One Zone-IA umstellen, um den Schreibdurchsatz zu verbessern
B) Dem Bucket in jeder Region einen Application Load Balancer vorschalten
C) S3 Cross-Region Replication zu einem Bucket in ap-southeast-1 aktivieren
D) S3 Transfer Acceleration auf dem Bucket aktivieren und über den beschleunigten Endpunkt hochladen
E) Multipart-Upload für die großen Dateien verwenden

**Frage 42** *(Domäne 3 — Aufgabe 3.1)*
Eine Real-Time-Bidding-Plattform betreibt einen NoSQL-Workload auf EC2, der die absolut niedrigste Speicherlatenz für temporäre Scratch-Daten benötigt. Die Daten werden beim Start neu generiert und müssen einen Instanz-Stopp oder eine Terminierung nicht überleben. Welche Speicheroption bietet die höchste Performance für diesen Anwendungsfall?

A) io2-EBS-Volume mit 64.000 provisionierten IOPS
B) Instance-Store-(NVMe-SSD-)Volumes auf einer Storage-optimierten Instanz
C) Amazon EFS im General-Purpose-Modus
D) gp3-EBS-Volume mit maximal provisioniertem Durchsatz

**Frage 43** *(Domäne 3 — Aufgabe 3.3)*
Ein Gaming-Unternehmen speichert Spieler-Session-Daten in einer DynamoDB-Tabelle mit dem Partition Key `game_id`. Es gibt nur 12 beliebte Spiele, und die Tabelle erfährt Throttling auf einigen wenigen Partitionen, während die insgesamt verbrauchte Kapazität weit unter der provisionierten Kapazität liegt. Was sollte ein Solutions Architect empfehlen?

A) Die Tabelle auf Provisioned Capacity mit Auto Scaling umstellen
B) Einen Partition Key mit hoher Kardinalität verwenden, etwa eine Zusammensetzung aus game_id und player_id
C) Einen Local Secondary Index auf player_id erstellen
D) DynamoDB Streams aktivieren, um Schreibvorgänge über Partitionen zu verteilen

**Frage 44** *(Domäne 3 — Aufgabe 3.3)*
Eine E-Commerce-Site speichert Produktkatalogdaten in DynamoDB. Der Lese-Traffic ist extrem leselastig, wobei dieselben Items millionenfach pro Tag angefordert werden, und das Team benötigt Mikrosekunden-Lese-Latenz, ohne die DynamoDB-API-Aufrufe der Anwendung umzuschreiben. Was sollte der Solutions Architect empfehlen?

A) Amazon ElastiCache for Redis bereitstellen und die Anwendung ändern, sodass sie zuerst den Cache prüft
B) DynamoDB Accelerator (DAX) vor der Tabelle hinzufügen
C) Einen Global Secondary Index erstellen, um Lesevorgänge zu verteilen
D) DynamoDB Global Tables in einer zweiten Region aktivieren

**Frage 45** *(Domäne 3 — Aufgabe 3.3)*
Ein Logistikunternehmen hat eine DynamoDB-Tabelle in Produktion, die ein neues Abfragemuster benötigt: Abfrage von Sendungen nach `carrier_id` und Sortierung nach `delivery_date`, mit eigenem provisioniertem Durchsatz, damit die neuen Analytics-Abfragen die Hauptanwendung nicht beeinträchtigen. Die Tabelle existiert bereits und hat Live-Traffic. Welche Lösung erfüllt diese Anforderungen?

A) Einen Local Secondary Index mit carrier_id als Sort Key erstellen
B) Einen Global Secondary Index mit carrier_id als Partition Key und delivery_date als Sort Key erstellen
C) Die Tabelle mit einem zusammengesetzten Primärschlüssel aus carrier_id und delivery_date neu erstellen
D) Einen DynamoDB Stream aktivieren und den Stream nach carrier_id abfragen

**Frage 46** *(Domäne 3 — Aufgabe 3.3)*
Ein Session-Management-Dienst speichert Benutzer-Sessions in DynamoDB. Sessions werden nach 24 Stunden nutzlos, und das Team möchte, dass abgelaufene Items ohne zusätzliche Kosten automatisch entfernt werden. Was sollte der Solutions Architect implementieren?

A) Eine geplante Lambda-Funktion, die die Tabelle stündlich scannt und alte Items löscht
B) DynamoDB Time to Live (TTL) mit einem Ablauf-Zeitstempel-Attribut auf jedem Item
C) Eine Lebenszyklusrichtlinie auf der DynamoDB-Tabelle
D) DynamoDB Streams mit einem Filter, der Items älter als 24 Stunden verwirft

**Frage 47** *(Domäne 3 — Aufgabe 3.3)*
Eine serverlose Anwendung verwendet Lambda-Funktionen, die sich mit einer Amazon RDS for MySQL-Datenbank verbinden. Während Traffic-Spitzen erschöpfen Hunderte gleichzeitiger Lambda-Aufrufe das Verbindungslimit der Datenbank und verursachen Fehler. Welche Lösung adressiert dies mit der geringsten Anwendungsänderung?

A) Die RDS-Instanzgröße erhöhen, um max_connections zu erhöhen
B) Amazon RDS Proxy zwischen die Lambda-Funktionen und die Datenbank setzen
C) Die Datenbank zu DynamoDB migrieren
D) Lambda Reserved Concurrency von 10 konfigurieren

**Frage 48** *(Domäne 3 — Aufgabe 3.3)*
Eine Finanznachrichten-Site verwendet Amazon Aurora MySQL. Der Lese-Traffic steigt während der Marktzeiten um das 20-Fache, und die primäre Instanz ist beim Bedienen von SELECT-Abfragen CPU-gebunden. Schreibvorgänge sind moderat. Was ist der betrieblich EFFIZIENTESTE Weg, um Lesevorgänge zu skalieren?

A) Aurora Replicas hinzufügen und Lese-Traffic mit Auto Scaling an den Cluster-Reader-Endpunkt leiten
B) Ein Multi-AZ-Standby erstellen und Lesevorgänge an das Standby senden
C) Die Datenbank über mehrere Aurora-Cluster shardieren
D) Aurora Backtrack aktivieren, um Lesevorgänge auszulagern

**Frage 49** *(Domäne 3 — Aufgabe 3.4)*
Ein Multiplayer-Gaming-Unternehmen betreibt eine latenzsensible Anwendung über das UDP-Protokoll auf Network Load Balancern in zwei AWS-Regionen. Spieler weltweit benötigen statische IP-Adressen für Allow-Listing und schnelles regionales Failover. Welchen Dienst sollte der Solutions Architect wählen?

A) Amazon CloudFront mit zwei Custom Origins
B) AWS Global Accelerator mit Endpoint Groups in beiden Regionen
C) Amazon Route 53 mit Latency-based Routing
D) Ein Application Load Balancer mit Cross-Zone Load Balancing

**Frage 50** *(Domäne 3 — Aufgabe 3.4)*
Ein Streaming-Unternehmen muss Content-Lizenzregeln einhalten: Nutzer in Deutschland müssen stets vom eu-central-1-Deployment bedient werden und Nutzer in Frankreich vom eu-west-3-Deployment, unabhängig davon, welcher Endpunkt die niedrigere Latenz bietet. Welche Route-53-Routing-Richtlinie sollte verwendet werden?

A) Latency-based Routing
B) Geolocation Routing
C) Geoproximity Routing mit einem positiven Bias auf eu-central-1
D) Weighted Routing mit 50/50-Gewichten

**Frage 51** *(Domäne 3 — Aufgabe 3.2)*
Ein Solutions Architect stellt einen eng gekoppelten HPC-Workload bereit, der MPI verwendet und die niedrigstmögliche Netzwerklatenz und höchste Packet-per-Second-Performance zwischen 32 EC2-Instanzen erfordert. Welche Placement-Strategie sollte verwendet werden?

A) Spread Placement Group über drei Availability Zones
B) Partition Placement Group mit 7 Partitionen
C) Cluster Placement Group in einer einzelnen Availability Zone
D) Instanzen in separaten Subnetzen mit Enhanced Networking starten

**Frage 52** *(Domäne 3 — Aufgabe 3.5)*
Ein IoT-Unternehmen nimmt Clickstream-Daten auf, die nahezu in Echtzeit zur Analyse an Amazon S3 geliefert werden müssen. Das Team möchte eine vollständig verwaltete Lösung ohne zu schreibende Consumer-Anwendungen, ohne Shard-Verwaltung und mit eingebautem Record-Buffering und Formatkonvertierung zu Parquet. Welchen Dienst sollte es nutzen?

A) Amazon Kinesis Data Streams mit einem Lambda-Consumer
B) Amazon Data Firehose (früher Kinesis Data Firehose) mit einem S3-Ziel
C) Amazon SQS mit einer Flotte von EC2-Pollern
D) Amazon MSK mit einem benutzerdefinierten Kafka-Connect-Sink

**Frage 53** *(Domäne 3 — Aufgabe 3.5)*
Ein Unternehmen speichert Anwendungslogs als komprimierte JSON-Dateien in Amazon S3 und möchte, dass Analysten Ad-hoc-SQL-Abfragen dagegen ausführen, ohne Server bereitzustellen oder Daten in eine Datenbank zu laden. Das Schema soll automatisch entdeckt und katalogisiert werden. Welche Kombination sollte der Solutions Architect empfehlen?

A) Amazon Redshift mit COPY-Befehlen und geplanten Aktualisierungen
B) AWS Glue Crawler, um den Data Catalog zu befüllen, und Amazon Athena für SQL-Abfragen
C) Amazon EMR mit einem langlaufenden Presto-Cluster
D) Amazon RDS for PostgreSQL mit der aws_s3-Erweiterung

---

## Teil 4 — Gestaltung kostenoptimierter Architekturen (Fragen 54–65)

**Frage 54** *(Domäne 4 — Aufgabe 4.2)*
Ein Forschungsinstitut führt nächtliche Batch-Simulationen auf EC2 durch, die etwa 90 Minuten dauern, den Fortschritt alle 5 Minuten in Amazon S3 als Checkpoint sichern und jederzeit vom letzten Checkpoint aus neu gestartet werden können. Das Institut möchte die niedrigstmöglichen Compute-Kosten. Welche Kaufoption sollte der Solutions Architect empfehlen?

A) On-Demand Instances in einer einzelnen AZ
B) Standard Reserved Instances mit einer 3-Jahres-Laufzeit
C) Spot Instances, die eine über mehrere Instanztypen und AZs diversifizierte Spot Fleet verwenden
D) Ein Compute Savings Plan, dimensioniert auf die Spitzenlast des Batch-Workloads

**Frage 55** *(Domäne 4 — Aufgabe 4.2)*
Ein SaaS-Unternehmen hat stabile Compute-Grundausgaben, erwartet aber, in den nächsten drei Jahren bei der Modernisierung Workloads zwischen EC2, AWS Fargate und AWS Lambda zu migrieren. Es möchte einen verpflichtungsbasierten Rabatt, der automatisch über alle drei Compute-Dienste und alle Regionen angewendet wird. Welche Option sollte der Solutions Architect empfehlen?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Frage 56** *(Domäne 4 — Aufgabe 4.2)*
Ein Unternehmen hat 3-Jahres-Standard-Reserved-Instances für Amazon RDS und für Amazon EC2 gekauft. Nach einer Neuarchitektur benötigt es keine der beiden Reservierungen mehr. Das Finanzteam fragt, welche Reservierungen verkauft werden können, um Kosten zurückzugewinnen. Was sollte der Solutions Architect ihnen sagen?

A) Sowohl die EC2- als auch die RDS-Reserved-Instances können auf dem Reserved Instance Marketplace verkauft werden
B) Nur die EC2-Reserved-Instances können auf dem Reserved Instance Marketplace verkauft werden; RDS-RIs können nicht weiterverkauft werden
C) Nur die RDS-Reserved-Instances können verkauft werden, da Datenbankreservierungen übertragbar sind
D) Keine kann verkauft werden; Reserved Instances sind in allen Fällen nicht erstattungsfähig und nicht übertragbar

**Frage 57** *(Domäne 4 — Aufgabe 4.2)*
Ein Entwicklungsteam betreibt containerisierte, fehlertolerante Datenverarbeitung auf Amazon ECS mit EC2-Spot-Kapazität. Sie benötigen, dass Worker vor der Rückforderung ordentlich draining durchführen und Checkpoints setzen. Wie viel Vorwarnung gibt AWS, bevor eine Spot Instance unterbrochen wird?

A) Es wird keine Vorwarnung gegeben
B) Eine 2-minütige Unterbrechungsbenachrichtigung
C) Eine 15-minütige Unterbrechungsbenachrichtigung
D) Ein 24-stündiges Rebalance-Fenster

**Frage 58** *(Domäne 4 — Aufgabe 4.1)*
Ein Gesundheitsarchiv speichert Compliance-Aufzeichnungen in Amazon S3, die selten abgerufen werden, aber bei einer Vorladung innerhalb von 5 Minuten abrufbar sein müssen. Die Aufzeichnungen werden 7 Jahre lang aufbewahrt, und die Speicherkosten müssen minimiert werden. Welche Speicherklasse erfüllt diese Anforderungen?

A) S3 Glacier Deep Archive mit Standard-Retrieval
B) S3 Glacier Flexible Retrieval mit Expedited Retrievals bei Bedarf
C) S3 Glacier Flexible Retrieval mit Bulk Retrievals
D) S3 Standard-IA

**Frage 59** *(Domäne 4 — Aufgabe 4.1)*
Ein Foto-Sharing-Startup speichert leicht reproduzierbare Thumbnail-Bilder, die selten abgerufen werden. Das Team möchte die kostengünstigste Infrequent-Access-Option und akzeptiert, dass der Verlust einer einzelnen Availability Zone erfordern könnte, die Thumbnails aus den Originalen neu zu generieren. Welche Speicherklasse sollte verwendet werden?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Frage 60** *(Domäne 4 — Aufgabe 4.1)*
Ein Unternehmen hat einen S3-Bucket mit Millionen von Objekten, deren Zugriffsmuster unbekannt sind und sich unvorhersehbar ändern. Ein Solutions Architect evaluiert S3 Intelligent-Tiering. Welche ZWEI Aussagen über Intelligent-Tiering sind zutreffend? (Wählen Sie ZWEI.)

A) Es berechnet eine kleine Monitoring- und Automatisierungsgebühr pro Objekt für die Objekte, die es überwacht
B) Es berechnet jedes Mal Abrufgebühren, wenn ein Objekt zurück in die Frequent-Access-Schicht verschoben wird
C) Objekte kleiner als 128 KB werden nicht überwacht oder automatisch eingestuft und werden zum Tarif der Frequent-Access-Schicht abgerechnet
D) Es repliziert Objekte automatisch in eine zweite Region
E) Es erfordert eine Mindestspeicherdauer von 90 Tagen für jedes Objekt

**Frage 61** *(Domäne 4 — Aufgabe 4.1)*
Ein Analytics-Team bricht häufig große Multipart-Uploads zu einem S3-Data-Lake-Bucket ab, und AWS Cost Explorer zeigt steigende Speicherkosten, obwohl die sichtbare Objektanzahl des Buckets gleich bleibt. Was ist die KOSTENEFFEKTIVSTE Behebung?

A) S3 Versioning aktivieren, um die verwaisten Parts zu verfolgen
B) Eine Lebenszyklusregel hinzufügen, die unvollständige Multipart-Uploads nach einer festgelegten Anzahl von Tagen abbricht
C) Den Bucket auf S3 One Zone-IA migrieren
D) S3 Transfer Acceleration einschalten, um Uploads schneller abzuschließen

**Frage 62** *(Domäne 4 — Aufgabe 4.1)*
Die EC2-Flotte eines Unternehmens verwendet Hunderte von gp2-EBS-Volumes, die rein zur Erlangung von Baseline-IOPS groß dimensioniert sind. Auslastungsüberprüfungen zeigen, dass die IOPS benötigt werden, aber ein Großteil der Kapazität nicht. Was sollte der Solutions Architect tun, um die Speicherkosten zu senken, ohne Performance zu verlieren?

A) Die Volumes zu io2 migrieren und dieselben IOPS provisionieren
B) Die Volumes zu gp3 migrieren, die Kapazität richtig dimensionieren und IOPS unabhängig provisionieren
C) Die Volumes zu st1 Throughput-Optimized HDD konvertieren
D) Die Volumes täglich snapshotten und die Originale löschen

**Frage 63** *(Domäne 4 — Aufgabe 4.4)*
Eine Datenpipeline in privaten Subnetzen überträgt 60 TB pro Monat von EC2-Instanzen zu Amazon S3 in derselben Region über ein NAT Gateway und erzeugt hohe Datenverarbeitungskosten. Was ist die KOSTENEFFEKTIVSTE Änderung?

A) Das NAT Gateway durch eine NAT-Instanz auf einer großen EC2-Instanz ersetzen
B) Einen Gateway VPC Endpoint für S3 erstellen und den Traffic darüber routen
C) Einen Interface VPC Endpoint (PrivateLink) für S3 erstellen
D) Die EC2-Instanzen in öffentliche Subnetze mit öffentlichen IPv4-Adressen verschieben

**Frage 64** *(Domäne 4 — Aufgabe 4.4)*
Die Monatsrechnung eines Startups zeigt unerwartete Kosten für in Verwendung befindliche öffentliche IPv4-Adressen über Dutzende von EC2-Instanzen hinweg, die nur andere AWS-Dienste innerhalb der VPC aufrufen. Das Finanzteam möchte zudem Warnungen, bevor die Gesamtausgaben des nächsten Monats einen Schwellenwert überschreiten. Welche Kombination von Maßnahmen sollte der Solutions Architect ergreifen? (Wählen Sie ZWEI.)

A) Öffentliche IPv4 durch Elastic IPs auf jeder Instanz ersetzen, die im angehängten Zustand stets kostenlos sind
B) Die öffentlichen IPv4-Adressen entfernen und private Konnektivität nutzen (VPC Endpoints/NAT nach Bedarf), da AWS für in Verwendung befindliche öffentliche IPv4-Adressen berechnet
C) AWS Compute Optimizer verwenden, um Ausgaben über dem Schwellenwert zu blockieren
D) AWS Shield Advanced aktivieren, um die monatlichen Ausgaben zu begrenzen
E) Ein AWS-Budgets-Kostenbudget mit einem Warnschwellenwert und E-Mail-Benachrichtigung erstellen

**Frage 65** *(Domäne 4 — Aufgabe 4.3)*
Eine Entwicklungsumgebung nutzt einen Amazon Aurora PostgreSQL-Cluster, der nachts und am Wochenende im Leerlauf ist, aber automatisch aufwachen muss, wenn sich Entwickler verbinden, ohne manuellen Eingriff oder Instanzgrößenänderung. Die Kosten sollen im Leerlauf für Compute auf nahezu null sinken. Welche Lösung erfüllt diese Anforderungen?

A) Aurora Serverless v2, konfiguriert mit einer Mindestkapazität von 0 ACUs, sodass es im Leerlauf automatisch pausiert
B) Ein provisionierter Aurora-Cluster, der jede Nacht von einer geplanten Lambda-Funktion gestoppt wird
C) Eine Aurora Global Database mit einem Headless-Secondary-Cluster
D) Provisioniertes Aurora mit zwei Reader-Instanzen, die nachts skaliert werden

---

## Antwortschlüssel

### Teil 1 — Fragen 1–20

**1. Antwort: B** — SCPs gelten niemals für das Management-Konto der Organisation, daher sind seine Principals von Regionsbeschränkungen unberührt. *Warum nicht die anderen:* A — SCPs werden über verschachtelte OUs vererbt; C — IAM-Allows können ein SCP-Deny in Mitgliedskonten nicht überschreiben; D — SCPs gelten sofort für alle aktuellen und künftigen Konten unter dem Anhängepunkt.

**2. Antwort: C** — Eine als Bedingung auf Rollenerstellungsaktionen durchgesetzte Permission Boundary begrenzt die maximalen Berechtigungen jeder von Entwicklern erstellten Rolle und verhindert Privilege Escalation, während der Self-Service erhalten bleibt. *Warum nicht die anderen:* A — manuelle Prüfung fügt betrieblichen Aufwand hinzu und entfernt den Self-Service; B — das Verbieten von iam:CreateRole blockiert den legitimen Workflow; D — CloudTrail-Warnungen sind detektivisch, nicht präventiv.

**3. Antwort: B** — Eine vom Kunden definierte, in der Bedingung der Trust Policy validierte ExternalId stellt sicher, dass der SaaS-Anbieter die Rolle nur im Auftrag des korrekten Kunden übernimmt, und mindert so das Confused-Deputy-Problem. *Warum nicht die anderen:* A — MFA ist für automatisierte Service-zu-Service-Übernahme unpraktisch und adressiert die Deputy-Verwirrung nicht; C — das Verschlüsseln einer ARN (die nicht geheim ist) löst nichts; D — langlebige IAM-User-Keys sind weniger sicher als Rollen.

**4. Antwort: B** — IAM Identity Center föderiert einmal mit Entra ID und weist Permission Sets über alle Organisationskonten zentral über ein einziges Zugriffsportal zu. *Warum nicht die anderen:* A — IAM-User pro Konto sind genau der zu vermeidende Aufwand; C — Cognito ist für Anwendungs-(Kunden-)Identitäten, nicht für Workforce-Zugriff auf AWS-Konten; D — manuelle SAML-Einrichtung pro Konto funktioniert, hat aber weit höheren betrieblichen Aufwand.

**5. Antwort: A** — User Pools übernehmen die Authentifizierung (E-Mail-/Social-Anmeldung); Identity Pools tauschen die resultierenden Token gegen temporäre AWS-Anmeldedaten ein, die durch IAM-Rollen für den S3-Zugriff begrenzt sind. *Warum nicht die anderen:* B — vertauscht die Zwecke der beiden Dienste; C — IAM Identity Center ist für Workforce-User, nicht für App-Kunden; D — user-pool-Token (JWTs) gewähren von sich aus keinen Zugriff auf AWS-Dienste.

**6. Antwort: B** — Ein customer managed key gibt volle Kontrolle über die Key Policy, Nutzungsprotokollierung und Deaktivierung und unterstützt automatische Rotation (standardmäßig jährlich). *Warum nicht die anderen:* A — AWS managed keys erlauben weder das Bearbeiten der Key Policy noch das Deaktivieren des Schlüssels; C — AWS owned keys sind für den Kunden völlig unsichtbar; D — importiertes (BYOK-)Schlüsselmaterial unterstützt keine automatische Rotation.

**7. Antwort: B** — Envelope Encryption: KMS generiert einen Data Key; die Daten werden lokal mit dem Klartext-Data-Key verschlüsselt, der verworfen wird, während die KMS-verschlüsselte Kopie des Data Keys mit dem Ciphertext gespeichert wird. *Warum nicht die anderen:* A und C — KMS verschlüsselt große Payloads niemals direkt oder per Streaming; D — hartcodierte Schlüssel sind ein Anti-Pattern und keine Envelope Encryption.

**8. Antwort: C** — Die Alternating-Users-Strategie von Secrets Manager hält zwei Anmeldedaten und rotiert sie abwechselnd, sodass bestehende Verbindungen, die die vorherige Anmeldeinformation verwenden, während der Rotation weiterarbeiten. *Warum nicht die anderen:* A — Parameter Store hat keine eingebaute Rotation; Sie müssten alles selbst bauen; B — Single-User-Rotation macht das alte Passwort sofort ungültig und riskiert Verbindungsfehler; D — KMS-Rotation rotiert Verschlüsselungsschlüsselmaterial, keine Datenbankpasswörter.

**9. Antwort: C** — SSE-C lässt den Kunden den Verschlüsselungsschlüssel mit jeder Anfrage bereitstellen; AWS verwendet ihn im Speicher für die Operation und speichert ihn niemals. *Warum nicht die anderen:* A — SSE-S3-Schlüssel werden vollständig von AWS verwaltet; B — SSE-KMS-Schlüssel werden in AWS KMS gespeichert; D — aws/s3 ist ein AWS-verwalteter KMS-Schlüssel und überhaupt nicht client-seitig.

**10. Antwort: B** — Der Object-Lock-Compliance-Modus verhindert Löschen oder Überschreiben durch jeden Benutzer, einschließlich Root, bis die Aufbewahrung abläuft, und Object Lock erfordert Versionierung. *Warum nicht die anderen:* A — der Governance-Modus kann von Benutzern mit s3:BypassGovernanceRetention umgangen werden; C — eine Bucket-Policy kann vom Root-User geändert oder entfernt werden; D — Lebenszyklus-Ablauf verhindert das Löschen während des Zeitraums nicht.

**11. Antwort: B** — NACLs sind zustandslos, daher muss der Antwort-Traffic zu den ephemeren Quellports der Clients explizit ausgehend erlaubt werden. *Warum nicht die anderen:* A — NACLs sind zustandslos, nicht zustandsbehaftet; C — Security Groups sind zustandsbehaftet, daher ist der Rückverkehr automatisch; D — 0.0.0.0/0 ist in NACL-Regeln völlig gültig.

**12. Antwort: A, B** — Security Groups sind zustandsbehaftet (Rückverkehr automatisch erlaubt), und NACLs verarbeiten nummerierte Regeln in Reihenfolge und unterstützen Deny. *Warum nicht die anderen:* C — Security Groups unterstützen nur Allow-Regeln; D — NACLs werden an Subnetze angehängt, nicht an ENIs (Security Groups werden an ENIs angehängt); E — Security-Group-Regeln werden alle gemeinsam ohne Reihenfolge ausgewertet.

**13. Antwort: B** — Shield Advanced bietet das Shield Response Team, DDoS-Kostenschutz und Angriffstransparenz/-diagnostik für geschützte Ressourcen wie CloudFront und ALB. *Warum nicht die anderen:* A — Shield Standard ist automatisch, beinhaltet aber keinen SRT-Zugang oder Kostenschutz; C — WAF adressiert Layer-7-Anfragemuster, nicht den gesamten Anforderungssatz; D — GuardDuty ist Bedrohungserkennung, kein DDoS-Schutz.

**14. Antwort: B** — AWS WAF auf dem ALB mit der SQLi-Managed-Rule-Group plus einer Rate-based Rule blockiert beide Angriffsmuster ohne Anwendungscodeänderungen. *Warum nicht die anderen:* A — hoher Entwicklungsaufwand; C — Shield Standard deckt L3/L4-Floods ab, keine SQL-Injection; D — Security Groups können den Anfrageinhalt nicht inspizieren.

**15. Antwort: B** — GuardDuty = Bedrohungserkennung aus Logs und Threat Intelligence; Macie = Erkennung sensibler Daten (PII) in S3; Inspector = Schwachstellen-(CVE-)Scanning von EC2, ECR-Images und Lambda. *Warum nicht die anderen:* A, C, D — jede vertauscht mindestens zwei der Dienst-zu-Zweck-Zuordnungen.

**16. Antwort: B** — Gateway Endpoints existieren für genau S3 und DynamoDB, halten den Traffic im AWS-Netzwerk und haben keine Stunden- oder Datenverarbeitungsgebühr. *Warum nicht die anderen:* A — NAT Gateway routet über öffentlichen IP-Raum und kostet pro Stunde/pro GB; C — Interface Endpoints verursachen Stunden- und Datenkosten, sind also nicht am günstigsten; D — ein Internet Gateway sendet Traffic über das öffentliche Internet.

**17. Antwort: A** — IMDSv2 erfordert ein per PUT-Anfrage erhaltenes Session-Token, das typische SSRF-Vektoren nicht durchführen können; das Erzwingen von HttpTokens=required blockiert den IMDSv1-Anmeldedatendiebstahl. *Warum nicht die anderen:* B — viele Agents und SDKs benötigen IMDS legitim; C — NACLs beeinflussen den Link-Local-Traffic zwischen einer Instanz und ihrem eigenen Metadata-Endpunkt nicht; D — statische Anmeldedaten in Dateien sind weit schlimmer als Rollen-Anmeldedaten.

**18. Antwort: C** — Standard-Parameter-Store-Parameter sind kostenlos und für Klartext-Config geeignet; Secrets Manager ergänzt eingebaute Rotation für nur die 5 Passwörter und minimiert so die Kosten. *Warum nicht die anderen:* A — die Per-Secret-Preisgestaltung von Secrets Manager für 200 reine Config-Werte zu zahlen ist verschwenderisch; B — Parameter Store allein hat keine native Rotation für die Passwörter; D — Parameter Store hat keine eingebaute automatische Rotation, daher gibt diese Option eine Fähigkeit an, die nicht existiert.

**19. Antwort: B** — S3 Bucket Keys lassen S3 einen zeitlich begrenzten Data Key auf Bucket-Ebene aus dem KMS-Schlüssel generieren, was die Per-Objekt-KMS-Requests (und -Kosten) dramatisch reduziert und dabei SSE-KMS bleibt. *Warum nicht die anderen:* A — SSE-S3 gibt die KMS-Anforderung auf; C — die Rotationshäufigkeit beeinflusst das Per-Request-API-Volumen nicht; D — importiertes Schlüsselmaterial ändert die Request-Anzahl nicht.

**20. Antwort: B, D** — Ein explizites Deny gewinnt in der Policy-Bewertung immer über jedes Allow, und Permission Boundaries begrenzen Berechtigungen nur (gewähren sie nie). *Warum nicht die anderen:* A — SCPs sind Guardrails, die verfügbare Berechtigungen einschränken; sie gewähren nichts; C — ressourcenbasierte Policies gewähren routinemäßig von sich aus Cross-Account-Zugriff; E — IAM verfällt auf implizites Deny, wenn nichts eine Aktion erlaubt.

### Teil 2 — Fragen 21–37

**21. Antwort: C** — Multi-AZ bietet automatisches Failover bei AZ-Ausfall; Read Replicas absorbieren den Reporting-Lese-Traffic — zwei Funktionen für zwei verschiedene Probleme. *Warum nicht die anderen:* A — ein traditionelles Multi-AZ-Standby kann keine Lesevorgänge bedienen; B — die Replica-Hochstufung ist manuell (oder per Skript) und Replicas allein bieten kein automatisches HA-Failover; D — eine größere Single-AZ-Instanz scheitert an beiden Anforderungen zur AZ-Resilienz.

**22. Antwort: B** — Ein Multi-AZ DB cluster deployment betreibt einen Writer und zwei lesbare Standbys über drei AZs mit einem Reader-Endpunkt, sodass die Standby-Kapazität Lesevorgänge bedient und dennoch schnelles automatisches Failover unterstützt. *Warum nicht die anderen:* A — das einzelne Standby in einem Instance Deployment bedient keinen Traffic; C — Read Replicas bieten kein verwaltetes automatisches Failover und RDS-Datenbanken werden nicht per ALB lastverteilt; D — Single-AZ hat überhaupt kein Failover.

**23. Antwort: B** — Die Replikation von Aurora Global Database ist auf der Storage-Ebene asynchron mit typischer Sub-Sekunden-Latenz, daher ist das regionsübergreifende RPO nahe null, kann aber nie garantiert genau 0 sein. *Warum nicht die anderen:* A — die Replikation ist über Regionen nicht synchron; C — Write Forwarding leitet Schreibvorgänge an den Primär; es ändert die Replikationssemantik nicht; D — die Replikationslatenz liegt typischerweise unter einer Sekunde, nicht bei einem 5-Minuten-Zeitplan.

**24. Antwort: B** — Das Recovery Time Objective ist die maximal tolerierbare Ausfallzeit (4 Stunden); das Recovery Point Objective ist das maximal tolerierbare Datenverlustfenster (15 Minuten). *Warum nicht die anderen:* A — vertauscht die Definitionen; C — MTBF/MTTR sind Zuverlässigkeitsstatistiken, keine DR-Ziele; D — SLA ist eine vertragliche Verpflichtung, keine Datenverlust-Metrik.

**25. Antwort: B** — Pilot Light hält Daten kontinuierlich repliziert und Kernressourcen bereitgestellt, aber ausgeschaltet, was ein RTO von einigen zehn Minuten bei niedrigen Kosten ergibt — eine genaue Übereinstimmung. *Warum nicht die anderen:* A — Backup and Restore hat keine Live-Replikation und ein weit längeres RTO; C — Warm Standby hält den Stack laufend und kostet mehr als nötig; D — Active/Active ist am teuersten und übertrifft die Anforderung bei Weitem.

**26. Antwort: C, E** — Warm Standby ist eine verkleinerte, stets laufende vollständige Kopie; Multi-Site Active/Active bedient aus mehreren Regionen mit RTO nahe null zu den höchsten Kosten. *Warum nicht die anderen:* A — Backup and Restore ist gerade dadurch definiert, Ressourcen nicht vorab laufen zu lassen; B — Backup and Restore hat das höchste (schlechteste) RTO; D — Pilot Light ist bereitgestellt-aber-aus, nicht volle Kapazität, die Traffic bedient.

**27. Antwort: B** — Wenn das 30-sekündige Visibility Timeout mitten in der Verarbeitung abläuft, taucht die Nachricht wieder auf und ein anderer Consumer verarbeitet sie erneut; setzen Sie das Visibility Timeout länger als die maximale Verarbeitungszeit (z. B. als Best Practice 6×). *Warum nicht die anderen:* A — FIFO vs. Standard ist nicht die Ursache; C — Long Polling beeinflusst die Effizienz leerer Empfänge, nicht Duplikate; D — der Retention-Zeitraum bestimmt, wie lange Nachrichten bestehen, nicht die erneute Zustellung.

**28. Antwort: A** — Eine Redrive-Policy mit maxReceiveCount verschiebt wiederholt fehlschlagende („Poison Pill"-)Nachrichten in eine Dead-Letter-Queue zur Offline-Analyse und stoppt die endlose Retry-Schleife. *Warum nicht die anderen:* B — ein kürzeres Visibility Timeout lässt die Schleife schneller drehen; C — FIFO verwirft fehlerhafte Nachrichten nicht; D — eine 1-minütige Retention würde auch gültige Nachrichten ablaufen lassen.

**29. Antwort: B** — FIFO-Queues garantieren Exactly-once-Verarbeitung und strenge Reihenfolge innerhalb einer MessageGroupId; die Konto-ID als Group-ID zu verwenden ergibt Reihenfolge pro Konto mit Parallelität über Konten hinweg (und der High-Throughput-FIFO-Modus kann weiter skalieren). *Warum nicht die anderen:* A — Standard-Queues können weder Reihenfolge noch Exactly-once garantieren; C — SNS bietet für dieses Muster keine Garantie für Reihenfolge oder Exactly-once-Verarbeitung; D — eine einzige Group-ID serialisiert alles und zerstört den Durchsatz.

**30. Antwort: B** — SNS-zu-SQS-Fan-out stellt jedes Ereignis an jede Queue zu, wo jeder Consumer beständiges Buffering und unabhängiges Verarbeitungstempo erhält. *Warum nicht die anderen:* A — drei Consumer an einer Queue teilen sich die Nachrichten; jede Nachricht geht an nur einen Consumer; C — sequenzieller Aufruf ist keine unabhängige parallele Verarbeitung mit Buffering; D — E-Mail-Abonnements stellen an Menschen zu, nicht an beständige Anwendungspuffer.

**31. Antwort: B** — Reserved Concurrency schnitzt dedizierte Concurrency für die kritischen Funktionen heraus (und das Begrenzen der Sale-Funktion limitiert ihren Blast Radius) und verhindert, dass eine Funktion den gemeinsamen Konto-Pool erschöpft. *Warum nicht die anderen:* A — ein längeres Timeout hält Concurrency-Slots länger belegt und verschlimmert das Throttling; C — Provisioned Concurrency wärmt Umgebungen vor, erhöht aber nicht das Konto-Concurrency-Kontingent; D — die Speichergröße beeinflusst Concurrency-Limits nicht.

**32. Antwort: B** — Standard-Workflows laufen bis zu einem Jahr, und das waitForTaskToken-Callback-Pattern pausiert die Ausführung ohne Compute-Kosten, bis SendTaskSuccess/SendTaskFailure das Token zurückgibt. *Warum nicht die anderen:* A — Express-Workflows enden bei maximal 5 Minuten; C — Lambda kann höchstens 15 Minuten laufen, und Schlafen verschwendet Geld; D — EventBridge-Zeitpläne können Ereignisse auslösen, aber den Workflow-Zustand nicht pausieren und fortsetzen.

**33. Antwort: A** — Express-Workflows sind für sehr hochfrequente, kurzlebige At-least-once-Ausführungen zu niedrigeren Kosten gebaut; Standard-Workflows bieten Exactly-once-Semantik, bis zu einem Jahr Dauer und vollständige Ausführungshistorie für den Abgleich-Job. *Warum nicht die anderen:* B — Standard kann 90.000 Starts/Sekunde für diesen Anwendungsfall nicht wirtschaftlich aufrechterhalten; C — Express endet bei maximal 5 Minuten und ist At-least-once, scheitert am 12-stündigen Exactly-once-Job; D — vertauschte Zuordnungen scheitern an beiden Workloads.

**34. Antwort: B** — Failover Routing sendet den gesamten Traffic an den Primär, während sein Health Check besteht, und antwortet dann automatisch mit dem Sekundär-Record, wenn er fehlschlägt. *Warum nicht die anderen:* A — gewichtet 50/50 sendet die Hälfte des Traffics ständig an die passive Kopie; C — Latency-based Routing teilt Traffic nach Performance, nicht nach Active/Passive-Absicht; D — Geolocation routet nach Nutzerstandort, ohne Bezug zu gesundheitsbasiertem Endpunkt-Failover.

**35. Antwort: B** — Das Hinzufügen des ELB-Health-Check-Typs lässt die ASG ALB-Target-Health-Fehler als unhealthy behandeln, sodass Instanzen mit abgestürzter App beendet und ersetzt werden, obwohl die EC2-Status-Checks bestehen. *Warum nicht die anderen:* A — detailliertes Monitoring ändert nur die Metrik-Granularität; C — die Grace Period verzögert die Health-Bewertung, das Gegenteil des Benötigten; D — der Load-Balancer-Typ ist nicht das Problem.

**36. Antwort: B** — Der Network Load Balancer arbeitet auf Layer 4 (TCP/UDP), bewältigt Millionen Anfragen pro Sekunde mit extrem niedriger Latenz und unterstützt eine statische (oder Elastic) IP pro AZ. *Warum nicht die anderen:* A — ALB ist Layer 7 (HTTP/HTTPS) und bietet nativ keine statischen IPs; C — Gateway Load Balancer dient dem Bereitstellen von Inline-Virtual-Appliances; D — Classic Load Balancer ist Legacy und erfüllt keine der Anforderungen.

**37. Antwort: B, C** — CRR erfordert aktivierte Versionierung auf beiden Buckets, und EFS-Standard-Klassen sind regionale (Multi-AZ-)Dateisysteme, die gleichzeitig über AZs hinweg mountbar sind. *Warum nicht die anderen:* A — CRR repliziert nach der Konfiguration nur neue Objekte, es sei denn, Sie führen S3 Batch Replication für bestehende aus; D — EFS unterstützt tausende gleichzeitiger NFS-Clients, anders als Single-Attach-EBS; E — Versionierung ist eine Voraussetzung für die Replikation, repliziert aber von sich aus nichts.

### Teil 3 — Fragen 38–53

**38. Antwort: B** — io2 Block Express liefert bis zu 256.000 IOPS, Submillisekunden-Latenz und 99,999 % Beständigkeit und erfüllt alle drei Anforderungen. *Warum nicht die anderen:* A — gp3 kann die IOPS-Zahl inzwischen erreichen (sein Limit wurde Ende 2025 auf 80.000 angehoben), scheitert aber an den anderen beiden Anforderungen: die Beständigkeit beträgt 99,8–99,9 % (die Frage verlangt 99,999 %) und seine Latenz liegt im einstelligen Millisekundenbereich, nicht garantiert im Submillisekundenbereich; B ist der einzige Typ, der alle drei erfüllt; C — st1 ist HDD-basiert und für IOPS-intensive Datenbanken ungeeignet; D — gp2 endet bei maximal 16.000 IOPS, und Bursting ist keine dauerhafte Garantie.

**39. Antwort: C** — FSx for Lustre ist speziell für HPC gebaut, mit Submillisekunden-Latenz, Hunderten GB/s Durchsatz und nativer S3-Integration (Lazy Loading und Export). *Warum nicht die anderen:* A — EFS kann das HPC-Durchsatz-/Latenzprofil von Lustre nicht erreichen; B — FSx for Windows zielt auf SMB-/Windows-Workloads ab, nicht auf Linux-HPC; D — Mountpoint for S3 liefert weder gemeinsame POSIX-Dateisystem-Semantik noch die erforderliche Latenz.

**40. Antwort: B** — FSx for Windows File Server unterstützt nativ SMB, Active-Directory-Integration und NTFS-ACLs, und der Multi-AZ-Modus deckt die Zwei-AZ-Anforderung ab. *Warum nicht die anderen:* A — EFS ist NFS/POSIX und bewahrt keine NTFS-Berechtigungen; C — S3 ist Objektspeicher, kein SMB-File-Share; D — Lustre ist ein Linux-HPC-Dateisystem ohne SMB-/AD-Unterstützung.

**41. Antwort: D, E** — Transfer Acceleration routet Uploads über das AWS-Edge-/Backbone-Netzwerk, um Langstreckenübertragungen zu beschleunigen, und Multipart-Upload parallelisiert Übertragungen und lässt fehlgeschlagene Parts ohne Neustart der gesamten 40-GB-Datei wiederholen. *Warum nicht die anderen:* A — One Zone-IA ändert die Redundanz, nicht die Upload-Performance; B — Sie können vor S3 für Uploads keinen ALB setzen; C — CRR repliziert nach dem Upload und hilft bei der Aufnahme nicht.

**42. Antwort: B** — Instance-Store-NVMe-SSDs sind physisch an den Host angeschlossen und bieten die niedrigste Latenz für ephemere Daten, die neu generiert werden können. *Warum nicht die anderen:* A und D — EBS durchquert das Netzwerk und fügt Latenz hinzu; C — EFS ist ein Netzwerkdateisystem mit höherer Latenz als beide.

**43. Antwort: B** — Throttling auf Hot Partitions bei niedriger Gesamtauslastung ist das klassische Problem eines Partition Keys mit niedriger Kardinalität; ein Schlüssel mit hoher Kardinalität (z. B. game_id#player_id) verteilt den Traffic gleichmäßig. *Warum nicht die anderen:* A — Änderungen des Kapazitätsmodus beheben Hot Partitions nicht; C — ein LSI teilt denselben Partition Key und dieselben Hot Partitions; D — Streams erfassen Änderungen, sie verteilen Schreibvorgänge nicht neu.

**44. Antwort: B** — DAX ist ein DynamoDB-kompatibler, API-transparenter In-Memory-Cache, der Mikrosekunden-Lesevorgänge bei minimaler Codeänderung liefert. *Warum nicht die anderen:* A — ElastiCache erfordert Anwendungsumschreibungen zur Cache-Verwaltung; C — ein GSI cacht keine Hot Items und gibt keine Mikrosekunden-Latenz; D — Global Tables adressieren Multi-Region-Zugriff, nicht die Lese-Latenz einzelner Items.

**45. Antwort: B** — Ein GSI kann jederzeit zu einer bestehenden Tabelle hinzugefügt werden, unterstützt eine neue Partition-/Sort-Key-Kombination und hat seinen eigenen, vom Basis-Tabelle isolierten provisionierten Durchsatz. *Warum nicht die anderen:* A — LSIs können nur bei Tabellenerstellung angelegt werden, teilen den Partition Key der Tabelle und teilen den Tabellendurchsatz; C — die Tabelle neu zu erstellen ist störend und unnötig; D — Streams sind für Change Capture, nicht für Ad-hoc-Abfragen.

**46. Antwort: B** — DynamoDB TTL löscht abgelaufene Items automatisch im Hintergrund ohne zusätzliche Kosten. *Warum nicht die anderen:* A — geplante Scans verbrauchen Lese-/Schreibkapazität und kosten Geld; C — Lebenszyklusrichtlinien sind ein S3-/EFS-Konzept, kein DynamoDB; D — Streams filtern Ereignisse nachgelagert, löschen aber keine Items aus der Tabelle.

**47. Antwort: B** — RDS Proxy poolt und multiplext Verbindungen, sodass tausende Lambda-Aufrufe sich eine kleine Menge von Datenbankverbindungen teilen, mit nur einer Änderung des Connection Strings. *Warum nicht die anderen:* A — Hochskalierung ist teuer und verschiebt das Limit nur; C — eine Datenbankmigration ist eine größere Anwendungsänderung; D — Lambda auf 10 zu drosseln lähmt den Durchsatz, anstatt die Verbindungsverwaltung zu lösen.

**48. Antwort: A** — Aurora Replicas (bis zu 15) hinter dem Reader-Endpunkt mit Replica Auto Scaling lagern Lese-Traffic mit minimalem betrieblichem Aufwand aus. *Warum nicht die anderen:* B — Aurora verwendet kein passives Standby-Modell; Standbys im klassischen RDS-Sinn bedienen keinen Traffic; C — Sharding ist hoher betrieblicher Aufwand für ein Lese-Skalierungsproblem; D — Backtrack spult die Datenbank in der Zeit zurück, es bedient keine Lesevorgänge.

**49. Antwort: B** — Global Accelerator bietet zwei statische Anycast-IPs, unterstützt UDP, schaltet sich NLBs in mehreren Regionen vor und schaltet in Sekunden über das AWS-Backbone um. *Warum nicht die anderen:* A — CloudFront bedient HTTP/HTTPS-Inhalte, nicht beliebiges UDP, und hat keine statischen Client-seitigen IPs; C — Route-53-Latency-Routing hängt für das Failover von DNS-TTLs ab und bietet keine statischen IPs; D — ein ALB ist regional und nur HTTP.

**50. Antwort: B** — Geolocation Routing beantwortet DNS-Abfragen basierend auf dem Land des Nutzers und erzwingt Deutschland→eu-central-1 und Frankreich→eu-west-3 deterministisch zur Lizenz-Compliance. *Warum nicht die anderen:* A — Latency Routing wählt den schnellsten Endpunkt, was die Lizenzregel verletzen kann; C — Geoproximity-Bias verschiebt Grenzen nach Distanz, garantiert aber keine strenge Länderzuordnung; D — Weighted Routing verteilt zufällig nach Gewichtung und ignoriert den Standort.

**51. Antwort: C** — Eine Cluster Placement Group packt Instanzen eng zusammen in einer AZ für die niedrigste Latenz und höchste Packets-per-Second, ideal für eng gekoppelte MPI-Workloads. *Warum nicht die anderen:* A — Spread Groups trennen Instanzen auf unterschiedliche Hardware, was die Latenz erhöht, und enden bei maximal 7 pro AZ; B — Partition Groups isolieren Fehlerdomänen für verteilte Datensysteme, nicht für latenzarmes MPI; D — separate Subnetze tun nichts, um Instanzen zu kolokalisieren.

**52. Antwort: B** — Amazon Data Firehose ist vollständig verwaltet, erfordert keine Consumer oder Shard-Verwaltung, puffert Records und kann JSON zu Parquet konvertieren, bevor an S3 geliefert wird. *Warum nicht die anderen:* A — Kinesis Data Streams erfordert das Schreiben/Verwalten von Consumern; C — SQS plus EC2-Poller ist eine eigene Infrastruktur zum Bauen und Betreiben; D — MSK erfordert das Verwalten von Kafka-Clustern und Connectors.

**53. Antwort: B** — Glue Crawler leiten das Schema in den Data Catalog ab, und Athena führt serverloses SQL direkt gegen die S3-Dateien aus. *Warum nicht die anderen:* A — Redshift erfordert Cluster-Bereitstellung und Datenladen; C — EMR bedeutet das Verwalten eines langlaufenden Clusters; D — RDS würde erfordern, die Daten in einen Datenbankserver zu laden.

### Teil 4 — Fragen 54–65

**54. Antwort: C** — Mit Checkpoints versehene, neu startbare Batch-Jobs sind der ideale Spot-Workload, und eine über Instanztypen/AZs diversifizierte Spot Fleet minimiert die Unterbrechungsauswirkung bei bis zu ~90 % Einsparung. *Warum nicht die anderen:* A — On-Demand verzichtet hier ohne Nutzen auf den Rabatt; B und D — Verpflichtungen bieten kleinere Rabatte als Spot und binden Ausgaben für einen unterbrechungsfreundlichen Job.

**55. Antwort: C** — Compute Savings Plans gelten automatisch über EC2 (jede Familie/Region), Fargate und Lambda und passen zum Modernisierungspfad. *Warum nicht die anderen:* A — EC2 Instance Savings Plans sind an eine Instanzfamilie in einer Region gebunden und schließen Fargate/Lambda aus; B und D — Reserved Instances decken nur EC2 ab und gelten nicht für Fargate oder Lambda.

**56. Antwort: B** — Nur EC2-Standard-Reserved-Instances können auf dem Reserved Instance Marketplace gelistet werden; RDS- (und anderer Dienste-)RIs können nicht weiterverkauft werden. *Warum nicht die anderen:* A und C — RDS-RIs sind nicht marketplace-fähig; D — EC2-Standard-RIs sind tatsächlich auf dem Marketplace verkaufbar.

**57. Antwort: B** — AWS liefert zwei Minuten vor der Rückforderung der Instanz eine Spot-Unterbrechungsbenachrichtigung und gibt so Zeit zum Draining und Checkpointing. *Warum nicht die anderen:* A — eine Vorwarnung wird gegeben; C und D — 15 Minuten und 24 Stunden sind keine Spot-Unterbrechungsfenster (Rebalance-Empfehlungen können früher eintreffen, sind aber kein garantiertes festes Fenster).

**58. Antwort: B** — Glacier Flexible Retrieval bietet niedrige Archivspeicherkosten und Expedited Retrievals, die Daten in 1–5 Minuten zurückgeben (etwa $0.03/GB) und so die 5-Minuten-Anforderung erfüllen. *Warum nicht die anderen:* A — der schnellste Retrieval von Deep Archive dauert ~12 Stunden; C — Bulk Retrievals dauern 5–12 Stunden; D — Standard-IA ruft sofort ab, kostet aber für 7 Jahre selten abgerufene Speicherung weit mehr.

**59. Antwort: B** — One Zone-IA kostet ~20 % weniger als Standard-IA, und der Single-AZ-Beständigkeits-Trade-off ist für reproduzierbare Thumbnails akzeptabel. *Warum nicht die anderen:* A — Standard-IA kostet mehr für Redundanz, die die Daten nicht benötigen; C — Intelligent-Tiering fügt Monitoring-Gebühren hinzu und minimiert die Kosten für bekanntermaßen seltenen Zugriff nicht; D — Glacier Instant Retrieval hat eine 90-Tage-Mindestdauer und ein anderes Retrieval-Kostenprofil für dieses Muster.

**60. Antwort: A, C** — Intelligent-Tiering berechnet eine kleine Per-Objekt-Monitoring-/Automatisierungsgebühr, und Objekte unter 128 KB werden gespeichert, aber nicht überwacht oder eingestuft (zu Frequent-Access-Tarifen abgerechnet). *Warum nicht die anderen:* B — Intelligent-Tiering hat keine Abrufgebühren zwischen seinen automatischen Schichten; D — es repliziert nie regionsübergreifend; E — es gibt kein 90-Tage-Minimum für jedes Objekt in der Klasse.

**61. Antwort: B** — Unvollständige Multipart-Upload-Parts werden als Speicher abgerechnet, sind aber als Objekte unsichtbar; eine Lebenszyklusregel mit AbortIncompleteMultipartUpload löscht sie automatisch. *Warum nicht die anderen:* A — Versionierung würde Speicher erhöhen, nicht Parts bereinigen; C — eine Änderung der Speicherklasse entfernt keine verwaisten Parts; D — Transfer Acceleration beschleunigt Übertragungen, bereinigt aber keine bereits abgebrochenen Uploads.

**62. Antwort: B** — gp3 entkoppelt IOPS/Durchsatz von der Größe und kostet pro GB ~20 % weniger als gp2, sodass die Kapazität richtig dimensioniert werden kann, während die benötigten IOPS erhalten bleiben; die Migration ist eine Online-ModifyVolume-Operation. *Warum nicht die anderen:* A — io2 ist teurer, nicht günstiger; C — st1 kann die erforderlichen IOPS nicht liefern; D — das Löschen von Volumes zerstört Live-Daten.

**63. Antwort: B** — Ein Gateway VPC Endpoint für S3 ist kostenlos und eliminiert NAT-Gateway-Datenverarbeitungskosten für S3-Traffic in derselben Region. *Warum nicht die anderen:* A — eine NAT-Instanz verursacht weiterhin EC2- und Betriebskosten; C — Interface Endpoints rechnen pro Stunde und pro GB ab und kosten mehr als der kostenlose Gateway Endpoint; D — öffentliche Subnetze fügen öffentliche IPv4-Kosten hinzu und schwächen die Sicherheit.

**64. Antwort: B, E** — AWS berechnet jede in Verwendung befindliche öffentliche IPv4-Adresse, daher senkt das Entfernen unnötiger die Kosten, und AWS Budgets bietet proaktive Schwellenwert-Warnungen zu Prognose-/Ist-Ausgaben. *Warum nicht die anderen:* A — Elastic IPs werden ebenfalls unter der öffentlichen IPv4-Gebühr berechnet, selbst im angehängten Zustand; C — Compute Optimizer empfiehlt Right-Sizing, kann aber Ausgabenschwellenwerte nicht blockieren oder davor warnen; D — Shield Advanced ist ein DDoS-Dienst, der Kosten hinzufügt.

**65. Antwort: A** — Aurora Serverless v2 unterstützt das Skalieren auf 0 ACUs (Auto-Pause, verfügbar seit Ende 2024) und nimmt bei einer Verbindung automatisch wieder auf, wodurch die Compute-Kosten im Leerlauf ohne manuelle Schritte entfallen. Erwähnenswerte Feinheiten: Auto-Pause erfordert aktuelle Engine-Versionen (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); die erste Verbindung nach einer Pause benötigt ~15 Sekunden zum Wiederaufnehmen (länger nach 24+ Stunden Pause); der Speicher wird weiter abgerechnet, während Compute pausiert ist; und alles, was Verbindungen offen hält — ein RDS Proxy, ein Keep-Alive-Health-Check — verhindert die Pause vollständig. *Warum nicht die anderen:* B — ein gestoppter provisionierter Cluster wacht nicht automatisch auf, wenn sich Entwickler verbinden (und startet nach 7 Tagen neu); C — Headless-Global-Database-Sekundäre adressieren DR, nicht Leerlaufkosten; D — skalierte Reader lassen die Writer-Instanz weiterhin laufen und abrechnen.

---

## Bewertungsleitfaden

| Ergebnis | Deutung des Resultats |
|---|---|
| 55–65 | Prüfungsbereit. Buchen Sie die Prüfung. Überprüfen Sie nur die Fragen, die Sie verpasst haben. |
| 47–54 | Im Bestehensbereich, aber die Marge ist knapp. Lesen Sie die Kapitel hinter jedem Fehler erneut (nutzen Sie die Domänen-Tags), wiederholen Sie in einer Woche. |
| 38–46 | Die Grundlage ist da; Lücken bleiben. Arbeiten Sie die Domänenkarte aus Anhang B für Ihre schwachen Domänen durch, bevor Sie wiederholen. |
| Unter 38 | Lesen Sie die Kapitel für Ihre zwei schwächsten Domänen von Anfang bis Ende erneut, machen Sie deren Kapitelübungen neu, dann wiederholen Sie diese Prüfung. |

Verfolgen Sie Ihre Fehler *nach Domäne* (jede Frage ist getaggt). Ein niedriges Ergebnis, das sich in einer Domäne konzentriert, ist ein fokussiertes Lernproblem; dasselbe Ergebnis gleichmäßig verteilt ist ein Tempo- oder Frageverständnis-Problem — verlangsamen Sie und unterstreichen Sie, was jeder Stamm tatsächlich verlangt (HA vs. DR, Kosten vs. Performance, „am KOSTENEFFEKTIVSTEN" vs. „GERINGSTER betrieblicher Aufwand").
