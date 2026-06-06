# باب 26: سب کا مطلب نکالنا

Tom ایک printout گھور رہا تھا۔

یہ نمبروں کے دو صفحات تھے: order counts، revenue totals، timestamps، region codes۔ اس نے Leo سے جمعہ کے order patterns کے بارے میں دستیاب ہر چیز اکٹھی کرنے کو کہا تھا۔ Leo نے ایک گھنٹہ ایک script لکھنے میں گزارا تھا جو تین مختلف data sources کو join کرتا تھا — DynamoDB، CloudWatch logs، اور ایک S3 analytics export — اور یہ وہی تھا جو نکلا۔

نمبر سب وہاں تھے۔ انہوں نے اسے کچھ نہیں بتایا۔

وہ دیکھ سکتا تھا کہ جمعہ کو 847 آرڈرز دیے گئے تھے۔ وہ یہ نہیں بتا سکتا تھا کہ وہ کب دیے گئے، کون سے ریستوران سب سے مصروف تھے، یا peak گھنٹہ کیا تھا۔ وہ معلومات data میں تھی۔ یہ بس invisible تھی۔

---

باب 25 کی تمام network optimization نے Nimbus کے infrastructure کو تیز اور سستا بنا دیا تھا۔ لیکن وہ data جو infrastructure پیدا کر رہا تھا — DynamoDB میں، CloudWatch logs میں، اس S3 analytics export میں جو رات میں ایک بار چلتا تھا — تین مختلف جگہوں میں، تین مختلف formats میں بیٹھا تھا، کسی ایسی چیز سے غیر منسلک جسے Tom دراصل استعمال کر سکے۔

Maya کے سوال نے اسے ٹھوس بنایا۔ "جمعہ کو ہمارا سب سے مصروف order time کیا ہے؟"

Leo نے اسے دیکھا۔ "یہ ہمارے dashboard میں نہیں ہے۔"

"کیا ہم اسے شامل کر سکتے ہیں؟"

"Data DynamoDB میں ہے۔ اور CloudWatch logs میں۔ اور analytics export job سے S3 میں۔" Leo رکا۔ "تین مختلف جگہوں میں، تین مختلف formats میں۔"

Maya نے شامل کیا: "اور analytics export رات میں صرف ایک بار چلتا ہے۔ اگر آپ کو جمعہ کا data چاہیے، آپ کو ہفتہ کی صبح تک انتظار کرنا پڑے گا۔"

Tom نے printout دیکھا۔ "تو ہمارے پاس data ہے۔ ہم بس اسے استعمال نہیں کر سکتے۔"

وہ جملہ جدید analytics کے آدھے کی وضاحت کرتا ہے۔

---

**Whiteboard**

Maya دفتر جلدی پہنچی اور Leo کے پہنچنے تک پہلے ہی آدھا whiteboard بھر چکی تھی۔

سات سوالات، دو columns میں لکھے، سب کے سب business سوالات، ان میں سے کوئی موجودہ dashboards سے قابل جواب نہیں:

1. کن ریستورانوں کی پہلے 30 دنوں میں سب سے زیادہ order cancellation rate ہے؟
2. ایک ریستوران کے ایک order notification وصول کرنے اور اس کی تصدیق کرنے کے درمیان اوسط وقت کیا ہے؟ یہ ریستوران اور ہفتے کے دن کے لحاظ سے کیسے بدلتا ہے؟
3. کن شہروں میں 14 دنوں کے اندر اسی ریستوران سے دوبارہ آرڈر کرنے والے customers کی سب سے زیادہ شرح ہے؟
4. کتنے فیصد آرڈرز app کے پہلے session میں دیے جاتے ہیں بمقابلہ return sessions؟
5. کون سی menu categories فی ریستوران سب سے زیادہ revenue پیدا کرتی ہیں؟
6. ریستوران response time اور customer reorder rate کے درمیان کیا تعلق ہے؟
7. ایک ریستوران partner کے social media پر post کرنے سے پہلے اور بعد کے 48 گھنٹوں میں order volume کیسے بدلتا ہے؟

"کیا ہم ان میں سے کسی کا جواب دے سکتے ہیں؟" اس نے پوچھا۔

Leo نے فہرست دیکھی۔ اس نے موجودہ dashboard دیکھا — order count، revenue total، active restaurants۔

"نمبر ایک،" اس نے آہستہ کہا۔ "جزوی طور پر۔ ہمارے پاس cancellation records ہیں۔ لیکن ہمیں انہیں ریستوران onboarding dates سے join کرنا ہوگا، اور وہ ایک مختلف system میں ہے۔"

"نمبر دو؟" Tom نے پوچھا۔

"ہم notification timestamp اسٹور کرتے ہیں۔ ہم confirmation timestamp اسٹور کرتے ہیں۔ وہ مختلف tables میں مختلف formats میں ہیں۔ ہمیں انہیں JOIN کرنا اور delta حساب کرنا ہوگا۔"

"تو data موجود ہے،" Maya نے کہا۔

"Data موجود ہے،" Leo نے تصدیق کی۔ "ہمارے پاس بس اس میں query کرنے کا کوئی طریقہ نہیں۔"

"رکو — لیکن ہم بس database کیوں query نہیں کر سکتے؟" Maya نے پوچھا۔ "ہمارے پاس PostgreSQL ہے۔ ہمارے پاس یہ سارا data ہے۔"

"کیونکہ data تین جگہوں میں ہے،" Leo نے کہا۔ "Order events DynamoDB میں ہیں۔ Notification timestamps CloudWatch logs میں ہیں۔ Onboarding dates RDS PostgreSQL database میں ہیں۔ اور اس میں سے کچھ — analytics exports — S3 میں JSON files کے طور پر ہے جنہیں کسی نے کبھی کسی چیز سے join نہیں کیا۔"

Tom نے whiteboard دیکھا۔ "ہم یہ data 18 ماہ سے پیدا کر رہے ہیں،" اس نے کہا۔ "ہم 18 ماہ سے اندھے اڑ رہے ہیں۔"

"اندھے نہیں،" Maya نے کہا۔ "بس نزدیک بین۔ ہم وہ دیکھ سکتے تھے جو فوراً ہمارے سامنے تھا۔ ہم patterns نہیں دیکھ سکتے تھے۔"

یہ صحیح framing تھی۔ انفرادی data points وہاں تھے۔ انہیں جوڑنے کا نظام نہیں تھا۔

**تین مختلف مسائل**

Nimbus کے data مسئلے کی تین dimensions تھیں:

**Real-time streaming**: آرڈرز ابھی دیے جا رہے ہیں۔ آپ order velocity کا ایک live dashboard دیکھنا چاہتے ہیں — فی منٹ کتنے، region کے لحاظ سے، ریستوران کے لحاظ سے۔ Data کو آتے ہی process کرنے کی ضرورت ہے۔

**Data transformation**: Data مختلف systems سے S3 میں ہے، مختلف formats میں (JSON، CSV، Parquet)۔ اس کا تجزیہ کرنے سے پہلے، آپ کو اسے normalize کرنا ہوگا — ایک ہی schema، ایک ہی format، صاف، reference data کے ساتھ joined۔

**Ad-hoc analysis**: ایک بار جب data منظم ہو جائے، آپ اس کے خلاف SQL queries چلانا چاہتے ہیں اسے پہلے ایک database میں load کیے بغیر۔ "مجھے پچھلے 30 دنوں میں revenue کے لحاظ سے سرفہرست 10 ریستوران دو۔" Data کو ایک database میں load کیے بغیر۔

ان میں سے ہر ایک ایک الگ مسئلہ ہے۔ AWS کے پاس ہر ایک کے لیے ایک dedicated service ہے۔

**Real-Time Stream: Data کے لیے ایک Ticker Tape**

ایک ticker tape machine کا تصور کریں — وہ قسم جو stock prices کو کاغذ کے ایک مسلسل roll پر print کرتی تھی۔ Prices تبدیل ہوتے ہی print ہوتے تھے۔ ہر کوئی جو موجودہ price چاہتا تھا tape پڑھ سکتا تھا۔ کسی کو کسی اور کا انتظار نہیں کرنا پڑتا تھا؛ tape print کرتی رہتی تھی چاہے کتنے ہی لوگ پڑھ رہے ہوں۔

یہ real-time data streaming کا نمونہ ہے۔ Producers data بھیجتے ہیں جیسے یہ ہوتا ہے۔ متعدد consumers stream کو بیک وقت پڑھ سکتے ہیں، ہر ایک اپنی رفتار پر، ہر ایک مکمل تصویر حاصل کرتا ہے۔

**Amazon Kinesis Data Streams** Nimbus کے لیے وہ machine ہے۔ جب ایک آرڈر دیا جاتا ہے، application ایک Kinesis stream کو ایک event publish کرتی ہے: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`۔

اس stream کے consumers:

- ایک real-time dashboard (events کو آتے ہی پڑھتا ہے، metrics اپڈیٹ کرتا ہے)
- ایک fraud detection Lambda (غیر معمولی order patterns تلاش کرتا ہے)
- مستقل storage کے لیے S3 کو ایک stream

**Kinesis Data Streams تصورات**:

- **Shard**: capacity کی بنیادی unit۔ ایک shard 1 MB/s write، 2 MB/s read سنبھالتا ہے۔
- **Retention period**: Data stream میں 24 گھنٹے رہتا ہے (default)، Extended Data Retention کے ساتھ **365 دن** (1 سال) تک قابل توسیع۔
- **Sequence number**: ہر record کا ایک sequence number ہوتا ہے۔ Consumers stream میں اپنی پوزیشن ٹریک کرتے ہیں۔

**Amazon Data Firehose** (سابقہ **Kinesis Data Firehose**): streaming producers اور S3، Redshift، اور OpenSearch جیسے destinations کے درمیان managed delivery service۔ یہ data کو خودبخود buffer، compress، transform، اور deliver کرتا ہے۔

Nimbus کے لیے: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet format، compressed، date کے لحاظ سے partitioned)۔

"میں نے پہلے ہی اسے deploy کر دیا — اوہ۔" Leo نے پہلے write throughput حساب کیے بغیر shard count کو ایک پر سیٹ کر دیا تھا۔ Nimbus کے order volume پر، ایک shard ٹھیک تھا۔ اس نے کسی کے نوٹ کرنے سے پہلے اس کی تصدیق کر لی کہ اس نے اندازہ لگایا تھا۔

**Translator: خام Data کا مطلب نکالنا**

S3 میں data خام ہے۔ اس کا مؤثر طریقے سے تجزیہ کرنے سے پہلے، آپ کو دریافت کرنا ہوگا کہ وہاں کیا ہے، اسے ایک مستقل format میں transform کرنا، مختلف datasets کو ایک ساتھ join کرنا، اور برے records اور غائب values سنبھالنا۔

یہ ایک dedicated translation layer کا کام ہے۔

**AWS Glue** ایک fully managed ETL (Extract، Transform، Load) service ہے۔ اس کے دو اہم components ہیں:

**Glue Data Catalog**: ایک metadata store جو آپ کے S3 data کی وضاحت کرتا ہے — کون سی tables موجود ہیں، ان کے کون سے columns ہیں، data files کہاں ہیں۔ یہ آپ کے data lake کے لیے ایک card catalog کی طرح ہے۔

**Glue Crawlers**: خودکار agents جو S3 scan کرتے ہیں، schema infer کرتے ہیں، اور Data Catalog کو populate کرتے ہیں۔ اپنے S3 bucket پر ایک crawler چلائیں اور 10 منٹ بعد آپ کے پاس آپ کی تمام tables کا ایک catalog ہوتا ہے۔

**Glue Jobs**: serverless Spark/Python jobs جو اصل transformation انجام دیتے ہیں۔ آپ transformation logic لکھتے ہیں (یا Glue کا visual ETL tool استعمال کرتے ہیں)، اور Glue اسے managed infrastructure پر چلاتا ہے۔

Nimbus کے لیے:

1. Glue Crawler S3 میں orders data scan کرتا ہے → Glue Data Catalog میں ایک table definition بناتا ہے
2. Glue Job خام JSON order events کو ایک صاف، partitioned Parquet format میں transform کرتا ہے
3. Transformed data واپس S3 میں ایک query-optimized layout میں لکھا جاتا ہے

**جب ETL ٹوٹتا ہے: Schema Evolution کا مسئلہ**

Glue pipeline پہلے تین ہفتوں کے لیے صاف ستھرا چلی۔ پھر ریستوران partner #412 نے اپنے menu export میں ایک نیا field شامل کیا: `allergen_tags`۔ Field strings کا ایک array تھا — `["gluten", "dairy", "nuts"]` — اور یہ ریستوران کے رات کے data export میں ظاہر ہوا۔

Glue job کا schema سخت تھا۔ یہ order JSON میں مخصوص fields کی توقع کرنے کے لیے لکھا گیا تھا۔ جب اس کا سامنا `allergen_tags` سے ہوا — ایک field جو schema میں نہیں تھا — Glue job ناکام ہو گئی۔

47 ریستورانوں سے چھ گھنٹے کا order data (سب partner #412 جیسا ہی menu export format استعمال کرتے ہوئے) process کیے بغیر S3 میں جمع ہو گیا۔ رات کا Glue run جسے گزشتہ رات کے آرڈرز کو صبح تک قابل query بنانا تھا اس کے بجائے 2:47 AM پر رک گیا تھا اور CloudWatch کو ایک failure record لکھا تھا۔

Tom نے اسے تب پایا جب اس نے 9 AM پر ایک Athena query چلانے کی کوشش کی اور پچھلے 12 گھنٹوں کے لیے `0 rows returned` ملا۔

"ETL اس لیے ٹوٹی کہ source data بدلا؟" Maya نے پوچھا، جب Leo نے وضاحت کی کہ کیا ہوا تھا۔

"ETL اس لیے ٹوٹی کہ ETL کو معلوم نہیں تھا کہ ایک schema change کیسے سنبھالے،" Leo نے کہا۔ "ہم نے ایک سخت job لکھی جو بالکل ان fields کی توقع کرتی تھی۔ جب ایک نیا field ظاہر ہوا، یہ گھبرا گئی۔"

"اور اگر کوئی ایک schema change کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "ایک malicious ریستوران partner جان بوجھ کر pipeline کو crash کرنے کے لیے غیر متوقع fields submit کر رہا ہو؟"

سوال غور کے قابل تھا۔ ایک ETL pipeline جو غیر متوقع input پر crash ہوتی ہے ایک denial-of-service vector ہے: ایک غیر معمولی data format submit کریں، pipeline crash کریں، اور وہ ریستوران (اور format شیئر کرنے والے باقی تمام) processing بند کر دیتے ہیں۔

Fix کے دو حصے تھے:

**Glue schema evolution**: Glue کا dynamic frame schema evolution سپورٹ کرتا ہے — توقع شدہ schema میں نہ ہونے والے fields failures کا سبب بننے کے بجائے pass-through ہو جاتے ہیں۔ اسے job script میں DataFrames کے بجائے DynamicFrames استعمال کر کے فعال کریں، additional options میں `mergeSchema` سیٹ کے ساتھ۔ نئے fields اگلے crawler run پر خودبخود schema میں شامل ہو جاتے ہیں۔

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

**Glue job alerting**: Pipeline failure Tom کے نوٹ کرنے سے پہلے تقریباً چھ گھنٹے خاموش تھی۔ Glue job run state (`FAILED`) پر ایک CloudWatch alarm 5 منٹ کے اندر on-call engineer کو alert کر دیتا۔ Alarm کی لاگت: دس سینٹ ماہانہ — مؤثر طور پر مفت (metric خود کچھ خرچ نہیں کرتا، اور پہلے دس alarms free tier میں آتے ہیں)۔

"چھ گھنٹے کا data S3 میں unprocessed بیٹھا رہا،" Leo نے کہا، Glue job کو دستی طور پر دوبارہ چلا کر catch up کرنے کے بعد۔ "کچھ نہیں کھویا — لیکن analytics اتنا پیچھے تھیں۔ اگر ہمارے پاس alarm ہوتا، تاخیر 30 منٹ ہوتی۔"

وسیع تر سبق: external data process کرنے والی ETL pipelines کو schema changes کو احسن طریقے سے سنبھالنے کی ضرورت ہے۔ External partners — ریستوران، payment providers، delivery services — اپنے data formats بدلیں گے۔ Pipeline کو ان تبدیلیوں سے brittle نہیں ہونا چاہیے۔

**Query Layer: S3 پر براہ راست SQL**

اب data S3 میں تھا، Parquet format میں، date کے لحاظ سے partitioned۔ آخری ٹکڑا: اس سے سوالات پوچھنے کا ایک طریقہ اسے پہلے ایک database میں load کیے بغیر۔

**Amazon Athena** ایک serverless، interactive query service ہے جو SQL queries کو براہ راست S3 data پر چلاتا ہے۔ provision کرنے کے لیے کوئی database نہیں، load کرنے کے لیے کوئی data نہیں۔ آپ ایک table define کرتے ہیں (یا Glue Data Catalog استعمال کرتے ہیں)، SQL لکھتے ہیں، اور Athena query کو S3 files کے خلاف execute کرتا ہے۔

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

Athena pricing اس پر مبنی ہے کہ ایک query کتنا data scan کرتی ہے۔ us-east-1، us-west-2، اور زیادہ تر بڑے regions میں، معیاری SQL queries فی terabyte scanned $5 خرچ کرتی ہیں۔ Parquet format (columnar) کو partition pruning کے ساتھ استعمال کرنا (`WHERE year='2024' AND month='09'`) کا مطلب ہے Athena صرف وہی files scan کرتا ہے جن کی اسے ضرورت ہے، جو ڈرامائی طور پر لاگت کم کرتا ہے۔

"ہم 30 دنوں کے data کے لیے یہ query چلا سکتے ہیں،" Leo نے کہا، "اور اگر ہم اسے اچھی طرح اسٹور کریں تو اس کی حیران کن طور پر کم لاگت آ سکتی ہے۔"

"یہ اتنی کم لاگت کیسے آ سکتی ہے؟" Maya نے پوچھا۔ "اگر یہ terabytes data scan کر رہا ہے، تو یہ مہنگا کیسے نہیں؟"

Leo نے Parquet کی وضاحت کی۔ ایک row-based format (JSON، CSV) میں، بیس میں سے دو columns تلاش کرنے والی ایک query کو سب بیس پڑھنا پڑتا ہے۔ Parquet جیسے columnar format میں، یہ صرف وہی دو پڑھتا ہے جن کی اسے ضرورت ہے۔ ایک 50TB dataset کے لیے، ایک اچھی طرح optimized query شاید 200GB scan کرے۔ $5/TB پر، یہ ایک ڈالر ہے۔

"اور اگر کوئی حادثاتی طور پر پوری table query کرے؟" Maya نے زور دیا۔

"یہ اصل cost خطرہ ہے،" Leo نے کہا۔

آپ شاید سوچ رہے ہوں: اگر Athena فی terabyte scanned charge کرتا ہے، تو کیا ایک خراب طریقے سے لکھی گئی query ایک بڑا غیر متوقع bill پیدا کر سکتی ہے؟ ہاں — اور یہ حقیقی production environments میں ہوتا ہے۔ ایک 50TB unoptimized table کے خلاف ایک query آپ کے پورے ماہانہ S3 bill سے زیادہ خرچ کر سکتی ہے۔ یہی وجہ ہے کہ Parquet format اور partitioning اختیاری optimizations نہیں ہیں — وہ cost controls ہیں۔ Athena workgroup query scan limits بھی سپورٹ کرتا ہے جو cap کرتے ہیں کہ ایک واحد query کو کتنا data scan کرنے کی اجازت ہے۔

"کسی بھی صوابدیدی سوال کے لیے جو ہم سوچ سکتے ہیں؟" Tom نے پوچھا۔

"کسی بھی سوال کے لیے جسے ہم SQL میں ظاہر کر سکیں، کسی بھی data کے خلاف جو ہم نے S3 میں اسٹور کیا ہے۔"

Tom Leo کے laptop پر بیٹھا اور پہلی query لکھی:

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

Query 11 سیکنڈ چلی۔ نتیجہ: 20 ریستوران، سب سے تیز اوسط confirmation time کے لحاظ سے sorted، ان کی reorder rates کے ساتھ۔

Tom نے output کو گھورا۔

سب سے تیز-confirm کرنے والے ریستوران — وہ جنہوں نے آرڈرز کو اوسطاً 3-4 منٹ کے اندر acknowledge اور confirm کیا — کی اوسط reorder rate 41% تھی۔ سب سے سست-confirm کرنے والے ریستوران (اوسط confirmation time 18-22 منٹ) کی reorder rate 13% تھی۔

"جو ریستوران جلدی confirm کرتے ہیں انہیں تین گنا repeat business ملتا ہے،" Tom نے کہا۔

"یہ ایک بہت بڑا فرق ہے،" Maya نے کہا۔ "confirmation speed reorder rate کو اتنا کیوں متاثر کرے گی؟"

"کیونکہ customer نے ایک آرڈر دیا اور پھر وہاں بیٹھ کر اپنا phone دیکھتا رہا،" Leo نے کہا۔ "اگر confirmation 3 منٹ میں آتی ہے، وہ یقین محسوس کرتے ہیں۔ اگر یہ 22 منٹ میں آتی ہے — یا کبھی نہیں — وہ بے چینی محسوس کرتے ہیں۔ بے چینی product failure ہے، چاہے کھانا ٹھیک پہنچ جائے۔"

"یہ ایک product insight ہے،" Maya نے کہا۔ "صرف ایک analytics insight نہیں۔ ہمیں ریستورانوں کو category اوسط کے مقابلے میں ان کا confirmation time benchmark دکھانا چاہیے۔"

Athena query نے 1.2 GB data scan کیا تھا (Parquet format میں دو ماہ کے آرڈرز، year اور month کے لحاظ سے partitioned)۔ لاگت: $0.006۔

آدھا سینٹ۔ ایک business insight کے لیے جس نے بدل دیا کہ Nimbus ریستوران onboarding کیسے ڈیزائن کرے گا — کن ریستورانوں کو success coaching کے لیے ترجیح دے، partner SLAs کے حصے کے طور پر کون سے confirmation time targets سیٹ کرے۔

Tom کے چہرے پر کسی ایسے شخص کا تاثر تھا جو اس تمام data کی قدر دوبارہ حساب کر رہا تھا جسے وہ پھینک رہے تھے۔

"اور اگر کوئی query layer کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "یا بس ایک analyst جو حادثاتی طور پر خام order data سے customer addresses export کرے؟ Customer PII، order histories، financial records — کون کنٹرول کرتا ہے کہ کون سی tables visible بھی ہیں؟"

اس کے سوال ختم کرنے سے پہلے، Leo نے operational مسئلہ بھی محسوس کر لیا تھا: آپ ایک team کو ایک ایسا catastrophic full-table scan چلانے سے کیسے روکیں جو ایک واحد query میں $500 کا Athena bill پیدا کرے؟

**Athena Workgroups** دونوں مسائل بیک وقت حل کرتے ہیں۔

ایک workgroup ایک named configuration ہے جو Athena users کو group کرتا ہے اور shared settings لاگو کرتا ہے: query result location، encryption، اور — اہم طور پر — per-query data scan limits۔

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

`analytics-team` workgroup پر ایک analyst حادثاتی طور پر 50TB data scan نہیں کر سکتا اور ایک $250 Athena charge پیدا نہیں کر سکتا۔ Query منسوخ ہو جاتی ہے جب یہ 10GB data scan سے تجاوز کرے۔ Analyst ایک error message دیکھتا ہے اور جانتا ہے کہ انہیں ایک partition filter شامل کرنے کی ضرورت ہے۔

Workgroups فی team علیحدہ result locations بھی نافذ کرتے ہیں: engineering team کے query results `s3://nimbus-query-results/engineering/` کو جاتے ہیں؛ finance team کے results `s3://nimbus-query-results/finance/` کو جاتے ہیں۔ کوئی cross-team query result رسائی نہیں۔

IAM کنٹرول کرتا ہے کہ کون سے users کون سا workgroup استعمال کر سکتے ہیں۔ خودکار reports چلانے والا ایک Lambda function `finance-reports` workgroup استعمال کرتا ہے (سختی سے capped)۔ ایک production مسئلہ debug کرنے والا ایک engineer `engineering-team` workgroup استعمال کرتا ہے (وسیع cap، منسوخ نہیں warn)۔ خام events table (customer PII پر مشتمل) تک رسائی Glue Data Catalog table پر ایک IAM condition کے ذریعے `engineering-team` workgroup تک محدود ہے۔

"یہ صرف cost control نہیں،" Priya نے کہا۔ "یہ access control ہے۔ Workgroups نفاذ کا نقطہ ہیں۔"

اس نے اس کے سوال کا مکمل جواب دیا۔ ہر data pipeline بحث جو access control کو چھوڑ دیتی ہے بالآخر ایک compliance incident بن جاتی ہے — اور یہاں، analytics team نے صرف aggregated order tables دیکھے، جبکہ customer PII والے خام events ایک واضح IAM authorization کے پیچھے رہے۔ Glue Data Catalog صرف ایک schema directory نہیں تھا۔ یہ ایک access control boundary تھا۔

"یہ اضافی کام نہیں،" Priya نے کہا۔ "یہ ڈیزائن ہے۔"

**Data Lake Architecture**

یہ تین services مل کر اس میں جمع ہوتی ہیں جسے ایک **data lake architecture** کہا جاتا ہے — آپ کے تمام data کے لیے ایک مرکزی S3 repository، اسے process اور query کرنے کے tools کے ساتھ:

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

خام data ہمیشہ محفوظ رہتا ہے (اصل S3 bucket میں)۔ Transformed data Athena کے ذریعے قابل query ہے۔ نئے سوالات کا ہمیشہ خام data پر نئے Glue jobs چلا کر جواب دیا جا سکتا ہے۔

**Amazon Redshift: جب Athena کافی نہ ہو**

کچھ use cases کے لیے، Athena بہت سست یا بہت مہنگا ہے:

- بہت سے joins والی بہت پیچیدہ queries
- وہ dashboards جو فی دن ہزاروں بار ایک ہی query چلاتے ہیں
- structured data پر machine learning
- BI tools کے لیے sub-second response time requirements

**Amazon Redshift** ایک fully managed data warehouse ہے: بڑے، بار بار آنے والے analytical workloads کے لیے ڈیزائن کیا گیا ایک columnar analytics database۔ Athena کے برعکس، جو data کو وہیں query کرتا ہے جہاں یہ S3 میں رہتا ہے، Redshift data کو optimized warehouse storage میں load کرتا ہے اور پیچیدہ analytics کو تیز کرنے کے لیے query optimization، sort strategies، اور distribution strategies استعمال کرتا ہے۔

اگر آپ کا data volume چھوٹا ہے اور آپ کی queries کبھی کبھار (ہفتہ وار یا ماہانہ) چلتی ہیں، اچھی طرح منظم S3 data کے ساتھ Athena کافی اور تقریباً مفت ہے — لیکن اگر آپ وہی analytical dashboards فی دن سینکڑوں بار چلاتے ہیں، Redshift کا pre-optimized columnar storage تیز اور بالآخر زیادہ cost-effective ہوگا، اس کے باوجود کہ data کو پیشگی load کرنے کی ضرورت ہوتی ہے۔

Redshift پیچیدہ analytics queries کے لیے نمایاں طور پر تیز ہے، cost (provisioned capacity) اور query کرنے سے پہلے data load کرنے کی requirement کی قیمت پر۔

**Redshift Serverless** capacity planning کا بوجھ ہٹا دیتا ہے — آپ query کرتے ہیں، Redshift scale کرتا ہے۔ Cost دراصل استعمال شدہ compute capacity پر مبنی ہے، **RPU-hours** میں ناپی جاتی ہے اور فی سیکنڈ bill کی جاتی ہے (فی activation 60-سیکنڈ minimum کے ساتھ)، علاوہ managed storage فی GB-month — اور warehouse کے idle بیٹھے رہنے کے دوران compute کے لیے کچھ نہیں۔ (Athena وہ ہے جس کی فی query قیمت ہے: $5 فی TB scanned۔)

Nimbus کے ان کے موجودہ پیمانے پر: Athena کافی ہے۔ data volume کے پانچ گنا پر اور BI tools کے فی دن سینکڑوں بار وہی dashboards query کرنے کے ساتھ، Redshift cost-effective بن جائے گا۔

**جب Athena غلط Tool ہو**

"تو پیچ کیا ہے؟" Maya نے پوچھا۔ "ہم ہر چیز کے لیے Athena کیوں نہ استعمال کریں؟ یہ serverless ہے، فی query ادائیگی، کوئی infrastructure نہیں — یہ perfect لگتا ہے۔"

وہ صورتیں جہاں Athena صحیح جواب نہیں:

**High-frequency dashboards**: ایک customer-facing analytics dashboard جو ہر 30 سیکنڈ میں refresh ہوتا ہے اور فی منٹ 50 queries چلاتا ہے Athena کا اچھا use case نہیں۔ $5/TB scanned پر، ان queries کو اس frequency پر cost-effective ہونے کے لیے انتہائی اچھی طرح optimized ہونے کی ضرورت ہے۔ sub-second response time requirements والے dashboards کے لیے Redshift یا ایک pre-aggregated database (RDS بھی) زیادہ مناسب ہے۔

**کم latency requirements والی operational queries**: اگر ایک customer service agent کو ایک مخصوص آرڈر 500ms سے کم میں دیکھنا ہو، Athena tool نہیں — ایک DynamoDB lookup یا ایک RDS query ہے۔ Athena analytical throughput کے لیے optimized ہے، operational latency کے لیے نہیں۔ ایک چھوٹے dataset پر ایک اچھی طرح tuned Athena query کا بھی 1-3 سیکنڈ کا cold-start overhead ہوتا ہے۔

**Transactional systems**: Athena read-only ہے۔ آپ Athena میں records INSERT، UPDATE، یا DELETE نہیں کر سکتے (سوائے Lake Formation یا Iceberg table format جیسے مخصوص integrations کے ذریعے، جن کی اپنی پیچیدگی ہے)۔ operational write workloads کے لیے، ایک transactional database استعمال کریں۔

**بہت چھوٹے، بار بار بدلتے datasets**: اگر آپ کا dataset ہر منٹ بدلتا ہے اور صرف 1GB ہے، اسے RDS یا DynamoDB میں load کرنا اور وہاں query کرنا S3 files کے خلاف Athena queries چلانے سے آسان اور تیز ہے جو شاید stale ہوں۔ Athena S3 files کو query کے وقت کے مطابق query کرتا ہے — اگر files 2 منٹ پہلے لکھی گئیں، یہ وہ freshness ہے جو آپ کو ملتی ہے۔

ابھرنے والا pattern: Athena بڑے پیمانے کی، کبھی کبھار، ad-hoc analytical queries کے لیے S3 data کے خلاف بہترین ہے۔ کسی بھی operational، transactional، یا sub-second latency کی ضرورت والی چیز کے لیے، مناسب operational database استعمال کریں۔

**Kinesis بمقابلہ SQS: الجھن دور کرنا**

یہ وہ سوال ہے جو ہر data architecture بحث پر آتا ہے۔ Kinesis اور SQS دونوں messages سے نمٹتے ہیں۔ آپ ہر ایک کب استعمال کرتے ہیں؟

الجھن سطحی مشابہت سے آتی ہے: دونوں producers سے messages قبول کرتے ہیں۔ دونوں وہ messages consumers کو deliver کرتے ہیں۔ دونوں managed AWS services ہیں۔ لیکن ان کے data models بنیادی طور پر مختلف ہیں۔

**SQS (Simple Queue Service)** ایک task queue ہے۔ آپ ایک message ڈالتے ہیں۔ ایک consumer اسے نکالتا اور process کرتا ہے۔ جب processing مکمل ہو، message delete ہو جاتی ہے۔ اگر آپ کے دس consumers ہوں، ہر message ان میں سے بالکل ایک کو جاتی ہے۔ Message consumption کے بعد ختم ہو جاتی ہے۔

**Kinesis Data Streams** ایک log ہے۔ آپ ایک record ڈالتے ہیں۔ ہر consumer ہر record پڑھتا ہے۔ Consumer A ان سب کو پڑھتا ہے۔ Consumer B بھی ان سب کو پڑھتا ہے، اپنی رفتار پر۔ کوئی بھی consumer record delete نہیں کرتا — یہ stream میں رہتا ہے جب تک retention period ختم نہ ہو۔ آپ کسی بھی وقت ایک تیسرا consumer شامل کر سکتے ہیں، اور یہ stream کے آغاز سے پڑھ سکتا ہے (retention window کے اندر)۔

"آپ دراصل کب چاہیں گے کہ ہر consumer ہر message دیکھے؟" Maya نے پوچھا۔

جواب وہ use cases ہیں جہاں Kinesis چمکتا ہے:

**Real-time dashboard + fraud detection + S3 archive**: تینوں وہی order events stream بیک وقت consume کرتے ہیں۔ اگر آپ SQS استعمال کرتے، آپ کو تین علیحدہ queues کو publish کرنا پڑتا — اور جو بھی publish کرے اسے تینوں consumers کے بارے میں جاننا ہوگا۔ Kinesis کے ساتھ، producer ایک بار publish کرتا ہے؛ کسی بھی تعداد میں consumers آزادانہ پڑھ سکتے ہیں۔

**Replay**: ایک consumer 2 گھنٹے ناکام ہوتا ہے (Lambda concurrency limit ٹکرائی، downstream service بند)۔ SQS کے ساتھ، وہ messages پہلے ہی delete ہو گئیں (یا ان کا ایک متعین visibility timeout ہے)۔ Kinesis کے ساتھ، consumer اپنے آخری checkpoint سے دوبارہ شروع ہوتا ہے اور 2 گھنٹے کے چھوٹے ہوئے records process کرتا ہے۔ Data stream میں retain ہوا (Extended Data Retention کے ساتھ 365 دن تک)۔

**ایک shard کے اندر order**: ایک ہی partition key والے records ہمیشہ ایک ہی shard کو جاتے ہیں، order محفوظ رکھتے ہوئے۔ ایک stock trading system کے لیے جہاں آپ کو symbol `AMZN` کے تمام trades ترتیب میں process کرنے کی ضرورت ہو، Kinesis اس کی ضمانت دیتا ہے۔ SQS FIFO فی-group ordering فراہم کرتا ہے لیکن کم throughput پر (standard mode میں batching کے ساتھ فی queue 3,000 messages/سیکنڈ تک — high-throughput mode اسے دسیوں ہزار تک بڑھاتا ہے — بمقابلہ Kinesis کے فی shard 1 MB/s یا 1,000 records/s، جتنے بھی shards آپ کو چاہیں ان سے ضرب)۔

فیصلہ کن سوال: **کیا ہر message کو بالکل ایک consumer کے ذریعے consume ہونا اور پھر discard ہونا ضروری ہے؟** → SQS۔ **کیا ہر message کو متعدد consumers کے ذریعے آزادانہ دیکھا جانا ضروری ہے، یا کیا آپ کو replay صلاحیت چاہیے؟** → Kinesis۔

Nimbus کے real-time dashboard کے لیے: Kinesis۔ متعدد consumers (dashboard، fraud detection، S3 archive) سب وہی stream پڑھتے ہوئے۔

Nimbus کے order processing queue کے لیے (ایک آرڈر دیا گیا → ایک ECS task اسے process کرتا ہے): SQS۔ ایک consumer، کوئی replay درکار نہیں، کوئی fan-out درکار نہیں۔

## Data کی Visualization: Amazon QuickSight

Athena data query کرتا ہے۔ Glue اسے تیار کرتا ہے۔ لیکن کسی نقطے پر کسی کو ایک chart دیکھنے کی ضرورت ہوتی ہے — اور console میں SQL queries چلا کر نہیں۔

"کیا ہمیں واقعی اس کے لیے ایک اور service چاہیے؟" Maya نے پوچھا۔ "کیا میں بس Athena results کو ایک spreadsheet میں export نہیں کر سکتی؟"

"ایک query کے لیے، ہاں،" Tom نے کہا۔ اس کے چہرے پر کسی ایسے شخص کا تاثر تھا جس نے یہ پہلے ہی آزما لیا تھا۔ "ایک dashboard کے لیے جسے آپ پوری team کے ساتھ شیئر کرنا چاہتے ہیں، یہ ہر صبح ایک نیا spreadsheet ہے۔"

**Amazon QuickSight** AWS کی managed business intelligence (BI) service ہے۔ یہ براہ راست Athena، S3، RDS، Redshift، اور دیگر sources سے connect ہوتا ہے، اور آپ کو ایک علیحدہ BI server کے بغیر dashboards اور visualizations بنانے دیتا ہے۔

اہم features:

- **SPICE** (Super-fast، Parallel، In-memory Calculation Engine): QuickSight datasets کو اپنے in-memory engine میں import کر سکتا ہے پیمانے پر sub-second query performance کے لیے، ہر dashboard load پر Athena کو دوبارہ query کیے بغیر
- **ML Insights:** anomaly detection اور forecasting built-in — کوئی data science درکار نہیں
- **Embedded dashboards:** آپ QuickSight dashboards کو اپنی web application میں ایک URL کے ذریعے embed کر سکتے ہیں

Tom نے QuickSight کو Athena data source سے connect کیا اور ایک دوپہر کے اندر روزانہ آرڈرز، ریستوران کے لحاظ سے revenue، اور conversion funnel دکھاتا ایک working dashboard بنا لیا۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" اس نے پوچھا — پھر کسی اور کے کرنے سے پہلے اپنے سوال کا جواب دیا۔ "QuickSight فی author تقریباً $24/مہینہ چلتا ہے — وہ لوگ جو dashboards بناتے ہیں — اور فی reader $3/مہینہ۔ ہمارے چار لوگ ہیں جو اسے استعمال کریں گے۔"

"تو تقریباً سو ڈالر ماہانہ،" Maya نے کہا۔

"ایک BI service کے لیے جسے بصورت دیگر ایک علیحدہ analytics server چلانے کی ضرورت ہوتی،" Priya نے کہا۔ "ہاں۔"

Tom نے dashboard publish کیا۔ اگلی صبح، Athena queries چلانے کے بجائے، پوری team نے ایک URL کھولا۔

> **امتحانی نکتہ — QuickSight**
>
> QuickSight AWS کی managed BI اور visualization service ہے۔ Athena، S3، Redshift، RDS سے connect ہوتا ہے۔ SPICE in-memory query engine ہے جو بار بار dashboard queries کو تیز کرتا ہے۔ امتحانی trigger: "AWS پر business intelligence dashboard" یا "Athena/Redshift سے data visualize کریں" → QuickSight۔

## Lake کی نگرانی: AWS Lake Formation

جیسے Nimbus کا data lake بڑھا، data access ایک governance مسئلہ بن گیا۔

"خام transaction logs کون query کر سکتا ہے؟" Priya نے اگلے architecture review میں پوچھا۔ "customer PII کون دیکھ سکتا ہے؟ financial summary tables کون access کر سکتا ہے؟"

"Engineering کے پاس مکمل رسائی ہے،" Leo نے کہا۔ "Analytics team کے پاس aggregated tables تک رسائی ہے۔ Finance کے پاس revenue tables تک رسائی ہے۔"

"کہاں configured؟"

Leo رکا۔ "میں... چند مختلف جگہوں میں۔ S3 bucket policies، IAM policies، Glue catalog permissions۔"

"تین علیحدہ systems، جن سب کو مستقل ہونا ضروری ہے،" Priya نے کہا۔ "کیا ہوتا ہے جب ہم ایک نیا analyst شامل کریں؟ یا جب ہم analytics team سے ایک مخصوص column — مثلاً customer phone numbers — تک رسائی محدود کرنے کا فیصلہ کریں؟"

اس سوال نے خلا کو بے نقاب کیا۔ S3 bucket policies، IAM، اور Glue Data Catalog میں fine-grained data access بیک وقت manage کرنا brittle تھا۔

**AWS Lake Formation** ایک managed service ہے جو آپ کے data lake کے لیے access control کو مرکزی بناتا ہے۔ bucket policies، IAM policies، اور Glue catalog permissions کو علیحدہ علیحدہ manage کرنے کے بجائے، Lake Formation آپ کے data پر column-level، row-level، اور table-level permissions دینے کے لیے ایک واحد جگہ فراہم کرتا ہے۔

اہم features:

- S3 اور Glue Data Catalog کے اوپر بیٹھتا ہے — کوئی data migration درکار نہیں
- **Fine-grained access control:** مخصوص users یا roles کو مخصوص tables، columns، یا حتیٰ کہ filtered rows تک رسائی دیں — S3 data پر database-level permissions کے مساوی
- **Data filtering:** جب ایک user Athena کے ذریعے Lake Formation-governed table query کرتا ہے، Lake Formation خودبخود ان columns یا rows کو filter کر دیتا ہے جنہیں انہیں دیکھنے کی اجازت نہیں

Priya نے تین permission tiers کے ساتھ Lake Formation سیٹ اپ کیا، Rafael کے column-level rules drafting کے ساتھ: engineering role نے تمام tables اور تمام columns دیکھے۔ Analytics role نے aggregated order tables دیکھے لیکن customer PII columns نہیں۔ Finance role نے customer identifiers masked کے ساتھ revenue tables دیکھے۔

"تو analyst وہی Athena query چلاتا ہے،" Leo نے تصدیق کی۔ "لیکن Lake Formation اسے intercept کرتا ہے اور ان columns کو strip کر دیتا ہے جنہیں دیکھنے کے لیے وہ authorized نہیں؟"

"درست۔ Filtering خودکار ہے۔ Analyst کو جاننے کی ضرورت نہیں کہ یہ ہو رہا ہے — اور وہ خام S3 files کو براہ راست query کر کے اس کے گرد کام نہیں کر سکتے، کیونکہ Lake Formation catalog کی سطح پر access کنٹرول کرتا ہے۔"

"یہ اضافی کام نہیں،" Priya نے کہا۔ "یہ ڈیزائن ہے۔"

> **امتحانی نکتہ — Lake Formation**
>
> Lake Formation S3 اور Glue Data Catalog پر بنے ایک data lake کے لیے access control کو مرکزی بناتا ہے۔ table، column، اور row کی سطح پر fine-grained permissions سپورٹ کرتا ہے۔ امتحانی trigger: "ایک S3 data lake میں مخصوص columns تک رسائی محدود کریں" یا "data lake governance کو مرکزی بنائیں" → Lake Formation۔ خام IAM سے اہم فرق: Lake Formation column- اور row-level filtering نافذ کرتا ہے جسے اکیلی IAM policies ظاہر نہیں کر سکتیں۔

## خوبیاں اور حدود

**Kinesis Data Streams**: Kinesis تب استعمال کریں جب آپ کا data مسلسل آتا ہے اور order اہم ہو — clickstreams، financial transactions، IoT telemetry۔ Kinesis ایک shard کے اندر record order محفوظ رکھتا ہے اور configured retention window کے دوران replay کی اجازت دیتا ہے (default کے طور پر 24 گھنٹے، Extended Data Retention کے ساتھ 365 دن تک)، جو اسے SQS سے بنیادی طور پر مختلف بناتا ہے۔ Trade-off operational پیچیدگی ہے: provisioned mode میں، آپ shard capacity اور consumer behavior manage کرتے ہیں۔ سادہ task queues کے لیے جہاں order اہم نہیں اور replay درکار نہیں، SQS آسان انتخاب ہے۔

**AWS Glue**: Glue ایک روایتی ETL cluster کا infrastructure ختم کرتا ہے۔ آپ transform logic لکھتے ہیں؛ AWS Spark environment manage کرتا ہے۔ یہ قیمتی ہے جب transforms پیچیدہ ہوں یا data volumes بڑے ہوں۔ حد cost اور cold start ہے — Glue jobs کا کئی منٹ کا startup delay ہوتا ہے، جو انہیں near-real-time transforms کے لیے نامناسب بناتا ہے۔ سادہ file format conversions (CSV سے Parquet) کے لیے، Glue کا overhead ایک Lambda function یا ایک ہلکے script کے مقابلے میں شاید قابل نہ ہو۔

**Amazon Athena**: Athena آپ کو S3 data کو معیاری SQL کے ساتھ اور manage کرنے کے لیے کوئی infrastructure کے بغیر query کرنے دیتا ہے۔ اہم رکاوٹ cost ہے: Athena فی terabyte data scanned charge کرتا ہے۔ ایک 10 TB table کے خلاف ایک query جو پوری چیز scan کرتی ہے ایک Parquet-formatted، partitioned table کے خلاف اسی query سے نمایاں طور پر زیادہ خرچ کرتی ہے جو 200 GB scan کرتی ہے۔ production میں Athena چلانے سے پہلے ہمیشہ columnar formats (Parquet یا ORC) استعمال کریں اور اپنا data partition کریں۔ ان optimizations کے بغیر، Athena bills آپ کو حیران کر سکتے ہیں۔

## خلاصہ

باب 25 میں network کام نے Nimbus کی data pipeline کو ممکن بنایا۔ یہ باب وہ ہے جس کے لیے وہ pipeline ہے: تمام data جو Nimbus پیدا کر رہا تھا اسے دراصل visible اور قابل عمل بنانا۔

- **Amazon Kinesis**: Real-time data streaming۔ Producers records لکھتے ہیں؛ consumers اپنی رفتار پر پڑھتے ہیں۔ Amazon Data Firehose پھر streaming data کو کم operational کام کے ساتھ S3، Redshift، اور دیگر destinations تک deliver کر سکتا ہے۔
- **AWS Glue**: ETL اور data cataloging۔ Crawlers schemas دریافت کرتے ہیں؛ Jobs data transform کرتے ہیں؛ Data Catalog data کو Athena اور دیگر tools کے لیے قابل دریافت بناتا ہے۔
- **Amazon Athena**: S3 پر serverless SQL۔ معیاری SQL استعمال کرتے ہوئے S3 میں کسی بھی data کو query کریں۔ فی TB scanned قیمت — لاگت کم سے کم کرنے کے لیے Parquet اور partitioning استعمال کریں۔
- **Amazon Redshift**: high-performance analytics کے لیے managed data warehouse۔ Data load کریں، بار بار آنے والی analytical queries کے لیے optimize کریں، اور warehouse پیمانے پر تیز query کریں۔
- **data lake pattern**: خام data سے S3 → Glue اسے transform کرتا ہے → Athena اسے query کرتا ہے → BI tools اسے visualize کرتے ہیں۔
- **Glue schema evolution**: external data process کرنے والی ETL pipelines کو schema changes احسن طریقے سے سنبھالنا ضروری ہے۔ upstream data کے نئے fields شامل کرنے پر pipeline failures سے بچنے کے لیے `mergeSchema: true` کے ساتھ DynamicFrames استعمال کریں۔
- **Athena Workgroups**: فی-team data scan limits اور result locations۔ ایک configuration میں cost control اور access control۔ کسی بھی multi-team Athena deployment کے لیے درکار۔
- **Kinesis بمقابلہ SQS**: متعدد consumers کو fan-out اور replay صلاحیت کے لیے Kinesis۔ سادہ task queues کے لیے SQS Standard؛ ordered، deduplicated task processing کے لیے SQS FIFO۔ فیصلہ کن سوال: کیا ہر consumer کو ہر message دیکھنے کی ضرورت ہے، یا ہر message ایک consumer کو جاتی ہے؟
- **جب Athena غلط ہو**: high-frequency dashboards (Redshift استعمال کریں)، operational queries (RDS یا DynamoDB استعمال کریں)، بہت چھوٹے بار بار بدلتے datasets (بس ایک database استعمال کریں)۔
- **Amazon QuickSight**: AWS کی managed BI service۔ ایک علیحدہ BI server چلائے بغیر dashboards بنانے کے لیے Athena، S3، Redshift، اور RDS سے connect ہوتا ہے۔ SPICE in-memory engine ہے جو بار بار dashboard queries کو تیز کرتا ہے۔
- **AWS Lake Formation**: S3 + Glue Data Catalog پر data lakes کے لیے مرکزی access control۔ column-level، row-level، اور table-level permissions کو قابل بناتا ہے — fine-grained data governance جسے اکیلی IAM ظاہر نہیں کر سکتی۔

## امتحانی نکات

*SAA-C03 ڈومین: High-Performing Architectures ڈیزائن کریں (ڈومین 3، ٹاسک 3.5)*

- **Kinesis بمقابلہ SQS**: Kinesis = ordered، real-time streaming، متعدد consumers، retention window کے اندر replay (24 گھنٹے default، 365 دن تک)۔ SQS = task queue، ہر message ایک بار process کیا گیا۔ "متعدد consumers ایک ہی stream بیک وقت پڑھتے ہوئے" → Kinesis۔ "فی message ایک worker" → SQS۔
- **Athena امتحانی signals**: "S3 پر serverless SQL،" "S3 data کا تجزیہ اسے ایک database میں load کیے بغیر،" "فی query ادائیگی" → Athena۔
- **Athena cost optimization**: Columnar format (Parquet یا ORC) + partitioning ڈرامائی طور پر scanned data اور cost کم کرتا ہے۔ امتحان پوچھ سکتا ہے کہ Athena costs کیسے کم کریں۔
- **Athena pricing**: $5 فی TB scanned (us-east-1، us-west-2، اور زیادہ تر بڑے regions)۔ Cost scanned data پر حساب کی جاتی ہے، returned data پر نہیں — production queries چلانے سے پہلے ہمیشہ storage format optimize کریں۔
- **Glue Crawler**: "S3 data کا schema خودبخود دریافت کریں" → Glue Crawler۔
- **Amazon Data Firehose**: "consumers manage کیے بغیر streaming data کو S3/Redshift/OpenSearch میں خودبخود load کریں" → Amazon Data Firehose۔ پرانا مواد اب بھی اسے Kinesis Data Firehose کہہ سکتا ہے۔
- **Redshift بمقابلہ Athena**: ایک fixed dataset پر high-frequency، پیچیدہ queries کے لیے Redshift (BI dashboards)۔ بار بار بدلتے S3 data پر ad-hoc queries کے لیے Athena۔
- **EMR (Elastic MapReduce)**: AWS-managed Hadoop/Spark clusters۔ امتحان اسے تب استعمال کرتا ہے جب "موجودہ Hadoop/Spark workloads" یا "custom data processing frameworks" کا ذکر ہو۔ زیادہ تر use cases کے لیے Glue managed متبادل ہے۔
- **QuickSight:** AWS managed BI اور visualization۔ Athena، S3، Redshift، RDS سے connect ہوتا ہے۔ SPICE = تیز بار بار آنے والی queries کے لیے in-memory engine۔ امتحانی trigger: "AWS پر business intelligence dashboard" → QuickSight۔
- **Lake Formation:** ایک data lake (S3 + Glue Data Catalog) کے لیے مرکزی access control۔ Fine-grained permissions: table، column، اور row کی سطح۔ امتحانی trigger: "S3 data lake میں مخصوص columns تک رسائی محدود کریں" یا "data lake governance کو مرکزی بنائیں" → Lake Formation۔

## مشقیں

**مشق 1 — یادداشت**

Amazon Kinesis اور Amazon SQS کے درمیان فرق کی وضاحت کریں۔ آپ ہر ایک کب استعمال کریں گے؟

*(اشارہ: اس کے بارے میں سوچیں کہ کتنے consumers ایک ہی data پڑھ سکتے ہیں، کیا messages پڑھنے کے بعد delete ہوتے ہیں، اور کیا order اہم ہے۔)*

**مشق 2 — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک ride-sharing کمپنی trip data کا تجزیہ کرنا چاہتی ہے۔ روزانہ 1 ملین trips مکمل ہوتے ہیں۔ Trip records S3 میں JSON files کے طور پر اسٹور ہوتے ہیں (ہر ایک تقریباً 2KB)۔ Analytics team "پچھلے ہفتے شہر کے لحاظ سے اوسط trip duration" جیسی ad-hoc SQL queries چلانا چاہتی ہے۔ Queries کو 2 منٹ سے کم میں مکمل ہونا چاہیے۔ Storage costs کم سے کم کیے جانے چاہئیں۔ Team فی ہفتہ 20-30 queries چلائے گی۔

کون سا architecture ان ضروریات کو سب سے بہتر طریقے سے پورا کرتا ہے؟

A) date اور city کے لحاظ سے partitioned JSON کو Parquet format میں تبدیل کرنے کے لیے AWS Glue استعمال کریں؛ Amazon Athena سے query کریں  
B) trip data کو روزانہ RDS PostgreSQL میں load کریں؛ معیاری SQL استعمال کرتے ہوئے query کریں  
C) trip data کو Amazon Redshift میں deliver کرنے کے لیے Amazon Data Firehose استعمال کریں؛ Redshift سے query کریں  
D) trip data کو DynamoDB میں load کریں اور SQL queries کے لیے PartiQL استعمال کریں

**اشارہ 1**: فی ہفتہ 20-30 queries کم frequency ہے۔ کبھی کبھار querying کے لیے کون سی service سب سے زیادہ cost-effective ہے؟

**اشارہ 2**: Parquet format + partitioning ڈرامائی طور پر Athena کے ذریعے scanned data کم کرتا ہے — اور اس لیے cost۔

**اشارہ 3**: 1 ملین trips × 2KB = فی دن ~2GB۔ ایک ہفتے پر، ~14GB۔ Athena کے لیے $5/TB پر، optimization کے بغیر بھی، یہ سستا ہے۔

**جواب**: A

**وضاحت**: Glue JSON کو Parquet میں تبدیل کرتا ہے (columnar format ڈرامائی طور پر scanned data کم کرتا ہے) date اور city کے لحاظ سے partitioned (partition pruning کا مطلب "پچھلے ہفتے" queries صرف 7 دنوں کے partitions scan کرتی ہیں)۔ Athena S3 کو براہ راست معیاری SQL کے ساتھ query کرتا ہے۔ فی ہفتہ 20-30 queries کے لیے، pay-per-query Athena ہمیشہ-چلتے Redshift کے مقابلے میں انتہائی cost-effective ہے۔

**B کیوں نہیں؟** روزانہ 2GB data RDS میں load کرنا، پھر query کرنا، ایک database instance کو 24/7 چلانے کی ضرورت ہے۔ فی ہفتہ 20-30 queries کے لیے، یہ بہت زیادہ over-engineered اور مہنگا ہے۔

**C کیوں نہیں؟** Redshift high-frequency queries کے لیے cost-effective ہے (ایک ہی dataset پر فی دن سینکڑوں)۔ فی ہفتہ 20-30 queries کے لیے، ہمیشہ-on Redshift cluster Athena کی per-query pricing سے کہیں زیادہ خرچ کرتا ہے۔

**D کیوں نہیں؟** DynamoDB ایک key-value/document store ہے جو key-based access کے لیے optimized ہے، ad-hoc analytical queries کے لیے نہیں۔ DynamoDB پر PartiQL بیان کردہ قسم کی GROUP BY aggregations سپورٹ نہیں کرتا۔

*SAA-C03 ڈومین: High-Performing Architectures ڈیزائن کریں — ٹاسک 3.5*

**مشق 3 — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus آرڈرز کے لیے ایک real-time fraud detection system بنانا چاہتا ہے۔ System کو چاہیے:

- 60 سیکنڈ میں ایک ہی account کے ذریعے 5 بار سے زیادہ دیے گئے آرڈرز کا پتہ لگائے
- نئے accounts (< 30 دن پرانے) سے $500 سے اوپر کے آرڈرز کو flag کرے
- flagged آرڈرز کو ایک human review queue کو بھیجے

architecture ڈیزائن کریں۔ Kinesis کیا فراہم کرتا ہے؟ fraud logic کہاں چلتی ہے؟ آپ "ایک ہی account، 60-سیکنڈ window" کو کیسے correlate کرتے ہیں؟ کون سی service flagged آرڈرز وصول کرتی ہے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد real-time streaming architecture design کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے پہلی Athena query چلائی۔

"پچھلی سہ ماہی revenue کے لحاظ سے سرفہرست 10 ریستوران،" اس نے کہا۔

12 سیکنڈ بعد، نتائج ظاہر ہوئے۔

اس نے انہیں گھورا۔

"ریستوران 47 پہلا تھا،" اس نے کہا۔ یہ Maya کا خاندانی ریستوران تھا — وہ جہاں Nimbus شروع ہوا۔

"بالکل تھا،" Maya نے کہا۔ "Arepa اتنی اچھی ہے۔"

Tom نے ایک اور query چلائی۔ اور ایک اور۔ "یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے Leo کے کچھ کہنے سے پہلے پوچھا۔ Leo نے query scan history چیک کی۔ تین queries، کل data scanned: 1.2GB۔ لاگت: ایک سینٹ سے کم۔

ایک گھنٹے کے بعد، Tom کے پاس Nimbus کے business کی ایک مکمل تصویر تھی ایک ایسے طریقے سے جو اس کے پاس پہلے کبھی نہیں تھی۔ کون سی ریستوران categories سب سے تیز بڑھیں۔ کون سے customer cohorts سب سے طویل برقرار رہے۔ کون سے menu items نے سب سے زیادہ repeat orders پیدا کیے۔

"ہم نے یہ پہلے کیوں نہیں بنایا؟" اس نے پوچھا۔

"ہمارے پاس data تھا،" Leo نے کہا۔ "ہمارے پاس بس اسے استعمال کرنے کی pipeline نہیں تھی۔"

"Data ہمیشہ وہاں تھا،" Maya نے خاموشی سے کہا۔ "ہم بس اسے دیکھ نہیں سکتے تھے۔"

اگلے باب میں: اب جب ہم business کو واضح طور پر دیکھ سکتے ہیں، آئیے بات کرتے ہیں کہ اسے چلانے والے infrastructure کی ادائیگی کیسے کریں — زیادہ مؤثر طریقے سے۔
