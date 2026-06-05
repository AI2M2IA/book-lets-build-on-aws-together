# باب ۱۳: ہر جگہ تیز

Virginia میں ایک سرور سے Seattle میں ایک فون تک سفر کرنے والی تصویر تقریباً 4,400 کلومیٹر کی fiber optic cable طے کرتی ہے۔ روشنی کی دو تہائی رفتار سے، یہ خالص physics کے تقریباً 25 ملی سیکنڈ ہیں — ناگزیر، غیر قابل مذاکرات، کائنات کے قوانین میں بنے ہوئے۔

پھر round trip شامل کریں۔ پھر processing time شامل کریں۔ براؤزر نے ابھی rendering شروع نہیں کی اور 80 ملی سیکنڈ پہلے ہی گزر چکے ہیں۔

`eatnimbus.com` live تھا۔ Leo نے مغربی ساحل کے صارفین سے latency metrics چیک کی تھیں: فی درخواست 80-100 ملی سیکنڈ۔ یہ چھوٹا لگ سکتا ہے، لیکن یہ جمع ہو جاتا ہے۔

مینو لوڈ کریں: 90ms۔ ریستوران کی فہرست لوڈ کریں: 80ms۔ ریستوران کی تصاویر لوڈ کریں: 200ms (تصاویر بڑی ہوتی ہیں)۔ کل وقت قبل از اس کے کہ صارف آرڈر دے سکے: اچھے کنکشن پر آدھا سیکنڈ سے زیادہ۔

"Physics مسئلہ ہے،" Leo نے کہا۔ "Servers Virginia میں ہیں۔ صارفین مغربی ساحل پر ہیں۔"

"تو servers کو مغربی ساحل منتقل کریں،" Tom نے کہا۔

"اس کی لاگت ہے۔"

"کتنی؟"

"بہت زیادہ۔ اور یہ ایک نیا مسئلہ پیدا کرتا ہے: مشرقی ساحل ڈیٹابیس اور مغربی ساحل ڈیٹابیس کو ہم آہنگ رکھنا۔"

Priya نے اپنے لیپ ٹاپ سے نگاہ اٹھائی۔ "یا ہم servers کو منتقل نہیں کرتے۔ ہم *content* منتقل کرتے ہیں۔"

**پہلے سے بھرا گودام کی مثال**

Amazon retailer کا تصور کریں، cloud کمپنی نہیں۔ ان کے پاس ہر پروڈکٹ کے ساتھ ایک جگہ پر ایک بڑا گودام ہے۔ اگر وہ ہر آرڈر اس ایک گودام سے ship کرتے، دور کے شہروں کے صارفین دنوں انتظار کرتے۔

اس کے بجائے، Amazon کے پاس بڑے آبادی والے مراکز کے قریب fulfillment centers ہیں۔ جب کوئی product مشہور ہو، وہ ان مقامی گوداموں میں pre-stock کر دیتے ہیں۔ جب Seattle کا صارف کتاب order کرتا ہے، وہ مقامی fulfillment center سے ship ہوتی ہے — Virginia سے نہیں۔

یہ **Content Delivery Network (CDN)** ہے: جغرافیائی طور پر تقسیم شدہ servers کا نیٹ ورک جو آپ کے content کی کاپیاں آپ کے صارفین کے قریب cache کرتا ہے۔

جب Seattle کا صارف آپ کا homepage request کرتا ہے، CDN اسے Seattle میں ایک server سے serve کرتا ہے۔ Virginia سے نہیں۔ درخواست کبھی ملک نہیں عبور کرتی۔

**CloudFront سے ملیں**

Amazon CloudFront AWS کا CDN ہے۔ یہ دنیا بھر کے شہروں میں **edge locations** — caching servers — کے عالمی نیٹ ورک کے ذریعے کام کرتا ہے۔ اس تحریر کے وقت، 90+ شہروں میں 500 سے زیادہ edge locations ہیں۔

جب آپ CloudFront ترتیب دیتے ہیں، آپ ایک **origin** بتاتے ہیں: آپ کے اصل content کا ذریعہ۔ آپ کا origin یہ ہو سکتا ہے:

- ایک S3 bucket (static files: تصاویر، CSS، JavaScript، PDFs)
- ایک Application Load Balancer (آپ کی ایپلیکیشن سے dynamic content)
- ایک EC2 انسٹینس
- انٹرنیٹ پر کہیں بھی ایک HTTP server

CloudFront آپ کے origin کے سامنے بیٹھتا ہے۔ Requests قریب ترین edge location پر آتی ہیں۔ اگر edge کے پاس content cache ہے، وہ فوری طور پر واپس کرتا ہے۔ اگر نہیں (*cache miss*)، یہ آپ کے origin سے لیتا ہے، cache کرتا ہے، اور واپس کرتا ہے۔

**CloudFront Caching کیسے کام کرتی ہے**

کسی بھی content کے لیے پہلی request ہمیشہ cache miss ہوتی ہے — یہ origin جاتی ہے۔ ہر بعد کی request edge location کے cache سے ٹکراتی ہے۔

Nimbus کے لیے، مینو تصاویر CloudFront کے لیے بالکل موزوں امیدوار ہیں۔ ریستوران کی تصاویر کم ہی بدلتی ہیں (شاید جب ریستوران اپنا profile اپڈیٹ کرے)۔ CloudFront کے ساتھ:

1. Seattle کا صارف `images.eatnimbus.com/restaurant-047/photo.jpg` request کرتا ہے
2. CloudFront Seattle کے edge location کو چیک کرتا ہے — ابھی تک cache نہیں ہوئی (cache miss)
3. CloudFront us-east-1 میں S3 سے لیتا ہے (~80ms)
4. CloudFront تصویر Seattle edge location میں محفوظ کرتا ہے
5. اگلا Seattle کا صارف وہی تصویر request کرتا ہے
6. CloudFront مقامی edge cache سے serve کرتا ہے (~5ms)

پہلی request کے لیے وہی 80ms پنالٹی۔ لیکن ایک ہی شہر سے ہزارویں request 5 ملی سیکنڈ ہے۔

**Cache-Control headers** اور CloudFront میں **TTL settings** طے کرتے ہیں کہ content edge پر کتنی دیر cached رہتی ہے۔ Image files کئی گھنٹوں یا دنوں تک cache ہو سکتی ہیں۔ HTML صفحات (جو زیادہ اکثر بدلتے ہیں) منٹوں یا سیکنڈوں کے لیے cache ہو سکتے ہیں۔

**Dynamic Content: Caching سے زیادہ CloudFront**

"لیکن ہمارے API responses کا کیا؟" Leo نے پوچھا۔ "وہ dynamic ہیں — وہ فی صارف، فی request بدلتے ہیں۔ آپ آرڈر کی تاریخ کا صفحہ cache نہیں کر سکتے۔"

درست۔ لیکن CloudFront dynamic content میں بھی مدد کرتا ہے۔

چاہے content cache نہ ہو، CloudFront درخواست کو edge location سے origin تک AWS کے private backbone نیٹ ورک کے ذریعے route کرتا ہے — AWS کا عالمی سطح پر infrastructure کو جوڑنے والا high-speed fiber۔ یہ عوامی انٹرنیٹ کے ذریعے route کرنے سے تیز اور زیادہ قابل اعتماد ہے۔

نتیجہ: dynamic requests اب بھی عوامی انٹرنیٹ کے ذریعے براہ راست origin جانے سے 20-40% تیز ہیں CloudFront کے ذریعے۔ Caching کی وجہ سے نہیں، بلکہ نیٹ ورک path کی وجہ سے۔

اس کے علاوہ، CloudFront فراہم کرتا ہے:

**SSL/TLS termination**: CloudFront edge پر HTTPS سنبھالتا ہے۔ صارف اور CloudFront کے درمیان کنکشن encrypted ہے۔ CloudFront آپ کے origin سے HTTP پر (origin load کم کرنے کے لیے) یا HTTPS (end-to-end encryption کے لیے) پر جڑ سکتا ہے۔

**DDoS تحفظ**: CloudFront AWS Shield Standard کے ساتھ integrated ہے۔ سینکڑوں edge locations میں تقسیم شدہ ٹریفک کا مطلب ہے حملے edge پر absorb ہوتے ہیں بجائے آپ کے origin کو متاثر کرنے کے۔

**Geo-restriction**: مخصوص ممالک سے رسائی block کریں۔ اگر Nimbus صرف مخصوص markets میں کام کرنے کا لائسنس رکھتا ہے، CloudFront اسے edge پر نافذ کر سکتا ہے بغیر request کبھی آپ کے servers تک پہنچے۔

**CloudFront Behaviors: باریک Caching قواعد**

ایک CloudFront distribution کے متعدد **behaviors** ہو سکتے ہیں — URL patterns کی بنیاد پر routing قواعد۔

Nimbus کے لیے:

- `/images/*` → 7 دنوں کے لیے edge پر cache (تصاویر اکثر نہیں بدلتیں)
- `/static/*` → 30 دنوں کے لیے edge پر cache (versioned filenames کے ساتھ CSS اور JavaScript)
- `/api/*` → cache نہ کریں؛ براہ راست لوڈ بیلنسر کی طرف forward کریں
- `/*` → 5 منٹ کے لیے cache (HTML صفحات)

یہ CloudFront کو سمارٹ ہونے دیتا ہے: جو stable ہو اسے aggressively cache کریں، جو dynamic ہو اسے pass-through کریں۔

**Origin Access Control: CloudFront کے ساتھ S3 محفوظ کرنا**

اگر آپ کی S3 bucket میں نجی content ہے جو صرف CloudFront کے ذریعے serve ہونی چاہیے (براہ راست نہیں)، تو آپ **Origin Access Control (OAC)** استعمال کر سکتے ہیں تاکہ یقینی بنایا جا سکے کہ S3 ان requests کو reject کرے جو CloudFront سے نہ آئیں۔

اس طرح:

- `d1234abcd.cloudfront.net/image.jpg` Serve کیا گیا (CloudFront کو اجازت ہے)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Blocked (براہ راست S3 رسائی denied)

آپ کا content صرف آپ کی distribution کے ذریعے قابل رسائی ہے، آپ کے cache قواعد اور security settings لاگو ہوتے ہیں۔

## خوبیاں اور حدود

**CloudFront کیوں طاقتور ہے**:

- 90+ شہروں میں edge locations — زیادہ تر صارفین کو content <20ms سے ملتا ہے
- پہلے cache کے بعد static content single-digit milliseconds میں serve ہوتی ہے
- Origin load کو نمایاں طور پر کم کرتا ہے (repeat ٹریفک آپ کے servers کو کبھی نہیں چھوتی)
- AWS Shield، WAF، اور Certificate Manager کے ساتھ Integrated
- Capacity planning کی ضرورت نہیں — CloudFront خودبخود scale کرتا ہے

**جہاں پیچیدہ ہو جاتا ہے**:

- Cached content پرانی ہو سکتی ہے — cache invalidate کرنے کی لاگت ہے ($0.005 per 1,000 paths)
- Cache-Control headers origin پر صحیح طریقے سے سیٹ ہونے چاہئیں — غلطیاں پرانی content پیدا کرتی ہیں
- Dynamic content routing optimization سے فائدہ اٹھاتی ہے لیکن caching سے نہیں
- Cache کے رویے کو debug کرنا (کیا cache ہے، کہاں، کتنی دیر) کے لیے متعدد layers سمجھنا ضروری ہے
- CloudFront کے ذریعے data transfer out کی لاگت ہے، اگرچہ معیاری data transfer سے کم

## خلاصہ

- ایک **CDN** آپ کے content کی کاپیاں آپ کے صارفین کے قریب edge locations پر cache کرتا ہے — latency اور origin load کم کرتا ہے۔
- **CloudFront** AWS کا CDN ہے، 500+ edge locations عالمی سطح پر۔
- Cache misses **origin** (S3، ALB، EC2) سے لیتی ہیں۔ Cache hits edge سے serve ہوتی ہیں — ملی سیکنڈ، سینکڑوں ملی سیکنڈ نہیں۔
- **Behaviors** آپ کو مختلف URL patterns کے لیے مختلف caching قواعد سیٹ کرنے دیتے ہیں۔
- Dynamic content cache نہیں ہوتی، لیکن CloudFront پھر بھی AWS کے private backbone نیٹ ورک کے ذریعے کارکردگی بہتر کرتا ہے۔
- **Origin Access Control** براہ راست S3 رسائی کو restrict کرتا ہے — content صرف CloudFront کے ذریعے serve ہوتی ہے۔
- Shield (DDoS)، WAF (application firewall)، اور ACM (SSL certificates) کے ساتھ Integrated۔

## امتحانی نکات

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں (ڈومین ۳، ٹاسک ۳.۴)*

- **CloudFront + S3**: عالمی سطح پر static websites serve کرنے کے لیے کلاسک امتحانی pattern۔ S3 bucket بطور origin، CloudFront بطور CDN، براہ راست S3 رسائی روکنے کے لیے Origin Access Control۔
- **Edge locations بمقابلہ Regions بمقابلہ AZs**: Edge locations زیادہ تعداد میں ہیں اور صرف caching/CDN مقاصد کے لیے موجود ہیں۔ وہ AZs جیسی نہیں ہیں (جو آپ کا compute چلاتی ہیں)۔
- **Cache invalidation**: `/images/*` invalidation بناتا ہے CloudFront کو تازہ content لینے پر مجبور کرنے کے لیے۔ لاگت ہے — امتحان cost-effective متبادل پوچھ سکتا ہے: versioned URLs (`image-v2.jpg` بجائے `image.jpg`)، جو قدرتی طور پر cache کو bypass کرتے ہیں۔
- **TTL control**: `Cache-Control: max-age=3600` origin پر 1 گھنٹے کی cache TTL سیٹ کرتا ہے۔ CloudFront ان headers کا احترام کرتا ہے۔
- **CloudFront Functions بمقابلہ Lambda@Edge**: CloudFront Functions ہلکی request/response manipulation کے لیے edge پر چلتے ہیں (sub-millisecond)۔ Lambda@Edge بھاری processing کے لیے edge locations پر آپ کا Lambda code چلاتا ہے۔ امتحان انہیں use case complexity کے ذریعے distinguish کرتا ہے۔
- **Signed URLs اور Signed Cookies**: CloudFront کے ذریعے content تک رسائی کو کنٹرول کریں۔ Signed URLs مخصوص files تک رسائی دیتے ہیں؛ signed cookies متعدد files تک رسائی دیتے ہیں۔ امتحان انہیں "paid subscriber content" کے لیے استعمال کرتا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

CloudFront cache hit اور cache miss کے درمیان فرق بیان کریں۔ ہر صورت میں کیا ہوتا ہے؟

*(اشارہ: content کہاں سے آتی ہے، اور دونوں cases میں response time کیسے مختلف ہے، اس کے بارے میں سوچیں۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک software کمپنی ایک S3 bucket سے دنیا بھر کے صارفین کو بڑی installer files (~2GB ہر ایک) distribute کرتی ہے۔ Asia میں صارفین کے لیے download speeds سست ہیں۔ ٹیم S3 bucket کو متعدد regions میں replicate کیے بغیر کارکردگی بہتر کرنا چاہتی ہے۔ انہیں یہ بھی یقینی بنانا ہے کہ صرف ادائیگی کرنے والے صارفین installers download کر سکیں۔

کون سا حل ان ضروریات کو بہترین طریقے سے پوری کرتا ہے؟

A) Bucket پر S3 Transfer Acceleration فعال کریں اور ادائیگی کرنے والے صارفین کے لیے pre-signed URLs بنائیں  
B) S3 bucket کو origin کے ساتھ CloudFront استعمال کریں، Origin Access Control فعال کریں، اور ادائیگی کرنے والے صارفین کے لیے CloudFront Signed URLs استعمال کریں  
C) ہر AWS region میں ایک S3 bucket بنائیں اور صارفین کو قریب ترین bucket کی طرف direct کرنے کے لیے Route 53 geolocation routing استعمال کریں  
D) ہر region میں EC2 انسٹینسز کے ساتھ ایک Application Load Balancer استعمال کریں جو installer files serve کریں

**اشارہ ۱**: ضرورت bucket replicate کیے بغیر عالمی کارکردگی بہتر کرنا ہے۔ کون سا آپشن متعدد buckets نہیں چاہتا؟

**اشارہ ۲**: CloudFront کے ذریعے serve کردہ content تک رسائی کو کون سی سروس خاص طور پر کنٹرول کرتی ہے؟

**اشارہ ۳**: S3 Transfer Acceleration لمبی دوری پر *uploads* to S3 کے لیے optimize ہے۔ S3 سے عالمی صارفین کو content *deliver* کرنے کے لیے، CloudFront درست ٹول ہے۔

**جواب**: B

**وضاحت**: CloudFront پہلے download کے بعد installer files کو edge locations پر عالمی سطح پر cache کرتا ہے۔ ایک ہی region میں بعد کے downloads edge سے آتے ہیں — us-east-1 میں S3 سے Pacific عبور کرنے سے بہت تیز۔ Origin Access Control یقینی بناتا ہے کہ S3 bucket صرف CloudFront کے ذریعے قابل رسائی ہو۔ Signed URLs رسائی کو ادائیگی کرنے والے صارفین تک محدود کرتے ہیں۔

**A کیوں نہیں؟** S3 Transfer Acceleration لمبی دوری پر S3 میں uploads کے لیے optimize ہے — S3 سے عالمی سامعین تک content distribute کرنے کے لیے نہیں۔ اس کے لیے CloudFront درست ٹول ہے۔ Pre-signed URLs رسائی کنٹرول کرتے ہیں لیکن عالمی کارکردگی بہتر نہیں کرتے۔

**C کیوں نہیں؟** ہر region میں S3 bucket بنانا کارکردگی کے لیے کام کرتا ہے، لیکن یہ replication سے بچنے کی ضرورت کے خلاف ہے۔ اس کے لیے بھی buckets میں data synchronization strategy کی ضرورت ہے۔

**D کیوں نہیں؟** ہر region میں لوڈ بیلنسر کے پیچھے EC2 انسٹینسز CloudFront سے نمایاں طور پر زیادہ مہنگی ہیں اور متعدد regions میں servers manage کرنے کی ضرورت ہے۔

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۳.۴*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus ویڈیو content شامل کرنا چاہتا ہے — ریستوران partners کے مختصر cooking tutorial videos۔ Videos 50-500MB ہو سکتی ہیں۔ وہ توقع کرتے ہیں کہ publishing کے چند گھنٹوں کے اندر ایک ہی شہر میں ہزاروں صارفین ایک ہی video دیکھیں گے۔

Storage اور delivery architecture ڈیزائن کریں۔ کیا آپ S3 اور CloudFront استعمال کریں گے؟ آپ پہلی request (cold start) کو کیسے سنبھالیں گے تاکہ video cache ہونے سے پہلے تاخیر کم سے کم ہو؟ ایسی video کے لیے آپ کون سی cache TTL سیٹ کریں گے جو publishing کے بعد نہیں بدلے گی؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد CDN ڈیزائن کے فیصلوں کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Priya نے deployment کے بعد CloudFront metrics دیکھے۔

Cache hit rate: 83%۔

"اس کا کیا مطلب ہے؟" Tom نے پوچھا۔

"اس کا مطلب ہے ہمارے 83% صارفین انہیں قریب edge location سے content وصول کر رہے ہیں، us-east-1 سے نہیں۔"

"اور باقی 17%؟"

"پہلی بار requests۔ Content جو ابھی تک اس edge location پر cache نہیں ہوئی۔"

Tom نے metrics کو گھورا۔ "تو ہم فی دن تقریباً دس لاکھ requests CloudFront edge nodes سے serve کر رہے ہیں۔ اور صرف 170,000 اصل میں ہمارے servers تک پہنچتی ہیں۔"

"ہاں۔"

"تو اگر ہمارے پاس CloudFront نہ ہوتا، ہمارے servers دس لاکھ requests سنبھالتے۔"

"عالمی صارفین کے لیے 140-160 ملی سیکنڈ ہر ایک پر۔"

Tom پیچھے جھک گیا۔ اس کے چہرے پر وہ نظر تھی جسے Maya پہچانتی تھی — کوئی ریئل ٹائم میں لاگت کا دوبارہ حساب لگا رہا ہو۔

"یہ اس کی قیمت ہے،" اس نے کہا۔

Maya پہلے سے اپنے لیپ ٹاپ پر تھی۔ "دو نئے انجینئرز اگلے ہفتے ہم سے ملتے ہیں۔ Soo-Jin، platform team سے اپنی پچھلی کمپنی میں، اور Rafael — اس نے security میں specialization کی ہے۔ میں چاہتی ہوں کہ وہ اپنے پہلے دن سے پہلے IAM پر onboard ہوں۔"

"IAM advanced؟" Leo نے پوچھا۔

"Roles، policies، cross-account رسائی۔ اصل چیزیں۔"

اگلے باب میں: باریک اجازتیں جو نظام کے ایک حصے کو دوسرے سے محفوظ طریقے سے بات کرنے دیتی ہیں۔
