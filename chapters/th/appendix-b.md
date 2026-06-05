# ภาคผนวก ข: แผนที่โดเมน SAA-C03

การสอบ AWS Solutions Architect Associate (SAA-C03) ถูกจัดระเบียบเป็นสี่โดเมน ภาคผนวกนี้แมปทุกบทในหนังสือกับโดเมนและงานที่เกี่ยวข้อง เพื่อให้คุณสามารถเรียนตามพื้นที่การสอบแทนที่จะเรียนตามลำดับบท

---

## ภาพรวมโดเมน

| โดเมน | น้ำหนัก | คำอธิบาย |
|---|---|---|
| Domain 1: Design Secure Architectures | 30% | IAM ความปลอดภัยเครือข่าย การป้องกันข้อมูล |
| Domain 2: Design Resilient Architectures | 26% | High availability fault tolerance การกู้คืนจากภัยพิบัติ |
| Domain 3: Design High-Performing Architectures | 24% | Compute storage database ประสิทธิภาพเครือข่าย |
| Domain 4: Design Cost-Optimized Architectures | 20% | โมเดลราคา การจัดการต้นทุน การปรับแต่งทรัพยากร |

---

## Domain 1: Design Secure Architectures (30%)

**Task 1.1 — ออกแบบการเข้าถึงทรัพยากร AWS ที่ปลอดภัย**

แนวคิดหลัก: IAM users, groups, roles, policies หลักการสิทธิ์น้อยที่สุด การเข้าถึงข้ามบัญชี Service roles SCP (Service Control Policies) ใน AWS Organizations

| บท | หัวข้อ |
|---|---|
| Chapter 3 | พื้นฐาน IAM: users, groups, roles, policies, logic การประเมิน policy |
| Chapter 14 | IAM ขั้นสูง: roles สำหรับบริการ permission boundaries, cross-account roles |
| Chapter 3 | Logic การประเมิน policy: explicit deny > explicit allow > implicit deny |
| Chapter 14 | AWS Organizations และ SCPs |

รูปแบบการสอบหลัก:

- "EC2 ต้องการเข้าถึง S3 โดยไม่มี credentials ที่ hardcode" → IAM role พร้อม S3 policy แนบกับ EC2 instance profile
- "บัญชีต่างๆ ต้องการแชร์ทรัพยากร" → IAM role พร้อม cross-account trust policy
- "ป้องกันไม่ให้ IAM users ทั้งหมดใน OU เข้าถึงบริการ" → SCP ใน AWS Organizations

---

**Task 1.2 — ออกแบบ workloads และแอปพลิเคชันที่ปลอดภัย**

แนวคิดหลัก: การออกแบบ VPC, security groups กับ NACLs, network isolation, การป้องกัน DDoS, WAF, GuardDuty

| บท | หัวข้อ |
|---|---|
| Chapter 11 | การออกแบบ VPC: public/private subnets, NAT Gateway, Internet Gateway, route tables |
| Chapter 15 | Security groups (stateful ระดับอินสแตนซ์) กับ NACLs (stateless ระดับ subnet) |
| Chapter 17 | Shield (การป้องกัน DDoS), WAF (application firewall), GuardDuty (การตรวจจับภัยคุกคาม) |
| Chapter 25 | Direct Connect, VPN, Transit Gateway, PrivateLink |

รูปแบบการสอบหลัก:

- "บล็อก IP เฉพาะจาก subnet" → กฎ NACL deny
- "อนุญาต HTTP เข้า อนุญาต HTTP response ออกโดยอัตโนมัติ" → Security group (stateful)
- "ป้องกัน web application จาก SQL injection" → WAF พร้อมกฎ SQL injection
- "ตรวจจับ IAM credentials ที่ถูกบุกรุก" → GuardDuty

---

**Task 1.3 — กำหนด data security controls ที่เหมาะสม**

แนวคิดหลัก: การเข้ารหัสขณะพักและระหว่างส่ง, KMS, Secrets Manager, Parameter Store, S3 server-side encryption

| บท | หัวข้อ |
|---|---|
| Chapter 16 | KMS: customer-managed keys การหมุน key envelope encryption |
| Chapter 16 | Secrets Manager: การหมุน credential อัตโนมัติ การดึง secret ณ runtime |
| Chapter 5 | ตัวเลือกการเข้ารหัส S3: SSE-S3, SSE-KMS, SSE-C |
| Chapter 8 | การเข้ารหัส RDS ขณะพัก (ต้องเปิดใช้งานเมื่อสร้าง) |

รูปแบบการสอบหลัก:

- "หมุน credentials ฐานข้อมูลโดยอัตโนมัติ" → Secrets Manager พร้อมการรวม RDS
- "ควบคุมว่าใครสามารถใช้ encryption keys ข้ามบัญชี" → KMS key policy
- "จัดเก็บ configuration values ที่ไม่ใช่ secret" → SSM Parameter Store (ไม่ใช่ Secrets Manager)
- "เข้ารหัส S3 objects ด้วย keys ที่บริษัทจัดการ" → SSE-KMS พร้อม CMK

---

## Domain 2: Design Resilient Architectures (26%)

**Task 2.1 — ออกแบบ architectures ที่ปรับขนาดได้และเชื่อมต่อกันอย่างหลวมๆ**

แนวคิดหลัก: Auto Scaling, load balancers, การแยก SQS/SNS, Lambda event triggers, ECS/EKS, Step Functions

| บท | หัวข้อ |
|---|---|
| Chapter 7 | Auto Scaling Groups, Application Load Balancer, นโยบายการปรับขนาด |
| Chapter 19 | SQS (การแยกด้วยคิว), SNS (การแจ้งเตือนแบบ fan-out) |
| Chapter 20 | Lambda: Serverless compute, event triggers, concurrency |
| Chapter 21 | ECS และ EKS: containerized microservices |
| Chapter 22 | Step Functions: การจัดระเบียบ workflow |
| Chapter 26 | Kinesis: real-time data streaming |

รูปแบบการสอบหลัก:

- "แยกการประมวลผลคำสั่งออกจากการอัปเดตสินค้าคงคลัง" → SQS queue ระหว่างบริการ
- "แจ้งเตือนหลายบริการเมื่อมีคำสั่งใหม่" → SNS topic พร้อม SQS subscriptions (fan-out)
- "ประมวลผล S3 uploads โดยอัตโนมัติ" → S3 event notification → Lambda
- "รัน multi-step workflow พร้อม retry logic" → Step Functions

---

**Task 2.2 — ออกแบบ architectures ที่มีความพร้อมใช้งานสูงและ/หรือ fault-tolerant**

แนวคิดหลัก: Multi-AZ, Multi-Region, Route 53 failover, RDS read replicas, Aurora Global Database, backup และ restore

| บท | หัวข้อ |
|---|---|
| Chapter 2 | AWS global infrastructure: Regions, AZs, edge locations |
| Chapter 7 | ALB ข้าม multiple AZs, ASG แทนที่อินสแตนซ์ที่ไม่แข็งแรง |
| Chapter 8 | RDS Multi-AZ: การจำลองแบบซิงโครนัส เฟลโอเวอร์อัตโนมัติ |
| Chapter 12 | Route 53: failover routing, latency routing, health checks |
| Chapter 18 | Multi-AZ กับ Multi-Region: RTO/RPO กลยุทธ์ DR (pilot light, warm standby, active-active) |
| Chapter 24 | Aurora Global Database: cross-region read replicas, replication lag < 1 วินาที |

รูปแบบการสอบหลัก:

- "เฟลโอเวอร์อัตโนมัติหาก primary RDS ล้มเหลว" → RDS Multi-AZ (ไม่ใช่ Read Replica)
- "ให้บริการการอ่านทั่วโลกด้วย latency ต่ำ" → Aurora Global Database
- "กำหนดเส้นทางทราฟฟิกไปยัง secondary region หาก primary ไม่พร้อมใช้งาน" → Route 53 พร้อม Failover routing + health checks
- "RTO 1 นาที RPO 0" → การ deploy Multi-AZ (ไม่ใช่ Multi-Region)
- "RTO 15 นาที ข้ามภูมิภาค" → กลยุทธ์ Pilot Light

---

## Domain 3: Design High-Performing Architectures (24%)

**Task 3.1 — กำหนด storage solutions ที่มีประสิทธิภาพสูงและ/หรือปรับขนาดได้**

แนวคิดหลัก: S3 กับ EBS กับ EFS การเลือกคลาสพื้นที่จัดเก็บ S3 Transfer Acceleration multipart upload CloudFront สำหรับ assets

| บท | หัวข้อ |
|---|---|
| Chapter 5 | S3: object storage, คลาสพื้นที่จัดเก็บ versioning lifecycle |
| Chapter 6 | EBS: ประเภท block storage (gp3, io2, st1), EFS: shared file storage |
| Chapter 23 | S3 storage class transitions, ตัวเลือกการดึงข้อมูล Glacier |
| Chapter 28 | EBS right-sizing การย้าย gp2→gp3 การจัดการ snapshot |

รูปแบบการสอบหลัก:

- "ระบบไฟล์ที่ใช้ร่วมกันเข้าถึงได้จากหลายอินสแตนซ์ EC2" → EFS (ไม่ใช่ EBS; EBS แนบกับอินสแตนซ์เดียว)
- "IOPS สูงสำหรับ database workload" → io2 EBS
- "ลดต้นทุนสำหรับไฟล์ที่ไม่ได้เข้าถึงใน 90 วัน" → S3 lifecycle policy → Glacier
- "อัปโหลดไฟล์ขนาดใหญ่จากสถานที่ห่างไกลได้เร็วขึ้น" → S3 Transfer Acceleration

---

**Task 3.2 — กำหนด compute solutions ที่มีประสิทธิภาพสูงและ/หรือปรับขนาดได้**

แนวคิดหลัก: ตระกูลอินสแตนซ์ EC2, Graviton processors, Auto Scaling, Lambda, Fargate, Spot Instances

| บท | หัวข้อ |
|---|---|
| Chapter 4 | ประเภทอินสแตนซ์ EC2: compute-optimized (c), memory-optimized (r), general purpose (m, t) |
| Chapter 7 | Auto Scaling: horizontal scaling สำหรับ web tiers |
| Chapter 20 | Lambda: concurrency, provisioned concurrency (สำหรับ latency สม่ำเสมอ) |
| Chapter 21 | ECS Fargate: Serverless containers |
| Chapter 27 | Spot Instances สำหรับ batch workloads ที่ fault-tolerant |

รูปแบบการสอบหลัก:

- "ML training workload ลดต้นทุน สามารถถูกขัดจังหวะได้" → Spot Instances
- "Lambda response ต่ำกว่า 100ms อย่างสม่ำเสมอ" → Provisioned concurrency (กำจัด cold start)
- "Containerized microservice ไม่มีการจัดการ infrastructure" → ECS Fargate

---

**Task 3.3 — กำหนด database solutions ที่มีประสิทธิภาพสูง**

แนวคิดหลัก: RDS กับ DynamoDB กับ Aurora กับ Redshift กับ ElastiCache รูปแบบการเข้าถึง read replicas DAX

| บท | หัวข้อ |
|---|---|
| Chapter 8 | RDS: managed relational databases เมื่อไหรควรใช้ RDBMS |
| Chapter 9 | DynamoDB: NoSQL, partition keys, GSI, DAX (in-memory cache) |
| Chapter 10 | ElastiCache: Redis กับ Memcached กลยุทธ์ cache |
| Chapter 24 | Aurora: ประสิทธิภาพ Serverless v2 read replicas Global Database |
| Chapter 29 | DynamoDB on-demand กับ provisioned capacity พร้อม Auto Scaling |

รูปแบบการสอบหลัก:

- "การอ่าน microsecond สำหรับ session store" → ElastiCache Redis หรือ DAX (หาก DynamoDB เป็น backend)
- "การเข้าถึง key-value throughput สูงพร้อม schema ที่ยืดหยุ่น" → DynamoDB
- "Complex joins และ ACID transactions" → Aurora หรือ RDS
- "การวิเคราะห์ข้อมูล petabytes ของข้อมูลแบบ structured" → Redshift (ไม่ครอบคลุมในรายละเอียด แต่สัญญาณ: "data warehouse" → Redshift)

---

**Task 3.4 — กำหนด network architectures ที่มีประสิทธิภาพสูงและ/หรือปรับขนาดได้**

แนวคิดหลัก: CloudFront, Global Accelerator, Direct Connect, VPN, placement groups, enhanced networking

| บท | หัวข้อ |
|---|---|
| Chapter 12 | Route 53: นโยบายการกำหนดเส้นทาง: latency-based, geolocation, weighted |
| Chapter 13 | CloudFront: CDN, edge caching, Lambda@Edge |
| Chapter 25 | Direct Connect: การเชื่อมต่อส่วนตัวเฉพาะ |
| Chapter 25 | AWS Global Accelerator: Anycast routing ไปยัง AWS edge ที่ใกล้ที่สุด |
| Chapter 30 | VPC Endpoints: การเชื่อมต่อส่วนตัวกับบริการ AWS |

รูปแบบการสอบหลัก:

- "ลด latency สำหรับผู้ใช้ทั่วโลกที่เข้าถึง dynamic API responses" → Global Accelerator (ไม่ใช่ CloudFront ซึ่งดีที่สุดสำหรับเนื้อหาที่ cache ได้)
- "ลด latency สำหรับ static assets ทั่วโลก" → CloudFront
- "การเชื่อมต่อส่วนตัวที่สม่ำเสมอกับ AWS จาก on-premises" → Direct Connect
- "การอัปโหลดเร็วจากลูกค้าทั่วโลกไปยัง S3 bucket ของคุณ" → S3 Transfer Acceleration

---

**Task 3.5 — กำหนด data ingestion และ transformation solutions ที่มีประสิทธิภาพสูง**

แนวคิดหลัก: Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR

| บท | หัวข้อ |
|---|---|
| Chapter 26 | Kinesis Data Streams: real-time ordered event processing |
| Chapter 26 | Kinesis Data Firehose: การส่งที่จัดการไปยัง S3, Redshift, OpenSearch |
| Chapter 26 | AWS Glue: Serverless ETL, Data Catalog, Crawlers |
| Chapter 26 | Athena: Serverless SQL บน S3 |

รูปแบบการสอบหลัก:

- "ประมวลผลข้อมูล click-stream แบบ real-time" → Kinesis Data Streams + Lambda หรือ KDA
- "ส่งข้อมูล streaming ไปยัง S3 สำหรับการวิเคราะห์ภายหลัง" → Kinesis Firehose
- "Transform และ catalog ข้อมูลจากหลายแหล่ง" → AWS Glue
- "Query ข้อมูลประวัติที่เก็บใน S3 ด้วย SQL" → Athena

---

## Domain 4: Design Cost-Optimized Architectures (20%)

**Task 4.1 — ออกแบบ storage solutions ที่ปรับต้นทุนให้เหมาะสม**

| บท | หัวข้อ |
|---|---|
| Chapter 23 | S3 lifecycle policies การเปลี่ยน storage class |
| Chapter 28 | EBS right-sizing การย้าย gp2→gp3 กฎ S3 versioning lifecycle |
| Chapter 28 | EFS Intelligent-Tiering cost allocation tags AWS Budgets |

รูปแบบการสอบหลัก:

- "ระบุว่าทีมใดสร้างต้นทุน S3 มากที่สุด" → Cost allocation tags + Cost Explorer
- "ลดต้นทุนสำหรับ objects ที่เข้าถึงได้ยากโดยอัตโนมัติ" → S3 Intelligent-Tiering
- "แจ้งเตือนเมื่อต้นทุนรายเดือนเกิน $10,000" → AWS Budgets

---

**Task 4.2 — ออกแบบ compute solutions ที่ปรับต้นทุนให้เหมาะสม**

| บท | หัวข้อ |
|---|---|
| Chapter 27 | ราคา EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Chapter 20 | Lambda: จ่ายต่อการเรียกใช้ (ต้นทุนขณะว่างเป็นศูนย์) |

รูปแบบการสอบหลัก:

- "ลดต้นทุนสำหรับ production workloads ที่มีสถานะคงที่" → Savings Plans (ยืดหยุ่นกว่า) หรือ Reserved Instances
- "ลดต้นทุนสูงสุดสำหรับ batch jobs ที่สามารถถูกขัดจังหวะได้" → Spot Instances
- "การประมวลผลแบบ event-driven ที่มีต้นทุนขณะว่างเป็นศูนย์" → Lambda

---

**Task 4.3 — ออกแบบ database solutions ที่ปรับต้นทุนให้เหมาะสม**

| บท | หัวข้อ |
|---|---|
| Chapter 29 | DynamoDB on-demand กับ provisioned + Auto Scaling |
| Chapter 29 | RDS และ ElastiCache Reserved Instances/Nodes |
| Chapter 29 | การจัดการ RDS snapshot |

รูปแบบการสอบหลัก:

- "DynamoDB traffic ที่ไม่สามารถคาดเดาได้" → โหมด on-demand capacity
- "DynamoDB traffic ที่สม่ำเสมอพร้อม peaks ที่รู้จัก" → Provisioned + Auto Scaling
- "ลดต้นทุน RDS สำหรับ workload ที่มีเสถียรภาพ" → Reserved Instances (1 หรือ 3 ปี)

---

**Task 4.4 — ออกแบบ network architectures ที่ปรับต้นทุนให้เหมาะสม**

| บท | หัวข้อ |
|---|---|
| Chapter 30 | ราคาการถ่ายโอนข้อมูล: ขาเข้า (ฟรี) ข้าม AZ ($0.01/GB) ข้ามภูมิภาค อินเทอร์เน็ต ($0.09/GB) |
| Chapter 30 | NAT Gateway ($0.045/GB) กับ VPC Endpoints (Gateway: ฟรี; Interface: มีราคา) |
| Chapter 30 | CloudFront เป็นเครื่องมือปรับต้นทุนการถ่ายโอนข้อมูล |

รูปแบบการสอบหลัก:

- "EC2 ใน private subnet เรียก S3 — กำจัดต้นทุน NAT Gateway" → S3 Gateway Endpoint (ฟรี)
- "EC2 ใน private subnet เรียก SQS — ลดต้นทุน NAT Gateway" → SQS Interface Endpoint
- "ลดต้นทุนการถ่ายโอนข้อมูลสำหรับการส่งเนื้อหาทั่วโลก" → CloudFront (การแคชลด origin requests)

---

## หัวข้อข้ามโดเมน

บางหัวข้อปรากฏในหลายโดเมน:

| หัวข้อ | โดเมน | บท |
|---|---|---|
| Well-Architected Framework | ทั้งหมด | 31 |
| Architecture reviews และ ADRs | ทั้งหมด | 32 |
| การให้เหตุผลแบบ trade-off ("it depends") | ทั้งหมด | 33 |
| การออกแบบ Multi-AZ | 2, 3 | 7, 8, 18, 24 |
| การตรวจสอบและการสังเกต | 1, 2 | ตลอดทั้งเล่ม |
| CloudFront | 3, 4 | 13, 30 |

---

## รายการตรวจสอบก่อนสอบ

ก่อนนั่งสอบ SAA-C03:

**พื้นที่ที่มีน้ำหนักสูง (มีโอกาสสูงสุดที่จะปรากฏ)**

- [ ] Logic การประเมิน IAM policy (explicit deny → explicit allow → implicit deny)
- [ ] ส่วนประกอบ VPC: subnets, route tables, IGW, NAT Gateway, security groups, NACLs
- [ ] คลาสพื้นที่จัดเก็บ S3 และเมื่อไหรควรใช้แต่ละคลาส
- [ ] RDS Multi-AZ กับ Read Replica (failover กับ read scaling)
- [ ] SQS กับ SNS กับ EventBridge (pull กับ push กับ event routing)
- [ ] โมเดลราคา EC2: Spot สำหรับ fault-tolerant Savings Plans สำหรับ workloads ที่ผูกพัน
- [ ] Lambda triggers และ concurrency
- [ ] DynamoDB กับ Aurora กับ Redshift (รูปแบบการเข้าถึงกำหนดการเลือก)
- [ ] CloudFront: CDN สำหรับ static, Global Accelerator สำหรับ dynamic

**กับดักทั่วไป**

- [ ] EBS แนบกับอินสแตนซ์เดียว; EFS ใช้ร่วมกัน
- [ ] RDS Read Replicas สำหรับ read scaling ไม่ใช่ automatic failover (นั่นคือ Multi-AZ)
- [ ] NACLs เป็น stateless (ต้องการทั้งกฎขาเข้าและขาออก)
- [ ] Gateway Endpoints ฟรีและมีเฉพาะ S3 และ DynamoDB เท่านั้น
- [ ] Kinesis เก็บและ replay; SQS ลบเมื่อบริโภค
- [ ] "Decouple" ไม่ได้หมายความว่า SQS เสมอไป — SNS fan-out และ EventBridge ก็เป็นรูปแบบการแยกออกจากกันเช่นกัน
- [ ] Shield Standard ฟรีและอัตโนมัติ; Advanced เป็น subscription ที่ต้องจ่ายเงิน

**โครงสร้างการสอบ**

- 65 คำถาม 130 นาที (2 ชั่วโมง 10 นาที)
- Multiple choice (ถูกหนึ่งข้อ) และ multiple response (เลือก N ข้อที่ถูก)
- คะแนนผ่าน: 720 จาก 1000
- คำถามที่ไม่นับคะแนนถูกฝังอยู่ คุณไม่สามารถบอกได้ว่าข้อไหน
- บริหารเวลา: ~2 นาทีต่อคำถาม; ทำเครื่องหมายข้อที่ยากและกลับมาทำใหม่
