# บทที่ 19: เครื่องออกบัตรคิว

Nimbus มีปัญหาที่ไม่รู้สึกว่าเป็นปัญหาจนกว่าออร์เดอร์จะได้รับความนิยม

ทุกครั้งที่มีการสั่งออร์เดอร์ API server ต้องทำ:

1. บันทึกออร์เดอร์ในฐานข้อมูล
2. ส่งการแจ้งเตือนไปยังแท็บเล็ตของร้านอาหาร
3. ส่งอีเมลยืนยันไปยังลูกค้า
4. อัพเดตแดชบอร์ดวิเคราะห์
5. บันทึกเหตุการณ์สำหรับการชำระเงิน

ทั้งหมดนี้ต้องเกิดขึ้นพร้อมกันก่อนที่ API จะตอบสนองลูกค้า ถ้า email service ช้า ลูกค้ารอ ถ้าแดชบอร์ดวิเคราะห์ล่ม ออร์เดอร์ล้มเหลว

"เราเชื่อมต่อกันอย่างแน่นหนา" Priya พูด "ถ้าขั้นตอนปลายน้ำขั้นตอนใดล้มเหลว ออร์เดอร์ทั้งหมดล้มเหลว"

**Amazon SQS: คิว**

**Amazon SQS (Simple Queue Service)** คือ managed message queue service

Flow พื้นฐาน:

1. **Producer** (API server) วางข้อความในคิว
2. API ตอบสนองลูกค้าทันที: "ยืนยันออร์เดอร์แล้ว!"
3. **Consumers** (worker services แยกต่างหาก) อ่านข้อความจากคิวและประมวลผล

**แนวคิดหลักของ SQS**

**Visibility timeout**: เมื่อ consumer อ่านข้อความ ข้อความจะ *ไม่ปรากฏ* ต่อ consumers อื่น

**Dead-letter queues (DLQ)**: ถ้าข้อความล้มเหลวในการประมวลผลมากเกินไป SQS จะย้ายมันไปยัง DLQ

**ประเภทคิว**:

**Standard queues**: Throughput สูงสุด ลำดับการส่ง best-effort

**FIFO queues**: ลำดับเข้าออกเคร่งครัด การส่งแบบ exactly-once

**Amazon SNS: เครื่องส่งสัญญาณ**

**Amazon SNS** คือ publish/subscribe messaging service ข้อความหนึ่งถูกส่งให้ *subscribers หลายคน* พร้อมกัน

**รูปแบบ SNS/SQS Fan-Out**

```
API Server
    |
    ↓
SNS Topic: "order-placed"
    |
    ↓ → SQS (notifications) → Worker
    ↓ → SQS (email)         → Worker
    ↓ → SQS (analytics)     → Worker
```

**แต่ละคิวเป็นอิสระ** ถ้า analytics service ช้า คิวของมันจะเต็ม แต่ notification และ email services ทำงานต่อไปโดยไม่ได้รับผลกระทบ

## สรุป

- **SQS** คือ managed queue Producer ส่งข้อความ; consumers อ่านและประมวลผลแบบ asynchronous
- **SQS Standard**: throughput สูง ลำดับ best-effort การส่ง at-least-once
- **SQS FIFO**: ลำดับเคร่งครัด การส่ง exactly-once throughput ต่ำกว่า
- **SNS** คือ pub/sub service ข้อความหนึ่ง subscribers หลายคนพร้อมกัน
- **SNS + SQS fan-out**: รูปแบบมาตรฐานสำหรับเหตุการณ์หนึ่งที่เรียก processing pipelines อิสระหลายอัน

## ฉากหลังเครดิต

Order flow ใหม่ทำงาน

ลูกค้าสั่งอาหาร API ตอบสนองใน 95 มิลลิวินาที

Analytics service มีบั๊กที่ทำให้มัน crash บนออร์เดอร์ที่มีตัวอักษรพิเศษ คิวของมันสะสมถึง 3,200 ข้อความ

ลูกค้าไม่รู้สึก

"นี่คือความหมายของการ decoupling" Priya พูด

ในบทต่อไป: ฟังก์ชันที่รันเฉพาะเมื่อมีคนเคาะประตู — และไม่เสียค่าใช้จ่ายอะไรเลยเมื่อไม่มี
