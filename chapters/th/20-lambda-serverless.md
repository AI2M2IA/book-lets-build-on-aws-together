# บทที่ 20: โมเดล Freelancer

เป็นบ่ายวันพุธที่เงียบสงบ Priya ถอดหูฟังออกเป็นครั้งคราว และออฟฟิศมีเสียงฮัมเบาๆ แบบที่หมายความว่าทุกคนกำลังจดจ่อแต่ไม่มีใครตื่นตระหนก Leo เปิด cost dashboard บนหน้าจอหนึ่งและรายการ EC2 instance บนอีกหน้าจอ

ลองนึกถึง freelancer ที่ทำงานแบบ on-call พวกเขาไม่ได้นั่งอยู่ที่โต๊ะตั้งแต่เก้าโมงถึงห้าโมง พวกเขารอ โทรศัพท์ดัง พวกเขาทำงาน ส่งใบแจ้งหนี้ แล้วกลับไปรอ ไม่มีงาน ไม่มีค่าใช้จ่าย การระเบิดของ requests พวกเขาจัดการทั้งหมดพร้อมกัน คุณจ่ายเฉพาะชั่วโมงที่ทำงานจริง — ไม่ใช่ชั่วโมงที่พวกเขาใช้ในการพร้อมให้บริการ

นั่นคือโมเดลที่บทนี้พูดถึง

มีความละเอียดอ่อนตรงนี้ที่ควรจดจำไว้ โมเดลดั้งเดิมคือ: จ้างพนักงาน จ่ายค่า 8 ชั่วโมง ได้ output ที่ผันแปร โมเดล freelancer คือ: จ่ายเฉพาะเมื่อโทรศัพท์ดัง ได้สิ่งที่ร้องขอพอดี สำหรับบริษัทที่มีอุปสงค์คงที่และคาดเดาได้ โมเดลพนักงานมีประสิทธิภาพมากกว่า — คุณรู้ว่าโทรศัพท์จะดังตลอดเวลา ดังนั้นการจ่ายรายชั่วโมงจึงเทียบเท่ากันและไม่มี overhead ของการเริ่มและสิ้นสุดการว่าจ้าง สำหรับบริษัทที่มีอุปสงค์ผันแปร พุ่งเป็นจุด หรือไม่บ่อย โมเดล freelancer ถูกกว่ามาก

AWS เสนอโมเดลนั้นสำหรับ compute — และว่ามันสมเหตุสมผลหรือไม่ขึ้นอยู่กับรูปแบบอุปสงค์ของคุณ คำถามแรกไม่เคยเป็น "โมเดลนี้ดีไหม?" แต่เป็น "workload ของฉันมีหน้าตาเป็นอย่างไรจริงๆ?"

สำหรับ workloads ส่วนใหญ่ที่ใหญ่กว่า startup: ส่วนผสม บางอย่างทำงานตลอดเวลา (API server, database) บางอย่างทำงานเฉพาะเมื่อถูก trigger (event processing, การสร้างรายงาน, การ resize รูปภาพ) โมเดล freelancer สำหรับหมวดที่สอง — และ Nimbus กำลังจะค้นพบว่าค่าใช้จ่ายของพวกเขามากแค่ไหนอยู่ตรงนั้น

---

SQS/SNS fan-out ได้ decouple order flow แล้ว แต่ workers ที่บริโภคคิวเหล่านั้นยังคงรันบน EC2 instances ที่เรียกเก็บเงินรายชั่วโมง — โดยไม่คำนึงว่าพวกมันส่งอีเมลจริงๆ กี่ฉบับ สถาปัตยกรรมถูกต้อง; cost model ยังคงมีรอยรั่ว

Priya สังเกตเห็นมันก่อน

"Email service" เธอพูด "เราส่งอีเมลกี่ฉบับต่อวัน?"

Leo ตรวจสอบ metrics "เฉลี่ย 400 ต่อวัน Peak ประมาณ 1,200 คืนวันศุกร์"

"แล้ว EC2 instance ที่รัน email service — มันทำงานนานแค่ไหน?"

"ตลอดเวลา 24/7"

"แม้แต่ตีสามตอนที่เราส่งอีเมลศูนย์ฉบับ?"

เงียบ

Leo เปิดกราฟ CloudWatch CPU สำหรับ EC2 instance ของ email service กราฟแสดง 18 ชั่วโมงของการทำงานต่อเนื่อง ในช่วง peak วันศุกร์: CPU ที่ 38% จัดการการระเบิดของอีเมล หลังเที่ยงคืน: CPU ลดลงเหลือ 3% อยู่ตรงนั้นจนกระทั่งออร์เดอร์มื้อกลางวันเริ่มขึ้น

สามเปอร์เซ็นต์ CPU เป็นเวลา 18 ชั่วโมงติดต่อกัน instance กำลังทำงาน มันกำลังเรียกเก็บเงิน มันไม่ได้ทำอะไรที่มีความหมาย

"เราจ่ายเงินสำหรับคอมพิวเตอร์ที่นั่งอยู่ตรงนั้นไม่ทำอะไร" Leo พูด

"วันละกี่ชั่วโมง?"

เงียบมากขึ้น

"ประมาณ 18"

Tom ตั้งใจฟังมากในตอนนี้

"และไม่ใช่แค่ email service" Priya เสริม "image resizing service สำหรับรูปภาพร้านอาหารทำงานที่ 1% CPU เกือบตลอดเวลา มันพุ่งเฉพาะเมื่อร้านอาหารอัปโหลดเมนูใหม่ ซึ่งเกิดขึ้น เอ่อ ไม่กี่ครั้งต่อวันต่อร้าน?"

"ใช่" Leo ยืนยัน

"งาน nightly cleanup ที่ลบ temp files — นั่นทำงาน 4 นาทีตอนตี 2 แล้วนั่งเฉยๆ ทั้งหมด 23 ชั่วโมง 56 นาที"

"ใช่อีกเช่นกัน"

รูปแบบเหมือนกันทั่วทั้ง services ขนาดเล็กของ Nimbus: compute จ่ายค่า 24 ชั่วโมงต่อวัน ใช้แค่เศษเสี้ยวของนั้น

---

**เซิร์ฟเวอร์ไม่ใช่คำตอบเสมอไป**

EC2 instances ถาวร คุณเริ่มหนึ่งตัวและมันทำงานจนกว่าคุณจะหยุด — 24 ชั่วโมงต่อวัน 7 วันต่อสัปดาห์ โดยไม่คำนึงถึงการใช้งานจริง สำหรับ web server ของคุณ (ซึ่งจัดการ traffic ทุกชั่วโมง) นั่นถูกต้อง สำหรับ email service (ซึ่งส่งการระเบิดของอีเมลแล้วนั่งเฉยเป็นชั่วโมง) มันสิ้นเปลือง

Auto Scaling Group สามารถ scale email service ลงเหลือหนึ่ง instance ในช่วงนอกเวลา peak แต่หนึ่ง instance ก็ยังคงทำงานตลอดเวลา

นี่คือคำถามที่ Tom กลับมาถามอยู่เรื่อยๆ เมื่อดูบิล: แต่ละ service ทำอะไรอยู่จริงๆ ในช่วง 18 ชั่วโมงที่ 3% CPU นั้น? ไม่ใช่ไม่ทำอะไร ในทางเทคนิค — instance กำลังรอ ตรวจสอบหาเหตุการณ์ รักษา state ของมัน แต่จากมุมมองทางธุรกิจ: ไม่ทำอะไร service ไม่ได้ส่งมอบคุณค่า มันกำลังเรียกเก็บเงิน

สำหรับ workloads ที่ idle จริงๆ เกือบตลอดเวลา EC2 instance ที่เปิดอยู่ตลอดคือการจ่ายค่าเช่าอพาร์ตเมนต์ที่คุณไปเยือนเฉพาะวันหยุดสุดสัปดาห์ อพาร์ตเมนต์เป็นของคุณ; ค่าเช่าไม่หยุด

โมเดล freelancer แก้ปัญหานี้อย่างสมบูรณ์ code มีอยู่ มันแค่ไม่ทำงานจนกว่าจะมีเหตุผลที่จะทำงาน ไม่มีค่า idle ไม่มี reserved capacity ไม่มีเซิร์ฟเวอร์รออยู่ข้างโทรศัพท์

นั่นคือหลักการของ **serverless computing**

**AWS Lambda: Code โดยไม่มีเซิร์ฟเวอร์**

**AWS Lambda** ให้คุณรัน code ตอบสนองต่อเหตุการณ์โดยไม่ต้องจัดหาหรือจัดการเซิร์ฟเวอร์ คุณอัปโหลด function ระบุว่าอะไร trigger มัน และ Lambda รันมันเมื่อ trigger ยิง

Lambda function:

- ไม่มี persistent state (แต่ละ invocation เป็นอิสระ)
- รันสูงสุด 15 นาทีต่อ invocation
- ขยายขนาดโดยอัตโนมัติจาก 0 ถึงหลายพัน concurrent invocations
- เรียกเก็บเงินเฉพาะเมื่อทำงาน (ต่อ 1 ms ของการทำงาน ปัดขึ้น ต่อ GB ของ memory ที่จัดสรร)

เมื่อไม่มี trigger, Lambda ไม่มีค่าใช้จ่าย เมื่อ triggers ยิง, Lambda ทำงานและเรียกเก็บเงิน เมื่อ 10,000 triggers ยิงพร้อมกัน, Lambda รัน 10,000 concurrent invocations การ scaling เป็นอัตโนมัติและเกือบจะทันที

**Event Triggers: อะไรปลุก Lambda ให้ตื่น**

Lambda functions ไม่ทำงานด้วยตัวเอง — พวกมันตอบสนองต่อเหตุการณ์ Triggers ทั่วไปได้แก่:

- **SQS queue**: ประมวลผล messages จากคิว Lambda poll คิวและเรียก function ด้วย batches ของ messages
- **API Gateway**: HTTP request เข้ามา API Gateway trigger Lambda Lambda สร้าง response
- **S3 event**: ไฟล์ถูกอัปโหลดไปยัง S3 Lambda ประมวลผลมัน (resize รูปภาพ, parse CSV, validate เอกสาร)
- **SNS**: message ถูก publish ไปยัง topic Lambda ได้รับแจ้ง
- **DynamoDB Streams**: record ใน DynamoDB เปลี่ยน Lambda ประมวลผลการเปลี่ยนแปลง
- **CloudWatch Events (EventBridge)**: scheduled event (เช่น cron job) ทำงานในเวลาที่กำหนด
- **ALB**: HTTP request มาถึง load balancer Lambda สามารถจัดการ routes บางอย่าง

สำหรับ Nimbus, email service กลายเป็น Lambda function ที่ trigger โดย SQS queue ของมัน เมื่อ message มาถึงในคิว Lambda ถูกเรียกด้วยเนื้อหา message ส่งอีเมลผ่าน SES (Simple Email Service) แล้วออก

ศูนย์เซิร์ฟเวอร์ ศูนย์ idle time ศูนย์ค่าใช้จ่ายเมื่อ idle

pattern ของ Lambda + SQS ควรค่าแก่การซึมซับ: SQS จัดการคิว ความทนทาน retry logic และ DLQ Lambda จัดการการประมวลผล คุณได้ประโยชน์ของการ decoupling ของ SQS พร้อม scale-to-zero economics ของ Lambda ไม่มี service ใดทำงานของอีกตัว พวกมันประกอบกันอย่างสะอาด

"เกิดอะไรขึ้นกับ message ที่ผิดรูปแบบในคิว?" Priya ถาม "input ที่ไม่ดีสามารถทำให้ Lambda crash ในแบบที่ส่งผลต่อ functions อื่นใน account ได้ไหม?"

Lambda invocations ถูกแยกจากกัน function ที่ crash ไม่ส่งผลต่อ functions อื่น Lambda ที่ throw unhandled exception บน message ที่ผิดรูปแบบ: message กลับไปยังคิว retry จนถึงขีดจำกัดที่ตั้งค่าไว้ แล้วย้ายไปยัง DLQ ตัว Lambda เองยังคงพร้อมสำหรับ message ถัดไป Input validation ภายใน Lambda handler ยังคงสำคัญ — เพื่อจับข้อมูลที่ผิดรูปแบบก่อนพยายามประมวลผล — แต่ message ที่ไม่ดีตัวเดียวไม่สามารถทำให้ function ล่มได้

**ปัญหา Cold Start**

Lambda functions ทำงานใน **execution environments** — containers ขนาดเล็กที่แยกจากกัน เมื่อ function ถูกเรียก:

1. AWS ตรวจสอบว่ามี warm execution environment ว่างหรือไม่ (ตัวที่จัดการ invocation ล่าสุด)
2. ถ้าอุ่น: function รันทันที
3. ถ้าเย็น: AWS เริ่มต้น execution environment ใหม่ — ดาวน์โหลด code ของคุณ เริ่ม runtime รัน initialization code ของคุณ — แล้วรัน function

**cold start** เพิ่ม 100ms ถึงไม่กี่วินาทีของ latency ขึ้นอยู่กับ runtime (Java และ .NET มี cold starts ที่นานกว่า Python และ Node.js) และขนาดของ code package ของคุณ

คุณอาจสงสัยว่า: ถ้า Lambda เริ่มจากศูนย์ทุกครั้ง มันไม่ทำให้ช้ากว่าเซิร์ฟเวอร์ที่ทำงานอยู่แล้วหรือ? ใช่ — บางครั้ง นั่นคือปัญหา cold start และมันสำคัญสำหรับ time-sensitive user-facing APIs มันไม่สำคัญเลยสำหรับ background jobs ที่ผู้ใช้ได้รับการยืนยันไปแล้ว cold start 200ms บน email service ที่ทำงานในพื้นหลังนั้นมองไม่เห็นสำหรับใคร

สำหรับการประมวลผล asynchronous (การส่งอีเมล, การ resize รูปภาพ) cold starts มองไม่เห็นสำหรับผู้ใช้

สำหรับ synchronous APIs (HTTP requests ที่ผู้ใช้รอ response) cold starts อาจทำให้เกิด slow responses เป็นครั้งคราว

**การบรรเทา**:

- **Provisioned concurrency**: pre-warm execution environments จำนวนที่ระบุ พวกมันพร้อมเสมอ คุณจ่ายสำหรับสิ่งนี้แม้เมื่อพวกมันไม่ได้ประมวลผล requests
- **ขนาด package ที่เล็กกว่า**: code ที่เล็กกว่าเริ่มต้นเร็วกว่า
- **Warm-up invocations**: scheduled pings เพื่อให้ functions อุ่น (วิธีที่พบบ่อยแต่ไม่หรู)
- **เลือก runtime ที่ถูกต้อง**: Python และ Node.js cold start เร็วกว่า Java

**การสืบสวน Cold Start จริง**

สองสัปดาห์หลังการ migrate ไป Lambda, Leo ได้รับข้อความ Slack จากพันธมิตรร้านอาหาร: "การยืนยันออร์เดอร์บางครั้งใช้เวลา 3 วินาที ปกติมันเร็ว เกิดอะไรขึ้น?"

Leo เปิด CloudWatch metrics สำหรับ Lambda function ในกราฟ "Duration" เขาเห็น pattern: invocation แรกหลังจากช่องว่างใดๆ ที่มากกว่า 15-20 นาทีจะพุ่งขึ้นเป็น 2,800-3,200 มิลลิวินาที invocations ถัดมา: 180-220 มิลลิวินาที

cold starts แบบคลาสสิก

เขาดึง X-Ray trace สำหรับหนึ่งใน invocations 3 วินาที timeline แสดงให้เห็นชัดเจน:

- Initialization phase: 2,640ms (ดาวน์โหลด function code, เริ่ม Node.js runtime, รัน module-level initialization code)
- Handler function execution: 290ms

Initialization phase คือปัญหา เขาดูที่ initialization code function กำลัง import SDK ขนาดใหญ่ เริ่ม database connection และโหลด configuration จาก AWS Secrets Manager — ทั้งหมดตอน startup

"บางส่วนของ initialization นี้ต้องเกิดขึ้นเพียงครั้งเดียวต่อ execution environment" Leo พูด "แต่มันกำลังเกิดขึ้นในทุก cold start"

เขาปรับโครงสร้าง Lambda code ใหม่เพื่อเริ่ม database connection นอก handler function (เพื่อให้ใช้ซ้ำข้าม warm invocations) และลดขนาด package โดยลบ SDK modules ที่ไม่ได้ใช้ เขายังเปลี่ยนจากการ bundle AWS SDK ทั้งหมดเป็นการ import เฉพาะ services ที่เขาต้องการ

หลังการ optimize:

- Cold start duration: 1,100ms (ยังมีอยู่ แต่รุนแรงน้อยลง)
- Warm invocations: 165ms

cold start 1.1 วินาทียังเกิดขึ้นเป็นครั้งคราว สำหรับ email service (asynchronous, ความล่าช้าที่ผู้ใช้เห็นมองไม่เห็น) นี่ยอมรับได้ สำหรับ restaurant notification Lambda (customer-facing, สั่งจากแท็บเล็ต) Priya ผลักดันให้ใช้ provisioned concurrency: สอง pre-warmed environments พร้อมเสมอ

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถาม

สอง provisioned concurrency environments ที่ 256MB: ประมาณ $5.40/เดือน latency spikes หยุด

**ราคา Lambda: ทำไม Tom ยิ้ม**

ราคา Lambda มีสองส่วนประกอบ:

1. **ค่า Request**: $0.20 ต่อล้าน invocations
2. **ค่า Duration**: $0.0000166667 ต่อ GB-second (memory ที่จัดสรร × วินาทีที่ทำงาน)

ล้าน requests แรกต่อเดือนฟรี (ตลอดไป ไม่ใช่แค่ในปีแรก)

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถามก่อนที่ Leo จะเปิดเครื่องคิดเลข

Tom คำนวณสำหรับ email service เอง:

- สมมติว่าทุกวันเป็นวันศุกร์ — กรณีเลวร้ายที่สุด: 1,200 อีเมลต่อวัน × 30 วัน = 36,000 invocations ต่อเดือน
- แต่ละ invocation ใช้เวลา ~2 วินาทีที่ memory 256MB
- Duration: 36,000 × 2 × 0.25GB × $0.0000166667 = $0.30/เดือน
- Requests: 36,000 << 1,000,000 (free tier) = $0.00/เดือน

"และ 18,000 GB-seconds นั้นอยู่ในขอบเขต 400,000 GB-seconds ของ duration ที่ฟรีเสมอ" Tom เสริม "ดังนั้นค่าใช้จ่ายจริงจะเป็นศูนย์ แต่ผมตั้งใจเพิกเฉยต่อ free tier — ผมอยากรู้ unit cost จริง"

EC2 instance สำหรับ email service: $18/เดือน

"ผม deploy มันแล้ว — โอ้" Leo หยุดตัวเอง เขา push email service Lambda ไป production ก่อนทำ DLQ configuration เสร็จ "ขอเวลาห้านาที"

Tom เงียบไปครู่หนึ่ง แล้ว: "เราควรทำสิ่งนี้กับทุกอย่าง"

**Lambda เก่งอะไร (และไม่เก่งอะไร)**

"เดี๋ยว — แต่*ทำไม*เราถึงไม่ใช้ Lambda สำหรับทุกอย่างเลยล่ะ?" Maya ถาม "ถ้ามันถูกกว่าและ scale อัตโนมัติ อะไรคือจุดที่ต้องระวัง?"

"ขีดจำกัด 15 นาที" Leo พูด "และ cold starts สำหรับอะไรก็ตามที่ user-facing และ statelessness — คุณเก็บอะไรใน memory ระหว่าง invocations ไม่ได้"

ถ้า workload ของคุณพุ่งเป็นจุด event-driven และเสร็จในเวลาต่ำกว่า 15 นาที Lambda จะมีต้นทุนเป็นเศษเสี้ยวของ EC2 instance ที่เปิดอยู่ตลอด — แต่ถ้า workload ของคุณเป็น data processing job ที่ทำงานนานซึ่งเข้าใกล้หรือเกินขีดจำกัด 15 นาที Lambda คือเครื่องมือที่ผิดและคุณจะต้องการ ECS, Batch หรือวิธีการแบบ EC2

Lambda ยอดเยี่ยมสำหรับ:

- **Event-driven processing**: ตอบสนองต่อเหตุการณ์ (file uploads, queue messages, scheduled tasks)
- **งานระยะสั้น**: การประมวลผลที่เสร็จภายใน 15 นาทีสบายๆ
- **Traffic ที่พุ่งเป็นจุด คาดเดาไม่ได้**: Lambda scale จาก 0 ถึงหลายพันทันที — ไม่ต้อง pre-provisioning
- **operations ที่ไม่บ่อย**: รายงานที่ทำงานตอนตี 2 ทุกวัน งาน cleanup ที่ทำงานทุกสัปดาห์
- **Glue code**: functions เล็กๆ ที่ย้ายข้อมูลระหว่าง services

คุณอาจสงสัยว่า: เกิดอะไรขึ้นกับการ scaling ของ Lambda เมื่อการระเบิดของ 10,000 events มาถึงพร้อมกันกะทันหัน? ขีดจำกัด concurrency เริ่มต้นของ Lambda คือ 1,000 concurrent executions ต่อ account ถ้า 10,000 events มาถึงพร้อมกัน up to 1,000 invocations รันทันที; ส่วนที่เหลือรอใน SQS queue (ถ้า trigger ผ่าน SQS) และถูกประมวลผลเมื่อ capacity ว่างขึ้น สิ่งนี้มักจะใช้ได้สำหรับการประมวลผลแบบ queue-based สำหรับ use cases ที่ไวต่อ latency, burst limit ของ Lambda (อัตราเริ่มต้นที่ concurrent executions ใหม่ถูกเพิ่ม) อาจทำให้เกิด throttling ชั่วคราวในระหว่าง spikes กะทันหัน — provisioned concurrency หลีกเลี่ยงสิ่งนี้โดยมี capacity ที่จัดสรรไว้ล่วงหน้า

สำหรับ email service ของ Nimbus ที่ scale ปัจจุบัน 1,000 concurrent invocations มากกว่าที่พวกเขาจะต้องการเสียอีก แต่มันเป็นข้อจำกัดที่ควรรู้ก่อนที่คุณจะชน

Lambda ไม่ดีสำหรับ:

- **กระบวนการที่ทำงานนาน**: ขีดจำกัด 15 นาทีเป็นกำแพงตายตัว
- **แอปพลิเคชันที่มี state**: Lambda functions เป็น stateless โดยการออกแบบ — แต่ละ invocation เป็นอิสระ
- **APIs ที่ throughput สูง latency ต่ำ**: cold starts อาจทำให้เกิด latency spikes; provisioned concurrency บรรเทาสิ่งนี้แต่เพิ่มค่าใช้จ่าย
- **แอปพลิเคชันที่ต้องการ persistent connections**: Lambda รักษา long-lived database connection pool ได้ยาก (แม้ว่า connection pooling tools เช่น RDS Proxy จะช่วย)
- **Traditional web servers**: เป็นไปได้ แต่ไม่ใช่ความเหมาะสมตามธรรมชาติ

**กำแพง 15 นาที: เมื่อ Lambda เป็นเครื่องมือที่ผิด**

สามสัปดาห์หลังการ migrate, Leo พยายามย้าย workload อีกหนึ่งไป Lambda: nightly analytics report generator มันดึงข้อมูลออร์เดอร์จากฐานข้อมูล join กับ restaurant metadata คำนวณสถิติ และสร้าง PDF

ในคืนแรก Lambda invocation ล้มเหลวด้วย timeout error

"การสร้างรายงานใช้เวลา 17 นาที" Leo พูดในเช้าวันรุ่งขึ้น

"สูงสุดของ Lambda คือ 15" Priya พูด

"ใช่ ตอนนี้ผมรู้แล้ว"

เขาตรวจสอบเวลาประมวลผลเฉลี่ย (8 นาที) และสันนิษฐานว่า Lambda จะใช้ได้ เขาไม่ได้ตรวจสอบ tail — คืนที่ data volume สูงกว่าและ query ใช้เวลานานกว่า ในคืนเหล่านั้น 15 นาทีไม่พอ

"ดังนั้นรายงานก็แค่... ไม่ถูกสร้าง?" Maya ถาม

"ถูกต้อง ไม่มีการแจ้งเตือน error ไม่มีรายงานบางส่วน แค่ความเงียบ"

"ผม deploy มันแล้ว — โอ้" Leo พูด

นี่เป็นหนึ่งในวิธีเฉพาะที่ Lambda ล้มเหลวอย่างไม่สง่างาม: timeout ไม่สร้าง output, ไม่มี error message ในแอปพลิเคชัน แค่ CloudWatch error log ถ้าคุณไม่ได้ monitor Lambda timeout errors โดยเฉพาะ คุณอาจไม่สังเกตเห็นเป็นวันๆ

วิธีแก้: ย้าย report generator ไป ECS Fargate — containers โดยไม่จัดการเซิร์ฟเวอร์; บทถัดไป — ซึ่งไม่มีขีดจำกัดเวลา Lambda คือเครื่องมือที่ผิดสำหรับ workloads ที่อาจเกิน 15 นาทีแม้เป็นครั้งคราว บทเรียนไม่ใช่ "Lambda แย่" บทเรียนคือ "Lambda คือเครื่องมือที่ถูกต้องสำหรับ workloads ที่อยู่ในข้อจำกัดของมัน — และเป็นแหล่งของความล้มเหลวที่น่าประหลาดใจเมื่อมันไม่อยู่"

**RDS Proxy: Connection Pooling สำหรับ Lambda**

ธรรมชาติ stateless ของ Lambda สร้างปัญหาฐานข้อมูลเฉพาะ

เมื่อ EC2 instance เชื่อมต่อกับ RDS มันรักษา persistent connection pool แอปพลิเคชันใช้ connections จาก pool ซ้ำ RDS สามารถจัดการได้ เช่น 200 connections พร้อมกัน

เมื่อ Lambda จัดการ 500 invocations พร้อมกัน แต่ละ invocation พยายามเปิด database connection ของตัวเอง นั่นคือ 500 connections ใหม่ — ท่วมท้นฐานข้อมูลที่รองรับ 200

**Amazon RDS Proxy** อยู่ระหว่าง Lambda functions และ RDS รักษา persistent connection pool และ multiplex connections อายุสั้นของ Lambda ผ่านมัน

แทนที่จะเป็น: Lambda invocation → RDS connection ใหม่ (สำหรับแต่ละ 500 concurrent invocations)

ด้วย RDS Proxy: Lambda invocation → RDS Proxy → pool ของ 20 persistent RDS connections

"proxy ต้องการ RDS credentials" Priya พูด "พวกมันอยู่ที่ไหน? มันเก็บพวกมันไหม?"

RDS Proxy เก็บ credentials ใน Secrets Manager และ rotate พวกมันโดยอัตโนมัติ IAM role ของ Lambda function ให้สิทธิ์การเข้าถึง proxy (โดยใช้ IAM authentication) ไม่ใช่ RDS credentials โดยตรง credentials ไม่เคยถูกเปิดเผยต่อ Lambda code

"ดังนั้น Lambda function authenticate ผ่าน IAM" Leo ยืนยัน "และ proxy จัดการ database credentials จริง"

สำหรับ order processing Lambda ของ Nimbus (ตัวที่ query RDS สำหรับการ validate ออร์เดอร์) RDS Proxy ขจัด connection pool exhaustion ในระหว่าง peak Friday traffic

**Lambda Layers: Dependencies ที่ใช้ร่วมกัน**

email service Lambda, notification Lambda และ report Lambda ทั้งหมดใช้ internal library code เดียวกัน: utility functions สำหรับการ format สกุลเงิน sanitize inputs logging ในรูปแบบมาตรฐาน

หากไม่มี Lambda Layers, shared code นั้นต้องถูก bundle เข้าไปใน deployment package ของแต่ละ function สาม functions สามสำเนาของ library 2MB เดียวกัน เมื่อ library อัปเดต ทั้งสาม functions ต้องการ deployments ใหม่

**Lambda Layers** เป็น packages แยกต่างหากที่ Lambda functions สามารถอ้างอิงได้ตอน runtime shared library ถูกแยกออกเป็น layer สาม functions อ้างอิง layer การอัปเดต shared library หมายถึงการอัปเดต layer version — ไม่ใช่การ redeploy ทั้งสาม functions

ประโยชน์เพิ่มเติม: function packages แต่ละตัวที่เล็กกว่าหมายถึง cold starts ที่เร็วกว่า

"สิ่งหนึ่งที่ layers ไม่เปลี่ยน: execution role" Priya พูด "ถ้า Lambda มีสิทธิ์กว้างเกินไป function ที่ถูกบุกรุกสามารถเข้าถึงทุกอย่างใน account"

"หลักการเดียวกับ EC2 roles" Leo พูด "Least privilege แต่ละ Lambda ได้รับเฉพาะสิทธิ์ที่มันต้องการจริงๆ"

"ดังนั้น Lambda ไม่ใช่การทดแทน EC2" Maya พูด "มันเป็นเครื่องมือที่แตกต่างสำหรับงานที่แตกต่าง"

"Nimbus web API ยังอยู่บน EC2 หรือ ECS" Leo ยืนยัน "email service, image resizer, nightly report generator, log cleaner — พวกนั้นย้ายไป Lambda"

**ปรัชญา Serverless**

Lambda เป็นส่วนหนึ่งของแนวคิดที่กว้างกว่า: **serverless** — การสร้างแอปพลิเคชันที่คุณไม่จัดการเซิร์ฟเวอร์ มีแต่ code

Nimbus stack แบบ serverless เต็มรูปแบบอาจมีหน้าตา:

- API Gateway + Lambda (แทน EC2 กับ web server)
- DynamoDB (แทน RDS — เป็น serverless เช่นกัน ไม่มีการจัดการเซิร์ฟเวอร์)
- S3 (static assets — เป็น serverless โดยเนื้อแท้)
- SNS + SQS (messaging — serverless)
- Lambda (background processing ทั้งหมด)

เสน่ห์: คุณเขียน code; AWS จัดการทุกอย่างอื่น ไม่มี patching ไม่มี scaling configuration ไม่มี capacity planning

## Amazon API Gateway

รายการ Lambda trigger กล่าวถึง API Gateway สั้นๆ: HTTP request เข้ามา, API Gateway trigger Lambda นั่นถูกต้อง แต่มันบรรยาย API Gateway น้อยเกินไปว่าจริงๆ แล้วมันคืออะไร

"เดี๋ยว — แต่*ทำไม*เราถึงวาง API Gateway ไว้หน้า Lambda?" Maya ถาม "Lambda รับ HTTP requests โดยตรงไม่ได้หรือ?"

Lambda สามารถรับ HTTP requests ผ่าน function URL — HTTPS endpoint ที่ง่ายและตรงไปตรงมา แต่มันไม่จัดการ routing, authorization, throttling, caching หรือ request transformation สำหรับ production API ความกังวลเหล่านั้นมีอยู่โดยไม่คำนึงว่า backend ของคุณเป็น Lambda หรือ EC2

**Amazon API Gateway** เป็น fully managed service สำหรับการสร้าง deploy และจัดการ APIs ที่ scale ใดๆ มันจัดการ traffic management, authorization, throttling, caching และ monitoring เพื่อให้ Lambda function ของคุณ (หรือ EC2 หรือ HTTP backend ใดๆ) ไม่ต้อง implement พวกมันเอง

**สาม API types:**

**REST API** เป็นตัวเลือกที่มี feature มากที่สุด มันรองรับ request และ response transformation, response caching, usage plans ที่ผูกกับ API keys และ authorization types ทั้งหมด คำถามข้อสอบ SAA-C03 ส่วนใหญ่ที่กล่าวถึง API Gateway เกี่ยวข้องกับ REST API

**HTTP API** ง่ายกว่าและถูกกว่า — ค่าใช้จ่ายต่ำกว่า REST API ประมาณ 70% มันถูกออกแบบสำหรับ Lambda backends และ HTTP proxies มันรองรับ OIDC และ OAuth 2.0 authorization แต่ไม่รองรับ request transformation หรือ caching ถ้าคุณไม่ต้องการ feature ขั้นสูงของ REST API, HTTP API คือตัวเลือกที่ถูกต้อง

**WebSocket API** จัดการ persistent two-way connections API Gateway จัดการ connection lifecycle และ route messages ไปยัง Lambda ตามเนื้อหา message Lambda function ไม่ต้องจัดการ socket state — API Gateway ทำสิ่งนั้น

**Authorization options** (ตัวที่ข้อสอบทดสอบ):

**Cognito User Pool authorizer** validate JWT จาก Cognito User Pool ไม่ต้องการ Lambda API Gateway ตรวจสอบ token เอง ถ้ามันใช้ได้ request ผ่านไป

**Lambda authorizer** รัน Lambda function ของคุณเองเพื่อ validate token — custom JWT, OAuth token จาก third-party identity provider, API key ในรูปแบบเฉพาะ Lambda คืนค่า IAM policy ถ้า policy อนุญาต action, request ดำเนินต่อไป

**API key** เป็น key ง่ายๆ ที่ส่งใน request header API keys สำหรับ rate limiting ตาม client ไม่ใช่สำหรับ authentication อย่าใช้พวกมันเป็นกลไกความปลอดภัย — พวกมันไม่ใช่ secrets พวกมันเป็น identifiers

**Throttling และ usage plans:**

โดยค่าเริ่มต้น API Gateway อนุญาต 10,000 requests ต่อวินาทีที่ระดับ account (soft limit) พร้อม burst ที่ 5,000 เกินมันและ clients ได้รับ `429 Too Many Requests` — backend ของคุณไม่รู้สึกด้วยซ้ำ เมื่อคุณต้องการขีดจำกัดต่อ client คุณสร้าง usage plan: ผูกมันกับ API key ตั้ง request rate และ quota รายวันหรือรายเดือน burst ของ client หนึ่งไม่บริโภคการจัดสรรของ client อื่น

สองตัวเลขที่ควรเก็บไว้: payload สูงสุดคือ **10 MB** และ default integration timeout คือ **29 วินาที** — ถ้า backend ของคุณใช้เวลานานกว่า gateway จะยอมแพ้ (ตั้งแต่ปี 2024 timeout นั้นสามารถเพิ่มเกิน 29 วินาทีสำหรับ Regional และ private REST APIs ผ่านการเพิ่ม quota — แต่ default 29 วินาทียังคงเป็นสิ่งที่ข้อสอบคาดหวัง) API Gateway สำหรับ request/response APIs ไม่ใช่ long-running jobs; สำหรับพวกนั้น ส่งงานให้ SQS หรือ Step Functions และตอบกลับทันที

"นี่มีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถาม

สำหรับ REST API: $3.50 ต่อล้าน API calls บวก $0.09 ต่อ GB ของ data transfer สำหรับ traffic ขนาดเล็กถึงกลาง มันแทบจะฟรี สำหรับ APIs ปริมาณสูง ราคาที่ต่ำกว่าของ HTTP API กลายเป็นเรื่องที่มีความหมาย

Leo ชี้ไปที่รายการ Lambda trigger ที่เขาเขียนไว้ก่อนหน้านี้ "ดังนั้น API Gateway ไม่ใช่แค่วิธี trigger Lambda มันเป็นสิ่งที่ทำให้ Lambda รู้สึกเหมือน API จริง"

"Lambda function จัดการ business logic" Priya พูด "API Gateway จัดการทุกอย่างข้างหน้ามัน — routing, auth, throttling, monitoring แต่ละตัวทำสิ่งเดียว"

"แล้วถ้ามีคนพยายามเรียก Lambda โดยตรง bypass API Gateway ล่ะ?"

"Lambda execution policy อนุญาตเฉพาะ invocations จาก API Gateway" Priya พูด "resource-based policy บน Lambda ปฏิเสธทุกอย่างอื่น"

ความเป็นจริง: serverless มี operational complexity ของตัวเอง — การ debug distributed Lambda functions, การจัดการ cold starts, การเข้าใจ concurrency limits มันไม่ได้ง่ายกว่า แค่แตกต่าง

"เดี๋ยว — แต่*ทำไม* serverless ถึง 'ไม่ง่ายกว่า'?" Maya ถาม "ทั้ง pitch คือมันลด operational burden"

"มันลด operational burden บางอย่าง" Leo พูด "Infrastructure provisioning, patching, scaling configuration — พวกนั้นหายไป สิ่งที่เหลือแตกต่าง: การจัดการ cold start, distributed tracing ข้าม functions ที่คุณ SSH เข้าไม่ได้, concurrency limits, การจัดการ function versions และ aliases, การเข้าใจว่า Layer updates แพร่กระจายอย่างไร, การจัดการ 15-minute timeouts อย่างสง่างาม"

"ดังนั้น burden เลื่อน" Priya พูด "จาก infrastructure operations ไปยัง function operations"

"ใช่ สำหรับ workloads จำนวนมาก — โดยเฉพาะ event-driven, เล็ก, พุ่งเป็นจุด — นั่นเป็นการแลกเปลี่ยนที่ดีกว่า สำหรับ application server ที่ทำงานนานที่วิศวกรต้องโต้ตอบและ debug, EC2 หรือ containers มักยังคงเป็นตัวเลือกที่ถูกต้อง"

คุณอาจสงสัยว่า: serverless คืออนาคต และทุกอย่างควรย้ายไป Lambda ในที่สุดหรือไม่? คำตอบที่ซื่อสัตย์คือมันขึ้นอยู่กับ workload Serverless ครองการประมวลผล event-driven มันรุกคืบอย่างมากใน HTTP APIs (ผ่าน API Gateway + Lambda) มันยังไม่ได้ทดแทน always-on application servers, long-running batch processing หรือ stateful services — และอาจจะไม่ เพราะ use cases เหล่านั้นไม่ได้ประโยชน์จากโมเดลของ Lambda คำถามเครื่องมือที่ถูกต้องไม่เคยหายไป มันแค่นำไปใช้กับตัวเลือกที่แตกต่างกันตามกาลเวลา

## จุดแข็งและข้อจำกัด

**ทำไม Lambda จึงทรงพลัง**:

- pay-per-use ที่แท้จริง — ศูนย์ค่าใช้จ่ายเมื่อ idle
- การ scaling อัตโนมัติโดยไม่ต้องตั้งค่า
- ไม่มีเซิร์ฟเวอร์ให้ patch หรือ maintain
- free tier ที่ใจกว้าง (1 ล้าน requests ต่อเดือน ฟรีตลอดไป)
- การ integrate ที่แน่นแฟ้นกับ AWS ส่วนที่เหลือ
- RDS Proxy และ Lambda Layers จัดการสองในจุดเจ็บปวดที่พบบ่อยที่สุดของ Lambda (connection pooling และ code sharing) โดยไม่ต้องการการเปลี่ยนแปลงสถาปัตยกรรม

**จุดที่ซับซ้อน**:

- cold starts เป็นเรื่องจริงและต้องการการจัดการอย่างระมัดระวังสำหรับ workloads ที่ไวต่อ latency
- ขีดจำกัดการทำงาน 15 นาทีกีดกัน long-running tasks
- การ debug ยากกว่า — ไม่มี persistent server ให้ SSH เข้า
- การออกแบบ stateless ต้องการการ externalize state ทั้งหมด (database, cache, S3)
- Concurrency limits (ค่าเริ่มต้น 1,000 concurrent invocations ต่อ account) อาจ throttle ที่ scale
- VPC-connected Lambda functions มี latency เพิ่มเติมและปัญหา cold start

**การ Monitor Lambda โดยไม่มี SSH**

ครั้งแรกที่มีบางอย่างพังใน Lambda function สัญชาตญาณของ Leo คือ SSH เข้าและดู process ไม่มี process ให้ SSH เข้า execution environments ของ Lambda เป็น ephemeral และเข้าถึงไม่ได้

การ debug Lambda ต้องการการเรียนรู้ toolkit ที่แตกต่าง:

**CloudWatch Logs**: ทุก Lambda invocation เขียน stdout/stderr ไปยัง CloudWatch Log Group Structured logging (รูปแบบ JSON) ทำให้พวกมัน filter ได้ fields ที่มีประโยชน์ที่สุด: function name, invocation ID, duration, error type และ custom correlation ID ของคุณ

**CloudWatch Metrics**: Lambda publish metrics Invocations, Duration, Errors, Throttles และ ConcurrentExecutions โดยอัตโนมัติ การตั้ง alarms บน Errors และ Throttles ควรเป็นวันแรกของ Lambda deployment ใดๆ

**AWS X-Ray**: distributed tracing สำหรับ Lambda เพิ่ม overhead เล็กน้อย (2-5ms ต่อ invocation) แต่ให้ flame graph ของที่ที่เวลาถูกใช้ภายใน function จำเป็นสำหรับการวิเคราะห์ cold start — X-Ray แสดง initialization phase แยกจาก handler phase

**Lambda Insights**: enhanced monitoring สำหรับ Lambda มีให้ผ่าน CloudWatch Lambda Insights เพิ่ม memory usage, CPU time และ init duration เข้าไปใน metrics มาตรฐาน มีค่าใช้จ่ายเพิ่มเล็กน้อยแต่คุ้มค่าสำหรับ production functions

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่าน execution environment ล่ะ?" Priya ถาม "Lambda functions ทำงานใน containers ที่แยกจากกัน แต่ถ้า dependency มีช่องโหว่ ผู้โจมตีสามารถได้รับ code execution ภายใน Lambda ของเราไหม?"

การบรรเทา: เก็บ dependencies ให้น้อยที่สุดและเป็นปัจจุบัน (การวิเคราะห์ cold start ได้ผลักดัน Leo ให้ลดขนาด packages แล้ว) ใช้ Lambda Layers เพื่อ version shared libraries และให้ Lambda execution role สิทธิ์ขั้นต่ำที่ต้องการ ถ้า function สามารถเขียนได้เฉพาะ S3 bucket หนึ่งและ query ได้เฉพาะ DynamoDB table หนึ่ง blast radius ของ function ที่ถูกบุกรุกถูกจำกัดอยู่เพียงเท่านั้น

"Least privilege สำหรับ Lambda execution roles ไม่ใช่ทางเลือก" Priya พูด "มันคือสิ่งที่จำกัดความเสียหายเมื่อมีบางอย่างผิดพลาด"

เธอพูดถูก และเช่นเดียวกับคำแนะนำด้านความปลอดภัยส่วนใหญ่ มันก็เป็นวิศวกรรมที่ดีด้วย

## สรุป

สถาปัตยกรรม SQS/SNS จากบทที่ 19 แยกความกังวลของการรับงานและการประมวลผลมัน Lambda ทำให้ก้าวไปอีก: มันแยกความกังวลของการประมวลผลงานและการจ่ายค่า capacity เพื่อทำมัน

- **AWS Lambda** รัน code ตอบสนองต่อเหตุการณ์โดยไม่จัดการเซิร์ฟเวอร์
- **จ่ายตามการใช้งาน**: เรียกเก็บเงินต่อ invocation และต่อ 1 ms ของการทำงาน (ปัดขึ้น) ศูนย์ค่าใช้จ่ายเมื่อ idle
- ขยายขนาดโดยอัตโนมัติจาก 0 ถึงหลายพัน concurrent invocations
- **Cold starts**: latency การเริ่มต้นเมื่อไม่มี warm execution environment บรรเทาด้วย provisioned concurrency หรือ runtimes ที่เบา
- **Lambda Layers**: shared code packages ที่ functions หลายตัวอ้างอิงได้ ลดการซ้ำซ้อนและขนาด package
- **RDS Proxy**: แก้ปัญหา connection exhaustion ของ Lambda โดยรักษา persistent database connection pool ระหว่าง Lambda และ RDS
- **Monitoring**: ใช้ CloudWatch Logs, Metrics, X-Ray tracing และ Lambda Insights — ไม่มีเซิร์ฟเวอร์ให้ SSH เข้า
- เหมาะที่สุดสำหรับ: event-driven, ระยะสั้น, พุ่งเป็นจุด หรือ workloads ที่ไม่บ่อย
- ไม่เหมาะสำหรับ: long-running tasks (ขีดจำกัดตายตัว 15 นาที), แอปพลิเคชันที่มี state, APIs ที่ throughput สูง latency ต่ำโดยไม่มี provisioned concurrency
- **Serverless** เป็นปรัชญาการออกแบบ — คุณจัดการ code ไม่ใช่ infrastructure operational complexity เลื่อน ไม่ได้หายไป

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **Lambda + S3**: pattern คลาสสิก — ไฟล์ที่อัปโหลดไป S3 trigger Lambda สำหรับการประมวลผล (thumbnail generation, virus scanning, data transformation) ไม่ต้องการเซิร์ฟเวอร์
- **Lambda + SQS**: Lambda poll SQS และประมวลผล batches SQS ให้กลไก retry/DLQ Lambda ให้การประมวลผล
- **Lambda + API Gateway**: serverless HTTP API API Gateway จัดการ routing, auth, throttling Lambda จัดการ business logic
- **API Gateway types:** REST API = features เต็ม, request transformation, caching, usage plans HTTP API = ง่ายกว่า ถูกกว่า OIDC/OAuth เท่านั้น WebSocket API = persistent bidirectional connections **Authorization:** Cognito authorizer = validate Cognito JWT โดยตรง Lambda authorizer = custom token validation logic API key = rate limiting ต่อ client (ไม่ใช่ authentication) trigger ข้อสอบ: "serverless REST API" → API Gateway + Lambda
- **สัญญาณ Cold start**: "latency spikes บน request แรก," "response times ไม่สม่ำเสมอ" → cold start วิธีแก้: provisioned concurrency (เสียเงิน), package ที่เล็กกว่า, runtime ที่เบากว่า
- **Execution limits**: สูงสุด 15 นาที memory สูงสุด 10GB /tmp ephemeral storage 512MB โดยค่าเริ่มต้น (ตั้งค่าได้ถึง 10GB) ขีดจำกัดเหล่านี้ปรากฏใน scenarios ข้อสอบ
- **Lambda timeout errors เงียบ**: ถ้า Lambda function timeout มันสร้าง CloudWatch error แต่ไม่มี application-level error response Monitor CloudWatch Lambda Timeout errors อย่างชัดเจน นี่คือวิธีที่ report generator 17 นาทีของ Leo ล้มเหลวในคืนแรกโดยไม่มี application-level alarm
- **VPC Lambda cold starts**: Lambda functions ภายใน VPC มี cold start latency เพิ่มเติม (ENI provisioning) AWS ปรับปรุงสิ่งนี้อย่างมากด้วย Hyperplane ENIs แต่ VPC Lambda cold starts ยังคงช้ากว่า non-VPC หลีกเลี่ยง VPC สำหรับ Lambda functions ที่ไม่ต้องการ VPC resources (เช่น ไม่เชื่อมต่อกับ RDS, ElastiCache หรือ VPC-only resources อื่น)
- **Lambda concurrency**: ค่าเริ่มต้น 1,000 concurrent executions ต่อ account (เพิ่มได้) **Reserved concurrency**: รับประกันว่า function ได้รับ executions จำนวนเฉพาะ; ป้องกัน functions อื่นบริโภคพวกมัน **Provisioned concurrency**: pre-warm execution environments จำนวนหนึ่ง
- **Event source mapping**: feature ของ Lambda ที่เชื่อม SQS/DynamoDB Streams/Kinesis ไปยัง Lambda Lambda poll source และ batch records
- **การชน account limits**: "application ถูก throttle / LimitExceeded ขณะ scale" → ตรวจสอบ limit ใน **Service Quotas** และขอเพิ่มที่นั่น (quotas หลายตัว เช่น Lambda concurrency ปรับได้; บางตัวเป็น hard limits)
- **RDS Proxy**: สัญญาณข้อสอบ: "Lambda functions ทำให้เกิด database connections มากเกินไป," "connection pool exhaustion กับ Lambda" → RDS Proxy รักษา persistent connections และ multiplex connections อายุสั้นของ Lambda
- **Lambda Layers**: สัญญาณข้อสอบ: "share code ข้าม Lambda functions หลายตัว," "ลดขนาด deployment package" → Lambda Layers
- **Lambda + X-Ray**: distributed tracing สำหรับ Lambda scenario ข้อสอบ: "trace requests ข้าม Lambda functions และ services หลายตัว" → เปิด X-Ray tracing บน Lambda
- **Lambda Destinations:** สำหรับ asynchronous Lambda invocations คุณสามารถตั้งค่า Destination สำหรับผลลัพธ์ทั้ง success และ failure ส่งผลลัพธ์ที่สำเร็จไปยัง SQS, SNS, EventBridge หรือ Lambda function อื่น ส่ง failures ไปยัง SQS หรือ SNS สำหรับการแจ้งเตือน นี่คือทางเลือกที่นิยมกว่า DLQs สำหรับ async invocations เพราะมันจับทั้ง success และ failure ไม่ใช่แค่ failure สัญญาณข้อสอบ: "route ผลลัพธ์ Lambda ที่สำเร็จไปยัง service อื่น" หรือ "จับทั้งผลลัพธ์ success และ failure จาก async Lambda" → Lambda Destinations "จับเฉพาะ messages ที่ล้มเหลวสำหรับ async invocation" → DLQ ยังใช้ได้แต่ Destinations เป็นวิธีแก้ที่สมบูรณ์กว่า

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — ทบทวน**

อธิบายปัญหา cold start ในแอปพลิเคชันประเภทใดที่ cold starts จะเป็นปัญหามากที่สุด? ในประเภทใดที่จะยอมรับได้?

*(คำใบ้: เปรียบเทียบ real-time API (ผู้ใช้รอ response) กับ asynchronous background job (ผู้ใช้ได้รับการยืนยันไปแล้วและกำลังทำอย่างอื่น))*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทหนึ่งรับรูปภาพผลิตภัณฑ์จากซัพพลายเออร์ผ่าน S3 bucket แต่ละรูปภาพต้องถูก resize เป็นสี่ขนาดมาตรฐาน (thumbnail, small, medium, large) และเก็บกลับใน S3 ปริมาณคาดเดาไม่ได้ — บางวัน 10 รูปภาพ บางวัน 100,000 การประมวลผลต้องเสร็จภายใน 10 นาทีต่อรูปภาพ ต้องลดค่าใช้จ่ายให้น้อยที่สุด

สถาปัตยกรรมใดตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) EC2 instances ใน Auto Scaling Group ที่ monitor S3 bucket ด้วย long polling  
B) EC2 instance เฉพาะที่มี cron job ที่ตรวจสอบ S3 ทุกนาทีสำหรับรูปภาพใหม่  
C) ECS Fargate tasks ที่ trigger โดย SQS queue โดยมี S3 events publish ไปยังคิว  
D) S3 event notification ที่ trigger Lambda function ที่ resize รูปภาพและเก็บผลลัพธ์ใน S3

**คำใบ้ 1**: ปริมาณที่คาดเดาไม่ได้เอื้อต่อการ scaling-to-zero ตัวเลือกใดทำเช่นนั้น?

**คำใบ้ 2**: 10 นาทีต่อรูปภาพอยู่ในขีดจำกัด 15 นาทีของ Lambda ตรวจสอบว่างาน resize รูปภาพอยู่ในข้อจำกัดของ Lambda หรือไม่

**คำใบ้ 3**: EC2 instance เฉพาะที่ทำงาน 24/7 แพงและไม่ scale

**คำตอบ**: D

**คำอธิบาย**: S3 event notifications trigger Lambda เมื่อรูปภาพถูกอัปโหลด Lambda resize รูปภาพเป็นสี่ขนาดและเก็บผลลัพธ์ใน S3 Lambda scale จาก 0 ถึงหลายพัน concurrent invocations โดยอัตโนมัติ จัดการปริมาณที่คาดเดาไม่ได้โดยไม่ต้อง pre-provisioning ศูนย์ค่าใช้จ่ายเมื่อไม่มีรูปภาพกำลังถูกประมวลผล

**ทำไมไม่ใช่ A?** EC2 ใน ASG ไม่ scale ลงถึงศูนย์ — อย่างน้อยหนึ่ง instance ทำงานอยู่เสมอ Long polling S3 ไม่ใช่ native S3 event mechanism ค่าใช้จ่ายสูงกว่า Lambda สำหรับ workloads ที่พุ่งเป็นจุด

**ทำไมไม่ใช่ B?** EC2 instance เฉพาะเป็น single point of failure ไม่ scale ทำงาน 24/7 และวิธีการแบบ cron มี detection lag สูงถึง 60 วินาที

**ทำไมไม่ใช่ C?** ECS Fargate ใช้ได้ แต่ซับซ้อนกว่า (ต้องการ container management, ECR, task definitions) และการ startup ของ Fargate task ใช้เวลาหลายสิบวินาทีถึงนาที — ช้ากว่า Lambda cold start มาก — ทำให้มันเหมาะสมไม่ดีสำหรับงานที่พุ่งเป็นจุดและ event-driven Lambda ง่ายกว่าสำหรับ use case นี้

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus ต้องการสร้างรายงานรายวันตอนตี 5 ด้วยร้านอาหารยอดนิยม 10 อันดับแรกของวันก่อนตามปริมาณออร์เดอร์ รายงานถูกสร้างจากข้อมูล DynamoDB จัดรูปแบบเป็น PDF เก็บใน S3 และส่งอีเมลไปยังพันธมิตรร้านอาหารทั้งหมด

ออกแบบ pipeline ที่อิงตาม Lambda เต็มรูปแบบสำหรับสิ่งนี้ อะไร trigger Lambda? เกิดอะไรขึ้นถ้าการสร้าง PDF ใช้เวลา 12 นาที? ถ้ามีพันธมิตรร้านอาหาร 5,000 รายและการส่งอีเมลพวกเขาทั้งหมดใช้เวลา? คุณจะใช้ Lambda หนึ่งตัวหรือหลายตัว?

พิจารณาด้วยว่า: ถ้า Lambda timeout หลัง 14 นาที โดยประมวลผลไปแล้ว 4,500 จาก 5,000 อีเมลร้านอาหาร? คุณจะหลีกเลี่ยงการส่งอีเมลซ้ำอย่างไรเมื่อ Lambda ถูก retry? IAM permissions ใดที่ Lambda นี้ต้องการ และอะไรคือชุดขั้นต่ำที่จำเป็น?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกประกอบ Lambda กับ services อื่น)*

## ฉากหลังเครดิต

Tom ตรวจสอบบิลสิ้นเดือน

Email service: หายไปจากบิล EC2
งาน resize รูปภาพ: หายไป
งาน nightly cleanup: หายไป
รายงาน analytics รายวัน: หายไป (report generator ถูกย้ายไป ECS Fargate หลังเหตุการณ์ timeout 17 นาที แต่ค่า Lambda compute เป็นศูนย์เพราะตอนนี้มันถูก orchestrate แตกต่างออกไป)

ค่า Lambda ทั้งหมดสำหรับเดือน: $5.47

"ห้าดอลลาร์" Tom พูด

"และสี่สิบเจ็ดเซนต์" Leo เพิ่มอย่างเป็นประโยชน์

Tom มองบิลเดือนก่อน เมื่อ services เหล่านั้นทั้งหมดอยู่บน EC2 instances

"เราจ่าย $187 สำหรับ workloads เดียวกันเหล่านั้น"

"Lambda ไม่คิดค่า idle time" Leo พูด "และ services เหล่านั้นส่วนใหญ่ idle 90% ของเวลา"

Tom เปิดกราฟ CloudWatch อีกครั้ง email service Lambda ถูกเรียก 36,412 ครั้ง Total duration: ประมาณ 18,200 GB-seconds ที่ $0.0000166667 ต่อ GB-second: $0.30 — และแม้แต่นั่นก็เป็นเชิงทฤษฎี เพราะ 18,200 GB-seconds นั่งอยู่อย่างสบายในขอบเขต 400,000 GB-seconds ของ always-free duration line item จริงเป็นศูนย์

"EC2 instance คือ $18 ต่อเดือน" Tom พูด "เราใช้ไปสามสิบเซนต์ — และนั่นคือผมเพิกเฉยต่อ free tier เพื่อให้เรารู้ unit cost จริง บิลบอกว่าศูนย์"

"ส่วนใหญ่ของ $5.47 คือ provisioned concurrency บน notification Lambda — ตัวนั้นเรียกเก็บเงินไม่ว่ามันจะทำงานหรือไม่ image resizer, cleanup task และที่เหลืออยู่ในขอบเขต free tier"

Tom จ้องมองหน้าจอเป็นเวลานาน

"ฉันขอถอนทุกอย่างที่พูดเกี่ยวกับ serverless เป็นแค่ buzzword" เขาพูด

"คุณไม่เคยพูดอย่างนั้น" Leo พูด

"ฉันคิดมันดังมาก"

ในบทต่อไป: ตู้คอนเทนเนอร์ขนส่งที่ทำให้ทุกเซิร์ฟเวอร์รู้สึกเหมือนบ้าน
