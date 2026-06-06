# باب ۱۳: ہر جگہ تیز

Oregon میں ایک سرور سے Boston میں ایک فون تک سفر کرنے والی تصویر تقریباً 4,100 کلومیٹر کی fiber optic cable عبور کرتی ہے۔ روشنی کی دو تہائی رفتار سے، یہ خالص physics کے تقریباً 25 ملی سیکنڈ ہیں — ناگزیر، غیر قابل مذاکرات، کائنات کے قوانین میں بنے ہوئے۔

پھر round trip شامل کریں۔ پھر processing time شامل کریں۔ براؤزر نے ابھی rendering شروع نہیں کی اور 80 ملی سیکنڈ پہلے ہی گزر چکے ہیں۔

---

*`eatnimbus.com` live تھا اور domain name حقیقی تھا۔ صارفین ایپ ڈھونڈ سکتے تھے۔ لیکن اسے ڈھونڈنا اس سے لطف اندوز ہونے جیسا نہیں تھا۔ Tom مختلف شہروں سے latency کی پیمائش چلا رہا تھا، اور East Coast اور South America کے نمبر اچھے نہیں تھے۔ domain name کا مسئلہ حل ہو گیا تھا۔ physics کا مسئلہ نہیں۔*

---

`eatnimbus.com` live تھا۔ Leo نے East Coast صارفین سے latency metrics چیک کی تھیں: فی درخواست 80-100 ملی سیکنڈ۔ یہ چھوٹا لگ سکتا ہے، لیکن یہ جمع ہو جاتا ہے۔

مینو لوڈ کریں: 90ms۔ ریستوران کی فہرست لوڈ کریں: 80ms۔ ریستوران کی تصاویر لوڈ کریں: 200ms (تصاویر بڑی ہوتی ہیں)۔ کل وقت قبل از اس کے کہ کوئی صارف آرڈر دے سکے: ایک اچھے کنکشن پر آدھے سیکنڈ سے زیادہ۔

"Physics مسئلہ ہے،" Leo نے کہا۔ "Servers Oregon میں ہیں۔ نمو East Coast پر ہے — اور São Paulo میں۔"

"تو servers کو East Coast منتقل کریں،" Tom نے کہا۔

"اس کی لاگت آتی ہے۔"

"اس پر فی مہینہ کتنا خرچ آتا ہے؟" Tom نے پوچھا۔

"us-east-1 میں اپنے بنیادی ڈھانچے کی ایک مکمل نقل چلانا؟ شاید ہماری موجودہ لاگتوں کا تین گنا۔ اور یہ ایک بالکل نیا مسئلہ پیدا کرتا ہے: West Coast ڈیٹابیس اور East Coast ڈیٹابیس کو ہم آہنگ رکھنا۔"

Priya نے اپنے لیپ ٹاپ سے نگاہ اٹھائی۔ "یا ہم servers کو منتقل نہیں کرتے۔ ہم *content* منتقل کرتے ہیں۔"

Maya نے نگاہ اٹھائی۔ "کیا فرق ہے؟ اگر content ایک server پر ہے، اور server Oregon میں ہے، تو content Oregon میں ہے۔"

"ایک صفحہ جو کچھ پہنچاتا ہے اس کا زیادہ تر static ہوتا ہے،" Priya نے کہا۔ "تصاویر، stylesheets، JavaScript files، fonts۔ یہ ہر صارف کے لیے ایک جیسے ہیں۔ یہ ڈیٹابیس سے نہیں آتے۔ یہ S3 میں رہتے ہیں۔ اور S3 objects کہیں سے بھی serve کیے جا سکتے ہیں۔"

"تو ہم انہیں صارفین کے قریب servers پر کاپی کرتے ہیں؟"

"ہم ایک سروس کو ہمارے لیے اسے منظم کرنے دیتے ہیں۔ سچائی کا ایک ذریعہ۔ کاپیاں جہاں جہاں ان کی ضرورت ہو۔"

Tom پہلے ہی pricing صفحہ کھول چکا تھا۔ Priya کے سمجھانے کے ختم ہونے سے پہلے وہ حساب لگا رہا تھا۔

**پہلے سے بھرے گودام کی مثال**

Amazon retailer کا تصور کریں، cloud کمپنی نہیں۔ ان کے پاس ہر پروڈکٹ کے ساتھ ایک جگہ پر ایک بڑا گودام ہے۔ اگر وہ ہر آرڈر اس ایک گودام سے ship کرتے، تو دور کے شہروں کے صارفین دنوں انتظار کرتے۔

اس کے بجائے، Amazon کے پاس بڑے آبادی والے مراکز کے قریب fulfillment centers ہیں۔ جب کوئی product مشہور ہو، تو وہ ان مقامی گوداموں میں pre-stock کر دیتے ہیں۔ جب Seattle میں ایک صارف ایک کتاب order کرتا ہے، تو وہ مقامی fulfillment center سے ship ہوتی ہے — ملک کے دوسری طرف سے نہیں۔

یہ ایک **Content Delivery Network (CDN)** ہے: جغرافیائی طور پر تقسیم شدہ servers کا ایک نیٹ ورک جو آپ کے content کی کاپیاں آپ کے صارفین کے قریب cache کرتا ہے۔

جب Boston میں ایک صارف آپ کا homepage request کرتا ہے، تو CDN اسے Boston میں ایک server سے serve کرتا ہے۔ Oregon سے نہیں۔ درخواست کبھی ملک عبور نہیں کرتی۔

**CloudFront سے ملیں**

Amazon CloudFront AWS کا CDN ہے۔ یہ **edge locations** کے ایک عالمی نیٹ ورک کے ذریعے کام کرتا ہے — دنیا بھر کے شہروں میں رکھے گئے caching servers۔ اس تحریر کے وقت، 100+ شہروں میں 750 سے زیادہ points of presence ہیں۔

جب آپ CloudFront ترتیب دیتے ہیں، تو آپ ایک **origin** بتاتے ہیں: آپ کے اصل content کا ذریعہ۔ آپ کا origin یہ ہو سکتا ہے:

- ایک S3 bucket (static files: تصاویر، CSS، JavaScript، PDFs)
- ایک Application Load Balancer (آپ کی ایپلیکیشن سے dynamic content)
- ایک EC2 انسٹینس
- انٹرنیٹ پر کہیں بھی ایک HTTP server

CloudFront آپ کے origin کے سامنے بیٹھتا ہے۔ Requests قریب ترین edge location پر آتی ہیں۔ اگر edge کے پاس content cache ہے، تو وہ فوری طور پر واپس کرتا ہے۔ اگر نہیں (*cache miss*)، تو یہ آپ کے origin سے لیتا ہے، cache کرتا ہے، اور واپس کرتا ہے۔

**CloudFront Caching کیسے کام کرتی ہے**

کسی بھی content کے ٹکڑے کے لیے پہلی request ہمیشہ cache miss ہوتی ہے — یہ origin جاتی ہے۔ ہر بعد کی request edge location پر cache سے ٹکراتی ہے۔

Nimbus کے لیے، مینو تصاویر CloudFront کے لیے بالکل موزوں امیدوار ہیں۔ ریستوران کی تصاویر کم ہی بدلتی ہیں (شاید جب ریستوران اپنا profile اپڈیٹ کرے)۔ CloudFront کے ساتھ:

1. Boston میں ایک صارف `images.eatnimbus.com/restaurant-047/photo.jpg` request کرتا ہے
2. CloudFront Boston میں edge location چیک کرتا ہے — ابھی تک cache نہیں ہوئی (cache miss)
3. CloudFront us-west-2 میں S3 سے لیتا ہے (~80ms)
4. CloudFront تصویر Boston edge location میں محفوظ کرتا ہے
5. Boston میں اگلا صارف وہی تصویر request کرتا ہے
6. CloudFront مقامی edge cache سے serve کرتا ہے (~5ms)

پہلی request کے لیے وہی 80ms پنالٹی۔ لیکن ایک ہی شہر سے ہزارویں request 5 ملی سیکنڈ ہے۔

**Cache-Control headers** اور CloudFront میں **TTL settings** طے کرتے ہیں کہ content edge پر کتنی دیر cached رہتی ہے۔ Image files کئی گھنٹوں یا دنوں تک cache ہو سکتی ہیں۔ HTML صفحات (جو زیادہ اکثر بدلتے ہیں) منٹوں یا سیکنڈوں کے لیے cache ہو سکتے ہیں۔

آپ سوچ رہے ہوں گے: CDN استعمال کرنے کے بجائے پوری ایپلیکیشن کو متعدد regions میں host کیوں نہ کریں؟ اگر ڈیٹا Oregon میں ہے، تو New York، Tokyo، اور São Paulo میں ایک مکمل کاپی کیوں نہ رکھیں؟ آپ کر سکتے ہیں۔ لیکن اس کا مطلب ہے متعدد ڈیٹابیسز کو ہم آہنگ رکھنا، regions میں بیک وقت تعیناتیوں کا انتظام، split-brain منظر ناموں کو سنبھالنا جہاں regions اختلاف کریں۔ static اور نیم-static content کے لیے CDN ایک بہت آسان جواب ہے: ایک origin، edge پر بہت سی cache شدہ کاپیاں۔ آپ multi-region پیچیدگی صرف تب شامل کرتے ہیں جب آپ کو واقعی صارف کے قریب compute یا ڈیٹابیس آپریشنز کی ضرورت ہو — زیادہ تر content کے لیے، edge caching کافی ہے۔

"رکیں — لیکن ہم *کیوں* اسے اس طرح کریں؟" Maya نے پوچھا۔ "Oregon میں صرف ایک بڑا ElastiCache cluster شامل کرنے کے بجائے cache کو edge پر کیوں رکھیں؟"

"کیونکہ physics پھر بھی مسئلہ ہے،" Priya نے کہا۔ "چاہے Oregon ایک ملی سیکنڈ میں جواب دے، اس جواب کو پھر بھی Boston تک سفر کرنا ہے۔ Round-trip وقت کم از کم 70 ملی سیکنڈ ہے — روشنی کی رفتار کو پروا نہیں کہ ہمارے servers کتنے تیز ہیں۔ Edge caching جواب کو سوال کے قریب لے آتی ہے۔"

**Dynamic Content: Caching سے زیادہ کے لیے CloudFront**

"لیکن ہمارے API responses کا کیا؟" Leo نے پوچھا۔ "وہ dynamic ہیں — وہ فی صارف، فی request بدلتے ہیں۔ آپ آرڈر کی تاریخ کا صفحہ cache نہیں کر سکتے۔"

درست۔ لیکن CloudFront پھر بھی dynamic content میں مدد کرتا ہے۔

چاہے content cache نہ ہو سکے، CloudFront درخواست کو edge location سے origin تک AWS کے private backbone نیٹ ورک کے ذریعے route کرتا ہے — وہ high-speed fiber جو AWS بنیادی ڈھانچے کو عالمی سطح پر جوڑتا ہے۔ یہ عوامی انٹرنیٹ کے ذریعے route کرنے سے تیز اور زیادہ قابل اعتماد ہے، جہاں ٹریفک متعدد carriers سے گزر سکتی ہے۔

نتیجہ: dynamic requests پھر بھی CloudFront کے ذریعے عوامی انٹرنیٹ پر براہ راست origin جانے سے 20-40% تیز ہیں۔ Caching کی وجہ سے نہیں، بلکہ نیٹ ورک path کی وجہ سے۔

"یہ سمجھ نہیں آتا،" Maya نے کہا۔ "اگر API response کو پھر بھی Oregon سے edge اور پھر Boston تک سفر کرنا ہے، تو یہ Oregon سے براہ راست Boston جانے سے کیسے تیز ہے؟"

"دو وجوہات،" Priya نے کہا۔ "پہلی، AWS کا private backbone عوامی انٹرنیٹ سے تیز اور زیادہ قابل اعتماد ہے۔ عوامی انٹرنیٹ ٹریفک متعدد carriers سے گزرتی ہے، ہر ایک اپنی latency اور تغیر پذیری شامل کرتا ہے۔ Backbone براہ راست، کم-latency fiber ہے۔ دوسری، SSL termination edge پر ہوتی ہے۔ صارف قریب ترین CloudFront edge location سے ایک TLS کنکشن قائم کرتا ہے — handshake تیز ہے۔ پھر CloudFront origin سے ایک مستقل، پہلے سے قائم کنکشن رکھتا ہے۔ ایک لمبی دوری کے کنکشن کے بجائے دو مختصر دوری کے کنکشن۔"

"تو غیر-cached content کے لیے بھی، CloudFront کنکشن کے overhead سے وقت کم کرتا ہے،" Leo نے کہا۔

"عام طور پر دس سے چالیس فیصد۔ caching جتنا ڈرامائی نہیں۔ لیکن حقیقی۔"

اس کے علاوہ، CloudFront فراہم کرتا ہے:

**SSL/TLS termination**: CloudFront edge پر HTTPS سنبھالتا ہے۔ صارف اور CloudFront کے درمیان کنکشن encrypted ہے۔ CloudFront آپ کے origin سے HTTP پر اندرونی طور پر (origin load کم کرتے ہوئے) یا HTTPS پر (end-to-end encryption کے لیے) جڑ سکتا ہے۔

**DDoS تحفظ**: CloudFront AWS Shield Standard کے ساتھ integrated ہے۔ سینکڑوں edge locations میں تقسیم شدہ ٹریفک کا مطلب ہے کہ حملے آپ کے origin کو متاثر کرنے کے بجائے edge پر absorb ہوتے ہیں۔

**Geo-restriction**: مخصوص ممالک سے رسائی block کریں۔ اگر Nimbus صرف مخصوص markets میں کام کرنے کا لائسنس رکھتا ہے، تو CloudFront اسے edge پر نافذ کر سکتا ہے بغیر اس کے کہ request کبھی آپ کے servers تک پہنچے۔

**اور کیا ہو اگر کوئی CDN کے ذریعے توڑ کر داخل ہونے کی کوشش کرے؟** Priya نے پوچھا۔ "Cache poisoning — کیا ہو اگر کوئی edge cache میں خراب content inject کرنے میں کامیاب ہو جائے؟"

"CloudFront میں cache key controls ہیں،" Leo نے کہا۔ "آپ بالکل وہ attributes طے کرتے ہیں جو طے کرتے ہیں کہ آیا دو requests کو ایک ہی cache شدہ response ملتا ہے۔ Headers، query strings، cookies۔ ایک حملہ آور عین cache key سے میل کھائے بغیر کوئی مختلف cache شدہ response inject نہیں کر سکتا۔"

"اور Origin Access Control کا مطلب ہے کہ S3 bucket کچھ بھی serve نہیں کرے گی جو CloudFront کے ذریعے نہ آئے،" Priya نے کہا۔ "دو کے بجائے ایک attack surface۔"

**CloudFront Behaviors: باریک Caching قواعد**

ایک CloudFront distribution کے متعدد **behaviors** ہو سکتے ہیں — URL patterns کی بنیاد پر routing قواعد۔

Nimbus کے لیے:

- `/images/*` → 7 دنوں کے لیے edge پر cache (تصاویر اکثر نہیں بدلتیں)
- `/static/*` → 30 دنوں کے لیے edge پر cache (versioned filenames کے ساتھ CSS اور JavaScript)
- `/api/*` → cache نہ کریں؛ براہ راست لوڈ بیلنسر کی طرف forward کریں
- `/*` → 5 منٹ کے لیے cache (HTML صفحات)

یہ CloudFront کو سمارٹ ہونے دیتا ہے: جو stable ہو اسے aggressively cache کریں، جو dynamic ہو اسے pass-through کریں۔

Behaviors سب سے مخصوص سے کم سے کم مخصوص تک میل کھاتے ہیں۔ `/images/hero.jpg` `/*` سے میل کھانے سے پہلے `/images/*` سے میل کھاتا ہے۔ نیچے catch-all `/*` ڈیفالٹ ہے — یہ ہر اس چیز پر لاگو ہوتا ہے جو کسی زیادہ مخصوص pattern سے میل نہ کھائے۔

"کیا ہو اگر ہم authenticated بمقابلہ unauthenticated صارفین کے لیے مختلف caching چاہتے ہیں؟" Priya نے پوچھا۔ "ایک ہی URL صارف کے لاگ ان ہونے یا نہ ہونے کے مطابق مختلف content واپس کر سکتا ہے۔"

"تو آپ session cookie کو cache key میں شامل کرتے ہیں،" Leo نے کہا۔ "لیکن اس کا مطلب ہے کہ ہر لاگ ان صارف کو اپنی cache entry ملتی ہے۔ authenticated content کے لیے آپ کا hit rate گر جاتا ہے۔"

"اسی لیے آپ authenticated content کو public content سے URL کی سطح پر الگ کرتے ہیں،" Priya نے کہا۔ "authentication کی ضرورت والی کوئی بھی چیز `/app/*` جاتی ہے اور cache نہیں ہوتی۔ Public content `/browse/*` جاتی ہے اور aggressively cache ہوتی ہے۔ ایک واضح حد۔"

سبق: CloudFront بہترین کام کرتا ہے جب آپ کا URL ڈھانچہ caching کے ارادے کی عکاسی کرتا ہے۔ مکمل طور پر public، static ڈیٹا کی طرف اشارہ کرنے والے URLs کو ان URLs سے مختلف نظر آنا چاہیے جو ذاتی نوعیت کا، dynamic ڈیٹا واپس کرتے ہیں۔ اگر وہ CloudFront کو ایک جیسے نظر آئیں، تو یا تو cache ٹوٹ جاتی ہے یا غلط content serve ہوتی ہے۔

Leo نے ایک ویک اینڈ میں Nimbus URL سکیم کی تشکیل نو کی۔ Browsing endpoints `/browse/` پر منتقل ہوئے۔ API endpoints `/api/` پر منتقل ہوئے۔ authenticated app UI `/app/` پر منتقل ہوا۔ تین behaviors، تین واضح caching policies، صفر ابہام۔

"یہ تھوڑا refactor ہے،" اس نے کہا۔

"یہ صحیح ڈھانچہ ہے،" Priya نے کہا۔ "آپ کو بالآخر اس کی ضرورت پڑتی۔"

**Origin Access Control: CloudFront کے ساتھ S3 محفوظ کرنا**

اگر آپ کی S3 bucket میں نجی content ہے جو صرف CloudFront کے ذریعے serve ہونی چاہیے (براہ راست نہیں)، تو آپ **Origin Access Control (OAC)** استعمال کر سکتے ہیں تاکہ یقینی بنایا جا سکے کہ S3 ان requests کو reject کرے جو CloudFront سے نہ آئیں۔

اس طرح:

- `d1234abcd.cloudfront.net/image.jpg` → Serve کیا گیا (CloudFront کو اجازت ہے)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Blocked (براہ راست S3 رسائی denied)

آپ کا content صرف آپ کی distribution کے ذریعے قابل رسائی ہے، آپ کے cache قواعد اور security settings لاگو ہوتے ہیں۔

---

**پرانی تصویر کا واقعہ**

ریستوران 112 — Eastside میں Colombian جگہ — نے ایک جمعرات کی صبح سپورٹ کو email کی۔ ایک گاہک نے شکایت کی تھی کہ ریستوران کی hero تصویر اب بھی پرانا storefront دکھا رہی تھی، حالانکہ مالک نے دو دن پہلے ایک نئی اپ لوڈ کی تھی۔

Leo نے CloudFront distribution settings کھولیں۔

`/images/*` کے لیے behavior کی TTL سات دن تھی۔ ریستوران پارٹنر پورٹل نے دو دن پہلے ایک نئی تصویر اپ لوڈ کی تھی، اسی S3 key path پر file کو بدلتے ہوئے: `restaurant-112/hero.jpg`۔ پرانی file S3 سے جا چکی تھی۔ لیکن CloudFront اسے پھر بھی ہر اس edge location سے cache سے serve کر رہا تھا جس نے اسے پچھلے سات دنوں میں لایا تھا۔

"ہم نے origin پر content بدلی،" Leo نے کہا۔ "لیکن CloudFront کو یہ معلوم نہیں۔ اس کے پاس ایک cache شدہ کاپی ہے اور یہ سات دن تک چیک نہیں کرے گا۔"

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ۔" اس نے فرض کیا تھا کہ S3 file بدلنے سے CloudFront cache خودبخود refresh ہو جائے گا۔ ایسا نہیں ہوتا۔ CloudFront کے پاس یہ پتہ لگانے کا کوئی mechanism نہیں کہ کسی S3 key پر content بدل گئی ہے — یہ بس وہی serve کرتا ہے جو اس نے cache کیا تھا جب تک کہ TTL ختم نہ ہو جائے۔

دو آپشن:

**آپشن ایک: Invalidation۔** CloudFront کو `/images/restaurant-112/hero.jpg` کے لیے ایک invalidation request بھیجیں۔ CloudFront اس path کو تمام edge locations پر پرانا نشان زد کرتا ہے۔ اس path کے لیے اگلی request S3 سے تازہ content لاتی ہے۔ لاگت: ہر مہینے پہلے 1,000 invalidation paths مفت ہیں؛ اس سے آگے، $0.005 *per path*۔ ایک file کے لیے، مفت۔ ایک bulk اپڈیٹ کے دوران ہزاروں files invalidate کرنے کے لیے، لاگتیں جمع ہو جاتی ہیں۔

**آپشن دو: Versioned file names۔** `hero.jpg` کے بجائے، file کا نام `hero-v2.jpg` رکھیں۔ ڈیٹابیس میں reference اپڈیٹ کریں۔ CloudFront کے پاس `hero-v2.jpg` کے لیے کوئی cache شدہ entry نہیں — پہلی request اسے S3 سے لاتی ہے، اور صارفین اسے فوری دیکھتے ہیں۔ پرانی `hero.jpg` cache میں رہتی ہے لیکن کہیں reference نہیں ہوتی۔ یہ سات دنوں کے بعد قدرتی طور پر ختم ہو جاتی ہے۔

"صارف کی اپ لوڈ کردہ content کے لیے،" Priya نے کہا، "versioned نام صحیح pattern ہیں۔ filename میں ایک hash یا timestamp شامل کریں۔ ہر نئی اپ لوڈ ایک نئی cache entry ہے۔ کوئی invalidation لاگت نہیں، کوئی پرانا content نہیں۔"

Leo نے پارٹنر پورٹل اپڈیٹ کیا۔ نئی اپ لوڈز اب `hero-{timestamp}.jpg` کے طور پر محفوظ ہوں گی۔ ڈیٹابیس ریکارڈ نئے path کے ساتھ اپڈیٹ کیا گیا۔ پرانا cache شدہ path غیر متعلقہ تھا۔

"تعیناتی کے کیس کا کیا؟" Maya نے پوچھا۔ "جب ہم ایپ کا ایک نیا ورژن push کرتے ہیں اور JavaScript بدلتی ہے؟"

"وہی اصول،" Priya نے کہا۔ "Webpack جیسے build tools hashed filenames آؤٹ پٹ کرتے ہیں: `app.a3b9c2d4.js`۔ ایک نیا ورژن deploy کریں اور hash بدل جاتا ہے: `app.f7e1b3c5.js`۔ CloudFront دونوں کو cache سے serve کرتا ہے — پرانے صارفین کو پرانی file ملتی ہے، نئے صارفین کو نئی۔ کوئی invalidation نہیں، کوئی ہم آہنگی کا مسئلہ نہیں۔"

"HTML صفحہ موجودہ hash کا reference دیتا ہے،" Leo نے کہا۔ "تو نئے صارفین کو نئی JS hash کے ساتھ نئی HTML ملتی ہے، اور CDN صحیح file serve کرتا ہے۔"

"معیاری عمل،" Priya نے تصدیق کی۔

---

**حقیقی نمبروں کے ساتھ Latency**

Tom تین شہروں سے latency کی پیمائش چلا رہا تھا۔

| مقام | بغیر CloudFront | CloudFront کے ساتھ | بہتری |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| New York | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tokyo | 260ms | 28ms | 89% |

"بہتری وہاں سب سے بڑی ہے جہاں physics کا مسئلہ بدترین ہے،" Tom نے مشاہدہ کیا۔ "São Paulo سے Oregon دو سو ملی سیکنڈ سے زیادہ ہے۔ یہ ایک سیکنڈ کے ایک چوتھائی سے زیادہ ہے، صرف گفتگو شروع کرنے کے لیے۔"

"اور content دوسری بار کبھی São Paulo تک نہیں پہنچتی،" Leo نے کہا۔ "São Paulo میں پہلا صارف Oregon سے لیتا ہے اور اسے مقامی طور پر cache کرتا ہے۔ اس کے بعد ہر صارف کو پینتیس ملی سیکنڈ ملتے ہیں۔"

"São Paulo میں پہلا صارف لاگت برداشت کرتا ہے،" Tom نے کہا۔ "باقی سب کو فائدہ ہوتا ہے۔"

"CDNs اسی طرح کام کرتے ہیں،" Priya نے کہا۔ "پہلی request cache بھرتی ہے۔ اس کے بعد ہر cache hit تقریباً مفت ہے۔"

عالمی پروڈکٹس کے لیے مضمرات اہم ہیں۔ CloudFront کے بغیر، Tokyo میں ایک صارف آپ کی hero تصویر کے لیے 260 ملی سیکنڈ انتظار کر رہا ہے physics کی وجہ سے — fiber optic cables اور روشنی کی رفتار۔ CloudFront کے ساتھ، آپ اس تصویر کی ایک کاپی Tokyo میں رکھتے ہیں، اور physics کا مسئلہ بنیادی طور پر غائب ہو جاتا ہے۔

---

**متعدد Origins: ALB اور S3 اکٹھے**

"ہمارے پاس S3 پر ہماری تصاویر اور لوڈ بیلنسر پر ہمارا API ہے،" Maya نے کہا۔ "کیا ہمیں دو CloudFront distributions کی ضرورت ہے؟"

"نہیں،" Leo نے کہا۔ "ایک distribution، متعدد origins۔"

ایک واحد CloudFront distribution مختلف URL patterns کو مختلف origins کی طرف route کر سکتی ہے۔ یہ multi-origin pattern ہے:

```
eatnimbus.com/*         → Origin: us-west-2 میں ALB (dynamic content)
eatnimbus.com/images/*  → Origin: S3 bucket (static images)
eatnimbus.com/static/*  → Origin: S3 bucket (CSS, JS, fonts)
```

CloudFront behaviors کو specificity کی ترتیب میں جانچتا ہے۔ `/images/hero.jpg` کی request `/images/*` behavior سے میل کھاتی ہے اور S3 جاتی ہے۔ `/api/orders` کی request `/*` catch-all سے میل کھاتی ہے اور ALB جاتی ہے۔

فائدہ: ایک domain، ایک SSL certificate، ایک CloudFront distribution، متعدد backends۔ صارفین ایک متحد domain دیکھتے ہیں۔ Routing ان کے لیے نادیدہ ہے۔

ایک آپریشنل تفصیل جو ایک یقینی امتحانی حقیقت بھی ہے: وہ SSL certificate AWS Certificate Manager (ACM) سے آتا ہے، اور **CloudFront کے استعمال کردہ ایک certificate کو `us-east-1` میں request یا import کرنا ضروری ہے** — چاہے آپ کے origins کہیں بھی رہیں۔ CloudFront ایک عالمی سروس ہے جس کا control plane us-east-1 میں رہتا ہے؛ us-west-2 میں بیٹھا ہوا certificate distribution کے dropdown میں بس ظاہر نہیں ہوگا۔ (ALB جیسی regional سروسز کے لیے، certificate ALB کے اپنے region میں رہتا ہے۔)

"اور ALB عوام کے سامنے نہیں ہے؟" Priya نے پوچھا۔

"صرف CloudFront ALB سے بات کرتا ہے،" Leo نے کہا۔ "ہم ALB کے security group کو CloudFront کی منیجڈ prefix list تک محدود کرتے ہیں۔ انٹرنیٹ سے ALB سے براہ راست کنکشن block ہیں۔"

"تو ایپلیکیشن تک پہنچنے کا واحد طریقہ CloudFront کے ذریعے ہے۔"

"جس کا مطلب ہے کہ WAF قواعد، SSL termination، اور DDoS تحفظ تمام ٹریفک پر لاگو ہوتے ہیں اس سے پہلے کہ وہ ہم تک پہنچے۔"

---

**CloudFront Functions بمقابلہ Lambda@Edge**

"کیا ہم نے سوچا ہے کہ اگر ہمیں edge پر کسی URL کو دوبارہ لکھنے کی ضرورت ہو تو ہم کیا کریں گے؟" Priya نے پوچھا۔ "یا ہر response میں ایک security header شامل کرنا؟"

"کیا ہم یہ ایپلیکیشن میں نہیں کر سکتے؟" Leo نے پوچھا۔

"ہم کر سکتے ہیں۔ لیکن اگر یہ edge پر ہو — اس سے پہلے کہ CloudFront cache سے serve کرے — تو ہم origin تک ایک round trip بچاتے ہیں۔"

CloudFront edge پر کوڈ چلانے کے لیے دو mechanisms سپورٹ کرتا ہے:

**CloudFront Functions** ہلکے JavaScript functions ہیں جو ہر edge location پر چلتے ہیں۔ وہ sub-millisecond وقت میں چلتے ہیں، فی سیکنڈ لاکھوں requests سنبھالتے ہیں، اور سادہ تبدیلیوں کے لیے ڈیزائن کیے گئے ہیں: URL rewrites، header manipulation، query string normalization، سادہ redirects۔ وہ viewer requests اور viewer responses پر چل سکتے ہیں (cache سے پہلے اور بعد، صارف کے نقطہ نظر سے)۔ وہ نیٹ ورک calls نہیں کر سکتے۔ لاگت: $0.10 فی ملین invocations۔

**Lambda@Edge** اصل Lambda functions کو CloudFront کے regional edge locations پر چلاتا ہے (ہر pop پر نہیں، بلکہ عالمی سطح پر درجنوں بڑے)۔ Lambda@Edge نیٹ ورک calls کر سکتا ہے، ڈیٹابیسز تک رسائی کر سکتا ہے، dynamic responses پیدا کر سکتا ہے، پیچیدہ authentication منطق کر سکتا ہے۔ یہ viewer requests، origin requests، origin responses، اور viewer responses پر چلتا ہے — آپ کو request کے lifecycle میں مداخلت کے چار نقاط دیتا ہے۔ لاگت: CloudFront Functions سے زیادہ، فی request اور duration کے حساب سے bill ہوتی ہے۔

ذہنی ماڈل:

| استعمال کا کیس | ٹول |
|---|---|
| `/old-path` کو `/new-path` پر دوبارہ لکھیں | CloudFront Functions |
| `Strict-Transport-Security` header شامل کریں | CloudFront Functions |
| cache lookup سے پہلے query strings normalize کریں | CloudFront Functions |
| A/B test: viewer request پر ایک test cookie تفویض کریں | CloudFront Functions |
| A/B test: 10% صارفین کو ایک مختلف origin کی طرف route کریں | Lambda@Edge (origin request — CloudFront Functions origin نہیں بدل سکتے) |
| ایک JWT token کی توثیق کریں (crypto library درکار) | Lambda@Edge |
| edge پر ڈیٹابیس سے ذاتی نوعیت کا content لائیں | Lambda@Edge |
| edge پر طلب پر ایک image thumbnail پیدا کریں | Lambda@Edge |

Nimbus کے لیے: انہوں نے ہر response میں security headers شامل کرنے کے لیے ایک CloudFront Function استعمال کیا — `Strict-Transport-Security`، `X-Content-Type-Options`، `X-Frame-Options`۔ JavaScript کی دو درجن لائنیں۔ Sub-millisecond execution۔ کوئی origin roundtrip درکار نہیں۔

"headers کو ایک junior انجینئر کو سمجھانے میں،" Leo نے کہا، "function لکھنے سے زیادہ وقت لگتا۔"

---

**Price Classes: کون سے Edge Locations منتخب کرنا**

"کیا ہم نے سوچا ہے کہ پیمانے پر اس کی کیا لاگت ہے؟" Tom نے CloudFront pricing صفحے سے گزرتے ہوئے پوچھا۔

"اس پر فی مہینہ کتنا خرچ آتا ہے؟" یہاں تکنیکی طور پر دو سوال تھے۔ پہلا: CloudFront کیا چارج کرتا ہے؟ دوسرا: کیا آپ کو دنیا میں ہر edge location کی ضرورت ہے؟

CloudFront data transfer قیمت region کے مطابق مختلف ہوتی ہے۔ شمالی امریکہ اور یورپ میں edge locations سے serve کردہ ٹریفک سب سے سستی ہے۔ South America، Asia Pacific، Australia، اور India سے ٹریفک زیادہ مہنگی ہے — کیونکہ وہاں بنیادی ڈھانچے کی لاگت زیادہ ہے۔

AWS آپ کو اپنی distribution کے لیے ایک **price class** منتخب کرنے دیتا ہے:

- **Price Class All**: تمام edge locations عالمی سطح پر استعمال کرتا ہے۔ ہر جگہ بہترین کارکردگی۔ شمالی امریکہ اور یورپ سے باہر regions کے لیے سب سے زیادہ data transfer لاگت۔
- **Price Class 200**: زیادہ تر edge locations استعمال کرتا ہے (شمالی امریکہ، یورپ، Asia، Middle East، Africa)۔ سب سے مہنگے South American اور کچھ Oceania locations کو خارج کرتا ہے۔
- **Price Class 100**: صرف شمالی امریکہ اور یورپ edge locations استعمال کرتا ہے۔ سب سے سستا۔ São Paulo، Tokyo، اور Sydney میں صارفین کو پھر بھی serve کیا جاتا ہے — لیکن ایک شمالی امریکی یا یورپی edge سے، نہ کہ ان کے قریب ترین سے۔

"تو اگر ہم Price Class 100 منتخب کریں،" Tom نے کہا، "تو São Paulo میں ایک صارف کو... Miami؟ New York؟ سے serve کیا جاتا ہے؟"

"جہاں بھی قریب ترین شامل edge ہو۔ شاید Oregon تک براہ راست 230 ملی سیکنڈ کے بجائے 50 ملی سیکنڈ،" Priya نے کہا۔ "پھر بھی ایک بامعنی بہتری۔ Price Class All جتنی اچھی نہیں۔"

"اور لاگت کا فرق؟"

"South America سے data transfer شمالی امریکہ کی تقریباً دوگنی لاگت ہے۔ ایک startup کے لیے جو ابھی ٹریفک بنا رہا ہے، Price Class 200 ایک معقول سمجھوتہ ہے — آپ کو Asia اور یورپ Price Class All سے کم لاگت پر ملتے ہیں، اور آپ کے زیادہ تر صارفین کا احاطہ ہو جاتا ہے۔"

"200 سے شروع کریں،" Tom نے کہا۔ "جب ہمارے پاس ہر region سے حقیقی ٹریفک ڈیٹا ہو، تو ہم فیصلہ کریں گے کہ کیا All قابل قدر ہے۔"

صحیح price class اس پر منحصر ہے کہ آپ کے صارفین کہاں ہیں۔ اگر آپ کے South America میں کوئی صارف نہیں، تو South American edge locations کے لیے ادائیگی خالص لاگت ہے۔ اگر آپ کی بیس فیصد آمدنی Brazil سے آتی ہے، تو Price Class All سے کارکردگی کی بہتری شاید اپنی قیمت ادا کر دیتی ہے۔

---

**Cache Key کا ڈیزائن**

"کیا ہم نے سوچا ہے کہ کیا ہوتا ہے جب دو مختلف صارفین ایک ہی URL request کریں لیکن مختلف content حاصل کریں؟" Priya نے پوچھا۔

Leo نے اس پر سوچا۔ "ذاتی نوعیت کے صفحات۔"

"یا زبان-مخصوص صفحات۔ یا mobile بمقابلہ desktop ورژن۔ یا ایسے صفحات جو cookie کے مطابق بدلتے ہیں۔"

ڈیفالٹ کے مطابق، CloudFront صرف URL path کو cache key کے طور پر استعمال کرتا ہے۔ `/browse` کی دو requests کو ایک ہی cache شدہ response ملتا ہے، چاہے صارف کی زبان کی ترجیح، device کی قسم، یا session cookie کچھ بھی ہو۔

اگر آپ کی ایپلیکیشن query strings، headers، یا cookies کی بنیاد پر مختلف content serve کرتی ہے — اور آپ چاہتے ہیں کہ CloudFront ان تغیرات کو الگ الگ cache کرے — تو آپ کو ان attributes کو **cache key** میں شامل کرنا ہوگا۔

Nimbus کے لیے:

- `/browse?city=miami` کو `/browse?city=boston` سے الگ cache ہونا چاہیے — مختلف ریستوران کی فہرستیں۔ query strings کو cache key میں شامل کریں۔
- Mobile صارفین کو ایک مختلف layout مل سکتا ہے۔ ایک normalized device قسم (جو `User-Agent` header سے اخذ کی گئی ہو) cache key میں شامل کریں۔
- `Accept-Language` header طے کرتا ہے کہ صفحہ کس زبان میں render ہوتا ہے۔ اسے cache key میں شامل کریں۔

محتاط رہیں، البتہ۔ آپ جو ہر cache key attribute شامل کرتے ہیں وہ زیادہ cache تغیرات پیدا کرتا ہے۔ اگر آپ پورا `User-Agent` string شامل کرتے ہیں (جو browser ورژن، OS ورژن، اور patch level کے مطابق بدلتا ہے)، تو آپ مؤثر طور پر caching توڑ دیتے ہیں — ہر صارف کا User-Agent تھوڑا مختلف ہے، لہٰذا ہر request ایک cache miss ہے۔

نظم و ضبط: caching سے پہلے normalize کریں۔ "iPhone 15 Pro Safari 17.4.1" کو "mobile" تک کم کریں۔ تمام قبول شدہ زبانوں کو ان دو یا تین تک کم کریں جنہیں آپ دراصل سپورٹ کرتے ہیں۔ صرف وہی شامل کریں جو واقعی response بدلے۔

"آپ کا cache key جتنا زیادہ مخصوص ہوگا،" Leo نے کہا، "آپ کا hit rate اتنا ہی بدتر۔"

"اور جتنا زیادہ عام،" Priya نے کہا، "اتنا ہی زیادہ امکان کہ آپ غلط content کو غلط صارف کو serve کریں۔"

"تو cache key کا ڈیزائن caching میں ہر چیز جیسا ہی ٹریڈ آف ہے۔"

"ہاں،" Priya نے کہا۔ "یہ ہمیشہ وہی ٹریڈ آف ہے۔"

---

## جب CloudFront جواب نہیں: Global Accelerator

Nimbus mobile ایپ میں ایک خصوصیت تھی جسے Tom دو ماہ سے خاموشی سے دیکھ رہا تھا: real-time آرڈر سٹیٹس۔ جب کوئی گاہک آرڈر دیتا، تو ایپ WebSocket کے ذریعے جڑی رہتی اور باورچی خانے کی آرڈر management اسکرین real time میں اپڈیٹ ہوتی۔ کوئی refresh بٹن نہیں۔ کوئی polling نہیں۔ ایک live کنکشن جو اس لمحے اپڈیٹس push کرتا جب باورچی خانہ کسی آئٹم کو تیار نشان زد کرتا۔

"یہ WebSockets استعمال کر رہا ہے،" Tom نے ایک صبح latency metrics دیکھتے ہوئے کہا۔ "São Paulo میں صارفین سے، کنکشن قائم کرنے میں 340 ملی سیکنڈ لگ رہے ہیں۔ کچھ گڑبڑ ہے۔"

"CloudFront WebSocket کنکشنز cache نہیں کرتا،" Leo نے کہا۔ "یہ انہیں proxy کرتا ہے — origin تک pass کرتا ہے۔ کوئی caching فائدہ نہیں۔"

"درست۔ تو یہ پھر بھی سست کیوں ہے؟"

"کیونکہ WebSocket پھر بھی São Paulo سے ہمارے Oregon میں servers تک عوامی انٹرنیٹ پر سفر کر رہا ہے،" Leo نے کہا۔ "CloudFront مدد کرتا ہے، کیونکہ یہ TLS handshake کو edge پر terminate کرتا ہے اور پھر origin تک AWS کا backbone استعمال کرتا ہے۔ لیکن ایک مستقل WebSocket کنکشن کے لیے، یہ پھر بھی ایک لمبی دوری کا کنکشن ہے۔"

"بالکل اسی مسئلے کے لیے ایک سروس ہے،" Priya نے کہا۔

**AWS Global Accelerator** ایک CDN نہیں ہے۔ یہ کچھ بھی cache نہیں کرتا۔ یہ edge locations سے content serve نہیں کرتا۔ یہ جو کرتا ہے وہ آپ کو دو static Anycast IP پتے دیتا ہے جو تمام AWS edge locations سے بیک وقت عالمی سطح پر مشتہر ہوتے ہیں — اور پھر آپ کے صارفین کی ٹریفک کو عوامی انٹرنیٹ کے بجائے AWS کے private backbone پر route کرتا ہے۔

جب São Paulo میں ایک گاہک Nimbus ایپ کھولتا ہے، تو ان کا device قریب ترین AWS edge location سے جڑتا ہے (جو خود São Paulo میں ہو سکتا ہے)۔ اس edge location سے، ٹریفک Nimbus کے Oregon میں servers تک AWS کے private، نگرانی شدہ، optimized fiber نیٹ ورک پر سفر کرتی ہے — عوامی انٹرنیٹ پر نہیں جہاں packets غیر متوقع carriers اور routing hops سے گزرتے ہیں۔

عوامی انٹرنیٹ latency کے لیے ڈیزائن نہیں کیا گیا۔ یہ لچک کے لیے ڈیزائن کیا گیا ہے — packets کوئی بھی دستیاب راستہ لے سکتے ہیں۔ AWS کا backbone مختلف طریقے سے ڈیزائن کیا گیا ہے: یہ براہ راست، کم-بھیڑ والا، اور AWS کے آپریشنل کنٹرول میں ہے۔

Tom نے فرق کا benchmark کیا۔

| راستہ | Latency (São Paulo سے Oregon) |
|---|---|
| عوامی انٹرنیٹ | 340ms |
| Global Accelerator کے ذریعے | 180ms |

47% کمی۔ caching سے نہیں — ایک بہتر نیٹ ورک path سے۔

"تو ہم ہر چیز کے لیے صرف CloudFront کیوں نہ استعمال کریں؟" Maya نے پوچھا۔ "CloudFront پہلے سے dynamic content کے لیے AWS کے backbone کے ذریعے route کرتا ہے۔"

"CloudFront صرف HTTP اور HTTPS ہے،" Priya نے کہا۔ "WebSockets CloudFront کے ساتھ کام کرتے ہیں، لیکن صرف HTTP upgrade کے ذریعے۔ اور ہمارے کچھ protocols — مثلاً IoT sensor ڈیٹا — خالص TCP یا UDP ہیں۔ CloudFront ان کو نہیں سنبھالتا۔ Global Accelerator protocol-agnostic ہے۔ TCP، UDP، WebSockets، جو بھی ہو۔ یہ packets منتقل کرتا ہے، HTTP requests نہیں۔"

ایک اور فرق تھا جو Priya نے اپنی security دستاویزات میں نوٹ کیا۔

"Global Accelerator ہمیں دو static Anycast IPs دیتا ہے،" اس نے کہا۔ "وہ IPs کبھی نہیں بدلتے۔ اس کا مطلب ہے کہ ہم انہیں اپنی security policy میں شامل کر سکتے ہیں، partner whitelists میں شامل کر سکتے ہیں، firewall قواعد میں شامل کر سکتے ہیں۔ CloudFront کے IP پتے وقت کے ساتھ بدلتے ہیں — وہ AWS کے ذریعے منظم ہوتے ہیں اور مقرر نہیں ہیں۔"

"Failover کا کیا؟" Leo نے پوچھا۔

"فوری،" Priya نے کہا۔ "اگر ہماری us-west-2 ایپلیکیشن میں کوئی مسئلہ ہو، تو Global Accelerator 30 سیکنڈ سے کم میں ٹریفک کو us-east-1 میں ایک backup پر منتقل کر سکتا ہے — اس IP پتے کو بدلے بغیر جس سے صارفین جڑ رہے ہیں۔ Route 53 کے ذریعے DNS failover TTL کے مطابق 60-300 سیکنڈ لیتا ہے۔ Global Accelerator تیز تر ہے۔"

**CloudFront بمقابلہ Global Accelerator — ذہنی ماڈل:**

CloudFront caching کے ذریعے delivery بہتر کرتا ہے۔ یہ HTTP/HTTPS کے لیے بنایا گیا ہے اور فائدہ سب سے بڑا ہوتا ہے جب content کو صارفین کے قریب cache کیا جا سکے — static files، تصاویر، JavaScript۔ جب content cache نہ ہو سکے، تو CloudFront پھر بھی backbone routing کے ذریعے مدد کرتا ہے، لیکن بہتری چھوٹی ہوتی ہے۔

Global Accelerator routing کے ذریعے delivery بہتر کرتا ہے۔ یہ کوئی content منتقل نہیں کرتا۔ یہ کچھ بھی cache نہیں کرتا۔ فائدہ ہر packet پر لاگو ہوتا ہے — cached ہو یا نہ ہو، HTTP ہو یا نہ ہو، static ہو یا dynamic۔ دو static IPs عالمی سطح پر کام کرتے ہیں۔ Failover تقریباً فوری ہے۔ وہ استعمال کے کیسز جہاں CloudFront کافی نہیں — real-time WebSockets، UDP پر مبنی protocols، غیر-HTTP ٹریفک، مقرر IPs کا تقاضا کرنے والی عالمی ایپلیکیشنز — وہیں Global Accelerator صحیح ٹول ہے۔

Tom نے real-time آرڈر سٹیٹس خصوصیت کے لیے Nimbus mobile ایپ کو Global Accelerator endpoint سے جڑنے کے لیے اپڈیٹ کیا۔ São Paulo میں WebSocket کنکشن قائم کرنا 340ms سے گر کر 180ms ہو گیا۔ باورچی خانے کی اپڈیٹس پھر بھی فوری محسوس ہوئیں — کیونکہ اب، شمالی امریکہ سے باہر صارفین کے لیے، وہ دراصل تھیں۔

## خوبیاں اور حدود

**CloudFront کیوں طاقتور ہے**:

- 100+ شہروں میں 750 سے زیادہ points of presence — زیادہ تر صارفین کو content <20ms دور سے ملتا ہے
- پہلے cache کے بعد static content single-digit milliseconds میں serve ہوتی ہے
- Origin load کو نمایاں طور پر کم کرتا ہے (repeat ٹریفک کبھی آپ کے servers تک نہیں پہنچتی)
- AWS Shield، WAF، اور Certificate Manager کے ساتھ Integrated
- کوئی capacity planning درکار نہیں — CloudFront خودبخود scale کرتا ہے
- Multi-origin distributions ایک domain سے مختلف paths کو مختلف backends کی طرف route کرتی ہیں
- CloudFront Functions sub-millisecond latency پر ہلکی edge منطق سنبھالتے ہیں

**جہاں پیچیدہ ہو جاتا ہے**:

- Cached content پرانی ہو سکتی ہے — cache invalidate کرنے کی لاگت ہے (ہر مہینے پہلے 1,000 مفت paths کے بعد $0.005 فی path)۔ اس کے بجائے versioned filenames استعمال کریں۔
- Cache-Control headers origin پر صحیح طریقے سے سیٹ ہونے چاہئیں — غلطیاں پرانی content پیدا کرتی ہیں
- Dynamic content routing optimization سے فائدہ اٹھاتی ہے لیکن caching سے نہیں
- Cache کے رویے کو debug کرنا (کیا cache ہے، کہاں، کتنی دیر) کے لیے متعدد layers سمجھنا ضروری ہے: origin headers، CloudFront TTL settings، behavior قواعد
- CloudFront کے ذریعے data transfer out کی لاگت ہے، اگرچہ معیاری data transfer سے کم
- Cache key کے ڈیزائن کو محتاط سوچ کی ضرورت ہے — بہت مخصوص caching توڑ دیتا ہے، بہت عام غلط content serve کرتا ہے

## خلاصہ

CloudFront نے physics نہیں بدلی۔ روشنی اب بھی اسی رفتار سے سفر کرتی ہے۔ لیکن اس نے بدل دیا کہ جواب کہاں رہتا ہے — اور زیادہ تر صارفین کے لیے، جواب اب چند سو ملی سیکنڈ کے بجائے چند ملی سیکنڈ دور تھا۔ تعیناتی کے بعد cache hit rate: 83%۔ اس کا مطلب تھا کہ ہر ملین requests میں سے 830,000 سرے سے origin servers تک کبھی نہیں پہنچیں۔ São Paulo میں صارفین 290 ملی سیکنڈ سے 35 ملی سیکنڈ پر گئے۔ Tokyo میں صارفین 260 سے 28 پر۔

- ایک **CDN** آپ کے content کی کاپیاں آپ کے صارفین کے قریب edge locations پر cache کرتا ہے — latency اور origin load کم کرتا ہے۔
- **CloudFront** AWS کا CDN ہے، 750+ points of presence عالمی سطح پر۔
- Cache misses **origin** (S3، ALB، EC2) سے لیتی ہیں۔ Cache hits edge سے serve ہوتی ہیں — ملی سیکنڈ، سینکڑوں ملی سیکنڈ نہیں۔
- **Behaviors** آپ کو مختلف URL patterns کے لیے مختلف caching قواعد سیٹ کرنے دیتے ہیں۔ ایک distribution `/images/*` کو S3 سے اور `/*` کو ALB سے serve کر سکتی ہے۔
- Dynamic content cache نہیں ہوتی، لیکن CloudFront پھر بھی AWS کے private backbone نیٹ ورک کے ذریعے کارکردگی بہتر کرتا ہے۔
- invalidations کے بجائے versioned filenames (مثلاً `hero-v2.jpg`) استعمال کر کے **پرانی content سے بچیں** — سستا اور زیادہ قابل اعتماد۔
- **CloudFront Functions** ہلکی edge منطق (header manipulation، URL rewrites) sub-millisecond رفتار پر سنبھالتے ہیں۔ **Lambda@Edge** بھاری processing سنبھالتا ہے جسے نیٹ ورک calls درکار ہوں۔
- **Price classes** آپ کو کنٹرول کرنے دیتے ہیں کہ کون سے edge locations آپ کی ٹریفک serve کریں — اور اس لیے آپ کی data transfer لاگت۔
- **Cache key کا ڈیزائن** طے کرتا ہے کہ کون سی request attributes الگ cache شدہ تغیرات پیدا کرتی ہیں۔ زیادہ مخصوص keys = کم hit rate۔ کم مخصوص = غلط content serve کرنے کا خطرہ۔

## امتحانی نکات

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں (ڈومین ۳، ٹاسک ۳.۴)*

- **CloudFront + S3**: عالمی سطح پر static websites serve کرنے کے لیے کلاسک امتحانی pattern۔ S3 bucket بطور origin، CloudFront بطور CDN، براہ راست S3 رسائی روکنے کے لیے Origin Access Control۔
- **Edge locations بمقابلہ Regions بمقابلہ AZs**: Edge locations زیادہ تعداد میں ہیں اور صرف caching/CDN مقاصد کے لیے موجود ہیں۔ وہ AZs جیسی نہیں ہیں (جو آپ کا compute چلاتی ہیں)۔
- **Cache invalidation**: CloudFront کو تازہ content لینے پر مجبور کرنے کے لیے ایک `/images/*` invalidation بناتا ہے۔ لاگت ہے — امتحان cost-effective متبادل پوچھ سکتا ہے: versioned URLs (`image-v2.jpg` بجائے `image.jpg`)، جو قدرتی طور پر cache کو bypass کرتے ہیں۔
- **TTL control**: `Cache-Control: max-age=3600` origin پر 1 گھنٹے کی cache TTL سیٹ کرتا ہے۔ CloudFront ان headers کا احترام کرتا ہے۔ Minimum TTL، maximum TTL، اور default TTL distribution behavior میں بھی سیٹ کیے جا سکتے ہیں۔
- **CloudFront Functions بمقابلہ Lambda@Edge**: CloudFront Functions ہلکی request/response manipulation کے لیے edge پر چلتے ہیں (sub-millisecond)۔ Lambda@Edge بھاری processing کے لیے regional edge locations پر آپ کا Lambda code چلاتا ہے۔ امتحان انہیں use case complexity کے ذریعے distinguish کرتا ہے۔ CloudFront Functions نیٹ ورک calls نہیں کر سکتے؛ Lambda@Edge کر سکتا ہے۔
- **Signed URLs اور Signed Cookies**: CloudFront کے ذریعے content تک کون رسائی کر سکتا ہے کنٹرول کریں۔ Signed URLs مخصوص files تک رسائی دیتے ہیں؛ signed cookies متعدد files تک رسائی دیتے ہیں۔ امتحان انہیں "paid subscriber content" کے لیے استعمال کرتا ہے۔
- **Price Class**: امتحان پوچھ سکتا ہے کہ عالمی سامعین بمقابلہ شمالی امریکہ/یورپ سامعین کے لیے کون سی price class منتخب کرنی ہے۔ Price Class All = بہترین کارکردگی، سب سے زیادہ لاگت۔ Price Class 100 = صرف شمالی امریکہ اور یورپ، سب سے کم لاگت۔
- **Cache key**: ڈیفالٹ cache key URL ہے۔ query strings، headers، یا cookies کو cache key میں شامل کرنا الگ cache شدہ تغیرات پیدا کرتا ہے — لیکن cache miss rate بڑھاتا ہے۔ امتحان ایک منظر نامہ پیش کر سکتا ہے جہاں content ایک query parameter کے مطابق بدلتی ہے اور caching کیسے ترتیب دینا ہے پوچھے۔
- **Origin failover**: CloudFront ایک primary اور secondary origin کے ساتھ ایک origin group سپورٹ کرتا ہے۔ اگر primary origin ایک 5xx error واپس کرے، تو CloudFront خودبخود secondary کے ساتھ دوبارہ کوشش کرتا ہے۔ Route 53 failover سے مختلف — یہ ایک واحد CloudFront distribution کے اندر ہے۔
- **Multi-origin behaviors**: ایک واحد distribution `/images/*` کو S3 اور `/*` کو ALB کی طرف route کر سکتی ہے۔ امتحان اسے اس طرح پیش کر سکتا ہے کہ "دو distributions کے بغیر ایک domain سے static اور dynamic content کیسے serve کریں۔"
- **CloudFront بمقابلہ Global Accelerator:** CloudFront = HTTP/HTTPS CDN، edge locations پر content cache کرتا ہے، origin load کم کرتا ہے، static اور cacheable content کے لیے بہترین۔ Global Accelerator = کوئی بھی TCP/UDP protocol، کچھ بھی cache نہیں کرتا، AWS کے private backbone پر ٹریفک route کرتا ہے، 2 static Anycast IPs فراہم کرتا ہے، تقریباً فوری regional failover سپورٹ کرتا ہے۔ امتحانی trigger: "غیر-HTTP ٹریفک کے لیے latency بہتر کریں" یا "عالمی ایپلیکیشن کے لیے static IP" یا "عالمی صارفین کے لیے WebSocket کارکردگی" یا "DNS سے تیز regional failover" → Global Accelerator۔ "static files عالمی سطح پر کم latency کے ساتھ serve کریں" → CloudFront۔

## مشقیں

**مشق ۱ — یادداشت**

CloudFront cache hit اور cache miss کے درمیان فرق بیان کریں۔ ہر صورت میں کیا ہوتا ہے؟

*(اشارہ: content کہاں سے آتی ہے، اور دونوں cases میں response time کیسے مختلف ہے، اس کے بارے میں سوچیں۔)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک software کمپنی ایک S3 bucket سے دنیا بھر کے صارفین کو بڑی installer files (~2GB ہر ایک) distribute کرتی ہے۔ Asia میں صارفین کے لیے download speeds سست ہیں۔ ٹیم S3 bucket کو متعدد regions میں replicate کیے بغیر کارکردگی بہتر کرنا چاہتی ہے۔ انہیں یہ بھی یقینی بنانا ہے کہ صرف ادائیگی کرنے والے صارفین installers download کر سکیں۔

کون سا حل ان ضروریات کو بہترین طریقے سے پورا کرتا ہے؟

A) Bucket پر S3 Transfer Acceleration فعال کریں اور ادائیگی کرنے والے صارفین کے لیے pre-signed URLs بنائیں  
B) S3 bucket کو origin کے ساتھ CloudFront استعمال کریں، Origin Access Control فعال کریں، اور ادائیگی کرنے والے صارفین کے لیے CloudFront Signed URLs استعمال کریں  
C) ہر AWS region میں ایک S3 bucket بنائیں اور صارفین کو قریب ترین bucket کی طرف direct کرنے کے لیے Route 53 geolocation routing استعمال کریں  
D) ہر region میں EC2 انسٹینسز کے ساتھ ایک Application Load Balancer استعمال کریں جو installer files serve کریں

**اشارہ ۱**: ضرورت bucket replicate کیے *بغیر* عالمی کارکردگی بہتر کرنا ہے۔ کون سا آپشن متعدد buckets نہیں چاہتا؟

**اشارہ ۲**: CloudFront کے ذریعے serve کردہ content تک کون رسائی کر سکتا ہے، اسے کون سی سروس خاص طور پر کنٹرول کرتی ہے؟

**اشارہ ۳**: S3 Transfer Acceleration لمبی دوری پر S3 *کو* uploads کے لیے optimize ہے۔ S3 *سے* عالمی صارفین کو content deliver کرنے کے لیے، CloudFront درست ٹول ہے۔

**جواب**: B

**وضاحت**: CloudFront پہلے download کے بعد installer files کو edge locations پر عالمی سطح پر cache کرتا ہے۔ ایک ہی region سے بعد کے downloads edge سے آتے ہیں — us-west-2 میں S3 سے Pacific عبور کرنے سے بہت تیز۔ Origin Access Control یقینی بناتا ہے کہ S3 bucket صرف CloudFront کے ذریعے قابل رسائی ہو۔ Signed URLs رسائی کو ادائیگی کرنے والے صارفین تک محدود کرتے ہیں۔

**A کیوں نہیں؟** S3 Transfer Acceleration لمبی دوری پر S3 *میں* uploads کے لیے optimize ہے — S3 *سے* عالمی سامعین تک content distribute کرنے کے لیے نہیں۔ اس کے لیے CloudFront درست ٹول ہے۔ Pre-signed URLs رسائی کنٹرول کرتے ہیں لیکن عالمی کارکردگی بہتر نہیں کرتے۔

**C کیوں نہیں؟** فی region S3 bucket بنانا کارکردگی کے لیے کام کرتا ہے، لیکن یہ replication سے بچنے کی ضرورت کے خلاف ہے۔ اس کے لیے buckets میں ایک data synchronization حکمت عملی بھی درکار ہے۔

**D کیوں نہیں؟** ہر region میں لوڈ بیلنسر کے پیچھے EC2 انسٹینسز CloudFront سے نمایاں طور پر زیادہ مہنگی ہیں اور متعدد regions میں servers manage کرنے کی ضرورت ہے۔

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۳.۴*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus ویڈیو content شامل کرنا چاہتا ہے — ریستوران partners کے مختصر cooking tutorial videos۔ Videos 50-500MB ہو سکتی ہیں۔ وہ توقع کرتے ہیں کہ publishing کے چند گھنٹوں کے اندر ایک ہی شہر میں ہزاروں صارفین ایک ہی video دیکھیں گے۔

Storage اور delivery architecture ڈیزائن کریں۔ کیا آپ S3 اور CloudFront استعمال کریں گے؟ آپ پہلی request (cold start) کو کیسے سنبھالیں گے تاکہ video cache ہونے سے پہلے تاخیر کم سے کم ہو؟ ایسی video کے لیے آپ کون سی cache TTL سیٹ کریں گے جو publishing کے بعد نہیں بدلے گی؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد CDN ڈیزائن کے فیصلوں کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ۔" Leo نے CloudFront distribution کو غلط origin کی طرف اشارہ کر دیا تھا — پروڈکشن کے بجائے ڈیولپمنٹ S3 bucket۔ تقریباً چار منٹ کے لیے، کچھ West Coast صارفین نے ایپ کا ایک پرانا ورژن دیکھا تھا۔ اس نے origin settings ٹھیک کیں، cache invalidate کی، اور خاموشی سے incident log اپڈیٹ کر دیا۔

Priya نے تعیناتی کے بعد CloudFront metrics دیکھے۔

Cache hit rate: 83%۔

"اس کا کیا مطلب ہے؟" Tom نے پوچھا۔

"اس کا مطلب ہے ہمارے 83% صارفین انہیں قریب ایک edge location سے content وصول کر رہے ہیں، us-west-2 سے نہیں۔"

"اور باقی 17%؟"

"پہلی بار requests۔ Content جو ابھی تک اس edge location پر cache نہیں ہوئی۔"

Tom نے metrics کو گھورا۔ "تو ہم فی دن تقریباً دس لاکھ requests CloudFront edge nodes سے serve کر رہے ہیں۔ اور صرف 170,000 اصل میں ہمارے servers تک پہنچتی ہیں۔"

"ہاں۔"

"تو اگر ہمارے پاس CloudFront نہ ہوتا، تو ہمارے servers دس لاکھ requests سنبھال رہے ہوتے۔"

"عالمی صارفین کے لیے 140-160 ملی سیکنڈ ہر ایک پر۔"

Tom پیچھے جھک گیا۔ اس کے چہرے پر وہ نظر تھی جسے Maya پہچانتی تھی — کسی ایسے شخص کی نظر جو ریئل ٹائم میں لاگت کا دوبارہ حساب لگا رہا ہو۔

"یہ اس کی قیمت ہے،" اس نے کہا۔

Maya پہلے سے اپنے لیپ ٹاپ پر تھی۔ "دو نئے انجینئرز اگلے ہفتے ہم سے ملتے ہیں۔ Soo-Jin، اپنی پچھلی کمپنی میں platform team سے، اور Rafael — اس نے security میں specialization کی۔ میں چاہتی ہوں کہ وہ اپنے پہلے دن سے پہلے IAM پر onboard ہوں۔"

"IAM advanced؟" Leo نے پوچھا۔

"Roles، policies، cross-account رسائی۔ اصل چیزیں۔"

اگلے باب میں: وہ باریک اجازتیں جو نظام کے ایک حصے کو دوسرے سے بات کرنے دیتی ہیں — محفوظ طریقے سے۔
