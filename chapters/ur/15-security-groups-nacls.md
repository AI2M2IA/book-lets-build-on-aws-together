# باب ۱۵: دروازے کے محافظ

دفتر ایک منگل کی صبح خاموش تھا جب Priya نے VPC flow logs کھولے اور پڑھنا شروع کیا۔ کھڑکی کے باہر، شہر جاگ رہا تھا۔ اندر، اسکرین ایسی چیز دکھا رہی تھی جو وہاں نہیں ہونی چاہیے تھی: ایک EC2 انسٹینس سے 2:17 AM پر Romania میں ایک IP پتے کی طرف ایک outbound connection۔

Nimbus کے پہلے ورژن کی پرانی deploy key ابھی بھی active تھی۔ اس نے پچھلے ہفتے تین API calls کیے تھے۔ Leo کو نہیں پتہ تھا کس نے کیے۔

---

*IAM اصلاح نے access keys کو roles سے بدل دیا تھا۔ ہر سروس کے پاس اب بالکل وہ اجازتیں تھیں جن کی اسے ضرورت تھی۔ لیکن جب وہ کام ہو رہا تھا، ایک پرانا مسئلہ خاموشی سے بدتر ہو رہا تھا: ایک decommissioned deployment pipeline سے ایک active credential ابھی بھی زندہ تھا، اور کسی چیز نے اسے استعمال کیا تھا۔ IAM پرت مضبوط ہو گئی تھی۔ وہ نیٹ ورک controls جو نقصان کو محدود کر سکتے تھے، اسی توجہ کی ضرورت تھی۔*

---

Priya نے VPC flow logs کھولے — نیٹ ورک ٹریفک ریکارڈ جو VPC کے اندر اور باہر ہر کنکشن دکھاتے ہیں۔

"منگل کو 2:17 AM پر،" اس نے کہا، "پرانے API چلانے والی EC2 انسٹینس سے Romania میں ایک IP پتے کی طرف ایک outbound connection تھی۔"

"یہ ہمارا بنیادی ڈھانچہ نہیں ہے،" Leo نے کہا۔

"نہیں۔"

"تو کوئی ہماری EC2 انسٹینس پر تھا۔"

"یا کوئی چیز۔"

انہوں نے اسے واپس trace کیا: پرانی deploy key ایک چھوٹا script EC2 انسٹینس پر اپلوڈ کرنے کے لیے استعمال کی گئی تھی۔ Script نے adjacent servers پر ports scan کرنے کی کوشش کی تھی۔ زیادہ تر scans ناکام ہوئے تھے۔

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ۔" Leo نے تحقیق مکمل ہونے سے پہلے security group rule کا ایک fix deploy کر دیا تھا۔ Fix درست تھا، لیکن اس نے یہ Priya کے flow logs پڑھنے سے پہلے کیا تھا۔ اسے رک کر تصدیق کرنی پڑی کہ تبدیلی نے کسی غیر متوقع چیز کو متاثر نہیں کیا۔

"اگلی بار، تبدیلیاں push کرنے سے پہلے تحقیق بند ہونے تک انتظار کریں،" اس نے کہا۔

"Security groups نے انہیں block کیا،" Priya نے کہا۔ "Attacker ایک EC2 انسٹینس پر گیا۔ وہ دوسروں تک نہیں پہنچ سکے کیونکہ security groups نے صرف load balancer سے ٹریفک کی اجازت دی تھی۔"

"تو نقصان محدود رہا۔"

"کیونکہ ہمارے پاس صحیح طریقے سے ترتیب دیے گئے security groups تھے۔ تصور کریں اگر ہم نے port 5432 کو account میں کسی بھی EC2 انسٹینس کے لیے کھلا چھوڑا ہوتا۔"

Leo کو تصور کرنے کی ضرورت نہیں تھی۔ اس نے اصل سیٹ اپ میں وہ configuration دیکھی تھی۔

"کیا ہم نے سوچا ہے کہ اس کا کیا مطلب ہوتا؟" Priya نے جاری رکھا۔ "account میں کوئی بھی EC2 انسٹینس — بشمول وہ جس کے پاس compromised key تھی — براہ راست database سے جڑ سکتی تھی۔ من مانی SQL چلا سکتی تھی۔ ہر گاہک کی آرڈر کی تاریخ ڈاؤن لوڈ کر سکتی تھی۔ Tables گرا سکتی تھی۔"

"اس کے بجائے انہیں ہر بار جب انہوں نے کوشش کی reject کیا گیا،" Leo نے کہا۔

"ہاں۔ کیونکہ database security group صرف API security group سے connections قبول کرتا ہے۔ account میں کسی EC2 سے نہیں۔ کسی IP سے نہیں۔ خاص طور پر API security group سے۔"

"وہ ایک ڈیزائن کا فیصلہ،" Maya نے کہا، "ایک محدود واقعے اور ایک مکمل data breach کے درمیان فرق تھا۔"

"Security group ڈیزائن ایک checkbox نہیں ہے،" Priya نے کہا۔ "یہ نظام کی اصل سیکیورٹی ہے۔"

Rafael سن رہا تھا۔ "آپ کیسے سیکھتے ہیں کہ صحیح configuration کیا ہے؟ قواعد پہلے من مانی لگتے ہیں۔"

"آپ یہ فہرست بنا کر شروع کرتے ہیں کہ ہر component کو کیا کرنا ہے،" Priya نے کہا۔ "لوڈ بیلنسر کو کہیں سے بھی HTTPS قبول کرنی ہے۔ API سرور کو صرف لوڈ بیلنسر سے HTTP قبول کرنی ہے۔ Database کو صرف API سرور سے PostgreSQL قبول کرنی ہے۔ Redis کو صرف API سرور سے port 6379 قبول کرنی ہے۔ وہ تقاضے براہ راست inbound rules سے map ہوتے ہیں۔ باقی سب ڈیفالٹ کے مطابق denied ہے۔"

"اور outbound؟"

"Outbound وہ جگہ ہے جہاں لوگ سست ہو جاتے ہیں۔ زیادہ تر ٹیمیں outbound کو allow-all چھوڑ دیتی ہیں۔ اس کا مطلب ہے ایک compromised انسٹینس کسی بھی چیز کو کال کر سکتی ہے۔ ہم اسے سخت کریں گے۔"

**نیٹ ورک Security کی دو Layers**

VPC میں، آپ کے پاس نیٹ ورک ٹریفک کنٹرول کرنے کے دو الگ ٹولز ہیں:

**Security Groups**: انفرادی resources سے attached ورچوئل firewalls (EC2 انسٹینسز، RDS databases، load balancers، VPC میں Lambda functions)۔ وہ resource کی سطح پر کام کرتے ہیں۔

**Network ACLs (NACLs)**: Subnets سے attached firewall قواعد۔ وہ subnet boundary پر کام کرتے ہیں — اس subnet کے کسی بھی resource تک پہنچنے سے پہلے ٹریفک پر۔

دونوں کو سمجھنے کے لیے ایک اہم فرق سمجھنا ضروری ہے: **stateful بمقابلہ stateless**۔

**Stateful: Security Groups**

ایک security group **stateful** ہے۔

جب آپ ایک مخصوص port پر inbound ٹریفک کی اجازت دیتے ہیں، تو response ٹریفک خودبخود باہر جانے کی اجازت ہوتی ہے، چاہے اس کے لیے کوئی واضح outbound rule نہ ہو۔

جب آپ کسی destination کو outbound ٹریفک کی اجازت دیتے ہیں، تو واپس آنے والا response خودبخود اندر آنے کی اجازت ہوتا ہے۔

ایک دفتری عمارت میں ایک stateful security guard کی طرح سوچیں۔ آپ داخل ہونے کے لیے اپنا badge دکھاتے ہیں۔ بعد میں باہر جاتے ہیں۔ Guard کو آپ کو جاتے وقت دوبارہ چیک کرنے کی ضرورت نہیں — سسٹم جانتا ہے کہ آپ کو اندر آنے دیا گیا، اور آپ کو جانے کی اجازت ہے۔

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
- Security groups صرف ٹریفک **allow** کر سکتے ہیں — آپ explicit deny rules نہیں بنا سکتے

**Stateless: Network ACLs**

ایک NACL **stateless** ہے۔

جب آپ port 8080 پر inbound ٹریفک کی اجازت دیتے ہیں، تو یہ صرف inbound کو cover کرتا ہے۔ Response (ephemeral ports پر outbound ٹریفک) کو ایک outbound rule کے ساتھ واضح طور پر allow کرنا ضروری ہے۔

ایک metal detector کی طرح سوچیں۔ آپ داخل ہوتے وقت اس سے گزرتے ہیں۔ Metal detector کو پتہ نہیں کہ آپ پہلے سے گزر چکے ہیں — آپ کو جاتے وقت دوبارہ گزرنا ہوگا۔

**NACL rules numbered ہیں اور ترتیب کے مطابق evaluate کیے جاتے ہیں۔** پہلا matching rule جیتتا ہے۔ Rule 100، rule 200 سے پہلے evaluate ہوتی ہے۔ اگر rule 100 ٹریفک deny کرے اور rule 200 اسے allow کرے، تو ٹریفک denied ہے۔

NACLs واضح طور پر ٹریفک **deny** کر سکتے ہیں — security groups کے برعکس، جو صرف allow کر سکتے ہیں۔ یہ انہیں مخصوص IP ranges block کرنے کے لیے مفید بناتا ہے۔

**Default NACL رویہ:**

- Default NACL (آپ کے VPC کے ساتھ بنایا گیا) تمام inbound اور outbound ٹریفک allow کرتا ہے
- ایک custom NACL ڈیفالٹ کے مطابق تمام ٹریفک deny کرتا ہے (آپ کو جو چاہیں واضح طور پر allow کرنا ہوگا)

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

"رکیں — لیکن ہم *کیوں* اسے اس طرح کریں؟" Maya نے پوچھا۔ "دو الگ ٹولز کیوں — security groups *اور* NACLs — اگر security groups پہلے سے کام کرتے ہیں؟ اضافی پیچیدگی کا کیا فائدہ؟"

جواب یہ ہے کہ وہ مختلف سطحوں پر کام کرتے ہیں اور مختلف صلاحیتیں رکھتے ہیں۔ Security groups انفرادی resources کی حفاظت کرتے ہیں اور صرف ٹریفک allow کر سکتے ہیں۔ NACLs پورے subnets کی حفاظت کرتے ہیں اور واضح طور پر deny کر سکتے ہیں۔ دونوں رکھنے کا مطلب ہے کہ آپ resource کی سطح پر باریک allow rules اور subnet کی سطح پر وسیع deny rules لاگو کر سکتے ہیں — ایک دوسرے میں مداخلت کیے بغیر۔

رسائی کنٹرول کی primary پرت کے لیے **security groups** استعمال کریں۔ وہ manage کرنے میں آسان، stateful (ephemeral ports بھولنے سے حادثاتی blocks کا کم خطرہ)، اور دوسرے security groups کا حوالہ دینے کی حمایت کرتے ہیں۔

Subnet کی سطح کے controls کے لیے **NACLs** استعمال کریں، خاص طور پر:

- **Explicit deny rules**: ایک مخصوص IP پتہ یا range کو ایک پورے subnet تک پہنچنے سے block کریں
- **Emergency blocking**: کوئی IP فعال طور پر attack کر رہا ہے — کسی بھی resource تک پہنچنے سے پہلے پورے subnet کو block کرنے کے لیے ایک NACL deny rule شامل کریں

آپ سوچ رہے ہوں گے: اگر security groups stateful ہیں اور ڈیفالٹ کے مطابق تمام inbound block کرتے ہیں، تو آپ کو دراصل NACLs کی ضرورت کب پڑے گی؟ Security groups زیادہ تر معاملات اچھی طرح سنبھالتے ہیں۔ لیکن ایک چیز ہے جو وہ نہیں کر سکتے: واضح طور پر deny کرنا۔ ایک security group صرف ٹریفک allow کر سکتا ہے — اگر کوئی rule میل نہ کھائے، تو ٹریفک ڈیفالٹ کے مطابق denied ہے۔ آپ ایک rule شامل نہیں کر سکتے جو کہے "اس مخصوص IP کو block کریں۔" اس کے لیے، آپ کو ایک NACL چاہیے: ایک numbered deny rule جو ایک مخصوص پتے کی range کو subnet میں کسی بھی resource تک پہنچنے سے پہلے روک دے۔ NACLs ہنگامی ردعمل (ایک فعال حملہ آور کو block کرنا) اور ان subnet-level حدود کو نافذ کرنے کے لیے سب سے مفید ہیں جو انفرادی resource configuration پر منحصر نہیں ہونی چاہئیں۔

"تو security group باریک کنٹرول ہے،" Maya نے کہا، "اور NACL وسیع stroke ہے؟"

"Security groups انفرادی resources کی حفاظت کرتے ہیں،" Priya نے تصدیق کی۔ "NACLs پورے subnets کی حفاظت کرتے ہیں۔ جب آپ کسی IP کو آپ کے نیٹ ورک پر کسی چیز تک پہنچنے سے روکنا چاہتے ہیں، NACL۔ جب آپ صرف لوڈ بیلنسر کو API سرور تک پہنچنے کی اجازت دینا چاہتے ہیں، security group۔"

"کیا ہم نے سوچا ہے کہ کیا ہوتا ہے اگر حملہ آور کسی مختلف IP کے ساتھ واپس آئے؟" Priya نے کہا۔ "NACL ایک range block کرتا ہے۔ وہ دوسری پر منتقل ہو جاتے ہیں۔"

"یہی GuardDuty کے لیے ہے،" Leo نے کہا۔ "رویے پر مبنی detection۔ اگر وہی script کسی نئے IP سے چلے، تو ٹریفک کا نمونہ ایک جیسا لگتا ہے۔"

"ہم وہاں پہنچیں گے،" Priya نے کہا۔ "پہلے پہلی چیزیں۔"

"اس سب پر فی مہینہ کتنا خرچ آتا ہے؟" Tom نے پوچھا۔

Security groups اور NACLs خود مفت ہیں۔ AWS security groups کی تعداد، rules کی تعداد، یا NACL entries کی تعداد کے لیے چارج نہیں کرتا۔ لاگت کا غور بالواسطہ ہے: سخت outbound security group rules NAT Gateway سے کم ٹریفک route کر سکتے ہیں، data processing charges کم کرتے ہوئے۔

"تو security controls مفت ہیں،" Rafael نے کہا۔ "لاگت وہ بنیادی ڈھانچہ ہے جو انہیں سپورٹ کرتا ہے۔"

"درست۔ اعلیٰ دستیابی کے لیے NAT Gateways۔ ان سروسز کے لیے Interface VPC Endpoints جو ورنہ NAT سے گزرتیں۔ ان کی لاگتیں ہیں۔ security group rules خود نہیں رکھتے۔"

**اسے اکٹھا کرنا: Layered Defense**

واقعے کے بعد، Priya نے Nimbus defense layers وائٹ بورڈ پر کھینچیں:

```
انٹرنیٹ
  ↓
CloudFront + Shield (DDoS absorption)
  ↓
WAF (application-layer filtering)
  ↓
Internet Gateway
  ↓
public subnet پر NACL (subnet-level rules، emergency blocking)
  ↓
ALB Security Group (کہیں سے بھی HTTPS)
  ↓
private app subnet پر NACL
  ↓
EC2 API Security Group (صرف ALB SG سے port 8080)
  ↓
private data subnet پر NACL
  ↓
RDS Security Group (صرف API SG سے port 5432)
```

"ہر پرت یہ فرض کرتی ہے کہ پچھلی ناکام ہو سکتی ہے،" اس نے کہا۔ "Database یہ بھروسہ نہیں کرتا کہ نیٹ ورک پرت نے حملہ آور کو روک دیا۔ EC2 انسٹینس یہ بھروسہ نہیں کرتا کہ ALB نے حملہ آور کو روک دیا۔ ہر پرت اپنے قواعد آزادانہ طور پر نافذ کرتی ہے۔"

"گہرائی میں دفاع،" Maya نے کہا۔

"گہرائی میں دفاع۔ ایک پرت سے گزرنے والے حملہ آور کو پھر بھی اگلی کا سامنا ہوتا ہے۔ کوئی واحد غلط ترتیب تباہ کن نہیں۔ اس کا مطلب ہے ایک پرت ناکام ہوتی ہے، اور باقی قائم رہتی ہیں۔"

Leo نے خاکہ دیکھا۔ حملہ آور نے ایک EC2 انسٹینس compromise کی تھی۔ وہ credentials پرت سے گزر گئے تھے۔ لیکن ہر بعد کی پرت قائم رہی تھی۔

عملی طور پر گہرائی میں دفاع ایسا ہی نظر آتا تھا۔

**واقعہ: Layers نے کیا پکڑا**

Romanian IP attack کی طرف واپس:

**کیا ہوا**: حملہ آور نے compromised deploy key کا استعمال کرتے ہوئے ایک EC2 انسٹینس پر ایک scanning script اپلوڈ کی۔ Script نے دوسری سروسز سے جڑنے کی کوشش کی۔

**کس نے انہیں روکا**:

- RDS security group نے صرف API EC2 security group سے port 5432 پر inbound allow کیا۔ Script ایک scanning tool سے database تک نہیں پہنچ سکی — یہ صحیح security group attach نہیں کر رہی تھی۔
- ElastiCache security group نے صرف API EC2 security group سے port 6379 پر inbound allow کیا۔
- دوسری EC2 انسٹینسز نے صرف bastion host security group سے SSH allow کیا۔

**کس نے انہیں نہیں روکا**: 

- EC2 انسٹینس کے outbound rules نے 0.0.0.0/0 کو HTTPS allow کیا (package downloads کے لیے ضروری)۔ Script نے حملہ آور کے server پر outbound connections بنانے کے لیے اسے استعمال کیا۔

واقعے کے بعد، Priya نے اضافہ کیا:

- Romanian IP range کو block کرنے والا ایک NACL rule
- EC2 انسٹینسز پر ایک زیادہ restrictive outbound rule (صرف مخصوص معلوم-اچھی destinations کی اجازت دی)
- ایک چیک کہ ہر انسٹینس پر **IMDSv2 نافذ تھا** (`HttpTokens=required`) — script انسٹینس *پر* چلی تھی، جس کا مطلب ہے یہ instance role کے temporary credentials کے لیے metadata service سے query کر سکتی تھی۔ IMDSv2 باب ۴ میں فعال کیا گیا تھا؛ Priya نے تصدیق کی کہ یہ ہر جگہ اب بھی درکار ہے، کیونکہ کوڈ execution والا ایک حملہ آور علاوہ IMDSv1 برابر ہے چوری شدہ AWS credentials۔

---

**Flow Logs پڑھنا: Priya نے کیا دیکھا**

تحقیق VPC flow logs سے شروع ہوئی۔ Priya نے CloudWatch Logs Insights کھولا اور پچھلے 48 گھنٹوں کے flow log group کے خلاف ایک query چلائی:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` compromised EC2 انسٹینس تھی۔ REJECT filter نے block کی گئی connection کی کوششیں دکھائیں۔

نتائج:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # دوسری EC2 انسٹینس — SSH blocked
10.0.10.7 → 10.0.10.9  port 22    REJECT   # ایک اور EC2 — SSH blocked
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — security group سے blocked
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # RDS replica — blocked
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — blocked
```

Scan نے ہر داخلی سروس کو نشانہ بنایا۔ ہر کوشش reject ہوئی۔ Security group ڈیزائن قائم رہا۔

لیکن ایک outbound ACCEPT entry بھی تھی:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

یہ data exfiltration کی کوشش تھی — Romanian IP کو HTTPS پر 2.8 کلوبائٹ بھیجے گئے۔ Security group نے جائز package downloads کے لیے HTTPS outbound allow کیا۔ حملہ آور نے وہ rule استعمال کیا۔

"Security groups نے lateral movement روکا،" Priya نے ٹیم کو logs سمجھاتے ہوئے کہا۔ "لیکن outbound rule بہت permissive تھی۔ ہم نے کسی بھی destination کو HTTPS allow کیا۔ ہمیں HTTPS صرف معلوم AWS endpoints — CloudWatch، Secrets Manager، S3 — اور package repository CDNs کو allow کرنی چاہیے۔"

اس نے اپڈیٹ شدہ security group outbound rules دکھائیں:

```
TCP 443 → pl-63a5400a (AWS S3 gateway endpoint prefix list)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (AWS package repos — وقت کے ساتھ narrows)
```

"یہ عام HTTPS outbound rule کو ختم کر دیتا ہے۔ Outbound HTTPS اب صرف معلوم-اچھی destinations کو جاتا ہے۔"

"تیسرے فریق APIs کو کال کرنے والے Lambda functions کا کیا؟" Leo نے پوچھا۔

"وہ NAT Gateway کے ذریعے جاتے ہیں، جس کا اپنا وقف شدہ outbound rule ہے،" Priya نے کہا۔ "Lambda EC2 security group استعمال نہیں کرتا۔ مختلف network interface، مختلف rule set۔"

---

**Stateless Debugging کی کہانی**

واقعے کے دو ہفتے بعد، Rafael — ابھی اپنے پہلے مہینے میں — ایک نئی data pipeline سیٹ کرنے میں مدد کر رہا تھا۔ اس میں VPC میں ایک Lambda function شامل تھا جسے EC2 پر چلنے والی ایک داخلی API کال کرنی تھی۔

Lambda function time out ہو گیا۔ ہر کال time out ہو گئی۔

Rafael نے security groups چیک کیے۔ Lambda security group کے پاس EC2 security group کو TCP 8080 کے لیے ایک outbound rule تھی۔ EC2 security group کے پاس Lambda security group سے TCP 8080 کے لیے ایک inbound rule تھی۔ Rules درست لگتے تھے۔

وہ Leo کی طرف مڑا۔ "Security groups ٹھیک لگتے ہیں۔ یہ time out کیوں ہو رہا ہے؟"

Leo نے subnet configuration دیکھی۔ Lambda function ایک private subnet میں تھا۔ Subnet کی ایک custom NACL تھی جو Priya نے security hardening کے دوران لاگو کی تھی۔

اس نے NACL outbound rules دیکھیں:

```
Rule 100: TCP 443  → 0.0.0.0/0  ALLOW
Rule 110: TCP 5432 → 10.0.20.0/24 ALLOW
Rule *:   All      → 0.0.0.0/0  DENY
```

"NACL HTTPS outbound اور PostgreSQL outbound allow کرتی ہے،" Leo نے کہا۔ "یہ TCP 8080 outbound allow نہیں کرتی۔"

"Security group اسے allow کرتا ہے،" Rafael نے کہا۔

"NACL نہیں کرتی۔ اور NACL stateless ہے۔ چاہے Lambda function کا security group outbound connection allow کرے، subnet boundary پر NACL پھر بھی outbound ٹریفک evaluate کرتی ہے۔ NACL Lambda کی کال کو subnet چھوڑنے سے پہلے block کر رہی ہے۔"

"لیکن اگر میں NACL میں TCP 8080 outbound کے لیے ALLOW شامل کروں—"

"آپ کو ephemeral ports inbound کے لیے بھی ALLOW شامل کرنا ہوگا،" Leo نے کہا۔ "EC2 انسٹینس سے response 1024 اور 65535 کے درمیان ایک random port پر واپس آتا ہے۔ اگر NACL کے inbound rules انہیں allow نہ کریں، تو response واپسی کے سفر پر block ہو جاتا ہے۔"

Rafael نے NACL اپڈیٹ کی:

```
Rule 100:  TCP 443       → 0.0.0.0/0      ALLOW  (outbound)
Rule 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (EC2 subnet کو outbound)
Rule 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (DB subnet کو outbound)
Rule *:    All           → 0.0.0.0/0      DENY
```

اور inbound طرف پر:

```
Rule 100:  TCP 1024-65535 from 10.0.10.0/24  ALLOW  (EC2 سے return traffic)
Rule *:    All                               DENY
```

Lambda function فوری طور پر جڑ گیا۔

"اسی لیے لوگ NACLs سے نفرت کرتے ہیں،" Rafael نے کہا۔

"اسی لیے آپ کو انہیں سمجھنے کی ضرورت ہے،" Priya نے کہا۔ "وہ جو bugs پیدا کرتے ہیں بالکل وہی bugs ہیں جنہیں روکنے کے لیے وہ ڈیزائن کیے گئے ہیں — غیر متوقع ٹریفک flows۔ Stateless ماڈل سمجھنا آپ کو بالکل بتاتا ہے کہ جب کوئی کنکشن پراسرار طور پر ناکام ہو تو کہاں دیکھنا ہے۔"

"Security group stateful — return traffic خودکار۔ NACL stateless — return traffic کو explicit rules چاہئیں،" Rafael نے دہرایا۔

"اسے اس وقت تک کہیں جب تک یہ آپ کے سوچنے کے طریقے کا حصہ نہ بن جائے،" Priya نے کہا۔

---

**NACL Emergency Blocking: /24 کا قاعدہ**

حملہ آور کے source IP range کی شناخت کے بعد، Priya کا ردعمل فوری تھا: ایک NACL deny rule شامل کریں۔

لیکن اس نے صرف واحد IP block نہیں کیا۔ اس نے پورا `/24` block کیا — وہ 256-پتے کا subnet جس سے حملہ آور کام کر رہا تھا۔

"پورا /24 کیوں؟" Leo نے پوچھا۔

"کیونکہ انفرادی IP blocking ایک ہارنے والا کھیل ہے۔ حملہ آور ایک range کے اندر متعدد IPs استعمال کرتے ہیں، ایک block ہونے پر ان میں گھومتے ہیں۔ /24 block کرنا اسے مشکل بناتا ہے — انہیں ایک مختلف پتے کے block پر منتقل ہونا پڑے گا، جو انہیں وقت اور محنت خرچ کرتا ہے۔"

NACL rule:

```
Rule 90:  ALL from 185.220.101.0/24 → DENY
```

Rule 90 کسی بھی allow rules (جو rule 100 سے شروع ہوتی ہیں) سے پہلے evaluate ہوتی ہے۔ کسی allow rule پر غور کرنے سے پہلے پوری range block ہو جاتی ہے۔

"اور یہ subnet میں ہر resource پر لاگو ہوتا ہے؟" Leo نے پوچھا۔

"ہر resource پر۔ یہی NACL کا مقصد ہے — یہ ٹریفک کے کسی انفرادی resource کے security group تک پہنچنے سے پہلے لاگو ہوتا ہے۔ rule 90 پر ایک NACL deny کا مطلب ہے کہ packet کبھی security group evaluation تک نہیں پہنچتا۔"

"کیا ہم یہ ایک security group سے کر سکتے ہیں؟"

"نہیں۔ Security groups صرف ٹریفک allow کر سکتے ہیں۔ کوئی deny rule نہیں۔ اگر آپ ایک مخصوص IP کو subnet میں کسی resource تک پہنچنے سے block کرنا چاہتے ہیں، تو NACL واحد آپشن ہے۔"

یہ NACL deny rules کا بنیادی استعمال کا کیس ہے: فعال حملوں کا ہنگامی ردعمل۔ Security group بنیادی کنٹرول mechanism ہے۔ NACL emergency brake ہے۔

---

**Security Group ڈیزائن Patterns: ID سے Reference**

"کیا ہم نے سوچا ہے کہ کیا ہوتا ہے جب ہماری EC2 انسٹینسز بدلی جاتی ہیں؟" Priya نے پوچھا۔ "Auto Scaling پرانی انسٹینسز terminate کرتا ہے اور نئی launch کرتا ہے۔ نئی انسٹینسز کو نئے نجی IP پتے ملتے ہیں۔"

"اگر security group rules IP پتوں کا حوالہ دیں،" Leo نے آہستہ آہستہ کہا، "تو ہمیں ہر بار جب کوئی انسٹینس بدلے rules اپڈیٹ کرنی پڑیں گی۔"

"بالکل۔ اسی لیے آپ intra-VPC ٹریفک کے لیے security group rules میں IP پتوں کا حوالہ نہیں دیتے۔"

Security groups IP پتوں کے بجائے دوسرے security groups کا حوالہ دے سکتے ہیں۔ جب کوئی rule کہتی ہے "لوڈ بیلنسر security group سے inbound allow کریں،" تو اس کا مطلب ہے "کسی بھی resource سے ٹریفک allow کریں جس سے لوڈ بیلنسر security group attached ہے۔" Auto Scaling ہر ایک کو ایک نئے IP کے ساتھ ایک ہزار نئی انسٹینسز launch کر سکتا ہے، اور rule درست رہتی ہے۔

Nimbus security group ڈھانچہ:

```
nimbus-alb-sg (Load Balancer)
  - Inbound: 0.0.0.0/0 سے TCP 443
  - Inbound: 0.0.0.0/0 سے TCP 80

nimbus-api-sg (EC2 API instances)
  - Inbound: nimbus-alb-sg سے TCP 8080
  - Inbound: nimbus-bastion-sg سے TCP 22
  - Outbound: nimbus-rds-sg کو TCP 5432
  - Outbound: nimbus-redis-sg کو TCP 6379

nimbus-rds-sg (RDS)
  - Inbound: nimbus-api-sg سے TCP 5432

nimbus-redis-sg (ElastiCache)
  - Inbound: nimbus-api-sg سے TCP 6379

nimbus-bastion-sg (Bastion Host)
  - Inbound: <office VPN IP> سے TCP 22
```

داخلی ٹریفک کے لیے کوئی IP پتے نہیں۔ صرف security group IDs۔ جب کوئی انسٹینس بدلی جاتی ہے، تو security group membership خودبخود نئی انسٹینس کو منتقل ہو جاتی ہے۔

"اور ان microservices کے لیے جن کی ہم منصوبہ بندی کر رہے ہیں؟" Rafael نے پوچھا۔ "ہمارے پاس بالآخر ایک درجن سروسز ہوں گی۔ ہر ایک کو کچھ دوسروں سے بات کرنی ہے، لیکن تمام دوسروں سے نہیں۔"

"ہر سروس کو اپنا security group ملتا ہے،" Priya نے کہا۔ "Service A کا security group ہر اس سروس کے inbound rules میں reference ہوتا ہے جسے Service A کو کال کرنے کی اجازت ہے۔ جن سروسز کو بات نہیں کرنی چاہیے وہ بس ایک دوسرے کے security groups کا حوالہ نہیں دیتیں۔"

یہ microservices کے لیے **hub-and-spoke security group pattern** ہے۔ ایک shared database security group کے پانچ مختلف service security groups سے inbound rules ہوتے ہیں۔ اگر ایک چھٹی سروس کو database رسائی چاہیے، تو آپ اس کا security group database کے inbound rule میں شامل کرتے ہیں۔ اگر رسائی ہٹانی ہو، تو آپ reference ہٹا دیتے ہیں۔ کوئی IP management نہیں۔ Decommissioned servers کی طرف اشارہ کرنے والے کوئی پرانے rules نہیں۔

"Security group ہی identity ہے،" Priya نے کہا۔ "IP پتہ scheduling کا ایک اتفاق ہے۔"

---

**Least-Privilege Firewall: نظم و ضبط**

"کیا ہم نے سوچا ہے کہ outbound rules کے لیے صحیح posture کیا ہے؟" Priya نے واقعے کے بعد کے review کے دوران پوچھا۔

زیادہ تر ٹیمیں EC2 security group outbound rules کو ڈیفالٹ پر چھوڑ دیتی ہیں: تمام outbound allow۔ یہ آسان ہے — ایپلیکیشن کسی بھی چیز کو کال کر سکتی ہے — لیکن یہ least privilege نہیں ہے۔

Priya کا اصول: outbound rules inbound rules جتنے ہی مخصوص ہونے چاہئیں۔

سختی کے بعد Nimbus API security group outbound rules:

```
TCP 5432 → nimbus-rds-sg       (RDS کو PostgreSQL)
TCP 6379 → nimbus-redis-sg     (ElastiCache کو Redis)
TCP 443  → s3.amazonaws.com prefix list    (S3 gateway endpoint)
TCP 443  → secretsmanager endpoint         (Secrets Manager)
TCP 443  → logs endpoint                   (CloudWatch Logs)
```

کوئی "تمام outbound allow" نہیں۔ ہر destination نامزد۔

"یہ بہت زیادہ maintenance ہے،" Leo نے کہا۔

"یہ allow-all سے زیادہ maintenance ہے،" Priya نے تسلیم کیا۔ "یہ ایک data breach سے کم صفائی ہے۔ EC2 انسٹینس کو compromise کرنے والا حملہ آور زیادہ ڈیٹا exfiltrate کر سکتا تھا اگر outbound rules کھلے ہوتے۔ انہوں نے HTTPS-to-anywhere rule استعمال کیا کیونکہ یہ موجود تھی۔"

"اور مخصوص outbound rules کے ساتھ، ایک compromised انسٹینس بھی صرف منظور شدہ destinations کو ڈیٹا بھیج سکتی ہے۔"

"بالکل۔ Security group containment کی آخری لائن بن جاتا ہے، نہ صرف دفاع کی پہلی لائن۔"

---

## خوبیاں اور حدود

**Security Groups**:

- Stateful (ephemeral port سردردی نہیں)
- دوسرے security groups کا حوالہ دے سکتے ہیں (IPs سے زیادہ لچکدار)
- صرف allow rules — کوئی explicit deny نہیں
- Resource کی سطح پر کام کرتے ہیں — granular
- Rules فوری لاگو ہوتے ہیں — کوئی ترتیب نہیں، کوئی priority نہیں
- ایک resource سے متعدد security groups attach کیے جا سکتے ہیں — سب کے rules ملا دیے جاتے ہیں

**NACLs**:

- Stateless (ephemeral ports سمیت دونوں directions کے لیے explicit rules کی ضرورت)
- واضح طور پر deny کر سکتے ہیں — معلوم-برے IPs block کرنے کے لیے مفید
- Subnet کی سطح پر کام کرتے ہیں — وسیع stroke
- Numbered rules ترتیب کے مطابق evaluate — قابل پیش گوئی لیکن محتاط انتظام کی ضرورت
- ٹریفک کے subnet میں کسی resource تک پہنچنے سے پہلے لاگو ہوتے ہیں — دفاع کی پہلی لائن
- پورے subnet میں emergency IP blocking کے لیے مؤثر

**کون سا ٹول کہاں موزوں ہے**:

ڈیفالٹ کے مطابق ہر چیز کے لیے security groups استعمال کریں۔ NACLs تب شامل کریں جب آپ کو explicit deny rules چاہئیں — ایک IP range block کرنا، انفرادی resource configuration سے قطع نظر subnet کی سطح پر ایک port block کرنا، یا یہ نافذ کرنا کہ ایک data subnet کبھی کسی مخصوص source سے ٹریفک وصول نہ کرے۔ NACLs security groups کا متبادل نہیں ہیں؛ وہ ان حالات کے لیے ایک ضمیمہ ہیں جہاں security groups کا allow-only ڈیزائن ناکافی ہو۔

## خلاصہ

Romanian IP واقعہ ان security controls سے محدود رہا تھا جو پہلے سے موجود تھے — قسمت سے نہیں، بلکہ ڈیزائن سے۔ Security groups نے VPC کے اندر lateral movement روکا تھا۔ واقعے کے بعد، NACLs نے subnet boundary پر حملہ آور کی IP range کو واضح طور پر block کرنے کی صلاحیت شامل کی۔ VPC flow logs نے حملے کو نظر آنے والا بنایا۔ دو ٹولز، دو layers، دو مختلف کام — اور یہ ثابت کرنے کے لیے logging کہ کیا ہوا۔

- **Security Groups** انفرادی resources کے لیے stateful virtual firewalls ہیں۔ صرف Allow rules۔ تمام rules بیک وقت evaluate کیے جاتے ہیں۔
- **NACLs** پورے subnets کے لیے stateless firewalls ہیں۔ Allow اور deny rules۔ Rules number ترتیب میں evaluate کیے جاتے ہیں — پہلا match جیتتا ہے۔
- **Stateful** کا مطلب ہے response ٹریفک خودبخود permitted ہے۔ **Stateless** کا مطلب ہے آپ کو دونوں directions میں ٹریفک واضح طور پر allow کرنی ہوگی، ephemeral return ports سمیت۔
- Security groups آپ کی primary رسائی کنٹرول پرت ہیں۔ NACLs subnet کی سطح کا override ہیں — خاص طور پر emergency blocking کے لیے۔
- جب کوئی NACL inbound ٹریفک allow کرے، تو آپ کو TCP response گزرنے کے لیے outbound ephemeral ports (1024-65535) بھی allow کرنی ہوں گی۔
- intra-VPC ٹریفک کے لیے IP پتے نہیں بلکہ **security groups کا ID سے حوالہ دیں**۔ Auto Scaling انسٹینسز بدلتا ہے؛ security group membership خودبخود منتقل ہو جاتی ہے۔
- EC2 انسٹینسز پر **مخصوص outbound rules** محدود کرتے ہیں کہ ایک compromised انسٹینس کیا کر سکتی ہے — least-privilege firewall۔
- Security groups اور NACLs دراصل کیا کر رہے ہیں یہ دیکھنے کے لیے flow logs استعمال کریں۔ Rules نظریہ ہیں۔ Logs ثبوت ہیں۔

## امتحانی نکات

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں (ڈومین ۱، ٹاسک ۱.۲)*

- **Stateful بمقابلہ stateless**: یہ فرق اس باب میں سب سے زیادہ tested تصور ہے۔ Security groups = stateful = response خودبخود allowed۔ NACLs = stateless = آپ کو واضح طور پر response ٹریفک allow کرنی ہوگی۔
- **Security group rules**: کوئی explicit deny نہیں۔ جب کسی انسٹینس سے متعدد security groups attached ہوں، تو تمام rules کا union لاگو ہوتا ہے۔ تمام matching rules بیک وقت evaluate کیے جاتے ہیں۔
- **NACL rule order**: Rules سب سے کم نمبر سے سب سے زیادہ تک evaluate کیے جاتے ہیں۔ Rule 100 سے پہلے 200۔ پہلا match جیتتا ہے۔ نیچے `*` (asterisk) rule implicit deny ہے۔ rule 90 پر ایک deny rule شامل کرنا 100 پر کسی allow rule سے پہلے block کرتا ہے۔
- **Ephemeral ports**: کلاسک NACL غلطی ہے ports 1024-65535 پر outbound allow کرنا بھول جانا۔ اگر آپ کی NACL inbound HTTP (port 80) allow کرے لیکن outbound ephemeral ports نہ کرے، تو صارفین requests بھیج سکتے ہیں لیکن کبھی responses نہیں ملتے۔ یہ سب سے عام NACL امتحانی منظر نامہ ہے۔
- **Security group referencing**: آپ کسی دوسرے security group (صرف IP نہیں) سے ٹریفک allow کر سکتے ہیں۔ یہ intra-VPC ٹریفک کے لیے recommended pattern ہے۔ امتحان اکثر "ALB security group سے inbound allow کریں" کو EC2 رسائی محدود کرنے کے لیے درست جواب کے طور پر استعمال کرتا ہے۔
- **Default NACL بمقابلہ custom NACL**: Default NACL تمام ٹریفک allow کرتا ہے۔ ایک custom NACL (جو آپ بناتے ہیں) ڈیفالٹ کے مطابق تمام ٹریفک deny کرتا ہے۔ امتحانی منظر نامہ: "ایک نیا NACL بنایا اور اب ٹریفک block ہے" → missing allow rules چیک کریں۔
- **حملہ آور کا IP block کرنا**: Security groups مخصوص IPs block نہیں کر سکتے (صرف allow)۔ NACLs ایک مخصوص IP یا CIDR کو واضح طور پر deny کر سکتے ہیں۔ امتحانی منظر نامہ: "ایک مخصوص IP کو subnet میں کسی resource تک پہنچنے سے block کریں" → NACL deny rule۔
- **Connection failures کی debugging**: ترتیب چیک کریں: source پر security group (outbound) → destination پر security group (inbound) → source subnet پر NACL (outbound + ephemeral ports) → destination subnet پر NACL (inbound)۔ زیادہ تر امتحانی connection failures ایک missing NACL outbound rule یا missing ephemeral port allowance کی وجہ سے ہوتی ہیں۔
- **متعدد subnets اور NACLs**: ایک NACL اس سے منسلک تمام subnets پر لاگو ہوتا ہے۔ ایک subnet صرف ایک NACL سے منسلک ہو سکتا ہے۔ امتحان پوچھ سکتا ہے کہ جب کسی مخصوص subnet کی ٹریفک متاثر ہو تو کون سا NACL اپڈیٹ کرنا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

ایک developer port 443 پر ٹریفک allow کرتے ہوئے ایک security group میں ایک inbound rule شامل کرتی ہے۔ کیا اسے سرور کے response کی اجازت دینے کے لیے ایک outbound rule بھی شامل کرنی ہوگی؟ کیوں یا کیوں نہیں؟

اگر اس کے بجائے وہ ایک NACL میں port 443 پر ٹریفک allow کرتے ہوئے ایک inbound rule شامل کرے، تو کیا اسے ایک outbound rule کی ضرورت ہے؟ کیوں یا کیوں نہیں؟

**اشارہ**: باب کی مثالوں کی طرف واپس سوچیں — کیا ہر ایک وہ security guard ہے جو آپ کو اندر آنے دینا یاد رکھتا ہے، یا وہ metal detector جس سے آپ کو جاتے وقت دوبارہ گزرنا پڑتا ہے؟

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی کے پاس ایک public subnet میں EC2 انسٹینسز پر چلنے والی ایک ویب ایپلیکیشن ہے۔ ایپلیکیشن انٹرنیٹ سے HTTPS ٹریفک (port 443) قبول کرتی ہے۔ صارفین رپورٹ کر رہے ہیں کہ وہ ایپلیکیشن سے جڑ سکتے ہیں لیکن responses وصول نہیں کر سکتے — requests hang اور time out ہو جاتی ہیں۔

EC2 security group کے پاس 0.0.0.0/0 سے TCP 443 allow کرتے ہوئے ایک inbound rule ہے۔ Subnet کی NACL کے پاس 0.0.0.0/0 سے TCP 443 allow کرتے ہوئے ایک inbound rule (rule 100) اور 0.0.0.0/0 کو TCP 443 allow کرتے ہوئے ایک outbound rule (rule 100) ہے۔

مسئلے کا سب سے زیادہ ممکنہ سبب کیا ہے؟

A) Security group میں TCP 443 کے لیے ایک outbound rule missing ہے  
B) EC2 انسٹینسز کے پاس Elastic IP پتے نہیں ہیں  
C) Security group میں ephemeral ports کے لیے ایک inbound rule missing ہے  
D) NACL میں ephemeral ports (1024-65535) allow کرنے والی ایک outbound rule missing ہے

**اشارہ ۱**: Security groups stateful ہیں — وہ خودبخود responses allow کرتے ہیں۔ NACLs stateless ہیں — وہ نہیں کرتے۔

**اشارہ ۲**: جب کوئی براؤزر port 443 پر ایک ویب سرور سے جڑتا ہے، تو سرور کا response ایک random ephemeral port (1024-65535) پر واپس جاتا ہے، port 443 پر نہیں۔

**اشارہ ۳**: NACL کے پاس 443 کے لیے ایک outbound rule ہے، لیکن response port 443 نہیں جاتا۔

**جواب**: D

**وضاحت**: NACL stateless ہے۔ جب صارفین port 443 پر سرور سے جڑتے ہیں، تو سرور کی TCP response ایک ephemeral port (randomly chosen from 1024-65535) پر واپس جاتی ہے۔ NACL outbound rule صرف port 443 allow کرتی ہے، اس لیے response ڈیفالٹ deny rule سے block ہو جاتا ہے۔ TCP 1024-65535 outbound allow کرنے والی ایک outbound NACL rule شامل کرنا اسے ٹھیک کرے گا۔

**A کیوں نہیں؟** Security groups stateful ہیں — response ٹریفک outbound rules سے قطع نظر خودبخود permitted ہے۔ کوئی outbound security group rule ضروری نہیں۔

**B کیوں نہیں؟** Elastic IPs اثر انداز ہوتے ہیں کہ انسٹینسز کے عوامی IPs ہیں یا نہیں، اس سے نہیں کہ آیا established connections responses وصول کر سکتی ہیں۔

**C کیوں نہیں؟** Ephemeral ports outbound response ٹریفک کے لیے ہیں، inbound نہیں۔ صارفین سے inbound connection port 443 پر آتا ہے، جو پہلے سے allowed ہے۔

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۱.۲*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Romanian IP attack کے بعد، Priya دو اضافی controls نافذ کرنا چاہتی ہے:

1. پوری 185.0.0.0/8 IP range کو public subnet میں کسی بھی resource تک پہنچنے سے block کریں
2. یقینی بنائیں کہ database پر مشتمل private subnet کبھی بھی انٹرنیٹ سے بات نہیں کر سکتا، چاہے کوئی security group کو غلط طریقے سے ترتیب دے

آپ ہر ضرورت کے لیے کون سے ٹولز استعمال کریں گے، اور انہیں کیسے ترتیب دیں گے؟ کیا آپ دونوں کے لیے security groups استعمال کر سکتے ہیں؟ کیا آپ دونوں کے لیے NACLs استعمال کر سکتے ہیں؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد یہ سمجھنا ہے کہ کون سا ٹول کون سے مسئلے کے لیے موزوں ہے۔)*

## پوسٹ کریڈٹس منظر

واقعہ محدود تھا۔ Compromised deploy key deactivate ہو گئی۔ Romanian IP range NACL پر block ہو گئی۔ پرانی script EC2 انسٹینس سے ہٹا دی گئی۔

Priya نے ایک incident report لکھی۔ اس نے اسے ٹیم کے ساتھ شیئر کیا۔

Report کی آخری لائن: "Root cause: ایک decommissioned deployment pipeline کا ایک active credential کبھی rotate یا revoke نہیں کیا گیا۔ Recommendation: automated credential rotation اور تمام IAM credentials کا باقاعدہ audit۔"

Leo نے اسے تین بار پڑھا۔

"مجھے وہ key rotate کرنی چاہیے تھی،" اس نے کہا۔

"ہاں،" Priya نے کہا۔

"ہم کیسے یقینی بنائیں کہ یہ دوبارہ نہ ہو؟"

"Automation،" اس نے کہا۔ "اور کوئی چیز جو watchers کو دیکھے۔"

اگلے باب میں: وہ lockbox جہاں Nimbus اپنے secrets رکھتا ہے — اور وہ rotation جو چوری شدہ keys کو بیکار بنا دیتی ہے۔
