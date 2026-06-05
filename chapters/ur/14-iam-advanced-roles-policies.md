# باب ۱۴: کون کیا کر سکتا ہے

Tom کے پاس access keys ایک text file میں کھلے تھے، paste کرنے کے لیے تیار۔

"آپ کیا کر رہے ہیں؟" Priya نے پوچھا۔

"EC2 انسٹینس کو S3 سے config files پڑھنی ہیں۔ میں server configuration میں credentials ڈال رہا ہوں۔"

اس نے اسکرین کو ایک لمحے کے لیے دیکھا۔ "وہ file بند کریں۔"

"میں بس—"

"اگر کوئی اس سرور میں گھس جائے،" اس نے کہا، "تو انہیں وہ keys مل جاتی ہیں۔ اور وہ keys IAM user جو کچھ بھی چھونے کی اجازت رکھتا ہے اسے چھو سکتی ہیں۔ جو شاید صرف S3 سے زیادہ ہے۔"

Tom نے file بند کر دی۔

"ایک بہتر طریقہ ہے،" اس نے کہا۔ "سرور کا خود ایک role ہو سکتا ہے۔ اسے ایک job title کی طرح سوچیں — انسٹینس کو credentials کی ضرورت نہیں کیونکہ سسٹم پہلے سے جانتا ہے یہ کیا ہے اور کیا کر سکتا ہے۔"

Tom شکوک آمیز نظر آیا۔ "تو سرور خود authenticate کرتا ہے؟"

"ہاں۔ بغیر password کے۔ بغیر keys کے کسی config file میں۔ بغیر کسی چیز کے جو غلطی سے git میں commit ہو سکے۔"

یہ آخری بات لگی۔ Tom نے دو ہفتے پہلے git history میں ایک database password پایا تھا۔ اس نے ایک نیا browser tab کھولا۔

**IAM کا دوبارہ جائزہ: مکمل تصویر**

باب ۳ نے IAM متعارف کرایا: users، groups، roles، اور policies۔ اب گہرائی میں جانے کا وقت ہے۔

IAM policies JSON documents ہیں جو بتاتے ہیں کہ کون سے actions کن resources پر allowed یا denied ہیں۔ وہ اس طرح نظر آتے ہیں:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

یہ policy `nimbus-assets` bucket میں objects پڑھنے اور لکھنے کی اجازت دیتی ہے، اور کچھ نہیں۔ Delete نہیں۔ Buckets list نہیں۔ کوئی اور S3 operation نہیں۔ کوئی اور AWS سروس نہیں۔

یہ اجازتیں دینے کا درست طریقہ ہے: مخصوص actions، مخصوص resources۔

**"Administrator Access" کا مسئلہ**

AWS Managed Policies جیسے `AdministratorAccess` جلدی شروع کرنے کے لیے ڈیزائن کیے گئے ہیں۔ وہ حقیقی ٹیم members کے ساتھ production systems چلانے کے لیے ڈیزائن نہیں کیے گئے۔

`AdministratorAccess` ہر resource پر ہر action دیتا ہے۔ اگر اس policy والا ٹیم member غلطی کرے — غلطی سے S3 bucket delete کرے، غلط EC2 انسٹینس terminate کرے، security group rules بدلے — AWS کے پاس انہیں روکنے کی کوئی چیز نہیں۔ اجازت دی گئی تھی۔

"تو Soo-Jin کیا رکھے؟" Leo نے پوچھا۔

"Soo-Jin کو کیا کرنا ہے؟" Priya نے جواب میں پوچھا۔

"API deploy کرنا۔ Logs چیک کرنا۔ کچھ اور نہیں۔"

"تو اسے: code pipeline پر push کرنے کی صلاحیت، CloudWatch logs پر read access، اور کچھ نہیں ملتا ہے۔"

"یہ... بہت مخصوص ہے۔"

"ہاں۔ یہی مقصد ہے۔"

**IAM Roles: سروسز کے لیے Identities**

باب ۳ نے roles کو EC2 انسٹینسز کے لیے credentials store کیے بغیر AWS سروسز تک رسائی کے طریقے کے طور پر متعارف کرایا۔ آئیے اسے ٹھوس بنائیں۔

Nimbus API چلانے والی EC2 انسٹینسز کو یہ کرنا ہوتا ہے:

- DynamoDB سے پڑھنا (مینو)
- DynamoDB میں لکھنا (آرڈرز)
- S3 میں objects رکھنا (receipts، uploads)
- CloudWatch کو logs لکھنا
- Secrets Manager سے secrets پڑھنا

EC2 انسٹینس کے لیے access key کے ساتھ ایک user بنانے اور وہ key EC2 انسٹینس پر store کرنے کے بجائے (ایک security nightmare — access keys کو SSH access والا کوئی بھی پڑھ سکتا ہے)، آپ EC2 انسٹینس کے لیے ایک **IAM role** بناتے ہیں جن اجازتوں کی ضرورت ہے ان کے ساتھ۔

EC2 انسٹینس خودبخود role assume کرتا ہے۔ AWS instance metadata service کے ذریعے temporary credentials فراہم کرتا ہے۔ Credentials خودبخود rotate ہوتی ہیں۔ Leak کرنے کے لیے کوئی access key نہیں۔

"اور اگر کوئی EC2 انسٹینس hack کرے؟" Leo نے پوچھا۔

"وہ وہی کر سکتے ہیں جو EC2 role کی اجازت ہے،" Priya نے کہا۔ "جو ہے مینو پڑھنا، آرڈرز لکھنا، اور logs بھیجنا۔ وہ S3 bucket delete نہیں کر سکتے۔ وہ EC2 انسٹینسز terminate نہیں کر سکتے۔ وہ IAM کو چھو نہیں سکتے۔"

"کیونکہ EC2 role کے پاس وہ اجازتیں نہیں ہیں۔"

"بالکل۔"

**Role Assumption: سروسز کیسے دوسری سروسز بنتی ہیں**

Roles یہ assume کر سکتے ہیں:

- **AWS سروسز** (EC2، Lambda، ECS tasks، وغیرہ)
- آپ کے اپنے account میں **IAM users** (role elevation — آپ ایک مخصوص task کے لیے زیادہ اجازتوں والا role assume کرتے ہیں)
- **دوسرے AWS accounts میں IAM users** (cross-account رسائی — کسی اور تنظیم کا account آپ کے میں ایک role assume کر سکتا ہے)
- **بیرونی identity providers** (Google، Active Directory، Okta — انسانی صارفین کے لیے federated رسائی)

آخری pattern — **identity federation** — وہ طریقہ ہے جس سے بڑی تنظیمیں اپنے employees کو ہر شخص کے لیے انفرادی IAM users بنائے بغیر AWS رسائی دیتی ہیں۔ آپ کی کمپنی کے Active Directory کے پاس آپ کے credentials ہیں۔ جب آپ AWS میں login کرتے ہیں، آپ Active Directory کے خلاف authenticate کرتے ہیں، اور AWS آپ کو ایک role دیتا ہے۔

**Permission Boundaries: Roles کیا Grant کر سکتی ہیں اس کو محدود کرنا**

یہاں ایک subtle لیکن اہم مسئلہ ہے: ڈیفالٹ کے مطابق، IAM کوئی user کو اس سے زیادہ اجازتیں دینے سے نہیں روکتا جو اس کے پاس ابھی ہیں۔

اگر Soo-Jin کے پاس `iam:CreatePolicy` اور `iam:AttachUserPolicy` ہیں، تو وہ S3 write access دینے والی policy بنا سکتی ہے اور اسے خود سے attach کر سکتی ہے — چاہے اس کی موجودہ policies صرف S3 read کی اجازت دیتی ہوں۔ کمزوریوں کی اس class کو **privilege escalation** کہا جاتا ہے، اور یہی وجہ ہے کہ permission boundaries موجود ہیں۔

لیکن اگر آپ ایک team lead کو IAM permission creation delegate کرنا چاہتے ہیں، جبکہ یہ یقینی بناتے ہوئے کہ وہ آپ کی مرضی سے زیادہ نہ دے سکے؟

**Permission boundaries** وہ زیادہ سے زیادہ اجازتیں سیٹ کرتی ہیں جو کبھی بھی کسی identity کو دی جا سکتی ہیں۔ چاہے identity کی attached policies زیادہ وسیع ہوں، effective اجازتیں permission boundary سے bounded ہیں۔

مثال: آپ ایک team lead کو ایک policy دیتے ہیں جو انہیں IAM roles بنانے کی اجازت دیتی ہے۔ لیکن آپ ایک permission boundary attach کرتے ہیں جو کہتی ہے "اس team lead کے بنائے ہوئے roles کبھی بھی S3 delete access نہیں رکھ سکتے۔" چاہے team lead S3 full access کے ساتھ ایک role بنائے، boundary S3 delete کو کبھی effective ہونے سے روکتی ہے۔

**IAM Access Analyzer: Permissions کی Auditing**

Priya نے ٹیم کی IAM setup کا جائزہ لینے میں دو دن گزارے۔ اسے ملا:

- Leo کے personal user کے پاس administrator access تھا (جیسا دریافت ہوا)
- ایک پرانے Lambda function کے پاس تمام S3 buckets پڑھنے کی اجازت تھی (test سے باقی)
- ایک service role کے پاس DynamoDB tables میں write access تھا جو اب موجود نہیں

یہ عام ہے۔ IAM configurations وقت کے ساتھ کوڑا جمع کرتی ہیں۔

**IAM Access Analyzer** ایک AWS سروس ہے جو خودبخود ان resources (S3 buckets، IAM roles، KMS keys، Lambda functions) کی شناخت کرتی ہے جو بیرونی entities کے ساتھ shared ہیں۔ یہ ضرورت سے زیادہ permissive policies بھی شناخت کرتی ہے۔

باقاعدہ IAM audits آپ کے operations کا حصہ ہونی چاہئیں۔ Permissions بڑھتی ہیں؛ وہ organically کم کم ہوتی ہیں۔ Access Analyzer نادیدہ کو نظر آنے والا بنانے میں مدد کرتا ہے۔

**Service Control Policies: Organization-Level Guardrails**

اگر آپ کا AWS environment متعدد accounts میں بڑھے (بڑی ٹیموں کے لیے یہ ایک عام pattern ہے — dev account، staging account، production account)، **AWS Organizations** آپ کو انہیں ایک مرکزی account سے manage کرنے دیتا ہے۔

Organizations کے اندر، **Service Control Policies (SCPs)** guardrails لاگو کرتی ہیں جو account میں *ہر* IAM entity کو متاثر کرتی ہیں، administrators سمیت۔

مثال SCP: "dev account میں کوئی بھی eu-west-1 region میں EC2 انسٹینسز نہیں بنا سکتا۔"

چاہے dev account میں کسی کے پاس administrator access ہو، وہ اس SCP کی خلاف ورزی نہیں کر سکتے۔ یہ organization سطح پر نافذ ہے، account سطح سے اوپر۔

SCPs اجازتیں نہیں دیتی — وہ restrict کرتی ہیں۔ وہ وہ زیادہ سے زیادہ اجازتیں تعریف کرتی ہیں جو account میں کوئی بھی IAM entity کبھی رکھ سکتی ہے۔

## خوبیاں اور حدود

**IAM roles اور least privilege کیوں اہم ہیں**:

- Credentials compromise ہونے پر blast radius محدود کرتا ہے
- Attackers کو فوری طور پر مکمل رسائی ملنے کے بجائے متعدد systems کے ذریعے escalate کرنا ضروری ہوتا ہے
- Audit trail فراہم کرتا ہے — CloudTrail logs کرتا ہے کہ کس role نے کیا کیا
- رسائی کے بارے میں شعوری فیصلوں کی ضرورت ہوتی ہے — "اس سروس کو اصل میں کیا چاہیے؟"

**جہاں پیچیدہ ہو جاتا ہے**:

- درست IAM policies لکھنے کے لیے ہر سروس کے لیے AWS کے action/resource model کو سمجھنا ضروری ہے (اور ہر سروس کے درجنوں actions ہیں)
- زیادہ restrictive policies applications توڑتی ہیں — متعدد سروسز میں "access denied" errors debug کرنا وقت طلب ہے
- IAM تبدیلیاں تھوڑی تاخیر (عام طور پر سیکنڈ، کبھی کبھی زیادہ) سے propagate کرتی ہیں — confusing timing مسائل پیدا کر سکتی ہیں
- Cross-account roles کے لیے trust policy کی محتاط ترتیب درکار ہے

## خلاصہ

- Production میں **administrator access** سے بچیں — یہ setup کے لیے ہے، operations کے لیے نہیں۔
- IAM policies **Effect**، **Action**، اور **Resource** بتاتی ہیں — تینوں پر مخصوص ہوں۔
- **Groups** (انسانوں کے لیے) اور **roles** (سروسز کے لیے) کو policies attach کریں۔
- EC2 انسٹینسز، Lambda functions، اور دوسری AWS سروسز کو access keys نہیں بلکہ **IAM roles** استعمال کرنی چاہئیں۔
- **Permission boundaries** کسی بھی identity کی زیادہ سے زیادہ اجازتوں کو cap کرتی ہیں، attached policies سے قطع نظر۔
- **SCPs** (Service Control Policies) organization-wide restrictions لاگو کرتی ہیں جو administrators بھی override نہیں کر سکتے۔
- **IAM Access Analyzer** ضرورت سے زیادہ permissive policies اور resources تک بیرونی رسائی شناخت کرتا ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں (ڈومین ۱، ٹاسک ۱.۱)*

- **EC2 کے لیے IAM roles**: معیاری جواب جب EC2 کو S3، DynamoDB، Secrets Manager، یا کسی بھی AWS سروس تک رسائی کی ضرورت ہو۔ کبھی بھی کسی انسٹینس پر access keys store نہ کریں۔
- **Policy evaluation logic**: جب IAM ایک request evaluate کرتا ہے، تو explicit allow/deny hierarchy استعمال کرتا ہے۔ ایک explicit **Deny** ہمیشہ جیتتا ہے، چاہے explicit Allow کے خلاف بھی۔ ڈیفالٹ Deny ہے۔
- **Permission boundaries**: IAM administration delegate کرتے وقت استعمال ہوتی ہیں۔ امتحانی منظر نامہ: "developers کو اپنے Lambda functions کے لیے roles بنانے کی اجازت دیں، لیکن انہیں اپنے سے زیادہ اجازتیں دینے سے روکیں۔" → Permission boundaries۔
- **SCPs اجازتیں نہیں دیتیں**: وہ صرف restrict کرتی ہیں۔ اگر SCP S3 allow کرتی ہے لیکن IAM policy deny کرتی ہے، S3 denied ہے۔ اگر SCP S3 deny کرتی ہے لیکن IAM policy allow کرتی ہے، S3 denied ہے۔
- **Resource-based policies**: کچھ AWS سروسز (S3، SQS، Lambda) کے resource-based policies ہیں — resource سے attached اجازتیں، identity سے نہیں۔ یہ IAM policies کے ساتھ مل کر کام کرتی ہیں۔
- **Cross-account رسائی**: Account A میں IAM role، Account B کو assume کرنے کی اجازت دینے والی trust policy کے ساتھ۔ Account B کا user/role پھر Account A میں temporary credentials حاصل کرنے کے لیے `sts:AssumeRole` استعمال کرتا ہے۔
- **IAM Users بمقابلہ Federated Access**: بڑی تنظیموں کے لیے، federated access (IAM Identity Center کے ذریعے یا IdP کے ساتھ براہ راست federation) انفرادی IAM users سے زیادہ ترجیحی ہے۔

## مشقیں

**مشق ۱ — یادداشت**

کسی user سے attached IAM policy اور EC2 انسٹینس کے ذریعے assumed IAM role کے درمیان فرق بیان کریں۔ آپ ہر ایک کب استعمال کریں گے؟

*(اشارہ: credentials کے بارے میں سوچیں — وہ کہاں رہتے ہیں، اور کون ان کی rotation manage کرتا ہے؟)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک Lambda function کو S3 bucket سے پڑھنا اور DynamoDB table میں لکھنا ہے۔ ایک developer نے development کے دوران آسانی کے لیے Lambda function کو `AdministratorAccess` کے ساتھ ایک role دی ہے۔ Production میں جانے سے پہلے، security team least privilege follow کرنا چاہتی ہے۔

درج ذیل میں سے کون سا BEST طریقہ ہے؟

A) S3 read اور DynamoDB write اجازتوں کے ساتھ ایک نیا IAM user بنائیں؛ ایک access key generate کریں؛ key Lambda environment variables میں store کریں  
B) Lambda function کے execution role پر ایک inline policy attach کریں جو مخصوص bucket پر `s3:GetObject` اور مخصوص table پر `dynamodb:PutItem` دیتی ہو  
C) `AdministratorAccess` رکھیں لیکن ایک SCP شامل کریں جو S3 اور DynamoDB کے علاوہ تمام actions block کرے  
D) Lambda function کو IAM group میں شامل کریں جس میں S3 read اور DynamoDB write اجازتیں ہوں

**اشارہ ۱**: Lambda functions execution roles استعمال کرتی ہیں، access keys نہیں۔ کون سا آپشن اس کا احترام کرتا ہے؟

**اشارہ ۲**: Least privilege کا مطلب مخصوص resources پر مخصوص actions ہیں، وسیع policies نہیں۔

**اشارہ ۳**: IAM groups users پر مشتمل ہیں، Lambda functions نہیں۔

**جواب**: B

**وضاحت**: Lambda execution role کے پاس صرف وہ مخصوص اجازتیں ہونی چاہئیں جن کی function کو ضرورت ہے۔ مخصوص actions (`s3:GetObject`) اور مخصوص resources (bucket ARN، DynamoDB table ARN) پر scoped inline policies least-privilege implementation ہے۔

**A کیوں نہیں؟** Lambda environment variables میں access keys store کرنا security antipattern ہے — keys Lambda console access یا execution context کے ذریعے کوئی بھی پڑھ سکتا ہے۔ Lambda functions IAM سے temporary credentials کے ساتھ execution roles استعمال کرتی ہیں۔

**C کیوں نہیں؟** SCPs Organization/account سطح پر لاگو ہوتی ہیں اور per-function permission controls کے طور پر کام نہیں کرتیں۔ SCP کے ساتھ AdministratorAccess غلط layer ہے۔

**D کیوں نہیں؟** Lambda functions کو IAM groups میں شامل نہیں کیا جا سکتا۔ Groups صرف IAM users کے لیے ہیں۔

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۱.۱*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus تین ٹیموں تک بڑھ گیا ہے: core API ٹیم، ریستوران partner portal ٹیم، اور analytics ٹیم۔ ہر ٹیم میں پانچ developers ہیں اور ایک shared AWS account میں deploy کرتے ہیں۔

ایک IAM structure ڈیزائن کریں جو:

- ہر ٹیم کو صرف اپنی سروسز تک رسائی دے
- Analytics ٹیم کو production databases میں لکھنے سے روکے
- ہر ٹیم میں ایک team lead کو اپنی سروسز کے لیے IAM roles بنانے کی اجازت دے، لیکن اپنی اجازتیں escalate کرنے کی نہیں
- Platform ٹیم کے لیے ایک admin group فراہم کرے جو تمام سروسز manage کر سکے

آپ کون سے IAM constructs استعمال کریں گے؟ کہاں permission boundaries لاگو ہوتی ہیں؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد multi-team IAM ڈیزائن کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Leo نے ایک ہفتہ IAM دوبارہ کام کرنے میں گزارا۔

پیر تک، ہر سروس کے پاس بالکل وہ اجازتیں تھیں جن کی اسے ضرورت تھی۔ Soo-Jin اور Rafael کی group memberships ان کے اصل job functions سے match کرتی تھیں۔ Leo نے خود administrator access چھوڑ دی اور ایک role استعمال کر رہا تھا جو اس نے ڈیزائن کی تھی — اپنا کام کرنے کی اجازت کے ساتھ، اور کچھ نہیں۔

اس میں توقع سے زیادہ وقت لگا تھا۔

Priya نے منگل کی صبح اس کا کام review کیا۔ اس نے policy documents غور سے پڑھے۔

"یہ اچھا ہے،" اس نے کہا۔

"شکریہ،" Leo نے کہا، اس راحت کے ساتھ جو JSON کے ذریعے عاجز کیے جانے والے ہفتے کے بعد ملتی ہے۔

"آپ نے ایک چیز چھوڑی۔"

Leo سخت ہو گیا۔

"پہلے ورژن سے پرانی deploy key۔ GitHub Actions secret میں۔"

"وہ deactivate ہو چکی تھی۔"

Priya نے کچھ ٹائپ کیا۔ "تھی کیا؟"

ایک وقفہ۔

"میں اسے deactivate کروں گا،" Leo نے کہا۔

"CloudTrail logs دکھاتے ہیں اس نے پچھلے ہفتے تین API calls کیے۔"

ایک لمبا وقفہ۔

"کوئی چیز اسے استعمال کر رہی تھی،" Leo نے کہا۔ "میں تحقیق کروں گا۔"

اگلے باب میں: وہ security guard جو چہرے یاد رکھتا ہے اور وہ دروازہ جو صرف badges پڑھتا ہے۔
