# Kapitel 20: Das Freiberufler-Modell

Es war ein ruhiger Mittwochnachmittag. Priya hatte ausnahmsweise die Kopfhörer abgesetzt, und das Büro hatte jenes leise Summen, das bedeutete, dass alle konzentriert waren, aber niemand in Panik geriet. Leo hatte ein Kostendashboard auf einem Bildschirm und die Liste der EC2-Instanzen auf dem anderen.

Stellen Sie sich einen Freiberufler vor, der auf Abruf arbeitet. Er sitzt nicht von neun bis fünf an einem Schreibtisch. Er wartet. Das Telefon klingelt, er erledigt die Arbeit, schickt eine Rechnung, geht zurück ins Warten. Keine Arbeit, keine Kosten. Ein Schwall von Anfragen, er bearbeitet sie alle gleichzeitig. Sie zahlen nur für die tatsächlich gearbeiteten Stunden – nicht für die Stunden, die er verfügbar war.

Das ist das Modell, um das es in diesem Kapitel geht.

Es gibt hier eine Feinheit, die es festzuhalten lohnt. Das traditionelle Modell lautet: einen Mitarbeiter einstellen, für 8 Stunden bezahlen, variable Leistung erhalten. Das Freiberufler-Modell lautet: nur bezahlen, wenn das Telefon klingelt, genau das erhalten, was angefordert wurde. Für ein Unternehmen mit vorhersehbarer, konstanter Nachfrage ist das Mitarbeitermodell effizienter – Sie wissen, dass das Telefon ständig klingeln wird, also ist die stundenweise Bezahlung gleichwertig und es gibt keinen Aufwand für das Einbinden und Ausgliedern. Für ein Unternehmen mit variabler, sprunghafter oder seltener Nachfrage ist das Freiberufler-Modell dramatisch günstiger.

AWS bietet dieses Modell für Compute an – und ob es Sinn ergibt, hängt von Ihrem Nachfragemuster ab. Die erste Frage lautet nie „Ist dieses Modell gut?“, sondern „Wie sieht meine Workload tatsächlich aus?“

Für die meisten Workloads, die größer als ein Startup sind: eine Mischung. Manches läuft ständig (der API-Server, die Datenbank). Manches läuft nur, wenn es ausgelöst wird (Ereignisverarbeitung, Berichtserstellung, Bildgrößenänderung). Das Freiberufler-Modell ist für die zweite Kategorie – und Nimbus war im Begriff zu entdecken, wie viel von seiner Rechnung dorthin gehörte.

---

Das SQS/SNS-Fan-out hatte den Bestellfluss entkoppelt, aber die Worker, die diese Warteschlangen konsumierten, liefen immer noch auf EC2-Instanzen, die stundenweise berechnet wurden – unabhängig davon, wie viele E-Mails sie tatsächlich versendeten. Die Architektur war richtig; das Kostenmodell hatte noch ein Leck.

Priya hatte es zuerst bemerkt.

„Der E-Mail-Dienst“, sagte sie. „Wie viele E-Mails versenden wir pro Tag?“

Leo überprüfte die Metriken. „Durchschnittlich 400 pro Tag. Spitzenwert etwa 1.200 an Freitagabenden.“

„Und die EC2-Instanz, die den E-Mail-Dienst betreibt – wie lange läuft die?“

„Immer. 24/7.“

„Auch um 3 Uhr nachts, wenn wir null E-Mails versenden?“

Stille.

Leo rief den CloudWatch-CPU-Graphen für die EC2-Instanz des E-Mail-Dienstes auf. Der Graph zeigte 18 Stunden ununterbrochenen Betriebs. Beim Freitagshöhepunkt: CPU bei 38 %, während der E-Mail-Schwall bewältigt wurde. Nach Mitternacht: CPU fiel auf 3 %. Blieb dort, bis die Mittagsbestellungen begannen.

Drei Prozent CPU für 18 Stunden am Stück. Die Instanz lief. Sie berechnete Gebühren. Sie tat nichts Sinnvolles.

„Wir bezahlen dafür, dass ein Computer dasitzt und nichts tut“, sagte Leo.

„Für wie viele Stunden am Tag?“

Noch mehr Stille.

„Ungefähr 18.“

Tom war jetzt sehr aufmerksam.

„Und es ist nicht nur der E-Mail-Dienst“, fügte Priya hinzu. „Der Bildgrößenänderungsdienst für Restaurantfotos läuft die meiste Zeit bei 1 % CPU. Er schießt nur in die Höhe, wenn ein Restaurant eine neue Speisekarte hochlädt. Was, wie oft, ein paar Mal am Tag pro Restaurant passiert?“

„Ja“, bestätigte Leo.

„Der nächtliche Bereinigungsjob, der temporäre Dateien löscht – der läuft 4 Minuten um 2 Uhr morgens und ist dann 23 Stunden und 56 Minuten lang völlig untätig.“

„Ebenfalls ja.“

Das Muster war über alle kleineren Dienste von Nimbus hinweg dasselbe: Compute 24 Stunden am Tag bezahlt, nur einen Bruchteil davon genutzt.

---

**Der Server ist nicht immer die Antwort**

EC2-Instanzen sind dauerhaft. Sie starten eine, und sie läuft, bis Sie sie stoppen – 24 Stunden am Tag, 7 Tage die Woche, unabhängig von der tatsächlichen Nutzung. Für Ihren Webserver (der zu allen Stunden Traffic verarbeitet) ist das richtig. Für den E-Mail-Dienst (der stoßweise E-Mails versendet und dann stundenlang untätig ist) ist es verschwenderisch.

Die Auto Scaling Group kann den E-Mail-Dienst während der Schwachlastzeiten auf eine Instanz herunterskalieren. Aber eine Instanz läuft trotzdem ständig.

Das ist die Frage, zu der Tom beim Betrachten der Rechnung immer wieder zurückkehrte: Was tat jeder Dienst während dieser 18 Stunden von 3 % CPU eigentlich? Technisch gesehen nicht nichts – die Instanz wartete, prüfte auf Ereignisse, hielt ihren Zustand. Aber aus geschäftlicher Sicht: nichts. Der Dienst lieferte keinen Wert. Er berechnete Gebühren.

Für Workloads, die die meiste Zeit wirklich untätig sind, bedeutet eine ständig laufende EC2-Instanz, Miete für eine Wohnung zu zahlen, die Sie nur am Wochenende besuchen. Die Wohnung gehört Ihnen; die Miete hört nicht auf.

Das Freiberufler-Modell löst das vollständig. Der Code existiert. Er läuft nur nicht, bis es einen Grund gibt, ihn auszuführen. Keine Leerlaufkosten. Keine reservierte Kapazität. Kein Server, der am Telefon wartet.

Das ist die Prämisse des **serverlosen Computings**.

**AWS Lambda: Code ohne Server**

**AWS Lambda** ermöglicht es Ihnen, Code als Reaktion auf Ereignisse auszuführen, ohne Server bereitzustellen oder zu verwalten. Sie laden eine Funktion hoch, geben an, was sie auslöst, und Lambda führt sie aus, wenn der Auslöser auslöst.

Eine Lambda-Funktion:

- Hat keinen dauerhaften Zustand (jeder Aufruf ist unabhängig)
- Läuft bis zu 15 Minuten pro Aufruf
- Skaliert automatisch von 0 auf Tausende gleichzeitiger Aufrufe
- Wird nur beim Ausführen berechnet (pro 1 ms Ausführungszeit, aufgerundet, pro GB zugewiesenem Speicher)

Wenn kein Auslöser vorhanden ist, kostet Lambda nichts. Wenn Auslöser auslösen, läuft Lambda und berechnet Gebühren. Wenn 10.000 Auslöser gleichzeitig auslösen, führt Lambda 10.000 gleichzeitige Aufrufe aus. Die Skalierung ist automatisch und nahezu sofort.

**Ereignisauslöser: Was Lambda aufweckt**

Lambda-Funktionen laufen nicht von selbst – sie reagieren auf Ereignisse. Übliche Auslöser sind:

- **SQS-Warteschlange**: Nachrichten aus einer Warteschlange verarbeiten. Lambda fragt die Warteschlange ab und ruft die Funktion mit Nachrichten-Batches auf.
- **API Gateway**: Eine HTTP-Anfrage kommt herein. API Gateway löst Lambda aus. Lambda erzeugt eine Antwort.
- **S3-Ereignis**: Eine Datei wird nach S3 hochgeladen. Lambda verarbeitet sie (ein Bild verkleinern, eine CSV parsen, ein Dokument validieren).
- **SNS**: Eine Nachricht wird in einem Topic veröffentlicht. Lambda wird benachrichtigt.
- **DynamoDB Streams**: Ein Datensatz in DynamoDB ändert sich. Lambda verarbeitet die Änderung.
- **CloudWatch Events (EventBridge)**: Ein geplantes Ereignis (wie ein Cron-Job) läuft zu einer definierten Zeit.
- **ALB**: Eine HTTP-Anfrage trifft beim Load Balancer ein. Lambda kann bestimmte Routen bedienen.

Für Nimbus wurde der E-Mail-Dienst zu einer Lambda-Funktion, die durch ihre SQS-Warteschlange ausgelöst wird. Wenn eine Nachricht in der Warteschlange eintrifft, wird Lambda mit dem Nachrichteninhalt aufgerufen, sendet die E-Mail über SES (Simple Email Service) und beendet sich.

Null Server. Null Leerlaufzeit. Null Kosten im Leerlauf.

Das Muster aus Lambda + SQS lohnt es sich zu verinnerlichen: SQS kümmert sich um die Warteschlange, Dauerhaftigkeit, Wiederholungslogik und DLQ. Lambda kümmert sich um die Verarbeitung. Sie erhalten die Entkopplungsvorteile von SQS mit der Scale-to-zero-Ökonomie von Lambda. Keiner der Dienste übernimmt die Aufgabe des anderen. Sie lassen sich sauber kombinieren.

„Was passiert mit einer fehlerhaften Nachricht in der Warteschlange?“ fragte Priya. „Kann eine fehlerhafte Eingabe Lambda auf eine Weise zum Absturz bringen, die andere Funktionen im Konto beeinträchtigt?“

Lambda-Aufrufe sind voneinander isoliert. Eine abstürzende Funktion beeinträchtigt andere Funktionen nicht. Eine Lambda, die bei einer fehlerhaften Nachricht eine unbehandelte Ausnahme wirft: Die Nachricht geht zurück in die Warteschlange, wird bis zum konfigurierten Limit wiederholt und wandert dann in die DLQ. Die Lambda selbst bleibt für die nächste Nachricht verfügbar. Eingabevalidierung innerhalb des Lambda-Handlers ist trotzdem wichtig – um fehlerhafte Daten abzufangen, bevor versucht wird, sie zu verarbeiten –, aber eine einzelne fehlerhafte Nachricht kann die Funktion nicht lahmlegen.

**Das Kaltstart-Problem**

Lambda-Funktionen laufen in **Ausführungsumgebungen** – kleinen, isolierten Containern. Wenn eine Funktion aufgerufen wird:

1. AWS prüft, ob eine warme Ausführungsumgebung verfügbar ist (eine, die kürzlich einen Aufruf bearbeitet hat)
2. Wenn warm: Die Funktion läuft sofort
3. Wenn kalt: AWS initialisiert eine neue Ausführungsumgebung – lädt Ihren Code herunter, startet die Laufzeit, führt Ihren Initialisierungscode aus – und führt dann die Funktion aus

Ein **Kaltstart** fügt 100 ms bis zu mehreren Sekunden Latenz hinzu, abhängig von der Laufzeit (Java und .NET haben längere Kaltstarts als Python und Node.js) und der Größe Ihres Code-Pakets.

Sie fragen sich vielleicht: Wenn Lambda jedes Mal von vorne startet, macht das es dann nicht langsamer als einen Server, der bereits läuft? Ja – manchmal. Das ist das Kaltstart-Problem, und es ist wichtig für zeitkritische, nutzerseitige APIs. Es spielt überhaupt keine Rolle für Hintergrundjobs, bei denen der Nutzer seine Bestätigung bereits erhalten hat. Ein 200-ms-Kaltstart bei einem E-Mail-Dienst, der im Hintergrund läuft, ist für niemanden sichtbar.

Bei asynchroner Verarbeitung (E-Mail-Versand, Bildgrößenänderung) sind Kaltstarts für Nutzer unsichtbar.

Bei synchronen APIs (HTTP-Anfragen, bei denen ein Nutzer auf eine Antwort wartet) können Kaltstarts gelegentlich langsame Antworten verursachen.

**Gegenmaßnahmen**:

- **Provisioned Concurrency (bereitgestellte Parallelität)**: Eine bestimmte Anzahl von Ausführungsumgebungen vorwärmen. Sie sind immer bereit. Sie zahlen dafür, auch wenn sie keine Anfragen verarbeiten.
- **Kleinere Paketgrößen**: Kleinerer Code initialisiert schneller.
- **Aufwärm-Aufrufe**: Geplante Pings, um Funktionen warm zu halten (ein verbreiteter, aber uneleganter Ansatz).
- **Die richtige Laufzeit wählen**: Python und Node.js starten schneller kalt als Java.

**Eine echte Kaltstart-Untersuchung**

Zwei Wochen nach der Lambda-Migration erhielt Leo eine Slack-Nachricht von einem Restaurantpartner: „Die Bestellbestätigung dauert manchmal 3 Sekunden. Normalerweise ist es schnell. Was ist da los?“

Leo rief die CloudWatch-Metriken für die Lambda-Funktion auf. Im „Duration“-Graphen konnte er ein Muster erkennen: Der erste Aufruf nach einer Lücke von mehr als 15–20 Minuten schoss auf 2.800–3.200 Millisekunden hoch. Nachfolgende Aufrufe: 180–220 Millisekunden.

Klassische Kaltstarts.

Er zog den X-Ray-Trace für einen der 3-Sekunden-Aufrufe heran. Die Zeitleiste zeigte es deutlich:

- Initialisierungsphase: 2.640 ms (Herunterladen des Funktionscodes, Starten der Node.js-Laufzeit, Ausführen des Initialisierungscodes auf Modulebene)
- Ausführung der Handler-Funktion: 290 ms

Die Initialisierungsphase war das Problem. Er sah sich den Initialisierungscode an. Die Funktion importierte ein großes SDK, initialisierte eine Datenbankverbindung und lud die Konfiguration aus dem AWS Secrets Manager – alles beim Start.

„Ein Teil dieser Initialisierung muss nur einmal pro Ausführungsumgebung passieren“, sagte Leo. „Aber sie passiert bei jedem Kaltstart.“

Er strukturierte den Lambda-Code so um, dass die Datenbankverbindung außerhalb der Handler-Funktion initialisiert wird (sodass sie über warme Aufrufe hinweg wiederverwendet wird), und reduzierte die Paketgröße, indem er ungenutzte SDK-Module entfernte. Außerdem stellte er von der Bündelung des gesamten AWS SDK auf den Import nur der spezifischen Dienste um, die er brauchte.

Nach der Optimierung:

- Kaltstart-Dauer: 1.100 ms (immer noch vorhanden, aber weniger gravierend)
- Warme Aufrufe: 165 ms

Der 1,1-Sekunden-Kaltstart trat immer noch gelegentlich auf. Für den E-Mail-Dienst (asynchron, nutzerseitige Verzögerung unsichtbar) war das akzeptabel. Für die Restaurant-Benachrichtigungs-Lambda (kundenseitig, von einem Tablet aus bestellt) drängte Priya auf Provisioned Concurrency: zwei vorgewärmte Umgebungen, immer bereit.

„Wie viel kostet das pro Monat?“ fragte Tom.

Zwei Provisioned-Concurrency-Umgebungen mit 256 MB: etwa 5,40 $/Monat. Die Latenzspitzen hörten auf.

**Lambda-Preisgestaltung: Warum Tom lächelte**

Die Lambda-Preisgestaltung hat zwei Komponenten:

1. **Anfragegebühr**: 0,20 $ pro Million Aufrufe
2. **Dauergebühr**: 0,0000166667 $ pro GB-Sekunde (zugewiesener Speicher × Laufzeit in Sekunden)

Die ersten eine Million Anfragen pro Monat sind kostenlos (immer, nicht nur im ersten Jahr).

„Wie viel kostet das pro Monat?“ fragte Tom, bevor Leo den Rechner öffnen konnte.

Tom rechnete für den E-Mail-Dienst selbst:

- Angenommen, jeder Tag ist ein Freitag – Worst Case: 1.200 E-Mails pro Tag × 30 Tage = 36.000 Aufrufe pro Monat
- Jeder Aufruf dauert ~2 Sekunden bei 256 MB Speicher
- Dauer: 36.000 × 2 × 0,25 GB × 0,0000166667 $ = 0,30 $/Monat
- Anfragen: 36.000 << 1.000.000 (kostenlose Stufe) = 0,00 $/Monat

„Und diese 18.000 GB-Sekunden liegen weit innerhalb der 400.000 GB-Sekunden Dauer, die immer kostenlos sind“, fügte Tom hinzu. „Die tatsächliche Gebühr wäre also null. Aber ich ignoriere die kostenlose Stufe absichtlich – ich will die echten Stückkosten kennen.“

Die EC2-Instanz für den E-Mail-Dienst: 18 $/Monat.

„Ich habe es schon deployed – oh.“ Leo unterbrach sich selbst. Er hatte die E-Mail-Dienst-Lambda in die Produktion geschoben, bevor er die DLQ-Konfiguration fertiggestellt hatte. „Gib mir fünf Minuten.“

Tom war einen Moment still. Dann: „Wir sollten das für alles machen.“

**Wofür Lambda gut ist (und wofür nicht)**

„Moment – aber *warum* sollten wir dann nicht einfach Lambda für alles verwenden?“ fragte Maya. „Wenn es günstiger ist und automatisch skaliert, wo ist der Haken?“

„Das 15-Minuten-Limit“, sagte Leo. „Und Kaltstarts für alles Nutzerseitige. Und Zustandslosigkeit – man kann zwischen Aufrufen nichts im Speicher behalten.“

Wenn Ihre Workload sprunghaft, ereignisgesteuert ist und in unter 15 Minuten abschließt, kostet Lambda einen Bruchteil einer ständig laufenden EC2-Instanz – aber wenn Ihre Workload ein lang laufender Datenverarbeitungsjob ist, der das 15-Minuten-Limit erreicht oder überschreitet, ist Lambda das falsche Werkzeug und Sie brauchen ECS, Batch oder einen EC2-basierten Ansatz.

Lambda ist ausgezeichnet für:

- **Ereignisgesteuerte Verarbeitung**: Auf Ereignisse reagieren (Datei-Uploads, Warteschlangennachrichten, geplante Aufgaben)
- **Kurzlaufende Aufgaben**: Verarbeitung, die deutlich innerhalb von 15 Minuten abschließt
- **Sprunghaften, unvorhersehbaren Traffic**: Lambda skaliert von 0 auf Tausende sofort – keine Vorab-Bereitstellung
- **Seltene Operationen**: Ein Bericht, der täglich um 2 Uhr läuft. Ein Bereinigungsjob, der wöchentlich läuft.
- **Glue Code**: Kleine Funktionen, die Daten zwischen Diensten verschieben

Sie fragen sich vielleicht: Was passiert mit Lambdas Skalierung, wenn ein plötzlicher Schwall von 10.000 Ereignissen gleichzeitig eintrifft? Lambdas standardmäßiges Parallelitätslimit beträgt 1.000 gleichzeitige Ausführungen pro Konto. Wenn 10.000 Ereignisse auf einmal eintreffen, laufen bis zu 1.000 Aufrufe sofort; der Rest wartet in der SQS-Warteschlange (falls über SQS ausgelöst) und wird verarbeitet, sobald Kapazität frei wird. Das ist für warteschlangenbasierte Verarbeitung in der Regel in Ordnung. Für latenzempfindliche Anwendungsfälle kann Lambdas Burst-Limit (die anfängliche Rate, mit der neue gleichzeitige Ausführungen hinzugefügt werden) bei plötzlichen Spitzen eine kurze Drosselung verursachen – Provisioned Concurrency umgeht dies, indem Kapazität vorab zugewiesen wird.

Für Nimbus' E-Mail-Dienst in ihrer aktuellen Größenordnung waren 1.000 gleichzeitige Aufrufe weit mehr, als sie je brauchen würden. Aber es ist die richtige Beschränkung, die man kennen sollte, bevor man an sie stößt.

Lambda ist schlecht für:

- **Lang laufende Prozesse**: Das 15-Minuten-Limit ist eine harte Wand
- **Zustandsbehaftete Anwendungen**: Lambda-Funktionen sind zustandslos by Design – jeder Aufruf ist unabhängig
- **APIs mit hohem Durchsatz und niedriger Latenz**: Kaltstarts können Latenzspitzen verursachen; Provisioned Concurrency mindert dies, fügt aber Kosten hinzu
- **Anwendungen, die dauerhafte Verbindungen brauchen**: Lambda kann nicht ohne Weiteres einen langlebigen Datenbankverbindungspool aufrechterhalten (obwohl Connection-Pooling-Tools wie RDS Proxy helfen)
- **Traditionelle Webserver**: Möglich, aber nicht die natürliche Eignung

**Die 15-Minuten-Wand: Wann Lambda das falsche Werkzeug ist**

Drei Wochen nach der Migration versuchte Leo, eine weitere Workload auf Lambda zu verschieben: den nächtlichen Analyseberichtsgenerator. Er zog Bestelldaten aus der Datenbank, verband sie mit Restaurant-Metadaten, berechnete Statistiken und erzeugte ein PDF.

In der ersten Nacht schlug der Lambda-Aufruf mit einem Timeout-Fehler fehl.

„Die Berichtserstellung dauerte 17 Minuten“, sagte Leo am nächsten Morgen.

„Lambdas Maximum sind 15“, sagte Priya.

„Ja. Das weiß ich jetzt.“

Er hatte die durchschnittliche Verarbeitungszeit (8 Minuten) geprüft und angenommen, Lambda würde funktionieren. Er hatte nicht den Tail geprüft – die Nächte, in denen das Datenvolumen höher war und die Abfrage länger dauerte. In diesen Nächten reichten 15 Minuten nicht.

„Der Bericht wird also einfach... nicht erstellt?“ fragte Maya.

„Korrekt. Keine Fehlerbenachrichtigung. Kein Teilbericht. Nur Stille.“

„Ich habe es schon deployed – oh“, sagte Leo.

Das war eine der spezifischen Arten, auf die Lambda nicht elegant scheitert: Ein Timeout erzeugt keine Ausgabe, keine Fehlermeldung in der Anwendung, nur ein CloudWatch-Fehler-Log. Wenn Sie Lambda-Timeout-Fehler nicht gezielt überwachen, bemerken Sie es vielleicht tagelang nicht.

Die Lösung: den Berichtsgenerator auf ECS Fargate verschieben – Container ohne Serververwaltung; nächstes Kapitel –, das kein Zeitlimit hat. Lambda war das falsche Werkzeug für Workloads, die selbst gelegentlich 15 Minuten überschreiten könnten. Die Lektion war nicht „Lambda ist schlecht“. Die Lektion war „Lambda ist das richtige Werkzeug für Workloads, die in seine Beschränkungen passen – und eine Quelle überraschender Fehlschläge, wenn nicht.“

**RDS Proxy: Connection Pooling für Lambda**

Lambdas zustandslose Natur erzeugt ein spezifisches Datenbankproblem.

Wenn eine EC2-Instanz sich mit RDS verbindet, hält sie einen dauerhaften Connection Pool. Die Anwendung verwendet Verbindungen aus dem Pool wieder. RDS kann etwa 200 gleichzeitige Verbindungen handhaben.

Wenn Lambda 500 gleichzeitige Aufrufe handhabt, versucht jeder Aufruf, seine eigene Datenbankverbindung zu öffnen. Das sind 500 neue Verbindungen – die eine Datenbank überfordern, die 200 unterstützt.

**Amazon RDS Proxy** sitzt zwischen Lambda-Funktionen und RDS, hält einen dauerhaften Connection Pool und multiplext Lambdas kurzlebige Verbindungen durch ihn hindurch.

Statt: Lambda-Aufruf → neue RDS-Verbindung (für jeden von 500 gleichzeitigen Aufrufen)

Mit RDS Proxy: Lambda-Aufruf → RDS Proxy → Pool von 20 dauerhaften RDS-Verbindungen

„Der Proxy braucht RDS-Anmeldedaten“, sagte Priya. „Wo liegen die? Speichert er sie?“

RDS Proxy speichert Anmeldedaten im Secrets Manager und rotiert sie automatisch. Die IAM-Rolle der Lambda-Funktion gewährt ihr Zugriff auf den Proxy (mittels IAM-Authentifizierung), nicht auf die RDS-Anmeldedaten direkt. Die Anmeldedaten werden dem Lambda-Code nie offengelegt.

„Die Lambda-Funktion authentifiziert sich also über IAM“, bestätigte Leo, „und der Proxy kümmert sich um die eigentlichen Datenbank-Anmeldedaten.“

Für Nimbus' Bestellverarbeitungs-Lambda (jene, die RDS für die Bestellvalidierung abfragte) beseitigte RDS Proxy die Erschöpfung des Connection Pools während des Freitagsspitzentraffics.

**Lambda Layers: Gemeinsame Abhängigkeiten**

Die E-Mail-Dienst-Lambda, die Benachrichtigungs-Lambda und die Bericht-Lambda teilten alle denselben internen Bibliothekscode: Hilfsfunktionen zum Formatieren von Währungen, Bereinigen von Eingaben, Protokollieren im Standardformat.

Ohne Lambda Layers musste dieser gemeinsame Code in das Deployment-Paket jeder Funktion gebündelt werden. Drei Funktionen, drei Kopien derselben 2-MB-Bibliothek. Wenn die Bibliothek aktualisiert wurde, brauchten alle drei Funktionen neue Deployments.

**Lambda Layers** sind separate Pakete, auf die Lambda-Funktionen zur Laufzeit verweisen können. Die gemeinsame Bibliothek wurde in ein Layer extrahiert. Die drei Funktionen verwiesen auf das Layer. Aktualisierungen der gemeinsamen Bibliothek bedeuteten, die Layer-Version zu aktualisieren – nicht alle drei Funktionen neu zu deployen.

Zusätzlicher Vorteil: kleinere einzelne Funktionspakete bedeuten schnellere Kaltstarts.

„Eine Sache ändern Layers nicht: die Ausführungsrolle“, sagte Priya. „Wenn eine Lambda zu weitreichende Berechtigungen hat, kann eine kompromittierte Funktion auf alles im Konto zugreifen.“

„Gleiches Prinzip wie bei EC2-Rollen“, sagte Leo. „Least Privilege. Jede Lambda erhält nur die Berechtigungen, die sie tatsächlich braucht.“

„Lambda ist also kein Ersatz für EC2“, sagte Maya. „Es ist ein anderes Werkzeug für andere Aufgaben.“

„Die Nimbus-Web-API bleibt auf EC2 oder ECS“, bestätigte Leo. „Der E-Mail-Dienst, der Bildgrößenänderer, der nächtliche Berichtsgenerator, der Log-Bereiniger – die wechseln zu Lambda.“

**Die serverlose Philosophie**

Lambda ist Teil eines breiteren Konzepts: **serverlos** – Anwendungen bauen, bei denen Sie keine Server verwalten, nur Code.

Ein vollständig serverloser Nimbus-Stack könnte so aussehen:

- API Gateway + Lambda (statt EC2 mit einem Webserver)
- DynamoDB (statt RDS – ebenfalls serverlos, keine Serververwaltung)
- S3 (statische Assets – von Natur aus serverlos)
- SNS + SQS (Messaging – serverlos)
- Lambda (gesamte Hintergrundverarbeitung)

Der Reiz: Sie schreiben Code; AWS verwaltet alles andere. Kein Patching, keine Skalierungskonfiguration, keine Kapazitätsplanung.

## Amazon API Gateway

Die Liste der Lambda-Auslöser erwähnte API Gateway kurz: Eine HTTP-Anfrage kommt herein, API Gateway löst Lambda aus. Das ist korrekt, verkauft aber das, was API Gateway tatsächlich ist, unter Wert.

„Moment – aber *warum* sollten wir API Gateway vor Lambda setzen?“ fragte Maya. „Kann Lambda nicht einfach direkt HTTP-Anfragen empfangen?“

Lambda kann HTTP-Anfragen über eine Function URL empfangen – einen einfachen, direkten HTTPS-Endpunkt. Aber sie kümmert sich nicht um Routing, Autorisierung, Drosselung, Caching oder Anfragetransformation. Für eine Produktions-API existieren diese Belange unabhängig davon, ob Ihr Backend Lambda oder EC2 ist.

**Amazon API Gateway** ist ein vollständig verwalteter Dienst zum Erstellen, Bereitstellen und Verwalten von APIs in jeder Größenordnung. Er kümmert sich um Traffic-Management, Autorisierung, Drosselung, Caching und Überwachung, sodass Ihre Lambda-Funktion (oder EC2 oder ein beliebiges HTTP-Backend) sie nicht selbst implementieren muss.

**Drei API-Typen:**

**REST API** ist die funktionsreichste Option. Sie unterstützt Anfrage- und Antworttransformation, Antwort-Caching, an API-Schlüssel gebundene Nutzungspläne und alle Autorisierungstypen. Die meisten SAA-C03-Prüfungsfragen, die API Gateway erwähnen, betreffen die REST API.

**HTTP API** ist einfacher und günstiger – etwa 70 % weniger Kosten als die REST API. Sie ist für Lambda-Backends und HTTP-Proxys konzipiert. Sie unterstützt OIDC- und OAuth-2.0-Autorisierung, aber keine Anfragetransformation oder Caching. Wenn Sie die erweiterten Funktionen der REST API nicht brauchen, ist die HTTP API die richtige Wahl.

**WebSocket API** verwaltet dauerhafte Zwei-Wege-Verbindungen. API Gateway kümmert sich um den Verbindungslebenszyklus und leitet Nachrichten basierend auf dem Nachrichteninhalt an Lambda weiter. Die Lambda-Funktion muss den Socket-Zustand nicht verwalten – API Gateway tut das.

**Autorisierungsoptionen** (jene, die die Prüfung abfragt):

**Cognito-User-Pool-Authorizer** validiert ein JWT aus einem Cognito User Pool. Keine Lambda erforderlich. API Gateway prüft das Token selbst. Wenn es gültig ist, geht die Anfrage durch.

**Lambda-Authorizer** führt Ihre eigene Lambda-Funktion aus, um ein Token zu validieren – ein benutzerdefiniertes JWT, ein OAuth-Token von einem Drittanbieter-Identitätsanbieter, einen API-Schlüssel in einem proprietären Format. Die Lambda gibt eine IAM-Richtlinie zurück. Wenn die Richtlinie die Aktion erlaubt, fährt die Anfrage fort.

**API-Schlüssel** ist ein einfacher Schlüssel, der in einem Anfrage-Header übergeben wird. API-Schlüssel dienen der Ratenbegrenzung pro Client, nicht der Authentifizierung. Verwenden Sie sie nicht als Sicherheitsmechanismus – sie sind keine Geheimnisse, sie sind Bezeichner.

**Drosselung und Nutzungspläne:**

Standardmäßig erlaubt API Gateway 10.000 Anfragen pro Sekunde auf Kontoebene (ein weiches Limit), mit einem Burst von 5.000. Überschreiten Sie es, erhalten Clients ein `429 Too Many Requests` – Ihr Backend spürt es nicht einmal. Wenn Sie Limits pro Client brauchen, erstellen Sie einen Nutzungsplan: hängen Sie ihn an einen API-Schlüssel an, setzen Sie eine Anfragerate und ein tägliches oder monatliches Kontingent. Die Bursts eines Clients verbrauchen nicht die Zuteilung eines anderen Clients.

Zwei Zahlen, die man sich merken sollte: Die maximale Nutzlast beträgt **10 MB**, und der standardmäßige Integrations-Timeout beträgt **29 Sekunden** – wenn Ihr Backend länger braucht, gibt das Gateway auf. (Seit 2024 kann dieser Timeout für regionale und private REST APIs über eine Kontingenterhöhung über 29 Sekunden hinaus angehoben werden – aber der 29-Sekunden-Standard ist immer noch das, was die Prüfung erwartet.) API Gateway ist für Request/Response-APIs, nicht für lang laufende Jobs; für diese übergeben Sie die Arbeit an SQS oder Step Functions und antworten sofort.

„Wie viel kostet das pro Monat?“ fragte Tom.

Für die REST API: 3,50 $ pro Million API-Aufrufe, plus 0,09 $ pro GB Datenübertragung. Für kleinen bis mittleren Traffic ist es im Wesentlichen kostenlos. Für APIs mit hohem Volumen wird der niedrigere Preispunkt der HTTP API bedeutsam.

Leo zeigte auf die Liste der Lambda-Auslöser, die er zuvor geschrieben hatte. „API Gateway ist also nicht nur eine Möglichkeit, Lambda auszulösen. Es ist das, was Lambda wie eine echte API anfühlen lässt.“

„Die Lambda-Funktion kümmert sich um die Geschäftslogik“, sagte Priya. „API Gateway kümmert sich um alles davor – Routing, Auth, Drosselung, Überwachung. Jedes tut eine Sache.“

„Und was, wenn jemand versucht, die Lambda direkt aufzurufen und API Gateway zu umgehen?“

„Die Lambda-Ausführungsrichtlinie erlaubt nur Aufrufe von API Gateway“, sagte Priya. „Die ressourcenbasierte Richtlinie auf der Lambda verweigert alles andere.“

Die Realität: Serverlos hat seine eigene betriebliche Komplexität – Debugging verteilter Lambda-Funktionen, Verwaltung von Kaltstarts, Verstehen von Parallelitätsgrenzen. Es ist nicht einfacher, nur anders.

„Moment – aber *warum* ist serverlos ‚nicht einfacher‘?“ fragte Maya. „Das ganze Versprechen ist, dass es die betriebliche Last entfernt.“

„Es entfernt einen Teil der betrieblichen Last“, sagte Leo. „Infrastrukturbereitstellung, Patching, Skalierungskonfiguration – die fallen weg. Was bleibt, ist anders: Kaltstart-Management, verteiltes Tracing über Funktionen, in die man sich nicht per SSH einloggen kann, Parallelitätsgrenzen, Verwaltung von Funktionsversionen und Aliassen, Verstehen, wie sich Layer-Aktualisierungen ausbreiten, eleganter Umgang mit 15-Minuten-Timeouts.“

„Die Last verlagert sich also“, sagte Priya. „Von Infrastrukturbetrieb zu Funktionsbetrieb.“

„Ja. Für viele Workloads – besonders ereignisgesteuerte, kleine, sprunghafte – ist das ein besserer Tausch. Für einen lang laufenden Anwendungsserver, mit dem Ingenieure interagieren und den sie debuggen müssen, bleiben EC2 oder Container oft die richtige Wahl.“

Sie fragen sich vielleicht: Ist serverlos die Zukunft, und sollte irgendwann alles zu Lambda wandern? Die ehrliche Antwort ist, dass es auf die Workload ankommt. Serverlos hat die ereignisgesteuerte Verarbeitung dominiert. Es hat bei HTTP-APIs (über API Gateway + Lambda) bedeutende Fortschritte gemacht. Es hat ständig laufende Anwendungsserver, lang laufende Batch-Verarbeitung oder zustandsbehaftete Dienste nicht ersetzt – und wird es wahrscheinlich nicht, weil diese Anwendungsfälle nicht von Lambdas Modell profitieren. Die Frage nach dem richtigen Werkzeug verschwindet nie; sie gilt nur im Lauf der Zeit für andere Optionen.

## Stärken und Grenzen

**Warum Lambda leistungsstark ist**:

- Echtes Pay-per-Use – null Kosten im Leerlauf
- Automatische Skalierung ohne Konfiguration
- Keine Server, die gepatcht oder gewartet werden müssen
- Großzügige kostenlose Stufe (1 Million Anfragen pro Monat, für immer kostenlos)
- Enge Integration mit dem Rest von AWS
- RDS Proxy und Lambda Layers adressieren zwei der häufigsten Lambda-Schmerzpunkte (Connection Pooling und Code-Sharing), ohne architektonische Änderungen zu erfordern

**Wo es kompliziert wird**:

- Kaltstarts sind real und erfordern sorgfältige Handhabung bei latenzempfindlichen Workloads
- Das 15-Minuten-Ausführungslimit schließt lang laufende Aufgaben aus
- Debugging ist schwieriger – kein dauerhafter Server, in den man sich per SSH einloggen kann
- Zustandsloses Design erfordert die Auslagerung des gesamten Zustands (Datenbank, Cache, S3)
- Parallelitätsgrenzen (standardmäßig 1.000 gleichzeitige Aufrufe pro Konto) können bei Skalierung drosseln
- VPC-verbundene Lambda-Funktionen haben zusätzliche Latenz- und Kaltstart-Probleme

**Lambda überwachen ohne SSH**

Als zum ersten Mal etwas in einer Lambda-Funktion kaputtging, war Leos Instinkt, sich per SSH einzuloggen und den Prozess anzusehen. Es gibt keinen Prozess, in den man sich per SSH einloggen kann. Lambdas Ausführungsumgebungen sind kurzlebig und unzugänglich.

Das Debuggen von Lambda erfordert, ein anderes Toolkit zu erlernen:

**CloudWatch Logs**: Jeder Lambda-Aufruf schreibt sein stdout/stderr in eine CloudWatch-Log-Gruppe. Strukturierte Protokollierung (JSON-Format) macht diese filterbar. Die nützlichsten Felder: Funktionsname, Aufruf-ID, Dauer, Fehlertyp und Ihre benutzerdefinierte Korrelations-ID.

**CloudWatch Metrics**: Lambda veröffentlicht automatisch die Metriken Invocations, Duration, Errors, Throttles und ConcurrentExecutions. Alarme auf Errors und Throttles zu setzen, sollte Tag eins jedes Lambda-Deployments sein.

**AWS X-Ray**: Verteiltes Tracing für Lambda. Fügt einen kleinen Overhead hinzu (2–5 ms pro Aufruf), gibt Ihnen aber einen Flame Graph davon, wo innerhalb der Funktion Zeit verbracht wird. Unverzichtbar für die Kaltstart-Analyse – X-Ray zeigt die Initialisierungsphase getrennt von der Handler-Phase.

**Lambda Insights**: Erweiterte Überwachung für Lambda, verfügbar über CloudWatch Lambda Insights. Fügt Speichernutzung, CPU-Zeit und Init-Dauer zu den Standardmetriken hinzu. Kostet etwas extra, aber für Produktionsfunktionen lohnt es sich.

„Und was, wenn jemand versucht, über die Ausführungsumgebung einzubrechen?“ fragte Priya. „Lambda-Funktionen laufen in isolierten Containern, aber wenn eine Abhängigkeit eine Schwachstelle hat, könnte ein Angreifer Codeausführung innerhalb unserer Lambda erlangen?“

Die Gegenmaßnahmen: Abhängigkeiten minimal und aktuell halten (die Kaltstart-Analyse hatte Leo bereits dazu gebracht, Paketgrößen zu reduzieren), Lambda Layers verwenden, um gemeinsame Bibliotheken zu versionieren, und der Lambda-Ausführungsrolle die minimal erforderlichen Berechtigungen gewähren. Wenn die Funktion nur in einen bestimmten S3-Bucket schreiben und eine bestimmte DynamoDB-Tabelle abfragen kann, ist der Wirkungsradius einer kompromittierten Funktion auf genau das begrenzt.

„Least Privilege für Lambda-Ausführungsrollen ist nicht optional“, sagte Priya. „Es ist das, was den Schaden begrenzt, wenn etwas schiefgeht.“

Sie hatte recht. Und wie die meisten Sicherheitsratschläge war es auch einfach gutes Engineering.

## Zusammenfassung

Die SQS/SNS-Architektur aus Kapitel 19 trennte die Belange des Annehmens von Arbeit und des Verarbeitens. Lambda geht weiter: Es trennt die Belange des Verarbeitens von Arbeit und des Bezahlens für die Kapazität, sie zu erledigen.

- **AWS Lambda** führt Code als Reaktion auf Ereignisse aus, ohne Server zu verwalten.
- **Pay per Use**: pro Aufruf und pro 1 ms Ausführung (aufgerundet) abgerechnet. Null Kosten im Leerlauf.
- Skaliert automatisch von 0 auf Tausende gleichzeitiger Aufrufe.
- **Kaltstarts**: Initialisierungslatenz, wenn keine warme Ausführungsumgebung existiert. Durch Provisioned Concurrency oder leichtgewichtige Laufzeiten gemildert.
- **Lambda Layers**: gemeinsame Code-Pakete, auf die mehrere Funktionen verweisen können, was Duplizierung und Paketgröße reduziert.
- **RDS Proxy**: löst Lambdas Problem der Verbindungserschöpfung, indem es einen dauerhaften Datenbankverbindungspool zwischen Lambda und RDS hält.
- **Überwachung**: CloudWatch Logs, Metrics, X-Ray-Tracing und Lambda Insights verwenden – es gibt keinen Server, in den man sich per SSH einloggen kann.
- Am besten für: ereignisgesteuerte, kurzlaufende, sprunghafte oder seltene Workloads.
- Nicht ideal für: lang laufende Aufgaben (15-Minuten-Hartlimit), zustandsbehaftete Anwendungen, APIs mit hohem Durchsatz und niedriger Latenz ohne Provisioned Concurrency.
- **Serverlos** ist eine Design-Philosophie – Sie verwalten Code, nicht Infrastruktur. Die betriebliche Komplexität verlagert sich, sie verschwindet nicht.

## Prüfungstipps

*SAA-C03-Domäne: Entwurf widerstandsfähiger Architekturen (Domäne 2, Aufgabe 2.1)*

- **Lambda + S3**: Klassisches Muster – eine in S3 hochgeladene Datei löst Lambda zur Verarbeitung aus (Thumbnail-Generierung, Virenprüfung, Datentransformation). Kein Server erforderlich.
- **Lambda + SQS**: Lambda fragt SQS ab und verarbeitet Batches. SQS stellt den Wiederholungs-/DLQ-Mechanismus bereit. Lambda stellt die Verarbeitung bereit.
- **Lambda + API Gateway**: Serverlose HTTP-API. API Gateway kümmert sich um Routing, Auth, Drosselung. Lambda kümmert sich um die Geschäftslogik.
- **API-Gateway-Typen:** REST API = volle Funktionen, Anfragetransformation, Caching, Nutzungspläne. HTTP API = einfacher, günstiger, nur OIDC/OAuth. WebSocket API = dauerhafte bidirektionale Verbindungen. **Autorisierung:** Cognito-Authorizer = Cognito-JWT nativ validieren. Lambda-Authorizer = benutzerdefinierte Token-Validierungslogik. API-Schlüssel = Ratenbegrenzung pro Client (keine Authentifizierung). Examensauslöser: „serverlose REST API“ → API Gateway + Lambda.
- **Kaltstart-Signale**: „Latenzspitzen bei der ersten Anfrage“, „inkonsistente Antwortzeiten“ → Kaltstart. Lösung: Provisioned Concurrency (kostet Geld), kleineres Paket, leichtere Laufzeit.
- **Ausführungsgrenzen**: 15-Minuten-Maximum. 10 GB maximaler Speicher. Standardmäßig 512 MB /tmp-ephemerer Speicher (konfigurierbar bis 10 GB). Diese Grenzen erscheinen in Prüfungsszenarien.
- **Lambda-Timeout-Fehler sind still**: Wenn eine Lambda-Funktion in einen Timeout läuft, erzeugt sie einen CloudWatch-Fehler, aber keine Fehlerantwort auf Anwendungsebene. Überwachen Sie CloudWatch-Lambda-Timeout-Fehler explizit. So fiel Leos 17-Minuten-Berichtsgenerator in seiner ersten Nacht aus, ohne einen Alarm auf Anwendungsebene.
- **VPC-Lambda-Kaltstarts**: Lambda-Funktionen innerhalb einer VPC haben zusätzliche Kaltstart-Latenz (ENI-Bereitstellung). AWS hat dies mit Hyperplane-ENIs deutlich verbessert, aber VPC-Lambda-Kaltstarts sind immer noch langsamer als Nicht-VPC. Vermeiden Sie VPC für Lambda-Funktionen, die keine VPC-Ressourcen brauchen (d. h. die sich nicht mit RDS, ElastiCache oder anderen VPC-only-Ressourcen verbinden).
- **Lambda-Parallelität**: Standardmäßig 1.000 gleichzeitige Ausführungen pro Konto (kann erhöht werden). **Reservierte Parallelität**: garantiert einer Funktion eine bestimmte Anzahl von Ausführungen; verhindert, dass andere Funktionen sie verbrauchen. **Provisioned Concurrency**: wärmt eine Anzahl von Ausführungsumgebungen vor.
- **Event Source Mapping**: Die Lambda-Funktion, die SQS/DynamoDB Streams/Kinesis mit Lambda verbindet. Lambda fragt die Quelle ab und bündelt Datensätze.
- **An Kontolimits stoßen**: „Anwendung wird gedrosselt / LimitExceeded beim Skalieren“ → das Limit in **Service Quotas** prüfen und dort eine Erhöhung anfordern (viele Kontingente, wie die Lambda-Parallelität, sind anpassbar; manche sind harte Limits).
- **RDS Proxy**: Examenssignal: „Lambda-Funktionen verursachen zu viele Datenbankverbindungen“, „Erschöpfung des Connection Pools mit Lambda“ → RDS Proxy hält dauerhafte Verbindungen und multiplext Lambdas kurzlebige Verbindungen.
- **Lambda Layers**: Examenssignal: „Code über mehrere Lambda-Funktionen hinweg teilen“, „Deployment-Paketgröße reduzieren“ → Lambda Layers.
- **Lambda + X-Ray**: Verteiltes Tracing für Lambda. Examensszenario: „Anfragen über mehrere Lambda-Funktionen und Dienste hinweg verfolgen“ → X-Ray-Tracing auf Lambda aktivieren.
- **Lambda Destinations:** Für asynchrone Lambda-Aufrufe können Sie ein Destination sowohl für Erfolgs- als auch für Fehlerergebnisse konfigurieren. Senden Sie erfolgreiche Ergebnisse an SQS, SNS, EventBridge oder eine andere Lambda-Funktion. Senden Sie Fehlschläge an SQS oder SNS zur Alarmierung. Dies ist die bevorzugte Alternative zu DLQs für asynchrone Aufrufe, weil es sowohl Erfolg als auch Fehlschlag erfasst, nicht nur Fehlschlag. Examenssignal: „erfolgreiche Lambda-Ergebnisse an einen anderen Dienst weiterleiten“ oder „sowohl Erfolgs- als auch Fehlerergebnisse von asynchroner Lambda erfassen“ → Lambda Destinations. „Nur fehlgeschlagene Nachrichten bei asynchronem Aufruf erfassen“ → DLQ ist immer noch gültig, aber Destinations ist die vollständigere Lösung.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie das Kaltstart-Problem. Bei welcher Art von Anwendung wären Kaltstarts am problematischsten? Bei welcher Art wären sie akzeptabel?

*(Hinweis: Vergleichen Sie eine Echtzeit-API (Nutzer wartet auf eine Antwort) mit einem asynchronen Hintergrundjob (Nutzer hat seine Bestätigung bereits erhalten und macht andere Dinge).)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen erhält Produktbilder von seinen Lieferanten über einen S3-Bucket. Jedes Bild muss auf vier Standardmaße (Thumbnail, Klein, Mittel, Groß) skaliert und zurück in S3 gespeichert werden. Das Volumen ist unvorhersehbar – an manchen Tagen 10 Bilder, an anderen 100.000. Die Verarbeitung muss innerhalb von 10 Minuten pro Bild abgeschlossen sein. Die Kosten müssen minimiert werden.

Welche Architektur erfüllt diese Anforderungen am BESTEN?

A) EC2-Instanzen in einer Auto Scaling Group, die den S3-Bucket mit Long Polling überwachen  
B) Eine dedizierte EC2-Instanz mit einem Cron-Job, der jede Minute S3 auf neue Bilder prüft  
C) ECS-Fargate-Tasks, ausgelöst durch eine SQS-Warteschlange, wobei S3-Ereignisse in der Warteschlange veröffentlicht werden  
D) S3-Ereignisbenachrichtigung, die eine Lambda-Funktion auslöst, die Bilder verkleinert und Ergebnisse in S3 speichert

**Hinweis 1**: Unvorhersehbares Volumen begünstigt die Skalierung auf null. Welche Option macht das?

**Hinweis 2**: 10 Minuten pro Bild liegen innerhalb des 15-Minuten-Limits von Lambda. Prüfen Sie, ob die Bildgrößenänderungs-Arbeit in Lambdas Beschränkungen passt.

**Hinweis 3**: Eine dedizierte EC2-Instanz, die rund um die Uhr läuft, ist teuer und skaliert nicht.

**Antwort**: D

**Erläuterung**: S3-Ereignisbenachrichtigungen lösen Lambda aus, wenn ein Bild hochgeladen wird. Lambda verkleinert das Bild auf vier Maße und speichert die Ergebnisse in S3. Lambda skaliert automatisch von 0 auf Tausende gleichzeitiger Aufrufe und bewältigt unvorhersehbares Volumen ohne Vorab-Bereitstellung. Null Kosten, wenn keine Bilder verarbeitet werden.

**Warum nicht A?** EC2 in einer ASG skaliert nicht auf null – mindestens eine Instanz läuft immer. Long Polling auf S3 ist kein nativer S3-Ereignismechanismus. Höhere Kosten als Lambda bei sprunghaften Workloads.

**Warum nicht B?** Eine dedizierte EC2-Instanz ist ein Single Point of Failure, skaliert nicht, läuft rund um die Uhr, und ein cron-basierter Ansatz hat bis zu 60 Sekunden Erkennungsverzögerung.

**Warum nicht C?** ECS Fargate funktioniert, ist aber komplexer (erfordert Container-Verwaltung, ECR, Task-Definitionen) und der Start eines Fargate-Tasks dauert zig Sekunden bis Minuten – weit langsamer als ein Lambda-Kaltstart –, was es für sprunghafte, ereignisgesteuerte Arbeit ungeeignet macht. Lambda ist für diesen Anwendungsfall einfacher.

*SAA-C03-Domäne: Entwurf widerstandsfähiger Architekturen — Aufgabe 2.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus möchte täglich um 5 Uhr morgens einen Bericht mit den Top-10-Restaurants des Vortags nach Bestellvolumen erstellen. Der Bericht wird aus DynamoDB-Daten generiert, als PDF formatiert, in S3 gespeichert und per E-Mail an alle Restaurantpartner gesendet.

Entwerfen Sie die vollständige Lambda-basierte Pipeline dafür. Was löst die Lambda aus? Was passiert, wenn die PDF-Generierung 12 Minuten dauert? Was, wenn es 5.000 Restaurantpartner gibt und das Versenden von E-Mails an alle Zeit braucht? Würden Sie eine Lambda oder mehrere verwenden?

Bedenken Sie auch: Was, wenn die Lambda nach 14 Minuten in einen Timeout läuft, nachdem sie 4.500 von 5.000 Restaurant-E-Mails verarbeitet hat? Wie vermeiden Sie das Versenden doppelter E-Mails, wenn die Lambda erneut versucht wird? Welche IAM-Berechtigungen braucht diese Lambda, und was ist die minimal notwendige Menge?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, das Komponieren von Lambda mit anderen Diensten zu üben.)*

## Post-Credits-Szene

Tom überprüfte die Rechnung am Ende des Monats.

Der E-Mail-Dienst: war aus der EC2-Rechnung verschwunden.
Der Bildgrößenänderungs-Job: weg.
Die nächtliche Bereinigungsaufgabe: weg.
Der tägliche Analysebericht: weg. (Der Berichtsgenerator war nach dem 17-Minuten-Timeout-Vorfall zu ECS Fargate verschoben worden, aber die Lambda-Compute-Kosten waren null, weil er nun anders orchestriert wurde.)

Lambda-Gesamtkosten für den Monat: 5,47 $.

„Fünf Dollar“, sagte Tom.

„Und siebenundvierzig Cent“, ergänzte Leo hilfsbereit.

Tom sah sich die Rechnung des Vormonats an, als all diese Dienste noch auf EC2-Instanzen liefen.

„Wir haben 187 $ für dieselben Workloads bezahlt.“

„Lambda berechnet keine Leerlaufzeit“, sagte Leo. „Und die meisten dieser Dienste waren 90 % der Zeit im Leerlauf.“

Tom rief die CloudWatch-Graphen noch einmal auf. Die E-Mail-Dienst-Lambda war 36.412-mal aufgerufen worden. Gesamtdauer: etwa 18.200 GB-Sekunden. Bei 0,0000166667 $ pro GB-Sekunde: 0,30 $ – und selbst das war fiktiv, da 18.200 GB-Sekunden bequem innerhalb der 400.000 GB-Sekunden immer kostenloser Dauer lagen. Der tatsächliche Posten war null.

„Die EC2-Instanz war 18 $ im Monat“, sagte Tom. „Wir haben dreißig Cent ausgegeben – und das ignoriert die kostenlose Stufe, damit wir die echten Stückkosten kennen. Die Rechnung sagt null.“

„Der größte Teil der 5,47 $ war die Provisioned Concurrency auf der Benachrichtigungs-Lambda – die berechnet Gebühren, ob sie läuft oder nicht. Der Bildgrößenänderer, die Bereinigungsaufgabe und der Rest passen in die kostenlose Stufe.“

Tom starrte lange auf den Bildschirm.

„Ich nehme alles zurück, was ich darüber gesagt habe, dass serverlos ein Hype-Wort sei“, sagte er.

„Das hast du nie gesagt“, sagte Leo.

„Ich habe es sehr laut gedacht.“

Im nächsten Kapitel: der Versandcontainer, der jeden Server wie zu Hause anfühlen lässt.
