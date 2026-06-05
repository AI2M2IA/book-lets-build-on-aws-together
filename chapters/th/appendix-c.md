# ภาคผนวก ค: ทะเบียนแนวคิด

แนวคิดหลักทุกข้อที่แนะนำในหนังสือ แมปกับบท การเปรียบเปรยที่ใช้ และโดเมน SAA-C03 ที่ปรากฏ

ใช้เป็นดัชนีการเรียน: หากคุณยังไม่แน่ใจในแนวคิดใดก่อนสอบ ค้นหาที่นี่แล้วกลับไปที่บทของมันเพื่อดูบริบท

---

## A

**ACU (Aurora Capacity Unit)** — หน่วยวัดสำหรับ Aurora Serverless v2 capacity ปรับขนาดโดยอัตโนมัติ Chapter 24. Domain 3.

**Alarm (CloudWatch)** — กฎที่ทำงานเมื่อ metric ข้ามขีดจำกัด ทริกเกอร์การแจ้งเตือนหรือการดำเนินการ auto scaling Chapter 7. Domain 2.

**ALB (Application Load Balancer)** — Layer 7 load balancer ที่กำหนดเส้นทางทราฟฟิก HTTP/HTTPS ตามกฎ path และ host Chapter 7. Domain 2.

**AMI (Amazon Machine Image)** — Template ที่มี OS ซอฟต์แวร์ และ configuration สำหรับอินสแตนซ์ EC2 Chapter 4. Domain 3.

**Architect mindset** — การถามว่า "อะไรจะพังก่อน เราจะรู้ได้อย่างไร และคนจะทำอะไรตอนตี 3?" แทนที่จะถามแค่ "สิ่งนี้ทำงานอย่างไร?" Chapter 32, Chapter 34. Cross-domain.

**Architecture Decision Record (ADR)** — เอกสารสั้นๆ ที่บันทึกการตัดสินใจ ทางเลือกของมัน เหตุผล และสิ่งที่จะทำให้ต้องพิจารณาใหม่ Chapter 32. Cross-domain.

**Architecture review** — กระบวนการที่มีโครงสร้างครอบคลุม: ข้อจำกัด → สิ่งที่ไม่รู้ → ตัวเลือก → โหมดความล้มเหลว → การตรวจสอบ → runbooks Chapter 32. Cross-domain.

**Athena** — บริการ SQL query แบบ Serverless สำหรับข้อมูลใน S3 จ่ายต่อ TB ที่สแกน ดีที่สุดกับรูปแบบ columnar Parquet/ORC Chapter 26. Domain 3.

**Auto Scaling Group (ASG)** — กลุ่มของอินสแตนซ์ EC2 ที่จัดการร่วมกัน แทนที่อินสแตนซ์ที่ไม่แข็งแรงโดยอัตโนมัติและปรับขนาดตามโหลด Chapter 7. Domain 2, 3.

**Availability Zone (AZ)** — data centers ที่แยกออกจากกันทางกายภาพหนึ่งแห่งหรือมากกว่าภายในภูมิภาค เชื่อมต่อด้วยลิงก์ latency ต่ำ Chapter 2. Domain 2.

---

## B

**Bucket (S3)** — Container สำหรับ S3 objects Buckets มีชื่อ global ที่ไม่ซ้ำกันและอยู่ในภูมิภาคเฉพาะ Chapter 5. Domain 3.

**Bucket policy** — Resource-based policy ที่แนบกับ S3 bucket ควบคุมการเข้าถึงสำหรับ IAM principals และบัญชีภายนอก Chapter 5. Domain 1.

---

## C

**Cache-aside pattern** — แอปพลิเคชันตรวจสอบ cache ก่อน เมื่อ miss จะ query ฐานข้อมูล แล้วเก็บผลใน cache Chapter 10. Domain 3.

**Cache hit rate** — เปอร์เซ็นต์ของ requests ที่ให้บริการจาก cache แทนที่จะเป็น origin ยิ่งสูงยิ่งดี Chapter 13. Domain 3.

**CloudFront** — AWS CDN แคชเนื้อหาที่ 400+ edge locations ทั่วโลก ลด latency และต้นทุนการถ่ายโอนข้อมูลจาก origin Chapter 13. Domain 3, 4.

**CloudTrail** — บันทึก AWS API call ทุกครั้ง: ใคร อะไร เมื่อไหร่ จากที่ไหน จัดเก็บใน S3 ใช้สำหรับการตรวจสอบและการสืบสวนเหตุการณ์ Domain 1.

**CloudWatch** — Metrics, logs, alarms และ dashboards สำหรับทรัพยากร AWS และแอปพลิเคชันที่กำหนดเอง อ้างอิงตลอดทั้งเล่ม ทุกโดเมน

**Cold start (Lambda)** — ความล่าช้าในการเรียกใช้ครั้งแรก (หรือหลังจากไม่ได้ใช้งาน) ขณะที่ Lambda เริ่มต้น execution environment ใช้ provisioned concurrency เพื่อกำจัด Chapter 20. Domain 3.

**Compute Savings Plan** — ความผูกพันต่อจำนวนเงินค่าใช้จ่าย EC2 ต่อชั่วโมง ใช้กับประเภทหรือขนาดอินสแตนซ์ใดก็ได้ Chapter 27. Domain 4.

**Config (AWS)** — ติดตามการเปลี่ยนแปลง configuration กับทรัพยากร AWS ตลอดเวลาและประเมินการปฏิบัติตามกฎ Chapter 31. Domain 1.

**Cross-AZ data transfer** — ทราฟฟิกระหว่าง Availability Zones ภายในภูมิภาค เรียกเก็บเงิน $0.01/GB ทั้งสองทิศทาง Chapter 30. Domain 4.

**Cross-region replication** — การคัดลอกข้อมูล (S3 CRR, Aurora Global, DynamoDB Global Tables) ไปยังภูมิภาคอื่น เกิดค่าใช้จ่ายการถ่ายโอนข้อมูล Chapters 18, 30. Domain 2.

---

## D

**DAX (DynamoDB Accelerator)** — In-memory cache เฉพาะสำหรับ DynamoDB Microsecond read latency Chapter 9. Domain 3.

**Dead Letter Queue (DLQ)** — คิวที่ส่งข้อความที่ล้มเหลวในการประมวลผลซ้ำๆ ป้องกัน queue blockage Chapter 19. Domain 2.

**Dedicated Host** — เซิร์ฟเวอร์ EC2 ทางกายภาพที่สงวนไว้สำหรับการใช้งานของคุณโดยเฉพาะ จำเป็นสำหรับ software licenses บางอย่าง Chapter 27. Domain 4.

**Defense in depth** — การวาง security controls หลายชั้น (IAM + security groups + NACLs + WAF + GuardDuty) เพื่อให้การบุกรุกชั้นหนึ่งไม่เปิดเผยระบบ Chapter 33. Domain 1.

**Direct Connect** — การเชื่อมต่อเครือข่ายส่วนตัวเฉพาะจากสถานที่ on-premises ไปยัง AWS สม่ำเสมอกว่า VPN Chapter 25. Domain 3.

**DLQ** — ดู Dead Letter Queue

**DynamoDB** — ฐานข้อมูล NoSQL ที่ได้รับการจัดการอย่างเต็มรูปแบบที่มี latency millisecond ตัวเลขเดียวในทุกขนาด โมเดล key-value และ document Chapter 9. Domain 3.

**DynamoDB Auto Scaling** — ปรับ provisioned read/write capacity โดยอัตโนมัติตาม CloudWatch metrics Chapter 29. Domain 4.

**DynamoDB Streams** — Change log ตามเวลาของการเปลี่ยนแปลง item ทั้งหมดในตาราง DynamoDB ใช้กับ Lambda สำหรับการประมวลผลแบบ event-driven Chapter 9. Domain 2.

---

## E

**EBS (Elastic Block Store)** — Block storage ที่แนบกับอินสแตนซ์ EC2 เดียว คงอยู่โดยอิสระ ประเภท: gp3, io2, st1 Chapter 6. Domain 3.

**EC2 (Elastic Compute Cloud)** — เครื่องเสมือนบนคลาวด์ Chapter 4. Domain 3.

**ECS (Elastic Container Service)** — การจัดระเบียบ container ที่ได้รับการจัดการ ประเภท Fargate launch ลบการจัดการเซิร์ฟเวอร์ Chapter 21. Domain 2, 3.

**EFS (Elastic File System)** — ระบบไฟล์ NFS ที่ใช้ร่วมกันซึ่งเข้าถึงได้จากหลายอินสแตนซ์ EC2 ปรับขนาดโดยอัตโนมัติ Chapter 6. Domain 3.

**EKS (Elastic Kubernetes Service)** — Kubernetes control plane ที่ได้รับการจัดการบน AWS Chapter 21. Domain 3.

**ElastiCache** — In-memory caching ที่ได้รับการจัดการ Redis (ฟีเจอร์มากกว่า) หรือ Memcached (เรียบง่ายกว่า) Chapter 10. Domain 3.

**Elastic IP** — Public IP address แบบ static ที่คุณสามารถจัดสรรและ re-associate กับอินสแตนซ์ EC2 Chapter 11. Domain 3.

**Envelope encryption** — รูปแบบที่ข้อมูลถูกเข้ารหัสด้วย data key (DEK) และ DEK ถูกเข้ารหัสด้วย master key (CMK ใน KMS) Chapter 16. Domain 1.

**EventBridge** — Event bus สำหรับกำหนดเส้นทาง events จากบริการ AWS พาร์ทเนอร์ SaaS และ sources ที่กำหนดเองไปยัง targets รองรับ scheduled rules Chapter 22. Domain 2.

**Explicit deny** — คำสั่ง IAM deny ที่ไม่สามารถถูก override โดย allow ใดๆ มีความสำคัญเหนือ allows ทั้งหมด Chapter 3. Domain 1.

---

## F

**Failover routing (Route 53)** — กำหนดเส้นทางทราฟฟิกไปยัง endpoint รองเมื่อ primary ล้มเหลว health checks Chapter 12. Domain 2.

**Fargate** — Serverless compute engine สำหรับ ECS และ EKS ไม่มีอินสแตนซ์ EC2 ที่ต้องจัดการ Chapter 21. Domain 3.

**Fan-out pattern** — SNS topic หนึ่งส่งข้อความเดียวกันไปยัง SQS queues หลายตัวพร้อมกัน Chapter 19. Domain 2.

**FIFO queue (SQS)** — การประมวลผลแบบ exactly-once การเรียงลำดับที่เข้มงวด throughput ต่ำกว่า standard queues Chapter 19. Domain 2.

**Failure mode** — วิธีเฉพาะที่ระบบสามารถล้มเหลว การระบุ failure modes ก่อน production เป็นหัวใจของ architecture review Chapter 32. Cross-domain.

---

## G

**Gateway Endpoint** — ประเภท VPC endpoint ฟรีสำหรับ S3 และ DynamoDB กำหนดเส้นทางทราฟฟิกผ่าน AWS private network กำจัดค่าใช้จ่าย NAT Gateway Chapter 30. Domain 4.

**Geolocation routing (Route 53)** — กำหนดเส้นทางตามที่ตั้งทางภูมิศาสตร์ของ DNS query origin Chapter 12. Domain 3.

**Global Accelerator** — กำหนดเส้นทางทราฟฟิกไปยัง AWS edge ที่ใกล้ที่สุดผ่าน Anycast ปรับปรุง latency สำหรับแอปพลิเคชัน dynamic Chapter 25. Domain 3.

**Glue (AWS)** — Serverless ETL Glue Crawlers ค้นพบ schema; Glue Jobs transform ข้อมูล; Data Catalog จัดเก็บ metadata Chapter 26. Domain 3.

**GSI (Global Secondary Index)** — Alternate index บนตาราง DynamoDB ที่มี partition key และ sort key ที่เลือกได้แตกต่างกัน เปิดใช้งานรูปแบบ query ที่ยืดหยุ่น Chapter 9. Domain 3.

**GuardDuty** — บริการตรวจจับภัยคุกคามที่ใช้ ML บน CloudTrail, VPC Flow Logs และ DNS logs เพื่อตรวจจับกิจกรรมที่ผิดปกติ Chapter 17. Domain 1.

---

## H

**Health check (Route 53)** — ตรวจสอบความพร้อมใช้งานของ endpoint Health checks ที่ล้มเหลวทริกเกอร์ failover routing Chapter 12. Domain 2.

**Hot partition (DynamoDB)** — Partition ที่ได้รับทราฟฟิกไม่สมส่วนเพราะ requests หลายรายการแชร์ partition key เดียวกัน Chapter 9. Domain 3.

---

## I

**IAM (Identity and Access Management)** — ควบคุมการยืนยันตัวตนและการอนุญาตสำหรับบัญชี AWS Users, groups, roles, policies Chapter 3, 14. Domain 1.

**IAM role** — IAM identity ที่มี temporary credentials สันนิษฐานโดยบริการ users หรือบัญชีอื่น Chapter 3, 14. Domain 1.

**Idempotency** — คุณสมบัติของการดำเนินการที่ให้ผลลัพธ์เดียวกันไม่ว่าจะเรียกใช้ครั้งเดียวหรือหลายครั้ง สำคัญมากสำหรับระบบ distributed (การคืนเงิน การชำระเงิน การประมวลผลคำสั่ง) Chapter 32. Cross-domain.

**Idempotency key** — ตัวระบุที่ไม่ซ้ำกันสำหรับการดำเนินการ ตรวจสอบก่อนการทำงานเพื่อป้องกันการประมวลผลซ้ำ Chapter 32. Cross-domain.

**Interface Endpoint (PrivateLink)** — VPC endpoint สำหรับบริการ AWS ส่วนใหญ่ ราคาต่อชั่วโมง + ต่อ GB ให้การเชื่อมต่อส่วนตัวโดยไม่ใช้อินเทอร์เน็ตหรือ NAT Chapter 30. Domain 4.

**Internet Gateway (IGW)** — อนุญาตให้อินสแตนซ์ใน public subnets สื่อสารกับอินเทอร์เน็ต ต้องการ route table ของ subnet ที่มีเส้นทางไปยัง IGW Chapter 11. Domain 3.

**"It depends"** — คำตอบที่ซื่อสัตย์สำหรับคำถาม architecture ส่วนใหญ่ ซึ่งต้องสมบูรณ์เสมอ: "ขึ้นอยู่กับ access pattern / scale / ผลของความล้มเหลว / ข้อจำกัดด้านต้นทุน" Chapter 33. Cross-domain.

---

## K

**Kinesis Data Firehose** — การส่ง streaming data ที่ได้รับการจัดการไปยัง S3, Redshift, OpenSearch ไม่ต้องจัดการ consumers Chapter 26. Domain 3.

**Kinesis Data Streams** — Event stream แบบ real-time เรียงลำดับ ทนทาน replayable วัดเป็น shards Chapter 26. Domain 3.

**KMS (Key Management Service)** — สร้าง จัดเก็บ และควบคุม cryptographic keys สำหรับการเข้ารหัสขณะพัก Chapter 16. Domain 1.

---

## L

**Lambda** — Serverless functions ที่ทริกเกอร์โดย events จ่ายต่อการเรียกใช้และต่อ ms ระยะเวลาสูงสุด 15 นาที Chapter 20. Domain 2, 3, 4.

**Lambda@Edge** — Lambda functions ที่รันที่ CloudFront edge locations แก้ไข requests และ responses Chapter 13. Domain 3.

**Latency-based routing (Route 53)** — กำหนดเส้นทาง DNS queries ไปยัง AWS region ที่มี latency ที่วัดได้ต่ำที่สุด Chapter 12. Domain 3.

**Launch template** — Template ที่มีเวอร์ชันที่ระบุ EC2 instance configuration สำหรับ Auto Scaling Groups Chapter 7. Domain 3.

**Least privilege** — IAM best practice: ให้เฉพาะสิทธิ์ที่จำเป็น ไม่มากไปกว่านั้น Chapter 3. Domain 1.

**Lifecycle policy (S3)** — กฎที่ย้าย objects โดยอัตโนมัติไปยังคลาสพื้นที่จัดเก็บที่ถูกกว่าหรือลบตามอายุ Chapter 23. Domain 4.

**LSI (Local Secondary Index)** — Alternate index บนตาราง DynamoDB ที่ใช้ partition key เดียวกันแต่ sort key ต่างกัน ต้องสร้างเมื่อสร้างตาราง Chapter 9. Domain 3.

---

## M

**Memcached** — Simple, multi-threaded in-memory caching engine ไม่มีความคงอยู่ ไม่มีโครงสร้างข้อมูล ใช้ Redis เว้นแต่คุณต้องการ multi-threading โดยแลกกับฟีเจอร์ Chapter 10. Domain 3.

**Multi-AZ (RDS)** — Synchronous standby replica ใน AZ ต่างกันพร้อม automatic failover RPO ~0, RTO ~60 วินาที สำหรับ high availability ไม่ใช่ read scaling Chapter 8, 18. Domain 2.

**Multi-Region** — การ deploy ส่วนประกอบแอปพลิเคชันในหลาย AWS regions สำหรับความซ้ำซ้อนทางภูมิศาสตร์และประสิทธิภาพ global ความซับซ้อนและต้นทุนสูงขึ้น Chapter 18. Domain 2.

---

## N

**NACL (Network Access Control List)** — Stateless firewall ระดับ subnet ต้องการทั้งกฎขาเข้าและขาออก กฎประเมินตามลำดับตัวเลข Chapter 15. Domain 1.

**NAT Gateway** — อนุญาตให้อินสแตนซ์ใน private subnets สร้างการเชื่อมต่อขาออกกับอินเทอร์เน็ต เรียกเก็บเงิน $0.045/GB ที่ประมวลผล Chapter 11, 30. Domain 4.

---

## O

**Object (S3)** — ไฟล์ที่จัดเก็บใน S3 ประกอบด้วย key (ชื่อ) value (ข้อมูล) และ metadata ขนาดสูงสุด 5TB Chapter 5. Domain 3.

**On-Demand capacity (DynamoDB)** — โหมดจ่ายต่อ request แพงกว่าต่อ request มากกว่า provisioned แต่ไม่ต้องวางแผน capacity Chapter 29. Domain 4.

**On-Demand instances (EC2)** — จ่ายต่อชั่วโมงโดยไม่มีความผูกพัน ความยืดหยุ่นสูงสุด ราคาสูงสุด Chapter 27. Domain 4.

---

## P

**Partition key (DynamoDB)** — ส่วนประกอบ primary key ที่กำหนดว่า partition ไหนจัดเก็บ item เลือก key ที่มี cardinality สูงเพื่อการกระจายที่สม่ำเสมอ Chapter 9. Domain 3.

**Permission boundary** — IAM policy ที่กำหนดสิทธิ์สูงสุดที่ IAM identity สามารถมีได้ แม้ว่า policies อื่นจะให้มากกว่า Chapter 14. Domain 1.

**Placement group** — ควบคุมตำแหน่งทางกายภาพของอินสแตนซ์ EC2 เพื่อลด latency (cluster) หรือเพิ่ม availability สูงสุด (spread) Chapter 4. Domain 3.

**PrivateLink** — AWS service สำหรับสร้าง private endpoints กับบริการที่โฮสต์ใน AWS เข้าถึงได้ผ่าน Interface Endpoints Chapter 30. Domain 1.

**Provisioned concurrency (Lambda)** — Pre-initialized execution environments ที่กำจัด cold start delays Chapter 20. Domain 3.

**Provisioned capacity (DynamoDB)** — Pre-allocated read และ write throughput วัดเป็นหน่วยความจุต่อวินาที ถูกกว่า on-demand สำหรับทราฟฟิกที่คาดเดาได้ Chapter 9, 29. Domain 4.

---

## R

**RDS (Relational Database Service)** — Managed relational database จัดการ backups การแพตช์ เฟลโอเวอร์ Chapter 8. Domain 3.

**RDS Proxy** — จัดการ connection pool ระหว่าง Lambda/แอปพลิเคชันและ RDS ป้องกัน connection exhaustion Chapter 8. Domain 3.

**Read Replica (RDS)** — สำเนาฐานข้อมูลแบบอะซิงโครนัสสำหรับ read scaling ไม่มี automatic failover Chapter 8, 24. Domain 3.

**Redis** — In-memory data structure store ใช้สำหรับ caching การจัดการ session real-time leaderboards, pub/sub Chapter 10. Domain 3.

**Reserved Instance (EC2)** — ความผูกพันในการใช้ประเภทอินสแตนซ์เฉพาะในภูมิภาคเฉพาะเป็นเวลา 1 หรือ 3 ปีเพื่อแลกกับส่วนลด Chapter 27. Domain 4.

**Route 53** — AWS DNS service และ domain registrar รองรับนโยบายการกำหนดเส้นทางหลายอย่าง Chapter 12. Domain 2, 3.

**RPO (Recovery Point Objective)** — การสูญเสียข้อมูลที่ยอมรับได้สูงสุดวัดเป็นเวลา "เราสามารถสูญเสียข้อมูลได้มากแค่ไหน?" Chapter 18. Domain 2.

**RTO (Recovery Time Objective)** — เวลาที่ยอมรับได้สูงสุดในการกู้คืนบริการหลังความล้มเหลว "เราสามารถหยุดทำงานได้นานแค่ไหน?" Chapter 18. Domain 2.

**Runbook** — คำแนะนำทีละขั้นตอนสำหรับการดำเนินงานระบบ โดยเฉพาะสำหรับการตอบสนองต่อเหตุการณ์ "คนจะทำอะไรตอนตี 3?" Chapter 32. Cross-domain.

---

## S

**S3 Intelligent-Tiering** — ย้าย S3 objects ระหว่างระดับการเข้าถึงโดยอัตโนมัติตาม access patterns ไม่มีค่าการดึงข้อมูล Chapter 23. Domain 4.

**S3 Select** — ดึงข้อมูลส่วนย่อยของ S3 object โดยใช้ SQL expressions ลดการถ่ายโอนข้อมูล Chapter 30. Domain 4.

**Savings Plan** — โมเดลราคาที่ยืดหยุ่นที่ผูกพันต่อจำนวนเงินค่าใช้จ่ายต่อชั่วโมงเพื่อแลกกับส่วนลด ยืดหยุ่นกว่า Reserved Instances Chapter 27. Domain 4.

**SCP (Service Control Policy)** — นโยบาย AWS Organizations ที่จำกัดสิทธิ์สูงสุดที่มีให้กับบัญชีใน OU Chapter 14. Domain 1.

**Secrets Manager** — จัดเก็บและหมุน secrets โดยอัตโนมัติ (database passwords, API keys) Chapter 16. Domain 1.

**Security group** — Virtual firewall แบบ stateful ระดับอินสแตนซ์ มีเฉพาะกฎ allow; ทราฟฟิกที่ส่งกลับเป็นอัตโนมัติ Chapter 15. Domain 1.

**Shard (Kinesis)** — หน่วยพื้นฐาน throughput ใน Kinesis Data Streams: เขียน 1 MB/s อ่าน 2 MB/s Chapter 26. Domain 3.

**Shared Responsibility Model** — AWS รับผิดชอบความปลอดภัย *ของ* cloud (infrastructure); คุณรับผิดชอบความปลอดภัย *ใน* cloud (ข้อมูล configuration การเข้าถึง) Chapter 1. Domain 1.

**Shield** — การป้องกัน DDoS Standard: ฟรี อัตโนมัติ Advanced: ต้องจ่ายเงิน พร้อมการสนับสนุน DRT และการป้องกันทางการเงิน Chapter 17. Domain 1.

**SNS (Simple Notification Service)** — การส่งข้อความแบบ Pub/sub ส่งข้อความไปยัง subscribers ทั้งหมดพร้อมกัน รูปแบบ fan-out Chapter 19. Domain 2.

**Sort key (DynamoDB)** — ส่วนประกอบที่สองของ primary key ที่เลือกได้ เปิดใช้งาน range queries ภายใน partition Chapter 9. Domain 3.

**Spot Instances** — อินสแตนซ์ EC2 ที่ใช้ spare capacity ในราคาลด 60-90% สามารถถูกขัดจังหวะพร้อมแจ้งเตือน 2 นาที เฉพาะสำหรับ workloads ที่ fault-tolerant Chapter 27. Domain 4.

**SQS (Simple Queue Service)** — Managed message queue แยก producers ออกจาก consumers Standard (at-least-once) และ FIFO (exactly-once) queues Chapter 19. Domain 2.

**Step Functions** — Serverless workflow orchestration service State machines สำหรับการประสานงานบริการ AWS Chapter 22. Domain 2.

---

## T

**Target tracking scaling** — นโยบาย Auto Scaling ที่ปรับ capacity เพื่อรักษาค่า metric เป้าหมาย (เช่น CPU utilization 60%) Chapter 7. Domain 2.

**Transit Gateway** — Hub-and-spoke network topology เชื่อมต่อ VPCs หลายตัวและเครือข่าย on-premises ผ่าน gateway กลาง Chapter 25. Domain 3.

**TTL (Time to Live)** — Timestamp หลังจากที่ DynamoDB ลบ item โดยอัตโนมัติ ยังใช้ใน DNS (resolvers แคช record นานแค่ไหน) และ caching (ค่าที่แคชมีความถูกต้องนานแค่ไหน) Chapters 9, 12. Domain 3.

---

## V

**VIF (Virtual Interface)** — การเชื่อมต่อแบบ logical ที่ใช้กับ AWS Direct Connect Public VIF เข้าถึง AWS public endpoints; Private VIF เข้าถึงทรัพยากร VPC Chapter 25. Domain 3.

**Visibility timeout (SQS)** — ระยะเวลาที่ข้อความที่ได้รับถูกซ่อนจากผู้บริโภคอื่น อนุญาตให้ประมวลผลโดยไม่ให้ผู้บริโภคอื่นเห็นข้อความเดียวกัน Chapter 19. Domain 2.

**VPC (Virtual Private Cloud)** — เครือข่ายเสมือนที่แยกออกใน AWS ประกอบด้วย subnets, route tables และ gateways Chapter 11. Domain 1.

**VPC Endpoint** — เชื่อมต่อทรัพยากร VPC กับบริการ AWS ผ่าน AWS private network Gateway (ฟรี S3/DynamoDB) และ Interface (มีราคา บริการอื่นส่วนใหญ่) Chapter 30. Domain 1, 4.

**VPC Flow Logs** — บันทึกข้อมูลเกี่ยวกับทราฟฟิก IP ที่ไปและมาจาก network interfaces ใน VPC ใช้โดย GuardDuty และสำหรับการแก้ปัญหาเครือข่าย Chapter 17. Domain 1.

**VPC Peering** — การเชื่อมต่อเครือข่ายระหว่างสอง VPCs ที่เปิดใช้งานให้ทราฟฟิกกำหนดเส้นทางระหว่างกันโดยใช้ private IP addresses Chapter 11. Domain 3.

---

## W

**WAF (Web Application Firewall)** — กรองทราฟฟิก HTTP/HTTPS โดยใช้กฎ (บล็อก IP, SQL injection, ขีดจำกัด rate) แนบกับ CloudFront, ALB หรือ API Gateway Chapter 17. Domain 1.

**Well-Architected Framework** — กรอบการประเมินหกเสาหลักของ AWS: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability Chapter 31. Cross-domain.

**Weighted routing (Route 53)** — กระจาย DNS queries ระหว่าง endpoints ตามน้ำหนัก ใช้สำหรับการ deploy แบบ blue-green และการทดสอบ A/B Chapter 12. Domain 3.

**Write-through caching** — อัปเดต cache เมื่อใดก็ตามที่ฐานข้อมูลถูกอัปเดต ข้อมูลสม่ำเสมอเสมอแต่ cache อาจเก็บ items หลายรายการที่ไม่เคยอ่านซ้ำ Chapter 10. Domain 3.

---

## SAA-C03 Quick Pattern Reference

| ถ้าการสอบบอกว่า... | ให้คิดถึง... |
|---|---|
| "Decouple services" | SQS, SNS, EventBridge |
| "Fan-out to multiple consumers" | SNS + SQS subscriptions |
| "Real-time ordered events" | Kinesis Data Streams |
| "Serverless" | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Global low latency (dynamic)" | Global Accelerator |
| "Global low latency (static/cached)" | CloudFront |
| "DDoS protection" | Shield (Standard: ฟรี; Advanced: ต้องจ่ายเงิน) |
| "Block SQL injection at edge" | WAF |
| "Detect compromised credentials" | GuardDuty |
| "Audit API activity" | CloudTrail |
| "Rotate database credentials" | Secrets Manager |
| "Encrypt data at rest, customer-managed keys" | KMS with CMK |
| "Store configuration values" | SSM Parameter Store |
| "High IOPS database storage" | io2 EBS |
| "Shared file system for EC2" | EFS |
| "Query S3 data with SQL" | Athena |
| "ETL pipeline for analytics" | AWS Glue |
| "Deliver streaming data to S3" | Kinesis Firehose |
| "Fault-tolerant batch jobs, minimize cost" | Spot Instances |
| "Committed, stable production workload" | Savings Plans |
| "Private subnet → S3 without NAT" | S3 Gateway Endpoint |
| "Private subnet → SQS without NAT" | SQS Interface Endpoint |
| "Multi-AZ for RDS" | Automatic failover (ไม่ใช่ read scaling) |
| "Read Replica for RDS" | Read scaling (ไม่ใช่ automatic failover) |
| "Recovery time < 1 minute, cross-AZ" | Multi-AZ |
| "Recovery across regions, minutes RTO" | Pilot Light or Warm Standby |
| "Active-Active, zero RTO" | Multi-Region Active-Active (ซับซ้อนที่สุด) |
