# บทที่ 15: ยามที่ประตู

ออฟฟิศเงียบในเช้าวันอังคารเมื่อ Priya เปิด VPC flow log และเริ่มอ่าน นอกหน้าต่าง เมืองกำลังตื่น ภายใน หน้าจอแสดงบางอย่างที่ไม่ควรอยู่ที่นั่น: การเชื่อมต่อขาออกจาก EC2 instance ตอน 2:17 น. ไปยัง IP address ในโรมาเนีย

deploy key เก่าจากเวอร์ชันแรกของ Nimbus ยังคงทำงานอยู่ มันทำ API call สามครั้งสัปดาห์ที่แล้ว Leo ไม่รู้ว่าอะไรทำพวกมัน

---

*การยกเครื่อง IAM แทนที่ access key ด้วย role ทุกบริการตอนนี้มีสิทธิ์ที่ต้องการเป๊ะ แต่ขณะที่งานนั้นเกิดขึ้น ปัญหาเก่ากำลังแย่ลงเงียบ ๆ: credential ที่ใช้งานอยู่จาก deployment pipeline ที่ถูกปลดระวางยังมีชีวิต และมีอะไรใช้มัน ชั้น IAM ถูกเสริมความแข็งแกร่ง การควบคุมเครือข่ายที่อาจจำกัดความเสียหายได้ต้องการความสนใจเดียวกัน*

---

Priya ดึง VPC flow log — บันทึก network traffic ที่แสดงทุกการเชื่อมต่อเข้าและออกจาก VPC

"วันอังคารเวลา 2:17 น." เธอพูด "มีการเชื่อมต่อขาออกจาก EC2 instance ที่รัน API เก่าไปยัง IP address ในโรมาเนีย"

"นั่นไม่ใช่โครงสร้างพื้นฐานของเรา" Leo พูด

"ไม่"

"ดังนั้นมีคนอยู่บน EC2 instance ของเรา"

"หรือบางอย่าง"

พวกเขาติดตามกลับ: deploy key เก่าถูกใช้อัปโหลด script เล็ก ๆ ไปยัง EC2 instance script พยายาม scan พอร์ตบนเซิร์ฟเวอร์ใกล้เคียง การ scan ส่วนใหญ่ล้มเหลว

"ผมdeployไปแล้ว — อ้อ" Leo deploy การแก้ไขกฎ security group ก่อนการสืบสวนเสร็จ การแก้ถูกต้อง แต่เขาทำมันก่อน Priya อ่าน flow log เสร็จ เธอต้องหยุดและตรวจสอบว่าการเปลี่ยนแปลงไม่กระทบอะไรที่ไม่คาดคิด

"ครั้งหน้า รอจนการสืบสวนปิดก่อน push การเปลี่ยนแปลง" เธอพูด

"security group บล็อกพวกเขา" Priya พูด "ผู้โจมตีเข้าถึง EC2 instance หนึ่งเครื่อง พวกเขาเข้าถึงเครื่องอื่นไม่ได้เพราะ security group อนุญาตเฉพาะ traffic จาก load balancer"

"ดังนั้นความเสียหายถูกจำกัด"

"เพราะเรากำหนดค่า security group ถูกต้อง ลองนึกภาพถ้าเราเปิดพอร์ต 5432 ให้ EC2 instance ใด ๆ ในบัญชี"

Leo ไม่ต้องนึกภาพ เขาเห็น configuration นั้นในการตั้งค่าดั้งเดิม

"เราคิดเรื่องว่ามันจะหมายความว่าอะไรหรือยัง?" Priya พูดต่อ "EC2 instance ใด ๆ ในบัญชี — รวมถึงเครื่องที่มี key ที่ถูก compromise — เชื่อมต่อกับฐานข้อมูลโดยตรงได้ รัน SQL ตามใจ ดาวน์โหลดประวัติออเดอร์ของลูกค้าทุกคน drop table"

"แทนที่จะเป็นแบบนั้น พวกเขาถูกปฏิเสธทุกครั้งที่พยายาม" Leo พูด

"ใช่ เพราะ security group ของฐานข้อมูลรับการเชื่อมต่อจาก security group ของ API เท่านั้น ไม่ใช่จาก EC2 ใด ๆ ในบัญชี ไม่ใช่จาก IP ใด ๆ เฉพาะจาก security group ของ API"

"การตัดสินใจออกแบบเดียวนั้น" Maya พูด "คือความแตกต่างระหว่างเหตุการณ์ที่ถูกจำกัดกับการรั่วข้อมูลเต็ม"

"การออกแบบ security group ไม่ใช่ checkbox" Priya พูด "มันคือความปลอดภัยจริงของระบบ"

Rafael ฟังอยู่ "คุณเรียนรู้ว่า configuration ที่ถูกต้องคืออะไรได้ยังไง? กฎดูเหมือนตามใจในตอนแรก"

"คุณเริ่มด้วยการแจกแจงสิ่งที่แต่ละ component ต้องทำ" Priya พูด "load balancer ต้องรับ HTTPS จากที่ไหนก็ได้ API server ต้องรับ HTTP จาก load balancer เท่านั้น ฐานข้อมูลต้องรับ PostgreSQL จาก API server เท่านั้น Redis ต้องรับพอร์ต 6379 จาก API server เท่านั้น ความต้องการเหล่านั้น map ตรงกับ inbound rule ทุกอย่างอื่นถูกปฏิเสธโดยค่าเริ่มต้น"

"แล้ว outbound ล่ะ?"

"outbound คือที่ที่คนขี้เกียจ ทีมส่วนใหญ่ปล่อย outbound เป็น allow-all นั่นหมายความว่า instance ที่ถูก compromise เรียกอะไรก็ได้ เราจะรัดมัน"

**สองชั้นของ Network Security**

ใน VPC คุณมีสองเครื่องมือที่แตกต่างกันสำหรับการควบคุม network traffic:

**Security Groups**: Virtual firewall ที่แนบกับทรัพยากรแต่ละอัน (EC2 instance, RDS database, load balancer, Lambda function ใน VPC) พวกมันทำงานที่ระดับทรัพยากร

**Network ACLs (NACLs)**: กฎ firewall ที่แนบกับ subnet พวกมันทำงานที่ขอบเขต subnet — ก่อน traffic ถึงทรัพยากรใดใน subnet นั้น

การเข้าใจทั้งสองต้องการการเข้าใจความแตกต่างที่สำคัญหนึ่งอย่าง: **stateful vs stateless**

**Stateful: Security Groups**

security group เป็น **stateful**

เมื่อคุณอนุญาต inbound traffic บนพอร์ตเฉพาะ response traffic ถูกอนุญาตออกโดยอัตโนมัติ แม้ไม่มี outbound rule ชัดเจนสำหรับมัน

เมื่อคุณอนุญาต outbound traffic ไปยังปลายทาง response ที่กลับมาถูกอนุญาตโดยอัตโนมัติ

คิดถึงยามรักษาความปลอดภัยแบบ stateful ที่อาคารสำนักงาน คุณแสดงบัตรเพื่อเข้า คุณเดินออกทีหลัง ยามไม่ต้องตรวจคุณอีกตอนออก — ระบบรู้ว่าคุณถูกให้เข้า และคุณได้รับอนุญาตให้ออก

**กฎ Security Group สำหรับ EC2 instance ของ Nimbus API:**

- **Inbound — TCP 8080 — จาก Load Balancer SG** → รับ API traffic จาก ALB
- **Inbound — TCP 22 — จาก Bastion Host SG** → SSH จาก bastion เท่านั้น
- **Outbound — TCP 5432 — ไปยัง RDS SG** → เชื่อมต่อ PostgreSQL
- **Outbound — TCP 6379 — ไปยัง ElastiCache SG** → เชื่อมต่อ Redis
- **Outbound — TCP 443 — ไปยัง 0.0.0.0/0** → HTTPS ไปยัง external API

สังเกต: ไม่มี outbound rule ชัดเจนสำหรับพอร์ต 8080 inbound rule เป็น stateful — response traffic (คำตอบของ API ต่อ load balancer) ถูกอนุญาตโดยอัตโนมัติ

สังเกตด้วย: กฎ security group อ้างอิง *security group อื่น* ไม่ใช่ IP address "อนุญาต inbound จาก security group ของ load balancer" หมายถึง "อนุญาต traffic จากทรัพยากรใด ๆ ที่มี security group นี้แนบ" นี่ยืดหยุ่นและรักษาได้ง่ายกว่าการติดตาม IP address

**พฤติกรรมค่าเริ่มต้น:**

- โดยค่าเริ่มต้น inbound traffic ทั้งหมดถูกปฏิเสธ
- โดยค่าเริ่มต้น outbound traffic ทั้งหมดถูกอนุญาต
- ทุกกฎถูกประเมิน (security group ไม่มีกฎที่เรียงลำดับ — ทุกกฎที่ตรงกันใช้)
- security group สามารถ **อนุญาต** traffic เท่านั้น — คุณสร้าง explicit deny rule ไม่ได้

**Stateless: Network ACLs**

NACL เป็น **stateless**

เมื่อคุณอนุญาต inbound traffic บนพอร์ต 8080 นั่นครอบคลุมเฉพาะขาเข้า response (outbound traffic บน ephemeral port) ต้องถูกอนุญาตอย่างชัดเจนด้วย outbound rule

คิดถึงเครื่องตรวจจับโลหะ คุณเดินผ่านมันตอนเข้า เครื่องตรวจจับโลหะไม่รู้ว่าคุณผ่านไปแล้ว — คุณต้องเดินผ่านอีกครั้งตอนออก

**กฎ NACL ถูกเลขกำกับและประเมินตามลำดับ** กฎแรกที่ตรงกันชนะ Rule 100 ถูกประเมินก่อน rule 200 ถ้า rule 100 ปฏิเสธ traffic และ rule 200 อนุญาตมัน traffic ถูกปฏิเสธ

NACL สามารถ **ปฏิเสธ** traffic อย่างชัดเจนได้ — ต่างจาก security group ที่อนุญาตได้เท่านั้น สิ่งนี้ทำให้พวกมันมีประโยชน์สำหรับการบล็อกช่วง IP เฉพาะ

**พฤติกรรม NACL ค่าเริ่มต้น:**

- default NACL (สร้างกับ VPC ของคุณ) อนุญาต inbound และ outbound traffic ทั้งหมด
- custom NACL ปฏิเสธ traffic ทั้งหมดโดยค่าเริ่มต้น (คุณต้องอนุญาตสิ่งที่คุณต้องการอย่างชัดเจน)

**NACL สำหรับ public subnet (อย่างย่อ):**

*กฎ Inbound (ประเมินตามลำดับ — ตรงกันแรกชนะ):*

- Rule 100: TCP 443, จาก 0.0.0.0/0 → **Allow** (HTTPS)
- Rule 110: TCP 80, จาก 0.0.0.0/0 → **Allow** (HTTP)
- Rule 120: TCP 1024–65535, จาก 0.0.0.0/0 → **Allow** (ephemeral return port)
- Rule \*: All traffic → **Deny**

*กฎ Outbound:*

- Rule 100: TCP 443, ไปยัง 0.0.0.0/0 → **Allow** (HTTPS)
- Rule 110: TCP 80, ไปยัง 0.0.0.0/0 → **Allow** (HTTP)
- Rule 120: TCP 1024–65535, ไปยัง 0.0.0.0/0 → **Allow** (ephemeral return port)
- Rule \*: All traffic → **Deny**

Rule 120 (พอร์ต 1024-65535) อนุญาต ephemeral port — พอร์ตเลขสูงชั่วคราวที่ใช้สำหรับ TCP response traffic เพราะ NACL เป็น stateless คุณต้องอนุญาตพวกนี้ขาออกอย่างชัดเจน ไม่งั้น response ของเซิร์ฟเวอร์จะผ่านไม่ได้

**เมื่อไรใช้อันไหน**

"เดี๋ยว — แต่ *ทำไม* เราถึงทำแบบนั้น?" Maya ถาม "ทำไมต้องมีสองเครื่องมือแยกกัน — security group *และ* NACL — ถ้า security group ทำงานได้อยู่แล้ว? ประเด็นของความซับซ้อนเพิ่มคืออะไร?"

คำตอบคือพวกมันทำงานที่ระดับต่างกันและมีความสามารถต่างกัน security group ปกป้องทรัพยากรแต่ละอันและอนุญาต traffic ได้เท่านั้น NACL ปกป้องทั้ง subnet และปฏิเสธอย่างชัดเจนได้ การมีทั้งสองหมายความว่าคุณใช้กฎ allow แบบละเอียดที่ระดับทรัพยากรและกฎ deny กว้างที่ระดับ subnet ได้ — โดยอันหนึ่งไม่รบกวนอีกอัน

ใช้ **security group** สำหรับชั้นหลักของการควบคุมการเข้าถึง พวกมันจัดการง่ายกว่า stateful (โอกาสน้อยที่จะบล็อกโดยบังเอิญจากการลืม ephemeral port) และรองรับการอ้างอิง security group อื่น

ใช้ **NACL** สำหรับการควบคุมระดับ subnet โดยเฉพาะ:

- **กฎ deny ชัดเจน**: บล็อก IP address หรือช่วงเฉพาะไม่ให้ถึงทั้ง subnet
- **การบล็อกฉุกเฉิน**: IP กำลังโจมตี — เพิ่มกฎ deny NACL เพื่อบล็อกทั้ง subnet ก่อนมันถึงทรัพยากรใด

คุณอาจสงสัย: ถ้า security group เป็น stateful และบล็อก inbound ทั้งหมดโดยค่าเริ่มต้น เมื่อไรคุณจะต้องการ NACL จริง ๆ? security group จัดการกรณีส่วนใหญ่ได้ดี แต่มีสิ่งหนึ่งที่พวกมันทำไม่ได้: ปฏิเสธอย่างชัดเจน security group อนุญาต traffic ได้เท่านั้น — ถ้ากฎไม่ตรงกัน traffic ถูกปฏิเสธโดยค่าเริ่มต้น คุณเพิ่มกฎที่บอก "บล็อก IP เฉพาะนี้" ไม่ได้ สำหรับนั้น คุณต้องการ NACL: กฎ deny ที่เลขกำกับที่หยุดช่วง address เฉพาะก่อนมันถึงทรัพยากรใดใน subnet NACL มีประโยชน์ที่สุดสำหรับการตอบสนองฉุกเฉิน (การบล็อกผู้โจมตีที่ active) และสำหรับการบังคับขอบเขตระดับ subnet ที่ไม่ควรขึ้นกับการกำหนดค่าทรัพยากรแต่ละอัน

"ดังนั้น security group คือการควบคุมแบบละเอียด" Maya พูด "และ NACL คือการตวัดกว้าง?"

"security group ปกป้องทรัพยากรแต่ละอัน" Priya ยืนยัน "NACL ปกป้องทั้ง subnet เมื่อคุณอยากบล็อก IP ไม่ให้ถึงอะไรในเครือข่ายของคุณ NACL เมื่อคุณอยากอนุญาตเฉพาะ load balancer ให้ถึง API server security group"

"เราคิดเรื่องว่าจะเกิดอะไรขึ้นถ้าผู้โจมตีกลับมาด้วย IP ที่ต่างกันหรือยัง?" Priya พูด "NACL บล็อกหนึ่งช่วง พวกเขาเปลี่ยนไปอีกช่วง"

"นั่นคือสิ่งที่ GuardDuty มีไว้" Leo พูด "การตรวจจับเชิงพฤติกรรม ถ้า script เดียวกันรันจาก IP ใหม่ รูปแบบ traffic ดูเหมือนกัน"

"เราจะไปถึงตรงนั้น" Priya พูด "เรื่องสำคัญก่อน"

"ทั้งหมดนี้มีต้นทุนเท่าไรต่อเดือน?" Tom ถาม

security group และ NACL เองฟรี AWS ไม่คิดค่าจำนวน security group จำนวนกฎ หรือจำนวน entry ของ NACL การพิจารณาต้นทุนเป็นทางอ้อม: กฎ outbound security group ที่รัดกุมกว่าอาจส่ง traffic ผ่าน NAT Gateway น้อยลง ลดค่าธรรมเนียมการประมวลผลข้อมูล

"ดังนั้นการควบคุมความปลอดภัยฟรี" Rafael พูด "ต้นทุนคือโครงสร้างพื้นฐานที่รองรับพวกมัน"

"ถูกต้อง NAT Gateway สำหรับ high availability Interface VPC Endpoint สำหรับบริการที่ไม่งั้นจะผ่าน NAT พวกนั้นมีต้นทุน กฎ security group เองไม่มี"

**ประกอบเข้าด้วยกัน: การป้องกันเป็นชั้น**

หลังเหตุการณ์ Priya วาดชั้นการป้องกันของ Nimbus บนไวท์บอร์ด:

```
Internet
  ↓
CloudFront + Shield (DDoS absorption)
  ↓
WAF (application-layer filtering)
  ↓
Internet Gateway
  ↓
NACL on public subnet (subnet-level rules, emergency blocking)
  ↓
ALB Security Group (HTTPS from anywhere)
  ↓
NACL on private app subnet
  ↓
EC2 API Security Group (port 8080 from ALB SG only)
  ↓
NACL on private data subnet
  ↓
RDS Security Group (port 5432 from API SG only)
```

"แต่ละชั้นสมมติว่าชั้นก่อนหน้าอาจล้มเหลว" เธอพูด "ฐานข้อมูลไม่ไว้ใจว่าชั้นเครือข่ายหยุดผู้โจมตี EC2 instance ไม่ไว้ใจว่า ALB หยุดผู้โจมตี แต่ละชั้นบังคับกฎของตัวเองอย่างอิสระ"

"Defense in depth" Maya พูด

"Defense in depth ผู้โจมตีที่ผ่านชั้นหนึ่งยังเผชิญชั้นถัดไป ไม่มีการกำหนดค่าผิดเดียวที่ร้ายแรง มันหมายความว่าชั้นหนึ่งล้มเหลว และชั้นอื่นยืนหยัด"

Leo มองแผนภาพ ผู้โจมตี compromise EC2 instance หนึ่งเครื่อง พวกเขาผ่านชั้น credential แต่ทุกชั้นถัดไปยืนหยัด

นั่นคือสิ่งที่ defense in depth ดูเป็นในทางปฏิบัติ

**เหตุการณ์: สิ่งที่ชั้นจับได้**

กลับไปที่การโจมตี IP โรมาเนีย:

**สิ่งที่เกิดขึ้น**: ผู้โจมตีใช้ deploy key ที่ถูก compromise อัปโหลด scanning script ไปยัง EC2 instance หนึ่งเครื่อง script พยายามเชื่อมต่อกับบริการอื่น

**สิ่งที่หยุดพวกเขา**:

- security group ของ RDS อนุญาต inbound บนพอร์ต 5432 จาก security group ของ API EC2 เท่านั้น script เข้าถึงฐานข้อมูลจาก scanning tool ไม่ได้ — มันไม่ได้แนบ security group ที่ถูกต้อง
- security group ของ ElastiCache อนุญาต inbound บนพอร์ต 6379 จาก security group ของ API EC2 เท่านั้น
- EC2 instance อื่นอนุญาต SSH จาก security group ของ bastion host เท่านั้น

**สิ่งที่ไม่หยุดพวกเขา**:

- กฎ outbound ของ EC2 instance อนุญาต HTTPS ไปยัง 0.0.0.0/0 (จำเป็นสำหรับการดาวน์โหลดแพ็กเกจ) script ใช้สิ่งนี้ทำการเชื่อมต่อขาออกไปยังเซิร์ฟเวอร์ของผู้โจมตี

หลังเหตุการณ์ Priya เพิ่ม:

- กฎ NACL ที่บล็อกช่วง IP โรมาเนีย
- กฎ outbound ที่จำกัดมากขึ้นบน EC2 instance (อนุญาตเฉพาะปลายทางที่รู้ว่าดีเฉพาะ)
- การตรวจว่า **IMDSv2 ถูกบังคับ** (`HttpTokens=required`) บนทุก instance — script รัน *บน* instance ซึ่งหมายความว่ามันอาจ query metadata service หา temporary credential ของ instance role ได้ IMDSv2 ถูกเปิดในบทที่ 4; Priya ตรวจสอบว่ามันยังถูกต้องการทุกที่ เพราะผู้โจมตีที่มีการ execute โค้ดบวก IMDSv1 เท่ากับ AWS credential ที่ถูกขโมย

---

**การอ่าน Flow Logs: สิ่งที่ Priya เห็น**

การสืบสวนเริ่มด้วย VPC flow log Priya เปิด CloudWatch Logs Insights และรัน query กับ flow log group สำหรับ 48 ชั่วโมงที่ผ่านมา:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` คือ EC2 instance ที่ถูก compromise filter REJECT แสดงความพยายามเชื่อมต่อที่ถูกบล็อก

ผลลัพธ์:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Other EC2 instance — SSH blocked
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Another EC2 — SSH blocked
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — blocked by security group
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # RDS replica — blocked
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — blocked
```

scan ชนทุกบริการภายใน ทุกความพยายามถูกปฏิเสธ การออกแบบ security group ยืนหยัด

แต่ก็มี outbound ACCEPT entry ด้วย:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

นั่นคือความพยายาม data exfiltration — 2.8 กิโลไบต์ส่งไปยัง IP โรมาเนียผ่าน HTTPS security group อนุญาต HTTPS ขาออกสำหรับการดาวน์โหลดแพ็กเกจที่ถูกต้อง ผู้โจมตีใช้กฎนั้น

"security group หยุดการเคลื่อนไหวด้านข้าง" Priya พูด เดินทีมผ่าน log "แต่กฎ outbound ผ่อนปรนเกินไป เราอนุญาต HTTPS ไปยังปลายทางใด ๆ เราควรอนุญาต HTTPS เฉพาะไปยัง AWS endpoint ที่รู้จัก — CloudWatch, Secrets Manager, S3 — และ CDN ของ package repository"

เธอแสดงกฎ outbound ของ security group ที่อัปเดต:

```
TCP 443 → pl-63a5400a (AWS S3 gateway endpoint prefix list)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (AWS package repos — narrows over time)
```

"นั่นกำจัดกฎ HTTPS ขาออกทั่วไป HTTPS ขาออกตอนนี้ไปเฉพาะปลายทางที่รู้ว่าดี"

"แล้ว Lambda function ที่เรียก API บุคคลที่สามล่ะ?" Leo ถาม

"พวกนั้นไปผ่าน NAT Gateway ซึ่งมีกฎ outbound เฉพาะของตัวเอง" Priya พูด "Lambda ไม่ใช้ security group ของ EC2 network interface ต่างกัน ชุดกฎต่างกัน"

---

**เรื่องราวการดีบัก Stateless**

สองสัปดาห์หลังเหตุการณ์ Rafael — ยังอยู่เดือนแรก — กำลังช่วยตั้ง data pipeline ใหม่ มันเกี่ยวข้องกับ Lambda function ใน VPC ที่ต้องเรียก internal API ที่รันบน EC2

Lambda function timeout ทุกการเรียก timeout

Rafael ตรวจ security group security group ของ Lambda มีกฎ outbound สำหรับ TCP 8080 ไปยัง security group ของ EC2 security group ของ EC2 มีกฎ inbound สำหรับ TCP 8080 จาก security group ของ Lambda กฎดูถูกต้อง

เขาหันไป Leo "security group ดูดี ทำไมมัน timeout?"

Leo มองการกำหนดค่า subnet Lambda function อยู่ใน private subnet subnet มี custom NACL ที่ Priya ใช้ระหว่างการเสริมความแข็งแกร่งด้านความปลอดภัย

เขามองกฎ outbound ของ NACL:

```
Rule 100: TCP 443  → 0.0.0.0/0  ALLOW
Rule 110: TCP 5432 → 10.0.20.0/24 ALLOW
Rule *:   All      → 0.0.0.0/0  DENY
```

"NACL อนุญาต HTTPS ขาออกและ PostgreSQL ขาออก" Leo พูด "มันไม่อนุญาต TCP 8080 ขาออก"

"security group อนุญาตมัน" Rafael พูด

"NACL ไม่ และ NACL เป็น stateless แม้ security group ของ Lambda function อนุญาตการเชื่อมต่อขาออก NACL ที่ขอบเขต subnet ยังประเมิน outbound traffic NACL บล็อกการเรียกของ Lambda ก่อนมันออกจาก subnet"

"แต่ถ้าผมเพิ่ม ALLOW สำหรับ TCP 8080 ขาออกใน NACL—"

"คุณต้องเพิ่ม ALLOW สำหรับ ephemeral port ขาเข้าด้วย" Leo พูด "response จาก EC2 instance กลับมาบนพอร์ตสุ่มระหว่าง 1024 และ 65535 ถ้ากฎ inbound ของ NACL ไม่อนุญาตพวกนั้น response ถูกบล็อกบนเที่ยวกลับ"

Rafael อัปเดต NACL:

```
Rule 100:  TCP 443       → 0.0.0.0/0      ALLOW  (outbound)
Rule 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (outbound to EC2 subnet)
Rule 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (outbound to DB subnet)
Rule *:    All           → 0.0.0.0/0      DENY
```

และฝั่ง inbound:

```
Rule 100:  TCP 1024-65535 from 10.0.10.0/24  ALLOW  (return traffic from EC2)
Rule *:    All                               DENY
```

Lambda function เชื่อมต่อทันที

"นี่คือเหตุผลที่คนเกลียด NACL" Rafael พูด

"นี่คือเหตุผลที่คุณต้องเข้าใจพวกมัน" Priya พูด "บั๊กที่พวกมันสร้างคือบั๊กเป๊ะที่พวกมันออกแบบมาเพื่อป้องกัน — การไหลของ traffic ที่ไม่คาดคิด การเข้าใจโมเดล stateless บอกคุณเป๊ะว่าจะดูที่ไหนเมื่อการเชื่อมต่อล้มเหลวอย่างลึกลับ"

"Security group stateful — return traffic อัตโนมัติ NACL stateless — return traffic ต้องการกฎชัดเจน" Rafael พูดซ้ำ

"พูดมันจนเป็นส่วนหนึ่งของวิธีคิดของคุณ" Priya พูด

---

**การบล็อกฉุกเฉิน NACL: กฎ /24**

หลังระบุช่วง source IP ของผู้โจมตี การตอบสนองของ Priya ทันที: เพิ่มกฎ deny NACL

แต่เธอไม่บล็อกแค่ IP เดียว เธอบล็อกทั้ง `/24` — subnet 256 address ที่ผู้โจมตีดำเนินการจาก

"ทำไมทั้ง /24?" Leo ถาม

"เพราะการบล็อก IP เดียวเป็นเกมที่แพ้ ผู้โจมตีใช้หลาย IP ภายในช่วง หมุนเวียนผ่านพวกมันเมื่ออันหนึ่งถูกบล็อก การบล็อก /24 ทำให้ยากขึ้น — พวกเขาต้องเปลี่ยนไปบล็อก address ที่ต่างกัน ซึ่งเสียเวลาและความพยายามของพวกเขา"

กฎ NACL:

```
Rule 90:  ALL from 185.220.101.0/24 → DENY
```

Rule 90 ถูกประเมินก่อนกฎ allow ใด (ซึ่งเริ่มที่ rule 100) ทั้งช่วงถูกบล็อกก่อนกฎ allow ใดถูกพิจารณา

"และนี่ใช้กับทุกทรัพยากรใน subnet?" Leo ถาม

"ทุกทรัพยากร นั่นคือประเด็นของ NACL — มันใช้ก่อน traffic ถึง security group ของทรัพยากรแต่ละอัน NACL deny ที่ rule 90 หมายความว่า packet ไม่เคยถึงการประเมิน security group"

"เราทำสิ่งนี้ด้วย security group แทนได้ไหม?"

"ไม่ security group อนุญาต traffic ได้เท่านั้น ไม่มีกฎ deny ถ้าคุณอยากบล็อก IP เฉพาะไม่ให้ถึงทรัพยากรใดใน subnet NACL คือตัวเลือกเดียว"

นี่คือกรณีใช้งานหลักของกฎ deny NACL: การตอบสนองฉุกเฉินต่อการโจมตีที่ active security group คือกลไกควบคุมหลัก NACL คือเบรกฉุกเฉิน

---

**รูปแบบการออกแบบ Security Group: อ้างอิงตาม ID**

"เราคิดเรื่องว่าจะเกิดอะไรขึ้นเมื่อ EC2 instance ของเราถูกแทนที่หรือยัง?" Priya ถาม "Auto Scaling ยุติ instance เก่าและ launch ใหม่ instance ใหม่ได้ private IP address ใหม่"

"ถ้ากฎ security group อ้างอิง IP address" Leo พูดช้า ๆ "เราต้องอัปเดตกฎทุกครั้งที่ instance ถูกแทนที่"

"ใช่เลย ซึ่งเป็นเหตุผลที่คุณไม่อ้างอิง IP address ในกฎ security group สำหรับ traffic ภายใน VPC"

security group อ้างอิง security group อื่นแทน IP address ได้ เมื่อกฎบอก "อนุญาต inbound จาก security group ของ load balancer" มันหมายถึง "อนุญาต traffic จากทรัพยากรใด ๆ ที่มี security group ของ load balancer แนบ" Auto Scaling launch instance ใหม่หนึ่งพันเครื่องด้วย IP ใหม่แต่ละเครื่องได้ และกฎยังคงใช้ได้

โครงสร้าง security group ของ Nimbus:

```
nimbus-alb-sg (Load Balancer)
  - Inbound: TCP 443 from 0.0.0.0/0
  - Inbound: TCP 80 from 0.0.0.0/0

nimbus-api-sg (EC2 API instances)
  - Inbound: TCP 8080 from nimbus-alb-sg
  - Inbound: TCP 22 from nimbus-bastion-sg
  - Outbound: TCP 5432 to nimbus-rds-sg
  - Outbound: TCP 6379 to nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Inbound: TCP 5432 from nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Inbound: TCP 6379 from nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Inbound: TCP 22 from <office VPN IP>
```

ไม่มี IP address สำหรับ traffic ภายใน security group ID เท่านั้น เมื่อ instance ถูกแทนที่ สมาชิกภาพ security group ถ่ายโอนไปยัง instance ใหม่โดยอัตโนมัติ

"แล้วสำหรับ microservices ที่เราวางแผนล่ะ?" Rafael ถาม "เราจะมีบริการหนึ่งโหลในที่สุด แต่ละอันต้องคุยกับบางอัน แต่ไม่ใช่ทั้งหมด"

"แต่ละบริการได้ security group ของตัวเอง" Priya พูด "security group ของ Service A ถูกอ้างอิงในกฎ inbound ของทุกบริการที่ Service A ได้รับอนุญาตให้เรียก บริการที่ไม่ควรสื่อสารแค่ไม่อ้างอิง security group ของกันและกัน"

นี่คือ **hub-and-spoke security group pattern** สำหรับ microservices security group ฐานข้อมูลที่ใช้ร่วมกันมีกฎ inbound จาก security group ของห้าบริการที่ต่างกัน ถ้าบริการที่หกต้องการการเข้าถึงฐานข้อมูล คุณเพิ่ม security group ของมันในกฎ inbound ของฐานข้อมูล ถ้าควรเอาการเข้าถึงออก คุณเอาการอ้างอิงออก ไม่มีการจัดการ IP ไม่มีกฎเก่าที่ชี้ไปยังเซิร์ฟเวอร์ที่ปลดระวาง

"security group คือ identity" Priya พูด "IP address คืออุบัติเหตุของการ scheduling"

---

**Firewall แบบ Least-Privilege: วินัย**

"เราคิดเรื่องว่าท่าทีที่ถูกต้องสำหรับกฎ outbound คืออะไรหรือยัง?" Priya ถามระหว่างการทบทวนหลังเหตุการณ์

ทีมส่วนใหญ่ปล่อยกฎ outbound ของ EC2 security group ที่ค่าเริ่มต้น: allow all outbound นี่สะดวก — แอปพลิเคชันเรียกอะไรก็ได้ — แต่มันไม่ใช่ least privilege

หลักการของ Priya: กฎ outbound ควรเฉพาะเท่ากับกฎ inbound

กฎ outbound ของ security group Nimbus API หลังการเสริมความแข็งแกร่ง:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL to RDS)
TCP 6379 → nimbus-redis-sg     (Redis to ElastiCache)
TCP 443  → s3.amazonaws.com prefix list    (S3 gateway endpoint)
TCP 443  → secretsmanager endpoint         (Secrets Manager)
TCP 443  → logs endpoint                   (CloudWatch Logs)
```

ไม่มี "allow all outbound" ทุกปลายทางถูกตั้งชื่อ

"นี่บำรุงรักษาเยอะ" Leo พูด

"มันบำรุงรักษามากกว่า allow-all" Priya ยอมรับ "มันทำความสะอาดน้อยกว่าการรั่วข้อมูล ผู้โจมตีที่ compromise EC2 instance อาจ exfiltrate ข้อมูลมากกว่าถ้ากฎ outbound เปิด พวกเขาใช้กฎ HTTPS-to-anywhere เพราะมันอยู่ที่นั่น"

"และด้วยกฎ outbound เฉพาะ แม้ instance ที่ถูก compromise ส่งข้อมูลได้เฉพาะปลายทางที่อนุมัติ"

"ใช่เลย security group กลายเป็นแนวสุดท้ายของการจำกัด ไม่ใช่แค่แนวแรกของการป้องกัน"

---

## จุดแข็งและข้อจำกัด

**Security Groups**:

- Stateful (ไม่มีปวดหัวเรื่อง ephemeral port)
- อ้างอิง security group อื่นได้ (ยืดหยุ่นกว่า IP)
- allow rule เท่านั้น — ไม่มี explicit deny
- ทำงานที่ระดับทรัพยากร — ละเอียด
- กฎมีผลทันที — ไม่มีการเรียงลำดับ ไม่มีลำดับความสำคัญ
- หลาย security group แนบกับทรัพยากรเดียวได้ — กฎจากทั้งหมดรวมกัน

**NACLs**:

- Stateless (ต้องการกฎชัดเจนสำหรับทั้งสองทิศทางรวมถึง ephemeral port)
- ปฏิเสธอย่างชัดเจนได้ — มีประโยชน์สำหรับการบล็อก IP ที่รู้ว่าไม่ดี
- ทำงานที่ระดับ subnet — การตวัดกว้างกว่า
- กฎที่เลขกำกับประเมินตามลำดับ — คาดเดาได้แต่ต้องการการจัดการอย่างระมัดระวัง
- ใช้ก่อน traffic ถึงทรัพยากรใดใน subnet — แนวแรกของการป้องกัน
- มีประสิทธิภาพสำหรับการบล็อก IP ฉุกเฉินทั่วทั้ง subnet

**แต่ละเครื่องมือเหมาะตรงไหน**:

ใช้ security group สำหรับทุกอย่างโดยค่าเริ่มต้น เพิ่ม NACL เมื่อคุณต้องการกฎ deny ชัดเจน — การบล็อกช่วง IP การบล็อกพอร์ตที่ระดับ subnet ไม่ว่าการกำหนดค่าทรัพยากรแต่ละอันจะเป็นอย่างไร หรือการบังคับว่า data subnet ไม่เคยรับ traffic จากแหล่งเฉพาะ NACL ไม่ใช่ตัวแทนของ security group; พวกมันเป็นส่วนเสริมสำหรับสถานการณ์ที่การออกแบบ allow-only ของ security group ไม่เพียงพอ

## สรุป

เหตุการณ์ IP โรมาเนียถูกจำกัดโดยการควบคุมความปลอดภัยที่มีอยู่แล้ว — ไม่ใช่โดยโชค แต่โดยการออกแบบ security group ป้องกันการเคลื่อนไหวด้านข้างภายใน VPC หลังเหตุการณ์ NACL เพิ่มความสามารถในการบล็อกช่วง IP ของผู้โจมตีอย่างชัดเจนที่ขอบเขต subnet VPC flow log ทำให้การโจมตีมองเห็นได้ สองเครื่องมือ สองชั้น สองงานที่ต่างกัน — พร้อม logging เพื่อพิสูจน์ว่าเกิดอะไรขึ้น

- **Security Groups** เป็น stateful virtual firewall สำหรับทรัพยากรแต่ละอัน allow rule เท่านั้น ทุกกฎประเมินพร้อมกัน
- **NACLs** เป็น stateless firewall สำหรับทั้ง subnet allow และ deny rule กฎประเมินตามลำดับเลข — ตรงกันแรกชนะ
- **Stateful** หมายถึง response traffic ถูกอนุญาตโดยอัตโนมัติ **Stateless** หมายถึงคุณต้องอนุญาต traffic ทั้งสองทิศทางอย่างชัดเจน รวมถึง ephemeral return port
- security group คือชั้นควบคุมการเข้าถึงหลักของคุณ NACL คือการแทนที่ระดับ subnet — โดยเฉพาะสำหรับการบล็อกฉุกเฉิน
- เมื่อ NACL อนุญาต inbound traffic คุณต้องอนุญาต outbound ephemeral port (1024-65535) ด้วยเพื่อให้ TCP response ผ่านได้
- **อ้างอิง security group ตาม ID** ไม่ใช่ IP address สำหรับ traffic ภายใน VPC Auto Scaling แทนที่ instance; สมาชิกภาพ security group ถ่ายโอนโดยอัตโนมัติ
- **กฎ outbound เฉพาะ** บน EC2 instance จำกัดสิ่งที่ instance ที่ถูก compromise ทำได้ — firewall แบบ least-privilege
- ใช้ flow log เพื่อดูว่า security group และ NACL ทำอะไรจริง ๆ กฎคือทฤษฎี log คือหลักฐาน

## เคล็ดลับการสอบ

*SAA-C03 Domain: ออกแบบสถาปัตยกรรมที่ปลอดภัย (Domain 1, Task 1.2)*

- **Stateful vs stateless**: ความแตกต่างนี้คือแนวคิดที่ถูกทดสอบมากที่สุดในบทนี้ security group = stateful = response อนุญาตอัตโนมัติ NACL = stateless = ต้องอนุญาต response traffic อย่างชัดเจน
- **กฎ security group**: ไม่มี explicit deny เมื่อหลาย security group แนบกับ instance union ของกฎทั้งหมดใช้ ทุกกฎที่ตรงกันประเมินพร้อมกัน
- **ลำดับกฎ NACL**: กฎประเมินจากเลขน้อยสุดไปสูงสุด Rule 100 ก่อน 200 ตรงกันแรกชนะ กฎ `*` (เครื่องหมายดอกจัน) ที่ด้านล่างคือ implicit deny การเพิ่มกฎ deny ที่ rule 90 บล็อกก่อนกฎ allow ใดที่ 100
- **Ephemeral ports**: ความผิดพลาด NACL คลาสสิกคือการลืมอนุญาต outbound บนพอร์ต 1024-65535 ถ้า NACL ของคุณอนุญาต inbound HTTP (พอร์ต 80) แต่ไม่อนุญาต outbound ephemeral port user ส่งคำขอได้แต่ไม่เคยได้รับ response นี่คือสถานการณ์ NACL ที่พบบ่อยที่สุดในข้อสอบ
- **การอ้างอิง security group**: คุณอนุญาต traffic จาก security group อื่นได้ (ไม่ใช่แค่ IP) นี่คือรูปแบบที่แนะนำสำหรับ traffic ภายใน VPC ข้อสอบมักใช้ "อนุญาต inbound จาก security group ของ ALB" เป็นคำตอบที่ถูกต้องสำหรับการจำกัดการเข้าถึง EC2
- **Default NACL vs custom NACL**: default NACL อนุญาต traffic ทั้งหมด custom NACL (ที่คุณสร้าง) ปฏิเสธ traffic ทั้งหมดโดยค่าเริ่มต้น สถานการณ์ข้อสอบ: "สร้าง NACL ใหม่และตอนนี้ traffic ถูกบล็อก" → ตรวจหากฎ allow ที่หายไป
- **การบล็อก IP ของผู้โจมตี**: security group บล็อก IP เฉพาะไม่ได้ (allow เท่านั้น) NACL ปฏิเสธ IP หรือ CIDR เฉพาะอย่างชัดเจนได้ สถานการณ์ข้อสอบ: "บล็อก IP เฉพาะไม่ให้ถึงทรัพยากรใดใน subnet" → กฎ deny NACL
- **การดีบักความล้มเหลวของการเชื่อมต่อ**: ตรวจลำดับ: security group บน source (outbound) → security group บน destination (inbound) → NACL บน source subnet (outbound + ephemeral port) → NACL บน destination subnet (inbound) ความล้มเหลวของการเชื่อมต่อในข้อสอบส่วนใหญ่เกิดจากกฎ outbound NACL ที่หายไปหรือการอนุญาต ephemeral port ที่หายไป
- **หลาย subnet และ NACL**: NACL หนึ่งใช้กับทุก subnet ที่เชื่อมโยงกับมัน subnet หนึ่งเชื่อมโยงกับ NACL ได้แค่อันเดียว ข้อสอบอาจถามว่าจะอัปเดต NACL ใดเมื่อ traffic ของ subnet เฉพาะได้รับผลกระทบ

## แบบฝึกหัด

**แบบฝึกหัด 1 — ทบทวน**

นักพัฒนาเพิ่ม inbound rule ให้ security group ที่อนุญาต traffic บนพอร์ต 443 เธอต้องเพิ่ม outbound rule เพื่ออนุญาต response ของเซิร์ฟเวอร์ด้วยไหม? ทำไมหรือทำไมไม่?

ถ้าแทนที่เธอเพิ่ม inbound rule ให้ NACL ที่อนุญาต traffic บนพอร์ต 443 เธอต้องเพิ่ม outbound rule ไหม? ทำไมหรือทำไมไม่?

**คำใบ้**: คิดย้อนไปที่การเปรียบเปรยในบท — แต่ละอันเป็นยามรักษาความปลอดภัยที่จำได้ว่าให้คุณเข้า หรือเครื่องตรวจจับโลหะที่คุณต้องผ่านอีกครั้งตอนออก?

**แบบฝึกหัด 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทมีเว็บแอปพลิเคชันที่รันบน EC2 instance ใน public subnet แอปพลิเคชันรับ HTTPS traffic (พอร์ต 443) จากอินเทอร์เน็ต user รายงานว่าเชื่อมต่อกับแอปพลิเคชันได้แต่ไม่ได้รับ response — คำขอค้างและ timeout

security group ของ EC2 มี inbound rule ที่อนุญาต TCP 443 จาก 0.0.0.0/0 NACL ของ subnet มี inbound rule (rule 100) ที่อนุญาต TCP 443 จาก 0.0.0.0/0 และ outbound rule (rule 100) ที่อนุญาต TCP 443 ไปยัง 0.0.0.0/0

สาเหตุที่น่าจะเป็นไปได้มากที่สุดของปัญหาคืออะไร?

A) security group ขาด outbound rule สำหรับ TCP 443  
B) EC2 instance ไม่มี Elastic IP address  
C) security group ขาด inbound rule สำหรับ ephemeral port  
D) NACL ขาด outbound rule ที่อนุญาต ephemeral port (1024-65535)

**คำใบ้ 1**: security group เป็น stateful — พวกมันอนุญาต response โดยอัตโนมัติ NACL เป็น stateless — พวกมันไม่

**คำใบ้ 2**: เมื่อเบราว์เซอร์เชื่อมต่อกับ web server บนพอร์ต 443 response ของเซิร์ฟเวอร์เดินทางกลับบน ephemeral port สุ่ม (1024-65535) ไม่ใช่พอร์ต 443

**คำใบ้ 3**: NACL มี outbound rule สำหรับ 443 แต่ response ไม่ไปยังพอร์ต 443

**คำตอบ**: D

**คำอธิบาย**: NACL เป็น stateless เมื่อ user เชื่อมต่อกับเซิร์ฟเวอร์บนพอร์ต 443 TCP response ของเซิร์ฟเวอร์เดินทางกลับบน ephemeral port (สุ่มเลือกจาก 1024-65535) กฎ outbound ของ NACL อนุญาตแค่พอร์ต 443 ดังนั้น response ถูกบล็อกโดยกฎ default deny การเพิ่มกฎ outbound NACL ที่อนุญาต TCP 1024-65535 จะแก้สิ่งนี้

**ทำไมไม่ใช่ A?** security group เป็น stateful — response traffic ถูกอนุญาตโดยอัตโนมัติไม่ว่ากฎ outbound จะเป็นอย่างไร ไม่ต้องการ outbound security group rule

**ทำไมไม่ใช่ B?** Elastic IP ส่งผลต่อว่า instance มี public IP หรือไม่ ไม่ใช่ว่าการเชื่อมต่อที่สร้างแล้วได้รับ response หรือไม่

**ทำไมไม่ใช่ C?** ephemeral port สำหรับ outbound response traffic ไม่ใช่ inbound การเชื่อมต่อ inbound จาก user เข้ามาบนพอร์ต 443 ซึ่งถูกอนุญาตอยู่แล้ว

*SAA-C03 Domain: ออกแบบสถาปัตยกรรมที่ปลอดภัย — Task 1.2*

**แบบฝึกหัด 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

หลังการโจมตี IP โรมาเนีย Priya อยาก implement การควบคุมเพิ่มสองอย่าง:

1. บล็อกทั้งช่วง IP 185.0.0.0/8 ไม่ให้ถึงทรัพยากรใดใน public subnet
2. รับประกันว่า private subnet ที่มีฐานข้อมูลไม่เคยสื่อสารกับอินเทอร์เน็ต แม้มีคนกำหนดค่า security group ผิด

คุณจะใช้เครื่องมือใดสำหรับแต่ละความต้องการ และคุณจะกำหนดค่าพวกมันอย่างไร? คุณใช้ security group สำหรับทั้งสองได้ไหม? คุณใช้ NACL สำหรับทั้งสองได้ไหม?

*(ไม่มีคำตอบที่ถูกต้องเพียงข้อเดียว เป้าหมายคือการเข้าใจว่าเครื่องมือใดเหมาะกับปัญหาใด)*

## ฉากหลังเครดิต

เหตุการณ์ถูกจำกัด deploy key ที่ถูก compromise ถูก deactivate ช่วง IP โรมาเนียถูกบล็อกที่ NACL script เก่าถูกเอาออกจาก EC2 instance

Priya เขียนรายงานเหตุการณ์ เธอแชร์มันกับทีม

บรรทัดสุดท้ายของรายงาน: "สาเหตุหลัก: credential ที่ใช้งานอยู่จาก deployment pipeline ที่ถูกปลดระวางไม่เคยถูกหมุนเวียนหรือเพิกถอน คำแนะนำ: การหมุนเวียน credential อัตโนมัติและการตรวจสอบ IAM credential ทั้งหมดเป็นประจำ"

Leo อ่านมันสามครั้ง

"ผมควรหมุนเวียน key นั้น" เขาพูด

"ใช่" Priya พูด

"เราจะมั่นใจว่าสิ่งนี้ไม่เกิดอีกได้ยังไง?"

"การ automate" เธอพูด "และบางอย่างที่เฝ้าดูผู้เฝ้าดู"

ในบทต่อไป: ตู้นิรภัยที่ Nimbus เก็บความลับของตน — และการหมุนเวียนที่ทำให้ key ที่ถูกขโมยไร้ประโยชน์
