# บทที่ 17: ผู้เฝ้าระวัง

เหตุการณ์กับ IP โรมาเนียถูกจำกัด secret อยู่ใน Secrets Manager credential ถูกหมุนเวียน การควบคุมเครือข่ายถูกรัดกุม

แต่ Priya ถามคำถามที่ปิดบทที่ 16: "ถ้ามีอะไรผิดปกติปรากฏใน CloudTrail เราจะรู้ได้อย่างไร?"

คำตอบที่ซื่อสัตย์คือ: พวกเขาน่าจะไม่รู้

---

*ทุกอย่างที่ล็อกได้ถูกล็อกแล้ว secret อยู่ใน Secrets Manager encryption key อยู่ใน KMS network traffic ถูกควบคุมโดย security group และ NACL การป้องกันที่ขอบแข็งแกร่ง แต่การป้องกันที่ขอบสมมติว่าคุณรู้ว่าการโจมตีหน้าตาเป็นยังไงก่อนมันมาถึง คำถามที่ Priya ถามต่างออกไป: แล้วการโจมตีที่คุณไม่เห็นมาล่ะ?*

---

CloudTrail บันทึกเหตุการณ์หลายพันต่อวัน ไม่มีมนุษย์อ่านทั้งหมด Priya ตรวจด้วยมือทุกสัปดาห์ แต่นั่นหมายความว่าบางอย่างเกิดในวันอังคารและไม่ถูกสังเกตจนถึงวันจันทร์ถัดไป

"เราต้องการบางอย่างที่ดู log แทนเรา" เธอพูด

Maya เงยหน้าขึ้น "โดยอัตโนมัติ?"

"โดยอัตโนมัติ"

"แล้วถ้ามีคนพยายามบุกรุกล่ะ?" Priya พูดต่อ "ไม่ใช่แค่ credential ที่ถูก compromise — ถ้ามีคนเปิด DDoS ล่ะ? ถ้าพวกเขาเริ่ม probe API endpoint ของเราหาช่องโหว่ injection ล่ะ? ถ้าพวกเขาอยู่ข้างในแล้วและเราไม่รู้ล่ะ?"

"นั่นคือสามปัญหาที่ต่างกัน" Leo พูด

"ใช่" Priya พูด "และ AWS มีสามบริการที่ต่างกันเพื่อจัดการพวกมัน"

**สามหมวดหมู่ภัยคุกคาม**

ภัยคุกคามความปลอดภัยต่อแอปพลิเคชันคลาวด์มักแบ่งเป็นสามหมวด:

**การโจมตีเชิงปริมาณ (DDoS)**: ผู้โจมตีส่ง traffic มากเกินไปจนแอปพลิเคชันของคุณตอบสนองผู้ใช้ที่ถูกต้องไม่ได้ การโจมตีอาจเป็น HTTP request หลายล้านครั้ง หรือ flood ของ TCP SYN packet ที่ออกแบบมาเพื่อทำให้ connection table ของเซิร์ฟเวอร์หมด

**การโจมตีแอปพลิเคชัน (Exploits)**: ผู้โจมตีส่งคำขอที่สร้างขึ้นเฉพาะที่ออกแบบมาเพื่อใช้ประโยชน์จากจุดอ่อนในแอปพลิเคชันของคุณ — SQL injection, cross-site scripting, input ที่ผิดรูปแบบที่ทำให้ parser crash

**ความผิดปกติทางพฤติกรรม (Reconnaissance และการ compromise)**: API call ที่ไม่ควรเกิดขึ้น (มีคน query ฐานข้อมูล user ทั้งหมดของคุณตอนตีสาม) กิจกรรม IAM ผิดปกติ (credential ถูกใช้จากประเทศใหม่) หรือ network traffic ไปยังปลายทางที่ไม่คาดคิด

AWS มีบริการเฉพาะสำหรับแต่ละอัน:

- **AWS Shield**: ป้องกัน DDoS
- **AWS WAF**: ป้องกันชั้นแอปพลิเคชัน
- **Amazon GuardDuty**: ตรวจจับภัยคุกคามทางพฤติกรรม

**AWS Shield: ตัวดูดซับ DDoS**

**AWS Shield Standard** ถูกเปิดใช้โดยอัตโนมัติสำหรับลูกค้า AWS ทั้งหมดโดยไม่มีค่าใช้จ่ายเพิ่ม มันป้องกันการโจมตี DDoS ชั้น 3 (เครือข่าย) และชั้น 4 (การขนส่ง) ที่พบบ่อยที่สุด — SYN flood, UDP flood, DNS amplification attack

CloudFront, Route 53 และ Elastic Load Balancing อยู่ที่ขอบของเครือข่าย AWS เมื่อการโจมตี DDoS เล็งแอปพลิเคชันของคุณ มันชนบริการที่จัดการเหล่านี้ก่อน โครงสร้างพื้นฐานเครือข่ายของ AWS ดูดซับการโจมตีก่อนมันถึง EC2 instance ของคุณ

**AWS Shield Advanced** คือ tier พรีเมียม ($3,000/เดือน ต่อองค์กร พร้อมข้อผูกพันหนึ่งปี) มันคือ subscription แยก — มัน *ไม่* รวมในแผน AWS Support ใด มันเพิ่ม:

- การป้องกันสำหรับ EC2, ELB, CloudFront, Global Accelerator และ Route 53
- การแจ้งเตือนการโจมตีแบบ near-real-time
- การเข้าถึง AWS Shield Response Team (SRT) — วิศวกรความปลอดภัยที่ช่วยคุณตอบสนองการโจมตี (การติดต่อ SRT ต้องการแผน Business หรือ Enterprise Support เพิ่มด้วย)
- Cost protection: ถ้าการโจมตีทำให้บิลพุ่ง AWS ให้ credit ต้นทุนที่พุ่งขึ้น
- การตรวจจับและบรรเทา DDoS ที่เพิ่มขึ้นที่ชั้น 7 (ชั้นแอปพลิเคชัน)

"ราคาเท่าไรต่อเดือน?" Tom ถาม

"สามพันดอลลาร์" Priya พูด "ต่อองค์กร"

Tom เงียบไปครู่หนึ่ง

"สำหรับองค์กรที่จัดการรายได้หลายล้าน DDoS ที่ทำให้พวกเขาล่มสองชั่วโมงมีต้นทุนมากกว่าสามพันดอลลาร์" Priya พูด

Tom คำนวณเงียบ ๆ

"เราจะเริ่มด้วย Standard" ในที่สุดเขาก็พูด

---

**เหตุการณ์ DDoS: Shield หน้าตาเป็นอย่างไรในการทำงานจริง**

แปดเดือนหลังการเปิดตัว Nimbus ได้รับการโจมตี DDoS จริงครั้งแรก

มันเริ่มตอน 11:43 น. วันอังคาร CloudWatch dashboard สำหรับ load balancer แสดงคำขอการเชื่อมต่อขาเข้าพุ่งจากปกติ 3,000 ต่อนาทีเป็น 180,000 ต่อนาทีในเวลาไม่ถึงเก้าสิบวินาที source IP กระจายข้ามสี่สิบประเทศ และปริมาณขาเข้าพุ่งสูงสุดประมาณห้าสิบกิกะบิตต่อวินาที รูปแบบชัดเจน: botnet เปิด SYN flood

Leo เห็น CloudFront metrics ก่อน "อัตราคำขอเพิ่มหกสิบเท่า เวลาตอบสนองพุ่ง"

Priya ดึง CloudWatch metrics ขึ้นข้างกัน: ความพยายามเชื่อมต่อที่ขอบไต่ขึ้นแนวตั้ง คำขอที่ถึง origin จริง — แบน "Shield Standard กำลังกินมัน" เธอพูด ไม่มีการแจ้งเตือน ไม่มี dashboard event ไม่มี notification Shield Standard ทำงานเงียบ ๆ: มันเปิดเสมอ มันฟรี และมันให้ **การมองเห็นการโจมตีเป็นศูนย์** — ไม่มี event console ไม่มี notification ไม่มี DDoS response team (การมองเห็นนั้น — dashboard การโจมตีและการแจ้งเตือนแบบ near-real-time — คือสิ่งเป๊ะที่ Shield *Advanced* ขาย) วิธีเดียวที่ Priya เห็นการโจมตีเลยคือผ่าน CloudWatch metrics ของตัวเอง

Shield Standard ตรวจจับ SYN flood โดยอัตโนมัติและเข้าร่วมการบรรเทาภายในสองนาทีแรก traffic การโจมตีถูกดูดซับที่ edge node ของ CloudFront ทั่วโลก — point of presence 750+ อันเดียวกันที่ให้บริการเนื้อหาที่ถูกต้องก็ดูดซับปริมาณการโจมตีด้วย

พอ 11:52 น. — เก้านาทีหลังการโจมตีเริ่ม — การบรรเทาของ Shield นำอัตราคำขอที่ origin กลับสู่ปกติ การโจมตียังรันที่ระดับเครือข่าย แต่การบรรเทาจัดการมัน แอปพลิเคชัน Nimbus ให้บริการ user ต่อไปตลอด

"user ไม่สังเกต?" Leo ถาม มองที่ metric อัตรา error

"อัตรา error เพิ่มประมาณสองเปอร์เซ็นต์ประมาณสี่นาที" Priya พูด "user บางคนได้ response ที่ช้ากว่าเล็กน้อย ไม่มี outage แอปพลิเคชันยังอยู่"

"เพราะ Shield ดูดซับ flood ที่ขอบ"

"ก่อนมันถึง load balancer ของเรา SYN flood ห้าสิบกิกะบิตชน CloudFront พอรูปแบบ traffic ถูกรู้จักและบรรเทา origin ของเราเห็นแค่ปริมาณคำขอปกติ"

การโจมตีกินเวลาสี่สิบเจ็ดนาที พอ 12:30 น. edge metrics กลับสู่ baseline — สัญญาณ "resolved" เดียวที่ Shield Standard ให้คุณ

"และนี่คือ Shield Standard" Tom พูด "เวอร์ชันฟรี"

"การโจมตีชั้น 3 และ 4 Standard ป้องกันพวกนั้นโดยอัตโนมัติ ถ้าการโจมตีซับซ้อนกว่า — เช่น HTTP flood ชั้น 7 ที่ทุกคำขอดูถูกต้อง — Standard จะไม่เพียงพอ นั่นต้องการ Shield Advanced บวก WAF"

Tom จด "ตรวจสอบรูปแบบ DDoS ชั้น 7" ใน security roadmap ของเขา

---

**AWS WAF: ตัวกรองแอปพลิเคชัน**

**AWS WAF (Web Application Firewall)** ทำงานที่ระดับ HTTP — มันตรวจสอบเนื้อหาของคำขอเว็บก่อนพวกมันถึงแอปพลิเคชันของคุณ

WAF ถูกกำหนดค่าด้วย **Web ACLs (Access Control Lists)** — ชุดกฎที่กำหนดว่าจะอนุญาต บล็อก หรือนับอะไร

WAF แนบกับ:

- CloudFront distribution (ตรวจคำขอที่ขอบ ทั่วโลก)
- Application Load Balancer (ตรวจคำขอที่ระดับ region)
- API Gateway
- AWS AppSync

**WAF Managed Rules**: AWS และผู้ขายบุคคลที่สามเผยแพร่ชุดกฎที่สร้างไว้ล่วงหน้า:

- **AWS Managed Rules - Core Rule Set**: ร่วมกับ rule group คู่กัน (SQL database, Known Bad Inputs) ครอบคลุมช่องโหว่ OWASP Top 10 (SQL injection, XSS, command injection, path traversal ฯลฯ)
- **AWS Managed Rules - Known Bad Inputs**: บล็อกคำขอที่ตรงกับรูปแบบการโจมตีที่รู้จัก
- **AWS Managed Rules - Amazon IP Reputation List**: บล็อก IP ที่รู้ว่าเกี่ยวข้องกับ botnet และ scanner
- **AWS Managed Rules - Bot Control**: ระบุและจัดการ bot traffic

คุณยังสร้างกฎกำหนดเองได้:

- "บล็อกคำขอใด ๆ ที่มี User-Agent header ที่มี 'sqlmap'" (scanner SQL injection ที่พบบ่อย)
- "Rate limit: อนุญาตไม่เกิน 1000 คำขอต่อ IP ต่อ 5 นาที"
- "บล็อกคำขอที่มี `<script>` ในค่า parameter ใด"

สำหรับ Nimbus การตั้งค่าเชิงปฏิบัติ: WAF บน CloudFront distribution พร้อมเปิด Core Rule Set สิ่งนี้บล็อกรูปแบบการโจมตีที่พบบ่อยที่สุดก่อนคำขอถึง EC2 instance เลย

คุณอาจสงสัย: ถ้า WAF บล็อกรูปแบบการโจมตีที่รู้จัก จะเกิดอะไรขึ้นเมื่อรูปแบบการโจมตีใหม่ปรากฏที่ WAF ไม่รู้จัก? ชุดกฎ managed ของ WAF ถูกอัปเดตโดย AWS และผู้ขายบุคคลที่สามเมื่อภัยคุกคามใหม่เกิดขึ้น — คุณไม่ต้องอัปเดตกฎด้วยมือ แต่คุณถูกที่ว่า WAF โดยพื้นฐานตอบสนองต่อรูปแบบที่รู้จัก เทคนิคการโจมตีใหม่ที่แปลกใหม่จะไม่ถูกบล็อกโดยกฎที่ยังไม่มีอยู่ นี่คือเหตุผลที่ GuardDuty มีอยู่ควบคู่กับ WAF: WAF กรองประตูหน้า GuardDuty เฝ้าดูพฤติกรรมผิดปกติภายในบ้าน การโจมตีประเภทใหม่อาจผ่าน WAF แต่ GuardDuty ยัง flag กิจกรรมผิดปกติที่มันทำให้เกิดได้ — API call ผิดปกติ ปลายทางเครือข่ายที่ไม่คาดคิด รูปแบบการเข้าถึงที่ไม่ตรงกับ baseline

**เราคิดเรื่องว่าจะเกิดอะไรขึ้นถ้า WAF ทำให้เกิด false positive หรือยัง?** Priya ถาม "คำขอของ user ที่ถูกต้องที่ถูกบล็อกโดย Core Rule Set?"

"WAF มีโหมด 'Count'" Leo พูด "แทนที่จะบล็อก มันแค่นับคำขอที่ตรงกัน คุณรันมันในโหมด Count ก่อน ทบทวนว่ามันจะบล็อกอะไร ยืนยันว่าไม่มี false positive แล้วสลับเป็น Block"

"ดี" Priya พูด "เราเริ่มในโหมด Count"

---

**การสร้างกฎ WAF: เรื่องราว Rate Limit**

สองสัปดาห์หลังเปิด WAF ในโหมด Count Priya ทบทวน log สิ่งที่ Core Rule Set พบสะอาด — ไม่มี false positive บน traffic ที่ถูกต้อง ความพยายาม SQL injection ที่ถูกบล็อกไม่กี่ครั้งจาก automated scanner

แต่เธอสังเกตรูปแบบที่ Core Rule Set ไม่ได้ flag: IP address หนึ่งทำคำขอ 847 ครั้งไปยัง `/api/search` ในห้านาที ทุกคำขอถูกต้องเชิงโครงสร้าง แต่ 847 การค้นหาในห้านาทีไม่ใช่มนุษย์

"price scraper" เธอพูด "มีคนกำลัง query การค้นหาร้านอาหารของเราโดยอัตโนมัติเพื่อสร้างฐานข้อมูลราคาคู่แข่ง"

"เราสนใจไหม?" Leo ถาม

"มันใช้ทรัพยากร compute ของเราและมันขัดกับเงื่อนไขบริการของเรา" Tom พูด

"เราสนใจ" Priya ยืนยัน

เธอสร้าง rate-based rule ของ WAF กำหนดเอง:

```
Rule name: RateLimitSearchAPI
Rule type: Rate-based rule
Rate limit: 100 requests per IP address
Evaluation window: 5 minutes (configurable: 1, 2, 5, or 10 minutes)
Scope-down statement: URI path starts with /api/search
Action: Block
```

scope-down statement สำคัญ — rate limit ใช้เฉพาะกับ `/api/search` API traffic ที่ถูกต้องไปยัง endpoint อื่นไม่ได้รับผลกระทบ และสังเกตว่าการบล็อกทำงานอย่างไร: ไม่มีช่วง "การลงโทษ" ตายตัว — WAF ประเมินอัตราคำขอของแต่ละ IP ใหม่อย่างต่อเนื่อง บล็อกมันขณะที่อัตราอยู่เหนือขีดจำกัด และเลิกบล็อก (โดยปกติภายในวินาที) เมื่ออัตราลดกลับใต้

เธอตั้งมันเป็นโหมด Count ก่อน รันมัน 24 ชั่วโมง IP เดียวที่ทริกเกอร์กฎคือ scraper ไม่มี user ที่ถูกต้องเคยส่งมากกว่า 12 คำขอไปยัง search endpoint ในห้านาที

เธอสลับเป็นโหมด Block คำขอถัดไปของ scraper ได้ 403 มันเปลี่ยนเป็น IP ที่ต่างกัน rate limit จับอันนั้นด้วย

"พวกเขาจะหาทางเลี่ยงในที่สุด" Leo พูด "กระจายข้าม IP มากขึ้น"

"ซึ่งจุดนั้นพวกเขาใช้โครงสร้างพื้นฐานมากขึ้น จ่ายมากขึ้น และได้ข้อมูลน้อยลง" Priya พูด "เราไม่ต้องหยุดพวกเขาสมบูรณ์ เราต้องทำให้มันแพงพอที่จะไม่คุ้ม"

"ราคาเท่าไรต่อเดือน?" Tom ถาม

ราคา WAF คือต่อ Web ACL ต่อเดือน ต่อกฎต่อเดือน และต่อล้านคำขอ สำหรับการตั้งค่าของ Nimbus — หนึ่ง Web ACL ห้ากฎบน CloudFront — ประมาณ $15 ต่อเดือนบวกค่าคำขอ

Tom อนุมัติมันทันที

---

**Amazon GuardDuty: นักวิเคราะห์พฤติกรรม**

"เดี๋ยว — แต่ *ทำไม* เราถึงทำแบบนั้น?" Maya ถาม "ถ้า WAF บล็อกการโจมตีและ Shield ดูดซับ flood ทำไมเราต้องการบริการที่สาม? GuardDuty เฝ้าดูอะไรจริง ๆ?"

WAF และ Shield เป็นตัวกรอง — พวกมันดัก traffic ที่ไม่ดีก่อนถึงแอปพลิเคชันของคุณ GuardDuty เฝ้าดูสิ่งที่เกิดขึ้นหลัง traffic มาถึง มันดูว่าโครงสร้างพื้นฐานของคุณกำลังทำอะไร: IAM credential ใดถูกใช้ instance ของคุณติดต่อ domain ใด API call อะไรเกิดตอนตีสาม ผู้โจมตีที่ผ่านประตูหน้าผ่านคำขอที่ดูถูกต้องจะไม่ถูกหยุดโดย WAF — แต่ GuardDuty จะสังเกตว่า credential เดียวกันทำ API call จากโรมาเนียกะทันหัน

GuardDuty ต่างจาก Shield และ WAF โดยพื้นฐาน มันไม่บล็อกการโจมตี — มัน **ตรวจจับพฤติกรรมผิดปกติ**

GuardDuty วิเคราะห์หลายสายของกิจกรรมอย่างต่อเนื่องเพื่อตรวจจับภัยคุกคาม: **CloudTrail management และ data event** (API call และการกระทำ), **VPC Flow Logs** (รูปแบบ network traffic) และ **DNS query log** (การ lookup domain) นี่คือสามแหล่งพื้นฐานที่ GuardDuty พึ่งพาเสมอ:

- **AWS CloudTrail logs**: การเปลี่ยนแปลง IAM, API call, การล็อกอิน console
- **VPC Flow Logs**: รูปแบบ network traffic ภายใน VPC ของคุณ
- **DNS query logs**: สิ่งที่ instance ของคุณ resolve (malware ที่รู้จักมัก, resolve C2 domain เฉพาะ)

แต่ GuardDuty ขยายไปไกลกว่าสามอันนี้อย่างมีนัยสำคัญ AWS เรียก add-on ทางเลือกว่า **protection plans** — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring และ Malware Protection — แต่ละอันเปิดแยกกัน ขึ้นกับว่าคุณเปิดอันไหน GuardDuty ยังวิเคราะห์ **S3 data event** (รูปแบบการเข้าถึง bucket ผิดปกติ), **EKS audit log และ runtime activity** (พฤติกรรมที่เป็นอันตรายภายใน container ที่กำลังรัน), **RDS login event** (ความพยายามล็อกอินฐานข้อมูลผิดปกติ), **Lambda network traffic** (function เรียกปลายทางภายนอกที่ไม่คาดคิด), **ECS/EC2 runtime behavior** และ **EBS volume ที่ scan หา malware** ได้ สำหรับข้อสอบ รู้สามแหล่งหลักให้ขึ้นใจ; protection plan ปรากฏในสถานการณ์เกี่ยวกับบริบทการตรวจจับภัยคุกคามเฉพาะ — "ตรวจจับความพยายามล็อกอินผิดปกติไปยัง RDS" หรือ "ระบุพฤติกรรมที่เป็นอันตรายภายใน container ที่กำลังรัน" เป็นสัญญาณให้คิดถึง protection plan ทางเลือกของ GuardDuty

โมเดล machine learning ระบุรูปแบบที่เบี่ยงเบนจาก baseline ของคุณ GuardDuty สร้าง **findings** — การแจ้งเตือนที่แบ่งหมวด — เมื่อมันตรวจพบความผิดปกติ

ตัวอย่างสิ่งที่ GuardDuty ตรวจจับได้:

- IAM user ล็อกอินจาก IP address ที่ไม่รู้จัก (ในประเทศที่พวกเขาไม่เคยใช้)
- API call ถูกทำจาก Tor exit node
- EC2 instance สื่อสารกับ cryptocurrency mining pool ที่รู้จัก
- ปริมาณ API call สูงผิดปกติ (การใช้ credential ในทางที่ผิดหรือการ scan)
- S3 bucket ถูกเข้าถึงโดย IP address ที่ถูก flag ว่ามีกิจกรรมที่เป็นอันตราย
- traffic ขาออกไปยัง domain ที่รู้ว่าเกี่ยวข้องกับ malware command-and-control

"นี่คือสิ่งที่จะจับ IP โรมาเนียได้" Leo พูดเงียบ ๆ

"ถ้าเราเปิด GuardDuty มันจะ flag EC2 instance ที่ทำการเชื่อมต่อขาออกไปยัง external IP ที่ไม่รู้จักตอนตีสอง" Priya ยืนยัน

---

**ห้าประเภท GuardDuty Finding และต้องทำอะไร**

Priya สร้าง runbook สำหรับห้า GuardDuty finding ที่พบบ่อยที่สุด เมื่อ finding ยิง ทีมรู้ทันทีว่ามันหมายความว่าอะไรและต้องทำอะไร

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

IAM user ล็อกอินเข้า AWS Console สำเร็จจาก IP address ที่ไม่เคยเห็นสำหรับบัญชีนี้มาก่อน หรือจากตำแหน่งทางภูมิศาสตร์ที่ไม่สอดคล้องกับการล็อกอินก่อนหน้า

การตอบสนอง: ยืนยันกับ user ว่าพวกเขาเริ่มการล็อกอิน ถ้าพวกเขาไม่ได้ — หรือติดต่อไม่ได้ — ทันที: ปิด access key และรหัสผ่าน console ของ user เพิกถอน session ที่ active และเริ่ม CloudTrail audit ทุกอย่างที่ user นั้นทำใน 24 ชั่วโมงที่ผ่านมา finding นี้มักนำหน้าการใช้ credential ในทางที่ผิด

**2. CryptoCurrency:EC2/BitcoinTool.B**

EC2 instance กำลัง query IP address หรือ domain name ที่เกี่ยวข้องกับ cryptocurrency mining pool นี่เกือบจะเสมอเป็นผลจาก EC2 instance ถูก compromise และใช้เป็น mining bot

การตอบสนอง: แยก instance ทันที — แก้ security group ของมันเพื่อบล็อก inbound และ outbound traffic ทั้งหมดยกเว้น bastion host ของคุณ ทำ forensic snapshot ของ EBS volume แล้วยุติ instance และ launch ตัวแทนจาก AMI ที่สะอาด

**3. Recon:EC2/PortProbeUnprotectedPort**

EC2 instance มีพอร์ตเปิดสู่อินเทอร์เน็ตที่ถูก probe โดย scanner ที่รู้จักหรือจาก Tor exit node GuardDuty flag พอร์ตที่ปรากฏใน flow log ว่าเข้าถึงได้จากแหล่งภายนอก

การตอบสนอง: ทบทวนกฎ security group ถ้าพอร์ตเปิดโดยตั้งใจ มาร์ก finding ว่า resolved พร้อมหมายเหตุ ถ้าไม่ตั้งใจ ปิดพอร์ตทันที ตรวจ CloudTrail หาการเข้าถึงใดที่อาจเกิดผ่านพอร์ตนั้น

**4. Trojan:EC2/BlackholeTraffic**

EC2 instance พยายามสื่อสารกับ IP address ที่ถูกระบุว่าเป็น "black hole" — ปลายทางที่เกี่ยวข้องกับโครงสร้างพื้นฐาน malware command-and-control traffic ไปยัง IP เหล่านี้บ่งชี้ว่า instance ถูกติดเชื้อและพยายามโทรกลับบ้าน

การตอบสนอง: เหมือน CryptoCurrency finding — แยก snapshot แทนที่ finding นี้บ่งชี้ malware ที่ active บน instance อย่าพยายามทำความสะอาด instance ในที่; สร้างใหม่จาก AMI ที่สะอาด

**5. Policy:S3/BucketBlockPublicAccessDisabled**

มีคนปิดการตั้งค่า Block Public Access บน S3 bucket นี่ไม่ได้หมายความว่า bucket เป็นสาธารณะ — มันหมายความว่ากลไกความปลอดภัยที่ป้องกันการเปิดเผยสาธารณะโดยบังเอิญถูกปิดสำหรับ bucket นั้น นี่มักทำโดยบังเอิญหรือเป็นส่วนหนึ่งของ deployment ที่กำหนดค่าผิด

การตอบสนอง: สืบสวนว่าใครทำการเปลี่ยนแปลง (CloudTrail จะมี API call) เปิด Block Public Access ใหม่เว้นแต่มีเหตุผลที่บันทึกไว้ว่าควรปิด พิจารณาเปิดการตั้งค่า Block Public Access ระดับบัญชีเพื่อป้องกัน finding นี้ไม่ให้เกิดในอนาคต

"สิ่งสำคัญที่สุดเกี่ยวกับ GuardDuty finding" Priya พูด "คือพวกมันไม่ใช่การแจ้งเตือน — พวกมันคือสมมติฐาน แต่ละ finding บอก 'รูปแบบนี้ดูผิดปกติ' คุณยืนยัน คุณสืบสวน คุณตอบสนอง บางอันจะเป็น false positive ส่วนใหญ่จะไม่ใช่"

"เราจัดลำดับความสำคัญยังไง?" Rafael ถาม

"GuardDuty กำหนดระดับความรุนแรง: Low, Medium, High finding ความรุนแรง High ต้องการการตอบสนองในวันเดียวกัน finding Trojan และการ compromise credential เป็น High เสมอ finding port probe อาจเป็น Medium หรือ Low เริ่มด้วย High ลงมา"

---

"ราคาเท่าไร?" Tom ถาม

ราคา GuardDuty อิงปริมาณ log ที่วิเคราะห์ — CloudTrail event, VPC flow data, DNS query สำหรับแอปพลิเคชันเล็กถึงกลาง โดยปกติ $50-150/เดือน ในระดับใหญ่ มันยังเป็นเศษเสี้ยวเล็กของต้นทุนโครงสร้างพื้นฐาน

Tom ดึง console ขึ้นและเปิดมัน

"มันจะไม่เป็นไร" Leo พูด "มันแค่ตรวจสอบ ไม่ใช่ว่ามันจะทำให้อะไรพัง"

"ผมdeployไปแล้ว" Leo เสริม — แล้วตรวจ GuardDuty dashboard "อ้อ มีแค่ sample finding อันจริงใช้เวลาสักพัก"

"GuardDuty ต้องการเวลาสร้าง baseline ของหน้าตาปกติ" Priya พูด "ให้มันสองสามวัน finding จริงแรกจะมาถึง — พวกมันมาเสมอ"

เธอกลายเป็นถูกเรื่องนั้น แต่ finding แรกเป็นเรื่องราวสำหรับท้ายบทนี้

**การเชื่อมต่อสามบริการ**

Shield, WAF และ GuardDuty ทำงานที่ชั้นต่างกันและเสริมกัน:

| บริการ    | ชั้น                     | ป้องกัน                            | การกระทำ                             |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | เครือข่าย/การขนส่ง (L3/L4) | DDoS flood                                 | ดูดซับ/บรรเทาการโจมตี          |
| AWS WAF    | แอปพลิเคชัน (L7)          | OWASP Top 10, bot, scraper                | อนุญาต บล็อก หรือนับคำขอ |
| GuardDuty  | พฤติกรรม (ทุก log)     | ความผิดปกติ, credential ที่ถูก compromise, malware | ตรวจจับและแจ้งเตือน                 |

Shield หยุด flood WAF กรองน้ำ GuardDuty เฝ้าดูท่อหารูปแบบการไหลที่ผิดปกติ Macie ตรวจสอบสิ่งที่เก็บในอ่างเก็บน้ำ Security Hub คือห้องควบคุมที่ทุก dashboard มองเห็นได้พร้อมกัน

โหมดความล้มเหลวของแต่ละอันอธิบายว่าทำไมคุณต้องการทั้งหมด:

- SYN flood 50 Gbps ไม่ใช่คำขอเว็บ WAF ตรวจมันไม่ได้ GuardDuty อาจสังเกต CloudTrail event ที่เกี่ยวข้อง Shield หยุดมัน
- คำขอ SQL injection เดียวไม่ใช่ flood Shield ไม่สนใจมัน GuardDuty ไม่รู้เนื้อหาของ HTTP request WAF จับมัน
- AWS user ที่ถูกต้องใช้ credential ของตัวเอง exfiltrate ข้อมูลช้า ๆ — ไม่มี DDoS ไม่มี injection HTTP ที่ถูกต้อง — Shield และ WAF ไม่เห็นอะไรผิดปกติ GuardDuty สังเกตว่า credential ถูกใช้จากประเทศใหม่ตอนตีสาม
- นักพัฒนาที่อัปโหลด PII ลูกค้าไปยัง bucket ที่เข้าถึงได้สาธารณะโดยบังเอิญไม่สร้างพฤติกรรมผิดปกติเลย GuardDuty ไม่มีอะไรให้ flag Macie scan bucket และพบ PII

แต่ละบริการมีจุดบอด การรวมกันครอบคลุมจุดบอดเหล่านั้น

**CloudTrail: รากฐาน**

ทั้งสามบริการพึ่งพา log **AWS CloudTrail** คือบริการ logging ที่จับทุก API call ในบัญชี AWS ของคุณ — ใครเรียกอะไร เมื่อไร จากที่ไหน ด้วยผลอะไร

CloudTrail ถูกเปิดโดยค่าเริ่มต้นสำหรับประวัติ 90 วันใน console เพื่อเก็บ log ระยะยาว:

1. สร้าง trail ที่เขียนไปยัง S3 bucket
2. ทางเลือก ส่งไปยัง CloudWatch Logs สำหรับการแจ้งเตือนแบบ real-time
3. เปิด log file validation (เพื่อตรวจจับถ้า log ถูกแก้ไข)

GuardDuty, AWS Config, Security Hub และ IAM Access Analyzer ทั้งหมดอ่านจาก CloudTrail โดยไม่มี CloudTrail log บริการเหล่านี้ไม่มีอะไรให้วิเคราะห์

"ถ้ามีคนพยายามปิด CloudTrail ล่ะ?" Priya ถาม "ถ้าผู้โจมตีได้สิทธิ์ administrator การกระทำแรกของพวกเขาอาจเป็นปิด logging — กลบรอย"

"นั่นคือสิ่งที่ SCP จากบทที่ 14 ป้องกัน" Leo พูด "ไม่มีใครในบัญชีนี้ปิด CloudTrail ได้ แม้แต่ administrator"

"และถ้าพวกเขาทำได้ยังไงก็ตาม?"

"Security Hub จะสร้าง finding CloudTrail ส่ง notification ไปยัง SNS เมื่อมีการเปลี่ยนแปลงการกำหนดค่า เราได้การแจ้งเตือนภายในสองนาทีของการแก้ไข CloudTrail ใด"

"และ GuardDuty จะ flag API call" Rafael เสริม "เป็น IAM action ผิดปกติ — การปิด logging ไม่ใช่กิจกรรมด้านการดำเนินงานปกติ"

หลายชั้นของการตรวจจับสำหรับหนึ่งในการกระทำด้านความปลอดภัยที่สำคัญที่สุด: การแก้ไข log นี่ไม่ใช่อุบัติเหตุ Priya ออกแบบมันโดยตั้งใจ

"Defense in depth ใช้กับชั้นการตรวจสอบด้วย" เธอพูด "ไม่ใช่แค่ชั้นแอปพลิเคชัน"

**Amazon Macie: ข้อมูลที่ละเอียดอ่อนใน S3**

"เราคิดเรื่องว่าจะเกิดอะไรขึ้นถ้ามีคนอัปโหลดไฟล์ที่มีหมายเลขบัตรเครดิตลูกค้าไปยัง S3 โดยบังเอิญหรือยัง?" Priya ถาม "ไม่ใช่อย่างมุ่งร้าย — แค่นักพัฒนาส่งออกข้อมูลเพื่อ debug และอัปโหลดไฟล์ผิด?"

"เราจะไม่มีวันรู้" Leo พูด

"ใช่เลย เว้นแต่เรามี Macie"

**Amazon Macie** คือบริการความปลอดภัยข้อมูลที่ใช้ machine learning ค้นพบและปกป้องข้อมูลที่ละเอียดอ่อนใน S3 โดยอัตโนมัติ มัน scan S3 bucket อย่างต่อเนื่องและระบุ:

- PII (Personally Identifiable Information): ชื่อ ที่อยู่อีเมล หมายเลขโทรศัพท์ วันเกิด
- ข้อมูลทางการเงิน: หมายเลขบัตรเครดิต หมายเลขบัญชีธนาคาร
- credential: รหัสผ่าน access key private key ที่ฝังในไฟล์
- ข้อมูลสุขภาพ: บันทึกผู้ป่วย การวินิจฉัย

Macie สร้าง finding เมื่อมันตรวจพบข้อมูลที่ละเอียดอ่อนในที่ที่ไม่ควรอยู่ — หรือเมื่อ S3 bucket มีการกำหนดค่าการเข้าถึงที่ผ่อนปรนเกินไป

"นี่เหมือน GuardDuty ไหม?" Maya ถาม

"วัตถุประสงค์ต่างกัน" Priya พูด "GuardDuty เฝ้าดูพฤติกรรม — การกระทำอะไรถูกทำ พวกการกระทำนั้นดูผิดปกติไหม Macie เฝ้าดูข้อมูล — เนื้อหาอะไรถูกเก็บ เนื้อหานั้นละเอียดอ่อนไหม GuardDuty จะ flag EC2 instance ที่ทำ API call ผิดปกติ Macie จะ flag S3 bucket ที่มีหมายเลขบัตรเครดิต"

"ดังนั้น GuardDuty คือนักวิเคราะห์พฤติกรรม" Leo พูด "และ Macie คือผู้ตรวจสอบข้อมูล"

"ใช่เลย คุณต้องการทั้งสอง ผู้โจมตีที่ exfiltrate ข้อมูลผ่าน API call ที่ดูถูกต้องอาจถูก flag โดย GuardDuty สำหรับรูปแบบ API ผิดปกติ แต่ถ้าพนักงานอัปโหลดไฟล์ที่มีบันทึกลูกค้า 10,000 ราย ไปยัง development bucket ไม่มีพฤติกรรมผิดปกติให้ตรวจจับ — แค่ข้อมูลที่ละเอียดอ่อนในที่ผิด Macie จับนั่น"

สำหรับ Nimbus ค่าที่ทันทีที่สุดของ Macie อยู่บน bucket `nimbus-debug-exports` — bucket ที่นักพัฒนาใช้ทิ้งข้อมูลเพื่อ debug Macie พบสามไฟล์ที่มีประวัติออเดอร์พร้อมชื่อลูกค้าและที่อยู่จัดส่ง ไม่ใช่ข้อมูลการชำระเงิน แต่ข้อมูลส่วนบุคคลที่ไม่ควรอยู่ใน development bucket ที่ไม่เข้ารหัส

ไฟล์ถูกเอาออก policy ถูกเพิ่ม: debug bucket ถูกจำกัดเฉพาะข้อมูลทดสอบสังเคราะห์ ข้อมูลลูกค้าจริงต้องการการอนุมัติของ Priya ในการส่งออกไปยังสภาพแวดล้อมใดนอก production

"ราคาเท่าไรต่อเดือน?" Tom ถาม

Macie คิดอิงจำนวน S3 bucket ที่ประเมินต่อเดือนและปริมาณข้อมูลที่ scan สำหรับสตาร์ทอัปที่มี bucket จำนวนปานกลาง ประมาณ $10-50 ต่อเดือน ฟรี 30 วันแรก

Tom เปิดมันก่อนมื้อเที่ยง

---

**AWS Security Hub: Dashboard**

ถ้าคุณรันหลายบัญชี AWS หรือต้องการมุมมองรวมของ finding ความปลอดภัย **AWS Security Hub** รวม finding จาก GuardDuty, Inspector (การประเมินช่องโหว่), Macie (ความเป็นส่วนตัวข้อมูล), Config และ Firewall Manager เข้า dashboard เดียว

มันยังตรวจการกำหนดค่าของคุณกับ security best practice (มาตรฐาน AWS Foundational Security Best Practices) และ CIS AWS Foundations Benchmark

Security Hub คือคำตอบต่อ "ฉันเห็น finding ความปลอดภัยทั้งหมดในที่เดียวโดยไม่ต้องสลับระหว่างห้า console ที่ต่างกันได้ยังไง?" เมื่อ GuardDuty สร้าง finding มันปรากฏใน GuardDuty และใน Security Hub เมื่อ Macie พบข้อมูลที่ละเอียดอ่อนใน S3 bucket มันปรากฏใน Macie และใน Security Hub เมื่อ Config rule ตรวจพบการกำหนดค่าผิด มันปรากฏใน Config และใน Security Hub

สำหรับทีมบัญชีเดียว Security Hub เพิ่มค่าเล็กน้อย — มันเป็นอีก console ให้ตรวจ พลังของมันเกิดในระดับใหญ่: สามบัญชี สิบบัญชี ห้าสิบบัญชี finding ทั้งหมดจากทุกบัญชีรวมเข้า Security Hub ของ management account ทีมเดียวตรวจสอบ dashboard เดียว ชุดการแจ้งเตือนเดียว ไม่มีการตรวจ log ทีละบัญชี

สำหรับ Nimbus: Security Hub ยังไม่จำเป็น เมื่อพวกเขาโตเป็นสามบัญชี (dev, staging, production) มันจะกลายเป็นสิ่งจำเป็น

"ตั้งมันตอนนี้" Soo-Jin พูดในสัปดาห์ที่สามของเธอ "มันใช้เวลาสิบห้านาทีในการเปิด มันใช้เวลาสามเดือนในการอยากให้คุณทำมันก่อนหน้านี้"

พวกเขาเปิดมัน

**Amazon Inspector: การประเมินช่องโหว่**

หนึ่งสัปดาห์หลังเปิด Macie CVE ถูกเผยแพร่สำหรับเวอร์ชัน OpenSSL ที่รันทั่ว Nimbus production fleet Priya อ่านคำแนะนำพร้อมกาแฟ

"เราต้องรู้ว่า instance ใดของเราได้รับผลกระทบ" เธอพูด

"ผมรัน manual scan ได้" Leo พูด

"สำหรับเก้า instance ได้ สำหรับเก้าสิบ? สำหรับ container?" Priya เปิด Inspector console "นี่คือสิ่งที่ Inspector มีไว้"

**Amazon Inspector** คือบริการประเมินช่องโหว่อัตโนมัติ ที่ที่ GuardDuty เฝ้าดูพฤติกรรม — สิ่งที่โครงสร้างพื้นฐานของคุณกำลังทำตอนนี้ — Inspector ดูสิ่งที่มีอยู่ที่ถูกใช้ประโยชน์ได้

- **EC2 instances:** Inspector scan ระบบปฏิบัติการและแพ็กเกจที่ติดตั้งกับ NVD (National Vulnerability Database) — แคตตาล็อกที่เชื่อถือได้ของ CVE ที่รู้จัก ถ้าคุณรัน OpenSSL 1.1.1 และ CVE เล็งเวอร์ชันนั้น Inspector flag มัน
- **ECR container images:** Inspector scan container image ใน Elastic Container Registry ก่อนพวกมันถูก deploy แพ็กเกจที่มีช่องโหว่ใน base image ปรากฏเป็น finding ก่อน container รันใน production เลย
- **Lambda function packages:** Inspector วิเคราะห์ dependency ที่ bundle ใน Lambda function ของคุณ — Python package, Node module, Java dependency — หาช่องโหว่ที่รู้จัก

ความแตกต่างสำคัญจากการ scan ครั้งเดียว: Inspector รัน **อย่างต่อเนื่อง** มันไม่ได้แค่ตรวจ instance ของคุณครั้งเดียวเมื่อคุณเปิดมันและประกาศว่าสะอาด เมื่อ CVE ใหม่ถูกเผยแพร่ Inspector ประเมินทรัพยากรที่มีอยู่ของคุณใหม่กับช่องโหว่ใหม่โดยอัตโนมัติ เมื่อ EC2 instance เปลี่ยน — ติดตั้งแพ็กเกจใหม่ อัปเดต AMI — Inspector rescan มัน EC2 fleet ของ Priya ถูก flag สำหรับ OpenSSL CVE ภายในไม่กี่นาทีหลังเปิด Inspector ไม่ใช่เพราะเธอขอให้มัน scan แต่เพราะนั่นคือสิ่งที่มันทำ

finding ถูกให้ระดับความรุนแรง: Critical, High, Medium, Low, Informational พวกมันไหลไปยัง Security Hub ควบคู่กับ finding ของ GuardDuty และ Macie หนึ่ง dashboard สามเลนส์

"สาม instance ได้รับผลกระทบ" Leo พูด อ่าน Inspector finding "อีกหกอยู่บนเวอร์ชันที่ patch แล้ว"

"patch สามอันนั้นสัปดาห์นี้" Priya พูด

"แล้ว container image ล่ะ?"

Priya มอง Inspector ECR finding base image สองอันใน container registry ของพวกเขามีช่องโหว่ที่รู้จัก — เวอร์ชันแพ็กเกจเก่ากว่าที่ถูก patch แล้ว เธอ tag พวกมันสำหรับ rebuild

"สิ่งสำคัญ" Priya พูด "คือเราพบนี่ก่อนมันถูกใช้ประโยชน์ ไม่ใช่หลังจาก"

**โมเดลสามเลนส์**

GuardDuty, Inspector และ Macie แต่ละอันเฝ้าดูสิ่งที่ต่างกัน:

- **GuardDuty** เป็นเชิงพฤติกรรม มันถาม: *อะไรกำลังเกิดขึ้นตอนนี้ที่ดูผิด?* API call จากตำแหน่งที่ไม่คาดคิด EC2 instance ติดต่อเซิร์ฟเวอร์ command-and-control credential ถูกใช้ในเวลาผิดปกติ มันจับภัยคุกคามและความผิดปกติที่ active
- **Inspector** เป็นเชิงโครงสร้าง มันถาม: *อะไรที่มีอยู่ในสภาพแวดล้อมของเราที่ถูกใช้ประโยชน์ได้?* แพ็กเกจที่ไม่ได้ patch dependency ที่มีช่องโหว่ runtime ที่ล้าสมัย มันจับเงื่อนไขที่ทำให้การโจมตีเป็นไปได้
- **Macie** เกี่ยวกับข้อมูล มันถาม: *ข้อมูลที่ละเอียดอ่อนใดนั่งอยู่ใน S3 bucket ของเราที่ไม่ควรอยู่ที่นั่น?* PII บันทึกทางการเงิน credential ที่ทิ้งไว้ในไฟล์ มันจับการเปิดเผยที่ไม่สร้างพฤติกรรมผิดปกติ — แค่ข้อมูลในที่ผิด

การ compromise ที่เกี่ยวข้องกับ CVE ที่รู้จักอาจปรากฏในทั้งสาม: Inspector จะ flag ช่องโหว่ก่อนการโจมตี GuardDuty จะ flag พฤติกรรมผิดปกติระหว่างการโจมตี Macie จะ flag ข้อมูลที่ exfiltrate หลังมันลงใน S3

สามเลนส์ที่ต่างกัน สามเส้นเวลาที่ต่างกัน ไม่มีอันใดทดแทนอันอื่น

**AWS Network Firewall: ตัวตรวจสอบ Traffic**

มีผู้เชี่ยวชาญอีกหนึ่งที่สมควรได้รับการกล่าวถึงก่อนกล่องเครื่องมือปิด security group และ NACL (บทที่ 15) กรอง traffic ตาม IP พอร์ต และโปรโตคอล — พวกมันบอกได้ว่า *ใคร* คุยกับ *อะไร* ได้ แต่มองภายในการสนทนาไม่ได้ **AWS Network Firewall** คือ stateful firewall ที่จัดการที่คุณ deploy ที่ระดับ VPC มันทำ deep packet inspection: กรองตาม domain name (อนุญาตขาออกเฉพาะไปยัง `*.eatnimbus.com` และ package repository ของคุณ) บล็อก traffic ที่ตรงกับ intrusion signature (IDS/IPS เข้ากันได้กับ Suricata rule) และตรวจสอบ flow ที่ security group จะโบกผ่านเพราะหมายเลขพอร์ตดูโอเค

"ดังนั้นมันคือ security group ที่มีสมอง" Leo พูด

"มันคือ appliance ที่คุณจะซื้อจากผู้ขาย firewall" Priya พูด "ยกเว้นจัดการ scale อัตโนมัติ และ deploy ใน subnet ของตัวเองเพื่อให้ traffic เข้าและออกจาก VPC ทั้งหมด route ผ่านมัน"

สัญญาณในข้อสอบ: "ตรวจสอบหรือกรอง traffic ตาม domain name หรือ payload" "intrusion detection/prevention (IDS/IPS) สำหรับ VPC" หรือ "การกรอง egress แบบรวมศูนย์สำหรับ outbound traffic" → Network Firewall security group และ NACL คือคำตอบสำหรับ allow/deny ระดับ instance และระดับ subnet ตามพอร์ตและ IP; Network Firewall คือคำตอบเมื่อคำถามต้องการการตรวจสอบ *ภายใน* traffic และเมื่อคำถามถามว่าจะจัดการกฎ WAF, Shield Advanced, security group *และ* นโยบาย Network Firewall อย่างสม่ำเสมอข้ามหลายบัญชีอย่างไร — นั่นคือ **AWS Firewall Manager** ชั้นการบริหารนโยบายบนยอด

## จุดแข็งและข้อจำกัด

**AWS Shield**:

- Standard: ฟรีและอัตโนมัติ — ไม่มีเหตุผลที่จะไม่ใช้
- Advanced: ยอดเยี่ยมสำหรับเป้าหมายที่โดดเด่น; แพงสำหรับทีมเล็ก
- Standard ดูดซับการโจมตีชั้น 3/4 (SYN flood, UDP flood, DNS amplification) โดยอัตโนมัติ
- Advanced เพิ่มการป้องกันชั้น 7 การแจ้งเตือนแบบ real-time และ Shield Response Team

**AWS WAF**:

- managed rule group ทำให้การตั้งค่าง่ายขึ้นมาก — การป้องกัน OWASP Top 10 ด้วยไม่กี่คลิก
- กฎกำหนดเองต้องการความเข้าใจรูปแบบการโจมตี HTTP
- rate limiting เป็นฟีเจอร์ทรงพลังที่มักถูกมองข้าม — มีประสิทธิภาพต่อ scraper และ brute force
- WAF ไม่ใช่ตัวแทนของโค้ดแอปพลิเคชันที่ปลอดภัย — มันคือชั้น defense-in-depth
- เริ่มในโหมด Count ตรวจสอบ แล้วสลับเป็น Block

**GuardDuty**:

- ความพยายามต่ำมากในการเปิด (ไม่กี่คลิก ทดลองฟรี 30 วัน)
- finding ต้องการการทบทวนและการตอบสนองของมนุษย์ — GuardDuty ตรวจจับ มันไม่แก้
- false positive เกิดขึ้น — กิจกรรมที่ถูกต้องบางอย่างดูผิดปกติต่อโมเดล ML
- ระดับความรุนแรง (Low/Medium/High) ช่วยจัดลำดับความสำคัญการตอบสนอง
- รวมกับ Security Hub, EventBridge และ Lambda สำหรับ workflow การตอบสนองอัตโนมัติ

**Amazon Inspector**:

- การ scan ช่องโหว่อัตโนมัติต่อเนื่อง — ไม่ใช่การตรวจครั้งเดียว
- re-scan โดยอัตโนมัติเมื่อ CVE ใหม่ถูกเผยแพร่หรือเมื่อทรัพยากรเปลี่ยน
- ครอบคลุม EC2 instance (OS และแพ็กเกจแอปพลิเคชัน), ECR container image และ Lambda function package
- finding ไหลไปยัง Security Hub; ระดับความรุนแรงช่วยจัดลำดับความสำคัญการ patch
- ไม่บล็อกการโจมตี — มันทำให้เงื่อนไขที่ทำให้การโจมตีเป็นไปได้ปรากฏ

**Amazon Macie**:

- ค้นพบข้อมูลที่ละเอียดอ่อน (PII, credential, ข้อมูลทางการเงิน) ใน S3 โดยอัตโนมัติ
- จับการเปิดเผยข้อมูลที่ไม่มีรูปแบบพฤติกรรมผิดปกติ — GuardDuty จะพลาดมัน
- ทดลองฟรี 30 วัน; จ่ายต่อ bucket ต่อเดือนหลังจากนั้น
- มีค่าที่สุดสำหรับทีมที่มี S3 bucket หลายอันและระดับความละเอียดอ่อนที่แตกต่างกัน

**AWS Security Hub**:

- รวม finding จาก GuardDuty, Macie, Inspector, Config และ Firewall Manager
- ตรวจการกำหนดค่ากับ security benchmark (CIS, NIST, PCI-DSS)
- มีค่าที่สุดในระดับหลายบัญชี
- เปิดแต่เนิ่น ๆ แม้คุณมีแค่บัญชีเดียว — ประวัติ finding สะสม

## สรุป

ห้าบริการ ห้าชั้น แต่ละอันจัดการภัยคุกคามประเภทที่ต่างกัน — และไม่มีอันใดทดแทนอันอื่น การโจมตี DDoS เลี่ยง WAF และ GuardDuty ความพยายาม SQL injection เลี่ยง Shield credential ที่ถูก compromise ใช้ช้าและระมัดระวังอาจเลี่ยง Shield และ WAF ทั้งหมด — แต่ GuardDuty จะเห็นความผิดปกติ นักพัฒนาที่อัปโหลด PII ลูกค้าไปยัง debug S3 bucket โดยบังเอิญเลี่ยงทั้งสาม — แต่ Macie จับมัน

- **AWS Shield Standard**: การป้องกัน DDoS ชั้น 3/4 ฟรีอัตโนมัติ เปิดเสมอ ดูดซับ SYN flood 50 Gbps ก่อนมันถึง Nimbus load balancer
- **AWS Shield Advanced**: การป้องกัน DDoS พรีเมียมพร้อมการเข้าถึง SRT และ cost protection กรณีใช้งานองค์กร
- **AWS WAF**: firewall ชั้นแอปพลิเคชัน ตรวจสอบและกรองคำขอ HTTP แนบกับ CloudFront, ALB หรือ API Gateway ใช้ Managed Rule Group สำหรับการป้องกัน OWASP Top 10 rate-based rule สำหรับการป้องกัน scraper
- **Amazon GuardDuty**: การตรวจจับภัยคุกคามทางพฤติกรรม แหล่งข้อมูลหลัก: CloudTrail event, VPC Flow Logs และ DNS logs การป้องกันเพิ่มเติมทางเลือกเพิ่ม S3 event, EKS/ECS runtime monitoring, RDS login event และ Lambda network activity สร้าง finding ที่แบ่งหมวดสำหรับกิจกรรมผิดปกติ ห้าประเภท finding หลัก: UnauthorizedAccess (console login), CryptoCurrency (mining), Recon (port probe), Trojan (C2 traffic), Policy (S3 misconfiguration)
- **Amazon Inspector**: การประเมินช่องโหว่อัตโนมัติ scan EC2 instance, ECR container image และ Lambda function package หา CVE ที่รู้จัก รันต่อเนื่องและประเมินใหม่เมื่อช่องโหว่ใหม่ถูกเผยแพร่ finding ไหลไปยัง Security Hub
- **Amazon Macie**: การค้นพบข้อมูลที่ละเอียดอ่อนใน S3 ตรวจจับ PII, credential และข้อมูลทางการเงิน จับการเปิดเผยที่ไม่มีรูปแบบพฤติกรรมผิดปกติ
- **AWS Security Hub**: รวม finding จากบริการความปลอดภัยทั้งหมดเข้า dashboard เดียว เปิดการตรวจสอบแบบรวมศูนย์ข้ามหลายบัญชี
- **CloudTrail**: รากฐานของ AWS security logging ทั้งหมด เปิด trail ที่เขียนไปยัง S3 สำหรับการเก็บระยะยาว ทุกบริการความปลอดภัยอ่านจากมัน

## เคล็ดลับการสอบ

*SAA-C03 Domain: ออกแบบสถาปัตยกรรมที่ปลอดภัย (Domain 1, Task 1.2)*

- **Shield Standard vs Advanced**: Standard ฟรีและอัตโนมัติ Advanced เสียเงินและเพิ่ม SRT, cost protection และการตรวจจับที่ดีกว่า สัญญาณสำหรับ Advanced: "DDoS ขนาดใหญ่" "การรับประกัน SLA ระหว่างการโจมตี" "การป้องกันทางการเงินต่อต้นทุนที่พุ่งเกี่ยวกับ DDoS"
- **สัญญาณ use case ของ WAF**: "บล็อก SQL injection" "บล็อก cross-site scripting" "rate limit การเรียก API" "บล็อก user-agent เฉพาะ" "การป้องกัน OWASP Top 10" → WAF
- **สัญญาณ GuardDuty**: "ตรวจจับกิจกรรม API ผิดปกติ" "ระบุ credential ที่ถูก compromise" "flag การเชื่อมต่อเครือข่าย EC2 ผิดปกติ" "threat intelligence" → GuardDuty
- **การแนบ WAF**: แนบกับ CloudFront (global), ALB (regional), API Gateway (regional), AppSync ได้
- **แหล่งข้อมูล GuardDuty**: สามแหล่งหลัก — CloudTrail event, VPC Flow Logs, DNS logs แหล่งทางเลือกที่ขยายรวม S3 data event, EKS audit log, RDS login event, Lambda network activity และ ECS runtime ข้อสอบอาจถามว่าแหล่งข้อมูลใดเกี่ยวข้องกับสถานการณ์การตรวจจับเฉพาะ: "RDS login ผิดปกติ" → GuardDuty RDS Protection; "ภัยคุกคาม runtime ของ container" → GuardDuty EKS/ECS Runtime Monitoring
- **Macie vs GuardDuty**: นี่คือตัวลวงในข้อสอบที่พบบ่อย **Macie** ใช้ ML ตรวจจับข้อมูลที่ละเอียดอ่อนใน S3 (PII, credential, ข้อมูลทางการเงิน) **GuardDuty** ตรวจจับภัยคุกคามและความผิดปกติในพฤติกรรม Macie เกี่ยวกับเนื้อหา GuardDuty เกี่ยวกับพฤติกรรม
- **Inspector vs. GuardDuty vs. Macie:** สามเลนส์ที่ต่างกัน ไม่มีอันใดทดแทนอันอื่น **Inspector** = การ scan ช่องโหว่ — CVE บน EC2 instance, container image ใน ECR และ Lambda function package รันต่อเนื่องและ re-scan เมื่อ CVE ใหม่ถูกเผยแพร่ **GuardDuty** = การตรวจจับภัยคุกคามทางพฤติกรรม — อะไรกำลังเกิดขึ้นตอนนี้ที่ดูผิดปกติ **Macie** = การค้นพบข้อมูลที่ละเอียดอ่อนใน S3 — PII, credential และข้อมูลทางการเงินที่ไม่ควรอยู่ที่นั่น ทริกเกอร์ในข้อสอบ: "ระบุช่องโหว่ที่ไม่ได้ patch บน EC2" หรือ "scan container image หา CVE" → Inspector "ตรวจจับ API call ผิดปกติหรือ credential ที่ถูก compromise" → GuardDuty "ค้นหา PII หรือข้อมูลที่ละเอียดอ่อนใน S3" → Macie
- **Security Hub**: รวม finding ความปลอดภัยจากหลายบริการและบัญชี สถานการณ์ข้อสอบ: "บริษัทมีหลายบัญชี AWS และอยากได้มุมมองเดียวของ finding ความปลอดภัยทั้งหมด" → Security Hub
- **Rate-based rules ใน WAF**: ใช้จำกัดคำขอต่อ IP ภายในหน้าต่างเวลา ต่างจาก Core Rule Set (ซึ่งตรงกับรูปแบบการโจมตี) ข้อสอบใช้ rate-based rule สำหรับ "ป้องกันความพยายาม login แบบ brute force" หรือ "บรรเทาการ scrape"
- **CloudTrail + GuardDuty + Security Hub**: สามอันนี้ด้วยกันเป็นแกนของ AWS security observability เปิด CloudTrail ก่อน (GuardDuty และ Security Hub พึ่งพามัน) แล้ว GuardDuty แล้ว Security Hub เพื่อรวม finding

## แบบฝึกหัด

**แบบฝึกหัด 1 — ทบทวน**

อธิบายความแตกต่างระหว่าง AWS WAF กับ Amazon GuardDuty แต่ละบริการป้องกันอะไร และทำงานที่ชั้นใด?

*(คำใบ้: คิดถึง WAF เป็นตัวกรองบนคำขอที่เข้ามา และ GuardDuty เป็นนักวิเคราะห์พฤติกรรมที่เฝ้าดู log ของคุณ)*

**แบบฝึกหัด 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: เว็บไซต์ของบริษัทค้าปลีกถูกเล็งโดย botnet ที่ส่งคำขอหลายล้านครั้งต่อชั่วโมงไปยัง product search API ของพวกเขา คำขอดูถูกต้อง (User-Agent string ที่ถูกต้อง, session cookie ที่ถูกต้อง) แต่ไม่ส่งผลเป็นการซื้อ — พวกมัน scrape ราคาสินค้า การโจมตีทำให้ลูกค้าที่ถูกต้องประสบเวลาตอบสนองที่ช้า

การรวมบริการใดจัดการภัยคุกคามนี้ได้ดีที่สุด?

A) AWS WAF พร้อมกฎ rate limiting และ CloudFront  
B) AWS Shield Advanced และ CloudFront  
C) Amazon GuardDuty และ AWS Shield Standard  
D) Network ACL ที่บล็อกช่วง IP ของ botnet

**คำใบ้ 1**: คำขอเป็นระดับ HTTP (ชั้นแอปพลิเคชัน) บริการใดทำงานที่ชั้น HTTP?

**คำใบ้ 2**: botnet ใช้ IP address ที่ต่างกันมากมาย — การบล็อกช่วง IP เฉพาะที่ระดับ NACL ไม่มีประสิทธิภาพต่อ botnet ขนาดใหญ่

**คำใบ้ 3**: rate limiting ตาม IP address ชะลอการ scrape ได้แม้คุณบล็อกมันสมบูรณ์ไม่ได้

**คำตอบ**: A

**คำอธิบาย**: AWS WAF rate limit คำขอต่อ IP address ได้ ลดผลกระทบของการ scrape ปริมาณสูงจากแหล่งเดียวใด CloudFront กระจาย traffic ขาเข้าข้ามเครือข่าย edge ของ AWS ดูดซับปริมาณและปกป้อง origin กฎ WAF ยังตรงกับรูปแบบคำขอ (คำขอเรียงต่อเนื่องอย่างรวดเร็วไปยัง API endpoint เดียวกัน) เพื่อระบุพฤติกรรมการ scrape ได้

**ทำไมไม่ใช่ B?** Shield Advanced ป้องกัน DDoS flood (ชั้น 3/4) สถานการณ์อธิบายการ scrape ชั้นแอปพลิเคชัน (HTTP request ชั้น 7) ซึ่ง Shield ไม่ตรวจสอบ

**ทำไมไม่ใช่ C?** GuardDuty ตรวจจับความผิดปกติในพฤติกรรมบัญชี AWS ของคุณ — มันไม่บล็อก HTTP request ที่เข้ามา Shield Standard ไม่จัดการการโจมตีชั้นแอปพลิเคชัน

**ทำไมไม่ใช่ D?** botnet ขนาดใหญ่ใช้ IP address หลายพันอันจากแหล่งกระจาย การบล็อกช่วงเฉพาะเป็นแนวทาง whack-a-mole ที่ล้มเหลวต่อ botnet ที่ซับซ้อน

*SAA-C03 Domain: ออกแบบสถาปัตยกรรมที่ปลอดภัย — Task 1.2*

**แบบฝึกหัด 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus กำลังพิจารณา threat model ขณะเตรียมจัดการข้อมูลบัตรเครดิต การทบทวน compliance PCI-DSS ต้องการ:

- การป้องกันการโจมตี DDoS ชั้นเครือข่าย
- การกรองชั้นแอปพลิเคชันสำหรับ web exploit ที่รู้จัก
- การ log ทุก API call ไปยังที่เก็บที่ตรวจจับการแก้ไขได้และระยะยาว
- การตรวจจับรูปแบบการเข้าถึงที่ผิดปกติไปยังบริการชำระเงิน

map แต่ละความต้องการกับบริการหรือการกำหนดค่า AWS เฉพาะ Shield Standard เพียงพอไหม หรือบริบท PCI-DSS แนะนำ Advanced? คุณจะแนบ WAF ที่ไหน?

*(ไม่มีคำตอบที่ถูกต้องเพียงข้อเดียว เป้าหมายคือการฝึก map ความต้องการ compliance กับบริการ AWS)*

## ฉากหลังเครดิต

GuardDuty ถูกเปิดใช้

สี่สิบแปดชั่วโมงต่อมา มันสร้าง finding แรก: *"EC2 Instance i-0abc123 กำลังสื่อสารกับ Tor exit node ที่รู้จัก"*

Leo มองที่ instance ID

"นั่นคือ instance ตรวจสอบภายใน" เขาพูด "อันที่ผมตั้งค่าให้รัน network diagnostics"

"มันควรสื่อสารกับ Tor exit node ไหม?"

"ไม่" เขาหยุด "ทำไมมันถึงทำ?"

เขาดึง instance ขึ้น มีคนติดตั้งเครื่องมือบนมัน — network scanner open-source ที่ถูกต้องที่ปรากฏว่ายังสื่อสารกับ Tor infrastructure สำหรับการรวบรวมข้อมูลแบบไม่ระบุตัวตน

"ดังนั้นเครื่องมือกำลังโทรกลับบ้าน" Priya พูด

"โดยที่ผมไม่รู้" Leo ยืนยัน

"นั่นคือความเสี่ยง supply chain dependency ที่ทำสิ่งที่คุณไม่ได้อนุญาต"

Leo ถอนการติดตั้งเครื่องมือ เขาตั้งกระบวนการทบทวนเครื่องมือบุคคลที่สามทุกตัวก่อนการติดตั้ง

"นี่คือระดับความหวาดระแวงที่เราอยู่ตอนนี้หรือ?" Maya ถาม

"ใช่" Priya พูด

"นี่คือระดับที่เราควรอยู่เสมอหรือ?" Maya ถาม

"ใช่เช่นกัน" Priya พูด

ในบทต่อไป: เกิดอะไรขึ้นเมื่อศูนย์ข้อมูลในออริกอนหายไป — และทำไม Nimbus ยังคงทำงานต่อ
