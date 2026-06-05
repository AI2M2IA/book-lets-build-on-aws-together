# باب ۲۳: وہ فائلنگ سسٹم جو خود کو ترتیب دیتا ہے

ایک law firm فعال case files اپنی میز پر رکھتی ہے۔ مکمل cases ایک فائلنگ cabinet میں جاتی ہیں۔ تین سال پرانے cases basement میں storage boxes میں جاتے ہیں۔ دس سال پرانے cases ایک off-site archive facility میں جاتے ہیں جو فی box سینٹ لاگت آتے ہیں لیکن کچھ بھی بازیافت کرنے میں دو دن لگتے ہیں۔

ایک ہی معلومات، مختلف لاگت پر اسٹور کردہ اس بات پر منحصر کہ اسے کتنی اکثر access کیا جاتا ہے۔

S3 یہ خودبخود کرتا ہے۔

Tom Nimbus AWS bill review کر رہا تھا۔ Line item: S3 storage۔ $847/month۔

اس نے Leo کو بلایا۔

"ہمارے پاس S3 میں 4.2 terabytes ہیں،" Leo نے چیک کرنے کے بعد کہا۔

"کس کا؟"

"ریستوران کی تصاویر۔ آرڈر receipts۔ Analytics exports۔ 18 ماہ پرانے backup snapshots۔"

"آخری بار کسی نے 18 ماہ پرانے backup کو کب access کیا؟"

Leo نے access logs چیک کیے۔

"گزشتہ اکتوبر،" اس نے کہا۔ "ایک بار۔ Backup format verify کرنے کے لیے۔"

"تو ہم S3 Standard pricing پر 18 ماہ کے backups کے لیے ادائیگی کر رہے ہیں۔"

"ہاں۔"

Tom نے S3 pricing page دیکھا۔ S3 Standard: $0.023 per GB per month۔ S3 Glacier Instant Retrieval: $0.004 per GB per month۔

اس نے حساب لگایا۔

"ہم صرف پرانا ڈیٹا سستی storage میں move کر کے اس bill کو نمایاں طور پر کم کر سکتے ہیں،" اس نے کہا۔

"ہمیں جاننا ہوگا کہ کیا پرانا ہے،" Leo نے کہا۔

"S3 جانتا ہے۔ یہ last access time track کرتا ہے۔"

**S3 Storage Classes: مکمل Spectrum**

باب ۵ نے S3 Standard کو بنیادی storage class کے طور پر متعارف کرایا۔ S3 کے پاس اصل میں سات storage classes ہیں، ہر ایک مختلف access patterns کے لیے ڈیزائن کردہ:

**S3 Standard**: کثرت سے accessed data کے لیے۔ کم latency (milliseconds)۔ سب سے زیادہ لاگت۔ کم از کم storage مدت نہیں۔ فعال data کے لیے استعمال کریں: موجودہ مینو تصاویر، آج کے آرڈرز، حالیہ logs۔

**S3 Standard-Infrequent Access (S3 Standard-IA)**: ماہانہ ایک بار سے کم accessed data کے لیے۔ Standard جیسی millisecond retrieval، لیکن کم storage لاگت + per-GB retrieval fee۔ اس data کے لیے استعمال کریں جو access کے وقت فوری چاہیے، لیکن کم ہی: پرانے آرڈر receipts، 6 ماہ پرانے analytics exports۔

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: S3 Standard-IA جیسا لیکن صرف ایک Availability Zone میں اسٹور (تین کی بجائے)۔ کم durable، لیکن 20% سستا۔ اس data کے لیے استعمال کریں جو کھوئے جانے پر recreate کیا جا سکتا ہو: thumbnail cache، temporary processing outputs۔

**S3 Glacier Instant Retrieval**: کبھی کبھار access کردہ archived data۔ Millisecond retrieval۔ بہت کم storage لاگت، زیادہ per-GB retrieval لاگت۔ 90-day کم از کم storage۔ تیماہی یا کم access کردہ data کے لیے استعمال کریں: quarterly compliance reports، 12 ماہ پرانے backup snapshots۔

**S3 Glacier Flexible Retrieval**: Deep archive، منٹوں سے گھنٹوں میں retrieved۔ Glacier Instant Retrieval سے کم لاگت۔ کم urgency والے archival data کے لیے استعمال کریں۔

**S3 Glacier Deep Archive**: سب سے کم لاگت والا option۔ 12 گھنٹے میں retrieved۔ 180-day کم از کم storage۔ وہ data جو regulatory compliance کے لیے رکھنا ضروری ہو لیکن access کی توقع کبھی نہ ہو: 7 سال کے tax records، 10 سال کے audit logs۔

Pattern: جیسے access frequency کم ہوتی ہے، لاگت کم ہوتی ہے لیکن retrieval time بڑھتا ہے (اور per-retrieval لاگت بڑھتی ہے)۔ وہ class چنیں جو آپ کے access pattern سے match کرے۔

**S3 Lifecycle Policies: خودکار فائلنگ سسٹم**

Storage classes کے درمیان ہاتھ سے files move کرنا error-prone اور وقت طلب ہے۔ S3 **lifecycle policies** اسے آپ کے define کردہ قواعد کی بنیاد پر خودکار کرتی ہیں۔

ایک lifecycle rule کے دو اجزاء ہیں:

**Filter**: کون سے objects قاعدہ لاگو ہوتا ہے (تمام objects، مخصوص prefix والے objects، مخصوص tags والے objects)۔

**Actions**: کیا کرنا ہے، کتنے دنوں کے بعد۔

Nimbus کے آرڈر receipts کے لیے مثال lifecycle policy:

```
90 دنوں کے بعد S3 Standard-IA میں Transition
365 دنوں کے بعد S3 Glacier Instant Retrieval میں Transition
2555 دنوں (7 سال) کے بعد S3 Glacier Deep Archive میں Transition
2920 دنوں (8 سال) کے بعد Delete
```

یہ واحد policy یقینی بناتی ہے:

- فعال receipts (< 90 دن): S3 Standard، تیز access
- حالیہ receipts (90-365 دن): Standard-IA، سستی لیکن فوری available
- تاریخی receipts (1-7 سال): Glacier، بہت سستی، شاذ و نادر ضروری
- Expired receipts (> 8 سال): خودبخود deleted

Tom نے projected savings review کی: $847/month سے تقریباً $220/month تک۔

"بس... یہ define کرنے سے کہ کیا پرانا ہے اور کہاں جانا چاہیے؟" اس نے کہا۔

"اور S3 خودبخود move کرتا ہے،" Leo نے تصدیق کی۔ "کوئی cron job نہیں۔ کوئی ہاتھ سے migration نہیں۔ کوئی بھولنا نہیں۔"

**S3 Intelligent-Tiering: Self-Organizing Class**

اگر آپ نہیں جانتے کہ آپ اپنا data کتنی اکثر access کریں گے تو کیا ہوگا؟

**S3 Intelligent-Tiering** ہر object کے لیے access patterns monitor کرتا ہے اور اسے خودبخود access tiers کے درمیان move کرتا ہے:

- **Frequent Access tier**: حال ہی میں accessed objects کے لیے
- **Infrequent Access tier**: 30 دن سے access نہ کیے گئے objects
- **Archive Instant Access tier**: 90 دن سے access نہ کیے گئے objects
- **Archive Access tier**: 90-730 دن سے access نہ کیے گئے objects (اختیاری)
- **Deep Archive Access tier**: 180-730+ دن سے access نہ کیے گئے objects (اختیاری)

S3 Intelligent-Tiering ہر object فی ماہ ایک چھوٹی monitoring fee چارج کرتا ہے ($0.0025 per 1,000 objects)، لیکن Frequent اور Infrequent tiers کے لیے کوئی retrieval fee نہیں۔

Intelligent-Tiering کب استعمال کریں:

- Access patterns غیر قابل پیش گوئی یا وقت کے ساتھ بدلتے ہیں
- آپ کے پاس hot اور cold data کا مرکب ہے جسے آپ آسانی سے classify نہیں کر سکتے
- Objects 128KB سے بڑے ہیں (چھوٹے objects monitoring fees میں زیادہ لاگت آتی ہے جتنی savings ہوتی ہیں)

Explicit storage classes (lifecycle policies کے ساتھ) کب استعمال کریں:

- Access patterns قابل پیش گوئی ہیں
- آپ per-object monitoring charges minimize کرنا چاہتے ہیں
- Objects چھوٹے ہیں (< 128KB)

**Multipart Upload: بڑے Objects کے لیے**

S3 کی single upload limit 5GB ہے۔ بڑے objects کے لیے، آپ کو **multipart upload** استعمال کرنا ضروری ہے: object کو parts میں تقسیم کریں، ہر ایک parallel میں upload کریں، اور S3 انہیں assemble کرتا ہے۔

فوائد:

- تیز uploads (parallel)
- ناکام uploads resume کی جا سکتی ہیں (صرف ناکام parts دوبارہ upload کریں)
- 5GB سے بڑے objects کے لیے ضروری

Lifecycle rule tip: 7 دنوں کے بعد incomplete multipart uploads delete کرنے کے لیے lifecycle rule سیٹ کریں۔ اگر upload آدھا ختم ہونے کے بعد ناکام ہو اور cleanup نہ ہو، وہ partial parts اسٹور اور charged ہوتے ہیں — assembled object کے بغیر۔

Tom نے اس tip کی بے حد تعریف کی۔

**S3 Replication: Buckets کے درمیان Data Copy کرنا**

S3 خودبخود ایک bucket سے دوسری میں objects replicate کر سکتا ہے:

**Same-Region Replication (SRR)**: ایک ہی region میں objects copy کریں۔ Compliance کے لیے استعمال کریں (ایک مختلف account میں الگ copy رکھنا)، متعدد buckets سے logs aggregate کرنا، یا production data سے test environments بنانا۔

**Cross-Region Replication (CRR)**: Objects کو مختلف region میں copy کریں۔ Disaster recovery (regions میں data redundancy)، compliance (data مخصوص geography میں ہونی ضروری ہے)، اور عالمی صارفین کے لیے کم latency کے لیے استعمال کریں۔

Replication ایک backup solution نہیں ہے — اگر آپ source bucket میں object delete کریں، یہ replica میں بھی delete ہو جاتی ہے (جب تک delete marker replication disabled نہ ہو)۔ Backup کے لیے AWS Backup یا versioning کے ساتھ object lock استعمال کریں۔

**S3 Object Lock: Compliance کے لیے Immutability**

کچھ regulations کا مطلب ہے data **immutable** ہونا ضروری ہے — ایک بار لکھے جانے کے بعد، ایک مخصوص مدت کے لیے modify یا delete نہیں کیا جا سکتا۔

**S3 Object Lock** WORM (Write Once، Read Many) storage implement کرتا ہے:

**Retention period**: Objects ایک مخصوص مدت کے لیے deleted یا overwritten نہیں کیے جا سکتے۔

**Legal hold**: Retention period سے قطع نظر، Objects delete نہیں کیے جا سکتے، جب تک legal hold واضح طور پر نہ ہٹایا جائے۔

S3 Object Lock regulated industries کے لیے استعمال کریں: financial records (SEC Rule 17a-4)، healthcare records (HIPAA)، compliance archives۔

## خوبیاں اور حدود

**S3 storage tiers کیوں اہم ہیں**:

- اصل میں access کی جانے والی چیزوں کے لیے durability یا availability قربان کیے بغیر نمایاں لاگت کمی
- Lifecycle policies پورے process کو خودکار کرتی ہیں — کوئی operational burden نہیں
- S3 Intelligent-Tiering access patterns predict کرنے کی ضرورت ختم کرتی ہے

**جہاں پیچیدہ ہو جاتا ہے**:

- Glacier classes پر کم از کم storage مدت charges لاگو ہوتی ہیں (Glacier Instant کے لیے 90 دن، Deep Archive کے لیے 180 دن) — جلدی delete کرنا پھر بھی minimum charge incur کرتا ہے
- Retrieval fees archive data اکثر access کرنے پر حیران کر سکتی ہیں
- Lifecycle transitions وقت لیتی ہیں — objects rule trigger ہونے کے بعد فوری move نہیں ہوتے
- بہت سارے چھوٹے objects والے buckets کے لیے Intelligent-Tiering monitoring fees جمع ہوتی ہیں

## خلاصہ

- S3 کے سات storage classes ہیں: Standard، Standard-IA، Intelligent-Tiering، One Zone-IA، Glacier Instant Retrieval، Glacier Flexible Retrieval، اور Glacier Deep Archive۔
- **Lifecycle policies** عمر کی بنیاد پر storage classes کے درمیان transitions خودکار کرتی ہیں — ایک بار define کریں، S3 ہمیشہ کے لیے سنبھالتا ہے۔
- **S3 Intelligent-Tiering** خودبخود objects کو actual access patterns کی بنیاد پر tiers کے درمیان move کرتا ہے — غیر قابل پیش گوئی workloads کے لیے استعمال کریں۔
- **Multipart upload** 5GB سے بڑے objects کے لیے ضروری اور 100MB سے بڑے کسی بھی چیز کے لیے recommended ہے۔
- **S3 Replication** (SRR اور CRR) buckets اور regions میں objects copy کرتا ہے — DR، compliance، یا aggregation کے لیے۔
- **S3 Object Lock** compliance scenarios کے لیے WORM storage فراہم کرتا ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۱)*

- **Storage class selection اشارے**:
  - "کثرت سے accessed" → Standard
  - "ماہانہ ایک بار accessed، فوری retrieval کی ضرورت" → Standard-IA
  - "گھنٹوں retrieval time برداشت، شاذ و نادر accessed" → Glacier Flexible Retrieval
  - "Regulatory compliance، 7+ سال retention، کبھی accessed نہیں" → Glacier Deep Archive
  - "نامعلوم یا بدلتے access patterns" → Intelligent-Tiering
- **Lifecycle policy امتحانی patterns**: "خودبخود storage costs کم کریں جیسے data پرانا ہو،" "90 دنوں کے بعد archive میں transition" → lifecycle policies۔
- **Intelligent-Tiering monitoring fee**: چھوٹا per-object fee۔ بہت سارے چھوٹے objects کے لیے، یہ savings سے زیادہ ہو سکتی ہے۔ امتحان اسے test کر سکتا ہے۔
- **CRR ضروریات**: Versioning دونوں source اور destination buckets پر فعال ہونی چاہیے۔ Source اور destination مختلف regions میں ہونی چاہئیں۔
- **S3 Object Lock**: "WORM،" "immutable،" "SEC 17a-4،" "delete یا modify نہیں کیا جا سکتا" → Object Lock۔ Governance mode (admins override کر سکتے ہیں)۔ Compliance mode (کوئی بھی override نہیں کر سکتا، root بھی نہیں)۔
- **Glacier restore**: Glacier میں Objects فوری available نہیں ہیں۔ آپ کو access کے لیے S3 Standard میں ایک copy "restore" کرنی ضروری ہے۔ Restored copy temporary ہوتی ہے (آپ مدت سیٹ کریں)۔ Original Glacier میں رہتا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

S3 Standard-IA اور S3 Glacier Instant Retrieval کے درمیان فرق بیان کریں۔ ہر ایک کو کیا access pattern مناسب بناتا ہے؟

*(اشارہ: اس کے بارے میں سوچیں کہ آپ data کتنی اکثر access کریں گے اور جب آپ access کرتے ہیں تو کتنی جلدی چاہتے ہیں۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک کمپنی روزانہ 500GB application logs generate کرتی ہے۔ Logs پہلے 7 دنوں (debugging اور monitoring) کے لیے heavily queried ہوتی ہیں۔ 7 دنوں کے بعد، logs شاذ و نادر accessed ہوتی ہیں لیکن ضرورت پر 30 منٹ کے اندر available ہونی ضروری ہیں۔ 1 سال کے بعد، logs compliance کے لیے retain کرنی ضروری ہیں لیکن کبھی accessed نہیں ہوتیں۔ کمپنی ان ضروریات کو پوری کرتے ہوئے storage costs minimize کرنا چاہتی ہے۔

کون سی S3 lifecycle policy ان ضروریات کو بہترین طریقے سے پوری کرتی ہے؟

A) 7 دنوں تک S3 Standard؛ 7 دنوں کے بعد S3 Glacier Deep Archive میں transition؛ 365 دنوں کے بعد expire  
B) 7 دنوں تک S3 Standard؛ 7 دنوں کے بعد S3 Standard-IA میں transition؛ 365 دنوں کے بعد S3 Glacier Flexible Retrieval میں transition  
C) Day 1 سے تمام logs کو S3 Intelligent-Tiering میں اسٹور کریں  
D) 7 دنوں تک S3 Standard؛ 7 دنوں کے بعد S3 Glacier Instant Retrieval میں transition؛ 365 دنوں کے بعد S3 Glacier Deep Archive میں transition

**اشارہ ۱**: "30 منٹ کے اندر available" کون سی storage class کو rule out کرتی ہے؟

**اشارہ ۲**: Deep Archive 12 گھنٹے لیتا ہے retrieve کرنے میں — days 7-365 کے لیے 30 منٹ کی ضرورت پوری نہیں کرتا۔

**اشارہ ۳**: 365 دنوں کے بعد، retrieval time اہمیت نہیں رکھتی (کبھی accessed نہیں)، اس لیے سب سے سستا option لاگو ہوتا ہے۔

**جواب**: D

**وضاحت**: S3 Standard 7 دنوں کے لیے frequent access سنبھالتا ہے۔ Glacier Instant Retrieval days 7-365 کے لیے millisecond access فراہم کرتا ہے — 30 منٹ کی ضرورت Standard-IA سے نمایاں طور پر کم لاگت پر پوری کرتا ہے۔ 365 دنوں کے بعد، Glacier Deep Archive ایسے data کے لیے سب سے سستا option ہے جو کبھی accessed نہیں ہوتا۔

**A کیوں نہیں؟** Glacier Deep Archive بازیافت میں 12 گھنٹے لیتا ہے — days 7-365 کے لیے "30 منٹ availability" ضرورت پوری نہیں کرتا۔

**B کیوں نہیں؟** 7 دنوں کے بعد Standard-IA کام کرتا ہے، لیکن Glacier Instant Retrieval نمایاں طور پر سستا ہے۔ Standard-IA زیادہ appropriate ہے جب آپ کو instant retrieval کی ضرورت ہو لیکن access infrequent ہو — یہاں، data کے day 7 کے بعد بالکل rarely accessed ہونے سے Glacier زیادہ cost-effective ہے۔

**C کیوں نہیں؟** Intelligent-Tiering کی monitoring fee per object ہوتی ہے اور explicit lifecycle rules جیسی aggressively logs کو archive tiers میں نہیں move کر سکتی۔ بڑے volume logs کے لیے predictable access pattern کے ساتھ، explicit lifecycle rules زیادہ cost-effective ہیں۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۱*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کے پاس مختلف خصوصیات کے ساتھ تین قسم کے S3 data ہیں:

- ریستوران کی تصاویر: ایک بار uploaded، صارفین کے ذریعے بہت بار accessed، کبھی deleted نہیں
- آرڈر receipts: پہلے مہینے میں صارفین کے ذریعے accessed، tax purposes کے لیے 7 سال رکھی جاتی ہیں
- Analytics exports: روزانہ generate، اگلے ہفتے analyze، 2 سال رکھی جاتی ہیں

ہر ایک کے لیے lifecycle policy ڈیزائن کریں۔ ریستوران کی تصاویر کے لیے، کیا Intelligent-Tiering سمجھ آئے گا؟ آرڈر receipts کے لیے، 1 ماہ سے 7 سال کی window کو کون سی storage class cover کرتی ہے؟ Analytics exports کے لیے، آپ bucket کو مختلف prefixes پر مختلف policies apply کرنے کے لیے کیسے structure کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد real-world data کے لیے storage tier selection کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے lifecycle policies implement کیں۔

اگلے مہینے S3 bill $847 سے $198 تک گر گئی۔

اس نے comparison print کیا اور Maya کی میز پر بغیر کچھ کہے رکھ دیا۔

Maya نے اسے دیکھا۔ پھر date۔ پھر Tom کو۔

"تین ہفتے،" اس نے کہا۔

"Policies ڈیزائن کرنے میں ایک دوپہر،" اس نے کہا۔ "انہیں implement کرنے میں ایک گھنٹہ۔ پہلی مکمل billing cycle دیکھنے کے لیے تین ہفتے۔"

"S3 costs میں دو تہائی کمی۔"

"اس data کے لیے جسے ہم access نہیں کرتے۔"

Maya نے دوبارہ numbers دیکھے۔

"Tom،" اس نے کہا، "میں چاہتی ہوں کہ آپ ہر AWS سروس کے لیے یہ review کریں۔ Storage، compute، networking۔ فضول تلاش کریں۔"

وہ پہلے سے اپنی میز پر واپس تھا۔

"میں نے پچھلے ہفتے شروع کیا،" اس نے کہا۔

اگلے باب میں: database tier کی اپنی ایسی ہی گفتگو ہے، اور Aurora وہ جواب ہے جس سے Tom کو امید نہیں تھی۔
