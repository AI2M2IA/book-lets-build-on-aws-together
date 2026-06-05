# Chapter 24: The Database That Grows With You

Imagine a library that started with two shelves and one librarian. That was enough, for a while. The librarian knew where everything was. Requests were answered quickly. Then the library grew: ten shelves, twenty, forty. The same librarian, the same desk, the same card catalog. Now finding anything requires waiting. The librarian isn't slow — there's just more library than one person can service at the original pace.

The solution isn't a faster librarian. It's a different kind of library.

---

After the S3 cost reduction, Tom continued his review. The database tier was a different kind of problem — not idle data in the wrong storage class, but a system actively struggling under the load of six months of traffic growth.

---

The numbers were not comfortable.

Nimbus was running RDS PostgreSQL: Multi-AZ, db.r6g.large instance. $340/month.

Leo pulled up the CloudWatch metrics dashboard. The numbers had a pattern.

**DatabaseConnections**: 198 out of a maximum of 200 during Friday peak. Two connections from saturation. At 200, new connection attempts would fail with "too many connections" — an error that would surface as HTTP 500s to customers ordering dinner.

**CPUUtilization**: 89% peak during Friday dinner rush. The instance was designed to handle spikes — a db.r6g.large has 2 vCPUs and 16 GB of memory — but sustained 89% CPU meant the database was at capacity before the peak hour even arrived.

**ReadLatency**: 840 milliseconds P95. Six months ago, it had been 180ms. The degradation had been gradual — 10 to 20ms per week — invisible until it was catastrophic. The week before Tom's review, the P99 latency had crossed one full second. Customers clicking on a restaurant menu were waiting over a second for the page to load.

**FreeStorageSpace**: 18% of provisioned storage remaining. At current growth rates, the database would run out of provisioned storage in approximately 11 weeks.

"Each one of these is solvable in isolation," Leo said, looking at the dashboard. "But we have all four at once."

The connection count spike pointed to connection pooling problems in the application — too many ECS tasks opening their own database connections. The CPU issue pointed to expensive queries. The latency issue and the CPU issue were almost certainly the same problem: a slow query running too often.

"Wait — but *why* are we at 198 connections?" Maya asked. "We have three ECS tasks. How do we have nearly 200 database connections?"

Each ECS task used SQLAlchemy with a default pool size of 5 connections plus an overflow of 10. Three tasks × 15 potential connections = 45 connections from the application. The other 153 were from the analytics Lambda functions, background job workers, the Glue ETL job, the development team's local connections through the bastion host, and several connections that had been opened but not properly closed by an older version of the code.

"The connection count problem," Leo said, "is actually an application problem that looks like a database problem." He added PgBouncer (a connection pooler) to the task list — but the immediate bottleneck was the slow query.

The database CPU was spiking to 89% during Friday dinner rush. Read queries were queuing. The P95 query latency had doubled over six months.

"The database is the bottleneck," he said. "Traffic has grown. The database hasn't scaled with it."

"Can we just make the instance bigger?" Maya asked. "Wait — but *why* do we have a single database handling all reads and writes? Why didn't we distribute this from the start?"

"Yes," Leo said. "That's vertical scaling. We move from r6g.large to r6g.xlarge. More CPU, more memory. It'll cost more and buy us time."

"But it doesn't fix the underlying problem," Priya said. "Eventually we'll hit the biggest instance and need a different approach. And have we thought about what happens if a write goes to a read replica by accident? The replica rejects it and the order silently fails."

"There are two approaches," Leo said. "Read replicas, or Aurora."

"What's the difference?"

"Think of it like a library," Leo said, grabbing a marker. "One librarian who both checks books in and answers patron questions. When the library gets popular, a queue forms. The fix: hire more librarians — but only for answering questions. Check-in still goes through the original desk."

"That's a read replica," Priya said.

"Exactly. Aurora goes a step further — it redesigns the shelving system itself so every librarian shares the same shelves and always sees the same books, with no delay. No waiting for updates to trickle from one desk to another."

**Read Replicas: Distributing Read Traffic**

Most web applications read data far more often than they write it. A customer browsing the menu makes dozens of SELECT queries. Placing an order makes a few INSERT/UPDATE queries. The ratio is typically 10:1 or higher.

A **read replica** is an additional RDS instance that receives a copy of all writes from the primary and makes those writes available for SELECT queries.

How it works:

1. Application writes (INSERT, UPDATE, DELETE) go to the primary database
2. The primary replicates those changes asynchronously to read replicas
3. Application reads (SELECT) are distributed across read replicas
4. Read replicas share the load — each handles a fraction of the total read traffic

The result: the primary database handles only writes (and optionally some reads). Read replicas handle the read load. For a 10:1 read/write ratio, adding one read replica roughly halves the primary's total load.

**Important limitation**: Replication is **asynchronous**. There's replication lag — typically milliseconds, but can be seconds under load. A read from a replica might see data that's slightly behind the primary. For most reads (browsing the menu, viewing order history), this is acceptable. For "did my order just go through?" — read from the primary.

**Read Replicas: The Details**

- You can have up to 15 read replicas per primary RDS instance (MySQL, PostgreSQL, MariaDB)
- Read replicas can be in the same region or a different region (cross-region replicas)
- Read replicas can themselves have read replicas (chaining)
- Read replicas are separate endpoints — your application must direct reads to the replica endpoint
- Read replicas can be promoted to standalone databases (useful for DR)

For Nimbus, Leo added one read replica. "It'll be fine," he said when Priya asked whether he'd tested the application's read/write routing logic before switching traffic. He had not. He spent the next forty minutes verifying that writes were not going to the read replica endpoint.

He updated the application to:

- Write operations → primary endpoint
- Menu browsing, order history → replica endpoint

CPU on the primary dropped from 89% to 41% at peak.

**The Read-After-Write Consistency Problem**

Three days after enabling the read replica, a support ticket arrived. A restaurant partner had updated their menu — removed a discontinued item — and then called to confirm it was removed. The customer service agent pulled up the menu from the Nimbus interface. The item was still there.

Twenty seconds later, it was gone.

Asynchronous replication lag. The write (DELETE menu item) went to the primary. The customer service agent's read went to the replica, which hadn't yet received the change. The replica was 15 seconds behind at that moment — not unusual, but visible.

"And what if someone tries to break in through the eventual consistency window?" Priya asked. "Or just — what if an order is placed for a menu item that was just deleted? We'd charge the customer and the restaurant wouldn't have the item."

This was a real consistency concern, not just a UX annoyance.

The solution: identify which reads have consistency requirements and route them to the primary.

**Reads that can go to the replica** (eventual consistency is fine):
- Customer browsing a restaurant's menu (stale by 1-2 seconds is imperceptible)
- Order history queries (a user viewing their order history from a minute ago)
- Analytics-type reads (top restaurants this week)

**Reads that must go to the primary** (read-after-write consistency required):
- Immediately after a write, when the application needs to confirm the write succeeded
- Order status reads immediately after order placement
- Menu reads triggered by the restaurant management interface (the restaurant just changed the menu)

The application added a routing hint in the database connection layer: if the request came from the restaurant management dashboard, route to primary. If it came from a customer browsing, route to the replica. The `X-Read-Consistency: strong` HTTP header served as the signal.

"It's not that hard," Leo said. "You just have to know which reads require it."

"And document it," Priya said. "So the next person who adds a new endpoint knows which pool to use." 

"How much does that cost per month?" Tom asked. It was his standard opening question for any new service.

A read replica of the same instance type costs the same as the primary. From $340/month to $680/month.

"We doubled the cost to roughly halve the load," Tom said.

"Yes. But the alternative was moving to a larger instance type, which would also cost more and wouldn't distribute the read load."

Tom did the math. He nodded, reluctantly.

"What if the primary fails?" Maya asked, before Tom could pivot to Aurora. "What happens to the read replica?"

Leo explained replica promotion.

**If the primary RDS instance fails**, AWS automatically fails over to the standby replica in the Multi-AZ configuration (a different kind of replica — a synchronous standby, not a read replica). The Multi-AZ standby becomes the new primary. Read replicas continue serving reads, now replicating from the new primary. From the application's perspective, the primary endpoint DNS changes to point to the former standby, and the application reconnects.

The failover typically takes 60-120 seconds for RDS PostgreSQL. During that window, writes fail.

**Read replica promotion** is a separate operation — and a separate scenario. If you want to take a read replica and make it an independent, writable database (for DR, for migration to a new region, or because the primary is gone and you need to promote rather than wait for Multi-AZ failover), you can promote a read replica to a standalone primary. Promotion takes a few minutes, after which the replica is no longer replicating from the original primary — it's its own database.

"Have we thought about what happens if the us-west-2 primary goes down entirely?" Priya asked. "Not just a failover to the Multi-AZ standby — the entire region."

"If the region fails," Leo said, "the Multi-AZ standby is also in us-west-2. Both fail together."

"So for a true regional DR scenario," Tom said, "we'd need a read replica in us-east-1 that we could promote."

"Yes. A cross-region read replica. We don't have one yet."

"How much does that cost per month?" Tom asked. He already knew the answer would involve a decision.

A cross-region read replica of a db.r6g.large in us-east-1: $340/month (same instance cost). Plus cross-region data transfer for replication: minimal at Nimbus's write volume. Total: approximately $350/month for a DR replica.

"That's $4,200 per year," Tom said, "to protect against a scenario that's happened to AWS regions less than five times in ten years."

"And the cost of Nimbus being down for 24 hours during a regional event is?" Priya asked.

Tom calculated. He didn't answer out loud. But he added "cross-region read replica" to the DR backlog.

"What's Aurora?" he asked.

**Amazon Aurora: Rethinking the Database Engine**

Aurora is AWS's proprietary relational database engine, compatible with MySQL and PostgreSQL. It was designed from the ground up for cloud workloads, reimagining how a relational database's storage layer works.

In a traditional RDS setup (MySQL, PostgreSQL), the storage and compute are tightly coupled. The database engine manages the data files. Replication copies the data from primary to replica. The replica must redo every write operation.

This creates a ceiling on replication speed: a replica can only apply writes as fast as it can process the replication log. During a write-heavy period — a bulk import, a flash sale, a batch update — the replica can fall behind. Replication lag isn't a flaw in the implementation; it's a consequence of the architecture.

Priya had flagged this immediately when Leo proposed read replicas. "And have we thought about what happens if replication lag spikes to 30 seconds during the Friday rush? The replica is 30 seconds behind. A customer places an order, the kitchen slot is reserved in the primary, but a second customer querying the replica doesn't see the reservation. Two orders, one slot."

"That's an inventory consistency problem," Leo said.

"That's exactly an inventory consistency problem," Priya confirmed. "Which is why inventory reads — 'is this item still available?' — must go to the primary."

Aurora's architecture addresses the lag directly.

Aurora separates storage from compute. It uses a distributed, fault-tolerant storage layer that replicates data automatically across three Availability Zones in six copies. The compute layer (the database instances) sits on top of this storage layer.

**What this changes**:

**Read replicas**: Aurora replicas don't need to replicate data — they already share the same storage layer. This means:

- Up to 15 Aurora Replicas that share the storage volume (regular RDS also allows up to 15 read replicas, but each is a full data copy)
- Replication lag is typically under 100 milliseconds (vs seconds for RDS under load)
- Replicas can be promoted to primary in under 30 seconds (vs minutes)

**Failover**: Because replicas share storage, failover is much faster — promotion doesn't involve data transfer, just redirecting writes.

**Storage**: Aurora automatically scales storage in 10GB increments, up to 128 TiB (256 TiB in recent engine versions). You never provision storage in advance.

**Performance**: Aurora claims 5x the throughput of standard MySQL and 3x standard PostgreSQL for equivalent instance types.

You might be wondering: if all replicas share the same storage, doesn't that storage become a single point of failure? Aurora's storage layer automatically replicates data across six copies in three Availability Zones. The storage itself is more resilient than any single RDS Multi-AZ setup — it's designed to survive the loss of an entire AZ with zero data loss and no failover needed.

A second common question: if Aurora is MySQL/PostgreSQL compatible, can you migrate from RDS PostgreSQL to Aurora PostgreSQL without changing application code? Almost. Aurora PostgreSQL compatibility means Aurora implements the PostgreSQL wire protocol and supports the vast majority of PostgreSQL SQL syntax and features. Most applications migrate with zero code changes. The edge cases: a small number of PostgreSQL extensions are not available on Aurora, some system catalog queries return different values, and certain administrative operations differ. For production migrations, test with parallel read traffic before switching writes.

For Nimbus, the migration from RDS PostgreSQL to Aurora PostgreSQL took one afternoon. The application pointed at the Aurora endpoint. The menu query — after Leo added the index that Performance Insights had pointed to as the top consumer of database load — ran in 4ms instead of 620ms. The connection pool no longer hit 198 out of 200. The P95 latency dropped to 28ms.

"It's a different database engine," Leo said, "that the application thinks is the same database engine."

"And the interesting part?" Maya asked.

"Fast database cloning."

"Noted," said Sam quietly from across the room, already typing. Sam was a backend engineer who had joined the team a few weeks earlier to take some of the database work off Leo's plate. Nobody asked what he was doing.

**Aurora Pricing: The Tom Question**

Aurora pricing is different from RDS:

**Instance pricing**: Similar to RDS instance pricing by type.

**Storage pricing**: $0.10 per GB per month (you pay for what's stored, automatically scaled).

**I/O pricing**: Aurora charges per I/O request (read/write to storage). This can be significant for write-heavy workloads.

"Wait," Tom said. "We're paying for I/O separately?"

"Aurora Serverless v2 and Aurora I/O-Optimized change this pricing model," Leo said. "Aurora I/O-Optimized charges no I/O fee but a higher storage and instance price. Better for I/O-heavy workloads."

Tom looked at the trade-off. For Nimbus, which was read-heavy (lots of menu queries, few writes), Aurora I/O-Optimized might cost more. Standard Aurora pricing might be appropriate.

A useful heuristic: if your I/O charges exceed roughly 25% of your total Aurora bill, I/O-Optimized is likely cheaper. For Nimbus's read-heavy workload, I/O charges were low — standard pricing applies. For a write-heavy workload like an event logging system, I/O-Optimized could reduce costs significantly.

This is a real cost decision senior engineers make: you need to know your workload's I/O patterns to choose correctly.

If your workload is small, stable, and predictable, RDS PostgreSQL is simpler and meaningfully cheaper — but if your traffic is unpredictable, your data volume is growing beyond what you can provision in advance, or you need automatic failover in under 30 seconds, Aurora's shared storage model justifies the higher base cost.

**Aurora Serverless: Scaling Without Thinking About Instances**

**Aurora Serverless v2** is a configuration that automatically scales the compute capacity based on actual database load. Instead of choosing a fixed instance size (db.r6g.large), you set a minimum and maximum capacity in Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Scales up in seconds when load increases
- Scales down during idle periods — and since late 2024, can auto-pause all the way to 0 ACUs when there are no connections (resume takes ~15 seconds; auto-pause doesn't work with RDS Proxy or other connection-holding proxies)
- Cost: $0.12 per ACU-hour (plus storage and I/O)

For workloads with variable traffic — Nimbus's Friday spikes vs Monday morning quiet — Serverless v2 reduces costs during off-peak periods and handles peaks without pre-provisioning.

"So during the Friday spike," Leo said, "Aurora automatically scales up. Sunday morning when we have almost no traffic, it scales back down to minimum."

"And we only pay for the capacity we're using," Tom said.

"Correct."

After a month on Aurora Serverless v2, Leo pulled up the ACU (Aurora Capacity Unit) graph for the previous week.

The graph showed two distinct patterns. During the week, the database ran at 2-4 ACUs — a quiet hum of background queries, ECS health checks, Glue ETL jobs, and development testing. On Friday evening between 18:00 and 22:00, the ACU count climbed:

```
Friday 18:00  → 6 ACUs
Friday 19:00  → 14 ACUs
Friday 19:45  → 26 ACUs  (peak — pizza orders spike before NFL kickoff)
Friday 20:30  → 18 ACUs
Friday 21:00  → 12 ACUs
Friday 22:30  → 4 ACUs
Saturday 02:00 → 2 ACUs  (minimum)
```

The scaling was near-instant — Aurora Serverless v2 scales in increments of 0.5 ACUs, and it can add capacity in seconds rather than the minutes required to provision a new RDS instance.

"How much did that Friday peak cost?" Tom asked.

At $0.12 per ACU-hour: Friday peak was 4 hours averaging 18 ACUs → $8.64 for the peak period. The rest of the week at 3 ACUs average × 164 hours × $0.12 = $59.04. Total for the week: $67.68.

The equivalent provisioned instance to handle the Friday peak (db.r6g.xlarge, 4 vCPUs, 32 GB) would cost $0.937/hour × 168 hours = **$157.42 for the week** — whether or not Friday's peak ever materialized.

"Serverless v2 is $67 for the week. A provisioned instance sized for peak is $157," Tom said. "That's a 57% reduction."

"On a database that legitimately uses 26 ACUs for four hours on Friday and 2 ACUs for the rest of the week," Leo said. "If your database runs at consistent high load all week, a provisioned instance is cheaper. The savings come from the variability."

Tom nodded slowly. He was adding this to a pattern in his notes: every savings story this quarter had the same shape. You pay for what you use, not for what you might need. S3 lifecycle policies paid only for the storage class each object warranted. Lambda paid only for invocation time. Fargate paid only for task CPU and memory. Aurora Serverless v2 paid only for the ACUs the database actually consumed.

Tom had the expression of someone who'd found exactly what they were looking for.

**Recovering From a Bad Migration: Clones, PITR, and the Undo Button**

Two weeks after moving to Aurora, Sam ran a database migration script in production. The script was supposed to remove the `legacy_menu_format` column from the `menu_items` table. He ran it without the WHERE clause he thought he'd included.

The result was not removing a column. It was a DELETE statement that cleared 40,000 rows from the `menu_items` table — approximately 200 restaurants worth of menu data, gone.

The alert fired within 30 seconds. Order failures spiked. The menu service started returning empty results for 200 restaurants.

"It was supposed to have a WHERE clause," Sam said, staring at the console.

The traditional recovery path: restore from the most recent automated backup snapshot. Automated backups run once every 24 hours, and a full restore-and-swap would take 20-40 minutes — during which *all* restaurants would be dark, not just the affected 200 — and every order placed since the backup would be lost.

Leo didn't do that. Like standard RDS, Aurora keeps continuous backups for **point-in-time recovery (PITR)** — you can restore the cluster to any second within the backup retention window, not just to the last nightly snapshot. And critically, the restore creates a *new* cluster; production stays up while you recover.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

The timestamp: 15:42:00Z — four minutes before Sam ran the migration script. While the recovery cluster spun up, the rest of production kept serving the unaffected restaurants. Once it was available, Leo dumped the `menu_items` rows for the 200 affected restaurants from the recovery cluster and inserted them back into production. Total time from alert to fully restored menus: a little under 40 minutes — and because he repaired the rows surgically instead of swapping the whole database, no orders placed after 15:42 were lost. The recovery cluster was deleted afterward; it had served its purpose.

"What did we lose?" Maya asked.

Six orders placed against the briefly-empty menus had failed at checkout — all of them were in the SQS queue and could be replayed. No customer data was permanently lost.

"And this is where **fast database cloning** comes in," Leo said, pulling the team together afterward. Aurora can create a **clone** of a cluster in minutes, regardless of database size, using copy-on-write: the clone shares the original's storage layer and only new or changed pages consume additional space. A clone of the current production database is cheap, fast, and completely isolated — writes to the clone never touch production.

"Which means," Priya said, looking at Sam, "the migration script gets tested against a clone of production data before it ever runs in production. That's the new rule."

Sam nodded. He'd already written it on a sticky note.

One more tool belongs in this picture. Aurora MySQL — not Aurora PostgreSQL — has **Aurora Backtrack**: a feature that rewinds the cluster *in place* to a specific point in time, without restoring to a new cluster at all. If Nimbus's cluster had been Aurora MySQL, Leo could have backtracked it to 15:42 in under three minutes — though rewinding the whole cluster would also have rolled back the handful of legitimate orders written after the deletion, which the surgical PITR approach preserved.

"And what if someone tries to break in using Backtrack — or a point-in-time restore?" Priya asked. "Could an attacker rewind audit logs or compliance data?"

Backtrack requires the `rds:BacktrackDBCluster` API permission, and restores require `rds:RestoreDBClusterToPointInTime` — separate IAM actions from normal database operations. Standard application roles don't have these permissions. Only the operations team, with explicit IAM policy allowing them, could use them. She added this to the IAM permissions review checklist.

The important caveats: Aurora Backtrack is only available for Aurora MySQL-compatible clusters, not PostgreSQL. The Backtrack window is configured at cluster creation (1 hour to 72 hours, charges per hour of backtrack window). And Backtrack affects the entire cluster — you cannot Backtrack one table or one set of rows. For surgical row-level recovery — on either engine — the PITR-to-a-temporary-cluster approach Leo used is the tool.

**Aurora Global Database: Multi-Region Reads**

**Aurora Global Database** extends Aurora across multiple AWS regions:

- **One primary region** handles all writes
- **Up to five secondary regions** serve reads with typically <1 second replication lag
- Secondary regions can be promoted to primary in under 1 minute (for DR scenarios)

For Nimbus's global expansion, Aurora Global Database would let a restaurant partner in London query their local menu from the EU read replica, while all orders (writes) still go through the US primary.

**RDS vs Aurora: When to Choose Each**

| Factor            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Cost              | Lower for small workloads     | Higher base, but scales better                             |
| Compatibility     | Full                          | MySQL/PostgreSQL compatible (with minor differences)       |
| Max replicas      | 15 (each a full data copy)    | 15 (shared storage volume)                                 |
| Replica lag       | Can be seconds                | Usually <100ms                                             |
| Storage           | Fixed provisioning            | Auto-scales to 128 TiB (256 TiB in recent versions)        |
| Failover time     | 60-120 seconds                | <30 seconds                                                |
| Serverless option | Limited                       | Aurora Serverless v2                                       |
| Best for          | Stable, predictable workloads | Variable traffic, high read volume, need for fast failover |

**Beyond Relational: The Purpose-Built Family**

Chapter 9 introduced DocumentDB (MongoDB-compatible documents), Neptune (graph relationships), and Keyspaces (Cassandra-compatible wide-column), and chapter 10 introduced MemoryDB (durable Redis-compatible primary database). Two more names round out the family — you don't need depth on them, just the ability to recognize which data shape points to which engine, because they appear constantly as answer options:

- **Amazon Timestream**: **time-series** data — sensor readings, metrics, telemetry. Exam signal: "IoT measurements over time." (In the real world the current offering is Timestream for InfluxDB; the original "LiveAnalytics" flavor closed to new customers in 2025.)
- **Amazon QLDB**: you may still meet it in older questions as the "immutable, cryptographically verifiable ledger." AWS discontinued QLDB in 2025 (recommending Aurora PostgreSQL instead) — treat it as a legacy distractor, not a building block.

The rule worth writing on a whiteboard: **relational rows → RDS/Aurora; key-value at scale → DynamoDB; documents → DocumentDB; relationships → Neptune; time → Timestream; Cassandra → Keyspaces; durable Redis → MemoryDB.** Match the shape, and the question answers itself.

## Strengths and Limitations

**Aurora strengths**:

- Significantly faster failover than standard RDS
- Up to 15 read replicas with minimal lag
- Auto-scaling storage
- Serverless v2 for variable workloads
- Global Database for multi-region deployment

**Aurora limitations**:

- Higher cost for small, stable workloads
- I/O pricing can be significant for write-heavy workloads (use I/O-Optimized for this)
- Minor MySQL/PostgreSQL compatibility differences can require code changes
- Serverless v2 resume from auto-pause (~15 seconds) and rapid scale-up can cause latency spikes

## Summary

The S3 lifecycle work in chapter 23 reduced costs by moving data to the right storage tier. Aurora does the equivalent for compute: instead of provisioning for peak load and paying for it all the time, Serverless v2 scales to match demand.

- **Read replicas** distribute read traffic from the primary. Asynchronous replication — slight lag acceptable for most reads. Route reads that require write consistency (immediately post-write reads, admin interface reads) to the primary, not the replica.
- **Aurora** reimagines the storage layer: distributed, shared across replicas, auto-scaling.
- Aurora offers: 15 read replicas, <100ms replica lag, <30s failover, up to 128 TiB (256 TiB in recent versions) auto-scaling storage.
- **Performance Insights**: identify the specific SQL queries causing database load before deciding how to scale. A missing index can eliminate the need for a larger instance.
- **CloudWatch database metrics**: DatabaseConnections (near-saturation means application connection pooling is broken), CPUUtilization (sustained high CPU means expensive queries), ReadLatency (degradation over time is often a growing table with a missing index).
- **Aurora Serverless v2**: auto-scales compute in increments of 0.5 ACUs. Charged per ACU-hour. Significantly cheaper than provisioned instances for workloads with high variability between peak and off-peak.
- **Point-in-time recovery (PITR)**: restore an Aurora cluster to any second within the backup retention window — into a *new* cluster, so production stays up while you surgically copy lost rows back.
- **Fast database cloning**: copy-on-write clone of a cluster in minutes regardless of size. Cheap, isolated — use it to test migrations against production data before they run in production.
- **Aurora Backtrack** (MySQL-compatible only — not PostgreSQL): rewind the cluster in place to a point in time without restoring from a backup. Available for windows up to 72 hours. Requires the `rds:BacktrackDBCluster` IAM permission — restrict to operations team.
- **Aurora Global Database**: primary in one region, read replicas in up to five regions.
- **Read replica promotion**: cross-region read replicas can be promoted to standalone primaries for regional DR. Balance the DR benefit against the cost of running a second full instance.
- Choose RDS for smaller, stable, predictable workloads. Choose Aurora when you need scale, fast failover, or variable traffic handling.

## Exam Tips

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- **Aurora replica vs RDS read replica**: Aurora replicas share storage (near-zero lag, <30s failover). RDS read replicas replicate data (lag possible, minutes for failover).
- **Aurora Serverless v2**: "auto-scale database capacity," "unpredictable or spiky database traffic" → Aurora Serverless v2. Caution: historically only Serverless **v1** scaled to zero; v2's minimum was 0.5 ACU until late 2024, when v2 gained auto-pause to 0 ACUs. Older exam questions may still assume v2 cannot scale to zero.
- **Aurora Global Database**: "multi-region database," "read from EU with low latency from US primary," "RTO < 1 minute for regional failover" → Aurora Global Database.
- **Failover timing**: Aurora < 30 seconds. RDS Multi-AZ 60-120 seconds. Know both.
- **Purpose-built databases by data shape**: "social graph / recommendations / fraud rings" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "time series / IoT telemetry" → Timestream. "Redis-compatible *primary* database (durable)" → MemoryDB (vs ElastiCache = cache). "Immutable cryptographic ledger" → QLDB in old questions (discontinued in 2025).
- **Aurora I/O-Optimized**: Higher storage and instance cost, no per-I/O charge. Use when I/O costs dominate (write-heavy). Standard Aurora: lower storage cost, pay per I/O. Use for read-heavy.
- **Aurora Backtrack**: Rewind the database in place to a specific point in time without restoring from a backup snapshot. Available for MySQL-compatible Aurora only — for Aurora PostgreSQL, the answer is point-in-time restore (to a new cluster) or a fast clone. Exam signal: "accidentally deleted data, need to recover quickly without restoring a full backup" + MySQL → Backtrack.
- **Aurora fast database cloning**: copy-on-write clone in minutes, regardless of database size. Exam signal: "test against a copy of production data quickly and cheaply" → clone, not snapshot-restore.

## Exercises

**Exercise 1 — Recall**

Explain the difference between Aurora and standard RDS read replicas. Why is Aurora's replication lag typically lower?

*(Hint: The key difference is shared storage vs data replication. Think about what each replica must do when a write arrives.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A social media platform's MySQL database is experiencing high read latency due to increasing traffic. The application is read-heavy (95% reads, 5% writes). The team needs read latency to be consistent, even during traffic spikes. They need automatic failover with minimal downtime (target RTO < 30 seconds). The data volume is growing unpredictably.

Which database solution BEST meets these requirements?

A) RDS MySQL Multi-AZ with five read replicas  
B) Aurora MySQL with Aurora Replicas and Aurora Serverless v2  
C) RDS MySQL with a larger instance type (vertical scaling)  
D) DynamoDB with DynamoDB DAX for read caching

**Hint 1**: "RTO < 30 seconds" — which service achieves this? Check the failover timing for each option.

**Hint 2**: "Consistent read latency during spikes" — which service's replicas have near-zero lag vs potential seconds of lag?

**Hint 3**: "Unpredictably growing data volume" — which service auto-scales storage?

**Answer**: B

**Explanation**: Aurora MySQL with Aurora Replicas provides near-zero replication lag (milliseconds, not seconds) for consistent read performance under load. Aurora Serverless v2 auto-scales compute during traffic spikes without over-provisioning. Aurora storage auto-scales as data grows. Aurora failover (promotion of a replica) completes in under 30 seconds — meeting the RTO requirement.

**Why not A?** RDS Multi-AZ failover takes 60-120 seconds — doesn't meet RTO < 30 seconds. Standard RDS read replica lag can reach seconds under load — "consistent" read latency is harder to guarantee.

**Why not C?** Vertical scaling (larger instance) increases capacity but doesn't distribute read load. The database remains a single point of failure for reads.

**Why not D?** DynamoDB is NoSQL — migrating from MySQL to DynamoDB requires rearchitecting the data model and application queries, which is far beyond the scope of this performance improvement task.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is designing a global expansion. They want restaurant partners on the East Coast, in Germany, and in Australia to see their own order data quickly, without cross-region latency. However, all writes must go through the single us-west-2 primary to maintain consistency.

Design the database architecture using Aurora. How would you structure the Global Database — for example, secondary clusters in us-east-1, eu-central-1, and ap-southeast-2? What happens if the us-west-2 primary goes down? How would you handle the promotion process?

*(There is no single correct answer. The goal is to practice multi-region database design.)*

## Post-Credits Scene

Leo migrated to Aurora with Serverless v2.

The Friday spike came and went. CPU never exceeded 60%. Query latency stayed consistent. Aurora had scaled up to handle the load automatically, then scaled back down after the rush.

"How much did this cost compared to last Friday?" Tom asked Monday morning.

Leo pulled up the billing explorer. "Friday averaged about $2.16/hour through the evening peak. Saturday morning was $0.24/hour."

Tom said nothing.

"The old setup was a fixed $0.47/hour regardless of load," Leo added.

"So we paid more during the spike than before," Tom said.

"Yes. But significantly less during off-peak. Net cost over the week is lower."

Tom calculated. Then nodded.

"There's a lesson here," he said. "The right question isn't 'is this cheaper?' It's 'is this cheaper for our actual usage pattern?'"

"That," said Priya from across the room, "is a senior engineer's instinct."

Tom looked slightly alarmed to be described that way.

In the next chapter: when your network is the bottleneck, and why a private highway might be worth the toll.
