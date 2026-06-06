# บทที่ 30: ต้นทุนที่ซ่อนอยู่

Tom มีไวท์บอร์ดในห้องประชุมที่มีสามคอลัมน์: compute, storage, networking สองอันแรกถูกเติมแล้ว — ตัวเลข วันที่ ชื่อของการ optimize ที่เสร็จสิ้น เขายืนอยู่หน้าไวท์บอร์ดครู่หนึ่งก่อนที่จะเขียนอะไรในคอลัมน์ที่สาม บรรทัด networking บนบิล AWS กระจายทั่วหน้าในแบบที่อันอื่นไม่เป็น แต่ละอันมีชื่อต่างกัน หน่วยต่างกัน เหตุผลที่ต่างกันว่าทำไมเงินถึงออกไป

เขาเปิดฝาปากกามาร์กเกอร์

**ย้อนความ: สิ่งที่ไม่รู้สุดท้ายบนบิล**

การตรวจสอบฐานข้อมูลปิดรายการสำคัญสุดท้ายที่ Tom กำลังทำงานอยู่ — $491/เดือนที่กู้คืน $5,892 ต่อปี เพิ่ม EC2 Savings Plans, S3 lifecycle policies และการทำความสะอาด storage และยอดรวมที่กำลังเดินอยู่คือ $34,092 ในการประหยัดรายปีตลอดสามเดือนของการทำงาน แต่ Tom สังเกต ระหว่างการเจาะลึกฐานข้อมูล ว่ามีหนึ่งหมวดหมู่ที่แทบไม่ได้ถูกตรวจสอบ ค่า storage แสดงเป็นบรรทัดเดียว: "S3: $198" ค่า compute แสดงเป็นบรรทัดเดียว: "EC2: $2,340" — ก่อนที่ส่วนลด Savings Plan จากบทที่ 27 จะลงมา ค่า networking กระจายอยู่ในรายการกว่าสิบบรรทัดที่มีชื่อเช่น "Data Transfer Out", "NAT Gateway Processing", "VPC Peering Data Transfer" และ "CloudFront Data Transfer" เขาไม่เคยรวมมันและดูผลรวม นั่นคืองานของวันนี้

Tom ดึงบิลขึ้นมา หาส่วน data transfer รวมรายการทั้งหมด

ค่า networking ใน AWS เหมือนระบบ toll ของเมือง: การขับรถเข้าเมืองฟรี แต่ทุก tunnel ที่คุณใช้ขาออกมีค่าใช้จ่าย และการขับระหว่างย่านต่างๆ ก็มีค่าใช้จ่ายเล็กน้อยด้วย คนส่วนใหญ่ไม่คิดถึง tolls จนกว่าจะได้รับบิลปลายเดือนและตระหนักว่าพวกเขาผ่าน tunnel ทุกวันเมื่อมีถนนผิวดินฟรีตลอดเวลา เป้าหมายของบทนี้คือการเข้าใจทุกด่าน toll — และตัดสินใจว่าอันไหนคุ้มค่ากับการจ่าย

$847/เดือน

"เราใช้จ่าย $847 ต่อเดือนกับ data transfer" เขาพูด

"มากไหม?" Leo ถาม

"มากเท่ากับบิล S3 ของเราก่อนที่เราจะ optimize มันพอดี และผมไม่รู้ด้วยซ้ำว่าเรามีบิล data transfer ขนาดนี้"

Maya มองมา "Data transfer คืออะไรกันแน่?"

"คือสิ่งที่ AWS คิดค่าใช้จ่ายสำหรับการเคลื่อนย้าย bytes ไปรอบๆ Bytes เข้า AWS: โดยทั่วไปฟรี Bytes ออกจาก AWS ไปยัง internet: คิดค่าบริการ Bytes ระหว่างบริการใน regions ต่างกัน: คิดค่าบริการ Bytes ที่ผ่าน NAT Gateway: คิดค่าบริการ"

"คุณแยกรายการได้ไหม?"

Tom ทำได้ แต่คราวนี้เขาไม่หยุดที่ billing console เขาเปิด VPC Flow Logs ทั่วทุก VPCs ของพวกเขาและป้อนเข้า CloudWatch Logs Insights สิ่งนี้ช่วยให้เขา query traffic flows จริง — ไม่ใช่แค่จำนวนเงิน แต่แหล่งใดส่งข้อมูลไปที่ไหน และมากแค่ไหน

Query ใช้เวลาสองนาทีในการรัน ผสมกับแหล่ง log อีกหนึ่งที่เขาจะดึงเข้ามาในไม่ช้า output เฉพาะพอที่จะลงมือทำ

**การวิเคราะห์ Traffic: อะไรกำลังสร้างบิลจริงๆ**

ห้า traffic flows สูงสุดตามปริมาณ ตามลำดับ:

1. EC2 application servers → NAT Gateway → AWS services (SSM, Secrets Manager, CloudWatch, SQS): 3.9TB/เดือน
2. EC2 application servers → NAT Gateway → external APIs: 1.3TB/เดือน
3. Aurora reader endpoint → EC2 application servers (cross-AZ): 0.4TB/เดือน
4. Analytics pipeline → S3 bucket ใน us-east-1 (cross-region): 0.3TB/เดือน
5. CloudFront → S3 origin (cache misses): 0.2TB/เดือน

สี่อันแรกออกมาจาก Flow Logs โดยตรง อันที่ห้าไม่สามารถ: VPC Flow Logs เห็นเฉพาะ traffic ที่ข้าม network interfaces ภายใน VPCs ของคุณ และ CloudFront cache miss ที่ดึงจาก S3 ไม่เคยแตะ VPC เลย — มันคือ CloudFront คุยกับ S3 โดยตรง สำหรับ flow นั้น Tom ดึง CloudFront standard access logs และกรองบน field `x-edge-result-type`: ทุก entry ที่ทำเครื่องหมาย `Miss` คือ request ที่ CloudFront ต้องดึงจาก origin และการรวม bytes ให้เขา 0.2TB หนึ่งบิล สองเครื่องมือ — แต่ละอันมองไม่เห็นสิ่งที่อีกอันเห็น

"Flow หมายเลขสี่" Priya พูด "ทำไม analytics pipeline ของเราถึงคุยกับ bucket ใน us-east-1?"

Leo มีสีหน้าที่ Tom จำได้

"ผม deploy มันไปแล้ว — โอ๊ะ" Leo พูด "หกเดือนก่อนผมกำลังทดสอบว่า analytics pipeline ของเราสามารถ fan out ไปยังหลาย regions พร้อมกันได้ไหม ผมสปิน test bucket ขึ้นใน us-east-1 ชี้ pipeline ไปที่มัน และรันมันหนึ่งสัปดาห์ การทดสอบจบแต่ผมลืมลบ us-east-1 destination ออกจาก pipeline config"

"ดังนั้นเป็นเวลาห้าเดือน" Tom พูด "เราเขียนสำเนาของทุก analytics result ไปยัง bucket ในเวอร์จิเนีย"

"มันมีค่าใช้จ่ายต่อเดือนเท่าไหร่?" Tom ถาม

Cross-region transfer จาก us-west-2 ไป us-east-1: $0.02/GB 300GB/เดือน = $6/เดือนสำหรับการ transfer บวกค่า S3 storage สำหรับข้อมูลซ้ำใน us-east-1: 300GB × 5 เดือน × $0.023/GB = $34.50 ในข้อมูลที่จัดเก็บ

"ไม่มาก" Leo พูด

"ไม่มากต่อเดือน" Tom พูด "แต่มันรันมาห้าเดือนและไม่มีใครรู้ มันคือต้นทุนที่ไม่ตั้งใจ คำถามไม่ใช่ว่า $6 สำคัญไหม — มันคือว่าเรารู้ไหมว่าทำไมทุกดอลลาร์ถึงถูกใช้ไป"

Leo ลบ us-east-1 test bucket และลบ destination ออกจาก pipeline configuration

ข้อค้นพบที่ลงมือทำได้มากที่สุดใน flow log output คือ flow หมายเลขหนึ่ง: EC2 application servers เรียก AWS services ผ่าน NAT Gateway

Tom ดึง log entries เฉพาะสำหรับ CloudWatch Logs Insights query กรองให้แสดงเฉพาะ traffic ที่มุ่งไปยัง AWS service IP ranges:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

Output แสดงบางอย่างที่เขาไม่ได้คาดคิด: ราว 300 GB ต่อเดือนของ same-region S3 traffic — แยกจาก cross-region flow ไปยัง us-east-1 bucket ของ Leo — กำลังผ่าน NAT Gateway แต่ Tom กำหนดค่า S3 Gateway Endpoints ไปแล้วหลายเดือนก่อน

"เรามี S3 Gateway Endpoint" Leo พูด "ทำไม S3 traffic ยังผ่าน NAT?"

Tom ดูที่ route table Gateway Endpoint ถูกกำหนดค่า — แต่เฉพาะสำหรับ application VPC analytics pipeline รันใน VPC แยกต่างหากที่ถูกสร้างเมื่อเก้าเดือนก่อนสำหรับ data isolation VPC นั้นไม่มี S3 Gateway Endpoint ทุก S3 call จาก EC2 instances ของ analytics pipeline route ผ่าน NAT Gateway ของ VPC นั้น

"0.3TB ของ analytics pipeline traffic × $0.045/GB = $13.50/เดือน" Tom พูด "แค่จาก endpoint ที่หายไปใน VPC ที่สอง"

"การเพิ่ม endpoint จะมีค่าใช้จ่ายเท่าไหร่?" Leo ถาม

"ศูนย์" Tom พูด "S3 Gateway Endpoints ฟรี มันคือ route table entry"

การเพิ่ม Gateway Endpoint ให้ analytics VPC จะใช้เวลาสี่นาทีและตัด $13.50 จากค่า NAT Gateway รายเดือน — ตัวเลขสัมบูรณ์ที่เล็ก แต่ข้อค้นพบคือหลักการ พวกเขาเพิ่มการควบคุมต้นทุนใน VPC หนึ่งและลืมทำซ้ำเมื่อพวกเขาสร้าง VPC ที่สอง ความสอดคล้องต้องการกระบวนการ ไม่ใช่แค่ความรู้

Tom เพิ่มใน deployment checklist: เมื่อสร้าง VPC ใหม่ ให้เพิ่ม S3 และ DynamoDB Gateway Endpoints ก่อนแนบ workloads ใดๆ

ข้อค้นพบเฉพาะที่สองจาก flow logs แพงกว่า Traffic จาก Lambda functions ที่รัน order notification system — S3 access สำหรับการอ่าน restaurant configuration files — กำลังผ่าน NAT Gateway แทน S3 endpoint Lambda functions รันภายใน VPC (สำหรับ RDS access) และ S3 endpoint ของ VPC ถูกกำหนดค่าเฉพาะสำหรับ EC2 instances ใน application subnet Lambda functions ใน Lambda subnet route ผ่าน NAT

"เดี๋ยว — แต่ *ทำไม* เราถึงทำแบบนั้น?" Maya ถาม "เรามี endpoint ทำไม Lambda ไม่ใช้มัน?"

"VPC Gateway Endpoints ใช้ต่อ subnet ตาม route tables" Tom พูด "Lambda functions อยู่ใน subnet ของตัวเองพร้อม route table ของตัวเอง route table นั้นไม่มี endpoint route ผมเพิ่มมันสำหรับ application subnet ผมพลาด Lambda subnet"

การเพิ่ม S3 endpoint route ให้ Lambda subnet route table จะประหยัดอีก $41/เดือนในค่า NAT Gateway processing ที่คิดสำหรับ S3 calls ที่ควรจะฟรี

การวิเคราะห์ flow log คุ้มค่าตัวเองแล้ว สามชั่วโมงของเวลา query สามข้อค้นพบที่เป็นรูปธรรม: analytics VPC endpoint ที่ถูกลืม ($13.50/เดือน) ช่องว่าง routing ของ Lambda subnet ($41/เดือน) และข้อค้นพบใหญ่ดั้งเดิมที่กลายเป็นพื้นฐานของการตัดสินใจ Interface Endpoint การประหยัดรายเดือนเพิ่มเติมทั้งหมดที่ระบุโดยการวิเคราะห์ flow log: $54.50 บวกกับ $78 จาก Interface Endpoints ที่การวิเคราะห์ได้เปิดเผยไปแล้ว สองการแก้ไขที่เล็กกว่านั้นเข้า backlog สำหรับ sprint ถัดไป; ตารางการประหยัดท้ายบทนี้นับเฉพาะสิ่งที่ส่งมอบแล้ว

"บทเรียนคือ VPC endpoints ไม่ใช่การกำหนดค่าครั้งเดียว" Tom พูด "ทุก VPC ใหม่ ทุก subnet ใหม่ ทุก workload type ใหม่ต้องการการตรวจสอบเดียวกัน ค่าเริ่มต้นสำหรับอะไรก็ตามใน private subnet คือ route ผ่าน NAT การตรวจสอบคือ: workload นี้เรียก S3, DynamoDB หรือ AWS services ที่มี traffic สูงใดๆ ไหม? ถ้าใช่ มันมี endpoint route ไหม?"

"เราคิดถึงการ automate การตรวจสอบนั้นไหม?" Priya ถาม "AWS Config rule ที่แจ้งเตือนเมื่อ private subnet ถูกสร้างโดยไม่มี S3 endpoint route?"

"มันอยู่ในรายการ" Tom พูด "ถัดจาก orphaned volume alert"


และด้วยสิ่งนั้น Tom มีคำตอบสำหรับคำถามที่เริ่มต้นการวิเคราะห์ ค่า networking ไม่ใช่ปัญหาเดียว มันคือห้าปัญหาที่ต่างกัน แต่ละอันมีวิธีแก้ที่ต่างกัน

**วิธีที่ AWS คิดค่า Data Transfer**

AWS data transfer pricing ไม่สมมาตร:

**เข้า AWS (inbound)**: ฟรี คุณสามารถ upload ข้อมูลได้มากเท่าที่ต้องการ

**ออกจาก AWS ไปยัง internet (outbound)**: คิดค่าบริการ 100GB/เดือนแรกฟรี หลังจากนั้น:

- $0.09/GB สำหรับ 10TB/เดือนแรก (US regions)
- $0.085/GB สำหรับ 40TB ถัดไป
- ต่ำกว่าที่ volume สูง

**ภายใน Availability Zone เดียวกัน**: ฟรี EC2 instances ที่คุยกันใน AZ เดียวกันไม่มีค่าใช้จ่าย

**ระหว่าง Availability Zones (region เดียวกัน)**: $0.01/GB ในแต่ละทิศทาง ค่าใช้จ่ายเล็กน้อยแต่มีจริง

**ระหว่าง Regions**: $0.02-0.08/GB ขึ้นอยู่กับ regions Traffic ข้าม region แพงกว่าอย่างมีนัยสำคัญ

**NAT Gateway**: $0.045/GB ที่ประมวลผล ทุก byte ที่ EC2 instance ส่วนตัวของคุณส่งผ่าน NAT Gateway เพื่อเข้าถึง internet — และทุก byte ที่กลับมา — ถูกคิดค่าบริการ

**CloudFront**: อัตรา data transfer ต่ำกว่าการส่งข้อมูล AWS-to-internet โดยตรง $0.085/GB สำหรับ 10TB แรก (ถูกกว่า data transfer out โดยตรงเล็กน้อย) CloudFront มักลดต้นทุน transfer รวมเพราะ edge caching หมายความว่า origin ให้บริการข้อมูลน้อยลง

**การแยกรายการของ Tom**

"มันมีค่าใช้จ่ายต่อเดือนเท่าไหร่?" Tom ถาม สำหรับแต่ละรายการตามลำดับ เขาเพิ่มพวกมันในแท็บแยกต่างหากใน spreadsheet — ไม่ใช่ยอดรวมรายเดือน แต่แต่ละหมวดหมู่ที่แยกออกมา ยอดรวมมีประโยชน์น้อยกว่าการเข้าใจว่าส่วนใดของบิลคือต้นทุนชนิดใด

หลังจากจัดหมวดหมู่ทุกรายการ:

**Outbound data ไปยัง internet**: $214/เดือน

- API responses ไปยังลูกค้าทั่วโลก
- Assets ที่ยังให้บริการตรงจาก S3 และ ALB ไปยัง clients ข้าม CloudFront (cache fills เอง — CloudFront ดึงจาก AWS origin — ฟรี: AWS ยกเว้น origin-to-CloudFront transfer)

**NAT Gateway processing**: $289/เดือน

- Application servers เรียก external APIs (payment processor, email service, map data)
- DynamoDB calls ผ่าน NAT Gateway (ก่อนที่จะตั้ง VPC endpoints สำหรับบาง tables)

**Cross-AZ data transfer**: $178/เดือน

- Load balancer ไปยัง EC2 instances (load balancer อยู่ใน AZ หนึ่ง บาง instances อยู่ใน AZ อื่น)
- Application server ไปยัง RDS read replica (ใน AZ อื่น)

**Cross-region data transfer**: $166/เดือน

- Aurora Global Database replication (primary ใน us-west-2, reader ใน us-east-1)
- S3 Cross-Region Replication สำหรับ backups
- Test pipeline ที่ถูกลืมของ Leo ($6/เดือนของยอดรวมนี้)

**NAT Gateway: ความประหลาดใจที่ใหญ่ที่สุด**

ค่า NAT Gateway processing $289/เดือนเป็นรายการที่ใหญ่ที่สุด และการวิเคราะห์ VPC Flow Log ทำให้มันเฉพาะ: ผู้ใช้สูงสุดคือ application servers เรียก AWS service APIs (SSM, Secrets Manager, CloudWatch Logs) ผ่าน NAT Gateway

ในบทที่ 11 Tom ตั้ง VPC Gateway Endpoints สำหรับ S3 และ DynamoDB ซึ่งฟรี แต่เขาลืมตั้ง Interface Endpoints สำหรับบริการอื่นๆ อีกหลายอัน:

- Systems Manager (SSM) สำหรับการจัดการ patch
- Secrets Manager สำหรับการดึง credential
- CloudWatch สำหรับการส่ง metric และ log
- SQS สำหรับการ polling message

ทุก call ไปยังบริการเหล่านี้จาก EC2 instances ส่วนตัวกำลังผ่าน NAT Gateway แต่ละ call คิด $0.045/GB

คุณอาจสงสัยว่าทำไม AWS ถึงคิดค่า traffic ที่ผ่าน NAT Gateway เมื่อคุณอยู่ภายในเครือข่าย AWS อยู่แล้ว คำตอบคือ NAT Gateway เองเป็น managed service — มันมีค่าใช้จ่ายในการรัน และ AWS ส่งต่อต้นทุนนั้นต่อกิกะไบต์ VPC Endpoints ขจัดตัวกลาง ซึ่งเป็นเหตุผลที่พวกมันลดบิล

"เดี๋ยว — แต่ *ทำไม* เราถึงทำแบบนั้น?" Maya ถามเมื่อ Tom แสดงตัวเลข "เราตั้ง Gateway Endpoints สำหรับ S3 และ DynamoDB ทำไมเราไม่ทำแบบเดียวกันสำหรับ SSM และ CloudWatch?"

"Gateway Endpoints มีให้เฉพาะสำหรับ S3 และ DynamoDB" Tom พูด "สำหรับทุกอย่างอื่น — SSM, Secrets Manager, SQS — คุณต้องการ Interface Endpoints พวกมันไม่ฟรี แต่ถูกกว่าการ route ผ่าน NAT ที่ volume ที่เรากำลังสร้าง"

**Interface Endpoints** สำหรับบริการเหล่านี้: $0.01/ชั่วโมงต่อ AZ + $0.01/GB ข้อมูลที่ประมวลผล

ที่ volume ของ Nimbus SSM Interface Endpoint จะมีค่าใช้จ่ายประมาณ $25/เดือน (ค่ารายชั่วโมงบวกการประมวลผลต่อ GB) และประหยัดประมาณ $45/เดือนจากค่า NAT Gateway (เพราะ SSM สร้างปริมาณข้อมูลมากสำหรับการจัดการ patch และ parameter store calls)

ต้นทุนและการประหยัดของ Endpoint ต่างกันตาม service และ volume Tom คำนวณว่าการตั้ง Interface Endpoints สำหรับสี่บริการที่มี traffic สูง — สอง AZs แต่ละอัน บวก $0.01/GB processing บน 3.9TB ที่พวกมันจะแบก — จะมีค่าใช้จ่ายประมาณ $97/เดือนรวมและประหยัดประมาณ $176/เดือนจากค่า NAT Gateway processing

ประหยัดสุทธิ: $78/เดือนจากการตั้ง endpoint เพียงอย่างเดียว

"แล้วถ้ามีคนพยายามเจาะเข้ามาล่ะ?" Priya พูด เมื่อการสนทนา VPC endpoint หันไปยังการ implement "VPC endpoint หมายความว่า traffic ไม่เคยแตะ public internet — นั่นไม่ใช่แค่ต้นทุน นั่นคือการลด threat surface เราควรทำสิ่งนี้เพื่อประโยชน์ด้านความปลอดภัยเพียงอย่างเดียว"

"เห็นด้วย" Tom พูด "การประหยัดต้นทุนเป็นโบนัส"

Leo ดูรายการบริการที่ route ผ่าน NAT "ผมอาจตั้ง CloudWatch logging endpoints โดยไม่ตรวจสอบว่ามี VPC endpoint สำหรับมันไหม" เขาพูด "มันจะโอเคสำหรับตอนนี้ — แต่ใช่ มันผ่าน NAT มาหกเดือน"

"นั่นอยู่ในรายการ" Tom พูด "CloudWatch คือหนึ่งในสี่ที่เรากำลังแก้"

**การคำนวณ PrivateLink: เมื่อมันสมเหตุสมผล**

มีเวอร์ชันที่ซับซ้อนกว่าของการสนทนานี้ที่ปรากฏขึ้นเมื่อสถาปัตยกรรมเติบโต: การใช้ AWS PrivateLink เพื่อให้การเชื่อมต่อส่วนตัวไปยังบริการที่ hosted โดยลูกค้า AWS รายอื่น (หรือบริการของคุณเองใน VPCs อื่น)

PrivateLink Interface Endpoints มีค่าใช้จ่าย $0.01/ชั่วโมงต่อ AZ บวก $0.01/GB สำหรับบริการที่สร้าง 1TB/เดือนของ traffic ผ่าน endpoint:

- ค่า PrivateLink: $0.01 × 2 AZs × 730 ชั่วโมง + $0.01 × 1,000GB = $14.60 + $10 = $24.60/เดือน
- การ route traffic เดียวกันผ่าน NAT Gateway ที่มีอยู่แทน: $0.045 × 1,000GB = $45/เดือนของค่า processing ส่วนเพิ่ม

การเปรียบเทียบเป็น *ส่วนเพิ่ม* เพราะ NAT Gateway อยู่ทั้งสองทาง — มันยังให้บริการ traffic ที่มุ่ง internet ที่เหลือ ดังนั้นค่ารายชั่วโมงของมัน ($0.045 × 2 × 730 = $65.70) ไม่หายไปเมื่อบริการหนึ่งนี้ย้ายไป endpoint สำหรับ traffic volume นี้ PrivateLink ประหยัดประมาณ $20/เดือน จุดคุ้มทุนอยู่ราว 420GB/เดือน — ต่ำกว่านั้น ค่ารายชั่วโมงของ endpoint เองมากกว่าการประหยัดต่อ GB เมื่อเทียบกับ NAT processing

"เดี๋ยว — แต่ *ทำไม* เราถึงใช้ PrivateLink แทนแค่ VPN หรือ peering?" Maya ถาม

"VPC Peering ง่ายกว่าและฟรีสำหรับ transfers ภายใน region" Tom พูด "แต่ peering สร้างการเชื่อมต่อแบบ fully routed ระหว่าง VPCs — อะไรก็ตามใน VPC A อาจเข้าถึงอะไรก็ตามใน VPC B ได้ PrivateLink แม่นยำกว่า endpoint เปิดเผยบริการเฉพาะ ไม่ใช่ full network route สำหรับสถาปัตยกรรมที่ใส่ใจความปลอดภัย ความเฉพาะเจาะจงนั้นสำคัญ"

"แล้วถ้ามีคนพยายามเจาะเข้ามาใน VPC ที่ peered ล่ะ?" Priya ถาม "Full peering หมายความว่า instance ที่ถูก compromise ใน VPC หนึ่งมี route ไปยังทุก instance ใน VPC ที่ peered"

"นั่นคือข้อโต้แย้งสำหรับ PrivateLink เหนือ peering เมื่อคุณเชื่อมต่อกับ third-party service หรือบริการที่เป็นของทีมแยกต่างหาก" Tom พูด "Peering สำหรับ VPCs ภายในบริษัทที่เชื่อถือได้ PrivateLink สำหรับอะไรก็ตามที่คุณต้องการการเชื่อมต่อที่เปิดเผยน้อยที่สุด"

**Cross-AZ Traffic: คำถามด้านสถาปัตยกรรม**

ค่า cross-AZ data transfer $178/เดือนยุ่งยากกว่า

บางส่วนหลีกเลี่ยงไม่ได้: load balancer กระจาย traffic ข้าม AZs ดังนั้น requests บางอันเกิดใน AZ หนึ่งและ load balancer ส่งต่อไปยัง instance ใน AZ อื่น

บางส่วน optimize ได้: แอปพลิเคชันถูกกำหนดค่าให้เขียนไปยัง RDS primary (ใน us-west-2a) และอ่านจาก read replica (ใน us-west-2b) ทุก read query ข้าม AZ boundaries

สำหรับการอ่าน วิธีแก้ไขหนึ่ง: กำหนดค่าแอปพลิเคชันให้ prefer read replica ใน AZ เดียวกันกับ instance ที่ส่ง request แต่ละ AZ จะมี read replica ของตัวเอง Traffic อยู่ในท้องถิ่น

การแลกเปลี่ยน: read replicas มากขึ้น = ค่าใช้จ่ายมากขึ้น ถ้าค่า cross-AZ traffic คือ $50/เดือนและ read replica เพิ่มเติมมีค่าใช้จ่าย $190/เดือน การ optimize แบบ AZ-local ไม่คุ้มค่า

Tom คำนวณ: ที่ query volume ปัจจุบันของพวกเขา cross-AZ traffic มีเพียง $31/เดือนของ $178 ไม่คุ้มค่าที่จะเพิ่ม replicas

ค่า cross-AZ อื่นๆ คือ load balancer routing และการสื่อสาร service-to-service ซึ่งหลีกเลี่ยงไม่ได้ส่วนใหญ่ในระดับสถาปัตยกรรมปัจจุบัน

"นี่คือหนึ่งในกรณีที่การเข้าใจต้นทุนไม่ได้หมายความว่าคุณควรแก้ไขมัน" Tom พูด

"ค่าใช้จ่ายในการขจัด cross-AZ traffic ทั้งหมดจะเป็นเท่าไหร่?" Maya ถาม

"ทุกอย่างใน AZ เดียวเอาชนะวัตถุประสงค์ของ Multi-AZ นั่นคือการประหยัด $31/เดือนแลกกับการสูญเสีย high availability"

"ดังนั้นเราปล่อยมันไว้" เธอพูด

"เราปล่อยมันไว้"

**S3 Select: ลด Data Transfer ใน Queries**

ขณะทบทวน analytics pipeline Tom พบการ optimize อีกอันเฉพาะกับวิธีที่ทีม analytics กำลัง query ไฟล์ S3 ขนาดใหญ่

รูปแบบ: ทุกเช้า analytics job ดาวน์โหลดไฟล์ Parquet ขนาด 500MB จาก S3 เพื่อกรองมันใน memory สำหรับข้อมูลคำสั่งซื้อเฉพาะร้านอาหาร ราว 95% ของไฟล์ถูกทิ้งหลังจากดาวน์โหลด

**S3 Select** ช่วยให้คุณดึงเฉพาะ rows และ columns ที่ต้องการจาก S3 object (CSV, JSON, Parquet) แทนที่จะดาวน์โหลดไฟล์ทั้งหมดเพื่อกรองใน application ของคุณ

> **อัปเดตสำคัญ**: ในกลางปี 2024 AWS หยุดเสนอ S3 Select ให้ลูกค้าใหม่ — ผู้ใช้ที่มีอยู่ยังเก็บมันไว้ แต่มันเป็นทางตันสำหรับสถาปัตยกรรมใหม่ หลักการที่ส่วนนี้สอน (กรองที่ storage layer อย่าส่งไฟล์ทั้งหมด) เป็นนิรันดร์; เครื่องมือสมัยใหม่สำหรับมันคือ **Amazon Athena** (SQL โดยตรงเหนือ S3 รวมถึง joins และ aggregations ที่ S3 Select ไม่เคยมี) **S3 Object Lambda** ซึ่งเคยเป็นทางเลือกอื่น ตาม S3 Select เข้าสู่สถานะ legacy: ณ วันที่ 7 พฤศจิกายน 2025 มันปิดสำหรับลูกค้าใหม่ด้วย (workloads ที่มีอยู่ยังรันต่อ) ในข้อสอบปัจจุบัน "query ข้อมูลในที่บน S3" ชี้ไปยัง Athena เรื่องราวด้านล่างถูกเก็บรักษาไว้เพราะ *เหตุผล* — วัดก่อน ย้าย filter ไปยังข้อมูล — คือบทเรียน

ไม่มี S3 Select:
```python
# Download ไฟล์ 500MB ประมวลผลใน memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

มี S3 Select:
```python
# ให้ S3 กรองก่อน transfer เฉพาะ rows ที่ตรงกัน (~2MB แทน 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select ลดข้อมูลที่ย้ายจาก S3 ไปยัง application ของคุณ สำหรับไฟล์ขนาดใหญ่ที่มี selective queries อาจลดปริมาณข้อมูลได้ 10-100 เท่า — และเนื่องจาก analytics instance รันใน region เดียวกับ bucket การชนะไม่ใช่บิล transfer (same-region S3-to-EC2 transfer ฟรี): มันคือ compute, memory และเวลาที่ใช้ดาวน์โหลดและกรองข้อมูลที่คุณโยนทิ้งทันที

Tom ยกมันขึ้นกับทีม analytics พวกเขาคัดค้านในตอนแรก

"เรารู้วิธีเขียน pandas อยู่แล้ว" analyst คนหนึ่งพูด

"นี่ไม่ใช่เรื่อง pandas" Tom พูด "มันคือเรื่องความจริงที่ว่าคุณกำลังดาวน์โหลด 500MB เพื่อได้ข้อมูล 2MB การดาวน์โหลดเองฟรี — region เดียวกัน — แต่ instance ไม่ฟรี คุณรันนี้สำหรับทุกร้านอาหาร: 287 ร้านอาหาร 287 queries 140GB ที่ดึงและกรองใน pandas ทุกคืน นั่นคือสิ่งที่ทำให้ analytics box ยุ่งสองชั่วโมง — และนั่นคือเหตุผลที่มันเป็น xlarge"

"แล้ว S3 Select?"

"S3 Select คิด $0.002 ต่อ GB ที่ scan และ $0.0007 ต่อ GB ที่ส่งกลับ — ราวหนึ่งในสิบของหนึ่งเซ็นต์ต่อ query เพื่อแลก instance รับ 600MB ต่อคืนแทน 140GB งานเสร็จในไม่กี่นาที และ box สามารถลดขนาดได้"

"นั่นคือ $450 ต่อเดือน" analyst พูด หลังจากทำคณิตศาสตร์ instance — การประมาณการคร่าวๆ จากอัตรารายชั่วโมงของ instance และชั่วโมงที่มันใช้ทำงาน

"นั่นคือเหตุผลที่ผมอยู่ที่นี่" Tom พูด ตัวเลขจริงจะกลายเป็นต่ำกว่า — เมื่อ Tom ดึง compute spend จริงที่เกิดจาก nightly job ในภายหลัง มันออกมาเป็น $202/เดือน ไม่ใช่ $450 คณิตศาสตร์บนกระดาษเช็ดมือหาปัญหา; การวัดกำหนดขนาดมัน

Tom ยกมันขึ้นกับ Leo ก่อน ก่อนนำทีม analytics เข้ามาในการสนทนา เขารู้ว่า Leo จะคัดค้าน และเขาต้องการเข้าใจการคัดค้านก่อนที่มันจะกลายเป็นการอภิปรายระดับห้อง

"S3 Select จะประหยัด $180/เดือนบน analytics pipeline queries" Tom พูด

"นั่นต้องการการเขียน query ทุกอันใหม่" Leo พูด

"มันต้องการการเปลี่ยน data access pattern จาก 'ดาวน์โหลดและกรอง' เป็น 'query ผ่าน S3 Select API'"

"ซึ่งคือการเขียนใหม่"

"มันคือการเปลี่ยน client library calls" Tom พูด "Query logic — filtering expressions — ยังคงเดิม สิ่งที่เปลี่ยนคือที่ที่ filtering เกิดขึ้น ปัจจุบัน: EC2 ด้วย S3 Select: S3"

"ผมอ่าน S3 Select docs แล้ว" Leo พูด "คุณทำ joins ไม่ได้ คุณทำ aggregations ที่ซับซ้อนกว่า SUM และ COUNT พื้นฐานไม่ได้ บาง analytics queries ของเราซับซ้อนกว่านั้น"

"ผมรู้" Tom พูด "ซึ่งเป็นเหตุผลที่ผมไม่ได้เสนอ S3 Select สำหรับทุก query ผมเสนอมันสำหรับ restaurant-specific daily summary queries นั่นคือไฟล์ Parquet 500MB ที่กรองด้วย restaurant_id ดึงสองคอลัมน์ Query นั้นคือ filter-and-project ล้วน S3 Select คือเครื่องมือที่ถูกต้องพอดีสำหรับกรณีนั้น"

Leo เงียบไปครู่หนึ่ง เขาดึง query ที่เป็นปัญหาขึ้นมา

```python
# ปัจจุบัน: ดาวน์โหลด 500MB กรองใน memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"เวอร์ชัน S3 Select จะเป็นอะไร — select_object_content call?"

"ใช่" Tom พูด "คุณจะแทนที่ read_parquet call ด้วย select_object_content call ที่ push WHERE clause ไปยัง S3 ผลกลับมากรองแล้ว คุณได้ stream ของ records ที่ตรงกันแทน Parquet file ทั้งไฟล์"

"และผมต้องจัดการ response ต่างออกไป"

"Response format คือ CSV โดยค่าเริ่มต้น คุณต้องการ wrapper เล็กๆ เพื่อ parse มันกลับเป็น DataFrame หรือคุณใช้ Parquet output format ถ้าคุณต้องการเก็บ parsing logic ปัจจุบัน"

Leo ดูมัน "นั่นเป็นงานเท่าไหร่?"

"ครึ่งวัน" Tom พูด "อาจหนึ่งวันถ้าคุณต้องการทดสอบมันอย่างละเอียดทั่ว 287 restaurant IDs ใน nightly batch"

"สำหรับ $180/เดือน"

"$2,160 ต่อปี" Tom พูด "และวิธีการขยายได้ ที่ 2,000 ร้านอาหาร query เดียวกันบนไฟล์ขนาดเดียวกันมีค่าใช้จ่ายมากกว่าโดยไม่มี S3 Select คุณกำลังลงทุนหนึ่งวันวันนี้เพื่อหลีกเลี่ยงปัญหาที่ใหญ่กว่ามากในภายหลัง"

Leo ปิด notebook "Queries ที่ S3 Select ไม่ทำงาน — aggregation queries, cross-restaurant comparisons — พวกนั้นอยู่เหมือนเดิม?"

"พวกนั้นอยู่เหมือนเดิม" Tom ยืนยัน "ผมไม่ได้พยายามเขียน analytics pipeline ใหม่ ผมพยายามหยุดการดาวน์โหลด 500 MB เพื่อใช้ 2 MB ของมัน"

"โอเค" Leo พูด "ผมจะทำมันสัปดาห์นี้"

เขาทำ การ implement ใช้เวลาหกชั่วโมง เขาห่อ S3 Select call ใน utility function ที่ตรงกับ interface เดียวกับ read_parquet call ที่มีอยู่ — calling code ใน nightly batch ไม่ต้องการการเปลี่ยนแปลงใดๆ เลย เฉพาะ data access layer เปลี่ยน

เดือนถัดมา บิล compute รายคืนของ analytics pipeline ลดจาก $202 เหลือ $22 — งานเสร็จในไม่กี่นาทีแทนที่จะเป็นชั่วโมง บน instance ที่เล็กกว่า การประหยัด $180/เดือนมีค่าใช้จ่ายหกชั่วโมงของเวลาวิศวกรรม คิดเป็นรายปี นั่นคือผลตอบแทน 1,800% ของการลงทุนเวลา

"ส่วนที่ผมต่อต้าน" Leo พูด ในการ review รายเดือน "คือการเขียนใหม่ มันกลายเป็นการแทนที่ function ไม่ใช่การเขียนใหม่ ผมกำลังแก้ปัญหาที่จินตนาการขึ้น"

"นั่นน่าจดบันทึก" Tom พูด "เมื่อคุณกำลังประเมินว่าจะ implement การ optimize หรือไม่ ให้เฉพาะเจาะจงเกี่ยวกับว่างานคืออะไรจริงๆ 'ต้องเขียน queries ใหม่' คือเวอร์ชันที่จินตนาการ 'ต้องเปลี่ยน data access function' คือเวอร์ชันจริง"


**"ต้นทุนที่ตั้งใจ vs ไม่ตั้งใจ"**

ที่จุดสิ้นสุดของการวิเคราะห์ networking สามสัปดาห์ Tom นำการแยกรายการทั้งหมดกลับมายังทีม เขามีคอลัมน์ใหม่ใน spreadsheet: "ตั้งใจ?" พร้อม yes หรือ no สำหรับแต่ละรายการ

"นั่นคือกรอบที่ผมใช้ตอนนี้" เขาพูด "ไม่ใช่แค่ 'มันมีค่าใช้จ่ายเท่าไหร่' แต่ 'เราตัดสินใจที่จะใช้จ่ายสิ่งนี้ไหม?'"

"ต้นทุนที่ตั้งใจคืออะไร?" Maya ถาม

"Aurora Global Database replication เราตัดสินใจ replicate ไป us-east-1 เพราะเรามีพาร์ทเนอร์ร้านอาหารที่ฝั่งตะวันออก นั่นคือ $120/เดือนใน cross-region replication — ราวสองเท่าของการประมาณการคร่าวๆ จากวัน DR planning เราเลือกต้นทุนนั้นด้วยเหตุผลเฉพาะ"

"แล้วไม่ตั้งใจ?"

"Analytics pipeline ของ Leo ที่เขียนไป us-east-1 ห้าเดือนหลังจากการทดสอบจบ ไม่มีใครเลือกนั่น มันกำลังเกิดขึ้นเพราะไม่มีใครเฝ้าดู"

"แล้วค่า NAT Gateway สำหรับ AWS service calls?"

"อยู่ตรงกลาง" Tom พูด "เราไม่ได้ตัดสินใจอย่างชัดเจนที่จะ route SSM ผ่าน NAT Gateway — นั่นคือค่าเริ่มต้น เราไม่รู้ว่ามีตัวเลือกที่ถูกกว่า นั่นตั้งใจไหม? เราเลือก เราแค่ไม่รู้ว่าเรากำลังเลือกอะไร"

"นั่นคือหมวดหมู่ที่อันตรายที่สุด" Priya พูด "การตัดสินใจที่คุณไม่รู้ว่าคุณกำลังทำ"

"ซึ่งเป็นเหตุผลที่การวิเคราะห์ VPC Flow Logs สำคัญ" Tom พูด "มันทำให้สิ่งที่มองไม่เห็นมองเห็นได้ ทุก byte ที่ข้าม boundary ตอนนี้มีเรื่องราวที่เราติดตามได้"

"เราคิดถึงสิ่งที่จะเกิดขึ้นถ้าเราปล่อยให้สิ่งนี้ drift อีกครั้งไหม?" Priya ถาม "เราทำการวิเคราะห์ครั้งเดียว ในหกเดือน Leo จะสร้าง test bucket อีกอันที่ไหนสักแห่ง"

"ผมจะอยู่ตรงนี้" Leo พูด "ผมจะทำมันใน eu-west-1 ครั้งหน้าเพื่อให้อย่างน้อยมันมีค่าใช้จ่ายมากกว่าต่อ GB และคุณสังเกตเร็วกว่า"

"การ review VPC Flow Log รายเดือน" Tom พูด "ผมจะเพิ่มมันใน quarterly cost review ถ้าเราเห็น cross-region flow ใหม่หรือ NAT Gateway spike เราติดตามมันก่อนบิลถัดไป"

**ความผันแปร: การแลกเปลี่ยนที่คุณยอมรับ**

ถ้าคุณขจัด cross-AZ traffic โดยรันทุกอย่างใน Availability Zone เดียว คุณประหยัดประมาณ $31/เดือนที่ volume ปัจจุบันของ Nimbus — แต่คุณสูญเสีย Multi-AZ redundancy ที่มีค่ามากกว่านั้นในความเสี่ยง incident การสนทนาต้นทุนที่มีวุฒิภาวะไม่ใช่เรื่องการหาการประหยัดเสมอ; บางครั้งมันคือเรื่องการเข้าใจว่าคุณกำลังจ่ายเพื่ออะไรกันแน่และตัดสินใจว่ามันคุ้มค่า

ค่า cross-AZ คือราคาของความยืดหยุ่น ค่า networking บางอย่างเป็นข้อผูกมัดด้านสถาปัตยกรรม ไม่ใช่ความไม่มีประสิทธิภาพ

การเชื่อมโยง SAA-C03: ข้อสอบมักนำเสนอสถานการณ์ที่ "การ optimize ต้นทุน" จะขจัด redundancy คำตอบที่ถูกต้องมักคือการรักษา redundancy และ optimize ที่อื่น — รู้ความแตกต่างระหว่างการสูญเปล่าและต้นทุนของความน่าเชื่อถือ

**CloudFront: ส่วนลด Data Transfer**

นี่คือข้อเท็จจริงที่ขัดกับสามัญสำนึก: การให้บริการข้อมูลผ่าน CloudFront โดยทั่วไปถูกกว่าการให้บริการโดยตรงจาก EC2 หรือ S3

**EC2 โดยตรงไปยัง internet**: $0.09/GB
**CloudFront ไปยัง internet**: $0.085/GB (ถูกกว่าเล็กน้อย)

แต่การประหยัดจริงไม่ใช่อัตราต่อ GB — มันคือ CloudFront caches ข้อมูลที่ edge locations ถ้าผู้ใช้ 1,000 คนขอรูปภาพเมนูเดิม:

- **ไม่มี CloudFront**: 1,000 requests ออกจาก S3 โดยตรงไปยัง internet × ขนาดรูปภาพ × $0.09/GB
- **มี CloudFront**: clients ได้รูปภาพจาก edge ที่อัตรา CloudFront ($0.085/GB) และ cache fill — CloudFront ดึงจาก S3 ใน 1 miss — **ฟรี** (AWS ยกเว้น origin-to-CloudFront transfer; คุณจ่ายเฉพาะ origin GET requests)

สำหรับ Nimbus ที่มี cache hit rate 83% (จากบทที่ 13) 83% ของ requests ไม่เคยแตะ origin เลย — origin requests น้อยกว่า origin load น้อยกว่า และทุก byte ถูกคิดที่อัตรา edge แทนอัตรา internet ของ S3

"CloudFront ไม่ใช่แค่ CDN สำหรับประสิทธิภาพ" Tom พูด "มันยังเป็นการ optimize ต้นทุนสำหรับ data transfer ด้วย"

Leo ดูท่าทีที่คิดอยู่ "เราควรย้ายการส่ง static content ทั้งหมดผ่าน CloudFront แม้สำหรับ assets ที่ไม่ sensitive ต่อ latency"

"ถูกต้อง ถ้าผู้ใช้กำลัง download มันจาก AWS มันควรผ่าน CloudFront"

**การ Optimize Networking ทั้งหมด**

หลังจากสามสัปดาห์ของการวิเคราะห์และการ implement:

| รายการต้นทุน                                    | ก่อน      | หลัง      | ประหยัดต่อเดือน |
|-------------------------------------------------|-----------|-----------|-----------------|
| NAT Gateway (Interface Endpoints)               | $289      | $211      | $78             |
| CloudFront optimization (ย้าย assets มากขึ้น)   | $214      | $147      | $67             |
| Cross-AZ traffic (ยอมรับตามที่เป็นอยู่)         | $178      | $178      | $0              |
| Cross-region traffic (test bucket ของ Leo)      | $166      | $160      | $6              |
| **รวม**                                         | **$847**  | **$696**  | **$151/เดือน**  |

$151/เดือน $1,812/ปีจากการประหยัดค่า networking ปานกลางเมื่อเทียบกับ compute และ storage แต่มีความหมาย

สำคัญกว่า: ตอนนี้ Tom เข้าใจทุกบรรทัดของ networking bill เขาสามารถอธิบายแต่ละต้นทุนและตัดสินใจอย่างมีสติว่าจะ optimize อันไหนและยอมรับอันไหน ความแตกต่างระหว่างต้นทุนที่ตั้งใจและไม่ตั้งใจตอนนี้ชัดเจนและมีเอกสาร

## จุดแข็งและข้อจำกัด

**ค่า NAT Gateway**:

- ปริมาณข้อมูลมากผ่าน NAT Gateway สะสมอย่างรวดเร็ว
- VPC Endpoints ขจัดค่า NAT บางส่วนได้อย่างสมบูรณ์
- ตรวจสอบว่า instances ส่วนตัวของคุณเรียกบริการใดและมี endpoints ให้ใช้หรือไม่

**CloudFront สำหรับต้นทุน**:

- Cache hit rate กำหนดการประหยัดต้นทุนโดยตรง
- Cache hit rate สูง = origin requests น้อยกว่าและ origin load น้อยกว่า บวกกับ bytes มากขึ้นที่คิดที่อัตรา viewer-side ที่ถูกกว่าของ CloudFront (origin-to-CloudFront transfer จาก AWS origins ไม่ถูกคิดเลย)
- ย้ายการส่ง static asset ทั้งหมดผ่าน CloudFront

**การแลกเปลี่ยน Cross-AZ**:

- การขจัด cross-AZ traffic โดยทั่วไปต้องการการเปลี่ยนแปลงสถาปัตยกรรมที่มีค่าใช้จ่ายสูงกว่าการประหยัด
- คำนวณอย่างรอบคอบก่อน optimize

**S3 Select** (legacy — ไม่มีให้ลูกค้าใหม่ตั้งแต่ปี 2024; ใช้ Athena แทน S3 Object Lambda ก็เป็น legacy ตอนนี้ — ปิดสำหรับลูกค้าใหม่ ณ พฤศจิกายน 2025 workloads ที่มีอยู่ไม่ได้รับผลกระทบ):

- หลักการยังคงอยู่: กรองที่ storage layer แทนการดาวน์โหลด S3 objects ขนาดใหญ่ — การประหยัดปรากฏใน compute time, instance size และ job duration (same-region S3 transfer ฟรีอยู่แล้ว)
- ไม่ช่วยเมื่อคุณต้องการไฟล์ทั้งหมด

## สรุป

Tom ปิดการวิเคราะห์ networking ด้วยตัวเลขบนไวท์บอร์ดและความเข้าใจที่ชัดเจนขึ้นว่าสิ่งที่ไม่รู้สุดท้ายบนบิลคืออะไรจริงๆ ค่า networking $847/เดือนไม่ใช่ความลึกลับของความไร้ความสามารถ — มันคือต้นทุนที่คาดหวังของระบบกระจายที่ครอบคลุม availability zones ให้บริการผู้ใช้ทั่วโลก และ replicate ข้อมูลข้าม regions ส่วนใหญ่คุ้มค่ากับการจ่าย บางส่วนไม่ใช่ ความก้าวหน้าสำคัญคือการสามารถบอกได้ว่าอันไหนเป็นอันไหน

- AWS คิดค่าบริการสำหรับ **outbound data** (internet: ประมาณ $0.09/GB), **cross-AZ traffic** ($0.01/GB แต่ละทิศทาง), **cross-region traffic** ($0.02-0.08/GB) และ **NAT Gateway processing** ($0.045/GB)
- **Inbound data** ฟรี **Same-AZ traffic** ฟรี
- **VPC Flow Logs** เปิดเผยว่า traffic flows เฉพาะใดภายใน VPCs ของคุณกำลังสร้างแต่ละหมวดหมู่ต้นทุน — จำเป็นสำหรับการ optimize แบบเจาะจง Flows ที่ไม่เคยข้าม VPC network interface (เช่น CloudFront ดึงจาก S3 origin) ต้องการเครื่องมือของตัวเอง: CloudFront standard logs หรือ S3 server access logs
- **VPC Gateway Endpoints** (S3, DynamoDB): ฟรี ขจัดค่า NAT Gateway สำหรับบริการเหล่านี้
- **VPC Interface Endpoints**: ราคาต่อชั่วโมงบวกต่อ GB ถูกกว่า NAT Gateway สำหรับบริการที่มี volume สูง
- **CloudFront** ให้บริการข้อมูลในอัตราที่ต่ำกว่าการส่ง EC2-to-internet โดยตรงและลด transfer volume จาก origin อย่างมากผ่าน caching
- คำถามที่สำคัญไม่ใช่แค่ "เท่าไหร่" แต่ "ต้นทุนนี้ตั้งใจไหม?" ต้นทุนที่ไม่ตั้งใจ — test pipelines ที่ถูกลืม, routing เริ่มต้นผ่าน NAT — คือที่ที่การประหยัดจริงซ่อนอยู่

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.4)*

- **NAT Gateway vs VPC Endpoints**: สถานการณ์สอบ: "EC2 ใน private subnet เรียก S3/DynamoDB บ่อยๆ จะลดค่า NAT Gateway ได้อย่างไร?" → VPC Gateway Endpoints (ฟรีสำหรับ S3 และ DynamoDB)
- **กฎ data transfer pricing**:
  - เข้า AWS: ฟรี
  - Same-AZ: ฟรี
  - Cross-AZ: คิดค่าบริการ
  - Cross-region: คิดค่าบริการ (อัตราสูงกว่า)
  - Internet: คิดค่าบริการ (อัตราสำคัญ)
- **CloudFront เป็นการ optimize ต้นทุน**: "ลดค่า data transfer สำหรับการส่งเนื้อหาทั่วโลก" → CloudFront ชั้น cache ลด requests จาก origin
- **S3 Transfer Acceleration**: เร่ง uploads *ไปยัง* S3 โดยใช้ CloudFront edge locations ค่าใช้จ่ายสูงกว่า S3 มาตรฐาน ใช้สำหรับลูกค้าที่ upload ไฟล์ขนาดใหญ่จากสถานที่ที่ห่างไกลทางภูมิศาสตร์
- **ค่า cross-region replication**: การ replicate ข้อมูลข้าม regions มีค่า data transfer คิดค่าบริการ สำหรับ S3 CRR คุณจ่ายทั้งอัตรา data transfer out และค่า S3 request
- **PrivateLink (VPC Interface Endpoints)**: ให้การเชื่อมต่อส่วนตัวไปยังบริการ AWS และบริการที่ hosted โดยลูกค้า AWS รายอื่น ปลอดภัยกว่าการผ่าน NAT และมักถูกกว่าสำหรับบริการที่มี volume สูง จุดคุ้มทุนเทียบกับ NAT Gateway processing อยู่ราว 420GB/เดือน (นับค่ารายชั่วโมงต่อ AZ ของ endpoint เอง และสมมติว่า NAT Gateway ยังอยู่สำหรับ traffic อื่น)

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

อธิบายความแตกต่างระหว่าง VPC Gateway Endpoint และ VPC Interface Endpoint แต่ละอันมีให้สำหรับบริการ AWS ใดบ้าง และค่าใช้จ่ายของแต่ละอันคือเท่าไหร่?

*(คำใบ้: Gateway Endpoints ฟรีแต่เฉพาะสำหรับ S3 และ DynamoDB เท่านั้น Interface Endpoints มีค่าใช้จ่ายต่อชั่วโมงแต่ทำงานกับบริการ AWS ส่วนใหญ่)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: แอปพลิเคชันของบริษัทรันบน EC2 instances ใน private subnets instances ทำ API calls บ่อยๆ ไปยัง Amazon SQS และ Amazon S3 ปัจจุบัน traffic ทั้งหมดออกผ่าน NAT Gateway ทีมต้องการลดค่า NAT Gateway ความปลอดภัยของข้อมูลต้องได้รับการดูแล — ไม่มี traffic ควรผ่าน public internet

แนวทางใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุดด้วยต้นทุนต่อเนื่องน้อยที่สุด?

A) สร้าง Gateway Endpoint สำหรับ SQS และ Gateway Endpoint สำหรับ S3  
B) สร้าง Interface Endpoints สำหรับทั้ง SQS และ S3  
C) สร้าง Interface Endpoint สำหรับ SQS และ Gateway Endpoint สำหรับ S3  
D) ลบ NAT Gateway และใช้ internet gateway โดยตรงสำหรับ API calls

**คำใบ้ที่ 1**: Gateway Endpoints มีให้เฉพาะสำหรับ S3 และ DynamoDB เท่านั้น

**คำใบ้ที่ 2**: Interface Endpoints มีให้สำหรับ SQS และบริการอื่นๆ อีกมาก (แต่มีค่าใช้จ่าย)

**คำใบ้ที่ 3**: Internet Gateway ใน route table ของ private subnet จะทำให้มันกลายเป็น public subnet ซึ่งละเมิดข้อกำหนดด้านความปลอดภัย

**คำตอบ**: C

**คำอธิบาย**: S3 ใช้ Gateway Endpoint (ฟรี) SQS ต้องใช้ Interface Endpoint (มีราคา) การรวมกันนี้ขจัดค่า NAT Gateway data processing สำหรับทั้งสองบริการ Traffic ทั้งหมดยังคงอยู่ภายใน AWS private network ไม่มีการผ่าน public internet

**ทำไมไม่ใช่ A?** Gateway Endpoints ไม่มีให้สำหรับ SQS เฉพาะ S3 และ DynamoDB เท่านั้นที่มี Gateway Endpoints

**ทำไมไม่ใช่ B?** แม้ว่าจะทำงานได้ การใช้ Interface Endpoint สำหรับ S3 (แทน Gateway Endpoint ฟรี) มีค่าใช้จ่ายรายชั่วโมงที่ไม่จำเป็น ใช้ Gateway Endpoint ฟรีสำหรับ S3 และ DynamoDB เสมอ

**ทำไมไม่ใช่ D?** การเพิ่ม route ไปยัง Internet Gateway จาก private subnet ทำให้มันกลายเป็น public subnet EC2 instances ใน private subnets โดยทั่วไปไม่มี Elastic IPs ดังนั้นพวกมันไม่สามารถ route ผ่าน Internet Gateway ได้จริงโดยไม่มีการเปลี่ยนแปลงเพิ่มเติม — และการทำเช่นนั้นจะทำให้พวกมันเผชิญกับ inbound internet traffic

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.4*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

ผู้ใช้ฝั่งตะวันออกของ Nimbus สร้าง traffic จำนวนมาก แอปพลิเคชันให้บริการพวกเขาจาก us-west-2 (Oregon) ปัจจุบัน:

- API responses ไปโดยตรงจาก EC2 instances us-west-2 ไปยังผู้ใช้ฝั่งตะวันออก (~80ms, $0.09/GB)
- รูปภาพเมนูไปจาก S3 us-west-2 ผ่าน CloudFront edge ในบอสตัน (~8ms หลัง caching)

ทีมกำลังพิจารณาเพิ่ม application region ที่สองใน us-east-1 (Northern Virginia) สำหรับผู้ใช้ฝั่งตะวันออกเพื่อลด API latency

วิเคราะห์ค่า data transfer ของการเปลี่ยนแปลงนี้ การตั้งค่า dual-region จะมีค่า cross-region data transfer ใหม่อะไรบ้าง? Route 53 latency-based routing จะลดหรือเพิ่มต้นทุน transfer รวมหรือไม่? ภายใต้เงื่อนไขใด (volume traffic, ความ sensitive ต่อ latency) การตั้งค่า dual-region จะคุ้มค่า?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกวิเคราะห์ cost-benefit multi-region)*

## ฉากหลังเครดิต

Tom ปิดการวิเคราะห์ networking

ผลกระทบรวมโปรเจกต์การ optimize สามเดือน:

- EC2 Savings Plans: -$14,200/ปี
- S3 lifecycle policies: -$7,800/ปี
- Storage (S3 + EBS): -$6,200/ปี
- Database tier: -$5,892/ปี
- Networking: -$1,812/ปี
- **รวม: -$35,904/ปี**

เขาเขียนมันบนไวท์บอร์ดในห้องประชุม

Leo จ้องมองมัน "สามหมื่นห้า"

"และเศษ" Tom พูด

"ต่อปี"

"ต่อปี"

Priya คำนวณ "นั่นคือ $2,992 ต่อเดือนที่เราใช้จ่ายกับสิ่งที่ไม่ได้สร้างมูลค่า"

"ไม่ใช่ทั้งหมด" Tom แก้ไข "บางส่วนเป็นสิ่งที่เราได้รับมูลค่าจากมัน แต่จ่ายแพงเกินไป Savings Plans — เราได้ EC2 capacity เดิมทุกประการ แค่ในราคาที่ดีกว่า"

Maya ยืนอยู่หน้าไวท์บอร์ดนานมาก

"เมื่อเราเริ่ม Nimbus" เธอพูด "ทุกดอลลาร์มีความสำคัญ เราแทบจะไม่มีเงินพอสำหรับ EC2 instance แรก"

"ใช่" Tom พูด

"และไปๆ มาๆ เราหยุดตรวจสอบดอลลาร์อย่างรอบคอบ"

"การเติบโตทำแบบนั้น" Priya พูด "โฟกัสเปลี่ยนไปที่การสร้าง ไม่ใช่การ optimize"

"ทั้งสองสำคัญ" Maya พูด "ทั้งสอง เสมอ เพิ่มสิ่งนี้ใน wiki และตั้ง quarterly review สำหรับต้นทุน"

Tom กำลังเปิด calendar อยู่แล้ว

ในบทต่อๆ ไป: เราซูมออกจากบริการแต่ละอันและเริ่มคิดเหมือนสถาปนิก
