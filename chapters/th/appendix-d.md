# ภาคผนวก ง: ข้อสอบฝึกหัดฉบับเต็ม (65 ข้อ)

นี่คือข้อสอบฝึกหัด SAA-C03 ฉบับเต็มความยาว: 65 ข้อ สะท้อนน้ำหนักโดเมนของข้อสอบจริง — Design Secure Architectures (ข้อ 1–20, ~30%), Design Resilient Architectures (21–37, ~26%), Design High-Performing Architectures (38–53, ~24%) และ Design Cost-Optimized Architectures (54–65, ~20%)

**วิธีทำข้อสอบ:**

- ตั้งเวลา **130 นาที** — ระยะเวลาของข้อสอบจริง ฝึกการกำหนดจังหวะ: นั่นคือสองนาทีต่อข้อ
- เจ็ดข้อระบุ **"(เลือกสองข้อ)"** — มีตัวเลือกห้าตัวและคำตอบที่ถูกต้องสองข้อพอดี เหมือนข้อ multiple-response ของข้อสอบจริง ต้องถูกทั้งสองข้อจึงจะได้คะแนน
- อย่าดูเฉลยจนกว่าคุณจะทำครบทั้ง 65 ข้อ ในข้อสอบจริงไม่มีการแจ้งผลกลางคัน และการฝึกความอดทนต่อความไม่แน่นอนเป็นส่วนหนึ่งของการเตรียมตัว
- ข้อสอบจริงมีคำถามทดลองที่ไม่นับคะแนน 15 ข้อซึ่งคุณระบุไม่ได้ ทั้ง 65 ข้อที่นี่ "นับคะแนน" เกณฑ์มาตรฐานการผ่าน: **47 ข้อขึ้นไป (~72%)** อยู่ในช่วงของคะแนนผ่านแบบ scaled 720/1000 หากต่ำกว่า 47 ให้ทบทวนบทที่จับคู่ไว้ในภาคผนวก ข สำหรับโดเมนที่อ่อนของคุณก่อนจองสอบ
- สำหรับทุกข้อที่คุณตอบผิด — และทุกข้อที่คุณตอบถูกแต่ลังเล — ให้อ่านการวิเคราะห์ตัวลวง ข้อสอบทดสอบ *ความแตกต่าง* ระหว่างตัวเลือกที่ดูสมเหตุสมผล และนั่นคือที่ที่การเรียนรู้อยู่

---

## ส่วนที่ 1 — Design Secure Architectures (ข้อ 1–20)

**ข้อ 1** *(Domain 1 — Task 1.1)*
บริษัทบริการทางการเงินใช้ AWS Organizations โดยเปิดใช้คุณลักษณะทั้งหมด ทีมความปลอดภัยแนบ service control policy (SCP) กับ root ขององค์กรที่ปฏิเสธการใช้ AWS Regions ทั้งหมดยกเว้น eu-west-1 ระหว่างการตรวจสอบ ทีมพบว่าผู้ดูแลระบบใน account หนึ่งยังคงสามารถเปิดอินสแตนซ์ EC2 ใน us-east-2 ได้แม้จะมี SCP account ใดมีแนวโน้มมากที่สุดที่อนุญาตการกระทำนี้?

A) member account ใน organizational unit (OU) แบบซ้อน เพราะ SCPs ไม่แพร่กระจายไปยัง OUs แบบซ้อน
B) management account เพราะ SCPs ไม่มีผลกับ management account
C) member account ที่ IAM administrator policy มี explicit Allow ซึ่งแทนที่ SCPs
D) member account ที่สร้างหลังจาก SCP ถูกแนบ เพราะ SCPs มีผลเฉพาะกับ accounts ที่มีอยู่ในเวลาที่แนบ

**ข้อ 2** *(Domain 1 — Task 1.1)*
สตาร์ทอัพต้องการอนุญาตให้นักพัฒนาสร้าง IAM roles สำหรับแอปพลิเคชันของพวกเขา แต่ทีมความปลอดภัยกังวลว่านักพัฒนาอาจสร้าง roles ที่มีสิทธิ์มากกว่าที่นักพัฒนาเองมี ทำให้เกิด privilege escalation ทีมความปลอดภัยต้องการให้นักพัฒนายังคงสร้าง role แบบ self-service ได้ โซลูชันใด**เหมาะสมที่สุด**?

A) กำหนดให้นักพัฒนาส่งคำขอสร้าง role ผ่านระบบ ticketing ที่ทีมความปลอดภัยตรวจสอบ
B) แนบ SCP กับ accounts ของนักพัฒนาที่ปฏิเสธการกระทำ iam:CreateRole ทั้งหมด
C) กำหนดให้ roles ทั้งหมดที่นักพัฒนาสร้างต้องมี permissions boundary เฉพาะ บังคับใช้ด้วย IAM condition บน iam:CreateRole และ iam:AttachRolePolicy
D) เปิดใช้ AWS CloudTrail และกำหนดค่าการแจ้งเตือนทุกครั้งที่นักพัฒนาสร้าง IAM role ใหม่

**ข้อ 3** *(Domain 1 — Task 1.1)*
ผู้ให้บริการ SaaS ต้องเข้าถึงทรัพยากรใน AWS accounts ของลูกค้าเพื่อทำการวิเคราะห์ต้นทุนอัตโนมัติ ลูกค้าสร้าง IAM role ที่ account ของผู้ให้บริการ SaaS สามารถ assume ได้ ที่ปรึกษาด้านความปลอดภัยเตือนว่าบุคคลที่สามที่ทราบ role ARN ของลูกค้าอาจหลอกให้ผู้ให้บริการ SaaS เข้าถึง account ของลูกค้านั้นในนามของบุคคลที่สาม กลไกใดบรรเทาความเสี่ยง "confused deputy" นี้?

A) กำหนดให้มี multi-factor authentication (MFA) บน trust policy ของ cross-account role
B) กำหนดให้ผู้ให้บริการ SaaS ส่ง ExternalId ที่ไม่ซ้ำ ซึ่งลูกค้ากำหนด ในการเรียก sts:AssumeRole และตรวจสอบโดย condition ใน trust policy ของ role
C) เข้ารหัส role ARN ด้วย AWS KMS ก่อนแชร์กับผู้ให้บริการ SaaS
D) แทนที่ cross-account role ด้วย IAM user ที่ access keys ถูกหมุนเวียนทุก 90 วัน

**ข้อ 4** *(Domain 1 — Task 1.1)*
บริษัทที่มี 40 AWS accounts ใน AWS Organizations ต้องการให้พนักงานเข้าสู่ระบบครั้งเดียวด้วยข้อมูลรับรอง Microsoft Entra ID (Azure AD) ที่มีอยู่ และเข้าถึง AWS accounts ทั้งหมดผ่าน portal เดียว โดยกำหนดสิทธิ์แบบรวมศูนย์ต่อ account โซลูชันใดตอบสนองข้อกำหนดเหล่านี้โดยมีภาระการดำเนินงาน**น้อยที่สุด**?

A) สร้าง IAM users ในแต่ละ account ทั้ง 40 และซิงโครไนซ์รหัสผ่านกับ Entra ID
B) กำหนดค่า AWS IAM Identity Center โดยมี Entra ID เป็น external identity provider และกำหนด permission sets ให้ users และ groups ต่อ account
C) deploy Amazon Cognito user pools ในแต่ละ account และ federate กับ Entra ID
D) สร้าง SAML identity provider ในแต่ละ account และเขียน IAM roles และ trust policies ต่อ account ด้วยมือ

**ข้อ 5** *(Domain 1 — Task 1.1)*
บริษัทเกมมือถือกำลังสร้างแอปที่ผู้เล่นลงทะเบียนด้วยที่อยู่อีเมลหรือ social login และหลังการตรวจสอบสิทธิ์ แอปต้องอัปโหลดภาพหน้าจอของผู้เล่นไปยัง Amazon S3 bucket โดยตรงโดยใช้ข้อมูลรับรอง AWS ชั่วคราว ชุดบริการใดที่ solutions architect ควรแนะนำ?

A) Amazon Cognito user pool สำหรับการลงทะเบียน/เข้าสู่ระบบ และ Amazon Cognito identity pool เพื่อแลกเปลี่ยน token ที่ตรวจสอบสิทธิ์แล้วเป็นข้อมูลรับรอง AWS ชั่วคราว
B) Amazon Cognito identity pool สำหรับการลงทะเบียน/เข้าสู่ระบบ และ Amazon Cognito user pool เพื่อออกข้อมูลรับรอง AWS ชั่วคราว
C) AWS IAM Identity Center สำหรับการลงทะเบียน/เข้าสู่ระบบ และ AWS STS GetSessionToken สำหรับข้อมูลรับรอง
D) Amazon Cognito user pool เพียงอย่างเดียว เพราะ tokens ของ user pool ให้การเข้าถึง S3 โดยตรง

**ข้อ 6** *(Domain 1 — Task 1.3)*
บริษัทด้านสุขภาพต้องเข้ารหัสข้อมูลใน Amazon S3 ด้วยกุญแจที่รองรับการหมุนเวียนรายปีอัตโนมัติที่จัดการโดย AWS ขณะที่ยังคงอนุญาตให้บริษัทกำหนด key policy เปิดใช้การบันทึก CloudTrail ของการใช้กุญแจ และปิดใช้กุญแจหากจำเป็น ประเภทกุญแจ KMS ใดตอบสนองข้อกำหนดเหล่านี้?

A) AWS managed key (aws/s3)
B) customer managed key ที่เปิดใช้การหมุนเวียนอัตโนมัติ
C) AWS owned key
D) customer managed key แบบ imported key material (BYOK) ที่เปิดใช้การหมุนเวียนอัตโนมัติ

**ข้อ 7** *(Domain 1 — Task 1.3)*
solutions architect กำลังอธิบายว่า AWS KMS เข้ารหัสไฟล์ขนาด 4 GB ที่จัดเก็บโดยแอปพลิเคชันอย่างไร เนื่องจาก KMS เข้ารหัสข้อมูลได้โดยตรงสูงสุดเพียง 4 KB เท่านั้น ข้อความใดอธิบาย envelope encryption ได้อย่างถูกต้อง?

A) KMS แบ่งไฟล์เป็นชิ้น 4 KB และเข้ารหัสแต่ละชิ้นด้วย KMS key
B) แอปพลิเคชันขอ data key จาก KMS เข้ารหัสไฟล์ในเครื่องด้วย plaintext data key จากนั้นจัดเก็บ encrypted data key ไว้ข้างข้อมูลและทิ้ง plaintext data key
C) KMS สตรีมไฟล์ผ่าน KMS API ซึ่งเข้ารหัสแบบ server-side ด้วย KMS key
D) แอปพลิเคชันเข้ารหัสไฟล์ด้วย symmetric key ที่ hard-code ไว้ และ KMS เซ็นผลลัพธ์เพื่อความสมบูรณ์

**ข้อ 8** *(Domain 1 — Task 1.3)*
บริษัทจัดเก็บ master password ของ Amazon RDS for PostgreSQL และต้องหมุนเวียนโดยอัตโนมัติทุก 30 วันโดยไม่มี downtime ของแอปพลิเคชัน แอปพลิเคชันคงการเชื่อมต่อฐานข้อมูลแบบ long-lived ดังนั้นทีมต้องการกลยุทธ์การหมุนเวียนที่ข้อมูลรับรองเดิมยังคงใช้งานได้ขณะที่ข้อมูลรับรองใหม่ถูกเปิดใช้ โซลูชันใดตอบสนองข้อกำหนดเหล่านี้?

A) AWS Systems Manager Parameter Store SecureString parameters พร้อมฟังก์ชัน Lambda ที่ทริกเกอร์รายเดือน
B) AWS Secrets Manager พร้อมกลยุทธ์การหมุนเวียนแบบ single-user
C) AWS Secrets Manager พร้อมกลยุทธ์การหมุนเวียนแบบ alternating-users ซึ่งสลับระหว่าง database users สองตัวเพื่อให้ข้อมูลรับรองหนึ่งใช้งานได้เสมอ
D) AWS KMS automatic key rotation ที่ใช้กับรหัสผ่านฐานข้อมูล

**ข้อ 9** *(Domain 1 — Task 1.3)*
บริษัทสื่อจัดเก็บวิดีโอดิบใน Amazon S3 การปฏิบัติตามข้อกำหนดกำหนดให้บริษัทจัดการและจัดหากุญแจเข้ารหัสของตนเอง ให้ AWS ไม่จัดเก็บกุญแจเหล่านั้น และให้จัดหากุญแจในทุก request ตัวเลือกการเข้ารหัสใดตอบสนองข้อกำหนดเหล่านี้?

A) SSE-S3
B) SSE-KMS ด้วย customer managed key
C) SSE-C
D) Client-side encryption โดยใช้ AWS managed key aws/s3

**ข้อ 10** *(Domain 1 — Task 1.3)*
broker-dealer ต้องเก็บบันทึกการเทรดใน Amazon S3 เป็นเวลาเจ็ดปีในลักษณะที่ป้องกันไม่ให้ใครก็ตาม—รวมถึง AWS account root user—ลบหรือเขียนทับ objects ในช่วงระยะเวลาเก็บรักษา เพื่อให้เป็นไปตาม SEC Rule 17a-4 การกำหนดค่าใดตอบสนองข้อกำหนดนี้?

A) S3 Object Lock ในโหมด governance ด้วยระยะเวลาเก็บรักษา 7 ปี
B) S3 Object Lock ในโหมด compliance ด้วยระยะเวลาเก็บรักษา 7 ปีบน bucket ที่เปิดใช้ versioning
C) S3 bucket policy ที่ปฏิเสธ s3:DeleteObject สำหรับ principals ทั้งหมด
D) S3 Glacier Deep Archive พร้อม lifecycle rule ที่หมดอายุ objects หลัง 7 ปี

**ข้อ 11** *(Domain 1 — Task 1.2)*
แอปพลิเคชันเว็บรันบนอินสแตนซ์ EC2 หลัง Application Load Balancer วิศวกรเครือข่ายเพิ่มกฎ network ACL กับ subnet ที่อนุญาต inbound TCP port 443 จาก 0.0.0.0/0 แต่ไคลเอนต์ยังคงทำ HTTPS requests ไม่สำเร็จ security groups ถูกกำหนดค่าอย่างถูกต้อง สาเหตุที่**เป็นไปได้มากที่สุด**คืออะไร?

A) network ACL เป็น stateful และต้องการกฎ connection-tracking
B) network ACL ไม่มีกฎ outbound ที่อนุญาต ephemeral ports (1024–65535) ดังนั้นทราฟฟิกตอบกลับถูกบล็อกเพราะ NACLs เป็น stateless
C) security group ต้องอนุญาต outbound port 443 ด้วย เพราะ security groups เป็น stateless
D) Network ACLs ไม่สามารถอนุญาตทราฟฟิกจาก 0.0.0.0/0; ต้องระบุ CIDR เฉพาะ

**ข้อ 12** *(Domain 1 — Task 1.2)*
ข้อความสองข้อใดเกี่ยวกับ security groups และ network ACLs ใน VPC ถูกต้อง? (เลือกสองข้อ)

A) Security groups เป็น stateful ดังนั้นทราฟฟิกตอบกลับถูกอนุญาตโดยอัตโนมัติโดยไม่คำนึงถึงกฎ outbound
B) Network ACLs ประเมินกฎตามลำดับตัวเลขและรองรับกฎ Deny แบบ explicit
C) Security groups รองรับทั้งกฎ Allow และ Deny
D) Network ACLs ถูกแนบกับ elastic network interfaces แต่ละตัว
E) กฎของ security group ถูกประเมินตามลำดับตัวเลข หยุดที่การจับคู่ครั้งแรก

**ข้อ 13** *(Domain 1 — Task 1.2)*
บริษัท e-commerce ที่รันแอปพลิเคชันที่เปิดสู่สาธารณะบน CloudFront และ ALB กังวลเกี่ยวกับการโจมตี DDoS ขนาดใหญ่และซับซ้อน บริษัทต้องการการเข้าถึง AWS Shield Response Team 24/7 การป้องกันต้นทุนจากค่าใช้จ่ายการปรับขนาดที่เกิดจากการโจมตี และการวินิจฉัยการโจมตี บริษัทควรใช้บริการใด?

A) AWS Shield Standard ซึ่งเปิดใช้งานโดยอัตโนมัติโดยไม่มีค่าใช้จ่าย
B) AWS Shield Advanced
C) AWS WAF พร้อม rate-based rules
D) Amazon GuardDuty พร้อม EC2 protection plan

**ข้อ 14** *(Domain 1 — Task 1.2)*
REST API หลัง Application Load Balancer กำลังถูกโจมตีด้วยความพยายาม SQL injection และ requests ที่มากเกินไปจากชุด IP addresses ขนาดเล็ก โซลูชันใดบล็อกรูปแบบ request ที่เป็นอันตรายที่ edge ของแอปพลิเคชันโดยใช้ความพยายามในการพัฒนา**น้อยที่สุด**?

A) เพิ่มโค้ด input validation ในทุก API handler
B) เชื่อม AWS WAF กับ ALB โดยใช้ SQL injection managed rule group และ rate-based rule
C) เปิดใช้ AWS Shield Standard บน ALB
D) กำหนดค่า ALB security group ให้ปฏิเสธ requests ที่มี SQL keywords

**ข้อ 15** *(Domain 1 — Task 1.2)*
บริษัทต้องการจัดการความต้องการด้านความปลอดภัยสามข้อ: (1) ตรวจจับอินสแตนซ์ EC2 ที่ถูกบุกรุกและกิจกรรม API ที่ผิดปกติอย่างต่อเนื่องโดยใช้ threat intelligence (2) ค้นพบและจำแนกข้อมูลส่วนบุคคลที่ระบุตัวตนได้ (PII) ที่จัดเก็บใน S3 buckets และ (3) สแกนอินสแตนซ์ EC2 และ container images หาช่องโหว่ซอฟต์แวร์ (CVEs) การจับคู่บริการ AWS กับความต้องการใดถูกต้อง?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**ข้อ 16** *(Domain 1 — Task 1.2)*
แอปพลิเคชันที่รันบนอินสแตนซ์ EC2 ใน private subnets ต้องอัปโหลด objects ไปยัง Amazon S3 และเรียก Amazon DynamoDB นโยบายองค์กรห้ามไม่ให้ทราฟฟิกผ่านอินเทอร์เน็ตสาธารณะ และทีมต้องการตัวเลือกที่ต้นทุนต่ำที่สุดสำหรับทั้งสองบริการ โซลูชันใดตอบสนองข้อกำหนดเหล่านี้?

A) NAT gateway ใน public subnet
B) Gateway VPC endpoints สำหรับ S3 และ DynamoDB อ้างอิงใน route tables ของ subnets
C) Interface VPC endpoints (AWS PrivateLink) สำหรับ S3 และ DynamoDB
D) internet gateway พร้อมกฎ security group ที่จำกัด

**ข้อ 17** *(Domain 1 — Task 1.3)*
หลังจากเหตุการณ์ server-side request forgery (SSRF) ที่ผู้โจมตีดึงข้อมูลรับรอง IAM role จาก metadata service ของอินสแตนซ์ EC2 ผ่านแอปพลิเคชันเว็บที่มีช่องโหว่ ทีมความปลอดภัยต้องการเสริมความแข็งแกร่งให้อินสแตนซ์ทั้งหมดต่อการโจมตีประเภทนี้ ทีมควรทำอะไร?

A) บังคับใช้ IMDSv2 โดยกำหนดให้มี session tokens (HttpTokens=required) เพื่อให้ metadata requests ต้องการ token ที่ได้จาก PUT ซึ่ง SSRF requests แบบง่ายไม่สามารถได้มา
B) ปิดใช้ instance metadata service บนอินสแตนซ์ทั้งหมด เนื่องจากแอปพลิเคชันไม่จำเป็นต้องใช้
C) บล็อก 169.254.169.254 ใน network ACL ของ subnet
D) ย้ายข้อมูลรับรองของ instance role ไปยังไฟล์การกำหนดค่าบนอินสแตนซ์

**ข้อ 18** *(Domain 1 — Task 1.3)*
solutions architect ต้องจัดเก็บค่าการกำหนดค่าแอปพลิเคชันแบบ plaintext ประมาณ 200 ค่า (feature flags, environment names, endpoint URLs) และรหัสผ่านฐานข้อมูล 5 รายการ รหัสผ่านต้องการการหมุนเวียนอัตโนมัติ; ค่าการกำหนดค่าไม่ต้องการ และทีมต้องการลดต้นทุน ชุดใด**คุ้มค่าที่สุด**?

A) จัดเก็บทุกอย่างใน AWS Secrets Manager
B) จัดเก็บทุกอย่างใน AWS Systems Manager Parameter Store standard parameters
C) จัดเก็บค่าการกำหนดค่าใน Parameter Store standard parameters (ไม่มีค่าใช้จ่าย) และรหัสผ่านใน AWS Secrets Manager โดยเปิดใช้การหมุนเวียน
D) จัดเก็บค่าการกำหนดค่าใน S3 และรหัสผ่านใน Parameter Store SecureString parameters พร้อมการหมุนเวียนอัตโนมัติในตัว

**ข้อ 19** *(Domain 1 — Task 1.3)*
บริษัทเข้ารหัส objects ใน S3 ด้วย SSE-KMS โดยใช้ customer managed key แอปพลิเคชันใน account เดียวกันอ่าน objects เหล่านี้หลายพันครั้งต่อวินาที และทีมพบ throttling และความกังวลด้านต้นทุนจากการเรียก KMS API การเปลี่ยนแปลงใดลดทราฟฟิก KMS request ขณะยังคงการเข้ารหัส SSE-KMS?

A) เปลี่ยน bucket เป็น SSE-S3 ซึ่งไม่ใช้กุญแจ
B) เปิดใช้ S3 Bucket Keys เพื่อให้ S3 ใช้ bucket-level key อายุสั้นเพื่อลดการเรียก KMS
C) ปิดใช้การหมุนเวียนกุญแจอัตโนมัติบน customer managed key
D) แทนที่ customer managed key ด้วย imported key material

**ข้อ 20** *(Domain 1 — Task 1.1)*
ข้อความสองข้อใดเกี่ยวกับการประเมิน IAM policy และ AWS Organizations ถูกต้อง? (เลือกสองข้อ)

A) SCPs ให้สิทธิ์แก่ IAM users และ roles ใน member accounts
B) explicit Deny ใน policy ที่ใช้ได้ใดก็ตามจะแทนที่ Allow ใดเสมอ
C) Resource-based policies ไม่สามารถให้การเข้าถึงข้าม account โดยไม่มี SCP
D) permissions boundary กำหนดสิทธิ์สูงสุดที่ identity-based policy สามารถให้แก่ user หรือ role ได้ แต่ไม่ให้สิทธิ์ใดด้วยตัวเอง
E) หากไม่มี policy ใดกล่าวถึงการกระทำ การกระทำนั้นถูกอนุญาตโดยค่าเริ่มต้นสำหรับ IAM users

---

## ส่วนที่ 2 — Design Resilient Architectures (ข้อ 21–37)

**ข้อ 21** *(Domain 2 — Task 2.2)*
ผู้ค้าปลีกออนไลน์รัน Amazon RDS for MySQL ฐานข้อมูลมีทราฟฟิกการอ่านหนักจาก reporting dashboards และบริษัทยังต้องการให้ฐานข้อมูลรอดจากความล้มเหลวของ Availability Zone โดยมีเฟลโอเวอร์อัตโนมัติและไม่ต้องแทรกแซงด้วยมือ ชุดใดจัดการ**ทั้งสอง**ข้อกำหนด?

A) เปิดใช้การ deploy Multi-AZ เท่านั้น; standby instance สามารถให้บริการการอ่านสำหรับ reporting ได้
B) สร้าง read replicas เท่านั้น; replica จะถูก promote โดยอัตโนมัติเมื่อ AZ ของ primary ล้มเหลว
C) เปิดใช้การ deploy Multi-AZ สำหรับเฟลโอเวอร์อัตโนมัติ และเพิ่ม read replicas เพื่อ offload การอ่านสำหรับ reporting
D) ย้ายไปยังคลาสอินสแตนซ์ single-AZ ที่ใหญ่กว่าเพื่อจัดการทั้งสอง workloads

**ข้อ 22** *(Domain 2 — Task 2.2)*
บริษัทต้องการ RDS high availability ข้าม Availability Zones แต่คัดค้านการจ่ายเงินสำหรับ Multi-AZ standby instance แบบดั้งเดิมที่ไม่ให้บริการทราฟฟิก ตัวเลือกการ deploy RDS ใดให้เฟลโอเวอร์อัตโนมัติ**และ**อนุญาตให้ความจุ standby ให้บริการทราฟฟิกการอ่าน?

A) RDS Multi-AZ DB instance deployment (standby หนึ่งตัว)
B) RDS Multi-AZ DB cluster deployment ซึ่งมี readable standby instances สองตัวพร้อม reader endpoint
C) RDS read replicas ใน AZ สามตัวพร้อม Application Load Balancer
D) RDS Single-AZ พร้อมการสำรองข้อมูลอัตโนมัติ

**ข้อ 23** *(Domain 2 — Task 2.2)*
แพลตฟอร์มการชำระเงินระดับโลกบน Amazon Aurora ต้องเฟลโอเวอร์ไปยัง AWS Region ที่สองหาก Region หลักไม่พร้อมใช้งาน ทีมการปฏิบัติตามข้อกำหนดถามว่า Aurora Global Database สามารถรับประกันการสูญเสียข้อมูลเป็นศูนย์ (RPO = 0) ข้าม Regions ได้หรือไม่ solutions architect ควรบอกพวกเขาว่าอย่างไร?

A) ได้ — Aurora Global Database จำลองแบบซิงโครนัสข้าม Regions ดังนั้น RPO เป็น 0 พอดี
B) ไม่ได้ — Aurora Global Database ใช้การจำลองแบบอะซิงโครนัสที่อิงพื้นที่จัดเก็บ โดยมี lag โดยทั่วไปต่ำกว่า 1 วินาที ดังนั้น cross-Region RPO ใกล้ศูนย์แต่ไม่เคยรับประกันเป็น 0 พอดี
C) ได้ — แต่เฉพาะเมื่อเปิดใช้ write forwarding บน secondary Region
D) ไม่ได้ — Aurora Global Database จำลองตามตาราง 5 นาที ให้ RPO 5 นาที

**ข้อ 24** *(Domain 2 — Task 2.2)*
แผนการกู้คืนจากภัยพิบัติของบริษัทระบุว่า: "หลัง Regional outage ระบบออร์เดอร์ต้องกลับมาทำงานภายใน 4 ชั่วโมง และไม่สูญเสีย transactions เกิน 15 นาที" ข้อความใดจับคู่ตัวเลขเหล่านี้กับ DR metrics ได้อย่างถูกต้อง?

A) RTO = 15 นาที; RPO = 4 ชั่วโมง
B) RTO = 4 ชั่วโมง; RPO = 15 นาที
C) MTBF = 4 ชั่วโมง; MTTR = 15 นาที
D) RPO = 4 ชั่วโมง; SLA = 15 นาที

**ข้อ 25** *(Domain 2 — Task 2.2)*
บริษัทประกันภัยต้องการกลยุทธ์ DR สำหรับแอปพลิเคชันที่สำคัญ ข้อกำหนด: ข้อมูลต้องถูกจำลองไปยัง DR Region อย่างต่อเนื่อง; โครงสร้างพื้นฐานหลัก (ฐานข้อมูล, AMIs, stack ขั้นต่ำ) ต้องมีอยู่แล้วใน DR Region แต่ compute ควรปิดอยู่จนกว่าจะเกิดภัยพิบัติ เพื่อควบคุมต้นทุน; RTO ระดับหลายสิบนาทียอมรับได้ กลยุทธ์ DR ใดตรงกัน?

A) Backup and restore
B) Pilot light — องค์ประกอบหลักจัดเตรียมไว้ใน DR Region พร้อมข้อมูลจำลองแบบ live แต่ compute ปิดจนกว่าจะเฟลโอเวอร์
C) Warm standby — สำเนาเต็มของ workload ที่ลดขนาดแต่ทำงานอยู่เสมอ
D) Multi-site active/active

**ข้อ 26** *(Domain 2 — Task 2.2)*
ข้อความสองข้อใดเกี่ยวกับกลยุทธ์ disaster recovery ของ AWS ถูกต้อง? (เลือกสองข้อ)

A) Backup and restore ต้องการให้ทรัพยากรถูกจัดเตรียมและทำงานล่วงหน้าใน recovery Region
B) Backup and restore ให้ RTO ต่ำที่สุดในสี่กลยุทธ์
C) Multi-site active/active ให้บริการทราฟฟิกจากหลาย Regions พร้อมกันและให้ RTO ใกล้ศูนย์ที่ต้นทุนสูงที่สุด
D) Pilot light คงสำเนา full-capacity ของแอปพลิเคชันที่ให้บริการทราฟฟิก production ใน recovery Region
E) Warm standby คงสำเนาที่ลดขนาดแต่ทำงานได้เต็มที่ของ workload ที่ทำงานอยู่เสมอใน recovery Region

**ข้อ 27** *(Domain 2 — Task 2.1)*
แอปพลิเคชันประมวลผลภาพอ่านข้อความจาก Amazon SQS standard queue การประมวลผลภาพหนึ่งใช้เวลาสูงสุด 3 นาที แต่ visibility timeout ของคิวตั้งไว้ที่ 30 วินาที ผู้ใช้รายงานว่าบางภาพถูกประมวลผลสองหรือสามครั้ง สาเหตุและการแก้ไขที่**เป็นไปได้มากที่สุด**คืออะไร?

A) คิวเป็น FIFO; เปลี่ยนเป็น standard queue
B) visibility timeout หมดอายุก่อนการประมวลผลเสร็จ ทำให้ข้อความมองเห็นได้สำหรับ consumers อื่นอีกครั้ง; เพิ่ม visibility timeout ให้เกินเวลาการประมวลผล
C) long polling ถูกปิดใช้; เปิดใช้ ReceiveMessageWaitTime 20 วินาที
D) ระยะเวลาการเก็บข้อความสั้นเกินไป; เพิ่มเป็น 14 วัน

**ข้อ 28** *(Domain 2 — Task 2.1)*
แอปพลิเคชันการเรียกเก็บเงินบริโภคข้อความจาก SQS queue เป็นครั้งคราวข้อความที่ผิดรูปแบบทำให้ consumer ล้มเหลวซ้ำๆ และข้อความวนเวียนผ่านคิวตลอดไป สิ้นเปลือง compute architect ควรกำหนดค่าอะไร?

A) dead-letter queue พร้อม maxReceiveCount redrive policy เพื่อให้ข้อความที่ล้มเหลวซ้ำๆ ถูกย้ายออกไปเพื่อการวิเคราะห์
B) visibility timeout ที่สั้นกว่าเพื่อให้ข้อความที่ไม่ดีถูกลองใหม่เร็วขึ้น
C) FIFO ordering ซึ่งทิ้งข้อความที่ผิดรูปแบบโดยอัตโนมัติ
D) ระยะเวลาการเก็บข้อความ 1 นาทีเพื่อให้ข้อความที่ไม่ดีหมดอายุเร็ว

**ข้อ 29** *(Domain 2 — Task 2.1)*
บริษัทนายหน้าประมวลผลเหตุการณ์การเทรดต่อ customer account เหตุการณ์สำหรับ account เดียวกันต้องถูกประมวลผลตามลำดับอย่างเคร่งครัดและ exactly once แต่เหตุการณ์สำหรับ accounts ต่างกันอาจถูกประมวลผลแบบขนานเพื่อ throughput โซลูชันใดตอบสนองข้อกำหนดเหล่านี้?

A) SQS standard queue ที่มี consumer thread หนึ่งตัว
B) SQS FIFO queue ที่ใช้ customer account ID เป็น MessageGroupId ซึ่งรักษาลำดับภายในแต่ละ group ขณะอนุญาตการขนานข้าม groups
C) SNS standard topic พร้อม message filtering ตาม account ID
D) SQS FIFO queue ที่มี MessageGroupId เดียวสำหรับลูกค้าทั้งหมด

**ข้อ 30** *(Domain 2 — Task 2.1)*
เมื่อมีการสั่งซื้อ แพลตฟอร์ม e-commerce ต้องทริกเกอร์สามกระบวนการอิสระพร้อมกัน: การสร้างใบแจ้งหนี้ การจัดการคลังสินค้า และการนำเข้า analytics แต่ละกระบวนการต้องได้รับทุกเหตุการณ์ออร์เดอร์ บัฟเฟอร์อย่างทนทาน และประมวลผลตามจังหวะของตัวเอง สถาปัตยกรรมใดตอบสนองข้อกำหนดเหล่านี้?

A) SQS queue หนึ่งตัวที่มี consumers สามตัว poll คิวเดียวกัน
B) SNS topic ที่ fan out ไปยัง SQS queues สามตัว หนึ่งตัว subscribe ต่อกระบวนการ
C) ฟังก์ชัน Lambda สามตัวที่ถูกเรียกตามลำดับโดย Step Functions
D) SNS topic พร้อม email subscriptions สามตัว

**ข้อ 31** *(Domain 2 — Task 2.1)*
ระหว่าง flash sale ฟังก์ชัน Lambda ที่ทริกเกอร์โดย API Gateway เริ่มคืนข้อผิดพลาด throttling 429 ขณะที่ฟังก์ชัน Lambda ที่สำคัญอื่นๆ ใน account เดียวกันก็เริ่มถูก throttle account อยู่ที่โควต้า concurrency เริ่มต้น การกระทำใดปกป้องฟังก์ชันที่สำคัญจากการถูกแย่งทรัพยากรโดยฟังก์ชัน sale?

A) เพิ่ม timeout ของฟังก์ชัน sale จาก 3 วินาทีเป็นสูงสุด 15 นาที
B) กำหนดค่า reserved concurrency บนฟังก์ชันที่สำคัญ (และอาจ cap ฟังก์ชัน sale) รับประกัน concurrency เฉพาะให้พวกมันจาก account pool
C) เปิดใช้ provisioned concurrency บนฟังก์ชัน sale ซึ่งเพิ่มโควต้าทั้ง account
D) ย้ายฟังก์ชันที่สำคัญไปยังการกำหนดค่าหน่วยความจำ 10 GB

**ข้อ 32** *(Domain 2 — Task 2.1)*
บริษัทสื่อมี workflow การเผยแพร่วิดีโอที่มีขั้นตอนรอสูงสุด 2 วันให้ moderator ที่เป็นมนุษย์อนุมัติเนื้อหาผ่านเครื่องมือภายนอกก่อนดำเนินการต่อ workflow ต้องตรวจสอบได้ ทำงานหลายวัน และทำต่อ ณ จุดที่หยุดพอดีเมื่อ moderator ตอบ โซลูชันใดเหมาะ**ที่สุด**?

A) Express Step Functions workflow พร้อม Wait state
B) Standard Step Functions workflow ที่ใช้ callback pattern: task token (waitForTaskToken) ถูกส่งไปยังระบบ moderation และ workflow ทำต่อเมื่อ SendTaskSuccess ถูกเรียก
C) ฟังก์ชัน Lambda ที่ sleep จนกว่า moderator จะอนุมัติ
D) EventBridge rule พร้อม scheduled delay 2 วัน

**ข้อ 33** *(Domain 2 — Task 2.1)*
บริษัทรัน IoT ingestion pipeline ปริมาณสูงที่ดำเนินการ workflow ประมาณ 90,000 ครั้งต่อวินาที แต่ละครั้งเสร็จในเวลาต่ำกว่า 5 วินาที ความหมาย exactly-once execution ไม่จำเป็น แต่ต้องลดต้นทุน แยกต่างหาก workflow การกระทบยอดทางการเงินรายเดือนทำงาน 12 ชั่วโมงและต้องการ exactly-once execution พร้อมประวัติการดำเนินการเต็มรูปแบบ ควรใช้ Step Functions workflow ประเภทใด?

A) Express workflows สำหรับ IoT pipeline; Standard workflows สำหรับการกระทบยอด
B) Standard workflows สำหรับทั้งสอง
C) Express workflows สำหรับทั้งสอง เนื่องจาก Express รองรับการดำเนินการได้นานถึงหนึ่งปี
D) Standard workflows สำหรับ IoT pipeline; Express workflows สำหรับการกระทบยอด

**ข้อ 34** *(Domain 2 — Task 2.2)*
บริษัทโฮสต์แอปพลิเคชันเว็บหลักบน ALB ใน us-east-1 และสำเนา recovery แบบ passive ใน us-west-2 บริษัทต้องการให้ Route 53 ส่งทราฟฟิกทั้งหมดไปยัง us-east-1 และเปลี่ยนเส้นทางผู้ใช้ไปยัง us-west-2 โดยอัตโนมัติเฉพาะเมื่อ endpoint หลักไม่สมบูรณ์ การกำหนดค่า Route 53 ใดตอบสนองข้อกำหนดนี้?

A) Weighted routing ด้วยน้ำหนัก 50/50
B) Failover routing พร้อม health check บน primary record และ us-west-2 record ตั้งเป็น secondary
C) Latency-based routing ระหว่างสอง Regions
D) Geolocation routing พร้อม default record ที่ชี้ไปยัง us-west-2

**ข้อ 35** *(Domain 2 — Task 2.2)*
Auto Scaling group รันเว็บเซิร์ฟเวอร์ EC2 หลัง Application Load Balancer ข้าม Availability Zones สามตัว ALB ทำเครื่องหมายบางอินสแตนซ์ว่าไม่สมบูรณ์เพราะ web server process ขัดข้อง แต่ Auto Scaling group ไม่เคยแทนที่พวกมันเพราะอินสแตนซ์ EC2 เองยังผ่าน status checks solutions architect ควรเปลี่ยนอะไร?

A) เปิดใช้ detailed CloudWatch monitoring บนอินสแตนซ์
B) กำหนดค่า Auto Scaling group ให้ใช้ ELB health checks เพิ่มเติมจาก EC2 status checks เพื่อให้อินสแตนซ์ที่ล้มเหลว ALB target health ถูกยุติและแทนที่
C) เพิ่ม ASG health check grace period
D) เปลี่ยน ALB เป็น Network Load Balancer

**ข้อ 36** *(Domain 2 — Task 2.1)*
บริษัทเทรดต้องการ load balancer สำหรับ custom TCP protocol ที่ต้องจัดการหลายล้าน requests ต่อวินาทีด้วย latency ต่ำมากและเปิดเผย static IP address ต่อ Availability Zone บริษัทควรเลือก load balancer ใด?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**ข้อ 37** *(Domain 2 — Task 2.2)*
ข้อความสองข้อใดเกี่ยวกับการสร้างพื้นที่จัดเก็บที่ยืดหยุ่นบน AWS ถูกต้อง? (เลือกสองข้อ)

A) S3 Cross-Region Replication คัดลอก objects ทั้งหมดที่มีอยู่ก่อนที่จะกำหนดค่าการจำลองย้อนหลัง โดยไม่มีการดำเนินการเพิ่มเติม
B) คลาสพื้นที่จัดเก็บ Amazon EFS Standard จัดเก็บข้อมูลอย่างซ้ำซ้อนข้ามหลาย Availability Zones และสามารถ mount พร้อมกันโดยอินสแตนซ์ใน AZ ต่างกัน
C) S3 Cross-Region Replication ต้องการให้เปิดใช้ versioning บนทั้ง source และ destination buckets
D) Amazon EFS volumes สามารถแนบกับอินสแตนซ์ EC2 ได้ครั้งละหนึ่งตัวเท่านั้น เหมือน EBS
E) การเปิดใช้ S3 versioning จำลอง objects ไปยัง Region อื่นโดยอัตโนมัติ

---

## ส่วนที่ 3 — Design High-Performing Architectures (ข้อ 38–53)

**ข้อ 38** *(Domain 3 — Task 3.1)*
บริษัท media analytics รันฐานข้อมูล PostgreSQL บน Amazon RDS โดยใช้ gp3 EBS volume workload การรายงานใหม่ต้องการ 50,000 IOPS ที่ยั่งยืนพร้อม latency ต่ำกว่ามิลลิวินาทีและการรับประกันความทนทาน 99.999% volume ต้องรองรับสิ่งนี้อย่างสม่ำเสมอโดยไม่ต้อง burst solutions architect ควรแนะนำ EBS volume ประเภทใด?

A) gp3 ที่จัดเตรียม IOPS สูงสุด
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 ที่มีขนาด volume 16 TiB

**ข้อ 39** *(Domain 3 — Task 3.1)*
บริษัทวิจัย genomics ต้องการพื้นที่จัดเก็บไฟล์ที่ใช้ร่วมกันสำหรับ Linux-based high-performance computing (HPC) cluster ที่มี 500 อินสแตนซ์ EC2 workload ต้องการ latency ต่ำกว่ามิลลิวินาทีและ throughput รวมหลายร้อย GB/s และ input datasets ถูก stage ใน Amazon S3 บริการพื้นที่จัดเก็บใดตอบสนองข้อกำหนดเหล่านี้ได้ดีที่สุด?

A) Amazon EFS พร้อม Max I/O performance mode
B) Amazon FSx for Windows File Server พร้อม SSD storage
C) Amazon FSx for Lustre ที่เชื่อมกับ S3 bucket
D) Amazon S3 ที่เข้าถึงผ่าน Mountpoint บนแต่ละอินสแตนซ์

**ข้อ 40** *(Domain 3 — Task 3.1)*
บริษัทกำลังย้ายแอปพลิเคชัน Windows ภายในองค์กรที่อิง SMB file shares และ access control lists ที่รวมกับ Active Directory แอปพลิเคชันจะรันบนอินสแตนซ์ EC2 Windows ใน Availability Zones สองตัวและต้องคงสิทธิ์ NTFS ที่มีอยู่ solutions architect ควรเลือกบริการพื้นที่จัดเก็บ AWS ใด?

A) Amazon EFS พร้อม POSIX permissions
B) Amazon FSx for Windows File Server ในโหมด Multi-AZ deployment
C) Amazon S3 พร้อม bucket policies ที่จับคู่กับ AD groups
D) Amazon FSx for Lustre พร้อม persistent storage

**ข้อ 41** *(Domain 3 — Task 3.1)*
บริษัทผลิตวิดีโอในสิงคโปร์อัปโหลดไฟล์ฟุตเทจดิบขนาด 40 GB ไปยัง S3 bucket ใน us-east-1 จากสำนักงานทั่วโลก การอัปโหลดมักล้มเหลวกลางคันผ่านอินเทอร์เน็ตสาธารณะ บังคับให้เริ่มใหม่ทั้งหมด และเวลาการถ่ายโอนโดยรวมช้า ชุดการกระทำใดที่ solutions architect ควรแนะนำ? (เลือกสองข้อ)

A) แปลง bucket เป็น S3 One Zone-IA เพื่อปรับปรุง write throughput
B) วาง Application Load Balancer หน้า bucket ในแต่ละ region
C) เปิดใช้ S3 Cross-Region Replication ไปยัง bucket ใน ap-southeast-1
D) เปิดใช้ S3 Transfer Acceleration บน bucket และอัปโหลดผ่าน accelerated endpoint
E) ใช้ multipart upload สำหรับไฟล์ขนาดใหญ่

**ข้อ 42** *(Domain 3 — Task 3.1)*
แพลตฟอร์ม real-time bidding รัน NoSQL workload บน EC2 ที่ต้องการ latency พื้นที่จัดเก็บต่ำที่สุดอย่างแท้จริงสำหรับข้อมูล scratch ชั่วคราว ข้อมูลถูกสร้างใหม่ตอน startup และไม่จำเป็นต้องรอดจากการ stop หรือ termination ของอินสแตนซ์ ตัวเลือกพื้นที่จัดเก็บใดให้ประสิทธิภาพสูงสุดสำหรับ use case นี้?

A) io2 EBS volume ที่มี 64,000 provisioned IOPS
B) Instance store (NVMe SSD) volumes บน storage-optimized instance
C) Amazon EFS ในโหมด General Purpose
D) gp3 EBS volume ที่มี provisioned throughput สูงสุด

**ข้อ 43** *(Domain 3 — Task 3.3)*
บริษัทเกมจัดเก็บข้อมูล session ของผู้เล่นในตาราง DynamoDB โดยมี partition key `game_id` มีเกมยอดนิยมเพียง 12 เกม และตารางกำลังประสบ throttling บนไม่กี่ partitions ขณะที่ความจุที่บริโภคโดยรวมต่ำกว่าความจุที่จัดเตรียมมาก solutions architect ควรแนะนำอะไร?

A) เปลี่ยนตารางเป็น provisioned capacity พร้อม auto scaling
B) ใช้ partition key ที่มี cardinality สูง เช่น composite ของ game_id และ player_id
C) สร้าง local secondary index บน player_id
D) เปิดใช้ DynamoDB Streams เพื่อกระจาย writes ข้าม partitions

**ข้อ 44** *(Domain 3 — Task 3.3)*
เว็บไซต์ e-commerce จัดเก็บข้อมูล product catalog ใน DynamoDB ทราฟฟิกการอ่านหนักมากโดยมี items เดียวกันถูกร้องขอหลายล้านครั้งต่อวัน และทีมต้องการ latency การอ่านระดับไมโครวินาทีโดยไม่เขียนการเรียก DynamoDB API ของแอปพลิเคชันใหม่ solutions architect ควรแนะนำอะไร?

A) deploy Amazon ElastiCache for Redis และแก้ไขแอปพลิเคชันให้ตรวจสอบ cache ก่อน
B) เพิ่ม DynamoDB Accelerator (DAX) หน้าตาราง
C) สร้าง global secondary index เพื่อกระจายการอ่าน
D) เปิดใช้ DynamoDB Global Tables ใน region ที่สอง

**ข้อ 45** *(Domain 3 — Task 3.3)*
บริษัท logistics มีตาราง DynamoDB ใน production ที่ต้องการรูปแบบ query ใหม่: การ query shipments ตาม `carrier_id` และเรียงตาม `delivery_date` โดยมี provisioned throughput ของตัวเองเพื่อให้ analytics queries ใหม่ไม่กระทบแอปพลิเคชันหลัก ตารางมีอยู่แล้วและมีทราฟฟิก live โซลูชันใดตอบสนองข้อกำหนดเหล่านี้?

A) สร้าง local secondary index โดยมี carrier_id เป็น sort key
B) สร้าง global secondary index โดยมี carrier_id เป็น partition key และ delivery_date เป็น sort key
C) สร้างตารางใหม่ด้วย composite primary key ของ carrier_id และ delivery_date
D) เปิดใช้ DynamoDB Stream และ query stream ตาม carrier_id

**ข้อ 46** *(Domain 3 — Task 3.3)*
บริการจัดการ session จัดเก็บ user sessions ใน DynamoDB Sessions ไม่มีประโยชน์หลัง 24 ชั่วโมง และทีมต้องการให้ items ที่หมดอายุถูกลบโดยอัตโนมัติโดยไม่มีค่าใช้จ่ายเพิ่มเติม solutions architect ควร implement อะไร?

A) ฟังก์ชัน Lambda ตามตารางที่สแกนตารางทุกชั่วโมงและลบ items เก่า
B) DynamoDB Time to Live (TTL) ด้วย expiration timestamp attribute บนแต่ละ item
C) lifecycle policy บนตาราง DynamoDB
D) DynamoDB Streams พร้อม filter เพื่อทิ้ง items ที่เก่ากว่า 24 ชั่วโมง

**ข้อ 47** *(Domain 3 — Task 3.3)*
แอปพลิเคชัน serverless ใช้ฟังก์ชัน Lambda ที่เชื่อมต่อกับฐานข้อมูล Amazon RDS for MySQL ระหว่างทราฟฟิก spike การเรียก Lambda พร้อมกันหลายร้อยครั้งทำให้ connection limit ของฐานข้อมูลหมด เกิดข้อผิดพลาด โซลูชันใดจัดการสิ่งนี้โดยเปลี่ยนแอปพลิเคชันน้อยที่สุด?

A) เพิ่มขนาด RDS instance เพื่อเพิ่ม max_connections
B) วาง Amazon RDS Proxy ระหว่างฟังก์ชัน Lambda และฐานข้อมูล
C) ย้ายฐานข้อมูลไปยัง DynamoDB
D) กำหนดค่า Lambda reserved concurrency เป็น 10

**ข้อ 48** *(Domain 3 — Task 3.3)*
เว็บไซต์ข่าวการเงินใช้ Amazon Aurora MySQL ทราฟฟิกการอ่าน spike 20 เท่าระหว่างชั่วโมงตลาดและ primary instance ถูกจำกัดด้วย CPU ในการให้บริการ SELECT queries การเขียนมีปานกลาง วิธีใด**มีประสิทธิภาพในการดำเนินงานมากที่สุด**ในการปรับขนาดการอ่าน?

A) เพิ่ม Aurora Replicas และนำทราฟฟิกการอ่านไปยัง cluster reader endpoint พร้อม auto scaling
B) สร้าง Multi-AZ standby และส่งการอ่านไปยัง standby
C) shard ฐานข้อมูลข้ามหลาย Aurora clusters
D) เปิดใช้ Aurora Backtrack เพื่อ offload การอ่าน

**ข้อ 49** *(Domain 3 — Task 3.4)*
บริษัทเกมผู้เล่นหลายคนรันแอปพลิเคชันที่ไวต่อ latency โดยใช้ UDP protocol บน Network Load Balancers ในสอง AWS Regions ผู้เล่นทั่วโลกต้องการ static IP addresses สำหรับ allow-listing และการเฟลโอเวอร์ระดับภูมิภาคที่รวดเร็ว solutions architect ควรเลือกบริการใด?

A) Amazon CloudFront ที่มี custom origins สองตัว
B) AWS Global Accelerator ที่มี endpoint groups ในทั้งสอง regions
C) Amazon Route 53 พร้อม latency-based routing
D) Application Load Balancer พร้อม cross-zone load balancing

**ข้อ 50** *(Domain 3 — Task 3.4)*
บริษัทสตรีมมิงต้องปฏิบัติตามกฎการอนุญาตเนื้อหา: ผู้ใช้ในเยอรมนีต้องได้รับบริการจากการ deploy eu-central-1 เสมอ และผู้ใช้ในฝรั่งเศสจากการ deploy eu-west-3 โดยไม่คำนึงว่า endpoint ใดให้ latency ต่ำกว่า นโยบายการกำหนดเส้นทาง Route 53 ใดควรใช้?

A) Latency-based routing
B) Geolocation routing
C) Geoproximity routing พร้อม positive bias บน eu-central-1
D) Weighted routing ด้วยน้ำหนัก 50/50

**ข้อ 51** *(Domain 3 — Task 3.2)*
solutions architect กำลัง deploy HPC workload ที่ tightly coupled ซึ่งใช้ MPI และต้องการ network latency ต่ำที่สุดเท่าที่จะเป็นไปได้และประสิทธิภาพ packet-per-second สูงสุดระหว่างอินสแตนซ์ EC2 32 ตัว ควรใช้กลยุทธ์การวางใด?

A) Spread placement group ข้าม Availability Zones สามตัว
B) Partition placement group ที่มี 7 partitions
C) Cluster placement group ใน Availability Zone เดียว
D) เปิดอินสแตนซ์ใน subnets แยกกันพร้อม enhanced networking

**ข้อ 52** *(Domain 3 — Task 3.5)*
บริษัท IoT นำเข้าข้อมูล clickstream ที่ต้องส่งไปยัง Amazon S3 แบบ near real time สำหรับ analytics ทีมต้องการโซลูชันที่จัดการอย่างเต็มรูปแบบโดยไม่มี consumer applications ที่ต้องเขียน ไม่มีการจัดการ shard และมี record buffering ในตัวและการแปลงรูปแบบเป็น Parquet พวกเขาควรใช้บริการใด?

A) Amazon Kinesis Data Streams พร้อม Lambda consumer
B) Amazon Data Firehose (เดิมคือ Kinesis Data Firehose) พร้อม S3 destination
C) Amazon SQS พร้อมกลุ่ม EC2 pollers
D) Amazon MSK พร้อม custom Kafka Connect sink

**ข้อ 53** *(Domain 3 — Task 3.5)*
บริษัทจัดเก็บ application logs เป็นไฟล์ JSON ที่บีบอัดใน Amazon S3 และต้องการให้นักวิเคราะห์รัน ad hoc SQL queries กับพวกมันโดยไม่จัดเตรียมเซิร์ฟเวอร์หรือโหลดข้อมูลเข้าฐานข้อมูล schema ควรถูกค้นพบและ catalog โดยอัตโนมัติ ชุดใดที่ solutions architect ควรแนะนำ?

A) Amazon Redshift พร้อม COPY commands และ scheduled refreshes
B) AWS Glue crawlers เพื่อเติม Data Catalog และ Amazon Athena สำหรับ SQL queries
C) Amazon EMR พร้อม long-running Presto cluster
D) Amazon RDS for PostgreSQL พร้อม aws_s3 extension

---

## ส่วนที่ 4 — Design Cost-Optimized Architectures (ข้อ 54–65)

**ข้อ 54** *(Domain 4 — Task 4.2)*
สถาบันวิจัยรัน batch simulations รายคืนบน EC2 ที่ใช้เวลาประมาณ 90 นาที checkpoint ความคืบหน้าไปยัง Amazon S3 ทุก 5 นาที และสามารถเริ่มใหม่จาก checkpoint ล่าสุดได้ตลอดเวลา สถาบันต้องการต้นทุน compute ต่ำที่สุดเท่าที่จะเป็นไปได้ solutions architect ควรแนะนำตัวเลือกการซื้อใด?

A) On-Demand Instances ใน AZ เดียว
B) Standard Reserved Instances ด้วยเทอม 3 ปี
C) Spot Instances ที่ใช้ Spot Fleet ที่กระจายข้ามหลายประเภทอินสแตนซ์และ AZs
D) Compute Savings Plan ที่ขนาดตามจุดสูงสุดของ batch workload

**ข้อ 55** *(Domain 4 — Task 4.2)*
บริษัท SaaS มีการใช้จ่าย compute baseline ที่คงที่ แต่คาดว่าจะย้าย workloads ระหว่าง EC2, AWS Fargate และ AWS Lambda ตลอดสามปีข้างหน้าขณะที่ทันสมัยขึ้น บริษัทต้องการส่วนลดที่อิงความผูกพันซึ่งใช้โดยอัตโนมัติกับทั้งสามบริการ compute และทุก region solutions architect ควรแนะนำตัวเลือกใด?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**ข้อ 56** *(Domain 4 — Task 4.2)*
บริษัทซื้อ Standard Reserved Instances 3 ปีสำหรับ Amazon RDS และ Amazon EC2 หลังการ re-architecture บริษัทไม่ต้องการ reservation ทั้งสองอีกต่อไป ทีมการเงินถามว่า reservations ใดสามารถขายเพื่อกู้คืนต้นทุนได้ solutions architect ควรบอกพวกเขาว่าอย่างไร?

A) ทั้ง EC2 และ RDS Reserved Instances สามารถขายได้ใน Reserved Instance Marketplace
B) เฉพาะ EC2 Reserved Instances ที่สามารถขายได้ใน Reserved Instance Marketplace; RDS RIs ขายต่อไม่ได้
C) เฉพาะ RDS Reserved Instances ที่สามารถขายได้ เพราะ reservations ฐานข้อมูลโอนได้
D) ขายไม่ได้ทั้งคู่; Reserved Instances คืนเงินไม่ได้และโอนไม่ได้ในทุกกรณี

**ข้อ 57** *(Domain 4 — Task 4.2)*
ทีมพัฒนารัน containerized fault-tolerant data processing บน Amazon ECS ด้วย EC2 Spot capacity พวกเขาต้องการให้ workers drain และ checkpoint อย่างนุ่มนวลก่อนการเรียกคืน AWS ให้การเตือนล่วงหน้านานเท่าใดก่อนที่ Spot Instance จะถูกขัดจังหวะ?

A) ไม่มีการเตือน
B) การแจ้งการขัดจังหวะ 2 นาที
C) การแจ้งการขัดจังหวะ 15 นาที
D) rebalance window 24 ชั่วโมง

**ข้อ 58** *(Domain 4 — Task 4.1)*
คลังเก็บข้อมูลด้านสุขภาพจัดเก็บบันทึกการปฏิบัติตามข้อกำหนดใน Amazon S3 ที่เข้าถึงน้อยมาก แต่เมื่อถูกหมายเรียก ต้องดึงข้อมูลได้ภายใน 5 นาที บันทึกถูกเก็บไว้ 7 ปีและต้องลดต้นทุนพื้นที่จัดเก็บ คลาสพื้นที่จัดเก็บใดตอบสนองข้อกำหนดเหล่านี้?

A) S3 Glacier Deep Archive พร้อม Standard retrieval
B) S3 Glacier Flexible Retrieval พร้อม Expedited retrievals เมื่อจำเป็น
C) S3 Glacier Flexible Retrieval พร้อม Bulk retrievals
D) S3 Standard-IA

**ข้อ 59** *(Domain 4 — Task 4.1)*
สตาร์ทอัพแชร์ภาพถ่ายจัดเก็บภาพ thumbnail ที่สร้างใหม่ได้ง่ายซึ่งเข้าถึงไม่บ่อย ทีมต้องการตัวเลือก infrequent-access ที่ต้นทุนต่ำที่สุดและยอมรับว่าการสูญเสีย Availability Zone เดียวอาจต้องสร้าง thumbnails ใหม่จากต้นฉบับ ควรใช้คลาสพื้นที่จัดเก็บใด?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**ข้อ 60** *(Domain 4 — Task 4.1)*
บริษัทมี S3 bucket ที่มี objects หลายล้านตัวซึ่งรูปแบบการเข้าถึงไม่ทราบและเปลี่ยนแปลงคาดการณ์ไม่ได้ solutions architect กำลังประเมิน S3 Intelligent-Tiering ข้อความสองข้อใดเกี่ยวกับ Intelligent-Tiering ถูกต้อง? (เลือกสองข้อ)

A) คิดค่าธรรมเนียม monitoring และ automation ต่อ object เล็กน้อยสำหรับ objects ที่มันตรวจสอบ
B) คิดค่าธรรมเนียม retrieval ทุกครั้งที่ object ย้ายกลับไปยัง Frequent Access tier
C) Objects ที่เล็กกว่า 128 KB ไม่ถูกตรวจสอบหรือ auto-tier และถูกเรียกเก็บที่อัตรา Frequent Access tier
D) มันจำลอง objects ไปยัง region ที่สองโดยอัตโนมัติ
E) มันต้องการระยะเวลาจัดเก็บขั้นต่ำ 90 วันสำหรับทุก object

**ข้อ 61** *(Domain 4 — Task 4.1)*
ทีม analytics มัก abort large multipart uploads ไปยัง S3 data lake bucket บ่อยครั้ง และ AWS Cost Explorer แสดงค่าใช้จ่ายพื้นที่จัดเก็บที่เพิ่มขึ้นแม้ว่าจำนวน object ที่มองเห็นได้ของ bucket จะคงที่ การแก้ไขที่**คุ้มค่าที่สุด**คืออะไร?

A) เปิดใช้ S3 Versioning เพื่อติดตาม orphaned parts
B) เพิ่ม lifecycle rule ที่ abort incomplete multipart uploads หลังจำนวนวันที่กำหนด
C) ย้าย bucket ไปยัง S3 One Zone-IA
D) เปิดใช้ S3 Transfer Acceleration เพื่อให้การอัปโหลดเสร็จเร็วขึ้น

**ข้อ 62** *(Domain 4 — Task 4.1)*
EC2 fleet ของบริษัทใช้ gp2 EBS volumes หลายร้อยตัวที่ขนาดใหญ่เพียงเพื่อให้ได้ baseline IOPS การทบทวนการใช้งานแสดงว่า IOPS จำเป็นแต่ความจุส่วนใหญ่ไม่ใช้ solutions architect ควรทำอะไรเพื่อลดต้นทุนพื้นที่จัดเก็บโดยไม่สูญเสียประสิทธิภาพ?

A) ย้าย volumes ไปยัง io2 และจัดเตรียม IOPS เท่าเดิม
B) ย้าย volumes ไปยัง gp3, right-size ความจุ และจัดเตรียม IOPS อย่างอิสระ
C) แปลง volumes เป็น st1 throughput-optimized HDD
D) Snapshot volumes รายวันและลบต้นฉบับ

**ข้อ 63** *(Domain 4 — Task 4.4)*
data pipeline ใน private subnets ถ่ายโอน 60 TB ต่อเดือนจากอินสแตนซ์ EC2 ไปยัง Amazon S3 ในภูมิภาคเดียวกันผ่าน NAT gateway สร้างค่าใช้จ่ายการประมวลผลข้อมูลขนาดใหญ่ การเปลี่ยนแปลงที่**คุ้มค่าที่สุด**คืออะไร?

A) แทนที่ NAT gateway ด้วย NAT instance บนอินสแตนซ์ EC2 ขนาดใหญ่
B) สร้าง gateway VPC endpoint สำหรับ S3 และกำหนดเส้นทางทราฟฟิกผ่านมัน
C) สร้าง interface VPC endpoint (PrivateLink) สำหรับ S3
D) ย้ายอินสแตนซ์ EC2 ไปยัง public subnets ที่มี public IPv4 addresses

**ข้อ 64** *(Domain 4 — Task 4.4)*
บิลรายเดือนของสตาร์ทอัพแสดงค่าใช้จ่ายที่ไม่คาดคิดสำหรับ public IPv4 addresses ที่ใช้งานข้ามอินสแตนซ์ EC2 หลายสิบตัวที่เรียกเฉพาะบริการ AWS อื่นภายใน VPC ทีมการเงินยังต้องการการแจ้งเตือนก่อนที่การใช้จ่ายรวมของเดือนถัดไปจะเกิน threshold ชุดการกระทำใดที่ solutions architect ควรทำ? (เลือกสองข้อ)

A) แทนที่ public IPv4 ด้วย Elastic IPs บนแต่ละอินสแตนซ์ ซึ่งฟรีเสมอขณะที่แนบอยู่
B) ลบ public IPv4 addresses และใช้ private connectivity (VPC endpoints/NAT ตามต้องการ) เนื่องจาก AWS คิดค่าใช้จ่ายสำหรับ public IPv4 addresses ที่ใช้งาน
C) ใช้ AWS Compute Optimizer เพื่อบล็อกการใช้จ่ายที่เกิน threshold
D) เปิดใช้ AWS Shield Advanced เพื่อ cap การใช้จ่ายรายเดือน
E) สร้าง AWS Budgets cost budget พร้อม alert threshold และ email notification

**ข้อ 65** *(Domain 4 — Task 4.3)*
สภาพแวดล้อมการพัฒนาใช้ Amazon Aurora PostgreSQL cluster ที่ว่างในตอนกลางคืนและวันหยุดสุดสัปดาห์ แต่ต้องตื่นโดยอัตโนมัติเมื่อนักพัฒนาเชื่อมต่อ โดยไม่ต้องแทรกแซงด้วยมือหรือปรับขนาดอินสแตนซ์ ต้นทุนควรลดลงใกล้ศูนย์สำหรับ compute ขณะว่าง โซลูชันใดตอบสนองข้อกำหนดเหล่านี้?

A) Aurora Serverless v2 ที่กำหนดค่า minimum capacity เป็น 0 ACUs เพื่อให้หยุดชั่วคราวอัตโนมัติเมื่อว่าง
B) provisioned Aurora cluster ที่หยุดโดยฟังก์ชัน Lambda ตามตารางทุกคืน
C) Aurora global database ที่มี headless secondary cluster
D) provisioned Aurora ที่มี reader instances สองตัวที่ scale in ในตอนกลางคืน

---

## เฉลย

### ส่วนที่ 1 — ข้อ 1–20

**1. คำตอบ: B** — SCPs ไม่เคยมีผลกับ management account ขององค์กร ดังนั้น principals ของมันจึงไม่ได้รับผลกระทบจากข้อจำกัด Region *ทำไมไม่ใช่ข้ออื่น:* A — SCPs สืบทอดผ่าน OUs แบบซ้อน; C — IAM Allows ไม่สามารถแทนที่ SCP Deny ใน member accounts; D — SCPs มีผลทันทีกับ accounts ปัจจุบันและในอนาคตทั้งหมดภายใต้จุดที่แนบ

**2. คำตอบ: C** — permissions boundary ที่บังคับใช้เป็น condition บนการกระทำการสร้าง role จำกัดสิทธิ์สูงสุดของ role ใดก็ตามที่นักพัฒนาสร้าง ป้องกัน privilege escalation ขณะคงการ self-service *ทำไมไม่ใช่ข้ออื่น:* A — การตรวจสอบด้วยมือเพิ่มภาระการดำเนินงานและขจัด self-service; B — การปฏิเสธ iam:CreateRole บล็อก workflow ที่ถูกต้อง; D — การแจ้งเตือน CloudTrail เป็นการตรวจจับ ไม่ใช่การป้องกัน

**3. คำตอบ: B** — ExternalId ที่ลูกค้ากำหนดและตรวจสอบใน condition ของ trust policy รับประกันว่าผู้ให้บริการ SaaS assume role ในนามของลูกค้าที่ถูกต้องเท่านั้น บรรเทาปัญหา confused deputy *ทำไมไม่ใช่ข้ออื่น:* A — MFA ไม่เหมาะสำหรับการ assume แบบ service-to-service อัตโนมัติและไม่จัดการความสับสนของ deputy; C — การเข้ารหัส ARN (ซึ่งไม่ใช่ความลับ) ไม่แก้ปัญหาอะไร; D — keys ของ IAM user แบบ long-lived ปลอดภัยน้อยกว่า roles

**4. คำตอบ: B** — IAM Identity Center federate ครั้งเดียวกับ Entra ID และกำหนด permission sets แบบรวมศูนย์ข้าม organization accounts ทั้งหมดผ่าน access portal เดียว *ทำไมไม่ใช่ข้ออื่น:* A — IAM users ต่อ account คือภาระที่ต้องหลีกเลี่ยงพอดี; C — Cognito สำหรับ identities ของแอปพลิเคชัน (ลูกค้า) ไม่ใช่การเข้าถึง workforce ไปยัง AWS accounts; D — การตั้งค่า SAML ต่อ account ด้วยมือใช้ได้แต่มีภาระการดำเนินงานสูงกว่ามาก

**5. คำตอบ: A** — User pools จัดการการตรวจสอบสิทธิ์ (email/social sign-in); identity pools แลกเปลี่ยน tokens ที่ได้เป็นข้อมูลรับรอง AWS ชั่วคราวที่กำหนดขอบเขตโดย IAM roles เพื่อเข้าถึง S3 *ทำไมไม่ใช่ข้ออื่น:* B — สลับวัตถุประสงค์ของบริการทั้งสอง; C — IAM Identity Center สำหรับ workforce users ไม่ใช่ลูกค้าแอป; D — tokens ของ user pool (JWTs) ไม่ให้การเข้าถึงบริการ AWS ด้วยตัวเอง

**6. คำตอบ: B** — customer managed key ให้การควบคุม key policy การบันทึกการใช้งาน และการปิดใช้อย่างเต็มที่ และรองรับการหมุนเวียนอัตโนมัติ (รายปีโดยค่าเริ่มต้น) *ทำไมไม่ใช่ข้ออื่น:* A — AWS managed keys ไม่ให้คุณแก้ไข key policy หรือปิดใช้กุญแจ; C — AWS owned keys มองไม่เห็นต่อลูกค้าโดยสิ้นเชิง; D — imported (BYOK) key material ไม่รองรับการหมุนเวียนอัตโนมัติ

**7. คำตอบ: B** — Envelope encryption: KMS สร้าง data key; ข้อมูลเข้ารหัสในเครื่องด้วย plaintext data key ซึ่งถูกทิ้ง ขณะที่สำเนาของ data key ที่เข้ารหัสด้วย KMS ถูกจัดเก็บกับ ciphertext *ทำไมไม่ใช่ข้ออื่น:* A และ C — KMS ไม่เคยเข้ารหัส payloads ขนาดใหญ่โดยตรงหรือผ่านการสตรีม; D — hard-coded keys เป็น anti-pattern และไม่ใช่ envelope encryption

**8. คำตอบ: C** — กลยุทธ์ alternating-users ของ Secrets Manager คงข้อมูลรับรองสองชุดและหมุนเวียนสลับกัน ดังนั้นการเชื่อมต่อที่มีอยู่ซึ่งใช้ข้อมูลรับรองเดิมยังคงทำงานระหว่างการหมุนเวียน *ทำไมไม่ใช่ข้ออื่น:* A — Parameter Store ไม่มีการหมุนเวียนในตัว; คุณต้องสร้างเองทั้งหมด; B — single-user rotation ทำให้รหัสผ่านเก่าใช้ไม่ได้ทันที เสี่ยงต่อความล้มเหลวของการเชื่อมต่อ; D — KMS rotation หมุนเวียน key material การเข้ารหัส ไม่ใช่รหัสผ่านฐานข้อมูล

**9. คำตอบ: C** — SSE-C ให้ลูกค้าจัดหากุญแจเข้ารหัสในทุก request; AWS ใช้มันในหน่วยความจำสำหรับการดำเนินการและไม่เคยจัดเก็บ *ทำไมไม่ใช่ข้ออื่น:* A — กุญแจ SSE-S3 จัดการโดย AWS ทั้งหมด; B — กุญแจ SSE-KMS ถูกจัดเก็บใน AWS KMS; D — aws/s3 เป็น AWS-managed KMS key และไม่ใช่ client-side เลย

**10. คำตอบ: B** — Object Lock โหมด compliance ป้องกันการลบหรือเขียนทับโดยผู้ใช้ใด รวมถึง root จนกว่าการเก็บรักษาจะหมดอายุ และ Object Lock ต้องการ versioning *ทำไมไม่ใช่ข้ออื่น:* A — โหมด governance สามารถถูกข้ามโดยผู้ใช้ที่มี s3:BypassGovernanceRetention; C — bucket policy สามารถถูกแก้ไขหรือลบโดย root user; D — lifecycle expiration ไม่ป้องกันการลบในช่วงระยะเวลา

**11. คำตอบ: B** — NACLs เป็น stateless ดังนั้นทราฟฟิกตอบกลับไปยัง ephemeral source ports ของไคลเอนต์ต้องถูกอนุญาต outbound อย่าง explicit *ทำไมไม่ใช่ข้ออื่น:* A — NACLs เป็น stateless ไม่ใช่ stateful; C — security groups เป็น stateful ดังนั้นทราฟฟิกตอบกลับเป็นอัตโนมัติ; D — 0.0.0.0/0 ใช้ได้สมบูรณ์ในกฎ NACL

**12. คำตอบ: A, B** — Security groups เป็น stateful (ทราฟฟิกตอบกลับถูกอนุญาตอัตโนมัติ) และ NACLs ประมวลผลกฎที่มีหมายเลขตามลำดับและรองรับ Deny *ทำไมไม่ใช่ข้ออื่น:* C — security groups รองรับเฉพาะกฎ Allow; D — NACLs แนบกับ subnets ไม่ใช่ ENIs (security groups แนบกับ ENIs); E — กฎของ security group ถูกประเมินร่วมกันทั้งหมดโดยไม่มีลำดับ

**13. คำตอบ: B** — Shield Advanced ให้ Shield Response Team การป้องกันต้นทุน DDoS และการมองเห็น/วินิจฉัยการโจมตีสำหรับทรัพยากรที่ได้รับการป้องกัน เช่น CloudFront และ ALB *ทำไมไม่ใช่ข้ออื่น:* A — Shield Standard เป็นอัตโนมัติแต่ไม่รวมการเข้าถึง SRT หรือการป้องกันต้นทุน; C — WAF จัดการรูปแบบ request layer-7 ไม่ใช่ชุดข้อกำหนดทั้งหมด; D — GuardDuty เป็นการตรวจจับภัยคุกคาม ไม่ใช่การป้องกัน DDoS

**14. คำตอบ: B** — AWS WAF บน ALB ด้วย SQLi managed rule group บวก rate-based rule บล็อกรูปแบบการโจมตีทั้งสองโดยไม่เปลี่ยนโค้ดแอปพลิเคชัน *ทำไมไม่ใช่ข้ออื่น:* A — ความพยายามในการพัฒนาสูง; C — Shield Standard ครอบคลุม L3/L4 floods ไม่ใช่ SQL injection; D — security groups ตรวจสอบเนื้อหา request ไม่ได้

**15. คำตอบ: B** — GuardDuty = การตรวจจับภัยคุกคามจาก logs และ threat intel; Macie = การค้นพบข้อมูลที่ละเอียดอ่อน (PII) ใน S3; Inspector = การสแกนช่องโหว่ (CVE) ของ EC2, ECR images และ Lambda *ทำไมไม่ใช่ข้ออื่น:* A, C, D — แต่ละข้อสลับการจับคู่บริการกับวัตถุประสงค์อย่างน้อยสองรายการ

**16. คำตอบ: B** — Gateway endpoints มีอยู่สำหรับ S3 และ DynamoDB พอดี คงทราฟฟิกไว้บนเครือข่าย AWS และไม่มีค่าใช้จ่ายรายชั่วโมงหรือการประมวลผลข้อมูล *ทำไมไม่ใช่ข้ออื่น:* A — NAT gateway กำหนดเส้นทางผ่าน public IP space และคิดราคาต่อชั่วโมง/ต่อ GB; C — interface endpoints มีค่าใช้จ่ายรายชั่วโมงและข้อมูล จึงไม่ใช่ต้นทุนต่ำที่สุด; D — internet gateway ส่งทราฟฟิกผ่านอินเทอร์เน็ตสาธารณะ

**17. คำตอบ: A** — IMDSv2 ต้องการ session token ที่ได้มาผ่าน PUT request ซึ่ง SSRF vectors ทั่วไปทำไม่ได้; การบังคับใช้ HttpTokens=required บล็อกการขโมยข้อมูลรับรอง IMDSv1 *ทำไมไม่ใช่ข้ออื่น:* B — agents และ SDKs จำนวนมากจำเป็นต้องใช้ IMDS อย่างถูกต้อง; C — NACLs ไม่มีผลต่อ link-local traffic ระหว่างอินสแตนซ์กับ metadata endpoint ของมันเอง; D — static credentials ในไฟล์แย่กว่า role credentials มาก

**18. คำตอบ: C** — Standard Parameter Store parameters ฟรีและเหมาะสำหรับ plaintext config; Secrets Manager เพิ่มการหมุนเวียนในตัวสำหรับรหัสผ่าน 5 รายการเท่านั้น ลดต้นทุน *ทำไมไม่ใช่ข้ออื่น:* A — การจ่ายราคาต่อ secret ของ Secrets Manager สำหรับค่า config 200 ค่าสิ้นเปลือง; B — Parameter Store เพียงอย่างเดียวไม่มีการหมุนเวียน native สำหรับรหัสผ่าน; D — Parameter Store ไม่มีการหมุนเวียนอัตโนมัติในตัว ดังนั้นตัวเลือกนี้ระบุความสามารถที่ไม่มีอยู่

**19. คำตอบ: B** — S3 Bucket Keys ให้ S3 สร้าง bucket-level data key ที่จำกัดเวลาจาก KMS key ลดการ KMS requests ต่อ object (และต้นทุน) อย่างมากขณะยังคงเป็น SSE-KMS *ทำไมไม่ใช่ข้ออื่น:* A — SSE-S3 ละทิ้งข้อกำหนด KMS; C — ความถี่การหมุนเวียนไม่มีผลต่อปริมาณ API ต่อ request; D — imported key material ไม่เปลี่ยนจำนวน request

**20. คำตอบ: B, D** — explicit Deny ชนะ Allow ใดเสมอในการประเมิน policy และ permissions boundaries เพียง cap (ไม่ให้สิทธิ์) สิทธิ์ *ทำไมไม่ใช่ข้ออื่น:* A — SCPs เป็น guardrails ที่จำกัดสิทธิ์ที่มีอยู่ ไม่ให้สิทธิ์ใด; C — resource-based policies ให้การเข้าถึงข้าม account ด้วยตัวเองเป็นประจำ; E — IAM ใช้ implicit deny โดยค่าเริ่มต้นเมื่อไม่มีอะไรอนุญาตการกระทำ

### ส่วนที่ 2 — ข้อ 21–37

**21. คำตอบ: C** — Multi-AZ ให้เฟลโอเวอร์อัตโนมัติสำหรับความล้มเหลวของ AZ; read replicas รับทราฟฟิกการอ่านสำหรับ reporting — สองคุณลักษณะสำหรับสองปัญหาที่แตกต่างกัน *ทำไมไม่ใช่ข้ออื่น:* A — Multi-AZ standby แบบดั้งเดิมให้บริการการอ่านไม่ได้; B — การ promote replica เป็นแบบ manual (หรือ scripted) และ replicas เพียงอย่างเดียวไม่ให้ HA failover อัตโนมัติ; D — อินสแตนซ์ single-AZ ที่ใหญ่กว่าล้มเหลวทั้งสองข้อกำหนดในด้าน AZ resilience

**22. คำตอบ: B** — Multi-AZ DB cluster deployment รัน writer หนึ่งตัวและ readable standbys สองตัวข้าม AZ สามตัว พร้อม reader endpoint ดังนั้นความจุ standby ให้บริการการอ่านขณะยังรองรับเฟลโอเวอร์อัตโนมัติที่รวดเร็ว *ทำไมไม่ใช่ข้ออื่น:* A — standby เดียวใน instance deployment ไม่ให้บริการทราฟฟิก; C — read replicas ไม่ให้เฟลโอเวอร์อัตโนมัติที่จัดการและฐานข้อมูล RDS ไม่ load-balance ผ่าน ALB; D — Single-AZ ไม่มีเฟลโอเวอร์เลย

**23. คำตอบ: B** — การจำลองของ Aurora Global Database เป็นแบบอะซิงโครนัสที่เลเยอร์พื้นที่จัดเก็บโดยมี lag ต่ำกว่าวินาทีโดยทั่วไป ดังนั้น cross-Region RPO ใกล้ศูนย์แต่ไม่เคยรับประกันเป็น 0 พอดี *ทำไมไม่ใช่ข้ออื่น:* A — การจำลองไม่ใช่แบบซิงโครนัสข้าม Regions; C — write forwarding กำหนดเส้นทาง writes ไปยัง primary; ไม่เปลี่ยนความหมายของการจำลอง; D — replication lag โดยทั่วไปต่ำกว่าหนึ่งวินาที ไม่ใช่ตาราง 5 นาที

**24. คำตอบ: B** — Recovery Time Objective คือ downtime สูงสุดที่ยอมรับได้ (4 ชั่วโมง); Recovery Point Objective คือช่วงการสูญเสียข้อมูลสูงสุดที่ยอมรับได้ (15 นาที) *ทำไมไม่ใช่ข้ออื่น:* A — สลับคำจำกัดความ; C — MTBF/MTTR เป็นสถิติความน่าเชื่อถือ ไม่ใช่ DR objectives; D — SLA เป็นความผูกพันตามสัญญา ไม่ใช่ metric การสูญเสียข้อมูล

**25. คำตอบ: B** — Pilot light คงข้อมูลจำลองอย่างต่อเนื่องและทรัพยากรหลักจัดเตรียมไว้แต่ปิดอยู่ ให้ RTO ระดับหลายสิบนาทีที่ต้นทุนต่ำ — ตรงกันพอดี *ทำไมไม่ใช่ข้ออื่น:* A — backup and restore ไม่มีการจำลอง live และ RTO ยาวกว่ามาก; C — warm standby คง stack ทำงานอยู่ ต้นทุนมากกว่าที่ต้องการ; D — active/active แพงที่สุดและเกินข้อกำหนดมาก

**26. คำตอบ: C, E** — Warm standby เป็นสำเนาเต็มที่ลดขนาดและทำงานอยู่เสมอ; multi-site active/active ให้บริการจากหลาย Regions โดยมี RTO ใกล้ศูนย์ที่ต้นทุนสูงที่สุด *ทำไมไม่ใช่ข้ออื่น:* A — backup and restore ถูกนิยามด้วยการไม่ pre-run ทรัพยากร; B — backup and restore มี RTO สูงที่สุด (แย่ที่สุด); D — pilot light จัดเตรียมไว้แต่ปิด ไม่ใช่ full capacity ที่ให้บริการทราฟฟิก

**27. คำตอบ: B** — เมื่อ visibility timeout 30 วินาทีหมดลงกลางการประมวลผล ข้อความปรากฏอีกครั้งและ consumer อื่นประมวลผลซ้ำ; ตั้ง visibility timeout ให้นานกว่าเวลาการประมวลผลสูงสุด (เช่น 6 เท่าเป็น best practice) *ทำไมไม่ใช่ข้ออื่น:* A — FIFO กับ standard ไม่ใช่สาเหตุ; C — long polling มีผลต่อประสิทธิภาพ empty-receive ไม่ใช่การซ้ำ; D — ระยะเวลาการเก็บกำหนดว่าข้อความคงอยู่นานเท่าใด ไม่ใช่การส่งซ้ำ

**28. คำตอบ: A** — redrive policy ที่มี maxReceiveCount ย้ายข้อความที่ล้มเหลวซ้ำๆ ("poison pill") ไปยัง dead-letter queue เพื่อการวิเคราะห์แบบ offline หยุดวงจรการลองใหม่ไม่สิ้นสุด *ทำไมไม่ใช่ข้ออื่น:* B — visibility timeout ที่สั้นกว่าทำให้วงจรหมุนเร็วขึ้น; C — FIFO ไม่ทิ้งข้อความที่ผิดรูปแบบ; D — การเก็บ 1 นาทีจะทำให้ข้อความที่ถูกต้องหมดอายุด้วย

**29. คำตอบ: B** — FIFO queues รับประกันการประมวลผล exactly-once และลำดับที่เข้มงวดภายใน MessageGroupId; การใช้ account ID เป็น group ID ให้ลำดับต่อ account พร้อมการขนานข้าม account (และโหมด high-throughput FIFO สามารถปรับขนาดได้มากขึ้น) *ทำไมไม่ใช่ข้ออื่น:* A — standard queues ไม่สามารถรับประกันลำดับหรือ exactly-once; C — SNS ไม่ให้การรับประกันลำดับหรือ exactly-once สำหรับรูปแบบนี้; D — group ID เดียวทำให้ทุกอย่างเป็นลำดับ ทำลาย throughput

**30. คำตอบ: B** — SNS-to-SQS fan-out ส่งทุกเหตุการณ์ไปยังแต่ละคิว ที่ซึ่งแต่ละ consumer ได้รับการบัฟเฟอร์ที่ทนทานและจังหวะการประมวลผลที่อิสระ *ทำไมไม่ใช่ข้ออื่น:* A — consumers สามตัวบนคิวเดียวแบ่งข้อความ; แต่ละข้อความไปยัง consumer เดียวเท่านั้น; C — การเรียกตามลำดับไม่ใช่การประมวลผลขนานอิสระพร้อมการบัฟเฟอร์; D — email subscriptions ส่งให้มนุษย์ ไม่ใช่บัฟเฟอร์แอปพลิเคชันที่ทนทาน

**31. คำตอบ: B** — Reserved concurrency แบ่ง concurrency เฉพาะให้ฟังก์ชันที่สำคัญ (และการ cap ฟังก์ชัน sale จำกัด blast radius ของมัน) ป้องกันไม่ให้ฟังก์ชันหนึ่งทำให้ shared account pool หมด *ทำไมไม่ใช่ข้ออื่น:* A — timeout ที่ยาวกว่าถือ concurrency slots นานขึ้น ทำให้ throttling แย่ลง; C — provisioned concurrency อุ่นสภาพแวดล้อมล่วงหน้าแต่ไม่เพิ่มโควต้า concurrency ของ account; D — ขนาดหน่วยความจำไม่มีผลต่อขีดจำกัด concurrency

**32. คำตอบ: B** — Standard workflows รันได้นานถึงหนึ่งปีและ callback pattern แบบ waitForTaskToken หยุดการดำเนินการโดยไม่มีต้นทุน compute จนกว่า SendTaskSuccess/SendTaskFailure จะคืน token *ทำไมไม่ใช่ข้ออื่น:* A — Express workflows สูงสุด 5 นาที; C — Lambda รันได้สูงสุด 15 นาทีและการ sleep สิ้นเปลืองเงิน; D — EventBridge schedules ทริกเกอร์เหตุการณ์ได้แต่หยุดและทำต่อสถานะ workflow ไม่ได้

**33. คำตอบ: A** — Express workflows สร้างมาสำหรับการดำเนินการอัตราสูงมาก ระยะสั้น at-least-once ที่ต้นทุนต่ำกว่า; Standard workflows ให้ความหมาย exactly-once ระยะเวลาถึงหนึ่งปี และประวัติการดำเนินการเต็มรูปแบบสำหรับงานการกระทบยอด *ทำไมไม่ใช่ข้ออื่น:* B — Standard ไม่สามารถรองรับ 90,000 starts/วินาทีอย่างประหยัดสำหรับ use case นี้; C — Express สูงสุด 5 นาทีและเป็น at-least-once ล้มเหลวงาน 12 ชั่วโมง exactly-once; D — การมอบหมายที่สลับล้มเหลวทั้งสอง workloads

**34. คำตอบ: B** — Failover routing ส่งทราฟฟิกทั้งหมดไปยัง primary ขณะที่ health check ผ่าน จากนั้นตอบด้วย secondary record โดยอัตโนมัติเมื่อล้มเหลว *ทำไมไม่ใช่ข้ออื่น:* A — weighted 50/50 ส่งครึ่งหนึ่งของทราฟฟิกไปยังสำเนา passive ตลอดเวลา; C — latency-based routing แบ่งทราฟฟิกตามประสิทธิภาพ ไม่ใช่เจตนา active/passive; D — geolocation กำหนดเส้นทางตามตำแหน่งผู้ใช้ ไม่เกี่ยวกับ failover ที่อิงสุขภาพ endpoint

**35. คำตอบ: B** — การเพิ่มประเภท ELB health check ทำให้ ASG ถือว่าความล้มเหลว ALB target-health เป็นไม่สมบูรณ์ ดังนั้นอินสแตนซ์ที่แอปขัดข้องถูกยุติและแทนที่แม้ EC2 status checks จะผ่าน *ทำไมไม่ใช่ข้ออื่น:* A — detailed monitoring เปลี่ยนเฉพาะความละเอียดของ metric; C — grace period หน่วงการประเมินสุขภาพ ตรงข้ามกับที่ต้องการ; D — ประเภท load balancer ไม่ใช่ปัญหา

**36. คำตอบ: B** — Network Load Balancer ทำงานที่ layer 4 (TCP/UDP) จัดการหลายล้าน requests ต่อวินาทีด้วย latency ต่ำมาก และรองรับ static (หรือ Elastic) IP ต่อ AZ *ทำไมไม่ใช่ข้ออื่น:* A — ALB เป็น layer 7 (HTTP/HTTPS) และไม่ให้ static IPs โดย native; C — Gateway Load Balancer สำหรับการ deploy inline virtual appliances; D — Classic Load Balancer เป็น legacy และไม่ตอบสนองข้อกำหนดทั้งสอง

**37. คำตอบ: B, C** — CRR ต้องการ versioning ที่เปิดใช้บนทั้งสอง buckets และคลาส EFS Standard เป็นระบบไฟล์ระดับภูมิภาค (multi-AZ) ที่ mount พร้อมกันข้าม AZ ได้ *ทำไมไม่ใช่ข้ออื่น:* A — CRR จำลองเฉพาะ objects ใหม่หลังการกำหนดค่า เว้นแต่คุณรัน S3 Batch Replication สำหรับ objects ที่มีอยู่; D — EFS รองรับ NFS clients พร้อมกันหลายพันตัว ต่างจาก single-attach EBS; E — versioning เป็นข้อกำหนดเบื้องต้นสำหรับการจำลองแต่ไม่จำลองอะไรด้วยตัวเอง

### ส่วนที่ 3 — ข้อ 38–53

**38. คำตอบ: B** — io2 Block Express ให้ IOPS สูงถึง 256,000 latency ต่ำกว่ามิลลิวินาที และความทนทาน 99.999% ตอบสนองข้อกำหนดทั้งสาม *ทำไมไม่ใช่ข้ออื่น:* A — gp3 ตอนนี้สามารถถึงตัวเลข IOPS ได้ (cap ถูกเพิ่มเป็น 80,000 ในปลายปี 2025) แต่ล้มเหลวอีกสองข้อกำหนด: ความทนทานคือ 99.8–99.9% (คำถามต้องการ 99.999%) และ latency คือ single-digit milliseconds ไม่ใช่ต่ำกว่ามิลลิวินาทีที่รับประกัน; B เป็นประเภทเดียวที่ตอบสนองทั้งสาม; C — st1 อิง HDD และไม่เหมาะกับฐานข้อมูลที่ใช้ IOPS เข้มข้น; D — gp2 สูงสุด 16,000 IOPS และการ burst ไม่ใช่การรับประกันที่ยั่งยืน

**39. คำตอบ: C** — FSx for Lustre สร้างมาเพื่อ HPC โดยเฉพาะ ด้วย latency ต่ำกว่ามิลลิวินาที throughput หลายร้อย GB/s และการรวม S3 native (lazy-loading และ exporting) *ทำไมไม่ใช่ข้ออื่น:* A — EFS ไม่สามารถเทียบโปรไฟล์ throughput/latency ของ Lustre สำหรับ HPC; B — FSx for Windows เน้น workloads SMB/Windows ไม่ใช่ Linux HPC; D — Mountpoint for S3 ไม่ให้ semantics ระบบไฟล์ POSIX ที่ใช้ร่วมกันหรือ latency ที่ต้องการ

**40. คำตอบ: B** — FSx for Windows File Server รองรับ SMB การรวม Active Directory และ NTFS ACLs โดย native และโหมด Multi-AZ ครอบคลุมข้อกำหนดสอง AZ *ทำไมไม่ใช่ข้ออื่น:* A — EFS เป็น NFS/POSIX และไม่คงสิทธิ์ NTFS; C — S3 เป็น object storage ไม่ใช่ SMB file share; D — Lustre เป็นระบบไฟล์ Linux HPC ที่ไม่รองรับ SMB/AD

**41. คำตอบ: D, E** — Transfer Acceleration กำหนดเส้นทางการอัปโหลดผ่านเครือข่าย edge/backbone ของ AWS เพื่อเร่งการถ่ายโอนทางไกล และ multipart upload ทำการถ่ายโอนแบบขนานและให้ parts ที่ล้มเหลวลองใหม่ได้โดยไม่เริ่มไฟล์ 40 GB ทั้งหมดใหม่ *ทำไมไม่ใช่ข้ออื่น:* A — One Zone-IA เปลี่ยนความซ้ำซ้อน ไม่ใช่ประสิทธิภาพการอัปโหลด; B — คุณวาง ALB หน้า S3 สำหรับการอัปโหลดไม่ได้; C — CRR จำลองหลังการอัปโหลดและไม่ช่วยการ ingest

**42. คำตอบ: B** — Instance store NVMe SSDs แนบกับ host ทางกายภาพ ให้ latency ต่ำที่สุดสำหรับข้อมูลชั่วคราวที่สร้างใหม่ได้ *ทำไมไม่ใช่ข้ออื่น:* A และ D — EBS ผ่านเครือข่ายและเพิ่ม latency; C — EFS เป็น network file system ที่มี latency สูงกว่าทั้งคู่

**43. คำตอบ: B** — Throttling บน hot partitions โดยมีการใช้งานโดยรวมต่ำเป็นปัญหา partition key cardinality ต่ำแบบคลาสสิก; key ที่มี cardinality สูง (เช่น game_id#player_id) กระจายทราฟฟิกอย่างสม่ำเสมอ *ทำไมไม่ใช่ข้ออื่น:* A — การเปลี่ยนโหมดความจุไม่แก้ hot partitions; C — LSI ใช้ partition key เดียวกันและ hot partitions เดียวกัน; D — Streams จับการเปลี่ยนแปลง ไม่กระจาย writes ใหม่

**44. คำตอบ: B** — DAX เป็น in-memory cache ที่เข้ากันได้กับ DynamoDB และโปร่งใสต่อ API ให้การอ่านระดับไมโครวินาทีโดยเปลี่ยนโค้ดน้อยที่สุด *ทำไมไม่ใช่ข้ออื่น:* A — ElastiCache ต้องเขียนแอปพลิเคชันใหม่เพื่อจัดการ cache; C — GSI ไม่ cache hot items หรือให้ latency ระดับไมโครวินาที; D — Global Tables จัดการการเข้าถึง multi-region ไม่ใช่ latency การอ่าน single-item

**45. คำตอบ: B** — GSI สามารถเพิ่มเข้าตารางที่มีอยู่ได้ตลอดเวลา รองรับ partition/sort key combination ใหม่ และมี provisioned throughput ของตัวเองที่แยกจาก base table *ทำไมไม่ใช่ข้ออื่น:* A — LSIs สร้างได้เฉพาะตอนสร้างตาราง ใช้ partition key ของตารางร่วมกัน และใช้ throughput ของตารางร่วมกัน; C — การสร้างตารางใหม่รบกวนและไม่จำเป็น; D — Streams สำหรับการจับการเปลี่ยนแปลง ไม่ใช่ ad hoc queries

**46. คำตอบ: B** — DynamoDB TTL ลบ items ที่หมดอายุโดยอัตโนมัติในเบื้องหลังโดยไม่มีค่าใช้จ่ายเพิ่มเติม *ทำไมไม่ใช่ข้ออื่น:* A — scheduled scans บริโภค read/write capacity และเสียเงิน; C — lifecycle policies เป็นแนวคิด S3/EFS ไม่ใช่ DynamoDB; D — Streams filter เหตุการณ์ downstream แต่ไม่ลบ items จากตาราง

**47. คำตอบ: B** — RDS Proxy pool และ multiplex การเชื่อมต่อ ให้การเรียก Lambda พร้อมกันหลายพันครั้งใช้ชุดการเชื่อมต่อฐานข้อมูลเล็กๆ ร่วมกันโดยเปลี่ยนแค่ connection-string *ทำไมไม่ใช่ข้ออื่น:* A — การ upsize แพงและเพียงเลื่อนขีดจำกัด; C — การย้ายฐานข้อมูลเป็นการเปลี่ยนแอปพลิเคชันครั้งใหญ่; D — การ throttle Lambda เป็น 10 ทำลาย throughput แทนที่จะแก้การจัดการการเชื่อมต่อ

**48. คำตอบ: A** — Aurora Replicas (สูงสุด 15) หลัง reader endpoint พร้อม replica auto scaling offload ทราฟฟิกการอ่านโดยใช้งานดำเนินงานน้อยที่สุด *ทำไมไม่ใช่ข้ออื่น:* B — Aurora ไม่ใช้โมเดล passive standby; standbys ในความหมาย RDS แบบคลาสสิกไม่ให้บริการทราฟฟิก; C — sharding มีภาระการดำเนินงานสูงสำหรับปัญหาการปรับขนาดการอ่าน; D — Backtrack กรอฐานข้อมูลย้อนเวลา ไม่ให้บริการการอ่าน

**49. คำตอบ: B** — Global Accelerator ให้ static anycast IPs สองตัว รองรับ UDP อยู่หน้า NLBs ในหลาย regions และเฟลโอเวอร์ในไม่กี่วินาทีผ่าน AWS backbone *ทำไมไม่ใช่ข้ออื่น:* A — CloudFront ให้บริการเนื้อหา HTTP/HTTPS ไม่ใช่ UDP ใดๆ และไม่มี static client-facing IPs; C — Route 53 latency routing พึ่งพา DNS TTLs สำหรับ failover และไม่ให้ static IPs; D — ALB เป็น regional และ HTTP-only

**50. คำตอบ: B** — Geolocation routing ตอบ DNS queries ตามประเทศของผู้ใช้ บังคับ Germany→eu-central-1 และ France→eu-west-3 อย่างแน่นอนสำหรับการปฏิบัติตามข้อกำหนดการอนุญาต *ทำไมไม่ใช่ข้ออื่น:* A — latency routing เลือก endpoint ที่เร็วที่สุด ซึ่งอาจละเมิดกฎการอนุญาต; C — geoproximity bias เลื่อนขอบเขตตามระยะทางแต่ไม่รับประกันการจับคู่ประเทศที่เข้มงวด; D — weighted routing กระจายแบบสุ่มตามน้ำหนัก ไม่สนใจตำแหน่ง

**51. คำตอบ: C** — cluster placement group รวมอินสแตนซ์ไว้ใกล้กันใน AZ เดียวเพื่อ latency ต่ำที่สุดและ packets-per-second สูงสุด เหมาะสำหรับ workloads MPI ที่ tightly coupled *ทำไมไม่ใช่ข้ออื่น:* A — spread groups แยกอินสแตนซ์ไปยังฮาร์ดแวร์ต่างกัน เพิ่ม latency และ cap ที่ 7 ต่อ AZ; B — partition groups แยก fault domains สำหรับระบบข้อมูลแบบกระจาย ไม่ใช่ MPI latency ต่ำ; D — subnets แยกกันไม่ทำให้อินสแตนซ์อยู่ร่วมกัน

**52. คำตอบ: B** — Amazon Data Firehose จัดการอย่างเต็มรูปแบบ ไม่ต้องการ consumers หรือการจัดการ shard บัฟเฟอร์ records และสามารถแปลง JSON เป็น Parquet ก่อนส่งไปยัง S3 *ทำไมไม่ใช่ข้ออื่น:* A — Kinesis Data Streams ต้องเขียน/จัดการ consumers; C — SQS บวก EC2 pollers เป็นโครงสร้างพื้นฐานที่กำหนดเองที่ต้องสร้างและรัน; D — MSK ต้องจัดการ Kafka clusters และ connectors

**53. คำตอบ: B** — Glue crawlers อนุมาน schema เข้าสู่ Data Catalog และ Athena รัน serverless SQL กับไฟล์ S3 โดยตรง *ทำไมไม่ใช่ข้ออื่น:* A — Redshift ต้องการการจัดเตรียม cluster และการโหลดข้อมูล; C — EMR หมายถึงการจัดการ cluster ที่ทำงานนาน; D — RDS ต้องการการโหลดข้อมูลเข้า database server

### ส่วนที่ 4 — ข้อ 54–65

**54. คำตอบ: C** — งาน batch ที่ checkpoint และเริ่มใหม่ได้เป็น Spot workload ในอุดมคติ และ Spot Fleet ที่กระจายข้ามประเภทอินสแตนซ์/AZs ลดผลกระทบจากการขัดจังหวะที่ประหยัดสูงถึง ~90% *ทำไมไม่ใช่ข้ออื่น:* A — On-Demand ละทิ้งส่วนลดโดยไม่มีประโยชน์ที่นี่; B และ D — ความผูกพันให้ส่วนลดน้อยกว่า Spot และล็อกการใช้จ่ายสำหรับงานที่เป็นมิตรกับการขัดจังหวะ

**55. คำตอบ: C** — Compute Savings Plans ใช้โดยอัตโนมัติข้าม EC2 (ตระกูล/region ใดก็ได้) Fargate และ Lambda เข้ากับเส้นทางการทันสมัย *ทำไมไม่ใช่ข้ออื่น:* A — EC2 Instance Savings Plans ล็อกกับตระกูลอินสแตนซ์ใน region และไม่รวม Fargate/Lambda; B และ D — Reserved Instances ครอบคลุม EC2 เท่านั้นและไม่ใช้กับ Fargate หรือ Lambda

**56. คำตอบ: B** — เฉพาะ EC2 Standard Reserved Instances ที่สามารถลงใน Reserved Instance Marketplace; RDS (และบริการอื่น) RIs ขายต่อไม่ได้ *ทำไมไม่ใช่ข้ออื่น:* A และ C — RDS RIs ไม่มีสิทธิ์ใน marketplace; D — EC2 Standard RIs ขายได้จริงใน marketplace

**57. คำตอบ: B** — AWS ส่งการแจ้งการขัดจังหวะ Spot สองนาทีก่อนเรียกคืนอินสแตนซ์ ให้เวลา drain และ checkpoint *ทำไมไม่ใช่ข้ออื่น:* A — มีการเตือน; C และ D — 15 นาทีและ 24 ชั่วโมงไม่ใช่ Spot interruption windows (rebalance recommendations อาจมาถึงเร็วกว่าแต่ไม่ใช่ window คงที่ที่รับประกัน)

**58. คำตอบ: B** — Glacier Flexible Retrieval ให้ต้นทุนพื้นที่จัดเก็บแบบ archival ต่ำและ Expedited retrievals ที่คืนข้อมูลใน 1–5 นาที (ประมาณ $0.03/GB) ตอบสนองข้อกำหนด 5 นาที *ทำไมไม่ใช่ข้ออื่น:* A — การดึงที่เร็วที่สุดของ Deep Archive คือ ~12 ชั่วโมง; C — Bulk retrievals ใช้เวลา 5–12 ชั่วโมง; D — Standard-IA ดึงได้ทันทีแต่แพงกว่ามากสำหรับพื้นที่จัดเก็บ 7 ปีที่เข้าถึงน้อยมาก

**59. คำตอบ: B** — One Zone-IA ราคาถูกกว่า Standard-IA ~20% และการแลก single-AZ durability ยอมรับได้สำหรับ thumbnails ที่สร้างใหม่ได้ *ทำไมไม่ใช่ข้ออื่น:* A — Standard-IA แพงกว่าสำหรับความซ้ำซ้อนที่ข้อมูลไม่ต้องการ; C — Intelligent-Tiering เพิ่มค่าธรรมเนียม monitoring และไม่ลดต้นทุนสำหรับการเข้าถึงที่ทราบว่าไม่บ่อย; D — Glacier Instant Retrieval มีขั้นต่ำ 90 วันและโปรไฟล์ต้นทุนการดึงที่แตกต่างสำหรับรูปแบบนี้

**60. คำตอบ: A, C** — Intelligent-Tiering คิดค่าธรรมเนียม monitoring/automation ต่อ object เล็กน้อย และ objects ต่ำกว่า 128 KB ถูกจัดเก็บแต่ไม่ถูกตรวจสอบหรือ tier (เรียกเก็บที่อัตรา Frequent Access) *ทำไมไม่ใช่ข้ออื่น:* B — Intelligent-Tiering ไม่มีค่าธรรมเนียม retrieval ระหว่าง tiers อัตโนมัติ; D — มันไม่จำลอง cross-region; E — ไม่มีขั้นต่ำ 90 วันสำหรับทุก object ในคลาส

**61. คำตอบ: B** — incomplete multipart upload parts ถูกเรียกเก็บเป็นพื้นที่จัดเก็บแต่มองไม่เห็นเป็น objects; lifecycle rule ที่มี AbortIncompleteMultipartUpload ลบพวกมันโดยอัตโนมัติ *ทำไมไม่ใช่ข้ออื่น:* A — versioning จะเพิ่มพื้นที่จัดเก็บ ไม่ใช่ทำความสะอาด parts; C — การเปลี่ยนคลาสพื้นที่จัดเก็บไม่ลบ orphaned parts; D — Transfer Acceleration เร่งการถ่ายโอนแต่ไม่ทำความสะอาดการอัปโหลดที่ถูกละทิ้งแล้ว

**62. คำตอบ: B** — gp3 แยก IOPS/throughput จากขนาดและราคาถูกกว่าต่อ GB ~20% เมื่อเทียบกับ gp2 ดังนั้นความจุสามารถ right-size ได้ขณะคง IOPS ที่ต้องการ; การย้ายเป็น online ModifyVolume operation *ทำไมไม่ใช่ข้ออื่น:* A — io2 แพงกว่า ไม่ถูกกว่า; C — st1 ไม่สามารถให้ IOPS ที่ต้องการ; D — การลบ volumes ทำลายข้อมูล live

**63. คำตอบ: B** — gateway VPC endpoint สำหรับ S3 ฟรีและขจัดค่าใช้จ่ายการประมวลผลข้อมูล NAT gateway สำหรับทราฟฟิก S3 ในภูมิภาคเดียวกัน *ทำไมไม่ใช่ข้ออื่น:* A — NAT instance ยังมีต้นทุน EC2 และการดำเนินงาน; C — interface endpoints คิดราคาต่อชั่วโมงและต่อ GB แพงกว่า gateway endpoint ที่ฟรี; D — public subnets เพิ่มค่าใช้จ่าย public IPv4 และลดความปลอดภัย

**64. คำตอบ: B, E** — AWS คิดค่าใช้จ่ายสำหรับทุก public IPv4 address ที่ใช้งาน ดังนั้นการลบที่ไม่จำเป็นลดต้นทุน และ AWS Budgets ให้การแจ้งเตือน threshold เชิงรุกบนการใช้จ่ายแบบ forecast/actual *ทำไมไม่ใช่ข้ออื่น:* A — Elastic IPs ก็ถูกเรียกเก็บภายใต้ค่าใช้จ่าย public IPv4 แม้ขณะแนบอยู่; C — Compute Optimizer แนะนำการ right-size แต่ไม่สามารถบล็อกหรือแจ้งเตือน threshold การใช้จ่าย; D — Shield Advanced เป็นบริการ DDoS ที่เพิ่มต้นทุน

**65. คำตอบ: A** — Aurora Serverless v2 รองรับการ scale ไปยัง 0 ACUs (auto-pause มีตั้งแต่ปลายปี 2024) และทำต่อโดยอัตโนมัติเมื่อมีการเชื่อมต่อ ขจัดต้นทุน compute ขณะว่างโดยไม่มีขั้นตอนด้วยมือ ความละเอียดอ่อนที่ควรรู้: auto-pause ต้องการเวอร์ชันเอนจินล่าสุด (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); การเชื่อมต่อครั้งแรกหลังการหยุดชั่วคราวใช้เวลา ~15 วินาทีในการทำต่อ (นานกว่าหลังหยุด 24+ ชั่วโมง); พื้นที่จัดเก็บยังเรียกเก็บขณะ compute หยุดชั่วคราว; และสิ่งใดที่ถือการเชื่อมต่อไว้ — RDS Proxy, keep-alive health check — ป้องกันการหยุดชั่วคราวทั้งหมด *ทำไมไม่ใช่ข้ออื่น:* B — provisioned cluster ที่หยุดไม่ตื่นโดยอัตโนมัติเมื่อนักพัฒนาเชื่อมต่อ (และเริ่มใหม่หลัง 7 วัน); C — headless global database secondaries จัดการ DR ไม่ใช่ต้นทุนขณะว่าง; D — readers ที่ scale in ยังเหลือ writer instance ที่ทำงานและเรียกเก็บ

---

## คู่มือการให้คะแนน

| คะแนน | การตีความผล |
|---|---|
| 55–65 | พร้อมสอบ จองสอบได้เลย ทบทวนเฉพาะข้อที่ตอบผิด |
| 47–54 | อยู่ในช่วงผ่าน แต่ส่วนต่างบาง อ่านบทเบื้องหลังทุกข้อที่ผิดซ้ำ (ใช้ domain tags) สอบใหม่ในหนึ่งสัปดาห์ |
| 38–46 | มีพื้นฐานอยู่; ยังมีช่องว่าง ทำงานผ่าน domain map ของภาคผนวก ข สำหรับโดเมนที่อ่อนก่อนสอบใหม่ |
| ต่ำกว่า 38 | อ่านบทสำหรับสองโดเมนที่อ่อนที่สุดของคุณตั้งแต่ต้นจนจบ ทำแบบฝึกหัดบทของพวกมันใหม่ จากนั้นสอบนี้ใหม่ |

ติดตามข้อที่ผิดของคุณ *ตามโดเมน* (แต่ละข้อมี tag) คะแนนต่ำที่กระจุกในโดเมนเดียวเป็นปัญหาการศึกษาที่มุ่งเน้น; คะแนนเดียวกันที่กระจายสม่ำเสมอเป็นปัญหาการกำหนดจังหวะหรือการอ่านคำถาม — ช้าลงและขีดเส้นใต้สิ่งที่แต่ละ stem ต้องการจริงๆ (HA กับ DR, ต้นทุน กับ ประสิทธิภาพ, "คุ้มค่าที่สุด" กับ "ภาระการดำเนินงานน้อยที่สุด")
