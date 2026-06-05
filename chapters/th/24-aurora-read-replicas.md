# บทที่ 24: ฐานข้อมูลที่เติบโตไปพร้อมกับคุณ

Tom พบสิ่งที่ไม่คาดคิดจากการตรวจสอบต้นทุนในชั้นฐานข้อมูล

Nimbus ใช้งาน RDS PostgreSQL แบบ Multi-AZ บน instance ขนาด db.r6g.large คิดเป็น $340 ต่อเดือน

"ดูเหมือนแพงมาก" Tom พูด "แต่ผมไม่แน่ใจว่าจะเปรียบเทียบกับอะไร"

Leo ดึงข้อมูล performance metric ขึ้นมา CPU ของฐานข้อมูลพุ่งสูงถึง 85% ในช่วงเร่งด่วนของวันศุกร์ตอนเย็น query สำหรับอ่านข้อมูลเริ่มคั่งค้าง ค่า P95 ของ query latency เพิ่มขึ้นเป็นสองเท่าในช่วงหกเดือนที่ผ่านมา

"ฐานข้อมูลคือคอขวด" เขาพูด "ปริมาณการใช้งานเพิ่มขึ้น แต่ฐานข้อมูลไม่ได้ขยายตามไปด้วย"

"เราแค่อัปเกรด instance ให้ใหญ่ขึ้นได้ไหม?" Maya ถาม

"ได้" Leo พูด "นั่นคือ vertical scaling เราย้ายจาก r6g.large ไปเป็น r6g.xlarge ได้ CPU และ memory มากขึ้น ค่าใช้จ่ายจะเพิ่มขึ้นและซื้อเวลาให้เราได้"

"แต่มันไม่แก้ปัญหาพื้นฐาน" Priya พูด "สุดท้ายเราจะชนขีดจำกัดของ instance ที่ใหญ่ที่สุดและต้องหาแนวทางอื่น"

"มีสองแนวทาง" Leo พูด "Read replicas หรือ Aurora"

"ต่างกันยังไง?"

คำถามที่ดีมาก ที่เหลือของบทนี้คือคำตอบ

ลองนึกภาพห้องสมุดที่ยุ่งมาก มีบรรณารักษ์คนเดียวที่ทั้งรับคืนหนังสือและตอบคำถามผู้ใช้ เมื่อห้องสมุดมีคนมาใช้บริการมากขึ้น คิวก็ยาวขึ้น ทางออก: จ้างบรรณารักษ์เพิ่ม แต่ให้ทำหน้าที่ตอบคำถามเท่านั้น การรับคืนหนังสือยังคงผ่านเคาน์เตอร์เดิม นั่นคือ read replica: ความสามารถส่วนเพิ่มที่รองรับการอ่าน ขณะที่การเขียนทั้งหมดยังคงผ่านแหล่งข้อมูลหลักเพียงที่เดียว Aurora ก้าวไปอีกขั้น โดยออกแบบระบบจัดเก็บหนังสือใหม่ทั้งหมด เพื่อให้บรรณารักษ์ทุกคนแชร์ชั้นวางเดียวกันและเห็นหนังสือเล่มเดียวกันเสมอ โดยไม่มีความล่าช้า

**Read Replicas: การกระจาย Read Traffic**

แอปพลิเคชันเว็บส่วนใหญ่อ่านข้อมูลบ่อยกว่าเขียนมาก ลูกค้าที่ดูรายการอาหารสร้าง SELECT query หลายสิบครั้ง การสั่งอาหารสร้าง INSERT/UPDATE query เพียงไม่กี่ครั้ง อัตราส่วนโดยทั่วไปคือ 10:1 หรือมากกว่า

**Read replica** คือ RDS instance เพิ่มเติมที่รับสำเนาของการเขียนทั้งหมดจาก primary และทำให้ข้อมูลเหล่านั้นพร้อมใช้งานสำหรับ SELECT query

วิธีการทำงาน:

1. การเขียนของแอปพลิเคชัน (INSERT, UPDATE, DELETE) ไปที่ฐานข้อมูล primary
2. Primary replicates การเปลี่ยนแปลงเหล่านั้นแบบ asynchronous ไปยัง read replicas
3. การอ่านของแอปพลิเคชัน (SELECT) ถูกกระจายไปยัง read replicas
4. Read replicas แบ่งปันโหลด โดยแต่ละตัวรองรับ read traffic เป็นส่วนๆ

ผลลัพธ์: ฐานข้อมูล primary รองรับเฉพาะการเขียน (และอาจรองรับการอ่านบางส่วน) Read replicas รองรับ read load สำหรับอัตราส่วนการอ่านต่อการเขียนที่ 10:1 การเพิ่ม read replica หนึ่งตัวจะลด load รวมของ primary ลงประมาณครึ่งหนึ่ง

**ข้อจำกัดสำคัญ**: Replication เป็นแบบ **asynchronous** มี replication lag ซึ่งโดยปกติเป็นมิลลิวินาที แต่อาจเป็นวินาทีภายใต้โหลดหนัก การอ่านจาก replica อาจเห็นข้อมูลที่ล่าช้ากว่า primary เล็กน้อย สำหรับการอ่านส่วนใหญ่ (ดูเมนู, ดูประวัติการสั่งอาหาร) นี้เป็นที่ยอมรับได้ สำหรับ "คำสั่งซื้อของฉันผ่านหรือยัง?" — อ่านจาก primary

**Read Replicas: รายละเอียด**

- สามารถมี read replicas ได้สูงสุด 5 ตัวต่อ RDS instance primary
- Read replicas สามารถอยู่ใน region เดียวกันหรือ region อื่น (cross-region replicas)
- Read replicas สามารถมี read replicas ของตัวเองได้ (chaining)
- Read replicas มี endpoint แยกต่างหาก — แอปพลิเคชันของคุณต้องส่ง read ไปยัง replica endpoint
- Read replicas สามารถเลื่อนระดับเป็นฐานข้อมูลอิสระได้ (มีประโยชน์สำหรับ DR)

สำหรับ Nimbus Leo เพิ่ม read replica หนึ่งตัว เขาอัปเดตแอปพลิเคชันเป็น:

- Write operations → primary endpoint
- การดูเมนู, ประวัติคำสั่งซื้อ → replica endpoint

CPU บน primary ลดลงจาก 85% เหลือ 41% ในช่วงพีค

Tom ดูค่าใช้จ่าย: read replica ของ instance type เดียวกันมีต้นทุนเท่ากับ primary จาก $340 เป็น $680 ต่อเดือน

"เราเพิ่มต้นทุนเป็นสองเท่าเพื่อลด load ลงประมาณครึ่งหนึ่ง" Tom พูด

"ใช่ แต่ทางเลือกคือการย้ายไปยัง instance type ที่ใหญ่กว่า ซึ่งก็จะเสียเงินมากขึ้นเช่นกันและไม่ได้กระจาย read load"

Tom คำนวณดู เขาพยักหน้าอย่างไม่เต็มใจ

"Aurora คืออะไร?" เขาถาม

**Amazon Aurora: การคิดใหม่เกี่ยวกับ Database Engine**

Aurora คือ relational database engine ที่ AWS พัฒนาขึ้นเอง เข้ากันได้กับ MySQL และ PostgreSQL ถูกออกแบบมาตั้งแต่ต้นสำหรับ workload บนคลาวด์ โดยคิดใหม่เกี่ยวกับวิธีการทำงานของ storage layer ของ relational database

ในการตั้งค่า RDS ทั่วไป (MySQL, PostgreSQL) storage และ compute ถูกผูกไว้ด้วยกันอย่างแน่นหนา database engine จัดการไฟล์ข้อมูล Replication คัดลอกข้อมูลจาก primary ไปยัง replica replica ต้องทำซ้ำทุก write operation

Aurora แยก storage ออกจาก compute ใช้ distributed, fault-tolerant storage layer ที่ replicates ข้อมูลโดยอัตโนมัติในสาม Availability Zone ใน 6 สำเนา compute layer (database instances) อยู่บน storage layer นี้

**สิ่งที่เปลี่ยนไป**:

**Read replicas**: Aurora replicas ไม่จำเป็นต้อง replicate ข้อมูล เพราะแชร์ storage layer เดียวกันอยู่แล้ว ซึ่งหมายความว่า:

- สูงสุด 15 read replicas (เทียบกับ 5 สำหรับ RDS ทั่วไป)
- Replication lag โดยทั่วไปต่ำกว่า 100 มิลลิวินาที (เทียบกับวินาทีสำหรับ RDS ภายใต้โหลด)
- Replicas สามารถเลื่อนระดับเป็น primary ได้ภายในไม่เกิน 30 วินาที (เทียบกับนาทีสำหรับ RDS)

**Failover**: เพราะ replicas แชร์ storage failover จึงเร็วกว่ามาก การเลื่อนระดับไม่เกี่ยวข้องกับการถ่ายโอนข้อมูล เพียงแค่เปลี่ยนทิศทางการเขียน

**Storage**: Aurora ขยาย storage โดยอัตโนมัติในส่วนเพิ่มขนาด 10GB สูงสุดถึง 128TB คุณไม่ต้องจัดสรร storage ล่วงหน้าเลย

**Performance**: Aurora อ้างว่ามี throughput สูงกว่า MySQL มาตรฐาน 5 เท่าและ PostgreSQL มาตรฐาน 3 เท่าสำหรับ instance type ที่เทียบเท่ากัน

**Aurora Pricing: คำถามของ Tom**

"ราคาเท่าไหร่?" Tom ถาม

Aurora pricing ต่างจาก RDS:

**Instance pricing**: คล้ายกับ RDS instance pricing ตามประเภท

**Storage pricing**: $0.10 ต่อ GB ต่อเดือน (คุณจ่ายตามที่จัดเก็บจริง ขยายอัตโนมัติ)

**I/O pricing**: Aurora คิดค่าบริการต่อ I/O request (อ่าน/เขียนไปยัง storage) ซึ่งอาจมีนัยสำคัญสำหรับ workload ที่มีการเขียนหนัก

"เดี๋ยวก่อน" Tom พูด "เราต้องจ่ายค่า I/O แยกต่างหากด้วย?"

"Aurora Serverless v2 และ Aurora I/O-Optimized เปลี่ยน pricing model นี้" Leo พูด "Aurora I/O-Optimized ไม่คิดค่า I/O แต่คิดค่า storage และ instance ที่สูงกว่า ดีกว่าสำหรับ workload ที่มี I/O หนัก"

Tom มองดูความแตกต่าง สำหรับ Nimbus ซึ่งมีการอ่านหนัก (query เมนูเยอะ เขียนน้อย) Aurora I/O-Optimized อาจมีค่าใช้จ่ายสูงกว่า Aurora pricing มาตรฐานอาจเหมาะสมกว่า

นี่คือการตัดสินใจด้านต้นทุนจริงที่วิศวกรอาวุโสต้องทำ: คุณต้องรู้รูปแบบ I/O ของ workload ของคุณเพื่อเลือกให้ถูกต้อง

**Aurora Serverless: การขยายโดยไม่ต้องคิดถึง Instances**

**Aurora Serverless v2** คือการกำหนดค่าที่ขยาย compute capacity โดยอัตโนมัติตาม database load ที่แท้จริง แทนที่จะเลือกขนาด instance ที่แน่นอน (db.r6g.large) คุณกำหนด capacity ขั้นต่ำและสูงสุดในหน่วย Aurora Capacity Units (ACUs)

Aurora Serverless v2:

- ขยายขึ้นในไม่กี่วินาทีเมื่อโหลดเพิ่มขึ้น
- ลดขนาดลงเกือบเป็นศูนย์ในช่วงที่ไม่มีการใช้งาน
- ค่าใช้จ่าย: $0.12 ต่อ ACU-ชั่วโมง (บวกค่า storage และ I/O)

สำหรับ workload ที่มี traffic ผันผวน เช่น spike ของ Nimbus ในวันศุกร์เทียบกับช่วงเงียบของเช้าวันจันทร์ Serverless v2 ลดต้นทุนในช่วง off-peak และรองรับ peak โดยไม่ต้องจัดสรรล่วงหน้า

"ดังนั้นระหว่าง spike วันศุกร์" Leo พูด "Aurora จะขยายขึ้นโดยอัตโนมัติ เช้าวันอาทิตย์ที่เราแทบไม่มี traffic มันจะลดขนาดลงเหลือขั้นต่ำ"

"และเราจ่ายเฉพาะ capacity ที่ใช้งานจริง" Tom พูด

"ถูกต้อง"

Tom มีสีหน้าของคนที่เพิ่งพบสิ่งที่กำลังมองหาอยู่

**Aurora Global Database: Multi-Region Reads**

**Aurora Global Database** ขยาย Aurora ไปยัง AWS region หลายแห่ง:

- **One primary region** รองรับการเขียนทั้งหมด
- **สูงสุดห้า secondary regions** ให้บริการอ่านด้วย replication lag โดยปกติน้อยกว่า 1 วินาที
- Secondary regions สามารถเลื่อนระดับเป็น primary ได้ภายในไม่เกิน 1 นาที (สำหรับสถานการณ์ DR)

สำหรับการขยายตลาดทั่วโลกของ Nimbus Aurora Global Database จะช่วยให้พาร์ทเนอร์ร้านอาหารในลอนดอนสามารถ query เมนูท้องถิ่นจาก EU read replica ได้ ขณะที่คำสั่งซื้อ (การเขียน) ทั้งหมดยังคงผ่าน US primary

**RDS vs Aurora: เมื่อไหรควรเลือกอะไร**

| ปัจจัย            | RDS (PostgreSQL/MySQL)        | Aurora                                                          |
|-------------------|-------------------------------|-----------------------------------------------------------------|
| ต้นทุน            | ต่ำกว่าสำหรับ workload เล็ก   | ฐานสูงกว่า แต่ขยายได้ดีกว่า                                     |
| ความเข้ากันได้    | เต็มรูปแบบ                    | เข้ากันได้กับ MySQL/PostgreSQL (มีความแตกต่างเล็กน้อย)          |
| Replicas สูงสุด   | 5                             | 15                                                              |
| Replica lag       | อาจเป็นวินาที                 | โดยปกติน้อยกว่า 100ms                                           |
| Storage           | จัดสรรแบบตาย                  | ขยายอัตโนมัติสูงสุด 128TB                                       |
| Failover time     | 60-120 วินาที                 | น้อยกว่า 30 วินาที                                              |
| ตัวเลือก Serverless | จำกัด                        | Aurora Serverless v2                                            |
| เหมาะที่สุดสำหรับ | Workload ที่คงที่และคาดเดาได้ | Traffic ผันผวน, read volume สูง, ต้องการ failover รวดเร็ว      |

## จุดแข็งและข้อจำกัด

**จุดแข็งของ Aurora**:

- Failover เร็วกว่า RDS มาตรฐานอย่างมีนัยสำคัญ
- สูงสุด 15 read replicas ที่มี lag น้อยมาก
- Auto-scaling storage
- Serverless v2 สำหรับ workload ที่ผันผวน
- Global Database สำหรับการ deploy หลาย region

**ข้อจำกัดของ Aurora**:

- ต้นทุนสูงกว่าสำหรับ workload ขนาดเล็กที่คงที่
- I/O pricing อาจมีนัยสำคัญสำหรับ workload ที่มีการเขียนหนัก (ใช้ I/O-Optimized สำหรับกรณีนี้)
- ความแตกต่างเล็กน้อยในการเข้ากันได้กับ MySQL/PostgreSQL อาจต้องการการเปลี่ยนแปลงโค้ด
- Serverless v2 cold starts (จากใกล้ศูนย์) อาจทำให้เกิด latency spike

## สรุป

- **Read replicas** กระจาย read traffic จาก primary Replication แบบ asynchronous — lag เล็กน้อยยอมรับได้สำหรับการอ่านส่วนใหญ่
- **Aurora** คิดใหม่เกี่ยวกับ storage layer: แบบกระจาย แชร์ระหว่าง replicas auto-scaling
- Aurora มี: 15 read replicas, replica lag น้อยกว่า 100ms, failover น้อยกว่า 30 วินาที, auto-scaling storage สูงสุด 128TB
- **Aurora Serverless v2**: auto-scales compute capacity ตาม load เหมาะสำหรับ traffic ที่ผันผวน
- **Aurora Global Database**: primary ใน region เดียว, read replicas ในสูงสุดห้า regions
- เลือก RDS สำหรับ workload ขนาดเล็กที่คงที่และคาดเดาได้ เลือก Aurora เมื่อต้องการ scale, failover รวดเร็ว, หรือการจัดการ traffic ที่ผันผวน

## เคล็ดลับสอบ

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- **Aurora replica vs RDS read replica**: Aurora replicas แชร์ storage (lag ใกล้ศูนย์, failover น้อยกว่า 30 วินาที) RDS read replicas replicates ข้อมูล (อาจมี lag, ใช้เวลาเป็นนาทีสำหรับ failover)
- **Aurora Serverless v2**: "auto-scale database capacity", "unpredictable or spiky database traffic", "scale to zero" → Aurora Serverless v2
- **Aurora Global Database**: "multi-region database", "read from EU with low latency from US primary", "RTO < 1 minute for regional failover" → Aurora Global Database
- **Failover timing**: Aurora น้อยกว่า 30 วินาที RDS Multi-AZ 60-120 วินาที รู้ทั้งคู่
- **Aurora I/O-Optimized**: ค่า storage และ instance สูงกว่า ไม่คิดค่า I/O ต่อครั้ง ใช้เมื่อค่า I/O เป็นค่าใช้จ่ายหลัก (เขียนหนัก) Aurora มาตรฐาน: ค่า storage ต่ำกว่า จ่ายต่อ I/O ใช้สำหรับ read-heavy
- **Aurora Backtrack**: ย้อนฐานข้อมูลกลับไปยังจุดเวลาที่ระบุโดยไม่ต้องกู้คืนจาก backup snapshot มีให้ใช้เฉพาะ Aurora ที่เข้ากันได้กับ MySQL เท่านั้น สัญญาณสอบ: "ลบข้อมูลโดยบังเอิญ ต้องการกู้คืนอย่างรวดเร็วโดยไม่ต้องกู้คืน full backup"

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

อธิบายความแตกต่างระหว่าง Aurora และ read replicas ของ RDS มาตรฐาน ทำไม replication lag ของ Aurora จึงต่ำกว่าโดยปกติ?

*(คำใบ้: ความแตกต่างหลักคือ shared storage เทียบกับ data replication ลองคิดว่าแต่ละ replica ต้องทำอะไรเมื่อมีการเขียนเข้ามา)*

**แบบฝึกหัดที่ 2 — ฝึกสอบ**

*สถานการณ์*: ฐานข้อมูล MySQL ของแพลตฟอร์ม social media กำลังประสบปัญหา read latency สูงเนื่องจาก traffic ที่เพิ่มขึ้น แอปพลิเคชันมีการอ่านหนัก (อ่าน 95%, เขียน 5%) ทีมต้องการให้ read latency คงที่แม้ในช่วง traffic spike พวกเขาต้องการ automatic failover ที่มี downtime น้อยที่สุด (เป้าหมาย RTO น้อยกว่า 30 วินาที) ปริมาณข้อมูลกำลังเติบโตอย่างคาดเดาไม่ได้

โซลูชันฐานข้อมูลใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) RDS MySQL Multi-AZ พร้อม read replicas ห้าตัว  
B) Aurora MySQL พร้อม Aurora Replicas และ Aurora Serverless v2  
C) RDS MySQL พร้อม instance type ที่ใหญ่กว่า (vertical scaling)  
D) DynamoDB พร้อม DynamoDB DAX สำหรับ read caching

**คำใบ้ที่ 1**: "RTO น้อยกว่า 30 วินาที" — บริการใดบรรลุเป้าหมายนี้ได้? ตรวจสอบ failover timing ของแต่ละตัวเลือก

**คำใบ้ที่ 2**: "Read latency คงที่ระหว่าง spike" — replicas ของบริการใดมี lag ใกล้ศูนย์เทียบกับ lag ที่อาจเป็นวินาที?

**คำใบ้ที่ 3**: "ปริมาณข้อมูลที่เติบโตอย่างคาดเดาไม่ได้" — บริการใด auto-scales storage?

**คำตอบ**: B

**คำอธิบาย**: Aurora MySQL พร้อม Aurora Replicas ให้ replication lag ใกล้ศูนย์ (มิลลิวินาที ไม่ใช่วินาที) สำหรับ read performance ที่คงที่ภายใต้โหลด Aurora Serverless v2 auto-scales compute ระหว่าง traffic spike โดยไม่ต้องจัดสรรเกิน Aurora storage ขยายอัตโนมัติเมื่อข้อมูลเพิ่มขึ้น Aurora failover (การเลื่อนระดับของ replica) เสร็จสิ้นภายใน 30 วินาที ซึ่งตรงตามข้อกำหนด RTO

**ทำไมไม่ใช่ A?** RDS Multi-AZ failover ใช้เวลา 60-120 วินาที ไม่ตรงตาม RTO น้อยกว่า 30 วินาที RDS read replica lag มาตรฐานอาจถึงวินาทีภายใต้โหลด "read latency ที่คงที่" ยากที่จะรับประกัน

**ทำไมไม่ใช่ C?** Vertical scaling (instance ที่ใหญ่กว่า) เพิ่ม capacity แต่ไม่กระจาย read load ฐานข้อมูลยังคงเป็น single point of failure สำหรับการอ่าน

**ทำไมไม่ใช่ D?** DynamoDB เป็น NoSQL การย้ายจาก MySQL ไปยัง DynamoDB ต้องการการออกแบบ data model และ application queries ใหม่ทั้งหมด ซึ่งเกินขอบเขตของงานปรับปรุง performance นี้มาก

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

Nimbus กำลังออกแบบการขยายตลาดทั่วโลก พวกเขาต้องการให้พาร์ทเนอร์ร้านอาหารบนฝั่งตะวันตก, ในเยอรมนี, และออสเตรเลียสามารถดูข้อมูลคำสั่งซื้อของตัวเองได้อย่างรวดเร็ว โดยไม่มี cross-region latency อย่างไรก็ตาม การเขียนทั้งหมดต้องผ่าน US-East primary เพียงที่เดียวเพื่อรักษาความสอดคล้อง

ออกแบบสถาปัตยกรรมฐานข้อมูลโดยใช้ Aurora คุณจะจัดโครงสร้าง Global Database อย่างไร? จะเกิดอะไรขึ้นถ้า US-East primary ล่ม? คุณจะจัดการกระบวนการเลื่อนระดับอย่างไร?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกออกแบบฐานข้อมูล multi-region)*

## ฉากหลังเครดิต

Leo ย้ายไปใช้ Aurora พร้อม Serverless v2

Spike วันศุกร์มาและผ่านไป CPU ไม่เกิน 60% เลย Query latency คงที่ Aurora ขยายขึ้นเพื่อรองรับโหลดโดยอัตโนมัติ จากนั้นลดขนาดลงหลังจากช่วงเร่งด่วนผ่านไป

"สัปดาห์นี้ค่าใช้จ่ายเป็นเท่าไหร่เทียบกับวันศุกร์ที่แล้ว?" Tom ถามในเช้าวันจันทร์

Leo ดึง billing explorer ขึ้นมา "วันศุกร์พีคที่ $0.89 ต่อชั่วโมง เช้าวันเสาร์ $0.11 ต่อชั่วโมง"

Tom ไม่พูดอะไร

"การตั้งค่าเดิมคงที่ที่ $0.47 ต่อชั่วโมงโดยไม่คำนึงถึงโหลด" Leo เสริม

"ดังนั้นเราจ่ายมากกว่าเดิมในช่วง spike" Tom พูด

"ใช่ แต่น้อยกว่ามากในช่วง off-peak ต้นทุนรวมตลอดสัปดาห์ต่ำกว่า"

Tom คำนวณ จากนั้นพยักหน้า

"มีบทเรียนที่นี่" เขาพูด "คำถามที่ถูกต้องไม่ใช่ 'นี่ถูกกว่าไหม?' แต่คือ 'นี่ถูกกว่าสำหรับรูปแบบการใช้งานจริงของเราไหม?'"

"นั่น" Priya พูดจากอีกฝั่งห้อง "คือสัญชาตญาณของวิศวกรอาวุโส"

Tom ดูตื่นตกใจเล็กน้อยที่ถูกอธิบายในแบบนั้น

ในบทถัดไป: เมื่อเครือข่ายของคุณคือคอขวด และทำไมทางด่วนส่วนตัวอาจคุ้มค่ากับค่าผ่านทาง
