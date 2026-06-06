# Kapitel 32: Den Plan verteidigen

Carlos war zurück, ein paar Wochen nach der Well-Architected-Sitzung. Diesmal blieb der Laptop in seiner Tasche; stattdessen nahm er einen Whiteboard-Marker, begrüßte jede Person im Raum, suchte sich einen Platz nahe dem Board und nahm die Kappe vom Marker.

„Erzählt mir von Nimbus“, sagte er. Als hätte er nie davon gehört.

**Rückblick: Vom Review zur Abrechnung**

Der Well-Architected-Review aus Kapitel 31 hatte drei risikoreiche Befunde zutage gefördert und Mayas wachsendes Bewusstsein, dass es eine Lücke gab zwischen den Entscheidungen, die das Team getroffen hatte, und den Entscheidungen, die es *durchdacht* hatte. Das Framework hatte ihnen ein Vokabular für die Lücke gegeben. Was es ihnen nicht geben konnte, war die Praxis, sie in Echtzeit zu schließen – bevor ein Feature ausgeliefert wurde, nicht danach. Dafür war Carlos hier. Maya hatte ihn gezielt eingeladen, weil Nimbus etwas Bedeutendes bauen wollte und sie eine strukturierte Herausforderung wollte, bevor die erste Zeile Produktionscode geschrieben war.

Ein guter Architektur-Review ist wie eine Pre-Flight-Checkliste für einen Piloten. Das Flugzeug mag perfekt flugbereit aussehen – Triebwerke laufen, Tank voll, Passagiere an Bord. Aber die Checkliste existiert, weil erfahrene Piloten wissen, dass die Dinge, die am wahrscheinlichsten Probleme verursachen, genau die Dinge sind, die sich gut anfühlen, bis sie es nicht mehr tun. Die Checkliste bedeutet nicht, dass der Pilot nicht weiß, was er tut. Sie bedeutet, dass er verinnerlicht hat, dass selbst Experten Dinge übersehen, wenn sie den strukturierten Prozess überspringen.

**Der erste Zug des Architekten**

Was als Nächstes geschah, überraschte das Team.

Maya begann das System zu beschreiben – EC2-Instanzen, Aurora, CloudFront, ElastiCache, DynamoDB für das Menü, VPC mit privaten Subnetzen…

Carlos hielt sie sanft auf.

„Beginnt mit dem Geschäft“, sagte er. „Nicht mit der Technologie.“

Sie hielt inne. Dann: „Nimbus ist eine Restaurant-Bestellplattform. Wir haben 287 Restaurantpartner. Wir verarbeiten etwa 4.200 Bestellungen pro Tag. Der durchschnittliche Bestellwert beträgt 34 $. Wir wachsen um 18 % von Quartal zu Quartal.“

„Gut. Was ist das Wichtigste, was Nimbus tun muss?“

„Bestellungen verarbeiten“, sagte Leo.

„Konkret“, drängte Carlos.

„Eine Bestellung muss innerhalb von fünf Sekunden nach der Aufgabe das Restaurant erreichen“, sagte Priya, „sonst verpasst die Küche das Zeitfenster.“

„Was passiert, wenn nicht?“

„Das Restaurant macht einen Fehler. Der Kunde bekommt das falsche Essen oder wartet zu lange. Er beschwert sich. Wir verlieren einen Restaurantpartner.“

„Also ist die Fünf-Sekunden-SLA“, sagte Carlos, „kein technisches Ziel. Es ist eine geschäftliche Überlebensanforderung.“

Schweigen.

„Das“, sagte er, „ist der Grund, warum Architekturgespräche mit Geschäftsanforderungen beginnen müssen. Die Technologie ist der Einschränkung nachgelagert.“

**Die Struktur des Architektur-Reviews**

Ein echter Architektur-Review – die Art, die stattfindet, bevor man etwas Wichtiges baut, oder wenn man bewertet, ob man skalieren soll – hat eine Struktur.

Carlos schrieb sie auf das Whiteboard:

**1. Die Einschränkungen verstehen**

Was muss wahr sein? Was darf nicht passieren? (Nicht „was wollen wir“. Was sind die nicht verhandelbaren Dinge?)

**2. Die Unbekannten verstehen**

Was wissen wir nicht? Wo treffen wir Annahmen? Was passiert, wenn diese Annahmen falsch sind?

**3. Die Optionen bewerten**

Was sind die realistischen Alternativen? Was sind die Kompromisse jeder?

**4. Die Ausfallmodi identifizieren**

Wie geht das kaputt? Was ist die Ereignisabfolge, wenn jeder Ausfallmodus ausgelöst wird?

**5. Die Überwachung validieren**

Wie werdet ihr wissen, wann etwas nicht stimmt? Bevor Benutzer es euch sagen?

**6. Das Runbook definieren**

Was tut jemand um 3 Uhr morgens, wenn das kaputtgeht?

Das ist keine Checkliste, die man mechanisch befolgt. Es ist ein Denk-Framework. Das Ziel ist sicherzustellen, dass die wichtigen Fragen gestellt werden, *bevor* man in der Produktion ist.

**Den Review durchführen: Das neue Feature von Nimbus**

Carlos war gezielt eingeladen worden, weil Nimbus etwas Neues bauen wollte.

**Das Feature**: „Nimbus Instant“ – eine 15-Minuten-Liefergarantie. Wenn ein Partnerrestaurant das 15-Minuten-Fenster mehr als einmal pro Woche verfehlt, würde Nimbus den Kunden automatisch erstatten.

„Führt mich durch die technischen Anforderungen“, sagte Carlos.

Priya begann. „Wir brauchen Echtzeit-Tracking von der Bestellaufgabe bis zur Lieferung. Wir müssen die tatsächliche Lieferzeit mit der 15-Minuten-SLA vergleichen. Wir müssen automatisch Rückerstattungen auslösen.“

„Was ist die Latenzanforderung für die Tracking-Daten?“

„Nahezu Echtzeit. Kunden sehen Statusaktualisierungen auf ihrem Handy.“

„Innerhalb welcher Zeit?“

„Fünf Sekunden wahrscheinlich.“

„Wahrscheinlich?“

„Innerhalb von fünf Sekunden. Das ist die Produktanforderung.“

„Gut. Dann Kinesis für den Event-Stream. Was ist der Ausfallmodus, wenn Kinesis verzögert ist?“

„Statusaktualisierungen kommen verspätet beim Kunden an.“

„Ist das akzeptabel?“

„Für 10 Sekunden? Wahrscheinlich. Für 60 Sekunden? Nein.“

„Also was ist die SLA für das Tracking-System?“

Priya sah Leo an. „Wir haben noch keine.“

Carlos schrieb auf das Board: *Unbekannt: Tracking-SLA.*

„Das ist wichtig“, sagte er. „Denn die SLA bestimmt das Infrastrukturdesign. Wenn eure SLA 5 Sekunden ist, braucht ihr eine andere Lösung, als wenn sie 60 Sekunden ist.“

„Moment – aber *warum* würden wir es so machen?“, fragte Maya. „Warum nicht einfach einen Polling-Mechanismus verwenden, bei dem die App alle paar Sekunden prüft, statt eines Echtzeit-Push?“

„Latenz und Kosten“, sagte Carlos. „Ein Polling-Ansatz im großen Maßstab – sagen wir 10.000 aktive Bestellungen, jede App pollt alle 5 Sekunden – sind 2.000 Anfragen pro Sekunde oder 120.000 Anfragen pro Minute. Ein Push-Modell über Kinesis liefert Updates nur, wenn sich der Zustand ändert. Weniger Anfragen, niedrigere Latenz, und die SLA-Verpflichtung lässt sich leichter aus einem Event-Log prüfen. Polling funktioniert im kleinen Maßstab. In dem Maßstab, auf den Nimbus zusteuert, ist Push die richtige Grundlage.“

Leo war während Carlos' Erklärung still gewesen. Dann: „Ich wollte das mit WebSockets bauen.“

Carlos sah ihn an. „Führ mich durch.“

„Jede Bestellung bekommt eine WebSocket-Verbindung. Der Client verbindet sich, wenn die Bestellung aufgegeben wird. Der Server pusht Zustandsänderungen – bestätigt, in Zubereitung, unterwegs, geliefert – sobald sie passieren. Kein Polling, niedrige Latenz, einfaches Modell.“

„Was hält die WebSocket-Verbindung aufrecht?“

„Ein API-Gateway-WebSocket-Endpunkt. Lambda-Funktionen handhaben Verbindungs- und Nachrichten-Events. DynamoDB speichert die Verbindungs-IDs.“

Carlos schrieb es auf das Board. „Und der Ausfallmodus, wenn das Netzwerk des Clients für 15 Sekunden abbricht?“

„Die Verbindung wird beendet. Der Client verbindet sich neu und fragt nach dem aktuellen Zustand.“

„Von wo?“

„Vom… Lambda-Handler, der aus DynamoDB liest.“

„Ihr habt also sowohl einen Push-Pfad als auch einen Pull-Pfad“, sagte Carlos. „Der WebSocket-Push ist der Happy Path. Das DynamoDB-Lesen ist der Recovery-Pfad. Wie stellt ihr sicher, dass die Verbindung wiederhergestellt ist, bevor der Kunde bemerkt, dass der Zustand veraltet ist?“

Leo dachte nach. „Der Client erkennt den Abbruch und verbindet sich innerhalb weniger Sekunden neu. Die Reconnect-Logik ist unkompliziert.“

„Bei 10.000 gleichzeitig aktiven Bestellungen – wohin Nimbus zusteuert – wie viele gleichzeitige WebSocket-Verbindungen sind das?“

„10.000.“

„API Gateway WebSocket hat eine Standard-Quote von 500 **neuen Verbindungen pro Sekunde** pro Konto“, sagte Carlos. „Keine gleichzeitigen Verbindungen – Verbindungs*rate*. 10.000 dauerhafte Verbindungen sind in Ordnung. Das Problem ist der Reconnect-Sturm: Wenn ein Netzwerk-Aussetzer ein paar tausend Clients auf einmal abwirft und sie sich alle in denselben zwei Sekunden neu verbinden, erreicht ihr die Ratenquote und Reconnects beginnen genau dann zu scheitern, wenn die Nutzer am aufmerksamsten sind. Man kann eine Erhöhung beantragen, aber es ist eine Quote, die ihr beim Wachsen immer wieder anpassen müsstet. Außerdem: API Gateway WebSocket berechnet 0,25 $ pro Million Verbindungsminuten, plus 1,00 $ pro Million Nachrichten. Bei 10.000 Bestellungen pro Tag mit einem durchschnittlichen 40-Minuten-Tracking-Fenster sind das nur etwa 400.000 Verbindungsminuten pro Tag – Pfennige. Bei 10.000 gleichzeitig aktiven Bestellungen ist es ein anderer Maßstab.“

„Das ist nicht viel“, sagte Leo.

„Nicht bei 10.000 Bestellungen“, sagte Carlos. „Bei diesem Maßstab, nennen wir es grob 150 $ im Monat mit Verbindungsminuten- und Nachrichtengebühren. Die Kosten sind hier nicht das Argument gegen WebSockets. Die Verbindungsraten-Quote unter Reconnect-Stürmen und das Verbindungszustandsmanagement sind es.“

„WebSockets werden also im großen Maßstab kompliziert“, sagte Maya.

„Sie werden im großen Maßstab handhabbar, wenn man dafür architektet“, sagte Carlos. „Es ist nicht falsch – es ist ein anderer Satz von Kompromissen. Lasst mich euch jetzt die Polling-Alternative zeigen.“

Er zeichnete die zweite Option.

„Polling: Der Client sendet alle 5 Sekunden eine GET-Anfrage an `/orders/{order_id}/status`. Das Backend liest aus DynamoDB. Gibt den aktuellen Zustand zurück.“

„Das sind viele Anfragen“, sagte Priya.

„10.000 aktive Bestellungen × 1 Poll pro 5 Sekunden = 2.000 Anfragen pro Sekunde. Eure API muss 2.000 RPS bewältigen. DynamoDB skaliert automatisch. API Gateway bewältigt die Last. Die Kosten: 2.000 RPS × 3.600 Sekunden × 24 Stunden × 30 Tage = 5,18 Milliarden Anfragen pro Monat. API-Gateway-REST-API-Preise: 3,50 $ pro Million Anfragen = 18.130 $/Monat.“

Der Raum war still.

„Das ist im großen Maßstab keine tragfähige Option“, sagte Tom.

„Richtig“, sagte Carlos. „Polling in 5-Sekunden-Intervallen ist die einfachste Implementierung und die teuerste im großen Maßstab. Es erzeugt auch Last proportional zu aktiven Verbindungen, nicht proportional zu Zustandsänderungen. Wenn eine Bestellung 20 Minuten in ‚in Zubereitung‘ verweilt, erzeugt Polling 240 Anfragen, die alle denselben Zustand zurückgeben. Das ist Verschwendung.“

„Und Kinesis?“, fragte Maya.

„Kinesis erzeugt ein Event pro Zustandsänderung. Eine Bestellbestätigung: ein Event. Annahme durch die Küche: ein Event. Abholung durch den Fahrer: ein Event. Lieferung: ein Event. Vier Events pro Bestellung, unabhängig davon, wie lange jeder Zustand dauert. Der Consumer – euer Backend – liest aus dem Kinesis-Stream und pusht das Update über den Liefermechanismus eurer Wahl an den Client.“

„Aber der Client braucht trotzdem eine Möglichkeit, den Push zu empfangen“, sagte Leo.

„Ja. Ihr könnt Server-Sent Events, einen Long-Poll-Endpunkt oder WebSockets für die Last-Mile-Auslieferung verwenden. Kinesis handhabt den zuverlässigen, geordneten, wiederabspielbaren Event-Stream für euer Backend. Der Client-Liefermechanismus ist eine separate Entscheidung. Der Hauptvorteil: Kinesis entkoppelt die Ereignisquelle vom Consumer. Das Lieferverfolgungssystem, das Rückerstattungssystem, das Restaurant-Benachrichtigungssystem und die Kunden-Statusanzeige konsumieren alle unabhängig voneinander aus demselben Kinesis-Stream.“

„Es ist also nicht Kinesis statt WebSockets“, sagte Maya. „Es ist Kinesis plus ein leichtgewichtigerer Client-Liefermechanismus.“

„Genau. Die Kompromissanalyse:“

Er schrieb es:

| Option | Latenz | Kosten (500 / 10K aktive Bestellungen) | Komplexität |
|---|---|---|---|
| Nur WebSockets | ~50 ms | 8 $ / 150 $ pro Monat | Mittel |
| Polling (5 s) | 0–5 s | 906 $ / 18.130 $ pro Monat | Niedrig |
| Kinesis + SSE | ~200 ms | 8 $ / 75 $ pro Monat | Mittel-hoch |

„Die Polling-Option wird durch die Kosten ausgeschlossen“, sagte Carlos. „WebSockets sind tragfähig, erfordern aber Verbindungsmanagement im großen Maßstab. Kinesis plus Server-Sent Events ist geringfügig höhere Latenz und vergleichbar in den Kosten – was es euch kauft, ist das dauerhafte, wiederabspielbare Event-Log, das ihr für das Rückerstattungssystem braucht, und entkoppelte Consumer.“

„Moment – aber *warum* würden wir es so machen?“, fragte Maya. „Wenn WebSockets eine niedrigere Latenz haben, warum eine höhere Latenz von Kinesis plus SSE akzeptieren?“

„Ist 200 ms gegenüber 50 ms für einen Kunden wahrnehmbar, der eine Lieferstatusaktualisierung beobachtet?“, fragte Carlos.

„Nein“, sagte sie.

„Dann liegt der Latenzunterschied unter der Wahrnehmungsschwelle. Der Kostenunterschied bei zehntausend aktiven Bestellungen ist moderat – 75 $ gegenüber 150 $ im Monat. Der architektonische Unterschied ist das eigentliche Argument: Kinesis gibt euch ein dauerhaftes, wiederabspielbares Event-Log – das ihr für den Rückerstattungs-Audit-Trail brauchen werdet – und entkoppelt eure Tracking-Consumer. WebSockets würden erfordern, dass ihr die Entkopplung später neu baut.“

Leo sah auf die Tabelle. „Wir hätten beinahe die WebSocket-Version ausgeliefert.“

„Sie hätte funktioniert“, sagte Carlos. „Das ist das Wichtige zu verstehen. WebSockets hätten funktioniert. Die Frage in der Architektur ist selten ‚funktioniert das?‘ Die Frage ist ‚was kostet das, während es wächst, und was müssen wir später neu bauen?‘“


**Die Fragen, die Architekten stellen**

Über die nächsten zwei Stunden führte Carlos das Team durch den Review. Eine Auswahl seiner Fragen:

**Zur Datenspeicherung**:

„Wo wird der Bestellzustand während der Erfüllung gespeichert? Wenn die Anwendung mitten in der Lieferung abstürzt, was ist der Wiederherstellungsprozess? Könnt ihr den Zustand allein aus Events rekonstruieren?“

**Zum Rückerstattungsmechanismus**:

„Die Rückerstattung wird automatisch ausgelöst. Was verhindert, dass eine Rückerstattung zweimal ausgestellt wird? Was, wenn der Zahlungsabwickler ein Timeout hat und ihr nicht sicher seid, ob die Rückerstattung akzeptiert wurde?“

**Zur Lieferverfolgung**:

„Ihr verlasst euch auf Kurier-GPS-Daten. Was passiert, wenn das GPS-Signal für 90 Sekunden verloren geht? Wie unterscheidet ihr ‚GPS verloren‘ von ‚Lieferung läuft‘ von ‚Lieferproblem‘?“

**Zur Fehlerbehandlung**:

„Wenn der Rückerstattungsdienst ausgefallen ist, geht die Bestellung trotzdem durch? Bekommt der Kunde trotzdem sein Essen? Wie ist die Benutzererfahrung bei einem teilweisen Systemausfall?“

**Zur Beobachtbarkeit**:

„Wie wisst ihr gerade jetzt, wie viele Bestellungen sich derzeit innerhalb von 5 Minuten der 15-Minuten-SLA befinden? Wenn diese Zahl in die Höhe schnellt, wer wird benachrichtigt?“

Jede Frage offenbarte eine Annahme, die das Team getroffen hatte, ohne es zu merken.

„Ich hatte es schon deployt – oh“, sagte Leo. „Der Rückerstattungs-Endpunkt. Ich wollte einfach die Zahlungs-API direkt aufrufen. Wir hatten nicht daran gedacht, sie zweimal aufzurufen.“ Er hielt inne. „Also wenn der erste Aufruf erfolgreich ist, aber unsere Bestätigung auf dem Weg verloren geht, rufen wir erneut auf und der Kunde bekommt zwei Rückerstattungen.“

„Haben wir bedacht, was passiert, wenn die Zahlungs-API den ersten Aufruf akzeptiert, aber unsere Bestätigung auf dem Weg verloren geht?“, fragte Priya.

„Das ist Idempotenz“, sagte Carlos.

„Ein Idempotenz-Schlüssel – eine eindeutige ID pro Rückerstattungsversuch, gespeichert in einer DB, bevor die Zahlungs-API aufgerufen wird“, sagte Priya. „Wenn wir zweimal mit demselben Schlüssel aufrufen, ignoriert die Zahlungs-API den zweiten Aufruf.“

„Was bedeutet“, fügte Carlos hinzu, „dass ihr einen persistenten Zustandsspeicher für Rückerstattungsoperationen braucht, nicht nur ein Event in einer Queue.“


„Die Überwachung, über die wir gesprochen haben“, sagte Carlos, „ist alles Infrastrukturüberwachung. CPU. Verbindungsanzahl. Kinesis-Lag. Diese sind wichtig – aber sie sind nicht die Überwachung, die euch sagt, ob Nimbus Instant funktioniert.“

„Was ist die Überwachung, die uns sagt, dass es funktioniert?“, fragte Maya.

„P95-Bestätigungszeit pro Restaurant. Wie lange dauert es, beim 95. Perzentil, von der Bestellaufgabe bis zur Restaurantbestätigung – separat gemessen für jeden Restaurantpartner?“

„Wir haben diese Metrik nicht“, sagte Priya.

„Das ist die Lücke“, sagte Carlos. „Ihr könnt eine perfekte Infrastruktur haben – CloudWatch grün bei jedem Alarm – und trotzdem einen Restaurantpartner haben, dessen Bestätigungslatenz sich seit drei Wochen verschlechtert, weil ihre Tablet-Software einen Bug hat. Die Infrastruktur ist in Ordnung. Die geschäftliche SLA wird verletzt. Und ihr werdet es nicht wissen, bis das Restaurant anruft, um sich zu beschweren.“

„Wie erfassen wir das?“, fragte Leo.

„Emittiert eine benutzerdefinierte CloudWatch-Metrik oder pusht in eure Analyse-Pipeline, jedes Mal wenn eine Bestellbestätigung empfangen wird. Verseht die Bestellaufgabe mit einem Zeitstempel. Verseht die Bestätigung mit einem Zeitstempel. Berechnet die Differenz. Emittiert sie getaggt mit `restaurant_id`. Baut ein CloudWatch-Dashboard, das die P95-Bestätigungszeit pro Restaurant über die letzten 7 Tage zeigt.“

„Und alarmieren, wenn sie sich verschlechtert?“, fragte Tom.

„Alarmieren, wenn das P95 für ein bestimmtes Restaurant länger als 5 aufeinanderfolgende Minuten 90 Sekunden überschreitet“, sagte Carlos. „Das ist eine Anomalie, die eine proaktive Kontaktaufnahme rechtfertigt, keine Warte-auf-Beschwerde-Reaktion.“

„Das ist der Unterschied zwischen Infrastruktur überwachen und das Produkt überwachen“, sagte Priya.

„Genau“, sagte Carlos. „Infrastrukturüberwachung sagt euch, ob eure Systeme gesund sind. Überwachung auf Geschäftsebene sagt euch, ob eure Kunden das erleben, was ihr ihnen versprochen habt. Ihr braucht beides. Die meisten Teams haben nur das erste.“

Maya fügte es dem ADR-Anhang hinzu: P95-Bestätigungszeit pro Restaurant zusätzlich zu den Infrastruktur-Gesundheitsmetriken verfolgen. Alarmschwellen vom Produktteam in Absprache mit dem Restaurant-Success-Team zu definieren.

„Das ist auch der Punkt, an dem sich Kostenüberwachung und Geschäftsüberwachung überschneiden“, sagte Tom. „Wenn unsere Bestätigungslatenz für eine Teilmenge von Restaurants an Freitagabenden in die Höhe schnellt, könnte die Grundursache ein Lambda-Cold-Start sein, der die Shards dieser Restaurants in Kinesis trifft. Die Geschäftsmetrik offenbart das Symptom. Die Infrastrukturmetriken offenbaren die Ursache.“

„Und die Lösung könnte nicht mehr Infrastruktur sein“, sagte Carlos. „Es könnte Provisioned Concurrency auf der spezifischen Lambda-Funktion sein. Oder es könnte ein Shard-Rebalancing sein. Oder es könnte ein Bug im Bestätigungs-Endpunkt des Restaurants sein. Ihr könnt nicht wissen, welches, bis ihr beide Beobachtbarkeitsebenen habt.“

„Haben wir bedacht, was passiert, wenn wir die Infrastruktur beheben und die Geschäftsmetrik sich trotzdem nicht verbessert?“, fragte Priya.

„Dann liegt die Grundursache nicht in der Infrastruktur“, sagte Carlos. „Was eine wertvolle Information ist. Ohne die Geschäftsmetrik würdet ihr Infrastrukturverbesserungen für ein Problem hinterherjagen, das woanders lebt.“


„Wie viel kostet das pro Monat, wenn wir 500 gleichzeitige Lieferungen verfolgen?“, fragte Tom. „Der Zustandsspeicher, der Kinesis-Stream, die Lambda-Funktionen, die die Events verarbeiten?“

Carlos nickte. „Das ist die richtige Frage, die man jetzt stellt, während man entwirft, nicht nachdem man es gebaut hat.“

Das ist die Art von architektonischem Detail, das in einem strukturierten Review auftaucht – und oft nicht auftaucht, wenn man einfach nur baut.

**Das Architecture Decision Record**

Nach dem Review empfahl Carlos dem Team, ihre Entscheidungen in **Architecture Decision Records (ADRs)** zu dokumentieren – kurze Dokumente, die festhalten:

- **Welche Entscheidung getroffen wurde**
- **Welche Alternativen erwogen wurden**
- **Warum diese Entscheidung getroffen wurde (der Kontext und die Einschränkungen zu jener Zeit)**
- **Was die Kompromisse sind**
- **Was uns dazu bringen würde, diese Entscheidung erneut zu betrachten**

Sie fragen sich vielleicht: Müssen ADRs formale Dokumente sein? Nein. Ein ADR kann ein Absatz in einem Slack-Thread sein, wenn euer Team dort arbeitet. Das Format ist irrelevant. Der Akt, aufzuschreiben, was man entschieden hat und warum – bevor man weitermacht –, ist es, der das institutionelle Gedächtnis schafft.

„ADRs sind für euer zukünftiges Ich“, sagte Carlos. „In 18 Monaten werdet ihr euch ein Architekturstück ansehen und euch fragen, warum es so gemacht wurde. Wenn ihr ein ADR habt, versteht ihr den Kontext. Wenn nicht, werdet ihr es entweder in Ruhe lassen (weil ihr Angst habt, es anzufassen) oder ändern (weil ihr nicht verstanden habt, warum es so gemacht wurde).“

Leo schrieb das erste ADR an diesem Nachmittag: die Entscheidung, Kinesis für die Lieferverfolgungs-Events zu verwenden, mit dem Kontext, den erwogenen Alternativen (SQS, EventBridge, Polling) und den Kompromissen.

Carlos sah sich das ADR an, das Leo entworfen hatte. Er las es in dreißig Sekunden. Dann sagte er: „Zeig dem Team, wie ADR-007 aussieht.“

Leo projizierte es.

---

**ADR-007: Infrastruktur für Lieferverfolgungs-Events**

**Datum**: 2025-03-14
**Status**: Akzeptiert
**Autor**: Leo (mit Review von Carlos, Priya)

---

**Problem**

Nimbus Instant erfordert Echtzeit-Lieferstatusverfolgung. Bestellungen müssen ihren Status aktualisieren (bestätigt → in Zubereitung → unterwegs → geliefert) und diese Updates innerhalb von 5 Sekunden nach der Zustandsänderung an die mobile App des Kunden weitergeben. Das Rückerstattungssystem braucht außerdem ein prüfbares, wiederabspielbares Log von Lieferereignissen, um die SLA-Konformität zu bestimmen.

---

**Erwogene Optionen**

**Option 1: API Gateway WebSocket + DynamoDB-Zustand**
- Client hält eine WebSocket-Verbindung pro Bestellung
- Backend pusht Zustandsänderungen über die offene Verbindung
- Bei Reconnect zieht der Client den aktuellen Zustand aus DynamoDB
- Geschätzte Kosten im großen Maßstab (10K gleichzeitig aktive Bestellungen): ~150 $/Monat
- Schwäche: Verwaltung des Verbindungslimits im großen Maßstab; kein eingebautes Replay für Audit

**Option 2: Client-Polling (5-Sekunden-Intervall)**
- Client pollt `/orders/{order_id}/status` alle 5 Sekunden
- Backend liest bei jedem Poll aus DynamoDB
- Einfachste Implementierung
- Geschätzte Kosten im großen Maßstab (10K gleichzeitig aktive Bestellungen): 18.130 $/Monat
- Aufgrund der Kosten ausgeschlossen

**Option 3: Kinesis Data Streams + Server-Sent Events**
- Lieferzustandsänderungen werden in einen Kinesis-Stream veröffentlicht, dimensioniert nach Durchsatz: Ein Shard nimmt 1 MB/s oder 1.000 Datensätze/s auf. Bei 10K aktiven Bestellungen (~4 Zustandsänderungs-Events pro Bestellung, kleine JSON-Payloads) liegt die Spitzen-Schreibrate bei ~40–50 Events/s – der Wert eines einzigen Shards. 3 Shards für Partitionsverteilung und Consumer-Reserve bereitstellen.
- SSE-Endpunkt abonniert den Kinesis-Shard, der der Bestellpartition zugewiesen ist
- Client empfängt SSE-Events; verbindet sich über die Standard-EventSource-API neu
- Geschätzte Kosten im großen Maßstab (10K gleichzeitig aktive Bestellungen): ~75 $/Monat
- Bietet ein dauerhaftes, wiederabspielbares Event-Log; entkoppelt alle Consumer

---

**Entscheidung**

Option 3: Kinesis Data Streams + SSE.

Begründung: Der Kostenvorteil ist im großen Maßstab erheblich; das Kinesis-Event-Log erfüllt die Rückerstattungs-Audit-Anforderung ohne eine separate Audit-Trail-Implementierung; das SSE-Reconnect-Handling ist einfacher als das WebSocket-Verbindungsmanagement im großen Maßstab.

---

**Konsequenzen**

- *Positiv*: Rückerstattungssystem, Restaurant-Benachrichtigungssystem und Kunden-App konsumieren alle unabhängig voneinander aus demselben Kinesis-Stream. Neue Consumer können hinzugefügt werden, ohne den Producer zu modifizieren.
- *Positiv*: Events sind bis zu 7 Tage wiederabspielbar (unsere konfigurierte erweiterte Aufbewahrung; Kinesis unterstützt bis zu 365 Tage gegen Aufpreis). Wenn die Rückerstattungs-Verarbeitungs-Lambda ausfällt, kann sie verpasste Events erneut abspielen.
- *Negativ*: Die SSE-Latenz (~200 ms) ist höher als die WebSocket-Latenz (~50 ms). Akzeptabel, weil dieser Unterschied unter der Kundenwahrnehmungsschwelle für Statusaktualisierungen liegt.
- *Negativ*: Die provisionierte Kinesis-Preisgestaltung skaliert mit Shard-Stunden, und die erweiterte Aufbewahrung verdoppelt grob die Kosten pro Shard. Die Durchsatzreserve ist groß (ein Shard nimmt 1.000 Datensätze/s auf), aber wenn die Consumer-Anzahl und die Leselast pro Consumer über grob 50K täglich aktive Bestellungen hinaus wachsen, muss die Shard-Anzahl – und eine Re-Shard-/Consumer-Fan-out-Strategie – erneut betrachtet werden.

**Was uns dazu bringen würde, diese Entscheidung erneut zu betrachten**: Wenn das Bestellvolumen so wächst, dass die Kinesis-Shard-Kosten die WebSocket-Kosten im neuen Maßstab übersteigen, oder wenn die 200-ms-SSE-Latenz zu einem Produktdifferenzierungsproblem wird.

---

„Die letzte Zeile“, sagte Maya. „Das ist die, an die ich nicht gedacht hatte.“

„Der Auslöser für die erneute Betrachtung“, sagte Carlos. „Jede Entscheidung hat Bedingungen, unter denen sie falsch wird. Sie aufzuschreiben bedeutet, dass ihr sie erkennen werdet, wenn sie auftauchen.“

„Statt sie in einem Post-Mortem zu entdecken“, sagte Priya.

„Statt dessen, ja.“

Tom las die Kostenkonsequenz. „Die Re-Shard- und Fan-out-Strategie – die haben wir noch nicht.“

„Ihr braucht sie nicht bis zu 50K täglich aktiven Bestellungen“, sagte Carlos. „Bei euren aktuellen 287 Restaurants und 4.200 täglichen Bestellungen habt ihr erhebliche Reserve. Das ADR sagt euch, was zu bauen ist, bevor es dringend wird, nicht bevor es relevant wird.“

Leo hatte sich Notizen gemacht. „Das ADR tut zwei Dinge“, sagte er. „Es dokumentiert, was wir entschieden haben. Und es dokumentiert, was wir als Nächstes entscheiden müssten, wenn sich die Situation ändert.“

„Das ist es, was ein ADR achtzehn Monate lang nützlich macht“, sagte Carlos. „Nicht die Entscheidung selbst – Entscheidungen werden veraltet. Die Begründung. Die Begründung sagt euch, ob die Entscheidung erneut betrachtet werden sollte, selbst wenn die Entscheidung noch in Kraft ist.“


**Was einen Architekten ausmacht**

Am Ende der Sitzung stellte Maya Carlos die ursprüngliche Frage: „Was ist der Unterschied zwischen dem Treffen architektonischer Entscheidungen und dem Denken wie ein Architekt?“

Er überlegte.

„Ein Architekt weiß nicht mehr Technologie als ein Senior Engineer“, sagte er. „Ein guter Architekt kennt wahrscheinlich ein bisschen weniger von den allerneuesten Frameworks. Aber ein Architekt hat einen anderen Standard-Fragensatz.“

„Was meinst du?“

„Wenn du ein Senior Engineer bist und dir ein neues Feature ansiehst, sind deine ersten Fragen normalerweise: ‚Was bauen wir? Wie funktioniert es? Was ist die beste Bibliothek dafür?‘ Wenn ein Architekt sich dasselbe Feature ansieht, sind die ersten Fragen: ‚Welches Problem löst das? Was bricht zuerst, wenn sich der Traffic verdoppelt? Wie wissen wir, wann es sich verschlechtert hat? Was erlebt der Benutzer, wenn der Zahlungsabwickler langsam ist?‘“

„Der Architekt fragt nach dem System unter Stress“, sagte Leo.

„Und nach der geschäftlichen Konsequenz jedes Ausfalls“, fügte Priya hinzu.

„Und“, sagte Tom, „nach dem, was mit der Rechnung passiert, wenn das skaliert.“

Carlos nickte. „Ihr alle tut das bereits. Ihr tut es seit Kapitel 1. Der Unterschied zwischen einem Senior Engineer und einem Architekten ist keine Zertifizierung oder ein Titel. Es ist die Gewohnheit, die nächste Frage zu stellen – die, die das Ding offenbart, an das ihr noch nicht gedacht habt.“

**Variante: Wenn ein Architektur-Review Risiko hinzufügt, statt es zu entfernen**

Wenn euer Review als Genehmigungstor statt als Lernprozess behandelt wird, werden Teams anfangen, Designentscheidungen zu verstecken, um die Verzögerung zu vermeiden – und die Ausfallmodi werden weiterhin existieren, nur undokumentiert. Ein Architektur-Review, der das Ausliefern verlangsamt, ohne die Qualität zu verbessern, ist schlimmer als gar kein Review.

Wenn das Idempotenzproblem für den Rückerstattungsdienst als unerwartete Verzögerung des Feature-Starts statt als notwendige Entdeckung behandelt worden wäre, hätte Leo den ursprünglichen Endpunkt ausgeliefert, die Doppelrückerstattung wäre schließlich aufgetreten, und das Team hätte davon von einem verärgerten Kunden erfahren. Der Review bringt das Problem an einem Punkt zutage, an dem es einen Tag kostet, es zu beheben, kein Rollback.

Der Wert des Reviews ist proportional dazu, wie bereit das Team ist, ihn das Design ändern zu lassen.

## Stärken und Grenzen

**Architektur-Reviews**:

- Fangen Ausfallmodi ab, bevor sie in der Produktion sind
- Schaffen ein gemeinsames Verständnis zwischen Teammitgliedern, die oft isoliertes Wissen haben
- Erzeugen Dokumentation (ADRs), die sich über Jahre auszahlt
- Verlangsamen die Entscheidungsfindung auf vorteilhafte Weise – „schnell bewegen“ ohne Review ist „schnell bewegen und gegen die Wand fahren, die man nicht gesehen hat“

**Wo es kompliziert wird**:

- Erfordert jemanden, der geschickt genug ist, die richtigen Fragen zu stellen – der Review ist nur so gut wie der Prüfer
- Kann bürokratisch werden, wenn er als Häkchen statt als Gespräch behandelt wird
- Manche architektonischen Entscheidungen brauchen wirklich keinen vollständigen Review – zu wissen, welche es tun, ist selbst eine architektonische Fähigkeit
- Die Ausgabe (ADRs, Diagramme, Entscheidungsprotokolle) muss gepflegt werden, während sich das System weiterentwickelt

## Zusammenfassung

Der Review mit Carlos hatte zwei Stunden gedauert und drei ADRs hervorgebracht, eine Liste von sechs Unbekannten, die vor dem Bau des Features zu klären waren, und eine architektonische Änderung (den Idempotenz-Zustandsspeicher), die nach dem Start nachzurüsten schmerzhaft gewesen wäre. Die Pre-Flight-Checklisten-Metapher hatte durchgehend gehalten: Nichts Katastrophales war entdeckt worden, aber mehrere Dinge, die später Probleme verursacht hätten, waren abgefangen und dokumentiert worden, während sie noch leicht zu beheben waren.

- Architektur-Reviews beginnen mit **Geschäftsanforderungen, nicht mit Technologie**.
- Die Review-Struktur: Einschränkungen → Unbekannte → Optionen → Ausfallmodi → Überwachung → Runbooks.
- Architekten fragen: Was bricht zuerst? Wie wissen wir, dass es sich verschlechtert hat? Wie ist die Benutzererfahrung während eines Ausfalls? Wie hoch sind die Kosten im großen Maßstab?
- **Architecture Decision Records (ADRs)** halten fest, was entschieden wurde, warum, und was eine erneute Betrachtung auslösen würde.
- Wie ein Architekt zu denken ist eine Gewohnheit: die nächste Frage zu stellen, besonders zu Ausfallmodi, geschäftlicher Konsequenz und Skalenökonomie.

## Prüfungstipps

*SAA-C03-Domäne: Domänenübergreifend — architektonisches Denken*

Dieses Kapitel handelt weniger von bestimmten Prüfungsthemen und mehr von der Denkweise, die die Prüfung testet.

- **SAA-C03-Szenarien** beschreiben fast immer zuerst eine geschäftliche Einschränkung („das Unternehmen kann sich nicht mehr als 1 Stunde Ausfallzeit leisten“) und bitten Sie, die Architektur auszuwählen, die sie erfüllt. Üben Sie, geschäftliche Einschränkungen in technische Anforderungen zu übersetzen.
- **Ausfallmodus-Denken**: Viele Prüfungsfragen beschreiben ein System und fragen, was passiert, wenn eine Komponente ausfällt. Üben Sie, „was bricht zuerst?“ für die Architekturen zu fragen, denen Sie begegnen.
- **Kompromiss-Denken**: Die Prüfung hat selten eine „perfekte“ Antwort. Sie fragt nach der *besten* Antwort gegeben einen Satz von Einschränkungen. Werden Sie vertraut mit „diese Option ist korrekt gegeben diese spezifischen Anforderungen, auch wenn eine andere Option unter anderen Anforderungen besser wäre“.
- **Architecture Decision Records**: Kein AWS-Dienst, aber eine Best Practice, die die Säule Operational Excellence des Well-Architected Frameworks widerspiegelt.
- **Kinesis für Echtzeit-Event-Streaming**: Das Feature Nimbus Instant des Kapitels verwendet Kinesis für das Streaming von Lieferereignissen. Prüfungssignal: „Echtzeit-Event-Ingestion mit geordneter Verarbeitung“ → Kinesis Data Streams. „Komponenten entkoppeln, At-least-once-Zustellung“ → SQS. Zu wissen, wann man zu welchem greift, ist ein wiederkehrendes Prüfungsmuster.
- **Idempotenz als testbares Muster**: Die SAA-C03 testet häufig Idempotenz in verteilten Systemen. Das Kernmuster: einen eindeutigen Idempotenz-Schlüssel generieren, bevor ein externes System aufgerufen wird; den Schlüssel und das Ergebnis persistieren; bei einem Retry vor der erneuten Ausführung auf den bestehenden Schlüssel prüfen. Wenn gefunden, das zuvor gespeicherte Ergebnis zurückgeben, ohne erneut auszuführen. Das verhindert Doppelbelastungen, Doppelsendungen und doppelte Zustandsmutationen, wenn Retries nach einem Netzwerk-Timeout auftreten. Prüfungssignal: „doppelte Operationen verhindern, wenn ein Service-Aufruf wiederholt wird“ oder „Exactly-once-Verarbeitung von Zahlungsereignissen sicherstellen“ → Idempotenz-Schlüssel in DynamoDB mit Conditional Write gespeichert.
- **Server-Sent Events vs. WebSockets**: SSE ist unidirektional (Server zu Client), verwendet Standard-HTTP und verbindet sich automatisch über die EventSource-API neu. WebSockets sind bidirektional, erfordern Verbindungsmanagement und sind angemessen, wenn der Client auch Daten an den Server pushen muss. Für Lieferstatusaktualisierungen (nur Server-zu-Client) ist SSE einfacher und günstiger als WebSockets im großen Maßstab.

## Übungen

**Übung 1 — Wiederholung**

Carlos stellte während des Architektur-Reviews sechs Arten von Fragen. Können Sie die sechs Bereiche rekonstruieren, ohne ins Kapitel zu schauen?

*(Hinweis: Sie sind im Abschnitt „Die Struktur des Architektur-Reviews“ aufgeführt. Versuchen Sie, sie aus dem Gedächtnis abzurufen – der Akt des Abrufversuchs (auch wenn Sie scheitern) stärkt die langfristige Speicherung.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen baut ein Echtzeit-Gebotsmanagementsystem für Online-Werbung. Gebote müssen innerhalb von 100 Millisekunden bewertet und beantwortet werden. Das System verarbeitet 1 Million Gebote pro Sekunde zur Spitzenzeit. Wenn das Gebotssystem ausfällt, verliert das Unternehmen Werbeeinnahmen. Das Datenbankteam des Unternehmens schlägt vor, RDS Aurora mit 10 Read Replicas zu verwenden. Der Solutions Architect muss bewerten, ob der Vorschlag grundsätzlich tragfähig ist, bevor er seine sekundären Eigenschaften überprüft.

Welches Bedenken sollte der Architekt ZUERST ansprechen?

A) Die Kosten von 10 Aurora Read Replicas sind für das Budget zu hoch  
B) Aurora Read Replicas haben eine Replikationsverzögerung, die Konsistenzprobleme verursachen kann  
C) Aurora's typische Abfragelatenz von 1–5 ms erfüllt möglicherweise nicht die 100-ms-Antwort-SLA  
D) RDS Aurora unterstützt die Transaktionsvolumina von 1 Million Anfragen pro Sekunde bei dieser Latenzanforderung nicht

**Hinweis 1**: Die primäre Einschränkung ist 100 ms Gesamt-Antwortzeit bei 1 Million Anfragen/Sekunde. Welches dieser Bedenken macht, wenn es zutrifft, den Vorschlag undurchführbar, egal wie die anderen drei angegangen werden?

**Hinweis 2**: Die Aurora-Abfragelatenz liegt typischerweise bei 1–5 ms. 1–5 ms für die Datenbankabfrage lassen 95–99 ms für Netzwerk, Anwendungslogik und Serialisierung. Ist die 100-ms-Einschränkung gefährdet?

**Hinweis 3**: Aurora kann hohe IOPS bewältigen, aber 1 Million Anfragen pro Sekunde ist eine außergewöhnliche Rate. Was passiert mit der Architektur bei diesem Maßstab?

**Antwort**: D

**Erläuterung**: Obwohl Aurora leistungsstark ist, sind 1 Million Anfragen pro Sekunde bei 100 ms Gesamt-Antwortzeit eine extreme Anforderung – es ist der architektonische Blocker, der bestimmt, ob der Vorschlag überhaupt existieren kann. Der Architekt sollte zuerst hinterfragen, ob Aurora (oder irgendeine relationale Datenbank) als primäres Lookup-System bei diesem Maßstab und dieser Latenz dienen kann. Systeme wie dieses verwenden typischerweise In-Memory-Datenspeicher (Redis) oder spezialisierte Datenbanken mit geringer Latenz, nicht relationale Datenbanken mit vollständiger SQL-Semantik. Die 100-ms-SLA ist für Aurora-Abfragen allein erreichbar, aber die Kombination aus 1M RPS und 100-ms-Gesamt-SLA überschreitet typische Aurora-Durchsatzmerkmale. „ZUERST“ bedeutet Machbarkeit vor Verfeinerung: Wenn die Engine die Last nicht aufrechterhalten kann, ist jedes andere Bedenken zum Vorschlag hinfällig.

**Warum nicht A?** Kosten sind ein valides Bedenken, aber das erste Bedenken sollte sein, ob die Architektur bei den genannten Anforderungen technisch machbar ist.

**Warum nicht B?** Replikationsverzögerung ist eine reale, aber *sekundäre* Eigenschaft des Vorschlags – eine Eigenschaft, die man abstimmt, sobald die Architektur tragfähig ist. Die Aurora-Replica-Verzögerung liegt typischerweise unter 100 ms und ist für die meisten Anwendungsfälle akzeptabel; sie zuerst anzusprechen würde bedeuten, das Konsistenzverhalten eines Systems zu debattieren, das den erforderlichen Durchsatz von vornherein nicht aufrechterhalten kann. Die Machbarkeitsfrage (D) schließt es ein.

**Warum nicht C?** Aurora-Latenz von 1–5 ms liegt gut innerhalb der 100-ms-SLA für den Datenbankabfrage-Anteil. Das ist nicht das primäre Bedenken.

*SAA-C03-Domäne: Domänenübergreifend — Systemdesign*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Wenden Sie die Struktur des Architektur-Reviews auf ein reales oder hypothetisches System an:

Ein Startup möchte ein Echtzeit-Multiplayer-Quizspiel bauen. Spieler treten Spielräumen bei (bis zu 10 Spieler pro Raum). Jede Runde zeigt 15 Sekunden lang eine Frage; alle Spieler antworten gleichzeitig. Die Punkte werden nach jeder Frage sofort berechnet. Spiele dauern 10 Runden. Spitzennutzung: 50.000 gleichzeitige Spiele.

Gehen Sie den sechsstufigen Review durch:

1. Was sind die nicht verhandelbaren Einschränkungen?
2. Was sind die Unbekannten und Annahmen?
3. Was sind die realistischen Technologieoptionen?
4. Was sind die Ausfallmodi?
5. Wie werden Sie wissen, wann es sich verschlechtert hat?
6. Wie sieht das 3-Uhr-morgens-Runbook aus?

*(Es gibt keine eindeutig korrekte Antwort. Das Ziel ist, die Review-Struktur als Denkwerkzeug zu üben.)*

## Post-Credits-Szene

Carlos verließ das Büro um 18 Uhr.

Das Team saß danach eine Weile da, ohne etwas Bestimmtes zu tun.

„Ich habe das Gefühl, in diesen zwei Stunden mehr gelernt zu haben als in jedem einzelnen AWS-Dienst-Kapitel“, sagte Leo.

„Das liegt daran, dass diese Kapitel von Werkzeugen handelten“, sagte Maya. „Das hier handelte von Urteilsvermögen.“

„Ist Urteilsvermögen lehrbar?“, fragte er.

„Ja“, sagte Priya. „Aber nicht durch Lesen. Durch Übung. Durch das Treffen von Entscheidungen, das Sehen, was kaputtgeht, das Nachdenken über das Warum.“

„Durch Erfahrung“, sagte Tom.

„Durch strukturierte Erfahrung“, korrigierte Priya. „Erfahrung ohne Reflexion baut kein Urteilsvermögen auf. Man muss die Fragen danach stellen.“

Maya sah auf das Whiteboard. Die Review-Notizen waren noch da – Einschränkungen, Unbekannte, Ausfallmodi, Überwachungsfragen. Es füllte zwei Whiteboards.

„Das sollte ins ADR“, sagte sie.

Leo tippte bereits.

Im letzten Kapitel: das eine, das kein Werkzeug oder Framework geben kann – und warum „es kommt darauf an“ die ehrlichste und mächtigste Antwort in der Softwarearchitektur ist.
