# Kapitel 6: Die Festplatte, Die Dich Begleitet

Tom hatte einen roten Stift und eine Angewohnheit, die Leo nervös machte.

Jeden Samstagmorgen druckte Tom die Zusammenfassung der AWS-Konsole aus – laufende Instanzen, Speichervolumes, angehängte Festplatten – und ging diese Zeile für Zeile durch. Er tat dies seit Woche zwei. Er nannte es „das Buch“. Leo nannte es „die Sache, die Tom tut, die Leo dazu bringt, das Gefühl zu haben, etwas falsch gemacht zu haben.“

An diesem Samstag markierte Tom etwas und hinterließ den Ausdruck ohne ein Wort auf Mayas Schreibtisch.

Sie fand ihn Montagmorgen. Ein Kreis. Eine Notiz in der Randbemerkung, drei Wörter:

*Alles. Eine Maschine.*

Der Webserver. Die Datenbank. Alle Kundendaten. Zwei Monate Bestellhistorie. Alles lief auf einer einzigen EC2-Instanz.

„Was passiert mit der Datenbank, wenn die Instanz abstürzt?“, fragte Maya, den Ausdruck in der Hand.

„Sie stürzt auch ab“, sagte Leo.

„Und die Daten?“

„Das hängt davon ab, wie die Datenbank sie speichert.“

Dieses „hängt davon ab“ war das Problem.

**Wie EC2-Instanzen Daten Speichern**

Wenn eine EC2-Instanz läuft, lebt ihr Betriebssystem irgendwo auf einer Festplatte. Diese Festplatte
wird als **Root-Volume** bezeichnet. Standardmäßig ist dies ein **EBS-Volume** – auch wenn du es nicht darüber nachdenkst.

Aber es gibt noch etwas: EC2-Instanzen haben auch **Instance Store**-Speicher.

Instance Store ist temporärer Speicher, der physisch an die zugrunde liegende Hardware angebracht ist, die deine virtuelle Maschine ausführt. Er ist extrem schnell – schneller als fast jede andere Speicheroption in AWS. Aber er hat eine Ausnahme.

Instance Store ist **flüchtig**.

Wenn die Instanz stoppt oder beendet wird, geht der Instance Store-Daten verloren. Dauerhaft.
Nicht wiederherstellbar. AWS warnt nicht besonders laut, wie Teams es herausfinden: indem sie Daten verlieren.

Instance store ist für Caches, temporäre Verarbeitungskopien und Scratch-
Space geeignet. Niemals für Daten, die Ihnen wichtig sind.

**EBS: Die persistente Festplatte**

**Amazon EBS** – Elastic Block Store – ist persistenter Block-Speicher für EC2-Instanzen.

Block-Speicher bedeutet, dass er sich wie eine echte Festplatte verhält: Ihr Betriebssystem kann darauf Dateisysteme erstellen, beliebige Bytes an beliebigen Positionen lesen und schreiben, Datenbanken darauf ausführen und es genau wie ein angeschlossenes Laufwerk behandeln.

Die wichtigsten Eigenschaften:

**Persistente.** Im Gegensatz zum Instance Store überleben EBS-Volumes Stopps, Starts und sogar das Beenden von Instanzen (je nach Konfiguration). Die Daten bleiben auf dem Volume erhalten, auch wenn keine Instanz es verwendet.

**Anhängbar und entnehmbar.** Ein EBS-Volume kann von einer Instanz getrennt und an eine andere Instanz angeschlossen werden. Wenn Sie Daten migrieren oder sich von einer fehlgeschlagenen Instanz erholen müssen, können Sie das Volume trennen und an einer anderen Stelle wieder anschließen.

**Ein einzelger Anschluss (meistens).** Standardmäßig ist ein EBS-Volume an genau eine EC2-Instanz gleichzeitig angeschlossen. Eine einzelne Instanz kann mehrere EBS-Volumes haben, aber ein einzelnes EBS-Volume kann nicht gleichzeitig von mehreren Instanzen gemountet werden (mit einer Ausnahme: EBS Multi-Attach, das nur in begrenztem Umfang und mit wichtigen Einschränkungen verwendet wird).

Das Analogie: EBS ist eine externe Festplatte, die Sie in einen Laptop stecken. Der Laptop (EC2-Instanz) kann darauf lesen und schreiben. Wenn Sie fertig sind, können Sie sie abziehen und in einen anderen Laptop stecken.

**EBS-Volumen-Typen**

Nicht alle EBS-Volumes sind gleich. AWS bietet verschiedene Typen mit unterschiedlichen Leistungs- und Kostenprofilen.

**gp3 (General Purpose SSD)**: Die Standardwahl für die meisten Workloads. Guter Kompromiss zwischen Leistung und Preis. Geeignet für Boot-Volumes, kleine Datenbanken und Entwicklungsumgebungen.

**io2 (Bereitgestellte IOPS SSD)**: Hochleistungsoption für I/O-intensive Workloads.
Sie geben an, wie viele I/O-Operationen pro Sekunde (IOPS) Sie benötigen, und AWS garantiert
diese Leistung. Geeignet für große Produktionsdatenbanken.

**st1 (Durchsatzoptimiertes HDD)**: Magnetische Speicherung, optimiert für große sequentielle
Lesen und Schreiben. Günstiger als SSD, aber langsamer für zufällige I/O. Gut für Data Warehousing und Logverarbeitung.

**sc1 (Kaltes HDD)**: Die günstigste EBS-Option. Für Daten, die selten abgerufen werden.
Nicht für zeitkritische Anwendungen geeignet.

Die Prüfung erfordert nicht, dass Sie alle Arten auswendig lernen. Sie testet stattdessen Ihre Fähigkeit, Anforderungen mit dem richtigen Typ abzugleichen: IOPS-Anforderungen → io2. Kostenbewusste sequentielle Workloads → st1. Allgemeine Webanwendungen → gp3.

**EBS-Snapshots: Die Sicherung**

Hier ist etwas, das Unternehmen regelmäßig einsetzt.

Ein **EBS-Snapshot** ist eine Momentaufnahme eines EBS-Volumes, die in S3 gespeichert wird (obwohl Sie über die EBS-Schnittstelle darauf zugreifen, nicht direkt über S3). Snapshots sind
inkrementell: der erste Snapshot erfasst das gesamte Volume; nachfolgende Snapshots speichern nur das, was sich seit der letzten Aufnahme geändert hat.

Sie können ein neues EBS-Volume aus einem Snapshot erstellen – so können Sie wiederherstellen zu einem Zeitpunkt vor einer Datenbankkorruption, einer fehlerhaften Bereitstellung oder einer versehentlichen Löschung.

Sie sollten Snapshots automatisieren. AWS bietet **Amazon Data Lifecycle Manager** dafür: Definieren Sie eine Richtlinie (erstellen Sie einen Snapshot alle 6 Stunden, behalten Sie die letzten 7 Tage), und
sie wird automatisch ausgeführt.

Priya hatte dies eingerichtet, bevor die Datenbank überhaupt in Produktion ging.

Leo hatte darüber nicht nachgedacht.

**EFS: Der Gemeinsame Schrank**

EBS ist ein Datenträger, der an eine Instanz angehängt ist. Was passiert, wenn mehrere Instanzen gleichzeitig auf dieselben Dateien zugreifen müssen?

Hier kommt **Amazon EFS** – Elastic File System – ins Spiel.

EFS ist ein verwalteter Netzwerkdateisystem. Mehrere EC2-Instanzen können das gleiche EFS-Dateisystem gleichzeitig mounten und auf gemeinsam genutzte Dateien lesen und schreiben. Dies ist die Schlüsselkompetenz, die EBS nicht bietet.

Denken Sie daran:

EBS ist eine externe Festplatte, die an einen Laptop angeschlossen ist. Nur dieser Laptop kann sie gleichzeitig verwenden.

EFS ist ein Schließfach in der Mitte eines Büros. Jeder Teammitglied kann daraufhin, es öffnen, eine Datei lesen, etwas hineinlegen. Mehrere Personen, gleichzeitig, die auf denselben Speicher zugreifen.

**Wann benötigen Sie EFS?**

- Wenn mehrere EC2-Instanzen gemeinsam Dateien benötigen – Content-Management-Systeme, gemeinsam genutzte Konfigurationsdateien, gemeinsam genutzte Mediathek
- Wenn Sie eine horizontal skalierte Anwendung haben, bei der alle Instanzen Zugriff auf die gleichen Daten benötigen
- Wenn Sie ein persistentes Dateisystem benötigen, das bei Instanzfehlern überlebt

**EFS vs. S3:** EFS ist ein Dateisystem (Ordner, Dateien, Berechtigungen, Sperren). S3 ist Objektspeicher (Hochladen, Herunterladen, keine Dateisystem-Semantik). EFS ist deutlich teurer als S3. Verwenden Sie S3 für Dateien, die vollständig gespeichert und abgerufen werden. Verwenden Sie EFS für Dateien, die von Anwendungen über Standard-Dateisystem-Operationen aktiv gelesen und geschrieben werden.

**Die richtige Speicherauswahl**

Sie haben jetzt drei Arten von Speicher in AWS gesehen. Lasst uns die Entscheidung klarstellen.

| Bedarf                                  | Speichertyp       |
|---------------------------------------|--------------------|
| Datenbank benötigt persistenten, schnellen Datenträger | EBS (gp3 oder io2) |
| Mehrere Server benötigen gemeinsam genutzte Dateien | EFS                |
| Dateien, Backups, Bilder, große Objekte | S3                 |
| Temporärer Rechen-Scratch-Space       | Instance Store     |
| Langfristige Archive zu minimalen Kosten | S3 Glacier         |

Getting this decision right matters. Die Verwendung von S3, wo EFS benötigt wird, erhöht die betriebliche Komplexität. Die Verwendung von EBS, wo EFS benötigt wird, führt zu Ausfällen beim Skalieren. Die Verwendung von Instance Store, wo Persistenz benötigt wird, führt zum Verlust von Daten.

Priya druckte diese Tabelle und klebte sie an die Wand.

"Jedes Mal, wenn wir einen Speicherbedarf erhöhen", sagte sie, "beginnen wir hier."

## Stärken und Einschränkungen

**Stärken von EBS**:

- Persistente, schnelle Block-Speicher für EC2
- Snapshots für Backup und Wiederherstellung zum Zeitpunkt des Erhalts
- Mehrere Leistungsstufen für unterschiedliche Arbeitslasten
- Native Unterstützung für die Verschlüsselung im Ruhezustand

**Einschränkungen von EBS**:

- An ein einzelnes Instanz angehängt (mit geringfügigen Ausnahmen)
- Im selben AZ wie die EC2-Instanz (das Kopieren in ein anderes AZ erfordert ein Snapshot)
- Sie zahlen für die bereitgestellte Speicherkapazität, nicht nur für die tatsächlich genutzte

**Stärken von EFS**:

- Multi-Instanz-Dateisystem – natives NFS-Protokoll
- Skaliert automatisch, Sie müssen keine Kapazität provisionieren
- Über AZs innerhalb einer Region hinweg zugänglich

**Einschränkungen von EFS**:

- Teurer als S3 pro GB
- Höhere Latenz als EBS für Zufallsauslesevorgänge
- Nicht in allen Regionen verfügbar

## Zusammenfassung

- **Instanzspeicher** ist temporärer, schneller Speicher, der physisch an den Host angeschlossen ist.
  Daten gehen verloren, wenn die Instanz stoppt oder beendet wird. Nur für Scratch-Space.
- **EBS** (Elastic Block Store) ist persistenter Block-Speicher für eine einzelne EC2-Instanz.
  Er übersteht Instanz-Stopps. Er kann für Backups gesichert werden. Wählen Sie den richtigen
  Volumes Typ (gp3 für allgemeine Nutzung, io2 für hohe IOPS-Anforderungen).
- **EFS** (Elastic File System) ist ein gemeinsam genutzter Netzwerkdateisystem, das mehrere Instanzen
  gleichzeitig mounten kann. Verwenden Sie es, wenn mehrere Server Zugriff auf dieselben Dateien benötigen.
- Passen Sie den Speichertyp an den Bedarf an: Datenbank → EBS; gemeinsam genutzte Dateien → EFS;
  Objekte/Backups → S3; Archive → S3 Glacier.

## Prüfungstipps

*SAA-C03 Domäne 3 — Aufgabe 3.1 (Speichlösungen)*

- **EBS-Volumes leben in einer AZ.** Sie können nur an eine Instanz in derselben AZ angeschlossen werden. Um ein EBS-Volume in einer anderen AZ zu verwenden, erstellen Sie ein Snapshot und stellen ihn in der Ziel-AZ wieder her.
- **EBS-Snapshots sind inkrementell und werden in S3 gespeichert.** Der erste Snapshot ist vollständig; nachfolgende Snapshots speichern nur die Änderungen. Sie können Snapshots in andere Regionen kopieren, um sich gegen Katastrophen zu schützen.
- **EFS ist cross-AZ.** Mehrere Instanzen in verschiedenen AZs innerhalb derselben Region können dasselbe EFS-Dateisystem mounten. Dies ist ein wichtiger Unterschied zu EBS.
- Wenn ein Prüfungsszenario sagt "Webanwendung mit gemeinsam genutztem Inhalt" oder "mehrere Instanzen greifen auf dieselben Dateien zu", denken Sie an EFS. Wenn es sagt "Datenbankspeicher" oder "persistenten Datenträger für einen Server", denken Sie an EBS.
- **Instanzspeicherdaten überleben einen Neustart, aber nicht einen Stopp oder eine Beendigung.** Eine Frage könnte Daten beschreiben, die "nach dem Stoppen der Instanz verschwinden" – das ist der Instanzspeicher.

## Übungen

**Übung 1 — Erinnern**

In Ihren eigenen Worten: Was ist der Unterschied zwischen EBS und EFS? Wann würden Sie das eine gegenüber dem anderen wählen?

*(Hinweis: Denken Sie darüber nach, ob eine oder mehrere Instanzen gleichzeitig auf die Speicherung zugreifen müssen.)*

**Übung 2 – Klausurenübung**

*Szenario*: Ein Unternehmen betreibt eine Webanwendung über vier EC2-Instanzen hinter einem Load Balancer. Benutzer können Profilfotos hochladen. Alle vier Instanzen müssen in der Lage sein, jedes Benutzers Foto sofort nach dem Hochladen zu bedienen, unabhängig davon, welche Instanz den Upload durchgeführt hat. Das Team benötigt persistente, gemeinsam genutzte Dateispeicherung.

Welche Speichlösung erfüllt ihre Anforderungen BEST?

A) Einen EBS gp3-Bandlaufwerk an jede EC2-Instanz anbringen und Dateien mithilfe eines Cron-Jobs synchronisieren
B) Fotos direkt auf der Instanzeinheit der EC2-Instanz speichern
C) Amazon EFS verwenden, das gleichzeitig auf allen vier EC2-Instanzen gemountet ist
D) Fotos in S3 speichern und sie direkt über den Anwendungscode abrufen

**Hinweis 1**: Die Anforderung lautet "alle vier Instanzen müssen jedes Foto bedienen". Welche Optionen machen eine Datei für alle Instanzen sofort sichtbar?

**Hinweis 2**: Die Instanzeinheit ist flüchtig. EBS kann nicht gleichzeitig auf mehreren Instanzen gemountet werden. Das schränkt die Möglichkeiten ein.

**Hinweis 3**: Sowohl C als auch D könnten theoretisch funktionieren. Welche ist für den Fall, dass die Anwendung Fotos über Dateisystemoperationen anstatt HTTP-Anfragen zugreifen muss, geeigneter?

**Antwort**: D

**Erläuterung**: Das Speichern von Fotos in S3 und deren bedienung über URL ist die architektonisch korrekte Wahl für eine Webanwendung. Hochgeladene Fotos sind sofort von jedem Server (und jedem Browser) über die S3-URL zugänglich. S3 ist für diesen Anwendungsfall konzipiert: das Speichern von Benutzer-hochgeladenen Dateien im großen Maßstab mit hoher Verfügbarkeit und ohne Verwaltungsaufwand.

Note: C (EFS) würde technisch gesehen funktionieren, aber S3 ist das bevorzugte Muster für von Benutzern hochgeladene Binärdateien in Webanwendungen, da es günstiger, skalierbarer ist und Dateien direkt über HTTP ohne, dass die Anwendung als Proxy fungiert, bereitstellt.

**Warum nicht A?** Das Synchronisieren von Dateien über einen Cron-Job erzeugt Race Conditions und Konsistenzprobleme. Zwischen Uploads und dem nächsten Synchronisierungsdurchlauf würden Dateien auf anderen Instanzen fehlen.

**Warum nicht B?** Instanzspeicher-Daten gehen verloren, wenn die Instanz gestoppt oder beendet wird. Die Fotos würden verschwinden.

**Warum nicht C?** EFS ist die richtige Antwort, wenn die Anwendung Dateisystem-Semantik benötigt (z. B. ein CMS, das Dateien in-Place bearbeitet). Für von Benutzern hochgeladene Fotos, die über das Web bereitgestellt werden, ist S3 einfacher, günstiger und geeigneter.

*SAA-C03 Domain 3 — Task 3.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus fügt eine neue Funktion hinzu: Restaurantbesitzer können PDF-Speisekarten hochladen, die dann geparst und zur Verknüpfung mit der Nimbus-Datenbank verwendet werden. Die PDF-Verarbeitungsaufgabe läuft auf einer Flotte von EC2-Instanzen, die Folgendes tun müssen: (a) die hochgeladene PDF-Datei lesen, (b) temporäre Verarbeitungsvolumen schreiben und (c) die geparste Ausgabe schreiben.

Welche Speicherdienste würden Sie für jeden dieser drei Schritte verwenden und warum?

*(Es gibt keine eindeutige richtige Antwort. Konzentrieren Sie sich auf die Übereinstimmung des Speichertypes mit den Eigenschaften jedes Schrittes.)*

## Post-Credits Szene

Am Nachmittag ordnete Nimbus ihren Speicher richtig an. Die Datenbank erhielt ein eigenes EBS-Volume mit automatischen Snapshots. Die Speisekartenfotos wurden nach S3 verschoben. Die EC2-Instanz hatte endlich Luft zum Atmen.

Leo führte einen Lasttest durch. Die Seite konnte von zwei hundert gleichzeitigen Benutzern ohne Probleme bedient werden.

Tom sah die Rechnung. Das EBS-Volume verursachte 8 Dollar pro Monat. Er notierte es.

"Ich füge immer Dinge zu dieser Rechnung hinzu", sagte er. "Wann gleicht sie sich aus?"

"Wenn wir Ausfälle beenden", sagte Maya. "Jeder Ausfall kostet mehr als die Prävention."

Tom wirkte nicht überzeugt. Er würde es irgendwann sein.

Drei Tage später versuchte ein Restaurantbesitzer auf der Plattform eine Bestellung aufzugeben und erhielt
einen Fehler. Maya überprüfte die Protokolle.

Die Datenbank war vorhanden. Die Anwendung lief. Aber zwanzig gleichzeitige Benutzer versuchten alle gleichzeitig, das Menü zu lesen, und jeder traf die Datenbank.

"Jeder Seitenaufruf ist eine Datenbankabfrage", sagte Leo. "Jede einzelne."

Priya war bereits bei Google auf der Suche nach etwas.

Im nächsten Kapitel: was passiert, wenn mehr Kunden ankommen als der Server bewältigen kann.
