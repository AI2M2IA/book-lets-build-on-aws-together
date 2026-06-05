# บทที่ 22: แผนผังที่รันตัวเอง

การยืนยันออร์เดอร์ที่ Nimbus ต้องการห้าสิ่งที่เกิดขึ้นตามลำดับ: เรียกเก็บเงินบัตร ส่งอีเมลยืนยัน แจ้งร้านอาหาร อัพเดตสินค้าคงคลัง และบันทึกธุรกรรมสำหรับการบัญชี ถ้าขั้นตอนที่สามล้มเหลว — ถ้าการแจ้งเตือนร้านอาหาร timeout — ขั้นตอนที่หนึ่งและสองเกิดขึ้นไปแล้ว

Leo มีชื่อสำหรับ bug ประเภทนี้: ความสำเร็จบางส่วน

**AWS Step Functions: การประสานงาน Workflows**

**AWS Step Functions** คือ serverless orchestration service ที่ประสานขั้นตอนของแอปพลิเคชันเป็น visual workflow

แต่ละขั้นตอนคือ **state** ใน **state machine**

แต่ละ state สามารถ:

- **รัน Lambda function** (รูปแบบที่พบบ่อยที่สุด)
- **รัน ECS task**
- **รอเวลาหรือเหตุการณ์เฉพาะ**
- **เลือกเส้นทาง** ตามเงื่อนไข
- **รัน branches แบบ parallel** พร้อมกัน
- **Retry เมื่อล้มเหลว** พร้อม backoff ที่กำหนดได้
- **Catch errors** และ route ไปยัง error-handling states

**Standard กับ Express Workflows**

**Standard workflows**: สูงสุดหนึ่งปี เป็นที่คงทน สามารถตรวจสอบและ audit ได้ at-least-once

**Express workflows**: สูงสุด 5 นาที throughput สูงกว่า เหมาะสำหรับ real-time event processing

## สรุป

- **Step Functions** orchestrate workflows หลายขั้นตอนเป็น state machines
- **Retry และ catch** ถูกสร้างไว้ในแต่ละ state
- **Standard workflows**: ระยะยาว (ถึง 1 ปี) เป็นที่คงทน at-least-once สำหรับกระบวนการธุรกิจที่สำคัญ
- **Express workflows**: ระยะสั้น (ถึง 5 นาที) throughput สูง สำหรับ high-volume event processing
- **Event-driven architecture** ใช้ SNS, SQS, Lambda และ EventBridge เพื่อ decouple systems รอบๆ events

## ฉากหลังเครดิต

Restaurant onboarding workflow ทำงาน

ในเดือนถัดมา พันธมิตรร้านอาหารใหม่ 12 รายลงทะเบียน สองรายมีความล้มเหลวระหว่างขั้นตอนการประมวลผลการชำระเงิน ในทั้งสองกรณี Step Functions บันทึกข้อผิดพลาดที่แน่นอน บันทึกสถานะการดำเนินการ

Leo แก้ไขสาเหตุหลักแล้ว retry การดำเนินการทั้งสองจากขั้นตอนสาม การดำเนินการเสร็จสิ้นใน 23 วินาทีแต่ละอัน ต่อจากที่ล้มเหลวพอดี

ในบทต่อไป: จะทำอย่างไรกับข้อมูลที่คุณไม่ได้เข้าถึงในตอนนี้ แต่แน่ใจว่าต้องการเก็บไว้ตลอดไป
