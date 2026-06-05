# Kapitel 24: Die Datenbank, die mit einem wächst

Toms Kostenüberprüfung hatte etwas Unerwartetes in der Datenbankebene gefunden.

Nimbus betrieb RDS PostgreSQL: Multi-AZ, db.r6g.large-Instanz. 340 $/Monat.

„Das scheint hoch", sagte Tom. „Aber ich bin nicht sicher, womit ich es vergleichen soll."

Leo rief die Performance-Metriken auf. Die Datenbank-CPU stieg während des Freitag-Abendansturms auf 85 %. Leseanfragen standen in der Warteschlange. Die P95-Abfragelatenz hatte sich in sechs Monaten verdoppelt.

„Die Datenbank ist der Engpass", sagte er. „Der Traffic ist gewachsen. Die Datenbank ist nicht damit gewachsen."

„Können wir einfach eine größere Instanz nehmen?", fragte Maya.

„Ja", sagte Leo. „Das ist vertikales Skalieren. Wir wechseln von r6g.large zu r6g.xlarge. Mehr CPU, mehr Speicher. Es kostet mehr und kauft uns Zeit."

„Aber es behebt nicht das zugrunde liegende Problem", sagte Priya. „Schließlich werden wir die größte Instanz erreichen und brauchen einen anderen Ansatz."

„Es gibt zwei Ansätze", sagte Leo. „Read Replicas oder Aurora."

„Was ist der Unterschied?"

Eine gute Frage. Der Rest dieses Kapitels ist die Antwort.

Denk an eine belebte Bibliothek mit einem Bibliothekar, der sowohl Bücher ein- und auscheckt als auch Fragen der Besucher beantwortet. Wenn die Bibliothek beliebter wird, bildet sich eine Warteschlange. Die Lösung: mehr Bibliothekare einstellen – aber nur für die Beantwortung von Fragen. Das Einchecken läuft immer noch über den ursprünglichen Schalter. Das ist eine Read Replica: zusätzliche Kapazität, die Lesevorgänge verarbeitet, während alle Schreibvorgänge noch über die eine maßgebliche Quelle laufen. Aurora geht einen Schritt weiter und gestaltet das Regalsystem selbst neu, so dass jeder Bibliothekar dieselben Regale teilt und immer dieselben Bücher sieht, ohne Verzögerung.

**Read Replicas: Lesedatenverkehr verteilen**

Die meisten Webanwendungen lesen Daten viel häufiger, als sie schreiben. Ein Kunde, der das Menü durchstöbert, macht Dutzende von SELECT-Abfragen. Eine Bestellung aufgeben macht einige INSERT/UPDATE-Abfragen. Das Verhältnis ist typischerweise 10:1 oder höher.

Eine **Read Replica** ist eine zusätzliche RDS-Instanz, die eine Kopie aller Schreibvorgänge vom Primär empfängt und diese Schreibvorgänge für SELECT-Abfragen verfügbar macht.

So funktioniert es:

1. Anwendungsschreibvorgänge (INSERT, UPDATE, DELETE) gehen zur primären Datenbank
2. Das Primär repliziert diese Änderungen asynchron an Read Replicas
3. Anwendungslesevorgänge (SELECT) werden über Read Replicas verteilt
4. Read Replicas teilen die Last – jede verarbeitet einen Bruchteil des gesamten Lese-Traffics

Das Ergebnis: Die primäre Datenbank verarbeitet nur Schreibvorgänge (und optional einige Lesevorgänge). Read Replicas verarbeiten die Leselast. Bei einem 10:1-Lese-/Schreibverhältnis halbiert das Hinzufügen einer Read Replica ungefähr die Gesamtlast des Primärs.

**Wichtige Einschränkung**: Die Replikation ist **asynchron**. Es gibt Replikationsverzögerung – typischerweise Millisekunden, kann aber unter Last Sekunden betragen. Ein Lesevorgang von einer Replica sieht möglicherweise Daten, die leicht hinter dem Primär zurückliegen. Für die meisten Lesevorgänge (Menü durchstöbern, Bestellhistorie anzeigen) ist das akzeptabel. Für „Ist meine Bestellung gerade durchgegangen?" – vom Primär lesen.

**Read Replicas: Die Details**

- Man kann bis zu 5 Read Replicas pro primärer RDS-Instanz haben
- Read Replicas können sich in derselben Region oder einer anderen Region befinden (regionsübergreifende Replicas)
- Read Replicas können selbst Read Replicas haben (Verkettung)
- Read Replicas sind separate Endpunkte – die Anwendung muss Lesevorgänge an den Replica-Endpunkt weiterleiten
- Read Replicas können zu eigenständigen Datenbanken hochgestuft werden (nützlich für DR)

Bei Nimbus fügte Leo eine Read Replica hinzu. Er aktualisierte die Anwendung:

- Schreibvorgänge → primärer Endpunkt
- Menü-Browsing, Bestellhistorie → Replica-Endpunkt

CPU im Primär sank von 85 % auf 41 % in der Spitzenzeit.

Tom sah sich die Kosten an: Eine Read Replica des gleichen Instanztyps kostet dasselbe wie das Primär. Von 340 $/Monat auf 680 $/Monat.

„Wir haben die Kosten verdoppelt, um die Last ungefähr zu halbieren", sagte Tom.

„Ja. Aber die Alternative war der Wechsel zu einem größeren Instanztyp, was auch mehr kosten und die Leselast nicht verteilen würde."

Tom rechnete nach. Er nickte, widerstrebend.

„Was ist Aurora?", fragte er.

**Amazon Aurora: Die Datenbank-Engine neu denken**

Aurora ist AWSs proprietäre relationale Datenbank-Engine, kompatibel mit MySQL und PostgreSQL. Sie wurde von Grund auf für Cloud-Workloads entwickelt und gestaltet die Funktionsweise der Speicherschicht einer relationalen Datenbank neu.

In einem traditionellen RDS-Setup (MySQL, PostgreSQL) sind Speicher und Computing eng gekoppelt. Die Datenbank-Engine verwaltet die Datendateien. Replikation kopiert die Daten vom Primär zur Replica. Die Replica muss jeden Schreibvorgang wiederholen.

Aurora trennt Speicher von Computing. Es verwendet eine verteilte, fehlertolerante Speicherschicht, die Daten automatisch über drei Availability Zones in sechs Kopien repliziert. Die Computing-Schicht (die Datenbankinstanzen) sitzt auf dieser Speicherschicht.

**Was sich dadurch ändert**:

**Read Replicas**: Aurora-Replicas müssen keine Daten replizieren – sie teilen bereits dieselbe Speicherschicht. Das bedeutet:

- Bis zu 15 Read Replicas (vs. 5 für reguläres RDS)
- Replikationsverzögerung ist typischerweise unter 100 Millisekunden (vs. Sekunden für RDS unter Last)
- Replicas können in unter 30 Sekunden zum Primär hochgestuft werden (vs. Minuten)

**Failover**: Da Replicas den Speicher teilen, ist der Failover viel schneller – die Hochstufung beinhaltet keine Datenübertragung, nur die Umleitung von Schreibvorgängen.

**Speicher**: Aurora skaliert den Speicher automatisch in 10-GB-Schritten auf bis zu 128 TB. Man stellt den Speicher nie im Voraus bereit.

**Performance**: Aurora behauptet, den 5-fachen Durchsatz von Standard-MySQL und den 3-fachen von Standard-PostgreSQL für äquivalente Instanztypen zu liefern.

**Aurora-Preisgestaltung: Die Tom-Frage**

„Wie viel kostet das?", fragte Tom.

Die Aurora-Preisgestaltung unterscheidet sich von RDS:

**Instanzpreisgestaltung**: Ähnlich wie RDS-Instanzpreisgestaltung nach Typ.

**Speicherpreisgestaltung**: 0,10 $ pro GB pro Monat (man zahlt für das Gespeicherte, automatisch skaliert).

**I/O-Preisgestaltung**: Aurora berechnet Gebühren pro I/O-Anfrage (Lesen/Schreiben in den Speicher). Das kann für schreibintensive Workloads erheblich sein.

„Warte", sagte Tom. „Wir zahlen separate Gebühren für I/O?"

„Aurora Serverless v2 und Aurora I/O-Optimized ändern dieses Preismodell", sagte Leo. „Aurora I/O-Optimized berechnet keine I/O-Gebühr, aber einen höheren Speicher- und Instanzpreis. Besser für I/O-intensive Workloads."

Tom betrachtete den Kompromiss. Für Nimbus, das leselastig war (viele Menüabfragen, wenige Schreibvorgänge), könnte Aurora I/O-Optimized mehr kosten. Standard Aurora-Preisgestaltung könnte angemessen sein.

Das ist eine echte Kostenentscheidung, die Senior-Engineers treffen: Man muss die I/O-Muster des Workloads kennen, um korrekt zu wählen.

**Aurora Serverless: Skalieren ohne über Instanzen nachzudenken**

**Aurora Serverless v2** ist eine Konfiguration, die die Computing-Kapazität basierend auf der tatsächlichen Datenbanklast automatisch skaliert. Anstatt eine feste Instanzgröße zu wählen (db.r6g.large), setzt man eine Mindest- und Maximalkapazität in Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Skaliert in Sekunden hoch, wenn die Last zunimmt
- Skaliert während Leerlaufzeiten fast auf null herunter
- Kosten: 0,12 $ pro ACU-Stunde (plus Speicher und I/O)

Für Workloads mit variablem Traffic – Nimbus' Freitagsspitzen vs. ruhige Montagmorgen – reduziert Serverless v2 die Kosten in Schwachlastzeiten und verarbeitet Spitzen ohne Vorab-Bereitstellung.

„Während der Freitagsspitze", sagte Leo, „skaliert Aurora automatisch hoch. Sonntagmorgen, wenn wir fast keinen Traffic haben, skaliert es auf das Minimum zurück."

„Und wir zahlen nur für die Kapazität, die wir nutzen", sagte Tom.

„Genau."

Tom hatte den Ausdruck von jemandem, der genau das gefunden hat, wonach er gesucht hat.

**Aurora Global Database: Multi-Region-Lesevorgänge**

**Aurora Global Database** erstreckt Aurora über mehrere AWS-Regionen:

- **Eine primäre Region** verarbeitet alle Schreibvorgänge
- **Bis zu fünf sekundäre Regionen** bedienen Lesevorgänge mit typischerweise < 1 Sekunde Replikationsverzögerung
- Sekundäre Regionen können in unter 1 Minute zum Primär hochgestuft werden (für DR-Szenarien)

Für Nimbus' globale Expansion würde Aurora Global Database einem Restaurantpartner in London ermöglichen, sein lokales Menü von der EU-Read Replica abzufragen, während alle Bestellungen (Schreibvorgänge) noch über das US-Primär laufen.

**RDS vs. Aurora: Wann was wählen**

| Faktor              | RDS (PostgreSQL/MySQL)        | Aurora                                                           |
|---------------------|-------------------------------|------------------------------------------------------------------|
| Kosten              | Niedriger für kleine Workloads | Höhere Basis, skaliert aber besser                               |
| Kompatibilität      | Vollständig                   | MySQL/PostgreSQL-kompatibel (mit kleinen Unterschieden)          |
| Max. Replicas       | 5                             | 15                                                               |
| Replikationsverzögerung | Kann Sekunden betragen    | Gewöhnlich < 100 ms                                              |
| Speicher            | Feste Bereitstellung          | Automatische Skalierung auf 128 TB                               |
| Failover-Zeit       | 60-120 Sekunden               | < 30 Sekunden                                                    |
| Serverless-Option   | Begrenzt                      | Aurora Serverless v2                                             |
| Am besten für       | Stabile, vorhersehbare Workloads | Variablen Traffic, hohes Lesevolumen, schnellen Failover-Bedarf |

## Stärken und Grenzen

**Aurora-Stärken**:

- Erheblich schnellerer Failover als Standard-RDS
- Bis zu 15 Read Replicas mit minimaler Verzögerung
- Automatisch skalierender Speicher
- Serverless v2 für variable Workloads
- Global Database für Multi-Region-Deployment

**Aurora-Einschränkungen**:

- Höhere Kosten für kleine, stabile Workloads
- I/O-Preisgestaltung kann für schreibintensive Workloads erheblich sein (I/O-Optimized dafür verwenden)
- Geringfügige MySQL/PostgreSQL-Kompatibilitätsunterschiede können Code-Änderungen erfordern
- Serverless v2-Kaltstarts (von nahe null) können Latenzspitzen verursachen

## Zusammenfassung

- **Read Replicas** verteilen den Leseverkehr vom Primär. Asynchrone Replikation – leichte Verzögerung für die meisten Lesevorgänge akzeptabel.
- **Aurora** gestaltet die Speicherschicht neu: verteilt, über Replicas geteilt, automatisch skalierend.
- Aurora bietet: 15 Read Replicas, < 100 ms Replikationsverzögerung, < 30 s Failover, bis zu 128 TB automatisch skalierender Speicher.
- **Aurora Serverless v2**: Skaliert die Computing-Kapazität automatisch basierend auf der Last. Gut für variablen Traffic.
- **Aurora Global Database**: Primär in einer Region, Read Replicas in bis zu fünf Regionen.
- RDS für kleinere, stabile, vorhersehbare Workloads wählen. Aurora wählen, wenn Skalierung, schneller Failover oder Handhabung variablen Traffics erforderlich ist.

## Prüfungstipps

*SAA-C03-Domäne: Hochleistungsarchitekturen entwerfen (Domäne 3, Aufgabe 3.3)*

- **Aurora Replica vs. RDS Read Replica**: Aurora-Replicas teilen Speicher (nahezu null Verzögerung, < 30 s Failover). RDS Read Replicas replizieren Daten (Verzögerung möglich, Minuten für Failover).
- **Aurora Serverless v2**: „Datenbankkapazität automatisch skalieren", „unvorhersehbarer oder unregelmäßiger Datenbank-Traffic", „auf null skalieren" → Aurora Serverless v2.
- **Aurora Global Database**: „Multi-Region-Datenbank", „aus EU mit niedriger Latenz von US-Primär lesen", „RTO < 1 Minute für regionalen Failover" → Aurora Global Database.
- **Failover-Timing**: Aurora < 30 Sekunden. RDS Multi-AZ 60-120 Sekunden. Beide kennen.
- **Aurora I/O-Optimized**: Höhere Speicher- und Instanzkosten, keine I/O-Gebühr pro Vorgang. Verwenden, wenn I/O-Kosten dominieren (schreibintensiv). Standard Aurora: niedrigere Speicherkosten, pro I/O zahlen. Für leselastige Workloads verwenden.
- **Aurora Backtrack**: Die Datenbank auf einen bestimmten Zeitpunkt zurückspulen, ohne aus einem Backup-Snapshot wiederherstellen zu müssen. Nur für MySQL-kompatibles Aurora verfügbar. Prüfungssignal: „versehentlich Daten gelöscht, schnell ohne vollständige Backup-Wiederherstellung wiederherstellen müssen."

## Übungen

**Übung 1 – Wiederholen**

Erkläre den Unterschied zwischen Aurora und Standard-RDS Read Replicas. Warum ist Auroras Replikationsverzögerung typischerweise niedriger?

*(Hinweis: Der Hauptunterschied ist geteilter Speicher vs. Datenreplikation. Denke darüber nach, was jede Replica tun muss, wenn ein Schreibvorgang ankommt.)*

**Übung 2 – Prüfungsübung**

*Szenario*: Die MySQL-Datenbank einer Social-Media-Plattform erfährt aufgrund von zunehmendem Traffic hohe Lese-Latenz. Die Anwendung ist leselastig (95 % Lesevorgänge, 5 % Schreibvorgänge). Das Team benötigt konsistente Lese-Latenz, auch während Traffic-Spitzen. Sie benötigen automatischen Failover mit minimaler Ausfallzeit (RTO-Ziel < 30 Sekunden). Das Datenvolumen wächst unvorhersehbar.

Welche Datenbanklösung erfüllt diese Anforderungen OPTIMAL?

A) RDS MySQL Multi-AZ mit fünf Read Replicas  
B) Aurora MySQL mit Aurora-Replicas und Aurora Serverless v2  
C) RDS MySQL mit einem größeren Instanztyp (vertikales Skalieren)  
D) DynamoDB mit DynamoDB DAX für Lese-Caching

**Hinweis 1**: „RTO < 30 Sekunden" – welcher Dienst erreicht das? Failover-Timing für jede Option prüfen.

**Hinweis 2**: „Konsistente Lese-Latenz bei Spitzen" – welcher Dienst hat Replicas mit nahezu null Verzögerung vs. potenziell Sekunden Verzögerung?

**Hinweis 3**: „Unvorhersehbar wachsendes Datenvolumen" – welcher Dienst skaliert den Speicher automatisch?

**Antwort**: B

**Erläuterung**: Aurora MySQL mit Aurora-Replicas bietet nahezu null Replikationsverzögerung (Millisekunden, nicht Sekunden) für konsistente Lese-Performance unter Last. Aurora Serverless v2 skaliert Computing während Traffic-Spitzen automatisch ohne Überbereitstellung. Aurora-Speicher skaliert automatisch, wenn Daten wachsen. Aurora-Failover (Hochstufung einer Replica) schließt in unter 30 Sekunden ab – erfüllt die RTO-Anforderung.

**Warum nicht A?** RDS Multi-AZ-Failover dauert 60-120 Sekunden – erfüllt RTO < 30 Sekunden nicht. Standard-RDS-Read-Replica-Verzögerung kann unter Last Sekunden erreichen – „konsistente" Lese-Latenz ist schwerer zu garantieren.

**Warum nicht C?** Vertikales Skalieren (größere Instanz) erhöht die Kapazität, verteilt aber die Leselast nicht. Die Datenbank bleibt ein Single Point of Failure für Lesevorgänge.

**Warum nicht D?** DynamoDB ist NoSQL – die Migration von MySQL zu DynamoDB erfordert eine Neugestaltung des Datenmodells und der Anwendungsabfragen, was weit über den Umfang dieser Performance-Verbesserungsaufgabe hinausgeht.

*SAA-C03-Domäne: Hochleistungsarchitekturen entwerfen – Aufgabe 3.3*

**Übung 3 – Architektur-Challenge** *(Optional)*

Nimbus plant eine globale Expansion. Restaurantpartner an der Westküste, in Deutschland und in Australien sollen ihre eigenen Bestelldaten schnell sehen, ohne regionsübergreifende Latenz. Alle Schreibvorgänge müssen jedoch über ein einzelnes US-East-Primär laufen, um Konsistenz zu gewährleisten.

Entwirf die Datenbankarchitektur mit Aurora. Wie würdest du die Global Database strukturieren? Was passiert, wenn das US-East-Primär ausfällt? Wie würdest du den Hochstufungsprozess handhaben?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, Multi-Region-Datenbankdesign zu üben.)*

## Post-Credits-Szene

Leo migrierte zu Aurora mit Serverless v2.

Die Freitagsspitze kam und ging. Die CPU überschritt nie 60 %. Die Abfragelatenz blieb konsistent. Aurora hatte automatisch hochskaliert, um die Last zu verarbeiten, dann nach dem Ansturm wieder herunterskaliert.

„Was hat das im Vergleich zum letzten Freitag gekostet?", fragte Tom am Montagmorgen.

Leo rief den Billing-Explorer auf. „Freitag hatte einen Spitzenwert von 0,89 $/Stunde. Samstagmorgen war es 0,11 $/Stunde."

Tom sagte nichts.

„Das alte Setup war ein fixer Betrag von 0,47 $/Stunde, unabhängig von der Last", ergänzte Leo.

„Wir haben während der Spitze mehr bezahlt als zuvor", sagte Tom.

„Ja. Aber erheblich weniger außerhalb der Spitzenzeiten. Die Nettokosten über die Woche sind niedriger."

Tom rechnete. Dann nickte er.

„Hier ist eine Lektion", sagte er. „Die richtige Frage ist nicht ‚Ist das günstiger?' Es ist ‚Ist das günstiger für unser tatsächliches Nutzungsmuster?'"

„Das", sagte Priya von der anderen Seite des Raumes, „ist der Instinkt eines Senior-Engineers."

Tom sah leicht beunruhigt aus, so beschrieben zu werden.

Im nächsten Kapitel: wenn dein Netzwerk der Engpass ist, und warum eine private Autobahn die Maut wert sein könnte.
