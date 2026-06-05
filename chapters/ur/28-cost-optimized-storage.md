# باب ۲۸: Storage Bill کی حیرانی

Tom نے EC2 کے لیے Savings Plan submit کی تھی۔ اگلی line item EBS تھی: $440/month۔

"یہ زیادہ لگتا ہے،" اس نے کہا۔

Leo نے EBS volume list کھولی۔ Instances سے attached 47 EBS volumes تھے۔ اور پھر کسی instance سے attached نہ 23 volumes اور تھے۔

"یہ 23 volumes،" Tom نے کہا۔ "یہ کیا ہیں؟"

Leo نے انہیں دیکھا۔ وہ سب detached تھے — کوئی instance ابھی انہیں استعمال نہیں کر رہی تھی۔ زیادہ تر debugging مقاصد کے لیے snapshots سے بنائی گئی تھیں۔ کچھ ان instances سے تھیں جو terminate ہو چکی تھیں لیکن جن کی volumes delete نہیں ہوئیں۔

"ہم storage کے لیے $0.10 per GB per month ادا کر رہے ہیں جسے کوئی نہیں پڑھ رہا،" Leo نے کہا۔

Tom نے total دیکھی: 2.3 TB unattached volumes۔

"تین سو تیس dollars ماہانہ storage کے لیے جو ہم استعمال نہیں کرتے،" Tom نے کہا۔ "یہ کتنے عرصے سے جاری ہے؟"

Leo نے creation dates چیک کیے۔ سب سے پرانی volume 16 ماہ پرانی تھی۔

"تین ہزار چھ سو اسی dollars،" Tom نے آہستہ آہستہ کہا۔ "ہم نے تین ہزار چھ سو dollars storage پر خرچ کیے جسے کوئی access نہیں کرتا۔"

اس نے unattached volumes delete کر دیں۔ اگلے مہینے EBS bill $210 تک گر گیا۔

**Storage Cost Audit**

Tom کی EBS discovery ایک وسیع pattern کی علامت تھی: storage costs خاموشی سے جمع ہوتی ہیں۔ Compute کے برعکس (آپ notice کرتے ہیں جب 47 سرورز چل رہے ہوں)، storage خاموشی سے جمع ہوتی رہتی ہے۔

اسے storage unit rental کی طرح سوچیں۔ ایک unit rent کرنا credit card statement پر obvious ہے۔ لیکن اگر آپ ایک project کے لیے دوسری unit rent کریں، پھر کچھ پرانے furniture کے لیے تیسری، اور آپ کبھی واپس نہیں جاتے یہ چیک کرنے کہ اندر کیا ہے — charges ہر مہینے آتے رہتے ہیں، خاموشی سے، بہت بعد تک جب آپ کو یاد ہی نہیں کہ آپ کیا store کر رہے ہیں۔ Cloud storage اسی طرح کام کرتی ہے: bytes وہاں بیٹھتے ہیں، invoice آتا ہے، اور کوئی اس پر سوال نہیں کرتا جب تک کوئی آخرکار دروازہ نہیں کھولتا اور اسے ایسی چیزوں سے بھرا نہیں پاتا جس کی کسی کو مزید ضرورت نہیں۔

ایک مکمل storage cost audit ان چیزوں کو دیکھتی ہے:

**S3**:

- کیا تمام buckets کے لیے lifecycle policies موجود ہیں؟
- کیا پرانے snapshots (RDS، EBS) S3 میں بیٹھے ہیں؟
- کیا uncertain access patterns والے buckets کے لیے Intelligent-Tiering مناسب ہے؟
- کیا versioned objects متعدد copies بنا رہے ہیں جن تک کبھی access نہیں ہوتی؟

**EBS**:

- کیا کوئی unattached volumes ہیں (کوئی running instance انہیں استعمال نہیں کر رہی)؟
- کیا gp3 volumes صحیح طریقے سے configured ہیں؟ (Default gp3 volumes میں excess provisioned throughput/IOPS ہو سکتی ہے جس کی ضرورت نہیں)
- کیا ضرورت سے زیادہ پرانے snapshots retain ہو رہے ہیں؟

**RDS**:

- کیا automated backup retention periods مناسب طریقے سے سیٹ ہیں؟ (زیادہ = زیادہ storage لاگت)
- کیا پرانی instances سے manual snapshots ابھی بھی موجود ہیں؟
- کیا database migrations سے read replicas ابھی بھی چل رہے ہیں؟

**EFS**:

- کیا EFS volume صحیح storage class میں ہے؟ (Standard بمقابلہ Infrequent Access)

**S3 Versioning: پوشیدہ لاگت**

باب ۵ میں، ہم نے ذکر کیا کہ S3 versioning ہر آبجیکٹ کا ہر پچھلا ورژن رکھتی ہے۔ یہ safety کے لیے بہترین ہے۔ اگر آپ ورژنز کے لیے lifecycle rules نہ رکھیں تو costs کے لیے خوفناک ہے۔

جب versioning bucket پر enabled ہو، ہر بار جب آپ object overwrite کریں، پرانا ورژن retain ہوتا ہے۔ وقت کے ساتھ:

- Day 1: Image uploaded (v1)
- Day 30: Image updated (v1 اب "noncurrent" ورژن ہے، v2 current ہے)
- Day 60: Image دوبارہ updated (v1 اور v2 noncurrent، v3 current)
- Day 365: v1، v2... v12 سب stored ہیں۔ آپ ایک image کی 12 copies کے لیے ادائیگی کر رہے ہیں۔

Fix: noncurrent ورژنز کے لیے lifecycle rules۔

```
30 دنوں کے بعد noncurrent ورژنز expire کریں
7 دنوں کے بعد failed multipart uploads delete کریں
```

Tom نے یہ rules تمام versioned buckets پر apply کیے۔ اگلے مہینے، S3 storage 18% کم ہو گئی۔

**EBS: Right-Sizing اور gp3 Upgrade**

EBS volume pricing کے دو اجزاء ہیں:

1. Storage (فی GB فی ماہ)
2. Provisioned IOPS اور throughput (اگر آپ io1/io2 پر ہیں یا extra gp3 performance کے لیے ادائیگی کر رہے ہیں)

**gp3 opportunity**: باب ۶ میں، ہم نے note کیا کہ gp3 current default ہے اور gp2 سے سستی ہے۔ اگر Nimbus کے پاس gp3 دستیاب ہونے سے پہلے بنائی گئی volumes تھیں (یہ December 2020 میں launch ہوئی)، وہ ابھی بھی gp2 ہو سکتی ہیں۔

Tom نے 1,200 GB کی 12 gp2 volumes پائیں۔ gp3 میں migrate کرنے سے ان volumes پر فوری 20% بچت ہوئی، کوئی performance degradation کے بغیر۔

**IOPS اور throughput**: gp3 volumes ڈیفالٹ میں 3,000 IOPS اور 125 MB/s throughput آتی ہیں، بغیر extra چارج کے۔ آپ زیادہ provision کر سکتے ہیں اگر آپ کی workload کو ضرورت ہو۔ Review کریں کہ آیا provisioned performance واقعی استعمال ہو رہی ہے۔

Tom نے 10,000 provisioned IOPS کے ساتھ دو gp3 volumes پائیں۔ اس نے CloudWatch metrics چیک کیے: actual اوسط IOPS 1,200 تھا۔ اس نے provisioned IOPS کو 4,000 تک کم کیا (actual peak سے اوپر ایک safety margin)۔

ماہانہ بچت: $68۔

**Snapshot lifecycle**: EBS snapshots incremental ہیں (ہر snapshot صرف وہ تبدیلیاں محفوظ کرتا ہے جو آخری والے کے بعد ہوئیں)، لیکن وہ جمع ہوتے ہیں۔ Nimbus کے ابتدائی دنوں سے پرانے snapshots ابھی بھی موجود تھے۔ Tom نے روزانہ snapshots کے 30 دن رکھے اور باقی delete کر دیے۔

**EFS: Storage Classes**

Amazon EFS کی اپنی storage classes ہیں:

- **EFS Standard**: کثرت سے accessed files کے لیے۔ زیادہ لاگت۔
- **EFS Infrequent Access (IA)**: 30 دن سے access نہ ہونے والی files کے لیے۔ Standard سے 92% سستی۔
- **EFS Archive**: 90 دن سے access نہ ہونے والی files کے لیے۔ IA سے بھی سستی۔

**EFS Intelligent-Tiering**: Access patterns کی بنیاد پر files کو خودبخود storage classes کے درمیان move کرتا ہے۔

Tom نے EFS volume پر Intelligent-Tiering فعال کیا۔ چھ ہفتوں بعد، 68% files Infrequent Access میں move ہو چکی تھیں۔ ماہانہ EFS لاگت $89 سے $31 تک گر گئی۔

**S3 Cost Allocation Tags: کون کتنا خرچ کر رہا ہے**

Nimbus بڑھنے کے ساتھ، متعدد teams S3 میں data store کر رہی تھیں۔ Analytics team کے اپنے buckets تھے۔ Engineering team کے buckets تھے۔ ریستوران data team کے buckets تھے۔

Bill صرف "S3: $198" دکھاتا تھا۔ Team کے مطابق کوئی breakdown نہیں تھا۔

**Cost allocation tags** آپ کو AWS resources کو business metadata (team، project، environment) کے ساتھ tag کرنے دیتے ہیں اور پھر AWS Cost Explorer میں ان tags کے مطابق costs breakdown دیکھتے ہیں۔

Tom نے تمام S3 buckets میں tags شامل کیے:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Tags کے ساتھ ایک billing cycle کے بعد، وہ دیکھ سکتا تھا: "Analytics team کا data lake $74/month ہے۔ Engineering backups $43/month ہیں۔ ریستوران data $81/month ہے۔"

اب وہ ہر team کے ساتھ aggregate number دیکھنے کی بجائے budget گفتگو کر سکتا تھا۔

**AWS Cost Explorer اور AWS Budgets**

**AWS Cost Explorer**: سروس، region، tag، اور usage type کے مطابق historical اور forecasted costs visualize کرتا ہے۔ پیسہ کہاں جا رہا ہے سمجھنے کے لیے ضروری۔

**AWS Budgets**: Alerts سیٹ کرتا ہے جب costs ایک threshold سے تجاوز کریں (یا forecast کریں)۔ آپ سروس، region، tag، یا account کے مطابق budget کر سکتے ہیں۔

Tom نے تین budgets سیٹ کیے:

1. Total monthly bill: 90% of budgeted amount پر Alert
2. EC2 On-Demand: اگر On-Demand spend $500/month سے تجاوز کرے تو Alert (Savings Plan gap کی علامت)
3. Data transfer out: $200/month پر Alert (data transfer costs غیر متوقع طور پر spike کر سکتی ہیں)

Budgets ایک Slack channel کو alerts بھیجتے تھے۔ ٹیم نے دیکھا جب وہ limits کے قریب پہنچ رہی تھی، بجائے ماہانہ invoice پر دریافت کرنے کے۔

**Neglect کی لاگت**

Tom نے ایک spreadsheet بنائی۔ اس نے حساب لگایا Nimbus نے کتنا خرچ کیا:

- Unattached EBS volumes (16 ماہ): $3,680
- پرانے S3 snapshots (دریافت اور delete): $890
- Unneeded provisioned IOPS: $816
- gp2 سے gp3 migration savings (projected، اگر پہلے کیا): 18 ماہ میں $2,160
- Noncurrent S3 versions جمع: $1,340

شناخت کردہ کل waste: تقریباً $8,800 18 ماہ میں۔

"آٹھ ہزار آٹھ سو dollars،" Maya نے کہا۔

"Neglect سے،" Tom نے کہا۔ "غلط architectural decisions کرنے سے نہیں۔ Clean up نہ کرنے سے۔"

"Systematic fix کیا ہے؟"

"باقاعدہ audits،" Priya نے کہا۔ "ماہانہ Cost Explorer reviews۔ AWS Trusted Advisor خودبخود unattached volumes اور idle resources flag کرتا ہے۔ معلوم waste patterns کی cleanup خودکار کریں: N دنوں سے پرانے snapshots delete کریں، unattached EBS volumes پر alert کریں، پرانے S3 ورژنز expire کریں۔"

"اور،" Tom نے اضافہ کیا، "cost hygiene کو deployment process کا حصہ بنائیں۔ جب کوئی engineer EC2 instance terminate کرے، EBS volume خودبخود delete ہو جائے جب تک وہ واضح طور پر opt out نہ کریں۔"

## خوبیاں اور حدود

**Cost optimization discipline**:

- باقاعدہ reviews جمع ہونے والے waste کو significant ہونے سے پہلے catch کرتی ہیں
- Tagging accountability enable کرتی ہے — teams اپنی costs دیکھتی ہیں
- خودکار alerts billing surprises روکتے ہیں
- Lifecycle policies اور right-sizing اکثر set-and-forget savings ہیں

**جہاں پیچیدہ ہو جاتا ہے**:

- بہت سارے teams والے ایک بڑے account میں waste شناخت کرنے کے لیے centralized tooling کی ضرورت ہے
- کچھ waste جانتے بوجھتے ہے ("بس صورت میں" extra snapshots رکھنا) — cost/risk trade-off ایک judgment call ہے
- gp3 migration کے لیے careful validation کی ضرورت ہے (IOPS اور throughput defaults کچھ edge cases میں gp2 رویے سے مختلف ہو سکتی ہیں)
- Cost allocation tags کے لیے تمام teams کی discipline کی ضرورت ہے — inconsistent tagging data کو ادھورا بناتا ہے

## خلاصہ

- **Storage costs خاموشی سے جمع ہوتی ہیں** — باقاعدہ audits ضروری ہیں۔
- **Unattached EBS volumes** waste کا ایک عام source ہیں۔ انہیں delete کریں (یا instances terminate ہونے پر deletion خودکار کریں)۔
- **EBS right-sizing**: gp2 کو gp3 میں migrate کریں (عام طور پر 20% بچت)۔ Excess provisioned IOPS ہٹائیں۔
- **S3 versioning**: نامحدود ورژن history کے لیے ادائیگی سے بچنے کے لیے noncurrent ورژنز کے لیے lifecycle rules فعال کریں۔
- **EFS Intelligent-Tiering**: Access frequency کی بنیاد پر files کو خودبخود lower-cost tiers میں move کرتا ہے۔
- **Cost allocation tags**: Cost visibility اور accountability کے لیے team/project/environment metadata کے ساتھ resources tag کریں۔
- **AWS Budgets**: جب costs thresholds کے قریب پہنچیں تو Proactive alerts۔ ماہانہ bill سے کبھی حیران نہ ہوں۔

## امتحانی نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۱)*

- **Cost allocation tags**: billing console میں User-Defined Tags cost allocation کے لیے enable کریں؛ پھر resources tag کریں۔ Cost Explorer tags کے مطابق breakdowns دکھاتا ہے۔ امتحانی منظر نامہ: "identify کریں کہ کون سا department سب سے زیادہ S3 costs generate کر رہا ہے" → cost allocation tags۔
- **AWS Trusted Advisor**: underutilized EC2 instances، unattached EBS volumes، idle load balancers، اور دیگر waste sources شناخت کرتا ہے۔ Basic checks مفت؛ full checks Business/Enterprise Support کی ضرورت ہے۔
- **EBS cost components**: Storage (فی GB)، provisioned IOPS (اگر io1/io2 یا extra gp3)، throughput (اگر extra gp3)۔ جانیں کون سے components right-sized ہو سکتے ہیں۔
- **S3 versioning costs**: Noncurrent ورژنز current ورژنز کی طرح ہی rate پر stored اور charged ہوتے ہیں۔ Versioned buckets میں cost control کے لیے noncurrent ورژنز expire کرنے والے lifecycle rules critical ہیں۔
- **AWS Compute Optimizer**: EC2 utilization analyze کرتا ہے اور right-sized instance types recommend کرتا ہے۔ امتحانی اشارہ: "صحیح instance type منتخب کر کے EC2 costs کم کریں" → Compute Optimizer۔
- **AWS Cost Anomaly Detection**: unusual spending patterns detect کرنے کے لیے ML استعمال کرتا ہے۔ امتحانی اشارہ: "unexpected cost increases خودبخود detect کریں" → Cost Anomaly Detection۔

## مشقیں

**مشق ۱ — یادداشت**

بیان کریں کہ unattached EBS volumes costs generate کیوں کرتی ہیں چاہے کوئی EC2 instance انہیں استعمال نہ کر رہی ہو۔ EC2 instance terminate کرتے وقت engineers کو یہ waste avoid کرنے کے لیے کس process کی پیروی کرنی چاہیے؟

*(اشارہ: EBS volumes physical disk پر data store کرتی ہیں، اور وہ disk پیسے لاگت آتی ہے چاہے وہ پڑھی جا رہی ہو یا نہیں۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک کمپنی کا AWS bill چھ ماہ میں $5,000 سے $9,000/month تک بڑھ گیا ہے، لیکن انہوں نے نئی سروسز شامل نہیں کیں۔ Engineering team کو شک ہے کہ storage costs مسئلہ ہیں۔ کون سا AWS tools کا combination cost increase کو بہترین طریقے سے identify اور explain کرے گا؟

A) کون نے نئے resources بنائے یہ identify کرنے کے لیے API calls review کرنے کے لیے AWS CloudTrail  
B) Service-level cost breakdown کے لیے AWS Cost Explorer، اور idle اور unattached resource detection کے لیے AWS Trusted Advisor  
C) Resource utilization monitor کرنے اور cost alarms بنانے کے لیے Amazon CloudWatch  
D) تمام resources اور ان کی compliance status identify کرنے کے لیے AWS Config

**اشارہ ۱**: "Cost increase identify کریں" → سروس کے مطابق cost breakdown visualize کریں۔

**اشارہ ۲**: "Idle اور unattached resources" → ایک مخصوص tool انہیں proactively identify کرتا ہے۔

**اشارہ ۳**: CloudTrail API calls log کرتا ہے؛ Cost Explorer cost trends دکھاتا ہے۔ Cost analysis کے لیے کون زیادہ useful ہے؟

**جواب**: B

**وضاحت**: AWS Cost Explorer سروس، region، اور usage type کے مطابق cost trends breakdown دکھاتا ہے — identify کرنے کے لیے بالکل درست کہ کون سی سروس نے اضافہ drive کیا۔ AWS Trusted Advisor کے cost optimization checks unattached EBS volumes، idle EC2 instances، underutilized load balancers، اور دیگر عام waste sources identify کرتے ہیں۔

**A کیوں نہیں؟** CloudTrail logs کرتا ہے کس نے resources بنائے اور کب، لیکن cost trends یا identify نہیں کرتا کہ accumulated storage waste ہے۔

**C کیوں نہیں؟** CloudWatch resource performance (CPU، memory) monitor کرتا ہے — right-sizing کے لیے useful لیکن accumulated storage waste identify کرنے کے لیے نہیں۔

**D کیوں نہیں؟** AWS Config resource configurations اور compliance track کرتا ہے لیکن cost analysis tool نہیں ہے۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۱*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کا S3 bill "backups" label والے ایک bucket کے لیے $340/month دکھاتا ہے۔ Bucket versioning enabled ہے اور اس میں شامل ہے:

- Daily database snapshots (ان کی policy کے لیے 7 دن کافی ہیں)
- Weekly full backups (3 ماہ کے لیے رکھی جاتی ہیں)
- Quarterly archives (tax compliance کے لیے 7 سال رکھی جاتی ہیں)

ان retention requirements کو پوری کرتے ہوئے cost minimize کرنے کے لیے اس bucket کے لیے ایک lifecycle policy ڈیزائن کریں۔ ہر قسم کے data کو کون سی storage class استعمال کرنی چاہیے؟ پرانے ورژنز کو accumulate ہونے سے روکنے کے لیے آپ versioning کو کیسے handle کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد lifecycle policy design کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے cost audit findings ٹیم کو publish کیے۔

شناخت کردہ waste: 18 ماہ میں $8,800۔
نافذ تبدیلیوں سے متوقع سالانہ بچت: $6,200۔

پھر اس نے نیچے ایک line شامل کی: "اس میں Savings Plans ($14,200/year) یا S3 lifecycle policies ($7,800/year) سے savings شامل نہیں ہیں۔ Combined سالانہ optimization impact: تقریباً $28,200۔"

Maya نے اسے دو بار پڑھا۔

"یہ تقریباً ایک junior engineer کی salary ہے،" اس نے کہا۔

"Waste میں،" Tom نے تصدیق کی۔

"یا،" Leo نے کہا، "یہ proof ہے کہ یہ optimizations پہلے کرنا وہ junior engineer fund کر سکتا تھا۔"

Tom نے اسے دیکھا۔

"یہ صحیح طریقہ ہے اس کے بارے میں سوچنے کا،" اس نے کہا۔ "Cost optimization cutting کے بارے میں نہیں ہے۔ یہ ایسی چیزوں کے لیے ادائیگی نہ کرنے کے بارے میں ہے جو value نہیں بناتیں۔"

Maya نے document company wiki میں pin کر دیا۔

اگلے باب میں: database tier کو وہی treatment ملتا ہے، اور Tom ایک ایسی جگہ دریافت کرتا ہے جہاں وہ اصل میں under-investing تھا۔
