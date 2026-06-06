# باب ۳۱: Cloud Architecture کے لیے Building Inspector

کھڑے ہوں۔ کھنچاؤ کریں۔ اگر آپ کو ضرورت ہو تو ایک حقیقی break لیں۔

یہ باب اپنے سے پہلے والوں سے مختلف ہے۔ ہم نے 30 ابواب مخصوص services اور patterns کے علم کی تعمیر میں گزارے ہیں۔ اب ہم پیچھے ہٹ کر پوری تصویر دیکھتے ہیں۔

*اچھا* cloud architecture اصل میں کیسا نظر آتا ہے؟ کیا یہ جانچنے کا کوئی منظم طریقہ ہے کہ آپ نے جو بنایا ہے وہ واقعی اچھی طرح ڈیزائن کیا گیا ہے — یا صرف فعال ہے؟

ہے۔ AWS اسے Well-Architected Framework کہتا ہے۔

**خلاصۂ ماضی: وہ سوال جو اعداد کے پیچھے آتا ہے**

تین ماہ کی cost optimization نے ایک ایسا عدد پیدا کیا تھا جس نے ان سب کو حیران کر دیا: سالانہ بچت میں $35,904، شناخت اور زیادہ تر نافذ۔ EC2 Savings Plans، S3 lifecycle policies، storage cleanup، غیر استعمال شدہ database replicas، NAT Gateway endpoints — ہر ایک ایک علیحدہ دریافت تھی، ایک علیحدہ fix۔ لیکن اس عمل کے دوران کہیں، Maya نے ایک مختلف سوال پوچھنا شروع کر دیا تھا۔ "waste کہاں ہے؟" نہیں بلکہ "یہ پہلی جگہ جمع کیسے ہوا؟" Cost کے مسائل کسی چیز کی علامتیں تھے۔ Well-Architected Framework وہ کچھ کیا تھا اس کا نام رکھنے کے لیے الفاظ تھے۔

Nimbus دو سال سے چل رہا تھا۔ Team نے سینکڑوں architectural فیصلے کیے تھے — کچھ شعوری طور پر، کچھ اتفاقاً، کچھ دباؤ میں۔ نظام کام کرتا تھا۔ لیکن Maya کا ایک سوال تھا۔

"کیا ہمارا architecture اصل میں *اچھا* ہے؟" اس نے پوچھا۔ "صرف فعال نہیں۔ اچھا۔"

کسی نے فوراً جواب نہیں دیا۔

"کیونکہ میں ایک Well-Architected Review کے بارے میں سن رہی ہوں،" اس نے جاری رکھا۔ "AWS اسے customers کو پیش کرتا ہے۔ ہمارے کچھ investors نے اس کا ذکر کیا۔ میرا خیال ہے ہمیں ایک کرنا چاہیے۔"

"یہ کیا ہے؟" Leo نے پوچھا۔

"Cloud architectures کا جائزہ لینے کے لیے AWS کا framework،" Priya نے کہا۔ "چھ ستون۔ ہر ایک کے لیے سوالات اور best practices کا ایک مجموعہ۔ آپ اپنے architecture کا ان سب کے مقابلے میں جائزہ لیتے ہیں اور شناخت کرتے ہیں کہ کیا غائب ہے۔"

"یہ ایک building inspection کی طرح ہے،" Tom نے کہا۔ "آپ جانتے ہیں building کام کرتی ہے۔ Inspection بتاتی ہے کہ آیا یہ code-compliant ہے اور زلزلے میں کیا ناکام ہو سکتا ہے۔"

**چھ ستون**

AWS Well-Architected Framework چھ ستونوں کے گرد منظم ہے۔ ہر ستون کے پاس design principles، best practices، اور آپ کے architecture کا جائزہ لینے کے لیے سوالات کا ایک مجموعہ ہے۔

**1. Operational Excellence**

*توجہ*: business value فراہم کرنے کے لیے systems چلانا اور monitor کرنا، اور processes اور procedures کو مسلسل بہتر بنانا۔

اہم شعبے:

- آپ تبدیلیاں کیسے deploy کرتے ہیں؟ (CI/CD، infrastructure as code، automated deployments)
- آپ نظام کو کیسے monitor کرتے ہیں اور جانتے ہیں کہ کب کچھ غلط ہے؟
- آپ ناکامیوں سے کیسے سیکھتے ہیں؟ (post-mortems، runbooks، blameless culture)
- آپ پیمانے پر تبدیلیاں کیسے سنبھالتے ہیں؟

Nimbus جائزہ:

- موجود: automated deployments کے ساتھ CI/CD pipeline
- موجود: CloudWatch alarms اور GuardDuty
- موجود: سہ ماہی chaos engineering tests
- انتباہ: Post-mortem process رسمی نہیں — incidents کی تحقیق ہوتی تھی لیکن سیکھے گئے سبق منظم طور پر document نہیں ہوتے تھے

**2. Security**

*توجہ*: risk assessment اور تخفیف کی حکمت عملیوں کے ذریعے معلومات، systems، اور assets کی حفاظت۔

اہم شعبے:

- کون کیا access کر سکتا ہے، اور ممکنہ حد تک کم سے کم privilege کے ساتھ؟
- Data آرام کی حالت میں اور منتقلی میں کیسے encrypt ہوتا ہے؟
- آپ threats کا پتہ کیسے لگاتے اور ان کا جواب کیسے دیتے ہیں؟
- کیا خودکار security controls ہیں؟

Nimbus جائزہ:

- موجود: least privilege کے ساتھ IAM (باب ۱۴ میں cleanup کے بعد)
- موجود: data encryption کے لیے KMS، credentials کے لیے Secrets Manager
- موجود: GuardDuty، WAF، Shield Standard
- موجود: private subnets، security groups کے ساتھ VPC
- انتباہ: EC2 instances پر security patching مکمل طور پر خودکار نہیں (Priya نے یہ مہینوں پہلے flag کیا تھا، ابھی تک حل نہیں ہوا)

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا، جب security patching کا gap سامنے آیا۔ "ہم نے deployments خودکار کیں۔ ہم نے backups خودکار کیں۔ ہم نے patching کو دستی کیوں چھوڑا؟"

"کیونکہ patching code deploy کرنے سے مختلف محسوس ہوتی تھی،" Priya نے کہا۔ "ہم پریشان تھے کہ patching کچھ توڑ دے گی۔ تو ہم نے control برقرار رکھنے کے لیے اسے دستی رکھا۔"

"اور اسے دستی رکھ کر، ہم نے اسے غیر مستقل بنا دیا،" Maya نے کہا۔ "جو بدتر ہے۔"

"ہاں،" Priya نے کہا۔ "AWS Systems Manager Patch Manager اسے حل کرتا ہے۔ ہمیں چھ ماہ پہلے یہ کر دینا چاہیے تھا۔"

**3. Reliability**

*توجہ*: یہ یقینی بنانا کہ ایک نظام اپنا مطلوبہ function درست اور مستقل طور پر انجام دے، اور ناکامیوں سے recover کرنے کے قابل ہو۔

اہم شعبے:

- نظام component سطح پر ناکامیوں کو کیسے سنبھالتا ہے؟
- یہ regional ناکامیوں سے کیسے recover کرتا ہے؟
- demand کیسے manage کی جاتی ہے؟
- نظام کو ناکامی کے لیے کیسے test کیا جاتا ہے؟

Nimbus جائزہ:

- موجود: تمام critical components کے لیے Multi-AZ
- موجود: خودکار failover کے ساتھ Aurora Serverless
- موجود: EC2 اور ECS کے لیے Auto Scaling
- موجود: Chaos engineering tests (سہ ماہی)
- انتباہ: کوئی multi-region deployment نہیں (warm standby ابھی نافذ نہیں — اگلی سہ ماہی کے لیے منصوبہ بند)

**4. Performance Efficiency**

*توجہ*: IT اور computing resources کو موثر طریقے سے استعمال کرنا۔

اہم شعبے:

- کیا workload کے لیے درست instance type اور database type استعمال ہو رہا ہے؟
- کیا scaling درست طریقے سے configured ہے؟
- کیا data users کو بہترین مقام سے فراہم کیا جاتا ہے؟

Nimbus جائزہ:

- موجود: عالمی content delivery کے لیے CloudFront
- موجود: database read acceleration کے لیے ElastiCache
- موجود: Aurora read replicas
- موجود: مناسب workloads کے لیے Lambda
- انتباہ: کچھ EC2 instances ابتدائی deployment کے بعد سے کبھی right-sized نہیں ہوئیں

**5. Cost Optimization**

*توجہ*: غیر ضروری لاگتوں سے بچنا۔

اہم شعبے:

- کیا resources مناسب طور پر sized ہیں؟
- کیا غیر استعمال شدہ resources decommission ہیں؟
- کیا مناسب pricing models استعمال ہو رہے ہیں؟
- کیا spending anomalies کا پتہ لگایا جاتا ہے؟

Nimbus جائزہ:

- موجود: Savings Plans نافذ (باب ۲۷)
- موجود: S3 lifecycle policies (باب ۲۳)
- موجود: DynamoDB Auto Scaling
- موجود: alerts کے ساتھ AWS Budgets
- موجود: سہ ماہی cost reviews

"یہ فی مہینہ بالکل کتنی لاگت ہے — وہ تمام چیزیں جو ہم نے ابھی تک right-size نہیں کیں؟" Tom نے پوچھا۔ "وہ EC2 instances جن کا کبھی جائزہ نہیں لیا گیا۔ وہ جو ابھی بھی اس size پر ہیں جو ہم نے پہلے سال میں provision کیا تھا۔"

"مجھے معلوم نہیں،" Leo نے کہا۔ "یہی نکتہ ہے۔"

"یہی Performance Efficiency کا gap ہے،" Priya نے کہا۔ "ہم نے ان چیزوں کو optimize کیا جن کے بارے میں ہم جانتے تھے۔ ہمارے پاس ان چیزوں کا کوئی عدد نہیں ہے جنہیں ہم نے ابھی تک نہیں دیکھا۔"

**6. Sustainability**

*توجہ*: cloud workloads چلانے کے ماحولیاتی اثرات کو کم سے کم کرنا۔

اہم شعبے:

- کیا utilization زیادہ سے زیادہ ہے (بیکار resources سے گریز)؟
- کیا instance types energy efficiency کے لیے چنے گئے ہیں؟
- کیا data صرف اتنا ہی ذخیرہ کیا جاتا ہے جتنا ضروری ہو؟

Nimbus جائزہ:

- موجود: serverless/containerized workloads کے لیے Lambda اور Fargate (وقف EC2 سے بہتر resource efficiency)
- موجود: S3 lifecycle policies (جب مزید ضرورت نہ ہو تو data delete کریں)
- انتباہ: کچھ graviton-based instances ابھی تک نہیں اپنائی گئیں (AWS Graviton زیادہ energy-efficient اور سستی ہے)

**Well-Architected Review Process**

Review کوئی test نہیں ہے جسے آپ pass یا fail کرتے ہیں۔ یہ آپ کے architecture کے بارے میں ایک منظم گفتگو ہے، جو چھ ستونوں میں 60+ سوالوں سے رہنمائی پاتی ہے۔

ہر سوال ایک best practice شناخت کرتا ہے۔ اگر آپ کا architecture اس کی پیروی کرتا ہے، تو یہ ایک خوبی ہے۔ اگر نہیں، تو یہ ایک "issue" ہے — risk level (high، medium، low) کے لحاظ سے درجہ بند۔

Output: improvement recommendations کی ایک prioritized فہرست۔ ہر چیز کو فوراً ٹھیک کرنے کی ضرورت نہیں۔ Framework آپ کو ہر gap کے trade-offs سمجھنے اور یہ فیصلہ کرنے میں مدد دیتا ہے کہ پہلے کس سے نمٹنا ہے۔

AWS کا Well-Architected Tool (AWS console میں دستیاب، مفت) سوال framework فراہم کرتا ہے اور recommendations کے ساتھ ایک report تیار کرتا ہے۔

Nimbus کے لیے، Maya نے تمام چھ ستونوں کا احاطہ کرنے والا ایک نصف-دن کا review session طے کیا — اور اسے اکیلے چلانے کا فیصلہ نہیں کیا۔ Session خود، اور جو findings کی فہرست اس نے پیدا کی، وہی ہے جہاں یہ باب جا رہا ہے۔

**Lens: Review کو خصوصی بنانا**

بنیادی Well-Architected Framework technology-agnostic ہے۔ AWS مخصوص use cases یا صنعتوں کے لیے framework کی توسیعات — **Lenses** — بھی شائع کرتا ہے:

- **Serverless Lens**: Lambda-heavy architectures کے لیے اضافی سوالات
- **SaaS Lens**: multi-tenant SaaS applications کے لیے
- **Machine Learning Lens**: ML training اور inference workloads کے لیے
- **Financial Services Lens**: FinTech کے لیے ریگولیٹری اور compliance سوالات
- **Healthcare Lens**: HIPAA کے تحفظات

آپ شاید سوچ رہے ہوں: کیا آپ کو launch کرنے سے پہلے تمام چھ ستونوں کے مقابلے میں مکمل Well-Architected review چلانے کی ضرورت ہے؟ نہیں۔ قدر سوالات میں ہے، score میں نہیں۔ اگر آپ pre-launch ہیں، تو اپنی صورتحال کے لیے سب سے زیادہ متعلقہ دو ستون چنیں — Security اور Reliability تقریباً ہمیشہ درست نقطۂ آغاز ہوتے ہیں — اور صرف انہی سوالوں پر کام کریں۔ ایک جزوی review جو دراصل کیا گیا ہو ایک مکمل review سے زیادہ قیمتی ہے جو architecture کے "تیار" ہونے تک ملتوی ہو۔

Nimbus کے لیے، SaaS Lens متعلقہ تھا۔ اس نے tenant isolation، onboarding automation، اور per-tenant cost allocation کے بارے میں سوالات شامل کیے — وہ تمام شعبے جو Nimbus فعال طور پر تیار کر رہا تھا۔

**Well-Architected Review Session: Carlos سہولت کاری کرتا ہے**

Maya نے Carlos کو مدعو کیا تھا — ایک senior architect جس سے وہ ایک AWS community event پر ملی تھی، جو ان جیسی teams کے لیے Well-Architected reviews کی سہولت کاری کرتا تھا — تاکہ session چلائے۔ وہ اپنے laptop پر Well-Architected Tool کھلا اور ایک واحد notepad کے ساتھ پہنچا۔ کوئی ایجنڈا نہیں۔ بس سوالات۔

"میں پوچھوں گا، آپ ایمانداری سے جواب دیں،" اس نے کہا۔ "اگر ایماندار جواب 'ہمیں معلوم نہیں' ہے، تو وہ کہیں۔ یہ ایک finding ہے۔"

اس نے Operational Excellence سے شروع کیا۔

"کیا آپ کے پاس اپنے سرفہرست پانچ incidents کے لیے runbooks ہیں؟"

Tom نے Leo کی طرف دیکھا۔ Leo نے چھت کی طرف دیکھا۔

"ہمارے پاس دو incidents کے لیے runbooks ہیں،" Priya نے کہا۔ "Database connection limit کی خلاف ورزی اور CloudFront origin timeout۔ باقی تین — peak کے دوران EC2 instance ناکامی، DynamoDB throttling، اور Stripe webhook ناکامی — ہم ad hoc سنبھالتے ہیں۔"

Carlos نے لکھا: *OPS-1: سرفہرست 5 incidents کے لیے runbooks۔ موجودہ: 2/5۔ Gap: 3۔*

"آپ نے آخری بار کب موجودہ runbooks کو ایک drill میں چلایا؟"

خاموشی۔

"ہم نے نہیں چلایا،" Priya نے کہا۔ "ہم نے انہیں incidents کے بعد لکھا۔ ہم نے کبھی test نہیں کیا کہ آیا وہ ابھی بھی درست ہیں۔"

*OPS-2: Runbook validation۔ آخری test: کبھی نہیں۔*

Carlos آگے بڑھا۔ Security۔

"ابھی root account access کس کے پاس ہے؟"

"Root؟" Leo نے کہا۔ "صرف Maya۔ اور مجھے لگتا ہے کہ Tom کے پاس ابھی بھی root credentials ہیں جب سے ہم نے account قائم کیا — لیکن ہم نے انہیں باب ۱۴ کے بعد rotate کیا۔" وہ رکا۔ "Tom، کیا ہم نے IAM cleanup کے بعد root rotate کیا؟"

Tom نے ایک 1Password entry کھولی۔ "ہم نے password بدلا اور MFA شامل کیا۔ لیکن root credentials ابھی بھی shared 1Password vault میں ہیں۔ تین لوگوں کے پاس اس vault تک رسائی ہے: میں، Maya، اور Leo۔"

"تو تین لوگوں کے پاس root access ہے،" Carlos نے کہا۔ "AWS کی رہنمائی یہ ہے کہ root صرف کاموں کی ایک مختصر documented فہرست کے لیے استعمال ہونا چاہیے — تقریباً دس account-level operations، سب کے سب نایاب اور ان میں سے زیادہ تر صرف ہنگامی۔ ان operations کے بعد، root session ختم کر دیا جانا چاہیے۔ کیا root access علیحدہ طور پر log ہوتا ہے؟"

"CloudTrail اسے log کرتا ہے،" Priya نے کہا۔

"کیا root استعمال ہونے پر کوئی alert ہے؟"

ایک اور توقف۔

"نہیں،" Tom نے کہا۔

Carlos نے لکھا: *SEC-1: Root account access control۔ موجودہ: shared vault میں 3 users، کوئی usage alert نہیں۔ Gap: Root usage کو ایک فوری SNS alert trigger کرنا چاہیے۔ ہدف: 0 غیر-ہنگامی root sessions۔*

"اگلا: IAM permissions کی تبدیلیوں کا جائزہ کون لیتا ہے؟ کیا نئے IAM roles یا policy توسیعات کے لیے ایک peer review process ہے؟"

"Priya ان کا جائزہ لیتی ہے،" Leo نے کہا۔ "وہ عملی طور پر security reviewer ہے۔"

"جب Priya چھٹی پر ہو تو کیا ہوتا ہے؟"

کسی نے جواب نہیں دیا۔

"یہ ایک process gap ہے،" Carlos نے بغیر کسی فیصلے کے کہا۔ "Priya کی صلاحیت میں gap نہیں — process design میں ایک gap۔ ایک security review جو ایک شخص کی دستیابی پر منحصر ہو آپ کے security posture میں ایک single point of failure ہے۔"

*SEC-2: IAM review process۔ موجودہ: واحد reviewer، کوئی backup نہیں۔ Gap: ایک backup reviewer متعین کریں اور review کے معیار کو document کریں۔*

Carlos Reliability کی طرف مڑا۔

"کیا آپ نے Aurora Multi-AZ failover کو load کے تحت test کیا ہے؟"

"ہم نے اسے idle پر test کیا،" Tom نے کہا۔ "ہم نے failover command چلایا جب نظام پُرسکون تھا اور تصدیق کی کہ replica 45 سیکنڈ کے اندر promote ہو گئی۔"

"اس وقت load کیا تھا؟"

"شاید peak کا 5%۔"

"80% peak load پر failover کے دوران connection pool کا کیا ہوتا ہے؟"

Tom نے اس پر سوچا۔ "DNS endpoint update ہوتا ہے۔ writer endpoint استعمال کرنے والی applications switchover window کے دوران connection errors دیکھیں گی — عام طور پر 20-45 سیکنڈ۔ 5% load پر، ہمارے پاس دس active connections تھیں۔ peak پر، ہمارے پاس 300 ہوں گی۔ سامنے RDS Proxy کے ساتھ، proxy دوبارہ connection کو سنبھالتا ہے۔"

"کیا RDS Proxy واقعی Multi-AZ failover کے دوران شفاف طریقے سے دوبارہ connect ہوتا ہے؟"

Tom نے Priya کی طرف دیکھا۔ "میرا خیال ہے ہاں۔ لیکن میں نے اسے test نہیں کیا۔"

"یہ 'ہاں' سے ایک مختلف جواب ہے،" Carlos نے کہا۔ "آپ کے high-availability design میں ایک untested مفروضہ ایک finding ہے۔"

*REL-1: load کے تحت Aurora Multi-AZ failover۔ Tested: صرف idle۔ Gap: RDS Proxy کے ساتھ 70% peak load پر test کریں۔ failover window کے دوران connection pool رویے کی validate کریں۔*

"کیا آپ نے سوچا ہے کہ اگر failover میں 45 کے بجائے 90 سیکنڈ لگیں تو کیا ہوگا؟" Priya نے Carlos کے بجائے Tom سے مخاطب ہوتے ہوئے پوچھا۔ وہ پہلے ہی کام کر رہی تھی۔

"90 سیکنڈ پر، ہمارے پاس ان requests کے لیے application timeouts ہوں گے جنہیں retry نہیں کیا جا سکتا،" Tom نے کہا۔ "order-placement flow میں retry logic ہے۔ confirmation flow — کم۔ dinner rush کے دوران 90 سیکنڈ کا failover کا مطلب ہوگا کہ confirmations کا ایک حصہ ناکام ہو جائے، restaurants کو order نہ ملے، customer کو refund ملے۔"

"یہی blast radius ہے،" Carlos نے کہا۔ "اچھا۔ اب آپ جانتے ہیں کہ آپ کس چیز سے حفاظت کر رہے ہیں اور اسے کیسے ناپنا ہے۔ Test کو failover کی مدت اور switchover window کے دوران application کے رویے دونوں کی validate کرنی چاہیے۔"

وہ Performance Efficiency کی طرف بڑھا۔

"کیا آپ اپنی EC2 instances کو right-size کر رہے ہیں؟"

"ہم نے cost review کے دوران right-size کیا،" Tom نے کہا۔ "Savings Plans موجودہ instance types پر committed ہوئے۔"

"آپ نے آخری بار کب Compute Optimizer کی recommendations دیکھیں؟"

Tom نے اسے کھولا۔ AWS Compute Optimizer نے تین instances کو ممکنہ طور پر over-provisioned کے طور پر flag کیا تھا: دو c6g.medium background processors اور ایک t3.medium VPN server۔ VPN server کی recommendation ایک t3.small میں سائز کم کرنا تھی۔ Processors کو 82% اعتماد کے ساتھ "over-provisioned" flag کیا گیا تھا۔

"ہم نے قائم کرنے کے بعد سے یہ نہیں دیکھا،" Tom نے اعتراف کیا۔

"Compute Optimizer کتنے عرصے سے recommendations پیدا کر رہا ہے؟"

Tom نے چیک کیا۔ "چھ ہفتے۔"

Carlos نے لکھا: *PERF-1: Compute Optimizer کے ذریعے EC2 right-sizing۔ موجودہ: recommendations دستیاب، جائزہ نہیں لیا گیا۔ Gap: Compute Optimizer output کا ماہانہ جائزہ؛ staging validation کے بعد recommendations لاگو کریں۔*

"ایک اور،" Carlos نے کہا۔ "یہ تمام ستونوں میں۔" اس نے whiteboard پر لکھا:

*Incident-free، well-designed جیسا نہیں ہے۔*

اس نے اسے ایک لمحے کے لیے وہاں رہنے دیا۔

"آپ کا نظام دو سال سے ایک بڑے customer-facing outage کے بغیر چل رہا ہے،" اس نے کہا۔ "یہ واقعی اچھا ہے۔ لیکن میں چاہتا ہوں کہ آپ notice کریں کہ یہ آپ کو کیا بتاتا ہے — اور کیا نہیں۔"

"یہ ہمیں بتاتا ہے کہ ہم خوش قسمت رہے؟" Leo نے پیش کیا۔

"یہ آپ کو بتاتا ہے کہ جو failure modes آپ کو سامنے آئے ہیں وہ آپ کی سنبھالنے کی صلاحیت کے اندر رہے ہیں، آج آپ کے پاس جو architecture ہے اسے دیکھتے ہوئے۔ یہ آپ کو نہیں بتاتا کہ architecture مضبوط ہے۔ ایک نظام جو ابھی تک ناکام نہیں ہوا وہ resilient ہونے کا ثابت نہیں ہوا۔ یہ ان مخصوص حالات کا سامنا نہ کرنے کا ثابت ہوا ہے جو اس کی کمزوریوں کو بے نقاب کریں گے۔"

"تو ناکام نہ ہونے کا مطلب کمزور نہ ہونا نہیں،" Maya نے کہا۔

"درست۔ Well-Architected review ماضی کی ناکامیوں کے ثبوت کی تلاش نہیں کر رہا۔ یہ مستقبل کی نمائش کی تلاش کر رہا ہے۔ Untested failover۔ وہ runbooks جو موجود نہیں۔ وہ IAM role جو بہت وسیع ہے۔ ان میں سے کسی نے ابھی تک کوئی incident پیدا نہیں کیا۔ ان میں سے سب کر سکتے ہیں۔"

"یہی وجہ ہے کہ patching gap اہم ہے،" Priya نے کہا۔ "ہم ایک unpatched EC2 instance کے ذریعے breach نہیں ہوئے۔ اس کا مطلب یہ نہیں کہ ہم نہیں ہوں گے۔"

"بالکل،" Carlos نے کہا۔ "نقصان کی غیر موجودگی حفاظت کا ثبوت نہیں ہے۔ ایک غیر حل شدہ کمزوری کی موجودگی خطرے کا ثبوت ہے — قطع نظر اس کے کہ خطرہ ظاہر ہوا ہے یا نہیں۔"

اس نے اپنا marker بند کیا۔

"یہی ایک well-designed نظام اور ایک خوش قسمت نظام کے درمیان فرق ہے۔"


**IAM Over-Permission کی Finding**

Carlos نے security ستون کے review کے دوران ایک دوسری finding flag کی جس کے لیے گہری نظر کی ضرورت تھی۔

"آپ کا Lambda function جو order notifications سنبھالتا ہے — اس کے پاس کون سی IAM permissions ہیں؟"

Leo نے execution role کھولا۔ اسے ڈھونڈنے میں جتنا چاہیے تھا اس سے تیس سیکنڈ زیادہ لگے — role، Nimbus کی زندگی میں جلد بنایا گیا تھا اور عام طور پر نام دیا گیا تھا۔

"S3 full access،" اس نے کہا، جب اسے ملا۔

Carlos نے انتظار کیا۔

"کون سا bucket؟" اس نے پوچھا۔

"تمام buckets،" Leo نے کہا۔ اس نے policy پڑھی۔ "`arn:aws:s3:::*`۔ ہم نے اسے S3 full access دیا۔"

"Function اصل میں S3 کے ساتھ کیا کرتا ہے؟"

"یہ ایک bucket سے restaurant configuration پڑھتا ہے،" Leo نے کہا۔ "`nimbus-restaurant-config` bucket۔ خاص طور پر `restaurants/{restaurant_id}/config.json` objects۔ یہ انہیں پڑھتا ہے۔ بس اتنا۔"

"تو function کو `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json` پر `s3:GetObject` چاہیے،" Carlos نے کہا۔ "اس کے پاس account میں ہر bucket پر full S3 permissions ہیں۔"

"بشمول،" Priya نے کہا، "Aurora snapshot bucket۔ CloudTrail logs bucket۔ customer order history bucket۔"

"اگر یہ Lambda function سمجھوتہ شدہ ہو،" Carlos نے کہا، "تو ایک حملہ آور کو account میں ہر S3 bucket تک full access ہے۔ وہ کوئی بھی data پڑھ، لکھ، یا delete کر سکتے ہیں۔"

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ،" Leo نے کہا۔ وہ policy پڑھ رہا تھا۔ "میں نے یہ دو سال پہلے لکھا۔ میں notification system کو کام کرنے کی جلدی میں تھا۔ میں نے اسے وسیع access دیا کیونکہ مجھے ابھی یقین نہیں تھا کہ اسے کیا چاہیے۔ اور میں اسے تنگ کرنے کبھی واپس نہیں آیا۔"

"یہ production systems میں over-permission کا سب سے عام source ہے،" Carlos نے بغیر الزام کے کہا۔ "جان بوجھ کر غفلت نہیں — وقت کے دباؤ میں لیا گیا ایک shortcut، جس پر کبھی دوبارہ نظر نہیں ڈالی گئی۔"

Tom پہلے ہی Lambda execution roles کی پوری فہرست دیکھ رہا تھا۔

"ہمارے کتنے Lambda functions کے پاس over-broad permissions ہیں؟" Maya نے پوچھا۔

جواب، بیس منٹ کے review کے بعد: 23 Lambda functions میں سے 7 کے پاس اپنے documented مقصد کی ضرورت سے زیادہ وسیع permissions تھیں۔ سب سے زیادہ تشویشناک: payment confirmation Lambda کے پاس تمام tables پر `dynamodb:*` تھا۔ اسے صرف orders table پر `dynamodb:GetItem` اور `dynamodb:PutItem` چاہیے تھا۔

"تمام سات ٹھیک کرنے میں تین گھنٹے کا کام،" Priya نے اندازہ لگایا۔ "least-privilege policies لکھیں، انہیں attach کریں، وسیع والی ہٹائیں۔"

"کیا یہ اب تک کی سب سے زیادہ خطرے والی finding ہے؟" Maya نے Carlos سے پوچھا۔

"runbook gap کے ساتھ برابر،" اس نے کہا۔ "IAM مسئلہ ایک blast-radius مسئلہ ہے — اگر ان میں سے کوئی function سمجھوتہ شدہ ہو، تو حملہ آور کی رسائی اس سے کہیں بڑی ہے جتنی ہونی چاہیے۔ Runbook مسئلہ ایک recovery-time مسئلہ ہے — جب کچھ غلط ہوتا ہے، تو آپ ایک tested procedure کی پیروی کرنے کے بجائے بے ساختہ کام کر رہے ہوتے ہیں۔ دونوں واقعی high risk ہیں۔"

Maya نے دونوں کو tracking document میں P1 کے طور پر نشان زدہ کیا۔

"اور اگر کوئی break in کرنے کی کوشش کرے؟" Priya نے کہا۔ "ہم بیرونی حملہ آوروں کے بارے میں پریشان ہوتے رہے ہیں۔ لیکن ایک over-permissioned Lambda کا مطلب ہے کہ ایک اندرونی ناکامی — ایک misconfiguration، ایک dependency کمزوری، ایک supply chain حملہ — اسی blast radius کا حامل ہو سکتا ہے۔"

"Defense in depth فرض کرتا ہے کہ ہر layer کے پاس کم سے کم ضروری access ہے،" Carlos نے کہا۔ "جب ایک layer کے پاس اپنی ضرورت سے زیادہ access ہو، تو defense in depth جیسا ڈیزائن کیا گیا تھا ویسا کام کرنا بند کر دیتا ہے۔ آپ کو ایک layer ملتا ہے جو سمجھوتہ شدہ ہے، لیکن اس کے پاس تین دیگر layers کی چابیاں ہیں۔"

Priya نے IAM over-permission finding کو P1، column ایک، ایک ہفتے کی due date کے ساتھ نشان زدہ کیا۔


**Findings کی درجہ بندی: P1، P2، P3**

session کے آخر تک، team کے پاس board پر 14 findings تھیں۔ Carlos نے جانے سے پہلے انہیں ترجیح دینے کو کہا۔

"اس فہرست پر ہر finding کو ایک ترجیح چاہیے،" اس نے کہا۔ "ہر چیز یکساں طور پر اہم نہیں۔ اس سے ترجیح دیں: اگر یہ ناکام ہو تو blast radius کیا ہے؟ اس کے ناکام ہونے کا کتنا امکان ہے؟ اسے ٹھیک کرنا کتنا مشکل ہے؟"

14 findings:

1. سرفہرست 5 میں سے 3 incidents کے لیے کوئی runbooks نہیں (OPS)
2. Runbooks کبھی test نہیں ہوئیں (OPS)
3. runbooks سے آگے کوئی رسمی incident response process نہیں (OPS)
4. shared vault میں root access، کوئی usage alert نہیں (SEC)
5. IAM review process میں کوئی backup reviewer نہیں (SEC)
6. 7 Lambda functions over-permissioned (SEC) ← Leo کا notification Lambda
7. ضرورت سے زیادہ وسیع چند security group rules (SEC)
8. Aurora failover load کے تحت test نہیں ہوا (REL)
9. Multi-region DR plan نافذ نہیں (REL)
10. Security patching خودکار نہیں (SEC)
11. launch کے بعد سے EC2 right-sizing کا جائزہ نہیں لیا گیا (PERF)
12. Graviton instances نہیں اپنائی گئیں (SUST)
13. CloudFront cache TTLs ٹیون نہیں ہوئے (PERF)
14. 40% infrastructure IaC میں نہیں (OPS)

"واضح والوں سے شروع کریں،" Carlos نے کہا۔ "اگر آپ کے پاس صرف ایک ہفتہ ہو تو کون سی تین آپ پہلے ٹھیک کریں گے؟"

Maya نے فوراً کہا: "Root access alert۔ Lambda over-permissions۔ Security patching automation۔"

"کیوں؟" Carlos نے پوچھا۔

"کیونکہ یہ تینوں ایک واضح blast radius کے ساتھ security gaps ہیں۔ باقی reliability اور operational بہتریاں ہیں — اہم، لیکن ہم ان کے ساتھ رہ رہے ہیں اور انہوں نے کوئی incident پیدا نہیں کیا۔ Security gaps ہر اس دن خاموشی سے بڑھتے ہیں جس دن ہم انہیں ٹھیک نہیں کرتے۔"

Tom نے ہلکا سا اختلاف کیا۔ "Lambda over-permissions ضروری ہے۔ لیکن میں security patching کو Aurora failover test سے بدل دوں گا۔ ہم نے کبھی تصدیق نہیں کی کہ ہمارا Multi-AZ setup load کے تحت درست کام کرتا ہے۔ اگر یہ جمعہ کی dinner rush کے دوران ناکام ہو اور ہمارے پاس اس کے لیے کوئی tested runbook نہ ہو، تو ہم مشکل میں ہیں۔"

"دونوں P1 ہو سکتے ہیں،" Priya نے کہا۔ "ہمارے پاس ایک ہفتہ ہے۔ پانچ کام کے دن۔ Lambda permissions فی function دو گھنٹے کی fix ہے۔ Root access alert ایک تیس منٹ کا CloudWatch event rule ہے۔ Security patching automation Systems Manager setup اور testing کے دو دن ہیں۔ Aurora failover test منگل کو 2 AM پر طے کردہ ایک نصف-دن ہے۔"

Carlos نے سر ہلایا۔ "یہی ترجیح دینے کا درست طریقہ ہے۔ صرف 'سب سے زیادہ اہم کیا ہے' نہیں بلکہ 'ہم اس ہفتے دراصل کیا کر سکتے ہیں، اور کس ترتیب میں؟'"

حتمی ترجیح:

**P1 (اس ہفتے)**:
- Lambda execution role least-privilege fix (7 functions)
- Root account CloudWatch alert
- load کے تحت Aurora Multi-AZ failover test (اگلے منگل، 2 AM کے لیے طے کریں)

**P2 (اس مہینے)**:
- Systems Manager کے ذریعے security patching automation
- سرفہرست 3 incidents کے لیے غائب runbooks
- رسمی incident response process documented
- 40% IaC migration — شناخت کریں کہ کون سے resources، migration plan بنائیں

**P3 (اس سہ ماہی)**:
- Runbook validation drill
- IAM review process backup reviewer documented
- ضرورت سے زیادہ وسیع security group rules تنگ کی گئیں
- Compute Optimizer کے ذریعے EC2 right-sizing review
- Graviton adoption plan
- CloudFront TTL tuning

"یہ owners، due dates، اور ترجیحات کے ساتھ چودہ findings ہیں،" Maya نے کہا۔ "ہم کبھی technical debt کے بارے میں اتنے منظم نہیں رہے۔"

"یہی review کا مقصد ہے،" Carlos نے کہا۔ "آپ کو gaps کے بارے میں برا محسوس کرانے کے لیے نہیں۔ آپ کو ایک vocabulary اور ایک فہرست دینے کے لیے جس کے خلاف آپ دراصل عمل کر سکیں۔"


**Well-Designed اور صرف کام کرنے کے درمیان فرق**

"ہمارا نظام کام کرتا ہے،" Leo نے review کے بعد کہا۔ "لیکن مجھے احساس نہیں تھا کہ ہم نے کتنی چیزیں 'کافی اچھی' کر کے آگے بڑھ گئے تھے۔"

"کیا ہم نے سوچا ہے کہ اگر ہم ان gaps کو چھوڑتے رہیں تو کیا ہوگا؟" Priya نے پوچھا۔ "patching کا مسئلہ مہینوں سے کھلا ہے۔ Incident response process موجود نہیں۔ یہ معمولی چیزیں نہیں ہیں — یہ وہ چیزیں ہیں جو طے کرتی ہیں کہ آیا ایک جمعہ کی رات کا outage ایک 20 منٹ کی fix ہے یا ایک چار گھنٹے کی تباہی۔"

"یہی وجہ ہے کہ ہم review کر رہے ہیں،" Maya نے کہا۔

"یہ معمول ہے،" Priya نے کہا۔ "وقت کے دباؤ میں تعمیر کرنے کا مطلب ہے آپ عملی انتخاب کرتے ہیں۔ Well-Architected review انہیں دوبارہ دیکھنے کا طے شدہ وقت ہے۔"

"ان میں سے کچھ gaps پیچھے مڑ کر واضح لگتے ہیں،" اس نے جاری رکھا۔ "Security patching — میں جانتی تھی کہ ہم نے اسے خودکار نہیں کیا۔ میں نے بس کبھی اسے ٹھیک کرنے کو ترجیح نہیں دی۔"

"کیونکہ 'یہ کام کرتا ہے' اور 'یہ well-architected ہے' روزمرہ ایک جیسے محسوس ہوتے ہیں،" Maya نے کہا۔ "فرق صرف اس وقت نظر آتا ہے جب کچھ غلط ہوتا ہے۔"

یہ ان سب سے اہم چیزوں میں سے ایک ہے جو ایک senior engineer سمجھتا ہے: incidents کی غیر موجودگی کا مطلب خطرے کی غیر موجودگی نہیں۔ اس کا مطلب ہے کہ خطرہ ابھی تک trigger نہیں ہوا۔

**Infrastructure as Code: Operational Excellence کا Enabler**

متعدد ستونوں میں ایک موضوع: **Infrastructure as Code (IaC)**۔

اگر آپ کا infrastructure console کے ذریعے دستی طور پر configure ہے، تو:

- ایک DR منظر نامے میں اسے دوبارہ بنانا سست اور خطا کا شکار ہے
- تبدیلیوں کا audit ناممکن ہے (کس نے کیا بدلا، اور کب؟)
- ایک بری تبدیلی کو واپس کرنے کے لیے دستی الٹ پھیر درکار ہے
- environments (dev/staging/production) کے درمیان مستقل مزاجی کے لیے ضبط درکار ہے

**AWS CloudFormation** آپ کو YAML/JSON templates میں infrastructure define کرنے دیتا ہے۔ **AWS CDK (Cloud Development Kit)** آپ کو programming languages (Python، TypeScript، Java) استعمال کرتے ہوئے infrastructure define کرنے دیتا ہے۔ **Terraform** ایک مقبول third-party متبادل ہے۔

Nimbus بتدریج Terraform استعمال کرتے ہوئے IaC کی طرف بڑھ رہا تھا۔ Well-Architected review کے وقت تک، ان کا تقریباً 60% infrastructure code میں define تھا۔ Review نے 100% تک پہنچنے کی سفارش کی۔

"باقی 40% کیوں؟" Leo نے پوچھا۔

"باقی 40% وہاں ہے جہاں ہمارا critical infrastructure رہتا ہے،" Priya نے کہا۔ "اگر ہم اسے code سے دوبارہ نہیں بنا سکتے، تو ہم ایک regional disaster سے قابل اعتماد طریقے سے recover نہیں کر سکتے۔"

Leo نے فہرست دیکھی۔ "باقی 40% — ہاں۔ یہ ٹھیک رہے گا، ہم اسے اگلے sprint میں migrate کر دیں گے۔"

Priya نے اپنی نظر screen پر جمائے رکھی۔ "یہ critical infrastructure ہے۔ Multi-region failover configuration۔ IAM role hierarchy۔ وہ چیزیں جو، اگر ہمیں 3 AM پر صفر سے دوبارہ بنانا پڑے، تو ہمیں جاننا چاہیے کہ وہ بالکل درست ہیں۔"

Leo نے ایک لمحے کے لیے اس پر غور کیا۔

"...تم درست کہہ رہی ہو،" اس نے آہستہ سے کہا۔ "ہمارے پاس پہلے ہی دستی configuration ہے جو اس سے بہہ چکی ہے جو کسی نے لکھا تھا۔ اگر ہمیں اسے صفر سے دوبارہ بنانا پڑے، تو ہم اندازہ لگا رہے ہوں گے۔"

"یہی وجہ ہے کہ review نے اسے ڈھونڈا،" Maya نے کہا۔ "الزام دینے کے لیے نہیں۔ اسے اہم بننے سے پہلے ٹھیک کرنے کے لیے۔"

**CloudFormation تفصیل سے: AWS-Native IaC Tool**

اگرچہ Nimbus نے Terraform اپنایا تھا، Well-Architected review نے یہ بھی سامنے لایا کہ team نے کبھی AWS CloudFormation کو پوری طرح نہیں سمجھا — وہ native AWS IaC service جو CDK، SAM (serverless application model)، اور Service Catalog جیسی services کی بنیاد ہے۔ امتحان خاص طور پر CloudFormation کو test کرتا ہے، اور کئی AWS services کو اسے سمجھنے کی ضرورت ہوتی ہے۔

جو مسئلہ Carlos نے session میں پہلے نام دیا تھا وہ ٹھوس تھا: Leo environments بنانے کے لیے دستی طور پر console میں click کرتا رہا تھا۔ اسے ہر بار 45 منٹ لگتے تھے، اور staging اور production کے درمیان کوئی بھی تضاد اس وقت تک نادیدہ تھا جب تک کچھ ٹوٹ نہ جائے۔ پچھلے سال کے پانچ production incidents میں سے تین production میں ایک ایسی configuration سے پیدا ہوئے تھے جو staging سے میل نہیں کھاتی تھی — مختلف security group rules، مختلف environment variables، ایک مختلف instance type۔

"Console ایک یک طرفہ دروازہ ہے،" Carlos نے کہا۔ "آپ اندر جا کر چیزیں بدل سکتے ہیں، لیکن آپ آسانی سے واپس باہر چل کر بالکل نہیں دیکھ سکتے کہ کیا بدلا گیا تھا، یا کل کی حالت دوبارہ پیدا نہیں کر سکتے۔"

CloudFormation اس کا جواب ہے۔ یہ یوں کام کرتا ہے:

**Template**: ایک YAML یا JSON file جو وہ AWS infrastructure declare کرتی ہے جو آپ چاہتے ہیں۔ اسے کیسے بنانا ہے اس کی ہدایات نہیں — یہ کیسا نظر آنا چاہیے اس کا اعلان۔ "میں ان CIDR ranges کے ساتھ ایک VPC چاہتا ہوں، دو public subnets، دو private subnets، ایک Internet Gateway، اور یہ route tables۔" CloudFormation template پڑھتا ہے اور یہ معلوم کرتا ہے کہ اصل infrastructure کو اعلان سے میل کرانے کا طریقہ کیا ہے۔

ایک template کو ایک environment کے لیے ایک recipe کی طرح سوچیں۔ Recipe نہیں بدلتی۔ اس سے بنایا گیا ہر environment یکساں ہوتا ہے۔ Staging اور production ایک ہی template استعمال کرتے ہیں، مختلف parameters کے ساتھ (مختلف instance sizes، مختلف domain names)۔ ساختی فیصلے — کون سے subnets موجود ہیں، کون سے security groups، کون سے IAM roles — یکساں ہوتے ہیں۔

**Stack**: ایک template کا deployed instance۔ جب Leo `aws cloudformation deploy --template-file infrastructure.yaml` چلاتا ہے، تو CloudFormation ایک Stack بناتا ہے — اصل AWS resources کا ایک نامزد مجموعہ جسے template بیان کرتا ہے۔ Stack یاد رکھتا ہے کہ اس نے کون سے resources بنائے، اور یہ انہیں ایک اکائی کے طور پر manage کرتا ہے۔ Template update کریں اور Stack دوبارہ deploy کریں: CloudFormation موجودہ حالت اور نئے template کے درمیان فرق حساب کرتا ہے، اور صرف درکار تبدیلیاں لاگو کرتا ہے۔ Stack delete کریں: CloudFormation اس کے بنائے ہر resource کو، درست ترتیب میں، آپ کو انہیں یاد رکھنے کی ضرورت کے بغیر، ختم کر دیتا ہے۔

"تو Stack deployment ہے، template نہیں؟" Maya نے پوچھا۔

"Template recipe ہے۔ Stack کھانا ہے۔ آپ ایک ہی recipe سے جتنی بار چاہیں ایک ہی کھانا بنا سکتے ہیں۔ ہر بار یہ ایک جیسا ہوتا ہے۔"

**Change Set**: ایک چلتے Stack میں update لاگو کرنے سے پہلے، آپ ایک Change Set بنا سکتے ہیں — اس کا ایک preview کہ CloudFormation کیا کرے گا۔ ایک نیا resource شامل کریں؟ Change Set اسے دکھاتا ہے۔ ایک security group modify کریں؟ Change Set پہلے اور بعد دکھاتا ہے۔ ایک RDS instance بدلیں؟ Change Set اسے ایک replacement کے طور پر flag کرتا ہے — جس کا مطلب downtime ہے — اس سے پہلے کہ آپ commit کریں۔

"apply سے پہلے diff دیکھیں،" Priya نے کہا۔ "یہی ہے جو ہمارے پاس کم ہے جب Leo console میں چیزیں click کرتا ہے۔"

Nimbus کے لیے، policy یہ بن گئی: production میں تمام infrastructure تبدیلیوں کو ایک Change Set review سے گزرنا چاہیے۔ کوئی براہ راست console edits نہیں۔ Change Set infrastructure کے لیے peer review process ہے۔

**Drift Detection**: وقت کے ساتھ، لوگ console میں چیزیں click کرتے ہیں۔ ایک incident کے دوران شامل کیا گیا ایک security group rule۔ ایک deploy کے بیچ میں بدلا گیا ایک environment variable۔ ایک instance type جو دستی طور پر بڑھایا گیا جب طے شدہ fix میں بہت زیادہ وقت لگ رہا تھا۔ CloudFormation اسے **drift** کہتا ہے — جب ایک resource کی اصل حالت اب اس سے میل نہیں کھاتی جو Stack کا template کہتا ہے کہ ہونی چاہیے۔

CloudFormation کی drift detection Stack کے resources کو scan کرتی ہے اور اصل حالت اور template-defined حالت کے درمیان کسی بھی فرق کی رپورٹ کرتی ہے۔ جب Leo نے پہلی بار موجودہ Nimbus stacks پر drift detection چلائی، تو اسے گیارہ drifted resources ملے۔ ان میں سے سات security group modifications تھے۔ تین IAM policy تبدیلیاں تھیں۔ ایک ایک S3 bucket تھا جس کی lifecycle policy چھ ماہ پہلے براہ راست console میں بدل دی گئی تھی اور کبھی template میں ظاہر نہیں ہوئی۔

"گیارہ resources جہاں اصل infrastructure اور template اختلاف کرتے ہیں،" Priya نے کہا۔ "گیارہ ممکنہ تضادات staging اور production کے درمیان جن کے بارے میں ہمیں معلوم نہیں۔"

Leo نے کچھ نہیں کہا۔ ان میں سے کچھ modifications اس کی تھیں۔

اس نے اگلا ہفتہ drifted resources کو templates کے ساتھ ہم آہنگ کرنے میں گزارا۔ تین دستی تبدیلیاں bugs تھیں — ایسی configuration جو کبھی لاگو نہیں ہونی چاہیے تھی۔ باقی جائز تبدیلیاں تھیں جو بس کبھی template میں واپس commit نہیں ہوئی تھیں۔

**یہ Well-Architected Framework کے لیے کیوں اہم ہے**: Infrastructure as Code، Operational Excellence (دہرانے کے قابل deployments، version-controlled infrastructure، ہر تبدیلی کی auditability)، Reliability (اگر ایک Region ناکام ہو، تو آپ environment کو template سے دوبارہ بنا سکتے ہیں، یادداشت سے نہیں)، اور Security (IAM roles اور security group rules کا code میں جائزہ لیا جاتا ہے، بعد میں console میں دریافت نہیں کیا جاتا) کے سنگم پر بیٹھتا ہے۔ یہ ایک nice-to-have نہیں ہے — یہ ان بنیادی practices میں سے ایک ہے جنہیں framework مستقل طور پر تجویز کرتا ہے۔

---

> **امتحانی نکتہ — CloudFormation**
>
> *SAA-C03 ڈومین: Cross-domain — Operational Excellence اور Reliability*
>
> - **CloudFormation = AWS پر declarative IaC۔** آپ ایک template میں مطلوبہ حالت declare کرتے ہیں؛ CloudFormation resources بناتا اور manage کرتا ہے۔ امتحانی اشارہ: "دہرانے کے قابل deployments،" "infrastructure as code،" "مستقل environments۔"
> - **Template** → **Stack**: template اعلان ہے؛ Stack deployed resources ہیں۔ ایک Stack کو ایک اکائی کے طور پر بنایا، update کیا، یا delete کیا جا سکتا ہے۔
> - **Change Set**: ایک چلتے Stack میں update لاگو کرنے سے پہلے preview کریں کہ کیا بدلے گا۔ "apply سے پہلے diff دیکھیں۔" امتحانی اشارہ: "deploy کرنے سے پہلے infrastructure تبدیلیوں کا جائزہ لیں" → Change Set۔
> - **Drift Detection**: ان resources کی شناخت کرتا ہے جو CloudFormation کے باہر دستی طور پر بدلے گئے۔ "کسی نے console میں کچھ click کیا" → Drift Detection۔
> - **DeletionPolicy attribute**: کنٹرول کرتا ہے کہ جب اس کا Stack delete ہو تو ایک resource کا کیا ہوتا ہے۔ `Retain` — resource رکھا جاتا ہے (ایسے S3 buckets کے لیے مفید جن میں آپ data نہیں کھونا چاہتے)۔ `Delete` — resource تباہ ہو جاتا ہے (default)۔ `Snapshot` — RDS اور کچھ دیگر services کے لیے، CloudFormation delete کرنے سے پہلے ایک حتمی snapshot لیتا ہے۔ امتحانی اشارہ: "stack delete ہونے پر ایک RDS database کو delete ہونے سے روکیں" → `DeletionPolicy: Snapshot` یا `DeletionPolicy: Retain`۔
> - **CloudFormation StackSets**: ایک واحد operation سے متعدد AWS accounts اور regions میں ایک ہی Stack deploy کریں۔ امتحانی اشارہ: "ایک organization میں تمام accounts میں ایک ہی infrastructure deploy کریں۔"

**تبدیلی: جب Framework آپ کو گمراہ کرے**

اگر آپ ایک Well-Architected review میں ہر box چیک کریں لیکن staging میں اپنی failure recovery کی validate نہ کریں، تو آپ کا high-availability architecture پہلے حقیقی incident پر ناکام ہو جائے گا — کیونکہ resilience کی documentation tested resilience جیسی نہیں ہے۔ Framework پوچھتا ہے "کیا آپ کے پاس Multi-AZ ہے؟" نہ کہ "کیا آپ نے تصدیق کی ہے کہ failover آپ کی مخصوص configuration میں دراصل درست کام کرتا ہے؟"

اگر آپ framework کو ایک auditor کو مطمئن کرنے کے لیے ایک checklist کے طور پر استعمال کریں بجائے ایک سوچنے کے آلے کے طور پر نظام کو بہتر بنانے کے لیے، تو آپ ایک ایسے architecture کی درست documentation تیار کریں گے جسے آپ پوری طرح نہیں سمجھتے۔ سوالات اس وقت سب سے زیادہ قیمتی ہوتے ہیں جب وہ ایسے gaps ظاہر کرتے ہیں جن کے ملنے کی آپ کو توقع نہیں تھی۔

## خوبیاں اور حدود

**Well-Architected Framework کیا اچھا کرتا ہے**: یہ teams کو architectural trade-offs پر بحث کرنے کے لیے ایک مشترکہ vocabulary دیتا ہے — ایک زبان جو عملے کی تبدیلیوں اور vendor گفتگو سے بچ جاتی ہے۔ ایک Well-Architected Review چلانا ان خطرات کے واضح اقرار پر مجبور کرتا ہے جو دوسری صورت میں غیر مرئی ہوتے ہیں: "ہاں، ہم جانتے ہیں کہ یہاں ہمارے پاس ایک single point of failure ہے؛ ہم نے وہ trade-off قبول کیا کیونکہ اسے ختم کرنے کی لاگت ناکامی کی متوقع لاگت سے زیادہ ہے۔" اس قسم کا documented، ارادی trade-off ایک اچھے review کی output ہے۔

**یہ کیا نہیں کر سکتا**: Framework descriptive ہے، prescriptive نہیں۔ یہ well-architected systems کی خصوصیات بیان کرتا ہے — یہ آپ کو نہیں بتاتا کہ انہیں کیسے بنایا جائے۔ ایک Well-Architected Review میں ہر box چیک کرنا ایک اچھے architecture کی ضمانت نہیں دیتا۔ ایک نظام انتہائی دستیاب، operationally بہترین، cost-optimized ہو سکتا ہے، اور پھر بھی غلط مسئلہ حل کر رہا ہو۔ Framework ایک lens ہے، ایک blueprint نہیں۔ اسے درست سوالات سامنے لانے کے لیے استعمال کریں، انہیں جواب دینے کے لیے نہیں۔

## خلاصہ

Well-Architected review نے انہیں 14 items کے ساتھ چھوڑا — تین جنہیں فوری توجہ کی ضرورت تھی، باقی جنہیں ایک منصوبے کی ضرورت تھی۔ high-risk findings بالکل حیرانیاں نہیں تھیں؛ وہ ایسی چیزیں تھیں جن کے بارے میں team جانتی تھی اور جن تک ابھی پہنچی نہیں تھی۔ Review نے انہیں ان gaps کو کھلے عام تسلیم کرنے، انہیں خطرے کے مطابق ترجیح دینے، اور ایک timeline پر عمل کرنے کا ایک منظم طریقہ دیا۔ وہ جواب دہی، کسی بھی انفرادی finding سے زیادہ، قدر تھی۔

- **AWS Well-Architected Framework** کے چھ ستون ہیں: Operational Excellence، Security، Reliability، Performance Efficiency، Cost Optimization، اور Sustainability۔
- ہر ستون کے پاس design principles اور best practices ہیں جن کا ایک منظم سوال مجموعے کے ذریعے جائزہ لیا جاتا ہے۔
- **Well-Architected Tool** (AWS console میں مفت) review کی رہنمائی کرتا ہے اور ایک report تیار کرتا ہے۔
- Output خطرے کے مطابق درجہ بند architectural بہتریوں کی ایک prioritized فہرست ہے۔
- **Infrastructure as Code** ایک cross-pillar enabler ہے — Operational Excellence، Security، اور Reliability ستونوں کی طرف سے تجویز کردہ۔

## امتحان کے نکات

*SAA-C03 ڈومین: Cross-domain — تمام domains*

- **تمام چھ ستون اور ان کی بنیادی توجہ جانیں**۔ امتحان ایک منظر نامہ بیان کرے گا (مثلاً، "team یقینی بنانا چاہتی ہے کہ ان کا نظام AZ ناکامیوں سے recover کر سکے") اور پوچھے گا کہ یہ کس ستون کے تحت آتا ہے (Reliability)۔
- **Pillar mapping**:
  - "تبدیلیاں قابل اعتماد طریقے سے deploy کریں، ناکامیوں سے سیکھیں، monitor کریں" → Operational Excellence
  - "IAM، encryption، network controls، threat detection" → Security
  - "HA، failover، scaling، DR" → Reliability
  - "Right-sizing، CDN، درست technology selection" → Performance Efficiency
  - "Pricing models، غیر استعمال شدہ resources، cost visibility" → Cost Optimization
  - "Energy efficiency، resource utilization، data lifecycle" → Sustainability
- **Infrastructure as Code**: دہرانے کی صلاحیت، auditability، اور recovery کے لیے framework کی طرف سے تجویز کردہ۔ CloudFormation، CDK، اور SAM AWS-native IaC tools ہیں۔
- **Well-Architected Tool**: AWS console کا tool جو review process کی رہنمائی کرتا ہے۔ استعمال کے لیے مفت۔ improvement plans تیار کرتا ہے۔
- **AWS Trusted Advisor**: Well-Architected framework کی طرح لیکن خودکار — آپ کے account کو scan کرتا ہے اور cost، performance، security، اور fault tolerance میں recommendations فراہم کرتا ہے۔ overlap حقیقی ہے: Trusted Advisor اس میں سے کچھ کو خودکار کرتا ہے جس کا framework دستی طور پر جائزہ لیتا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

AWS Well-Architected Framework کے چھ ستونوں کے نام لیں اور ہر ایک کی بنیادی تشویش کو ایک جملے میں بیان کریں۔

*(اسے یادداشت سے کرنے کی کوشش کریں۔ اگر آپ کو دشواری ہو، تو یہ مفید معلومات ہے کہ کن ستونوں کو زیادہ توجہ کی ضرورت ہے۔)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک engineering team ایک Well-Architected review کی تیاری کر رہی ہے۔ ان کی application RDS Multi-AZ کے ساتھ EC2 پر چلتی ہے۔ حال ہی میں، انہوں نے دریافت کیا کہ:

- ان کا deployment process کبھی کبھی EC2 instances کو مختلف library versions کے ساتھ چھوڑ دیتا ہے (configuration drift)
- RDS failover trigger ہونے پر ان کے پاس کوئی automated alerting نہیں
- ان کے تمام IAM users کے پاس AdministratorAccess ہے
- انہوں نے 14 ماہ میں اپنا backup restoration process test نہیں کیا

ہر issue کو سب سے زیادہ متعلقہ Well-Architected ستون سے map کریں۔

A) Configuration drift: Operational Excellence؛ کوئی RDS failover alerting نہیں: Reliability؛ AdministratorAccess: Security؛ کوئی backup restoration test نہیں: Reliability

B) Configuration drift: Security؛ کوئی RDS failover alerting نہیں: Performance Efficiency؛ AdministratorAccess: Operational Excellence؛ کوئی backup restoration test نہیں: Cost Optimization

C) Configuration drift: Reliability؛ کوئی RDS failover alerting نہیں: Performance Efficiency؛ AdministratorAccess: Security؛ کوئی backup restoration test نہیں: Operational Excellence

D) Configuration drift: Security؛ کوئی RDS failover alerting نہیں: Reliability؛ AdministratorAccess: Cost Optimization؛ کوئی backup restoration test نہیں: Security

**اشارہ ۱**: deployment process میں "Configuration drift" → کون سا ستون deployment practices کا احاطہ کرتا ہے؟

**اشارہ ۲**: تمام users کے لیے "AdministratorAccess" → کون سا ستون access control کا احاطہ کرتا ہے؟

**اشارہ ۳**: "Backup restoration test نہیں ہوا" → کون سا ستون آپ کے recovery mechanisms کی testing کا احاطہ کرتا ہے؟

**جواب**: A

**وضاحت**: deployments میں configuration drift (غیر مستقل environments) ایک Operational Excellence مسئلہ ہے — یہ قابل اعتماد، مستقل deployment practices کے بارے میں ہے۔ RDS failover پر کوئی alerting نہ ہونے کا مطلب ہے کہ آپ نہیں جانتے کہ HA mechanisms کب trigger ہوتے ہیں — ایک Reliability مسئلہ (اپنے نظام کی صحت جاننا)۔ تمام users کے لیے AdministratorAccess least privilege کی خلاف ورزی کرتا ہے — ایک Security مسئلہ۔ Untested backup restoration کا مطلب ہے کہ آپ کے Reliability mechanisms (DR) غیر تصدیق شدہ ہیں۔

**B کیوں نہیں؟** B غلط طور پر configuration drift کو Security سے منسوب کرتا ہے (غیر مستقل library versions ایک deployment operations مسئلہ ہیں، ایک security خطرہ نہیں) اور AdministratorAccess کو Operational Excellence سے (access control ایک Security تشویش ہے، ایک ops process نہیں)۔

**C کیوں نہیں؟** C درست طور پر AdministratorAccess کو Security میں رکھتا ہے لیکن غلط طور پر configuration drift کو Reliability سے منسوب کرتا ہے (deployment consistency Operational Excellence ہے) اور untested backup restoration کو Operational Excellence سے (recovery testing ایک Reliability تشویش ہے — آپ تصدیق کر رہے ہیں کہ آپ کا نظام recover کر سکتا ہے، نہ کہ یہ کہ آپ کے processes مستقل ہیں)۔

**D کیوں نہیں؟** D، AdministratorAccess کو Cost Optimization سے منسوب کرتا ہے (ضرورت سے زیادہ وسیع permissions کا لاگت سے کوئی تعلق نہیں) اور untested backup restoration کو Security سے (ایک backup restore نہ کر پانا ایک Reliability ناکامی ہے، ایک security کمزوری نہیں)۔

*SAA-C03 ڈومین: Cross-domain*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

ایک ایسی application کا ایک چھوٹا Well-Architected review کریں جسے آپ جانتے ہیں یا بنا رہے ہیں۔ چھ ستونوں میں سے ہر ایک کے لیے، لکھیں:

- ایک چیز جو application اچھی طرح کرتی ہے
- ایک چیز جسے application بہتر بنا سکتی ہے

پھر اپنی improvement items کو خطرے (کیا چیز سب سے زیادہ ایک incident یا waste کا سبب بننے کا امکان ہے؟) اور ترجیح (اگر ٹھیک کیا جائے تو کس چیز کا سب سے بڑا اثر ہوگا؟) کے مطابق درجہ بند کریں۔

*(یہ مشق اس سے زیادہ قیمتی ہے جتنی لگ سکتی ہے۔ متعدد زاویوں سے architecture کا منظم طور پر جائزہ لینے کی مشق ایک بنیادی senior engineer مہارت ہے۔)*

## پوسٹ کریڈٹس منظر

Well-Architected review کے تین ہفتے بعد، team نے تینوں P1 fixes نافذ کر لیے تھے — سات Lambda roles least-privilege تھے، root استعمال نے ایک alert trigger کیا، اور Aurora failover کو منگل کو 2 AM پر load کے تحت test کیا گیا تھا — اور P2 کام جاری تھا۔

EC2 patching اب AWS Systems Manager Patch Manager کے ذریعے خودکار تھی۔ ایک incident response process document موجود تھا (کامل نہیں، لیکن لکھا اور shared)۔ Multi-region warm standby plan کا مسودہ بنایا گیا اور اگلی سہ ماہی نفاذ کے لیے طے کیا گیا۔

Priya نے Well-Architected Tool report کا جائزہ لیا۔ P1 findings بند تھیں یا ثبوت کے ساتھ تفویض شدہ تھیں۔ medium- اور low-risk items سکڑ رہے تھے، owners اور تاریخوں کے ساتھ۔

"ہم پہلے سے بہتر حالت میں ہیں،" اس نے کہا۔

"کیا یہ اچھا ہے؟" Leo نے پوچھا۔

"یہ پیش رفت ہے،" اس نے کہا۔ "آپ ایک Well-Architected review ختم نہیں کرتے۔ آپ پیش رفت کرتے ہیں، پھر چھ ماہ میں دوبارہ review کرتے ہیں۔"

Maya کسی چیز کے بارے میں سوچ رہی تھی۔

"ہم نے 31 ابواب انفرادی AWS services سیکھنے میں گزارے،" اس نے کہا۔ "اور اب ہم پورے نظام کو دیکھنا شروع کر رہے ہیں۔ یہی طرح architects سوچتے ہیں۔"

"ہم کچھ عرصے سے architects کی طرح سوچ رہے ہیں،" Leo نے کہا۔

"ہم architectural فیصلے کر رہے ہیں،" Maya نے کہا۔ "یہ مختلف ہے۔ ایک architect کی طرح سوچنے کا مطلب ہے کہ آپ فیصلوں کا جائزہ کرنے *سے پہلے* لیتے ہیں، بعد میں نہیں۔"

"فرق کیا ہے؟" Tom نے پوچھا۔

"اگلے باب میں،" اس نے کہا، "ہم اس کا جواب دینے کی کوشش کرتے ہیں۔"

اگلے باب میں: ایک حقیقی architecture review کیسی نظر آتی ہے، بنیادی اصولوں سے۔
