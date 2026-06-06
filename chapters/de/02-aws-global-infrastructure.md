# Kapitel 2: Wo auf der Welt ist Ihr Server?

Stehen Sie auf. Gehen Sie zu einem Fenster, wenn eines in der Nähe ist.

Schauen Sie nach draußen. Was auch immer Sie sehen — Gebäude, Bäume, einen Parkplatz, jemandes Hinterhof — nichts davon ist der Ort, an dem Ihre Daten leben. Ihre Daten leben irgendwo ganz anderes. Wahrscheinlich irgendwo, wo Sie noch nie waren.

Das ist kein Problem. Aber zu verstehen *wo* lässt überraschend viele Dinge einrasten.

Nach der Whiteboard-Sitzung war die Entscheidung gefallen: Nimbus würde AWS nutzen. Die Cloud war die Antwort. Aber "die Cloud" erwies sich als eine spezifische Sache an einem spezifischen Ort — und Leo hatte diesen Ort gewählt, ohne es zu beabsichtigen.

Am nächsten Morgen bemerkte Maya, dass der Server in Singapur war.

"Warum Singapur?" fragte sie.

"Es war die Voreinstellung", sagte Leo.

Tom blickte von seinem Kaffee auf. "Wie viel kostet es, einen Server in Singapur zu betreiben, wenn alle unsere Kunden an der Westküste sind?"

Leo hatte keine Antwort.

Priya hatte bereits eine andere Sorge. "Und wer weiß, durch welche Rechtsordnungen diese Daten gehen?"

Dieses Kapitel handelt davon, diese Entscheidung zu korrigieren — und zu verstehen, warum es wichtig ist.

**Das Problem mit "Irgendwo"**

Wenn Sie AWS nutzen, nutzen Sie nicht ein einziges Rechenzentrum. Sie nutzen ein globales Netzwerk von ihnen. AWS hat Infrastruktur in Dutzenden von Ländern.

Das ist ein Feature, nicht nur eine Tatsache. Aber es bedeutet, dass Sie eine Wahl treffen müssen: *Wo* soll Ihre Infrastruktur laufen?

Die Wahl ist aus drei Gründen wichtig:

**Performance.** Je näher Ihre Server Ihren Nutzern sind, desto schneller ist die Antwort. Physik ist nicht verhandelbar. Daten reisen mit ungefähr zwei Dritteln der Lichtgeschwindigkeit durch Glasfaserkabel. Eine Hin- und Rückfahrt von Seattle nach Singapur dauert allein für den Transit etwa 170 Millisekunden — bevor Ihre Anwendung etwas tut. Dieselbe Anfrage von Seattle nach Oregon (`us-west-2`) dauert etwa 20 Millisekunden. Der Unterschied ist kein Rundungsfehler. Für eine Restaurant-Bestell-App, bei der Kunden erwarten, dass sich Seiten sofort anfühlen — und bei der eine einzige Seite mehrere Hin- und Rückfahrten auslöst —, sind 170 ms Basis-Latenz pro Hin- und Rückfahrt der Unterschied zwischen einem schnellen Produkt und einem trägen.

Tom zog sein Telefon heraus, öffnete die Nimbus-App und lud eine Restaurantseite. Er stoppte die Zeit mit einer Stoppuhr-App.

"Fast drei Sekunden", sagte er.

Leo überprüfte die Latenzaufschlüsselung in den Serverprotokollen. Allein die Hin- und Rückfahrt nach Singapur — nichts mit Datenbankabfragen zu tun — fügte ungefähr 170 Millisekunden pro Anfrage hinzu, und die App machte mehrere Hin- und Rückfahrten pro Seite.

"Und wenn wir den Server nach Oregon verlegen?" fragte Tom.

"Zwanzig Millisekunden", sagte Leo. "Vielleicht weniger."

"Wie viel kostet das pro Monat?"

Der Preisunterschied betrug ein paar Prozent. Nicht null, aber nicht die Hauptvariable. Sie verlegten den Server an jenem Nachmittag nach `us-west-2`.

"Ich habe den Monitoring-Agent bereits auf der Singapur-Instanz deployed", sagte Leo, halb zu sich selbst. "Oh." Er hielt inne. "Ich richte ihn stattdessen in Oregon ein."

**Compliance.** Einige Branchen haben Gesetze darüber, wo Daten gespeichert werden dürfen. US-amerikanische Gesundheitsdaten müssen möglicherweise im Land bleiben. Finanzdaten müssen möglicherweise in einer bestimmten Region bleiben. Die Wahl der falschen Region kann rechtliche Probleme verursachen.

Priya hatte das recherchiert, bevor irgendjemand sie darum gebeten hatte.

"DSGVO", sagte sie und blickte beim Standup am nächsten Morgen von ihren Notizen auf. "Wenn Nimbus jemals Kunden in der Europäischen Union bedient — sei es auch nur ein einziger Kunde —, müssen personenbezogene Daten über sie möglicherweise innerhalb der EU bleiben oder in einem Land mit gleichwertigem Schutz. Das ist nicht optional. Das ist Gesetz."

"Wir sind eine Restaurant-Bestell-App", sagte Leo. "In Kalifornien."

"Vorerst", sagte Priya. "Haben wir bedacht, was passiert, wenn wir in achtzehn Monaten nach Europa expandieren und feststellen, dass wir eineinhalb Jahre lang europäische Kundendaten in Oregon gespeichert haben?"

Eine Pause.

"Das würden wir dann korrigieren", sagte Leo.

"Man kann rückwirkende Verstöße gegen die Datenresidenz nicht korrigieren", sagte Priya. "Der Verstoß ist bereits passiert."

Sie war nicht dramatisch. DSGVO-Bußgelder gehen bis zu 4 % des weltweiten Jahresumsatzes. HIPAA-Verstöße im US-Gesundheitswesen können pro Verstoßkategorie und Jahr über 2 Millionen Dollar erreichen. Das sind keine hypothetischen Fälle — sie sind der Grund, warum große Cloud-Entscheidungen von Unternehmen mit der Compliance-Kartierung beginnen, nicht mit der Infrastrukturkonfiguration.

Für Nimbus war die unmittelbare regulatorische Exposition gering: US-Kunden, keine Gesundheitsdaten, keine Finanzdienstleistungen. Aber eine Region für ein Unternehmen zu wählen, das zu wachsen beabsichtigt, bedeutet, mit Blick auf das Wachstum zu wählen.

**Katastrophenresilienz.** Wenn an einem Standort Stromausfall, Erdbeben oder Netzwerkausfall auftreten, soll Ihr System überleben. Die Verteilung der Infrastruktur auf mehrere Standorte schützt vor lokalen Katastrophen.

**Wie AWS seine Infrastruktur organisiert**

AWS gliedert seine globale Infrastruktur in drei verschachtelte Konzepte. Stellen Sie sie sich wie russische Schachtelpuppen vor, von größter zu kleinster: eine große Puppe, die sich öffnet und eine mittlere Puppe enthüllt, die sich öffnet und eine kleine enthüllt. Jede Schicht in der nächsten verschachtelt.

Die äußerste Puppe ist das, was AWS eine **Region** nennt. In einer Region befindet sich eine Gruppe von **Availability Zones**. Und überall auf der Welt verstreut, unabhängig von beiden, sind **Edge Locations**.

Öffnen wir jede einzeln.

**Regionen: Die großen Boxen**

Eine **Region** ist ein geografisches Gebiet, in dem AWS eine Gruppe von Rechenzentren hat. Jede Region ist nach ihrem Standort benannt: `us-west-2` ist Oregon, `us-east-1` ist Northern Virginia, `eu-west-1` ist Irland, `ap-southeast-1` ist Singapur — wo Leos Server sich versteckte.

Es gibt weltweit fast 40 Regionen, und AWS fügt regelmäßig weitere hinzu. Die Liste wächst weiter, während AWS expandiert: Es gibt Regionen in Nordamerika, Südamerika, Europa, dem Nahen Osten, dem asiatisch-pazifischen Raum und Afrika. Jede neue Region wird typischerweise Monate vor ihrer Eröffnung angekündigt, umfasst zum Start mindestens drei Availability Zones und braucht ein paar Jahre, bevor alle AWS-Dienste in ihr verfügbar sind.

Jede Region ist vollständig unabhängig. Daten in `us-west-2` bleiben in `us-west-2`, es sei denn, Sie verschieben sie explizit. Dies ist für Compliance und Resilienz entscheidend — ein größerer Ausfall in einer Region betrifft andere nicht automatisch. Ein Ereignis, das das Stromnetz in Northern Virginia stört, betrifft Oregon nicht. Eine Naturkatastrophe in Irland betrifft Singapur nicht. Die Regionen sind auf der Ebene der physischen Infrastruktur wirklich voneinander isoliert.

Die Unabhängigkeit ist so vollständig, dass selbst die AWS-Managementkonsole langsam laden könnte, wenn eine Region einen größeren Ausfall erlebt — weil die Konsole selbst in der AWS-Infrastruktur läuft. Das ist wissenswert: Während eines echten AWS-Vorfalls fällt es Ihnen möglicherweise schwer, auf die Monitoring-Tools zuzugreifen, die Sie brauchen, genau dann, wenn Sie sie am dringendsten brauchen. Das ist Teil des Grundes, warum erfahrene Teams ihre eigenen Dienste unabhängig von der AWS-Konsole überwachen.

"Also sollten wir `us-west-2` für Nimbus wählen?" fragte Tom.

Ja. Für ein US-amerikanisches Unternehmen, das sich an Westküstenkunden richtet, ja. Geringere Latenz und Ihre Nutzer erhalten schnellere Antworten.

"Wie viel teurer ist das als Singapur?" ergänzte Tom.

Die Preise variieren je nach Region — üblicherweise um einige Prozent. Der Performance- und Compliance-Vorteil der richtigen Region ist den geringen Preisunterschied wert.

**Die Regionsauswahl-Debatte, die Nimbus beinahe falsch gemacht hätte**

Bevor sich das Team auf `us-west-2` festlegte, gab es eine kurze Diskussion darüber, ob `us-east-1` (Northern Virginia) mehr Sinn ergab. Es ist die älteste Region, die größte, diejenige, in der AWS neue Dienste zuerst veröffentlicht. Es ist auch die günstigste Region auf den meisten Preisseiten. Tom gefiel das.

"Aber unsere Nutzer sind in Kalifornien, Oregon und Washington", sagte Maya. "Warum sollten wir unsere Server auf der anderen Seite des Landes betreiben?"

"Günstiger", sagte Tom. "Und mehr Dienste verfügbar."

"Moment — aber *warum* würden wir es so machen?" sagte Maya. "Unsere Nutzer sind an der Westküste. Unsere Server sollten an der Westküste sein. Der Preisunterschied ist wie viel, sechs Prozent? Sieben? Wir würden durch die zusätzliche Latenz mehr an verlorenen Kunden ausgeben, als wir bei den Compute-Rechnungen sparen würden."

Sie hatte recht. Die richtige Region für eine Last ist die Region, die den wichtigsten Nutzern am nächsten ist — es sei denn, Compliance, Dienstverfügbarkeit oder Preisunterschied rechtfertigen den Kompromiss. Für Nimbus tat keines davon das.

Das ist eine Entscheidung, die sich klein anfühlt und es nicht ist. Teams, die `us-east-1` wählen, weil "es die Voreinstellung ist", und dann Westküstennutzer von der Ostküste aus bedienen, lassen echte Performance liegen. Die AWS-Konsole ist aus historischen Gründen auf `us-east-1` voreingestellt. Das ist keine Empfehlung.

**Availability Zones: Die echte Redundanz**

Hier wird es interessant.

Jede Region ist kein einzelnes Rechenzentrum. Es ist eine Gruppe mehrerer, physisch getrennter Rechenzentren, sogenannter **Availability Zones** (oder AZs).

Oregon (`us-west-2`) hat vier Availability Zones: `us-west-2a`, `us-west-2b`, `us-west-2c`, `us-west-2d`. Das sind echte Gebäude, durch bedeutende Entfernungen getrennt — weit genug auseinander, dass ein Feuer, eine Überschwemmung oder ein Stromausfall in einem die anderen nicht beeinträchtigt, aber nah genug, dass das Netzwerk zwischen ihnen extrem schnell ist (einstellige Millisekunden-Latenz).

Wie weit auseinander ist "bedeutende Entfernung"? AWS veröffentlicht keine genauen Koordinaten, aber unabhängige Forscher schätzen, dass AZs innerhalb einer Region typischerweise durch Dutzende von Kilometern getrennt sind — weit genug, um in verschiedenen Stromnetzen und verschiedenen Glasfaserwegen zu liegen, nicht so weit, dass die Lichtgeschwindigkeit zu einem begrenzenden Faktor für synchrone Replikation wird.

Diese Trennung ist absichtlich und wichtig. Wenn zwei AZs dasselbe Umspannwerk teilten, würde ein Ausfall des Umspannwerks beide AZs gleichzeitig lahmlegen — und die Redundanz beseitigen. Die physische Trennung stellt sicher, dass Common-Mode-Ausfälle (die Art, die ein ganzes geografisches Gebiet betrifft) wirklich seltene Ereignisse sind und keine vorhersehbaren Risiken.

Das ist die Architektur, die AWS auf einem Niveau zuverlässig macht, das kein einzelnes Rechenzentrum erreichen kann.

Priya lehnte sich vor. "Wenn wir unsere Anwendung über zwei Availability Zones betreiben und eine ausfällt—"

"Läuft die andere weiter", beendete Maya den Satz.

"Genau."

Leo, der still zugehört hatte: "Ich habe alles in einer AZ deployed."

"Ja", sagte Priya. "Das haben wir bemerkt."

Das Konzept, die Anwendung über mehrere AZs zu verteilen — **Multi-AZ-Deployment** genannt — ist eines der wichtigsten Resilienzmuster in AWS. Wir gehen in Kapitel 18 ausführlich darauf ein. Verstehen Sie vorerst, dass AZs genau dafür existieren.

Eine Feinheit, die es zu wissen lohnt: Die AZ-Namen (`us-west-2a`, `us-west-2b` usw.) sind nicht über AWS-Konten hinweg konsistent. Was in Ihrem Konto als `us-west-2a` erscheint, kann ein anderes physisches Rechenzentrum sein als das, was im Konto eines Kollegen als `us-west-2a` erscheint. AWS randomisiert die Zuordnung, um zu verhindern, dass alle Kunden in dieselbe physische AZ deployen, wenn sie auf "a" voreingestellt sind. Wenn Sie koordinieren müssen, in welcher physischen AZ Sie sich mit einem anderen Konto befinden (etwa für kontenübergreifende Kommunikation mit niedriger Latenz), stellt AWS AZ-IDs bereit — stabile Bezeichner, die über Konten hinweg auf denselben physischen Ort verweisen. Die benannten AZs (`2a`, `2b`) sind kontenrelativ. Die AZ-IDs (`usw2-az1`, `usw2-az2`) sind physisch. Die Prüfung testet diese Unterscheidung gelegentlich.

**Wie ein AZ-Ausfall tatsächlich aussieht**

Das ist nicht abstrakt. Lassen Sie mich einen echten Zeitablauf durchgehen.

Es ist 14:47 Uhr an einem Dienstag. Ein elektrischer Fehler in einem der Transformatoren, die `us-west-2b` mit Strom versorgen, verursacht einen Ausfall in diesem Rechenzentrum. Das Ereignis wird nicht vorhergesagt.

Wenn Nimbus vollständig in `us-west-2b` läuft:
- 14:47 Uhr: Die EC2-Instanz verliert den Strom. Der Datenbankserver verliert den Strom.
- 14:47 Uhr: Eingehende Anfragen an die Nimbus-App beginnen mit Verbindungs-Timeouts zu scheitern.
- 14:47 Uhr: Toms Monitoring-Alarme werden ausgelöst.
- 14:50 Uhr: Leo beginnt den Wiederherstellungsprozess. Er startet eine neue EC2-Instanz in `us-west-2a`.
- 15:05 Uhr: Die Datenbank kommt aus einer Snapshot-Wiederherstellung wieder online.
- 15:12 Uhr: Die Anwendung wird neu konfiguriert, um auf den neuen Datenbank-Endpunkt zu verweisen.
- 15:20 Uhr: Nimbus bedient wieder Traffic.

Das sind 33 Minuten Ausfallzeit. Während des Abendessens am Freitag könnten 33 Minuten Tausende an verlorenen Bestellungen kosten und die Art von Reputationsschaden, die nicht im Vorfallbericht auftaucht.

Wenn Nimbus über `us-west-2a` und `us-west-2b` mit ordentlichem Multi-AZ-Deployment läuft:
- 14:47 Uhr: Die EC2-Instanz in `us-west-2b` verliert den Strom.
- 14:47 Uhr: Der Application Load Balancer erkennt die ungesunde Instanz über Health Checks.
- 14:47 Uhr: Der ALB stoppt automatisch das Routing von Traffic zur ausgefallenen Instanz.
- 14:47 Uhr: Traffic fließt weiterhin zur Instanz in `us-west-2a`.
- 14:48 Uhr: Die Auto Scaling Group startet eine Ersatzinstanz.
- 14:55 Uhr: Der Ersatz besteht die Health Checks und tritt der Flotte wieder bei.

Ausfallzeit: null. Kundenauswirkung: nahezu null. Toms Monitoring wird ausgelöst, aber Leos Aktion ist "beobachten und bestätigen, dass die Wiederherstellung abgeschlossen ist", nicht "alles manuell neu aufbauen".

Das ist der Unterschied zwischen Multi-AZ und Single-AZ. Die AZ-Grenze ist der Punkt, an dem das Redundanzdesign von AWS zur Resilienz Ihrer Anwendung wird.

**Multi-AZ-Zuverlässigkeitsmathematik**

AWS entwirft jede AZ so, dass sie unabhängig ist — nicht nur physisch, sondern mit separatem Strom, Kühlung und Netzwerk. Die Wahrscheinlichkeit, dass zwei AZs in derselben Region gleichzeitig ausfallen, ist so ausgelegt, dass sie extrem gering ist.

Wenn eine einzelne AZ 99,9 % Verfügbarkeit hat (etwa 8,7 Stunden Ausfallzeit pro Jahr), dann hat eine Zwei-AZ-Architektur, die Ausfälle als unabhängige Ereignisse behandelt, für denselben Ausfallmodus ungefähr 99,9999 % Verfügbarkeit — etwa 31 Sekunden Ausfallzeit pro Jahr durch AZ-Ausfälle.

In der Praxis ist der begrenzende Faktor für die meisten Anwendungen nicht die AZ-Verfügbarkeit. Es sind der Anwendungscode, der Deployment-Prozess und die Datenbank. Aber die Mathematik veranschaulicht, warum Multi-AZ der Standard-Ausgangspunkt ist: Die Kosten für den Betrieb über zwei AZs sind moderat; die Verbesserung der Verfügbarkeit ist groß.

**Edge Locations: Geschwindigkeit überall**

AZs lösen Resilienz. Sie lösen nicht das Problem, Inhalte schnell an Nutzer in Städten zu liefern, die weit von Ihrer Hauptregion entfernt sind.

Hier kommen **Edge Locations** ins Spiel.

Edge Locations sind kleine, leichtgewichtige Infrastrukturpunkte — über 750 Points of Presence, verteilt über mehr als 100 Städte weltweit. Es sind keine vollständigen Rechenzentren — sie können Ihre Anwendung nicht ausführen. Was sie *können*, ist das Zwischenspeichern von Inhalten nahe Ihren Nutzern.

Stellen Sie sich ein Menübild vor, das auf einem Server in Virginia gespeichert ist. Jedes Mal, wenn jemand in Tokio es sehen möchte, reist die Anfrage über den Pazifik und zurück. Mit Edge Locations kann AWS eine Kopie dieser Datei in Tokio speichern und sie lokal bereitstellen — Millisekunden statt Hunderte von Millisekunden.

Das ist das Rückgrat von CloudFront, dem Content-Delivery-Netzwerk von AWS. Wir tauchen in Kapitel 13 tief in CloudFront ein. Vorerst gilt: Edge Locations sind für Geschwindigkeit bei statischen Inhalten.

Sie fragen sich vielleicht: Wenn Edge Locations Inhalte zwischenspeichern, speichern sie dann auch Ihre Daten dauerhaft? Nein. Edge Locations halten temporäre Kopien von Inhalten, um sie schneller bereitzustellen — das Original lebt immer in Ihrer Region. Wenn der Cache abläuft oder sich der Inhalt ändert, holt sich die Edge Location eine frische Kopie aus der Quelle.

Das Edge-Location-Netzwerk ist von der Region- und AZ-Struktur getrennt. Wenn Sie darüber nachdenken, wo Ihre Anwendung *läuft*, denken Sie an Regionen und AZs. Wenn Sie darüber nachdenken, wie Inhalte *schnell* zu Ihren Nutzern gelangen, denken Sie an Edge Locations und CloudFront. Sie lösen verschiedene Probleme und operieren auf verschiedenen Ebenen.

AWS hat außerdem ein verwandtes Konzept namens **Regional Edge Caches** — größere Caching-Knoten, die zwischen Ihrer Region und den Edge Locations sitzen. Wenn eine Edge Location in einer Stadt keine zwischengespeicherte Kopie einer Datei hat, holt sie sie aus dem Regional Edge Cache, anstatt den ganzen Weg zurück zu Ihrer Region zu gehen. Das reduziert die Last auf Ihrem Ursprung und verbessert die Cache-Trefferraten für weniger beliebte Inhalte. Sie konfigurieren Regional Edge Caches nicht direkt — sie sind Teil der CloudFront-Infrastruktur, die automatisch arbeitet.

Das praktische Ergebnis für Nimbus: Wenn das Team in Kapitel 13 CloudFront hinzufügt, werden Menübilder, die früher bei jeder Anfrage von Oregon zum Browser eines Kunden reisten, stattdessen von der nächstgelegenen Edge Location bereitgestellt — Dallas für texanische Kunden, Atlanta für Kunden in Georgia, Chicago für Kunden in Illinois. Der Nutzer in Chicago bekommt sein Menübild von einem Server, der 480 Kilometer entfernt ist, statt 3.200 Kilometer. Der Unterschied ist messbar und bedeutsam.

**Ein Vorbehalt zu zwischengespeicherten Kopien**

Es gibt ein Detail zu Edge Locations, das es jetzt zu erwähnen lohnt, auch wenn die vollständige Geschichte zu Kapitel 13 gehört: Eine zwischengespeicherte Kopie ist eine *Kopie*, und Kopien können veralten. Wenn sich das Original in Ihrer Region ändert, bedient die Edge Location möglicherweise eine Weile lang weiterhin die alte Version. Wie lange und was Sie dagegen tun können, sind genau die Art von Kontrollen, die ein CDN Ihnen gibt — und genau das, womit das Team ringen wird, wenn Nimbus tatsächlich CloudFront deployt. Nehmen Sie vorerst nur dies mit: Inhalte können nahe beim Nutzer leben, und "nahe" bedeutet manchmal "leicht veraltet".

**Eine Region auswählen: Die Checkliste des Senior-Ingenieurs**

Wenn Nimbus eines Tages expandiert, um Nutzer in Mexiko und Kolumbien zu bedienen — ein Szenario, das wir in den Übungen dieses Kapitels üben werden —, ist die Regionsentscheidung nicht willkürlich. Hier ist das Denken dahinter:

**1. Wo sind Ihre Nutzer?**

Beginnen Sie hier. Wählen Sie die Region, die den meisten Ihrer Nutzer am nächsten ist. Latenz ist die direkteste, messbare Auswirkung der Regionenwahl.

Die physische Distanz zwischen einem Nutzer und einem Server ist auf eine Weise wichtig, die leicht zu unterschätzen ist. Eine 170-ms-Hin-und-Rückfahrt nach Singapur gegenüber einer 20-ms-Hin-und-Rückfahrt nach Oregon ist keine abstrakte Performance-Kennzahl — es ist der Unterschied zwischen einer Seite, die sich sofort anfühlt, und einer Seite, die sich träge anfühlt. Auf einem Mobilgerät mit zusätzlicher Funklatenz verstärkt sich der Singapur-Nachteil weiter. Für einen Nutzer in San Jose ist `us-west-2` (Oregon) die richtige Region, bevor Sie überhaupt andere Faktoren in Betracht ziehen.

**2. Gibt es Compliance-Anforderungen?**

Gesundheits-, Finanz- und Behördenlasten haben oft strenge Datenhaltungsregeln. Kennen Sie Ihr regulatorisches Umfeld, bevor Sie wählen. Die DSGVO verlangt, dass personenbezogene Daten von EU-Einwohnern in Rechtsordnungen mit angemessenem Datenschutz gespeichert werden — entweder in der EU selbst oder in einem Land mit einem Angemessenheitsbeschluss. HIPAA verlangt dokumentierte Schutzmaßnahmen für US-Gesundheitsdaten. Das sind keine optionalen Überlegungen, die man später wieder aufgreifen kann.

In der Praxis: Sprechen Sie mit Ihrem Rechtsteam, bevor Sie eine Region für eine regulierte Last wählen. AWS unterhält für jede Region umfangreiche Compliance-Dokumentation, einschließlich Zertifizierungen wie SOC 2, ISO 27001, PCI DSS und HIPAA-Eignung. Aber die Zertifizierungen sagen Ihnen, was AWS getan hat; Ihr Rechtsteam sagt Ihnen, ob das für Ihren spezifischen regulatorischen Kontext ausreichend ist.

**3. Welche Dienste benötigen Sie?**

Nicht jeder AWS-Dienst ist in jeder Region verfügbar. Neue Dienste starten zuerst in `us-east-1`. Wenn Sie einen bestimmten Dienst benötigen, prüfen Sie, ob Ihre Zielregion ihn unterstützt.

Das ist für die Dienste in diesem Buch weniger eine Sorge — alle wichtigen Dienste sind breit verfügbar —, aber es ist wichtig für neuere Dienste, spezialisierte Hardware (einige GPU-Instanztypen existieren nur in bestimmten Regionen) und AWS GovCloud (eine separate Region, die für US-Behördenlasten mit spezifischen regulatorischen Anforderungen ausgelegt ist).

**4. Wie sind die Preise?**

Regionen variieren im Preis. `us-east-1` (Northern Virginia) ist aufgrund seines Maßstabs und Alters tendenziell am günstigsten. Südamerika ist etwas teurer. Überprüfen Sie die AWS-Preisseite vor der endgültigen Entscheidung.

Der Preisunterschied ist üblicherweise gering — einige bis zehn Prozent zwischen beliebten Regionen. Er ist selten der entscheidende Faktor. Aber für eine kostensensible Last, die Tausende von Instanzen betreibt, summiert sich selbst ein Preisunterschied von 5 % über die Zeit. Tom würde die Zahl prüfen und sie einbeziehen, so wie Tom alle Zahlen prüfte und einbezog.

**5. Benötigen Sie Multi-Region?**

Für die meisten Anwendungen reichen mehrere AZs innerhalb einer Region für ausreichende Resilienz. Für kritische Anwendungen, bei denen sogar ein regionaler Ausfall nicht akzeptabel ist, entwerfen Sie für Multi-Region — aber das ist ein erhebliches architektonisches Engagement. Tun Sie es nicht spekulativ.

"Was ist die Regel dafür, wann wir eine zweite Region hinzufügen?" fragte Leo.

"Wenn wir eine dokumentierte Anforderung haben, die besagt 'muss betriebsbereit bleiben, wenn eine ganze AWS-Region nicht verfügbar ist'", sagte Priya. "Nicht 'es wäre schön'. Eine spezifische Anforderung, mit einer spezifischen geschäftlichen Begründung, die wir gegen die Komplexität und die Kosten abgewogen haben."

"Wie sieht das in der Praxis aus?"

"Ein Kundenvertrag mit einem SLA, das 99,99 % Betriebszeit erfordert. Ein regulatorisches Mandat für geografische Redundanz. Ein Szenario des Regionsverlusts, das wir tatsächlich in Umsatzgrößen quantifizieren können. Nicht nur 'was, wenn us-west-2 ausfällt'."

Leo betrachtete die aktuelle Nimbus-Architektur. Sie waren immer noch auf einer AZ.

"Multi-AZ zuerst", sagte er.

"Multi-AZ zuerst", bestätigte Priya.

**Die Einschränkung, über die niemand spricht**

Regionen sind mächtig, aber sie erzeugen eine wichtige Spannung.

In mehreren Regionen zu betreiben ist wirklich schwierig.

Die Datenreplikation zwischen Regionen hat Latenz. Zwei Regionen synchron zu halten — sodass eine Transaktion in Region A sofort in Region B sichtbar ist — ist eines der schwierigsten Probleme in verteilten Systemen. AWS bietet Werkzeuge dafür, aber es kostet Geld und erhöht die betriebliche Komplexität.

Die meisten Anwendungen sollten mit einer Region, mehreren AZs beginnen und nur dann auf Multi-Region expandieren, wenn sie einen klaren Bedarf haben: regulatorische Mandate, vertragliche SLAs, die nahezu null regionalen Ausfallzeiten erfordern, oder eine Nutzerbasis, die tatsächlich über Kontinente verteilt ist.

Das Replizieren von Daten über Regionen hinweg verursacht Kosten — der regionsübergreifende Datentransfer ist einer der am häufigsten unterschätzten Posten in einer AWS-Rechnung. Es erhöht auch die betriebliche Komplexität: Jeder Schreibvorgang, der über Regionen hinweg konsistent sein muss, erhöht die Latenz.

Die meisten Ausfälle, die echte Anwendungen betreffen, sind keine regionsübergreifenden Katastrophen. Es sind Probleme innerhalb einer Region wie eine falsch konfigurierte Security Group oder ein misslungenes Deployment. Das dramatische Szenario "die ganze Region fällt aus" macht genau deshalb Schlagzeilen, weil es selten ist. Investieren Sie in Multi-AZ vor Multi-Region. Fügen Sie Multi-Region hinzu, wenn der Business Case klar ist.

Um konkrete Zahlen zu nennen: AWS hatte im Laufe seiner Geschichte eine kleine Anzahl bedeutender Einzelregionsereignisse. Vollständige regionale Ausfälle sind wirklich ungewöhnlich. AZ-Ebene-Ereignisse — kurze Ausfälle, die ein Rechenzentrum innerhalb einer Region betreffen — sind weniger selten und sind genau das, was Multi-AZ-Deployment absorbieren soll. Die Häufigkeit von AZ-Ereignissen im Vergleich zu regionalen Ereignissen ist ungefähr eine Größenordnung höher. Architektonischen Aufwand zuerst auf den häufigeren Ausfallmodus zu verwenden, ist die rationale Wahl.

Vorzeitige Multi-Region-Architektur ist einer der häufigsten und teuersten Fehler, die Junior-Ingenieure machen, wenn sie anfangen, selbstbewusst zu werden.

Tom nickte. "Also machen wir kein Multi-Region, nur weil wir können."

"Nicht bis wir es müssen", sagte Maya. "Und wir werden wissen, wann wir es müssen."

"Woher werden wir das wissen?" fragte Leo.

"Wenn Ihr Architekturdokument eine Anforderung hat, die besagt 'muss einen regionalen Ausfall überleben'", sagte Priya. "Haben wir bedacht, was passiert, wenn eine ganze AZ ausfällt, bevor wir überhaupt Multi-AZ eingerichtet haben? Das sollten wir zuerst korrigieren. Bis dahin: Multi-AZ."

Sie fragen sich vielleicht: Wie überprüfen Sie, dass Ihr Multi-AZ-Deployment tatsächlich funktioniert, bevor Sie es brauchen? Sie testen es. AWS bietet ein Werkzeug namens **AWS Fault Injection Service (FIS)** — früher Fault Injection Simulator —, das AZ-Ausfälle, Instanzterminierungen und andere Fehlerbedingungen gegen Ihre laufende Architektur simulieren kann — sodass Sie auf kontrollierte Weise beobachten können, wie sich Ihr System unter Ausfallbedingungen verhält, anstatt das Verhalten während eines tatsächlichen Vorfalls zu entdecken. Ihre Resilienzarchitektur zu testen ist genauso wichtig wie sie zu bauen. Priya setzte "Fault-Injection-Test" in den vierteljährlichen Architektur-Review-Kalender, unmittelbar nachdem sie davon gelesen hatte.

## Wenn AWS zu Ihnen kommt: Outposts und Wavelength

Regionen und Availability Zones decken die Welt ab — aber nicht jedes Problem wird gelöst, indem man Daten zu AWS verschiebt. Einige Lasten müssen On-Premises bleiben: Systeme in Fertigungshallen, die Latenzen von unter einer Millisekunde benötigen, Gesundheitsanwendungen mit Datenresidenz-Anforderungen, Point-of-Sale-Systeme im Einzelhandel in Geschäften ohne zuverlässiges Internet. Für diese erweitert AWS seine Infrastruktur auf den Standort des Kunden.

"Moment — was, wenn wir irgendwann mit einem Krankenhaussystem arbeiten?" fragte Priya. "Ihre Patientenüberwachungssoftware kann eine Cloud-Hin-und-Rückfahrt buchstäblich nicht tolerieren. Und sie darf das Gebäude möglicherweise rechtlich nicht verlassen."

Maya rief die AWS-Dokumentation auf. Zwei Dienste tauchten immer wieder auf.

**AWS Outposts**

Ein vollständig verwaltetes Rack aus AWS-Hardware, installiert in Ihrem eigenen Rechenzentrum oder Ihrer Co-Location-Einrichtung. Outposts betreibt dieselbe AWS-Infrastruktur, dieselben Dienste, APIs und Tools wie die AWS-Cloud — EC2, EBS, RDS, EKS, S3 on Outposts — aber physisch in Ihrem Gebäude.

Anwendungsfälle: latenzsensible Fertigungslasten, Datenresidenz-Anforderungen, bei denen Daten physisch an einem bestimmten Ort bleiben müssen, Anwendungen, die AWS-APIs benötigen, aber keine Konnektivitätslücken zur öffentlichen Cloud tolerieren können.

Kernpunkt: Outposts wird weiterhin von AWS verwaltet. AWS installiert es, patcht es und überwacht es. Sie besitzen den Rack-Platz und den Strom. Die APIs und Tools sind identisch mit der öffentlichen Cloud — dieselben CloudFormation-Templates, dieselben IAM-Richtlinien, dieselben CLI-Befehle. Die Unterscheidung in der Prüfung ist der physische Standort, nicht das Betriebsmodell.

"Es ist also AWS, aber im Gebäude unseres Kunden", sagte Leo.

"Genau", sagte Maya. "Dieselben APIs. Andere Postleitzahl."

**AWS Wavelength**

AWS-Infrastruktur, die innerhalb der 5G-Netzwerke von Telekommunikationsanbietern bereitgestellt wird. Wavelength Zones sitzen am Rand von 5G-Netzwerken, physisch nahe bei mobilen Nutzern, und ermöglichen einstellige Millisekunden-Latenz für mobile Anwendungen.

Anwendungsfälle: Echtzeit-Gaming, AR/VR, Telemetrie autonomer Fahrzeuge, Live-Videoverarbeitung am 5G-Rand.

"Das ist nicht für ein Krankenhaus", sagte Tom. "Das ist für jemanden, der die nächste Generation von Mehrspieler-Mobilspielen baut."

"Oder Telemetrie für selbstfahrende Autos", sagte Priya. "Alles, wo ein Mobilgerät mit einem Server sprechen muss und 50 Millisekunden zu langsam sind."

**Der Unterschied:** Outposts bringt AWS in Ihr Rechenzentrum — Ihr Gebäude, Ihr Rack, Ihr Strom. Wavelength bringt AWS an den Rand des Telekommunikationsnetzwerks — physisch gemeinsam mit der 5G-Funkinfrastruktur untergebracht, nahe bei mobilen Nutzern, die nie Ihr privates Netzwerk berühren.

**AWS Local Zones**

Es gibt einen dritten Geschwister in dieser Familie — und in der Prüfung ist es der am häufigsten geprüfte der drei. **Local Zones** sind AWS-Infrastruktur, die in großen Ballungsräumen bereitgestellt wird, die keine vollständige Region haben — Los Angeles, Houston, Miami, Lagos und Dutzende mehr. Eine Local Zone ist eine Erweiterung einer übergeordneten Region: Sie betreiben EC2, EBS und eine Teilmenge anderer Dienste *im Ballungsraum selbst* und erhalten einstellige Millisekunden-Latenz zu Nutzern in dieser Stadt, während alles andere (und die gesamte Verwaltung) in der übergeordneten Region bleibt.

Das Muster, das man sich merken sollte — drei "Edge-Compute"-Geschwister, drei Auslöser:

- "Einstellige Millisekunden-Latenz zu Endnutzern **in einer bestimmten Stadt/einem bestimmten Ballungsraum**" → **Local Zones**
- "Ultra-niedrige Latenz für **5G-Mobilgeräte**" → **Wavelength**
- "AWS-Dienste, die **in unserem eigenen Rechenzentrum** laufen / Daten müssen On-Premises bleiben" → **Outposts**

Keiner der drei ist die Antwort für eine typische Webanwendung. Alle erscheinen in der SAA-C03-Prüfung als Pattern-Matching-Fallen: Die Auslöserphrase ist entscheidend.

## Stärken und Einschränkungen

**Verwenden Sie Multi-Region- und Multi-AZ-Design, wenn**: Ihre Anwendung Nutzer in mehreren Geografien hat und Latenz wichtig ist; Ihr SLA eine Verfügbarkeit von 99,99 % oder höher erfordert; regulatorische Anforderungen die Datenhaltung in bestimmten Regionen vorschreiben; Sie eine Notfallwiederherstellung mit einem RTO unter einer Stunde benötigen.

**Die Kompromisse sind real**: Das Betreiben in mehreren Regionen gibt Ihnen Redundanz gegen regionale Ausfälle — aber zu erheblichen Kosten und mit erheblicher Komplexität.

Erinnern Sie sich an die Kostenwarnung von früher in diesem Kapitel: Jedes Byte, das sich zwischen Regionen bewegt, kostet Geld. In einem aktiv-aktiven Multi-Region-Setup, in dem Schreibvorgänge konsistent sein müssen, zahlen Sie diese Kosten ständig.

Die betriebliche Komplexität skaliert ebenfalls. Das Debuggen eines Vorfalls in einer Region ist schwierig. Das Debuggen eines verteilten, regionsübergreifenden Vorfalls — bei dem dieselbe Anfrage Infrastruktur auf zwei Kontinenten berührt hat — ist eine völlig andere Art von schwierig.

**Die richtige Abfolge für die meisten Anwendungen**: Beginnen Sie mit einer einzigen Region und mehreren AZs. Das gibt Ihnen Resilienz gegen die Ausfälle, die tatsächlich passieren — AZ-Ebene-Ausfälle, Hardware-Ausfälle, Stromereignisse — zu einem Bruchteil der Komplexität einer Multi-Region-Architektur. Fügen Sie Multi-Region hinzu, wenn eine spezifische, dokumentierte Anforderung es notwendig macht. Nicht vorher.

Das gängige Muster für Teams, die zu früh zu Multi-Region springen: Die Komplexität der Verwaltung zweier Regionen führt eigene Ausfallmodi ein — Datensynchronisationsfehler, Split-Brain-Szenarien, inkonsistente Deployments. Genau die Resilienzarchitektur, die Ausfälle verhindern soll, führt manchmal neue Kategorien von Ausfällen ein, die in einem einfacheren Design nicht existiert hätten.

Priya hatte ein Dokument, das sie "das Komplexitätsbudget" nannte. Die Idee: Jede architektonische Entscheidung, die betriebliche Komplexität hinzufügt, hat einen Preis, und die Organisation hat eine endliche Kapazität, diese Komplexität zu verwalten. Das Komplexitätsbudget für eine Multi-Region-Architektur auszugeben, bevor man die Zuverlässigkeit einer einzelnen Region gemeistert hat, ist eine schlechte Investition. Die Komplexität sollte in die Ausfallmodi fließen, denen man tatsächlich gegenübersteht, nicht in die, die gute Geschichten zur Notfallwiederherstellung abgeben.

"Wir haben eine Region, eine AZ und einen Deployment-Prozess, der Leo jedes Mal nervös macht, wenn er ihn ausführt", sagte Priya. "Der richtige nächste Schritt ist Multi-AZ, nicht Multi-Region."

Tom schrieb "Komplexitätsbudget" in sein Notizbuch. Er würde diese Formulierung in den nächsten zwei Jahren regelmäßig verwenden.

## Zusammenfassung

Leos Singapur-Unfall erwies sich als nützliche Lektion — nicht weil er bleibenden Schaden verursachte, sondern weil er das Team zwang, etwas zu verstehen, das normalerweise übersprungen wird: Wo Ihre Infrastruktur läuft, ist keine kosmetische Entscheidung. Physik ist nicht verhandelbar. Hundertsiebzig Millisekunden Basis-Latenz pro Hin- und Rückfahrt sind der Unterschied zwischen einem schnellen Produkt und einem trägen, und Compliance-Regeln darüber, wo Daten leben, kümmert es nicht, wie schnell Sie umgezogen sind.

- AWS organisiert seine globale Infrastruktur in **Regionen**, **Availability Zones** und **Edge Locations**.
- Eine **Region** ist eine geografische Gruppe von Rechenzentren. Jede Region ist isoliert — Daten bleiben in der Region, es sei denn, Sie verschieben sie explizit.
- **Availability Zones** sind physisch getrennte Rechenzentren innerhalb einer Region, verbunden durch Netzwerke mit niedriger Latenz. Der Betrieb über mehrere AZs ist der Standardweg, lokale Ausfälle zu überleben.
- Wählen Sie Ihre Region basierend auf Nutzerstandort, Compliance-Anforderungen, Dienstverfügbarkeit und Preis — in dieser Reihenfolge.
- Multi-AZ ist der Standard-Resilienz-Ausgangspunkt. Multi-Region ist für kritische Lasten mit spezifischen, dokumentierten Anforderungen — kein Standardausgangspunkt.

## Prüfungstipps

*SAA-C03-Domäne 1 — Aufgabe 1.1 / Domäne 2 — Aufgabe 2.2*

- **Regionen sind standardmäßig isoliert.** Daten werden nicht zwischen Regionen repliziert, es sei denn,
  Sie konfigurieren es. Dies ist wichtig für Datensouveränität und Compliance-Szenarien.
- **AZs sind die Resilienzeinheit für die meisten Fragen.** Wenn die Prüfung fragt, wie man einen
  Rechenzentrumausfall überlebt, beinhaltet die Antwort mehrere AZs innerhalb einer Region.
- **Multi-Region ist für regionale Ausfall-Resilienz.** Wenn das Szenario sagt "muss auch bei einem
  vollständigen AWS-Regionsausfall betriebsbereit bleiben", beinhaltet die Antwort Multi-Region-Architektur.
- **Edge Locations ≠ AZs.** Edge Locations speichern Inhalte zwischen — sie können Ihren
  Anwendungsserver nicht ausführen. Verwechseln Sie sie nicht mit Rechenzentren.
- Die Prüfung testet häufig die Beziehung zwischen Compliance und Regionenwahl.
  Wenn ein Szenario Datenhaltungsanforderungen erwähnt, ist die Regionenwahl Teil der Antwort.
- **DSGVO- und Datenresidenz**-Szenarien in der Prüfung weisen typischerweise darauf hin, Daten innerhalb einer bestimmten Region zu halten und sicherzustellen, dass die regionsübergreifende Replikation deaktiviert oder kontrolliert ist.
- **Outposts vs. Wavelength vs. Local Zones:** Outposts = AWS-Rack in Ihrem Rechenzentrum (On-Premises, Datenresidenz, lokale Latenz). Wavelength = AWS am 5G-Netzwerkrand (mobile Nutzer, ultra-niedrige Latenz). Local Zones = AWS-Compute in einem Ballungsraum ohne vollständige Region. Prüfungsauslöser: "AWS in der eigenen Einrichtung betreiben" → Outposts. "Ultra-niedrige Latenz für 5G-Mobilnutzer" → Wavelength. "Einstellige Millisekunden-Latenz zu Nutzern in einer bestimmten Stadt" → Local Zones.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist der Unterschied zwischen einer Region und einer Availability Zone?
Warum ist diese Unterscheidung beim Design einer resilienten Webanwendung wichtig?

*(Hinweis: Denken Sie an die zwei verschiedenen Arten von Ausfällen, gegen die jede schützt.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein US-amerikanisches Gesundheitsunternehmen muss alle Patientendaten innerhalb einer einzigen
AWS-Region speichern, um internen Datenhaltungsrichtlinien zu entsprechen. Es entwirft eine neue
Cloud-Anwendung an der Westküste und möchte maximale Resilienz ohne Datenverlagerung in eine andere
Region.

Welche Konfiguration erfüllt seine Anforderungen AM BESTEN?

A) In `us-east-1` deployen und CloudFront Edge Locations in Oregon nutzen, um Inhalte
   schneller bereitzustellen  
B) In `us-west-2` in einer einzigen Availability Zone deployen, um Kosten zu minimieren  
C) In mehreren Regionen einschließlich `us-west-2` und `us-east-1` mit regionsübergreifender
   Datenreplikation deployen  
D) In `us-west-2` (Oregon) über mehrere Availability Zones hinweg deployen

**Hinweis 1**: Die Richtlinie bedeutet, dass Daten in einer einzigen Region bleiben müssen. Welche
Optionen verschieben Daten in eine andere Region?

**Hinweis 2**: Unter den Optionen, die Daten in `us-west-2` halten, welche bietet die meiste Resilienz?

**Hinweis 3**: Mehrere AZs innerhalb einer einzigen Region bieten Resilienz, ohne Regionsgrenzen zu überschreiten.

**Antwort**: D

**Erklärung**: `us-west-2` hält alle Daten in einer einzigen Region und erfüllt die Richtlinienanforderung.
Das Deployen über mehrere AZs innerhalb dieser Region schützt vor Rechenzentrumsausfällen,
ohne Daten in eine andere Region zu verschieben. Das ist die richtige Balance aus Compliance und Resilienz.

**Warum nicht A?** Option A deployt in `us-east-1`, weit entfernt von den Westküstennutzern — und
CloudFront würde patientennahe Inhalte an Edge Locations außerhalb der gewählten Region
zwischenspeichern und damit die Datenhaltungsrichtlinie verletzen.

**Warum nicht B?** Eine einzige AZ hat keine Resilienz. Wenn diese AZ einen Ausfall erlebt,
fällt die Anwendung vollständig aus.

**Warum nicht C?** Die Replikation nach `us-east-1` verschiebt Patientendaten an die Ostküste
und verletzt direkt die Single-Region-Anforderung.

*SAA-C03-Domäne 1 — Aufgabe 1.1 (globale Infrastruktur, Datensouveränität)*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus expandiert, um Kunden in Mexiko und Kolumbien zu bedienen. Derzeit läuft alles in `us-west-2`.
Das Team debattiert: Sollen sie eine zweite Region `us-east-1` hinzufügen oder bei einer einzigen
Region mit mehreren AZs bleiben?

Welche Fragen würden Sie stellen, bevor Sie entscheiden? Was sind die Hauptkosten und Risiken,
eine zweite Region hinzuzufügen? Was sind die Hauptkosten, wenn man *keine* hinzufügt?

*(Es gibt keine einzige richtige Antwort. Üben Sie das Multi-Region-Kompromissdenken.)*

## Post-Credits-Szene

Leo behob das Singapur-Problem. Nimbus wechselte zu `us-west-2`. Die Latenz sank.
Toms einzige Nachfolgefrage — "hat das unsere Rechnung verändert?" — wurde mit einer
etwas höheren Zahl beantwortet, die er mit sichtbarem Widerwillen akzeptierte.

Das hielt zwei Tage, bevor das nächste Problem auftrat.

Leo kam zum Standup mit dem Ausdruck, den Maya gelernt hatte zu erkennen: der Blick von jemandem,
der etwas getan hatte, was er nicht rückgängig machen konnte.

"Also", sagte er vorsichtig. "Ich habe den Server eingerichtet. Und ich brauchte eine Möglichkeit,
mich einzuloggen. Also habe ich einen Benutzernamen erstellt."

"Und?" fragte Priya.

"'Admin'."

Stille.

"Und das Passwort?"

Eine längere Stille.

"'Admin123'."

Priya stand auf.

Im nächsten Kapitel: Wie Nimbus kontrolliert, wer was anfassen kann — und was passiert, wenn sie es falsch machen.
