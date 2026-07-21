# Kapitel 29: Die Datenbankrechnung

Tom druckte die Nutzungsgrafiken aus. Vierzehn Seiten. Er breitete sie auf seinem Schreibtisch aus, bevor er sich traute, die Zahlen zu lesen. Besser alles auf einmal zu sehen, als mitten auf einer Seite Überraschungen zu entdecken.

Das Storage-Audit hatte $6.700 an angesammeltem Verschwendung aufgedeckt — nicht durch schlechte Entscheidungen, sondern durch Unachtsamkeit. Nicht angehängte Volumes, alte Snapshots, Versionshistorien, die niemand S3 gesagt hatte zu bereinigen, unvollständige Multipart-Uploads, die sich monatelang still angesammelt hatten. Tom hatte alles behoben, automatische Bereinigungsregeln implementiert und war zur nächsten Registerkarte in der Tabellenkalkulation übergegangen. Der Datentier war das größte verbleibende Unbekannte: relationale Datenbanken, NoSQL-Tabellen, Cache-Knoten, Backup-Speicher und ein Zeilenposten, der ihn wochenlang beschäftigt hatte.

Die zu überprüfenden Datentier-Zeilenposten:

Aurora-Cluster: $647/Monat.
Legacy-RDS-PostgreSQL-Read-Replicas: $340/Monat.
DynamoDB-Tabellen: $340/Monat.
ElastiCache: $185/Monat.
Aurora-Manual-Snapshots: $87/Monat.

Gesamter Datentier unter Überprüfung: $1.599/Monat.

„Lass mich jeden einzelnen verstehen, bevor ich irgendetwas entscheide", sagte er. „Denn die Datenbank ist nicht der Ort, um Geld durch Abkürzungen zu sparen."

Das war klug. Datenbankfehler, die zu Datenverlust oder Leistungsbeeinträchtigungen führen, kosten weit mehr als die Einsparungen.

Denken Sie an eine Datenbank wie an den Motor eines Autos. Sie können bei einem Auto Geld sparen, indem Sie auf günstigeren Kraftstoff umsteigen, den Reifendruck anpassen und unnötiges Gewicht aus dem Kofferraum entfernen. Aber wenn Sie versuchen, Geld zu sparen, indem Sie einen Ölwechsel überspringen, riskieren Sie, den Motor zu blockieren — und ein blockierter Motor kostet weit mehr als jede Kraftstoffeinsparung. Das Audit, das Tom durchführen wird, folgt der gleichen Logik: Finden Sie die Verschwendung im Kofferraum und im Kraftstofftank, und lassen Sie den Motor in Ruhe, bis Sie genau wissen, was Sie tun.

**Das Datenbank-Workload zuerst verstehen**

Kostenoptimierung bei Datenbanken erfordert das Verständnis des Workloads, bevor man etwas anfasst. Tom hatte dies aus einem Beinahe-Unfall sechs Monate zuvor gelernt: Er hatte angefangen, die Datenbankinstanzgröße basierend auf der durchschnittlichen CPU-Auslastung — 18% — zu reduzieren, ohne zuerst die p95-Zahlen anzuschauen. Ein Kollege hatte ihn gebeten, die CloudWatch-Metriken genauer zu prüfen. Die p95-CPU betrug 61%, und während eines besonders starken Freitag-Abend-Ansturms hatte sie 84% erreicht.

„Der Durchschnitt sagt Ihnen nicht, was beim Peak passiert", sagte Tom, als er Priya davon erzählte. „Wenn ich auf den Durchschnitt skaliert hätte, wären wir an Freitagabenden gedrosselt worden."

„Deshalb schauen Sie sich p95 an, nicht den Durchschnitt", sagte Priya. „Immer."

Dieses Prinzip erstreckte sich über die CPU hinaus. Tom hatte jetzt eine Standard-Vorab-Prüfliste:

- CPU: p95, nicht Durchschnitt
- Speicher: FreeableMemory (in absoluten Bytes, nicht Prozentsatz) — wie nah sind wir am Limit?
- Verbindungen: DatabaseConnections-Maximum über die letzten 30 Tage — wie nah sind wir am Verbindungslimit?
- Lese-/Schreibverhältnis: Bestimmt, ob Read Replicas ihre Kosten einbringen
- Speicherwachstumsrate: Wie viele GB pro Monat fügen wir hinzu?
- Replikationsverzögerung (für Replicas): Hält die Replica Schritt?

Schlüsselfragen:

- Wie hoch ist die durchschnittliche und maximale CPU-Auslastung?
- Wie hoch ist das Lese-/Schreibverhältnis?
- Wächst der Speicher, ist er stabil oder sinkt er?
- Werden Read Replicas genutzt?
- Ist die Instanz unterprovisioniert (verursacht Verlangsamungen) oder überprovisioniert (zahlt für ungenutzte Kapazität)?

Tom rief die CloudWatch-Metriken für alle drei Datenbankdienste über die vorherigen 30 Tage ab:

**Aurora-Cluster**:

- Durchschnittliche CPU: 18% (p95: 61%; Peak: 84% an Freitagabenden)
- FreeableMemory: konstant über 4 GB von 8 GB verfügbar. Kein Problem.
- Lese-/Schreibverhältnis: 14:1 (leselastig)
- Speicher: 180 GB (wächst ~5 GB/Monat)
- DatabaseConnections-Maximum: 312 von 1.000 verfügbar. Komfortabel.

**Read Replicas (RDS PostgreSQL, getrennt von Aurora)**:

- Dies waren zwei Legacy-RDS-Read-Replicas, die vor der Aurora-Migration erstellt wurden und noch liefen.
- Durchschnittliche Verbindungen zu jeder: 2 pro Tag. Durchschnittliche CPU: 3%.
- FreeableMemory: 7,2 GB von 8 GB verfügbar. Die Instanzen waren fast inaktiv.

„Warum laufen diese noch?", fragte Tom.

„Ich hatte sie bereits bereitgestellt — oh", sagte Leo. Er schaute sich die Erstellungsdaten der Instanzen an. „Sie waren für den Fallback während der Aurora-Migration. Ich habe sie nie gelöscht."

Dieser Moment — wenn eine teure Sache monatelang gelaufen ist, ohne genutzt zu werden — ist ein vertrauter in Cloud-Umgebungen. Leo hatte die Replicas als Sicherheitsnetz erstellt. Das Sicherheitsnetz wurde nie benötigt. Aber niemand hatte die Frage gestellt, bis jetzt.

„Wie ist die Verbindungspool-Situation?", fragte Priya und lehnte sich vor. „Bevor wir sie löschen — leiten noch irgendwelche Anwendungskomponenten Lesevorgänge dorthin?"

Tom überprüfte die Verbindungsprotokolle. Die zwei Verbindungen pro Tag kamen von einem Überwachungsskript, das Priya vor vierzehn Monaten geschrieben hatte — es befragte alle bekannten Datenbankendpunkte, um zu überprüfen, ob sie antworteten. Die Replicas wurden nur vom Health Checker abgefragt, nicht von tatsächlichem Anwendungsverkehr.

„Löschen Sie sie", sagte Maya.

Die Replicas wurden terminiert. Monatliche Einsparung: $340.

**Beinahe-Katastrophe beim Verbindungspool**

Während er die Verbindungsmetriken geöffnet hatte, führte Tom eine umfassendere Prüfung über alle Datenbankendpunkte durch. Was er fand, brachte ihn zum Innehalten.

Der Aurora-Writer-Endpunkt zeigte ein DatabaseConnections-Maximum von 312. Komfortabel. Aber der Reader-Endpunkt erzählte eine andere Geschichte.

„Der Reader-Endpunkt hat drei aufeinanderfolgende Freitagabende 847 Verbindungen erreicht", sagte Tom.

„Wie viele ist das Limit?", fragte Priya.

„Das Limit für unsere aktuelle Instanzklasse ist 1.000. Wir haben 847 erreicht. Das sind 85% des Limits."

„Und wir haben es nicht bemerkt, weil wir nicht bis 90% alarmiert wurden?", fragte Maya.

„Wir wurden überhaupt nicht alarmiert", sagte Tom. „Es gibt keinen CloudWatch-Alarm auf die Reader-Endpunkt-Verbindungen. Ich habe das nur gefunden, weil ich die Rohmetriken anschaute."

Bei 1.000 Verbindungen verweigert die Datenbank neue Verbindungen. Jeder Anwendungsthread, der in diesem Moment versucht, eine Datenbankverbindung zu erhalten, löst eine Exception aus. Wenn diese Exception nicht ordnungsgemäß behandelt wird, sieht der Benutzer einen 500-Fehler.

„Wir waren dreimal in Folge dreißig Sekunden von einem Freitagabend-Vorfall entfernt", sagte Leo.

„Haben wir darüber nachgedacht, was passiert, wenn diese Schwelle überschritten wird?", fragte Priya.

„Restaurantpartner sehen fehlgeschlagene Bestellungen während der Abendspitze", sagte Maya. „Das ist keine theoretische Sorge."

Tom richtete sofort einen CloudWatch-Alarm ein: Warnung bei 750 Verbindungen (75% des Limits), Pager bei 900 (90%). Er implementierte auch RDS Proxy für den Reader-Endpunkt — RDS Proxy bündelt und verwaltet Datenbankverbindungen von der Anwendungsebene, was bedeutet, dass fünfzig Anwendungsthreads zehn Datenbankverbindungen teilen können. Der Proxy übernimmt das Multiplexing. Die Datenbank sieht weit weniger Verbindungen, selbst wenn die Anwendung unter starker Last steht.

„Für Aurora Serverless v2 wird RDS Proxy mit $0,015 pro ACU pro Stunde berechnet, mit einer Mindestgebühr von 8 ACUs pro Proxy", sagte Tom. „Aber wenn eine Verbindungslimitverletzung auch nur zu einem teilweisen Ausfall an einem Freitagabend führt, sind die Reputationskosten für Nimbus um Größenordnungen höher."

„Wie viel kostet das pro Monat?", fragte Tom sich selbst und rechnete nach. Ihr Reader läuft auf Serverless v2, also wird der Proxy gegen das 8-ACU-Minimum berechnet: $0,015 × 8 × 730 = $87,60/Monat. Das war ein Kostenpunkt, den er gerne zahlte.

Sie fragen sich vielleicht: Wenn wir bereits mit dem Auto-Scaling von Serverless v2 Geld sparen, warum dann Reserved Instances für die bereitgestellte Ebene? Die Antwort ist, dass das Scaling von Serverless v2 Kosten hat — Sie zahlen pro ACU-Stunde, ob Sie dafür geplant haben oder nicht. Für Teams, die feste Aurora-Konfigurationen betreiben, wandelt die RI-Verpflichtung variable Kosten in vorhersehbare Kosten um. Für Teams, die bereitgestellte Instanzen betreiben (nicht Serverless v2), ist dieser Unterschied sehr wichtig.

**RDS Reserved Instances: Für bereitgestellte Datenbanktier**

Wie EC2 bietet RDS Reserved Instances für verpflichtete Nutzung an.

Für Teams, die feste Aurora-Instanzkonfigurationen verwenden (nicht Serverless v2), können Reserved Instances 30-60% sparen. So funktioniert der bereitgestellte RI-Ansatz: Sie verpflichten sich für 1 oder 3 Jahre zu einem bestimmten Instanztyp, um einen erheblichen Rabatt auf den Stundensatz zu erhalten.

Zur Illustration: Eine db.r6g.large-Writer-Instanz zu $0,26/Stunde On-Demand läuft auf $190/Monat. Eine 1-Jahres-Reserved-Instance für dieselbe reduziert das auf etwa $108/Monat — eine Einsparung von $82/Monat pro Instanz oder fast $1.000 pro Jahr pro Datenbankinstanz.

**Aurora Serverless v2 vs. Standard RI — der Break-Even**

Tom rechnete die Zahlen für ihre spezifische Aurora-Konfiguration durch. Die Frage: Brachte das Auto-Scaling von Aurora Serverless v2 genug Vorteile, oder wäre eine feste bereitgestellte Instanz mit einer Reserved-Instance-Verpflichtung günstiger?

Serverless v2-Preise: $0,12 pro ACU-Stunde. Ihr Cluster skalierte zwischen 0,5 ACU (inaktiv) und 16 ACU (Spitzenlast). Über die letzten 30 Tage betrug der Durchschnitt 4,2 ACU.

Monatliche Serverless v2-Kosten: 4,2 ACU × $0,12 × 730 Stunden = $368/Monat für den Writer.

Vergleich: Eine feste db.r6g.xlarge (ihr geschätztes bereitgestelltes Äquivalent, dimensioniert für die Wochentags-p95-Last) mit einer 1-Jahres-RI: $0,52/Stunde × 0,60 (RI-Rabatt) × 730 = $228/Monat.

„Die RI ist günstiger", sagte Leo.

„Bei einer festen Last, ja", sagte Tom. „Aber schauen Sie sich die Verteilung an. Unsere Niedriglastperiode — 2 bis 7 Uhr morgens, Montag bis Donnerstag — liegt im Durchschnitt bei 0,8 ACU. Bei einer festen bereitgestellten Instanz würden wir in diesen Stunden für viele Male mehr zahlen, als wir verbrauchen — nur im Leerlauf."

„Und Serverless v2 skaliert herunter, um das auszugleichen?"

„Auf 0,5 ACU. Die Leerlaufkosten sind ein Bruchteil dessen, was wir für eine auf den Peak dimensionierte bereitgestellte Instanz zahlen würden."

Die Break-Even-Berechnung: Serverless v2 ist günstiger, wenn Ihr Peak/Basis-Verhältnis über etwa 4:1 liegt. Für Nimbus, mit Freitag-Peaks bei 16 ACU und Montagmorgen-Minima bei 0,8 ACU — ein Verhältnis von 20:1 — war Serverless v2 die richtige Wahl. Wenn ihr Verkehr konsistenter gewesen wäre (etwa 8 ACU ± 20%), wäre ein bereitgestelltes RI günstiger gewesen.

„Es geht nicht nur darum, welche Zahl in diesem Monat kleiner ist", sagte Tom. „Es geht darum, welches Modell unser Wachstum richtig handhabt. Wenn wir im nächsten Quartal um 50% wachsen, skaliert Serverless v2 einfach hoch. Ein bereitgestelltes RI würde eine Neuskalierung benötigen, und wir würden für ungenutzten Headroom während des Übergangs zahlen."

Tom legte den Jahresvergleich explizit auf, damit das Team der Argumentation folgen konnte, nicht nur der Schlussfolgerung.

**Monatliche Aurora-Kosten: Serverless v2 vs. bereitgestelltes RI**

Die bereitgestellte Option: eine db.r6g.xlarge mit einer 1-Jahres-Reserved-Instance. Kosten: $0,52/Stunde On-Demand × 0,60 (RI-Rabatt) × 730 Stunden = $228/Monat. Fest, unabhängig von der Last.

Die Serverless v2-Option: zahle pro ACU-Stunde zu $0,12. Variabel, folgt der tatsächlichen Last.

Tom rief 30 Tage Aurora Serverless v2 ACU-Metriken aus CloudWatch ab und erstellte eine Verteilung:

- 2–7 Uhr morgens, Montag–Donnerstag (geringer Verkehr): durchschnittlich 0,8 ACU → $0,096/Stunde
- 7–11 Uhr morgens, Wochentage (moderat): durchschnittlich 3,2 ACU → $0,384/Stunde  
- 11 Uhr morgens–21 Uhr, Wochentage (Hauptgeschäftszeiten): durchschnittlich 5,8 ACU → $0,696/Stunde
- Freitag 18–22 Uhr (Abendspitze): durchschnittlich 14,1 ACU → $1,692/Stunde
- Samstag 12–20 Uhr (Wochenende geschäftig): durchschnittlich 9,3 ACU → $1,116/Stunde
- Sonntag (leichtester Tag): durchschnittlich 2,1 ACU → $0,252/Stunde

Gewichteter Durchschnitt über den vollen Monat: 4,2 ACU → $0,504/Stunde → $368/Monat.

Bei einem bereitgestellten RI: $228/Monat. Serverless: $368/Monat. Die bereitgestellte Option sparte $140/Monat.

„Das scheint offensichtlich", sagte Leo. „Warum sind wir bei Serverless?"

„Weil $368 der Durchschnitt ist", sagte Tom. „Schauen Sie sich die Freitagabende an."

Freitag 18–22 Uhr: 14,1 ACU durchschnittlich. Für dieses Vier-Stunden-Fenster kostet Serverless $1,692/Stunde. Eine db.r6g.xlarge zu $228/Monat ist bei 32 GiB Speicher gedeckelt — entspricht etwa 16 ACUs. Der Serverless-Cluster lag in diesem Fenster durchschnittlich bei 14,1 ACUs und stieß fast an die Obergrenze der xlarge, ohne Spielraum für Spitzen.

„Eine bereitgestellte Instanz, die für unseren Freitag-Peak mit echtem Spielraum dimensioniert ist, wäre eine db.r6g.2xlarge", sagte Tom. „Zum RI-Satz sind das $1,04/Stunde × 0,60 = $0,624/Stunde. Monatlich: $456/Monat."

„Das ist mehr als der Serverless-Durchschnitt von $368", sagte Maya.

„Richtig. Und wenn wir die bereitgestellte Instanz für die Wochentags-Baseline dimensionieren — die db.r6g.xlarge — wären die Freitagabende ein Problem. Bei Spitzenlast würden wir 14 ACUs gegen etwa die gesamte Kapazität der xlarge drücken. Das ist Sättigung."

„Also müsste man für den Peak vorab dimensionieren", sagte Priya.

„Auf Kosten des Bezahlens für ungenutzte Kapazität die anderen 160 Stunden der Woche", sagte Tom. „Die Rechnung für bereitgestelltes RI, die günstiger ausgeht, funktioniert nur, wenn Ihr Peak/Basis-Verhältnis niedrig ist. Unseres ist 20:1. Das ist genau das Szenario, für das Serverless v2 entwickelt wurde."

Er zeigte die Zahlen nebeneinander:

| Option | Durchschnittsmonat | Ruhige Nacht (2 Uhr) | Freitagspitze (20 Uhr) |
|---|---|---|---|
| Serverless v2 | $368 | $0,096/h | $1,692/h |
| Bereitgestelltes RI (r6g.xl) | $228 | $228/730h = $0,312/h | gedeckelt — Sättigungsrisiko |
| Bereitgestelltes RI (r6g.2xl) | $456 | $0,624/h | komfortabler Spielraum |

„Die Serverless-Option ist $368", sagte Tom. „Die richtig dimensionierte bereitgestellte Option ist $456 — und das bevor man die Betriebskosten für das Überwachen und manuelle Skalieren der bereitgestellten Instanz berücksichtigt, wenn sich unsere Verkehrsmuster im nächsten Quartal ändern."

„Und die Betriebskosten", sagte Priya, „sind nicht nichts."

„Nein. Mit Serverless müssen wir nicht über Instanzgrößen nachdenken. Aurora kümmert sich darum. Mit bereitgestellt müsste ich jeden Quartal neu bewerten, ob die aktuelle Instanzklasse noch zu unserem Verkehr passt. Das ist nicht zeitaufwändig, aber es ist etwas, das schiefgehen kann, wenn wir aufhören aufzupassen."

„Es wird in Ordnung sein, solange wir nicht vergessen, es neu zu dimensionieren", sagte Leo und bemerkte sich dann selbst. „Was genau dann ist, wenn es nicht in Ordnung sein wird."

„Genau", sagte Tom.

Die Schlussfolgerung hielt: Serverless v2 zu $368/Monat war die richtige Wahl für das 20:1-Peak/Basis-Verhältnis von Nimbus und die Präferenz seines Teams für operative Einfachheit. Das bereitgestellte RI war nur für Teams interessant, bei denen der Verkehr nicht wesentlich variierte — ein 2:1- oder 3:1-Verhältnis, bei dem die bereitgestellte Instanz selten untätig war.

„Was würde uns dazu bringen, auf bereitgestellt umzusteigen?", fragte Maya.

„Wenn sich unser Verkehrsmuster verflachte", sagte Tom. „Wenn Nimbus bis zu dem Punkt wüchse, wo die Niedriglast-Baseline auch hoch wäre — sagen wir, 8 ACU um 2 Uhr morgens statt 0,8 — würde das Verhältnis auf 2:1 sinken und bereitgestellt würde wirtschaftlich Sinn ergeben. Das ist ein anderes Geschäftsproblem. Eines, das wir haben möchten."


Für Aurora mit Serverless v2 gelten Reserved Instances nicht direkt — Serverless v2 skaliert dynamisch und Sie zahlen pro ACU-Stunde. Dies ist Nimbus' aktuelle Konfiguration: Der primäre Aurora-Writer und -Reader verwenden beide Serverless v2. Die Einsparungen für Nimbus kommen von der Auto-Scaling-Natur von Serverless v2 selbst — Sie zahlen nicht für ungenutzte Kapazität, wenn der Verkehr gering ist.

Teams, die noch feste Aurora-Instanzen betreiben, sollten die RI-Verpflichtung bewerten, sobald der Instanztyp drei oder mehr Monate stabil war.

**DynamoDB: On-Demand vs. Provisioned**

In Kapitel 9 haben wir die zwei Kapazitätsmodi von DynamoDB vorgestellt: On-Demand und Provisioned.

Nimbus hatte DynamoDB seit Beginn im On-Demand-Modus betrieben. Bei geringem Verkehr war dies korrekt — On-Demand ist pro Anfrage teurer, hat aber keine Mindestgebühr.

Jetzt, mit 18 Monaten Verkehrsdaten in CloudWatch, konnte Tom Muster erkennen.

Durchschnittliche Leseanfragen: 225 pro Sekunde (etwa 19,4 Millionen pro Tag)
Durchschnittliche Schreibanfragen: 60 pro Sekunde (etwa 5,2 Millionen pro Tag)
Spitzentag (Freitag): 180% der durchschnittlichen DynamoDB-Anfragen (ElastiCache absorbiert ~95% der Lesevorgänge, sodass DynamoDB nur einen Bruchteil der gesamten 25-fachen Auftragsvolumenspikte sieht)

**On-Demand-Preise**: $1,25 pro Million Schreibanfragen, $0,25 pro Million Leseanfragen.
**Provisioned-Preise**: $0,00065 pro Schreibkapazitätseinheit pro Stunde, $0,00013 pro Lesekapazitätseinheit pro Stunde.

Tom berechnete den Break-Even-Punkt: Bereitgestellte Kapazität wird günstiger, wenn Sie sie konsistent genug nutzen, dass Sie nicht die On-Demand-Prämie in Leerlaufperioden zahlen.

(Ein Hinweis zu den Zahlen in diesem Abschnitt: Sie spiegeln die Rechnung des Teams zu diesem Zeitpunkt wider und sind illustrativ. Ende 2024 hat AWS die DynamoDB On-Demand-Preise um 50% gesenkt, was den Break-Even erheblich verschob — heute gewinnt bereitgestellte Kapazität nur, wenn die Auslastung konsistent hoch ist. Führen Sie diese Berechnung immer mit aktuellen Preisen durch.)

Mit 18 Monaten Daten, die konsistente Tagesmuster zeigen, war bereitgestellte Kapazität mit **DynamoDB Auto Scaling** die richtige Wahl:

- Mindestkapazität auf 60% der Durchschnittslast setzen
- Maximum auf 250% des Durchschnitts setzen (handhabt Freitags-Spitzen)
- Auto Scaling passt die bereitgestellte Kapazität zwischen diesen Grenzen an

Monatliche DynamoDB-Kosten: von $340 (On-Demand) auf $230 (Provisioned mit Auto Scaling) gesunken. 32% Reduzierung.

„Warte — aber *warum* würden wir das so machen?", fragte Maya. „Wir sind seit Beginn bei On-Demand, weil wir unseren eigenen Verkehrsmustern nicht trauten. Was hat sich geändert?"

„Achtzehn Monate Daten", sagte Tom. „Wir wissen jetzt, wie unsere Muster aussehen — konstante Wochentags-Baseline, Freitags-Spitzen, ruhige Sonntagsperioden. On-Demand war die richtige Entscheidung, als wir es nicht wussten. Provisioned mit Auto Scaling ist jetzt die richtige Entscheidung."

„Aber wenn wir über-provisionieren", fragte Leo, „zahlen wir für ungenutzte Kapazität."

„Das ist das Risiko", sagte Tom. „Mit Auto Scaling setzen wir das Minimum hoch genug, um Drosselung zu vermeiden, und lassen AWS innerhalb unseres Rahmens verwalten."

„Und wenn sich unser Verkehrsmuster wesentlich ändert?"

„Dann passen wir die Grenzen an. Das überprüfen wir quartalsweise."

**ElastiCache: Richtige Dimensionierung und die Warngeschichte**

Die ElastiCache-Rechnung: $185/Monat. Eine cache.r6g.large-Redis-Instanz in jedem AZ (zwei Knoten, primär + Replikat).

CloudWatch-Metriken zeigten:

- Durchschnittliche Speicherauslastung: 34%
- Peak: 44%

Die Instanz war über-provisioniert. Ein cache.m6g.large — halb so viel Speicher wie das r6g.large — würde die Last wahrscheinlich mit etwas Spielraum handhaben.

Aber hier machte Tom eine Pause. Er erinnerte sich, was bei einem früheren Unternehmen passiert war, als er aggressiv einen Cache neu dimensioniert hatte — und er erzählte dem Team die ganze Geschichte, weil es die Art Geschichte war, die erzählt werden musste, bevor man sich mitten darin befand.

Bei seinem früheren Unternehmen — einer SaaS-Plattform für Finanzberichte — war der ElastiCache-Cluster ein cache.r6g.large gewesen. Zwei Knoten, primär und Replikat. Durchschnittliche Speicherauslastung: 26%. Beobachteter Peak: 37%. Der Bereitschaftsingenieur, der es kennzeichnete, hatte die Rechnung gemacht: Ein cache.m6g.large würde die Last mit etwa 25% Spielraum über dem beobachteten Peak bewältigen. Einsparung: $60/Monat — Preise in der Region und Knotengeneration dieses Unternehmens zu dieser Zeit, kleiner als die entsprechende Lücke bei Nimbus heute. Die Änderung wurde an einem Dienstag genehmigt.

Im folgenden Monat, an einem Donnerstagabend um 23:47 Uhr, begann der Monatsabschluss-Settlement-Batch.

Der Settlement-Batch lief quartalsweise. Er zog die Transaktionsdatensätze jedes aktiven Kontos für die vorhergehenden drei Monate, aggregierte sie, berechnete Steuern und schrieb Settlement-Datensätze. Der Cache wurde verwendet, um Zwischen-Aggregationszustand zu speichern — den laufenden Gesamtstand jedes Kontos, während der Batch voranschritt. Der cache.r6g.large hatte das immer bewältigt. Niemand hatte sich die Settlement-Batch-Metriken speziell angeschaut, als die Entscheidung zur Neudimensionierung getroffen wurde, weil der Batch quartalsweise war und das Beobachtungsfenster vier Wochen betragen hatte.

Bei der kleineren Instanz war maxMemoryPolicy auf `allkeys-lru` eingestellt — wenn der Speicher voll war, würde Redis den zuletzt verwendeten Schlüssel verdrängen, um Platz zu schaffen. Das ist die richtige Richtlinie für einen allgemeinen Cache. Aber für den Settlement-Batch wurde jeder Schlüssel im Cache aktiv benötigt. Als der Speicher bei 84% der 6,38 GB des m6g.large voll war, begann Redis, Schlüssel zu verdrängen. Jede Verdrängung war ein Cache-Miss. Jeder Cache-Miss schickte eine Abfrage an die zugrunde liegende PostgreSQL-Datenbank, um den verdrängten Wert aus rohen Transaktionsdatensätzen neu zu berechnen.

Der Datenbankverbindungspool war für Steady-State-Verkehr konfiguriert, nicht für Settlement-Batch-Last. Innerhalb von vier Minuten nach Beginn der Verdrängungen hatte die Datenbank 847 aktive Verbindungen. Das Verbindungslimit war 1.000. Nach 9 Minuten begannen die ersten Anwendungsthreads, „zu viele Verbindungen"-Fehler zu sehen. Nach 12 Minuten waren drei Dienste, die den Datenbankverbindungspool teilten — der Settlement-Batch, der Echtzeit-Berichtsdienst und die clientseitige API — alle betroffen.

Der Bereitschaftsingenieur eskalierte um 23:59 Uhr. Die Incident-Überprüfung begann um 00:08 Uhr.

Erste Antwort: Erhöhen des Lambda-Timeouts für die Settlement-Batch-Funktion (der Settlement-Batch war teilweise Lambda-basiert). Das war falsch. Das Timeout war nicht das Problem.

Zweite Antwort: Hinzufügen einer zweiten Lambda-Funktion zur Parallelisierung des Settlement-Batch. Auch falsch. Mehr Parallelismus bedeutete mehr gleichzeitigen Cache-Zugriff, was schnellere Verdrängungen bedeutete, was die Situation verschlimmerte.

Dritte Antwort: Den Settlement-Batch herunterskalieren, um den Datenbankdruck zu reduzieren. Das half leicht, behob aber nicht die Grundursache.

Vierte Antwort, um 2:31 Uhr: Den cache.r6g.large wiederherstellen. Der Speicherdruck fiel sofort. Verdrängungen hörten auf. Der Datenbankverbindungspool wurde bereinigt. Der Settlement-Batch wurde um 4:17 Uhr abgeschlossen, um mehr als vier Stunden verzögert.

Gesamter Incident: Vier Stunden beeinträchtigte API-Leistung für Clients, die versuchen, auf Berichte zuzugreifen. Ein vollständiger Settlement-Batch verzögert. Ingenieurszeit: ungefähr 22 Stunden über fünf Ingenieure. Geschätzte Direktkosten: $40.000.

Die $60/Monat-Einsparung hatte in einem einzigen Incident $40.000 gekostet.

„Der Fehler war nicht die Entscheidung zur Neudimensionierung", sagte Tom. „Die Entscheidung war basierend auf den verfügbaren Daten vertretbar. Der Fehler war das Beobachtungsfenster. Wir haben vier Wochen Metriken gemessen. Der Settlement-Batch war quartalsweise. Wir schauten in den falschen Zeitrahmen."

„Wie vermeidet man das?", fragte Maya.

„Sie fragen: Was ist die höchststakige Operation, die dieser Cache unterstützt? Und Sie finden die spezifischen Metriken dieser Operation. Nicht die durchschnittliche Woche. Die spezifische Woche — oder Monat — oder Quartal — wenn die Last am höchsten ist. Und Sie dimensionieren dafür."

„Und wenn man die Metriken nicht finden kann, weil die Operation selten ist?"

„Das ist die Antwort", sagte Tom. „Wenn man keine Metriken für ein spezifisches Hochlast-Szenario finden kann, ist die richtige Antwort, noch nicht neu zu dimensionieren. Warten Sie auf das nächste Auftreten, instrumentieren Sie intensiv, dann dimensionieren Sie basierend auf dem, was Sie beobachtet haben."

Der Nimbus ElastiCache-Cluster hatte seine eigene hochstakige Operation: die Freitag-Abendspitze. Tom hatte diese Daten — drei aufeinanderfolgende Freitagabende hatten 44% Speicherauslastung auf dem r6g.large erreicht, etwa 5,7 GB Live-Daten. Auf dem cache.m6g.large mit 6,38 GB würde dieses gleiche Working Set bereits nahe 90% sitzen — und wenn sich irgendwas in der Auftragsverarbeitungs-Pipeline ändern würde, um mehr Cache-Platz zu nutzen — ein neues Feature, eine andere Caching-Strategie — werden 90% Verdrängungsbereich.

Er rechnete die Zahlen trotzdem durch. Von r6g.large zu m6g.large wechseln: zwei Knoten zu $0,127/Stunde versus zwei Knoten zu $0,090/Stunde, laufend 730 Stunden pro Monat. Large: $185/Monat. Das m6g-Paar: $131/Monat. Potenzielle Einsparung: $54/Monat. Er testete das m6g.large in Staging zwei Wochen lang unter Last. Der Speicher erreichte 71% — nah genug am Limit, dass er sich unwohl fühlte.

Dann berechnete er die Alternative: Den cache.r6g.large behalten, aber Reserved Nodes kaufen (1-Jahres-Verpflichtung). Von On-Demand $185 zu Reserved $120/Monat. Einsparung: $65/Monat ohne Änderung des Instanztyps.

„Die $65/Monat, die ich mit Reserved Nodes bei derselben Instanzgröße sparen würde, sind eine echte Einsparung", sagte Tom. „Die $54/Monat, die ich durch den Wechsel zu m6g.large sparen würde, sind eine falsche Wirtschaftlichkeit, wenn sie die Freitag-Abendspitze riskiert — und sie spart nicht einmal so viel. Manchmal riskiert die Neudimensionierung auf eine kleinere Instanz einen Leistungsvorfall — Reserved Nodes geben uns mehr Einsparungen ohne jegliches Risiko."

Er kaufte die Reserved Nodes für das r6g.large.

„Wenn die sicherere Option auch mehr spart", sagte Tom, „ist es nicht einmal ein Trade-off."

**RDS-Backup-Aufbewahrung: Der Speicher-Trade-off**

RDS-automatisierte Backups werden in S3 gespeichert (ohne zusätzliche Speichergebühr bis zu 100% Ihrer Datenbankgröße). Die Standard-Aufbewahrung beträgt 7 Tage.

Für die 180-GB-Aurora-Datenbank von Nimbus waren 7 Tage Backups angemessen — sie konnten in Tests innerhalb dieses Fensters aus einem Backup wiederherstellen.

Aber Tom bemerkte: Sie hatten auch manuelle Snapshots von jeder bedeutenden Bereitstellung, unbegrenzt aufbewahrt.

23 manuelle Snapshots, insgesamt 4,1 TB Snapshot-Speicher.
Kosten: $0,021/GB/Monat für Aurora-Backup-Speicher = etwa $87/Monat an manuellem Snapshot-Speicher.

Sie behielten die letzten 3 manuellen Snapshots pro Umgebung (Produktion, Staging). Löschen des Rests — etwa 1,1 TB behalten.
Einsparung: $64/Monat.

„Wir haben $64 im Monat für Versicherungen gezahlt, die wir nie benutzt haben", sagte Leo.

„Wir haben für Seelenfrieden gezahlt", korrigierte Tom. „Die Frage ist: Wie viel Seelenfrieden ist $64 im Monat wert?"

„Mit einem richtigen Notfallwiederherstellungsplan", sagte Priya, „können Sie denselben Seelenfrieden aus 7 Tagen automatisierter Backups und 3 manuellen Snapshots bekommen."

„Einverstanden. Jetzt."

**Variante: Wenn Provisioned nach hinten losgeht**

Wenn Ihr Verkehrsmuster konsistent und vorhersehbar ist, spart bereitgestellte Kapazität mit Auto Scaling 30% gegenüber On-Demand. Aber wenn ein neues Feature startet und Ihr Schreibvolumen über Nacht um das 5-Fache ansteigt, werden Sie gedrosselt, bevor Auto Scaling aufholt — Auto Scaling reagiert auf beobachteten Verkehr, was bedeutet, dass es eine Verzögerung gibt. Den On-Demand-Modus für die Wochen rund um eine große Feature-Einführung beizubehalten, ist ein vernünftiger Trade-off: etwas höhere Kosten, kein Drosselungsrisiko in einer Periode, in der Sie beobachten, wie sich Verkehrsmuster in Echtzeit ändern.

Wenn Sie ungenutzte Read Replicas eliminieren (wie Nimbus' Legacy-PostgreSQL-Replicas), sind die Einsparungen sofort und eindeutig — es gibt keinen Trade-off, da die Replicas keinen Wert boten. Aber wenn Sie versucht sind, eine Read Replica zu eliminieren, die nur 2% des Verkehrs bewältigt, prüfen Sie, was mit dem Primary passiert, wenn diese 2% während einer Spitze nirgendwo hingehen können. Einige Read Replicas existieren für Spielraum, nicht für aktuelle Last.

Bei der Prüfung gilt die gleiche Logik: Eine Steady-Baseline-Workload deutet auf reservierte Kapazität hin; Spitzen-und-Leerlauf deutet auf On-Demand oder Serverless hin.

**Die Datenbankoptimierungs-Zusammenfassung**

| Dienst                                                | Vorher     | Nachher  | Monatliche Einsparung |
|-------------------------------------------------------|------------|----------|-----------------------|
| Aurora (Serverless v2 nach Analyse beibehalten)        | $647       | $647     | $0 (richtiges Modell) |
| RDS-Read-Replicas (ungenutzt)                          | $340       | $0       | $340                  |
| DynamoDB (On-Demand -> Provisioned + Auto Scaling)    | $340       | $230     | $110                  |
| ElastiCache (Reserved Nodes)                           | $185       | $120     | $65                   |
| Aurora-Manual-Snapshots                               | $87        | $23      | $64                   |
| RDS Proxy (Verbindungssicherheit)                     | $0         | $88      | -$88                  |
| **Gesamt**                                            | **$1.599** | **$1.108** | **$491/Monat**       |

$491 pro Monat in Datenbankeinsparungen. $5.892 pro Jahr.

Tom stellte diese Zahl neben die Storage-Bereinigung ($6.200/Jahr), die S3-Lifecycle-Richtlinien aus Kapitel 23 ($7.800/Jahr) und die Savings Plan-Einsparungen ($14.200/Jahr).

Gesamter Optimierungseinfluss bis heute: $34.092/Jahr.

„Das ist echtes Durchhaltevermögen", sagte Maya.

„Oder mehrere ernsthafte Experimente", sagte Priya.

„Oder zwölf Monate Experimente", sagte Leo.

Alle drei hatten recht.

## Stärken und Einschränkungen

**DynamoDB Provisioned mit Auto Scaling**:

- Günstiger als On-Demand für vorhersehbare, konsistente Workloads
- Auto Scaling handhabt Variabilität ohne dauerhaftes Überprovisionieren
- Erfordert Überwachung, um sicherzustellen, dass Kapazitätsgrenzen angemessen bleiben

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Erhebliche Einsparungen für stabile, lang laufende Workloads
- Gebundene Verpflichtung — wenn sich Ihre Bedürfnisse ändern, haben Sie für ungenutzte Kapazität bezahlt
- Im Gegensatz zu EC2 Standard RIs können RDS RIs **nicht** auf dem Reserved Instance Marketplace weiterverkauft werden — der Marketplace ist nur für EC2. Eine ungenutzte RDS RI ist versunkene Kosten, was die Größenentscheidung wichtiger macht

**Das allgemeine Prinzip**:

- Verstehen Sie immer die Auslastung, bevor Sie optimieren — verwenden Sie p95, nicht Durchschnitt
- Ungenutzte Ressourcen (wie die Legacy-Read-Replicas) sind die Optimierung mit dem höchsten Ertrag
- Neudimensionierung erfordert die Validierung im Staging, bevor sie auf die Produktion angewendet wird, und das Überprüfen auf saisonale Workload-Muster, die möglicherweise in einem Standard-Beobachtungsfenster nicht erscheinen
- Reserviertes Pricing erfordert Vertrauen in die Workload-Stabilität

## Zusammenfassung

Das Datenbankaudit schloss eine monatliche Lücke von $491 ohne jemals den Motor zu berühren — die Einsparungen kamen aus dem Kofferraum: ungenutzte Replicas, vergessene Snapshots und Kapazität, die für Verkehrsmuster berechnet wurde, die Nimbus überholt hatte. Toms Disziplin hielt durch jeden Zeilenposten: Verstehen Sie zuerst den Workload, dann optimieren Sie. Der eine neue Aufwand, RDS Proxy, war die Versicherung, die die Freitagnacht-Verbindungszahlen sagten, dass sie sie brauchten.

- **Zuerst prüfen**: Rufen Sie CloudWatch-Metriken ab, bevor Sie Datenbankänderungen vornehmen. Verwenden Sie p95-Latenz und p95-CPU — keine Durchschnitte. Prüfen Sie FreeableMemory und Verbindungsmaxima.
- **Ungenutzte Ressourcen löschen**: Read Replicas, inaktive Datenbanken und Testinstanzen, die nicht mehr benötigt werden.
- **Überwachen Sie Ihren Verbindungspool**: Setzen Sie Alarme auf DatabaseConnections bei 75% und 90% des Limits. Erwägen Sie RDS Proxy für Verbindungs-Multiplexing.
- **DynamoDB On-Demand vs. Provisioned**: On-Demand für unvorhersehbaren Verkehr; Provisioned + Auto Scaling für konsistente Muster.
- **ElastiCache-Neudimensionierung**: Testen Sie in Staging unter realistischen Spitzenlasten, einschließlich saisonaler Spitzen. Reserved Nodes bieten Einsparungen bei derselben Instanzgröße, wenn aggressives Downsizing Risiken trägt.
- **RDS-Snapshot-Verwaltung**: Behalten Sie nur die Snapshots, die Sie benötigen. Manuelle Snapshots werden unbegrenzt gespeichert, wenn sie nicht gelöscht werden.

## Prüfungstipps

*SAA-C03-Domain: Kostenoptimierte Architekturen entwerfen (Domain 4, Aufgabe 4.3)*

- **DynamoDB-Preismodi**: On-Demand = Zahlung pro Anfrage (höhere Kosten pro Einheit, kein Minimum). Provisioned = Zahlung pro Kapazitätseinheit pro Stunde (niedrigere Kosten pro Einheit, muss Kapazität zuweisen). **DynamoDB Auto Scaling** passt die bereitgestellte Kapazität automatisch an.
- **RDS Reserved Instances**: Verfügbar für alle RDS-Engine-Typen. Multi-AZ-Bereitstellungen können Reserved Instances verwenden (Sie verpflichten sich zu Multi-AZ). 1- oder 3-Jahres-Laufzeit.
- **ElastiCache Reserved Nodes**: Dasselbe Verpflichtungsmodell wie EC2 Reserved Instances. Pro Knoten angewendet, nicht pro Cluster.
- **RDS-Snapshot-Speicher**: Automatisierte Backups sind bis zu 100% der Datenbankgröße kostenlos. Manuelle Snapshots werden pro GB pro Monat in S3 berechnet. Prüfungsszenario: „RDS-Speicherkosten reduzieren" → alte manuelle Snapshots löschen.
- **DynamoDB-Reservekapazität**: Auch für DynamoDB verfügbar (Verpflichtung zu einer bestimmten Lese-/Schreibkapazität für 1 oder 3 Jahre mit Rabatt). Unterscheidet sich von Standard-Provisioned — Sie zahlen im Voraus für Kapazität in allen Ihren DynamoDB-Tabellen in einer Region.
- **Aurora Serverless v2 vs. Provisioned**: Serverless v2 skaliert automatisch, ideal für variable Workloads. Provisioned mit Reserved Instances ist günstiger für stabile, vorhersehbare Workloads.

## Übungen

**Übung 1 — Wiederholen**

Erläutern Sie, wann Sie DynamoDB-On-Demand-Kapazität versus bereitgestellte Kapazität mit Auto Scaling verwenden sollten. Welche Informationen benötigen Sie, um diese Entscheidung zu treffen?

*(Hinweis: Denken Sie an den Automotor — sich ohne Verkehrsdaten zu bereitgestellter Kapazität zu verpflichten, ist der Ölwechsel, den Sie überspringen, während Sie nach 18 Monaten vorhersehbarer Muster bei On-Demand zu bleiben, das Bezahlen für einen Tune-up ist, den Sie nicht brauchen.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen betreibt eine DynamoDB-Tabelle für die Rangliste eines mobilen Spiels. Der Verkehr ist das ganze Jahr sehr konsistent, außer während eines saisonalen Events, das Monate im Voraus geplant ist (eine Woche pro Quartal, mit 10-fachem normalen Verkehr, wenn Spieler am ersten Tag beitreten). Die Priorität des Unternehmens ist es, die Datenbankkosten während der langen, vorhersehbaren Steady-State-Perioden zu minimieren, während die Leistung während der bekannten Event-Wochen aufrechterhalten wird.

Welche DynamoDB-Kapazitätsstrategie erfüllt diese Anforderungen AM BESTEN?

A) On-Demand-Kapazität, um saisonale Spitzen ohne Drosselung zu handhaben  
B) Bereitgestellte Kapazität, eingestellt auf saisonale Spitzenniveaus (immer für 10-fachen Verkehr bereitgestellt)  
C) Bereitgestellte Kapazität mit DynamoDB Auto Scaling, mit einer maximalen Kapazität für den saisonalen Peak  
D) DynamoDB-Reservekapazitätseinheiten für 3 Jahre auf normalem Verkehrsniveau

**Hinweis 1**: „Sehr konsistenter Verkehr außer einem geplanten, bekannten saisonalen Peak" — welcher Modus handhabt beides effizient? (Die Stärke von On-Demand ist *unvorhersehbarer* Verkehr; dieser Verkehr ist vorhersehbar.)

**Hinweis 2**: „Kosten minimieren" im Off-Peak bedeutet, dass Sie nicht für 10x die ganze Zeit über-provisionieren können.

**Hinweis 3**: DynamoDB Auto Scaling kann für das saisonale Event hochskalieren und danach wieder herunterskalieren.

**Antwort**: C

**Erklärung**: Bereitgestellte Kapazität mit Auto Scaling skaliert die Tabelle basierend auf dem tatsächlichen Verkehr. Während normaler Perioden ist die Kapazität auf normalem Niveau (niedrige Kosten). Während des saisonalen Events — dessen Termine im Voraus bekannt sind und dessen Verkehr sich schrittweise über den ersten Tag aufbaut — verfolgt Auto Scaling den Anstieg bis zum konfigurierten Maximalniveau (handhabt den 10-fachen Peak), und das Team kann das Minimum auch vor dem geplanten Start als zusätzlichen Spielraum erhöhen. Nach dem Event skaliert die Kapazität wieder herunter. Das ist günstiger als On-Demand während des Steady-State, der das Jahr dominiert (On-Demand kostet mehr pro Anfrage), und günstiger als immer für 10x zu provisionieren.

**Warum nicht A?** On-Demand handhabt Spitzen ohne Drosselung, aber seine Stärke ist *unvorhersehbarer* Verkehr. Hier ist der Verkehr sehr konsistent und der Peak ist geplant und schrittweise — für den ~92% des Jahres, der Steady-State ist, die On-Demand-Pro-Anfrage-Prämie zu zahlen, widerspricht der erklärten Priorität, die Kosten während normaler Perioden zu minimieren.

**Warum nicht B?** Dauerhaft auf 10x zu provisionieren bedeutet, dass ~90% der bereitgestellten Kapazität für ~92% des Jahres ungenutzt sitzt — Bezahlung für Kapazität, die nie genutzt wird.

**Warum nicht D?** Reservekapazitätseinheiten sperren Sie auf normale Verkehrsniveaus. Während des 10-fachen saisonalen Events würden Sie über den reservierten Betrag hinaus gedrosselt werden, oder Sie müssten On-Demand oben drauf hinzufügen.

*SAA-C03-Domain: Kostenoptimierte Architekturen entwerfen — Aufgabe 4.3*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus bewertet ein neues Feature: ein Restaurant-Analytics-Dashboard, das Echtzeit-Bestellzahlen, Umsatz pro Stunde und Kundendemographie anzeigt. Diese Daten würden eine Datenbank ungefähr 200 Mal pro Minute abfragen (eine Abfrage pro Analyst pro Seitenaktualisierung, mit 10 Analysten).

Derzeit befinden sich die Analytics-Daten in Athena (S3). Sollten sie das Dashboard auf Athena aufbauen, oder sollten sie die Daten in eine Datenbank laden? Wenn eine Datenbank, welche (Aurora, DynamoDB, Redshift)?

Berücksichtigen Sie: Abfragehäufigkeit, Anforderungen an die Datenaktualität, Abfragekomplexität (Aggregationen, Joins) und Kosten pro Abfrage bei diesem Volumen.

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, die Datenbankauswahl für Analytics-Workloads zu üben.)*

## Post-Credits-Szene

Tom präsentierte Maya die vollständige Kostenoptimierungszusammenfassung.

Drei Monate Arbeit. $34.092 in jährlichen Einsparungen identifiziert, der Großteil bereits implementiert.

„Was bleibt noch?", fragte Maya.

„Optimierungen, über die ich noch nicht sicher bin", sagte Tom. „Die Aurora-Konfiguration könnte vielleicht weiter neu dimensioniert werden, aber ich möchte noch ein Quartal Daten, bevor ich mich verpflichte. Und es gibt eine Datentransfer-Frage, die ich noch nicht vollständig analysiert habe."

„Die Netzwerkkosten."

„Ja. Das kommt als nächstes."

Maya schaute auf die Zahlen. „Tom, ich möchte etwas verstehen. Diese Optimierung — Sie haben drei Monate daran gearbeitet. Das ist ein erheblicher Teil Ihrer Zeit."

„Ungefähr 30%."

„Und Sie haben etwa $34.000 pro Jahr gefunden. Also zahlt sich die Optimierung in — was, einigen Monaten Ihres Gehalts aus?"

Tom schaute sie an. „Ungefähr das."

„Und jedes Jahr danach sind es reine Einsparungen."

„Oder reine Reinvestition", sagte er. „Gleicher Effekt."

Maya nickte. „Das ist, was ich möchte, dass Sie tun. Nicht nur bei Speicher und Datenbanken — bei allem. Machen Sie Kostenoptimierung zu einer kontinuierlichen Funktion Ihrer Rolle."

Tom hatte seinen Job noch nie so beschrieben gehört. Er fand es sowohl zutreffend als auch befriedigend.

Im nächsten Kapitel: die letzte verbleibende Kostenkategorie — und diejenige, die fast jeden überrascht.
