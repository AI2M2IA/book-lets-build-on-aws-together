# Kapitel 9: Wenn die Tabelle groß wird

Die Küche von Nimbus' erstem Restaurantpartner roch selbst um zehn Uhr morgens nach Knoblauch und warmem Brot. Maya war für eine Demo dort und beobachtete, wie ein Koch durch die App wischte, um einen Austausch zu erfassen – Fisch statt Garnelen, vorübergehend nicht verfügbar. Das Wischen geschah. Die Speisekarte aktualisierte sich. Ein Kunde in einem anderen Teil der Stadt sah die Änderung innerhalb von Sekunden.

Das hatte sich wie Magie angefühlt.

Zurück im Büro hatte die Magie begonnen, langsamer zu werden.

Die Menütabelle hatte 50.000 Artikel.

Das verteilte sich auf 287 Restaurants – die Partnerzahl war von den siebenundvierzig aus den Load-Balancer-Tagen auf knapp dreihundert in weniger als einem Jahr explodiert – jedes mit täglichen Sonderangeboten, saisonalen Artikeln und regionalen Variationen. Einige Artikel hatten Modifikatoren – Größe, Schärfegrad, Proteinauswahl. Einige hatten Kombiangebote, die auf andere Artikel verwiesen. Einige erschienen nur an Wochentagen auf der Speisekarte, oder nur während der Mittagszeit, oder nur in bestimmten Städten.

Die SQL-Abfrage, die das vollständige Menü eines Restaurants abrief, lieferte früher in 200 Millisekunden Ergebnisse.

Jetzt dauerte sie vier Sekunden.

Vier Sekunden sind der Unterschied zwischen jemandem, der eine Bestellung aufgibt, und jemandem, der die App schließt. Leo hatte den Abfrageplan ausgeführt. Tom hatte sich die Indexkonfiguration angesehen. Priya hatte die Anzahl der Read Replicas erhöht. Nichts davon hatte einen spürbaren Unterschied gemacht.

Und das veränderte die Stimmung im Raum.

---

**Der erste Versuch: Mehr Indizes**

Leo hatte den Abfrageplan offen. Er ging ihn sorgfältig durch.

„Das Problem ist dieser Join“, sagte er. „Wenn wir das Menü eines Restaurants abrufen, verknüpfen wir die Tabelle menu_items mit der Tabelle modifiers, dann mit der Tabelle combos, dann mit der Tabelle availability_windows. Vier Tabellen, drei Joins, fünfzigtausend Zeilen.“

Er fügte in jeder Tabelle einen Index auf `restaurantId` hinzu. Er führte die Abfrage erneut aus. Zwei Sekunden. Besser, aber nicht gut genug.

Tom hatte etwas über Query Hints gelesen. Er verbrachte einen Nachmittag mit Optimierungen. Eine Komma drei Sekunden. Immer noch nicht gut.

„Was, wenn wir denormalisieren?“, fragte Leo. „Die Modifikatoren als JSON-Spalte direkt in die Tabelle menu_items packen. Weniger Joins.“

Sie probierten es aus. Glatte eine Sekunde. Es fühlte sich nach Fortschritt an. Maya schickte den Restaurantpartnern eine Nachricht, dass sie das Geschwindigkeitsproblem behoben hätten. Das war ein Dienstag.

Am Donnerstag war die Abfrage wieder bei 2,8 Sekunden. Ihre Daten waren gewachsen. Mehr Restaurants waren hinzugekommen. Mehr Artikel pro Restaurant. Die Abfrage, die sich gelöst angefühlt hatte, war nicht gelöst.

„Der Index-Ansatz hält mit den heutigen Daten Schritt“, sagte Priya. „Aber wir fügen vierzig Restaurants pro Woche hinzu. Bis zum nächsten Quartal haben wir doppelt so viele Artikel. Wie sieht die Abfrage dann aus?“

„Mindestens drei Sekunden“, sagte Leo. „Wahrscheinlich fünf.“

„Wir haben uns also ein paar Wochen erkauft.“

„Ja.“

Sie ließen das auf sich wirken. Eine Lösung, die verfällt, ist keine echte Lösung.

---

**Der zweite Versuch: Read Replicas**

Priya hatte die Anzahl der Read Replicas bereits einmal erhöht. Sie versuchte es erneut – jetzt zwei Read Replicas, und die Anwendung verteilte die Last zwischen ihnen. Die Theorie war stimmig: den Lese-Traffic verteilen, jede Replik macht weniger Arbeit.

Es half ein wenig. Die Spitzenlast sank von 2,8 Sekunden auf 2,2 Sekunden.

„Das liegt daran, dass der Engpass nicht die Anzahl der Lesevorgänge ist“, sagte Tom mit Blick auf die Datenbankmetriken. „Es ist die Abfrage selbst. Mehr Replikate bedeuten mehr Server, die dieselbe langsame Abfrage ausführen. Die Abfrage ist immer noch langsam.“

„Wie viel kostet das pro Monat?“, fügte er hinzu, denn er fragte immer. „Zwei zusätzliche Read Replicas auf einer db.r5.large – das sind etwa 350 Dollar im Monat. Für eine Verbesserung von zwei Sekunden.“

Leo schloss das Replica-Panel.

„Mehr Hardware behebt also keine schlechte Abfrage“, sagte Maya.

„Wenn ein Problem das Indizieren, die Caching-Versuche und zusätzliche Replikate übersteht“, sagte Leo langsam, „dann ist das Problem vielleicht nicht die Konfiguration. Vielleicht ist es die Form des Systems.“

Das war der Beginn eines längeren Gesprächs.

---

*Letzte Woche hatte das Team RDS endlich unter Kontrolle bekommen. Multi-AZ-Standby, automatisierte Backups, eine Read Replica, die Reporting-Abfragen verarbeitete. Das DBA-Problem – das, das Leo früher nachts wachhielt – war gelöst. Die verwaltete Datenbankschicht war stabil. Aber stabil bedeutete nicht schnell, und schnell war jetzt das Problem. Die Menütabelle hatte begonnen, an Grenzen zu stoßen, die mehr Replikate nicht beheben konnten. Die Form der Daten selbst war falsch.*

---

**Das Problem damit, alles in eine Tabelle zu packen**

Hier ist die Kernspannung relationaler Datenbanken: Sie sind dafür konzipiert, *strukturierte* Daten in *festen* Formen zu speichern.

Wenn jeder Menüpunkt dieselben Felder hätte – Name, Preis, Beschreibung, Kategorie – wäre SQL perfekt. Sie hätten eine saubere `menu_items`-Tabelle, Zeilen für jeden Artikel und Abfragen, die Sinn ergeben.

Aber echte Speisekarten funktionieren nicht so.

Ein Artikel könnte einen „Schärfegrad“-Modifikator haben. Ein anderer könnte eine „Proteinauswahl“ haben. Ein dritter könnte verschachtelte Kombis haben – „Bestellen Sie die Familienmahlzeit und Sie erhalten zwei Hauptgerichte, zwei Beilagen und ein Getränk.“ Die Struktur der Daten variiert *pro Artikel*.

In SQL haben Sie zwei Optionen:

**Option 1**: Erstellen Sie eine Spalte für jeden möglichen Modifikator. Das erzeugt eine sehr breite Tabelle, bei der die meisten Spalten die meiste Zeit leer sind.

**Option 2**: Erstellen Sie eine separate Modifikatortabelle und verknüpfen Sie diese mit der Menütabelle. Das funktioniert, aber komplexe Menüs erfordern mehrere Joins, und bei fünfzigtausend Artikeln mit hohem Leseaufkommen werden diese Joins teuer.

„Es gibt eine dritte Option“, sagte Priya, die in der Ecke leise die Dokumentation gelesen hatte.

Sie öffnete einen neuen Tab. „Was, wenn die Daten gar nicht in eine Tabelle passen müssten?“

**Eine andere Art, über Daten nachzudenken**

Relationale Datenbanken speichern Daten als Zeilen in Tabellen. Jede Zeile muss dem Schema der Tabelle entsprechen. Das Schema wird im Voraus vereinbart.

NoSQL-Datenbanken speichern Daten anders. Ein gängiger Ansatz ist das *Dokumentenmodell*: Jeder Datensatz wird als eigenständiges Dokument (normalerweise JSON) gespeichert, und Dokumente in derselben Sammlung müssen nicht dieselben Felder haben.

Ein Menüpunkt im Dokumentenmodell könnte so aussehen:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Ein anderer Artikel könnte völlig anders aussehen:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Verschiedene Formen. Dieselbe Sammlung. Kein Problem.

„Die Datenbank ist also eher wie ein Ablagesystem als wie eine Tabelle“, sagte Maya.

„Genau“, sagte Priya. „Man kann jedes Dokument in jede Schublade legen. Man muss das Dokument nicht zuschneiden, damit es in eine feste Größe passt.“

**Lernen Sie DynamoDB kennen**

Amazon DynamoDB ist der verwaltete NoSQL-Datenbankdienst von AWS. Er speichert Daten als Items (nicht als Zeilen), und Items werden in Tabellen gesammelt (die Benennung ähnelt SQL, aber das Verhalten ist anders).

Jedes Item in einer DynamoDB-Tabelle muss einen **Primärschlüssel** haben, der es eindeutig identifiziert. Alles andere ist flexibel.

Der Primärschlüssel kann eine von zwei Formen haben:

**Nur Partitionsschlüssel**: Ein einzelnes Attribut, das über alle Items hinweg eindeutig sein muss.

**Partitionsschlüssel + Sortierschlüssel (zusammengesetzter Primärschlüssel)**: Zwei Attribute, die *zusammen* eine eindeutige Kombination bilden. Dadurch können Sie mehrere Items mit demselben Partitionsschlüssel haben, die sich durch ihren Sortierschlüssel unterscheiden.

Für das Menü von Nimbus:

- Partitionsschlüssel: `restaurantId`
- Sortierschlüssel: `itemId`

Das bedeutet, dass Sie alle Items für ein bestimmtes Restaurant effizient abrufen können – DynamoDB weiß genau, in welcher Partition es nachsehen muss.

„Warum heißt es Partitionsschlüssel?“, fragte Tom.

„Und was ist, wenn jemand versucht einzubrechen?“, fragte Priya. „Wenn der Partitionsschlüssel erratbar ist, könnte jemand eine Partition mit Schreibvorgängen zuspammen und die Hotspot-Bedingung absichtlich auslösen?“

„Ja“, sagte Leo. „Das ist tatsächlich ein Denial-of-Service-Vektor für schlecht entworfene Tabellen. Was ein weiterer Grund ist, Schlüssel mit hoher Kardinalität zu wählen.“

Priya schrieb das auf.

**Wie DynamoDB Daten intern speichert**

DynamoDB ist darauf ausgelegt, horizontal auf enorme Größen zu skalieren. Das erreicht es durch *Partitionierung* – Daten werden auf Basis des Partitionsschlüssels auf viele physische Maschinen aufgeteilt.

Wenn Sie ein Item schreiben, hasht DynamoDB den Wert des Partitionsschlüssels und verwendet diesen Hash, um zu bestimmen, welche physische Partition (und somit welcher Server) das Item speichert. Wenn Sie ein Item lesen, führt DynamoDB dieselbe Berechnung durch, um es sofort zu finden.

Stellen Sie es sich wie ein Postsystem vor. Wenn jeder Umschlag eine Postleitzahl hat, liest der Postdienst nicht jeden Umschlag, um herauszufinden, wohin er gehört – er sortiert nach Postleitzahl. DynamoDB sortiert nach dem Hash des Partitionsschlüssels.

„Moment – aber *warum* würden wir das so machen?“, fragte Maya. „Warum ist die Wahl des Partitionsschlüssels so wichtig? Können wir nicht einfach irgendetwas nehmen?“

Das ist die richtige Frage. Der Partitionsschlüssel ist die wichtigste Designentscheidung in einem DynamoDB-Schema. Hier ist der Grund:

Wenn Sie einen Partitionsschlüssel mit niedriger Kardinalität wählen – etwa `available: true/false` oder `category: "main/side/drink"` – landen die meisten Ihrer Daten auf denselben wenigen Partitionen. DynamoDB nennt das eine „heiße Partition“. Ein Server verarbeitet den Großteil des Traffics. Er wird überlastet. DynamoDB beginnt, Anfragen zu drosseln. Benutzer sehen Fehler.

- **Gut**: Hohe Kardinalität, gleichmäßig verteilte Werte (`restaurantId` mit vielen Restaurants)
- **Schlecht**: Niedrige Kardinalität (`true/false`, `category`) – die meisten Daten landen auf wenigen Partitionen und erzeugen „Hotspots“

„Wenn ich also `available: true` als Partitionsschlüssel verwendete“, sagte Leo langsam, „würden sich alle verfügbaren Artikel auf derselben Partition stapeln.“

„Und Ihre Datenbank würde im Abendansturm schmelzen“, bestätigte Priya.

Leo klappte seinen Laptop langsam zu.

---

**Der Hotspot-Vorfall**

Sie würden es sich nicht ausmalen müssen. Monate später – während ihres zweiten Monats mit DynamoDB, bevor sie die Regel wirklich verinnerlicht hatten – würden sie es auf die harte Tour lernen.

Das Team hatte ein neues Feature gestartet: ein „Featured Items“-Badge. Restaurantpartner konnten bis zu fünf Artikel als hervorgehoben markieren. Das Feature speicherte ein Attribut `featured: true` an jedem Artikel.

Leo dachte, es wäre nützlich, alle hervorgehobenen Artikel über alle Restaurants hinweg abzufragen – für ein „Trending Items“-Widget auf der Startseite. Er hatte einen sekundären Index erstellt, um diese Abfrage zu unterstützen. Der Index verwendete `featured` als Partitionsschlüssel.

„Wird schon gutgehen“, hatte er gesagt. „Wie viele hervorgehobene Artikel kann es schon geben?“

Etwa zwölfhundert, verteilt auf zweihundertvierzig Restaurants.

Aber das „Trending Items“-Widget lud auf jeder Seite. Jeder Seitenaufruf löste eine Abfrage gegen den `featured`-Index aus. Alle zwölfhundert Artikel lagen auf zwei Partitionen – `true` und `false`. Die `true`-Partition fing jeden Treffer ab.

Freitagabend, Abendansturm. Achttausend gleichzeitige Benutzer. Alle luden die Startseite.

Die DynamoDB-Fehlerrate schoss auf achtzehn Prozent. Einige Benutzer bekamen ein leeres Trending-Widget. Einige bekamen Ladekreisel. Einige bekamen Fehler, die bis in den Bestellablauf hochsprudelten.

Leo rief die Metriken ab. „Die Index-Partition wird gedrosselt“, sagte er. „Wir stoßen an die Durchsatzgrenze einer einzelnen Partition.“

„Wie?“, fragte Priya.

„Der `featured`-Schlüssel hat nur zwei Werte. Alle zwölfhundert hervorgehobenen Artikel liegen auf derselben Partition. Jeder Startseitenaufruf trifft diese Partition.“

Sie deaktivierten das Trending-Widget innerhalb von drei Minuten. Die Fehlerrate fiel auf null.

„Ein Partitionsschlüssel mit zwei Werten hat uns also an einem Freitagabend gedrosselt“, sagte Tom.

„Ja“, sagte Leo.

„Was hat uns das gekostet?“

„Etwa vierzig Minuten verschlechterter Erfahrung über achttausend Benutzer“, sagte Priya. „Umsatzauswirkung, wahrscheinlich ein paar hundert Bestellungen.“

Leo ersetzte den Index durch ein anderes Design: eine dedizierte DynamoDB-Tabelle namens `featured_items` mit `restaurantId` als Partitionsschlüssel und eine geplante Lambda – ein kleines Stück Code, das AWS für Sie ausführt (Kapitel 20) –, die sie alle fünfzehn Minuten aus der Haupttabelle aktualisierte. Die Abfrage wurde zu einem Scan über eine kleine, isolierte Tabelle statt zu einer heißen Partition auf der Haupttabelle.

„Entwerfen Sie zuerst Ihre Zugriffsmuster“, sagte Priya. „Dann wählen Sie Ihr Datenmodell.“

„Ich weiß“, sagte Leo. „Ich weiß es jetzt.“

---

**Lesen und Schreiben im großen Maßstab**

DynamoDB kann Millionen von Anfragen pro Sekunde verarbeiten. Aber es muss wissen, wie viel Kapazität es bereitstellen soll.

Es gibt zwei Kapazitätsmodi:

**Provisionierte Kapazität**: Sie geben an, wie viele Lese- und Schreibeinheiten Sie möchten. DynamoDB reserviert diese Kapazität für Sie und drosselt Traffic, der sie überschreitet. Vorhersehbare Kosten, niedrigerer Preis pro Anfrage.

Die Einheiten haben präzise Definitionen, und die Prüfung erwartet, dass Sie sie kennen: Eine **Read Capacity Unit (RCU)** ist ein stark konsistenter Lesevorgang pro Sekunde eines Items von bis zu 4 KB – oder zwei eventuell konsistente Lesevorgänge derselben Größe. Eine **Write Capacity Unit (WCU)** ist ein Schreibvorgang pro Sekunde eines Items von bis zu 1 KB. Größere Items verbrauchen proportional mehr: Das stark konsistente Lesen eines 12-KB-Items kostet 3 RCUs; das Schreiben eines 3-KB-Items kostet 3 WCUs.

**On-Demand-Kapazität**: DynamoDB skaliert automatisch mit Ihrem tatsächlichen Traffic. Keine routinemäßige Kapazitätsplanung erforderlich. Höhere Kosten pro Anfrage und betrieblich viel einfacher, obwohl plötzliche Spitzen, die weit über das jüngste Traffic-Muster einer Tabelle hinausgehen, immer noch zu Drosselung führen können, wenn sie zu schnell ansteigen.

Bei Nimbus wird das Menü weitaus häufiger gelesen als geschrieben. Ein Kunde öffnet die App, stöbert im Menü – das sind viele Lesevorgänge. Ein Restaurantpartner aktualisiert sein Menü zweimal pro Woche – das sind gelegentliche Schreibvorgänge.

„On-Demand ist vorerst sinnvoll“, sagte Tom. „Wir kennen unsere Traffic-Muster noch nicht. Besser mehr pro Anfrage zahlen, als zu wenig bereitzustellen und gedrosselt zu werden.“

Widerwillige Infrastruktur-Weisheit. Von Tom. Das Team war offiziell gewachsen.

„Wie viel kostet das pro Monat?“, fragte Tom und öffnete den Preisrechner.

„Bei unserem aktuellen Lesevolumen – etwa vierzigtausend Lesevorgänge pro Tag – liegt On-Demand bei rund zwölf Dollar im Monat“, sagte Leo. „Provisioniert, wenn wir es richtig einstellen, eher bei vier. Aber wir müssten die Kapazität manuell setzen und riskieren Drosselung, wenn wir falsch raten.“

Tom schrieb beide Zahlen auf. Er schrieb Zahlen immer auf.

**Konsistenz: Wie frisch sind Ihre Daten?**

DynamoDB repliziert Daten automatisch über mehrere Availability Zones hinweg. Das ist großartig für die Beständigkeit, bedeutet aber auch, dass Sie klar über die Lesekonsistenz nachdenken müssen.

Wenn Sie aus DynamoDB lesen, haben Sie die Wahl:

**Eventuell konsistenter Lesevorgang**: Das ist der Standard. Er ist günstiger, und das Ergebnis könnte kurz hinter einem kürzlich abgeschlossenen Schreibvorgang zurückbleiben.

**Stark konsistenter Lesevorgang**: Für Lesevorgänge gegen eine Tabelle oder einen Local Secondary Index kann DynamoDB den neuesten bestätigten Wert aus erfolgreichen vorherigen Schreibvorgängen zurückgeben. Das kostet mehr Lesekapazität und ist für Global Secondary Indexes nicht verfügbar.

Für Menüdaten ist eventuelle Konsistenz in Ordnung. Ein Menüpunkt, der eine Millisekunde veraltet ist, spielt keine Rolle.

Für Bestellbestätigungsdaten – „Wurde diese Bestellung aufgegeben?“ – möchten Sie starke Konsistenz. Der Kunde sollte keine „Versuchen Sie es erneut“-Nachricht sehen, wenn seine Bestellung gerade gespeichert wurde.

„Es ist wie der Unterschied zwischen dem Prüfen Ihres Kontostands in der App und dem direkten Anrufen der Bank“, sagte Maya. „Die App könnte dreißig Sekunden hinterherhinken. Der Anruf ist immer aktuell.“

Sie fragen sich vielleicht: Wenn DynamoDB automatisch über mehrere AZs repliziert, warum spielt der Konsistenzmodus dann überhaupt eine Rolle? Hier ist die Antwort: Die Replikation dauert eine kleine, aber von null verschiedene Zeit – normalerweise Millisekunden. Ein eventuell konsistenter Lesevorgang könnte von einer Replik bedient werden, die den neuesten Schreibvorgang noch nicht erhalten hat. Ein stark konsistenter Lesevorgang kontaktiert immer die primäre Kopie der Daten. Für die meisten Anwendungsfälle (Menüpunkte, Produktkataloge, Benutzerprofile) ist die Verzögerung nicht wahrnehmbar. Für Anwendungsfälle, bei denen die Korrektheit im Moment des Lesens zählt (Zahlungsbestätigung, Bestandsverfügbarkeit), möchten Sie starke Konsistenz.

**Sekundäre Indizes: Abfragen jenseits des Primärschlüssels**

Was, wenn Sie auf Daten auf eine andere Weise zugreifen müssen, als es der Primärschlüssel erlaubt?

DynamoDB unterstützt **sekundäre Indizes** – alternative Schlüssel, die es Ihnen ermöglichen, dieselben Daten über andere Attribute abzufragen.

**Local Secondary Index (LSI)**: Verwendet denselben Partitionsschlüssel wie die Tabelle, aber einen anderen Sortierschlüssel. Muss zum Zeitpunkt der Tabellenerstellung definiert werden und kann später nicht hinzugefügt werden. Teilt sich die provisionierte Kapazität der Tabelle. Da LSIs sich die Partition teilen, unterstützen sie stark konsistente Lesevorgänge.

**Global Secondary Index (GSI)**: Ein völlig separater Index mit eigenem Partitions- und Sortierschlüssel – verschieden vom Primärschlüssel der Tabelle. Kann nach der Erstellung der Tabelle hinzugefügt oder entfernt werden, was Ihnen Flexibilität gibt. Hat eigene Einstellungen für die provisionierte Kapazität, getrennt von der Tabelle.

Für Nimbus: Wenn sie Artikel nach Preisspanne abfragen müssten, könnte ein GSI das unterstützen – aber mit einer Regel im Hinterkopf: Ein Partitionsschlüssel akzeptiert nur *Gleichheits*vergleiche, also muss `price` (über den Sie eine Spanne abfragen möchten) der **Sortierschlüssel** sein, mit einem Gruppierungsattribut wie Kategorie oder `cuisineType#region` als GSI-Partitionsschlüssel. Genau dieser Index wird in der Durchgehung unten gebaut.

Wenn Sie einen LSI wählen, erhalten Sie starke Konsistenz und gemeinsame Kapazität, sind aber bei der Tabellenerstellung in diesem Design festgelegt; wenn Sie einen GSI wählen, erhalten Sie die Flexibilität, ihn später hinzuzufügen, und unabhängige Skalierung, verlieren aber die Möglichkeit, stark konsistente Lesevorgänge gegen den Index durchzuführen.

---

**Eine Durchgehung einer GSI-Abfrage**

Priya ging ein konkretes Beispiel durch. Nimbus wollte ein Feature „Nach Küche stöbern“ unterstützen: alle verfügbaren Gerichte einer bestimmten Küchenart über alle Partnerrestaurants hinweg anzeigen.

Die Haupttabelle hat `restaurantId` als Partitionsschlüssel und `itemId` als Sortierschlüssel. Sie können „alle Artikel mit cuisineType = Colombian“ nicht effizient abfragen – das würde einen Scan über jede Partition erfordern.

Sie erstellten einen GSI:

- GSI-Partitionsschlüssel: `cuisineType#region` (z. B. „Colombian#NYC“, „Mexican#Chicago“)
- GSI-Sortierschlüssel: `price`

Der GSI dupliziert eine Projektion jedes Artikels – nur die Felder, die für die Stöberseite benötigt werden – in den Index-Speicher. Jetzt geht eine Abfrage gegen den GSI mit `cuisineType#region = "Colombian#NYC"` direkt zu dieser Partition des Index.

„Warum nicht einfach `cuisineType` allein verwenden?“, fragte Leo.

„Weil cuisineType allein eine niedrige Kardinalität hat“, sagte Priya. „Colombian, Mexican, Thai – insgesamt zwanzig Werte. Wieder heiße Partitionen. Das Anhängen der Region ergibt Colombian#NYC, Colombian#Chicago, Colombian#LA. Mehr Partitionen, bessere Verteilung.“

„Das fühlt sich ein bisschen gehackt an.“

„Es ist ein Standard-DynamoDB-Muster. Es heißt Partition Key Sharding. Manchmal muss man mit dem Werkzeug arbeiten.“

Die GSI-Abfrage im Code sah so aus:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Das lieferte alle kolumbianischen Gerichte in New York City mit einem Preis zwischen 10 und 25 Dollar zurück, sortiert nach Preis, in etwa 4 Millisekunden.

„Das ist um den Faktor tausend schneller als die alte SQL-Abfrage“, sagte Leo.

„Weil es nur eine Partition eines Index berührt“, bestätigte Priya. „Statt jede Zeile in einer verknüpften Tabelle zu scannen.“

---

**DynamoDB Streams: Auf Änderungen reagieren**

„Haben wir darüber nachgedacht, was passiert, wenn ein Menüpunkt aktualisiert wird?“, fragte Priya eines Morgens. „Ein Restaurantpartner ändert einen Preis. Wir müssen den Suchindex aktualisieren. Wir müssen den ElastiCache-Eintrag invalidieren“ – der Caching-Dienst, den wir im nächsten Kapitel kennenlernen – „und wir müssen die Änderung für unsere Analytics-Pipeline protokollieren.“

„Wir könnten das alles im API-Handler erledigen“, sagte Leo. „Wenn der Schreibvorgang passiert, lösen wir alle nachgelagerten Aktualisierungen aus.“

„Und wenn eine davon fehlschlägt?“

„Dann… wiederholen wir es.“

„Was, wenn die EC2-Instanz nach dem Schreibvorgang, aber vor den nachgelagerten Aktualisierungen abstürzt? Die Daten sind gespeichert, aber nichts weiß von der Änderung.“

Leo dachte darüber nach.

„Die Aktualisierung muss garantiert sein“, sagte er. „Selbst wenn unser Anwendungscode mittendrin fehlschlägt.“

Genau das löst **DynamoDB Streams**.

DynamoDB Streams erfasst ein zeitlich geordnetes Protokoll jeder Item-Änderung in einer DynamoDB-Tabelle. Jedes Insert, Update und Delete wird als Ereignis in den Stream geschrieben. Der Stream behält Ereignisse 24 Stunden lang.

Sie können eine Lambda-Funktion an den Stream anhängen. Jedes Mal, wenn sich ein Item ändert, wird die Lambda-Funktion mit dem Vorher- und Nachher-Zustand des Items aufgerufen. Die Lambda kann dann:

- Einen Suchindex aktualisieren (OpenSearch)
- Einen Cache-Eintrag in ElastiCache invalidieren
- Eine Benachrichtigung an ein anderes System senden
- Eine Analytics-Pipeline speisen
- Die Änderung in eine andere Tabelle oder Datenbank replizieren

Der entscheidende Unterschied: Streams entkoppeln den Schreibvorgang von den nachgelagerten Effekten. Der DynamoDB-Schreibvorgang gelingt unabhängig davon, ob die Lambda gelingt. Wenn die Lambda fehlschlägt, wiederholt DynamoDB sie. Wenn die Anwendung nach dem Schreibvorgang abstürzt, ist das Stream-Ereignis trotzdem da – die Lambda verarbeitet es, sobald sich die Dinge erholen.

„Wir schreiben also in DynamoDB“, sagte Leo langsam, „und DynamoDB garantiert, dass die nachgelagerte Verarbeitung irgendwann passiert, selbst wenn wir abstürzen.“

„Genau“, sagte Priya. „Es ist der Unterschied zwischen dem Hoffen, dass alle Ihre Seiteneffekte laufen, und dem Garantieren durch die Datenbank.“

Für Nimbus verdrahteten sie DynamoDB Streams auf der Menütabelle mit einer Lambda, die ElastiCache-Einträge invalidierte, wenn sich Menüpunkte änderten. Der Cache blieb automatisch konsistent mit der Datenbank, ohne dass Anwendungscode die Invalidierung verwaltete.

„Wie viel kosten Streams?“, fragte Tom.

„Sie zahlen für das Lesen aus dem Stream – jeder Lambda-Aufruf liest daraus. Bei unserem Volumen wahrscheinlich zwei bis drei Dollar im Monat.“

Tom genehmigte es ohne weitere Fragen. Er hatte gelernt, wann zwei Dollar im Monat es wert waren.

**Der Kompromiss: Was DynamoDB nicht kann**

NoSQL ist nicht strikt besser als SQL. Es ist ein anderes Werkzeug für eine andere Aufgabe.

Was DynamoDB aufgibt:

**Flexible Abfragen**: In SQL können Sie nach jeder Spalte filtern und sortieren. In DynamoDB können Sie nur nach Primärschlüssel effizient abfragen. Abfragen nach beliebigen Feldern erfordern einen *Scan* (das Lesen jedes Items in der Tabelle), was im großen Maßstab teuer und langsam ist.

**Joins**: DynamoDB führt keine Joins durch. Wenn Sie Daten aus zwei Tabellen benötigen, führen Sie in Ihrem Anwendungscode zwei separate Lesevorgänge durch.

**Transaktionen**: DynamoDB unterstützt Transaktionen, aber relationale Datenbanken passen immer noch natürlicher zu vielen Multi-Entity-Workflows, reporting-lastigen Systemen und join-lastigen Designs.

**Vertrautheit**: Jahrzehnte von SQL-Werkzeugen, Fähigkeiten und Denkmodellen lassen sich nicht direkt übertragen.

Worin DynamoDB glänzt:

- Schlüssel-Wert- und Dokumentzugriffsmuster
- Massiver Maßstab (einstellige Millisekunden-Latenz bei jeder Größe)
- Serverless, keine Infrastrukturverwaltung
- Automatische Skalierung, Multi-AZ-Replikation, Backups
- Vorhersehbare Leistung unabhängig vom Datenvolumen

„Die Regel ist also“, sagte Maya, „DynamoDB verwenden, wenn man *genau* weiß, wie man auf die Daten zugreifen wird. SQL verwenden, wenn man es noch nicht weiß.“

Priya nickte. „Entwerfen Sie zuerst Ihre Zugriffsmuster. Dann wählen Sie Ihre Datenbank.“

Das ist eines der erfahrensten Dinge, die ein Datenbankgespräch hervorbringen kann.

---

**Wann DynamoDB die falsche Wahl ist**

Tom, der das Modul für das Finanz-Reporting übernommen hatte, hatte eine Frage.

„Wir bauen das Finanz-Reporting auf“, sagte er. „Monatliche Umsatzzusammenfassungen pro Restaurant, Steuerberechnungen, Rechnungshistorie. Können wir das auch in DynamoDB packen?“

Das Team sah sich gegenseitig an.

„Moment – aber *warum* würden wir das so machen?“, fragte Maya, bevor Priya es konnte.

Priya lächelte. Maya nahm die Angewohnheit auf.

„Gehen Sie uns die Abfragen durch“, sagte Priya zu Tom.

Er öffnete die Spezifikation. „Wir brauchen: Gesamtumsatz pro Restaurant, gruppiert nach Woche. Top-Artikel nach Bestellanzahl, über alle Restaurants hinweg. Umsatz aufgeschlüsselt nach Küchenart. Durchschnittlicher Bestellwert nach Stadt. Jahresvergleich für das Partner-Reporting.“

Leo las die Liste. „Jede einzelne davon ist eine Aggregation. Summe, Gruppierung, Durchschnitt, Vergleich.“

„DynamoDB hat keine Aggregationsfunktionen“, sagte Priya. „Kein GROUP BY. Kein SUM. Kein AVG. Um ‚Gesamtumsatz pro Restaurant diese Woche‘ zu beantworten, müssten Sie jede Bestellung der Woche scannen, alles in den Anwendungsspeicher ziehen und es selbst berechnen.“

„Das klingt schlecht“, sagte Tom.

„In unserem Maßstab sind das Zehntausende von Datensätzen, die für jede Reportanfrage in den Speicher gezogen werden. Es wäre langsam und teuer. Und jedes Mal, wenn wir eine neue Reportanforderung hinzufügen, würden wir neuen Scan-and-Compute-Code schreiben.“

„Was verwenden wir also?“

„Für Finanz-Reporting? RDS. PostgreSQL mit ordentlichen Indizes. Die Abfragen, die Sie beschrieben haben, sind genau das, wofür SQL entworfen wurde. Sie wären zehn Zeilen SQL. Sie wären zweihundert Zeilen DynamoDB-Scan-Code.“

DynamoDB ist falsch, wenn:

- Sie Ihre Zugriffsmuster nicht im Voraus kennen (Reporting ist von Natur aus explorativ)
- Sie Aggregationen (SUM, GROUP BY, COUNT) über große Datenmengen benötigen
- Ihre Daten komplexe Beziehungen haben und Sie Joins benötigen
- Sie Ad-hoc-Abfrageflexibilität benötigen – um Fragen zu stellen, an die Sie noch nicht gedacht haben
- Ihre Daten eine grundlegend relationale Struktur haben, die sich nicht natürlich auf Schlüssel-Wert abbilden lässt

„Die Wahl ist also nicht ‚neue Technologie ist besser‘“, sagte Maya.

„Die Wahl ist ‚welche Form haben Ihre Daten, und wie werden Sie darauf zugreifen‘“, bestätigte Priya. „DynamoDB ist für das Menü wirklich besser. Es wäre für die Finanzberichte wirklich schlechter. Beide Aussagen sind gleichzeitig wahr.“

Tom baute das Finanz-Reporting auf PostgreSQL. Die erste GROUP-BY-Abfrage, die er schrieb, lieferte in 80 Millisekunden Ergebnisse. Er musste keine einzige Zeile Scan-Code schreiben.

---

**Wann was verwenden**

| Situation                                             | Greifen Sie zu          |
|-------------------------------------------------------|-------------------------|
| Strukturierte Daten, komplexe Abfragen, Reporting     | RDS (PostgreSQL, MySQL) |
| Flexible Datenformen, schlüsselbasierter Zugriff, massiver Maßstab | DynamoDB                |
| Schreiblastig mit komplexen Beziehungen               | RDS                     |
| Leselastig mit vorhersehbaren Zugriffsmustern         | DynamoDB                |
| Sie benötigen Joins und Aggregate                     | RDS                     |
| Sie benötigen Millisekunden-Latenz bei Millionen Anfragen/Sek. | DynamoDB                |
| Transaktionen über mehrere Entitäten                  | RDS (meistens)          |
| Serverless / unvorhersehbare Traffic-Spitzen          | DynamoDB On-Demand      |
| Finanz-Reporting, Ad-hoc-Analytik                     | RDS oder ein Data Warehouse |
| Event Sourcing, Change Capture, Echtzeitverarbeitung  | DynamoDB + Streams      |

Die falsche Antwort ist immer „immer das eine oder das andere verwenden“. Nimbus verwendete am Ende beides: RDS für Bestellhistorie und Finanzunterlagen (strukturiert, relational, benötigt Reporting), DynamoDB für das Menü (flexibles Schema, hohes Lesevolumen, Zugriff über Restaurant-ID).

## Die richtige Datenbank für die richtige Workload

Springen Sie sechs Monate voraus – lange nachdem sich die DynamoDB-Migration eingespielt hatte – und Nimbus hatte drei neue Projekte auf dem Plan. Maya ging das Team an einem Dienstagmorgen durch sie hindurch.

„Erstens: eine Recommendation Engine. Wir wollen Kunden Gerichte zeigen, die sie wahrscheinlich bestellen werden, basierend auf ihrer Historie und dem, was Leute mit ähnlichem Geschmack bestellt haben. Zweitens: Wir verlagern die Menüdaten, um reichhaltigere Inhalte zu unterstützen – vollständige Menüdokumente in JSON, unterschiedliche Struktur pro Restaurant, flexibles Schema. Drittens: Wir stehen kurz vor dem Abschluss der Barato-Übernahme, und deren Datenteam betreibt einen Cassandra-Cluster für Kundenverhaltensdaten. Sie wollen ihn zu AWS bringen, ohne ihre Pipelines neu zu schreiben.“

Drei Projekte. Drei sehr unterschiedliche Datenanforderungen. Keines davon war ein offensichtlicher DynamoDB-Fall.

„Diese brauchen alle unterschiedliche Datenbanken“, sagte Priya.

„Wir haben DynamoDB“, sagte Leo.

„Wir haben das Recht, das richtige Werkzeug zu wählen“, sagte Priya.

**Amazon DocumentDB: Wenn Ihre Workload MongoDB spricht**

Das zweite Projekt – reichhaltige JSON-Menüdokumente mit flexiblen, restaurantspezifischen Schemas – beschrieb eine Dokumentendatenbank. Nimbus nutzte bereits das flexible Schema von DynamoDB für das Menü, aber als das Team ausgefeiltere Menüfunktionen baute (verschachtelte Modifikatoren, zeitbasierte Preise, komplexe Kombistrukturen), zeigte das Abfragemodell von DynamoDB seine Grenzen. Das Team wollte reichhaltigere Dokumentabfragen: alle Menüpunkte finden, bei denen ein verschachtelter Modifikator eine bestimmte Option enthält, nach beliebigen Feldern innerhalb der JSON-Struktur filtern.

„Das ist ein Dokumentdatenbank-Muster“, sagte Priya. „MongoDB.“

„Wir könnten MongoDB auf EC2 betreiben“, schlug Leo vor.

„Oder wir könnten DocumentDB verwenden“, sagte Priya.

**Amazon DocumentDB** ist eine MongoDB-kompatible, verwaltete Dokumentendatenbank. Sie speichert Daten als JSON-ähnliche Dokumente mit flexiblen Schemas – verschiedene Dokumente in derselben Sammlung können unterschiedliche Felder haben. DocumentDB unterstützt MongoDBs Abfragesprache, APIs und Treiber. Wenn Ihre Workload derzeit auf MongoDB läuft, spricht DocumentDB dieselbe Sprache. Der Migrationsweg ist das Verschieben eines Connection-Strings, nicht das Neuschreiben einer Anwendung.

DocumentDB ist vollständig verwaltet: kein Patchen, automatisierte Backups, Multi-AZ-Hochverfügbarkeit, Read Replicas und Speicher, der automatisch mit Ihren Daten wächst.

„Wir migrieren also das Menü zu DocumentDB“, sagte Leo. „Und die Abfragen, die wir bereits in MongoDB-Syntax haben, funktionieren einfach?“

„Mit geringfügigen Kompatibilitätstests, ja“, bestätigte Priya. „DocumentDB unterstützt die meisten von MongoDBs Abfrage-API. Prüfen Sie die Kompatibilitätsmatrix, bevor Sie von voller Abdeckung ausgehen, aber für Dokumentabfragen und Aggregationen ist es unkompliziert.“

Das Prüfungssignal für DocumentDB ist einfach: **„MongoDB-kompatibel“** oder **„Document Store“**. Wenn ein Szenario MongoDB oder dokumentenorientierte Daten erwähnt, ist DocumentDB die verwaltete AWS-Antwort.

**Amazon Neptune: Wenn die Beziehungen die Daten sind**

Die Recommendation Engine war ein schwierigeres Problem.

Die Frage war nicht „Was hat dieser Kunde bestellt?“ – das war ein einfacher DynamoDB-Lookup. Die Frage war: „Welche Kunden haben ähnliche Geschmacksprofile wie dieser Kunde, und welche Gerichte haben diese Kunden gemocht, die dieser Kunde noch nicht probiert hat?“

Das ist ein Graph-Problem. Das Datenmodell ist keine Tabelle von Zeilen oder eine Sammlung von Dokumenten. Es ist ein Netzwerk von Beziehungen: Kunden, die mit Gerichten verbunden sind (bestellt, bewertet, angesehen), Gerichte, die mit Restaurants und Küchenarten verbunden sind, Restaurants, die mit Stadtvierteln und Städten verbunden sind. Die Empfehlung steckt nicht in den Datenpunkten – sie steckt in den Pfaden zwischen ihnen.

„Wir brauchen eine Graph-Datenbank“, sagte Priya.

**Amazon Neptune** ist eine vollständig verwaltete Graph-Datenbank. Sie unterstützt zwei Graph-Modelle: **Property Graph** (abgefragt mit der Traversierungssprache Gremlin) und **RDF** (abgefragt mit SPARQL). Sie wählen basierend auf Ihrem bestehenden Graph-Stack oder der Vorliebe des Teams; beide laufen auf derselben Neptune-Infrastruktur.

Graph-Datenbanken sind speziell für Workloads gebaut, bei denen die Beziehungen zwischen Datenpunkten genauso wichtig sind wie die Daten selbst: soziale Netzwerke (wer ist mit wem verbunden), Recommendation Engines (was haben ähnliche Benutzer gemocht), Betrugserkennung (welche Transaktionen teilen verdächtige Muster über Konten hinweg) und Wissensgraphen (wie sind Konzepte verbunden).

Für Nimbus' Recommendation Engine: Kunden und Gerichte wurden zu Knoten in Neptune. Bestellereignisse wurden zu Kanten. Eine Gremlin-Traversierung konnte in einer einzigen Abfrage alle Gerichte finden, die Kunden mit ähnlichen Bestellhistorien hoch bewertet hatten, sortiert nach der Stärke der Verbindung – ohne die komplexen JOIN-Ketten, die in einer relationalen Datenbank erforderlich wären, oder die mehreren Hin-und-Her-Abfragen, die in DynamoDB nötig wären.

Das Prüfungssignal für Neptune: **„soziales Netzwerk“, „Recommendation Engine“, „Wissensgraph“, „Betrugserkennung“** oder **„Graph-Traversierung“**. Wenn ein Szenario Daten beschreibt, bei denen die Verbindungen genauso wichtig sind wie die Daten selbst, ist Neptune die Antwort.

**Amazon Keyspaces: Cassandra ohne den Betrieb**

Die Barato-Übernahme brachte einen Cassandra-Cluster ins Spiel. Cassandra ist eine Wide-Column-NoSQL-Datenbank – entworfen für sehr hohen Schreibdurchsatz und horizontale Skalierbarkeit, häufig verwendet für Zeitreihendaten, Benutzeraktivitätsprotokolle und IoT-Telemetrie. Das Barato-Datenteam nutzte sie, um das Kundenverhalten zu verfolgen: welche Artikel angesehen, welche in den Warenkorb gelegt, welche abgebrochen wurden.

Die Migration von Cassandra zu AWS hatte zwei Optionen: es auf EC2 betreiben (betrieblicher Aufwand für die Verwaltung des Clusters, Upgrades, Skalierung) oder die verwaltete Option verwenden.

„Amazon Keyspaces“, sagte Priya.

**Amazon Keyspaces** ist eine serverlose, Cassandra-kompatible, verwaltete Datenbank. Sie unterstützt die Cassandra Query Language (CQL) – dieselbe Abfragesprache, die Baratos Pipelines bereits nutzten. Wie DocumentDB für MongoDB ist Keyspaces der verwaltete Weg: den Anwendungscode unverändert lassen, ihn auf einen Keyspaces-Endpunkt statt auf den selbstverwalteten Cluster richten und AWS die Infrastruktur überlassen.

Keyspaces skaliert automatisch mit dem Traffic, benötigt keine Kapazitätsplanung und ist serverless – Sie zahlen für die Lese- und Schreibvorgänge, die Sie tatsächlich durchführen. Für die Barato-Verhaltensdaten war das das richtige Modell: extrem variables Volumen (Abendansturm vs. 3 Uhr morgens), Wide-Column-Schema, hoher Schreibdurchsatz.

Das Prüfungssignal: **„Cassandra-kompatibel“, „Wide-Column“, „CQL“** oder **„Cassandra-Workload“**.

**Die richtige Datenbank wählen: Eine Referenztabelle**

An diesem Punkt der Geschichte sah Nimbus' Datenbanklandschaft überhaupt nicht mehr aus wie in Kapitel sieben. Das richtige Werkzeug für jede Workload:

| Auslösephrase | Datenbank |
|---|---|
| „MongoDB-kompatibel“ oder „Document Store“ | DocumentDB |
| „Graph-Beziehungen“, „soziales Netzwerk“, „Recommendation Engine“ | Neptune |
| „Cassandra-kompatibel“ oder „Wide-Column“ | Keyspaces |
| „Schlüssel-Wert in jedem Maßstab“, „einstellige Millisekunden-Latenz“ | DynamoDB |
| „Relational + serverless“, „auto-skalierendes SQL“ | Aurora Serverless |
| „Strukturierte Daten, komplexe Abfragen, Reporting“ | RDS (PostgreSQL, MySQL) |

„Wird das immer weiter wachsen?“, fragte Leo mit Blick auf die Liste.

„Ja“, sagte Maya. „Weil verschiedene Probleme verschiedene Formen haben. Und die falsche Form zu verwenden kostet dich entweder Leistung, Entwicklerzeit oder beides.“

„Die richtige Frage ist nicht ‚welche Datenbank sollten wir verwenden‘“, fügte Priya hinzu. „Sie lautet ‚welche Form haben unsere Daten, und wie werden wir darauf zugreifen?‘ Die Datenbank folgt aus der Antwort.“

Das war das Wichtigste, was sie in zwei Jahren über Datenbanken gesagt hatte.

## Stärken und Grenzen

**Warum DynamoDB leistungsstark ist**:

- Einstellige Millisekunden-Latenz in jedem Maßstab
- Vollständig verwaltet – kein Patchen, kein Einrichten von Replikation, keine Wartungsfenster
- Automatische Multi-AZ-Replikation (Beständigkeit eingebaut)
- On-Demand-Skalierung bedeutet keine Kapazitätsplanung
- Native Integration mit Lambda, API Gateway, Streams
- Point-in-Time-Recovery (ähnlich wie RDS automatisierte Backups)
- DynamoDB Streams – jede Änderung als Ereignis erfassen (nützlich für Echtzeitverarbeitung)

**Wo DynamoDB kompliziert wird**:

- Das Design von Zugriffsmustern ist nicht verhandelbar – Fehler sind teuer rückgängig zu machen
- Komplexe Abfragen erfordern sekundäre Indizes (erhöht Kosten und Komplexität)
- Scans sind teuer – vermeiden Sie sie in der Produktion
- Das „Item-Größenlimit“ beträgt 400 KB – große Items benötigen andere Speicherlösungen
- Die Preisgestaltung kann Sie überraschen, wenn Sie die Kosten für Lese-/Schreibeinheiten nicht verstehen
- Heiße Partitionen sind stille Killer – keine Fehler, bis die Drosselung beginnt

## Zusammenfassung

Das Redesign des Schemas hatte zwei Tage und viel Whiteboard-Platz gekostet. Eine NoSQL-Datenbank zu wählen ist nicht nur eine technische Entscheidung – sie verändert, wie man überhaupt über die Daten denkt. Aber das Ergebnis war eine Menütabelle, die auf jede Größe wachsen konnte, ohne langsamer zu werden. Ebenso wichtig: Das Team lernte, wo DynamoDBs Grenzen liegen und zu welchen spezialisierten Datenbanken man greift, wenn das Problem die Form ändert.

- DynamoDB ist der verwaltete NoSQL-Datenbankdienst von AWS. Items sind flexible Dokumente – kein festes Schema. Jedes Item muss einen **Primärschlüssel** haben: einen Partitionsschlüssel allein oder einen Partitionsschlüssel + Sortierschlüssel. Wählen Sie den Partitionsschlüssel für gleichmäßige Verteilung – heiße Partitionen verursachen Drosselung.
- **On-Demand**-Kapazität skaliert automatisch; **provisionierte** Kapazität ist günstiger bei vorhersehbarem Traffic. **Eventuell konsistente** Lesevorgänge sind günstiger; **stark konsistente** Lesevorgänge sind immer aktuell, aber auf GSIs nicht verfügbar.
- **DynamoDB Streams** erfassen Änderungen auf Item-Ebene in Echtzeit – nutzen Sie sie, um Cache-Invalidierung, Suchindex-Aktualisierungen und Analytics-Pipelines anzutreiben.
- DynamoDB ist die falsche Wahl für Reporting, komplexe Joins und Ad-hoc-Abfragen – verwenden Sie dafür RDS.
- **DocumentDB** (MongoDB-kompatibel), **Neptune** (Graph-Datenbank) und **Keyspaces** (Cassandra-kompatibel) sind verwaltete AWS-Alternativen für Workloads, die nicht in DynamoDBs Schlüssel-Wert-Modell passen.

## Prüfungstipps

*SAA-C03 Domäne: Design High-Performing Architectures (Domäne 3, Aufgabe 3.3)*

- Kennen Sie die Partitionsschlüsselregeln: **hohe Kardinalität, gleichmäßige Verteilung**. Heiße Partitionen sind eine häufige Prüfungsfalle.
- **On-Demand vs. Provisioned**: On-Demand für unvorhersehbaren Traffic; Provisioned (mit Auto Scaling) für vorhersehbare Workloads.
- **DynamoDB Streams**: erfasst Änderungen auf Item-Ebene in Echtzeit. Häufiges Prüfungsszenario: „eine Lambda-Funktion auslösen, wenn sich ein Datensatz ändert.“
- **Global Tables**: Multi-Region-, Multi-Active-Replikation für global verteilte Anwendungen und Disaster-Recovery-Szenarien. In der Prüfung ist dies ein starkes Signal, wenn die Workload lokale Lese- und Schreibvorgänge in mehr als einer Region benötigt.
- **DynamoDB TTL (Time to Live)**: Setzen Sie ein Ablaufzeitstempel-Attribut auf Items, und DynamoDB löscht sie nach Ablauf automatisch – **ohne Kosten**, ohne Schreibkapazität zu verbrauchen. Prüfungsauslöser: „Sitzungsdaten/temporäre Items müssen nach N Stunden zu den niedrigsten Kosten automatisch entfernt werden“ → TTL, niemals ein geplanter Lambda-Scan. Abgelaufene Items können auch zur Archivierung in DynamoDB Streams fließen.
- **DAX (DynamoDB Accelerator)**: In-Memory-Caching-Schicht für DynamoDB. Reduziert die Lese-Latenz von Millisekunden auf Mikrosekunden. Die Prüfung verwendet dies, wenn RDS Read Replicas nicht helfen (weil es ein DynamoDB-spezifischer Cache ist).
- **Zusammengesetzter Primärschlüssel**: Partitionsschlüssel + Sortierschlüssel ermöglicht flexible Abfragen innerhalb einer Partition. Beispiel: alle Bestellungen für einen Kunden zwischen zwei Daten abrufen – `customerId` ist Partitionsschlüssel, `orderDate` ist Sortierschlüssel.
- **GSI vs. LSI**: GSI kann nach der Tabellenerstellung hinzugefügt werden; LSI nicht. LSI unterstützt stark konsistente Lesevorgänge; GSI nicht. LSI teilt sich die Tabellenkapazität; GSI hat eine eigene.
- Wissen, wann man DynamoDB NICHT verwenden sollte: komplexe Joins, Ad-hoc-Reporting, Multi-Entity-Transaktionen → RDS ist normalerweise die Antwort.
- **Auswahl der zweckgebundenen Datenbank** – die Prüfung präsentiert häufig ein Szenario und fragt, welche Datenbank passt. Nutzen Sie dies als Schnellreferenz: „MongoDB-kompatibel“ → DocumentDB. „Graph/soziales Netzwerk/Recommendation Engine/Wissensgraph“ → Neptune. „Cassandra-kompatibel/Wide-Column“ → Keyspaces. „Schlüssel-Wert in jedem Maßstab/Millisekunden-Latenz“ → DynamoDB. „Relational/komplexe Abfragen/Reporting“ → RDS oder Aurora.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie den Unterschied zwischen einem Partitionsschlüssel und einem Sortierschlüssel. Wann würden Sie beide verwenden?

*(Hinweis: Denken Sie an das Nimbus-Menü – warum macht es das effiziente Abrufen des vollständigen Menüs eines Restaurants möglich, wenn restaurantId der Partitionsschlüssel und itemId der Sortierschlüssel ist?)*

**Übung 2 – SAA-C03-Szenario**

*Szenario*: Ein globales Gaming-Unternehmen speichert Spielerprofile in DynamoDB. Jedes Profil enthält Felder wie Benutzername, Level, Errungenschaften und Inventar. Einige Spieler haben 10 Inventarpositionen; andere haben einige hundert – die Profile variieren in der Form, aber jedes bleibt bequem unter DynamoDBs Item-Größenlimit von 400 KB. Das Unternehmen benötigt einstellige Millisekunden-Lese-Latenz für Profilabfragen während des aktiven Spiels.

Welcher Designansatz unterstützt diese Anforderung am BESTEN?

A) DynamoDB mit `playerId` als Partitionsschlüssel verwenden und das gesamte Profil als ein einzelnes Item speichern  
B) Zu RDS Aurora mit Read Replicas in jeder Region migrieren  
C) DynamoDB mit `level` als Partitionsschlüssel verwenden, um Spieler ähnlicher Spielstärke zu gruppieren  
D) ElastiCache vor RDS verwenden, um Sub-Millisekunden-Latenz zu erreichen

**Hinweis 1**: Das Zugriffsmuster ist „einen bestimmten Spieler anhand der ID suchen“. Welcher Schlüssel macht das effizient?

**Hinweis 2**: Eine Option erzeugt eine schreckliche heiße Partition. Welches Attribut hat eine sehr niedrige Kardinalität?

**Hinweis 3**: DynamoDB liefert nativ bereits einstellige Millisekunden-Latenz.

**Antwort**: A

**Erläuterung**: Die Verwendung von `playerId` als Partitionsschlüssel verteilt die Daten gleichmäßig über die Partitionen und ermöglicht sofortige Lookups anhand der Spieler-ID – genau das beschriebene Zugriffsmuster. DynamoDBs flexibles Dokumentmodell verarbeitet variierende Inventargrößen ohne Schemaänderungen.

**Warum nicht B?** RDS Aurora mit Read Replicas erhöht die Komplexität und ist dennoch nicht die natürliche erste Wahl für diese Art von schlüsselbasiertem Profil-Lookup im Gaming-Maßstab.

**Warum nicht C?** Die Verwendung von `level` als Partitionsschlüssel erzeugt schwere heiße Partitionen – der meiste Traffic geht zu Level 1 (neue Spieler) oder Maximallevel (aktive Veteranen) und lässt andere Partitionen ungenutzt.

**Warum nicht D?** Die Frage beschreibt DynamoDB, nicht RDS. Das Hinzufügen von ElastiCache vor RDS führt zwei neue Dienste ein, wenn DynamoDB allein das Problem löst.

*SAA-C03 Domäne: Design High-Performing Architectures – Aufgabe 3.3*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus fügt eine „Favoriten“-Funktion hinzu: Kunden können ihre Lieblingsmenüpunkte speichern und mit einem Fingertipp neu bestellen.

Entwerfen Sie die DynamoDB-Tabelle für diese Funktion. Was wäre der Partitionsschlüssel? Würden Sie einen Sortierschlüssel verwenden? Wie würde die Item-Struktur aussehen?

Überlegen Sie dann: Was passiert, wenn Sie „die 100 am häufigsten favorisierten Artikel über alle Kunden hinweg“ anzeigen müssen? Kann DynamoDB das effizient beantworten? Wenn nicht, was würden Sie zur Architektur hinzufügen?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, das Entwerfen für Zugriffsmuster zu üben.)*

## Post-Credits-Szene

„Ich habe es schon deployt – oh.“ Leo hatte die Menü-Migration zu DynamoDB am Donnerstagabend durchgeführt, ohne es jemandem zu sagen. Es funktionierte. Die Lesevorgänge waren schnell. Das Schema war flexibel. Die Restaurantpartner konnten beliebige Modifikator-Felder hinzufügen, die sie wollten. Aber er hatte vergessen, die Monitoring-Dashboards zu aktualisieren, und Priya hatte am Freitagmorgen zwanzig Minuten damit verbracht, sich zu fragen, warum die Datenbankmetriken flach geworden waren.

Er fühlte sich trotzdem gut mit sich selbst.

Dann sah Priya, die Dashboards wiederhergestellt, auf die Metriken.

„Leo“, sagte sie, „jeder Seitenaufruf macht siebenundvierzig DynamoDB-Anfragen.“

„Eine pro angezeigtem Restaurant“, bestätigte Leo. „Die Stöberseite lädt die siebenundvierzig nächstgelegenen Restaurants für den Standort des Kunden.“

„Und jede dieser Anfragen dauert etwa vier Millisekunden.“

Leo machte die Rechnung. Siebenundvierzig mal vier. „Das sind… einhundertachtundachtzig Millisekunden allein für das Menü. Vor dem Rendern.“

„Bei jedem Seitenaufruf.“

„Für jeden Kunden.“

Er starrte auf den Bildschirm.

„Wir brauchen einen Cache“, sagte er.

Im nächsten Kapitel: die Schicht zwischen Nimbus' Anwendung und ihrer Datenbank, die langsame Abfragen schnell macht.
