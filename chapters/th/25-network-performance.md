# บทที่ 25: ทางด่วนส่วนตัว

ลุกขึ้นยืนสักครู่ เขย่ามือออก

เราจะพูดถึงการเคลื่อนย้ายข้อมูล ไม่ใช่ระหว่างบริการใน AWS แต่ระหว่างโลกจริงกับ AWS ระหว่างสำนักงานของคุณกับ cloud infrastructure ระหว่างทวีป

ทีม infrastructure ของ Nimbus (ตอนนี้มีวิศวกรสี่คน) ทำงานจากสำนักงานส่วนรวมในซีแอตเทิล พวกเขาต้องเข้าถึง AWS infrastructure ที่ดูแลอยู่ บางการดำเนินการต้องเชื่อมต่อกับทรัพยากรใน VPC

ปัจจุบัน พวกเขาใช้ VPN บนแล็ปท็อปเพื่อเข้าถึง bastion host ใน public subnet จากนั้น SSH ไปยังทรัพยากรต่างๆ จากที่นั่น

มันทำงานได้ แต่ช้า การเชื่อมต่อ VPN เชื่อมผ่าน public internet: ซีแอตเทิล → ไฟเบอร์ข้ามประเทศ → carrier หลายจุด → us-east-1 แต่ละ round trip ใช้เวลา 80 มิลลิวินาทีขึ้นไป

"สำหรับ SSH ประจำวัน นั่นยอมรับได้" Leo พูด "แต่เราจะเริ่มย้ายฐานข้อมูล analytics ประวัติคำสั่งซื้อ 4 terabytes การย้ายผ่านการเชื่อมต่อนี้จะใช้เวลาหลายสัปดาห์"

"เราต้องการการเชื่อมต่อที่ดีกว่า" Maya พูด

"การเชื่อมต่อส่วนตัว" Priya เสริม "ไม่ผ่าน public internet"

ลองนึกภาพการเดินทางไปทำงาน Site-to-Site VPN เหมือนการขับรถบนถนนสาธารณะ: คุณล็อคประตูรถ (encryption) แต่คุณยังต้องแชร์เลนกับคนอื่น และการจราจรติดขัดทำให้ช้าลงอย่างคาดเดาไม่ได้ Direct Connect เหมือนการเช่าเลนส่วนตัวบนทางหลวง ไม่มีการแชร์การจราจร ความเร็วคงที่ และค่าผ่านทางรายเดือนที่สูงกว่า ส่วนใหญ่ถนนสาธารณะก็ใช้ได้ แต่เมื่อคุณขนรถบรรทุกสินค้ามีค่าในกำหนดเวลาที่แน่นอน คุณก็จ่ายค่าเลนส่วนตัว

**AWS Site-to-Site VPN: ตัวเลือกที่รวดเร็ว**

**AWS Site-to-Site VPN** สร้าง tunnel ที่เข้ารหัสระหว่างเครือข่าย on-premises กับ VPC ของคุณ โดยผ่าน public internet

การตั้งค่า:

1. สร้าง Virtual Private Gateway (VGW) แนบกับ VPC ของคุณ
2. สร้าง Customer Gateway ที่แทน router on-premises ของคุณ
3. สร้าง VPN tunnel สองอัน (เพื่อความซ้ำซ้อน) ระหว่างทั้งสอง

Traffic ถูกเข้ารหัส (AES-256) มันเดินทางผ่าน public internet ซึ่งหมายความว่า latency ขึ้นอยู่กับสภาพ internet AWS ให้ tunnel สองอันโดยอัตโนมัติเพื่อความซ้ำซ้อน — ถ้า tunnel หนึ่งมีปัญหา traffic จะเปลี่ยนไปยังอีก tunnel

**เมื่อควรใช้ Site-to-Site VPN**:

- ตั้งค่าได้รวดเร็ว (นาทีถึงชั่วโมง)
- คุ้มค่า ($0.05 ต่อชั่วโมงต่อการเชื่อมต่อ VPN)
- Bandwidth: สูงสุด 1.25 Gbps ต่อ tunnel
- Internet latency ที่ยอมรับได้สำหรับกรณีการใช้งาน

สำหรับการย้ายข้อมูล 4TB ของ Nimbus การใช้ VPN ผ่าน internet ที่ความเร็วสูงสุด 1.25 Gbps จะใช้เวลา: 4TB / 1.25 Gbps ≈ อย่างน้อย 7 ชั่วโมง โดยในสถานการณ์จริงกับ overhead จะใกล้ 12-20 ชั่วโมง ยอมรับได้ แต่การติดขัดบน public internet ทำให้ไม่แน่นอน

"ตัวเลือกอื่นคืออะไร?" Tom ถาม

**AWS Direct Connect: สายเฉพาะ**

**AWS Direct Connect** สร้างการเชื่อมต่อเครือข่ายส่วนตัวเฉพาะระหว่างที่ตั้งของคุณ (หรือ colocation facility) กับ AWS Traffic ไม่ผ่าน public internet เลย

Direct Connect คือการเชื่อมต่อทางกายภาพ — สายไฟเบอร์จากเครือข่ายของคุณไปยัง AWS Direct Connect location คุณทำงานร่วมกับผู้ให้บริการโทรคมนาคมเพื่อสร้าง physical circuit AWS ให้พอร์ตในฝั่งของตน

**ข้อดี**:

- Latency คงที่และคาดเดาได้ (ไม่มีความผันผวนของ public internet)
- ความเร็วตั้งแต่ 50 Mbps ถึง 100 Gbps
- ค่า data transfer ต่ำกว่า internet (อัตรา data transfer ของ Direct Connect ถูกกว่าอัตรา data transfer out มาตรฐานของ AWS)
- ปลอดภัยกว่า (วงจรส่วนตัว ไม่ใช่ public internet)

**ข้อเสีย**:

- การตั้งค่าใช้เวลาหลายสัปดาห์ถึงหลายเดือน (การจัดสรร physical infrastructure)
- ค่าใช้จ่ายสูงกว่า VPN อย่างมีนัยสำคัญ ($0.025-0.30 ต่อชั่วโมงต่อพอร์ต บวกค่า circuit โทรคมนาคม ซึ่งมักมีขั้นต่ำ $500-1,000 ขึ้นไปต่อเดือน)
- ไม่มีความซ้ำซ้อนในตัว (คุณต้องสร้าง circuit ซ้ำซ้อนเอง)
- ไม่เหมาะสำหรับสำนักงานที่กระจายทางภูมิศาสตร์โดยไม่มี circuit หลายเส้น

สำหรับ Nimbus: Direct Connect เกินความจำเป็นสำหรับขนาดปัจจุบันของพวกเขา แต่สำหรับองค์กรที่มีปริมาณ data transfer มากหรือมีข้อกำหนดด้านการปฏิบัติตามกฎระเบียบสำหรับการเชื่อมต่อเครือข่ายส่วนตัว Direct Connect จะคุ้มค่ากับต้นทุน

**Hosted Connections: ทางเลือกกลาง**

ไม่ใช่ทุกองค์กรที่สามารถให้สัญญา 100 Gbps dedicated fiber circuit ได้ **Direct Connect Hosted Connections** ช่วยให้ AWS Direct Connect Partners (บริษัทโทรคมนาคมที่ได้รับการอนุมัติ) จัดสรรการเชื่อมต่อที่ต่ำกว่า 1Gbps ที่คุณแชร์กับลูกค้าอื่น

การตั้งค่าเร็วกว่า (วันถึงสัปดาห์ ไม่ใช่เดือน) และค่าใช้จ่ายน้อยกว่าการเชื่อมต่อเฉพาะ ข้อเสีย: capacity ที่แชร์หมายความว่า throughput ไม่คงที่เท่า

สำหรับ Nimbus (เมื่อเติบโตขึ้น): การเชื่อมต่อ hosted 500 Mbps ผ่าน partner จะให้ connectivity ส่วนตัวในราคาที่สมเหตุสมผล

**AWS Transit Gateway: Hub-and-Spoke สำหรับ VPCs**

เมื่อ Nimbus เติบโตขึ้น พวกเขาจะสะสม VPC หลายอัน: production VPC, staging VPC, analytics VPC, security tooling VPC

หากไม่วางแผนอย่างรอบคอบ การเชื่อมต่อ VPC เหล่านี้ต้องการ VPC peering connections แบบ full mesh สำหรับ 4 VPC: 6 peering connections สำหรับ 10 VPC: 45 peering connections สำหรับ 20 VPC: 190 connections นี้ไม่สามารถ scale ได้

**AWS Transit Gateway** คือ network hub ที่เชื่อมต่อ VPC หลายอันและเครือข่าย on-premises แทนที่จะเป็น mesh ของ peering connections แต่ละ VPC เชื่อมต่อกับ Transit Gateway Transit Gateway ส่ง traffic ระหว่างกัน

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitive routing**: ถ้า VPC A และ VPC B เชื่อมต่อกับ Transit Gateway ทั้งคู่ พวกเขาสามารถสื่อสารกันได้ โดยไม่ต้องมี peer โดยตรง Transit Gateway จัดการ routing ต่างจาก VPC peering (ซึ่งไม่ใช่ transitive) Transit Gateway รองรับ hub-and-spoke topology

**ค่าใช้จ่าย Transit Gateway**: คิดค่าบริการต่อ attachment (VPC หรือการเชื่อมต่อ VPN/Direct Connect) บวกต่อ GB ของข้อมูลที่ประมวลผล ในระดับขนาดใหญ่ มันคุ้มค่ากับความเรียบง่าย

**VPC Endpoints: การเข้าถึงบริการ AWS แบบส่วนตัว**

ปัญหาต้นทุนและความปลอดภัยที่ละเอียดอ่อน: เมื่อ EC2 instance ของคุณ (ใน private subnet) เรียก S3 API นั้น traffic จะเชื่อมผ่าน NAT Gateway (เพื่อเข้าถึง internet ที่ S3 endpoint สาธารณะอยู่) คุณต้องจ่ายค่า NAT Gateway processing

**VPC Endpoints** ช่วยให้ทรัพยากรใน VPC ของคุณสื่อสารกับบริการ AWS แบบส่วนตัว โดยไม่ผ่าน public internet และไม่ต้องใช้ NAT Gateway

มีสองประเภท:

**Gateway endpoints** (ฟรี): สำหรับ S3 และ DynamoDB คุณเพิ่ม route ใน route table ที่ส่ง S3 หรือ DynamoDB traffic ไปยัง endpoint แทน NAT Gateway ฟรีในการสร้าง ฟรีในการใช้งาน

**Interface endpoints** (มีค่าใช้จ่าย): สำหรับบริการ AWS อื่นๆ (SQS, SNS, Secrets Manager, SSM เป็นต้น) สร้าง ENI (Elastic Network Interface) ใน subnet ของคุณพร้อม private IP Traffic ไปยังบริการใช้ private IP นี้ ค่าใช้จ่ายประมาณ $0.01 ต่อชั่วโมงต่อ AZ บวกค่า data processing

Tom สร้าง Gateway endpoints สำหรับ S3 และ DynamoDB ทันทีหลังจากเรียนรู้ว่าฟรี ค่า NAT Gateway data processing ลดลง 30%

**AWS Global Accelerator: การ Routing ที่ Edge**

เมื่อ Nimbus ให้บริการผู้ใช้ฝั่งตะวันตกจาก us-east-1 (เวอร์จิเนีย) latency อยู่ที่ 80ms ไม่ใช่เพราะเซิร์ฟเวอร์อยู่ไกลเกินไป แต่เพราะ public internet routing ระหว่างซีแอตเทิลและเวอร์จิเนียไม่เหมาะสม โดยเด้งผ่าน carrier networks หลายอัน

**AWS Global Accelerator** ใช้ backbone เครือข่ายส่วนตัวของ AWS (infrastructure เดียวกับที่ขับเคลื่อน CloudFront) เพื่อ route traffic ระหว่างผู้ใช้กับแอปพลิเคชัน AWS แทนที่จะใช้ public internet routing traffic จะเข้าสู่เครือข่าย AWS ที่ edge location ที่ใกล้ที่สุดและเดินทางตาม path ที่ optimize ไปยังแอปพลิเคชันของคุณ

สำหรับ Nimbus ผู้ใช้ในซีแอตเทิลจะ:

- **ไม่มี Global Accelerator**: Route ผ่าน public internet carriers → ประมาณ 80ms
- **มี Global Accelerator**: เข้า AWS edge ที่ใกล้ที่สุดในซีแอตเทิล → เดินทาง AWS backbone → ถึง us-east-1 → ประมาณ 45ms

Global Accelerator ไม่ cache เนื้อหา (นั่นคือ CloudFront) มัน optimize network path สำหรับ dynamic requests

**เมื่อควรใช้ Global Accelerator เทียบกับ CloudFront**:

- CloudFront: เนื้อหา static และที่ cache ได้, กรณีการใช้งาน CDN
- Global Accelerator: เนื้อหา dynamic, protocol ที่ไม่ใช่ HTTP (UDP, gaming, IoT) หรือเมื่อต้องการ static Anycast IP address

## จุดแข็งและข้อจำกัด

**Site-to-Site VPN**:

- ตั้งค่าได้รวดเร็ว ต้นทุนต่ำ
- Path ผ่าน public internet หมายความว่า latency ผันผวน
- เพดาน bandwidth จำกัด

**Direct Connect**:

- คงที่, ส่วนตัว, bandwidth สูง
- ตั้งค่าช้า ค่าใช้จ่ายประจำสูงมาก
- Physical circuit คือ single point of failure (เพิ่มความซ้ำซ้อน)

**Transit Gateway**:

- ทำให้การเชื่อมต่อ multi-VPC ง่ายขึ้นอย่างมาก
- Transitive routing (ต่างจาก VPC peering)
- ต้นทุนเพิ่มขึ้นสำหรับ attachment จำนวนมาก

**VPC Endpoints**:

- ประโยชน์ด้านความปลอดภัยและต้นทุนสำหรับ S3/DynamoDB (gateway endpoints ฟรี)
- ขจัดค่า NAT Gateway สำหรับ AWS service traffic

**Global Accelerator**:

- ปรับปรุง latency ของแอปพลิเคชัน dynamic สำหรับผู้ใช้ทั่วโลก
- Anycast IPs ที่คงที่ (ต่างจาก CloudFront ที่มี dynamic IPs)
- ค่าใช้จ่ายเพิ่มเติม ($0.025 ต่อชั่วโมงต่อ accelerator + data transfer)

## สรุป

- **Site-to-Site VPN**: Tunnel ที่เข้ารหัสผ่าน public internet ระหว่าง on-premises และ VPC ตั้งค่าได้รวดเร็ว ต้นทุนต่ำกว่า latency ผันผวน
- **Direct Connect**: การเชื่อมต่อไฟเบอร์ส่วนตัวเฉพาะไปยัง AWS Latency คาดเดาได้ bandwidth สูงกว่า ใช้เวลาหลายสัปดาห์ในการตั้งค่า ค่าใช้จ่ายสูงมาก
- **Transit Gateway**: Hub สำหรับการเชื่อมต่อ VPC และ on-premises รองรับ transitive routing ขยายได้ถึงหลายร้อย connections
- **VPC Endpoints**: การเข้าถึงบริการ AWS แบบส่วนตัวโดยไม่ใช้ NAT Gateway Gateway endpoints (S3, DynamoDB) ฟรี
- **Global Accelerator**: Route dynamic traffic ผ่าน AWS backbone เพื่อ latency ที่ต่ำและคงที่กว่าทั่วโลก

## เคล็ดลับสอบ

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **สัญญาณ VPN vs Direct Connect**: VPN = "เข้ารหัส traffic ไปยัง VPC", "ตั้งค่าได้รวดเร็ว", "คำนึงถึงต้นทุน" Direct Connect = "latency ต่ำคงที่", "data transfer ขนาดใหญ่", "การเชื่อมต่อส่วนตัว", "การปฏิบัติตามกฎระเบียบที่ต้องการเครือข่ายส่วนตัว"
- **Transit Gateway vs VPC Peering**: Peering ไม่ใช่ transitive (A→B→C ไม่อนุญาต A→C) Transit Gateway เป็น transitive "VPC หลายอันที่ต้องสื่อสารกัน" → Transit Gateway
- **VPC Gateway Endpoints**: ฟรี เฉพาะ S3 และ DynamoDB เท่านั้น เปลี่ยน route table ไม่มีค่าใช้จ่ายเพิ่ม สถานการณ์สอบ: "ลดค่า data transfer สำหรับการเข้าถึง S3 จาก private subnet" → Gateway Endpoint
- **Global Accelerator vs CloudFront**: Accelerator = dynamic content, non-HTTP, static IP, network optimization CloudFront = caching, HTTP content, CDN
- **Direct Connect + VPN**: คุณสามารถใช้ VPN เป็น backup สำหรับการเชื่อมต่อ Direct Connect ถ้า Direct Connect circuit ล้มเหลว traffic จะ failover ไปยัง VPN แพงกว่า VPN อย่างเดียว เชื่อถือได้มากกว่า Direct Connect อย่างเดียว
- **Direct Connect Gateway**: เชื่อมต่อ Direct Connect circuit กับ VPC หลายอันใน region หลายอันหรือหลาย account โดยไม่มีมัน Direct Connect circuit จะเชื่อมต่อกับ VGW เดียวใน region เดียว

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

อธิบายความแตกต่างระหว่าง AWS Site-to-Site VPN และ AWS Direct Connect ในสถานการณ์ใดที่คุณจะเลือกแต่ละอัน?

*(คำใบ้: ลองคิดเกี่ยวกับเวลาการตั้งค่า ต้นทุน ความสม่ำเสมอของ latency และข้อกำหนด bandwidth)*

**แบบฝึกหัดที่ 2 — ฝึกสอบ**

*สถานการณ์*: บริษัทบริการทางการเงินต้องการการเชื่อมต่อเครือข่ายส่วนตัวที่เข้ารหัสและเฉพาะจาก data center on-premises ไปยัง AWS พวกเขา transfer ข้อมูลทางการเงินที่ละเอียดอ่อน 500GB ต่อวัน การเชื่อมต่อต้องมี latency คงที่และคาดเดาได้ และต้องไม่ผ่าน public internet พวกเขายังต้องการการเชื่อมต่อสำรองในกรณีที่หลักล้มเหลว

สถาปัตยกรรมใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) Site-to-Site VPN พร้อม BGP routing และ VPN ที่สองเพื่อความซ้ำซ้อน  
B) Direct Connect connection พร้อม Site-to-Site VPN เป็น backup  
C) Site-to-Site VPN connections สองอัน ผ่าน internet provider ที่ต่างกัน  
D) Direct Connect Hosted Connection พร้อม Direct Connect Gateway

**คำใบ้ที่ 1**: "ต้องไม่ผ่าน public internet" — VPN traffic ผ่าน public internet (เข้ารหัส) เฉพาะ Direct Connect เท่านั้นที่เป็นส่วนตัว

**คำใบ้ที่ 2**: "Latency คงที่และคาดเดาได้" — VPN ผ่าน public internet มีประสิทธิภาพผันผวน Direct Connect คงที่

**คำใบ้ที่ 3**: "การเชื่อมต่อสำรอง" — แนวทางที่แนะนำเมื่อ Direct Connect เป็นหลักคืออะไร?

**คำตอบ**: B

**คำอธิบาย**: Direct Connect ให้การเชื่อมต่อส่วนตัวเฉพาะที่ไม่ผ่าน public internet ตอบสนองข้อกำหนดด้านความเป็นส่วนตัวและ latency Site-to-Site VPN เป็น backup ให้ความซ้ำซ้อน: ถ้า Direct Connect circuit ล้มเหลว traffic จะ failover ไปยัง VPN ที่เข้ารหัส นี่คือ HA pattern มาตรฐานสำหรับ Direct Connect

**ทำไมไม่ใช่ A?** Site-to-Site VPN traffic ผ่าน public internet ซึ่งละเมิดข้อกำหนด "ต้องไม่ผ่าน public internet"

**ทำไมไม่ใช่ C?** VPN connections สองอันผ่าน ISP ต่างกันยังคงผ่าน public internet แม้จะเข้ารหัส ไม่ตรงตามข้อกำหนดเครือข่ายส่วนตัว

**ทำไมไม่ใช่ D?** Hosted Connection ให้การเชื่อมต่อ Direct Connect แต่ตัวเลือก D ไม่มี backup Direct Connect อย่างเดียวโดยไม่มี backup คือ single point of failure สายไฟเบอร์อาจถูกตัด

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

Nimbus กำลังขยายตัวเพื่อมีทีมวิศวกรในซีแอตเทิล เบอร์ลิน และสิงคโปร์ แต่ละทีมต้องเข้าถึง:

- Production VPC (อ่านอย่างเดียวสำหรับ debugging)
- Staging VPC (เข้าถึงเต็มรูปแบบสำหรับการทดสอบ)
- Analytics VPC (อ่านอย่างเดียวสำหรับการรายงาน)

ออกแบบการเชื่อมต่อเครือข่าย คุณจะใช้ Transit Gateway ไหม? Direct Connect ในแต่ละ region หรือ Site-to-Site VPN? คุณจะบังคับการเข้าถึงแบบอ่านอย่างเดียวสำหรับ production ได้อย่างไร? (คำใบ้: นี่คือทั้งคำถามด้านเครือข่ายและ IAM)

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกออกแบบเครือข่าย multi-region, multi-team)*

## ฉากหลังเครดิต

การย้ายข้อมูลเสร็จสิ้นใน 14 ชั่วโมง

ไม่ใช่ผ่าน path ของ public internet ที่ช้า — Leo ใช้ AWS Snow Family (เครื่องจัดเก็บข้อมูลทางกายภาพที่ส่งไปยังและจาก AWS) สำหรับข้อมูลส่วนใหญ่ จากนั้น sync ส่วนที่เหลือผ่าน VPN

"คราวหน้า" เขาพูด "เราควรตั้ง Direct Connect"

Tom ค้นหาราคา

"พอร์ต 1Gbps เฉพาะราคา $216 ต่อเดือน" เขาพูด "บวกสายจากสำนักงานของเรา ซึ่งบริษัทโทรคมนาคมเสนอราคา $800 ต่อเดือน"

"ดังนั้นประมาณหนึ่งพันต่อเดือน"

"สำหรับสิ่งที่เราทำตอนนี้ อาจไม่คุ้ม แต่ถ้าเราเริ่ม transfer ข้อมูลมากกว่า 10TB ต่อเดือนระหว่างสำนักงานกับ AWS การประหยัดค่า data transfer บน Direct Connect จะชดเชยค่าใช้จ่ายได้"

"ดังนั้นเราตรวจสอบปริมาณ data transfer" Priya พูด "และกลับมาพิจารณาเมื่อถึงเกณฑ์"

"นั่นคือสถาปัตยกรรมที่ตระหนักถึงต้นทุน" Tom พูด

"นั่นคือจุดประสงค์ตลอดมา" Maya พูด

ในบทถัดไป: สิ่งที่เกิดขึ้นเมื่อคุณมีข้อมูลมากกว่าที่ฐานข้อมูลใดจะจัดเก็บได้ตามสมควร และคุณต้องทำความเข้าใจกับมันทั้งหมด
