# باب 22: وہ فلو چارٹ جو خود چلتا ہے

Leo ایک گھنٹے سے ایک ہی log file کو گھور رہا تھا۔ Stack traces انفرادی طور پر کافی واضح تھے، لیکن ان میں pattern — وہ طریقہ جس سے ایک step خاموشی سے ناکام ہوتا اور اگلا step پھر بھی چلتا — اسے دیکھنے میں اسے کچھ وقت لگا تھا۔ آخرکار اس نے پیچھے ٹیک لگائی، اپنی coffee نیچے رکھی، اور اپنے notepad پر ایک ہی لفظ لکھا: *coordination*۔

ایک ایسے conductor کا تصور کریں جو performance کے بیچ میں podium سے اتر جائے۔ Orchestra بجاتا رہتا ہے — لیکن bar 47 پر brass کو لانے والا کوئی نہیں، finale سے پہلے خاموشی کا اشارہ دینے والا کوئی نہیں۔ انفرادی موسیقار اپنے حصے صحیح طریقے سے بجاتے ہیں۔ Performance پھر بھی بکھر جاتا ہے، کیونکہ حصے اس coordination پر منحصر ہیں جسے کوئی manage نہیں کر رہا۔

یہ وہ مسئلہ تھا جو Leo نے order confirmation code میں پایا تھا۔ کسی انفرادی step میں کوئی bug نہیں۔ ایک coordination failure۔

---

Containers صحیح طریقے سے چل رہے تھے اور صاف ستھرا deploy ہو رہے تھے۔ ECS deployment pipeline مضبوط تھی۔ لیکن application code کے اندر، ایک مختلف قسم کی failure ہفتوں سے جمع ہو رہی تھی۔ Containers ٹھیک تھے۔ ان میں سے ایک کے اندر کی logic نہیں تھی۔

Leo logs میں pattern کو ٹریک کر رہا تھا لیکن اسے اس وقت تک نہیں سمجھا تھا جب تک اس نے واقعات کو نہیں گنا۔

گیارہ بار۔ دو ہفتوں میں۔

---

Nimbus میں ایک order confirmation کے لیے پانچ چیزوں کا ترتیب میں ہونا ضروری تھا: کارڈ charge کریں، confirmation email بھیجیں، ریستوران کو notify کریں، inventory اپڈیٹ کریں، اور accounting کے لیے transaction log کریں۔

جب Leo نے اصل order confirmation function لکھا تھا، اس نے پوری چیز کو ایک `try/except` block میں لپیٹا تھا اور کہا تھا "یہ ٹھیک رہے گا — ہم logs میں errors پکڑ لیں گے۔" یہ آٹھ ماہ پہلے کی بات تھی۔

یہ ٹھیک نہیں تھا۔

اگر step تین ناکام ہوتا — اگر ریستوران notification timeout ہو جاتی — تو steps ایک اور دو پہلے ہی ہو چکے ہوتے۔ Customer سے charge ہو چکا ہوتا۔ Email بھیج دی گئی ہوتی۔ لیکن ریستوران کو معلوم نہیں ہوتا کہ آرڈر موجود ہے۔

Leo کے پاس bug کی اس قسم کے لیے ایک نام تھا: partial success۔ "سب کچھ کام کر گیا،" اس نے کہا، "سوائے اس حصے کے جو اہم تھا۔"

"یہ کتنی بار ہوا ہے؟" Maya نے پوچھا۔

"پچھلے دو ہفتوں میں گیارہ بار۔ ہم نے زیادہ تر کو ریستوران کو غصے بھری calls سے پکڑا۔ دو ہم نے logs میں پایا، واقعہ کے بعد۔"

"تو ہمارے پاس کوئی coordination نہیں ہے،" Priya نے کہا۔ "پانچ steps، ایک script کے طور پر چلتے ہوئے، اس ضمانت کے بغیر کہ وہ سب مکمل ہوں۔ اور اگر کوئی step دو کے دوران توڑنے کی کوشش کرے — charge ہونے کے بعد لیکن ریستوران کو notify کرنے سے پہلے؟ ہم نے پہلے ہی customer سے ایک ایسے آرڈر کے لیے bill کر لیا ہے جو ریستوران کے پاس نہیں ہے۔"

"یا کہ وہ صحیح ترتیب میں مکمل ہوں۔"

"یا کہ ہمیں معلوم ہو کہ کون سا ناکام ہوا۔"

Leo نے projector پر code کھولا۔ یہ ایک Python function تھا: پچاس لائنیں، پانچ sequential API calls، پوری چیز کے گرد ایک واحد try/except block۔

"ہمیں ایک workflow چاہیے،" Maya نے کہا۔ "کوئی چیز جو ہر step کو ٹریک کرے۔ رکو — لیکن ہم موجودہ Python function میں بہتر error handling کیوں نہ شامل کریں؟ ہمیں ایک پوری نئی service کیوں چاہیے؟"

"کیونکہ بہتر error handling پھر بھی ایک واحد process میں چلتی ہے جو کسی بھی نقطے پر ناکام ہو سکتی ہے،" Leo نے کہا۔ "اگر server execution کے بیچ میں restart ہو، error handling اس کے ساتھ restart ہو جاتی ہے۔ Step Functions state کو externally persist کرتا ہے۔"

ایک manufacturing checklist کے بارے میں سوچیں — ایک جہاں ہر station اگلے کو منتقل کرنے سے پہلے completion کی تصدیق کرتا ہے، اور جہاں جب کچھ ناکام ہوتا ہے تو پوری لائن اپنی پوزیشن پکڑے رکھتی ہے۔ لائن شروع سے دوبارہ شروع نہیں ہوتی۔ یہ اس عین station سے دوبارہ شروع ہوتی ہے جو ناکام ہوا۔ اس station کی state record کی جاتی ہے۔ اس سے پہلے کے steps ہو چکے ہیں اور دہرائے نہیں جاتے۔ اس کے بعد کے steps انتظار کرتے ہیں جب تک مسئلہ حل نہ ہو جائے۔

یہی وہ ہے جو order confirmation flow کو چاہیے تھا۔ مسئلے کے گرد مزید code نہیں۔ ایک ایسا نظام جو مسئلے کو manage کرنے کے لیے ڈیزائن کیا گیا ہو۔

**AWS Step Functions: Workflows کی Orchestration**

**AWS Step Functions** ایک serverless orchestration service ہے جو ایک application کے steps کو ایک visual workflow کے طور پر coordinate کرتی ہے۔ ہر step ایک **state machine** میں ایک **state** ہے۔

ایک Python script کے بجائے جو اوپر سے نیچے چلتا ہے اور crash ہوتا ہے، آپ workflow کو ایک JSON/YAML state machine کے طور پر define کرتے ہیں:

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

ہر state کر سکتا ہے:

- **ایک Lambda function execute کرنا** (سب سے عام pattern)
- **ایک ECS task execute کرنا** (طویل تر کام کے لیے)
- **ایک مخصوص وقت** یا **event** کے لیے **انتظار کرنا** (workflow کو روکنا جب تک کوئی بیرونی چیز نہ ہو)
- شرائط کی بنیاد پر **ایک راستہ منتخب کرنا** (if/else logic)
- **متوازی شاخیں** بیک وقت **چلانا**
- configurable backoff کے ساتھ **ناکامی پر retry کرنا**
- **errors پکڑنا** اور error-handling states کی طرف route کرنا

Step Functions execution state کو durably manage کرتا ہے۔ اگر step 3 ناکام ہو، execution step 3 پر رک جاتی ہے۔ آپ console میں ناکام execution کا معائنہ کر سکتے ہیں، مسئلہ fix کر سکتے ہیں، اور step 3 سے دوبارہ شروع کر سکتے ہیں — steps 1 اور 2 دہرائے بغیر۔

آپ شاید سوچ رہے ہوں: کیا آپ بس اپنے Lambda function میں retry logic نہیں لکھ سکتے؟ ہاں — لیکن پھر آپ code میں failure tracking، state persistence، اور audit logging بھی لکھ رہے ہیں۔ اور جب 7 میں سے step 3 ناکام ہو، آپ کو جاننا ہوگا کہ کون سا ریستوران process ہو رہا تھا، پہلے کیا ہوا، اور کہاں سے دوبارہ شروع کرنا ہے۔ Step Functions یہ سب کرتا ہے۔

**Nimbus Order Flow: تشریح شدہ State Machine**

یہ اصل Step Functions state machine کا ایک آسان version ہے جو Nimbus نے order confirmation کے لیے بنایا — تشریح شدہ تاکہ آپ دیکھ سکیں کہ ہر حصہ کیا کرتا ہے:

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

چند چیزیں نوٹ کریں:

**`ChargeCard` کے دو Catch clauses ہیں۔** ایک `PaymentDeclinedError` کے لیے (ایک معلوم، متوقع failure — کارڈ declined ہوا، system error نہیں) اور ایک `States.ALL` کے لیے (کچھ بھی اور — ایک system outage، ایک timeout، ایک غیر متوقع exception)۔ وہ مختلف states کی طرف route ہوتے ہیں کیونکہ ان کے مختلف معنی ہیں۔

**`NotifyRestaurant` کا ایک Catch ہے جو `RestaurantNotificationFailed` کی طرف route کرتا ہے۔** یہ وہ bug ہے جس نے گیارہ واقعات کا سبب بنا۔ پرانے Python script میں، کوئی مساوی نہیں تھا — اگر notification ناکام ہوتی، function یا تو خاموشی سے crash ہوتا یا ایک error log کرتا اور جاری رہتا۔ Step Functions failure path کو واضح بناتا ہے: یہ کہیں مخصوص جاتا ہے، اور وہ کہیں کسی کو call کرنے سے پہلے support team کو alert کرتا ہے۔

**ہر Task کا Retry ہے۔** اگر email service میں ایک عارضی timeout ہو، یہ خودبخود retry کرتا ہے، تین بار، بڑھتے backoff کے ساتھ۔ Customer کبھی یہ نہیں دیکھتا۔ آرڈر نہیں کھوتا۔

**Flow ایک graph ہے، script نہیں۔** اگر `NotifyRestaurant` مستقل طور پر ناکام ہو (retries کے بعد)، execution `UpdateInventory` کی طرف جاری نہیں رہتی۔ Workflow `RestaurantNotificationFailed` پر رک جاتا ہے۔ Inventory ایک ایسے ریستوران کے لیے اپڈیٹ نہیں ہوتی جسے آرڈر کے بارے میں معلوم نہیں۔ یہ صحیح behavior ہے۔

"رکو — لیکن ہمیں payment declined بمقابلہ system error کے لیے الگ failure paths کیوں چاہئیں؟" Maya نے پوچھا۔

"کیونکہ ان کے لیے بالکل مختلف responses کی ضرورت ہے،" Leo نے کہا۔ "ایک declined کارڈ کا مطلب ہے ہم customer کو email کرتے ہیں اور انہیں دوبارہ کوشش کرنے کو کہتے ہیں۔ charge function میں ایک system error کا مطلب ہے ہمیں ایک engineer چاہیے یہ تحقیق کرنے کے لیے کہ Lambda function کیوں ناکام ہو رہا ہے۔ ایک ہی قابل مشاہدہ نتیجہ — آرڈر نہیں ہوا — لیکن بالکل مختلف remediation۔"

**State کی اقسام: بنیادی عناصر**

**Task**: ایک action execute کریں — ایک Lambda function call کریں، ایک ECS task شروع کریں، ایک API call کریں۔ یہ وہ جگہ ہے جہاں حقیقی کام ہوتا ہے۔

**Choice**: input data میں شرائط کی بنیاد پر شاخ کریں۔ code میں ایک if/else کی طرح۔

**Parallel**: متعدد شاخیں بیک وقت چلائیں اور سب کے مکمل ہونے کا انتظار کریں۔

**Map**: ایک list میں ہر item پر states کا ایک سیٹ لاگو کریں۔ 50 ریستوران menu items کو متوازی process کریں۔

جب Nimbus ایک ریستوران کا menu import کرتا، menu میں 8 سے 200 items تک ہو سکتے تھے۔ ہر item کے لیے، import process کو ضرورت تھی: format validate کرنا، allergen data چیک کرنا، photo resize کرنا، اور record کو DynamoDB میں لکھنا۔

Map state کے بغیر، یہ items کو ترتیب وار process کرتا ایک واحد Lambda ہوتا — 200 items × فی item 200ms = 40 سیکنڈ processing time۔ Map state کے ساتھ، Step Functions processing states کے concurrent executions launch کرتا ہے — configured concurrency limit تک — اور ان سب کے مکمل ہونے کا انتظار کرتا ہے۔ وہی 200 items 5 سیکنڈ سے کم میں ختم ہو سکتے ہیں۔

**Wait**: ایک مخصوص وقت کے لیے یا ایک timestamp تک رکیں۔ Scheduled delays کے لیے مفید۔

**Pass**: کام کیے بغیر input کو output میں pass کریں۔ Data transformation اور testing کے لیے استعمال ہوتا ہے۔

**Succeed/Fail**: Terminal states جو execution ختم کرتے ہیں۔

ریستوران onboarding کے لیے، Leo نے ایک workflow ڈیزائن کیا:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda، 3 retries کے ساتھ)
3. Parallel branch:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda، parallel کے مکمل ہونے کا انتظار کرتا ہے)
5. NotifySalesTeam (Task → Lambda)

Steps 3a اور 3b متوازی چلتے ہیں — وہ ایک دوسرے پر منحصر نہیں ہیں، اور انہیں بیک وقت چلانا وقت بچاتا ہے۔

پہلی ریستوران cohort کے onboarding مکمل کرنے کے بعد، ایک compliance requirement سامنے آئی: ایک ریستوران partner کے live ہونے سے پہلے، ایک Nimbus account manager کو license documentation کا دستی جائزہ لے کر منظوری دینا پڑتی۔ اس میں ایک سے تین business days لگ سکتے تھے۔

"اور اگر کوئی اس window کے دوران توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "اگر ریستوران جزوی طور پر configured ہو — payment account بنایا گیا لیکن ابھی منظور نہیں ہوا — اور کوئی pending state دریافت کر لے، وہ نیم کھلی configuration کا فائدہ اٹھانے کی کوشش کر سکتا ہے۔"

زیادہ عملی طور پر: آپ کسی انسان کا انتظار کرتے ہوئے ایک Step Functions workflow کو تین دن کے لیے کیسے روکتے ہیں؟

جواب **task token کے ساتھ callback pattern** ہے۔

جب `ValidateLicense` چلتا ہے، خودبخود مکمل ہونے کے بجائے، یہ ایک Lambda call کرتا ہے جو تین چیزیں کرتا ہے:

1. account manager کو ریستوران کے documents کے ساتھ ایک email بھیجتا ہے
2. ایک **task token** (ایک unique identifier جو Step Functions اس مخصوص execution اور state کے لیے generate کرتا ہے) کو ایک database میں record کرتا ہے، اس pending review سے منسلک
3. `.waitForTaskToken` کے ساتھ Step Functions کو واپس کرتا ہے — جو Step Functions کو بتاتا ہے کہ اس state پر execution کو غیر معینہ مدت کے لیے روک دے

Step Functions execution کو park کر دیتا ہے۔ اور کچھ block نہیں ہوتا — کوئی server انتظار میں نہیں بیٹھتا۔ State machine بس انتظار کرتا ہے، کوئی compute resources استعمال کیے بغیر۔

تین دن بعد، account manager internal admin tool میں "Approve" پر کلک کرتا ہے۔ Admin tool database سے task token دیکھتا ہے اور call کرتا ہے:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions دوبارہ شروع ہوتا ہے۔ Execution step 2 (`ImportMenu`) سے جاری رہتی ہے، reviewer کی معلومات workflow state میں دستیاب کے ساتھ۔

"Execution تین دن کے لیے رکی رہی،" Leo نے کہا، "اور جب میں نے اسے منظور کیا تو واحد چیز جو ہوئی وہ ایک API call تھی۔"

"اور اگر account manager اسے مسترد کرے؟" Maya نے پوچھا۔

"ہم اس کے بجائے `send_task_failure` call کرتے ہیں۔ State machine اسے پکڑتا ہے اور ایک `NotifyRejection` state کی طرف route کرتا ہے جو ریستوران partner کو email کرتی ہے۔"

Step Functions poll نہیں کرتا۔ یہ retry نہیں کرتا۔ یہ timeout نہیں ہوتا (جب تک آپ ایک heartbeat timeout سیٹ نہ کریں)۔ یہ بس انتظار کرتا ہے جب تک callback نہ آئے، پھر جاری رہتا ہے۔ یہ ایک database یا queue کو poll کرنے سے بنیادی طور پر مختلف ہے — اور یہی وجہ ہے کہ Step Functions ان workflows کے لیے موزوں ہے جو automated اور manual steps کو ملاتے ہیں۔

**Execution Console پڑھنا: ایک Failure کیسی نظر آتی ہے**

جب Nimbus کے Step Functions پر پہلے ہفتے کے دوران ریستوران notification Lambda timeout ہوا، Leo نے Step Functions console کھولا اور ناکام execution پر کلک کیا۔

**Execution Event History** نے بالکل وہی timeline دکھائی جو ہوا:

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

42 سیکنڈ میں، Step Functions نے کارڈ charge کیا تھا، email بھیجی تھی، ریستوران notification کی تین بار کوشش کی تھی، failure پکڑی تھی، support team کو alert کیا تھا، اور مکمل history record کی تھی۔ Step Functions سے پہلے، یہ failure invisible ہوتی — Python function "notification failed" log کرتا اور caller کو 200 واپس کرتا جیسے کچھ غلط نہیں تھا۔

"Timeline بالکل دکھاتی ہے کہ چیزیں کہاں اور کب غلط ہوئیں،" Leo نے کہا۔ "اور ہر retry attempt timestamped ہے۔ آپ backoff intervals دیکھ سکتے ہیں۔"

Priya نے console دیکھا۔ "اور یہ history کتنی دیر اسٹور ہوتی ہے؟"

Standard workflow execution history 90 دن کے لیے اسٹور ہوتی ہے۔ Compliance یا long-term auditing کے لیے، execution events کو CloudWatch Logs میں بھی export کیا جا سکتا ہے اور غیر معینہ مدت کے لیے retain کیا جا سکتا ہے۔

**Standard بمقابلہ Express Workflows**

Step Functions دو workflow اقسام پیش کرتا ہے:

**Standard workflows**:

- زیادہ سے زیادہ مدت: 1 سال
- Executions durable ہیں — state persist ہوتی ہے، معائنہ اور audit کی جا سکتی ہے
- Exactly-once execution (ایک task کبھی ایک بار سے زیادہ نہیں چلتا جب تک آپ ایک Retry configure نہ کریں)
- فی state transition قیمت لگائی جاتی ہے
- long-running، اہم workflows کے لیے بہترین (order processing، onboarding، payment flows)

**Express workflows**:

- زیادہ سے زیادہ مدت: 5 منٹ
- زیادہ throughput — فی سیکنڈ 100,000 تک
- At-least-once execution (asynchronous) یا at-most-once (synchronous) — tasks کو idempotent ڈیزائن کریں
- مدت کے لحاظ سے قیمت لگائی جاتی ہے (Lambda کی طرح)
- high-volume، short-duration workflows کے لیے بہترین (real-time event processing، IoT data ingestion)

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے pricing page کھولتے ہوئے پوچھا۔ "Standard کے لیے فی state transition — یہ جمع ہوتا ہے اگر آپ کے بہت سے steps ہوں۔"

Leo نے ریاضی سمجھائی۔ ریستوران onboarding workflow کے لیے (فی execution چھ task states، تقریباً 12-15 نئے ریستوران فی مہینہ): سو سے کم state transitions — ایک سینٹ سے کم، اور مکمل طور پر 4,000-transition ماہانہ free tier کے اندر، تو مؤثر طور پر $0۔ پوری Nimbus traffic پر order confirmation workflow کے لیے: زیادہ معنی خیز، لیکن پھر بھی فی مہینہ گیارہ partial successes کو دستی debug کرنے کی لاگت سے کافی کم۔

"Debugging time چھپی ہوئی لاگت ہے،" Leo نے کہا۔

"یہ ہمیشہ چھپی ہوئی لاگت ہوتی ہے،" Tom نے کہا۔

Tom نے زیادہ احتیاط سے نمبر چلائے، کیونکہ یہ Tom تھا۔

**Nimbus کے order confirmation flow کے لیے Standard workflow لاگت**: happy path پر فی آرڈر پانچ states، $0.000025 فی state transition پر۔ پانچ state transitions × $0.000025 × 15,000 آرڈرز فی مہینہ = **$1.88/مہینہ**۔ آرڈر volume کے دس گنا پر: تقریباً $19/مہینہ۔ ایک partial-success incident کے لیے debugging لاگت (24 منٹ support engineer وقت) ماہانہ Step Functions bill سے کئی گنا زیادہ تھی۔

موازنہ اہم ہو جاتا ہے اگر کوئی high-frequency analytics events کے لیے Standard workflows استعمال کرنے کا مشورہ دے۔ فرض کریں Nimbus ہر raw clickstream event کو process کرنے کے لیے Step Functions استعمال کرنا چاہتا تھا — ہر menu page view، ہر scroll، ہر search۔ یہ ان کے موجودہ پیمانے پر تقریباً 800,000 events فی دن ہے۔ ہر event کے لیے ایک five-state Standard workflow: 800,000 × 5 × $0.000025 × 30 دن = **$3,000/مہینہ**۔ یہ ایک analytics pipeline کے لیے حقیقی پیسہ ہے۔

اسی volume کے لیے Express workflows: فی state transition کے بجائے فی request علاوہ duration قیمت لگائی جاتی ہے۔ 24 ملین ماہانہ executions کی لاگت $1.00 فی ملین requests = $24۔ Duration: 24M × 500ms 64MB billing minimum پر ≈ 208 GB-hours × $0.06 = $12.50۔ کل ≈ **$36.50/مہینہ** — Standard کے $3,000 سے تقریباً دو آرڈرز of magnitude سستا۔

"تو workflow کی قسم صرف ایک architectural فیصلہ نہیں ہے،" Tom نے کہا۔ "یہ ایک cost فیصلہ ہے۔ states کی ایک ہی تعداد آپ کے استعمال کردہ workflow type کے لحاظ سے تقریباً سو گنا زیادہ خرچ کر سکتی ہے۔"

"اور کون سا بہتر ہے اس کا انحصار مکمل طور پر اس پر ہے کہ workflow کیا کرتا ہے،" Leo نے کہا۔ "Order confirmation: Standard۔ یہ اہم ہے، اس کے معنی خیز failure paths ہیں، ہم audit trail چاہتے ہیں۔ Analytics event processing: Express۔ یہ high volume، short duration ہے، اور ہمیں ہر page view کے لیے 90-دن execution history کی ضرورت نہیں۔"

اگر آپ کے process کے دو steps ہیں اور اسے audit trail کی ضرورت نہیں، ایک سادہ Lambda function سستا ہے اور کسی JSON state machine syntax کی ضرورت نہیں — لیکن اگر کوئی step آزادانہ ناکام ہو سکتا ہے اور پہلے steps دہرائے بغیر retry یا restart ہونا چاہیے، Step Functions کم debugging اور دستی remediation میں خود کی ادائیگی کر دیتا ہے۔

Nimbus کے ریستوران onboarding کے لیے: Standard (یہ اہم ہے، durable، manual steps شامل ہوں تو گھنٹے لگ سکتے ہیں)۔

Nimbus کے real-time order status updates کے لیے: Express (high volume، short duration، کم اہم)۔

**Event-Driven Architecture: بڑی تصویر**

Step Functions ایک بڑے pattern کا ایک ٹکڑا ہے: **event-driven architecture**۔ Services کے ایک دوسرے کو براہ راست call کرنے (tight coupling) کے بجائے، services events emit کرتی ہیں، اور دوسری services ان events پر react کرتی ہیں۔

ہم نے یہ پوری کتاب میں دیکھا ہے:

- آرڈرز دیے گئے → SNS event publish کرتا ہے → SQS queues consumers کو deliver کرتی ہیں
- S3 file اپلوڈ ہوئی → Lambda اسے process کرنے کے لیے trigger ہوا
- DynamoDB record تبدیل ہوا → DynamoDB Streams → Lambda ایک cache اپڈیٹ کرتا ہے

**Amazon EventBridge** (سابقہ CloudWatch Events) اس pattern کے لیے advanced event bus ہے۔ یہ AWS services اور آپ کی اپنی applications سے events کو rules کی بنیاد پر targets (Lambda، SQS، Step Functions، وغیرہ) کی طرف route کرتا ہے۔

EventBridge ایک architectural سطح پر loose coupling کی اجازت دیتا ہے: order service `order.placed` events publish کرتی ہے بغیر یہ جانے کہ کون سن رہا ہے۔ analytics service، notification service، اور loyalty points service سب آزادانہ سنتے ہیں۔ ایک نیا listener شامل کرنے کے لیے order service کو تبدیل کرنے کی ضرورت نہیں۔

EventBridge درجنوں AWS services کے ساتھ **event sources** کے طور پر natively بھی integrate ہوتا ہے۔ جب ایک CloudTrail API call ایک pattern سے match کرتا ہے، EventBridge ایک rule فائر کر سکتا ہے۔ جب ایک EC2 instance state بدلتی ہے، EventBridge ایک Lambda trigger کر سکتا ہے۔ جب ایک RDS instance failover ہوتا ہے، EventBridge on-call engineer کو alert کر سکتا ہے۔ آپ پورے AWS control plane کو ایک event stream کے طور پر سمجھ سکتے ہیں۔

Nimbus کے لیے، ایک خاص طور پر مفید EventBridge rule: جب بھی ECR کو ایک نئی image push کی جائے ایک Lambda trigger کریں۔ Lambda image scan result چیک کرتا ہے اور اگر کوئی HIGH یا CRITICAL CVEs پائے جائیں تو engineering Slack channel پر post کرتا ہے — اس سے پہلے کہ کوئی image deploy کرے۔ یہ ECR کی security scanning (باب 21 سے) کو EventBridge کی event routing کے ساتھ ایک خودکار security gate میں جوڑتا ہے۔

Event-driven architecture کا اصول Step Functions کی retry logic جیسا ہی ہے: failure کو واضح اور routed بنائیں، نہ کہ خاموش اور نگلا ہوا۔ Events کے ذریعے بات کرنے والی services احسن طریقے سے ناکام ہوتی ہیں — اگر loyalty points Lambda بند ہو جب ایک `OrderConfirmed` event فائر ہو، EventBridge delivery کو retry کر سکتا ہے یا ایک dead-letter queue کو بھیج سکتا ہے۔ Order confirmation خود غیر متاثر رہتی ہے۔ Decoupling ہی resilience ہے۔

**EventBridge: Side Effects کو مرکزی Flow سے Decouple کرنا**

order confirmation state machine صاف ستھرا چلنے کے بعد، Maya نے اگلے architecture review میں ایک سوال اٹھایا۔

"ہم آرڈر confirm ہونے پر loyalty points شامل کرنا چاہتے ہیں۔ Customer کو فی ڈالر خرچ پر ایک point ملتا ہے۔ یہ state machine میں کہاں جاتا ہے؟"

Leo کی پہلی جبلت: `LogTransaction` کے بعد ایک `GrantLoyaltyPoints` state شامل کریں۔

Priya کا جواب: "اور پھر جب ہم referral bonuses شامل کریں؟ اور post-order surveys؟ اور ریستوران ratings کی درخواستیں؟ ہر ایک critical path میں ایک state شامل کرتا ہے۔ اگر loyalty points Lambda ناکام ہو، پوری order confirmation ناکام ہو جاتی ہے۔"

"order confirmation flow کو ایک کام کرنا چاہیے،" اس نے کہا۔ "آرڈر confirm کرنا۔ باقی سب کچھ ایک side effect ہے۔"

یہ مرکزی workflow سے side effects کو loose-coupling کرنے کے mechanism کے طور پر **Amazon EventBridge** کے لیے architectural دلیل ہے۔

نظر ثانی شدہ طریقہ: جب `LogTransaction` state کامیابی سے مکمل ہوتی ہے، Lambda EventBridge کو ایک event publish کرتا ہے:

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

پھر EventBridge rules اس event کو آزاد targets کی طرف route کرتے ہیں:

- **Rule 1**: `OrderConfirmed` → Loyalty Points Lambda (ایک $32 آرڈر کے لیے 32 points دیتا ہے)
- **Rule 2**: `OrderConfirmed` → Post-Order Survey Lambda (delivery کے 2 گھنٹے بعد کے لیے ایک survey queue کرتا ہے)
- **Rule 3**: `OrderConfirmed` → Analytics Kinesis Stream (real-time dashboard کو feed کرتا ہے)

ہر rule آزاد ہے۔ Loyalty Points Lambda survey queue کو متاثر کیے بغیر ناکام ہو سکتا ہے۔ Analytics pipeline loyalty system کو block کیے بغیر پیچھے رہ سکتی ہے۔ ایک نیا side effect شامل کرنے (ایک ریستوران rating request، ایک cashback notification) کے لیے ایک نئی EventBridge rule بنانا درکار ہے — state machine کو تبدیل کرنا نہیں۔

"اور اگر کوئی ایک EventBridge rule کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "اگر event میں customer PII ہو، تو ہر وہ Lambda جو اسے وصول کرتا ہے اب ایک PII access point ہے۔"

Event کو احتیاط سے ڈیزائن کیا گیا تھا: صرف IDs، نہ کہ نام، پتے، یا payment تفصیلات۔ کوئی بھی Lambda جسے customer data چاہیے ہو وہ اسے customer ID استعمال کرتے ہوئے database سے دیکھے گا — اپنی IAM permissions کے ساتھ جو کنٹرول کرتی ہیں کہ یہ کیا access کر سکتا ہے۔

"Event ایک signal ہے،" Priya نے کہا۔ "Data dump نہیں۔"

**جب Step Functions صحیح Tool ہو**

Step Functions تب بہترین کام کرتا ہے جب آپ کے پاس ہو:

**Multi-step workflows** جنہیں steps میں progress ٹریک کرنے کی ضرورت ہے

**Human-in-the-loop processes** — Step Functions ایک بیرونی event (جیسے کوئی انسان کسی چیز کی منظوری) کے لیے غیر معینہ مدت تک انتظار کر سکتا ہے اور پھر جاری رہ سکتا ہے

**پیمانے پر error handling** — بہت سے steps میں built-in retry، catch، اور fallback logic

**Auditable processes** — ہر execution ہر state transition record کرتی ہے۔ آپ بالکل دیکھ سکتے ہیں کہ کیا ہوا اور کب۔

**پیچیدہ متوازی یا sequential logic** — visual workflow اسے مساوی code سے سمجھنا آسان بناتا ہے

Step Functions سادہ دو-step processes کے لیے ضرورت سے زیادہ ہے۔ اسے تب استعمال کریں جب coordination خود قیمتی ہو اور failure scenarios اہم ہوں۔

**جب Step Functions غلط Tool ہو**

"رکو — لیکن ہم ہر چیز کے لیے Step Functions کیوں نہ استعمال کریں؟" Maya نے design session کے آخر میں پوچھا۔ "ہم نے ریستوران onboarding workflow بنایا ہے۔ ہمارے پاس order confirmation flow ہے۔ ہر چیز کو state machines میں کیوں نہ تبدیل کر دیں؟"

ایماندارانہ جواب: کیونکہ Step Functions ایسا overhead شامل کرتا ہے جسے ہر workflow جائز نہیں ٹھہراتا۔

**سادہ دو-step processes**: اگر آپ کا ایک Lambda ہے جو ایک دوسرے Lambda کو call کر کے ایک اپلوڈ کی گئی file process کرتا ہے، ایک state machine کا coordination overhead operational فائدے کے قابل نہیں۔ ایک واحد function کے اندر ترتیب وار call کیے گئے دو Lambdas آسان، test کرنے میں آسان، اور کوئی per-state-transition لاگت نہیں رکھتے۔

**انتہائی-high frequency، sub-second workflows**: Standard workflows کا ایک غیر معمولی per-state-transition لاگت ہے جو high volume پر جمع ہوتی ہے (جیسا کہ اوپر analytics مثال نے دکھایا)۔ Express workflows cost مسئلہ حل کرتے ہیں لیکن durable state history فراہم نہیں کرتے۔ بہت زیادہ frequency پر بہت کم duration کے ساتھ، SQS علاوہ Lambda (باب 19 کا pattern) دونوں Step Functions اقسام سے آسان اور سستا ہے۔

**خالص fan-out بغیر coordination**: اگر آپ کو ایک ہی event بیس consumers کو بھیجنا ہے اور ہر ایک کے نتیجے کی پرواہ نہیں، SNS وہ tool ہے۔ Step Functions ایسی state tracking شامل کرتا ہے جس کی آپ کو ضرورت نہیں اور جس کی آپ غیر ضروری ادائیگی کریں گے۔

**Real-time synchronous user interactions**: Step Functions executions asynchronous ہیں۔ اگر کوئی user checkout screen پر 500ms سے کم میں ایک synchronous response کا انتظار کر رہا ہے، ایک Step Functions Standard workflow اس کے لیے ڈیزائن نہیں کیا گیا (Express workflows synchronously invoke کیے جا سکتے ہیں، لیکن latency overhead پھر بھی ایک براہ راست Lambda call سے زیادہ ہے)۔ Synchronous user-facing flows کے لیے، اچھی طرح ڈیزائن کیے گئے error handling کے ساتھ Lambda + API Gateway اکثر زیادہ مناسب ہے۔

اصول: Step Functions تب استعمال کریں جب steps کا *coordination* خود پیچیدہ ہو — جب steps آزادانہ ناکام ہو سکتے ہوں، جب آپ کو پہلے والے دہرائے بغیر انفرادی steps retry کرنے کی ضرورت ہو، جب execution history کی compliance یا debugging قدر ہو، یا جب workflow میں انسانی منظوری کے steps شامل ہوں جو دن لے سکتے ہوں۔ اسے سادہ sequential logic میں orchestration overhead شامل کرنے کے لیے استعمال نہ کریں جو ایک واحد function کے طور پر ٹھیک کام کرتی ہے۔

## خوبیاں اور حدود

**Step Functions کیوں طاقتور ہے**:

- Visual execution history — بالکل دیکھیں کہ ایک workflow کہاں ہے (یا کہاں ناکام ہوا)
- Built-in retry اور error handling — کوئی custom retry code نہیں
- Durable state — executions service restarts اور outages سے بچ جاتی ہیں
- 200+ AWS services کے ساتھ براہ راست integrations (صرف Lambda نہیں)
- Visual workflow خود-دستاویزی ہے
- Callback pattern compute استعمال کیے بغیر انسانی اعمال کے لیے غیر معینہ انتظار کو قابل بناتا ہے

**جہاں یہ پیچیدہ ہو جاتا ہے**:

- Standard workflows کی قیمت فی state transition لگائی جاتی ہے — بہت سے states والے پیچیدہ workflows پیمانے پر مہنگے ہو سکتے ہیں
- ASL (Amazon States Language) JSON format کا ایک سیکھنے کا منحنی خط ہے
- زیادہ سے زیادہ payload size 256KB ہے — بڑا data S3 references کے ذریعے pass کرنا ضروری ہے، براہ راست workflow کے ذریعے نہیں
- بہت سے manual steps والے long-running workflows کو احتیاط سے timeout configuration درکار ہے
- ASL errors debug کرنے کے لیے executions چلانا درکار ہے؛ کوئی local emulator اتنا قابل نہیں جتنی حقیقی service
- IAM permissions کو ہر اس resource کے لیے الگ سے دینا ضروری ہے جسے state machine call کرتا ہے — ایک permission بھولنا runtime پر ایک confusing error کا سبب بنتا ہے

## خلاصہ

باب 21 کے containers نے deployments کو قابل اعتماد بنایا۔ Step Functions multi-step business processes کو قابل اعتماد بناتا ہے — وہی "handoff خطرہ ختم کریں" اصول application logic پر لاگو۔

- **Step Functions** multi-step workflows کو state machines کے طور پر orchestrate کرتا ہے۔
- ہر **state** ایک Lambda function چلا سکتا ہے، ایک ECS task execute کر سکتا ہے، انتظار کر سکتا ہے، شاخ کر سکتا ہے، یا متوازی steps چلا سکتا ہے۔
- **Retry اور catch** ہر state میں built-in ہیں — کوئی custom retry code درکار نہیں۔
- **Standard workflows**: long-running (1 سال تک)، durable، exactly-once۔ اہم business processes کے لیے۔
- **Express workflows**: short-duration (5 منٹ تک)، high-throughput۔ high-volume event processing کے لیے۔
- **task token کے ساتھ callback pattern**: ایک بیرونی event یا انسانی action کا انتظار کرتے ہوئے ایک workflow کو غیر معینہ مدت تک روکیں؛ ایک واحد API call کے ساتھ دوبارہ شروع کریں۔
- **Map state**: items کی ایک list کو concurrently process کریں — sequential loops کو parallel fan-out سے replace کریں۔
- **براہ راست SDK integrations**: ایک state سے براہ راست DynamoDB، S3، SQS، اور 200+ AWS services call کریں، ایک Lambda wrapper کے بغیر۔
- **EventBridge**: side effects کو مرکزی workflow سے decouple کریں — ایک واحد event publish کریں، آزاد rules کو اسے loyalty points، analytics، اور survey services کی طرف route کرنے دیں core state machine کو تبدیل کیے بغیر۔
- **Standard بمقابلہ Express لاگت**: $0.000025 فی state transition پر Standard low-volume اہم workflows کے لیے اچھا کام کرتا ہے (Nimbus کے لیے order confirmation $1.88/مہینہ پر)۔ per-request-plus-duration pricing پر Express high-frequency events کے لیے مناسب ہے جہاں Standard درجنوں گنا زیادہ خرچ کرتا (Nimbus کی clickstream ریاضی میں ~80x)۔
- **Event-driven architecture** SNS، SQS، Lambda، اور EventBridge جیسی services استعمال کرتی ہے تاکہ نظاموں کو براہ راست calls کے بجائے events کے گرد decouple کیا جائے۔
- Step Functions تب استعمال کریں جب steps کا coordination خود پیچیدہ ہو اور جب auditability اہم ہو۔ اسے سادہ دو-step sequences، انتہائی-high-frequency workflows، خالص fan-out، یا synchronous user-facing flows کے لیے استعمال نہ کریں۔

## امتحانی نکات

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں (ڈومین 2، ٹاسک 2.1)*

- **Step Functions use case signals**: "متعدد Lambda functions orchestrate کریں،" "retries اور error handling کے ساتھ workflow،" "ایک خودکار workflow میں انسانی منظوری step،" "ہر workflow step کا audit trail" → Step Functions۔
- **Standard بمقابلہ Express**: long-running، auditable، business-critical workflows کے لیے Standard۔ high-throughput، short-duration event processing کے لیے Express۔
- **SQS بمقابلہ Step Functions**: سادہ task queues (producer/consumer) کے لیے SQS۔ پیچیدہ logic، retries، اور state tracking کے ساتھ multi-step workflows کے لیے Step Functions۔
- **EventBridge signals**: "AWS services سے targets کی طرف events route کریں،" "services کے درمیان event-driven انضمام،" "ایک Lambda function schedule کریں" → EventBridge (سابقہ CloudWatch Events)۔
- **Callback pattern**: Step Functions execution روک سکتا ہے اور ایک بیرونی callback (ایک task token) کا انتظار کر سکتا ہے۔ Worker مکمل ہونے پر واپس call کرتا ہے۔ long-running ECS tasks کے لیے مفید جہاں آپ Lambda کی 15-منٹ کی حد نہیں چاہتے۔
- **براہ راست SDK integrations**: Step Functions AWS services کو براہ راست call کر سکتا ہے (DynamoDB، S3، SQS، وغیرہ) Lambda سے گزرے بغیر۔ سادہ service calls کے لیے cost اور latency کم کرتا ہے۔ مثلاً، ایک order record کو DynamoDB میں لکھنا state machine سے ایک براہ راست SDK call ہو سکتا ہے بغیر ایک Lambda function کے: `"Resource": "arn:aws:states:::dynamodb:putItem"`۔ یہ Lambda cold start، Lambda execution لاگت، اور وہ code ختم کرتا ہے جو بس `dynamodb.put_item(...)` call کرتا اور واپس کرتا ہے۔

## مشقیں

**مشق 1 — یادداشت**

وضاحت کریں کہ Step Functions multi-step workflows کے لیے کیوں مفید ہے۔ یہ کیا فراہم کرتا ہے جو دوسرے Lambda functions کو call کرنے والا ایک سادہ Lambda function نہیں کرتا؟

*(اشارہ: اس کے بارے میں سوچیں کہ ہر طریقے میں 5 میں سے step 3 ناکام ہونے پر کیا ہوتا ہے۔ آپ کیسے جانتے ہیں کہ کیا ہوا؟ آپ صرف step 3 کیسے retry کرتے ہیں؟)*

**مشق 2 — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک financial services کمپنی متعدد steps میں loan applications process کرتی ہے: credit check، income verification، document validation، underwriter review (manual)، اور decision notification۔ ہر step سیکنڈوں (credit check) سے دنوں (underwriter review) تک کہیں بھی لے سکتا ہے۔ کمپنی کو compliance کے لیے ہر step کا مکمل audit trail چاہیے۔ ناکام automated steps کو خودبخود retry کرنا ضروری ہے؛ manual steps کو رک کر ایک انسانی فیصلے کا انتظار کرنا ضروری ہے۔

کون سی service ان ضروریات کو سب سے بہتر طریقے سے پورا کرتی ہے؟

A) ہر step کے درمیان SQS queues کے ساتھ ایک ساتھ زنجیر بند AWS Lambda functions  
B) underwriter review step کے لیے Wait for callback pattern کے ساتھ AWS Step Functions Standard workflows  
C) automated steps کے لیے AWS Step Functions Express workflows اور manual step کے لیے SQS FIFO  
D) ہر step کے لیے Lambda functions کے درمیان route کرنے والے event rules کے ساتھ Amazon EventBridge

**اشارہ 1**: "دنوں تک" مدت — کون سی Step Functions قسم اسے سپورٹ کرتی ہے؟

**اشارہ 2**: "ایک انسانی فیصلے کا انتظار کریں" — کون سا Step Functions pattern اس کے لیے ڈیزائن کیا گیا ہے؟

**اشارہ 3**: "compliance کے لیے مکمل audit trail" — کون سی service فی execution state history فراہم کرتی ہے؟

**جواب**: B

**وضاحت**: Step Functions Standard workflows 1 سال تک چل سکتے ہیں، دنوں طویل underwriter review step کو سپورٹ کرتے ہوئے۔ Wait for callback pattern execution کو underwriter step پر ایک task token کے ساتھ روکتا ہے؛ جب underwriter ایک فیصلہ کرتا ہے، وہ workflow جاری رکھنے کے لیے token کے ساتھ واپس call کرتے ہیں۔ Standard workflows ہر state transition record کرتے ہیں — compliance کے لیے مکمل audit trail۔

**A کیوں نہیں؟** SQS کے ذریعے زنجیر بند Lambda کوئی built-in state tracking یا audit trail فراہم نہیں کرتا۔ ناکام steps کو custom retry logic درکار ہے۔ ایک مخصوص ناکام step سے دوبارہ شروع کرنے کے لیے custom implementation درکار ہے۔

**C کیوں نہیں؟** Express workflows کی 5-منٹ زیادہ سے زیادہ مدت ہے — ایک ایسے step کے ساتھ غیر مطابقت پذیر جو دن لے سکتا ہے۔

**D کیوں نہیں؟** EventBridge services کے درمیان events route کرتا ہے لیکن workflow state برقرار نہیں رکھتا یا built-in retry/audit فراہم نہیں کرتا۔ اسے صرف EventBridge پر بنانے کے لیے custom state management درکار ہے۔

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں — ٹاسک 2.1*

**مشق 3 — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus ایک food quality dispute resolution process بنا رہا ہے۔ جب کوئی customer ایک برے تجربے کی اطلاع دیتا ہے:

1. اطلاع خودبخود validate ہوتی ہے (چیک کرتا ہے کہ آرڈر موجود ہے، آیا یہ کافی حالیہ ہے)
2. ریستوران کو خودبخود notify کیا جاتا ہے
3. ایک Nimbus support agent شکایت کا جائزہ لیتا ہے (manual step — 1-3 business days لے سکتا ہے)
4. agent کے فیصلے کی بنیاد پر: refund جاری کریں (Lambda → payment processor) یا apology coupon بھیجیں (Lambda → coupon service) یا management کو escalate کریں (Step Functions sub-workflow)
5. Customer کو نتیجے کی اطلاع دی جاتی ہے

اسے ایک Step Functions workflow کے طور پر ڈیزائن کریں۔ کون سی state type ہر step کو سنبھالتی ہے؟ آپ 1-3 دن کے انتظار کو کیسے سنبھالیں گے؟ آپ step 4 پر شاخ کو کیسے model کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد Step Functions state design کی مشق کرنا ہے۔)*

**توسیع**: state machine کے مکمل ہونے کے بعد (جو بھی شاخ)، یہ EventBridge کو ایک `OrderDisputeResolved` event publish کرتا ہے۔ کون سے side effects اس event کو سن سکتے ہیں؟ غور کریں: ریستوران کا rating system، customer کے loyalty points (refunds points کم کر سکتے ہیں)، analytics pipeline (dispute rate ایک کلیدی ریستوران quality metric ہے)، اور customer support team کا SLA tracking dashboard۔ یہاں EventBridge استعمال کرنا dispute state machine کو ایک dependency spider بننے سے کیسے روکتا ہے؟

## پوسٹ کریڈٹس منظر

ریستوران onboarding workflow live تھا۔

اگلے مہینے کے دوران، 12 نئے ریستوران partners نے onboard کیا۔ دو میں payment processing step (step 3) کے دوران failures تھیں۔ دونوں صورتوں میں، Step Functions نے عین error capture کیا، execution کی state محفوظ کی، اور Nimbus ٹیم کو ایک alert بھیجا۔

Leo نے root cause fix کیا (payment provider کے لیے ایک misconfigured API key) اور دونوں executions کو step 3 سے retry کیا۔ Executions ہر ایک 23 سیکنڈ میں مکمل ہوئیں، بالکل وہیں سے اٹھاتے ہوئے جہاں وہ ناکام ہوئی تھیں۔

کسی ریستوران کو دوبارہ import کرنے کی ضرورت نہیں پڑی۔ کوئی IAM roles دو بار نہیں بنائے گئے۔ کوئی duplicate welcome emails نہیں بھیجی گئیں۔

"Step Functions سے پہلے،" Leo نے Maya کو بتایا، "اس کے لیے کسی کو دستی طور پر ٹریک کرنا پڑتا کہ ہر ریستوران کے لیے کیا ہوا تھا اور کیا نہیں ہوا تھا، اور غائب steps کو دستی طور پر دوبارہ چلانا پڑتا۔"

"اور اب؟"

"اب میں console میں retry کلک کرتا ہوں۔ نظام جانتا ہے کہ کیا ہو چکا ہے۔"

Maya نے اس پر سوچا۔

"یہ صرف ایک technical بہتری نہیں ہے،" اس نے کہا۔ "یہ ایک ایسے process کے درمیان فرق ہے جو scale کرتا ہے اور ایک جو نہیں کرتا۔"

اگلے باب میں: اس data کا کیا کریں جسے آپ ابھی access نہیں کر رہے، لیکن یقینی طور پر ہمیشہ کے لیے رکھنا چاہتے ہیں۔
