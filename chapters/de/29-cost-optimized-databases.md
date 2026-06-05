# Kapitel 29: Die Datenbank-Kosten

Tom’s Storage-Audit hatte 8.800 US-Dollar an Verschwendung aufgezeigt. Er wandte sich an die Datenbank-Instanzen.

RDS Aurora: 647 US-Dollar/Monat.
RDS PostgreSQL (Lese-Replikate): 340 US-Dollar/Monat.
ElastiCache: 183 US-Dollar/Monat.

Gesamt-Datenbank-Tier: 1.170 US-Dollar/Monat.

„Ich muss jedes einzelne verstehen, bevor ich etwas entscheide“, sagte er. „Denn beim Datenbank-Bereich geht es nicht darum, Geld zu sparen, indem man Kompromisse eingeht.“

Das war weise. Datenbank-Konfigurationen, die zu Datenverlust oder Leistungseinbußen führen, kosten deutlich mehr als die Einsparungen.

Man kann sich eine Datenbank wie den Motor eines Autos vorstellen. Man kann Geld für ein Auto sparen, indem man billigeren Kraftstoff verwendet, den Reifendruck einstellt und unnötiges Gewicht aus dem Kofferraum entfernt. Aber wenn man versucht, Geld zu sparen, indem man die Ölwechsel auslässt, riskiert man, den Motor zu beschädigen – und ein beschädigter Motor kostet viel mehr als jede Kraftstoffersparnis. Das Audit, das Tom durchführen wird, folgt der gleichen Logik: Finden Sie die Verschwendung im Kofferraum und im Tank, und lassen Sie den Motor, bis Sie genau wissen, was Sie tun.

**Verständnis Ihrer Datenbank-Workload Zuerst**

Die Kostenoptimierung in Datenbanken erfordert das Verständnis der Workload, bevor man irgendetwas verändert.

Wichtige Fragen:

- Wie hoch ist die durchschnittliche und Spitzen-CPU-Auslastung?
- Wie hoch ist das Verhältnis von Lese- zu Schreiboperationen?
- Steigt, stabilisiert sich oder sinkt der Speicherplatz?
- Werden Lese-Replikate genutzt?
- Ist die Instanz unter- oder überdimensioniert (führt dies zu Verzögerungen oder unnötigen Kosten)?

Tom öffnete CloudWatch-Metriken für alle drei Datenbankdienste der letzten 30 Tage:

**Aurora Cluster:**

- Durchschnittliche CPU: 18 % (Spitze: 67 % am Freitagabend)
- Lese-/Schreib-Verhältnis: 14:1 (Lese-lastig)
- Speicherplatz: 180 GB (wächst um ca. 5 GB/Monat)

**Lese-Replikate (RDS PostgreSQL, getrennt von Aurora):**

- Dies waren zwei Legacy RDS Lese-Replikate, die vor der Aurora-Migration erstellt wurden und noch liefen.
- Durchschnittliche Verbindungen pro Tag: 2 pro Tag. Durchschnittliche CPU: 3 %.

„Warum laufen diese noch?“, fragte Tom.

Leo schaute sich die Erstellungsdaten der Instanzen an. „Sie wurden während der Aurora-Migration als Fallback erstellt. Wir haben sie nicht gelöscht.“

Der Moment, in dem eine teure Sache monatelang ohne Nutzung läuft – ist eine vertraute Situation in Cloud-Umgebungen.

Die Replikate wurden beendet. Monatsersparnis: 340 US-Dollar.

**RDS Reserved Instances: Die Datenbank-Version**

Wie EC2 bietet RDS Reserved Instances für kommissionierte Nutzung.

Für Aurora mit Serverless v2 gelten Reserved Instances nicht direkt – Serverless v2 skaliert dynamisch und Sie zahlen pro ACU-Stunde. Wenn Sie jedoch eine feste Aurora-Instanzkonfiguration (nicht Serverless) verwenden, können Reserved Instances 30-60 % sparen.

Tom überprüfte die Aurora provisionierten Instanzen (den Writer und einen Reader):

- Writer Instanz: db.r6g.large, On-Demand = 0,26 US-Dollar/Stunde = 190 US-Dollar/Monat
- Reader Instanz: db.r6g.large, On-Demand = 0,26 US-Dollar/Stunde = 190 US-Dollar/Monat

1-Jahres Reserved Instances für beide: ca. 108 US-Dollar/Monat. Jährliche Einsparung: 984 US-Dollar.

„Wartet“, sagte Leo. „Wir haben in Kapitel 24 auf Aurora Serverless v2 migriert. Warum schaut Tom nach On-Demand für provisionierte Instanzen?“

Ein guter Hinweis. Lassen Sie uns präzise sein: Nimbuss’ primärer Aurora-Writer verwendet Serverless v2. Der Reader (für Lese-Replikate) verwendet ebenfalls Serverless v2. Serverless v2 hat keine traditionellen Reserved Instances – Sie zahlen pro ACU-Stunde.

Für Teams, die feste Aurora-Instanzen (nicht Serverless) betreiben, sind Reserved Instances erhebliche Einsparungen. Für Serverless v2-Workloads entstehen die Einsparungen durch die Auto-Scaling-Natur des Dienstes – Sie zahlen nicht für ungenutzte Kapazität.

**DynamoDB: On-Demand vs Provisioned**

In Kapitel 9 haben wir DynamoDB’s zwei Kapazitätsmodi: On-Demand und Provisioned eingeführt.

Nimbus hatte DynamoDB seit Beginn der Nutzung im On-Demand-Modus betrieben. Bei geringem Datenverkehr war dies korrekt – On-Demand ist teurer pro Anfrage, aber hat keine Mindestgebühr.

Nun, mit 18 Monaten Datenverkehrsdaten in CloudWatch konnte Tom Muster erkennen.

Durchschnittliche Einheiten für die Lese-Kapazität pro Tag: 45.000
Durchschnittliche Einheiten für die Schreib-Kapazität pro Tag: 12.000
Spitzen-Tag (Freitag): 180 % der durchschnittlichen DynamoDB-Anfragen (ElastiCache absorbiert ca. 95 % des gesamten 25-fachen Bestellvolumens Spikes, sodass DynamoDB nur einen Bruchteil des Gesamtvolumens sieht)

**On-Demand-Preisgestaltung:** 1,25 US-Dollar pro Million Schreibanfragen, 0,25 US-Dollar pro Million Leseanfragen.
**Provisioned-Preisgestaltung:** 0,00065 US-Dollar pro Schreib-Kapazitätseinheit pro Stunde, 0,00013 US-Dollar pro Lese-Kapazitätseinheit pro Stunde.

Tom berechnete den Break-Even-Punkt: Die provisionierte Kapazität wird billiger, wenn Sie sie konsistent genug nutzen, dass Sie während Leerlaufperioden nicht den On-Demand-Bonus zahlen.

Mit 18 Monaten Daten, die konsistente tägliche Muster zeigten, war die provisionierte Kapazität mit **DynamoDB Auto Scaling** die richtige Wahl:

- Minimale Kapazität auf 60 % der durchschnittlichen Last einstellen
- Maximale Kapazität auf 250 % der durchschnittlichen Last einstellen (um Freitagspitzen zu bewältigen)
- Auto Scaling passt die provisionierte Kapazität zwischen diesen Grenzen an

Monatliche DynamoDB-Kosten: sank von 340 US-Dollar (On-Demand) auf 230 US-Dollar (provisioniert mit Auto Scaling). 32 % Reduzierung.

„Aber wenn wir zu viel dimensionieren“, fragte Leo, „bezahlen wir für ungenutzte Kapazität.“

„Das ist das Risiko“, sagte Tom. „Mit Auto Scaling stellen wir die minimale Höhe so hoch ein, dass wir Drosselung vermeiden, und lassen AWS innerhalb unseres Bereichs verwalten.“

„Und wenn sich unser Datenverkehrsverhalten deutlich ändert?“

"Dann passen wir die Grenzen an. Wir überprüfen dies vierteljährlich."

**ElastiCache: Optimierung und Reservierte Knoten**

Die ElastiCache-Rechnung: 183 $/Monat. Ein Cache.r6g.large Redis-Instanz in jeder AZ (zwei Knoten, Primär + Replika).

CloudWatch-Metriken zeigten:

- Durchschnittliche Speicherauslastung: 34 %
- Spitzenlast: 58 %

Die Instanz war überdimensioniert. Ein Cache.r6g.medium würde wahrscheinlich die Last mit Spielraum bewältigen.

Der Wechsel von r6g.large (2 Knoten × 0,127 $/Stunde) zu r6g.medium (2 Knoten × 0,065 $/Stunde):

- Monatsersparnis: 113 $ → warten.

Die Mathematik dahinter: large = 2 × 0,127 × 730 Stunden = 185 $/Monat. Medium = 2 × 0,065 × 730 = 95 $/Monat. Ersparnis: 90 $/Monat.

Tom testete die Medium-Instanz in der Staging-Umgebung für zwei Wochen unter Last. Die Speicherauslastung erreichte 71 %. Nahe der Grenze, was ihn unruhig machte.

Er versuchte cache.r6g.large, aber mit Reservierten Knoten (1-Jahres-Verpflichtung): von On-Demand 185 $ auf Reserviert 120 $/Monat. Ersparnis: 65 $/Monat ohne Änderung des Instanztyps.

"Manchmal führt das Rechtsskalieren auf eine kleinere Instanz zu einem Leistungszwischenfall", sagte er. "Reservierte Knoten geben uns die gleichen Einsparungen mit weniger Risiko."

**RDS-Backup-Aufbewahrung: Der Speicher-Kompromiss**

RDS-automatisierte Backups werden in S3 gespeichert (ohne zusätzliche Kosten für den Speicher bis zu 100 % Ihrer Datenbankgröße). Die Standardaufbewahrungsdauer beträgt 7 Tage.

Für Nimbus's 180 GB Aurora-Datenbank war eine Aufbewahrungsdauer von 7 Tagen angemessen – sie waren in Tests in diesem Zeitraum aus einem Backup wiederhergestellt worden.

Aber Tom stellte fest: Sie hatten auch manuelle Snapshots von jeder bedeutenden Bereitstellung, die unbegrenzt aufbewahrt wurden.

23 manuelle Snapshots, insgesamt 4,1 TB Snapshot-Speicherplatz.
Kosten: 0,095 $/GB/Monat für Aurora-Backups = 389 $/Monat für manuellen Snapshot-Speicherplatz.

Sie behielten die letzten 3 manuellen Snapshots pro Umgebung (Produktion, Staging). Die anderen löschten.
Ersparnis: 350 $/Monat.

"Wir haben 350 Dollar pro Monat für etwas bezahlt, das wir nie benutzt haben", sagte Leo.

"Wir haben für den Gewissheitsfall bezahlt", korrigierte Tom. "Die Frage ist: Wie viel Gewissheitsbedarf ist 350 Dollar pro Monat wert?"

"Mit einem angemessenen Disaster-Recovery-Plan", sagte Priya, "können Sie das gleiche Gefühl der Sicherheit von 7 Tagen automatischen Backups und 3 manuellen Snapshots erhalten."

"Einverstanden. Jetzt."

**Die Datenbank-Optimierungsübersicht**

| Dienst                                           | Vorher     | Nachher    | Monatsersparnis |
|---------------------------------------------------|------------|----------|----------------|
| RDS Read Replicas (nicht genutzt)                        | 340       | 0       | 340           |
| Aurora (Reservierte Instanzen)                       | 190       | 120     | 70            |
| DynamoDB (On-Demand → Provisioned + Auto Scaling) | 340       | 230     | 110           |
| ElastiCache (Reservierte Knoten)                      | 185       | 120     | 65            |
| Aurora manuelle Snapshots                           | 389       | 39      | 350           |
| **Gesamt**                                         | **1.444** | **509** | **935/Monat** |

935 Dollar pro Monat in Datenbank-Einsparungen. 11.220 Dollar pro Jahr.

Tom stellte diese Zahl neben die Einsparungen für den Speicher (6.200 Dollar pro Jahr) und die Savings Plan-Einsparungen (14.200 Dollar pro Jahr) dar.

Gesamte Optimierungsauswirkung: 31.620 Dollar pro Jahr.

"Das sind drei Junior-Ingenieure", sagte Maya.

"Oder einer Senior", sagte Priya.

"Oder zwölf Monate Experimente", sagte Leo.

Alle drei hatten Recht.

## Stärken und Schwächen

**DynamoDB Provisioned mit Auto Scaling**:

- Günstiger als On-Demand für vorhersehbare, konsistente Arbeitslasten
- Auto Scaling verwaltet die Variabilität ohne permanente Überdimensionierung
- Benötigt Überwachung, um sicherzustellen, dass die Kapazitätsgrenzen angemessen bleiben

**RDS Reservierte Instanzen / ElastiCache Reservierte Knoten**:

- Deutliche Einsparungen für stabile, langlaufende Arbeitslasten
- Verpflichtung – wenn Ihre Bedürfnisse sich ändern, haben Sie für ungenutzte Kapazität bezahlt
- Der RI Marketplace ermöglicht den Verkauf ungenutzter RDS RIs (im Gegensatz zu Convertible, das nicht verkauft werden kann)

**Das allgemeine Prinzip**:

- Verstehen Sie die Auslastung immer, bevor Sie optimieren
- Unbenutzte Ressourcen (wie die Legacy-Read-Replicas) sind die höchste Einsparung

**Rechtsdimensionierung erfordert Validierung in der Staging-Umgebung, bevor sie in der Produktion angewendet wird.**

## Zusammenfassung

- **Überprüfen Sie zuerst**: Ziehen Sie CloudWatch-Metriken ab, bevor Sie Datenbankänderungen vornehmen.
- **Löschen Sie nicht genutzte Ressourcen**: Read Replicas, inaktive Datenbanken und Testinstanzen, die nicht mehr benötigt werden.
- **DynamoDB On-Demand vs Provisioned**: On-Demand für unvorhersehbaren Traffic; Provisioned + Auto Scaling für konsistente Muster.
- **ElastiCache Reservierte Knoten**: Wie EC2 Reserved Instances für Redis/Memcached. 30-50 % Einsparungen für stabile Arbeitslasten.
- **RDS Snapshot-Verwaltung**: Bewahren Sie nur die Snapshots auf, die Sie benötigen. Manuelle Snapshots werden unbegrenzt aufbewahrt, es sei denn, sie werden gelöscht.
- **Rechtsdimensionierung mit Vorsicht**: Datenbank-Rechtsdimensionierung birgt das Risiko von Leistungszwischenfällen. Testen Sie in der Staging-Umgebung, validieren Sie unter Last.

## Examenstipps

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.3)*

- **DynamoDB Preismodelle**: On-Demand = Pay-per-Request (höhere Kosten pro Einheit, keine Mindestanzahl). Provisioniert = Pay-per-Kapazitäts-Einheit pro Stunde (niedrigere Kosten pro Einheit, muss Kapazität zugewiesen werden). **DynamoDB Auto Scaling** passt die provisionierte Kapazität automatisch an.
- **RDS Reservierte Instanzen**: Verfügbar für alle RDS-Engine-Typen. Multi-AZ-Bereitstellungen können Reservierte Instanzen verwenden (Sie verpflichten sich zu Multi-AZ). 1- oder 3-Jahres-Laufzeit.
- **ElastiCache Reservierte Knoten**: Gleiches Verpflichtungsmodell wie EC2 Reservierte Instanzen. Wird pro Knoten und nicht pro Cluster angewendet.
- **RDS Snapshot-Speicher**: Automatisierte Backups sind bis zu 100 % der Datenbankgröße kostenlos. Manuelle Snapshots werden pro GB pro Monat in S3 abgerechnet. Examen-Szenario: „Reduzieren Sie RDS-Speicherkosten“ → Löschen Sie alte manuelle Snapshots.
- **DynamoDB reservierte Kapazität**: Ebenfalls für DynamoDB verfügbar (verpflichtet für Lese-/Schreibgeschwindigkeit für 1 oder 3 Jahre mit Rabatt). Anders als die Standard-Provisionierung – Sie zahlen im Voraus für die Kapazität für alle Ihre DynamoDB-Tabellen in einer Region.
- **Aurora Serverless v2 vs. Provisioniert**: Serverless v2 skaliert automatisch, ideal für variable Arbeitslasten. Provisioniert mit Reservierten Instanzen ist kostengünstiger für stabile, vorhersehbare Arbeitslasten.

## Übungen

**Übung 1 – Erinnerung**

Wann sollten Sie die On-Demand-Kapazität von DynamoDB gegenüber der provisionierten Kapazität mit Auto Scaling verwenden? Welche Informationen benötigen Sie, um diese Entscheidung zu treffen?

*(Hinweis: Denken Sie darüber nach, was „vorhersagbar“ in Bezug auf Traffic-Daten bedeutet und welchen Risiken die On-Demand-Kapazität vorstellt, die die provisionierte Kapazität einführt.)*

**Übung 2 – Examenspraxis**

*Szenario*: Ein Unternehmen betreibt eine DynamoDB-Tabelle für die Leaderboard eines mobilen Spiels. Der Traffic steigt stark während eines saisonalen Events (eine Woche pro Quartal, 10-facher Normalverkehr), ist aber sonst sehr konsistent. Außerhalb des saisonalen Events möchte das Unternehmen die Datenbankkosten minimieren und gleichzeitig die Leistung aufrechterhalten.

Welche DynamoDB-Kapazitätsstrategie erfüllt diese Anforderungen am besten?

A) On-Demand-Kapazität, um die Spitzenzeiten ohne Drosselung zu bewältigen
B) Provisionierte Kapazität, die auf Spitzenpegeln (immer provisioniert für 10-facher Traffic) eingestellt ist
C) Provisionierte Kapazität mit DynamoDB Auto Scaling, mit einer maximalen Kapazität für den saisonalen Spitzenverkehr
D) DynamoDB-Reservierungseinheiten für 3 Jahre zu normalen Traffic-Niveaus

*(Hinweis: „Konsistenter Traffic außer für bekannte saisonale Spitzen“ – welche Modus eignet sich dafür effizient?)*

*(Hinweis: „Minimieren Sie die Kosten“ während der Nebenzeiten bedeutet, dass Sie nicht für 10-facher Traffic überprovisionieren sollten.)*

*(Hinweis: DynamoDB Auto Scaling kann während des saisonalen Events hochskalieren und nach dem Event wieder herunterskalieren.)*

**Antwort**: C

**Erläuterung**: Provisionierte Kapazität mit Auto Scaling skaliert die Tabelle basierend auf dem tatsächlichen Traffic. Während der normalen Perioden ist die Kapazität auf Normalniveau (geringe Kosten). Während des saisonalen Events erkennt Auto Scaling den Traffic-Anstieg und skaliert auf das konfigurierte Maximalniveau (bewältigt den 10-fachen Spitzenverkehr). Nach dem Event skaliert es wieder herunter. Dies ist kostengünstiger als On-Demand während normaler Perioden (On-Demand kostet mehr pro Anfrage) und kostengünstiger als die dauerhafte Provisionierung für 10-facher Traffic.

**Warum nicht A?** On-Demand bewältigt Spitzen ohne Drosselung, aber kostet pro Anfrage mehr als provisioniert bei vorhersehbarem, normalem Traffic.

**Warum nicht B?** Die dauerhafte Provisionierung auf 10-facher Ebene bedeutet, dass 75 % der provisionierten Kapazität ungenutzt sind, 75 % der Zeit – Sie zahlen für Kapazität, die nie verwendet wird.

**Warum nicht D?** Reservierungseinheiten sperren Sie an normale Traffic-Niveaus. Während des 10-fachen saisonalen Events würden Sie über den reservierten Betrag hinaus gedrosselt oder Sie müssten On-Demand zusätzlich hinzufügen.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.3*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus evaluiert eine neue Funktion: ein Restaurant-Analysetool, das Echtzeit-Bestellzahlen, Umsatz pro Stunde und Kundendemografie anzeigt. Diese Daten würden eine Datenbank abfragen, etwa 200 Mal pro Minute (eine Abfrage pro Analyst pro Seite-Neuladen, mit 10 Analysten), und zwar mit 10 Analysten.

Derzeit werden die Analysedaten in Athena (S3) gespeichert. Sollten sie das Dashboard auf Athena oder in einer Datenbank erstellen? Wenn eine Datenbank, welche (Aurora, DynamoDB, Redshift)?

Berücksichtigen Sie: Abfragefrequenz, Datenfrischeanforderungen, Abfragekomplexität (Aggregationen, Joins) und Kosten pro Abfrage bei diesem Volumen.

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist es, Datenbankauswahl für Analysen zu üben.)*

## Post-Credits-Szene

Tom präsentierte die vollständige Zusammenfassung der Kostenoptimierung Maya.

Drei Monate Arbeit. 31.620 US-Dollar in jährse Sparpotenzial identifiziert. 26.400 US-Dollar in bereits umgesetzten Änderungen.

„Was sind die restlichen 5.220 US-Dollar?“ fragte Maya.

„Optimierungen, an denen ich noch nicht ganz sicher bin“, sagte Tom. „Die Aurora-Konfiguration könnte weiter rechtskaliert werden, aber ich möchte noch einen weiteren Quartal der Daten sammeln, bevor ich mich festlege. Und es gibt eine Datenübertragungsfrage, die ich noch nicht vollständig analysiert habe.“

„Die Netzwerkkosten.“

„Ja. Das ist das nächste.“

Maya sah sich die Zahlen an. „Tom, ich möchte etwas verstehen. Diese Optimierung – Sie haben daran seit drei Monaten gearbeitet. Das ist ein erheblicher Teil Ihrer Zeit.“

„Ungefähr 30 %.“

„Und Sie haben 26.400 US-Dollar pro Jahr eingespart. Das bedeutet, dass die Optimierung sich in – was, vier Monaten Ihres Gehalts amortisiert?“

Tom sah sie an. „Ungefähr das.“

"Und jedes Jahr danach ist es reine Einsparung."

"Oder reine Neuinvestition", sagte er. "Gleiche Wirkung."

Maya nickte. "Das ist, was ich von dir möchte. Nicht nur bei Speicher und Datenbanken – bei allem. Mache Kostenoptimierung zu einer kontinuierlichen Funktion deiner Rolle."

Tom hatte noch nie seinen Job so beschrieben gehört. Er fand es sowohl genau als auch befriedigend.

Im nächsten Kapitel: die letzte verbleibende Kostenkategorie – und die, die fast jeden überrascht.
