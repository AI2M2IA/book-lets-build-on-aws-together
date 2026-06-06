# Kapitel 24: Die Datenbank, die mit einem wächst

Stellen Sie sich eine Bibliothek vor, die mit zwei Regalen und einem Bibliothekar begann. Das war eine Weile lang genug. Der Bibliothekar wusste, wo alles war. Anfragen wurden schnell beantwortet. Dann wuchs die Bibliothek: zehn Regale, zwanzig, vierzig. Derselbe Bibliothekar, derselbe Schreibtisch, derselbe Zettelkatalog. Jetzt erfordert das Finden von irgendetwas Warten. Der Bibliothekar ist nicht langsam – es gibt nur mehr Bibliothek, als eine Person im ursprünglichen Tempo bedienen kann.

Die Lösung ist kein schnellerer Bibliothekar. Es ist eine andere Art von Bibliothek.

---

Nach der S3-Kostenreduktion setzte Tom seine Überprüfung fort. Die Datenbankebene war eine andere Art von Problem – nicht ungenutzte Daten in der falschen Speicherklasse, sondern ein System, das aktiv unter der Last von sechs Monaten Traffic-Wachstum kämpfte.

---

Die Zahlen waren nicht bequem.

Nimbus betrieb RDS PostgreSQL: Multi-AZ, db.r6g.large-Instanz. 340 $/Monat.

Leo rief das CloudWatch-Metriken-Dashboard auf. Die Zahlen hatten ein Muster.

**DatabaseConnections**: 198 von einem Maximum von 200 während des Freitagshöhepunkts. Zwei Verbindungen von der Sättigung entfernt. Bei 200 würden neue Verbindungsversuche mit „too many connections“ fehlschlagen – ein Fehler, der für Kunden, die Abendessen bestellen, als HTTP-500 auftauchen würde.

**CPUUtilization**: 89 % Spitze während des Freitagsabendansturms. Die Instanz war darauf ausgelegt, Spitzen zu bewältigen – eine db.r6g.large hat 2 vCPUs und 16 GB Speicher –, aber anhaltende 89 % CPU bedeuteten, dass die Datenbank bereits am Limit war, bevor die Hauptverkehrsstunde überhaupt eintraf.

**ReadLatency**: 840 Millisekunden P95. Vor sechs Monaten waren es 180 ms gewesen. Die Verschlechterung war allmählich gewesen – 10 bis 20 ms pro Woche –, unsichtbar, bis sie katastrophal war. In der Woche vor Toms Überprüfung hatte die P99-Latenz eine volle Sekunde überschritten. Kunden, die auf eine Restaurant-Speisekarte klickten, warteten über eine Sekunde, bis die Seite lud.

**FreeStorageSpace**: 18 % des bereitgestellten Speichers verbleibend. Bei den aktuellen Wachstumsraten würde der Datenbank in etwa 11 Wochen der bereitgestellte Speicher ausgehen.

„Jedes davon ist isoliert lösbar“, sagte Leo und betrachtete das Dashboard. „Aber wir haben alle vier auf einmal.“

Die Spitze bei der Verbindungsanzahl deutete auf Connection-Pooling-Probleme in der Anwendung hin – zu viele ECS-Tasks, die ihre eigenen Datenbankverbindungen öffneten. Das CPU-Problem deutete auf teure Abfragen hin. Das Latenzproblem und das CPU-Problem waren mit ziemlicher Sicherheit dasselbe Problem: eine langsame Abfrage, die zu oft lief.

„Moment – aber *warum* sind wir bei 198 Verbindungen?“ fragte Maya. „Wir haben drei ECS-Tasks. Wie kommen wir auf fast 200 Datenbankverbindungen?“

Jeder ECS-Task verwendete SQLAlchemy mit einer Standard-Pool-Größe von 5 Verbindungen plus einem Overflow von 10. Drei Tasks × 15 potenzielle Verbindungen = 45 Verbindungen aus der Anwendung. Die anderen 153 stammten von den Analyse-Lambda-Funktionen, Hintergrundjob-Workern, dem Glue-ETL-Job, den lokalen Verbindungen des Entwicklungsteams über den Bastion-Host und mehreren Verbindungen, die von einer älteren Version des Codes geöffnet, aber nicht ordnungsgemäß geschlossen worden waren.

„Das Verbindungsanzahl-Problem“, sagte Leo, „ist eigentlich ein Anwendungsproblem, das wie ein Datenbankproblem aussieht.“ Er fügte PgBouncer (einen Connection Pooler) zur Aufgabenliste hinzu – aber der unmittelbare Engpass war die langsame Abfrage.

Die Datenbank-CPU schoss während des Freitagsabendansturms auf 89 %. Leseanfragen stauten sich. Die P95-Abfragelatenz hatte sich in sechs Monaten verdoppelt.

„Die Datenbank ist der Engpass“, sagte er. „Der Traffic ist gewachsen. Die Datenbank ist nicht mitgewachsen.“

„Können wir die Instanz nicht einfach größer machen?“ fragte Maya. „Moment – aber *warum* haben wir eine einzige Datenbank, die alle Lese- und Schreibvorgänge bewältigt? Warum haben wir das nicht von Anfang an verteilt?“

„Doch“, sagte Leo. „Das ist vertikale Skalierung. Wir wechseln von r6g.large zu r6g.xlarge. Mehr CPU, mehr Speicher. Es kostet mehr und verschafft uns Zeit.“

„Aber es behebt nicht das zugrunde liegende Problem“, sagte Priya. „Irgendwann erreichen wir die größte Instanz und brauchen einen anderen Ansatz. Und haben wir darüber nachgedacht, was passiert, wenn ein Schreibvorgang versehentlich an eine Read Replica geht? Die Replica lehnt ihn ab und die Bestellung schlägt still fehl.“

„Es gibt zwei Ansätze“, sagte Leo. „Read Replicas oder Aurora.“

„Was ist der Unterschied?“

„Stell es dir wie eine Bibliothek vor“, sagte Leo und griff zu einem Marker. „Ein Bibliothekar, der sowohl Bücher zurücknimmt als auch Besucherfragen beantwortet. Wenn die Bibliothek beliebt wird, bildet sich eine Warteschlange. Die Lösung: mehr Bibliothekare einstellen – aber nur für die Beantwortung von Fragen. Die Rücknahme läuft weiterhin über den ursprünglichen Schalter.“

„Das ist eine Read Replica“, sagte Priya.

„Genau. Aurora geht einen Schritt weiter – es gestaltet das Regalsystem selbst neu, sodass jeder Bibliothekar dieselben Regale teilt und immer dieselben Bücher sieht, ohne Verzögerung. Kein Warten darauf, dass Aktualisierungen von einem Schalter zum anderen durchsickern.“

**Read Replicas: Lesetraffic verteilen**

Die meisten Webanwendungen lesen Daten weit häufiger, als sie schreiben. Ein Kunde, der die Speisekarte durchstöbert, macht Dutzende von SELECT-Abfragen. Eine Bestellung aufzugeben macht ein paar INSERT/UPDATE-Abfragen. Das Verhältnis ist typischerweise 10:1 oder höher.

Eine **Read Replica** ist eine zusätzliche RDS-Instanz, die eine Kopie aller Schreibvorgänge von der Primärinstanz empfängt und diese Schreibvorgänge für SELECT-Abfragen verfügbar macht.

Wie es funktioniert:

1. Anwendungsschreibvorgänge (INSERT, UPDATE, DELETE) gehen an die Primärdatenbank
2. Die Primärinstanz repliziert diese Änderungen asynchron an die Read Replicas
3. Anwendungslesevorgänge (SELECT) werden über die Read Replicas verteilt
4. Die Read Replicas teilen sich die Last – jede bewältigt einen Bruchteil des gesamten Lesetraffics

Das Ergebnis: Die Primärdatenbank bewältigt nur Schreibvorgänge (und optional einige Lesevorgänge). Die Read Replicas bewältigen die Leselast. Bei einem 10:1-Lese-/Schreib-Verhältnis halbiert das Hinzufügen einer Read Replica ungefähr die Gesamtlast der Primärinstanz.

**Wichtige Einschränkung**: Die Replikation ist **asynchron**. Es gibt eine Replikationsverzögerung – typischerweise Millisekunden, aber unter Last auch Sekunden. Ein Lesevorgang von einer Replica könnte Daten sehen, die etwas hinter der Primärinstanz liegen. Für die meisten Lesevorgänge (Speisekarte durchstöbern, Bestellhistorie ansehen) ist das akzeptabel. Für „ist meine Bestellung gerade durchgegangen?“ – von der Primärinstanz lesen.

**Read Replicas: Die Details**

- Sie können bis zu 15 Read Replicas pro primärer RDS-Instanz haben (MySQL, PostgreSQL, MariaDB)
- Read Replicas können in derselben Region oder einer anderen Region sein (regionsübergreifende Replicas)
- Read Replicas können selbst Read Replicas haben (Verkettung)
- Read Replicas sind separate Endpunkte – Ihre Anwendung muss Lesevorgänge an den Replica-Endpunkt leiten
- Read Replicas können zu eigenständigen Datenbanken befördert werden (nützlich für DR)

Für Nimbus fügte Leo eine Read Replica hinzu. „Das passt schon“, sagte er, als Priya fragte, ob er die Lese-/Schreib-Routing-Logik der Anwendung getestet hatte, bevor er den Traffic umstellte. Hatte er nicht. Er verbrachte die nächsten vierzig Minuten damit, zu verifizieren, dass keine Schreibvorgänge an den Read-Replica-Endpunkt gingen.

Er aktualisierte die Anwendung wie folgt:

- Schreiboperationen → Primärendpunkt
- Speisekarte durchstöbern, Bestellhistorie → Replica-Endpunkt

Die CPU auf der Primärinstanz sank von 89 % auf 41 % bei Spitzenlast.

**Das Read-after-Write-Konsistenzproblem**

Drei Tage nach Aktivierung der Read Replica traf ein Support-Ticket ein. Ein Restaurantpartner hatte seine Speisekarte aktualisiert – einen eingestellten Artikel entfernt – und dann angerufen, um zu bestätigen, dass er entfernt war. Der Kundendienstmitarbeiter rief die Speisekarte aus der Nimbus-Oberfläche auf. Der Artikel war noch da.

Zwanzig Sekunden später war er weg.

Asynchrone Replikationsverzögerung. Der Schreibvorgang (DELETE Menüelement) ging an die Primärinstanz. Der Lesevorgang des Kundendienstmitarbeiters ging an die Replica, die die Änderung noch nicht erhalten hatte. Die Replica war in jenem Moment 15 Sekunden hinterher – nicht ungewöhnlich, aber sichtbar.

„Und was, wenn jemand über das Eventual-Consistency-Fenster einzubrechen versucht?“ fragte Priya. „Oder einfach – was, wenn eine Bestellung für ein Menüelement aufgegeben wird, das gerade gelöscht wurde? Wir würden den Kunden belasten, und das Restaurant hätte den Artikel nicht.“

Das war eine echte Konsistenzsorge, nicht nur ein UX-Ärgernis.

Die Lösung: identifizieren, welche Lesevorgänge Konsistenzanforderungen haben, und sie an die Primärinstanz leiten.

**Lesevorgänge, die an die Replica gehen können** (Eventual Consistency ist in Ordnung):
- Kunde durchstöbert die Speisekarte eines Restaurants (1–2 Sekunden veraltet ist nicht wahrnehmbar)
- Bestellhistorie-Abfragen (ein Nutzer sieht seine Bestellhistorie von vor einer Minute an)
- Analyseartige Lesevorgänge (Top-Restaurants diese Woche)

**Lesevorgänge, die an die Primärinstanz gehen müssen** (Read-after-Write-Konsistenz erforderlich):
- Unmittelbar nach einem Schreibvorgang, wenn die Anwendung bestätigen muss, dass der Schreibvorgang erfolgreich war
- Bestellstatus-Lesevorgänge unmittelbar nach der Bestellaufgabe
- Speisekarten-Lesevorgänge, die von der Restaurantverwaltungsoberfläche ausgelöst werden (das Restaurant hat gerade die Speisekarte geändert)

Die Anwendung fügte einen Routing-Hinweis in der Datenbankverbindungsschicht hinzu: Wenn die Anfrage vom Restaurant-Verwaltungs-Dashboard kam, an die Primärinstanz leiten. Wenn sie von einem stöbernden Kunden kam, an die Replica leiten. Der HTTP-Header `X-Read-Consistency: strong` diente als Signal.

„Es ist nicht so schwer“, sagte Leo. „Man muss nur wissen, welche Lesevorgänge es erfordern.“

„Und es dokumentieren“, sagte Priya. „Damit die nächste Person, die einen neuen Endpunkt hinzufügt, weiß, welchen Pool sie verwenden soll.“

„Wie viel kostet das pro Monat?“ fragte Tom. Es war seine Standard-Eröffnungsfrage für jeden neuen Dienst.

Eine Read Replica desselben Instanztyps kostet dasselbe wie die Primärinstanz. Von 340 $/Monat auf 680 $/Monat.

„Wir haben die Kosten verdoppelt, um die Last ungefähr zu halbieren“, sagte Tom.

„Ja. Aber die Alternative war der Wechsel zu einem größeren Instanztyp, der ebenfalls mehr kosten und die Leselast nicht verteilen würde.“

Tom rechnete. Er nickte, widerwillig.

„Was, wenn die Primärinstanz ausfällt?“ fragte Maya, bevor Tom zu Aurora überschwenken konnte. „Was passiert mit der Read Replica?“

Leo erklärte die Replica-Beförderung.

**Wenn die primäre RDS-Instanz ausfällt**, führt AWS automatisch ein Failover zur Standby-Replica in der Multi-AZ-Konfiguration durch (eine andere Art von Replica – ein synchroner Standby, keine Read Replica). Der Multi-AZ-Standby wird zur neuen Primärinstanz. Read Replicas bedienen weiterhin Lesevorgänge und replizieren nun von der neuen Primärinstanz. Aus Sicht der Anwendung ändert sich das DNS des Primärendpunkts so, dass es auf den ehemaligen Standby zeigt, und die Anwendung verbindet sich neu.

Das Failover dauert für RDS PostgreSQL typischerweise 60–120 Sekunden. Während dieses Fensters schlagen Schreibvorgänge fehl.

**Read-Replica-Beförderung** ist eine separate Operation – und ein separates Szenario. Wenn Sie eine Read Replica nehmen und zu einer unabhängigen, beschreibbaren Datenbank machen wollen (für DR, für die Migration in eine neue Region oder weil die Primärinstanz weg ist und Sie befördern müssen, statt auf das Multi-AZ-Failover zu warten), können Sie eine Read Replica zu einer eigenständigen Primärinstanz befördern. Die Beförderung dauert ein paar Minuten, danach repliziert die Replica nicht mehr von der ursprünglichen Primärinstanz – sie ist ihre eigene Datenbank.

„Haben wir darüber nachgedacht, was passiert, wenn die us-west-2-Primärinstanz komplett ausfällt?“ fragte Priya. „Nicht nur ein Failover zum Multi-AZ-Standby – die ganze Region.“

„Wenn die Region ausfällt“, sagte Leo, „ist der Multi-AZ-Standby ebenfalls in us-west-2. Beide fallen zusammen aus.“

„Für ein echtes regionales DR-Szenario“, sagte Tom, „bräuchten wir also eine Read Replica in us-east-1, die wir befördern könnten.“

„Ja. Eine regionsübergreifende Read Replica. Die haben wir noch nicht.“

„Wie viel kostet das pro Monat?“ fragte Tom. Er wusste bereits, dass die Antwort eine Entscheidung beinhalten würde.

Eine regionsübergreifende Read Replica einer db.r6g.large in us-east-1: 340 $/Monat (gleiche Instanzkosten). Plus regionsübergreifender Datentransfer für die Replikation: minimal bei Nimbus' Schreibvolumen. Gesamt: etwa 350 $/Monat für eine DR-Replica.

„Das sind 4.200 $ pro Jahr“, sagte Tom, „um sich gegen ein Szenario abzusichern, das AWS-Regionen in zehn Jahren weniger als fünf Mal passiert ist.“

„Und die Kosten dafür, dass Nimbus während eines regionalen Ereignisses 24 Stunden lang ausfällt, sind?“ fragte Priya.

Tom rechnete. Er antwortete nicht laut. Aber er fügte „regionsübergreifende Read Replica“ dem DR-Backlog hinzu.

„Was ist Aurora?“ fragte er.

**Amazon Aurora: Die Datenbank-Engine neu denken**

Aurora ist AWS' proprietäre relationale Datenbank-Engine, kompatibel mit MySQL und PostgreSQL. Sie wurde von Grund auf für Cloud-Workloads konzipiert und denkt neu, wie die Speicherschicht einer relationalen Datenbank funktioniert.

In einem traditionellen RDS-Setup (MySQL, PostgreSQL) sind Speicher und Compute eng gekoppelt. Die Datenbank-Engine verwaltet die Datendateien. Die Replikation kopiert die Daten von der Primärinstanz zur Replica. Die Replica muss jede Schreiboperation erneut ausführen.

Das erzeugt eine Obergrenze für die Replikationsgeschwindigkeit: Eine Replica kann Schreibvorgänge nur so schnell anwenden, wie sie das Replikationslog verarbeiten kann. Während einer schreibintensiven Phase – einem Massenimport, einem Flash Sale, einem Batch-Update – kann die Replica zurückfallen. Replikationsverzögerung ist kein Fehler in der Implementierung; sie ist eine Folge der Architektur.

Priya hatte das sofort markiert, als Leo Read Replicas vorschlug. „Und haben wir darüber nachgedacht, was passiert, wenn die Replikationsverzögerung während des Freitagsansturms auf 30 Sekunden hochschnellt? Die Replica ist 30 Sekunden hinterher. Ein Kunde gibt eine Bestellung auf, der Küchenslot wird in der Primärinstanz reserviert, aber ein zweiter Kunde, der die Replica abfragt, sieht die Reservierung nicht. Zwei Bestellungen, ein Slot.“

„Das ist ein Bestandskonsistenzproblem“, sagte Leo.

„Das ist genau ein Bestandskonsistenzproblem“, bestätigte Priya. „Weshalb Bestands-Lesevorgänge – ‚ist dieser Artikel noch verfügbar?‘ – an die Primärinstanz gehen müssen.“

Auroras Architektur adressiert die Verzögerung direkt.

Aurora trennt Speicher von Compute. Es verwendet eine verteilte, fehlertolerante Speicherschicht, die Daten automatisch über drei Availability Zones in sechs Kopien repliziert. Die Compute-Schicht (die Datenbankinstanzen) sitzt auf dieser Speicherschicht.

**Was sich dadurch ändert**:

**Read Replicas**: Aurora-Replicas müssen keine Daten replizieren – sie teilen sich bereits dieselbe Speicherschicht. Das bedeutet:

- Bis zu 15 Aurora-Replicas, die sich das Speichervolumen teilen (auch reguläres RDS erlaubt bis zu 15 Read Replicas, aber jede ist eine vollständige Datenkopie)
- Die Replikationsverzögerung liegt typischerweise unter 100 Millisekunden (vs. Sekunden für RDS unter Last)
- Replicas können in unter 30 Sekunden zur Primärinstanz befördert werden (vs. Minuten)

**Failover**: Weil Replicas sich den Speicher teilen, ist das Failover viel schneller – die Beförderung beinhaltet keinen Datentransfer, nur das Umleiten von Schreibvorgängen.

**Speicher**: Aurora skaliert den Speicher automatisch in 10-GB-Schritten, bis zu 128 TiB (256 TiB in neueren Engine-Versionen). Sie stellen niemals Speicher im Voraus bereit.

**Performance**: Aurora behauptet den 5-fachen Durchsatz von Standard-MySQL und den 3-fachen von Standard-PostgreSQL bei äquivalenten Instanztypen.

Sie fragen sich vielleicht: Wenn alle Replicas sich denselben Speicher teilen, wird dieser Speicher dann nicht zu einem Single Point of Failure? Auroras Speicherschicht repliziert Daten automatisch über sechs Kopien in drei Availability Zones. Der Speicher selbst ist widerstandsfähiger als jedes einzelne RDS-Multi-AZ-Setup – er ist darauf ausgelegt, den Verlust einer ganzen AZ ohne Datenverlust und ohne notwendiges Failover zu überstehen.

Eine zweite häufige Frage: Wenn Aurora MySQL/PostgreSQL-kompatibel ist, kann man dann von RDS PostgreSQL zu Aurora PostgreSQL migrieren, ohne Anwendungscode zu ändern? Fast. Aurora-PostgreSQL-Kompatibilität bedeutet, dass Aurora das PostgreSQL-Wire-Protokoll implementiert und die überwiegende Mehrheit der PostgreSQL-SQL-Syntax und -Funktionen unterstützt. Die meisten Anwendungen migrieren ohne Codeänderungen. Die Randfälle: Eine kleine Anzahl von PostgreSQL-Erweiterungen ist auf Aurora nicht verfügbar, einige Systemkatalog-Abfragen geben andere Werte zurück, und bestimmte administrative Operationen unterscheiden sich. Für Produktionsmigrationen testen Sie mit parallelem Lesetraffic, bevor Sie Schreibvorgänge umstellen.

Für Nimbus dauerte die Migration von RDS PostgreSQL zu Aurora PostgreSQL einen Nachmittag. Die Anwendung zeigte auf den Aurora-Endpunkt. Die Speisekarten-Abfrage – nachdem Leo den Index hinzugefügt hatte, den Performance Insights als größten Verbraucher der Datenbanklast identifiziert hatte – lief in 4 ms statt 620 ms. Der Connection Pool erreichte nicht mehr 198 von 200. Die P95-Latenz sank auf 28 ms.

„Es ist eine andere Datenbank-Engine“, sagte Leo, „von der die Anwendung denkt, es sei dieselbe Datenbank-Engine.“

„Und der interessante Teil?“ fragte Maya.

„Schnelles Datenbank-Cloning.“

„Notiert“, sagte Sam leise von der anderen Seite des Raums, bereits tippend. Sam war ein Backend-Ingenieur, der dem Team ein paar Wochen zuvor beigetreten war, um Leo etwas von der Datenbankarbeit abzunehmen. Niemand fragte, was er tat.

**Aurora-Preisgestaltung: Die Tom-Frage**

Auroras Preisgestaltung unterscheidet sich von RDS:

**Instanzpreis**: Ähnlich der RDS-Instanzpreisgestaltung nach Typ.

**Speicherpreis**: 0,10 $ pro GB pro Monat (Sie zahlen für das, was gespeichert ist, automatisch skaliert).

**I/O-Preis**: Aurora berechnet pro I/O-Anfrage (Lese-/Schreibvorgang zum Speicher). Das kann bei schreibintensiven Workloads bedeutsam sein.

„Moment“, sagte Tom. „Wir zahlen I/O separat?“

„Aurora Serverless v2 und Aurora I/O-Optimized ändern dieses Preismodell“, sagte Leo. „Aurora I/O-Optimized berechnet keine I/O-Gebühr, aber einen höheren Speicher- und Instanzpreis. Besser für I/O-intensive Workloads.“

Tom betrachtete den Kompromiss. Für Nimbus, das leselastig war (viele Speisekarten-Abfragen, wenige Schreibvorgänge), könnte Aurora I/O-Optimized mehr kosten. Die Standard-Aurora-Preisgestaltung könnte angemessen sein.

Eine nützliche Faustregel: Wenn Ihre I/O-Gebühren etwa 25 % Ihrer gesamten Aurora-Rechnung überschreiten, ist I/O-Optimized wahrscheinlich günstiger. Für Nimbus' leselastige Workload waren die I/O-Gebühren niedrig – die Standard-Preisgestaltung gilt. Für eine schreibintensive Workload wie ein Ereignisprotokollierungssystem könnte I/O-Optimized die Kosten erheblich senken.

Das ist eine echte Kostenentscheidung, die erfahrene Ingenieure treffen: Sie müssen die I/O-Muster Ihrer Workload kennen, um richtig zu wählen.

Wenn Ihre Workload klein, stabil und vorhersehbar ist, ist RDS PostgreSQL einfacher und merklich günstiger – aber wenn Ihr Traffic unvorhersehbar ist, Ihr Datenvolumen über das hinauswächst, was Sie im Voraus bereitstellen können, oder Sie ein automatisches Failover in unter 30 Sekunden brauchen, rechtfertigt Auroras Shared-Storage-Modell die höheren Grundkosten.

**Aurora Serverless: Skalieren, ohne über Instanzen nachzudenken**

**Aurora Serverless v2** ist eine Konfiguration, die die Compute-Kapazität automatisch basierend auf der tatsächlichen Datenbanklast skaliert. Statt eine feste Instanzgröße zu wählen (db.r6g.large), setzen Sie eine Mindest- und Maximalkapazität in Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Skaliert in Sekunden hoch, wenn die Last steigt
- Skaliert in Leerlaufzeiten herunter – und kann seit Ende 2024 bis auf 0 ACUs automatisch pausieren, wenn keine Verbindungen bestehen (das Fortsetzen dauert ~15 Sekunden; Auto-Pause funktioniert nicht mit RDS Proxy oder anderen verbindungshaltenden Proxys)
- Kosten: 0,12 $ pro ACU-Stunde (plus Speicher und I/O)

Für Workloads mit variablem Traffic – Nimbus' Freitagsspitzen vs. Montagmorgen-Ruhe – reduziert Serverless v2 die Kosten in Schwachlastzeiten und bewältigt Spitzen ohne Vorab-Bereitstellung.

„Während der Freitagsspitze“, sagte Leo, „skaliert Aurora also automatisch hoch. Sonntagmorgen, wenn wir fast keinen Traffic haben, skaliert es auf das Minimum zurück.“

„Und wir zahlen nur für die Kapazität, die wir nutzen“, sagte Tom.

„Korrekt.“

Nach einem Monat auf Aurora Serverless v2 rief Leo den ACU-Graphen (Aurora Capacity Unit) für die vorherige Woche auf.

Der Graph zeigte zwei deutliche Muster. Während der Woche lief die Datenbank bei 2–4 ACUs – ein leises Summen von Hintergrundabfragen, ECS-Gesundheitsprüfungen, Glue-ETL-Jobs und Entwicklungstests. Am Freitagabend zwischen 18:00 und 22:00 Uhr stieg die ACU-Anzahl:

```
Freitag 18:00  → 6 ACUs
Freitag 19:00  → 14 ACUs
Freitag 19:45  → 26 ACUs  (Spitze — Pizza-Bestellungen steigen vor dem NFL-Anpfiff)
Freitag 20:30  → 18 ACUs
Freitag 21:00  → 12 ACUs
Freitag 22:30  → 4 ACUs
Samstag 02:00  → 2 ACUs  (Minimum)
```

Die Skalierung war nahezu sofort – Aurora Serverless v2 skaliert in Schritten von 0,5 ACUs, und es kann Kapazität in Sekunden hinzufügen statt in den Minuten, die zum Bereitstellen einer neuen RDS-Instanz erforderlich sind.

„Wie viel hat diese Freitagsspitze gekostet?“ fragte Tom.

Bei 0,12 $ pro ACU-Stunde: Die Freitagsspitze waren 4 Stunden mit durchschnittlich 18 ACUs → 8,64 $ für den Spitzenzeitraum. Der Rest der Woche bei durchschnittlich 3 ACUs × 164 Stunden × 0,12 $ = 59,04 $. Gesamt für die Woche: 67,68 $.

Die äquivalente bereitgestellte Instanz, um die Freitagsspitze zu bewältigen (db.r6g.xlarge, 4 vCPUs, 32 GB), würde 0,937 $/Stunde × 168 Stunden = **157,42 $ für die Woche** kosten – egal, ob die Freitagsspitze je eintrat oder nicht.

„Serverless v2 sind 67 $ für die Woche. Eine bereitgestellte Instanz, dimensioniert für die Spitze, sind 157 $“, sagte Tom. „Das ist eine Reduktion um 57 %.“

„Bei einer Datenbank, die legitim 26 ACUs für vier Stunden am Freitag und 2 ACUs für den Rest der Woche nutzt“, sagte Leo. „Wenn deine Datenbank die ganze Woche bei konstant hoher Last läuft, ist eine bereitgestellte Instanz günstiger. Die Einsparungen kommen von der Variabilität.“

Tom nickte langsam. Er fügte das einem Muster in seinen Notizen hinzu: Jede Einsparungsgeschichte dieses Quartals hatte dieselbe Form. Man zahlt für das, was man nutzt, nicht für das, was man brauchen könnte. S3-Lifecycle-Richtlinien zahlten nur für die Speicherklasse, die jedes Objekt rechtfertigte. Lambda zahlte nur für die Aufrufzeit. Fargate zahlte nur für Task-CPU und -Speicher. Aurora Serverless v2 zahlte nur für die ACUs, die die Datenbank tatsächlich verbrauchte.

Tom hatte den Gesichtsausdruck von jemandem, der genau das gefunden hatte, wonach er suchte.

**Erholung von einer fehlerhaften Migration: Clones, PITR und der Rückgängig-Knopf**

Zwei Wochen nach dem Wechsel zu Aurora führte Sam ein Datenbankmigrationsskript in der Produktion aus. Das Skript sollte die Spalte `legacy_menu_format` aus der Tabelle `menu_items` entfernen. Er führte es ohne die WHERE-Klausel aus, von der er dachte, er hätte sie eingefügt.

Das Ergebnis war nicht das Entfernen einer Spalte. Es war eine DELETE-Anweisung, die 40.000 Zeilen aus der Tabelle `menu_items` löschte – etwa 200 Restaurants an Speisekartendaten, weg.

Der Alarm löste innerhalb von 30 Sekunden aus. Bestellfehler schossen in die Höhe. Der Speisekartendienst begann, leere Ergebnisse für 200 Restaurants zurückzugeben.

„Es sollte eine WHERE-Klausel haben“, sagte Sam und starrte auf die Konsole.

Der traditionelle Wiederherstellungspfad: aus dem jüngsten automatisierten Backup-Snapshot wiederherstellen. Automatisierte Backups laufen einmal alle 24 Stunden, und ein vollständiges Restore-und-Swap würde 20–40 Minuten dauern – während dessen *alle* Restaurants dunkel wären, nicht nur die betroffenen 200 – und jede seit dem Backup aufgegebene Bestellung verloren wäre.

Leo tat das nicht. Wie Standard-RDS hält Aurora kontinuierliche Backups für **Point-in-time-Recovery (PITR)** vor – Sie können den Cluster auf jede Sekunde innerhalb des Backup-Aufbewahrungsfensters wiederherstellen, nicht nur auf den letzten nächtlichen Snapshot. Und entscheidend: Der Restore erstellt einen *neuen* Cluster; die Produktion bleibt am Laufen, während Sie wiederherstellen.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

Der Zeitstempel: 15:42:00Z – vier Minuten bevor Sam das Migrationsskript ausführte. Während der Recovery-Cluster hochfuhr, bediente der Rest der Produktion weiterhin die unbetroffenen Restaurants. Sobald er verfügbar war, exportierte Leo die `menu_items`-Zeilen für die 200 betroffenen Restaurants aus dem Recovery-Cluster und fügte sie zurück in die Produktion ein. Gesamtzeit vom Alarm bis zu vollständig wiederhergestellten Speisekarten: knapp unter 40 Minuten – und weil er die Zeilen chirurgisch reparierte, statt die ganze Datenbank zu tauschen, gingen keine nach 15:42 aufgegebenen Bestellungen verloren. Der Recovery-Cluster wurde danach gelöscht; er hatte seinen Zweck erfüllt.

„Was haben wir verloren?“ fragte Maya.

Sechs Bestellungen, die gegen die kurzzeitig leeren Speisekarten aufgegeben wurden, waren beim Checkout fehlgeschlagen – alle befanden sich in der SQS-Warteschlange und konnten erneut abgespielt werden. Es gingen keine Kundendaten dauerhaft verloren.

„Und hier kommt das **schnelle Datenbank-Cloning** ins Spiel“, sagte Leo und holte das Team danach zusammen. Aurora kann in Minuten einen **Clone** eines Clusters erstellen, unabhängig von der Datenbankgröße, mittels Copy-on-Write: Der Clone teilt sich die Speicherschicht des Originals, und nur neue oder geänderte Pages verbrauchen zusätzlichen Platz. Ein Clone der aktuellen Produktionsdatenbank ist günstig, schnell und vollständig isoliert – Schreibvorgänge auf den Clone berühren die Produktion nie.

„Was bedeutet“, sagte Priya und blickte Sam an, „dass das Migrationsskript gegen einen Clone von Produktionsdaten getestet wird, bevor es jemals in der Produktion läuft. Das ist die neue Regel.“

Sam nickte. Er hatte sie bereits auf einen Notizzettel geschrieben.

Ein weiteres Werkzeug gehört in dieses Bild. Aurora MySQL – nicht Aurora PostgreSQL – hat **Aurora Backtrack**: eine Funktion, die den Cluster *an Ort und Stelle* auf einen bestimmten Zeitpunkt zurückspult, ohne überhaupt auf einen neuen Cluster wiederherzustellen. Wäre Nimbus' Cluster Aurora MySQL gewesen, hätte Leo ihn in unter drei Minuten auf 15:42 zurückspulen können – obwohl das Zurückspulen des gesamten Clusters auch die Handvoll legitimer Bestellungen zurückgerollt hätte, die nach der Löschung geschrieben wurden, die der chirurgische PITR-Ansatz bewahrte.

„Und was, wenn jemand mit Backtrack – oder einem Point-in-time-Restore – einzubrechen versucht?“ fragte Priya. „Könnte ein Angreifer Audit-Logs oder Compliance-Daten zurückspulen?“

Backtrack erfordert die API-Berechtigung `rds:BacktrackDBCluster`, und Restores erfordern `rds:RestoreDBClusterToPointInTime` – separate IAM-Aktionen von normalen Datenbankoperationen. Standard-Anwendungsrollen haben diese Berechtigungen nicht. Nur das Betriebsteam, mit einer expliziten IAM-Richtlinie, die es erlaubt, konnte sie verwenden. Sie fügte das der Checkliste zur Überprüfung von IAM-Berechtigungen hinzu.

Die wichtigen Vorbehalte: Aurora Backtrack ist nur für Aurora-MySQL-kompatible Cluster verfügbar, nicht für PostgreSQL. Das Backtrack-Fenster wird bei der Cluster-Erstellung konfiguriert (1 Stunde bis 72 Stunden, Gebühr pro Stunde Backtrack-Fenster). Und Backtrack betrifft den gesamten Cluster – Sie können nicht eine Tabelle oder einen Satz von Zeilen zurückspulen. Für chirurgische Wiederherstellung auf Zeilenebene – auf beiden Engines – ist der PITR-zu-einem-temporären-Cluster-Ansatz, den Leo verwendete, das Werkzeug.

**Aurora Global Database: Multi-Region-Lesevorgänge**

**Aurora Global Database** erweitert Aurora über mehrere AWS-Regionen:

- **Eine Primärregion** bewältigt alle Schreibvorgänge
- **Bis zu fünf Sekundärregionen** bedienen Lesevorgänge mit typischerweise <1 Sekunde Replikationsverzögerung
- Sekundärregionen können in unter 1 Minute zur Primärregion befördert werden (für DR-Szenarien)

Für Nimbus' globale Expansion würde Aurora Global Database es einem Restaurantpartner in London ermöglichen, seine lokale Speisekarte aus der EU-Read-Replica abzufragen, während alle Bestellungen (Schreibvorgänge) weiterhin über die US-Primärinstanz gehen.

**RDS vs. Aurora: Wann man was wählt**

| Faktor            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Kosten            | Niedriger für kleine Workloads | Höhere Basis, aber bessere Skalierung                     |
| Kompatibilität    | Voll                          | MySQL/PostgreSQL-kompatibel (mit kleinen Unterschieden)    |
| Max. Replicas     | 15 (jede eine volle Datenkopie) | 15 (gemeinsames Speichervolumen)                         |
| Replica-Verzögerung | Kann Sekunden sein          | Meist <100 ms                                              |
| Speicher          | Feste Bereitstellung          | Auto-skaliert bis 128 TiB (256 TiB in neueren Versionen)   |
| Failover-Zeit     | 60–120 Sekunden               | <30 Sekunden                                               |
| Serverless-Option | Begrenzt                      | Aurora Serverless v2                                       |
| Am besten für     | Stabile, vorhersehbare Workloads | Variabler Traffic, hohes Lesevolumen, Bedarf an schnellem Failover |

**Über das Relationale hinaus: Die zweckgebaute Familie**

Kapitel 9 stellte DocumentDB (MongoDB-kompatible Dokumente), Neptune (Graph-Beziehungen) und Keyspaces (Cassandra-kompatible Wide-Column) vor, und Kapitel 10 stellte MemoryDB (dauerhafte Redis-kompatible Primärdatenbank) vor. Zwei weitere Namen runden die Familie ab – Sie brauchen keine Tiefe bei ihnen, nur die Fähigkeit zu erkennen, welche Datenform auf welche Engine hinweist, denn sie tauchen ständig als Antwortoptionen auf:

- **Amazon Timestream**: **Zeitreihendaten** – Sensorwerte, Metriken, Telemetrie. Examenssignal: „IoT-Messungen über die Zeit“. (In der realen Welt ist das aktuelle Angebot Timestream for InfluxDB; die ursprüngliche „LiveAnalytics“-Variante wurde 2025 für Neukunden geschlossen.)
- **Amazon QLDB**: Sie könnten ihm in älteren Fragen noch als dem „unveränderlichen, kryptografisch verifizierbaren Ledger“ begegnen. AWS stellte QLDB 2025 ein (empfiehlt stattdessen Aurora PostgreSQL) – behandeln Sie es als veralteten Ablenker, nicht als Baustein.

Die Regel, die man an ein Whiteboard schreiben sollte: **relationale Zeilen → RDS/Aurora; Key-Value in großem Maßstab → DynamoDB; Dokumente → DocumentDB; Beziehungen → Neptune; Zeit → Timestream; Cassandra → Keyspaces; dauerhaftes Redis → MemoryDB.** Passen Sie die Form an, und die Frage beantwortet sich selbst.

## Stärken und Grenzen

**Aurora-Stärken**:

- Deutlich schnelleres Failover als Standard-RDS
- Bis zu 15 Read Replicas mit minimaler Verzögerung
- Auto-skalierender Speicher
- Serverless v2 für variable Workloads
- Global Database für Multi-Region-Deployment

**Aurora-Grenzen**:

- Höhere Kosten für kleine, stabile Workloads
- Die I/O-Preisgestaltung kann bei schreibintensiven Workloads bedeutsam sein (dafür I/O-Optimized verwenden)
- Kleine MySQL/PostgreSQL-Kompatibilitätsunterschiede können Codeänderungen erfordern
- Das Fortsetzen von Serverless v2 aus der Auto-Pause (~15 Sekunden) und rasches Hochskalieren können Latenzspitzen verursachen

## Zusammenfassung

Die S3-Lifecycle-Arbeit in Kapitel 23 reduzierte Kosten, indem Daten in die richtige Speicherebene verschoben wurden. Aurora tut das Äquivalent für Compute: Statt für Spitzenlast bereitzustellen und ständig dafür zu zahlen, skaliert Serverless v2, um der Nachfrage zu entsprechen.

- **Read Replicas** verteilen den Lesetraffic von der Primärinstanz. Asynchrone Replikation – leichte Verzögerung für die meisten Lesevorgänge akzeptabel. Leiten Sie Lesevorgänge, die Schreibkonsistenz erfordern (Lesevorgänge unmittelbar nach dem Schreiben, Admin-Oberflächen-Lesevorgänge), an die Primärinstanz, nicht an die Replica.
- **Aurora** denkt die Speicherschicht neu: verteilt, über Replicas geteilt, auto-skalierend.
- Aurora bietet: 15 Read Replicas, <100 ms Replica-Verzögerung, <30 s Failover, bis zu 128 TiB (256 TiB in neueren Versionen) auto-skalierenden Speicher.
- **Performance Insights**: die spezifischen SQL-Abfragen identifizieren, die die Datenbanklast verursachen, bevor man entscheidet, wie man skaliert. Ein fehlender Index kann die Notwendigkeit einer größeren Instanz beseitigen.
- **CloudWatch-Datenbankmetriken**: DatabaseConnections (Nahsättigung bedeutet, dass das Connection Pooling der Anwendung kaputt ist), CPUUtilization (anhaltend hohe CPU bedeutet teure Abfragen), ReadLatency (Verschlechterung über die Zeit ist oft eine wachsende Tabelle mit fehlendem Index).
- **Aurora Serverless v2**: skaliert Compute automatisch in Schritten von 0,5 ACUs. Pro ACU-Stunde berechnet. Deutlich günstiger als bereitgestellte Instanzen bei Workloads mit hoher Variabilität zwischen Spitze und Schwachlast.
- **Point-in-time-Recovery (PITR)**: einen Aurora-Cluster auf jede Sekunde innerhalb des Backup-Aufbewahrungsfensters wiederherstellen – in einen *neuen* Cluster, sodass die Produktion am Laufen bleibt, während man verlorene Zeilen chirurgisch zurückkopiert.
- **Schnelles Datenbank-Cloning**: Copy-on-Write-Clone eines Clusters in Minuten, unabhängig von der Größe. Günstig, isoliert – nutzen Sie es, um Migrationen gegen Produktionsdaten zu testen, bevor sie in der Produktion laufen.
- **Aurora Backtrack** (nur MySQL-kompatibel – nicht PostgreSQL): den Cluster an Ort und Stelle auf einen Zeitpunkt zurückspulen, ohne aus einem Backup wiederherzustellen. Verfügbar für Fenster bis zu 72 Stunden. Erfordert die IAM-Berechtigung `rds:BacktrackDBCluster` – auf das Betriebsteam beschränken.
- **Aurora Global Database**: Primärinstanz in einer Region, Read Replicas in bis zu fünf Regionen.
- **Read-Replica-Beförderung**: regionsübergreifende Read Replicas können zu eigenständigen Primärinstanzen für regionales DR befördert werden. Wägen Sie den DR-Nutzen gegen die Kosten des Betriebs einer zweiten vollständigen Instanz ab.
- Wählen Sie RDS für kleinere, stabile, vorhersehbare Workloads. Wählen Sie Aurora, wenn Sie Skalierung, schnelles Failover oder die Bewältigung variablen Traffics brauchen.

## Prüfungstipps

*SAA-C03-Domäne: Entwurf leistungsstarker Architekturen (Domäne 3, Aufgabe 3.3)*

- **Aurora-Replica vs. RDS-Read-Replica**: Aurora-Replicas teilen sich den Speicher (nahezu null Verzögerung, <30 s Failover). RDS-Read-Replicas replizieren Daten (Verzögerung möglich, Minuten für Failover).
- **Aurora Serverless v2**: „Datenbankkapazität automatisch skalieren“, „unvorhersehbarer oder sprunghafter Datenbanktraffic“ → Aurora Serverless v2. Vorsicht: Historisch skalierte nur Serverless **v1** auf null; das Minimum von v2 lag bei 0,5 ACU bis Ende 2024, als v2 die Auto-Pause auf 0 ACUs erhielt. Ältere Examensfragen könnten noch annehmen, dass v2 nicht auf null skalieren kann.
- **Aurora Global Database**: „Multi-Region-Datenbank“, „aus der EU mit niedriger Latenz von der US-Primärinstanz lesen“, „RTO < 1 Minute für regionales Failover“ → Aurora Global Database.
- **Failover-Timing**: Aurora < 30 Sekunden. RDS Multi-AZ 60–120 Sekunden. Kennen Sie beide.
- **Zweckgebaute Datenbanken nach Datenform**: „Social Graph / Empfehlungen / Betrugsringe“ → Neptune. „MongoDB“ → DocumentDB. „Cassandra“ → Keyspaces. „Zeitreihen / IoT-Telemetrie“ → Timestream. „Redis-kompatible *Primär*datenbank (dauerhaft)“ → MemoryDB (vs. ElastiCache = Cache). „Unveränderlicher kryptografischer Ledger“ → QLDB in alten Fragen (2025 eingestellt).
- **Aurora I/O-Optimized**: Höhere Speicher- und Instanzkosten, keine Gebühr pro I/O. Verwenden, wenn I/O-Kosten dominieren (schreibintensiv). Standard-Aurora: niedrigere Speicherkosten, Zahlung pro I/O. Für leselastig verwenden.
- **Aurora Backtrack**: Die Datenbank an Ort und Stelle auf einen bestimmten Zeitpunkt zurückspulen, ohne aus einem Backup-Snapshot wiederherzustellen. Nur für MySQL-kompatibles Aurora verfügbar – für Aurora PostgreSQL ist die Antwort Point-in-time-Restore (in einen neuen Cluster) oder ein schneller Clone. Examenssignal: „versehentlich gelöschte Daten, müssen schnell wiederherstellen, ohne ein vollständiges Backup wiederherzustellen“ + MySQL → Backtrack.
- **Aurora schnelles Datenbank-Cloning**: Copy-on-Write-Clone in Minuten, unabhängig von der Datenbankgröße. Examenssignal: „schnell und günstig gegen eine Kopie von Produktionsdaten testen“ → Clone, nicht Snapshot-Restore.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen Aurora- und Standard-RDS-Read-Replicas. Warum ist Auroras Replikationsverzögerung typischerweise niedriger?

*(Hinweis: Der entscheidende Unterschied ist geteilter Speicher vs. Datenreplikation. Denken Sie darüber nach, was jede Replica tun muss, wenn ein Schreibvorgang eintrifft.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Die MySQL-Datenbank einer Social-Media-Plattform erlebt aufgrund zunehmenden Traffics hohe Leselatenz. Die Anwendung ist leselastig (95 % Lesevorgänge, 5 % Schreibvorgänge). Das Team braucht eine konsistente Leselatenz, auch während Traffic-Spitzen. Es braucht automatisches Failover mit minimaler Ausfallzeit (Ziel-RTO < 30 Sekunden). Das Datenvolumen wächst unvorhersehbar.

Welche Datenbanklösung erfüllt diese Anforderungen am BESTEN?

A) RDS MySQL Multi-AZ mit fünf Read Replicas  
B) Aurora MySQL mit Aurora-Replicas und Aurora Serverless v2  
C) RDS MySQL mit einem größeren Instanztyp (vertikale Skalierung)  
D) DynamoDB mit DynamoDB DAX für Lese-Caching

**Hinweis 1**: „RTO < 30 Sekunden“ – welcher Dienst erreicht das? Prüfen Sie das Failover-Timing für jede Option.

**Hinweis 2**: „Konsistente Leselatenz während Spitzen“ – die Replicas welches Dienstes haben nahezu null Verzögerung vs. potenziell Sekunden an Verzögerung?

**Hinweis 3**: „Unvorhersehbar wachsendes Datenvolumen“ – welcher Dienst skaliert den Speicher automatisch?

**Antwort**: B

**Erläuterung**: Aurora MySQL mit Aurora-Replicas bietet nahezu null Replikationsverzögerung (Millisekunden, nicht Sekunden) für konsistente Leseleistung unter Last. Aurora Serverless v2 skaliert Compute während Traffic-Spitzen automatisch, ohne überzubereitstellen. Aurora-Speicher skaliert automatisch, wenn die Daten wachsen. Aurora-Failover (Beförderung einer Replica) schließt in unter 30 Sekunden ab – erfüllt die RTO-Anforderung.

**Warum nicht A?** RDS-Multi-AZ-Failover dauert 60–120 Sekunden – erfüllt RTO < 30 Sekunden nicht. Die Verzögerung von Standard-RDS-Read-Replicas kann unter Last Sekunden erreichen – „konsistente“ Leselatenz ist schwerer zu garantieren.

**Warum nicht C?** Vertikale Skalierung (größere Instanz) erhöht die Kapazität, verteilt aber die Leselast nicht. Die Datenbank bleibt ein Single Point of Failure für Lesevorgänge.

**Warum nicht D?** DynamoDB ist NoSQL – die Migration von MySQL zu DynamoDB erfordert eine Neuarchitektur des Datenmodells und der Anwendungsabfragen, was weit über den Umfang dieser Performance-Verbesserungsaufgabe hinausgeht.

*SAA-C03-Domäne: Entwurf leistungsstarker Architekturen — Aufgabe 3.3*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus plant eine globale Expansion. Sie wollen, dass Restaurantpartner an der Ostküste, in Deutschland und in Australien ihre eigenen Bestelldaten schnell sehen, ohne regionsübergreifende Latenz. Allerdings müssen alle Schreibvorgänge über die einzige us-west-2-Primärinstanz gehen, um Konsistenz zu wahren.

Entwerfen Sie die Datenbankarchitektur mit Aurora. Wie würden Sie die Global Database strukturieren – zum Beispiel Sekundärcluster in us-east-1, eu-central-1 und ap-southeast-2? Was passiert, wenn die us-west-2-Primärinstanz ausfällt? Wie würden Sie den Beförderungsprozess handhaben?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, Multi-Region-Datenbankdesign zu üben.)*

## Post-Credits-Szene

Leo migrierte zu Aurora mit Serverless v2.

Die Freitagsspitze kam und ging. Die CPU überschritt nie 60 %. Die Abfragelatenz blieb konsistent. Aurora hatte automatisch hochskaliert, um die Last zu bewältigen, und dann nach dem Ansturm wieder heruntergeskaliert.

„Wie viel hat das im Vergleich zu letztem Freitag gekostet?“ fragte Tom am Montagmorgen.

Leo rief den Billing Explorer auf. „Freitag lag im Durchschnitt bei etwa 2,16 $/Stunde während des Abendhöhepunkts. Samstagmorgen waren es 0,24 $/Stunde.“

Tom sagte nichts.

„Das alte Setup war ein fester Betrag von 0,47 $/Stunde, unabhängig von der Last“, fügte Leo hinzu.

„Wir haben also während der Spitze mehr gezahlt als vorher“, sagte Tom.

„Ja. Aber deutlich weniger in der Schwachlastzeit. Die Nettokosten über die Woche sind niedriger.“

Tom rechnete. Dann nickte er.

„Hier steckt eine Lektion“, sagte er. „Die richtige Frage lautet nicht ‚ist das günstiger?‘. Sie lautet ‚ist das günstiger für unser tatsächliches Nutzungsmuster?‘.“

„Das“, sagte Priya von der anderen Seite des Raums, „ist der Instinkt eines erfahrenen Ingenieurs.“

Tom sah leicht beunruhigt aus, so beschrieben zu werden.

Im nächsten Kapitel: wenn Ihr Netzwerk der Engpass ist, und warum eine private Schnellstraße die Maut wert sein könnte.
