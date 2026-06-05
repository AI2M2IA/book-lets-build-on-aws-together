# باب ۲۶: سب کا مطلب نکالنا

Data خام ہے: timestamps، clicks، events، numbers۔ معلومات وہ ہے جو آپ کو ملتی ہے جب data منظم، processed، اور context دیا جاتا ہے۔ دونوں کے درمیان کا فرق وہ ہے جہاں یہ باب رہتا ہے۔

اور بڑھتے نظاموں میں، وہ فرق تیزی سے مہنگا ہو جاتا ہے۔

Nimbus بہت بڑی مقدار میں data generate کر رہا تھا۔ ہر آرڈر: recorded۔ ہر مینو view: logged۔ ہر ریستوران update: captured۔ ہر customer interaction: tracked۔

Tom کا ایک سوال تھا۔

"جمعے پر ہمارا سب سے مصروف آرڈر وقت کیا ہے؟"

Leo نے اسے دیکھا۔ "یہ ہمارے dashboard میں نہیں ہے۔"

"کیا ہم اسے شامل کر سکتے ہیں؟"

"Data DynamoDB میں ہے۔ اور CloudWatch logs میں۔ اور analytics export job سے S3 میں۔" Leo نے وقفہ کیا۔ "تین مختلف جگہوں میں، تین مختلف formats میں۔"

Maya نے اضافہ کیا: "اور analytics export صرف رات کو ایک بار چلتا ہے۔ اگر آپ جمعے کا data چاہتے ہیں، آپ کو ہفتہ صبح تک انتظار کرنا ہوگا۔"

Tom نے اسکرین دیکھی۔ "تو ہمارے پاس data ہے۔ ہم بس اسے استعمال نہیں کر سکتے۔"

وہ جملہ جدید analytics کا آدھا حصہ بیان کرتا ہے۔

یہ data engineering مسئلہ ہے: آپ کے پاس data ہے، لیکن یہ ایسی form میں نہیں ہے جسے آپ ضرورت پر analyze کر سکیں۔

**تین مختلف مسائل**

Nimbus کے data مسئلے کے تین dimensions تھے:

**Real-time streaming**: آرڈرز ابھی دیے جا رہے ہیں۔ آپ آرڈر velocity کا ایک live dashboard دیکھنا چاہتے ہیں — فی منٹ کتنے، region کے مطابق، ریستوران کے مطابق۔ Data کو آنے کے ساتھ process کرنا ضروری ہے۔

**Data transformation**: Data مختلف systems سے S3 میں مختلف formats (JSON، CSV، Parquet) میں ہے۔ Analyze کرنے سے پہلے، آپ کو اسے normalize کرنا ضروری ہے — ایک جیسا schema، ایک جیسا format، clean up، reference data کے ساتھ joined۔

**Ad-hoc analysis**: Data منظم ہونے کے بعد، آپ اسے پہلے database میں load کیے بغیر SQL queries چلانا چاہتے ہیں۔ "پچھلے 30 دنوں میں revenue کے لحاظ سے ٹاپ 10 ریستوران۔" Data database میں load کیے بغیر۔

یہ ہر ایک ایک الگ مسئلہ ہے۔ AWS کے پاس ہر ایک کے لیے ایک dedicated سروس ہے:

- **Amazon Kinesis**: Real-time streaming data
- **AWS Glue**: Data transformation اور cataloging
- **Amazon Athena**: S3 پر serverless SQL queries

**Amazon Kinesis: Real-Time Ticker Tape**

**Amazon Kinesis Data Streams** ایک real-time data streaming سروس ہے۔ Producers stream کو data records بھیجتے ہیں۔ متعدد consumers بیک وقت stream سے پڑھ سکتے ہیں، ہر ایک اپنی رفتار سے۔

ایک ticker tape machine کی طرح سوچیں: prices مسلسل print ہوتی ہیں، ہر کوئی tape پڑھ سکتا ہے، اور tape کسی individual reader کے لیے سست نہیں ہوتی۔

Nimbus کے لیے، جب آرڈر دیا جاتا ہے، ایپلیکیشن ایک Kinesis stream کو ایک event publish کرتی ہے: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`۔

اس stream کے consumers:

- ایک real-time dashboard (events آنے کے ساتھ پڑھتا ہے، metrics update کرتا ہے)
- ایک fraud detection Lambda (غیر معمول آرڈر patterns دیکھتا ہے)
- مستقل storage کے لیے S3 کی طرف ایک stream

**Kinesis Data Streams concepts**:

- **Shard**: صلاحیت کی بنیادی unit۔ ایک shard 1 MB/s write، 2 MB/s read سنبھالتا ہے۔
- **Retention period**: Data stream میں 24 گھنٹے (default) سے 7 دن تک رہتا ہے۔
- **Sequence number**: ہر record کا ایک sequence number ہوتا ہے۔ Consumers stream میں اپنی position track کرتے ہیں۔

**Amazon Data Firehose** (سابقہ **Kinesis Data Firehose**): Streaming producers اور destinations جیسے S3، Redshift، اور OpenSearch کے درمیان managed delivery سروس۔ یہ خودبخود buffer، compress، transform، اور deliver کرتی ہے۔

Nimbus کے لیے: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet format، compressed، date کے مطابق partitioned)۔

**AWS Glue: Translator**

S3 میں Data خام ہے۔ مؤثر طریقے سے analyze کرنے سے پہلے، آپ کو یہ کرنا ضروری ہے:

- وہاں کیا ہے اور اس کا schema دریافت کریں (کون سے columns، کون سے types)
- اسے ایک consistent format میں transform کریں
- مختلف datasets کو join کریں
- خراب records، schema تبدیلیاں، missing values سنبھالیں

**AWS Glue** ایک fully managed ETL (Extract، Transform، Load) سروس ہے۔ اس کے دو main components ہیں:

**Glue Data Catalog**: ایک metadata store جو آپ کے S3 data کو describe کرتا ہے — کون سے tables موجود ہیں، ان کے کیا columns ہیں، data files کہاں ہیں۔ یہ آپ کے data lake کے لیے ایک card catalog کی طرح ہے۔

**Glue Crawlers**: خودکار agents جو S3 scan کرتے ہیں، schema infer کرتے ہیں، اور Data Catalog populate کرتے ہیں۔ اپنے S3 bucket پر ایک crawler run کریں اور 10 منٹ بعد آپ کے پاس تمام tables کا ایک catalog ہوگا۔

**Glue Jobs**: Serverless Spark/Python jobs جو actual transformation انجام دیتے ہیں۔ آپ transformation logic لکھتے ہیں (یا Glue کا visual ETL tool استعمال کرتے ہیں)، اور Glue اسے managed infrastructure پر چلاتا ہے۔

Nimbus کے لیے:

1. Glue Crawler S3 میں orders data scan کرتا ہے → Glue Data Catalog میں ایک table definition بناتا ہے
2. Glue Job raw JSON order events کو ایک clean، partitioned Parquet format میں transform کرتا ہے
3. Transformed data S3 میں ایک query-optimized layout میں واپس لکھا جاتا ہے

**Amazon Athena: Librarian**

**Amazon Athena** ایک serverless، interactive query سروس ہے جو S3 data پر براہ راست SQL queries چلاتی ہے۔ Provision کرنے کے لیے کوئی database نہیں، load کرنے کے لیے کوئی data نہیں۔ آپ ایک table define کرتے ہیں (یا Glue Data Catalog استعمال کرتے ہیں)، SQL لکھتے ہیں، اور Athena S3 files کے خلاف query execute کرتا ہے۔

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Athena pricing اس بات پر based ہے کہ ایک query کتنا data scan کرتی ہے۔ بہت سے regions میں، standard SQL queries $5 per terabyte scanned سے شروع ہوتی ہیں۔ Parquet format (columnar) partition pruning (`WHERE year='2024' AND month='01'`) کے ساتھ استعمال کرنے کا مطلب ہے Athena صرف وہ files scan کرتا ہے جن کی ضرورت ہے، جو لاگت کو dramatically کم کرتا ہے۔

"ہم 30 دنوں کے data کے لیے یہ query run کر سکتے ہیں،" Leo نے کہا، "اور اگر ہم اسے اچھی طرح store کریں تو حیرت انگیز طور پر کم لاگت آ سکتی ہے۔"

"کسی بھی arbitrary question کے لیے جو ہم سوچ سکتے ہیں؟" Tom نے پوچھا۔

"کوئی بھی question جسے ہم SQL میں express کر سکیں، S3 میں store کردہ کسی بھی data کے خلاف۔"

Tom کے چہرے پر اس شخص کا اظہار تھا جو اس تمام data کی value کو دوبارہ calculate کر رہا تھا جو وہ پھینک رہے تھے۔

**Data Lake Architecture**

یہ تین سروسز مل کر ایک **data lake architecture** میں جمع ہوتی ہیں — آپ کے تمام data کے لیے ایک مرکزی S3 repository، tools کے ساتھ process اور query کرنے کے لیے:

```
Applications (orders، menus، events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler schema دریافت کرتا ہے
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform کرتے ہیں
                                                   ↓
                                              S3 (clean، Parquet، partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight، Tableau، وغیرہ)
```

Raw data ہمیشہ preserved ہوتا ہے (original S3 bucket میں)۔ Transformed data Athena کے ذریعے queryable ہے۔ نئے سوالوں کا ہمیشہ raw data پر نئے Glue jobs چلا کر جواب دیا جا سکتا ہے۔

**Amazon Redshift: جب Athena کافی نہیں**

کچھ use cases کے لیے، Athena بہت سست یا بہت مہنگی ہے:

- بہت پیچیدہ queries بہت سارے joins کے ساتھ
- Dashboards جو فی دن ہزاروں بار ایک ہی query چلاتے ہیں
- Structured data پر Machine learning
- BI tools کے لیے sub-second response time ضروریات

**Amazon Redshift** ایک fully managed data warehouse ہے: ایک columnar analytics database بڑے، repeated analytical workloads کے لیے ڈیزائن کیا گیا۔ Athena کے برعکس، جو S3 میں data کو وہیں query کرتا ہے، Redshift data کو optimized warehouse storage میں load کرتا ہے اور پیچیدہ analytics تیز کرنے کے لیے query optimization، sort strategies، اور distribution strategies استعمال کرتا ہے۔

**Redshift Serverless** capacity planning کا burden ہٹا دیتا ہے — آپ query کریں، Redshift scale کرتا ہے۔ لاگت per query ہے۔

Nimbus کے موجودہ scale پر: Athena کافی ہے۔ پانچ گنا data volume اور BI tools فی دن سینکڑوں بار ایک ہی dashboards query کرنے کے ساتھ، Redshift cost-effective ہو جائے گا۔

## خوبیاں اور حدود

**Kinesis Data Streams**: Kinesis استعمال کریں جب آپ کا data مسلسل آئے اور order اہمیت رکھے — clickstreams، financial transactions، IoT telemetry۔ Kinesis configured retention window کے دوران shard کے اندر record order preserve کرتا ہے اور replay کی اجازت دیتا ہے، جو اسے SQS سے بنیادی طور پر مختلف بناتا ہے۔

**AWS Glue**: Glue ایک traditional ETL cluster کا infrastructure ختم کرتا ہے۔ آپ transform logic لکھتے ہیں؛ AWS Spark environment manage کرتا ہے۔ Limitation: startup delay — Glue jobs چند منٹوں کا startup delay رکھتے ہیں، انہیں near-real-time transforms کے لیے نامناسب بناتا ہے۔

**Amazon Athena**: Athena S3 data کو standard SQL کے ساتھ manage کرنے کے لیے کوئی infrastructure نہیں کے ساتھ query کرنے دیتا ہے۔ اہم constraint ہے لاگت: Athena scanned data کے per terabyte charge کرتا ہے۔ ہمیشہ columnar formats (Parquet یا ORC) استعمال کریں اور production میں Athena چلانے سے پہلے اپنا data partition کریں۔ ان optimizations کے بغیر، Athena bills آپ کو حیران کر سکتے ہیں۔

## خلاصہ

- **Amazon Kinesis**: Real-time data streaming۔ Producers records لکھتے ہیں؛ consumers اپنی رفتار پر پڑھتے ہیں۔ Amazon Data Firehose streaming data کو کم operational کام کے ساتھ S3، Redshift، اور دوسرے destinations تک deliver کر سکتا ہے۔
- **AWS Glue**: ETL اور data cataloging۔ Crawlers schemas دریافت کرتے ہیں؛ Jobs data transform کرتے ہیں؛ Data Catalog data کو Athena اور دوسرے tools سے discoverable بناتا ہے۔
- **Amazon Athena**: S3 پر Serverless SQL۔ Standard SQL کا استعمال کرتے ہوئے S3 میں کوئی بھی data query کریں۔ Scanned TB کے مطابق قیمت — Parquet اور partitioning سے لاگت minimize کریں۔
- **Amazon Redshift**: High-performance analytics کے لیے Managed data warehouse۔ Data load کریں، repeated analytical queries کے لیے optimize کریں، اور warehouse scale پر تیزی سے query کریں۔
- **Data lake pattern**: raw data S3 کو → Glue اسے transform کرتا ہے → Athena اسے query کرتا ہے → BI tools visualize کرتے ہیں۔

## امتحانی نکات

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں (ڈومین ۳، ٹاسک ۳.۵)*

- **Kinesis بمقابلہ SQS**: Kinesis = ordered، real-time streaming، multiple consumers، retention window کے اندر replay۔ SQS = task queue، ہر message ایک بار processed۔ "بیک وقت ایک ہی stream پڑھنے والے multiple consumers" → Kinesis۔ "فی message ایک worker" → SQS۔
- **Athena exam signals**: "S3 پر serverless SQL،" "database میں load کیے بغیر S3 data analyze کریں،" "pay per query" → Athena۔
- **Athena cost optimization**: Columnar format (Parquet یا ORC) + partitioning scanned data اور لاگت کو dramatically کم کرتا ہے۔ امتحان پوچھ سکتا ہے Athena costs کیسے کم کریں۔
- **Glue Crawler**: "S3 data کا schema خودبخود دریافت کریں" → Glue Crawler۔
- **Amazon Data Firehose**: "consumers manage کیے بغیر S3/Redshift/OpenSearch کو streaming data خودبخود load کریں" → Amazon Data Firehose۔ پرانے materials اسے اب بھی Kinesis Data Firehose کہہ سکتے ہیں۔
- **Redshift بمقابلہ Athena**: ایک fixed dataset (BI dashboards) پر high-frequency، پیچیدہ queries کے لیے Redshift۔ کثرت سے بدلنے والے S3 data پر ad-hoc queries کے لیے Athena۔
- **EMR (Elastic MapReduce)**: AWS-managed Hadoop/Spark clusters۔ جب "existing Hadoop/Spark workloads" یا "custom data processing frameworks" ذکر ہوں امتحان اسے استعمال کرتا ہے۔ زیادہ تر use cases کے لیے Glue managed alternative ہے۔

## مشقیں

**مشق ۱ — یادداشت**

Amazon Kinesis اور Amazon SQS کے درمیان فرق بیان کریں۔ آپ ہر ایک کب استعمال کریں گے؟

*(اشارہ: اس کے بارے میں سوچیں کہ ایک ہی data کتنے consumers پڑھ سکتے ہیں، پڑھنے کے بعد messages delete ہوتی ہیں یا نہیں، اور آیا order اہمیت رکھتا ہے۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک ride-sharing کمپنی trip data analyze کرنا چاہتی ہے۔ روزانہ 1 million trips complete ہوتی ہیں۔ Trip records S3 میں JSON files کے طور پر محفوظ ہیں (تقریباً 2KB ہر ایک)۔ Analytics team ad-hoc SQL queries چلانا چاہتی ہے جیسے "پچھلے ہفتے شہر کے مطابق average trip duration۔" Queries 2 منٹ کے اندر complete ہونی چاہئیں۔ Storage costs کم سے کم ہونی چاہئیں۔ Team فی ہفتہ 20-30 queries چلائے گی۔

کون سا architecture ان ضروریات کو بہترین طریقے سے پوری کرتا ہے؟

A) روزانہ trip data کو RDS PostgreSQL میں load کریں؛ standard SQL کا استعمال کرتے ہوئے query کریں  
B) JSON کو Parquet format میں تاریخ اور شہر کے مطابق partitioned کرنے کے لیے AWS Glue استعمال کریں؛ Amazon Athena سے query کریں  
C) Amazon Redshift کو trip data deliver کرنے کے لیے Amazon Data Firehose استعمال کریں؛ Redshift سے query کریں  
D) SQL queries کے لیے PartiQL استعمال کرتے ہوئے trip data DynamoDB میں load کریں

**اشارہ ۱**: فی ہفتہ 20-30 queries کم frequency ہے۔ Occasional querying کے لیے کون سی سروس سب سے cost-effective ہے؟

**اشارہ ۲**: Parquet format + partitioning Athena کے ذریعے scanned data — اور اس لیے لاگت — کو dramatically کم کرتا ہے۔

**اشارہ ۳**: 1 million trips × 2KB = ~2GB فی دن۔ ایک ہفتے میں ~14GB۔ Athena کے لیے $5/TB پر، optimization کے بغیر بھی یہ affordable ہے۔

**جواب**: B

**وضاحت**: Glue JSON کو Parquet (columnar format dramatically scanned data کم کرتا ہے) تاریخ اور شہر کے مطابق partitioned (partition pruning کا مطلب "پچھلے ہفتے" queries صرف 7 دنوں کے partitions scan کرتی ہیں) میں convert کرتا ہے۔ Athena براہ راست standard SQL کے ساتھ S3 query کرتا ہے۔ فی ہفتہ 20-30 queries کے لیے، pay-per-query Athena ہمیشہ running Redshift سے انتہائی cost-effective ہے۔

**A کیوں نہیں؟** RDS میں روزانہ 2GB data load کرنا، پھر query کرنا، 24/7 چلنے والا database instance چاہتا ہے۔ فی ہفتہ 20-30 queries کے لیے، یہ vastly over-engineered اور مہنگا ہے۔

**C کیوں نہیں؟** ایک ہی dataset پر high-frequency queries (فی دن سینکڑوں) کے لیے Redshift cost-effective ہے۔ فی ہفتہ 20-30 queries کے لیے، ہمیشہ on Redshift cluster Athena کی per-query pricing سے بہت زیادہ لاگت آتی ہے۔

**D کیوں نہیں؟** DynamoDB ایک key-value/document store ہے جو key-based access کے لیے optimize ہے، ad-hoc analytical queries نہیں۔ DynamoDB پر PartiQL بیان کردہ GROUP BY aggregations کو support نہیں کرتا۔

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۳.۵*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus آرڈرز کے لیے ایک real-time fraud detection نظام بنانا چاہتا ہے۔ نظام کو یہ کرنا چاہیے:

- 60 سیکنڈ میں ایک ہی account سے 5 سے زیادہ بار place کیے گئے آرڈرز detect کریں
- نئے accounts (< 30 دن پرانے) سے $500 سے اوپر کے آرڈرز flag کریں
- Flagged آرڈرز کو ایک human review queue میں بھیجیں

Architecture ڈیزائن کریں۔ Kinesis کیا فراہم کرتا ہے؟ Fraud logic کہاں چلتا ہے؟ "ایک ہی account، 60 سیکنڈ window" کو آپ کیسے correlate کرتے ہیں؟ Flagged آرڈرز کون سی سروس receive کرتی ہے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد real-time streaming architecture ڈیزائن کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے پہلی Athena query چلائی۔

"پچھلے تیماہی کے revenue کے لحاظ سے ٹاپ 10 ریستوران،" اس نے کہا۔

12 سیکنڈ بعد، نتائج ظاہر ہوئے۔

اس نے انہیں گھورا۔

"ریستوران 47 پہلا تھا،" اس نے کہا۔ یہ Maya کا خاندانی ریستوران تھا — وہ جہاں Nimbus شروع ہوا تھا، جب اس نے محسوس کیا کہ وہ فون ہمیشہ busy ہونے کی وجہ سے آرڈرز کھو رہے تھے۔

"بالکل ایسا ہونا چاہیے تھا،" Maya نے کہا۔ "Arepa اتنا اچھا ہے۔"

Tom نے ایک اور query چلائی۔ اور ایک اور۔ ہر ایک سیکنڈوں میں جواب دیا، ہر ایک cents کی لاگت۔

ایک گھنٹے کے بعد، اس کے پاس Nimbus کے business کی ایک مکمل تصویر تھی جو اس نے پہلے کبھی نہیں رکھی تھی۔ کون سی ریستوران categories سب سے تیزی سے بڑھیں۔ کون سے customer cohorts سب سے زیادہ retain ہوئے۔ کون سے مینو items سب سے زیادہ repeat آرڈرز drive کیے۔

"ہم نے یہ پہلے کیوں نہیں بنایا؟" اس نے پوچھا۔

"ہمارے پاس data تھا،" Leo نے کہا۔ "ہمارے پاس بس اسے استعمال کرنے کی pipeline نہیں تھی۔"

"Data ہمیشہ وہاں تھا،" Maya نے آہستہ آہستہ کہا۔ "ہم بس اسے دیکھ نہیں سکتے تھے۔"

اگلے باب میں: اب جب ہم business کو واضح طور پر دیکھ سکتے ہیں، آئیں اس infrastructure کی ادائیگی کے بارے میں بات کریں جو اسے چلاتی ہے — زیادہ مؤثر طریقے سے۔
