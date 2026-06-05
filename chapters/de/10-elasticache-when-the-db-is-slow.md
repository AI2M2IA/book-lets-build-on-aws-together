# Kapitel 10: Wenn Die Datenbank Zu Langsam Ist

Die Seitenladungsmetriken waren auf dem Bildschirm geöffnet. Leo starrte sie seit zwanzig Minuten an, ohne etwas zu sagen.

47 DynamoDB-Anfragen pro Seitenladung. 188 Millisekunden, nur um die Daten abzurufen – bevor der Browser einen einzigen Pixel rendern konnte.

Er hatte die Rechnung aufgeschrieben. Zehntausend gleichzeitige Nutzer an einem Freitagabend: 470.000 DynamoDB-Lesevorgänge pro Minute. Die Kosten waren real. Aber die Latenz war das eigentliche Problem. Ein Nutzer, der die Nimbus-Browserseite öffnete, wartete fast 200 Millisekunden, bevor irgendetwas erschien – und das bei einer schnellen Verbindung.

„Die Datenbank antwortet mit vier Millisekunden pro Anfrage“, sagte Leo. „Das ist eigentlich schnell. DynamoDB erledigt seinen Job.“

„Dann warum ist die Seite langsam?“, fragte Maya.

„Weil wir sie 47 Mal pro Seitenladung aufrufen“, sagte Priya. „Das Problem ist nicht die Datenbank. Das Problem ist, dass wir ständig mit ihr sprechen.“

Tom lehnt sich vor. Er hatte den Blick, der auftaucht, wenn ein Problem zu einer Kosten-Diskussion wird. „Also die Lösung ist, weniger mit ihr zu sprechen?“

„Weniger mit ihr sprechen. Mehr merken.“

**Das Restaurant-Analogie**

Stellen Sie sich die Küche eines Restaurants vor. Jedes Mal, wenn ein Kellner wissen muss, welche Tagesangebote es gibt, geht er in die Rückseite, fragt den Koch und geht zurück zum Tisch.

Das funktioniert in Ordnung, wenn Sie zwei Kellner und drei Tische haben.

Stellen Sie sich jetzt 200 Kellner und 1000 Tische vor. Jeder von ihnen geht in die Rückseite für dieselbe Frage. Die Küche wird zum Engpass. Der Koch beantwortet dieselbe Frage 400 Mal pro Stunde.

Die offensichtliche Lösung: Schreiben Sie die Tagesangebote an einer Tafel an der Vorderseite des Restaurants. Jeder Kellner liest von der Tafel. Die Küche bekommt eine Pause. Die Tafel wird aktualisiert, wenn sich die Tagesangebote ändern.

Diese Tafel ist ein Cache.

Ein Cache ist ein schneller, lokaler Speicher für kürzlich abgerufene Daten. Anstatt das gleiche Ding immer wieder aus einer langsamen Quelle abzurufen, holen Sie es einmal ab und halten Sie es in der Nähe.

**Warum Nicht Einfach Den Speicher Verwenden?**

„Können wir nicht einfach das Menü im Speicher der Anwendung speichern?“, fragte Leo.

Gute Frage.

Das können Sie. Für eine Single-Server-Anwendung funktioniert In-Memory-Caching gut. Aber Nimbus läuft hinter einem Load Balancer, über mehrere EC2-Instanzen. Wenn eine Instanz das Menü in ihrem Speicher speichert, haben die anderen Instanzen diese Daten nicht. Jede Instanz hat ihren eigenen Cache. Wenn sich das Menü ändert, müssten Sie alle invalidieren.

Dies ist das *Cache-Kohärenzproblem* – mehrere Caches konsistent halten.

ElastiCache löst dies, indem es einen *zentralisierten* Cache bereitstellt, auf den alle Ihre Instanzen zugreifen können. Anstatt dass jeder Server seinen eigenen Speicher hat, lesen und schreiben alle Server in denselben Cache. Eine Aktualisierung wird an alle weitergegeben.

**Lernen Sie ElastiCache**

Amazon ElastiCache ist ein verwalteter Caching-Dienst. Es läuft beliebte Caching-Engines – Redis und Memcached – ohne dass Sie die Server verwalten müssen.

**Redis** ist das leistungsfähigere der beiden. Es unterstützt komplexe Datenstrukturen (Strings, Listen, Sets, Hashes, sortierte Sets), Persistenz (Daten überleben Neustarts), Replikation und Pub/Sub-Messaging. Redis kann mehr als nur Caching – es kann als ein leichter Datenspeicher fungieren.

**Memcached** ist einfacher. Reine Key-Value-Caching, horizontal skalierbar, keine Persistenz. Schneller für einfache Anwendungsfälle, aber weniger Funktionen.

Für Nimbus: Redis. Sie brauchten, um Menudaten (strukturiert), Session-Tokens (Key-Value) zu cachen, und später wollten sie sortierte Sets für Ranglisten für „Trending Restaurants“.

**Wie Caching In Der Praxis Funktioniert**

Das grundlegende Caching-Muster heißt **Cache-Aside** (auch Lazy Loading genannt):

1. Anwendung benötigt Daten
2. Überprüfen Sie zuerst den Cache
3. Wenn gefunden (*Cache-Hit*): Daten sofort zurückgeben
4. Wenn nicht gefunden (*Cache-Miss*): Gehen Sie zur Datenbank, holen Sie die Daten, speichern Sie sie im Cache, geben Sie sie zurück

In Pseudocode:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

The first request always hits the database. Every subsequent request hits the cache. With a cache, Nimbus’s forty-seven DynamoDB reads per page load become one or two cache lookups. Fast, cheap, and scalable.

**The TTL: How Long Do You Remember?**

Every cache entry has a **Time-To-Live (TTL)**: the duration after which the entry expires and the next request goes back to the database for fresh data.

This is the core tension of caching: freshness vs. performance.

- **Short TTL (seconds)**: Very fresh data, but lots of cache misses. Cache barely helps.
- **Long TTL (hours or days)**: Very fast, but data can become stale. Customer sees yesterday’s menu.

For menu data, five minutes is reasonable. The menu doesn't change every second. If a restaurant updates their menu, customers might see the old version for up to five minutes — acceptable.

For session tokens (is this user logged in?), shorter TTL makes sense, or you update the cache immediately when the session changes.

For financial data (order totals, payment records), don’t cache it — or if you do, invalidate immediately on write.

“There are only two hard problems in computer science,” Leo quoted, with the practiced delivery of someone who’d said it before. “Cache invalidation and naming things.”

“Why is cache invalidation hard?” Maya asked.

“Because when does data *actually* change? Did the menu change because a restaurant partner updated it? Or because a cron job ran? Or because an admin manually edited it? Every place that can change the data needs to know to tell the cache.”

This is why senior engineers start a caching conversation with “what are the write paths?” instead of “let’s add Redis.”

**Cache Eviction: When the Board Gets Full**

The specials board has limited space. When it fills up, you have to erase something to make room.

Redis (and caches in general) have *eviction policies* that determine what gets removed when memory is full:

- **LRU (Least Recently Used)**: Remove items that haven't been accessed in the longest time.
- **LFU (Least Frequently Used)**: Remove items that are accessed least often.
- **allkeys-random**: Random eviction. Simple, not optimal.
- **noeviction**: Return an error when memory is full (application must handle this).

For most web applications: LRU. The things you haven't looked at recently are probably less needed.

**ElastiCache for Redis: What You Get Managed**

Like RDS, ElastiCache takes an open-source tool and handles the operational work:

- **Automated backups**: Redis snapshots on a schedule
- **Multi-AZ replication**: Primary node + read replicas in different AZs
- **Automatic failover**: If the primary Redis node fails, a replica is promoted automatically
- **Cluster mode**: Horizontal sharding across multiple nodes for very large caches
- **Encryption**: In-transit and at-rest encryption for compliance
- **VPC integration**: Cache runs in your private network, not publicly accessible

Tom looked at the feature list. “How much does it cost?”

“Less than the DynamoDB reads we’re replacing,” Leo said. “I ran the numbers.”

Tom’s expression shifted from skeptical to interested. That was progress.

## Strengths and Limitations

**Why caching is powerful**:

- Dramatically reduces database load (fewer queries, lower costs)
- Sub-millisecond response times for cache hits
- Protects your database from traffic spikes
- Redis supports richer data structures than a simple key-value store

**Where caching gets complicated**:

- Cache invalidation is genuinely hard — stale data causes bugs
- Adds operational complexity (another service to monitor, another failure point)
- Cold start problem: when you deploy fresh, the cache is empty — database takes the full load
- Cache stampede: if many entries expire at once, all requests hit the database simultaneously
- ElastiCache nodes are not free — you pay for them even when idle

**ElastiCache vs DynamoDB DAX**:

If you’re caching DynamoDB data specifically, AWS offers **DAX (DynamoDB Accelerator)** — a purpose-built in-memory cache for DynamoDB. DAX is transparent to your application code (same API), reduces DynamoDB read latency to microseconds, and handles cache invalidation automatically.

Use DAX when your bottleneck is DynamoDB reads. Use ElastiCache when you need a general-purpose cache for any data source.

## Summary

- A cache is a fast store of recently retrieved data — you ask once, remember the answer.
- ElastiCache is AWS’s managed caching service, supporting Redis and Memcached.
- **Redis** is richer (complex data structures, persistence, pub/sub). **Memcached** is simpler (pure key-value, horizontally scalable).
- The **cache-aside pattern** (lazy loading): check cache first, fall back to database on miss.
- **TTL** controls how long data stays cached. Short TTL = fresh, many misses. Long TTL = fast, potentially stale.
- Cache invalidation is hard. Know all the write paths before adding a cache.
- ElastiCache manages replication, failover, backups, and encryption — you focus on cache design.
- **DAX** is the DynamoDB-specific cache. ElastiCache is general-purpose.

## Exam Tips

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- **Redis vs. Memcached im Examen**: Redis = Persistenz, Replikation, komplexe Strukturen, Pub/Sub. Memcached = einfacher Key-Value, reine horizontale Skalierung. Wenn das Szenario „Sie dürfen keine gecachten Daten verlieren“ erwähnt, ist die Antwort Redis (es speichert auf der Festplatte).
- **ElastiCache Anwendungsfall-Signale**: „Die Datenbank ist ein Engpass“, „read-heavy Arbeitslast“, „Reduzierung der Latenz“, „Session Store“ – all diese Punkte deuten auf ElastiCache hin.
- **DAX-Signal**: „Reduzierung der DynamoDB-Latenz für Lesezugriffe“ oder „DynamoDB-Lesezugriffe sind zu langsam“ → DAX, nicht ElastiCache.
- **Sitzungsmanagement**: ElastiCache Redis ist die kanonische Antwort zum Speichern von Benutzer-Sitzungsdaten. Stateless Anwendung + Redis-Sitzungsstore = horizontale Skalierung mit konsistenten Sitzungen.
- **Schreib-durch- vs. Cache-aside**: Cache-aside (lazy Loading) ist der häufigste. Schreib-durch aktualisiert den Cache bei jedem Schreibvorgang – nie veraltet, aber mehr Schreiboperationen. Im Examen können sie sich unterscheiden.
- **Cache-Leerungspolicen**: LRU (least recently used) ist die häufigste Antwort für allgemeine Web-Workloads.

## Übungen

**Übung 1 – Erinnerung**

In Ihren eigenen Worten: Was ist Cache-Invalidierung und warum ist sie schwierig?

*(Hinweis: Denken Sie über all die Orte in Nimbus nach, an denen Menüdaten aktualisiert werden könnten – das Restaurant-Partner-Portal, ein Admin-Tool, ein Cron-Job. Jeder dieser Pfade muss über den Cache informiert sein.)*

**Übung 2 – Examen-Übung**

*Szenario*: Eine Video-Streaming-Plattform bedient Millionen von Nutzern. Das Angebot an verfügbaren Filmen ändert sich selten (täglich aktualisiert). Die Anwendung hat eine hohe CPU-Auslastung der Datenbank, weil jeder Benutzeranfrage den Katalog abfragt. Das Team möchte die Datenbanklast reduzieren, während die Katalogdaten innerhalb einer Stunde nach Updates korrekt bleiben.

Welche Lösung BEST erfüllt diese Anforderungen?

A) Füge Lese-Replikate zur RDS-Datenbank hinzu, um die Last zu verteilen
B) Migriere den Katalog zu DynamoDB mit On-Demand-Kapazität
C) Verwende ElastiCache für Redis mit einem TTL von 1 Stunde für Katalogdaten
D) Erhöhe die RDS-Instanzgröße, um mehr gleichzeitige Anfragen zu verarbeiten

**Hinweis 1**: Die Daten sind read-heavy und ändern sich selten. Welches Muster ist ideal für diese Situation?

**Hinweis 2**: „Genau innerhalb einer Stunde“ übersetzt sich direkt in einen Cache-Konfigurationsparameter.

**Hinweis 3**: Das Ziel ist es, die Datenbanklast zu reduzieren, nicht nur sie zu bewältigen.

**Antwort**: C

**Erläuterung**: ElastiCache mit einem TTL von 1 Stunde cacht Katalogdaten nach dem ersten Schlüssel-Request. Nachfolgende Anfragen erhalten Daten aus dem Cache, ohne die Datenbank zu kontaktieren. Wenn die tägliche Aktualisierung läuft, verfallen Einträge innerhalb einer Stunde und frische Daten werden bei der nächsten Anfrage in den Cache geladen.

**Warum nicht A?** Lese-Replikate verteilen Lese-Traffic auf mehr Datenbankknoten, aber sie reduzieren nicht die Gesamtzahl der Anfragen. Sie sind nützlich für das Skalieren von Lesezugriffen, nicht um die Datenbanklast durch häufige, wiederholte Anfragen zu reduzieren.

**Warum nicht B?** Die Migration zu DynamoDB löst das zugrunde liegende Problem nicht – Katalogdaten würden immer noch aus der Datenbank (DynamoDB) bei jeder Benutzeranfrage abgerufen.

**Warum nicht D?** Das Hochskalieren der Instanz verarbeitet mehr gleichzeitige Anfragen, reduziert aber nicht die Anzahl der Anfragen. Die grundlegende Ineffizienz bleibt bestehen.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**Übung 3 – Architektur-Herausforderung *(Optional)***

Nimbus möchte eine Funktion „Trending Restaurants“ hinzufügen: Eine geordnete Liste der Top 10 Restaurants nach Bestellvolumen der letzten 24 Stunden, die alle 15 Minuten aktualisiert wird.

Wie würden Sie dies mit ElastiCache Redis implementieren? Welche Redis-Datenstruktur würden Sie verwenden? Was wäre Ihr Cache-TTL und wann würden Sie den Cache genau aktualisieren?

Berücksichtigen Sie auch: Was passiert, wenn der ElastiCache-Knoten ausfällt? Bricht die Funktion ab? Wie würden Sie diesen Ausfallfall gestalten?

*(Es gibt keine einzelne korrekte Antwort. Das Ziel ist es, Cache-Designs und Ausfallüberlegungen zu üben.)*

## Post-Credits-Szene

Leo hat Caching für das Menü hinzugefügt. Die Seitenladezeit sank von 188 Millisekunden auf 12 Millisekunden.

47 DynamoDB-Aufrufe wurden zu einem Redis-Lookup. Der Aufruf dauerte 0,8 Millisekunden.

Er kündigte dies auf der Montagsplauscher an.

„Gute Arbeit“, sagte Priya, ohne von ihrem Laptop aufzublicken.

„Danke“, sagte Leo.

„Wann hast du das Redis-Authentifizierungstoken zuletzt rotiert?“

Leo sah in seine Notizen. „Ich glaube, ich habe es nicht gesetzt.“

„Also ist der Cache nicht authentifiziert.“

„Er befindet sich im VPC.“

„So ist alles andere, das in derselben VPC ist.“ Sie blickte endlich auf. „Wenn Leos Laptop infiziert wird und jemand in die VPC hineinpirscht, hat dein Cache keinen Passwort.“

Leo starrte sie an.

„Ich werde das Authentifizierungstoken setzen“, sagte er.

In der nächsten Episode: Das private Netzwerk, das die Trennung zwischen Nimbus und dem Rest des Internets sicherstellt.
