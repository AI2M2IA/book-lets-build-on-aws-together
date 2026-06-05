# บทที่ 29: บิลฐานข้อมูล

การตรวจสอบ storage ของ Tom ระบุการสูญเสีย $8,800 เขาหันมาดูรายการฐานข้อมูล

RDS Aurora: $647/เดือน
RDS PostgreSQL (read replicas): $340/เดือน
ElastiCache: $183/เดือน

Database tier รวม: $1,170/เดือน

"ขอให้ผมเข้าใจแต่ละอันก่อนที่จะตัดสินใจอะไร" เขาพูด "เพราะฐานข้อมูลไม่ใช่จุดที่ควรประหยัดโดยการลดมาตรฐาน"

นี่เป็นเรื่องฉลาด การกำหนดค่าฐานข้อมูลที่ผิดพลาดซึ่งทำให้สูญเสียข้อมูลหรือประสิทธิภาพลดลงมีค่าใช้จ่ายสูงกว่าการประหยัดที่ได้มามาก

ลองนึกภาพฐานข้อมูลเหมือนเครื่องยนต์ของรถยนต์ คุณสามารถประหยัดเงินในรถยนต์ได้โดยเปลี่ยนไปใช้น้ำมันที่ถูกกว่า ปรับแรงดันยาง และลบน้ำหนักที่ไม่จำเป็นออกจากท้ายรถ แต่ถ้าคุณพยายามประหยัดเงินโดยข้ามการเปลี่ยนน้ำมันเครื่อง คุณเสี่ยงต่อการที่เครื่องยนต์จะยึด และเครื่องยนต์ที่ยึดมีค่าใช้จ่ายสูงกว่าการประหยัดน้ำมันใดๆ มาก การตรวจสอบที่ Tom กำลังทำตามตรรกะเดียวกัน: หาการสูญเสียในท้ายรถและถังน้ำมัน แล้วปล่อยเครื่องยนต์ไว้จนกว่าคุณจะรู้ว่ากำลังทำอะไรอยู่

**เข้าใจ Database Workload ก่อน**

การ optimize ต้นทุนในฐานข้อมูลต้องเข้าใจ workload ก่อนแตะต้องอะไร

คำถามสำคัญ:

- CPU utilization เฉลี่ยและ peak คือเท่าไหร่?
- อัตราส่วนการอ่าน/เขียนคือเท่าไหร่?
- Storage กำลังเพิ่มขึ้น คงที่ หรือลดลง?
- Read replicas กำลังถูกใช้งานอยู่ไหม?
- Instance under-provisioned (ทำให้ช้าลง) หรือ over-provisioned (จ่ายสำหรับ capacity ที่ไม่ได้ใช้)?

Tom ดึง CloudWatch metrics สำหรับบริการฐานข้อมูลทั้งสามตลอด 30 วันที่ผ่านมา:

**Aurora cluster**:

- CPU เฉลี่ย: 18% (peak: 67% ในคืนวันศุกร์)
- อัตราส่วนการอ่าน/เขียน: 14:1 (อ่านหนัก)
- Storage: 180GB (เพิ่มขึ้นประมาณ 5GB/เดือน)

**Read replicas (RDS PostgreSQL แยกต่างหากจาก Aurora)**:

- นี่คือ RDS read replicas สองอันที่สร้างขึ้นก่อนการย้ายไปยัง Aurora สำหรับ fallback ยังคงทำงานอยู่
- Connections เฉลี่ยต่ออัน: 2 ต่อวัน CPU เฉลี่ย: 3%

"ทำไมสิ่งเหล่านี้ยังทำงานอยู่?" Tom ถาม

Leo ดูวันที่สร้าง instance "พวกมันถูกสร้างระหว่างการย้ายไปยัง Aurora เพื่อ fallback เราลืมลบมัน"

ช่วงเวลานั้น — เมื่อของที่มีค่าใช้จ่ายสูงทำงานมาหลายเดือนโดยไม่ได้ใช้งาน — เป็นสิ่งที่พบเห็นบ่อยใน cloud environments

Replicas ถูกยุติ ประหยัดต่อเดือน: $340

**RDS Reserved Instances: เวอร์ชัน Database**

เช่นเดียวกับ EC2 RDS เสนอ Reserved Instances สำหรับการใช้งานที่ให้สัญญา

สำหรับ Aurora พร้อม Serverless v2 Reserved Instances ไม่ได้ใช้โดยตรง — Serverless v2 ขยายแบบ dynamic และคุณจ่ายต่อ ACU-ชั่วโมง อย่างไรก็ตาม หากคุณใช้ Aurora instance configuration ที่แน่นอน (ไม่ใช่ Serverless) Reserved Instances สามารถประหยัดได้ 30-60%

Tom ตรวจสอบ Aurora provisioned instances (writer และ reader หนึ่งตัว):

- Writer instance: db.r6g.large, On-Demand = $0.26/ชั่วโมง = $190/เดือน
- Reader instance: db.r6g.large, On-Demand = $0.26/ชั่วโมง = $190/เดือน

1-year Reserved Instances สำหรับทั้งสอง: ประมาณ $108/เดือน ต่ออัน ประหยัดรายปี: $984

"เดี๋ยวก่อน" Leo พูด "เราย้ายไปใช้ Aurora Serverless v2 ในบทที่ 24 ทำไม Tom ถึงดู On-Demand สำหรับ provisioned instances?"

สังเกตดีมาก มาพูดให้ชัดเจน: Aurora writer หลักของ Nimbus ใช้ Serverless v2 Reader (สำหรับ read replicas) ก็ใช้ Serverless v2 เช่นกัน Serverless v2 ไม่มี Reserved Instances แบบดั้งเดิม — คุณจ่ายต่อ ACU-ชั่วโมง

สำหรับทีมที่รัน Aurora instances แบบ fixed (ไม่ใช่ Serverless) Reserved Instances เป็นการประหยัดที่มีนัยสำคัญ สำหรับ Serverless v2 workloads การประหยัดมาจากลักษณะ auto-scaling ของบริการเอง — คุณไม่จ่ายสำหรับ capacity ที่ไม่ได้ใช้

**DynamoDB: On-Demand vs Provisioned**

ในบทที่ 9 เราแนะนำสอง capacity modes ของ DynamoDB: on-demand และ provisioned

Nimbus ใช้ DynamoDB ใน on-demand mode ตั้งแต่เริ่มต้น ที่ traffic ต่ำ นี้ถูกต้อง — on-demand แพงกว่าต่อ request แต่ไม่มีค่าใช้จ่ายขั้นต่ำ

ตอนนี้ด้วยข้อมูล traffic 18 เดือนใน CloudWatch Tom สามารถเห็นรูปแบบ

Read capacity units เฉลี่ยต่อวัน: 45,000
Write capacity units เฉลี่ยต่อวัน: 12,000
วัน Peak (วันศุกร์): DynamoDB requests 180% ของค่าเฉลี่ย (ElastiCache รองรับการอ่านประมาณ 95% ดังนั้น DynamoDB เห็นเพียงส่วนเล็กๆ ของ order volume spike รวม 25x)

**On-demand pricing**: $1.25 ต่อ write requests หนึ่งล้านครั้ง $0.25 ต่อ read requests หนึ่งล้านครั้ง
**Provisioned pricing**: $0.00065 ต่อ write capacity unit ต่อชั่วโมง $0.00013 ต่อ read capacity unit ต่อชั่วโมง

Tom คำนวณจุด break-even: provisioned capacity ถูกกว่าเมื่อคุณใช้อย่างสม่ำเสมอพอที่คุณไม่ได้จ่ายส่วนเพิ่ม on-demand ในช่วง idle

ด้วยข้อมูล 18 เดือนที่แสดงรูปแบบรายวันที่สอดคล้องกัน provisioned capacity พร้อม **DynamoDB Auto Scaling** คือตัวเลือกที่ถูกต้อง:

- ตั้ง minimum capacity ที่ 60% ของ load เฉลี่ย
- ตั้ง maximum ที่ 250% ของค่าเฉลี่ย (รองรับ Friday spikes)
- Auto Scaling ปรับ provisioned capacity ระหว่างขอบเขตเหล่านี้

ค่า DynamoDB รายเดือน: ลดจาก $340 (on-demand) เหลือ $230 (provisioned พร้อม auto scaling) ลดลง 32%

"แต่ถ้าเรา over-provision" Leo ถาม "เราจ่ายสำหรับ capacity ที่ไม่ได้ใช้"

"นั่นคือความเสี่ยง" Tom พูด "ด้วย Auto Scaling เราตั้ง minimum สูงพอที่จะหลีกเลี่ยง throttling และปล่อยให้ AWS จัดการภายในช่วงของเรา"

"และถ้ารูปแบบ traffic ของเราเปลี่ยนอย่างมีนัยสำคัญ?"

"แล้วเราปรับขอบเขต เราทบทวนสิ่งนี้ทุกไตรมาส"

**ElastiCache: Right-Sizing และ Reserved Nodes**

บิล ElastiCache: $183/เดือน Redis instance cache.r6g.large หนึ่งอันในแต่ละ AZ (สอง nodes primary + replica)

CloudWatch metrics แสดง:

- Memory utilization เฉลี่ย: 34%
- Peak: 58%

Instance over-provisioned เกินไป cache.r6g.medium น่าจะรองรับ load ได้พร้อม headroom

การย้ายจาก r6g.large (2 nodes × $0.127/ชั่วโมง) ไปเป็น r6g.medium (2 nodes × $0.065/ชั่วโมง):

- ประหยัดต่อเดือน: $113 → รอก่อน

จริงๆ แล้วคณิตศาสตร์: large = 2 × $0.127 × 730 ชั่วโมง = $185/เดือน Medium = 2 × $0.065 × 730 = $95/เดือน ประหยัด: $90/เดือน

Tom ทดสอบ medium instance ใน staging สองสัปดาห์ภายใต้โหลด Memory peak ที่ 71% ใกล้ขีดจำกัดพอที่เขาไม่สบายใจ

เขาลองใช้ cache.r6g.large แต่กับ Reserved Nodes (ข้อผูกมัด 1 ปี): จาก On-Demand $185 เป็น Reserved $120/เดือน ประหยัด: $65/เดือนโดยไม่เปลี่ยน instance type

"บางครั้ง right-sizing ไปยัง instance ที่เล็กกว่าเสี่ยงต่อเหตุการณ์ performance" เขาพูด "Reserved Nodes ให้เราการประหยัดแบบเดียวกันพร้อมความเสี่ยงน้อยกว่า"

**RDS Backup Retention: การแลกเปลี่ยน Storage**

RDS automated backups ถูกเก็บใน S3 (ไม่มีค่าใช้จ่ายเพิ่มสำหรับ storage สูงสุด 100% ของขนาดฐานข้อมูลของคุณ) ค่าเริ่มต้นคือ 7 วัน

สำหรับ Aurora database ขนาด 180GB ของ Nimbus backup 7 วันเหมาะสม — พวกเขาสามารถ restore จาก backup ภายในช่วงนั้นในการทดสอบ

แต่ Tom สังเกต: พวกเขายังมี manual snapshots จาก significant deployment ทุกอัน เก็บไว้อย่างไม่มีกำหนด

Manual snapshots 23 อัน รวม snapshot storage ทั้งหมด 4.1TB
ค่าใช้จ่าย: $0.095/GB/เดือนสำหรับ Aurora backups = $389/เดือนใน manual snapshot storage

พวกเขาเก็บ manual snapshots ล่าสุด 3 อันต่อ environment (production, staging) ลบที่เหลือ
ประหยัด: $350/เดือน

"เราจ่าย $350 ต่อเดือนสำหรับประกันที่เราไม่เคยใช้" Leo พูด

"เราจ่ายเพื่อความสงบใจ" Tom แก้ไข "คำถามคือ: ความสงบใจนั้นมีค่า $350 ต่อเดือนไหม?"

"ด้วยแผน disaster recovery ที่เหมาะสม" Priya พูด "คุณได้ความสงบใจแบบเดียวกันจาก automated backups 7 วันและ manual snapshots 3 อัน"

"ตกลง ตอนนี้"

**สรุปการ Optimize ฐานข้อมูล**

| Service                                                  | ก่อน       | หลัง     | ประหยัดต่อเดือน |
|----------------------------------------------------------|------------|----------|-----------------|
| RDS Read Replicas (ไม่ได้ใช้)                            | $340       | $0       | $340            |
| Aurora (Reserved Instances)                              | $190       | $120     | $70             |
| DynamoDB (On-Demand → Provisioned + Auto Scaling)        | $340       | $230     | $110            |
| ElastiCache (Reserved Nodes)                             | $185       | $120     | $65             |
| Aurora manual snapshots                                  | $389       | $39      | $350            |
| **รวม**                                                  | **$1,444** | **$509** | **$935/เดือน**  |

ประหยัดฐานข้อมูล $935 ต่อเดือน $11,220 ต่อปี

Tom นำตัวเลขนี้มาวางข้างๆ การประหยัด storage ($6,200/ปี) และการประหยัด Savings Plan ($14,200/ปี)

ผลกระทบการ optimize รวม: $31,620/ปี

"นั่นคือวิศวกร junior สามคน" Maya พูด

"หรือวิศวกรอาวุโสหนึ่งคน" Priya พูด

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
- RI Marketplace ช่วยให้ขาย RDS RIs ที่ไม่ได้ใช้ (ต่างจาก Convertible ที่ขายไม่ได้)

**หลักการทั่วไป**:

- เข้าใจ utilization ก่อน optimize เสมอ
- ทรัพยากรที่ไม่ได้ใช้ (เช่น legacy read replicas) คือการ optimize ที่ให้ผลตอบแทนสูงสุด
- Right-sizing ต้องการการ validate ใน staging ก่อน apply กับ production
- Reserved pricing ต้องการความมั่นใจในความเสถียรของ workload

## สรุป

- **ตรวจสอบก่อน**: ดึง CloudWatch metrics ก่อนทำการเปลี่ยนแปลงฐานข้อมูลใดๆ
- **ลบทรัพยากรที่ไม่ได้ใช้**: Read replicas ฐานข้อมูลที่ไม่ได้ใช้งาน และ test instances ที่ไม่ต้องการอีกต่อไป
- **DynamoDB On-Demand vs Provisioned**: On-Demand สำหรับ traffic ที่คาดเดาไม่ได้ Provisioned + Auto Scaling สำหรับรูปแบบที่สอดคล้องกัน
- **ElastiCache Reserved Nodes**: เหมือน EC2 Reserved Instances สำหรับ Redis/Memcached ประหยัด 30-50% สำหรับ workload ที่คงที่
- **การจัดการ RDS snapshot**: เก็บเฉพาะ snapshots ที่ต้องการ Manual snapshots ถูกเก็บไว้อย่างไม่มีกำหนดเว้นแต่ถูกลบ
- **Right-size อย่างระมัดระวัง**: Database right-sizing เสี่ยงต่อเหตุการณ์ performance ทดสอบใน staging validate ภายใต้โหลด

## เคล็ดลับสอบ

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

**แบบฝึกหัดที่ 2 — ฝึกสอบ**

*สถานการณ์*: บริษัทรัน DynamoDB table สำหรับ leaderboard ของ mobile game Traffic พุ่งสูงอย่างมากในช่วง seasonal event (หนึ่งสัปดาห์ต่อไตรมาส traffic 10x ปกติ) แต่สม่ำเสมอมากนอกจากนั้น นอกจาก seasonal event บริษัทต้องการลดต้นทุนฐานข้อมูลให้น้อยที่สุดในขณะที่รักษาประสิทธิภาพ

กลยุทธ์ DynamoDB capacity ใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) On-demand capacity เพื่อรองรับ seasonal peaks โดยไม่มี throttling  
B) Provisioned capacity ตั้งไว้ที่ระดับ seasonal peak (provisioned สำหรับ traffic 10x ตลอดเวลา)  
C) Provisioned capacity พร้อม DynamoDB Auto Scaling พร้อม maximum capacity ตั้งไว้สำหรับ seasonal peak  
D) DynamoDB reserved capacity units เป็นเวลา 3 ปีที่ระดับ traffic ปกติ

**คำใบ้ที่ 1**: "Traffic สม่ำเสมอยกเว้น seasonal peaks ที่รู้อยู่แล้ว" — mode ใดรองรับทั้งสองอย่างได้อย่างมีประสิทธิภาพ?

**คำใบ้ที่ 2**: "ลดต้นทุน" ในช่วง off-peak หมายความว่าคุณไม่สามารถ over-provision สำหรับ traffic 10x ตลอดเวลา

**คำใบ้ที่ 3**: DynamoDB Auto Scaling สามารถขยายขึ้นสำหรับ seasonal event และลดขนาดลงหลังจากนั้น

**คำตอบ**: C

**คำอธิบาย**: Provisioned capacity พร้อม Auto Scaling ขยาย table ตาม traffic จริง ในช่วงปกติ capacity อยู่ที่ระดับปกติ (ต้นทุนต่ำ) ในช่วง seasonal event Auto Scaling ตรวจจับการเพิ่มขึ้นของ traffic และขยายไปยังระดับ maximum ที่กำหนด (รองรับ 10x peak) หลังจาก event มันลดขนาดลงอีก ถูกกว่า on-demand ในช่วงปกติ (on-demand ค่าใช้จ่ายต่อ request มากกว่า) และถูกกว่าการ provision สำหรับ 10x ตลอดเวลา

**ทำไมไม่ใช่ A?** On-demand รองรับ peaks โดยไม่มี throttling แต่ค่าใช้จ่ายต่อ request มากกว่า provisioned ในช่วง traffic ปกติที่คาดเดาได้

**ทำไมไม่ใช่ B?** การ provision ที่ 10x อย่างถาวรหมายความว่า 75% ของ provisioned capacity ไม่ได้ใช้งาน 75% ของปี จ่ายสำหรับ capacity ที่ไม่เคยใช้

**ทำไมไม่ใช่ D?** Reserved capacity units ล็อคคุณไว้กับระดับ traffic ปกติ ในช่วง 10x seasonal event คุณจะถูก throttle เกินจำนวนที่ reserved หรือคุณต้องเพิ่ม on-demand บนนั้น

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.3*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

Nimbus กำลังประเมิน feature ใหม่: แดชบอร์ด analytics สำหรับร้านอาหารที่แสดง order counts real-time รายได้ต่อชั่วโมง และข้อมูลประชากรลูกค้า ข้อมูลนี้จะ query ฐานข้อมูลประมาณ 200 ครั้งต่อนาที (หนึ่ง query ต่อ analyst ต่อการรีเฟรชหน้า พร้อม analysts 10 คน)

ปัจจุบัน analytics data อยู่ใน Athena (S3) พวกเขาควรสร้างแดชบอร์ดบน Athena หรือโหลดข้อมูลลงฐานข้อมูล? ถ้าเป็นฐานข้อมูล อันไหน (Aurora, DynamoDB, Redshift)?

พิจารณา: ความถี่ query ข้อกำหนดความสดของข้อมูล ความซับซ้อนของ query (aggregations, joins) และค่าใช้จ่ายต่อ query ที่ volume นี้

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกเลือกฐานข้อมูลสำหรับ analytics workloads)*

## ฉากหลังเครดิต

Tom นำเสนอสรุปการ optimize ต้นทุนทั้งหมดให้ Maya

สามเดือนของการทำงาน ระบุการประหยัดรายปี $31,620 การเปลี่ยนแปลงที่ implement แล้ว $26,400

"$5,220 ที่เหลือคืออะไร?" Maya ถาม

"การ optimize ที่ผมยังไม่มั่นใจ" Tom พูด "การกำหนดค่า Aurora สามารถ right-size เพิ่มเติมได้แต่ผมอยากได้ข้อมูลอีกหนึ่งไตรมาสก่อนที่จะให้สัญญา และมีคำถาม data transfer ที่ผมยังไม่ได้วิเคราะห์อย่างครบถ้วน"

"ค่า networking"

"ใช่ นั่นคือสิ่งถัดไป"

Maya ดูตัวเลข "Tom ผมอยากเข้าใจบางอย่าง การ optimize นี้ คุณทุ่มเทอยู่กับมันสามเดือน นั่นเป็นส่วนสำคัญของเวลาของคุณ"

"ประมาณ 30%"

"และคุณประหยัดได้ $26,400 ต่อปี ดังนั้นการ optimize จ่ายตัวเองคืนใน — สี่เดือนของเงินเดือนคุณ?"

Tom มองเธอ "ประมาณนั้น"

"และทุกปีหลังจากนั้น เป็นการประหยัดล้วนๆ"

"หรือการลงทุนใหม่" เขาพูด "ผลกระทบเดียวกัน"

Maya พยักหน้า "นี่คือสิ่งที่ผมต้องการให้คุณทำ ไม่ใช่แค่ storage และฐานข้อมูล แต่ทุกอย่าง ทำให้การ optimize ต้นทุนเป็น function ต่อเนื่องของบทบาทคุณ"

Tom ไม่เคยได้ยินงานของตัวเองถูกอธิบายในแบบนี้ เขาพบว่ามันทั้งถูกต้องและน่าพึงพอใจ

ในบทถัดไป: หมวดหมู่ต้นทุนสุดท้ายที่เหลือ — และหมวดหมู่ที่ทำให้เกือบทุกคนประหลาดใจ
