# Kapitel 20: Das Freiberufler-Modell

Die Bestellbenachrichtigungsfunktion lief genau einmal pro Bestellung. Zwischen den Bestellungen tat sie nichts. Siebzehn Stunden lang an einem Dienstag gingen keine Bestellungen ein. Während dieser siebzehn Stunden kostete die Funktion nichts. Keinen Cent. Kein leerlaufender Server, keine wartende Instanz, keine reservierte Kapazität, die ungenutzt blieb. Die Funktion existierte. Sie lief nur nicht.

Das SNS/SQS-Fan-out funktionierte. Der Analysedienst, der Benachrichtigungsdienst und der E-Mail-Dienst verbrauchten jeweils aus ihren eigenen SQS-Warteschlangen.

Aber Priya hatte etwas bemerkt.

„Der E-Mail-Dienst", sagte sie. „Wie viele E-Mails versenden wir pro Stunde?"

Leo überprüfte die Metriken. „Durchschnittlich 400. Spitzenwert etwa 1.200 an Freitagabenden."

„Und die EC2-Instanz, die den E-Mail-Dienst betreibt – wie lange läuft die?"

„Immer. 24/7."

„Auch um 3 Uhr nachts, wenn wir null E-Mails versenden?"

Stille.

„Wir bezahlen dafür, dass ein Computer dasitzt und nichts tut", sagte Leo.

„Wie viele Stunden am Tag?"

Noch mehr Stille.

„Ungefähr 18."

Tom war jetzt sehr aufmerksam.

**Der Server ist nicht immer die Antwort**

EC2-Instanzen sind dauerhaft. Man startet eine, und sie läuft, bis man sie stoppt – 24 Stunden am Tag, 7 Tage die Woche, unabhängig von der tatsächlichen Nutzung. Für den Webserver (der zu allen Stunden Traffic verarbeitet) ist das richtig. Für den E-Mail-Dienst (der stoßweise E-Mails versendet und dann stundenlang im Leerlauf ist) ist es verschwenderisch.

Die Auto Scaling Group kann den E-Mail-Dienst während der Schwachlastzeiten auf eine Instanz herunterskalieren. Aber eine Instanz läuft immer noch konstant.

Was wäre, wenn der Code nur laufen würde, wenn es Arbeit gibt?

Das ist die Prämisse des **serverlosen Computings**.

**AWS Lambda: Code ohne Server**

**AWS Lambda** ermöglicht es, Code als Reaktion auf Ereignisse auszuführen, ohne Server bereitstellen oder verwalten zu müssen. Man lädt eine Funktion hoch, gibt an, was sie auslöst, und Lambda führt sie aus, wenn der Auslöser aktiviert wird.

Eine Lambda-Funktion:

- Hat keinen dauerhaften Zustand (jeder Aufruf ist unabhängig)
- Läuft bis zu 15 Minuten pro Aufruf
- Skaliert automatisch von 0 auf Tausende gleichzeitiger Aufrufe
- Wird nur beim Ausführen berechnet (pro 1 ms Ausführungszeit, aufgerundet, pro GB zugewiesenem Speicher)

Wenn kein Auslöser vorhanden ist, kostet Lambda nichts. Wenn Auslöser aktiviert werden, läuft Lambda und berechnet Gebühren. Wenn 10.000 Auslöser gleichzeitig aktiviert werden, führt Lambda 10.000 gleichzeitige Aufrufe aus. Die Skalierung ist automatisch und nahezu sofortig.

**Ereignisauslöser: Was Lambda aufweckt**

Lambda-Funktionen laufen nicht von selbst – sie reagieren auf Ereignisse. Übliche Auslöser sind:

- **SQS-Warteschlange**: Nachrichten aus einer Warteschlange verarbeiten. Lambda fragt die Warteschlange ab und ruft die Funktion mit Nachrichtenstapeln auf.
- **API Gateway**: Eine HTTP-Anfrage kommt an. API Gateway löst Lambda aus. Lambda erzeugt eine Antwort.
- **S3-Ereignis**: Eine Datei wird nach S3 hochgeladen. Lambda verarbeitet sie (Bild verkleinern, CSV einlesen, Dokument validieren).
- **SNS**: Eine Nachricht wird in einem Thema veröffentlicht. Lambda wird benachrichtigt.
- **DynamoDB Streams**: Ein Datensatz in DynamoDB ändert sich. Lambda verarbeitet die Änderung.
- **CloudWatch Events (EventBridge)**: Ein geplantes Ereignis (wie ein Cron-Job) läuft zu einem definierten Zeitpunkt.
- **ALB**: Eine HTTP-Anfrage trifft beim Load Balancer ein. Lambda kann bestimmte Routen verarbeiten.

Bei Nimbus wurde der E-Mail-Dienst zu einer Lambda-Funktion, die durch die SQS-Warteschlange ausgelöst wird. Wenn eine Nachricht in der Warteschlange eingeht, wird Lambda mit dem Nachrichteninhalt aufgerufen, sendet die E-Mail über SES (Simple Email Service) und beendet sich.

Null Server. Null Leerlaufzeit. Null Kosten im Leerlauf.

**Das Kaltstart-Problem**

Lambda-Funktionen laufen in **Ausführungsumgebungen** – kleinen, isolierten Containern. Wenn eine Funktion aufgerufen wird:

1. AWS prüft, ob eine warme Ausführungsumgebung verfügbar ist (eine, die kürzlich einen Aufruf verarbeitet hat)
2. Wenn warm: Die Funktion läuft sofort
3. Wenn kalt: AWS initialisiert eine neue Ausführungsumgebung – lädt den Code herunter, startet die Laufzeit, führt den Initialisierungscode aus – und führt dann die Funktion aus

Ein **Kaltstart** fügt 100 ms bis zu mehreren Sekunden Latenz hinzu, abhängig von der Laufzeit (Java und .NET haben längere Kaltstarts als Python und Node.js) und der Größe des Code-Pakets.

Bei asynchroner Verarbeitung (E-Mail-Versand, Bildverkleinerung) sind Kaltstarts für Benutzer unsichtbar.

Bei synchronen APIs (HTTP-Anfragen, bei denen ein Benutzer auf eine Antwort wartet) können Kaltstarts gelegentlich zu langsamen Antworten führen.

**Gegenmaßnahmen**:

- **Bereitgestellte Parallelität**: Eine bestimmte Anzahl von Ausführungsumgebungen vorwärmen. Sie sind immer bereit. Man bezahlt dafür, auch wenn sie keine Anfragen verarbeiten.
- **Kleinere Paketgrößen**: Kleinerer Code wird schneller initialisiert.
- **Aufwärm-Aufrufe**: Geplante Pings, um Funktionen warm zu halten (ein verbreiteter, aber uneleganter Ansatz).
- **Die richtige Laufzeit wählen**: Python und Node.js starten schneller kalt als Java.

**Lambda-Preisgestaltung: Warum Tom lächelte**

Die Lambda-Preisgestaltung hat zwei Komponenten:

1. **Anforderungsgebühr**: 0,20 $ pro Million Aufrufe
2. **Dauergebühr**: 0,0000166667 $ pro GB-Sekunde (zugewiesener Speicher × Laufzeit in Sekunden)

Die ersten eine Million Anfragen pro Monat sind kostenlos (immer, nicht nur im ersten Jahr).

Tom rechnete für den E-Mail-Dienst:

- 1.200 E-Mails pro Tag × 30 Tage = 36.000 Aufrufe pro Monat
- Jeder Aufruf dauert ~2 Sekunden bei 256 MB Speicher
- Dauer: 36.000 × 2 × 0,25 GB × 0,0000166667 $ = 0,30 $/Monat
- Anforderungen: 36.000 << 1.000.000 (kostenlose Stufe) = 0,00 $/Monat

Die EC2-Instanz für den E-Mail-Dienst: 18 $/Monat.

Tom schwieg einen Moment. Dann: „Wir sollten das für alles machen."

**Wofür Lambda gut ist (und wofür nicht)**

Lambda ist ausgezeichnet für:

- **Ereignisgesteuerte Verarbeitung**: Auf Ereignisse reagieren (Datei-Uploads, Warteschlangennachrichten, geplante Aufgaben)
- **Kurzlaufende Aufgaben**: Verarbeitung, die deutlich unter 15 Minuten abschließt
- **Unregelmäßigen, unvorhersehbaren Traffic**: Lambda skaliert von 0 auf Tausende sofort – keine Vorab-Bereitstellung
- **Seltene Operationen**: Ein Bericht, der täglich um 2 Uhr läuft. Ein Bereinigungsjob, der wöchentlich läuft.
- **Verbindungscode**: Kleine Funktionen, die Daten zwischen Diensten verschieben

Lambda ist schlecht für:

- **Lang laufende Prozesse**: Das 15-Minuten-Limit ist eine harte Grenze
- **Zustandsbehaftete Anwendungen**: Lambda-Funktionen sind zustandslos by Design – jeder Aufruf ist unabhängig
- **APIs mit hohem Durchsatz und niedriger Latenz**: Kaltstarts können Latenzspitzen verursachen; bereitgestellte Parallelität mindert dies, erhöht aber die Kosten
- **Anwendungen, die dauerhafte Verbindungen benötigen**: Lambda kann keinen langlebigen Datenbankverbindungspool leicht aufrechterhalten (obwohl Verbindungs-Pooling-Tools wie RDS Proxy helfen)
- **Traditionelle Webserver**: Möglich, aber nicht die natürliche Eignung

„Lambda ist also kein Ersatz für EC2", sagte Maya. „Es ist ein anderes Werkzeug für andere Aufgaben."

„Die Nimbus-Web-API bleibt auf EC2 oder ECS", bestätigte Leo. „Der E-Mail-Dienst, der Bildverkleinerer, der nächtliche Berichtsgenerator, der Log-Bereiniger – die wechseln zu Lambda."

**Die serverlose Philosophie**

Lambda ist Teil eines breiteren Konzepts: **serverlos** – Anwendungen erstellen, bei denen man keine Server verwaltet, nur Code.

Ein vollständig serverloser Nimbus-Stack könnte so aussehen:

- API Gateway + Lambda (anstatt EC2 mit einem Webserver)
- DynamoDB (anstatt RDS – ebenfalls serverlos, keine Serververwaltung)
- S3 (statische Assets – von Natur aus serverlos)
- SNS + SQS (Messaging – serverlos)
- Lambda (alle Hintergrundverarbeitung)

Der Reiz: Man schreibt Code; AWS verwaltet alles andere. Kein Patching, keine Skalierungskonfiguration, keine Kapazitätsplanung.

Die Realität: Serverlos hat seine eigene betriebliche Komplexität – Debugging verteilter Lambda-Funktionen, Verwaltung von Kaltstarts, Verstehen von Parallelitätsgrenzen. Es ist nicht einfacher, nur anders.

## Stärken und Grenzen

**Warum Lambda leistungsstark ist**:

- Echte Pay-per-Use – null Kosten im Leerlauf
- Automatische Skalierung ohne Konfiguration
- Keine Server, die gepatcht oder gewartet werden müssen
- Großzügige kostenlose Stufe (1 Million Anforderungen pro Monat, für immer kostenlos)
- Enge Integration mit dem Rest von AWS

**Wo es kompliziert wird**:

- Kaltstarts sind real und erfordern sorgfältige Handhabung bei latenzsensiblen Workloads
- Das 15-Minuten-Ausführungslimit schließt lang laufende Aufgaben aus
- Debugging ist schwieriger – kein dauerhafter Server, auf den man sich per SSH einloggen kann
- Zustandsloses Design erfordert, jeden Zustand extern zu speichern (Datenbank, Cache, S3)
- Parallelitätsgrenzen (Standard 1.000 gleichzeitige Aufrufe pro Konto) können bei Skalierung drosseln
- Lambda-Funktionen, die mit VPC verbunden sind, haben zusätzliche Latenz- und Kaltstart-Probleme

## Zusammenfassung

- **AWS Lambda** führt Code als Reaktion auf Ereignisse aus, ohne Server zu verwalten.
- **Pay-per-Use**: Pro Aufruf und pro 1 ms Ausführungszeit (aufgerundet) abgerechnet. Null Kosten im Leerlauf.
- Skaliert automatisch von 0 auf Tausende gleichzeitiger Aufrufe.
- **Kaltstarts**: Initialisierungslatenz, wenn keine warme Ausführungsumgebung vorhanden ist. Durch bereitgestellte Parallelität oder leichtgewichtige Laufzeiten gemindert.
- Am besten für: ereignisgesteuerte, kurzlaufende, unregelmäßige oder seltene Workloads.
- Nicht ideal für: lang laufende Aufgaben, zustandsbehaftete Anwendungen, APIs mit hohem Durchsatz und niedriger Latenz ohne bereitgestellte Parallelität.
- **Serverlos** ist eine Design-Philosophie – man verwaltet Code, nicht Infrastruktur.

## Prüfungstipps

*SAA-C03-Domäne: Resiliente Architekturen entwerfen (Domäne 2, Aufgabe 2.1)*

- **Lambda + S3**: Klassisches Muster – Datei in S3 hochgeladen löst Lambda zur Verarbeitung aus (Thumbnail-Generierung, Virenprüfung, Datentransformation). Kein Server erforderlich.
- **Lambda + SQS**: Lambda fragt SQS ab und verarbeitet Stapel. SQS stellt den Wiederholungs-/DLQ-Mechanismus bereit. Lambda stellt die Verarbeitung bereit.
- **Lambda + API Gateway**: Serverlose HTTP-API. API Gateway verarbeitet Routing, Authentifizierung, Drosselung. Lambda verarbeitet die Geschäftslogik.
- **Kaltstart-Signale**: „Latenzspitzen bei der ersten Anforderung", „inkonsistente Antwortzeiten" → Kaltstart. Lösung: bereitgestellte Parallelität (kostet Geld), kleineres Paket, leichtere Laufzeit.
- **Ausführungsgrenzen**: 15-Minuten-Maximum. 10 GB maximaler Speicher. 512 MB /tmp-Ephemer-Speicher standardmäßig (konfigurierbar bis zu 10 GB). Diese Grenzen erscheinen in Prüfungsszenarien.
- **Lambda-Parallelität**: Standard 1.000 gleichzeitige Ausführungen pro Konto (kann erhöht werden). **Reservierte Parallelität**: Garantiert einer Funktion eine bestimmte Anzahl von Ausführungen; verhindert, dass andere Funktionen sie verbrauchen. **Bereitgestellte Parallelität**: Wärmt eine Anzahl von Ausführungsumgebungen vor.
- **Ereignisquellen-Mapping**: Die Lambda-Funktion, die SQS/DynamoDB Streams/Kinesis mit Lambda verbindet. Lambda fragt die Quelle ab und bündelt Datensätze.

## Übungen

**Übung 1 – Wiederholen**

Erkläre das Kaltstart-Problem. Bei welcher Art von Anwendung wären Kaltstarts am problematischsten? Bei welcher Art wären sie akzeptabel?

*(Hinweis: Vergleiche eine Echtzeit-API (Benutzer wartet auf eine Antwort) mit einem asynchronen Hintergrundjob (Benutzer hat seine Bestätigung bereits erhalten und macht andere Dinge).)*

**Übung 2 – Prüfungsübung**

*Szenario*: Ein Unternehmen erhält Produktbilder von seinen Lieferanten über einen S3-Bucket. Jedes Bild muss auf vier Standardmaße (Thumbnail, Klein, Mittel, Groß) skaliert und zurück in S3 gespeichert werden. Das Volumen ist unvorhersehbar – an manchen Tagen 10 Bilder, an anderen 100.000. Die Verarbeitung muss innerhalb von 10 Minuten pro Bild abgeschlossen sein. Die Kosten müssen minimiert werden.

Welche Architektur erfüllt diese Anforderungen OPTIMAL?

A) EC2-Instanzen in einer Auto Scaling Group, die den S3-Bucket mit Long-Polling überwachen  
B) S3-Ereignisbenachrichtigung, die eine Lambda-Funktion auslöst, die Bilder verkleinert und Ergebnisse in S3 speichert  
C) ECS Fargate-Aufgaben, ausgelöst durch eine SQS-Warteschlange, wobei S3-Ereignisse in der Warteschlange veröffentlicht werden  
D) Eine dedizierte EC2-Instanz mit einem Cron-Job, der jede Minute S3 auf neue Bilder prüft

**Hinweis 1**: Unvorhersehbares Volumen bevorzugt die Skalierung auf null. Welche Option macht das?

**Hinweis 2**: 10 Minuten pro Bild liegen innerhalb des 15-Minuten-Limits von Lambda. Prüfe, ob die Bildverkleinerungs-Arbeit in die Grenzen von Lambda passt.

**Hinweis 3**: Eine dedizierte EC2-Instanz, die 24/7 läuft, ist teuer und skaliert nicht.

**Antwort**: B

**Erläuterung**: S3-Ereignisbenachrichtigungen lösen Lambda aus, wenn ein Bild hochgeladen wird. Lambda verkleinert das Bild auf vier Maße und speichert die Ergebnisse in S3. Lambda skaliert automatisch von 0 auf Tausende gleichzeitiger Aufrufe und verarbeitet unvorhersehbares Volumen ohne Vorab-Bereitstellung. Null Kosten, wenn keine Bilder verarbeitet werden.

**Warum nicht A?** EC2 in einer ASG skaliert nicht auf null – mindestens eine Instanz läuft immer. Long-Polling auf S3 ist kein nativer S3-Ereignismechanismus. Höhere Kosten als Lambda bei unregelmäßigen Workloads.

**Warum nicht C?** ECS Fargate funktioniert, ist aber komplexer (erfordert Container-Verwaltung, ECR, Aufgabendefinitionen) und hat bei unregelmäßigen Workloads eine etwas höhere Kaltstart-Latenz als Lambda. Lambda ist für diesen Anwendungsfall einfacher.

**Warum nicht D?** Eine dedizierte EC2-Instanz ist ein Single Point of Failure, skaliert nicht, läuft 24/7, und ein cron-basierter Ansatz hat bis zu 60 Sekunden Erkennungsverzögerung.

*SAA-C03-Domäne: Resiliente Architekturen entwerfen – Aufgabe 2.1*

**Übung 3 – Architektur-Challenge** *(Optional)*

Nimbus möchte täglich um 5 Uhr morgens einen Bericht mit den Top-10-Restaurants des Vortages nach Bestellvolumen erstellen. Der Bericht wird aus DynamoDB-Daten generiert, als PDF formatiert, in S3 gespeichert und per E-Mail an alle Restaurantpartner gesendet.

Entwirf die vollständige Lambda-basierte Pipeline dafür. Was löst Lambda aus? Was passiert, wenn die PDF-Generierung 12 Minuten dauert? Was ist, wenn es 5.000 Restaurantpartner gibt und das Versenden von E-Mails an alle Zeit in Anspruch nimmt? Würdest du eine Lambda oder mehrere verwenden?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, das Zusammensetzen von Lambda mit anderen Diensten zu üben.)*

## Post-Credits-Szene

Tom überprüfte die Rechnung am Ende des Monats.

Der E-Mail-Dienst: war aus der EC2-Rechnung verschwunden.
Der Bildverkleinerungs-Job: weg.
Die nächtliche Bereinigungsaufgabe: weg.
Der tägliche Analysebericht: weg.

Lambda-Gesamtkosten für den Monat: 4,23 $.

„Vier Dollar", sagte Tom.

„Und dreiundzwanzig Cent", ergänzte Leo hilfsbereit.

Tom sah sich die Rechnung des Vormonats an, als all diese Dienste noch auf EC2-Instanzen liefen.

„Wir haben 187 $ für dieselben Workloads bezahlt."

„Lambda berechnet keine Leerlaufzeit", sagte Leo. „Und die meisten dieser Dienste standen 90 % der Zeit im Leerlauf."

Tom starrte lange auf den Bildschirm.

„Ich nehme alles zurück, was ich über Serverlos als Hype-Wort gesagt habe", sagte er.

Im nächsten Kapitel: der Versandcontainer, der jeden Server wie zu Hause fühlen lässt.
