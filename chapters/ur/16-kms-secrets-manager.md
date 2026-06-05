# باب ۱۶: چابیاں، تالے، اور راز

Leo git history review کر رہا تھا جب اسے ملا۔ ایک database password۔ چھ ماہ پہلے commit کیا گیا، plain text میں، اس شخص کے ذریعے جو اب Nimbus میں نہیں تھا۔ Commit عوامی تھی۔ Password اس کے بعد بدلی گئی تھی — لیکن وہ یقینی نہیں تھے۔ انہوں نے ہر اس نظام کی جانچ کی جسے وہ credential کبھی چھو چکی تھی۔ اس میں چار گھنٹے لگے۔ یہی وہ دن تھا جب Nimbus نے code میں secrets ڈالنا بند کرنے کا فیصلہ کیا۔

**دو مسائل: Secrets اسٹور کرنا اور Data خفیہ کرنا**

حساس معلومات کے گرد security کے دو الگ مسائل ہیں:

**Credentials اسٹور کرنا** (database passwords، API keys، connection strings): یہ کہاں رہتے ہیں؟ کون انہیں access کر سکتا ہے؟ آپ اپنی ایپلیکیشن redeploy کیے بغیر انہیں کیسے rotate کرتے ہیں؟

**Data خفیہ کرنا** (customer information، payment records، PII): آپ کیسے یقینی بناتے ہیں کہ اگر کوئی آپ کے database یا S3 bucket تک غیر مجاز رسائی حاصل کر لے، وہ data نہیں پڑھ سکے؟

AWS کے پاس ہر مسئلے کے لیے ایک dedicated سروس ہے:

- **AWS Secrets Manager**: Credentials محفوظ طریقے سے اسٹور اور manage کرتا ہے
- **AWS KMS (Key Management Service)**: Data خفیہ کرنے اور decrypt کرنے کے لیے encryption keys manage کرتا ہے

**AWS Secrets Manager: کوئی Hardcoded Credentials نہیں**

Secrets Manager secrets کا ایک محفوظ store ہے: database credentials، API keys، OAuth tokens، SSH keys، یا کوئی بھی حساس چیز۔

آپ کی ایپلیکیشن environment variable یا config file سے password پڑھنے کے بجائے startup پر (یا جب ضرورت ہو) Secrets Manager API کو call کرتی ہے اور secret بازیافت کرتی ہے۔ Secret کبھی disk کو نہیں چھوتی۔ کبھی آپ کے code میں ظاہر نہیں ہوتی۔ آپ کے environment variables میں نہیں ہے۔

Flow یہ دکھتا ہے:

**پرانا طریقہ**:
```
DB_PASSWORD=supersecretpassword123  # .env file یا environment variable میں
```

**Secrets Manager طریقہ**:
```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

EC2 انسٹینس کو اس مخصوص secret کے لیے `secretsmanager:GetSecretValue` call کرنے کی اجازت کے ساتھ ایک IAM role کی ضرورت ہے۔ کوئی اور سروس اسے نہیں پڑھ سکتی۔ Secret کبھی code میں نہیں۔

**خودکار Rotation: اصل طاقت**

Secrets Manager کی سب سے بڑی خصوصیت secrets اسٹور کرنا نہیں ہے — یہ انہیں خودبخود rotate کرنا ہے۔

منظر نامہ: ہر 30 دن میں، Secrets Manager ایک نیا database password generate کرتا ہے، اسے RDS میں اپڈیٹ کرتا ہے، محفوظ secret اپڈیٹ کرتا ہے، اور آپ کی ایپلیکیشن اگلی بار جب ضرورت پڑتی ہے نیا password بازیافت کرتی ہے۔ کوئی ہاتھ سے مداخلت نہیں۔ کوئی deployment نہیں۔ کوئی "مجھے یہ rotate کرنا یاد رکھنا ہے" نہیں۔

Rotation ایک Lambda function کے طور پر نافذ ہے۔ AWS RDS databases (MySQL، PostgreSQL، Aurora) کے لیے templates فراہم کرتا ہے۔ آپ کسی بھی credential قسم کے لیے function customize کر سکتے ہیں۔

Tom کا لاگت کے بارے میں سوال تھا۔ (بلکہ ہوگا ہی۔)

Secrets Manager فی secret فی ماہ اور فی API call چارج کرتا ہے۔ database passwords اور API keys کی ایک چھوٹی تعداد کے لیے، لاگت فی ماہ چند dollars ہے — کسی واقعے کی لاگت کے مقابلے میں نہ ہونے کے برابر۔

"پچھلے ہفتے کا compromise،" Priya نے کہا، "اسے investigate اور remediate کرنے کی کتنی لاگت تھی؟"

Tom ایک لمحے کے لیے خاموش رہا۔ "میرا وقت، آپ کا وقت، Leo کا ہفتہ آخر... چند ہزار dollars۔"

"Secrets Manager static key کو exploit کیے جانے سے پہلے پکڑتا۔ اور اسے خودبخود rotate کرتا۔"

Tom نے pricing page کھولا۔

**AWS KMS: Lock کی فیکٹری**

AWS KMS (Key Management Service) **cryptographic keys** manage کرتا ہے — وہ secret values جو data خفیہ کرنے اور decrypt کرنے کے لیے استعمال ہوتی ہیں۔

مثال: KMS ایک lockbox کمپنی کی طرح ہے جو master key رکھتی ہے۔ آپ کا data (box کا مواد) خفیہ ہے۔ صرف وہی جس کے پاس KMS key استعمال کرنے کی اجازت ہے اسے decrypt کر سکتا ہے۔ KMS CloudTrail میں ہر key کا ہر استعمال log کرتا ہے۔

**Customer Master Keys (CMKs)** — اب KMS keys کہلاتی ہیں — دو اقسام میں آتی ہیں:

**AWS managed keys**: AWS خودبخود S3، EBS، RDS جیسی سروسز کے لیے key بناتا اور manage کرتا ہے۔ آپ key کو براہ راست control نہیں کرتے، لیکن آپ دیکھ سکتے ہیں کہ اسے استعمال کیا جا رہا ہے۔ مفت۔

**Customer managed keys**: آپ KMS میں key بناتے ہیں اور اس کا ہر پہلو control کرتے ہیں: کون اسے استعمال کر سکتا ہے، کب rotate ہوتی ہے، کون اسے manage کر سکتا ہے۔ آپ خودکار سالانہ rotation فعال کر سکتے ہیں۔ لاگت: $1/month فی key اور فی-API-call charges۔

**AWS سروسز میں Encryption: KMS Integration**

زیادہ تر AWS سروسز encryption کے لیے KMS کے ساتھ integrate ہوتی ہیں:

**S3**: bucket پر "server-side encryption with KMS" فعال کریں۔ ہر object KMS key سے at rest خفیہ ہوتا ہے۔ کسی object کو پڑھنے کے لیے S3 bucket *اور* KMS key دونوں کی اجازت ضروری ہے۔

**RDS**: creation کے وقت encryption فعال کریں۔ Database storage، backups، اور snapshots سب KMS key سے خفیہ ہوتے ہیں۔ نوٹ: encryption کسی موجودہ unencrypted RDS انسٹینس پر فعال نہیں کیا جا سکتا — آپ کو snapshot لینا، encryption کے ساتھ snapshot copy کرنا، اور restore کرنا ہوگا۔

**EBS**: KMS کے ساتھ volumes خفیہ کریں۔ خفیہ snapshots سے بنائے گئے نئے volumes خودبخود خفیہ ہوتے ہیں۔

**DynamoDB**: At rest encryption KMS کا استعمال کرتے ہوئے تمام tables پر ڈیفالٹ کے مطابق فعال ہے۔

**ElastiCache Redis**: حساس cached data کے لیے KMS کے ساتھ at rest encryption۔

اصول: data at rest (disk پر محفوظ) اور in transit (نیٹ ورک میں جاتا ہوا) خفیہ ہونا چاہیے۔ KMS at-rest encryption سنبھالتا ہے۔ TLS/SSL (AWS سروسز کے ذریعے خودبخود فراہم) in-transit encryption سنبھالتا ہے۔

**Envelope Encryption: KMS اصل میں کیسے کام کرتا ہے**

یہاں ایک تفصیل ہے جو KMS کے رویے اور امتحانی سوالات سمجھنے میں مدد کرتی ہے۔

KMS زیادہ تر cases میں آپ کا data براہ راست خفیہ نہیں کرتا۔ یہ **envelope encryption** استعمال کرتا ہے:

1. KMS ایک **data key** (ایک منفرد symmetric key) generate کرتا ہے
2. سروس data key کا استعمال کر کے آپ کا data مقامی طور پر خفیہ کرتی ہے (تیز — symmetric encryption)
3. سروس KMS سے data key کو خود خفیہ کرنے کو کہتی ہے (آپ کی KMS key استعمال کرتے ہوئے)
4. خفیہ شدہ data اور خفیہ شدہ data key دونوں محفوظ ہوتے ہیں
5. آپ کا اصل data کبھی سروس نہیں چھوڑتا — صرف data key encryption/decryption کے لیے KMS جاتی ہے

جب آپ data پڑھتے ہیں:

1. سروس KMS سے data key decrypt کرنے کو کہتی ہے
2. KMS اجازتیں چیک کرتا ہے، data key decrypt کرتا ہے، واپس کرتا ہے
3. سروس decrypted data key استعمال کر کے آپ کا data مقامی طور پر decrypt کرتی ہے

اس کا مطلب ہے KMS KMS API کے ذریعے سب کچھ بھیجے بغیر بہت بڑا data سنبھال سکتا ہے۔ صرف چھوٹی keys KMS جاتی ہیں۔ CloudTrail ہر KMS API call log کرتا ہے — ہر encrypt اور decrypt operation۔

**Secrets Manager بمقابلہ Parameter Store**

AWS کے پاس **Systems Manager Parameter Store** بھی ہے، جو configuration values (نہ صرف secrets) اسٹور کرتا ہے۔ Parameter Store سستا ہے — standard parameters کے لیے مفت۔ یہ KMS کا استعمال کرتے ہوئے خفیہ شدہ parameters بھی اسٹور کر سکتا ہے۔

Rotation کی ضرورت والے secrets کے لیے: Secrets Manager۔

Configuration values اور non-sensitive parameters کے لیے: Parameter Store (free tier بہت generous ہے)۔

Application configuration (port numbers، feature flags، environment-specific settings) کے لیے: Parameter Store۔

## خوبیاں اور حدود

**AWS Secrets Manager**:

- Code تبدیلیوں کے بغیر خودکار secret rotation
- Per-secret کے لیے IAM access control
- Versioning (rotation کے دوران پچھلا ورژن access کریں)
- CloudTrail کے ذریعے Audit
- لاگت: ~$0.40/secret/month + API calls

**AWS KMS**:

- مکمل audit trail کے ساتھ مرکزی key management
- Customer-managed keys کے لیے خودکار سالانہ key rotation
- Per-key کے لیے IAM اجازتیں (key policies + IAM policies)
- Hardware Security Module (HSM) backed — keys کبھی HSM نہیں چھوڑتیں
- لاگت: $1/month فی key + $0.03 per 10,000 API calls

**جہاں پیچیدہ ہو جاتا ہے**:

- KMS key policies IAM policies سے الگ ہیں (اور ساتھ evaluate ہوتی ہیں) — debug کرنا confusing ہو سکتا ہے
- At rest encryption کی منصوبہ بندی ضروری ہے — آپ موجودہ unencrypted RDS انسٹینس in place خفیہ نہیں کر سکتے
- KMS میں key deletion کا 7-30 دن کا waiting period ہے (ایک safety mechanism — گم شدہ keys کا مطلب گم شدہ data)
- Secrets Manager کی لاگت پیمانے پر secrets اور API calls کی تعداد کے ساتھ بڑھتی ہے

## خلاصہ

- Credentials کو کبھی بھی code، environment variables، یا version control میں commit کردہ config files میں store نہ کریں۔
- **Secrets Manager** credentials محفوظ طریقے سے اسٹور کرتا ہے اور انہیں خودبخود rotate کرتا ہے۔ Applications API کے ذریعے secrets بازیافت کرتی ہیں۔
- **KMS** encryption keys manage کرتا ہے۔ زیادہ تر AWS سروسز at rest encryption کے لیے KMS کے ساتھ integrate ہوتی ہیں۔
- **At rest encryption** (disk پر محفوظ data) KMS keys استعمال کرتی ہے جو AWS یا آپ manage کرتے ہیں۔ **In transit encryption** TLS استعمال کرتی ہے۔
- **Envelope encryption**: KMS key کو خفیہ کرتا ہے، data کو براہ راست نہیں۔ سروس مقامی data key استعمال کر کے data خفیہ کرتی ہے۔
- **Customer-managed KMS keys**: rotation، access، اور audit پر مکمل control۔ **AWS-managed keys**: خودکار، کوئی configuration ضروری نہیں۔
- **Parameter Store** non-sensitive configuration values کے لیے Secrets Manager کا ہلکا متبادل ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں (ڈومین ۱، ٹاسک ۱.۳)*

- **Secrets Manager بمقابلہ SSM Parameter Store**: Secrets Manager خودکار rotation کی ضرورت والے credentials کے لیے؛ Parameter Store عام configuration کے لیے۔ امتحان انہیں rotation کی ضرورت اور لاگت sensitivity کے ذریعے distinguish کرتا ہے۔
- **KMS key policies**: ایک KMS key کی اپنی key policy ہوتی ہے (ایک resource-based policy)۔ IAM policies اکیلے KMS key تک رسائی نہیں دیتیں — key policy کو اسے واضح طور پر allow کرنا ضروری ہے۔
- **RDS خفیہ کرنا**: کسی موجودہ unencrypted RDS انسٹینس پر encryption فعال نہیں کیا جا سکتا۔ عمل: snapshot بنائیں → encryption فعال کے ساتھ snapshot copy کریں → encrypted snapshot سے restore کریں → ٹریفک نئی انسٹینس پر منتقل کریں۔
- **EBS encryption**: نئے volumes خفیہ کیے جا سکتے ہیں۔ خفیہ شدہ volumes کے snapshots ہمیشہ خفیہ ہوتے ہیں۔ Unencrypted volumes کو براہ راست خفیہ نہیں کیا جا سکتا — snapshot + copy + restore۔
- **CloudTrail + KMS**: ہر KMS API call CloudTrail میں log ہوتی ہے۔ یہ ایک اہم compliance خصوصیت ہے۔
- **Multi-Region KMS keys**: key material کو متعدد regions میں replicate کریں تاکہ decryption cross-region API calls کے بغیر ہو سکے۔ امتحان اسے encrypted data کے ساتھ multi-region disaster recovery کے لیے استعمال کرتا ہے۔
- **KMS بمقابلہ CloudHSM**: KMS multi-tenant ہے (AWS کے ذریعے managed)۔ CloudHSM ایک dedicated hardware security module ہے جسے صرف آپ control کرتے ہیں۔ امتحانی اشارے: "FIPS 140-2 Level 3،" "dedicated HSM،" "customer-managed cryptographic operations" → CloudHSM۔

## مشقیں

**مشق ۱ — یادداشت**

Envelope encryption کے تصور کی وضاحت کریں۔ KMS آپ کے application data کو براہ راست خفیہ کرنے کے بجائے ایک چھوٹی data key کیوں خفیہ کرتا ہے؟

*(اشارہ: اس کے بارے میں سوچیں کہ اگر آپ کے پاس خفیہ کرنے کے لیے 1GB data ہو، اور 1GB کو ایک remote KMS سروس کو بھیجنے کی performance کے اثرات کیا ہوں گے۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک financial services کمپنی ایک RDS MySQL database میں حساس customer data اسٹور کرتی ہے۔ ایک نئی compliance ضرورت مانگتی ہے:

1. تمام data at rest خفیہ ہونا ضروری ہے
2. تمام encryption key usage auditable ہونا ضروری ہے
3. Encryption keys customer-controlled ہونی ضروری ہیں (AWS کے ذریعے managed نہیں)
4. Database password خودبخود ہر 90 دن میں rotate ہونا ضروری ہے

Database چھ ماہ پہلے encryption فعال کیے بغیر بنایا گیا تھا۔ تمام چار ضروریات کو کون سا set of actions بہترین طریقے سے پوری کرتا ہے؟

A) موجودہ database پر RDS encryption فعال کریں؛ customer-managed KMS key بنائیں؛ Secrets Manager کو 90-day rotation کے ساتھ ترتیب دیں  
B) موجودہ database کا snapshot بنائیں؛ customer-managed KMS key کا استعمال کرتے ہوئے encryption کے ساتھ snapshot copy کریں؛ encrypted snapshot سے restore کریں؛ Secrets Manager کو 90-day rotation کے ساتھ ترتیب دیں  
C) AWS-managed key کے ساتھ ایک نیا encrypted RDS انسٹینس بنائیں؛ پرانی انسٹینس سے data migrate کریں؛ Secrets Manager کو 90-day rotation کے ساتھ ترتیب دیں  
D) AWS-managed key کا استعمال کرتے ہوئے موجودہ database پر RDS at-rest encryption فعال کریں؛ Secrets Manager کو 90-day rotation کے ساتھ ترتیب دیں

**اشارہ ۱**: آپ موجودہ unencrypted RDS انسٹینس پر encryption براہ راست فعال نہیں کر سکتے۔

**اشارہ ۲**: "Customer-controlled" keys کا مطلب customer-managed KMS keys ہیں، AWS-managed keys نہیں۔

**اشارہ ۳**: Snapshot copy process encrypted RDS کی طرف standard migration path ہے۔

**جواب**: B

**وضاحت**: RDS encryption موجودہ انسٹینس پر فعال نہیں کی جا سکتی۔ معیاری طریقہ ہے: موجودہ انسٹینس کا snapshot → customer-managed KMS key کا استعمال کرتے ہوئے encryption کے ساتھ snapshot copy کریں (ضروریات 1، 2، اور 3 پوری کرتا ہے) → encrypted snapshot سے restore کریں۔ Customer-managed KMS keys تمام استعمال CloudTrail میں خودبخود log کرتی ہیں (auditing) اور encryption keys آپ کے control میں رکھتی ہیں۔ Secrets Manager خودکار 90-day password rotation سنبھالتا ہے (ضرورت 4 پوری کرتا ہے)۔

**A کیوں نہیں؟** آپ موجودہ unencrypted RDS انسٹینس پر in place encryption فعال نہیں کر سکتے۔

**C کیوں نہیں؟** AWS-managed keys "customer-controlled" ضرورت (ضرورت 3) پوری نہیں کرتیں۔

**D کیوں نہیں؟** وہی مسئلہ جو A (in place فعال نہیں کر سکتے) plus AWS-managed key ضرورت 3 پوری نہیں کرتی۔

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۱.۳*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کو درج ذیل حساس data اسٹور کرنا ہے:

- Production RDS انسٹینس کے لیے Database password
- Stripe API secret key (payment processing کے لیے استعمال)
- DynamoDB میں customer order history خفیہ کرنے کے لیے ایک symmetric encryption key
- Per-restaurant configuration values (API endpoints، feature flags — حساس نہیں)

آپ ہر ایک کے لیے کون سی AWS سروس یا طریقہ استعمال کریں گے؟ ہر ایک کے لیے آپ کون سی rotation strategy لاگو کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد security tools کو use cases سے match کرنے کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Secrets منتقل ہو گئے۔

Database passwords: Secrets Manager، ہر 30 دن rotate ہوتے ہوئے۔

API keys: Secrets Manager، ایک rotation Lambda کے ساتھ جو payment provider کی API کو نیا key generate کرنے کے لیے call کرتی تھی۔

Customer order data: ایک customer-managed KMS key سے خفیہ۔

پرانے credentials: deactivate۔ پرانی config files: delete۔ پرانے GitHub Actions secrets: ہٹا دیے گئے۔

"ہم اب audit-ready ہیں،" Priya نے کہا۔

"Audit-ready define کریں،" Maya نے کہا۔

"اگر کوئی compliance auditor ہم سے یہ ثابت کرنے کو کہے کہ کوئی credentials ہمارے code میں hardcoded نہیں یا ہمارے infrastructure میں expose نہیں، تو ہم دکھا سکتے ہیں: ہر secret Secrets Manager میں ہے، ہر encryption key KMS میں ہے، ہر رسائی CloudTrail میں log ہے۔"

"آخری بار CloudTrail logs کسی نے چیک کیے کب؟"

ایک وقفہ۔

"میں انہیں ہر ہفتے چیک کرتی ہوں،" Priya نے کہا۔

"اور اگر کوئی غیر معمولی چیز ظاہر ہو، تو ہمیں کیسے پتہ چلے گا؟"

"وہ،" Priya نے اپنا لیپ ٹاپ بند کرتے ہوئے کہا، "اگلی گفتگو ہے۔"

اگلے باب میں: تین دفاعی layers جو Nimbus اور انٹرنیٹ کے درمیان کھڑی ہیں۔
