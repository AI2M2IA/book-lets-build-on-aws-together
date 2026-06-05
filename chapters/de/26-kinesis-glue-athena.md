# Kapitel 26: Alles Verstehen

Daten sind Rohmaterial: Zeitstempel, Klicks, Ereignisse, Zahlen. Informationen sind das, was Sie erhalten, wenn Daten organisiert, verarbeitet und kontextualisiert werden. Der Unterschied zwischen den beiden ist, wo dieses Kapitel angesiedelt ist.

Und in wachsenden Systemen wird dieser Unterschied schnell teuer.

Nimbus erzeugte enorme Datenmengen. Jede Bestellung: aufgezeichnet. Jede Menüansicht: protokolliert. Jede Restaurantaktualisierung: erfasst. Jede Kundeninteraktion: verfolgt.

Tom hatte eine Frage.

"Wie ist unsere Hauptbestellzeit am Freitag?"

Leo sah ihn an. "Das ist nicht in unserem Dashboard."

"Können wir es hinzufügen?"

"Die Daten befinden sich in DynamoDB. Und in CloudWatch Logs. Und in S3 aus der Analysen-Export-Job." Leo machte eine Pause. "In drei verschiedenen Orten, in drei verschiedenen Formaten."

Maya fügte hinzu: "Und die Analysen-Export-Job läuft nur einmal pro Nacht. Wenn Sie Freitagdaten benötigen, müssen Sie bis zum Samstagmorgen warten."

Tom betrachtete den Bildschirm. "Wir haben die Daten. Wir können sie aber nicht nutzen."

Diese Aussage beschreibt die Hälfte der modernen Analytik.

Dies ist das Problem der Daten-Engineering: Sie haben Daten, aber sie sind nicht in einem Format, das Sie benötigen, wenn Sie sie analysieren müssen.

**Drei Verschiedene Probleme**

Das Datenproblem von Nimbus hatte drei Dimensionen:

**Echtzeit-Streaming:** Bestellungen werden gerade erst aufgegeben. Sie möchten eine Live-Dashboard mit der Bestellgeschwindigkeit – wie viele pro Minute, nach Region, nach Restaurant – sehen. Die Daten müssen verarbeitet werden, sobald sie ankommen.

**Datentransformation:** Die Daten befinden sich in S3 aus verschiedenen Systemen, in verschiedenen Formaten (JSON, CSV, Parquet). Bevor Sie sie analysieren können, müssen Sie sie normalisieren – gleiche Schema, gleiche Format, bereinigt, mit Referenzdaten zusammengefügt.

**Ad-hoc-Analyse:** Sobald die Daten organisiert sind, möchten Sie SQL-Abfragen gegen sie ausführen, ohne sie zuerst in eine Datenbank laden zu müssen. "Zeigen Sie mir die Top 10 Restaurants nach Umsatz in den letzten 30 Tagen." Ohne die Daten in eine Datenbank zu laden.

Jedes dieser Probleme ist ein eigenständiges Problem. AWS bietet für jedes Problem einen dedizierten Dienst:

- **Amazon Kinesis**: Echtzeit-Streaming-Daten
- **AWS Glue**: Datentransformation und Katalogisierung
- **Amazon Athena**: Serverless SQL-Abfragen auf S3

**Amazon Kinesis: Der Echtzeit-Ticker**

**Amazon Kinesis Data Streams** ist ein Echtzeit-Daten-Streaming-Dienst. Produzenten senden Datenaufzeichnungen an den Stream. Mehrere Konsumenten können gleichzeitig vom Stream lesen, jeweils in ihrem eigenen Tempo.

Denken Sie sich eine Ticker-Tape-Maschine: Preise werden kontinuierlich gedruckt, jeder kann das Band lesen, und das Band verlangsamt sich nicht für einen einzelnen Leser.

Für Nimbus, wenn eine Bestellung aufgegeben wird, veröffentlicht die Anwendung ein Ereignis in einem Kinesis-Stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Konsumenten dieses Streams:

- Ein Echtzeit-Dashboard (liest Ereignisse, sobald sie ankommen, aktualisiert Metriken)
- Ein Betrugserkennungs-Lambda (sucht nach ungewöhnlichen Bestellmustern)
- Ein Stream zu S3 für permanente Speicherung

**Kinesis Data Streams Konzepte:**

- **Shard**: Die grundlegende Einheit der Kapazität. Ein Shard verarbeitet 1 MB/s Schreibvorgang, 2 MB/s Lesezugriff.
- **Retention-Periode**: Daten bleiben im Stream 24 Stunden (Standard) bis 7 Tage.
- **Sequenznummer**: Jede Aufzeichnung hat eine Sequenznummer. Konsumenten verfolgen ihre Position im Stream.

**Amazon Data Firehose** (ehemals **Kinesis Data Firehose**): Der verwaltete Delivery-Service zwischen Streaming-Produzenten und Zielen wie S3, Redshift und OpenSearch. Es puffert, komprimiert, transformiert und liefert Daten automatisch.

Für Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet-Format, komprimiert, partitioniert nach Datum).

**AWS Glue: Der Übersetzer**

Daten in S3 sind Rohmaterial. Bevor Sie sie effizient analysieren können, müssen Sie:

- Entdecken, was da ist und welches Schema es hat (welche Spalten, welche Typen)
- Es in ein konsistentes Format transformieren
- Verschiedene Datensätze zusammenfügen
- Schlechte Aufzeichnungen, Schemaänderungen, fehlende Werte behandeln

**AWS Glue** ist ein voll verwalteter ETL (Extract, Transform, Load)-Dienst. Er hat zwei Hauptkomponenten:

**Glue Data Catalog**: Ein Metadaten-Speicher, der Ihre S3-Daten beschreibt – welche Tabellen existieren, welche Spalten sie haben, wo die Daten-Dateien liegen. Es ist wie ein Katalog für Ihren Daten-Lake.

**Glue Crawler**: Automatisierte Agenten, die S3 scannt, das Schema ableitet und den Katalog mit den Daten füllt. Führen Sie einen Crawler auf Ihrem S3-Bucket aus und innerhalb von 10 Minuten haben Sie eine Katalogisierung Ihrer gesamten Tabellen.

**Glue Jobs**: Serverless Spark/Python-Jobs, die die eigentliche Transformation durchführen. Sie schreiben die Transformationslogik (oder verwenden das visuelle ETL-Tool von Glue) und Glue führt sie auf verwalteter Infrastruktur aus.

Für Nimbus:

1. Glue Crawler scannt die Bestell-Daten in S3 → erstellt eine Tabellendefinition im Glue Data Catalog
2. Glue Job transformiert die Roh-JSON-Bestellereignisse in ein sauberes, partitioniertes Parquet-Format
3. Die transformierten Daten werden zurück in S3 in einem für Abfragen optimierten Layout geschrieben

**Amazon Athena: Der Bibliothekar**

**Amazon Athena** ist ein serverless, interaktiver Abfrage-Service, der SQL-Abfragen direkt auf S3-Daten ausführt. Keine Datenbank zu provisionieren, keine Daten zu laden. Sie definieren eine Tabelle (oder verwenden den Glue Data Catalog), schreiben SQL und Athena führt die Abfrage gegen die S3-Dateien aus.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

```markdown
Athena-Preise basieren auf der Menge an Daten, die eine Abfrage scannt. In vielen Regionen beginnen Standard-SQL-Abfragen bei 5 US-Dollar pro Terabyte gescanntem Daten. Die Verwendung des Parquet-Formats (spaltenorientiert) mit Partitionierung (z.B. `WHERE year='2024' AND month='01'`) bedeutet, dass Athena nur die Dateien scannt, die es benötigt, was die Kosten drastisch reduziert.

"Wir können diese Abfrage für 30 Tage Daten ausführen", sagte Leo, "und es kann überraschend wenig kosten, wenn wir sie gut speichern."

"Für jede beliebige Frage, die wir uns vorstellen können?" fragte Tom.

"Für jede Frage, die wir in SQL ausdrücken können, gegen jede Datenmenge, die wir in S3 gespeichert haben."

Tom hatte den Blick eines Menschen, der den Wert aller Daten neu berechnet, die er achtlos weggeworfen hatte.

**Die Data Lake Architektur**

Diese drei Dienste vereinen sich in einer sogenannten **Data Lake Architektur** – einem zentralen S3-Repository für all Ihre Daten, mit Werkzeugen zur Verarbeitung und Abfrage dieser Daten:
```

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

```markdown
Die Rohdaten werden immer beibehalten (im Original-S3-Bucket). Die transformierten Daten sind über Athena abfragbar. Neue Fragen können jederzeit beantwortet werden, indem neue Glue-Jobs auf den Rohdaten ausgeführt werden.

**Amazon Redshift: Wenn Athena nicht ausreicht**

Für einige Anwendungsfälle ist Athena zu langsam oder zu teuer:

- Sehr komplexe Abfragen mit vielen Joins
- Dashboards, die dieselbe Abfrage tausendmal am Tag ausführen
- Machine Learning auf strukturierten Daten
- Antwortzeiten von weniger als einer Sekunde für BI-Tools

**Amazon Redshift** ist ein voll verwalteter Datenwarehouse: Eine spaltenorientierte Analytikdatenbank, die für große, wiederholte Analysen geeignet ist. Anders als Athena, das Daten dort abfragt, wo sie in S3 gespeichert sind, lädt Redshift Daten in optimiertes Warehouse-Speicher und verwendet Abfrageoptimierungen, Sortierstrategien und Verteilungsstrategien, um komplexe Analysen zu beschleunigen.

Redshift ist deutlich schneller für komplexe Analysenabfragen, geht jedoch mit Kosten (bereitgestellte Kapazität) und der Anforderung, Daten zu laden, bevor sie abgefragt werden, ein.

**Redshift Serverless** beseitigt die Last der Kapazitätsplanung – Sie fragen, Redshift skaliert. Die Kosten betragen pro Abfrage.

Für Nimbus bei ihrer aktuellen Größe: Athena ist ausreichend. Bei fünfmal dem Datenvolumen und mit BI-Tools, die die gleichen Dashboards hunderte Male am Tag abfragen, würde Redshift kosteneffizient werden.

## Stärken und Schwächen

**Kinesis Data Streams**: Verwenden Sie Kinesis, wenn Ihre Daten kontinuierlich ankommen und die Reihenfolge wichtig ist – Klickstreams, Finanztransaktionen, IoT-Telemetrie. Kinesis bewahrt die Reihenfolge der Aufzeichnungen innerhalb eines Shards und ermöglicht das Abspielen während des konfigurierten Aufbewahrungsfensters, was es grundlegend von SQS unterscheidet. Der Kompromiss ist die operative Komplexität: Im bereitgestellten Modus verwalten Sie die Shard-Kapazität und das Konsumentenverhalten. Für einfache Task-Queues, bei denen die Reihenfolge nicht wichtig ist und das Abspielen nicht erforderlich ist, ist SQS die einfachere Wahl.

**AWS Glue**: Glue eliminiert die Infrastruktur eines traditionellen ETL-Clusters. Sie schreiben die Transformationslogik; AWS verwaltet die Spark-Umgebung. Dies ist wertvoll, wenn Transformationen komplex sind oder Datenvolumina groß sind. Die Einschränkung sind Kosten und Cold Start – Glue-Jobs haben eine Startverzögerung von mehreren Minuten, was sie für Near-Real-Time-Transformationen ungeeignet macht. Für einfache Dateiformatkonvertierungen (CSV zu Parquet) mag der Overhead von Glue im Vergleich zu einer Lambda-Funktion oder einem leichten Skript nicht den Aufwand rechtfertigen.

**Amazon Athena**: Athena ermöglicht es Ihnen, S3-Daten mit SQL und ohne zu verwalten, Infrastruktur. Die kritische Einschränkung ist die Kosten: Athena berechnet pro Terabyte an durchsuchten Daten. Eine Abfrage gegen eine Tabelle mit 10 TB, die das gesamte Ding durchsucht, kostet deutlich mehr als dieselbe Abfrage gegen eine Parquet-formatiert, partitionierte Tabelle, die 200 GB durchsucht. Verwenden Sie immer spaltenorientierte Formate (Parquet oder ORC) und partitionieren Sie Ihre Daten, bevor Sie Athena in der Produktion ausführen. Ohne diese Optimierungen können Athenakosten Sie überraschen.

## Zusammenfassung

- **Amazon Kinesis**: Echtzeit-Daten-Streaming. Produzenten schreiben Aufzeichnungen; Konsumenten lesen in ihrem eigenen Tempo. Amazon Data Firehose kann dann Streaming-Daten an S3, Redshift und andere Ziele liefern, ohne operative Arbeit zu erfordern.
- **AWS Glue**: ETL und Datenkatalogisierung. Crawler entdecken Schemata; Jobs transformieren Daten; Der Datenkatalog macht Daten für Athena und andere Tools auffindbar.
- **Amazon Athena**: Serverless SQL auf S3. Abfragen Sie jede Daten in S3 mit Standard-SQL. Preiset sich pro TB durchsuchter Daten – verwenden Sie Parquet und Partitionierung, um die Kosten zu minimieren.
- **Amazon Redshift**: Verwaltetes Datenwarehouse für Hochleistungsanalysen. Laden Sie Daten in, optimieren Sie sie für wiederholte Analysenabfragen und abfragen Sie sie schnell in Warehouse-Größe.
- Das **Data-Lake-Muster**: Rohdaten zu S3 → Glue transformiert sie → Athena fragt sie ab → BI-Tools visualisieren sie.

## Examenstipps

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = geordnetes, Echtzeit-Streaming, mehrere Konsumenten, Abspielbarkeit innerhalb des Aufbewahrungsfensters. SQS = Task-Queue, jede Nachricht wird einmal verarbeitet. "Mehrere Konsumenten, die gleichzeitig denselben Stream lesen" → Kinesis. "Ein Arbeitsmaus für jede Nachricht" → SQS.
- **Athena-Examenssignale**: "Serverless SQL auf S3", "Analysieren von S3-Daten ohne Laden in eine Datenbank", "Bezahlung pro Abfrage" → Athena.
- **Athena-Kostenoptimierung**: Spaltenformat (Parquet oder ORC) + Partitionierung reduziert die durchsuchten Daten und die Kosten erheblich. Die Prüfung kann fragen, wie man Athena-Kosten reduziert.
- **Glue-Crawler**: "Automatische Entdeckung des Schemas von S3-Daten" → Glue-Crawler.
- **Amazon Data Firehose**: "Automatische Belastung von Streaming-Daten zu S3/Redshift/OpenSearch ohne Verwaltung von Konsumenten" → Amazon Data Firehose. Ältere Materialien können immer noch Kinesis Data Firehose heißen.
- **Redshift vs Athena**: Redshift für hochfrequente, komplexe Abfragen auf einem festen Datensatz (BI-Dashboards). Athena für Ad-hoc-Abfragen auf S3-Daten, die sich häufig ändern.
- **EMR (Elastic MapReduce)**: AWS-verwaltete Hadoop/Spark-Cluster. Die Prüfung verwendet dies, wenn "bestehende Hadoop/Spark-Workloads" oder "maßgeschneiderte Datenverarbeitungsrahmen" erwähnt werden. Glue ist die verwaltete Alternative für die meisten Anwendungsfälle.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen Amazon Kinesis und Amazon SQS. Wann würden Sie jeweils eins verwenden?
```

*(Hinweis: Denken Sie darüber nach, wie viele Konsumenten die gleichen Daten lesen können, ob Nachrichten nach dem Lesen gelöscht werden und ob die Reihenfolge wichtig ist.)*

**Übung 2 — Klausurenübung**

*Szenario*: Ein Mitfahrgeführter-Unternehmen möchte Reiseerfassungen analysieren. Täglich werden 1 Million Fahrten abgeschlossen. Reiseaufzeichnungen werden in S3 als JSON-Dateien (ungefähr 2 KB pro Datei) gespeichert. Das Analyse-Team möchte Ad-hoc-SQL-Abfragen wie "Durchschnittliche Fahrtzeit nach Stadt in der letzten Woche" ausführen. Abfragen sollen in weniger als 2 Minuten abgeschlossen werden. Die Speicherkosten sollen minimiert werden. Das Team führt 20-30 Abfragen pro Woche aus.

Welche Architektur erfüllt diese Anforderungen BEST?

A) Laden Sie Reiseerfassungen täglich in RDS PostgreSQL; Abfragen mit Standard-SQL
B) Verwenden Sie AWS Glue, um JSON in das Parquet-Format zu konvertieren, das nach Datum und Stadt partitioniert ist; Abfragen mit Amazon Athena
C) Verwenden Sie Amazon Data Firehose, um Reiseerfassungen an Amazon Redshift zu liefern; Abfragen mit Redshift
D) Laden Sie Reiseerfassungen in DynamoDB und verwenden Sie PartiQL für SQL-Abfragen

**Hinweis 1**: 20-30 Abfragen pro Woche sind eine geringe Häufigkeit. Welcher Dienst ist für gelegentliche Abfragen am kostengünstigsten?

**Hinweis 2**: Das Parquet-Format + Partitionierung reduziert die Datenmenge drastisch, die von Athena durchsucht wird – und somit auch die Kosten.

**Hinweis 3**: 1 Million Fahrten × 2 KB = ~2 GB pro Tag. Über eine Woche sind das ~14 GB. Bei 5 $/TB für Athena sind selbst ohne Optimierung diese Kosten erschwinglich.

**Antwort**: B

**Erläuterung**: Glue konvertiert JSON in Parquet (das spaltbare Format reduziert die durchsuchte Datenmenge drastisch) und partitioniert es nach Datum und Stadt (Partitionierungssperrung bedeutet, dass Abfragen der letzten Woche nur 7 Tage der Partitionen durchsuchen). Athena fragt S3 direkt mit Standard-SQL ab. Für 20-30 Abfragen pro Woche ist die Pay-per-Query-Kosten von Athena deutlich kostengünstiger als ein immer laufendes Redshift-Cluster.

**Warum nicht A?** Das Laden von 2 GB Daten täglich in RDS und dann das Abfragen erfordert eine Datenbankinstanz, die 24/7 läuft. Für 20-30 Abfragen pro Woche ist dies stark überdimensioniert und teuer.

**Warum nicht C?** Redshift ist für hochfrequente Abfragen (hunderte pro Tag auf demselben Datensatz) kostengünstig. Für 20-30 Abfragen pro Woche ist das immer laufende Redshift-Cluster deutlich teurer als die Pay-per-Query-Preise von Athena.

**Warum nicht D?** DynamoDB ist ein Key-Value-/Dokumenten-Speicher, der für Key-basierte Zugriffe optimiert ist, nicht für Ad-hoc-analytische Abfragen. PartiQL auf DynamoDB unterstützt die Art von GROUP BY-Aggregationen, die hier beschrieben werden.

*SAA-C03 Domain: Entwerfen Sie Hochleistungsarchitekturen – Aufgabe 3.5*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus möchte ein Echtzeit-Betrugserkennungs-System für Bestellungen aufbauen. Das System soll:

- Bestellungen, die vom selben Konto mehr als 5 Mal innerhalb von 60 Sekunden aufgegeben werden, erkennen
- Bestellungen über 500 $ von neuen Konten (< 30 Tage alt) kennzeichnen
- Gekennzeichnete Bestellungen an eine manuelle Überprüfungsküchel senden

Entwerfen Sie die Architektur. Was bietet Kinesis? Wo läuft die Betrugslogik? Wie korreliert man "das gleiche Konto, 60-Sekunden-Fenster"? Welcher Dienst empfängt die gekennzeichneten Bestellungen?

*(Es gibt keine einzelne korrekte Antwort. Das Ziel ist es, die Architektur für Echtzeit-Streaming zu üben.)*

## Post-Credits-Szene

Tom führte die erste Athena-Abfrage aus.

"Top 10 Restaurants nach Umsatz im letzten Quartal", sagte er.

12 Sekunden später erschienen die Ergebnisse.

Er starrte darauf.

"Restaurant 47 war an erster Stelle", sagte er. Es war das Familienrestaurant von Maya – das, wo Nimbus begann.

"Natürlich war es", sagte Maya. "Arepas sind so gut."

Tom führte eine weitere Abfrage aus. Und noch eine. Jede beantwortete sich in Sekunden, jeder kostete nur Splitter von Cent.

Nach einer Stunde hatte er ein vollständiges Bild von Nimbus's Geschäft in einer Weise, die er sich noch nie zuvor hätte vorstellen können. Welche Restaurantkategorien wuchsen am schnellsten. Welche Kundensegmente behielten am längsten. Welche Menüpunkte trieben die meisten wiederholten Bestellungen.

"Warum haben wir das nicht früher gebaut?", fragte er.

"Wir hatten die Daten", sagte Leo. "Wir haben nur keinen Pipeline, um sie zu nutzen."

"Die Daten waren immer da", sagte Maya leise. "Wir konnten sie nicht sehen."

Im nächsten Kapitel: Jetzt, da wir das Geschäft klar sehen können, sprechen wir darüber, wie wir die Infrastruktur bezahlen, die es betreibt – effizienter.
