# Kapitel 6: Die Festplatte, die einem folgt

Tom hatte einen roten Stift und eine Angewohnheit, die Leo nervös machte.

Jeden Samstagmorgen setzte er sich mit einem Kaffee hin und druckte etwas aus. Keine E-Mail. Keine Berichte. Er druckte die Liste dessen, was Nimbus betrieb, und las sie wie ein Hauptbuch, Zeile für Zeile, den Stift in der Hand. Er tat dies seit Woche zwei. Das Geräusch des aufwärmenden Druckers war Teil des Wochenendes geworden.

Leo nannte es "die Sache, die Tom tut, die Leo das Gefühl gibt, etwas falsch gemacht zu haben".

An diesem Samstag kreiste Tom etwas ein und hinterließ den Ausdruck ohne ein Wort auf Mayas Schreibtisch.

Sie fand ihn Montagmorgen. Ein Kreis. Eine Notiz am Rand, drei Wörter:

*Alles. Eine Maschine.*

Die Fotos waren jetzt sicher in S3 — dieses Problem war gelöst. Aber die Datenbank lag noch auf derselben EC2-Instanz wie der Webserver. Bestellhistorie, Kundendatensätze, zwei Monate Transaktionen. Die Anwendung und alles darunter, die sich eine einzige virtuelle Festplatte teilten.

"Was passiert mit der Datenbank, wenn die Instanz abstürzt?" fragte Maya, den Ausdruck in der Hand.

"Sie stürzt auch ab", sagte Leo.

"Und die Daten?"

"Das hängt davon ab, wie die Datenbank sie speichert."

Dieses "hängt davon ab" war das Problem.

**Wie EC2-Instanzen Daten speichern**

Wenn eine EC2-Instanz läuft, lebt ihr Betriebssystem irgendwo auf einer Festplatte. Diese Festplatte wird als **Root-Volume** bezeichnet. Standardmäßig ist dies ein **EBS-Volume** — auch wenn Sie nicht darüber nachdenken.

Aber es gibt noch etwas: EC2-Instanzen haben auch **Instance Store**-Speicher.

Instance Store ist temporärer Speicher, der physisch an die zugrunde liegende Hardware angehängt ist, die Ihre virtuelle Maschine betreibt. Er ist extrem schnell — schneller als fast jede andere Speicheroption in AWS. Aber er hat einen Haken.

Instance Store ist **vergänglich**.

Wenn die Instanz gestoppt oder terminiert wird, sind die Instance-Store-Daten weg. Dauerhaft. Nicht wiederherstellbar. AWS warnt Sie nicht sehr laut davor, was die Art ist, wie Teams es entdecken: indem sie Daten verlieren.

Instance Store ist angemessen für Caches, temporäre Verarbeitungsdateien und Arbeitsbereich. Niemals für Daten, die Ihnen wichtig sind.

**EBS: Die persistente Festplatte**

Stellen Sie sich eine externe Festplatte vor, die Sie in Ihre EC2-Instanz einstecken können — eine, die nicht verschwindet, wenn Sie sie ausstecken, und die Sie an eine andere Maschine verschieben können, wenn Sie müssen. AWS nennt das **EBS**: Elastic Block Store.

EBS ist persistenter Blockspeicher für EC2-Instanzen.

Blockspeicher bedeutet, dass er sich wie eine echte Festplatte verhält: Ihr Betriebssystem kann Dateisysteme darauf erstellen, beliebige Bytes an beliebigen Positionen lesen und schreiben, Datenbanken darauf betreiben und ihn genau wie eine angehängte Festplatte behandeln.

Die Schlüsseleigenschaften:

**Persistent.** Anders als Instance Store überstehen EBS-Volumes das Stoppen, Starten und sogar die Terminierung von Instanzen (je nach Konfiguration). Die Daten bleiben auf dem Volume, auch wenn keine Instanz es verwendet.

Es gibt hier eine Konfigurationsnuance: Wenn Sie eine EC2-Instanz erstellen, hat das Root-Volume eine Einstellung namens "Delete on Termination". Standardmäßig ist dies auf true gesetzt — das Root-Volume wird gelöscht, wenn die Instanz terminiert wird. Für zusätzliche Daten-Volumes, die Sie anhängen, ist die Voreinstellung false — sie bestehen nach der Terminierung der Instanz fort. Sie können beide Einstellungen ändern. Wenn Sie möchten, dass das Root-Volume die Terminierung der Instanz überlebt (für forensische Analyse oder Datenwiederherstellung), deaktivieren Sie "Delete on Termination". Wenn Sie möchten, dass Daten-Volumes automatisch bereinigt werden, aktivieren Sie es.

**Anhängbar und abtrennbar.** Ein EBS-Volume kann von einer Instanz abgetrennt und an eine andere angehängt werden. Wenn Sie Daten migrieren oder von einer ausgefallenen Instanz wiederherstellen müssen, können Sie das Volume abtrennen und anderswo wieder anhängen.

Der Abtrenn-und-Wieder-Anhäng-Workflow ist langsamer als eine Snapshot-Wiederherstellung, bewahrt aber den exakten Zustand des Volumes — alle nicht festgeschriebenen Schreibvorgänge, alle zwischengespeicherten Daten, den exakten Dateisystemzustand. Das macht ihn nützlich für forensische Analyse (das Volume an eine Analyse-Instanz anhängen, ohne das ursprüngliche System zu booten) und für Datenmigration (ein Datenbank-Volume an eine größere Instanz verschieben, ohne einen Snapshot zu erstellen).

**Einzelne Anbindung (meistens).** Standardmäßig ist ein EBS-Volume zu einem Zeitpunkt an genau eine EC2-Instanz angehängt. Eine einzelne Instanz kann mehrere EBS-Volumes haben, aber ein einzelnes EBS-Volume kann nicht von mehreren Instanzen gleichzeitig eingehängt werden (mit einer Ausnahme: EBS Multi-Attach, das begrenzte Anwendungsfälle und wichtige Einschränkungen hat).

EBS Multi-Attach erlaubt es, io1/io2-Volumes (Provisioned IOPS) gleichzeitig an mehrere Instanzen in derselben AZ anzuhängen. Das klingt, als würde es das Problem des "gemeinsamen Speichers" lösen, aber es kommt mit ernsten Einschränkungen: Die Anwendungen auf den angehängten Instanzen müssen gleichzeitigen Zugriff koordinieren können — Semantik eines gemeinsamen Dateisystems (Sperrenverwaltung, Schreibreihenfolge) wird von EBS nicht bereitgestellt. In der Praxis wird EBS Multi-Attach für geclusterte Datenbankanwendungen verwendet, die die Koordination selbst handhaben. Für allgemeinen gemeinsamen Dateizugriff ist EFS einfacher und angemessener.

Die EBS-Analogie: eine externe Festplatte, die in einen Laptop eingesteckt ist. Der Laptop (EC2-Instanz) kann von ihr lesen und auf sie schreiben. Wenn Sie fertig sind, können Sie sie ausstecken und in einen anderen Laptop einstecken.

**EBS-Volume-Typen**

Nicht alle EBS-Volumes sind gleich. AWS bietet mehrere Typen mit unterschiedlichen Leistungs- und Kostenprofilen an.

**gp3 (General Purpose SSD)**: Die Standardwahl für die meisten Lasten. Gute Balance aus Leistung und Preis. Geeignet für Boot-Volumes, kleine Datenbanken und Entwicklungsumgebungen.

Bevor gp3 zur Voreinstellung wurde, gab es **gp2** — und Sie werden ihm in freier Wildbahn noch begegnen. gp2-Volumes binden ihre IOPS-Leistung direkt an die Volume-Größe: Sie erhalten 3 IOPS pro Gigabyte, bis zu einem Maximum von 16.000 IOPS (was ein 5.334-GB-Volume erfordert). Der Durchsatz ist auf 250 MB/s begrenzt. Diese Kopplung bedeutet, dass bei gp2 der einzige Weg, mehr IOPS zu erhalten, darin besteht, das Volume größer zu machen — selbst wenn Sie den zusätzlichen Platz nicht brauchen. gp3 hat diese Abhängigkeit aufgebrochen: Es beginnt bei 3.000 IOPS und 125 MB/s unabhängig von der Größe und lässt Sie IOPS und Durchsatz unabhängig voneinander konfigurieren, zu niedrigeren Kosten. AWS empfiehlt gp3 für neue Volumes, aber da viele bestehende Lasten noch auf gp2 laufen, müssen Sie beide kennen.

**io2 (Provisioned IOPS SSD)**: Hochleistungsoption für I/O-intensive Lasten. Sie geben an, wie viele I/O-Operationen pro Sekunde (IOPS) Sie benötigen, und AWS garantiert diese Leistung. Angemessen für große Produktionsdatenbanken.

**st1 (Throughput Optimized HDD)**: Magnetspeicher, optimiert für große sequenzielle Lese- und Schreibvorgänge. Niedrigere Kosten als SSD, aber langsamer für wahlfreie I/O. Gut für Data Warehousing und Log-Verarbeitung.

**sc1 (Cold HDD)**: Die günstigste EBS-Option. Für Daten, auf die selten zugegriffen wird. Nicht angemessen für irgendetwas Zeitkritisches.

"Wie viel mehr kostet io2 im Vergleich zu gp3?" fragte Tom und blickte von seinem Notizbuch auf.

Leo rief die Preisseite auf. io2 kostete ungefähr 50–60 % mehr pro GB als gp3, plus eine separate Gebühr pro provisioniertem IOPS — und bei einem hochleistungsfähigen Volume dominieren diese IOPS-Gebühren die Rechnung. Tom notierte die Lücke. "Wir verwenden also gp3, bis die Datenbank die Leistungsgarantie tatsächlich braucht."

Die Prüfung verlangt nicht, dass Sie alle Typen auswendig lernen. Sie testet aber Ihre Fähigkeit, Anforderungen dem richtigen Typ zuzuordnen: IOPS-Anforderungen → io2. Kostensensible sequenzielle Lasten → st1. Allgemeine Webanwendungen → gp3.

**IOPS vs. Durchsatz: Warum die Unterscheidung wichtig ist**

Tom kam am folgenden Dienstag auf die EBS-Volume-Frage zurück, nachdem er CloudWatch geprüft hatte.

"Ich sehe zwei Metriken auf dem EBS-Dashboard", sagte er. "IOPS und Durchsatz. Das sind verschiedene Dinge?"

Das sind sie.

**IOPS** (Input/Output Operations Per Second) misst, wie viele Lese- oder Schreiboperationen die Festplatte pro Sekunde bewältigen kann. Jede Operation ist typischerweise klein — 4 KB bis 256 KB. Hohe IOPS sind wichtig für Datenbanken, die viele kleine, wahlfreie Lese- und Schreibvorgänge durchführen: einzelne Zeilen abrufen, Datensätze aktualisieren, gleichzeitige Abfragen handhaben.

**Durchsatz** (gemessen in MB/s) misst, wie viele Daten pro Sekunde bewegt werden. Hoher Durchsatz ist wichtig für sequenzielle Lasten: große Logdateien lesen, Streaming-Analysen, große Datensätze laden.

Eine Datenbank braucht typischerweise hohe IOPS und niedrigen bis moderaten Durchsatz. Ein Data Warehouse, das große Tabellen scannt, braucht hohen Durchsatz und kann mit moderaten IOPS leben.

Tom hatte die CloudWatch-Metriken der Nimbus-Datenbank beobachtet. Die IOPS schnellten während des Abendansturms in die Höhe — kurze, wahlfreie Lesevorgänge, als die Anwendung Menüpunkte und Bestelldaten abrief. Der Durchsatz war niedrig. Das Muster entsprach einer Datenbanklast, die bessere IOPS brauchte, nicht besseren Durchsatz.

"Wenn die Datenbank also langsam wird", sagte Tom, "prüfen wir, ob sie IOPS-gebunden oder durchsatzgebunden ist, bevor wir das Volume aktualisieren?"

"Richtig", sagte Priya. "Das Upgrade von gp3 auf io2 fügt IOPS zu einem Preis hinzu. Wenn das Problem der Durchsatz ist, wird dieses Upgrade nicht helfen. Prüfen Sie zuerst die Metrik."

Genau so vermeiden Sie teure Speicher-Upgrades, die das falsche Problem lösen.

**EBS-Snapshots: Das Backup**

Hier ist etwas, das regelmäßig Unternehmen rettet.

Ein **EBS-Snapshot** ist ein Point-in-Time-Backup eines EBS-Volumes, gespeichert in S3 (obwohl Sie über die EBS-Schnittstelle darauf zugreifen, nicht direkt über S3). Snapshots sind inkrementell: Der erste Snapshot erfasst das gesamte Volume; nachfolgende Snapshots speichern nur, was sich seit dem letzten geändert hat.

Sie können aus einem Snapshot ein neues EBS-Volume erstellen — und damit auf einen Zeitpunkt vor einer Datenbankbeschädigung, einem schlechten Deployment oder einer versehentlichen Löschung zurücksetzen.

Sie sollten Snapshots automatisieren. AWS stellt dafür **Amazon Data Lifecycle Manager** bereit: Definieren Sie eine Richtlinie (alle 6 Stunden einen Snapshot machen, die letzten 7 Tage behalten), und sie läuft automatisch.

Priya hatte das eingerichtet, bevor die Datenbank überhaupt in Produktion ging.

Leo hatte nicht daran gedacht.

"Haben wir bedacht, was passiert, wenn der Snapshot-Job stillschweigend fehlschlägt?" fragte Priya. "Wenn die Richtlinie läuft, aber die Snapshots tatsächlich nicht gültig sind?"

Sie testeten den Wiederherstellungsprozess an jenem Nachmittag.

Priyas vollständige Snapshot-Backup-Richtlinie für die Nimbus-Produktionsdatenbank, sobald sie Zeit hatte, sie ordentlich zu dokumentieren:

- **Tägliche Snapshots**, 7 Tage aufbewahrt. Diese decken das normale Wiederherstellungsszenario ab: ein schlechtes Deployment, eine versehentliche Löschung, ein Beschädigungsereignis, das innerhalb einer Woche entdeckt wird.
- **Wöchentliche Snapshots** (jeden Sonntag um 2 Uhr erstellt), 30 Tage aufbewahrt. Diese decken das Szenario ab, in dem ein Problem nicht sofort erkannt wird — eine subtile Datenbeschädigung, die erst Wochen später bemerkt wird.
- Regionsübergreifende Snapshot-Kopie nach `us-east-1`, einmal pro Woche, 30 Tage aufbewahrt. Diese decken das Szenario ab, in dem die gesamte `us-west-2`-Region nicht verfügbar ist und Nimbus die Datenbank anderswo rekonstruieren muss.

"Das scheinen viele Snapshots zu sein", sagte Leo.

"Jeder inkrementelle Snapshot nach dem ersten ist klein", sagte Priya. "Sie speichern nur, was sich geändert hat. Die Gesamtspeicherkosten sind moderat."

Tom hatte den Preis bereits nachgeschlagen. Tägliche Snapshots einer 50-GB-Datenbank, 7 Tage aufbewahrt, plus wöchentliche Snapshots, 30 Tage aufbewahrt — ungefähr 3 bis 5 Dollar pro Monat. Die Kosten, sie nicht zu haben, falls die Datenbank jemals beschädigt würde, waren unermesslich höher.

"Und Fast Snapshot Restore?" fragte Leo. "Ich habe diese Option gesehen, als ich mir die Einstellungen ansah."

**Fast Snapshot Restore** (FSR) ist ein EBS-Feature, das die I/O-Leistungseinbuße beseitigt, die normalerweise auftritt, wenn Sie einen wiederhergestellten Snapshot zum ersten Mal verwenden. Ohne FSR läuft ein frisch wiederhergestelltes EBS-Volume die ersten paar Minuten oder Stunden schlecht, da die Daten faul aus S3 geladen werden — Lesevorgänge greifen auf S3 für Daten zu, die noch nicht auf das Volume gezogen wurden. Mit auf einem Snapshot in einer bestimmten AZ aktiviertem FSR ist das wiederhergestellte Volume sofort für volle Leistung bereit.

FSR kostet extra — Sie zahlen pro Snapshot pro AZ pro Stunde, in der FSR aktiviert ist. Für Nimbus' Notfallwiederherstellungs-Snapshots rechtfertigte die gelegentliche Nutzung nicht die laufenden FSR-Kosten. Für einen Produktionsdatenbank-Snapshot, der in einem Notfall innerhalb von Minuten wiederhergestellt und betriebsbereit sein musste, war FSR es wert.

"Aktivieren Sie FSR auf dem wöchentlichen Snapshot, den wir tatsächlich zur Notfallwiederherstellung verwenden würden", sagte Priya. "Aktivieren Sie es nicht auf jedem täglichen Snapshot im Aufbewahrungsfenster."

Tom fügte die Kostenberechnung zu seiner Tabelle hinzu.

**Regionsübergreifende Snapshot-Kopie zur Notfallwiederherstellung**

EBS-Snapshots leben in der Region, in der sie erstellt wurden. Wenn die gesamte `us-west-2`-Region ausfällt, sind Ihre Snapshots in `us-west-2` unzugänglich.

Die Lösung: **regionsübergreifende Snapshot-Kopie**. Sie können einen EBS-Snapshot in eine andere Region kopieren, was Ihnen ein nutzbares Backup gibt, selbst wenn Ihre primäre Region nicht verfügbar ist.

AWS Data Lifecycle Manager unterstützt automatisierte regionsübergreifende Kopie als Teil einer Snapshot-Richtlinie: einen täglichen Snapshot in `us-west-2` machen, ihn einmal pro Woche automatisch nach `us-east-1` kopieren. Wenn eine Katastrophe eintritt, starten Sie eine neue EC2-Instanz in `us-east-1`, stellen aus dem regionsübergreifenden Snapshot wieder her, aktualisieren den DNS-Endpunkt und arbeiten weiter.

"Das ist unser Notfallwiederherstellungsplan für die Datenbank", sagte Priya und präsentierte dem Team die Richtliniendokumentation. "Keine vollständige Multi-Region-Architektur — das ist mehr Komplexität, als wir gerade brauchen. Aber wenn `us-west-2` komplett ausfällt, können wir innerhalb von zwei Stunden in `us-east-1` wiederherstellen."

"Zwei Stunden Ausfallzeit", sagte Tom.

"Gegenüber unendlicher Ausfallzeit", sagte Priya.

Tom erkannte die Unterscheidung an.

**EBS-Verschlüsselung: Die Geschichte, warum man nicht an Ort und Stelle verschlüsseln kann**

Die Nimbus-Produktionsdatenbank lief seit sechs Wochen, als Priya etwas markierte.

"Das EBS-Volume ist nicht verschlüsselt", sagte sie.

"Können wir es verschlüsseln?" fragte Leo.

"Ja. Aber nicht an Ort und Stelle."

Hier ist die Sache mit der EBS-Verschlüsselung: Sie können ein bestehendes, unverschlüsseltes EBS-Volume nicht direkt verschlüsseln. Die Daten sind bereits im Klartext geschrieben. Um sie zu verschlüsseln, müssen Sie:

1. Einen Snapshot des unverschlüsselten Volumes erstellen
2. Den Snapshot kopieren und die Verschlüsselung auf der Kopie aktivieren
3. Aus dem verschlüsselten Snapshot ein neues verschlüsseltes EBS-Volume erstellen
4. Die Instanz stoppen
5. Das alte unverschlüsselte Volume abtrennen
6. Das neue verschlüsselte Volume anhängen
7. Die Instanz starten und überprüfen, dass alles funktioniert

Dieser Prozess hat ein Ausfallzeitfenster — die Stopp-, Abtrenn-, Anhäng-, Start-Sequenz. Für Nimbus, mit einer kleinen Datenbank, betrug das Fenster etwa fünfzehn Minuten. Für eine große Produktionsdatenbank mit Hunderten von GB kann der Snapshot- und Kopiervorgang länger dauern, obwohl die tatsächliche Instanz-Ausfallzeit immer noch nur der Stopp/Start-Zyklus ist.

"Warum können wir nicht einfach einen Schalter umlegen?" fragte Leo.

"Weil die bestehenden Daten auf der Festplatte unverschlüsselte Bytes sind", sagte Priya. "AWS kann sie nicht neu verschlüsseln, ohne jeden Block zu lesen und neu zu schreiben — was genau das ist, was der Snapshot-Kopiervorgang tut. Er liest jeden Block aus dem Quell-Snapshot, verschlüsselt jeden einzelnen und schreibt ihn in den neuen Snapshot."

Leo durchlief den Prozess. Das neue verschlüsselte Volume wurde angehängt. Die Instanz kam wieder online. Die Datenbank lief auf einem verschlüsselten Volume.

"Neue EBS-Volumes können standardmäßig verschlüsselt erstellt werden", sagte Priya. "Es gibt eine Einstellung auf Kontoebene. Jedes neue Volume wird automatisch verschlüsselt. Wir hätten das am ersten Tag aktivieren sollen."

Sie aktivierte es. Von diesem Punkt an wurde jedes im Nimbus-AWS-Konto erstellte EBS-Volume standardmäßig verschlüsselt — keine zusätzlichen Schritte erforderlich.

**EFS: Der gemeinsame Aktenschrank**

EBS ist eine Festplatte, die an eine Instanz angehängt ist. Was, wenn mehrere Instanzen gleichzeitig auf dieselben Dateien zugreifen müssen?

Was Sie brauchen, ist so etwas wie der Aktenschrank in der Mitte eines Büros — jeder kann hingehen, eine Akte herausziehen, sie zurücklegen, und die nächste Person sieht die Änderung sofort. Mehrere Personen, gleichzeitig, die auf denselben Speicher zugreifen.

AWS nennt das **EFS**: Elastic File System.

EFS ist ein verwaltetes Netzwerkdateisystem. Mehrere EC2-Instanzen können dasselbe EFS-Dateisystem gleichzeitig einhängen und gemeinsame Dateien lesen/schreiben. Das ist die Schlüsselfähigkeit, die EBS nicht bietet.

Um es klar zu sagen:

EBS ist eine externe Festplatte, die in einen Laptop eingesteckt ist. Nur dieser Laptop kann sie zu einem Zeitpunkt verwenden.

EFS ist der Aktenschrank in der Mitte des Büros. Jedes Teammitglied kann hingehen, eine Schublade öffnen, eine Akte lesen, etwas zurücklegen.

**Wann brauchen Sie EFS?**

- Wenn mehrere EC2-Instanzen Dateien teilen müssen — Content-Management-Systeme, gemeinsame
  Konfigurationsdateien, gemeinsame Medienbibliotheken
- Wenn Sie eine horizontal skalierte Anwendung haben, bei der alle Instanzen Zugriff auf
  dieselben Daten benötigen
- Wenn Sie ein persistentes Dateisystem brauchen, das Instanzausfälle überlebt

Auf EFS wird über das Netzwerk mit dem NFS-Protokoll (speziell NFSv4) zugegriffen. Jede EC2-Instanz, die Netzwerkkonnektivität zum EFS-Mount-Target hat, kann es einhängen — einschließlich Instanzen in verschiedenen AZs innerhalb derselben Region. Sie konfigurieren Mount-Targets in jeder AZ, und Instanzen verbinden sich mit dem nächstgelegenen Mount-Target für optimale Leistung.

Die praktische Implikation: EFS funktioniert von Haus aus über AZs hinweg. Wenn Sie Webserver in `us-west-2a` und `us-west-2b` haben, die beide dasselbe EFS-Dateisystem einhängen, ist eine von einem Server in `2a` geschriebene Datei sofort für einen Server in `2b` sichtbar. Das ist das Verhalten eines gemeinsamen Dateisystems, das EBS nicht bieten kann.

**EFS-Performance-Modi**

EFS hat zwei Durchsatzmodi, die für die Dimensionierung wichtig sind:

**Elastic Throughput** (die Voreinstellung für die meisten neuen Dateisysteme): EFS skaliert den Durchsatz automatisch hoch und herunter, basierend auf der tatsächlichen Nutzung. Sie provisionieren keine Durchsatzstufe. Sie zahlen für das, was Sie nutzen. Das ist der richtige Modus für variable Lasten, bei denen der Durchsatzbedarf schwankt — wie bei Nimbus, wo der Montagmorgen-Traffic anders ist als der Freitagabend-Traffic.

**Provisioned Throughput**: Sie geben die Durchsatzstufe unabhängig von den gespeicherten Daten an. Nützlich, wenn Ihre Last konstant hohen Durchsatz benötigt, der über das hinausgeht, was das gespeicherte Datenvolumen im Elastic-Modus bieten würde. Wenn Sie ein Build-System betreiben, das Dutzende von Gigabytes pro Minute liest, unabhängig davon, wie viel gespeichert ist, ist Provisioned Throughput angemessen.

Es gibt auch einen dritten Modus, **Bursting Throughput**, der das ursprüngliche EFS-Verhalten ist und immer noch die Voreinstellung für Dateisysteme, die erstellt wurden, bevor Elastic verfügbar wurde. Im Bursting-Modus skaliert der Durchsatz damit, wie viele Daten Sie speichern: Sie erhalten eine Baseline von 50 KB/s pro GB, plus Burst-Credits, die sich ansammeln, wenn Sie unter der Baseline liegen, und ausgegeben werden können, wenn Sie höheren Durchsatz brauchen (bis zu 100 MB/s für kleinere Dateisysteme oder bis zu einem Vielfachen der Baseline für größere). Es ist die richtige Wahl für Lasten mit unvorhersehbaren oder sprunghaften Zugriffsmustern, bei denen das Dateisystem groß genug ist, um bedeutsame Burst-Credits zu verdienen. Wenn Ihr Dateisystem klein ist und Ihr Zugriffsmuster sprunghaft, können Sie Ihre Credits schnell aufbrauchen — beobachten Sie die `BurstCreditBalance`-CloudWatch-Metrik, um zu wissen, wo Sie stehen.

Toms Frage kam sofort: "Ist Elastic teurer?"

"Es hängt vom Nutzungsmuster ab", sagte Leo. "Bei Elastic zahlen Sie für den Durchsatz, den Sie tatsächlich verbrauchen. Bei Provisioned zahlen Sie für den Durchsatz, den Sie angegeben haben, auch wenn Sie ihn nicht nutzen."

"Für variable Lasten ist Elastic also normalerweise günstiger", sagte Tom.

"Normalerweise", sagte Priya. "Prüfen Sie Ihre tatsächlichen Durchsatzmuster in CloudWatch, bevor Sie entscheiden."

EFS hat außerdem zwei Performance-Modi: **General Purpose** (niedrige Latenz, geeignet für die meisten Lasten, die Voreinstellung) und **Max I/O** (höherer Durchsatz für stark parallelisierte Lasten zum Preis einer leicht höheren Latenz). General Purpose bewältigt die überwiegende Mehrheit der Anwendungsfälle. Max I/O wurde für Anwendungen entworfen, die Tausende gleichzeitiger Dateisystemoperationen durchführen müssen — groß angelegte Medienverarbeitungs-Pipelines, wissenschaftliche Computing-Workflows mit vielen parallelen Lesern.

**EFS vs. S3:** EFS ist ein Dateisystem (Ordner, Dateien, Berechtigungen, Sperren). S3 ist Objektspeicher (Upload, Download, keine Dateisystemsemantik). EFS ist viel teurer als S3 — ungefähr 0,30 Dollar pro GB pro Monat für EFS Standard gegenüber 0,023 Dollar pro GB pro Monat für S3 Standard. Verwenden Sie S3 für Dateien, die als Ganzes gespeichert und abgerufen werden. Verwenden Sie EFS für Dateien, die Anwendungen aktiv durch standardmäßige Dateisystemoperationen lesen und schreiben.

**Wenn EBS, dann eine Instanz, aber wenn EFS, dann viele**

Die EBS/EFS-Entscheidung läuft auf eine Frage hinaus: Wie viele Instanzen müssen gleichzeitig auf diesen Speicher zugreifen?

Wenn Sie eine horizontal skalierte Anwendung auf EBS bauen, dann hat jede Instanz ihre eigene Festplatte — aber wenn ein Nutzer eine Datei auf Instanz A hochlädt, kann Instanz B sie nicht sehen. Das ist in Ordnung für Datenbanken (jede DB hat ihre eigene Festplatte), aber kaputt für gemeinsame Inhalte. Wenn Sie gemeinsamen Zugriff brauchen, ist EFS die Antwort — aber EFS kostet pro GB mehr als S3 und hat für wahlfreie I/O höhere Latenz als EBS. Die richtige Wahl hängt vollständig davon ab, was Ihre Anwendung mit den Daten macht.

**Den richtigen Speicher wählen**

Sie haben inzwischen drei Speichertypen in AWS gesehen. Machen wir die Entscheidung klar.

| Bedarf                                       | Speichertyp      |
|----------------------------------------------|------------------|
| Datenbank braucht persistente, schnelle Festplatte | EBS (gp3 oder io2) |
| Mehrere Server brauchen gemeinsame Dateien   | EFS              |
| Dateien, Backups, Bilder, große Objekte      | S3               |
| Temporärer Berechnungs-Arbeitsbereich        | Instance Store   |
| Langfristige Archive zu minimalen Kosten     | S3 Glacier       |

Sie fragen sich vielleicht: Wenn EFS mehreren Instanzen erlaubt, Dateien zu teilen, warum nicht einfach für alles verwenden? Weil EFS pro GB deutlich mehr kostet als S3 und für wahlfreie I/O höhere Latenz hat als lokales EBS. Es ist das richtige Werkzeug für gemeinsamen Dateisystemzugriff — nicht für allgemeinen Dateispeicher oder Datenbankspeicher.

Diese Entscheidung richtig zu treffen ist wichtig. S3 zu verwenden, wo Sie EFS brauchen, fügt betriebliche Komplexität hinzu. EBS zu verwenden, wo Sie EFS brauchen, verursacht Ausfälle, wenn Sie skalieren. Instance Store zu verwenden, wo Sie Persistenz brauchen, verliert Daten.

Priya druckte diese Tabelle aus und klebte sie an die Wand.

"Jedes Mal, wenn wir eine Speicheranforderung hinzufügen", sagte sie, "beginnen wir hier."

Gehen wir ein paar reale Szenarien durch, um die Entscheidung konkret zu machen:

**Szenario A**: Ein Machine-Learning-Trainingsjob läuft auf einer GPU-EC2-Instanz und muss einen 200-GB-Datensatz lesen. Der Job läuft einmal am Tag und dauert zwei Stunden. Der Datensatz wird von mehreren Forschungsteams geteilt.

Entscheidung: S3. Der Datensatz ist groß, wird einmal pro Job gelesen und geteilt. S3 ist günstig, haltbar und von jeder EC2-Instanz oder jedem Team-Konto zugänglich. Die GPU-Instanz liest ihn über die S3-API. Es besteht kein Bedarf für ein Dateisystem hier.

**Szenario B**: Eine WordPress-Website läuft auf vier EC2-Instanzen hinter einem Load Balancer. WordPress speichert Plugin-Dateien, Theme-Dateien und Nutzer-Uploads in einem Verzeichnis auf dem Server. Alle vier Instanzen müssen dieselben Dateien lesen und schreiben.

Entscheidung: EFS. WordPress verwendet Dateisystemsemantik — es erstellt Verzeichnisse, schreibt Dateien, liest Dateien per Pfad. S3 würde das Umschreiben des WordPress-Plugin-Ökosystems erfordern. EFS hängt sich als standardmäßiges NFS-Dateisystem ein, mit dem WordPress nativ arbeitet.

**Szenario C**: Eine PostgreSQL-Datenbank läuft auf einer EC2-Instanz. Sie braucht schnelle wahlfreie I/O für Abfrageausführung und Index-Lookups.

Entscheidung: EBS (gp3 oder io2). Datenbanken brauchen Blockspeicher mit niedriger Latenz für kleine, wahlfreie Lese- und Schreibvorgänge. S3 ist zu langsam und unterstützt keine Dateisystemsemantik. EFS hat für wahlfreie I/O höhere Latenz als EBS.

Das Muster: Die Voreinstellung für Dateien ist S3. Fügen Sie EBS hinzu, wenn Sie Blockspeicher für eine bestimmte Instanz brauchen. Fügen Sie EFS hinzu, wenn mehrere Instanzen ein Dateisystem teilen müssen. Instance Store nur für temporären Arbeitsbereich.

## Wenn EFS nicht genug ist: Amazon FSx

Die nächste Speicherlektion kam nicht als Ausfall oder Whiteboard-Debatte. Sie kam als Verkaufsvertrag — die Art, der Maya seit dem Start des Portals hinterhergejagt war, die Art, die ein ganzes Quartal an Demos und Folgeanrufen brauchte, um abgeschlossen zu werden. Drei Monate nach dem Start des Portals für Restaurantbetreiber unterzeichnete Nimbus seinen ersten Kunden mit mehreren Standorten: Copper Kettle, eine familiengeführte Gruppe von einem Dutzend Standorten im Mittleren Westen. Maya hatte den Deal geführt. Tom hatte das Finanzmodell gebaut. Leo hatte mit der Planung der technischen Integration begonnen, bevor die Tinte trocken war.

Dann las er die Infrastrukturnotizen vom IT-Team von Copper Kettle.

"Ihre Dateiserver sind Windows", sagte er. "Alles ist Windows. Ihre Küchenmanagement-Software, ihr HR-System, ihr Planungstool — alles schreibt auf gemeinsame Laufwerke auf Windows-Dateiservern. SMB-Protokoll. Active-Directory-Authentifizierung."

"Können wir sie auf EFS heben?" fragte Maya.

Leo schüttelte den Kopf. "EFS verwendet NFS. Ihre Anwendungen sprechen SMB. Das sind verschiedene Protokolle. Die Copper-Kettle-Software weiß nicht, was NFS ist. Man kann sie nicht einfach auf einen EFS-Mount zeigen lassen."

"Wir können also EFS nicht verwenden."

"Nicht dafür. Es gibt einen anderen Dienst."

**FSx for Windows File Server: EFS, aber für Windows**

**Amazon FSx for Windows File Server** ist ein vollständig verwaltetes, Windows-natives gemeinsames Dateisystem. Es unterstützt das SMB-Protokoll (Server Message Block) — dasselbe Protokoll, das Windows-Server, Windows-Anwendungen und On-Premises-Windows-Dateifreigaben seit Jahrzehnten verwenden. Es integriert sich mit Active Directory, unterstützt Windows-ACLs (Berechtigungen auf Dateiebene) und unterstützt die Windows-spezifischen Features, von denen Windows-Anwendungen tatsächlich abhängen.

Stellen Sie es sich als EFS vor, aber für Windows — mit allen Windows-spezifischen Features, die Ihre Active-Directory-Umgebung bereits erwartet. Die Küchenmanagement-Software von Copper Kettle würde sich genau so damit verbinden, wie sie sich mit den On-Premises-Dateiservern verbunden hatte. Die Anwendung ändert sich nicht. Das Protokoll ändert sich nicht. Die Daten leben einfach auf einem verwalteten AWS-Dienst statt auf einem Server in einem Keller irgendwo in Chicago.

Für die Copper-Kettle-Migration: Leo provisionierte ein FSx-for-Windows-File-Server-Dateisystem, verband es mit dem Copper-Kettle-Active-Directory (über AWS Managed Microsoft AD auf AWS erweitert) und ordnete die bestehenden Laufwerksbuchstaben zu. Die Küchensoftware fand ihre Dateifreigaben genau dort, wo sie sie erwartete.

"Wie viel kostet das pro Monat?" fragte Tom.

Leo hatte bereits nachgesehen. FSx for Windows wird pro GB Speicher pro Monat berechnet — teurer als EFS, deutlich teurer als S3, aber weit günstiger als die Wartung von Windows-Dateiservern über ein Dutzend Standorte. Tom schrieb die Zahl ohne Einwand auf.

**FSx for Lustre: Wenn Ihr ML-Job Hunderte von GPUs füttern muss**

Währenddessen hatte Leo nebenbei begonnen, eine Empfehlungsengine zu prototypisieren — die vorhersagte, welche Gerichte ein Kunde wahrscheinlich bestellen würde, basierend auf vergangenem Verhalten und dem, was ähnliche Kunden bestellten. Die Trainingsdaten waren noch klein, aber das Experiment schickte ihn in ein Kaninchenloch darüber, wie ernsthafte ML-Teams ihre Modelle füttern: Trainingsjobs, die bei jedem Durchlauf Hunderte von Gigabytes aus S3 lesen.

"Das Muster, das in den Fallstudien immer wieder auftaucht", berichtete er beim nächsten Team-Mittagessen, "sind Trainingsjobs, die durch I/O ausgebremst werden. Teure GPUs, die 40 % der Zeit untätig herumsitzen und auf die nächste Datencharge warten."

Das ist ein anderes Problem als gemeinsamer Dateispeicher. Es ist ein High-Performance-Computing-Problem (HPC): wenn Sie Hunderte von Verarbeitungseinheiten haben, die alle gleichzeitig Daten mit sehr hohem Durchsatz aus demselben Datensatz lesen müssen.

**Amazon FSx for Lustre** ist eine vollständig verwaltete Implementierung des parallelen Dateisystems Lustre. Lustre ist genau für dieses Szenario gebaut — parallele Lesevorgänge mit extrem hohem Durchsatz über viele gleichzeitige Clients. Es integriert sich nativ mit S3: Sie zeigen FSx for Lustre auf einen S3-Bucket, und es macht diese Daten automatisch über das Lustre-Dateisystem verfügbar. Der Trainingsjob liest von einem lokalen Mount-Punkt; FSx streamt die Daten im Hintergrund aus S3.

Wenn Ihr ML-Trainingsjob Daten an Hunderte von GPUs gleichzeitig füttern muss, ist FSx for Lustre das Werkzeug. Dasselbe gilt für Finanzmodellierung, Genomik-Lasten und Video-Rendering — jede Last, bei der der Engpass paralleler I/O-Durchsatz statt Speicherkapazität ist.

Die Fallstudie, die Leo gespeichert hatte, erzählte die Geschichte in zwei Zahlen: Nach der Migration des Trainingsjobs zu FSx for Lustre kletterte die GPU-Auslastung von 60 % auf 94 %, und der Trainingsdurchlauf, der sechs Stunden gedauert hatte, war in dreieinhalb abgeschlossen. Nimbus würde diese Art von Pferdestärken lange Zeit nicht brauchen — aber Leo legte das Muster für den Tag ab, an dem die Empfehlungsengine erwachsen würde.

**Die anderen FSx-Optionen**

AWS bietet außerdem **FSx for NetApp ONTAP** — für Unternehmen, die bereits NetApp-Speicher On-Premises betreiben und Multi-Protokoll-Zugriff wünschen (NFS, SMB und iSCSI vom selben Dateisystem) — und **FSx for OpenZFS**, für Lasten, die ZFS-spezifische Features wie Snapshots und Klone auf Dateisystemebene benötigen. Beide sind spezialisierte Werkzeuge für Organisationen mit spezifischer bestehender Infrastruktur oder Anforderungen.

Für die meisten Teams läuft die Entscheidung zwischen den vier FSx-Varianten und EFS. Die Frage ist immer dieselbe: Welches Protokoll spricht die Last, und welche Leistungseigenschaften braucht sie?

---

> **Prüfungstipp — Amazon FSx**
>
> *SAA-C03-Domäne: Leistungsstarke Architekturen entwerfen (Domäne 3, Aufgabe 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + Windows-Lasten**. Die Prüfung signalisiert: "Windows-Dateiserver", "SMB-Protokoll", "Active-Directory-Integration", "Lift-and-Shift von Windows-Anwendungen". Wenn Sie eine dieser Phrasen sehen, ist FSx for Windows die Antwort.
> - **FSx for Lustre = HPC + ML-Training + parallele I/O + S3-Integration**. Die Prüfung signalisiert: "Machine-Learning-Training", "High-Performance Computing", "HPC", "paralleles Dateisystem", "I/O-intensive Lasten", "GPU-Cluster", "Dateisystem mit S3 integrieren". Wenn Sie diese Phrasen sehen, ist FSx for Lustre die Antwort.
> - **EFS ist kein Ersatz für eines von beiden.** EFS ist NFS für Linux-Lasten. Es spricht kein SMB. Es ist kein paralleles Hochleistungsdateisystem. EFS dort zu verwenden, wo FSx benötigt wird, bedeutet, dass die Anwendung nicht funktioniert (Windows) oder durch I/O ausgebremst wird (HPC).
> - **FSx for NetApp ONTAP und FSx for OpenZFS** erscheinen seltener, aber die Signale sind charakteristisch. "Bestehenden NetApp/ONTAP-Speicher migrieren", "Multi-Protokoll-Zugriff (NFS + SMB + iSCSI)" oder "SnapMirror" → FSx for NetApp ONTAP. "ZFS", "NFS mit sofortigen Snapshots/Klonen" oder "einen On-Premises-ZFS-Dateiserver migrieren" → FSx for OpenZFS.
> - Kurzreferenz: "SMB oder Windows-Dateiserver" → FSx for Windows. "Machine-Learning-Training oder High-Performance Computing" → FSx for Lustre. "NetApp/Multi-Protokoll" → FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## Die Brücke zur Cloud: AWS Storage Gateway

Nimbus' bisher größter Interessent — eine regionale Kette namens Meridian Kitchen, zwanzig Standorte über drei Bundesstaaten — kam mit einem Problem, das nicht mit `aws s3 cp` gelöst werden konnte.

Meridian hatte jahrelange Betriebsdaten, die auf On-Premises-Dateiservern lebten. Rezepte, Rechnungen, Küchen-Videoaufnahmen, Lieferantenverträge. Nicht ein paar Gigabytes. Terabytes. Und die Software, die diese Daten erzeugte und verbrauchte — ihr Küchenmanagementsystem, ihre Rechnungsplattform, ihre HR-Tools — alles schrieb auf lokale Dateifreigaben über NFS oder SMB. Diese Anwendungen umzuschreiben war nicht machbar. Alle Daten über Nacht zu verschieben war ebenfalls nicht machbar.

"Wie fangen wir also an, ihre Daten in AWS zu bekommen", fragte Maya, "ohne sie zu bitten, eine einzige Anwendung zu ändern?"

"Es gibt einen Dienst genau dafür", sagte Priya. "Er läuft in ihrem Rechenzentrum als VM, sieht für ihre bestehende Software wie ein normaler Dateiserver oder Speichergerät aus und speichert leise alles im Hintergrund in AWS."

Dieser Dienst ist **AWS Storage Gateway**: ein hybrider Speicherdienst, der On-Premises-Umgebungen mit AWS-Speicher verbindet. Er präsentiert Anwendungen Speicher über die Protokolle, die sie bereits verstehen, während er Daten tatsächlich in S3, S3 Glacier oder als EBS-Snapshots persistiert.

Es gibt drei Gateway-Typen, von denen jeder ein anderes On-Premises-Problem löst.

**File Gateway** präsentiert On-Premises-Anwendungen eine NFS- oder SMB-Schnittstelle. Auf das Gateway geschriebene Dateien werden als Objekte in S3 gespeichert — aber die Anwendung weiß das nicht. Sie sieht ein Dateisystem. Häufig abgerufene Dateien werden lokal zwischengespeichert für Lesevorgänge mit niedriger Latenz; der Rest lebt in S3. Das ist, was Meridian brauchte: Die Küchenmanagement-Software schreibt auf das, was wie eine Dateifreigabe aussieht, und die Daten landen in S3, wo Nimbus sie analysieren, sichern und durchsuchen kann.

"Moment — aber *warum* würden wir es so machen?" fragte Maya. "Warum nicht einfach die Software direkt auf S3 zeigen lassen?"

Weil NFS und SMB nicht S3 sind. Die Küchensoftware spricht nicht die API von S3. Sie öffnet Dateipfade. Sie schreibt Bytes in ein Verzeichnis. File Gateway übersetzt das in S3-Objektoperationen, ohne dass die Anwendung weiß, dass sich etwas geändert hat.

**Volume Gateway** präsentiert On-Premises-Servern iSCSI-Blockspeicher-Volumes — dieselbe Schnittstelle, die eine physische Festplatte oder ein SAN-Gerät präsentieren würde. Es hat zwei Modi: *Stored Volumes* halten die primären Daten On-Premises mit asynchronen Backups nach S3 als EBS-Snapshots (für On-Premises-zuerst-Lasten, die auch Cloud-Backup wünschen), und *Cached Volumes* halten primäre Daten in S3 mit häufig abgerufenen Daten On-Premises zwischengespeichert (für Organisationen, die bereit sind, S3 als primären Speicher zu behandeln).

**Tape Gateway** präsentiert eine virtuelle Tape Library (VTL) für Backup-Software wie Veeam, Veritas oder NetBackup. Die Backup-Software schreibt auf das, was wie physische Bandkassetten aussieht. Diese virtuellen Bänder werden in S3 gespeichert und können nach S3 Glacier archiviert werden. Die Backup-Software ändert sich nicht. Die physischen Bandroboter und Regale verschwinden.

"Das Backup-Team von Meridian betreibt Veeam", sagte Leo. "Sie haben tatsächliche physische Bänder. Off-Site-Lagerung, Rotationspläne, das ganze Ding."

"Tape Gateway ersetzt die physischen Bänder", sagte Priya. "Dieselbe Veeam-Konfiguration. Dieselben Backup-Jobs. Die Bänder leben einfach in S3 statt in einem Rack."

Tom schlug die Kosten für Off-Site-Bandlagerung nach. Er schloss diesen Tab ohne Kommentar und genehmigte den Migrationsplan.

---

> **Prüfungstipp — AWS Storage Gateway**
>
> *SAA-C03-Domäne: Leistungsstarke Architekturen entwerfen (Domäne 3)*
>
> - **File Gateway = NFS/SMB → S3.** Von On-Premises-Anwendungen geschriebene Dateien werden zu S3-Objekten. Häufig abgerufene Dateien werden lokal zwischengespeichert. Prüfungsauslöser: "On-Premises-Anwendung muss Dateien ohne Codeänderungen in S3 speichern."
> - **Volume Gateway = iSCSI-Blockspeicher → S3-Snapshots.** Stored-Modus: primäre Daten On-Premises, gesichert nach S3 als EBS-Snapshots. Cached-Modus: primäre Daten in S3, häufig abgerufene Blöcke lokal zwischengespeichert. Prüfungsauslöser: "On-Premises-Server braucht cloud-gestützten Blockspeicher."
> - **Tape Gateway = VTL → S3/Glacier.** Backup-Software schreibt auf virtuelle Bänder; Bänder werden in S3 gespeichert oder nach Glacier archiviert. Prüfungsauslöser: "physische Band-Backup-Infrastruktur ersetzen, ohne die Backup-Software zu ändern."
> - **Zentrales Prüfungsmuster:** "On-Premises-Anwendung braucht Cloud-Speicher ohne Codeänderungen" → Storage Gateway. "Band-Backup ersetzen" → speziell Tape Gateway.

---

## Stärken und Einschränkungen

**EBS-Stärken**:

- Persistenter, schneller Blockspeicher für EC2
- Snapshots für Point-in-Time-Backup und -Wiederherstellung
- Mehrere Leistungsstufen für verschiedene Lasten
- Verschlüsselung im Ruhezustand nativ unterstützt — aktivieren Sie Verschlüsselung auf Kontoebene standardmäßig

**EBS-Einschränkungen**:

- Zu einem Zeitpunkt an eine Instanz angehängt (mit geringfügigen Ausnahmen)
- In derselben AZ wie die EC2-Instanz (das Kopieren in eine andere AZ erfordert einen Snapshot)
- Sie zahlen für provisionierten Speicher, nicht nur für das, was Sie nutzen
- Das Verschlüsseln eines bestehenden unverschlüsselten Volumes erfordert einen Snapshot-Kopier-Wiederherstellungs-Zyklus mit einem Wartungsfenster

**EFS-Stärken**:

- Gemeinsames Dateisystem für mehrere Instanzen — natives NFS-Protokoll
- Skaliert automatisch, Sie provisionieren keine Kapazität
- Über AZs hinweg innerhalb einer Region zugänglich
- Elastic-Throughput-Modus passt sich automatisch an die Last an

**EFS-Einschränkungen**:

- Teurer als S3 pro GB
- Höhere Latenz als EBS für wahlfreie I/O
- Nicht in allen Regionen verfügbar

## Daten in großen Mengen verschieben: DataSync und die Snow-Familie

Storage Gateway hält On-Premises-Anwendungen *kontinuierlich verbunden* mit Cloud-Speicher. Aber zwei andere Migrationsszenarien tauchen ständig in der Prüfung auf — und schließlich in echten Projekten:

**AWS DataSync** ist für *Online-Massenübertragung*: das Verschieben großer Datensätze über das Netzwerk zwischen On-Premises-NFS/SMB-Dateiservern (oder anderen Clouds) und S3, EFS oder FSx — einmalig oder nach Zeitplan. Es handhabt Parallelisierung, Integritätsprüfung, Wiederholungen und Bandbreitendrosselung und ist ungefähr 10x schneller als selbstgeschriebene rsync-artige Skripte. Prüfungsauslöser: "Millionen von Dateien von einem On-Premises-NFS-Server zu Amazon EFS/S3 migrieren/übertragen" → DataSync. (Verwechseln Sie es nicht mit Storage Gateway, das für *laufenden hybriden Zugriff* ist, oder DMS, das *Datenbanken* migriert.)

**Die AWS Snow Family** ist für den Fall, dass das Netzwerk der Engpass ist. 100 TB über eine 100-Mbit/s-Leitung zu verschieben dauert mehr als drei Monate; ein Lkw ist schneller. **Snowball Edge** ist eine robuste Appliance, die AWS Ihnen schickt — laden Sie bis zu ~80 TB lokal, schicken Sie sie zurück, AWS importiert sie in S3. **Snowcone** war die kleine tragbare Version (~8–14 TB) für Edge-Standorte — Ende 2024 eingestellt, obwohl es in älteren Prüfungsfragen noch auftauchen kann (siehe den Realitätscheck in Kapitel 25). Prüfungs-Rechenauslöser: Wenn die Aufgabenstellung Ihnen eine Datensatzgröße und eine dünne oder unzuverlässige Leitung gibt und nach der schnellsten/praktischsten Migration fragt, berechnen Sie die Übertragungszeit — wenn es Wochen oder Monate sind, ist die Antwort die Snow Family.

> **Prüfungstipp — AWS Backup**
>
> Noch ein Dienst, der dieses Kapitel zusammennäht: **AWS Backup** zentralisiert und automatisiert Backups über EBS, EFS, RDS, DynamoDB, FSx und Storage Gateway mit einem einzigen Backup-Plan — Zeitpläne, Aufbewahrung, regionsübergreifende und kontenübergreifende Kopien und Backup Vault Lock für Unveränderlichkeit. Prüfungsauslöser: "Backups über mehrere AWS-Dienste/Konten zentral verwalten" → AWS Backup, keine dienstspezifischen Skripte.


## Zusammenfassung

Toms roter Stift kreiste das eigentliche Problem ein: zu viel auf einer Maschine. Speicher von der EC2-Instanz wegzubewegen geht nicht nur um Kapazität — es geht darum, Belange zu trennen, sodass jede Schicht unabhängig verwaltet, skaliert und gesichert werden kann. Die richtige Speicherwahl hängt von vier Fragen ab: Was braucht den Speicher, wie viele Dinge brauchen ihn gleichzeitig, wie lange lebt er und wie wird auf ihn zugegriffen? Diese vier Fragen führen konsequent zur richtigen Antwort.

- **EBS** (Elastic Block Store) ist persistenter Blockspeicher für eine einzelne EC2-Instanz. Er überlebt Instanz-Stopps und kann für ein Backup mit Snapshots versehen werden. Verwenden Sie gp3 für allgemeine Lasten, io2 für hohe IOPS-Anforderungen. Instance Store ist temporär und schnell, aber verloren, wenn die Instanz terminiert wird.
- **EFS** (Elastic File System) ist ein gemeinsames Netzwerkdateisystem, das mehrere Instanzen gleichzeitig einhängen können. EFS erstreckt sich über AZs innerhalb einer Region; EBS ist auf eine einzelne AZ beschränkt.
- Ordnen Sie den Speichertyp der Anforderung zu: einzelne EC2-Datenbank → EBS; gemeinsame Dateien über Server → EFS; Objekte, Medien, Backups → S3; Archive → S3 Glacier.
- Das Verschlüsseln eines bestehenden EBS-Volumes erfordert: Snapshot → verschlüsselte Kopie → neues Volume → Tausch. Aktivieren Sie Verschlüsselung auf Kontoebene standardmäßig, um dies für neue Volumes zu vermeiden.
- **EBS "Delete on Termination"**: Root-Volumes löschen standardmäßig bei der Instanz-Terminierung; Daten-Volumes bestehen standardmäßig fort. Überprüfen Sie beide Einstellungen beim Entwerfen von Instanz-Lebenszyklus-Richtlinien.

## Prüfungstipps

*SAA-C03-Domäne 3 — Aufgabe 3.1 (Speicherlösungen)*

- **EBS-Volumes leben in einer AZ.** Sie können nur an eine Instanz in derselben AZ
  angehängt werden. Um ein EBS-Volume in einer anderen AZ zu verwenden, erstellen Sie einen Snapshot und stellen
  ihn in der Ziel-AZ wieder her.
- **EBS-Snapshots sind inkrementell und in S3 gespeichert.** Der erste Snapshot ist vollständig;
  nachfolgende speichern nur Änderungen. Sie können Snapshots zur
  Notfallwiederherstellung in andere Regionen kopieren.
- **EFS ist AZ-übergreifend.** Mehrere Instanzen in verschiedenen AZs innerhalb derselben Region
  können dasselbe EFS-Dateisystem einhängen. Das ist ein zentrales Unterscheidungsmerkmal gegenüber EBS.
- **Wenn ein Prüfungsszenario "Webanwendung mit gemeinsamen Inhalten" oder "mehrere
  Instanzen, die auf dieselben Dateien zugreifen" sagt, denken Sie an EFS.** Wenn es "Datenbankspeicher"
  oder "persistente Festplatte für einen Server" sagt, denken Sie an EBS.
- **Instance-Store-Daten überleben einen Reboot, aber nicht ein Stoppen oder Terminieren.** Eine Frage
  könnte Daten beschreiben, die "verschwinden, nachdem die Instanz gestoppt wurde" — das ist Instance
  Store im Spiel.
- **gp3 vs. io2**: gp3 ist die Voreinstellung für allgemeine Nutzung; io2 ist für Lasten, die
  garantierte IOPS benötigen (große Datenbanken, geschäftskritische Systeme). Prüfungsszenarien,
  die "IOPS-Anforderungen" oder "konsistente Datenbankleistung mit niedriger Latenz" beschreiben,
  weisen auf io2 hin.
- **gp2 vs. gp3:** gp2-IOPS sind an die Größe gekoppelt (3 IOPS/GB, max. 16.000 IOPS bei 5.334 GB); gp3-IOPS sind unabhängig von der Größe (3.000 Basis, konfigurierbar bis zu 80.000 seit September 2025 — ältere Materialien, und möglicherweise der Prüfungs-Fragenpool, gehen noch von der vorherigen Obergrenze von 16.000 aus). Prüfungsfragenmuster: Eine Last braucht mehr IOPS, ohne den Speicher zu erhöhen — die Antwort ist gp3 oder io2, nicht gp2.
- **Verschlüsselung im Ruhezustand für EBS**: Sie können ein bestehendes unverschlüsseltes Volume nicht
  an Ort und Stelle verschlüsseln — Sie müssen einen Snapshot machen, verschlüsselt kopieren, wiederherstellen. Aktivieren Sie Verschlüsselungs-
  voreinstellungen auf Kontoebene, um zu vermeiden, versehentlich unverschlüsselte Volumes zu erstellen. Verschlüsselung ist AES-256
  unter Verwendung von KMS-Schlüsseln.
- **Fast Snapshot Restore** beseitigt die Leistungseinbuße auf frisch wiederhergestellten
  Volumes, kostet aber Geld pro Snapshot pro AZ. Prüfungsfragen über das Wiederherstellen von Volumes
  "sofort mit voller Leistung" weisen auf FSR hin.
- **EFS-Performance-Modi**: General Purpose (niedrige Latenz, geeignet für die meisten Lasten)
  vs. Max I/O (höherer Durchsatz für stark parallelisierte Lasten).
- **EFS-Durchsatzmodi — drei Optionen:** Bursting (Durchsatz skaliert mit der Speichergröße, verwendet Burst-Credits — gut für sprunghafte Lasten), Elastic (skaliert automatisch, Bezahlung nach Nutzung — gut für unvorhersehbare Lasten), Provisioned (fester Durchsatz unabhängig vom Speicher — gut für konstant hohen Durchsatzbedarf). Die Prüfung testet, ob Sie wissen, wann man Durchsatz provisioniert vs. ihn elastisch skalieren lässt oder sich auf Burst-Credits verlässt.
- **Regionsübergreifende Snapshot-Kopie**: EBS-Snapshots können zur Notfallwiederherstellung in andere
  Regionen kopiert werden. Der kopierte Snapshot ist unabhängig und verursacht während der Wiederherstellung keine Datenübertragungskosten
  — nur während der Kopieroperation selbst.
- **Storage-Gateway-Typen:** File Gateway = NFS/SMB → S3 (Dateien werden zu Objekten). Volume Gateway = iSCSI-Blockspeicher → S3-Snapshots (Stored: primär On-Premises; Cached: primär in S3). Tape Gateway = VTL → S3/Glacier (ersetzt physische Bänder). Prüfungsauslöser: "On-Premises-App braucht Cloud-Speicher ohne Codeänderungen" → Storage Gateway. "Band-Backup ersetzen" → Tape Gateway.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist der Unterschied zwischen EBS und EFS? Wann würden Sie das eine
dem anderen vorziehen?

*(Hinweis: Denken Sie darüber nach, ob eine Instanz oder mehrere Instanzen gleichzeitig auf den
Speicher zugreifen müssen.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen betreibt eine Webanwendung über vier EC2-Instanzen hinter einem Load
Balancer. Nutzer können Profilfotos hochladen. Jedes Foto muss von Nutzern
sofort nach dem Upload ansehbar sein, unabhängig davon, welche Instanz es verarbeitet hat. Die Fotos werden
Browsern über HTTP ausgeliefert, werden nie an Ort und Stelle verändert, und das Team möchte die
KOSTENGÜNSTIGSTE, skalierbare Lösung mit dem geringsten betrieblichen Aufwand.

Welche Speicherlösung erfüllt seine Anforderungen AM BESTEN?

A) Ein EBS-gp3-Volume an jede EC2-Instanz anhängen und Dateien zwischen ihnen mit
   einem Cron-Job synchronisieren  
B) Fotos direkt im Instance Store der EC2-Instanz speichern  
C) Amazon EFS verwenden, gleichzeitig auf allen vier EC2-Instanzen eingehängt  
D) Fotos in S3 speichern und direkt aus dem Anwendungscode darauf zugreifen

**Hinweis 1**: Die Anforderung ist "alle vier Instanzen müssen jedes Foto ausliefern". Welche Optionen
machen eine Datei sofort für alle Instanzen sichtbar?

**Hinweis 2**: Instance Store ist vergänglich. EBS kann nicht gleichzeitig auf mehreren Instanzen
eingehängt werden. Das grenzt es ein.

**Hinweis 3**: Sowohl C als auch D könnten theoretisch funktionieren. Welche ist angemessener für einen
Fall, in dem die Anwendung über Dateisystemoperationen vs.
HTTP-Anfragen auf Fotos zugreifen muss?

**Antwort**: D

**Erklärung**: Fotos in S3 zu speichern und sie per URL auszuliefern ist die architektonisch
korrekte Wahl für eine Webanwendung. Hochgeladene Fotos sind sofort von
jedem Server (und von jedem Browser) über die URL von S3 zugänglich. S3 ist genau für diesen
Anwendungsfall ausgelegt: das Speichern von nutzerhochgeladenen Dateien im großen Maßstab mit hoher Verfügbarkeit und null
Verwaltungsaufwand.

Hinweis: C (EFS) würde technisch funktionieren, aber S3 ist das bevorzugte Muster für nutzerhochgeladene
Binärdateien in Webanwendungen, weil es günstiger, skalierbarer ist und Dateien
direkt über HTTP ausliefert, ohne dass die Anwendung als Proxy agiert.

**Warum nicht A?** Das Synchronisieren von Dateien per Cron-Job erzeugt Race Conditions und Konsistenz-
probleme. Zwischen Uploads und der nächsten Synchronisierung würden Dateien auf anderen Instanzen fehlen.

**Warum nicht B?** Instance-Store-Daten gehen verloren, wenn die Instanz gestoppt oder terminiert wird.
Fotos würden verschwinden.

**Warum nicht C?** EFS ist die richtige Antwort, wenn die Frage Dateisystemsemantik verlangt
(z. B. ein CMS, das Dateien an Ort und Stelle verändert). Für nutzerhochgeladene Fotos, die über das
Web ausgeliefert werden, ist S3 einfacher, günstiger und angemessener.

**Prüfungs-Schlüsselwort-Warnung**: Lesen Sie in der echten Prüfung die Aufgabenstellung wörtlich. Wenn sie
"gemeinsamer **Datei**speicher", "Dateisystem", "NFS" oder "POSIX" sagt, ist die geschlüsselte Antwort
**EFS** — überschreiben Sie nicht die angegebene Anforderung mit architektonischem Geschmack. Dieses
Szenario schlüsselt zu S3, weil es nach kostengünstiger Objektauslieferung über HTTP fragt,
nicht nach einem Dateisystem.

*SAA-C03-Domäne 3 — Aufgabe 3.1*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus fügt ein neues Feature hinzu: Restaurantbesitzer können PDF-Menüs hochladen, die
dann geparst und verwendet werden, um die Nimbus-Datenbank zu füllen. Der PDF-Verarbeitungsjob läuft
auf einer Flotte von EC2-Instanzen, die: (a) das hochgeladene PDF lesen, (b)
temporäre Verarbeitungsdateien schreiben, (c) die geparste Ausgabe schreiben müssen.

Welche Speicherdienste würden Sie für jeden dieser drei Schritte verwenden, und warum?

*(Es gibt keine einzige richtige Antwort. Konzentrieren Sie sich darauf, den Speichertyp den
Eigenschaften jedes Schritts zuzuordnen.)*

## Post-Credits-Szene

An jenem Nachmittag trennte Nimbus seinen Speicher ordentlich. Die Datenbank bekam ihr eigenes
EBS-Volume mit automatisierten Snapshots und aktivierter Verschlüsselung. Die Menüfotos zogen nach S3. Die EC2-Instanz
hatte endlich Raum zum Atmen.

Leo führte einen Lasttest durch. Die Website bewältigte zweihundert gleichzeitige Nutzer, ohne ins
Schwitzen zu geraten.

"Von hier an wird es schon passen", sagte er und beobachtete, wie die Graphen sanft abflachten.

Tom schaute auf die Rechnung. Das EBS-Volume fügte 8 Dollar im Monat hinzu. Er schrieb es auf.

"Ich füge dieser Rechnung ständig Dinge hinzu", sagte er. "Wann gleicht sich das aus?"

"Wenn wir aufhören, Ausfälle zu haben", sagte Maya. "Jeder Ausfall kostet mehr als die Vorbeugung."

Tom sah nicht überzeugt aus. Er würde es schließlich sein.

Drei Tage später versuchte ein Restaurantbesitzer auf der Plattform, eine Bestellung aufzugeben, und bekam
einen Fehler. Maya prüfte die Logs.

Die Datenbank war da. Die Anwendung lief. Aber zwanzig gleichzeitige Nutzer
versuchten alle, das Menü gleichzeitig zu lesen, und jeder einzelne griff auf die Datenbank zu.

"Jeder Seitenaufruf ist eine Datenbankabfrage", sagte Leo. "Jeder einzelne."

Priya googelte bereits etwas.

Im nächsten Kapitel: Was passiert, wenn mehr Kunden ankommen, als der Server bewältigen kann.
