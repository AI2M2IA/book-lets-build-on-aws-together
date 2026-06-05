# บทที่ 11: มุมส่วนตัวของคุณในคลาวด์

Priya มีกระดาษแผ่นหนึ่งที่มีภาพวาดอยู่

ไม่ใช่ภาพวาดที่ซับซ้อน สี่เหลี่ยมผืนผ้าที่มีป้ายว่า "AWS" ภายในสี่เหลี่ยมผืนผ้ามีกล่องหลายใบรวมกัน: EC2 instances ฐานข้อมูล RDS คลัสเตอร์ ElastiCache เส้นที่เชื่อมทุกอย่างเข้าด้วยกัน และนอกสี่เหลี่ยมผืนผ้า มีป้ายเดียว: "Internet"

เธอวางมันไว้ตรงกลางโต๊ะ

"นี่คือสิ่งที่เรามี" เธอพูด "ฐานข้อมูลของเรามี IP สาธารณะ ชั้น cache ของเราสามารถเข้าถึงได้จากอินเทอร์เน็ต EC2 instances ของเราทั้งหมดอยู่บนเครือข่ายแบน"

"ฟังดูโอเค" Leo พูด "เรามี security groups"

"Security groups ที่คุณกำหนดค่า" Priya พูด "ตอนกลางคืน ระหว่างการตั้งค่าเริ่มต้น"

Leo ไม่พูดอะไร

"เมื่อทุกอย่างอาศัยอยู่บนเครือข่ายสาธารณะแบน การกำหนดค่าผิดพลาดเพียงครั้งเดียวคือความแตกต่างระหว่างระบบที่ทำงานและระบบที่ทุกคนบนอินเทอร์เน็ตเข้าถึงได้"

**VPC คืออะไร?**

**Virtual Private Cloud (VPC)** คือส่วนที่แยกออกจากกันโดยตรรกะของ AWS cloud — เครือข่ายส่วนตัวที่คุณกำหนด ซึ่งเฉพาะทรัพยากรของคุณเท่านั้นที่เข้าถึงได้โดยค่าเริ่มต้น

เมื่อคุณสร้าง VPC คุณกำหนด:

**บล็อก CIDR**: ช่วงของ IP addresses ที่มีภายในเครือข่ายของคุณ

**Subnets**: การแบ่งย่อยของ VPC แต่ละอันได้รับส่วนหนึ่งของช่วง IP address

**Route tables**: กฎที่กำหนดว่า network traffic ไปที่ไหน

**Internet Gateway**: การเชื่อมต่อระหว่าง VPC และอินเทอร์เน็ตสาธารณะ

**Subnets: สาธารณะ vs ส่วนตัว**

**Public subnet** เชื่อมต่อกับ Internet Gateway และสามารถมีทรัพยากรที่มี IP สาธารณะ

**Private subnet** ไม่มีการเชื่อมต่ออินเทอร์เน็ตโดยตรง ทรัพยากรใน private subnet สามารถสื่อสารกับทรัพยากรอื่นใน VPC เท่านั้น

สำหรับ Nimbus การออกแบบชัดเจน: load balancer อยู่ใน public — ต้องรับ traffic จากอินเทอร์เน็ต EC2 instances อยู่ใน private — รับ traffic จาก load balancer เท่านั้น ฐานข้อมูลอยู่ใน private — รับ traffic จาก EC2 instances เท่านั้น

**NAT Gateway: Private Subnets ที่ยังสามารถดาวน์โหลด**

Private subnets ไม่สามารถเข้าถึงอินเทอร์เน็ต แต่บางครั้งพวกมันต้องการ EC2 instance ของคุณต้องการดาวน์โหลด software update

**NAT Gateway** (Network Address Translation) อยู่ใน public subnet ทรัพยากรใน private subnets สามารถส่ง outbound traffic ไปยัง NAT Gateway ซึ่งจะส่งต่อไปยังอินเทอร์เน็ต — แต่อินเทอร์เน็ตไม่สามารถเริ่มการเชื่อมต่อกลับมาได้

## สรุป

- **VPC** คือเครือข่ายส่วนตัวที่แยกออกจากกันโดยตรรกะใน AWS
- **Subnets** แบ่ง VPC ตาม Availability Zone Public subnets เชื่อมต่อกับ Internet Gateway; private subnets ไม่ได้
- วางทรัพยากรที่หันหน้าสู่อินเทอร์เน็ต (load balancers) ใน public subnets วางทุกอย่างอื่น (EC2, ฐานข้อมูล, caches) ใน private subnets
- **NAT Gateway** (ใน public subnet) ช่วยให้ทรัพยากร private เริ่มการเชื่อมต่ออินเทอร์เน็ตขาออก
- **VPC Peering** เชื่อมต่อสอง VPCs อย่างเป็นส่วนตัว ไม่ใช่ transitive

## เคล็ดลับการสอบ

- **Public vs private subnet**: ความแตกต่างคือ route table Public subnet มีเส้นทางไปยัง Internet Gateway Private subnet ไม่มี
- **การวาง NAT Gateway**: ต้องอยู่ใน *public* subnet เสมอ
- **VPC Peering ไม่ใช่ transitive**: การสอบจะอธิบาย VPCs สามอันและถามว่าพวกมันสามารถสื่อสารผ่านอันตรงกลางได้หรือไม่ — คำตอบคือไม่
- **VPC Endpoints**: ช่วยให้ทรัพยากร private เข้าถึง AWS services (S3, DynamoDB) โดยไม่ต้องผ่าน NAT Gateway

## ฉากหลังเครดิต

Priya ออกแบบเครือข่ายใหม่

สามวันต่อมา ทุกทรัพยากรอยู่ในตำแหน่งที่ถูกต้อง EC2 instances ใน private subnets Load balancers ใน public subnets RDS และ ElastiCache สามารถเข้าถึงได้เฉพาะจากชั้น application

Leo พยายาม SSH ไปยังฐานข้อมูลโดยตรง เขาทำไม่ได้ การเชื่อมต่อหมดเวลา

"ดี" Priya พูด

ในบทต่อไป: อินเทอร์เน็ตค้นหา Nimbus อย่างไร — กลไกที่มองไม่เห็นของ domain names
