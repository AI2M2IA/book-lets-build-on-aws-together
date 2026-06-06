# ภาคผนวก ข: แผนที่โดเมน SAA-C03

การสอบ AWS Solutions Architect Associate (SAA-C03) จัดเป็นสี่โดเมน ภาคผนวกนี้จับคู่ทุกบทในหนังสือกับโดเมนและ task ที่เกี่ยวข้อง เพื่อให้คุณศึกษาตามพื้นที่การสอบแทนที่จะตามลำดับบท

---

## ภาพรวมโดเมน

| โดเมน                                            | น้ำหนัก | คำอธิบาย                                                |
|------------------------------------------------|--------|--------------------------------------------------------|
| Domain 1: Design Secure Architectures          | 30%    | IAM, ความปลอดภัยเครือข่าย, การปกป้องข้อมูล                |
| Domain 2: Design Resilient Architectures       | 26%    | ความพร้อมใช้งานสูง, การทนต่อความผิดพลาด, การกู้คืนจากภัยพิบัติ |
| Domain 3: Design High-Performing Architectures | 24%    | ประสิทธิภาพ Compute, storage, ฐานข้อมูล, เครือข่าย          |
| Domain 4: Design Cost-Optimized Architectures  | 20%    | รูปแบบการกำหนดราคา, การจัดการต้นทุน, การเพิ่มประสิทธิภาพทรัพยากร |

---

## Domain 1: Design Secure Architectures (30%)

**Task 1.1 — ออกแบบการเข้าถึงทรัพยากร AWS อย่างปลอดภัย**

แนวคิดหลัก: IAM users, groups, roles, policies หลักการ least privilege การเข้าถึงข้าม account Service roles SCP (Service Control Policies) ใน AWS Organizations

| บท         | หัวข้อ                                                                          |
|------------|------------------------------------------------------------------------------|
| บทที่ 3    | พื้นฐาน IAM: users, groups, roles, policies, การประเมิน policy                   |
| บทที่ 14   | IAM ขั้นสูง: roles สำหรับบริการ, permission boundaries, cross-account roles      |
| บทที่ 3    | ตรรกะการประเมิน policy: explicit deny > explicit allow > implicit deny          |
| บทที่ 14   | AWS Organizations, SCPs, Control Tower, Account Factory                       |
| บทที่ 14   | Cognito: User Pools (การเข้าสู่ระบบแอป, JWTs) และ Identity Pools (ข้อมูลรับรอง AWS ชั่วคราว) |

รูปแบบการสอบสำคัญ:

- "EC2 ต้องเข้าถึง S3 โดยไม่ hardcode ข้อมูลรับรอง" → IAM role พร้อม S3 policy แนบกับ EC2 instance profile
- "account ต่างกันต้องแชร์ทรัพยากร" → IAM role พร้อม cross-account trust policy
- "ป้องกัน IAM users ทั้งหมดใน OU จากการเข้าถึงบริการ" → SCP ใน AWS Organizations

---

**Task 1.2 — ออกแบบ workloads และแอปพลิเคชันที่ปลอดภัย**

แนวคิดหลัก: การออกแบบ VPC, security groups กับ NACLs, การแยกเครือข่าย, การป้องกัน DDoS, WAF, GuardDuty

| บท         | หัวข้อ                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| บทที่ 11   | การออกแบบ VPC: public/private subnets, NAT Gateway, Internet Gateway, route tables           |
| บทที่ 15   | Security groups (stateful, ระดับอินสแตนซ์) กับ NACLs (stateless, ระดับ subnet)               |
| บทที่ 17   | Shield (DDoS), WAF (app firewall), GuardDuty (ตรวจจับภัยคุกคาม), Inspector (สแกน CVE)         |
| บทที่ 17   | Macie: การค้นพบข้อมูลที่ละเอียดอ่อนใน S3 (PII, ข้อมูลรับรอง)                                  |
| บทที่ 25   | Direct Connect, VPN, Transit Gateway, PrivateLink                                          |

รูปแบบการสอบสำคัญ:

- "บล็อก IP เฉพาะจาก subnet" → กฎ deny ของ NACL
- "อนุญาต HTTP เข้า อนุญาตการตอบกลับ HTTP ออกอัตโนมัติ" → Security group (stateful)
- "ป้องกันแอปพลิเคชันเว็บจาก SQL injection" → WAF พร้อมกฎ SQL injection
- "ตรวจจับข้อมูลรับรอง IAM ที่ถูกบุกรุก" → GuardDuty

---

**Task 1.3 — กำหนดการควบคุมความปลอดภัยข้อมูลที่เหมาะสม**

แนวคิดหลัก: การเข้ารหัสขณะพักและขณะส่ง, KMS, Secrets Manager, Parameter Store, S3 server-side encryption

| บท         | หัวข้อ                                                                     |
|------------|--------------------------------------------------------------------------|
| บทที่ 16   | KMS: customer-managed keys, การหมุนเวียนกุญแจ, envelope encryption          |
| บทที่ 16   | Secrets Manager: การหมุนเวียนข้อมูลรับรองอัตโนมัติ, การดึง secret ขณะ runtime |
| บทที่ 16   | ACM (AWS Certificate Manager): ใบรับรอง SSL/TLS สำหรับ ALB, CloudFront      |
| บทที่ 5    | ตัวเลือกการเข้ารหัส S3: SSE-S3, SSE-KMS, SSE-C                             |
| บทที่ 8    | การเข้ารหัส RDS ขณะพัก (ต้องเปิดใช้ตอนสร้าง)                                |

รูปแบบการสอบสำคัญ:

- "หมุนเวียนข้อมูลรับรองฐานข้อมูลอัตโนมัติ" → Secrets Manager พร้อมการรวม RDS
- "ควบคุมว่าใครใช้กุญแจเข้ารหัสได้ข้าม account" → KMS key policy
- "จัดเก็บค่าการกำหนดค่าที่ไม่ใช่ secret" → SSM Parameter Store (ไม่ใช่ Secrets Manager)
- "เข้ารหัส objects ใน S3 ด้วยกุญแจที่บริษัทจัดการ" → SSE-KMS พร้อม CMK

---

## Domain 2: Design Resilient Architectures (26%)

**Task 2.1 — ออกแบบสถาปัตยกรรมที่ปรับขนาดได้และเชื่อมโยงกันแบบหลวม**

แนวคิดหลัก: Auto Scaling, load balancers, การแยกด้วย SQS/SNS, Lambda event triggers, ECS/EKS, Step Functions

| บท         | หัวข้อ                                                              |
|------------|--------------------------------------------------------------------|
| บทที่ 7    | Auto Scaling Groups, Application Load Balancer, นโยบายการปรับขนาด     |
| บทที่ 19   | SQS (การแยกด้วยคิว), SNS (การแจ้งเตือนแบบ fan-out)                   |
| บทที่ 20   | Lambda: serverless compute, event triggers, concurrency            |
| บทที่ 20   | API Gateway: REST/HTTP/WebSocket APIs ที่จัดการ, แบบเดี่ยวหรือ + Lambda |
| บทที่ 21   | ECS และ EKS: microservices ที่ใส่ในคอนเทนเนอร์                       |
| บทที่ 22   | Step Functions: การจัดการ workflow                                  |
| บทที่ 26   | Kinesis: การสตรีมข้อมูลแบบเรียลไทม์                                  |

รูปแบบการสอบสำคัญ:

- "แยกการประมวลผลออร์เดอร์จากการอัปเดตสินค้าคงคลัง" → SQS queue ระหว่างบริการ
- "แจ้งเตือนหลายบริการเมื่อมีออร์เดอร์ใหม่" → SNS topic พร้อม SQS subscriptions (fan-out)
- "ประมวลผลการอัปโหลด S3 โดยอัตโนมัติ" → S3 event notification → Lambda
- "รัน workflow หลายขั้นตอนพร้อมตรรกะการลองใหม่" → Step Functions

---

**Task 2.2 — ออกแบบสถาปัตยกรรมที่มีความพร้อมใช้งานสูงและ/หรือทนต่อความผิดพลาด**

แนวคิดหลัก: Multi-AZ, Multi-Region, Route 53 failover, RDS read replicas, Aurora Global Database, backup and restore

| บท         | หัวข้อ                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| บทที่ 2    | โครงสร้างพื้นฐาน global ของ AWS: Regions, AZs, edge locations                                  |
| บทที่ 7    | ALB ข้ามหลาย AZ, ASG แทนที่อินสแตนซ์ที่ไม่สมบูรณ์                                              |
| บทที่ 8    | RDS Multi-AZ: การจำลองแบบซิงโครนัส, เฟลโอเวอร์อัตโนมัติ                                         |
| บทที่ 12   | Route 53: failover routing, latency routing, health checks                                   |
| บทที่ 18   | Multi-AZ กับ Multi-Region: RTO/RPO, กลยุทธ์ DR (pilot light, warm standby, active-active)      |
| บทที่ 18   | AWS Backup (การสำรองข้อมูลแบบรวมศูนย์ ข้าม account), Elastic Disaster Recovery (managed pilot light) |
| บทที่ 24   | Aurora Global Database: cross-region read replicas, replication lag < 1 วินาที                |

รูปแบบการสอบสำคัญ:

- "เฟลโอเวอร์อัตโนมัติหาก RDS หลักล้มเหลว" → RDS Multi-AZ (ไม่ใช่ Read Replica)
- "ให้บริการการอ่านทั่วโลกด้วย latency ต่ำ" → Aurora Global Database
- "กำหนดเส้นทางทราฟฟิกไปยังภูมิภาครองหากภูมิภาคหลักไม่พร้อมใช้งาน" → Route 53 พร้อม Failover routing + health checks
- "RTO 1 นาที, RPO 0" → การ deploy Multi-AZ (ไม่ใช่ Multi-Region)
- "RTO 15 นาที, ข้ามภูมิภาค" → กลยุทธ์ Pilot Light

---

## Domain 3: Design High-Performing Architectures (24%)

**Task 3.1 — กำหนดโซลูชันพื้นที่จัดเก็บที่มีประสิทธิภาพสูงและ/หรือปรับขนาดได้**

แนวคิดหลัก: S3 กับ EBS กับ EFS, การเลือกคลาสพื้นที่จัดเก็บ, S3 Transfer Acceleration, multipart upload, CloudFront สำหรับ assets

| บท         | หัวข้อ                                                                    |
|------------|-------------------------------------------------------------------------|
| บทที่ 5    | S3: object storage, คลาสพื้นที่จัดเก็บ, versioning, lifecycle              |
| บทที่ 6    | EBS: ประเภท block storage (gp3, io2, st1), EFS: shared file storage       |
| บทที่ 6    | Storage Gateway: สะพานไฮบริดจากภายในองค์กรสู่ S3 (File, Volume, Tape)      |
| บทที่ 23   | การเปลี่ยนคลาสพื้นที่จัดเก็บ S3, ตัวเลือกการดึงข้อมูล Glacier               |
| บทที่ 25   | DataSync (การซิงค์ไฟล์ออนไลน์), Transfer Family (managed SFTP→S3), Snow Family (การถ่ายโอนปริมาณมากแบบออฟไลน์ — legacy: ปิดรับลูกค้าใหม่ในเดือนพฤศจิกายน 2025; ปัจจุบัน AWS ชี้ไปที่ DataSync และ Data Transfer Terminals), MGN (การ rehost เซิร์ฟเวอร์) |
| บทที่ 28   | การ right-size EBS, การย้าย gp2→gp3, การจัดการ snapshot                    |

รูปแบบการสอบสำคัญ:

- "ระบบไฟล์ที่ใช้ร่วมกันเข้าถึงได้จากหลายอินสแตนซ์ EC2" → EFS (ไม่ใช่ EBS; EBS แนบกับอินสแตนซ์เดียว)
- "IOPS สูงสำหรับ workload ฐานข้อมูล" → io2 EBS
- "ลดต้นทุนสำหรับไฟล์ที่ไม่เข้าถึงใน 90 วัน" → S3 lifecycle policy → Glacier
- "อัปโหลดไฟล์ขนาดใหญ่จากที่ห่างไกลได้เร็วขึ้น" → S3 Transfer Acceleration
- "การถ่ายโอนหลายสัปดาห์ผ่านแบนด์วิดท์จำกัด" → การสอบ SAA-C03 ยังคงคาดหวัง Snowball แม้ตระกูล Snow จะปิดรับลูกค้าใหม่ในปี 2025

---

**Task 3.2 — กำหนดโซลูชัน Compute ที่มีประสิทธิภาพสูงและ/หรือปรับขนาดได้**

แนวคิดหลัก: ตระกูลอินสแตนซ์ EC2, โปรเซสเซอร์ Graviton, Auto Scaling, Lambda, Fargate, Spot Instances

| บท         | หัวข้อ                                                                                    |
|------------|-----------------------------------------------------------------------------------------|
| บทที่ 4    | ประเภทอินสแตนซ์ EC2: compute-optimized (c), memory-optimized (r), general purpose (m, t)  |
| บทที่ 7    | Auto Scaling: การปรับขนาดแนวนอนสำหรับ web tiers                                          |
| บทที่ 20   | Lambda: concurrency, provisioned concurrency (สำหรับ latency ที่สม่ำเสมอ)                  |
| บทที่ 21   | ECS Fargate: serverless containers                                                      |
| บทที่ 21   | AWS Batch: managed batch compute สำหรับ Docker containers, ใช้ Spot                       |
| บทที่ 27   | Spot Instances สำหรับ workloads แบบ batch ที่ทนต่อความผิดพลาด                              |

รูปแบบการสอบสำคัญ:

- "workload การฝึก ML, ลดต้นทุน, ขัดจังหวะได้" → Spot Instances
- "การตอบสนอง Lambda ที่สม่ำเสมอต่ำกว่า 100ms" → Provisioned concurrency (ขจัด cold start)
- "microservice ที่ใส่ในคอนเทนเนอร์, ไม่จัดการโครงสร้างพื้นฐาน" → ECS Fargate

---

**Task 3.3 — กำหนดโซลูชันฐานข้อมูลที่มีประสิทธิภาพสูง**

แนวคิดหลัก: RDS กับ DynamoDB กับ Aurora กับ Redshift กับ ElastiCache, รูปแบบการเข้าถึง, read replicas, DAX

| บท         | หัวข้อ                                                              |
|------------|--------------------------------------------------------------------|
| บทที่ 8    | RDS: ฐานข้อมูลเชิงสัมพันธ์ที่จัดการ, เมื่อใดควรใช้ RDBMS              |
| บทที่ 9    | DynamoDB: NoSQL, partition keys, GSI, DAX (in-memory cache)        |
| บทที่ 10   | ElastiCache: Redis กับ Memcached, กลยุทธ์การแคช                     |
| บทที่ 10   | MemoryDB for Redis: ฐานข้อมูลหลักที่ทนทานและเข้ากันได้กับ Redis       |
| บทที่ 24   | Aurora: ประสิทธิภาพ, Serverless v2, read replicas, Global Database  |
| บทที่ 29   | DynamoDB on-demand กับ provisioned capacity พร้อม Auto Scaling      |

รูปแบบการสอบสำคัญ:

- "การอ่านระดับไมโครวินาทีสำหรับ session store" → ElastiCache Redis หรือ DAX (หาก backend เป็น DynamoDB)
- "การเข้าถึง key-value แบบ throughput สูงพร้อม schema ยืดหยุ่น" → DynamoDB
- "การ join ซับซ้อนและ ACID transactions" → Aurora หรือ RDS
- "การวิเคราะห์ข้อมูลที่มีโครงสร้างระดับเพตะไบต์" → Redshift (ไม่ครอบคลุมโดยละเอียด แต่สัญญาณ: "data warehouse" → Redshift)

---

**Task 3.4 — กำหนดสถาปัตยกรรมเครือข่ายที่มีประสิทธิภาพสูงและ/หรือปรับขนาดได้**

แนวคิดหลัก: CloudFront, Global Accelerator, Direct Connect, VPN, placement groups, enhanced networking

| บท         | หัวข้อ                                                              |
|------------|--------------------------------------------------------------------|
| บทที่ 7    | NLB (Layer 4) และ GWLB (Gateway Load Balancer สำหรับ network appliances) |
| บทที่ 11   | Client VPN: การเข้าถึง VPC แบบเข้ารหัสจากอุปกรณ์แต่ละเครื่อง          |
| บทที่ 12   | Route 53: นโยบายการกำหนดเส้นทาง: latency-based, geolocation, weighted |
| บทที่ 13   | CloudFront: CDN, edge caching, Lambda@Edge                         |
| บทที่ 25   | AWS Global Accelerator: การกำหนดเส้นทาง Anycast เข้าสู่ AWS backbone  |
| บทที่ 25   | Direct Connect: การเชื่อมต่อส่วนตัวโดยเฉพาะ                          |
| บทที่ 30   | VPC Endpoints: การเชื่อมต่อส่วนตัวกับบริการ AWS                      |

รูปแบบการสอบสำคัญ:

- "ลด latency สำหรับผู้ใช้ทั่วโลกที่เข้าถึงการตอบสนอง API แบบ dynamic" → Global Accelerator (ไม่ใช่ CloudFront ซึ่งดีที่สุดสำหรับเนื้อหาที่แคชได้)
- "ลด latency สำหรับ assets แบบ static ทั่วโลก" → CloudFront
- "การเชื่อมต่อส่วนตัวที่สม่ำเสมอกับ AWS จากภายในองค์กร" → Direct Connect
- "อัปโหลดเร็วจากลูกค้าทั่วโลกไปยัง S3 bucket ของคุณ" → S3 Transfer Acceleration

---

**Task 3.5 — กำหนดโซลูชันการนำเข้าและการแปลงข้อมูลที่มีประสิทธิภาพสูง**

แนวคิดหลัก: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR

| บท         | หัวข้อ                                                               |
|------------|---------------------------------------------------------------------|
| บทที่ 26   | Kinesis Data Streams: การประมวลผลเหตุการณ์ที่มีลำดับแบบเรียลไทม์        |
| บทที่ 26   | Amazon Data Firehose (เดิมคือ Kinesis Data Firehose): การส่งที่จัดการไปยัง S3, Redshift, OpenSearch |
| บทที่ 26   | AWS Glue: serverless ETL, Data Catalog, Crawlers                    |
| บทที่ 26   | Athena: serverless SQL บน S3                                        |
| บทที่ 26   | QuickSight: managed BI dashboards, เอนจิน in-memory SPICE           |
| บทที่ 26   | Lake Formation: การควบคุมการเข้าถึง data lake แบบละเอียด             |

รูปแบบการสอบสำคัญ:

- "ประมวลผลข้อมูล click-stream แบบเรียลไทม์" → Kinesis Data Streams + Lambda หรือ Managed Service for Apache Flink (เดิมคือ Kinesis Data Analytics)
- "ส่งข้อมูลสตรีมมิงไปยัง S3 เพื่อการวิเคราะห์ภายหลัง" → Amazon Data Firehose
- "แปลงและจัดทำ catalog ข้อมูลจากหลายแหล่ง" → AWS Glue
- "query ข้อมูลประวัติที่จัดเก็บใน S3 ด้วย SQL" → Athena

---

## Domain 4: Design Cost-Optimized Architectures (20%)

**Task 4.1 — ออกแบบโซลูชันพื้นที่จัดเก็บที่เพิ่มประสิทธิภาพต้นทุน**

| บท         | หัวข้อ                                                              |
|------------|--------------------------------------------------------------------|
| บทที่ 23   | นโยบาย S3 lifecycle, การเปลี่ยนคลาสพื้นที่จัดเก็บ                     |
| บทที่ 28   | การ right-size EBS, การย้าย gp2→gp3, กฎ lifecycle ของ S3 versioning  |
| บทที่ 28   | EFS Intelligent-Tiering, cost allocation tags, AWS Budgets         |

รูปแบบการสอบสำคัญ:

- "ระบุว่าทีมใดสร้างต้นทุน S3 มากที่สุด" → Cost allocation tags + Cost Explorer
- "ลดต้นทุนสำหรับ objects ที่เข้าถึงไม่บ่อยโดยอัตโนมัติ" → S3 Intelligent-Tiering
- "แจ้งเตือนเมื่อต้นทุนรายเดือนเกิน $10,000" → AWS Budgets

---

**Task 4.2 — ออกแบบโซลูชัน Compute ที่เพิ่มประสิทธิภาพต้นทุน**

| บท         | หัวข้อ                                                                            |
|------------|----------------------------------------------------------------------------------|
| บทที่ 2    | Outposts: แร็ค AWS ภายในองค์กร (การแลกเปลี่ยนระหว่าง capital cost กับ cloud opex)   |
| บทที่ 2    | Wavelength: 5G edge compute (พันธมิตรโทรคมนาคม, การวางตาม latency)                 |
| บทที่ 27   | การกำหนดราคา EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| บทที่ 20   | Lambda: จ่ายต่อการเรียกใช้ (ไม่มีต้นทุนขณะว่าง)                                     |

รูปแบบการสอบสำคัญ:

- "ลดต้นทุนสำหรับ workloads การผลิตที่คงที่" → Savings Plans (ยืดหยุ่นกว่า) หรือ Reserved Instances
- "ลดต้นทุนสำหรับ batch jobs ที่ขัดจังหวะได้" → Spot Instances
- "การประมวลผลที่ขับเคลื่อนด้วยเหตุการณ์โดยไม่มีต้นทุนขณะว่าง" → Lambda

---

**Task 4.3 — ออกแบบโซลูชันฐานข้อมูลที่เพิ่มประสิทธิภาพต้นทุน**

| บท         | หัวข้อ                                             |
|------------|---------------------------------------------------|
| บทที่ 29   | DynamoDB on-demand กับ provisioned + Auto Scaling |
| บทที่ 29   | RDS และ ElastiCache Reserved Instances/Nodes      |
| บทที่ 29   | การจัดการ RDS snapshot                            |

รูปแบบการสอบสำคัญ:

- "ทราฟฟิก DynamoDB ที่คาดการณ์ไม่ได้" → โหมดความจุ On-demand
- "ทราฟฟิก DynamoDB ที่คงที่พร้อมจุดสูงสุดที่ทราบ" → Provisioned + Auto Scaling
- "ลดต้นทุน RDS สำหรับ workload ที่คงที่" → Reserved Instances (1 หรือ 3 ปี)

---

**Task 4.4 — ออกแบบสถาปัตยกรรมเครือข่ายที่เพิ่มประสิทธิภาพต้นทุน**

| บท         | หัวข้อ                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| บทที่ 30   | การกำหนดราคาการถ่ายโอนข้อมูล: inbound (ฟรี), cross-AZ ($0.01/GB), cross-region, internet ($0.09/GB) |
| บทที่ 30   | NAT Gateway ($0.045/GB) กับ VPC Endpoints (Gateway: ฟรี; Interface: คิดราคา)                   |
| บทที่ 30   | CloudFront เป็นตัวเพิ่มประสิทธิภาพต้นทุนการถ่ายโอนข้อมูล                                        |

รูปแบบการสอบสำคัญ:

- "EC2 ใน private subnet เรียก S3 — ขจัดต้นทุน NAT Gateway" → S3 Gateway Endpoint (ฟรี)
- "EC2 ใน private subnet เรียก SQS — ลดต้นทุน NAT Gateway" → SQS Interface Endpoint
- "ลดต้นทุนการถ่ายโอนข้อมูลสำหรับการส่งเนื้อหาทั่วโลก" → CloudFront (การแคชลด requests ไปยัง origin)

---

## หัวข้อข้ามโดเมน

บางหัวข้อปรากฏข้ามหลายโดเมน:

| หัวข้อ                               | โดเมน    | บท           |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | ทั้งหมด  | 31           |
| การทบทวนสถาปัตยกรรมและ ADRs          | ทั้งหมด  | 32           |
| การให้เหตุผลแบบ trade-off ("ขึ้นอยู่กับ") | ทั้งหมด  | 33           |
| การออกแบบ Multi-AZ                  | 2, 3    | 7, 8, 18, 24 |
| การตรวจสอบและ observability          | 1, 2    | ตลอดทั้งเล่ม   |
| CloudFront                         | 3, 4    | 13, 30       |

---

## รายการตรวจสอบก่อนสอบ

ก่อนนั่งสอบ SAA-C03:

**พื้นที่ที่มีน้ำหนักสูง (มีแนวโน้มปรากฏมากที่สุด)**

- [ ] ตรรกะการประเมิน policy ของ IAM (explicit deny → explicit allow → implicit deny)
- [ ] ส่วนประกอบ VPC: subnets, route tables, IGW, NAT Gateway, security groups, NACLs
- [ ] คลาสพื้นที่จัดเก็บ S3 และเมื่อใดควรใช้แต่ละคลาส
- [ ] RDS Multi-AZ กับ Read Replica (เฟลโอเวอร์ กับ การปรับขนาดการอ่าน)
- [ ] SQS กับ SNS กับ EventBridge (pull กับ push กับ event routing)
- [ ] รูปแบบการกำหนดราคา EC2: Spot สำหรับงานทนต่อความผิดพลาด, Savings Plans สำหรับ workloads ที่ผูกพัน
- [ ] Lambda triggers และ concurrency
- [ ] DynamoDB กับ Aurora กับ Redshift (รูปแบบการเข้าถึงกำหนดการเลือก)
- [ ] CloudFront: CDN สำหรับ static, Global Accelerator สำหรับ dynamic

**กับดักที่พบบ่อย**

- [ ] EBS แนบกับอินสแตนซ์เดียว; EFS ใช้ร่วมกันได้
- [ ] RDS Read Replicas ใช้สำหรับการปรับขนาดการอ่าน ไม่ใช่เฟลโอเวอร์อัตโนมัติ (นั่นคือ Multi-AZ)
- [ ] NACLs เป็น stateless (ต้องมีทั้งกฎ inbound และ outbound)
- [ ] Gateway Endpoints ฟรีและใช้ได้เฉพาะ S3 และ DynamoDB
- [ ] Kinesis เก็บและเล่นซ้ำ; SQS ลบเมื่อบริโภค
- [ ] "Decouple" ไม่ได้หมายถึง SQS เสมอ — SNS fan-out และ EventBridge ก็เป็นรูปแบบการแยกเช่นกัน
- [ ] Shield Standard ฟรีและอัตโนมัติ; Advanced เป็นการสมัครสมาชิกที่เสียเงิน
- [ ] ElastiCache กับ MemoryDB: ElastiCache = cache (การสูญเสียข้อมูลยอมรับได้) MemoryDB = ฐานข้อมูลหลักที่ทนทาน
- [ ] Client VPN กับ Site-to-Site VPN: Client VPN = อุปกรณ์แต่ละเครื่อง Site-to-Site = network-to-network
- [ ] Outposts กับ Wavelength: Outposts = แร็ค AWS ภายในองค์กร Wavelength = 5G edge
- [ ] DMS: homogeneous = DMS โดยตรง Heterogeneous = SCT ก่อน จากนั้น DMS
- [ ] DataSync ย้าย *ไฟล์*; DMS ย้าย *ฐานข้อมูล*; MGN ย้าย *เซิร์ฟเวอร์ทั้งเครื่อง*

**โครงสร้างการสอบ**

- 65 คำถาม, 130 นาที (2 ชั่วโมง 10 นาที)
- ปรนัย (ถูกหนึ่งข้อ) และเลือกหลายคำตอบ (เลือก N ข้อที่ถูก)
- คะแนนผ่าน: 720 จาก 1000
- คำถามที่ไม่นับคะแนนถูกฝังอยู่ คุณไม่สามารถบอกได้ว่าข้อใด
- จัดการเวลา: ~2 นาทีต่อคำถาม; ทำเครื่องหมายข้อที่ยากและกลับมาทำ
