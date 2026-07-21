# باب ۲۹: Database Bill

Tom نے CloudWatch metrics print کیں۔ چودہ صفحات۔ اعداد پڑھنے پر خود کو بھروسا کرنے سے پہلے اس نے انہیں اپنی desk پر پھیلا دیا۔ بہتر یہ کہ سب کچھ ایک ساتھ دیکھ لیا جائے بجائے اس کے کہ صفحے کے بیچ میں حیرانیاں ملیں۔

**خلاصۂ ماضی: Storage مکمل، Databases اگلے**

Storage audit نے جمع شدہ waste میں $6,700 سامنے لائے تھے — بُرے فیصلوں سے نہیں، بلکہ بے توجہی سے۔ Unattached volumes، پرانے snapshots، version histories جنہیں کسی نے S3 کو صاف کرنے کو نہیں کہا تھا، نامکمل multipart uploads جو مہینوں سے خاموشی سے جمع ہو رہے تھے۔ Tom نے یہ سب ٹھیک کر دیا تھا، خودکار cleanup rules نافذ کیے تھے، اور spreadsheet میں اگلی tab پر منتقل ہو گیا تھا۔ Data tier سب سے بڑا باقی نامعلوم تھا: relational databases، NoSQL tables، cache nodes، backup storage، اور ایک line item جو ہفتوں سے اسے کھٹک رہا تھا۔

زیر جائزہ data-tier line items:

Aurora cluster: $647/month۔
Legacy RDS PostgreSQL read replicas: $340/month۔
DynamoDB tables: $340/month۔
ElastiCache: $185/month۔
Aurora manual snapshots: $87/month۔

زیر جائزہ کل data tier: $1,599/month۔

"کوئی فیصلہ کرنے سے پہلے مجھے ہر ایک کو سمجھنے دو،" اس نے کہا۔ "کیونکہ database وہ جگہ نہیں ہے جہاں کونے کاٹ کر پیسے بچائے جائیں۔"

یہ دانشمندانہ تھا۔ ایسی database misconfiguration جو data loss یا performance degradation کا سبب بنے بچت سے کہیں زیادہ لاگت آتی ہے۔

ایک database کو گاڑی کے انجن کی طرح سوچیں۔ آپ گاڑی پر سستا fuel استعمال کر کے، tire pressure adjust کر کے، اور trunk سے غیر ضروری وزن ہٹا کر پیسے بچا سکتے ہیں۔ لیکن اگر آپ oil change چھوڑ کر پیسے بچانے کی کوشش کریں، تو آپ engine کے جام ہونے کا خطرہ مول لیتے ہیں — اور ایک جام شدہ engine کسی بھی fuel کی بچت سے کہیں زیادہ لاگت آتا ہے۔ جو audit Tom چلانے والا ہے وہ اسی منطق کی پیروی کرتا ہے: trunk اور fuel tank میں waste تلاش کریں، اور جب تک آپ بالکل نہ جان لیں کہ آپ کیا کر رہے ہیں، engine کو اکیلا چھوڑ دیں۔

**پہلے اپنا Database Workload سمجھیں**

Databases میں cost optimization کے لیے کسی چیز کو چھونے سے پہلے workload کو سمجھنا ضروری ہے۔ Tom نے یہ چھ ماہ پہلے ایک قریبی غلطی سے سیکھا تھا: اس نے پہلے p95 اعداد دیکھے بغیر اوسط CPU utilization — 18% — کی بنیاد پر database instance size کم کرنا شروع کیا تھا۔ ایک ساتھی نے اسے CloudWatch metrics زیادہ احتیاط سے چیک کرنے کو کہا تھا۔ p95 CPU 61% تھا، اور خاص طور پر ایک بھاری جمعہ کی dinner rush کے دوران، یہ 84% تک پہنچ گیا تھا۔

"اوسط آپ کو نہیں بتاتا کہ peak پر کیا ہوتا ہے،" Tom نے کہا، جب اس نے Priya کو اس کے بارے میں بتایا۔ "اگر میں اوسط کے مطابق right-size کرتا، تو ہم جمعہ کی راتوں کو throttled ہو جاتے۔"

"یہی وجہ ہے کہ آپ p95 دیکھتے ہیں، اوسط نہیں،" Priya نے کہا۔ "ہمیشہ۔"

یہ اصول CPU سے آگے پھیلا۔ Tom کے پاس اب ایک معیاری pre-audit checklist تھی:

- CPU: p95، اوسط نہیں
- Memory: FreeableMemory (مطلق bytes میں، فیصد میں نہیں) — ہم حد کے کتنے قریب ہیں؟
- Connections: پچھلے 30 دنوں میں DatabaseConnections کا زیادہ سے زیادہ — ہم connection limit کے کتنے قریب پہنچے ہیں؟
- Read/write ratio: طے کرتا ہے کہ read replicas اپنی لاگت کما رہی ہیں یا نہیں
- Storage growth rate: ہم فی مہینہ کتنے GB شامل کر رہے ہیں؟
- Replication lag (replicas کے لیے): کیا replica ساتھ نبھا رہی ہے؟

اہم سوالات:

- اوسط اور peak CPU utilization کیا ہے؟
- Read/write ratio کیا ہے؟
- Storage بڑھ رہی ہے، مستحکم ہے، یا کم ہو رہی ہے؟
- کیا read replicas استعمال ہو رہی ہیں؟
- کیا instance under-provisioned ہے (سست روی کا سبب) یا over-provisioned (بیکار capacity کی ادائیگی)؟

Tom نے پچھلے 30 دنوں میں تینوں database services کے لیے CloudWatch metrics کھولیں:

**Aurora cluster**:

- اوسط CPU: 18% (p95: 61%؛ peak: جمعہ کی شاموں کو 84%)
- FreeableMemory: مستقل طور پر 8GB دستیاب میں سے 4GB سے اوپر۔ کوئی تشویش نہیں۔
- Read/write ratio: 14:1 (read-heavy)
- Storage: 180GB (~5GB/month بڑھ رہی ہے)
- DatabaseConnections زیادہ سے زیادہ: 1,000 دستیاب میں سے 312۔ آرام دہ۔

**Read replicas (RDS PostgreSQL، Aurora سے الگ)**:

- یہ دو legacy RDS read replicas تھیں جو Aurora migration سے پہلے بنائی گئیں، ابھی بھی چل رہی تھیں۔
- ہر ایک پر اوسط connections: فی دن 2۔ اوسط CPU: 3%۔
- FreeableMemory: 8GB دستیاب میں سے 7.2GB۔ Instances تقریباً بیکار تھیں۔

"یہ ابھی بھی کیوں چل رہی ہیں؟" Tom نے پوچھا۔

"میں نے انہیں پہلے ہی deploy کر دیا تھا — اوہ،" Leo نے کہا۔ اس نے instance creation dates دیکھیں۔ "یہ Aurora migration کے دوران fallback کے لیے تھیں۔ میں نے انہیں کبھی delete نہیں کیا۔"

وہ لمحہ — جب ایک مہنگی چیز مہینوں سے استعمال ہوئے بغیر چل رہی ہو — cloud environments میں ایک جانا پہچانا لمحہ ہے۔ Leo نے replicas کو ایک safety net کے طور پر بنایا تھا۔ Safety net کی کبھی ضرورت نہیں پڑی۔ لیکن کسی نے اب تک سوال نہیں پوچھا تھا۔

"connection pool کی صورتحال کیا ہے؟" Priya نے جھک کر پوچھا۔ "انہیں delete کرنے سے پہلے، کیا کوئی application components ابھی بھی reads وہاں route کر رہے ہیں؟"

Tom نے connection logs چیک کیں۔ فی دن دو connections ایک monitoring script سے آتی تھیں جو Priya نے چودہ ماہ پہلے لکھی تھی — یہ تمام معلوم database endpoints کو poll کرتی تھی تاکہ تصدیق کرے کہ وہ جواب دے رہی ہیں۔ Replicas کو صرف health checker query کر رہا تھا، کسی اصل application traffic سے نہیں۔

"انہیں delete کرو،" Maya نے کہا۔

Replicas terminate ہو گئیں۔ ماہانہ بچت: $340۔

**Connection Pool کی قریبی غلطی**

جب اس کے پاس connection metrics کھلی تھیں، Tom نے تمام database endpoints پر ایک وسیع تر check چلایا۔ جو اسے ملا اس نے اسے رکنے پر مجبور کر دیا۔

Aurora writer endpoint نے 312 کا DatabaseConnections زیادہ سے زیادہ دکھایا۔ آرام دہ۔ لیکن reader endpoint نے ایک مختلف کہانی سنائی۔

"Reader endpoint مسلسل تین جمعہ کی راتوں کو 847 connections تک پہنچا،" Tom نے کہا۔

"حد کتنی ہے؟" Priya نے پوچھا۔

"ہماری موجودہ instance class کے لیے حد 1,000 ہے۔ ہم 847 تک پہنچے۔ یہ حد کا 85% ہے۔"

"اور ہم نے notice نہیں کیا کیونکہ ہم 90% تک alarmed نہیں ہوتے تھے؟" Maya نے پوچھا۔

"ہم بالکل alarmed نہیں تھے،" Tom نے کہا۔ "reader endpoint connections پر کوئی CloudWatch alarm نہیں ہے۔ مجھے یہ صرف اس لیے ملا کیونکہ میں خام metrics دیکھ رہا تھا۔"

1,000 connections پر، database نئی connections سے انکار کر دیتا ہے۔ اس لمحے database connection حاصل کرنے کی کوشش کرنے والا کوئی بھی application thread ایک exception پھینکتا ہے۔ اگر اس exception کو صاف ستھرا طریقے سے سنبھالا نہ جائے، تو user کو ایک 500 error نظر آتی ہے۔

"ہم ایک جمعہ کی رات کے incident سے تیس سیکنڈ دور تھے،" Leo نے کہا۔ "لگاتار تین بار۔"

"کیا ہم نے سوچا ہے کہ جب وہ threshold عبور ہو جائے تو کیا ہوتا ہے؟" Priya نے پوچھا۔

"restaurant partners dinner rush کے دوران ناکام orders دیکھتے ہیں،" Maya نے کہا۔ "یہ ایک نظریاتی تشویش نہیں ہے۔"

Tom نے فوراً ایک CloudWatch alarm set کیا: 750 connections (حد کا 75%) پر alert، 900 (90%) پر page۔ اس نے reader endpoint کے لیے RDS Proxy بھی نافذ کیا — RDS Proxy، application layer سے database connections کو pool اور manage کرتا ہے، یعنی پچاس application threads دس database connections شیئر کر سکتے ہیں۔ Proxy، multiplexing سنبھالتا ہے۔ Database کہیں کم connections دیکھتا ہے چاہے application بھاری load کے تحت ہو۔

"Aurora Serverless v2 کے لیے، RDS Proxy کی قیمت $0.015 فی ACU فی گھنٹہ ہے، فی proxy کم سے کم 8 ACUs کی charge کے ساتھ،" Tom نے کہا۔ "لیکن اگر کوئی connection limit کی خلاف ورزی جمعہ کی رات کو ایک جزوی outage بھی پیدا کرے، تو Nimbus کے لیے reputation کی لاگت کئی گنا زیادہ ہے۔"

"یہ فی مہینہ کتنی لاگت ہے؟" Tom نے خود سے پوچھا، عدد چلاتے ہوئے۔ ان کا reader، Serverless v2 پر چلتا ہے، تو proxy کم سے کم 8-ACU کے مقابلے میں bill کرتا ہے: $0.015 × 8 × 730 = $87.60/month۔ یہ ایک ایسی لاگت تھی جو وہ خوشی سے ادا کرتا تھا۔

آپ شاید سوچ رہے ہوں: اگر ہم پہلے ہی Serverless v2 کی auto-scaling سے پیسہ بچا رہے ہیں، تو provisioned tier کے لیے Reserved Instances کی زحمت کیوں؟ جواب یہ ہے کہ Serverless v2 کی scaling کی ایک لاگت ہے — آپ فی ACU-hour ادا کرتے ہیں چاہے آپ نے اس کا منصوبہ بنایا ہو یا نہیں۔ fixed Aurora configurations چلانے والی teams کے لیے، RI commitment متغیر لاگت کو قابل پیش گوئی لاگت میں بدل دیتی ہے۔ provisioned instances (Serverless v2 نہیں) چلانے والی teams کے لیے، وہ فرق نمایاں طور پر اہم ہوتا ہے۔

**RDS Reserved Instances: Provisioned Database Tiers کے لیے**

EC2 کی طرح، RDS committed usage کے لیے Reserved Instances پیش کرتا ہے۔

fixed Aurora instance configurations (Serverless v2 نہیں) استعمال کرنے والی teams کے لیے، Reserved Instances 30-60% بچا سکتی ہیں۔ provisioned RI کا طریقہ یوں کام کرتا ہے: آپ hourly rate پر ایک نمایاں discount کے بدلے ایک مخصوص instance type پر 1 یا 3 سال کے لیے commit کرتے ہیں۔

وضاحت کے لیے: $0.26/hour On-Demand پر ایک db.r6g.large writer instance $190/month چلتی ہے۔ اسی کے لیے ایک 1-year Reserved Instance اسے تقریباً $108/month تک کم کر دیتی ہے — فی instance $82/month کی بچت، یا فی database instance تقریباً $1,000 فی سال۔

**Aurora Serverless v2 بمقابلہ Standard RI — Break-Even**

Tom نے اپنی مخصوص Aurora configuration کے لیے اعداد چلائے۔ سوال: کیا Aurora Serverless v2 کی auto-scaling کافی فائدہ فراہم کر رہی تھی، یا Reserved Instance commitment کے ساتھ ایک fixed provisioned instance سستی ہوتی؟

Serverless v2 pricing: $0.12 فی ACU-hour۔ ان کا cluster 0.5 ACU (بیکار) اور 16 ACU (peak load) کے درمیان scale کرتا تھا۔ پچھلے 30 دنوں پر، اوسط 4.2 ACU تھا۔

ماہانہ Serverless v2 لاگت: writer کے لیے 4.2 ACU × $0.12 × 730 گھنٹے = $368/month۔

موازنہ کریں: ایک 1-year RI کے ساتھ ایک fixed db.r6g.xlarge (ان کا متوقع provisioned مساوی، weekday p95 load سنبھالنے کے لیے sized): $0.52/hour × 0.60 (RI discount) × 730 = $228/month۔

"RI سستی ہے،" Leo نے کہا۔

"ایک fixed load کے لیے، ہاں،" Tom نے کہا۔ "لیکن spread دیکھو۔ ہمارا کم traffic دور — 2 AM سے 7 AM، پیر سے جمعرات — اوسطاً 0.8 ACU ہوتا ہے۔ ایک fixed provisioned instance پر، ہم ان گھنٹوں کے دوران جتنا استعمال کر رہے ہیں اس کا 8 گنا ادا کر رہے ہوتے، بس بیکار بیٹھے۔"

"اور Serverless v2 میل کھانے کے لیے scale down کرتا ہے؟"

"0.5 ACU تک۔ بیکار لاگت اس کا کسر ہے جو ہم peak کے لیے sized ایک provisioned instance کے لیے ادا کرتے۔"

Break-even حساب: Serverless v2 سستی ہوتی ہے جب آپ کا peak/baseline تناسب تقریباً 4:1 سے اوپر ہو۔ Nimbus کے لیے، جمعہ کے peaks 16 ACU پر اور پیر کی صبح کے minimums 0.8 ACU پر — ایک 20:1 تناسب — Serverless v2 درست انتخاب تھا۔ اگر ان کا traffic زیادہ مستقل ہوتا (مثلاً، 8 ACU ± 20%)، تو ایک provisioned RI سستی ہوتی۔

"یہ صرف اس بارے میں نہیں ہے کہ اس مہینے کون سا عدد چھوٹا ہے،" Tom نے کہا۔ "یہ اس بارے میں ہے کہ کون سا model ہماری growth کو درست طریقے سے سنبھالتا ہے۔ اگر ہم اگلی سہ ماہی 50% بڑھیں، تو Serverless v2 بس scale up ہو جاتا ہے۔ ایک provisioned RI کو re-sizing کی ضرورت پڑتی، اور ہم منتقلی کے دوران غیر استعمال شدہ headroom کی ادائیگی کر رہے ہوتے۔"

Tom نے سال بھر کا موازنہ واضح طور پر بیان کیا تاکہ team صرف نتیجہ نہیں بلکہ استدلال کی پیروی کر سکے۔

**ماہ بہ ماہ Aurora لاگت: Serverless v2 بمقابلہ provisioned RI**

Provisioned option: ایک 1-year Reserved Instance کے ساتھ ایک db.r6g.xlarge۔ لاگت: $0.52/hour On-Demand × 0.60 (RI discount) × 730 گھنٹے = $228/month۔ Fixed، load سے قطع نظر۔

Serverless v2 option: $0.12 پر فی ACU-hour ادا کریں۔ متغیر، اصل load کو ٹریک کرتے ہوئے۔

Tom نے CloudWatch سے 30 دن کی Aurora Serverless v2 ACU metrics کھینچیں اور ایک distribution بنائی:

- 2 AM–7 AM، پیر–جمعرات (کم traffic): اوسط 0.8 ACU → $0.096/hour
- 7 AM–11 AM، weekdays (معتدل): اوسط 3.2 ACU → $0.384/hour  
- 11 AM–9 PM، weekdays (peak business hours): اوسط 5.8 ACU → $0.696/hour
- جمعہ 6 PM–10 PM (dinner rush): اوسط 14.1 ACU → $1.692/hour
- سنیچر 12 PM–8 PM (weekend مصروف): اوسط 9.3 ACU → $1.116/hour
- اتوار (سب سے ہلکا دن): اوسط 2.1 ACU → $0.252/hour

پورے مہینے پر وزنی اوسط: 4.2 ACU → $0.504/hour → $368/month۔

ایک provisioned RI پر: $228/month۔ Serverless: $368/month۔ Provisioned option نے $140/month بچائے۔

"یہ تو واضح لگتا ہے،" Leo نے کہا۔ "ہم Serverless پر کیوں ہیں؟"

"کیونکہ $368 اوسط ہے،" Tom نے کہا۔ "جمعہ کی شاموں کو دیکھو۔"

جمعہ 6–10 PM: 14.1 ACU اوسط۔ اس چار گھنٹے کی window کے لیے، Serverless کی لاگت $1.692/hour ہے۔ ایک db.r6g.xlarge $228/month پر 32 GiB memory کی زیادہ سے زیادہ capacity رکھتا ہے — تقریباً 16 ACUs کے مساوی۔ Serverless cluster اس window کے دوران اوسطاً 14.1 ACUs چلا رہا تھا، xlarge کی حد کے قریب کسی headroom کے بغیر۔

"اصل headroom کے ساتھ ہمارے جمعہ کے peak کے لیے sized ایک provisioned instance ایک db.r6g.2xlarge ہوتی،" Tom نے کہا۔ "RI rate پر، یہ $1.04/hour × 0.60 = $0.624/hour ہے۔ ماہانہ: $456/month۔"

"یہ Serverless اوسط $368 سے زیادہ ہے،" Maya نے کہا۔

"درست۔ اور اگر ہم provisioned instance کو weekday baseline کے لیے sized کرتے — db.r6g.xlarge — تو جمعہ کی راتیں ایک مسئلہ ہوتیں۔ peak load پر، ہم xlarge کی تقریباً پوری capacity کے مقابلے میں 14 ACUs دھکیل رہے ہوتے۔ یہ saturation ہے۔"

"تو آپ کو peak کے لیے پہلے سے size کرنا پڑتا،" Priya نے کہا۔

"ہفتے کے باقی 160 گھنٹے بیکار capacity کی ادائیگی کی قیمت پر،" Tom نے کہا۔ "وہ provisioned RI حساب جو سستا نکلتا ہے صرف اس وقت کام کرتا ہے جب آپ کا peak/baseline تناسب کم ہو۔ ہمارا 20:1 ہے۔ یہ بالکل وہ منظر نامہ ہے جس کے لیے Serverless v2 design کیا گیا تھا۔"

اس نے اعداد ساتھ ساتھ دکھائے:

| Option | اوسط مہینہ | پُرسکون رات (2 AM) | جمعہ rush (8 PM) |
|---|---|---|---|
| Serverless v2 | $368 | $0.096/hr | $1.692/hr |
| Provisioned RI (r6g.xl) | $228 | $228/730hr = $0.312/hr | محدود — saturation کا خطرہ |
| Provisioned RI (r6g.2xl) | $456 | $0.624/hr | آرام دہ headroom |

"Serverless option $368 ہے،" Tom نے کہا۔ "right-sized provisioned option $456 ہے — اور یہ اس operational لاگت کا حساب کرنے سے پہلے ہے جو provisioned instance کو monitor کرنے اور دستی طور پر scale کرنے میں آتی ہے جب اگلی سہ ماہی ہمارے traffic patterns بدلتے ہیں۔"

"اور operational لاگت،" Priya نے کہا، "کچھ بھی نہیں ہے یہ نہیں۔"

"نہیں۔ Serverless کے ساتھ، ہمیں instance sizing کے بارے میں سوچنا نہیں پڑتا۔ Aurora اسے سنبھالتا ہے۔ Provisioned کے ساتھ، ہر سہ ماہی مجھے دوبارہ جائزہ لینا پڑتا کہ موجودہ instance class اب بھی ہمارے traffic کے مطابق ہے یا نہیں۔ یہ وقت میں مہنگا نہیں، لیکن یہ ایسی چیز ہے جو غلط ہو سکتی ہے اگر ہم توجہ دینا بند کر دیں۔"

"یہ ٹھیک رہے گا جب تک ہم اسے resize کرنا نہ بھولیں،" Leo نے کہا، اور پھر خود کو پکڑ لیا۔ "جو بالکل وہی وقت ہے جب یہ ٹھیک نہیں رہے گا۔"

"بالکل،" Tom نے کہا۔

نتیجہ قائم رہا: $368/month پر Serverless v2 Nimbus کے 20:1 peak/baseline تناسب اور اس کی team کی operational سادگی کی ترجیح کے لیے درست انتخاب تھا۔ Provisioned RI صرف ان teams کے لیے قائل کن تھی جن کا traffic نمایاں طور پر مختلف نہ ہوتا — ایک 2:1 یا 3:1 تناسب جہاں provisioned instance شاذ و نادر ہی بیکار ہوتی۔

"کیا چیز ہمیں provisioned پر switch کرنے پر مجبور کرے گی؟" Maya نے پوچھا۔

"اگر ہمارا traffic pattern ہموار ہو جائے،" Tom نے کہا۔ "اگر Nimbus اس مقام تک بڑھے جہاں کم-traffic baseline بھی اونچا ہو — مثلاً، 2 AM پر 0.8 کے بجائے 8 ACU — تو تناسب 2:1 تک گر جائے گا اور provisioned معاشی طور پر معقول ہو گا۔ یہ ایک مختلف business مسئلہ ہے۔ ایک ایسا جو ہم رکھنا پسند کریں گے۔"


Serverless v2 کے ساتھ Aurora کے لیے، Reserved Instances براہ راست apply نہیں ہوتیں — Serverless v2 متحرک طور پر scale کرتا ہے اور آپ فی ACU-hour ادا کرتے ہیں۔ یہ Nimbus کی موجودہ configuration ہے: primary Aurora writer اور reader دونوں Serverless v2 استعمال کرتے ہیں۔ Nimbus کے لیے بچت خود Serverless v2 کی auto-scaling نوعیت سے آتی ہے — جب traffic کم ہو تو آپ غیر استعمال شدہ capacity کی ادائیگی نہیں کرتے۔

ابھی بھی fixed Aurora instances چلانے والی teams کو RI commitment کا جائزہ لینا چاہیے جب instance type تین یا اس سے زیادہ ماہ سے مستحکم ہو۔

**DynamoDB: On-Demand بمقابلہ Provisioned**

باب ۹ میں، ہم نے DynamoDB کے دو capacity modes متعارف کرائے: on-demand اور provisioned۔

Nimbus شروع سے DynamoDB کو on-demand mode میں چلا رہا تھا۔ کم traffic پر، یہ درست تھا — on-demand فی request زیادہ مہنگا ہے لیکن اس کی کوئی minimum charge نہیں۔

اب، CloudWatch میں 18 ماہ کے traffic data کے ساتھ، Tom patterns دیکھ سکتا تھا۔

اوسط read requests: 225 فی سیکنڈ (تقریباً 19.4 ملین فی دن)
اوسط write requests: 60 فی سیکنڈ (تقریباً 5.2 ملین فی دن)
Peak day (جمعہ): اوسط DynamoDB requests کا 180% (ElastiCache ~95% reads جذب کرتا ہے، اس لیے DynamoDB مجموعی 25x آرڈر volume spike کا صرف ایک کسر دیکھتا ہے)

**On-demand pricing**: $1.25 فی ملین write requests، $0.25 فی ملین read requests۔
**Provisioned pricing**: $0.00065 فی write capacity unit فی گھنٹہ، $0.00013 فی read capacity unit فی گھنٹہ۔

Tom نے break-even point حساب کیا: provisioned capacity سستی ہو جاتی ہے جب آپ اسے اتنی مستقل طور پر استعمال کریں کہ بیکار ادوار کے دوران on-demand premium ادا نہ کر رہے ہوں۔

(اس section کے اعداد پر ایک نوٹ: یہ اس وقت team کے bill کی عکاسی کرتے ہیں، اور وضاحتی ہیں۔ 2024 کے آخر میں، AWS نے DynamoDB on-demand قیمتیں 50% کم کر دیں، جس نے break-even کو نمایاں طور پر منتقل کر دیا — آج، provisioned capacity صرف اس وقت جیتتی ہے جب utilization مستقل طور پر اونچی ہو۔ ہمیشہ یہ حساب موجودہ قیمتوں کے ساتھ دوبارہ کریں۔)

18 ماہ کے data کے ساتھ مستقل daily patterns دکھاتے ہوئے، **DynamoDB Auto Scaling** کے ساتھ provisioned capacity درست انتخاب تھا:

- Minimum capacity کو اوسط load کے 60% پر set کریں
- Maximum کو اوسط کے 250% پر (جمعہ کے spikes سنبھالتا ہے)
- Auto Scaling ان حدود کے درمیان provisioned capacity adjust کرتا ہے

ماہانہ DynamoDB لاگت: $340 (on-demand) سے گر کر $230 (provisioned with auto scaling) ہو گئی۔ 32% کمی۔

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا۔ "ہم شروع سے on-demand پر ہیں کیونکہ ہمیں اپنے traffic patterns پر بھروسا نہیں تھا۔ کیا بدلا؟"

"اٹھارہ ماہ کا data،" Tom نے کہا۔ "اب ہم جانتے ہیں کہ ہمارے patterns کیسے نظر آتے ہیں — مستقل weekday baseline، جمعہ کے peaks، اتوار کے پُرسکون ادوار۔ On-demand درست فیصلہ تھا جب ہم نہیں جانتے تھے۔ Auto Scaling کے ساتھ Provisioned اب درست فیصلہ ہے جب ہم جانتے ہیں۔"

"لیکن اگر ہم over-provision کریں،" Leo نے پوچھا، "تو ہم غیر استعمال شدہ capacity کی ادائیگی کرتے ہیں۔"

"یہی خطرہ ہے،" Tom نے کہا۔ "Auto Scaling کے ساتھ، ہم minimum کو throttling سے بچنے کے لیے کافی اونچا set کرتے ہیں، اور AWS کو ہماری حد کے اندر manage کرنے دیتے ہیں۔"

"اور اگر ہمارا traffic pattern نمایاں طور پر بدلے؟"

"تو ہم حدود adjust کرتے ہیں۔ ہم اس کا سہ ماہی review کرتے ہیں۔"

**ElastiCache: Right-Sizing اور احتیاطی کہانی**

ElastiCache bill: $185/month۔ ہر AZ میں ایک cache.r6g.large Redis instance (دو nodes، primary + replica)۔

CloudWatch metrics نے دکھایا:

- اوسط memory utilization: 34%
- Peak: 44%

Instance over-provisioned تھی۔ ایک cache.m6g.large — r6g.large کی نصف memory — غالباً load کو کچھ headroom کے ساتھ سنبھال لیتی۔

لیکن یہاں Tom رک گیا۔ اسے یاد آیا کہ ایک پچھلی کمپنی میں کیا ہوا تھا جب اس نے جارحانہ طور پر ایک cache کو right-size کیا تھا — اور اس نے team کو پوری کہانی سنائی، کیونکہ یہ ایسی کہانی تھی جسے بتانے کی ضرورت تھی اس سے پہلے کہ آپ خود کو اس کے بیچ میں پائیں۔

اس کی پچھلی کمپنی میں — financial reporting کے لیے ایک SaaS platform — ElastiCache cluster ایک cache.r6g.large تھی۔ دو nodes، primary اور replica۔ اوسط memory utilization: 26%۔ مشاہدہ شدہ peak: 37%۔ جس on-call engineer نے اسے flag کیا اس نے حساب کیا تھا: ایک cache.m6g.large مشاہدہ شدہ peak سے 25% headroom کے ساتھ load سنبھال لیتی۔ بچت: $60/month — اس وقت اس کمپنی کے region اور node generation میں pricing، آج Nimbus کے مساوی فرق سے چھوٹی۔ تبدیلی منگل کو منظور ہوئی۔

اگلے مہینے، ایک جمعرات کی شام 11:47 PM پر، month-end settlement batch شروع ہوا۔

Settlement batch سہ ماہی چلتا تھا۔ یہ ہر active account کے پچھلے تین ماہ کے transaction records کھینچتا، انہیں aggregate کرتا، taxes compute کرتا، اور settlement records لکھتا تھا۔ Cache، intermediate aggregation state store کرنے کے لیے استعمال ہوتا تھا — جیسے جیسے batch آگے بڑھتا ہر account کا running total۔ cache.r6g.large نے ہمیشہ اسے سنبھالا تھا۔ right-sizing کا فیصلہ کرتے وقت کسی نے خاص طور پر settlement batch metrics نہیں دیکھی تھیں، کیونکہ batch سہ ماہی تھا اور مشاہدے کی window چار ہفتے رہی تھی۔

medium instance پر، maxMemoryPolicy کو `allkeys-lru` پر set کیا گیا تھا — جب memory بھر جاتی، Redis جگہ بنانے کے لیے سب سے کم حال ہی میں استعمال ہونے والی key کو نکال دیتا۔ یہ ایک عمومی cache کے لیے درست policy ہے۔ لیکن settlement batch کے لیے، cache میں ہر key فعال طور پر درکار تھی۔ جب memory medium instance کے 6.38 GB کے 84% پر بھری، Redis نے keys نکالنا شروع کر دیں۔ ہر eviction ایک cache miss تھی۔ ہر cache miss نے underlying PostgreSQL database کو ایک query بھیجی تاکہ خام transaction records سے نکالی گئی value دوبارہ compute کرے۔

Database connection pool steady-state traffic کے لیے configured تھا، settlement batch load کے لیے نہیں۔ evictions شروع ہونے کے چار منٹ کے اندر، database میں 847 active connections تھیں۔ Connection limit 1,000 تھی۔ 9 منٹ پر، پہلے application threads کو "too many connections" errors نظر آنے لگیں۔ 12 منٹ پر، تین services جو database connection pool شیئر کرتی تھیں — settlement batch، real-time reporting service، اور client-facing API — سب متاثر ہوئیں۔

On-call engineer نے 11:59 PM پر escalate کیا۔ Incident review 12:08 AM پر شروع ہوا۔

پہلا جواب: settlement batch function کے لیے Lambda timeout بڑھائیں (settlement batch جزوی طور پر Lambda-based تھا)۔ یہ غلط تھا۔ Timeout مسئلہ نہیں تھا۔

دوسرا جواب: settlement batch کو parallelize کرنے کے لیے ایک دوسرا Lambda function شامل کریں۔ یہ بھی غلط۔ زیادہ parallelism کا مطلب زیادہ ہم وقت cache access تھا، جس کا مطلب تیز تر evictions، جس نے صورتحال بدتر کر دی۔

تیسرا جواب: database دباؤ کم کرنے کے لیے settlement batch کو scale down کریں۔ اس سے قدرے مدد ملی لیکن جڑ کے سبب کو حل نہیں کیا۔

چوتھا جواب، 2:31 AM پر: cache.r6g.large بحال کریں۔ Memory دباؤ فوراً گر گیا۔ Evictions رک گئیں۔ Database connection pool صاف ہو گیا۔ Settlement batch 4:17 AM پر مکمل ہوا، چار گھنٹے سے زیادہ تاخیر سے۔

Incident کل: clients کے لیے reports تک رسائی کی کوشش کرتے ہوئے چار گھنٹے کی متاثرہ API performance۔ ایک مکمل settlement batch تاخیر سے۔ Engineering time: پانچ engineers پر تقریباً 22 گھنٹے۔ متوقع براہ راست لاگت: $40,000۔

$60/month کی بچت نے ایک ہی incident میں $40,000 کی لاگت آئی۔

"غلطی right-sizing کا فیصلہ نہیں تھی،" Tom نے کہا۔ "دستیاب data کی بنیاد پر فیصلہ قابل دفاع تھا۔ غلطی مشاہدے کی window تھی۔ ہم نے چار ہفتوں کی metrics ناپیں۔ Settlement batch سہ ماہی تھا۔ ہم غلط timeframe دیکھ رہے تھے۔"

"تو آپ اس سے کیسے بچتے ہیں؟" Maya نے پوچھا۔

"آپ پوچھتے ہیں: یہ cache جس operation کو support کرتا ہے اس میں سب سے زیادہ داؤ پر کیا ہے؟ اور آپ اس operation کی مخصوص metrics تلاش کرتے ہیں۔ اوسط ہفتہ نہیں۔ وہ مخصوص ہفتہ — یا مہینہ — یا سہ ماہی — جب load سب سے زیادہ ہو۔ اور آپ اس کے لیے size کرتے ہیں۔"

"اور اگر آپ metrics نہ پا سکیں کیونکہ operation شاذ و نادر ہے؟"

"یہی جواب ہے،" Tom نے کہا۔ "اگر آپ ایک مخصوص high-load منظر نامے کے لیے metrics نہ پا سکیں، تو درست جواب یہ ہے کہ ابھی right-size نہ کریں۔ اگلی بار کا انتظار کریں، اسے بھرپور طریقے سے instrument کریں، پھر جو آپ نے مشاہدہ کیا اس کی بنیاد پر size کریں۔"

Nimbus کے ElastiCache cluster کا اپنا high-stakes operation تھا: جمعہ کی dinner rush۔ Tom کے پاس وہ data تھا — مسلسل تین جمعہ کی راتیں r6g.large پر 44% memory utilization تک پہنچی تھیں، تقریباً 5.7 GB live data۔ m6g.large کے 6.38 GB پر، وہی working set پہلے ہی 90% کے قریب بیٹھتا — اور اگر order processing pipeline میں کچھ زیادہ cache space استعمال کرنے کے لیے بدلتا — ایک نئی feature، ایک مختلف caching strategy — تو 90% eviction کا علاقہ بن جاتا۔

اس نے بہرحال اعداد چلائے۔ r6g.large سے m6g.large پر جانا: $0.127/hour پر دو nodes بمقابلہ $0.090/hour پر دو nodes، فی مہینہ 730 گھنٹے چلتے ہوئے۔ Large: $185/month۔ m6g pair: $131/month۔ ممکنہ بچت: $54/month۔ اس نے m6g.large instance کو staging میں دو ہفتے load کے تحت test کیا۔ Memory 71% پر peak ہوئی — حد کے اتنے قریب کہ وہ بے چین تھا۔

پھر اس نے متبادل کی قیمت لگائی: cache.r6g.large رکھیں، لیکن Reserved Nodes خریدیں (1-year commitment)۔ On-Demand $185 سے Reserved $120/month۔ بچت: instance type بدلے بغیر $65/month۔

"وہ $65/month جو میں اسی instance size پر Reserved Nodes پر بچاؤں گا ایک حقیقی بچت ہے،" Tom نے کہا۔ "وہ $54/month جو میں m6g.large پر جا کر بچاؤں گا ایک جھوٹی معیشت ہے اگر یہ جمعہ کی dinner rush کو خطرے میں ڈالے — اور اتنی بچت بھی نہیں۔ کبھی کبھی ایک چھوٹی instance پر right-sizing ایک performance incident کا خطرہ مول لیتی ہے — Reserved Nodes ہمیں کسی خطرے کے بغیر زیادہ بچت دیتے ہیں۔"

اس نے r6g.large کے لیے Reserved Nodes خریدیں۔

"جب زیادہ محفوظ option بھی زیادہ بچاتا ہے،" Tom نے کہا، "تو یہ کوئی trade-off ہی نہیں ہے۔"

**RDS Backup Retention: Storage کا Trade-Off**

RDS automated backups S3 میں store ہوتے ہیں (آپ کے database size کے 100% تک storage کے لیے بغیر اضافی charge کے)۔ Default retention 7 دن ہے۔

Nimbus کے 180GB Aurora database کے لیے، 7 دن کے backups مناسب تھے — وہ testing میں اس window کے اندر backup سے restore کرنے کے قابل تھے۔

لیکن Tom نے notice کیا: ان کے پاس ہر اہم deployment کے manual snapshots بھی تھے، غیر معینہ مدت تک رکھے گئے۔

23 manual snapshots، کل 4.1TB snapshot storage۔
لاگت: Aurora backup storage کے لیے $0.021/GB/month = manual snapshot storage میں تقریباً $87/month۔

انہوں نے فی environment (production، staging) آخری 3 manual snapshots رکھے۔ باقی delete کر دیے — تقریباً 1.1TB برقرار۔
بچت: $64/month۔

"ہم ایک ایسی insurance کے لیے $64 فی مہینہ ادا کر رہے تھے جسے ہم نے کبھی استعمال نہیں کیا،" Leo نے کہا۔

"ہم ذہنی سکون کے لیے ادا کر رہے تھے،" Tom نے درست کیا۔ "سوال یہ ہے: کتنا ذہنی سکون $64 فی مہینہ کے قابل ہے؟"

"ایک مناسب disaster recovery plan کے ساتھ،" Priya نے کہا، "آپ 7 دن کے automated backups اور 3 manual snapshots سے وہی ذہنی سکون حاصل کر سکتے ہیں۔"

"متفق۔ اب۔"

**تبدیلی: جب Provisioned الٹا پڑ جائے**

اگر آپ کا traffic pattern مستقل اور قابل پیش گوئی ہے، تو Auto Scaling کے ساتھ provisioned capacity on-demand پر 30% بچاتی ہے۔ لیکن اگر کوئی نئی feature launch ہو اور آپ کا write volume راتوں رات 5 گنا spike کرے، تو آپ Auto Scaling کے پکڑنے سے پہلے throttled ہو جائیں گے — Auto Scaling مشاہدہ شدہ traffic پر ردعمل کرتا ہے، جس کا مطلب ہے کہ ایک تاخیر ہوتی ہے۔ ایک بڑی feature launch کے گرد ہفتوں کے لیے on-demand mode رکھنا ایک معقول trade-off ہے: قدرے زیادہ لاگت، ایک ایسے دور میں throttling کا کوئی خطرہ نہیں جب آپ traffic patterns کو real time میں بدلتے دیکھ رہے ہوں۔

اگر آپ غیر استعمال شدہ read replicas کو ختم کریں (Nimbus کی legacy PostgreSQL replicas کی طرح)، تو بچت فوری اور غیر مبہم ہے — کوئی trade-off نہیں، کیونکہ replicas کوئی value فراہم نہیں کر رہی تھیں۔ لیکن اگر آپ کو ایک ایسی read replica ختم کرنے کا لالچ ہو جو traffic کا صرف 2% سنبھال رہی ہے، تو چیک کریں کہ peak کے دوران جب اس 2% کے پاس جانے کو کوئی جگہ نہ ہو تو primary کا کیا ہوتا ہے۔ کچھ read replicas headroom کے لیے موجود ہوتی ہیں، موجودہ load کے لیے نہیں۔

**Database Optimization کا خلاصہ**

| Service                                           | پہلے     | بعد    | ماہانہ بچت |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (تجزیے کے بعد Serverless v2 برقرار)        | $647       | $647     | $0 (درست model) |
| RDS Read Replicas (غیر استعمال شدہ)               | $340       | $0       | $340           |
| DynamoDB (On-Demand -> Provisioned + Auto Scaling) | $340       | $230     | $110           |
| ElastiCache (Reserved Nodes)                      | $185       | $120     | $65            |
| Aurora manual snapshots                           | $87        | $23      | $64            |
| RDS Proxy (connection کی حفاظت)                   | $0         | $88      | -$88           |
| **کل**                                            | **$1,599** | **$1,108** | **$491/month** |

Database savings میں $491 فی ماہ۔ $5,892 فی سال۔

Tom نے یہ عدد storage cleanup ($6,200/year)، باب ۲۳ کی S3 lifecycle policies ($7,800/year)، اور Savings Plan savings ($14,200/year) کے ساتھ رکھا۔

اب تک کا کل optimization اثر: $34,092/year۔

"یہ حقیقی runway ہے،" Maya نے کہا۔

"یا کئی سنجیدہ experiments،" Priya نے کہا۔

"یا بارہ ماہ کے experiments،" Leo نے کہا۔

تینوں درست تھے۔

## خوبیاں اور حدود

**Auto Scaling کے ساتھ DynamoDB Provisioned**:

- قابل پیش گوئی، مستقل workloads کے لیے on-demand سے سستی
- Auto Scaling مستقل طور پر over-provisioning کیے بغیر variability سنبھالتا ہے
- اس بات کو یقینی بنانے کے لیے monitoring درکار ہے کہ capacity حدود مناسب رہیں

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- مستحکم، long-running workloads کے لیے نمایاں بچت
- Locked commitment — اگر آپ کی ضروریات بدلیں، تو آپ نے غیر استعمال شدہ capacity کی ادائیگی کی ہے
- EC2 Standard RIs کے برعکس، RDS RIs کو Reserved Instance Marketplace پر دوبارہ بیچا **نہیں** جا سکتا — Marketplace صرف EC2 کے لیے ہے۔ ایک غیر استعمال شدہ RDS RI ایک ڈوبی ہوئی لاگت ہے، جو sizing کے فیصلے کو زیادہ اہم بنا دیتی ہے

**عمومی اصول**:

- Optimize کرنے سے پہلے ہمیشہ utilization سمجھیں — p95 استعمال کریں، اوسط نہیں
- غیر استعمال شدہ resources (legacy read replicas کی طرح) سب سے زیادہ منافع بخش optimization ہیں
- Right-sizing کے لیے production پر لاگو کرنے سے پہلے staging میں validate کرنے کی ضرورت ہے، اور ایسے seasonal workload patterns کی جانچ کی جو ایک معیاری مشاہدے کی window میں ظاہر نہ ہوں
- Reserved pricing کے لیے workload استحکام میں اعتماد درکار ہے

## خلاصہ

- **پہلے audit کریں**: کوئی بھی database تبدیلی کرنے سے پہلے CloudWatch metrics کھینچیں۔ p95 latency اور p95 CPU استعمال کریں — اوسط نہیں۔ FreeableMemory اور connection maximums چیک کریں۔
- **غیر استعمال شدہ resources delete کریں**: Read replicas، بیکار databases، اور test instances جن کی مزید ضرورت نہیں۔
- **اپنے connection pool پر نظر رکھیں**: DatabaseConnections پر حد کے 75% اور 90% پر alarms set کریں۔ connection multiplexing کے لیے RDS Proxy پر غور کریں۔
- **DynamoDB On-Demand بمقابلہ Provisioned**: غیر قابل پیش گوئی traffic کے لیے On-Demand؛ مستقل patterns کے لیے Provisioned + Auto Scaling۔
- **ElastiCache right-sizing**: حقیقت پسندانہ peak loads کے تحت staging میں test کریں، seasonal peaks سمیت۔ Reserved Nodes اسی instance size پر بچت پیش کرتے ہیں جب جارحانہ downsizing خطرہ رکھتی ہو۔
- **RDS snapshot management**: صرف وہ snapshots رکھیں جن کی آپ کو ضرورت ہے۔ Manual snapshots delete ہونے تک غیر معینہ مدت تک store رہتے ہیں۔

## امتحان کے نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۳)*

- **DynamoDB pricing modes**: On-Demand = فی request ادا کریں (زیادہ per-unit لاگت، کوئی minimum نہیں)۔ Provisioned = فی capacity unit فی گھنٹہ ادا کریں (کم per-unit لاگت، capacity مختص کرنا ضروری)۔ **DynamoDB Auto Scaling** خودبخود provisioned capacity adjust کرتا ہے۔
- **RDS Reserved Instances**: تمام RDS engine types کے لیے دستیاب۔ Multi-AZ deployments Reserved Instances استعمال کر سکتی ہیں (آپ Multi-AZ پر commit کرتے ہیں)۔ 1- یا 3-year term۔
- **ElastiCache Reserved Nodes**: EC2 Reserved Instances جیسا commitment model۔ فی node لاگو، فی cluster نہیں۔
- **RDS snapshot storage**: Automated backups database size کے 100% تک مفت ہیں۔ Manual snapshots S3 میں فی GB فی ماہ charged۔ امتحانی منظر نامہ: "RDS storage costs کم کریں" → پرانے manual snapshots delete کریں۔
- **DynamoDB reserved capacity**: DynamoDB کے لیے بھی دستیاب ہے (ایک region میں آپ کی تمام DynamoDB tables پر 1 یا 3 سال کے لیے discount پر ایک مخصوص read/write capacity پر committed)۔ Standard provisioned سے مختلف — آپ capacity کے لیے pre-pay کرتے ہیں۔
- **Aurora Serverless v2 بمقابلہ provisioned**: Serverless v2 خودبخود scale کرتا ہے، variable workloads کے لیے ideal۔ مستحکم، قابل پیش گوئی workloads کے لیے Reserved Instances کے ساتھ Provisioned سستا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

وضاحت کریں کہ آپ کو DynamoDB on-demand capacity کب بمقابلہ Auto Scaling کے ساتھ provisioned capacity استعمال کرنی چاہیے۔ یہ فیصلہ کرنے کے لیے آپ کو کون سی معلومات درکار ہیں؟

*(اشارہ: سوچیں کہ traffic data کے لحاظ سے "قابل پیش گوئی" کا کیا مطلب ہے، اور on-demand کون سا خطرہ ختم کرتا ہے جو provisioned متعارف کراتا ہے۔)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی ایک mobile game کے leaderboard کے لیے ایک DynamoDB table چلاتی ہے۔ Traffic سال بھر بہت مستقل ہے، سوائے ایک seasonal event کے دوران جو مہینوں پہلے شیڈول کیا جاتا ہے (فی سہ ماہی ایک ہفتہ، پہلے دن کے دوران players کے شامل ہونے سے normal traffic کا 10x تک پہنچتا ہے)۔ کمپنی کی ترجیح طویل، قابل پیش گوئی steady-state ادوار کے دوران database costs کم سے کم کرنا ہے جبکہ معلوم event ہفتوں کے دوران performance برقرار رکھنا ہے۔

کون سی DynamoDB capacity strategy ان ضروریات کو بہترین طریقے سے پورا کرتی ہے؟

A) Seasonal peaks کو throttling کے بغیر سنبھالنے کے لیے On-demand capacity  
B) Peak seasonal levels پر set کی گئی Provisioned capacity (ہمیشہ 10x traffic کے لیے provisioned)  
C) Seasonal peak کے لیے set کی گئی maximum capacity کے ساتھ DynamoDB Auto Scaling کے ساتھ Provisioned capacity  
D) Normal traffic levels پر 3 سال کے لیے DynamoDB reserved capacity units

**اشارہ ۱**: "بہت مستقل traffic سوائے ایک شیڈول شدہ، معلوم seasonal peak کے" — کون سا mode دونوں کو مؤثر طریقے سے سنبھالتا ہے؟ (On-demand کی طاقت *غیر قابل پیش گوئی* traffic ہے؛ یہ traffic قابل پیش گوئی ہے۔)

**اشارہ ۲**: off-peak کے دوران "Costs کم سے کم کریں" کا مطلب ہے آپ ہر وقت 10x کے لیے over-provision نہیں کر سکتے۔

**اشارہ ۳**: DynamoDB Auto Scaling seasonal event کے لیے scale up اور بعد میں واپس scale down کر سکتا ہے۔

**جواب**: C

**وضاحت**: Auto Scaling کے ساتھ Provisioned capacity اصل traffic کی بنیاد پر table کو scale کرتی ہے۔ Normal ادوار کے دوران، capacity normal levels پر ہوتی ہے (کم لاگت)۔ Seasonal event کے دوران — جس کی تاریخیں پہلے سے معلوم ہیں اور جس کا traffic پہلے دن کے دوران بتدریج بنتا ہے — Auto Scaling اضافے کو configured maximum level تک ٹریک کرتا ہے (10x peak سنبھالتا ہے)، اور team شیڈول شدہ آغاز سے پہلے اضافی headroom کے طور پر minimum بھی بڑھا سکتی ہے۔ Event کے بعد، capacity واپس scale down ہو جاتی ہے۔ یہ سال پر غالب steady-state کے دوران on-demand سے سستی ہے (on-demand فی request زیادہ لاگت آتی ہے) اور ہمیشہ 10x کے لیے provisioning سے سستی ہے۔

**A کیوں نہیں؟** On-demand throttling کے بغیر peaks سنبھالتا ہے، لیکن اس کی طاقت *غیر قابل پیش گوئی* traffic ہے۔ یہاں traffic بہت مستقل ہے اور peak شیڈول شدہ اور بتدریج ہے — سال کے ~92% steady-state حصے کے لیے on-demand فی request premium ادا کرنا normal ادوار کے دوران costs کم سے کم کرنے کی بیان کردہ ترجیح کے خلاف ہے۔

**B کیوں نہیں؟** 10x پر مستقل طور پر provisioning کا مطلب ہے کہ provisioned capacity کا ~90% سال کے ~92% حصے میں غیر استعمال شدہ بیٹھتا ہے — ایسی capacity کی ادائیگی جو کبھی استعمال نہیں ہوتی۔

**D کیوں نہیں؟** Reserved capacity units آپ کو normal traffic levels پر lock کر دیتے ہیں۔ 10x seasonal event کے دوران، آپ reserved مقدار سے آگے throttled ہو جائیں گے، یا آپ کو اوپر سے on-demand شامل کرنا پڑے گا۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۳*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus ایک نئی feature کا جائزہ لے رہا ہے: ایک restaurant analytics dashboard جو real-time آرڈر counts، فی گھنٹہ revenue، اور customer demographics دکھاتا ہے۔ یہ data تقریباً فی منٹ 200 بار ایک database query کرے گا (10 analysts کے ساتھ، فی analyst فی page refresh ایک query)۔

فی الحال analytics data Athena (S3) میں ہے۔ کیا انہیں dashboard کو Athena پر بنانا چاہیے، یا انہیں data ایک database میں load کرنا چاہیے؟ اگر database، تو کون سا (Aurora، DynamoDB، Redshift)؟

غور کریں: query frequency، data freshness کی ضروریات، query complexity (aggregations، joins)، اور اس volume پر فی query لاگت۔

*(کوئی ایک درست جواب نہیں ہے۔ مقصد analytics workloads کے لیے database selection کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے Maya کو مکمل cost optimization خلاصہ پیش کیا۔

تین ماہ کا کام۔ سالانہ بچت میں $34,092 شناخت، جس کا زیادہ تر پہلے ہی نافذ۔

"باقی کیا ہے؟" Maya نے پوچھا۔

"وہ optimizations جن کے بارے میں میں ابھی پُراعتماد نہیں ہوں،" Tom نے کہا۔ "Aurora configuration کو شاید مزید right-sized کیا جا سکتا ہے، لیکن commit کرنے سے پہلے مجھے ایک اور سہ ماہی کا data چاہیے۔ اور ایک data transfer سوال ہے جس کا میں نے پوری طرح تجزیہ نہیں کیا۔"

"Networking costs۔"

"ہاں۔ وہ اگلی ہے۔"

Maya نے اعداد دیکھے۔ "Tom، میں ایک چیز سمجھنا چاہتی ہوں۔ یہ optimization — تم تین ماہ سے اس پر لگے ہو۔ یہ تمہارے وقت کا ایک نمایاں حصہ ہے۔"

"تقریباً 30%۔"

"اور تم نے تقریباً $34,000 فی سال پایا۔ تو optimization اپنی قیمت — کیا، تمہاری salary کے چند ماہ میں پوری کر لیتی ہے؟"

Tom نے اس کی طرف دیکھا۔ "تقریباً اتنا۔"

"اور اس کے بعد ہر سال، یہ خالص بچت ہے۔"

"یا خالص دوبارہ سرمایہ کاری،" اس نے کہا۔ "ایک ہی اثر۔"

Maya نے سر ہلایا۔ "یہی وہ ہے جو میں چاہتی ہوں تم کرو۔ صرف storage اور databases پر نہیں — ہر چیز پر۔ Cost optimization کو اپنے role کا ایک مسلسل function بنا دو۔"

Tom نے پہلے کبھی اپنی job کو اس طرح بیان ہوتے نہیں سنا تھا۔ اسے یہ درست اور تسلی بخش دونوں لگا۔

اگلے باب میں: آخری باقی cost category — اور وہ جو تقریباً ہر کسی کو حیران کر دیتی ہے۔
