# บทที่ 22: แผนผังที่รันตัวเอง

Leo จ้องมอง log file เดียวกันมาหนึ่งชั่วโมง stack traces ชัดเจนพอเมื่อดูทีละอัน แต่รูปแบบที่กระจายอยู่ในนั้น — วิธีที่ขั้นตอนหนึ่งล้มเหลวอย่างเงียบๆ และขั้นตอนถัดไปก็ทำงานต่อไป — ใช้เวลาสักพักกว่าเขาจะมองเห็น ในที่สุดเขาก็เอนหลัง วางกาแฟลง และเขียนคำเดียวบนสมุดโน้ต: *การประสานงาน*

ลองนึกถึงวาทยกรที่ก้าวลงจากแท่นกลางการแสดง วงออร์เคสตรายังคงเล่นต่อ — แต่ไม่มีใครนำเครื่องทองเหลืองเข้ามาที่ห้องที่ 47 ไม่มีใครให้สัญญาณความเงียบก่อนท่อนจบ นักดนตรีแต่ละคนเล่นส่วนของตนถูกต้อง การแสดงยังคงพังทลาย เพราะส่วนต่างๆ ขึ้นอยู่กับการประสานงานที่ไม่มีใครจัดการ

นั่นคือปัญหาที่ Leo พบใน order confirmation code ไม่ใช่ bug ในขั้นตอนใดขั้นตอนหนึ่ง แต่เป็นความล้มเหลวของการประสานงาน

---

containers กำลังทำงานอย่างถูกต้องและ deploy อย่างสะอาด ECS deployment pipeline มั่นคง แต่ภายใน application code ความล้มเหลวอีกชนิดหนึ่งกำลังสะสมมาหลายสัปดาห์ containers ไม่มีปัญหา logic ภายในตัวหนึ่งของพวกมันมี

Leo ติดตามรูปแบบใน logs แต่ไม่เข้าใจมันจนกระทั่งเขานับจำนวนครั้งที่เกิดขึ้น

สิบเอ็ดครั้ง ในสองสัปดาห์

---

การยืนยันออร์เดอร์ที่ Nimbus ต้องการห้าสิ่งที่เกิดขึ้นตามลำดับ: เรียกเก็บเงินบัตร ส่งอีเมลยืนยัน แจ้งร้านอาหาร อัปเดต inventory และบันทึกธุรกรรมสำหรับการบัญชี

ตอนที่ Leo เขียน order confirmation function ดั้งเดิม เขาห่อทั้งหมดไว้ในหนึ่ง `try/except` block และพูดว่า "มันจะไม่เป็นไรหรอก — เราจะจับ errors ใน logs" นั่นคือแปดเดือนก่อน

มันไม่ได้ไม่เป็นไร

ถ้าขั้นตอนที่สามล้มเหลว — ถ้าการแจ้งเตือนร้านอาหาร timeout — ขั้นตอนที่หนึ่งและสองเกิดขึ้นไปแล้ว ลูกค้าถูกเรียกเก็บเงิน อีเมลถูกส่ง แต่ร้านอาหารไม่รู้ว่าออร์เดอร์มีอยู่

Leo มีชื่อสำหรับ bug ประเภทนี้: ความสำเร็จบางส่วน "ทุกอย่างทำงาน" เขาพูด "ยกเว้นส่วนที่สำคัญ"

"เรื่องนี้เกิดขึ้นกี่ครั้งแล้ว?" Maya ถาม

"สิบเอ็ดครั้งในสองสัปดาห์ที่ผ่านมา เราจับส่วนใหญ่ได้จากสายโทรศัพท์โกรธๆ ไปยังร้านอาหาร สองอันเราพบใน logs ภายหลัง"

"ดังนั้นเราไม่มีการประสานงาน" Priya พูด "ห้าขั้นตอนที่ทำงานเป็น script โดยไม่มีการรับประกันว่าพวกมันเสร็จสมบูรณ์ทั้งหมด แล้วถ้ามีคนพยายามเจาะเข้ามาในระหว่างขั้นตอนที่สอง — หลังจากการเรียกเก็บเงินผ่านแต่ก่อนที่ร้านอาหารจะได้รับแจ้งล่ะ? เราเรียกเก็บเงินลูกค้าสำหรับออร์เดอร์ที่ร้านอาหารไม่มีไปแล้ว"

"หรือว่าพวกมันเสร็จในลำดับที่ถูกต้อง"

"หรือว่าเรารู้ว่าตัวไหนล้มเหลว"

Leo เปิด code บน projector มันเป็น Python function: ห้าสิบบรรทัด ห้า sequential API calls หนึ่ง try/except block ห่อทั้งหมด

"เราต้องการ workflow" Maya พูด "บางอย่างที่ติดตามแต่ละขั้นตอน เดี๋ยว — แต่*ทำไม*เราถึงไม่แค่เพิ่ม error handling ที่ดีกว่าให้กับ Python function ที่มีอยู่ล่ะ? ทำไมเราต้องการ service ใหม่ทั้งหมด?"

"เพราะ error handling ที่ดีกว่ายังคงทำงานใน process เดียวที่ล้มเหลวได้ทุกจุด" Leo พูด "ถ้าเซิร์ฟเวอร์ restart กลางการทำงาน error handling restart ไปกับมัน Step Functions persist state ภายนอก"

ลองนึกถึง manufacturing checklist — แบบที่แต่ละสถานียืนยันความสำเร็จก่อนส่งต่อไปยังถัดไป และที่ทั้งสายการผลิตหยุดอยู่ที่ตำแหน่งเมื่อบางอย่างล้มเหลว สายการผลิตไม่ได้เริ่มใหม่จากต้น มันกลับมาทำต่อจากสถานีที่ล้มเหลวพอดี state ของสถานีนั้นถูกบันทึก ขั้นตอนก่อนหน้ามันเสร็จแล้วและไม่ถูกทำซ้ำ ขั้นตอนหลังจากมันรอจนกว่าปัญหาจะได้รับการแก้ไข

นั่นคือสิ่งที่ order confirmation flow ต้องการ ไม่ใช่ code มากขึ้นรอบๆ ปัญหา แต่เป็นระบบที่ออกแบบมาเพื่อจัดการปัญหา

**AWS Step Functions: การประสานงาน Workflows**

**AWS Step Functions** คือ serverless orchestration service ที่ประสานขั้นตอนของแอปพลิเคชันเป็น visual workflow แต่ละขั้นตอนคือ **state** ใน **state machine**

แทนที่จะเป็น Python script ที่ทำงานจากบนลงล่างและ crash คุณกำหนด workflow เป็น JSON/YAML state machine:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

แต่ละ state สามารถ:

- **รัน Lambda function** (รูปแบบที่พบบ่อยที่สุด)
- **รัน ECS task** (สำหรับงานที่ทำงานนานกว่า)
- **รอเวลาเฉพาะ** หรือ **เหตุการณ์** (หยุด workflow ชั่วคราวจนกว่าบางอย่างภายนอกจะเกิดขึ้น)
- **เลือกเส้นทาง** ตามเงื่อนไข (if/else logic)
- **รัน parallel branches** พร้อมกัน
- **Retry เมื่อล้มเหลว** พร้อม backoff ที่ตั้งค่าได้
- **Catch errors** และ route ไปยัง error-handling states

Step Functions จัดการ execution state อย่างทนทาน ถ้าขั้นตอน 3 ล้มเหลว การทำงานหยุดที่ขั้นตอน 3 คุณสามารถตรวจสอบ execution ที่ล้มเหลวใน console แก้ปัญหา และ restart จากขั้นตอน 3 — โดยไม่ทำขั้นตอน 1 และ 2 ซ้ำ

คุณอาจสงสัยว่า: คุณเขียน retry logic ใน Lambda function ของคุณไม่ได้หรือ? ได้ — แต่แล้วคุณก็ต้องเขียน failure tracking, state persistence และ audit logging ใน code ด้วย และเมื่อขั้นตอน 3 จาก 7 ล้มเหลว คุณต้องรู้ว่าร้านอาหารไหนกำลังถูกประมวลผล อะไรเกิดขึ้นก่อนหน้า และจะกลับมาทำต่อที่ไหน Step Functions ทำทั้งหมดนั้น

**Nimbus Order Flow: State Machine แบบมีคำอธิบาย**

นี่คือเวอร์ชันที่ทำให้ง่ายขึ้นของ Step Functions state machine จริงที่ Nimbus สร้างสำหรับ order confirmation — มีคำอธิบายเพื่อให้คุณเห็นว่าแต่ละส่วนทำอะไร:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

สิ่งที่ควรสังเกตสองสามอย่าง:

**`ChargeCard` มีสอง Catch clauses** หนึ่งสำหรับ `PaymentDeclinedError` (ความล้มเหลวที่รู้จักและคาดหวัง — บัตรถูกปฏิเสธ ไม่ใช่ system error) และหนึ่งสำหรับ `States.ALL` (อะไรก็ตามที่เหลือ — system outage, timeout, exception ที่ไม่คาดคิด) พวกมัน route ไปยัง states ที่แตกต่างกันเพราะพวกมันหมายถึงสิ่งที่แตกต่างกัน

**`NotifyRestaurant` มี Catch ที่ route ไปยัง `RestaurantNotificationFailed`** นี่คือ bug ที่ทำให้เกิดสิบเอ็ดเหตุการณ์ ใน Python script เก่า ไม่มีอะไรเทียบเท่า — ถ้าการแจ้งเตือนล้มเหลว function ทั้ง crash อย่างเงียบๆ หรือ log error และทำงานต่อ Step Functions ทำให้เส้นทางความล้มเหลวชัดเจน: มันไปที่ไหนสักแห่งที่เฉพาะเจาะจง และที่นั่นแจ้งเตือนทีม support ก่อนที่ใครจะต้องโทร

**ทุก Task มี Retry** ถ้า email service มี transient timeout มัน retry โดยอัตโนมัติ สามครั้ง พร้อม backoff ที่เพิ่มขึ้น ลูกค้าไม่เคยเห็นสิ่งนี้ ออร์เดอร์ไม่สูญหาย

**flow เป็น graph ไม่ใช่ script** ถ้า `NotifyRestaurant` ล้มเหลวอย่างถาวร (หลัง retries) การทำงานไม่ดำเนินต่อไปยัง `UpdateInventory` workflow หยุดที่ `RestaurantNotificationFailed` inventory ไม่ถูกอัปเดตสำหรับร้านอาหารที่ไม่รู้เรื่องออร์เดอร์ นี่คือพฤติกรรมที่ถูกต้อง

"เดี๋ยว — แต่*ทำไม*เราถึงต้องการเส้นทางความล้มเหลวแยกสำหรับ payment declined เทียบกับ system error?" Maya ถาม

"เพราะพวกมันต้องการการตอบสนองที่แตกต่างกันโดยสิ้นเชิง" Leo พูด "บัตรที่ถูกปฏิเสธหมายความว่าเราส่งอีเมลลูกค้าและขอให้พวกเขาลองอีกครั้ง system error ใน charge function หมายความว่าเราต้องการวิศวกรเพื่อสืบสวนว่าทำไม Lambda function ถึงล้มเหลว ผลลัพธ์ที่สังเกตได้เหมือนกัน — ออร์เดอร์ไม่ผ่าน — แต่การแก้ไขแตกต่างกันโดยสิ้นเชิง"

**State Types: หน่วยพื้นฐาน**

**Task**: ดำเนินการ — เรียก Lambda function, เริ่ม ECS task, เรียก API นี่คือที่ที่งานจริงเกิดขึ้น

**Choice**: แยกสาขาตามเงื่อนไขในข้อมูล input เหมือน if/else ใน code

**Parallel**: รัน branches หลายตัวพร้อมกันและรอให้ทั้งหมดเสร็จ

**Map**: ใช้ชุด states กับแต่ละ item ในรายการ ประมวลผล 50 รายการเมนูร้านอาหารแบบขนาน

เมื่อ Nimbus import เมนูของร้านอาหาร เมนูอาจมีตั้งแต่ 8 ถึง 200 รายการ สำหรับแต่ละรายการ กระบวนการ import ต้อง: validate รูปแบบ ตรวจสอบข้อมูล allergen, resize รูปภาพ และเขียน record ไปยัง DynamoDB

หากไม่มี Map state นี่จะเป็น Lambda เดียวที่ประมวลผลรายการตามลำดับ — 200 รายการ × 200ms ต่อรายการ = 40 วินาทีของเวลาประมวลผล ด้วย Map state, Step Functions launch concurrent executions ของ processing states — สูงสุดถึงขีดจำกัด concurrency ที่ตั้งค่า — และรอให้ทั้งหมดเสร็จ 200 รายการเดียวกันสามารถเสร็จในเวลาต่ำกว่า 5 วินาที

**Wait**: หยุดชั่วคราวเป็นเวลาที่ระบุหรือจนถึง timestamp มีประโยชน์สำหรับความล่าช้าที่กำหนดเวลาไว้

**Pass**: ส่ง input ไปยัง output โดยไม่ทำงาน ใช้สำหรับ data transformation และการทดสอบ

**Succeed/Fail**: terminal states ที่จบการทำงาน

สำหรับ restaurant onboarding, Leo ออกแบบ workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, พร้อม 3 retries)
3. Parallel branch:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, รอให้ parallel เสร็จ)
5. NotifySalesTeam (Task → Lambda)

ขั้นตอน 3a และ 3b ทำงานแบบขนาน — พวกมันไม่ขึ้นต่อกัน และการรันพร้อมกันประหยัดเวลา

หลังจาก restaurant cohort แรกเสร็จ onboarding ความต้องการด้าน compliance ก็ปรากฏขึ้น: ก่อนที่พันธมิตรร้านอาหารจะ go live ได้ Nimbus account manager ต้อง review และอนุมัติเอกสาร license ด้วยตนเอง สิ่งนี้อาจใช้เวลาหนึ่งถึงสามวันทำการ

"แล้วถ้ามีคนพยายามเจาะเข้ามาในระหว่างหน้าต่างนั้นล่ะ?" Priya ถาม "ถ้าร้านอาหารถูกตั้งค่าบางส่วน — payment account ถูกสร้างแต่ยังไม่ได้รับการอนุมัติ — และมีคนค้นพบ pending state พวกเขาอาจพยายามใช้ประโยชน์จาก half-open configuration"

ในทางปฏิบัติมากกว่า: คุณจะหยุด Step Functions workflow เป็นเวลาสามวันเพื่อรอมนุษย์อย่างไร?

คำตอบคือ **callback pattern พร้อม task token**

เมื่อ `ValidateLicense` ทำงาน แทนที่จะเสร็จโดยอัตโนมัติ มันเรียก Lambda ที่ทำสามสิ่ง:

1. ส่งอีเมลไปยัง account manager พร้อมเอกสารของร้านอาหาร
2. บันทึก **task token** (identifier ที่ไม่ซ้ำกันที่ Step Functions สร้างสำหรับ execution และ state เฉพาะนี้) ในฐานข้อมูล สัมพันธ์กับ review ที่รออยู่นั้น
3. คืนค่ากลับไปยัง Step Functions ด้วย `.waitForTaskToken` — ซึ่งบอก Step Functions ให้หยุดการทำงานที่ state นี้อย่างไม่มีกำหนด

Step Functions จอด execution ไว้ ไม่มีอะไรอื่นถูก block — ไม่มีเซิร์ฟเวอร์นั่งรอ state machine แค่รอ ไม่บริโภค compute resources

สามวันต่อมา account manager คลิก "Approve" ใน internal admin tool admin tool ค้นหา task token จากฐานข้อมูลและเรียก:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions ทำงานต่อ การทำงานดำเนินต่อจากขั้นตอน 2 (`ImportMenu`) โดยมีข้อมูลของผู้ review พร้อมใช้ใน workflow state

"การทำงานถูกหยุดเป็นเวลาสามวัน" Leo พูด "และสิ่งเดียวที่เกิดขึ้นเมื่อผมอนุมัติมันคือหนึ่ง API call"

"และถ้า account manager ปฏิเสธมันล่ะ?" Maya ถาม

"เราเรียก `send_task_failure` แทน state machine จับมันและ route ไปยัง `NotifyRejection` state ที่ส่งอีเมลพันธมิตรร้านอาหาร"

Step Functions ไม่ poll มันไม่ retry มันไม่ timeout (เว้นแต่คุณตั้ง heartbeat timeout) มันแค่รอจนกว่า callback มาถึง แล้วทำงานต่อ นี่แตกต่างพื้นฐานจากการ poll ฐานข้อมูลหรือคิว — และเป็นเหตุผลที่ Step Functions เหมาะกับ workflows ที่ผสมขั้นตอนอัตโนมัติและด้วยตนเอง

**การอ่าน Execution Console: ความล้มเหลวหน้าตาเป็นอย่างไร**

เมื่อ restaurant notification Lambda timeout ในระหว่างสัปดาห์แรกของ Nimbus บน Step Functions, Leo เปิด Step Functions console และคลิกที่ execution ที่ล้มเหลว

**Execution Event History** แสดง timeline ของสิ่งที่เกิดขึ้นพอดี:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

ใน 42 วินาที Step Functions ได้เรียกเก็บเงินบัตร ส่งอีเมล พยายามแจ้งเตือนร้านอาหารสามครั้ง จับความล้มเหลว แจ้งเตือนทีม support และบันทึกประวัติทั้งหมด ก่อนมี Step Functions ความล้มเหลวนี้จะมองไม่เห็น — Python function จะ log "notification failed" และคืน 200 ให้ผู้เรียกราวกับว่าไม่มีอะไรผิด

"timeline แสดงพอดีว่าสิ่งต่างๆ ผิดพลาดที่ไหนและเมื่อไร" Leo พูด "และทุก retry attempt มี timestamp คุณเห็น backoff intervals ได้"

Priya มอง console "และประวัตินี้ถูกเก็บนานแค่ไหน?"

ประวัติการทำงานของ Standard workflow ถูกเก็บเป็นเวลา 90 วัน สำหรับ compliance หรือการ auditing ระยะยาว execution events ยังสามารถถูก export ไปยัง CloudWatch Logs และเก็บไว้อย่างไม่มีกำหนด

**Standard กับ Express Workflows**

Step Functions เสนอ workflow สองประเภท:

**Standard workflows**:

- ระยะเวลาสูงสุด: 1 ปี
- Executions เป็นที่คงทน — state ถูก persist สามารถตรวจสอบและ audit ได้
- Exactly-once execution (task ไม่เคยทำงานมากกว่าหนึ่งครั้งเว้นแต่คุณตั้งค่า Retry)
- คิดราคาต่อ state transition
- เหมาะที่สุดสำหรับ workflows ที่ทำงานนานและสำคัญ (order processing, onboarding, payment flows)

**Express workflows**:

- ระยะเวลาสูงสุด: 5 นาที
- Throughput สูงกว่า — สูงถึง 100,000 ต่อวินาที
- At-least-once execution (asynchronous) หรือ at-most-once (synchronous) — ออกแบบ tasks ให้เป็น idempotent
- คิดราคาต่อ duration (เหมือน Lambda)
- เหมาะที่สุดสำหรับ workflows ที่ปริมาณสูงและระยะสั้น (real-time event processing, IoT data ingestion)

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถามขณะเปิดหน้า pricing "ต่อ state transition สำหรับ Standard — นั่นสะสมขึ้นถ้าคุณมีขั้นตอนเยอะ"

Leo อธิบายการคำนวณ สำหรับ restaurant onboarding workflow (หก task states ต่อ execution ราว 12-15 ร้านอาหารใหม่ต่อเดือน): น้อยกว่าหนึ่งร้อย state transitions — น้อยกว่าหนึ่งเซนต์ และอยู่ในขอบเขต 4,000-transition รายเดือนของ free tier ทั้งหมด ดังนั้นแทบจะ $0 สำหรับ order confirmation workflow ที่ Nimbus traffic เต็ม: มีความหมายมากขึ้น แต่ยังคงต่ำกว่าต้นทุนการ debug สิบเอ็ดความสำเร็จบางส่วนต่อเดือนด้วยตนเองมาก

"เวลาในการ debug คือต้นทุนแฝง" Leo พูด

"นั่นคือต้นทุนแฝงเสมอ" Tom พูด

Tom คำนวณตัวเลขอย่างรอบคอบมากขึ้น เพราะนั่นคือ Tom

**ต้นทุน Standard workflow สำหรับ order confirmation flow ของ Nimbus**: ห้า states ต่อออร์เดอร์บน happy path ที่ $0.000025 ต่อ state transition ห้า state transitions × $0.000025 × 15,000 ออร์เดอร์ต่อเดือน = **$1.88/เดือน** ที่สิบเท่าของปริมาณออร์เดอร์: ประมาณ $19/เดือน ต้นทุนการ debug สำหรับหนึ่งเหตุการณ์ความสำเร็จบางส่วน (24 นาทีของเวลา support engineer) เกินบิล Step Functions รายเดือนหลายเท่า

การเปรียบเทียบกลายเป็นเรื่องสำคัญถ้ามีคนเสนอให้ใช้ Standard workflows สำหรับ high-frequency analytics events สมมติว่า Nimbus ต้องการใช้ Step Functions เพื่อประมวลผลทุก raw clickstream event — ทุกการดูหน้าเมนู ทุกการ scroll ทุกการค้นหา นั่นคือราว 800,000 events ต่อวันที่ scale ปัจจุบันของพวกเขา five-state Standard workflow สำหรับแต่ละ event: 800,000 × 5 × $0.000025 × 30 วัน = **$3,000/เดือน** นั่นคือเงินจริงสำหรับ analytics pipeline

Express workflows สำหรับ volume เดียวกันนั้น: คิดราคาต่อ request บวก duration ไม่ใช่ต่อ state transition 24 ล้าน executions รายเดือนมีต้นทุน $1.00 ต่อล้าน requests = $24 Duration: 24M × 500ms ที่ 64MB billing minimum ≈ 208 GB-hours × $0.06 = $12.50 รวม ≈ **$36.50/เดือน** — ถูกกว่า $3,000 ของ Standard เกือบสอง order of magnitude

"ดังนั้นประเภทของ workflow ไม่ใช่แค่การตัดสินใจเชิงสถาปัตยกรรม" Tom พูด "มันเป็นการตัดสินใจด้านต้นทุน จำนวน states เท่ากันสามารถมีต้นทุนมากกว่าเกือบร้อยเท่าขึ้นอยู่กับว่าคุณใช้ workflow type ใด"

"และตัวไหนดีกว่าขึ้นอยู่กับว่า workflow ทำอะไรทั้งหมด" Leo พูด "Order confirmation: Standard มันสำคัญ มีเส้นทางความล้มเหลวที่มีความหมาย เราต้องการ audit trail Analytics event processing: Express มันปริมาณสูง ระยะสั้น และเราไม่ต้องการ 90-day execution history สำหรับทุกการดูหน้า"

ถ้ากระบวนการของคุณมีสองขั้นตอนและไม่ต้องการ audit trail, Lambda function ง่ายๆ ถูกกว่าและไม่ต้องการ JSON state machine syntax — แต่ถ้าขั้นตอนใดสามารถล้มเหลวได้อย่างอิสระและต้อง retry หรือ restart โดยไม่ทำซ้ำขั้นตอนก่อนหน้า Step Functions คุ้มค่าด้วยการลดการ debug และการแก้ไขด้วยตนเอง

สำหรับ restaurant onboarding ของ Nimbus: Standard (มันสำคัญ ทนทาน อาจใช้เวลาหลายชั่วโมงถ้ามีขั้นตอนด้วยตนเองเข้ามาเกี่ยวข้อง)

สำหรับ real-time order status updates ของ Nimbus: Express (ปริมาณสูง ระยะสั้น สำคัญน้อยกว่า)

**Event-Driven Architecture: ภาพรวมที่ใหญ่กว่า**

Step Functions เป็นชิ้นส่วนหนึ่งของรูปแบบที่ใหญ่กว่า: **event-driven architecture** แทนที่ services จะเรียกกันโดยตรง (tight coupling) services emit events และ services อื่นตอบสนองต่อ events เหล่านั้น

เราเห็นสิ่งนี้ตลอดทั้งเล่ม:

- ออร์เดอร์ถูกวาง → SNS publish event → SQS queues ส่งให้ consumers
- ไฟล์ S3 ถูกอัปโหลด → Lambda ถูก trigger เพื่อประมวลผล
- DynamoDB record เปลี่ยน → DynamoDB Streams → Lambda อัปเดต cache

**Amazon EventBridge** (เดิม CloudWatch Events) คือ event bus ขั้นสูงสำหรับรูปแบบนี้ มัน route events จาก AWS services และแอปพลิเคชันของคุณเองไปยัง targets (Lambda, SQS, Step Functions ฯลฯ) ตาม rules

EventBridge อนุญาตให้มี loose coupling ที่ระดับสถาปัตยกรรม: order service publish `order.placed` events โดยไม่รู้ว่าใครฟังอยู่ analytics service, notification service และ loyalty points service ทั้งหมดฟังอย่างอิสระ การเพิ่ม listener ใหม่ไม่ต้องเปลี่ยน order service

EventBridge ยัง integrate โดยตรงกับ AWS services หลายสิบตัวเป็น **event sources** เมื่อ CloudTrail API call ตรงกับ pattern, EventBridge สามารถยิง rule เมื่อ EC2 instance เปลี่ยน state, EventBridge สามารถ trigger Lambda เมื่อ RDS instance failover, EventBridge สามารถแจ้งเตือน on-call engineer คุณสามารถปฏิบัติต่อ AWS control plane ทั้งหมดเป็น event stream

สำหรับ Nimbus, EventBridge rule ที่มีประโยชน์เป็นพิเศษ: trigger Lambda เมื่อใดก็ตามที่ image ใหม่ถูก push ไปยัง ECR Lambda ตรวจสอบผล image scan และโพสต์ไปยัง engineering Slack channel ถ้าพบ HIGH หรือ CRITICAL CVEs ใดๆ — ก่อนที่ใครจะ deploy image สิ่งนี้รวม security scanning ของ ECR (จากบทที่ 21) กับ event routing ของ EventBridge เป็น automated security gate

หลักการของ event-driven architecture เหมือนกับ retry logic ของ Step Functions: ทำให้ความล้มเหลวชัดเจนและ route ไม่ใช่เงียบและถูกกลืน Services ที่สื่อสารผ่าน events ล้มเหลวอย่างสง่างาม — ถ้า loyalty points Lambda ล่มเมื่อ `OrderConfirmed` event ยิง, EventBridge สามารถ retry การส่งหรือส่งไปยัง dead-letter queue ตัว order confirmation เองไม่ได้รับผลกระทบ การ decoupling คือ resilience

**EventBridge: การ Decouple Side Effects จาก Main Flow**

หลังจาก order confirmation state machine ทำงานอย่างสะอาด Maya ตั้งคำถามในการ review สถาปัตยกรรมครั้งถัดไป

"เราต้องการเพิ่ม loyalty points เมื่อออร์เดอร์ถูกยืนยัน ลูกค้าได้หนึ่งคะแนนต่อหนึ่งดอลลาร์ที่ใช้จ่าย สิ่งนั้นไปอยู่ที่ไหนใน state machine?"

สัญชาตญาณแรกของ Leo: เพิ่ม `GrantLoyaltyPoints` state หลัง `LogTransaction`

การตอบสนองของ Priya: "แล้วเมื่อเราเพิ่ม referral bonuses? และ post-order surveys? และ restaurant ratings requests? แต่ละอันเพิ่ม state ลงใน critical path ถ้า loyalty points Lambda ล้มเหลว order confirmation ทั้งหมดล้มเหลว"

"order confirmation flow ควรทำสิ่งเดียว" เธอพูด "ยืนยันออร์เดอร์ ทุกอย่างอื่นเป็น side effect"

นี่คือข้อโต้แย้งเชิงสถาปัตยกรรมสำหรับ **Amazon EventBridge** ในฐานะกลไกสำหรับการ loose-coupling side effects จาก main workflow

วิธีการที่แก้ไขแล้ว: เมื่อ `LogTransaction` state เสร็จสมบูรณ์ Lambda publish event ไปยัง EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

จากนั้น EventBridge rules route event นั้นไปยัง targets อิสระ:

- **Rule 1**: `OrderConfirmed` → Loyalty Points Lambda (ให้ 32 คะแนนสำหรับออร์เดอร์ $32)
- **Rule 2**: `OrderConfirmed` → Post-Order Survey Lambda (จัดคิว survey 2 ชั่วโมงหลังการจัดส่ง)
- **Rule 3**: `OrderConfirmed` → Analytics Kinesis Stream (ป้อน real-time dashboard)

แต่ละ rule เป็นอิสระ Loyalty Points Lambda สามารถล้มเหลวโดยไม่ส่งผลต่อ survey queue analytics pipeline สามารถตามหลังได้โดยไม่ block loyalty system การเพิ่ม side effect ใหม่ (restaurant rating request, cashback notification) ต้องการการสร้าง EventBridge rule ใหม่ — ไม่ใช่การแก้ไข state machine

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่าน EventBridge rule ล่ะ?" Priya ถาม "ถ้า event มี customer PII ทุก Lambda ที่รับมันตอนนี้เป็นจุดเข้าถึง PII"

event ถูกออกแบบอย่างระมัดระวัง: เฉพาะ IDs ไม่ใช่ชื่อ ที่อยู่ หรือรายละเอียดการชำระเงิน Lambda ใดที่ต้องการข้อมูลลูกค้าจะค้นหามันจากฐานข้อมูลโดยใช้ customer ID — ด้วย IAM permissions ของตัวเองควบคุมว่ามันเข้าถึงอะไรได้

"event คือสัญญาณ" Priya พูด "ไม่ใช่ data dump"

**เมื่อ Step Functions เป็นเครื่องมือที่ถูกต้อง**

Step Functions โดดเด่นเมื่อคุณมี:

**Multi-step workflows** ที่ต้องติดตามความคืบหน้าข้ามขั้นตอน

**Human-in-the-loop processes** — Step Functions สามารถรออย่างไม่มีกำหนดสำหรับ external event (เช่นมนุษย์อนุมัติบางอย่าง) แล้วทำงานต่อ

**Error handling at scale** — built-in retry, catch และ fallback logic ข้ามขั้นตอนหลายตัว

**Auditable processes** — ทุก execution บันทึกทุก state transition คุณเห็นพอดีว่าอะไรเกิดขึ้นและเมื่อไร

**Complex parallel หรือ sequential logic** — visual workflow ทำให้คิดได้ง่ายกว่า code ที่เทียบเท่า

Step Functions เกินจำเป็นสำหรับ two-step processes ง่ายๆ ใช้มันเมื่อตัวการประสานงานเองมีค่าและ failure scenarios สำคัญ

**เมื่อ Step Functions เป็นเครื่องมือที่ผิด**

"เดี๋ยว — แต่*ทำไม*เราถึงไม่ใช้ Step Functions สำหรับทุกอย่าง?" Maya ถามเมื่อจบ design session "เราสร้าง restaurant onboarding workflow แล้ว เรามี order confirmation flow ทำไมไม่แปลงทุกอย่างเป็น state machines?"

คำตอบที่ซื่อสัตย์: เพราะ Step Functions เพิ่ม overhead ที่ไม่ใช่ทุก workflow คุ้มค่า

**Two-step processes ง่ายๆ**: ถ้าคุณมี Lambda ที่ประมวลผลไฟล์ที่อัปโหลดโดยเรียก Lambda ตัวที่สอง overhead การประสานงานของ state machine ไม่คุ้มกับประโยชน์เชิงปฏิบัติการ สอง Lambdas ที่เรียกตามลำดับภายใน function เดียวนั้นง่ายกว่า ทดสอบง่ายกว่า และไม่มีต้นทุนต่อ state transition

**Workflows ความถี่สูงมากระดับ sub-second**: Standard workflows มีต้นทุนต่อ state transition ที่ไม่เล็กน้อยซึ่งสะสมที่ปริมาณสูง (ดังที่ตัวอย่าง analytics ข้างต้นแสดง) Express workflows แก้ปัญหาต้นทุนแต่ไม่ให้ durable state history ที่ความถี่สูงมากด้วยระยะเวลาสั้นมาก SQS บวก Lambda (รูปแบบจากบทที่ 19) ง่ายกว่าและถูกกว่า Step Functions ทั้งสองประเภท

**Pure fan-out โดยไม่มีการประสานงาน**: ถ้าคุณต้องส่ง event เดียวกันไปยัง consumers ยี่สิบตัวและไม่สนใจผลลัพธ์ของแต่ละตัว SNS คือเครื่องมือ Step Functions เพิ่ม state tracking ที่คุณไม่ต้องการและจะจ่ายโดยไม่จำเป็น

**Real-time synchronous user interactions**: Step Functions executions เป็น asynchronous ถ้าผู้ใช้รอที่หน้าจอ checkout สำหรับ synchronous response ในเวลาต่ำกว่า 500ms, Step Functions Standard workflow ไม่ได้ออกแบบสำหรับสิ่งนี้ (Express workflows สามารถถูกเรียกแบบ synchronous แต่ latency overhead ยังคงสูงกว่าการเรียก Lambda โดยตรง) สำหรับ synchronous user-facing flows, Lambda + API Gateway พร้อม error handling ที่ออกแบบดีมักเหมาะสมกว่า

หลักการ: ใช้ Step Functions เมื่อ*การประสานงาน*ของขั้นตอนเองซับซ้อน — เมื่อขั้นตอนสามารถล้มเหลวได้อย่างอิสระ เมื่อคุณต้อง retry แต่ละขั้นตอนโดยไม่ทำซ้ำขั้นตอนก่อนหน้า เมื่อ execution history มีค่าด้าน compliance หรือ debugging หรือเมื่อ workflow เกี่ยวข้องกับขั้นตอนการอนุมัติของมนุษย์ที่อาจใช้เวลาหลายวัน อย่าใช้มันเพื่อเพิ่ม orchestration overhead ให้กับ sequential logic ง่ายๆ ที่ทำงานได้ดีในฐานะ function เดียว

## จุดแข็งและข้อจำกัด

**ทำไม Step Functions จึงทรงพลัง**:

- visual execution history — เห็นพอดีว่า workflow อยู่ที่ไหน (หรือล้มเหลว)
- built-in retry และ error handling — ไม่มี custom retry code
- durable state — executions อยู่รอดจาก service restarts และ outages
- direct integrations กับ AWS services 200+ ตัว (ไม่ใช่แค่ Lambda)
- visual workflow เป็น self-documenting
- callback pattern เปิดให้รออย่างไม่มีกำหนดสำหรับ human actions โดยไม่บริโภค compute

**จุดที่ซับซ้อน**:

- Standard workflows คิดราคาต่อ state transition — workflows ที่ซับซ้อนที่มี states มากสามารถแพงที่ scale
- รูปแบบ JSON ของ ASL (Amazon States Language) มี learning curve
- ขนาด payload สูงสุดคือ 256KB — ข้อมูลขนาดใหญ่ต้องถูกส่งผ่าน S3 references ไม่ใช่ผ่าน workflow โดยตรง
- long-running workflows ที่มีขั้นตอนด้วยตนเองหลายตัวต้องการการตั้งค่า timeout อย่างระมัดระวัง
- การ debug ASL errors ต้องการการรัน executions; ไม่มี local emulator ที่ความสามารถเท่า service จริง
- IAM permissions ต้องถูกให้แยกต่างหากสำหรับแต่ละ resource ที่ state machine เรียก — การลืม permission หนึ่งทำให้เกิด error ที่น่าสับสนตอน runtime

## สรุป

containers ในบทที่ 21 ทำให้ deployments เชื่อถือได้ Step Functions ทำให้กระบวนการธุรกิจหลายขั้นตอนเชื่อถือได้ — หลักการเดียวกันของ "ขจัดความเสี่ยงในการส่งต่อ" ที่นำมาใช้กับ application logic

- **Step Functions** orchestrate workflows หลายขั้นตอนเป็น state machines
- แต่ละ **state** สามารถรัน Lambda function, รัน ECS task, รอ, แยกสาขา หรือรัน parallel steps
- **Retry และ catch** ถูกสร้างไว้ในแต่ละ state — ไม่ต้องการ custom retry code
- **Standard workflows**: ทำงานนาน (ถึง 1 ปี), ทนทาน, exactly-once สำหรับกระบวนการธุรกิจที่สำคัญ
- **Express workflows**: ระยะสั้น (ถึง 5 นาที), throughput สูง สำหรับ high-volume event processing
- **Callback pattern พร้อม task token**: หยุด workflow อย่างไม่มีกำหนดเพื่อรอ external event หรือ human action; ทำงานต่อด้วย API call เดียว
- **Map state**: ประมวลผลรายการของ items แบบขนาน — แทนที่ sequential loops ด้วย parallel fan-out
- **Direct SDK integrations**: เรียก DynamoDB, S3, SQS และ AWS services 200+ ตัวโดยตรงจาก state โดยไม่มี Lambda wrapper
- **EventBridge**: decouple side effects จาก main workflow — publish event เดียว ปล่อยให้ rules อิสระ route มันไปยัง loyalty points, analytics และ survey services โดยไม่แก้ไข core state machine
- **ต้นทุน Standard เทียบกับ Express**: Standard ที่ $0.000025 ต่อ state transition ทำงานได้ดีสำหรับ low-volume critical workflows (order confirmation ที่ $1.88/เดือน สำหรับ Nimbus) Express ที่คิดราคาต่อ request บวก duration เหมาะสมสำหรับ high-frequency events ที่ Standard จะมีต้นทุนมากกว่าหลายสิบเท่า (~80 เท่าในการคำนวณ clickstream ของ Nimbus)
- **Event-driven architecture** ใช้ services เช่น SNS, SQS, Lambda และ EventBridge เพื่อ decouple systems รอบๆ events แทนการเรียกโดยตรง
- ใช้ Step Functions เมื่อการประสานงานของขั้นตอนเองซับซ้อนและเมื่อ auditability สำคัญ อย่าใช้มันสำหรับ two-step sequences ง่ายๆ, ultra-high-frequency workflows, pure fan-out หรือ synchronous user-facing flows

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **สัญญาณ use case ของ Step Functions**: "orchestrate Lambda functions หลายตัว," "workflow พร้อม retries และ error handling," "human approval step ใน automated workflow," "audit trail ของแต่ละ workflow step" → Step Functions
- **Standard vs Express**: Standard สำหรับ workflows ที่ทำงานนาน auditable และ business-critical Express สำหรับ high-throughput, short-duration event processing
- **SQS vs Step Functions**: SQS สำหรับ task queues ง่ายๆ (producer/consumer) Step Functions สำหรับ multi-step workflows ที่มี logic ซับซ้อน, retries และ state tracking
- **สัญญาณ EventBridge**: "route events จาก AWS services ไปยัง targets," "event-driven integration ระหว่าง services," "schedule Lambda function" → EventBridge (เดิม CloudWatch Events)
- **Callback pattern**: Step Functions สามารถหยุดการทำงานและรอ external callback (task token) worker เรียกกลับเมื่อเสร็จ มีประโยชน์สำหรับ long-running ECS tasks ที่คุณไม่ต้องการขีดจำกัด 15 นาทีของ Lambda
- **Direct SDK integrations**: Step Functions สามารถเรียก AWS services โดยตรง (DynamoDB, S3, SQS ฯลฯ) โดยไม่ผ่าน Lambda ลดต้นทุนและ latency สำหรับ service calls ง่ายๆ ตัวอย่างเช่น การเขียน order record ไปยัง DynamoDB สามารถเป็น direct SDK call จาก state machine โดยไม่มี Lambda function: `"Resource": "arn:aws:states:::dynamodb:putItem"` สิ่งนี้ขจัด Lambda cold start, Lambda execution cost และ code ที่แค่เรียก `dynamodb.put_item(...)` และคืนค่า

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — ทบทวน**

อธิบายว่าทำไม Step Functions มีประโยชน์สำหรับ multi-step workflows มันให้อะไรที่ Lambda function ง่ายๆ ที่เรียก Lambda functions อื่นไม่ให้?

*(คำใบ้: ลองนึกถึงสิ่งที่เกิดขึ้นเมื่อขั้นตอน 3 จาก 5 ล้มเหลวในแต่ละวิธี คุณรู้ได้อย่างไรว่าอะไรเกิดขึ้น? คุณ retry เฉพาะขั้นตอน 3 อย่างไร?)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทบริการทางการเงินประมวลผลใบสมัครสินเชื่อในหลายขั้นตอน: credit check, income verification, document validation, underwriter review (ด้วยตนเอง) และ decision notification แต่ละขั้นตอนอาจใช้เวลาตั้งแต่วินาที (credit check) ถึงหลายวัน (underwriter review) บริษัทต้องการ audit trail ที่สมบูรณ์ของทุกขั้นตอนสำหรับ compliance ขั้นตอนอัตโนมัติที่ล้มเหลวต้อง retry โดยอัตโนมัติ; ขั้นตอนด้วยตนเองต้องหยุดและรอการตัดสินใจของมนุษย์

service ใดตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) AWS Lambda functions ที่ chain กันด้วย SQS queues ระหว่างแต่ละขั้นตอน  
B) AWS Step Functions Standard workflows พร้อม Wait for callback pattern สำหรับขั้นตอน underwriter review  
C) AWS Step Functions Express workflows สำหรับขั้นตอนอัตโนมัติและ SQS FIFO สำหรับขั้นตอนด้วยตนเอง  
D) Amazon EventBridge พร้อม event rules ที่ route ระหว่าง Lambda functions สำหรับแต่ละขั้นตอน

**คำใบ้ 1**: ระยะเวลา "ถึงหลายวัน" — Step Functions type ใดรองรับสิ่งนี้?

**คำใบ้ 2**: "รอการตัดสินใจของมนุษย์" — Step Functions pattern ใดถูกออกแบบสำหรับสิ่งนี้?

**คำใบ้ 3**: "audit trail ที่สมบูรณ์สำหรับ compliance" — service ใดให้ per-execution state history?

**คำตอบ**: B

**คำอธิบาย**: Step Functions Standard workflows สามารถทำงานได้ถึง 1 ปี รองรับขั้นตอน underwriter review ที่ยาวเป็นวัน Wait for callback pattern หยุดการทำงานที่ขั้นตอน underwriter ด้วย task token; เมื่อ underwriter ตัดสินใจ พวกเขาเรียกกลับด้วย token เพื่อทำ workflow ต่อ Standard workflows บันทึกทุก state transition — audit trail ที่สมบูรณ์สำหรับ compliance

**ทำไมไม่ใช่ A?** Lambda ที่ chain ผ่าน SQS ไม่ให้ built-in state tracking หรือ audit trail ขั้นตอนที่ล้มเหลวต้องการ custom retry logic การ restart จากขั้นตอนที่ล้มเหลวเฉพาะต้องการ custom implementation

**ทำไมไม่ใช่ C?** Express workflows มีระยะเวลาสูงสุด 5 นาที — เข้ากันไม่ได้กับขั้นตอนที่อาจใช้เวลาหลายวัน

**ทำไมไม่ใช่ D?** EventBridge route events ระหว่าง services แต่ไม่รักษา workflow state หรือให้ built-in retry/audit การสร้างสิ่งนี้บน EventBridge เพียงอย่างเดียวต้องการ custom state management

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus กำลังสร้างกระบวนการ food quality dispute resolution เมื่อลูกค้ารายงานประสบการณ์ที่ไม่ดี:

1. รายงานถูก validate โดยอัตโนมัติ (ตรวจสอบว่าออร์เดอร์มีอยู่ ว่ามันเพิ่งเกิดขึ้นพอ)
2. ร้านอาหารได้รับแจ้งโดยอัตโนมัติ
3. Nimbus support agent review คำร้องเรียน (ขั้นตอนด้วยตนเอง — อาจใช้เวลา 1-3 วันทำการ)
4. ตามการตัดสินใจของ agent: คืนเงิน (Lambda → payment processor) หรือส่ง apology coupon (Lambda → coupon service) หรือ escalate ไปยัง management (Step Functions sub-workflow)
5. ลูกค้าได้รับแจ้งผลลัพธ์

ออกแบบสิ่งนี้เป็น Step Functions workflow state type ใดจัดการแต่ละขั้นตอน? คุณจะจัดการการรอ 1-3 วันอย่างไร? คุณจะ model branch ที่ขั้นตอน 4 อย่างไร?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกการออกแบบ Step Functions state)*

**ส่วนขยาย**: หลังจาก state machine เสร็จสมบูรณ์ (branch ใดก็ตาม) มัน publish `OrderDisputeResolved` event ไปยัง EventBridge side effects ใดอาจฟัง event นี้? พิจารณา: ระบบ rating ของร้านอาหาร, loyalty points ของลูกค้า (การคืนเงินอาจหักคะแนน), analytics pipeline (dispute rate เป็น key restaurant quality metric) และ SLA tracking dashboard ของทีม customer support การใช้ EventBridge ที่นี่ทำให้ dispute state machine ไม่กลายเป็น dependency spider อย่างไร?

## ฉากหลังเครดิต

restaurant onboarding workflow ทำงานแล้ว

ในเดือนถัดมา พันธมิตรร้านอาหารใหม่ 12 รายลงทะเบียน สองรายมีความล้มเหลวในระหว่างขั้นตอน payment processing (ขั้นตอน 3) ในทั้งสองกรณี Step Functions จับ error ที่แน่นอน บันทึก state ของการทำงาน และส่ง alert ไปยังทีม Nimbus

Leo แก้ไขสาเหตุราก (API key ที่ตั้งค่าผิดสำหรับ payment provider) และ retry การทำงานทั้งสองจากขั้นตอน 3 การทำงานเสร็จใน 23 วินาทีแต่ละอัน กลับมาทำต่อจากที่มันล้มเหลวพอดี

ไม่มีร้านอาหารใดต้องถูก re-import ไม่มี IAM roles ถูกสร้างซ้ำ ไม่มี welcome emails ซ้ำถูกส่ง

"ก่อนมี Step Functions" Leo บอก Maya "นี่จะต้องมีคนติดตามด้วยตนเองว่าอะไรทำและไม่ได้ทำสำหรับแต่ละร้านอาหาร และรันขั้นตอนที่ขาดด้วยตนเอง"

"แล้วตอนนี้?"

"ตอนนี้ผมคลิก retry ใน console ระบบรู้ว่าอะไรเสร็จแล้ว"

Maya คิดเกี่ยวกับสิ่งนี้

"นั่นไม่ใช่แค่การปรับปรุงทางเทคนิค" เธอพูด "นั่นคือความแตกต่างระหว่างกระบวนการที่ scale ได้และกระบวนการที่ scale ไม่ได้"

ในบทต่อไป: จะทำอย่างไรกับข้อมูลที่คุณไม่ได้เข้าถึงในตอนนี้ แต่แน่ใจว่าต้องการเก็บไว้ตลอดไป
