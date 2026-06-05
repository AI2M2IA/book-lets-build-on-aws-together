# Kapitel 17: Die Wächter

Der Vorfall mit der rumänischen IP-Adresse war eingedämmt. Geheimnisse wurden in Secrets Manager aufbewahrt. Anmeldeinformationen wurden rotiert. Netzwerkkontrollen wurden verschärft.

Doch Priya hatte die Frage gestellt, die Kapitel 16 beendete: „Wenn etwas Ungewöhnliches in CloudTrail auftauchte, wie würden wir es erkennen?“

Die ehrliche Antwort war: wahrscheinlich nicht.

CloudTrail protokolliert täglich Tausende von Ereignissen. Niemand liest alle davon. Priya überprüfte manuell jede Woche, aber das bedeutete, dass etwas an einem Dienstag passieren und erst am folgenden Montag bemerkt werden konnte.

„Wir brauchen etwas, das unsere Protokolle im Auge behält“, sagte sie.

Maya blickte auf. „Automatisch?“

„Automatisch.“

Tom’s zweite Frage des Tages: „Wie viel kostet das?“

**Drei Bedrohungskategorien**

Sicherheitsbedrohungen gegen eine Cloud-Anwendung fallen in der Regel in drei Kategorien:

**Volumenangriffe (DDoS)**: Ein Angreifer sendet so viel Traffic, dass Ihre Anwendung nicht auf legitime Benutzer reagieren kann. Der Angriff könnte Millionen von HTTP-Anfragen oder ein Flut von TCP-SYN-Paketen sein, die darauf ausgelegt sind, die Verbindungs-Tabelle Ihres Servers zu erschöpfen.

**Anwendungsangriffe (Exploits)**: Ein Angreifer sendet speziell gestaltete Anfragen, die Schwachstellen in Ihrer Anwendung ausnutzen – SQL-Injection, Cross-Site Scripting, fehlerhafte Eingaben, die einen Parser zum Absturz bringen.

**Verhaltensanomalien (Aufklärung und Kompromittierung)**: API-Aufrufe, die nicht stattfinden sollten (jemand fragt Ihre gesamte Benutzerdatenbank um 3 Uhr morgens), ungewöhnliche IAM-Aktivitäten (Anmeldeinformationen werden von einem neuen Land verwendet) oder Netzwerkverkehr an unerwartete Ziele.

AWS bietet für jede davon einen dedizierten Dienst:

- **AWS Shield**: DDoS-Schutz
- **AWS WAF**: Schutz auf Anwendungsebene
- **Amazon GuardDuty**: Verhaltensbasierte Bedrohungserkennung

**AWS Shield: Der DDoS-Absorber**

**AWS Shield Standard** wird automatisch für alle AWS-Kunden ohne zusätzliche Kosten aktiviert. Es schützt vor den häufigsten DDoS-Angriffen auf Ebene 3 (Netzwerk) und Ebene 4 (Transport) – SYN-Floods, UDP-Floods, DNS-Amplifikation-Angriffe.

CloudFront, Route 53 und Elastic Load Balancing befinden sich am Rande der AWS-Netzwerkarchitektur. Wenn ein DDoS-Angriff auf Ihre Anwendung abzielt, trifft er diese verwalteten Dienste zuerst. Die Netzwerk-Infrastruktur von AWS absorbiert den Angriff, bevor er Ihre EC2-Instanzen erreicht.

**AWS Shield Advanced** ist die Premium-Stufe (3.000 USD pro Monat pro Organisation). Sie fügt hinzu:

- Schutz für EC2, ELB, CloudFront, Global Accelerator und Route 53
- Nahe-echtzeitliche Angriffsnachrichten
- Zugriff auf das AWS Shield Response Team (SRT) – Sicherheitsexperten, die Ihnen bei der Reaktion auf Angriffe helfen
- Kostenerschwörung: Wenn ein Angriff Ihre Rechnung in die Höhe treibt, creditiert AWS den Überschuss
- Verbesserte DDoS-Erkennung und -Minderung auf Ebene 7 (Anwendungsebene)

„Drei tausend Dollar pro Monat?“, sagte Tom.

„Für Unternehmen, die Millionen in Umsatz haben, kostet ein DDoS, der sie für zwei Stunden lahmlegt, mehr als drei tausend Dollar“, sagte Priya.

Tom machte die Rechnung still.

„Wir beginnen mit Standard“, sagte er schließlich.

**AWS WAF: Der Anwendungsfilter**

**AWS WAF (Web Application Firewall)** arbeitet auf HTTP-Ebene – sie untersucht den Inhalt von Webanfragen, bevor sie Ihre Anwendung erreichen.

WAF wird mit **Web ACLs (Zugriffskontrolllisten)** konfiguriert – Regelsets, die definieren, was zugelassen, blockiert oder gezählt werden soll.

WAF kann an:

- CloudFront-Distributionen angehängt werden (inspeziert Anfragen an der Kante, global)
- Application Load Balancer (inspeziert Anfragen auf regionaler Ebene)
- API Gateway
- AWS AppSync

**WAF Managed Rules**: AWS und Drittanbieter veröffentlichen vorgefertigte Regelsets:

- **AWS Managed Rules - Core Rule Set**: Schützt vor den OWASP Top 10-Schwachstellen (SQL-Injection, XSS, Befehls-Injection, Pfad-Traversal usw.)
- **AWS Managed Rules - Known Bad Inputs**: Blockiert Anfragen, die bekannte Angriffsmuster abgleichen
- **AWS Managed Rules - Amazon IP Reputation List**: Blockiert IPs, die mit Botnetzen und Scannern in Verbindung stehen
- **AWS Managed Rules - Bot Control**: Erkennt und verwaltet Bot-Traffic

Sie können auch benutzerdefinierte Regeln erstellen:

- „Blockiere jede Anfrage mit einem User-Agent-Header, der „sqlmap“ enthält“ (ein häufiger SQL-Injection-Scanner)
- „Ratenbegrenzung: Erlaube nicht mehr als 1000 Anfragen pro IP pro 5 Minuten“
- „Blockiere Anfragen, die `<script>` in einem Parameterwert enthalten“

Für Nimbus die praktische Einrichtung: WAF auf der CloudFront-Distribution mit dem Core Rule Set aktiviert. Dies blockiert die häufigsten Angriffsmuster, bevor Anfragen jemals die EC2-Instanzen erreichen.

**Amazon GuardDuty: Der Verhaltensanalyst**

GuardDuty ist grundlegend anders als Shield und WAF. Es blockiert keine Angriffe – es **detektiert ungewöhnliches Verhalten**.

GuardDuty analysiert kontinuierlich:

- **AWS CloudTrail-Protokolle**: IAM-Änderungen, API-Aufrufe, Konsolenanmeldungen
- **VPC Flow Logs**: Netzwerkverkehrsmuster innerhalb Ihres VPC
- **DNS-Abfrageprotokolle**: was Ihre Instanzen auflösen (bekannte Malware löst oft spezifische C2-Domains auf)

Maschinelle Lernmodelle erkennen Muster, die von Ihrem Basislini abweichen. GuardDuty generiert **Findings** – kategorisierte Warnmeldungen – wenn es Anomalien erkennt.

Beispiele für das, was GuardDuty erkennen kann:

- Ein IAM-Benutzer, der sich von einer unbekannten IP-Adresse (in einem zuvor nicht verwendeten Land) anmeldet
- API-Aufrufe, die von einem Tor-Exit-Knoten initiiert werden
- Eine EC2-Instanz, die mit einem bekannten Kryptowährungs-Mining-Pool kommuniziert
- Ungewöhnlich hohe API-Aufrufvolumina (Missbrauch von Anmeldeinformationen oder Scanning)
- Ein S3-Bucket, auf den von einer IP-Adresse zugegriffen wird, die für ihre bösartige Aktivität gemeldet wurde
- Ausgehende Verbindungen zu einem Domain, die mit Malware-Command-and-Control-Systemen in Verbindung gebracht wird

"Das hätte den rumänischen IP-Adresse abgefangen," sagte Leo leise.

"Wenn wir GuardDuty aktiviert hätten, hätte es die EC2-Instanz markiert, die ausgehende Verbindungen zu einer unbekannten externen IP-Adresse um 2 Uhr morgens festgestellt," bestätigte Priya.

"Wie hoch sind die Kosten?"

Die Preisgestaltung von GuardDuty basiert auf dem Volumen der analysierten Protokolle – CloudTrail-Ereignisse, VPC-Flussinformationen, DNS-Abfragen. Für eine kleine bis mittelgroße Anwendung betragen die Kosten typischerweise 50-150 USD/Monat. Bei großem Maßstab ist es dennoch nur ein kleiner Teil der Infrastrukturkosten.

Tom öffnete die Konsole und aktivierte es.

**Verbindung der drei Dienste**

Shield, WAF und GuardDuty arbeiten auf unterschiedlichen Ebenen und ergänzen sich:

| Dienst        | Ebene                     | Schützt vor                               | Aktion                               |
|---------------|---------------------------|---------------------------------------------|-------------------------------------|
| AWS Shield    | Netzwerk/Transport (L3/L4) | DDoS-Fluten                                | Absorbiert/mildert Angriffe ab       |
| AWS WAF       | Anwendung (L7)          | OWASP Top 10, Bots, Scraper                | Erlaubt, blockiert oder zählt Anfragen |
| GuardDuty     | Verhaltensbezogen (alle Protokolle) | Anomalien, kompromittierte Anmeldeinformationen, Malware | Erkennt und benachrichtigt         |

Shield stoppt die Flut. WAF filtert das Wasser. GuardDuty beobachtet die Wasserleitungen auf ungewöhnliche Strömungsmuster.

**CloudTrail: Die Grundlage**

Alle drei Dienste basieren auf Protokollen. **AWS CloudTrail** ist der Protokollierungsdienst, der jeden API-Aufruf in Ihrem AWS-Konto erfasst – wer was, wann, von wo und mit welchem Ergebnis aufgerufen hat.

CloudTrail ist standardmäßig für einen 90-tägigen Verlauf in der Konsole aktiviert. Um Protokolle langfristig zu speichern:

1. Erstellen Sie einen Trail, der in einen S3-Bucket schreibt
2. Optional, senden Sie ihn an CloudWatch Logs für Echtzeit-Benachrichtigungen
3. Aktivieren Sie die Protokoll-Validierung (um zu erkennen, ob Protokolle manipuliert wurden)

GuardDuty, AWS Config und Security Hub lesen alle aus CloudTrail. Ohne CloudTrail-Protokolle haben diese Dienste nichts, woraus sie analysieren können.

**AWS Security Hub: Das Dashboard**

Wenn Sie mehrere AWS-Konten betreiben oder einen konsolidierten Überblick über Sicherheitserkenntnisse benötigen, aggregiert **AWS Security Hub** Erkenntnisse von GuardDuty, Inspector (Vulnerabilitätsbewertung), Macie (Datenschutz) und Config in einem einzigen Dashboard.

Es prüft außerdem Ihre Konfiguration anhand von Sicherheitsbest Practices (der AWS Foundational Security Best Practices-Norm) und des CIS AWS Foundations Benchmark.

Für Nimbus: Security Hub war noch nicht erforderlich. Als sie auf drei Konten (Entwicklung, Staging, Produktion) wuchsen, würde es nützlich werden.

## Stärken und Schwächen

**AWS Shield**:

- Standard: kostenlos und automatisch – kein Grund, es nicht zu verwenden
- Advanced: hervorragend für hochkarätige Ziele; teuer für kleine Teams

**AWS WAF**:

- Verwaltete Regelgruppen vereinfachen die Einrichtung erheblich
- Benutzerdefinierte Regeln erfordern ein Verständnis von HTTP-Angriffsmustern
- Das Begrenzen der Rate ist eine leistungsstarke Funktion, die oft übersehen wird
- WAF ist kein Ersatz für sicheren Anwendungscode – es ist eine Verteidigung in der Tiefe

**GuardDuty**:

- Extrem geringer Aufwand für die Aktivierung (einige Klicks)
- Erkenntnisse erfordern eine manuelle Überprüfung und Reaktion – GuardDuty erkennt, es behebt nicht
- Es treten falsche Positive auf – einige legitime Aktivitäten sehen für ML-Modelle anomal aus
- 30-Tage-Testphase – sofort aktivieren

## Zusammenfassung

- **AWS Shield Standard**: Kostenlos, automatische DDoS-Schutz auf Ebene 3/4. Immer aktiv.
- **AWS Shield Advanced**: Premium DDoS-Schutz mit SRT-Zugriff und Kostenkontrolle. Unternehmensfall.
- **AWS WAF**: Anwendungsschicht-Firewall. Untersucht und filtert HTTP-Anfragen. Wird an CloudFront, ALB oder API Gateway angehängt. Verwenden Sie verwaltete Regelgruppen für den Schutz vor OWASP Top 10.
- **Amazon GuardDuty**: Verhaltensbezugtes Bedrohungserkennung. Analysiert CloudTrail, VPC Flow Logs und DNS-Logs. Generiert Erkenntnisse für ungewöhnliche Aktivitäten.
- **CloudTrail**: Die Grundlage für alle AWS-Sicherheits-Protokolle. Aktivieren Sie einen Trail, der in S3 schreibt, für die Langzeit-Speicherung.
- Diese Dienste ergänzen sich: Shield auf der Netzwerkebene, WAF auf der Anwendungsebene, GuardDuty auf der verhaltensbezogenen Ebene.

## Prüfungstipps

*SAA-C03 Domain: Design Secure Architectures (Domain 1, Task 1.2)*

- **Standardmäßiges Schild vs. Erweiterte Version**: Standard ist kostenlos und automatisiert. Die Erweiterte Version kostet Geld und fügt SRT, Kostenüberwachung und verbesserte Erkennung hinzu. Prüfungssignale für die Erweiterte Version: „Groß angelegte DDoS-Angriffe“, „SLA-Garantie während Angriffe“, „Finanzielle Absicherung gegen Kostenspitzen im Zusammenhang mit DDoS“.
- **WAF-Anwendungsfälle**: „SQL-Injektion blockieren“, „Cross-Site-Scripting blockieren“, „API-Aufrufe begrenzen“, „Spezifische Benutzer-Agenten blockieren“, „OWASP Top 10-Schutz“ → WAF.
- **GuardDuty-Signale**: „Ungewöhnliche API-Aktivitäten erkennen“, „Kompromittierte Anmeldeinformationen identifizieren“, „Anomalen EC2-Netzwerkverbindungen markieren“, „Bedrohungsintelligenz“ → GuardDuty.
- **WAF-Anschluss**: Kann an CloudFront (global), ALB (regional), API Gateway (regional), AppSync angebracht werden.
- **GuardDuty-Datensquellen**: CloudTrail-Verwaltungsevents, CloudTrail-S3-Datenevents, VPC Flow Logs, DNS-Protokolle. Eine Prüfung kann fragen, welche Datensquelle für ein bestimmtes Erkennungsszenario relevant ist.
- **Macie**: Wird oft mit GuardDuty verwechselt. **Macie** verwendet ML, um sensible Daten in S3 (PII, Anmeldeinformationen, Finanzdaten) zu erkennen. **GuardDuty** erkennt Bedrohungen und Anomalien im Verhalten. Verschiedene Anwendungsfälle.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen AWS WAF und Amazon GuardDuty. Was schützt jeder Dienst vor und in welcher Schicht arbeitet jeder?

*(Hinweis: Denken Sie an WAF als Filter für eingehende Anfragen und an GuardDuty als einen Verhaltensanalysten, der Ihre Protokolle überwacht.)*

**Übung 2 — Prüfungspraxis**

*Szenario*: Eine Einzelhandelsfirma lässt ihre Website von einem Botnet durchsuchen, das Millionen von Anfragen pro Stunde an ihre Produkt-Such-API sendet. Die Anfragen erscheinen legitim (gültige User-Agent-Strings, gültige Sitzungscookies), führen aber nicht zu Käufen – sie werden Produktpreise extrahiert. Der Angriff führt zu langsamen Antwortzeiten für legitime Kunden.

Welche Kombination von Diensten löst diese Bedrohung am besten?

A) AWS Shield Advanced und CloudFront
B) AWS WAF mit Ratenbegrenzungsregeln und CloudFront
C) Amazon GuardDuty und AWS Shield Standard
D) Network ACLs, die die IP-Adressbereiche des Botnets blockieren

*(Hinweis: Denken Sie an WAF als Filter auf der Anwendungsschicht.)*

**Hinweis 2**: Botnets verwenden viele verschiedene IP-Adressen – das Blockieren spezifischer IP-Adressbereiche im NACL-Level ist gegen große Botnets ineffektiv.

**Hinweis 3**: Ratenbegrenzung anhand einer IP-Adresse kann das Scraping verlangsamen, auch wenn es nicht vollständig blockiert werden kann.

**Antwort**: B

**Erläuterung**: AWS WAF kann Anfragen pro IP-Adresse begrenzen und so die Auswirkungen hoher Volumina durch jede einzelne Quelle reduzieren. CloudFront verteilt den eingehenden Traffic über das globale Randnetz von AWS, das das Volumen absorbiert und die Ursprungsquelle schützt. WAF-Regeln können auch auf Anfrage-Muster (schnelle aufeinanderfolgende Anfragen an denselben API-Endpunkt) abzielen, um Scraping-Verhalten zu erkennen.

**Warum nicht A?** Shield Advanced schützt vor DDoS-Fluten (Schicht 3/4). Der Szenario beschreibt eine Anwendungsschicht-Scraping-Attacke (Schicht 7 HTTP-Anfragen), die Shield nicht inspiziert.

**Warum nicht C?** GuardDuty erkennt Anomalien in Ihrem AWS-Konto-Verhalten – es blockiert keine eingehenden HTTP-Anfragen. Shield Standard behandelt keine Anwendungsschicht-Angriffe.

**Warum nicht D?** Große Botnets verwenden Tausende von IP-Adressen aus verteilten Quellen. Das Blockieren spezifischer Bereiche ist ein „Hack-and-Slash“-Ansatz, der gegen ausgeklügelte Botnets fehlschlägt.

*SAA-C03 Domain: Design Secure Architectures — Task 1.2*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus erwägt ihr Bedrohungsmodell, als sie sich darauf vorbereiten, Kreditkartendaten zu verarbeiten. Eine PCI-DSS-Prüfung erfordert:

- Schutz vor Netzwerk-DDoS-Angriffen
- Anwendungsschicht-Filterung für bekannte Web-Exploits
- Protokollierung aller API-Aufrufe in einem widerstandsfähigen, langfristigen Speicher
- Erkennung ungewöhnlicher Zugriffsmuster auf den Zahlungsdienst

Ordnen Sie jede Anforderung einem spezifischen AWS-Dienst oder einer Konfiguration zu. Ist Shield Standard ausreichend oder deutet der PCI-DSS-Kontext auf eine Erweiterte Version hin? Wo würden Sie WAF anbringen?

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist es, das Zuordnen von Compliance-Anforderungen an AWS-Dienste zu üben.)*

## Post-Credits-Szene

GuardDuty wurde aktiviert.

Vierundvierzig Stunden später generierte es seine erste Erkenntnis: „EC2-Instanz i-0abc123 kommuniziert mit einem bekannten Tor-Exit-Knoten.“

Leo sah die Instanz-ID.

„Das ist die interne Überwachungsinstanz“, sagte er. „Die, die ich eingerichtet habe, um Netzwerkdiagnosen durchzuführen.“

„Sollte sie mit Tor-Exit-Knoten kommunizieren?“

„Nein.“ Er zögerte. „Warum sollte sie?“

Er öffnete die Instanz. Jemand hatte ein legitimes, Open-Source-Netzwerkscanner-Tool darauf installiert, das sich auch für anonymisierte Datenerfassung über Tor-Infrastruktur auslieferte.

„Also hat das Tool nach Hause gerufen“, sagte Priya.

„Ohne dass ich es wusste“, bestätigte Leo.

„Das ist ein Lieferkettenrisiko. Eine Abhängigkeit, die Dinge tut, die Sie nicht autorisiert haben.“

Leo deinstallierte das Tool. Er richtete einen Prozess zur Überprüfung jedes Drittanbieter-Tools vor der Installation ein.

„Ist das der Grad an Paranoia, den wir jetzt haben?“, fragte Maya.

„Ja“, sagte Priya.

„Sollten wir das nicht schon immer haben?“, fragte Maya.

„Auch ja“, sagte Priya.

In dem nächsten Kapitel: Was passiert, wenn das Rechenzentrum in Virginia verschwindet – und warum Nimbus weiterläuft.
