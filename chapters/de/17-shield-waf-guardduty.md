# Kapitel 17: Die Wächter

Der Vorfall mit der rumänischen IP war eingedämmt worden. Geheimnisse waren in Secrets Manager. Anmeldedaten waren rotiert. Netzwerkkontrollen waren verschärft.

Aber Priya hatte die Frage gestellt, die Kapitel 16 beendete: „Wenn etwas Ungewöhnliches in CloudTrail auftauchte, wie würden wir es erfahren?“

Die ehrliche Antwort war: Wahrscheinlich nicht.

---

*Alles, was abgeschlossen werden konnte, war abgeschlossen worden. Geheimnisse waren in Secrets Manager. Verschlüsselungsschlüssel waren in KMS. Netzwerk-Traffic wurde von Security Groups und NACLs kontrolliert. Die Perimeter-Verteidigungen waren solide. Aber Perimeter-Verteidigungen nehmen an, dass man weiß, wie ein Angriff aussieht, bevor er eintrifft. Die Frage, die Priya stellte, war eine andere: Was ist mit den Angriffen, die man nicht kommen sieht?*

---

CloudTrail protokolliert Tausende von Ereignissen pro Tag. Kein Mensch liest sie alle. Priya prüfte jede Woche manuell, aber das bedeutete, dass etwas an einem Dienstag passieren und bis zum folgenden Montag unbemerkt bleiben konnte.

„Wir brauchen etwas, das die Logs für uns beobachtet“, sagte sie.

Maya blickte auf. „Automatisch?“

„Automatisch.“

„Und was ist, wenn jemand versucht einzubrechen?“, fuhr Priya fort. „Nicht nur ein kompromittiertes Credential – was, wenn jemand einen DDoS startet? Was, wenn sie anfangen, unsere API-Endpunkte auf Injection-Schwachstellen zu sondieren? Was, wenn sie bereits drinnen sind und wir es nicht wissen?“

„Das sind drei verschiedene Probleme“, sagte Leo.

„Ja“, sagte Priya. „Und AWS hat drei verschiedene Dienste, um sie zu adressieren.“

**Drei Bedrohungskategorien**

Sicherheitsbedrohungen gegen eine Cloud-Anwendung fallen im Allgemeinen in drei Kategorien:

**Volumenangriffe (DDoS)**: Ein Angreifer sendet so viel Traffic, dass Ihre Anwendung legitimen Benutzern nicht antworten kann. Der Angriff können Millionen von HTTP-Anfragen sein oder eine Flut von TCP-SYN-Paketen, die darauf ausgelegt sind, die Verbindungstabelle Ihres Servers zu erschöpfen.

**Anwendungsangriffe (Exploits)**: Ein Angreifer sendet speziell gestaltete Anfragen, die darauf ausgelegt sind, Schwächen in Ihrer Anwendung auszunutzen – SQL Injection, Cross-Site Scripting, fehlerhafte Eingaben, die einen Parser zum Absturz bringen.

**Verhaltensanomalien (Reconnaissance und Kompromittierung)**: API-Aufrufe, die nicht passieren sollten (jemand fragt Ihre gesamte Benutzerdatenbank um 3 Uhr morgens ab), ungewöhnliche IAM-Aktivität (Anmeldedaten werden aus einem neuen Land verwendet) oder Netzwerk-Traffic zu unerwarteten Zielen.

AWS hat einen dedizierten Dienst für jede:

- **AWS Shield**: DDoS-Schutz
- **AWS WAF**: Schutz auf Anwendungsebene
- **Amazon GuardDuty**: Verhaltensbasierte Bedrohungserkennung

**AWS Shield: Der DDoS-Absorber**

**AWS Shield Standard** ist für alle AWS-Kunden automatisch und ohne zusätzliche Kosten aktiviert. Es schützt vor den häufigsten DDoS-Angriffen auf Layer 3 (Netzwerk) und Layer 4 (Transport) – SYN-Floods, UDP-Floods, DNS-Amplification-Angriffe.

CloudFront, Route 53 und Elastic Load Balancing sitzen am Rand des AWS-Netzwerks. Wenn ein DDoS-Angriff Ihre Anwendung anvisiert, trifft er zuerst diese verwalteten Dienste. Die Netzwerkinfrastruktur von AWS absorbiert den Angriff, bevor er Ihre EC2-Instanzen erreicht.

**AWS Shield Advanced** ist der Premium-Tier (3.000 $/Monat pro Organisation, mit einer einjährigen Verpflichtung). Es ist ein separates Abonnement – es ist *nicht* in irgendeinem AWS-Support-Plan enthalten. Es fügt hinzu:

- Schutz für EC2, ELB, CloudFront, Global Accelerator und Route 53
- Beinahe-Echtzeit-Angriffsbenachrichtigungen
- Zugang zum AWS Shield Response Team (SRT) – Sicherheitsingenieure, die Ihnen helfen können, auf Angriffe zu reagieren (das Einbinden des SRT erfordert zusätzlich einen Business- oder Enterprise-Support-Plan)
- Kostenschutz: Wenn ein Angriff Ihre Rechnung in die Höhe treibt, schreibt AWS die Surge-Kosten gut
- Verbesserte DDoS-Erkennung und -Mitigation auf Layer 7 (Anwendungsebene)

„Wie viel kostet das pro Monat?“, fragte Tom.

„Dreitausend Dollar“, sagte Priya. „Pro Organisation.“

Tom war einen Moment still.

„Für Unternehmen, die Millionen an Umsatz abwickeln, kostet ein DDoS, der sie zwei Stunden lahmlegt, mehr als dreitausend Dollar“, sagte Priya.

Tom rechnete still.

„Wir beginnen mit Standard“, sagte er schließlich.

---

**Der DDoS-Vorfall: Wie Shield in Aktion aussieht**

Acht Monate nach dem Launch bekam Nimbus seinen ersten echten DDoS-Angriff.

Er begann um 11:43 Uhr an einem Dienstag. Das CloudWatch-Dashboard für den Load Balancer zeigte eingehende Verbindungsanfragen, die von den normalen 3.000 pro Minute auf 180.000 pro Minute in unter neunzig Sekunden anstiegen. Die Quell-IPs waren über vierzig Länder verteilt, und das eingehende Volumen erreichte einen Höhepunkt von etwa fünfzig Gigabit pro Sekunde. Das Muster war unverkennbar: ein Botnet, das einen SYN-Flood startete.

Leo sah die CloudFront-Metriken zuerst. „Die Anfragerate ist um das Sechzigfache gestiegen. Die Antwortzeit schnellt hoch.“

Priya zog die CloudWatch-Metriken nebeneinander auf: Verbindungsversuche an der Edge stiegen senkrecht, Anfragen, die tatsächlich den Origin erreichten – flach. „Shield Standard frisst es“, sagte sie. Es gab keinen Alarm, kein Dashboard-Ereignis, keine Benachrichtigung. Shield Standard arbeitet still: Es ist immer an, es ist kostenlos, und es gibt Ihnen **keine Angriffssichtbarkeit** – keine Ereigniskonsole, keine Benachrichtigungen, kein DDoS-Response-Team. (Diese Sichtbarkeit – Beinahe-Echtzeit-Angriffs-Dashboards und Alarme – ist genau das, was Shield *Advanced* verkauft.) Die einzige Möglichkeit, wie Priya den Angriff überhaupt sehen konnte, war durch ihre eigenen CloudWatch-Metriken.

Shield Standard hatte den SYN-Flood automatisch erkannt und innerhalb der ersten zwei Minuten die Mitigation eingeleitet. Der Angriffs-Traffic wurde an CloudFronts Edge-Knoten weltweit absorbiert – dieselben über 750 Points of Presence, die legitimen Inhalt auslieferten, absorbierten auch das Angriffsvolumen.

Bis 11:52 Uhr – neun Minuten nach Beginn des Angriffs – hatte Shields Mitigation die Anfragerate am Origin wieder auf normal gebracht. Der Angriff lief auf Netzwerkebene immer noch, aber die Mitigation handhabte ihn. Die Nimbus-Anwendung bediente durchgehend weiter Benutzer.

„Die Benutzer haben es nicht bemerkt?“, fragte Leo mit Blick auf die Fehlerratenmetrik.

„Die Fehlerrate stieg etwa vier Minuten lang um etwa zwei Prozent“, sagte Priya. „Einige Benutzer bekamen eine etwas langsamere Antwort. Keine Ausfälle. Die Anwendung blieb oben.“

„Weil Shield die Flut an der Edge absorbierte.“

„Bevor sie unseren Load Balancer erreichte. Der fünfzig Gigabit SYN-Flood traf CloudFront. Als das Traffic-Muster erkannt und mitigiert war, hatte unser Origin nur das normale Anfragevolumen gesehen.“

Der Angriff dauerte siebenundvierzig Minuten. Bis 12:30 Uhr waren die Edge-Metriken auf die Baseline zurückgekehrt – das einzige „aufgelöst“-Signal, das Shield Standard gibt.

„Und das ist Shield Standard“, sagte Tom. „Die kostenlose Version.“

„Layer-3- und Layer-4-Angriffe. Standard schützt automatisch vor denen. Wenn der Angriff ausgefeilter gewesen wäre – ein Layer-7-HTTP-Flood zum Beispiel, bei dem jede Anfrage legitim aussah – wäre Standard nicht ausreichend gewesen. Das erfordert Shield Advanced plus WAF.“

Tom schrieb „Auf Layer-7-DDoS-Muster überwachen“ in seine Sicherheits-Roadmap.

---

**AWS WAF: Der Anwendungsfilter**

**AWS WAF (Web Application Firewall)** arbeitet auf HTTP-Ebene – es inspiziert den Inhalt von Web-Anfragen, bevor sie Ihre Anwendung erreichen.

WAF wird mit **Web ACLs (Access Control Lists)** konfiguriert – Regelsätzen, die definieren, was erlaubt, blockiert oder gezählt werden soll.

WAF kann angehängt werden an:

- CloudFront-Distributionen (Anfragen an der Edge inspizieren, global)
- Application Load Balancer (Anfragen auf regionaler Ebene inspizieren)
- API Gateway
- AWS AppSync

**WAF Managed Rules**: AWS und Drittanbieter veröffentlichen vorgefertigte Regelsätze:

- **AWS Managed Rules – Core Rule Set**: Deckt zusammen mit begleitenden Regelgruppen (SQL Database, Known Bad Inputs) die OWASP Top 10 Schwachstellen ab (SQL Injection, XSS, Command Injection, Path Traversal usw.)
- **AWS Managed Rules – Known Bad Inputs**: Blockiert Anfragen, die bekannten Angriffsmustern entsprechen
- **AWS Managed Rules – Amazon IP Reputation List**: Blockiert IPs, die bekanntermaßen mit Botnets und Scannern in Verbindung stehen
- **AWS Managed Rules – Bot Control**: Identifiziert und verwaltet Bot-Traffic

Sie können auch benutzerdefinierte Regeln erstellen:

- „Jede Anfrage mit einem User-Agent-Header, der ‚sqlmap‘ enthält, blockieren“ (ein häufiger SQL-Injection-Scanner)
- „Rate Limit: höchstens 1000 Anfragen pro IP pro 5 Minuten erlauben“
- „Anfragen blockieren, die `<script>` in irgendeinem Parameterwert enthalten“

Für Nimbus das praktische Setup: WAF auf der CloudFront-Distribution mit aktiviertem Core Rule Set. Das blockiert die häufigsten Angriffsmuster, bevor Anfragen jemals die EC2-Instanzen erreichen.

Sie fragen sich vielleicht: Wenn WAF bekannte Angriffsmuster blockiert, was passiert, wenn ein neues Angriffsmuster auftaucht, das WAF nicht kennt? WAF-Managed-Rule-Sets werden von AWS und Drittanbietern aktualisiert, sobald neue Bedrohungen auftauchen – Sie müssen Regeln nicht manuell aktualisieren. Aber Sie haben recht, dass WAF grundlegend reaktiv auf bekannte Muster ist. Neue, neuartige Angriffstechniken werden nicht von einer Regel blockiert, die noch nicht existiert. Deshalb existiert GuardDuty neben WAF: WAF filtert die Eingangstür, GuardDuty beobachtet ungewöhnliches Verhalten im Haus. Ein neuer Angriffstyp könnte durch WAF kommen, aber GuardDuty kann die anomale Aktivität, die er verursacht, trotzdem markieren – ungewöhnliche API-Aufrufe, unerwartete Netzwerkziele, Zugriffsmuster, die nicht zur Baseline passen.

**Haben wir darüber nachgedacht, was passiert, wenn WAF False Positives verursacht?**, fragte Priya. „Die Anfrage eines legitimen Benutzers, die vom Core Rule Set blockiert wird?“

„WAF hat einen ‚Count‘-Modus“, sagte Leo. „Statt zu blockieren, zählt es einfach passende Anfragen. Du betreibst es zuerst im Count-Modus, überprüfst, was es blockiert hätte, verifizierst, dass es keine False Positives gibt, und wechselst dann zu Block.“

„Gut“, sagte Priya. „Wir beginnen im Count-Modus.“

---

**Eine WAF-Regel erstellen: Die Rate-Limit-Geschichte**

Zwei Wochen nach der Aktivierung von WAF im Count-Modus überprüfte Priya die Logs. Die Core-Rule-Set-Befunde waren sauber – keine False Positives auf legitimem Traffic, eine Handvoll blockierter SQL-Injection-Versuche von automatisierten Scannern.

Aber sie bemerkte ein Muster, das das Core Rule Set nicht markierte: Eine IP-Adresse hatte 847 Anfragen an `/api/search` in fünf Minuten gemacht. Jede Anfrage war strukturell gültig. Aber 847 Suchen in fünf Minuten war kein Mensch.

„Price Scraper“, sagte sie. „Jemand fragt automatisch unsere Restaurantsuche ab, um eine wettbewerbsfähige Preisdatenbank aufzubauen.“

„Kümmert uns das?“, fragte Leo.

„Es verwendet unsere Compute-Ressourcen, und es verstößt gegen unsere Nutzungsbedingungen“, sagte Tom.

„Es kümmert uns“, bestätigte Priya.

Sie erstellte eine benutzerdefinierte WAF-Rate-based-Regel:

```
Regelname: RateLimitSearchAPI
Regeltyp: Rate-based rule
Rate Limit: 100 Anfragen pro IP-Adresse
Evaluierungsfenster: 5 Minuten (konfigurierbar: 1, 2, 5 oder 10 Minuten)
Scope-down-Statement: URI-Pfad beginnt mit /api/search
Aktion: Block
```

Das Scope-down-Statement ist wichtig – das Rate Limit gilt nur für `/api/search`. Legitimer API-Traffic zu anderen Endpunkten ist nicht betroffen. Und beachten Sie, wie die Blockierung funktioniert: Es gibt keine feste „Strafzeit“ – WAF reevaluiert die Anfragerate jeder IP kontinuierlich, blockiert sie, solange die Rate über dem Limit bleibt, und entsperrt sie (typischerweise innerhalb von Sekunden), sobald die Rate wieder unter das Limit fällt.

Sie setzte sie zuerst auf den Count-Modus. Ließ sie 24 Stunden laufen. Die einzige IP, die die Regel auslöste, war der Scraper. Kein legitimer Benutzer hatte jemals mehr als 12 Anfragen an den Such-Endpunkt in fünf Minuten gesendet.

Sie wechselte in den Block-Modus. Die nächste Anfrage des Scrapers erhielt einen 403. Er wechselte zu einer anderen IP. Das Rate Limit erwischte auch die.

„Sie werden es irgendwann umgehen“, sagte Leo. „Über mehr IPs verteilen.“

„An welchem Punkt sie mehr Infrastruktur verwenden, mehr zahlen und weniger Daten bekommen“, sagte Priya. „Wir müssen sie nicht vollständig stoppen. Wir müssen es teuer genug machen, dass es sich nicht lohnt.“

„Wie viel kostet das pro Monat?“, fragte Tom.

Die WAF-Preisgestaltung ist pro Web ACL pro Monat, pro Regel pro Monat und pro Million Anfragen. Für das Nimbus-Setup – eine Web ACL, fünf Regeln auf CloudFront – ungefähr 15 $ pro Monat plus Anfragegebühren.

Tom genehmigte es sofort.

---

**Amazon GuardDuty: Der Verhaltensanalyst**

„Moment – aber *warum* würden wir das so machen?“, fragte Maya. „Wenn WAF Angriffe blockiert und Shield Fluten absorbiert, warum brauchen wir einen dritten Dienst? Worauf achtet GuardDuty eigentlich?“

WAF und Shield sind Filter – sie fangen schlechten Traffic ab, bevor er Ihre Anwendung erreicht. GuardDuty beobachtet, was passiert, nachdem Traffic ankommt. Es schaut, was Ihre Infrastruktur tut: welche IAM-Anmeldedaten verwendet werden, welche Domains Ihre Instanzen kontaktieren, welche API-Aufrufe um 3 Uhr morgens passieren. Ein Angreifer, der über eine legitim aussehende Anfrage durch die Eingangstür kommt, wird nicht von WAF gestoppt – aber GuardDuty wird bemerken, dass dasselbe Credential plötzlich API-Aufrufe aus Rumänien macht.

GuardDuty ist grundlegend anders als Shield und WAF. Es blockiert keine Angriffe – es **erkennt ungewöhnliches Verhalten**.

GuardDuty analysiert kontinuierlich mehrere Aktivitätsströme, um Bedrohungen zu erkennen: **CloudTrail-Management- und -Data-Events** (API-Aufrufe und Aktionen), **VPC Flow Logs** (Netzwerk-Traffic-Muster) und **DNS-Query-Logs** (Domain-Lookups). Das sind die drei grundlegenden Quellen, auf die sich GuardDuty schon immer verlassen hat:

- **AWS-CloudTrail-Logs**: IAM-Änderungen, API-Aufrufe, Konsolen-Logins
- **VPC Flow Logs**: Netzwerk-Traffic-Muster innerhalb Ihrer VPC
- **DNS-Query-Logs**: was Ihre Instanzen auflösen (bekannte Malware löst oft bestimmte C2-Domains auf)

Aber GuardDuty hat sich deutlich über diese drei hinaus erweitert. AWS nennt die optionalen Add-ons **Protection Plans** – S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring und Malware Protection – jeder einzeln aktiviert. Je nachdem, welche Sie aktivieren, kann GuardDuty auch **S3-Data-Events** analysieren (ungewöhnliche Zugriffsmuster auf Ihre Buckets), **EKS-Audit-Logs und Runtime-Aktivität** (bösartiges Verhalten innerhalb laufender Container), **RDS-Login-Events** (anomale Datenbank-Login-Versuche), **Lambda-Netzwerk-Traffic** (Funktionen, die unerwartete externe Ziele aufrufen), **ECS-/EC2-Runtime-Verhalten** und **EBS-Volumes, die auf Malware gescannt werden**. Für die Prüfung kennen Sie die drei Kernquellen auswendig; die Protection Plans erscheinen in Szenarien über spezifische Bedrohungserkennungskontexte – „anomale Login-Versuche zu RDS erkennen“ oder „bösartiges Verhalten innerhalb eines laufenden Containers identifizieren“ sind Signale, an GuardDutys optionale Protection Plans zu denken.

Machine-Learning-Modelle identifizieren Muster, die von Ihrer Baseline abweichen. GuardDuty generiert **Findings** – kategorisierte Alarme –, wenn es Anomalien erkennt.

Beispiele dafür, was GuardDuty erkennen kann:

- Ein IAM-Benutzer, der sich von einer unbekannten IP-Adresse einloggt (in einem Land, das er nie zuvor verwendet hat)
- API-Aufrufe, die von einem Tor-Exit-Node gemacht werden
- Eine EC2-Instanz, die mit einem bekannten Kryptowährungs-Mining-Pool kommuniziert
- Ungewöhnlich hohes API-Aufruf-Volumen (Credential-Missbrauch oder Scanning)
- Ein S3-Bucket, auf den von einer IP-Adresse zugegriffen wird, die als bösartig markiert wurde
- Ausgehender Traffic zu einer Domain, die bekanntermaßen mit Malware-Command-and-Control in Verbindung steht

„Das ist, was die rumänische IP erwischt hätte“, sagte Leo leise.

„Wenn wir GuardDuty aktiviert gehabt hätten, hätte es die EC2-Instanz markiert, die um 2 Uhr morgens ausgehende Verbindungen zu einer unbekannten externen IP machte“, bestätigte Priya.

---

**Fünf GuardDuty-Finding-Typen und was zu tun ist**

Priya erstellte ein Runbook für die fünf häufigsten GuardDuty-Findings. Wenn ein Finding ausgelöst wird, weiß das Team sofort, was es bedeutet und was zu tun ist.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Ein IAM-Benutzer hat sich erfolgreich in die AWS-Konsole von einer IP-Adresse eingeloggt, die für diesen Account noch nicht gesehen wurde, oder von einem geografischen Standort, der mit früheren Logins inkonsistent ist.

Reaktion: Mit dem Benutzer verifizieren, dass er den Login initiiert hat. Wenn nicht – oder er nicht erreicht werden kann – sofort: den Access Key und das Konsolen-Passwort des Benutzers deaktivieren, aktive Sitzungen widerrufen und ein CloudTrail-Audit von allem beginnen, was dieser Benutzer in den letzten 24 Stunden getan hat. Dieses Finding geht oft Credential-Missbrauch voraus.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Eine EC2-Instanz fragt IP-Adressen oder Domainnamen ab, die mit Kryptowährungs-Mining-Pools in Verbindung stehen. Das ist fast immer das Ergebnis einer EC2-Instanz, die kompromittiert und als Mining-Bot verwendet wird.

Reaktion: Die Instanz sofort isolieren – ihre Security Group ändern, um allen eingehenden und ausgehenden Traffic außer für Ihren Bastion Host zu blockieren. Einen forensischen Snapshot des EBS-Volumes erstellen. Dann die Instanz terminieren und einen Ersatz aus einem sauberen AMI starten.

**3. Recon:EC2/PortProbeUnprotectedPort**

Eine EC2-Instanz hat einen Port zum Internet offen, der von bekannten Scannern oder von einem Tor-Exit-Node sondiert wird. GuardDuty markiert Ports, die in den Flow Logs als von externen Quellen zugänglich erscheinen.

Reaktion: Die Security-Group-Regeln überprüfen. Wenn der Port absichtlich offen ist, das Finding mit einer Notiz als aufgelöst markieren. Wenn es nicht beabsichtigt ist, den Port sofort schließen. CloudTrail auf jeden Zugriff prüfen, der durch diesen Port erfolgt sein könnte.

**4. Trojan:EC2/BlackholeTraffic**

Eine EC2-Instanz versucht, mit einer IP-Adresse zu kommunizieren, die als „Black Hole“ identifiziert wurde – ein Ziel, das mit Malware-Command-and-Control-Infrastruktur in Verbindung steht. Traffic zu diesen IPs deutet darauf hin, dass die Instanz infiziert ist und versucht, nach Hause zu telefonieren.

Reaktion: Dasselbe wie bei CryptoCurrency-Findings – isolieren, snapshotten, ersetzen. Dieses Finding deutet auf aktive Malware auf der Instanz hin. Versuchen Sie nicht, die Instanz an Ort und Stelle zu bereinigen; bauen Sie eine neue aus einem sauberen AMI.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Jemand hat die Block-Public-Access-Einstellung auf einem S3-Bucket deaktiviert. Das bedeutet nicht, dass der Bucket öffentlich ist – es bedeutet, dass der Sicherheitsmechanismus, der versehentliche öffentliche Exponierung verhindert, für diesen Bucket ausgeschaltet wurde. Das geschieht oft versehentlich oder als Teil eines fehlkonfigurierten Deployments.

Reaktion: Untersuchen, wer die Änderung gemacht hat (CloudTrail wird den API-Aufruf haben). Block Public Access wieder aktivieren, es sei denn, es gibt einen dokumentierten Grund, warum er deaktiviert sein sollte. Erwägen Sie, die Block-Public-Access-Einstellung auf Account-Ebene zu aktivieren, um zu verhindern, dass dieses Finding in Zukunft auftritt.

„Das Wichtigste an GuardDuty-Findings“, sagte Priya, „ist, dass sie keine Alarme sind – sie sind Hypothesen. Jedes Finding sagt ‚dieses Muster sieht anomal aus.‘ Man verifiziert, man untersucht, man reagiert. Manche werden False Positives sein. Die meisten nicht.“

„Wie priorisieren wir?“, fragte Rafael.

„GuardDuty weist Schweregrade zu: Low, Medium, High. High-Severity-Findings erfordern eine Reaktion am selben Tag. Trojan- und Credential-Kompromittierungs-Findings sind immer High. Port-Probe-Findings könnten Medium oder Low sein. Beginne mit High, arbeite dich nach unten.“

---

„Wie viel kostet es?“, fragte Tom.

Die GuardDuty-Preisgestaltung basiert auf dem Volumen der analysierten Logs – CloudTrail-Ereignisse, VPC-Flow-Daten, DNS-Abfragen. Für eine kleine bis mittlere Anwendung typischerweise 50–150 $/Monat. Im großen Maßstab ist es immer noch ein kleiner Bruchteil der Infrastrukturkosten.

Tom öffnete die Konsole und aktivierte es.

„Wird schon gutgehen“, sagte Leo. „Es ist nur Monitoring. Es ist nicht so, als würde es irgendetwas kaputt machen.“

„Ich habe es schon deployt“, fügte Leo hinzu – und prüfte dann das GuardDuty-Dashboard. „Oh. Nur Sample-Findings. Die echten dauern eine Weile.“

„GuardDuty braucht Zeit, um eine Baseline davon aufzubauen, wie normal aussieht“, sagte Priya. „Gib ihm ein paar Tage. Das erste echte Finding wird kommen – sie kommen immer.“

Sie sollte damit recht behalten. Aber das erste Finding ist eine Geschichte für das Ende dieses Kapitels.

**Die drei Dienste verbinden**

Shield, WAF und GuardDuty arbeiten auf verschiedenen Schichten und ergänzen einander:

| Dienst     | Schicht                   | Schützt gegen                               | Aktion                             |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Netzwerk/Transport (L3/L4) | DDoS-Fluten                                 | Absorbiert/mitigiert Angriffe      |
| AWS WAF    | Anwendung (L7)            | OWASP Top 10, Bots, Scraper                 | Erlaubt, blockiert oder zählt Anfragen |
| GuardDuty  | Verhaltensbasiert (alle Logs) | Anomalien, kompromittierte Anmeldedaten, Malware | Erkennt und alarmiert        |

Shield stoppt die Flut. WAF filtert das Wasser. GuardDuty beobachtet die Rohrleitungen auf ungewöhnliche Flussmuster. Macie auditiert, was in den Reservoirs gespeichert ist. Security Hub ist der Kontrollraum, in dem alle Dashboards auf einmal sichtbar sind.

Der Ausfallmodus jedes erklärt, warum man sie alle braucht:

- Ein 50-Gbit/s-SYN-Flood ist keine Web-Anfrage. WAF kann ihn nicht inspizieren. GuardDuty könnte die zugehörigen CloudTrail-Ereignisse bemerken. Shield stoppt ihn.
- Eine einzelne SQL-Injection-Anfrage ist keine Flut. Shield ignoriert sie. GuardDuty kennt den Inhalt von HTTP-Anfragen nicht. WAF fängt sie.
- Ein legitimer AWS-Benutzer, der seine eigenen Anmeldedaten verwendet, um Daten langsam zu exfiltrieren – kein DDoS, keine Injection, gültiges HTTP – Shield und WAF sehen nichts Ungewöhnliches. GuardDuty bemerkt, dass die Anmeldedaten um 3 Uhr morgens aus einem neuen Land verwendet werden.
- Ein Entwickler, der versehentlich Kundendaten in einen öffentlich zugänglichen Bucket hochlädt, generiert überhaupt kein anomales Verhalten. GuardDuty hat nichts zu markieren. Macie scannt den Bucket und findet die PII.

Jeder Dienst hat einen blinden Fleck. Die Kombination deckt diese blinden Flecken ab.

**CloudTrail: Das Fundament**

Alle drei Dienste verlassen sich auf Logs. **AWS CloudTrail** ist der Logging-Dienst, der jeden API-Aufruf in Ihrem AWS-Account erfasst – wer was aufgerufen hat, wann, von wo, mit welchem Ergebnis.

CloudTrail ist standardmäßig für eine 90-Tage-Historie in der Konsole aktiviert. Um Logs langfristig zu behalten:

1. Einen Trail erstellen, der in einen S3-Bucket schreibt
2. Optional an CloudWatch Logs für Echtzeit-Alarmierung senden
3. Log-File-Validierung aktivieren (um zu erkennen, ob Logs manipuliert wurden)

GuardDuty, AWS Config, Security Hub und IAM Access Analyzer lesen alle aus CloudTrail. Ohne CloudTrail-Logs haben diese Dienste nichts zu analysieren.

„Was, wenn jemand versucht, CloudTrail zu deaktivieren?“, fragte Priya. „Wenn ein Angreifer Administrator-Zugriff erlangt, könnte seine erste Aktion sein, das Logging zu deaktivieren – seine Spuren zu verwischen.“

„Das ist, was die SCP aus Kapitel 14 verhindert“, sagte Leo. „Niemand in diesem Account kann CloudTrail deaktivieren, auch keine Administratoren.“

„Und wenn sie es irgendwie täten?“

„Security Hub würde ein Finding generieren. CloudTrail sendet bei Konfigurationsänderungen eine Benachrichtigung an SNS. Wir bekommen innerhalb von zwei Minuten nach jeder CloudTrail-Modifikation einen Alarm.“

„Und GuardDuty würde den API-Aufruf markieren“, fügte Rafael hinzu, „als ungewöhnliche IAM-Aktion – das Deaktivieren von Logging ist keine normale Betriebsaktivität.“

Mehrere Erkennungsschichten für eine der kritischsten Sicherheitsaktionen: das Manipulieren von Logs. Das war kein Zufall. Priya hatte es bewusst entworfen.

„Defense in Depth gilt auch für die Monitoring-Schicht“, sagte sie. „Nicht nur die Anwendungsschicht.“

**Amazon Macie: Sensible Daten in S3**

„Haben wir darüber nachgedacht, was passiert, wenn jemand versehentlich eine Datei mit Kunden-Kreditkartennummern nach S3 hochlädt?“, fragte Priya. „Nicht bösartig – nur ein Entwickler, der Daten zum Debuggen exportiert und die falsche Datei hochlädt?“

„Wir würden es nie erfahren“, sagte Leo.

„Genau. Es sei denn, wir haben Macie.“

**Amazon Macie** ist ein Datensicherheitsdienst, der Machine Learning verwendet, um sensible Daten in S3 automatisch zu entdecken und zu schützen. Es scannt kontinuierlich S3-Buckets und identifiziert:

- PII (personenbezogene Daten): Namen, E-Mail-Adressen, Telefonnummern, Geburtsdaten
- Finanzdaten: Kreditkartennummern, Bankkontonummern
- Anmeldedaten: Passwörter, Access Keys, in Dateien eingebettete private Schlüssel
- Gesundheitsinformationen: Patientenakten, Diagnosen

Macie generiert Findings, wenn es sensible Daten an Orten erkennt, an denen sie nicht sein sollten – oder wenn S3-Buckets übermäßig permissive Zugriffskonfigurationen haben.

„Ist das dasselbe wie GuardDuty?“, fragte Maya.

„Anderer Zweck“, sagte Priya. „GuardDuty beobachtet Verhalten – welche Aktionen unternommen werden, ob diese Aktionen anomal aussehen. Macie beobachtet Daten – welcher Inhalt gespeichert ist, ob dieser Inhalt sensibel ist. GuardDuty würde eine EC2-Instanz markieren, die ungewöhnliche API-Aufrufe macht. Macie würde einen S3-Bucket markieren, der Kreditkartennummern enthält.“

„GuardDuty ist also der Verhaltensanalyst“, sagte Leo, „und Macie ist der Datenauditor.“

„Genau. Man braucht beide. Ein Angreifer, der Daten über einen legitim aussehenden API-Aufruf exfiltriert, könnte von GuardDuty wegen des ungewöhnlichen API-Musters markiert werden. Aber wenn ein Mitarbeiter eine Datei mit 10.000 Kundendatensätzen in einen Development-Bucket hochlädt, gibt es kein anomales Verhalten zu erkennen – nur sensible Daten am falschen Ort. Macie fängt das.“

Für Nimbus war Macies unmittelbarster Wert auf dem `nimbus-debug-exports`-Bucket – einem Bucket, den Entwickler verwendeten, um Daten zum Debuggen abzulegen. Macie fand drei Dateien mit Bestellhistorien, die Kundennamen und Lieferadressen enthielten. Keine Zahlungsdaten, aber persönliche Daten, die nicht in einem unverschlüsselten Development-Bucket hätten sein sollen.

Die Dateien wurden entfernt. Eine Richtlinie wurde hinzugefügt: Der Debug-Bucket wurde auf synthetische Testdaten beschränkt. Echte Kundendaten erforderten Priyas Genehmigung, um in eine Umgebung außerhalb der Produktion exportiert zu werden.

„Wie viel kostet das pro Monat?“, fragte Tom.

Macie berechnet basierend auf der Anzahl der pro Monat evaluierten S3-Buckets und dem Volumen der gescannten Daten. Für ein Start-up mit einer moderaten Anzahl von Buckets ungefähr 10–50 $ pro Monat. Kostenlos für die ersten 30 Tage.

Tom aktivierte es vor dem Mittagessen.

---

**AWS Security Hub: Das Dashboard**

Wenn Sie mehrere AWS-Accounts betreiben oder eine konsolidierte Ansicht von Sicherheits-Findings benötigen, aggregiert **AWS Security Hub** Findings von GuardDuty, Inspector (Vulnerability Assessment), Macie (Datenschutz), Config und Firewall Manager in ein einziges Dashboard.

Es prüft auch Ihre Konfiguration gegen Sicherheits-Best-Practices (den AWS Foundational Security Best Practices Standard) und den CIS AWS Foundations Benchmark.

Security Hub ist die Antwort auf „wie sehe ich all meine Sicherheits-Findings an einem Ort, ohne zwischen fünf verschiedenen Konsolen zu wechseln?“ Wenn GuardDuty ein Finding generiert, erscheint es in GuardDuty und in Security Hub. Wenn Macie sensible Daten in einem S3-Bucket findet, erscheint es in Macie und in Security Hub. Wenn eine Config-Regel eine Fehlkonfiguration erkennt, erscheint es in Config und in Security Hub.

Für ein Single-Account-Team fügt Security Hub marginalen Wert hinzu – es ist eine weitere Konsole zu prüfen. Seine Stärke entfaltet sich im großen Maßstab: drei Accounts, zehn Accounts, fünfzig Accounts. Alle Findings aus allen Accounts aggregieren in das Security Hub eines Management-Accounts. Ein Team überwacht ein Dashboard. Ein Satz von Alarmen. Keine account-für-account-Log-Prüfung.

Für Nimbus: Security Hub wurde noch nicht gebraucht. Als sie auf drei Accounts wuchsen (Dev, Staging, Produktion), würde es essenziell werden.

„Richte es jetzt ein“, sagte Soo-Jin in ihrer dritten Woche. „Es dauert fünfzehn Minuten zu aktivieren. Es dauert drei Monate, sich zu wünschen, man hätte es früher getan.“

Sie aktivierten es.

**Amazon Inspector: Vulnerability Assessment**

Eine Woche nach der Aktivierung von Macie wurde ein CVE für die Version von OpenSSL veröffentlicht, die über die Nimbus-Produktionsflotte hinweg lief. Priya las die Sicherheitswarnung beim Kaffee.

„Wir müssen wissen, welche unserer Instanzen betroffen sind“, sagte sie.

„Ich kann einen manuellen Scan ausführen“, sagte Leo.

„Für neun Instanzen, klar. Für neunzig? Für Container?“ Priya öffnete die Inspector-Konsole. „Dafür ist Inspector da.“

**Amazon Inspector** ist ein automatisierter Vulnerability-Assessment-Dienst. Wo GuardDuty Verhalten beobachtet – was Ihre Infrastruktur gerade tut –, schaut Inspector, was vorhanden ist, das ausgenutzt werden könnte.

- **EC2-Instanzen:** Inspector scannt das Betriebssystem und installierte Pakete gegen die NVD (National Vulnerability Database) – den autoritativen Katalog bekannter CVEs. Wenn Sie OpenSSL 1.1.1 betreiben und ein CVE diese Version anvisiert, markiert Inspector es.
- **ECR-Container-Images:** Inspector scannt Container-Images im Elastic Container Registry, bevor sie deployt werden. Ein verwundbares Paket in einem Base Image taucht als Finding auf, bevor der Container je in der Produktion läuft.
- **Lambda-Funktionspakete:** Inspector analysiert die in Ihre Lambda-Funktionen gebündelten Abhängigkeiten – Python-Pakete, Node-Module, Java-Abhängigkeiten – auf bekannte Schwachstellen.

Der kritische Unterschied zu einem einmaligen Scan: Inspector läuft **kontinuierlich**. Es prüft Ihre Instanzen nicht nur einmal, wenn Sie es aktivieren, und erklärt sie für sauber. Wenn ein neues CVE veröffentlicht wird, reevaluiert Inspector Ihre bestehenden Ressourcen automatisch gegen die neue Schwachstelle. Wenn sich eine EC2-Instanz ändert – neues Paket installiert, AMI aktualisiert –, scannt Inspector sie neu. Priyas EC2-Flotte wurde innerhalb von Minuten nach der Aktivierung von Inspector für das OpenSSL-CVE markiert, nicht weil sie es darum gebeten hatte zu scannen, sondern weil das ist, was es tut.

Findings sind nach Schweregrad bewertet: Critical, High, Medium, Low, Informational. Sie fließen zu Security Hub neben GuardDuty- und Macie-Findings. Ein Dashboard. Alle drei Linsen.

„Drei Instanzen betroffen“, sagte Leo und las die Inspector-Findings. „Die anderen sechs sind auf einer gepatchten Version.“

„Patche diese drei diese Woche“, sagte Priya.

„Was ist mit den Container-Images?“

Priya sah sich die Inspector-ECR-Findings an. Zwei Base Images in ihrer Container-Registry hatten bekannte Schwachstellen – ältere Versionen von Paketen, die inzwischen gepatcht worden waren. Sie markierte sie zum Neubau.

„Das Wichtige“, sagte Priya, „ist, dass wir das gefunden haben, bevor es ausgenutzt wurde. Nicht danach.“

**Das Drei-Linsen-Modell**

GuardDuty, Inspector und Macie beobachten jeweils etwas anderes:

- **GuardDuty** ist verhaltensbasiert. Es fragt: *Was passiert gerade, das falsch aussieht?* API-Aufrufe aus unerwarteten Standorten, EC2-Instanzen, die Command-and-Control-Server kontaktieren, Anmeldedaten, die zu ungewöhnlichen Stunden verwendet werden. Es fängt aktive Bedrohungen und Anomalien.
- **Inspector** ist strukturell. Es fragt: *Was ist in unserer Umgebung vorhanden, das ausgenutzt werden könnte?* Ungepatchte Pakete, verwundbare Abhängigkeiten, veraltete Runtimes. Es fängt die Bedingungen, die Angriffe möglich machen.
- **Macie** geht um Daten. Es fragt: *Welche sensiblen Informationen sitzen in unseren S3-Buckets, die nicht dort sein sollten?* PII, Finanzdatensätze, in Dateien zurückgelassene Anmeldedaten. Es fängt Exponierung, die kein anomales Verhalten generiert – nur Daten am falschen Ort.

Eine Kompromittierung, die ein bekanntes CVE umfasst, könnte in allen dreien erscheinen: Inspector hätte die Schwachstelle vor dem Angriff markiert. GuardDuty würde das anomale Verhalten während des Angriffs markieren. Macie würde die exfiltrierten Daten markieren, nachdem sie in S3 gelandet sind.

Drei verschiedene Linsen, drei verschiedene Zeithorizonte, keine von ihnen ein Ersatz für die anderen.

**AWS Network Firewall: Der Traffic-Inspektor**

Ein weiterer Spezialist verdient eine Erwähnung, bevor der Werkzeugkasten schließt. Security Groups und NACLs (Kapitel 15) filtern Traffic nach IP, Port und Protokoll – sie können sagen, *wer* mit *was* sprechen darf, aber sie können nicht in das Gespräch hineinschauen. **AWS Network Firewall** ist eine verwaltete, zustandsbehaftete Firewall, die Sie auf VPC-Ebene bereitstellen. Sie führt Deep Packet Inspection durch: Filtern nach Domainname (ausgehend nur zu `*.eatnimbus.com` und Ihren Paket-Repositories erlauben), Blockieren von Traffic, der Intrusion-Signaturen entspricht (IDS/IPS, kompatibel mit Suricata-Regeln), und Inspizieren von Flows, die Security Groups einfach durchwinken würden, weil die Portnummer in Ordnung aussah.

„Es ist also eine Security Group mit Gehirn“, sagte Leo.

„Es ist die Appliance, die du von einem Firewall-Anbieter kaufen würdest“, sagte Priya, „außer verwaltet, auto-skalierend und in ihrem eigenen Subnetz bereitgestellt, sodass aller Traffic in die und aus der VPC durch sie geroutet wird.“

Prüfungssignale: „Traffic nach Domainname oder Payload inspizieren oder filtern“, „Intrusion Detection/Prevention (IDS/IPS) für eine VPC“ oder „zentralisierte Egress-Filterung für ausgehenden Traffic“ → Network Firewall. Security Groups und NACLs sind die Antwort für Allow/Deny auf Instanz- und Subnetzebene nach Port und IP; Network Firewall ist die Antwort, wenn die Frage Inspektion *innerhalb* des Traffics verlangt. Und wenn die Frage lautet, wie man WAF-Regeln, Shield Advanced, Security Groups *und* Network-Firewall-Policies konsistent über viele Accounts hinweg verwaltet – das ist **AWS Firewall Manager**, die Policy-Administrationsschicht obendrauf.

## Stärken und Grenzen

**AWS Shield**:

- Standard: kostenlos und automatisch – kein Grund, es nicht zu verwenden
- Advanced: ausgezeichnet für hochkarätige Ziele; teuer für kleine Teams
- Standard absorbiert Layer-3/4-Angriffe (SYN-Floods, UDP-Floods, DNS-Amplification) automatisch
- Advanced fügt Layer-7-Schutz, Echtzeit-Benachrichtigungen und das Shield Response Team hinzu

**AWS WAF**:

- Managed Rule Groups vereinfachen das Setup erheblich – OWASP-Top-10-Schutz mit ein paar Klicks
- Benutzerdefinierte Regeln erfordern Verständnis von HTTP-Angriffsmustern
- Rate Limiting ist ein mächtiges, oft übersehenes Feature – effektiv gegen Scraper und Brute Force
- WAF ist kein Ersatz für sicheren Anwendungscode – es ist eine Defense-in-Depth-Schicht
- Im Count-Modus beginnen, validieren, dann zu Block wechseln

**GuardDuty**:

- Extrem geringer Aufwand zu aktivieren (ein paar Klicks, 30-tägige kostenlose Testphase)
- Findings erfordern menschliche Überprüfung und Reaktion – GuardDuty erkennt, es behebt nicht
- False Positives kommen vor – manche legitime Aktivität sieht für ML-Modelle anomal aus
- Schweregrade (Low/Medium/High) helfen bei der Priorisierung der Reaktion
- Integriert sich mit Security Hub, EventBridge und Lambda für automatisierte Reaktions-Workflows

**Amazon Inspector**:

- Kontinuierliches, automatisiertes Vulnerability-Scanning – keine einmalige Prüfung
- Scannt automatisch neu, wenn neue CVEs veröffentlicht werden oder sich Ressourcen ändern
- Deckt EC2-Instanzen (OS- und Anwendungspakete), ECR-Container-Images und Lambda-Funktionspakete ab
- Findings fließen zu Security Hub; Schweregradbewertungen helfen bei der Patch-Priorisierung
- Blockiert keine Angriffe – es deckt die Bedingungen auf, die Angriffe möglich machen

**Amazon Macie**:

- Entdeckt automatisch sensible Daten (PII, Anmeldedaten, Finanzdaten) in S3
- Fängt Datenexponierung, die kein anomales Verhaltensmuster hat – GuardDuty würde sie verpassen
- 30-tägige kostenlose Testphase; danach Bezahlung pro Bucket pro Monat
- Am wertvollsten für Teams mit vielen S3-Buckets und unterschiedlichen Sensibilitätsstufen

**AWS Security Hub**:

- Aggregiert Findings von GuardDuty, Macie, Inspector, Config und Firewall Manager
- Prüft Konfiguration gegen Sicherheits-Benchmarks (CIS, NIST, PCI-DSS)
- Am wertvollsten im Multi-Account-Maßstab
- Früh aktivieren, auch wenn Sie nur einen Account haben – die Finding-Historie ist kumulativ

## Zusammenfassung

Fünf Dienste, fünf Schichten. Jeder adressiert eine andere Art von Bedrohung – und keiner von ihnen ersetzt die anderen. Ein DDoS-Angriff umgeht WAF und GuardDuty. Ein SQL-Injection-Versuch umgeht Shield. Ein kompromittiertes Credential, das langsam und sorgfältig verwendet wird, könnte Shield und WAF vollständig umgehen – aber GuardDuty wird die Anomalie sehen. Ein Entwickler, der versehentlich Kunden-PII in einen Debug-S3-Bucket hochlädt, umgeht alle drei – aber Macie fängt es.

- **AWS Shield Standard**: Kostenloser, automatischer DDoS-Schutz auf Layer 3/4. Immer an. Absorbierte den 50-Gbit/s-SYN-Flood, bevor er den Nimbus-Load-Balancer erreichte.
- **AWS Shield Advanced**: Premium-DDoS-Schutz mit SRT-Zugang und Kostenschutz. Enterprise-Anwendungsfall.
- **AWS WAF**: Firewall auf Anwendungsebene. HTTP-Anfragen inspizieren und filtern. An CloudFront, ALB oder API Gateway anhängen. Managed Rule Groups für OWASP-Top-10-Schutz verwenden. Rate-based Rules für Scraper-Verteidigung.
- **Amazon GuardDuty**: Verhaltensbasierte Bedrohungserkennung. Kerndatenquellen: CloudTrail-Ereignisse, VPC Flow Logs und DNS-Logs. Optionale erweiterte Protections fügen S3-Events, EKS-/ECS-Runtime-Monitoring, RDS-Login-Events und Lambda-Netzwerkaktivität hinzu. Generiert kategorisierte Findings für anomale Aktivität. Fünf zentrale Finding-Typen: UnauthorizedAccess (Konsolen-Login), CryptoCurrency (Mining), Recon (Port-Probe), Trojan (C2-Traffic), Policy (S3-Fehlkonfiguration).
- **Amazon Inspector**: Automatisiertes Vulnerability Assessment. Scannt EC2-Instanzen, ECR-Container-Images und Lambda-Funktionspakete auf bekannte CVEs. Läuft kontinuierlich und reevaluiert, wenn neue Schwachstellen veröffentlicht werden. Findings fließen zu Security Hub.
- **Amazon Macie**: Entdeckung sensibler Daten in S3. Erkennt PII, Anmeldedaten und Finanzdaten. Fängt Exponierung, die kein anomales Verhaltensmuster hat.
- **AWS Security Hub**: Aggregiert Findings von allen Sicherheitsdiensten in ein Dashboard. Ermöglicht zentralisiertes Monitoring über mehrere Accounts.
- **CloudTrail**: Das Fundament allen AWS-Sicherheits-Loggings. Einen Trail aktivieren, der für langfristige Aufbewahrung in S3 schreibt. Jeder Sicherheitsdienst liest daraus.

## Prüfungstipps

*SAA-C03 Domäne: Design Secure Architectures (Domäne 1, Aufgabe 1.2)*

- **Shield Standard vs. Advanced**: Standard ist kostenlos und automatisch. Advanced kostet Geld und fügt das SRT, Kostenschutz und bessere Erkennung hinzu. Prüfungssignale für Advanced: „großangelegter DDoS“, „SLA-Garantie während Angriffen“, „finanzieller Schutz gegen DDoS-bedingte Kostenspitzen“.
- **WAF-Anwendungsfall-Signale**: „SQL Injection blockieren“, „Cross-Site Scripting blockieren“, „API-Aufrufe rate-limiten“, „bestimmte User-Agents blockieren“, „OWASP-Top-10-Schutz“ → WAF.
- **GuardDuty-Signale**: „ungewöhnliche API-Aktivität erkennen“, „kompromittierte Anmeldedaten identifizieren“, „anomale EC2-Netzwerkverbindungen markieren“, „Threat Intelligence“ → GuardDuty.
- **WAF-Anhängung**: Kann an CloudFront (global), ALB (regional), API Gateway (regional), AppSync angehängt werden.
- **GuardDuty-Datenquellen**: Drei Kernquellen – CloudTrail-Ereignisse, VPC Flow Logs, DNS-Logs. Erweiterte optionale Quellen umfassen S3-Data-Events, EKS-Audit-Logs, RDS-Login-Events, Lambda-Netzwerkaktivität und ECS-Runtime. Die Prüfung könnte fragen, welche Datenquelle für ein bestimmtes Erkennungsszenario relevant ist: „anomale RDS-Logins“ → GuardDuty RDS Protection; „Container-Runtime-Bedrohungen“ → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie vs. GuardDuty**: Das ist ein häufiger Prüfungs-Ablenker. **Macie** verwendet ML, um sensible Daten in S3 zu erkennen (PII, Anmeldedaten, Finanzdaten). **GuardDuty** erkennt Bedrohungen und Anomalien im Verhalten. Macie geht um Inhalt. GuardDuty geht um Verhalten.
- **Inspector vs. GuardDuty vs. Macie**: Drei verschiedene Linsen, keine ersetzt die anderen. **Inspector** = Vulnerability-Scanning – CVEs auf EC2-Instanzen, Container-Images in ECR und Lambda-Funktionspakete. Läuft kontinuierlich und scannt neu, wenn neue CVEs veröffentlicht werden. **GuardDuty** = verhaltensbasierte Bedrohungserkennung – was gerade passiert, das anomal aussieht. **Macie** = Entdeckung sensibler Daten in S3 – PII, Anmeldedaten und Finanzdaten, die nicht dort sein sollten. Prüfungsauslöser: „ungepatchte Schwachstellen auf EC2 identifizieren“ oder „Container-Images auf CVEs scannen“ → Inspector. „Ungewöhnliche API-Aufrufe oder kompromittierte Anmeldedaten erkennen“ → GuardDuty. „PII oder sensible Daten in S3 finden“ → Macie.
- **Security Hub**: Aggregiert Sicherheits-Findings von mehreren Diensten und Accounts. Prüfungsszenario: „Unternehmen hat mehrere AWS-Accounts und will eine einzige Ansicht aller Sicherheits-Findings“ → Security Hub.
- **Rate-based Rules in WAF**: Verwendet, um Anfragen pro IP innerhalb eines Zeitfensters zu begrenzen. Anders als das Core Rule Set (das Angriffsmuster abgleicht). Die Prüfung verwendet Rate-based Rules für „Brute-Force-Login-Versuche verhindern“ oder „Scraping mildern“.
- **CloudTrail + GuardDuty + Security Hub**: Diese drei zusammen bilden den Kern der AWS-Sicherheits-Observability. CloudTrail zuerst aktivieren (GuardDuty und Security Hub hängen davon ab), dann GuardDuty, dann Security Hub, um Findings zu aggregieren.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie den Unterschied zwischen AWS WAF und Amazon GuardDuty. Wovor schützt jeder Dienst, und auf welcher Schicht arbeitet jeder?

*(Hinweis: Denken Sie an WAF als einen Filter für eingehende Anfragen und an GuardDuty als einen Verhaltensanalysten, der Ihre Logs beobachtet.)*

**Übung 2 – SAA-C03-Szenario**

*Szenario*: Die Website eines Einzelhandelsunternehmens wird von einem Botnet anvisiert, das Millionen von Anfragen pro Stunde an ihre Produktsuch-API sendet. Die Anfragen erscheinen legitim (gültige User-Agent-Strings, gültige Session-Cookies), führen aber nicht zu Käufen – sie scrapen Produktpreise. Der Angriff verursacht, dass legitime Kunden langsame Antwortzeiten erleben.

Welche Kombination von Diensten adressiert diese Bedrohung am BESTEN?

A) AWS WAF mit Rate-Limiting-Regeln und CloudFront  
B) AWS Shield Advanced und CloudFront  
C) Amazon GuardDuty und AWS Shield Standard  
D) Network ACLs, die die IP-Bereiche des Botnets blockieren

**Hinweis 1**: Die Anfragen sind auf HTTP-Ebene (Anwendungsebene). Welcher Dienst arbeitet auf der HTTP-Ebene?

**Hinweis 2**: Botnets verwenden viele verschiedene IP-Adressen – das Blockieren bestimmter IP-Bereiche auf NACL-Ebene ist gegen große Botnets ineffektiv.

**Hinweis 3**: Rate Limiting nach IP-Adresse kann das Scraping verlangsamen, selbst wenn man es nicht vollständig blockieren kann.

**Antwort**: A

**Erläuterung**: AWS WAF kann Anfragen pro IP-Adresse rate-limiten und so die Auswirkung von hochvolumigem Scraping aus einer einzelnen Quelle reduzieren. CloudFront verteilt den eingehenden Traffic über das Edge-Netzwerk von AWS, absorbiert das Volumen und schützt den Origin. WAF-Regeln können auch auf Anfragemuster abgleichen (schnelle aufeinanderfolgende Anfragen an denselben API-Endpunkt), um Scraping-Verhalten zu identifizieren.

**Warum nicht B?** Shield Advanced schützt gegen DDoS-Fluten (Layer 3/4). Das Szenario beschreibt Scraping auf Anwendungsebene (Layer-7-HTTP-Anfragen), das Shield nicht inspiziert.

**Warum nicht C?** GuardDuty erkennt Anomalien im Verhalten Ihres AWS-Accounts – es blockiert keine eingehenden HTTP-Anfragen. Shield Standard handhabt keine Angriffe auf Anwendungsebene.

**Warum nicht D?** Große Botnets verwenden Tausende von IP-Adressen aus verteilten Quellen. Das Blockieren bestimmter Bereiche ist ein Whack-a-Mole-Ansatz, der gegen ausgefeilte Botnets versagt.

*SAA-C03 Domäne: Design Secure Architectures – Aufgabe 1.2*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus betrachtet sein Bedrohungsmodell, während es sich darauf vorbereitet, Kreditkartendaten zu handhaben. Ein PCI-DSS-Compliance-Review erfordert:

- Schutz gegen DDoS-Angriffe auf Netzwerkebene
- Filterung auf Anwendungsebene für bekannte Web-Exploits
- Logging aller API-Aufrufe in einen manipulationssicheren, langfristigen Speicher
- Erkennung ungewöhnlicher Zugriffsmuster auf den Zahlungsdienst

Ordnen Sie jede Anforderung einem bestimmten AWS-Dienst oder einer Konfiguration zu. Ist Shield Standard ausreichend, oder deutet der PCI-DSS-Kontext auf Advanced hin? Wo würden Sie WAF anhängen?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, das Zuordnen von Compliance-Anforderungen zu AWS-Diensten zu üben.)*

## Post-Credits-Szene

GuardDuty war aktiviert.

Achtundvierzig Stunden später generierte es sein erstes Finding: *„EC2-Instanz i-0abc123 kommuniziert mit einem bekannten Tor-Exit-Node.“*

Leo sah sich die Instanz-ID an.

„Das ist die interne Monitoring-Instanz“, sagte er. „Die, die ich eingerichtet habe, um Netzwerkdiagnosen auszuführen.“

„Soll sie mit Tor-Exit-Nodes kommunizieren?“

„Nein.“ Er hielt inne. „Warum sollte sie?“

Er rief die Instanz auf. Jemand hatte ein Werkzeug darauf installiert – einen legitimen Open-Source-Netzwerkscanner, der, wie sich herausstellte, auch mit Tor-Infrastruktur für anonymisierte Datensammlung kommunizierte.

„Das Werkzeug hat also nach Hause telefoniert“, sagte Priya.

„Ohne mein Wissen“, bestätigte Leo.

„Das ist ein Supply-Chain-Risiko. Eine Abhängigkeit, die Dinge tut, die du nicht autorisiert hast.“

Leo deinstallierte das Werkzeug. Er richtete einen Prozess ein, um jedes Drittanbieter-Werkzeug vor der Installation zu überprüfen.

„Ist das das Niveau an Paranoia, auf dem wir jetzt sind?“, fragte Maya.

„Ja“, sagte Priya.

„Ist das das Niveau, auf dem wir immer hätten sein sollen?“, fragte Maya.

„Auch ja“, sagte Priya.

Im nächsten Kapitel: was passiert, wenn das Rechenzentrum in Oregon verschwindet – und warum Nimbus weiterläuft.
