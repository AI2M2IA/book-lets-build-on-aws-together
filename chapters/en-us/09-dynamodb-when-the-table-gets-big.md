# Chapter 9: When the Table Gets Big

The kitchen at Nimbus's first restaurant partner smelled like garlic and warm bread even at ten in the morning. Maya had been there for a demo, watching a cook swipe through the app to log a substitution — fish instead of shrimp, temporarily out. The swipe happened. The menu updated. A customer in a different part of the city saw the change within seconds.

That had felt like magic.

Back at the office, the magic had started to slow down.

The menu table had 50,000 items.

That was across 287 restaurants — the partner count had exploded from the forty-seven of the load-balancer days to nearly three hundred in under a year — each with daily specials, seasonal items, and regional variations. Some items had modifiers — size, spice level, choice of protein. Some had combo deals that referenced other items. Some appeared on the menu on weekdays only, or only during lunch, or only in certain cities.

The SQL query that retrieved a restaurant's full menu used to return in 200 milliseconds.

Now it was taking four seconds.

Four seconds is the difference between someone placing an order and someone closing the app. Leo had run the query plan. Tom had looked at the index configuration. Priya had increased the read replica count. None of it had made a meaningful difference.

And that changed the mood in the room.

---

**The First Attempt: More Indexes**

Leo had the query plan open. He traced through it carefully.

"The problem is this join," he said. "When we pull a restaurant's menu, we join the menu_items table against the modifiers table, then against the combos table, then against the availability_windows table. Four tables, three joins, fifty thousand rows."

He added an index on `restaurantId` in every table. He ran the query again. Two seconds. Better, but not good enough.

Tom had read something about query hints. He spent an afternoon tweaking. One point three seconds. Still not good.

"What if we denormalize?" Leo asked. "Combine the modifiers into a JSON column right on the menu_items table. Fewer joins."

They tried it. One second flat. It felt like progress. Maya sent a message to the restaurant partners saying they'd fixed the speed issue. That was a Tuesday.

By Thursday the query was back to 2.8 seconds. Their data had grown. More restaurants had onboarded. More items per restaurant. The query that felt solved was not solved.

"The index approach is keeping up with today's data," Priya said. "But we're adding forty restaurants a week. By next quarter we'll have double the items. What does the query look like then?"

"Three seconds minimum," Leo said. "Probably five."

"So we've bought ourselves a few weeks."

"Yeah."

They sat with that. A fix that expires is not really a fix.

---

**The Second Attempt: Read Replicas**

Priya had already increased the read replica count once. She tried again — two read replicas now, and the application load-balanced between them. The theory was sound: spread the read traffic, each replica handles less work.

It helped a little. Peak load dropped from 2.8 seconds to 2.2 seconds.

"That's because the bottleneck isn't the number of reads," Tom said, looking at the database metrics. "It's the query itself. More replicas means more servers running the same slow query. The query is still slow."

"How much does that cost per month?" he added, because he always asked. "Two extra read replicas on a db.r5.large — that's about 350 dollars a month. For a two-second improvement."

Leo closed the replica panel.

"So more hardware doesn't fix a bad query," Maya said.

"When a problem survives indexing, caching attempts, and extra replicas," Leo said slowly, "maybe the problem isn't the configuration. Maybe it's the shape of the system."

That was the beginning of a longer conversation.

---

*Last week, the team had finally gotten RDS under control. Multi-AZ standby, automated backups, a read replica handling reporting queries. The DBA problem — the one that used to wake Leo up at night — was solved. The managed database layer was stable. But stable didn't mean fast, and fast was now the problem. The menu table had started hitting limits that more replicas couldn't fix. The shape of the data itself was wrong.*

---

**The Problem with Fitting Everything in a Table**

Here is the core tension of relational databases: they are designed to store *structured* data in *fixed* shapes.

If every menu item had the same fields — name, price, description, category — SQL would be perfect. You'd have a clean `menu_items` table, rows for each item, and queries that make sense.

But real menus don't work that way.

One item might have a "spice level" modifier. Another might have a "choice of protein." A third might have nested combos — "order the family meal and you get two mains, two sides, and a drink." The structure of the data varies *per item*.

In SQL, you have two options:

**Option 1**: Create a column for every possible modifier. This produces a very wide table where most columns are empty most of the time.

**Option 2**: Create a separate modifiers table and join it to the menu items table. This works, but complex menus require multiple joins, and at fifty thousand items with high read volume, those joins become expensive.

"There's a third option," said Priya, who had been reading documentation quietly in the corner.

She pulled up a new tab. "What if the data didn't have to fit in a table?"

**A Different Way to Think About Data**

Relational databases store data as rows in tables. Each row must conform to the table's schema. The schema is agreed upon in advance.

NoSQL databases store data differently. One common approach is the *document model*: each record is stored as a self-contained document (usually JSON), and documents in the same collection don't have to have the same fields.

A menu item in a document model might look like this:

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

Another item might look completely different:

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

Different shapes. Same collection. No problem.

"So the database is more like a filing system than a table," said Maya.

"Exactly," said Priya. "You can put any document in any drawer. You don't have to cut the document to fit a fixed size."

**Meet DynamoDB**

Amazon DynamoDB is AWS's managed NoSQL database service. It stores data as items (not rows), and items are collected into tables (the naming is similar to SQL, but the behavior is different).

Each item in a DynamoDB table must have a **primary key**, which uniquely identifies it. Everything else is flexible.

The primary key can be one of two forms:

**Partition key only**: A single attribute that must be unique across all items.

**Partition key + sort key (composite primary key)**: Two attributes that *together* form a unique combination. This lets you have multiple items with the same partition key, differentiated by their sort key.

For Nimbus's menu:

- Partition key: `restaurantId`
- Sort key: `itemId`

This means you can retrieve all items for a specific restaurant efficiently — DynamoDB knows exactly which partition to look in.

"Why is it called a partition key?" Tom asked.

"And what if someone tries to break in?" Priya asked. "If the partition key is guessable, could someone spam one partition with writes and cause the hot-spot condition intentionally?"

"Yes," said Leo. "That's actually a denial-of-service vector for poorly designed tables. Which is one more reason to choose high-cardinality keys."

Priya wrote that down.

**How DynamoDB Stores Data Internally**

DynamoDB is built to scale horizontally to enormous sizes. It achieves this through *partitioning* — data is split across many physical machines based on the partition key.

When you write an item, DynamoDB hashes the partition key value and uses that hash to determine which physical partition (and thus which server) stores the item. When you read an item, DynamoDB does the same calculation to find it instantly.

Think of it like a postal system. If every envelope has a zip code, the postal service doesn't read every envelope to figure out where it belongs — it sorts by zip code. DynamoDB sorts by partition key hash.

"Wait — but *why* would we do it that way?" Maya asked. "Why does the choice of partition key matter so much? Can't we just pick anything?"

This is the right question. The partition key is the single most important design decision in a DynamoDB schema. Here's why:

If you choose a partition key with low cardinality — say, `available: true/false`, or `category: "main/side/drink"` — most of your data lands on the same few partitions. DynamoDB calls this a "hot partition." One server handles the majority of traffic. It gets overloaded. DynamoDB starts throttling requests. Users start seeing errors.

- **Good**: High cardinality, evenly distributed values (`restaurantId` with many restaurants)
- **Bad**: Low cardinality (`true/false`, `category`) — most data lands on a few partitions, creating "hot spots"

"So if I used `available: true` as the partition key," Leo said slowly, "all available items would pile up on the same partition."

"And your database would melt on dinner rush," Priya confirmed.

Leo closed his laptop slowly.

---

**The Hot Partition Incident**

They wouldn't have to imagine it. Months later — during their second month on DynamoDB, before they'd really internalized the rule — they would learn it the hard way.

The team had launched a new feature: a "Featured Items" badge. Restaurant partners could mark up to five items as featured. The feature stored a `featured: true` attribute on each item.

Leo thought it would be useful to query all featured items across all restaurants — for a "trending items" widget on the homepage. He'd created a secondary index to support this query. The index used `featured` as its partition key.

"It'll be fine," he'd said. "How many featured items can there be?"

About twelve hundred, spread across two hundred and forty restaurants.

But the "trending items" widget loaded on every page. Every page load triggered a query against the `featured` index. All twelve hundred items lived on two partitions — `true` and `false`. The `true` partition took every hit.

Friday evening dinner rush. Eight thousand concurrent users. All loading the homepage.

The DynamoDB error rate spiked to eighteen percent. Some users got an empty trending widget. Some got loading spinners. Some got errors that bubbled up into the ordering flow.

Leo pulled the metrics. "The index partition is getting throttled," he said. "We're hitting the throughput limit on a single partition."

"How?" Priya asked.

"The `featured` key only has two values. All twelve hundred featured items live on the same partition. Every homepage load hits that partition."

They disabled the trending widget within three minutes. Error rate dropped to zero.

"So a two-value partition key throttled us on a Friday night," Tom said.

"Yes," said Leo.

"How much did that cost us?"

"About forty minutes of degraded experience across eight thousand users," Priya said. "Revenue impact, probably a few hundred orders."

Leo replaced the index with a different design: a dedicated DynamoDB table called `featured_items` with `restaurantId` as the partition key and a scheduled Lambda — a small piece of code AWS runs for you (Chapter 20) — that updated it every fifteen minutes from the main table. The query became a scan over a small, isolated table rather than a hot partition on the main one.

"Design your access patterns first," Priya said. "Then choose your data model."

"I know," Leo said. "I know now."

---

**Reading and Writing at Scale**

DynamoDB can handle millions of requests per second. But it needs to know how much capacity to provision.

There are two capacity modes:

**Provisioned capacity**: You specify how many read and write units you want. DynamoDB reserves that capacity for you and throttles traffic that exceeds it. Predictable cost, lower price per request.

The units have precise definitions, and the exam expects you to know them: one **Read Capacity Unit (RCU)** is one strongly consistent read per second of an item up to 4 KB — or two eventually consistent reads of the same size. One **Write Capacity Unit (WCU)** is one write per second of an item up to 1 KB. Larger items consume proportionally more: reading a 12 KB item strongly consistently costs 3 RCUs; writing a 3 KB item costs 3 WCUs.

**On-demand capacity**: DynamoDB automatically scales with your actual traffic. No routine capacity planning required. Higher cost per request, and much simpler operationally, though sudden spikes far beyond a table's recent traffic pattern can still cause throttling if they ramp too fast.

For Nimbus, the menu is read far more often than it's written. A customer opens the app, browses the menu — that's many reads. A restaurant partner updates their menu twice a week — that's occasional writes.

"On-demand makes sense for now," said Tom. "We don't know our traffic patterns yet. Better to pay more per request than to under-provision and get throttled."

Reluctant infrastructure wisdom. From Tom. The team had officially grown.

"How much does that cost per month?" Tom asked, pulling up the pricing calculator.

"At our current read volume — about forty thousand reads per day — on-demand is around twelve dollars a month," Leo said. "Provisioned, if we tune it right, is closer to four. But we'd have to set the capacity manually and risk throttling if we guess wrong."

Tom wrote both numbers down. He always wrote numbers down.

**Consistency: How Fresh Is Your Data?**

DynamoDB replicates data across multiple Availability Zones automatically. That is great for durability, but it also means you need to think clearly about read consistency.

When you read from DynamoDB, you have a choice:

**Eventually consistent read**: This is the default. It is cheaper, and the result might briefly lag behind a recently completed write.

**Strongly consistent read**: For reads against a table or local secondary index, DynamoDB can return the latest committed value from successful prior writes. This costs more read capacity and is not available for global secondary indexes.

For menu data, eventual consistency is fine. A menu item that's a millisecond stale doesn't matter.

For order confirmation data — "has this order been placed?" — you'd want strong consistency. The customer shouldn't see a "try again" message when their order was just saved.

"It's like the difference between checking your bank balance on the app versus calling the bank directly," said Maya. "The app might be thirty seconds behind. The phone call is always current."

You might be wondering: if DynamoDB replicates across multiple AZs automatically, why does the consistency mode matter at all? Here's the answer: replication takes a small but nonzero amount of time — milliseconds, usually. An eventually consistent read might be served from a replica that hasn't yet received the latest write. A strongly consistent read always contacts the primary copy of the data. For most use cases (menu items, product catalogs, user profiles) the lag is imperceptible. For use cases where correctness matters the moment of the read (payment confirmation, inventory availability), you want strong consistency.

**Secondary Indexes: Querying Beyond the Primary Key**

What if you need to access data in a different way than the primary key allows?

DynamoDB supports **secondary indexes** — alternate keys that let you query the same data using different attributes.

**Local Secondary Index (LSI)**: Uses the same partition key as the table, but a different sort key. Must be defined at table creation time and cannot be added later. Shares the table's provisioned capacity. Because LSIs share the partition, they support strongly consistent reads.

**Global Secondary Index (GSI)**: A completely separate index with its own partition key and sort key — different from the table's primary key. Can be added or removed after the table exists, which gives you flexibility. Has its own provisioned capacity settings, separate from the table.

For Nimbus: if they needed to query items by price range, a GSI could support that — but with one rule in mind: a partition key only accepts *equality* comparisons, so `price` (which you want to range over) must be the **sort key**, with a grouping attribute such as category or `cuisineType#region` as the GSI partition key. That's exactly the index built in the walkthrough below.

If you choose a LSI, then you get strong consistency and shared capacity, but you're locked into that design at table creation; if you choose a GSI, then you get flexibility to add it later and independent scaling, but you lose the ability to do strongly consistent reads against the index.

---

**A GSI Query Walkthrough**

Priya walked through a concrete example. Nimbus wanted to support a "browse by cuisine" feature: show all available dishes of a particular cuisine type across all partner restaurants.

The main table has `restaurantId` as the partition key and `itemId` as the sort key. You can't query "all items with cuisineType = Colombian" efficiently — that would require a scan across every partition.

They created a GSI:

- GSI partition key: `cuisineType#region` (e.g., "Colombian#NYC", "Mexican#Chicago")
- GSI sort key: `price`

The GSI duplicates a projection of each item — just the fields needed for the browse page — into the index storage. Now a query against the GSI with `cuisineType#region = "Colombian#NYC"` goes directly to that partition of the index.

"Why not just use `cuisineType` alone?" Leo asked.

"Because cuisineType alone has low cardinality," Priya said. "Colombian, Mexican, Thai — twenty values total. Hot partitions again. Appending the region gives us Colombian#NYC, Colombian#Chicago, Colombian#LA. More partitions, better distribution."

"That feels a bit hacky."

"It's a standard DynamoDB pattern. It's called partition key sharding. Sometimes you have to work with the tool."

The GSI query in code looked like this:

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

That returned all Colombian dishes in New York City priced between $10 and $25, sorted by price, in about 4 milliseconds.

"That's faster than the old SQL query by a factor of one thousand," Leo said.

"Because it's only touching one partition of one index," Priya confirmed. "Not scanning every row in a joined table."

---

**DynamoDB Streams: Reacting to Changes**

"Have we thought about what happens when a menu item gets updated?" Priya asked one morning. "A restaurant partner changes a price. We need to update the search index. We need to invalidate the ElastiCache entry" — the caching service we'll meet in the next chapter — "and we need to log the change for our analytics pipeline."

"We could do all of that in the API handler," Leo said. "When the write happens, trigger all the downstream updates."

"And if one of them fails?"

"Then... we retry."

"What if the EC2 instance crashes after the write but before the downstream updates? The data is saved, but nothing knows about the change."

Leo thought about it.

"We need the update to be guaranteed," he said. "Even if our application code fails partway through."

This is what **DynamoDB Streams** solves.

DynamoDB Streams captures a time-ordered log of every item modification in a DynamoDB table. Every insert, update, and delete is written to the stream as an event. The stream retains events for 24 hours.

You can attach a Lambda function to the stream. Every time an item changes, the Lambda function is invoked with the before-and-after state of the item. The Lambda can then:

- Update a search index (OpenSearch)
- Invalidate a cache entry in ElastiCache
- Send a notification to another system
- Feed an analytics pipeline
- Replicate the change to another table or database

The critical difference: Streams decouple the write from the downstream effects. The DynamoDB write succeeds independently of whether the Lambda succeeds. If the Lambda fails, DynamoDB retries it. If the application crashes after the write, the stream event is still there — the Lambda will process it when things recover.

"So we write to DynamoDB," Leo said slowly, "and DynamoDB guarantees the downstream processing happens eventually, even if we crash."

"Exactly," said Priya. "It's the difference between hoping all your side effects run and having the database guarantee them."

For Nimbus, they wired DynamoDB Streams on the menu table to a Lambda that invalidated ElastiCache entries when menu items changed. The cache stayed consistent with the database, automatically, without any application code managing the invalidation.

"How much does Streams cost?" Tom asked.

"You pay for reading from the stream — each Lambda invocation reads from it. At our volume, probably two to three dollars a month."

Tom approved it without further questions. He'd learned when two dollars a month was worth it.

**The Trade-Off: What DynamoDB Can't Do**

NoSQL is not strictly better than SQL. It's a different tool for a different job.

What DynamoDB gives up:

**Flexible queries**: In SQL, you can filter and sort by any column. In DynamoDB, you can only query efficiently by primary key. Querying by arbitrary fields requires a *scan* (reading every item in the table), which is expensive and slow at scale.

**Joins**: DynamoDB doesn't do joins. If you need data from two tables, you do two separate reads in your application code.

**Transactions**: DynamoDB supports transactions, but relational databases are still the more natural fit for many multi-entity workflows, reporting-heavy systems, and join-heavy designs.

**Familiarity**: Decades of SQL tooling, skills, and mental models don't transfer directly.

What DynamoDB excels at:

- Key-value and document access patterns
- Massive scale (single-digit millisecond latency at any size)
- Serverless, no infrastructure management
- Automatic scaling, multi-AZ replication, backups
- Predictable performance regardless of data volume

"So the rule is," said Maya, "use DynamoDB when you know *exactly* how you'll access the data. Use SQL when you don't yet know."

Priya nodded. "Design your access patterns first. Then choose your database."

This is one of the most senior things a database conversation can produce.

---

**When DynamoDB Is the Wrong Choice**

Tom, who had taken on the financial reporting module, had a question.

"We're building out the financial reporting," he said. "Monthly revenue summaries per restaurant, tax calculations, invoice history. Can we put that in DynamoDB too?"

The team looked at each other.

"Wait — but *why* would we do it that way?" Maya asked, before Priya could.

Priya smiled. Maya was picking up the habit.

"Walk us through the queries," Priya said to Tom.

He pulled up the spec. "We need: total revenue per restaurant, grouped by week. Top-performing items by order count, across all restaurants. Revenue broken down by cuisine type. Average order value by city. Year-over-year comparison for partner reporting."

Leo read the list. "Every one of those is an aggregation. Sum, group, average, compare."

"DynamoDB has no aggregation functions," Priya said. "No GROUP BY. No SUM. No AVG. To answer 'total revenue per restaurant this week,' you'd have to scan every order for the week, pull it all into application memory, and compute it yourself."

"That sounds bad," Tom said.

"At our scale, that's tens of thousands of records pulled into memory for every report request. It would be slow and expensive. And every time we added a new report requirement, we'd be writing new scan-and-compute code."

"So what do we use?"

"For financial reporting? RDS. PostgreSQL with proper indexes. The queries you described are exactly what SQL was designed for. They'd be ten lines of SQL. They'd be two hundred lines of DynamoDB scan code."

DynamoDB is wrong when:

- You don't know your access patterns in advance (reporting is inherently exploratory)
- You need aggregations (SUM, GROUP BY, COUNT) across large datasets
- Your data has complex relationships and you need joins
- You need ad-hoc query flexibility — to ask questions you haven't thought of yet
- Your data has a fundamentally relational structure that doesn't map to key-value naturally

"So the choice isn't 'new technology is better,'" Maya said.

"The choice is 'what shape is your data, and how will you access it,'" Priya confirmed. "DynamoDB is genuinely better for the menu. It would be genuinely worse for the financial reports. Both statements are true at the same time."

Tom built the financial reporting on PostgreSQL. The first GROUP BY query he wrote returned in 80 milliseconds. He didn't have to write a single line of scan code.

---

**When to Use Each**

| Situation                                             | Reach For               |
|-------------------------------------------------------|-------------------------|
| Structured data, complex queries, reporting           | RDS (PostgreSQL, MySQL) |
| Flexible data shapes, key-based access, massive scale | DynamoDB                |
| Write-heavy with complex relationships                | RDS                     |
| Read-heavy with predictable access patterns           | DynamoDB                |
| You need joins and aggregates                         | RDS                     |
| You need millisecond latency at millions of req/sec   | DynamoDB                |
| Transactions across multiple entities                 | RDS (usually)           |
| Serverless / unpredictable traffic spikes             | DynamoDB on-demand      |
| Financial reporting, ad-hoc analytics                 | RDS or a data warehouse |
| Event sourcing, change capture, real-time processing  | DynamoDB + Streams      |

The wrong answer is always "always use one or the other." Nimbus ended up using both: RDS for order history and financial records (structured, relational, needs reporting), DynamoDB for the menu (flexible schema, high read volume, access by restaurant ID).

## The Right Database for the Right Workload

Jump ahead six months — well after the DynamoDB migration had settled in — and Nimbus had three new projects on the board. Maya walked the team through them one Tuesday morning.

"First: a recommendation engine. We want to show customers dishes they're likely to order based on their history and what people with similar tastes ordered. Second: we're moving the menu data to support richer content — full menu documents in JSON, different structure per restaurant, flexible schema. Third: we're about to close the Barato acquisition, and their data team runs a Cassandra cluster for customer behavior data. They want to bring it to AWS without rewriting their pipelines."

Three projects. Three very different data requirements. None of them were obvious DynamoDB fits.

"These all need different databases," Priya said.

"We have DynamoDB," Leo said.

"We have the right to choose the right tool," Priya said.

**Amazon DocumentDB: When Your Workload Speaks MongoDB**

The second project — rich JSON menu documents with flexible, per-restaurant schemas — described a document database. Nimbus was already using DynamoDB's flexible schema for the menu, but as the team built more sophisticated menu features (nested modifiers, time-based pricing, complex combo structures), the DynamoDB query model was showing its limits. The team wanted richer document queries: find all menu items where a nested modifier contains a specific option, filter by arbitrary fields inside the JSON structure.

"That's a document database pattern," Priya said. "MongoDB."

"We could run MongoDB on EC2," Leo offered.

"Or we could use DocumentDB," Priya said.

**Amazon DocumentDB** is a MongoDB-compatible managed document database. It stores data as JSON-like documents with flexible schemas — different documents in the same collection can have different fields. DocumentDB supports MongoDB's query language, APIs, and drivers. If your workload currently runs on MongoDB, DocumentDB speaks the same language. The migration path is moving a connection string, not rewriting an application.

DocumentDB is fully managed: no patching, automated backups, Multi-AZ high availability, read replicas, and storage that automatically grows as your data grows.

"So we migrate the menu to DocumentDB," Leo said. "And the queries we already have in MongoDB syntax just work?"

"With minor compatibility testing, yes," Priya confirmed. "DocumentDB supports most of MongoDB's query API. Check the compatibility matrix before assuming full coverage, but for document queries and aggregations, it's straightforward."

The exam signal for DocumentDB is simple: **"MongoDB-compatible"** or **"document store."** If a scenario mentions MongoDB or document-oriented data, DocumentDB is the managed AWS answer.

**Amazon Neptune: When the Relationships Are the Data**

The recommendation engine was a harder problem.

The question wasn't "what did this customer order?" — that was a simple DynamoDB lookup. The question was: "which customers have similar taste profiles to this customer, and what dishes have those customers liked that this customer hasn't tried yet?"

That's a graph problem. The data model isn't a table of rows or a collection of documents. It's a network of relationships: customers connected to dishes (ordered, rated, viewed), dishes connected to restaurants and cuisine types, restaurants connected to neighborhoods and cities. The recommendation isn't in the data points — it's in the paths between them.

"We need a graph database," Priya said.

**Amazon Neptune** is a fully managed graph database. It supports two graph models: **property graph** (queried with the Gremlin traversal language) and **RDF** (queried with SPARQL). You choose based on your existing graph stack or team preference; both run on the same Neptune infrastructure.

Graph databases are purpose-built for workloads where the relationships between data points are as important as the data itself: social networks (who is connected to whom), recommendation engines (what have similar users liked), fraud detection (which transactions share suspicious patterns across accounts), and knowledge graphs (how are concepts related).

For Nimbus's recommendation engine: customers and dishes became nodes in Neptune. Order events became edges. A Gremlin traversal could find, in a single query, all dishes that customers with similar order histories had rated highly, sorted by the strength of the connection — without the complex JOIN chains that would be required in a relational database or the multiple round-trip queries that would be needed in DynamoDB.

The exam signal for Neptune: **"social network," "recommendation engine," "knowledge graph," "fraud detection,"** or **"graph traversal."** If a scenario describes data where the connections matter as much as the data itself, Neptune is the answer.

**Amazon Keyspaces: Cassandra Without the Operations**

The Barato acquisition brought a Cassandra cluster into the picture. Cassandra is a wide-column NoSQL database — designed for very high write throughput and horizontal scalability, commonly used for time-series data, user activity logs, and IoT telemetry. The Barato data team used it to track customer behavior: which items were viewed, which were added to cart, which were abandoned.

Migrating Cassandra to AWS had two options: run it on EC2 (operational overhead of managing the cluster, upgrades, scaling) or use the managed option.

"Amazon Keyspaces," Priya said.

**Amazon Keyspaces** is a serverless, Cassandra-compatible managed database. It supports the Cassandra Query Language (CQL) — the same query language Barato's pipelines were already using. Like DocumentDB for MongoDB, Keyspaces is the managed path: keep the application code as-is, point it at a Keyspaces endpoint instead of the self-managed cluster, and let AWS handle the infrastructure.

Keyspaces scales automatically with traffic, requires no capacity planning, and is serverless — you pay for the reads and writes you actually perform. For the Barato behavior tracking data, this was the right model: extremely variable volume (dinner rush vs 3 AM), wide-column schema, high write throughput.

The exam signal: **"Cassandra-compatible," "wide-column," "CQL,"** or **"Cassandra workload."**

**Choosing the Right Database: A Reference Table**

By this point in the story, Nimbus's database landscape looked nothing like it had in chapter seven. The right tool for each workload:

| Trigger Phrase | Database |
|---|---|
| "MongoDB-compatible" or "document store" | DocumentDB |
| "Graph relationships," "social network," "recommendation engine" | Neptune |
| "Cassandra-compatible" or "wide-column" | Keyspaces |
| "Key-value at any scale," "single-digit millisecond latency" | DynamoDB |
| "Relational + serverless," "auto-scaling SQL" | Aurora Serverless |
| "Structured data, complex queries, reporting" | RDS (PostgreSQL, MySQL) |

"Is this going to keep growing?" Leo asked, looking at the list.

"Yes," Maya said. "Because different problems have different shapes. And using the wrong shape costs you either performance, developer time, or both."

"The right question isn't 'what database should we use,'" Priya added. "It's 'what shape is our data, and how will we access it?' The database follows from the answer."

That was the most important thing she'd said about databases in two years.

## Strengths and Limitations

**Why DynamoDB is powerful**:

- Single-digit millisecond latency at any scale
- Fully managed — no patching, no replication setup, no maintenance windows
- Automatic multi-AZ replication (durability built in)
- On-demand scaling means zero capacity planning
- Native integration with Lambda, API Gateway, Streams
- Point-in-time recovery (similar to RDS automated backups)
- DynamoDB Streams — capture every change as an event (useful for real-time processing)

**Where DynamoDB gets complicated**:

- Access pattern design is non-negotiable — mistakes are costly to unwind
- Complex queries require secondary indexes (adds cost and complexity)
- Scans are expensive — avoid them in production
- The "item size limit" is 400KB — large items need different storage
- Pricing can surprise you if you don't understand read/write unit costs
- Hot partitions are silent killers — no errors until throttling begins

## Summary

The schema redesign had taken two days and a lot of whiteboard space. Choosing a NoSQL database is not just a technical decision — it changes how you think about the data entirely. But the result was a menu table that could grow to any size without slowing down. Equally important: the team learned where DynamoDB's edges are, and which specialized databases to reach for when the problem changes shape.

- DynamoDB is AWS's managed NoSQL database service. Items are flexible documents — no fixed schema. Every item must have a **primary key**: a partition key alone, or a partition key + sort key. Choose the partition key for even distribution — hot partitions cause throttling.
- **On-demand** capacity auto-scales; **provisioned** capacity is cheaper for predictable traffic. **Eventually consistent** reads are cheaper; **strongly consistent** reads always current but unavailable on GSIs.
- **DynamoDB Streams** capture item-level changes in real time — use them to drive cache invalidation, search index updates, and analytics pipelines.
- DynamoDB is the wrong choice for reporting, complex joins, and ad-hoc queries — use RDS for those.
- **DocumentDB** (MongoDB-compatible), **Neptune** (graph database), and **Keyspaces** (Cassandra-compatible) are AWS managed alternatives for workloads that don't fit DynamoDB's key-value model.

## Exam Tips

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- Know the partition key rules: **high cardinality, even distribution**. Hot partitions are a common exam trap.
- **On-demand vs provisioned**: on-demand for unpredictable traffic; provisioned (with Auto Scaling) for predictable workloads.
- **DynamoDB Streams**: captures item-level changes in real time. Common exam scenario: "trigger a Lambda function when a record changes."
- **Global Tables**: multi-Region, multi-active replication for globally distributed applications and disaster recovery scenarios. On the exam, this is a strong signal when the workload needs local reads and writes in more than one Region.
- **DynamoDB TTL (Time to Live)**: set an expiration timestamp attribute on items and DynamoDB deletes them automatically after expiry — at **no cost**, consuming no write capacity. Exam trigger: "session data/temporary items must be removed automatically after N hours at the lowest cost" → TTL, never a scheduled Lambda scan. Expired items can also flow to DynamoDB Streams for archival.
- **DAX (DynamoDB Accelerator)**: in-memory caching layer for DynamoDB. Reduces read latency from milliseconds to microseconds. Exam uses this when RDS read replicas won't help (because it's a DynamoDB-specific cache).
- **Composite primary key**: partition key + sort key allows flexible queries within a partition. Example: retrieve all orders for a customer between two dates — `customerId` is partition key, `orderDate` is sort key.
- **GSI vs LSI**: GSI can be added after table creation; LSI cannot. LSI supports strongly consistent reads; GSI does not. LSI shares table capacity; GSI has its own.
- Know when NOT to use DynamoDB: complex joins, ad-hoc reporting, multi-entity transactions → RDS is usually the answer.
- **Purpose-built database selection** — the exam frequently presents a scenario and asks which database fits. Use this as your quick reference: "MongoDB-compatible" → DocumentDB. "Graph/social network/recommendation engine/knowledge graph" → Neptune. "Cassandra-compatible/wide-column" → Keyspaces. "Key-value at any scale/millisecond latency" → DynamoDB. "Relational/complex queries/reporting" → RDS or Aurora.

## Exercises

**Exercise 1 — Recall**

Explain the difference between a partition key and a sort key. When would you use both?

*(Hint: Think about the Nimbus menu — why does having restaurantId as partition key and itemId as sort key make retrieving a restaurant's full menu efficient?)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A global gaming company stores player profiles in DynamoDB. Each profile includes fields like username, level, achievements, and inventory. Some players have 10 inventory items; others have a few hundred — profiles vary in shape but each stays comfortably under DynamoDB's 400KB item size limit. The company needs single-digit millisecond read latency for profile lookups during active gameplay.

Which design approach BEST supports this requirement?

A) Use DynamoDB with `playerId` as the partition key and store the entire profile as a single item  
B) Migrate to RDS Aurora with read replicas in each region  
C) Use DynamoDB with `level` as the partition key to group players of similar skill  
D) Use ElastiCache in front of RDS to achieve sub-millisecond latency

**Hint 1**: The access pattern is "look up a specific player by ID." Which key makes that efficient?

**Hint 2**: One option creates a terrible hot partition. Which attribute has very low cardinality?

**Hint 3**: DynamoDB already delivers single-digit millisecond latency natively.

**Answer**: A

**Explanation**: Using `playerId` as the partition key distributes data evenly across partitions and enables instant lookups by player ID — exactly the access pattern described. DynamoDB's flexible document model handles varying inventory sizes without schema changes.

**Why not B?** RDS Aurora with read replicas adds complexity and still is not the natural first choice for this kind of key-based profile lookup at gaming scale.

**Why not C?** Using `level` as the partition key creates severe hot partitions — most traffic goes to level 1 (new players) or max level (active veterans), leaving other partitions idle.

**Why not D?** The question describes DynamoDB, not RDS. Adding ElastiCache in front of RDS introduces two new services when DynamoDB alone solves the problem.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is adding a "favorites" feature: customers can save their favorite menu items and reorder them with one tap.

Design the DynamoDB table for this feature. What would the partition key be? Would you use a sort key? What would the item structure look like?

Then consider: what happens if you need to show "top 100 most-favorited items across all customers"? Can DynamoDB answer that efficiently? If not, what would you add to the architecture?

*(There is no single correct answer. The goal is to practice designing for access patterns.)*

## Post-Credits Scene

"I already deployed it — oh." Leo had run the menu migration to DynamoDB on Thursday night without telling anyone. It worked. The reads were fast. The schema was flexible. The restaurant partners could add any modifier fields they wanted. But he'd forgotten to update the monitoring dashboards, and Priya had spent twenty minutes Friday morning wondering why the database metrics had gone flat.

He was feeling good about himself anyway.

Then Priya, dashboards restored, looked at the metrics.

"Leo," she said, "every page load is making forty-seven DynamoDB requests."

"One per restaurant shown," Leo confirmed. "The browse page loads the forty-seven nearest restaurants for the customer's location."

"And each of those requests takes about four milliseconds."

Leo did the math. Forty-seven times four. "That's... one hundred and eighty-eight milliseconds just for the menu. Before rendering."

"On every page load."

"For every customer."

He stared at the screen.

"We need a cache," he said.

In the next chapter: the layer between Nimbus's application and its database that makes slow queries fast.
