# บทที่ 15: ยามที่ประตู

deploy key เก่าจากเวอร์ชันแรกของ Nimbus ยังคงทำงานอยู่ มันโทร API สามครั้งสัปดาห์ที่แล้ว Leo ไม่รู้ว่าอะไรทำมัน

Priya ดึง VPC flow logs — บันทึก network traffic ที่แสดงทุกการเชื่อมต่อเข้าและออกจาก VPC

"วันอังคาร เวลา 02:17 น." เธอพูด "มีการเชื่อมต่อขาออกจาก EC2 instance ที่รัน API เก่าไปยัง IP address ในโรมาเนีย"

"นั่นไม่ใช่ infrastructure ของเรา" Leo พูด

"ไม่"

พวกเขาติดตามกลับ: deploy key เก่าถูกใช้เพื่ออัพโหลด script เล็กๆ ไปยัง EC2 instance script พยายาม scan ports บนเซิร์ฟเวอร์ใกล้เคียง การ scan ส่วนใหญ่ล้มเหลว

"Security groups บล็อกพวกมัน" Priya พูด "ผู้โจมตีเข้าถึง EC2 instance หนึ่งเครื่อง พวกเขาไม่สามารถเข้าถึงเครื่องอื่นได้เพราะ security groups อนุญาตเฉพาะ traffic จาก load balancer"

**สองชั้นของ Network Security**

ใน VPC คุณมีสองเครื่องมือที่แตกต่างกันสำหรับการควบคุม network traffic:

**Security Groups**: Virtual firewalls ที่แนบกับ resources แต่ละอัน ทำงานในระดับ resource

**NACLs (Network Access Control Lists)**: กฎ firewall ที่แนบกับ subnets ทำงานที่ขอบเขต subnet

การเข้าใจทั้งสองต้องการการเข้าใจความแตกต่างที่สำคัญหนึ่งอย่าง: **stateful กับ stateless**

**Stateful: Security Groups**

Security group เป็น **stateful**

เมื่อคุณอนุญาต inbound traffic บน port เฉพาะ response traffic ได้รับการอนุญาตขาออกโดยอัตโนมัติ

Security groups สามารถ **อนุญาต** traffic เท่านั้น — ไม่สามารถสร้าง explicit deny rules ได้

**Stateless: NACLs**

NACL เป็น **stateless**

เมื่อคุณอนุญาต inbound traffic บน port 8080 นั่นครอบคลุมเฉพาะขาเข้า Response (outbound traffic บน ephemeral ports) ต้องได้รับการอนุญาตอย่างชัดเจนด้วย outbound rule

NACL rules ถูกนับและประเมินตามลำดับ Rule ที่ตรงกันแรกชนะ

NACLs สามารถ **ปฏิเสธ** traffic ได้อย่างชัดเจน

## สรุป

- **Security Groups** เป็น stateful virtual firewalls สำหรับ resources แต่ละอัน Allow rules เท่านั้น ทุก rules ได้รับการประเมิน
- **NACLs** เป็น stateless firewalls สำหรับ subnets ทั้งหมด Allow และ Deny rules Rules ประเมินตามลำดับตัวเลข
- **Stateful** หมายความว่า response traffic ได้รับการอนุญาตโดยอัตโนมัติ **Stateless** หมายความว่าต้องอนุญาต traffic ทั้งสองทิศทางอย่างชัดเจน
- Security groups คือชั้นการควบคุมการเข้าถึงหลัก NACLs คือชั้นเพิ่มเติม

## เคล็ดลับการสอบ

- **Stateful กับ stateless**: นี่คือความแตกต่างที่ถูกทดสอบมากที่สุด
- **NACL rule order**: Rules ประเมินจากเลขน้อยสุดไปมากสุด
- **Ephemeral ports**: ข้อผิดพลาด NACL คลาสสิกคือการลืมอนุญาต outbound บน ports 1024-65535
- **Default NACL กับ custom NACL**: Default NACL อนุญาต traffic ทั้งหมด Custom NACL ปฏิเสธ traffic ทั้งหมดโดยค่าเริ่มต้น

## ฉากหลังเครดิต

เหตุการณ์ถูกควบคุม deploy key ที่ถูก compromise ถูก deactivate ช่วง IP โรมาเนียถูกบล็อกที่ NACL

Priya เขียนรายงานเหตุการณ์ บรรทัดสุดท้าย: "สาเหตุหลัก: credentials ที่ใช้งานอยู่จาก deployment pipeline ที่ถูกยกเลิกไม่เคยถูกหมุนเวียนหรือถูกเพิกถอน"

ในบทต่อไป: ตู้นิรภัยที่ Nimbus เก็บความลับของตน
