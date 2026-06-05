# باب ۱۸: جب چیزیں ٹوٹتی ہیں

یہ باب ناکامی کے بارے میں ہے — منصوبہ بندی کردہ، اس کے خلاف ڈیزائن کردہ، اور بالآخر ناگزیر کے طور پر قبول کردہ۔ یہ شاید کتاب کا سب سے اہم باب ہے۔

Nimbus اچھی طرح چل رہا تھا۔ Security layers موجود تھیں۔ Monitoring فعال تھی۔ ٹریفک بڑھ رہی تھی۔

پھر Leo کو جمعرات کی رات 11:23 پر Slack notification آئی۔

"us-east-1 Availability Zone us-east-1b — hardware failure — degraded service۔"

اس نے AWS console کھولا۔ us-east-1b میں EC2 انسٹینسز status checks میں ناکام ہو رہی تھیں۔ اس کا Auto Scaling Group غیر صحت مند انسٹینسز محسوس کر رہا تھا اور replacements spin up کر رہا تھا — us-east-1b میں۔

اس AZ میں جو ناکام ہو رہی تھی۔

نئی انسٹینسز بھی شروع نہیں ہو سکتی تھیں۔ وہ اسی hardware failure zone میں تھیں۔

"لوڈ بیلنسر دونوں AZs میں ٹریفک route کر رہا ہے،" Leo نے کہا۔ "ہماری آدھی ٹریفک ان انسٹینسز کو جا رہی ہے جو کام نہیں کرتیں۔"

اسے محسوس ہونے سے پہلے بائیس منٹ degraded service۔ اس نے ہاتھ سے ASG کو صرف us-east-1a استعمال کرنے کے لیے shift کیا۔

"یہ اس لیے ہوا کیونکہ سب کچھ ایک AZ میں تھا،" Priya نے اگلی صبح کہا۔

"نہیں،" Leo نے کہا۔ "میرے پاس دو AZs میں انسٹینسز تھیں۔ مسئلہ یہ تھا کہ replacement انسٹینسز ناکام AZ میں spawn ہو رہی تھیں۔"

"اور database؟"

Leo رک گیا۔

"RDS انسٹینس Multi-AZ ہے،" اس نے کہا۔ "Standby us-east-1b میں ہے۔ جو ناکام ہو رہی تھی۔ اور RDS نے standby پر failover کرنے کی کوشش کی، جو بھی ناکام ہوئی۔"

بائیس منٹ کی degraded service اڑتیس منٹ ہو گئی تھی۔

**Electricity Grid کی مثال**

سوچیں کہ آپ کے گھر کو بجلی کیسے ملتی ہے۔ بجلی ایک تار سے ایک generator سے نہیں آتی۔ یہ ایک grid سے آتی ہے — generators، substations، اور transmission lines کا ایک نیٹ ورک جو ایک دوسرے کو backup دیتے ہیں۔ اگر ایک substation میں آگ لگ جائے، باقی اس کے گرد بجلی re-route کر دیتے ہیں۔ آپ نوٹ نہیں کرتے۔ روشنیاں on رہتی ہیں۔

AWS Availability Zones اسی طرح کام کرتے ہیں۔ ایک بڑے data center کی بجائے جس پر سب کچھ depend کرتا ہے، AWS آپ کے resources کو متعدد جسمانی طور پر الگ الگ facilities میں پھیلاتا ہے۔ اگر ایک facility بجلی کھو دے یا hardware failure ہو، باقی چلتے رہتے ہیں۔ ٹریفک خودبخود re-route ہو جاتی ہے۔ آپ کی ایپلیکیشن up رہتی ہے — کیونکہ کبھی کوئی واحد تار نہیں تھی جسے کاٹا جا سکے۔

Multi-Region اگلا level ہے: تصور کریں بالکل مختلف شہر میں backup generators ہوں۔ اگر پورا مقامی power grid بند ہو جائے، remote شہر ذمہ اٹھا لیتا ہے۔ سیٹ اپ کرنا زیادہ پیچیدہ، لیکن catastrophic failures کے لیے زیادہ resilient۔

**ناکامی کی لغت**

Resilience ڈیزائن کرنے سے پہلے، آپ کو words چاہئیں جس کے خلاف آپ ڈیزائن کر رہے ہیں۔

**Availability**: وہ فیصد وقت جب نظام چل رہا ہو۔ "Four nines" (99.99%) کا مطلب فی سال 52 منٹ سے کم downtime ہے۔ "Five nines" (99.999%) کا مطلب تقریباً 5 منٹ فی سال ہے۔

**RTO (Recovery Time Objective)**: نظام کتنی دیر بند رہ سکتا ہے؟ اگر آپ کا RTO 4 گھنٹے ہے، تو آپ کے پاس SLAs violate ہونے سے پہلے service restore کرنے کے لیے 4 گھنٹے ہیں۔

**RPO (Recovery Point Objective)**: آپ کتنا data کھو سکتے ہیں؟ اگر آپ کا RPO 1 گھنٹہ ہے، تو آپ catastrophic failure میں آخری گھنٹے کا data کھونا برداشت کر سکتے ہیں۔

**Fault tolerance**: کوئی جزء ناکام ہونے پر بھی (کچھ سطح پر) کام جاری رکھنے کی صلاحیت۔

**Disaster recovery (DR)**: ایک catastrophic failure سے بحال ہونے کا عمل — data center آگ، region-wide outage، حادثاتی mass deletion۔

یہ پانچ تصورات اس باب کا ہر architectural فیصلہ چلاتے ہیں۔

**Multi-AZ: Availability Zone Failures سے بچنا**

ایک Availability Zone (AZ) ایک Region کے اندر ایک جسمانی طور پر الگ data center ہے۔ AZs آزاد ہونے کے لیے ڈیزائن کیے گئے ہیں: الگ بجلی کی supply، الگ cooling، الگ network infrastructure۔ لیکن وہ اتنے قریب ہیں کہ ان کے درمیان network latency 1-2 ملی سیکنڈ ہے۔

**Multi-AZ deployments** آپ کے resources کو ایک Region کے اندر دو یا زیادہ AZs میں پھیلاتی ہیں۔ اگر ایک AZ ناکام ہو:

- لوڈ بیلنسر ناکام AZ میں غیر صحت مند انسٹینسز کو ٹریفک route کرنا بند کرتا ہے
- Auto Scaling Group instances replace کرتا ہے — لیکن *صحت مند* AZ میں
- RDS صحت مند AZ میں standby پر failover کرتا ہے

Leo کی غلطی: اس کا Auto Scaling Group AZs کے درمیان توازن برقرار رکھنے کے لیے ترتیب دیا گیا تھا۔ جب us-east-1b ناکام ہوا، ASG نے us-east-1b میں replacement instances spin up کرنے کی کوشش کی — ناکام AZ۔

Fix: ASG کو صحت مند AZs میں لانچ کرنے کے لیے ترتیب دیں، کم از کم دو AZs ہمیشہ active کے ساتھ۔

گہرا سبق: پروڈکشن میں ہونے سے پہلے اپنے failure scenarios test کریں۔

**Failures کی Simulation: Chaos Engineering**

"ہم کیسے جانیں کہ ہماری Multi-AZ setup اصل میں کام کرتی ہے؟" Maya نے پوچھا۔

"ہم چیزوں کو جانتے بوجھتے توڑتے ہیں،" Leo نے کہا۔

یہ لاپروا لگتا ہے۔ یہ اصل میں سب سے ذمہ دارانہ کام ہے جو کوئی ٹیم کر سکتی ہے۔

**Chaos engineering** آپ کے نظام میں جانتے بوجھتے failures inject کرنے کی مشق ہے یہ verify کرنے کے لیے کہ یہ انہیں صحیح طریقے سے سنبھالتا ہے۔ آپ جانتے بوجھتے ایک EC2 انسٹینس terminate کرتے ہیں۔ آپ ہاتھ سے RDS انسٹینس کو failover کرتے ہیں۔ آپ لوڈ بیلنسر سے ایک subnet block کرتے ہیں۔

اگر نظام آپ کے RTO کے اندر خودبخود بحال ہو جائے، آپ کا ڈیزائن کام کرتا ہے۔

اگر نہیں، تو آپ نے یہ ایک controlled setting میں سیکھا — ایک رات 2 بجے production incident کے دوران نہیں۔

Nimbus کے لیے: Leo نے ہر failure scenario test کرنے کے لیے ایک runbook (ایک documented procedure) لکھا۔ ہر تیماہی، وہ جانتے بوجھتے ایک component fail کرتے اور recovery time measure کرتے۔ اگر recovery RTO سے زیادہ وقت لے تو، وہ ڈیزائن fix کرتے۔

**Multi-Region: Regional Failures سے بچنا**

زیادہ تر AWS failures Availability Zones کو affect کرتے ہیں، پورے Regions کو نہیں۔ Regional failures نادر ہیں — لیکن ہوتے ہیں۔

ایک regional failure (یا عالمی ایپلیکیشنز کے لیے جنہیں ہر جگہ بہت کم latency کی ضرورت ہے)، **Multi-Region** جواب ہے: اپنی ایپلیکیشن دو یا زیادہ AWS Regions میں تعینات کریں۔

Multi-Region بنیادی پیچیدگی متعارف کراتا ہے:

**Data replication**: آپ کے databases کو regions میں sync ہونا ضروری ہے۔ us-east-1 میں لکھا گیا کوئی بھی data آخرکار eu-west-1 تک پہنچنا ضروری ہے۔ "آخرکار" مسئلہ ہے — time lag کے دوران، regions کی دنیا کا قدرے مختلف view ہے۔

**Active-passive بمقابلہ active-active**:

- **Active-passive**: ایک region تمام ٹریفک پیش کرتا ہے۔ دوسرا ایک warm standby ہے۔ ناکامی پر، DNS ٹریفک کو standby کی طرف سوئچ کرتا ہے۔ آسان، لیکن standby idle اور مہنگا ہے۔
- **Active-active**: دونوں regions بیک وقت ٹریفک پیش کرتے ہیں۔ بنانا زیادہ پیچیدہ (بیک وقت writes کے لیے conflict resolution ضروری ہے)، لیکن عالمی سطح پر کم latency اور idle resources نہیں۔

**Failover time**: DNS تبدیلیوں کو propagate ہونے میں وقت لگتا ہے (TTL کے مطابق)۔ Propagation window کے دوران، کچھ صارفین پھر بھی ناکام region کو hit کرتے ہیں۔ بہت کم RTO کے لیے ڈیزائن کرنے کے لیے standby کو pre-warm کرنا اور planned switches سے پہلے TTL کم کرنا ضروری ہے۔

**Disaster Recovery Strategies: ایک Spectrum**

چار عام DR strategies ہیں، سب سے سستی (اور بحالی میں سست) سے سب سے مہنگی (اور بحالی میں تیز ترین) تک:

**Backup and Restore** (گھنٹے RPO/RTO):

- سب کچھ ایک مختلف region میں S3 میں backup کریں
- Disaster پر: infrastructure scratch سے provision کریں، backup سے restore کریں
- لاگت: بہت کم (آپ صرف storage کے لیے ادائیگی کر رہے ہیں)
- Recovery time: گھنٹے

**Pilot Light** (منٹوں سے 1 گھنٹہ RPO/RTO):

- DR region میں ایپلیکیشن کا ایک minimal version چلاتے رہیں (وہ "pilot light" جو جلدی turn up کی جا سکے)
- Core data replicated ہے (DR region میں RDS read replica)
- Disaster پر: DR region کو scale up کریں، read replica کو primary میں promote کریں، DNS switch کریں
- لاگت: moderate (آپ ایک چھوٹے running footprint کی ادائیگی کر رہے ہیں)
- Recovery time: دسیوں منٹ

**Warm Standby** (سیکنڈوں سے منٹ RPO/RTO):

- DR region میں مکمل ایپلیکیشن کا ایک scaled-down version چلائیں
- مکمل طور پر operational لیکن کم capacity پر
- Disaster پر: scale up، DNS switch کریں
- لاگت: زیادہ (ہمیشہ reduced scale پر مکمل stack چلانا)
- Recovery time: منٹ

**Active-Active / Multi-Site** (near-zero RPO/RTO):

- دو یا زیادہ regions میں بیک وقت ٹریفک پیش کرنے والی مکمل capacity
- کوئی recovery ضروری نہیں — اگر ایک region ناکام ہو، ٹریفک دوسرے کی طرف route ہو جاتی ہے
- لاگت: سب سے زیادہ (مکمل scale پر دو مکمل deployments)
- Recovery time: سیکنڈ (صرف DNS propagation)

Nimbus کے اس مرحلے پر: warm standby۔ وہ active-active afford نہیں کر سکتے تھے، لیکن backup and restore ان کی business requirements کے لیے بہت سست تھا۔

**Amazon RDS: Multi-AZ بمقابلہ Read Replicas بمقابلہ Multi-Region**

یہ تین الگ ہیں اور عام طور پر confused ہوتے ہیں:

| خصوصیت        | Multi-AZ                      | Read Replica     | Multi-Region Read Replica |
|----------------|-------------------------------|------------------|---------------------------|
| مقصد           | اعلیٰ دستیابی (failover)       | Read scaling     | Read scaling + DR         |
| Data sync      | Synchronous                   | Asynchronous     | Asynchronous              |
| Failover       | خودکار                         | ہاتھ سے promotion | ہاتھ سے promotion          |
| پڑھنے کے قابل؟ | نہیں (standby passive ہے)     | ہاں              | ہاں                        |
| Cross-region?  | نہیں (ایک ہی region)          | ہاں (اختیاری)    | ہاں                        |
| استعمال کریں   | HA، RPO~0                     | Read load        | Disaster recovery          |

اہم insight: Multi-AZ standby **synchronous** ہے — primary میں ہر write standby پر تسلیم کی جانے سے پہلے confirm ہوتا ہے۔ اس کا مطلب ہے اگر primary ناکام ہو، کوئی data ضائع نہیں ہوتا۔ RPO = 0۔

Read replicas **asynchronous** ہیں — replication lag ہے۔ اگر primary ناکام ہو اور آپ read replica promote کریں، تو آپ حالیہ writes کے سیکنڈوں یا منٹوں کھو سکتے ہیں۔ RPO > 0۔

## خوبیاں اور حدود

**Multi-AZ**:

- Production workloads کے لیے ضروری — single-AZ ناکامی کا واحد نقطہ ہے
- AWS سروسز کے ذریعے اچھی طرح سپورٹ (RDS، ElastiCache، EKS، ALB سب Multi-AZ سپورٹ کرتے ہیں)
- یہ فراہم کردہ تحفظ کے مقابلے میں نسبتاً کم لاگت overhead

**Multi-Region**:

- درست نافذ کرنا پیچیدہ، خاص طور پر databases کے لیے
- Data residency/sovereignty requirements کا مطلب دراصل یہ ضروری ہو سکتا ہے (EU user data EU میں رہنی چاہیے)
- زیادہ تر organizations کو active-active کی ضرورت نہیں؛ زیادہ تر warm standby میں under-invest کرتی ہیں

## خلاصہ

- **RTO** (Recovery Time Objective): آپ کتنی دیر بند رہ سکتے ہیں۔ **RPO** (Recovery Point Objective): آپ کتنا data کھو سکتے ہیں۔
- **Multi-AZ** ایک Region کے اندر Availability Zones میں resources پھیلاتا ہے۔ AZ failures سے بچاتا ہے۔
- **Multi-Region** متعدد AWS Regions میں تعینات کرتا ہے۔ Regional failures سے بچاتا ہے اور عالمی صارفین کو کم latency پیش کرتا ہے۔
- DR strategies (سب سے سستی سے سب سے مہنگی): Backup & Restore → Pilot Light → Warm Standby → Active-Active۔
- RDS Multi-AZ standby: synchronous، خودکار failover، RPO = 0۔ Read replicas: asynchronous، ہاتھ سے promotion، RPO > 0۔
- اپنی failures جانتے بوجھتے test کریں (chaos engineering) اس سے پہلے کہ وہ production میں ہوں۔

## امتحانی نکات

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں (ڈومین ۲، ٹاسک ۲.۲)*

- **RTO بمقابلہ RPO**: امتحان آپ کو ضروریات دے گا ("organization زیادہ سے زیادہ 1 گھنٹے downtime اور کوئی data loss برداشت نہیں کر سکتی") اور صحیح DR strategy چننے کو کہے گا۔ Map کریں: کوئی data loss = synchronous replication = Multi-AZ یا active-active۔ 1 گھنٹے downtime = backup-and-restore بہت سست ہے؛ warm standby کام کر سکتا ہے۔
- **Multi-AZ RDS بمقابلہ Read Replicas**: امتحان HA (Multi-AZ) بمقابلہ read scaling (read replicas) پوچھے گا۔ Multi-AZ standby پڑھنے کے قابل نہیں۔ Read replicas DR کے لیے primary میں promote کی جا سکتی ہیں (ہاتھ سے)۔
- **Pilot Light بمقابلہ Warm Standby**: Pilot Light میں minimal infrastructure چل رہا ہوتا ہے (صرف data replication)۔ Warm Standby میں ایک scaled-down لیکن functional ایپلیکیشن چل رہی ہوتی ہے۔ فرق یہ ہے کہ آپ کتنی جلدی scale up کر سکتے ہیں۔
- **Aurora Global Database**: multi-region active-passive کے لیے Aurora-specific خصوصیت۔ Primary region writes پیش کرتا ہے؛ secondary regions reads <1 second replication lag کے ساتھ پیش کرتے ہیں۔ Failover پر، secondary <1 منٹ میں promote ہو سکتا ہے۔ امتحانی اشارہ: "Aurora، multi-region، RTO < 1 منٹ۔"
- **AWS Backup**: EBS، RDS، DynamoDB، EFS، Storage Gateway کے لیے Centralized backup سروس۔ امتحان اسے backup-and-restore scenarios کے لیے استعمال کرتا ہے۔
- **Route 53 failover**: DR کی DNS layer۔ Primary health check ناکام → Route 53 secondary کی طرف route کرتا ہے۔ Propagation time کا مطلب یہ فوری نہیں۔

## مشقیں

**مشق ۱ — یادداشت**

RTO اور RPO کے درمیان فرق بیان کریں۔ ایک organization کا کم RTO (زیادہ دیر بند نہیں رہ سکتی) لیکن زیادہ RPO (حالیہ data کھونا برداشت کر سکتی ہے) کیوں ہو سکتا ہے؟

*(اشارہ: ایسے business کے بارے میں سوچیں جہاں ہر transaction محفوظ کرنے سے زیادہ صارفین کو جلدی پیش کرنا ضروری ہو۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک healthcare کمپنی `us-east-1` میں RDS PostgreSQL پر patient records نظام چلاتی ہے۔ Regulatory requirements مانگتی ہیں کہ patient data کبھی نہ کھوئے (RPO = 0)۔ نظام disaster میں 30 منٹ تک downtime برداشت کر سکتا ہے (RTO = 30 منٹ)۔ لاگت ایک concern ہے۔

کون سا architecture ان ضروریات کو بہترین طریقے سے پوری کرتا ہے؟

A) `us-east-1` میں RDS Multi-AZ `us-west-2` میں S3 میں روزانہ automated backups کے ساتھ  
B) ہاتھ سے promotion کے لیے ترتیب دی گئی `us-west-2` میں read replica کے ساتھ `us-east-1` میں RDS Multi-AZ  
C) Active-active replication کے ساتھ `us-west-2` میں warm standby کے ساتھ `us-east-1` میں RDS  
D) `us-east-1` میں primary اور `us-west-2` میں secondary کے ساتھ Aurora Global Database

**اشارہ ۱**: RPO = 0 کا مطلب کوئی data loss نہیں، جس کے لیے synchronous replication یا near-synchronous کی ضرورت ہے۔

**اشارہ ۲**: RTO = 30 منٹ کا مطلب ہے ہاتھ سے مداخلت کے لیے وقت ہے۔ آپ کو مکمل خودکار millisecond failover کی ضرورت نہیں۔

**اشارہ ۳**: کون سا option Multi-AZ تحفظ (region کے اندر RPO = 0) اور cross-region DR capability فراہم کرتا ہے؟

**جواب**: A

**وضاحت**: us-east-1 میں RDS Multi-AZ اسی region میں standby کے ساتھ synchronous replication فراہم کرتا ہے — AZ failures کے لیے RPO = 0۔ us-west-2 میں S3 میں روزانہ automated backups cross-region DR فراہم کرتے ہیں۔ مکمل regional failure میں، آپ us-west-2 میں S3 backup سے restore کرتے ہیں — ایک چھوٹے database کے لیے 30 منٹ کے اندر۔ یہ cost-effective ہے اور دونوں ضروریات پوری کرتا ہے۔

**B کیوں نہیں؟** Read replicas asynchronous ہیں — replication lag ہو سکتا ہے۔ اگر primary ناکام ہو، آخری replica sync کے بعد لکھا گیا data ضائع ہوتا ہے۔ RPO > 0، جو ضرورت violate کرتا ہے۔

**C کیوں نہیں؟** PostgreSQL کے لیے regions میں "Active-active replication" implement کرنا پیچیدہ ہے اور یہ ایک standard RDS خصوصیت نہیں ہے۔ یہ option technically مشکل اور مہنگا ہے۔

**D کیوں نہیں؟** Aurora Global Database کام کرے گا لیکن RDS Multi-AZ سے نمایاں طور پر زیادہ مہنگا ہے۔ منظر نامہ کہتا ہے لاگت ایک concern ہے، اور Aurora premium pricing ہے۔

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں — ٹاسک ۲.۲*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کو Seattle میں ایک بڑے food festival کے لیے ordering services فراہم کرنے کے لیے منتخب کیا گیا ہے۔ 72 گھنٹوں کے لیے، وہ 50x معمول کی ٹریفک توقع کرتے ہیں، downtime کے لیے صفر tolerance کے ساتھ (festival organizer کا contract کسی بھی downtime کے لیے financial penalties specify کرتا ہے)۔

خاص طور پر festival window کے لیے DR strategy ڈیزائن کریں۔ کیا آپ ان 72 گھنٹوں کے لیے active-active پر switch کریں گے؟ آپ failover کو pre-test کیسے کریں گے؟ آپ کا RTO کیا ہوگا، اور آپ event سے پہلے اسے کیسے validate کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد مخصوص SLA ضروریات کے لیے DR ڈیزائن کرنے کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Leo نے chaos engineering runbook بنایا۔

ہر تیماہی، ایک planned maintenance window پر، ٹیم:

1. us-east-1a میں ایک EC2 انسٹینس terminate کرتی اور ASG کو اسے صحیح طریقے سے replace کرتے دیکھتی
2. ہاتھ سے RDS Multi-AZ failover force کرتی اور verify کرتی کہ ایپلیکیشن 60 سیکنڈ کے اندر reconnect ہوئی
3. ASG کے availability zones ایڈجسٹ کر کے مکمل us-east-1b failure simulate کرتی
4. ایک ہفتہ پرانے backup کو ایک نئی RDS انسٹینس پر restore کرتی اور verify کرتی کہ data صحیح نظر آیا

پہلی بار انہوں نے اسے run کیا، step 2 میں 4 منٹ 17 سیکنڈ لگے۔

"ریستوران partners کے ساتھ ہمارا RTO commitment 5 منٹ ہے،" Tom نے کہا۔

"تو ہم پاس ہو گئے۔ بالکل مشکل سے۔"

"اگر ایک real incident میں failover 5 منٹ سے زیادہ لے تو؟"

Maya نے جواب دیا: "ہم SLA کی خلاف ورزی میں ہوں گے۔ Contracts میں financial penalty ہے۔"

Leo نے 4:17 کو اسکرین پر گھورا۔

"تو ہمیں اسے تیز کرنا ہوگا،" اس نے کہا۔ اور اس نے Aurora کی documentation پڑھنا شروع کی۔

اگلے باب میں: وہ ticket machine جو Nimbus کے ہر حصے کو اپنی رفتار سے کام کرنے دیتی ہے۔
