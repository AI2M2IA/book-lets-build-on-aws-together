# Kapitel 4: Ein Computer im Gebäude von jemand anderem

Die Nimbus-App lief auf Toms Laptop.

Das war in Ordnung, um Investoren eine Demo zu zeigen. Es war nicht in Ordnung, als Maya auf "Launch" drückte und 200 Restaurants sich in der ersten Woche anmeldeten. Toms Laptop verarbeitete nun echte Bestellungen, echte Menüs und echte Kunden — er stand unter Toms Schreibtisch, lief über das Büro-WLAN und war an eine Steckdosenleiste angeschlossen, die auch eine Heizung und eine Kaffeemaschine mit Strom versorgte.

"Wir brauchen einen Server", sagte Maya. "Einen echten. Der irgendwo läuft, das nicht unter Ihrem Schreibtisch ist."

Tom schaute seinen Laptop an. Das Lüftergeräusch war von der anderen Seite des Raums zu hören.

Das war der Moment, in dem sie begannen, zu untersuchen, was es wirklich bedeutet, einen Computer zu mieten.

**Die Abstraktion, die niemand erklärt**

Wenn Leute sagen, dass ihre Anwendung "in der Cloud läuft", meinen sie normalerweise, dass sie auf einer virtuellen Maschine läuft — einem Computer, der physisch nicht als dedizierte Hardware existiert, aber sich in jeder Hinsicht so verhält als würde er das.

Hier ist der Mechanismus.

Ein physischer Server in einem AWS-Rechenzentrum hat viele Ressourcen: CPU-Kerne, Speicher, Festplatten und Netzwerkbandbreite. AWS teilt diesen physischen Server mithilfe von Software, die als **Hypervisor** bezeichnet wird. Der Hypervisor erstellt mehrere virtuelle Maschinen, von denen jede scheinbar eine eigene dedizierte CPU, Speicher und Festplatten hat — aber tatsächlich die zugrundeliegende physische Hardware gemeinsam nutzt.

Jede dieser virtuellen Maschinen nennt AWS eine **EC2-Instance**.

EC2 steht für Elastic Compute Cloud. Das "Elastisch" ist wichtig, und wir kommen darauf zurück. Vorerst gilt: Eine EC2-Instance ist ein Computer, den Sie stundenweise mieten. Er hat ein Betriebssystem, eine Netzwerkverbindung und Rechenleistung. Er führt Ihre Anwendung genau wie ein physischer Server aus.

Die Analogie: Eine Wohnung in einem großen Gebäude mieten statt ein Haus kaufen.

Der Gebäudebesitzer (AWS) wartet die physische Struktur, die Leitungen, die Elektrik, die Sicherheit. Sie erhalten eine Einheit. Sie richten sie so ein, wie Sie möchten. Sie zahlen monatlich (oder stündlich). Wenn Sie mehr Platz benötigen, wechseln Sie in eine größere Einheit. Wenn Sie ausziehen, hören Sie auf zu zahlen.

**Ihre Instance auswählen: Größe spielt eine Rolle**

Nicht alle EC2-Instances sind gleich. AWS bietet Hunderte von Instance-Typen an, die in Familien
organisiert sind, basierend darauf, wofür sie optimiert sind.

**General Purpose** (z. B. `t3`, `m6i`): Ausgewogene CPU und Speicher. Gute Standardwahl
für die meisten Webanwendungen.

**Compute Optimized** (z. B. `c7g`): Mehr CPU im Verhältnis zu Speicher. Gut für Video-
Encoding, wissenschaftliche Modellierung, Batch-Verarbeitung.

**Memory Optimized** (z. B. `r7i`): Mehr Speicher im Verhältnis zur CPU. Gut für Datenbanken,
Caching, In-Memory-Analysen.

**Storage Optimized** (z. B. `i3`): Hochgeschwindigkeitsspeicher lokal. Gut für
datenintensive Arbeitslasten, die sehr schnelle Festplatten-I/O benötigen.

**Accelerated Computing** (z. B. `p4`): GPUs angehängt. Gut für Machine-Learning-Training
und Grafikrendering.

Jede Familie hat Größen. Eine `t3.micro` hat 2 virtuelle CPUs und 1 GB Speicher. Eine
`t3.xlarge` hat 4 virtuelle CPUs und 16 GB. Sie wählen die richtige Größe für die Arbeitslast.

Leo hatte eine `t3.micro` gewählt.

"Wie viele Nutzer kann eine `t3.micro` verarbeiten?" fragte Tom.

"Hängt von der Anwendung ab", sagte Leo. "Aber wahrscheinlich nicht hundert gleichzeitige Nutzer
mit Bild-Uploads und Datenbankabfragen."

Tom schrieb "t3.micro" auf das Whiteboard und zeichnete ein trauriges Gesicht daneben.

**Das AMI: Der Ausgangszustand Ihrer Maschine**

Bevor Sie eine EC2-Instance starten, wählen Sie ihr Betriebssystem und die Anfangskonfiguration.
In AWS nennt man das ein **Amazon Machine Image** (AMI).

Ein AMI ist eine Vorlage. Es definiert:

- Das Betriebssystem (Amazon Linux, Ubuntu, Windows Server usw.)
- Vorinstallierte Software
- Den anfänglichen Festplattenzustand

Wenn Sie eine Instance von einem AMI starten, erstellt AWS eine neue Kopie dieser Vorlage
genau für Sie. Sie können auch eigene AMIs erstellen — wenn Sie einen Server genau so konfigurieren,
wie Sie ihn möchten, können Sie diesen Zustand als benutzerdefiniertes AMI "speichern" und es
verwenden, um identische Server schnell zu starten. So deployen Sie konsistente Umgebungen im großen Maßstab.

Stellen Sie sich ein AMI als Rezept vor. Das Rezept beschreibt das Gericht. Jedes Mal, wenn Sie
dem Rezept folgen, erhalten Sie dasselbe Gericht. Wenn Sie das Gericht dauerhaft ändern möchten,
aktualisieren Sie das Rezept.

**Key Pairs: Der richtige Weg, auf einen Server zuzugreifen**

Erinnern Sie sich an die "Admin123"-Katastrophe aus dem letzten Kapitel?

Der richtige Weg, sich in eine EC2-Instance einzuloggen, ist mit einem **Key Pair**.

Ein Key Pair ist ein kryptografisches Paar: ein öffentlicher Schlüssel (von AWS auf dem Server
gespeichert) und ein privater Schlüssel (eine Datei, die Sie herunterladen und geheim halten).
Zum Einloggen verwenden Sie SSH — ein sicheres Protokoll — mit Ihrem privaten Schlüssel. Es gibt
kein Passwort. Wenn Sie den privaten Schlüssel verlieren, verlieren Sie den Zugang. Es gibt kein
"Passwort vergessen" für SSH.

Das ist wichtig, weil Key Pairs:

- Einzigartig für Sie sind
- Kryptografisch unmöglich zu erraten sind
- Nicht von AWS gespeichert werden (Sie behalten den privaten Schlüssel)
- Leicht zu widerrufen sind (löschen Sie den Schlüssel vom Server, generieren Sie ein neues Paar)

Priya hatte bereits schlüsselbasierten Zugang auf dem Nimbus-Server eingerichtet. Der Admin123-Server
wurde außer Betrieb gesetzt. Niemand war traurig darüber.

**Instance-Lebenszyklus: Nicht für immer**

Das übersehen viele Anfänger.

EC2-Instances sind standardmäßig nicht permanent. Wenn Sie eine Instance stoppen, wird die Rechenressource freigegeben. Wenn Sie sie erneut starten, kann sie auf anderer physischer Hardware laufen. Alle Daten, die *auf der Instance selbst* gespeichert sind (auf ihrem Root-Volume), überleben einen Stop/Start-Zyklus — aber die öffentliche IP-Adresse ändert sich.

Wenn Sie eine Instance *terminieren*, ist sie weg. Sofern Sie keinen separaten Speicher angehängt haben (den wir in Kapitel 6 behandeln), verschwinden alle Daten auf der Instance.

Diese "Flüchtigkeit" ist tatsächlich ein Feature, kein Fehler. Sie bedeutet, dass Sie Server starten, sie nutzen und wegwerfen können. Sie ermöglicht horizontale Skalierung. Aber sie bedeutet auch, dass Sie wichtige Daten *niemals* auf der EC2-Instance selbst speichern sollten.

Wo leben die Daten dann?

In separatem Speicher. Dazu kommen wir in den nächsten zwei Kapiteln.

**Was "Elastisch" bedeutet**

Wir sagten, EC2 steht für Elastic Compute Cloud. Was ist daran elastisch?

Zwei Dinge:

**Vertikale Elastizität**: Sie können die Größe einer Instance ändern. Stoppen Sie die Instance,
ändern Sie sie von `t3.micro` zu `t3.xlarge`, starten Sie neu. Mehr CPU und Speicher, dieselbe
Anwendung, dasselbe Setup.

**Horizontale Elastizität**: Sie können mehr Instances hinzufügen. Anstatt einem großen Server
betreiben Sie zehn mittlere Server hinter einem Load Balancer. Wenn der Traffic sinkt, entfernen Sie
Instances und hören auf, für sie zu zahlen.

Beide Ansätze lösen das "Ein Server, zu viel Traffic"-Problem. Sie haben unterschiedliche Kompromisse,
die wir in Kapitel 7 untersuchen, wenn wir Auto Scaling zur Geschichte hinzufügen.

Der Kerngedanke: Bei EC2 ist Rechenleistung etwas, das Sie *einstellen*, nicht etwas, das Sie *kaufen*.
Brauchen Sie mehr? Drehen Sie am Regler nach oben. Brauchen Sie weniger? Drehen Sie ihn herunter.
Zahlen Sie entsprechend.

## Stärken und Einschränkungen

**Warum EC2 mächtig ist**:

- Volle Kontrolle. Sie wählen das OS, die Software, die Konfiguration. Es ist Ihr Computer.
- Flexible Größenanpassung. Hunderte von Instance-Typen für jeden Anwendungsfall.
- Keine Hardware zu verwalten. AWS kümmert sich um die physische Schicht.
- Sekundenbasierte Abrechnung (für die meisten Instance-Typen). Sie stoppen die Instance, Sie hören auf zu zahlen.
- Funktioniert mit allem. EC2 ist die Grundlage, auf der die meisten anderen AWS-Dienste aufgebaut sind.

**Wo es kompliziert wird**:

- Sie sind verantwortlich für das Patchen und Aktualisieren des Betriebssystems. (Modell der geteilten Verantwortung — dies ist der "in der Cloud"-Teil, der Ihnen gehört.)
- Die Verwaltung von EC2 im großen Maßstab bedeutet die Verwaltung von Instance-Zuständen, AMIs, Sicherheits-Patches und Lebenszyklen über potenziell Tausende von Maschinen. Das ist betrieblicher Overhead.
- EC2 ist nicht die richtige Antwort für alles. Für ereignisgesteuerten Code, der selten ausgeführt wird, ist Lambda (Kapitel 20) günstiger und einfacher. Für containerisierte Arbeitslasten bieten ECS und EKS (Kapitel 21) bessere Ressourceneffizienz.
- Ungenutzte Instances kosten immer noch Geld. Wenn Sie eine Instance stoppen, hören Sie auf, für Compute zu zahlen — aber wenn Sie Speicher angehängt haben, zahlen Sie immer noch dafür.

## Zusammenfassung

- Eine **EC2-Instance** ist eine virtuelle Maschine, die Sie in AWS mieten. Sie hat ein OS, Netzwerkzugang und Rechenressourcen.
- Instance-Typen sind nach Anwendungsfall organisiert: General Purpose, Compute Optimized,
  Memory Optimized, Storage Optimized, Accelerated Computing. Wählen Sie die richtige Familie
  und Größe für Ihre Arbeitslast.
- Ein **AMI** (Amazon Machine Image) ist die Vorlage für das OS und die Anfangskonfiguration Ihrer Instance. Benutzerdefinierte AMIs ermöglichen konsistente, wiederholbare Deployments.
- **Key Pairs** sind der sichere Weg, auf EC2-Instances zuzugreifen. Keine Passwörter.
- EC2-Instances sind standardmäßig nicht permanent. Terminierte Instances verlieren ihre Daten.
  Speichern Sie wichtige Daten in separaten Speicherdiensten.
- "Elastisch" bedeutet, dass Sie Compute hoch- und herunterskalieren können — sowohl vertikal (größere Instances) als auch horizontal (mehr Instances).

## Prüfungstipps

*SAA-C03-Domäne 3 — Aufgabe 3.2 (hochleistungsfähige Compute-Lösungen)*

- **Geteilte Verantwortung für EC2**: Sie sind verantwortlich für das Patchen des OS.
  AWS wartet die physische Hardware und den Hypervisor. Das ist eine häufig getestete Unterscheidung.
- **Instance-Familien sind wichtig für Szenariofragen.** Wenn ein Szenario hohe Speicheranforderungen
  erwähnt (In-Memory-Cache, SAP HANA), beinhaltet die Antwort wahrscheinlich eine
  Memory-Optimized-Instance. Wenn es Batch-Verarbeitung oder HPC erwähnt, Compute-Optimized.
- **Stoppen ≠ Terminieren.** Das Stoppen einer Instance bewahrt sie (Sie können neu starten).
  Das Terminieren löscht sie. Prüfungsszenarien testen, ob Sie diese Unterscheidung kennen.
- **Öffentliche IP ändert sich beim Neustart.** Wenn Ihre Anwendung eine stabile IP-Adresse benötigt,
  verwenden Sie eine **Elastic IP** — eine statische öffentliche IP, die Ihrem Konto zugeordnet bleibt.
  Das kostet Geld, wenn Sie eine zuweisen und nicht verwenden.
- **On-Demand-, Reserved- und Spot-Preismodelle** werden ausführlich in Domäne 4 getestet.
  Wir behandeln sie in Kapitel 27. Wissen Sie vorerst, dass On-Demand sekundenweises Bezahlen
  ohne Verpflichtung bedeutet.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist eine EC2-Instance? Was ist ein AMI? Was ist die
Beziehung zwischen ihnen?

*(Hinweis: Denken Sie an die Rezeptanalogie — was ist das Rezept und was ist das Gericht?)*

**Übung 2 — Prüfungsübung**

*Szenario*: Ein Unternehmen deployt eine stark besuchte Webanwendung. Die Anwendung verarbeitet
Produktkatalog-Suchen mit komplexer Filterlogik, die CPU-intensiv ist. Das Team erwartet erhebliche
Traffic-Spitzen während Verkaufsveranstaltungen. Es möchte sicherstellen, dass es den richtigen
EC2-Instance-Typ wählt und auf Traffic-Spitzen vorbereitet ist.

Welche Kombination von Entscheidungen erfüllt seine Anforderungen AM BESTEN?

A) Memory-Optimized-Instances mit einer festen Anzahl für konsistente Performance  
B) Compute-Optimized-Instances mit Auto Scaling für Traffic-Spitzen  
C) General-Purpose-Instances mit einer einzigen großen Instance-Größe  
D) Storage-Optimized-Instances, weil der Produktkatalog schnellen Festplattenzugriff erfordert

**Hinweis 1**: Die Arbeitslast wird als "CPU-intensiv" beschrieben. Welche Instance-Familie ist
für CPU optimiert?

**Hinweis 2**: Das Szenario erwähnt "Traffic-Spitzen während Verkaufsveranstaltungen". Eine feste
Anzahl von Instances bewältigt variablen Traffic nicht effizient. Welche AWS-Funktion verarbeitet das?

**Hinweis 3**: Compute-Optimized-Instances bewältigen CPU-intensive Arbeit. Auto Scaling fügt
Instances basierend auf Nachfrage hinzu und entfernt sie. Zusammen beantworten sie beide Anforderungen.

**Antwort**: B

**Erklärung**: Compute-Optimized-Instances (wie die `c`-Familie) bieten mehr CPU pro Euro
für CPU-intensive Arbeitslasten. Auto Scaling passt die Anzahl der Instances automatisch basierend
auf Last an — fügt während Verkaufsveranstaltungen Instances hinzu und entfernt sie, wenn der Traffic
zur Normalität zurückkehrt. Diese Kombination optimiert sowohl Performance als auch Kosten.

**Warum nicht A?** Memory-Optimized-Instances sind für Arbeitslasten ausgelegt, die große Mengen
RAM benötigen (Datenbanken, In-Memory-Caches). Das ist eine CPU-gebundene Arbeitslast. Und eine feste
Instance-Anzahl bedeutet entweder Over-Provisioning (Verschwendung) oder Under-Provisioning (Ausfall).

**Warum nicht C?** General-Purpose-Instances tauschen etwas CPU-Effizienz gegen Balance. Für eine
bekannte CPU-intensive Arbeitslast ist Compute-Optimized angemessener. Und eine einzige große
Instance ist ein Single Point of Failure.

**Warum nicht D?** Der Engpass ist CPU, nicht Festplatten-I/O. Storage-Optimized-Instances sind für
Arbeitslasten ausgelegt, die sehr hohen Durchsatz zu lokalem Speicher benötigen.

*SAA-C03-Domäne 3 — Aufgabe 3.2*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus betreibt derzeit eine einzelne `t3.micro` EC2-Instance für die gesamte Anwendung.
Das Team muss entscheiden: Upgrade auf eine größere Instance (`t3.2xlarge`) oder mehr
`t3.micro`-Instances hinter einem Load Balancer hinzufügen?

Gehen Sie die Kompromisse durch. Was sind die Vorteile jedes Ansatzes? Welche Fragen würden
Sie stellen, um zu entscheiden? (Hinweis: Denken Sie an Single Points of Failure, Kosten,
Deployment-Komplexität und was während der Wartung passiert.)

*(Es gibt keine einzige richtige Antwort. Geht um das Durchdenken von vertikaler vs. horizontaler Skalierung.)*

## Post-Credits-Szene

Leo verbrachte den Nachmittag damit, den Server zu vergrößern. Er wechselte von einer `t3.micro`
zu einer `t3.large`. Die CPU fiel auf 30 %. Seiten luden in unter einer Sekunde.

Tom beobachtete die AWS-Rechnung in Echtzeit. Die neue Instance kostete viermal mehr pro Stunde.
Er machte sich eine Notiz.

Maya schaute auf etwas anderes auf ihrem Bildschirm.

"Leo", sagte sie. "Während Sie die Instance vergrößerten, war die Website zwölf Minuten lang ausgefallen."

Leo schaute auf.

"Wir hatten eine Warteschlange von zweihundert unerfüllten Bestellungen."

Er schaute auf den Bildschirm. Dann zur Decke. Dann wieder auf den Bildschirm.

"Wir brauchen etwas für unsere Bilder", sagte er und wechselte leicht das Thema. "Im Moment werden
hochgeladene Menüfotos direkt auf dem Server gespeichert. Wenn wir die Instance vergrößern oder
neu starten, verlieren wir sie dann?"

Priya kannte bereits die Antwort.

Im nächsten Kapitel: Wo Dateien leben, wenn es keine Festplatte gibt, auf die man zeigen kann.
