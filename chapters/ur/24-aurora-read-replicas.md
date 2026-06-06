# باب 24: وہ ڈیٹابیس جو آپ کے ساتھ بڑھتا ہے

ایک ایسی library کا تصور کریں جو دو shelves اور ایک librarian کے ساتھ شروع ہوئی۔ کچھ عرصے کے لیے یہ کافی تھا۔ Librarian جانتا تھا کہ ہر چیز کہاں ہے۔ Requests کا جلدی جواب دیا جاتا تھا۔ پھر library بڑھی: دس shelves، بیس، چالیس۔ وہی librarian، وہی desk، وہی card catalog۔ اب کچھ بھی ڈھونڈنے کے لیے انتظار درکار ہے۔ Librarian سست نہیں ہے — بس اتنی زیادہ library ہے کہ ایک شخص اصل رفتار پر اسے service نہیں کر سکتا۔

حل ایک تیز librarian نہیں ہے۔ یہ ایک مختلف قسم کی library ہے۔

---

S3 cost کمی کے بعد، Tom نے اپنا review جاری رکھا۔ Database tier ایک مختلف قسم کا مسئلہ تھا — غلط storage class میں idle data نہیں، بلکہ ایک ایسا نظام جو چھ ماہ کی traffic growth کے load کے تحت فعال طور پر جدوجہد کر رہا تھا۔

---

نمبر آرام دہ نہیں تھے۔

Nimbus RDS PostgreSQL چلا رہا تھا: Multi-AZ، db.r6g.large instance۔ $340/مہینہ۔

Leo نے CloudWatch metrics dashboard کھولا۔ نمبروں کا ایک pattern تھا۔

**DatabaseConnections**: جمعہ کے peak کے دوران زیادہ سے زیادہ 200 میں سے 198۔ saturation سے دو connections۔ 200 پر، نئی connection کوششیں "too many connections" کے ساتھ ناکام ہو جاتیں — ایک error جو dinner order کرنے والے customers کو HTTP 500s کے طور پر سامنے آتی۔

**CPUUtilization**: جمعہ dinner rush کے دوران 89% peak۔ Instance spikes سنبھالنے کے لیے ڈیزائن کی گئی تھی — ایک db.r6g.large کے پاس 2 vCPUs اور 16 GB memory ہے — لیکن مسلسل 89% CPU کا مطلب تھا کہ database peak گھنٹے کے آنے سے پہلے ہی capacity پر تھی۔

**ReadLatency**: 840 ملی سیکنڈ P95۔ چھ ماہ پہلے، یہ 180ms تھی۔ Degradation تدریجی رہی تھی — فی ہفتہ 10 سے 20ms — invisible جب تک یہ catastrophic نہ ہو گئی۔ Tom کے review سے ایک ہفتہ پہلے، P99 latency ایک پورے سیکنڈ کو پار کر گئی تھی۔ ایک ریستوران menu پر کلک کرنے والے customers page کے load ہونے کے لیے ایک سیکنڈ سے زیادہ انتظار کر رہے تھے۔

**FreeStorageSpace**: provisioned storage کا 18% باقی۔ موجودہ شرح نمو پر، database تقریباً 11 ہفتوں میں provisioned storage ختم کر دیتی۔

"ان میں سے ہر ایک تنہائی میں قابل حل ہے،" Leo نے dashboard دیکھتے ہوئے کہا۔ "لیکن ہمارے پاس چاروں ایک ساتھ ہیں۔"

Connection count spike نے application میں connection pooling مسائل کی نشاندہی کی — بہت زیادہ ECS tasks اپنے database connections کھولتے ہوئے۔ CPU مسئلے نے مہنگی queries کی نشاندہی کی۔ Latency مسئلہ اور CPU مسئلہ تقریباً یقینی طور پر ایک ہی مسئلہ تھے: ایک سست query جو بہت بار چل رہی تھی۔

"رکو — لیکن ہم 198 connections پر کیوں ہیں؟" Maya نے پوچھا۔ "ہمارے پاس تین ECS tasks ہیں۔ ہمارے پاس تقریباً 200 database connections کیسے ہیں؟"

ہر ECS task نے SQLAlchemy کو 5 connections کے default pool size اور 10 کے overflow کے ساتھ استعمال کیا۔ تین tasks × 15 ممکنہ connections = application سے 45 connections۔ باقی 153 analytics Lambda functions، background job workers، Glue ETL job، bastion host کے ذریعے development team کے local connections، اور کئی connections سے تھے جو کھولے گئے تھے لیکن code کے ایک پرانے version کے ذریعے صحیح طریقے سے بند نہیں کیے گئے تھے۔

"Connection count مسئلہ،" Leo نے کہا، "دراصل ایک application مسئلہ ہے جو ایک database مسئلے کی طرح نظر آتا ہے۔" اس نے PgBouncer (ایک connection pooler) task list میں شامل کیا — لیکن فوری bottleneck سست query تھی۔

Database CPU جمعہ dinner rush کے دوران 89% تک بڑھ رہا تھا۔ Read queries queue ہو رہی تھیں۔ P95 query latency چھ ماہ میں دوگنی ہو گئی تھی۔

"Database bottleneck ہے،" اس نے کہا۔ "Traffic بڑھی ہے۔ Database اس کے ساتھ scale نہیں ہوئی۔"

"کیا ہم بس instance کو بڑا کر سکتے ہیں؟" Maya نے پوچھا۔ "رکو — لیکن ہمارے پاس ایک واحد database تمام reads اور writes سنبھالتا ہوا کیوں ہے؟ ہم نے اسے شروع سے distribute کیوں نہیں کیا؟"

"ہاں،" Leo نے کہا۔ "یہ vertical scaling ہے۔ ہم r6g.large سے r6g.xlarge میں منتقل ہوتے ہیں۔ زیادہ CPU، زیادہ memory۔ یہ زیادہ خرچ کرے گا اور ہمیں وقت دلائے گا۔"

"لیکن یہ بنیادی مسئلہ fix نہیں کرتا،" Priya نے کہا۔ "بالآخر ہم سب سے بڑی instance ٹکرائیں گے اور ایک مختلف طریقے کی ضرورت ہوگی۔ اور کیا ہم نے سوچا ہے کہ کیا ہوتا ہے اگر ایک write حادثاتی طور پر ایک read replica پر جائے؟ Replica اسے reject کرتی ہے اور آرڈر خاموشی سے ناکام ہو جاتا ہے۔"

"دو طریقے ہیں،" Leo نے کہا۔ "Read replicas، یا Aurora۔"

"فرق کیا ہے؟"

"اسے ایک library کی طرح سوچو،" Leo نے ایک marker پکڑتے ہوئے کہا۔ "ایک librarian جو books دونوں check in کرتا ہے اور patron سوالات کا جواب دیتا ہے۔ جب library مشہور ہو جاتی ہے، ایک queue بن جاتا ہے۔ Fix: مزید librarians رکھیں — لیکن صرف سوالات کے جواب کے لیے۔ Check-in اب بھی اصل desk سے گزرتا ہے۔"

"یہ ایک read replica ہے،" Priya نے کہا۔

"بالکل۔ Aurora ایک قدم آگے جاتا ہے — یہ خود shelving system کو دوبارہ ڈیزائن کرتا ہے تاکہ ہر librarian وہی shelves شیئر کرے اور ہمیشہ وہی books دیکھے، بغیر کسی تاخیر کے۔ updates کے ایک desk سے دوسرے تک پہنچنے کا کوئی انتظار نہیں۔"

**Read Replicas: Read Traffic کی تقسیم**

زیادہ تر web applications data کو لکھنے سے کہیں زیادہ بار پڑھتی ہیں۔ menu browse کرنے والا ایک customer درجنوں SELECT queries کرتا ہے۔ ایک آرڈر دینا چند INSERT/UPDATE queries کرتا ہے۔ تناسب عام طور پر 10:1 یا زیادہ ہوتا ہے۔

ایک **read replica** ایک اضافی RDS instance ہے جو primary سے تمام writes کی ایک copy وصول کرتی ہے اور ان writes کو SELECT queries کے لیے دستیاب بناتی ہے۔

یہ کیسے کام کرتا ہے:

1. Application writes (INSERT، UPDATE، DELETE) primary database کو جاتے ہیں
2. Primary ان تبدیلیوں کو read replicas میں asynchronously replicate کرتا ہے
3. Application reads (SELECT) read replicas میں distribute کیے جاتے ہیں
4. Read replicas load شیئر کرتی ہیں — ہر ایک کل read traffic کا ایک حصہ سنبھالتی ہے

نتیجہ: primary database صرف writes سنبھالتا ہے (اور اختیاری طور پر کچھ reads)۔ Read replicas read load سنبھالتی ہیں۔ ایک 10:1 read/write تناسب کے لیے، ایک read replica شامل کرنا primary کے کل load کو تقریباً آدھا کر دیتا ہے۔

**اہم حد**: Replication **asynchronous** ہے۔ Replication lag ہوتا ہے — عام طور پر ملی سیکنڈ، لیکن load کے تحت سیکنڈ ہو سکتا ہے۔ ایک replica سے ایک read ایسا data دیکھ سکتی ہے جو primary سے قدرے پیچھے ہے۔ زیادہ تر reads کے لیے (menu browse کرنا، order history دیکھنا)، یہ قابل قبول ہے۔ "کیا میرا آرڈر ابھی ہوا؟" کے لیے — primary سے پڑھیں۔

**Read Replicas: تفصیلات**

- آپ فی primary RDS instance 15 read replicas تک رکھ سکتے ہیں (MySQL، PostgreSQL، MariaDB)
- Read replicas ایک ہی region میں یا ایک مختلف region میں ہو سکتی ہیں (cross-region replicas)
- Read replicas کی خود اپنی read replicas ہو سکتی ہیں (chaining)
- Read replicas علیحدہ endpoints ہیں — آپ کی application کو reads replica endpoint کی طرف بھیجنا ضروری ہے
- Read replicas کو standalone databases میں promote کیا جا سکتا ہے (DR کے لیے مفید)

Nimbus کے لیے، Leo نے ایک read replica شامل کی۔ "یہ ٹھیک رہے گا،" اس نے کہا جب Priya نے پوچھا کہ کیا اس نے traffic switch کرنے سے پہلے application کی read/write routing logic test کی تھی۔ اس نے نہیں کی تھی۔ اس نے اگلے چالیس منٹ یہ verify کرنے میں گزارے کہ writes read replica endpoint کو نہیں جا رہے۔

اس نے application کو اپڈیٹ کیا:

- Write operations → primary endpoint
- Menu browsing، order history → replica endpoint

Primary پر CPU peak پر 89% سے 41% گر گیا۔

**Read-After-Write Consistency کا مسئلہ**

read replica فعال کرنے کے تین دن بعد، ایک support ticket آیا۔ ایک ریستوران partner نے اپنا menu اپڈیٹ کیا تھا — ایک بند کر دیا گیا item ہٹایا — اور پھر اس کے ہٹائے جانے کی تصدیق کرنے کے لیے call کیا۔ Customer service agent نے Nimbus interface سے menu کھولا۔ Item اب بھی وہاں تھا۔

بیس سیکنڈ بعد، یہ غائب ہو گیا۔

Asynchronous replication lag۔ Write (DELETE menu item) primary کو گیا۔ Customer service agent کا read replica کو گیا، جسے ابھی تبدیلی موصول نہیں ہوئی تھی۔ Replica اس لمحے 15 سیکنڈ پیچھے تھی — غیر معمولی نہیں، لیکن visible۔

"اور اگر کوئی eventual consistency window کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "یا بس — کیا ہو اگر ایک ایسے menu item کے لیے آرڈر دیا جائے جو ابھی delete کیا گیا تھا؟ ہم customer سے charge کرتے اور ریستوران کے پاس item نہ ہوتا۔"

یہ ایک حقیقی consistency تشویش تھی، صرف ایک UX پریشانی نہیں۔

حل: شناخت کریں کہ کن reads کی consistency requirements ہیں اور انہیں primary کی طرف route کریں۔

**وہ reads جو replica کو جا سکتے ہیں** (eventual consistency ٹھیک ہے):
- Customer کا ایک ریستوران کا menu browse کرنا (1-2 سیکنڈ تک پرانا ناقابل ادراک ہے)
- Order history queries (ایک user اپنی ایک منٹ پہلے کی order history دیکھ رہا ہے)
- Analytics-قسم کے reads (اس ہفتے کے سرفہرست ریستوران)

**وہ reads جنہیں primary کو جانا ضروری ہے** (read-after-write consistency درکار):
- ایک write کے فوراً بعد، جب application کو تصدیق کرنی ہو کہ write کامیاب ہوا
- آرڈر دینے کے فوراً بعد order status reads
- ریستوران management interface کے ذریعے trigger ہونے والے menu reads (ریستوران نے ابھی menu تبدیل کیا)

Application نے database connection layer میں ایک routing hint شامل کیا: اگر request ریستوران management dashboard سے آئی، primary کی طرف route کریں۔ اگر یہ ایک browse کرتے customer سے آئی، replica کی طرف route کریں۔ `X-Read-Consistency: strong` HTTP header signal کے طور پر کام آیا۔

"یہ اتنا مشکل نہیں ہے،" Leo نے کہا۔ "آپ کو بس جاننا ہوگا کہ کن reads کو اس کی ضرورت ہے۔"

"اور اسے document کریں،" Priya نے کہا۔ "تاکہ اگلا شخص جو ایک نیا endpoint شامل کرتا ہے جانے کہ کون سا pool استعمال کرنا ہے۔"

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے پوچھا۔ یہ کسی بھی نئی service کے لیے اس کا معیاری افتتاحی سوال تھا۔

اسی instance type کی ایک read replica primary جتنی ہی لاگت آتی ہے۔ $340/مہینہ سے $680/مہینہ تک۔

"ہم نے load کو تقریباً آدھا کرنے کے لیے لاگت دوگنی کر دی،" Tom نے کہا۔

"ہاں۔ لیکن متبادل ایک بڑی instance type میں منتقل ہونا تھا، جو بھی زیادہ خرچ کرتا اور read load distribute نہ کرتا۔"

Tom نے ریاضی کی۔ اس نے ہچکچاتے ہوئے سر ہلایا۔

"کیا ہو اگر primary ناکام ہو جائے؟" Maya نے پوچھا، اس سے پہلے کہ Tom Aurora کی طرف pivot کر سکے۔ "read replica کا کیا ہوتا ہے؟"

Leo نے replica promotion کی وضاحت کی۔

**اگر primary RDS instance ناکام ہو جائے**، AWS خودبخود Multi-AZ configuration میں standby replica پر failover کرتا ہے (ایک مختلف قسم کی replica — ایک synchronous standby، read replica نہیں)۔ Multi-AZ standby نیا primary بن جاتا ہے۔ Read replicas reads serve کرتی رہتی ہیں، اب نئے primary سے replicate کرتے ہوئے۔ application کے نقطہ نظر سے، primary endpoint DNS سابق standby کی طرف اشارہ کرنے کے لیے بدل جاتا ہے، اور application دوبارہ connect ہوتی ہے۔

Failover RDS PostgreSQL کے لیے عام طور پر 60-120 سیکنڈ لیتا ہے۔ اس window کے دوران، writes ناکام ہوتے ہیں۔

**Read replica promotion** ایک علیحدہ operation ہے — اور ایک علیحدہ منظر نامہ۔ اگر آپ ایک read replica لے کر اسے ایک آزاد، قابل تحریر database بنانا چاہتے ہیں (DR کے لیے، ایک نئے region میں migration کے لیے، یا کیونکہ primary چلا گیا ہے اور آپ کو Multi-AZ failover کا انتظار کرنے کے بجائے promote کرنا ہے)، آپ ایک read replica کو ایک standalone primary میں promote کر سکتے ہیں۔ Promotion چند منٹ لیتا ہے، جس کے بعد replica اصل primary سے replicate نہیں کر رہی — یہ اپنی خود کی database ہے۔

"کیا ہم نے سوچا ہے کہ کیا ہوتا ہے اگر us-west-2 primary مکمل طور پر بند ہو جائے؟" Priya نے پوچھا۔ "صرف Multi-AZ standby پر ایک failover نہیں — پورا region۔"

"اگر region ناکام ہو،" Leo نے کہا، "Multi-AZ standby بھی us-west-2 میں ہے۔ دونوں ایک ساتھ ناکام ہوتے ہیں۔"

"تو ایک حقیقی regional DR منظر نامے کے لیے،" Tom نے کہا، "ہمیں us-east-1 میں ایک read replica چاہیے جسے ہم promote کر سکیں۔"

"ہاں۔ ایک cross-region read replica۔ ہمارے پاس ابھی ایک نہیں ہے۔"

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے پوچھا۔ وہ پہلے سے جانتا تھا کہ جواب میں ایک فیصلہ شامل ہوگا۔

us-east-1 میں ایک db.r6g.large کی cross-region read replica: $340/مہینہ (ایک ہی instance لاگت)۔ علاوہ replication کے لیے cross-region data transfer: Nimbus کے write volume پر کم سے کم۔ کل: ایک DR replica کے لیے تقریباً $350/مہینہ۔

"یہ سالانہ $4,200 ہے،" Tom نے کہا، "ایک ایسے منظر نامے سے بچاؤ کے لیے جو دس سالوں میں AWS regions کو پانچ بار سے کم ہوا ہے۔"

"اور ایک regional event کے دوران Nimbus کے 24 گھنٹے بند رہنے کی لاگت کیا ہے؟" Priya نے پوچھا۔

Tom نے حساب لگایا۔ اس نے بلند آواز سے جواب نہیں دیا۔ لیکن اس نے DR backlog میں "cross-region read replica" شامل کیا۔

"Aurora کیا ہے؟" اس نے پوچھا۔

**Amazon Aurora: Database Engine کو نئے سرے سے سوچنا**

Aurora AWS کا proprietary relational database engine ہے، MySQL اور PostgreSQL کے ساتھ ہم آہنگ۔ یہ بنیادوں سے cloud workloads کے لیے ڈیزائن کیا گیا تھا، یہ دوبارہ تصور کرتے ہوئے کہ ایک relational database کی storage layer کیسے کام کرتی ہے۔

ایک روایتی RDS setup (MySQL، PostgreSQL) میں، storage اور compute تنگ طور پر coupled ہیں۔ Database engine data files manage کرتا ہے۔ Replication data کو primary سے replica میں copy کرتا ہے۔ Replica کو ہر write operation دوبارہ کرنا ضروری ہے۔

یہ replication speed پر ایک ceiling پیدا کرتا ہے: ایک replica writes کو صرف اتنی تیزی سے لاگو کر سکتی ہے جتنی تیزی سے یہ replication log process کر سکتی ہے۔ ایک write-heavy دور کے دوران — ایک bulk import، ایک flash sale، ایک batch update — replica پیچھے رہ سکتی ہے۔ Replication lag implementation میں کوئی خامی نہیں ہے؛ یہ architecture کا ایک نتیجہ ہے۔

Priya نے یہ فوراً نشان زد کیا تھا جب Leo نے read replicas تجویز کیں۔ "اور کیا ہم نے سوچا ہے کہ کیا ہوتا ہے اگر replication lag جمعہ rush کے دوران 30 سیکنڈ تک بڑھ جائے؟ Replica 30 سیکنڈ پیچھے ہے۔ ایک customer ایک آرڈر دیتا ہے، kitchen slot primary میں reserve ہوتا ہے، لیکن replica کو query کرنے والا ایک دوسرا customer reservation نہیں دیکھتا۔ دو آرڈرز، ایک slot۔"

"یہ ایک inventory consistency مسئلہ ہے،" Leo نے کہا۔

"یہ بالکل ایک inventory consistency مسئلہ ہے،" Priya نے تصدیق کی۔ "یہی وجہ ہے کہ inventory reads — 'کیا یہ item ابھی بھی دستیاب ہے؟' — primary کو جانا ضروری ہے۔"

Aurora کی architecture lag کو براہ راست address کرتی ہے۔

Aurora storage کو compute سے الگ کرتا ہے۔ یہ ایک distributed، fault-tolerant storage layer استعمال کرتا ہے جو data کو خودبخود تین Availability Zones میں چھ copies میں replicate کرتی ہے۔ Compute layer (database instances) اس storage layer کے اوپر بیٹھتی ہے۔

**یہ کیا بدلتا ہے**:

**Read replicas**: Aurora replicas کو data replicate کرنے کی ضرورت نہیں — وہ پہلے ہی وہی storage layer شیئر کرتی ہیں۔ اس کا مطلب ہے:

- 15 تک Aurora Replicas جو storage volume شیئر کرتی ہیں (عام RDS بھی 15 read replicas تک کی اجازت دیتا ہے، لیکن ہر ایک ایک مکمل data copy ہے)
- Replication lag عام طور پر 100 ملی سیکنڈ سے کم (بمقابلہ load کے تحت RDS کے لیے سیکنڈ)
- Replicas کو 30 سیکنڈ سے کم میں primary میں promote کیا جا سکتا ہے (بمقابلہ منٹ)

**Failover**: کیونکہ replicas storage شیئر کرتی ہیں، failover بہت تیز ہے — promotion میں data transfer شامل نہیں، بس writes کو redirect کرنا۔

**Storage**: Aurora خودبخود 10GB increments میں storage scale کرتا ہے، 128 TiB تک (حالیہ engine versions میں 256 TiB)۔ آپ کبھی پیشگی storage provision نہیں کرتے۔

**Performance**: Aurora مساوی instance types کے لیے معیاری MySQL کا 5x throughput اور معیاری PostgreSQL کا 3x دعویٰ کرتا ہے۔

آپ شاید سوچ رہے ہوں: اگر تمام replicas وہی storage شیئر کرتی ہیں، تو کیا وہ storage ناکامی کا واحد نقطہ نہیں بن جاتی؟ Aurora کی storage layer data کو خودبخود تین Availability Zones میں چھ copies میں replicate کرتی ہے۔ Storage خود کسی بھی single RDS Multi-AZ setup سے زیادہ resilient ہے — یہ ایک پورے AZ کے نقصان سے صفر data loss کے ساتھ اور بغیر failover کے بچنے کے لیے ڈیزائن کیا گیا ہے۔

ایک دوسرا عام سوال: اگر Aurora MySQL/PostgreSQL ہم آہنگ ہے، تو کیا آپ application code تبدیل کیے بغیر RDS PostgreSQL سے Aurora PostgreSQL میں منتقل ہو سکتے ہیں؟ تقریباً۔ Aurora PostgreSQL compatibility کا مطلب ہے کہ Aurora PostgreSQL wire protocol نافذ کرتا ہے اور PostgreSQL SQL syntax اور features کی بھاری اکثریت کو سپورٹ کرتا ہے۔ زیادہ تر applications صفر code تبدیلیوں کے ساتھ منتقل ہوتی ہیں۔ Edge cases: PostgreSQL extensions کی ایک چھوٹی تعداد Aurora پر دستیاب نہیں، کچھ system catalog queries مختلف values واپس کرتی ہیں، اور بعض administrative operations مختلف ہیں۔ Production migrations کے لیے، writes switch کرنے سے پہلے parallel read traffic کے ساتھ test کریں۔

Nimbus کے لیے، RDS PostgreSQL سے Aurora PostgreSQL میں migration ایک دوپہر لگی۔ Application نے Aurora endpoint کی طرف اشارہ کیا۔ menu query — Leo کے وہ index شامل کرنے کے بعد جسے Performance Insights نے database load کے سرفہرست استعمال کنندہ کے طور پر نشاندہی کی تھی — 620ms کے بجائے 4ms میں چلی۔ Connection pool نے اب 200 میں سے 198 نہیں ٹکرایا۔ P95 latency 28ms تک گر گئی۔

"یہ ایک مختلف database engine ہے،" Leo نے کہا، "جسے application ایک ہی database engine سمجھتی ہے۔"

"اور دلچسپ حصہ؟" Maya نے پوچھا۔

"تیز database cloning۔"

"نوٹ کیا،" Sam نے کمرے کے دوسری طرف سے خاموشی سے کہا، پہلے ہی typing کرتے ہوئے۔ Sam ایک backend engineer تھا جو چند ہفتے پہلے ٹیم میں شامل ہوا تھا تاکہ کچھ database کام Leo کی plate سے لے۔ کسی نے نہیں پوچھا کہ وہ کیا کر رہا تھا۔

**Aurora Pricing: Tom کا سوال**

Aurora pricing RDS سے مختلف ہے:

**Instance pricing**: type کے لحاظ سے RDS instance pricing کے مشابہ۔

**Storage pricing**: $0.10 فی GB فی مہینہ (آپ اسٹور کیے گئے کے لیے ادائیگی کرتے ہیں، خودبخود scaled)۔

**I/O pricing**: Aurora فی I/O request (storage کو read/write) charge کرتا ہے۔ یہ write-heavy workloads کے لیے نمایاں ہو سکتا ہے۔

"رکو،" Tom نے کہا۔ "ہم I/O کے لیے علیحدہ ادائیگی کر رہے ہیں؟"

"Aurora Serverless v2 اور Aurora I/O-Optimized اس pricing model کو بدلتے ہیں،" Leo نے کہا۔ "Aurora I/O-Optimized کوئی I/O fee charge نہیں کرتا لیکن ایک زیادہ storage اور instance قیمت۔ I/O-heavy workloads کے لیے بہتر۔"

Tom نے trade-off دیکھا۔ Nimbus کے لیے، جو read-heavy تھا (بہت سی menu queries، چند writes)، Aurora I/O-Optimized زیادہ خرچ کر سکتا تھا۔ معیاری Aurora pricing مناسب ہو سکتی تھی۔

ایک مفید heuristic: اگر آپ کے I/O charges آپ کے کل Aurora bill کے تقریباً 25% سے تجاوز کریں، I/O-Optimized ممکنہ طور پر سستا ہے۔ Nimbus کے read-heavy workload کے لیے، I/O charges کم تھے — معیاری pricing لاگو ہوتی ہے۔ ایک event logging system جیسے write-heavy workload کے لیے، I/O-Optimized لاگتیں نمایاں طور پر کم کر سکتا ہے۔

یہ ایک حقیقی cost فیصلہ ہے جو senior engineers کرتے ہیں: صحیح طریقے سے منتخب کرنے کے لیے آپ کو اپنے workload کے I/O patterns جاننے کی ضرورت ہے۔

اگر آپ کا workload چھوٹا، مستحکم، اور قابل پیش گوئی ہے، RDS PostgreSQL آسان اور معنی خیز طور پر سستا ہے — لیکن اگر آپ کی traffic غیر متوقع ہے، آپ کا data volume اس سے بڑھ رہا ہے جسے آپ پیشگی provision کر سکتے ہیں، یا آپ کو 30 سیکنڈ سے کم میں خودکار failover چاہیے، Aurora کا shared storage model زیادہ base cost کو جائز ٹھہراتا ہے۔

**Aurora Serverless: Instances کے بارے میں سوچے بغیر Scaling**

**Aurora Serverless v2** ایک configuration ہے جو اصل database load کی بنیاد پر compute capacity کو خودبخود scale کرتی ہے۔ ایک مقررہ instance size (db.r6g.large) منتخب کرنے کے بجائے، آپ Aurora Capacity Units (ACUs) میں ایک minimum اور maximum capacity سیٹ کرتے ہیں۔

Aurora Serverless v2:

- load بڑھنے پر سیکنڈوں میں scale up ہوتا ہے
- idle ادوار کے دوران scale down ہوتا ہے — اور 2024 کے آخر سے، جب کوئی connections نہ ہوں تو پورے 0 ACUs تک auto-pause ہو سکتا ہے (resume میں ~15 سیکنڈ لگتے ہیں؛ auto-pause RDS Proxy یا دیگر connection-holding proxies کے ساتھ کام نہیں کرتا)
- لاگت: $0.12 فی ACU-hour (علاوہ storage اور I/O)

متغیر traffic والے workloads کے لیے — Nimbus کے جمعہ spikes بمقابلہ پیر کی صبح کی خاموشی — Serverless v2 off-peak ادوار کے دوران لاگتیں کم کرتا ہے اور peaks کو بغیر pre-provisioning کے سنبھالتا ہے۔

"تو جمعہ spike کے دوران،" Leo نے کہا، "Aurora خودبخود scale up ہوتا ہے۔ اتوار کی صبح جب ہمارے پاس تقریباً کوئی traffic نہ ہو، یہ واپس minimum تک scale down ہو جاتا ہے۔"

"اور ہم صرف اس capacity کے لیے ادائیگی کرتے ہیں جو ہم استعمال کر رہے ہیں،" Tom نے کہا۔

"درست۔"

Aurora Serverless v2 پر ایک مہینے کے بعد، Leo نے پچھلے ہفتے کے لیے ACU (Aurora Capacity Unit) graph کھولا۔

Graph نے دو الگ patterns دکھائے۔ ہفتے کے دوران، database 2-4 ACUs پر چلی — background queries، ECS health checks، Glue ETL jobs، اور development testing کی ایک پُرسکون گونج۔ جمعہ کی شام 18:00 اور 22:00 کے درمیان، ACU count چڑھ گیا:

```
Friday 18:00  → 6 ACUs
Friday 19:00  → 14 ACUs
Friday 19:45  → 26 ACUs  (peak — pizza orders spike before NFL kickoff)
Friday 20:30  → 18 ACUs
Friday 21:00  → 12 ACUs
Friday 22:30  → 4 ACUs
Saturday 02:00 → 2 ACUs  (minimum)
```

Scaling تقریباً فوری تھی — Aurora Serverless v2 0.5 ACUs کے increments میں scale کرتا ہے، اور یہ ایک نئی RDS instance provision کرنے کے لیے درکار منٹوں کے بجائے سیکنڈوں میں capacity شامل کر سکتا ہے۔

"اس جمعہ peak کی کتنی لاگت آئی؟" Tom نے پوچھا۔

$0.12 فی ACU-hour پر: جمعہ peak 4 گھنٹے اوسطاً 18 ACUs تھا → peak دور کے لیے $8.64۔ باقی ہفتہ 3 ACUs اوسط × 164 گھنٹے × $0.12 = $59.04۔ ہفتے کے لیے کل: $67.68۔

جمعہ peak سنبھالنے کے لیے مساوی provisioned instance (db.r6g.xlarge، 4 vCPUs، 32 GB) کی لاگت $0.937/گھنٹہ × 168 گھنٹے = **ہفتے کے لیے $157.42** — چاہے جمعہ کا peak کبھی realize ہو یا نہ ہو۔

"Serverless v2 ہفتے کے لیے $67 ہے۔ peak کے لیے sized ایک provisioned instance $157 ہے،" Tom نے کہا۔ "یہ 57% کمی ہے۔"

"ایک ایسی database پر جو جائز طور پر جمعہ کو چار گھنٹے 26 ACUs اور باقی ہفتے 2 ACUs استعمال کرتی ہے،" Leo نے کہا۔ "اگر آپ کی database پورے ہفتے مسلسل high load پر چلتی ہے، ایک provisioned instance سستا ہے۔ بچت variability سے آتی ہے۔"

Tom نے آہستہ سر ہلایا۔ وہ اسے اپنے notes میں ایک pattern میں شامل کر رہا تھا: اس سہ ماہی کی ہر بچت کہانی کی ایک ہی شکل تھی۔ آپ اس کے لیے ادائیگی کرتے ہیں جو آپ استعمال کرتے ہیں، اس کے لیے نہیں جس کی آپ کو ضرورت ہو سکتی ہے۔ S3 lifecycle policies نے صرف اس storage class کے لیے ادائیگی کی جس کا ہر object مستحق تھا۔ Lambda نے صرف invocation time کے لیے ادائیگی کی۔ Fargate نے صرف task CPU اور memory کے لیے ادائیگی کی۔ Aurora Serverless v2 نے صرف ان ACUs کے لیے ادائیگی کی جو database نے دراصل استعمال کیے۔

Tom کے چہرے پر کسی ایسے شخص کا تاثر تھا جسے بالکل وہی ملا تھا جس کی وہ تلاش کر رہا تھا۔

**ایک برے Migration سے بحالی: Clones، PITR، اور Undo Button**

Aurora میں منتقل ہونے کے دو ہفتے بعد، Sam نے production میں ایک database migration script چلائی۔ Script کو `menu_items` table سے `legacy_menu_format` column ہٹانا تھا۔ اس نے اسے اس WHERE clause کے بغیر چلایا جو اس کے خیال میں اس نے شامل کیا تھا۔

نتیجہ ایک column ہٹانا نہیں تھا۔ یہ ایک DELETE statement تھا جس نے `menu_items` table سے 40,000 rows صاف کر دیے — تقریباً 200 ریستورانوں کے menu data کے برابر، چلا گیا۔

Alert 30 سیکنڈ کے اندر فائر ہوا۔ Order failures بڑھ گئیں۔ Menu service نے 200 ریستورانوں کے لیے خالی نتائج واپس کرنا شروع کر دیے۔

"اس میں ایک WHERE clause ہونا چاہیے تھا،" Sam نے console کو گھورتے ہوئے کہا۔

روایتی recovery راستہ: سب سے حالیہ خودکار backup snapshot سے restore کریں۔ خودکار backups ہر 24 گھنٹے میں ایک بار چلتے ہیں، اور ایک مکمل restore-and-swap میں 20-40 منٹ لگیں گے — جس کے دوران *تمام* ریستوران تاریک ہو جاتے، صرف متاثرہ 200 نہیں — اور backup کے بعد سے دیا گیا ہر آرڈر کھو جاتا۔

Leo نے یہ نہیں کیا۔ معیاری RDS کی طرح، Aurora **point-in-time recovery (PITR)** کے لیے مسلسل backups رکھتا ہے — آپ cluster کو backup retention window کے اندر کسی بھی سیکنڈ تک restore کر سکتے ہیں، صرف آخری nightly snapshot تک نہیں۔ اور اہم طور پر، restore ایک *نیا* cluster بناتا ہے؛ جب آپ recover کرتے ہیں production up رہتا ہے۔

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

Timestamp: 15:42:00Z — Sam کے migration script چلانے سے چار منٹ پہلے۔ جب recovery cluster spin up ہوا، باقی production غیر متاثرہ ریستورانوں کو serve کرتا رہا۔ ایک بار جب یہ دستیاب ہوا، Leo نے recovery cluster سے 200 متاثرہ ریستورانوں کے لیے `menu_items` rows dump کیے اور انہیں واپس production میں insert کیا۔ alert سے مکمل طور پر بحال menus تک کل وقت: 40 منٹ سے کچھ کم — اور کیونکہ اس نے پوری database swap کرنے کے بجائے rows کو جراحی طور پر مرمت کیا، 15:42 کے بعد دیا گیا کوئی آرڈر نہیں کھویا۔ Recovery cluster بعد میں delete کر دیا گیا؛ اس نے اپنا مقصد پورا کر دیا تھا۔

"ہم نے کیا کھویا؟" Maya نے پوچھا۔

مختصر طور پر خالی menus کے خلاف دیے گئے چھ آرڈرز checkout پر ناکام ہو گئے تھے — وہ سب SQS queue میں تھے اور replay کیے جا سکتے تھے۔ کوئی customer data مستقل طور پر نہیں کھویا۔

"اور یہاں **تیز database cloning** آتی ہے،" Leo نے بعد میں ٹیم کو اکٹھا کرتے ہوئے کہا۔ Aurora ایک cluster کا ایک **clone** منٹوں میں بنا سکتا ہے، database size سے قطع نظر، copy-on-write استعمال کرتے ہوئے: clone اصل کی storage layer شیئر کرتا ہے اور صرف نئے یا تبدیل شدہ pages اضافی space استعمال کرتے ہیں۔ موجودہ production database کا ایک clone سستا، تیز، اور مکمل طور پر isolated ہے؛ clone کو writes کبھی production کو نہیں چھوتے۔

"جس کا مطلب ہے،" Priya نے Sam کو دیکھتے ہوئے کہا، "migration script production میں چلنے سے پہلے production data کے ایک clone کے خلاف test ہوتی ہے۔ یہ نیا اصول ہے۔"

Sam نے سر ہلایا۔ اس نے پہلے ہی اسے ایک sticky note پر لکھ دیا تھا۔

ایک اور tool اس تصویر سے تعلق رکھتا ہے۔ Aurora MySQL — Aurora PostgreSQL نہیں — کے پاس **Aurora Backtrack** ہے: ایک feature جو cluster کو ایک مخصوص نقطہ وقت تک *اپنی جگہ پر* rewind کرتا ہے، بالکل ایک نئے cluster میں restore کیے بغیر۔ اگر Nimbus کا cluster Aurora MySQL ہوتا، Leo اسے تین منٹ سے کم میں 15:42 تک backtrack کر سکتا تھا — اگرچہ پورے cluster کو rewind کرنا deletion کے بعد لکھے گئے مٹھی بھر جائز آرڈرز کو بھی واپس roll کر دیتا، جنہیں جراحی PITR طریقے نے محفوظ رکھا۔

"اور اگر کوئی Backtrack — یا ایک point-in-time restore — استعمال کر کے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "کیا ایک attacker audit logs یا compliance data rewind کر سکتا ہے؟"

Backtrack کو `rds:BacktrackDBCluster` API permission درکار ہے، اور restores کو `rds:RestoreDBClusterToPointInTime` درکار ہے — عام database operations سے علیحدہ IAM actions۔ معیاری application roles کے پاس یہ permissions نہیں ہیں۔ صرف operations team، انہیں اجازت دینے والی واضح IAM policy کے ساتھ، انہیں استعمال کر سکتی تھی۔ اس نے اسے IAM permissions review checklist میں شامل کیا۔

اہم احتیاطیں: Aurora Backtrack صرف Aurora MySQL-ہم آہنگ clusters کے لیے دستیاب ہے، PostgreSQL کے لیے نہیں۔ Backtrack window cluster creation پر configure کیا جاتا ہے (1 گھنٹہ سے 72 گھنٹے، backtrack window کے فی گھنٹہ charges)۔ اور Backtrack پورے cluster کو متاثر کرتا ہے — آپ ایک table یا rows کے ایک سیٹ کو Backtrack نہیں کر سکتے۔ جراحی row-level recovery کے لیے — کسی بھی engine پر — Leo کا استعمال کردہ PITR-to-a-temporary-cluster طریقہ tool ہے۔

**Aurora Global Database: Multi-Region Reads**

**Aurora Global Database** Aurora کو متعدد AWS regions میں پھیلاتا ہے:

- **ایک primary region** تمام writes سنبھالتا ہے
- **پانچ تک secondary regions** عام طور پر <1 سیکنڈ replication lag کے ساتھ reads serve کرتے ہیں
- Secondary regions کو 1 منٹ سے کم میں primary میں promote کیا جا سکتا ہے (DR scenarios کے لیے)

Nimbus کی عالمی توسیع کے لیے، Aurora Global Database ایک London میں ریستوران partner کو EU read replica سے اپنا مقامی menu query کرنے دیتا، جبکہ تمام آرڈرز (writes) اب بھی US primary سے گزرتے۔

**RDS بمقابلہ Aurora: ہر ایک کب منتخب کریں**

| عنصر              | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| لاگت              | چھوٹے workloads کے لیے کم      | زیادہ base، لیکن بہتر scale کرتا ہے                          |
| Compatibility     | مکمل                          | MySQL/PostgreSQL ہم آہنگ (معمولی اختلافات کے ساتھ)          |
| Max replicas      | 15 (ہر ایک ایک مکمل data copy)| 15 (shared storage volume)                                 |
| Replica lag       | سیکنڈ ہو سکتا ہے              | عام طور پر <100ms                                          |
| Storage           | مقررہ provisioning            | 128 TiB تک auto-scale (حالیہ versions میں 256 TiB)         |
| Failover time     | 60-120 سیکنڈ                  | <30 سیکنڈ                                                  |
| Serverless option | محدود                         | Aurora Serverless v2                                       |
| کے لیے بہترین      | مستحکم، قابل پیش گوئی workloads| متغیر traffic، high read volume، تیز failover کی ضرورت     |

**Relational سے آگے: Purpose-Built خاندان**

باب 9 نے DocumentDB (MongoDB-ہم آہنگ documents)، Neptune (graph relationships)، اور Keyspaces (Cassandra-ہم آہنگ wide-column) متعارف کرائے، اور باب 10 نے MemoryDB (durable Redis-ہم آہنگ primary database) متعارف کرایا۔ دو مزید نام خاندان کو مکمل کرتے ہیں — آپ کو ان پر گہرائی کی ضرورت نہیں، بس یہ پہچاننے کی صلاحیت کہ کون سی data shape کس engine کی طرف اشارہ کرتی ہے، کیونکہ وہ مسلسل answer options کے طور پر ظاہر ہوتے ہیں:

- **Amazon Timestream**: **time-series** data — sensor readings، metrics، telemetry۔ امتحانی signal: "وقت کے ساتھ IoT measurements۔" (حقیقی دنیا میں موجودہ offering Timestream for InfluxDB ہے؛ اصل "LiveAnalytics" flavor 2025 میں نئے customers کے لیے بند ہو گیا۔)
- **Amazon QLDB**: آپ اب بھی اس سے پرانے سوالات میں "immutable، cryptographically verifiable ledger" کے طور پر مل سکتے ہیں۔ AWS نے 2025 میں QLDB بند کر دیا (بجائے Aurora PostgreSQL کی سفارش کرتے ہوئے) — اسے ایک legacy distractor کے طور پر سمجھیں، ایک building block نہیں۔

whiteboard پر لکھنے کے قابل اصول: **relational rows → RDS/Aurora؛ key-value at scale → DynamoDB؛ documents → DocumentDB؛ relationships → Neptune؛ time → Timestream؛ Cassandra → Keyspaces؛ durable Redis → MemoryDB۔** Shape سے match کریں، اور سوال خود جواب دیتا ہے۔

## خوبیاں اور حدود

**Aurora کی خوبیاں**:

- معیاری RDS سے نمایاں طور پر تیز failover
- کم سے کم lag کے ساتھ 15 read replicas تک
- Auto-scaling storage
- متغیر workloads کے لیے Serverless v2
- Multi-region deployment کے لیے Global Database

**Aurora کی حدود**:

- چھوٹے، مستحکم workloads کے لیے زیادہ لاگت
- I/O pricing write-heavy workloads کے لیے نمایاں ہو سکتی ہے (اس کے لیے I/O-Optimized استعمال کریں)
- معمولی MySQL/PostgreSQL compatibility اختلافات code تبدیلیوں کی ضرورت ہو سکتی ہے
- Serverless v2 auto-pause سے resume (~15 سیکنڈ) اور تیز scale-up latency spikes کا سبب بن سکتے ہیں

## خلاصہ

باب 23 میں S3 lifecycle کام نے data کو صحیح storage tier میں منتقل کر کے لاگتیں کم کیں۔ Aurora compute کے لیے مساوی کرتا ہے: peak load کے لیے provision کرنے اور اسے ہر وقت ادا کرنے کے بجائے، Serverless v2 طلب سے match کرنے کے لیے scale کرتا ہے۔

- **Read replicas** primary سے read traffic distribute کرتی ہیں۔ Asynchronous replication — زیادہ تر reads کے لیے معمولی lag قابل قبول۔ وہ reads جنہیں write consistency درکار ہے (فوراً post-write reads، admin interface reads) primary کی طرف route کریں، replica کی طرف نہیں۔
- **Aurora** storage layer کو دوبارہ تصور کرتا ہے: distributed، replicas میں shared، auto-scaling۔
- Aurora پیش کرتا ہے: 15 read replicas، <100ms replica lag، <30s failover، 128 TiB تک (حالیہ versions میں 256 TiB) auto-scaling storage۔
- **Performance Insights**: scale کرنے کا فیصلہ کرنے سے پہلے database load کا سبب بننے والی مخصوص SQL queries کی شناخت کریں۔ ایک غائب index ایک بڑی instance کی ضرورت ختم کر سکتا ہے۔
- **CloudWatch database metrics**: DatabaseConnections (near-saturation کا مطلب application connection pooling ٹوٹا ہوا ہے)، CPUUtilization (مسلسل high CPU کا مطلب مہنگی queries)، ReadLatency (وقت کے ساتھ degradation اکثر ایک غائب index والی بڑھتی table ہوتی ہے)۔
- **Aurora Serverless v2**: compute کو 0.5 ACUs کے increments میں auto-scale کرتا ہے۔ فی ACU-hour charge کیا جاتا ہے۔ peak اور off-peak کے درمیان high variability والے workloads کے لیے provisioned instances سے نمایاں طور پر سستا۔
- **Point-in-time recovery (PITR)**: ایک Aurora cluster کو backup retention window کے اندر کسی بھی سیکنڈ تک restore کریں — ایک *نئے* cluster میں، تاکہ جب آپ کھوئی rows کو جراحی طور پر واپس copy کریں production up رہے۔
- **تیز database cloning**: size سے قطع نظر ایک cluster کا copy-on-write clone منٹوں میں۔ سستا، isolated — اسے migrations کو production data کے خلاف test کرنے کے لیے استعمال کریں اس سے پہلے کہ وہ production میں چلیں۔
- **Aurora Backtrack** (صرف MySQL-ہم آہنگ — PostgreSQL نہیں): cluster کو ایک backup سے restore کیے بغیر اپنی جگہ پر ایک نقطہ وقت تک rewind کریں۔ 72 گھنٹے تک کے windows کے لیے دستیاب۔ `rds:BacktrackDBCluster` IAM permission درکار — operations team تک محدود کریں۔
- **Aurora Global Database**: ایک region میں primary، پانچ تک regions میں read replicas۔
- **Read replica promotion**: cross-region read replicas کو regional DR کے لیے standalone primaries میں promote کیا جا سکتا ہے۔ DR فائدے کو ایک دوسری مکمل instance چلانے کی لاگت کے خلاف توازن دیں۔
- چھوٹے، مستحکم، قابل پیش گوئی workloads کے لیے RDS منتخب کریں۔ جب آپ کو scale، تیز failover، یا متغیر traffic handling چاہیے Aurora منتخب کریں۔

## امتحانی نکات

*SAA-C03 ڈومین: High-Performing Architectures ڈیزائن کریں (ڈومین 3، ٹاسک 3.3)*

- **Aurora replica بمقابلہ RDS read replica**: Aurora replicas storage شیئر کرتی ہیں (near-zero lag، <30s failover)۔ RDS read replicas data replicate کرتی ہیں (lag ممکن، failover کے لیے منٹ)۔
- **Aurora Serverless v2**: "database capacity auto-scale کریں،" "غیر متوقع یا تیز database traffic" → Aurora Serverless v2۔ احتیاط: تاریخی طور پر صرف Serverless **v1** صفر تک scale ہوتا تھا؛ v2 کا minimum 2024 کے آخر تک 0.5 ACU تھا، جب v2 نے 0 ACUs تک auto-pause حاصل کیا۔ پرانے امتحانی سوالات اب بھی فرض کر سکتے ہیں کہ v2 صفر تک scale نہیں ہو سکتا۔
- **Aurora Global Database**: "multi-region database،" "US primary سے کم latency کے ساتھ EU سے پڑھیں،" "regional failover کے لیے RTO < 1 منٹ" → Aurora Global Database۔
- **Failover timing**: Aurora < 30 سیکنڈ۔ RDS Multi-AZ 60-120 سیکنڈ۔ دونوں جانیں۔
- **Data shape کے لحاظ سے purpose-built databases**: "social graph / recommendations / fraud rings" → Neptune۔ "MongoDB" → DocumentDB۔ "Cassandra" → Keyspaces۔ "time series / IoT telemetry" → Timestream۔ "Redis-ہم آہنگ *primary* database (durable)" → MemoryDB (بمقابلہ ElastiCache = cache)۔ "Immutable cryptographic ledger" → پرانے سوالات میں QLDB (2025 میں بند)۔
- **Aurora I/O-Optimized**: زیادہ storage اور instance لاگت، کوئی per-I/O charge نہیں۔ استعمال کریں جب I/O لاگتیں غالب ہوں (write-heavy)۔ معیاری Aurora: کم storage لاگت، فی I/O ادائیگی۔ read-heavy کے لیے استعمال کریں۔
- **Aurora Backtrack**: database کو ایک backup snapshot سے restore کیے بغیر ایک مخصوص نقطہ وقت تک اپنی جگہ پر rewind کریں۔ صرف MySQL-ہم آہنگ Aurora کے لیے دستیاب — Aurora PostgreSQL کے لیے، جواب point-in-time restore (ایک نئے cluster میں) یا ایک تیز clone ہے۔ امتحانی signal: "حادثاتی طور پر delete کیا گیا data، ایک مکمل backup restore کیے بغیر جلدی recover کرنے کی ضرورت" + MySQL → Backtrack۔
- **Aurora fast database cloning**: database size سے قطع نظر copy-on-write clone منٹوں میں۔ امتحانی signal: "production data کی ایک copy کے خلاف جلدی اور سستے میں test کریں" → clone، snapshot-restore نہیں۔

## مشقیں

**مشق 1 — یادداشت**

Aurora اور معیاری RDS read replicas کے درمیان فرق کی وضاحت کریں۔ Aurora کا replication lag عام طور پر کم کیوں ہوتا ہے؟

*(اشارہ: اہم فرق shared storage بمقابلہ data replication ہے۔ اس کے بارے میں سوچیں کہ جب ایک write آتا ہے تو ہر replica کو کیا کرنا ضروری ہے۔)*

**مشق 2 — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک social media platform کی MySQL database بڑھتی traffic کی وجہ سے high read latency کا تجربہ کر رہی ہے۔ Application read-heavy ہے (95% reads، 5% writes)۔ ٹیم کو read latency مستقل ہونی چاہیے، traffic spikes کے دوران بھی۔ انہیں کم سے کم downtime کے ساتھ خودکار failover چاہیے (target RTO < 30 سیکنڈ)۔ Data volume غیر متوقع طور پر بڑھ رہا ہے۔

کون سا database حل ان ضروریات کو سب سے بہتر طریقے سے پورا کرتا ہے؟

A) پانچ read replicas کے ساتھ RDS MySQL Multi-AZ  
B) Aurora Replicas اور Aurora Serverless v2 کے ساتھ Aurora MySQL  
C) ایک بڑی instance type کے ساتھ RDS MySQL (vertical scaling)  
D) read caching کے لیے DynamoDB DAX کے ساتھ DynamoDB

**اشارہ 1**: "RTO < 30 سیکنڈ" — کون سی service یہ حاصل کرتی ہے؟ ہر option کے لیے failover timing چیک کریں۔

**اشارہ 2**: "spikes کے دوران مستقل read latency" — کس service کی replicas کا near-zero lag بمقابلہ ممکنہ سیکنڈوں کا lag ہے؟

**اشارہ 3**: "غیر متوقع طور پر بڑھتا data volume" — کون سی service storage auto-scale کرتی ہے؟

**جواب**: B

**وضاحت**: Aurora Replicas کے ساتھ Aurora MySQL load کے تحت مستقل read performance کے لیے near-zero replication lag (ملی سیکنڈ، سیکنڈ نہیں) فراہم کرتا ہے۔ Aurora Serverless v2 over-provisioning کے بغیر traffic spikes کے دوران compute auto-scale کرتا ہے۔ Aurora storage data بڑھنے کے ساتھ auto-scale کرتا ہے۔ Aurora failover (ایک replica کا promotion) 30 سیکنڈ سے کم میں مکمل ہوتا ہے — RTO requirement کو پورا کرتے ہوئے۔

**A کیوں نہیں؟** RDS Multi-AZ failover 60-120 سیکنڈ لیتا ہے — RTO < 30 سیکنڈ کو پورا نہیں کرتا۔ معیاری RDS read replica lag load کے تحت سیکنڈوں تک پہنچ سکتا ہے — "مستقل" read latency کی ضمانت دینا مشکل ہے۔

**C کیوں نہیں؟** Vertical scaling (بڑی instance) capacity بڑھاتا ہے لیکن read load distribute نہیں کرتا۔ Database reads کے لیے ناکامی کا واحد نقطہ رہتی ہے۔

**D کیوں نہیں؟** DynamoDB NoSQL ہے — MySQL سے DynamoDB میں منتقل ہونے کے لیے data model اور application queries کو دوبارہ architecture کرنا درکار ہے، جو اس performance بہتری کے کام کے دائرہ کار سے بہت آگے ہے۔

*SAA-C03 ڈومین: High-Performing Architectures ڈیزائن کریں — ٹاسک 3.3*

**مشق 3 — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus ایک عالمی توسیع ڈیزائن کر رہا ہے۔ وہ چاہتے ہیں کہ East Coast، Germany، اور Australia میں ریستوران partners اپنا order data جلدی دیکھیں، cross-region latency کے بغیر۔ البتہ، تمام writes consistency برقرار رکھنے کے لیے واحد us-west-2 primary سے گزرنے ضروری ہیں۔

Aurora استعمال کرتے ہوئے database architecture ڈیزائن کریں۔ آپ Global Database کو کیسے structure کریں گے — مثلاً، us-east-1، eu-central-1، اور ap-southeast-2 میں secondary clusters؟ کیا ہوتا ہے اگر us-west-2 primary بند ہو جائے؟ آپ promotion process کیسے سنبھالیں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد multi-region database design کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Leo Serverless v2 کے ساتھ Aurora میں منتقل ہوا۔

جمعہ spike آیا اور چلا گیا۔ CPU نے کبھی 60% سے تجاوز نہیں کیا۔ Query latency مستقل رہی۔ Aurora نے load سنبھالنے کے لیے خودبخود scale up کیا تھا، پھر rush کے بعد واپس scale down کیا۔

"پچھلے جمعہ کے مقابلے میں اس کی کتنی لاگت آئی؟" Tom نے پیر کی صبح پوچھا۔

Leo نے billing explorer کھولا۔ "جمعہ شام کے peak میں اوسطاً تقریباً $2.16/گھنٹہ۔ ہفتہ کی صبح $0.24/گھنٹہ تھی۔"

Tom نے کچھ نہیں کہا۔

"پرانی setup load سے قطع نظر ایک مقررہ $0.47/گھنٹہ تھی،" Leo نے شامل کیا۔

"تو ہم نے spike کے دوران پہلے سے زیادہ ادا کیا،" Tom نے کہا۔

"ہاں۔ لیکن off-peak کے دوران نمایاں طور پر کم۔ ہفتے پر net لاگت کم ہے۔"

Tom نے حساب لگایا۔ پھر سر ہلایا۔

"یہاں ایک سبق ہے،" اس نے کہا۔ "صحیح سوال 'کیا یہ سستا ہے؟' نہیں ہے۔ یہ ہے 'کیا یہ ہمارے اصل usage pattern کے لیے سستا ہے؟'"

"یہ،" Priya نے کمرے کے دوسری طرف سے کہا، "ایک senior engineer کی جبلت ہے۔"

Tom اس طرح بیان کیے جانے پر تھوڑا گھبرایا ہوا لگا۔

اگلے باب میں: جب آپ کا network bottleneck ہو، اور ایک private highway toll کے قابل کیوں ہو سکتی ہے۔
