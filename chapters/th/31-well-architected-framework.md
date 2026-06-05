# บทที่ 31: ผู้ตรวจสอบอาคารสำหรับ Cloud Architecture

ลุกขึ้น ยืดตัว พักจริงๆ ถ้าต้องการ

บทนี้แตกต่างจากบทก่อนหน้า เราใช้เวลา 30 บทในการสะสมความรู้เกี่ยวกับบริการและรูปแบบเฉพาะ ตอนนี้เราถอยออกมาดูภาพรวม

*good* cloud architecture ที่แท้จริงเป็นอย่างไร? มีวิธีการที่เป็นระบบในการประเมินว่าสิ่งที่คุณสร้างออกแบบมาอย่างดีจริงๆ — หรือแค่ใช้งานได้?

มีอยู่ AWS เรียกมันว่า Well-Architected Framework

Nimbus ดำเนินงานมาสองปีแล้ว ทีมตัดสินใจสถาปัตยกรรมหลายร้อยครั้ง — บางอย่างอย่างมีสติ บางอย่างโดยบังเอิญ บางอย่างภายใต้แรงกดดัน ระบบทำงานได้ แต่ Maya มีคำถาม

"สถาปัตยกรรมของเราดีจริงๆ ไหม?" เธอถาม "ไม่ใช่แค่ใช้งานได้ แต่ดี"

ไม่มีใครตอบทันที

"เพราะผมได้ยินเกี่ยวกับ Well-Architected Review มาสักพัก" เธอพูดต่อ "AWS เสนอให้ลูกค้า นักลงทุนบางคนของเรากล่าวถึงมัน ผมคิดว่าเราควรทำ"

"มันคืออะไร?" Leo ถาม

"Framework ของ AWS สำหรับการประเมิน cloud architectures" Priya พูด "หกเสาหลัก ชุดคำถามและ best practices สำหรับแต่ละเสา คุณประเมินสถาปัตยกรรมของคุณเทียบกับทั้งหมดและระบุสิ่งที่ขาดหาย"

"มันเหมือนการตรวจสอบอาคาร" Tom พูด "คุณรู้ว่าอาคารทำงานได้ การตรวจสอบบอกคุณว่ามันสอดคล้องกับกฎหมายไหมและอะไรที่อาจล้มเหลวในแผ่นดินไหว"

**เสาหลักหก**

AWS Well-Architected Framework จัดระเบียบรอบเสาหลักหกอัน แต่ละเสามีชุด design principles, best practices และคำถามเพื่อประเมินสถาปัตยกรรมของคุณ

**1. Operational Excellence**

*โฟกัส*: การรันและตรวจสอบระบบเพื่อส่งมอบมูลค่าทางธุรกิจ และการปรับปรุงกระบวนการและขั้นตอนอย่างต่อเนื่อง

พื้นที่หลัก:

- คุณ deploy การเปลี่ยนแปลงอย่างไร? (CI/CD, infrastructure as code, automated deployments)
- คุณตรวจสอบระบบและรู้ว่าเมื่อมีบางอย่างผิดพลาดอย่างไร?
- คุณเรียนรู้จากความล้มเหลวอย่างไร? (post-mortems, runbooks, blameless culture)
- คุณจัดการการเปลี่ยนแปลงในระดับขนาดใหญ่อย่างไร?

การประเมินของ Nimbus:

- มีอยู่: CI/CD pipeline พร้อม automated deployments
- มีอยู่: CloudWatch alarms และ GuardDuty
- มีอยู่: Quarterly chaos engineering tests
- คำเตือน: กระบวนการ Post-mortem ยังไม่เป็นทางการ — เหตุการณ์ถูกสืบสวนแต่บทเรียนที่ได้ยังไม่ถูกบันทึกอย่างเป็นระบบ

**2. Security**

*โฟกัส*: การปกป้องข้อมูล ระบบ และ assets ผ่านการประเมินความเสี่ยงและกลยุทธ์การบรรเทา

พื้นที่หลัก:

- ใครสามารถเข้าถึงอะไรได้ และด้วยสิทธิ์น้อยที่สุดที่เป็นไปได้?
- ข้อมูลถูกเข้ารหัสทั้งแบบ at rest และ in transit อย่างไร?
- คุณตรวจจับและตอบสนองต่อภัยคุกคามอย่างไร?
- มี automated security controls ไหม?

การประเมินของ Nimbus:

- มีอยู่: IAM พร้อม least privilege (หลังการทำความสะอาดในบทที่ 14)
- มีอยู่: KMS สำหรับการเข้ารหัสข้อมูล Secrets Manager สำหรับ credentials
- มีอยู่: GuardDuty, WAF, Shield Standard
- มีอยู่: VPC พร้อม private subnets, security groups
- คำเตือน: Security patching บน EC2 instances ยังไม่ถูกทำให้อัตโนมัติเต็มรูปแบบ (Priya flag ไว้หลายเดือนก่อน ยังไม่ได้แก้ไข)

**3. Reliability**

*โฟกัส*: การทำให้ระบบทำหน้าที่ที่ตั้งใจไว้อย่างถูกต้องและสม่ำเสมอ และสามารถกู้คืนจากความล้มเหลวได้

พื้นที่หลัก:

- ระบบจัดการความล้มเหลวในระดับ component อย่างไร?
- มันกู้คืนจากความล้มเหลว regional อย่างไร?
- ความต้องการถูกจัดการอย่างไร?
- ระบบถูกทดสอบสำหรับความล้มเหลวอย่างไร?

การประเมินของ Nimbus:

- มีอยู่: Multi-AZ สำหรับ components ที่สำคัญทั้งหมด
- มีอยู่: Aurora Serverless พร้อม automatic failover
- มีอยู่: Auto Scaling สำหรับ EC2 และ ECS
- มีอยู่: Chaos engineering tests (รายไตรมาส)
- คำเตือน: ยังไม่มี multi-region deployment (warm standby ยังไม่ได้ implement — วางแผนไว้ไตรมาสหน้า)

**4. Performance Efficiency**

*โฟกัส*: การใช้ IT และ computing resources อย่างมีประสิทธิภาพ

พื้นที่หลัก:

- มีการใช้ instance type และ database type ที่ถูกต้องสำหรับ workload ไหม?
- Scaling ถูกกำหนดค่าอย่างถูกต้องไหม?
- ข้อมูลถูกส่งถึงผู้ใช้จากสถานที่ที่ optimal ไหม?

การประเมินของ Nimbus:

- มีอยู่: CloudFront สำหรับการส่งเนื้อหาทั่วโลก
- มีอยู่: ElastiCache สำหรับการเร่ง database read
- มีอยู่: Aurora read replicas
- มีอยู่: Lambda สำหรับ workloads ที่เหมาะสม
- คำเตือน: EC2 instances บางตัวไม่เคย right-size นับตั้งแต่การ deploy ครั้งแรก

**5. Cost Optimization**

*โฟกัส*: การหลีกเลี่ยงต้นทุนที่ไม่จำเป็น

พื้นที่หลัก:

- ทรัพยากรมีขนาดเหมาะสมไหม?
- ทรัพยากรที่ไม่ได้ใช้ถูกยุติไหม?
- มีการใช้ pricing models ที่เหมาะสมไหม?
- ความผิดปกติในการใช้จ่ายถูกตรวจจับไหม?

การประเมินของ Nimbus:

- มีอยู่: Savings Plans implemented (บทที่ 27)
- มีอยู่: S3 lifecycle policies (บทที่ 23)
- มีอยู่: DynamoDB Auto Scaling
- มีอยู่: AWS Budgets พร้อมการแจ้งเตือน
- มีอยู่: Quarterly cost reviews

**6. Sustainability**

*โฟกัส*: การลดผลกระทบต่อสิ่งแวดล้อมจากการรัน cloud workloads

พื้นที่หลัก:

- Utilization ถูกทำให้สูงสุดไหม (หลีกเลี่ยงทรัพยากรที่ไม่ได้ใช้)?
- Instance types ถูกเลือกเพื่อประสิทธิภาพด้านพลังงานไหม?
- ข้อมูลถูกเก็บเฉพาะตามที่ต้องการไหม?

การประเมินของ Nimbus:

- มีอยู่: Lambda และ Fargate สำหรับ serverless/containerized workloads (ประสิทธิภาพทรัพยากรดีกว่า EC2 เฉพาะ)
- มีอยู่: S3 lifecycle policies (ลบข้อมูลเมื่อไม่ต้องการอีกต่อไป)
- คำเตือน: Graviton-based instances บางตัวยังไม่ได้รับการยอมรับ (AWS Graviton ประหยัดพลังงานมากกว่าและถูกกว่า)

**กระบวนการ Well-Architected Review**

การตรวจสอบไม่ใช่การทดสอบที่คุณผ่านหรือไม่ผ่าน มันคือการสนทนาที่มีโครงสร้างเกี่ยวกับสถาปัตยกรรมของคุณ นำทางโดยคำถาม 60+ ข้อข้ามหกเสาหลัก

แต่ละคำถามระบุ best practice ถ้าสถาปัตยกรรมของคุณปฏิบัติตาม นั่นคือจุดแข็ง ถ้าไม่ มันคือ "issue" ซึ่งจัดหมวดหมู่ตามระดับความเสี่ยง (สูง กลาง ต่ำ)

ผลลัพธ์: รายการคำแนะนำการปรับปรุงที่จัดลำดับความสำคัญ ไม่จำเป็นต้องแก้ไขทุกอย่างในทันที framework ช่วยให้คุณเข้าใจการแลกเปลี่ยนของแต่ละช่องว่างและตัดสินใจว่าจะแก้ไขอะไรก่อน

AWS Well-Architected Tool (มีให้ใน AWS console ฟรี) ให้ framework ของคำถามและสร้างรายงานพร้อมคำแนะนำ

สำหรับ Nimbus Maya นัด workshop ครึ่งวัน สมาชิกทีมทั้งสี่คนตรวจสอบแต่ละเสาร่วมกัน เมื่อสิ้นสุด พวกเขามีรายการ issues 12 อัน — ความเสี่ยงสูงสามอัน ความเสี่ยงกลางห้าอัน ความเสี่ยงต่ำสี่อัน

**Issues ความเสี่ยงสูง**:

1. ไม่มีแผน DR multi-region (reliability)
2. EC2 security patching ยังไม่อัตโนมัติ (security)
3. ไม่มีกระบวนการตอบสนองเหตุการณ์ที่เป็นทางการ (operational excellence)

**Issues ความเสี่ยงกลาง**:

5 รายการรวมถึง: ยังไม่ยอมรับ Graviton, EC2 instances บางตัวไม่ได้ right-size, ไม่มี runbook อย่างเป็นทางการสำหรับ database failover

**Issues ความเสี่ยงต่ำ**:

4 รายการรวมถึง: CloudFront cache hit rate อาจสูงกว่าด้วย TTLs ที่ tune แล้ว, security group rules บางอันกว้างกว่าที่จำเป็น

**เลนส์: เฉพาะทางการตรวจสอบ**

Well-Architected Framework หลักไม่ขึ้นกับเทคโนโลยี AWS ยังเผยแพร่ **Lenses** ซึ่งเป็นส่วนขยายของ framework สำหรับกรณีการใช้งานหรืออุตสาหกรรมเฉพาะ:

- **Serverless Lens**: คำถามเพิ่มเติมสำหรับสถาปัตยกรรมที่ใช้ Lambda เป็นหลัก
- **SaaS Lens**: สำหรับแอปพลิเคชัน SaaS multi-tenant
- **Machine Learning Lens**: สำหรับ ML training และ inference workloads
- **Financial Services Lens**: คำถามด้านกฎระเบียบและการปฏิบัติตามสำหรับ FinTech
- **Healthcare Lens**: ข้อพิจารณา HIPAA

สำหรับ Nimbus SaaS Lens มีความเกี่ยวข้อง มันเพิ่มคำถามเกี่ยวกับ tenant isolation, onboarding automation และ per-tenant cost allocation ซึ่งล้วนเป็นพื้นที่ที่ Nimbus กำลังพัฒนาอยู่

**ความแตกต่างระหว่างออกแบบมาดีและแค่ทำงานได้**

"ระบบของเราทำงานได้" Leo พูดหลังการตรวจสอบ "แต่ผมไม่ตระหนักว่ามีสิ่งที่เราทำ 'พอดี' และก็ผ่านไปกี่อย่าง"

"เป็นเรื่องปกติ" Priya พูด "การสร้างภายใต้แรงกดดันเวลาหมายความว่าคุณตัดสินใจอย่างปฏิบัตินิยม Well-Architected review คือเวลาที่กำหนดในการกลับมาพิจารณามัน"

"ช่องว่างบางอย่างดูชัดเจนย้อนหลัง" เขาพูดต่อ "Security patching — ผมรู้ว่าเราไม่ได้ทำให้อัตโนมัติมัน ผมแค่ไม่เคยให้ความสำคัญในการแก้ไขมัน"

"เพราะ 'ทำงานได้' และ 'ออกแบบมาดี' รู้สึกเหมือนกันในชีวิตประจำวัน" Maya พูด "ความแตกต่างมองเห็นได้เฉพาะเมื่อมีบางอย่างผิดพลาด"

นี่คือสิ่งสำคัญที่สุดอย่างหนึ่งที่วิศวกรอาวุโสเข้าใจ: การไม่มีเหตุการณ์ไม่ได้หมายความว่าไม่มีความเสี่ยง มันหมายความว่าความเสี่ยงยังไม่เกิดขึ้น

**Infrastructure as Code: ตัวเปิดใช้งาน Operational Excellence**

ธีมหนึ่งข้ามหลายเสาหลัก: **Infrastructure as Code (IaC)**

ถ้า infrastructure ของคุณถูกกำหนดค่าด้วยตนเองผ่าน console แล้ว:

- การสร้างมันใหม่ในสถานการณ์ DR ช้าและมีโอกาสผิดพลาด
- การตรวจสอบการเปลี่ยนแปลงเป็นไปไม่ได้ (ใครเปลี่ยนอะไร และเมื่อไหร่?)
- การย้อนกลับการเปลี่ยนแปลงที่ไม่ดีต้องทำด้วยตนเอง
- ความสอดคล้องระหว่าง environments (dev/staging/production) ต้องใช้วินัย

**AWS CloudFormation** ช่วยให้คุณนิยาม infrastructure ใน YAML/JSON templates **AWS CDK (Cloud Development Kit)** ช่วยให้คุณนิยาม infrastructure โดยใช้ภาษาโปรแกรม (Python, TypeScript, Java) **Terraform** คือทางเลือก third-party ที่ได้รับความนิยม

Nimbus ค่อยๆ ย้ายไปยัง IaC โดยใช้ Terraform เมื่อถึงเวลา Well-Architected review ประมาณ 60% ของ infrastructure ของพวกเขาถูกนิยามในโค้ด การตรวจสอบแนะนำให้ได้ถึง 100%

"ทำไมที่เหลือ 40%?" Leo ถาม

"ที่เหลือ 40% คือที่ที่ critical infrastructure ของเราอยู่" Priya พูด "ถ้าเราไม่สามารถสร้างมันใหม่จากโค้ดได้ เราไม่สามารถกู้คืนจากภัยพิบัติ regional ได้อย่างน่าเชื่อถือ"

## จุดแข็งและข้อจำกัด

**สิ่งที่ Well-Architected Framework ทำได้ดี**: ให้ทีมมีคำศัพท์ร่วมกันสำหรับการพูดถึงการแลกเปลี่ยนด้านสถาปัตยกรรม ซึ่งเป็นภาษาที่อยู่รอดผ่านการเปลี่ยนแปลงบุคลากรและการสนทนากับ vendor การรัน Well-Architected Review บังคับให้ยอมรับความเสี่ยงอย่างชัดเจนที่ไม่มองเห็นในกรณีอื่น: "ใช่ เรารู้ว่าเรามี single point of failure ที่นี่ เรายอมรับการแลกเปลี่ยนนั้นเพราะค่าใช้จ่ายในการขจัดมันเกินต้นทุนที่คาดหวังของความล้มเหลว" การแลกเปลี่ยนที่บันทึกไว้และตั้งใจแบบนั้นคือผลลัพธ์ของการตรวจสอบที่ดี

**สิ่งที่ไม่สามารถทำได้**: Framework เป็นเชิงพรรณนา ไม่ใช่เชิงบังคับ มันอธิบายคุณสมบัติของระบบที่ออกแบบมาดี ไม่บอกวิธีสร้างมัน การ check ทุก checkbox ใน Well-Architected Review ไม่รับประกันสถาปัตยกรรมที่ดี ระบบสามารถ highly available, operationally excellent, cost-optimized และยังคงแก้ปัญหาผิดได้ Framework คือเลนส์ ไม่ใช่แผนพิมพ์เขียว ใช้มันเพื่อค้นหาคำถามที่ถูกต้อง ไม่ใช่เพื่อตอบคำถามเหล่านั้น

## สรุป

- **AWS Well-Architected Framework** มีหกเสาหลัก: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization และ Sustainability
- แต่ละเสาหลักมี design principles และ best practices ที่ประเมินผ่านชุดคำถามที่มีโครงสร้าง
- **Well-Architected Tool** (ฟรีใน AWS console) นำทางการตรวจสอบและสร้างรายงาน
- ผลลัพธ์คือรายการคำแนะนำการปรับปรุงสถาปัตยกรรมที่จัดหมวดหมู่ตามความเสี่ยง
- **Lenses** เฉพาะทาง framework สำหรับโดเมนเฉพาะ (serverless, SaaS, healthcare, ML)
- **Infrastructure as Code** คือตัวเปิดใช้งาน cross-pillar — แนะนำโดยเสาหลัก Operational Excellence, Security และ Reliability
- Well-Architected review ไม่ใช่การทดสอบผ่าน/ไม่ผ่าน มันคือการสนทนาการปรับปรุงที่มีโครงสร้าง

## เคล็ดลับสอบ

*SAA-C03 Domain: Cross-domain — all domains*

- **รู้เสาหลักทั้งหก และโฟกัสหลักของแต่ละเสา** สอบจะอธิบายสถานการณ์ (เช่น "ทีมต้องการให้แน่ใจว่าระบบสามารถกู้คืนจากความล้มเหลว AZ") และถามว่าอยู่ใน pillar ใด (Reliability)
- **การ mapping เสาหลัก**:
  - "Deploy การเปลี่ยนแปลงอย่างน่าเชื่อถือ เรียนรู้จากความล้มเหลว ตรวจสอบ" → Operational Excellence
  - "IAM, การเข้ารหัส, network controls, การตรวจจับภัยคุกคาม" → Security
  - "HA, failover, scaling, DR" → Reliability
  - "Right-sizing, CDN, การเลือก technology ที่ถูกต้อง" → Performance Efficiency
  - "Pricing models, ทรัพยากรที่ไม่ได้ใช้, การมองเห็นต้นทุน" → Cost Optimization
  - "ประสิทธิภาพพลังงาน, การใช้งานทรัพยากร, data lifecycle" → Sustainability
- **Infrastructure as Code**: แนะนำโดย framework เพื่อ repeatability, auditability และ recovery CloudFormation, CDK และ SAM คือ IaC tools ของ AWS
- **Well-Architected Tool**: AWS console tool ที่นำทางกระบวนการตรวจสอบ ฟรีในการใช้ สร้างแผนการปรับปรุง
- **AWS Trusted Advisor**: คล้ายกับ Well-Architected framework แต่อัตโนมัติ — สแกนบัญชีของคุณและให้คำแนะนำข้ามต้นทุน ประสิทธิภาพ ความปลอดภัย และ fault tolerance ความทับซ้อนมีจริง: Trusted Advisor ทำให้บางส่วนที่ framework ประเมินด้วยตนเองเป็นอัตโนมัติ

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

ระบุเสาหลักหกของ AWS Well-Architected Framework และอธิบายความกังวลหลักของแต่ละเสาในหนึ่งประโยค

*(ลองทำจากความจำ ถ้าคุณไม่สามารถทำได้ นั่นเป็นข้อมูลที่มีประโยชน์เกี่ยวกับ pillar ใดที่ต้องการความสนใจมากขึ้น)*

**แบบฝึกหัดที่ 2 — ฝึกสอบ**

*สถานการณ์*: ทีมวิศวกรรมกำลังเตรียมตัวสำหรับ Well-Architected review แอปพลิเคชันของพวกเขารันบน EC2 พร้อม RDS Multi-AZ เมื่อเร็วๆ นี้พวกเขาค้นพบว่า:

- กระบวนการ deploy บางครั้งทิ้ง EC2 instances พร้อม library versions ที่ต่างกัน (configuration drift)
- พวกเขาไม่มีการแจ้งเตือนอัตโนมัติเมื่อ RDS failover ถูก trigger
- IAM users ทั้งหมดมี AdministratorAccess
- พวกเขาไม่ได้ทดสอบกระบวนการ backup restoration มานาน 14 เดือน

Map แต่ละ issue ไปยัง Well-Architected pillar ที่เกี่ยวข้องที่สุด

A) Configuration drift: Operational Excellence; ไม่มีการแจ้งเตือน RDS failover: Reliability; AdministratorAccess: Security; ไม่มีการทดสอบ backup restoration: Reliability

B) Configuration drift: Security; ไม่มีการแจ้งเตือน RDS failover: Performance Efficiency; AdministratorAccess: Operational Excellence; ไม่มีการทดสอบ backup restoration: Cost Optimization

C) Configuration drift: Reliability; ไม่มีการแจ้งเตือน RDS failover: Performance Efficiency; AdministratorAccess: Security; ไม่มีการทดสอบ backup restoration: Operational Excellence

D) Configuration drift: Security; ไม่มีการแจ้งเตือน RDS failover: Reliability; AdministratorAccess: Cost Optimization; ไม่มีการทดสอบ backup restoration: Security

**คำใบ้ที่ 1**: "Configuration drift" ในกระบวนการ deploy → pillar ใดที่ครอบคลุม deployment practices?

**คำใบ้ที่ 2**: "AdministratorAccess" สำหรับผู้ใช้ทุกคน → pillar ใดที่ครอบคลุม access control?

**คำใบ้ที่ 3**: "Backup restoration ยังไม่ได้ทดสอบ" → pillar ใดที่ครอบคลุมการทดสอบกลไกการกู้คืนของคุณ?

**คำตอบ**: A

**คำอธิบาย**: Configuration drift ใน deployments (environments ที่ไม่สอดคล้องกัน) คือ issue Operational Excellence — มันเกี่ยวกับ deployment practices ที่น่าเชื่อถือและสอดคล้องกัน ไม่มีการแจ้งเตือนบน RDS failover หมายความว่าคุณไม่รู้เมื่อกลไก HA ถูก trigger — issue Reliability (การรู้สุขภาพของระบบ) AdministratorAccess สำหรับผู้ใช้ทุกคนละเมิด least privilege — issue Security การทดสอบ backup restoration ที่ยังไม่ได้ทำหมายความว่ากลไก Reliability ของคุณ (DR) ยังไม่ได้รับการยืนยัน

**ทำไมไม่ใช่ B?** B กำหนด configuration drift ไปยัง Security ผิด (library versions ที่ไม่สอดคล้องกันเป็นปัญหา deployment operations ไม่ใช่ภัยคุกคามด้านความปลอดภัย) และ AdministratorAccess ไปยัง Operational Excellence (access control เป็นความกังวลด้าน Security ไม่ใช่ ops process)

**ทำไมไม่ใช่ C?** C กำหนด configuration drift ไปยัง Reliability ผิด (ความสอดคล้องใน deployment เป็น Operational Excellence) และ backup restoration ที่ยังไม่ได้ทดสอบไปยัง Operational Excellence (การทดสอบการกู้คืนเป็นความกังวล Reliability — คุณกำลังยืนยันว่าระบบสามารถกู้คืนได้ ไม่ใช่ว่ากระบวนการของคุณสอดคล้องกัน)

**ทำไมไม่ใช่ D?** D กำหนด AdministratorAccess ไปยัง Cost Optimization (สิทธิ์ที่กว้างเกินไปไม่มีความเกี่ยวข้องกับต้นทุน) และ backup restoration ที่ยังไม่ได้ทดสอบไปยัง Security (ไม่สามารถ restore backup ได้คือความล้มเหลว Reliability ไม่ใช่ vulnerability ด้านความปลอดภัย)

*SAA-C03 Domain: Cross-domain*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

ทำ mini Well-Architected review ของแอปพลิเคชันที่คุณรู้จักหรือกำลังสร้าง สำหรับแต่ละเสาหลักทั้งหก เขียน:

- สิ่งหนึ่งที่แอปพลิเคชันทำได้ดี
- สิ่งหนึ่งที่แอปพลิเคชันสามารถปรับปรุงได้

จากนั้นจัดลำดับ improvement items ของคุณตามความเสี่ยง (อะไรที่น่าจะทำให้เกิดเหตุการณ์หรือสูญเสียมากที่สุด?) และลำดับความสำคัญ (อะไรที่จะมีผลกระทบมากที่สุดถ้าแก้ไข?)

*(แบบฝึกหัดนี้มีคุณค่ามากกว่าที่อาจดูเหมือน การฝึกประเมินสถาปัตยกรรมอย่างเป็นระบบจากหลายมุมมองเป็นทักษะหลักของวิศวกรอาวุโส)*

## ฉากหลังเครดิต

สามสัปดาห์หลังจาก Well-Architected review ทีมได้ implement การแก้ไขความเสี่ยงสูงสามอัน

EC2 patching ถูกทำให้อัตโนมัติแล้วผ่าน AWS Systems Manager Patch Manager เอกสารกระบวนการตอบสนองเหตุการณ์มีอยู่แล้ว (ไม่สมบูรณ์แบบ แต่เขียนและแชร์แล้ว) แผน multi-region warm standby ถูกร่างและกำหนด schedule สำหรับการ implement ในไตรมาสหน้า

Priya ตรวจสอบรายงาน Well-Architected Tool ความเสี่ยงสูง: 0 ความเสี่ยงกลาง: 3 ความเสี่ยงต่ำ: 4

"เราอยู่ในสถานะที่ดีกว่าที่เคยเป็น" เธอพูด

"ดีไหม?" Leo ถาม

"มันคือความก้าวหน้า" เธอพูด "คุณไม่เสร็จสิ้น Well-Architected review คุณทำความก้าวหน้า จากนั้นตรวจสอบอีกครั้งในหกเดือน"

Maya กำลังคิดถึงบางอย่าง

"เราใช้เวลา 31 บทเรียนรู้บริการ AWS แต่ละอัน" เธอพูด "และตอนนี้เราเริ่มมองระบบทั้งหมด ซึ่งคือวิธีที่สถาปนิกคิด"

"เราคิดเหมือนสถาปนิกมาสักพักแล้ว" Leo พูด

"เราตัดสินใจสถาปัตยกรรม" Maya พูด "นั่นต่างกัน การคิดเหมือนสถาปนิกหมายความว่าคุณประเมินการตัดสินใจ *ก่อน* ทำ ไม่ใช่หลังจาก"

"ความแตกต่างคืออะไร?" Tom ถาม

"ในบทถัดไป" เธอพูด "เราพยายามตอบคำถามนั้น"

ในบทถัดไป: การตรวจสอบสถาปัตยกรรมจริงที่เป็นอย่างไร จากหลักการเบื้องต้น
