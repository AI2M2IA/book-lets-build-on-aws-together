# Kapitel 5: Der Aktenschrank, der in der Cloud lebt

Leo räumte die EC2-Instanz um neun Uhr morgens auf, als er den Ordner fand.

Das Büro war ruhig. Maya war noch nicht angekommen. Der Kaffee kochte noch. Vor dem Fenster zogen die frühen Pendler vorbei. Leo hatte seine Kopfhörer auf und scrollte durch Verzeichnisse, als er innehielt.

Achthundert Dateien. Alle davon Menüfotos. Alle davon auf einer einzigen Maschine ohne Backup.

Die EC2-Instanz, auf der die Nimbus-App lief, war seit dem zwölfminütigen Ausfall einmal aktualisiert worden, aber der Fotospeicher war nie umgezogen. Jede knusprige Arepa, jeder gegrillte Lachsteller, jede perfekt angerichtete Salatschüssel — saß auf einer einzigen virtuellen Maschine, von der sie bereits bewiesen hatten, dass sie ohne Vorwarnung ausfallen konnte.

Und wenn diese Maschine jemals neu gestartet, vergrößert oder ersetzt würde?

Weg.

"Wie viele Fotos haben Kunden bisher hochgeladen?" fragte Maya, als sie ankam.

Leo drehte sich um. "Ungefähr achthundert."

"Und was passiert mit diesen achthundert Fotos, wenn wir den Server neu starten?"

Noch eine von Leos bedeutungsvollen Pausen.

Dieses Kapitel handelt davon, wo Dateien in der Cloud eigentlich hingehören.

**Das Problem damit, Dateien "auf dem Server" zu speichern**

Wenn Sie Dateien direkt auf einer EC2-Instanz speichern — in ihrem Dateisystem — binden Sie diese Dateien an den Lebenszyklus genau dieser Maschine.

Das erzeugt mehrere Probleme:

**Von Natur aus vergänglich.** EC2-Instanzen können gestoppt, terminiert, ersetzt werden. Ihre lokale Festplatte ist nicht als dauerhafter Speicher gedacht. Sie ist temporärer Arbeitsbereich.

**Single Point of Failure.** Wenn die Instanz ausfällt, gehen die Dateien mit ihr. Keine Redundanz. Kein Backup. Ein schlechter Morgen und achthundert Menüfotos verschwinden.

**Nicht über Instanzen teilbar.** Wenn Sie einen zweiten Server hinzufügen (was Sie in Kapitel 7 tun werden), sieht er die Dateien nicht, die auf der Festplatte des ersten Servers gespeichert sind. Die beiden Server sind isoliert. Ein Nutzer, der ein Foto hochlädt, sieht es vielleicht; ein anderer Nutzer, der auf einem anderen Server landet, vielleicht nicht.

**Keine Skalierung.** Der EC2-Festplattenplatz ist endlich. Wenn Sie ihn füllen, hören Sie entweder auf, Uploads anzunehmen, oder erweitern unter Druck hektisch den Speicher.

Leo hatte nicht bedacht, was mit mehreren Servern passierte. Er erwähnte es beiläufig gegenüber Priya.

"Moment — wie würde das Fotoproblem mit zwei Servern funktionieren?" fragte Priya.

"Was meinst du?"

"Wenn wir Server A und Server B hinter einem Load Balancer haben", sagte Priya, "und ein Kunde lädt ein Foto hoch — seine Anfrage geht an Server A, richtig? Also wird das Foto auf der Festplatte von Server A gespeichert. Jetzt geht seine nächste Anfrage an Server B. Server B hat das Foto nicht. Was sieht der Kunde?"

Leo öffnete den Mund. Dann schloss er ihn.

"Ein kaputtes Bild", sagte er schließlich.

"Oder einen 404-Fehler", sagte Priya. "Oder, wenn die Anwendung versucht, es zu laden, und abstürzt, eine Fehlerseite."

Sie skizzierte den Load-Balancer-Plan auf dem Whiteboard — das Hinzufügen eines zweiten Servers stand bereits auf der Roadmap. In dem Moment, in dem es geschah, würde jeder Foto-Upload zu einem Münzwurf werden: hochladen auf Server A, möglicherweise ausgeliefert von Server B, Foto fehlt, Kunde verwirrt.

"Wir hätten eine Woche lang daran gedebuggt, bevor wir herausgefunden hätten, was falsch war", sagte Leo.

"Haben wir bedacht, was passiert, wenn wir Auto Scaling einschalten und plötzlich drei oder vier Server haben?" fragte Priya. "Uns würden ständig Fotos fehlen."

Das ist eine Klasse von Fehlern, die in Unit-Tests nicht auftaucht. Sie erscheint nur in der Produktion, unter Last, wenn echter Traffic über mehrere Server verteilt ist. Die Lösung besteht darin, Dateien gar nicht mehr auf den Servern zu speichern.

Es gibt ein besseres Modell. AWS hat es 2006 gebaut, und es ist immer noch einer der am weitesten verbreiteten Cloud-Dienste der Welt.

**Die Festplatte, die online lebt**

Stellen Sie sich eine Festplatte vor, die im Internet lebt — eine, die skaliert, um so viel zu fassen, wie Sie je brauchen, und Ihnen nur das berechnet, was Sie tatsächlich nutzen. Sie provisionieren sie nie. Sie sorgen sich nie darum, dass Ihnen der Platz ausgeht. Wenn Sie heute achthundert Fotos hineinlegen und nächstes Jahr acht Millionen, ändert sich auf Ihrer Seite nichts außer dem Rechnungsposten.

Das ist es, was AWS bietet. Sie nennen es **Amazon S3** — Simple Storage Service.

S3 ist der Objektspeicherdienst von AWS. Es ist nicht ganz wie ein Dateisystem und nicht ganz wie eine Datenbank. Es speichert Dateien — Objekte genannt — in benannten Containern namens Buckets. Das Modell ist einfach, und diese Einfachheit ist der Punkt.

Das Schlüsselkonzept in S3 ist das **Objekt**.

Ein Objekt ist jede Datei: ein Foto, ein Video, ein PDF, eine CSV, ein Backup, eine Logdatei. S3 kümmert sich nicht um den Typ oder die Struktur. Es speichert Bytes und gibt sie zurück, wenn Sie danach fragen.

Objekte leben in **Buckets**. Ein Bucket ist wie ein Ordner oberster Ebene — ein benannter Container innerhalb von S3, der Ihre Objekte enthält. Jeder Bucket hat einen global eindeutigen Namen (keine zwei Buckets über alle AWS-Konten hinweg können einen Namen teilen) und existiert in einer bestimmten Region.

**Wie S3 funktioniert**

Sie **laden** ein Objekt in einen Bucket **hoch**. S3 gibt ihm einen **Key** — im Wesentlichen einen Pfadnamen wie `menus/restaurant-001/photo-arepa.jpg`. Dieser Key identifiziert das Objekt eindeutig innerhalb des Buckets.

Sie **laden** das Objekt mithilfe des Bucket-Namens und des Keys **herunter** (oder rufen es ab).

Sie können Objekte auch öffentlich zugänglich machen — was bedeutet, dass jeder mit der URL sie herunterladen kann. So liefern die meisten Websites Bilder aus: das Bild in S3 speichern, es öffentlich machen, die URL in Ihr HTML einbetten.

Oder Sie halten Objekte privat — nur für authentifizierte Anfragen zugänglich. Das ist das richtige Modell für Kundendaten, Backups und alles Sensible.

S3 ist kein Dateisystem. Es gibt keine echten Ordner. Der `/` in einem Key-Namen ist nur eine Konvention — S3 behandelt den gesamten Key als flache Zeichenkette. Aber es sieht aus wie Ordner und die meisten Tools stellen es als Ordner dar, also machen Sie sich in der Praxis keine Sorgen über diese Unterscheidung.

Es gibt einige betriebliche Eigenschaften von S3, die in der Praxis wichtig sind, aber aus der Beschreibung nicht offensichtlich sind:

**Objekt-Unveränderlichkeit**: S3-Objekte werden nicht an Ort und Stelle bearbeitet. Wenn Sie eine Datei aktualisieren, laden Sie eine neue Version des Objekts mit demselben Key hoch. S3 ersetzt das alte Objekt durch das neue (oder, mit aktivierter Versionierung, behält beide). Anders als bei einer Datenbank, wo Sie eine Zeile mit `UPDATE` ändern, sind S3-Objekte write-once, read-many. Für Textdateien und Dokumente, die Sie häufig bearbeiten, ist das in Ordnung — laden Sie einfach die neue Version hoch. Für sehr große Dateien, bei denen Sie nur einen Teil des Inhalts aktualisieren möchten, bedeutet das Objektmodell von S3, dass Sie jedes Mal die gesamte Datei erneut hochladen.

**Strong Read-after-Write-Konsistenz**: Seit Dezember 2020 bietet S3 starke Konsistenz für alle Objekte — neue Schreibvorgänge sind sofort für nachfolgende Lesevorgänge sichtbar. Vor 2020 hatte S3 für einige Operationen eventuelle Konsistenz, was subtile Fehler in Anwendungen verursachte, die ein Objekt schrieben und sofort versuchten, es zu lesen. Die Verbesserung des Konsistenzmodells beseitigte diese Klasse von Fehlern.

**Objekt-URLs**: Jedes S3-Objekt hat eine URL. Für ein öffentliches Objekt sieht sie so aus: `https://bucket-name.s3.region.amazonaws.com/key/path`. Für private Objekte können Sie Pre-signed URLs generieren, die Authentifizierungsinformationen enthalten und nach einer konfigurierten Zeit ablaufen. Beide URL-Formate sind die Art, wie Anwendungen und Browser Objekte tatsächlich abrufen — es ist kein proprietäres Protokoll beteiligt.

**Keine Verzeichnisse zu erstellen**: Weil S3 keine echten Ordner hat, gibt es keine Operationen zum Erstellen von Verzeichnissen. Sie laden einfach ein Objekt mit einem Key hoch, der das Pfad-Präfix enthält. Der "Ordner" erscheint automatisch in der Konsole, wenn Objekte mit diesem Präfix existieren, und verschwindet automatisch, wenn alle Objekte mit diesem Präfix gelöscht werden.

**Warum S3 anders ist als eine normale Festplatte**

Drei Dinge machen S3 grundlegend anders als Dateispeicher auf einer EC2-Instanz:

**Haltbarkeit.** AWS entwirft S3 für 99,999999999 % (elf Neunen) Haltbarkeit. Das bedeutet, dass Sie, wenn Sie zehn Millionen Objekte speichern, erwarten könnten, alle zehntausend Jahre ein Objekt durch Hardware-Ausfall zu verlieren. Sie erreichen das, indem sie automatisch mehrere Kopien jedes Objekts über mindestens drei Availability Zones speichern.

Aber Haltbarkeit schützt vor Hardware-Ausfall — nicht davor, dass Sie versehentlich etwas löschen. Dafür ist die Versionierung da.

Es gibt eine wichtige Unterscheidung zwischen **Haltbarkeit** und **Verfügbarkeit**. Bei Haltbarkeit geht es darum, ob Ihre Daten noch existieren. Bei Verfügbarkeit geht es darum, ob Sie gerade jetzt darauf zugreifen können. S3 Standard bietet 99,999999999 % Haltbarkeit und 99,99 % Verfügbarkeit. Die Haltbarkeitszahl ist fast unbegreiflich hoch; die 99,99-%-Verfügbarkeitszahl ist ein *Designziel* — etwa 52 Minuten Nichtverfügbarkeit pro Jahr. Das vertragliche *SLA* ist tatsächlich niedriger (99,9 % pro Monat), und es zu verfehlen bringt Ihnen Service-Gutschriften ein, keine Betriebszeit. In der Praxis ist die S3-Verfügbarkeit viel höher als beide Zahlen — aber es lohnt sich zu verstehen, dass Haltbarkeit und Verfügbarkeit separate Garantien sind und dass Designziele und SLAs separate Versprechen sind.

**Verfügbarkeit.** S3 ist so konzipiert, dass es zugänglich ist, auch wenn einzelne Komponenten ausfallen. Sie verbinden sich nicht mit einem Server — Sie verbinden sich mit einem verteilten System, das Ausfälle umleitet.

**Maßstab.** S3 hält eine im Wesentlichen unbegrenzte Datenmenge. Ein einzelner Bucket kann Billionen von Objekten halten. Amazon selbst verwendet S3, um Daten in einem Maßstab zu speichern, der schwer zu begreifen ist. Die größten S3-Buckets der Welt halten Exabytes an Daten — Millionen von Terabytes. Sie verwalten diesen Maßstab nicht; Sie laden einfach Objekte hoch, und S3 kümmert sich um alles darunter.

**Kosten.** S3 Standard kostet zum Zeitpunkt dieser Niederschrift ungefähr 0,023 Dollar pro GB pro Monat. Für Nimbus' achthundert Menüfotos bei durchschnittlich 2 MB pro Foto sind das 1,6 GB Speicher — etwa 0,04 Dollar pro Monat. Selbst bei 800.000 Fotos liegen Sie bei 37 Dollar pro Monat für den Speicher. Die Kosten desselben Speichers auf einem EBS-Volume wären ungefähr 128 Dollar pro Monat, mit einer festen Obergrenze, die eine Erweiterung erforderte, bevor Sie mehr hinzufügen konnten. S3 wächst automatisch und berechnet proportional. EBS hat eine feste Größe und feste Kosten.

**Versionierung: Der Rückgängig-Knopf**

Hier ist etwas, das Maya fand, als sie die S3-Konsole erkundete.

S3 unterstützt **Versionierung**. Wenn Sie die Versionierung für einen Bucket aktivieren, behält S3 jede Version jedes Objekts — einschließlich früherer Versionen und gelöschter Versionen.

Das ist der Rückgängig-Knopf für Ihre Dateien.

Priya wollte es testen, bevor sie ihm vertraute. Sie lud ein Menüfoto in den Bucket hoch und lud dann eine neue Version mit der falschen Datei hoch — ein komplett schwarzes Bild, das sie in dreißig Sekunden erstellt hatte.

Sie öffnete die S3-Konsole, klickte auf "Versionen anzeigen" und fand beide: die schlechte Version (aktuell) und das Original (vorherige). Sie stellte die vorherige Version wieder her, indem sie sie als neue aktuelle Version zurückkopierte.

"Es funktioniert", sagte sie.

"Wie viel kostet es, all diese Versionen zu behalten?" fragte Tom.

Sie zahlen für den Speicher jeder Version. Wenn Sie viele Versionen großer Dateien haben, summiert sich das. AWS hat **Lifecycle-Richtlinien**, die alte Versionen nach einer bestimmten Zeit automatisch löschen — wir behandeln diese in Kapitel 23, wenn wir uns ausführlich mit Kostenoptimierung befassen.

"Wir aktivieren also die Versionierung, setzen aber eine Lifecycle-Regel, um alte Versionen nach dreißig Tagen zu löschen", sagte Priya. "So haben wir ein Wiederherstellungsfenster, ohne dafür zu zahlen, jede Version für immer zu speichern."

Tom schrieb die Zahl auf. Die Speicherkosten für dreißig Tage Versionen waren akzeptabel.

**S3 Event Notifications: Dateien, die Dinge tun**

Leo betrachtete die Menüfotos aus einem anderen Blickwinkel.

"Im Moment", sagte er, "wenn ein Restaurant ein Foto hochlädt, speichern wir das Original in voller Auflösung. Einige davon sind viertausend mal dreitausend Pixel. Jedes Mal, wenn ein Kunde die Menüseite auf einem Telefon lädt, liefern wir ein vier Megabyte großes Bild."

"Wie viel kostet das an Bandbreite?" fragte Tom.

Leo rief die Datenübertragungszahlen auf der Rechnung auf. Die Antwort lautete "mehr, als es sollte".

S3 hat ein Feature namens **Event Notifications**. Wenn ein Objekt in einen Bucket hochgeladen wird, kann S3 automatisch einen anderen Dienst auslösen — wie Lambda, den Serverless-Computing-Dienst, den wir in Kapitel 20 behandeln. Dieser Auslöser kann Code als Reaktion auf den Upload ausführen, ohne manuelles Eingreifen.

Die Nimbus-Lösung: Jedes Mal, wenn ein Foto in den Rohfoto-Bucket hochgeladen wird, löst eine S3 Event Notification eine Lambda-Funktion aus. Die Lambda-Funktion liest das Originalfoto, generiert ein 400 Pixel breites Thumbnail und speichert es in einem Bucket für verarbeitete Fotos. Die kundenseitige App liefert das Thumbnail statt des Originals.

Die Pipeline:

1. Restaurant lädt 4-MB-Originalfoto in `nimbus-photos-raw/restaurant-001/arepa.jpg` hoch
2. S3 feuert eine Event Notification
3. Lambda-Funktion liest das Original, generiert ein 400x300-Thumbnail
4. Lambda speichert das Thumbnail in `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. Kunde lädt das Menü, App liefert das 40-KB-Thumbnail statt des 4-MB-Originals

Das Ergebnis: 99 % Reduktion der Bildbandbreite. Schnellere Seitenladevorgänge. Ein kleinerer Datenübertragungsposten auf der Rechnung. Die Originale werden im Roh-Bucket aufbewahrt, sodass das Quellmaterial vorhanden ist, falls Nimbus jemals Versionen mit höherer Auflösung generieren möchte.

"Das läuft automatisch?" fragte Maya.

"Jedes Mal, wenn jemand ein Foto hochlädt", sagte Leo. "Wir fassen es nie an."

Dieses Muster — ereignisgesteuerte Verarbeitung, ausgelöst durch Speicherereignisse — ist eines der häufigsten und mächtigsten Muster in der modernen Cloud-Architektur. Wir greifen es in Kapitel 20 gründlich wieder auf.

**Cross-Region Replication: Wenn eine Kopie nicht genug ist**

Priya warf am Ende der Woche eine Compliance-Frage auf.

"Wenn Nimbus expandiert, um Restaurants in der EU zu bedienen", sagte sie, "und diese Restaurants Fotos hochladen — werden diese Fotos in unserem `us-west-2`-Bucket gespeichert?"

"Ja", sagte Leo.

"Und hat die DSGVO etwas dazu zu sagen, wo diese Daten gespeichert werden?"

Das tut sie. Die Datenübertragungsbestimmungen der DSGVO bedeuten, dass personenbezogene Daten über EU-Einwohner möglicherweise Speicherung innerhalb der EU oder in einer Rechtsordnung mit angemessenem Datenschutz erfordern.

S3' Antwort darauf ist **Cross-Region Replication** (CRR). Wenn Sie CRR für einen Bucket aktivieren, wird jedes neue hochgeladene Objekt automatisch in einen Bucket in einer anderen Region repliziert. Sie konfigurieren den Quell-Bucket, den Ziel-Bucket und die IAM-Role, die S3 die Berechtigung gibt, die Replikation durchzuführen.

Wenn die EU-Expansion stattfindet, lautet der Plan so: Von EU-Restaurants hochgeladene Fotos gehen in einen `eu-west-1`-Bucket, und CRR repliziert sie in einen Backup-Bucket in `eu-central-1` (Frankfurt) zur Notfallwiederherstellung. EU-Daten bleiben in EU-Regionen.

"Wie viel würde das kosten?" fragte Tom.

Es fallen regionsübergreifende Datenübertragungs- und Speicherkosten an — ungefähr der Übertragungstarif pro GB von der Quellregion zum Ziel, plus Speicher für die replizierten Kopien. Tom rechnete für Nimbus' prognostiziertes EU-Fotovolumen nach und stellte fest, dass es akzeptabel wäre.

"Und was, wenn jemand versucht, in die Replikations-Pipeline einzubrechen?" fragte Priya. "Die IAM-Role, die die Replikation durchführt, sollte eng eingegrenzt sein — nur S3-Replikationsaktionen, nur auf den spezifischen Buckets."

Sie schrieb diese Anforderung in den Expansionsplan.

**Multipart Upload und das Problem unvollständiger Uploads**

Tom fand einen unerwarteten Posten auf der AWS-Rechnung.

"Wir zahlen für Speicher in S3", sagte er, "aber die Menge ist höher, als ich aufgrund der Anzahl der Fotos, die wir haben, erwarten würde."

Leo untersuchte es. Er fand eine Kategorie im S3-Storage-Lens-Bericht: **unvollständige Multipart-Uploads**.

Wenn S3 eine Datei hochlädt, die größer als eine bestimmte Größe ist, verwendet es **Multipart Upload**: Die Datei wird in Teile aufgeteilt, jeder Teil wird separat hochgeladen, und dann werden die Teile zum endgültigen Objekt zusammengesetzt. Das macht große Uploads zuverlässiger — wenn ein Teil fehlschlägt, muss nur dieser Teil erneut versucht werden, nicht die gesamte Datei.

Aber wenn ein Multipart-Upload gestartet und dann abgebrochen wird — der Nutzer schloss den Browser, das Netzwerk brach ab, die Anwendung stürzte ab —, bleiben die Teilstücke in S3 und sammeln Speichergebühren an. Sie sind nicht als abgeschlossene Objekte sichtbar, werden aber als Speicher berechnet.

"Wie viel?" fragte Tom.

"Etwa 12 Dollar im Monat", sagte Leo. "Von Teil-Uploads, die nie abgeschlossen wurden."

Die Lösung: eine S3-**Lifecycle-Regel**, die unvollständige Multipart-Uploads nach sieben Tagen automatisch löscht. Jeder Upload, der in einer Woche nicht abgeschlossen wurde, wird verworfen, und die Teilstücke werden bereinigt.

Tom fügte die Lifecycle-Regel an jenem Nachmittag hinzu. Die Gebühr von 12 $/Monat verschwand innerhalb von Tagen.

"Das sind 144 Dollar im Jahr", sagte Tom und schaute auf seine Tabelle. "Für nichts."

"Ich habe schon einen Lasttest aufgesetzt, der Multipart-Uploads verwendete", sagte Leo. "Oh." Eine Pause. "Das sind wahrscheinlich die meisten davon. Ich habe vergessen, ihn aufzuräumen, als der Test fertig war."

Tom schrieb es trotzdem auf.

**Zugangskontrolle: Öffentlich vs. Privat**

Standardmäßig ist alles in S3 privat. Nur Ihr AWS-Konto kann darauf zugreifen.

Sie können einzelne Objekte öffentlich machen — so würden Sie Menübilder an Website-Besucher ausliefern. Oder Sie halten alles privat und generieren **Pre-signed URLs**: zeitlich begrenzte Links, die jemandem erlauben, ein bestimmtes Objekt herunterzuladen, ohne AWS-Anmeldedaten zu benötigen. Perfekt, um einem Kunden zu erlauben, seine Rechnung 24 Stunden lang herunterzuladen.

Priya hatte sehr starke Meinungen dazu.

"Und was, wenn jemand versucht, durch einen falsch konfigurierten Bucket einzubrechen?" sagte sie. "Machen Sie einen Bucket niemals vollständig öffentlich, es sei denn, Sie haben bewusst entschieden, jedes Objekt darin für das gesamte Internet zugänglich zu machen. Der häufigste S3-Sicherheitsfehler ist das versehentliche Exponieren eines Buckets, der sensible Daten enthält."

AWS hat jetzt eine "Block Public Access"-Einstellung, die Sie auf Kontoebene anwenden können und die alle Buckets zwingt, privat zu sein, es sei denn, Sie überschreiben es explizit pro Bucket.

Aktivieren Sie sie. Immer.

Die Geschichte dahinter: Bevor AWS Block Public Access auf Kontoebene hinzufügte, war der häufigste S3-Sicherheitsvorfall das versehentliche Öffentlichmachen eines Buckets. Ein Entwickler erstellte einen Bucket zum Testen, kreuzte aus Bequemlichkeit das "öffentlich"-Kästchen an, fügte einige Dateien hinzu, darunter ein paar aus anderen Ordnern, an die er nicht gedacht hatte, und vergaß ihn dann. Der Bucket saß dort, öffentlich zugänglich, monatelang. In einigen prominenten Fällen enthielt der "vergessene Test-Bucket" Kundendaten, interne Dokumente oder Anmeldedaten.

Block Public Access auf Kontoebene ist eine Schutzmaßnahme dagegen. Selbst wenn ein Entwickler einen Bucket versehentlich öffentlich konfiguriert, überschreibt die Einstellung auf Kontoebene dies. Sie müssen die Einstellung auf Kontoebene explizit deaktivieren, bevor irgendein Bucket öffentlich werden kann — was eine bewusste Bremsschwelle schafft, die Unfälle verhindert.

Nimbus hatte Block Public Access auf Kontoebene aktiviert. Wie würden also Menübilder, die öffentlich zugänglich sein mussten, ausgeliefert werden? Das Standardmuster — eines, das Nimbus später, in Kapitel 13, übernehmen würde — besteht darin, ein CDN wie CloudFront vor den Bucket zu setzen, mit einer Origin-Access-Control-Richtlinie: Das CDN kann Objekte aus einem privaten S3-Bucket abrufen, aber niemand kann direkt auf den Bucket zugreifen. Dieses Muster ist sicherer als ein öffentlicher Bucket und erlaubt es dem Caching des CDN, die S3-Anfragekosten zu reduzieren.

"Moment — aber *warum* würden wir es so machen?" fragte Maya. "Die Bilder sind sowieso öffentlich, warum spielt es also eine Rolle, ob der Bucket öffentlich ist?"

"Weil ein öffentlicher Bucket bedeutet, dass jeder aufzählen kann, was darin ist", sagte Priya. "Sie können alle Objekte im Bucket auflisten. Mit CloudFront davor sehen sie nur die URLs, die wir in der Anwendung exponieren. Der Bucket selbst bleibt privat."

Maya fügte "aufzählen" zu ihrem mentalen Modell von Angriffsflächen hinzu.

**S3-Storage-Klassen: Nicht alle Daten sind gleich**

Nicht auf alle Daten wird gleich zugegriffen.

Auf Ihre beliebtesten Menüfotos wird Dutzende Male pro Sekunde zugegriffen. Auf Ihre Logs von vor drei Jahren wird vielleicht einmal im Jahr zugegriffen, wenn überhaupt. S3 erkennt das und bietet verschiedene **Storage-Klassen** mit unterschiedlichen Leistungs- und Kostenkompromissen an.

| Storage-Klasse           | Anwendungsfall                                          | Abruf            | Kosten                          |
|--------------------------|--------------------------------------------------------|------------------|---------------------------------|
| S3 Standard              | Häufig abgerufene Daten                                 | Sofort           | Höher pro GB                    |
| S3 Standard-IA           | Seltener Zugriff, braucht trotzdem schnellen Abruf     | Sofort           | Niedriger pro GB, Abrufgebühr   |
| S3 Glacier Instant       | Archive, auf die gelegentlich zugegriffen wird         | Sofort           | Viel niedriger                  |
| S3 Glacier Flexible      | Archive, auf die selten zugegriffen wird               | Minuten bis Stunden | Sehr niedrig                 |
| S3 Glacier Deep Archive  | Compliance-Archive, auf die fast nie zugegriffen wird  | Bis zu 12 Stunden | Am niedrigsten                 |

Wir gehen in Kapitel 23 ausführlich auf diese ein. Vorerst gilt: Das Konzept ist, dass Sie Objekte basierend auf ihrem Alter und ihren Zugriffsmustern automatisch zwischen Storage-Klassen verschieben können, wodurch Sie bei Daten, die Sie selten anfassen, erheblich Geld sparen.

Es gibt auch **S3 Intelligent-Tiering** — eine Storage-Klasse, die Objekte basierend auf beobachteten Zugriffsmustern automatisch zwischen Frequent-Access- und Infrequent-Access-Tiers verschiebt. Sie zahlen eine kleine Überwachungsgebühr pro Objekt pro Monat, und S3 handhabt das Tiering automatisch. Das ist nützlich, wenn Sie nicht sicher sind, auf welche Objekte häufig zugegriffen wird und auf welche nicht — der Dienst lernt das Muster und optimiert entsprechend.

Toms Ansatz war manueller: "Ich möchte wissen, wohin jeder Dollar geht." Er wählte explizite Lifecycle-Regeln statt Intelligent-Tiering, weil explizite Regeln vorhersehbar und prüfbar sind. Nach sechs Monaten Betrieb von Nimbus' S3-Speicher hatte er ein klares Bild der Zugriffsmuster und konnte Lifecycle-Regeln setzen, die Objekte nach 30 Tagen nach Standard-IA und nach 180 Tagen nach Glacier Flexible Retrieval verschoben.

Die gesamten Speichereinsparungen durch das Lifecycle-Management im ersten Jahr: ungefähr 340 Dollar. Nicht lebensverändernd, aber real — und das Muster wiederholt sich über Dutzende von Buckets in jedem ernsthaften AWS-Konto.

"Das ist fast ein Hin- und Rückflug", sagte Maya.

"Es ist gute Engineering-Praxis", sagte Tom. Er trug es in die Tabelle ein.

Es gibt eine Falle bei der Auswahl der Storage-Klasse, die viele Teams erwischt: **Mindestspeicherdauer**. S3 Standard-IA hat eine Mindestspeicherdauer von 30 Tagen — wenn Sie ein Objekt in Standard-IA speichern und es nach 15 Tagen löschen, zahlen Sie trotzdem für 30 Tage. Glacier Flexible Retrieval hat ein Minimum von 90 Tagen. Glacier Deep Archive hat ein Minimum von 180 Tagen.

Für Objekte, die häufig gelöscht werden oder kurze Lebensdauern haben, machen diese Minimums die IA- und Glacier-Klassen teurer als Standard, nicht günstiger. Bevor Sie zu einer günstigeren Storage-Klasse wechseln, überprüfen Sie, dass die Objekte tatsächlich lange genug dort leben werden, damit die Einsparungen die Strafen für die Mindestdauer übersteigen.

## Stärken und Einschränkungen

**Warum S3 ausgezeichnet ist**:

- Elf-Neunen-Haltbarkeit. Ihre Daten sind in S3 sicherer als auf fast jedem anderen System.
- Unbegrenzter Maßstab. Sie müssen nie Speicher provisionieren — er wächst einfach.
- Extrem günstig für das, was es bietet (Bruchteile eines Cents pro GB pro Monat).
- Native Integration mit fast jedem anderen AWS-Dienst.
- Unterstützt statisches Website-Hosting — Sie können eine vollständige statische Website
  direkt aus S3 ausliefern, kein Server erforderlich.
- Ereignisgesteuerte Verarbeitung: S3 Event Notifications lösen Lambda, SQS oder SNS
  automatisch aus, wenn Objekte erstellt oder gelöscht werden, was mächtige Verarbeitungs-
  Pipelines ohne Polling oder geplante Jobs ermöglicht.
- Cross-Region Replication für Compliance-Datenresidenz und Notfallwiederherstellung.

**Wo S3 nicht die richtige Wahl ist**:

- S3 ist kein Dateisystem. Wenn Ihre Anwendung ein Laufwerk einhängen und es wie eine
  lokale Festplatte verwenden muss (Lesen, Schreiben, Ändern von Dateien an Ort und Stelle), ist S3 das falsche Werkzeug.
  Verwenden Sie stattdessen EFS (Elastic File System, Kapitel 6) oder EBS.
- S3 hat eine Latenz, die merklich höher ist als die einer lokalen Festplatte. Für Datenbanken oder
  Anwendungen, die schnelle I/O mit wahlfreiem Zugriff benötigen, ist Blockspeicher (EBS, Kapitel 6)
  angemessen.
- Datenübertragung *in* S3 ist frei von Bandbreitengebühren — aber nicht ganz kostenlos:
  jeder Upload ist eine PUT-Anfrage, und S3 berechnet pro Anfrage. Das Hochladen von Millionen
  kleiner Objekte kann mehr an Anfragegebühren kosten als an Speicher. Datenübertragung *aus*
  S3 heraus kostet Geld pro GB. Beides sind häufige Abrechnungsüberraschungen — wir behandeln sie in Kapitel 30.
- S3 ist keine Datenbank. Sie können Objekte per Key speichern und abrufen, aber Sie können Objekte
  nicht nach ihrem Inhalt abfragen, Aggregationen durchführen oder relationale Operationen ausführen.
  Wenn Sie den Inhalt gespeicherter Daten abfragen müssen (nicht nur per Namen abrufen),
  brauchen Sie eine Datenbank oder einen Dienst wie Athena (Kapitel 26), der S3-Objekte
  mit SQL abfragen kann.
- Objektversionierung speichert Kosten, die sich aufsummieren. Jede frühere Version jedes
  versionierten Objekts wird als Speicher berechnet. Lifecycle-Regeln, die alte Versionen ablaufen lassen,
  sind nicht optional — sie sind Teil der Kostenmanagementstrategie für jeden Bucket
  mit aktivierter Versionierung.

**Wie S3-Objekte verschlüsselt werden**

"Und was, wenn jemand versucht einzubrechen?" fragte Priya, vorhersehbar, an dem Tag, an dem die Fotos live gingen. "Sind diese Objekte im Ruhezustand verschlüsselt?"

Das waren sie — und das ist es wert zu verstehen, denn die S3-Verschlüsselung ist eines der am meisten geprüften Themen in der Prüfung. Jedes in S3 hochgeladene Objekt wird standardmäßig im Ruhezustand verschlüsselt. Die Frage ist, *wer den Schlüssel hält*:

**SSE-S3 (die Voreinstellung)**: S3 verschlüsselt jedes Objekt mit Schlüsseln, die S3 selbst verwaltet, unter Verwendung von AES-256. Sie tun nichts, konfigurieren nichts, zahlen nichts. Seit Januar 2023 ist dies auf jedem Bucket automatisch. Für die meisten Daten ist es ausreichend.

**SSE-KMS**: S3 verschlüsselt Objekte mit einem KMS-Schlüssel — entweder dem von AWS verwalteten `aws/s3`-Schlüssel oder einem von Ihnen kontrollierten Customer-Managed-Schlüssel (Kapitel 16 behandelt KMS ausführlich). Was Sie gewinnen: einen Prüfpfad in CloudTrail über jede Schlüsselnutzung, die Fähigkeit, über die Schlüsselrichtlinie genau zu kontrollieren, wer entschlüsseln kann, und die Fähigkeit, den Zugang durch Deaktivieren des Schlüssels zu widerrufen. Was Sie zahlen: KMS-API-Gebühren pro Anfrage. Bei hohen Anfrageraten aktivieren Sie **S3 Bucket Keys** — S3 leitet einen kurzlebigen Schlüssel auf Bucket-Ebene aus Ihrem KMS-Schlüssel ab und reduziert so die KMS-API-Aufrufe (und Kosten) um bis zu 99 %.

**SSE-C**: Sie liefern Ihren eigenen Verschlüsselungsschlüssel *mit jeder Anfrage*. AWS verwendet ihn im Speicher und speichert ihn nie. Für Organisationen, deren Compliance-Regeln besagen, dass AWS den Schlüssel niemals halten darf. Betrieblich anspruchsvoll — verlieren Sie den Schlüssel, verlieren Sie die Daten.

Das Prüfungsmuster: "Verschlüsselung mit einem Prüfpfad der Schlüsselnutzung" oder "kontrollieren, wer entschlüsseln kann" → SSE-KMS. "Unternehmen muss seine eigenen Schlüssel verwalten und AWS darf sie niemals speichern" → SSE-C. "Verschlüsselung im Ruhezustand ohne Verwaltungsaufwand" → SSE-S3 (bereits aktiv).

**S3 Object Lock: Write Once, Read Many**

Manche Daten müssen *unmöglich* zu löschen sein — nicht durch eine Richtlinie geschützt, sondern strukturell unveränderlich. Finanzhandelsaufzeichnungen, Audit-Logs, juristische Beweise. **S3 Object Lock** macht Objekte für einen Aufbewahrungszeitraum unlöschbar und unveränderlich, selbst durch Administratoren. Es erfordert Versionierung, und es kommt in zwei Modi, die die Prüfung gerne gegenüberstellt: **Governance-Modus** (Nutzer mit einer speziellen Berechtigung können den Lock dennoch umgehen) und **Compliance-Modus** (niemand kann die Aufbewahrung verkürzen oder das Objekt löschen — nicht einmal der Root-Nutzer — bis der Zeitraum abläuft). Regulatorische Phrasen wie "WORM-Speicher" oder "SEC Rule 17a-4" sind Prüfungsauslöser für Object Lock im Compliance-Modus.

**S3 Transfer Acceleration: Schnelle Uploads aus der Ferne**

Wenn Nutzer große Dateien von der anderen Seite der Welt in einen Bucket hochladen, ist der langsame Teil der lange Weg über das öffentliche Internet zur Region des Buckets. **S3 Transfer Acceleration** gibt dem Bucket einen speziellen Endpunkt, der Uploads in die nächstgelegene AWS-Edge-Location leitet und sie dann über das private Backbone von AWS zum Bucket transportiert. Prüfungsauslöser: "Nutzer auf der ganzen Welt laden große Dateien in einen zentralen Bucket hoch; Uploads sind langsam" → Transfer Acceleration (oft mit Multipart Upload kombiniert). Beachten Sie die Richtung: Bei Transfer Acceleration geht es darum, Daten *in* S3 zu bekommen; bei CloudFront geht es darum, Daten *heraus* auszuliefern.

Noch eine Storage-Klasse, die es jetzt zu kennen lohnt: **S3 One Zone-IA** — wie Standard-IA, aber in einer einzigen Availability Zone gespeichert, etwa 20 % günstiger, für selten abgerufene Daten, die Sie neu erstellen könnten, falls diese AZ verloren ginge (Thumbnails, neu generierbare Berichte). Es ist ein Standard-Prüfungs-Ablenker; Kapitel 23 behandelt das gesamte Spektrum der Storage-Klassen.


## Zusammenfassung

Achthundert Fotos auf einer einzigen Instanz waren das Problem. S3 löste es — aber S3 ist mehr als ein Ort, um Dateien abzulegen. Es ist ein haltbarer, skalierbarer, global zugänglicher Objektspeicher mit eigenem Zugangsmodell, Storage-Klassen, Lifecycle-Richtlinien und Ereignissystem. Zu verstehen, worin S3 gut ist und worin es bewusst nicht gut ist, prägt jede Speicherentscheidung, die das Team von hier an treffen würde.

- **Amazon S3** ist Objektspeicher — Dateien (Objekte) in benannten Containern (Buckets). Es speichert Kopien über mindestens drei Availability Zones für Elf-Neunen-Haltbarkeit. S3 ist kein Dateisystem: Verwenden Sie EFS für gemeinsame Mounts, EBS für Blockspeicher einer einzelnen Instanz.
- Auf EC2-Instanzen gespeicherte Dateien sind an den Lebenszyklus dieser Instanz gebunden, was zu Fehlern mit fehlenden Fotos führt, wenn sich Traffic über mehrere Server verteilt. S3 löst das, indem es von jeder Instanz unabhängig ist.
- **Versionierung** bewahrt frühere Objektversionen. **Lifecycle-Regeln** automatisieren Übergänge zwischen Storage-Klassen und bereinigen unvollständige Multipart-Uploads, die sonst stille Abrechnungsgebühren ansammeln würden.
- Standardmäßig ist S3 privat. Aktivieren Sie "Block Public Access" auf Kontoebene. Liefern Sie öffentliche Objekte über CloudFront mit Origin Access Control aus, statt Buckets direkt öffentlich zu machen.
- S3-Storage-Klassen erlauben es Ihnen, Kosten an die Zugriffshäufigkeit anzupassen — aber achten Sie auf Mindestspeicherdauer-Gebühren, bevor Sie kurzlebige Objekte in Infrequent-Access- oder Glacier-Tiers überführen.

## Prüfungstipps

*SAA-C03-Domäne 3 — Aufgabe 3.1 (leistungsstarke Speicherlösungen)*

- **S3 ist Objektspeicher, kein Blockspeicher.** Wenn ein Prüfungsszenario ein
  Dateisystem braucht, das mehrere Server einhängen können, ist das EFS. Wenn es eine Festplatte
  für eine einzelne EC2-Instanz braucht, ist das EBS. Wenn es Dateien, Backups,
  Bilder oder Daten speichern muss, auf die per HTTP zugegriffen wird — das ist S3.
- **Elf-Neunen-Haltbarkeit** bedeutet, dass S3 Daten automatisch über mehrere AZs
  repliziert. Sie konfigurieren das nicht — es ist die Voreinstellung.
- **S3 ist regional**, aber global zugänglich. Buckets existieren in einer bestimmten Region,
  aber Sie können von überall darauf zugreifen.
- **Pre-signed URLs** erlauben zeitlich begrenzten Zugang zu privaten Objekten. Häufiges Muster:
  Ihre Anwendung generiert eine Pre-signed URL, die 15 Minuten gültig ist, gibt sie dem
  Nutzer, der Nutzer lädt die Datei direkt aus S3 herunter.
- **S3 Standard-IA** hat eine Mindestspeicherdauer-Gebühr (30 Tage). Verwenden Sie es nicht
  für Daten, die Sie schnell löschen. Die Prüfung testet, ob Sie die Kompromisse
  zwischen Storage-Klassen kennen.
- **Storage-Klassen-Entscheidungsbaum**: *häufig abgerufen* → S3 Standard; *selten abgerufen, aber braucht schnellen Abruf* → S3 Standard-IA; *Archiv, auf das gelegentlich zugegriffen wird* → S3 Glacier Instant Retrieval; *Archiv, auf das selten zugegriffen wird* → S3 Glacier Flexible Retrieval; *Compliance-Archiv, auf das fast nie zugegriffen wird* → S3 Glacier Deep Archive.
- **Cross-Region Replication** erfordert, dass die Versionierung sowohl im Quell- als auch im Ziel-Bucket aktiviert ist. Prüfungsfragen zu Notfallwiederherstellung oder Datensouveränität betreffen oft CRR.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist ein S3-Objekt? Was ist ein S3-Bucket? Warum ist das Speichern von Dateien
in S3 besser als das Speichern auf der lokalen Festplatte einer EC2-Instanz?

*(Hinweis: Denken Sie daran, was mit Dateien auf einer EC2-Instanz passiert, wenn die Instanz
terminiert wird. Was macht S3 anders?)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Medienunternehmen produziert Dokumentarvideos. Es muss originale
4K-Aufnahmen speichern (häufig während der Produktion abgerufen), bearbeitete Endfassungen (monatlich
zur Verteilung abgerufen) und Archiv-Master (unbegrenzt aufbewahrt, aber höchstens einmal
im Jahr zu Compliance-Zwecken abgerufen). Es möchte die Speicherkosten minimieren und dabei
die Zugriffsanforderungen jeder Stufe erfüllen.

Welche Speicherstrategie erfüllt seine Bedürfnisse AM BESTEN?

A) Originalaufnahmen in S3 Standard, Endfassungen in S3 Standard-IA und Archive
   in S3 Glacier Deep Archive speichern  
B) Alle Inhalte in S3 Standard für konsistente Leistung und Einfachheit speichern  
C) Alle Inhalte auf EC2-Instanzspeicher für den schnellsten Zugriff speichern  
D) Alle Inhalte in S3 Glacier Deep Archive speichern, um die Kosten zu minimieren

**Hinweis 1**: Verschiedene Dateien haben verschiedene Zugriffsmuster. S3 bietet verschiedene Storage-
Klassen für verschiedene Zugriffshäufigkeiten. Welche Klasse passt zu "häufig abgerufen"?

**Hinweis 2**: Archive, auf die "höchstens einmal im Jahr" zugegriffen wird, brauchen keinen sofortigen Abruf.
Welche Storage-Klasse ist für langfristige Archivierung zu minimalen Kosten ausgelegt?

**Hinweis 3**: Ordnen Sie die Zugriffshäufigkeit jeder Stufe der passenden Storage-Klasse zu.
Häufig abgerufen = Standard. Monatlich = Standard-IA. Einmal im Jahr = Glacier Deep Archive.

**Antwort**: A

**Erklärung**: Diese Strategie ordnet jede Datenstufe korrekt der passenden
S3-Storage-Klasse zu. Häufig abgerufene Originalaufnahmen bleiben in Standard für
sofortigen Zugriff ohne Abrufgebühren. Monatlich abgerufene Endfassungen gehen nach Standard-IA
(niedrigere Speicherkosten, erschwingliche Abrufgebühr). Archive, auf die einmal jährlich zugegriffen wird, gehen nach
Glacier Deep Archive für die niedrigstmöglichen Speicherkosten.

**Warum nicht B?** Alles in Standard zu speichern ist einfach, aber teuer.

**Warum nicht C?** EC2-Instanzspeicher ist vergänglich und nicht für langfristige
Medienspeicherung geeignet. Wenn die Instanz terminiert wird, gehen alle Inhalte verloren.

**Warum nicht D?** Glacier Deep Archive hat Abrufzeiten von bis zu 12 Stunden. Häufig
abgerufene Produktionsaufnahmen dort zu speichern würde die Produktionsarbeit unmöglich machen.

*SAA-C03-Domäne 3 — Aufgabe 3.1 / Domäne 4 — Aufgabe 4.1*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus speichert von Kunden hochgeladene Bestellfotos in S3. Eine Datenschutzregulierung
verlangt, dass Kundenfotos 7 Jahre lang gespeichert werden müssen, aber danach gelöscht werden
können. Das Team möchte außerdem die Kosten für das Speichern alter Fotos aus früheren Jahren minimieren.

Entwerfen Sie eine S3-Speicherstrategie für diese Anforderung. Welche Storage-Klassen würden Sie
verwenden, und wann würden Sie zwischen ihnen wechseln? Was würden Sie bezüglich der Löschanforderung
tun?

*(Hinweis: Denken Sie an Lifecycle-Richtlinien. Es gibt keine einzige richtige Antwort — denken Sie
die Kompromisse zwischen Kosten und Abrufzeit durch.)*

## Post-Credits-Szene

Leo migrierte die Menüfotos an jenem Nachmittag nach S3. Achthundert Objekte, sicher
über drei Availability Zones gespeichert, mit aktivierter Versionierung.

"Sie sind jetzt tatsächlich sicherer als zuvor", sagte er, mit einiger Zufriedenheit.

"Sie waren in S3 immer sicherer", sagte Priya. "Wir haben nur gewartet, bis wir das
Problem aufgebaut hatten, um es zu beheben."

Leo akzeptierte das.

Am nächsten Morgen kam Tom mit einem Ausdruck. Die AWS-Rechnung, mit rotem Stift kommentiert.

"Wir haben ein Datenbankproblem", sagte er. "Wir betreiben unsere Bestelldatenbank auf derselben
EC2-Instanz wie den Webserver. Und unsere Menüdatenbank. Und unsere Kundendatensätze."

Er hielt inne.

"Alles ist in derselben Maschine. Eine Maschine. All unsere Daten."

Maya schaute auf den Ausdruck. Dann auf Tom. Dann an die Decke.

"Und wenn diese Maschine kaputtgeht?"

Tom zeigte auf die Anmerkung mit dem roten Stift.

Im nächsten Kapitel: der Unterschied zwischen einer Festplatte, die Sie mieten, und einem Aktenschrank, den das ganze Büro teilt.
