# باب ۱۲: انٹرنیٹ آپ کو کیسے ڈھونڈتا ہے

Nimbus چل رہا تھا۔ لوڈ بیلنسر کا ایک عوامی IP تھا۔ EC2 انسٹینسز کا ایک نجی IP تھا۔ ڈیٹابیسز private subnets میں بند تھے۔ Priya نے نیٹ ورک خاکے پر منظوری سے سر ہلایا تھا۔

Tom نے لوڈ بیلنسر کا URL دیکھا: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`۔

"کیا یہی صارفین اپنے براؤزر میں ٹائپ کرتے ہیں؟" اس نے پوچھا۔

"یہ وہ ہے جو AWS خودبخود تفویض کرتا ہے،" Maya نے کہا۔

"میں یہ بزنس کارڈ پر نہیں ڈالوں گا۔"

"میں بھی نہیں۔"

انہیں ایک domain name کی ضرورت تھی۔ انہوں نے ایک domain registrar سے `eatnimbus.com` خریدا۔ اب انہیں اس نام کو اپنے AWS infrastructure سے جوڑنا تھا۔

"انٹرنیٹ کو کیسے پتہ چلتا ہے کہ `eatnimbus.com` کا مطلب us-east-1 میں لوڈ بیلنسر ہے؟" Leo نے پوچھا۔

اچھا سوال، Leo۔

**فون بک کی مثال**

اسمارٹ فونز سے پہلے، ہر شہر میں ایک فون بک ہوتی تھی۔ اگر آپ "Mario's Pizza" تک پہنچنا چاہتے تھے، تو آپ فون نمبر یاد نہیں کرتے تھے — آپ نام تلاش کرتے، نمبر ملتا، اور کال کرتے۔

انٹرنیٹ کی اپنی فون بک ہے: **Domain Name System (DNS)**۔

DNS انسانوں کے پڑھنے والے ناموں (جیسے `eatnimbus.com`) کو مشینوں کے پڑھنے والے IP پتوں (جیسے `203.0.113.42`) میں ترجمہ کرتا ہے۔ ہر بار جب آپ کوئی ویب سائٹ وزٹ کرتے ہیں، آپ کا کمپیوٹر خاموشی سے DNS میں domain name تلاش کرتا ہے اور جڑنے کے لیے IP پتہ ملتا ہے۔

اگر آپ اپنے سرور کا IP پتہ بدلتے، تو آپ DNS ریکارڈ اپڈیٹ کرتے — جیسے فون بک میں اپنا نمبر بدلنا — اور انٹرنیٹ آپ کو نئی جگہ ڈھونڈ لیتا۔

**Route 53 سے ملیں**

Amazon Route 53 AWS کی منیجڈ DNS سروس ہے۔ اسے Route 53 کہا جاتا ہے کیونکہ پورٹ 53 معیاری DNS پورٹ ہے۔ (کبھی کبھی AWS چیزوں کے نام سیدھے رکھتا ہے۔)

Route 53 کئی کام کرتا ہے:

**Domain registration**: آپ Route 53 کے ذریعے براہ راست domain names خرید سکتے ہیں۔

**DNS hosting (hosted zones)**: آپ اپنے domain کے لیے ایک *hosted zone* بناتے ہیں، اور Route 53 ان DNS records کو منظم کرتا ہے جو دنیا کو بتاتے ہیں کہ آپ کو کہاں ڈھونڈیں۔

**Health checking**: Route 53 آپ کے endpoints کی نگرانی کر سکتا ہے اور غیر صحت مند endpoints سے ٹریفک دوسری طرف موڑ سکتا ہے۔

**ٹریفک routing policies**: Route 53 آسان DNS سے آگے متعدد routing strategies سپورٹ کرتا ہے — weighted، latency-based، geolocation، failover۔

**DNS Records: فون بک کی entries**

ایک DNS ریکارڈ ایک نام کو ایک منزل سے map کرتا ہے۔ سب سے عام اقسام:

**A record**: ایک نام کو IPv4 پتے سے map کرتا ہے۔
`eatnimbus.com → 203.0.113.42`

**AAAA record**: ایک نام کو IPv6 پتے سے map کرتا ہے۔

**CNAME record**: ایک نام کو دوسرے نام سے map کرتا ہے (ایک alias)۔
`www.eatnimbus.com → eatnimbus.com`

**MX record**: وہ servers بتاتا ہے جو domain کے لیے email سنبھالتے ہیں۔

**TXT record**: من مانی text محفوظ کرتا ہے۔ عام طور پر domain verification (ثابت کرنا کہ آپ domain کے مالک ہیں) اور email authentication (SPF، DKIM) کے لیے استعمال ہوتا ہے۔

Nimbus کے لیے، بنیادی سیٹ اپ:

- `eatnimbus.com` → A record لوڈ بیلنسر کے IP کی طرف اشارہ کرتا ہوا
- `www.eatnimbus.com` → CNAME `eatnimbus.com` کی طرف اشارہ کرتا ہوا
- `api.eatnimbus.com` → A record API لوڈ بیلنسر کی طرف اشارہ کرتا ہوا

"رکو،" Tom نے کہا۔ "لوڈ بیلنسر کا IP بدل سکتا ہے۔ AWS نے دستاویزات میں یہی کہا۔"

اچھی پکڑ، Tom۔

**Alias Records: متحرک IPs کے لیے AWS کا حل**

Load balancers، CloudFront distributions، اور S3 ویب سائٹوں کے DNS نام ہیں، static IP پتے نہیں۔ بنیادی IPs بدل سکتے ہیں۔

اگر آپ لوڈ بیلنسر کے DNS نام کی طرف اشارہ کرتے ہوئے CNAME بناتے ہیں، تو یہ کام کرتا ہے — لیکن آپ root domains (`eatnimbus.com` بغیر `www` کے) پر CNAMEs استعمال نہیں کر سکتے کیونکہ DNS standards کی وجہ سے۔

Route 53 اسے **Alias records** سے حل کرتا ہے — DNS کا ایک AWS-specific extension۔ ایک Alias record براہ راست ایک AWS resource (لوڈ بیلنسر، CloudFront distribution، S3 ویب سائٹ) سے map کرتا ہے، اور Route 53 متحرک IP resolution خودبخود سنبھالتا ہے۔ Alias records root domain سطح پر استعمال کیے جا سکتے ہیں۔ اور عام DNS queries کے برعکس، AWS resources کے لیے Alias record queries مفت ہیں۔

"تو ہم `eatnimbus.com` کے لیے Alias record استعمال کرتے ہیں جو لوڈ بیلنسر کی طرف اشارہ کرتا ہے،" Leo نے تصدیق کی۔

"اور Route 53 جو بھی IP لوڈ بیلنسر کسی بھی وقت استعمال کر رہا ہے اسے سنبھالتا ہے،" Priya نے اضافہ کیا۔

"مفت میں،" Tom نے کہا، اچانک بہت دلچسپی لیتے ہوئے۔

**Routing Policies: صرف "یہ کہاں ہے؟" سے زیادہ**

یہاں Route 53 دلچسپ ہو جاتا ہے۔ DNS محض ایک تلاش سروس نہیں ہے — یہ ایک ٹریفک management ٹول ہو سکتا ہے۔

**Simple routing**: ایک record، ایک منزل۔ معیاری DNS۔

**Weighted routing**: وزن کے مطابق متعدد منازل کے درمیان ٹریفک تقسیم کریں۔ migration کے دوران 90% نئے سرور کو، 10% پرانے کو بھیجیں۔ Weights ایڈجسٹ کریں جب تک آپ نئے سرور پر اعتماد حاصل نہ کر لیں، پھر 100% پر سوئچ کریں۔

**Latency-based routing**: صارفین کو AWS region کی طرف route کریں جس کی ان کے لیے سب سے کم latency ہو۔ Seattle میں صارف `us-west-2` کی طرف route ہوتا ہے۔ Tokyo میں صارف `ap-northeast-1` کی طرف route ہوتا ہے۔ ایک ہی domain نام، مختلف منازل۔

**Geolocation routing**: صارف کے جغرافیائی مقام کی بنیاد پر route کریں۔ تمام یورپی صارفین `eu-west-1` جاتے ہیں۔ تمام شمالی امریکی صارفین `us-east-1` جاتے ہیں۔ data sovereignty (EU صارف ڈیٹا EU regions میں رکھنا) یا content customization (زبان، currency) کے لیے مفید۔

**Failover routing**: ایک primary اور ایک secondary endpoint نامزد کریں۔ اگر primary، Route 53 کی health check میں ناکام ہو، ٹریفک خودبخود secondary کی طرف redirect ہو۔ یہ disaster recovery کی DNS layer ہے۔

**Multivalue answer routing**: ایک query کے لیے آٹھ صحت مند IP پتے تک واپس کریں، client کو انتخاب کرنے دیں۔ متعدد servers میں ٹریفک تقسیم کرنے کے لیے لوڈ بیلنسر کا ایک سادہ متبادل۔

"تو Route 53 محض ایک فون بک نہیں ہے،" Maya نے کہا۔ "یہ ایک سمارٹ فون بک ہے جو آپ کے کہاں سے کال کر رہے ہیں اس کی بنیاد پر calls route کر سکتی ہے۔"

"اور اگر نمبر غیر صحت مند ہو تو disconnect کر سکتی ہے،" Priya نے اضافہ کیا۔

**Health Checks: ناکامی کے گرد Routing**

Route 53 health checks کے ساتھ آپ کے endpoints کی نگرانی کر سکتا ہے۔ اگر کوئی endpoint ناکام ہو، Route 53 یہ کر سکتا ہے:

- اسے DNS responses سے ہٹا دیں (وہاں ٹریفک بھیجنا بند کریں)
- backup endpoint پر failover trigger کریں
- CloudWatch کے ذریعے alert بھیجیں

Health checks DNS routing اور اصل ایپلیکیشن صحت کے درمیان کڑی ہیں۔ failover ترتیب میں: Route 53 ہر 30 سیکنڈ میں primary endpoint کی نگرانی کرتا ہے۔ اگر تین مسلسل checks ناکام ہوں، Route 53 secondary endpoint کا پتہ واپس کرنا شروع کر دیتا ہے۔

یہ فوری نہیں ہے — DNS میں propagation کا وقت ہوتا ہے۔ ایک بار جب Route 53 DNS ریکارڈ بدلتا ہے، دنیا بھر کے DNS resolvers کو تبدیلی pick up کرنے کی ضرورت ہوتی ہے، جس میں TTL settings کے مطابق سیکنڈوں سے لے کر منٹوں تک کا وقت لگ سکتا ہے۔

**TTL: DNS Cache**

DNS responses کئی سطحوں پر cache ہوتے ہیں — آپ کے router پر، آپ کے ISP پر، آپ کے براؤزر میں۔ DNS ریکارڈ پر **TTL (Time-To-Live)** caches کو بتاتا ہے کہ دوبارہ چیک کرنے سے پہلے کتنی دیر تک جواب یاد رکھنا ہے۔

زیادہ TTL (1 گھنٹہ یا زیادہ): کم DNS queries، Route 53 پر کم بوجھ، لیکن تبدیلیاں propagate ہونے میں زیادہ وقت لگتا ہے۔

کم TTL (60 سیکنڈ یا کم): تبدیلیاں جلدی propagate ہوتی ہیں، لیکن زیادہ DNS queries کی ضرورت ہوتی ہے۔

منصوبہ بند migration (DNS کو نئے سرور کی طرف اپڈیٹ کرنے) سے پہلے، ایک دن پہلے اپنی TTL کو 60 سیکنڈ تک کم کریں۔ پھر جب آپ تبدیلی کریں، یہ تقریباً ایک منٹ میں propagate ہو جاتی ہے۔ migration کے بعد، اسے واپس normal value پر لے آئیں۔

"اگر ہم نے صرف migration کے دوران اسے کم کیا، پہلے نہیں،" Leo نے آہستہ آہستہ کہا، "تو پرانی TTL کا مطلب ہے کچھ صارفین ایک گھنٹے تک پرانا سرور دیکھتے رہیں گے۔"

"بالکل،" Priya نے کہا۔ "DNS migrations کے لیے migration سے پہلے منصوبہ بندی کی ضرورت ہے، نہ صرف اس کے دوران۔"

## خوبیاں اور حدود

**Route 53 صحیح انتخاب ہے**: domain names کو مکمل طور پر AWS میں register اور manage کرنے کے لیے؛ latency، geolocation، یا weighted distribution کی بنیاد پر متعدد endpoints میں ٹریفک route کرنے کے لیے؛ regions یا primary اور disaster-recovery endpoint کے درمیان health-check-based failover کے لیے؛ alias records کے ذریعے دوسری AWS سروسز کے ساتھ DNS integrate کرنے کے لیے۔

**جب Route 53 آپ کی ضرورت نہیں**: Route 53 ایک DNS سروس ہے، لوڈ بیلنسر نہیں۔ اگر آپ کو region کے اندر متعدد servers یا containers کے درمیان ٹریفک تقسیم کرنی ہو، تو Application Load Balancer استعمال کریں — Route 53 لوڈ بیلنسر کی طرح connection سطح پر weighted round-robin نہیں کر سکتا۔

## خلاصہ

- **DNS** domain names کو IP پتوں میں ترجمہ کرتا ہے — انٹرنیٹ کی فون بک۔
- **Route 53** AWS کی منیجڈ DNS سروس ہے: domain registration، DNS hosting، health checks، اور routing policies۔
- **A records** نام کو IPv4 پتوں سے map کرتے ہیں۔ **CNAMEs** نام کو دوسرے ناموں سے map کرتے ہیں۔ **Alias records** نام کو AWS resources سے map کرتے ہیں۔
- Root domains اور متحرک IPs والے resources کے لیے CNAMEs کی بجائے Alias records استعمال کریں۔
- Routing policies آسان DNS سے آگے جاتی ہیں: **weighted** (ٹریفک splitting)، **latency-based** (کارکردگی)، **geolocation** (data sovereignty)، **failover** (disaster recovery)۔
- **Health checks** endpoints کی نگرانی کرتے ہیں اور غیر صحت مند targets کو DNS responses سے خودبخود ہٹا دیتے ہیں۔
- migrations سے پہلے TTL تبدیلیوں کی منصوبہ بندی کریں — تبدیلیاں جلدی propagate ہونے کے لیے پہلے سے TTL کم کریں۔

## امتحانی نکات

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں (ڈومین ۳، ٹاسک ۳.۴)*

- **Alias بمقابلہ CNAME**: Alias records root domain پر استعمال کیے جا سکتے ہیں؛ CNAMEs نہیں۔ AWS resources کے لیے Alias record queries مفت ہیں۔ جب امتحان root domain کو لوڈ بیلنسر سے map کرنے کے بارے میں پوچھے → Alias record۔
- **Routing policy استعمال کے کیسز** (عام امتحانی منظر نامے):
  - "ٹریفک کو نئے ورژن میں بتدریج منتقل کریں" → Weighted routing
  - "صارفین کو قریب ترین AWS region کی طرف route کریں" → Latency-based routing
  - "EU صارف ڈیٹا EU regions میں رکھیں" → Geolocation routing
  - "Primary ناکام ہونے پر خودکار DNS failover" → Health checks کے ساتھ Failover routing
- **Route 53 health checks**: HTTP/HTTPS/TCP endpoints چیک کر سکتے ہیں، اور CloudWatch alarms trigger کر سکتے ہیں۔ امتحان انہیں disaster recovery منظر ناموں میں استعمال کرتا ہے۔
- **TTL اور propagation**: جانیں کہ TTL کنٹرول کرتی ہے کہ DNS resolvers ریکارڈ کتنی دیر cache کریں۔ مختصر TTL = تیز تبدیلیاں۔ امتحانی منظر نامہ: "ٹیم نے DNS اپڈیٹ کیا لیکن صارفین اب بھی پرانے سرور پر جا رہے ہیں" → TTL بہت زیادہ ہے۔
- **Private hosted zones**: Route 53 ایسے DNS records بنا سکتا ہے جو صرف VPC کے اندر resolve ہوں۔ امتحان اسے internal service discovery کے لیے استعمال کرتا ہے (مثلاً `database.internal` ایک نجی RDS endpoint کی طرف resolve ہوتا ہے)۔
- Route 53 **عالمی** ہے — یہ کسی region میں تعینات نہیں ہے۔ hosted zones بناتے وقت کوئی region selection ضروری نہیں۔

## مشقیں

**مشق ۱ — یادداشت**

CNAME record اور Alias record کے درمیان فرق بیان کریں۔ آپ ہر ایک کب استعمال کریں گے؟

*(اشارہ: root domains پر CNAME کی پابندیوں اور متحرک AWS resources کے ساتھ Alias records کے رویے پر غور کریں۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک میڈیا کمپنی دو AWS regions سے ایک ویب سائٹ چلاتی ہے: `us-east-1` (primary) اور `eu-west-1` (secondary)۔ ٹیم چاہتی ہے کہ primary region غیر دستیاب ہونے پر ٹریفک خودبخود `eu-west-1` کی طرف route ہو۔ کمپنی یہ بھی یقینی بنانا چاہتی ہے کہ یہ failover mechanism صحیح طریقے سے کام کرتا ہے بغیر اصل میں primary region کو بند کیے۔

کون سی Route 53 ترتیب ان ضروریات کو بہترین طریقے سے پوری کرتی ہے؟

A) `us-east-1` پر 100% weight اور `eu-west-1` پر 0% weight کے ساتھ Weighted routing  
B) دونوں endpoints پر health checks کے ساتھ Latency-based routing  
C) Primary endpoint پر health check اور `eu-west-1` کی طرف اشارہ کرتے secondary record کے ساتھ Failover routing  
D) شمالی امریکہ `us-east-1` کی طرف اور یورپ `eu-west-1` کی طرف اشارہ کرتے Geolocation routing

**اشارہ ۱**: ضرورت primary ناکام ہونے پر خودکار failover ہے۔ کون سی routing policy بالکل اسی کے لیے ڈیزائن کی گئی ہے؟

**اشارہ ۲**: "Primary region کو بند کیے بغیر test کریں" — health checks کو testing کے لیے ہاتھ سے "unhealthy" پر سیٹ کیا جا سکتا ہے۔

**اشارہ ۳**: Latency-based routing رفتار کے لیے optimize کرتا ہے، failover کے لیے نہیں۔

**جواب**: C

**وضاحت**: Failover routing بالکل اس استعمال کے کیس کے لیے ڈیزائن کیا گیا ہے۔ Primary record health check کے ساتھ `us-east-1` کی طرف اشارہ کرتا ہے۔ Secondary record `eu-west-1` کی طرف اشارہ کرتا ہے۔ اگر health check ناکام ہو، Route 53 خودبخود secondary record serve کرتا ہے۔ Health checks کو primary region کو اصل میں disrupt کیے بغیر testing کے لیے ہاتھ سے fail کیا جا سکتا ہے۔

**A کیوں نہیں؟** 100%/0% کے ساتھ Weighted routing مؤثر طور پر static ہے — یہ primary ناکام ہونے پر خودبخود نہیں بدلتا۔

**B کیوں نہیں؟** Latency-based routing ہر صارف کے لیے تیز ترین endpoint انتخاب کرتا ہے۔ یہ صحت کی بنیاد پر کسی region کو خودبخود exclude نہیں کرتا — یہ پھر بھی غیر صحت مند `us-east-1` کی طرف کچھ ٹریفک route کرے گا اگر latency اسے favored کرے۔

**D کیوں نہیں؟** Geolocation routing صارف کے مقام کے مطابق route کرتا ہے، endpoint کی صحت کے مطابق نہیں۔

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۳.۴*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus بین الاقوامی سطح پر پھیل رہا ہے۔ وہ چاہتے ہیں کہ `eatnimbus.com` مغربی ساحل، مشرقی ساحل، اور آسٹریلیا کے صارفین کے لیے جلدی لوڈ ہو۔ انہیں ایک ریگولیٹری ضرورت بھی ہے: یورپی صارفین کے آرڈرز EU میں servers سے process ہونے چاہئیں۔

ایک Route 53 routing حکمت عملی ڈیزائن کریں جو دونوں ضروریات کو پوری کرے۔ آپ کون سی routing policy یا policies کا مجموعہ استعمال کریں گے؟ ہر region میں آپ کو کون سا infrastructure چاہیے ہوگا؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد multi-region routing ڈیزائن کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

`eatnimbus.com` live تھا۔

Maya نے اسے اپنے براؤزر میں ٹائپ کیا تھا، اور Nimbus ordering صفحہ لوڈ ہوا تھا۔ اس نے اپنے خاندان کے ریستوران سے arepa آرڈر کیا، صرف flow test کرنے کے لیے۔ آرڈر گیا۔ باورچی خانے نے اسے وصول کیا۔

وہ پیچھے جھک گئی۔

Tom پہلے سے Route 53 health check logs پڑھ رہا تھا۔ "us-east-1 سے response time 47 ملی سیکنڈ ہے۔"

"کیا یہ تیز ہے؟" Maya نے پوچھا۔

"DNS کے لیے؟ ہاں۔"

"لیکن Seattle میں ایک صارف کے لیے؟"

Tom نے latency گراف دیکھا۔ "تقریباً 80 ملی سیکنڈ۔"

Maya نے یہ سوچا۔ "اگر ہمارے زیادہ تر صارفین مغربی ساحل پر ہیں، اور ہمارے servers Virginia میں..."

"ہر درخواست Seattle سے Virginia اور واپس جاتی ہے،" Leo نے کمرے کے دوسری طرف سے کہا۔ "روشنی کی رفتار۔ آپ physics کو نہیں ہرا سکتے۔"

"تو ہمیں Seattle کے قریب servers کی ضرورت ہے۔"

"یا Seattle کے قریب کوئی چیز جو ان کی جانب سے content serve کرے۔"

وہ خیال ہوا میں رہا۔

اگلے باب میں: وہ warehouses جو Nimbus کا content ہر جگہ ہر صارف سے ایک ملی سیکنڈ دور رکھتے ہیں۔
