# Kapitel 10: Wenn die Datenbank zu langsam ist

Die Seitenladungsmetriken waren auf dem Bildschirm geöffnet. Leo hatte sie zwanzig Minuten lang angeschaut, ohne etwas zu sagen.

Siebenundvierzig DynamoDB-Anfragen pro Seitenaufruf. Einhundertachtundachtzig Millisekunden allein, um die Daten abzurufen – bevor der Browser ein einziges Pixel renderte.

Er hatte die Rechnung gemacht. Zehntausend gleichzeitige Benutzer an einem Freitagabend, von denen jeder die Stöberseite etwa einmal pro Minute lud: vierhundertsiebzigtausend DynamoDB-Lesevorgänge pro Minute. Die Kosten waren real. Aber die Latenz war das eigentliche Problem. Ein Benutzer, der die Nimbus-Stöberseite öffnete, wartete fast zweihundert Millisekunden, bevor irgendetwas erschien – und das bei einer schnellen Verbindung.

---

*Die Woche zuvor hatte das Redesign des DynamoDB-Schemas funktioniert. Die Menütabelle war jetzt flexibel – jedes Restaurant konnte jeden Modifikator, jede Kombistruktur, jede saisonale Variation hinzufügen. Die Leistung bei einzelnen Lookups war ausgezeichnet. Aber ausgezeichnete einzelne Lookups, multipliziert mit siebenundvierzig pro Seite, summierten sich dennoch zu langsamen Seiten. Das DynamoDB-Problem war gelöst. Ein neues Problem hatte seinen Platz eingenommen.*

---

„Die Datenbank antwortet in vier Millisekunden pro Anfrage“, sagte Leo. „Das ist eigentlich schnell. DynamoDB erledigt seine Arbeit.“

„Warum ist die Seite dann langsam?“, fragte Maya.

„Weil wir sie siebenundvierzig Mal pro Seitenaufruf aufrufen“, sagte Priya. „Das Problem ist nicht die Datenbank. Das Problem ist, dass wir zu viel mit ihr reden.“

Tom lehnte sich vor. Er hatte den Blick, den er bekam, wenn ein Problem im Begriff war, zu einem Kostengespräch zu werden. „Die Lösung ist also, weniger mit ihr zu reden?“

„Weniger mit ihr reden. Sich mehr merken.“

---

**Der falsche erste Versuch**

Leos erster Instinkt war, benutzerbezogene Daten zu cachen. Jeder Benutzer hatte eine Sitzung, und die Sitzung lud sein Profil: gespeicherte Adressen, Zahlungsmethoden, Zusammenfassung der Bestellhistorie. Vielleicht würde das Cachen davon die Dinge beschleunigen.

Er implementierte es. Redis-Schlüsselformat: `user:{userId}:profile`. TTL: zehn Minuten.

Er führte den Lasttest aus. Die Seitenladezeit sank um sechs Millisekunden.

„Das ist nicht viel“, bemerkte Tom.

„Nein“, sagte Leo.

„Warum nicht?“

Leo starrte einen Moment auf den Graphen. „Weil das Benutzerprofil nur eine Anfrage ist. Es gibt immer noch sechsundvierzig DynamoDB-Aufrufe pro Seite. Und das sind die Menü-Aufrufe – einer pro Restaurant auf der Stöberseite. Ich habe das Falsche gecacht.“

Das ist ein häufiger Fehler beim Caching: das zu optimieren, was nicht der Engpass ist. Das Benutzerprofil lud in zwei Millisekunden. Etwas so Schnelles zu cachen sparte fast nichts. Die Menüdaten – siebenundvierzig Mal abgerufen, jeweils vier Millisekunden – waren das eigentliche Problem.

„Du musst pro Menü cachen, nicht pro Benutzer“, sagte Priya. „Das Menü für Restaurant 047 ist für jeden Benutzer, der es durchstöbert, dasselbe. Das sind die Daten, die es wert sind, gecacht zu werden – sie sind über Tausende von Anfragen hinweg identisch.“

Benutzerbezogene Caches sind wertvoll, wenn Benutzer teuren personalisierten Zustand haben. Entitätsbezogene Caches (Menüs, Produktkataloge, Konfiguration) sind wertvoll, wenn dieselben Daten an Tausende von Benutzern ausgeliefert werden. Wissen Sie, welches Problem Sie haben, bevor Sie den Code schreiben.

Leo gestaltete die Cache-Schlüssel neu: `menu:{restaurantId}`. Ein Cache-Eintrag pro Restaurant, geteilt von jedem Benutzer, der dieses Restaurant durchstöbert.

Er führte den Lasttest erneut aus. Die Seitenladezeit sank von 188 Millisekunden auf 12 Millisekunden. Das war die Verbesserung, nach der sie gesucht hatten.

---

**Die Restaurant-Analogie**

Stellen Sie sich die Küche eines Restaurants vor. Jedes Mal, wenn ein Kellner wissen muss, was die Tagesangebote sind, geht er nach hinten, fragt den Koch und geht zum Tisch zurück.

Das funktioniert gut, wenn Sie zwei Kellner und drei Tische haben.

Stellen Sie sich jetzt zweihundert Kellner und tausend Tische vor. Jeder einzelne von ihnen geht für dieselbe Frage nach hinten. Die Küche wird zum Engpass. Der Koch beantwortet dieselbe Frage vierhundert Mal pro Stunde.

Die offensichtliche Lösung: die Tagesangebote auf eine Tafel an der Vorderseite des Restaurants schreiben. Jeder Kellner liest von der Tafel. Die Küche bekommt eine Pause. Die Tafel wird aktualisiert, wenn sich die Tagesangebote ändern.

Diese Tafel ist ein Cache.

Ein Cache ist ein schneller, lokaler Speicher kürzlich abgerufener Daten. Anstatt dasselbe immer wieder aus einer langsamen Quelle abzurufen, rufen Sie es einmal ab und halten es in der Nähe.

Es gibt eine weitere Analogie, die Ingenieure nützlich finden: das Reserveregal der Bibliothek. Wenn ein beliebtes Buch zurückgegeben wird, weiß der Bibliothekar, dass es bald wieder angefragt wird, also stellt er es ins Reserveregal in der Nähe des Empfangstresens, statt es in die Regale einzusortieren. Der nächste Besucher muss nicht die ganze Bibliothek ablaufen – er findet es direkt am Tresen. Das Reserveregal hat begrenzten Platz. Wenn es sich füllt, werden ältere Bücher zurück in die Regale verschoben, um Platz für neuere zu machen. Ein Cache funktioniert identisch: Häufig abgerufene Daten bleiben vorne, selten abgerufene Daten werden verdrängt, um Platz zu schaffen.

**Warum nicht einfach den Speicher verwenden?**

„Können wir das Menü nicht einfach im Speicher der Anwendung ablegen?“, fragte Leo.

Berechtigte Frage.

Sie können. Für eine Single-Server-Anwendung funktioniert In-Memory-Caching gut. Aber Nimbus läuft hinter einem Load Balancer, über mehrere EC2-Instanzen. Wenn eine Instanz das Menü in ihrem Speicher cacht, haben die anderen Instanzen diese Daten nicht. Jede unterhält separate Caches. Wenn das Menü aktualisiert wird, müssten Sie alle invalidieren.

Das ist das *Cache-Kohärenz-Problem* – mehrere Caches konsistent halten.

ElastiCache löst dies, indem es einen *zentralisierten* Cache bereitstellt, den alle Ihre Instanzen teilen. Statt dass jeder Server seinen eigenen Speicher hat, liest und schreibt jeder Server in denselben Cache. Eine Aktualisierung verbreitet sich an alle.

**Lernen Sie ElastiCache kennen**

„Moment – aber *warum* würden wir das so machen?“, fragte Maya. „Warum ein ganz neuer Dienst? Warum nicht einfach mehr Datenbankkapazität hinzufügen?“

Gute Frage. Die Antwort ist, dass das Hinzufügen von mehr Datenbankkapazität – größere Instanzen, mehr Read Replicas – das grundlegende Problem nicht behebt. Jede dieser siebenundvierzig Seitenaufruf-Anfragen kostet immer noch Zeit und Geld, selbst auf einer schnelleren Datenbank. Ein Cache macht die Datenbank nicht schneller; er bedeutet, dass der Datenbank dieselbe Frage weitaus seltener gestellt wird. Für Daten, die wiederholt gelesen werden und sich selten ändern – wie das Menü eines Restaurants – bedeutet ein Cache, dass die Datenbank diese Frage vielleicht einmal alle fünf Minuten beantwortet statt siebenundvierzig Mal pro Seitenaufruf.

Amazon ElastiCache ist ein verwalteter Caching-Dienst. Er betreibt beliebte Caching-Engines – Redis und Memcached – ohne dass Sie die Server verwalten müssen.

**Redis** ist das leistungsfähigere der beiden. Es unterstützt komplexe Datenstrukturen (Strings, Listen, Sets, Hashes, Sorted Sets), Persistenz (Daten überleben Neustarts), Replikation und Pub/Sub-Messaging. Redis kann mehr als Caching – es kann als leichtgewichtiger Datenspeicher fungieren.

**Memcached** ist einfacher. Reines Key-Value-Caching, horizontal skalierbar, keine Persistenz. Schneller für einfache Anwendungsfälle, aber weniger Funktionen.

Für Nimbus: Redis. Sie mussten Menüdaten (strukturiert), Session-Tokens (Key-Value) cachen, und später würden sie Sorted Sets für „Trending Restaurants“-Rankings wollen.

**Wie Caching in der Praxis funktioniert**

Das grundlegende Caching-Muster heißt **Cache-Aside** (auch Lazy Loading genannt):

1. Anwendung benötigt Daten
2. Zuerst den Cache prüfen
3. Wenn gefunden (*Cache Hit*): Daten sofort zurückgeben
4. Wenn nicht gefunden (*Cache Miss*): zur Datenbank gehen, die Daten holen, im Cache speichern, zurückgeben

In Pseudocode:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

Die erste Anfrage trifft immer die Datenbank. Jede nachfolgende Anfrage trifft den Cache. Mit einem Cache werden Nimbus' siebenundvierzig DynamoDB-Lesevorgänge pro Seitenaufruf zu einem oder zwei Cache-Lookups. Schnell, günstig und skalierbar.

**Die TTL: Wie lange merken Sie sich etwas?**

Jeder Cache-Eintrag hat eine **Time-To-Live (TTL)**: die Dauer, nach der der Eintrag abläuft und die nächste Anfrage für frische Daten zurück zur Datenbank geht.

Das ist die Kernspannung des Cachings: Aktualität vs. Leistung.

- **Kurze TTL (Sekunden)**: Sehr frische Daten, aber viele Cache Misses. Der Cache hilft kaum.
- **Lange TTL (Stunden oder Tage)**: Sehr schnell, aber Daten können veralten. Der Kunde sieht das Menü von gestern.

Für Menüdaten sind fünf Minuten angemessen. Das Menü ändert sich nicht jede Sekunde. Wenn ein Restaurant sein Menü aktualisiert, sehen Kunden vielleicht bis zu fünf Minuten lang die alte Version – akzeptabel.

Für Session-Tokens (ist dieser Benutzer eingeloggt?) ist eine kürzere TTL sinnvoll, oder Sie aktualisieren den Cache sofort, wenn sich die Sitzung ändert.

Für Finanzdaten (Bestellsummen, Zahlungsdatensätze) cachen Sie sie nicht – oder wenn doch, invalidieren Sie sie sofort beim Schreiben.

Sie fragen sich vielleicht: Warum nicht einfach mehr Datenbankkapazität hinzufügen, statt eine ganz neue Caching-Schicht einzuführen? Mehr Replikate, eine größere Instanz – warum nicht das? Die Antwort ist, dass zusätzliche Datenbankkapazität Ihre Fähigkeit vervielfacht, gleichzeitige Anfragen zu bewältigen, aber die Anzahl der Anfragen nicht reduziert. Wenn zehntausend Benutzer jeweils siebenundvierzig Lesevorgänge pro Seitenaufruf auslösen, bedeutet das Hinzufügen einer zweiten Read Replica nur, dass jede Replik dreiundzwanzigtausend Anfragen statt siebenundvierzigtausend verarbeitet – die Gesamtarbeit schrumpft nicht. Ein Cache eliminiert die redundante Arbeit vollständig: Diese zehntausend Benutzer teilen sich dasselbe gecachte Ergebnis.

„Es gibt nur zwei schwierige Probleme in der Informatik“, zitierte Leo mit der geübten Darbietung von jemandem, der es schon einmal gesagt hatte. „Cache-Invalidierung und das Benennen von Dingen.“

„Warum ist Cache-Invalidierung schwierig?“, fragte Maya.

„Weil – wann ändern sich Daten *tatsächlich*? Hat sich das Menü geändert, weil ein Restaurantpartner es aktualisiert hat? Oder weil ein Cron-Job lief? Oder weil ein Admin es manuell bearbeitet hat? Jede Stelle, die die Daten ändern kann, muss wissen, dass sie es dem Cache mitteilen muss.“

Deshalb beginnen erfahrene Ingenieure ein Caching-Gespräch mit „Was sind die Schreibpfade?“ statt mit „Lass uns Redis hinzufügen.“

---

**Die Geschichte der Cache-Invalidierung**

Sie fanden heraus, wie schwer Cache-Invalidierung war, als sich das erste Mal ein Restaurantpartner beschwerte.

Restaurant 112 – ein kolumbianischer Laden in der Eastside – hatte an einem Donnerstagnachmittag seine Preise aktualisiert. Sie hatten die Arepa von 8 auf 9 Dollar erhöht. Zwanzig Minuten später riefen sie beim Nimbus-Support an.

„Unser Menü zeigt immer noch den alten Preis“, sagte der Inhaber. „Kunden geben Bestellungen zu 8 Dollar auf. Wir müssen diesen Preis jetzt einhalten.“

Tom berechnete den Verlust, während Priya den Fehler nachverfolgte. Jede Bestellung, die in diesen zwanzig Minuten aufgegeben wurde, hatte 8 Dollar berechnet. Das Restaurant hatte 9 Dollar gewollt. Nimbus würde die Differenz schlucken müssen.

Die fünfminütige TTL hätte längst ablaufen sollen. Zwanzig Minuten waren vergangen. Priya zog den Code heran.

Der Cache-Schlüssel war `menu:restaurant-112`. Er war mit einer 300-Sekunden-TTL gesetzt worden. Sie prüfte, wann er zuletzt geschrieben worden war.

„Er wurde um 14:03 Uhr gesetzt“, sagte sie. „Vor zweiundzwanzig Minuten.“

„Aber die TTL ist fünf Minuten“, sagte Leo.

„Die TTL ist fünf Minuten ab dem ersten Cachen. Aber jede Anfrage, die den Cache traf, frischte die TTL auf. Der Cache-Eintrag wurde alle paar Sekunden von eingehenden Anfragen berührt, und die TTL wurde zurückgesetzt.“

„Er ist also nie abgelaufen.“

„Nicht in dieser Implementierung. Wir setzen die TTL bei jedem Cache-Lesen. Gleitendes Fenster. Der Eintrag blieb am Leben, solange ihn jemand traf.“

Die Lösung: eine feste TTL verwenden, die nur beim Schreiben gesetzt und beim Lesen nie verlängert wird. Der Eintrag läuft genau fünf Minuten nach dem Speichern ab, unabhängig davon, wie oft er gelesen wird. Wenn das Restaurant sein Menü aktualisierte, lief der alte Eintrag innerhalb von fünf Minuten ab, und die nächste Anfrage holte frische Daten.

„Und für Fälle, in denen ein Restaurant Preise aktualisiert und wir es sofort widergespiegelt brauchen?“, fragte Tom.

„Aktive Invalidierung“, sagte Priya. „Wenn das Restaurantpartner-Portal eine Aktualisierung übermittelt, ruft die API `cache.delete('menu:restaurant-112')` auf, bevor sie zurückkehrt. Die nächste Anfrage holt sofort frische Daten.“

„Aber das erfordert, dass das Portal vom Cache weiß.“

„Jeder Schreibpfad zur Datenbank muss vom Cache wissen. Das ist es, was Leo vorhin gesagt hat. Jetzt haben wir es erlebt.“

„Ich habe es schon deployt – oh.“ Leo hatte die Invalidierung im Portal implementiert, aber das Admin-Bearbeitungs-Interface vergessen. Zwei Wochen später hatte ein Admin ein Menü über das interne Dashboard aktualisiert, und der alte Preis hatte fünf Minuten lang im Cache überdauert. Eine kleinere Version desselben Vorfalls.

Sie fügten einen DynamoDB-Streams-Handler hinzu – aus dem vorherigen Kapitel –, der den Cache automatisch invalidierte, wann immer sich ein Menüpunkt änderte, unabhängig davon, welches System den Schreibvorgang ausgelöst hatte. Ein Handler, alle Schreibpfade abgedeckt.

---

**Cache Eviction: Wenn die Tafel voll wird**

Die Tagesangebotstafel hat begrenzten Platz. Wenn sie voll wird, müssen Sie etwas löschen, um Platz zu schaffen.

Redis (und Caches im Allgemeinen) haben *Eviction-Richtlinien*, die bestimmen, was entfernt wird, wenn der Speicher voll ist:

- **LRU (Least Recently Used)**: Entfernt Items, auf die am längsten nicht zugegriffen wurde.
- **LFU (Least Frequently Used)**: Entfernt Items, auf die am seltensten zugegriffen wird.
- **allkeys-random**: Zufällige Entfernung. Einfach, nicht optimal.
- **noeviction**: Gibt einen Fehler zurück, wenn der Speicher voll ist (die Anwendung muss das behandeln).

Für die meisten Webanwendungen: LRU. Die Dinge, die Sie kürzlich nicht angesehen haben, werden wahrscheinlich weniger benötigt.

---

**Das Cache-Stampede-Problem**

„Haben wir darüber nachgedacht, was passiert, wenn der gesamte Cache auf einmal leer wird?“, fragte Priya.

„Wann würde das passieren?“, sagte Leo.

„Wenn Sie einen neuen ElastiCache-Cluster deployen. Wenn die TTL einer großen Charge von Einträgen gleichzeitig abläuft. Wenn Sie den Cache leeren, um nach einem Bugfix einen Refresh zu erzwingen.“

Leo dachte es durch. „Wenn der Cache leer ist, geht jede Anfrage zur Datenbank. Alle auf einmal. Für ein paar Sekunden verarbeitet die Datenbank die volle Last jedes gleichzeitigen Benutzers.“

„Ohne Cache davor.“

„Das würde wehtun.“ Leo sah sich die Datenbankkapazitätseinstellungen an. „Wir würden ganz sicher gedrosselt werden.“

Das nennt man eine **Cache-Stampede** (auch Thundering Herd genannt). Sie tritt auf, wenn viele Cache-Einträge gleichzeitig ablaufen – oft, weil sie alle gleichzeitig während eines Deploys oder Kaltstarts erstellt wurden – und die plötzliche Welle von Cache Misses alle gleichzeitig die Datenbank trifft.

Mitigationsstrategien:

**Jitter auf der TTL**: Statt jeden Menü-Eintrag auf genau 300 Sekunden zu setzen, fügen Sie zufällige Variation hinzu: 270 bis 330 Sekunden. Einträge laufen zu leicht unterschiedlichen Zeiten ab und verteilen die Cache-Miss-Welle über eine Minute, statt gleichzeitig zuzuschlagen.

**Probabilistisches frühzeitiges Ablaufen**: Bevor ein Eintrag abläuft, frischt ein kleiner Prozentsatz der Anfragen ihn proaktiv auf. Das hält Einträge frisch, bevor sie veralten, und verhindert, dass das Ablaufen je zu einem Miss wird.

**Request Coalescing (Mutex/Lock)**: Wenn ein Cache Miss auftritt, erwerben Sie ein Lock, bevor Sie die Datenbank treffen. Andere gleichzeitige Anfragen für denselben Schlüssel warten, bis die erste Anfrage abgeschlossen ist und den Cache wieder befüllt, und lesen dann aus dem Cache. Pro Cache Miss wird nur eine Datenbankanfrage gestellt, selbst bei hoher Nebenläufigkeit.

Für Nimbus implementierten sie TTL-Jitter. Einfach, effektiv, keine zusätzliche Komplexität.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

„Zwei Zeilen Code“, sagte Leo. „Um einen potenziellen Datenbankausfall während Deploys zu verhindern.“

„Die meisten Zuverlässigkeitsverbesserungen sind so“, sagte Priya. „Billig zu implementieren, teuer zu lernen, dass man sie gebraucht hätte.“

---

**Redis-Datenstrukturen: Mehr als Key-Value**

Als Nimbus das Feature „Trending Restaurants“ hinzufügte, speicherte Leo das Ranking zunächst als einfache JSON-Liste: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Es funktionierte, aber das Aktualisieren war umständlich. Um ein neues Restaurant hinzuzufügen oder einen Score zu aktualisieren, musste er die gesamte Liste lesen, sie im Anwendungscode modifizieren und das Ganze zurückschreiben. Bei gleichzeitigen Schreibvorgängen aus der Analytics-Pipeline führten Race Conditions dazu, dass Scores überschrieben wurden.

Priya verwies ihn auf Redis Sorted Sets.

Ein **Sorted Set** in Redis speichert Mitglieder mit zugehörigen numerischen Scores. Mitglieder werden automatisch nach Score sortiert. Operationen sind atomar – keine Race Conditions durch gleichzeitige Aktualisierungen.

```
# Score eines Restaurants hinzufügen/aktualisieren
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Top 10 Restaurants nach Score abrufen (höchster zuerst)
ZREVRANGE trending:global 0 9 WITHSCORES

# Score eines Restaurants atomar erhöhen
ZINCRBY trending:global 50 "NIMBUS-047"
```

Die Analytics-Lambda rief jedes Mal, wenn eine Bestellung aufgegeben wurde, `ZINCRBY` auf und erhöhte den Score des Restaurants. Die Startseite rief `ZREVRANGE` auf, um die Top Ten zu erhalten. Keine Locks, keine Race Conditions, keine Read-Modify-Write-Zyklen.

Redis unterstützt mehrere weitere Datenstrukturen jenseits von einfachem Key-Value:

**Listen**: Geordnete Sequenzen. Vorne oder hinten anfügen. Verwenden Sie sie für Warteschlangen, Feeds für aktuelle Aktivitäten, Log-Streams.

**Sets**: Ungeordnete Sammlungen ohne Duplikate. Vereinigungs-, Schnitt-, Differenzoperationen. Verwenden Sie sie für „welche Benutzer haben diese Benachrichtigung gesehen?“ oder „welche Restaurants sind in dieser Kategorie?“

**Hashes**: Benannte Felder innerhalb eines Schlüssels. Verwenden Sie sie für strukturierte Objekte, bei denen Sie einzelne Felder aktualisieren möchten, ohne das ganze Objekt neu zu schreiben.

**HyperLogLog**: Probabilistische Kardinalitätsschätzung. Eindeutige Besucher einer Seite zählen, ohne jede Besucher-ID zu speichern. Kompakt und schnell.

**Pub/Sub**: Nachrichten an Kanäle veröffentlichen; Abonnenten erhalten sie in Echtzeit. Verwenden Sie es für leichtgewichtige Echtzeit-Benachrichtigungen zwischen Diensten.

„Redis ist nicht nur ein Cache“, sagte Leo. „Es ist ein Datenstruktur-Server.“

„Das ist seine offizielle Beschreibung“, sagte Priya.

„Ich dachte, es sei nur ein schickes Wörterbuch.“

„So hat es angefangen.“

---

**Write-Through: Das andere Caching-Muster**

Cache-Aside (Lazy Loading) ist das häufigste Muster. Aber es gibt ein zweites, das es zu kennen lohnt: **Write-Through**.

Beim Write-Through-Caching schreibt Ihre Anwendung jedes Mal, wenn sie in die Datenbank schreibt, auch sofort in den Cache.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

Der Vorteil: Der Cache ist immer aktuell. Es gibt keine veralteten Daten zwischen einem Schreibvorgang und dem Ablauf der TTL.

Der Nachteil: Jeder Schreibvorgang geht an zwei Stellen. Und Sie befüllen den Cache mit Daten, die vielleicht nie gelesen werden. Wenn zehn Restaurants ihre Menüs aktualisieren, aber nur zwei davon in den nächsten fünf Minuten nennenswerten Traffic bekommen, haben Sie Write-Through-Arbeit für acht Caches geleistet, die nicht genutzt werden, bevor sie ablaufen.

„Moment – aber *warum* würden wir das so machen?“, fragte Maya. „Wenn wir bei jeder Aktualisierung in den Cache schreiben, machen wir mehr Arbeit pro Schreibvorgang als zuvor. Wie ist das besser?“

„Es ist nicht immer besser“, sagte Priya. „Write-Through ist sinnvoll, wenn man kein Zeitfenster veralteter Daten nach einem Schreibvorgang tolerieren kann. Cache-Aside akzeptiert bis zu einer TTL an Veraltetheit im Austausch dafür, bei jedem Schreibvorgang keine zusätzliche Arbeit zu leisten.“

Für Nimbus: Cache-Aside war die richtige Wahl. Menüs wurden weitaus häufiger gelesen als geschrieben. Ein fünfminütiges Veraltetheitsfenster war akzeptabel. Für ein Finanzhandelssystem, bei dem jede Preisaktualisierung sofort widergespiegelt werden musste, wäre Write-Through angemessener.

Die Entscheidung läuft auf zwei Fragen hinaus: Wie ist Ihr Schreib-Lese-Verhältnis, und wie tolerant sind Sie gegenüber veralteten Lesevorgängen nach einem Schreibvorgang?


---

**ElastiCache for Redis: Was Sie verwaltet bekommen**

Wie RDS nimmt ElastiCache ein Open-Source-Werkzeug und erledigt die betriebliche Arbeit:

- **Automatisierte Backups**: Redis-Snapshots nach Zeitplan
- **Multi-AZ-Replikation**: Primärer Knoten + Read Replicas in verschiedenen AZs
- **Automatischer Failover**: Wenn der primäre Redis-Knoten ausfällt, wird automatisch eine Replik befördert
- **Cluster-Modus**: Horizontales Sharding über mehrere Knoten für sehr große Caches
- **Verschlüsselung**: Verschlüsselung im Transit und im Ruhezustand für Compliance
- **VPC-Integration**: Der Cache läuft in Ihrem privaten Netzwerk, nicht öffentlich zugänglich

„Wie viel kostet das pro Monat?“, fragte Tom.

„Weniger als die DynamoDB-Lesevorgänge, die wir ersetzen“, sagte Leo. „Um etwa zweihundert Dollar im Monat.“

Leo öffnete die Preisseite. Er hatte die Rechnung bereits gemacht, aber er ging sie mit Tom durch.

Eine `cache.t3.micro` – der kleinste Knoten – kostete etwa 12 Dollar im Monat. Sie hatte 0,5 GB Speicher. Genug für eine kleine Anwendung mit ein paar hundert Cache-Schlüsseln.

Eine `cache.r6g.large` – die für Nimbus' Traffic passende Stufe – hatte 13 GB Speicher und kostete etwa 140 Dollar im Monat. Zum Vergleich: Nimbus hatte vor dem Caching ungefähr 400 Dollar im Monat für DynamoDB-Lesevorgänge ausgegeben. Nach dem Caching waren diese Lesevorgänge um etwa 89 Prozent gesunken. Die Rechnung ergab eine Einsparung von ungefähr 356 Dollar im Monat bei DynamoDB-Lesevorgängen, minus 140 Dollar, die für ElastiCache ausgegeben wurden – eine Nettoeinsparung von etwa 216 Dollar im Monat.

Toms Ausdruck wechselte von skeptisch zu zufrieden. „Rechne die Zahlen ordentlich durch, bevor wir hochskalieren, aber das passt.“ Er schrieb es auf.

„Und was ist, wenn jemand versucht einzubrechen?“, sagte Priya. „Der Cache könnte Session-Tokens enthalten. Benutzerdaten. Wir brauchen Auth-Tokens auf der Redis-Instanz und keinen öffentlichen Zugriff.“

„Sie wird im privaten Subnetz sein“, sagte Leo.

„Gut. Aber ‚wird schon gutgehen‘ ist keine Sicherheitshaltung“, sagte sie. „Auth-Token. Verschlüsselung im Transit. Nur VPC.“

Leo nickte. Sie hatte recht.

---

**Den Cache überwachen**

„Haben wir darüber nachgedacht, was passiert, wenn der Cache nicht korrekt funktioniert?“, fragte Priya, eine Woche nach dem Redis-Deployment. „Nicht nur völlig ausfällt – funktioniert, aber schlecht. Hohe Miss-Rate. Hohe Eviction-Rate. Schleichend steigende Latenz.“

„Ich würde es bemerken, wenn die Seitenladezeiten steigen“, sagte Leo.

„Zu welchem Zeitpunkt die Datenbank bereits zu kämpfen hat“, sagte sie.

ElastiCache stellt Metriken über CloudWatch bereit. Die wichtigsten:

**CacheHitRate**: Der Prozentsatz der Cache-Lesevorgänge, die ein Ergebnis zurückgaben. Idealerweise über 80 % für einen ausgereiften Cache. Eine sinkende Hit-Rate signalisiert, dass Ihre am häufigsten abgerufenen Daten nicht im Cache sind – entweder sind die TTLs zu kurz, der Cache ist zu klein, oder Ihre Zugriffsmuster haben sich geändert.

**CacheMisses**: Absolute Anzahl der Cache Misses. Eine plötzliche Spitze hier bedeutet, dass der Cache nicht hilft und die Datenbank die volle Last trägt.

**Evictions**: Die Anzahl der Cache-Items, die verdrängt wurden, um Platz für neue zu schaffen. Hohe Eviction-Raten bedeuten, dass Ihr Cache zu klein für Ihren Working Set ist. Sie brauchen mehr Speicher oder eine selektivere Caching-Strategie.

**CurrConnections**: Aktuelle Client-Verbindungen zu Redis. Zu viele Verbindungen können Redis' Verbindungslimit erschöpfen. Anwendungen sollten Connection Pooling verwenden, um zu vermeiden, bei jeder Anfrage eine neue Verbindung zu öffnen.

**ReplicationLag**: Wie weit die Read Replica hinter dem Primärknoten liegt. Wenn das wächst, könnten Replik-Lesevorgänge veraltete Daten zurückgeben.

Leo richtete zwei CloudWatch-Alarme ein. Erstens: Alarm, wenn die Cache-Hit-Rate fünfzehn Minuten in Folge unter 70 % fiel – das würde ein Problem signalisieren, das es zu untersuchen lohnt, bevor die Datenbank es spürt. Zweitens: Alarm, wenn die Eviction-Rate 100 Evictions pro Minute überschritt – das würde signalisieren, dass der Cache unterdimensioniert war.

„Zwei Alarme“, sagte Priya und überprüfte die Konfiguration. „Das ist ein guter Anfang.“

„Ich habe auch ein Dashboard hinzugefügt“, sagte Leo. „Hit-Rate, Miss-Rate, Evictions, Latenz. Alles an einem Ort sichtbar.“

„Das ist besser, als darauf zu warten, dass die Seite langsam wird.“

„Erheblich besser“, stimmte Leo zu.


---

**ElastiCache vs. DAX: Welcher Cache für DynamoDB?**

„Wenn wir DynamoDB-Daten cachen“, fragte Maya, „warum nicht DAX statt ElastiCache verwenden? Ich habe es in der Dokumentation gesehen.“

Gute Frage.

**DAX (DynamoDB Accelerator)** ist ein zweckgebundener In-Memory-Cache für DynamoDB. Er fängt DynamoDB-API-Aufrufe auf Client-Ebene ab – Ihr Anwendungscode spricht mit DAX über dasselbe DynamoDB-SDK. Cache Misses werden automatisch aus DynamoDB geholt. Cache Hits kehren in Mikrosekunden zurück. Die Invalidierung wird automatisch behandelt, wenn sich Daten ändern.

**ElastiCache** ist ein Allzweck-Cache. Sie verwalten die Cache-Schlüssel, die TTL-Logik, die Invalidierung – alles davon. Mehr Kontrolle, mehr Verantwortung.

Wann was verwenden:

| Szenario | Empfehlung |
|---|---|
| Sie cachen DynamoDB-Lesevorgänge und wollen null Anwendungsänderungen | DAX |
| Sie benötigen Mikrosekunden-Latenz bei DynamoDB-Lesevorgängen | DAX |
| Sie cachen aus mehreren Quellen (DynamoDB + RDS + externe APIs) | ElastiCache |
| Sie benötigen Redis-Datenstrukturen (Sorted Sets, Pub/Sub, HyperLogLog) | ElastiCache |
| Sie benötigen feingranulare TTL-Kontrolle und benutzerdefinierte Invalidierungslogik | ElastiCache |
| Sie benötigen Session-Speicherung, Rate Limiting oder verteilte Locks | ElastiCache |

Für Nimbus: Sie wählten ElastiCache, weil sie Daten aus mehreren Quellen cachten – DynamoDB für Menüs, RDS für Zusammenfassungen der Bestellhistorie, externe APIs für Restaurantbewertungen. DAX funktioniert nur mit DynamoDB. Und sie brauchten Redis Sorted Sets für die Trending-Rankings.

„Wenn es rein ein DynamoDB-Caching-Problem wäre“, sagte Priya, „wäre DAX die einfachere Antwort. Ein Dienst, automatische Invalidierung, dieselbe API. Aber wir haben mehr als eine Datenquelle.“

„DAX ist also einfacher, wenn man DynamoDB-only ist“, fasste Maya zusammen. „ElastiCache, wenn man den vollen Werkzeugkasten braucht.“

„Das ist der Kompromiss.“

### Wenn Cache-Daten nicht verloren gehen dürfen: Amazon MemoryDB

„Warum würde jemand Redis als primäre Datenbank verwenden?“, fragte Maya. „Ist es nicht ein Cache?“

Das ist genau die richtige Frage.

ElastiCache for Redis ist ein Cache – schnell, In-Memory und von Natur aus nicht die Source of Truth. Wenn ein ElastiCache-Knoten ausfällt, ist der Cache beim Neustart leer. Anwendungen wärmen ihn aus der Datenbank wieder auf. Das ist für einen Cache in Ordnung.

Aber manche Anwendungsfälle behandeln Redis nicht als Cache, sondern als primären Datenspeicher – Sitzungszustand, der Neustarts überleben muss, ein Echtzeit-Leaderboard, das nicht verloren gehen darf, ein Warenkorb, der einen AZ-Ausfall überdauern muss. Für diese Anwendungsfälle ist ElastiCaches eventuelle Beständigkeit ein Risiko.

**Amazon MemoryDB for Redis** ist eine vollständig verwaltete, Redis-kompatible, beständige In-Memory-Datenbank. Anders als ElastiCache verwendet MemoryDB ein verteiltes Transaktionsprotokoll, das über mehrere AZs gespeichert ist und jeden Schreibvorgang beständig macht, bevor er bestätigt wird. Daten überleben Knotenausfälle – nicht weil sie aus einer langsameren Datenbank wiedergegeben werden, sondern weil sie nie nur an einem Ort waren.

Der entscheidende Unterschied:

| | ElastiCache for Redis | MemoryDB for Redis |
|---|---|---|
| Rolle | Cache-Schicht | Primäre Datenbank |
| Beständigkeit | Bei Ausfall nicht garantiert | Multi-AZ-Transaktionsprotokoll |
| Latenz | Mikrosekunden-Lese- und -Schreibvorgänge | Mikrosekunden-Lesevorgänge, einstellige Millisekunden-Schreibvorgänge |

Beide unterstützen dieselben Redis-Befehle und Datenstrukturen. Die API ist dieselbe. Die Beständigkeitsgarantie nicht.

Für Nimbus: Das Team will Echtzeit-Bestellzahlen pro Restaurant als Redis Sorted Set speichern – und sie müssen einen AZ-Ausfall überleben, ohne aus der Datenbank neu befüllt zu werden. Diese Anforderung – Redis-kompatibel *und* beständig – ist genau das Signal für MemoryDB.

„Wir müssen ihn also nach einem Ausfall nicht wieder aufwärmen?“, fragte Leo.

„Das ist der Punkt“, sagte Priya. „Wenn der Knoten ausfällt und zurückkommt, sind die Daten da. Das Transaktionsprotokoll hat sie behalten.“

Leo starrte einen Moment auf die Preisseite. „Es kostet mehr als ElastiCache.“

„Alles, dem zu vertrauen sich lohnt, tut das“, sagte Priya.

## Stärken und Grenzen

**Warum Caching leistungsstark ist**:

- Reduziert die Datenbanklast dramatisch (weniger Abfragen, niedrigere Kosten)
- Sub-Millisekunden-Antwortzeiten für Cache Hits
- Schützt Ihre Datenbank vor Traffic-Spitzen
- Redis unterstützt reichhaltigere Datenstrukturen als ein einfacher Key-Value-Speicher
- Cache-Stampede-Mitigation (TTL-Jitter, Coalescing) schützt vor Kaltstart-Wellen

**Wo Caching kompliziert wird**:

- Cache-Invalidierung ist wirklich schwer – veraltete Daten verursachen Fehler
- Fügt betriebliche Komplexität hinzu (ein weiterer zu überwachender Dienst, ein weiterer Fehlerpunkt)
- Kaltstart-Problem: Wenn Sie frisch deployen, ist der Cache leer – die Datenbank trägt die volle Last
- Cache-Stampede: Wenn viele Einträge auf einmal ablaufen, treffen alle Anfragen gleichzeitig die Datenbank
- ElastiCache-Knoten sind nicht kostenlos – Sie zahlen für sie, auch wenn sie im Leerlauf sind

**ElastiCache vs. DynamoDB DAX**:

Wenn Sie speziell DynamoDB-Daten cachen, bietet AWS **DAX (DynamoDB Accelerator)** an – einen zweckgebundenen In-Memory-Cache für DynamoDB. DAX ist transparent für Ihren Anwendungscode (dieselbe API), reduziert die DynamoDB-Lese-Latenz auf Mikrosekunden und behandelt die Cache-Invalidierung automatisch.

Verwenden Sie DAX, wenn Ihr Engpass DynamoDB-Lesevorgänge sind und Sie änderungsfreies Caching wollen. Verwenden Sie ElastiCache, wenn Sie einen Allzweck-Cache für eine beliebige Datenquelle benötigen oder wenn Sie Redis-Datenstrukturen benötigen.

## Zusammenfassung

Aus siebenundvierzig Datenbankaufrufen wurde ein Cache-Lookup. Die Seite ging von 188 Millisekunden auf 12. Das Hinzufügen einer Caching-Schicht ist eine der wirkungsvollsten Änderungen, die eine wachsende Anwendung vornehmen kann – aber nur, wenn der Cache durchdacht entworfen ist, mit klaren Antworten auf die Frage „Wann ändern sich diese Daten?“

- Ein Cache ist ein schneller Speicher kürzlich abgerufener Daten – man fragt einmal, merkt sich die Antwort. ElastiCache ist der verwaltete Caching-Dienst von AWS, der **Redis** (Persistenz, komplexe Datenstrukturen, Pub/Sub) und **Memcached** (reines Key-Value, horizontale Skalierung) unterstützt.
- Das **Cache-Aside-Muster** (Lazy Loading): zuerst den Cache prüfen, bei einem Miss auf die Datenbank zurückgreifen. Die **TTL** steuert, wie lange Daten gecacht bleiben – kurze TTL bedeutet frischere Daten und mehr Misses; lange TTL bedeutet schnellere Antworten und potenzielle Veraltetheit.
- Cachen Sie das Richtige: entitätsbezogene Daten, die über viele Benutzer geteilt werden, nicht benutzerbezogene Daten, die für jede Sitzung einzigartig sind. Eine Cache-Stampede tritt auf, wenn viele Einträge gleichzeitig ablaufen – mit TTL-Jitter mildern.
- **DAX** ist die richtige Wahl für DynamoDB-only-Caching. **ElastiCache** ist flexibler für Multi-Source-Caching und Redis-Datenstrukturen.
- Der schwierigste Teil des Cachings ist die Invalidierung: zu wissen, wann sich Daten ändern, und den Cache über alle Codepfade hinweg zu aktualisieren, die ihn schreiben. Ein Cache ist nur so vertrauenswürdig wie seine Invalidierungsstrategie.

## Prüfungstipps

*SAA-C03 Domäne: Design High-Performing Architectures (Domäne 3, Aufgabe 3.3)*

- **Redis vs. Memcached in der Prüfung**: Redis = Persistenz, Replikation, komplexe Strukturen, Pub/Sub. Memcached = einfaches Key-Value, reine horizontale Skalierung. Wenn das Szenario „Sie dürfen keine gecachten Daten verlieren“ erwähnt, ist die Antwort Redis (es persistiert auf die Festplatte).
- **ElastiCache-Anwendungsfall-Signale**: „Datenbank ist ein Engpass“, „leselastige Workload“, „Latenz reduzieren“, „Session Store“ – alle deuten auf ElastiCache hin.
- **DAX-Signal**: „DynamoDB-Lese-Latenz reduzieren“ oder „DynamoDB-Lesevorgänge sind zu langsam“ → DAX, nicht ElastiCache.
- **Session-Management**: ElastiCache Redis ist die kanonische Antwort zum Speichern von Benutzer-Sitzungsdaten. Zustandslose Anwendung + Redis-Session-Store = horizontale Skalierung mit konsistenten Sitzungen.
- **Write-Through vs. Cache-Aside**: Cache-Aside (Lazy Loading) ist das häufigste. Write-Through aktualisiert den Cache bei jedem Schreibvorgang – nie veraltet, aber mehr Schreiboperationen. Die Prüfung könnte sie unterscheiden.
- **Cache-Eviction-Richtlinien**: LRU (Least Recently Used) ist die häufigste Prüfungsantwort für allgemeine Web-Workloads.
- **ElastiCache vs. MemoryDB**: ElastiCache = Cache-Schicht, schnell, Datenverlust bei Ausfall akzeptabel. MemoryDB = beständige In-Memory-Primärdatenbank, Redis-kompatibel, Multi-AZ-Transaktionsprotokoll. Prüfungsauslöser: „Redis-kompatibel UND beständig“ oder „primärer Datenspeicher in Redis“ → MemoryDB, nicht ElastiCache.

## Übungen

**Übung 1 – Erinnerung**

In Ihren eigenen Worten: Was ist Cache-Invalidierung, und warum ist sie schwierig?

*(Hinweis: Denken Sie an all die Stellen in Nimbus, an denen Menüdaten aktualisiert werden könnten – das Restaurantpartner-Portal, ein Admin-Tool, ein Cron-Job. Jeder dieser Pfade muss vom Cache wissen.)*

**Übung 2 – SAA-C03-Szenario**

*Szenario*: Eine Video-Streaming-Plattform bedient Millionen von Benutzern. Der Katalog der verfügbaren Filme ändert sich selten (nächtlich aktualisiert). Die Anwendung hat eine hohe Datenbank-CPU-Auslastung, weil jede Benutzeranfrage den Katalog abfragt. Das Team möchte die Datenbanklast reduzieren und dabei die Katalogdaten innerhalb einer Stunde nach Updates aktuell halten.

Welche Lösung erfüllt diese Anforderungen am BESTEN?

A) Read Replicas zur RDS-Datenbank hinzufügen, um die Last zu verteilen  
B) Den Katalog zu DynamoDB mit On-Demand-Kapazität migrieren  
C) ElastiCache for Redis mit einer TTL von 1 Stunde für Katalogdaten verwenden  
D) Die RDS-Instanzgröße erhöhen, um mehr gleichzeitige Abfragen zu verarbeiten

**Hinweis 1**: Die Daten sind leselastig und ändern sich selten. Welches Muster ist dafür ideal?

**Hinweis 2**: „Aktuell innerhalb einer Stunde“ übersetzt sich direkt in einen bestimmten Cache-Konfigurationsparameter.

**Hinweis 3**: Das Ziel ist, die Datenbanklast zu reduzieren, nicht nur mehr davon zu bewältigen.

**Antwort**: C

**Erläuterung**: ElastiCache mit einer TTL von einer Stunde cacht Katalogdaten nach der ersten Anfrage pro Schlüssel. Nachfolgende Anfragen kehren aus dem Cache zurück, ohne die Datenbank zu berühren. Wenn die nächtliche Aktualisierung läuft, laufen Einträge innerhalb einer Stunde ab, und frische Daten werden bei der nächsten Anfrage geladen.

**Warum nicht A?** Read Replicas verteilen Lese-Traffic über mehr Datenbankknoten, reduzieren aber nicht die Gesamtzahl der Abfragen. Sie sind nützlich zum Skalieren von Lesevorgängen, nicht zum Reduzieren der Datenbanklast durch häufig wiederholte Abfragen.

**Warum nicht B?** Die Migration zu DynamoDB löst das zugrundeliegende Problem nicht – Katalogdaten würden bei jeder Benutzeranfrage immer noch aus der Datenbank (DynamoDB) abgerufen.

**Warum nicht D?** Das Hochskalieren der Instanz bewältigt mehr gleichzeitige Abfragen, reduziert aber nicht die Anzahl der Abfragen. Die grundlegende Ineffizienz bleibt bestehen.

*SAA-C03 Domäne: Design High-Performing Architectures – Aufgabe 3.3*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus möchte ein Feature „Trending Restaurants“ hinzufügen: eine gerankte Liste der Top 10 Restaurants nach Bestellvolumen in den letzten 24 Stunden, alle 15 Minuten aktualisiert.

Wie würden Sie dies mit ElastiCache Redis implementieren? Welche Redis-Datenstruktur würden Sie für das Ranking verwenden? Was wäre Ihre Cache-TTL, und wann genau würden Sie den Cache aktualisieren?

Überlegen Sie auch: Was passiert, wenn der ElastiCache-Knoten ausfällt? Bricht das Feature ab? Wie würden Sie um diesen Ausfall herum entwerfen?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, Cache-Design und Ausfalldenken zu üben.)*

## Post-Credits-Szene

„Ich habe es schon deployt – oh.“ Leo hatte die Redis-Integration in die Produktion gebracht, bevor er die Connection-Pool-Einstellungen aktualisiert hatte. Unter Last öffnete die Anwendung zu viele Redis-Verbindungen. Er hatte sie zurückrollen und mit der richtigen Konfiguration erneut deployen müssen.

Leo fügte Redis-Caching für das Menü hinzu. Die Seitenladezeit sank von 188 Millisekunden auf 12 Millisekunden.

Aus siebenundvierzig DynamoDB-Aufrufen wurde ein Redis-Lookup. Der Aufruf dauerte 0,8 Millisekunden.

Er verkündete dies beim Montags-Standup.

„Gute Arbeit“, sagte Priya, ohne von ihrem Laptop aufzublicken.

„Danke“, sagte Leo.

„Wann hast du das Redis-Auth-Token zuletzt rotiert?“

Leo sah in seine Notizen. „Ich glaube, ich habe keins gesetzt.“

„Also ist der Cache nicht authentifiziert.“

„Er ist innerhalb der VPC.“

„Genau wie alles andere, das kompromittiert ist.“ Sie blickte endlich auf. „Wenn Leos Laptop infiziert wird und jemand in die VPC eindringt, hat dein Cache kein Passwort.“

Leo starrte sie an.

„Ich setze das Auth-Token“, sagte er.

Im nächsten Kapitel: das private Netzwerk, das trennt, was Nimbus besitzt, vom Rest des Internets.
