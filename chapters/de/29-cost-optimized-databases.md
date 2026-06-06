# Kapitel 29: Die Datenbankrechnung

Tom druckte die CloudWatch-Metriken aus. Vierzehn Seiten. Er breitete sie auf seinem Schreibtisch aus, bevor er sich zutraute, die Zahlen zu lesen. Besser, alles auf einmal zu sehen, als mitten auf einer Seite Überraschungen zu finden.

**Rückblick: Speicher erledigt, Datenbanken als Nächstes**

Das Speicher-Audit hatte 6.700 $ an angesammelter Verschwendung zutage gefördert – nicht durch schlechte Entscheidungen, sondern durch Unaufmerksamkeit. Nicht angeschlossene Volumes, alte Snapshots, Versionshistorien, die niemand S3 zum Aufräumen aufgetragen hatte, unvollständige Multipart-Uploads, die sich monatelang still angesammelt hatten. Tom hatte alles behoben, automatische Bereinigungsregeln implementiert und war zum nächsten Tab in der Tabelle gewechselt. Die Datenebene war die größte verbleibende Unbekannte: relationale Datenbanken, NoSQL-Tabellen, Cache-Knoten, Backup-Speicher und ein Posten, der ihn seit Wochen nicht losließ.

Die zu prüfenden Posten der Datenebene:

Aurora-Cluster: 647 $/Monat.
Legacy-RDS-PostgreSQL-Read-Replicas: 340 $/Monat.
DynamoDB-Tabellen: 340 $/Monat.
ElastiCache: 185 $/Monat.
Aurora-manuelle-Snapshots: 87 $/Monat.

Gesamte zu prüfende Datenebene: 1.599 $/Monat.

„Lass mich jede einzelne verstehen, bevor ich etwas entscheide“, sagte er. „Denn die Datenbank ist nicht der Ort, an dem man Geld spart, indem man Kompromisse eingeht.“

Das war klug. Eine Datenbank-Fehlkonfiguration, die Datenverlust oder Leistungseinbußen verursacht, kostet weit mehr als die Einsparungen.

Stellen Sie sich eine Datenbank wie den Motor eines Autos vor. Sie können bei einem Auto Geld sparen, indem Sie auf günstigeren Kraftstoff umsteigen, den Reifendruck anpassen und unnötiges Gewicht aus dem Kofferraum entfernen. Aber wenn Sie versuchen, Geld zu sparen, indem Sie einen Ölwechsel auslassen, riskieren Sie einen Motorschaden – und ein kaputter Motor kostet weit mehr als jede Kraftstoffersparnis. Das Audit, das Tom gleich durchführen wird, folgt derselben Logik: Finden Sie die Verschwendung im Kofferraum und im Tank, und lassen Sie den Motor in Ruhe, bis Sie genau wissen, was Sie tun.

**Verstehen Sie zuerst Ihre Datenbank-Arbeitslast**

Kostenoptimierung bei Datenbanken erfordert, die Arbeitslast zu verstehen, bevor man etwas anfasst. Tom hatte das aus einem Beinahe-Fehler sechs Monate zuvor gelernt: Er hatte begonnen, die Datenbank-Instanzgröße auf Basis der durchschnittlichen CPU-Auslastung zu reduzieren – 18 % –, ohne zuerst die p95-Werte zu betrachten. Ein Kollege hatte ihn gebeten, die CloudWatch-Metriken genauer zu prüfen. Die p95-CPU lag bei 61 %, und während eines besonders heftigen Freitagabend-Andrangs hatte sie 84 % erreicht.

„Der Durchschnitt sagt einem nicht, was zu Spitzenzeiten passiert“, sagte Tom, als er Priya davon erzählte. „Wenn ich auf den Durchschnitt right-sized hätte, wären wir an Freitagabenden gedrosselt worden.“

„Deshalb schaut man auf p95, nicht auf den Durchschnitt“, sagte Priya. „Immer.“

Dieses Prinzip ging über die CPU hinaus. Tom hatte jetzt eine standardisierte Pre-Audit-Checkliste:

- CPU: p95, nicht Durchschnitt
- Speicher: FreeableMemory (in absoluten Bytes, nicht in Prozent) – wie nah sind wir am Limit?
- Verbindungen: DatabaseConnections-Maximum über die letzten 30 Tage – wie nah sind wir an das Verbindungslimit gekommen?
- Lese-/Schreibverhältnis: Bestimmt, ob Read Replicas ihre Kosten verdienen
- Speicherwachstumsrate: Wie viele GB pro Monat kommen hinzu?
- Replikationsverzögerung (bei Replicas): Kommt das Replica mit?

Schlüsselfragen:

- Wie hoch ist die durchschnittliche und die Spitzen-CPU-Auslastung?
- Wie ist das Lese-/Schreibverhältnis?
- Wächst, stabilisiert sich oder sinkt der Speicher?
- Werden Read Replicas genutzt?
- Ist die Instanz unterdimensioniert (verursacht Verlangsamungen) oder überdimensioniert (zahlt für ungenutzte Kapazität)?

Tom rief die CloudWatch-Metriken für alle drei Datenbankdienste über die letzten 30 Tage auf:

**Aurora-Cluster**:

- Durchschnittliche CPU: 18 % (p95: 61 %; Spitze: 84 % an Freitagabenden)
- FreeableMemory: konstant über 4 GB von 8 GB verfügbar. Kein Problem.
- Lese-/Schreibverhältnis: 14:1 (leselastig)
- Speicher: 180 GB (wächst ~5 GB/Monat)
- DatabaseConnections-Maximum: 312 von 1.000 verfügbar. Komfortabel.

**Read Replicas (RDS PostgreSQL, getrennt von Aurora)**:

- Dies waren zwei Legacy-RDS-Read-Replicas, die vor der Aurora-Migration erstellt wurden und noch liefen.
- Durchschnittliche Verbindungen zu jedem: 2 pro Tag. Durchschnittliche CPU: 3 %.
- FreeableMemory: 7,2 GB von 8 GB verfügbar. Die Instanzen waren nahezu ungenutzt.

„Warum laufen die noch?“, fragte Tom.

„Ich hatte sie schon deployt – oh“, sagte Leo. Er sah sich die Erstellungsdaten der Instanzen an. „Sie waren für den Fallback während der Aurora-Migration. Ich habe sie nie gelöscht.“

Dieser Moment – wenn etwas Teures seit Monaten läuft, ohne genutzt zu werden – ist in Cloud-Umgebungen ein vertrauter. Leo hatte die Replicas als Sicherheitsnetz erstellt. Das Sicherheitsnetz war nie gebraucht worden. Aber niemand hatte die Frage gestellt, bis jetzt.

„Wie ist die Situation beim Connection Pool?“, fragte Priya und beugte sich vor. „Bevor wir sie löschen, leiten irgendwelche Anwendungskomponenten noch Leseanfragen dorthin?“

Tom prüfte die Verbindungsprotokolle. Die zwei Verbindungen pro Tag kamen von einem Überwachungsskript, das Priya vor vierzehn Monaten geschrieben hatte – es fragte alle bekannten Datenbank-Endpunkte ab, um zu überprüfen, ob sie antworteten. Die Replicas wurden nur vom Health Checker abgefragt, nicht von tatsächlichem Anwendungs-Traffic.

„Lösch sie“, sagte Maya.

Die Replicas wurden beendet. Monatliche Einsparung: 340 $.

**Beinahe-Fehler beim Connection Pool**

Während er die Verbindungsmetriken offen hatte, führte Tom eine umfassendere Prüfung über alle Datenbank-Endpunkte durch. Was er fand, ließ ihn innehalten.

Der Aurora-Writer-Endpunkt zeigte ein DatabaseConnections-Maximum von 312. Komfortabel. Aber der Reader-Endpunkt erzählte eine andere Geschichte.

„Der Reader-Endpunkt erreichte an drei aufeinanderfolgenden Freitagabenden 847 Verbindungen“, sagte Tom.

„Wie hoch ist das Limit?“, fragte Priya.

„Das Limit für unsere aktuelle Instanzklasse ist 1.000. Wir kamen auf 847. Das sind 85 % des Limits.“

„Und wir haben es nicht bemerkt, weil wir erst bei 90 % alarmiert wurden?“, fragte Maya.

„Wir wurden überhaupt nicht alarmiert“, sagte Tom. „Es gibt keinen CloudWatch-Alarm auf den Verbindungen des Reader-Endpunkts. Ich habe das nur gefunden, weil ich mir die Rohmetriken angesehen habe.“

Bei 1.000 Verbindungen verweigert die Datenbank neue Verbindungen. Jeder Anwendungs-Thread, der in diesem Moment versucht, eine Datenbankverbindung zu erhalten, wirft eine Exception. Wenn diese Exception nicht elegant behandelt wird, sieht der Benutzer einen 500-Fehler.

„Wir waren dreißig Sekunden von einem Freitagabend-Vorfall entfernt“, sagte Leo. „Drei Mal hintereinander.“

„Haben wir bedacht, was passiert, wenn dieser Schwellenwert überschritten wird?“, fragte Priya.

„Restaurantpartner sehen fehlgeschlagene Bestellungen während des Abend-Andrangs“, sagte Maya. „Das ist keine theoretische Sorge.“

Tom richtete sofort einen CloudWatch-Alarm ein: Benachrichtigung bei 750 Verbindungen (75 % des Limits), Page bei 900 (90 %). Er implementierte außerdem RDS Proxy für den Reader-Endpunkt – RDS Proxy bündelt und verwaltet Datenbankverbindungen von der Anwendungsschicht aus, was bedeutet, dass fünfzig Anwendungs-Threads sich zehn Datenbankverbindungen teilen können. Der Proxy übernimmt das Multiplexing. Die Datenbank sieht weit weniger Verbindungen, selbst wenn die Anwendung stark belastet ist.

„Für Aurora Serverless v2 wird RDS Proxy mit 0,015 $ pro ACU pro Stunde berechnet, mit einer Mindestgebühr von 8 ACUs pro Proxy“, sagte Tom. „Aber wenn eine Überschreitung des Verbindungslimits auch nur einen teilweisen Ausfall an einem Freitagabend verursacht, sind die Reputationskosten für Nimbus um Größenordnungen höher.“

„Wie viel kostet das pro Monat?“, fragte Tom sich selbst und rechnete die Zahl aus. Ihr Reader läuft auf Serverless v2, also rechnet der Proxy gegen das 8-ACU-Minimum ab: 0,015 $ × 8 × 730 = 87,60 $/Monat. Das war eine Kosten, die er gerne zahlte.

Sie fragen sich vielleicht: Wenn wir mit dem Auto-Scaling von Serverless v2 bereits Geld sparen, warum sich überhaupt mit Reserved Instances für die provisionierte Ebene befassen? Die Antwort ist, dass das Scaling von Serverless v2 Kosten hat – man zahlt pro ACU-Stunde, ob man es geplant hat oder nicht. Für Teams, die feste Aurora-Konfigurationen betreiben, wandelt die RI-Verpflichtung variable Kosten in vorhersehbare Kosten um. Für die Teams, die provisionierte Instanzen betreiben (nicht Serverless v2), ist diese Unterscheidung erheblich wichtig.

**RDS Reserved Instances: Für provisionierte Datenbankebenen**

Wie EC2 bietet RDS Reserved Instances für verpflichtete Nutzung.

Für Teams, die feste Aurora-Instanzkonfigurationen verwenden (nicht Serverless v2), können Reserved Instances 30–60 % sparen. So funktioniert der provisionierte RI-Ansatz: Sie verpflichten sich auf einen bestimmten Instanztyp für 1 oder 3 Jahre im Austausch für einen erheblichen Rabatt auf den Stundensatz.

Zur Veranschaulichung: Eine db.r6g.large-Writer-Instanz zu 0,26 $/Stunde On-Demand kostet 190 $/Monat. Eine 1-Jahres-Reserved-Instance dafür reduziert das auf etwa 108 $/Monat – eine Einsparung von 82 $/Monat pro Instanz oder fast 1.000 $ pro Jahr pro Datenbankinstanz.

**Aurora Serverless v2 vs. Standard-RI – Der Break-Even**

Tom rechnete die Zahlen für ihre spezifische Aurora-Konfiguration durch. Die Frage: Bot das Auto-Scaling von Aurora Serverless v2 genug Nutzen, oder wäre eine feste provisionierte Instanz mit einer Reserved-Instance-Verpflichtung günstiger?

Serverless-v2-Preisgestaltung: 0,12 $ pro ACU-Stunde. Ihr Cluster skalierte zwischen 0,5 ACU (Leerlauf) und 16 ACU (Spitzenlast). Über die letzten 30 Tage betrug der Durchschnitt 4,2 ACU.

Monatliche Serverless-v2-Kosten: 4,2 ACU × 0,12 $ × 730 Stunden = 368 $/Monat für den Writer.

Vergleich: eine feste db.r6g.2xlarge (ihr geschätztes provisioniertes Äquivalent, dimensioniert für die Bewältigung der p95-Last) mit einer 1-Jahres-RI: 0,48 $/Stunde × 0,60 (RI-Rabatt) × 730 = 210 $/Monat.

„Die RI ist günstiger“, sagte Leo.

„Für eine feste Last, ja“, sagte Tom. „Aber schau dir die Spanne an. Unsere verkehrsarme Zeit – 2 bis 7 Uhr, Montag bis Donnerstag – liegt im Schnitt bei 0,8 ACU. Auf einer festen provisionierten Instanz würden wir während dieser Stunden das 8-Fache dessen zahlen, was wir nutzen, einfach im Leerlauf.“

„Und Serverless v2 skaliert entsprechend herunter?“

„Auf 0,5 ACU. Die Leerlaufkosten sind ein Bruchteil dessen, was wir für eine provisionierte Instanz zahlen würden, die für die Spitze dimensioniert ist.“

Die Break-Even-Berechnung: Serverless v2 ist günstiger, wenn Ihr Spitzen-/Basislast-Verhältnis über etwa 4:1 liegt. Für Nimbus, mit Freitagsspitzen bei 16 ACU und Montagmorgen-Minima bei 0,8 ACU – ein Verhältnis von 20:1 –, war Serverless v2 die richtige Wahl. Wäre ihr Traffic gleichmäßiger gewesen (sagen wir 8 ACU ± 20 %), wäre eine provisionierte RI günstiger gewesen.

„Es geht nicht nur darum, welche Zahl diesen Monat kleiner ist“, sagte Tom. „Es geht darum, welches Modell unser Wachstum richtig handhabt. Wenn wir im nächsten Quartal um 50 % wachsen, skaliert Serverless v2 einfach hoch. Eine provisionierte RI bräuchte eine Neudimensionierung, und wir würden während der Umstellung für ungenutzte Reserve zahlen.“

Tom zeichnete den einjährigen Vergleich explizit auf, damit das Team der Argumentation folgen konnte, nicht nur der Schlussfolgerung.

**Monat-für-Monat-Aurora-Kosten: Serverless v2 vs. provisionierte RI**

Die provisionierte Option: eine db.r6g.2xlarge mit einer 1-Jahres-Reserved-Instance. Kosten: 0,48 $/Stunde On-Demand × 0,60 (RI-Rabatt) × 730 Stunden = 210 $/Monat. Fix, unabhängig von der Last.

Die Serverless-v2-Option: pro ACU-Stunde zu 0,12 $ zahlen. Variabel, der tatsächlichen Last folgend.

Tom zog 30 Tage Aurora-Serverless-v2-ACU-Metriken aus CloudWatch und baute eine Verteilung:

- 2–7 Uhr, Montag–Donnerstag (geringer Traffic): durchschnittlich 0,8 ACU → 0,096 $/Stunde
- 7–11 Uhr, werktags (moderat): durchschnittlich 3,2 ACU → 0,384 $/Stunde  
- 11–21 Uhr, werktags (Spitzen-Geschäftszeiten): durchschnittlich 5,8 ACU → 0,696 $/Stunde
- Freitag 18–22 Uhr (Abend-Andrang): durchschnittlich 14,1 ACU → 1,692 $/Stunde
- Samstag 12–20 Uhr (Wochenend-Andrang): durchschnittlich 9,3 ACU → 1,116 $/Stunde
- Sonntag (ruhigster Tag): durchschnittlich 2,1 ACU → 0,252 $/Stunde

Gewichteter Durchschnitt über den gesamten Monat: 4,2 ACU → 0,504 $/Stunde → 368 $/Monat.

Auf einer provisionierten RI: 210 $/Monat. Serverless: 368 $/Monat. Die provisionierte Option sparte 158 $/Monat.

„Das scheint offensichtlich“, sagte Leo. „Warum sind wir auf Serverless?“

„Weil 368 $ der Durchschnitt ist“, sagte Tom. „Schau dir die Freitagabende an.“

Freitag 18–22 Uhr: durchschnittlich 14,1 ACU. Für dieses vierstündige Fenster kostet Serverless 1,692 $/Stunde. Eine provisionierte db.r6g.2xlarge zu 210 $/Monat – ihre maximale Kapazität – hatte 8 vCPUs. Der Serverless-Cluster lief während dieses Fensters mit dem Äquivalent von rund 16 vCPUs.

„Eine provisionierte Instanz, dimensioniert für unsere Freitagsspitze, wäre eine db.r6g.4xlarge“, sagte Tom. „Zum RI-Satz sind das 0,96 $/Stunde × 0,60 = 0,576 $/Stunde. Monatlich: 420 $/Monat.“

„Das ist mehr als der Serverless-Durchschnitt von 368 $“, sagte Maya.

„Richtig. Und wenn wir die provisionierte Instanz für die werktägliche Basislast dimensionieren würden – die db.r6g.2xlarge –, wären Freitagabende ein Problem. Bei Spitzenlast würden wir 14 ACU-Äquivalent auf eine 8-vCPU-Instanz drücken. Das ist CPU-Sättigung.“

„Du müsstest also für die Spitze vordimensionieren“, sagte Priya.

„Um den Preis, die anderen 160 Stunden der Woche für ungenutzte Kapazität zu zahlen“, sagte Tom. „Die provisionierte RI-Rechnung, die günstiger ausfällt, funktioniert nur, wenn das Spitzen-/Basislast-Verhältnis niedrig ist. Unseres ist 20:1. Das ist genau das Szenario, für das Serverless v2 entworfen wurde.“

Er zeigte die Zahlen nebeneinander:

| Option | Durchschnittsmonat | Ruhige Nacht (2 Uhr) | Freitags-Andrang (20 Uhr) |
|---|---|---|---|
| Serverless v2 | 368 $ | 0,096 $/Std. | 1,692 $/Std. |
| Provisionierte RI (r6g.2xl) | 210 $ | 210 $/730 Std. = 0,288 $/Std. | gedeckelt – Sättigungsrisiko |
| Provisionierte RI (r6g.4xl) | 420 $ | 0,576 $/Std. | komfortable Reserve |

„Die Serverless-Option ist 368 $“, sagte Tom. „Die richtig dimensionierte provisionierte Option ist 420 $ – und das ist, bevor man die operativen Kosten der Überwachung und der manuellen Skalierung der provisionierten Instanz berücksichtigt, wenn sich unsere Verkehrsmuster im nächsten Quartal ändern.“

„Und die operativen Kosten“, sagte Priya, „sind nicht nichts.“

„Nein. Mit Serverless müssen wir nicht über Instanzdimensionierung nachdenken. Aurora übernimmt das. Mit provisioniert müsste ich jedes Quartal neu bewerten, ob die aktuelle Instanzklasse noch zu unserem Traffic passt. Das ist zeitlich nicht teuer, aber es ist etwas, das schiefgehen kann, wenn wir aufhören aufzupassen.“

„Es wird schon klappen, solange wir nicht vergessen, sie neu zu dimensionieren“, sagte Leo, und dann ertappte er sich. „Was genau der Moment ist, in dem es nicht klappen wird.“

„Genau“, sagte Tom.

Die Schlussfolgerung hielt: Serverless v2 zu 368 $/Monat war die richtige Wahl für das 20:1-Spitzen-/Basislast-Verhältnis von Nimbus und die Vorliebe seines Teams für operative Einfachheit. Die provisionierte RI war nur für Teams mit Traffic überzeugend, der nicht erheblich schwankte – ein 2:1- oder 3:1-Verhältnis, bei dem die provisionierte Instanz selten im Leerlauf war.

„Was würde uns zu provisioniert wechseln lassen?“, fragte Maya.

„Wenn sich unser Verkehrsmuster abflachen würde“, sagte Tom. „Wenn Nimbus so weit wachsen würde, dass die verkehrsarme Basislast ebenfalls hoch wäre – sagen wir 8 ACU um 2 Uhr statt 0,8 –, würde das Verhältnis auf 2:1 sinken und provisioniert würde wirtschaftlich Sinn ergeben. Das ist ein anderes Geschäftsproblem. Eins, das wir gerne hätten.“


Für Aurora mit Serverless v2 gelten Reserved Instances nicht direkt – Serverless v2 skaliert dynamisch und man zahlt pro ACU-Stunde. Das ist die aktuelle Konfiguration von Nimbus: Der primäre Aurora-Writer und -Reader verwenden beide Serverless v2. Die Einsparungen für Nimbus kommen aus der Auto-Scaling-Natur von Serverless v2 selbst – man zahlt nicht für ungenutzte Kapazität, wenn der Traffic gering ist.

Teams, die noch feste Aurora-Instanzen betreiben, sollten die RI-Verpflichtung bewerten, sobald der Instanztyp drei oder mehr Monate stabil war.

**DynamoDB: On-Demand vs. Provisioned**

In Kapitel 9 haben wir die beiden Kapazitätsmodi von DynamoDB vorgestellt: On-Demand und Provisioned.

Nimbus hatte DynamoDB von Anfang an im On-Demand-Modus betrieben. Bei geringem Traffic war das korrekt – On-Demand ist pro Anfrage teurer, hat aber keine Mindestgebühr.

Jetzt, mit 18 Monaten Verkehrsdaten in CloudWatch, konnte Tom Muster erkennen.

Durchschnittliche Leseanfragen: 225 pro Sekunde (etwa 19,4 Millionen pro Tag)
Durchschnittliche Schreibanfragen: 60 pro Sekunde (etwa 5,2 Millionen pro Tag)
Spitzentag (Freitag): 180 % der durchschnittlichen DynamoDB-Anfragen (ElastiCache absorbiert ~95 % der Lesevorgänge, sodass DynamoDB nur einen Bruchteil der gesamten 25-fachen Bestellvolumenspitze sieht)

**On-Demand-Preisgestaltung**: 1,25 $ pro Million Schreibanfragen, 0,25 $ pro Million Leseanfragen.
**Provisioned-Preisgestaltung**: 0,00065 $ pro Schreibkapazitätseinheit pro Stunde, 0,00013 $ pro Lesekapazitätseinheit pro Stunde.

Tom berechnete den Break-Even-Punkt: Provisionierte Kapazität wird günstiger, wenn man sie konsistent genug nutzt, dass man während Leerlaufphasen nicht den On-Demand-Aufschlag zahlt.

(Eine Anmerkung zu den Zahlen in diesem Abschnitt: Sie spiegeln die Rechnung des Teams zu diesem Zeitpunkt wider und sind illustrativ. Ende 2024 senkte AWS die DynamoDB-On-Demand-Preise um 50 %, was den Break-Even erheblich verschob – heute gewinnt provisionierte Kapazität nur, wenn die Auslastung konstant hoch ist. Rechnen Sie diese Rechnung immer mit aktuellen Preisen neu.)

Mit 18 Monaten Daten, die konsistente tägliche Muster zeigten, war provisionierte Kapazität mit **DynamoDB Auto Scaling** die richtige Wahl:

- Minimale Kapazität auf 60 % der durchschnittlichen Last einstellen
- Maximum auf 250 % des Durchschnitts (bewältigt Freitagsspitzen)
- Auto Scaling passt die provisionierte Kapazität zwischen diesen Grenzen an

Monatliche DynamoDB-Kosten: sanken von 340 $ (On-Demand) auf 230 $ (provisioniert mit Auto Scaling). 32 % Reduzierung.

„Moment – aber *warum* würden wir es so machen?“, fragte Maya. „Wir sind von Anfang an auf On-Demand, weil wir unseren eigenen Verkehrsmustern nicht getraut haben. Was hat sich geändert?“

„Achtzehn Monate Daten“, sagte Tom. „Wir wissen jetzt, wie unsere Muster aussehen – konsistente werktägliche Basislast, Freitagsspitzen, ruhige Sonntagsphasen. On-Demand war die richtige Entscheidung, als wir es nicht wussten. Provisioniert mit Auto Scaling ist die richtige Entscheidung, jetzt da wir es wissen.“

„Aber wenn wir überdimensionieren“, fragte Leo, „zahlen wir für ungenutzte Kapazität.“

„Das ist das Risiko“, sagte Tom. „Mit Auto Scaling setzen wir das Minimum hoch genug, um Drosselung zu vermeiden, und lassen AWS innerhalb unseres Bereichs verwalten.“

„Und wenn sich unser Verkehrsmuster erheblich ändert?“

„Dann passen wir die Grenzen an. Wir überprüfen das vierteljährlich.“

**ElastiCache: Right-Sizing und die warnende Geschichte**

Die ElastiCache-Rechnung: 185 $/Monat. Eine cache.r6g.large-Redis-Instanz in jeder AZ (zwei Knoten, Primär + Replica).

Die CloudWatch-Metriken zeigten:

- Durchschnittliche Speicherauslastung: 34 %
- Spitze: 58 %

Die Instanz war überdimensioniert. Eine cache.r6g.medium würde die Last wahrscheinlich mit Reserve bewältigen.

Aber hier hielt Tom inne. Er erinnerte sich, was bei einem früheren Unternehmen passiert war, als er einen Cache aggressiv right-sized hatte – und er erzählte dem Team die ganze Geschichte, weil es die Art von Geschichte war, die erzählt werden musste, bevor man sich mittendrin wiederfand.

Bei seinem früheren Unternehmen – einer SaaS-Plattform für Finanzberichterstattung – war der ElastiCache-Cluster eine cache.r6g.large gewesen. Zwei Knoten, Primär und Replica. Durchschnittliche Speicherauslastung: 31 %. Beobachtete Spitze: 54 %. Der diensthabende Ingenieur, der es markierte, hatte die Rechnung gemacht: Eine cache.r6g.medium würde die Last mit 25 % Reserve über der beobachteten Spitze bewältigen. Einsparung: 60 $/Monat – Preise in der Region und Knotengeneration dieses Unternehmens zu jener Zeit, kleiner als die entsprechende Lücke bei Nimbus heute. Die Änderung wurde an einem Dienstag genehmigt.

Im folgenden Monat, an einem Donnerstagabend um 23:47 Uhr, startete der Monatsabschluss-Abrechnungs-Batch.

Der Abrechnungs-Batch lief vierteljährlich. Er zog die Transaktionsdaten jedes aktiven Kontos für die vorangegangenen drei Monate, aggregierte sie, berechnete Steuern und schrieb Abrechnungsdatensätze. Der Cache wurde verwendet, um den Zwischenzustand der Aggregation zu speichern – die laufende Summe jedes Kontos, während der Batch fortschritt. Die cache.r6g.large hatte es immer bewältigt. Niemand hatte bei der Right-Sizing-Entscheidung speziell auf die Metriken des Abrechnungs-Batch geschaut, weil der Batch vierteljährlich war und das Beobachtungsfenster vier Wochen betragen hatte.

Auf der Medium-Instanz war maxMemoryPolicy auf `allkeys-lru` gesetzt – wenn der Speicher voll war, würde Redis den am längsten nicht verwendeten Schlüssel entfernen, um Platz zu schaffen. Das ist die richtige Richtlinie für einen allgemeinen Cache. Aber für den Abrechnungs-Batch wurde jeder Schlüssel im Cache aktiv benötigt. Als der Speicher bei 84 % der 6,38 GB der Medium-Instanz voll war, begann Redis, Schlüssel zu entfernen. Jede Entfernung war ein Cache-Miss. Jeder Cache-Miss sendete eine Abfrage an die zugrunde liegende PostgreSQL-Datenbank, um den entfernten Wert aus den rohen Transaktionsdatensätzen neu zu berechnen.

Der Datenbank-Connection-Pool war für Steady-State-Traffic konfiguriert, nicht für die Last des Abrechnungs-Batch. Innerhalb von vier Minuten nach Beginn der Entfernungen hatte die Datenbank 847 aktive Verbindungen. Das Verbindungslimit war 1.000. Nach 9 Minuten begannen die ersten Anwendungs-Threads, „too many connections“-Fehler zu sehen. Nach 12 Minuten waren drei Dienste, die sich den Datenbank-Connection-Pool teilten – der Abrechnungs-Batch, der Echtzeit-Berichtsdienst und die kundenseitige API –, alle betroffen.

Der diensthabende Ingenieur eskalierte um 23:59 Uhr. Die Vorfallsprüfung begann um 0:08 Uhr.

Erste Reaktion: das Lambda-Timeout für die Abrechnungs-Batch-Funktion erhöhen (der Abrechnungs-Batch war teilweise Lambda-basiert). Das war falsch. Das Timeout war nicht das Problem.

Zweite Reaktion: eine zweite Lambda-Funktion hinzufügen, um den Abrechnungs-Batch zu parallelisieren. Ebenfalls falsch. Mehr Parallelität bedeutete mehr gleichzeitigen Cache-Zugriff, was schnellere Entfernungen bedeutete, was die Situation verschlimmerte.

Dritte Reaktion: den Abrechnungs-Batch herunterskalieren, um den Datenbankdruck zu reduzieren. Das half etwas, behob aber nicht die Grundursache.

Vierte Reaktion, um 2:31 Uhr: die cache.r6g.large wiederherstellen. Der Speicherdruck sank sofort. Die Entfernungen hörten auf. Der Datenbank-Connection-Pool leerte sich. Der Abrechnungs-Batch wurde um 4:17 Uhr abgeschlossen, über vier Stunden verspätet.

Vorfall insgesamt: vier Stunden beeinträchtigte API-Leistung für Kunden, die versuchten, auf Berichte zuzugreifen. Ein vollständiger Abrechnungs-Batch verzögert. Engineering-Zeit: ungefähr 22 Stunden über fünf Ingenieure. Geschätzte direkte Kosten: 40.000 $.

Die Einsparung von 60 $/Monat hatte in einem einzigen Vorfall 40.000 $ gekostet.

„Der Fehler war nicht die Right-Sizing-Entscheidung“, sagte Tom. „Die Entscheidung war auf Basis der verfügbaren Daten vertretbar. Der Fehler war das Beobachtungsfenster. Wir haben vier Wochen Metriken gemessen. Der Abrechnungs-Batch war vierteljährlich. Wir haben den falschen Zeitrahmen betrachtet.“

„Wie vermeidet man das also?“, fragte Maya.

„Man fragt: Was ist die folgenreichste Operation, die dieser Cache unterstützt? Und man findet die spezifischen Metriken dieser Operation. Nicht die durchschnittliche Woche. Die spezifische Woche – oder den Monat – oder das Quartal –, in der die Last am höchsten ist. Und man dimensioniert dafür.“

„Und wenn man die Metriken nicht findet, weil die Operation selten ist?“

„Das ist die Antwort“, sagte Tom. „Wenn man die Metriken für ein bestimmtes Hochlast-Szenario nicht findet, ist die richtige Reaktion, noch nicht right-zu-sizen. Auf das nächste Auftreten warten, es stark instrumentieren, dann auf Basis des Beobachteten dimensionieren.“

Der ElastiCache-Cluster von Nimbus hatte seine eigene folgenreiche Operation: den Freitagabend-Andrang. Diese Daten hatte Tom – drei aufeinanderfolgende Freitagabende hatten 58 % Speicherauslastung auf der r6g.large erreicht. Wenn er auf die r6g.medium wechselte und sich etwas in der Bestellverarbeitungs-Pipeline änderte, sodass mehr Cache-Platz genutzt würde – ein neues Feature, eine andere Caching-Strategie –, könnten diese 58 % zu 80 % werden, und 80 % auf einer Medium sind Entfernungsterritorium.

Er rechnete die Zahlen trotzdem durch. Wechsel von r6g.large zu r6g.medium: zwei Knoten zu 0,127 $/Stunde gegenüber zwei Knoten zu 0,065 $/Stunde, 730 Stunden pro Monat in Betrieb. Large: 185 $/Monat. Medium: 95 $/Monat. Mögliche Einsparung: 90 $/Monat. Er testete die Medium-Instanz zwei Wochen lang unter Last im Staging. Der Speicher erreichte einen Spitzenwert von 71 % – nah genug am Limit, dass es ihm unwohl war.

Dann bepreiste er die Alternative: die cache.r6g.large behalten, aber Reserved Nodes kaufen (1-Jahres-Verpflichtung). Von On-Demand 185 $ auf Reserved 120 $/Monat. Einsparung: 65 $/Monat ohne Änderung des Instanztyps.

„Die 65 $/Monat, die ich mit Reserved Nodes bei gleicher Instanzgröße sparen würde, sind eine echte Einsparung“, sagte Tom. „Die 90 $/Monat, die ich durch den Wechsel zur Medium sparen würde, sind eine Milchmädchenrechnung, wenn sie den Freitagabend-Andrang gefährden. Manchmal birgt Right-Sizing auf eine kleinere Instanz das Risiko eines Leistungsvorfalls – Reserved Nodes geben uns den größten Teil der Einsparungen ohne das Risiko.“

Er kaufte die Reserved Nodes für die r6g.large.

„Die 25 $ Unterschied bei der monatlichen Einsparung“, sagte Tom, „sind keinen Freitagabend-Vorfall wert.“

**RDS-Backup-Aufbewahrung: Der Speicher-Kompromiss**

Automatisierte RDS-Backups werden in S3 gespeichert (ohne zusätzliche Speicherkosten bis zu 100 % Ihrer Datenbankgröße). Die Standardaufbewahrung beträgt 7 Tage.

Für die 180 GB große Aurora-Datenbank von Nimbus waren 7 Tage Backups angemessen – sie hatten in Tests innerhalb dieses Fensters aus einem Backup wiederherstellen können.

Aber Tom bemerkte: Sie hatten auch manuelle Snapshots von jeder bedeutenden Bereitstellung, unbegrenzt aufbewahrt.

23 manuelle Snapshots, insgesamt 4,1 TB Snapshot-Speicher.
Kosten: 0,021 $/GB/Monat für Aurora-Backup-Speicher = etwa 87 $/Monat an manuellem Snapshot-Speicher.

Sie behielten die letzten 3 manuellen Snapshots pro Umgebung (Produktion, Staging). Den Rest löschten sie – etwa 1,1 TB beibehalten.
Einsparung: 64 $/Monat.

„Wir haben 64 $ im Monat für eine Versicherung gezahlt, die wir nie genutzt haben“, sagte Leo.

„Wir haben für Seelenfrieden gezahlt“, korrigierte Tom. „Die Frage ist: Wie viel Seelenfrieden sind 64 $ im Monat wert?“

„Mit einem ordentlichen Disaster-Recovery-Plan“, sagte Priya, „bekommt man denselben Seelenfrieden von 7 Tagen automatisierter Backups und 3 manuellen Snapshots.“

„Einverstanden. Jetzt.“

**Variante: Wenn Provisioned nach hinten losgeht**

Wenn Ihr Verkehrsmuster konsistent und vorhersehbar ist, spart provisionierte Kapazität mit Auto Scaling 30 % gegenüber On-Demand. Aber wenn ein neues Feature startet und Ihr Schreibvolumen über Nacht auf das 5-Fache hochschnellt, werden Sie gedrosselt, bevor Auto Scaling aufholt – Auto Scaling reagiert auf beobachteten Traffic, was bedeutet, dass es eine Verzögerung gibt. Den On-Demand-Modus für die Wochen rund um einen großen Feature-Start beizubehalten ist ein vernünftiger Kompromiss: leicht höhere Kosten, kein Drosselungsrisiko während einer Phase, in der Sie die sich ändernden Verkehrsmuster in Echtzeit beobachten.

Wenn Sie ungenutzte Read Replicas eliminieren (wie die Legacy-PostgreSQL-Replicas von Nimbus), sind die Einsparungen sofort und eindeutig – es gibt keinen Kompromiss, weil die Replicas keinen Wert lieferten. Aber wenn Sie versucht sind, ein Read Replica zu eliminieren, das nur 2 % des Traffics bewältigt, prüfen Sie, was mit der Primärdatenbank passiert, wenn diese 2 % während einer Spitze nirgendwo hingehen können. Manche Read Replicas existieren für Reserve, nicht für die aktuelle Last.

**Die Zusammenfassung der Datenbankoptimierung**

| Dienst                                           | Vorher     | Nachher    | Monatsersparnis |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (Serverless v2 nach Analyse beibehalten)    | 647 $       | 647 $     | 0 $ (korrektes Modell) |
| RDS Read Replicas (ungenutzt)                        | 340 $       | 0 $       | 340 $           |
| DynamoDB (On-Demand → Provisioned + Auto Scaling) | 340 $       | 230 $     | 110 $           |
| ElastiCache (Reserved Nodes)                      | 185 $       | 120 $     | 65 $            |
| Aurora manuelle Snapshots                           | 87 $        | 23 $      | 64 $            |
| RDS Proxy (Verbindungssicherheit)                     | 0 $         | 88 $      | -88 $           |
| **Gesamt**                                         | **1.599 $** | **1.108 $** | **491 $/Monat** |

491 $ pro Monat an Datenbankeinsparungen. 5.892 $ pro Jahr.

Tom stellte diese Zahl neben die Speicherbereinigung (6.200 $/Jahr), die S3-Lebenszyklusrichtlinien aus Kapitel 23 (7.800 $/Jahr) und die Savings-Plan-Einsparungen (14.200 $/Jahr).

Gesamte bisherige Optimierungswirkung: 34.092 $/Jahr.

„Das ist echte Runway“, sagte Maya.

„Oder mehrere ernsthafte Experimente“, sagte Priya.

„Oder zwölf Monate Experimente“, sagte Leo.

Alle drei hatten recht.

## Stärken und Grenzen

**DynamoDB Provisioned mit Auto Scaling**:

- Günstiger als On-Demand für vorhersehbare, konsistente Arbeitslasten
- Auto Scaling handhabt Variabilität, ohne dauerhaft zu überdimensionieren
- Erfordert Überwachung, um sicherzustellen, dass die Kapazitätsgrenzen angemessen bleiben

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Erhebliche Einsparungen für stabile, langlaufende Arbeitslasten
- Gebundene Verpflichtung – wenn sich Ihre Bedürfnisse ändern, haben Sie für ungenutzte Kapazität gezahlt
- Anders als EC2 Standard RIs können RDS RIs **nicht** auf dem Reserved Instance Marketplace weiterverkauft werden – der Marketplace ist nur für EC2. Eine ungenutzte RDS RI ist versunkene Kosten, was die Dimensionierungsentscheidung wichtiger macht

**Das allgemeine Prinzip**:

- Verstehen Sie die Auslastung immer, bevor Sie optimieren – verwenden Sie p95, nicht den Durchschnitt
- Ungenutzte Ressourcen (wie die Legacy-Read-Replicas) sind die ertragreichste Optimierung
- Right-Sizing erfordert eine Validierung im Staging, bevor es auf die Produktion angewendet wird, und die Prüfung auf saisonale Arbeitslastmuster, die in einem Standard-Beobachtungsfenster möglicherweise nicht erscheinen
- Reservierte Preisgestaltung erfordert Vertrauen in die Stabilität der Arbeitslast

## Zusammenfassung

- **Zuerst auditieren**: Ziehen Sie CloudWatch-Metriken, bevor Sie irgendwelche Datenbankänderungen vornehmen. Verwenden Sie p95-Latenz und p95-CPU – nicht Durchschnitte. Prüfen Sie FreeableMemory und Verbindungsmaxima.
- **Ungenutzte Ressourcen löschen**: Read Replicas, ungenutzte Datenbanken und Testinstanzen, die nicht mehr benötigt werden.
- **Behalten Sie Ihren Connection Pool im Auge**: Setzen Sie Alarme auf DatabaseConnections bei 75 % und 90 % des Limits. Erwägen Sie RDS Proxy für Verbindungs-Multiplexing.
- **DynamoDB On-Demand vs. Provisioned**: On-Demand für unvorhersehbaren Traffic; Provisioned + Auto Scaling für konsistente Muster.
- **ElastiCache-Right-Sizing**: Im Staging unter realistischen Spitzenlasten testen, einschließlich saisonaler Spitzen. Reserved Nodes bieten Einsparungen bei gleicher Instanzgröße, wenn aggressives Verkleinern ein Risiko birgt.
- **RDS-Snapshot-Verwaltung**: Behalten Sie nur die Snapshots, die Sie brauchen. Manuelle Snapshots werden unbegrenzt gespeichert, es sei denn, sie werden gelöscht.

## Prüfungstipps

*SAA-C03-Domäne: Design Cost-Optimized Architectures (Domäne 4, Aufgabe 4.3)*

- **DynamoDB-Preismodi**: On-Demand = pro Anfrage zahlen (höhere Kosten pro Einheit, kein Minimum). Provisioned = pro Kapazitätseinheit pro Stunde zahlen (niedrigere Kosten pro Einheit, Kapazität muss zugewiesen werden). **DynamoDB Auto Scaling** passt die provisionierte Kapazität automatisch an.
- **RDS Reserved Instances**: Verfügbar für alle RDS-Engine-Typen. Multi-AZ-Bereitstellungen können Reserved Instances verwenden (Sie verpflichten sich zu Multi-AZ). 1- oder 3-Jahres-Laufzeit.
- **ElastiCache Reserved Nodes**: Gleiches Verpflichtungsmodell wie EC2 Reserved Instances. Wird pro Knoten angewendet, nicht pro Cluster.
- **RDS-Snapshot-Speicher**: Automatisierte Backups sind bis zu 100 % der Datenbankgröße kostenlos. Manuelle Snapshots werden pro GB pro Monat in S3 berechnet. Prüfungsszenario: „RDS-Speicherkosten reduzieren“ → alte manuelle Snapshots löschen.
- **DynamoDB Reserved Capacity**: Ebenfalls für DynamoDB verfügbar (verpflichtet auf eine bestimmte Lese-/Schreibkapazität für 1 oder 3 Jahre zu einem Rabatt). Anders als Standard-Provisioned – Sie zahlen im Voraus für Kapazität über alle Ihre DynamoDB-Tabellen in einer Region.
- **Aurora Serverless v2 vs. provisioniert**: Serverless v2 skaliert automatisch, ideal für variable Arbeitslasten. Provisioniert mit Reserved Instances ist günstiger für stabile, vorhersehbare Arbeitslasten.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie, wann Sie die DynamoDB-On-Demand-Kapazität gegenüber der provisionierten Kapazität mit Auto Scaling verwenden sollten. Welche Informationen benötigen Sie, um diese Entscheidung zu treffen?

*(Hinweis: Denken Sie darüber nach, was „vorhersehbar“ in Bezug auf Verkehrsdaten bedeutet und welches Risiko On-Demand beseitigt, das Provisioned einführt.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen betreibt eine DynamoDB-Tabelle für die Bestenliste eines Mobile-Games. Der Traffic ist das ganze Jahr über sehr konsistent, außer während eines saisonalen Events, das Monate im Voraus geplant ist (eine Woche pro Quartal, das 10-fache des normalen Traffics erreichend, während Spieler im Laufe des ersten Tages beitreten). Die Priorität des Unternehmens ist, die Datenbankkosten während der langen, vorhersehbaren Steady-State-Phasen zu minimieren und gleichzeitig die Leistung während der bekannten Event-Wochen aufrechtzuerhalten.

Welche DynamoDB-Kapazitätsstrategie erfüllt diese Anforderungen am BESTEN?

A) On-Demand-Kapazität, um die saisonalen Spitzen ohne Drosselung zu bewältigen  
B) Provisionierte Kapazität, auf saisonale Spitzenniveaus eingestellt (immer für das 10-fache des Traffics provisioniert)  
C) Provisionierte Kapazität mit DynamoDB Auto Scaling, mit einem für die saisonale Spitze eingestellten Maximum  
D) DynamoDB Reserved Capacity Units für 3 Jahre auf normalem Verkehrsniveau

**Hinweis 1**: „Sehr konsistenter Traffic außer für eine geplante, bekannte saisonale Spitze“ – welcher Modus handhabt beides effizient? (Die Stärke von On-Demand ist *unvorhersehbarer* Traffic; dieser Traffic ist vorhersehbar.)

**Hinweis 2**: „Kosten minimieren“ außerhalb der Spitze bedeutet, dass man nicht ständig für das 10-fache überdimensionieren kann.

**Hinweis 3**: DynamoDB Auto Scaling kann für das saisonale Event hochskalieren und danach wieder herunterskalieren.

**Antwort**: C

**Erläuterung**: Provisionierte Kapazität mit Auto Scaling skaliert die Tabelle basierend auf dem tatsächlichen Traffic. Während normaler Phasen ist die Kapazität auf normalem Niveau (geringe Kosten). Während des saisonalen Events – dessen Termine im Voraus bekannt sind und dessen Traffic im Laufe des ersten Tages allmählich anwächst – verfolgt Auto Scaling den Anstieg bis zum maximal konfigurierten Niveau (bewältigt die 10-fache Spitze), und das Team kann auch das Minimum vor dem geplanten Start als zusätzliche Reserve anheben. Nach dem Event skaliert die Kapazität wieder herunter. Das ist günstiger als On-Demand während des Steady-State, der das Jahr dominiert (On-Demand kostet mehr pro Anfrage), und günstiger, als ständig für das 10-fache zu provisionieren.

**Warum nicht A?** On-Demand bewältigt Spitzen ohne Drosselung, aber seine Stärke ist *unvorhersehbarer* Traffic. Hier ist der Traffic sehr konsistent und die Spitze ist geplant und allmählich – den On-Demand-Aufschlag pro Anfrage für die ~92 % des Jahres zu zahlen, die Steady-State sind, widerspricht der angegebenen Priorität, die Kosten während normaler Phasen zu minimieren.

**Warum nicht B?** Dauerhaft für das 10-fache zu provisionieren bedeutet, dass ~90 % der provisionierten Kapazität für ~92 % des Jahres ungenutzt bleiben – Sie zahlen für Kapazität, die nie genutzt wird.

**Warum nicht D?** Reserved Capacity Units binden Sie an normale Verkehrsniveaus. Während des 10-fachen saisonalen Events würden Sie über den reservierten Betrag hinaus gedrosselt, oder Sie müssten On-Demand obendrauf hinzufügen.

*SAA-C03-Domäne: Design Cost-Optimized Architectures — Aufgabe 4.3*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus evaluiert ein neues Feature: ein Restaurant-Analyse-Dashboard, das Echtzeit-Bestellzahlen, Umsatz pro Stunde und Kundendemografie anzeigt. Diese Daten würden eine Datenbank etwa 200 Mal pro Minute abfragen (eine Abfrage pro Analyst pro Seitenaktualisierung, mit 10 Analysten).

Derzeit liegen die Analysedaten in Athena (S3). Sollten sie das Dashboard auf Athena bauen, oder sollten sie die Daten in eine Datenbank laden? Wenn eine Datenbank, welche (Aurora, DynamoDB, Redshift)?

Berücksichtigen Sie: Abfragehäufigkeit, Anforderungen an die Datenaktualität, Abfragekomplexität (Aggregationen, Joins) und Kosten pro Abfrage bei diesem Volumen.

*(Es gibt keine eindeutig korrekte Antwort. Das Ziel ist, die Datenbankauswahl für Analyse-Arbeitslasten zu üben.)*

## Post-Credits-Szene

Tom präsentierte Maya die vollständige Zusammenfassung der Kostenoptimierung.

Drei Monate Arbeit. 34.092 $ an jährlichen Einsparungen identifiziert, das meiste davon bereits umgesetzt.

„Was ist der Rest?“, fragte Maya.

„Optimierungen, bei denen ich mir noch nicht sicher bin“, sagte Tom. „Die Aurora-Konfiguration könnte vielleicht noch weiter right-sized werden, aber ich möchte noch ein Quartal Daten, bevor ich mich festlege. Und es gibt eine Datenübertragungsfrage, die ich noch nicht vollständig analysiert habe.“

„Die Netzwerkkosten.“

„Ja. Das ist als Nächstes dran.“

Maya betrachtete die Zahlen. „Tom, ich möchte etwas verstehen. Diese Optimierung – du bist seit drei Monaten dabei. Das ist ein erheblicher Teil deiner Zeit.“

„Ungefähr 30 %.“

„Und du hast etwa 34.000 $ pro Jahr gefunden. Die Optimierung amortisiert sich also in – was, ein paar Monaten deines Gehalts?“

Tom sah sie an. „Ungefähr so.“

„Und jedes Jahr danach ist es reine Einsparung.“

„Oder reine Reinvestition“, sagte er. „Gleicher Effekt.“

Maya nickte. „Das ist es, was ich von dir möchte. Nicht nur bei Speicher und Datenbanken – bei allem. Mache Kostenoptimierung zu einer kontinuierlichen Funktion deiner Rolle.“

Tom hatte seinen Job noch nie so beschrieben gehört. Er fand es zugleich treffend und befriedigend.

Im nächsten Kapitel: die letzte verbleibende Kostenkategorie – und diejenige, die fast jeden überrascht.
