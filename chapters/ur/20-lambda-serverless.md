# باب 20: فری لانسر کا نمونہ

یہ ایک پُرسکون بدھ کی دوپہر تھی۔ Priya نے ایک بار اپنے headphones اتارے ہوئے تھے، اور دفتر میں وہ ہلکی سی گونج تھی جس کا مطلب تھا کہ ہر کوئی توجہ مرکوز کر رہا تھا لیکن کوئی گھبرا نہیں رہا تھا۔ Leo کے پاس ایک اسکرین پر ایک cost dashboard کھلا تھا اور دوسری پر EC2 instance کی فہرست۔

ایک فری لانسر کے بارے میں سوچیں جو on-call کام کرتا ہے۔ وہ نو سے پانچ تک ایک desk پر نہیں بیٹھتے۔ وہ انتظار کرتے ہیں۔ فون بجتا ہے، وہ کام کرتے ہیں، وہ ایک invoice بھیجتے ہیں، وہ واپس انتظار میں چلے جاتے ہیں۔ کوئی کام نہیں، کوئی لاگت نہیں۔ requests کا ایک burst، وہ ان سب کو بیک وقت سنبھالتے ہیں۔ آپ صرف ان گھنٹوں کے لیے ادائیگی کرتے ہیں جو دراصل کام کیے گئے — ان گھنٹوں کے لیے نہیں جو انہوں نے دستیاب رہنے میں گزارے۔

یہی وہ نمونہ ہے جس کے بارے میں یہ باب ہے۔

یہاں ایک باریکی ہے جسے پکڑے رکھنا قابل قدر ہے۔ روایتی نمونہ یہ ہے: ایک ملازم رکھیں، 8 گھنٹے کی ادائیگی کریں، متغیر output حاصل کریں۔ فری لانسر کا نمونہ یہ ہے: صرف تب ادائیگی کریں جب فون بجے، بالکل وہی حاصل کریں جس کی درخواست کی گئی۔ ایک قابل پیش گوئی، مستقل طلب والی کمپنی کے لیے، ملازم کا نمونہ زیادہ کارآمد ہے — آپ جانتے ہیں کہ فون مسلسل بجے گا، تو فی گھنٹہ ادائیگی برابر ہے اور engagement اور disengagement کا کوئی overhead نہیں۔ متغیر، تیز، یا کبھی کبھار طلب والی کمپنی کے لیے، فری لانسر کا نمونہ ڈرامائی طور پر سستا ہے۔

AWS compute کے لیے وہ نمونہ پیش کرتا ہے — اور یہ معنی رکھتا ہے یا نہیں اس کا انحصار آپ کے demand pattern پر ہے۔ پہلا سوال کبھی "کیا یہ نمونہ اچھا ہے؟" نہیں ہوتا بلکہ "میرا workload دراصل کیسا نظر آتا ہے؟" ہوتا ہے۔

ایک startup سے بڑے زیادہ تر workloads کے لیے: ایک مرکب۔ کچھ چیزیں مسلسل چلتی ہیں (API server، database)۔ کچھ چیزیں صرف trigger ہونے پر چلتی ہیں (event processing، report generation، image resizing)۔ فری لانسر کا نمونہ دوسری قسم کے لیے ہے — اور Nimbus دریافت کرنے والا تھا کہ اس کے bill کا کتنا حصہ وہاں تعلق رکھتا ہے۔

---

SQS/SNS fan-out نے order flow کو decouple کر دیا تھا، لیکن ان queues سے consume کرنے والے workers اب بھی EC2 instances پر چلتے تھے جو فی گھنٹہ charge کرتے تھے — اس سے قطع نظر کہ انہوں نے دراصل کتنی emails بھیجیں۔ Architecture درست تھا؛ cost model میں اب بھی ایک leak تھا۔

Priya نے اسے سب سے پہلے محسوس کیا تھا۔

"Email service،" اس نے کہا۔ "ہم فی دن کتنی emails بھیجتے ہیں؟"

Leo نے metrics چیک کیے۔ "اوسط 400 فی دن۔ جمعہ کی راتوں کو peak تقریباً 1,200۔"

"اور email service چلانے والی EC2 instance — یہ کتنی دیر چلتی ہے؟"

"ہمیشہ۔ 24/7۔"

"رات 3 بجے بھی جب ہم صفر emails بھیجتے ہیں؟"

خاموشی۔

Leo نے email service EC2 instance کے لیے CloudWatch CPU graph کھولا۔ Graph نے 18 گھنٹے کے مسلسل operation کو دکھایا۔ جمعہ کے peak پر: CPU 38% پر، email burst سنبھالتا ہوا۔ آدھی رات کے بعد: CPU 3% پر گر گیا۔ وہیں رہا جب تک lunch آرڈرز شروع نہ ہوئے۔

مسلسل 18 گھنٹے کے لیے تین فیصد CPU۔ Instance چل رہی تھی۔ یہ bill کر رہی تھی۔ یہ کچھ معنی خیز نہیں کر رہی تھی۔

"ہم ایک کمپیوٹر کو وہاں بیٹھے بیٹھے کچھ نہ کرنے کے پیسے دے رہے ہیں،" Leo نے کہا۔

"فی دن کتنے گھنٹے؟"

مزید خاموشی۔

"تقریباً 18۔"

Tom اب بہت توجہ سے سن رہا تھا۔

"اور یہ صرف email service نہیں،" Priya نے شامل کیا۔ "ریستوران photos کے لیے image resizing service زیادہ تر وقت 1% CPU پر چلتی ہے۔ یہ صرف تب بڑھتی ہے جب کوئی ریستوران ایک نیا menu اپلوڈ کرتا ہے۔ جو کتنی بار ہوتا ہے، فی ریستوران دن میں چند بار؟"

"ہاں،" Leo نے تصدیق کی۔

"وہ رات کا cleanup job جو temp files delete کرتا ہے — وہ رات 2 بجے 4 منٹ چلتا ہے اور پھر 23 گھنٹے اور 56 منٹ کے لیے مکمل طور پر بیکار بیٹھا رہتا ہے۔"

"یہ بھی ہاں۔"

Pattern Nimbus کی تمام چھوٹی services میں ایک جیسا تھا: compute کے لیے دن کے 24 گھنٹے ادائیگی کی جاتی، اس کے ایک حصے کے لیے استعمال کیا جاتا۔

---

**سرور ہمیشہ جواب نہیں ہوتا**

EC2 instances مستقل ہیں۔ آپ ایک شروع کرتے ہیں اور یہ تب تک چلتی ہے جب تک آپ اسے بند نہ کریں — دن کے 24 گھنٹے، ہفتے کے 7 دن، اصل استعمال سے قطع نظر۔ آپ کے web server کے لیے (جو ہر وقت ٹریفک سنبھالتا ہے)، یہ درست ہے۔ email service کے لیے (جو emails کے bursts بھیجتی ہے اور پھر گھنٹوں بیکار رہتی ہے)، یہ ضیاع ہے۔

Auto Scaling Group email service کو off-peak گھنٹوں کے دوران ایک instance تک scale down کر سکتا ہے۔ لیکن ایک instance پھر بھی مسلسل چلتی ہے۔

یہی وہ سوال ہے جس کی طرف Tom bill دیکھتے ہوئے بار بار لوٹتا رہا: 3% CPU کے ان 18 گھنٹوں کے دوران ہر service دراصل کیا کر رہی تھی؟ تکنیکی طور پر کچھ نہیں، نہیں — instance انتظار کر رہی تھی، events چیک کر رہی تھی، اپنی state برقرار رکھ رہی تھی۔ لیکن business نقطہ نظر سے: کچھ نہیں۔ Service قدر فراہم نہیں کر رہی تھی۔ یہ bill کر رہی تھی۔

ان workloads کے لیے جو واقعی زیادہ تر وقت بیکار ہیں، ایک always-on EC2 instance ایک ایسے apartment پر کرایہ ادا کرنا ہے جسے آپ صرف weekends پر دیکھتے ہیں۔ Apartment آپ کا ہے؛ کرایہ نہیں رکتا۔

فری لانسر کا نمونہ اسے مکمل طور پر حل کرتا ہے۔ Code موجود ہے۔ یہ بس چلتا نہیں جب تک اسے چلانے کی کوئی وجہ نہ ہو۔ کوئی idle لاگت نہیں۔ کوئی reserved capacity نہیں۔ کوئی server فون کے پاس انتظار میں نہیں۔

یہی **serverless computing** کا بنیادی تصور ہے۔

**AWS Lambda: سرورز کے بغیر Code**

**AWS Lambda** آپ کو سرورز provision یا manage کیے بغیر events کے جواب میں code چلانے دیتا ہے۔ آپ ایک function اپلوڈ کرتے ہیں، specify کرتے ہیں کہ اسے کیا trigger کرتا ہے، اور Lambda اسے تب چلاتا ہے جب trigger فائر ہو۔

ایک Lambda function:

- کوئی persistent state نہیں رکھتا (ہر invocation آزاد ہے)
- فی invocation 15 منٹ تک چلتا ہے
- 0 سے ہزاروں concurrent invocations تک خودبخود scale ہوتا ہے
- صرف چلنے پر bill ہوتا ہے (فی 1 ms execution، اوپر round کیا گیا، فی GB مختص memory)

جب کوئی trigger نہ ہو، Lambda کی کوئی لاگت نہیں۔ جب triggers فائر ہوں، Lambda چلتا ہے اور charge کرتا ہے۔ جب 10,000 triggers بیک وقت فائر ہوں، Lambda 10,000 concurrent invocations چلاتا ہے۔ Scaling خودکار اور تقریباً فوری ہے۔

**Event Triggers: Lambda کو کیا جگاتا ہے**

Lambda functions خود سے نہیں چلتے — وہ events کا جواب دیتے ہیں۔ عام triggers میں شامل ہیں:

- **SQS queue**: ایک queue سے messages process کریں۔ Lambda queue کو poll کرتا ہے اور function کو messages کے batches کے ساتھ invoke کرتا ہے۔
- **API Gateway**: ایک HTTP request آتی ہے۔ API Gateway Lambda کو trigger کرتا ہے۔ Lambda ایک response تیار کرتا ہے۔
- **S3 event**: ایک file S3 میں اپلوڈ ہوتی ہے۔ Lambda اسے process کرتا ہے (ایک image resize کریں، ایک CSV parse کریں، ایک document validate کریں)۔
- **SNS**: ایک message ایک topic کو publish ہوتا ہے۔ Lambda کو notify کیا جاتا ہے۔
- **DynamoDB Streams**: DynamoDB میں ایک record تبدیل ہوتا ہے۔ Lambda تبدیلی process کرتا ہے۔
- **CloudWatch Events (EventBridge)**: ایک scheduled event (جیسے ایک cron job) ایک متعین وقت پر چلتا ہے۔
- **ALB**: لوڈ بیلنسر پر ایک HTTP request پہنچتی ہے۔ Lambda بعض routes سنبھال سکتا ہے۔

Nimbus کے لیے، email service اپنی SQS queue کے ذریعے trigger ہونے والا ایک Lambda function بن گئی۔ جب queue میں ایک message آتی ہے، Lambda message کے content کے ساتھ invoke ہوتا ہے، SES (Simple Email Service) کے ذریعے email بھیجتا ہے، اور exit ہو جاتا ہے۔

صفر سرورز۔ صفر idle time۔ بیکار ہونے پر صفر لاگت۔

Lambda + SQS کا pattern internalize کرنا قابل قدر ہے: SQS queue، durability، retry logic، اور DLQ سنبھالتا ہے۔ Lambda processing سنبھالتا ہے۔ آپ کو Lambda کی scale-to-zero economics کے ساتھ SQS کے decoupling فوائد ملتے ہیں۔ کوئی بھی service دوسرے کا کام نہیں کرتی۔ وہ صاف طریقے سے compose ہوتی ہیں۔

"queue میں ایک malformed message کے ساتھ کیا ہوتا ہے؟" Priya نے پوچھا۔ "کیا برا input Lambda کو اس طرح crash کر سکتا ہے کہ account میں دوسرے functions متاثر ہوں؟"

Lambda invocations ایک دوسرے سے isolated ہیں۔ ایک crashing function دوسرے functions کو متاثر نہیں کرتا۔ ایک Lambda جو ایک malformed message پر ایک unhandled exception پھینکتا ہے: message واپس queue میں چلی جاتی ہے، configured limit تک retry ہوتی ہے، پھر DLQ میں move ہو جاتی ہے۔ Lambda خود اگلی message کے لیے دستیاب رہتا ہے۔ Lambda handler کے اندر input validation اب بھی اہم ہے — اسے process کرنے کی کوشش کرنے سے پہلے malformed data کو پکڑنے کے لیے — لیکن ایک واحد برا message function کو گرا نہیں سکتا۔

**Cold Start کا مسئلہ**

Lambda functions **execution environments** میں چلتے ہیں — چھوٹے، isolated containers۔ جب ایک function invoke ہوتا ہے:

1. AWS چیک کرتا ہے کہ ایک warm execution environment دستیاب ہے یا نہیں (ایک جس نے حال ہی میں ایک invocation سنبھالا)
2. اگر warm: function فوراً چلتا ہے
3. اگر cold: AWS ایک نیا execution environment initialize کرتا ہے — آپ کا code ڈاؤن لوڈ کرتا ہے، runtime شروع کرتا ہے، آپ کا initialization code چلاتا ہے — پھر function چلاتا ہے

ایک **cold start** runtime کے لحاظ سے 100ms سے کئی سیکنڈ کی latency شامل کرتا ہے (Java اور .NET کے cold starts Python اور Node.js سے طویل ہیں) اور آپ کے code package کے سائز کے لحاظ سے۔

آپ شاید سوچ رہے ہوں: اگر Lambda ہر بار scratch سے شروع ہوتا ہے، تو کیا یہ اسے ایک پہلے سے چل رہے server سے سست نہیں بنا دیتا؟ ہاں — کبھی کبھی۔ یہی cold start کا مسئلہ ہے، اور یہ time-sensitive user-facing APIs کے لیے اہم ہے۔ یہ ان background jobs کے لیے بالکل اہم نہیں جہاں user پہلے ہی اپنا confirmation وصول کر چکا ہو۔ background میں چلنے والی ایک email service پر 200ms کا cold start کسی کو نظر نہیں آتا۔

asynchronous processing (email بھیجنا، image resizing) کے لیے، cold starts users کو نظر نہیں آتے۔

synchronous APIs (HTTP requests جہاں ایک user response کا انتظار کر رہا ہو) کے لیے، cold starts کبھی کبھار سست responses کا سبب بن سکتے ہیں۔

**تخفیفات**:

- **Provisioned concurrency**: execution environments کی ایک specified تعداد pre-warm کریں۔ وہ ہمیشہ تیار ہیں۔ آپ اس کی ادائیگی تب بھی کرتے ہیں جب وہ requests process نہیں کر رہے۔
- **چھوٹے package sizes**: چھوٹا code تیزی سے initialize ہوتا ہے۔
- **Warm-up invocations**: functions کو warm رکھنے کے لیے scheduled pings (ایک عام لیکن غیر شائستہ طریقہ)۔
- **صحیح runtime منتخب کریں**: Python اور Node.js Java سے تیزی سے cold start ہوتے ہیں۔

**ایک حقیقی Cold Start تحقیق**

Lambda migration کے دو ہفتے بعد، Leo کو ایک ریستوران partner سے ایک Slack message ملا: "آرڈر confirmation کبھی کبھی 3 سیکنڈ لیتا ہے۔ عام طور پر یہ تیز ہوتا ہے۔ کیا ہو رہا ہے؟"

Leo نے Lambda function کے لیے CloudWatch metrics کھولے۔ "Duration" graph میں، وہ ایک pattern دیکھ سکتا تھا: 15-20 منٹ سے زیادہ کسی gap کے بعد پہلا invocation 2,800-3,200 ملی سیکنڈ تک بڑھ جاتا۔ بعد کے invocations: 180-220 ملی سیکنڈ۔

کلاسک cold starts۔

اس نے 3 سیکنڈ والے invocations میں سے ایک کے لیے X-Ray trace نکالا۔ Timeline نے اسے واضح طور پر دکھایا:

- Initialization phase: 2,640ms (function code ڈاؤن لوڈ کرنا، Node.js runtime شروع کرنا، module-level initialization code چلانا)
- Handler function execution: 290ms

Initialization phase مسئلہ تھا۔ اس نے initialization code دیکھا۔ Function ایک بڑا SDK import کر رہا تھا، ایک database connection initialize کر رہا تھا، اور AWS Secrets Manager سے configuration load کر رہا تھا — سب startup پر۔

"اس initialization میں سے کچھ کو فی execution environment صرف ایک بار ہونے کی ضرورت ہے،" Leo نے کہا۔ "لیکن یہ ہر cold start پر ہو رہا ہے۔"

اس نے Lambda code کو دوبارہ ترتیب دیا تاکہ database connection کو handler function کے باہر initialize کرے (تاکہ یہ warm invocations میں دوبارہ استعمال ہو) اور استعمال نہ ہونے والے SDK modules ہٹا کر package size کم کیا۔ اس نے پورے AWS SDK کو bundle کرنے سے صرف اپنی مطلوبہ مخصوص services import کرنے کی طرف بھی switch کیا۔

optimization کے بعد:

- Cold start duration: 1,100ms (اب بھی موجود، لیکن کم شدید)
- Warm invocations: 165ms

1.1-سیکنڈ کا cold start اب بھی کبھی کبھار ہوتا تھا۔ email service کے لیے (asynchronous، user-facing delay invisible)، یہ قابل قبول تھا۔ ریستوران notification Lambda کے لیے (customer-facing، ایک tablet سے آرڈر کیا گیا)، Priya نے provisioned concurrency کے لیے زور دیا: دو pre-warmed environments ہمیشہ تیار۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے پوچھا۔

256MB پر دو provisioned concurrency environments: تقریباً $5.40/مہینہ۔ Latency spikes رک گئے۔

**Lambda Pricing: Tom کیوں مسکرایا**

Lambda pricing کے دو اجزاء ہیں:

1. **Request charge**: $0.20 فی ملین invocations
2. **Duration charge**: $0.0000166667 فی GB-second (مختص memory × چلنے کے سیکنڈ)

فی مہینہ پہلی ملین requests مفت ہیں (ہمیشہ، صرف پہلے سال میں نہیں)۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے Leo کے calculator کھولنے سے پہلے پوچھا۔

Tom نے email service کے لیے ریاضی خود کی:

- فرض کریں ہر دن جمعہ ہے — worst case: 1,200 emails فی دن × 30 دن = 36,000 invocations فی مہینہ
- ہر invocation 256MB memory پر ~2 سیکنڈ لیتا ہے
- Duration: 36,000 × 2 × 0.25GB × $0.0000166667 = $0.30/مہینہ
- Requests: 36,000 << 1,000,000 (free tier) = $0.00/مہینہ

"اور وہ 18,000 GB-seconds اس 400,000 GB-seconds کے duration کے اچھی طرح اندر ہیں جو ہمیشہ مفت ہے،" Tom نے شامل کیا۔ "تو اصل charge صفر ہوگا۔ لیکن میں جان بوجھ کر free tier کو نظر انداز کر رہا ہوں — میں حقیقی unit cost جاننا چاہتا ہوں۔"

email service کے لیے EC2 instance: $18/مہینہ۔

"میں نے پہلے ہی اسے deploy کر دیا — اوہ۔" Leo نے خود کو روکا۔ اس نے DLQ configuration ختم کرنے سے پہلے email service Lambda کو production میں push کر دیا تھا۔ "مجھے پانچ منٹ دو۔"

Tom ایک لمحے کے لیے خاموش رہا۔ پھر: "ہمیں ہر چیز کے لیے یہ کرنا چاہیے۔"

**Lambda کس میں اچھا ہے (اور کس میں نہیں)**

"رکو — لیکن پھر ہم ہر چیز کے لیے بس Lambda *کیوں* نہ استعمال کریں؟" Maya نے پوچھا۔ "اگر یہ سستا ہے اور خودبخود scale ہوتا ہے، تو کیا پیچ ہے؟"

"15-منٹ کی حد،" Leo نے کہا۔ "اور کسی بھی user-facing چیز کے لیے cold starts۔ اور statelessness — آپ invocations کے درمیان memory میں کچھ نہیں رکھ سکتے۔"

اگر آپ کا workload تیز، event-driven ہے، اور 15 منٹ سے کم میں مکمل ہوتا ہے، Lambda ایک always-on EC2 instance کے ایک حصے کی لاگت ہوگی — لیکن اگر آپ کا workload ایک long-running data processing job ہے جو 15-منٹ کی حد کے قریب پہنچتا یا اس سے تجاوز کرتا ہے، Lambda غلط tool ہے اور آپ کو ECS، Batch، یا ایک EC2-based طریقہ چاہیے ہوگا۔

Lambda ان کے لیے بہترین ہے:

- **Event-driven processing**: events کا جواب دیں (file uploads، queue messages، scheduled tasks)
- **Short-running tasks**: processing جو 15 منٹ کے اندر اچھی طرح مکمل ہو
- **تیز، غیر متوقع ٹریفک**: Lambda 0 سے ہزاروں تک فوری scale ہوتا ہے — کوئی pre-provisioning نہیں
- **کبھی کبھار operations**: ایک report جو روزانہ رات 2 بجے چلتی ہے۔ ایک cleanup job جو ہفتہ وار چلتا ہے۔
- **Glue code**: چھوٹے functions جو services کے درمیان data منتقل کرتے ہیں

آپ شاید سوچ رہے ہوں: جب 10,000 events کا اچانک burst بیک وقت آئے تو Lambda کی scaling کا کیا ہوتا ہے؟ Lambda کی default concurrency limit فی account 1,000 concurrent executions ہے۔ اگر 10,000 events ایک ساتھ آئیں، 1,000 تک invocations فوراً چلتے ہیں؛ باقی SQS queue میں انتظار کرتے ہیں (اگر SQS کے ذریعے trigger ہوں) اور capacity فارغ ہوتے ہی process ہوتے ہیں۔ یہ عام طور پر queue-based processing کے لیے ٹھیک ہے۔ Latency-sensitive use cases کے لیے، Lambda کی burst limit (وہ ابتدائی شرح جس پر نئے concurrent executions شامل کیے جاتے ہیں) اچانک spikes کے دوران مختصر throttling کا سبب بن سکتی ہے — provisioned concurrency capacity پہلے سے مختص کر کے اس سے بچتا ہے۔

Nimbus کی email service کے لیے ان کے موجودہ scale پر، 1,000 concurrent invocations اس سے کہیں زیادہ تھے جتنے کبھی انہیں ضرورت ہوتی۔ لیکن یہ جاننے کے لیے صحیح رکاوٹ ہے اس سے پہلے کہ آپ اسے ٹکرائیں۔

Lambda ان کے لیے کمزور ہے:

- **Long-running processes**: 15-منٹ کی حد ایک سخت دیوار ہے
- **Stateful applications**: Lambda functions ڈیزائن کے لحاظ سے stateless ہیں — ہر invocation آزاد ہے
- **High-throughput، low-latency APIs**: cold starts latency spikes کا سبب بن سکتے ہیں؛ provisioned concurrency اسے کم کرتا ہے لیکن لاگت شامل کرتا ہے
- **وہ applications جنہیں persistent connections چاہیے**: Lambda آسانی سے ایک long-lived database connection pool برقرار نہیں رکھ سکتا (اگرچہ RDS Proxy جیسے connection pooling tools مدد کرتے ہیں)
- **روایتی web servers**: ممکن، لیکن قدرتی fit نہیں

**15-منٹ کی دیوار: جب Lambda غلط Tool ہو**

Migration کے تین ہفتے بعد، Leo نے ایک اور workload کو Lambda میں منتقل کرنے کی کوشش کی: رات کی analytics report generator۔ یہ database سے order data نکالتی، اسے ریستوران metadata کے ساتھ join کرتی، statistics حساب کرتی، اور ایک PDF تیار کرتی۔

پہلی رات، Lambda invocation ایک timeout error کے ساتھ ناکام ہو گیا۔

"Report generation میں 17 منٹ لگے،" Leo نے اگلی صبح کہا۔

"Lambda کا maximum 15 ہے،" Priya نے کہا۔

"ہاں۔ مجھے اب معلوم ہے۔"

اس نے اوسط processing time (8 منٹ) چیک کی تھی اور فرض کیا تھا کہ Lambda کام کرے گا۔ اس نے tail چیک نہیں کیا تھا — وہ راتیں جب data volume زیادہ تھا اور query زیادہ وقت لیتی تھی۔ ان راتوں میں، 15 منٹ کافی نہیں تھے۔

"تو report بس... تیار نہیں ہوتی؟" Maya نے پوچھا۔

"درست۔ کوئی error notification نہیں۔ کوئی partial report نہیں۔ بس خاموشی۔"

"میں نے پہلے ہی اسے deploy کر دیا — اوہ،" Leo نے کہا۔

یہ ان مخصوص طریقوں میں سے ایک تھا جن میں Lambda بدتمیزی سے ناکام ہوتا ہے: ایک timeout کوئی output پیدا نہیں کرتا، application میں کوئی error message نہیں، بس ایک CloudWatch error log۔ اگر آپ خاص طور پر Lambda timeout errors monitor نہیں کر رہے، تو شاید آپ دنوں تک notice نہ کریں۔

Fix: report generator کو ECS Fargate میں منتقل کریں — سرورز manage کیے بغیر containers؛ اگلا باب — جس کی کوئی time limit نہیں۔ Lambda ان workloads کے لیے غلط tool تھا جو کبھی کبھار بھی 15 منٹ سے تجاوز کر سکتے ہیں۔ سبق "Lambda برا ہے" نہیں تھا۔ سبق یہ تھا "Lambda ان workloads کے لیے صحیح tool ہے جو اس کی رکاوٹوں کے اندر fit ہوتے ہیں — اور جب وہ نہیں ہوتے تو حیران کن failures کا ذریعہ۔"

**RDS Proxy: Lambda کے لیے Connection Pooling**

Lambda کی stateless فطرت ایک مخصوص database مسئلہ پیدا کرتی ہے۔

جب ایک EC2 instance RDS سے connect کرتی ہے، یہ ایک persistent connection pool برقرار رکھتی ہے۔ Application pool سے connections دوبارہ استعمال کرتی ہے۔ RDS، مثلاً، 200 simultaneous connections سنبھال سکتا ہے۔

جب Lambda 500 simultaneous invocations سنبھالتا ہے، ہر invocation اپنا database connection کھولنے کی کوشش کرتا ہے۔ یہ 500 نئے connections ہیں — ایک ایسے database کو overwhelm کرتے ہوئے جو 200 سپورٹ کرتا ہے۔

**Amazon RDS Proxy** Lambda functions اور RDS کے درمیان بیٹھتا ہے، ایک persistent connection pool برقرار رکھتا ہے اور Lambda کے short-lived connections کو اس کے ذریعے multiplex کرتا ہے۔

بجائے: Lambda invocation → نیا RDS connection (500 concurrent invocations میں سے ہر ایک کے لیے)

RDS Proxy کے ساتھ: Lambda invocation → RDS Proxy → 20 persistent RDS connections کا pool

"Proxy کو RDS credentials چاہیے،" Priya نے کہا۔ "وہ کہاں رہتے ہیں؟ کیا یہ انہیں اسٹور کرتا ہے؟"

RDS Proxy credentials کو Secrets Manager میں اسٹور کرتا ہے اور انہیں خودبخود rotate کرتا ہے۔ Lambda function کا IAM role اسے proxy تک رسائی دیتا ہے (IAM authentication استعمال کرتے ہوئے)، براہ راست RDS credentials تک نہیں۔ Credentials کبھی Lambda code کے سامنے نہیں آتے۔

"تو Lambda function IAM کے ذریعے authenticate کرتا ہے،" Leo نے تصدیق کی، "اور proxy اصل database credentials سنبھالتا ہے۔"

Nimbus کے order processing Lambda کے لیے (وہ جو آرڈر validation کے لیے RDS کو query کرتا ہے)، RDS Proxy نے peak جمعہ کی ٹریفک کے دوران connection pool exhaustion کو ختم کر دیا۔

**Lambda Layers: مشترکہ Dependencies**

email service Lambda، notification Lambda، اور report Lambda سب نے ایک ہی internal library code شیئر کیا: currency formatting، inputs sanitize کرنے، standard format میں logging کرنے کے لیے utility functions۔

Lambda Layers کے بغیر، اس مشترکہ code کو ہر function کے deployment package میں bundle کرنا پڑتا تھا۔ تین functions، اسی 2MB library کی تین copies۔ جب library update ہوتی، تینوں functions کو نئے deployments کی ضرورت ہوتی۔

**Lambda Layers** علیحدہ packages ہیں جنہیں Lambda functions runtime پر reference کر سکتے ہیں۔ مشترکہ library کو ایک layer میں نکالا گیا۔ تینوں functions نے layer کو reference کیا۔ مشترکہ library میں updates کا مطلب layer version اپڈیٹ کرنا تھا — تینوں functions کو دوبارہ deploy کرنا نہیں۔

اضافی فائدہ: چھوٹے انفرادی function packages کا مطلب تیز cold starts۔

"ایک چیز جو layers تبدیل نہیں کرتے: execution role،" Priya نے کہا۔ "اگر ایک Lambda کے پاس بہت زیادہ وسیع permissions ہوں، تو ایک compromised function account میں ہر چیز تک رسائی حاصل کر سکتا ہے۔"

"EC2 roles جیسا ہی اصول،" Leo نے کہا۔ "Least privilege۔ ہر Lambda کو صرف وہی permissions ملتی ہیں جن کی اسے دراصل ضرورت ہے۔"

"تو Lambda EC2 کا متبادل نہیں ہے،" Maya نے کہا۔ "یہ مختلف jobs کے لیے ایک مختلف tool ہے۔"

"Nimbus web API EC2 یا ECS پر رہتی ہے،" Leo نے تصدیق کی۔ "email service، image resizer، رات کی report generator، log cleaner — وہ Lambda میں جاتے ہیں۔"

**Serverless فلسفہ**

Lambda ایک وسیع تر تصور کا حصہ ہے: **serverless** — applications بنانا جہاں آپ کوئی سرورز manage نہیں کرتے، صرف code۔

ایک مکمل serverless Nimbus stack ایسا نظر آ سکتا ہے:

- API Gateway + Lambda (ایک web server والی EC2 کے بجائے)
- DynamoDB (RDS کے بجائے — بھی serverless، کوئی server management نہیں)
- S3 (static assets — فطری طور پر serverless)
- SNS + SQS (messaging — serverless)
- Lambda (تمام background processing)

کشش: آپ code لکھتے ہیں؛ AWS باقی سب کچھ manage کرتا ہے۔ کوئی patching نہیں، کوئی scaling configuration نہیں، کوئی capacity planning نہیں۔

## Amazon API Gateway

Lambda trigger فہرست نے API Gateway کا مختصر ذکر کیا: ایک HTTP request آتی ہے، API Gateway Lambda کو trigger کرتا ہے۔ یہ درست ہے، لیکن یہ کم آنکتا ہے کہ API Gateway دراصل کیا ہے۔

"رکو — لیکن ہم API Gateway کو Lambda کے سامنے *کیوں* رکھیں؟" Maya نے پوچھا۔ "کیا Lambda براہ راست HTTP requests وصول نہیں کر سکتا؟"

Lambda ایک function URL کے ذریعے HTTP requests وصول کر سکتا ہے — ایک سادہ، براہ راست HTTPS endpoint۔ لیکن یہ routing، authorization، throttling، caching، یا request transformation نہیں سنبھالتا۔ ایک production API کے لیے، وہ خدشات موجود ہیں اس سے قطع نظر کہ آپ کا backend Lambda ہے یا EC2۔

**Amazon API Gateway** کسی بھی پیمانے پر APIs بنانے، deploy کرنے، اور manage کرنے کے لیے ایک fully managed service ہے۔ یہ traffic management، authorization، throttling، caching، اور monitoring سنبھالتا ہے تاکہ آپ کے Lambda function (یا EC2، یا کسی بھی HTTP backend) کو خود انہیں implement نہ کرنا پڑے۔

**تین API اقسام:**

**REST API** سب سے زیادہ feature-rich option ہے۔ یہ request اور response transformation، response caching، API keys سے جڑے usage plans، اور تمام authorization اقسام سپورٹ کرتا ہے۔ زیادہ تر SAA-C03 امتحانی سوالات جو API Gateway کا ذکر کرتے ہیں REST API میں شامل ہوتے ہیں۔

**HTTP API** آسان اور سستا ہے — REST API سے تقریباً 70% کم لاگت۔ یہ Lambda backends اور HTTP proxies کے لیے ڈیزائن کیا گیا ہے۔ یہ OIDC اور OAuth 2.0 authorization سپورٹ کرتا ہے لیکن request transformation یا caching نہیں۔ اگر آپ کو REST API کی advanced features نہیں چاہئیں، HTTP API صحیح انتخاب ہے۔

**WebSocket API** persistent دو طرفہ connections manage کرتا ہے۔ API Gateway connection lifecycle سنبھالتا ہے اور message content کی بنیاد پر messages کو Lambda کی طرف route کرتا ہے۔ Lambda function کو socket state manage کرنے کی ضرورت نہیں — API Gateway یہ کرتا ہے۔

**Authorization options** (وہ جو امتحان test کرتا ہے):

**Cognito User Pool authorizer** ایک Cognito User Pool سے ایک JWT validate کرتا ہے۔ کوئی Lambda درکار نہیں۔ API Gateway خود token چیک کرتا ہے۔ اگر یہ valid ہے، request گزر جاتی ہے۔

**Lambda authorizer** ایک token validate کرنے کے لیے آپ کا اپنا Lambda function چلاتا ہے — ایک custom JWT، ایک تیسرے فریق کے identity provider سے ایک OAuth token، ایک proprietary format میں ایک API key۔ Lambda ایک IAM policy واپس کرتا ہے۔ اگر policy action کی اجازت دیتی ہے، request آگے بڑھتی ہے۔

**API key** ایک سادہ key ہے جو ایک request header میں pass کی جاتی ہے۔ API keys client کے ذریعے rate limiting کے لیے ہیں، authentication کے لیے نہیں۔ انہیں ایک security mechanism کے طور پر استعمال نہ کریں — وہ secrets نہیں ہیں، وہ identifiers ہیں۔

**Throttling اور usage plans:**

Default کے طور پر، API Gateway account level پر فی سیکنڈ 10,000 requests کی اجازت دیتا ہے (ایک soft limit)، 5,000 کے burst کے ساتھ۔ اس سے تجاوز کریں اور clients کو ایک `429 Too Many Requests` ملتا ہے — آپ کا backend اسے کبھی محسوس بھی نہیں کرتا۔ جب آپ کو per-client limits چاہئیں، آپ ایک usage plan بناتے ہیں: اسے ایک API key سے منسلک کریں، ایک request rate اور روزانہ یا ماہانہ quota سیٹ کریں۔ ایک client کے bursts دوسرے client کی allocation استعمال نہیں کرتے۔

دو نمبر رکھنے کے قابل ہیں: زیادہ سے زیادہ payload **10 MB** ہے، اور default integration timeout **29 سیکنڈ** ہے — اگر آپ کا backend زیادہ وقت لیتا ہے، gateway ہار مان جاتا ہے۔ (2024 سے، وہ timeout Regional اور private REST APIs کے لیے ایک quota increase کے ذریعے 29 سیکنڈ سے زیادہ بڑھایا جا سکتا ہے — لیکن 29-سیکنڈ default اب بھی وہی ہے جس کی امتحان توقع کرتا ہے۔) API Gateway request/response APIs کے لیے ہے، long-running jobs کے لیے نہیں؛ ان کے لیے، کام SQS یا Step Functions کو سونپ دیں اور فوراً جواب دیں۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے پوچھا۔

REST API کے لیے: $3.50 فی ملین API calls، علاوہ $0.09 فی GB data transfer۔ small-to-medium ٹریفک کے لیے، یہ بنیادی طور پر مفت ہے۔ high-volume APIs کے لیے، HTTP API کا کم price point معنی خیز ہو جاتا ہے۔

Leo نے اس Lambda trigger فہرست کی طرف اشارہ کیا جو اس نے پہلے لکھی تھی۔ "تو API Gateway صرف Lambda کو trigger کرنے کا ایک طریقہ نہیں۔ یہ وہ چیز ہے جو Lambda کو ایک حقیقی API کی طرح محسوس کراتی ہے۔"

"Lambda function business logic سنبھالتا ہے،" Priya نے کہا۔ "API Gateway اس کے سامنے ہر چیز سنبھالتا ہے — routing، auth، throttling، monitoring۔ ہر ایک ایک کام کرتا ہے۔"

"اور اگر کوئی API Gateway کو bypass کرتے ہوئے براہ راست Lambda کو call کرنے کی کوشش کرے؟"

"Lambda execution policy صرف API Gateway سے invocations کی اجازت دیتی ہے،" Priya نے کہا۔ "Lambda پر resource-based policy باقی سب کچھ deny کرتی ہے۔"

حقیقت: serverless کی اپنی operational پیچیدگی ہے — distributed Lambda functions debug کرنا، cold starts manage کرنا، concurrency limits سمجھنا۔ یہ آسان نہیں، بس مختلف ہے۔

"رکو — لیکن serverless 'آسان نہیں' *کیوں* ہے؟" Maya نے پوچھا۔ "پوری pitch یہ ہے کہ یہ operational بوجھ ہٹاتا ہے۔"

"یہ کچھ operational بوجھ ہٹاتا ہے،" Leo نے کہا۔ "Infrastructure provisioning، patching، scaling configuration — وہ چلے جاتے ہیں۔ جو باقی رہتا ہے وہ مختلف ہے: cold start management، ان functions میں distributed tracing جن میں آپ SSH نہیں کر سکتے، concurrency limits، function versions اور aliases manage کرنا، یہ سمجھنا کہ Layer updates کیسے propagate ہوتے ہیں، 15-منٹ timeouts کو احسن طریقے سے نبھانا۔"

"تو بوجھ منتقل ہوتا ہے،" Priya نے کہا۔ "Infrastructure operations سے function operations کی طرف۔"

"ہاں۔ بہت سے workloads کے لیے — خاص طور پر event-driven، چھوٹے، تیز والے — یہ ایک بہتر سودا ہے۔ ایک long-running application server کے لیے جس کے ساتھ engineers کو تعامل اور debug کرنے کی ضرورت ہوتی ہے، EC2 یا containers اکثر صحیح انتخاب رہتے ہیں۔"

آپ شاید سوچ رہے ہوں: کیا serverless مستقبل ہے، اور کیا ہر چیز کو بالآخر Lambda میں منتقل ہو جانا چاہیے؟ ایماندارانہ جواب یہ ہے کہ اس کا انحصار workload پر ہے۔ Serverless نے event-driven processing پر غلبہ پایا ہے۔ اس نے HTTP APIs میں نمایاں پیش رفت کی ہے (API Gateway + Lambda کے ذریعے)۔ اس نے always-on application servers، long-running batch processing، یا stateful services کی جگہ نہیں لی ہے — اور شاید نہ لے، کیونکہ ان use cases کو Lambda کے نمونے سے فائدہ نہیں ہوتا۔ صحیح tool کا سوال کبھی نہیں جاتا؛ یہ بس وقت کے ساتھ مختلف options پر لاگو ہوتا ہے۔

## خوبیاں اور حدود

**Lambda کیوں طاقتور ہے**:

- حقیقی pay-per-use — بیکار ہونے پر صفر لاگت
- configuration کے بغیر خودکار scaling
- patch یا maintain کرنے کے لیے کوئی سرورز نہیں
- فراخدلانہ free tier (فی مہینہ 1 ملین requests، ہمیشہ کے لیے مفت)
- باقی AWS کے ساتھ تنگ انضمام
- RDS Proxy اور Lambda Layers دو سب سے عام Lambda pain points (connection pooling اور code sharing) کو architectural تبدیلیوں کی ضرورت کے بغیر address کرتے ہیں

**جہاں یہ پیچیدہ ہو جاتا ہے**:

- Cold starts حقیقی ہیں اور latency-sensitive workloads کے لیے احتیاط سے نمٹنے کی ضرورت ہے
- 15-منٹ execution limit long-running tasks کو خارج کرتی ہے
- Debugging مشکل ہے — SSH کرنے کے لیے کوئی persistent server نہیں
- Stateless ڈیزائن کے لیے تمام state کو externalize کرنا ضروری ہے (database، cache، S3)
- Concurrency limits (default فی account 1,000 concurrent invocations) پیمانے پر throttle کر سکتی ہیں
- VPC-connected Lambda functions میں اضافی latency اور cold start مسائل ہیں

**SSH کے بغیر Lambda کی Monitoring**

پہلی بار جب کسی Lambda function میں کچھ ٹوٹا، Leo کی جبلت تھی کہ SSH کرے اور process دیکھے۔ SSH کرنے کے لیے کوئی process نہیں ہے۔ Lambda کے execution environments عارضی اور ناقابل رسائی ہیں۔

Lambda کو debug کرنے کے لیے ایک مختلف toolkit سیکھنے کی ضرورت ہے:

**CloudWatch Logs**: ہر Lambda invocation اپنا stdout/stderr ایک CloudWatch Log Group کو لکھتا ہے۔ Structured logging (JSON format) انہیں filterable بناتی ہے۔ سب سے مفید fields: function name، invocation ID، duration، error type، اور آپ کا custom correlation ID۔

**CloudWatch Metrics**: Lambda خودبخود Invocations، Duration، Errors، Throttles، اور ConcurrentExecutions metrics publish کرتا ہے۔ Errors اور Throttles پر alarms سیٹ کرنا کسی بھی Lambda deployment کا پہلا دن ہونا چاہیے۔

**AWS X-Ray**: Lambda کے لیے distributed tracing۔ ایک چھوٹا overhead شامل کرتا ہے (فی invocation 2-5ms) لیکن آپ کو ایک flame graph دیتا ہے کہ function کے اندر وقت کہاں خرچ ہوتا ہے۔ Cold start analysis کے لیے ضروری — X-Ray initialization phase کو handler phase سے الگ دکھاتا ہے۔

**Lambda Insights**: Lambda کے لیے بہتر monitoring، CloudWatch Lambda Insights کے ذریعے دستیاب۔ standard metrics میں memory usage، CPU time، اور init duration شامل کرتا ہے۔ تھوڑا اضافی خرچ کرتا ہے لیکن production functions کے لیے قابل قدر ہے۔

"اور اگر کوئی execution environment کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "Lambda functions isolated containers میں چلتے ہیں، لیکن اگر کسی dependency میں کوئی vulnerability ہو، تو کیا ایک attacker ہمارے Lambda کے اندر code execution حاصل کر سکتا ہے؟"

تخفیفات: dependencies کو کم سے کم اور up-to-date رکھیں (cold start analysis پہلے ہی Leo کو package sizes کم کرنے کی طرف دھکیل چکی تھی)، مشترکہ libraries کو version کرنے کے لیے Lambda Layers استعمال کریں، اور Lambda execution role کو کم سے کم مطلوبہ permissions دیں۔ اگر function صرف ایک مخصوص S3 bucket کو لکھ سکتا ہے اور ایک مخصوص DynamoDB table کو query کر سکتا ہے، تو ایک compromised function کا blast radius بالکل اسی تک محدود ہے۔

"Lambda execution roles کے لیے least privilege اختیاری نہیں ہے،" Priya نے کہا۔ "یہی وہ ہے جو نقصان کو محدود کرتا ہے جب کچھ غلط ہو جاتا ہے۔"

وہ صحیح تھی۔ اور زیادہ تر security مشوروں کی طرح، یہ صرف اچھی engineering بھی تھی۔

## خلاصہ

باب 19 کا SQS/SNS architecture کام accept کرنے اور اسے process کرنے کے خدشات کو الگ کرتا ہے۔ Lambda اسے آگے لے جاتا ہے: یہ کام process کرنے اور اسے کرنے کی capacity کی ادائیگی کرنے کے خدشات کو الگ کرتا ہے۔

- **AWS Lambda** سرورز manage کیے بغیر events کے جواب میں code چلاتا ہے۔
- **Pay per use**: فی invocation اور فی 1 ms execution (اوپر round کیا گیا) bill ہوتا ہے۔ بیکار ہونے پر صفر لاگت۔
- 0 سے ہزاروں concurrent invocations تک خودبخود scale ہوتا ہے۔
- **Cold starts**: initialization latency جب کوئی warm execution environment موجود نہ ہو۔ provisioned concurrency یا lightweight runtimes سے کم ہوتی ہے۔
- **Lambda Layers**: مشترکہ code packages جنہیں متعدد functions reference کر سکتے ہیں، duplication اور package size کم کرتے ہوئے۔
- **RDS Proxy**: Lambda اور RDS کے درمیان ایک persistent database connection pool برقرار رکھ کر Lambda کے connection exhaustion مسئلے کو حل کرتا ہے۔
- **Monitoring**: CloudWatch Logs، Metrics، X-Ray tracing، اور Lambda Insights استعمال کریں — SSH کرنے کے لیے کوئی server نہیں۔
- ان کے لیے بہترین: event-driven، short-running، تیز، یا کبھی کبھار workloads۔
- ان کے لیے مثالی نہیں: long-running tasks (15-منٹ سخت حد)، stateful applications، provisioned concurrency کے بغیر high-throughput low-latency APIs۔
- **Serverless** ایک design فلسفہ ہے — آپ code manage کرتے ہیں، infrastructure نہیں۔ Operational پیچیدگی منتقل ہوتی ہے، غائب نہیں ہوتی۔

## امتحانی نکات

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں (ڈومین 2، ٹاسک 2.1)*

- **Lambda + S3**: کلاسک pattern — S3 میں اپلوڈ کی گئی file processing کے لیے Lambda کو trigger کرتی ہے (thumbnail generation، virus scanning، data transformation)۔ کوئی server درکار نہیں۔
- **Lambda + SQS**: Lambda SQS کو poll کرتا ہے اور batches process کرتا ہے۔ SQS retry/DLQ mechanism فراہم کرتا ہے۔ Lambda processing فراہم کرتا ہے۔
- **Lambda + API Gateway**: Serverless HTTP API۔ API Gateway routing، auth، throttling سنبھالتا ہے۔ Lambda business logic سنبھالتا ہے۔
- **API Gateway اقسام:** REST API = مکمل features، request transformation، caching، usage plans۔ HTTP API = آسان، سستا، صرف OIDC/OAuth۔ WebSocket API = persistent دو طرفہ connections۔ **Authorization:** Cognito authorizer = Cognito JWT کو natively validate کریں۔ Lambda authorizer = custom token validation logic۔ API key = فی client rate limiting (authentication نہیں)۔ امتحانی trigger: "serverless REST API" → API Gateway + Lambda۔
- **Cold start signals**: "پہلی request پر latency spikes،" "غیر مستقل response times" → cold start۔ حل: provisioned concurrency (پیسہ خرچ کرتا ہے)، چھوٹا package، ہلکا runtime۔
- **Execution limits**: 15-منٹ max۔ 10GB max memory۔ default کے طور پر 512MB /tmp ephemeral storage (10GB تک configurable)۔ یہ limits امتحانی scenarios میں ظاہر ہوتی ہیں۔
- **Lambda timeout errors خاموش ہیں**: اگر ایک Lambda function timeout ہو، یہ ایک CloudWatch error پیدا کرتا ہے لیکن کوئی application-level error response نہیں۔ CloudWatch Lambda Timeout errors واضح طور پر monitor کریں۔ اسی طرح Leo کی 17-منٹ report generator اپنی پہلی رات بغیر کسی application-level alarm کے ناکام ہوئی۔
- **VPC Lambda cold starts**: ایک VPC کے اندر Lambda functions میں اضافی cold start latency ہے (ENI provisioning)۔ AWS نے Hyperplane ENIs کے ساتھ اسے نمایاں طور پر بہتر کیا، لیکن VPC Lambda cold starts اب بھی non-VPC سے سست ہیں۔ ان Lambda functions کے لیے VPC سے گریز کریں جنہیں VPC resources کی ضرورت نہیں (یعنی RDS، ElastiCache، یا دیگر VPC-only resources سے connect نہیں ہو رہے)۔
- **Lambda concurrency**: Default فی account 1,000 concurrent executions (بڑھایا جا سکتا ہے)۔ **Reserved concurrency**: ضمانت دیں کہ ایک function کو executions کی ایک مخصوص تعداد ملے؛ دوسرے functions کو انہیں استعمال کرنے سے روکتا ہے۔ **Provisioned concurrency**: execution environments کی ایک تعداد pre-warm کریں۔
- **Event source mapping**: وہ Lambda feature جو SQS/DynamoDB Streams/Kinesis کو Lambda سے جوڑتا ہے۔ Lambda source کو poll کرتا ہے اور records کو batch کرتا ہے۔
- **Account limits ٹکرانا**: "application throttle ہو رہی ہے / scale ہوتے ہوئے LimitExceeded" → **Service Quotas** میں limit چیک کریں اور وہاں ایک increase کی درخواست کریں (بہت سے quotas، جیسے Lambda concurrency، adjustable ہیں؛ کچھ سخت limits ہیں)۔
- **RDS Proxy**: امتحانی signal: "Lambda functions بہت زیادہ database connections پیدا کر رہے ہیں،" "Lambda کے ساتھ connection pool exhaustion۔" → RDS Proxy persistent connections برقرار رکھتا ہے اور Lambda کے short-lived connections کو multiplex کرتا ہے۔
- **Lambda Layers**: امتحانی signal: "متعدد Lambda functions میں code شیئر کریں،" "deployment package size کم کریں" → Lambda Layers۔
- **Lambda + X-Ray**: Lambda کے لیے distributed tracing۔ امتحانی منظر نامہ: "متعدد Lambda functions اور services میں requests trace کریں" → Lambda پر X-Ray tracing فعال کریں۔
- **Lambda Destinations:** asynchronous Lambda invocations کے لیے، آپ success اور failure دونوں نتائج کے لیے ایک Destination ترتیب دے سکتے ہیں۔ کامیاب نتائج SQS، SNS، EventBridge، یا کسی دوسرے Lambda function کو بھیجیں۔ Failures کو alerting کے لیے SQS یا SNS کو بھیجیں۔ یہ async invocations کے لیے DLQs کا ترجیحی متبادل ہے کیونکہ یہ success اور failure دونوں کو capture کرتا ہے، صرف failure نہیں۔ امتحانی signal: "کامیاب Lambda نتائج کو کسی دوسری service کو route کریں" یا "async Lambda سے success اور failure دونوں نتائج capture کریں" → Lambda Destinations۔ "async invocation کے لیے صرف ناکام messages capture کریں" → DLQ اب بھی valid ہے لیکن Destinations زیادہ مکمل حل ہے۔

## مشقیں

**مشق 1 — یادداشت**

Cold start کے مسئلے کی وضاحت کریں۔ کس قسم کی application میں cold starts سب سے زیادہ مسئلہ خیز ہوں گے؟ کس قسم میں وہ قابل قبول ہوں گے؟

*(اشارہ: ایک real-time API (user response کا انتظار کر رہا ہے) کا موازنہ ایک asynchronous background job (user پہلے ہی اپنا confirmation حاصل کر چکا ہے اور دوسری چیزیں کر رہا ہے) سے کریں۔)*

**مشق 2 — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی اپنے suppliers سے ایک S3 bucket کے ذریعے product images وصول کرتی ہے۔ ہر image کو چار standard dimensions (thumbnail، small، medium، large) میں resize کرنے اور S3 میں واپس اسٹور کرنے کی ضرورت ہے۔ Volume غیر متوقع ہے — کچھ دن 10 images، کچھ دن 100,000۔ Processing فی image 10 منٹ کے اندر مکمل ہونی چاہیے۔ لاگت کم سے کم کی جانی چاہیے۔

کون سا architecture ان ضروریات کو سب سے بہتر طریقے سے پورا کرتا ہے؟

A) long polling کے ساتھ S3 bucket monitor کرنے والی ایک Auto Scaling Group میں EC2 instances  
B) ایک مخصوص EC2 instance جس میں ایک cron job ہو جو ہر منٹ نئی images کے لیے S3 چیک کرے  
C) ایک SQS queue کے ذریعے trigger ہونے والی ECS Fargate tasks، queue کو publish کرنے والے S3 events کے ساتھ  
D) ایک S3 event notification جو ایک Lambda function کو trigger کرتی ہے جو images resize کرتا ہے اور نتائج S3 میں اسٹور کرتا ہے

**اشارہ 1**: غیر متوقع volume scaling-to-zero کو ترجیح دیتا ہے۔ کون سا option یہ کرتا ہے؟

**اشارہ 2**: فی image 10 منٹ Lambda کی 15-منٹ کی حد کے اندر ہے۔ چیک کریں کہ image resizing کا کام Lambda کی رکاوٹوں میں fit ہوتا ہے یا نہیں۔

**اشارہ 3**: 24/7 چلنے والی ایک مخصوص EC2 instance مہنگی ہے اور scale نہیں ہوتی۔

**جواب**: D

**وضاحت**: S3 event notifications Lambda کو trigger کرتی ہیں جب ایک image اپلوڈ ہوتی ہے۔ Lambda image کو چار dimensions میں resize کرتا ہے اور نتائج S3 میں اسٹور کرتا ہے۔ Lambda 0 سے ہزاروں concurrent invocations تک خودبخود scale ہوتا ہے، pre-provisioning کے بغیر غیر متوقع volume سنبھالتا ہے۔ جب کوئی image process نہ ہو رہی ہو تو صفر لاگت۔

**A کیوں نہیں؟** ایک ASG میں EC2 صفر تک scale نہیں ہوتی — کم از کم ایک instance ہمیشہ چلتی ہے۔ Long polling S3 ایک native S3 event mechanism نہیں ہے۔ تیز workloads کے لیے Lambda سے زیادہ لاگت۔

**B کیوں نہیں؟** ایک مخصوص EC2 instance ناکامی کا واحد نقطہ ہے، scale نہیں ہوتی، 24/7 چلتی ہے، اور ایک cron-based طریقے میں 60-سیکنڈ تک detection lag ہے۔

**C کیوں نہیں؟** ECS Fargate کام کرتا ہے، لیکن یہ زیادہ پیچیدہ ہے (container management، ECR، task definitions کی ضرورت ہے) اور Fargate task startup دسیوں سیکنڈ سے منٹ لیتا ہے — ایک Lambda cold start سے کہیں سست — جو اسے تیز، event-driven کام کے لیے ایک خراب fit بناتا ہے۔ اس use case کے لیے Lambda آسان ہے۔

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں — ٹاسک 2.1*

**مشق 3 — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus پچھلے دن کے آرڈر volume کے لحاظ سے سرفہرست 10 ریستورانوں کے ساتھ رات 5 بجے ایک روزانہ report تیار کرنا چاہتا ہے۔ Report DynamoDB data سے تیار ہوتی ہے، ایک PDF کے طور پر formatted ہوتی ہے، S3 میں اسٹور ہوتی ہے، اور تمام ریستوران partners کو email کی جاتی ہے۔

اس کے لیے مکمل Lambda-based pipeline ڈیزائن کریں۔ Lambda کو کیا trigger کرتا ہے؟ کیا ہوتا ہے اگر PDF generation میں 12 منٹ لگیں؟ کیا ہو اگر 5,000 ریستوران partners ہوں اور ان سب کو email کرنے میں وقت لگے؟ کیا آپ ایک Lambda استعمال کریں گے یا متعدد؟

یہ بھی غور کریں: کیا ہو اگر Lambda 14 منٹ کے بعد timeout ہو جائے، 5,000 میں سے 4,500 ریستوران emails process کرنے کے بعد؟ جب Lambda retry ہو تو آپ duplicate emails بھیجنے سے کیسے بچیں گے؟ اس Lambda کو کون سی IAM permissions چاہئیں، اور کم سے کم ضروری set کیا ہے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد Lambda کو دیگر services کے ساتھ compose کرنے کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے مہینے کے آخر میں bill کا جائزہ لیا۔

Email service: EC2 bill سے چلی گئی تھی۔
Image resizing job: چلی گئی۔
رات کا cleanup task: چلا گیا۔
روزانہ analytics report: چلی گئی۔ (Report generator کو 17-منٹ timeout incident کے بعد ECS Fargate میں منتقل کر دیا گیا تھا، لیکن Lambda compute لاگت صفر تھی کیونکہ اب اسے مختلف طریقے سے orchestrate کیا جا رہا تھا۔)

مہینے کے لیے کل Lambda charges: $5.47۔

"پانچ ڈالر،" Tom نے کہا۔

"اور سینتالیس سینٹ،" Leo نے مددگار انداز میں شامل کیا۔

Tom نے پچھلے مہینے کے bill کو دیکھا، جب وہ تمام services EC2 instances پر تھیں۔

"ہم ان ہی workloads کے لیے $187 ادا کر رہے تھے۔"

"Lambda idle time کے لیے charge نہیں کرتا،" Leo نے کہا۔ "اور ان میں سے زیادہ تر services 90% وقت idle تھیں۔"

Tom نے ایک بار پھر CloudWatch graphs کھولے۔ email service Lambda 36,412 بار invoke ہوا تھا۔ کل duration: تقریباً 18,200 GB-seconds۔ $0.0000166667 فی GB-second پر: $0.30 — اور یہ بھی فرضی تھا، کیونکہ 18,200 GB-seconds 400,000 GB-seconds کے ہمیشہ-مفت duration کے اندر آرام سے بیٹھے تھے۔ اصل line item صفر تھا۔

"EC2 instance $18 ماہانہ تھی،" Tom نے کہا۔ "ہم نے تیس سینٹ خرچ کیے — اور یہ میں free tier کو نظر انداز کر رہا ہوں، تاکہ ہم حقیقی unit cost جانیں۔ Bill صفر کہتا ہے۔"

"$5.47 میں سے زیادہ تر notification Lambda پر provisioned concurrency تھی — وہ ایک bill کرتی ہے چاہے یہ چلے یا نہ چلے۔ Image resizer، cleanup task، اور باقی free tier کے اندر fit ہوتے ہیں۔"

Tom نے کافی دیر اسکرین کو گھورا۔

"میں serverless کے ایک hype word ہونے کے بارے میں کہی گئی ہر بات واپس لیتا ہوں،" اس نے کہا۔

"تم نے کبھی یہ نہیں کہا،" Leo نے کہا۔

"میں نے بہت بلند آواز سے سوچا۔"

اگلے باب میں: وہ shipping container جو کسی بھی server کو گھر جیسا محسوس کراتا ہے۔
