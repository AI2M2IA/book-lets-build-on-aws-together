# บทที่ 14: ใครได้รับอนุญาตให้ทำอะไร

Tom มี access keys เปิดอยู่ในไฟล์ข้อความ พร้อมที่จะวาง

"คุณกำลังทำอะไร?" Priya ถาม

"EC2 instance ต้องการอ่านไฟล์ config จาก S3 ฉันกำลังใส่ credentials ในการกำหนดค่าเซิร์ฟเวอร์"

เธอมองหน้าจอสักครู่ "ปิดไฟล์นั้น"

"ถ้าใครบุกรุกเซิร์ฟเวอร์นั้น" เธอพูด "พวกเขาได้ keys เหล่านั้น และ keys เหล่านั้นสัมผัสกับทุกสิ่งที่ IAM user ได้รับอนุญาต"

Tom ปิดไฟล์

"มีวิธีที่ดีกว่า" เธอพูด "ตัวเซิร์ฟเวอร์เองสามารถมี role ได้ คิดว่ามันเหมือนตำแหน่งงาน — instance ไม่ต้องการ credentials เพราะระบบรู้แล้วว่ามันคืออะไรและอะไรที่มันได้รับอนุญาต"

**กลับมาที่ IAM: ภาพที่สมบูรณ์**

IAM policies เป็นเอกสาร JSON ที่ระบุว่า actions ใดได้รับอนุญาตหรือถูกปฏิเสธบน resources ใด:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

**ปัญหากับ "AdministratorAccess"**

`AdministratorAccess` ให้ทุก action บนทุก resource ถ้าสมาชิกทีมที่มี policy นี้ทำผิดพลาด — ลบ S3 bucket โดยไม่ตั้งใจ ยุติ EC2 instance ผิดเครื่อง — ไม่มีอะไรที่ AWS สามารถทำเพื่อหยุดพวกเขาได้

**IAM Roles: ข้อมูลประจำตัวสำหรับ Services**

EC2 instances ที่รัน Nimbus API ต้องการ:

- อ่านจาก DynamoDB (เมนู)
- เขียนไปยัง DynamoDB (ออร์เดอร์)
- วาง objects ใน S3 (ใบเสร็จ การอัพโหลด)
- เขียน logs ไปยัง CloudWatch
- อ่าน secrets จาก Secrets Manager

แทนที่จะสร้าง user ที่มี access key และเก็บมันบน EC2 instance — ฝันร้ายด้านความปลอดภัย — คุณสร้าง **IAM Role** สำหรับ EC2 instance พร้อมสิทธิ์เหล่านี้โดยเฉพาะ

**Permission Boundaries: การจำกัดสิ่งที่ Roles สามารถให้ได้**

**Permission boundaries** กำหนดสิทธิ์สูงสุดที่ข้อมูลประจำตัวใดๆ สามารถมีได้ แม้ว่า policies ที่แนบมากับข้อมูลประจำตัวจะกว้างกว่า สิทธิ์ที่มีผลจะถูกจำกัดด้วย permission boundary

**SCPs: Guardrails ระดับองค์กร**

**Service Control Policies (SCPs)** ใช้ guardrails ที่ส่งผลต่อ *ทุก* IAM entity ในบัญชี รวมถึง administrators

## สรุป

- หลีกเลี่ยง **AdministratorAccess** ใน production
- IAM policies ระบุ **Effect**, **Action** และ **Resource** — เจาะจงทั้งสาม
- EC2 instances, Lambda functions และ AWS services อื่นๆ ควรใช้ **IAM Roles** ไม่ใช่ access keys
- **Permission boundaries** จำกัดสิทธิ์สูงสุดที่ข้อมูลประจำตัวใดๆ สามารถมีได้
- **SCPs** ใช้ข้อจำกัดทั่วทั้งองค์กรที่แม้แต่ administrators ไม่สามารถแทนที่ได้

## เคล็ดลับการสอบ

- **IAM Roles สำหรับ EC2**: คำตอบมาตรฐานเมื่อ EC2 ต้องเข้าถึง S3, DynamoDB, Secrets Manager
- **ตรรกะการประเมิน policy**: Explicit Deny ชนะเสมอ
- **Permission boundaries**: ใช้เมื่อมอบหมายการจัดการ IAM
- **SCPs ไม่ให้สิทธิ์**: พวกมันแค่จำกัดเท่านั้น

## ฉากหลังเครดิต

Leo ใช้เวลาสุดสัปดาห์เขียน IAM ใหม่

วันจันทร์ ทุก service มี role ที่มีสิทธิ์ที่ต้องการอย่างเฉพาะเจาะจง

Priya ทบทวนงานของเขาเช้าวันอังคาร

"นี่ดี" เธอพูด

"ขอบคุณ" Leo พูด ด้วยความโล่งใจของคนที่ใช้เวลาสุดสัปดาห์ถูก JSON ทำให้ต่ำต้อย

"คุณทิ้งสิ่งหนึ่งไว้"

Leo เกร็ง

"deploy key เก่าจากเวอร์ชันแรก ใน GitHub Actions secret"

"อันนั้นถูก deactivate แล้ว"

Priya พิมพ์บางอย่าง "ใช่ไหม?"

การหยุดชั่วคราว

"ฉันจะสืบสวน" Leo พูด

ในบทต่อไป: ความแตกต่างระหว่างยามรักษาความปลอดภัยที่จำหน้าและประตูที่อ่านแค่บัตร
