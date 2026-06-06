# ภาคผนวก ค: ทะเบียนแนวคิด

แนวคิดหลักทุกข้อที่แนะนำในหนังสือ จับคู่กับบทของมัน การเปรียบเปรยที่ใช้ และโดเมน SAA-C03 ที่ปรากฏ

ใช้เป็นดัชนีการเรียน: หากคุณยังไม่แน่ใจในแนวคิดใดก่อนสอบ ค้นหาที่นี่แล้วกลับไปที่บทของมันเพื่อดูบริบท

---

## A

**ACM (AWS Certificate Manager)** — ใบรับรอง TLS สาธารณะฟรีสำหรับ ALB, CloudFront และ API Gateway พร้อมการต่ออายุอัตโนมัติผ่านการตรวจสอบ DNS ใบรับรอง CloudFront ต้องอยู่ใน us-east-1 บทที่ 16 Domain 1

**ACU (Aurora Capacity Unit)** — หน่วยการวัดสำหรับความจุของ Aurora Serverless v2 ปรับขนาดอัตโนมัติ และในเวอร์ชันเอนจินที่รองรับ สามารถหยุดชั่วคราวอัตโนมัติเหลือ 0 ACUs เมื่อไม่มีการเชื่อมต่อค้างไว้ บทที่ 24 Domain 3

**Alarm (CloudWatch)** — กฎที่ทำงานเมื่อ metric ข้าม threshold ทริกเกอร์การแจ้งเตือนหรือการกระทำ auto scaling บทที่ 7 Domain 2

**ALB (Application Load Balancer)** — load balancer Layer 7 ที่กำหนดเส้นทางทราฟฟิก HTTP/HTTPS ตามกฎพาธและโฮสต์ บทที่ 7 Domain 2

**AMI (Amazon Machine Image)** — template ที่บรรจุ OS ซอฟต์แวร์ และการกำหนดค่าสำหรับอินสแตนซ์ EC2 บทที่ 4 Domain 3

**Architect mindset** — การถาม "อะไรพังก่อน เรารู้ได้อย่างไร และใครทำอะไรตอนตีสาม?" แทนที่จะถามเพียง "สิ่งนี้ทำงานอย่างไร?" บทที่ 32, บทที่ 34 Cross-domain

**Architecture Decision Record (ADR)** — เอกสารสั้นที่บันทึกการตัดสินใจ ทางเลือก เหตุผล และสิ่งที่จะทำให้พิจารณาใหม่ บทที่ 32 Cross-domain

**Architecture review** — กระบวนการที่มีโครงสร้างครอบคลุม: ข้อจำกัด → สิ่งที่ไม่ทราบ → ตัวเลือก → failure modes → การตรวจสอบ → runbooks บทที่ 32 Cross-domain

**Athena** — บริการ query SQL แบบ serverless สำหรับข้อมูลใน S3 จ่ายต่อ TB ที่สแกน ดีที่สุดกับรูปแบบ columnar Parquet/ORC บทที่ 26 Domain 3

**Auto Scaling Group (ASG)** — กลุ่มอินสแตนซ์ EC2 ที่จัดการร่วมกัน แทนที่อินสแตนซ์ที่ไม่สมบูรณ์โดยอัตโนมัติและปรับขนาดตามโหลด บทที่ 7 Domain 2, 3

**Availability Zone (AZ)** — ศูนย์ข้อมูลที่แยกทางกายภาพหนึ่งแห่งขึ้นไปภายในภูมิภาค เชื่อมต่อด้วยลิงก์ latency ต่ำ บทที่ 2 Domain 2

---

## B

**AWS Backup** — การสำรองข้อมูลแบบรวมศูนย์ที่ใช้นโยบาย ครอบคลุม EBS, RDS, DynamoDB, EFS และ Storage Gateway รองรับการคัดลอกข้าม region และข้าม account บทที่ 18, 23 Domain 2

**AWS Batch** — managed batch compute สำหรับ Docker containers ประกอบด้วย job definition (สิ่งที่จะรัน) job queue (ที่ที่ job รอ) และ compute environment (EC2 หรือ Fargate, On-Demand หรือ Spot) สำหรับ workloads ที่เกินขีดจำกัด 15 นาทีของ Lambda บทที่ 21 Domain 3

**Bucket (S3)** — container สำหรับ objects ใน S3 Buckets มีชื่อที่ไม่ซ้ำกันทั่วโลกและอยู่ในภูมิภาคเฉพาะ บทที่ 5 Domain 3

**Bucket policy** — resource-based policy ที่แนบกับ S3 bucket ควบคุมการเข้าถึงสำหรับ IAM principals และ account ภายนอก บทที่ 5 Domain 1

---

## C

**Cache-aside pattern** — แอปพลิเคชันตรวจสอบ cache ก่อน เมื่อพลาด query ฐานข้อมูล จากนั้นจัดเก็บผลลัพธ์ใน cache บทที่ 10 Domain 3

**Cache hit rate** — เปอร์เซ็นต์ของ requests ที่ให้บริการจาก cache แทน origin ยิ่งสูงยิ่งดี บทที่ 13 Domain 3

**AWS Client VPN** — OpenVPN endpoint ที่จัดการ เชื่อมต่ออุปกรณ์แต่ละเครื่อง (แล็ปท็อป เวิร์กสเตชัน) กับ VPC ผ่านอินเทอร์เน็ต การตรวจสอบสิทธิ์ผ่าน Active Directory, SAML 2.0 federation กับ identity provider หรือ mutual TLS รองรับโหมด split-tunnel และ full-tunnel เปรียบเทียบกับ Site-to-Site VPN (network-to-network) บทที่ 11 Domain 1

**CloudFront** — CDN ของ AWS แคชเนื้อหาที่ edge locations 750+ แห่งทั่วโลก ลด latency และต้นทุนการถ่ายโอนข้อมูลจาก origin บทที่ 13 Domain 3, 4

**CloudTrail** — บันทึกทุกการเรียก API ของ AWS: ใคร อะไร เมื่อใด จากที่ไหน จัดเก็บใน S3 ใช้สำหรับการตรวจสอบและการสอบสวนเหตุการณ์ Domain 1

**CloudWatch** — Metrics, logs, alarms และ dashboards สำหรับทรัพยากร AWS และแอปพลิเคชันที่กำหนดเอง อ้างอิงตลอดทั้งเล่ม ทุกโดเมน

**Amazon Cognito** — การตรวจสอบสิทธิ์สำหรับผู้ใช้ปลายทางของแอปพลิเคชันคุณ: User Pools เป็น directory ผู้ใช้ที่จัดการ (การลงทะเบียน เข้าสู่ระบบ MFA social login JWTs) Identity Pools ออกข้อมูลรับรอง AWS ชั่วคราว IAM สำหรับวิศวกรของคุณ Cognito สำหรับลูกค้าของคุณ บทที่ 14 Domain 1

**Cold start (Lambda)** — ความล่าช้าในการเรียกครั้งแรก (หรือหลังจากไม่มีกิจกรรม) ขณะที่ Lambda เริ่มต้นสภาพแวดล้อมการทำงาน ใช้ provisioned concurrency เพื่อขจัด บทที่ 20 Domain 3

**Compute Savings Plan** — ความผูกพันต่อจำนวนเงินของการใช้จ่าย EC2 ต่อชั่วโมง ใช้ได้กับประเภทหรือขนาดอินสแตนซ์ใดก็ได้ บทที่ 27 Domain 4

**Config (AWS)** — ติดตามการเปลี่ยนแปลงการกำหนดค่าทรัพยากร AWS ตามเวลาและประเมินการปฏิบัติตามข้อกำหนดเทียบกับกฎ บทที่ 31 Domain 1

**AWS Control Tower** — ทำให้การกำกับดูแลแบบหลาย account เป็นอัตโนมัติ: สร้าง landing zone (management, log archive และ audit accounts) พร้อม guardrails ในไม่กี่นาที — เวอร์ชันสำเร็จรูปของการเดินสาย Organizations, CloudTrail และ Config ด้วยมือ บทที่ 14 Domain 1

**Cross-AZ data transfer** — ทราฟฟิกระหว่าง Availability Zones ภายในภูมิภาค คิดราคา $0.01/GB แต่ละทิศทาง บทที่ 30 Domain 4

**Cross-region replication** — การคัดลอกข้อมูล (S3 CRR, Aurora Global, DynamoDB Global Tables) ไปยังภูมิภาคอื่น มีค่าใช้จ่ายการถ่ายโอนข้อมูล บทที่ 18, 23, 30 Domain 2

---

## D

**AWS DataSync** — การย้ายและซิงค์ file shares (NFS/SMB) แบบใช้เอเจนต์ ไปยัง S3, EFS หรือ FSx "rsync ที่ทรงพลัง พร้อม console ของ AWS" บทที่ 25 Domain 3

**DAX (DynamoDB Accelerator)** — in-memory cache เฉพาะสำหรับ DynamoDB latency การอ่านระดับไมโครวินาที บทที่ 9 Domain 3

**Dead Letter Queue (DLQ)** — คิวที่ข้อความซึ่งประมวลผลล้มเหลวซ้ำๆ ถูกส่งไป ป้องกันการอุดตันของคิว บทที่ 19 Domain 2

**AWS DMS (Database Migration Service)** — ย้ายฐานข้อมูลไปยัง AWS โดยมี downtime น้อยที่สุด Full load (สำเนาเริ่มต้น) บวก CDC (Change Data Capture) ทำให้ต้นทางและปลายทางซิงค์กันระหว่างการย้าย การย้ายแบบ homogeneous (เอนจินประเภทเดียวกัน): ใช้ DMS โดยตรง การย้ายแบบ heterogeneous (เอนจินต่างประเภท เช่น Oracle → Aurora PostgreSQL): ใช้ SCT (Schema Conversion Tool) ก่อน จากนั้น DMS บทที่ 8 Domain 3

**Dedicated Host** — เซิร์ฟเวอร์ EC2 ทางกายภาพที่สงวนไว้สำหรับคุณโดยเฉพาะ จำเป็นสำหรับใบอนุญาตซอฟต์แวร์บางประเภท บทที่ 27 Domain 4

**Defense in depth** — การวางชั้นการควบคุมความปลอดภัยหลายชั้น (IAM + security groups + NACLs + WAF + GuardDuty) เพื่อให้การบุกรุกชั้นหนึ่งไม่เปิดเผยระบบ บทที่ 33 Domain 1

**Direct Connect** — การเชื่อมต่อเครือข่ายส่วนตัวโดยเฉพาะจากสถานที่ภายในองค์กรไปยัง AWS สม่ำเสมอกว่า VPN บทที่ 25 Domain 3

**DLQ** — ดู Dead Letter Queue

**DynamoDB** — ฐานข้อมูล NoSQL ที่จัดการอย่างเต็มรูปแบบ มี latency ระดับมิลลิวินาทีตัวเลขเดียวที่ขนาดใดก็ได้ โมเดล key-value และ document บทที่ 9 Domain 3

**DynamoDB Auto Scaling** — ปรับ provisioned read/write capacity โดยอัตโนมัติตาม CloudWatch metrics บทที่ 29 Domain 4

**DynamoDB Streams** — change log ที่เรียงตามเวลาของการเปลี่ยนแปลง item ทั้งหมดในตาราง DynamoDB ใช้กับ Lambda สำหรับการประมวลผลที่ขับเคลื่อนด้วยเหตุการณ์ บทที่ 9 Domain 2

---

## E

**EBS (Elastic Block Store)** — block storage ที่แนบกับอินสแตนซ์ EC2 เดียว คงอยู่อย่างอิสระ ประเภท: gp3, io2, st1 บทที่ 6 Domain 3

**EC2 (Elastic Compute Cloud)** — เครื่องเสมือนบนคลาวด์ บทที่ 4 Domain 3

**ECS (Elastic Container Service)** — การจัดการคอนเทนเนอร์ที่จัดการ ประเภท Launch Fargate ขจัดการจัดการเซิร์ฟเวอร์ บทที่ 21 Domain 2, 3

**EFS (Elastic File System)** — ระบบไฟล์ NFS ที่ใช้ร่วมกัน เข้าถึงได้จากหลายอินสแตนซ์ EC2 ปรับขนาดอัตโนมัติ คลาสพื้นที่จัดเก็บรวมถึง Standard, Infrequent Access และ Archive พร้อม Intelligent-Tiering สำหรับการย้ายอัตโนมัติระหว่างระดับ บทที่ 6 Domain 3

**EKS (Elastic Kubernetes Service)** — Kubernetes control plane ที่จัดการบน AWS บทที่ 21 Domain 3

**Elastic Disaster Recovery (DRS)** — การจำลองระดับ block อย่างต่อเนื่องของเซิร์ฟเวอร์ (ภายในองค์กรหรือ EC2) ลงในพื้นที่ staging ต้นทุนต่ำ พร้อมอินสแตนซ์การกู้คืนที่เปิดในไม่กี่นาที — managed pilot light บทที่ 18 Domain 2

**ElastiCache** — การแคชแบบ in-memory ที่จัดการ Redis (ฟีเจอร์เยอะกว่า) หรือ Memcached (เรียบง่ายกว่า) บทที่ 10 Domain 3

**Elastic IP** — ที่อยู่ IP สาธารณะแบบ static ที่คุณจัดสรรและเชื่อมโยงกับอินสแตนซ์ EC2 ได้ใหม่ บทที่ 11 Domain 3

**Envelope encryption** — รูปแบบที่ข้อมูลเข้ารหัสด้วย data key (DEK) และ DEK เข้ารหัสด้วย master key (CMK ใน KMS) บทที่ 16 Domain 1

**EventBridge** — event bus สำหรับกำหนดเส้นทางเหตุการณ์จากบริการ AWS พันธมิตร SaaS และแหล่งที่กำหนดเองไปยัง targets รองรับ scheduled rules บทที่ 22 Domain 2

**Explicit deny** — IAM deny statement ที่ไม่สามารถถูกแทนที่ด้วย allow ใด มีความสำคัญเหนือ allows ทั้งหมด บทที่ 3 Domain 1

---

## F

**Failover routing (Route 53)** — กำหนดเส้นทางทราฟฟิกไปยัง endpoint รองเมื่อ endpoint หลักล้มเหลวการตรวจสอบสุขภาพ บทที่ 12 Domain 2

**Fargate** — เอนจิน compute แบบ serverless สำหรับ ECS และ EKS ไม่มีอินสแตนซ์ EC2 ที่ต้องจัดการ บทที่ 21 Domain 3

**Fan-out pattern** — หนึ่ง SNS topic ส่งข้อความเดียวกันไปยัง SQS queues หลายตัวพร้อมกัน บทที่ 19 Domain 2

**FIFO queue (SQS)** — การประมวลผลแบบ exactly-once การจัดลำดับที่เข้มงวด throughput ต่ำกว่า standard queues บทที่ 19 Domain 2

**Failure mode** — วิธีเฉพาะที่ระบบสามารถล้มเหลวได้ การระบุ failure modes ก่อนการผลิตเป็นแก่นของการทบทวนสถาปัตยกรรม บทที่ 32 Cross-domain

---

## G

**Gateway Endpoint** — ประเภท VPC endpoint ฟรีสำหรับ S3 และ DynamoDB กำหนดเส้นทางทราฟฟิกผ่านเครือข่ายส่วนตัวของ AWS ขจัดค่าใช้จ่าย NAT Gateway บทที่ 30 Domain 4

**Gateway Load Balancer (GWLB)** — load balancer Layer 3 สำหรับการแทรก virtual network appliances ของบุคคลที่สาม (firewalls, IDS/IPS) แบบ inline เข้าสู่ traffic flows บทที่ 7 Domain 1

**Geolocation routing (Route 53)** — กำหนดเส้นทางตามตำแหน่งทางภูมิศาสตร์ของแหล่งกำเนิด DNS query บทที่ 12 Domain 3

**Global Accelerator** — กำหนดเส้นทางทราฟฟิกไปยัง edge ของ AWS ที่ใกล้ที่สุดผ่าน Anycast ปรับปรุง latency สำหรับแอปพลิเคชัน dynamic บทที่ 25 Domain 3

**Glue (AWS)** — serverless ETL Glue Crawlers ค้นพบ schema; Glue Jobs แปลงข้อมูล; Data Catalog จัดเก็บ metadata บทที่ 26 Domain 3

**GSI (Global Secondary Index)** — index ทางเลือกบนตาราง DynamoDB ที่มี partition key ต่างกันและ sort key ที่เลือกได้ เปิดใช้รูปแบบ query ที่ยืดหยุ่น บทที่ 9 Domain 3

**GuardDuty** — บริการตรวจจับภัยคุกคามที่ใช้ ML บน CloudTrail, VPC Flow Logs และ DNS logs เพื่อตรวจจับกิจกรรมที่ผิดปกติ บทที่ 17 Domain 1

---

## H

**Health check (Route 53)** — ตรวจสอบความพร้อมใช้งานของ endpoint การตรวจสอบสุขภาพที่ล้มเหลวทริกเกอร์ failover routing บทที่ 12 Domain 2

**Hot partition (DynamoDB)** — partition ที่ได้รับทราฟฟิกไม่สมส่วนเพราะ requests จำนวนมากใช้ partition key เดียวกัน บทที่ 9 Domain 3

---

## I

**IAM (Identity and Access Management)** — ควบคุมการตรวจสอบสิทธิ์และการอนุญาตสำหรับ accounts AWS Users, groups, roles, policies บทที่ 3, 14 Domain 1

**IAM role** — IAM identity ที่มีข้อมูลรับรองชั่วคราว assume โดยบริการ users หรือ accounts อื่น บทที่ 3, 14 Domain 1

**Idempotency** — คุณสมบัติของการดำเนินการที่ให้ผลลัพธ์เหมือนกันไม่ว่าจะเรียกครั้งเดียวหรือหลายครั้ง สำคัญสำหรับระบบแบบกระจาย (การคืนเงิน การชำระเงิน การประมวลผลออร์เดอร์) บทที่ 32 Cross-domain

**Idempotency key** — ตัวระบุที่ไม่ซ้ำสำหรับการดำเนินการ ตรวจสอบก่อนดำเนินการเพื่อป้องกันการประมวลผลซ้ำ บทที่ 32 Cross-domain

**Interface Endpoint (PrivateLink)** — VPC endpoint สำหรับบริการ AWS ส่วนใหญ่ คิดราคาต่อชั่วโมง + ต่อ GB ให้การเชื่อมต่อส่วนตัวโดยไม่ผ่านอินเทอร์เน็ตหรือ NAT บทที่ 30 Domain 4

**Internet Gateway (IGW)** — อนุญาตให้อินสแตนซ์ใน public subnets สื่อสารกับอินเทอร์เน็ต ต้องการให้ route table ของ subnet มีเส้นทางไปยัง IGW บทที่ 11 Domain 3

**"It depends"** — คำตอบที่ซื่อสัตย์สำหรับคำถามสถาปัตยกรรมส่วนใหญ่ ซึ่งต้องเติมให้สมบูรณ์เสมอ: "ขึ้นอยู่กับรูปแบบการเข้าถึง / ขนาด / ผลของความล้มเหลว / ข้อจำกัดด้านต้นทุน" บทที่ 33 Cross-domain

---

## K

**Kinesis Data Firehose** — ชื่อเดิมของ Amazon Data Firehose: การส่งข้อมูลสตรีมมิงที่จัดการไปยัง S3, Redshift, OpenSearch ไม่ต้องจัดการ consumer คำถามสอบเก่าอาจยังใช้ชื่อเดิม บทที่ 26 Domain 3

**Kinesis Data Streams** — stream เหตุการณ์ที่เรียงตามเวลาแบบเรียลไทม์ ทนทาน เล่นซ้ำได้ภายในช่วงการเก็บรักษา (24 ชั่วโมงโดยค่าเริ่มต้น สูงสุด 365 วัน) วัดเป็น shards บทที่ 26 Domain 3

**KMS (Key Management Service)** — สร้าง จัดเก็บ และควบคุมกุญแจการเข้ารหัสสำหรับการเข้ารหัสขณะพัก บทที่ 16 Domain 1

---

## L

**Lambda** — ฟังก์ชัน serverless ที่ทริกเกอร์โดยเหตุการณ์ จ่ายต่อการเรียกใช้และต่อ ms ระยะเวลาสูงสุด 15 นาที บทที่ 20 Domain 2, 3, 4

**Lambda@Edge** — ฟังก์ชัน Lambda ที่รันที่ edge locations ของ CloudFront ปรับเปลี่ยน requests และ responses บทที่ 13 Domain 3

**AWS Lake Formation** — เลเยอร์ควบคุมการเข้าถึง data lake แบบรวมศูนย์บน S3 และ Glue Data Catalog ให้สิทธิ์แบบละเอียดที่ระดับตาราง คอลัมน์ และแถว ทำให้การตั้งค่า data lake ที่ปลอดภัยง่ายขึ้น บทที่ 26 Domain 3

**Latency-based routing (Route 53)** — กำหนดเส้นทาง DNS queries ไปยังภูมิภาค AWS ที่มี latency ที่วัดได้ต่ำที่สุด บทที่ 12 Domain 3

**Launch template** — template ที่มีเวอร์ชันระบุการกำหนดค่าอินสแตนซ์ EC2 สำหรับ Auto Scaling Groups บทที่ 7 Domain 3

**Least privilege** — แนวปฏิบัติที่ดีที่สุดของ IAM: ให้เฉพาะสิทธิ์ที่จำเป็น ไม่มากกว่านั้น บทที่ 3 Domain 1

**Lifecycle policy (S3)** — กฎที่เปลี่ยน objects ไปยังคลาสพื้นที่จัดเก็บที่ถูกกว่าหรือลบโดยอัตโนมัติตามอายุ บทที่ 23 Domain 4

**LSI (Local Secondary Index)** — index ทางเลือกบนตาราง DynamoDB ที่ใช้ partition key เดียวกันแต่ sort key ต่างกัน ต้องสร้างตอนสร้างตาราง บทที่ 9 Domain 3

---

## M

**Amazon Macie** — การค้นพบข้อมูลที่ละเอียดอ่อน (PII) ใน S3 ที่ใช้ ML และการระบุความเสี่ยงในการเปิดเผย GuardDuty เฝ้าดูพฤติกรรม Macie ตรวจสอบสิ่งที่จัดเก็บ บทที่ 17 Domain 1

**Memcached** — เอนจินการแคชแบบ in-memory ที่เรียบง่าย multi-threaded ไม่มี persistence ไม่มีโครงสร้างข้อมูล ใช้ Redis เว้นแต่คุณต้องการ multi-threading โดยแลกกับฟีเจอร์ บทที่ 10 Domain 3

**Amazon MemoryDB for Redis** — ฐานข้อมูลหลักแบบ in-memory ที่ทนทาน เข้ากันได้กับ Redis แตกต่างจาก ElastiCache MemoryDB เขียนไปยัง transaction log แบบ Multi-AZ รับประกันความทนทานของข้อมูล ใช้เมื่อต้องการความเข้ากันได้ของ Redis API และการสูญเสียข้อมูลยอมรับไม่ได้ บทที่ 10 Domain 3

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: การจำลองระดับ block ของเซิร์ฟเวอร์ทั้งเครื่องเข้าสู่ AWS การเปิดทดสอบ จากนั้น cutover ไปยังอินสแตนซ์ EC2 ดั้งเดิม DataSync ย้ายไฟล์; DMS ย้ายฐานข้อมูล; MGN ย้ายเซิร์ฟเวอร์ บทที่ 25 Domain 3

**Amazon MQ** — managed ActiveMQ/RabbitMQ broker ที่พูดโปรโตคอลมาตรฐาน (AMQP, MQTT, STOMP) สำหรับการ lift-and-shift workloads broker ที่มีอยู่โดยไม่เปลี่ยนโค้ด; การส่งข้อความที่สร้างใหม่ → SQS/SNS บทที่ 19 Domain 2

**Multi-AZ (RDS)** — standby replica แบบซิงโครนัสใน AZ อื่นพร้อมเฟลโอเวอร์อัตโนมัติ RPO ~0, RTO ~60 วินาที สำหรับความพร้อมใช้งานสูง ไม่ใช่การปรับขนาดการอ่าน บทที่ 8, 18 Domain 2

**Multi-Region** — การ deploy ส่วนประกอบแอปพลิเคชันข้ามหลายภูมิภาค AWS สำหรับความซ้ำซ้อนทางภูมิศาสตร์และประสิทธิภาพ global ความซับซ้อนและต้นทุนสูงกว่า บทที่ 18 Domain 2

---

## N

**Network Load Balancer (NLB)** — load balancer Layer 4 (TCP/UDP/TLS): หลายล้าน requests ต่อวินาที static IP ต่อ AZ คงไว้ซึ่ง source IP ไม่รับรู้ HTTP — นั่นคืองานของ ALB บทที่ 7 Domain 3

**NACL (Network Access Control List)** — ไฟร์วอลล์แบบ stateless ที่ระดับ subnet ต้องการทั้งกฎ inbound และ outbound กฎประเมินตามลำดับตัวเลข บทที่ 15 Domain 1

**NAT Gateway** — อนุญาตให้อินสแตนซ์ใน private subnets สร้างการเชื่อมต่อ outbound ไปยังอินเทอร์เน็ต คิดราคา $0.045/GB ที่ประมวลผล บทที่ 11, 30 Domain 4

---

## O

**Object (S3)** — ไฟล์ที่จัดเก็บใน S3 ประกอบด้วย key (ชื่อ) value (ข้อมูล) และ metadata ขนาดสูงสุด 5TB บทที่ 5 Domain 3

**On-Demand capacity (DynamoDB)** — โหมดจ่ายต่อ request แพงกว่าต่อ request เมื่อเทียบกับ provisioned แต่ไม่ต้องวางแผนความจุ บทที่ 29 Domain 4

**On-Demand instances (EC2)** — จ่ายต่อชั่วโมงโดยไม่มีความผูกพัน ความยืดหยุ่นสูงสุด ราคาสูงสุด บทที่ 27 Domain 4

**AWS Outposts** — แร็คฮาร์ดแวร์ AWS ที่จัดการอย่างเต็มรูปแบบ ติดตั้งในศูนย์ข้อมูลของลูกค้าเองหรือสถานที่ co-location รันบริการ APIs และเครื่องมือ AWS เดียวกันกับคลาวด์สาธารณะภายในองค์กร AWS จัดการการติดตั้งและการแพตช์; ลูกค้าจัดหาพื้นที่แร็คและพลังงาน สำหรับ data residency, workloads ภายในองค์กรที่ต้องการ latency ต่ำ หรือสถานการณ์ที่ตัดการเชื่อมต่อ บทที่ 2 Domain 4

---

## P

**Partition key (DynamoDB)** — ส่วนประกอบ primary key ที่กำหนดว่า partition ใดจัดเก็บ item เลือก key ที่มี cardinality สูงเพื่อการกระจายที่สม่ำเสมอ บทที่ 9 Domain 3

**Permission boundary** — IAM policy ที่กำหนดสิทธิ์สูงสุดที่ IAM identity สามารถมีได้ แม้ว่า policies อื่นจะให้มากกว่า บทที่ 14 Domain 1

**Placement group** — ควบคุมการวางทางกายภาพของอินสแตนซ์ EC2 เพื่อลด latency (cluster) หรือเพิ่มความพร้อมใช้งานสูงสุด (spread) บทที่ 4 Domain 3

**PrivateLink** — บริการ AWS สำหรับการสร้าง private endpoints ไปยังบริการที่โฮสต์ใน AWS เข้าถึงได้ผ่าน Interface Endpoints บทที่ 30 Domain 1

**Provisioned concurrency (Lambda)** — สภาพแวดล้อมการทำงานที่เริ่มต้นไว้ล่วงหน้าซึ่งขจัดความล่าช้า cold start บทที่ 20 Domain 3

**Provisioned capacity (DynamoDB)** — read และ write throughput ที่จัดสรรไว้ล่วงหน้า วัดเป็น capacity units ต่อวินาที ถูกกว่า on-demand สำหรับทราฟฟิกที่คาดการณ์ได้ บทที่ 9, 29 Domain 4

---

## Q

**Amazon QuickSight** — บริการ business intelligence และการแสดงข้อมูลด้วยภาพที่จัดการ ใช้ SPICE (Super-fast, Parallel, In-memory Calculation Engine) เพื่อแคชข้อมูลสำหรับการ render dashboard อย่างรวดเร็ว เชื่อมต่อกับ Athena, S3, Redshift, RDS และแหล่งข้อมูล AWS อื่นๆ ไม่มีเซิร์ฟเวอร์ BI ที่ต้องจัดการ บทที่ 26 Domain 3

---

## R

**RDS (Relational Database Service)** — ฐานข้อมูลเชิงสัมพันธ์ที่จัดการ จัดการการสำรองข้อมูล การแพตช์ การเฟลโอเวอร์ บทที่ 8 Domain 3

**RDS Proxy** — จัดการ connection pool ระหว่าง Lambda/แอปพลิเคชันกับ RDS ป้องกันการเชื่อมต่อหมด บทที่ 8 Domain 3

**Read Replica (RDS)** — สำเนาแบบอะซิงโครนัสของฐานข้อมูลสำหรับการปรับขนาดการอ่าน ไม่ให้เฟลโอเวอร์อัตโนมัติ บทที่ 8, 24 Domain 3

**Redis** — in-memory data structure store ใช้สำหรับการแคช การจัดการ session leaderboards เรียลไทม์ pub/sub บทที่ 10 Domain 3

**Reserved Instance (EC2)** — ความผูกพันในการใช้ประเภทอินสแตนซ์เฉพาะในภูมิภาคเฉพาะเป็นเวลา 1 หรือ 3 ปีเพื่อแลกกับส่วนลด บทที่ 27 Domain 4

**Route 53** — บริการ DNS และผู้รับจดทะเบียนโดเมนของ AWS รองรับนโยบายการกำหนดเส้นทางหลายแบบ บทที่ 12 Domain 2, 3

**RPO (Recovery Point Objective)** — การสูญเสียข้อมูลสูงสุดที่ยอมรับได้ วัดเป็นเวลา "เราสามารถยอมเสียข้อมูลได้มากเท่าใด?" บทที่ 18 Domain 2

**RTO (Recovery Time Objective)** — เวลาสูงสุดที่ยอมรับได้ในการกู้คืนบริการหลังความล้มเหลว "เราดาวน์ได้นานเท่าใด?" บทที่ 18 Domain 2

**Runbook** — คำแนะนำทีละขั้นตอนสำหรับการดำเนินงานระบบ โดยเฉพาะสำหรับการตอบสนองเหตุการณ์ "ใครทำอะไรตอนตีสาม?" บทที่ 32 Cross-domain

---

## S

**S3 Intelligent-Tiering** — ย้าย objects ใน S3 ระหว่างระดับการเข้าถึงโดยอัตโนมัติตามรูปแบบการเข้าถึง ไม่มีค่าธรรมเนียมการดึงข้อมูล บทที่ 23 Domain 4

**S3 Select** — ดึงส่วนหนึ่งของเนื้อหา object ใน S3 โดยใช้นิพจน์ SQL ลดการถ่ายโอนข้อมูล Legacy: ไม่มีให้สำหรับลูกค้าใหม่ตั้งแต่กลางปี 2024 — Athena เป็นเส้นทางหลักในการกรองและ query ข้อมูลใน S3 ขณะนี้ S3 Object Lambda ซึ่งเคยเป็นทางเลือกที่แนะนำ เองก็เป็น legacy (ปิดรับลูกค้าใหม่ในเดือนพฤศจิกายน 2025; workloads ที่มีอยู่ยังทำงานต่อไป) บทที่ 30 Domain 4

**Savings Plan** — รูปแบบการกำหนดราคาที่ยืดหยุ่นโดยผูกพันกับจำนวนเงินของการใช้จ่ายต่อชั่วโมงเพื่อแลกกับส่วนลด ยืดหยุ่นกว่า Reserved Instances บทที่ 27 Domain 4

**SCP (Service Control Policy)** — policy ของ AWS Organizations ที่จำกัดสิทธิ์สูงสุดที่ accounts ใน OU มีได้ บทที่ 14 Domain 1

**Secrets Manager** — จัดเก็บและหมุนเวียน secrets โดยอัตโนมัติ (รหัสผ่านฐานข้อมูล API keys) บทที่ 16 Domain 1

**Security group** — ไฟร์วอลล์เสมือนแบบ stateful ที่ระดับอินสแตนซ์ มีเฉพาะกฎ allow; ทราฟฟิกตอบกลับเป็นอัตโนมัติ บทที่ 15 Domain 1

**Shard (Kinesis)** — หน่วยพื้นฐานของ throughput ใน Kinesis Data Streams: เขียน 1 MB/s อ่าน 2 MB/s บทที่ 26 Domain 3

**Shared Responsibility Model** — AWS รับผิดชอบความปลอดภัย *ของ* คลาวด์ (โครงสร้างพื้นฐาน); คุณรับผิดชอบความปลอดภัย *ใน* คลาวด์ (ข้อมูล การกำหนดค่า การเข้าถึง) บทที่ 1 Domain 1

**Shield** — การป้องกัน DDoS Standard: ฟรี อัตโนมัติ Advanced: เสียเงิน พร้อมการสนับสนุน DRT และการป้องกันทางการเงิน บทที่ 17 Domain 1

**Snow Family** — อุปกรณ์ทางกายภาพสำหรับการถ่ายโอนข้อมูลปริมาณมากแบบออฟไลน์ (Snowball Edge: 80 TB) — การเช่าเหมาเที่ยวบินขนส่งสินค้าแทนการขับรถบนทางหลวง Legacy (2026): Snowmobile และ Snowcone ถูกยกเลิก; อุปกรณ์ Snow ปิดรับลูกค้าใหม่ในเดือนพฤศจิกายน 2025 (AWS ชี้ไปที่ DataSync และ Data Transfer Terminals) แต่การสอบ SAA-C03 ยังคงคาดหวัง Snowball สำหรับ "การถ่ายโอนหลายสัปดาห์ แบนด์วิดท์จำกัด" บทที่ 25 Domain 3

**SNS (Simple Notification Service)** — การส่งข้อความแบบ pub/sub ส่งข้อความไปยัง subscribers ทั้งหมดพร้อมกัน รูปแบบ fan-out บทที่ 19 Domain 2

**Sort key (DynamoDB)** — ส่วนประกอบที่สองที่เลือกได้ของ primary key เปิดใช้ range queries ภายใน partition บทที่ 9 Domain 3

**Spot Instances** — อินสแตนซ์ EC2 ที่ใช้กำลังการผลิตสำรองที่ส่วนลด 60-90% สามารถถูกขัดจังหวะด้วยการแจ้งล่วงหน้า 2 นาที เฉพาะสำหรับ workloads ที่ทนต่อความผิดพลาด บทที่ 27 Domain 4

**SQS (Simple Queue Service)** — คิวข้อความที่จัดการ แยก producers ออกจาก consumers Standard (at-least-once) และ FIFO (exactly-once) queues บทที่ 19 Domain 2

**Step Functions** — บริการจัดการ workflow แบบ serverless State machines สำหรับการประสานบริการ AWS บทที่ 22 Domain 2

**AWS Storage Gateway** — สะพานระหว่างพื้นที่จัดเก็บภายในองค์กรและคลาวด์: นำเสนอ interfaces NFS/SMB (File), iSCSI (Volume) หรือ virtual tape (Tape) ในเครื่อง ขณะคงข้อมูลไว้ใน S3, Glacier หรือ EBS snapshots บทที่ 6 Domain 3

---

## T

**Target tracking scaling** — นโยบาย Auto Scaling ที่ปรับความจุเพื่อรักษาค่า metric เป้าหมาย (เช่น การใช้ CPU 60%) บทที่ 7 Domain 2

**AWS Transfer Family** — managed SFTP/FTPS/FTP endpoint ที่ใช้ S3 หรือ EFS พันธมิตรใช้ไคลเอนต์ SFTP ที่มีอยู่ต่อไป; ไฟล์ลงใน bucket ของคุณโดยตรง บทที่ 25 Domain 3

**Transit Gateway** — โทโพโลยีเครือข่ายแบบ hub-and-spoke ที่เชื่อมหลาย VPC และเครือข่ายภายในองค์กรผ่าน gateway กลาง บทที่ 25 Domain 3

**TTL (Time to Live)** — timestamp ที่หลังจากนั้น DynamoDB ลบ item โดยอัตโนมัติ ยังใช้ใน DNS (resolvers แคช record นานเท่าใด) และการแคช (ค่าที่แคชใช้ได้นานเท่าใด) บทที่ 9, 12 Domain 3

---

## V

**VIF (Virtual Interface)** — การเชื่อมต่อเชิงตรรกะที่ใช้กับ AWS Direct Connect Public VIF เข้าถึง public endpoints ของ AWS; Private VIF เข้าถึงทรัพยากร VPC บทที่ 25 Domain 3

**Visibility timeout (SQS)** — ช่วงเวลาที่ข้อความที่ได้รับถูกซ่อนจาก consumers อื่น อนุญาตให้ประมวลผลโดยไม่มี consumers อื่นเห็นข้อความเดียวกัน บทที่ 19 Domain 2

**VPC (Virtual Private Cloud)** — เครือข่ายเสมือนที่แยกออกมาใน AWS ประกอบด้วย subnets, route tables และ gateways บทที่ 11 Domain 1

**VPC Endpoint** — เชื่อมทรัพยากร VPC กับบริการ AWS ผ่านเครือข่ายส่วนตัวของ AWS Gateway (ฟรี, S3/DynamoDB) และ Interface (คิดราคา, บริการอื่นๆ ส่วนใหญ่) บทที่ 30 Domain 1, 4

**VPC Flow Logs** — บันทึกข้อมูลเกี่ยวกับทราฟฟิก IP ที่ไป/มาจาก network interfaces ใน VPC ใช้โดย GuardDuty และสำหรับการแก้ปัญหาเครือข่าย บทที่ 17 Domain 1

**VPC Peering** — การเชื่อมต่อเครือข่ายระหว่างสอง VPC เปิดใช้ทราฟฟิกให้กำหนดเส้นทางระหว่างกันโดยใช้ที่อยู่ IP ส่วนตัว บทที่ 11 Domain 3

---

## W

**WAF (Web Application Firewall)** — กรองทราฟฟิก HTTP/HTTPS โดยใช้กฎ (การบล็อก IP, SQL injection, rate limits) แนบกับ CloudFront, ALB หรือ API Gateway บทที่ 17 Domain 1

**AWS Wavelength** — โครงสร้างพื้นฐาน AWS ที่ติดตั้งภายในเครือข่ายผู้ให้บริการโทรคมนาคม 5G ที่ radio edge เปิดใช้ latency ระดับมิลลิวินาทีหลักเดียวไปยังอุปกรณ์มือถือ สำหรับ mobile AR/VR, เกมเรียลไทม์, telemetry ของยานยนต์ไร้คนขับ และวิดีโอสดที่ 5G edge Wavelength Zones เป็นส่วนขยายของภูมิภาค AWS ภายในเครือข่ายโทรคมนาคม บทที่ 2 Domain 3

**Well-Architected Framework** — กรอบการประเมินหกเสาหลักของ AWS: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability บทที่ 31 Cross-domain

**Weighted routing (Route 53)** — กระจาย DNS queries ข้าม endpoints ตามน้ำหนัก ใช้สำหรับ blue-green deployments และ A/B testing บทที่ 12 Domain 3

**Write-through caching** — อัปเดต cache เมื่อใดก็ตามที่ฐานข้อมูลถูกอัปเดต ข้อมูลสอดคล้องเสมอ แต่ cache อาจเก็บ items จำนวนมากที่ไม่เคยอ่านซ้ำ บทที่ 10 Domain 3

---

## SAA-C03 Quick Pattern Reference

| หากการสอบบอกว่า...                              | คิดถึง...                                     |
|-----------------------------------------------|----------------------------------------------|
| "Decouple services"                           | SQS, SNS, EventBridge                        |
| "Fan-out to multiple consumers"               | SNS + SQS subscriptions                      |
| "Real-time ordered events"                    | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Global low latency (dynamic)"                | Global Accelerator                           |
| "Global low latency (static/cached)"          | CloudFront                                   |
| "DDoS protection"                             | Shield (Standard: ฟรี; Advanced: เสียเงิน)    |
| "Block SQL injection at edge"                 | WAF                                          |
| "Detect compromised credentials"              | GuardDuty                                    |
| "Audit API activity"                          | CloudTrail                                   |
| "Rotate database credentials"                 | Secrets Manager                              |
| "Encrypt data at rest, customer-managed keys" | KMS with CMK                                 |
| "Store configuration values"                  | SSM Parameter Store                          |
| "High IOPS database storage"                  | io2 EBS                                      |
| "Shared file system for EC2"                  | EFS                                          |
| "Query S3 data with SQL"                      | Athena                                       |
| "ETL pipeline for analytics"                  | AWS Glue                                     |
| "Deliver streaming data to S3"                | Amazon Data Firehose                         |
| "Fault-tolerant batch jobs, minimize cost"    | Spot Instances                               |
| "Committed, stable production workload"       | Savings Plans                                |
| "Private subnet → S3 without NAT"             | S3 Gateway Endpoint                          |
| "Private subnet → SQS without NAT"            | SQS Interface Endpoint                       |
| "Multi-AZ for RDS"                            | เฟลโอเวอร์อัตโนมัติ (ไม่ใช่การปรับขนาดการอ่าน)   |
| "Read Replica for RDS"                        | การปรับขนาดการอ่าน (ไม่ใช่เฟลโอเวอร์อัตโนมัติ)   |
| "Recovery time of 1–2 minutes, cross-AZ"      | Multi-AZ (RDS failover: 60–120 วินาที)        |
| "Recovery across regions, minutes RTO"        | Pilot Light หรือ Warm Standby                |
| "Active-Active, zero RTO"                     | Multi-Region Active-Active (ซับซ้อนที่สุด)     |
| "Batch processing beyond Lambda timeout"      | AWS Batch                                    |
| "Redis-compatible AND durable"                | MemoryDB for Redis                           |
| "Remote engineers access VPC from home"       | Client VPN                                   |
| "Migrate database with minimal downtime"      | DMS (+ SCT สำหรับ heterogeneous)             |
| "BI dashboard on AWS"                         | QuickSight                                   |
| "Run AWS in your own data center"             | Outposts                                     |
| "5G mobile edge compute"                      | Wavelength                                   |
