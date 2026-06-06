# অধ্যায় ২৬: সব কিছু বোঝা

Tom একটি printout-এর দিকে তাকিয়ে ছিল।

এটা ছিল সংখ্যার দুই পৃষ্ঠা: order count, revenue total, timestamp, region code। সে Leo-কে শুক্রবারের order pattern সম্পর্কে উপলব্ধ সব কিছু একত্র করতে বলেছিল। Leo একটি script লিখতে এক ঘণ্টা ব্যয় করেছিল যা তিনটি ভিন্ন data source — DynamoDB, CloudWatch log, এবং একটি S3 analytics export — join করেছিল, এবং এটাই বেরিয়ে এসেছিল।

সংখ্যাগুলি সব সেখানে ছিল। তারা তাকে কিছু বলল না।

সে দেখতে পেল যে শুক্রবার 847টি order দেওয়া হয়েছিল। সে বলতে পারল না কখন সেগুলি দেওয়া হয়েছিল, কোন রেস্তোরাঁ সবচেয়ে ব্যস্ত ছিল, বা peak hour কী ছিল। সেই তথ্য data-তে ছিল। এটা কেবল অদৃশ্য ছিল।

---

অধ্যায় ২৫-এর সমস্ত network optimization Nimbus-এর অবকাঠামোকে দ্রুত এবং সস্তা করেছিল। কিন্তু সেই অবকাঠামো যে data তৈরি করছিল — DynamoDB-তে, CloudWatch log-এ, রাতে একবার চলা S3 analytics export-এ — তিনটি ভিন্ন জায়গায় বসেছিল, তিনটি ভিন্ন format-এ, Tom আসলে ব্যবহার করতে পারে এমন কিছুর সাথে অসংযুক্ত।

Maya-র প্রশ্ন এটা concrete করল। "শুক্রবার আমাদের সবচেয়ে ব্যস্ত order time কী?"

Leo তার দিকে তাকাল। "সেটা আমাদের dashboard-এ নেই।"

"আমরা কি এটা যোগ করতে পারি?"

"Data DynamoDB-তে আছে। এবং CloudWatch log-এ। এবং analytics export job থেকে S3-তে।" Leo থামল। "তিনটি ভিন্ন জায়গায়, তিনটি ভিন্ন format-এ।"

Maya যোগ করল: "এবং analytics export শুধুমাত্র রাতে একবার চলে। আপনি শুক্রবারের data চাইলে, আপনাকে শনিবার সকাল পর্যন্ত অপেক্ষা করতে হবে।"

Tom printout-এর দিকে তাকাল। "তাহলে আমাদের কাছে data আছে। আমরা শুধু এটা ব্যবহার করতে পারি না।"

সেই বাক্যটি আধুনিক analytics-এর অর্ধেক বর্ণনা করে।

---

**Whiteboard**

Maya অফিসে তাড়াতাড়ি পৌঁছেছিল এবং Leo আসার সময় ইতিমধ্যে whiteboard-এর অর্ধেক ভরে ফেলেছিল।

সাতটি প্রশ্ন, দুটি column-এ লেখা, সবগুলি business প্রশ্ন, কোনোটিই বর্তমান dashboard থেকে উত্তরযোগ্য নয়:

1. প্রথম ৩০ দিনে কোন রেস্তোরাঁর সবচেয়ে বেশি order cancellation rate আছে?
2. একটি রেস্তোরাঁ একটি order notification পাওয়া এবং এটা confirm করার মধ্যে গড় সময় কত? এটা রেস্তোরাঁ এবং সপ্তাহের দিন অনুসারে কীভাবে পরিবর্তিত হয়?
3. কোন শহরে গ্রাহকরা ১৪ দিনের মধ্যে একই রেস্তোরাঁ থেকে পুনরায় order করার সর্বোচ্চ হার আছে?
4. কত শতাংশ order অ্যাপের প্রথম session-এ বনাম return session-এ দেওয়া হয়?
5. কোন menu category প্রতি রেস্তোরাঁ সর্বোচ্চ revenue চালিত করে?
6. রেস্তোরাঁর response time এবং গ্রাহকের reorder rate-এর মধ্যে correlation কী?
7. একটি রেস্তোরাঁ partner social media-তে post করার ৪৮ ঘণ্টা আগে এবং পরে order volume কীভাবে পরিবর্তিত হয়?

"আমরা কি এগুলির কোনোটির উত্তর দিতে পারি?" সে জিজ্ঞেস করল।

Leo তালিকার দিকে তাকাল। সে বর্তমান dashboard-এর দিকে তাকাল — order count, revenue total, active রেস্তোরাঁ।

"নম্বর এক," সে ধীরে বলল। "আংশিকভাবে। আমাদের cancellation record আছে। কিন্তু আমাদের সেগুলি রেস্তোরাঁ onboarding date-এর সাথে join করতে হবে, এবং সেটা একটি ভিন্ন system-এ।"

"নম্বর দুই?" Tom জিজ্ঞেস করল।

"আমরা notification timestamp store করি। আমরা confirmation timestamp store করি। সেগুলি ভিন্ন format-এ ভিন্ন table-এ। আমাদের সেগুলি JOIN করতে হবে এবং delta হিসাব করতে হবে।"

"তাহলে data বিদ্যমান," Maya বলল।

"Data বিদ্যমান," Leo নিশ্চিত করল। "আমাদের শুধু এর জুড়ে query করার কোনো উপায় নেই।"

"দাঁড়াও — কিন্তু আমরা কেন কেবল database query করতে পারি না?" Maya জিজ্ঞেস করল। "আমাদের PostgreSQL আছে। আমাদের এই সব data আছে।"

"কারণ data তিনটি জায়গায়," Leo বলল। "Order event DynamoDB-তে। Notification timestamp CloudWatch log-এ। Onboarding date RDS PostgreSQL database-এ। এবং এর কিছু — analytics export — S3-তে JSON file হিসেবে যা কেউ কখনো কিছুর সাথে join করেনি।"

Tom whiteboard-এর দিকে তাকাল। "আমরা ১৮ মাস ধরে এই data তৈরি করছি," সে বলল। "আমরা ১৮ মাস ধরে অন্ধভাবে উড়ছি।"

"অন্ধ নয়," Maya বলল। "কেবল নিকটদৃষ্টিসম্পন্ন। আমরা ঠিক আমাদের সামনে যা ছিল তা দেখতে পেতাম। আমরা pattern দেখতে পেতাম না।"

সেটা সঠিক framing ছিল। পৃথক data point-গুলি সেখানে ছিল। সেগুলি সংযুক্ত করার system ছিল না।

**তিনটি ভিন্ন সমস্যা**

Nimbus-এর data সমস্যার তিনটি মাত্রা ছিল:

**Real-time streaming**: Order এখনই দেওয়া হচ্ছে। আপনি order velocity-র একটি live dashboard দেখতে চান — প্রতি মিনিটে কতগুলি, region অনুসারে, রেস্তোরাঁ অনুসারে। Data আসার সাথে সাথে process করতে হবে।

**Data transformation**: বিভিন্ন system থেকে S3-তে data, ভিন্ন format-এ (JSON, CSV, Parquet)। আপনি এটা বিশ্লেষণ করার আগে, আপনাকে এটা normalize করতে হবে — একই schema, একই format, পরিষ্কার করা, reference data-র সাথে join করা।

**Ad-hoc analysis**: একবার data সংগঠিত হলে, আপনি প্রথমে এটা একটি database-এ load না করে এর বিরুদ্ধে SQL query চালাতে চান। "গত ৩০ দিনে revenue অনুযায়ী শীর্ষ ১০ রেস্তোরাঁ দাও।" data একটি database-এ load না করে।

এগুলির প্রতিটি একটি স্বতন্ত্র সমস্যা। AWS-এর প্রতিটির জন্য একটি dedicated service আছে।

**Real-Time Stream: Data-র জন্য একটি Ticker Tape**

একটি ticker tape machine কল্পনা করুন — যে ধরনের একটি কাগজের ক্রমাগত roll-এ stock price print করত। Price পরিবর্তিত হওয়ার সাথে print হত। যে কেউ বর্তমান price চাইত সে tape পড়তে পারত। কাউকে অন্য কারো জন্য অপেক্ষা করতে হত না; কতজন পড়ছে তা নির্বিশেষে tape print হতে থাকত।

সেটাই real-time data streaming-এর মডেল। Producer-রা যা ঘটে তা পাঠায়। একাধিক consumer একসাথে stream পড়তে পারে, প্রতিটি নিজের গতিতে, প্রতিটি সম্পূর্ণ চিত্র পেয়ে।

**Amazon Kinesis Data Streams** হলো Nimbus-এর জন্য সেই machine। একটি order দেওয়া হলে, application একটি Kinesis stream-এ একটি event publish করে: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`।

এই stream-এর consumer:

- একটি real-time dashboard (event আসার সাথে পড়ে, metric আপডেট করে)
- একটি fraud detection Lambda (অস্বাভাবিক order pattern খোঁজে)
- স্থায়ী storage-এর জন্য S3-তে একটি stream

**Kinesis Data Streams concept**:

- **Shard**: capacity-র মৌলিক ইউনিট। একটি shard 1 MB/s write, 2 MB/s read handle করে।
- **Retention period**: Data stream-এ ২৪ ঘণ্টা (ডিফল্ট) থাকে, Extended Data Retention দিয়ে **365 দিন** (১ বছর) পর্যন্ত বাড়ানো যায়।
- **Sequence number**: প্রতিটি record-এর একটি sequence number আছে। Consumer stream-এ তাদের অবস্থান ট্র্যাক করে।

**Amazon Data Firehose** (পূর্বে **Kinesis Data Firehose**): streaming producer এবং S3, Redshift, এবং OpenSearch-এর মতো destination-এর মধ্যে managed delivery service। এটা স্বয়ংক্রিয়ভাবে buffer, compress, transform, এবং deliver করে।

Nimbus-এর জন্য: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet format, compressed, তারিখ অনুসারে partitioned)।

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo প্রথমে write throughput হিসাব না করে shard count এক-এ সেট করেছিল। Nimbus-এর order volume-এ, একটি shard ঠিক ছিল। সে কেউ লক্ষ্য করার আগে এটা নিশ্চিত করল যে সে অনুমান করেছিল।

**Translator: কাঁচা Data বোঝা**

S3-তে data কাঁচা। আপনি এটা দক্ষতার সাথে বিশ্লেষণ করার আগে, আপনাকে সেখানে কী আছে তা আবিষ্কার করতে হবে, এটা একটি সামঞ্জস্যপূর্ণ format-এ রূপান্তর করতে হবে, বিভিন্ন dataset একসাথে join করতে হবে, এবং খারাপ record এবং অনুপস্থিত value handle করতে হবে।

সেটা একটি dedicated translation layer-এর কাজ।

**AWS Glue** হলো একটি fully managed ETL (Extract, Transform, Load) service। এর দুটি প্রধান উপাদান আছে:

**Glue Data Catalog**: একটি metadata store যা আপনার S3 data বর্ণনা করে — কোন table বিদ্যমান, কোন column আছে, data file কোথায়। এটা আপনার data lake-এর জন্য একটি card catalog-এর মতো।

**Glue Crawler**: স্বয়ংক্রিয় agent যা S3 scan করে, schema অনুমান করে, এবং Data Catalog populate করে। আপনার S3 bucket-এ একটি crawler চালান এবং ১০ মিনিট পরে আপনার সমস্ত table-এর একটি catalog আছে।

**Glue Job**: serverless Spark/Python job যা প্রকৃত transformation সম্পাদন করে। আপনি transformation logic লেখেন (বা Glue-এর visual ETL tool ব্যবহার করেন), এবং Glue managed infrastructure-এ এটা চালায়।

Nimbus-এর জন্য:

1. Glue Crawler S3-তে orders data scan করে → Glue Data Catalog-এ একটি table definition তৈরি করে
2. Glue Job কাঁচা JSON order event-গুলিকে একটি পরিষ্কার, partitioned Parquet format-এ রূপান্তর করে
3. রূপান্তরিত data একটি query-optimized layout-এ S3-তে ফিরে লেখা হয়

**যখন ETL ভাঙে: Schema Evolution সমস্যা**

Glue pipeline প্রথম তিন সপ্তাহ পরিষ্কারভাবে চলল। তারপর রেস্তোরাঁ partner #412 তাদের menu export-এ একটি নতুন field যোগ করল: `allergen_tags`। Field-টি ছিল string-এর একটি array — `["gluten", "dairy", "nuts"]` — এবং এটা রেস্তোরাঁর রাতের data export-এ উপস্থিত হল।

Glue job-এর schema কঠোর ছিল। এটা order JSON-এ নির্দিষ্ট field আশা করতে লেখা হয়েছিল। যখন এটা `allergen_tags` সম্মুখীন হল — schema-তে নেই এমন একটি field — Glue job ব্যর্থ হল।

৪৭টি রেস্তোরাঁ থেকে ছয় ঘণ্টার order data (সবগুলি partner #412-এর মতো একই menu export format ব্যবহার করছে) process না হয়ে S3-তে জমা হল। যে রাতের Glue run গত রাতের order সকালের মধ্যে queryable করার কথা ছিল তা পরিবর্তে রাত ২:৪৭-এ থেমে গিয়েছিল এবং CloudWatch-এ একটি failure record লিখেছিল।

Tom এটা খুঁজে পেল যখন সে সকাল ৯টায় একটি Athena query চালানোর চেষ্টা করল এবং পূর্ববর্তী ১২ ঘণ্টার জন্য `0 rows returned` পেল।

"ETL ভেঙেছে কারণ source data পরিবর্তিত হয়েছে?" Leo কী ঘটেছিল ব্যাখ্যা করলে Maya জিজ্ঞেস করল।

"ETL ভেঙেছে কারণ ETL জানত না কীভাবে একটি schema পরিবর্তন handle করতে হয়," Leo বলল। "আমরা একটি কঠোর job লিখেছিলাম যা ঠিক এই field আশা করেছিল। একটি নতুন field উপস্থিত হলে, এটা আতঙ্কিত হল।"

"এবং কেউ যদি একটি schema পরিবর্তনের মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "একজন malicious রেস্তোরাঁ partner ইচ্ছাকৃতভাবে pipeline crash করতে অপ্রত্যাশিত field জমা দেয়?"

প্রশ্নটি বিবেচনার যোগ্য ছিল। একটি ETL pipeline যা অপ্রত্যাশিত input-এ crash করে তা একটি denial-of-service vector: একটি অস্বাভাবিক data format জমা দিন, pipeline crash করুন, এবং সেই রেস্তোরাঁ (এবং format শেয়ার করা সব অন্যগুলি) process করা বন্ধ করে।

Fix-এর দুটি অংশ ছিল:

**Glue schema evolution**: Glue-এর dynamic frame schema evolution সমর্থন করে — প্রত্যাশিত schema-তে নেই এমন field failure ঘটানোর পরিবর্তে pass through হয়। job script-এ DataFrame-এর পরিবর্তে DynamicFrame ব্যবহার করে এটা সক্ষম করুন, additional option-এ `mergeSchema` সেট সহ। পরবর্তী crawler run-এ নতুন field স্বয়ংক্রিয়ভাবে schema-তে যোগ হয়।

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

**Glue job alerting**: Tom লক্ষ্য করার আগে pipeline failure প্রায় ছয় ঘণ্টা নীরব ছিল। Glue job run state (`FAILED`)-এ একটি CloudWatch alarm ৫ মিনিটের মধ্যে on-call engineer-কে alert করত। Alarm cost: মাসে দশ সেন্ট — কার্যত বিনামূল্যে (metric নিজে কিছু খরচ করে না, এবং প্রথম দশটি alarm free tier-এর অধীনে পড়ে)।

"ছয় ঘণ্টার data S3-তে process না হয়ে বসেছিল," catch up করতে ম্যানুয়ালি Glue job পুনরায় চালানোর পরে Leo বলল। "কিছু হারায়নি — কিন্তু analytics তত পিছিয়ে ছিল। আমাদের alarm থাকলে, বিলম্ব ৩০ মিনিট হত।"

বৃহত্তর শিক্ষা: যে ETL pipeline external data process করে তাকে schema পরিবর্তন gracefully handle করতে হবে। External partner — রেস্তোরাঁ, payment provider, delivery service — তাদের data format পরিবর্তন করবে। Pipeline সেই পরিবর্তনগুলিতে brittle হওয়া উচিত নয়।

**Query Layer: সরাসরি S3-এ SQL**

এখন data S3-তে ছিল, Parquet format-এ, তারিখ অনুসারে partitioned। শেষ টুকরো: প্রথমে এটা একটি database-এ load না করে এর প্রশ্ন জিজ্ঞাসা করার একটি উপায়।

**Amazon Athena** হলো একটি serverless, interactive query service যা সরাসরি S3 data-তে SQL query চালায়। provision করার কোনো database নেই, load করার কোনো data নেই। আপনি একটি table সংজ্ঞায়িত করেন (বা Glue Data Catalog ব্যবহার করেন), SQL লেখেন, এবং Athena S3 file-এর বিরুদ্ধে query execute করে।

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

Athena মূল্য একটি query কতটা data scan করে তার উপর ভিত্তি করে। us-east-1, us-west-2, এবং বেশিরভাগ প্রধান region-এ, standard SQL query প্রতি terabyte scan করা $5 খরচ করে। partition pruning (`WHERE year='2024' AND month='09'`) সহ Parquet format (columnar) ব্যবহার করা মানে Athena শুধুমাত্র প্রয়োজনীয় file scan করে, যা নাটকীয়ভাবে cost কমায়।

"আমরা ৩০ দিনের data-র জন্য এই query চালাতে পারি," Leo বলল, "এবং আমরা এটা ভালোভাবে store করলে এটা আশ্চর্যজনকভাবে কম খরচ হতে পারে।"

"এটা এত কম কীভাবে খরচ হতে পারে?" Maya জিজ্ঞেস করল। "এটা terabyte data scan করলে, সেটা কীভাবে ব্যয়বহুল নয়?"

Leo Parquet ব্যাখ্যা করল। একটি row-based format-এ (JSON, CSV), বিশটির মধ্যে দুটি column খোঁজা একটি query-কে বিশটিই পড়তে হয়। Parquet-এর মতো একটি columnar format-এ, এটা শুধুমাত্র যে দুটি প্রয়োজন তা পড়ে। একটি 50TB dataset-এর জন্য, একটি ভালো-optimized query 200GB scan করতে পারে। $5/TB-তে, সেটা এক ডলার।

"এবং কেউ যদি দুর্ঘটনাক্রমে পুরো table query করে?" Maya চাপ দিল।

"সেটা আসল cost ঝুঁকি," Leo বলল।

আপনি হয়তো ভাবছেন: Athena প্রতি terabyte scan করা চার্জ করলে, একটি খারাপভাবে লেখা query কি একটি বড় অপ্রত্যাশিত বিল তৈরি করতে পারে? হ্যাঁ — এবং এটা বাস্তব production environment-এ ঘটে। একটি 50TB unoptimized table-এর বিরুদ্ধে একটি query আপনার পুরো মাসিক S3 বিলের চেয়ে বেশি খরচ করতে পারে। এই কারণেই Parquet format এবং partitioning ঐচ্ছিক optimization নয় — সেগুলি cost control। Athena workgroup query scan limit-ও সমর্থন করে যা একটি single query কতটা data scan করার অনুমতি পায় তা cap করে।

"আমরা ভাবতে পারি এমন যেকোনো arbitrary প্রশ্নের জন্য?" Tom জিজ্ঞেস করল।

"আমরা SQL-এ প্রকাশ করতে পারি এমন যেকোনো প্রশ্ন, S3-তে আমরা store করা যেকোনো data-র বিরুদ্ধে।"

Tom Leo-র laptop-এ বসল এবং প্রথম query লিখল:

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

Query ১১ সেকেন্ড চলল। ফলাফল: ২০টি রেস্তোরাঁ, দ্রুততম গড় confirmation time অনুসারে সাজানো, তাদের reorder rate সহ।

Tom output-এর দিকে তাকাল।

দ্রুততম-confirm করা রেস্তোরাঁ — যেগুলি গড়ে ৩-৪ মিনিটের মধ্যে order acknowledge এবং confirm করত — তাদের গড় reorder rate ছিল ৪১%। ধীরতম-confirm করা রেস্তোরাঁ (গড় confirmation time ১৮-২২ মিনিট) তাদের reorder rate ছিল ১৩%।

"যে রেস্তোরাঁগুলি দ্রুত confirm করে তারা তিনগুণ repeat business পায়," Tom বলল।

"সেটা একটি বিশাল ব্যবধান," Maya বলল। "Confirmation speed কেন reorder rate-কে এত প্রভাবিত করবে?"

"কারণ গ্রাহক একটি order দিয়েছিল এবং তারপর তাদের ফোন দেখতে দেখতে বসেছিল," Leo বলল। "Confirmation ৩ মিনিটে এলে, তারা নিশ্চিত বোধ করে। এটা ২২ মিনিটে এলে — বা কখনো না — তারা উদ্বিগ্ন বোধ করে। উদ্বেগই হলো product failure, এমনকি খাবার ঠিকঠাক এলেও।"

"এটা একটি product অন্তর্দৃষ্টি," Maya বলল। "কেবল একটি analytics অন্তর্দৃষ্টি নয়। আমাদের রেস্তোরাঁগুলিকে category গড়ের তুলনায় তাদের confirmation time benchmark দেখানো উচিত।"

Athena query 1.2 GB data scan করেছিল (Parquet format-এ দুই মাসের order, year এবং month অনুসারে partitioned)। Cost: $0.006।

আধা সেন্ট। এমন একটি business অন্তর্দৃষ্টির জন্য যা Nimbus কীভাবে রেস্তোরাঁ onboarding design করবে তা পরিবর্তন করল — কোন রেস্তোরাঁগুলিকে success coaching-এর জন্য অগ্রাধিকার দিতে হবে, partner SLA-এর অংশ হিসেবে কোন confirmation time target সেট করতে হবে।

Tom-এর সেই চেহারা ছিল যে তারা যে সব data ফেলে দিচ্ছিল তার মূল্য পুনর্গণনা করছে।

"এবং কেউ যদি query layer-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "অথবা শুধু একজন analyst যে দুর্ঘটনাক্রমে কাঁচা order data থেকে customer address export করে? Customer PII, order history, financial record — কে নিয়ন্ত্রণ করে কোন table আদৌ দৃশ্যমান?"

সে প্রশ্ন শেষ করার আগে, Leo operational সমস্যাটিও বুঝতে পেরেছিল: আপনি কীভাবে একটি team-কে একটি catastrophic full-table scan চালানো থেকে থামান যা একটি single query-তে একটি $500 Athena বিল তৈরি করে?

**Athena Workgroup** উভয় সমস্যা একসাথে সমাধান করে।

একটি workgroup হলো একটি named configuration যা Athena ব্যবহারকারীদের group করে এবং shared setting প্রয়োগ করে: query result location, encryption, এবং — গুরুত্বপূর্ণভাবে — per-query data scan limit।

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

`analytics-team` workgroup-এ একজন analyst দুর্ঘটনাক্রমে 50TB data scan এবং একটি $250 Athena চার্জ তৈরি করতে পারে না। Query cancel হয় যখন এটা 10GB data scan অতিক্রম করত। Analyst একটি error message দেখে এবং জানে তাদের একটি partition filter যোগ করতে হবে।

Workgroup প্রতি team আলাদা result location-ও প্রয়োগ করে: engineering team-এর query result `s3://nimbus-query-results/engineering/`-তে যায়; finance team-এর result `s3://nimbus-query-results/finance/`-তে যায়। কোনো cross-team query result access নেই।

IAM নিয়ন্ত্রণ করে কোন ব্যবহারকারী কোন workgroup ব্যবহার করতে পারে। automated report চালানো একটি Lambda function `finance-reports` workgroup (শক্তভাবে cap করা) ব্যবহার করে। একটি production issue debug করা একজন engineer `engineering-team` workgroup (চওড়া cap, cancel না করে warn) ব্যবহার করে। কাঁচা events table (customer PII ধারণকারী)-তে access Glue Data Catalog table-এ একটি IAM condition-এর মাধ্যমে `engineering-team` workgroup-এ সীমাবদ্ধ।

"সেটা কেবল cost control নয়," Priya বলল। "সেটা access control। Workgroup হলো enforcement point।"

এটা তার প্রশ্নের সম্পূর্ণ উত্তর দিল। প্রতিটি data pipeline আলোচনা যা access control এড়িয়ে যায় শেষ পর্যন্ত একটি compliance incident হয়ে ওঠে — এবং এখানে, analytics team শুধুমাত্র aggregated order table দেখল, যখন customer PII সহ কাঁচা events একটি explicit IAM authorization-এর পিছনে থেকে গেল। Glue Data Catalog কেবল একটি schema directory ছিল না। এটা একটি access control boundary ছিল।

"সেটা অতিরিক্ত কাজ নয়," Priya বলল। "সেটাই design।"

**Data Lake Architecture**

এই তিনটি service একত্রিত হয়ে যাকে বলা হয় একটি **data lake architecture** — আপনার সমস্ত data-র জন্য একটি centralized S3 repository, এটা process এবং query করার tool সহ:

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

কাঁচা data সবসময় সংরক্ষিত থাকে (মূল S3 bucket-এ)। রূপান্তরিত data Athena-র মাধ্যমে queryable। কাঁচা data-তে নতুন Glue job চালিয়ে নতুন প্রশ্নের সবসময় উত্তর দেওয়া যায়।

**Amazon Redshift: যখন Athena যথেষ্ট নয়**

কিছু use case-এর জন্য, Athena অনেক ধীর বা অনেক ব্যয়বহুল:

- অনেক join সহ খুব জটিল query
- প্রতিদিন হাজার হাজার বার একই query চালানো dashboard
- structured data-তে machine learning
- BI tool-এর জন্য sub-second response time প্রয়োজনীয়তা

**Amazon Redshift** হলো একটি fully managed data warehouse: বড়, পুনরাবৃত্ত analytical workload-এর জন্য design করা একটি columnar analytics database। Athena-র বিপরীতে, যা S3-তে data যেখানে থাকে সেখানে query করে, Redshift data optimized warehouse storage-এ load করে এবং জটিল analytics ত্বরান্বিত করতে query optimization, sort strategy, এবং distribution strategy ব্যবহার করে।

আপনার data volume ছোট এবং আপনার query কদাচিৎ চললে (সাপ্তাহিক বা মাসিক), ভালো-সংগঠিত S3 data সহ Athena যথেষ্ট এবং প্রায় বিনামূল্যে — কিন্তু আপনি প্রতিদিন শত শত বার একই analytical dashboard চালালে, Redshift-এর pre-optimized columnar storage দ্রুত এবং শেষ পর্যন্ত বেশি cost-effective হবে, যদিও আগে data load করার প্রয়োজন।

Redshift জটিল analytics query-র জন্য উল্লেখযোগ্যভাবে দ্রুত cost-এর (provisioned capacity) এবং query করার আগে data load করার প্রয়োজনীয়তার বিনিময়ে।

**Redshift Serverless** capacity planning-এর বোঝা দূর করে — আপনি query করেন, Redshift scale করে। Cost আসলে ব্যবহৃত compute capacity-র উপর ভিত্তি করে, **RPU-hour**-এ পরিমাপ করা এবং প্রতি সেকেন্ডে বিল করা (প্রতি activation-এ ৬০-সেকেন্ড minimum সহ), plus প্রতি GB-month managed storage — এবং warehouse নিষ্ক্রিয় বসে থাকার সময় compute-এর জন্য কিছুই নয়। (Athena হলো একটি যা প্রতি query মূল্য নির্ধারণ করা: প্রতি TB scan করা $5।)

Nimbus-এর জন্য তাদের current scale-এ: Athena যথেষ্ট। পাঁচগুণ data volume-এ এবং BI tool প্রতিদিন শত শত বার একই dashboard query করলে, Redshift cost-effective হয়ে উঠবে।

**যখন Athena ভুল Tool**

"তাহলে ফাঁদটা কী?" Maya জিজ্ঞেস করল। "আমরা কেন সবকিছুর জন্য Athena ব্যবহার করব না? এটা serverless, প্রতি query পেমেন্ট, কোনো infrastructure নেই — এটা নিখুঁত শোনায়।"

যে ক্ষেত্রে Athena সঠিক উত্তর নয়:

**High-frequency dashboard**: একটি customer-facing analytics dashboard যা প্রতি ৩০ সেকেন্ডে refresh হয় এবং প্রতি মিনিটে ৫০টি query চালায় তা একটি ভালো Athena use case নয়। $5/TB scan করা-তে, সেই query-গুলিকে সেই frequency-তে cost-effective হতে অত্যন্ত ভালো-optimized হতে হবে। Sub-second response time প্রয়োজনীয়তা সহ dashboard-এর জন্য Redshift বা একটি pre-aggregated database (এমনকি RDS) বেশি উপযুক্ত।

**low latency প্রয়োজনীয়তা সহ operational query**: একজন customer service agent-এর ৫০০ms-এর নিচে একটি নির্দিষ্ট order খুঁজতে হলে, Athena tool নয় — একটি DynamoDB lookup বা একটি RDS query। Athena analytical throughput-এর জন্য optimized, operational latency-র জন্য নয়। এমনকি একটি ছোট dataset-এ একটি ভালো-tuned Athena query-র 1-3 সেকেন্ডের cold-start overhead আছে।

**Transactional system**: Athena read-only। আপনি Athena-তে record INSERT, UPDATE, বা DELETE করতে পারবেন না (Lake Formation বা Iceberg table format-এর মতো নির্দিষ্ট integration ছাড়া, যার নিজস্ব জটিলতা আছে)। operational write workload-এর জন্য, একটি transactional database ব্যবহার করুন।

**খুব ছোট, ঘন ঘন পরিবর্তিত dataset**: আপনার dataset প্রতি মিনিটে পরিবর্তিত হলে এবং কেবল 1GB হলে, এটা RDS বা DynamoDB-তে load করা এবং সেখানে query করা S3 file-এর বিরুদ্ধে Athena query চালানোর চেয়ে সহজ এবং দ্রুত যা stale হতে পারে। Athena query-র সময়ের S3 file-গুলি as-of query করে — file ২ মিনিট আগে লেখা হলে, সেটাই freshness আপনি পান।

যে pattern উদ্ভূত হয়: Athena S3 data-র বিরুদ্ধে large-scale, কদাচিৎ, ad-hoc analytical query-র জন্য চমৎকার। operational, transactional, বা sub-second latency প্রয়োজন যেকোনো কিছুর জন্য, উপযুক্ত operational database ব্যবহার করুন।

**Kinesis বনাম SQS: বিভ্রান্তি দূর করা**

এটা সেই প্রশ্ন যা প্রতিটি data architecture আলোচনায় আসে। Kinesis এবং SQS উভয়ই message নিয়ে কাজ করে। আপনি কখন প্রতিটি ব্যবহার করেন?

বিভ্রান্তি surface-level সাদৃশ্য থেকে আসে: উভয়ই producer থেকে message গ্রহণ করে। উভয়ই সেই message consumer-দের কাছে deliver করে। উভয়ই managed AWS service। কিন্তু তাদের data model মৌলিকভাবে ভিন্ন।

**SQS (Simple Queue Service)** হলো একটি task queue। আপনি একটি message রাখেন। একজন consumer এটা বের করে এবং process করে। Processing সম্পূর্ণ হলে, message delete হয়। আপনার দশজন consumer থাকলে, প্রতিটি message ঠিক তাদের একজনের কাছে যায়। Consumption-এর পরে message চলে যায়।

**Kinesis Data Streams** হলো একটি log। আপনি একটি record রাখেন। প্রতিটি consumer প্রতিটি record পড়ে। Consumer A সবগুলি পড়ে। Consumer B-ও সবগুলি পড়ে, নিজের গতিতে। কোনো consumer record delete করে না — এটা retention period শেষ হওয়া পর্যন্ত stream-এ থাকে। আপনি যেকোনো সময় একটি তৃতীয় consumer যোগ করতে পারেন, এবং এটা stream-এর শুরু থেকে পড়তে পারে (retention window-এর মধ্যে)।

"আপনি কখন আসলে চান প্রতিটি consumer প্রতিটি message দেখুক?" Maya জিজ্ঞেস করল।

উত্তর হলো সেই use case যেখানে Kinesis উজ্জ্বল হয়:

**Real-time dashboard + fraud detection + S3 archive**: তিনটিই একসাথে একই order event stream consume করে। আপনি SQS ব্যবহার করলে, আপনাকে তিনটি পৃথক queue-তে publish করতে হবে — এবং যে publish করে তাকে তিনটি consumer সম্পর্কে জানতে হবে। Kinesis-এর সাথে, producer একবার publish করে; যেকোনো সংখ্যক consumer স্বাধীনভাবে পড়তে পারে।

**Replay**: একজন consumer ২ ঘণ্টার জন্য ব্যর্থ হয় (Lambda concurrency limit hit, downstream service down)। SQS-এর সাথে, সেই message ইতিমধ্যে delete হয়েছিল (বা একটি সংজ্ঞায়িত visibility timeout আছে)। Kinesis-এর সাথে, consumer তার শেষ checkpoint থেকে resume করে এবং মিস করা ২ ঘণ্টার record process করে। Data stream-এ retain করা ছিল (Extended Data Retention দিয়ে 365 দিন পর্যন্ত)।

**একটি shard-এর মধ্যে order**: একই partition key সহ record সবসময় একই shard-এ যায়, order সংরক্ষণ করে। একটি stock trading system-এর জন্য যেখানে আপনার symbol `AMZN`-এর সমস্ত trade ক্রমানুসারে process করতে হবে, Kinesis এটা গ্যারান্টি করে। SQS FIFO per-group order প্রদান করে কিন্তু কম throughput-এ (standard mode-এ batching সহ প্রতি queue ৩,০০০ message/সেকেন্ড পর্যন্ত — high-throughput mode এটা কয়েক দশ হাজারে বাড়ায় — বনাম Kinesis-এর প্রতি shard 1 MB/s বা 1,000 record/s, আপনার যত shard প্রয়োজন তত দিয়ে গুণিত)।

নির্ণায়ক প্রশ্ন: **প্রতিটি message কি ঠিক একজন consumer দ্বারা consume এবং তারপর discard করতে হবে?** → SQS। **প্রতিটি message কি একাধিক consumer দ্বারা স্বাধীনভাবে দেখতে হবে, বা আপনার কি replay capability প্রয়োজন?** → Kinesis।

Nimbus-এর real-time dashboard-এর জন্য: Kinesis। একাধিক consumer (dashboard, fraud detection, S3 archive) সবাই একই stream পড়ছে।

Nimbus-এর order processing queue-এর জন্য (একটি order দেওয়া → একটি ECS task এটা process করে): SQS। একজন consumer, কোনো replay প্রয়োজন নেই, কোনো fan-out প্রয়োজন নেই।

## Data Visualize করা: Amazon QuickSight

Athena data query করে। Glue এটা প্রস্তুত করে। কিন্তু কোনো এক সময়ে কাউকে একটি chart দেখতে হবে — এবং console-এ SQL query চালিয়ে নয়।

"আমাদের কি সত্যিই এর জন্য আরেকটি service দরকার?" Maya জিজ্ঞেস করল। "আমি কি কেবল Athena ফলাফল একটি spreadsheet-এ export করতে পারি না?"

"একটি query-র জন্য, হ্যাঁ," Tom বলল। তার সেই চেহারা ছিল যে ইতিমধ্যে এটা চেষ্টা করেছে। "পুরো team-এর সাথে শেয়ার করতে চান এমন একটি dashboard-এর জন্য, সেটা প্রতি সকালে একটি নতুন spreadsheet।"

**Amazon QuickSight** হলো AWS-এর managed business intelligence (BI) service। এটা সরাসরি Athena, S3, RDS, Redshift, এবং অন্যান্য source-এ সংযোগ করে, এবং আপনাকে একটি পৃথক BI server ছাড়াই dashboard এবং visualization তৈরি করতে দেয়।

মূল feature:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight প্রতিটি dashboard load-এ Athena পুনরায় query না করে scale-এ sub-second query performance-এর জন্য dataset তার in-memory engine-এ import করতে পারে
- **ML Insights:** anomaly detection এবং forecasting built in — কোনো data science প্রয়োজন নেই
- **Embedded dashboard:** আপনি একটি URL-এর মাধ্যমে আপনার নিজের web application-এ QuickSight dashboard embed করতে পারেন

Tom QuickSight-কে Athena data source-এ সংযুক্ত করল এবং একটি বিকেলের মধ্যে দৈনিক order, রেস্তোরাঁ অনুযায়ী revenue, এবং conversion funnel দেখানো একটি কার্যকরী dashboard পেল।

"এটার মাসে কত খরচ?" সে জিজ্ঞেস করল — তারপর অন্য কেউ পারার আগে নিজের প্রশ্নের উত্তর দিল। "QuickSight প্রতি author প্রায় $24/মাস চলে — যারা dashboard তৈরি করে — এবং প্রতি reader $3/মাস। আমাদের চারজন আছে যারা এটা ব্যবহার করবে।"

"তাহলে মাসে প্রায় একশ ডলার," Maya বলল।

"একটি BI service-এর জন্য যা অন্যথায় একটি পৃথক analytics server চালানোর প্রয়োজন হত," Priya বলল। "হ্যাঁ।"

Tom dashboard publish করল। পরের সকালে, Athena query চালানোর পরিবর্তে, পুরো team একটি URL খুলল।

> **পরীক্ষার টিপস — QuickSight**
>
> QuickSight হলো AWS-এর managed BI এবং visualization service। Athena, S3, Redshift, RDS-এ সংযোগ করে। SPICE হলো in-memory query engine যা পুনরাবৃত্ত dashboard query ত্বরান্বিত করে। পরীক্ষার trigger: "AWS-এ business intelligence dashboard" বা "Athena/Redshift থেকে data visualize করুন" → QuickSight।

## Lake শাসন করা: AWS Lake Formation

Nimbus-এর data lake বাড়ার সাথে, data access একটি governance সমস্যা হয়ে উঠল।

"কে কাঁচা transaction log query করতে পারে?" Priya পরবর্তী architecture review-তে জিজ্ঞেস করল। "কে customer PII দেখতে পারে? কে financial summary table access করতে পারে?"

"Engineering-এর full access আছে," Leo বলল। "Analytics team-এর aggregated table-এ access আছে। Finance-এর revenue table-এ access আছে।"

"কোথায় configure করা?"

Leo থামল। "কয়েকটি ভিন্ন জায়গায়। S3 bucket policy, IAM policy, Glue catalog permission।"

"তিনটি পৃথক system, যার সবগুলি সামঞ্জস্যপূর্ণ হতে হবে," Priya বলল। "আমরা একজন নতুন analyst যোগ করলে কী হয়? অথবা আমরা যখন একটি নির্দিষ্ট column-এ access সীমাবদ্ধ করার সিদ্ধান্ত নিই — বলুন, customer phone number — analytics team থেকে?"

সেই প্রশ্নটি ফাঁক উন্মোচন করল। S3 bucket policy, IAM, এবং Glue Data Catalog জুড়ে একসাথে fine-grained data access পরিচালনা করা brittle ছিল।

**AWS Lake Formation** হলো একটি managed service যা আপনার data lake-এর জন্য access control কেন্দ্রীভূত করে। bucket policy, IAM policy, এবং Glue catalog permission আলাদাভাবে পরিচালনার পরিবর্তে, Lake Formation আপনার data-তে column-level, row-level, এবং table-level permission দেওয়ার একটি একক জায়গা প্রদান করে।

মূল feature:

- S3 এবং Glue Data Catalog-এর উপরে বসে — কোনো data migration প্রয়োজন নেই
- **Fine-grained access control:** নির্দিষ্ট ব্যবহারকারী বা role-কে নির্দিষ্ট table, column, বা এমনকি filtered row-তে access দিন — S3 data-তে database-level permission-এর সমতুল্য
- **Data filtering:** একজন ব্যবহারকারী Athena-র মাধ্যমে একটি Lake Formation-governed table query করলে, Lake Formation স্বয়ংক্রিয়ভাবে তারা দেখার অনুমতি নেই এমন column বা row filter করে

Priya তিনটি permission tier দিয়ে Lake Formation সেট আপ করল, Rafael column-level rule খসড়া করছিল: engineering role সমস্ত table এবং সমস্ত column দেখল। Analytics role aggregated order table দেখল কিন্তু customer PII column নয়। Finance role customer identifier mask করা revenue table দেখল।

"তাহলে analyst একই Athena query চালায়," Leo নিশ্চিত করল। "কিন্তু Lake Formation এটা intercept করে এবং তারা দেখার অনুমতিপ্রাপ্ত নয় এমন column strip করে?"

"সঠিক। Filtering স্বয়ংক্রিয়। Analyst-এর জানার দরকার নেই এটা ঘটছে — এবং তারা সরাসরি কাঁচা S3 file query করে এটা এড়িয়ে যেতে পারে না, কারণ Lake Formation catalog level-এ access নিয়ন্ত্রণ করে।"

"সেটা অতিরিক্ত কাজ নয়," Priya বলল। "সেটাই design।"

> **পরীক্ষার টিপস — Lake Formation**
>
> Lake Formation S3 + Glue Data Catalog-এ তৈরি একটি data lake-এর জন্য access control কেন্দ্রীভূত করে। table, column, এবং row level-এ fine-grained permission সমর্থন করে। পরীক্ষার trigger: "একটি S3 data lake-এ নির্দিষ্ট column-এ access সীমাবদ্ধ করুন" বা "data lake governance কেন্দ্রীভূত করুন" → Lake Formation। কাঁচা IAM থেকে মূল পার্থক্য: Lake Formation column- এবং row-level filtering প্রয়োগ করে যা শুধু IAM policy প্রকাশ করতে পারে না।

## শক্তি এবং সীমাবদ্ধতা

**Kinesis Data Streams**: Kinesis ব্যবহার করুন যখন আপনার data ক্রমাগত আসে এবং order গুরুত্বপূর্ণ — clickstream, financial transaction, IoT telemetry। Kinesis একটি shard-এর মধ্যে record order সংরক্ষণ করে এবং configured retention window-এর সময় replay অনুমতি দেয় (ডিফল্টভাবে ২৪ ঘণ্টা, Extended Data Retention দিয়ে 365 দিন পর্যন্ত), যা এটাকে SQS থেকে মৌলিকভাবে ভিন্ন করে। Trade-off হলো operational জটিলতা: provisioned mode-এ, আপনি shard capacity এবং consumer behavior পরিচালনা করেন। সহজ task queue-র জন্য যেখানে order গুরুত্বপূর্ণ নয় এবং replay প্রয়োজন নেই, SQS সহজ পছন্দ।

**AWS Glue**: Glue একটি ঐতিহ্যবাহী ETL cluster-এর infrastructure দূর করে। আপনি transform logic লেখেন; AWS Spark environment পরিচালনা করে। transform জটিল বা data volume বড় হলে এটা মূল্যবান। সীমাবদ্ধতা হলো cost এবং cold start — Glue job-এর কয়েক মিনিটের startup delay আছে, যা near-real-time transform-এর জন্য অনুপযুক্ত করে। সহজ file format রূপান্তরের জন্য (CSV থেকে Parquet), Glue-এর overhead একটি Lambda function বা একটি lightweight script-এর তুলনায় মূল্যবান নাও হতে পারে।

**Amazon Athena**: Athena আপনাকে standard SQL দিয়ে S3 data query করতে দেয় এবং পরিচালনার কোনো infrastructure নেই। সমালোচনামূলক constraint হলো cost: Athena scan করা data-র প্রতি terabyte চার্জ করে। একটি 10 TB table-এর বিরুদ্ধে একটি query যা পুরোটা scan করে তা একটি Parquet-formatted, partitioned table-এর বিরুদ্ধে একই query যা 200 GB scan করে তার চেয়ে উল্লেখযোগ্যভাবে বেশি খরচ করে। সবসময় columnar format (Parquet বা ORC) ব্যবহার করুন এবং production-এ Athena চালানোর আগে আপনার data partition করুন। এই optimization ছাড়া, Athena বিল আপনাকে অবাক করতে পারে।

## সারসংক্ষেপ

অধ্যায় ২৫-এর network কাজ Nimbus-এর data pipeline সম্ভব করেছিল। এই অধ্যায়টি সেই pipeline কীসের জন্য: Nimbus যে সব data তৈরি করছিল তা আসলে দৃশ্যমান এবং কার্যকর করা।

- **Amazon Kinesis**: Real-time data streaming। Producer record লেখে; consumer নিজের গতিতে পড়ে। Amazon Data Firehose তারপর কম operational কাজ সহ S3, Redshift, এবং অন্যান্য destination-এ streaming data deliver করতে পারে।
- **AWS Glue**: ETL এবং data cataloging। Crawler schema আবিষ্কার করে; Job data রূপান্তর করে; Data Catalog Athena এবং অন্যান্য tool দ্বারা data আবিষ্কারযোগ্য করে।
- **Amazon Athena**: S3-এ serverless SQL। standard SQL ব্যবহার করে S3-এ যেকোনো data query করুন। প্রতি TB scan করা মূল্য — cost minimize করতে Parquet এবং partitioning ব্যবহার করুন।
- **Amazon Redshift**: high-performance analytics-এর জন্য managed data warehouse। Data load করুন, পুনরাবৃত্ত analytical query-র জন্য optimize করুন, এবং warehouse scale-এ দ্রুত query করুন।
- **Data lake pattern**: কাঁচা data S3-এ → Glue এটা রূপান্তর করে → Athena এটা query করে → BI tool visualize করে।
- **Glue schema evolution**: যে ETL pipeline external data process করে তাকে schema পরিবর্তন gracefully handle করতে হবে। upstream data নতুন field যোগ করলে pipeline failure এড়াতে `mergeSchema: true` সহ DynamicFrame ব্যবহার করুন।
- **Athena Workgroup**: per-team data scan limit এবং result location। এক configuration-এ cost control এবং access control। যেকোনো multi-team Athena deployment-এর জন্য প্রয়োজনীয়।
- **Kinesis বনাম SQS**: একাধিক consumer-এ fan-out এবং replay capability-র জন্য Kinesis। সহজ task queue-র জন্য SQS Standard; ordered, deduplicated task processing-এর জন্য SQS FIFO। নির্ণায়ক প্রশ্ন: প্রতিটি consumer-কে কি প্রতিটি message দেখতে হবে, নাকি প্রতিটি message একজন consumer-এর কাছে যায়?
- **যখন Athena ভুল**: high-frequency dashboard (Redshift ব্যবহার করুন), operational query (RDS বা DynamoDB ব্যবহার করুন), খুব ছোট ঘন ঘন পরিবর্তিত dataset (কেবল একটি database ব্যবহার করুন)।
- **Amazon QuickSight**: AWS-এর managed BI service। একটি পৃথক BI server না চালিয়ে dashboard তৈরি করতে Athena, S3, Redshift, এবং RDS-এ সংযোগ করে। SPICE হলো in-memory engine যা পুনরাবৃত্ত dashboard query ত্বরান্বিত করে।
- **AWS Lake Formation**: S3 + Glue Data Catalog-এ data lake-এর জন্য কেন্দ্রীভূত access control। column-level, row-level, এবং table-level permission সক্ষম করে — fine-grained data governance যা শুধু IAM প্রকাশ করতে পারে না।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৫)*

- **Kinesis বনাম SQS**: Kinesis = ordered, real-time streaming, একাধিক consumer, retention window-এর মধ্যে replay (ডিফল্ট ২৪ ঘণ্টা, 365 দিন পর্যন্ত)। SQS = task queue, প্রতিটি message একবার process করা। "একাধিক consumer একই stream একসাথে পড়ছে" → Kinesis। "প্রতি message একজন worker" → SQS।
- **Athena পরীক্ষার সংকেত**: "S3-এ serverless SQL," "একটি database-এ load না করে S3 data বিশ্লেষণ করুন," "প্রতি query পেমেন্ট করুন" → Athena।
- **Athena cost optimization**: columnar format (Parquet বা ORC) + partitioning নাটকীয়ভাবে scan করা data এবং cost কমায়। পরীক্ষা জিজ্ঞেস করতে পারে Athena cost কীভাবে কমাবেন।
- **Athena মূল্য**: প্রতি TB scan করা $5 (us-east-1, us-west-2, এবং বেশিরভাগ প্রধান region)। Cost scan করা data-র উপর হিসাব করা হয়, return করা data নয় — production query চালানোর আগে সবসময় storage format optimize করুন।
- **Glue Crawler**: "S3 data-র schema স্বয়ংক্রিয়ভাবে আবিষ্কার করুন" → Glue Crawler।
- **Amazon Data Firehose**: "consumer পরিচালনা না করে S3/Redshift/OpenSearch-এ স্বয়ংক্রিয়ভাবে streaming data load করুন" → Amazon Data Firehose। পুরানো উপাদান এখনও এটাকে Kinesis Data Firehose বলতে পারে।
- **Redshift বনাম Athena**: একটি fixed dataset-এ high-frequency, জটিল query-র জন্য Redshift (BI dashboard)। ঘন ঘন পরিবর্তিত S3 data-তে ad-hoc query-র জন্য Athena।
- **EMR (Elastic MapReduce)**: AWS-managed Hadoop/Spark cluster। পরীক্ষা এটা ব্যবহার করে যখন "বিদ্যমান Hadoop/Spark workload" বা "custom data processing framework" উল্লেখ করা হয়। Glue বেশিরভাগ use case-এর জন্য managed বিকল্প।
- **QuickSight:** AWS managed BI এবং visualization। Athena, S3, Redshift, RDS-এ সংযোগ করে। SPICE = দ্রুত পুনরাবৃত্ত query-র জন্য in-memory engine। পরীক্ষার trigger: "AWS-এ business intelligence dashboard" → QuickSight।
- **Lake Formation:** একটি data lake-এর জন্য কেন্দ্রীভূত access control (S3 + Glue Data Catalog)। fine-grained permission: table, column, এবং row level। পরীক্ষার trigger: "S3 data lake-এ নির্দিষ্ট column-এ access সীমাবদ্ধ করুন" বা "data lake governance কেন্দ্রীভূত করুন" → Lake Formation।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

Amazon Kinesis এবং Amazon SQS-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। কখন আপনি প্রতিটি ব্যবহার করবেন?

*(ইঙ্গিত: কতজন consumer একই data পড়তে পারে, পড়ার পরে message delete হয় কিনা, এবং order গুরুত্বপূর্ণ কিনা তা নিয়ে ভাবুন।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি ride-sharing কোম্পানি trip data বিশ্লেষণ করতে চায়। প্রতিদিন ১ মিলিয়ন trip সম্পন্ন হয়। Trip record S3-তে JSON file হিসেবে store করা (প্রতিটি প্রায় 2KB)। Analytics team "গত সপ্তাহে শহর অনুযায়ী গড় trip duration"-এর মতো ad-hoc SQL query চালাতে চায়। Query ২ মিনিটের নিচে সম্পূর্ণ হওয়া উচিত। Storage cost minimize করতে হবে। Team প্রতি সপ্তাহে ২০-৩০টি query চালাবে।

কোন architecture এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) তারিখ এবং শহর অনুসারে partitioned Parquet format-এ JSON রূপান্তর করতে AWS Glue ব্যবহার করুন; Amazon Athena দিয়ে query করুন  
B) প্রতিদিন RDS PostgreSQL-এ trip data load করুন; standard SQL ব্যবহার করে query করুন  
C) Amazon Redshift-এ trip data deliver করতে Amazon Data Firehose ব্যবহার করুন; Redshift দিয়ে query করুন  
D) DynamoDB-তে trip data load করুন এবং SQL query-র জন্য PartiQL ব্যবহার করুন

**ইঙ্গিত ১**: প্রতি সপ্তাহে ২০-৩০ query কম frequency। কোন service মাঝে মাঝে query-র জন্য সবচেয়ে cost-effective?

**ইঙ্গিত ২**: Parquet format + partitioning নাটকীয়ভাবে Athena দ্বারা scan করা data — এবং তাই cost — কমায়।

**ইঙ্গিত ৩**: ১ মিলিয়ন trip × 2KB = ~2GB প্রতিদিন। এক সপ্তাহে, ~14GB। Athena-র জন্য $5/TB-তে, optimization ছাড়াও, এটা সাশ্রয়ী।

**উত্তর**: A

**ব্যাখ্যা**: Glue JSON-কে Parquet-এ রূপান্তর করে (columnar format নাটকীয়ভাবে scan করা data কমায়) তারিখ এবং শহর অনুসারে partitioned (partition pruning মানে "গত সপ্তাহ" query শুধুমাত্র ৭ দিনের partition scan করে)। Athena standard SQL দিয়ে সরাসরি S3 query করে। প্রতি সপ্তাহে ২০-৩০ query-র জন্য, pay-per-query Athena সবসময়-চলমান Redshift-এর তুলনায় অত্যন্ত cost-effective।

**কেন B নয়?** প্রতিদিন 2GB data RDS-এ load করা, তারপর query করা একটি database instance ২৪/৭ চালানোর প্রয়োজন। প্রতি সপ্তাহে ২০-৩০ query-র জন্য, এটা অত্যধিক over-engineered এবং ব্যয়বহুল।

**কেন C নয়?** Redshift high-frequency query-র জন্য cost-effective (একই dataset-এ প্রতিদিন শত শত)। প্রতি সপ্তাহে ২০-৩০ query-র জন্য, always-on Redshift cluster Athena-র per-query মূল্যের চেয়ে অনেক বেশি খরচ করে।

**কেন D নয়?** DynamoDB হলো একটি key-value/document store key-based access-এর জন্য optimized, ad-hoc analytical query নয়। DynamoDB-তে PartiQL বর্ণিত ধরনের GROUP BY aggregation সমর্থন করে না।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৫*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus order-এর জন্য একটি real-time fraud detection system তৈরি করতে চায়। System-এর উচিত:

- ৬০ সেকেন্ডে একই account দ্বারা ৫ বারের বেশি দেওয়া order detect করা
- নতুন account থেকে $500-এর উপরে order flag করা (< ৩০ দিন পুরানো)
- flag করা order একটি human review queue-তে পাঠানো

Architecture design করুন। Kinesis কী প্রদান করে? Fraud logic কোথায় চলে? আপনি "একই account, ৬০-সেকেন্ড window" কীভাবে correlate করেন? কোন service flag করা order পায়?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো real-time streaming architecture design অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Tom প্রথম Athena query চালাল।

"গত quarter-এ revenue অনুযায়ী শীর্ষ ১০ রেস্তোরাঁ," সে বলল।

১২ সেকেন্ড পরে, ফলাফল দেখা গেল।

সে সেগুলির দিকে তাকাল।

"রেস্তোরাঁ 47 প্রথম ছিল," সে বলল। এটা ছিল Maya-র পারিবারিক রেস্তোরাঁ — যেখানে Nimbus শুরু হয়েছিল।

"অবশ্যই ছিল," Maya বলল। "Arepa এত ভালো।"

Tom আরেকটি query চালাল। এবং আরেকটি। "এটার মাসে কত খরচ?" Leo কিছু বলার আগে Tom জিজ্ঞেস করল। Leo query scan history check করল। তিনটি query, মোট scan করা data: 1.2GB। Cost: এক সেন্টের কম।

এক ঘণ্টা পরে, Tom-এর কাছে Nimbus-এর ব্যবসার একটি সম্পূর্ণ চিত্র ছিল যা তার আগে কখনো ছিল না। কোন রেস্তোরাঁ category সবচেয়ে দ্রুত বাড়ল। কোন customer cohort দীর্ঘতম retain করল। কোন menu item সবচেয়ে বেশি repeat order চালিত করল।

"আমরা এটা আগে কেন তৈরি করিনি?" সে জিজ্ঞেস করল।

"আমাদের কাছে data ছিল," Leo বলল। "আমাদের শুধু এটা ব্যবহার করার pipeline ছিল না।"

"Data সবসময় সেখানে ছিল," Maya শান্তভাবে বলল। "আমরা শুধু এটা দেখতে পাইনি।"

পরবর্তী অধ্যায়ে: এখন যখন আমরা ব্যবসা স্পষ্টভাবে দেখতে পারি, আসুন এটা চালানো অবকাঠামোর জন্য কীভাবে আরও দক্ষতার সাথে পেমেন্ট করব সে সম্পর্কে কথা বলি।
