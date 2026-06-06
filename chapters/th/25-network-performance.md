# บทที่ 25: ทางด่วนส่วนตัว

ลุกขึ้นยืนสักครู่ เขย่ามือออก

รู้สึกถึงระยะทางระหว่างปลายนิ้วของคุณกับบางสิ่งที่อยู่อีกฟากของประเทศ ลองนึกถึงการส่งข้อความที่ต้องเดินทางระยะทางนั้น หาทางผ่าน carrier handoffs นับโหล และกลับมาก่อนที่คุณจะทำงานต่อได้ ตอนนี้ลองนึกถึงการทำสิ่งนั้นหลายพันครั้งต่อวินาที

นั่นคือสิ่งที่ data transfer เป็นจริงๆ — ระยะทางทางกายภาพ infrastructure ทางกายภาพ ข้อจำกัดทางกายภาพ

เราจะพูดถึงการเคลื่อนย้ายข้อมูล ไม่ใช่ระหว่าง services ใน AWS แต่ระหว่างโลกจริงกับ AWS — ระหว่างสำนักงานของคุณกับ cloud infrastructure ระหว่างทวีป

---

ด้วยฐานข้อมูลที่ scale แล้วและต้นทุน storage ที่ลดลง Tom หันไปดูบิล networking แต่ Leo มีปัญหาที่เร่งด่วนกว่า — การย้ายข้อมูลออร์เดอร์ในอดีต 4 เทราไบต์ไปยัง AWS กำลังเผยให้เห็นขีดจำกัดของการเชื่อมต่อปัจจุบันของพวกเขา

---

ทีม infrastructure ของ Nimbus (ตอนนี้มีวิศวกรสี่คน) ทำงานจากสำนักงานร่วมในซีแอตเทิล พวกเขาต้องเข้าถึง AWS infrastructure ที่พวกเขาจัดการ บาง operations ต้องเชื่อมต่อกับ resources ใน VPC

ปัจจุบัน พวกเขาใช้ VPN บนแล็ปท็อปเพื่อเข้าถึง bastion host ใน public subnet จากนั้น SSH ไปยัง resources จากที่นั่น

มันทำงานได้ มันช้า การเชื่อมต่อ VPN เชื่อมผ่าน public internet: ซีแอตเทิล → carrier hops หลายจุด → us-west-2 Round trips ไม่สม่ำเสมอ — 30 ถึง 80 มิลลิวินาทีขึ้นอยู่กับชั่วโมง — และ throughput ถูกจำกัดโดย office uplink และ public path

"สำหรับ SSH ประจำวัน นั่นยอมรับได้" Leo พูด "แต่เรากำลังจะเริ่มย้าย analytics database ของเรา ข้อมูลออร์เดอร์ในอดีต 4 เทราไบต์ ผ่านการเชื่อมต่อนี้ การ migrate จะใช้เวลาหลายสัปดาห์"

"เราต้องการการเชื่อมต่อที่ดีกว่า" Maya พูด

"การเชื่อมต่อส่วนตัว" Priya เสริม "ไม่ผ่าน public internet และถ้ามีคนพยายามเจาะเข้ามาในระหว่าง data transfer ล่ะ? ประวัติออร์เดอร์ 4TB ผ่าน public internet — แม้จะเข้ารหัส — รู้สึกเหมือนเป็นเป้าหมาย"

ลองนึกถึงมันเหมือนการเดินทางไปทำงาน Site-to-Site VPN เหมือนการขับรถบนถนนสาธารณะ: คุณล็อกประตูรถ (encryption) แต่คุณยังคงแชร์เลนกับทุกคน และรถติดทำให้คุณช้าลงอย่างคาดเดาไม่ได้ Direct Connect เหมือนการเช่าเลนส่วนตัวบนทางหลวง — ไม่มี traffic ที่แชร์ ความเร็วคงที่ และค่าผ่านทางรายเดือนที่สูงกว่า ส่วนใหญ่ถนนสาธารณะก็ใช้ได้ เมื่อคุณกำลังขนรถบรรทุกที่เต็มไปด้วยสินค้ามีค่าในกำหนดเวลาที่แน่น คุณจ่ายค่าเลนส่วนตัว

Snow Family คือตัวเลือกที่คนส่วนใหญ่ไม่พิจารณา: การเช่าเหมาเที่ยวบินขนส่งสินค้าจริง มันไม่ได้มีให้เสมอ มันไม่เหมาะสำหรับ loads เล็ก แต่สำหรับรถบรรทุกเต็มคัน มันมาถึงเร็วกว่าการขับรถและไม่ขึ้นอยู่กับสภาพทางหลวงเลย ฟิสิกส์ไม่ได้เปลี่ยน — คุณยังคงเคลื่อนย้าย bits เดียวกัน — แต่กลไกแตกต่างพื้นฐาน

**AWS Site-to-Site VPN: ตัวเลือกที่รวดเร็ว**

**AWS Site-to-Site VPN** สร้าง tunnel ที่เข้ารหัสระหว่างเครือข่าย on-premises ของคุณและ VPC ของคุณ ผ่าน public internet

การตั้งค่า:

1. สร้าง Virtual Private Gateway (VGW) แนบกับ VPC ของคุณ
2. สร้าง Customer Gateway ที่แทน on-premises router ของคุณ
3. สร้าง VPN tunnels สองอัน (เพื่อความซ้ำซ้อน) ระหว่างพวกมัน

Traffic ถูกเข้ารหัส (AES-256) มันเดินทางผ่าน public internet ซึ่งหมายความว่า latency ขึ้นอยู่กับสภาพ internet AWS ให้ tunnels สองอันโดยอัตโนมัติเพื่อความซ้ำซ้อน — ถ้า tunnel หนึ่งมีปัญหา traffic จะเปลี่ยนไปยังอีกอัน

**เมื่อใดควรใช้ Site-to-Site VPN**:

- ตั้งค่ารวดเร็ว (นาทีถึงชั่วโมง)
- คุ้มค่า ($0.05/ชั่วโมงต่อการเชื่อมต่อ VPN)
- Bandwidth: สูงสุด 1.25 Gbps ต่อ tunnel
- internet latency ที่ยอมรับได้สำหรับ use case

**Accelerated Site-to-Site VPN** route VPN traffic ผ่านเครือข่ายระดับโลกของ AWS แทนที่จะเป็น public internet — การ optimize เดียวกับที่ Global Accelerator ให้ นำมาใช้กับ VPN tunnels latency ต่ำกว่าและสม่ำเสมอกว่า standard VPN ค่าใช้จ่ายสูงกว่าเล็กน้อย (ค่า Global Accelerator data transfer นำมาใช้) สำหรับทีมที่ต้องการการตั้งค่าที่รวดเร็วและต้นทุนต่ำกว่าของ VPN แต่ต้องการ latency ที่ดีกว่า Accelerated VPN คือทางกลางในทางปฏิบัติระหว่าง standard VPN และ Direct Connect

สำหรับการ migrate 4TB ของ Nimbus, internet-based VPN ที่ 1.25 Gbps สูงสุดจะใช้เวลา: 4TB / 1.25 Gbps ≈ อย่างน้อย 7 ชั่วโมง โดย overhead ในโลกจริงใกล้เคียง 12-20 ชั่วโมง ยอมรับได้ แต่ความแออัดบน public internet path ทำให้คาดเดาไม่ได้

Leo คำนวณตัวเลขอย่างรอบคอบมากขึ้น เพราะการคำนวณเชิงทฤษฎีและเวลา transfer จริงไม่เคยตรงกันสักครั้งในประสบการณ์ของเขา

**เชิงทฤษฎี**: 4 TB = 4,096 GB = 32,768 Gb ที่ 1 Gbps: 32,768 วินาที ≈ 9.1 ชั่วโมง ปัดเป็น 9 ชั่วโมง

**จริง**: Leo รัน test transfer สัปดาห์ก่อน — 50 GB จากสำนักงานซีแอตเทิลไป S3 เวลาเชิงทฤษฎีที่ความเร็ว upstream ที่วัดได้ (875 Mbps): 457 วินาที เวลาจริง: 724 วินาที Overhead factor: 1.58

นำมาใช้กับ 4TB transfer ที่ 875 Mbps upstream: 32,768 Gb / 0.875 Gbps × 1.58 overhead ≈ **59,200 วินาที ≈ 16.4 ชั่วโมง**

overhead มาจากหลายแหล่ง: TCP slow-start ตอนสร้างการเชื่อมต่อ, packet loss ที่ต้องการ retransmission (public path จากซีแอตเทิลไป us-west-2 เฉลี่ย 0.2% packet loss — เล็ก แต่ทวีคูณเหนือ packets หลายล้าน), HTTPS handshake overhead สำหรับแต่ละ multipart upload segment และเวลาประมวลผลให้ S3 ประกอบ multipart uploads

"สิบหกชั่วโมงไม่เป็นไรสำหรับการ migrate ครั้งเดียว" Leo พูด "ปัญหาจริงคือถ้า transfer ถูกขัดจังหวะที่ชั่วโมง 14"

S3 multipart upload แก้ปัญหาการขัดจังหวะ: ถ้า transfer ล้มเหลวที่ชั่วโมง 14 มีเพียงส่วนปัจจุบันที่ต้องอัปโหลดซ้ำ ส่วนก่อนหน้าถูกเก็บใน S3 และ transfer สามารถทำต่อได้ แต่ overhead ของการจัดการ multipart uploads เพิ่มประมาณ 3% ให้กับเวลา transfer รวม

การประมาณการในโลกจริงสุดท้าย: **ประมาณ 9 ชั่วโมงเชิงทฤษฎีผ่าน 1 Gbps internet, ประมาณ 17 ชั่วโมงจริง** — โดยคำนึงถึงความเร็ว upstream ที่วัดได้ 875 Mbps ของสำนักงาน, packet loss overhead และ multipart upload processing

Leo พิจารณาเรื่องนี้ครู่หนึ่ง จากนั้นเขาดูหน้า Snow Family pricing

"ตัวเลือกอื่นคืออะไร?" Tom ถาม

"เดี๋ยว — แต่*ทำไม*เราถึงต้องการอะไรมากกว่า VPN?" Maya ถาม "การ migrate 4TB เป็นเหตุการณ์ครั้งเดียว"

"มันไม่ใช่" Priya พูด "เมื่อข้อมูลอยู่ใน AWS ทีมยังคงต้องเข้าถึงมันทุกวัน และ VPN latency ทบต้น"

**AWS Direct Connect: สายเฉพาะ**

**AWS Direct Connect** สร้างการเชื่อมต่อเครือข่ายส่วนตัวเฉพาะระหว่างที่ตั้งของคุณ (หรือ colocation facility ของคุณ) และ AWS Traffic ไม่เคยแตะ public internet

Direct Connect คือการเชื่อมต่อทางกายภาพ — สายไฟเบอร์จากเครือข่ายของคุณไปยัง AWS Direct Connect location คุณทำงานร่วมกับ telecom provider เพื่อสร้าง physical circuit AWS ให้ port ในฝั่งของพวกเขา

**ข้อดี**:

- Latency ที่คงที่และคาดเดาได้ (ไม่มีความผันแปรของ public internet)
- ความเร็วตั้งแต่ 50 Mbps ถึง 100 Gbps (พร้อม native 400 Gbps dedicated ports ที่ locations ที่เลือกตั้งแต่ปี 2024)
- ค่า data transfer ต่ำกว่า internet (อัตรา Direct Connect data transfer ถูกกว่าอัตรา standard AWS data transfer out)
- ปลอดภัยกว่า (private circuit ไม่ใช่ public internet)

**Trade-offs**:

- การตั้งค่าใช้เวลาหลายสัปดาห์ถึงหลายเดือน (การจัดหา physical infrastructure)
- ต้นทุนสูงกว่า VPN อย่างมีนัยสำคัญ
- ไม่มีความซ้ำซ้อนในตัว (คุณสร้าง circuits ซ้ำซ้อนเอง)
- ไม่เหมาะสำหรับสำนักงานที่กระจายตัวทางภูมิศาสตร์โดยไม่มี circuits หลายอัน

คุณอาจสงสัยว่า: ถ้า Direct Connect เป็นสายไฟเบอร์ทางกายภาพ เกิดอะไรขึ้นถ้ามีคนตัดมันโดยบังเอิญ? นั่นคือปัญหา single-point-of-failure กับ circuit เดียว — ซึ่งเป็นเหตุผลที่การตั้งค่า production Direct Connect ใช้ circuits ซ้ำซ้อนใน paths ที่แยกตัวทางภูมิศาสตร์ หรือรักษา VPN เป็น backup สายอาจถูกตัด; ธุรกิจดำเนินต่อ

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถาม เขาค้นหามาแล้ว "dedicated 1Gbps port คือ $216/เดือน" เขาพูด "บวก circuit จากสำนักงานของเรา ซึ่ง telecom เสนอราคา $800/เดือน"

"ดังนั้นประมาณหนึ่งพันต่อเดือนรวม"

สำหรับ Nimbus: Direct Connect เกินจำเป็นสำหรับขนาดปัจจุบันของพวกเขา แต่สำหรับองค์กรที่มีปริมาณ data transfer มากหรือความต้องการ compliance สำหรับ private network connections, Direct Connect คุ้มค่า

**Hosted Connections: ทางกลาง**

ไม่ใช่ทุกองค์กรที่สามารถผูกมัดกับ 100 Gbps dedicated fiber circuit ได้ **Direct Connect Hosted Connections** อนุญาตให้ AWS Direct Connect Partners (telecoms ที่ได้รับอนุมัติ) จัดหาการเชื่อมต่อต่ำกว่า 1Gbps ที่คุณแชร์กับลูกค้าอื่น

การตั้งค่าเร็วกว่า (วันถึงสัปดาห์ ไม่ใช่เดือน) และต้นทุนน้อยกว่า dedicated connection trade-off: shared capacity หมายถึง throughput ที่สม่ำเสมอน้อยกว่า

สำหรับ Nimbus (เมื่อพวกเขาเติบโต): hosted 500 Mbps connection ผ่าน partner จะให้ private connectivity ในราคาที่สมเหตุสมผล

ความแตกต่างในทางปฏิบัติที่สำคัญตอนสอบ: Hosted Connections มีให้ในความเร็วตั้งแต่ 50 Mbps ถึง 10 Gbps (partners บางรายเสนอสูงถึง 25 Gbps) จัดหาโดย AWS Partner Dedicated Connections ไปยัง AWS โดยตรงและมีให้ที่ 1 Gbps, 10 Gbps และ 100 Gbps (บวก 400 Gbps ที่ locations ที่เลือก) สำหรับความเร็วต่ำกว่า 1 Gbps, Hosted Connection เป็นตัวเลือก Direct Connect เดียว — Dedicated Connections เริ่มที่ 1 Gbps ขั้นต่ำ

**AWS Transit Gateway: Hub-and-Spoke สำหรับ VPCs**

เมื่อ Nimbus เติบโต พวกเขาจะสะสม VPCs หลายอัน: production VPC, staging VPC, analytics VPC, security tooling VPC

หากไม่วางแผนอย่างระมัดระวัง การเชื่อมต่อ VPCs เหล่านี้ต้องการ full mesh ของ VPC peering connections สำหรับ 4 VPCs: 6 peering connections สำหรับ 10 VPCs: 45 peering connections สำหรับ 20 VPCs: 190 connections สิ่งนี้ scale ไม่ได้

**AWS Transit Gateway** คือ network hub ที่เชื่อมต่อ VPCs หลายอันและเครือข่าย on-premises แทนที่จะเป็น mesh ของ peering connections แต่ละ VPC เชื่อมต่อกับ Transit Gateway Transit Gateway route traffic ระหว่างพวกมัน

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitive routing**: ถ้า VPC A และ VPC B เชื่อมต่อกับ Transit Gateway ทั้งคู่ พวกมันสามารถสื่อสารได้ — โดยไม่มี peer โดยตรง Transit Gateway จัดการ routing ต่างจาก VPC peering (ซึ่งไม่ใช่ transitive) Transit Gateway เปิดให้มี hub-and-spoke topology

**ค่าใช้จ่าย Transit Gateway**: คิดต่อ attachment (VPC หรือ VPN/Direct Connect connection) บวกต่อ GB ของข้อมูลที่ประมวลผล ที่ scale มันคุ้มกับความเรียบง่าย

สำหรับ Nimbus เหตุการณ์ที่ trigger Transit Gateway คือการเพิ่ม VPC ที่สี่ พวกเขามี: production, staging, analytics และตอนนี้ security tooling (VPC สำหรับ vulnerability scanning และ SOC2 compliance monitoring ที่ไม่ควรอยู่บน network segment เดียวกับ production)

หากไม่มี Transit Gateway การเชื่อมต่อสี่ VPCs ต้องการหก peering connections:
- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

หก peering connections, หก route table entries ต่อ VPC, หก security group rules ที่ต้อง review และ VPC peering ไม่ใช่ transitive: ถ้า Production และ Analytics เป็น peer และ Analytics และ Security เป็น peer, Production เข้าถึง Security ผ่าน Analytics VPC ไม่ได้ คุณต้องการ Production ↔ Security peering อย่างชัดเจน

ด้วย Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

สี่ attachments หนึ่ง route table ที่ต้องจัดการ Transitive routing: Production เข้าถึง Security ผ่าน Transit Gateway โดยไม่มี peer โดยตรง

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่าน Transit Gateway ล่ะ?" Priya ถาม "ถ้าทั้งสี่ VPCs แชร์ Transit Gateway, resource ที่ถูกบุกรุกใน Staging VPC สามารถเข้าถึง Production ได้"

Transit Gateway รองรับ **route tables พร้อม isolation**: คุณสามารถกำหนดว่า VPCs ใดได้รับอนุญาตให้สื่อสารผ่าน Transit Gateway และตัวใดถูกแยก security tooling VPC สามารถเข้าถึงตัวอื่นทั้งหมด (มันต้อง scan พวกมัน) Staging เข้าถึง Production ไม่ได้ Production เข้าถึง Analytics โดยตรงไม่ได้ (Analytics query ข้อมูลผ่าน read-only endpoint เฉพาะ)

"หนึ่ง Transit Gateway" Priya พูด "พร้อม routing policies ที่แสดงออก access model จริง เทียบกับหก peering connections โดยไม่มีวิธีรวมศูนย์ในการ audit ว่าอะไรเข้าถึงอะไร"

**VPC Endpoints: การเข้าถึง AWS Services แบบส่วนตัว**

ปัญหาต้นทุนและความปลอดภัยที่ละเอียดอ่อน: เมื่อ EC2 instance ของคุณ (ใน private subnet) เรียก S3 API, traffic นั้น route ผ่าน NAT Gateway (เพื่อเข้าถึง internet ที่ public endpoint ของ S3 อยู่) คุณจ่ายค่า NAT Gateway processing

**VPC Endpoints** อนุญาตให้ resources ใน VPC ของคุณสื่อสารกับ AWS services แบบส่วนตัว โดยไม่ผ่าน public internet — และไม่มี NAT Gateway

สองประเภท:

**Gateway endpoints** (ฟรี): สำหรับ S3 และ DynamoDB คุณเพิ่ม route ใน route table ของคุณที่ส่ง S3 หรือ DynamoDB traffic ไปยัง endpoint แทน NAT Gateway ฟรีในการสร้าง; ฟรีในการใช้

**Interface endpoints** (มีราคา): สำหรับ AWS services อื่น (SQS, SNS, Secrets Manager, SSM ฯลฯ) สร้าง ENI (Elastic Network Interface) ใน subnet ของคุณพร้อม private IP Traffic ไปยัง service ใช้ private IP นี้ ค่าใช้จ่าย ~$0.01/ชั่วโมงต่อ AZ บวก data processing

Leo สร้าง Gateway endpoints แล้วสัปดาห์ก่อนโดยไม่อัปเดต route tables "ผม deploy มันแล้ว — โอ้" เขาพูด ตรวจสอบ configuration "routes ไม่ได้ถูกอัปเดต ขอผมแก้ตรงนั้น"

Tom สร้าง Gateway endpoints สำหรับ S3 และ DynamoDB ทันทีหลังจากเรียนรู้ว่าฟรี ค่า NAT Gateway data processing ลดลง 65%

การคำนวณว่าทำไม: Lambda functions และ ECS tasks ของ Nimbus ใน private subnets กำลังทำ requests อย่างต่อเนื่องไปยัง S3 (อ่าน config files, เขียน log exports) และไปยัง DynamoDB (อ่านข้อมูลร้านอาหาร, เขียน order records) แต่ละ request route ผ่าน NAT Gateway ซึ่งคิด $0.045 ต่อ GB ของข้อมูลที่ประมวลผล

NAT Gateway data processing รายเดือนของ Nimbus: 533 GB ค่าใช้จ่าย: $24/เดือน หลังจากเพิ่ม S3 และ DynamoDB Gateway Endpoints และอัปเดต route tables: S3 และ DynamoDB traffic หลีกเลี่ยง NAT Gateway ทั้งหมด NAT Gateway processing รายเดือนลดลงเหลือ 187 GB — traffic ที่เหลือคือ API calls ไปยัง services อื่น (Secrets Manager, SES, external webhooks) ค่าใช้จ่าย: $8.40/เดือน

ประหยัด: $15.60/เดือน, $187/ปี สำหรับ Gateway Endpoint configurations ฟรีสองอันที่ใช้เวลา 10 นาทีในการตั้งค่า

"ฟรี" Tom พูด เป็นครั้งที่สาม

"Gateway endpoints ฟรีในการสร้างและฟรีในการใช้" Leo ยืนยัน "พวกมันไม่ใช่แค่การปรับปรุงความปลอดภัย — การ route S3 และ DynamoDB traffic ผ่าน private endpoint แทน NAT Gateway นำมันออกจาก public internet ทั้งหมด"

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่าน NAT Gateway traffic ล่ะ?" Priya ถาม "ถ้า traffic ไปยัง S3 ผ่าน NAT มันสามารถเข้าถึงได้จาก internet ผ่าน Gateway Endpoint มันเป็นส่วนตัว"

นี่คือประโยชน์รองของ Gateway Endpoints ที่บางครั้งการอภิปรายเรื่องต้นทุนบดบัง Traffic ไปยัง S3 และ DynamoDB ผ่าน VPC Gateway Endpoint ไม่เคยออกจากเครือข่าย AWS ไม่เคยผ่าน public IP address และถูกควบคุมโดย endpoint policy (resource-based policy ที่สามารถจำกัดว่า S3 buckets หรือ DynamoDB tables ใดที่ endpoint เข้าถึงได้) Gateway Endpoint บน bucket ที่เก็บข้อมูลลูกค้าเพิ่มชั้นพิเศษ: แม้มี bucket policy ที่ตั้งค่าผิด endpoint policy สามารถจำกัดการเข้าถึงไปยัง traffic ที่มาจากภายใน VPC เฉพาะ

**AWS Global Accelerator: การ Routing ที่ Edge**

เมื่อ Nimbus ให้บริการผู้ใช้ East Coast จาก us-west-2 (ออริกอน) latency คือ 80ms ไม่ใช่เพราะเซิร์ฟเวอร์อยู่ไกลเกินจำกัด แต่เพราะ public internet routing ระหว่างบอสตันและออริกอนไม่เหมาะสม เด้งผ่าน carrier networks หลายอัน

**AWS Global Accelerator** ใช้ private global backbone ของ AWS — เครือข่ายแบบกระจายของ edge locations ที่ route traffic ไปยังแอปพลิเคชันของคุณผ่าน paths ที่ AWS ควบคุมแทนที่จะเป็น public internet carrier hops แทนที่จะเป็น public internet routing, traffic เข้าสู่เครือข่ายของ AWS ที่ edge location ที่ใกล้ที่สุดและเดินทางตาม optimized private path ไปยังแอปพลิเคชันของคุณ

สำหรับ Nimbus ผู้ใช้ในบอสตันจะ:

- **ไม่มี Global Accelerator**: Route ผ่าน public internet carriers → ~80ms
- **มี Global Accelerator**: เข้า AWS edge ที่ใกล้ที่สุดในบอสตัน → เดินทาง AWS backbone → ถึง us-west-2 → ~60ms

Global Accelerator ไม่ cache เนื้อหา (นั่นคือ CloudFront) มัน optimize network path สำหรับ dynamic requests

Leo รันการเปรียบเทียบ latency ทั่วหลายเมืองหลังจากเปิด Global Accelerator สำหรับ Nimbus API:

| เมือง | ก่อน | หลัง | การปรับปรุง |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

การปรับปรุงรุนแรงที่สุดสำหรับผู้ใช้ที่อยู่ไกลทางภูมิศาสตร์ — Tokyo จาก 180ms เป็น 95ms, Sydney จาก 210ms เป็น 118ms สำหรับ Seattle (ใกล้ดาต้าเซ็นเตอร์ us-west-2 ในออริกอน) การปรับปรุงเล็กกว่า — มี public internet hops น้อยกว่าที่จะ optimize

"เดี๋ยว — แต่*ทำไม* Tokyo ถึงได้การปรับปรุง 47%?" Maya ถาม "ถ้าดาต้าเซ็นเตอร์ยังอยู่ใน us-west-2 ความเร็วแสงไม่ใช่ข้อจำกัดจริงหรือ?"

"ความเร็วแสงคือพื้น" Leo พูด "ข้อจำกัดจริงคือ public internet routing Traffic จาก Tokyo ไป us-west-2 ข้าม autonomous systems นับโหล — carriers ต่างกัน, routers ต่างกัน, peering agreements ต่างกัน แต่ละ hop เพิ่ม latency Global Accelerator route traffic จาก Tokyo edge location ไป us-west-2 ผ่าน private fiber ของ AWS ซึ่งมี paths สั้นกว่าและ routing ที่ปรับแต่งดีกว่า"

ขั้นต่ำเชิงทฤษฎีจาก Tokyo ไป us-west-2 (อิงจากความเร็วแสงผ่านไฟเบอร์ ประมาณ 15,500 กม. round trip): ~77ms 95ms ด้วย Global Accelerator กำลังเข้าใกล้ขั้นต่ำเชิงทฤษฎีนั้น 180ms โดยไม่มีมันสะท้อนความไม่มีประสิทธิภาพของ public internet routing ไม่ใช่กฎของฟิสิกส์

Global Accelerator ให้ static **anycast IP addresses** สองอันที่ route ไปยัง edge location ที่ใกล้ที่สุด ต่างจาก CloudFront (ซึ่งใช้ dynamic IP addresses ที่เปลี่ยน) IPs เหล่านี้เสถียร — มีประโยชน์สำหรับ firewall allowlisting และสำหรับแอปพลิเคชันที่ต้องการ IP คงที่ให้ clients เชื่อมต่อ

**เมื่อใดควรใช้ Global Accelerator เทียบกับ CloudFront**:

- CloudFront: เนื้อหา static และ cacheable, use case CDN
- Global Accelerator: เนื้อหา dynamic, protocols ที่ไม่ใช่ HTTP (UDP, gaming, IoT) หรือเมื่อคุณต้องการ static Anycast IP address

## การเคลื่อนย้ายข้อมูล ไม่ใช่แค่ Traffic: DataSync และ Transfer Family

ในขณะที่สถาปัตยกรรม networking กำลังเป็นรูปเป็นร่าง Maya มีโปรเจกต์ onboarding ร้านอาหารเชนใหม่สามรายลงมาพร้อมกัน แต่ละรายมีความต้องการการ migrate ข้อมูล — และแต่ละความต้องการแตกต่างกัน

เชนแรก Pacific Table ต้องการย้าย NFS file shares 40 TB ไป S3 file storage ปัจจุบันของพวกเขาอยู่ on-premises กระจายไปทั่ว file servers สี่ตัวในสำนักงานใหญ่ซีแอตเทิล Leo เริ่มเขียนแผนการ migrate

เชนที่สอง Marisol Group มีทีมบัญชีที่อัปโหลด invoices รายวันไปยัง local SFTP server SFTP workflow ทำงานมาตั้งแต่ปี 2015 เจ้าหน้าที่บัญชีรู้เรื่องเดียว: พวกเขาเปิด SFTP client ทุกเช้าเวลา 9 โมง ทิ้ง invoices และปิดมัน ไม่มีใครอยากเปลี่ยนสิ่งนี้ "นักบัญชีของพวกเขาใช้ WinSCP" Maya พูด "นั่นไม่ต่อรอง"

"นั่นคือสองเครื่องมือที่แตกต่างกัน" Priya พูด

"ใช่" Leo พูด "แต่ทั้งคู่มีอยู่"

**AWS DataSync: rsync ที่อัดสเตียรอยด์ พร้อม AWS Console**

สำหรับการ migrate 40 TB ของ Pacific Table ความท้าทายไม่ใช่ bandwidth — สำนักงานซีแอตเทิลมี upstream connection ที่แข็งแกร่ง ความท้าทายคือ orchestration: การค้นพบว่าไฟล์ใดมีอยู่ การ transfer พวกมันอย่างน่าเชื่อถือ การยืนยัน checksums การ schedule transfer เพื่อหลีกเลี่ยงการทำให้ office network อิ่มตัวในเวลาทำการ และการ monitor ความคืบหน้าเหนือสิ่งที่จะเป็นการทำงานต่อเนื่องหลายวัน

**AWS DataSync** เป็น agent-based data migration และ replication service คุณติดตั้ง DataSync agent ที่เบาใน on-premises environment ของคุณ — virtual machine ที่รันบน VMware หรือเป็น EC2 instance agent เชื่อมต่อกับ file servers ของคุณผ่าน NFS หรือ SMB ค้นพบ shares ของคุณ และ synchronize พวกมันไปยัง destination ใน AWS: S3 bucket, EFS filesystem หรือ FSx filesystem

ลองนึกถึงมันเป็น rsync ที่อัดสเตียรอยด์ พร้อม AWS console DataSync จัดการ:

- **Discovery**: agent inventory source shares ของคุณโดยอัตโนมัติ
- **Scheduling**: transfers สามารถทำงานตาม schedule ที่กำหนด (นอกเวลาทำการ) หรือต่อเนื่อง
- **Verification**: DataSync คำนวณ checksums ทั้งสองฝั่งและแจ้งเตือนคุณถึงความไม่สอดคล้องใดๆ
- **Monitoring**: ความคืบหน้า transfer, file counts, error reports และ bandwidth utilization มองเห็นได้ทั้งหมดใน console
- **Encryption in transit**: ข้อมูลทั้งหมดถูกเข้ารหัสโดยใช้ TLS ในระหว่าง transfer

สำหรับ Pacific Table, Leo ติดตั้ง DataSync agent บน VM ในเครือข่ายซีแอตเทิลของพวกเขา ชี้มันไปยัง NFS shares สี่อัน และตั้งค่า transfer schedule: 20:00 ถึง 06:00 ในวันธรรมดา ต่อเนื่องในวันหยุดสุดสัปดาห์ หลังจากหกวัน 40 TB ทั้งหมดลงใน S3 เขายืนยัน transfer ด้วย checksum report ในตัวของ DataSync ไม่มีความคลาดเคลื่อน

"แล้วสำหรับ replication ต่อเนื่องล่ะ?" Maya ถาม "Pacific Table จะยังคงเพิ่มไฟล์หลังการ migrate"

"DataSync รองรับ incremental transfers" Leo พูด "หลัง initial sync มันคัดลอกเฉพาะสิ่งที่เปลี่ยน เราสามารถรันมันทุกคืนเป็น replication job"

**AWS Transfer Family: SFTP Workflow ของคุณ ที่หนุนหลังด้วย S3**

สำหรับทีมบัญชีของ Marisol Group ความต้องการแตกต่าง ไม่มีใครย้ายออกจาก SFTP นักบัญชีจะใช้ WinSCP ต่อไป คำถามคือ: การอัปโหลด SFTP เหล่านั้นไปลงที่ไหน?

ปัจจุบัน พวกมันลงบน local Linux server ใน back office ของ Marisol ไฟล์จะถูกย้ายไปยังระบบบัญชีของพวกเขาด้วยตนเอง local server ต้องการการบำรุงรักษา backups และคนที่มี SSH access เพื่อจัดการมัน

**AWS Transfer Family** คือ fully managed SFTP, FTPS และ FTP server — หนุนหลังด้วย S3 หรือ EFS เป็น storage destination คุณจัดหา Transfer Family endpoint (มันได้ hostname และอาจมี static IP address) clients ของคุณเชื่อมต่อมันโดยใช้ SFTP software ที่มีอยู่ของพวกเขา เมื่อพวกเขาอัปโหลดไฟล์ ไฟล์เหล่านั้นลงโดยตรงใน S3 bucket

ทีมบัญชีไม่เปลี่ยนอะไร พวกเขายังคงเปิด WinSCP ทุกเช้าเวลา 9 โมง พวกเขายังคงเชื่อมต่อกับ SFTP server ด้วย credentials ที่มีอยู่ พวกเขายังคงทิ้ง invoices ใน folder เดียวกัน ความแตกต่างมองไม่เห็นสำหรับพวกเขา: ในฝั่งเซิร์ฟเวอร์ ตอนนี้ไฟล์ไปลงใน S3 โดยตรงแทนที่จะเป็น local Linux server

"และจาก S3 เราสามารถ trigger ที่เหลือของ workflow โดยอัตโนมัติ" Priya พูด "S3 event trigger Lambda function ที่ประมวลผล invoice และ insert มันเข้าระบบบัญชี ไม่มีขั้นตอนด้วยตนเอง"

"ดังนั้น workflow ของนักบัญชีไม่เปลี่ยน" Maya พูด "แต่ในฝั่งของเรา ทั้งหมดเป็นอัตโนมัติ"

"ใช่ และตัว SFTP server เองเป็น fully managed — ไม่มี patching ไม่มี backups ไม่มีเซิร์ฟเวอร์ให้บำรุงรักษา"

Tom ค้นหาราคามาแล้ว Transfer Family คิดต่อชั่วโมงของ endpoint availability บวกต่อ GB ที่ transfer สำหรับปริมาณ invoice ของ Marisol Group ค่าใช้จ่ายรายเดือนต่ำกว่า $30 มาก ต้นทุนของการบำรุงรักษา local server ที่มันแทนที่ — hardware depreciation, เวลาวิศวกรรมสำหรับการบำรุงรักษา, backup management — สูงกว่าอย่างมาก

---

> **เคล็ดลับการสอบ — DataSync และ Transfer Family**
>
> *SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.1)*
>
> - **DataSync** = การเคลื่อนย้ายข้อมูลจำนวนมากจาก on-premises ไป AWS (NFS หรือ SMB file shares → S3, EFS หรือ FSx) สัญญาณข้อสอบ: "migrate file shares," "replicate NFS data to S3," "on-premises to AWS data transfer," "ongoing replication of file data" DataSync ใช้ agent ที่ติดตั้ง on-premises; agent จัดการ discovery, scheduling และ verification
> - **Transfer Family** = การ transfer ไฟล์ต่อเนื่องโดยใช้ SFTP, FTPS หรือ FTP protocols โดยไม่เปลี่ยน client tools สัญญาณข้อสอบ: "existing SFTP workflow," "partners upload files via SFTP," "SFTP server backed by S3," "lift-and-shift SFTP," "เปลี่ยน file transfer process ไม่ได้" Transfer Family คือคำตอบเมื่อความต้องการคือ SFTP compatibility ไม่ใช่ปริมาณข้อมูล
> - **ความแตกต่างสำคัญ**: DataSync สำหรับ bulk migration และ replication (agent-based, schedule-driven, network-optimized) Transfer Family สำหรับ protocol-compatible file transfer services (endpoint-based, always-on, client-transparent) พวกมันแก้ปัญหาที่แตกต่างกัน
> - DataSync รองรับ S3, EFS และ FSx เป็น destinations Transfer Family รองรับ S3 และ EFS เป็น storage backends

---

**การ Migrate Servers ไม่ใช่แค่ไฟล์: 7 Rs และ MGN**

เชนที่สามใน pipeline ของ Maya ไม่ได้มีแค่ไฟล์ — มันมีทั้งเซิร์ฟเวอร์: custom reservations application ที่รันบนเครื่อง on-premises สองเครื่องที่ไม่มีใครอยากเขียนใหม่ก่อนการย้าย การย้าย*แอปพลิเคชัน*เป็นวินัยของตัวเอง และ AWS อธิบาย**เจ็ดวิธีในการ migrate** ("7 Rs") ที่คุณส่วนใหญ่แค่ต้องจดจำ:

- **Rehost** ("lift and shift"): ย้ายเซิร์ฟเวอร์ตามที่เป็น เร็วที่สุด เปลี่ยนน้อยที่สุด
- **Replatform** ("lift, tinker, and shift"): อัปเกรดเล็กน้อยระหว่างทาง — เช่นการย้าย self-managed database ไป RDS
- **Repurchase**: ทิ้งระบบเก่า ซื้อ SaaS แทน
- **Refactor**: ออกแบบใหม่แบบ cloud-native ใช้ความพยายามมากที่สุด ผลตอบแทนมากที่สุด
- **Retire**: ปรากฏว่าไม่มีใครใช้ ลบมัน
- **Retain**: ทิ้งไว้ที่เดิม ในตอนนี้
- **Relocate**: ย้ายที่ระดับ hypervisor โดยไม่เปลี่ยนอะไร

สำหรับกรณี rehost เครื่องมือคือ **AWS Application Migration Service (MGN)**: agent replicate disks ของ source servers, block ต่อ block เข้าสู่ low-cost staging area ใน AWS; คุณ launch test copies เมื่อใดก็ได้ที่คุณต้องการ; ตอน cutover, MGN แปลง replicated servers เป็น native EC2 instances Lift, shift, เสร็จ — การ refactor สามารถมาภายหลังบน cloud time (เพื่อนของมันสำหรับ portfolio planning, Application Discovery Service และ Migration Hub ปิดรับลูกค้าใหม่ในปลายปี 2025 — รู้จักชื่อพวกมันเป็น "inventory discovery" และ "central migration tracking" ถ้าข้อสอบกล่าวถึงพวกมัน)

---

**AWS Snow Family: ตัวเลือกทางกายภาพ**

ยังคงมีเรื่อง dataset ในอดีต 4TB และการประมาณการ internet 17 ชั่วโมง หลังจากคำนวณมัน Leo ได้ดูหน้า Snow Family pricing และตัดสินใจทันที

สำหรับ migrations เหนือไม่กี่เทราไบต์ที่เวลาสำคัญกว่าความเรียบง่าย AWS ส่ง physical storage appliances ไปยังที่ตั้งของคุณ คุณเติมข้อมูลให้พวกมัน คุณส่งกลับ AWS นำข้อมูลเข้า S3 โดยตรง

**Snowball Edge Storage Optimized**: 80 TB usable capacity, hardened enclosure ส่งไปยังที่ตั้งของคุณใน 2-5 วันทำการ คุณโหลดข้อมูลโดยใช้ local interface (NFS, S3 interface) คุณส่งมันกลับ AWS นำข้อมูลเข้าในประมาณ 1-3 วันทำการหลังรับ

สำหรับการ migrate 4TB ของ Nimbus กระบวนการ:

1. **Order** Snowball Edge ผ่าน AWS console (ใช้เวลา 2 นาที ส่งใน 3 วัน)
2. **Connect** appliance กับเครือข่ายสำนักงานซีแอตเทิล; มันปรากฏเป็น NFS mount point
3. **Copy** ข้อมูลออร์เดอร์ในอดีต 4TB โดยใช้ S3-compatible interface ของอุปกรณ์: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Copy เสร็จ** ในประมาณ 2 ชั่วโมง (local network, ไม่มี internet)
5. **Ship** appliance กลับไป AWS (รวม prepaid label)
6. AWS **นำข้อมูลเข้า** S3 ภายใน 72 ชั่วโมงหลังรับ
7. **Verify** — S3 ให้ job completion report ที่แสดงทุกไฟล์ที่ transfer และ checksum

เวลาที่ผ่านไปรวม: 3 วันสำหรับการส่ง + 2 ชั่วโมงในการคัดลอก + 1 วันการขนส่ง + 2 วันการนำเข้า = ประมาณ 7 วันปฏิทิน เทียบกับประมาณ 17 ชั่วโมงต่อเนื่อง — ซึ่งจะต้องการการเชื่อมต่อ internet ที่เสถียรไม่ขัดจังหวะ ทำให้ office uplink อิ่มตัวข้ามคืนและตลอดวันทำการส่วนใหญ่

ค่าใช้จ่าย: ค่าเช่าอุปกรณ์ Snowball Edge คือ $300 สำหรับ 10 วัน การขนส่ง (สองทาง): ประมาณ $80 S3 data transfer in ฟรี ต้นทุน migration รวม: **$380**

เปรียบเทียบกับประมาณ 17 ชั่วโมงของการใช้ internet 875 Mbps ต่อเนื่อง: VPN tunnel ฟรี ($0.05/ชั่วโมงแต่ tunnel ทำงานอยู่แล้ว); S3 transfer in ฟรี internet path "ฟรี" มีต้นทุนจริงในเวลาวิศวกรรม (การ monitor transfer 17 ชั่วโมง) ความเสี่ยง (การขัดจังหวะใดๆ ต้องการ restart) และ opportunity cost (internet connection ของพวกเขาอิ่มตัวในระหว่าง transfer window) Leo วาง order ว่ามันเป็นอย่างไรอยู่ในฉากหลังเครดิตของบทนี้

---

## จุดแข็งและข้อจำกัด

**Site-to-Site VPN**:

- ตั้งค่ารวดเร็ว ต้นทุนต่ำ
- public internet path หมายถึง latency ผันแปร
- เพดาน bandwidth จำกัด (1.25 Gbps ต่อ tunnel)
- ตัวเลือก Accelerated VPN ปรับปรุง latency ที่ต้นทุนสูงกว่าเล็กน้อย

**Direct Connect**:

- คงที่ ส่วนตัว bandwidth สูง
- ตั้งค่าช้า ต้นทุนประจำสูง
- physical circuit คือ single point of failure (เพิ่มความซ้ำซ้อนหรือรักษา VPN backup)
- break-even กับการประหยัด egress cost ที่ประมาณ 10-15 TB/เดือนขึ้นอยู่กับ pricing scenario

**AWS Snow Family**:

- สำหรับ migrations ครั้งเดียวเหนือ 1-2 TB มักเร็วกว่าและถูกกว่า network transfer
- ไม่มีการบริโภค internet bandwidth ในระหว่างการ migrate
- หน้าต่างเช่าอุปกรณ์ 10 วัน; prepaid shipping

**Transit Gateway**:

- ทำให้ multi-VPC connectivity ง่ายขึ้นอย่างมาก
- Transitive routing (ต่างจาก VPC peering)
- Isolation route tables อนุญาตให้ segmentation โดยไม่มี peering connections แยกต่างหาก
- ต้นทุนสะสมสำหรับ attachments จำนวนมาก

**VPC Endpoints**:

- ประโยชน์ด้านความปลอดภัยและต้นทุนสำหรับ S3/DynamoDB (gateway endpoints ฟรี)
- ขจัดค่า NAT Gateway สำหรับ AWS service traffic
- Endpoint policies เพิ่มชั้นควบคุมการเข้าถึงพิเศษเหนือ IAM และ bucket policies
- Interface endpoints สำหรับ services อื่น (Secrets Manager, SSM, SES) เก็บ traffic เป็นส่วนตัวแต่มีค่า ~$0.01/ชั่วโมงต่อ AZ

**Global Accelerator**:

- ปรับปรุง dynamic application latency สำหรับผู้ใช้ทั่วโลก: ปรับปรุง 33-47% ในทางปฏิบัติสำหรับผู้ใช้ที่อยู่ไกล
- Anycast IPs คงที่ (ต่างจาก dynamic IPs ของ CloudFront) — มีประโยชน์สำหรับ firewall allowlisting
- protocols ที่ไม่ใช่ HTTP (UDP, TCP) — CloudFront เป็น HTTP/HTTPS เท่านั้น
- ค่าใช้จ่ายเพิ่มเติม ($0.025/ชั่วโมงต่อ accelerator + data transfer)

## สรุป

งาน Aurora ในบทที่ 24 ปรับปรุงวิธีที่ Nimbus ให้บริการข้อมูลแก่แอปพลิเคชันของตัวเอง บทนี้เกี่ยวกับวิธีที่ข้อมูลเคลื่อนระหว่างโลกภายนอกและ AWS — และวิธีทำให้การเคลื่อนย้ายนั้นน่าเชื่อถือกว่า เร็วกว่า และถูกกว่า

- **Site-to-Site VPN**: Tunnel ที่เข้ารหัสผ่าน public internet ระหว่าง on-premises และ VPC ตั้งค่ารวดเร็ว ต้นทุนต่ำกว่า latency ผันแปร สอง tunnels เพื่อความซ้ำซ้อน สูงสุด 1.25 Gbps ต่อ tunnel
- **Direct Connect**: Private, dedicated fiber connection ไปยัง AWS Latency คาดเดาได้ bandwidth สูงกว่า ใช้เวลาหลายสัปดาห์ในการตั้งค่า ต้นทุนสูง break-even กับการประหยัด egress ของ VPN ที่ประมาณ 13.5 TB/เดือนสำหรับ pricing scenario ของ Nimbus
- **AWS Snow Family**: Physical storage appliances สำหรับ bulk data migration เร็วกว่า internet transfer สำหรับ migrations หลาย TB $380 รวมสำหรับการ migrate 4TB ของ Nimbus เทียบกับประมาณ 17 ชั่วโมงของ network saturation
- **Transit Gateway**: Hub สำหรับ VPC และ on-premises connectivity เปิดให้มี transitive routing (ต่างจาก VPC peering) รองรับ isolation route tables เพื่อควบคุมว่า VPCs ใดเข้าถึงตัวใด scale ถึงหลายร้อย connections
- **VPC Endpoints**: การเข้าถึง AWS services แบบส่วนตัวโดยไม่มี NAT Gateway Gateway endpoints (S3, DynamoDB) ฟรี — เพิ่มพวกมันให้ทุก VPC ที่เข้าถึง S3 หรือ DynamoDB ประหยัด Nimbus $15.60/เดือนและนำ S3/DynamoDB traffic ออกจาก NAT Gateway
- **Global Accelerator**: Route dynamic traffic ผ่าน AWS private backbone เพื่อ latency ที่ต่ำกว่าและสม่ำเสมอกว่าทั่วโลก Static Anycast IPs การปรับปรุง latency 33-47% สำหรับผู้ใช้ที่อยู่ไกล (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms) ไม่ใช่ CDN — ไม่ cache
- **AWS DataSync**: Agent-based service สำหรับการ migrate และ replicate on-premises NFS/SMB file data ไป S3, EFS หรือ FSx จัดการ scheduling, checksum verification, monitoring ใช้สำหรับ migrations ครั้งเดียวและ replication ต่อเนื่องของ file shares
- **AWS Transfer Family**: Managed SFTP, FTPS และ FTP server หนุนหลังด้วย S3 หรือ EFS อนุญาตให้ SFTP clients ที่มีอยู่อัปโหลดไฟล์ไป S3 โดยไม่เปลี่ยน workflow ของพวกเขา

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **สัญญาณ VPN vs Direct Connect**: VPN = "เข้ารหัส traffic ไปยัง VPC," "ตั้งค่ารวดเร็ว," "คำนึงถึงต้นทุน" Direct Connect = "consistent low latency," "data transfers ขนาดใหญ่," "private connection," "compliance ที่ต้องการ private network"
- **Transit Gateway vs VPC Peering**: Peering ไม่ใช่ transitive (A→B→C ไม่อนุญาต A→C) Transit Gateway เป็น transitive "VPCs หลายอันที่ต้องสื่อสารกัน" → Transit Gateway
- **VPC Gateway Endpoints**: ฟรี เฉพาะ S3 และ DynamoDB การเปลี่ยน route table ไม่มีค่าใช้จ่ายเพิ่ม scenario ข้อสอบ: "ลด data transfer costs สำหรับการเข้าถึง S3 จาก private subnet" → Gateway Endpoint
- **Global Accelerator vs CloudFront**: Accelerator = dynamic content, non-HTTP, static IP, network optimization CloudFront = caching, HTTP content, CDN
- **Direct Connect + VPN**: คุณสามารถใช้ VPN เป็น backup สำหรับ Direct Connect connection ถ้า Direct Connect circuit ล้มเหลว traffic จะ failover ไปยัง VPN แพงกว่า VPN อย่างเดียว น่าเชื่อถือกว่า Direct Connect อย่างเดียว
- **Direct Connect Gateway**: เชื่อมต่อ Direct Connect circuit กับ VPCs หลายอันข้าม regions หลายอันหรือ accounts โดยไม่มีมัน Direct Connect circuit เชื่อมต่อกับ VGW หนึ่งใน region หนึ่ง
- **AWS Snow Family**: "Large data migration," "transfer speed ช้าเกินไป," "petabyte-scale migration" → Snow Family Snowball Edge = สูงสุด 80TB คำนวณ transfer ก่อน: ถ้าการย้ายข้อมูลผ่านเครือข่ายที่มีอยู่จะใช้เวลาประมาณหนึ่งสัปดาห์หรือมากกว่า คำตอบคือ physical device *Reality check (2026)*: AWS กำลังเลิกใช้ตระกูลนี้ — Snowmobile ถูกถอนในปี 2024, Snowcone ถูกยกเลิกในปลายปี 2024 และ ณ พฤศจิกายน 2025 Snow devices ไม่มีให้ลูกค้าใหม่อีกต่อไป (AWS ตอนนี้ชี้ไป DataSync ผ่าน fast links และไป **Data Transfer Terminals** สถานที่ปลอดภัยที่คุณนำ drives ของตัวเองมา) ชุดคำถาม SAA-C03 มีก่อนทั้งหมดนี้ ดังนั้นในข้อสอบ "หลายสัปดาห์ของ network transfer, bandwidth จำกัด" ยังคงชี้ไป Snowball
- **Transit Gateway route tables**: Transit Gateway รองรับ route tables หลายอันสำหรับ network segmentation สัญญาณข้อสอบ: "แยก production VPC จาก staging" พร้อม connectivity ที่แชร์ผ่าน Transit Gateway → route tables แยกต่างหาก
- **Global Accelerator fixed IPs**: ต่างจาก CloudFront, Global Accelerator ให้ static Anycast IPs สองอัน สัญญาณข้อสอบ: "แอปพลิเคชันต้องการ IP address คงที่ให้ clients allowlist" หรือ "UDP traffic" → Global Accelerator (CloudFront เป็น HTTP/HTTPS เท่านั้น)
- **สัญญาณ AWS DataSync**: "migrate NFS/SMB file shares ไป S3/EFS/FSx," "ongoing replication ของ on-premises file data," "agent-based file migration" DataSync ไม่ใช่สำหรับ protocol-compatible SFTP transfer — มันสำหรับ bulk file share migration และ replication
- **สัญญาณ AWS Transfer Family**: "existing SFTP workflow," "partners หรือ customers อัปโหลดไฟล์ผ่าน SFTP," "lift SFTP server ไป cloud โดยไม่เปลี่ยน client tools," "SFTP/FTPS/FTP หนุนหลังด้วย S3" Transfer Family ไม่ใช่ data migration tool — มันคือ managed protocol endpoint ความแตกต่าง: DataSync เคลื่อนย้ายข้อมูลจำนวนมากตาม schedule; Transfer Family ให้ always-on SFTP/FTP endpoint สำหรับการอัปโหลดไฟล์ต่อเนื่อง
- **MGN (Application Migration Service)**: "migrate VMs หลายร้อยตัวอย่างรวดเร็ว ไม่เปลี่ยน code," "rehost / lift-and-shift servers ไป EC2" → MGN (block-level replication, test launches, cutover ไป native EC2 instances) DataSync เคลื่อนย้าย*ไฟล์*; DMS เคลื่อนย้าย*ฐานข้อมูล*; MGN เคลื่อนย้าย*ทั้งเซิร์ฟเวอร์*

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — ทบทวน**

อธิบายความแตกต่างระหว่าง AWS Site-to-Site VPN และ AWS Direct Connect ในสถานการณ์ใดที่คุณจะเลือกแต่ละอัน?

*(คำใบ้: ลองคิดเกี่ยวกับเวลาการตั้งค่า ต้นทุน ความสม่ำเสมอของ latency และความต้องการ bandwidth)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทบริการทางการเงินต้องการ private, encrypted, dedicated network connection จาก data center on-premises ของพวกเขาไปยัง AWS พวกเขา transfer ข้อมูลทางการเงินที่ละเอียดอ่อน 500GB ต่อวัน การเชื่อมต่อต้องมี latency ที่คงที่และคาดเดาได้ และต้องไม่ผ่าน public internet พวกเขายังต้องการ backup connection ในกรณีที่ตัวหลักล้มเหลว

สถาปัตยกรรมใดตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) Site-to-Site VPN พร้อม BGP routing และ VPN ตัวที่สองเพื่อความซ้ำซ้อน  
B) Direct Connect Hosted Connection พร้อม Direct Connect Gateway  
C) Site-to-Site VPN connections สองอันผ่าน internet providers ที่แตกต่างกัน  
D) Direct Connect connection พร้อม Site-to-Site VPN เป็น backup

**คำใบ้ 1**: "ต้องไม่ผ่าน public internet" — VPN traffic ผ่าน public internet (เข้ารหัส) เฉพาะ Direct Connect เท่านั้นที่เป็นส่วนตัว

**คำใบ้ 2**: "consistent, predictable latency" — VPN ผ่าน public internet มีประสิทธิภาพผันแปร Direct Connect คงที่

**คำใบ้ 3**: "backup connection" — แนวทางที่แนะนำเมื่อ Direct Connect เป็นตัวหลักคืออะไร?

**คำตอบ**: D

**คำอธิบาย**: Direct Connect ให้ private, dedicated connection ที่ไม่ผ่าน public internet — ตอบสนองความต้องการด้านความเป็นส่วนตัวและ latency Site-to-Site VPN เป็น backup ให้ความซ้ำซ้อน: ถ้า Direct Connect circuit ล้มเหลว traffic จะ failover ไปยัง encrypted VPN นี่คือ HA pattern มาตรฐานสำหรับ Direct Connect

**ทำไมไม่ใช่ A?** Site-to-Site VPN traffic ผ่าน public internet ซึ่งละเมิดความต้องการ "ต้องไม่ผ่าน public internet"

**ทำไมไม่ใช่ B?** Hosted Connection ให้ Direct Connect connection แต่ตัวเลือก B ไม่รวม backup Direct Connect เดียวโดยไม่มี backup คือ single point of failure — สายไฟเบอร์อาจถูกตัด

**ทำไมไม่ใช่ C?** VPN connections สองอันผ่าน ISPs ที่แตกต่างกันยังคงผ่าน public internet แม้จะเข้ารหัส ไม่ตอบสนองความต้องการ private network

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus กำลังขยายตัวให้มีทีมวิศวกรรมระดับภูมิภาคในซีแอตเทิล เบอร์ลิน และสิงคโปร์ แต่ละทีมระดับภูมิภาคต้องเข้าถึง:

- Production VPC (อ่านอย่างเดียวสำหรับ debugging)
- Staging VPC (เข้าถึงเต็มสำหรับการทดสอบ)
- Analytics VPC (อ่านอย่างเดียวสำหรับการรายงาน)

ออกแบบ network connectivity คุณจะใช้ Transit Gateway ไหม? Direct Connect ในแต่ละ region หรือ Site-to-Site VPN? คุณจะบังคับการเข้าถึงแบบอ่านอย่างเดียวสำหรับ production อย่างไร? (คำใบ้: นี่เป็นทั้งคำถามด้านเครือข่ายและ IAM)

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกออกแบบเครือข่าย multi-region, multi-team)*

**ส่วนขยาย**: ทีมเบอร์ลินรายงานว่า VPN latency ของพวกเขาไปยัง production VPC (us-west-2) เฉลี่ย 160ms ที่ปริมาณข้อมูลเท่าไรที่ Accelerated Site-to-Site VPN หรือ Direct Connect Hosted Connection จะกลายเป็นตัวเลือกที่ดีกว่า? ค้นคว้าราคา Direct Connect Hosted Connection ปัจจุบันจาก AWS Partner ในยุโรป การปรับปรุง latency เพียงอย่างเดียวจะคุ้มกับต้นทุนที่ปริมาณข้อมูลที่คุณประมาณไหม?

## ฉากหลังเครดิต

การ migrate ข้อมูลเสร็จใน 8 วันปฏิทิน — 3 วันให้ Snowball Edge มาถึง, 94 นาทีในการคัดลอกข้อมูล, 4 วันให้ AWS รับอุปกรณ์และนำข้อมูลเข้า จากนั้น sync สุดท้ายของ delta ที่สะสมในขณะที่ Snowball อยู่ระหว่างการขนส่ง เวลาลงมือทำทั้งหมด: ต่ำกว่าสี่ชั่วโมง

ขั้นตอนสุดท้ายนั้นสำคัญ Snowball Edge คัดลอก point-in-time snapshot ของ dataset 4TB ในขณะที่มันอยู่ระหว่างการขนส่ง production database ยังคงทำงานต่อ — ออร์เดอร์ใหม่กำลังถูกวาง records ใหม่กำลังถูกสร้าง delta sync ผ่าน VPN คือ 12GB เสร็จใน 18 นาที

"bulk transfer คือ Snowball" Leo พูด "sync คือแค่ข้อมูลใหม่สุทธิจาก 8 วันที่ใช้"

"ผม deploy มันแล้ว — โอ้" Leo พูด ขณะดู copy เสร็จบน Snowball Edge หลัง 94 นาที "ผมควรตั้ง bandwidth throttle บน local copy เพื่อหลีกเลี่ยงการทำให้ office network อิ่มตัวในเวลาทำการ"

เขายังไม่ได้ตั้ง throttle internet สำนักงานไม่เป็นไร — Snowball เป็น local network operation แต่ network switch กลายเป็น bottleneck ชั่วครู่เมื่อ copy เข้าใกล้ 9 Gbps local throughput

"ประเด็น" เขาพูด หลังแก้การตั้งค่า throttle "คือไปรษณีย์ทางกายภาพเร็วกว่า internet เหนือปริมาณข้อมูลระดับหนึ่ง"

"นั่นทั้งชัดเจนหรือขัดสามัญสำนึก" Maya พูด "ขึ้นอยู่กับว่าคุณคิดเกี่ยวกับมันอย่างไร"

"คราวหน้า" Leo พูด "เราควรตั้ง Direct Connect"

Tom ไม่ได้เอื้อมไปหาเครื่องคิดเลข — เขาคำนวณตัวเลขมาแล้วก่อนหน้านี้ เมื่อ Direct Connect ขึ้นมาครั้งแรก: ประมาณหนึ่งพันต่อเดือน port บวก circuit

"สำหรับสิ่งที่เราทำตอนนี้ อาจไม่คุ้ม แต่ถ้าเราเริ่มเคลื่อนย้ายมากกว่า 10TB ต่อเดือนระหว่างสำนักงานกับ AWS การประหยัด data transfer บน Direct Connect จะชดเชยต้นทุน"

"ดังนั้นเรา monitor ปริมาณ data transfer" Priya พูด "และกลับมาทบทวนเมื่อมันข้าม threshold"

"นั่นคือ cost-aware architecture" Tom พูด

"นั่นคือประเด็นมาตลอด" Maya พูด

Priya ดูการ migrate จากอีกฟากของห้อง "คราวหน้าที่เราทำอะไรแบบนี้" เธอพูด "เราทำมันได้ไหมก่อนที่ข้อมูลจะอยู่ใน production และธุรกิจขึ้นอยู่กับมัน? การ migrate live data เสี่ยงกว่าการ migrate at-rest data เสมอ"

"มันไม่เคย at-rest เมื่อธุรกิจกำลังทำงาน" Leo พูด

"ฉันรู้" เธอพูด "นั่นคือประเด็น วางแผนการ migrate ก่อนที่คุณต้องการมัน ไม่ใช่หลังจากนั้น"

Tom คำนวณมาแล้วว่ามันจะมีค่าใช้จ่ายเท่าไรในการมีชุด infrastructure ที่สองใน us-east-1 ที่พร้อมรับการ migrate ได้ทุกเวลา เขาเก็บตัวเลขไว้กับตัวเองในตอนนี้ มีบทที่เร่งด่วนกว่าที่ต้องปิด

ในบทต่อไป: สิ่งที่เกิดขึ้นเมื่อคุณมีข้อมูลมากกว่าที่ฐานข้อมูลใดจะจัดเก็บได้ตามสมควร และคุณต้องทำความเข้าใจกับมันทั้งหมด
