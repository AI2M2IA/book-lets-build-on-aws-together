# บทที่ 23: ระบบจัดเก็บเอกสารที่เรียงตัวเอง

สำนักงานกฎหมายเก็บแฟ้มคดีที่กำลังดำเนินการไว้บนโต๊ะ คดีที่เสร็จแล้วเข้าตู้เก็บเอกสาร คดีจากสามปีก่อนเข้ากล่องเก็บในห้องใต้ดิน คดีจากสิบปีก่อนเข้าสถานที่เก็บถาวรนอกสถานที่ที่มีค่าใช้จ่ายเซนต์ต่อกล่องแต่ใช้เวลาสองวันในการดึงอะไรออกมา

ข้อมูลเดียวกัน เก็บที่ต้นทุนต่างกันตามความถี่ที่ถูกเข้าถึง

---

ด้วยการ automate workflow ที่เข้าที่แล้วและ order flow ที่ในที่สุดก็เสถียร Tom ได้กลับมาทบทวนต้นทุนของเขา บิล S3 ค้างอยู่ในใจเขามาตั้งแต่ไตรมาสก่อน — หนึ่งใน line items ที่เติบโตขึ้นเรื่อยๆ โดยไม่มีใครมองมันโดยตรง ในที่สุดเขาก็มีเวลามอง

เขาเรียก Leo มา

"เรามี 4.2 เทราไบต์ใน S3" Leo พูดหลังจากตรวจสอบ

"ของอะไร?"

"รูปภาพร้านอาหาร ใบเสร็จออร์เดอร์ analytics exports backup snapshots จาก 18 เดือนก่อน"

"ครั้งสุดท้ายที่มีคนเข้าถึง backup จาก 18 เดือนก่อนคือเมื่อไร?"

Leo ตรวจสอบ access logs

"ตุลาคมปีที่แล้ว" เขาพูด "ครั้งเดียว เพื่อยืนยันรูปแบบ backup"

"ดังนั้นเราจ่ายค่า backup 18 เดือนที่ราคา S3 Standard เต็ม"

"ใช่"

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร — Glacier เทียบกับ Standard?" Tom ถาม กำลังเปิดหน้า pricing อยู่แล้ว

S3 Standard: $0.023 ต่อ GB ต่อเดือน S3 Glacier Instant Retrieval: $0.004 ต่อ GB ต่อเดือน

Tom คำนวณ

"เราสามารถลดบิลนี้อย่างมาก" เขาพูด "แค่ย้ายข้อมูลเก่าไปยัง storage ที่ถูกกว่า"

"เราต้องรู้ว่าอะไรเก่า" Leo พูด

"S3 รู้ มันติดตามเวลาที่เข้าถึงล่าสุด"

**S3 Storage Classes: สเปกตรัมเต็ม**

บทที่ 5 แนะนำ S3 Standard เป็น storage class หลัก จริงๆ แล้ว S3 มีแปด storage classes แต่ละตัวออกแบบสำหรับรูปแบบการเข้าถึงที่แตกต่างกัน (ตัวที่แปด **S3 Express One Zone** เป็น single-AZ class เฉพาะทางสำหรับ latency-critical workloads และไม่ค่อยปรากฏนอกเหนือจาก high-performance scenarios):

**S3 Standard**: สำหรับข้อมูลที่เข้าถึงบ่อย Latency ต่ำ (มิลลิวินาที) ต้นทุนสูงสุด ไม่มี minimum storage duration ใช้สำหรับข้อมูลที่ active: รูปภาพเมนูปัจจุบัน, ออร์เดอร์วันนี้, logs ล่าสุด

**S3 Standard-Infrequent Access (S3 Standard-IA)**: สำหรับข้อมูลที่เข้าถึงน้อยกว่าครั้งต่อเดือน การดึงข้อมูลระดับมิลลิวินาทีเดียวกับ Standard แต่ต้นทุนการจัดเก็บต่ำกว่า + ค่าดึงข้อมูลต่อ GB minimum storage duration 30 วัน ใช้สำหรับข้อมูลที่คุณต้องการทันทีเมื่อเข้าถึง แต่ไม่ค่อยเข้าถึง: ใบเสร็จออร์เดอร์เก่า, analytics exports อายุ 6 เดือน

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: เหมือน S3 Standard-IA (รวมถึง minimum 30 วัน) แต่เก็บในเพียงหนึ่ง Availability Zone (แทนที่จะเป็นสาม) ทนทานน้อยกว่า (ถ้า AZ นั้นมีภัยพิบัติ ข้อมูลอาจสูญหาย) แต่ถูกกว่า 20% ใช้สำหรับข้อมูลที่สร้างใหม่ได้ถ้าสูญหาย: thumbnail cache, temporary processing outputs

**S3 Glacier Instant Retrieval**: ข้อมูลที่เก็บถาวรที่คุณต้องการบางครั้ง การดึงข้อมูลระดับมิลลิวินาที ต้นทุนการจัดเก็บต่ำมาก ค่าดึงข้อมูลต่อ GB สูงกว่า minimum storage 90 วัน ใช้สำหรับข้อมูลที่เข้าถึงครั้งต่อไตรมาสหรือน้อยกว่า: quarterly compliance reports, backup snapshots อายุ 12 เดือน

**S3 Glacier Flexible Retrieval**: deep archive ดึงข้อมูลในไม่กี่นาทีถึงหลายชั่วโมง ต้นทุนต่ำกว่า Glacier Instant Retrieval ใช้สำหรับข้อมูลเก็บถาวรที่เร่งด่วนน้อยกว่า

**S3 Glacier Deep Archive**: ตัวเลือกที่ต้นทุนต่ำสุด ดึงข้อมูลใน 12 ชั่วโมง minimum storage 180 วัน ใช้สำหรับข้อมูลที่ต้องเก็บเพื่อ regulatory compliance แต่ไม่คาดว่าจะถูกเข้าถึง: tax records 7 ปี, audit logs 10 ปี

รูปแบบ: เมื่อความถี่การเข้าถึงลดลง ต้นทุนลดลงแต่เวลาดึงข้อมูลเพิ่มขึ้น (และค่าดึงข้อมูลต่อครั้งเพิ่มขึ้น) เลือก class ที่ตรงกับรูปแบบการเข้าถึงของคุณ

**S3 Lifecycle Policies: ระบบจัดเก็บอัตโนมัติ**

การย้ายไฟล์ระหว่าง storage classes ด้วยตนเองนั้นผิดพลาดได้ง่ายและใช้เวลานาน S3 **lifecycle policies** ทำสิ่งนี้โดยอัตโนมัติตามกฎที่คุณกำหนด

lifecycle rule มีสองส่วนประกอบ:

**Filter**: objects ใดที่ rule นำไปใช้ (objects ทั้งหมด, objects ที่มี prefix เฉพาะ, objects ที่มี tags เฉพาะ)

**Actions**: ทำอะไร หลังจากกี่วัน

ตัวอย่าง lifecycle policy สำหรับใบเสร็จออร์เดอร์ของ Nimbus:

```
เปลี่ยนเป็น S3 Standard-IA หลังจาก 90 วัน
เปลี่ยนเป็น S3 Glacier Instant Retrieval หลังจาก 365 วัน
เปลี่ยนเป็น S3 Glacier Flexible Retrieval หลังจาก 540 วัน (18 เดือน)
เปลี่ยนเป็น S3 Glacier Deep Archive หลังจาก 2555 วัน (7 ปี)
ลบหลังจาก 2920 วัน (8 ปี)
```

policy เดียวนี้รับประกัน:

- ใบเสร็จที่ active (< 90 วัน): S3 Standard, เข้าถึงเร็ว
- ใบเสร็จล่าสุด (90-365 วัน): Standard-IA, ถูกแต่พร้อมใช้ทันที
- ใบเสร็จเก่ากว่า (1 ปีถึง 18 เดือน): Glacier Instant, ถูกมาก, มิลลิวินาทีเมื่อต้องการ
- ใบเสร็จในอดีต (18 เดือนถึง 7 ปี): Glacier Flexible, ถูกยิ่งขึ้น — การดึงข้อมูลใช้เวลาหลายชั่วโมง ไม่ใช่มิลลิวินาที
- ใบเสร็จที่หมดอายุ (> 8 ปี): ลบโดยอัตโนมัติ

มีอุปสรรคหนึ่งที่เกือบทำให้แผนพังไป ตั้งแต่ปลายปี 2024 lifecycle rules **ไม่
เปลี่ยน objects ที่เล็กกว่า 128 KB โดยค่าเริ่มต้น** — และใบเสร็จของ Nimbus
เฉลี่ย 18 KB ต่อใบ เพื่อให้ policy ย้ายพวกมันจริง Leo ต้อง
override ค่า default minimum object size บน rule (lifecycle filters
สามารถเลือกตามขนาดได้ด้วย `ObjectSizeGreaterThan`/`ObjectSizeLessThan`)
ค่าเริ่มต้นมีอยู่ด้วยเหตุผลที่ดี: archive classes คิดค่า metadata overhead ~40 KB
ต่อ object และทุกการเปลี่ยนมีค่า request fee ดังนั้นสำหรับ objects เล็กๆ หลายล้านตัว
การเปลี่ยนอาจมีต้นทุนมากกว่าที่ประหยัด Leo คำนวณสำหรับใบเสร็จ — ที่การเก็บเจ็ดปี
มันยังคงคุ้มค่า

Tom ทบทวนการประหยัดที่คาดการณ์: จาก $847/เดือน เป็นประมาณ $220/เดือน

"แค่... กำหนดสิ่งที่เก่าและควรไปที่ไหน?" เขาพูด

"และ S3 ย้ายมันโดยอัตโนมัติ" Leo ยืนยัน "ไม่มี cron job ไม่มีการ migrate ด้วยตนเอง ไม่มีการลืม"

"เดี๋ยว — แต่*ทำไม* S3 ถึงไม่ทำสิ่งนี้โดยค่าเริ่มต้นล่ะ?" Maya ถามจากอีกฟากของห้อง "ทำไมคุณต้องกำหนด policy เลย?"

"เพราะ 'เก่า' แตกต่างกันสำหรับทุก bucket" Leo พูด "compliance archive และ photo upload ต้องการ retention rules ที่แตกต่างกันโดยสิ้นเชิง S3 เดาไม่ได้ว่าตัวไหนเป็นตัวไหน"

คุณอาจสงสัยว่า: เกิดอะไรขึ้นถ้าข้อมูลที่ผิดถูกย้ายไป Glacier และคุณต้องการมันอย่างเร่งด่วน? คุณจะจ่ายค่าดึงข้อมูลและรอ — ซึ่งเป็นเหตุผลที่คุณควรทดสอบ lifecycle rules บน bucket ขนาดเล็กที่ไม่สำคัญก่อน และยืนยัน access logs ก่อน roll out ไปยังข้อมูล production ความผิดพลาดในการดึงข้อมูลบน backup 18 เดือนจะมีต้นทุนน้อยกว่าเหตุการณ์ที่ลูกค้าเห็นมาก แต่มันยังคงคุ้มค่าที่จะทดสอบก่อน

ถ้ารูปแบบการเข้าถึงข้อมูลของคุณคาดเดาได้ (logs เย็นเสมอหลัง 30 วัน) ใช้ explicit lifecycle rules — พวกมันมีประสิทธิภาพด้านต้นทุนมากกว่าค่า per-object monitoring ของ Intelligent-Tiering ถ้ารูปแบบการเข้าถึงของคุณเปลี่ยนไปตามเวลาหรือคาดเดายาก ใช้ Intelligent-Tiering — แต่ตระหนักว่ามันแค่เพิกเฉยต่อ objects ที่เล็กกว่า 128 KB: พวกมันไม่ถูก monitor ไม่ถูกคิดค่า monitoring fee และไม่เคยออกจาก Frequent Access tier

**S3 Intelligent-Tiering: Class ที่จัดระเบียบตัวเอง**

จะเป็นอย่างไรถ้าคุณไม่รู้ว่าคุณจะเข้าถึงข้อมูลของคุณบ่อยแค่ไหน?

**S3 Intelligent-Tiering** monitor รูปแบบการเข้าถึงสำหรับแต่ละ object และย้ายมันระหว่าง access tiers โดยอัตโนมัติ:

- **Frequent Access tier**: สำหรับ objects ที่เข้าถึงล่าสุด
- **Infrequent Access tier**: objects ที่ไม่ถูกเข้าถึงเป็นเวลา 30 วัน
- **Archive Instant Access tier**: objects ที่ไม่ถูกเข้าถึงเป็นเวลา 90 วัน
- **Archive Access tier**: objects ที่ไม่ถูกเข้าถึงเป็นเวลา 90-730 วัน (ทางเลือก)
- **Deep Archive Access tier**: objects ที่ไม่ถูกเข้าถึงเป็นเวลา 180-730+ วัน (ทางเลือก)

S3 Intelligent-Tiering คิดค่า monitoring fee เล็กน้อยต่อ object ต่อเดือน ($0.0025 ต่อ 1,000 objects) แต่ไม่มีค่าดึงข้อมูลสำหรับ Frequent และ Infrequent tiers

ใช้ Intelligent-Tiering เมื่อ:

- รูปแบบการเข้าถึงคาดเดาไม่ได้หรือเปลี่ยนไปตามเวลา
- คุณมีข้อมูลร้อนและเย็นปนกันที่คุณจำแนกได้ไม่ง่าย
- คุณมี objects ที่ใหญ่กว่า 128KB (objects ที่เล็กกว่าไม่ถูก monitor หรือ auto-tier เลย)

ใช้ explicit storage classes (พร้อม lifecycle policies) เมื่อ:

- รูปแบบการเข้าถึงคาดเดาได้
- คุณต้องการให้ทุก object — รวมถึงตัวเล็ก — ย้ายไปยัง classes ที่ถูกกว่าจริง
- objects เล็ก (< 128KB)

ข้อควรระวังเรื่องไฟล์เล็กควรเน้น Nimbus มี 2.3 ล้าน order receipt objects ใน S3 — แต่ละตัวเป็นไฟล์ JSON เล็กๆ เฉลี่ยประมาณ 18KB Tom พิจารณา Intelligent-Tiering สำหรับ receipts bucket ในตอนแรก จนกระทั่งเขาอ่าน fine print

Objects ที่เล็กกว่า 128KB **ไม่ถูก monitor และไม่ถูก auto-tier** ใน Intelligent-Tiering พวกมันไม่จ่าย monitoring fee ($0.0025 ต่อ 1,000 objects ต่อเดือน) — แต่พวกมันก็ไม่เคยย้าย: พวกมันนั่งอยู่ใน Frequent Access tier ที่ราคาเทียบเท่า Standard ตลอดไป

ดังนั้นสำหรับใบเสร็จ 18KB, Intelligent-Tiering จะไม่มีค่าใช้จ่ายเพิ่มกับ Nimbus — มันแค่จะไม่*ทำ*อะไรเลย ใบเสร็จเย็น 2.3 ล้านใบจะยังคงจ่ายราคา hot-storage ($0.023/GB) อย่างไม่มีกำหนด ในขณะที่ Archive tiers ($0.00099/GB) อยู่นอกเอื้อม

"ดังนั้น Intelligent-Tiering ถูกออกแบบสำหรับ objects ขนาดใหญ่" Maya พูด

"หรือสำหรับ workloads ที่คุณไม่รู้รูปแบบการเข้าถึงจริงๆ" Tom พูด "สำหรับ bucket ของไฟล์เล็กที่เรารู้ว่าใบเสร็จร้อนเป็นเวลา 90 วันและเย็นหลังจากนั้น explicit lifecycle rule — พร้อม small-object override จากก่อนหน้านี้ — เป็นสิ่งเดียวที่ย้ายพวกมันจริง"

Intelligent-Tiering เป็น service ที่ยอดเยี่ยม มันแค่ไม่ใช่เครื่องมือที่ถูกต้องสำหรับทุก bucket: ต่ำกว่า threshold 128KB มันไม่เป็นอันตรายแต่ไร้ประโยชน์ และมีเพียง explicit lifecycle rules (พร้อม size override) เท่านั้นที่จะ tier objects เล็ก

**เมื่อคุณต้องการข้อมูลกลับมาจริงๆ: เรื่องราวการดึงข้อมูลจาก Glacier**

สามเดือนหลังจาก lifecycle policies ถูก deploy, Nimbus ได้รับ legal notice อดีตพันธมิตรร้านอาหารกำลังโต้แย้งข้อสัญญา และทนายของ Nimbus ต้องการ order records 18 เดือนสำหรับพันธมิตรนั้น — ทุกอย่างตั้งแต่เปิดจนถึงการยกเลิกสัญญา

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่านกระบวนการ legal discovery ล่ะ?" Priya พูด เธอไม่ได้ล้อเล่น "ทนายที่ขอ bulk data exports เป็น social engineering vector ที่พบบ่อย ยืนยันว่าคำขอถูกต้องก่อนเปิด data store ใดๆ"

คำขอถูกต้อง records อยู่ใน S3 ข้ามสาม storage classes: 90 วันล่าสุดใน Standard-IA, ปีก่อนหน้าใน Glacier Instant Retrieval, ที่เหลือใน Glacier Flexible Retrieval (lifecycle policy ใช้ Flexible สำหรับข้อมูลที่เก่ากว่า 18 เดือน)

Glacier Instant records พร้อมใช้ทันที Leo filter ตาม restaurant ID รัน Athena query เพื่อระบุ order records ที่ตรงกัน และ export พวกมันไปยัง secure S3 location ทำงานห้านาที

Glacier Flexible records ต้องการ restore request:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **Standard tier**: 3-5 ชั่วโมง records จะพร้อมใช้เป็นสำเนาชั่วคราวใน S3 Standard เป็นเวลา 7 วัน แล้วถูกลบโดยอัตโนมัติ สำเนา archive ดั้งเดิมยังคงอยู่ใน Glacier

ต้นทุนของการดึงข้อมูลทั้งหมด: $0.01 ต่อ GB ที่ดึงที่ Standard tier สำหรับ 4.2 GB ของ records ที่ archive ประมาณสี่เซนต์ (Expedited tier — 1 ถึง 5 นาที — มีต้นทุน $0.03 ต่อ GB แต่ความพร้อมใช้ของมันไม่ได้รับการรับประกันแบบที่ Standard ได้)

"สี่เซนต์" Maya พูด เมื่อ Leo รายงานกลับ "สำหรับ records 18 เดือน"

"เราเก็บ 4.2GB ที่ $0.0036 ต่อ GB ต่อเดือนเป็นเวลาหนึ่งปีครึ่ง" Leo พูด "ต้นทุนการจัดเก็บประมาณยี่สิบเจ็ดเซนต์ทั้งหมด ต้นทุนการดึงข้อมูลคือสี่ เทียบกับหนึ่งดอลลาร์เจ็ดสิบสี่ถ้าเราเก็บมันใน S3 Standard เป็นเวลา 18 เดือน"

"และสิ่งเดียวที่สำคัญ" Priya พูด "คือเราจำได้ว่ามันอยู่ใน Flexible Retrieval และวางแผนสำหรับการรอ 3-5 ชั่วโมง ถ้าทนายต้องการสิ่งนี้ใน 30 นาที เราจะมีปัญหา"

นี่คือบทเรียนเชิงปฏิบัติการที่สำคัญเกี่ยวกับ Glacier: มันไม่ใช่แค่การตัดสินใจด้านต้นทุน แต่เป็นการตัดสินใจด้าน retrieval SLA ก่อน archive ข้อมูลไปยัง Glacier Flexible หรือ Deep Archive ให้บันทึกเวลาดึงข้อมูลสำหรับใครก็ตามที่อาจต้องการมัน "ข้อมูลมีอยู่" และ "เราได้มันใน 30 นาที" เป็นการรับประกันสองอย่างที่แตกต่างกัน

**Multipart Upload: สำหรับ Objects ขนาดใหญ่**

S3 มีขีดจำกัด single upload 5GB สำหรับ objects ที่ใหญ่กว่า คุณต้องใช้ **multipart upload**: แบ่ง object เป็นส่วนๆ อัปโหลดแต่ละส่วนแบบขนาน และ S3 ประกอบพวกมัน

ประโยชน์:

- อัปโหลดเร็วกว่า (ขนาน)
- สามารถ resume การอัปโหลดที่ล้มเหลว (อัปโหลดซ้ำเฉพาะส่วนที่ล้มเหลว)
- จำเป็นสำหรับ objects > 5GB

เคล็ดลับ lifecycle rule: ตั้ง lifecycle rule เพื่อลบ incomplete multipart uploads หลัง 7 วัน ถ้าการอัปโหลดล้มเหลวกลางคันและไม่ถูกล้าง ส่วนบางส่วนเหล่านั้นถูกเก็บและคิดเงิน — โดยไม่มี object ที่ประกอบเสร็จให้แสดง

Tom ชื่นชอบเคล็ดลับนี้อย่างมาก

เขารันคำสั่ง AWS CLI เพื่อแสดงรายการ incomplete multipart uploads ข้าม Nimbus buckets ทั้งหมด:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

output ยาวกว่าที่เขาคาดไว้ เขา pipe มันไปยัง counter

340 incomplete uploads ตัวที่เก่าที่สุดมาจาก 8 เดือนก่อน — load test ของ Leo สำหรับ restaurant photo upload flow load test สร้าง partial uploads หลายร้อยอัน ไม่มีอันใดเสร็จสมบูรณ์ (การทดสอบไม่ได้ออกแบบให้ทำเสร็จ แค่ทดสอบ initiation endpoint) 340 incomplete uploads นั่งอยู่ใน S3 แต่ละอันแทน partial data ที่ AWS กำลังเก็บและคิดเงิน

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom พูด เขาไม่ได้ถามหาข้อมูล เขากำลังคำนวณออกเสียง

ขนาดรวมของ incomplete parts: 48 GB ที่ $0.023/GB: $1.10/เดือน เป็นเวลาแปดเดือน: $8.80 ใช้ไปแล้ว

ที่อัตราการเติบโตปัจจุบัน ถ้าไม่ถูกล้าง: ดำเนินต่อไปอย่างไม่มีกำหนด

"Leo" Tom พูด

"ผม deploy มันแล้ว — โอ้" Leo พูด เดินมา "load test ผมลืมล้าง partial uploads"

"แปดเดือนก่อน"

"ผมไม่รู้ว่า S3 เก็บ parts แม้ว่าการอัปโหลดไม่เคยเสร็จ"

"มันเก็บพวกมัน มันคิดค่าพวกมัน และไม่มี dashboard เตือนคุณเกี่ยวกับมัน พวกมันแค่สะสม"

วิธีแก้: lifecycle rule เพื่อลบ incomplete multipart upload parts หลัง 7 วัน

```
Rule: ลบ incomplete multipart upload parts
Prefix: (objects ทั้งหมด)
Action: ลบ incomplete multipart uploads หลัง 7 วัน
```

340 uploads ที่มีอยู่ถูกล้างด้วยตนเอง lifecycle rule รับประกันว่าไม่มี load tests หรือ failed uploads ในอนาคตสะสมในแบบเดียวกัน $1.10/เดือน ที่ก่อตัวขึ้นอย่างเงียบๆ เป็นเวลาแปดเดือนหยุด — เล็กในแง่ดอลลาร์ แต่รูปแบบ (มองไม่เห็น เติบโต ไม่มีเพดาน) คือส่วนที่ควรค่าแก่การกำจัด

"rule มีสามบรรทัด" Tom พูด "ผมควรตั้งมันบนทุก bucket ตอนสร้าง" เขาอัปเดต bucket creation checklist: ทุก S3 bucket ใหม่ได้ multipart upload cleanup rule โดยค่าเริ่มต้น

**สามชั้นความปลอดภัย: ทบทวนสั้นๆ ก่อนการแยกทาง**

"แล้วถ้ามีคนพยายามเจาะเข้ามาและลบ audit logs ล่ะ?" Priya ถามอีกครั้ง — ครั้งนี้ในบริบทของ threat model เฉพาะ "ไม่ใช่แค่ lifecycle rule ที่ตั้งค่าผิด แต่เป็น malicious insider IAM key ที่ถูกบุกรุกพร้อม write access"

ทีมมีคำตอบอยู่แล้ว — พวกเขาแค่ยังไม่ได้นำมาใช้กับ bucket นี้ สามชั้น แต่ละชั้นครอบคลุมไปก่อนหน้านี้ในเล่ม แต่ละชั้นจัดการ threat vector ที่แตกต่างกัน:

**Versioning** (บทที่ 5) ทำให้การลบย้อนกลับได้ — DELETE กลายเป็น delete marker และเวอร์ชันก่อนหน้ายังคง restore ได้ สำหรับข้อมูล write-once เช่นใบเสร็จออร์เดอร์ storage overhead น้อยมาก: มีเพียงหนึ่งเวอร์ชันต่อ object เท่านั้น

**S3 Object Lock** (บทที่ 5) ทำให้ objects immutable จริงๆ — WORM storage ที่แม้แต่ admin key ก็ลบไม่ได้ในระหว่าง retention period สำหรับใบเสร็จ ด้วยความต้องการ tax retention 7 ปี ทีมเลือก Compliance mode: ไม่มี lifecycle misconfiguration ไม่มี IAM mistake ไม่มี compromised credential ใดที่ลบพวกมันได้ก่อนผู้ตรวจสอบจะถาม และ Object Lock อยู่ร่วมกับ lifecycle transitions ได้ — rule ที่ย้ายใบเสร็จไป Glacier Deep Archive ยังทำงาน; ข้อมูลถูกลงและยังคง immutable

**CloudTrail S3 data events** (บทที่ 16-17) บอกคุณว่าอะไรเกิดขึ้นกับข้อมูล: ทุก GET, PUT, DELETE และ COPY ถูก log พร้อมว่าใคร จากที่ไหน และเมื่อไร — วัตถุดิบที่ GuardDuty (บทที่ 17) ใช้เพื่อแจ้งเตือนเกี่ยวกับ anomalies

"Versioning สำหรับการกู้คืนอุบัติเหตุ Object Lock สำหรับ compliance immutability CloudTrail สำหรับ forensics" Priya สรุป "เราครอบคลุมแต่ละอันด้วยตัวเอง การตัดสินใจใหม่วันนี้คือการเปิดทั้งสามสำหรับ bucket นี้"

**Cross-Region Replication: Order Records เป็น Disaster Recovery**

Nimbus order receipts bucket อยู่ใน us-west-2 นั่นเป็นความตั้งใจ — us-west-2 คือที่ที่แอปพลิเคชันทำงาน แต่ "แอปพลิเคชันอยู่ใน us-west-2" และ "order records ทั้งหมดอยู่ใน us-west-2 เท่านั้น" เป็น risk profiles ที่แตกต่างกัน

ถ้า Nimbus ต้องเปิดใช้ disaster recovery site ใน us-east-1, order records จะต้องอยู่ที่นั่นด้วย การรอที่จะคัดลอกพวกมันกลางช่วง regional failure ไม่ใช่แผนการกู้คืน

Priya แนะนำ **Cross-Region Replication (CRR)** สำหรับ order receipts bucket rule:

```
Source: nimbus-order-receipts (us-west-2)
Destination: nimbus-order-receipts-dr (us-east-1)
Replication: objects ทั้งหมด
Storage class ใน destination: S3 Standard-IA (ถูกกว่า — นี่คือ DR copy ไม่ค่อยเข้าถึง)
```

กลไกคุ้นเคยจากบทที่ 5: asynchronous replication ของ writes ใหม่ (objects ส่วนใหญ่ภายใน 15 นาที; SLA ที่รับประกันต้องจ่ายค่า **S3 Replication Time Control**), versioning จำเป็นบนทั้งสอง buckets, IAM role พร้อมสิทธิ์ read-source/write-destination รายละเอียดที่ควรสังเกตใน rule ข้างบน: destination ใช้ *storage class ที่แตกต่าง* จาก source — Standard-IA สำหรับ DR copy แทนที่จะจ่ายค่า Standard copy ที่สองที่ไม่ค่อยถูกอ่าน และข้อกำหนด versioning ไม่มีค่าใช้จ่ายเพิ่ม — พวกเขาเปิด versioning สำหรับการกู้คืนอุบัติเหตุอยู่แล้ว (พี่น้องของ CRR, **Same-Region Replication (SRR)**, คัดลอก objects ระหว่าง buckets ใน region *เดียวกัน* — มีประโยชน์สำหรับ compliance copy ใน account แยก, log aggregation หรือ test environments ที่ seed จาก production data)

มีกับดักหนึ่งที่ Priya ชี้ก่อนที่ใครจะเจอมัน: replication **ไม่ย้อนหลัง** Objects ที่มีอยู่แล้วใน bucket เมื่อคุณเปิด rule จะไม่ถูก replicate — มีแค่ writes ใหม่ ทีมเปิด CRR โดยคาดหวังว่าข้อมูลที่มีอยู่ทั้งหมดจะปรากฏใน destination แล้วค้นพบว่า DR bucket แทบจะว่างเปล่า สำหรับ objects ที่มีอยู่ก่อน คุณรัน **S3 Batch Replication** ซึ่งเป็น operation แยกต่างหากที่ใช้ replication rules กับ objects ที่อยู่ที่นั่นแล้ว Nimbus รันมันครั้งเดียวเพื่อ seed DR bucket ด้วยใบเสร็จ 0.8 TB ที่มีอยู่

"แล้ว delete markers ล่ะ?" Priya ถาม "ถ้ามีคนลบใบเสร็จใน us-west-2 มัน replicate การลบไปยัง us-east-1 ไหม?"

โดยค่าเริ่มต้น ไม่ — ใน replication configurations ปัจจุบัน (V2 schema ที่ console สร้าง) **delete markers ไม่ถูก replicate** มีคนลบใบเสร็จใน us-west-2 และ us-east-1 copy ยังคงให้บริการมันราวกับว่าไม่มีอะไรเกิดขึ้น ถ้าคุณ*ต้องการ*ให้ DR bucket mirror การลบ คุณเปิด delete marker replication อย่างชัดเจนบน rule (ไม่รองรับบน rules ที่มี tag filters) — นั่นเป็นค่าเริ่มต้นใน legacy V1 schema ซึ่งเอกสารเก่ายังคงอธิบาย ไม่ว่าทางใด lifecycle expirations ไม่เคย replicate delete markers ของพวกมัน

อย่างไรก็ตาม replication ยัง *ไม่ใช่* โซลูชัน backup — ด้วยเหตุผลตรงข้าม: มันไม่ป้องกัน permanent version deletions หรือ malicious overwrites ที่ replicate ไปยัง mirror และมันไม่มี retention semantics สำหรับ backup ที่แท้จริง จับคู่ versioning กับ Object Lock หรือใช้ AWS Backup

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถาม

Storage สำหรับ 0.8 TB ใน S3 Standard-IA ใน us-east-1: $10.00/เดือน บวก replication data transfer (คิดต่อ GB ที่ transfer ข้าม region): น้อยมากที่ปริมาณ write ปัจจุบัน ต้นทุนเพิ่มเติมรวม: ราว $10-11/เดือน สำหรับสำเนา cross-region ที่สมบูรณ์ของ order records ทั้งหมด

Tom จดสิ่งนี้ไว้โดยไม่บ่น

**S3 Storage Lens: เห็นภาพรวมทั้งหมด**

Tom ทำ audit ของเขาด้วยตนเอง — เปิด AWS console ทีละ bucket รันคำสั่ง AWS CLI เพื่อนับ objects ตรวจสอบ billing explorer สำหรับ storage costs ตาม bucket ใช้เวลาเกือบทั้งบ่ายในการสร้าง spreadsheet นั้น

**S3 Storage Lens** คือเครื่องมือ AWS ที่แทนที่กระบวนการด้วยตนเองนั้น มันให้ visibility ทั่วทั้งองค์กรเข้าสู่การใช้ S3 และ activity ข้าม buckets ทั้งหมด accounts ทั้งหมด และ regions ทั้งหมด — ใน dashboard เดียว

metrics ที่สำคัญที่สุดสำหรับ cost optimization:

**Non-current version bytes**: storage เท่าไรที่ถูกบริโภคโดยเวอร์ชันเก่า (เมื่อเปิด versioning) Versioning จำเป็นสำหรับความปลอดภัย แต่ถ้าเอกสารถูกอัปเดตบ่อย เวอร์ชันเก่าสะสม lifecycle rule เพื่อ expire non-current versions หลัง 30 วันป้องกัน version bloat

**Incomplete multipart upload bytes**: ปัญหาที่ Leo ก่อขึ้นกับ load test พอดี เผยให้เห็นโดยอัตโนมัติ หากไม่มี Storage Lens, Tom ต้องรู้ที่จะมองหา incomplete multipart uploads ด้วย Storage Lens พวกมันปรากฏใน dashboard เป็น line item

**% requests returning 403**: spike ใน 403 (Forbidden) responses บน bucket ที่ควรเข้าถึงได้สาธารณะอาจบ่งชี้ bucket policy ที่ตั้งค่าผิด spike บน private bucket อาจบ่งชี้ scanning หรือ probing attempt ไม่ว่าทางใด มันเป็นสัญญาณที่ควรค่าแก่การสืบสวน

**Average object size**: bucket ของ objects เล็ก (เฉลี่ย 2KB) ทำงานแตกต่างจาก bucket ของ objects ใหญ่ (เฉลี่ย 50MB) ในแง่ของ Intelligent-Tiering economics, request costs และ query performance สำหรับ Athena

S3 Storage Lens มี free tier ที่ครอบคลุม metrics ที่จำเป็น advanced metrics (request statistics, lens groups สำหรับ filtering) มีค่าใช้จ่ายเพิ่มต่อล้าน objects ต่อเดือน — เล็กเมื่อเทียบกับการประหยัดที่มันเปิดให้

"ทำไมเราไม่ใช้สิ่งนี้ตั้งแต่แรก?" Maya ถาม

"เราไม่มี 4.2 เทราไบต์ตั้งแต่แรก" Tom พูด "ที่ scale เล็ก spreadsheet ใช้ได้ ที่ scale นี้ ตัว scale เองกลายเป็นข้อโต้แย้งสำหรับเครื่องมือ"

นี่คือธีมที่เกิดซ้ำในสถาปัตยกรรม Nimbus: เครื่องมือที่ถูกต้องสำหรับ scale หนึ่งไม่ใช่เครื่องมือที่ถูกต้องสำหรับ scale ถัดไปเสมอ S3 Storage Lens ควรค่าแก่การตั้งค่าทันทีที่การใช้ S3 ของคุณเติบโตเกินกว่าที่คุณสามารถ audit ด้วยตนเองได้ในหนึ่งบ่าย — ซึ่งคือราวๆ ตอนที่การประหยัดที่มันเปิดให้เริ่มเกินเวลาที่มันประหยัดอย่างมีความหมาย

## จุดแข็งและข้อจำกัด

**ทำไม S3 storage tiers จึงสำคัญ**:

- ลดต้นทุนอย่างมีนัยสำคัญโดยไม่เสียสละความทนทานหรือความพร้อมใช้สำหรับสิ่งที่ถูกเข้าถึงจริง
- Lifecycle policies ทำให้กระบวนการทั้งหมดเป็นอัตโนมัติ — ไม่มี operational burden
- S3 Intelligent-Tiering ขจัดความจำเป็นในการคาดเดารูปแบบการเข้าถึง

**จุดที่ซับซ้อน**:

- ค่า minimum storage duration นำมาใช้กับ Glacier classes (90 วันสำหรับ Glacier Instant, 180 วันสำหรับ Deep Archive) — การลบเร็วยังคงเกิด minimum charge
- ค่าดึงข้อมูลอาจทำให้คุณประหลาดใจถ้าคุณเข้าถึงข้อมูลที่ archive บ่อย
- Lifecycle transitions ใช้เวลา — objects ไม่ถูกย้ายทันทีหลัง rule ทำงาน
- Intelligent-Tiering เพิกเฉยต่อ objects ต่ำกว่า 128KB — ไม่มีค่า แต่ก็ไม่มี tiering; และ lifecycle rules ข้ามพวกมันโดยค่าเริ่มต้นเว้นแต่คุณ override minimum object size

## สรุป

การ automate workflow จากบทที่ 22 ปรับปรุงวิธีที่ Nimbus ประมวลผล requests บทนี้ปรับปรุงสิ่งที่ Nimbus จ่ายสำหรับข้อมูลที่กำลังเก็บแต่ไม่เข้าถึง หลักการเหมือนกัน: หยุดจ่ายค่า tier ที่ผิด

- S3 มีแปด storage classes: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — บวก Express One Zone (low-latency เฉพาะทาง, single AZ)
- **Lifecycle policies** ทำให้การเปลี่ยนระหว่าง storage classes เป็นอัตโนมัติตามอายุ — กำหนดครั้งเดียว S3 จัดการมันตลอดไป
- **S3 Intelligent-Tiering** ย้าย objects ระหว่าง tiers โดยอัตโนมัติตามรูปแบบการเข้าถึงจริง — ใช้สำหรับ workloads ที่คาดเดาไม่ได้พร้อม objects ที่ใหญ่กว่า 128KB Objects ที่เล็กกว่าไม่ถูก monitor หรือ auto-tier (และไม่จ่าย monitoring fee) — พวกมันอยู่ใน Frequent Access tier
- **Glacier retrieval** ต้องการ restore request สำหรับ Flexible และ Deep Archive tiers วางแผนเวลาดึงข้อมูล (นาทีถึง 12 ชั่วโมง) ก่อน archive ข้อมูลใดที่มี SLA สำหรับการดึงข้อมูล
- **Incomplete multipart uploads** สะสมอย่างเงียบๆ และเกิด storage charges เพิ่ม lifecycle rule เพื่อลบ incomplete parts หลัง 7 วันบนทุก bucket
- **สามชั้นความปลอดภัย**: versioning (deletes ที่ย้อนกลับได้), Object Lock (immutability สำหรับ compliance), CloudTrail data events (forensics และ anomaly detection)
- **Cross-Region Replication (CRR)**: replicate order records ไปยัง DR region โดยอัตโนมัติ ต้องการ versioning บนทั้งสอง buckets ตั้งค่าว่า delete markers replicate หรือไม่ตามว่า DR copy เป็น mirror หรือ backup
- **Multipart upload** จำเป็นสำหรับ objects > 5GB และแนะนำสำหรับอะไรก็ตาม > 100MB
- **S3 Object Lock** ให้ WORM storage สำหรับ compliance scenarios — Governance mode admins override ได้; Compliance mode ใครก็ override ไม่ได้

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.1)*

- **สัญญาณการเลือก storage class**:
  - "เข้าถึงบ่อย" → Standard
  - "เข้าถึงครั้งต่อเดือน ต้องการการดึงข้อมูลทันที" → Standard-IA
  - "ทนเวลาดึงข้อมูลหลายชั่วโมงได้ ไม่ค่อยเข้าถึง" → Glacier Flexible Retrieval
  - "regulatory compliance, เก็บ 7+ ปี, ไม่เคยเข้าถึง" → Glacier Deep Archive
  - "รูปแบบการเข้าถึงไม่รู้หรือเปลี่ยนแปลง" → Intelligent-Tiering
- **patterns ข้อสอบ lifecycle policy**: "ลด storage costs โดยอัตโนมัติเมื่อข้อมูลเก่าลง," "เปลี่ยนเป็น archive หลัง 90 วัน" → lifecycle policies
- **Intelligent-Tiering และ objects เล็ก**: objects ต่ำกว่า 128KB ไม่ถูก monitor ไม่จ่าย monitoring fee และไม่เคย auto-tier — พวกมันอยู่ใน Frequent Access lifecycle rules ก็ข้าม objects ต่ำกว่า 128KB โดยค่าเริ่มต้น (override ได้) ข้อสอบอาจทดสอบข้อใดข้อหนึ่ง
- **ความต้องการ CRR**: ต้องเปิด Versioning บนทั้ง source และ destination buckets Source และ destination ต้องอยู่ใน regions ที่แตกต่างกัน
- **S3 Object Lock**: "WORM," "immutable," "SEC 17a-4," "ลบหรือแก้ไขไม่ได้" → Object Lock Governance mode (admins override ได้) Compliance mode (ใครก็ override ไม่ได้ รวมถึง root)
- **Glacier restore**: Objects ใน Glacier ไม่พร้อมใช้ทันที คุณต้อง "restore" สำเนาไปยัง S3 Standard เพื่อเข้าถึง สำเนาที่ restore เป็นชั่วคราว (คุณตั้งระยะเวลา) ตัวต้นฉบับยังคงอยู่ใน Glacier

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — ทบทวน**

อธิบายความแตกต่างระหว่าง S3 Standard-IA และ S3 Glacier Instant Retrieval รูปแบบการเข้าถึงใดทำให้แต่ละตัวเหมาะสม?

*(คำใบ้: ลองนึกถึงว่าคุณจะเข้าถึงข้อมูลบ่อยแค่ไหนและคุณต้องการมันเร็วแค่ไหนเมื่อคุณเข้าถึง)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทหนึ่งสร้าง application logs 500GB ต่อวัน Logs ถูก query อย่างหนักในช่วง 7 วันแรก (debugging และ monitoring) หลัง 7 วัน logs ไม่ค่อยถูกเข้าถึงแต่ต้องพร้อมใช้ภายใน 30 นาทีถ้าจำเป็น หลัง 1 ปี logs ต้องถูกเก็บสำหรับ compliance แต่ไม่เคยถูกเข้าถึง บริษัทต้องลด storage costs ให้น้อยที่สุดในขณะที่ตอบสนองความต้องการเหล่านี้

S3 lifecycle policy ใดตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) เก็บใน S3 Standard เป็นเวลา 7 วัน; เปลี่ยนเป็น S3 Glacier Deep Archive หลัง 7 วัน; expire หลัง 365 วัน  
B) เก็บใน S3 Standard เป็นเวลา 7 วัน; เปลี่ยนเป็น S3 Standard-IA หลัง 7 วัน; เปลี่ยนเป็น S3 Glacier Flexible Retrieval หลัง 365 วัน  
C) เก็บ logs ทั้งหมดใน S3 Intelligent-Tiering ตั้งแต่วันแรก  
D) เก็บใน S3 Standard เป็นเวลา 7 วัน; เปลี่ยนเป็น S3 Glacier Instant Retrieval หลัง 7 วัน; เปลี่ยนเป็น S3 Glacier Deep Archive หลัง 365 วัน

**คำใบ้ 1**: "พร้อมใช้ภายใน 30 นาที" ตัด storage class ใดออก?

**คำใบ้ 2**: Deep Archive ใช้เวลา 12 ชั่วโมงในการดึงข้อมูล — ไม่ตอบสนองความต้องการ 30 นาทีสำหรับวัน 7-365

**คำใบ้ 3**: หลัง 365 วัน เวลาดึงข้อมูลไม่สำคัญ (ไม่เคยเข้าถึง) ดังนั้นตัวเลือกที่ถูกที่สุดนำมาใช้

**คำตอบ**: D

**คำอธิบาย**: S3 Standard เป็นเวลา 7 วันจัดการการเข้าถึงบ่อย Glacier Instant Retrieval ให้การเข้าถึงระดับมิลลิวินาทีสำหรับวัน 7-365 — ตอบสนองความต้องการ 30 นาทีที่ต้นทุนต่ำกว่า Standard-IA อย่างมาก หลัง 365 วัน Glacier Deep Archive เป็นตัวเลือกที่ถูกที่สุดสำหรับข้อมูลที่ไม่เคยเข้าถึง

**ทำไมไม่ใช่ A?** Glacier Deep Archive ใช้เวลา 12 ชั่วโมงในการดึงข้อมูล — ไม่ตอบสนองความต้องการ "พร้อมใช้ 30 นาที" สำหรับวัน 7-365

**ทำไมไม่ใช่ B?** Standard-IA ไม่สามารถเป็นจุดแรกที่นี่ได้ด้วยซ้ำ: S3 ต้องการให้ objects มีอายุ 30 วันใน Standard ก่อนที่ lifecycle rule จะเปลี่ยนพวกมันไปยัง Standard-IA หรือ One Zone-IA ได้ — ดังนั้น "Standard-IA หลัง 7 วัน" เป็น rule ที่ไม่ถูกต้อง (กฎ 30 วันไม่นำมาใช้กับ Glacier classes ซึ่งเป็นเหตุผลพอดีที่ D ทำงาน) และแม้จะละเรื่องนั้นไป Glacier Instant Retrieval ก็ถูกกว่ามากสำหรับข้อมูลที่ไม่ค่อยถูกเข้าถึงหลังวัน 7

**ทำไมไม่ใช่ C?** Intelligent-Tiering มี monitoring fee ต่อ object และอาจไม่ย้าย logs ไปยัง archive tiers อย่างก้าวร้าวเท่า explicit lifecycle rules สำหรับ logs ปริมาณมากที่มีรูปแบบการเข้าถึงที่คาดเดาได้ explicit lifecycle rules คุ้มค่ากว่า

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.1*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus มีข้อมูล S3 สามประเภทที่มีลักษณะแตกต่างกัน:

- รูปภาพร้านอาหาร: อัปโหลดครั้งเดียว เข้าถึงหลายครั้งโดยลูกค้า ไม่เคยลบ
- ใบเสร็จออร์เดอร์: เข้าถึงโดยลูกค้าในเดือนแรก เก็บ 7 ปีเพื่อวัตถุประสงค์ทางภาษี
- analytics exports: สร้างรายวัน วิเคราะห์ในสัปดาห์ถัดไป เก็บ 2 ปี

ออกแบบ lifecycle policy สำหรับแต่ละอัน สำหรับรูปภาพร้านอาหาร Intelligent-Tiering สมเหตุสมผลไหม? สำหรับใบเสร็จออร์เดอร์ storage class ใดครอบคลุมหน้าต่าง 1 เดือนถึง 7 ปี? สำหรับ analytics exports คุณจะโครงสร้าง bucket อย่างไรเพื่อใช้ policies ที่แตกต่างกันกับ prefixes ที่แตกต่างกัน?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกการเลือก storage tier สำหรับข้อมูลในโลกจริง)*

## ฉากหลังเครดิต

Tom นำ lifecycle policies ไปใช้

Leo ช่วยตั้งค่า rule แรก "มันจะไม่เป็นไรหรอก" เขาพูด "minimum storage duration นำมาใช้เฉพาะถ้าเราลบเร็ว — และเราไม่ลบอะไร" เขาตรวจสอบความต้องการ Glacier minimum duration กลางคัน "จริงๆ แล้ว ขอผมอ่านนี่ใหม่"

บน bucket อื่น — temporary analytics staging exports — เขาเกือบรวมการเปลี่ยน 30 วันไป Glacier Instant Retrieval กับ rule expiration 60 วัน minimum storage duration สำหรับ Glacier Instant คือ 90 วัน: objects เหล่านั้นจะเข้า Glacier ที่วัน 30 และถูกลบที่วัน 60 และ S3 จะยังคงคิดค่า 90 วันเต็มสำหรับทุกตัว — จ่ายราคา archive สำหรับ storage ที่ไม่มีอยู่อีกต่อไป เขาทิ้งการเปลี่ยน Glacier สำหรับ bucket นั้นทั้งหมด; ข้อมูลที่ถูกลบที่ 60 วันไม่เคยอยู่นานพอที่จะ amortize minimum 90 วัน receipts policy ปลอดภัยตามที่ออกแบบ: เปลี่ยนเป็น Standard-IA ที่ 90 วัน, Glacier Instant Retrieval ที่ 365 วัน, Glacier Flexible Retrieval ที่ 540 วัน, Glacier Deep Archive ที่ 2,555 วัน

เขายังตั้ง multipart upload cleanup rule บนทุก bucket ไม่ใช่เพราะมี abandoned uploads มากขึ้น — ไม่มี — แต่เพราะมันจะมี Load tests เกิดขึ้น Deployments ล้มเหลวกลางคัน rule ถูกกว่า memory ที่ต้องใช้ในการจำที่จะล้างด้วยตนเอง

บิล S3 ลดจาก $847 เป็น $198 ในเดือนถัดไป

เขาพิมพ์การเปรียบเทียบและวางไว้บนโต๊ะของ Maya โดยไม่พูดอะไร

Maya มองมัน แล้วมองที่วันที่ แล้วมองที่ Tom

"สามสัปดาห์" เธอพูด

"หนึ่งบ่ายในการออกแบบ policies" เขาพูด "หนึ่งชั่วโมงในการนำไปใช้ สามสัปดาห์ในการเห็น billing cycle เต็มแรก"

"ลด S3 costs สามในสี่"

"สำหรับข้อมูลที่เราไม่เข้าถึง"

"แล้ว cross-region replication ล่ะ?" Leo ถาม

"สิบดอลลาร์ต่อเดือนมากขึ้น" Tom พูด "สำหรับสำเนาที่สมบูรณ์ของทุกใบเสร็จออร์เดอร์ใน region ที่สอง"

"นั่นคือการตัดสินใจ disaster recovery ที่ถูกที่สุดที่เราเคยทำ"

Maya มองตัวเลขอีกครั้ง

"Tom" เธอพูด "ฉันอยากให้คุณทำ review นี้สำหรับทุก AWS service ที่เราใช้ Storage, compute, networking หาความสูญเปล่า"

เขากลับมาที่โต๊ะของเขาแล้ว

"ผมเริ่มเมื่อสัปดาห์ที่แล้ว" เขาพูด

ในบทต่อไป: ชั้นฐานข้อมูลมีการสนทนาเวอร์ชันของตัวเอง และ Aurora คือคำตอบที่ Tom ไม่คาดว่าจะชอบ
