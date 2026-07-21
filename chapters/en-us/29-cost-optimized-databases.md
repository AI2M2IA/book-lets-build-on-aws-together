# Chapter 29: The Database Bill

Tom printed the usage graphs. Fourteen pages. He spread them across his desk before he trusted himself to read the numbers. Better to see everything at once than to find surprises mid-page.

The storage audit had turned up $6,700 in accumulated waste — not from bad decisions, but from inattention. Unattached volumes, old snapshots, version histories that nobody had told S3 to clean up, incomplete multipart uploads that had been accumulating silently for months. Tom had fixed it all, implemented automatic cleanup rules, and moved to the next tab in the spreadsheet. The data tier was the largest remaining unknown: relational databases, NoSQL tables, cache nodes, backup storage, and one line item that had been nagging at him for weeks.

The data-tier line items under review:

Aurora cluster: $647/month.
Legacy RDS PostgreSQL read replicas: $340/month.
DynamoDB tables: $340/month.
ElastiCache: $185/month.
Aurora manual snapshots: $87/month.

Total data tier under review: $1,599/month.

"Let me understand each one before deciding anything," he said. "Because the database is not the place to save money by cutting corners."

This was wise. Database misconfiguration that causes data loss or performance degradation costs far more than the savings.

Think of a database like the engine of a car. You can save money on a car by switching to cheaper fuel, adjusting the tire pressure, and removing unnecessary weight from the trunk. But if you try to save money by skipping an oil change, you risk seizing the engine — and a seized engine costs far more than any fuel savings. The audit Tom is about to run follows the same logic: find the waste in the trunk and the fuel tank, and leave the engine alone until you know exactly what you're doing.

**Understanding Your Database Workload First**

Cost optimization in databases requires understanding the workload before touching anything. Tom had learned this from a near-miss six months earlier: he had started to reduce the database instance size based on average CPU utilization — 18% — without first looking at p95 numbers. A colleague had asked him to check the CloudWatch metrics more carefully. The p95 CPU was 61%, and during a particularly heavy Friday dinner rush, it had hit 84%.

"The average doesn't tell you what happens at peak," Tom said, when he told Priya about it. "If I'd right-sized to the average, we'd have been throttled on Friday nights."

"That's why you look at p95, not average," Priya said. "Always."

That principle extended beyond CPU. Tom now had a standard pre-audit checklist:

- CPU: p95, not average
- Memory: FreeableMemory (in absolute bytes, not percentage) — how close are we to the limit?
- Connections: DatabaseConnections maximum over the trailing 30 days — how close have we come to the connection limit?
- Read/write ratio: Determines whether read replicas are earning their cost
- Storage growth rate: How many GB per month are we adding?
- Replication lag (for replicas): Is the replica keeping up?

Key questions:

- What's the average and peak CPU utilization?
- What's the read/write ratio?
- Is storage growing, stable, or decreasing?
- Are read replicas being utilized?
- Is the instance under-provisioned (causing slowdowns) or over-provisioned (paying for idle capacity)?

Tom pulled up CloudWatch metrics for all three database services over the previous 30 days:

**Aurora cluster**:

- Average CPU: 18% (p95: 61%; peak: 84% on Friday evenings)
- FreeableMemory: consistently above 4GB of 8GB available. Not a concern.
- Read/write ratio: 14:1 (read-heavy)
- Storage: 180GB (growing ~5GB/month)
- DatabaseConnections maximum: 312 of 1,000 available. Comfortable.

**Read replicas (RDS PostgreSQL, separate from Aurora)**:

- These were two legacy RDS read replicas created before the Aurora migration, still running.
- Average connections to each: 2 per day. Average CPU: 3%.
- FreeableMemory: 7.2GB of 8GB available. The instances were nearly idle.

"Why are these still running?" Tom asked.

"I already deployed them — oh," Leo said. He looked at the instance creation dates. "They were for fallback during the Aurora migration. I never deleted them."

That moment — when an expensive thing has been running for months without being used — is a familiar one in cloud environments. Leo had created the replicas as a safety net. The safety net had never been needed. But nobody had asked the question until now.

"What's the connection pool situation?" Priya asked, leaning in. "Before we delete them, are any application components still routing reads there?"

Tom checked the connection logs. The two connections per day came from a monitoring script that Priya had written fourteen months ago — it polled all known database endpoints to verify they were responding. The replicas were being queried only by the health checker, not by any actual application traffic.

"Delete them," Maya said.

The replicas were terminated. Monthly saving: $340.

**Connection Pool Near-Miss**

While he had the connection metrics open, Tom ran a broader check across all database endpoints. What he found made him stop.

The Aurora writer endpoint showed a DatabaseConnections maximum of 312. Comfortable. But the reader endpoint told a different story.

"The reader endpoint hit 847 connections on three consecutive Friday nights," Tom said.

"How many is the limit?" Priya asked.

"The limit for our current instance class is 1,000. We got to 847. That's 85% of the limit."

"And we didn't notice because we weren't alarmed until 90%?" Maya asked.

"We weren't alarmed at all," Tom said. "There's no CloudWatch alarm on the reader endpoint connections. I only found this because I was looking at the raw metrics."

At 1,000 connections, the database refuses new connections. Any application thread trying to acquire a database connection at that moment throws an exception. If that exception isn't handled gracefully, the user sees a 500 error.

"We were thirty seconds away from a Friday-night incident," Leo said. "Three times in a row."

"Have we thought about what happens when that threshold gets crossed?" Priya asked.

"Restaurant partners see failed orders during dinner rush," Maya said. "That's not a theoretical concern."

Tom set up a CloudWatch alarm immediately: alert at 750 connections (75% of limit), page at 900 (90%). He also implemented RDS Proxy for the reader endpoint — RDS Proxy pools and manages database connections from the application layer, meaning fifty application threads can share ten database connections. The proxy handles the multiplexing. The database sees far fewer connections even when the application is under heavy load.

"For Aurora Serverless v2, RDS Proxy is priced at $0.015 per ACU per hour, with a minimum charge of 8 ACUs per proxy," Tom said. "But if a connection limit breach causes even one partial outage on a Friday night, the reputation cost to Nimbus is orders of magnitude higher."

"How much does that cost per month?" Tom asked himself, running the number. Their reader runs on Serverless v2, so the proxy bills against the 8-ACU minimum: $0.015 × 8 × 730 = $87.60/month. That was a cost he was happy to pay.

You might be wondering: if we're already saving money with Serverless v2's auto-scaling, why bother with Reserved Instances for the provisioned tier? The answer is that Serverless v2's scaling has a cost — you pay per ACU-hour whether you planned for it or not. For teams running fixed Aurora configurations, the RI commitment converts variable cost into predictable cost. For the teams running provisioned instances (not Serverless v2), that distinction matters significantly.

**RDS Reserved Instances: For Provisioned Database Tiers**

Like EC2, RDS offers Reserved Instances for committed usage.

For teams using fixed Aurora instance configurations (not Serverless v2), Reserved Instances can save 30-60%. Here's how the provisioned RI approach works: you commit to a specific instance type for 1 or 3 years in exchange for a significant discount on the hourly rate.

For illustration: a db.r6g.large writer instance at $0.26/hour On-Demand runs $190/month. A 1-year Reserved Instance for the same reduces that to approximately $108/month — saving $82/month per instance, or nearly $1,000 per year per database instance.

**Aurora Serverless v2 vs Standard RI — The Break-Even**

Tom ran the numbers for their specific Aurora configuration. The question: was Aurora Serverless v2's auto-scaling providing enough benefit, or would a fixed provisioned instance with a Reserved Instance commitment be cheaper?

Serverless v2 pricing: $0.12 per ACU-hour. Their cluster scaled between 0.5 ACU (idle) and 16 ACU (peak load). Over the trailing 30 days, the average was 4.2 ACU.

Monthly Serverless v2 cost: 4.2 ACU × $0.12 × 730 hours = $368/month for the writer.

Compare: a fixed db.r6g.xlarge (their estimated provisioned equivalent, sized to handle the weekday p95 load) with a 1-year RI: $0.52/hour × 0.60 (RI discount) × 730 = $228/month.

"The RI is cheaper," Leo said.

"For a fixed load, yes," Tom said. "But look at the spread. Our low traffic period — 2 AM to 7 AM, Monday to Thursday — averages 0.8 ACU. On a fixed provisioned instance, we'd be paying for many times what we're using during those hours, just sitting idle."

"And Serverless v2 scales down to match?"

"To 0.5 ACU. The idle cost is a fraction of what we'd pay for a provisioned instance sized for peak."

The break-even calculation: Serverless v2 is cheaper when your peak/baseline ratio is above about 4:1. For Nimbus, with Friday peaks at 16 ACU and Monday-morning minimums at 0.8 ACU — a 20:1 ratio — Serverless v2 was the right choice. If their traffic had been more consistent (say, 8 ACU ± 20%), a provisioned RI would have been cheaper.

"It's not just about which number is smaller this month," Tom said. "It's about which model handles our growth correctly. If we grow 50% next quarter, Serverless v2 just scales up. A provisioned RI would need re-sizing, and we'd be paying for unused headroom during the transition."

Tom mapped out the year-long comparison explicitly so the team could follow the reasoning, not just the conclusion.

**Month-by-month Aurora cost: Serverless v2 vs provisioned RI**

The provisioned option: a db.r6g.xlarge with a 1-year Reserved Instance. Cost: $0.52/hour On-Demand × 0.60 (RI discount) × 730 hours = $228/month. Fixed, regardless of load.

The Serverless v2 option: pay per ACU-hour at $0.12. Variable, tracking actual load.

Tom pulled 30 days of Aurora Serverless v2 ACU metrics from CloudWatch and built a distribution:

- 2 AM–7 AM, Monday–Thursday (low traffic): average 0.8 ACU → $0.096/hour
- 7 AM–11 AM, weekdays (moderate): average 3.2 ACU → $0.384/hour  
- 11 AM–9 PM, weekdays (peak business hours): average 5.8 ACU → $0.696/hour
- Friday 6 PM–10 PM (dinner rush): average 14.1 ACU → $1.692/hour
- Saturday 12 PM–8 PM (weekend busy): average 9.3 ACU → $1.116/hour
- Sunday (lightest day): average 2.1 ACU → $0.252/hour

Weighted average across the full month: 4.2 ACU → $0.504/hour → $368/month.

On a provisioned RI: $228/month. Serverless: $368/month. The provisioned option saved $140/month.

"That seems obvious," Leo said. "Why are we on Serverless?"

"Because $368 is the average," Tom said. "Look at Friday evenings."

Friday 6–10 PM: 14.1 ACU average. For that four-hour window, Serverless costs $1.692/hour. A db.r6g.xlarge at $228/month tops out at 32 GiB of memory — the equivalent of about 16 ACUs. The Serverless cluster was averaging 14.1 ACUs during that window, brushing against the xlarge's ceiling with no headroom for spikes.

"A provisioned instance sized for our Friday peak with real headroom would be a db.r6g.2xlarge," Tom said. "At the RI rate, that's $1.04/hour × 0.60 = $0.624/hour. Monthly: $456/month."

"That's more than the Serverless average of $368," Maya said.

"Right. And if we sized the provisioned instance for the weekday baseline — the db.r6g.xlarge — Friday nights would be a problem. At peak load, we'd be pushing 14 ACUs against roughly the xlarge's entire capacity. That's saturation."

"So you'd need to pre-size for peak," Priya said.

"At the cost of paying for idle capacity the other 160 hours of the week," Tom said. "The provisioned RI math that comes out cheaper only works when your peak/baseline ratio is low. Ours is 20:1. That's exactly the scenario Serverless v2 was designed for."

He showed the numbers side by side:

| Option | Average month | Quiet night (2 AM) | Friday rush (8 PM) |
|---|---|---|---|
| Serverless v2 | $368 | $0.096/hr | $1.692/hr |
| Provisioned RI (r6g.xl) | $228 | $228/730hr = $0.312/hr | capped — risk of saturation |
| Provisioned RI (r6g.2xl) | $456 | $0.624/hr | comfortable headroom |

"The Serverless option is $368," Tom said. "The right-sized provisioned option is $456 — and that's before accounting for the operational cost of monitoring and manually scaling the provisioned instance when our traffic patterns change next quarter."

"And the operational cost," Priya said, "is not nothing."

"No. With Serverless, we don't have to think about instance sizing. Aurora handles it. With provisioned, every quarter I'd need to re-evaluate whether the current instance class still fits our traffic. That's not expensive in time, but it's something that can go wrong if we stop paying attention."

"It'll be fine as long as we don't forget to resize it," Leo said, and then caught himself. "Which is exactly when it won't be fine."

"Exactly," Tom said.

The conclusion held: Serverless v2 at $368/month was the right choice for Nimbus's 20:1 peak/baseline ratio and its team's preference for operational simplicity. The provisioned RI was only compelling for teams with traffic that didn't vary significantly — a 2:1 or 3:1 ratio where the provisioned instance was rarely idle.

"What would make us switch to provisioned?" Maya asked.

"If our traffic pattern flattened out," Tom said. "If Nimbus grew to the point where the low-traffic baseline was also high — say, 8 ACU at 2 AM instead of 0.8 — the ratio would drop to 2:1 and provisioned would make economic sense. That's a different business problem. One we'd like to have."


For Aurora with Serverless v2, Reserved Instances don't directly apply — Serverless v2 scales dynamically and you pay per ACU-hour. This is Nimbus's current configuration: the primary Aurora writer and reader both use Serverless v2. The savings for Nimbus come from the auto-scaling nature of Serverless v2 itself — you don't pay for unused capacity when traffic is low.

Teams still running fixed Aurora instances should evaluate RI commitment once the instance type has been stable for three or more months.

**DynamoDB: On-Demand vs Provisioned**

In Chapter 9, we introduced DynamoDB's two capacity modes: on-demand and provisioned.

Nimbus had been running DynamoDB in on-demand mode since the beginning. At low traffic, this was correct — on-demand is more expensive per request but has no minimum charge.

Now, with 18 months of traffic data in CloudWatch, Tom could see patterns.

Average read requests: 225 per second (about 19.4 million per day)
Average write requests: 60 per second (about 5.2 million per day)
Peak day (Friday): 180% of average DynamoDB requests (ElastiCache absorbs ~95% of reads, so DynamoDB only sees a fraction of the overall 25x order volume spike)

**On-demand pricing**: $1.25 per million write requests, $0.25 per million read requests.
**Provisioned pricing**: $0.00065 per write capacity unit per hour, $0.00013 per read capacity unit per hour.

Tom calculated the break-even point: provisioned capacity becomes cheaper when you use it consistently enough that you're not paying the on-demand premium during idle periods.

(A note on the numbers in this section: they reflect the team's bill at the time, and are illustrative. In late 2024, AWS cut DynamoDB on-demand prices by 50%, which moved the break-even substantially — today, provisioned capacity only wins when utilization is consistently high. Always redo this math with current prices.)

With 18 months of data showing consistent daily patterns, provisioned capacity with **DynamoDB Auto Scaling** was the right choice:

- Set minimum capacity at 60% of average load
- Set maximum at 250% of average (handles Friday spikes)
- Auto Scaling adjusts the provisioned capacity between these bounds

Monthly DynamoDB cost: dropped from $340 (on-demand) to $230 (provisioned with auto scaling). 32% reduction.

"Wait — but *why* would we do it that way?" Maya asked. "We've been on on-demand since the beginning because we didn't trust our own traffic patterns. What changed?"

"Eighteen months of data," Tom said. "We now know what our patterns look like — consistent weekday baseline, Friday peaks, Sunday quiet periods. On-demand was the right call when we didn't know. Provisioned with Auto Scaling is the right call now that we do."

"But if we over-provision," Leo asked, "we pay for unused capacity."

"That's the risk," Tom said. "With Auto Scaling, we set the minimum high enough to avoid throttling, and let AWS manage within our range."

"And if our traffic pattern changes significantly?"

"Then we adjust the bounds. We review this quarterly."

**ElastiCache: Right-Sizing and the Cautionary Tale**

The ElastiCache bill: $185/month. One cache.r6g.large Redis instance in each AZ (two nodes, primary + replica).

CloudWatch metrics showed:

- Average memory utilization: 34%
- Peak: 44%

The instance was over-provisioned. A cache.m6g.large — half the memory of the r6g.large — would likely handle the load with some headroom.

But here Tom paused. He remembered what had happened at a previous company when he'd aggressively right-sized a cache — and he told the team the full story, because it was the kind of story that needed to be told before you found yourself in the middle of it.

At his previous company — a SaaS platform for financial reporting — the ElastiCache cluster had been a cache.r6g.large. Two nodes, primary and replica. Average memory utilization: 26%. Peak observed: 37%. The on-call engineer who flagged it had done the math: a cache.m6g.large would handle the load with about 25% headroom above the observed peak. Saving: $60/month — pricing in that company's region and node generation at the time, smaller than the equivalent gap at Nimbus today. The change was approved on a Tuesday.

The following month, on a Thursday evening at 11:47 PM, the month-end settlement batch started.

The settlement batch ran quarterly. It pulled every active account's transaction records for the preceding three months, aggregated them, computed taxes, and wrote settlement records. The cache was used to store intermediate aggregation state — each account's running total as the batch progressed. The cache.r6g.large had always handled it. Nobody had looked at the settlement batch metrics specifically when making the right-sizing decision, because the batch was quarterly and the observation window had been four weeks.

On the smaller instance, maxMemoryPolicy was set to `allkeys-lru` — when memory was full, Redis would evict the least-recently-used key to make room. That's the correct policy for a general cache. But for the settlement batch, every key in the cache was actively needed. When memory filled at 84% of the m6g.large's 6.38 GB, Redis started evicting keys. Each eviction was a cache miss. Each cache miss sent a query to the underlying PostgreSQL database to recompute the evicted value from raw transaction records.

The database connection pool was configured for steady-state traffic, not settlement batch load. Within four minutes of the evictions beginning, the database had 847 active connections. The connection limit was 1,000. At 9 minutes, the first application threads started seeing "too many connections" errors. At 12 minutes, three services that shared the database connection pool — the settlement batch, the real-time reporting service, and the client-facing API — were all affected.

The on-call engineer escalated at 11:59 PM. The incident review started at 12:08 AM.

First response: increase the Lambda timeout for the settlement batch function (the settlement batch was partly Lambda-based). This was wrong. The timeout wasn't the problem.

Second response: add a second Lambda function to parallelize the settlement batch. Also wrong. More parallelism meant more simultaneous cache access, which meant faster evictions, which made the situation worse.

Third response: scale down the settlement batch to reduce database pressure. This helped slightly but didn't address the root cause.

Fourth response, at 2:31 AM: restore the cache.r6g.large. Memory pressure dropped immediately. Evictions stopped. The database connection pool cleared. The settlement batch completed at 4:17 AM, delayed by over four hours.

Incident total: four hours of degraded API performance for clients trying to access reports. One complete settlement batch delayed. Engineering time: approximately 22 hours across five engineers. Estimated direct cost: $40,000.

The $60/month saving had cost $40,000 in a single incident.

"The mistake wasn't the right-sizing decision," Tom said. "The decision was defensible based on the available data. The mistake was the observation window. We measured four weeks of metrics. The settlement batch was quarterly. We were looking at the wrong timeframe."

"So how do you avoid it?" Maya asked.

"You ask: what's the highest-stakes operation this cache supports? And you find that operation's specific metrics. Not the average week. The specific week — or month — or quarter — when the load is highest. And you size for that."

"And if you can't find the metrics because the operation is rare?"

"That's the answer," Tom said. "If you can't find the metrics for a specific high-load scenario, the correct response is to not right-size yet. Wait for the next occurrence, instrument it heavily, then size based on what you observed."

The Nimbus ElastiCache cluster had its own high-stakes operation: the Friday dinner rush. Tom had that data — three consecutive Friday nights had hit 44% memory utilization on the r6g.large, about 5.7 GB of live data. On the m6g.large's 6.38 GB, that same working set would already sit near 90% — and if anything in the order processing pipeline changed to use more cache space — a new feature, a different caching strategy — 90% becomes eviction territory.

He ran the numbers anyway. Moving from r6g.large to m6g.large: two nodes at $0.127/hour versus two nodes at $0.090/hour, running 730 hours per month. Large: $185/month. The m6g pair: $131/month. Potential saving: $54/month. He tested the m6g.large in staging for two weeks under load. Memory peaked at 71% — close enough to the limit that he was uncomfortable.

Then he priced the alternative: keep the cache.r6g.large, but buy Reserved Nodes (1-year commitment). From On-Demand $185 to Reserved $120/month. Saving: $65/month without changing the instance type.

"The $65/month I'd save on Reserved Nodes at the same instance size is a real saving," Tom said. "The $54/month I'd save by going to the m6g.large is a false economy if it risks the Friday dinner rush — and it doesn't even save as much. Sometimes right-sizing to a smaller instance risks a performance incident — Reserved Nodes give us more savings with none of the risk."

He purchased the Reserved Nodes for the r6g.large.

"When the safer option also saves more," Tom said, "it isn't even a trade-off."

**RDS Backup Retention: The Storage Trade-Off**

RDS automated backups are stored in S3 (at no additional charge for storage up to 100% of your database size). The default retention is 7 days.

For Nimbus's 180GB Aurora database, 7 days of backups was appropriate — they'd been able to restore from backup within that window in testing.

But Tom noticed: they also had manual snapshots from every significant deployment, kept indefinitely.

23 manual snapshots, total 4.1TB of snapshot storage.
Cost: $0.021/GB/month for Aurora backup storage = about $87/month in manual snapshot storage.

They kept the last 3 manual snapshots per environment (production, staging). Deleted the rest — about 1.1TB retained.
Saving: $64/month.

"We were paying $64 a month for insurance we never used," Leo said.

"We were paying for peace of mind," Tom corrected. "The question is: how much peace of mind is worth $64 a month?"

"With a proper disaster recovery plan," Priya said, "you can get the same peace of mind from 7 days of automated backups and 3 manual snapshots."

"Agreed. Now."

**Variation: When Provisioned Backfires**

If your traffic pattern is consistent and predictable, provisioned capacity with Auto Scaling saves 30% over on-demand. But if a new feature launches and your write volume spikes 5x overnight, you'll be throttled before Auto Scaling catches up — Auto Scaling reacts to observed traffic, which means there's a lag. Keeping the on-demand mode for the weeks surrounding a major feature launch is a reasonable trade-off: slightly higher cost, no risk of throttling during a period when you're watching traffic patterns change in real time.

If you eliminate unused read replicas (like Nimbus's legacy PostgreSQL replicas), the savings are immediate and unambiguous — there's no trade-off, because the replicas were providing no value. But if you're tempted to eliminate a read replica that's handling only 2% of traffic, check what happens to the primary when that 2% has nowhere to go during a peak. Some read replicas exist for headroom, not current load.

On the exam, the same logic applies: a steady-baseline workload points to reserved capacity; spiky-and-idle points to on-demand or Serverless.

**The Database Optimization Summary**

| Service                                           | Before     | After    | Monthly Saving |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (Serverless v2 retained after analysis)    | $647       | $647     | $0 (correct model) |
| RDS Read Replicas (unused)                        | $340       | $0       | $340           |
| DynamoDB (On-Demand -> Provisioned + Auto Scaling) | $340       | $230     | $110           |
| ElastiCache (Reserved Nodes)                      | $185       | $120     | $65            |
| Aurora manual snapshots                           | $87        | $23      | $64            |
| RDS Proxy (connection safety)                     | $0         | $88      | -$88           |
| **Total**                                         | **$1,599** | **$1,108** | **$491/month** |

$491 per month in database savings. $5,892 per year.

Tom put this number next to the storage cleanup ($6,200/year), the S3 lifecycle policies from Chapter 23 ($7,800/year), and the Savings Plan savings ($14,200/year).

Total optimization impact to date: $34,092/year.

"That's real runway," Maya said.

"Or several serious experiments," Priya said.

"Or twelve months of experiments," Leo said.

All three were correct.

## Strengths and Limitations

**DynamoDB Provisioned with Auto Scaling**:

- Cheaper than on-demand for predictable, consistent workloads
- Auto Scaling handles variability without over-provisioning permanently
- Requires monitoring to ensure capacity bounds remain appropriate

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Significant savings for stable, long-running workloads
- Locked commitment — if your needs change, you've paid for unused capacity
- Unlike EC2 Standard RIs, RDS RIs **cannot** be resold on the Reserved Instance Marketplace — the Marketplace is EC2-only. An unused RDS RI is sunk cost, which makes the sizing decision matter more

**The general principle**:

- Always understand utilization before optimizing — use p95, not average
- Unused resources (like the legacy read replicas) are the highest-return optimization
- Right-sizing requires validating in staging before applying to production, and checking for seasonal workload patterns that may not appear in a standard observation window
- Reserved pricing requires confidence in workload stability

## Summary

The database audit closed a $491-a-month gap without ever touching the engine — the savings came from the trunk: idle replicas, forgotten snapshots, and capacity priced for traffic patterns Nimbus had outgrown. Tom's discipline held through every line item: understand the workload first, then optimize. The one new expense, RDS Proxy, was insurance the Friday-night connection numbers said they needed.

- **Audit first**: Pull CloudWatch metrics before making any database changes. Use p95 latency and p95 CPU — not averages. Check FreeableMemory and connection maximums.
- **Delete unused resources**: Read replicas, idle databases, and test instances that are no longer needed.
- **Watch your connection pool**: Set alarms on DatabaseConnections at 75% and 90% of limit. Consider RDS Proxy for connection multiplexing.
- **DynamoDB On-Demand vs Provisioned**: On-Demand for unpredictable traffic; Provisioned + Auto Scaling for consistent patterns.
- **ElastiCache right-sizing**: Test in staging under realistic peak loads, including seasonal peaks. Reserved Nodes offer savings at the same instance size when aggressive downsizing carries risk.
- **RDS snapshot management**: Keep only the snapshots you need. Manual snapshots are stored indefinitely unless deleted.

## Exam Tips

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.3)*

- **DynamoDB pricing modes**: On-Demand = pay per request (higher per-unit cost, no minimum). Provisioned = pay per capacity unit per hour (lower per-unit cost, must allocate capacity). **DynamoDB Auto Scaling** adjusts provisioned capacity automatically.
- **RDS Reserved Instances**: Available for all RDS engine types. Multi-AZ deployments can use Reserved Instances (you commit to Multi-AZ). 1- or 3-year term.
- **ElastiCache Reserved Nodes**: Same commitment model as EC2 Reserved Instances. Applied per node, not per cluster.
- **RDS snapshot storage**: Automated backups are free up to 100% of database size. Manual snapshots charged per GB per month in S3. Exam scenario: "reduce RDS storage costs" → delete old manual snapshots.
- **DynamoDB reserved capacity**: Available for DynamoDB as well (committed to a specific read/write capacity for 1 or 3 years at a discount). Different from standard provisioned — you pre-pay for capacity across all your DynamoDB tables in a region.
- **Aurora Serverless v2 vs provisioned**: Serverless v2 scales automatically, ideal for variable workloads. Provisioned with Reserved Instances is cheaper for stable, predictable workloads.

## Exercises

**Exercise 1 — Recall**

Explain when you should use DynamoDB on-demand capacity versus provisioned capacity with Auto Scaling. What information do you need to make this decision?

*(Hint: Think of the car engine — committing to provisioned capacity without traffic data is the oil change you skip, while staying on on-demand after 18 months of predictable patterns is paying for a tune-up you don't need.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company runs a DynamoDB table for a mobile game's leaderboard. Traffic is very consistent year-round, except during a seasonal event that is scheduled months in advance (one week per quarter, reaching 10x normal traffic as players join over the first day). The company's priority is minimizing database costs during the long, predictable steady-state periods while maintaining performance through the known event weeks.

Which DynamoDB capacity strategy BEST meets these requirements?

A) On-demand capacity to handle the seasonal peaks without throttling  
B) Provisioned capacity set at peak seasonal levels (always provisioned for 10x traffic)  
C) Provisioned capacity with DynamoDB Auto Scaling, with a maximum capacity set for the seasonal peak  
D) DynamoDB reserved capacity units for 3 years at normal traffic levels

**Hint 1**: "Very consistent traffic except for a scheduled, known seasonal peak" — which mode handles both efficiently? (On-demand's strength is *unpredictable* traffic; this traffic is predictable.)

**Hint 2**: "Minimize costs" during off-peak means you can't over-provision for 10x all the time.

**Hint 3**: DynamoDB Auto Scaling can scale up for the seasonal event and scale back down afterward.

**Answer**: C

**Explanation**: Provisioned capacity with Auto Scaling scales the table based on actual traffic. During normal periods, capacity is at normal levels (low cost). During the seasonal event — whose dates are known in advance and whose traffic builds gradually over the first day — Auto Scaling tracks the increase up to the maximum configured level (handling the 10x peak), and the team can also raise the minimum ahead of the scheduled start as extra headroom. After the event, capacity scales back down. This is cheaper than on-demand during the steady-state that dominates the year (on-demand costs more per request) and cheaper than always provisioning for 10x.

**Why not A?** On-demand handles peaks without throttling, but its strength is *unpredictable* traffic. Here the traffic is very consistent and the peak is scheduled and gradual — paying the on-demand per-request premium for the ~92% of the year that is steady-state contradicts the stated priority of minimizing costs during normal periods.

**Why not B?** Provisioning at 10x permanently means ~90% of the provisioned capacity sits unused for ~92% of the year — paying for capacity that's never used.

**Why not D?** Reserved capacity units lock you to normal traffic levels. During the 10x seasonal event, you'd be throttled beyond the reserved amount, or you'd need to add on-demand on top.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.3*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is evaluating a new feature: a restaurant analytics dashboard that shows real-time order counts, revenue per hour, and customer demographics. This data would query a database approximately 200 times per minute (one query per analyst per page refresh, with 10 analysts).

Currently the analytics data is in Athena (S3). Should they build the dashboard on Athena, or should they load the data into a database? If a database, which one (Aurora, DynamoDB, Redshift)?

Consider: query frequency, data freshness requirements, query complexity (aggregations, joins), and cost per query at this volume.

*(There is no single correct answer. The goal is to practice database selection for analytics workloads.)*

## Post-Credits Scene

Tom presented the full cost optimization summary to Maya.

Three months of work. $34,092 in annual savings identified, most of it already implemented.

"What's the remaining?" Maya asked.

"Optimizations I'm not confident about yet," Tom said. "The Aurora configuration could maybe be further right-sized, but I want one more quarter of data before committing. And there's a data transfer question I haven't fully analyzed."

"The networking costs."

"Yes. That's next."

Maya looked at the numbers. "Tom, I want to understand something. This optimization — you've been at it for three months. That's a significant part of your time."

"Roughly 30%."

"And you found about $34,000 per year. So the optimization pays for itself in — what, a few months of your salary?"

Tom looked at her. "About that."

"And every year after, it's pure savings."

"Or pure reinvestment," he said. "Same effect."

Maya nodded. "This is what I want you doing. Not just on storage and databases — on everything. Make cost optimization a continuous function of your role."

Tom had never heard his job described this way. He found it both accurate and satisfying.

In the next chapter: the last remaining cost category — and the one that surprises almost everyone.
