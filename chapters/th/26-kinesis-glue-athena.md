# บทที่ 26: ทำความเข้าใจกับทุกอย่าง

ข้อมูลดิบคือ: timestamps, คลิก, events, ตัวเลข สารสนเทศคือสิ่งที่คุณได้เมื่อข้อมูลถูกจัดระเบียบ ประมวลผล และมีบริบท ช่องว่างระหว่างสองสิ่งนั้นคือที่ที่บทนี้อยู่

และในระบบที่กำลังเติบโต ช่องว่างนั้นมีค่าใช้จ่ายแพงขึ้นอย่างรวดเร็ว

Nimbus กำลังสร้างข้อมูลจำนวนมหาศาล ทุกคำสั่งซื้อ: ถูกบันทึก ทุกการดูเมนู: ถูก log ไว้ ทุกการอัปเดตของร้านอาหาร: ถูกจับ ทุกการโต้ตอบของลูกค้า: ถูกติดตาม

Tom มีคำถาม

"เวลาสั่งอาหารที่ยุ่งที่สุดของเราในวันศุกร์คือเมื่อไหร่?"

Leo มองเขา "ไม่มีในแดชบอร์ดของเรา"

"เราเพิ่มได้ไหม?"

"ข้อมูลอยู่ใน DynamoDB และใน CloudWatch logs และใน S3 จาก analytics export job" Leo หยุด "สามที่ต่างกัน ในสามรูปแบบที่แตกต่างกัน"

Maya เสริมว่า: "และ analytics export ทำงานเพียงคืนละครั้ง ถ้าคุณต้องการข้อมูลวันศุกร์ คุณต้องรอจนถึงเช้าวันเสาร์"

Tom มองหน้าจอ "ดังนั้นเรามีข้อมูล แต่เราใช้มันไม่ได้"

ประโยคนั้นอธิบาย analytics สมัยใหม่ได้ครึ่งหนึ่ง

นี่คือปัญหา data engineering: คุณมีข้อมูล แต่ไม่อยู่ในรูปแบบที่คุณสามารถวิเคราะห์ได้เมื่อต้องการ

**ปัญหาสามมิติ**

ปัญหาข้อมูลของ Nimbus มีสามมิติ:

**Real-time streaming**: คำสั่งซื้อกำลังถูกสั่งอยู่ตอนนี้ คุณต้องการเห็นแดชบอร์ดสดของความเร็วในการสั่งอาหาร — กี่รายการต่อนาที แยกตาม region แยกตามร้านอาหาร ข้อมูลต้องถูกประมวลผลเมื่อมันมาถึง

**Data transformation**: ข้อมูลอยู่ใน S3 จากระบบต่างๆ ในรูปแบบต่างกัน (JSON, CSV, Parquet) ก่อนที่คุณจะวิเคราะห์ได้อย่างมีประสิทธิภาพ คุณต้องทำให้เป็นมาตรฐาน — schema เดียวกัน รูปแบบเดียวกัน ทำความสะอาด เชื่อมกับข้อมูลอ้างอิง

**Ad-hoc analysis**: เมื่อข้อมูลถูกจัดระเบียบแล้ว คุณต้องการรัน SQL queries กับมันโดยไม่ต้องโหลดลงในฐานข้อมูลก่อน "ให้ร้านอาหาร 10 อันดับแรกตามรายได้ใน 30 วันที่ผ่านมา" โดยไม่ต้องโหลดข้อมูลลงฐานข้อมูล

แต่ละปัญหาเป็นปัญหาที่แยกต่างหาก AWS มีบริการเฉพาะสำหรับแต่ละอัน:

- **Amazon Kinesis**: Streaming ข้อมูล real-time
- **AWS Glue**: การแปลงและจัดทำแค็ตตาล็อกข้อมูล
- **Amazon Athena**: SQL queries แบบ serverless บน S3

**Amazon Kinesis: เครื่องพิมพ์ข่าว Real-Time**

**Amazon Kinesis Data Streams** คือบริการ streaming ข้อมูล real-time Producers ส่ง data records ไปยัง stream Consumers หลายตัวสามารถอ่านจาก stream พร้อมกันได้ แต่ละตัวตามจังหวะของตัวเอง

ลองนึกภาพเครื่องพิมพ์ ticker tape: ราคาถูกพิมพ์ออกมาต่อเนื่อง ทุกคนสามารถอ่าน tape ได้ และ tape ไม่ช้าลงสำหรับ reader คนใดคนหนึ่ง

สำหรับ Nimbus เมื่อมีการสั่งอาหาร แอปพลิเคชันจะ publish event ไปยัง Kinesis stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`

Consumers ของ stream นี้:

- แดชบอร์ด real-time (อ่าน events เมื่อมาถึง อัปเดต metrics)
- Lambda ตรวจจับการฉ้อโกง (ดูรูปแบบคำสั่งซื้อที่ผิดปกติ)
- Stream ไปยัง S3 เพื่อจัดเก็บถาวร

**แนวคิดหลักของ Kinesis Data Streams**:

- **Shard**: หน่วยความสามารถพื้นฐาน หนึ่ง shard รองรับการเขียน 1 MB/s การอ่าน 2 MB/s
- **Retention period**: ข้อมูลอยู่ใน stream 24 ชั่วโมง (ค่าเริ่มต้น) ถึง 7 วัน
- **Sequence number**: แต่ละ record มี sequence number Consumers ติดตามตำแหน่งใน stream

**Amazon Data Firehose** (เดิมเรียกว่า **Kinesis Data Firehose**): บริการส่งข้อมูลที่จัดการโดย AWS ระหว่าง streaming producers และ destinations เช่น S3, Redshift และ OpenSearch มัน buffer, บีบอัด, แปลง และส่งข้อมูลโดยอัตโนมัติ

สำหรับ Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (รูปแบบ Parquet บีบอัด แบ่งพาร์ทิชันตามวันที่)

**AWS Glue: นักแปล**

ข้อมูลใน S3 เป็นข้อมูลดิบ ก่อนที่คุณจะวิเคราะห์ได้อย่างมีประสิทธิภาพ คุณต้องการ:

- ค้นหาสิ่งที่อยู่ที่นั่นและ schema ของมัน (columns คืออะไร ประเภทคืออะไร)
- แปลงเป็นรูปแบบที่สอดคล้องกัน
- เชื่อม datasets ต่างๆ เข้าด้วยกัน
- จัดการ records ที่ไม่ดี การเปลี่ยนแปลง schema ค่าที่ขาดหาย

**AWS Glue** คือบริการ ETL (Extract, Transform, Load) ที่จัดการโดย AWS ครบวงจร มีสองส่วนหลัก:

**Glue Data Catalog**: ที่จัดเก็บ metadata ที่อธิบายข้อมูล S3 ของคุณ — tables คืออะไร มี columns อะไร ไฟล์ข้อมูลอยู่ที่ไหน มันเหมือน card catalog สำหรับ data lake ของคุณ

**Glue Crawlers**: Agent อัตโนมัติที่สแกน S3 อนุมาน schema และเติม Data Catalog รัน crawler บน S3 bucket ของคุณและ 10 นาทีต่อมาคุณจะมีแค็ตตาล็อกของ tables ทั้งหมด

**Glue Jobs**: Spark/Python jobs แบบ serverless ที่ทำการแปลงจริง คุณเขียน transformation logic (หรือใช้เครื่องมือ visual ETL ของ Glue) และ Glue รันบน infrastructure ที่จัดการ

สำหรับ Nimbus:

1. Glue Crawler สแกนข้อมูลคำสั่งซื้อใน S3 → สร้างนิยาม table ใน Glue Data Catalog
2. Glue Job แปลง JSON order events ดิบเป็นรูปแบบ Parquet ที่สะอาดและแบ่งพาร์ทิชัน
3. ข้อมูลที่แปลงแล้วถูกเขียนกลับไปยัง S3 ในโครงร่างที่ optimize สำหรับ query

**Amazon Athena: บรรณารักษ์**

**Amazon Athena** คือบริการ query แบบ serverless interactive ที่รัน SQL queries โดยตรงบนข้อมูล S3 ไม่มีฐานข้อมูลที่ต้องจัดสรร ไม่มีข้อมูลที่ต้องโหลด คุณนิยาม table (หรือใช้ Glue Data Catalog) เขียน SQL และ Athena รัน query กับไฟล์ S3

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

Athena pricing ขึ้นอยู่กับปริมาณข้อมูลที่ query สแกน ในหลาย region SQL queries มาตรฐานเริ่มต้นที่ $5 ต่อ terabyte ที่สแกน การใช้รูปแบบ Parquet (columnar) พร้อม partition pruning (`WHERE year='2024' AND month='01'`) หมายความว่า Athena สแกนเฉพาะไฟล์ที่ต้องการ ซึ่งลดต้นทุนอย่างมาก

"เราสามารถรัน query นี้สำหรับข้อมูล 30 วัน" Leo พูด "และอาจมีค่าใช้จ่ายน้อยมากหากเราจัดเก็บข้อมูลไว้ดี"

"สำหรับคำถามใดก็ตามที่เราคิดได้?" Tom ถาม

"คำถามใดก็ตามที่เราสามารถแสดงใน SQL กับข้อมูลใดก็ตามที่เราจัดเก็บไว้ใน S3"

Tom มีสีหน้าของคนที่กำลังคำนวณมูลค่าใหม่ของข้อมูลทั้งหมดที่พวกเขาเคยทิ้งไป

**สถาปัตยกรรม Data Lake**

บริการทั้งสามรวมกันเป็นสิ่งที่เรียกว่า **สถาปัตยกรรม data lake** — ที่เก็บ S3 ส่วนกลางสำหรับข้อมูลทั้งหมด พร้อมเครื่องมือสำหรับประมวลผลและ query:

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

ข้อมูลดิบถูกเก็บรักษาไว้เสมอ (ใน S3 bucket ต้นฉบับ) ข้อมูลที่แปลงแล้วสามารถ query ได้ผ่าน Athena คำถามใหม่สามารถตอบได้เสมอโดยรัน Glue jobs ใหม่บนข้อมูลดิบ

**Amazon Redshift: เมื่อ Athena ไม่เพียงพอ**

สำหรับบางกรณีการใช้งาน Athena ช้าหรือแพงเกินไป:

- Query ที่ซับซ้อนมากพร้อม joins หลายอัน
- แดชบอร์ดที่รัน query เดิมหลายพันครั้งต่อวัน
- Machine learning บนข้อมูลที่มีโครงสร้าง
- ข้อกำหนด response time ต่ำกว่าวินาทีสำหรับเครื่องมือ BI

**Amazon Redshift** คือ data warehouse ที่จัดการโดย AWS ครบวงจร: ฐานข้อมูล analytics แบบ columnar ที่ออกแบบมาสำหรับ analytical workload ขนาดใหญ่ที่ทำซ้ำ ต่างจาก Athena ที่ query ข้อมูลในที่อยู่ใน S3 Redshift โหลดข้อมูลเข้า warehouse storage ที่ optimize แล้วและใช้กลยุทธ์ query optimization, sort และ distribution เพื่อเร่ง complex analytics

Redshift เร็วกว่า Athena อย่างมีนัยสำคัญสำหรับ analytics queries ที่ซับซ้อน โดยมีต้นทุน (provisioned capacity) และข้อกำหนดในการโหลดข้อมูลก่อน query

**Redshift Serverless** ขจัดภาระการวางแผน capacity — คุณ query Redshift ขยาย ค่าใช้จ่ายขึ้นอยู่กับ query

สำหรับ Nimbus ในระดับปัจจุบัน: Athena เพียงพอ ที่ปริมาณข้อมูลห้าเท่าและเมื่อเครื่องมือ BI query แดชบอร์ดเดิมหลายร้อยครั้งต่อวัน Redshift จะคุ้มค่าด้านต้นทุน

## จุดแข็งและข้อจำกัด

**Kinesis Data Streams**: ใช้ Kinesis เมื่อข้อมูลมาถึงอย่างต่อเนื่องและลำดับมีความสำคัญ เช่น clickstreams, financial transactions, IoT telemetry Kinesis รักษาลำดับ record ภายใน shard และอนุญาตให้ replay ในช่วง retention window ที่กำหนด ซึ่งทำให้มันแตกต่างจาก SQS อย่างพื้นฐาน ข้อเสียคือความซับซ้อนในการดำเนินงาน: ในโหมด provisioned คุณต้องจัดการ shard capacity และพฤติกรรมของ consumer สำหรับ task queues ง่ายๆ ที่ลำดับไม่สำคัญและ replay ไม่จำเป็น SQS เป็นตัวเลือกที่เรียบง่ายกว่า

**AWS Glue**: Glue ขจัด infrastructure ของ ETL cluster แบบดั้งเดิม คุณเขียน transform logic AWS จัดการ Spark environment มีค่ามากเมื่อการแปลงซับซ้อนหรือปริมาณข้อมูลใหญ่ ข้อจำกัดคือต้นทุนและ cold start — Glue jobs มีความล่าช้าในการเริ่มต้นหลายนาที ทำให้ไม่เหมาะสำหรับการแปลงแบบ near-real-time สำหรับการแปลงรูปแบบไฟล์ง่ายๆ (CSV เป็น Parquet) overhead ของ Glue อาจไม่คุ้มค่าเมื่อเทียบกับ Lambda function หรือ script น้ำหนักเบา

**Amazon Athena**: Athena ช่วยให้คุณ query ข้อมูล S3 ด้วย SQL มาตรฐานและไม่มี infrastructure ที่ต้องจัดการ ข้อจำกัดสำคัญคือต้นทุน: Athena คิดค่าบริการต่อ terabyte ของข้อมูลที่สแกน Query ต่อตาราง 10 TB ที่สแกนทั้งหมดมีค่าใช้จ่ายสูงกว่า query เดียวกันต่อตาราง Parquet ที่มีพาร์ทิชันซึ่งสแกน 200 GB มากอย่างมีนัยสำคัญ ใช้รูปแบบ columnar (Parquet หรือ ORC) และแบ่งพาร์ทิชันข้อมูลก่อนรัน Athena ในการผลิตเสมอ หากไม่มีการ optimize เหล่านี้ ค่า Athena จะทำให้คุณประหลาดใจ

## สรุป

- **Amazon Kinesis**: Streaming ข้อมูล real-time Producers เขียน records consumers อ่านตามจังหวะของตัวเอง Amazon Data Firehose สามารถส่งข้อมูล streaming ไปยัง S3, Redshift และปลายทางอื่นๆ ด้วยงานด้านปฏิบัติการที่น้อยกว่า
- **AWS Glue**: ETL และการจัดทำแค็ตตาล็อกข้อมูล Crawlers ค้นหา schemas Jobs แปลงข้อมูล Data Catalog ทำให้ข้อมูลค้นพบได้โดย Athena และเครื่องมืออื่นๆ
- **Amazon Athena**: SQL แบบ serverless บน S3 Query ข้อมูลใดก็ตามใน S3 ด้วย SQL มาตรฐาน ราคาต่อ TB ที่สแกน — ใช้ Parquet และการแบ่งพาร์ทิชันเพื่อลดต้นทุน
- **Amazon Redshift**: Data warehouse ที่จัดการสำหรับ analytics ประสิทธิภาพสูง โหลดข้อมูลเข้า optimize สำหรับ analytical queries ที่ทำซ้ำ และ query ได้อย่างรวดเร็วในระดับ warehouse
- **รูปแบบ data lake**: ข้อมูลดิบไปยัง S3 → Glue แปลง → Athena query → เครื่องมือ BI แสดงภาพ

## เคล็ดลับสอบ

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = ordered, real-time streaming, consumers หลายตัว, replay ภายใน retention window SQS = task queue, แต่ละ message ถูกประมวลผลครั้งเดียว "Consumers หลายตัวอ่าน stream เดียวกันพร้อมกัน" → Kinesis "หนึ่ง worker ต่อหนึ่ง message" → SQS
- **สัญญาณสอบ Athena**: "serverless SQL บน S3", "วิเคราะห์ข้อมูล S3 โดยไม่ต้องโหลดลงฐานข้อมูล", "จ่ายต่อ query" → Athena
- **การ optimize ต้นทุน Athena**: รูปแบบ columnar (Parquet หรือ ORC) + การแบ่งพาร์ทิชันลดข้อมูลที่สแกนและต้นทุนอย่างมาก สอบอาจถามวิธีลดต้นทุน Athena
- **Glue Crawler**: "ค้นหา schema ของข้อมูล S3 โดยอัตโนมัติ" → Glue Crawler
- **Amazon Data Firehose**: "โหลดข้อมูล streaming ไปยัง S3/Redshift/OpenSearch โดยอัตโนมัติโดยไม่ต้องจัดการ consumers" → Amazon Data Firehose เอกสารเก่าอาจยังเรียกว่า Kinesis Data Firehose
- **Redshift vs Athena**: Redshift สำหรับ queries ที่ซับซ้อนและทำซ้ำบ่อยบน dataset ที่คงที่ (แดชบอร์ด BI) Athena สำหรับ ad-hoc queries บนข้อมูล S3 ที่เปลี่ยนแปลงบ่อย
- **EMR (Elastic MapReduce)**: AWS-managed Hadoop/Spark clusters สอบใช้สิ่งนี้เมื่อ "existing Hadoop/Spark workloads" หรือ "custom data processing frameworks" ถูกกล่าวถึง Glue คือทางเลือกที่จัดการสำหรับกรณีการใช้งานส่วนใหญ่

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

อธิบายความแตกต่างระหว่าง Amazon Kinesis และ Amazon SQS คุณจะใช้อะไรเมื่อไหร่?

*(คำใบ้: ลองคิดเกี่ยวกับ consumers กี่ตัวที่สามารถอ่านข้อมูลเดิมได้ messages ถูกลบหลังการอ่านหรือไม่ และลำดับมีความสำคัญหรือไม่)*

**แบบฝึกหัดที่ 2 — ฝึกสอบ**

*สถานการณ์*: บริษัทแชร์รถต้องการวิเคราะห์ข้อมูลการเดินทาง มีการเดินทาง 1 ล้านครั้งต่อวัน บันทึกการเดินทางถูกจัดเก็บใน S3 เป็นไฟล์ JSON (ประมาณ 2KB ต่อไฟล์) ทีม analytics ต้องการรัน ad-hoc SQL queries เช่น "ระยะเวลาการเดินทางเฉลี่ยแยกตามเมืองสัปดาห์ที่แล้ว" Queries ควรเสร็จภายใน 2 นาที ต้องลดค่า storage ทีมจะรัน 20-30 queries ต่อสัปดาห์

สถาปัตยกรรมใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) โหลดข้อมูลการเดินทางเข้า RDS PostgreSQL ทุกวัน query ด้วย SQL มาตรฐาน  
B) ใช้ AWS Glue แปลง JSON เป็นรูปแบบ Parquet แบ่งพาร์ทิชันตามวันที่และเมือง query ด้วย Amazon Athena  
C) ใช้ Amazon Data Firehose ส่งข้อมูลการเดินทางไปยัง Amazon Redshift query ด้วย Redshift  
D) โหลดข้อมูลการเดินทางเข้า DynamoDB และใช้ PartiQL สำหรับ SQL queries

**คำใบ้ที่ 1**: 20-30 queries ต่อสัปดาห์คือความถี่ต่ำ บริการใดที่คุ้มค่าที่สุดสำหรับการ query ที่ไม่บ่อย?

**คำใบ้ที่ 2**: รูปแบบ Parquet + การแบ่งพาร์ทิชันลดข้อมูลที่สแกนโดย Athena อย่างมาก และลดต้นทุน

**คำใบ้ที่ 3**: 1 ล้านการเดินทาง × 2KB = ประมาณ 2GB ต่อวัน ในหนึ่งสัปดาห์ ประมาณ 14GB ที่ $5/TB สำหรับ Athena แม้ไม่มีการ optimize นี่ก็ยังสามารถจ่ายได้

**คำตอบ**: B

**คำอธิบาย**: Glue แปลง JSON เป็น Parquet (รูปแบบ columnar ลดข้อมูลที่สแกนอย่างมาก) แบ่งพาร์ทิชันตามวันที่และเมือง (partition pruning หมายความว่า queries "สัปดาห์ที่แล้ว" สแกนเฉพาะพาร์ทิชัน 7 วัน) Athena query S3 โดยตรงด้วย SQL มาตรฐาน สำหรับ 20-30 queries ต่อสัปดาห์ Athena แบบจ่ายต่อ query มีต้นทุนต่ำมากเมื่อเทียบกับ Redshift ที่ทำงานตลอดเวลา

**ทำไมไม่ใช่ A?** การโหลดข้อมูล 2GB ทุกวันเข้า RDS จากนั้น query ต้องใช้ database instance ที่ทำงาน 24/7 สำหรับ 20-30 queries ต่อสัปดาห์ นี่เป็นการออกแบบที่ over-engineered และแพงมาก

**ทำไมไม่ใช่ C?** Redshift คุ้มค่าสำหรับ queries ที่ทำซ้ำบ่อย (หลายร้อยครั้งต่อวันบน dataset เดียวกัน) สำหรับ 20-30 queries ต่อสัปดาห์ Redshift cluster ที่ทำงานตลอดเวลามีค่าใช้จ่ายสูงกว่า Athena แบบจ่ายต่อ query มาก

**ทำไมไม่ใช่ D?** DynamoDB คือ key-value/document store ที่ optimize สำหรับการเข้าถึงแบบ key-based ไม่ใช่ ad-hoc analytical queries PartiQL บน DynamoDB ไม่รองรับ GROUP BY aggregations แบบที่อธิบาย

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.5*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

Nimbus ต้องการสร้างระบบตรวจจับการฉ้อโกงแบบ real-time สำหรับคำสั่งซื้อ ระบบควร:

- ตรวจจับคำสั่งซื้อที่สั่งโดยบัญชีเดียวกันมากกว่า 5 ครั้งใน 60 วินาที
- Flag คำสั่งซื้อที่มูลค่าสูงกว่า $500 จากบัญชีใหม่ (อายุน้อยกว่า 30 วัน)
- ส่งคำสั่งซื้อที่ถูก flag ไปยัง queue สำหรับการตรวจสอบโดยมนุษย์

ออกแบบสถาปัตยกรรม Kinesis ให้อะไร? Logic การตรวจจับการฉ้อโกงทำงานที่ไหน? คุณจะเชื่อมโยง "บัญชีเดียวกัน, 60-second window" ได้อย่างไร? บริการใดรับคำสั่งซื้อที่ถูก flag?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกออกแบบสถาปัตยกรรม real-time streaming)*

## ฉากหลังเครดิต

Tom รัน Athena query แรก

"ร้านอาหาร 10 อันดับแรกตามรายได้ไตรมาสที่แล้ว" เขาพูด

12 วินาทีต่อมา ผลลัพธ์ปรากฏขึ้น

เขาจ้องมองมัน

"ร้านอาหาร 47 มาเป็นอันดับแรก" เขาพูด มันคือร้านอาหารของครอบครัว Maya — อันที่ Nimbus เริ่มต้น

"แน่นอน" Maya พูด "Arepa อร่อยจริงๆ"

Tom รัน query อีกอัน และอีกอัน แต่ละ query ตอบในไม่กี่วินาที แต่ละ query มีค่าใช้จ่ายเพียงเสี้ยวเซนต์

หลังจากหนึ่งชั่วโมง เขามีภาพที่สมบูรณ์ของธุรกิจ Nimbus ในแบบที่เขาไม่เคยมีมาก่อน หมวดหมู่ร้านอาหารใดที่เติบโตเร็วที่สุด กลุ่มลูกค้าใดที่มี retention ยาวนานที่สุด รายการอาหารใดที่ขับเคลื่อนการสั่งซื้อซ้ำมากที่สุด

"ทำไมเราไม่สร้างสิ่งนี้เร็วกว่านี้?" เขาถาม

"เรามีข้อมูล" Leo พูด "เราแค่ไม่มี pipeline เพื่อใช้มัน"

"ข้อมูลอยู่ที่นั่นเสมอ" Maya พูดเบาๆ "เราแค่มองไม่เห็นมัน"

ในบทถัดไป: ตอนนี้ที่เราเห็นธุรกิจอย่างชัดเจนแล้ว มาพูดถึงวิธีจ่ายค่า infrastructure ที่รันมันอย่างมีประสิทธิภาพมากขึ้น
