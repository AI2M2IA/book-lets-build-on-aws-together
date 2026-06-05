# บทที่ 16: กุญแจ ล็อค และความลับ

Leo กำลังตรวจสอบประวัติ git เมื่อเขาพบมัน รหัสผ่านฐานข้อมูล commit มาหกเดือนที่แล้ว เป็นข้อความธรรมดา โดยคนที่ไม่ได้ทำงานที่ Nimbus แล้ว

นั่นคือวันที่พวกเขาตัดสินใจหยุดใส่ secrets ใน code

**สองปัญหา: การจัดเก็บ Secrets และการเข้ารหัสข้อมูล**

ความปลอดภัยรอบข้อมูลที่ละเอียดอ่อนมีสองปัญหาที่แตกต่างกัน:

**การจัดเก็บ credentials**: พวกมันอยู่ที่ไหน ใครสามารถเข้าถึงได้ จะหมุนเวียนอย่างไร?

**การเข้ารหัสข้อมูล**: จะมั่นใจได้อย่างไรว่าแม้ใครบางคนได้รับสิทธิ์เข้าถึงฐานข้อมูลโดยไม่ได้รับอนุญาต พวกเขาก็ไม่สามารถอ่านข้อมูลได้?

AWS มี service เฉพาะสำหรับแต่ละปัญหา:

- **AWS Secrets Manager**: จัดเก็บและจัดการ credentials อย่างปลอดภัย
- **AWS KMS (Key Management Service)**: จัดการ encryption keys

**AWS Secrets Manager**

Secrets Manager คือที่เก็บที่ปลอดภัยสำหรับ secrets แทนที่แอปพลิเคชันจะอ่านรหัสผ่านจากตัวแปรสภาพแวดล้อมหรือไฟล์ config มันเรียก Secrets Manager API เมื่อเริ่มต้นและดึง secret

**การหมุนเวียนอัตโนมัติ: พลังที่แท้จริง**

ทุก 30 วัน Secrets Manager สร้างรหัสผ่านฐานข้อมูลใหม่ อัพเดตใน RDS อัพเดต secret ที่เก็บไว้ และแอปพลิเคชันของคุณดึงรหัสผ่านใหม่ในครั้งต่อไปที่ต้องการ ไม่มีการแทรกแซงด้วยตนเอง

**AWS KMS**

AWS KMS จัดการ **cryptographic keys** — ค่าลับที่ใช้ในการเข้ารหัสและถอดรหัสข้อมูล

**AWS managed keys**: AWS สร้างและจัดการ key โดยอัตโนมัติสำหรับ services เช่น S3, EBS, RDS ฟรี

**Customer managed keys**: คุณสร้าง key ใน KMS และควบคุมทุกด้าน

**Envelope Encryption: วิธีที่ KMS ทำงานจริงๆ**

KMS ไม่ได้เข้ารหัสข้อมูลของคุณโดยตรงในกรณีส่วนใหญ่ มันใช้ **envelope encryption**:

1. KMS สร้าง **data key** (symmetric key ที่ไม่ซ้ำกัน)
2. Service ใช้ data key เพื่อเข้ารหัสข้อมูลของคุณในเครื่อง
3. Service ขอให้ KMS เข้ารหัส data key เอง
4. ทั้งข้อมูลที่เข้ารหัสและ data key ที่เข้ารหัสถูกเก็บไว้

## สรุป

- ไม่ควรเก็บ credentials ใน code ตัวแปรสภาพแวดล้อม หรือไฟล์ config ที่ commit
- **Secrets Manager** เก็บ credentials อย่างปลอดภัยและหมุนเวียนโดยอัตโนมัติ
- **KMS** จัดการ encryption keys AWS services ส่วนใหญ่รวม KMS สำหรับการเข้ารหัสขณะพัก
- **Envelope encryption**: KMS เข้ารหัส key ไม่ใช่ข้อมูลโดยตรง
- **Parameter Store** เป็นทางเลือกที่เบากว่าสำหรับค่า config ที่ไม่ใช่ secrets

## เคล็ดลับการสอบ

- **Secrets Manager กับ SSM Parameter Store**: Secrets Manager สำหรับ credentials ที่ต้องการการหมุนเวียนอัตโนมัติ Parameter Store สำหรับ config ทั่วไป
- **KMS key policies**: KMS key มี key policy ของตัวเอง IAM policy เพียงอย่างเดียวไม่ให้สิทธิ์เข้าถึง KMS key
- **การเข้ารหัส RDS**: ไม่สามารถเปิดใช้งานการเข้ารหัสบน RDS instance ที่ไม่ได้เข้ารหัสที่มีอยู่

## ฉากหลังเครดิต

Secrets ถูกย้าย

รหัสผ่านฐานข้อมูล: Secrets Manager หมุนเวียนทุก 30 วัน API keys: Secrets Manager ข้อมูลออร์เดอร์ลูกค้า: เข้ารหัสด้วย customer-managed KMS key Credentials เก่า: ถูก deactivate

"เราพร้อมตรวจสอบแล้ว" Priya พูด

ในบทต่อไป: สามชั้นการป้องกันที่ยืนอยู่ระหว่าง Nimbus และอินเทอร์เน็ต
