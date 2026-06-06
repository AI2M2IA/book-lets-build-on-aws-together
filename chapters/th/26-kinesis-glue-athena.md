# บทที่ 26: ทำความเข้าใจกับทุกอย่าง

Tom กำลังจ้องมองเอกสารที่พิมพ์ออกมา

มันคือตัวเลขสองหน้า: order counts, revenue totals, timestamps, region codes เขาขอให้ Leo รวบรวมทุกอย่างที่มีเกี่ยวกับรูปแบบออร์เดอร์ของวันศุกร์ Leo ใช้เวลาหนึ่งชั่วโมงเขียน script ที่ join data sources สามอันที่แตกต่างกัน — DynamoDB, CloudWatch logs และ S3 analytics export — และนี่คือสิ่งที่ออกมา

ตัวเลขอยู่ที่นั่นครบ พวกมันไม่ได้บอกอะไรเขาเลย

เขาเห็นได้ว่ามีการวางออร์เดอร์ 847 ออร์เดอร์ในวันศุกร์ เขาบอกไม่ได้ว่าพวกมันถูกวางเมื่อไร ร้านอาหารใดยุ่งที่สุด หรือชั่วโมง peak คืออะไร ข้อมูลนั้นอยู่ในข้อมูล มันแค่มองไม่เห็น

---

การ optimize เครือข่ายทั้งหมดจากบทที่ 25 ทำให้ infrastructure ของ Nimbus เร็วขึ้นและถูกลง แต่ข้อมูลที่ infrastructure นั้นสร้างขึ้น — ใน DynamoDB, ใน CloudWatch logs, ใน S3 analytics export ที่ทำงานคืนละครั้ง — นั่งอยู่ในสามที่ที่แตกต่างกัน ในสามรูปแบบที่แตกต่างกัน ไม่เชื่อมต่อกับอะไรที่ Tom ใช้ได้จริง

คำถามของ Maya ทำให้มันเป็นรูปธรรม "เวลาสั่งออร์เดอร์ที่ยุ่งที่สุดของเราในวันศุกร์คือเมื่อไร?"

Leo มองเธอ "นั่นไม่อยู่ใน dashboard ของเรา"

"เราเพิ่มได้ไหม?"

"ข้อมูลอยู่ใน DynamoDB และใน CloudWatch logs และใน S3 จาก analytics export job" Leo หยุด "ในสามที่ที่แตกต่างกัน ในสามรูปแบบที่แตกต่างกัน"

Maya เสริม: "และ analytics export ทำงานเพียงคืนละครั้ง ถ้าคุณต้องการข้อมูลวันศุกร์ คุณต้องรอจนถึงเช้าวันเสาร์"

Tom มองเอกสารที่พิมพ์ออกมา "ดังนั้นเรามีข้อมูล เราแค่ใช้มันไม่ได้"

ประโยคนั้นอธิบาย analytics สมัยใหม่ได้ครึ่งหนึ่ง

---

**Whiteboard**

Maya มาถึงสำนักงานเช้าและเติม whiteboard ไปครึ่งหนึ่งแล้วในตอนที่ Leo มาถึง

เจ็ดคำถาม เขียนในสองคอลัมน์ ทั้งหมดเป็นคำถามทางธุรกิจ ไม่มีตัวใดตอบได้จาก dashboards ปัจจุบัน:

1. ร้านอาหารใดมีอัตราการยกเลิกออร์เดอร์สูงที่สุดใน 30 วันแรก?
2. เวลาเฉลี่ยระหว่างร้านอาหารได้รับการแจ้งเตือนออร์เดอร์และยืนยันมันคืออะไร? สิ่งนี้แตกต่างกันอย่างไรตามร้านอาหารและตามวันในสัปดาห์?
3. เมืองใดมีอัตราสูงที่สุดของลูกค้าที่สั่งซ้ำจากร้านอาหารเดียวกันภายใน 14 วัน?
4. ออร์เดอร์กี่เปอร์เซ็นต์ถูกวางภายใน session แรกของแอปเทียบกับ return sessions?
5. หมวดเมนูใดขับเคลื่อนรายได้สูงที่สุดต่อร้านอาหาร?
6. ความสัมพันธ์ระหว่างเวลาตอบสนองของร้านอาหารและอัตราการสั่งซ้ำของลูกค้าคืออะไร?
7. ปริมาณออร์เดอร์เปลี่ยนแปลงอย่างไรใน 48 ชั่วโมงก่อนและหลังพันธมิตรร้านอาหารโพสต์บน social media?

"เราตอบตัวใดได้บ้าง?" เธอถาม

Leo มองรายการ เขามอง dashboard ปัจจุบัน — order count, revenue total, active restaurants

"ข้อหนึ่ง" เขาพูดช้าๆ "บางส่วน เรามี cancellation records แต่เราต้อง join พวกมันกับ restaurant onboarding dates และนั่นอยู่ในระบบอื่น"

"ข้อสอง?" Tom ถาม

"เราเก็บ notification timestamp เราเก็บ confirmation timestamp พวกมันอยู่ใน tables ที่แตกต่างกันในรูปแบบที่แตกต่างกัน เราต้อง JOIN พวกมันและคำนวณ delta"

"ดังนั้นข้อมูลมีอยู่" Maya พูด

"ข้อมูลมีอยู่" Leo ยืนยัน "เราแค่ไม่มีทาง query ข้ามมัน"

"เดี๋ยว — แต่*ทำไม*เราถึง query ฐานข้อมูลไม่ได้?" Maya ถาม "เรามี PostgreSQL เรามีข้อมูลทั้งหมดนี้"

"เพราะข้อมูลอยู่ในสามที่" Leo พูด "Order events อยู่ใน DynamoDB Notification timestamps อยู่ใน CloudWatch logs Onboarding dates อยู่ใน RDS PostgreSQL database และบางส่วน — analytics exports — อยู่ใน S3 เป็นไฟล์ JSON ที่ไม่มีใครเคย join กับอะไรเลย"

Tom มอง whiteboard "เราสร้างข้อมูลนี้มา 18 เดือน" เขาพูด "เราบินแบบมืดบอดมา 18 เดือน"

"ไม่ใช่มืดบอด" Maya พูด "แค่สายตาสั้น เราเห็นสิ่งที่อยู่ตรงหน้าได้ทันที เราเห็นรูปแบบไม่ได้"

นั่นคือการ framing ที่ถูกต้อง จุดข้อมูลแต่ละจุดอยู่ที่นั่น ระบบที่จะเชื่อมพวกมันไม่อยู่

**สามปัญหาที่แตกต่างกัน**

ปัญหาข้อมูลของ Nimbus มีสามมิติ:

**Real-time streaming**: ออร์เดอร์กำลังถูกวางอยู่ตอนนี้ คุณต้องการเห็น live dashboard ของ order velocity — กี่รายการต่อนาที แยกตาม region แยกตามร้านอาหาร ข้อมูลต้องถูกประมวลผลเมื่อมันมาถึง

**Data transformation**: ข้อมูลอยู่ใน S3 จากระบบต่างๆ ในรูปแบบที่แตกต่างกัน (JSON, CSV, Parquet) ก่อนที่คุณจะวิเคราะห์ได้ คุณต้องทำให้เป็นมาตรฐาน — schema เดียวกัน รูปแบบเดียวกัน ทำความสะอาด join กับข้อมูลอ้างอิง

**Ad-hoc analysis**: เมื่อข้อมูลถูกจัดระเบียบแล้ว คุณต้องการรัน SQL queries กับมันโดยไม่ต้องโหลดลงในฐานข้อมูลก่อน "ให้ร้านอาหาร 10 อันดับแรกตามรายได้ใน 30 วันที่ผ่านมา" โดยไม่ต้องโหลดข้อมูลลงฐานข้อมูล

แต่ละอันเป็นปัญหาที่แตกต่างกัน AWS มี service เฉพาะสำหรับแต่ละอัน

**Real-Time Stream: Ticker Tape สำหรับข้อมูล**

ลองนึกถึงเครื่อง ticker tape — ชนิดที่พิมพ์ราคาหุ้นบนม้วนกระดาษต่อเนื่อง ราคาถูกพิมพ์เมื่อมันเปลี่ยน ทุกคนที่ต้องการราคาปัจจุบันสามารถอ่าน tape ได้ ไม่มีใครต้องรอใคร; tape พิมพ์ต่อไปโดยไม่คำนึงว่ามีคนกี่คนอ่านอยู่

นั่นคือโมเดลสำหรับ real-time data streaming Producers ส่งข้อมูลเมื่อมันเกิดขึ้น Consumers หลายตัวสามารถอ่าน stream พร้อมกันได้ แต่ละตัวตามจังหวะของตัวเอง แต่ละตัวได้ภาพเต็ม

**Amazon Kinesis Data Streams** คือเครื่องนั้นสำหรับ Nimbus เมื่อมีการวางออร์เดอร์ แอปพลิเคชัน publish event ไปยัง Kinesis stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`

Consumers ของ stream นี้:

- real-time dashboard (อ่าน events เมื่อมาถึง อัปเดต metrics)
- fraud detection Lambda (ดูรูปแบบออร์เดอร์ที่ผิดปกติ)
- stream ไปยัง S3 เพื่อจัดเก็บถาวร

**แนวคิด Kinesis Data Streams**:

- **Shard**: หน่วย capacity พื้นฐาน หนึ่ง shard จัดการการเขียน 1 MB/s, การอ่าน 2 MB/s
- **Retention period**: ข้อมูลอยู่ใน stream เป็นเวลา 24 ชั่วโมง (ค่าเริ่มต้น) ขยายได้ถึง **365 วัน** (1 ปี) ด้วย Extended Data Retention
- **Sequence number**: แต่ละ record มี sequence number Consumers ติดตามตำแหน่งของพวกเขาใน stream

**Amazon Data Firehose** (เดิม **Kinesis Data Firehose**): managed delivery service ระหว่าง streaming producers และ destinations เช่น S3, Redshift และ OpenSearch มัน buffer, บีบอัด, แปลง และส่งข้อมูลโดยอัตโนมัติ

สำหรับ Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (รูปแบบ Parquet บีบอัด แบ่ง partition ตามวันที่)

"ผม deploy มันแล้ว — โอ้" Leo ตั้ง shard count เป็นหนึ่งโดยไม่คำนวณ write throughput ก่อน ที่ปริมาณออร์เดอร์ของ Nimbus หนึ่ง shard ไม่เป็นไร เขายืนยันสิ่งนี้ก่อนที่ใครจะสังเกตว่าเขาเดา

**นักแปล: ทำความเข้าใจข้อมูลดิบ**

ข้อมูลใน S3 เป็นข้อมูลดิบ ก่อนที่คุณจะวิเคราะห์มันได้อย่างมีประสิทธิภาพ คุณต้องค้นพบว่ามีอะไรอยู่ที่นั่น แปลงมันเป็นรูปแบบที่สอดคล้องกัน join datasets ต่างๆ เข้าด้วยกัน และจัดการ records ที่ไม่ดีและค่าที่ขาดหาย

นั่นเป็นงานสำหรับ translation layer เฉพาะ

**AWS Glue** คือ fully managed ETL (Extract, Transform, Load) service มันมีสองส่วนประกอบหลัก:

**Glue Data Catalog**: metadata store ที่อธิบายข้อมูล S3 ของคุณ — tables ใดมีอยู่ มี columns อะไร ไฟล์ข้อมูลอยู่ที่ไหน มันเหมือน card catalog สำหรับ data lake ของคุณ

**Glue Crawlers**: agents อัตโนมัติที่สแกน S3 อนุมาน schema และเติม Data Catalog รัน crawler บน S3 bucket ของคุณและ 10 นาทีต่อมาคุณมี catalog ของ tables ทั้งหมด

**Glue Jobs**: serverless Spark/Python jobs ที่ทำการแปลงจริง คุณเขียน transformation logic (หรือใช้ visual ETL tool ของ Glue) และ Glue รันมันบน managed infrastructure

สำหรับ Nimbus:

1. Glue Crawler สแกนข้อมูลออร์เดอร์ใน S3 → สร้าง table definition ใน Glue Data Catalog
2. Glue Job แปลง raw JSON order events เป็นรูปแบบ Parquet ที่สะอาดและแบ่ง partition
3. ข้อมูลที่แปลงแล้วถูกเขียนกลับไปยัง S3 ในเลย์เอาต์ที่ optimize สำหรับ query

**เมื่อ ETL พัง: ปัญหา Schema Evolution**

Glue pipeline ทำงานอย่างสะอาดในสามสัปดาห์แรก จากนั้นพันธมิตรร้านอาหาร #412 เพิ่ม field ใหม่ลงใน menu export ของพวกเขา: `allergen_tags` field เป็น array ของ strings — `["gluten", "dairy", "nuts"]` — และมันปรากฏใน nightly data export ของร้านอาหาร

schema ของ Glue job เคร่งครัด มันถูกเขียนให้คาดหวัง fields เฉพาะใน order JSON เมื่อมันพบ `allergen_tags` — field ที่ไม่อยู่ใน schema — Glue job ล้มเหลว

ข้อมูลออร์เดอร์หกชั่วโมงจาก 47 ร้านอาหาร (ทั้งหมดใช้ menu export format เดียวกับพันธมิตร #412) สะสมใน S3 โดยไม่ถูกประมวลผล nightly Glue run ที่ควรทำให้ออร์เดอร์เมื่อคืนสามารถ query ได้ภายในเช้า กลับหยุดที่ 02:47 น. และเขียน failure record ไปยัง CloudWatch

Tom พบมันเมื่อเขาพยายามรัน Athena query ที่ 9 โมงเช้าและได้ `0 rows returned` สำหรับ 12 ชั่วโมงก่อนหน้า

"ETL พังเพราะ source data เปลี่ยน?" Maya ถาม เมื่อ Leo อธิบายสิ่งที่เกิดขึ้น

"ETL พังเพราะ ETL ไม่รู้วิธีจัดการ schema change" Leo พูด "เราเขียน strict job ที่คาดหวัง fields เหล่านี้พอดี เมื่อ field ใหม่ปรากฏ มันตื่นตระหนก"

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่าน schema change ล่ะ?" Priya ถาม "พันธมิตรร้านอาหารที่เป็นอันตรายส่ง fields ที่ไม่คาดคิดโดยเจตนาเพื่อ crash pipeline?"

คำถามควรค่าแก่การพิจารณา ETL pipeline ที่ crash บน input ที่ไม่คาดคิดเป็น denial-of-service vector: ส่ง data format ที่ผิดปกติ crash pipeline และร้านอาหารนั้น (และร้านอื่นทั้งหมดที่แชร์ format) หยุดประมวลผล

วิธีแก้มีสองส่วน:

**Glue schema evolution**: dynamic frame ของ Glue รองรับ schema evolution — fields ที่ไม่อยู่ใน expected schema ถูกส่งผ่านแทนที่จะทำให้เกิดความล้มเหลว เปิดมันโดยใช้ DynamicFrames แทน DataFrames ใน job script พร้อม `mergeSchema` ตั้งใน additional options fields ใหม่ถูกเพิ่มเข้า schema โดยอัตโนมัติในการรัน crawler ครั้งถัดไป

```python
# ก่อน (เคร่งครัด พังเมื่อมี fields ใหม่)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# หลัง (เปิด schema evolution)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Glue job alerting**: ความล้มเหลวของ pipeline เงียบไปประมาณหกชั่วโมงก่อนที่ Tom จะสังเกต CloudWatch alarm บน Glue job run state (`FAILED`) จะแจ้งเตือน on-call engineer ภายใน 5 นาที ค่า alarm: สิบเซนต์ต่อเดือน — แทบจะฟรี (ตัว metric เองไม่มีค่าใช้จ่าย และ 10 alarms แรกอยู่ใน free tier)

"ข้อมูลหกชั่วโมงนั่งไม่ถูกประมวลผลใน S3" Leo พูด หลังรัน Glue job ด้วยตนเองอีกครั้งเพื่อตามให้ทัน "ไม่มีอะไรสูญหาย — แต่ analytics ตามหลังไปขนาดนั้น ถ้าเรามี alarm ความล่าช้าจะเป็น 30 นาที"

บทเรียนที่กว้างกว่า: ETL pipelines ที่ประมวลผลข้อมูลภายนอกต้องจัดการ schema changes อย่างสง่างาม partners ภายนอก — ร้านอาหาร, payment providers, delivery services — จะเปลี่ยน data formats ของพวกเขา pipeline ต้องไม่เปราะบางต่อการเปลี่ยนแปลงเหล่านั้น

**Query Layer: SQL โดยตรงบน S3**

ตอนนี้ข้อมูลอยู่ใน S3 ในรูปแบบ Parquet แบ่ง partition ตามวันที่ ชิ้นส่วนสุดท้าย: วิธีถามคำถามกับมันโดยไม่ต้องโหลดมันลงในฐานข้อมูลก่อน

**Amazon Athena** คือ serverless, interactive query service ที่รัน SQL queries โดยตรงบนข้อมูล S3 ไม่มีฐานข้อมูลที่ต้องจัดหา ไม่มีข้อมูลที่ต้องโหลด คุณนิยาม table (หรือใช้ Glue Data Catalog) เขียน SQL และ Athena execute query กับไฟล์ S3

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

Athena pricing อิงจากปริมาณข้อมูลที่ query สแกน ใน us-east-1, us-west-2 และ regions หลักส่วนใหญ่ standard SQL queries มีค่า $5 ต่อ terabyte ที่สแกน การใช้รูปแบบ Parquet (columnar) พร้อม partition pruning (`WHERE year='2024' AND month='09'`) หมายความว่า Athena สแกนเฉพาะไฟล์ที่ต้องการ ซึ่งลดต้นทุนอย่างมาก

"เราสามารถรัน query นี้สำหรับข้อมูล 30 วัน" Leo พูด "และอาจมีค่าใช้จ่ายน้อยอย่างน่าประหลาดใจถ้าเราเก็บมันดี"

"มันมีค่าใช้จ่ายน้อยขนาดนั้นได้อย่างไร?" Maya ถาม "ถ้ามันสแกนข้อมูลหลายเทราไบต์ มันไม่แพงได้อย่างไร?"

Leo อธิบาย Parquet ในรูปแบบ row-based (JSON, CSV) query ที่หาสอง columns จากยี่สิบต้องอ่านทั้งยี่สิบ ในรูปแบบ columnar เช่น Parquet มันอ่านเฉพาะสองที่มันต้องการ สำหรับ dataset 50TB query ที่ optimize ดีอาจสแกน 200GB ที่ $5/TB นั่นคือหนึ่งดอลลาร์

"แล้วถ้ามีคน query ทั้ง table โดยบังเอิญล่ะ?" Maya กดต่อ

"นั่นคือความเสี่ยงด้านต้นทุนจริง" Leo พูด

คุณอาจสงสัยว่า: ถ้า Athena คิดต่อ terabyte ที่สแกน query ที่เขียนแย่หนึ่งอันสามารถสร้างบิลที่ไม่คาดคิดขนาดใหญ่ได้ไหม? ได้ — และสิ่งนี้เกิดขึ้นใน production environments จริง query ต่อ unoptimized table 50TB อาจมีค่าใช้จ่ายมากกว่าบิล S3 รายเดือนทั้งหมดของคุณ นี่คือเหตุผลที่รูปแบบ Parquet และการแบ่ง partition ไม่ใช่การ optimize ทางเลือก — พวกมันคือ cost controls Athena ยังรองรับ workgroup query scan limits ที่จำกัดว่า query เดียวได้รับอนุญาตให้สแกนข้อมูลเท่าไร

"สำหรับคำถามใดก็ตามที่เราคิดได้?" Tom ถาม

"คำถามใดก็ตามที่เราแสดงใน SQL ได้ กับข้อมูลใดก็ตามที่เราเก็บไว้ใน S3"

Tom นั่งลงที่แล็ปท็อปของ Leo และเขียน query แรก:

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

query ทำงาน 11 วินาที ผลลัพธ์: 20 ร้านอาหาร เรียงตามเวลายืนยันเฉลี่ยที่เร็วที่สุด พร้อมอัตราการสั่งซ้ำของพวกเขาเคียงข้าง

Tom จ้องมอง output

ร้านอาหารที่ยืนยันเร็วที่สุด — ที่ acknowledge และยืนยันออร์เดอร์ภายในเฉลี่ย 3-4 นาที — มีอัตราการสั่งซ้ำเฉลี่ย 41% ร้านอาหารที่ยืนยันช้าที่สุด (เวลายืนยันเฉลี่ย 18-22 นาที) มีอัตราการสั่งซ้ำ 13%

"ร้านอาหารที่ยืนยันเร็วได้ธุรกิจซ้ำสามเท่า" Tom พูด

"นั่นคือช่องว่างที่ใหญ่มาก" Maya พูด "ทำไมความเร็วในการยืนยันถึงส่งผลต่ออัตราการสั่งซ้ำมากขนาดนั้น?"

"เพราะลูกค้าวางออร์เดอร์แล้วนั่งจ้องโทรศัพท์ของพวกเขา" Leo พูด "ถ้าการยืนยันมาใน 3 นาที พวกเขารู้สึกมั่นใจ ถ้ามันมาใน 22 นาที — หรือไม่มาเลย — พวกเขารู้สึกกังวล ความกังวลคือ product failure แม้ว่าอาหารจะมาถึงเรียบร้อย"

"นี่คือ product insight" Maya พูด "ไม่ใช่แค่ analytics insight เราควรแสดงให้ร้านอาหารเห็น benchmark เวลายืนยันของพวกเขาเทียบกับค่าเฉลี่ยหมวด"

Athena query สแกนข้อมูล 1.2 GB (สองเดือนของออร์เดอร์ในรูปแบบ Parquet แบ่ง partition ตามปีและเดือน) ค่าใช้จ่าย: $0.006

ครึ่งเซนต์ สำหรับ business insight ที่เปลี่ยนวิธีที่ Nimbus จะออกแบบ restaurant onboarding — ร้านอาหารใดที่จะให้ความสำคัญสำหรับ success coaching เป้าหมายเวลายืนยันใดที่จะตั้งเป็นส่วนหนึ่งของ partner SLAs

Tom มีสีหน้าของคนที่กำลังคำนวณมูลค่าใหม่ของข้อมูลทั้งหมดที่พวกเขาเคยทิ้งไป

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่าน query layer ล่ะ?" Priya ถาม "หรือแค่ analyst ที่ export customer addresses จาก raw order data โดยบังเอิญ? customer PII, order histories, financial records — ใครควบคุมว่า tables ใดมองเห็นได้ด้วยซ้ำ?"

ก่อนที่เธอจะถามคำถามจบ Leo ตระหนักถึงปัญหาเชิงปฏิบัติการเช่นกัน: คุณจะหยุดทีมหนึ่งจากการรัน catastrophic full-table scan ที่สร้างบิล Athena $500 ใน query เดียวได้อย่างไร?

**Athena Workgroups** แก้ทั้งสองปัญหาพร้อมกัน

workgroup คือ named configuration ที่จัดกลุ่ม Athena users และใช้การตั้งค่าที่แชร์: query result location, encryption และ — ที่สำคัญ — per-query data scan limits

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

analyst บน `analytics-team` workgroup ไม่สามารถสแกนข้อมูล 50TB โดยบังเอิญและสร้างค่า Athena $250 ได้ query ถูกยกเลิกเมื่อมันจะเกิน 10GB ของข้อมูลที่สแกน analyst เห็น error message และรู้ว่าพวกเขาต้องเพิ่ม partition filter

Workgroups ยังบังคับ result locations แยกต่างหากต่อทีม: ผลลัพธ์ query ของทีม engineering ไปยัง `s3://nimbus-query-results/engineering/`; ผลลัพธ์ของทีม finance ไปยัง `s3://nimbus-query-results/finance/` ไม่มีการเข้าถึง query result ข้ามทีม

IAM ควบคุมว่า users ใดใช้ workgroup ใดได้ Lambda function ที่รัน automated reports ใช้ `finance-reports` workgroup (จำกัดอย่างเข้มงวด) วิศวกรที่ debug ปัญหา production ใช้ `engineering-team` workgroup (cap กว้างกว่า, warn ไม่ใช่ cancel) การเข้าถึง raw events table (ที่มี customer PII) ถูกจำกัดเฉพาะ `engineering-team` workgroup ผ่าน IAM condition บน Glue Data Catalog table

"นั่นไม่ใช่แค่ cost control" Priya พูด "นั่นคือ access control Workgroups คือจุดบังคับใช้"

มันตอบคำถามของเธอครบถ้วน ทุกการอภิปราย data pipeline ที่ข้าม access control ในที่สุดกลายเป็น compliance incident — และที่นี่ ทีม analytics เห็นเฉพาะ aggregated order tables ในขณะที่ raw events พร้อม customer PII อยู่หลัง IAM authorization ที่ชัดเจน Glue Data Catalog ไม่ใช่แค่ schema directory มันคือ access control boundary

"นั่นไม่ใช่งานเพิ่ม" Priya พูด "นั่นคือการออกแบบ"

**สถาปัตยกรรม Data Lake**

service ทั้งสามนี้รวมกันเป็นสิ่งที่เรียกว่า **สถาปัตยกรรม data lake** — centralized S3 repository สำหรับข้อมูลทั้งหมดของคุณ พร้อมเครื่องมือสำหรับประมวลผลและ query มัน:

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

ข้อมูลดิบถูกเก็บรักษาเสมอ (ใน S3 bucket ต้นฉบับ) ข้อมูลที่แปลงแล้ว query ได้ผ่าน Athena คำถามใหม่สามารถตอบได้เสมอโดยรัน Glue jobs ใหม่บนข้อมูลดิบ

**Amazon Redshift: เมื่อ Athena ไม่เพียงพอ**

สำหรับบาง use cases, Athena ช้าหรือแพงเกินไป:

- queries ที่ซับซ้อนมากพร้อม joins หลายอัน
- dashboards ที่รัน query เดียวกันหลายพันครั้งต่อวัน
- machine learning บนข้อมูลที่มีโครงสร้าง
- ความต้องการ response time ต่ำกว่าวินาทีสำหรับ BI tools

**Amazon Redshift** คือ fully managed data warehouse: columnar analytics database ที่ออกแบบสำหรับ analytical workloads ขนาดใหญ่ที่ทำซ้ำ ต่างจาก Athena ซึ่ง query ข้อมูลในที่ที่มันอยู่ใน S3, Redshift โหลดข้อมูลเข้า optimized warehouse storage และใช้ query optimization, sort strategies และ distribution strategies เพื่อเร่ง complex analytics

ถ้าปริมาณข้อมูลของคุณเล็กและ queries ของคุณรันไม่บ่อย (รายสัปดาห์หรือรายเดือน) Athena พร้อมข้อมูล S3 ที่จัดระเบียบดีก็เพียงพอและแทบจะฟรี — แต่ถ้าคุณรัน analytical dashboards เดียวกันหลายร้อยครั้งต่อวัน pre-optimized columnar storage ของ Redshift จะเร็วกว่าและในที่สุดคุ้มค่ากว่า แม้จะต้องการให้โหลดข้อมูลล่วงหน้า

Redshift เร็วกว่าอย่างมีนัยสำคัญสำหรับ complex analytics queries โดยแลกกับต้นทุน (provisioned capacity) และความต้องการในการโหลดข้อมูลก่อน query

**Redshift Serverless** ขจัดภาระการวางแผน capacity — คุณ query, Redshift scale ต้นทุนอิงจาก compute capacity ที่ใช้จริง วัดเป็น **RPU-hours** และคิดต่อวินาที (พร้อมขั้นต่ำ 60 วินาทีต่อการ activation) บวก managed storage ต่อ GB-month — และไม่มีอะไรสำหรับ compute ในขณะที่ warehouse นั่งเฉย (Athena เป็นตัวเดียวที่คิดต่อ query: $5 ต่อ TB ที่สแกน)

สำหรับ Nimbus ในระดับปัจจุบัน: Athena เพียงพอ ที่ปริมาณข้อมูลห้าเท่าและเมื่อ BI tools query dashboards เดียวกันหลายร้อยครั้งต่อวัน Redshift จะคุ้มค่า

**เมื่อ Athena เป็นเครื่องมือที่ผิด**

"แล้วจุดที่ต้องระวังคืออะไร?" Maya ถาม "ทำไมเราถึงไม่ใช้ Athena สำหรับทุกอย่าง? มันเป็น serverless จ่ายต่อ query ไม่มี infrastructure — ฟังดูสมบูรณ์แบบ"

กรณีที่ Athena ไม่ใช่คำตอบที่ถูกต้อง:

**High-frequency dashboards**: customer-facing analytics dashboard ที่ refresh ทุก 30 วินาทีและรัน 50 queries ต่อนาทีไม่ใช่ use case ที่ดีของ Athena ที่ $5/TB ที่สแกน queries เหล่านั้นต้องถูก optimize อย่างดีเยี่ยมเพื่อให้คุ้มค่าที่ความถี่นั้น Redshift หรือ pre-aggregated database (แม้แต่ RDS) เหมาะสมกว่าสำหรับ dashboards ที่มีความต้องการ response time ต่ำกว่าวินาที

**Operational queries ที่มีความต้องการ latency ต่ำ**: ถ้า customer service agent ต้องค้นหาออร์เดอร์เฉพาะในเวลาต่ำกว่า 500ms, Athena ไม่ใช่เครื่องมือ — DynamoDB lookup หรือ RDS query คือ Athena ถูก optimize สำหรับ analytical throughput ไม่ใช่ operational latency แม้แต่ Athena query ที่ปรับแต่งดีบน dataset เล็กก็มี cold-start overhead 1-3 วินาที

**Transactional systems**: Athena เป็น read-only คุณไม่สามารถ INSERT, UPDATE หรือ DELETE records ใน Athena (ยกเว้นผ่าน integrations เฉพาะเช่น Lake Formation หรือ Iceberg table format ซึ่งมีความซับซ้อนของตัวเอง) สำหรับ operational write workloads ใช้ transactional database

**Datasets ที่เล็กมากและเปลี่ยนแปลงบ่อย**: ถ้า dataset ของคุณเปลี่ยนทุกนาทีและมีเพียง 1GB การโหลดมันเข้า RDS หรือ DynamoDB และ query ที่นั่นง่ายกว่าและเร็วกว่าการรัน Athena queries กับไฟล์ S3 ที่อาจเก่า Athena query ไฟล์ S3 as-of เวลาของ query — ถ้าไฟล์ถูกเขียน 2 นาทีก่อน นั่นคือความสดที่คุณได้

รูปแบบที่ปรากฏ: Athena ยอดเยี่ยมสำหรับ large-scale, infrequent, ad-hoc analytical queries กับข้อมูล S3 สำหรับอะไรก็ตามที่เป็น operational, transactional หรือต้องการ latency ต่ำกว่าวินาที ใช้ operational database ที่เหมาะสม

**Kinesis vs SQS: ขจัดความสับสน**

นี่คือคำถามที่ขึ้นมาในทุกการอภิปราย data architecture Kinesis และ SQS ทั้งคู่จัดการกับ messages เมื่อใดคุณใช้แต่ละอัน?

ความสับสนมาจากความคล้ายคลึงระดับผิวเผิน: ทั้งคู่รับ messages จาก producers ทั้งคู่ส่ง messages เหล่านั้นไปยัง consumers ทั้งคู่เป็น managed AWS services แต่ data models ของพวกมันแตกต่างพื้นฐาน

**SQS (Simple Queue Service)** คือ task queue คุณใส่ message เข้า consumer หนึ่งเอามันออกและประมวลผล เมื่อการประมวลผลเสร็จ message ถูกลบ ถ้าคุณมีสิบ consumers แต่ละ message ไปยังตัวใดตัวหนึ่งของพวกมันพอดี message หายไปหลังการบริโภค

**Kinesis Data Streams** คือ log คุณใส่ record เข้า ทุก consumer อ่านทุก record Consumer A อ่านทั้งหมด Consumer B ก็อ่านทั้งหมดด้วย ตามจังหวะของตัวเอง ทั้งสอง consumer ไม่ลบ record — มันอยู่ใน stream จนกว่า retention period จะหมด คุณสามารถเพิ่ม consumer ตัวที่สามได้ทุกเมื่อ และมันสามารถอ่านจากต้น stream ได้ (ภายใน retention window)

"เมื่อใดคุณจะต้องการให้ทุก consumer เห็นทุก message จริงๆ?" Maya ถาม

คำตอบคือ use cases ที่ Kinesis โดดเด่น:

**Real-time dashboard + fraud detection + S3 archive**: ทั้งสามบริโภค order events stream เดียวกันพร้อมกัน ถ้าคุณใช้ SQS คุณต้อง publish ไปยังสาม queues แยกต่างหาก — และใครก็ตามที่ publish ต้องรู้เกี่ยวกับทั้งสาม consumers ด้วย Kinesis, producer publish ครั้งเดียว; consumers จำนวนเท่าใดก็ได้สามารถอ่านอย่างอิสระ

**Replay**: consumer ล้มเหลวเป็นเวลา 2 ชั่วโมง (ชน Lambda concurrency limit, downstream service ล่ม) ด้วย SQS, messages เหล่านั้นถูกลบไปแล้ว (หรือมี visibility timeout ที่กำหนด) ด้วย Kinesis, consumer ทำต่อจาก checkpoint ล่าสุดและประมวลผล records ที่พลาด 2 ชั่วโมง ข้อมูลถูกเก็บใน stream (สูงถึง 365 วันด้วย Extended Data Retention)

**Order within a shard**: records ที่มี partition key เดียวกันไปยัง shard เดียวกันเสมอ รักษาลำดับ สำหรับ stock trading system ที่คุณต้องการให้ trades ทั้งหมดสำหรับสัญลักษณ์ `AMZN` ถูกประมวลผลตามลำดับ Kinesis รับประกันสิ่งนี้ SQS FIFO ให้ลำดับต่อ group แต่ที่ throughput ต่ำกว่า (สูงถึง 3,000 messages/วินาทีต่อ queue พร้อม batching ในโหมด standard — high-throughput mode เพิ่มเป็นหลายหมื่น — เทียบกับ 1 MB/s ของ Kinesis หรือ 1,000 records/s ต่อ shard คูณด้วย shards จำนวนเท่าที่คุณต้องการ)

คำถามตัดสิน: **ทุก message ต้องถูกบริโภคโดย consumer หนึ่งตัวพอดีแล้วทิ้งหรือไม่?** → SQS **แต่ละ message ต้องถูกเห็นโดย consumers หลายตัวอย่างอิสระ หรือคุณต้องการความสามารถ replay หรือไม่?** → Kinesis

สำหรับ real-time dashboard ของ Nimbus: Kinesis consumers หลายตัว (dashboard, fraud detection, S3 archive) ทั้งหมดอ่าน stream เดียวกัน

สำหรับ order processing queue ของ Nimbus (ออร์เดอร์ถูกวาง → ECS task หนึ่งประมวลผลมัน): SQS consumer หนึ่ง ไม่ต้องการ replay ไม่ต้องการ fan-out

## การแสดงภาพข้อมูล: Amazon QuickSight

Athena query ข้อมูล Glue เตรียมมัน แต่ในบางจุดมีคนต้องเห็น chart — และไม่ใช่โดยการรัน SQL queries ใน console

"เราต้องการ service อีกตัวสำหรับสิ่งนั้นจริงๆ ไหม?" Maya ถาม "ฉัน export ผลลัพธ์ Athena ไป spreadsheet ไม่ได้หรือ?"

"สำหรับ query เดียว ได้" Tom พูด เขามีสีหน้าของคนที่เคยลองสิ่งนี้แล้ว "สำหรับ dashboard ที่คุณต้องการแชร์กับทั้งทีม นั่นคือ spreadsheet ใหม่ทุกเช้า"

**Amazon QuickSight** คือ managed business intelligence (BI) service ของ AWS มันเชื่อมต่อโดยตรงกับ Athena, S3, RDS, Redshift และ sources อื่น และให้คุณสร้าง dashboards และ visualizations โดยไม่มี BI server แยกต่างหาก

features หลัก:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight สามารถ import datasets เข้า in-memory engine ของมันสำหรับ query performance ต่ำกว่าวินาทีที่ scale โดยไม่ต้อง re-query Athena ในทุกการโหลด dashboard
- **ML Insights:** anomaly detection และ forecasting ในตัว — ไม่ต้องใช้ data science
- **Embedded dashboards:** คุณสามารถ embed QuickSight dashboards เข้าใน web application ของคุณเองผ่าน URL

Tom เชื่อมต่อ QuickSight กับ Athena data source และมี working dashboard ที่แสดงออร์เดอร์รายวัน รายได้ตามร้านอาหาร และ conversion funnel ภายในหนึ่งบ่าย

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" เขาถาม — แล้วตอบคำถามตัวเองก่อนที่ใครจะตอบได้ "QuickSight ประมาณ $24/เดือนต่อ author — คนที่สร้าง dashboards — และ $3/เดือนต่อ reader เรามีสี่คนที่จะใช้มัน"

"ดังนั้นประมาณหนึ่งร้อยดอลลาร์ต่อเดือน" Maya พูด

"สำหรับ BI service ที่ไม่อย่างนั้นจะต้องรัน analytics server แยกต่างหาก" Priya พูด "ใช่"

Tom publish dashboard ในเช้าวันรุ่งขึ้น แทนที่จะรัน Athena queries ทั้งทีมเปิด URL

> **เคล็ดลับการสอบ — QuickSight**
>
> QuickSight คือ managed BI และ visualization service ของ AWS เชื่อมต่อกับ Athena, S3, Redshift, RDS SPICE คือ in-memory query engine ที่เร่ง repeated dashboard queries trigger ข้อสอบ: "business intelligence dashboard บน AWS" หรือ "visualize data จาก Athena/Redshift" → QuickSight

## การกำกับดูแล Lake: AWS Lake Formation

เมื่อ data lake ของ Nimbus เติบโต data access กลายเป็นปัญหา governance

"ใคร query raw transaction logs ได้?" Priya ถาม ในการ review สถาปัตยกรรมครั้งถัดไป "ใครเห็น customer PII ได้? ใครเข้าถึง financial summary tables ได้?"

"Engineering มีการเข้าถึงเต็ม" Leo พูด "ทีม analytics มีการเข้าถึง aggregated tables Finance มีการเข้าถึง revenue tables"

"ตั้งค่าที่ไหน?"

Leo หยุด "ใน... ที่ที่แตกต่างกันไม่กี่ที่ S3 bucket policies, IAM policies, Glue catalog permissions"

"สามระบบแยกต่างหาก ซึ่งทั้งหมดต้องสอดคล้องกัน" Priya พูด "เกิดอะไรขึ้นเมื่อเราเพิ่ม analyst ใหม่? หรือเมื่อเราตัดสินใจจำกัดการเข้าถึง column เฉพาะ — เช่น customer phone numbers — จากทีม analytics?"

คำถามนั้นเผยให้เห็นช่องว่าง การจัดการ fine-grained data access ข้าม S3 bucket policies, IAM และ Glue Data Catalog พร้อมกันนั้นเปราะบาง

**AWS Lake Formation** คือ managed service ที่รวมศูนย์ access control สำหรับ data lake ของคุณ แทนที่จะจัดการ bucket policies, IAM policies และ Glue catalog permissions แยกต่างหาก Lake Formation ให้ที่เดียวในการให้ column-level, row-level และ table-level permissions บนข้อมูลของคุณ

features หลัก:

- อยู่บน S3 และ Glue Data Catalog — ไม่ต้องการ data migration
- **Fine-grained access control:** ให้ users หรือ roles เฉพาะการเข้าถึง tables, columns หรือแม้แต่ filtered rows เฉพาะ — เทียบเท่ากับ database-level permissions บนข้อมูล S3
- **Data filtering:** เมื่อ user query Lake Formation-governed table ผ่าน Athena, Lake Formation กรอง columns หรือ rows ที่พวกเขาไม่ได้รับอนุญาตให้เห็นออกโดยอัตโนมัติ

Priya ตั้งค่า Lake Formation ด้วยสาม permission tiers โดยมี Rafael ร่าง column-level rules: engineering role เห็น tables ทั้งหมดและ columns ทั้งหมด analytics role เห็น aggregated order tables แต่ไม่เห็น customer PII columns finance role เห็น revenue tables โดยมี customer identifiers ถูก mask

"ดังนั้น analyst รัน Athena query เดียวกัน" Leo ยืนยัน "แต่ Lake Formation ดักมันและตัด columns ที่พวกเขาไม่ได้รับอนุญาตให้เห็น?"

"ถูกต้อง การกรองเป็นอัตโนมัติ analyst ไม่ต้องรู้ว่ามันเกิดขึ้น — และพวกเขาทำงานเลี่ยงมันไม่ได้โดยการ query raw S3 files โดยตรง เพราะ Lake Formation ควบคุมการเข้าถึงที่ระดับ catalog"

"นั่นไม่ใช่งานเพิ่ม" Priya พูด "นั่นคือการออกแบบ"

> **เคล็ดลับการสอบ — Lake Formation**
>
> Lake Formation รวมศูนย์ access control สำหรับ data lake ที่สร้างบน S3 และ Glue Data Catalog รองรับ fine-grained permissions ที่ระดับ table, column และ row trigger ข้อสอบ: "จำกัดการเข้าถึง columns เฉพาะใน S3 data lake" หรือ "รวมศูนย์ data lake governance" → Lake Formation ความแตกต่างสำคัญจาก raw IAM: Lake Formation บังคับ column- และ row-level filtering ที่ IAM policies เพียงอย่างเดียวแสดงออกไม่ได้

## จุดแข็งและข้อจำกัด

**Kinesis Data Streams**: ใช้ Kinesis เมื่อข้อมูลของคุณมาถึงอย่างต่อเนื่องและลำดับสำคัญ — clickstreams, financial transactions, IoT telemetry Kinesis รักษาลำดับ record ภายใน shard และอนุญาตให้ replay ในระหว่าง retention window ที่ตั้งค่า (24 ชั่วโมงโดยค่าเริ่มต้น สูงถึง 365 วันด้วย Extended Data Retention) ซึ่งทำให้มันแตกต่างพื้นฐานจาก SQS trade-off คือ operational complexity: ในโหมด provisioned คุณจัดการ shard capacity และพฤติกรรม consumer สำหรับ task queues ง่ายๆ ที่ลำดับไม่สำคัญและ replay ไม่จำเป็น SQS เป็นตัวเลือกที่ง่ายกว่า

**AWS Glue**: Glue ขจัด infrastructure ของ ETL cluster แบบดั้งเดิม คุณเขียน transform logic; AWS จัดการ Spark environment มีค่าเมื่อ transforms ซับซ้อนหรือปริมาณข้อมูลใหญ่ ข้อจำกัดคือต้นทุนและ cold start — Glue jobs มีความล่าช้าในการเริ่มต้นหลายนาที ทำให้ไม่เหมาะสำหรับ near-real-time transforms สำหรับ file format conversions ง่ายๆ (CSV เป็น Parquet) overhead ของ Glue อาจไม่คุ้มเมื่อเทียบกับ Lambda function หรือ lightweight script

**Amazon Athena**: Athena ให้คุณ query ข้อมูล S3 ด้วย standard SQL และไม่มี infrastructure ที่ต้องจัดการ ข้อจำกัดสำคัญคือต้นทุน: Athena คิดต่อ terabyte ของข้อมูลที่สแกน query กับ table 10 TB ที่สแกนทั้งหมดมีค่าใช้จ่ายสูงกว่า query เดียวกันกับ Parquet-formatted, partitioned table ที่สแกน 200 GB อย่างมีนัยสำคัญ ใช้ columnar formats (Parquet หรือ ORC) และแบ่ง partition ข้อมูลของคุณเสมอก่อนรัน Athena ใน production หากไม่มีการ optimize เหล่านี้ บิล Athena จะทำให้คุณประหลาดใจ

## สรุป

งานเครือข่ายในบทที่ 25 ทำให้ data pipeline ของ Nimbus เป็นไปได้ บทนี้คือสิ่งที่ pipeline นั้นมีไว้เพื่อ: ทำให้ข้อมูลทั้งหมดที่ Nimbus สร้างขึ้นมองเห็นได้และดำเนินการได้จริง

- **Amazon Kinesis**: Real-time data streaming Producers เขียน records; consumers อ่านตามจังหวะของตัวเอง Amazon Data Firehose สามารถส่งข้อมูล streaming ไปยัง S3, Redshift และ destinations อื่นด้วยงานเชิงปฏิบัติการที่น้อยลง
- **AWS Glue**: ETL และ data cataloging Crawlers ค้นพบ schemas; Jobs แปลงข้อมูล; Data Catalog ทำให้ข้อมูลค้นพบได้โดย Athena และเครื่องมืออื่น
- **Amazon Athena**: Serverless SQL บน S3 Query ข้อมูลใดก็ตามใน S3 โดยใช้ standard SQL คิดต่อ TB ที่สแกน — ใช้ Parquet และการแบ่ง partition เพื่อลดต้นทุน
- **Amazon Redshift**: Managed data warehouse สำหรับ analytics ประสิทธิภาพสูง โหลดข้อมูลเข้า optimize สำหรับ analytical queries ที่ทำซ้ำ และ query ได้เร็วที่ระดับ warehouse
- **รูปแบบ data lake**: ข้อมูลดิบไปยัง S3 → Glue แปลงมัน → Athena query มัน → BI tools แสดงภาพมัน
- **Glue schema evolution**: ETL pipelines ที่ประมวลผลข้อมูลภายนอกต้องจัดการ schema changes อย่างสง่างาม ใช้ DynamicFrames พร้อม `mergeSchema: true` เพื่อหลีกเลี่ยงความล้มเหลวของ pipeline เมื่อ upstream data เพิ่ม fields ใหม่
- **Athena Workgroups**: per-team data scan limits และ result locations Cost control และ access control ในการตั้งค่าเดียว จำเป็นสำหรับ multi-team Athena deployment ใดๆ
- **Kinesis vs SQS**: Kinesis สำหรับ fan-out ไปยัง consumers หลายตัวและความสามารถ replay SQS Standard สำหรับ task queues ง่ายๆ; SQS FIFO สำหรับ ordered, deduplicated task processing คำถามตัดสิน: ทุก consumer ต้องเห็นทุก message หรือแต่ละ message ไปยัง consumer หนึ่ง?
- **เมื่อ Athena ผิด**: high-frequency dashboards (ใช้ Redshift), operational queries (ใช้ RDS หรือ DynamoDB), datasets ที่เล็กมากและเปลี่ยนแปลงบ่อย (แค่ใช้ database)
- **Amazon QuickSight**: managed BI service ของ AWS เชื่อมต่อกับ Athena, S3, Redshift และ RDS เพื่อสร้าง dashboards โดยไม่ต้องรัน BI server แยกต่างหาก SPICE คือ in-memory engine ที่เร่ง repeated dashboard queries
- **AWS Lake Formation**: Centralized access control สำหรับ data lakes บน S3 + Glue Data Catalog เปิดให้มี column-level, row-level และ table-level permissions — fine-grained data governance ที่ IAM เพียงอย่างเดียวแสดงออกไม่ได้

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = ordered, real-time streaming, consumers หลายตัว, replay ภายใน retention window (24 ชั่วโมงค่าเริ่มต้น สูงถึง 365 วัน) SQS = task queue, แต่ละ message ถูกประมวลผลครั้งเดียว "Consumers หลายตัวอ่าน stream เดียวกันพร้อมกัน" → Kinesis "หนึ่ง worker ต่อหนึ่ง message" → SQS
- **สัญญาณข้อสอบ Athena**: "serverless SQL บน S3," "วิเคราะห์ข้อมูล S3 โดยไม่โหลดลงฐานข้อมูล," "จ่ายต่อ query" → Athena
- **การ optimize ต้นทุน Athena**: Columnar format (Parquet หรือ ORC) + การแบ่ง partition ลดข้อมูลที่สแกนและต้นทุนอย่างมาก ข้อสอบอาจถามวิธีลดต้นทุน Athena
- **Athena pricing**: $5 ต่อ TB ที่สแกน (us-east-1, us-west-2 และ regions หลักส่วนใหญ่) ต้นทุนคำนวณจากข้อมูลที่สแกน ไม่ใช่ข้อมูลที่คืน — optimize รูปแบบ storage เสมอก่อนรัน production queries
- **Glue Crawler**: "ค้นพบ schema ของข้อมูล S3 โดยอัตโนมัติ" → Glue Crawler
- **Amazon Data Firehose**: "โหลด streaming data ไป S3/Redshift/OpenSearch โดยอัตโนมัติโดยไม่จัดการ consumers" → Amazon Data Firehose เอกสารเก่าอาจยังเรียกว่า Kinesis Data Firehose
- **Redshift vs Athena**: Redshift สำหรับ high-frequency, complex queries บน dataset คงที่ (BI dashboards) Athena สำหรับ ad-hoc queries บนข้อมูล S3 ที่เปลี่ยนแปลงบ่อย
- **EMR (Elastic MapReduce)**: AWS-managed Hadoop/Spark clusters ข้อสอบใช้สิ่งนี้เมื่อ "existing Hadoop/Spark workloads" หรือ "custom data processing frameworks" ถูกกล่าวถึง Glue คือทางเลือก managed สำหรับ use cases ส่วนใหญ่
- **QuickSight:** managed BI และ visualization ของ AWS เชื่อมต่อกับ Athena, S3, Redshift, RDS SPICE = in-memory engine สำหรับ repeated queries ที่เร็ว trigger ข้อสอบ: "business intelligence dashboard บน AWS" → QuickSight
- **Lake Formation:** Centralized access control สำหรับ data lake (S3 + Glue Data Catalog) Fine-grained permissions: ระดับ table, column และ row trigger ข้อสอบ: "จำกัดการเข้าถึง columns เฉพาะใน S3 data lake" หรือ "รวมศูนย์ data lake governance" → Lake Formation

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — ทบทวน**

อธิบายความแตกต่างระหว่าง Amazon Kinesis และ Amazon SQS คุณจะใช้แต่ละอันเมื่อใด?

*(คำใบ้: ลองคิดเกี่ยวกับว่า consumers กี่ตัวสามารถอ่านข้อมูลเดียวกัน, messages ถูกลบหลังการอ่านหรือไม่ และลำดับสำคัญหรือไม่)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทแชร์รถต้องการวิเคราะห์ข้อมูลการเดินทาง มีการเดินทาง 1 ล้านครั้งเสร็จต่อวัน trip records ถูกเก็บใน S3 เป็นไฟล์ JSON (ประมาณ 2KB ต่อไฟล์) ทีม analytics ต้องการรัน ad-hoc SQL queries เช่น "ระยะเวลาการเดินทางเฉลี่ยตามเมืองสัปดาห์ที่แล้ว" Queries ควรเสร็จในเวลาต่ำกว่า 2 นาที ต้องลด storage costs ทีมจะรัน 20-30 queries ต่อสัปดาห์

สถาปัตยกรรมใดตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) ใช้ AWS Glue แปลง JSON เป็นรูปแบบ Parquet แบ่ง partition ตามวันที่และเมือง; query ด้วย Amazon Athena  
B) โหลด trip data เข้า RDS PostgreSQL รายวัน; query โดยใช้ standard SQL  
C) ใช้ Amazon Data Firehose ส่ง trip data ไปยัง Amazon Redshift; query ด้วย Redshift  
D) โหลด trip data เข้า DynamoDB และใช้ PartiQL สำหรับ SQL queries

**คำใบ้ 1**: 20-30 queries ต่อสัปดาห์คือความถี่ต่ำ service ใดคุ้มค่าที่สุดสำหรับการ query เป็นครั้งคราว?

**คำใบ้ 2**: รูปแบบ Parquet + การแบ่ง partition ลดข้อมูลที่สแกนโดย Athena อย่างมาก — และดังนั้นต้นทุน

**คำใบ้ 3**: 1 ล้านการเดินทาง × 2KB = ~2GB ต่อวัน ในหนึ่งสัปดาห์ ~14GB ที่ $5/TB สำหรับ Athena แม้ไม่มีการ optimize นี่ก็ยังจ่ายไหว

**คำตอบ**: A

**คำอธิบาย**: Glue แปลง JSON เป็น Parquet (columnar format ลดข้อมูลที่สแกนอย่างมาก) แบ่ง partition ตามวันที่และเมือง (partition pruning หมายความว่า queries "สัปดาห์ที่แล้ว" สแกนเฉพาะ partitions 7 วัน) Athena query S3 โดยตรงด้วย standard SQL สำหรับ 20-30 queries ต่อสัปดาห์ Athena แบบ pay-per-query คุ้มค่ามากเทียบกับ Redshift ที่ทำงานตลอดเวลา

**ทำไมไม่ใช่ B?** การโหลดข้อมูล 2GB รายวันเข้า RDS แล้ว query ต้องการ database instance ที่ทำงาน 24/7 สำหรับ 20-30 queries ต่อสัปดาห์ นี่ over-engineered และแพงมาก

**ทำไมไม่ใช่ C?** Redshift คุ้มค่าสำหรับ high-frequency queries (หลายร้อยครั้งต่อวันบน dataset เดียวกัน) สำหรับ 20-30 queries ต่อสัปดาห์ always-on Redshift cluster มีค่าใช้จ่ายสูงกว่า pay-per-query pricing ของ Athena มาก

**ทำไมไม่ใช่ D?** DynamoDB คือ key-value/document store ที่ optimize สำหรับ key-based access ไม่ใช่ ad-hoc analytical queries PartiQL บน DynamoDB ไม่รองรับ GROUP BY aggregations แบบที่อธิบาย

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.5*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus ต้องการสร้าง real-time fraud detection system สำหรับออร์เดอร์ ระบบควร:

- ตรวจจับออร์เดอร์ที่วางโดยบัญชีเดียวกันมากกว่า 5 ครั้งใน 60 วินาที
- Flag ออร์เดอร์เหนือ $500 จากบัญชีใหม่ (อายุ < 30 วัน)
- ส่งออร์เดอร์ที่ถูก flag ไปยัง human review queue

ออกแบบสถาปัตยกรรม Kinesis ให้อะไร? fraud logic ทำงานที่ไหน? คุณจะเชื่อมโยง "บัญชีเดียวกัน, หน้าต่าง 60 วินาที" อย่างไร? service ใดรับออร์เดอร์ที่ถูก flag?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกออกแบบสถาปัตยกรรม real-time streaming)*

## ฉากหลังเครดิต

Tom รัน Athena query แรก

"ร้านอาหาร 10 อันดับแรกตามรายได้ไตรมาสที่แล้ว" เขาพูด

12 วินาทีต่อมา ผลลัพธ์ปรากฏ

เขาจ้องมองพวกมัน

"ร้านอาหาร 47 มาเป็นอันดับแรก" เขาพูด มันคือร้านอาหารของครอบครัว Maya — อันที่ Nimbus เริ่มต้น

"แน่นอน" Maya พูด "Arepa อร่อยขนาดนั้น"

Tom รัน query อีกอัน และอีกอัน "นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถามก่อนที่ Leo จะพูดอะไร Leo ตรวจสอบ query scan history สาม queries ข้อมูลที่สแกนรวม: 1.2GB ค่าใช้จ่าย: น้อยกว่าหนึ่งเซนต์

หลังจากหนึ่งชั่วโมง Tom มีภาพที่สมบูรณ์ของธุรกิจ Nimbus ในแบบที่เขาไม่เคยมีมาก่อน หมวดร้านอาหารใดเติบโตเร็วที่สุด customer cohorts ใดที่ retain นานที่สุด รายการเมนูใดขับเคลื่อนการสั่งซ้ำมากที่สุด

"ทำไมเราไม่สร้างสิ่งนี้เร็วกว่านี้?" เขาถาม

"เรามีข้อมูล" Leo พูด "เราแค่ไม่มี pipeline เพื่อใช้มัน"

"ข้อมูลอยู่ที่นั่นเสมอ" Maya พูดเบาๆ "เราแค่มองไม่เห็นมัน"

ในบทต่อไป: ตอนนี้ที่เราเห็นธุรกิจอย่างชัดเจนแล้ว มาพูดถึงวิธีจ่ายค่า infrastructure ที่รันมัน — อย่างมีประสิทธิภาพมากขึ้น
