# باب ۳۳: یہ منحصر ہے

اس باب سے پہلے ایک آخری سانس لیں۔

Cursor، Maya کی خالی slide پر جھپک رہا تھا۔ عنوان: "Architecture at Nimbus۔" اس نے اسے delete کیا اور type کیا: "The Question۔" پھر اس نے کمرے کی طرف دیکھا اور احساس کیا کہ اسے slide کی بالکل ضرورت نہیں۔

**خلاصۂ ماضی: Review سے Presentation تک**

Carlos کے ساتھ architecture review — اب چھ ماہ اور کئی سو restaurant launches ان کے پیچھے تھے — نے team کو ADRs کے ایک ڈھیر اور فیصلوں کے ship ہونے سے پہلے ان کے بارے میں سوچنے کے ایک صاف ستھرے طریقے کے ساتھ چھوڑا تھا۔ Maya investor presentation کی تیاری کر رہی تھی جب اس نے احساس کیا کہ جو کچھ Carlos نے پوچھا تھا — اور جو کچھ اس نے اعتماد سے جواب دیا تھا — وہ سب اسی بنیادی منطق پر آ کر ٹھہرتا تھا۔ Investors کیوں پوچھیں گے۔ اس نے، Nimbus بنانے کے دو سالوں میں، سیکھا تھا کہ جواب کبھی service کا نام نہیں ہوتا تھا۔ جواب ہمیشہ ان شرائط کا مجموعہ ہوتا تھا جو ایک service کو درست اور دوسری کو غلط بناتی تھیں۔ وہ ایسے لوگوں کے کمرے میں داخل ہونے والی تھی جو اس سے ہر architectural انتخاب کا دفاع کرنے کو کہیں گے۔ وہ تیار تھی۔

**سوال**

تقریباً ہر architecture کی گفتگو کے آخر میں، کوئی بالآخر پوچھتا ہے: "درست جواب کیا ہے؟"

اور تمام software engineering میں سب سے مفید، مایوس کن، ایماندار، اور غلط سمجھا جانے والا جواب ہے:

**یہ منحصر ہے۔**

اس لیے نہیں کہ سوال ناقابل جواب ہے۔ اس لیے نہیں کہ ماہر ٹال مٹول کر رہا ہے۔ بلکہ اس لیے کہ درست جواب واقعی، ساختی طور پر، ایسے سیاق پر منحصر ہے جو سوال میں نہیں تھا۔

یہ باب "یہ منحصر ہے" کو درست طریقے سے کہنا سیکھنے کے بارے میں ہے — جس کا مطلب ہے جملے کو مکمل کرنے کے قابل ہونا۔

ایک ڈاکٹر کے بارے میں سوچیں جس سے پوچھا جاتا ہے: "کیا surgery درست علاج ہے؟" ایک بُرا ڈاکٹر مریض کا معائنہ کیے بغیر ہاں یا نہیں کہتا ہے۔ ایک اچھا ڈاکٹر کہتا ہے: "یہ منحصر ہے — تشخیص پر، مریض کی عمر پر، ان کی دوسری حالتوں پر، اور اگر ہم انتظار کریں تو کیا ہوتا ہے۔" جواب ٹال مٹول نہیں ہے۔ یہ درستگی ہے۔ "یہ منحصر ہے" جس کے بعد ایک مکمل جملہ ہو، وہ سب سے مفید چیز ہے جو ایک ڈاکٹر — یا ایک معمار — کہہ سکتا ہے۔

**Nimbus کا اختتام**

آغاز کے ڈھائی سال بعد۔ Maya Seattle میں ایک conference room میں کھڑی تھی، venture capital investors کے ایک کمرے کے سامنے پیش کر رہی تھی۔

Nimbus بڑھ چکا تھا: 947 restaurant partners۔ 18,000 روزانہ orders۔ ماہانہ GMV میں $18 ملین۔ تین شہر live، دو مزید launch ہو رہے تھے۔ دو time zones میں چودہ engineers کی ایک team۔

Investors کے پاس سوالات تھے۔ ان میں سے ایک — fund میں ایک technical partner — آگے جھکا۔

"آپ کون سا database استعمال کر رہے ہیں؟" اس نے پوچھا۔

Maya نے ہچکچاہٹ نہیں کی۔

"Orders اور customer data کے لیے: Aurora PostgreSQL۔ Menu catalog کے لیے: DynamoDB۔ Session management اور caching کے لیے: ElastiCache Redis۔ Analytics کے لیے: S3 Parquet files کے اوپر Athena، high-frequency dashboard queries کے لیے Redshift کے ساتھ۔"

اس نے سر ہلایا۔ "Orders کے لیے Aurora کیوں اور DynamoDB کیوں نہیں؟"

"کیونکہ orders میں پیچیدہ relational ساخت ہوتی ہے — وہ menu items، customer accounts، restaurant addresses، payment methods کا حوالہ دیتے ہیں۔ ہمیں متعدد entities میں transactional consistency چاہیے۔ ایک relational database اس کے لیے درست آلہ ہے۔ DynamoDB کی طاقت لچکدار schema کے ساتھ high-throughput key-value access ہے، جو بالکل menu catalog کا access pattern ہے۔"

اس نے کچھ لکھا۔ "Scaling کا کیا؟ آپ نے 18,000 روزانہ orders کہا۔ یہ اوسطاً تقریباً 12 فی منٹ ہے۔ آپ نے peak کے لیے کیسے design کیا؟"

"جمعہ کی dinner rush اوسط کا تقریباً 25x ہے۔ ہم ECS اور Aurora Serverless v2 کے ساتھ horizontally scale کرتے ہیں، جو burst کو خودبخود سنبھالتا ہے۔ CloudFront static content load جذب کرتا ہے۔ API stateless ہے، تو horizontal scaling صاف ستھری ہے۔"

"اور اگر Aurora Serverless v2 کافی تیز scale نہ کر سکے؟"

"ہمارے پاس load testing کے نتائج ہیں۔ Aurora Serverless v2 کے لیے time-to-scale 10 سیکنڈ سے کم ہے۔ ہمارا اوسط جمعہ کا spike ramp baseline سے 8 منٹ لیتا ہے۔ ہم headroom کے ساتھ آرام دہ ہیں۔"

Technical partner نے باقی investors کی طرف دیکھا۔ "یہ اپنا نظام جانتی ہے۔"

اس کے پاس مزید سوالات تھے۔

"آپ deployment safety کیسے سنبھالتے ہیں؟ 947 restaurants پر، ایک بُری deployment کا مطلب ہے 947 restaurants orders نہیں لے سکتے۔"

Maya سے یہ پہلے بھی، اندرونی طور پر، پوچھا گیا تھا۔ "تمام behavior changes کے لیے feature flags۔ ہم code مسلسل deploy کرتے ہیں، لیکن نیا behavior ان flags کے پیچھے gated ہے جنہیں ہم بتدریج enable کرتے ہیں۔ ایک deployment جو order confirmation flow بدلتی ہے 24 گھنٹے کے لیے 1% restaurants تک roll out ہوتی ہے، پھر 10%، پھر 50%، پھر 100% — کسی بھی مرحلے پر error rates کے threshold سے تجاوز کرنے پر خودکار rollback کے ساتھ۔"

"ایک مکمل rollout میں کتنا وقت لگتا ہے؟"

"ایک high-risk تبدیلی کے لیے تین دن۔ low-risk کے لیے ایک دن۔ ہنگامی rollbacks چار منٹ سے کم میں مکمل ہو جاتے ہیں۔"

"آپ کی p99 Stripe latency کیا ہے؟"

Maya کے بولنے سے پہلے Tom نے جواب دیا۔ "214 ملی سیکنڈ۔"

"یہ زیادہ ہے،" investor نے کہا۔

"restaurants کے لیے ہمارا SLA order placement سے confirmation تک 5 سیکنڈ سے کم میں ہے،" Tom نے کہا۔ "Stripe call کے لیے 214ms اس budget کا 4.3% ہے۔ باقی وقت Aurora write، SQS message delivery، restaurant tablet push notification ہے۔ ہمارے پاس headroom ہے۔"

"اگر Stripe کا کوئی incident ہو تو کیا؟"

"ہم Stripe کا asynchronous payment capture استعمال کرتے ہیں۔ Order قبول ہو جاتا ہے اور restaurant کو فوراً مطلع کر دیا جاتا ہے۔ Payment capture asynchronously ہوتا ہے۔ اگر Stripe سست ہو، تو order پھر بھی گزر جاتا ہے — capture دوبارہ کوشش کرتا ہے۔ اگر Stripe مکمل طور پر down ہو، تو ہم capture کی کوشش کو exponential backoff کے ساتھ queue کرتے ہیں اور اپنے on-call کو alert کرتے ہیں۔ ہم نے 14 ماہ میں Stripe کے لیے کوئی order نہیں روکا۔"

Investor نے کچھ لکھا۔ "کیا آپ کے پاس کوئی single points of failure ہیں؟"

Priya نے جواب دیا۔ "ایک واحد region میں Aurora ایک single-region انحصار ہے۔ ہمارے پاس AZ-سطح کی ناکامیوں کے لیے Multi-AZ ہے، اور us-east-1 میں ایک Aurora Global Database reader پہلے ہی چل رہا ہے۔ ایک مکمل regional ناکامی کا مطلب اس reader پر fail over کرنا ہوگا — اور اس کے گرد خودکار regional failover وہ ہے جو ہم اس سہ ماہی بنا رہے ہیں۔ تب تک، ہاں — ایک us-west-2 regional ناکامی Nimbus کو down کر دے گی۔"

"آپ نے ابھی تک multi-region failover کیوں نہیں بنایا؟"

"کیونکہ چھ ماہ پہلے تک، اسے درست طریقے سے بنانے کی engineering لاگت outage کے business خطرے سے تجاوز کرتی تھی،" Priya نے کہا۔ "ہماری operating region میں ہمیں کبھی 30 منٹ سے زیادہ چلنے والی regional AWS ناکامی نہیں ہوئی۔ 287 restaurants پر — $34 اوسط order value پر روزانہ تقریباً 4,200 orders — ایک 2-گھنٹے کا regional outage ہمیں GMV میں تقریباً $12,000 کی لاگت آتا ہے۔ ایک درست طریقے سے نافذ warm standby کی engineering لاگت 3 ماہ کا senior engineer وقت ہے۔ ہماری موجودہ revenue پر، حساب اسے ملتوی کرنے کے حق میں تھا۔"

"اور اب؟"

"947 restaurants اور 18,000 روزانہ orders پر، وہی 2-گھنٹے کا outage GMV میں تقریباً $51,000 کی لاگت آتا ہے اور ان restaurant partners کے ساتھ نمایاں reputational نقصان پیدا کرتا ہے جو اپنی dinner service کے لیے ہم پر انحصار کرتے ہیں۔ حساب بدل گیا ہے۔ Failover project اگلے sprint میں شروع ہوتا ہے۔"

Investor نے کمرے میں دیگر investors کی طرف دیکھا۔ "یہ اپنا risk profile بھی جانتی ہے۔"


**"یہ منحصر ہے" کے نیچے چار سوال**

اس نے دو سال تک ان میں سے ہر سوال کا کوئی نہ کوئی ورژن پوچھا تھا یہ جانے بغیر کہ وہ ایک ہی سوال چار مختلف طریقوں سے پوچھ رہی تھی۔ Investor session نے اسے واضح کر دیا تھا۔ ہر انتخاب جو اس نے اعتماد سے بیان کیا تھا انہی چار محوروں پر واپس آتا تھا۔

**1. Access pattern کیا ہے؟**

Data کیسے لکھا اور پڑھا جاتا ہے؟ کس frequency پر؟ کتنے concurrent users سے؟ کس ترتیب میں؟ کن keys سے؟

یہ سوال سب سے بنیادی سطح پر technology selection کا تعین کرتا ہے۔ DynamoDB بمقابلہ Aurora بمقابلہ Redshift بمقابلہ Athena — درست جواب تقریباً مکمل طور پر access pattern پر منحصر ہے۔

**2. Scale کیا ہے؟**

صرف ابھی نہیں — 12 ماہ میں، 5 سال میں۔ Scale درست جواب کو بدل دیتا ہے۔ جو 100 requests فی دن پر کام کرتا ہے وہ 100 ملین پر ٹوٹ جاتا ہے۔ جو 10 users پر ضرورت سے زیادہ ہے وہ 10,000 پر ضروری ہے۔

اور scale صرف traffic نہیں ہے۔ یہ team کا سائز ہے (architecture کو اس team کے ذریعے قابل برقراری ہونا چاہیے جو آپ کے پاس ہے)۔ یہ data volume ہے۔ یہ جغرافیائی رسائی ہے۔

**3. Failure consequence کیا ہے؟**

اگر یہ ٹوٹے، تو کیا ہوتا ہے؟ کیا ایک user ایک سست page دیکھتا ہے؟ کیا ایک order ناکام ہوتا ہے؟ کیا پیسہ غلط طریقے سے منتقل ہوتا ہے؟ کیا کسی کا medical record ناقابل رسائی ہو جاتا ہے؟

نتیجہ طے کرتا ہے کہ آپ reliability میں کتنی سرمایہ کاری کرتے ہیں۔ ایک سست menu page eventual consistency کا تقاضا کرتا ہے۔ ایک ناکام payment synchronous writes اور واضح confirmation کا تقاضا کرتی ہے۔

**4. Cost constraint کیا ہے؟**

صرف پیسہ نہیں — operational پیچیدگی بھی (جو خود لاگت کی ایک شکل ہے)۔ ایک حل جو تین اضافی services کی ضرورت رکھتا ہے ایک سادہ تر سے تکنیکی طور پر برتر ہو سکتا ہے لیکن چار افراد کی team کے ساتھ برقرار رکھنے کے لیے بہت مہنگا۔

"رکیں — لیکن access pattern اتنا زیادہ اہم *کیوں* ہے؟" Maya نے دو سال پہلے پوچھا تھا، جب Tom نے پہلی بار menu catalog کو orders database سے الگ کرنے کی تجویز دی تھی۔ "کیا ہم بس بعد میں optimize نہیں کر سکتے؟"

وہ سوال، پتہ چلا، جواب کا آغاز تھا۔ آپ ایک relational schema کو key-value access patterns کے لیے اسے دوبارہ بنائے بغیر optimize نہیں کر سکتے۔ Access pattern کو design کے وقت معلوم ہونا تھا، بعد میں retrofit نہیں۔ تب سے اس نے جو ہر architecture فیصلہ کیا تھا وہ اسی سوال سے شروع ہوا تھا۔

آپ شاید سوچ رہے ہوں: اگر "یہ منحصر ہے" ہمیشہ درست جواب ہے، تو آپ کبھی فیصلہ کیسے کرتے ہیں؟ جواب یہ ہے کہ جملے کو مکمل کرنا آپ کو شرائط کا نام لینے پر مجبور کرتا ہے، اور ایک بار جب آپ نے انہیں نام دے دیا، تو آپ جانتے ہیں کہ آپ کو کون سی معلومات چاہئیں۔ "یہ access pattern پر منحصر ہے" "جا کر معلوم کرو کہ access pattern اصل میں کیا ہے" بن جاتا ہے۔ چار سوالات فیصلوں سے بچنے کا طریقہ نہیں ہیں — وہ انہیں درست معلومات کے ساتھ کرنے کا طریقہ ہیں۔

**"یہ منحصر ہے": جملے کو کیسے مکمل کریں**

"یہ منحصر ہے" کہنے کا درست طریقہ اسے فوراً مکمل کرنا ہے:

*"کیا ہمیں DynamoDB یا Aurora استعمال کرنا چاہیے؟"*

"یہ access pattern پر منحصر ہے۔ اگر آپ کو لچکدار schema کے ساتھ high-throughput key-based lookups چاہئیں، تو DynamoDB۔ اگر آپ کو پیچیدہ queries کے ساتھ متعلقہ entities میں transactional consistency چاہیے، تو Aurora۔"

*"کیا ہمیں Lambda یا EC2 استعمال کرنا چاہیے؟"*

"یہ workload کی خصوصیات پر منحصر ہے۔ event-driven، مختصر مدت، متغیر workloads کے لیے Lambda جہاں صفر idle لاگت اہم ہو۔ مستقل، stateful، یا long-running processes کے لیے EC2 یا ECS جہاں قابل پیش گوئی performance idle لاگت سے زیادہ اہم ہو۔"

*"کیا ہمیں Multi-AZ یا Multi-Region استعمال کرنا چاہیے؟"*

"یہ آپ کی RTO/RPO کی شرائط اور آپ کے threat model پر منحصر ہے۔ Multi-AZ، AZ ناکامیوں سے حفاظت کرتا ہے (سب سے عام AWS failure mode) اور RDS کے لیے RPO ~0 اور RTO ~60 سیکنڈ فراہم کرتا ہے۔ Multi-Region، regional ناکامیوں سے حفاظت کرتا ہے (نایاب) اور عالمی طور پر تقسیم شدہ users کو serve کرتا ہے۔ اگر آپ کو ایک regional disaster سے sub-minute failover چاہیے، تو Multi-Region۔ اگر AZ resilience کافی ہے، تو Multi-AZ بہت سادہ تر اور سستا ہے۔"

"یہ منحصر ہے" جواب کا اختتام نہیں ہے۔ یہ اصل جواب کا آغاز ہے۔


*"کیا ہمیں container orchestration کے لیے EKS یا ECS استعمال کرنا چاہیے؟"*

Investor نے یہ Maya کے اگلی slide پر جانے سے پہلے پوچھا تھا۔ وہ رکی۔

"یہ team کے سائز، موجودہ Kubernetes مہارت، اور اس بات پر منحصر ہے کہ آیا آپ کو Kubernetes-مخصوص features چاہئیں۔"

"اسے بڑھائیں،" اس نے کہا۔

"Kubernetes ایک طاقتور orchestration platform ہے،" Maya نے کہا۔ "اس کا ایک بھرپور ecosystem ہے — Helm charts، custom resource definitions، multi-cluster federation، advanced scheduling policies۔ اگر آپ کے پاس ایک ایسی team ہے جو Kubernetes جانتی ہے، اس کے گرد tooling بنا ہے، اور انہیں ان صلاحیتوں کی ضرورت ہے، تو EKS درست انتخاب ہے۔ آپ کو ایک managed control plane ملتا ہے، لیکن آپ پھر بھی network policies، pod security، resource quotas، اور باقی کی Kubernetes پیچیدگی manage کر رہے ہوتے ہیں۔"

"اور ECS؟"

"ECS سادہ تر ہے۔ کوئی Kubernetes API نہیں۔ کوئی etcd نہیں۔ کوئی pod networking پیچیدگی نہیں۔ آپ tasks، services، اور clusters define کرتے ہیں۔ IAM اضافی plugins کی ضرورت کے بغیر natively integrate ہوتا ہے۔ ذہنی model نمایاں طور پر چھوٹا ہے۔ ایک ایسی team کے لیے جو پہلے سے Kubernetes نہیں جانتی، ECS مہینوں کا learning curve ختم کر دیتا ہے۔"

"Nimbus کون سا استعمال کر رہا ہے؟"

"ECS،" اس نے کہا۔ "ہم نے اٹھارہ ماہ پہلے EKS کا جائزہ لیا۔ ہمارے پاس Kubernetes کے تجربے والا ایک engineer تھا۔ دوسروں کو ایک production Kubernetes environment میں نتیجہ خیز بننے کے لیے 3 سے 4 ماہ درکار ہوتے۔ جو features EKS ہمیں دیتا — multi-cluster management، custom scheduling — ہمیں ان کی ضرورت نہیں تھی۔ Fargate کے ساتھ ECS ہمارے containers چلاتا ہے۔ Team دو ہفتوں میں نتیجہ خیز ہو گئی۔"

"کیا یہ 50 engineers پر درست انتخاب ہے؟" اس نے پوچھا۔

"شاید نہ ہو،" Maya نے کہا۔ "50 engineers پر متعدد product teams کے ساتھ جنہیں isolated namespaces، custom networking policies، اور team-scoped resource quotas چاہئیں — Kubernetes کا namespace model واقعی قیمتی بن جاتا ہے۔ ECS کے پاس مساوی namespace isolation نہیں ہے۔ اس پیمانے پر، Kubernetes learning curve ایک بہت بڑی team میں تقسیم ہو جاتا ہے۔ 'یہ منحصر ہے' جواب بدل جاتا ہے۔"

"کس team کے سائز پر تبدیلی ہوتی ہے؟" اس نے پوچھا۔

اس نے اس کے بارے میں سوچا تھا۔ "جو اصول میں استعمال کرتی ہوں: جب Kubernetes کا operational overhead ECS کی حدود کے گرد کام کرنے کے organizational overhead سے کم ہو جائے، تو switch کریں۔ ایک 14-فرد team کے لیے، ECS۔ متعدد product verticals والی ایک 50-فرد team کے لیے، غالباً EKS۔ عدد طے شدہ نہیں ہے — یہ اس بات پر منحصر ہے کہ آپ کیا بنا رہے ہیں اور کون بنا رہا ہے۔"

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے خود سے پوچھا، اس سوال کو دہراتے ہوئے جو اس نے دو سال کی تعمیر سے سیکھا تھا۔ "بس ایک کیوں نہ چنیں اور اسی پر قائم رہیں؟"

کیونکہ درست جواب بدل جاتا ہے جیسے جیسے تنظیم بدلتی ہے۔ ایک 4-فرد team کے لیے کیا گیا ایک architecture فیصلہ ضروری نہیں کہ ایک 40-فرد team کے لیے درست ہو۔ شرائط بدلتی ہیں۔ جواب ان کے ساتھ بدلتا ہے۔

"یہی نکتہ ہے،" اس نے investor سے کہا۔ "آج درست جواب ECS ہے۔ تین سال میں درست جواب EKS ہو سکتا ہے۔ ہم دوبارہ غور کریں گے جب شرائط اس کا تقاضا کریں۔ ہمارے پاس ایک ADR ہے جو document کرتا ہے کہ ہم نے ECS کیوں چنا، اور یہ واضح طور پر فہرست دیتا ہے کہ کیا چیز دوبارہ غور کو trigger کرے گی۔"

Investor نے ایک اور note لکھا۔ "یہ ایک technical فیصلہ تھامنے کا ایک پختہ طریقہ ہے۔"


**تبدیلی: جب "یہ منحصر ہے" آپ کو مشکل میں ڈالے**

اگر access pattern key-value lookups کے حق میں ہے اور آپ DynamoDB چنتے ہیں، تو آپ پیمانے پر Aurora سے بہتر کارکردگی دکھائیں گے — لیکن اگر آپ تین entities میں JOIN queries کی ضرورت والی ایک feature شامل کریں، تو آپ نے غلط بنیاد بنائی ہے اور دباؤ میں migrate کرنا پڑے گا۔ "یہ منحصر ہے" جواب اتنا ہی اچھا ہے جتنی ان شرائط کی آپ کی سمجھ جن پر آپ انحصار کر رہے ہیں۔

اگر آپ موجودہ scale اور موجودہ access pattern کے لیے optimize کریں، تو آپ آج کے لیے درست فیصلہ کریں گے — لیکن اگر traffic ایک سال میں 50x بڑھ جائے بغیر آپ کے architecture کے موافق ہوئے، تو پہلے دن کے لیے درست فیصلہ 365ویں دن کے لیے bottleneck بن جاتا ہے۔ چار سوالات کو صرف design کے وقت ہی نہیں بلکہ نظام کے بڑھنے کے ساتھ دوبارہ پوچھنا ضروری ہے۔

**وہ Patterns جو نہیں بدلتے**

جبکہ مخصوص technology انتخاب ارتقا پذیر ہوتے ہیں — نئی services launch ہوتی ہیں، pricing بدلتی ہے، بہتر متبادل ابھرتے ہیں — کچھ بنیادی patterns دہائیوں سے مستحکم رہے ہیں:

**Separation of concerns**: وہ components جو مختلف کام کرتے ہیں انہیں آزاد ہونا چاہیے۔ ایک میں ایک تبدیلی کو دوسرے میں تبدیلی کی ضرورت نہیں ہونی چاہیے۔ یہی وجہ ہے کہ آپ SQS سے ڈی کپل کرتے ہیں، براہ راست calls سے نہیں۔ یہی وجہ ہے کہ آپ objects کے لیے S3 استعمال کرتے ہیں، databases نہیں۔ یہی وجہ ہے کہ web tier اور database tier الگ ہیں۔

**Defense in depth**: کوئی ایک security control کافی نہیں ہے۔ آپ کے پاس IAM، security groups، NACLs، WAF، GuardDuty، Secrets Manager، KMS ہیں۔ اگر ایک layer ناکام ہو، تو اگلی اسے پکڑتی ہے۔

**جو آپ استعمال کرتے ہیں اس کی ادائیگی کریں، جب آپ اسے استعمال کریں**: cloud کا بنیادی معاشی اصول۔ Lambda صفر تک scale کرتا ہے۔ Spot instances spare capacity استعمال کرتی ہیں۔ S3 lifecycle policies cold data کو سستی storage میں منتقل کرتی ہیں۔ DynamoDB on-demand فی request charge کرتا ہے۔ Tom نے دو سالوں میں دس ہزار بار "یہ فی مہینہ کتنی لاگت ہے؟" پوچھا تھا۔ وہ سوال — مستقل طور پر پوچھا گیا، سختی سے جواب دیا گیا — سالانہ بچت میں تقریباً $36,000 میں بدل گیا تھا۔ Patterns مختلف ہیں؛ اصول ایک ہی ہے۔

**سب سے زیادہ امکانی ناکامی کے لیے optimize کریں**: پہلے Multi-AZ (AZ ناکامیاں ہوتی ہیں)۔ دوسرا cross-region DR (regional ناکامیاں نایاب ہیں)۔ cross-region پیچیدگی سے پہلے within-AZ redundancy (متعدد instances)۔ حقیقت پسندانہ ناکامی کے لیے بنائیں، تباہ کن لیکن غیر امکانی کے لیے نہیں۔

**optimize کرنے سے پہلے ناپیں**: Tom کا طریقہ — CloudWatch metrics کھینچیں، اصل pattern سمجھیں، پھر فیصلے کریں — مفروضوں پر مبنی قبل از وقت optimization سے زیادہ قیمتی ہے۔ Leo کی nightly batch jobs پر جبلت — "یہ ٹھیک رہے گا" — وہ سب سے اہم چیز تھی جس سے خود کو باہر نکالنا تھا۔ یہ عام طور پر ٹھیک ہوتا ہے، اس ایک بار تک جب تک نہیں ہوتا، اور آپ نے کچھ نہیں ناپا ہوتا۔


**غلط defaults کی مرکب لاگت**۔

Tom کے پاس فہرست میں شامل کرنے کے لیے ایک اور pattern تھا، ایک جسے اس نے صرف تین ماہ کے cost review کے بعد شناخت کیا تھا: default نہ بدلنے کی لاگت۔

AWS services کو box سے باہر محفوظ اور فعال ہونے کے لیے design کیا گیا ہے۔ Defaults کو ہر workload کے لیے بہترین ہونے کے لیے design نہیں کیا گیا۔ gp2 دسمبر 2020 میں gp3 launch ہونے تک default EBS volume type تھی۔ اس کے بعد، gp3 نئی volumes کے لیے default بن گئی — لیکن موجودہ gp2 volumes کبھی تبدیل نہیں ہوئیں، کیونکہ AWS واضح action کے بغیر موجودہ customer resources کو modify نہیں کرتا۔

لاگت کا مضمر: ہر team جس نے gp3 سے پہلے EBS volumes بنائیں اور کبھی ایک migration audit نہیں چلایا اس نے سالوں تک فی GB 25% زیادہ ادا کیا، اس لیے نہیں کہ انہوں نے غلط فیصلہ کیا، بلکہ اس لیے کہ انہوں نے کوئی فیصلہ نہیں کیا۔ Default قائم رہا، اور لاگت خاموشی سے مرکب ہوتی گئی۔

یہی وجہ ہے کہ سوال "رکیں، لیکن ہم اسے اس طرح کیوں کریں؟" team کی پوچھی جانے والی سب سے قیمتی چیز بن گیا تھا۔ یہ ہمیشہ ایک کیے گئے فیصلے کو چیلنج کرنے کے بارے میں نہیں تھا۔ کبھی کبھی یہ ایک غیر-فیصلے پر سوال کرنے کے بارے میں تھا: ایک default جسے جانچ کے بغیر قبول کیا گیا۔

Pattern عام ہوتا ہے: defaults پر دوبارہ غور کریں جب AWS ایک نیا option launch کرے۔ gp2 سے gp3۔ traffic مستحکم ہونے پر On-Demand DynamoDB سے Auto Scaling کے ساتھ provisioned تک۔ access patterns غیر یقینی ہونے پر Standard S3 سے Intelligent-Tiering تک۔ دوبارہ غور مہنگا ہونے کی ضرورت نہیں — فی category تجزیے کی ایک دوپہر، سہ ماہی۔ لیکن اسے چھوڑا نہیں جا سکتا۔ Defaults مرکب ہوتے ہیں۔

"ہر ڈالر جو ہم کسی ایسی چیز پر خرچ کر رہے ہیں جو ہم نے چنی ایک ارادی لاگت ہے،" Tom نے ماہانہ review میں کہا۔ "ہر ڈالر جو ہم کسی ایسی چیز پر خرچ کر رہے ہیں جسے ہم نے provision کرنے کے بعد سے نہیں دیکھا ایک ممکنہ default ہے جس پر سوال کیا جانا چاہیے۔"

"ہمارے پاس ان میں سے کتنے ہیں؟" Maya نے پوچھا۔

"چھ ماہ پہلے سے کم،" اس نے کہا۔ "صفر سے زیادہ۔"

یہی ایماندار جواب تھا۔ یہ ہمیشہ ایماندار جواب تھا۔


**یہ کتاب آپ کو کیا نہیں سکھا سکتی**

آئیے حدود کے بارے میں صاف بات کریں۔

اس کتاب نے آپ کو سکھایا ہے:

- ہر بڑی AWS service کیا کرتی ہے
- وہ تشبیہات جو انہیں بدیہی بناتی ہیں
- متبادل کے درمیان trade-offs
- وہ امتحانی علم جو آپ کو SAA-C03 کے لیے چاہیے
- architectural فیصلوں کے بارے میں سوچنے کا ایک framework

یہ کتاب آپ کو نہیں سکھا سکتی:

- **Production جبلت**: وہ احساس جو کہتا ہے "یہ load کے تحت عجیب ہونے والا ہے" اس سے پہلے کہ آپ نے اسے ہوتے دیکھا ہو۔ یہ حقیقی نظام چلانے سے آتا ہے۔
- **دباؤ کے تحت technical judgment**: یہ فیصلہ کرنا کہ 3 AM پر کیا کرنا ہے جب نظام down ہو اور آپ کے پاس نامکمل معلومات ہوں۔ یہ incidents سے آتا ہے۔
- **Stakeholder بصیرت**: یہ جاننا کہ کب ایک business requirement پر مزاحمت کرنی ہے کیونکہ technical لاگت بہت زیادہ ہے۔ یہ technical اور business دونوں پہلوؤں کے تجربے سے آتا ہے۔
- **مخصوص سیاق کے لیے درست سوال**: Carlos درست سوالات پوچھ سکتا تھا کیونکہ اس نے اسی طرح کے مسائل درجنوں بار دیکھے تھے۔ یہ علم کمایا جاتا ہے، پڑھا نہیں جاتا۔

آپ سیکھنا ختم نہیں ہوئے۔ آپ نے بمشکل شروع کیا ہے۔

**امتحان منزل نہیں ہے**

آپ نے یہ کتاب AWS Solutions Architect Associate امتحان کی تیاری کے لیے اٹھائی۔ یہ جائز ہے۔ SAA-C03 certification حقیقی ہے، قدر کی جاتی ہے، اور دروازے کھولے گی۔

لیکن امتحان علم اور pattern recognition کو test کرتا ہے۔ یہ judgment کو test نہیں کرتا۔ یہ operational تجربہ کو test نہیں کرتا۔ یہ test نہیں کرتا کہ آپ کیا کرتے ہیں جب آپ کا بنایا architecture جمعہ کی رات 11 PM پر کام کرنا بند کر دے۔

Certification ایک ابتدائی سند ہے۔ جب آپ امتحان پاس کرتے ہیں، تو آپ جان لیں گے کہ AWS services کیسے کام کرتی ہیں اور وہ کیسے ملتی ہیں۔ آپ کے پاس architecture کے بارے میں سوچنے کا ایک framework ہوگا۔ آپ نے ابھی تک یہ کیا نہیں ہوگا۔

امتحان کے بعد اگلا قدم: کچھ حقیقی بنائیں۔ اسے deploy کریں۔ اسے چلائیں۔ اسے ناکام ہوتے دیکھیں۔ اسے ٹھیک کریں۔ ایک service میں پیسہ ختم ہو جائے اور لاگت کہیں اور منتقل کریں۔ آدھی رات کو page کیے جائیں اور ناکافی معلومات کے ساتھ ایک فیصلہ کریں۔

اسی طرح اس کتاب کا علم judgment بن جاتا ہے۔

**Maya کا آخری جواب**

Investor meeting کے آخر میں، technical partner کے پاس ایک اور سوال تھا۔

"اگر آپ آج دوبارہ شروع کرتے، جو آپ اب جانتی ہیں اسے جانتے ہوئے، تو آپ کیا مختلف کرتیں؟"

Maya نے ایک لمحہ لیا۔

"میں پہلے دن سے infrastructure as code سے شروع کرتی،" اس نے کہا۔ "Leo نے پہلی EC2 instance دستی طور پر deploy کی۔ ہم نے ہر چیز کو Terraform میں منتقل کرنے میں چھ ماہ گزارے۔ وہ چھ ماہ کا technical debt تھا جس نے ہمیں حقیقی وقت کی لاگت آئی۔"

"اور کیا؟"

"میں شروع میں managed services کے بارے میں زیادہ محتاط ہوتی۔ ہم نے DynamoDB استعمال کیا جب ایک سادہ RDS database مہینوں کے لیے کافی ہوتا۔ DynamoDB access pattern design کو تجربہ کار سوچ کی ضرورت تھی جو ہمارے پاس ابھی نہیں تھی۔ ہم نے schema کو دو بار دوبارہ design کیا۔"

"تو شروع میں سادہ تر بہتر ہے؟"

"سادہ تر *ہمیشہ* بہتر ہے۔ سوال ہمیشہ یہ ہے: سب سے سادہ چیز کیا ہے جو اصل مسئلہ حل کرتی ہے، متوقع مستقبل کا مسئلہ نہیں؟ ہم نے ایسے مسائل حل کرنے کے لیے پیچیدگی شامل کی جو ہمارے پاس ابھی نہیں تھے۔ اس میں سے کچھ پیچیدگی نے اپنے مسائل پیدا کیے۔"

Technical partner نے وہ لکھ لیا۔

"آخری سوال،" اس نے کہا۔ "AWS پر بنانے کے بارے میں سب سے اہم چیز کیا ہے جو آپ جانتی ہیں جو آپ شروع کرتے وقت نہیں جانتی تھیں؟"

Maya نے دو سالوں کے بارے میں سوچا۔ Incidents۔ Cost reviews۔ Well-Architected review۔ دباؤ میں کیے گئے architecture فیصلے اور وہ جو احتیاط سے کیے گئے۔ وہ جو انہوں نے درست کیے اور وہ جنہیں دوبارہ کرنا پڑا۔

"کہ cloud architecture کے مسائل حل نہیں کرتا،" اس نے کہا۔ "یہ انہیں بڑھاتا ہے۔ on-premises ایک بُرا فیصلہ آپ کو ایک ہفتے کی لاگت آ سکتا ہے۔ cloud میں ایک بُرا فیصلہ آپ کو ہر مہینہ، پیمانے پر، پیسے کی لاگت آ سکتا ہے، جب تک کوئی notice نہ کرے۔"

وہ رکی۔

"cloud اچھے فیصلوں کو scale بناتا ہے۔ اور بُرے فیصلوں کو بھی۔"

اس شام، Maya نے Tom، Priya، اور Leo کو investor session کے بارے میں بتایا۔

"اس نے database کے انتخاب کے بارے میں پوچھا،" اس نے کہا۔ "ان سب کے بارے میں۔"

"یہ فی مہینہ کتنی لاگت ہے؟" Tom نے فوراً پوچھا، جو بالکل غلط سوال تھا اور درست بھی۔ "کیا اس نے cost model کے بارے میں پوچھا؟"

"اس نے پوچھا۔ میں نے Savings Plans، DynamoDB کا provisioned میں switch سمجھایا۔ اس نے سر ہلایا۔"

"اور اگر کوئی break in کرنے کی کوشش کرے؟" Priya نے پوچھا۔ "کیا security کے سوالات آئے؟"

"IAM، encryption، GuardDuty۔ ہاں۔ وہ مطمئن لگا۔"

Leo خاموش رہا تھا۔ "کیا اس نے ان حصوں کے بارے میں پوچھا جو اچھے نہیں گئے؟"

"اس نے پوچھا کہ میں کیا مختلف کرتی۔ میں نے اسے infrastructure as code سے شروع کرنے، اور شروع میں managed services کے بارے میں زیادہ محتاط ہونے کے بارے میں بتایا۔"

"وہ DynamoDB schema جو ہم نے دو بار دوبارہ design کیا،" Leo نے کہا۔ "مجھے ہمیشہ لگتا تھا کہ وہ میرے ذمے تھا۔"

"یہ ہم سب کے ذمے تھا،" Maya نے کہا۔ "یہی نکتہ ہے۔"

**اختتام**

آپ نے بہت کچھ سیکھا ہے۔ AWS services۔ Trade-offs۔ Patterns۔

اب اس کے ساتھ کچھ کریں۔

کچھ بنائیں۔ جان بوجھ کر غلطیاں کریں۔ Post-mortems پڑھیں (وہ عوامی ہیں — AWS، Cloudflare، GitHub، Stripe سب انہیں شائع کرتے ہیں)۔ ان teams کے ساتھ کام کریں جو ان چیزوں میں آپ سے بہتر ہیں جن میں آپ سب سے کمزور ہیں۔

SAA-C03 امتحان test کرے گا کہ آیا آپ مواد جانتے ہیں۔ آپ کا کیریئر test کرے گا کہ آیا آپ اسے لاگو کر سکتے ہیں۔

دونوں کرنے کے قابل ہیں۔ کوئی بھی آخری منزل نہیں ہے۔

اس شعبے میں کوئی آخری منزل نہیں ہے۔ صرف اگلا مسئلہ ہے، اگلا فیصلہ، اور درست اگلا سوال پوچھنے کی عادت۔

**وہ اسباق جو Slide Deck میں نہیں آئے**

Seattle سے واپسی کی train پر، Maya نے Leo اور Priya کو دو چیزوں کے بارے میں بتایا جن کے بارے میں وہ خوش تھی کہ investor نے براہ راست نہیں پوچھا — کیونکہ ایماندار جوابات ہر ایک میں بیس منٹ لیتے۔

**Analytics pipeline کا incident**۔

آٹھ ماہ پہلے، analytics pipeline main order processing service سے کپل ہوئی تھی۔ Order events اسی SQS queue میں لکھے جاتے تھے جسے analytics pipeline consume کرتی تھی۔ Coupling معقول لگی تھی: analytics کو order data چاہیے تھا، order processing order data پیدا کرتی تھی۔

ایک بدھ کی شام، analytics aggregation Lambda میں ایک bug نے اسے queue سے consume کرنا بند کرا دیا۔ Queue depth بڑھی۔ کیونکہ order processing service اپنے confirmation messages کے لیے وہی SQS queue شیئر کرتی تھی، تو analytics pipeline اور order confirmation path دونوں بیک وقت backup ہو رہے تھے۔ Restaurant partners نے confirmation تاخیریں دیکھنا شروع کر دیں۔ SQS queue اپنی message retention حد کے قریب پہنچ رہی تھی۔

"میں نے پہلے ہی fix deploy کر دیا،" Leo نے اس رات 11 PM پر کہا تھا — اور پھر رک گیا۔ Analytics bug کے لیے fix کو ایک ایسی Lambda redeployment کی ضرورت ہوگی جو queue صاف کرے گی، لیکن اس نے یہ چیک نہیں کیا تھا کہ آیا queue میں order confirmation messages ابھی بھی اپنے visibility timeout کے اندر تھے۔ اگر timeout ختم ہو گیا ہوتا، تو Lambda انہیں دوبارہ process کرتا، اور restaurant partners کو duplicate order confirmations ملتیں۔

Incident تین گھنٹے چلا تھا اور دو rollbacks کی ضرورت پڑی تھی۔

معماری سبق سادہ تھا: analytics اور operational processing کو کبھی ایک ہی queue شیئر نہیں کرنی چاہیے۔ ان کی مختلف performance خصوصیات، مختلف failure modes، اور جب وہ ناکام ہوں تو مختلف نتائج ہوتے ہیں۔ انہیں کپل کرنے کا مطلب تھا کہ کم-ترجیح والے path میں ایک ناکامی زیادہ-ترجیح والے path کو خراب کر سکتی ہے۔

Incident کے بعد، Nimbus نے pipelines کو مکمل طور پر الگ کر دیا۔ Order events ایک وقف operational queue میں گئے۔ ایک علیحدہ EventBridge rule نے events کو ایک analytics-only queue میں نقل کیا۔ دونوں pipelines میں event source کے سوا کوئی مشترکہ infrastructure نہیں تھی۔ اگلی بار جب analytics Lambda میں ایک bug تھا — اور دو ماہ بعد تھا — یہ خاموشی سے ناکام ہوا، analytics queue backup ہوئی، صبح کی reports دیر سے تھیں، اور order confirmation path مکمل طور پر غیر متاثر تھا۔

"Separation of concerns،" Priya نے دوسرے analytics Lambda bug کے بعد کہا تھا۔ "infrastructure سطح پر وہی اصول جو code سطح پر۔ دو چیزیں جو مختلف طریقے سے ناکام ہوتی ہیں انہیں ایک ہی failure domain شیئر نہیں کرنا چاہیے۔"

**قبل از وقت abstraction۔**

Series A سے تین ماہ پہلے، Leo نے ایک generic restaurant configuration service بنانے کی تجویز دی تھی۔ Nimbus کے پاس اس وقت تین قسم کی restaurant-specific configuration تھی: menu settings، delivery zone parameters، اور notification preferences۔ ایک generic configuration service، Leo نے دلیل دی تھی، انہیں ہر بار نئی storage اور retrieval logic بنائے بغیر نئی configuration قسمیں شامل کرنے دے گی۔

Team نے اسے بنایا۔ data model design کرنے میں دو ہفتے۔ service نافذ کرنے میں ایک ہفتہ۔ تین موجودہ configuration قسموں کو اس میں منتقل کرنے میں ایک اور ہفتہ۔ کل چار ہفتے۔

جب تک انہوں نے generic configuration service بنانا ختم کیا، ان کے پاس... تین configuration قسمیں تھیں۔ وہی تین جو پہلے ان کے پاس تھیں۔ Generic service نے کوئی نئی صلاحیت شامل نہیں کی؛ اس نے بس موجودہ صلاحیت کو سمجھنا مشکل تر بنا دیا۔ وہ key-value schema جس نے service کو "generic" بنایا اس نے اس کے اوپر ایک schema registry بنائے بغیر validation یا type constraints شامل کرنا بھی ناممکن بنا دیا۔

"ہم نے ایک library کے لیے ایک framework بنایا،" Tom نے کہا، جب اس نے Leo کو investor کی کہانی سنائی۔

"اس کا کیا مطلب ہے؟" Leo نے پوچھا۔

"ہمارے پاس تین کتابیں تھیں۔ ہم نے انہیں منظم کرنے کے لیے ایک library management system بنایا۔ بہتر ہوتا کہ بس تین کتابیں ایک shelf پر رکھ دیں۔"

Configuration service کو آٹھ ماہ بعد خاموشی سے deprecate کر دیا گیا تھا، جب team اتنی بڑی ہو گئی کہ چار engineers نے یہ دریافت کرنے سے پہلے کہ یہ ایک DynamoDB table کے گرد ایک پتلا wrapper تھا، یہ سیکھنے میں خاصا وقت گزارا کہ یہ کیسے کام کرتا ہے۔ انہوں نے دو دنوں میں فی configuration قسم typed schemas کے ساتھ براہ راست DynamoDB access پر واپس migrate کیا۔

"اسے بنانے میں چار ہفتے،" Tom نے کہا۔ "اسے ختم کرنے میں دو دن۔ علاوہ ازیں ہر نئے engineer کو اسے سمجھانے کی جاری لاگت۔"

"درست فیصلہ کیا تھا؟" Priya نے پوچھا۔

"Configuration service تب بنائیں جب آپ کے پاس دس سے زیادہ configuration قسمیں ہوں اور pattern واضح طور پر مستحکم ہو،" Tom نے کہا۔ "تب نہیں جب آپ کے پاس تین ہوں اور آپ مستقبل کی ضروریات کے بارے میں قیاس آرائی کر رہے ہوں۔ Abstraction قبل از وقت تھا۔ جن ضروریات کے لیے اسے design کیا گیا تھا وہ ظاہر نہیں ہوئیں۔"

"کیا ہم نے سوچا ہے کہ اگر ہم مسئلے کے دائرے کو سمجھنے سے پہلے abstractions بنائیں تو کیا ہوگا؟" Priya نے پوچھا۔

"ہم نے ابھی اسے بیان کیا،" Tom نے کہا۔ "آپ ایک ایسے abstraction کو برقرار رکھنے میں وقت گزارتے ہیں جو اس مسئلے سے زیادہ لاگت آتا ہے جسے یہ حل کر رہا تھا۔"

Maya نے اسے architectural anti-patterns کے اپنے ذہنی model میں شامل کیا: تین use cases کے لیے بنایا گیا generic service۔ کپل شدہ pipeline۔ ایک ناکافی مشاہدے کی window پر کیا گیا right-sizing فیصلہ۔ ہر ایک ایک فیصلہ تھا جو مقامی طور پر، اس لمحے میں، دستیاب معلومات کے ساتھ معقول تھا۔ ہر ایک ایسے طریقوں سے غلط نکلا جو صرف بعد میں نظر آئے۔

"وہ جو کاغذ پر ٹھیک لگتے ہیں،" اس نے Priya سے کہا، "وہ ہیں جو آپ کو سب سے زیادہ لاگت آتے ہیں۔"

"کیونکہ آپ ان پر دوبارہ غور نہیں کرتے،" Priya نے کہا۔ "آپ design دیکھتے ہیں، یہ مربوط ہے، منطق قائم ہے، اور آپ آگے بڑھ جاتے ہیں۔ Failure mode اس وقت تک غیر مرئی ہے جب تک نظام ایک ایسے load یا ایک ایسے دباؤ کے تحت نہ ہو جسے کاغذی ورژن نے کبھی model نہیں کیا۔"

"یہی وجہ ہے کہ architecture review اہم ہے،" Maya نے کہا۔ "اس لیے نہیں کہ reviewer زیادہ جانتا ہے۔ کیونکہ وہ وہ سوال پوچھے گا جو پوچھنے کا آپ نے نہیں سوچا۔"


## خلاصہ

Investor meeting اچھی گئی تھی۔ اس لیے نہیں کہ Maya نے ہر service کی pricing structure یاد کر لی تھی، بلکہ اس لیے کہ وہ Nimbus کے کیے گئے ہر انتخاب کے لیے *کیوں* کا جواب دے سکتی تھی۔ جو "یہ منحصر ہے" جوابات اس نے دیے تھے وہ درست، مشروط، اور انہی چار سوالوں میں مستحکم تھے جو وہ مختلف شکلوں میں، دو سال سے، پوچھتی رہی تھی۔

- **"یہ منحصر ہے" جواب کا آغاز ہے**، اختتام نہیں۔ ہمیشہ جملے کو ان شرائط کے ساتھ مکمل کریں جن پر یہ منحصر ہے۔
- ہر architecture trade-off کے نیچے چار سوال: access pattern، scale، failure consequence، cost constraint۔
- وہ patterns جو پائیدار ہیں: separation of concerns، defense in depth، جو آپ استعمال کریں اس کی ادائیگی کریں، امکانی ناکامی کے لیے optimize کریں، optimize کرنے سے پہلے ناپیں۔
- **cloud فیصلوں کو بڑھاتا ہے** — اچھے اور بُرے۔ on-premises ایک بُرا فیصلہ ایک ہفتے کی لاگت آتا ہے؛ cloud میں ایک بُرا فیصلہ ماہانہ، پیمانے پر، مرکب ہوتا ہے۔
- SAA-C03 certification علم اور pattern recognition کو test کرتا ہے۔ Production تجربہ اس علم کو judgment میں بدلتا ہے۔

## امتحان کے نکات

*SAA-C03 ڈومین: Cross-domain — تمام domains*

یہ باب اس کتاب کا امتحانی مواد بند کرتا ہے۔ امتحان دینے سے پہلے:

**ان services کا جائزہ لیں جن کے بارے میں آپ سب سے کم پُراعتماد ہیں**:

- زیادہ تر لوگوں کے لیے: Kinesis بمقابلہ SQS (stream بمقابلہ queue فرق)
- VPC networking (route tables، subnets، NAT Gateway، Internet Gateway)
- IAM policy evaluation logic (explicit deny > explicit allow > implicit deny)
- Storage class selection (تمام آٹھ S3 storage classes اور ان کے trade-offs جانیں)
- مخصوص use cases کے لیے RDS بمقابلہ Aurora بمقابلہ DynamoDB

**امتحان کی عام منظر نامہ ساخت جانیں**:

SAA-C03 ایک business requirement پیش کرتا ہے ("کمپنی کو 99.99% availability چاہیے") اور آپ سے وہ architecture شناخت کرنے کو کہتا ہے جو اسے پورا کرے۔ ہمیشہ requirement پڑھیں، کلیدی constraint شناخت کریں، اور ان options کو ختم کریں جو اسے پورا نہیں کرتے۔

**Distractor کی شناخت کی مشق کریں**:

امتحان پر ہر غلط جواب ایک مخصوص وجہ سے غلط ہے۔ یہ شناخت کرنا سیکھنا کہ ہر غلط جواب *کیوں* غلط ہے درست جوابات یاد کرنے سے زیادہ قیمتی ہے۔

**امتحان pattern recognition کو انعام دیتا ہے**:

- "Decouple" → SQS/SNS
- "Serverless" → Lambda، DynamoDB، Aurora Serverless
- "Global low latency" → CloudFront، Global Accelerator، Global DynamoDB، Aurora Global
- "Compliance/auditing" → CloudTrail، Config، Security Hub، Macie
- "Cost optimization" → Spot Instances، Savings Plans، lifecycle policies، right-sizing

**آپ تیار ہیں**۔ اس لیے نہیں کہ اس کتاب نے ہر چیز کا احاطہ کیا — کوئی نہیں کرتی۔ بلکہ اس لیے کہ آپ اصولوں کو اتنا اچھا سمجھتے ہیں کہ جواب تک استدلال کر سکیں حتیٰ کہ جب آپ فوراً صحیح منظر نامہ نہ پہچانیں۔

## مشقیں

**آخری مشق**

اس باب کے بعد کوئی مزید منظم امتحانی سوالات نہیں ہیں۔

اس کے بجائے: ایک کھلا سوال۔

آج آپ کون سا نظام بنائیں گے، جو آپ جانتے ہیں اسے جانتے ہوئے؟

اسے لکھیں۔ architecture کا خاکہ بنائیں۔ services شناخت کریں۔ ان trade-offs کو نوٹ کریں جو آپ کریں گے اور کیوں۔ Failure modes کی پیش بینی کریں۔

پھر اسے بنائیں۔

یہی assignment ہے۔ کوئی due date نہیں ہے۔ کوئی grade نہیں ہے۔ بس کام ہے۔

## پوسٹ کریڈٹس منظر

سرمایہ کاری آ گئی۔

Series A۔ $4 ملین۔ پانچ نئے شہروں میں توسیع کرنے، engineering team کو تین گنا کرنے، اور Nimbus Instant بنانے کے لیے کافی۔

اس شام، Maya اپنے خاندان کے restaurant میں تھی۔ اصل والا۔ وہ جہاں Nimbus شروع ہوا، جب اسے احساس ہوا کہ وہ orders کھو رہے تھے کیونکہ فون ہمیشہ مصروف رہتا تھا۔

اس نے arepa order کیا — وہی dish جو وہ ہمیشہ order کرتی تھی۔

جب وہ انتظار کر رہی تھی، اس نے اپنا laptop کھولا اور اس کتاب کا پہلا باب پڑھا۔

*"ایک website کہاں رہتی ہے؟"*

اسے یاد آیا کہ وہ جواب نہیں جانتی تھی۔

وہ مسکرائی۔

اس نے laptop بند کیا۔

کھانا آ گیا۔

یہ کامل تھا۔

اگلے باب میں: کیا بدلتا ہے جب کام اب نظام بنانا نہیں رہتا — بلکہ اس کا ذمہ دار ہونا۔
