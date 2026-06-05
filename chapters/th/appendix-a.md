# ภาคผนวก ก: เอกสารอ้างอิงด่วนสำหรับบริการ AWS

บริการทุกอย่างที่ครอบคลุมในหนังสือเล่มนี้ เรียงตามลำดับที่แนะนำ ใช้เป็นเอกสารอ้างอิงสำหรับการเรียนและค้นหาข้อมูลอย่างรวดเร็วระหว่างการเตรียมสอบ

---

## Compute

**EC2 — Elastic Compute Cloud** *(บทที่ 4)*

เครื่องเสมือนบนคลาวด์ คุณเลือกประเภทอินสแตนซ์ (CPU หน่วยความจำ พื้นที่จัดเก็บ) ระบบปฏิบัติการ และภูมิภาค คุณจ่ายต่อชั่วโมง (On-Demand) ต่อความผูกพัน (Reserved Instances / Savings Plans) หรือต่อช่องกำลังการผลิตสำรอง (Spot) นี่คือหน่วย Compute พื้นฐาน

แนวคิดหลัก: AMI (Amazon Machine Image) ประเภทอินสแตนซ์ (ตระกูล t3, m6g, r6g, c6g) คู่กุญแจ โปรไฟล์อินสแตนซ์ กลุ่มการวาง

สัญญาณการสอบ: เมื่อสถานการณ์ต้องการ Compute ที่คงอยู่ มีสถานะ หรือทำงานนาน — EC2 หรือ ECS เมื่อสถานการณ์ต้องการ Compute ระยะสั้น ทริกเกอร์จากเหตุการณ์ หรือไม่มีต้นทุนขณะว่าง — Lambda

---

**Auto Scaling + Application Load Balancer** *(บทที่ 7)*

Auto Scaling Groups (ASGs) เพิ่มและลบอินสแตนซ์ EC2 ตามโหลด Application Load Balancers (ALBs) กระจายทราฟฟิกระหว่างอินสแตนซ์และกำหนดเส้นทางตามพาธหรือโฮสต์ ทั้งสองร่วมกันสร้างเลเยอร์การปรับขนาดแนวนอน

แนวคิดหลัก: Launch template นโยบายการปรับขนาด (target tracking, step, scheduled) การตรวจสอบสุขภาพ ALB target groups กฎ listener การกำหนดเส้นทางแบบถ่วงน้ำหนัก

สัญญาณการสอบ: "จัดการโหลดที่แปรปรวน" หรือ "ความพร้อมใช้งานสูงข้าม AZ" → ASG + ALB

---

**Lambda** *(บทที่ 20)*

ฟังก์ชัน Serverless คุณเขียนโค้ด AWS รันในการตอบสนองต่อเหตุการณ์ ไม่มีเซิร์ฟเวอร์ที่ต้องจัดการ คุณจ่ายต่อการเรียกใช้และต่อมิลลิวินาทีของการทำงาน ปรับขนาดอัตโนมัติถึงหลายพันการทำงานพร้อมกัน

แนวคิดหลัก: แหล่งเหตุการณ์ (API Gateway, S3, SQS, EventBridge, Kinesis) บทบาทการทำงาน ขีดจำกัดความพร้อมกัน ความพร้อมกันแบบสำรองและแบบจัดเตรียม cold start Layers ระยะเวลาสูงสุด 15 นาที

สัญญาณการสอบ: "Serverless" "event-driven" "งานระยะสั้น" "ไม่มีต้นทุนขณะว่าง" → Lambda

---

**ECS — Elastic Container Service** *(บทที่ 21)*

รัน Docker containers บน AWS มีสองประเภท Launch: EC2 (คุณจัดการโฮสต์) และ Fargate (AWS จัดการโฮสต์) ECS จัดการ task definitions บริการ การจัดตาราง cluster และการรวมกับ load balancers และ service discovery

แนวคิดหลัก: Task definition บริการ ECS ประเภท Fargate กับ EC2 ECR (registry container) บทบาท IAM ของ task การปรับขนาดบริการอัตโนมัติ

สัญญาณการสอบ: "Workloads ที่ใส่ในคอนเทนเนอร์" "microservices" "Docker บน AWS" → ECS (โดยปกติ Fargate สำหรับ Serverless containers)

---

**EKS — Elastic Kubernetes Service** *(บทที่ 21)*

Kubernetes ที่ได้รับการจัดการ AWS รัน control plane คุณรัน worker nodes (EC2 หรือ Fargate) ใช้ EKS เมื่อทีมของคุณใช้ Kubernetes อยู่แล้วหรือมี workloads ที่ต้องการฟีเจอร์เฉพาะของ Kubernetes

สัญญาณการสอบ: "Kubernetes" "ต้องการย้าย workloads K8s ที่มีอยู่" → EKS "แค่ต้องการ containers โดยไม่มีภาระ K8s" → ECS

---

## Storage

**S3 — Simple Storage Service** *(บทที่ 5)*

Object storage ความจุไม่จำกัด ความทนทาน 99.999999999% (สิบเอ็นไน้น) จัดเก็บไฟล์เป็น objects ใน buckets Buckets อยู่ในภูมิภาค Objects มีขนาดตั้งแต่ 0 ไบต์ถึง 5TB

แนวคิดหลัก: Bucket policy, object ACL การทำเวอร์ชัน การโฮสต์เว็บไซต์แบบ static presigned URLs การอัปโหลดแบบ multipart Transfer Acceleration คลาสพื้นที่จัดเก็บ (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive)

สัญญาณการสอบ: "จัดเก็บและดึงไฟล์" "ทรัพย์สินแบบ static" "การสำรองข้อมูล" "data lake" → S3 คลาสพื้นที่จัดเก็บที่เหมาะสมขึ้นอยู่กับความถี่ในการเข้าถึงและความเร็วในการดึงข้อมูล

---

**EBS — Elastic Block Store** *(บทที่ 6)*

Block storage ที่แนบกับอินสแตนซ์ EC2 เดียว ทำหน้าที่เหมือนฮาร์ดไดรฟ์ คงอยู่โดยไม่ขึ้นกับวงจรชีวิตของอินสแตนซ์ (คุณสามารถถอดและแนบใหม่ได้) ประเภทที่พบมากที่สุด: gp3 (SSD ทั่วไป ค่าเริ่มต้น) io2 (IOPS ที่จัดเตรียมสำหรับฐานข้อมูล) st1 (HDD ที่ปรับแต่งสำหรับ throughput สำหรับการอ่านตามลำดับ)

แนวคิดหลัก: Snapshots (แบบเพิ่มทีละน้อย จัดเก็บใน S3) การเข้ารหัส (KMS) Multi-Attach (เฉพาะ io1/io2) การจัดเตรียม IOPS และ throughput

สัญญาณการสอบ: "พื้นที่จัดเก็บถาวรสำหรับ EC2" "พื้นที่จัดเก็บฐานข้อมูล" "ต้องการการเข้าถึง block แบบ latency ต่ำ" → EBS

---

**EFS — Elastic File System** *(บทที่ 6)*

ระบบไฟล์ที่ใช้ร่วมกัน เข้าถึงได้จากหลายอินสแตนซ์ EC2 พร้อมกัน โปรโตคอล NFS ปรับขนาดอัตโนมัติ ราคาแพงกว่า EBS ต่อ GB สองคลาสพื้นที่จัดเก็บ: Standard และ Infrequent Access Intelligent-Tiering ย้ายไฟล์โดยอัตโนมัติ

สัญญาณการสอบ: "ระบบไฟล์ที่ใช้ร่วมกัน" "อินสแตนซ์ EC2 หลายตัวต้องการไฟล์เดียวกัน" "NFS" → EFS

---

**คลาสพื้นที่จัดเก็บ S3 และนโยบาย Lifecycle** *(บทที่ 23)*

S3 Intelligent-Tiering ย้าย objects ระหว่างระดับการเข้าถึงโดยอัตโนมัติตามความถี่ในการเข้าถึง นโยบาย Lifecycle เปลี่ยน objects ระหว่างคลาส (Standard → Standard-IA → Glacier) ตามกฎอายุ คลาสพื้นที่จัดเก็บ Glacier มีความล่าช้าในการดึงข้อมูลตั้งแต่ไม่กี่นาที (Glacier Instant) ถึง 12 ชั่วโมง (Glacier Deep Archive)

สัญญาณการสอบ: "ลดต้นทุนพื้นที่จัดเก็บสำหรับข้อมูลที่เข้าถึงไม่บ่อย" → นโยบาย lifecycle, Intelligent-Tiering หรือ Glacier

---

## Databases

**RDS — Relational Database Service** *(บทที่ 8)*

ฐานข้อมูลเชิงสัมพันธ์ที่ได้รับการจัดการ เอนจินที่รองรับ: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server และ Aurora (เอนจินของ AWS เอง) AWS จัดการการสำรองข้อมูล การแพตช์ การเฟลโอเวอร์ และการจำลอง คุณจัดการการออกแบบ schema การ query และการปรับขนาดอินสแตนซ์

แนวคิดหลัก: การ deploy Multi-AZ (เฟลโอเวอร์อัตโนมัติ การจำลองแบบซิงโครนัส) Read Replicas (แบบอะซิงโครนัส สำหรับการปรับขนาดการอ่าน) การสำรองข้อมูลอัตโนมัติ (เก็บ 1-35 วัน) manual snapshots (เก็บจนกว่าจะลบ) RDS Proxy (การรวมการเชื่อมต่อ)

สัญญาณการสอบ: "ฐานข้อมูลเชิงสัมพันธ์" "ACID transactions" "workload SQL ที่มีอยู่" → RDS หรือ Aurora

---

**Aurora** *(บทที่ 24)*

เอนจินฐานข้อมูลเชิงสัมพันธ์ของ AWS เข้ากันได้กับ MySQL และ PostgreSQL เอนจินพื้นที่จัดเก็บแบบกระจายที่จำลองข้อมูลใน 3 AZ ใน 6 สำเนา โดยทั่วไปเร็วกว่า MySQL 5 เท่า Aurora Serverless v2 ปรับความจุโดยอัตโนมัติ (วัดใน ACUs — Aurora Capacity Units)

แนวคิดหลัก: Aurora cluster (writer + reader endpoints สูงสุด 15 ตัว) Aurora Global Database (cross-region read replicas ที่มี replication lag < 1 วินาที) Aurora Serverless v2

สัญญาณการสอบ: "ฐานข้อมูลเชิงสัมพันธ์ประสิทธิภาพสูง" "เข้ากันได้กับ MySQL/PostgreSQL" "การอ่านแบบ global" "workload ที่แปรปรวน" → Aurora

---

**DynamoDB** *(บทที่ 9)*

ฐานข้อมูล NoSQL ที่ได้รับการจัดการอย่างเต็มรูปแบบ โมเดล key-value และ document ปรับขนาดถึง throughput ใดก็ได้ด้วยประสิทธิภาพ millisecond ตัวเลขเดียว สองโหมดความจุ: on-demand (จ่ายต่อ request) และ provisioned (จ่ายต่อหน่วยความจุต่อชั่วโมง พร้อม Auto Scaling)

แนวคิดหลัก: Partition key (จำเป็น) sort key (ไม่จำเป็น) Global Secondary Index (GSI) Local Secondary Index (LSI) DynamoDB Streams (change data capture) DynamoDB Accelerator (DAX) — in-memory cache TTL (Time to Live) transactions

สัญญาณการสอบ: "การเข้าถึง key-based throughput สูง" "schema ที่ยืดหยุ่น" "Serverless NoSQL" → DynamoDB

---

**ElastiCache** *(บทที่ 10)*

การแคชแบบ in-memory ที่ได้รับการจัดการ สองเอนจิน: Redis (คงอยู่ได้ pub/sub Lua scripting โครงสร้างข้อมูล) และ Memcached (แคชล้วนๆ เรียบง่ายกว่า multi-threaded) ใช้เพื่อลดโหลดฐานข้อมูลและให้บริการข้อมูลที่อ่านบ่อยใน microseconds

แนวคิดหลัก: รูปแบบ cache-aside รูปแบบ write-through นโยบาย eviction TTL โหมด cluster (Redis) Multi-AZ พร้อม automatic failover

สัญญาณการสอบ: "ลดโหลดฐานข้อมูล" "latency การอ่านต่ำกว่า millisecond" "การจัดการ session" "leaderboard แบบ real-time" → ElastiCache Redis

---

## Networking

**VPC — Virtual Private Cloud** *(บทที่ 11)*

เครือข่ายแยกภายใน AWS ครอบคลุม AZ ทั้งหมดในภูมิภาค คุณกำหนดพื้นที่ IP address (CIDR block) สร้าง subnets (สาธารณะหรือส่วนตัว) กำหนดค่า route tables และควบคุมการเข้าถึงผ่าน security groups และ NACLs

แนวคิดหลัก: Public subnet (เส้นทางไปยัง Internet Gateway) private subnet (เส้นทางไปยัง NAT Gateway สำหรับขาออก) Internet Gateway (ขาเข้า + ขาออกไปยังอินเทอร์เน็ต) NAT Gateway (ขาออกเท่านั้นสำหรับอินสแตนซ์ส่วนตัว) VPC Peering (เชื่อมต่อสอง VPC) VPC Endpoints (เชื่อมต่อกับบริการ AWS โดยไม่ใช้อินเทอร์เน็ต)

สัญญาณการสอบ: "เครือข่ายส่วนตัวบน AWS" "แยกทรัพยากรออกจากอินเทอร์เน็ต" "ควบคุมทราฟฟิกเครือข่าย" → VPC

---

**Security Groups และ NACLs** *(บทที่ 15)*

Security groups เป็น firewalls แบบ stateful ระดับอินสแตนซ์ — มีเฉพาะกฎ allow ทราฟฟิกที่ส่งกลับมาเป็นอัตโนมัติ NACLs (Network Access Control Lists) เป็น firewalls แบบ stateless ระดับ subnet — ต้องมีทั้งกฎขาเข้าและขาออก ประเมินตามลำดับหมายเลขกฎ

สัญญาณการสอบ: "บล็อก IP เฉพาะจาก subnet" → NACL "ควบคุมทราฟฟิกไปยัง/จากอินสแตนซ์" → security group

---

**Route 53** *(บทที่ 12)*

บริการ DNS และผู้ให้บริการ domain ของ AWS กำหนดเส้นทางทราฟฟิกอินเทอร์เน็ตไปยังทรัพยากร AWS และ endpoints ภายนอก นโยบายการกำหนดเส้นทาง: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multi-value answer

แนวคิดหลัก: Hosted zones (สาธารณะและส่วนตัว) ประเภท record (A, AAAA, CNAME, Alias) การตรวจสอบสุขภาพ Traffic Flow (editor นโยบายแบบ visual)

สัญญาณการสอบ: "การกำหนดเส้นทาง DNS" "เฟลโอเวอร์ระหว่างภูมิภาค" "กำหนดเส้นทางตาม latency หรือตำแหน่ง" → Route 53 พร้อมนโยบายการกำหนดเส้นทางที่เหมาะสม

---

**CloudFront** *(บทที่ 13)*

Content Delivery Network (CDN) แคชเนื้อหาที่ edge locations (400+ ทั่วโลก) ลด latency สำหรับผู้ใช้ปลายทาง ลดต้นทุนการถ่ายโอนจาก origin ผ่านการแคช รวมกับ S3, EC2, ALB และ API Gateway เป็น origins

แนวคิดหลัก: Distribution origins behaviors (การกำหนดเส้นทางตามพาธไปยัง origins) TTL (cache control) การยกเลิก cache signed URLs และ cookies (การควบคุมการเข้าถึง) Lambda@Edge และ CloudFront Functions (รันโค้ดที่ edge) Origin Shield (ลดโหลด origin)

สัญญาณการสอบ: "latency ต่ำทั่วโลก" "แคชเนื้อหา static" "ลดโหลด origin" "ป้องกัน DDoS ด้วย Shield" → CloudFront

---

**Direct Connect และ VPN** *(บทที่ 25)*

AWS Direct Connect เป็นการเชื่อมต่อเครือข่ายกายภาพเฉพาะจาก data center ภายในองค์กรของคุณไปยัง AWS หลีกเลี่ยงอินเทอร์เน็ตสาธารณะ bandwidth และ latency สม่ำเสมอกว่า AWS Site-to-Site VPN เป็นอุโมงค์เข้ารหัสผ่านอินเทอร์เน็ตสาธารณะ — ตั้งค่าได้เร็วกว่า ต้นทุนต่ำกว่า แต่ประสิทธิภาพแปรปรวน

แนวคิดหลัก: Virtual Interface (VIF) Direct Connect Gateway (เชื่อมต่อกับหลายภูมิภาค) Transit Gateway (topology เครือข่ายแบบ hub-and-spoke) ความซ้ำซ้อนของ VPN tunnel

สัญญาณการสอบ: "การเชื่อมต่อส่วนตัวเฉพาะไปยัง AWS" → Direct Connect "การเชื่อมต่อเข้ารหัส ตั้งค่าเร็วกว่า" → VPN "เชื่อมต่อหลาย VPC" → Transit Gateway

---

**VPC Endpoints** *(บทที่ 30)*

เชื่อมต่อทรัพยากรส่วนตัวกับบริการ AWS โดยไม่ใช้อินเทอร์เน็ตสาธารณะหรือ NAT Gateway Gateway Endpoints: ฟรี มีให้เฉพาะ S3 และ DynamoDB เท่านั้น Interface Endpoints (PrivateLink): ราคาต่อชั่วโมง + ต่อ GB มีให้สำหรับบริการ AWS ส่วนใหญ่

สัญญาณการสอบ: "EC2 ใน private subnet เรียก S3/DynamoDB — ลดต้นทุน NAT Gateway" → Gateway Endpoint (ฟรี) "การเชื่อมต่อส่วนตัวกับ SQS, SSM, Secrets Manager จาก private subnet" → Interface Endpoint

---

## Security and Identity

**IAM — Identity and Access Management** *(บทที่ 3 และ 14)*

ควบคุมว่าใครสามารถทำอะไรได้ในบัญชี AWS ของคุณ Users (credentials ระยะยาว) Groups (ผู้ใช้ที่แชร์สิทธิ์) Roles (credentials ชั่วคราวสำหรับบริการและการเข้าถึงข้ามบัญชี) Policies (เอกสาร JSON ที่กำหนดกฎ allow/deny)

แนวคิดหลัก: Principal, Action, Resource, Condition explicit deny > explicit allow > implicit deny SCP (Service Control Policy ใน AWS Organizations) Permission boundary, AssumeRole

สัญญาณการสอบ: IAM เกี่ยวข้องกับทุกคำถามด้านความปลอดภัย รูปแบบหลัก: บริการใช้ IAM roles (ไม่ใช่ users) การเข้าถึงข้ามบัญชีใช้การสันนิษฐาน role สิทธิ์น้อยที่สุด — ให้เฉพาะสิ่งที่จำเป็น

---

**KMS — Key Management Service** *(บทที่ 16)*

บริการ key การเข้ารหัสที่ได้รับการจัดการ สร้าง จัดเก็บ และควบคุม cryptographic keys Customer-managed keys (CMKs) ช่วยให้คุณกำหนดการหมุน การใช้งาน และนโยบายการเข้าถึง AWS-managed keys ได้รับการจัดการโดยอัตโนมัติ

แนวคิดหลัก: Key policy (แยกจาก IAM policy) Envelope encryption (ข้อมูลถูกเข้ารหัสด้วย data key; data key ถูกเข้ารหัสด้วย CMK) การหมุน key อัตโนมัติ Multi-region keys Grants

สัญญาณการสอบ: "เข้ารหัสข้อมูลที่เหลืออยู่" "customer-managed encryption keys" "การหมุน key" → KMS

---

**Secrets Manager** *(บทที่ 16)*

จัดเก็บและหมุน values ที่ sensitive โดยอัตโนมัติ: credentials ฐานข้อมูล API keys OAuth tokens รวมกับ RDS สำหรับการหมุน password อัตโนมัติ แอปพลิเคชันดึง secrets ณ runtime ผ่าน API — อย่า hardcode credentials

สัญญาณการสอบ: "จัดเก็บและหมุน credentials ฐานข้อมูล" "หลีกเลี่ยง secrets ที่ hardcode" → Secrets Manager "จัดเก็บ configuration values ไม่ใช่ secrets" → Parameter Store (SSM)

---

**AWS Shield** *(บทที่ 17)*

การป้องกัน DDoS Shield Standard เป็นอัตโนมัติและฟรี — ป้องกันการโจมตีแบบ volumetric และ protocol ทั่วไป Shield Advanced เพิ่มการป้องกันทางการเงิน ทีม DDoS response 24/7 และการมองเห็นการโจมตีแบบละเอียด

สัญญาณการสอบ: "ป้องกันจาก DDoS" → Shield Standard (อัตโนมัติ) หรือ Shield Advanced (ระดับ enterprise พร้อม SLA)

---

**WAF — Web Application Firewall** *(บทที่ 17)*

กรองทราฟฟิก HTTP/HTTPS ตามกฎ: บล็อก IP ขีดจำกัด rate รูปแบบ SQL injection รูปแบบ XSS ข้อจำกัดทางภูมิศาสตร์ กฎที่กำหนดเอง แนบกับ CloudFront, ALB, API Gateway หรือ AppSync

สัญญาณการสอบ: "บล็อก IP addresses เฉพาะ" "ป้องกัน SQL injection ที่ edge" "จำกัด rate ของ API calls" → WAF

---

**GuardDuty** *(บทที่ 17)*

บริการตรวจจับภัยคุกคาม วิเคราะห์ CloudTrail logs, VPC Flow Logs และ DNS logs โดยใช้ ML และ threat intelligence ตรวจจับกิจกรรม API ที่ผิดปกติ การสื่อสารกับ IPs ที่เป็นอันตรายที่รู้จัก credentials ที่ถูกบุกรุก

สัญญาณการสอบ: "ตรวจจับกิจกรรมที่ผิดปกติ" "ระบุ IAM credentials ที่ถูกบุกรุก" "การตรวจสอบภัยคุกคามอย่างต่อเนื่อง" → GuardDuty

---

## Messaging and Event Processing

**SQS — Simple Queue Service** *(บทที่ 19)*

คิวข้อความที่ได้รับการจัดการ ผู้ผลิตส่งข้อความ ผู้บริโภคอ่านและลบข้อความ แยกบริการออกจากกัน: ผู้ส่งไม่จำเป็นต้องรู้ว่าผู้รับพร้อมหรือไม่ Standard queues: การส่งแบบ at-least-once การเรียงลำดับตามความพยายามที่ดีที่สุด FIFO queues: การประมวลผลแบบ exactly-once การเรียงลำดับที่เข้มงวด

แนวคิดหลัก: Visibility timeout (ข้อความถูกซ่อนจากผู้บริโภคอื่นระหว่างการประมวลผล) Dead Letter Queue (DLQ) สำหรับข้อความที่ล้มเหลวซ้ำๆ การเก็บรักษาข้อความ (ค่าเริ่มต้น 4 วัน สูงสุด 14) Long polling (ลดการตอบสนองว่าง)

สัญญาณการสอบ: "แยกบริการออกจากกัน" "บัฟเฟอร์ requests ระหว่างโหลดเพิ่ม" "การประมวลผลแบบ async" → SQS "ลำดับสำคัญและต้องการ exactly-once" → SQS FIFO

---

**SNS — Simple Notification Service** *(บทที่ 19)*

บริการ pub/sub ที่ได้รับการจัดการ Publishers ส่งข้อความไปยัง topic; ทุก subscribers ได้รับสำเนา รูปแบบ fan-out: ข้อความเดียว → ผู้บริโภคหลายราย โปรโตคอล: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push

แนวคิดหลัก: Topic subscription รูปแบบ fan-out (SNS → SQS queues หลายตัว) การกรองข้อความ (subscribers รับเฉพาะข้อความที่ตรงกัน)

สัญญาณการสอบ: "ส่งการแจ้งเตือนไปยังหลาย endpoints พร้อมกัน" "fan-out เหตุการณ์เดียวไปยังผู้บริโภคหลายราย" → SNS รูปแบบทั่วไป: SNS + SQS สำหรับ durable fan-out

---

**EventBridge** *(บทที่ 22)*

Event bus สำหรับสร้าง architectures แบบ event-driven กำหนดเส้นทาง events จากบริการ AWS พาร์ทเนอร์ SaaS และ sources ที่กำหนดเองไปยัง Lambda, SQS, SNS, Step Functions และ targets อื่นๆ รองรับ scheduled rules (cron) และการจับคู่รูปแบบ

สัญญาณการสอบ: "กำหนดเส้นทาง events จากบริการ AWS ไปยัง targets" "กำหนดเวลา Lambda functions" "การจัดระเบียบแบบ event-driven" → EventBridge

---

**Step Functions** *(บทที่ 22)*

การจัดระเบียบ workflow แบบ Serverless ประสานงาน Lambda functions, ECS tasks, DynamoDB, SNS, SQS และบริการอื่นๆ ใน state machines แบบ visual จัดการการลองใหม่ การจัดการข้อผิดพลาด branches แบบขนาน และ wait states

แนวคิดหลัก: State machine ประเภท state (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail) Standard Workflows (exactly-once ทำงานนาน) กับ Express Workflows (at-least-once ปริมาณสูง)

สัญญาณการสอบ: "จัดระเบียบ Lambda functions หลายตัว" "workflows ที่ทำงานนานพร้อม retry logic" "ขั้นตอนการอนุมัติจากมนุษย์" → Step Functions

---

**Kinesis** *(บทที่ 26)*

การ streaming ข้อมูลแบบ real-time Kinesis Data Streams: stream ของ records ที่เรียงลำดับและทนทาน (เหมือน distributed commit log) Consumers ประมวลผล records; ข้อมูลเก็บไว้ 24 ชั่วโมงถึง 7 วัน Kinesis Data Firehose: การส่งไปยัง S3, Redshift, OpenSearch, Splunk ที่ได้รับการจัดการอย่างเต็มรูปแบบ — ไม่ต้องจัดการ consumers

แนวคิดหลัก: Shard (หน่วย throughput: เขียน 1MB/s อ่าน 2MB/s) partition key (กำหนดการกำหนด shard) sequence number การ checkpointing (KCL หรือ Lambda) Firehose กับ Streams

สัญญาณการสอบ: "streaming แบบ real-time" "records เรียงลำดับ" "replay events" → Kinesis Data Streams "ส่งข้อมูล streaming ไปยัง S3/Redshift โดยไม่จัดการ consumers" → Kinesis Firehose เปรียบเทียบกับ SQS: Kinesis เก็บและ replay; SQS ลบเมื่อบริโภค

---

## Analytics

**Athena** *(บทที่ 26)*

SQL queries แบบ Serverless บนข้อมูลที่จัดเก็บใน S3 ไม่มี infrastructure ที่ต้องจัดการ จ่ายต่อ query (ต่อ TB ที่สแกน) ดีที่สุดกับรูปแบบ columnar (Parquet, ORC) และข้อมูลที่แบ่งพาร์ติชัน

สัญญาณการสอบ: "Query ข้อมูล S3 ด้วย SQL" "การวิเคราะห์แบบ ad-hoc บน data lake" "ไม่มีการจัดการ infrastructure" → Athena

---

**Glue** *(บทที่ 26)*

บริการ ETL (Extract, Transform, Load) แบบ Serverless Glue Crawlers ค้นพบข้อมูลและอัปเดต Glue Data Catalog Glue Jobs รัน Spark หรือ Python transformations Data Catalog รวมกับ Athena, Redshift Spectrum และ EMR

สัญญาณการสอบ: "Transform และ load ข้อมูลสำหรับการวิเคราะห์" "ค้นพบ schema ของข้อมูล S3" "ETL pipeline" → Glue

---

## High Availability and Disaster Recovery

**Multi-AZ และ Multi-Region** *(บทที่ 18)*

Multi-AZ: การจำลองแบบซิงโครนัสภายในภูมิภาคสำหรับเฟลโอเวอร์อัตโนมัติ (RDS Multi-AZ, load balancer ข้าม AZs) RPO ~0, RTO ~60 วินาทีสำหรับ RDS Multi-Region: การจำลองแบบอะซิงโครนัสสำหรับความซ้ำซ้อนทางภูมิศาสตร์และ latency ต่ำกว่าสำหรับผู้ใช้ทั่วโลก

แนวคิดหลัก: RTO (Recovery Time Objective — ใช้เวลานานแค่ไหนในการกู้คืน) RPO (Recovery Point Objective — สูญเสียข้อมูลได้มากแค่ไหน) กลยุทธ์ DR แบบ Pilot Light, Warm Standby, Active-Active

สัญญาณการสอบ: แยกความแตกต่างระหว่างความล้มเหลวระดับ AZ (Multi-AZ จัดการ) กับความล้มเหลวระดับภูมิภาค (Multi-Region จัดการ) ต้นทุนและความซับซ้อนเพิ่มขึ้นอย่างมีนัยสำคัญกับ Multi-Region

---

## Cost Optimization

**โมเดลราคา EC2** *(บทที่ 27)*

On-Demand: ราคาเต็ม ไม่มีความผูกพัน Reserved Instances (1 หรือ 3 ปี): ส่วนลด 30-72% สำหรับประเภทอินสแตนซ์เฉพาะ Savings Plans (Compute หรือ EC2 Instance): ค่าใช้จ่ายต่อชั่วโมงที่ผูกพันสำหรับความยืดหยุ่น Spot: ลด 60-90% สำหรับ workloads ที่ถูกขัดจังหวะได้

สัญญาณการสอบ: "ลดต้นทุนสำหรับ workload ที่คาดเดาได้" → Savings Plans หรือ Reserved Instances "การประมวลผล batch ที่ fault-tolerant" → Spot "ไม่สามารถคาดเดาได้หรือระยะสั้น" → On-Demand

---

**ราคาการถ่ายโอนข้อมูล** *(บทที่ 30)*

ขาเข้าสู่ AWS: ฟรี ภายใน AZ เดียวกัน: ฟรี ข้าม AZ: $0.01/GB ทั้งสองทิศทาง ข้ามภูมิภาค: $0.02-0.08/GB อินเทอร์เน็ต (ขาออก): ~$0.09/GB การประมวลผล NAT Gateway: $0.045/GB การถ่ายโอนข้อมูล CloudFront ถูกกว่า EC2-to-internet โดยตรง และการแคชลดปริมาณรวม

สัญญาณการสอบ: "ลดต้นทุนการถ่ายโอนข้อมูลสำหรับ S3/DynamoDB จาก private subnet" → Gateway Endpoints (ฟรี) "ลดต้นทุน NAT Gateway สำหรับบริการอื่น" → Interface Endpoints

---

## Observability

**CloudWatch** *(อ้างอิงตลอดทั้งเล่ม)*

การตรวจสอบและการสังเกต CloudWatch Metrics: ข้อมูล time-series ตัวเลขจากบริการ AWS และแอปพลิเคชันที่กำหนดเอง CloudWatch Logs: รวบรวม ค้นหา และวิเคราะห์ข้อมูล log CloudWatch Alarms: ทริกเกอร์การแจ้งเตือนหรือ auto scaling ตาม metric thresholds CloudWatch Dashboards: แสดงภาพ metrics

แนวคิดหลัก: Metric dimensions ระยะเวลาการเก็บรักษา log groups และ log streams metric filters CloudWatch Agent (สำหรับ OS-level metrics และ logs จาก EC2) Container Insights

---

**CloudTrail** *(อ้างอิงตลอดทั้งเล่ม)*

บันทึก API call ทุกครั้งที่เกิดขึ้นในบัญชี AWS ของคุณ: ใครทำ จากที่ไหน เมื่อไหร่ และการตอบสนองคืออะไร Multi-region trail จัดเก็บ logs ใน S3 อย่างไม่มีกำหนด ใช้สำหรับการตรวจสอบความปลอดภัย การปฏิบัติตามกฎ และการสืบสวนเหตุการณ์

สัญญาณการสอบ: "ใครลบทรัพยากรนั้น?" "ตรวจสอบ API activity ทั้งหมด" → CloudTrail

---

**AWS Config** *(อ้างอิงในบทที่ 31)*

ติดตามการเปลี่ยนแปลง configuration ทรัพยากรตลอดเวลา ประเมินทรัพยากรตามกฎการปฏิบัติตาม บันทึกประวัติของการเปลี่ยนแปลง configuration ทุกครั้งสำหรับทรัพยากรทุกรายการ รวมกับ Systems Manager สำหรับการแก้ไข

สัญญาณการสอบ: "ทรัพยากรนี้เป็นไปตามนโยบายความปลอดภัยของเราหรือไม่?" "configuration ของทรัพยากรนี้เมื่อสัปดาห์ที่แล้วเป็นอย่างไร?" → AWS Config

---

## Well-Architected

**หกเสาหลัก** *(บทที่ 31)*

| เสาหลัก | คำถามหลัก | บริการหลัก |
|---|---|---|
| Operational Excellence | เรากำลังดำเนินงานได้ดีหรือไม่? | CloudWatch, CloudTrail, SSM, Config |
| Security | เราได้รับการป้องกันหรือไม่? | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability | เรากู้คืนจากความล้มเหลวได้หรือไม่? | Multi-AZ, Route 53 failover, backup/restore, SQS |
| Performance Efficiency | เราใช้ทรัพยากรที่ถูกต้องหรือไม่? | Right-sizing, Auto Scaling, CloudFront, Kinesis |
| Cost Optimization | เราใช้จ่ายอย่างชาญฉลาดหรือไม่? | Savings Plans, Spot, S3 lifecycle, VPC Endpoints |
| Sustainability | เรากำลังลดผลกระทบต่อสิ่งแวดล้อมหรือไม่? | Right-sizing, Graviton, ระดับพื้นที่จัดเก็บที่มีประสิทธิภาพ |

AWS Well-Architected Tool: ประเมิน architecture ของคุณตามหกเสาหลัก ใช้ก่อนการสอบเพื่อทำความเข้าใจเหตุผลเบื้องหลังคำถามของแต่ละเสาหลัก
