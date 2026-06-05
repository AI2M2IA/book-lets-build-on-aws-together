# باب ۱۹: Ticket مشین

Ticket مشین ایک خاموش انقلاب تھی۔ نمبر لو، بلائے جانے کا انتظار کرو۔ لائن ایک queue بن گئی۔ لوگ بیٹھ سکتے تھے۔ سروس کاؤنٹر اپنی رفتار سے کام کرتا رہا۔ کسی نے کسی کو block نہیں کیا۔

Nimbus کا ایک مسئلہ تھا جو مسئلے کی طرح نہیں لگتا تھا جب تک آرڈرز مشہور نہیں ہوئے۔

ہر بار جب آرڈر دیا جاتا، API server کو:

1. آرڈر database میں محفوظ کرنا
2. ریستوران کے tablet کو notification بھیجنی
3. Customer کو confirmation email بھیجنی
4. ریستوران کے analytics dashboard کو اپڈیٹ کرنا
5. Billing کے لیے event log کرنا

یہ سب customer کو API جواب دینے سے پہلے synchronously ہونا تھا۔ اگر email سروس سست تھی (کبھی کبھی تھی)، customer انتظار کرتا۔ اگر analytics dashboard بند تھا (کبھی کبھی تھا)، آرڈر ناکام ہوتا۔

"ہم tightly coupled ہیں،" Priya نے کہا۔ "اگر کوئی downstream step ناکام ہو، پورا آرڈر ناکام ہوتا ہے۔"

"اگر ہم آرڈر محفوظ کر کے فوری طور پر customer کو confirm کر سکتے،" Leo نے کہا، "اور پھر باقی کو background میں process کرتے؟"

"یہ ایک queue ہے،" Priya نے کہا۔

**Deli Counter Model**

ایک مصروف deli counter میں، register پر شخص cutter کے slice ختم کرنے کا انتظار نہیں کرتا اگلے customer کی طرف جانے سے پہلے۔ وہ آرڈر لیتا ہے، kitchen کو دیتا ہے، اور اگلے شخص کو serve کرنا شروع کرتا ہے۔ Kitchen اپنی رفتار سے آرڈرز کے ذریعے کام کرتی ہے۔

Customer کو تیز service ملتی ہے۔ Kitchen اچانک bursts سے overwhelm نہیں ہوتی۔ اگر kitchen کا کوئی slow moment ہو، آرڈرز queue میں pile ہو جاتے ہیں errors کی بجائے۔

یہ **decoupling** ہے: وہ component جو کام accept کرتا ہے اسے ان components سے الگ کرنا جو اسے process کرتے ہیں۔

Software systems میں، queue اکثر ایک message broker ہوتا ہے — ایک سروس جو producers سے messages accept کرتی ہے اور انہیں consumers کو deliver کرتی ہے۔

**Amazon SQS: Queue**

**Amazon SQS (Simple Queue Service)** AWS کی managed message queue سروس ہے۔ یہ messages durably اسٹور کرتی ہے جب تک consumer انہیں process نہ کرے۔

بنیادی flow:

1. **Producer** (API server) queue میں ایک message رکھتا ہے: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. API فوری طور پر customer کو جواب دیتا ہے: "آرڈر confirmed!"
3. **Consumers** (الگ worker services) queue سے messages پڑھتے اور process کرتے ہیں: ریستوران notification بھیجیں، confirmation email بھیجیں، analytics اپڈیٹ کریں

Customer experience: فوری confirmation۔ Downstream processing: asynchronously، workers کی رفتار پر۔

**SQS Key Concepts**

**Message visibility timeout**: جب ایک consumer SQS سے ایک message پڑھتا ہے، message ایک مدت کے لیے دوسرے consumers کو *invisible* ہو جاتی ہے (default: 30 سیکنڈ)۔ یہ consumer کو اسے process کرنے کا وقت دیتا ہے۔ اگر consumer کامیابی سے ختم کرے، message delete کرتا ہے۔ اگر consumer crash ہو، visibility timeout ختم ہوتی ہے اور message دوسرے consumer کے لیے دوبارہ visible ہو جاتی ہے۔

یہ at-least-once delivery یقینی بناتا ہے: ہر message کم از کم ایک بار process ہوگی، چاہے کوئی consumer mid-processing ناکام ہو۔

**Dead-letter queues (DLQ)**: اگر ایک message بہت بار process کرنے میں ناکام ہو (configurable — مثلاً 5 retries)، SQS اسے dead-letter queue میں move کرتا ہے۔ آپ DLQ inspect کرتے ہیں یہ سمجھنے کے لیے کہ messages کیوں ناکام ہو رہی ہیں، انہیں کھوئے بغیر۔

**Queue اقسام**:

**Standard queues**: Maximum throughput (فی سیکنڈ unlimited messages)۔ Delivery order best-effort (guaranteed نہیں)۔ At-least-once delivery (بہت کم، ایک message دو بار deliver ہو سکتی ہے)۔

**FIFO queues**: سخت first-in، first-out ordering۔ Exactly-once delivery۔ Batching کے ساتھ فی سیکنڈ 3,000 messages تک محدود، بغیر 300۔ استعمال کریں جب order اہمیت رکھتا ہو (financial transactions، sequential state changes)۔

Nimbus کے لیے، زیادہ تر queues standard queues استعمال کرتی تھیں۔ Billing queue FIFO استعمال کرتی تھی تاکہ charges ترتیب میں process ہوں۔

**Amazon SNS: Broadcaster**

**Amazon SNS (Simple Notification Service)** ایک publish/subscribe (pub/sub) message سروس ہے۔ ایک producer، ایک consumer کے بجائے (queue)، SNS ایک message کو بیک وقت *بہت سارے* subscribers کو deliver کرنا سپورٹ کرتا ہے۔

Model:

1. ایک **publisher** ایک SNS **topic** کو ایک message بھیجتا ہے
2. اس topic کے تمام **subscribers** بیک وقت message وصول کرتے ہیں (fan-out)

Subscribers ہو سکتے ہیں:

- SQS queues (async processing کے لیے queue میں message push کریں)
- Lambda functions (function کو براہ راست trigger کریں)
- HTTP/HTTPS endpoints (webhook delivery)
- Email addresses
- SMS (phone numbers)

Nimbus کے لیے، order placed event ایک SNS topic کو publish ہوتا ہے جسے `order-events` کہا جاتا ہے:

- Restaurant notification service subscribe کرتی ہے (اپنی SQS queue پر وصول کرتی ہے)
- Email service subscribe کرتی ہے (اپنی SQS queue پر وصول کرتی ہے)
- Analytics service subscribe کرتی ہے (اپنی SQS queue پر وصول کرتی ہے)
- Billing service subscribe کرتی ہے (اپنی FIFO SQS queue پر وصول کرتی ہے)

ایک order event۔ چار subscribers۔ سب بیک وقت notify ہوئے۔ ہر ایک اپنی رفتار سے process کرتا ہے۔

"تو SNS اعلان ہے،" Maya نے کہا، "اور SQS وہ inbox ہے جہاں ہر ٹیم اعلان کو اپنی رفتار سے process کرتی ہے۔"

"بالکل،" Leo نے کہا۔ "SNS/SQS fan-out standard pattern ہے۔"

**SNS/SQS Fan-Out Pattern**

یہ combination — SNS topic متعدد SQS queues کو feed کرتا ہوا — AWS میں سب سے اہم architectural patterns میں سے ایک ہے:

```
API Server
    |
    | publishes to
    ↓
SNS Topic: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
SQS Queue         SQS Queue         SQS Queue
(notifications)  (email service)   (analytics)
    |                 |                 |
    ↓                 ↓                 ↓
Worker             Worker            Worker
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

ہر queue آزاد ہے۔ Analytics service سست ہو سکتی ہے — اس کی queue بھر جاتی ہے، لیکن notification اور email services متاثر نہیں ہوتیں۔ اگر analytics service بند ہو جائے، اس کی messages queue میں انتظار کرتی ہیں جب تک یہ واپس نہ آئے۔ کچھ نہیں کھوتا۔

یہ اہم خاصیت ہے: **independent failure**۔ ایک consumer میں مسائل دوسروں تک propagate نہیں ہوتے۔

**Message Filtering: ہر Subscriber کے لیے ہر Message نہیں**

جیسے systems بڑھتے ہیں، آپ نہیں چاہتے کہ ہر subscriber ہر message process کرے۔ Analytics service کو failed payment processing کے بارے میں messages نہیں ملنی چاہئیں اگر یہ صرف completed orders کی پرواہ کرتی ہے۔

**SNS message filtering** subscribers کو filter policies specify کرنے دیتا ہے — صرف وہی messages deliver کریں جو مخصوص attributes سے match کریں۔

Restaurant notification service ایک filter کے ساتھ subscribe کرتی ہے: صرف وہ messages جہاں `status = "confirmed"`۔

Error alerting service ایک filter کے ساتھ subscribe کرتی ہے: صرف وہ messages جہاں `status = "failed"`۔

ہر subscriber کو صرف وہی ملتا ہے جس کی اسے ضرورت ہے۔

**SQS بمقابلہ SNS کب استعمال کریں**

**SQS اکیلے**: ایک producer، ایک consumer (یا ایک ہی queue پر متعدد competing consumers)۔ Messages کو ایک بار، ترتیب میں (FIFO) یا نہیں (standard) process ہونے کی ضرورت ہے۔ Worker queue pattern — ایک queue، متعدد workers اس سے consume کر رہے ہیں۔

**SNS اکیلے**: Fire-and-forget notifications۔ Email، SMS، یا HTTP endpoints کو push کریں۔ Message queue کرنے کی ضرورت نہیں — بس notify کریں اور آگے بڑھیں۔

**SNS + SQS (fan-out)**: ایک event، متعدد آزاد consumers۔ ہر consumer کی اپنی queue ہے، آزادانہ process کرتا ہے، اور آزادانہ ناکام ہو سکتا ہے۔

## خوبیاں اور حدود

**SQS اور SNS کیوں طاقتور ہیں**:

- SQS durable، reliable message delivery فراہم کرتا ہے — messages متعدد AZs میں اسٹور ہوتی ہیں
- Decoupling producer اور consumer services کی independent scaling اور deployment کو قابل بناتا ہے
- Dead-letter queues یقینی بناتے ہیں کہ کوئی message ناکامی پر خاموشی سے نہیں کھوتی
- SNS fan-out pattern producer کو تبدیل کیے بغیر نئے consumers شامل کرنے کی اجازت دیتا ہے

**جہاں پیچیدہ ہو جاتا ہے**:

- At-least-once delivery کا مطلب consumers *idempotent* ہونے چاہئیں — ایک ہی message دو بار process کرنا مسائل پیدا نہیں کرنا چاہیے (duplicate orders، duplicate charges)
- FIFO queues زیادہ مہنگی ہیں اور throughput limits ہیں
- متعدد queues اور services میں ناکام messages debug کرنے کے لیے اچھی logging اور observability ضروری ہے
- Ordering guarantees محدود ہیں — اگر متعدد services میں strict ordering اہمیت رکھتی ہو، ڈیزائن پیچیدہ ہو جاتا ہے

## خلاصہ

- **Decoupling** کام produce کرنے والے components کو اسے process کرنے والے components سے الگ کرتا ہے۔
- **SQS** ایک managed queue ہے۔ Producers messages بھیجتے ہیں؛ consumers انہیں asynchronously پڑھتے اور process کرتے ہیں۔
- **SQS Standard**: اعلیٰ throughput، best-effort ordering، at-least-once delivery۔
- **SQS FIFO**: سخت ordering، exactly-once delivery، کم throughput۔
- **SNS** ایک pub/sub سروس ہے۔ ایک message، بیک وقت بہت سارے subscribers۔
- **SNS + SQS fan-out**: ایک event متعدد آزاد processing pipelines trigger کرنے کے لیے standard pattern۔
- **Dead-letter queues**: بہت بار retry کے بعد ناکام messages catch کریں۔
- **Idempotency**: consumers کو duplicate messages محفوظ طریقے سے process کرنے کے لیے ڈیزائن کریں۔

## امتحانی نکات

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں (ڈومین ۲، ٹاسک ۲.۱)*

- **SQS Standard بمقابلہ FIFO**: امتحان ordering اور delivery guarantees کے ذریعے distinguish کرتا ہے۔ "ترتیب میں process ہونا ضروری ہے" → FIFO۔ "Maximum throughput" → Standard۔
- **Visibility timeout**: At-least-once delivery کے لیے اہم تصور۔ اگر consumer ناکام ہو، message timeout کے بعد دوبارہ visible ہو جاتی ہے۔ امتحانی منظر نامہ: "messages دو بار process ہو رہی ہیں" → visibility timeout بہت چھوٹا ہے (consumer process کرنے میں timeout سے زیادہ وقت لیتا ہے)۔
- **Dead-letter queue**: بار بار ناکامی کے بعد وہاں messages move ہوتی ہیں۔ امتحانی منظر نامہ: "یقینی بنائیں کہ بار بار ناکامی کے باوجود کوئی message نہ کھوئے" → DLQ۔
- **SNS fan-out**: بیک وقت متعدد consumers کو ایک event trigger کرنے کے لیے کلاسک امتحانی pattern۔ "Order placed notification کو بیک وقت email، SMS، اور inventory update trigger کرنا ضروری ہے" → متعدد SQS subscriptions کے ساتھ SNS topic۔
- **SQS + Lambda**: Lambda ایک SQS queue کو poll کرنے اور ہر message batch پر trigger کرنے کے لیے ترتیب دی جا سکتی ہے۔ امتحان اسے پیمانے پر event-driven processing کے لیے استعمال کرتا ہے۔
- **SQS long polling**: consumers ہر چند سیکنڈ (short polling، API calls ضائع کرتا ہے) poll کرنے کے بجائے، long polling کسی message کے لیے 20 سیکنڈ تک انتظار کرتا ہے۔ لاگت کم کرتا ہے اور false empty responses کم کرتا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

SNS/SQS fan-out pattern بیان کریں۔ Pattern کیوں HTTP endpoints کے ساتھ services براہ راست SNS topic subscribe کروانے کی بجائے SQS queues استعمال کرتا ہے؟

*(اشارہ: اس کے بارے میں سوچیں کہ اگر SNS publish کرتے وقت HTTP endpoints میں سے ایک بند ہو تو کیا ہوتا ہے۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک e-commerce platform فی گھنٹہ 10,000 آرڈرز process کرتا ہے۔ جب آرڈر دیا جاتا ہے، نظام کو: (1) آرڈر database میں اسٹور کرنا، (2) inventory کم کرنا، (3) confirmation email بھیجنا، اور (4) analytics dashboard اپڈیٹ کرنا ضروری ہے۔ فی الحال، چاروں steps synchronously ہوتے ہیں — اگر analytics service سست ہو، customers انتظار کرتے ہیں۔ ٹیم customer-facing response time بہتر کرنا چاہتی ہے جبکہ کوئی آرڈر نہ کھوئے۔

کون سا architecture اس ضرورت کو بہترین طریقے سے address کرتا ہے؟

A) تمام چار steps کو ترتیب میں process کرنے کے لیے SQS FIFO queues استعمال کریں  
B) API آرڈر محفوظ کرے اور فوری طور پر customer کو confirm کرے؛ ایک SNS topic کو event publish کرے؛ inventory، email، اور analytics services SQS queues کے ذریعے subscribe کریں  
C) ہر step کو بیک وقت، synchronously process کرنے کے لیے parallel EC2 انسٹینسز استعمال کریں  
D) آرڈر processing تیز کرنے کے لیے request validation کے ساتھ API Gateway استعمال کریں

**اشارہ ۱**: Customer confirmation فوری ہونی چاہیے۔ کون سے steps جواب سے پہلے ہونے ضروری ہیں، اور کون سے بعد میں ہو سکتے ہیں؟

**اشارہ ۲**: Analytics service سست ہونا email یا inventory services کو affect نہیں کرنا چاہیے۔

**اشارہ ۳**: SNS fan-out تمام تین downstream services کو event بیک وقت receive کرنے دیتا ہے۔

**جواب**: B

**وضاحت**: API آرڈر database میں محفوظ کرتا ہے (synchronous — confirm کرنے سے پہلے ہونا ضروری) اور فوری طور پر confirmation واپس کرتا ہے۔ یہ پھر ایک SNS topic کو ایک `order-placed` event publish کرتا ہے۔ Inventory، email، اور analytics services ہر ایک آزاد SQS queues کے ذریعے subscribe کرتی ہیں۔ وہ اپنی رفتار سے process کرتی ہیں — اگر analytics سست ہو، اس کی queue بڑھتی ہے لیکن دوسری services متاثر نہیں ہوتیں۔ اگر کوئی service ناکام ہو، اس کی messages SQS queue میں remain کرتی ہیں اور retry ہوتی ہیں۔

**A کیوں نہیں؟** FIFO queues ترتیب میں messages process کرتی ہیں — یہ synchronous slowdown میں مدد نہیں کرتا۔ اس کے علاوہ، sequential processing کا مطلب ہے analytics سست ہونا اب بھی email block کرتا ہے۔

**C کیوں نہیں؟** "Parallel EC2 انسٹینسز synchronously" کا مطلب ہے customer کو جواب دینے سے پہلے تمام steps complete ہونا ضروری ہے۔ انسٹینسز شامل کرنا synchronous coupling حل نہیں کرتا۔

**D کیوں نہیں؟** API Gateway API routing اور validation تیز کرتا ہے، لیکن downstream processing steps کو decouple نہیں کرتا۔

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں — ٹاسک ۲.۱*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus ریستوران partners کے لیے ایک notification نظام بنا رہا ہے۔ جب customer آرڈر دیتا ہے، ریستوران کو notify ہونا ضروری ہے:

- ان کے tablet app پر (push notification)
- ایک kitchen display system پر (ان کے local hardware کو HTTP webhook)
- ایک backup SMS (اگر tablet notification ناکام ہو)

Tablet notification service reliable ہے۔ Kitchen webhook کبھی کبھی بند ہوتا ہے (ریستوران closing time پر اپنا hardware بند کر دیتے ہیں)۔ SMS صرف اس صورت fire ہونی چاہیے جب tablet notification ناکام ہو۔

SNS اور SQS استعمال کرتے ہوئے architecture ڈیزائن کریں۔ آپ "SMS صرف اگر tablet ناکام ہو" کی ضرورت کو کیسے سنبھالیں گے؟ آپ کیسے یقینی بنائیں گے کہ kitchen webhook tablet notification کو block نہ کرے جب یہ offline ہو؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد conditional routing کے ساتھ fan-out ڈیزائن کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

نیا order flow live تھا۔

Customers نے آرڈرز دیے۔ API 95 ملی سیکنڈ میں جواب دیا۔ Confirmation ان کے phones پر فوری ظاہر ہوئی۔

پردے کے پیچھے: چار services asynchronously process کر رہی تھیں۔ Analytics service کا ایک bug تھا جو اسے item name میں بعض special characters والے آرڈرز پر crash کرتا تھا۔ اس کی queue دو گھنٹوں میں 3,200 messages تک back up ہوئی۔

Customers نے کبھی notice نہیں کیا۔

جب Leo نے bug fix کیا اور analytics service restart کی، اس نے 18 منٹ میں backlog process کیا۔ کوئی data نہیں کھویا۔ DLQ خالی تھا۔

"یہی decoupling کا مطلب ہے،" Priya نے کہا۔

Tom SQS pricing page پڑھ رہا تھا۔ "فی ملین requests، 0.40 dollars۔"

"کیا یہ برا ہے؟"

"ہمارے موجودہ volume پر، تقریباً بارہ dollars ماہانہ۔" اس نے اسکرین کو گھورا۔ "مجھے زیادہ کی توقع تھی۔"

اس کے چہرے پر وہ نظر تھی جو کوئی غیر متوقع طور پر سستی چیز دریافت کر رہا ہو جو غیر متوقع طور پر اچھی بھی ہو۔

اگلے باب میں: وہ function جو صرف تب چلتا ہے جب کوئی دستک دے — اور بیکار ہونے پر کچھ نہیں لاگت آتی۔
