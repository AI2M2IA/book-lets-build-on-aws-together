# Kapitel 4: Ein Computer im Gebäude von jemand anderem

Der CPU-Graph war zur Hintergrundmusik geworden.

Toms Laptop stand aufgeklappt auf der Ecke seines Schreibtisches, CloudWatch aktualisierte sich jede Minute, die Auslastungslinie kletterte mit einer Steigung, die bedeutete, dass etwas hart arbeitete. Maya hatte es vor drei Tagen bemerkt und niemandem davon erzählt. Sie hatte stattdessen die Bestellschlange beobachtet.

IAM war eingerichtet. Die Anmeldedaten waren in Ordnung. Priya hatte MFA auf allem. Das Team fühlte sich zum ersten Mal, als wäre es ein wenig verantwortungsbewusst. Aber verantwortungsbewusst löste nicht das Problem, das Maya beobachtete: die Zahlen auf dem Bestell-Dashboard kletterten, während die CPU-Linie mit ihnen kletterte.

Die Nimbus-App lief auf der Instanz, die Leo gestartet hatte, ohne darüber nachzudenken — jene, die er "irgendwo deployed" hatte, bevor irgendjemand wusste, was eine Region war.

Das war in Ordnung, um Investoren eine Demo zu zeigen. Es war nicht in Ordnung, als Maya auf "Launch" drückte und zweihundert Anmeldungen in der ersten Woche eingingen — siebenundvierzig Restaurants, die täglich aktiv Bestellungen aufnahmen. Leos improvisierte Instanz verarbeitete nun echte Bestellungen, echte Menüs und echte Kunden — eine Maschine, die zufällig ausgewählt, voreingestellt dimensioniert und von einer Person konfiguriert worden war, die AWS gelernt hatte, während sie tippte.

"Wir brauchen einen Server", sagte Maya. "Einen echten. Einen, den jemand tatsächlich mit Absicht ausgewählt hat."

Tom schaute auf den CPU-Graphen. Die Linie war von der anderen Seite des Raums aus sichtbar.

Das war der Moment, in dem sie begannen, zu untersuchen, was es wirklich bedeutet, einen Computer zu mieten.

**Die Abstraktion, die niemand erklärt**

Wenn Leute sagen, dass ihre Anwendung "in der Cloud läuft", meinen sie normalerweise, dass sie auf einer virtuellen Maschine läuft — einem Computer, der physisch nicht als dedizierte Hardware existiert, aber sich in jeder Hinsicht so verhält, als würde er das.

Hier ist der Mechanismus.

Ein physischer Server in einem AWS-Rechenzentrum hat viele Ressourcen: CPU-Kerne, Speicher, Festplatten und Netzwerkbandbreite. AWS nimmt diesen physischen Server und teilt ihn mithilfe von Software, die als **Hypervisor** bezeichnet wird — Software, die wie ein Hausmeister agiert und die Ressourcen des physischen Servers unter mehreren virtuellen Mietern aufteilt. Der Hypervisor erstellt mehrere virtuelle Maschinen, von denen jede scheinbar eine eigene dedizierte CPU, Speicher und Festplatten hat — aber tatsächlich die zugrunde liegende physische Hardware gemeinsam nutzt.

Stellen Sie es sich vor wie das Mieten einer Wohnung in einem großen Gebäude, statt ein Haus zu kaufen.

Der Gebäudebesitzer (AWS) wartet die physische Struktur — die Leitungen, die Elektrik, die Sicherheit. Sie erhalten eine Einheit. Sie richten sie so ein, wie Sie möchten. Sie zahlen monatlich (oder stündlich). Wenn Sie mehr Platz benötigen, wechseln Sie in eine größere Einheit. Wenn Sie ausziehen, hören Sie auf zu zahlen.

Jede dieser Vermietungen einer virtuellen Maschine ist das, was AWS eine **EC2-Instanz** nennt — Elastic Compute Cloud.

EC2 steht für Elastic Compute Cloud. Das "Elastische" ist wichtig, und wir kommen darauf zurück. Vorerst gilt: Eine EC2-Instanz ist ein Computer, den Sie stundenweise mieten. Er hat ein Betriebssystem, eine Netzwerkverbindung und Rechenleistung. Er führt Ihre Anwendung genau wie ein physischer Server aus.

**Ihre Instanz auswählen: Größe spielt eine Rolle**

Nicht alle EC2-Instanzen sind gleich. AWS bietet Hunderte von Instanztypen an, die in Familien organisiert sind, basierend darauf, wofür sie optimiert sind.

**General Purpose** (z. B. `t3`, `m6i`): Ausgewogene CPU und Speicher. Gute Standardwahl für die meisten Webanwendungen. Die `t3`-Familie ist burstbar — sie sammelt CPU-Credits während Phasen niedriger Auslastung an und gibt sie während Bursts aus. Großartig für Entwicklungsumgebungen und Lasten mit variablem CPU-Bedarf. Die `m6i`-Familie bietet konsistente, nicht-burstbare Leistung — besser für Produktionslasten mit anhaltendem CPU-Bedarf.

**Compute Optimized** (z. B. `c7g`): Mehr CPU im Verhältnis zu Speicher. Gut für Video-Encoding, wissenschaftliche Modellierung, Batch-Verarbeitung. Das Suffix "g" in `c7g` bedeutet, dass die Instanz AWS-Graviton-Prozessoren verwendet — ARM-basierte Chips, die AWS selbst entworfen hat und die für viele Lasten ein besseres Preis-Leistungs-Verhältnis bieten als äquivalente x86-Instanzen.

**Memory Optimized** (z. B. `r7i`): Mehr Speicher im Verhältnis zur CPU. Gut für Datenbanken, Caching, In-Memory-Analysen. Wenn Sie eine Datenbank betreiben, deren Leistung sich dramatisch verbessert, indem mehr Daten im RAM gehalten werden, ist die R-Familie der richtige Ausgangspunkt.

**Storage Optimized** (z. B. `i3`): Hochgeschwindigkeitsspeicher lokal. Gut für datenintensive Lasten, die sehr schnelle Festplatten-I/O benötigen. Der lokale NVMe-Speicher auf diesen Instanzen ist deutlich schneller als EBS — aber er ist auch flüchtig. Verwenden Sie ihn für temporäre Daten, nicht für etwas, dessen Verlust Sie sich nicht leisten können.

**Accelerated Computing** (z. B. `p4`): GPUs angehängt. Gut für Machine-Learning-Training und Grafikrendering. Diese Instanzen sind teuer — eine `p3.8xlarge` kostet über 12 Dollar pro Stunde —, aber für Lasten, die von GPU-Parallelität profitieren, gibt es keinen Ersatz.

Jede Familie hat Größen. Eine `t3.micro` hat 2 virtuelle CPUs und 1 GB Speicher. Eine `t3.xlarge` hat 4 virtuelle CPUs und 16 GB. Eine `t3.2xlarge` verdoppelt erneut. Das Benennungsmuster ist konsistent: Das Suffix lautet `nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`, `4xlarge`, `8xlarge` und darüber hinaus.

Leo hatte eine `t3.micro` gewählt.

"Wie viele Nutzer kann eine `t3.micro` verarbeiten?" fragte Tom. "Und wie viel mehr kostet eine größere?"

"Hängt von der Anwendung ab", sagte Leo. "Aber wahrscheinlich nicht hundert gleichzeitige Nutzer mit Bild-Uploads und Datenbankabfragen."

"Wie viel kostet das pro Monat?" fragte Tom und schaute auf die Vergleichsseite der Instanztypen.

Leo rief die AWS-Preisseite auf. Die t3.micro kostete etwa 8 Dollar pro Monat. Die t3.small kostete 17 Dollar. Die t3.medium kostete 33 Dollar. Die t3.large kostete rund 60 Dollar. Die Lücke wurde schnell größer, je weiter man nach oben ging — nicht linear, sondern ungefähr verdoppelnd mit jedem Größenschritt. Tom schrieb die Zahlen auf und stellte fest, dass jeder Größenschritt den Speicher verdoppelte — aber, merkwürdigerweise, nicht die Anzahl der CPUs. Jede t3 von micro bis large hatte dieselben 2 vCPUs; die Anzahl stieg erst bei xlarge. Was mit jedem Schritt wuchs, war die **CPU-Credit-Baseline** — der Anteil dieser vCPUs, den die Instanz kontinuierlich nutzen konnte, ohne ihre Burst-Credits aufzubrauchen.

Tom schrieb "t3.micro" auf das Whiteboard und zeichnete ein trauriges Gesicht daneben.

**Das Right-Sizing-Gespräch**

Die t3.micro hielt etwa einen Monat, bevor der Freitagabend-Traffic sie zermalmte. Leo aktualisierte in Eile — direkt auf eine t3.large, mit der Begründung, zu groß sei sicherer als zu klein. Zwei Wochen nach dem Wechsel zur t3.large wies Tom auf etwas hin.

"Die CPU liegt bei 9 %", sagte er. "Im Durchschnitt. Über die letzten sieben Tage."

Leo schaute auf den CloudWatch-Graphen. 9 % durchschnittliche CPU. Spitzen von vielleicht 35 % während des Freitagabendessens. Den Rest der Zeit: kaum am Ticken.

"Wir betreiben einen Server für 60 Dollar im Monat", sagte Tom, "bei 9 % seiner Kapazität."

"Aber was ist mit den Freitagsspitzen?" sagte Leo. "Wir brauchen Spielraum."

"Die Freitagsspitzen erreichen 35 %", sagte Tom. "Eine t3.small hat dieselben zwei vCPUs — was kleiner ist, ist die Credit-Baseline, etwa 20 % anhaltend. Wir liegen im Durchschnitt bei 9 %. Das bedeutet, wir würden den ganzen Tag, jeden Tag CPU-Credits ansparen und einige davon für ein paar Stunden an Freitagabenden ausgeben. Ich habe die `CPUCreditBalance`-Mathematik überprüft — die Balance kommt nie auch nur annähernd an leer heran. Sie kostet 17 Dollar im Monat. Wir haben Spielraum."

Leo schaute auf die Zahlen. Er schaute auf den Graphen. Er fühlte das Unbehagen eines Ingenieurs, der überprovisioniert hat und es weiß.

"Aber was, wenn wir eine Spitze bekommen?" sagte er.

"Dann werden die Metriken es uns sagen, bevor es wehtut", sagte Priya. "Und irgendwann richten wir Auto Scaling ein — dafür ist es buchstäblich da. Sie müssen nicht mehr manuell für die Spitze provisionieren, sobald das System automatisch Instanzen hinzufügen kann."

Sie verkleinerten auf eine t3.small. Die monatliche Rechnung sank um 40 Dollar. Über ein Jahr waren das 480 Dollar — nicht nichts, besonders für ein Startup. Tom notierte es in seiner Tabelle mit der stillen Zufriedenheit von jemandem, der zwei Wochen lang darauf gewartet hatte, diesen Punkt zu machen.

Dieses Muster hat einen Namen: **Right-Sizing**. Es bedeutet, die Instanzgröße der tatsächlichen Last anzupassen, nicht dem eingebildeten schlimmsten Fall. AWS-Tools wie AWS Compute Optimizer und CloudWatch-Metriken machen Right-Sizing zu einer datengestützten Entscheidung statt zu einer Vermutung.

**Das AMI: Der Ausgangszustand Ihrer Maschine**

Bevor Sie eine EC2-Instanz starten, wählen Sie ihr Betriebssystem und ihre anfängliche Konfiguration. In AWS wird dies als **Amazon Machine Image** (AMI) bezeichnet.

Ein AMI ist eine Vorlage. Es definiert:

- Das Betriebssystem (Amazon Linux, Ubuntu, Windows Server usw.)
- Vorinstallierte Software
- Den anfänglichen Festplattenzustand

Wenn Sie eine Instanz aus einem AMI starten, erstellt AWS eine frische Kopie dieser Vorlage nur für Sie. Sie können auch eigene AMIs erstellen — wenn Sie einen Server genau so konfigurieren, wie Sie ihn möchten, können Sie diesen Zustand als benutzerdefiniertes AMI "speichern" und damit schnell identische Server starten. So deployen Sie konsistente Umgebungen im großen Maßstab.

Stellen Sie sich ein AMI als ein Rezept vor. Das Rezept beschreibt das Gericht. Jedes Mal, wenn Sie dem Rezept folgen, erhalten Sie dasselbe Gericht. Wenn Sie das Gericht dauerhaft ändern möchten, aktualisieren Sie das Rezept.

AWS bietet einen Marktplatz von AMIs — einige sind von AWS gewartet (Amazon Linux 2, Amazon Linux 2023), einige werden von großen Linux-Distributionen gewartet (Ubuntu, Red Hat, SUSE) und einige stammen von Drittanbietern (vorkonfigurierte Datenbankserver, Security-Appliances, kommerzielle Software). Für die meisten Webanwendungen ist ein von AWS gewartetes Amazon-Linux-AMI oder ein Ubuntu-LTS-AMI der richtige Ausgangspunkt.

Für Nimbus baute Leo ein benutzerdefiniertes AMI, das von der neuesten Amazon-Linux-2023-Basis ausging und die Node.js-Laufzeitumgebung, die Systemabhängigkeiten der Anwendung und eine vorerstellte Service-Datei für den Anwendungsprozess hinzufügte. Neue Instanzen, die aus diesem AMI gestartet wurden, begannen in unter 90 Sekunden, Traffic zu bedienen — deutlich schneller als die vierminütige Boot-Zeit, wenn UserData-Skripte verwendet wurden, um alles von Grund auf zu installieren.

Es gibt einen Kompromiss: Benutzerdefinierte AMIs müssen gewartet werden. Jedes Mal, wenn Sie eine Systemabhängigkeit oder die Laufzeitversion aktualisieren, müssen Sie das AMI neu erstellen. Teams, die ihre AMIs veralten lassen, betreiben am Ende Instanzen mit veralteter Software — ein Sicherheitsrisiko. Priya setzte "AMI mit neuesten Paketen neu erstellen" auf die monatliche Engineering-Checkliste.

"Wie viel kostet das Speichern von AMIs?" fragte Tom.

AMIs werden als EBS-Snapshots gespeichert — Sie zahlen den EBS-Snapshot-Tarif (ungefähr 0,05 Dollar pro GB pro Monat) für die Größe des AMI. Ein typisches Amazon-Linux-AMI mit dem Nimbus-Anwendungsstack war etwa 4 GB groß. Bei 0,05 $/GB: 0,20 Dollar pro Monat pro AMI. Fünf historische AMIs zu Rollback-Zwecken aufzubewahren: 1 $/Monat. Keine bedeutsamen Kosten.

**UserData: Das Bootstrap-Skript**

Es gibt noch eine Konfigurationsoption bei EC2, die Leo entdeckte, als er versuchte zu vermeiden, jedes Mal ein neues AMI zu bauen, wenn sich der Anwendungscode änderte.

Wenn Sie eine EC2-Instanz starten, können Sie ein **UserData-Skript** bereitstellen — ein Shell-Skript, das automatisch ausgeführt wird, wenn die Instanz zum ersten Mal startet. Es läuft als root, bevor die Instanz als "bereit" gilt.

Für Nimbus sah das UserData-Skript ungefähr so aus:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Dieses Skript installiert Node.js, zieht den neuesten Anwendungscode, installiert die Abhängigkeiten und startet den Anwendungsdienst. Jede neue Instanz, die aus dem Basis-AMI startet, führt dieses Skript aus und kommt mit der aktuellen Version der Anwendung installiert hoch — automatisch.

Dieser Ansatz bedeutet, dass das AMI einfach bleibt (nur ein Basis-Betriebssystem) und das UserData die Anwendungseinrichtung übernimmt. Der Kompromiss: UserData-Skripte brauchen Zeit zum Laufen. Eine Instanz braucht vielleicht drei bis fünf Minuten, um zu booten und bereit zu werden. Für Anwendungen, bei denen die Startzeit wichtig ist — für Auto Scaling, wo neue Instanzen schnell bereit sein müssen —, reduziert das Vorab-Backen der Anwendung in ein benutzerdefiniertes AMI die Boot-Zeit deutlich.

"Das wird schon passen", sagte Leo, als Priya nach der Boot-Zeit fragte.

"Wie lang ist die Boot-Zeit?" fragte sie.

"Vier Minuten."

"Und während dieser vier Minuten läuft die Instanz, bedient aber keinen Traffic?"

"Ja."

"Also könnten wir während einer plötzlichen Traffic-Spitze vier Minuten haben, in denen die neuen Instanzen noch nicht helfen?"

Leo schaute auf sein UserData-Skript. Er begann sich anzusehen, wie man ein benutzerdefiniertes AMI baut.

**Schlüsselpaare: Der richtige Weg, auf einen Server zuzugreifen**

Erinnern Sie sich an die "Admin123"-Katastrophe aus dem letzten Kapitel?

Der richtige Weg, sich in eine EC2-Instanz einzuloggen, ist mit einem **Schlüsselpaar**.

Ein Schlüsselpaar ist ein kryptografisches Paar: ein öffentlicher Schlüssel (von AWS auf dem Server gespeichert) und ein privater Schlüssel (eine Datei, die Sie herunterladen und geheim halten). Zum Einloggen verwenden Sie SSH — ein sicheres Protokoll — mit Ihrem privaten Schlüssel. Es gibt kein Passwort. Wenn Sie den privaten Schlüssel verlieren, verlieren Sie den Zugang. Es gibt kein "Passwort vergessen" für SSH.

Das ist wichtig, weil Schlüsselpaare:

- Einzigartig für Sie sind
- Kryptografisch unmöglich zu erraten sind
- Nicht von AWS gespeichert werden (Sie behalten den privaten Schlüssel)
- Leicht zu widerrufen sind (den Schlüssel vom Server löschen, ein neues Paar generieren)

Priya hatte bereits schlüsselbasierten Zugang auf dem Nimbus-Server eingerichtet. Der Admin123-Server wurde außer Betrieb genommen. Niemand war darüber traurig.

"Und was, wenn jemand versucht einzubrechen und ein Schlüsselpaar während der Übertragung abfängt?" fragte Priya. Sie hatte die Antwort bereits herausgearbeitet: Der private Schlüssel reist nie über das Netzwerk. Sie laden ihn einmal herunter. Sie behalten ihn lokal. Er verlässt nie Ihre Maschine.

**Was passiert, wenn Sie das Schlüsselpaar verlieren**

Leo stellte diese Frage in Woche drei, mit der spezifischen Energie von jemandem, der sein Schlüsselpaar noch nicht verloren hat, aber darüber nachdenkt.

"Wenn ich die private Schlüsseldatei verliere, was passiert?"

"Sie verlieren den SSH-Zugang zur Instanz", sagte Priya.

"Dauerhaft?"

"Nicht unbedingt. Aber der Wiederherstellungsprozess ist unangenehm."

Der Wiederherstellungsprozess: die Instanz stoppen, ihr Root-EBS-Volume abtrennen, es an eine andere Instanz anhängen, auf die Sie *tatsächlich* Zugang haben, das Volume einhängen, einen neuen öffentlichen Schlüssel zur `authorized_keys`-Datei auf dem eingehängten Volume hinzufügen, es abtrennen und wieder an die ursprüngliche Instanz anhängen, neu starten.

Das funktioniert. Es dauert dreißig bis sechzig Minuten und erfordert sorgfältige Ausführung. Ein falscher Schritt, und Sie können die Dinge verschlimmern.

Die Alternative, wenn Ihre Anwendung nichts Kritisches auf dem Root-Volume speichert (weil Sie den Ratschlägen in diesem Buch gefolgt sind und Daten in S3 und EBS speichern): die Instanz terminieren und eine frische aus dem AMI starten. Generieren Sie dabei ein neues Schlüsselpaar.

"Speichern Sie den privaten Schlüssel an einem sicheren Ort", sagte Priya. "Und niemals auf einer EC2-Instanz."

Leo schaute auf seinen Desktop-Ordner mit der Bezeichnung `AWS_keys`. Dann auf Priya. Dann verschob er den Ordner in seinen verschlüsselten Passwortmanager.

**Security Groups: Die Firewall Ihrer Instanz**

Wenn eine EC2-Instanz startet, braucht sie eine **Security Group** — eine virtuelle Firewall, die kontrolliert, welcher Netzwerk-Traffic sie erreichen kann und welcher Traffic sie aussenden kann.

Eine Security Group hat zwei Sätze von Regeln: **inbound** (eingehender Traffic) und **outbound** (ausgehender Traffic).

Standardmäßig blockiert eine neue Security Group jeglichen eingehenden Traffic und erlaubt jeglichen ausgehenden Traffic. Sie fügen Inbound-Regeln hinzu, um bestimmte Ports für bestimmte Quellen zu öffnen.

Für den Nimbus-Webserver konfigurierte Priya:

- TCP-Port 443 (HTTPS) von `0.0.0.0/0` (das gesamte Internet) erlauben
- TCP-Port 80 (HTTP) von `0.0.0.0/0` erlauben (in der Anwendung auf 443 umgeleitet)
- TCP-Port 22 (SSH) nur von der Büro-IP-Adresse erlauben — nicht vom Internet

"Moment — aber *warum* würden wir SSH nur auf die Büro-IP beschränken?" fragte Maya.

"Weil, wenn SSH für das gesamte Internet offen ist", sagte Priya, "automatisierte Bots rund um die Uhr auf Port 22 zugreifen und Anmeldedaten-Kombinationen durchprobieren werden. Unsere Logs werden sich mit fehlgeschlagenen Versuchen füllen. Und wenn es jemals eine Schwachstelle im SSH-Daemon selbst gibt, kann jeder Angreifer der Welt versuchen, sie auszunutzen."

"Aber was, wenn Leo sich von zu Hause einloggen muss?"

"VPN", sagte Priya.

Leo hatte bereits ein VPN eingerichtet. Er hatte den Ausdruck von jemandem, dem diese Frage schon einmal gestellt worden war.

Die Datenbank lebte noch auf derselben Maschine wie die Anwendung — aber Priya bereitete eine separate Security Group für den Tag vor, an dem sie das nicht mehr tun würde: der Datenbank-Port nur für Traffic von der Security Group des Webservers offen — nicht vom Internet, nicht von SSH (für direkten DB-Zugang), nicht von irgendwo sonst. In der Zwischenzeit stellte sie sicher, dass die Security Group der gemeinsamen Instanz den Datenbank-Port überhaupt nicht zum Internet exponierte. Die Datenbank wäre für alles unsichtbar außer für die Anwendung, die sie brauchte.

Um die Datenbank direkt zu erreichen, müsste ein Angreifer zuerst den Webserver kompromittieren. Das war die erste Verteidigungsschicht.

"Und die zweite Schicht?" fragte Tom.

"IAM-Authentifizierung für die Datenbank. Und Verschlüsselung während der Übertragung."

Sie fügte beides zur Einrichtungs-Checkliste hinzu.

**EC2-Instanz-Metadaten und IMDSv2**

Es gibt noch ein Stück EC2-Sicherheit, das in der Praxis wichtig ist, auch wenn es in einführenden Inhalten selten erklärt wird.

Wenn eine Anwendung auf einer EC2-Instanz läuft, kann sie einen speziellen internen Endpunkt unter `http://169.254.169.254/latest/meta-data/` abfragen, um Informationen über die Instanz abzurufen: ihre Instanz-ID, ihre Region, ihre Availability Zone und — entscheidend — die temporären IAM-Anmeldedaten, die mit einer angehängten IAM-Role verbunden sind.

So ruft die Anwendung auf der EC2-Instanz AWS-Dienste auf, ohne fest codierte Anmeldedaten zu haben. Sie fragt den Metadatendienst: "Welche Anmeldedaten soll ich gerade verwenden?" Der Metadatendienst gibt temporäre Anmeldedaten zurück, die ablaufen und automatisch rotieren.

Das Sicherheitsproblem: Ältere Versionen dieses Metadatendienstes (IMDSv1) würden auf jede Anfrage von jedem Prozess auf der Instanz antworten. Wenn eine Anwendung eine Server-Side-Request-Forgery-Schwachstelle (SSRF) hätte — einen Fehler, bei dem ein Angreifer den Server dazu bringen könnte, eine URL seiner Wahl abzurufen —, könnte der Angreifer diese Schwachstelle nutzen, um `http://169.254.169.254/latest/meta-data/iam/security-credentials/` abzurufen und die IAM-Anmeldedaten der Instanz zu erlangen.

Dieser Angriff wurde in echten Verstößen verwendet.

**IMDSv2** (Instance Metadata Service Version 2) behebt dies, indem es vor der Antwort des Metadatendienstes ein Sitzungstoken verlangt. Das Token wird über eine PUT-Anfrage erlangt. SSRF-Angriffe, die typischerweise GET-Anfragen verwenden, können den PUT-Schritt nicht abschließen — also können sie das Token nicht bekommen, und die Metadaten werden nicht zurückgegeben.

"Sollen wir IMDSv2 aktivieren?" fragte Leo.

"Es ist jetzt die Voreinstellung für neue Instanzen", sagte Priya. "Aber für bestehende Instanzen müssen Sie sich aktiv dafür entscheiden."

Sie aktivierte es an jenem Nachmittag auf allen bestehenden Nimbus-Instanzen.

**Instanz-Lebenszyklus: Nicht für immer**

Das ist etwas, das viele Anfänger übersehen.

EC2-Instanzen sind standardmäßig nicht dauerhaft. Wenn Sie eine Instanz stoppen, wird die Compute-Ressource freigegeben. Wenn Sie sie wieder starten, läuft sie möglicherweise auf anderer physischer Hardware. Alle Daten, die *auf der Instanz selbst* (auf ihrem Root-Volume) gespeichert sind, überstehen einen Stopp/Start-Zyklus — aber die öffentliche IP-Adresse ändert sich.

Wenn Sie eine Instanz *terminieren*, ist sie weg. Sofern Sie keinen separaten Speicher angehängt haben (was wir in Kapitel 6 behandeln), verschwinden alle Daten auf der Instanz.

Die vier Zustände, in denen sich eine EC2-Instanz befinden kann:

**Pending**: Die Instanz fährt hoch. Ihr wurde Hardware zugewiesen, aber sie hat das Booten noch nicht abgeschlossen. Das UserData-Skript läuft.

**Running**: Die Instanz ist aktiv und zugänglich. Sie zahlen dafür.

**Stopping/Stopped**: Die Instanz ist heruntergefahren. Das EBS-Root-Volume bleibt erhalten. Sie zahlen nicht für Compute, aber Sie zahlen weiterhin für den angehängten EBS-Speicher.

**Shutting-down/Terminated**: Die Instanz wird gelöscht. Sofern Sie EBS-Volumes nicht so konfiguriert haben, dass sie bestehen bleiben, sind ihre Daten weg.

Diese "Flüchtigkeit" ist eigentlich ein Feature, kein Fehler. Sie bedeutet, dass Sie Server hochfahren, nutzen und wegwerfen können. Sie ermöglicht horizontale Skalierung. Aber sie bedeutet auch, dass Sie wichtige Daten niemals *auf* der EC2-Instanz selbst speichern sollten.

Wo leben die Daten dann?

In separatem Speicher. Dazu kommen wir in den nächsten beiden Kapiteln.

Sie fragen sich vielleicht: Wenn eine Instanz bei jedem Neustart eine neue IP-Adresse bekommt, wie behält Ihre Anwendung eine stabile Adresse? AWS hat eine Lösung namens Elastic IP — eine statische öffentliche IP, die Ihnen gehört und die auch nach Neustarts dieselbe bleibt. Eine Anmerkung zu den Kosten: Seit Februar 2024 berechnet AWS eine kleine stündliche Gebühr für jede öffentliche IPv4-Adresse — Elastic IPs (angehängt oder nicht) und die automatisch zugewiesenen öffentlichen IPs auf Instanzen gleichermaßen. Öffentliches IPv4 ist nicht mehr kostenlos, was ein weiterer Grund ist, Instanzen in privaten Subnetzen hinter einem Load Balancer zu halten.

Für Anwendungen hinter einem Load Balancer — was die richtige Architektur für jede produktive Webanwendung ist — brauchen Sie überhaupt keine Elastic IPs. Nutzer verbinden sich mit dem stabilen DNS-Namen des Load Balancers. Der Load Balancer verbindet sich mit Instanzen über ihre privaten IP-Adressen innerhalb des VPC. Instanzen können kommen und gehen, neue IPs bekommen, hinein- und herausskalieren — der Load Balancer handhabt all das transparent. Elastic IPs sind für spezifische Anwendungsfälle: ein Server, mit dem Clients direkt per IP verbinden, ein Bastion Host mit einer stabilen Adresse, eine Anwendung, die aus einem spezifischen Grund nicht hinter einem Load Balancer steht.

Leo plante anfangs, Elastic IPs für die Nimbus-Webserver zu verwenden. Priya wies darauf hin, dass mit einem Load Balancer die IP-Adressen der Webserver für externe Clients irrelevant waren. Der Load Balancer hatte den stabilen DNS-Namen. Die Instanzen dahinter waren von Natur aus entbehrlich.

"Elastic IPs sind also für die Ausnahme, nicht die Regel", sagte Leo.

"Richtig", sagte Priya. "Und wenn Sie sich dabei ertappen, nach einer zu greifen, fragen Sie sich, ob die Architektur stattdessen einen Load Balancer haben sollte."

**Was "elastisch" bedeutet**

Wir sagten, EC2 steht für Elastic Compute Cloud. Was ist daran elastisch?

Zwei Dinge:

**Vertikale Elastizität**: Sie können die Größe einer Instanz ändern. Die Instanz stoppen, sie von `t3.micro` zu `t3.xlarge` ändern, neu starten. Mehr CPU und Speicher, gleiche Anwendung, gleiche Einrichtung.

**Horizontale Elastizität**: Sie können mehr Instanzen hinzufügen. Statt eines großen Servers betreiben Sie zehn mittlere Server hinter einem Load Balancer. Wenn der Traffic sinkt, entfernen Sie Instanzen und hören auf, für sie zu zahlen.

Beide Ansätze lösen das Problem "ein Server, zu viel Traffic". Sie haben unterschiedliche Kompromisse, die wir in Kapitel 7 untersuchen, wenn wir Auto Scaling zur Geschichte hinzufügen.

Die zentrale Erkenntnis: Mit EC2 ist Rechenleistung etwas, das Sie *einstellen*, statt etwas, das Sie *kaufen*. Brauchen Sie mehr? Drehen Sie den Regler auf. Brauchen Sie weniger? Drehen Sie ihn herunter. Zahlen Sie entsprechend.

Maya schaute auf die Tabelle der Instanztypen. "Wenn wir den Server einfach größer machen können, warum sich mit zehn mittleren herumschlagen?"

"Weil", sagte Leo, "ein großer Server immer noch ein Server ist. Wenn er ausfällt, fällt alles aus. Zehn mittlere Server bedeuten, dass einer ausfallen kann und neun weiterlaufen."

"Und", fügte Priya hinzu, "man kann einen Server nicht größer machen, ohne ihn neu zu starten. Zehn kleine bedeuten, dass man mehr hinzufügen kann, ohne die anzufassen, die gerade laufen."

Tom hatte bereits "Neustart = Ausfallzeit" in sein Notizbuch geschrieben.

## Stärken und Einschränkungen

**Warum EC2 mächtig ist**:

- Vollständige Kontrolle. Sie wählen das Betriebssystem, die Software, die Konfiguration. Es ist Ihr Computer.
- Flexible Dimensionierung. Hunderte von Instanztypen für jeden Anwendungsfall.
- Keine Hardware zu verwalten. AWS kümmert sich um die physische Ebene.
- Sekundengenaue Abrechnung, mit einem 60-Sekunden-Minimum, für Amazon-Linux-, Windows- und Ubuntu-AMIs. (Einige kommerzielle Linux-AMIs, wie RHEL und SUSE, rechnen weiterhin pro Stunde ab — prüfen Sie die Abrechnungsbedingungen des AMI.) Sie stoppen die Instanz, Sie hören auf zu zahlen.
- Funktioniert mit allem. EC2 ist das Fundament, auf dem die meisten anderen AWS-Dienste aufbauen.
- Mehrere Preismodelle (On-Demand, Reserved, Spot) ermöglichen erhebliche Kostenoptimierung
  für vorhersehbare oder flexible Lasten — ausführlich behandelt in Kapitel 27.

**Wo es kompliziert wird**:

- Sie sind für das Patchen und Aktualisieren des Betriebssystems verantwortlich. (Modell der
  geteilten Verantwortung — das ist der Teil "in der Cloud", der Ihnen gehört.)
- OS-Patching ist nicht optional. Ungepatchte EC2-Instanzen sind einer der häufigsten
  Angriffsvektoren bei Cloud-Verstößen. AWS Systems Manager Patch Manager kann dies
  automatisieren — aber Sie müssen es konfigurieren und überwachen.
- EC2 im großen Maßstab zu verwalten bedeutet, Instanzzustand, AMIs, Sicherheitspatches und
  Lebenszyklus über potenziell Tausende von Maschinen zu verwalten. Das ist betrieblicher Aufwand.
- EC2 ist nicht für alles die richtige Antwort. Für ereignisgesteuerten Code, der selten
  läuft, ist Lambda (Kapitel 20) günstiger und einfacher. Für containerisierte
  Lasten bieten ECS und EKS (Kapitel 21) bessere Ressourceneffizienz.
- Ungenutzte Instanzen kosten weiterhin Geld. Wenn Sie eine Instanz stoppen, hören Sie auf, für
  Compute zu zahlen — aber wenn Sie Speicher angehängt haben, zahlen Sie weiterhin dafür.

**Die Wann-EC2-nicht-zu-verwenden-Ermessensentscheidung**: EC2 gibt Ihnen maximale Kontrolle — aber Kontrolle hat einen betrieblichen Preis. Jede EC2-Instanz, die Sie betreiben, ist etwas, das Sie patchen, überwachen und schließlich ersetzen müssen. Für Anwendungen, die selten laufen (Lambda ist günstiger), für Anwendungen, die horizontal auf Dutzende oder Hunderte von Instanzen skalieren müssen (Container sind effizienter), oder für Datenbanken und andere verwaltete Lasten (RDS, ElastiCache) beseitigen die vollständig verwalteten Dienste erheblichen betrieblichen Aufwand zu einem moderaten Preisaufschlag. EC2 ist die richtige Wahl, wenn Sie die Kontrolle brauchen, die es bietet — nicht als Voreinstellung.

Priya hatte eine Faustregel: "Wenn wir mit einem verwalteten Dienst zufrieden wären, der tut, was wir brauchen, verwenden Sie den verwalteten Dienst. Verwenden Sie EC2, wenn die verwaltete Option nicht existiert oder nicht passt."

Leo widersprach dem anfangs. "Aber EC2 gibt uns mehr Optionen."

"Optionen sind Aufwand", sagte Priya. "Wir brauchen nicht jede Option. Wir brauchen die richtige Konfiguration, zuverlässig gewartet."

**EC2 Placement Groups: Kontrolle darüber, wo Instanzen landen**

EC2 gibt Ihnen Kontrolle darüber, was Ihre Instanz ist — ihre Größe, ihr Betriebssystem, ihre Konfiguration. Es gibt Ihnen auch begrenzte Kontrolle darüber, *wo* sie physisch landet, durch ein Feature namens **Placement Groups**.

Standardmäßig verteilt AWS Instanzen über physische Hardware, um die Verfügbarkeit zu maximieren. Aber für bestimmte Lasten möchten Sie diese Voreinstellung überschreiben — entweder, um Instanzen näher zusammenzubringen, oder um zu garantieren, dass sie weit auseinander bleiben.

Drei Typen von Placement Groups:

**Cluster**: Packt Instanzen eng zusammen innerhalb einer einzigen Availability Zone, typischerweise auf demselben physischen Rack oder benachbarter Hardware. Das Ergebnis ist die niedrigste Netzwerklatenz und der höchste Netzwerkdurchsatz zwischen Instanzen in der Gruppe — mit einem Netzwerkdurchsatz von 10 Gbit/s oder höher zwischen Instanzen (verwechseln Sie dies nicht mit Enhanced Networking/ENA, einem Netzwerkfeature pro Instanz, das unabhängig von Placement Groups ist). Das ist die Wahl für HPC (High-Performance Computing), groß angelegte ML-Trainingsjobs und eng gekoppelte parallele Lasten, bei denen Instanzen viel Zeit damit verbringen, Daten aneinander zu senden. Der Kompromiss ist die Verfügbarkeit: Wenn das zugrunde liegende Hardware-Segment ausfällt, können alle Instanzen im Cluster gleichzeitig betroffen sein.

**Partition**: Teilt Instanzen über logische Partitionen auf, wobei jede Partition auf ihrem eigenen Satz von Hardware sitzt — separate Racks, separater Strom, separate Netzwerk-Switches. Instanzen innerhalb einer Partition teilen Hardware miteinander, aber Partitionen teilen niemals Hardware mit anderen Partitionen. Dieses Design begrenzt den Schadensradius eines Hardware-Ausfalls: Ein ausfallendes Rack betrifft eine Partition, aber nicht die anderen. Partition Placement Groups sind für große verteilte und replizierte Lasten gebaut — Apache Hadoop, Apache Cassandra, Apache Kafka —, bei denen Sie genug Fehlerisolation wollen, dass ein Ausfall auf Rack-Ebene nicht Ihren gesamten Cluster lahmlegt.

**Spread**: Platziert jede Instanz auf komplett separater zugrunde liegender Hardware. Maximale Isolation zwischen Instanzen. Wenn Sie fünf kritische Anwendungsinstanzen haben, die niemals einen physischen Host teilen dürfen (weil ein einzelner Hardware-Ausfall niemals mehr als eine lahmlegen sollte), ist Spread die Antwort. Die Grenze: **7 Instanzen pro Availability Zone pro Placement Group**. Spread ist für kleine Anzahlen kritischer Instanzen ausgelegt, die keine Co-Location tolerieren können, nicht für große Flotten.

"Cluster ist also für Geschwindigkeit, Spread ist für Isolation, und Partition ist für verteilte Systeme, die sowohl etwas Clustering als auch etwas Isolation brauchen?" fragte Maya.

"Nah genug", sagte Priya. "Cluster: niedrige Latenz zwischen Instanzen, ein großes Risiko. Spread: maximale Isolation, harte Grenze von sieben pro AZ. Partition: strukturierte Isolation für große verteilte Systeme — Sie kontrollieren, in welche Partition jede Instanz geht."

Für die aktuelle Architektur von Nimbus traf noch keines davon zu. Aber zu wissen, dass es sie gab, bedeutete zu wissen, wann man nach ihnen greifen sollte — und unmittelbarer, zu wissen, wonach eine Prüfungsfrage über "HPC-Lasten, die niedrige Inter-Node-Latenz benötigen" tatsächlich fragte.

## Zusammenfassung

Eine zufällig gestartete Instanz würde niemals ein Produktionsserver werden. EC2 richtig zu verstehen löste nicht nur das Kapazitätsproblem — es führte einen neuen Satz von Konzepten ein, die in nahezu jedem folgenden Kapitel auftauchen würden. Instanztypen, AMIs, Schlüsselpaare, Security Groups und Right-Sizing sind keine EC2-Trivialitäten; sie sind das Vokabular, auf dem der Rest des Buches aufgebaut ist. Lernen Sie sie hier, und alles andere ergibt mehr Sinn.

- Eine **EC2-Instanz** ist eine virtuelle Maschine, die Sie in AWS mieten. Instanztypen sind nach Anwendungsfall organisiert: General Purpose, Compute Optimized, Memory Optimized, Storage Optimized. Wählen Sie die richtige Familie und dimensionieren Sie nach tatsächlichen Last-Metriken — nicht nach dem eingebildeten schlimmsten Fall.
- Ein **AMI** (Amazon Machine Image) ist die Vorlage für das Betriebssystem und die anfängliche Konfiguration Ihrer Instanz. Benutzerdefinierte AMIs ermöglichen konsistente, wiederholbare Deployments.
- **Schlüsselpaare** sind der sichere Weg, auf EC2-Instanzen zuzugreifen. **Security Groups** sind die Firewall Ihrer Instanz — beschränken Sie SSH auf bekannte IPs und sperren Sie Datenbank-Ports nur auf die Security Group der Anwendung.
- **IMDSv2** sollte auf allen Instanzen aktiviert sein, um vor SSRF-basiertem Credential-Diebstahl vom Instanz-Metadatendienst zu schützen.
- EC2-Instanzen sind standardmäßig nicht dauerhaft. Terminierte Instanzen verlieren ihre lokalen Daten — speichern Sie wichtige Daten in S3 oder EBS, nicht auf der Instanzfestplatte.

## Prüfungstipps

*SAA-C03-Domäne 3 — Aufgabe 3.2 (leistungsstarke Compute-Lösungen)*

- **Geteilte Verantwortung für EC2**: Sie sind für das Patchen des Betriebssystems verantwortlich.
  AWS wartet die physische Hardware und den Hypervisor. Das ist eine häufig getestete
  Unterscheidung.
- **Instanzfamilien sind wichtig für Szenariofragen.** Wenn ein Szenario hohe
  Speicheranforderungen erwähnt (In-Memory-Cache, SAP HANA), beinhaltet die Antwort wahrscheinlich eine
  Memory-Optimized-Instanz. Wenn es Batch-Verarbeitung oder HPC erwähnt, Compute-Optimized.
- **Stoppen ≠ Terminieren.** Das Stoppen einer Instanz bewahrt sie (Sie können neu starten).
  Das Terminieren löscht sie. Prüfungsszenarien testen, ob Sie diese Unterscheidung kennen.
- **Öffentliche IP ändert sich beim Neustart.** Wenn Ihre Anwendung eine stabile IP-Adresse braucht,
  verwenden Sie eine **Elastic IP** — eine statische öffentliche IP, die mit Ihrem Konto verbunden bleibt.
  Seit Februar 2024 berechnet AWS jede öffentliche IPv4-Adresse stündlich — Elastic IPs
  (angehängt oder nicht) und automatisch zugewiesene öffentliche IPs gleichermaßen.
- **On-Demand-, Reserved- und Spot**-Preismodelle werden in Domäne 4 stark getestet.
  Wir behandeln sie in Kapitel 27. Wissen Sie vorerst, dass On-Demand bedeutet, sekundengenau zu zahlen
  ohne Verpflichtung.
- **Security Groups sind stateful.** Wenn Sie eingehenden Traffic auf einem Port erlauben, wird der
  Rückverkehr automatisch ohne explizite Outbound-Regel erlaubt. NACLs
  (behandelt in Kapitel 15) sind stateless — sie erfordern sowohl Inbound- als auch Outbound-Regeln.
- **Placement Groups:** Cluster = niedrigste Latenz zwischen Instanzen (HPC, ML-Training — aber Single-Point-of-Failure-Risiko für die Gruppe); Partition = verteilte Systeme (Hadoop, Kafka, Cassandra) mit Fehlerisolation pro Partition; Spread = maximale Instanzisolation, max. 7 pro AZ. Prüfungsfragenmuster: "eng gekoppelte HPC-Last braucht maximalen Netzwerkdurchsatz zwischen Knoten" → Cluster Placement Group.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist eine EC2-Instanz? Was ist ein AMI? Was ist die Beziehung
zwischen ihnen?

*(Hinweis: Denken Sie an die Rezeptanalogie — was ist das Rezept und was ist das Gericht?)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen deployt eine Webanwendung mit hohem Traffic. Die Anwendung
verarbeitet Produktkatalogsuchen mit komplexer Filterlogik, die CPU-intensiv ist.
Das Team erwartet erhebliche Traffic-Spitzen während Verkaufsaktionen. Es möchte sicherstellen,
dass es den richtigen EC2-Instanztyp wählt und auf Traffic-Wellen vorbereitet ist.

Welche Kombination von Wahlen erfüllt seine Anforderungen AM BESTEN?

A) Memory-Optimized-Instanzen mit einer festen Anzahl, um konsistente Leistung zu gewährleisten  
B) Compute-Optimized-Instanzen mit Auto Scaling, um Traffic-Spitzen zu bewältigen  
C) General-Purpose-Instanzen mit einer einzigen großen Instanzgröße  
D) Storage-Optimized-Instanzen, weil der Produktkatalog schnellen Festplattenzugriff erfordert

**Hinweis 1**: Die Last wird als "CPU-intensiv" beschrieben. Welche Instanzfamilie ist
für CPU optimiert?

**Hinweis 2**: Das Szenario erwähnt "Traffic-Spitzen während Verkaufsaktionen". Eine feste Anzahl
von Instanzen wird variablen Traffic nicht effizient bewältigen. Welches AWS-Feature handhabt das?

**Hinweis 3**: Compute-Optimized-Instanzen bewältigen CPU-lastige Arbeit. Auto Scaling fügt
Instanzen basierend auf der Nachfrage hinzu und entfernt sie. Zusammen beantworten sie beide Anforderungen.

**Antwort**: B

**Erklärung**: Compute-Optimized-Instanzen (wie die `c`-Familie) bieten mehr CPU
pro Dollar für CPU-intensive Lasten. Auto Scaling passt die Anzahl
der Instanzen automatisch basierend auf der Last an — fügt Instanzen während Verkaufsaktionen hinzu, entfernt sie, wenn
der Traffic zur Normalität zurückkehrt. Diese Kombination optimiert sowohl Leistung als auch Kosten.

**Warum nicht A?** Memory-Optimized-Instanzen sind für Lasten ausgelegt, die große
Mengen an RAM benötigen (Datenbanken, In-Memory-Caches). Dies ist eine CPU-gebundene Last. Und feste
Instanzanzahlen bedeuten entweder Überprovisionierung (Verschwendung) oder Unterprovisionierung (Ausfall).

**Warum nicht C?** General-Purpose-Instanzen tauschen etwas CPU-Effizienz gegen Ausgewogenheit. Für
eine bekannte CPU-intensive Last ist Compute-Optimized angemessener. Und eine einzige
große Instanz ist ein einzelner Ausfallpunkt.

**Warum nicht D?** Der Engpass ist die CPU, nicht die Festplatten-I/O. Storage-Optimized-Instanzen
sind für Lasten ausgelegt, die sehr hohen Durchsatz zum lokalen Speicher benötigen.

*SAA-C03-Domäne 3 — Aufgabe 3.2*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus betreibt derzeit eine einzige `t3.micro`-EC2-Instanz für die gesamte Anwendung.
Das Team muss entscheiden: auf eine größere Instanz (`t3.2xlarge`) upgraden oder mehr
`t3.micro`-Instanzen hinter einem Load Balancer hinzufügen?

Gehen Sie die Kompromisse durch. Was sind die Vorteile jedes Ansatzes? Welche
Fragen würden Sie stellen, um zu entscheiden? (Hinweis: Denken Sie an einzelne Ausfallpunkte,
Kosten, Deployment-Komplexität und was während der Wartung passiert.)

*(Es gibt keine einzige richtige Antwort. Es geht darum, vertikale vs.
horizontale Skalierung durchzudenken.)*

## Post-Credits-Szene

Leo verbrachte den Nachmittag damit, die Verkleinerung durchzuführen. Er wechselte von der `t3.large` herunter zu einer `t3.small`,
unter Verwendung der Right-Sizing-Daten, die Tom aus CloudWatch gesammelt hatte. Die CPU pendelte sich bei rund
12 % bei normaler Last ein. Seiten luden in unter einer Sekunde.

Tom beobachtete, wie sich die AWS-Rechnung in Echtzeit aktualisierte. Die t3.small kostete pro Stunde immer noch rund doppelt so viel wie die ursprüngliche micro — aber ein Drittel der t3.large, die sie überbezahlt hatten. Er machte eine Notiz: *40 $/Monat gespart vs. vorherige t3.large. Richtige Entscheidung.*

Maya schaute auf etwas anderes auf ihrem Bildschirm.

"Leo", sagte sie. "Während Sie die Instanz neu dimensioniert haben, war die Website zwölf Minuten lang down."

Leo blickte auf.

"Wir hatten eine Schlange von zweihundert unerfüllten Bestellungen."

Er schaute auf den Bildschirm. Dann an die Decke. Dann zurück auf den Bildschirm.

"Wir brauchen etwas für unsere Bilder", sagte er und wechselte das Thema leicht. "Im Moment werden hochgeladene Menüfotos direkt auf dem Server gespeichert. Wenn wir die Instanz neu dimensionieren oder neu starten, verlieren wir sie dann?"

Priya kannte die Antwort bereits.

Im nächsten Kapitel: wo Dateien leben, wenn es keine Festplatte gibt, auf die man zeigen kann.
