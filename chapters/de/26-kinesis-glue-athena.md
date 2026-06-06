# Kapitel 26: Alles verstehen

Tom starrte auf einen Ausdruck.

Es waren zwei Seiten mit Zahlen: Bestellanzahlen, Umsatzsummen, Zeitstempel, Regionscodes. Er hatte Leo gebeten, alles Verfügbare über die Bestellmuster vom Freitag zusammenzutragen. Leo hatte eine Stunde damit verbracht, ein Skript zu schreiben, das drei verschiedene Datenquellen verband – DynamoDB, CloudWatch-Logs und einen S3-Analyse-Export –, und das war dabei herausgekommen.

Die Zahlen waren alle da. Sie sagten ihm nichts.

Er konnte sehen, dass am Freitag 847 Bestellungen aufgegeben worden waren. Er konnte nicht erkennen, wann sie aufgegeben wurden, welche Restaurants am beschäftigtsten gewesen waren oder was die Hauptverkehrsstunde war. Diese Information steckte in den Daten. Sie war nur unsichtbar.

---

Die gesamte Netzwerkoptimierung aus Kapitel 25 hatte Nimbus' Infrastruktur schneller und günstiger gemacht. Aber die Daten, die diese Infrastruktur erzeugte – in DynamoDB, in CloudWatch-Logs, im S3-Analyse-Export, der einmal pro Nacht lief –, lagen an drei verschiedenen Orten, in drei verschiedenen Formaten, mit nichts verbunden, das Tom tatsächlich nutzen konnte.

Mayas Frage machte es konkret. „Was ist unsere geschäftigste Bestellzeit an Freitagen?“

Leo sah sie an. „Das ist nicht in unserem Dashboard.“

„Können wir es hinzufügen?“

„Die Daten sind in DynamoDB. Und in CloudWatch-Logs. Und in S3 aus dem Analyse-Export-Job.“ Leo hielt inne. „An drei verschiedenen Orten, in drei verschiedenen Formaten.“

Maya fügte hinzu: „Und der Analyse-Export läuft nur einmal pro Nacht. Wenn man Freitagsdaten will, müsste man bis Samstagmorgen warten.“

Tom betrachtete den Ausdruck. „Wir haben also die Daten. Wir können sie nur nicht nutzen.“

Dieser Satz beschreibt die Hälfte der modernen Analytik.

---

**Das Whiteboard**

Maya kam früh ins Büro und hatte das halbe Whiteboard bereits gefüllt, als Leo eintraf.

Sieben Fragen, in zwei Spalten geschrieben, alle Geschäftsfragen, keine davon mit den aktuellen Dashboards beantwortbar:

1. Welche Restaurants haben in den ersten 30 Tagen die höchste Bestellstornierungsrate?
2. Wie hoch ist die durchschnittliche Zeit zwischen dem Erhalt einer Bestellbenachrichtigung durch ein Restaurant und der Bestätigung? Wie variiert dies nach Restaurant und nach Wochentag?
3. Welche Städte haben die höchste Rate von Kunden, die innerhalb von 14 Tagen erneut beim selben Restaurant bestellen?
4. Welcher Prozentsatz der Bestellungen wird in der ersten Sitzung der App vs. in Folgesitzungen aufgegeben?
5. Welche Menükategorien treiben den höchsten Umsatz pro Restaurant?
6. Wie ist die Korrelation zwischen der Antwortzeit eines Restaurants und der Wiederbestellrate der Kunden?
7. Wie ändert sich das Bestellvolumen in den 48 Stunden vor und nach einem Social-Media-Post eines Restaurantpartners?

„Können wir irgendeine davon beantworten?“ fragte sie.

Leo betrachtete die Liste. Er betrachtete das aktuelle Dashboard – Bestellanzahl, Umsatzsumme, aktive Restaurants.

„Nummer eins“, sagte er langsam. „Teilweise. Wir haben Stornierungsaufzeichnungen. Aber wir müssten sie mit den Onboarding-Daten der Restaurants verbinden, und die sind in einem anderen System.“

„Nummer zwei?“ fragte Tom.

„Wir speichern den Benachrichtigungszeitstempel. Wir speichern den Bestätigungszeitstempel. Sie sind in verschiedenen Tabellen in verschiedenen Formaten. Wir müssten sie per JOIN verbinden und das Delta berechnen.“

„Die Daten existieren also“, sagte Maya.

„Die Daten existieren“, bestätigte Leo. „Wir haben nur keine Möglichkeit, übergreifend abzufragen.“

„Moment – aber *warum* können wir nicht einfach die Datenbank abfragen?“ fragte Maya. „Wir haben PostgreSQL. Wir haben all diese Daten.“

„Weil die Daten an drei Orten sind“, sagte Leo. „Bestellereignisse sind in DynamoDB. Benachrichtigungszeitstempel sind in CloudWatch-Logs. Onboarding-Daten sind in der RDS-PostgreSQL-Datenbank. Und ein Teil davon – die Analyse-Exporte – ist in S3 als JSON-Dateien, die noch nie jemand mit irgendetwas verbunden hat.“

Tom betrachtete das Whiteboard. „Wir erzeugen diese Daten seit 18 Monaten“, sagte er. „Wir fliegen seit 18 Monaten blind.“

„Nicht blind“, sagte Maya. „Nur kurzsichtig. Wir konnten sehen, was direkt vor uns war. Wir konnten keine Muster sehen.“

Das war die richtige Einordnung. Die einzelnen Datenpunkte waren da. Das System, sie zu verbinden, war es nicht.

**Drei verschiedene Probleme**

Nimbus' Datenproblem hatte drei Dimensionen:

**Echtzeit-Streaming**: Gerade jetzt werden Bestellungen aufgegeben. Sie wollen ein Live-Dashboard der Bestellgeschwindigkeit sehen – wie viele pro Minute, nach Region, nach Restaurant. Die Daten müssen verarbeitet werden, während sie eintreffen.

**Datentransformation**: Die Daten sind aus verschiedenen Systemen in S3, in verschiedenen Formaten (JSON, CSV, Parquet). Bevor Sie sie analysieren können, müssen Sie sie normalisieren – gleiches Schema, gleiches Format, bereinigt, mit Referenzdaten verbunden.

**Ad-hoc-Analyse**: Sobald die Daten organisiert sind, wollen Sie SQL-Abfragen gegen sie ausführen, ohne sie zuerst in eine Datenbank laden zu müssen. „Gib mir die Top-10-Restaurants nach Umsatz in den letzten 30 Tagen.“ Ohne die Daten in eine Datenbank zu laden.

Jedes davon ist ein eigenes Problem. AWS hat für jedes einen dedizierten Dienst.

**Der Echtzeit-Stream: Ein Börsenticker für Daten**

Stellen Sie sich eine Börsenticker-Maschine vor – die Art, die Aktienkurse auf eine durchgehende Papierrolle druckte. Kurse wurden gedruckt, sobald sie sich änderten. Jeder, der den aktuellen Kurs wollte, konnte das Band lesen. Niemand musste auf jemand anderen warten; das Band druckte weiter, unabhängig davon, wie viele Leute lasen.

Das ist das Modell für Echtzeit-Daten-Streaming. Produzenten senden Daten, sobald sie geschehen. Mehrere Konsumenten können den Stream gleichzeitig lesen, jeder in seinem eigenen Tempo, jeder erhält das vollständige Bild.

**Amazon Kinesis Data Streams** ist diese Maschine für Nimbus. Wenn eine Bestellung aufgegeben wird, veröffentlicht die Anwendung ein Ereignis in einem Kinesis-Stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Konsumenten dieses Streams:

- Ein Echtzeit-Dashboard (liest Ereignisse, sobald sie eintreffen, aktualisiert Metriken)
- Eine Betrugserkennungs-Lambda (sucht nach ungewöhnlichen Bestellmustern)
- Ein Stream nach S3 zur dauerhaften Speicherung

**Kinesis-Data-Streams-Konzepte**:

- **Shard**: Die grundlegende Kapazitätseinheit. Ein Shard bewältigt 1 MB/s Schreiben, 2 MB/s Lesen.
- **Aufbewahrungszeitraum**: Daten bleiben 24 Stunden im Stream (Standard), erweiterbar auf **365 Tage** (1 Jahr) mit Extended Data Retention.
- **Sequenznummer**: Jeder Datensatz hat eine Sequenznummer. Konsumenten verfolgen ihre Position im Stream.

**Amazon Data Firehose** (früher **Kinesis Data Firehose**): Der verwaltete Zustelldienst zwischen Streaming-Produzenten und Zielen wie S3, Redshift und OpenSearch. Er puffert, komprimiert, transformiert und liefert Daten automatisch.

Für Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet-Format, komprimiert, nach Datum partitioniert).

„Ich habe es schon deployed – oh.“ Leo hatte die Shard-Anzahl auf eins gesetzt, ohne zuerst den Schreibdurchsatz zu berechnen. Bei Nimbus' Bestellvolumen war ein Shard in Ordnung. Er bestätigte das, bevor jemand bemerkte, dass er geraten hatte.

**Der Übersetzer: Rohdaten verständlich machen**

Daten in S3 sind roh. Bevor Sie sie effizient analysieren können, müssen Sie herausfinden, was da ist, sie in ein konsistentes Format transformieren, verschiedene Datensätze zusammenführen und fehlerhafte Datensätze sowie fehlende Werte behandeln.

Das ist eine Aufgabe für eine dedizierte Übersetzungsschicht.

**AWS Glue** ist ein vollständig verwalteter ETL-Dienst (Extract, Transform, Load). Er hat zwei Hauptkomponenten:

**Glue Data Catalog**: Ein Metadatenspeicher, der Ihre S3-Daten beschreibt – welche Tabellen existieren, welche Spalten sie haben, wo die Datendateien sind. Es ist wie ein Zettelkatalog für Ihren Data Lake.

**Glue Crawler**: Automatisierte Agenten, die S3 scannen, das Schema ableiten und den Data Catalog befüllen. Lassen Sie einen Crawler auf Ihrem S3-Bucket laufen, und 10 Minuten später haben Sie einen Katalog all Ihrer Tabellen.

**Glue Jobs**: Serverlose Spark-/Python-Jobs, die die eigentliche Transformation durchführen. Sie schreiben die Transformationslogik (oder verwenden Glues visuelles ETL-Tool), und Glue führt sie auf verwalteter Infrastruktur aus.

Für Nimbus:

1. Glue Crawler scannt die Bestelldaten in S3 → erstellt eine Tabellendefinition im Glue Data Catalog
2. Glue Job transformiert die rohen JSON-Bestellereignisse in ein sauberes, partitioniertes Parquet-Format
3. Die transformierten Daten werden in einem abfrageoptimierten Layout zurück nach S3 geschrieben

**Wenn ETL kaputtgeht: Das Schema-Evolutionsproblem**

Die Glue-Pipeline lief die ersten drei Wochen sauber. Dann fügte Restaurantpartner Nr. 412 ein neues Feld zu seinem Menü-Export hinzu: `allergen_tags`. Das Feld war ein Array von Strings – `["gluten", "dairy", "nuts"]` – und es erschien im nächtlichen Datenexport des Restaurants.

Das Schema des Glue-Jobs war strikt. Es war geschrieben worden, um bestimmte Felder im Bestell-JSON zu erwarten. Als es auf `allergen_tags` stieß – ein Feld, das nicht im Schema war –, schlug der Glue-Job fehl.

Sechs Stunden Bestelldaten von 47 Restaurants (alle mit demselben Menü-Exportformat wie Partner Nr. 412) sammelten sich in S3 an, ohne verarbeitet zu werden. Der nächtliche Glue-Lauf, der die Bestellungen der letzten Nacht bis zum Morgen abfragbar machen sollte, hatte stattdessen um 2:47 Uhr gestoppt und einen Fehlerdatensatz nach CloudWatch geschrieben.

Tom fand es, als er um 9 Uhr versuchte, eine Athena-Abfrage auszuführen, und `0 rows returned` für die vorherigen 12 Stunden erhielt.

„Das ETL ist kaputtgegangen, weil sich die Quelldaten geändert haben?“ fragte Maya, als Leo erklärte, was passiert war.

„Das ETL ist kaputtgegangen, weil das ETL nicht wusste, wie es mit einer Schemaänderung umgehen sollte“, sagte Leo. „Wir haben einen strikten Job geschrieben, der genau diese Felder erwartete. Als ein neues Feld auftauchte, geriet er in Panik.“

„Und was, wenn jemand über eine Schemaänderung einzubrechen versucht?“ fragte Priya. „Ein böswilliger Restaurantpartner, der absichtlich unerwartete Felder einreicht, um die Pipeline zum Absturz zu bringen?“

Die Frage war eine Überlegung wert. Eine ETL-Pipeline, die bei unerwartetem Input abstürzt, ist ein Denial-of-Service-Vektor: Reichen Sie ein ungewöhnliches Datenformat ein, bringen Sie die Pipeline zum Absturz, und dieses Restaurant (und alle anderen, die das Format teilen) hört auf zu verarbeiten.

Die Lösung hatte zwei Teile:

**Glue-Schema-Evolution**: Glues DynamicFrame unterstützt Schema-Evolution – Felder, die nicht im erwarteten Schema sind, werden durchgereicht, statt Fehler zu verursachen. Aktivieren Sie es, indem Sie im Job-Skript DynamicFrames statt DataFrames verwenden, mit `mergeSchema` in den zusätzlichen Optionen. Neue Felder werden beim nächsten Crawler-Lauf automatisch zum Schema hinzugefügt.

```python
# Vorher (strikt, bricht bei neuen Feldern)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Nachher (Schema-Evolution aktiviert)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Glue-Job-Alarmierung**: Der Pipeline-Ausfall war etwa sechs Stunden lang still, bevor Tom es bemerkte. Ein CloudWatch-Alarm auf den Lauf-Status des Glue-Jobs (`FAILED`) hätte den Bereitschaftsingenieur innerhalb von 5 Minuten alarmiert. Die Alarmkosten: zehn Cent im Monat – praktisch kostenlos (die Metrik selbst kostet nichts, und die ersten zehn Alarme fallen unter die kostenlose Stufe).

„Sechs Stunden Daten lagen unverarbeitet in S3“, sagte Leo, nachdem er den Glue-Job manuell erneut ausgeführt hatte, um aufzuholen. „Nichts ging verloren – aber die Analysen waren so weit hinterher. Hätten wir den Alarm gehabt, wäre die Verzögerung 30 Minuten gewesen.“

Die übergeordnete Lektion: ETL-Pipelines, die externe Daten verarbeiten, müssen mit Schemaänderungen elegant umgehen. Externe Partner – Restaurants, Zahlungsanbieter, Lieferdienste – werden ihre Datenformate ändern. Die Pipeline darf gegenüber diesen Änderungen nicht spröde sein.

**Die Abfrageschicht: SQL direkt auf S3**

Jetzt waren die Daten in S3, im Parquet-Format, nach Datum partitioniert. Das letzte Stück: eine Möglichkeit, Fragen daran zu stellen, ohne sie zuerst in eine Datenbank zu laden.

**Amazon Athena** ist ein serverloser, interaktiver Abfragedienst, der SQL-Abfragen direkt auf S3-Daten ausführt. Keine Datenbank bereitzustellen, keine Daten zu laden. Sie definieren eine Tabelle (oder verwenden den Glue Data Catalog), schreiben SQL, und Athena führt die Abfrage gegen die S3-Dateien aus.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Athenas Preisgestaltung basiert darauf, wie viele Daten eine Abfrage scannt. In us-east-1, us-west-2 und den meisten wichtigen Regionen kosten Standard-SQL-Abfragen 5 $ pro gescanntem Terabyte. Die Verwendung des Parquet-Formats (spaltenorientiert) mit Partition-Pruning (`WHERE year='2024' AND month='09'`) bedeutet, dass Athena nur die benötigten Dateien scannt, was die Kosten dramatisch reduziert.

„Wir können diese Abfrage für 30 Tage Daten ausführen“, sagte Leo, „und es kann überraschend wenig kosten, wenn wir sie gut speichern.“

„Wie kann es so wenig kosten?“ fragte Maya. „Wenn es Terabytes an Daten scannt, wie ist das nicht teuer?“

Leo erklärte Parquet. In einem zeilenbasierten Format (JSON, CSV) muss eine Abfrage, die zwei von zwanzig Spalten sucht, alle zwanzig lesen. In einem spaltenorientierten Format wie Parquet liest sie nur die zwei, die sie braucht. Für einen 50-TB-Datensatz könnte eine gut optimierte Abfrage 200 GB scannen. Bei 5 $/TB ist das ein Dollar.

„Und was, wenn jemand die ganze Tabelle versehentlich abfragt?“ hakte Maya nach.

„Das ist das echte Kostenrisiko“, sagte Leo.

Sie fragen sich vielleicht: Wenn Athena pro gescanntem Terabyte berechnet, könnte eine schlecht geschriebene Abfrage eine große unerwartete Rechnung erzeugen? Ja – und das passiert in echten Produktionsumgebungen. Eine Abfrage gegen eine 50-TB-unoptimierte-Tabelle kann mehr kosten als Ihre gesamte monatliche S3-Rechnung. Deshalb sind das Parquet-Format und die Partitionierung keine optionalen Optimierungen – sie sind die Kostenkontrollen. Athena unterstützt auch Workgroup-Abfrage-Scan-Limits, die begrenzen, wie viele Daten eine einzelne Abfrage scannen darf.

„Für jede beliebige Frage, die uns einfällt?“ fragte Tom.

„Jede Frage, die wir in SQL ausdrücken können, gegen alle Daten, die wir in S3 gespeichert haben.“

Tom setzte sich an Leos Laptop und schrieb die erste Abfrage:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

Die Abfrage lief 11 Sekunden. Das Ergebnis: 20 Restaurants, sortiert nach schnellster durchschnittlicher Bestätigungszeit, mit ihren Wiederbestellraten daneben.

Tom starrte auf die Ausgabe.

Die am schnellsten bestätigenden Restaurants – jene, die Bestellungen im Durchschnitt innerhalb von 3–4 Minuten quittierten und bestätigten – hatten eine durchschnittliche Wiederbestellrate von 41 %. Die am langsamsten bestätigenden Restaurants (durchschnittliche Bestätigungszeit 18–22 Minuten) hatten eine Wiederbestellrate von 13 %.

„Die Restaurants, die schnell bestätigen, bekommen dreimal so viel Folgegeschäft“, sagte Tom.

„Das ist eine riesige Lücke“, sagte Maya. „Warum sollte die Bestätigungsgeschwindigkeit die Wiederbestellrate so stark beeinflussen?“

„Weil der Kunde eine Bestellung aufgegeben hat und dann dasaß und auf sein Handy starrte“, sagte Leo. „Wenn die Bestätigung in 3 Minuten kommt, fühlt er sich sicher. Wenn sie in 22 Minuten kommt – oder nie –, fühlt er sich beunruhigt. Die Beunruhigung ist das Produktversagen, selbst wenn das Essen einwandfrei ankommt.“

„Das ist eine Produkterkenntnis“, sagte Maya. „Nicht nur eine Analyseerkenntnis. Wir sollten Restaurants ihren Bestätigungszeit-Benchmark im Vergleich zum Kategoriedurchschnitt zeigen.“

Die Athena-Abfrage hatte 1,2 GB Daten gescannt (zwei Monate Bestellungen im Parquet-Format, nach Jahr und Monat partitioniert). Kosten: 0,006 $.

Ein halber Cent. Für eine geschäftliche Erkenntnis, die änderte, wie Nimbus das Restaurant-Onboarding gestalten würde – welche Restaurants man für Erfolgs-Coaching priorisiert, welche Bestätigungszeit-Ziele man als Teil der Partner-SLAs setzt.

Tom hatte den Blick von jemandem, der den Wert all der Daten neu berechnet, die sie weggeworfen hatten.

„Und was, wenn jemand über die Abfrageschicht einzubrechen versucht?“ fragte Priya. „Oder einfach ein Analyst, der versehentlich Kundenadressen aus den rohen Bestelldaten exportiert? Kunden-PII, Bestellhistorien, Finanzunterlagen – wer kontrolliert, welche Tabellen überhaupt sichtbar sind?“

Bevor sie die Frage beendete, hatte Leo auch das operative Problem erkannt: Wie hält man ein Team davon ab, einen katastrophalen Full-Table-Scan auszuführen, der in einer einzelnen Abfrage eine 500-$-Athena-Rechnung erzeugt?

**Athena-Workgroups** lösen beide Probleme gleichzeitig.

Eine Workgroup ist eine benannte Konfiguration, die Athena-Nutzer gruppiert und gemeinsame Einstellungen anwendet: Abfrageergebnis-Speicherort, Verschlüsselung und – entscheidend – Datenscan-Limits pro Abfrage.

```
Workgroup: analytics-team
  Query scan limit: 10 GB per query
  Action on limit exceeded: Cancel query

Workgroup: engineering-team
  Query scan limit: 100 GB per query
  Action on limit exceeded: Warn only

Workgroup: finance-reports
  Query scan limit: 1 GB per query
  Action on limit exceeded: Cancel query
```

Ein Analyst in der `analytics-team`-Workgroup kann nicht versehentlich 50 TB Daten scannen und eine 250-$-Athena-Gebühr erzeugen. Die Abfrage wird abgebrochen, wenn sie 10 GB gescannte Daten überschreiten würde. Der Analyst sieht eine Fehlermeldung und weiß, dass er einen Partitionsfilter hinzufügen muss.

Workgroups erzwingen auch separate Ergebnis-Speicherorte pro Team: Die Abfrageergebnisse des Engineering-Teams gehen nach `s3://nimbus-query-results/engineering/`; die Ergebnisse des Finance-Teams gehen nach `s3://nimbus-query-results/finance/`. Kein teamübergreifender Zugriff auf Abfrageergebnisse.

IAM steuert, welche Nutzer welche Workgroup verwenden können. Eine Lambda-Funktion, die automatisierte Berichte ausführt, verwendet die `finance-reports`-Workgroup (eng gedeckelt). Ein Ingenieur, der ein Produktionsproblem debuggt, verwendet die `engineering-team`-Workgroup (weiteres Limit, warnen statt abbrechen). Der Zugriff auf die rohe Ereignistabelle (die Kunden-PII enthält) ist über eine IAM-Bedingung auf der Glue-Data-Catalog-Tabelle auf die `engineering-team`-Workgroup beschränkt.

„Das ist nicht nur Kostenkontrolle“, sagte Priya. „Das ist Zugriffskontrolle. Workgroups sind der Durchsetzungspunkt.“

Es beantwortete ihre Frage vollständig. Jede Datenpipeline-Diskussion, die die Zugriffskontrolle überspringt, wird irgendwann zu einem Compliance-Vorfall – und hier sah das Analyseteam nur aggregierte Bestelltabellen, während die rohen Ereignisse mit Kunden-PII hinter einer expliziten IAM-Autorisierung blieben. Der Glue Data Catalog war nicht nur ein Schema-Verzeichnis. Er war eine Zugriffskontrollgrenze.

„Das ist keine zusätzliche Arbeit“, sagte Priya. „Das ist das Design.“

**Die Data-Lake-Architektur**

Diese drei Dienste kombinieren sich zu dem, was man eine **Data-Lake-Architektur** nennt – ein zentralisiertes S3-Repository für all Ihre Daten, mit Werkzeugen zu ihrer Verarbeitung und Abfrage:

```
Applications (orders, menus, events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler discovers schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform
                                                   ↓
                                              S3 (clean, Parquet, partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight, Tableau, etc.)
```

Die Rohdaten bleiben immer erhalten (im ursprünglichen S3-Bucket). Die transformierten Daten sind über Athena abfragbar. Neue Fragen können immer beantwortet werden, indem neue Glue-Jobs auf den Rohdaten ausgeführt werden.

**Amazon Redshift: Wenn Athena nicht ausreicht**

Für manche Anwendungsfälle ist Athena zu langsam oder zu teuer:

- Sehr komplexe Abfragen mit vielen Joins
- Dashboards, die dieselbe Abfrage tausende Male pro Tag ausführen
- Machine Learning auf strukturierten Daten
- Anforderungen an eine Antwortzeit unter einer Sekunde für BI-Tools

**Amazon Redshift** ist ein vollständig verwaltetes Data Warehouse: eine spaltenorientierte Analysedatenbank, die für große, wiederholte analytische Workloads konzipiert ist. Anders als Athena, das Daten dort abfragt, wo sie in S3 liegen, lädt Redshift Daten in optimierten Warehouse-Speicher und verwendet Abfrageoptimierung, Sortierstrategien und Verteilungsstrategien, um komplexe Analysen zu beschleunigen.

Wenn Ihr Datenvolumen klein ist und Ihre Abfragen selten laufen (wöchentlich oder monatlich), ist Athena mit gut organisierten S3-Daten ausreichend und nahezu kostenlos – aber wenn Sie dieselben analytischen Dashboards hunderte Male pro Tag ausführen, wird Redshifts vor-optimierter spaltenorientierter Speicher schneller und letztlich kosteneffektiver sein, obwohl er erfordert, dass Daten im Voraus geladen werden.

Redshift ist für komplexe Analyseabfragen deutlich schneller, auf Kosten von (bereitgestellter Kapazität) und der Anforderung, Daten vor der Abfrage zu laden.

**Redshift Serverless** nimmt die Last der Kapazitätsplanung ab – Sie fragen ab, Redshift skaliert. Die Kosten basieren auf der tatsächlich genutzten Compute-Kapazität, gemessen in **RPU-Stunden** und sekundengenau abgerechnet (mit einem 60-Sekunden-Minimum pro Aktivierung), plus verwaltetem Speicher pro GB-Monat – und nichts für Compute, während das Warehouse im Leerlauf ist. (Athena ist der eine, der pro Abfrage berechnet wird: 5 $ pro gescanntem TB.)

Für Nimbus in ihrer aktuellen Größenordnung: Athena ist ausreichend. Beim Fünffachen des Datenvolumens und mit BI-Tools, die dieselben Dashboards hunderte Male pro Tag abfragen, würde Redshift kosteneffektiv werden.

**Wann Athena das falsche Werkzeug ist**

„Also wo ist der Haken?“ fragte Maya. „Warum sollten wir nicht Athena für alles verwenden? Es ist serverlos, Zahlung pro Abfrage, keine Infrastruktur – es klingt perfekt.“

Die Fälle, in denen Athena nicht die richtige Antwort ist:

**Hochfrequente Dashboards**: Ein kundenseitiges Analyse-Dashboard, das sich alle 30 Sekunden aktualisiert und 50 Abfragen pro Minute ausführt, ist kein guter Athena-Anwendungsfall. Bei 5 $/gescanntem TB müssen diese Abfragen extrem gut optimiert sein, um bei dieser Frequenz kosteneffektiv zu sein. Redshift oder eine vor-aggregierte Datenbank (sogar RDS) ist für Dashboards mit Antwortzeitanforderungen unter einer Sekunde angemessener.

**Operative Abfragen mit niedrigen Latenzanforderungen**: Wenn ein Kundendienstmitarbeiter eine bestimmte Bestellung in unter 500 ms nachschlagen muss, ist Athena nicht das Werkzeug – eine DynamoDB-Abfrage oder eine RDS-Abfrage ist es. Athena ist für analytischen Durchsatz optimiert, nicht für operative Latenz. Selbst eine gut abgestimmte Athena-Abfrage auf einem kleinen Datensatz hat einen Kaltstart-Overhead von 1–3 Sekunden.

**Transaktionssysteme**: Athena ist nur lesend. Sie können keine Datensätze in Athena INSERTEN, UPDATEN oder DELETEN (außer über spezifische Integrationen wie Lake Formation oder das Iceberg-Tabellenformat, die ihre eigene Komplexität haben). Für operative Schreib-Workloads verwenden Sie eine Transaktionsdatenbank.

**Sehr kleine, sich häufig ändernde Datensätze**: Wenn sich Ihr Datensatz jede Minute ändert und nur 1 GB groß ist, ist das Laden in RDS oder DynamoDB und das dortige Abfragen einfacher und schneller als Athena-Abfragen gegen S3-Dateien, die möglicherweise veraltet sind. Athena fragt S3-Dateien zum Zeitpunkt der Abfrage ab – wenn die Dateien vor 2 Minuten geschrieben wurden, ist das die Aktualität, die Sie bekommen.

Das sich abzeichnende Muster: Athena ist ausgezeichnet für großskalige, seltene, Ad-hoc-Analyseabfragen gegen S3-Daten. Für alles Operative, Transaktionale oder mit Anforderung an Latenz unter einer Sekunde verwenden Sie die passende operative Datenbank.

**Kinesis vs. SQS: Die Verwirrung auflösen**

Das ist die Frage, die in jeder Datenarchitektur-Diskussion aufkommt. Kinesis und SQS befassen sich beide mit Nachrichten. Wann verwendet man jedes?

Die Verwirrung kommt von der oberflächlichen Ähnlichkeit: Beide nehmen Nachrichten von Produzenten an. Beide liefern diese Nachrichten an Konsumenten. Beide sind verwaltete AWS-Dienste. Aber ihre Datenmodelle sind grundlegend verschieden.

**SQS (Simple Queue Service)** ist eine Aufgabenwarteschlange. Sie legen eine Nachricht hinein. Ein Konsument holt sie heraus und verarbeitet sie. Wenn die Verarbeitung abgeschlossen ist, wird die Nachricht gelöscht. Wenn Sie zehn Konsumenten haben, geht jede Nachricht an genau einen von ihnen. Die Nachricht ist nach dem Konsum weg.

**Kinesis Data Streams** ist ein Log. Sie legen einen Datensatz hinein. Jeder Konsument liest jeden Datensatz. Konsument A liest sie alle. Konsument B liest sie auch alle, in seinem eigenen Tempo. Keiner der Konsumenten löscht den Datensatz – er bleibt im Stream, bis der Aufbewahrungszeitraum abläuft. Sie können jederzeit einen dritten Konsumenten hinzufügen, und er kann vom Anfang des Streams lesen (innerhalb des Aufbewahrungsfensters).

„Wann würde man tatsächlich wollen, dass jeder Konsument jede Nachricht sieht?“ fragte Maya.

Die Antwort sind die Anwendungsfälle, in denen Kinesis glänzt:

**Echtzeit-Dashboard + Betrugserkennung + S3-Archiv**: Alle drei konsumieren gleichzeitig denselben Bestellereignis-Stream. Wenn Sie SQS verwenden würden, müssten Sie in drei separate Warteschlangen veröffentlichen – und wer veröffentlicht, muss alle drei Konsumenten kennen. Mit Kinesis veröffentlicht der Produzent einmal; eine beliebige Anzahl von Konsumenten kann unabhängig lesen.

**Replay**: Ein Konsument fällt 2 Stunden lang aus (Lambda-Parallelitätslimit erreicht, nachgelagerter Dienst ausgefallen). Mit SQS waren diese Nachrichten bereits gelöscht (oder haben einen definierten Visibility Timeout). Mit Kinesis nimmt der Konsument von seinem letzten Checkpoint wieder auf und verarbeitet die 2 Stunden verpasster Datensätze. Die Daten wurden im Stream aufbewahrt (bis zu 365 Tage mit Extended Data Retention).

**Reihenfolge innerhalb eines Shards**: Datensätze mit demselben Partitionsschlüssel gehen immer an denselben Shard, was die Reihenfolge bewahrt. Für ein Aktienhandelssystem, bei dem alle Trades für das Symbol `AMZN` in Reihenfolge verarbeitet werden müssen, garantiert Kinesis dies. SQS FIFO bietet Reihenfolge pro Gruppe, aber bei niedrigerem Durchsatz (bis zu 3.000 Nachrichten/Sekunde pro Warteschlange mit Batching im Standardmodus – der High-Throughput-Modus erhöht dies auf Zehntausende – gegenüber Kinesis' 1 MB/s oder 1.000 Datensätzen/s pro Shard, multipliziert mit so vielen Shards, wie Sie brauchen).

Die entscheidende Frage: **Muss jede Nachricht von genau einem Konsumenten konsumiert und dann verworfen werden?** → SQS. **Muss jede Nachricht von mehreren Konsumenten unabhängig gesehen werden, oder brauchen Sie Replay-Fähigkeit?** → Kinesis.

Für Nimbus' Echtzeit-Dashboard: Kinesis. Mehrere Konsumenten (Dashboard, Betrugserkennung, S3-Archiv) lesen alle denselben Stream.

Für Nimbus' Bestellverarbeitungs-Warteschlange (eine Bestellung wird aufgegeben → ein ECS-Task verarbeitet sie): SQS. Ein Konsument, kein Replay nötig, kein Fan-out erforderlich.

## Die Daten visualisieren: Amazon QuickSight

Athena fragt die Daten ab. Glue bereitet sie auf. Aber irgendwann muss jemand ein Diagramm sehen – und nicht durch das Ausführen von SQL-Abfragen in der Konsole.

„Brauchen wir wirklich noch einen Dienst dafür?“ fragte Maya. „Kann ich nicht einfach die Athena-Ergebnisse in eine Tabelle exportieren?“

„Für eine Abfrage, ja“, sagte Tom. Er hatte den Blick von jemandem, der das bereits versucht hatte. „Für ein Dashboard, das man mit dem ganzen Team teilen will, ist das jeden Morgen eine neue Tabelle.“

**Amazon QuickSight** ist AWS' verwalteter Business-Intelligence-Dienst (BI). Er verbindet sich direkt mit Athena, S3, RDS, Redshift und anderen Quellen und lässt Sie Dashboards und Visualisierungen ohne separaten BI-Server erstellen.

Wichtige Funktionen:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight kann Datensätze in seine In-Memory-Engine importieren für Abfrageleistung unter einer Sekunde in großem Maßstab, ohne Athena bei jedem Dashboard-Laden erneut abzufragen
- **ML Insights:** Anomalieerkennung und Prognosen eingebaut – keine Data Science erforderlich
- **Eingebettete Dashboards:** Sie können QuickSight-Dashboards über eine URL in Ihre eigene Webanwendung einbetten

Tom verband QuickSight mit der Athena-Datenquelle und hatte innerhalb eines Nachmittags ein funktionierendes Dashboard, das tägliche Bestellungen, Umsatz nach Restaurant und den Conversion-Funnel zeigte.

„Wie viel kostet das pro Monat?“ fragte er – und beantwortete dann seine eigene Frage, bevor jemand anderes konnte. „QuickSight kostet etwa 24 $/Monat pro Author – die Leute, die Dashboards bauen – und 3 $/Monat pro Reader. Wir haben vier Leute, die es nutzen würden.“

„Also etwa hundert Dollar im Monat“, sagte Maya.

„Für einen BI-Dienst, der sonst das Betreiben eines separaten Analyseservers erfordern würde“, sagte Priya. „Ja.“

Tom veröffentlichte das Dashboard. Am nächsten Morgen öffnete das ganze Team, statt Athena-Abfragen auszuführen, eine URL.

> **Examenstipp — QuickSight**
>
> QuickSight ist AWS' verwalteter BI- und Visualisierungsdienst. Verbindet sich mit Athena, S3, Redshift, RDS. SPICE ist die In-Memory-Abfrage-Engine, die wiederholte Dashboard-Abfragen beschleunigt. Examensauslöser: „Business-Intelligence-Dashboard auf AWS“ oder „Daten aus Athena/Redshift visualisieren“ → QuickSight.

## Den Lake regieren: AWS Lake Formation

Als Nimbus' Data Lake wuchs, wurde der Datenzugriff zu einem Governance-Problem.

„Wer kann die rohen Transaktionslogs abfragen?“ fragte Priya beim nächsten Architektur-Review. „Wer kann Kunden-PII sehen? Wer kann auf die Finanzzusammenfassungstabellen zugreifen?“

„Engineering hat vollen Zugriff“, sagte Leo. „Das Analyseteam hat Zugriff auf die aggregierten Tabellen. Finance hat Zugriff auf die Umsatztabellen.“

„Konfiguriert wo?“

Leo hielt inne. „An... ein paar verschiedenen Orten. Den S3-Bucket-Richtlinien, den IAM-Richtlinien, den Glue-Catalog-Berechtigungen.“

„Drei separate Systeme, die alle konsistent sein müssen“, sagte Priya. „Was passiert, wenn wir einen neuen Analysten hinzufügen? Oder wenn wir entscheiden, den Zugriff auf eine bestimmte Spalte – sagen wir, Kundentelefonnummern – für das Analyseteam einzuschränken?“

Diese Frage legte die Lücke offen. Die Verwaltung des feingranularen Datenzugriffs über S3-Bucket-Richtlinien, IAM und den Glue Data Catalog gleichzeitig war spröde.

**AWS Lake Formation** ist ein verwalteter Dienst, der die Zugriffskontrolle für Ihren Data Lake zentralisiert. Statt Bucket-Richtlinien, IAM-Richtlinien und Glue-Catalog-Berechtigungen separat zu verwalten, bietet Lake Formation einen einzigen Ort, um Berechtigungen auf Spalten-, Zeilen- und Tabellenebene für Ihre Daten zu gewähren.

Wichtige Funktionen:

- Sitzt auf S3 und dem Glue Data Catalog – keine Datenmigration erforderlich
- **Feingranulare Zugriffskontrolle:** bestimmten Nutzern oder Rollen Zugriff auf bestimmte Tabellen, Spalten oder sogar gefilterte Zeilen gewähren – das Äquivalent von Berechtigungen auf Datenbankebene für S3-Daten
- **Datenfilterung:** Wenn ein Nutzer eine Lake-Formation-verwaltete Tabelle über Athena abfragt, filtert Lake Formation automatisch Spalten oder Zeilen heraus, die er nicht sehen darf

Priya richtete Lake Formation mit drei Berechtigungsstufen ein, wobei Rafael die Regeln auf Spaltenebene entwarf: Die Engineering-Rolle sah alle Tabellen und alle Spalten. Die Analyse-Rolle sah die aggregierten Bestelltabellen, aber keine Kunden-PII-Spalten. Die Finance-Rolle sah Umsatztabellen mit maskierten Kundenidentifikatoren.

„Der Analyst führt also dieselbe Athena-Abfrage aus“, bestätigte Leo. „Aber Lake Formation fängt sie ab und entfernt die Spalten, für die er nicht autorisiert ist?“

„Korrekt. Die Filterung ist automatisch. Der Analyst muss nicht wissen, dass es passiert – und er kann es nicht umgehen, indem er die rohen S3-Dateien direkt abfragt, weil Lake Formation den Zugriff auf Catalog-Ebene kontrolliert.“

„Das ist keine zusätzliche Arbeit“, sagte Priya. „Das ist das Design.“

> **Examenstipp — Lake Formation**
>
> Lake Formation zentralisiert die Zugriffskontrolle für einen Data Lake, der auf S3 und dem Glue Data Catalog aufgebaut ist. Unterstützt feingranulare Berechtigungen auf Tabellen-, Spalten- und Zeilenebene. Examensauslöser: „Zugriff auf bestimmte Spalten in einem S3-Data-Lake einschränken“ oder „Data-Lake-Governance zentralisieren“ → Lake Formation. Der entscheidende Unterschied zu rohem IAM: Lake Formation erzwingt Filterung auf Spalten- und Zeilenebene, die IAM-Richtlinien allein nicht ausdrücken können.

## Stärken und Grenzen

**Kinesis Data Streams**: Verwenden Sie Kinesis, wenn Ihre Daten kontinuierlich eintreffen und die Reihenfolge wichtig ist – Clickstreams, Finanztransaktionen, IoT-Telemetrie. Kinesis bewahrt die Datensatzreihenfolge innerhalb eines Shards und erlaubt Replay während des konfigurierten Aufbewahrungsfensters (standardmäßig 24 Stunden, bis zu 365 Tage mit Extended Data Retention), was es grundlegend von SQS unterscheidet. Der Kompromiss ist operative Komplexität: Im bereitgestellten Modus verwalten Sie Shard-Kapazität und Konsumentenverhalten. Für einfache Aufgabenwarteschlangen, bei denen die Reihenfolge keine Rolle spielt und kein Replay nötig ist, ist SQS die einfachere Wahl.

**AWS Glue**: Glue beseitigt die Infrastruktur eines traditionellen ETL-Clusters. Sie schreiben die Transformationslogik; AWS verwaltet die Spark-Umgebung. Das ist wertvoll, wenn Transformationen komplex oder die Datenvolumina groß sind. Die Einschränkung ist Kosten und Kaltstart – Glue-Jobs haben eine Startverzögerung von mehreren Minuten, was sie für nahezu-Echtzeit-Transformationen ungeeignet macht. Für einfache Dateiformatkonvertierungen (CSV zu Parquet) ist der Overhead von Glue den Vergleich mit einer Lambda-Funktion oder einem leichtgewichtigen Skript möglicherweise nicht wert.

**Amazon Athena**: Athena lässt Sie S3-Daten mit Standard-SQL abfragen, ohne Infrastruktur zu verwalten. Die kritische Beschränkung ist die Kosten: Athena berechnet pro gescanntem Terabyte. Eine Abfrage gegen eine 10-TB-Tabelle, die das Ganze scannt, kostet deutlich mehr als dieselbe Abfrage gegen eine Parquet-formatierte, partitionierte Tabelle, die 200 GB scannt. Verwenden Sie immer spaltenorientierte Formate (Parquet oder ORC) und partitionieren Sie Ihre Daten, bevor Sie Athena in der Produktion ausführen. Ohne diese Optimierungen können Athena-Rechnungen Sie überraschen.

## Zusammenfassung

Die Netzwerkarbeit in Kapitel 25 machte Nimbus' Datenpipeline möglich. Dieses Kapitel ist, wofür diese Pipeline da ist: all die Daten, die Nimbus erzeugt hat, tatsächlich sichtbar und nutzbar zu machen.

- **Amazon Kinesis**: Echtzeit-Daten-Streaming. Produzenten schreiben Datensätze; Konsumenten lesen in ihrem eigenen Tempo. Amazon Data Firehose kann dann Streaming-Daten mit weniger operativem Aufwand an S3, Redshift und andere Ziele liefern.
- **AWS Glue**: ETL und Datenkatalogisierung. Crawler entdecken Schemas; Jobs transformieren Daten; der Data Catalog macht Daten für Athena und andere Tools auffindbar.
- **Amazon Athena**: Serverloses SQL auf S3. Jegliche Daten in S3 mit Standard-SQL abfragen. Preis pro gescanntem TB – Parquet und Partitionierung verwenden, um Kosten zu minimieren.
- **Amazon Redshift**: Verwaltetes Data Warehouse für hochleistungsfähige Analytik. Daten laden, für wiederholte analytische Abfragen optimieren und schnell im Warehouse-Maßstab abfragen.
- Das **Data-Lake-Muster**: Rohdaten nach S3 → Glue transformiert sie → Athena fragt sie ab → BI-Tools visualisieren sie.
- **Glue-Schema-Evolution**: ETL-Pipelines, die externe Daten verarbeiten, müssen mit Schemaänderungen elegant umgehen. Verwenden Sie DynamicFrames mit `mergeSchema: true`, um Pipeline-Ausfälle zu vermeiden, wenn vorgelagerte Daten neue Felder hinzufügen.
- **Athena-Workgroups**: Datenscan-Limits und Ergebnis-Speicherorte pro Team. Kostenkontrolle und Zugriffskontrolle in einer Konfiguration. Erforderlich für jedes Multi-Team-Athena-Deployment.
- **Kinesis vs. SQS**: Kinesis für Fan-out an mehrere Konsumenten und Replay-Fähigkeit. SQS Standard für einfache Aufgabenwarteschlangen; SQS FIFO für geordnete, deduplizierte Aufgabenverarbeitung. Die entscheidende Frage: Muss jeder Konsument jede Nachricht sehen, oder geht jede Nachricht an einen Konsumenten?
- **Wann Athena falsch ist**: hochfrequente Dashboards (Redshift verwenden), operative Abfragen (RDS oder DynamoDB verwenden), sehr kleine, sich häufig ändernde Datensätze (einfach eine Datenbank verwenden).
- **Amazon QuickSight**: AWS' verwalteter BI-Dienst. Verbindet sich mit Athena, S3, Redshift und RDS, um Dashboards zu bauen, ohne einen separaten BI-Server zu betreiben. SPICE ist die In-Memory-Engine, die wiederholte Dashboard-Abfragen beschleunigt.
- **AWS Lake Formation**: Zentralisierte Zugriffskontrolle für Data Lakes auf S3 + Glue Data Catalog. Ermöglicht Berechtigungen auf Spalten-, Zeilen- und Tabellenebene – feingranulare Daten-Governance, die IAM allein nicht ausdrücken kann.

## Prüfungstipps

*SAA-C03-Domäne: Entwurf leistungsstarker Architekturen (Domäne 3, Aufgabe 3.5)*

- **Kinesis vs. SQS**: Kinesis = geordnetes Echtzeit-Streaming, mehrere Konsumenten, Replay innerhalb des Aufbewahrungsfensters (standardmäßig 24 Stunden, bis zu 365 Tage). SQS = Aufgabenwarteschlange, jede Nachricht einmal verarbeitet. „Mehrere Konsumenten, die denselben Stream gleichzeitig lesen“ → Kinesis. „Ein Worker pro Nachricht“ → SQS.
- **Athena-Examenssignale**: „serverloses SQL auf S3“, „S3-Daten analysieren, ohne sie in eine Datenbank zu laden“, „Zahlung pro Abfrage“ → Athena.
- **Athena-Kostenoptimierung**: Spaltenorientiertes Format (Parquet oder ORC) + Partitionierung reduziert die gescannten Daten und die Kosten dramatisch. Die Prüfung könnte fragen, wie man Athena-Kosten reduziert.
- **Athena-Preisgestaltung**: 5 $ pro gescanntem TB (us-east-1, us-west-2 und die meisten wichtigen Regionen). Die Kosten werden auf gescannte Daten berechnet, nicht auf zurückgegebene Daten – optimieren Sie immer das Speicherformat, bevor Sie Produktionsabfragen ausführen.
- **Glue Crawler**: „Schema von S3-Daten automatisch entdecken“ → Glue Crawler.
- **Amazon Data Firehose**: „Streaming-Daten automatisch nach S3/Redshift/OpenSearch laden, ohne Konsumenten zu verwalten“ → Amazon Data Firehose. Ältere Materialien nennen es möglicherweise noch Kinesis Data Firehose.
- **Redshift vs. Athena**: Redshift für hochfrequente, komplexe Abfragen auf einem festen Datensatz (BI-Dashboards). Athena für Ad-hoc-Abfragen auf S3-Daten, die sich häufig ändern.
- **EMR (Elastic MapReduce)**: AWS-verwaltete Hadoop-/Spark-Cluster. Die Prüfung verwendet dies, wenn „bestehende Hadoop-/Spark-Workloads“ oder „benutzerdefinierte Datenverarbeitungs-Frameworks“ erwähnt werden. Glue ist die verwaltete Alternative für die meisten Anwendungsfälle.
- **QuickSight:** AWS-verwaltetes BI und Visualisierung. Verbindet sich mit Athena, S3, Redshift, RDS. SPICE = In-Memory-Engine für schnelle wiederholte Abfragen. Examensauslöser: „Business-Intelligence-Dashboard auf AWS“ → QuickSight.
- **Lake Formation:** Zentralisierte Zugriffskontrolle für einen Data Lake (S3 + Glue Data Catalog). Feingranulare Berechtigungen: Tabellen-, Spalten- und Zeilenebene. Examensauslöser: „Zugriff auf bestimmte Spalten im S3-Data-Lake einschränken“ oder „Data-Lake-Governance zentralisieren“ → Lake Formation.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen Amazon Kinesis und Amazon SQS. Wann würden Sie jedes verwenden?

*(Hinweis: Denken Sie darüber nach, wie viele Konsumenten dieselben Daten lesen können, ob Nachrichten nach dem Lesen gelöscht werden und ob die Reihenfolge wichtig ist.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Mitfahrunternehmen möchte Fahrtdaten analysieren. Täglich werden 1 Million Fahrten abgeschlossen. Fahrtdatensätze werden in S3 als JSON-Dateien gespeichert (etwa 2 KB pro Stück). Das Analyseteam möchte Ad-hoc-SQL-Abfragen ausführen wie „durchschnittliche Fahrtdauer nach Stadt letzte Woche“. Abfragen sollten in unter 2 Minuten abschließen. Speicherkosten sollten minimiert werden. Das Team wird 20–30 Abfragen pro Woche ausführen.

Welche Architektur erfüllt diese Anforderungen am BESTEN?

A) AWS Glue verwenden, um JSON in das Parquet-Format zu konvertieren, partitioniert nach Datum und Stadt; mit Amazon Athena abfragen  
B) Fahrtdaten täglich in RDS PostgreSQL laden; mit Standard-SQL abfragen  
C) Amazon Data Firehose verwenden, um Fahrtdaten an Amazon Redshift zu liefern; mit Redshift abfragen  
D) Fahrtdaten in DynamoDB laden und PartiQL für SQL-Abfragen verwenden

**Hinweis 1**: 20–30 Abfragen pro Woche sind niedrige Frequenz. Welcher Dienst ist für gelegentliches Abfragen am kosteneffektivsten?

**Hinweis 2**: Parquet-Format + Partitionierung reduziert die von Athena gescannten Daten dramatisch – und damit die Kosten.

**Hinweis 3**: 1 Million Fahrten × 2 KB = ~2 GB pro Tag. Über eine Woche ~14 GB. Bei 5 $/TB für Athena ist das selbst ohne Optimierung erschwinglich.

**Antwort**: A

**Erläuterung**: Glue konvertiert JSON zu Parquet (spaltenorientiertes Format reduziert die gescannten Daten dramatisch), partitioniert nach Datum und Stadt (Partition-Pruning bedeutet, dass „letzte Woche“-Abfragen nur 7 Tage Partitionen scannen). Athena fragt S3 direkt mit Standard-SQL ab. Für 20–30 Abfragen pro Woche ist das Pay-per-query-Athena gegenüber dem ständig laufenden Redshift extrem kosteneffektiv.

**Warum nicht B?** Das Laden von 2 GB Daten täglich in RDS und anschließendes Abfragen erfordert eine Datenbankinstanz, die rund um die Uhr läuft. Für 20–30 Abfragen pro Woche ist das massiv überdimensioniert und teuer.

**Warum nicht C?** Redshift ist für hochfrequente Abfragen kosteneffektiv (hunderte pro Tag auf demselben Datensatz). Für 20–30 Abfragen pro Woche kostet der ständig laufende Redshift-Cluster weit mehr als Athenas Preisgestaltung pro Abfrage.

**Warum nicht D?** DynamoDB ist ein Key-Value-/Dokumentenspeicher, optimiert für schlüsselbasierten Zugriff, nicht für Ad-hoc-Analyseabfragen. PartiQL auf DynamoDB unterstützt nicht die Art von GROUP-BY-Aggregationen, die beschrieben werden.

*SAA-C03-Domäne: Entwurf leistungsstarker Architekturen — Aufgabe 3.5*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus möchte ein Echtzeit-Betrugserkennungssystem für Bestellungen bauen. Das System soll:

- Bestellungen erkennen, die vom selben Konto mehr als 5-mal in 60 Sekunden aufgegeben werden
- Bestellungen über 500 $ von neuen Konten (< 30 Tage alt) markieren
- Markierte Bestellungen an eine Warteschlange zur menschlichen Überprüfung senden

Entwerfen Sie die Architektur. Was bietet Kinesis? Wo läuft die Betrugslogik? Wie korrelieren Sie „dasselbe Konto, 60-Sekunden-Fenster“? Welcher Dienst empfängt die markierten Bestellungen?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, den Entwurf einer Echtzeit-Streaming-Architektur zu üben.)*

## Post-Credits-Szene

Tom führte die erste Athena-Abfrage aus.

„Top-10-Restaurants nach Umsatz letztes Quartal“, sagte er.

12 Sekunden später erschienen die Ergebnisse.

Er starrte sie an.

„Restaurant 47 war Erster“, sagte er. Es war Mayas Familienrestaurant – das, in dem Nimbus begann.

„Natürlich war es das“, sagte Maya. „Arepa ist einfach so gut.“

Tom führte eine weitere Abfrage aus. Und noch eine. „Wie viel kostet das pro Monat?“ fragte Tom, bevor Leo etwas sagen konnte. Leo überprüfte die Abfrage-Scan-Historie. Drei Abfragen, insgesamt gescannte Daten: 1,2 GB. Kosten: weniger als ein Cent.

Nach einer Stunde hatte Tom ein vollständiges Bild von Nimbus' Geschäft auf eine Weise, wie er es nie zuvor gehabt hatte. Welche Restaurantkategorien am schnellsten wuchsen. Welche Kundenkohorten am längsten blieben. Welche Menüelemente die meisten Wiederholungsbestellungen trieben.

„Warum haben wir das nicht früher gebaut?“ fragte er.

„Wir hatten die Daten“, sagte Leo. „Wir hatten nur nicht die Pipeline, um sie zu nutzen.“

„Die Daten waren immer da“, sagte Maya leise. „Wir konnten sie nur nicht sehen.“

Im nächsten Kapitel: Jetzt, da wir das Geschäft klar sehen können, lassen Sie uns darüber sprechen, wie man die Infrastruktur bezahlt, die es betreibt – effizienter.
