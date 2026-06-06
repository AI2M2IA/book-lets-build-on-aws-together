# บทที่ 24: ฐานข้อมูลที่เติบโตไปพร้อมกับคุณ

ลองนึกภาพห้องสมุดที่เริ่มต้นด้วยสองชั้นวางและบรรณารักษ์คนเดียว นั่นเพียงพอ — ระยะหนึ่ง บรรณารักษ์รู้ว่าทุกอย่างอยู่ที่ไหน คำขอถูกตอบอย่างรวดเร็ว แล้วห้องสมุดก็เติบโต: สิบชั้นวาง ยี่สิบ สี่สิบ บรรณารักษ์คนเดิม โต๊ะเดิม card catalog เดิม ตอนนี้การหาอะไรต้องรอ บรรณารักษ์ไม่ได้ช้า — แค่มีห้องสมุดมากกว่าที่คนคนเดียวจะให้บริการได้ในอัตราเดิม

ทางออกไม่ใช่บรรณารักษ์ที่เร็วกว่า แต่เป็นห้องสมุดชนิดที่แตกต่าง

---

หลังจากการลดต้นทุน S3, Tom ทำการ review ต่อ ชั้นฐานข้อมูลเป็นปัญหาชนิดที่แตกต่าง — ไม่ใช่ข้อมูล idle ใน storage class ที่ผิด แต่เป็นระบบที่กำลังดิ้นรนอย่างแข็งขันภายใต้โหลดของการเติบโตของ traffic หกเดือน

---

ตัวเลขไม่น่าสบายใจ

Nimbus กำลังใช้ RDS PostgreSQL: Multi-AZ, instance db.r6g.large $340/เดือน

Leo เปิด CloudWatch metrics dashboard ตัวเลขมีรูปแบบ

**DatabaseConnections**: 198 จากสูงสุด 200 ในช่วง peak วันศุกร์ ห่างจากการอิ่มตัวสอง connections ที่ 200 ความพยายามเชื่อมต่อใหม่จะล้มเหลวด้วย "too many connections" — error ที่จะปรากฏเป็น HTTP 500s ต่อลูกค้าที่สั่งมื้อค่ำ

**CPUUtilization**: 89% peak ในช่วงเร่งด่วนมื้อค่ำวันศุกร์ instance ถูกออกแบบให้จัดการ spikes — db.r6g.large มี 2 vCPUs และ 16 GB ของ memory — แต่ CPU 89% ที่ต่อเนื่องหมายความว่าฐานข้อมูลเต็ม capacity ก่อนชั่วโมง peak จะมาถึงด้วยซ้ำ

**ReadLatency**: 840 มิลลิวินาที P95 หกเดือนก่อน มันคือ 180ms การเสื่อมถอยเป็นไปอย่างค่อยเป็นค่อยไป — 10 ถึง 20ms ต่อสัปดาห์ — มองไม่เห็นจนกระทั่งมันเป็นหายนะ สัปดาห์ก่อน review ของ Tom, P99 latency ข้ามหนึ่งวินาทีเต็ม ลูกค้าที่คลิกเมนูร้านอาหารกำลังรอกว่าหนึ่งวินาทีให้หน้าโหลด

**FreeStorageSpace**: 18% ของ provisioned storage ที่เหลือ ที่อัตราการเติบโตปัจจุบัน ฐานข้อมูลจะหมด provisioned storage ในประมาณ 11 สัปดาห์

"แต่ละอันแก้ได้แยกกัน" Leo พูด มองที่ dashboard "แต่เรามีทั้งสี่พร้อมกัน"

connection count spike ชี้ไปยังปัญหา connection pooling ในแอปพลิเคชัน — ECS tasks มากเกินไปที่เปิด database connections ของตัวเอง ปัญหา CPU ชี้ไปยัง queries ที่แพง ปัญหา latency และปัญหา CPU เกือบแน่นอนว่าเป็นปัญหาเดียวกัน: query ที่ช้าที่ทำงานบ่อยเกินไป

"เดี๋ยว — แต่*ทำไม*เราถึงอยู่ที่ 198 connections?" Maya ถาม "เรามีสาม ECS tasks เรามีเกือบ 200 database connections ได้อย่างไร?"

แต่ละ ECS task ใช้ SQLAlchemy พร้อม default pool size 5 connections บวก overflow 10 สาม tasks × 15 potential connections = 45 connections จากแอปพลิเคชัน อีก 153 มาจาก analytics Lambda functions, background job workers, Glue ETL job, local connections ของทีม development ผ่าน bastion host และหลาย connections ที่ถูกเปิดแต่ไม่ถูกปิดอย่างถูกต้องโดยเวอร์ชันเก่าของ code

"ปัญหา connection count" Leo พูด "จริงๆ แล้วเป็นปัญหาแอปพลิเคชันที่ดูเหมือนปัญหาฐานข้อมูล" เขาเพิ่ม PgBouncer (connection pooler) ลงในรายการ tasks — แต่ bottleneck ทันทีคือ query ที่ช้า

CPU ฐานข้อมูลพุ่งขึ้นเป็น 89% ในช่วงเร่งด่วนมื้อค่ำวันศุกร์ Read queries กำลังเข้าคิว P95 query latency เพิ่มขึ้นเป็นสองเท่าในช่วงหกเดือน

"ฐานข้อมูลคือคอขวด" เขาพูด "Traffic เติบโต ฐานข้อมูลไม่ได้ scale ตามไปด้วย"

"เราแค่ทำ instance ให้ใหญ่ขึ้นได้ไหม?" Maya ถาม "เดี๋ยว — แต่*ทำไม*เราถึงมีฐานข้อมูลเดียวที่จัดการทั้งการอ่านและการเขียน? ทำไมเราไม่กระจายสิ่งนี้ตั้งแต่แรก?"

"ได้" Leo พูด "นั่นคือ vertical scaling เราย้ายจาก r6g.large ไป r6g.xlarge CPU มากขึ้น memory มากขึ้น มันจะเสียเงินมากขึ้นและซื้อเวลาให้เรา"

"แต่มันไม่แก้ปัญหาพื้นฐาน" Priya พูด "ในที่สุดเราจะชน instance ที่ใหญ่ที่สุดและต้องการแนวทางที่แตกต่าง และเราคิดถึงสิ่งที่เกิดขึ้นถ้า write ไปยัง read replica โดยบังเอิญหรือยัง? replica ปฏิเสธมันและออร์เดอร์ล้มเหลวอย่างเงียบๆ"

"มีสองแนวทาง" Leo พูด "Read replicas หรือ Aurora"

"ต่างกันอย่างไร?"

"ลองนึกถึงมันเหมือนห้องสมุด" Leo พูดขณะหยิบปากกามาร์กเกอร์ "บรรณารักษ์คนเดียวที่ทั้งรับคืนหนังสือและตอบคำถามผู้ใช้ เมื่อห้องสมุดมีคนมาใช้มากขึ้น คิวก็ก่อตัว วิธีแก้: จ้างบรรณารักษ์เพิ่ม — แต่เฉพาะสำหรับการตอบคำถาม การรับคืนยังคงผ่านเคาน์เตอร์เดิม"

"นั่นคือ read replica" Priya พูด

"ถูกต้อง Aurora ก้าวไปอีกขั้น — มันออกแบบระบบชั้นวางเองใหม่เพื่อให้บรรณารักษ์ทุกคนแชร์ชั้นวางเดียวกันและเห็นหนังสือเล่มเดียวกันเสมอ โดยไม่มีความล่าช้า ไม่ต้องรอให้การอัปเดตค่อยๆ ไหลจากเคาน์เตอร์หนึ่งไปยังอีกเคาน์เตอร์"

**Read Replicas: การกระจาย Read Traffic**

แอปพลิเคชันเว็บส่วนใหญ่อ่านข้อมูลบ่อยกว่าเขียนมาก ลูกค้าที่ดูเมนูทำ SELECT queries หลายสิบครั้ง การวางออร์เดอร์ทำ INSERT/UPDATE queries ไม่กี่ครั้ง อัตราส่วนโดยทั่วไปคือ 10:1 หรือสูงกว่า

**read replica** คือ RDS instance เพิ่มเติมที่รับสำเนาของการเขียนทั้งหมดจาก primary และทำให้การเขียนเหล่านั้นพร้อมใช้สำหรับ SELECT queries

วิธีการทำงาน:

1. การเขียนของแอปพลิเคชัน (INSERT, UPDATE, DELETE) ไปที่ฐานข้อมูล primary
2. primary replicate การเปลี่ยนแปลงเหล่านั้นแบบ asynchronous ไปยัง read replicas
3. การอ่านของแอปพลิเคชัน (SELECT) ถูกกระจายไปทั่ว read replicas
4. read replicas แบ่งปันโหลด — แต่ละตัวจัดการ read traffic รวมเป็นส่วนๆ

ผลลัพธ์: ฐานข้อมูล primary จัดการเฉพาะการเขียน (และอาจการอ่านบางส่วน) read replicas จัดการ read load สำหรับอัตราส่วนการอ่าน/เขียน 10:1 การเพิ่ม read replica หนึ่งตัวจะลดโหลดรวมของ primary ลงประมาณครึ่งหนึ่ง

**ข้อจำกัดสำคัญ**: Replication เป็นแบบ **asynchronous** มี replication lag — โดยทั่วไปเป็นมิลลิวินาที แต่อาจเป็นวินาทีภายใต้โหลด การอ่านจาก replica อาจเห็นข้อมูลที่ล่าช้ากว่า primary เล็กน้อย สำหรับการอ่านส่วนใหญ่ (ดูเมนู ดูประวัติออร์เดอร์) สิ่งนี้ยอมรับได้ สำหรับ "ออร์เดอร์ของฉันผ่านหรือยัง?" — อ่านจาก primary

**Read Replicas: รายละเอียด**

- คุณสามารถมี read replicas ได้สูงสุด 15 ตัวต่อ RDS instance primary (MySQL, PostgreSQL, MariaDB)
- read replicas สามารถอยู่ใน region เดียวกันหรือ region ที่แตกต่าง (cross-region replicas)
- read replicas สามารถมี read replicas ของตัวเองได้ (chaining)
- read replicas เป็น endpoints แยกต่างหาก — แอปพลิเคชันของคุณต้องส่ง reads ไปยัง replica endpoint
- read replicas สามารถถูก promote เป็น standalone databases ได้ (มีประโยชน์สำหรับ DR)

สำหรับ Nimbus, Leo เพิ่ม read replica หนึ่งตัว "มันจะไม่เป็นไรหรอก" เขาพูดเมื่อ Priya ถามว่าเขาได้ทดสอบ read/write routing logic ของแอปพลิเคชันก่อนสลับ traffic หรือไม่ เขายังไม่ได้ทำ เขาใช้เวลาสี่สิบนาทีถัดมายืนยันว่า writes ไม่ได้ไปยัง read replica endpoint

เขาอัปเดตแอปพลิเคชันเป็น:

- Write operations → primary endpoint
- การดูเมนู, ประวัติออร์เดอร์ → replica endpoint

CPU บน primary ลดลงจาก 89% เหลือ 41% ในช่วง peak

**ปัญหา Read-After-Write Consistency**

สามวันหลังจากเปิด read replica, support ticket มาถึง พันธมิตรร้านอาหารอัปเดตเมนูของพวกเขา — ลบรายการที่เลิกขาย — แล้วโทรมายืนยันว่ามันถูกลบ customer service agent เปิดเมนูจาก Nimbus interface รายการยังอยู่ที่นั่น

ยี่สิบวินาทีต่อมา มันหายไป

asynchronous replication lag การเขียน (DELETE menu item) ไปยัง primary การอ่านของ customer service agent ไปยัง replica ซึ่งยังไม่ได้รับการเปลี่ยนแปลง replica ล่าช้า 15 วินาทีในขณะนั้น — ไม่ใช่เรื่องแปลก แต่มองเห็นได้

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่านหน้าต่าง eventual consistency ล่ะ?" Priya ถาม "หรือแค่ — ถ้าออร์เดอร์ถูกวางสำหรับรายการเมนูที่เพิ่งถูกลบล่ะ? เราจะเรียกเก็บเงินลูกค้าและร้านอาหารจะไม่มีรายการนั้น"

นี่คือความกังวลเรื่อง consistency จริง ไม่ใช่แค่ความน่ารำคาญด้าน UX

วิธีแก้: ระบุว่าการอ่านใดมีความต้องการ consistency และ route พวกมันไปยัง primary

**การอ่านที่ไปยัง replica ได้** (eventual consistency ไม่เป็นไร):
- ลูกค้าที่ดูเมนูของร้านอาหาร (เก่าไป 1-2 วินาทีไม่สังเกตได้)
- order history queries (ผู้ใช้ที่ดูประวัติออร์เดอร์จากนาทีก่อน)
- การอ่านชนิด analytics (ร้านอาหารยอดนิยมสัปดาห์นี้)

**การอ่านที่ต้องไปยัง primary** (ต้องการ read-after-write consistency):
- ทันทีหลังการเขียน เมื่อแอปพลิเคชันต้องยืนยันว่าการเขียนสำเร็จ
- การอ่าน order status ทันทีหลังการวางออร์เดอร์
- การอ่านเมนูที่ trigger โดย restaurant management interface (ร้านอาหารเพิ่งเปลี่ยนเมนู)

แอปพลิเคชันเพิ่ม routing hint ในชั้น database connection: ถ้า request มาจาก restaurant management dashboard, route ไปยัง primary ถ้ามาจากลูกค้าที่ดู, route ไปยัง replica `X-Read-Consistency: strong` HTTP header ทำหน้าที่เป็นสัญญาณ

"มันไม่ยาก" Leo พูด "คุณแค่ต้องรู้ว่าการอ่านใดต้องการมัน"

"และบันทึกมันไว้" Priya พูด "เพื่อให้คนถัดไปที่เพิ่ม endpoint ใหม่รู้ว่าจะใช้ pool ไหน"

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถาม มันเป็นคำถามเปิดมาตรฐานของเขาสำหรับ service ใหม่ใดๆ

read replica ของ instance type เดียวกันมีต้นทุนเท่ากับ primary จาก $340/เดือน เป็น $680/เดือน

"เราเพิ่มต้นทุนเป็นสองเท่าเพื่อลดโหลดประมาณครึ่งหนึ่ง" Tom พูด

"ใช่ แต่ทางเลือกคือการย้ายไปยัง instance type ที่ใหญ่กว่า ซึ่งก็จะเสียเงินมากขึ้นเช่นกันและไม่กระจาย read load"

Tom คำนวณ เขาพยักหน้าอย่างไม่เต็มใจ

"จะเกิดอะไรขึ้นถ้า primary ล้มเหลว?" Maya ถาม ก่อนที่ Tom จะหันไป Aurora "เกิดอะไรขึ้นกับ read replica?"

Leo อธิบาย replica promotion

**ถ้า RDS instance primary ล้มเหลว** AWS failover ไปยัง standby replica ในการตั้งค่า Multi-AZ โดยอัตโนมัติ (replica ชนิดที่แตกต่าง — synchronous standby ไม่ใช่ read replica) Multi-AZ standby กลายเป็น primary ใหม่ read replicas ยังคงให้บริการ reads ตอนนี้ replicate จาก primary ใหม่ จากมุมมองของแอปพลิเคชัน primary endpoint DNS เปลี่ยนเพื่อชี้ไปยัง standby เดิม และแอปพลิเคชัน reconnect

failover โดยทั่วไปใช้เวลา 60-120 วินาทีสำหรับ RDS PostgreSQL ในระหว่างหน้าต่างนั้น writes ล้มเหลว

**Read replica promotion** เป็น operation แยกต่างหาก — และ scenario แยกต่างหาก ถ้าคุณต้องการนำ read replica และทำให้มันเป็นฐานข้อมูลอิสระที่เขียนได้ (สำหรับ DR, สำหรับการ migrate ไป region ใหม่ หรือเพราะ primary หายไปและคุณต้อง promote แทนที่จะรอ Multi-AZ failover) คุณสามารถ promote read replica เป็น standalone primary การ promote ใช้เวลาไม่กี่นาที หลังจากนั้น replica ไม่ replicate จาก primary ดั้งเดิมอีกต่อไป — มันเป็นฐานข้อมูลของตัวเอง

"เราคิดถึงสิ่งที่เกิดขึ้นถ้า us-west-2 primary ล่มไปทั้งหมดหรือยัง?" Priya ถาม "ไม่ใช่แค่ failover ไปยัง Multi-AZ standby — แต่ทั้ง region"

"ถ้า region ล้มเหลว" Leo พูด "Multi-AZ standby ก็อยู่ใน us-west-2 ทั้งคู่ล้มเหลวพร้อมกัน"

"ดังนั้นสำหรับ regional DR scenario ที่แท้จริง" Tom พูด "เราจะต้องการ read replica ใน us-east-1 ที่เราสามารถ promote ได้"

"ใช่ cross-region read replica เรายังไม่มี"

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถาม เขารู้อยู่แล้วว่าคำตอบจะเกี่ยวข้องกับการตัดสินใจ

cross-region read replica ของ db.r6g.large ใน us-east-1: $340/เดือน (ต้นทุน instance เดียวกัน) บวก cross-region data transfer สำหรับ replication: น้อยมากที่ปริมาณ write ของ Nimbus รวม: ประมาณ $350/เดือน สำหรับ DR replica

"นั่นคือ $4,200 ต่อปี" Tom พูด "เพื่อป้องกัน scenario ที่เกิดขึ้นกับ AWS regions น้อยกว่าห้าครั้งในสิบปี"

"และต้นทุนของการที่ Nimbus ล่มเป็นเวลา 24 ชั่วโมงในระหว่าง regional event คือ?" Priya ถาม

Tom คำนวณ เขาไม่ตอบออกเสียง แต่เขาเพิ่ม "cross-region read replica" ลงใน DR backlog

"Aurora คืออะไร?" เขาถาม

**Amazon Aurora: การคิดใหม่เกี่ยวกับ Database Engine**

Aurora คือ relational database engine ที่ AWS เป็นเจ้าของ เข้ากันได้กับ MySQL และ PostgreSQL มันถูกออกแบบตั้งแต่ต้นสำหรับ cloud workloads คิดใหม่ว่า storage layer ของ relational database ทำงานอย่างไร

ในการตั้งค่า RDS ทั่วไป (MySQL, PostgreSQL), storage และ compute ถูกผูกกันอย่างแน่นหนา database engine จัดการไฟล์ข้อมูล Replication คัดลอกข้อมูลจาก primary ไปยัง replica replica ต้องทำซ้ำทุก write operation

สิ่งนี้สร้างเพดานบนความเร็ว replication: replica สามารถใช้ writes ได้เร็วเท่าที่มันประมวลผล replication log ในระหว่างช่วงที่เขียนหนัก — bulk import, flash sale, batch update — replica อาจตามหลัง Replication lag ไม่ใช่ข้อบกพร่องใน implementation; มันเป็นผลที่ตามมาของสถาปัตยกรรม

Priya ชี้สิ่งนี้ทันทีเมื่อ Leo เสนอ read replicas "และเราคิดถึงสิ่งที่เกิดขึ้นถ้า replication lag พุ่งขึ้นเป็น 30 วินาทีในระหว่างเร่งด่วนวันศุกร์หรือยัง? replica ล่าช้า 30 วินาที ลูกค้าวางออร์เดอร์ kitchen slot ถูกจองใน primary แต่ลูกค้าคนที่สองที่ query replica ไม่เห็นการจอง สองออร์เดอร์ หนึ่ง slot"

"นั่นคือปัญหา inventory consistency" Leo พูด

"นั่นเป็นปัญหา inventory consistency พอดี" Priya ยืนยัน "ซึ่งเป็นเหตุผลที่การอ่าน inventory — 'รายการนี้ยังว่างอยู่ไหม?' — ต้องไปยัง primary"

สถาปัตยกรรมของ Aurora จัดการ lag โดยตรง

Aurora แยก storage จาก compute มันใช้ distributed, fault-tolerant storage layer ที่ replicate ข้อมูลโดยอัตโนมัติข้ามสาม Availability Zones ในหกสำเนา compute layer (database instances) อยู่บน storage layer นี้

**สิ่งที่เปลี่ยนไป**:

**Read replicas**: Aurora replicas ไม่ต้อง replicate ข้อมูล — พวกมันแชร์ storage layer เดียวกันอยู่แล้ว ซึ่งหมายความว่า:

- สูงสุด 15 Aurora Replicas ที่แชร์ storage volume (RDS ทั่วไปก็อนุญาตสูงสุด 15 read replicas แต่แต่ละตัวเป็นสำเนาข้อมูลเต็ม)
- Replication lag โดยทั่วไปต่ำกว่า 100 มิลลิวินาที (เทียบกับวินาทีสำหรับ RDS ภายใต้โหลด)
- Replicas สามารถถูก promote เป็น primary ในเวลาต่ำกว่า 30 วินาที (เทียบกับนาที)

**Failover**: เพราะ replicas แชร์ storage, failover เร็วกว่ามาก — การ promote ไม่เกี่ยวข้องกับการถ่ายโอนข้อมูล แค่เปลี่ยนทิศทางการเขียน

**Storage**: Aurora scale storage โดยอัตโนมัติในส่วนเพิ่ม 10GB สูงสุดถึง 128 TiB (256 TiB ใน engine versions ล่าสุด) คุณไม่เคยจัดสรร storage ล่วงหน้า

**Performance**: Aurora อ้างว่ามี throughput 5 เท่าของ MySQL มาตรฐานและ 3 เท่าของ PostgreSQL มาตรฐานสำหรับ instance types ที่เทียบเท่า

คุณอาจสงสัยว่า: ถ้า replicas ทั้งหมดแชร์ storage เดียวกัน storage นั้นไม่กลายเป็น single point of failure หรือ? storage layer ของ Aurora replicate ข้อมูลโดยอัตโนมัติข้ามหกสำเนาในสาม Availability Zones storage เองทนทานกว่าการตั้งค่า RDS Multi-AZ ตัวใดตัวเดียว — มันถูกออกแบบให้รอดจากการสูญเสียทั้ง AZ ด้วย zero data loss และไม่ต้อง failover

คำถามที่พบบ่อยตัวที่สอง: ถ้า Aurora เข้ากันได้กับ MySQL/PostgreSQL คุณ migrate จาก RDS PostgreSQL ไป Aurora PostgreSQL โดยไม่เปลี่ยน application code ได้ไหม? เกือบ ความเข้ากันได้ของ Aurora PostgreSQL หมายความว่า Aurora implement PostgreSQL wire protocol และรองรับ PostgreSQL SQL syntax และ features ส่วนใหญ่ แอปพลิเคชันส่วนใหญ่ migrate โดยไม่มีการเปลี่ยน code edge cases: PostgreSQL extensions จำนวนน้อยไม่มีให้ใน Aurora, system catalog queries บางอันคืนค่าที่แตกต่าง และ administrative operations บางอย่างต่างกัน สำหรับ production migrations ทดสอบด้วย parallel read traffic ก่อนสลับ writes

สำหรับ Nimbus การ migrate จาก RDS PostgreSQL ไป Aurora PostgreSQL ใช้เวลาหนึ่งบ่าย แอปพลิเคชันชี้ไปยัง Aurora endpoint menu query — หลังจาก Leo เพิ่ม index ที่ Performance Insights ชี้ว่าเป็นผู้บริโภค database load อันดับต้น — ทำงานใน 4ms แทน 620ms connection pool ไม่ชน 198 จาก 200 อีกต่อไป P95 latency ลดลงเหลือ 28ms

"มันเป็น database engine ที่แตกต่าง" Leo พูด "ที่แอปพลิเคชันคิดว่าเป็น database engine เดียวกัน"

"และส่วนที่น่าสนใจ?" Maya ถาม

"การ clone ฐานข้อมูลที่รวดเร็ว"

"จดไว้แล้ว" Sam พูดเบาๆ จากอีกฟากของห้อง พิมพ์อยู่แล้ว Sam เป็น backend engineer ที่เข้าร่วมทีมไม่กี่สัปดาห์ก่อนเพื่อรับงานฐานข้อมูลบางส่วนจาก Leo ไม่มีใครถามว่าเขากำลังทำอะไร

**Aurora Pricing: คำถามของ Tom**

Aurora pricing แตกต่างจาก RDS:

**Instance pricing**: คล้ายกับ RDS instance pricing ตามประเภท

**Storage pricing**: $0.10 ต่อ GB ต่อเดือน (คุณจ่ายตามที่เก็บ scale อัตโนมัติ)

**I/O pricing**: Aurora คิดเงินต่อ I/O request (อ่าน/เขียนไปยัง storage) ซึ่งอาจมีนัยสำคัญสำหรับ write-heavy workloads

"เดี๋ยว" Tom พูด "เราจ่ายค่า I/O แยกต่างหากด้วย?"

"Aurora Serverless v2 และ Aurora I/O-Optimized เปลี่ยน pricing model นี้" Leo พูด "Aurora I/O-Optimized ไม่คิดค่า I/O แต่ราคา storage และ instance สูงกว่า ดีกว่าสำหรับ I/O-heavy workloads"

Tom มองดู trade-off สำหรับ Nimbus ซึ่งเป็น read-heavy (menu queries เยอะ writes น้อย) Aurora I/O-Optimized อาจมีต้นทุนสูงกว่า Aurora pricing มาตรฐานอาจเหมาะสม

heuristic ที่มีประโยชน์: ถ้าค่า I/O ของคุณเกินประมาณ 25% ของบิล Aurora รวม I/O-Optimized น่าจะถูกกว่า สำหรับ read-heavy workload ของ Nimbus, ค่า I/O ต่ำ — pricing มาตรฐานนำมาใช้ สำหรับ write-heavy workload เช่น event logging system, I/O-Optimized อาจลดต้นทุนได้อย่างมาก

นี่คือการตัดสินใจด้านต้นทุนจริงที่วิศวกร senior ทำ: คุณต้องรู้รูปแบบ I/O ของ workload ของคุณเพื่อเลือกอย่างถูกต้อง

ถ้า workload ของคุณเล็ก เสถียร และคาดเดาได้ RDS PostgreSQL ง่ายกว่าและถูกกว่าอย่างมีความหมาย — แต่ถ้า traffic ของคุณคาดเดาไม่ได้ ปริมาณข้อมูลกำลังเติบโตเกินกว่าที่คุณจัดสรรล่วงหน้าได้ หรือคุณต้องการ automatic failover ในเวลาต่ำกว่า 30 วินาที shared storage model ของ Aurora ก็คุ้มกับ base cost ที่สูงกว่า

**Aurora Serverless: การ Scale โดยไม่ต้องคิดเรื่อง Instances**

**Aurora Serverless v2** คือการกำหนดค่าที่ scale compute capacity โดยอัตโนมัติตาม database load ที่แท้จริง แทนที่จะเลือกขนาด instance คงที่ (db.r6g.large) คุณตั้ง capacity ขั้นต่ำและสูงสุดในหน่วย Aurora Capacity Units (ACUs)

Aurora Serverless v2:

- scale ขึ้นในไม่กี่วินาทีเมื่อโหลดเพิ่ม
- scale ลงในช่วง idle — และตั้งแต่ปลายปี 2024 สามารถ auto-pause ลงถึง 0 ACUs เมื่อไม่มี connections (resume ใช้เวลา ~15 วินาที; auto-pause ไม่ทำงานกับ RDS Proxy หรือ connection-holding proxies อื่น)
- ค่าใช้จ่าย: $0.12 ต่อ ACU-hour (บวก storage และ I/O)

สำหรับ workloads ที่มี traffic ผันแปร — spikes วันศุกร์ของ Nimbus เทียบกับเช้าวันจันทร์ที่เงียบ — Serverless v2 ลดต้นทุนในช่วง off-peak และจัดการ peaks โดยไม่ต้อง pre-provisioning

"ดังนั้นในระหว่าง spike วันศุกร์" Leo พูด "Aurora scale ขึ้นโดยอัตโนมัติ เช้าวันอาทิตย์ที่เราแทบไม่มี traffic มัน scale กลับลงเหลือขั้นต่ำ"

"และเราจ่ายเฉพาะ capacity ที่เราใช้" Tom พูด

"ถูกต้อง"

หลังจากหนึ่งเดือนบน Aurora Serverless v2, Leo เปิดกราฟ ACU (Aurora Capacity Unit) สำหรับสัปดาห์ก่อน

กราฟแสดงรูปแบบที่ชัดเจนสองแบบ ในระหว่างสัปดาห์ ฐานข้อมูลทำงานที่ 2-4 ACUs — เสียงฮัมเงียบๆ ของ background queries, ECS health checks, Glue ETL jobs และ development testing ในเย็นวันศุกร์ระหว่าง 18:00 และ 22:00, ACU count ไต่ขึ้น:

```
Friday 18:00  → 6 ACUs
Friday 19:00  → 14 ACUs
Friday 19:45  → 26 ACUs  (peak — ออร์เดอร์พิซซ่าพุ่งก่อน NFL kickoff)
Friday 20:30  → 18 ACUs
Friday 21:00  → 12 ACUs
Friday 22:30  → 4 ACUs
Saturday 02:00 → 2 ACUs  (ขั้นต่ำ)
```

การ scaling เกือบจะทันที — Aurora Serverless v2 scale ในส่วนเพิ่ม 0.5 ACUs และมันสามารถเพิ่ม capacity ในไม่กี่วินาทีแทนที่จะเป็นนาทีที่ต้องใช้ในการจัดหา RDS instance ใหม่

"peak วันศุกร์นั้นมีค่าใช้จ่ายเท่าไร?" Tom ถาม

ที่ $0.12 ต่อ ACU-hour: peak วันศุกร์คือ 4 ชั่วโมงเฉลี่ย 18 ACUs → $8.64 สำหรับช่วง peak ที่เหลือของสัปดาห์ที่ 3 ACUs เฉลี่ย × 164 ชั่วโมง × $0.12 = $59.04 รวมสำหรับสัปดาห์: $67.68

provisioned instance ที่เทียบเท่าเพื่อจัดการ peak วันศุกร์ (db.r6g.xlarge, 4 vCPUs, 32 GB) จะมีต้นทุน $0.937/ชั่วโมง × 168 ชั่วโมง = **$157.42 สำหรับสัปดาห์** — ไม่ว่า peak วันศุกร์จะเกิดขึ้นจริงหรือไม่

"Serverless v2 คือ $67 สำหรับสัปดาห์ provisioned instance ที่ขนาดสำหรับ peak คือ $157" Tom พูด "นั่นคือการลด 57%"

"บนฐานข้อมูลที่ใช้ 26 ACUs จริงๆ เป็นเวลาสี่ชั่วโมงในวันศุกร์และ 2 ACUs สำหรับที่เหลือของสัปดาห์" Leo พูด "ถ้าฐานข้อมูลของคุณทำงานที่โหลดสูงสม่ำเสมอทั้งสัปดาห์ provisioned instance ถูกกว่า การประหยัดมาจากความผันแปร"

Tom พยักหน้าช้าๆ เขากำลังเพิ่มสิ่งนี้ลงในรูปแบบในโน้ตของเขา: เรื่องราวการประหยัดทุกเรื่องในไตรมาสนี้มีรูปทรงเดียวกัน คุณจ่ายตามที่คุณใช้ ไม่ใช่ตามที่คุณอาจต้องการ S3 lifecycle policies จ่ายเฉพาะ storage class ที่แต่ละ object สมควร Lambda จ่ายเฉพาะเวลา invocation Fargate จ่ายเฉพาะ task CPU และ memory Aurora Serverless v2 จ่ายเฉพาะ ACUs ที่ฐานข้อมูลบริโภคจริง

Tom มีสีหน้าของคนที่พบสิ่งที่กำลังมองหาอยู่พอดี

**การกู้คืนจาก Migration ที่ไม่ดี: Clones, PITR และปุ่ม Undo**

สองสัปดาห์หลังย้ายไป Aurora, Sam รัน database migration script ใน production script ควรลบ column `legacy_menu_format` จากตาราง `menu_items` เขารันมันโดยไม่มี WHERE clause ที่เขาคิดว่าได้ใส่ไว้

ผลลัพธ์ไม่ใช่การลบ column มันเป็น DELETE statement ที่ล้าง 40,000 rows จากตาราง `menu_items` — ข้อมูลเมนูประมาณ 200 ร้านอาหาร หายไป

alert ยิงภายใน 30 วินาที Order failures พุ่งขึ้น menu service เริ่มคืนค่าผลลัพธ์ว่างเปล่าสำหรับ 200 ร้านอาหาร

"มันควรจะมี WHERE clause" Sam พูด จ้องที่ console

เส้นทางการกู้คืนแบบดั้งเดิม: restore จาก automated backup snapshot ล่าสุด Automated backups ทำงานครั้งหนึ่งทุก 24 ชั่วโมง และ full restore-and-swap จะใช้เวลา 20-40 นาที — ในระหว่างนั้น*ทุก*ร้านอาหารจะมืด ไม่ใช่แค่ 200 ที่ได้รับผลกระทบ — และทุกออร์เดอร์ที่วางตั้งแต่ backup จะสูญหาย

Leo ไม่ได้ทำเช่นนั้น เช่นเดียวกับ standard RDS, Aurora เก็บ continuous backups สำหรับ **point-in-time recovery (PITR)** — คุณสามารถ restore cluster ไปยังวินาทีใดก็ได้ภายใน backup retention window ไม่ใช่แค่ snapshot รายคืนล่าสุด และที่สำคัญ การ restore สร้าง cluster *ใหม่*; production ยังคงทำงานในขณะที่คุณกู้คืน

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

timestamp: 15:42:00Z — สี่นาทีก่อน Sam รัน migration script ในขณะที่ recovery cluster กำลัง spin up ที่เหลือของ production ยังคงให้บริการร้านอาหารที่ไม่ได้รับผลกระทบ เมื่อมันพร้อมใช้ Leo dump rows `menu_items` สำหรับ 200 ร้านอาหารที่ได้รับผลกระทบจาก recovery cluster และ insert พวกมันกลับเข้า production เวลารวมจาก alert ถึงเมนูที่กู้คืนเต็มที่: ต่ำกว่า 40 นาทีเล็กน้อย — และเพราะเขาซ่อม rows อย่างแม่นยำแทนที่จะสลับฐานข้อมูลทั้งหมด ไม่มีออร์เดอร์ที่วางหลัง 15:42 สูญหาย recovery cluster ถูกลบหลังจากนั้น; มันทำหน้าที่ของมันเสร็จแล้ว

"เราสูญเสียอะไรไป?" Maya ถาม

หกออร์เดอร์ที่วางกับเมนูที่ว่างเปล่าชั่วครู่ล้มเหลวที่ checkout — ทั้งหมดอยู่ใน SQS queue และสามารถ replay ได้ ไม่มีข้อมูลลูกค้าสูญหายอย่างถาวร

"และนี่คือที่ที่ **fast database cloning** เข้ามา" Leo พูด รวมทีมเข้าด้วยกันหลังจากนั้น Aurora สามารถสร้าง **clone** ของ cluster ในไม่กี่นาที โดยไม่คำนึงถึงขนาดฐานข้อมูล โดยใช้ copy-on-write: clone แชร์ storage layer ของตัวต้นฉบับและมีเพียง pages ใหม่หรือที่เปลี่ยนแปลงเท่านั้นที่บริโภคพื้นที่เพิ่ม clone ของ production database ปัจจุบันนั้นถูก เร็ว และแยกตัวอย่างสมบูรณ์ — writes ไปยัง clone ไม่เคยแตะ production

"ซึ่งหมายความว่า" Priya พูด มองที่ Sam "migration script ถูกทดสอบกับ clone ของ production data ก่อนมันทำงานใน production จริง นั่นคือกฎใหม่"

Sam พยักหน้า เขาเขียนมันบน sticky note แล้ว

มีเครื่องมืออีกตัวที่อยู่ในภาพนี้ Aurora MySQL — ไม่ใช่ Aurora PostgreSQL — มี **Aurora Backtrack**: feature ที่ rewind cluster *ในที่* ไปยังจุดเวลาเฉพาะ โดยไม่ restore ไปยัง cluster ใหม่เลย ถ้า cluster ของ Nimbus เป็น Aurora MySQL, Leo สามารถ backtrack มันไปยัง 15:42 ในเวลาต่ำกว่าสามนาที — แม้ว่าการ rewind ทั้ง cluster จะ roll back ออร์เดอร์ที่ถูกต้องไม่กี่อันที่เขียนหลังการลบด้วย ซึ่งวิธี surgical PITR รักษาไว้

"แล้วถ้ามีคนพยายามเจาะเข้ามาโดยใช้ Backtrack — หรือ point-in-time restore ล่ะ?" Priya ถาม "ผู้โจมตีสามารถ rewind audit logs หรือ compliance data ได้ไหม?"

Backtrack ต้องการ API permission `rds:BacktrackDBCluster` และ restores ต้องการ `rds:RestoreDBClusterToPointInTime` — IAM actions แยกต่างหากจาก database operations ปกติ Standard application roles ไม่มี permissions เหล่านี้ มีเพียง operations team ที่มี IAM policy ชัดเจนอนุญาตพวกเขาเท่านั้นที่สามารถใช้พวกมัน เธอเพิ่มสิ่งนี้ลงใน IAM permissions review checklist

ข้อควรระวังสำคัญ: Aurora Backtrack มีให้เฉพาะ Aurora MySQL-compatible clusters ไม่ใช่ PostgreSQL Backtrack window ถูกตั้งค่าตอนสร้าง cluster (1 ชั่วโมงถึง 72 ชั่วโมง คิดเงินต่อชั่วโมงของ backtrack window) และ Backtrack ส่งผลต่อทั้ง cluster — คุณไม่สามารถ Backtrack ตารางเดียวหรือชุด rows เดียว สำหรับ surgical row-level recovery — บน engine ใดก็ตาม — วิธี PITR-to-a-temporary-cluster ที่ Leo ใช้คือเครื่องมือ

**Aurora Global Database: Multi-Region Reads**

**Aurora Global Database** ขยาย Aurora ข้าม AWS regions หลายแห่ง:

- **One primary region** จัดการการเขียนทั้งหมด
- **สูงสุดห้า secondary regions** ให้บริการ reads ด้วย replication lag โดยทั่วไป <1 วินาที
- secondary regions สามารถถูก promote เป็น primary ในเวลาต่ำกว่า 1 นาที (สำหรับ DR scenarios)

สำหรับการขยายตัวระดับโลกของ Nimbus, Aurora Global Database จะให้พันธมิตรร้านอาหารในลอนดอน query เมนูท้องถิ่นของพวกเขาจาก EU read replica ในขณะที่ออร์เดอร์ทั้งหมด (writes) ยังคงผ่าน US primary

**RDS vs Aurora: เมื่อใดควรเลือกแต่ละตัว**

| ปัจจัย            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| ต้นทุน            | ต่ำกว่าสำหรับ workloads เล็ก  | ฐานสูงกว่า แต่ scale ได้ดีกว่า                              |
| ความเข้ากันได้    | เต็มรูปแบบ                    | เข้ากันได้กับ MySQL/PostgreSQL (มีความแตกต่างเล็กน้อย)     |
| Replicas สูงสุด   | 15 (แต่ละตัวเป็นสำเนาข้อมูลเต็ม) | 15 (storage volume ที่แชร์)                              |
| Replica lag       | อาจเป็นวินาที                 | โดยทั่วไป <100ms                                           |
| Storage           | จัดสรรแบบตายตัว               | scale อัตโนมัติถึง 128 TiB (256 TiB ใน versions ล่าสุด)    |
| Failover time     | 60-120 วินาที                 | <30 วินาที                                                 |
| ตัวเลือก Serverless | จำกัด                        | Aurora Serverless v2                                       |
| เหมาะที่สุดสำหรับ | Workloads ที่เสถียร คาดเดาได้ | Traffic ผันแปร, read volume สูง, ต้องการ failover รวดเร็ว  |

**เหนือกว่า Relational: ตระกูล Purpose-Built**

บทที่ 9 แนะนำ DocumentDB (MongoDB-compatible documents), Neptune (graph relationships) และ Keyspaces (Cassandra-compatible wide-column) และบทที่ 10 แนะนำ MemoryDB (durable Redis-compatible primary database) อีกสองชื่อทำให้ตระกูลสมบูรณ์ — คุณไม่ต้องรู้ลึกเกี่ยวกับพวกมัน แค่สามารถจดจำว่ารูปทรงข้อมูลใดชี้ไปยัง engine ใด เพราะพวกมันปรากฏเป็นตัวเลือกคำตอบอย่างต่อเนื่อง:

- **Amazon Timestream**: ข้อมูล **time-series** — sensor readings, metrics, telemetry สัญญาณข้อสอบ: "IoT measurements over time" (ในโลกจริง offering ปัจจุบันคือ Timestream for InfluxDB; flavor "LiveAnalytics" ดั้งเดิมปิดรับลูกค้าใหม่ในปี 2025)
- **Amazon QLDB**: คุณอาจยังพบมันในคำถามเก่าๆ ในฐานะ "immutable, cryptographically verifiable ledger" AWS ยกเลิก QLDB ในปี 2025 (แนะนำ Aurora PostgreSQL แทน) — ปฏิบัติต่อมันเป็น legacy distractor ไม่ใช่ building block

กฎที่ควรค่าแก่การเขียนบน whiteboard: **relational rows → RDS/Aurora; key-value at scale → DynamoDB; documents → DocumentDB; relationships → Neptune; time → Timestream; Cassandra → Keyspaces; durable Redis → MemoryDB** จับคู่รูปทรง แล้วคำถามจะตอบตัวเอง

## จุดแข็งและข้อจำกัด

**จุดแข็งของ Aurora**:

- Failover เร็วกว่า standard RDS อย่างมีนัยสำคัญ
- สูงสุด 15 read replicas ที่มี lag น้อยมาก
- Auto-scaling storage
- Serverless v2 สำหรับ workloads ที่ผันแปร
- Global Database สำหรับ multi-region deployment

**ข้อจำกัดของ Aurora**:

- ต้นทุนสูงกว่าสำหรับ workloads เล็กที่เสถียร
- I/O pricing อาจมีนัยสำคัญสำหรับ write-heavy workloads (ใช้ I/O-Optimized สำหรับกรณีนี้)
- ความแตกต่างเล็กน้อยในความเข้ากันได้กับ MySQL/PostgreSQL อาจต้องการการเปลี่ยน code
- การ resume ของ Serverless v2 จาก auto-pause (~15 วินาที) และการ scale-up อย่างรวดเร็วอาจทำให้เกิด latency spikes

## สรุป

งาน S3 lifecycle ในบทที่ 23 ลดต้นทุนโดยย้ายข้อมูลไปยัง storage tier ที่ถูกต้อง Aurora ทำสิ่งที่เทียบเท่าสำหรับ compute: แทนที่จะจัดสรรสำหรับ peak load และจ่ายตลอดเวลา Serverless v2 scale เพื่อให้ตรงกับอุปสงค์

- **Read replicas** กระจาย read traffic จาก primary Asynchronous replication — lag เล็กน้อยยอมรับได้สำหรับการอ่านส่วนใหญ่ route การอ่านที่ต้องการ write consistency (การอ่านทันทีหลังการเขียน, การอ่านจาก admin interface) ไปยัง primary ไม่ใช่ replica
- **Aurora** คิดใหม่เกี่ยวกับ storage layer: แบบกระจาย แชร์ข้าม replicas auto-scaling
- Aurora เสนอ: 15 read replicas, replica lag <100ms, failover <30s, auto-scaling storage สูงสุด 128 TiB (256 TiB ใน versions ล่าสุด)
- **Performance Insights**: ระบุ SQL queries เฉพาะที่ทำให้เกิด database load ก่อนตัดสินใจว่าจะ scale อย่างไร index ที่ขาดสามารถขจัดความจำเป็นในการมี instance ที่ใหญ่กว่า
- **CloudWatch database metrics**: DatabaseConnections (ใกล้อิ่มตัวหมายถึง application connection pooling พัง), CPUUtilization (CPU สูงต่อเนื่องหมายถึง queries ที่แพง), ReadLatency (การเสื่อมถอยตามเวลามักเป็นตารางที่เติบโตพร้อม index ที่ขาด)
- **Aurora Serverless v2**: auto-scale compute ในส่วนเพิ่ม 0.5 ACUs คิดต่อ ACU-hour ถูกกว่า provisioned instances อย่างมีนัยสำคัญสำหรับ workloads ที่มีความผันแปรสูงระหว่าง peak และ off-peak
- **Point-in-time recovery (PITR)**: restore Aurora cluster ไปยังวินาทีใดก็ได้ภายใน backup retention window — เข้า cluster *ใหม่* ดังนั้น production ยังคงทำงานในขณะที่คุณคัดลอก rows ที่หายกลับอย่างแม่นยำ
- **Fast database cloning**: copy-on-write clone ของ cluster ในไม่กี่นาทีโดยไม่คำนึงถึงขนาด ถูก แยกตัว — ใช้มันเพื่อทดสอบ migrations กับ production data ก่อนพวกมันทำงานใน production
- **Aurora Backtrack** (MySQL-compatible เท่านั้น — ไม่ใช่ PostgreSQL): rewind cluster ในที่ไปยังจุดเวลาโดยไม่ restore จาก backup มีให้สำหรับ windows สูงถึง 72 ชั่วโมง ต้องการ `rds:BacktrackDBCluster` IAM permission — จำกัดเฉพาะ operations team
- **Aurora Global Database**: primary ใน region เดียว, read replicas ในสูงสุดห้า regions
- **Read replica promotion**: cross-region read replicas สามารถถูก promote เป็น standalone primaries สำหรับ regional DR ชั่งน้ำหนักประโยชน์ DR กับต้นทุนของการรัน instance เต็มตัวที่สอง
- เลือก RDS สำหรับ workloads ที่เล็กกว่า เสถียร คาดเดาได้ เลือก Aurora เมื่อคุณต้องการ scale, failover รวดเร็ว หรือการจัดการ traffic ที่ผันแปร

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- **Aurora replica vs RDS read replica**: Aurora replicas แชร์ storage (lag ใกล้ศูนย์, failover <30s) RDS read replicas replicate ข้อมูล (อาจมี lag, นาทีสำหรับ failover)
- **Aurora Serverless v2**: "auto-scale database capacity," "unpredictable or spiky database traffic" → Aurora Serverless v2 ข้อควรระวัง: ในอดีต มีเพียง Serverless **v1** ที่ scale ถึงศูนย์; ขั้นต่ำของ v2 คือ 0.5 ACU จนถึงปลายปี 2024 เมื่อ v2 ได้รับ auto-pause ถึง 0 ACUs คำถามข้อสอบเก่าอาจยังสันนิษฐานว่า v2 scale ถึงศูนย์ไม่ได้
- **Aurora Global Database**: "multi-region database," "read from EU with low latency from US primary," "RTO < 1 minute for regional failover" → Aurora Global Database
- **Failover timing**: Aurora < 30 วินาที RDS Multi-AZ 60-120 วินาที รู้ทั้งคู่
- **Purpose-built databases ตามรูปทรงข้อมูล**: "social graph / recommendations / fraud rings" → Neptune "MongoDB" → DocumentDB "Cassandra" → Keyspaces "time series / IoT telemetry" → Timestream "Redis-compatible *primary* database (durable)" → MemoryDB (เทียบกับ ElastiCache = cache) "Immutable cryptographic ledger" → QLDB ในคำถามเก่า (ยกเลิกในปี 2025)
- **Aurora I/O-Optimized**: ค่า storage และ instance สูงกว่า ไม่คิดค่าต่อ I/O ใช้เมื่อค่า I/O ครอบงำ (write-heavy) Aurora มาตรฐาน: ค่า storage ต่ำกว่า จ่ายต่อ I/O ใช้สำหรับ read-heavy
- **Aurora Backtrack**: rewind ฐานข้อมูลในที่ไปยังจุดเวลาเฉพาะโดยไม่ restore จาก backup snapshot มีให้สำหรับ MySQL-compatible Aurora เท่านั้น — สำหรับ Aurora PostgreSQL คำตอบคือ point-in-time restore (ไปยัง cluster ใหม่) หรือ fast clone สัญญาณข้อสอบ: "ลบข้อมูลโดยบังเอิญ ต้องกู้คืนอย่างรวดเร็วโดยไม่ restore full backup" + MySQL → Backtrack
- **Aurora fast database cloning**: copy-on-write clone ในไม่กี่นาที โดยไม่คำนึงถึงขนาดฐานข้อมูล สัญญาณข้อสอบ: "ทดสอบกับสำเนาของ production data อย่างรวดเร็วและถูก" → clone ไม่ใช่ snapshot-restore

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — ทบทวน**

อธิบายความแตกต่างระหว่าง Aurora และ standard RDS read replicas ทำไม replication lag ของ Aurora จึงต่ำกว่าโดยทั่วไป?

*(คำใบ้: ความแตกต่างหลักคือ shared storage เทียบกับ data replication ลองคิดว่าแต่ละ replica ต้องทำอะไรเมื่อมีการเขียนเข้ามา)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: ฐานข้อมูล MySQL ของแพลตฟอร์ม social media กำลังประสบ read latency สูงเนื่องจาก traffic ที่เพิ่มขึ้น แอปพลิเคชันเป็น read-heavy (อ่าน 95%, เขียน 5%) ทีมต้องการให้ read latency คงที่ แม้ในระหว่าง traffic spikes พวกเขาต้องการ automatic failover ที่มี downtime น้อยที่สุด (เป้าหมาย RTO < 30 วินาที) ปริมาณข้อมูลกำลังเติบโตอย่างคาดเดาไม่ได้

โซลูชันฐานข้อมูลใดตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) RDS MySQL Multi-AZ พร้อม read replicas ห้าตัว  
B) Aurora MySQL พร้อม Aurora Replicas และ Aurora Serverless v2  
C) RDS MySQL พร้อม instance type ที่ใหญ่กว่า (vertical scaling)  
D) DynamoDB พร้อม DynamoDB DAX สำหรับ read caching

**คำใบ้ 1**: "RTO < 30 วินาที" — service ใดบรรลุสิ่งนี้? ตรวจสอบ failover timing สำหรับแต่ละตัวเลือก

**คำใบ้ 2**: "read latency คงที่ระหว่าง spikes" — replicas ของ service ใดมี lag ใกล้ศูนย์เทียบกับ lag ที่อาจเป็นวินาที?

**คำใบ้ 3**: "ปริมาณข้อมูลที่เติบโตอย่างคาดเดาไม่ได้" — service ใด auto-scale storage?

**คำตอบ**: B

**คำอธิบาย**: Aurora MySQL พร้อม Aurora Replicas ให้ replication lag ใกล้ศูนย์ (มิลลิวินาที ไม่ใช่วินาที) สำหรับ read performance ที่คงที่ภายใต้โหลด Aurora Serverless v2 auto-scale compute ในระหว่าง traffic spikes โดยไม่ over-provisioning Aurora storage auto-scale เมื่อข้อมูลเติบโต Aurora failover (การ promote ของ replica) เสร็จในเวลาต่ำกว่า 30 วินาที — ตอบสนองความต้องการ RTO

**ทำไมไม่ใช่ A?** RDS Multi-AZ failover ใช้เวลา 60-120 วินาที — ไม่ตอบสนอง RTO < 30 วินาที standard RDS read replica lag อาจถึงวินาทีภายใต้โหลด — "read latency ที่คงที่" ยากที่จะรับประกัน

**ทำไมไม่ใช่ C?** Vertical scaling (instance ที่ใหญ่กว่า) เพิ่ม capacity แต่ไม่กระจาย read load ฐานข้อมูลยังคงเป็น single point of failure สำหรับการอ่าน

**ทำไมไม่ใช่ D?** DynamoDB เป็น NoSQL การ migrate จาก MySQL ไป DynamoDB ต้องการการ rearchitect data model และ application queries ซึ่งเกินขอบเขตของงานปรับปรุง performance นี้มาก

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus กำลังออกแบบการขยายตัวระดับโลก พวกเขาต้องการให้พันธมิตรร้านอาหารบน East Coast, ในเยอรมนี และในออสเตรเลียเห็นข้อมูลออร์เดอร์ของตัวเองอย่างรวดเร็ว โดยไม่มี cross-region latency อย่างไรก็ตาม การเขียนทั้งหมดต้องผ่าน us-west-2 primary เดียวเพื่อรักษา consistency

ออกแบบสถาปัตยกรรมฐานข้อมูลโดยใช้ Aurora คุณจะจัดโครงสร้าง Global Database อย่างไร — ตัวอย่างเช่น secondary clusters ใน us-east-1, eu-central-1 และ ap-southeast-2? เกิดอะไรขึ้นถ้า us-west-2 primary ล่ม? คุณจะจัดการกระบวนการ promotion อย่างไร?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกออกแบบฐานข้อมูล multi-region)*

## ฉากหลังเครดิต

Leo migrate ไป Aurora พร้อม Serverless v2

spike วันศุกร์มาและผ่านไป CPU ไม่เคยเกิน 60% Query latency คงที่ Aurora scale ขึ้นเพื่อจัดการโหลดโดยอัตโนมัติ จากนั้น scale กลับลงหลังเร่งด่วน

"นี่มีค่าใช้จ่ายเท่าไรเทียบกับวันศุกร์ที่แล้ว?" Tom ถามในเช้าวันจันทร์

Leo เปิด billing explorer "วันศุกร์เฉลี่ยประมาณ $2.16/ชั่วโมงตลอด peak ตอนเย็น เช้าวันเสาร์คือ $0.24/ชั่วโมง"

Tom ไม่พูดอะไร

"การตั้งค่าเก่าคงที่ที่ $0.47/ชั่วโมงโดยไม่คำนึงถึงโหลด" Leo เสริม

"ดังนั้นเราจ่ายมากกว่าในระหว่าง spike กว่าก่อน" Tom พูด

"ใช่ แต่น้อยกว่ามากในระหว่าง off-peak ต้นทุนสุทธิตลอดสัปดาห์ต่ำกว่า"

Tom คำนวณ จากนั้นพยักหน้า

"มีบทเรียนที่นี่" เขาพูด "คำถามที่ถูกต้องไม่ใช่ 'นี่ถูกกว่าไหม?' แต่คือ 'นี่ถูกกว่าสำหรับรูปแบบการใช้งานจริงของเราไหม?'"

"นั่น" Priya พูดจากอีกฟากของห้อง "คือสัญชาตญาณของวิศวกร senior"

Tom ดูตื่นตกใจเล็กน้อยที่ถูกอธิบายในแบบนั้น

ในบทต่อไป: เมื่อเครือข่ายของคุณคือคอขวด และทำไมทางด่วนส่วนตัวอาจคุ้มกับค่าผ่านทาง
