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

**AWS Batch** *(บทที่ 21)*

Compute แบบ batch ที่ได้รับการจัดการสำหรับ Docker containers คุณกำหนด job (Docker image + คำสั่ง) job queue และ compute environment (EC2 หรือ Fargate) AWS Batch จัดเตรียมและปรับขนาด Compute โดยอัตโนมัติ จากนั้นยุติเมื่อ job เสร็จสิ้น รองรับ Spot Instances เพื่อลดต้นทุน

แนวคิดหลัก: Job definition (สิ่งที่จะรัน) job queue (ที่ที่ job รอ) compute environment (EC2 หรือ Fargate, On-Demand หรือ Spot) array jobs (รันสำเนาขนานหลายชุดของ job เดียวกัน)

สัญญาณการสอบ: "การประมวลผลแบบ batch ที่เกินกว่า timeout 15 นาทีของ Lambda" "งาน Compute ที่มีขอบเขตจำกัดบนคอนเทนเนอร์" "HPC workloads บน AWS" → AWS Batch

---

**AWS Outposts** *(บทที่ 2)*

แร็คฮาร์ดแวร์ AWS ที่ได้รับการจัดการอย่างเต็มรูปแบบ ติดตั้งในศูนย์ข้อมูลของคุณเองหรือสถานที่ co-location รันบริการ APIs และเครื่องมือ AWS เดียวกันกับคลาวด์สาธารณะ (EC2, EBS, RDS, EKS, S3 บน Outposts) แต่อยู่ในสถานที่ภายในองค์กรจริง

แนวคิดหลัก: APIs AWS เดียวกันภายในองค์กร AWS จัดการการติดตั้งและการแพตช์ ลูกค้าจัดหาพื้นที่แร็คและพลังงาน Local Gateway (LGW) เชื่อม Outposts กับเครือข่ายภายในองค์กร

สัญญาณการสอบ: "รัน AWS ในศูนย์ข้อมูลของคุณเอง" "data residency ต้องการให้ Compute อยู่ภายในองค์กร" "APIs AWS โดยไม่พึ่งพาอินเทอร์เน็ต" → Outposts

---

**AWS Wavelength** *(บทที่ 2)*

โครงสร้างพื้นฐาน AWS ที่ติดตั้งภายในเครือข่ายผู้ให้บริการโทรคมนาคม 5G Wavelength Zones อยู่ที่ขอบเครือข่าย 5G ทำให้มี latency ระดับมิลลิวินาทีหลักเดียวไปยังอุปกรณ์มือถือ

แนวคิดหลัก: Wavelength Zones เป็นส่วนขยายของภูมิภาค AWS ภายในเครือข่ายโทรคมนาคม ทราฟฟิกอยู่บนเครือข่ายผู้ให้บริการระหว่างอุปกรณ์และ Wavelength Zone

สัญญาณการสอบ: "latency ระดับมิลลิวินาทีหลักเดียวไปยังผู้ใช้มือถือ 5G" "mobile AR/VR" "เกมเรียลไทม์บนมือถือ" "telemetry ของยานยนต์ไร้คนขับ" → Wavelength

---

**AWS Application Migration Service (MGN)** *(บทที่ 25)*

บริการย้ายแบบ rehost (lift-and-shift) เอเจนต์จำลองดิสก์ของเซิร์ฟเวอร์ต้นทางแบบ block-by-block ลงในพื้นที่ staging ต้นทุนต่ำใน AWS คุณเปิดสำเนาทดสอบตามต้องการ ที่จุด cutover MGN แปลงเซิร์ฟเวอร์ที่จำลองให้เป็นอินสแตนซ์ EC2 ดั้งเดิม ไม่ต้องเปลี่ยนแอปพลิเคชัน

แนวคิดหลัก: การจำลองต่อเนื่องระดับ block พื้นที่ staging การเปิดทดสอบก่อน cutover กลยุทธ์การย้าย "7 Rs" (MGN = rehost)

สัญญาณการสอบ: "ย้าย VM หลายร้อยตัวอย่างรวดเร็วโดยไม่เปลี่ยนโค้ด" "lift-and-shift เซิร์ฟเวอร์ไปยัง EC2" → MGN DataSync ย้าย *ไฟล์* DMS ย้าย *ฐานข้อมูล* MGN ย้าย *เซิร์ฟเวอร์ทั้งเครื่อง*

---

## Storage

**S3 — Simple Storage Service** *(บทที่ 5)*

Object storage ความจุไม่จำกัด ความทนทาน 99.999999999% (สิบเอ็ดไนน์) จัดเก็บไฟล์เป็น objects ใน buckets Buckets อยู่ในภูมิภาค Objects มีขนาดตั้งแต่ 0 ไบต์ถึง 5TB

แนวคิดหลัก: Bucket policy, object ACL การทำเวอร์ชัน การโฮสต์เว็บไซต์แบบ static presigned URLs การอัปโหลดแบบ multipart Transfer Acceleration คลาสพื้นที่จัดเก็บ (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive รวมถึง S3 Express One Zone สำหรับ workloads แบบ directory-bucket ที่เป็น single-AZ และต้องการ latency ต่ำเป็นสำคัญ)

สัญญาณการสอบ: "จัดเก็บและดึงไฟล์" "ทรัพย์สินแบบ static" "การสำรองข้อมูล" "data lake" → S3 คลาสพื้นที่จัดเก็บที่เหมาะสมขึ้นอยู่กับความถี่ในการเข้าถึงและความเร็วในการดึงข้อมูล

---

**EBS — Elastic Block Store** *(บทที่ 6)*

Block storage ที่แนบกับอินสแตนซ์ EC2 เดียว ทำหน้าที่เหมือนฮาร์ดไดรฟ์ คงอยู่โดยไม่ขึ้นกับวงจรชีวิตของอินสแตนซ์ (คุณสามารถถอดและแนบใหม่ได้) ประเภทที่พบมากที่สุด: gp3 (SSD ทั่วไป ค่าเริ่มต้น) io2 (IOPS ที่จัดเตรียมสำหรับฐานข้อมูล) st1 (HDD ที่ปรับแต่งสำหรับ throughput สำหรับการอ่านตามลำดับ)

แนวคิดหลัก: Snapshots (แบบเพิ่มทีละน้อย จัดเก็บใน S3) การเข้ารหัส (KMS) Multi-Attach (เฉพาะ io1/io2) การจัดเตรียม IOPS และ throughput

สัญญาณการสอบ: "พื้นที่จัดเก็บถาวรสำหรับ EC2" "พื้นที่จัดเก็บฐานข้อมูล" "ต้องการการเข้าถึง block แบบ latency ต่ำ" → EBS

---

**EFS — Elastic File System** *(บทที่ 6)*

ระบบไฟล์ที่ใช้ร่วมกัน เข้าถึงได้จากหลายอินสแตนซ์ EC2 พร้อมกัน โปรโตคอล NFS ปรับขนาดอัตโนมัติ ราคาแพงกว่า EBS ต่อ GB คลาสพื้นที่จัดเก็บรวมถึง Standard, Infrequent Access และ Archive Intelligent-Tiering ย้ายไฟล์โดยอัตโนมัติ

สัญญาณการสอบ: "ระบบไฟล์ที่ใช้ร่วมกัน" "อินสแตนซ์ EC2 หลายตัวต้องการไฟล์เดียวกัน" "NFS" → EFS

---

**ตระกูล FSx** *(บทที่ 6)*

เซิร์ฟเวอร์ไฟล์ที่ได้รับการจัดการสำหรับเทคโนโลยีที่มีชื่อเฉพาะ FSx for Windows File Server: โปรโตคอล SMB, NTFS, การรวม Active Directory, Multi-AZ FSx for Lustre: ระบบไฟล์ประสิทธิภาพสูงแบบขนานสำหรับ HPC/ML นำเสนอ objects ใน S3 เป็นไฟล์ (lazy loading) FSx for NetApp ONTAP: หลายโปรโตคอล (NFS + SMB + iSCSI) snapshots การจำลอง SnapMirror FSx for OpenZFS: NFS latency ต่ำ snapshots ทันทีและ clones ที่เขียนได้

สัญญาณการสอบ: "SMB/Active Directory" → FSx for Windows "การฝึก HPC/ML บนข้อมูล S3" → FSx for Lustre "NFS และ SMB ไปยังข้อมูลเดียวกัน / การย้าย NetApp" → FSx for ONTAP "การย้าย ZFS / clones ทันที" → FSx for OpenZFS

---

**คลาสพื้นที่จัดเก็บ S3 และนโยบาย Lifecycle** *(บทที่ 23)*

S3 Intelligent-Tiering ย้าย objects ระหว่างระดับการเข้าถึงโดยอัตโนมัติตามความถี่ในการเข้าถึง นโยบาย Lifecycle เปลี่ยน objects ระหว่างคลาส (Standard → Standard-IA → Glacier) ตามกฎอายุ คลาสพื้นที่จัดเก็บ Glacier มีความล่าช้าในการดึงข้อมูลตั้งแต่ไม่กี่นาที (Glacier Instant) ถึง 12 ชั่วโมง (Glacier Deep Archive)

สัญญาณการสอบ: "ลดต้นทุนพื้นที่จัดเก็บสำหรับข้อมูลที่เข้าถึงไม่บ่อย" → นโยบาย lifecycle, Intelligent-Tiering หรือ Glacier

---

**AWS Storage Gateway** *(บทที่ 6)*

บริการพื้นที่จัดเก็บแบบไฮบริดที่เชื่อมสภาพแวดล้อมภายในองค์กรกับพื้นที่จัดเก็บ AWS นำเสนอพื้นที่จัดเก็บผ่านโปรโตคอลที่แอปพลิเคชันเข้าใจอยู่แล้ว ขณะคงข้อมูลไว้ใน S3, S3 Glacier หรือเป็น EBS snapshots

แนวคิดหลัก: File Gateway (NFS/SMB → S3) Volume Gateway (iSCSI โหมด cached หรือ stored) Tape Gateway (virtual tape library → Glacier)

สัญญาณการสอบ: "แอปพลิเคชันภายในองค์กรต้องการพื้นที่จัดเก็บคลาวด์โดยไม่เปลี่ยนโค้ด" → Storage Gateway "แทนที่การสำรองข้อมูลแบบเทป" → Tape Gateway

---

**AWS DataSync** *(บทที่ 25)*

บริการย้ายและจำลองข้อมูลแบบใช้เอเจนต์ เอเจนต์ขนาดเบาเชื่อมต่อกับเซิร์ฟเวอร์ไฟล์ภายในองค์กรผ่าน NFS หรือ SMB และซิงโครไนซ์ shares ไปยัง S3, EFS หรือ FSx โดยมีการจัดตารางเวลา การจำกัดแบนด์วิดท์ และการตรวจสอบความสมบูรณ์ในตัว

แนวคิดหลัก: DataSync agent (VM ภายในองค์กรหรือ EC2) แหล่ง NFS/SMB ปลายทาง S3/EFS/FSx การถ่ายโอนแบบเพิ่มทีละน้อยตามตารางเวลา

สัญญาณการสอบ: "ย้ายหรือซิงค์ไฟล์จำนวนมากอย่างต่อเนื่องจาก NAS ภายในองค์กรไปยัง AWS ผ่านเครือข่าย" → DataSync

---

**AWS Transfer Family** *(บทที่ 25)*

เซิร์ฟเวอร์ SFTP, FTPS และ FTP ที่ได้รับการจัดการอย่างเต็มรูปแบบ โดยใช้ S3 หรือ EFS เป็นปลายทางพื้นที่จัดเก็บ ไคลเอนต์เชื่อมต่อด้วยซอฟต์แวร์ SFTP ที่มีอยู่ ไฟล์ที่อัปโหลดลงใน bucket หรือระบบไฟล์โดยตรง

แนวคิดหลัก: Managed endpoint (เลือกใช้ static IP ได้) พื้นที่จัดเก็บ S3 หรือ EFS รองรับโปรโตคอลที่มีอยู่สำหรับพันธมิตรภายนอก

สัญญาณการสอบ: "พันธมิตรต้องอัปโหลดผ่าน SFTP ต่อไป แต่ไฟล์ควรลงใน S3" → Transfer Family

---

**AWS Snow Family** *(บทที่ 25)*

อุปกรณ์ถ่ายโอนข้อมูลทางกายภาพสำหรับการย้ายข้อมูลปริมาณมากแบบออฟไลน์ Snowball Edge Storage Optimized: ใช้งานได้ 80 TB เคสที่ทนทาน จัดส่งไปยังสถานที่ของคุณ คุณโหลดข้อมูลในเครื่องและส่งกลับเพื่อนำเข้าสู่ S3

แนวคิดหลัก: คำนวณคณิตศาสตร์การถ่ายโอนก่อน — หากการถ่ายโอนผ่านเครือข่ายจะใช้เวลาราวหนึ่งสัปดาห์หรือมากกว่า อุปกรณ์ทางกายภาพชนะ *หมายเหตุ legacy (2026)*: AWS ได้ทยอยยกเลิกตระกูลนี้ — Snowmobile (2024) และ Snowcone (ปลายปี 2024) หายไปแล้ว และอุปกรณ์ Snow ปิดรับลูกค้าใหม่ในเดือนพฤศจิกายน 2025 (ปัจจุบัน AWS ชี้ไปที่ DataSync และ Data Transfer Terminals) คลังคำถาม SAA-C03 มีมาก่อนเหตุการณ์นี้ ดังนั้นการสอบยังคงคาดหวังคำตอบ Snowball

สัญญาณการสอบ: "การย้ายข้อมูลระดับเพตะไบต์" "แบนด์วิดท์จำกัด ใช้เวลาถ่ายโอนหลายสัปดาห์" → Snow Family

---

**AWS Backup** *(บทที่ 18 และ 23)*

บริการสำรองข้อมูลแบบรวมศูนย์ที่ใช้นโยบาย ครอบคลุม EBS, RDS, DynamoDB, EFS และ Storage Gateway แผนการสำรองกำหนดตารางเวลาและการเก็บรักษา vaults จัดเก็บ recovery points

แนวคิดหลัก: แผนการสำรองและ vaults การคัดลอกข้าม region และข้าม account Vault Lock สำหรับความไม่เปลี่ยนแปลง

สัญญาณการสอบ: "รวมศูนย์และทำการสำรองข้อมูลอัตโนมัติข้ามบริการ AWS หลายตัว" "การคัดลอกสำรองข้าม account เพื่อป้องกัน ransomware/บัญชีถูกบุกรุก" → AWS Backup

---

## Databases

**RDS — Relational Database Service** *(บทที่ 8)*

ฐานข้อมูลเชิงสัมพันธ์ที่ได้รับการจัดการ เอนจินที่รองรับ: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server และ Aurora (เอนจินของ AWS เอง) AWS จัดการการสำรองข้อมูล การแพตช์ การเฟลโอเวอร์ และการจำลอง คุณจัดการการออกแบบ schema การ query และการปรับขนาดอินสแตนซ์

แนวคิดหลัก: การ deploy Multi-AZ (เฟลโอเวอร์อัตโนมัติ การจำลองแบบซิงโครนัส) Read Replicas (แบบอะซิงโครนัส สำหรับการปรับขนาดการอ่าน) การสำรองข้อมูลอัตโนมัติ (เก็บ 1-35 วัน) manual snapshots (เก็บจนกว่าจะลบ) RDS Proxy (การรวมการเชื่อมต่อ)

สัญญาณการสอบ: "ฐานข้อมูลเชิงสัมพันธ์" "ACID transactions" "workload SQL ที่มีอยู่" → RDS หรือ Aurora

---

**Aurora** *(บทที่ 24)*

เอนจินฐานข้อมูลเชิงสัมพันธ์ของ AWS เข้ากันได้กับ MySQL และ PostgreSQL เอนจินพื้นที่จัดเก็บแบบกระจายที่จำลองข้อมูลใน 3 AZ ใน 6 สำเนา โดยทั่วไปเร็วกว่า MySQL 5 เท่า Aurora Serverless v2 ปรับความจุโดยอัตโนมัติ (วัดใน ACUs — Aurora Capacity Units) และในเวอร์ชันเอนจินที่รองรับ สามารถหยุดชั่วคราวอัตโนมัติเหลือ 0 ACUs เมื่อไม่มีการเชื่อมต่อค้างไว้

แนวคิดหลัก: Aurora cluster (writer + Aurora Replicas สูงสุด 15 ตัวหลัง reader endpoint เดียว) Aurora Global Database (cross-region read replicas ที่มี replication lag < 1 วินาที) Aurora Serverless v2, ACUs พฤติกรรม auto-pause/resume

สัญญาณการสอบ: "ฐานข้อมูลเชิงสัมพันธ์ประสิทธิภาพสูง" "เข้ากันได้กับ MySQL/PostgreSQL" "การอ่านแบบ global" "workload ที่แปรปรวน" → Aurora

---

**DynamoDB** *(บทที่ 9)*

ฐานข้อมูล NoSQL ที่ได้รับการจัดการอย่างเต็มรูปแบบ โมเดล key-value และ document ปรับขนาดถึง throughput ใดก็ได้ด้วยประสิทธิภาพ millisecond ตัวเลขเดียว สองโหมดความจุ: on-demand (จ่ายต่อ request) และ provisioned (จ่ายต่อหน่วยความจุต่อชั่วโมง พร้อม Auto Scaling)

แนวคิดหลัก: Partition key (จำเป็น) sort key (เลือกได้) Global Secondary Index (GSI) Local Secondary Index (LSI) DynamoDB Streams (change data capture) DynamoDB Accelerator (DAX) — in-memory cache, TTL (Time to Live) transactions

สัญญาณการสอบ: "การเข้าถึงด้วย key แบบ throughput สูง" "schema ที่ยืดหยุ่น" "serverless NoSQL" → DynamoDB

---

**ElastiCache** *(บทที่ 10)*

การแคชแบบ in-memory ที่ได้รับการจัดการ สองเอนจิน: Redis (persistent, pub/sub, Lua scripting, โครงสร้างข้อมูล) และ Memcached (cache ล้วน เรียบง่ายกว่า multi-threaded) ใช้เพื่อลดโหลดฐานข้อมูลและให้บริการข้อมูลที่อ่านบ่อยในระดับไมโครวินาที

แนวคิดหลัก: รูปแบบ cache-aside รูปแบบ write-through นโยบาย eviction, TTL, cluster mode (Redis) Multi-AZ พร้อมเฟลโอเวอร์อัตโนมัติ

สัญญาณการสอบ: "ลดโหลดฐานข้อมูล" "latency การอ่านระดับต่ำกว่ามิลลิวินาที" "การจัดการ session" "leaderboard เรียลไทม์" → ElastiCache Redis

---

**Amazon MemoryDB for Redis** *(บทที่ 10)*

ฐานข้อมูลหลักแบบ in-memory ที่ทนทาน เข้ากันได้กับ Redis แตกต่างจาก ElastiCache (ซึ่งเป็น cache ที่การสูญเสียข้อมูลยอมรับได้) MemoryDB จัดเก็บ transaction log แบบ Multi-AZ และรับประกันความทนทาน คุณสามารถใช้ MemoryDB เป็นฐานข้อมูลหลักของคุณ — ไม่ใช่แค่ cache หน้าฐานข้อมูลอื่น

แนวคิดหลัก: ความเข้ากันได้ของ Redis API, transaction log แบบ Multi-AZ (รับประกันความทนทาน) ประสิทธิภาพ in-memory ฐานข้อมูลหลัก (ไม่ใช่เลเยอร์ cache)

สัญญาณการสอบ: "เข้ากันได้กับ Redis และการสูญเสียข้อมูลยอมรับไม่ได้" "ฐานข้อมูล in-memory ที่ทนทาน" → MemoryDB "Redis เป็น cache การสูญเสียข้อมูลยอมรับได้" → ElastiCache Redis

---

**ฐานข้อมูลที่สร้างมาเพื่อวัตถุประสงค์เฉพาะ** *(บทที่ 9, 10 และ 24)*

จับคู่รูปร่างของข้อมูลกับเอนจิน DocumentDB: documents ที่เข้ากันได้กับ MongoDB Neptune: ฐานข้อมูล graph (ความสัมพันธ์ การ traversal — Gremlin/SPARQL) Keyspaces: wide-column ที่เข้ากันได้กับ Cassandra Timestream: time-series (ข้อเสนอปัจจุบัน: Timestream for InfluxDB) MemoryDB: ฐานข้อมูล *หลัก* ที่ทนทานและเข้ากันได้กับ Redis (เทียบกับ ElastiCache = cache) QLDB ("immutable cryptographic ledger") ถูกยกเลิกในปี 2025 — ถือเป็นตัวลวง legacy

สัญญาณการสอบ: "social graph / คำแนะนำ / วงจรทุจริต" → Neptune "MongoDB" → DocumentDB "Cassandra" → Keyspaces "IoT telemetry ตามเวลา" → Timestream

---

**AWS DMS — Database Migration Service** *(บทที่ 8)*

ย้ายฐานข้อมูลไปยัง AWS โดยมี downtime น้อยที่สุด รองรับ full load (สำเนาเริ่มต้น) บวก CDC (Change Data Capture) เพื่อให้ต้นทางและปลายทางซิงค์กันขณะที่การย้ายดำเนินอยู่ เมื่อย้ายระหว่างเอนจินประเภทเดียวกัน (MySQL → MySQL, PostgreSQL → PostgreSQL) ใช้ DMS โดยตรง เมื่อย้ายระหว่างเอนจินต่างประเภท (Oracle → Aurora PostgreSQL) ใช้ AWS Schema Conversion Tool (SCT) ก่อนเพื่อแปลง schema จากนั้นใช้ DMS สำหรับข้อมูล

แนวคิดหลัก: replication instance, source และ target endpoints, full load + CDC, SCT (Schema Conversion Tool) สำหรับการย้ายแบบ heterogeneous

สัญญาณการสอบ: "ย้ายฐานข้อมูลโดยมี downtime น้อยที่สุด" → DMS "Oracle ไปยัง Aurora" หรือการย้ายแบบ heterogeneous ใดๆ → SCT + DMS "เอนจินเดียวกัน ประเภทเดียวกัน" → DMS โดยตรง

---

## Networking

**VPC — Virtual Private Cloud** *(บทที่ 11)*

เครือข่ายที่แยกออกมาภายใน AWS ครอบคลุมทุก AZ ในภูมิภาค คุณกำหนดพื้นที่ที่อยู่ IP (CIDR block) สร้าง subnets (สาธารณะหรือส่วนตัว) กำหนดค่า route tables และควบคุมการเข้าถึงผ่าน security groups และ NACLs

แนวคิดหลัก: Public subnet (เส้นทางไปยัง Internet Gateway) private subnet (เส้นทางไปยัง NAT Gateway สำหรับ outbound) Internet Gateway (inbound + outbound ไปยังอินเทอร์เน็ต) NAT Gateway (เฉพาะ outbound สำหรับอินสแตนซ์ส่วนตัว) VPC Peering (เชื่อมสอง VPC) VPC Endpoints (เชื่อมกับบริการ AWS โดยไม่ผ่านอินเทอร์เน็ต)

สัญญาณการสอบ: "เครือข่ายส่วนตัวบน AWS" "แยกทรัพยากรจากอินเทอร์เน็ต" "ควบคุมทราฟฟิกเครือข่าย" → VPC

---

**Security Groups และ NACLs** *(บทที่ 15)*

Security groups เป็นไฟร์วอลล์แบบ stateful ที่ระดับอินสแตนซ์ — มีเฉพาะกฎ allow ทราฟฟิกตอบกลับเป็นอัตโนมัติ NACLs (Network Access Control Lists) เป็นไฟร์วอลล์แบบ stateless ที่ระดับ subnet — ต้องการทั้งกฎ inbound และ outbound ประเมินตามลำดับด้วยหมายเลขกฎ

สัญญาณการสอบ: "บล็อก IP เฉพาะจากการเข้าถึง subnet" → NACL "ควบคุมทราฟฟิกไป/มาจากอินสแตนซ์" → security group

---

**Route 53** *(บทที่ 12)*

บริการ DNS และผู้รับจดทะเบียนโดเมนของ AWS กำหนดเส้นทางทราฟฟิกอินเทอร์เน็ตไปยังทรัพยากร AWS และ endpoints ภายนอก นโยบายการกำหนดเส้นทาง: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer

แนวคิดหลัก: Hosted zones (สาธารณะและส่วนตัว) ประเภท record (A, AAAA, CNAME, Alias) การตรวจสอบสุขภาพ Traffic Flow (ตัวแก้ไขนโยบายแบบ visual — หมายเหตุว่า geoproximity ยังมีให้ใช้เป็นนโยบายการกำหนดเส้นทางโดยตรงบน records ได้ด้วย โดยมี bias ที่ปรับได้ โดยไม่ต้องใช้ Traffic Flow)

สัญญาณการสอบ: "การกำหนดเส้นทาง DNS" "เฟลโอเวอร์ระหว่างภูมิภาค" "กำหนดเส้นทางตาม latency หรือตำแหน่ง" → Route 53 พร้อมนโยบายการกำหนดเส้นทางที่เหมาะสม

---

**CloudFront** *(บทที่ 13)*

Content Delivery Network (CDN) แคชเนื้อหาที่ edge locations (750+ points of presence ทั่วโลก) ลด latency สำหรับผู้ใช้ปลายทาง ลดต้นทุนการถ่ายโอนจาก origin ผ่านการแคช รวมกับ S3, EC2, ALB และ API Gateway เป็น origins

แนวคิดหลัก: Distribution, origins, behaviors (การกำหนดเส้นทางตามพาธไปยัง origins) TTL (cache control) cache invalidation, signed URLs และ cookies (การควบคุมการเข้าถึง) Lambda@Edge และ CloudFront Functions (รันโค้ดที่ edge) Origin Shield (ลดโหลดของ origin)

สัญญาณการสอบ: "latency ต่ำทั่วโลก" "แคชเนื้อหา static" "ลดโหลดของ origin" "ป้องกัน DDoS ด้วย Shield" → CloudFront

---

**Direct Connect และ VPN** *(บทที่ 25)*

AWS Direct Connect เป็นการเชื่อมต่อเครือข่ายทางกายภาพโดยเฉพาะจากศูนย์ข้อมูลภายในองค์กรไปยัง AWS หลีกเลี่ยงอินเทอร์เน็ตสาธารณะ แบนด์วิดท์และ latency สม่ำเสมอกว่า AWS Site-to-Site VPN เป็นอุโมงค์เข้ารหัสผ่านอินเทอร์เน็ตสาธารณะ — ตั้งค่าเร็วกว่า ต้นทุนต่ำกว่า แต่ประสิทธิภาพแปรปรวน

แนวคิดหลัก: Virtual Interface (VIF) Direct Connect Gateway (เชื่อมกับหลายภูมิภาค) Transit Gateway (โทโพโลยีเครือข่ายแบบ hub-and-spoke) ความซ้ำซ้อนของ VPN tunnel

สัญญาณการสอบ: "การเชื่อมต่อส่วนตัวโดยเฉพาะไปยัง AWS" → Direct Connect "การเชื่อมต่อเข้ารหัส ตั้งค่าเร็วกว่า" → VPN "เชื่อมหลาย VPC" → Transit Gateway

---

**VPC Endpoints** *(บทที่ 30)*

เชื่อมทรัพยากรส่วนตัวกับบริการ AWS โดยไม่ใช้อินเทอร์เน็ตสาธารณะหรือ NAT Gateway Gateway Endpoints: ฟรี ใช้ได้กับ S3 และ DynamoDB เท่านั้น Interface Endpoints (PrivateLink): คิดราคาต่อชั่วโมง + ต่อ GB ใช้ได้กับบริการ AWS ส่วนใหญ่

สัญญาณการสอบ: "EC2 ใน private subnet เรียก S3/DynamoDB — ลดต้นทุน NAT Gateway" → Gateway Endpoint (ฟรี) "การเชื่อมต่อส่วนตัวไปยัง SQS, SSM, Secrets Manager จาก private subnet" → Interface Endpoint

---

**AWS Client VPN** *(บทที่ 11)*

OpenVPN endpoint ที่ได้รับการจัดการ ซึ่งให้อุปกรณ์แต่ละเครื่อง (แล็ปท็อป เวิร์กสเตชัน) เชื่อมต่อกับ VPC อย่างปลอดภัยผ่านอินเทอร์เน็ต ตัวเลือกการตรวจสอบสิทธิ์: Active Directory, SAML 2.0 federation กับ identity provider หรือ mutual TLS (อิงใบรับรอง) รองรับ split-tunnel (เฉพาะทราฟฟิกที่มุ่งสู่ VPC ผ่านอุโมงค์) และ full-tunnel (ทราฟฟิกทั้งหมดผ่าน AWS)

แนวคิดหลัก: Client VPN endpoint, target network (การเชื่อม VPC subnet) authorization rules, split-tunnel กับ full-tunnel

สัญญาณการสอบ: "วิศวกรระยะไกลต้องการการเข้าถึง VPC อย่างปลอดภัยจากที่บ้าน" "การเชื่อมต่อจากอุปกรณ์แต่ละเครื่องไปยัง VPC" → Client VPN เปรียบเทียบ: Site-to-Site VPN = network-to-network Client VPN = device-to-network

---

**Network Load Balancer (NLB) และ Gateway Load Balancer (GWLB)** *(บทที่ 7)*

NLB ทำงานที่ Layer 4 (TCP/UDP/TLS): ไม่มีการตรวจสอบ HTTP เพียงกำหนดเส้นทาง packet ด้วยความเร็วสูงมาก — หลายล้าน requests ต่อวินาที โดยมี static IP ต่อ AZ และการคงไว้ซึ่ง source IP GWLB ทำงานที่ Layer 3 และมีไว้เพื่อจุดประสงค์เดียว: การแทรก virtual network appliances ของบุคคลที่สาม (firewalls, IDS/IPS, deep packet inspection) แบบ inline เข้าสู่ traffic flows

แนวคิดหลัก: NLB = Layer 4, static IPs, latency ต่ำมาก โปรโตคอลที่ไม่ใช่ HTTP GWLB = Layer 3, GENEVE encapsulation, กลุ่ม appliance หลัง entry point เดียว ALB = Layer 7 (การกำหนดเส้นทางตามพาธ/โฮสต์)

สัญญาณการสอบ: "หลายล้าน TCP requests ต่อวินาที" "static IP สำหรับ load balancer" "คงไว้ซึ่ง source IP" → NLB "แทรก security appliances ของบุคคลที่สามเข้าสู่เส้นทางทราฟฟิก" → GWLB

---

**AWS Global Accelerator** *(บทที่ 25)*

กำหนดเส้นทางทราฟฟิกผู้ใช้เข้าสู่ private global backbone ของ AWS ที่ edge location ที่ใกล้ที่สุด แทนที่จะข้ามอินเทอร์เน็ตสาธารณะ ให้ static Anycast IP สองที่อยู่ที่อยู่หน้า ALBs, NLBs หรืออินสแตนซ์ EC2 ในหนึ่งหรือหลายภูมิภาค ปรับปรุง latency และความสม่ำเสมอสำหรับทราฟฟิก *dynamic* (ที่แคชไม่ได้)

แนวคิดหลัก: Static Anycast IPs การเข้าสู่ AWS backbone ที่ edge เฟลโอเวอร์ระดับภูมิภาคที่อิงการตรวจสอบสุขภาพในไม่กี่วินาที endpoint groups พร้อม traffic dials

สัญญาณการสอบ: "ผู้ใช้ทั่วโลก ทราฟฟิก dynamic/ไม่ใช่ HTTP static IP เฟลโอเวอร์ระดับภูมิภาคที่รวดเร็ว" → Global Accelerator "เนื้อหาที่แคชได้/static" → CloudFront แทน

---

## Security และ Identity

**IAM — Identity and Access Management** *(บทที่ 3 และ 14)*

ควบคุมว่าใครทำอะไรได้บ้างใน account AWS ของคุณ Users (ข้อมูลรับรองระยะยาว) Groups (users ที่ใช้สิทธิ์ร่วมกัน) Roles (ข้อมูลรับรองชั่วคราวสำหรับบริการและการเข้าถึงข้าม account) Policies (เอกสาร JSON ที่กำหนดกฎ allow/deny)

แนวคิดหลัก: Principal, Action, Resource, Condition, explicit deny > explicit allow > implicit deny, SCP (Service Control Policy ใน AWS Organizations) Permission boundary, AssumeRole

สัญญาณการสอบ: IAM เกี่ยวข้องกับทุกคำถามด้านความปลอดภัย รูปแบบหลัก: บริการใช้ IAM roles (ไม่ใช่ users) การเข้าถึงข้าม account ใช้การ assume role Least privilege — ให้เฉพาะสิ่งที่จำเป็น

---

**KMS — Key Management Service** *(บทที่ 16)*

บริการกุญแจเข้ารหัสที่ได้รับการจัดการ สร้าง จัดเก็บ และควบคุมกุญแจการเข้ารหัส Customer-managed keys (CMKs) ให้คุณกำหนดนโยบายการหมุนเวียน การใช้งาน และการเข้าถึง AWS-managed keys ได้รับการจัดการโดยอัตโนมัติ

แนวคิดหลัก: Key policy (แยกจาก IAM policy) Envelope encryption (ข้อมูลเข้ารหัสด้วย data key; data key เข้ารหัสด้วย CMK) การหมุนเวียนกุญแจอัตโนมัติ Multi-region keys, Grants

สัญญาณการสอบ: "เข้ารหัสข้อมูลขณะพัก" "กุญแจเข้ารหัสที่ลูกค้าจัดการ" "การหมุนเวียนกุญแจ" → KMS

---

**Secrets Manager** *(บทที่ 16)*

จัดเก็บและหมุนเวียนค่าที่ละเอียดอ่อนโดยอัตโนมัติ: ข้อมูลรับรองฐานข้อมูล API keys, OAuth tokens รวมกับ RDS สำหรับการหมุนเวียนรหัสผ่านอัตโนมัติ แอปพลิเคชันดึง secrets ขณะ runtime ผ่าน API — ไม่ hardcode ข้อมูลรับรอง

สัญญาณการสอบ: "จัดเก็บและหมุนเวียนข้อมูลรับรองฐานข้อมูล" "หลีกเลี่ยง secrets ที่ hardcode" → Secrets Manager "จัดเก็บค่าการกำหนดค่า ไม่ใช่ secrets" → Parameter Store (SSM)

---

**AWS Shield** *(บทที่ 17)*

การป้องกัน DDoS Shield Standard เป็นอัตโนมัติและฟรี — ป้องกันการโจมตีแบบ volumetric และ protocol ที่พบบ่อย Shield Advanced เพิ่มการป้องกันทางการเงิน ทีมตอบสนอง DDoS 24/7 และการมองเห็นการโจมตีโดยละเอียด

สัญญาณการสอบ: "ป้องกัน DDoS" → Shield Standard (อัตโนมัติ) หรือ Shield Advanced (องค์กร พร้อม SLA)

---

**WAF — Web Application Firewall** *(บทที่ 17)*

กรองทราฟฟิก HTTP/HTTPS ตามกฎ: การบล็อก IP, rate limits, รูปแบบ SQL injection, รูปแบบ XSS, ข้อจำกัดทางภูมิศาสตร์ กฎที่กำหนดเอง แนบกับ CloudFront, ALB, API Gateway หรือ AppSync

สัญญาณการสอบ: "บล็อกที่อยู่ IP เฉพาะ" "ป้องกัน SQL injection ที่ edge" "rate limit การเรียก API" → WAF

---

**GuardDuty** *(บทที่ 17)*

บริการตรวจจับภัยคุกคาม วิเคราะห์ CloudTrail logs, VPC Flow Logs และ DNS logs โดยใช้ ML และ threat intelligence ตรวจจับกิจกรรม API ที่ผิดปกติ การสื่อสารกับ IP ที่เป็นอันตรายที่รู้จัก ข้อมูลรับรองที่ถูกบุกรุก

สัญญาณการสอบ: "ตรวจจับกิจกรรมที่ผิดปกติ" "ระบุข้อมูลรับรอง IAM ที่ถูกบุกรุก" "การตรวจสอบภัยคุกคามอย่างต่อเนื่อง" → GuardDuty

---

**Amazon Inspector** *(บทที่ 17)*

บริการประเมินช่องโหว่อัตโนมัติ สแกนอินสแตนซ์ EC2, Amazon ECR container images และฟังก์ชัน Lambda อย่างต่อเนื่องเพื่อหาช่องโหว่ซอฟต์แวร์ (CVEs) และการเปิดเผยเครือข่ายโดยไม่ตั้งใจ ผลการตรวจสอบถูกส่งไปยัง AWS Security Hub เพื่อการจัดการแบบรวมศูนย์

แนวคิดหลัก: การสแกน CVE การประเมินต่อเนื่อง (ไม่ใช่ครั้งเดียว) ครอบคลุม EC2 + ECR + Lambda การรวม Security Hub

สัญญาณการสอบ: "สแกน EC2 หาช่องโหว่ที่รู้จักโดยอัตโนมัติ" "การสแกน CVE สำหรับ container images" "การประเมินช่องโหว่อย่างต่อเนื่อง" → Inspector

---

**Amazon Cognito** *(บทที่ 14)*

การตรวจสอบสิทธิ์ที่ได้รับการจัดการสำหรับผู้ใช้ปลายทางของแอปพลิเคชันคุณ — directory ผู้ใช้ที่คุณไม่ต้องสร้างเอง User Pools จัดการการลงทะเบียน การเข้าสู่ระบบ MFA การรีเซ็ตรหัสผ่าน และ social identity providers (Google, Facebook, OIDC provider ใดก็ได้) ออก JWTs ที่แอปพลิเคชันของคุณตรวจสอบ Identity Pools แลกเปลี่ยน tokens เหล่านั้นเป็นข้อมูลรับรอง AWS ชั่วคราว

แนวคิดหลัก: User Pool (การตรวจสอบสิทธิ์ JWTs) กับ Identity Pool (ข้อมูลรับรอง AWS ชั่วคราว) hosted UI, social/OIDC/SAML federation, API Gateway Cognito authorizer

สัญญาณการสอบ: "แอปพลิเคชันต้องการการลงทะเบียน/เข้าสู่ระบบของผู้ใช้" "social login" "ให้ผู้ใช้แอปมือถือเข้าถึงทรัพยากร AWS ชั่วคราว" → Cognito เปรียบเทียบ: IAM สำหรับวิศวกรและบริการของคุณ Cognito สำหรับลูกค้าของคุณ

---

**AWS Certificate Manager (ACM)** *(บทที่ 16)*

จัดเตรียมใบรับรอง TLS/SSL สาธารณะฟรีสำหรับบริการที่ได้รับการจัดการโดย AWS (ALB, CloudFront, API Gateway) และจัดการวงจรชีวิตทั้งหมด — ไม่ต้องมีปฏิทินการต่ออายุ ไม่ต้องจัดการ private key ต่ออายุอัตโนมัติผ่านการตรวจสอบ DNS

แนวคิดหลัก: การตรวจสอบ DNS กับ email การต่ออายุอัตโนมัติ ใบรับรองสำหรับ CloudFront ต้องอยู่ใน us-east-1 ใบรับรองสาธารณะฟรีไม่สามารถ export ได้ (มีตัวเลือกแบบ export ได้ที่เสียเงินตั้งแต่ปี 2025)

สัญญาณการสอบ: "HTTPS บน load balancer หรือ CDN" "การต่ออายุใบรับรองอัตโนมัติ" → ACM

---

**Amazon Macie** *(บทที่ 17)*

การค้นพบข้อมูลที่ละเอียดอ่อนสำหรับ S3 ใช้ machine learning และ pattern matching เพื่อค้นหา PII (ชื่อ หมายเลขบัตร ข้อมูลรับรอง) ใน buckets และระบุความเสี่ยงในการเข้าถึง เช่น การเปิดเผยต่อสาธารณะ เสริม GuardDuty: GuardDuty เฝ้าดูพฤติกรรม Macie ตรวจสอบสิ่งที่จัดเก็บ

แนวคิดหลัก: Managed data identifiers (รูปแบบ PII) ขอบเขตเฉพาะ S3 ผลการตรวจสอบไปยัง Security Hub/EventBridge

สัญญาณการสอบ: "ค้นพบ PII ใน S3" "ระบุการเปิดเผยข้อมูลที่ละเอียดอ่อน" → Macie

---

**AWS Control Tower** *(บทที่ 14)*

ทำให้การตั้งค่าและการกำกับดูแลสภาพแวดล้อมแบบหลาย account เป็นอัตโนมัติ สร้าง landing zone — management, log archive และ audit accounts ที่เดินสายไว้ล่วงหน้ากับ Organizations, CloudTrail, Config และ guardrails — ในไม่กี่นาที แทนการเดินสายด้วยมือเป็นวันๆ

แนวคิดหลัก: Landing zone, guardrails (preventive = SCPs, detective = Config rules) Account Factory สำหรับ accounts ใหม่ที่เป็นมาตรฐาน

สัญญาณการสอบ: "ตั้งค่าและกำกับดูแลสภาพแวดล้อมแบบหลาย account ใหม่ด้วยแนวปฏิบัติที่ดีที่สุดโดยอัตโนมัติ" → Control Tower เปรียบเทียบ: Organizations เป็นหน่วยพื้นฐานดิบ Control Tower เป็นการประกอบอัตโนมัติ

---

## Messaging และ Event Processing

**SQS — Simple Queue Service** *(บทที่ 19)*

คิวข้อความที่ได้รับการจัดการ Producers ส่งข้อความ consumers อ่านและลบ แยกบริการออกจากกัน: ผู้ส่งไม่จำเป็นต้องรู้ว่าผู้รับพร้อมใช้งานหรือไม่ Standard queues: การส่งแบบ at-least-once การจัดลำดับแบบ best-effort FIFO queues: การประมวลผลแบบ exactly-once การจัดลำดับที่เข้มงวด

แนวคิดหลัก: Visibility timeout (ข้อความซ่อนจาก consumers อื่นขณะประมวลผล) Dead Letter Queue (DLQ) สำหรับข้อความที่ล้มเหลวซ้ำๆ การเก็บข้อความ (4 วันโดยค่าเริ่มต้น สูงสุด 14) Long polling (ลดการตอบสนองว่างเปล่า) payload สูงสุด 256KB โดยค่าเริ่มต้น (เพิ่มได้ถึง 1 MiB ตั้งแต่ปี 2025; สำหรับ payload ที่ใหญ่กว่านั้น Extended Client Library จัดเก็บเนื้อหาใน S3)

สัญญาณการสอบ: "แยกบริการออกจากกัน" "บัฟเฟอร์ requests ในช่วง spike ของโหลด" "การประมวลผลแบบ async" → SQS "ลำดับมีความสำคัญและต้องการ exactly-once" → SQS FIFO

---

**SNS — Simple Notification Service** *(บทที่ 19)*

บริการ pub/sub ที่ได้รับการจัดการ Publishers ส่งข้อความไปยัง topic subscribers ทั้งหมดได้รับสำเนา รูปแบบ fan-out: หนึ่งข้อความ → consumers หลายตัว โปรโตคอล: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push

แนวคิดหลัก: Topic, subscription, รูปแบบ fan-out (SNS → SQS queues หลายตัว) message filtering (subscribers ได้รับเฉพาะข้อความที่ตรงกัน)

สัญญาณการสอบ: "ส่งการแจ้งเตือนไปยัง endpoints หลายตัวพร้อมกัน" "fan-out เหตุการณ์เดียวไปยัง consumers หลายตัว" → SNS รูปแบบที่พบบ่อย: SNS + SQS สำหรับ fan-out ที่ทนทาน

---

**EventBridge** *(บทที่ 22)*

Event bus สำหรับสร้างสถาปัตยกรรมที่ขับเคลื่อนด้วยเหตุการณ์ กำหนดเส้นทางเหตุการณ์จากบริการ AWS พันธมิตร SaaS และแหล่งที่กำหนดเองไปยัง Lambda, SQS, SNS, Step Functions และ targets อื่นๆ รองรับ scheduled rules (cron) และ pattern matching

สัญญาณการสอบ: "กำหนดเส้นทางเหตุการณ์จากบริการ AWS ไปยัง targets" "จัดตารางฟังก์ชัน Lambda" "การจัดการที่ขับเคลื่อนด้วยเหตุการณ์" → EventBridge

---

**Step Functions** *(บทที่ 22)*

การจัดการ workflow แบบ serverless ประสานฟังก์ชัน Lambda, ECS tasks, DynamoDB, SNS, SQS และบริการอื่นๆ เข้าเป็น visual state machines จัดการการลองใหม่ การจัดการข้อผิดพลาด สาขาแบบขนาน และสถานะรอ

แนวคิดหลัก: State machine, ประเภทสถานะ (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail) Standard Workflows (exactly-once, ทำงานนาน) กับ Express Workflows: Asynchronous (at-least-once, ปริมาณสูง — ออกแบบ tasks ให้เป็น idempotent) และ Synchronous (at-most-once, คืนผลลัพธ์โดยตรงเหมือนการเรียก API)

สัญญาณการสอบ: "ประสานฟังก์ชัน Lambda หลายตัว" "workflows ที่ทำงานนานพร้อมตรรกะการลองใหม่" "ขั้นตอนการอนุมัติโดยมนุษย์" → Step Functions

---

**Kinesis** *(บทที่ 26)*

การสตรีมข้อมูลแบบเรียลไทม์ Kinesis Data Streams: stream ของ records ที่ทนทานและมีลำดับ (เหมือน distributed commit log) Consumers ประมวลผล records ข้อมูลเก็บ 24 ชั่วโมง (ค่าเริ่มต้น) ถึง 365 วัน (ด้วย Extended Data Retention) Amazon Data Firehose (เดิมคือ Kinesis Data Firehose): การส่งที่ได้รับการจัดการอย่างเต็มรูปแบบไปยัง S3, Redshift, OpenSearch, Splunk — ไม่ต้องจัดการ consumer

แนวคิดหลัก: Shard (หน่วยของ throughput: เขียน 1MB/s อ่าน 2MB/s) partition key (กำหนดการมอบหมาย shard) sequence number, checkpointing (KCL หรือ Lambda) Firehose กับ Streams

สัญญาณการสอบ: "การสตรีมแบบเรียลไทม์" "records ที่มีลำดับ" "เล่นซ้ำเหตุการณ์" → Kinesis Data Streams "ส่งข้อมูลสตรีมมิงไปยัง S3/Redshift โดยไม่จัดการ consumers" → Amazon Data Firehose (คำถามเก่าอาจพูดว่า "Kinesis Data Firehose") "SQL บนข้อมูลสตรีมมิง" → Amazon Managed Service for Apache Flink (เดิมคือ Kinesis Data Analytics) เปรียบเทียบกับ SQS: Kinesis เก็บและเล่นซ้ำ SQS ลบเมื่อบริโภค

---

**Amazon MQ** *(บทที่ 19)*

บริการ message broker ที่ได้รับการจัดการ รองรับ Apache ActiveMQ และ RabbitMQ รองรับโปรโตคอลการส่งข้อความมาตรฐานอุตสาหกรรม: AMQP, STOMP, MQTT, OpenWire และ WebSocket use case หลักคือการย้ายแบบ lift-and-shift ของ workloads message broker ภายในองค์กร — แอปพลิเคชันที่ใช้ ActiveMQ หรือ RabbitMQ อยู่แล้วสามารถเชื่อมต่อได้โดยไม่เปลี่ยนโค้ด

แนวคิดหลัก: การเลือกเอนจิน ActiveMQ กับ RabbitMQ การรองรับโปรโตคอล (AMQP/STOMP/MQTT) การกำหนดค่า broker แบบ single-instance หรือ active/standby สำหรับ HA

สัญญาณการสอบ: "ย้าย ActiveMQ หรือ RabbitMQ ภายในองค์กรไปยัง AWS โดยไม่เปลี่ยนโค้ดแอปพลิเคชัน" → Amazon MQ "การส่งข้อความแบบ AWS-native ที่สร้างใหม่" → SQS หรือ SNS (เรียบง่ายกว่า ปรับขนาดได้มากกว่า)

---

## Analytics

**Athena** *(บทที่ 26)*

การ query SQL แบบ serverless บนข้อมูลที่จัดเก็บใน S3 ไม่มีโครงสร้างพื้นฐานที่ต้องจัดการ จ่ายต่อ query (ต่อ TB ที่สแกน) ดีที่สุดกับรูปแบบ columnar (Parquet, ORC) และข้อมูลที่แบ่ง partition

สัญญาณการสอบ: "query ข้อมูล S3 ด้วย SQL" "การวิเคราะห์เฉพาะกิจบน data lake" "ไม่มีการจัดการโครงสร้างพื้นฐาน" → Athena

---

**Glue** *(บทที่ 26)*

บริการ ETL (Extract, Transform, Load) แบบ serverless Glue Crawlers ค้นพบข้อมูลและอัปเดต Glue Data Catalog Glue Jobs รันการแปลง Spark หรือ Python Data Catalog รวมกับ Athena, Redshift Spectrum และ EMR

สัญญาณการสอบ: "แปลงและโหลดข้อมูลสำหรับการวิเคราะห์" "ค้นพบ schema ของข้อมูล S3" "ETL pipeline" → Glue

---

**Amazon QuickSight** *(บทที่ 26)*

บริการ business intelligence และการแสดงข้อมูลด้วยภาพที่ได้รับการจัดการ ใช้ SPICE (Super-fast, Parallel, In-memory Calculation Engine) เอนจิน in-memory ที่แคชข้อมูลที่นำเข้าเพื่อการ render dashboard อย่างรวดเร็ว เชื่อมต่อกับ Athena, S3, Redshift, RDS และแหล่งข้อมูล AWS อื่นๆ ไม่มีเซิร์ฟเวอร์ BI ที่ต้องจัดการ

แนวคิดหลัก: SPICE (เอนจิน in-memory) datasets, analyses, dashboards, ML Insights (anomaly detection, forecasting) ความปลอดภัยระดับแถวและระดับคอลัมน์

สัญญาณการสอบ: "BI dashboard บน AWS โดยไม่จัดการเซิร์ฟเวอร์" "แสดงข้อมูลจาก Athena หรือ Redshift ด้วยภาพ" → QuickSight

---

**AWS Lake Formation** *(บทที่ 26)*

เลเยอร์ควบคุมการเข้าถึง data lake แบบรวมศูนย์บน S3 และ Glue Data Catalog ให้สิทธิ์แบบละเอียดที่ระดับตาราง คอลัมน์ และแถว — ละเอียดกว่า S3 bucket policies เพียงอย่างเดียว ทำให้การตั้งค่า data lake ที่ปลอดภัยง่ายขึ้น: Lake Formation จัดการโมเดลสิทธิ์ Glue จัดการ catalog S3 เก็บข้อมูล

แนวคิดหลัก: สิทธิ์ data lake (ระดับตาราง/คอลัมน์/แถว) การรวม Glue Data Catalog, LF-tags สำหรับการควบคุมการเข้าถึงตามคุณลักษณะ การ grant/revoke แบบรวมศูนย์สำหรับ query ของ Athena และ Redshift Spectrum

สัญญาณการสอบ: "การควบคุมการเข้าถึงแบบละเอียดบน data lake" "ความปลอดภัยระดับคอลัมน์หรือระดับแถวบนข้อมูล S3" → Lake Formation

---

## High Availability และ Disaster Recovery

**Multi-AZ และ Multi-Region** *(บทที่ 18)*

Multi-AZ: การจำลองแบบซิงโครนัสภายในภูมิภาคสำหรับเฟลโอเวอร์อัตโนมัติ (RDS Multi-AZ, load balancer ข้าม AZ) RPO ~0, RTO ~60 วินาทีสำหรับ RDS Multi-Region: การจำลองแบบอะซิงโครนัสสำหรับความซ้ำซ้อนทางภูมิศาสตร์และ latency ที่ต่ำกว่าสำหรับผู้ใช้ทั่วโลก

แนวคิดหลัก: RTO (Recovery Time Objective — ใช้เวลานานเท่าใดในการฟื้นตัว) RPO (Recovery Point Objective — สูญเสียข้อมูลได้มากเท่าใด) กลยุทธ์ DR แบบ Pilot Light, Warm Standby, Active-Active

สัญญาณการสอบ: แยกระหว่างความล้มเหลวระดับ AZ (Multi-AZ จัดการ) กับความล้มเหลวระดับภูมิภาค (Multi-Region จัดการ) ต้นทุนและความซับซ้อนเพิ่มขึ้นอย่างมากกับ Multi-Region

---

**AWS Elastic Disaster Recovery (DRS)** *(บทที่ 18)*

การกู้คืนจากภัยพิบัติที่ได้รับการจัดการสำหรับเซิร์ฟเวอร์ (ภายในองค์กรหรือ EC2) จำลองเซิร์ฟเวอร์ต้นทางแบบ block-by-block อย่างต่อเนื่องลงในพื้นที่ staging ต้นทุนต่ำ และเปิดอินสแตนซ์การกู้คืนแบบเต็มในไม่กี่นาทีเมื่อต้องการ — pilot light ที่ได้รับการจัดการ: เวลาการกู้คืนใกล้ระดับ warm-standby ในราคาใกล้ระดับ backup-and-restore

แนวคิดหลัก: การจำลองระดับ block อย่างต่อเนื่อง พื้นที่ staging ต้นทุนต่ำ การเปิดการกู้คืนตามต้องการ การกู้คืน ณ จุดเวลา

สัญญาณการสอบ: "ลด downtime และการสูญเสียข้อมูลสำหรับ workloads ที่อิงเซิร์ฟเวอร์ด้วยบริการ DR ที่ได้รับการจัดการ" "pilot light โดยไม่ต้องสร้างเอง" → DRS

---

## Cost Optimization

**EC2 Pricing Models** *(บทที่ 27)*

On-Demand: ราคาเต็ม ไม่มีความผูกพัน Reserved Instances (1 หรือ 3 ปี): ลด 30-72% สำหรับประเภทอินสแตนซ์เฉพาะ Savings Plans (Compute หรือ EC2 Instance): การใช้จ่ายต่อชั่วโมงที่ผูกพันเพื่อความยืดหยุ่น Spot: ลด 60-90% สำหรับ workloads ที่ขัดจังหวะได้

สัญญาณการสอบ: "ลดต้นทุนสำหรับ workload ที่คาดการณ์ได้" → Savings Plans หรือ Reserved Instances "การประมวลผล batch ที่ทนต่อความผิดพลาด" → Spot "คาดการณ์ไม่ได้หรือระยะสั้น" → On-Demand

---

**Data Transfer Pricing** *(บทที่ 30)*

Inbound เข้า AWS: ฟรี Same-AZ: ฟรี Cross-AZ: $0.01/GB แต่ละทิศทาง Cross-region: $0.02-0.08/GB Internet (outbound): ~$0.09/GB การประมวลผล NAT Gateway: $0.045/GB การถ่ายโอนข้อมูล CloudFront ถูกกว่าจาก EC2-to-internet โดยตรง และการแคชลดปริมาณรวม

สัญญาณการสอบ: "ลดต้นทุนการถ่ายโอนข้อมูลสำหรับ S3/DynamoDB จาก private subnet" → Gateway Endpoints (ฟรี) "ลดต้นทุน NAT Gateway สำหรับบริการอื่นๆ" → Interface Endpoints

---

## Observability

**CloudWatch** *(อ้างอิงตลอดทั้งเล่ม)*

การตรวจสอบและ observability CloudWatch Metrics: ข้อมูล time-series เชิงตัวเลขจากบริการ AWS และแอปพลิเคชันที่กำหนดเอง CloudWatch Logs: รวบรวม ค้นหา และวิเคราะห์ข้อมูล log CloudWatch Alarms: ทริกเกอร์การแจ้งเตือนหรือ auto scaling ตาม threshold ของ metric CloudWatch Dashboards: แสดง metrics ด้วยภาพ

แนวคิดหลัก: มิติของ metric ระยะเวลาการเก็บรักษา log groups และ log streams, metric filters, CloudWatch Agent (สำหรับ metrics และ logs ระดับ OS จาก EC2) Container Insights

---

**CloudTrail** *(อ้างอิงตลอดทั้งเล่ม)*

บันทึกทุกการเรียก API ที่ทำใน account AWS ของคุณ: ใครทำ จากที่ไหน เมื่อใด และผลตอบกลับคืออะไร Multi-region trail จัดเก็บ logs ใน S3 อย่างไม่มีกำหนด ใช้สำหรับการตรวจสอบความปลอดภัย การปฏิบัติตามข้อกำหนด และการสอบสวนเหตุการณ์

สัญญาณการสอบ: "ใครลบทรัพยากรนั้น?" "ตรวจสอบกิจกรรม API ทั้งหมด" → CloudTrail

---

**X-Ray** *(บทที่ 20)*

Distributed tracing: ติดตาม requests แต่ละรายการข้ามบริการ (traces → segments → subsegments) สร้าง service map พร้อม latency และอัตราข้อผิดพลาดต่อ hop การสุ่มตัวอย่างทำให้ overhead ต่ำ annotations ทำให้ traces ค้นหาได้ Active tracing เปิดใช้งานบน Lambda และ API Gateway stages

สัญญาณการสอบ: "ติดตาม requests ข้าม microservices" "ค้นหาคอขวดระหว่างบริการ" → X-Ray (ไม่ใช่ CloudWatch ไม่ใช่ CloudTrail)

---

**AWS Config** *(อ้างอิงในบทที่ 31)*

ติดตามการเปลี่ยนแปลงการกำหนดค่าทรัพยากรตามเวลา ประเมินทรัพยากรเทียบกับกฎการปฏิบัติตามข้อกำหนด บันทึกประวัติของการเปลี่ยนแปลงการกำหนดค่าทุกครั้งสำหรับทุกทรัพยากร รวมกับ Systems Manager สำหรับการแก้ไข

สัญญาณการสอบ: "ทรัพยากรนี้เป็นไปตามนโยบายความปลอดภัยของเราหรือไม่?" "การกำหนดค่าของทรัพยากรนี้เป็นอย่างไรเมื่อสัปดาห์ที่แล้ว?" → AWS Config

---

## Well-Architected

**หกเสาหลัก** *(บทที่ 31)*

| เสาหลัก                  | คำถามหลัก                               | บริการสำคัญ                                        |
|------------------------|-----------------------------------------|---------------------------------------------------|
| Operational Excellence | เรารันได้ดีหรือไม่?                       | CloudWatch, CloudTrail, SSM, Config               |
| Security               | เราได้รับการป้องกันหรือไม่?                | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability            | เรากู้คืนจากความล้มเหลวได้หรือไม่?          | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Performance Efficiency | เราใช้ทรัพยากรที่ถูกต้องหรือไม่?           | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Cost Optimization      | เราใช้จ่ายอย่างชาญฉลาดหรือไม่?            | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| Sustainability         | เราลดผลกระทบต่อสิ่งแวดล้อมหรือไม่?         | Right-sizing, Graviton, efficient storage tiers   |

AWS Well-Architected Tool: ประเมินสถาปัตยกรรมของคุณเทียบกับหกเสาหลัก ใช้ก่อนการสอบเพื่อเข้าใจเหตุผลเบื้องหลังคำถามของแต่ละเสาหลัก
