# Chapter 26: Making Sense of Everything

Tom was staring at a printout.

It was two pages of numbers: order counts, revenue totals, timestamps, region codes. He'd asked Leo to pull together everything available about Friday's order patterns. Leo had spent an hour writing a script that joined three different data sources — DynamoDB, CloudWatch logs, and an S3 analytics export — and this was what came out.

The numbers were all there. They told him nothing.

He could see that 847 orders had been placed on Friday. He could not tell when they were placed, which restaurants had been busiest, or what the peak hour was. That information was in the data. It was just invisible.

---

All the network optimization from chapter 25 had made Nimbus's infrastructure faster and cheaper. But the data that infrastructure was generating — in DynamoDB, in CloudWatch logs, in the S3 analytics export that ran once a night — was sitting in three different places, in three different formats, unconnected to anything Tom could actually use.

Maya's question made it concrete. "What's our busiest order time on Fridays?"

Leo looked at her. "That's not in our dashboard."

"Can we add it?"

"The data is in DynamoDB. And in CloudWatch logs. And in S3 from the analytics export job." Leo paused. "In three different places, in three different formats."

Maya added: "And the analytics export only runs once a night. If you want Friday data, you'd have to wait until Saturday morning."

Tom looked at the printout. "So we have the data. We just can't use it."

That sentence describes half of modern analytics.

---

**The Whiteboard**

Maya arrived at the office early and had already filled half the whiteboard by the time Leo arrived.

Seven questions, written in two columns, all of them business questions, none of them answerable from the current dashboards:

1. Which restaurants have the highest order cancellation rate in the first 30 days?
2. What is the average time between a restaurant receiving an order notification and confirming it? How does this vary by restaurant and by day of week?
3. Which cities have the highest rate of customers reordering from the same restaurant within 14 days?
4. What percentage of orders are placed within the app's first session vs. return sessions?
5. Which menu categories drive the highest revenue per restaurant?
6. What is the correlation between restaurant response time and customer reorder rate?
7. How does order volume change in the 48 hours before and after a restaurant partner posts on social media?

"Can we answer any of these?" she asked.

Leo looked at the list. He looked at the current dashboard — order count, revenue total, active restaurants.

"Number one," he said slowly. "Partially. We have cancellation records. But we'd need to join them to restaurant onboarding dates, and that's in a different system."

"Number two?" Tom asked.

"We store the notification timestamp. We store the confirmation timestamp. They're in different tables in different formats. We'd need to JOIN them and calculate the delta."

"So the data exists," Maya said.

"The data exists," Leo confirmed. "We just have no way to query across it."

"Wait — but *why* can't we just query the database?" Maya asked. "We have PostgreSQL. We have all this data."

"Because the data is in three places," Leo said. "Order events are in DynamoDB. Notification timestamps are in CloudWatch logs. Onboarding dates are in the RDS PostgreSQL database. And some of it — the analytics exports — is in S3 as JSON files that nobody has ever joined to anything."

Tom looked at the whiteboard. "We've been generating this data for 18 months," he said. "We've been flying blind for 18 months."

"Not blind," Maya said. "Just nearsighted. We could see what was immediately in front of us. We couldn't see patterns."

That was the right framing. The individual data points were there. The system to connect them was not.

**Three Different Problems**

Nimbus's data problem had three dimensions:

**Real-time streaming**: Orders are being placed right now. You want to see a live dashboard of order velocity — how many per minute, by region, by restaurant. The data needs to be processed as it arrives.

**Data transformation**: The data is in S3 from various systems, in different formats (JSON, CSV, Parquet). Before you can analyze it, you need to normalize it — same schema, same format, cleaned up, joined with reference data.

**Ad-hoc analysis**: Once the data is organized, you want to run SQL queries against it without having to load it into a database first. "Give me the top 10 restaurants by revenue in the last 30 days." Without loading the data into a database.

Each of these is a distinct problem. AWS has a dedicated service for each.

**The Real-Time Stream: A Ticker Tape for Data**

Imagine a ticker tape machine — the kind that printed stock prices on a continuous roll of paper. Prices were printed as they changed. Everyone who wanted the current price could read the tape. Nobody had to wait for anyone else; the tape kept printing regardless of how many people were reading it.

That's the model for real-time data streaming. Producers send data as it happens. Multiple consumers can read the stream simultaneously, each at their own pace, each getting the full picture.

**Amazon Kinesis Data Streams** is that machine for Nimbus. When an order is placed, the application publishes an event to a Kinesis stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consumers of this stream:

- A real-time dashboard (reads events as they arrive, updates metrics)
- A fraud detection Lambda (looks for unusual order patterns)
- A stream to S3 for permanent storage

**Kinesis Data Streams concepts**:

- **Shard**: The basic unit of capacity. One shard handles 1 MB/s write, 2 MB/s read.
- **Retention period**: Data stays in the stream for 24 hours (default), extendable to **365 days** (1 year) with Extended Data Retention.
- **Sequence number**: Each record has a sequence number. Consumers track their position in the stream.

**Amazon Data Firehose** (formerly **Kinesis Data Firehose**): The managed delivery service between streaming producers and destinations such as S3, Redshift, and OpenSearch. It buffers, compresses, transforms, and delivers data automatically.

For Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet format, compressed, partitioned by date).

"I already deployed it — oh." Leo had set the shard count to one without calculating the write throughput first. At Nimbus's order volume, one shard was fine. He confirmed this before anyone noticed he'd guessed.

**The Translator: Making Sense of Raw Data**

Data in S3 is raw. Before you can analyze it efficiently, you need to discover what's there, transform it into a consistent format, join different datasets together, and handle bad records and missing values.

That's a job for a dedicated translation layer.

**AWS Glue** is a fully managed ETL (Extract, Transform, Load) service. It has two main components:

**Glue Data Catalog**: A metadata store that describes your S3 data — what tables exist, what columns they have, where the data files are. It's like a card catalog for your data lake.

**Glue Crawlers**: Automated agents that scan S3, infer the schema, and populate the Data Catalog. Run a crawler on your S3 bucket and 10 minutes later you have a catalog of all your tables.

**Glue Jobs**: Serverless Spark/Python jobs that perform the actual transformation. You write the transformation logic (or use Glue's visual ETL tool), and Glue runs it on managed infrastructure.

For Nimbus:

1. Glue Crawler scans the orders data in S3 → creates a table definition in the Glue Data Catalog
2. Glue Job transforms the raw JSON order events into a clean, partitioned Parquet format
3. The transformed data is written back to S3 in a query-optimized layout

**When ETL Breaks: The Schema Evolution Problem**

The Glue pipeline ran cleanly for the first three weeks. Then restaurant partner #412 added a new field to their menu export: `allergen_tags`. The field was an array of strings — `["gluten", "dairy", "nuts"]` — and it appeared in the restaurant's nightly data export.

The Glue job's schema was strict. It had been written to expect specific fields in the order JSON. When it encountered `allergen_tags` — a field not in the schema — the Glue job failed.

Six hours of order data from 47 restaurants (all using the same menu export format as partner #412) accumulated in S3 without being processed. The nightly Glue run that was supposed to make last night's orders queryable by morning had instead stopped at 2:47 AM and written a failure record to CloudWatch.

Tom found it when he tried to run an Athena query at 9 AM and got `0 rows returned` for the previous 12 hours.

"The ETL broke because the source data changed?" Maya asked, when Leo explained what had happened.

"The ETL broke because the ETL didn't know how to handle a schema change," Leo said. "We wrote a strict job that expected exactly these fields. When a new field appeared, it panicked."

"And what if someone tries to break in through a schema change?" Priya asked. "A malicious restaurant partner deliberately submitting unexpected fields to crash the pipeline?"

The question was worth considering. An ETL pipeline that crashes on unexpected input is a denial-of-service vector: submit an unusual data format, crash the pipeline, and that restaurant (and all others sharing the format) stops processing.

The fix had two parts:

**Glue schema evolution**: Glue's dynamic frame supports schema evolution — fields not in the expected schema are passed through rather than causing failures. Enable it by using DynamicFrames instead of DataFrames in the job script, with `mergeSchema` set in the additional options. New fields are added to the schema automatically on the next crawler run.

```python
# Before (strict, breaks on new fields)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# After (schema evolution enabled)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Glue job alerting**: The pipeline failure was silent for about six hours before Tom noticed. A CloudWatch alarm on the Glue job run state (`FAILED`) would have alerted the on-call engineer within 5 minutes. The alarm cost: ten cents a month — effectively free (the metric itself costs nothing, and the first ten alarms fall under the free tier).

"Six hours of data sat unprocessed in S3," Leo said, after re-running the Glue job manually to catch up. "Nothing was lost — but the analytics were that far behind. If we'd had the alarm, the delay would have been 30 minutes."

The broader lesson: ETL pipelines that process external data need to handle schema changes gracefully. External partners — restaurants, payment providers, delivery services — will change their data formats. The pipeline must not be brittle to those changes.

**The Query Layer: SQL Directly on S3**

Now the data was in S3, in Parquet format, partitioned by date. The final piece: a way to ask questions of it without loading it into a database first.

**Amazon Athena** is a serverless, interactive query service that runs SQL queries directly on S3 data. No database to provision, no data to load. You define a table (or use the Glue Data Catalog), write SQL, and Athena executes the query against the S3 files.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Athena pricing is based on how much data a query scans. In us-east-1, us-west-2, and most major regions, standard SQL queries cost $5 per terabyte scanned. Using Parquet format (columnar) with partition pruning (`WHERE year='2024' AND month='09'`) means Athena only scans the files it needs, which dramatically reduces cost.

"We can run this query for 30 days of data," Leo said, "and it may cost surprisingly little if we store it well."

"How can it cost so little?" Maya asked. "If it's scanning terabytes of data, how is that not expensive?"

Leo explained Parquet. In a row-based format (JSON, CSV), a query looking for two columns out of twenty has to read all twenty. In a columnar format like Parquet, it reads only the two it needs. For a 50TB dataset, a well-optimized query might scan 200GB. At $5/TB, that's one dollar.

"And what if someone queries the whole table by accident?" Maya pressed.

"That's the real cost risk," Leo said.

You might be wondering: if Athena charges per terabyte scanned, could one badly written query generate a large unexpected bill? Yes — and this happens in real production environments. A query against a 50TB unoptimized table can cost more than your entire monthly S3 bill. This is why Parquet format and partitioning are not optional optimizations — they are the cost controls. Athena also supports workgroup query scan limits that cap how much data a single query is allowed to scan.

"For any arbitrary question we can think of?" Tom asked.

"Any question we can express in SQL, against any data we've stored in S3."

Tom sat down at Leo's laptop and wrote the first query:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

The query ran for 11 seconds. The result: 20 restaurants, sorted by fastest average confirmation time, with their reorder rates alongside.

Tom stared at the output.

The fastest-confirming restaurants — those that acknowledged and confirmed orders within an average of 3-4 minutes — had an average reorder rate of 41%. The slowest-confirming restaurants (average confirmation time 18-22 minutes) had a reorder rate of 13%.

"The restaurants that confirm quickly get three times the repeat business," Tom said.

"That's a huge gap," Maya said. "Why would confirmation speed affect reorder rate so much?"

"Because the customer placed an order and then sat there watching their phone," Leo said. "If the confirmation comes in 3 minutes, they feel certain. If it comes in 22 minutes — or never — they feel anxious. The anxiety is the product failure, even if the food arrives fine."

"This is a product insight," Maya said. "Not just an analytics insight. We should show restaurants their confirmation time benchmark compared to the category average."

The Athena query had scanned 1.2 GB of data (two months of orders in Parquet format, partitioned by year and month). Cost: $0.006.

Half a cent. For a business insight that changed how Nimbus would design restaurant onboarding — which restaurants to prioritize for success coaching, what confirmation time targets to set as part of partner SLAs.

Tom had the look of someone recalculating the value of all the data they'd been throwing away.

"And what if someone tries to break in through the query layer?" Priya asked. "Or just an analyst who accidentally exports customer addresses from the raw order data? Customer PII, order histories, financial records — who controls what tables are even visible?"

Before she finished the question, Leo had also realized the operational problem: how do you stop one team from running a catastrophic full-table scan that generates a $500 Athena bill in a single query?

**Athena Workgroups** solve both problems simultaneously.

A workgroup is a named configuration that groups Athena users and applies shared settings: query result location, encryption, and — critically — per-query data scan limits.

```
Workgroup: analytics-team
  Query scan limit: 10 GB per query
  Action on limit exceeded: Cancel query

Workgroup: engineering-team
  Query scan limit: 100 GB per query
  Action on limit exceeded: Warn only

Workgroup: finance-reports
  Query scan limit: 1 GB per query
  Action on limit exceeded: Cancel query
```

An analyst on the `analytics-team` workgroup cannot accidentally scan 50TB of data and generate a $250 Athena charge. The query is cancelled when it would exceed 10GB of data scanned. The analyst sees an error message and knows they need to add a partition filter.

Workgroups also enforce separate result locations per team: the engineering team's query results go to `s3://nimbus-query-results/engineering/`; the finance team's results go to `s3://nimbus-query-results/finance/`. No cross-team query result access.

IAM controls which users can use which workgroup. A Lambda function running automated reports uses the `finance-reports` workgroup (tightly capped). An engineer debugging a production issue uses the `engineering-team` workgroup (wider cap, warn not cancel). Access to the raw events table (containing customer PII) is restricted to the `engineering-team` workgroup through an IAM condition on the Glue Data Catalog table.

"That's not just cost control," Priya said. "That's access control. Workgroups are the enforcement point."

It answered her question in full. Every data pipeline discussion that skips access control eventually becomes a compliance incident — and here, the analytics team saw only aggregated order tables, while the raw events with customer PII stayed behind an explicit IAM authorization. The Glue Data Catalog wasn't just a schema directory. It was an access control boundary.

"That's not extra work," Priya said. "That's the design."

**The Data Lake Architecture**

These three services combine into what's called a **data lake architecture** — a centralized S3 repository for all your data, with tools for processing and querying it:

```
Applications (orders, menus, events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler discovers schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform
                                                   ↓
                                              S3 (clean, Parquet, partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight, Tableau, etc.)
```

The raw data is always preserved (in the original S3 bucket). The transformed data is queryable via Athena. New questions can always be answered by running new Glue jobs on the raw data.

**Amazon Redshift: When Athena Isn't Enough**

For some use cases, Athena is too slow or too expensive:

- Very complex queries with many joins
- Dashboards that run the same query thousands of times per day
- Machine learning on structured data
- Sub-second response time requirements for BI tools

**Amazon Redshift** is a fully managed data warehouse: a columnar analytics database designed for large, repeated analytical workloads. Unlike Athena, which queries data where it lives in S3, Redshift loads data into optimized warehouse storage and uses query optimization, sort strategies, and distribution strategies to accelerate complex analytics.

If your data volume is small and your queries run infrequently (weekly or monthly), Athena with well-organized S3 data is sufficient and nearly free — but if you run the same analytical dashboards hundreds of times per day, Redshift's pre-optimized columnar storage will be faster and ultimately more cost-effective, despite requiring data to be loaded in advance.

Redshift is significantly faster for complex analytics queries at the expense of cost (provisioned capacity) and the requirement to load data before querying.

**Redshift Serverless** removes the capacity planning burden — you query, Redshift scales. Cost is based on compute capacity actually used, measured in **RPU-hours** and billed per second (with a 60-second minimum per activation), plus managed storage per GB-month — and nothing for compute while the warehouse sits idle. (Athena is the one priced per query: $5 per TB scanned.)

For Nimbus at their current scale: Athena is sufficient. At five times the data volume and with BI tools querying the same dashboards hundreds of times per day, Redshift would become cost-effective.

**When Athena Is the Wrong Tool**

"So what's the catch?" Maya asked. "Why wouldn't we use Athena for everything? It's serverless, pay per query, no infrastructure — it sounds perfect."

The cases where Athena is not the right answer:

**High-frequency dashboards**: A customer-facing analytics dashboard that refreshes every 30 seconds and runs 50 queries per minute is not a good Athena use case. At $5/TB scanned, those queries need to be extremely well-optimized to be cost-effective at that frequency. Redshift or a pre-aggregated database (even RDS) is more appropriate for dashboards with sub-second response time requirements.

**Operational queries with low latency requirements**: If a customer service agent needs to look up a specific order in under 500ms, Athena is not the tool — a DynamoDB lookup or an RDS query is. Athena is optimized for analytical throughput, not operational latency. Even a well-tuned Athena query on a small dataset has a cold-start overhead of 1-3 seconds.

**Transactional systems**: Athena is read-only. You cannot INSERT, UPDATE, or DELETE records in Athena (except through specific integrations like Lake Formation or Iceberg table format, which have their own complexity). For operational write workloads, use a transactional database.

**Very small, frequently changing datasets**: If your dataset changes every minute and is only 1GB, loading it into RDS or DynamoDB and querying there is simpler and faster than running Athena queries against S3 files that might be stale. Athena queries S3 files as-of the time of the query — if the files were written 2 minutes ago, that's the freshness you get.

The pattern that emerges: Athena is excellent for large-scale, infrequent, ad-hoc analytical queries against S3 data. For anything operational, transactional, or requiring sub-second latency, use the appropriate operational database.

**Kinesis vs SQS: Clearing Up the Confusion**

This is the question that comes up on every data architecture discussion. Kinesis and SQS both deal with messages. When do you use each?

The confusion comes from the surface-level similarity: both accept messages from producers. Both deliver those messages to consumers. Both are managed AWS services. But their data models are fundamentally different.

**SQS (Simple Queue Service)** is a task queue. You put a message in. One consumer gets it out and processes it. When processing is complete, the message is deleted. If you have ten consumers, each message goes to exactly one of them. The message is gone after consumption.

**Kinesis Data Streams** is a log. You put a record in. Every consumer reads every record. Consumer A reads all of them. Consumer B also reads all of them, at its own pace. Neither consumer deletes the record — it stays in the stream until the retention period expires. You can add a third consumer at any time, and it can read from the beginning of the stream (within the retention window).

"When would you actually want every consumer to see every message?" Maya asked.

The answer is the use cases where Kinesis shines:

**Real-time dashboard + fraud detection + S3 archive**: All three consume the same order events stream simultaneously. If you used SQS, you'd need to publish to three separate queues — and whoever publishes must know about all three consumers. With Kinesis, the producer publishes once; any number of consumers can read independently.

**Replay**: A consumer fails for 2 hours (Lambda concurrency limit hit, downstream service down). With SQS, those messages were already deleted (or have a defined visibility timeout). With Kinesis, the consumer resumes from its last checkpoint and processes the 2 hours of missed records. The data was retained in the stream (up to 365 days with Extended Data Retention).

**Order within a shard**: Records with the same partition key always go to the same shard, preserving order. For a stock trading system where you need all trades for symbol `AMZN` to be processed in sequence, Kinesis guarantees this. SQS FIFO provides per-group ordering but at lower throughput (up to 3,000 messages/second per queue with batching in standard mode — high-throughput mode raises this to tens of thousands — vs. Kinesis's 1 MB/s or 1,000 records/s per shard, multiplied by as many shards as you need).

The decisive question: **Does every message need to be consumed by exactly one consumer and then discarded?** → SQS. **Does each message need to be seen by multiple consumers independently, or do you need replay capability?** → Kinesis.

For Nimbus's real-time dashboard: Kinesis. Multiple consumers (dashboard, fraud detection, S3 archive) all reading the same stream.

For Nimbus's order processing queue (an order placed → one ECS task processes it): SQS. One consumer, no replay needed, no fan-out required.

## Visualizing the Data: Amazon QuickSight

Athena queries the data. Glue prepares it. But at some point someone needs to see a chart — and not by running SQL queries in the console.

"Do we really need another service for that?" Maya asked. "Can't I just export the Athena results to a spreadsheet?"

"For one query, yes," Tom said. He had the look of someone who had already tried this. "For a dashboard you want to share with the whole team, that's a new spreadsheet every morning."

**Amazon QuickSight** is AWS's managed business intelligence (BI) service. It connects directly to Athena, S3, RDS, Redshift, and other sources, and lets you build dashboards and visualizations without a separate BI server.

Key features:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight can import datasets into its in-memory engine for sub-second query performance at scale, without re-querying Athena on every dashboard load
- **ML Insights:** anomaly detection and forecasting built in — no data science required
- **Embedded dashboards:** you can embed QuickSight dashboards into your own web application via a URL

Tom connected QuickSight to the Athena data source and had a working dashboard showing daily orders, revenue by restaurant, and the conversion funnel within an afternoon.

"How much does that cost per month?" he asked — then answered his own question before anyone else could. "QuickSight runs about $24/month per author — the people building dashboards — and $3/month per reader. We have four people who'd use it."

"So around a hundred dollars a month," Maya said.

"For a BI service that would otherwise require running a separate analytics server," Priya said. "Yes."

Tom published the dashboard. The next morning, instead of running Athena queries, the whole team opened a URL.

> **Exam Tip — QuickSight**
>
> QuickSight is AWS's managed BI and visualization service. Connects to Athena, S3, Redshift, RDS. SPICE is the in-memory query engine that accelerates repeated dashboard queries. Exam trigger: "business intelligence dashboard on AWS" or "visualize data from Athena/Redshift" → QuickSight.

## Governing the Lake: AWS Lake Formation

As Nimbus's data lake grew, data access became a governance problem.

"Who can query the raw transaction logs?" Priya asked, at the next architecture review. "Who can see customer PII? Who can access the financial summary tables?"

"Engineering has full access," Leo said. "The analytics team has access to the aggregated tables. Finance has access to the revenue tables."

"Configured where?"

Leo paused. "In... a few different places. The S3 bucket policies, the IAM policies, the Glue catalog permissions."

"Three separate systems, all of which have to be consistent," Priya said. "What happens when we add a new analyst? Or when we decide to restrict access to a specific column — say, customer phone numbers — from the analytics team?"

That question exposed the gap. Managing fine-grained data access across S3 bucket policies, IAM, and the Glue Data Catalog simultaneously was brittle.

**AWS Lake Formation** is a managed service that centralizes access control for your data lake. Instead of managing bucket policies, IAM policies, and Glue catalog permissions separately, Lake Formation provides a single place to grant column-level, row-level, and table-level permissions on your data.

Key features:

- Sits on top of S3 and the Glue Data Catalog — no data migration required
- **Fine-grained access control:** grant specific users or roles access to specific tables, columns, or even filtered rows — the equivalent of database-level permissions on S3 data
- **Data filtering:** when a user queries a Lake Formation-governed table via Athena, Lake Formation automatically filters out columns or rows they are not allowed to see

Priya set up Lake Formation with three permission tiers, with Rafael drafting the column-level rules: the engineering role saw all tables and all columns. The analytics role saw the aggregated order tables but not customer PII columns. The finance role saw revenue tables with customer identifiers masked.

"So the analyst runs the same Athena query," Leo confirmed. "But Lake Formation intercepts it and strips the columns they're not authorized to see?"

"Correct. The filtering is automatic. The analyst doesn't need to know it's happening — and they can't work around it by querying the raw S3 files directly, because Lake Formation controls access at the catalog level."

"Same principle," Priya said. "The control isn't bolted on — it's the design."

> **Exam Tip — Lake Formation**
>
> Lake Formation centralizes access control for a data lake built on S3 and the Glue Data Catalog. Supports fine-grained permissions at the table, column, and row level. Exam trigger: "restrict access to specific columns in an S3 data lake" or "centralize data lake governance" → Lake Formation. The key distinction from raw IAM: Lake Formation enforces column- and row-level filtering that IAM policies alone cannot express.

## Strengths and Limitations

**Kinesis Data Streams**: Use Kinesis when your data arrives continuously and order matters — clickstreams, financial transactions, IoT telemetry. Kinesis preserves record order within a shard and allows replay during the configured retention window (24 hours by default, up to 365 days with Extended Data Retention), which makes it fundamentally different from SQS. The trade-off is operational complexity: in provisioned mode, you manage shard capacity and consumer behavior. For simple task queues where order doesn't matter and replay isn't needed, SQS is the simpler choice.

**AWS Glue**: Glue eliminates the infrastructure of a traditional ETL cluster. You write the transform logic; AWS manages the Spark environment. This is valuable when transforms are complex or data volumes are large. The limitation is cost and cold start — Glue jobs have a startup delay of several minutes, making them unsuitable for near-real-time transforms. For simple file format conversions (CSV to Parquet), the overhead of Glue may not be worth it compared to a Lambda function or a lightweight script.

**Amazon Athena**: Athena lets you query S3 data with standard SQL and no infrastructure to manage. The critical constraint is cost: Athena charges per terabyte of data scanned. A query against a 10 TB table that scans the whole thing costs significantly more than the same query against a Parquet-formatted, partitioned table that scans 200 GB. Always use columnar formats (Parquet or ORC) and partition your data before running Athena in production. Without these optimizations, Athena bills can surprise you.

## Summary

The network work in chapter 25 made Nimbus's data pipeline possible. This chapter is what that pipeline is for: making all the data Nimbus has been generating actually visible and actionable.

- **Amazon Kinesis**: Real-time data streaming. Producers write records; consumers read at their own pace. Amazon Data Firehose can then deliver streaming data to S3, Redshift, and other destinations with less operational work.
- **AWS Glue**: ETL and data cataloging. Crawlers discover schemas; Jobs transform data; Data Catalog makes data discoverable by Athena and other tools.
- **Amazon Athena**: Serverless SQL on S3. Query any data in S3 using standard SQL. Priced per TB scanned — use Parquet and partitioning to minimize cost.
- **Amazon Redshift**: Managed data warehouse for high-performance analytics. Load data in, optimize for repeated analytical queries, and query fast at warehouse scale.
- The **data lake pattern**: raw data to S3 → Glue transforms it → Athena queries it → BI tools visualize it.
- **Glue schema evolution**: ETL pipelines that process external data must handle schema changes gracefully. Use DynamicFrames with `mergeSchema: true` to avoid pipeline failures when upstream data adds new fields.
- **Athena Workgroups**: per-team data scan limits and result locations. Cost control and access control in one configuration. Required for any multi-team Athena deployment.
- **Kinesis vs SQS**: Kinesis for fan-out to multiple consumers and replay capability. SQS Standard for simple task queues; SQS FIFO for ordered, deduplicated task processing. The deciding question: does every consumer need to see every message, or does each message go to one consumer?
- **When Athena is wrong**: high-frequency dashboards (use Redshift), operational queries (use RDS or DynamoDB), very small frequently changing datasets (just use a database).
- **Amazon QuickSight**: AWS's managed BI service. Connects to Athena, S3, Redshift, and RDS to build dashboards without running a separate BI server. SPICE is the in-memory engine that accelerates repeated dashboard queries.
- **AWS Lake Formation**: Centralized access control for data lakes on S3 + Glue Data Catalog. Enables column-level, row-level, and table-level permissions — fine-grained data governance that IAM alone cannot express.

## Exam Tips

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = ordered, real-time streaming, multiple consumers, replay within retention window (24 hours default, up to 365 days). SQS = task queue, each message processed once. "Multiple consumers reading the same stream simultaneously" → Kinesis. "One worker per message" → SQS.
- **Athena exam signals**: "serverless SQL on S3," "analyze S3 data without loading it into a database," "pay per query" → Athena.
- **Athena cost optimization**: Columnar format (Parquet or ORC) + partitioning dramatically reduces data scanned and cost. Exam may ask how to reduce Athena costs.
- **Athena pricing**: $5 per TB scanned (us-east-1, us-west-2, and most major regions). Cost is calculated on data scanned, not data returned — always optimize storage format before running production queries.
- **Glue Crawler**: "Discover schema of S3 data automatically" → Glue Crawler.
- **Amazon Data Firehose**: "Automatically load streaming data to S3/Redshift/OpenSearch without managing consumers" → Amazon Data Firehose. Older materials may still call it Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift for high-frequency, complex queries on a fixed dataset (BI dashboards). Athena for ad-hoc queries on S3 data that changes frequently.
- **EMR (Elastic MapReduce)**: AWS-managed Hadoop/Spark clusters. Exam uses this when "existing Hadoop/Spark workloads" or "custom data processing frameworks" are mentioned. Glue is the managed alternative for most use cases.
- **QuickSight:** AWS managed BI and visualization. Connects to Athena, S3, Redshift, RDS. SPICE = in-memory engine for fast repeated queries. Exam trigger: "business intelligence dashboard on AWS" → QuickSight.
- **Lake Formation:** Centralized access control for a data lake (S3 + Glue Data Catalog). Fine-grained permissions: table, column, and row level. Exam trigger: "restrict access to specific columns in S3 data lake" or "centralize data lake governance" → Lake Formation.

## Exercises

**Exercise 1 — Recall**

Explain the difference between Amazon Kinesis and Amazon SQS. When would you use each?

*(Hint: Think about how many consumers can read the same data, whether messages are deleted after reading, and whether order matters.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A ride-sharing company wants to analyze trip data. 1 million trips are completed daily. Trip records are stored in S3 as JSON files (approximately 2KB each). The analytics team wants to run ad-hoc SQL queries like "average trip duration by city last week." Queries should complete in under 2 minutes. Storage costs should be minimized. The team will run 20-30 queries per week.

Which architecture BEST meets these requirements?

A) Use AWS Glue to convert JSON to Parquet format partitioned by date and city; query with Amazon Athena  
B) Load trip data into RDS PostgreSQL daily; query using standard SQL  
C) Use Amazon Data Firehose to deliver trip data to Amazon Redshift; query with Redshift  
D) Load trip data into DynamoDB and use PartiQL for SQL queries

**Hint 1**: 20-30 queries per week is low frequency. Which service is most cost-effective for occasional querying?

**Hint 2**: Parquet format + partitioning dramatically reduces data scanned by Athena — and therefore cost.

**Hint 3**: 1 million trips × 2KB = ~2GB per day. Over a week, ~14GB. At $5/TB for Athena, even without optimization, this is affordable.

**Answer**: A

**Explanation**: Glue converts JSON to Parquet (columnar format dramatically reduces data scanned) partitioned by date and city (partition pruning means "last week" queries only scan 7 days of partitions). Athena queries S3 directly with standard SQL. For 20-30 queries per week, pay-per-query Athena is extremely cost-effective vs always-running Redshift.

**Why not B?** Loading 2GB of data daily into RDS, then querying, requires a database instance running 24/7. For 20-30 queries per week, this is vastly over-engineered and expensive.

**Why not C?** Redshift is cost-effective for high-frequency queries (hundreds per day on the same dataset). For 20-30 queries per week, the always-on Redshift cluster costs far more than Athena's per-query pricing.

**Why not D?** DynamoDB is a key-value/document store optimized for key-based access, not ad-hoc analytical queries. PartiQL on DynamoDB doesn't support the kind of GROUP BY aggregations described.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.5*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus wants to build a real-time fraud detection system for orders. The system should:

- Detect orders placed by the same account more than 5 times in 60 seconds
- Flag orders above $500 from new accounts (< 30 days old)
- Send flagged orders to a human review queue

Design the architecture. What does Kinesis provide? Where does the fraud logic run? How do you correlate "same account, 60-second window"? What service receives the flagged orders?

*(There is no single correct answer. The goal is to practice real-time streaming architecture design.)*

## Post-Credits Scene

Tom ran the first Athena query.

"Top 10 restaurants by revenue last quarter," he said.

12 seconds later, the results appeared.

He stared at them.

"Restaurant 47 was first," he said. It was Maya's family restaurant — the one where Nimbus started.

"Of course it was," Maya said. "Arepa is that good."

Tom ran another query. And another. "How much does that cost per month?" Tom asked before Leo could say anything. Leo checked the query scan history. Three queries, total data scanned: 1.2GB. Cost: less than a cent.

After an hour, Tom had a complete picture of Nimbus's business in a way he'd never had before. Which restaurant categories grew fastest. Which customer cohorts retained the longest. Which menu items drove the most repeat orders.

"Why didn't we build this sooner?" he asked.

"We had the data," Leo said. "We just didn't have the pipeline to use it."

"The data was always there," Maya said quietly. "We just couldn't see it."

In the next chapter: now that we can see the business clearly, let's talk about how to pay for the infrastructure that runs it — more efficiently.
