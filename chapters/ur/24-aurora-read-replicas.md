# باب ۲۴: وہ ڈیٹابیس جو آپ کے ساتھ بڑھتا ہے

Tom کے cost review نے database tier میں کچھ غیر متوقع پایا۔

Nimbus RDS PostgreSQL چلا رہا تھا: Multi-AZ، db.r6g.large instance۔ $340/month۔

"یہ زیادہ لگتا ہے،" Tom نے کہا۔ "لیکن میں نہیں جانتا کہ اسے کس سے compare کروں۔"

Leo نے performance metrics کھولے۔ Database CPU Friday dinner rush کے دوران 85% تک spike ہو رہا تھا۔ Read queries queue ہو رہی تھیں۔ P95 query latency چھ ماہ میں دوگنی ہو گئی تھی۔

"Database bottleneck ہے،" اس نے کہا۔ "Traffic بڑھی ہے۔ Database اس کے ساتھ scale نہیں ہوا۔"

"کیا ہم instance کو بڑا نہیں کر سکتے؟" Maya نے پوچھا۔

"ہاں،" Leo نے کہا۔ "یہ vertical scaling ہے۔ ہم r6g.large سے r6g.xlarge پر move کرتے ہیں۔ زیادہ CPU، زیادہ memory۔ زیادہ لاگت آئے گی اور وقت خریدے گا۔"

"لیکن یہ بنیادی مسئلہ ٹھیک نہیں کرتا،" Priya نے کہا۔ "آخرکار ہم سب سے بڑے instance پر پہنچیں گے اور ایک مختلف approach کی ضرورت ہوگی۔"

"دو approaches ہیں،" Leo نے کہا۔ "Read replicas، یا Aurora۔"

"کیا فرق ہے؟"

ایک اچھا سوال۔ اس باب کا باقی جواب ہے۔

ایک مصروف library کا تصور کریں جس میں ایک librarian ہے جو کتابیں check in بھی کرتا ہے اور patron کے سوالوں کا جواب بھی دیتا ہے۔ Library مشہور ہونے پر ایک queue بن جاتی ہے۔ Fix: مزید librarians hire کریں — لیکن صرف سوالوں کے جواب دینے کے لیے۔ Check-in اب بھی original desk کے ذریعے جاتا ہے۔ یہ ایک read replica ہے: extra capacity جو reads سنبھالتی ہے، جبکہ تمام writes اب بھی ایک authoritative source کے ذریعے جاتی ہیں۔ Aurora ایک قدم آگے جاتا ہے، shelving system کو ہی redesign کرتا ہے تاکہ ہر librarian ایک ہی shelves share کرے اور ہمیشہ ایک ہی کتابیں دیکھے، بغیر delay کے۔

**Read Replicas: Read Traffic تقسیم کرنا**

زیادہ تر ویب ایپلیکیشنز لکھنے سے کہیں زیادہ data پڑھتی ہیں۔ مینو browse کرنے والا customer درجنوں SELECT queries کرتا ہے۔ آرڈر دینے سے چند INSERT/UPDATE queries ہوتی ہیں۔ Ratio عام طور پر 10:1 یا اس سے زیادہ ہوتا ہے۔

ایک **read replica** ایک اضافی RDS instance ہے جو primary سے تمام writes کی ایک copy وصول کرتا ہے اور وہ writes SELECT queries کے لیے available بناتا ہے۔

یہ کیسے کام کرتا ہے:

1. Application writes (INSERT، UPDATE، DELETE) primary database جاتی ہیں
2. Primary ان تبدیلیوں کو asynchronously read replicas میں replicate کرتا ہے
3. Application reads (SELECT) read replicas میں distribute ہوتے ہیں
4. Read replicas load share کرتی ہیں — ہر ایک total read traffic کا ایک حصہ سنبھالتی ہے

نتیجہ: primary database صرف writes (اور اختیاری طور پر کچھ reads) سنبھالتا ہے۔ Read replicas read load سنبھالتی ہیں۔ 10:1 read/write ratio کے لیے، ایک read replica شامل کرنے سے primary کا total load تقریباً آدھا ہو جاتا ہے۔

**اہم limitation**: Replication **asynchronous** ہے۔ Replication lag ہے — عام طور پر milliseconds، لیکن load کے تحت seconds ہو سکتی ہے۔ Replica سے read میں primary سے قدرے پیچھے data نظر آ سکتا ہے۔ زیادہ تر reads کے لیے (مینو browse کرنا، آرڈر history دیکھنا)، یہ acceptable ہے۔ "کیا میرا آرڈر گیا؟" کے لیے — primary سے پڑھیں۔

**Read Replicas: تفصیلات**

- آپ کے پاس فی primary RDS instance پانچ read replicas تک ہو سکتی ہیں
- Read replicas ایک ہی region یا مختلف region میں ہو سکتی ہیں (cross-region replicas)
- Read replicas کی خود بھی read replicas ہو سکتی ہیں (chaining)
- Read replicas الگ endpoints ہیں — آپ کی ایپلیکیشن کو reads کو replica endpoint کی طرف direct کرنا ضروری ہے
- Read replicas DR کے لیے standalone databases میں promote کی جا سکتی ہیں

Nimbus کے لیے، Leo نے ایک read replica شامل کی۔ اس نے ایپلیکیشن update کی:

- Write operations → primary endpoint
- مینو browsing، آرڈر history → replica endpoint

Primary پر CPU Friday peak پر 85% سے 41% تک گر گیا۔

Tom نے لاگت دیکھی: ایک ہی instance type کی read replica اتنی ہی لاگت آتی ہے جتنی primary۔ $340/month سے $680/month۔

"ہم نے load تقریباً آدھا کرنے کے لیے لاگت دوگنی کی،" Tom نے کہا۔

"ہاں۔ لیکن متبادل ایک بڑے instance type میں جانا تھا، جو بھی زیادہ لاگت آتا اور read load distribute نہیں کرتا۔"

Tom نے حساب لگایا۔ اس نے ہچکچاتے ہوئے سر ہلایا۔

"Aurora کیا ہے؟" اس نے پوچھا۔

**Amazon Aurora: Database Engine کو از سر نو سوچنا**

Aurora AWS کا proprietary relational database engine ہے، MySQL اور PostgreSQL کے ساتھ compatible۔ اسے cloud workloads کے لیے scratch سے ڈیزائن کیا گیا تھا، یہ دوبارہ سوچتے ہوئے کہ relational database کا storage layer کیسے کام کرتا ہے۔

روایتی RDS setup (MySQL، PostgreSQL) میں، storage اور compute tightly coupled ہیں۔ Database engine data files manage کرتا ہے۔ Replication primary سے replica میں data copy کرتی ہے۔ Replica کو ہر write operation دوبارہ کرنا ضروری ہے۔

Aurora storage کو compute سے الگ کرتا ہے۔ یہ تین Availability Zones میں چھ copies میں data خودبخود replicate کرنے والا distributed، fault-tolerant storage layer استعمال کرتا ہے۔ Compute layer (database instances) اس storage layer کے اوپر بیٹھتی ہے۔

**یہ کیا بدلتا ہے**:

**Read replicas**: Aurora replicas کو data replicate نہیں کرنا پڑتا — وہ پہلے سے ایک ہی storage layer share کرتی ہیں۔ اس کا مطلب ہے:

- 15 read replicas تک (regular RDS کے 5 بمقابلہ)
- Replication lag عام طور پر 100 milliseconds سے کم (RDS load کے تحت seconds بمقابلہ)
- Replicas 30 سیکنڈ سے کم میں primary میں promote ہو سکتی ہیں (minutes بمقابلہ)

**Failover**: کیونکہ replicas storage share کرتی ہیں، failover بہت تیز ہے — promotion میں data transfer نہیں، صرف writes redirect کرنا۔

**Storage**: Aurora خودبخود 10GB increments میں storage scale کرتا ہے، 128TB تک۔ آپ کو پہلے سے storage provision نہیں کرنی پڑتی۔

**کارکردگی**: Aurora برابر instance types کے لیے standard MySQL کے 5x throughput اور standard PostgreSQL کے 3x کا دعوی کرتا ہے۔

**Aurora Pricing: Tom کا سوال**

"اس کی کتنی لاگت ہے؟" Tom نے پوچھا۔

Aurora pricing RDS سے مختلف ہے:

**Instance pricing**: RDS instance pricing کی طرح۔

**Storage pricing**: $0.10 per GB per month (آپ جو stored ہے اس کے لیے ادائیگی کریں، خودبخود scaled)۔

**I/O pricing**: Aurora فی I/O request (storage پر read/write) charge کرتا ہے۔ Write-heavy workloads کے لیے یہ significant ہو سکتا ہے۔

"رکو،" Tom نے کہا۔ "ہم I/O کے لیے الگ ادائیگی کر رہے ہیں؟"

"Aurora Serverless v2 اور Aurora I/O-Optimized اس pricing model کو بدلتے ہیں،" Leo نے کہا۔ "Aurora I/O-Optimized کوئی I/O fee نہیں لیتا لیکن زیادہ storage اور instance قیمت چارج کرتا ہے۔ I/O-heavy workloads کے لیے بہتر ہے۔"

Tom نے trade-off دیکھا۔ Nimbus کے لیے، جو read-heavy تھا (بہت ساری مینو queries، کم writes)، Aurora I/O-Optimized زیادہ لاگت آ سکتا تھا۔ Standard Aurora pricing appropriate ہو سکتی تھی۔

یہ ایک real cost فیصلہ ہے جو senior engineers کرتے ہیں: آپ کو صحیح انتخاب کرنے کے لیے اپنے workload کے I/O patterns جاننے ضروری ہیں۔

**Aurora Serverless: Instances کے بارے میں سوچے بغیر Scaling**

**Aurora Serverless v2** ایک configuration ہے جو actual database load کی بنیاد پر خودبخود compute capacity scale کرتی ہے۔ ایک fixed instance size (db.r6g.large) چننے کے بجائے، آپ Aurora Capacity Units (ACUs) میں minimum اور maximum capacity سیٹ کرتے ہیں۔

Aurora Serverless v2:

- Load بڑھنے پر seconds میں scale up کرتا ہے
- Idle periods کے دوران near-zero تک scale down کرتا ہے
- لاگت: $0.12 per ACU-hour (plus storage اور I/O)

Variable traffic والے workloads کے لیے — Nimbus کے Friday spikes بمقابلہ پیر صبح خاموشی — Serverless v2 off-peak periods کے دوران costs کم کرتا ہے اور بغیر pre-provisioning کے peaks سنبھالتا ہے۔

"تو Friday spike کے دوران،" Leo نے کہا، "Aurora خودبخود scale up کرتا ہے۔ Sunday صبح جب ہمارے پاس تقریباً کوئی traffic نہیں، یہ واپس minimum تک scale down ہوتا ہے۔"

"اور ہم صرف جو capacity استعمال کر رہے ہیں اس کے لیے ادائیگی کرتے ہیں،" Tom نے کہا۔

"Correct۔"

Tom کے چہرے پر اس شخص کا اظہار تھا جسے بالکل وہ ملا جس کی وہ تلاش کر رہا تھا۔

**Aurora Global Database: Multi-Region Reads**

**Aurora Global Database** Aurora کو متعدد AWS regions میں extend کرتا ہے:

- ایک **primary region** تمام writes سنبھالتا ہے
- **پانچ secondary regions** تک reads کے ساتھ عام طور پر <1 second replication lag
- Secondary regions <1 منٹ میں primary میں promote ہو سکتی ہیں (DR scenarios کے لیے)

Nimbus کے عالمی expansion کے لیے، Aurora Global Database London کے ریستوران partner کو EU read replica سے اپنا مقامی مینو query کرنے دیتا، جبکہ تمام آرڈرز (writes) US primary کے ذریعے جاتے۔

**RDS بمقابلہ Aurora: کب کون سا چنیں**

| Factor            | RDS (PostgreSQL/MySQL)        | Aurora                                                      |
|-------------------|-------------------------------|-------------------------------------------------------------|
| لاگت              | چھوٹے workloads کے لیے کم    | زیادہ base، لیکن بہتر scale کرتی ہے                          |
| Compatibility     | مکمل                          | MySQL/PostgreSQL compatible (معمولی فرقوں کے ساتھ)          |
| Max replicas      | 5                             | 15                                                          |
| Replica lag       | Seconds ہو سکتی ہے            | عام طور پر <100ms                                           |
| Storage           | Fixed provisioning            | 128TB تک auto-scales                                        |
| Failover time     | 60-120 seconds                | <30 seconds                                                 |
| Serverless option | محدود                         | Aurora Serverless v2                                        |
| بہترین برائے      | Stable، قابل پیش گوئی        | Variable traffic، high read volume، fast failover کی ضرورت |

## خوبیاں اور حدود

**Aurora کی خوبیاں**:

- Standard RDS سے نمایاں طور پر تیز failover
- کم lag کے ساتھ 15 read replicas تک
- Auto-scaling storage
- Variable workloads کے لیے Serverless v2
- Multi-region deployment کے لیے Global Database

**Aurora کی حدود**:

- چھوٹے، stable workloads کے لیے زیادہ لاگت
- Write-heavy workloads کے لیے I/O pricing significant ہو سکتی ہے (I/O-Optimized استعمال کریں)
- معمولی MySQL/PostgreSQL compatibility فرقوں کے لیے code تبدیلیاں درکار ہو سکتی ہیں
- Serverless v2 cold starts (near-zero سے) latency spikes پیدا کر سکتے ہیں

## خلاصہ

- **Read replicas** primary سے read traffic distribute کرتی ہیں۔ Asynchronous replication — زیادہ تر reads کے لیے قابل قبول lag۔
- **Aurora** storage layer کو re-imagine کرتا ہے: distributed، replicas میں shared، auto-scaling۔
- Aurora پیش کرتا ہے: 15 read replicas، <100ms replica lag، <30s failover، 128TB تک auto-scaling storage۔
- **Aurora Serverless v2**: load کی بنیاد پر compute capacity خودبخود scale کرتا ہے۔ Variable traffic کے لیے اچھا۔
- **Aurora Global Database**: ایک region میں primary، پانچ regions تک read replicas۔
- چھوٹے، stable، قابل پیش گوئی workloads کے لیے RDS چنیں۔ Scale، fast failover، یا variable traffic handling کی ضرورت پر Aurora چنیں۔

## امتحانی نکات

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں (ڈومین ۳، ٹاسک ۳.۳)*

- **Aurora replica بمقابلہ RDS read replica**: Aurora replicas storage share کرتی ہیں (near-zero lag، <30s failover)۔ RDS read replicas data replicate کرتی ہیں (lag ممکن، failover کے لیے minutes)۔
- **Aurora Serverless v2**: "database capacity خودبخود scale کریں،" "غیر قابل پیش گوئی یا spiky database traffic،" "zero تک scale" → Aurora Serverless v2۔
- **Aurora Global Database**: "multi-region database،" "EU میں US primary سے کم latency کے ساتھ پڑھیں،" "regional failover کے لیے RTO < 1 منٹ" → Aurora Global Database۔
- **Failover timing**: Aurora < 30 seconds۔ RDS Multi-AZ 60-120 seconds۔ دونوں جانیں۔
- **Aurora I/O-Optimized**: زیادہ storage اور instance لاگت، کوئی per-I/O charge نہیں۔ جب I/O costs dominate ہوں (write-heavy) استعمال کریں۔ Standard Aurora: کم storage لاگت، pay per I/O۔ Read-heavy کے لیے استعمال کریں۔
- **Aurora Backtrack**: Full backup snapshot restore کیے بغیر database کو ایک مخصوص وقت پر rewind کریں۔ صرف MySQL-compatible Aurora کے لیے available۔ امتحانی اشارہ: "غلطی سے data delete ہوا، full backup restore کیے بغیر جلدی بحال کرنا ضروری۔"

## مشقیں

**مشق ۱ — یادداشت**

Aurora اور standard RDS read replicas کے درمیان فرق بیان کریں۔ Aurora کی replication lag کیوں عام طور پر کم ہوتی ہے؟

*(اشارہ: اہم فرق shared storage بمقابلہ data replication ہے۔ سوچیں کہ ہر replica کو write آنے پر کیا کرنا ضروری ہے۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک social media platform کا MySQL database increasing traffic کی وجہ سے high read latency محسوس کر رہا ہے۔ ایپلیکیشن read-heavy ہے (95% reads، 5% writes)۔ ٹیم کو traffic spikes کے دوران بھی consistent read latency کی ضرورت ہے۔ انہیں minimal downtime (target RTO < 30 seconds) کے ساتھ خودکار failover کی ضرورت ہے۔ Data volume غیر قابل پیش گوئی طریقے سے بڑھ رہا ہے۔

کون سا database solution ان ضروریات کو بہترین طریقے سے پوری کرتا ہے؟

A) پانچ read replicas کے ساتھ RDS MySQL Multi-AZ  
B) Aurora Replicas اور Aurora Serverless v2 کے ساتھ Aurora MySQL  
C) Larger instance type (vertical scaling) کے ساتھ RDS MySQL  
D) Read caching کے لیے DynamoDB DAX کے ساتھ RDS کے لیے DynamoDB

**اشارہ ۱**: "RTO < 30 seconds" — کون سی سروس یہ حاصل کرتی ہے؟ ہر option کے لیے failover timing چیک کریں۔

**اشارہ ۲**: "Spikes کے دوران Consistent read latency" — کون سی سروس کی replicas near-zero lag بمقابلہ potential seconds of lag رکھتی ہیں؟

**اشارہ ۳**: "Unpredictably growing data volume" — کون سی سروس storage خودبخود scale کرتی ہے؟

**جواب**: B

**وضاحت**: Aurora MySQL with Aurora Replicas load کے تحت consistent read performance کے لیے near-zero replication lag (milliseconds، not seconds) فراہم کرتی ہے۔ Aurora Serverless v2 traffic spikes کے دوران over-provisioning کے بغیر compute خودبخود scale کرتا ہے۔ Aurora storage data بڑھنے کے ساتھ auto-scales۔ Aurora failover (replica کی promotion) 30 سیکنڈ سے کم میں complete ہوتی ہے — RTO ضرورت پوری کرتا ہے۔

**A کیوں نہیں؟** RDS Multi-AZ failover 60-120 seconds لیتا ہے — RTO < 30 seconds پوری نہیں کرتا۔ Standard RDS read replica lag load کے تحت seconds تک پہنچ سکتا ہے — "consistent" read latency guarantee کرنا مشکل ہے۔

**C کیوں نہیں؟** Vertical scaling (larger instance) capacity بڑھاتا ہے لیکن read load distribute نہیں کرتا۔ Database reads کے لیے ناکامی کا واحد نقطہ رہتا ہے۔

**D کیوں نہیں؟** DynamoDB NoSQL ہے — MySQL سے DynamoDB میں migrate کرنے کے لیے data model اور application queries کو rearchitect کرنا ضروری ہے، جو اس performance improvement task کے scope سے بہت آگے ہے۔

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۳.۳*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus عالمی expansion ڈیزائن کر رہا ہے۔ وہ چاہتے ہیں کہ West Coast، Germany، اور Australia میں ریستوران partners بغیر cross-region latency کے اپنا آرڈر data جلدی دیکھیں۔ تاہم، consistency برقرار رکھنے کے لیے تمام writes ایک واحد US-East primary کے ذریعے جانی ضروری ہیں۔

Aurora استعمال کرتے ہوئے database architecture ڈیزائن کریں۔ آپ Global Database کو کیسے structure کریں گے؟ اگر US-East primary بند ہو جائے تو کیا ہوگا؟ آپ promotion process کو کیسے سنبھالیں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد multi-region database ڈیزائن کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Leo نے Serverless v2 کے ساتھ Aurora میں migrate کیا۔

Friday spike آئی اور گئی۔ CPU کبھی 60% سے نہیں بڑھا۔ Query latency consistent رہی۔ Aurora نے خودبخود scale up کر کے load سنبھالا، پھر rush کے بعد واپس scale down ہو گیا۔

"اس کی پچھلے Friday سے کتنی لاگت آئی؟" Tom نے پیر صبح پوچھا۔

Leo نے billing explorer کھولا۔ "Friday peak پر $0.89/hour تھا۔ Saturday صبح $0.11/hour تھا۔"

Tom نے کچھ نہیں کہا۔

"پرانا setup load سے قطع نظر fixed $0.47/hour تھا،" Leo نے اضافہ کیا۔

"تو ہم نے spike کے دوران پہلے سے زیادہ ادائیگی کی،" Tom نے کہا۔

"ہاں۔ لیکن off-peak کے دوران نمایاں طور پر کم۔ ہفتے میں net cost کم ہے۔"

Tom نے حساب لگایا۔ پھر سر ہلایا۔

"یہاں ایک سبق ہے،" اس نے کہا۔ "صحیح سوال 'کیا یہ سستا ہے؟' نہیں ہے۔ یہ ہے 'کیا یہ ہمارے actual usage pattern کے لیے سستا ہے؟'"

"وہ،" Priya نے کمرے کے پار سے کہا، "ایک senior engineer کی instinct ہے۔"

Tom قدرے alarmed نظر آیا اس طرح describe کیے جانے سے۔

اگلے باب میں: جب آپ کا network bottleneck ہو، اور ایک private highway کیوں toll کے قابل ہو سکتی ہے۔
