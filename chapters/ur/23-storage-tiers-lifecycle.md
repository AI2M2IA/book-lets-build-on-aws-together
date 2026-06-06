# باب 23: وہ فائلنگ سسٹم جو خود کو ترتیب دیتا ہے

ایک law firm فعال case files اپنی میز پر رکھتی ہے۔ مکمل cases ایک filing cabinet میں جاتی ہیں۔ تین سال پرانے cases basement میں storage boxes میں جاتے ہیں۔ دس سال پرانے cases ایک off-site archive facility میں جاتے ہیں جو فی box سینٹ لاگت آتے ہیں لیکن جہاں سے کچھ بھی بازیافت کرنے میں دو دن لگتے ہیں۔

ایک ہی معلومات، مختلف لاگتوں پر اسٹور کی گئی اس بنیاد پر کہ اسے کتنی بار access کیا جاتا ہے۔

---

workflow automation جگہ پر ہونے اور order flow آخرکار مستحکم ہونے کے ساتھ، Tom اپنے cost review پر واپس آ گیا تھا۔ S3 bill پچھلی سہ ماہی سے اس کے ذہن کے پیچھے بیٹھا ہوا تھا — ان line items میں سے ایک جو بڑھتا رہتا تھا بغیر کسی کے براہ راست اسے دیکھے۔ آخرکار اس کے پاس دیکھنے کا وقت تھا۔

اس نے Leo کو بلایا۔

"ہمارے پاس S3 میں 4.2 terabytes ہیں،" Leo نے چیک کرنے کے بعد کہا۔

"کس چیز کے؟"

"ریستوران photos۔ Order receipts۔ Analytics exports۔ 18 ماہ پہلے کے backup snapshots۔"

"آخری بار کسی نے 18 ماہ پہلے کے ایک backup کو کب access کیا؟"

Leo نے access logs چیک کیے۔

"پچھلے اکتوبر،" اس نے کہا۔ "ایک بار۔ backup format verify کرنے کے لیے۔"

"تو ہم 18 ماہ کے backups کی پوری S3 Standard pricing پر ادائیگی کر رہے ہیں۔"

"ہاں۔"

"یہ فی مہینہ کتنا خرچ کرتا ہے — Glacier بمقابلہ Standard؟" Tom نے پوچھا، پہلے ہی pricing page کھولتے ہوئے۔

S3 Standard: $0.023 فی GB فی مہینہ۔ S3 Glacier Instant Retrieval: $0.004 فی GB فی مہینہ۔

Tom نے ریاضی کی۔

"ہم اس bill کو نمایاں طور پر کم کر سکتے ہیں،" اس نے کہا، "بس پرانا data سستے storage میں منتقل کر کے۔"

"ہمیں جاننا ہوگا کہ کیا پرانا ہے،" Leo نے کہا۔

"S3 جانتا ہے۔ یہ last access time ٹریک کرتا ہے۔"

**S3 Storage Classes: مکمل Spectrum**

باب 5 نے S3 Standard کو بنیادی storage class کے طور پر متعارف کرایا۔ S3 کی دراصل آٹھ storage classes ہیں، ہر ایک مختلف access patterns کے لیے ڈیزائن کی گئی (آٹھویں، **S3 Express One Zone**، latency-critical workloads کے لیے ایک خصوصی single-AZ class ہے اور high-performance scenarios کے باہر شاذ و نادر ہی ظاہر ہوتی ہے):

**S3 Standard**: کثرت سے access کیے گئے data کے لیے۔ کم latency (ملی سیکنڈ)۔ سب سے زیادہ لاگت۔ کوئی minimum storage duration نہیں۔ فعال data کے لیے استعمال کریں: موجودہ menu photos، آج کے آرڈرز، حالیہ logs۔

**S3 Standard-Infrequent Access (S3 Standard-IA)**: ایسے data کے لیے جسے مہینے میں ایک بار سے کم access کیا جاتا ہے۔ Standard جیسی ہی ملی سیکنڈ retrieval، لیکن کم storage لاگت + per-GB retrieval fee۔ 30-دن minimum storage duration۔ ایسے data کے لیے استعمال کریں جس کی آپ کو access کرتے وقت فوراً ضرورت ہو، لیکن شاذ و نادر ہی کریں: پرانے order receipts، 6-ماہ پرانے analytics exports۔

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: S3 Standard-IA جیسا ہی (30-دن minimum سمیت) لیکن صرف ایک Availability Zone میں اسٹور (تین کے بجائے)۔ کم durable (اگر اس AZ میں کوئی disaster ہو، data کھو سکتا ہے)، لیکن 20% سستا۔ ایسے data کے لیے استعمال کریں جو کھونے پر دوبارہ بنایا جا سکے: thumbnail cache، عارضی processing outputs۔

**S3 Glacier Instant Retrieval**: archived data جس کی آپ کو کبھی کبھار ضرورت ہو۔ ملی سیکنڈ retrieval۔ بہت کم storage لاگت، زیادہ per-GB retrieval لاگت۔ 90-دن minimum storage۔ ایسے data کے لیے استعمال کریں جسے سہ ماہی میں ایک بار یا کم access کیا جاتا ہو: سہ ماہی compliance reports، 12-ماہ پرانے backup snapshots۔

**S3 Glacier Flexible Retrieval**: Deep archive، منٹوں سے گھنٹوں میں بازیافت۔ Glacier Instant Retrieval سے کم لاگت۔ کم فوری archival data کے لیے استعمال کریں۔

**S3 Glacier Deep Archive**: سب سے کم لاگت option۔ 12 گھنٹوں میں بازیافت۔ 180-دن minimum storage۔ ایسے data کے لیے استعمال کریں جسے regulatory compliance کے لیے رکھنا ضروری ہو لیکن جس کے کبھی access ہونے کی توقع نہ ہو: 7-سال tax records، 10-سال audit logs۔

Pattern: جیسے access frequency کم ہوتی ہے، لاگت کم ہوتی ہے لیکن retrieval time بڑھتا ہے (اور per-retrieval لاگت بڑھتی ہے)۔ وہ class منتخب کریں جو آپ کے access pattern سے match کرے۔

**S3 Lifecycle Policies: خودکار فائلنگ سسٹم**

storage classes کے درمیان دستی طور پر files منتقل کرنا error-prone اور وقت طلب ہے۔ S3 **lifecycle policies** آپ کے define کردہ rules کی بنیاد پر اسے خودکار کرتی ہیں۔

ایک lifecycle rule کے دو اجزاء ہیں:

**Filter**: rule کن objects پر لاگو ہوتی ہے (تمام objects، ایک مخصوص prefix والے objects، مخصوص tags والے objects)۔

**Actions**: کیا کرنا ہے، کتنے دنوں کے بعد۔

Nimbus کے order receipts کے لیے مثال lifecycle policy:

```
Transition to S3 Standard-IA after 90 days
Transition to S3 Glacier Instant Retrieval after 365 days
Transition to S3 Glacier Flexible Retrieval after 540 days (18 months)
Transition to S3 Glacier Deep Archive after 2555 days (7 years)
Delete after 2920 days (8 years)
```

یہ واحد policy یقینی بناتی ہے:

- فعال receipts (< 90 دن): S3 Standard، تیز access
- حالیہ receipts (90-365 دن): Standard-IA، سستا لیکن فوری دستیاب
- پرانے receipts (1 سال سے 18 ماہ): Glacier Instant، بہت سستا، ضرورت پڑنے پر ملی سیکنڈ
- تاریخی receipts (18 ماہ سے 7 سال): Glacier Flexible، اور بھی سستا — retrieval میں گھنٹے لگتے ہیں، ملی سیکنڈ نہیں
- ختم شدہ receipts (> 8 سال): خودبخود delete

ایک رکاوٹ نے تقریباً منصوبہ پٹری سے اتار دیا۔ 2024 کے آخر سے، lifecycle rules **default کے طور پر 128 KB سے چھوٹے objects transition نہیں کرتیں** — اور Nimbus کے receipts اوسطاً 18 KB فی ایک تھے۔ policy کو دراصل انہیں منتقل کرنے کے لیے، Leo کو rule پر default minimum object size override کرنا پڑا (lifecycle filters `ObjectSizeGreaterThan`/`ObjectSizeLessThan` کے ساتھ سائز کے لحاظ سے بھی منتخب کر سکتے ہیں)۔ Default ایک اچھی وجہ سے موجود ہے: archive classes فی object ~40 KB metadata overhead bill کرتی ہیں اور ہر transition کی ایک request fee ہوتی ہے، تو لاکھوں چھوٹے objects کے لیے transition بچت سے زیادہ خرچ کر سکتا ہے۔ Leo نے receipts کے لیے ریاضی کی — سات سال کے retention پر، یہ پھر بھی فائدہ مند تھا۔

Tom نے متوقع بچت کا جائزہ لیا: $847/مہینہ سے تقریباً $220/مہینہ تک۔

"بس... یہ define کر کے کہ کیا پرانا ہے اور اسے کہاں جانا چاہیے؟" اس نے کہا۔

"اور S3 اسے خودبخود منتقل کرتا ہے،" Leo نے تصدیق کی۔ "کوئی cron job نہیں۔ کوئی دستی migration نہیں۔ کوئی بھولنا نہیں۔"

"رکو — لیکن S3 یہ default کے طور پر کیوں نہیں کرتا؟" Maya نے کمرے کے دوسری طرف سے پوچھا۔ "آپ کو ایک policy define کرنی ہی کیوں پڑتی ہے؟"

"کیونکہ 'پرانا' ہر bucket کے لیے مختلف ہے،" Leo نے کہا۔ "ایک compliance archive اور ایک photo upload کو بالکل مختلف retention rules چاہیے۔ S3 اندازہ نہیں لگا سکتا کہ کون سا کون سا ہے۔"

آپ شاید سوچ رہے ہوں: کیا ہوتا ہے اگر غلط data Glacier میں منتقل ہو جائے اور آپ کو اس کی فوری ضرورت ہو؟ آپ ایک retrieval fee ادا کریں گے اور انتظار کریں گے — یہی وجہ ہے کہ آپ کو اپنی lifecycle rules کو پہلے ایک چھوٹے، غیر اہم bucket پر test کرنا چاہیے، اور production data پر roll out کرنے سے پہلے access logs verify کرنے چاہئیں۔ 18 ماہ کے backups پر ایک retrieval غلطی ایک customer-facing incident سے کہیں کم خرچ کرے گی، لیکن اسے پھر بھی پہلے test کرنا قابل قدر ہے۔

اگر آپ کے data کا access pattern قابل پیش گوئی ہے (logs ہمیشہ 30 دن کے بعد cold ہوتے ہیں)، واضح lifecycle rules استعمال کریں — وہ Intelligent-Tiering کی per-object monitoring fee سے زیادہ cost-efficient ہیں۔ اگر آپ کے access patterns وقت کے ساتھ بدلتے ہیں یا پیش گوئی کرنا مشکل ہے، Intelligent-Tiering استعمال کریں — لیکن آگاہ رہیں کہ یہ بس 128 KB سے چھوٹے objects کو نظر انداز کرتا ہے: وہ monitor نہیں ہوتے، monitoring fee charge نہیں ہوتی، اور کبھی Frequent Access tier نہیں چھوڑتے۔

**S3 Intelligent-Tiering: خود کو منظم کرنے والی Class**

اگر آپ کو معلوم نہ ہو کہ آپ اپنے data کو کتنی بار access کریں گے تو کیا ہو؟

**S3 Intelligent-Tiering** ہر object کے لیے access patterns monitor کرتا ہے اور اسے خودبخود access tiers کے درمیان منتقل کرتا ہے:

- **Frequent Access tier**: حال ہی میں access کیے گئے objects کے لیے
- **Infrequent Access tier**: 30 دن سے access نہ کیے گئے objects
- **Archive Instant Access tier**: 90 دن سے access نہ کیے گئے objects
- **Archive Access tier**: 90-730 دن سے access نہ کیے گئے objects (اختیاری)
- **Deep Archive Access tier**: 180-730+ دن سے access نہ کیے گئے objects (اختیاری)

S3 Intelligent-Tiering فی object فی مہینہ ایک چھوٹی monitoring fee charge کرتا ہے ($0.0025 فی 1,000 objects)، لیکن Frequent اور Infrequent tiers کے لیے کوئی retrieval fee نہیں۔

Intelligent-Tiering تب استعمال کریں جب:

- Access patterns غیر متوقع ہوں یا وقت کے ساتھ بدلیں
- آپ کے پاس hot اور cold data کا ایک مرکب ہو جسے آپ آسانی سے classify نہیں کر سکتے
- آپ کے پاس 128KB سے بڑے objects ہوں (چھوٹے objects بالکل monitor یا auto-tier نہیں ہوتے)

واضح storage classes (lifecycle policies کے ساتھ) تب استعمال کریں جب:

- Access patterns قابل پیش گوئی ہوں
- آپ چاہتے ہوں کہ ہر object — چھوٹے سمیت — دراصل سستی classes میں منتقل ہو
- Objects چھوٹے ہوں (< 128KB)

چھوٹی-file رکاوٹ زور دینے کی مستحق ہے۔ Nimbus کے پاس S3 میں 2.3 ملین order receipt objects تھے — ہر ایک ایک چھوٹی JSON file، اوسطاً تقریباً 18KB۔ Tom نے ابتدا میں receipts bucket کے لیے Intelligent-Tiering پر غور کیا تھا، جب تک اس نے باریک تحریر نہ پڑھی۔

128KB سے چھوٹے objects Intelligent-Tiering میں **monitor نہیں ہوتے اور auto-tier نہیں ہوتے**۔ وہ monitoring fee ادا نہیں کرتے ($0.0025 فی 1,000 objects فی مہینہ) — لیکن وہ کبھی منتقل بھی نہیں ہوتے: وہ Frequent Access tier میں بیٹھے رہتے ہیں، Standard-مساوی قیمتوں پر، ہمیشہ کے لیے۔

تو 18KB receipts کے لیے، Intelligent-Tiering نے Nimbus کو کچھ اضافی خرچ نہیں کرایا ہوتا — یہ بس کچھ *کرتا* نہیں۔ 2.3 ملین cold receipts غیر معینہ مدت کے لیے hot-storage قیمتیں ($0.023/GB) ادا کرتے رہتے، جبکہ Archive tiers ($0.00099/GB) دسترس سے باہر بیٹھے رہتے۔

"تو Intelligent-Tiering بڑے objects کے لیے ڈیزائن کیا گیا ہے،" Maya نے کہا۔

"یا ان workloads کے لیے جہاں آپ واقعی access pattern نہیں جانتے،" Tom نے کہا۔ "چھوٹی files کے ایک bucket کے لیے جہاں ہم جانتے ہیں کہ receipts 90 دن کے لیے hot ہیں اور اس کے بعد cold، ایک واضح lifecycle rule — پہلے کے small-object override کے ساتھ — واحد چیز ہے جو انہیں دراصل منتقل کرتی ہے۔"

Intelligent-Tiering ایک بہترین service ہے۔ یہ بس ہر bucket کے لیے صحیح tool نہیں: 128KB threshold کے نیچے یہ بے ضرر لیکن بیکار ہے، اور صرف واضح lifecycle rules (ایک size override کے ساتھ) چھوٹے objects کو tier کریں گی۔

**جب آپ کو دراصل Data واپس چاہیے: ایک Glacier Retrieval کہانی**

lifecycle policies deploy ہونے کے تین ماہ بعد، Nimbus کو ایک قانونی نوٹس موصول ہوا۔ ایک سابق ریستوران partner ایک contract term پر تنازع کر رہا تھا، اور Nimbus کے وکلاء کو اس partner کے لیے 18 ماہ کے order records چاہیے تھے — افتتاح سے contract termination تک سب کچھ۔

"اور اگر کوئی legal discovery process کے ذریعے توڑنے کی کوشش کرے؟" Priya نے کہا۔ وہ مذاق نہیں کر رہی تھی۔ "وکلاء کا bulk data exports مانگنا ایک عام social engineering vector ہے۔ کوئی data store کھولنے سے پہلے verify کریں کہ درخواست جائز ہے۔"

درخواست جائز تھی۔ Records S3 میں تھے، تین storage classes میں: سب سے حالیہ 90 دن Standard-IA میں، پچھلا سال Glacier Instant Retrieval میں، باقی Glacier Flexible Retrieval میں (lifecycle policy نے 18 ماہ سے پرانے data کے لیے Flexible استعمال کیا تھا)۔

Glacier Instant records فوراً دستیاب تھے۔ Leo نے ریستوران ID کے لحاظ سے filter کیا، matching order records کی شناخت کے لیے ایک Athena query چلائی، اور انہیں ایک محفوظ S3 location پر export کیا۔ پانچ منٹ کا کام۔

Glacier Flexible records کے لیے ایک restore request درکار تھی:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **Standard tier**: 3-5 گھنٹے۔ Records 7 دن کے لیے S3 Standard میں ایک عارضی copy کے طور پر دستیاب ہوں گے، پھر خودبخود ہٹا دیے جائیں گے۔ اصل archived copy Glacier میں رہتی ہے۔

پورے retrieval کی لاگت: Standard tier پر $0.01 فی GB بازیافت شدہ، 4.2 GB archived records کے لیے۔ تقریباً چار سینٹ۔ (Expedited tier — 1 سے 5 منٹ — $0.03 فی GB خرچ کرتا ہے، لیکن اس کی دستیابی Standard کی طرح guaranteed نہیں ہے۔)

"چار سینٹ،" Maya نے کہا، جب Leo نے واپس report کیا۔ "18 ماہ کے records کے لیے۔"

"ہم نے 4.2GB کو ڈیڑھ سال کے لیے $0.0036 فی GB فی مہینہ پر اسٹور کیا،" Leo نے کہا۔ "Storage لاگت کل تقریباً ستائیس سینٹ تھی۔ Retrieval لاگت چار تھی۔ بمقابلہ ایک ڈالر چوہتر اگر ہم نے اسے 18 ماہ کے لیے S3 Standard میں رکھا ہوتا۔"

"اور واحد چیز جو اہم تھی،" Priya نے کہا، "وہ یہ تھی کہ ہمیں یاد تھا کہ یہ Flexible Retrieval میں تھا اور ہم نے 3-5 گھنٹے کے انتظار کے لیے منصوبہ بندی کی۔ اگر وکلاء کو یہ 30 منٹ میں چاہیے ہوتا، ہمیں ایک مسئلہ ہوتا۔"

یہ Glacier کے بارے میں اہم operational سبق ہے: یہ صرف ایک cost فیصلہ نہیں، یہ ایک retrieval SLA فیصلہ ہے۔ Glacier Flexible یا Deep Archive میں data archive کرنے سے پہلے، اس کے لیے retrieval time document کریں جسے اس کی ضرورت ہو سکتی ہے۔ "Data موجود ہے" اور "ہم اسے 30 منٹ میں حاصل کر سکتے ہیں" دو مختلف ضمانتیں ہیں۔

**Multipart Upload: بڑے Objects کے لیے**

S3 کی ایک 5GB single upload limit ہے۔ بڑے objects کے لیے، آپ کو **multipart upload** استعمال کرنا ضروری ہے: object کو parts میں تقسیم کریں، ہر ایک کو متوازی upload کریں، اور S3 انہیں جمع کرتا ہے۔

فوائد:

- تیز uploads (متوازی)
- ناکام uploads دوبارہ شروع کر سکتے ہیں (صرف ناکام parts دوبارہ upload کریں)
- objects > 5GB کے لیے درکار

Lifecycle rule tip: incomplete multipart uploads کو 7 دن کے بعد delete کرنے کے لیے ایک lifecycle rule سیٹ کریں۔ اگر ایک upload آدھے راستے میں ناکام ہو اور cleanup نہ کیا جائے، وہ partial parts اسٹور اور charge کیے جاتے ہیں — دکھانے کے لیے ایک جمع شدہ object کے بغیر۔

Tom نے اس tip کی بہت قدر کی۔

اس نے تمام Nimbus buckets میں incomplete multipart uploads کی فہرست بنانے کے لیے AWS CLI command چلائی:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

Output اس کی توقع سے زیادہ لمبا تھا۔ اس نے اسے ایک counter کو pipe کیا۔

340 incomplete uploads۔ سب سے پرانا 8 ماہ پہلے کا تھا — ریستوران photo upload flow کا Leo کا load test۔ Load test نے سینکڑوں partial uploads پیدا کیے تھے، جن میں سے کوئی مکمل نہیں ہوا تھا (test انہیں مکمل کرنے کے لیے ڈیزائن نہیں کیا گیا تھا، بس initiation endpoint test کرنے کے لیے)۔ 340 incomplete uploads، S3 میں بیٹھے، ہر ایک partial data کی نمائندگی کرتا ہوا جسے AWS اسٹور اور charge کر رہا تھا۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے کہا۔ وہ معلومات نہیں مانگ رہا تھا۔ وہ بلند آواز سے حساب لگا رہا تھا۔

incomplete parts کا مشترکہ سائز: 48 GB۔ $0.023/GB پر: $1.10/مہینہ۔ آٹھ ماہ کے لیے: پہلے ہی $8.80 خرچ ہو چکے۔

موجودہ شرح نمو پر، اگر cleanup نہ کیا جائے: غیر معینہ مدت تک جاری رہے گا۔

"Leo،" Tom نے کہا۔

"میں نے پہلے ہی اسے deploy کر دیا — اوہ،" Leo نے قریب آتے ہوئے کہا۔ "Load test۔ میں partial uploads کو cleanup کرنا بھول گیا۔"

"آٹھ ماہ پہلے۔"

"مجھے معلوم نہیں تھا کہ S3 parts اسٹور کرتا ہے چاہے upload کبھی مکمل نہ ہو۔"

"یہ انہیں اسٹور کرتا ہے۔ یہ ان کے لیے charge کرتا ہے۔ اور کوئی dashboard آپ کو اس کے بارے میں warning نہیں دیتا۔ وہ بس جمع ہوتے رہتے ہیں۔"

Fix: incomplete multipart upload parts کو 7 دن کے بعد delete کرنے کے لیے ایک lifecycle rule۔

```
Rule: Delete incomplete multipart upload parts
Prefix: (all objects)
Action: Delete incomplete multipart uploads after 7 days
```

موجودہ 340 uploads کو دستی طور پر cleanup کیا گیا۔ Lifecycle rule یقینی بناتی ہے کہ کوئی مستقبل کے load tests یا ناکام uploads اسی طرح جمع نہ ہوں۔ وہ $1.10/مہینہ جو آٹھ ماہ سے خاموشی سے بن رہا تھا رک گیا — ڈالروں میں چھوٹا، لیکن pattern (invisible، بڑھتا، بے قید) وہ حصہ تھا جسے ختم کرنا قابل قدر تھا۔

"Rule تین لائنیں ہے،" Tom نے کہا۔ "مجھے اسے ہر bucket پر creation کے وقت سیٹ کرنا چاہیے تھا۔" اس نے bucket creation checklist اپڈیٹ کی: ہر نیا S3 bucket default کے طور پر ایک multipart upload cleanup rule حاصل کرتا ہے۔

**تین Security Layers: Detour سے پہلے ایک فوری خلاصہ**

"اور اگر کوئی توڑنے اور audit logs delete کرنے کی کوشش کرے؟" Priya نے دوبارہ پوچھا — اس بار ایک مخصوص threat model کے سیاق میں۔ "صرف ایک misconfigured lifecycle rule نہیں۔ ایک malicious insider۔ write access والی ایک compromised IAM key۔"

ٹیم کے پاس جوابات پہلے ہی تھے — انہوں نے بس انہیں اس bucket پر لاگو نہیں کیا تھا۔ تین layers، ہر ایک کتاب میں پہلے cover کی گئی، ہر ایک ایک مختلف threat vector کو address کرتی:

**Versioning** (باب 5) deletions کو الٹنے کے قابل بناتا ہے — ایک DELETE ایک delete marker بن جاتا ہے، اور پچھلے versions restorable رہتے ہیں۔ order receipts جیسے write-once data کے لیے، storage overhead کم سے کم ہے: فی object کبھی صرف ایک version ہوتا ہے۔

**S3 Object Lock** (باب 5) objects کو واقعی immutable بناتا ہے — WORM storage جسے retention period کے دوران ایک admin key بھی delete نہیں کر سکتی۔ receipts کے لیے، ان کی 7-سال tax retention requirement کے ساتھ، ٹیم نے Compliance mode منتخب کیا: کوئی lifecycle misconfiguration، کوئی IAM غلطی، کوئی compromised credential auditor کے پوچھنے سے پہلے انہیں ہٹا نہیں سکتا۔ اور Object Lock lifecycle transitions کے ساتھ coexist کرتا ہے — receipts کو Glacier Deep Archive میں منتقل کرنے والی ایک rule پھر بھی کام کرتی ہے؛ data سستا ہو جاتا ہے اور immutable رہتا ہے۔

**CloudTrail S3 data events** (ابواب 16-17) آپ کو بتاتے ہیں کہ data کے ساتھ کیا ہوا: ہر GET، PUT، DELETE، اور COPY کس، کہاں سے، اور کب کے ساتھ logged — وہ خام مواد جو GuardDuty (باب 17) anomalies پر alert کرنے کے لیے استعمال کرتا ہے۔

"Accident recovery کے لیے Versioning۔ Compliance immutability کے لیے Object Lock۔ Forensics کے لیے CloudTrail،" Priya نے خلاصہ کیا۔ "ہم نے ان میں سے ہر ایک کو الگ سے cover کیا۔ آج کا نیا فیصلہ اس bucket کے لیے تینوں کو on کرنا ہے۔"

**Cross-Region Replication: Disaster Recovery کے طور پر Order Records**

Nimbus order receipts bucket us-west-2 میں تھا۔ یہ جان بوجھ کر تھا — us-west-2 وہ جگہ ہے جہاں application چلتی تھی۔ لیکن "application us-west-2 میں ہے" اور "تمام order records صرف us-west-2 میں ہیں" مختلف risk profiles ہیں۔

اگر Nimbus کو us-east-1 میں ایک disaster recovery site فعال کرنی ہو، order records کو وہاں بھی ہونا پڑے گا۔ ایک regional failure کے بیچ میں انہیں copy کرنے کا انتظار کرنا recovery plan نہیں ہے۔

Priya نے order receipts bucket کے لیے **Cross-Region Replication (CRR)** کی سفارش کی۔ Rule:

```
Source: nimbus-order-receipts (us-west-2)
Destination: nimbus-order-receipts-dr (us-east-1)
Replication: All objects
Storage class in destination: S3 Standard-IA (cheaper — this is the DR copy, rarely accessed)
```

Mechanics باب 5 سے مانوس تھیں: نئے writes کی asynchronous replication (زیادہ تر objects 15 منٹ کے اندر؛ ایک guaranteed SLA کے لیے **S3 Replication Time Control** کی ادائیگی درکار ہے)، دونوں buckets پر versioning درکار، read-source/write-destination permission والا ایک IAM role۔ اوپر rule میں نوٹ کرنے کے قابل تفصیل: destination source سے ایک *مختلف storage class* استعمال کرتا ہے — DR copy کے لیے Standard-IA، ایک دوسری Standard copy کی ادائیگی کے بجائے جو شاذ و نادر ہی پڑھی جاتی ہے۔ اور versioning کی پیشگی شرط نے کچھ اضافی خرچ نہیں کیا — وہ پہلے ہی accident recovery کے لیے versioning فعال کر رہے تھے۔ (CRR کی بہن، **Same-Region Replication (SRR)**، objects کو *ایک ہی* region میں buckets کے درمیان copy کرتی ہے — ایک علیحدہ account میں compliance copy، log aggregation، یا production data سے seed کیے گئے test environments کے لیے مفید۔)

ایک رکاوٹ جسے Priya نے کسی کے ٹکرانے سے پہلے بیان کیا: replication **retroactive نہیں ہے**۔ وہ objects جو rule فعال کرتے وقت پہلے ہی bucket میں موجود ہوتے ہیں replicate نہیں ہوتے — صرف نئے writes۔ ٹیمیں CRR فعال کرتی ہیں اس امید کے ساتھ کہ ان کا تمام موجودہ data destination میں ظاہر ہوگا، پھر دریافت کرتی ہیں کہ DR bucket تقریباً خالی ہے۔ پہلے سے موجود objects کے لیے، آپ **S3 Batch Replication** چلاتے ہیں، ایک علیحدہ operation جو replication rules کو ان objects پر لاگو کرتا ہے جو پہلے سے وہاں تھے۔ Nimbus نے اسے ایک بار چلایا تاکہ DR bucket کو receipts کے موجودہ 0.8 TB سے seed کیا جائے۔

"اور delete markers؟" Priya نے پوچھا۔ "اگر کوئی us-west-2 میں ایک receipt delete کرے، کیا یہ deletion کو us-east-1 میں replicate کرتا ہے؟"

Default کے طور پر، نہیں — موجودہ replication configurations میں (V2 schema جو console بناتا ہے)، **delete markers replicate نہیں ہوتے**۔ کوئی us-west-2 میں ایک receipt delete کرتا ہے، اور us-east-1 copy اسے ایسے serve کرتی رہتی ہے جیسے کچھ نہیں ہوا۔ اگر آپ *چاہتے* ہیں کہ DR bucket deletions کا آئینہ دار ہو، آپ rule پر delete marker replication واضح طور پر فعال کرتے ہیں (tag filters والی rules پر سپورٹ نہیں) — یہ legacy V1 schema میں default تھا، جسے پرانا مواد اب بھی بیان کرتا ہے۔ کسی بھی صورت، lifecycle expirations کبھی اپنے delete markers replicate نہیں کرتیں۔

Replication پھر بھی ایک backup حل *نہیں* ہے، البتہ — مخالف وجوہات سے: یہ مستقل version deletions یا malicious overwrites کے mirror میں replicate ہونے سے تحفظ نہیں دے گی، اور اس کی کوئی retention semantics نہیں۔ حقیقی backup کے لیے، versioning کو Object Lock کے ساتھ جوڑیں، یا AWS Backup استعمال کریں۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے پوچھا۔

us-east-1 میں S3 Standard-IA میں 0.8 TB کے لیے storage: $10.00/مہینہ۔ علاوہ replication data transfer (فی GB transferred cross-region charge کیا گیا): ان کے موجودہ write volume پر کم سے کم۔ کل اضافی لاگت: تمام order records کی ایک مکمل cross-region copy کے لیے تقریباً $10-11/مہینہ۔

Tom نے اسے بغیر شکایت کے لکھ لیا۔

**S3 Storage Lens: مکمل تصویر دیکھنا**

Tom نے اپنا audit دستی طور پر کیا تھا — AWS console کو bucket بہ bucket کھولنا، objects گننے کے لیے AWS CLI commands چلانا، bucket کے لحاظ سے storage لاگتوں کے لیے billing explorer چیک کرنا۔ اس spreadsheet کو بنانے میں اسے دوپہر کا بیشتر حصہ لگا تھا۔

**S3 Storage Lens** وہ AWS tool ہے جو اس دستی process کی جگہ لیتا ہے۔ یہ تمام buckets، تمام accounts، اور تمام regions میں S3 usage اور activity میں organization-wide visibility فراہم کرتا ہے — ایک واحد dashboard میں۔

cost optimization کے لیے سب سے اہم metrics:

**Non-current version bytes**: پرانے versions کتنا storage استعمال کرتے ہیں (جب versioning فعال ہو)۔ Versioning حفاظت کے لیے ضروری ہے، لیکن اگر ایک document کثرت سے update ہو، پرانے versions جمع ہوتے ہیں۔ 30 دن کے بعد non-current versions expire کرنے کے لیے ایک lifecycle rule version bloat کو روکتی ہے۔

**Incomplete multipart upload bytes**: بالکل وہ مسئلہ جو Leo نے load test کے ساتھ پیدا کیا تھا، خودبخود سامنے آیا۔ Storage Lens کے بغیر، Tom کو incomplete multipart uploads ڈھونڈنا جاننا پڑا۔ Storage Lens کے ساتھ، وہ dashboard میں ایک line item کے طور پر ظاہر ہوتے ہیں۔

**% requests returning 403**: ایک ایسے bucket پر 403 (Forbidden) responses میں ایک spike جسے عوامی طور پر قابل رسائی ہونا چاہیے ایک misconfigured bucket policy کی نشاندہی کر سکتا ہے۔ ایک private bucket پر ایک spike ایک scanning یا probing کوشش کی نشاندہی کر سکتا ہے۔ کسی بھی صورت، یہ تحقیق کے قابل ایک signal ہے۔

**Average object size**: چھوٹے objects کا ایک bucket (اوسط 2KB) بڑے objects کے ایک bucket (اوسط 50MB) سے Intelligent-Tiering economics، request costs، اور Athena کے لیے query performance کے لحاظ سے مختلف برتاؤ کرتا ہے۔

S3 Storage Lens کا ایک free tier ہے جو ضروری metrics cover کرتا ہے۔ advanced metrics (request statistics، filtering کے لیے lens groups) کی فی ملین objects فی مہینہ ایک اضافی لاگت ہے — اس کی فعال کردہ بچت کے مقابلے میں چھوٹی۔

"ہم نے یہ شروع سے کیوں استعمال نہیں کیا؟" Maya نے پوچھا۔

"ہمارے پاس شروع سے 4.2 terabytes نہیں تھے،" Tom نے کہا۔ "چھوٹے پیمانے پر، ایک spreadsheet کام کرتا ہے۔ اس پیمانے پر، پیمانہ خود tool کے لیے ایک دلیل بن جاتا ہے۔"

یہ Nimbus architecture میں ایک بار بار آنے والا موضوع ہے: ایک دیے گئے پیمانے کے لیے صحیح tool ہمیشہ اگلے پیمانے کے لیے صحیح tool نہیں ہوتا۔ S3 Storage Lens اس وقت configure کرنا قابل قدر ہے جیسے ہی آپ کا S3 usage اس سے بڑھ جائے جسے آپ ایک دوپہر میں دستی طور پر audit کر سکتے ہیں — جو تقریباً تب ہے جب اس کی فعال کردہ بچت اس کے بچائے گئے وقت سے معنی خیز طور پر تجاوز کرنا شروع کر دیتی ہے۔

## خوبیاں اور حدود

**S3 storage tiers کیوں اہم ہیں**:

- جو دراصل access کیا جاتا ہے اس کے لیے durability یا availability قربان کیے بغیر نمایاں cost کمی
- Lifecycle policies پورے process کو خودکار کرتی ہیں — کوئی operational بوجھ نہیں
- S3 Intelligent-Tiering access patterns پیش گوئی کرنے کی ضرورت ہٹا دیتا ہے

**جہاں یہ پیچیدہ ہو جاتا ہے**:

- Glacier classes پر minimum storage duration charges لاگو ہوتے ہیں (Glacier Instant کے لیے 90 دن، Deep Archive کے لیے 180 دن) — جلدی delete کرنا پھر بھی minimum charge لیتا ہے
- اگر آپ archived data کو کثرت سے access کریں تو retrieval fees آپ کو حیران کر سکتی ہیں
- Lifecycle transitions وقت لیتی ہیں — rule trigger ہونے کے بعد objects فوراً منتقل نہیں ہوتے
- Intelligent-Tiering 128KB سے کم objects کو نظر انداز کرتا ہے — کوئی fee نہیں، لیکن کوئی tiering بھی نہیں؛ اور lifecycle rules انہیں default کے طور پر skip کرتی ہیں جب تک آپ minimum object size override نہ کریں

## خلاصہ

باب 22 سے workflow automation نے بہتر کیا کہ Nimbus requests کیسے process کرتا ہے۔ یہ باب اس بات کو بہتر کرتا ہے کہ Nimbus اس data کے لیے کیا ادا کرتا ہے جسے یہ رکھ رہا ہے لیکن access نہیں کر رہا۔ اصول وہی ہے: غلط tier کی ادائیگی بند کریں۔

- S3 کی آٹھ storage classes ہیں: Standard، Standard-IA، Intelligent-Tiering، One Zone-IA، Glacier Instant Retrieval، Glacier Flexible Retrieval، Glacier Deep Archive — علاوہ Express One Zone (خصوصی low-latency، single AZ)۔
- **Lifecycle policies** age کی بنیاد پر storage classes کے درمیان transitions خودکار کرتی ہیں — ایک بار define کریں، S3 اسے ہمیشہ کے لیے سنبھالتا ہے۔
- **S3 Intelligent-Tiering** اصل access patterns کی بنیاد پر objects کو tiers کے درمیان خودبخود منتقل کرتا ہے — 128KB سے بڑے objects والے غیر متوقع workloads کے لیے استعمال کریں۔ چھوٹے objects monitor یا auto-tier نہیں ہوتے (اور کوئی monitoring fee ادا نہیں کرتے) — وہ Frequent Access tier میں رہتے ہیں۔
- **Glacier retrieval** کے لیے Flexible اور Deep Archive tiers کے لیے ایک restore request درکار ہے۔ retrieval کے لیے SLA والے کسی data کو archive کرنے سے پہلے retrieval time (منٹوں سے 12 گھنٹے) کی منصوبہ بندی کریں۔
- **Incomplete multipart uploads** خاموشی سے جمع ہوتے ہیں اور storage charges لیتے ہیں۔ ہر bucket پر 7 دن کے بعد incomplete parts delete کرنے کے لیے ایک lifecycle rule شامل کریں۔
- **تین security layers**: versioning (الٹنے کے قابل deletes)، Object Lock (compliance کے لیے immutability)، CloudTrail data events (forensics اور anomaly detection)۔
- **Cross-Region Replication (CRR)**: order records کو ایک DR region میں خودبخود replicate کریں۔ دونوں buckets پر versioning درکار۔ Configure کریں کہ delete markers replicate ہوں یا نہیں اس بنیاد پر کہ DR copy ایک mirror ہے یا ایک backup۔
- **Multipart upload** objects > 5GB کے لیے درکار ہے اور کسی بھی چیز > 100MB کے لیے سفارش کردہ۔
- **S3 Object Lock** compliance scenarios کے لیے WORM storage فراہم کرتا ہے — Governance mode admins کے ذریعے override ہو سکتا ہے؛ Compliance mode کسی کے ذریعے override نہیں ہو سکتا۔

## امتحانی نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین 4، ٹاسک 4.1)*

- **Storage class selection signals**:
  - "کثرت سے access کیا گیا" → Standard
  - "مہینے میں ایک بار access کیا گیا، فوری retrieval چاہیے" → Standard-IA
  - "گھنٹوں کا retrieval time برداشت کر سکتا ہے، شاذ و نادر ہی access کیا گیا" → Glacier Flexible Retrieval
  - "Regulatory compliance، 7+ سال retention، کبھی access نہیں کیا گیا" → Glacier Deep Archive
  - "نامعلوم یا بدلتے access patterns" → Intelligent-Tiering
- **Lifecycle policy امتحانی patterns**: "data کی عمر بڑھنے کے ساتھ خودبخود storage costs کم کریں،" "90 دن کے بعد archive میں transition" → lifecycle policies۔
- **Intelligent-Tiering اور چھوٹے objects**: 128KB سے کم objects monitor نہیں ہوتے، کوئی monitoring fee ادا نہیں کرتے، اور کبھی auto-tier نہیں ہوتے — وہ Frequent Access میں رہتے ہیں۔ Lifecycle rules بھی sub-128KB objects کو default کے طور پر skip کرتی ہیں (override کے قابل)۔ امتحان کسی بھی حقیقت کو test کر سکتا ہے۔
- **CRR requirements**: source اور destination دونوں buckets پر Versioning فعال ہونا ضروری ہے۔ Source اور destination کو مختلف regions میں ہونا ضروری ہے۔
- **S3 Object Lock**: "WORM،" "immutable،" "SEC 17a-4،" "delete یا modify نہیں کیا جا سکتا" → Object Lock۔ Governance mode (admins کے ذریعے override ہو سکتا ہے)۔ Compliance mode (کسی کے ذریعے override نہیں ہو سکتا، root سمیت)۔
- **Glacier restore**: Glacier میں objects فوراً دستیاب نہیں ہوتے۔ آپ کو access کے لیے ایک copy کو S3 Standard میں "restore" کرنا ضروری ہے۔ Restored copy عارضی ہے (آپ مدت سیٹ کرتے ہیں)۔ اصل Glacier میں رہتا ہے۔

## مشقیں

**مشق 1 — یادداشت**

S3 Standard-IA اور S3 Glacier Instant Retrieval کے درمیان فرق کی وضاحت کریں۔ کون سا access pattern ہر ایک کو مناسب بناتا ہے؟

*(اشارہ: اس کے بارے میں سوچیں کہ آپ data کو کتنی بار access کریں گے اور جب آپ اسے access کریں تو آپ کو اسے کتنی جلدی چاہیے۔)*

**مشق 2 — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی روزانہ 500GB application logs پیدا کرتی ہے۔ Logs پہلے 7 دنوں کے لیے بھاری طور پر query کیے جاتے ہیں (debugging اور monitoring)۔ 7 دنوں کے بعد، logs شاذ و نادر ہی access کیے جاتے ہیں لیکن ضرورت پڑنے پر 30 منٹ کے اندر دستیاب ہونے ضروری ہیں۔ 1 سال کے بعد، logs کو compliance کے لیے retain کرنا ضروری ہے لیکن کبھی access نہیں کیے جاتے۔ کمپنی کو ان ضروریات کو پورا کرتے ہوئے storage costs کم سے کم کرنے کی ضرورت ہے۔

کون سی S3 lifecycle policy ان ضروریات کو سب سے بہتر طریقے سے پورا کرتی ہے؟

A) 7 دنوں کے لیے S3 Standard میں اسٹور کریں؛ 7 دنوں کے بعد S3 Glacier Deep Archive میں transition کریں؛ 365 دنوں کے بعد expire کریں  
B) 7 دنوں کے لیے S3 Standard میں اسٹور کریں؛ 7 دنوں کے بعد S3 Standard-IA میں transition کریں؛ 365 دنوں کے بعد S3 Glacier Flexible Retrieval میں transition کریں  
C) دن 1 سے تمام logs S3 Intelligent-Tiering میں اسٹور کریں  
D) 7 دنوں کے لیے S3 Standard میں اسٹور کریں؛ 7 دنوں کے بعد S3 Glacier Instant Retrieval میں transition کریں؛ 365 دنوں کے بعد S3 Glacier Deep Archive میں transition کریں

**اشارہ 1**: "30 منٹ کے اندر دستیاب" کون سی storage class کو خارج کرتا ہے؟

**اشارہ 2**: Deep Archive کو بازیافت کرنے میں 12 گھنٹے لگتے ہیں — دن 7-365 کے لیے 30-منٹ requirement کو پورا نہیں کرتا۔

**اشارہ 3**: 365 دنوں کے بعد، retrieval time اہمیت نہیں رکھتا (کبھی access نہیں کیا گیا)، تو سب سے سستا option لاگو ہوتا ہے۔

**جواب**: D

**وضاحت**: 7 دنوں کے لیے S3 Standard کثرت سے access سنبھالتا ہے۔ Glacier Instant Retrieval دن 7-365 کے لیے ملی سیکنڈ access فراہم کرتا ہے — Standard-IA سے نمایاں طور پر کم لاگت پر 30-منٹ requirement کو پورا کرتے ہوئے۔ 365 دنوں کے بعد، Glacier Deep Archive ایسے data کے لیے سب سے سستا option ہے جو کبھی access نہیں کیا جاتا۔

**A کیوں نہیں؟** Glacier Deep Archive کو بازیافت کرنے میں 12 گھنٹے لگتے ہیں — دن 7-365 کے لیے "30-منٹ دستیابی" requirement کو پورا نہیں کرتا۔

**B کیوں نہیں؟** Standard-IA یہاں پہلا پڑاؤ بھی نہیں ہو سکتا: S3 کا تقاضا ہے کہ objects کو Standard-IA یا One Zone-IA میں transition کرنے سے پہلے ایک lifecycle rule کے Standard میں 30 دن age ہونا ضروری ہے — تو "7 دنوں کے بعد Standard-IA" ایک invalid rule ہے۔ (30-دن rule Glacier classes پر لاگو نہیں ہوتا، یہی وجہ ہے کہ D کام کرتا ہے۔) اور اس کو ایک طرف رکھتے ہوئے بھی، Glacier Instant Retrieval دن 7 کے بعد شاذ و نادر access کیے گئے data کے لیے نمایاں طور پر سستا ہے۔

**C کیوں نہیں؟** Intelligent-Tiering کی فی object ایک monitoring fee ہے اور logs کو archive tiers میں اتنی جارحانہ طور پر منتقل نہیں کر سکتا جتنی واضح lifecycle rules۔ ایک قابل پیش گوئی access pattern والے logs کے بڑے volume کے لیے، واضح lifecycle rules زیادہ cost-effective ہیں۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک 4.1*

**مشق 3 — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کے پاس مختلف خصوصیات والے S3 data کی تین اقسام ہیں:

- ریستوران photos: ایک بار اپلوڈ، customers کے ذریعے کئی بار access، کبھی delete نہیں
- Order receipts: پہلے مہینے میں customers کے ذریعے access، tax مقاصد کے لیے 7 سال رکھے گئے
- Analytics exports: روزانہ پیدا، اگلے ہفتے تجزیہ، 2 سال رکھے گئے

ہر ایک کے لیے ایک lifecycle policy ڈیزائن کریں۔ ریستوران photos کے لیے، کیا Intelligent-Tiering معنی رکھے گا؟ order receipts کے لیے، کون سی storage class 1-مہینہ سے 7-سال کے window کو cover کرتی ہے؟ analytics exports کے لیے، آپ مختلف prefixes پر مختلف policies لاگو کرنے کے لیے bucket کو کیسے structure کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد حقیقی دنیا کے data کے لیے storage tier selection کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے lifecycle policies نافذ کیں۔

Leo نے پہلی rule configure کرنے میں مدد کی تھی۔ "یہ ٹھیک رہے گا،" اس نے کہا تھا۔ "Minimum storage duration صرف تب لاگو ہوتا ہے اگر ہم جلدی delete کریں — اور ہم کچھ delete نہیں کر رہے۔" اس نے آدھے راستے میں Glacier minimum duration requirements چیک کیے۔ "دراصل، مجھے اسے دوبارہ پڑھنے دو۔"

ایک مختلف bucket پر — عارضی analytics staging exports — اس نے تقریباً Glacier Instant Retrieval میں ایک 30-دن transition کو ایک 60-دن expiration rule کے ساتھ ملا دیا تھا۔ Glacier Instant کے لیے minimum storage duration 90 دن ہے: وہ objects دن 30 پر Glacier میں داخل ہوتے اور دن 60 پر delete ہو جاتے، اور S3 پھر بھی ان میں سے ہر ایک کے لیے پورے 90 دن bill کرتا — ایسے storage کے لیے archive قیمتیں ادا کرتے ہوئے جو مزید موجود نہیں تھا۔ اس نے اس bucket کے لیے Glacier transition بالکل گرا دیا؛ دن 60 پر delete کیا گیا data کبھی اتنی دیر تک زندہ نہیں رہتا کہ ایک 90-دن minimum کو amortize کرے۔ Receipts policy جیسا ڈیزائن کی گئی محفوظ تھی: 90 دن پر Standard-IA میں transition، 365 دن پر Glacier Instant Retrieval، 540 دن پر Glacier Flexible Retrieval، 2,555 دن پر Glacier Deep Archive۔

اس نے ہر bucket پر multipart upload cleanup rule بھی سیٹ کی۔ اس لیے نہیں کہ زیادہ abandoned uploads تھے — نہیں تھے — بلکہ اس لیے کہ ہوں گے۔ Load tests ہوتے ہیں۔ Deployments بیچ میں ناکام ہوتے ہیں۔ Rule اس memory سے سستی تھی جو دستی طور پر cleanup کرنا یاد رکھنے کے لیے درکار تھی۔

S3 bill اگلے مہینے $847 سے گر کر $198 ہو گیا۔

اس نے موازنہ print کیا اور کچھ کہے بغیر Maya کی میز پر رکھ دیا۔

Maya نے اسے دیکھا۔ پھر تاریخ کو۔ پھر Tom کو۔

"تین ہفتے،" اس نے کہا۔

"policies ڈیزائن کرنے کے لیے ایک دوپہر،" اس نے کہا۔ "انہیں نافذ کرنے کے لیے ایک گھنٹہ۔ پہلا مکمل billing cycle دیکھنے کے لیے تین ہفتے۔"

"S3 costs میں تین چوتھائی کمی۔"

"ایسے data کے لیے جسے ہم access نہیں کرتے۔"

"اور cross-region replication؟" Leo نے پوچھا۔

"فی مہینہ دس ڈالر زیادہ،" Tom نے کہا۔ "ایک دوسرے region میں ہر order receipt کی ایک مکمل copy کے لیے۔"

"یہ سب سے سستا disaster recovery فیصلہ ہے جو ہم نے کیا ہے۔"

Maya نے دوبارہ نمبر دیکھے۔

"Tom،" اس نے کہا، "میں چاہتی ہوں کہ تم ہماری استعمال کردہ ہر AWS service کے لیے یہ review کرو۔ Storage، compute، networking۔ ضیاع تلاش کرو۔"

وہ پہلے ہی اپنی میز پر واپس تھا۔

"میں نے پچھلے ہفتے شروع کر دیا تھا،" اس نے کہا۔

اگلے باب میں: database tier کی اس بات چیت کا اپنا version ہے، اور Aurora وہ جواب ہے جسے پسند کرنے کی Tom کو توقع نہیں تھی۔
