# บทที่ 12: อินเทอร์เน็ตค้นหาคุณได้อย่างไร

Nimbus กำลังทำงาน Load balancer มี IP สาธารณะ EC2 instances มี IP ส่วนตัว ฐานข้อมูลถูกล็อคใน private subnets Priya พยักหน้าเห็นด้วยกับแผนภาพเครือข่าย

Tom มองที่ URL ของ load balancer: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`

"นั่นคือสิ่งที่ลูกค้าพิมพ์ลงในเบราว์เซอร์ของพวกเขาหรือ?" เขาถาม

"นั่นคือสิ่งที่ AWS กำหนดโดยอัตโนมัติ" Maya พูด

"ฉันจะไม่ใส่สิ่งนั้นบนนามบัตร"

"ฉันก็ไม่"

พวกเขาต้องการ domain name พวกเขาซื้อ `eatnimbus.com` ตอนนี้พวกเขาต้องเชื่อมต่อชื่อนั้นกับ AWS infrastructure ของพวกเขา

**การเปรียบเปรยกับสมุดโทรศัพท์**

ก่อนสมาร์ทโฟน ทุกเมืองมีสมุดโทรศัพท์ ถ้าคุณต้องการติดต่อ "ร้านอาหาร Mario" คุณไม่ได้จำหมายเลขโทรศัพท์ — คุณค้นหาชื่อ ได้หมายเลข แล้วโทร

อินเทอร์เน็ตมีสมุดโทรศัพท์ของตัวเอง: **Domain Name System (DNS)**

DNS แปลชื่อที่มนุษย์อ่านได้ (เช่น `eatnimbus.com`) เป็น IP addresses ที่เครื่องอ่านได้ (เช่น `203.0.113.42`)

**พบกับ Route 53**

Amazon Route 53 คือ managed DNS service ของ AWS

Route 53 ทำหลายสิ่ง:

**การลงทะเบียน domain**: คุณสามารถซื้อ domain names ผ่าน Route 53 โดยตรง

**DNS hosting (hosted zones)**: คุณสร้าง *hosted zone* สำหรับ domain ของคุณ

**Health checks**: Route 53 สามารถตรวจสอบ endpoints และ route traffic ออกจากอันที่ไม่แข็งแรง

**Routing policies**: Route 53 รองรับกลยุทธ์การ routing หลายแบบ

**DNS Records**

**A record**: แมปชื่อเป็น IPv4 address

**CNAME record**: แมปชื่อเป็นชื่ออื่น

**Alias records**: ส่วนขยาย AWS เฉพาะสำหรับ DNS Alias record แมปชื่อโดยตรงกับทรัพยากร AWS และ Route 53 จัดการ dynamic IP resolution โดยอัตโนมัติ

**Routing Policies**

**Simple routing**: หนึ่ง record, หนึ่ง destination DNS มาตรฐาน

**Weighted routing**: แบ่ง traffic ระหว่าง destinations หลายอัน ตาม weight

**Latency-based routing**: Route ผู้ใช้ไปยัง AWS region ที่มีความหน่วงต่ำที่สุด

**Geolocation routing**: Route ตามตำแหน่งทางภูมิศาสตร์ของผู้ใช้

**Failover routing**: กำหนด primary และ secondary ถ้า primary ล้มเหลว health check traffic จะถูกเปลี่ยนเส้นทางไป secondary โดยอัตโนมัติ

## สรุป

- **DNS** แปล domain names เป็น IP addresses
- **Route 53** คือ managed DNS service ของ AWS
- **Alias records** แมปชื่อกับ AWS resources ที่มี dynamic IPs
- Routing policies นอกเหนือจาก DNS ธรรมดา: **weighted** (แบ่ง traffic), **latency-based** (ประสิทธิภาพ), **geolocation** (อธิปไตยข้อมูล), **failover** (disaster recovery)

## ฉากหลังเครดิต

`eatnimbus.com` มีชีวิต

Maya พิมพ์มันลงในเบราว์เซอร์ และหน้าสั่งอาหาร Nimbus โหลดขึ้น เธอสั่ง arepa จากร้านอาหารครอบครัว แค่เพื่อทดสอบ flow ออร์เดอร์ผ่าน ครัวได้รับมัน

Tom กำลังอ่านบันทึก health check ของ Route 53 "เวลาตอบสนองคือ 47 มิลลิวินาทีจาก us-east-1"

"นั่นเร็วไหม?" Maya ถาม

"สำหรับ DNS? ใช่"

"แต่สำหรับผู้ใช้ในซีแอตเทิล?"

Tom มองที่กราฟ latency "ประมาณ 80 มิลลิวินาที"

Maya คิดเกี่ยวกับเรื่องนั้น "ถ้าลูกค้าส่วนใหญ่ของเราอยู่บนฝั่งตะวันตก และเซิร์ฟเวอร์ของเราอยู่ในเวอร์จิเนีย..."

"ทุกคำขอเดินทางจากซีแอตเทิลไปเวอร์จิเนียและกลับมา" Leo พูดจากอีกด้านของห้อง "ความเร็วแสง คุณไม่สามารถเอาชนะฟิสิกส์ได้"

"ดังนั้นเราต้องการเซิร์ฟเวอร์ที่ใกล้กับซีแอตเทิลมากขึ้น"

"หรือบางสิ่งที่ใกล้กับซีแอตเทิลมากขึ้นที่ให้บริการเนื้อหาในนามของพวกเขา"

ความคิดนั้นลอยอยู่ในอากาศ

ในบทต่อไป: โกดังที่วางเนื้อหา Nimbus ห่างจากผู้ใช้ทุกคนเพียงมิลลิวินาทีเดียว ทุกที่
