# บทที่ 29: บิลฐานข้อมูล

Tom พิมพ์ CloudWatch metrics ออกมา สิบสี่หน้า เขากระจายมันทั่วโต๊ะก่อนที่จะเชื่อใจตัวเองให้อ่านตัวเลข ดีกว่าที่จะเห็นทุกอย่างพร้อมกันมากกว่าที่จะเจอความประหลาดใจกลางหน้า

**ย้อนความ: Storage เสร็จแล้ว ฐานข้อมูลเป็นรายการถัดไป**

การตรวจสอบ storage เปิดเผยการสูญเสียที่สะสม $6,700 — ไม่ใช่จากการตัดสินใจที่แย่ แต่จากความไม่ใส่ใจ Volumes ที่ไม่ได้แนบ snapshots เก่า version histories ที่ไม่มีใครบอก S3 ให้ทำความสะอาด incomplete multipart uploads ที่สะสมเงียบๆ มาหลายเดือน Tom แก้ไขทั้งหมดแล้ว ตั้ง rules ทำความสะอาดอัตโนมัติ และเลื่อนไปยังแท็บถัดไปใน spreadsheet Data tier เป็นสิ่งที่ไม่รู้ที่ใหญ่ที่สุดที่เหลืออยู่: relational databases, NoSQL tables, cache nodes, backup storage และรายการหนึ่งที่กวนใจเขามาหลายสัปดาห์

รายการ data-tier ที่อยู่ในการทบทวน:

Aurora cluster: $647/เดือน
Legacy RDS PostgreSQL read replicas: $340/เดือน
DynamoDB tables: $340/เดือน
ElastiCache: $185/เดือน
Aurora manual snapshots: $87/เดือน

Data tier รวมที่อยู่ในการทบทวน: $1,599/เดือน

"ขอให้ผมเข้าใจแต่ละอันก่อนที่จะตัดสินใจอะไร" เขาพูด "เพราะฐานข้อมูลไม่ใช่จุดที่ควรประหยัดโดยการลดมาตรฐาน"

นี่เป็นเรื่องฉลาด การกำหนดค่าฐานข้อมูลที่ผิดพลาดซึ่งทำให้สูญเสียข้อมูลหรือประสิทธิภาพลดลงมีค่าใช้จ่ายสูงกว่าการประหยัดที่ได้มามาก

ลองนึกภาพฐานข้อมูลเหมือนเครื่องยนต์ของรถยนต์ คุณสามารถประหยัดเงินในรถยนต์ได้โดยเปลี่ยนไปใช้น้ำมันที่ถูกกว่า ปรับแรงดันยาง และลบน้ำหนักที่ไม่จำเป็นออกจากท้ายรถ แต่ถ้าคุณพยายามประหยัดเงินโดยข้ามการเปลี่ยนน้ำมันเครื่อง คุณเสี่ยงต่อการที่เครื่องยนต์จะยึด — และเครื่องยนต์ที่ยึดมีค่าใช้จ่ายสูงกว่าการประหยัดน้ำมันใดๆ มาก การตรวจสอบที่ Tom กำลังจะทำตามตรรกะเดียวกัน: หาการสูญเสียในท้ายรถและถังน้ำมัน แล้วปล่อยเครื่องยนต์ไว้จนกว่าคุณจะรู้ว่ากำลังทำอะไรอยู่

**เข้าใจ Database Workload ของคุณก่อน**

การ optimize ต้นทุนในฐานข้อมูลต้องเข้าใจ workload ก่อนแตะต้องอะไร Tom เรียนรู้สิ่งนี้จากการเฉียดพลาดเมื่อหกเดือนก่อน: เขาเริ่มลดขนาด database instance ตาม CPU utilization เฉลี่ย — 18% — โดยไม่ดู p95 ก่อน เพื่อนร่วมงานขอให้เขาตรวจสอบ CloudWatch metrics อย่างระมัดระวังมากขึ้น p95 CPU คือ 61% และในช่วง Friday dinner rush ที่หนักเป็นพิเศษ มันแตะ 84%

"ค่าเฉลี่ยไม่บอกคุณว่าเกิดอะไรขึ้นที่ peak" Tom พูดเมื่อเขาเล่าเรื่องนี้ให้ Priya ฟัง "ถ้าผม right-size ตามค่าเฉลี่ย เราคงถูก throttle ในคืนวันศุกร์"

"นั่นคือเหตุผลที่คุณดู p95 ไม่ใช่ค่าเฉลี่ย" Priya พูด "เสมอ"

หลักการนั้นขยายไปเกินกว่า CPU ตอนนี้ Tom มี checklist ก่อนการตรวจสอบมาตรฐาน:

- CPU: p95 ไม่ใช่ค่าเฉลี่ย
- Memory: FreeableMemory (เป็น absolute bytes ไม่ใช่เปอร์เซ็นต์) — เราใกล้ขีดจำกัดแค่ไหน?
- Connections: DatabaseConnections สูงสุดตลอด 30 วันที่ผ่านมา — เราเข้าใกล้ connection limit แค่ไหน?
- อัตราส่วนการอ่าน/เขียน: กำหนดว่า read replicas คุ้มค่าใช้จ่ายหรือไม่
- อัตราการเติบโตของ storage: เราเพิ่มกี่ GB ต่อเดือน?
- Replication lag (สำหรับ replicas): replica ตามทันไหม?

คำถามสำคัญ:

- CPU utilization เฉลี่ยและ peak คือเท่าไหร่?
- อัตราส่วนการอ่าน/เขียนคือเท่าไหร่?
- Storage กำลังเพิ่มขึ้น คงที่ หรือลดลง?
- Read replicas กำลังถูกใช้งานอยู่ไหม?
- Instance under-provisioned (ทำให้ช้าลง) หรือ over-provisioned (จ่ายสำหรับ capacity ที่ไม่ได้ใช้)?

Tom ดึง CloudWatch metrics สำหรับบริการฐานข้อมูลทั้งสามตลอด 30 วันที่ผ่านมา:

**Aurora cluster**:

- CPU เฉลี่ย: 18% (p95: 61%; peak: 84% ในคืนวันศุกร์)
- FreeableMemory: สูงกว่า 4GB จาก 8GB ที่มีอยู่อย่างสม่ำเสมอ ไม่น่ากังวล
- อัตราส่วนการอ่าน/เขียน: 14:1 (อ่านหนัก)
- Storage: 180GB (เพิ่มขึ้นประมาณ 5GB/เดือน)
- DatabaseConnections สูงสุด: 312 จาก 1,000 ที่มีอยู่ สบายๆ

**Read replicas (RDS PostgreSQL แยกต่างหากจาก Aurora)**:

- นี่คือ RDS read replicas เก่าสองอันที่สร้างขึ้นก่อนการย้ายไปยัง Aurora ยังคงทำงานอยู่
- Connections เฉลี่ยต่ออัน: 2 ต่อวัน CPU เฉลี่ย: 3%
- FreeableMemory: 7.2GB จาก 8GB ที่มีอยู่ Instances แทบจะ idle

"ทำไมสิ่งเหล่านี้ยังทำงานอยู่?" Tom ถาม

"ผม deploy พวกมันไปแล้ว — โอ๊ะ" Leo พูด เขาดูวันที่สร้าง instance "พวกมันถูกสร้างไว้สำหรับ fallback ระหว่างการย้ายไปยัง Aurora ผมไม่เคยลบมัน"

ช่วงเวลานั้น — เมื่อของที่มีค่าใช้จ่ายสูงทำงานมาหลายเดือนโดยไม่ได้ใช้งาน — เป็นสิ่งที่พบเห็นบ่อยใน cloud environments Leo สร้าง replicas ไว้เป็น safety net Safety net ไม่เคยถูกต้องการ แต่ไม่มีใครถามคำถามจนกระทั่งตอนนี้

"สถานการณ์ connection pool เป็นอย่างไร?" Priya ถาม โน้มตัวเข้ามา "ก่อนเราลบพวกมัน มี application component ใดยังคง route reads ไปที่นั่นไหม?"

Tom ตรวจสอบ connection logs สอง connections ต่อวันมาจาก monitoring script ที่ Priya เขียนไว้เมื่อสิบสี่เดือนก่อน — มัน poll ทุก database endpoint ที่รู้จักเพื่อตรวจสอบว่าพวกมันตอบสนอง Replicas ถูก query เฉพาะโดย health checker ไม่ใช่โดย application traffic จริงใดๆ

"ลบพวกมัน" Maya พูด

Replicas ถูกยุติ ประหยัดต่อเดือน: $340

**การเฉียดพลาดเรื่อง Connection Pool**

ขณะที่เขามี connection metrics เปิดอยู่ Tom รันการตรวจสอบที่กว้างขึ้นทั่วทุก database endpoints สิ่งที่เขาพบทำให้เขาหยุด

Aurora writer endpoint แสดง DatabaseConnections สูงสุด 312 สบายๆ แต่ reader endpoint เล่าเรื่องที่ต่างออกไป

"Reader endpoint แตะ 847 connections ในสามคืนวันศุกร์ติดต่อกัน" Tom พูด

"ขีดจำกัดเท่าไหร่?" Priya ถาม

"ขีดจำกัดสำหรับ instance class ปัจจุบันของเราคือ 1,000 เราไปถึง 847 นั่นคือ 85% ของขีดจำกัด"

"และเราไม่สังเกตเพราะเราไม่ได้ตั้งสัญญาณเตือนจนถึง 90%?" Maya ถาม

"เราไม่ได้ตั้งสัญญาณเตือนเลย" Tom พูด "ไม่มี CloudWatch alarm บน reader endpoint connections ผมพบสิ่งนี้เพราะผมกำลังดู raw metrics เท่านั้น"

ที่ 1,000 connections ฐานข้อมูลปฏิเสธ connections ใหม่ Application thread ใดๆ ที่พยายามได้ database connection ในขณะนั้นจะ throw exception ถ้า exception นั้นไม่ถูกจัดการอย่างสง่างาม ผู้ใช้จะเห็น error 500

"เราอยู่ห่างจาก Friday-night incident แค่สามสิบวินาที" Leo พูด "สามครั้งติดต่อกัน"

"เราคิดถึงสิ่งที่จะเกิดขึ้นเมื่อ threshold นั้นถูกข้ามไหม?" Priya ถาม

"พาร์ทเนอร์ร้านอาหารเห็นคำสั่งซื้อล้มเหลวในช่วง dinner rush" Maya พูด "นั่นไม่ใช่ความกังวลเชิงทฤษฎี"

Tom ตั้ง CloudWatch alarm ทันที: แจ้งเตือนที่ 750 connections (75% ของขีดจำกัด) page ที่ 900 (90%) เขายัง implement RDS Proxy สำหรับ reader endpoint — RDS Proxy pool และจัดการ database connections จาก application layer หมายความว่าห้าสิบ application threads สามารถแชร์สิบ database connections Proxy จัดการ multiplexing ฐานข้อมูลเห็น connections น้อยกว่ามากแม้เมื่อแอปพลิเคชันอยู่ภายใต้โหลดหนัก

"สำหรับ Aurora Serverless v2 RDS Proxy คิดราคาที่ $0.015 ต่อ ACU ต่อชั่วโมง ด้วยค่าใช้จ่ายขั้นต่ำ 8 ACUs ต่อ proxy" Tom พูด "แต่ถ้า connection limit breach ทำให้เกิด partial outage แม้แต่ครั้งเดียวในคืนวันศุกร์ ต้นทุนชื่อเสียงของ Nimbus สูงกว่าหลายเท่า"

"มันมีค่าใช้จ่ายต่อเดือนเท่าไหร่?" Tom ถามตัวเอง รันตัวเลข Reader ของพวกเขารันบน Serverless v2 ดังนั้น proxy คิดเงินตามขั้นต่ำ 8 ACU: $0.015 × 8 × 730 = $87.60/เดือน นั่นคือค่าใช้จ่ายที่เขายินดีจ่าย

คุณอาจสงสัยว่า: ถ้าเราประหยัดเงินด้วย auto-scaling ของ Serverless v2 อยู่แล้ว ทำไมต้องสนใจ Reserved Instances สำหรับ provisioned tier? คำตอบคือ scaling ของ Serverless v2 มีต้นทุน — คุณจ่ายต่อ ACU-ชั่วโมงไม่ว่าคุณจะวางแผนไว้หรือไม่ สำหรับทีมที่รัน Aurora configurations แบบ fixed ข้อผูกมัด RI แปลงต้นทุนผันแปรเป็นต้นทุนที่คาดเดาได้ สำหรับทีมที่รัน provisioned instances (ไม่ใช่ Serverless v2) ความแตกต่างนั้นสำคัญอย่างมาก

**RDS Reserved Instances: สำหรับ Provisioned Database Tiers**

เช่นเดียวกับ EC2 RDS เสนอ Reserved Instances สำหรับการใช้งานที่ให้สัญญา

สำหรับทีมที่ใช้ Aurora instance configurations แบบ fixed (ไม่ใช่ Serverless v2) Reserved Instances สามารถประหยัดได้ 30-60% นี่คือวิธีที่แนวทาง provisioned RI ทำงาน: คุณให้สัญญากับ instance type เฉพาะเป็นเวลา 1 หรือ 3 ปีเพื่อแลกกับส่วนลดที่มีนัยสำคัญบนอัตรารายชั่วโมง

เพื่อเป็นตัวอย่าง: db.r6g.large writer instance ที่ $0.26/ชั่วโมง On-Demand เป็น $190/เดือน 1-year Reserved Instance สำหรับตัวเดียวกันลดเหลือประมาณ $108/เดือน — ประหยัด $82/เดือนต่อ instance หรือเกือบ $1,000 ต่อปีต่อ database instance

**Aurora Serverless v2 vs Standard RI — จุดคุ้มทุน**

Tom รันตัวเลขสำหรับ Aurora configuration เฉพาะของพวกเขา คำถาม: auto-scaling ของ Aurora Serverless v2 ให้ประโยชน์เพียงพอหรือไม่ หรือ fixed provisioned instance พร้อมข้อผูกมัด Reserved Instance จะถูกกว่า?

Serverless v2 pricing: $0.12 ต่อ ACU-ชั่วโมง Cluster ของพวกเขาขยายระหว่าง 0.5 ACU (idle) และ 16 ACU (peak load) ตลอด 30 วันที่ผ่านมา ค่าเฉลี่ยคือ 4.2 ACU

ค่า Serverless v2 รายเดือน: 4.2 ACU × $0.12 × 730 ชั่วโมง = $368/เดือนสำหรับ writer

เปรียบเทียบ: fixed db.r6g.2xlarge (เทียบเท่า provisioned ที่ประมาณการ ปรับขนาดเพื่อรองรับ p95 load) พร้อม 1-year RI: $0.48/ชั่วโมง × 0.60 (RI discount) × 730 = $210/เดือน

"RI ถูกกว่า" Leo พูด

"สำหรับ load ที่ fixed ใช่" Tom พูด "แต่ดูที่ช่วงกระจาย ช่วง traffic ต่ำของเรา — ตี 2 ถึง 7 โมงเช้า วันจันทร์ถึงพฤหัส — เฉลี่ย 0.8 ACU บน fixed provisioned instance เราจะจ่ายสำหรับ 8 เท่าของที่เราใช้ในช่วงเวลาเหล่านั้น แค่ idle อยู่เฉยๆ"

"และ Serverless v2 ลดขนาดลงให้ตรงกัน?"

"ถึง 0.5 ACU ต้นทุน idle เป็นเศษเสี้ยวของที่เราจะจ่ายสำหรับ provisioned instance ที่ปรับขนาดสำหรับ peak"

การคำนวณจุดคุ้มทุน: Serverless v2 ถูกกว่าเมื่ออัตราส่วน peak/baseline ของคุณสูงกว่าราว 4:1 สำหรับ Nimbus ที่มี Friday peaks ที่ 16 ACU และ Monday-morning ต่ำสุดที่ 0.8 ACU — อัตราส่วน 20:1 — Serverless v2 คือตัวเลือกที่ถูกต้อง ถ้า traffic ของพวกเขาสม่ำเสมอกว่า (สมมติ 8 ACU ± 20%) provisioned RI จะถูกกว่า

"มันไม่ใช่แค่เรื่องว่าตัวเลขไหนเล็กกว่าในเดือนนี้" Tom พูด "มันคือเรื่องว่า model ไหนจัดการการเติบโตของเราได้ถูกต้อง ถ้าเราโต 50% ไตรมาสหน้า Serverless v2 ก็แค่ขยายขึ้น Provisioned RI จะต้องปรับขนาดใหม่ และเราจะจ่ายสำหรับ headroom ที่ไม่ได้ใช้ในช่วงเปลี่ยนผ่าน"

Tom แมปการเปรียบเทียบตลอดปีอย่างชัดเจนเพื่อให้ทีมตามเหตุผลได้ ไม่ใช่แค่ข้อสรุป

**ค่า Aurora เดือนต่อเดือน: Serverless v2 vs provisioned RI**

ตัวเลือก provisioned: db.r6g.2xlarge พร้อม 1-year Reserved Instance ค่าใช้จ่าย: $0.48/ชั่วโมง On-Demand × 0.60 (RI discount) × 730 ชั่วโมง = $210/เดือน คงที่ ไม่ว่า load จะเป็นเท่าไหร่

ตัวเลือก Serverless v2: จ่ายต่อ ACU-ชั่วโมงที่ $0.12 ผันแปร ติดตาม load จริง

Tom ดึง 30 วันของ Aurora Serverless v2 ACU metrics จาก CloudWatch และสร้าง distribution:

- ตี 2–7 โมงเช้า วันจันทร์–พฤหัส (traffic ต่ำ): เฉลี่ย 0.8 ACU → $0.096/ชั่วโมง
- 7–11 โมงเช้า วันทำการ (ปานกลาง): เฉลี่ย 3.2 ACU → $0.384/ชั่วโมง  
- 11 โมงเช้า–3 ทุ่ม วันทำการ (peak business hours): เฉลี่ย 5.8 ACU → $0.696/ชั่วโมง
- วันศุกร์ 6 โมงเย็น–4 ทุ่ม (dinner rush): เฉลี่ย 14.1 ACU → $1.692/ชั่วโมง
- วันเสาร์เที่ยง–2 ทุ่ม (สุดสัปดาห์ที่ยุ่ง): เฉลี่ย 9.3 ACU → $1.116/ชั่วโมง
- วันอาทิตย์ (วันที่เบาที่สุด): เฉลี่ย 2.1 ACU → $0.252/ชั่วโมง

ค่าเฉลี่ยถ่วงน้ำหนักทั้งเดือน: 4.2 ACU → $0.504/ชั่วโมง → $368/เดือน

บน provisioned RI: $210/เดือน Serverless: $368/เดือน ตัวเลือก provisioned ประหยัด $158/เดือน

"นั่นดูชัดเจน" Leo พูด "ทำไมเราถึงอยู่บน Serverless?"

"เพราะ $368 คือค่าเฉลี่ย" Tom พูด "ดูที่คืนวันศุกร์"

วันศุกร์ 6 โมงเย็น–4 ทุ่ม: เฉลี่ย 14.1 ACU สำหรับช่วงสี่ชั่วโมงนั้น Serverless มีค่าใช้จ่าย $1.692/ชั่วโมง provisioned db.r6g.2xlarge ที่ $210/เดือน — capacity สูงสุดของมัน — คือ 8 vCPUs Serverless cluster รันเทียบเท่าราว 16 vCPUs ในช่วงนั้น

"provisioned instance ที่ปรับขนาดสำหรับ Friday peak ของเราจะเป็น db.r6g.4xlarge" Tom พูด "ที่อัตรา RI นั่นคือ $0.96/ชั่วโมง × 0.60 = $0.576/ชั่วโมง รายเดือน: $420/เดือน"

"นั่นมากกว่าค่าเฉลี่ย Serverless $368" Maya พูด

"ถูกต้อง และถ้าเราปรับขนาด provisioned instance สำหรับ weekday baseline — db.r6g.2xlarge — คืนวันศุกร์จะเป็นปัญหา ที่ peak load เราจะดัน 14 ACU เทียบเท่าบน instance 8-vCPU นั่นคือ CPU saturation"

"ดังนั้นคุณต้องปรับขนาดล่วงหน้าสำหรับ peak" Priya พูด

"ด้วยต้นทุนของการจ่ายสำหรับ idle capacity อีก 160 ชั่วโมงของสัปดาห์" Tom พูด "คณิตศาสตร์ provisioned RI ที่ออกมาถูกกว่าใช้ได้เฉพาะเมื่ออัตราส่วน peak/baseline ของคุณต่ำ ของเราคือ 20:1 นั่นคือสถานการณ์ที่ Serverless v2 ถูกออกแบบมาพอดี"

เขาแสดงตัวเลขเคียงข้างกัน:

| ตัวเลือก | เดือนเฉลี่ย | คืนเงียบ (ตี 2) | Friday rush (2 ทุ่ม) |
|---|---|---|---|
| Serverless v2 | $368 | $0.096/ชม. | $1.692/ชม. |
| Provisioned RI (r6g.2xl) | $210 | $210/730ชม. = $0.288/ชม. | จำกัด — เสี่ยง saturation |
| Provisioned RI (r6g.4xl) | $420 | $0.576/ชม. | headroom สบาย |

"ตัวเลือก Serverless คือ $368" Tom พูด "ตัวเลือก provisioned ที่ปรับขนาดถูกต้องคือ $420 — และนั่นยังไม่นับต้นทุนการดำเนินงานของการตรวจสอบและการ scale provisioned instance ด้วยมือเมื่อรูปแบบ traffic ของเราเปลี่ยนไตรมาสหน้า"

"และต้นทุนการดำเนินงาน" Priya พูด "ไม่ใช่ศูนย์"

"ไม่ ด้วย Serverless เราไม่ต้องคิดเรื่อง instance sizing Aurora จัดการมัน ด้วย provisioned ทุกไตรมาสผมต้องประเมินใหม่ว่า instance class ปัจจุบันยังเหมาะกับ traffic ของเราไหม นั่นไม่แพงในแง่เวลา แต่มันคือสิ่งที่อาจผิดพลาดได้ถ้าเราหยุดใส่ใจ"

"มันจะโอเคตราบใดที่เราไม่ลืม resize มัน" Leo พูด แล้วจับได้ตัวเอง "ซึ่งเป็นตอนที่มันจะไม่โอเคพอดี"

"ใช่เลย" Tom พูด

ข้อสรุปยืนยัน: Serverless v2 ที่ $368/เดือนคือตัวเลือกที่ถูกต้องสำหรับอัตราส่วน peak/baseline 20:1 ของ Nimbus และความชอบของทีมในความเรียบง่ายด้านการดำเนินงาน Provisioned RI น่าสนใจเฉพาะสำหรับทีมที่มี traffic ที่ไม่ผันแปรอย่างมีนัยสำคัญ — อัตราส่วน 2:1 หรือ 3:1 ที่ provisioned instance แทบไม่เคย idle

"อะไรจะทำให้เราสลับไป provisioned?" Maya ถาม

"ถ้ารูปแบบ traffic ของเราราบเรียบลง" Tom พูด "ถ้า Nimbus โตถึงจุดที่ low-traffic baseline ก็สูงด้วย — สมมติ 8 ACU ตอนตี 2 แทนที่จะเป็น 0.8 — อัตราส่วนจะลดลงเหลือ 2:1 และ provisioned จะสมเหตุสมผลทางเศรษฐกิจ นั่นคือปัญหาธุรกิจที่ต่างออกไป ปัญหาที่เราอยากมี"


สำหรับ Aurora พร้อม Serverless v2 Reserved Instances ไม่ได้ใช้โดยตรง — Serverless v2 ขยายแบบ dynamic และคุณจ่ายต่อ ACU-ชั่วโมง นี่คือ configuration ปัจจุบันของ Nimbus: Aurora writer และ reader หลักทั้งคู่ใช้ Serverless v2 การประหยัดสำหรับ Nimbus มาจากลักษณะ auto-scaling ของ Serverless v2 เอง — คุณไม่จ่ายสำหรับ capacity ที่ไม่ได้ใช้เมื่อ traffic ต่ำ

ทีมที่ยังรัน Aurora instances แบบ fixed ควรประเมินข้อผูกมัด RI เมื่อ instance type เสถียรเป็นเวลาสามเดือนขึ้นไป

**DynamoDB: On-Demand vs Provisioned**

ในบทที่ 9 เราแนะนำสอง capacity modes ของ DynamoDB: on-demand และ provisioned

Nimbus ใช้ DynamoDB ใน on-demand mode ตั้งแต่เริ่มต้น ที่ traffic ต่ำ นี้ถูกต้อง — on-demand แพงกว่าต่อ request แต่ไม่มีค่าใช้จ่ายขั้นต่ำ

ตอนนี้ด้วยข้อมูล traffic 18 เดือนใน CloudWatch Tom สามารถเห็นรูปแบบ

Read requests เฉลี่ย: 225 ต่อวินาที (ประมาณ 19.4 ล้านต่อวัน)
Write requests เฉลี่ย: 60 ต่อวินาที (ประมาณ 5.2 ล้านต่อวัน)
วัน Peak (วันศุกร์): DynamoDB requests 180% ของค่าเฉลี่ย (ElastiCache รองรับการอ่านประมาณ 95% ดังนั้น DynamoDB เห็นเพียงส่วนเล็กๆ ของ order volume spike รวม 25x)

**On-demand pricing**: $1.25 ต่อ write requests หนึ่งล้านครั้ง $0.25 ต่อ read requests หนึ่งล้านครั้ง
**Provisioned pricing**: $0.00065 ต่อ write capacity unit ต่อชั่วโมง $0.00013 ต่อ read capacity unit ต่อชั่วโมง

Tom คำนวณจุด break-even: provisioned capacity ถูกกว่าเมื่อคุณใช้อย่างสม่ำเสมอพอที่คุณไม่ได้จ่ายส่วนเพิ่ม on-demand ในช่วง idle

(หมายเหตุเกี่ยวกับตัวเลขในส่วนนี้: พวกมันสะท้อนบิลของทีมในเวลานั้น และเป็นภาพประกอบ ในปลายปี 2024 AWS ลดราคา DynamoDB on-demand ลง 50% ซึ่งขยับจุดคุ้มทุนไปอย่างมาก — ทุกวันนี้ provisioned capacity ชนะเฉพาะเมื่อ utilization สูงอย่างสม่ำเสมอ ทำคณิตศาสตร์นี้ใหม่ด้วยราคาปัจจุบันเสมอ)

ด้วยข้อมูล 18 เดือนที่แสดงรูปแบบรายวันที่สอดคล้องกัน provisioned capacity พร้อม **DynamoDB Auto Scaling** คือตัวเลือกที่ถูกต้อง:

- ตั้ง minimum capacity ที่ 60% ของ load เฉลี่ย
- ตั้ง maximum ที่ 250% ของค่าเฉลี่ย (รองรับ Friday spikes)
- Auto Scaling ปรับ provisioned capacity ระหว่างขอบเขตเหล่านี้

ค่า DynamoDB รายเดือน: ลดจาก $340 (on-demand) เหลือ $230 (provisioned พร้อม auto scaling) ลดลง 32%

"เดี๋ยว — แต่ *ทำไม* เราถึงทำแบบนั้น?" Maya ถาม "เราอยู่บน on-demand ตั้งแต่เริ่มต้นเพราะเราไม่เชื่อใจรูปแบบ traffic ของตัวเอง อะไรเปลี่ยน?"

"ข้อมูลสิบแปดเดือน" Tom พูด "ตอนนี้เรารู้ว่ารูปแบบของเราหน้าตาเป็นอย่างไร — weekday baseline ที่สอดคล้องกัน Friday peaks ช่วงเงียบวันอาทิตย์ On-demand เป็นตัวเลือกที่ถูกต้องเมื่อเราไม่รู้ Provisioned พร้อม Auto Scaling เป็นตัวเลือกที่ถูกต้องตอนนี้ที่เรารู้"

"แต่ถ้าเรา over-provision" Leo ถาม "เราจ่ายสำหรับ capacity ที่ไม่ได้ใช้"

"นั่นคือความเสี่ยง" Tom พูด "ด้วย Auto Scaling เราตั้ง minimum สูงพอที่จะหลีกเลี่ยง throttling และปล่อยให้ AWS จัดการภายในช่วงของเรา"

"และถ้ารูปแบบ traffic ของเราเปลี่ยนอย่างมีนัยสำคัญ?"

"แล้วเราปรับขอบเขต เราทบทวนสิ่งนี้ทุกไตรมาส"

**ElastiCache: Right-Sizing และเรื่องเตือนใจ**

บิล ElastiCache: $185/เดือน Redis instance cache.r6g.large หนึ่งอันในแต่ละ AZ (สอง nodes primary + replica)

CloudWatch metrics แสดง:

- Memory utilization เฉลี่ย: 34%
- Peak: 58%

Instance over-provisioned เกินไป cache.r6g.medium น่าจะรองรับ load ได้พร้อม headroom

แต่ตรงนี้ Tom หยุด เขาจำได้ว่าเกิดอะไรขึ้นที่บริษัทก่อนหน้าเมื่อเขา right-size cache อย่างก้าวร้าว — และเขาเล่าเรื่องทั้งหมดให้ทีมฟัง เพราะมันเป็นเรื่องประเภทที่ต้องเล่าก่อนที่คุณจะพบว่าตัวเองอยู่ตรงกลางของมัน

ที่บริษัทก่อนหน้าของเขา — แพลตฟอร์ม SaaS สำหรับ financial reporting — ElastiCache cluster เคยเป็น cache.r6g.large สอง nodes primary และ replica Memory utilization เฉลี่ย: 31% Peak ที่สังเกตได้: 54% วิศวกร on-call ที่ flag มันได้ทำคณิตศาสตร์: cache.r6g.medium จะรองรับ load ได้พร้อม headroom 25% เหนือ peak ที่สังเกตได้ การประหยัด: $60/เดือน — ราคาใน region และ node generation ของบริษัทนั้นในเวลานั้น เล็กกว่าช่องว่างเทียบเท่าที่ Nimbus วันนี้ การเปลี่ยนแปลงถูกอนุมัติในวันอังคาร

เดือนถัดมา ในเย็นวันพฤหัสเวลา 23:47 น. month-end settlement batch เริ่มทำงาน

Settlement batch รันรายไตรมาส มันดึง transaction records ของทุกบัญชีที่ active สำหรับสามเดือนก่อนหน้า aggregate พวกมัน คำนวณภาษี และเขียน settlement records Cache ถูกใช้เพื่อจัดเก็บสถานะ aggregation ระหว่างทาง — ยอดสะสมของแต่ละบัญชีขณะที่ batch ดำเนินไป cache.r6g.large จัดการมันได้เสมอ ไม่มีใครดู settlement batch metrics โดยเฉพาะเมื่อทำการตัดสินใจ right-sizing เพราะ batch เป็นรายไตรมาสและ observation window คือสี่สัปดาห์

บน medium instance maxMemoryPolicy ถูกตั้งเป็น `allkeys-lru` — เมื่อ memory เต็ม Redis จะ evict key ที่ใช้น้อยที่สุดล่าสุดเพื่อให้มีที่ว่าง นั่นคือ policy ที่ถูกต้องสำหรับ general cache แต่สำหรับ settlement batch ทุก key ใน cache จำเป็นต้องใช้อย่าง active เมื่อ memory เต็มที่ 84% ของ 6.38 GB ของ medium instance Redis เริ่ม evict keys แต่ละ eviction คือ cache miss แต่ละ cache miss ส่ง query ไปยัง PostgreSQL database ที่อยู่เบื้องล่างเพื่อคำนวณค่าที่ถูก evict ใหม่จาก raw transaction records

Database connection pool ถูกกำหนดค่าสำหรับ steady-state traffic ไม่ใช่ settlement batch load ภายในสี่นาทีหลังจาก evictions เริ่มต้น ฐานข้อมูลมี 847 active connections Connection limit คือ 1,000 ที่ 9 นาที application threads แรกเริ่มเห็น error "too many connections" ที่ 12 นาที สามบริการที่แชร์ database connection pool — settlement batch, real-time reporting service และ client-facing API — ได้รับผลกระทบทั้งหมด

วิศวกร on-call escalate ที่ 23:59 น. การ review incident เริ่มที่ 00:08 น.

การตอบสนองแรก: เพิ่ม Lambda timeout สำหรับ settlement batch function (settlement batch บางส่วนใช้ Lambda) นี่ผิด Timeout ไม่ใช่ปัญหา

การตอบสนองที่สอง: เพิ่ม Lambda function ที่สองเพื่อ parallelize settlement batch ผิดเช่นกัน Parallelism มากขึ้นหมายถึง cache access พร้อมกันมากขึ้น ซึ่งหมายถึง evictions เร็วขึ้น ซึ่งทำให้สถานการณ์แย่ลง

การตอบสนองที่สาม: scale down settlement batch เพื่อลดความกดดันฐานข้อมูล นี่ช่วยเล็กน้อยแต่ไม่ได้แก้สาเหตุรากเหง้า

การตอบสนองที่สี่ ที่ 02:31 น.: restore cache.r6g.large ความกดดัน memory ลดลงทันที Evictions หยุด Database connection pool เคลียร์ Settlement batch เสร็จที่ 04:17 น. ล่าช้าไปกว่าสี่ชั่วโมง

รวม incident: สี่ชั่วโมงของประสิทธิภาพ API ที่ลดลงสำหรับลูกค้าที่พยายามเข้าถึงรายงาน settlement batch หนึ่งชุดที่สมบูรณ์ล่าช้า เวลาวิศวกรรม: ประมาณ 22 ชั่วโมงทั่วห้าวิศวกร ต้นทุนทางตรงที่ประมาณการ: $40,000

การประหยัด $60/เดือนมีค่าใช้จ่าย $40,000 ในเหตุการณ์เดียว

"ความผิดพลาดไม่ใช่การตัดสินใจ right-sizing" Tom พูด "การตัดสินใจป้องกันได้ตามข้อมูลที่มี ความผิดพลาดคือ observation window เราวัด metrics สี่สัปดาห์ Settlement batch เป็นรายไตรมาส เรากำลังดูช่วงเวลาที่ผิด"

"แล้วคุณหลีกเลี่ยงมันอย่างไร?" Maya ถาม

"คุณถาม: operation ที่เดิมพันสูงที่สุดที่ cache นี้รองรับคืออะไร? และคุณหา metrics เฉพาะของ operation นั้น ไม่ใช่สัปดาห์เฉลี่ย สัปดาห์เฉพาะ — หรือเดือน — หรือไตรมาส — เมื่อ load สูงที่สุด และคุณปรับขนาดสำหรับมัน"

"และถ้าคุณหา metrics ไม่ได้เพราะ operation เกิดขึ้นน้อย?"

"นั่นคือคำตอบ" Tom พูด "ถ้าคุณหา metrics สำหรับสถานการณ์ high-load เฉพาะไม่ได้ การตอบสนองที่ถูกต้องคืออย่าเพิ่ง right-size รอครั้งถัดไป instrument มันอย่างหนัก แล้วปรับขนาดตามสิ่งที่คุณสังเกต"

ElastiCache cluster ของ Nimbus มี high-stakes operation ของตัวเอง: Friday dinner rush Tom มีข้อมูลนั้น — สามคืนวันศุกร์ติดต่อกันแตะ 58% memory utilization บน r6g.large ถ้าเขาย้ายไป r6g.medium และบางอย่างใน order processing pipeline เปลี่ยนไปใช้ cache space มากขึ้น — ฟีเจอร์ใหม่ caching strategy ที่ต่างออกไป — 58% นั้นอาจกลายเป็น 80% และ 80% บน medium คือเขต eviction

เขารันตัวเลขอยู่ดี การย้ายจาก r6g.large ไป r6g.medium: สอง nodes ที่ $0.127/ชั่วโมงเทียบกับสอง nodes ที่ $0.065/ชั่วโมง รัน 730 ชั่วโมงต่อเดือน Large: $185/เดือน Medium: $95/เดือน การประหยัดที่เป็นไปได้: $90/เดือน เขาทดสอบ medium instance ใน staging สองสัปดาห์ภายใต้โหลด Memory peak ที่ 71% — ใกล้ขีดจำกัดพอที่เขาไม่สบายใจ

จากนั้นเขาตั้งราคาทางเลือก: เก็บ cache.r6g.large แต่ซื้อ Reserved Nodes (ข้อผูกมัด 1 ปี) จาก On-Demand $185 เป็น Reserved $120/เดือน การประหยัด: $65/เดือนโดยไม่เปลี่ยน instance type

"$65/เดือนที่ผมจะประหยัดบน Reserved Nodes ที่ instance size เดียวกันคือการประหยัดที่แท้จริง" Tom พูด "$90/เดือนที่ผมจะประหยัดโดยไป medium คือการประหยัดจอมปลอมถ้ามันเสี่ยง Friday dinner rush บางครั้ง right-sizing ไปยัง instance ที่เล็กกว่าเสี่ยงต่อเหตุการณ์ performance — Reserved Nodes ให้เราการประหยัดส่วนใหญ่พร้อมความเสี่ยงเป็นศูนย์"

เขาซื้อ Reserved Nodes สำหรับ r6g.large

"ความต่าง $25 ในการประหยัดรายเดือน" Tom พูด "ไม่คุ้มกับ Friday-night incident"

**RDS Backup Retention: การแลกเปลี่ยน Storage**

RDS automated backups ถูกเก็บใน S3 (ไม่มีค่าใช้จ่ายเพิ่มสำหรับ storage สูงสุด 100% ของขนาดฐานข้อมูลของคุณ) ค่าเริ่มต้นคือ 7 วัน

สำหรับ Aurora database ขนาด 180GB ของ Nimbus backup 7 วันเหมาะสม — พวกเขาสามารถ restore จาก backup ภายในช่วงนั้นในการทดสอบ

แต่ Tom สังเกต: พวกเขายังมี manual snapshots จาก significant deployment ทุกอัน เก็บไว้อย่างไม่มีกำหนด

Manual snapshots 23 อัน รวม snapshot storage ทั้งหมด 4.1TB
ค่าใช้จ่าย: $0.021/GB/เดือนสำหรับ Aurora backup storage = ประมาณ $87/เดือนใน manual snapshot storage

พวกเขาเก็บ manual snapshots ล่าสุด 3 อันต่อ environment (production, staging) ลบที่เหลือ — เก็บไว้ประมาณ 1.1TB
ประหยัด: $64/เดือน

"เราจ่าย $64 ต่อเดือนสำหรับประกันที่เราไม่เคยใช้" Leo พูด

"เราจ่ายเพื่อความสงบใจ" Tom แก้ไข "คำถามคือ: ความสงบใจนั้นมีค่า $64 ต่อเดือนเท่าไหร่?"

"ด้วยแผน disaster recovery ที่เหมาะสม" Priya พูด "คุณได้ความสงบใจแบบเดียวกันจาก automated backups 7 วันและ manual snapshots 3 อัน"

"ตกลง ตอนนี้"

**ความผันแปร: เมื่อ Provisioned ย้อนกลับมาทำร้าย**

ถ้ารูปแบบ traffic ของคุณสอดคล้องและคาดเดาได้ provisioned capacity พร้อม Auto Scaling ประหยัด 30% เหนือ on-demand แต่ถ้าฟีเจอร์ใหม่เปิดตัวและ write volume ของคุณพุ่ง 5x ข้ามคืน คุณจะถูก throttle ก่อนที่ Auto Scaling จะตามทัน — Auto Scaling ตอบสนองต่อ traffic ที่สังเกตได้ ซึ่งหมายความว่ามี lag การเก็บ on-demand mode ไว้สำหรับสัปดาห์รอบๆ การเปิดตัวฟีเจอร์สำคัญเป็นการแลกเปลี่ยนที่สมเหตุสมผล: ต้นทุนสูงกว่าเล็กน้อย ไม่มีความเสี่ยง throttling ในช่วงที่คุณกำลังเฝ้าดูรูปแบบ traffic เปลี่ยนแบบ real time

ถ้าคุณกำจัด read replicas ที่ไม่ได้ใช้ (เช่น legacy PostgreSQL replicas ของ Nimbus) การประหยัดเป็นทันทีและชัดเจน — ไม่มีการแลกเปลี่ยน เพราะ replicas ไม่ได้ให้คุณค่าใดๆ แต่ถ้าคุณถูกล่อให้กำจัด read replica ที่จัดการ traffic แค่ 2% ตรวจสอบว่าเกิดอะไรขึ้นกับ primary เมื่อ 2% นั้นไม่มีที่ไปในช่วง peak Read replicas บางตัวมีอยู่เพื่อ headroom ไม่ใช่ load ปัจจุบัน

**สรุปการ Optimize ฐานข้อมูล**

| Service                                           | ก่อน       | หลัง     | ประหยัดต่อเดือน |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (เก็บ Serverless v2 หลังการวิเคราะห์)      | $647       | $647     | $0 (model ถูกต้อง) |
| RDS Read Replicas (ไม่ได้ใช้)                     | $340       | $0       | $340           |
| DynamoDB (On-Demand → Provisioned + Auto Scaling) | $340       | $230     | $110           |
| ElastiCache (Reserved Nodes)                      | $185       | $120     | $65            |
| Aurora manual snapshots                           | $87        | $23      | $64            |
| RDS Proxy (ความปลอดภัย connection)               | $0         | $88      | -$88           |
| **รวม**                                           | **$1,599** | **$1,108** | **$491/เดือน** |

ประหยัดฐานข้อมูล $491 ต่อเดือน $5,892 ต่อปี

Tom นำตัวเลขนี้มาวางข้างๆ การทำความสะอาด storage ($6,200/ปี), S3 lifecycle policies จากบทที่ 23 ($7,800/ปี) และการประหยัด Savings Plan ($14,200/ปี)

ผลกระทบการ optimize รวมจนถึงตอนนี้: $34,092/ปี

"นั่นคือ runway จริง" Maya พูด

"หรือการทดลองจริงจังหลายครั้ง" Priya พูด

"หรือสิบสองเดือนของการทดลอง" Leo พูด

ทั้งสามถูกต้อง

## จุดแข็งและข้อจำกัด

**DynamoDB Provisioned พร้อม Auto Scaling**:

- ถูกกว่า on-demand สำหรับ workload ที่คาดเดาได้และสอดคล้องกัน
- Auto Scaling รองรับความผันผวนโดยไม่ต้อง over-provision อย่างถาวร
- ต้องการการตรวจสอบเพื่อให้แน่ใจว่าขอบเขต capacity ยังคงเหมาะสม

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- ประหยัดมากสำหรับ workload ที่คงที่และทำงานนาน
- ข้อผูกมัดที่ล็อคไว้ — หากความต้องการของคุณเปลี่ยน คุณจ่ายสำหรับ capacity ที่ไม่ได้ใช้
- ต่างจาก EC2 Standard RIs RDS RIs **ขายต่อไม่ได้** บน Reserved Instance Marketplace — Marketplace มีเฉพาะ EC2 RDS RI ที่ไม่ได้ใช้คือ sunk cost ซึ่งทำให้การตัดสินใจเรื่อง sizing สำคัญมากขึ้น

**หลักการทั่วไป**:

- เข้าใจ utilization ก่อน optimize เสมอ — ใช้ p95 ไม่ใช่ค่าเฉลี่ย
- ทรัพยากรที่ไม่ได้ใช้ (เช่น legacy read replicas) คือการ optimize ที่ให้ผลตอบแทนสูงสุด
- Right-sizing ต้องการการ validate ใน staging ก่อน apply กับ production และตรวจสอบรูปแบบ workload ตามฤดูกาลที่อาจไม่ปรากฏใน observation window มาตรฐาน
- Reserved pricing ต้องการความมั่นใจในความเสถียรของ workload

## สรุป

- **ตรวจสอบก่อน**: ดึง CloudWatch metrics ก่อนทำการเปลี่ยนแปลงฐานข้อมูลใดๆ ใช้ p95 latency และ p95 CPU — ไม่ใช่ค่าเฉลี่ย ตรวจสอบ FreeableMemory และ connection maximums
- **ลบทรัพยากรที่ไม่ได้ใช้**: Read replicas ฐานข้อมูลที่ไม่ได้ใช้งาน และ test instances ที่ไม่ต้องการอีกต่อไป
- **เฝ้าดู connection pool ของคุณ**: ตั้งสัญญาณเตือนบน DatabaseConnections ที่ 75% และ 90% ของขีดจำกัด พิจารณา RDS Proxy สำหรับ connection multiplexing
- **DynamoDB On-Demand vs Provisioned**: On-Demand สำหรับ traffic ที่คาดเดาไม่ได้ Provisioned + Auto Scaling สำหรับรูปแบบที่สอดคล้องกัน
- **ElastiCache right-sizing**: ทดสอบใน staging ภายใต้ peak loads ที่สมจริง รวมถึง seasonal peaks Reserved Nodes ให้การประหยัดที่ instance size เดียวกันเมื่อการลดขนาดอย่างก้าวร้าวมีความเสี่ยง
- **การจัดการ RDS snapshot**: เก็บเฉพาะ snapshots ที่ต้องการ Manual snapshots ถูกเก็บไว้อย่างไม่มีกำหนดเว้นแต่ถูกลบ

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.3)*

- **DynamoDB pricing modes**: On-Demand = จ่ายต่อ request (ค่าต่อหน่วยสูงกว่า ไม่มีขั้นต่ำ) Provisioned = จ่ายต่อ capacity unit ต่อชั่วโมง (ค่าต่อหน่วยต่ำกว่า ต้องจัดสรร capacity) **DynamoDB Auto Scaling** ปรับ provisioned capacity โดยอัตโนมัติ
- **RDS Reserved Instances**: มีให้สำหรับ RDS engine types ทั้งหมด Multi-AZ deployments สามารถใช้ Reserved Instances ได้ (คุณให้สัญญา Multi-AZ) ระยะ 1 หรือ 3 ปี
- **ElastiCache Reserved Nodes**: Model ข้อผูกมัดแบบเดียวกับ EC2 Reserved Instances ใช้กับ node ไม่ใช่ cluster
- **RDS snapshot storage**: Automated backups ฟรีสูงสุด 100% ของขนาดฐานข้อมูล Manual snapshots คิดค่าบริการต่อ GB ต่อเดือนใน S3 สถานการณ์สอบ: "ลดค่า RDS storage" → ลบ manual snapshots เก่า
- **DynamoDB reserved capacity**: มีให้สำหรับ DynamoDB เช่นกัน (ให้สัญญา read/write capacity เฉพาะในอัตราส่วนลดสำหรับ 1 หรือ 3 ปี) ต่างจาก provisioned มาตรฐาน — คุณจ่ายล่วงหน้าสำหรับ capacity ทั่วทุก DynamoDB tables ใน region
- **Aurora Serverless v2 vs provisioned**: Serverless v2 ขยายอัตโนมัติ เหมาะสำหรับ workload ที่ผันผวน Provisioned พร้อม Reserved Instances ถูกกว่าสำหรับ workload ที่คงที่และคาดเดาได้

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

อธิบายว่าเมื่อไหร่ควรใช้ DynamoDB on-demand capacity เทียบกับ provisioned capacity พร้อม Auto Scaling คุณต้องการข้อมูลอะไรในการตัดสินใจนี้?

*(คำใบ้: ลองคิดว่า "คาดเดาได้" หมายความว่าอะไรในแง่ของข้อมูล traffic และความเสี่ยงใดที่ on-demand ขจัดออกที่ provisioned แนะนำ)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทรัน DynamoDB table สำหรับ leaderboard ของ mobile game Traffic สม่ำเสมอมากตลอดทั้งปี ยกเว้นในช่วง seasonal event ที่กำหนดเวลาไว้ล่วงหน้าหลายเดือน (หนึ่งสัปดาห์ต่อไตรมาส แตะ 10x traffic ปกติเมื่อผู้เล่นเข้าร่วมในวันแรก) ลำดับความสำคัญของบริษัทคือการลดต้นทุนฐานข้อมูลให้น้อยที่สุดในช่วง steady-state ที่ยาวนานและคาดเดาได้ในขณะที่รักษาประสิทธิภาพตลอดสัปดาห์ event ที่รู้

กลยุทธ์ DynamoDB capacity ใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) On-demand capacity เพื่อรองรับ seasonal peaks โดยไม่มี throttling  
B) Provisioned capacity ตั้งไว้ที่ระดับ seasonal peak (provisioned สำหรับ traffic 10x ตลอดเวลา)  
C) Provisioned capacity พร้อม DynamoDB Auto Scaling พร้อม maximum capacity ตั้งไว้สำหรับ seasonal peak  
D) DynamoDB reserved capacity units เป็นเวลา 3 ปีที่ระดับ traffic ปกติ

**คำใบ้ที่ 1**: "Traffic สม่ำเสมอมากยกเว้น seasonal peak ที่กำหนดเวลาและรู้อยู่แล้ว" — mode ใดรองรับทั้งสองอย่างได้อย่างมีประสิทธิภาพ? (จุดแข็งของ on-demand คือ traffic ที่ *คาดเดาไม่ได้*; traffic นี้คาดเดาได้)

**คำใบ้ที่ 2**: "ลดต้นทุน" ในช่วง off-peak หมายความว่าคุณไม่สามารถ over-provision สำหรับ traffic 10x ตลอดเวลา

**คำใบ้ที่ 3**: DynamoDB Auto Scaling สามารถขยายขึ้นสำหรับ seasonal event และลดขนาดลงหลังจากนั้น

**คำตอบ**: C

**คำอธิบาย**: Provisioned capacity พร้อม Auto Scaling ขยาย table ตาม traffic จริง ในช่วงปกติ capacity อยู่ที่ระดับปกติ (ต้นทุนต่ำ) ในช่วง seasonal event — ที่รู้วันที่ล่วงหน้าและ traffic ค่อยๆ สร้างขึ้นในวันแรก — Auto Scaling ตรวจจับการเพิ่มขึ้นไปยังระดับ maximum ที่กำหนด (รองรับ 10x peak) และทีมยังสามารถยก minimum ขึ้นก่อนเวลาเริ่มที่กำหนดเป็น headroom เพิ่มเติม หลังจาก event capacity ลดขนาดลง นี้ถูกกว่า on-demand ในช่วง steady-state ที่ครอบงำทั้งปี (on-demand ค่าใช้จ่ายต่อ request มากกว่า) และถูกกว่าการ provision สำหรับ 10x ตลอดเวลา

**ทำไมไม่ใช่ A?** On-demand รองรับ peaks โดยไม่มี throttling แต่จุดแข็งของมันคือ traffic ที่ *คาดเดาไม่ได้* ที่นี่ traffic สม่ำเสมอมากและ peak ถูกกำหนดเวลาและค่อยเป็นค่อยไป — การจ่ายส่วนเพิ่ม on-demand ต่อ request สำหรับ ~92% ของปีที่เป็น steady-state ขัดกับลำดับความสำคัญที่ระบุไว้ของการลดต้นทุนในช่วงปกติ

**ทำไมไม่ใช่ B?** การ provision ที่ 10x อย่างถาวรหมายความว่า ~90% ของ provisioned capacity ไม่ได้ใช้งาน ~92% ของปี — จ่ายสำหรับ capacity ที่ไม่เคยใช้

**ทำไมไม่ใช่ D?** Reserved capacity units ล็อคคุณไว้กับระดับ traffic ปกติ ในช่วง 10x seasonal event คุณจะถูก throttle เกินจำนวนที่ reserved หรือคุณต้องเพิ่ม on-demand บนนั้น

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.3*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

Nimbus กำลังประเมิน feature ใหม่: แดชบอร์ด analytics สำหรับร้านอาหารที่แสดง order counts real-time รายได้ต่อชั่วโมง และข้อมูลประชากรลูกค้า ข้อมูลนี้จะ query ฐานข้อมูลประมาณ 200 ครั้งต่อนาที (หนึ่ง query ต่อ analyst ต่อการรีเฟรชหน้า พร้อม analysts 10 คน)

ปัจจุบัน analytics data อยู่ใน Athena (S3) พวกเขาควรสร้างแดชบอร์ดบน Athena หรือโหลดข้อมูลลงฐานข้อมูล? ถ้าเป็นฐานข้อมูล อันไหน (Aurora, DynamoDB, Redshift)?

พิจารณา: ความถี่ query ข้อกำหนดความสดของข้อมูล ความซับซ้อนของ query (aggregations, joins) และค่าใช้จ่ายต่อ query ที่ volume นี้

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกเลือกฐานข้อมูลสำหรับ analytics workloads)*

## ฉากหลังเครดิต

Tom นำเสนอสรุปการ optimize ต้นทุนทั้งหมดให้ Maya

สามเดือนของการทำงาน ระบุการประหยัดรายปี $34,092 ส่วนใหญ่ implement แล้ว

"ที่เหลือคืออะไร?" Maya ถาม

"การ optimize ที่ผมยังไม่มั่นใจ" Tom พูด "การกำหนดค่า Aurora อาจ right-size เพิ่มเติมได้ แต่ผมอยากได้ข้อมูลอีกหนึ่งไตรมาสก่อนที่จะให้สัญญา และมีคำถาม data transfer ที่ผมยังไม่ได้วิเคราะห์อย่างครบถ้วน"

"ค่า networking"

"ใช่ นั่นคือสิ่งถัดไป"

Maya ดูตัวเลข "Tom ผมอยากเข้าใจบางอย่าง การ optimize นี้ — คุณทุ่มเทอยู่กับมันสามเดือน นั่นเป็นส่วนสำคัญของเวลาของคุณ"

"ประมาณ 30%"

"และคุณพบประมาณ $34,000 ต่อปี ดังนั้นการ optimize จ่ายตัวเองคืนใน — สองสามเดือนของเงินเดือนคุณ?"

Tom มองเธอ "ประมาณนั้น"

"และทุกปีหลังจากนั้น เป็นการประหยัดล้วนๆ"

"หรือการลงทุนใหม่ล้วนๆ" เขาพูด "ผลกระทบเดียวกัน"

Maya พยักหน้า "นี่คือสิ่งที่ผมต้องการให้คุณทำ ไม่ใช่แค่ storage และฐานข้อมูล แต่ทุกอย่าง ทำให้การ optimize ต้นทุนเป็น function ต่อเนื่องของบทบาทคุณ"

Tom ไม่เคยได้ยินงานของตัวเองถูกอธิบายในแบบนี้ เขาพบว่ามันทั้งถูกต้องและน่าพึงพอใจ

ในบทถัดไป: หมวดหมู่ต้นทุนสุดท้ายที่เหลือ — และหมวดหมู่ที่ทำให้เกือบทุกคนประหลาดใจ
