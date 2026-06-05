# Chapter 10: When the Database Is Too Slow

The page load metrics were open on the screen. Leo had been looking at them for twenty minutes without saying anything.

Forty-seven DynamoDB requests per page load. One hundred and eighty-eight milliseconds just to retrieve the data — before the browser rendered a single pixel.

He'd done the math. Ten thousand concurrent users on a Friday evening, each loading the browse page about once a minute: four hundred and seventy thousand DynamoDB reads per minute. The cost was real. But the latency was the actual problem. A user opening the Nimbus browse page waited almost two hundred milliseconds before anything appeared — and that was on a fast connection.

---

*The week before, the DynamoDB schema redesign had worked. The menu table was flexible now — any restaurant could add any modifier, any combo structure, any seasonal variation. The performance on individual lookups was excellent. But excellent individual lookups, multiplied by forty-seven per page, still added up to slow pages. The DynamoDB problem was solved. A new problem had taken its place.*

---

"The database is responding in four milliseconds per request," Leo said. "That's actually fast. DynamoDB is doing its job."

"Then why is the page slow?" Maya asked.

"Because we're calling it forty-seven times per page load," Priya said. "The problem isn't the database. The problem is that we're talking to it too much."

Tom leaned forward. He had the look he got when a problem was about to become a cost conversation. "So the solution is to talk to it less?"

"Talk to it less. Remember more."

---

**The Wrong First Attempt**

Leo's first instinct was to cache per-user data. Each user had a session, and the session loaded their profile: saved addresses, payment methods, order history summary. Maybe caching that would speed things up.

He implemented it. Redis key format: `user:{userId}:profile`. TTL: ten minutes.

He ran the load test. Page load dropped by six milliseconds.

"That's not much," Tom observed.

"No," Leo said.

"Why not?"

Leo stared at the graph for a moment. "Because the user profile is only one request. There are still forty-six DynamoDB calls per page. And those are the menu calls — one per restaurant on the browse page. I cached the wrong thing."

This is a common mistake in caching: optimizing the thing that isn't the bottleneck. The user profile loaded in two milliseconds. Caching something that fast saved almost nothing. The menu data — fetched forty-seven times, taking four milliseconds each — was the actual problem.

"You need to cache per-menu, not per-user," Priya said. "The menu for Restaurant 047 is the same for every user who browses it. That's the data that's worth caching — it's identical across thousands of requests."

Per-user caches are valuable when users have expensive personalized state. Per-entity caches (menus, product catalogs, config) are valuable when the same data is served to thousands of users. Know which problem you have before you write the code.

Leo redesigned the cache keys: `menu:{restaurantId}`. One cache entry per restaurant, shared by every user browsing that restaurant.

He ran the load test again. Page load dropped from 188 milliseconds to 12 milliseconds. That was the improvement they'd been looking for.

---

**The Restaurant Analogy**

Imagine the kitchen of a restaurant. Every time a waiter needs to know the day's specials, they walk to the back, ask the chef, and walk back to the table.

That works fine if you have two waiters and three tables.

Now imagine two hundred waiters and a thousand tables. Every one of them walking to the back for the same question. The kitchen becomes the bottleneck. The chef is answering the same question four hundred times an hour.

The obvious solution: write the specials on a board at the front of the restaurant. Every waiter reads from the board. The kitchen gets a break. The board gets updated when the specials change.

That board is a cache.

A cache is a fast, local store of recently retrieved data. Instead of fetching the same thing from a slow source repeatedly, you fetch it once and keep it close.

There's another analogy that engineers find useful: the library reserve shelf. When a popular book is checked in, the librarian knows it'll be requested again soon, so they put it on the reserve shelf near the front desk instead of shelving it in the stacks. The next patron doesn't have to walk the whole library — they find it right at the desk. The reserve shelf has limited space. If it fills up, older books get moved back to the stacks to make room for newer ones. A cache works identically: frequently accessed data stays near the front, infrequently accessed data gets evicted to make room.

**Why Not Just Use Memory?**

"Can't we just store the menu in the application's memory?" Leo asked.

Valid question.

You can. For a single-server application, in-memory caching works fine. But Nimbus runs behind a load balancer, across multiple EC2 instances. If one instance caches the menu in its memory, the other instances don't have that data. They each maintain separate caches. When the menu updates, you'd have to invalidate all of them.

This is the *cache coherence problem* — keeping multiple caches consistent.

ElastiCache solves this by providing a *centralized* cache that all your instances share. Instead of each server having its own memory, every server reads from and writes to the same cache. One update propagates to all.

**Meet ElastiCache**

"Wait — but *why* would we do it that way?" Maya asked. "Why a whole new service? Why not just add more database capacity?"

Good question. The answer is that adding more database capacity — larger instances, more read replicas — doesn't fix the fundamental issue. Each of those forty-seven page-load requests still costs time and money, even on a faster database. A cache doesn't make the database faster; it means the database gets asked the same question far less often. For data that's read repeatedly and changes infrequently — like a restaurant's menu — a cache means the database might answer that question once every five minutes instead of forty-seven times per page load.

Amazon ElastiCache is a managed caching service. It runs popular caching engines — Redis and Memcached — without you having to manage the servers.

**Redis** is the more powerful of the two. It supports complex data structures (strings, lists, sets, hashes, sorted sets), persistence (data survives restarts), replication, and pub/sub messaging. Redis can do more than caching — it can function as a lightweight data store.

**Memcached** is simpler. Pure key-value caching, horizontally scalable, no persistence. Faster for simple use cases but fewer features.

For Nimbus: Redis. They needed to cache menu data (structured), session tokens (key-value), and later they'd want sorted sets for "trending restaurants" rankings.

**How Caching Works in Practice**

The basic caching pattern is called **cache-aside** (also called lazy loading):

1. Application needs data
2. Check the cache first
3. If found (*cache hit*): return data immediately
4. If not found (*cache miss*): go to the database, get the data, store it in the cache, return it

In pseudocode:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

The first request always hits the database. Every subsequent request hits the cache. With a cache, Nimbus's forty-seven DynamoDB reads per page load become one or two cache lookups. Fast, cheap, and scalable.

**The TTL: How Long Do You Remember?**

Every cache entry has a **Time-To-Live (TTL)**: the duration after which the entry expires and the next request goes back to the database for fresh data.

This is the core tension of caching: freshness vs. performance.

- **Short TTL (seconds)**: Very fresh data, but lots of cache misses. Cache barely helps.
- **Long TTL (hours or days)**: Very fast, but data can become stale. Customer sees yesterday's menu.

For menu data, five minutes is reasonable. The menu doesn't change every second. If a restaurant updates their menu, customers might see the old version for up to five minutes — acceptable.

For session tokens (is this user logged in?), shorter TTL makes sense, or you update the cache immediately when the session changes.

For financial data (order totals, payment records), don't cache it — or if you do, invalidate immediately on write.

You might be wondering: why not just add more database capacity instead of introducing a whole new caching layer? More replicas, a bigger instance — why not that? The answer is that additional database capacity multiplies your ability to handle simultaneous requests, but it doesn't reduce the number of requests. If ten thousand users are each triggering forty-seven reads per page load, adding a second read replica just means each replica handles twenty-three thousand requests instead of forty-seven thousand — the total work doesn't shrink. A cache eliminates the redundant work entirely: those ten thousand users share the same cached result.

"There are only two hard problems in computer science," Leo quoted, with the practiced delivery of someone who'd said it before. "Cache invalidation and naming things."

"Why is cache invalidation hard?" Maya asked.

"Because when does data *actually* change? Did the menu change because a restaurant partner updated it? Or because a cron job ran? Or because an admin manually edited it? Every place that can change the data needs to know to tell the cache."

This is why senior engineers start a caching conversation with "what are the write paths?" instead of "let's add Redis."

---

**The Cache Invalidation Story**

They found out how hard cache invalidation was the first time a restaurant partner complained.

Restaurant 112 — a Colombian joint in the Eastside — had updated their prices on a Thursday afternoon. They'd raised the arepa from $8 to $9. They called Nimbus support twenty minutes later.

"Our menu still shows the old price," the owner said. "Customers are placing orders at $8. We have to honor that price now."

Tom calculated the loss while Priya traced the bug. Every order placed in those twenty minutes had charged $8. The restaurant had wanted $9. Nimbus would have to absorb the difference.

The five-minute TTL should have expired long ago. Twenty minutes had passed. Priya pulled the code.

The cache key was `menu:restaurant-112`. It had been set with a 300-second TTL. She checked when it was last written.

"It was set at 2:03 PM," she said. "Twenty-two minutes ago."

"But the TTL is five minutes," Leo said.

"The TTL is five minutes from when it was first cached. But every request that hit the cache was refreshing the TTL. The cache entry was being touched every few seconds by incoming requests, and the TTL was being reset."

"So it never expired."

"Not in this implementation. We set the TTL on every cache read. Sliding window. The entry stayed alive as long as anyone was hitting it."

The fix: use a fixed TTL set only on write, never extended on read. The entry expires exactly five minutes after it's stored, regardless of how many times it's read. When the restaurant updated their menu, the old entry expired within five minutes and the next request fetched fresh data.

"And for cases where a restaurant updates prices and we need it reflected immediately?" Tom asked.

"Active invalidation," Priya said. "When the restaurant partner portal submits an update, the API calls `cache.delete('menu:restaurant-112')` before returning. Next request fetches fresh data immediately."

"But that requires the portal to know about the cache."

"Every write path to the database needs to know about the cache. That's what Leo said earlier. Now we've lived it."

"I already deployed it — oh." Leo had implemented the invalidation in the portal but forgotten the admin edit interface. Two weeks later, an admin had updated a menu through the internal dashboard, and the old price had persisted in cache for five minutes. A smaller version of the same incident.

They added a DynamoDB Streams handler — from the previous chapter — that automatically invalidated the cache whenever a menu item changed, regardless of which system had triggered the write. One handler, all write paths covered.

---

**Cache Eviction: When the Board Gets Full**

The specials board has limited space. When it fills up, you have to erase something to make room.

Redis (and caches in general) have *eviction policies* that determine what gets removed when memory is full:

- **LRU (Least Recently Used)**: Remove items that haven't been accessed in the longest time.
- **LFU (Least Frequently Used)**: Remove items that are accessed least often.
- **allkeys-random**: Random eviction. Simple, not optimal.
- **noeviction**: Return an error when memory is full (application must handle this).

For most web applications: LRU. The things you haven't looked at recently are probably less needed.

---

**The Cache Stampede Problem**

"Have we thought about what happens if the entire cache goes empty at once?" Priya asked.

"When would that happen?" Leo said.

"When you deploy a new ElastiCache cluster. When the TTL on a large batch of entries expires simultaneously. When you flush the cache to force a refresh after a bug fix."

Leo thought through it. "If the cache is empty, every request goes to the database. All at once. For a few seconds, the database handles the full load of every concurrent user."

"With no cache in front of it."

"That would hurt." Leo looked at the database capacity settings. "We'd get throttled for sure."

This is called a **cache stampede** (also called a thundering herd). It happens when many cache entries expire at the same time — often because they were all created at the same time during a deploy or cold start — and the sudden wave of cache misses all hit the database simultaneously.

Mitigation strategies:

**Jitter on TTL**: Instead of setting every menu entry to exactly 300 seconds, add random variation: 270 to 330 seconds. Entries expire at slightly different times, spreading out the cache miss wave over a minute instead of hitting simultaneously.

**Probabilistic early expiration**: Before an entry expires, a small percentage of requests proactively refresh it. This keeps entries fresh before they go stale, preventing the expiration from ever becoming a miss.

**Request coalescing (mutex/lock)**: When a cache miss occurs, acquire a lock before hitting the database. Other concurrent requests for the same key wait for the first request to complete and repopulate the cache, then read from the cache. Only one database request is made per cache miss, even under high concurrency.

For Nimbus, they implemented TTL jitter. Simple, effective, no additional complexity.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"Two lines of code," Leo said. "To prevent a potential database outage during deploys."

"Most reliability improvements are like that," Priya said. "Cheap to implement, expensive to learn you needed them."

---

**Redis Data Structures: More Than Key-Value**

When Nimbus added the "trending restaurants" feature, Leo initially stored the ranking as a plain JSON list: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

It worked, but updating it was awkward. To add a new restaurant or update a score, he had to read the entire list, modify it in application code, and write the whole thing back. Under concurrent writes from the analytics pipeline, race conditions caused scores to get overwritten.

Priya pointed him at Redis sorted sets.

A **sorted set** in Redis stores members with associated numeric scores. Members are automatically sorted by score. Operations are atomic — no race conditions from concurrent updates.

```
# Add/update a restaurant's score
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Get top 10 restaurants by score (highest first)
ZREVRANGE trending:global 0 9 WITHSCORES

# Increment a restaurant's score atomically
ZINCRBY trending:global 50 "NIMBUS-047"
```

The analytics Lambda called `ZINCRBY` every time an order was placed, incrementing the restaurant's score. The homepage called `ZREVRANGE` to get the top ten. No locks, no race conditions, no read-modify-write cycles.

Redis supports several other data structures beyond simple key-value:

**Lists**: Ordered sequences. Push to the front or back. Use for queues, recent activity feeds, log streams.

**Sets**: Unordered collections with no duplicates. Union, intersection, difference operations. Use for "which users have seen this notification?" or "which restaurants are in this category?"

**Hashes**: Named fields within a key. Use for structured objects where you want to update individual fields without rewriting the whole object.

**HyperLogLog**: Probabilistic cardinality estimation. Count unique visitors to a page without storing every visitor ID. Compact and fast.

**Pub/Sub**: Publish messages to channels; subscribers receive them in real time. Use for lightweight real-time notifications between services.

"Redis is not just a cache," Leo said. "It's a data structure server."

"That's its official description," Priya said.

"I thought it was just a fancy dictionary."

"It started that way."

---

**Write-Through: The Other Caching Pattern**

Cache-aside (lazy loading) is the most common pattern. But there is a second one worth knowing: **write-through**.

In write-through caching, every time your application writes to the database, it also writes to the cache immediately.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

The advantage: the cache is always up to date. There is no stale data between a write and the TTL expiry.

The disadvantage: every write goes to two places. And you populate the cache with data that might never be read. If ten restaurants update their menus but only two of them get significant traffic in the next five minutes, you have done write-through work for eight caches that will not be used before they expire.

"Wait — but *why* would we do it that way?" Maya asked. "If we write to the cache on every update, we are doing more work per write than before. How is that better?"

"It is not always better," Priya said. "Write-through makes sense when you cannot tolerate any window of stale data after a write. Cache-aside accepts up to one TTL of staleness in exchange for not doing extra work on every write."

For Nimbus: cache-aside was the right choice. Menus were read far more often than they were written. A five-minute stale window was acceptable. For a financial trading system where every price update needed to be immediately reflected, write-through would be more appropriate.

The decision comes down to two questions: what is your write-to-read ratio, and how tolerant are you of stale reads after a write?


---

**ElastiCache for Redis: What You Get Managed**

Like RDS, ElastiCache takes an open-source tool and handles the operational work:

- **Automated backups**: Redis snapshots on a schedule
- **Multi-AZ replication**: Primary node + read replicas in different AZs
- **Automatic failover**: If the primary Redis node fails, a replica is promoted automatically
- **Cluster mode**: Horizontal sharding across multiple nodes for very large caches
- **Encryption**: In-transit and at-rest encryption for compliance
- **VPC integration**: Cache runs in your private network, not publicly accessible

"How much does that cost per month?" Tom asked.

"Less than the DynamoDB reads we're replacing," Leo said. "By about two hundred dollars a month."

Leo pulled up the pricing page. He had already done the math, but he walked Tom through it.

A `cache.t3.micro` — the smallest node — was about $12 per month. It had 0.5 GB of memory. Enough for a small application with a few hundred cache keys.

A `cache.r6g.large` — the tier appropriate for Nimbus's traffic — had 13 GB of memory and ran about $140 per month. For comparison, Nimbus had been spending roughly $400 per month on DynamoDB reads before caching. Post-caching, those reads had dropped by about 89 percent. The math worked out to roughly $356 per month saved on DynamoDB reads, minus $140 spent on ElastiCache — a net saving of about $216 per month.

Tom's expression shifted from skeptical to satisfied. "Run the numbers properly before we scale up, but that tracks." He wrote it down.

"And what if someone tries to break in?" Priya said. "The cache might have session tokens. User data. We need auth tokens on the Redis instance and no public access."

"It'll be in the private subnet," Leo said.

"Good. But 'it'll be fine' is not a security posture," she said. "Auth token. Encryption in transit. VPC only."

Leo nodded. She was right.

---

**Monitoring the Cache**

"Have we thought about what happens when the cache is not working correctly?" Priya asked, a week after the Redis deployment. "Not just fails completely — works, but poorly. High miss rate. High eviction rate. Latency creeping up."

"I would notice when page load times increase," Leo said.

"By which point the database is already struggling," she said.

ElastiCache exposes metrics through CloudWatch. The ones that matter most:

**CacheHitRate**: The percentage of cache reads that returned a result. Ideally above 80% for a mature cache. A dropping hit rate signals that your most-accessed data is not in the cache — either TTLs are too short, the cache is too small, or your access patterns have changed.

**CacheMisses**: Absolute count of cache misses. A sudden spike here means the cache is not helping and the database is taking the full load.

**Evictions**: The number of cache items evicted to make room for new ones. High eviction rates mean your cache is too small for your working set. You need more memory or a more selective caching strategy.

**CurrConnections**: Current client connections to Redis. Too many connections can exhaust Redis's connection limit. Applications should use connection pooling to avoid opening a new connection on every request.

**ReplicationLag**: How far behind the read replica is from the primary. If this grows, replica reads may return stale data.

Leo set up two CloudWatch alarms. First: alert if the cache hit rate dropped below 70% for fifteen consecutive minutes — that would signal a problem worth investigating before the database felt it. Second: alert if the eviction rate exceeded 100 evictions per minute — that would signal the cache was undersized.

"Two alarms," Priya said, reviewing the configuration. "That is a good start."

"I also added a dashboard," Leo said. "Hit rate, miss rate, evictions, latency. All visible in one place."

"That is better than waiting for the page to get slow."

"Considerably better," Leo agreed.


---

**ElastiCache vs DAX: Which Cache for DynamoDB?**

"If we're caching DynamoDB data," Maya asked, "why not use DAX instead of ElastiCache? I saw it in the documentation."

Good question.

**DAX (DynamoDB Accelerator)** is a purpose-built in-memory cache for DynamoDB. It intercepts DynamoDB API calls at the client level — your application code talks to DAX using the same DynamoDB SDK. Cache misses are automatically fetched from DynamoDB. Cache hits return in microseconds. Invalidation is handled automatically when data changes.

**ElastiCache** is a general-purpose cache. You manage the cache keys, the TTL logic, the invalidation — all of it. More control, more responsibility.

When to use each:

| Scenario | Recommendation |
|---|---|
| You're caching DynamoDB reads and want zero application changes | DAX |
| You need microsecond latency on DynamoDB reads | DAX |
| You're caching from multiple sources (DynamoDB + RDS + external APIs) | ElastiCache |
| You need Redis data structures (sorted sets, pub/sub, HyperLogLog) | ElastiCache |
| You need fine-grained TTL control and custom invalidation logic | ElastiCache |
| You need session storage, rate limiting, or distributed locks | ElastiCache |

For Nimbus: they chose ElastiCache because they were caching data from multiple sources — DynamoDB for menus, RDS for order history summaries, external APIs for restaurant ratings. DAX only works with DynamoDB. And they needed Redis sorted sets for the trending rankings.

"If it were purely a DynamoDB caching problem," Priya said, "DAX would be the simpler answer. One service, automatic invalidation, same API. But we have more than one data source."

"So DAX is simpler when you're DynamoDB-only," Maya summarized. "ElastiCache when you need the full toolbox."

"That's the tradeoff."

### When Cache Data Cannot Be Lost: Amazon MemoryDB

"Why would anyone use Redis as a primary database?" Maya asked. "Isn't it a cache?"

That's exactly the right question.

ElastiCache for Redis is a cache — fast, in-memory, and by design, not the source of truth. If an ElastiCache node fails, the cache is empty on restart. Applications re-warm it from the database. That's fine for a cache.

But some use cases treat Redis not as a cache but as a primary data store — session state that must survive restarts, a real-time leaderboard that cannot be lost, a shopping cart that must persist across an AZ failure. For these use cases, ElastiCache's eventual durability is a risk.

**Amazon MemoryDB for Redis** is a fully managed, Redis-compatible, durable in-memory database. Unlike ElastiCache, MemoryDB uses a distributed transaction log stored across multiple AZs that makes every write durable before it's acknowledged. Data survives node failures — not because it replays from a slower database, but because it was never only in one place.

The key distinction:

| | ElastiCache for Redis | MemoryDB for Redis |
|---|---|---|
| Role | Cache layer | Primary database |
| Durability | Not guaranteed on failure | Multi-AZ transaction log |
| Latency | Microsecond reads and writes | Microsecond reads, single-digit millisecond writes |

Both support the same Redis commands and data structures. The API is the same. The durability guarantee is not.

For Nimbus: the team wants to store real-time per-restaurant order counts as a Redis sorted set — and it has to survive an AZ failure without reseeding from the database. That requirement — Redis-compatible *and* durable — is the exact signal for MemoryDB.

"So we don't have to re-warm it after a failure?" Leo asked.

"That's the point," Priya said. "If the node fails and comes back, the data is there. The transaction log kept it."

Leo stared at the pricing page for a moment. "It costs more than ElastiCache."

"Everything worth trusting does," Priya said.

## Strengths and Limitations

**Why caching is powerful**:

- Dramatically reduces database load (fewer queries, lower costs)
- Sub-millisecond response times for cache hits
- Protects your database from traffic spikes
- Redis supports richer data structures than a simple key-value store
- Cache stampede mitigation (TTL jitter, coalescing) protects against cold-start surges

**Where caching gets complicated**:

- Cache invalidation is genuinely hard — stale data causes bugs
- Adds operational complexity (another service to monitor, another failure point)
- Cold start problem: when you deploy fresh, the cache is empty — database takes the full load
- Cache stampede: if many entries expire at once, all requests hit the database simultaneously
- ElastiCache nodes are not free — you pay for them even when idle

**ElastiCache vs DynamoDB DAX**:

If you're caching DynamoDB data specifically, AWS offers **DAX (DynamoDB Accelerator)** — a purpose-built in-memory cache for DynamoDB. DAX is transparent to your application code (same API), reduces DynamoDB read latency to microseconds, and handles cache invalidation automatically.

Use DAX when your bottleneck is DynamoDB reads and you want zero-change caching. Use ElastiCache when you need a general-purpose cache for any data source, or when you need Redis data structures.

## Summary

Forty-seven database calls became one cache lookup. The page went from 188 milliseconds to 12. Adding a caching layer is one of the highest-leverage changes a growing application can make — but only when the cache is designed thoughtfully, with clear answers to the question "when does this data change?"

- A cache is a fast store of recently retrieved data — you ask once, remember the answer. ElastiCache is AWS's managed caching service, supporting **Redis** (persistence, complex data structures, pub/sub) and **Memcached** (pure key-value, horizontal scaling).
- The **cache-aside pattern** (lazy loading): check cache first, fall back to database on miss. **TTL** controls how long data stays cached — short TTL means fresher data and more misses; long TTL means faster responses and potential staleness.
- Cache the right thing: per-entity data shared across many users, not per-user data unique to each session. Cache stampede occurs when many entries expire simultaneously — mitigate with TTL jitter.
- **DAX** is the right choice for DynamoDB-only caching. **ElastiCache** is more flexible for multi-source caching and Redis data structures.
- The hardest part of caching is invalidation: knowing when data changes and updating the cache across all code paths that write it. A cache is only as trustworthy as its invalidation strategy.

## Exam Tips

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- **Redis vs Memcached on the exam**: Redis = persistence, replication, complex structures, pub/sub. Memcached = simple key-value, pure horizontal scaling. When the scenario mentions "you cannot lose cached data," the answer is Redis (it persists to disk).
- **ElastiCache use case signals**: "database is a bottleneck," "read-heavy workload," "reduce latency," "session store" — all point to ElastiCache.
- **DAX signal**: "reduce DynamoDB read latency" or "DynamoDB reads are too slow" → DAX, not ElastiCache.
- **Session management**: ElastiCache Redis is the canonical answer for storing user session data. Stateless application + Redis session store = horizontal scaling with consistent sessions.
- **Write-through vs cache-aside**: Cache-aside (lazy loading) is the most common. Write-through updates the cache on every write — never stale, but more write operations. Exam may distinguish them.
- **Cache eviction policies**: LRU (least recently used) is the most common exam answer for general web workloads.
- **ElastiCache vs. MemoryDB:** ElastiCache = cache layer, fast, data loss acceptable on failure. MemoryDB = durable in-memory primary database, Redis-compatible, multi-AZ transaction log. Exam trigger: "Redis-compatible AND durable" or "primary data store in Redis" → MemoryDB, not ElastiCache.

## Exercises

**Exercise 1 — Recall**

In your own words: what is cache invalidation, and why is it difficult?

*(Hint: Think about all the places in Nimbus where menu data could be updated — the restaurant partner portal, an admin tool, a cron job. Each of those paths needs to know about the cache.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A video streaming platform serves millions of users. The catalog of available movies changes infrequently (updated nightly). The application is experiencing high database CPU usage because every user request queries the catalog. The team wants to reduce database load while keeping catalog data accurate within one hour of updates.

Which solution BEST meets these requirements?

A) Add read replicas to the RDS database to distribute the load  
B) Migrate the catalog to DynamoDB with on-demand capacity  
C) Use ElastiCache for Redis with a 1-hour TTL for catalog data  
D) Increase the RDS instance size to handle more concurrent queries

**Hint 1**: The data is read-heavy and changes infrequently. What pattern is ideal for this?

**Hint 2**: "Accurate within one hour" translates directly to a specific cache configuration parameter.

**Hint 3**: The goal is to reduce database load, not just handle more of it.

**Answer**: C

**Explanation**: ElastiCache with a one-hour TTL caches catalog data after the first request per key. Subsequent requests return from the cache without touching the database. When the nightly update runs, entries expire within an hour and fresh data is loaded on the next request.

**Why not A?** Read replicas distribute read traffic across more database nodes but don't reduce the total number of queries. They're useful for scaling reads, not for reducing database load from frequently repeated queries.

**Why not B?** Migrating to DynamoDB doesn't solve the underlying problem — catalog data would still be fetched from the database (DynamoDB) on every user request.

**Why not D?** Scaling up the instance handles more concurrent queries but doesn't reduce the number of queries. The fundamental inefficiency remains.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus wants to add a "trending restaurants" feature: a ranked list of the top 10 restaurants by order volume in the last 24 hours, updated every 15 minutes.

How would you implement this with ElastiCache Redis? What Redis data structure would you use for the ranking? What would your cache TTL be, and when exactly would you update the cache?

Consider also: what happens if the ElastiCache node goes down? Does the feature break? How would you design around this failure?

*(There is no single correct answer. The goal is to practice cache design and failure thinking.)*

## Post-Credits Scene

"I already deployed it — oh." Leo had pushed the Redis integration to production before updating the connection pool settings. Under load, the application was opening too many Redis connections. He'd had to roll it back and deploy again with the right configuration.

Leo added Redis caching for the menu. Page load time dropped from 188 milliseconds to 12 milliseconds.

Forty-seven DynamoDB calls became one Redis lookup. The call was 0.8 milliseconds.

He announced this at the Monday standup.

"Good work," said Priya, without looking up from her laptop.

"Thank you," said Leo.

"When did you last rotate the Redis auth token?"

Leo looked at his notes. "I don't think I set one."

"So the cache is unauthenticated."

"It's inside the VPC."

"So is everything else that's compromised." She finally looked up. "If Leo's laptop gets infected and someone pivots into the VPC, your cache has no password."

Leo stared at her.

"I'll set the auth token," he said.

In the next chapter: the private network that separates what Nimbus owns from the rest of the internet.
