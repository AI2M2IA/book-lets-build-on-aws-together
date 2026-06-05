# باب ۱۵: دروازے کے محافظ

Nimbus کے پہلے ورژن کی پرانی deploy key ابھی بھی active تھی۔ اس نے پچھلے ہفتے تین API calls کیے تھے۔ Leo کو نہیں پتہ تھا کس نے کیے۔

Priya نے VPC flow logs کھولے — نیٹ ورک ٹریفک ریکارڈ جو VPC کے اندر اور باہر ہر کنکشن دکھاتے ہیں۔

"منگل کو 2:17 AM پر،" اس نے کہا، "پرانے API چلانے والی EC2 انسٹینس سے Romania میں ایک IP پتے کی طرف ایک outbound connection تھی۔"

"یہ ہمارا infrastructure نہیں ہے،" Leo نے کہا۔

"نہیں۔"

"تو کوئی ہماری EC2 انسٹینس پر تھا۔"

"یا کوئی چیز۔"

انہوں نے trace کیا: پرانی deploy key ایک چھوٹا script EC2 انسٹینس پر اپلوڈ کرنے کے لیے استعمال کی گئی تھی۔ Script نے adjacent servers پر ports scan کرنے کی کوشش کی تھی۔ زیادہ تر scans ناکام ہوئے۔

"Security groups نے انہیں block کیا،" Priya نے کہا۔ "Attacker ایک EC2 انسٹینس پر گیا۔ وہ دوسروں تک نہیں پہنچ سکے کیونکہ security groups نے صرف load balancer سے ٹریفک کی اجازت دی تھی۔"

"تو نقصان محدود رہا۔"

"کیونکہ ہمارے پاس صحیح طریقے سے ترتیب دیے گئے security groups تھے۔ اگر ہم نے port 5432 account میں کسی EC2 انسٹینس کے لیے کھلا چھوڑا ہوتا تو تصور کریں۔"

Leo نے تصور کرنے کی ضرورت نہیں تھی۔ اس نے اصل سیٹ اپ میں وہ configuration دیکھی تھی۔

**نیٹ ورک Security کی دو Layers**

VPC میں، آپ کے پاس نیٹ ورک ٹریفک کنٹرول کرنے کے دو الگ ٹولز ہیں:

**Security Groups**: انفرادی resources سے attached ورچوئل firewalls (EC2 انسٹینسز، RDS databases، load balancers، VPC میں Lambda functions)۔ وہ resource سطح پر کام کرتے ہیں۔

**Network ACLs (NACLs)**: Subnets سے attached firewall قواعد۔ وہ subnet boundary پر کام کرتے ہیں — اس subnet کے کسی بھی resource تک پہنچنے سے پہلے ٹریفک پر۔

دونوں کو سمجھنے کے لیے ایک اہم فرق سمجھنا ضروری ہے: **stateful بمقابلہ stateless**۔

**Stateful: Security Groups**

ایک security group **stateful** ہے۔

جب آپ ایک مخصوص port پر inbound ٹریفک کی اجازت دیتے ہیں، تو response ٹریفک خودبخود باہر جانے کی اجازت ہوتی ہے، چاہے اس کے لیے کوئی واضح outbound rule نہ ہو۔

جب آپ کسی destination کو outbound ٹریفک کی اجازت دیتے ہیں، تو واپس آنے والا response خودبخود اندر آنے کی اجازت ہوتا ہے۔

ایک دفتری عمارت میں stateful security guard کی طرح سوچیں۔ آپ داخل ہونے کے لیے اپنا badge دکھاتے ہیں۔ بعد میں باہر جاتے ہیں۔ Guard کو آپ کو جاتے وقت دوبارہ چیک کرنے کی ضرورت نہیں — سسٹم جانتا ہے آپ کو اندر آنے دیا گیا، اور آپ کو جانے کی اجازت ہے۔

**Nimbus API EC2 انسٹینس کے لیے Security Group Rules:**

- **Inbound — TCP 8080 — Load Balancer SG سے** → ALB سے API ٹریفک قبول کریں
- **Inbound — TCP 22 — Bastion Host SG سے** → صرف bastion سے SSH
- **Outbound — TCP 5432 — RDS SG کو** → PostgreSQL سے جڑیں
- **Outbound — TCP 6379 — ElastiCache SG کو** → Redis سے جڑیں
- **Outbound — TCP 443 — 0.0.0.0/0 کو** → بیرونی APIs کو HTTPS

نوٹ: port 8080 کے لیے کوئی واضح outbound rule نہیں۔ Inbound rule stateful ہے — response ٹریفک (لوڈ بیلنسر کو API کا جواب) خودبخود allowed ہے۔

یہ بھی نوٹ کریں: security group rules *IP پتوں* نہیں بلکہ *دوسرے security groups* کا حوالہ دیتے ہیں۔ "لوڈ بیلنسر security group سے inbound allow" کا مطلب ہے "کسی بھی resource سے ٹریفک allow کریں جس سے یہ security group attached ہے۔" یہ IP پتے track کرنے سے زیادہ لچکدار اور قابل انتظام ہے۔

**Default رویہ:**

- ڈیفالٹ کے مطابق، تمام inbound ٹریفک denied ہے
- ڈیفالٹ کے مطابق، تمام outbound ٹریفک allowed ہے
- تمام rules evaluate کیے جاتے ہیں (security groups کے ordered rules نہیں ہوتے — تمام matching rules لاگو ہوتے ہیں)
- Security groups صرف **allow** کر سکتے ہیں — آپ explicit deny rules نہیں بنا سکتے

**Stateless: Network ACLs**

ایک NACL **stateless** ہے۔

جب آپ port 8080 پر inbound ٹریفک کی اجازت دیتے ہیں، تو یہ صرف inbound کو cover کرتا ہے۔ Response (ephemeral ports پر outbound ٹریفک) کے لیے ایک outbound rule کے ساتھ واضح طور پر allow کرنا ضروری ہے۔

ایک metal detector کی طرح سوچیں۔ آپ داخل ہوتے وقت اس سے گزرتے ہیں۔ Metal detector کو پتہ نہیں کہ آپ پہلے سے گزر چکے ہیں — آپ کو جاتے وقت دوبارہ گزرنا ہوگا۔

**NACL rules numbered ہیں اور ترتیب کے مطابق evaluate کیے جاتے ہیں۔** پہلا matching rule جیتتا ہے۔ Rule 100، rule 200 سے پہلے evaluate ہوتی ہے۔ اگر rule 100 ٹریفک deny کرے اور rule 200 allow کرے، ٹریفک denied ہے۔

NACLs واضح طور پر **deny** کر سکتے ہیں — security groups کے برعکس، جو صرف allow کر سکتے ہیں۔ یہ انہیں مخصوص IP ranges block کرنے کے لیے مفید بناتا ہے۔

**Default NACL رویہ:**

- Default NACL (آپ کے VPC کے ساتھ بنایا گیا) تمام inbound اور outbound ٹریفک allow کرتا ہے
- ایک custom NACL ڈیفالٹ کے مطابق تمام ٹریفک deny کرتا ہے (آپ کو واضح طور پر جو چاہیں allow کرنا ہوگا)

**Public subnet کے لیے NACL (سادہ کیا گیا):**

*Inbound rules (ترتیب کے مطابق evaluate — پہلا match جیتتا ہے):*

- Rule 100: TCP 443، 0.0.0.0/0 سے → **Allow** (HTTPS)
- Rule 110: TCP 80، 0.0.0.0/0 سے → **Allow** (HTTP)
- Rule 120: TCP 1024–65535، 0.0.0.0/0 سے → **Allow** (ephemeral return ports)
- Rule \*: تمام ٹریفک → **Deny**

*Outbound rules:*

- Rule 100: TCP 443، 0.0.0.0/0 کو → **Allow** (HTTPS)
- Rule 110: TCP 80، 0.0.0.0/0 کو → **Allow** (HTTP)
- Rule 120: TCP 1024–65535، 0.0.0.0/0 کو → **Allow** (ephemeral return ports)
- Rule \*: تمام ٹریفک → **Deny**

Rule 120 (ports 1024-65535) ephemeral ports allow کرتا ہے — TCP response ٹریفک کے لیے استعمال ہونے والے temporary high-numbered ports۔ کیونکہ NACLs stateless ہیں، آپ کو انہیں outbound واضح طور پر allow کرنا ہوگا، یا آپ کے سرور کے responses نہیں گزریں گے۔

**کون سا کب استعمال کریں**

رسائی کنٹرول کی primary layer کے لیے **security groups** استعمال کریں۔ وہ manage کرنے میں آسان، stateful (ephemeral ports بھولنے سے حادثاتی blocks کا کم خطرہ)، اور دوسرے security groups reference کرنے کی حمایت کرتے ہیں۔

Subnet-level controls کے لیے **NACLs** استعمال کریں، خاص طور پر:

- **Explicit deny rules**: ایک مخصوص IP پتہ یا range کو پورے subnet تک پہنچنے سے block کریں
- **Emergency blocking**: کوئی IP فعال طور پر attack کر رہا ہے — کسی بھی resource تک پہنچنے سے پہلے پورے subnet کو block کرنے کے لیے NACL deny rule شامل کریں

"تو security group باریک کنٹرول ہے،" Maya نے کہا، "اور NACL چوڑا stroke ہے؟"

"Security groups انفرادی resources محفوظ کرتے ہیں،" Priya نے تصدیق کی۔ "NACLs پورے subnets محفوظ کرتے ہیں۔ جب آپ کسی IP کو آپ کے نیٹ ورک پر کسی چیز تک پہنچنے سے روکنا چاہتے ہیں، NACL۔ جب آپ صرف لوڈ بیلنسر کو API سرور تک پہنچنے کی اجازت دینا چاہتے ہیں، security group۔"

**واقعہ: Layers نے کیا پکڑا**

Romanian IP attack کی طرف واپس:

**کیا ہوا**: Attacker نے compromised deploy key کا استعمال کرتے ہوئے ایک EC2 انسٹینس پر ایک scanning script اپلوڈ کی۔ Script نے دوسری سروسز سے جڑنے کی کوشش کی۔

**کس نے روکا**:

- RDS security group نے صرف API EC2 security group سے port 5432 پر inbound allow کیا۔ Script، database تک scanning tool سے نہیں پہنچ سکی — یہ صحیح security group attach نہیں کر رہی تھی۔
- ElastiCache security group نے صرف API EC2 security group سے port 6379 پر inbound allow کیا۔
- دوسری EC2 انسٹینسز نے صرف bastion host security group سے SSH allow کیا۔

**کس نے نہیں روکا**: 

- EC2 انسٹینس کے outbound rules نے 0.0.0.0/0 کو HTTPS allow کیا (package downloads کے لیے ضروری)۔ Script نے attacker کے server پر outbound connections بنانے کے لیے اسے استعمال کیا۔

واقعے کے بعد، Priya نے اضافہ کیا:

- Romanian IP range کو block کرنے والا ایک NACL rule
- EC2 انسٹینسز پر ایک زیادہ restrictive outbound rule (صرف مخصوص معلوم اچھی destinations کی اجازت دی)

## خوبیاں اور حدود

**Security Groups**:

- Stateful (ephemeral port سردردی نہیں)
- دوسرے security groups reference کر سکتے ہیں (IPs سے زیادہ لچکدار)
- صرف allow rules — کوئی explicit deny نہیں
- Resource سطح پر کام کرتے ہیں — granular

**NACLs**:

- Stateless (دونوں directions کے لیے explicit rules کی ضرورت ephemeral ports سمیت)
- واضح طور پر deny کر سکتے ہیں — معلوم-برے IPs کو block کرنے کے لیے مفید
- Subnet سطح پر کام کرتے ہیں — چوڑا stroke
- Numbered rules ترتیب کے مطابق evaluate — قابل پیش گوئی لیکن محتاط انتظام کی ضرورت

## خلاصہ

- **Security Groups** انفرادی resources کے لیے stateful virtual firewalls ہیں۔ صرف Allow rules۔ تمام rules evaluate کیے جاتے ہیں۔
- **NACLs** پورے subnets کے لیے stateless firewalls ہیں۔ Allow اور deny rules۔ Rules number ترتیب میں evaluate کیے جاتے ہیں۔
- **Stateful** کا مطلب ہے response ٹریفک خودبخود permitted ہے۔ **Stateless** کا مطلب ہے آپ کو دونوں directions میں ٹریفک واضح طور پر allow کرنی ہوگی۔
- Security groups رسائی کنٹرول کی primary layer ہیں۔ NACLs subnet-level controls اور explicit blocking کے لیے ایک اضافی layer ہیں۔
- جب NACL inbound ٹریفک allow کرے، آپ کو TCP response گزرنے کے لیے outbound ephemeral ports (1024-65535) بھی allow کرنی ہوں گی۔
- Security groups ایک دوسرے کو reference کر سکتے ہیں — "لوڈ بیلنسر security group سے" ٹریفک allow کرنا IP پتے track کرنے سے زیادہ قابل انتظام ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں (ڈومین ۱، ٹاسک ۱.۲)*

- **Stateful بمقابلہ stateless**: یہ فرق اس باب میں سب سے زیادہ tested تصور ہے۔ Security groups = stateful = response خودبخود allowed۔ NACLs = stateless = واضح طور پر response ٹریفک allow کرنی ہوگی۔
- **Security group rules**: کوئی explicit deny نہیں۔ جب کسی انسٹینس سے متعدد security groups attached ہوں، تمام rules کا union لاگو ہوتا ہے۔ تمام matching rules evaluate کیے جاتے ہیں۔
- **NACL rule order**: Rules سب سے کم نمبر سے سب سے زیادہ تک evaluate کیے جاتے ہیں۔ Rule 100 سے پہلے 200۔ پہلا match جیتتا ہے۔ نیچے `*` (asterisk) rule implicit deny ہے۔
- **Ephemeral ports**: کلاسک NACL غلطی ہے ports 1024-65535 outbound allow کرنا بھول جانا۔ اگر آپ کی NACL inbound HTTP (port 80) allow کرے لیکن outbound ephemeral ports نہ کرے، صارفین requests بھیج سکتے ہیں لیکن کبھی responses نہیں ملتے۔
- **Security group referencing**: آپ کسی دوسرے security group (صرف IP نہیں) سے ٹریفک allow کر سکتے ہیں۔ یہ intra-VPC ٹریفک کے لیے recommended pattern ہے۔
- **Default NACL بمقابلہ custom NACL**: Default NACL تمام ٹریفک allow کرتا ہے۔ ایک custom NACL (جو آپ بناتے ہیں) ڈیفالٹ کے مطابق تمام ٹریفک deny کرتا ہے۔ امتحانی منظر نامہ: "نیا NACL بنایا اور اب ٹریفک block ہے" → missing allow rules چیک کریں۔

## مشقیں

**مشق ۱ — یادداشت**

ایک developer port 443 پر ٹریفک allow کرتے ہوئے security group میں ایک inbound rule شامل کرتی ہے۔ کیا اسے سرور کے response کی اجازت دینے کے لیے ایک outbound rule بھی شامل کرنی ہوگی؟ کیوں یا کیوں نہیں؟

اگر اس کے بجائے وہ NACL میں port 443 پر ٹریفک allow کرتے ہوئے ایک inbound rule شامل کرے، تو کیا اسے ایک outbound rule کی ضرورت ہے؟ کیوں یا کیوں نہیں؟

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک کمپنی کے پاس public subnet میں EC2 انسٹینسز پر چلنے والی ویب ایپلیکیشن ہے۔ ایپلیکیشن انٹرنیٹ سے HTTPS ٹریفک (port 443) قبول کرتی ہے۔ صارفین رپورٹ کر رہے ہیں کہ وہ ایپلیکیشن سے جڑ سکتے ہیں لیکن responses نہیں مل سکتے — requests hang اور time out ہو جاتی ہیں۔

EC2 security group کے پاس 0.0.0.0/0 سے TCP 443 allow کرتے ہوئے ایک inbound rule ہے۔ Subnet کی NACL کے پاس 0.0.0.0/0 سے TCP 443 allow کرتے ہوئے ایک inbound rule (rule 100) اور 0.0.0.0/0 کو TCP 443 allow کرتے ہوئے ایک outbound rule (rule 100) ہے۔

مسئلے کا سب سے زیادہ ممکنہ سبب کیا ہے؟

A) Security group میں TCP 443 کے لیے outbound rule missing ہے  
B) NACL میں ephemeral ports (1024-65535) allow کرنے والی outbound rule missing ہے  
C) Security group میں ephemeral ports کے لیے inbound rule missing ہے  
D) EC2 انسٹینسز کے پاس Elastic IP پتے نہیں ہیں

**اشارہ ۱**: Security groups stateful ہیں — responses خودبخود allowed ہیں۔ NACLs stateless ہیں — نہیں ہوتے۔

**اشارہ ۲**: جب کوئی براؤزر port 443 پر ویب سرور سے جڑتا ہے، سرور کا response ایک random ephemeral port (1024-65535) پر واپس جاتا ہے، port 443 پر نہیں۔

**اشارہ ۳**: NACL کے پاس 443 کے لیے outbound rule ہے، لیکن response port 443 نہیں جاتا۔

**جواب**: B

**وضاحت**: NACL stateless ہے۔ جب صارفین port 443 پر سرور سے جڑتے ہیں، سرور کی TCP response ایک ephemeral port (randomly chosen from 1024-65535) پر واپس جاتی ہے۔ NACL outbound rule صرف port 443 allow کرتی ہے، اس لیے response ڈیفالٹ deny rule سے block ہو جاتا ہے۔ TCP 1024-65535 outbound allow کرنے والی outbound NACL rule شامل کرنا اسے ٹھیک کرے گا۔

**A کیوں نہیں؟** Security groups stateful ہیں — response ٹریفک outbound rules سے قطع نظر خودبخود permitted ہے۔ کوئی outbound security group rule ضروری نہیں۔

**C کیوں نہیں؟** Ephemeral ports outbound response ٹریفک کے لیے ہیں، inbound نہیں۔ صارفین کا inbound connection port 443 پر آتا ہے، جو پہلے سے allowed ہے۔

**D کیوں نہیں؟** Elastic IPs اثر انداز ہوتے ہیں کہ انسٹینسز کے عوامی IPs ہیں یا نہیں، اس سے نہیں کہ آیا established connections responses حاصل کر سکتی ہیں۔

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۱.۲*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Romanian IP attack کے بعد، Priya دو اضافی controls نافذ کرنا چاہتی ہے:

1. Public subnet میں کسی بھی resource تک پہنچنے سے پوری 185.0.0.0/8 IP range کو block کریں
2. یقینی بنائیں کہ database پر مشتمل private subnet کبھی بھی انٹرنیٹ سے بات نہیں کر سکتا، چاہے کوئی security group کو غلط طریقے سے ترتیب دے

آپ ہر ضرورت کے لیے کون سے ٹولز استعمال کریں گے، اور انہیں کیسے ترتیب دیں گے؟ کیا آپ دونوں کے لیے security groups استعمال کر سکتے ہیں؟ کیا آپ دونوں کے لیے NACLs استعمال کر سکتے ہیں؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد سمجھنا ہے کہ کون سا ٹول کون سے مسئلے کے لیے موزوں ہے۔)*

## پوسٹ کریڈٹس منظر

واقعہ محدود تھا۔ Compromised deploy key deactivate ہو گئی۔ Romanian IP range NACL پر block ہو گئی۔ پرانی script EC2 انسٹینس سے ہٹا دی گئی۔

Priya نے ایک incident report لکھی۔ اس نے ٹیم کے ساتھ شیئر کیا۔

Report کی آخری لائن: "Root cause: ایک decommissioned deployment pipeline کا active credential کبھی rotate یا revoke نہیں کیا گیا۔ Recommendation: automated credential rotation اور تمام IAM credentials کا باقاعدہ audit۔"

Leo نے اسے تین بار پڑھا۔

"مجھے وہ key rotate کرنی چاہیے تھی،" اس نے کہا۔

"ہاں،" Priya نے کہا۔

"ہم یہ دوبارہ کیسے یقینی بنائیں کہ ایسا نہ ہو؟"

"Automation،" اس نے کہا۔ "اور کوئی چیز جو watchers کو دیکھے۔"

اگلے باب میں: وہ lockbox جہاں Nimbus اپنے secrets رکھتا ہے — اور وہ rotation جو چوری شدہ keys کو بیکار بنا دیتی ہے۔
