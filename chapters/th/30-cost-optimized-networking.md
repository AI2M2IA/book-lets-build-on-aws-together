# บทที่ 30: ต้นทุนที่ซ่อนอยู่

ค่า storage แสดงเป็นบรรทัดเดียว: "S3: $198" ค่า compute แสดงเป็นบรรทัดเดียว: "EC2: $2,340" ค่า networking กระจายอยู่ในรายการกว่าสิบบรรทัดที่มีชื่อเช่น "Data Transfer Out", "NAT Gateway Processing", "VPC Peering Data Transfer" และ "CloudFront Data Transfer" วิศวกรส่วนใหญ่รวมมันครั้งหนึ่ง กะพริบตา แล้วรวมอีกครั้ง

Tom พูดว่า: "ค่า networking นั่นคือสิ่งถัดไป"

เขาดึงบิลขึ้นมา หาส่วน data transfer รวมรายการทั้งหมด

ค่า networking ใน AWS เหมือนระบบ toll ของเมือง: การขับรถเข้าเมืองฟรี แต่ทุก tunnel ที่คุณใช้ขาออกมีค่าใช้จ่าย และการขับระหว่างย่านต่างๆ ก็มีค่าใช้จ่ายเล็กน้อยด้วย คนส่วนใหญ่ไม่คิดถึง tolls จนกว่าจะได้รับบิลปลายเดือนและตระหนักว่าพวกเขาผ่าน tunnel ทุกวันเมื่อมีถนนผิวดินฟรีตลอดเวลา เป้าหมายของบทนี้คือการเข้าใจทุกด่าน toll — และตัดสินใจว่าอันไหนคุ้มค่ากับการจ่าย

$847/เดือน

"เราใช้จ่าย $847 ต่อเดือนกับ data transfer" เขาพูด

"มากไหม?" Leo ถาม

"มากกว่าบิล S3 ของเราก่อนที่เราจะ optimize มัน และผมไม่รู้ด้วยซ้ำว่าเรามีบิล data transfer ขนาดนี้"

Maya มองมา "Data transfer คืออะไรกันแน่?"

"คือสิ่งที่ AWS คิดค่าใช้จ่ายสำหรับการเคลื่อนย้าย bytes ไปรอบๆ Bytes เข้า AWS: โดยทั่วไปฟรี Bytes ออกจาก AWS ไปยัง internet: คิดค่าบริการ Bytes ระหว่างบริการใน regions ต่างกัน: คิดค่าบริการ Bytes ที่ผ่าน NAT Gateway: คิดค่าบริการ"

"คุณแยกรายการได้ไหม?"

Tom ทำได้ และสิ่งที่เขาพบเปลี่ยนวิธีที่ทีมคิดเกี่ยวกับสถาปัตยกรรมของพวกเขา

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

หลังจากจัดหมวดหมู่ทุกรายการ:

**Outbound data ไปยัง internet**: $214/เดือน

- API responses ไปยังลูกค้าทั่วโลก
- CloudFront cache fills (เมื่อ edge locations ดึงจาก origin)

**NAT Gateway processing**: $289/เดือน

- Application servers เรียก external APIs (payment processor, email service, map data)
- DynamoDB calls ผ่าน NAT Gateway (ก่อนที่จะตั้ง VPC endpoints สำหรับบาง tables)

**Cross-AZ data transfer**: $178/เดือน

- Load balancer ไปยัง EC2 instances (load balancer อยู่ใน AZ หนึ่ง บาง instances อยู่ใน AZ อื่น)
- Application server ไปยัง RDS read replica (ใน AZ อื่น)

**Cross-region data transfer**: $166/เดือน

- Aurora Global Database replication (primary ใน us-east-1, reader ใน us-west-2)
- S3 Cross-Region Replication สำหรับ backups

**NAT Gateway: ความประหลาดใจที่ใหญ่ที่สุด**

ค่า NAT Gateway processing $289/เดือนเป็นรายการที่ใหญ่ที่สุด และบางส่วนไม่จำเป็น

ในบทที่ 11 Tom ตั้ง VPC Gateway Endpoints สำหรับ S3 และ DynamoDB ซึ่งฟรี แต่เขาลืมตั้ง Interface Endpoints สำหรับบริการอื่นๆ:

- Systems Manager (SSM) สำหรับการจัดการ patch
- Secrets Manager สำหรับการดึง credential
- CloudWatch สำหรับการส่ง metric และ log
- SQS สำหรับการ polling message

ทุก call ไปยังบริการเหล่านี้จาก EC2 instances ส่วนตัวกำลังผ่าน NAT Gateway แต่ละ call คิด $0.045/GB

**Interface Endpoints** สำหรับบริการเหล่านี้: $0.01/ชั่วโมงต่อ AZ + $0.01/GB ข้อมูลที่ประมวลผล

ที่ volume ของ Nimbus SSM Interface Endpoint จะมีค่าใช้จ่ายประมาณ $15/เดือนและประหยัดประมาณ $43/เดือนจากค่า NAT Gateway (เพราะ SSM สร้างปริมาณข้อมูลมากสำหรับการจัดการ patch และ parameter store calls)

ต้นทุนและการประหยัดของ Endpoint ต่างกันตาม service และ volume Tom คำนวณว่าการตั้ง Interface Endpoints สำหรับสี่บริการที่มี traffic สูงจะมีค่าใช้จ่าย $62/เดือนรวมและประหยัดประมาณ $140/เดือนจากค่า NAT Gateway processing

ประหยัดสุทธิ: $78/เดือนจากการตั้ง endpoint เพียงอย่างเดียว

**Cross-AZ Traffic: คำถามด้านสถาปัตยกรรม**

ค่า cross-AZ data transfer $178/เดือนซับซ้อนกว่า

บางส่วนหลีกเลี่ยงไม่ได้: load balancer กระจาย traffic ข้าม AZs ดังนั้น requests บางอันเกิดใน AZ หนึ่งและ load balancer ส่งต่อไปยัง instance ใน AZ อื่น

บางส่วน optimize ได้: แอปพลิเคชันถูกกำหนดค่าให้เขียนไปยัง RDS primary (ใน us-east-1a) และอ่านจาก read replica (ใน us-east-1b) ทุก read query ข้าม AZ boundaries

สำหรับการอ่าน วิธีแก้ไขหนึ่ง: กำหนดค่าแอปพลิเคชันให้ prefer read replica ใน AZ เดียวกันกับ instance ที่ส่ง request แต่ละ AZ จะมี read replica ของตัวเอง Traffic อยู่ในท้องถิ่น

การแลกเปลี่ยน: read replicas มากขึ้น = ค่าใช้จ่ายมากขึ้น ถ้าค่า cross-AZ traffic คือ $50/เดือนและ read replica เพิ่มเติมมีค่าใช้จ่าย $190/เดือน การ optimize แบบ AZ-local ไม่คุ้มค่า

Tom คำนวณ: ที่ query volume ปัจจุบันของพวกเขา cross-AZ traffic มีเพียง $31/เดือนของ $178 ไม่คุ้มค่าที่จะเพิ่ม replicas

ค่า cross-AZ อื่นๆ คือ load balancer routing และการสื่อสาร service-to-service ซึ่งหลีกเลี่ยงไม่ได้ส่วนใหญ่ในระดับสถาปัตยกรรมปัจจุบัน

"นี่คือหนึ่งในกรณีที่การเข้าใจต้นทุนไม่ได้หมายความว่าคุณควรแก้ไขมัน" Tom พูด

"ค่าใช้จ่ายในการขจัด cross-AZ traffic ทั้งหมดจะเป็นเท่าไหร่?" Maya ถาม

"ทุกอย่างใน AZ เดียวเอาชนะวัตถุประสงค์ของ Multi-AZ นั่นคือการประหยัด $31/เดือนแลกกับการสูญเสีย high availability"

"ดังนั้นเราปล่อยมันไว้" เธอพูด

"เราปล่อยมันไว้"

นี่คือการสนทนาต้นทุนที่มีวุฒิภาวะ: บางครั้งคุณจ่ายสำหรับบางอย่างเพราะทางเลือกมีค่าใช้จ่ายสูงกว่าในแง่ความเสี่ยง

**CloudFront: ส่วนลด Data Transfer**

นี่คือข้อเท็จจริงที่ขัดกับสามัญสำนึก: การให้บริการข้อมูลผ่าน CloudFront โดยทั่วไปถูกกว่าการให้บริการโดยตรงจาก EC2 หรือ S3

**EC2 โดยตรงไปยัง internet**: $0.09/GB
**CloudFront ไปยัง internet**: $0.085/GB (ถูกกว่าเล็กน้อย)

แต่การประหยัดจริงไม่ใช่อัตราต่อ GB — มันคือ CloudFront caches ข้อมูลที่ edge locations ถ้าผู้ใช้ 1,000 คนขอรูปภาพเมนูเดิม:

- **ไม่มี CloudFront**: 1,000 requests ถึง S3 origin × ขนาดรูปภาพ × $0.09/GB
- **มี CloudFront**: 1 request ถึง S3 (cache miss) + 999 requests ให้บริการจาก edge cache ที่อัตรา CloudFront

สำหรับ Nimbus ที่มี cache hit rate 83% (จากบทที่ 13) พวกเขาให้บริการ 83% ของ requests จาก edge cache Data transfer จาก origin จริงคือ 17% ของ requests ทั้งหมด — 83% ของ traffic "outbound" ของพวกเขา cached ที่ edge

"CloudFront ไม่ใช่แค่ CDN สำหรับประสิทธิภาพ" Tom พูด "มันยังเป็นการ optimize ต้นทุนสำหรับ data transfer ด้วย"

Leo ดูท่าทีที่คิดอยู่ "เราควรย้ายการส่ง static content ทั้งหมดผ่าน CloudFront แม้สำหรับ assets ที่ไม่ sensitive ต่อ latency"

"ถูกต้อง ถ้าผู้ใช้กำลัง download มันจาก AWS มันควรผ่าน CloudFront"

**S3 Select: ลด Data Transfer ใน Queries**

การ optimize ที่ละเอียดอ่อน: **S3 Select** ช่วยให้คุณดึงเฉพาะ rows และ columns ที่ต้องการจาก S3 object (CSV, JSON, Parquet) แทนที่จะ download ไฟล์ทั้งหมดเพื่อกรองใน application ของคุณ

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

S3 Select ลดข้อมูลที่ transfer จาก S3 ไปยัง application ของคุณ สำหรับไฟล์ขนาดใหญ่ที่มี selective queries อาจลดปริมาณข้อมูลได้ 10-100 เท่า และลดต้นทุนตามไปด้วย

**การ Optimize Networking ทั้งหมด**

หลังจากสามสัปดาห์ของการวิเคราะห์และการ implement:

| รายการต้นทุน                                    | ก่อน      | หลัง      | ประหยัดต่อเดือน |
|-------------------------------------------------|-----------|-----------|-----------------|
| NAT Gateway (Interface Endpoints)               | $289      | $211      | $78             |
| CloudFront optimization (ย้าย assets มากขึ้น)   | $214      | $147      | $67             |
| Cross-AZ traffic (ยอมรับตามที่เป็นอยู่)         | $178      | $178      | $0              |
| Cross-region traffic (ยอมรับตามที่เป็นอยู่)     | $166      | $166      | $0              |
| **รวม**                                         | **$847**  | **$702**  | **$145/เดือน**  |

ประหยัด $145/เดือน $1,740/ปีจากค่า networking ปานกลางเมื่อเทียบกับ compute และ storage แต่มีความหมาย

สำคัญกว่า: ตอนนี้ Tom เข้าใจทุกบรรทัดของ networking bill เขาสามารถอธิบายแต่ละต้นทุนและตัดสินใจอย่างรอบคอบว่าจะ optimize อันไหนและยอมรับอันไหน

## จุดแข็งและข้อจำกัด

**ค่า NAT Gateway**:

- ปริมาณข้อมูลมากผ่าน NAT Gateway สะสมอย่างรวดเร็ว
- VPC Endpoints ขจัดค่า NAT บางส่วนได้อย่างสมบูรณ์
- ตรวจสอบว่า instances ส่วนตัวของคุณเรียกบริการใดและมี endpoints ให้ใช้หรือไม่

**CloudFront สำหรับต้นทุน**:

- Cache hit rate กำหนดการประหยัดต้นทุนโดยตรง
- Cache hit rate สูง = transfer จาก origin ต่ำกว่า + ต้นทุน transfer รวมต่ำกว่า
- ย้ายการส่ง static asset ทั้งหมดผ่าน CloudFront

**การแลกเปลี่ยน Cross-AZ**:

- การขจัด cross-AZ traffic โดยทั่วไปต้องการการเปลี่ยนแปลงสถาปัตยกรรมที่มีค่าใช้จ่ายสูงกว่าการประหยัด
- คำนวณอย่างรอบคอบก่อน optimize

**S3 Select**:

- ประหยัดมากสำหรับ selective queries บน S3 objects ขนาดใหญ่
- ไม่ช่วยเมื่อคุณต้องการไฟล์ทั้งหมด

ในบทถัดไป: framework หกเสาหลักที่ถามคำถามที่ทุกการตรวจสอบสถาปัตยกรรมควรเริ่มต้นด้วย

## สรุป

- AWS คิดค่าบริการสำหรับ **outbound data** (internet: ประมาณ $0.09/GB), **cross-AZ traffic** ($0.01/GB แต่ละทิศทาง), **cross-region traffic** ($0.02-0.08/GB) และ **NAT Gateway processing** ($0.045/GB)
- **Inbound data** ฟรี **Same-AZ traffic** ฟรี
- **VPC Gateway Endpoints** (S3, DynamoDB): ฟรี ขจัดค่า NAT Gateway สำหรับบริการเหล่านี้
- **VPC Interface Endpoints**: ราคาต่อชั่วโมงบวกต่อ GB ถูกกว่า NAT Gateway สำหรับบริการที่มี volume สูง
- **CloudFront** ให้บริการข้อมูลในอัตราที่ต่ำกว่าการส่ง EC2-to-internet โดยตรงและลด transfer volume จาก origin อย่างมากผ่าน caching
- **S3 Select** ลด data transfer จาก S3 โดยกรองที่แหล่งที่มา
- ค่า networking บางอย่างเป็นการแลกเปลี่ยนด้านสถาปัตยกรรม (cross-AZ สำหรับ HA) — เข้าใจมัน ไม่ต้องขจัดเสมอ

## เคล็ดลับสอบ

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
- **PrivateLink (VPC Interface Endpoints)**: ให้การเชื่อมต่อส่วนตัวไปยังบริการ AWS และบริการที่ hosted โดยลูกค้า AWS รายอื่น ปลอดภัยกว่าการผ่าน NAT และมักถูกกว่าสำหรับบริการที่มี volume สูง

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

อธิบายความแตกต่างระหว่าง VPC Gateway Endpoint และ VPC Interface Endpoint แต่ละอันมีให้สำหรับบริการ AWS ใดบ้าง และค่าใช้จ่ายของแต่ละอันคือเท่าไหร่?

*(คำใบ้: Gateway Endpoints ฟรีแต่เฉพาะสำหรับ S3 และ DynamoDB เท่านั้น Interface Endpoints มีค่าใช้จ่ายต่อชั่วโมงแต่ทำงานกับบริการ AWS ส่วนใหญ่)*

**แบบฝึกหัดที่ 2 — ฝึกสอบ**

*สถานการณ์*: แอปพลิเคชันของบริษัทรันบน EC2 instances ใน private subnets instances ทำ API calls บ่อยๆ ไปยัง Amazon SQS และ Amazon S3 ปัจจุบัน traffic ทั้งหมดออกผ่าน NAT Gateway ทีมต้องการลดค่า NAT Gateway ความปลอดภัยของข้อมูลต้องได้รับการดูแล — ไม่มี traffic ควรผ่าน public internet

แนวทางใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุดด้วยต้นทุนต่อเนื่องน้อยที่สุด?

A) สร้าง Gateway Endpoint สำหรับ SQS และ Gateway Endpoint สำหรับ S3  
B) สร้าง Interface Endpoint สำหรับ SQS และ Gateway Endpoint สำหรับ S3  
C) สร้าง Interface Endpoints สำหรับทั้ง SQS และ S3  
D) ลบ NAT Gateway และใช้ internet gateway โดยตรงสำหรับ API calls

**คำใบ้ที่ 1**: Gateway Endpoints มีให้เฉพาะสำหรับ S3 และ DynamoDB เท่านั้น

**คำใบ้ที่ 2**: Interface Endpoints มีให้สำหรับ SQS และบริการอื่นๆ อีกมาก (แต่มีค่าใช้จ่าย)

**คำใบ้ที่ 3**: Internet Gateway ใน route table ของ private subnet จะทำให้มันกลายเป็น public subnet ซึ่งละเมิดข้อกำหนดด้านความปลอดภัย

**คำตอบ**: B

**คำอธิบาย**: S3 ใช้ Gateway Endpoint (ฟรี) SQS ต้องใช้ Interface Endpoint (มีราคา) การรวมกันนี้ขจัดค่า NAT Gateway data processing สำหรับทั้งสองบริการ Traffic ทั้งหมดยังคงอยู่ภายใน AWS private network ไม่มีการผ่าน public internet

**ทำไมไม่ใช่ A?** Gateway Endpoints ไม่มีให้สำหรับ SQS เฉพาะ S3 และ DynamoDB เท่านั้นที่มี Gateway Endpoints

**ทำไมไม่ใช่ C?** แม้ว่าจะทำงานได้ การใช้ Interface Endpoint สำหรับ S3 (แทน Gateway Endpoint ฟรี) มีค่าใช้จ่ายรายชั่วโมงที่ไม่จำเป็น ใช้ Gateway Endpoint ฟรีสำหรับ S3 และ DynamoDB เสมอ

**ทำไมไม่ใช่ D?** การเพิ่ม route ไปยัง Internet Gateway จาก private subnet ทำให้มันกลายเป็น public subnet EC2 instances ใน private subnets โดยทั่วไปไม่มี Elastic IPs ดังนั้นพวกมันไม่สามารถ route ผ่าน Internet Gateway ได้จริงโดยไม่มีการเปลี่ยนแปลงเพิ่มเติม และการทำเช่นนั้นจะทำให้พวกมันเผชิญกับ inbound internet traffic

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.4*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

ผู้ใช้ฝั่งตะวันตกของ Nimbus สร้าง traffic จำนวนมาก แอปพลิเคชันให้บริการพวกเขาจาก us-east-1 (เวอร์จิเนีย) ปัจจุบัน:

- API responses ไปโดยตรงจาก EC2 instances us-east-1 ไปยังผู้ใช้ฝั่งตะวันตก (~80ms, $0.09/GB)
- รูปภาพเมนูไปจาก S3 us-east-1 ผ่าน CloudFront edge ในซีแอตเทิล (~8ms หลัง caching)

ทีมกำลังพิจารณาเพิ่ม application region ที่สองใน us-west-2 (Oregon) สำหรับผู้ใช้ฝั่งตะวันตกเพื่อลด API latency

วิเคราะห์ค่า data transfer ของการเปลี่ยนแปลงนี้ การตั้งค่า dual-region จะมีค่า cross-region data transfer ใหม่อะไรบ้าง? Route 53 latency-based routing จะลดหรือเพิ่มต้นทุน transfer รวมหรือไม่? ภายใต้เงื่อนไขใด (volume traffic, ความ sensitive ต่อ latency) การตั้งค่า dual-region จะคุ้มค่า?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกวิเคราะห์ cost-benefit multi-region)*

## ฉากหลังเครดิต

Tom ปิดการวิเคราะห์ networking

ผลกระทบรวมโปรเจกต์การ optimize สามเดือน:

- EC2 Savings Plans: -$14,200/ปี
- Storage (S3 + EBS): -$6,200/ปี
- Database tier: -$11,220/ปี
- Networking: -$1,740/ปี
- **รวม: -$33,360/ปี**

เขาเขียนมันบนไวท์บอร์ดในห้องประชุม

Leo จ้องมองมัน "สามหมื่นสาม"

"และเปลี่ยน" Tom พูด

"ต่อปี"

"ต่อปี"

Priya คำนวณ "นั่นคือ $2,780 ต่อเดือนที่เราใช้จ่ายกับสิ่งที่ไม่ได้สร้างมูลค่า"

"ไม่ใช่ทั้งหมด" Tom แก้ไข "บางส่วนเป็นสิ่งที่เราได้รับมูลค่าจากมัน แต่จ่ายแพงเกินไป Savings Plans — เราได้ EC2 capacity เดิมทุกประการ แค่ในราคาที่ดีกว่า"

Maya ยืนอยู่หน้าไวท์บอร์ดนานมาก

"เมื่อเราเริ่ม Nimbus" เธอพูด "ทุกดอลลาร์มีความสำคัญ เราแทบจะไม่มีเงินพอสำหรับ EC2 instance แรก"

"ใช่" Tom พูด

"และไปๆ มาๆ เราหยุดตรวจสอบดอลลาร์อย่างรอบคอบ"

"การเติบโตทำแบบนั้น" Priya พูด "โฟกัสเปลี่ยนไปที่การสร้าง ไม่ใช่การ optimize"

"ทั้งสองสำคัญ" Maya พูด "ทั้งสอง เสมอ เพิ่มสิ่งนี้ใน wiki และตั้ง quarterly review สำหรับต้นทุน"

Tom กำลังเปิด calendar อยู่แล้ว

ในบทต่อๆ ไป: เราซูมออกจากบริการแต่ละอันและเริ่มคิดเหมือนสถาปนิก
