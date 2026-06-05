# باب ۲۹: Database Bill

Tom کے storage audit نے $8,800 waste شناخت کی تھی۔ اس نے database line items کی طرف رخ کیا۔

RDS Aurora: $647/month۔
RDS PostgreSQL (read replicas): $340/month۔
ElastiCache: $183/month۔

کل database tier: $1,170/month۔

"کچھ decide کرنے سے پہلے ہر ایک کو سمجھنے دیں،" اس نے کہا۔ "کیونکہ database وہ جگہ نہیں ہے جہاں corners cut کرنے سے پیسے بچائیں۔"

یہ دانشمند تھا۔ Database misconfiguration جو data loss یا performance degradation کا سبب بنے وہ بچت سے بہت زیادہ لاگت آتی ہے۔

Database کو گاڑی کے انجن کی طرح سوچیں۔ آپ گاڑی پر پیسے بچا سکتے ہیں سستا fuel استعمال کر کے، tire pressure adjust کر کے، اور boot سے unnecessary وزن ہٹا کر۔ لیکن اگر آپ oil change skip کر کے پیسے بچانے کی کوشش کریں، تو آپ engine seize کرنے کا خطرہ اٹھاتے ہیں — اور seized engine کی مرمت کسی بھی fuel savings سے بہت زیادہ لاگت آتی ہے۔ Tom جو audit چلانے والا ہے وہ اسی logic کی پیروی کرتا ہے: boot اور fuel tank میں waste تلاش کریں، اور جب تک آپ بالکل جانتے نہ ہوں engine کو اکیلا چھوڑیں۔

**پہلے اپنا Database Workload سمجھیں**

Databases میں cost optimization کرنے سے پہلے workload کو سمجھنا ضروری ہے۔

اہم سوالات:

- اوسط اور peak CPU utilization کیا ہے؟
- Read/write ratio کیا ہے؟
- Storage بڑھ رہی ہے، stable ہے، یا گھٹ رہی ہے؟
- کیا read replicas استعمال ہو رہی ہیں؟
- کیا instance under-provisioned ہے (slowdowns کا سبب) یا over-provisioned (idle capacity کے لیے ادائیگی کر رہے ہیں)؟

Tom نے پچھلے 30 دنوں میں تمام تین database services کے لیے CloudWatch metrics کھولے:

**Aurora cluster**:

- اوسط CPU: 18% (peak: Friday evenings پر 67%)
- Read/write ratio: 14:1 (read-heavy)
- Storage: 180GB (~5GB/month بڑھ رہی ہے)

**Read replicas (RDS PostgreSQL، Aurora سے الگ)**:

- یہ دو legacy RDS read replicas تھے جو Aurora migration سے پہلے بنائی گئی تھیں، ابھی بھی چل رہی تھیں۔
- ہر ایک پر اوسط connections: فی دن 2۔ اوسط CPU: 3%۔

"یہ ابھی تک کیوں چل رہی ہیں؟" Tom نے پوچھا۔

Leo نے instance creation dates دیکھیں۔ "یہ Aurora migration کے دوران fallback کے لیے بنائی گئی تھیں۔ ہم انہیں delete کرنا بھول گئے۔"

وہ لمحہ — جب ایک مہنگی چیز مہینوں سے بغیر استعمال کے چل رہی ہو — cloud environments میں ایک جانی پہچانی بات ہے۔

Replicas terminate ہو گئیں۔ ماہانہ بچت: $340۔

**RDS Reserved Instances: Database Version**

EC2 کی طرح، RDS committed usage کے لیے Reserved Instances پیش کرتا ہے۔

Aurora Serverless v2 کے لیے، Reserved Instances براہ راست apply نہیں ہوتیں — Serverless v2 dynamically scale کرتا ہے اور آپ per ACU-hour ادائیگی کرتے ہیں۔ تاہم، اگر آپ fixed Aurora instance configuration (Serverless نہیں) استعمال کر رہے ہیں، Reserved Instances 30-60% بچا سکتے ہیں۔

Tom نے Aurora provisioned instances review کیے (writer اور ایک reader):

- Writer instance: db.r6g.large، On-Demand = $0.26/hour = $190/month
- Reader instance: db.r6g.large، On-Demand = $0.26/hour = $190/month

دونوں کے لیے 1-year Reserved Instances: ~$108/month ہر ایک۔ سالانہ بچت: $984۔

"رکو،" Leo نے کہا۔ "ہم نے باب ۲۴ میں Aurora Serverless v2 پر migrate کیا۔ Tom provisioned instances پر On-Demand کیوں دیکھ رہا ہے؟"

اچھی پکڑ۔ آئیے واضح ہوتے ہیں: Nimbus کا primary Aurora writer Serverless v2 استعمال کرتا ہے۔ Reader (read replicas کے لیے) بھی Serverless v2 استعمال کرتا ہے۔ Serverless v2 کے روایتی Reserved Instances نہیں ہیں — آپ per ACU-hour ادائیگی کرتے ہیں۔

Fixed Aurora instances (Serverless نہیں) چلانے والی teams کے لیے، Reserved Instances significant savings ہیں۔ Serverless v2 workloads کے لیے، savings خود ہی سروس کی auto-scaling nature سے آتی ہیں — آپ unused capacity کے لیے ادائیگی نہیں کرتے۔

**DynamoDB: On-Demand بمقابلہ Provisioned**

باب ۹ میں، ہم نے DynamoDB کے دو capacity modes متعارف کرائے: on-demand اور provisioned۔

Nimbus شروع سے DynamoDB on-demand mode میں چلا رہا تھا۔ کم ٹریفک پر، یہ درست تھا — on-demand فی request زیادہ مہنگا ہے لیکن کوئی minimum charge نہیں۔

اب، CloudWatch میں 18 ماہ کے ٹریفک data کے ساتھ، Tom patterns دیکھ سکتا تھا۔

اوسط read capacity units فی دن: 45,000
اوسط write capacity units فی دن: 12,000
Peak day (Friday): اوسط DynamoDB requests کا 180% (ElastiCache ~95% reads absorb کرتا ہے، اس لیے DynamoDB صرف overall 25x آرڈر volume spike کا ایک fraction دیکھتا ہے)

**On-demand pricing**: $1.25 per million write requests، $0.25 per million read requests۔
**Provisioned pricing**: $0.00065 per write capacity unit per hour، $0.00013 per read capacity unit per hour۔

Tom نے break-even point حساب لگایا: provisioned capacity سستی ہو جاتی ہے جب آپ اسے اتنی consistently استعمال کریں کہ idle periods کے دوران on-demand premium کے لیے ادائیگی نہ کریں۔

18 ماہ کے data کے ساتھ consistent daily patterns دکھاتے ہوئے، **DynamoDB Auto Scaling** کے ساتھ provisioned capacity درست انتخاب تھا:

- Minimum capacity اوسط load کے 60% پر سیٹ کریں
- Maximum اوسط کے 250% پر (Friday spikes سنبھالتا ہے)
- Auto Scaling ان bounds کے درمیان provisioned capacity adjust کرتا ہے

ماہانہ DynamoDB لاگت: on-demand سے $340 سے $230 (provisioned with auto scaling) تک گری۔ 32% کمی۔

"لیکن اگر ہم over-provision کریں،" Leo نے پوچھا، "تو ہم unused capacity کے لیے ادائیگی کرتے ہیں۔"

"یہ خطرہ ہے،" Tom نے کہا۔ "Auto Scaling کے ساتھ، ہم minimum throttling avoid کرنے کے لیے کافی اونچا سیٹ کریں، اور AWS ہمارے range کے اندر manage کرے۔"

"اور اگر ہمارا ٹریفک pattern نمایاں طور پر بدلے؟"

"تو ہم bounds adjust کریں۔ ہم اسے تیماہی review کرتے ہیں۔"

**ElastiCache: Right-Sizing اور Reserved Nodes**

ElastiCache bill: $183/month۔ ہر AZ میں ایک cache.r6g.large Redis instance (دو nodes، primary + replica)۔

CloudWatch metrics نے دکھایا:

- اوسط memory utilization: 34%
- Peak: 58%

Instance over-provisioned تھا۔ ایک cache.r6g.medium شاید load headroom کے ساتھ سنبھال لیتا۔

r6g.large (2 nodes × $0.127/hour) سے r6g.medium (2 nodes × $0.065/hour) میں جانا:

Large = 2 × $0.127 × 730 گھنٹے = $185/month۔ Medium = 2 × $0.065 × 730 = $95/month۔ Saving: $90/month۔

Tom نے دو ہفتوں کے لیے staging میں medium instance load کے تحت test کیا۔ Memory 71% peak پر پہنچا۔ Limit کے کافی قریب کہ وہ uncomfortable تھا۔

اس نے cache.r6g.large کو لیکن Reserved Nodes (1-year commitment) کے ساتھ try کیا: On-Demand $185 سے Reserved $120/month۔ Saving: $65/month instance type بدلے بغیر۔

"کبھی کبھی چھوٹے instance پر right-sizing کرنے سے performance incident کا خطرہ ہوتا ہے،" اس نے کہا۔ "Reserved Nodes ہمیں کم خطرے کے ساتھ وہی savings دیتے ہیں۔"

**RDS Backup Retention: Storage Trade-Off**

RDS automated backups S3 میں stored ہوتے ہیں (آپ کے database size کے 100% تک کے storage کے لیے بغیر اضافی چارج کے)۔ Default retention 7 دن ہے۔

Nimbus کے 180GB Aurora database کے لیے، 7 دن کے backups مناسب تھے — انہوں نے testing میں اس window کے اندر backup سے restore کرنے کے قابل ہونا confirm کیا تھا۔

لیکن Tom نے notice کیا: انہوں نے ہر significant deployment سے manual snapshots بھی تھے، غیر معینہ مدت تک رکھے گئے۔

23 manual snapshots، کل 4.1TB snapshot storage۔
لاگت: Aurora backups کے لیے $0.095/GB/month = manual snapshot storage میں $389/month۔

انہوں نے فی environment (production، staging) آخری 3 manual snapshots رکھے۔ باقی delete کر دیے۔
Saving: $350/month۔

"ہم $350 ماہانہ insurance کے لیے ادا کر رہے تھے جو ہم نے کبھی استعمال نہیں کی،" Leo نے کہا۔

"ہم peace of mind کے لیے ادا کر رہے تھے،" Tom نے درست کیا۔ "سوال ہے: کتنا peace of mind $350 ماہانہ کی قیمت ہے؟"

"ایک مناسب disaster recovery plan کے ساتھ،" Priya نے کہا، "آپ 7 دن کے automated backups اور 3 manual snapshots سے وہی peace of mind حاصل کر سکتے ہیں۔"

"متفق۔ اب۔"

**Database Optimization Summary**

| Service                                              | پہلے     | بعد      | ماہانہ بچت |
|------------------------------------------------------|-----------|----------|------------|
| RDS Read Replicas (unused)                           | $340      | $0       | $340       |
| Aurora (Reserved Instances)                          | $190      | $120     | $70        |
| DynamoDB (On-Demand → Provisioned + Auto Scaling)    | $340      | $230     | $110       |
| ElastiCache (Reserved Nodes)                         | $185      | $120     | $65        |
| Aurora manual snapshots                              | $389      | $39      | $350       |
| **کل**                                               | **$1,444**| **$509** | **$935/month** |

Database savings میں $935 فی ماہ۔ $11,220 فی سال۔

Tom نے یہ نمبر storage savings ($6,200/year) اور Savings Plan savings ($14,200/year) کے ساتھ رکھا۔

کل optimization impact: $31,620/year۔

"یہ تین junior engineers ہیں،" Maya نے کہا۔

"یا ایک senior،" Priya نے کہا۔

"یا بارہ ماہ کے experiments،" Leo نے کہا۔

تینوں درست تھے۔

## خوبیاں اور حدود

**DynamoDB Provisioned with Auto Scaling**:

- قابل پیش گوئی، consistent workloads کے لیے on-demand سے سستی
- Auto Scaling variability کو permanently over-provisioning کے بغیر سنبھالتا ہے
- Monitoring کی ضرورت ہے تاکہ capacity bounds مناسب رہیں

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Stable، long-running workloads کے لیے significant savings
- Locked commitment — اگر آپ کی ضروریات بدلیں، آپ نے unused capacity کے لیے ادائیگی کی ہے
- RI Marketplace unused RDS RIs بیچنے کی اجازت دیتا ہے (Convertible کے برعکس، جو نہیں بیچا جا سکتا)

**عمومی اصول**:

- Optimizing سے پہلے ہمیشہ utilization سمجھیں
- Unused resources (legacy read replicas کی طرح) سب سے زیادہ return optimization ہیں
- Right-sizing کو production پر apply کرنے سے پہلے staging میں validate کرنے کی ضرورت ہے
- Reserved pricing workload stability پر اعتماد کی ضرورت ہے

## خلاصہ

- **پہلے audit کریں**: کوئی بھی database changes کرنے سے پہلے CloudWatch metrics pull کریں۔
- **Unused resources delete کریں**: Read replicas، idle databases، اور test instances جن کی مزید ضرورت نہیں۔
- **DynamoDB On-Demand بمقابلہ Provisioned**: غیر قابل پیش گوئی ٹریفک کے لیے On-Demand؛ consistent patterns کے لیے Provisioned + Auto Scaling۔
- **ElastiCache Reserved Nodes**: Stable workloads کے لیے EC2 Reserved Instances کی طرح۔ 30-50% savings۔
- **RDS snapshot management**: صرف جن snapshots کی ضرورت ہو وہ رکھیں۔ Manual snapshots delete ہونے تک غیر معینہ مدت تک stored ہوتے ہیں۔
- **Caution کے ساتھ Right-size کریں**: Database right-sizing performance incidents کا خطرہ رکھتی ہے۔ Staging میں test کریں، load کے تحت validate کریں۔

## امتحانی نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۳)*

- **DynamoDB pricing modes**: On-Demand = pay per request (زیادہ per-unit لاگت، کوئی minimum نہیں)۔ Provisioned = pay per capacity unit per hour (کم per-unit لاگت، capacity allocate ضروری ہے)۔ **DynamoDB Auto Scaling** provisioned capacity خودبخود adjust کرتا ہے۔
- **RDS Reserved Instances**: تمام RDS engine types کے لیے دستیاب۔ Multi-AZ deployments Reserved Instances استعمال کر سکتی ہیں (آپ Multi-AZ commit کرتے ہیں)۔ 1- یا 3-year term۔
- **ElastiCache Reserved Nodes**: EC2 Reserved Instances جیسا commitment model۔ Per node apply ہوتا ہے، per cluster نہیں۔
- **RDS snapshot storage**: Automated backups database size کے 100% تک مفت ہیں۔ Manual snapshots S3 میں فی GB فی ماہ charged۔ امتحانی منظر نامہ: "RDS storage costs کم کریں" → پرانے manual snapshots delete کریں۔
- **DynamoDB reserved capacity**: DynamoDB کے لیے بھی دستیاب ہے (1 یا 3 سال کے لیے ایک region میں تمام DynamoDB tables میں specific read/write capacity کے لیے discount پر pre-pay)۔ Standard provisioned سے مختلف — آپ capacity کے لیے pre-pay کرتے ہیں۔
- **Aurora Serverless v2 بمقابلہ provisioned**: Serverless v2 خودبخود scale کرتا ہے، variable workloads کے لیے ideal۔ Stable، قابل پیش گوئی workloads کے لیے Reserved Instances کے ساتھ Provisioned سستا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

بیان کریں DynamoDB on-demand capacity کب بمقابلہ Auto Scaling کے ساتھ provisioned capacity کب استعمال کریں۔ یہ فیصلہ کرنے کے لیے آپ کو کون سی معلومات چاہیے؟

*(اشارہ: اس کے بارے میں سوچیں کہ ٹریفک data کے لحاظ سے "قابل پیش گوئی" کا کیا مطلب ہے، اور on-demand کیا خطرہ ختم کرتا ہے جو provisioned متعارف کرتا ہے۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک کمپنی ایک mobile game کے leaderboard کے لیے ایک DynamoDB table چلاتی ہے۔ ٹریفک ایک seasonal event کے دوران بہت بھاری peak ہوتی ہے (تیماہی ایک ہفتہ، 10x normal ٹریفک) لیکن دوسری صورت میں بہت consistent ہے۔ Seasonal event سے باہر، کمپنی performance maintain کرتے ہوئے database costs minimize کرنا چاہتی ہے۔

کون سی DynamoDB capacity strategy ان ضروریات کو بہترین طریقے سے پوری کرتی ہے؟

A) Seasonal peaks کو بغیر throttling کے سنبھالنے کے لیے On-demand capacity  
B) Provisioned capacity ہمیشہ peak seasonal levels (10x ٹریفک کے لیے ہمیشہ provisioned) پر سیٹ کریں  
C) Maximum capacity seasonal peak کے لیے سیٹ کے ساتھ DynamoDB Auto Scaling کے ساتھ Provisioned capacity  
D) Normal ٹریفک levels پر 3 سال کے لیے DynamoDB reserved capacity units

**اشارہ ۱**: "Consistent ٹریفک سوائے معلوم seasonal peaks کے" — کون سا mode دونوں کو مؤثر طریقے سے سنبھالتا ہے؟

**اشارہ ۲**: "Costs minimize کریں" off-peak کا مطلب ہے آپ 10x کے لیے ہمیشہ over-provision نہیں کر سکتے۔

**اشارہ ۳**: DynamoDB Auto Scaling seasonal event کے لیے scale up اور بعد میں scale down کر سکتا ہے۔

**جواب**: C

**وضاحت**: Auto Scaling کے ساتھ Provisioned capacity actual ٹریفک کی بنیاد پر table scale کرتی ہے۔ Normal periods کے دوران، capacity normal levels پر ہوتی ہے (کم لاگت)۔ Seasonal event کے دوران، Auto Scaling ٹریفک میں اضافہ detect کرتا ہے اور configured maximum level تک scale کرتا ہے (10x peak سنبھالتا ہے)۔ Event کے بعد، یہ واپس scale down ہو جاتا ہے۔ یہ normal periods کے دوران on-demand سے سستا ہے (on-demand فی request زیادہ لاگت) اور 10x کے لیے ہمیشہ provisioning سے سستا ہے۔

**A کیوں نہیں؟** On-demand throttling کے بغیر peaks سنبھالتا ہے لیکن normal، قابل پیش گوئی ٹریفک کے دوران provisioned سے فی request زیادہ لاگت آتی ہے۔

**B کیوں نہیں؟** 10x پر permanently provisioning کا مطلب ہے سال کے 75% provisioned capacity کا 75% بیکار بیٹھتا ہے — کبھی استعمال نہ ہونے والی capacity کے لیے ادائیگی کر رہے ہیں۔

**D کیوں نہیں؟** Reserved capacity units آپ کو normal ٹریفک levels پر lock کرتے ہیں۔ 10x seasonal event کے دوران، آپ reserved مقدار سے آگے throttled ہو جائیں گے، یا آپ کو on-demand on top میں شامل کرنا ہوگا۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۳*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus ایک نئی خصوصیت evaluate کر رہا ہے: ایک ریستوران analytics dashboard جو real-time آرڈر counts، فی گھنٹہ revenue، اور customer demographics دکھاتا ہے۔ یہ data تقریباً فی منٹ 200 بار query کرے گا (10 analysts کے ساتھ ایک query فی analyst فی page refresh)۔

فی الحال analytics data Athena (S3) میں ہے۔ کیا انہیں dashboard Athena پر بنانا چاہیے، یا data ایک database میں load کرنا چاہیے؟ اگر database ہو، کون سا ایک (Aurora، DynamoDB، Redshift)؟

غور کریں: query frequency، data freshness requirements، query complexity (aggregations، joins)، اور اس volume پر لاگت per query۔

*(کوئی ایک درست جواب نہیں ہے۔ مقصد analytics workloads کے لیے database selection کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے Maya کو مکمل cost optimization summary پیش کی۔

تین ماہ کا کام۔ $31,620 سالانہ savings شناخت۔ $26,400 تبدیلیاں پہلے ہی نافذ۔

"باقی $5,220 کیا ہے؟" Maya نے پوچھا۔

"Optimizations جن کے بارے میں میں ابھی confident نہیں ہوں،" Tom نے کہا۔ "Aurora configuration کو مزید right-sized کیا جا سکتا ہے، لیکن commit کرنے سے پہلے مجھے ایک مزید quarter کا data چاہیے۔ اور ایک data transfer question ہے جسے میں نے پوری طرح analyze نہیں کیا۔"

"Networking costs۔"

"ہاں۔ اگلی بار۔"

Maya نے numbers دیکھے۔ "Tom، میں ایک چیز سمجھنا چاہتی ہوں۔ یہ optimization — آپ تین ماہ سے اس پر کام کر رہے ہیں۔ یہ آپ کے وقت کا ایک significant حصہ ہے۔"

"تقریباً 30%۔"

"اور آپ نے $26,400 فی سال بچائے۔ تو optimization چار مہینوں کی آپ کی salary میں ادا ہو جاتی ہے؟"

Tom نے اسے دیکھا۔ "تقریباً۔"

"اور اس کے بعد ہر سال، یہ pure savings ہے۔"

"یا pure reinvestment،" اس نے کہا۔ "ایک ہی effect۔"

Maya نے سر ہلایا۔ "یہی وہی ہے جو میں چاہتی ہوں کہ آپ کریں۔ Savings Plans اور databases پر صرف نہیں — ہر چیز پر۔ Cost optimization کو آپ کے role کا continuous function بنائیں۔"

Tom نے پہلے کبھی اپنا job اس طرح describe نہیں سنا تھا۔ اسے دونوں accurate اور satisfying لگا۔

اگلے باب میں: آخری remaining cost category — اور وہ جو تقریباً ہر کسی کو حیران کرتا ہے۔
