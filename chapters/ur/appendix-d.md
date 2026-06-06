# ضمیمہ D: مکمل مشق امتحان (65 سوالات)

یہ ایک مکمل طوالت کا SAA-C03 مشق امتحان ہے: 65 سوالات، حقیقی امتحان کے ڈومین وزنوں کی عکاسی کرتے ہوئے — محفوظ فن تعمیر ڈیزائن کرنا (سوالات 1–20، ~30%)، مضبوط فن تعمیر ڈیزائن کرنا (21–37، ~26%)، اعلیٰ کارکردگی والے فن تعمیر ڈیزائن کرنا (38–53، ~24%)، اور لاگت کے لحاظ سے بہتر فن تعمیر ڈیزائن کرنا (54–65، ~20%)۔

**اسے کیسے دیں:**

- **130 منٹ** کے لیے ٹائمر سیٹ کریں — حقیقی امتحان کا دورانیہ۔ رفتار کی مشق کریں: یہ فی سوال دو منٹ بنتا ہے۔
- سات سوالات **"(دو منتخب کریں۔)"** کہتے ہیں — ان کے پانچ اختیارات اور بالکل دو درست جوابات ہوتے ہیں، بالکل حقیقی امتحان کے multiple-response آئٹمز کی طرح۔ سوال میں اسکور کرنے کے لیے دونوں کا درست ہونا ضروری ہے۔
- جب تک آپ تمام 65 مکمل نہ کر لیں جوابی کلید کو نہ دیکھیں۔ حقیقی امتحان میں درمیان میں کوئی feedback نہیں ہوتا، اور غیر یقینی کے لیے اپنی برداشت کو تربیت دینا تیاری کا حصہ ہے۔
- حقیقی امتحان میں 15 بغیر اسکور والے تجرباتی سوالات شامل ہوتے ہیں جنہیں آپ شناخت نہیں کر سکتے۔ یہاں تمام 65 "اسکور والے" ہیں۔ پاس کرنے کا معیار: **47 یا زیادہ درست (~72%)** آپ کو 720/1000 اسکیل شدہ پاسنگ اسکور کی حد میں رکھتا ہے۔ 47 سے کم پر، امتحان بک کرنے سے پہلے اپنے کمزور ڈومینز کے لیے ضمیمہ B میں نقشہ بند کیے گئے ابواب دوبارہ دیکھیں۔
- ہر اُس سوال کے لیے جو آپ سے چھوٹ جائے — اور ہر اُس سوال کے لیے جو آپ درست کریں لیکن جس پر ہچکچائیں — distractor تجزیہ پڑھیں۔ امتحان قابلِ فہم اختیارات کے درمیان *فرق* کو جانچتا ہے، اور سیکھنا وہیں رہتا ہے۔

---

## حصہ 1 — محفوظ فن تعمیر ڈیزائن کرنا (سوالات 1–20)

**سوال 1** *(Domain 1 — Task 1.1)*
ایک financial services کمپنی تمام features فعال کے ساتھ AWS Organizations استعمال کرتی ہے۔ سیکیورٹی ٹیم نے organization کی root سے ایک service control policy (SCP) منسلک کی جو eu-west-1 کے سوا تمام AWS Regions کے استعمال سے انکار کرتی ہے۔ ایک آڈٹ کے دوران، ٹیم دریافت کرتی ہے کہ ایک account میں ایک administrator اب بھی SCP کے باوجود us-east-2 میں EC2 instances launch کرنے کے قابل تھا۔ کس account نے غالباً اس عمل کی اجازت دی؟

A) ایک nested organizational unit (OU) میں ایک member account، کیونکہ SCPs nested OUs میں propagate نہیں ہوتیں
B) management account، کیونکہ SCPs management account پر لاگو نہیں ہوتیں
C) ایک member account جس کی IAM administrator policy میں ایک explicit Allow شامل ہے، جو SCPs کو override کرتی ہے
D) ایک member account جو SCP منسلک ہونے کے بعد بنایا گیا، کیونکہ SCPs صرف اُن accounts پر لاگو ہوتی ہیں جو منسلکی کے وقت موجود تھے

**سوال 2** *(Domain 1 — Task 1.1)*
ایک startup اپنے developers کو اپنی ایپلیکیشنز کے لیے IAM roles بنانے کی اجازت دینا چاہتا ہے، لیکن سیکیورٹی ٹیم کو تشویش ہے کہ developers ایسے roles بنا سکتے ہیں جن کے پاس خود developers سے زیادہ permissions ہوں، جس سے privilege escalation ہو۔ سیکیورٹی ٹیم چاہتی ہے کہ developers self-service role بنانے کی صلاحیت برقرار رکھیں۔ سب سے مناسب حل کیا ہے؟

A) developers سے role بنانے کی درخواستیں ایک ticketing system کے ذریعے جمع کرانے کا مطالبہ کریں جس کا سیکیورٹی ٹیم جائزہ لے
B) developers کے accounts سے ایک SCP منسلک کریں جو iam:CreateRole عمل سے مکمل طور پر انکار کرے
C) مطالبہ کریں کہ developers کے بنائے گئے تمام roles میں ایک مخصوص permissions boundary شامل ہو، جسے iam:CreateRole اور iam:AttachRolePolicy پر ایک IAM condition سے نافذ کیا جائے
D) AWS CloudTrail فعال کریں اور alerts ترتیب دیں جب بھی کوئی developer ایک نیا IAM role بنائے

**سوال 3** *(Domain 1 — Task 1.1)*
ایک SaaS provider کو خودکار cost analysis کرنے کے لیے اپنے گاہکوں کے AWS accounts میں وسائل تک رسائی درکار ہے۔ گاہک ایک IAM role بناتے ہیں جسے SaaS provider کا account فرض کر سکتا ہے۔ ایک سیکیورٹی کنسلٹنٹ خبردار کرتا ہے کہ ایک تیسرا فریق جو کسی گاہک کی role ARN جان لے، SaaS provider کو دھوکہ دے کر اُس گاہک کے account تک تیسرے فریق کی طرف سے رسائی کرا سکتا ہے۔ کون سا طریقہ کار اس "confused deputy" خطرے کو کم کرتا ہے؟

A) cross-account role کی trust policy پر multi-factor authentication (MFA) کا مطالبہ کریں
B) SaaS provider سے مطالبہ کریں کہ وہ sts:AssumeRole کال میں ایک منفرد ExternalId پاس کرے، جو گاہک کی طرف سے متعین ہو اور role کی trust policy میں ایک condition سے validate ہو
C) SaaS provider کے ساتھ شیئر کرنے سے پہلے role ARN کو AWS KMS سے encrypt کریں
D) cross-account role کی جگہ ایک IAM user رکھیں جس کی access keys ہر 90 دن میں rotate ہوں

**سوال 4** *(Domain 1 — Task 1.1)*
AWS Organizations میں 40 AWS accounts والی ایک کمپنی چاہتی ہے کہ اس کے ملازمین اپنے موجودہ Microsoft Entra ID (Azure AD) credentials سے ایک بار sign in کریں اور ایک واحد portal کے ذریعے تمام AWS accounts تک رسائی کریں، permissions کے ساتھ جو فی account مرکزی طور پر تفویض ہوں۔ کون سا حل سب سے کم operational overhead کے ساتھ ان تقاضوں کو پورا کرتا ہے؟

A) 40 میں سے ہر account میں IAM users بنائیں اور passwords کو Entra ID کے ساتھ synchronize کریں
B) AWS IAM Identity Center کو Entra ID کے ساتھ بطور external identity provider ترتیب دیں اور فی account users اور groups کو permission sets تفویض کریں
C) ہر account میں Amazon Cognito user pools تعینات کریں اور انہیں Entra ID سے federate کریں
D) ہر account میں ایک SAML identity provider بنائیں اور فی account IAM roles اور trust policies دستی طور پر لکھیں

**سوال 5** *(Domain 1 — Task 1.1)*
ایک موبائل گیمنگ کمپنی ایک ایپ بنا رہی ہے جہاں کھلاڑی ایک email ایڈریس یا social login سے sign up کرتے ہیں، اور authentication کے بعد ایپ کو لازماً player screenshots کو عارضی AWS credentials استعمال کرتے ہوئے براہِ راست ایک Amazon S3 bucket پر اپلوڈ کرنا ہے۔ solutions architect کو خدمات کا کون سا مجموعہ تجویز کرنا چاہیے؟

A) sign-up/sign-in کے لیے ایک Amazon Cognito user pool، اور authenticated token کا عارضی AWS credentials سے تبادلہ کرنے کے لیے ایک Amazon Cognito identity pool
B) sign-up/sign-in کے لیے ایک Amazon Cognito identity pool، اور عارضی AWS credentials جاری کرنے کے لیے ایک Amazon Cognito user pool
C) sign-up/sign-in کے لیے AWS IAM Identity Center، اور credentials کے لیے AWS STS GetSessionToken
D) صرف ایک Amazon Cognito user pool، کیونکہ user pool tokens S3 تک براہِ راست رسائی دیتے ہیں

**سوال 6** *(Domain 1 — Task 1.3)*
ایک healthcare کمپنی کو لازماً Amazon S3 میں ڈیٹا کو ایک ایسی key سے encrypt کرنا ہے جو AWS کے زیر انتظام خودکار سالانہ rotation کی حمایت کرتی ہو، جبکہ کمپنی کو پھر بھی key policy متعین کرنے، key کے استعمال کی CloudTrail logging فعال کرنے، اور ضرورت پڑنے پر key کو disable کرنے کی اجازت دے۔ کون سی KMS key قسم ان تقاضوں کو پورا کرتی ہے؟

A) ایک AWS managed key (aws/s3)
B) خودکار rotation فعال کے ساتھ ایک customer managed key
C) ایک AWS owned key
D) خودکار rotation فعال کے ساتھ ایک imported key material (BYOK) customer managed key

**سوال 7** *(Domain 1 — Task 1.3)*
ایک solutions architect وضاحت کر رہا ہے کہ AWS KMS ایک ایپلیکیشن کے ذریعے محفوظ ایک 4 GB فائل کو کیسے encrypt کرتا ہے، یہ دیکھتے ہوئے کہ KMS براہِ راست صرف 4 KB تک ڈیٹا encrypt کر سکتا ہے۔ کون سا بیان envelope encryption کو درست طور پر بیان کرتا ہے؟

A) KMS فائل کو 4 KB کے ٹکڑوں میں تقسیم کرتا ہے اور ہر ٹکڑے کو KMS key سے encrypt کرتا ہے
B) ایپلیکیشن KMS سے ایک data key کی درخواست کرتی ہے، فائل کو مقامی طور پر plaintext data key سے encrypt کرتی ہے، پھر encrypted data key کو ڈیٹا کے ساتھ محفوظ کرتی ہے اور plaintext data key کو ضائع کر دیتی ہے
C) KMS فائل کو KMS API کے ذریعے stream کرتا ہے، جو اسے KMS key سے server-side encrypt کرتا ہے
D) ایپلیکیشن فائل کو ایک hard-coded symmetric key سے encrypt کرتی ہے، اور KMS integrity کے لیے نتیجے پر دستخط کرتا ہے

**سوال 8** *(Domain 1 — Task 1.3)*
ایک کمپنی ایک Amazon RDS for PostgreSQL master password محفوظ کرتی ہے اور اسے ہر 30 دن میں ایپلیکیشن downtime کے بغیر خودکار طور پر rotate کرانا چاہتی ہے۔ ایپلیکیشن طویل المدت ڈیٹابیس connections رکھتی ہے، اس لیے ٹیم ایک ایسی rotation حکمت عملی چاہتی ہے جہاں نئے کو فعال کرتے وقت پچھلا credential درست رہے۔ کون سا حل ان تقاضوں کو پورا کرتا ہے؟

A) ماہانہ متحرک ہونے والے Lambda function کے ساتھ AWS Systems Manager Parameter Store SecureString parameters
B) single-user rotation حکمت عملی کے ساتھ AWS Secrets Manager
C) alternating-users rotation حکمت عملی کے ساتھ AWS Secrets Manager، جو دو ڈیٹابیس users کے درمیان سوئچ کرتی ہے تاکہ ایک credential ہمیشہ درست رہے
D) ڈیٹابیس password پر لاگو AWS KMS خودکار key rotation

**سوال 9** *(Domain 1 — Task 1.3)*
ایک میڈیا کمپنی Amazon S3 میں خام ویڈیو محفوظ کرتی ہے۔ تعمیل کا تقاضا ہے کہ کمپنی اپنی encryption keys خود سنبھالے اور فراہم کرے، کہ AWS وہ keys کبھی محفوظ نہ کرے، اور کہ keys ہر درخواست کے ساتھ فراہم کی جائیں۔ کون سا encryption آپشن ان تقاضوں کو پورا کرتا ہے؟

A) SSE-S3
B) ایک customer managed key کے ساتھ SSE-KMS
C) SSE-C
D) AWS managed key aws/s3 استعمال کرتے ہوئے client-side encryption

**سوال 10** *(Domain 1 — Task 1.3)*
ایک broker-dealer کو لازماً trade records کو Amazon S3 میں سات سال کے لیے اس طرح برقرار رکھنا ہے کہ retention مدت کے دوران کوئی بھی — بشمول AWS account root user — objects کو حذف یا overwrite نہ کر سکے، تاکہ SEC Rule 17a-4 کو پورا کیا جا سکے۔ کون سی ترتیب اس تقاضے کو پورا کرتی ہے؟

A) 7 سالہ retention مدت کے ساتھ governance mode میں S3 Object Lock
B) ایک versioning فعال bucket پر 7 سالہ retention مدت کے ساتھ compliance mode میں S3 Object Lock
C) تمام principals کے لیے s3:DeleteObject سے انکار کرنے والی ایک S3 bucket policy
D) ایک lifecycle rule کے ساتھ S3 Glacier Deep Archive جو 7 سال بعد objects کو expire کرے

**سوال 11** *(Domain 1 — Task 1.2)*
ایک ویب ایپلیکیشن ایک Application Load Balancer کے پیچھے EC2 instances پر چلتی ہے۔ ایک network engineer subnet میں ایک network ACL rule شامل کرتا ہے جو 0.0.0.0/0 سے inbound TCP port 443 کی اجازت دیتا ہے، لیکن کلائنٹس پھر بھی HTTPS درخواستیں مکمل نہیں کر سکتے۔ security groups درست طور پر ترتیب دیے گئے ہیں۔ سب سے ممکنہ وجہ کیا ہے؟

A) network ACL stateful ہے اور ایک connection-tracking rule درکار ہے
B) network ACL کا ephemeral ports (1024–65535) کی اجازت دینے والا کوئی outbound rule نہیں، اس لیے واپسی ٹریفک بلاک ہو جاتی ہے کیونکہ NACLs stateless ہیں
C) security group کو بھی outbound port 443 کی اجازت دینی چاہیے، کیونکہ security groups stateless ہیں
D) Network ACLs 0.0.0.0/0 سے ٹریفک کی اجازت نہیں دے سکتیں؛ ایک مخصوص CIDR درکار ہے

**سوال 12** *(Domain 1 — Task 1.2)*
ایک VPC میں security groups اور network ACLs کے بارے میں کون سے دو بیان درست ہیں؟ (دو منتخب کریں۔)

A) Security groups stateful ہیں، اس لیے واپسی ٹریفک کی outbound rules سے قطع نظر خودکار طور پر اجازت ہوتی ہے
B) Network ACLs قواعد کا عددی ترتیب میں جائزہ لیتی ہیں اور explicit Deny rules کی حمایت کرتی ہیں
C) Security groups Allow اور Deny دونوں rules کی حمایت کرتے ہیں
D) Network ACLs انفرادی elastic network interfaces سے منسلک ہوتی ہیں
E) Security group rules کا عددی ترتیب میں جائزہ لیا جاتا ہے، پہلے میچ پر رک جاتا ہے

**سوال 13** *(Domain 1 — Task 1.2)*
ایک e-commerce کمپنی جو CloudFront اور ALB پر ایک public-facing ایپلیکیشن چلا رہی ہے، بڑے، نفیس DDoS حملوں کے بارے میں فکرمند ہے۔ کمپنی AWS Shield Response Team تک 24/7 رسائی، حملوں سے ہونے والے scaling چارجز کے خلاف cost protection، اور حملے کی diagnostics چاہتی ہے۔ اسے کون سی خدمت استعمال کرنی چاہیے؟

A) AWS Shield Standard، جو خودکار طور پر بلا قیمت فعال ہوتی ہے
B) AWS Shield Advanced
C) rate-based rules کے ساتھ AWS WAF
D) EC2 protection plan کے ساتھ Amazon GuardDuty

**سوال 14** *(Domain 1 — Task 1.2)*
ایک Application Load Balancer کے پیچھے ایک REST API پر SQL injection کی کوششوں اور IP ایڈریسز کے ایک چھوٹے سیٹ سے ضرورت سے زیادہ درخواستوں کے ساتھ حملہ ہو رہا ہے۔ کون سا حل سب سے کم development effort کے ساتھ ایپلیکیشن کے کنارے پر بدنیتی پر مبنی request patterns کو بلاک کرتا ہے؟

A) ہر API handler میں input validation کوڈ شامل کریں
B) AWS WAF کو ALB کے ساتھ منسلک کریں، SQL injection managed rule group اور ایک rate-based rule استعمال کرتے ہوئے
C) ALB پر AWS Shield Standard فعال کریں
D) ALB security group کو SQL keywords پر مشتمل درخواستوں سے انکار کے لیے ترتیب دیں

**سوال 15** *(Domain 1 — Task 1.2)*
ایک کمپنی تین سیکیورٹی ضروریات کو حل کرنا چاہتی ہے: (1) threat intelligence استعمال کرتے ہوئے خراب EC2 instances اور غیر معمولی API سرگرمی کا مسلسل پتہ لگانا، (2) S3 buckets میں محفوظ personally identifiable information (PII) کو دریافت اور درجہ بند کرنا، اور (3) سافٹ ویئر vulnerabilities (CVEs) کے لیے EC2 instances اور container images کو اسکین کرنا۔ ضروریات کے ساتھ AWS خدمات کا کون سا نقشہ درست ہے؟

A) 1: Amazon Inspector، 2: Amazon GuardDuty، 3: Amazon Macie
B) 1: Amazon GuardDuty، 2: Amazon Macie، 3: Amazon Inspector
C) 1: Amazon Macie، 2: Amazon Inspector، 3: Amazon GuardDuty
D) 1: Amazon GuardDuty، 2: Amazon Inspector، 3: Amazon Macie

**سوال 16** *(Domain 1 — Task 1.2)*
private subnets میں EC2 instances پر چلنے والی ایک ایپلیکیشن کو لازماً Amazon S3 پر objects اپلوڈ کرنے اور Amazon DynamoDB کو کال کرنے ہیں۔ کارپوریٹ پالیسی ٹریفک کے پبلک انٹرنیٹ سے گزرنے سے منع کرتی ہے، اور ٹیم دونوں خدمات کے لیے سب سے کم لاگت والا آپشن چاہتی ہے۔ کون سا حل ان تقاضوں کو پورا کرتا ہے؟

A) ایک public subnet میں ایک NAT gateway
B) S3 اور DynamoDB کے لیے Gateway VPC endpoints، subnets کے route tables میں حوالہ دیے گئے
C) S3 اور DynamoDB کے لیے Interface VPC endpoints (AWS PrivateLink)
D) restrictive security group rules کے ساتھ ایک internet gateway

**سوال 17** *(Domain 1 — Task 1.3)*
ایک server-side request forgery (SSRF) واقعے کے بعد جس میں ایک حملہ آور نے ایک vulnerable ویب ایپلیکیشن کے ذریعے ایک EC2 instance کی metadata service سے IAM role credentials حاصل کیں، ایک سیکیورٹی ٹیم تمام instances کو اس حملے کی قسم کے خلاف مضبوط بنانا چاہتی ہے۔ ٹیم کو کیا کرنا چاہیے؟

A) session tokens کا مطالبہ کر کے IMDSv2 نافذ کریں (HttpTokens=required)، تاکہ metadata درخواستوں کو ایک PUT سے حاصل کردہ token درکار ہو جسے سادہ SSRF درخواستیں حاصل نہیں کر سکتیں
B) تمام instances پر instance metadata service کو disable کر دیں، کیونکہ ایپلیکیشنز کو اس کی کبھی ضرورت نہیں ہوتی
C) subnet کے network ACL میں 169.254.169.254 کو بلاک کریں
D) instance role کے credentials کو instance پر ایک configuration فائل میں منتقل کریں

**سوال 18** *(Domain 1 — Task 1.3)*
ایک solutions architect کو تقریباً 200 plaintext ایپلیکیشن configuration اقدار (feature flags، environment names، endpoint URLs) اور 5 ڈیٹابیس passwords محفوظ کرنے ہیں۔ passwords کو خودکار rotation درکار ہے؛ configuration اقدار کو نہیں، اور ٹیم لاگت کم کرنا چاہتی ہے۔ کون سا مجموعہ سب سے زیادہ cost-effective ہے؟

A) ہر چیز کو AWS Secrets Manager میں محفوظ کریں
B) ہر چیز کو AWS Systems Manager Parameter Store standard parameters میں محفوظ کریں
C) configuration اقدار کو Parameter Store standard parameters (بلا قیمت) میں اور passwords کو rotation فعال کے ساتھ AWS Secrets Manager میں محفوظ کریں
D) configuration اقدار کو S3 میں اور passwords کو بلٹ-ان خودکار rotation کے ساتھ Parameter Store SecureString parameters میں محفوظ کریں

**سوال 19** *(Domain 1 — Task 1.3)*
ایک کمپنی ایک customer managed key استعمال کرتے ہوئے SSE-KMS سے S3 objects encrypt کرتی ہے۔ ایک ہی account میں ایک ایپلیکیشن ان objects کو فی سیکنڈ ہزاروں بار پڑھتی ہے، اور ٹیم KMS API کالز سے throttling اور لاگت کی تشویش دیکھ رہی ہے۔ کون سی تبدیلی SSE-KMS encryption برقرار رکھتے ہوئے KMS request ٹریفک کو کم کرتی ہے؟

A) bucket کو SSE-S3 پر سوئچ کریں، جو کوئی keys استعمال نہیں کرتا
B) S3 Bucket Keys فعال کریں، تاکہ S3 ایک قلیل المدت bucket کی سطح کی key استعمال کر کے KMS کالز کم کرے
C) customer managed key پر خودکار key rotation disable کریں
D) customer managed key کی جگہ imported key material رکھیں

**سوال 20** *(Domain 1 — Task 1.1)*
IAM policy evaluation اور AWS Organizations کے بارے میں کون سے دو بیان درست ہیں؟ (دو منتخب کریں۔)

A) SCPs member accounts میں IAM users اور roles کو permissions دیتی ہیں
B) کسی بھی قابل اطلاق policy میں ایک explicit Deny ہمیشہ کسی بھی Allow کو override کرتا ہے
C) Resource-based policies SCP کے بغیر cross-account رسائی نہیں دے سکتیں
D) ایک permissions boundary وہ زیادہ سے زیادہ permissions طے کرتی ہے جو ایک identity-based policy کسی user یا role کو دے سکتی ہے، لیکن خود کچھ نہیں دیتی
E) اگر کوئی policy کسی عمل کا ذکر نہ کرے، تو IAM users کے لیے وہ عمل default طور پر اجازت یافتہ ہوتا ہے

---

## حصہ 2 — مضبوط فن تعمیر ڈیزائن کرنا (سوالات 21–37)

**سوال 21** *(Domain 2 — Task 2.2)*
ایک آن لائن خوردہ فروش Amazon RDS for MySQL چلاتا ہے۔ ڈیٹابیس reporting dashboards سے بھاری read ٹریفک کا تجربہ کرتی ہے، اور کمپنی کو یہ بھی درکار ہے کہ ڈیٹابیس ایک Availability Zone کی ناکامی سے خودکار failover کے ساتھ اور بغیر دستی مداخلت کے بچ جائے۔ کون سا مجموعہ دونوں تقاضوں کو حل کرتا ہے؟

A) صرف Multi-AZ deployment فعال کریں؛ standby instance reporting reads پیش کر سکتا ہے
B) صرف read replicas بنائیں؛ جب primary کا AZ ناکام ہو تو ایک replica خودکار طور پر promote ہو جاتا ہے
C) خودکار failover کے لیے Multi-AZ deployment فعال کریں، اور reporting reads کو offload کرنے کے لیے read replicas شامل کریں
D) دونوں workloads کو سنبھالنے کے لیے ایک بڑے single-AZ instance class پر منتقل ہوں

**سوال 22** *(Domain 2 — Task 2.2)*
ایک کمپنی Availability Zones کے آر پار RDS high availability چاہتی ہے، لیکن یہ ایک روایتی Multi-AZ standby instance کے لیے ادائیگی پر اعتراض کرتی ہے جو کوئی ٹریفک پیش نہیں کرتا۔ کون سا RDS deployment آپشن خودکار failover فراہم کرتا ہے اور standby capacity کو read ٹریفک پیش کرنے دیتا ہے؟

A) RDS Multi-AZ DB instance deployment (ایک standby)
B) RDS Multi-AZ DB cluster deployment، جس میں ایک reader endpoint کے ساتھ دو readable standby instances ہوتے ہیں
C) ایک Application Load Balancer کے ساتھ تین AZs میں RDS read replicas
D) automated backups کے ساتھ RDS Single-AZ

**سوال 23** *(Domain 2 — Task 2.2)*
Amazon Aurora پر ایک عالمی payments platform کو لازماً ایک دوسرے AWS Region پر fail over کرنا ہے اگر primary Region دستیاب نہ ہو۔ تعمیل ٹیم پوچھتی ہے کہ آیا Aurora Global Database Regions کے آر پار صفر ڈیٹا نقصان (RPO = 0) کی ضمانت دے سکتا ہے۔ solutions architect کو انہیں کیا بتانا چاہیے؟

A) ہاں — Aurora Global Database Regions کے آر پار synchronously replicate کرتا ہے، اس لیے RPO بالکل 0 ہے
B) نہیں — Aurora Global Database asynchronous storage پر مبنی replication استعمال کرتا ہے جس میں عام طور پر lag ایک سیکنڈ سے کم ہوتا ہے، اس لیے cross-Region RPO صفر کے قریب ہے لیکن کبھی بالکل 0 کی ضمانت نہیں
C) ہاں — لیکن صرف اگر secondary Region پر write forwarding فعال ہو
D) نہیں — Aurora Global Database 5 منٹ کے شیڈول پر replicate کرتا ہے، جو 5 منٹ کا RPO دیتا ہے

**سوال 24** *(Domain 2 — Task 2.2)*
ایک کمپنی کا disaster recovery پلان کہتا ہے: "ایک Regional آؤٹیج کے بعد، order system کو لازماً 4 گھنٹوں کے اندر دوبارہ چلنا چاہیے، اور 15 منٹ سے زیادہ transactions ضائع نہیں ہو سکتیں۔" کون سا بیان ان نمبروں کو DR metrics سے درست طور پر نقشہ بند کرتا ہے؟

A) RTO = 15 منٹ؛ RPO = 4 گھنٹے
B) RTO = 4 گھنٹے؛ RPO = 15 منٹ
C) MTBF = 4 گھنٹے؛ MTTR = 15 منٹ
D) RPO = 4 گھنٹے؛ SLA = 15 منٹ

**سوال 25** *(Domain 2 — Task 2.2)*
ایک انشورنس کمپنی کو ایک اہم ایپلیکیشن کے لیے ایک DR حکمت عملی درکار ہے۔ تقاضے: ڈیٹا کو لازماً DR Region میں مسلسل replicate کیا جائے؛ بنیادی بنیادی ڈھانچہ (ڈیٹابیس، AMIs، کم سے کم stack) لازماً DR Region میں پہلے سے موجود ہو لیکن کمپیوٹ کو لاگت قابو کرنے کے لیے کسی آفت تک بند رہنا چاہیے؛ دسیوں منٹ کا RTO قابل قبول ہے۔ کون سی DR حکمت عملی میل کھاتی ہے؟

A) Backup and restore
B) Pilot light — DR Region میں بنیادی عناصر فراہم کیے گئے اور ڈیٹا live-replicated، لیکن failover تک کمپیوٹ بند
C) Warm standby — workload کی ایک کم پیمانے لیکن ہمیشہ چلنے والی مکمل نقل
D) Multi-site active/active

**سوال 26** *(Domain 2 — Task 2.2)*
AWS disaster recovery حکمت عملیوں کے بارے میں کون سے دو بیان درست ہیں؟ (دو منتخب کریں۔)

A) Backup and restore کے لیے recovery Region میں وسائل کا پہلے سے فراہم اور چلنا ضروری ہے
B) Backup and restore چاروں حکمت عملیوں میں سب سے کم RTO پیش کرتا ہے
C) Multi-site active/active بیک وقت متعدد Regions سے ٹریفک پیش کرتا ہے اور سب سے زیادہ لاگت پر صفر کے قریب RTO پیش کرتا ہے
D) Pilot light recovery Region میں ایپلیکیشن کی ایک مکمل گنجائش والی نقل production ٹریفک پیش کرتے ہوئے رکھتا ہے
E) Warm standby recovery Region میں workload کی ایک کم پیمانے لیکن مکمل طور پر فعال نقل ہمیشہ چلتی رکھتا ہے

**سوال 27** *(Domain 2 — Task 2.1)*
ایک image-processing ایپلیکیشن ایک Amazon SQS standard queue سے messages پڑھتی ہے۔ ایک تصویر پروسیس کرنے میں 3 منٹ تک لگتے ہیں، لیکن queue کا visibility timeout 30 سیکنڈ پر سیٹ ہے۔ صارفین رپورٹ کرتے ہیں کہ کچھ تصاویر دو یا تین بار پروسیس ہوتی ہیں۔ سب سے ممکنہ وجہ اور حل کیا ہے؟

A) queue FIFO ہے؛ ایک standard queue پر سوئچ کریں
B) visibility timeout پروسیسنگ ختم ہونے سے پہلے ختم ہو جاتا ہے، جس سے message دوسرے consumers کو دوبارہ visible ہو جاتا ہے؛ visibility timeout کو پروسیسنگ وقت سے زیادہ بڑھائیں
C) Long polling disabled ہے؛ ایک 20 سیکنڈ کا ReceiveMessageWaitTime فعال کریں
D) message retention مدت بہت مختصر ہے؛ اسے 14 دن تک بڑھائیں

**سوال 28** *(Domain 2 — Task 2.1)*
ایک billing ایپلیکیشن ایک SQS queue سے messages استعمال کرتی ہے۔ کبھی کبھار ایک خراب message consumer کو بار بار ناکام کرا دیتا ہے، اور message ہمیشہ کے لیے queue میں گردش کرتا رہتا ہے، کمپیوٹ ضائع کرتے ہوئے۔ architect کو کیا ترتیب دینا چاہیے؟

A) ایک maxReceiveCount redrive policy کے ساتھ ایک dead-letter queue، تاکہ بار بار ناکام ہونے والے messages تجزیے کے لیے الگ رکھے جائیں
B) ایک مختصر visibility timeout تاکہ خراب message زیادہ تیزی سے دوبارہ آزمایا جائے
C) FIFO ordering، جو خود بخود خراب messages کو ضائع کر دیتی ہے
D) 1 منٹ کی ایک message retention مدت تاکہ خراب messages جلدی expire ہوں

**سوال 29** *(Domain 2 — Task 2.1)*
ایک brokerage فی customer account trade events پروسیس کرتی ہے۔ ایک ہی account کے events کو لازماً سختی سے ترتیب میں اور exactly once پروسیس کیا جائے، لیکن مختلف accounts کے events throughput کے لیے متوازی طور پر پروسیس کیے جا سکتے ہیں۔ کون سا حل ان تقاضوں کو پورا کرتا ہے؟

A) ایک consumer thread کے ساتھ ایک SQS standard queue
B) customer account ID کو MessageGroupId کے طور پر استعمال کرتے ہوئے ایک SQS FIFO queue، جو ہر group کے اندر ترتیب محفوظ رکھتا ہے جبکہ groups کے آر پار parallelism کی اجازت دیتا ہے
C) account ID کے لحاظ سے message filtering کے ساتھ ایک SNS standard topic
D) تمام customers کے لیے ایک واحد MessageGroupId کے ساتھ ایک SQS FIFO queue

**سوال 30** *(Domain 2 — Task 2.1)*
جب کوئی order دیا جاتا ہے، تو ایک e-commerce platform کو لازماً بیک وقت تین آزاد processes متحرک کرنے ہیں: invoice generation، warehouse fulfillment، اور analytics ingestion۔ ہر process کو لازماً ہر order event وصول کرنا، اسے پائیداری سے buffer کرنا، اور اسے اپنی رفتار سے پروسیس کرنا ہے۔ کون سا فن تعمیر ان تقاضوں کو پورا کرتا ہے؟

A) ایک ہی queue کو poll کرنے والے تین consumers کے ساتھ ایک SQS queue
B) ایک SNS topic جو تین SQS queues تک fan out کرتا ہے، فی process ایک subscribe شدہ
C) Step Functions کے ذریعے ترتیب وار invoke ہونے والے تین Lambda functions
D) تین email subscriptions کے ساتھ ایک SNS topic

**سوال 31** *(Domain 2 — Task 2.1)*
ایک flash sale کے دوران، API Gateway سے متحرک ہونے والا ایک Lambda function 429 throttling errors واپس کرنا شروع کر دیتا ہے جبکہ ایک ہی account میں دیگر اہم Lambda functions بھی throttle ہونا شروع ہو جاتے ہیں۔ account اپنے default concurrency quota پر ہے۔ کون سا عمل اہم functions کو sale function سے بھوکا رہنے سے بچاتا ہے؟

A) sale function کا timeout 3 سیکنڈ سے 15 منٹ کی زیادہ سے زیادہ حد تک بڑھائیں
B) اہم functions پر reserved concurrency ترتیب دیں (اور اختیاری طور پر sale function کو cap کریں)، انہیں account pool سے وقف concurrency کی ضمانت دیتے ہوئے
C) sale function پر provisioned concurrency فعال کریں، جو account-wide quota بڑھاتا ہے
D) اہم functions کو ایک 10 GB memory configuration پر منتقل کریں

**سوال 32** *(Domain 2 — Task 2.1)*
ایک میڈیا کمپنی کا ایک video-publishing workflow ہے جس میں ایک step ہے جو جاری رکھنے سے پہلے کسی انسانی moderator کے ایک بیرونی tool کے ذریعے مواد کی منظوری دینے کے لیے 2 دن تک انتظار کرتا ہے۔ workflow کو لازماً auditable ہونا چاہیے، دنوں چلنا چاہیے، اور moderator کے جواب دینے کے بعد بالکل وہیں سے دوبارہ شروع ہونا چاہیے جہاں یہ رکا تھا۔ کون سا حل بہترین فٹ بیٹھتا ہے؟

A) ایک Wait state کے ساتھ ایک Express Step Functions workflow
B) callback pattern استعمال کرنے والا ایک Standard Step Functions workflow: ایک task token (waitForTaskToken) moderation system کو بھیجا جاتا ہے، اور جب SendTaskSuccess کال کیا جاتا ہے تو workflow دوبارہ شروع ہوتا ہے
C) ایک Lambda function جو moderator کی منظوری تک سوتا رہتا ہے
D) ایک 2 دن کی scheduled تاخیر کے ساتھ ایک EventBridge rule

**سوال 33** *(Domain 2 — Task 2.1)*
ایک کمپنی ایک اعلیٰ حجم کا IoT ingestion pipeline چلاتی ہے جو تقریباً 90,000 مختصر workflow executions فی سیکنڈ انجام دیتا ہے، ہر ایک 5 سیکنڈ سے کم میں مکمل ہوتا ہے۔ Exactly-once execution semantics درکار نہیں، لیکن لاگت کم سے کم ہونی چاہیے۔ علیحدہ طور پر، ایک ماہانہ financial reconciliation workflow 12 گھنٹے چلتا ہے اور مکمل execution history کے ساتھ exactly-once execution کا تقاضا کرتا ہے۔ کون سی Step Functions workflow اقسام استعمال کی جانی چاہئیں؟

A) IoT pipeline کے لیے Express workflows؛ reconciliation کے لیے Standard workflows
B) دونوں کے لیے Standard workflows
C) دونوں کے لیے Express workflows، کیونکہ Express ایک سال تک execution کی حمایت کرتا ہے
D) IoT pipeline کے لیے Standard workflows؛ reconciliation کے لیے Express workflows

**سوال 34** *(Domain 2 — Task 2.2)*
ایک کمپنی اپنی primary ویب ایپلیکیشن کو us-east-1 میں ایک ALB پر اور ایک passive recovery نقل کو us-west-2 میں میزبان کرتی ہے۔ کمپنی چاہتی ہے کہ Route 53 تمام ٹریفک us-east-1 کو بھیجے اور صارفین کو صرف اُسی وقت خودکار طور پر us-west-2 کی طرف redirect کرے جب primary endpoint غیر صحت مند ہو جائے۔ کون سی Route 53 ترتیب اس تقاضے کو پورا کرتی ہے؟

A) 50/50 weights کے ساتھ Weighted routing
B) primary record پر ایک health check اور secondary کے طور پر سیٹ کیے گئے us-west-2 record کے ساتھ Failover routing
C) دونوں Regions کے درمیان Latency-based routing
D) us-west-2 کی طرف اشارہ کرنے والے ایک default record کے ساتھ Geolocation routing

**سوال 35** *(Domain 2 — Task 2.2)*
ایک Auto Scaling group تین Availability Zones کے آر پار ایک Application Load Balancer کے پیچھے EC2 ویب سرورز چلاتا ہے۔ ALB کچھ instances کو غیر صحت مند نشان زد کرتا ہے کیونکہ ویب سرور process crash ہو جاتا ہے، پھر بھی Auto Scaling group کبھی ان کی جگہ نہیں لیتا کیونکہ EC2 instances خود اب بھی status checks پاس کرتے ہیں۔ solutions architect کو کیا تبدیل کرنا چاہیے؟

A) instances پر detailed CloudWatch monitoring فعال کریں
B) Auto Scaling group کو EC2 status checks کے علاوہ ELB health checks استعمال کرنے کے لیے ترتیب دیں، تاکہ ALB target health میں ناکام ہونے والے instances ختم اور تبدیل کیے جائیں
C) ASG health check grace period بڑھائیں
D) ALB کو ایک Network Load Balancer پر سوئچ کریں

**سوال 36** *(Domain 2 — Task 2.1)*
ایک trading firm کو ایک custom TCP protocol کے لیے ایک load balancer درکار ہے جسے لازماً لاکھوں درخواستیں فی سیکنڈ انتہائی کم latency کے ساتھ سنبھالنی ہیں اور فی Availability Zone ایک static IP ایڈریس بے نقاب کرنا ہے۔ firm کو کون سا load balancer منتخب کرنا چاہیے؟

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**سوال 37** *(Domain 2 — Task 2.2)*
AWS پر مضبوط اسٹوریج بنانے کے بارے میں کون سے دو بیان درست ہیں؟ (دو منتخب کریں۔)

A) S3 Cross-Region Replication ماضی کے اثر کے ساتھ تمام objects کی نقل کرتا ہے جو replication ترتیب دینے سے پہلے موجود تھے، کسی اضافی عمل کے بغیر
B) Amazon EFS Standard storage classes ڈیٹا کو متعدد Availability Zones کے آر پار فالتو طریقے سے محفوظ کرتی ہیں اور مختلف AZs میں instances کے ذریعے بیک وقت mount کی جا سکتی ہیں
C) S3 Cross-Region Replication کے لیے ماخذ اور منزل دونوں buckets پر versioning فعال ہونا ضروری ہے
D) Amazon EFS volumes ایک وقت میں صرف ایک EC2 instance سے منسلک کیے جا سکتے ہیں، EBS کی طرح
E) S3 versioning فعال کرنا خودکار طور پر objects کو ایک دوسرے Region میں replicate کرتا ہے

---

## حصہ 3 — اعلیٰ کارکردگی والے فن تعمیر ڈیزائن کرنا (سوالات 38–53)

**سوال 38** *(Domain 3 — Task 3.1)*
ایک media analytics کمپنی ایک gp3 EBS volume استعمال کرتے ہوئے Amazon RDS پر ایک PostgreSQL ڈیٹابیس چلاتی ہے۔ ایک نئے reporting workload کو ذیلی ملی سیکنڈ latency کے ساتھ مستقل 50,000 IOPS اور 99.999% کی durability ضمانت درکار ہے۔ volume کو لازماً اسے bursting کے بغیر مستقل طور پر سپورٹ کرنا ہے۔ ایک solutions architect کو کون سی EBS volume قسم تجویز کرنی چاہیے؟

A) زیادہ سے زیادہ IOPS کے ساتھ provisioned gp3
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) 16 TiB کے ایک volume size کے ساتھ gp2

**سوال 39** *(Domain 3 — Task 3.1)*
ایک genomics research firm کو 500 EC2 instances کے ایک Linux پر مبنی high-performance computing (HPC) cluster کے لیے مشترکہ فائل اسٹوریج درکار ہے۔ workload کو ذیلی ملی سیکنڈ latencies اور سینکڑوں GB/s aggregate throughput درکار ہے، اور input datasets کو Amazon S3 میں staged کیا جاتا ہے۔ کون سی اسٹوریج خدمت ان تقاضوں کو بہترین طور پر پورا کرتی ہے؟

A) Max I/O performance mode کے ساتھ Amazon EFS
B) SSD storage کے ساتھ Amazon FSx for Windows File Server
C) S3 bucket سے منسلک Amazon FSx for Lustre
D) ہر instance پر Mountpoint کے ذریعے رسائی شدہ Amazon S3

**سوال 40** *(Domain 3 — Task 3.1)*
ایک کمپنی ایک on-premises Windows ایپلیکیشن منتقل کر رہی ہے جو SMB فائل shares اور Active Directory–مربوط access control lists پر انحصار کرتی ہے۔ ایپلیکیشن دو Availability Zones میں EC2 Windows instances پر چلے گی اور اسے لازماً اپنی موجودہ NTFS permissions برقرار رکھنی ہیں۔ solutions architect کو کون سی AWS اسٹوریج خدمت منتخب کرنی چاہیے؟

A) POSIX permissions کے ساتھ Amazon EFS
B) Multi-AZ deployment mode میں Amazon FSx for Windows File Server
C) AD groups سے نقشہ بند bucket policies کے ساتھ Amazon S3
D) persistent storage کے ساتھ Amazon FSx for Lustre

**سوال 41** *(Domain 3 — Task 3.1)*
سنگاپور میں ایک ویڈیو پروڈکشن کمپنی دنیا بھر کے دفاتر سے us-east-1 میں ایک S3 bucket پر 40 GB خام footage فائلیں اپلوڈ کرتی ہے۔ اپلوڈز اکثر پبلک انٹرنیٹ پر درمیان میں ناکام ہو جاتی ہیں، مکمل دوبارہ شروع پر مجبور کرتے ہوئے، اور مجموعی منتقلی اوقات سست ہیں۔ ایک solutions architect کو اعمال کا کون سا مجموعہ تجویز کرنا چاہیے؟ (دو منتخب کریں۔)

A) write throughput بہتر بنانے کے لیے bucket کو S3 One Zone-IA میں تبدیل کریں
B) ہر region میں ایک Application Load Balancer کے ساتھ bucket کے سامنے رہیں
C) ap-southeast-1 میں ایک bucket کے لیے S3 Cross-Region Replication فعال کریں
D) bucket پر S3 Transfer Acceleration فعال کریں اور accelerated endpoint کے ذریعے اپلوڈ کریں
E) بڑی فائلوں کے لیے multipart upload استعمال کریں

**سوال 42** *(Domain 3 — Task 3.1)*
ایک real-time bidding platform EC2 پر ایک NoSQL workload چلاتا ہے جسے عارضی scratch ڈیٹا کے لیے بالکل کم ترین اسٹوریج latency درکار ہے۔ ڈیٹا startup پر دوبارہ پیدا ہوتا ہے اور اسے instance کے stop یا termination میں بچنے کی ضرورت نہیں۔ کون سا اسٹوریج آپشن اس استعمال کے معاملے کے لیے سب سے زیادہ کارکردگی فراہم کرتا ہے؟

A) 64,000 provisioned IOPS کے ساتھ io2 EBS volume
B) ایک storage-optimized instance پر Instance store (NVMe SSD) volumes
C) General Purpose mode میں Amazon EFS
D) زیادہ سے زیادہ provisioned throughput کے ساتھ gp3 EBS volume

**سوال 43** *(Domain 3 — Task 3.3)*
ایک گیمنگ کمپنی player session ڈیٹا کو partition key `game_id` کے ساتھ ایک DynamoDB table میں محفوظ کرتی ہے۔ صرف 12 مقبول گیمز ہیں، اور table چند partitions پر throttling کا تجربہ کر رہی ہے جبکہ مجموعی استعمال شدہ capacity provisioned capacity سے کہیں کم ہے۔ ایک solutions architect کو کیا تجویز کرنا چاہیے؟

A) table کو auto scaling کے ساتھ provisioned capacity پر سوئچ کریں
B) ایک high-cardinality partition key استعمال کریں، جیسے game_id اور player_id کا مرکب
C) player_id پر ایک local secondary index بنائیں
D) writes کو partitions میں پھیلانے کے لیے DynamoDB Streams فعال کریں

**سوال 44** *(Domain 3 — Task 3.3)*
ایک e-commerce سائٹ product catalog ڈیٹا کو DynamoDB میں محفوظ کرتی ہے۔ Read ٹریفک انتہائی read-heavy ہے جس میں ایک ہی items روزانہ لاکھوں بار درخواست کیے جاتے ہیں، اور ٹیم کو ایپلیکیشن کی DynamoDB API کالز کو دوبارہ لکھے بغیر مائیکرو سیکنڈ read latency درکار ہے۔ solutions architect کو کیا تجویز کرنا چاہیے؟

A) Amazon ElastiCache for Redis تعینات کریں اور ایپلیکیشن کو پہلے cache چیک کرنے کے لیے تبدیل کریں
B) table کے سامنے DynamoDB Accelerator (DAX) شامل کریں
C) reads تقسیم کرنے کے لیے ایک global secondary index بنائیں
D) ایک دوسرے region میں DynamoDB Global Tables فعال کریں

**سوال 45** *(Domain 3 — Task 3.3)*
ایک logistics کمپنی کی پیداوار میں ایک DynamoDB table ہے جسے ایک نیا query pattern درکار ہے: shipments کو `carrier_id` کے لحاظ سے query کرنا اور `delivery_date` کے لحاظ سے sort کرنا، اپنی provisioned throughput کے ساتھ تاکہ نئی analytics queries main ایپلیکیشن کو متاثر نہ کریں۔ table پہلے سے موجود ہے اور اس پر live ٹریفک ہے۔ کون سا حل ان تقاضوں کو پورا کرتا ہے؟

A) carrier_id کو sort key کے طور پر ایک local secondary index بنائیں
B) carrier_id کو partition key اور delivery_date کو sort key کے طور پر ایک global secondary index بنائیں
C) carrier_id اور delivery_date کی ایک composite primary key کے ساتھ table دوبارہ بنائیں
D) ایک DynamoDB Stream فعال کریں اور carrier_id کے لحاظ سے stream کو query کریں

**سوال 46** *(Domain 3 — Task 3.3)*
ایک session-management خدمت user sessions کو DynamoDB میں محفوظ کرتی ہے۔ Sessions 24 گھنٹے بعد بیکار ہو جاتے ہیں، اور ٹیم چاہتی ہے کہ expire شدہ items کسی اضافی لاگت کے بغیر خودکار طور پر ہٹا دیے جائیں۔ solutions architect کو کیا نافذ کرنا چاہیے؟

A) ایک scheduled Lambda function جو table کو گھنٹہ وار scan کرتا ہے اور پرانے items حذف کرتا ہے
B) ہر item پر ایک expiration timestamp attribute کے ساتھ DynamoDB Time to Live (TTL)
C) DynamoDB table پر ایک lifecycle policy
D) 24 گھنٹے سے پرانے items کو drop کرنے کے لیے ایک filter کے ساتھ DynamoDB Streams

**سوال 47** *(Domain 3 — Task 3.3)*
ایک serverless ایپلیکیشن Lambda functions استعمال کرتی ہے جو ایک Amazon RDS for MySQL ڈیٹابیس سے جڑتے ہیں۔ ٹریفک spikes کے دوران، سینکڑوں ہم وقت Lambda invocations ڈیٹابیس کی connection حد کو ختم کر دیتے ہیں، errors کا سبب بنتے ہوئے۔ کون سا حل اسے کم سے کم ایپلیکیشن تبدیلی کے ساتھ حل کرتا ہے؟

A) max_connections بڑھانے کے لیے RDS instance size بڑھائیں
B) Lambda functions اور ڈیٹابیس کے درمیان Amazon RDS Proxy رکھیں
C) ڈیٹابیس کو DynamoDB پر منتقل کریں
D) Lambda reserved concurrency کو 10 پر ترتیب دیں

**سوال 48** *(Domain 3 — Task 3.3)*
ایک financial news سائٹ Amazon Aurora MySQL استعمال کرتی ہے۔ Read ٹریفک market اوقات کے دوران 20x بڑھتی ہے اور primary instance SELECT queries پیش کرنے میں CPU-bound ہے۔ Writes معمولی ہیں۔ reads کو scale کرنے کا سب سے operationally efficient طریقہ کیا ہے؟

A) Aurora Replicas شامل کریں اور read ٹریفک کو auto scaling کے ساتھ cluster reader endpoint کی طرف ہدایت کریں
B) ایک Multi-AZ standby بنائیں اور reads کو standby کو بھیجیں
C) ڈیٹابیس کو متعدد Aurora clusters میں shard کریں
D) reads offload کرنے کے لیے Aurora Backtrack فعال کریں

**سوال 49** *(Domain 3 — Task 3.4)*
ایک multiplayer گیمنگ کمپنی دو AWS Regions میں Network Load Balancers پر UDP protocol استعمال کرتے ہوئے ایک latency-sensitive ایپلیکیشن چلاتی ہے۔ دنیا بھر کے کھلاڑیوں کو allow-listing کے لیے static IP ایڈریسز اور تیز regional failover درکار ہے۔ solutions architect کو کون سی خدمت منتخب کرنی چاہیے؟

A) دو custom origins کے ساتھ Amazon CloudFront
B) دونوں regions میں endpoint groups کے ساتھ AWS Global Accelerator
C) latency-based routing کے ساتھ Amazon Route 53
D) cross-zone load balancing کے ساتھ ایک Application Load Balancer

**سوال 50** *(Domain 3 — Task 3.4)*
ایک streaming کمپنی کو لازماً content licensing قواعد کی تعمیل کرنی ہے: جرمنی میں صارفین کو لازماً ہمیشہ eu-central-1 deployment سے پیش کیا جائے، اور فرانس میں صارفین کو eu-west-3 deployment سے، اس سے قطع نظر کہ کون سا endpoint کم latency پیش کرتا ہے۔ کون سی Route 53 routing policy استعمال کی جانی چاہیے؟

A) Latency-based routing
B) Geolocation routing
C) eu-central-1 پر ایک positive bias کے ساتھ Geoproximity routing
D) 50/50 weights کے ساتھ Weighted routing

**سوال 51** *(Domain 3 — Task 3.2)*
ایک solutions architect ایک سختی سے منسلک HPC workload تعینات کر رہا ہے جو MPI استعمال کرتا ہے اور 32 EC2 instances کے درمیان کم ترین ممکنہ نیٹ ورک latency اور سب سے زیادہ packet-per-second کارکردگی کا تقاضا کرتا ہے۔ کون سی placement حکمت عملی استعمال کی جانی چاہیے؟

A) تین Availability Zones کے آر پار Spread placement group
B) 7 partitions کے ساتھ Partition placement group
C) ایک واحد Availability Zone میں Cluster placement group
D) enhanced networking کے ساتھ علیحدہ subnets میں instances launch کریں

**سوال 52** *(Domain 3 — Task 3.5)*
ایک IoT کمپنی clickstream ڈیٹا ingest کرتی ہے جسے لازماً analytics کے لیے قریب حقیقی وقت میں Amazon S3 تک پہنچانا ہے۔ ٹیم ایک مکمل منظم حل چاہتی ہے جس میں لکھنے کے لیے کوئی consumer ایپلیکیشنز، کوئی shard انتظام، اور بلٹ-ان record buffering اور Parquet میں format conversion ہو۔ انہیں کون سی خدمت استعمال کرنی چاہیے؟

A) ایک Lambda consumer کے ساتھ Amazon Kinesis Data Streams
B) ایک S3 destination کے ساتھ Amazon Data Firehose (سابقہ Kinesis Data Firehose)
C) EC2 pollers کے ایک fleet کے ساتھ Amazon SQS
D) ایک custom Kafka Connect sink کے ساتھ Amazon MSK

**سوال 53** *(Domain 3 — Task 3.5)*
ایک کمپنی ایپلیکیشن logs کو Amazon S3 میں compressed JSON فائلوں کے طور پر محفوظ کرتی ہے اور چاہتی ہے کہ analysts ان کے خلاف سرورز فراہم کیے بغیر یا ڈیٹا کو ایک ڈیٹابیس میں لوڈ کیے بغیر ad hoc SQL queries چلائیں۔ schema کو خودکار طور پر دریافت اور catalog کیا جانا چاہیے۔ solutions architect کو کون سا مجموعہ تجویز کرنا چاہیے؟

A) COPY commands اور scheduled refreshes کے ساتھ Amazon Redshift
B) Data Catalog کو populate کرنے کے لیے AWS Glue crawlers اور SQL queries کے لیے Amazon Athena
C) ایک long-running Presto cluster کے ساتھ Amazon EMR
D) aws_s3 extension کے ساتھ Amazon RDS for PostgreSQL

---

## حصہ 4 — لاگت کے لحاظ سے بہتر فن تعمیر ڈیزائن کرنا (سوالات 54–65)

**سوال 54** *(Domain 4 — Task 4.2)*
ایک research institute EC2 پر رات کے batch simulations چلاتا ہے جو تقریباً 90 منٹ لیتے ہیں، ہر 5 منٹ میں Amazon S3 پر progress checkpoint کرتے ہیں، اور کسی بھی وقت آخری checkpoint سے دوبارہ شروع کیے جا سکتے ہیں۔ institute کم ترین ممکنہ کمپیوٹ لاگت چاہتا ہے۔ solutions architect کو کون سا purchasing آپشن تجویز کرنا چاہیے؟

A) ایک واحد AZ میں On-Demand Instances
B) ایک 3 سالہ مدت کے ساتھ Standard Reserved Instances
C) متعدد instance types اور AZs کے آر پار diversified ایک Spot Fleet استعمال کرتے ہوئے Spot Instances
D) batch workload کے peak کے مطابق ایک Compute Savings Plan

**سوال 55** *(Domain 4 — Task 4.2)*
ایک SaaS کمپنی کا ایک مستحکم بنیادی کمپیوٹ خرچ ہے لیکن اگلے تین سالوں میں جدید کاری کرتے ہوئے EC2، AWS Fargate، اور AWS Lambda کے درمیان workloads منتقل کرنے کی توقع رکھتی ہے۔ یہ ایک commitment پر مبنی رعایت چاہتی ہے جو خودکار طور پر تینوں کمپیوٹ خدمات اور تمام regions پر لاگو ہو۔ solutions architect کو کون سا آپشن تجویز کرنا چاہیے؟

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**سوال 56** *(Domain 4 — Task 4.2)*
ایک کمپنی نے Amazon RDS اور Amazon EC2 کے لیے 3 سالہ Standard Reserved Instances خریدے۔ ایک re-architecture کے بعد، اسے اب کسی بھی reservation کی ضرورت نہیں۔ finance ٹیم پوچھتی ہے کہ کون سی reservations لاگت بحال کرنے کے لیے بیچی جا سکتی ہیں۔ solutions architect کو انہیں کیا بتانا چاہیے؟

A) EC2 اور RDS دونوں Reserved Instances Reserved Instance Marketplace پر بیچے جا سکتے ہیں
B) صرف EC2 Reserved Instances Reserved Instance Marketplace پر بیچے جا سکتے ہیں؛ RDS RIs دوبارہ نہیں بیچے جا سکتے
C) صرف RDS Reserved Instances بیچے جا سکتے ہیں، کیونکہ ڈیٹابیس reservations قابل منتقلی ہیں
D) کوئی بھی نہیں بیچا جا سکتا؛ Reserved Instances تمام صورتوں میں ناقابل واپسی اور ناقابل منتقلی ہیں

**سوال 57** *(Domain 4 — Task 4.2)*
ایک development ٹیم Amazon ECS پر EC2 Spot capacity کے ساتھ containerized fault-tolerant ڈیٹا پروسیسنگ چلاتی ہے۔ انہیں reclamation سے پہلے workers کے خوش اسلوبی سے drain اور checkpoint کرنے کی ضرورت ہے۔ AWS ایک Spot Instance کے تعطل سے پہلے کتنی پیشگی وارننگ فراہم کرتا ہے؟

A) کوئی وارننگ فراہم نہیں کی جاتی
B) ایک 2 منٹ کا interruption notice
C) ایک 15 منٹ کا interruption notice
D) ایک 24 گھنٹے کی rebalance window

**سوال 58** *(Domain 4 — Task 4.1)*
ایک healthcare archive Amazon S3 میں تعمیل records محفوظ کرتا ہے جن تک شاذ و نادر رسائی ہوتی ہے لیکن، جب subpoena کیا جائے، انہیں لازماً 5 منٹ کے اندر حاصل کیا جا سکے۔ records کو 7 سال رکھا جاتا ہے اور اسٹوریج لاگت کم سے کم ہونی چاہیے۔ کون سی storage class ان تقاضوں کو پورا کرتی ہے؟

A) Standard retrieval کے ساتھ S3 Glacier Deep Archive
B) ضرورت پڑنے پر Expedited retrievals کے ساتھ S3 Glacier Flexible Retrieval
C) Bulk retrievals کے ساتھ S3 Glacier Flexible Retrieval
D) S3 Standard-IA

**سوال 59** *(Domain 4 — Task 4.1)*
ایک photo-sharing startup آسانی سے دوبارہ پیدا کیے جانے والے thumbnail images محفوظ کرتا ہے جن تک شاذ و نادر رسائی ہوتی ہے۔ ٹیم سب سے کم لاگت والا infrequent-access آپشن چاہتی ہے اور یہ قبول کرتی ہے کہ ایک واحد Availability Zone کے نقصان کے لیے originals سے thumbnails دوبارہ پیدا کرنے کی ضرورت ہو سکتی ہے۔ کون سی storage class استعمال کی جانی چاہیے؟

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**سوال 60** *(Domain 4 — Task 4.1)*
ایک کمپنی کے پاس لاکھوں objects والا ایک S3 bucket ہے جن کے access patterns نامعلوم ہیں اور غیر متوقع طور پر بدلتے ہیں۔ ایک solutions architect S3 Intelligent-Tiering کا جائزہ لے رہا ہے۔ Intelligent-Tiering کے بارے میں کون سے دو بیان درست ہیں؟ (دو منتخب کریں۔)

A) یہ اُن objects کے لیے ایک چھوٹی فی object monitoring اور automation fee لیتا ہے جن کی یہ نگرانی کرتا ہے
B) یہ ہر بار retrieval fees لیتا ہے جب کوئی object واپس Frequent Access tier میں منتقل ہوتا ہے
C) 128 KB سے چھوٹے objects کی نگرانی یا auto-tier نہیں کی جاتی اور وہ Frequent Access tier کی شرح پر bill کیے جاتے ہیں
D) یہ خودکار طور پر objects کو ایک دوسرے region میں replicate کرتا ہے
E) اسے ہر object کے لیے ایک 90 دن کی کم سے کم storage مدت درکار ہے

**سوال 61** *(Domain 4 — Task 4.1)*
ایک analytics ٹیم اکثر ایک S3 data lake bucket پر بڑے multipart uploads کو abort کرتی ہے، اور AWS Cost Explorer دکھاتا ہے کہ اسٹوریج چارجز بڑھ رہے ہیں حالانکہ bucket کا visible object count flat ہے۔ سب سے زیادہ cost-effective حل کیا ہے؟

A) orphaned parts کو ٹریک کرنے کے لیے S3 Versioning فعال کریں
B) ایک lifecycle rule شامل کریں جو نامکمل multipart uploads کو ایک مقررہ دنوں کی تعداد کے بعد abort کرے
C) bucket کو S3 One Zone-IA پر منتقل کریں
D) اپلوڈز تیزی سے ختم کرنے کے لیے S3 Transfer Acceleration آن کریں

**سوال 62** *(Domain 4 — Task 4.1)*
ایک کمپنی کا EC2 fleet سینکڑوں gp2 EBS volumes استعمال کرتا ہے جو محض baseline IOPS حاصل کرنے کے لیے بڑے sized ہیں۔ Utilization جائزے دکھاتے ہیں کہ IOPS درکار ہیں لیکن زیادہ تر capacity درکار نہیں۔ solutions architect کو کارکردگی کھوئے بغیر اسٹوریج لاگت کم کرنے کے لیے کیا کرنا چاہیے؟

A) volumes کو io2 پر منتقل کریں اور وہی IOPS provision کریں
B) volumes کو gp3 پر منتقل کریں، capacity کو right-size کریں، اور IOPS کو آزادانہ طور پر provision کریں
C) volumes کو st1 throughput-optimized HDD میں تبدیل کریں
D) volumes کا روزانہ snapshot لیں اور originals حذف کر دیں

**سوال 63** *(Domain 4 — Task 4.4)*
private subnets میں ایک data pipeline ایک NAT gateway کے ذریعے EC2 instances سے ایک ہی region میں Amazon S3 تک فی مہینہ 60 TB منتقل کرتا ہے، بڑے data processing چارجز پیدا کرتے ہوئے۔ سب سے زیادہ cost-effective تبدیلی کیا ہے؟

A) NAT gateway کی جگہ ایک بڑے EC2 instance پر ایک NAT instance رکھیں
B) S3 کے لیے ایک gateway VPC endpoint بنائیں اور ٹریفک کو اس کے ذریعے روٹ کریں
C) S3 کے لیے ایک interface VPC endpoint (PrivateLink) بنائیں
D) EC2 instances کو public IPv4 ایڈریسز کے ساتھ public subnets میں منتقل کریں

**سوال 64** *(Domain 4 — Task 4.4)*
ایک startup کا ماہانہ بل درجنوں EC2 instances پر زیر استعمال public IPv4 ایڈریسز کے غیر متوقع چارجز دکھاتا ہے جو صرف VPC کے اندر دیگر AWS خدمات کو کال کرتے ہیں۔ finance ٹیم اگلے مہینے کے مجموعی خرچ کے ایک threshold سے تجاوز کرنے سے پہلے alerts بھی چاہتی ہے۔ solutions architect کو اعمال کا کون سا مجموعہ اختیار کرنا چاہیے؟ (دو منتخب کریں۔)

A) ہر instance پر public IPv4 کی جگہ Elastic IPs رکھیں، جو منسلک رہتے ہوئے ہمیشہ مفت ہیں
B) public IPv4 ایڈریسز ہٹا دیں اور private رابطہ (ضرورت کے مطابق VPC endpoints/NAT) استعمال کریں، کیونکہ AWS زیر استعمال public IPv4 ایڈریسز کے لیے چارج کرتا ہے
C) threshold سے اوپر خرچ بلاک کرنے کے لیے AWS Compute Optimizer استعمال کریں
D) ماہانہ خرچ cap کرنے کے لیے AWS Shield Advanced فعال کریں
E) ایک alert threshold اور email notification کے ساتھ ایک AWS Budgets cost budget بنائیں

**سوال 65** *(Domain 4 — Task 4.3)*
ایک development environment ایک Amazon Aurora PostgreSQL cluster استعمال کرتا ہے جو راتوں اور ہفتے کے آخر میں idle رہتا ہے لیکن جب developers جڑتے ہیں تو لازماً خودکار طور پر بیدار ہونا چاہیے، بغیر دستی مداخلت یا instance resizing کے۔ idle کے دوران کمپیوٹ کے لیے لاگت تقریباً صفر تک گرنی چاہیے۔ کون سا حل ان تقاضوں کو پورا کرتا ہے؟

A) 0 ACUs کی ایک کم سے کم capacity کے ساتھ ترتیب دیا گیا Aurora Serverless v2 تاکہ یہ idle ہونے پر auto-pause ہو جائے
B) ایک scheduled Lambda function کے ذریعے ہر رات روکا جانے والا ایک provisioned Aurora cluster
C) ایک headless secondary cluster کے ساتھ ایک Aurora global database
D) رات کو scaled-in دو reader instances کے ساتھ provisioned Aurora

---

## جوابی کلید

### حصہ 1 — سوالات 1–20

**1. جواب: B** — SCPs کبھی organization کے management account پر لاگو نہیں ہوتیں، اس لیے اس کے principals Region پابندیوں سے غیر متاثر رہتے ہیں۔ *دیگر کیوں نہیں:* A — SCPs nested OUs کے ذریعے وراثت میں ملتی ہیں؛ C — IAM Allows member accounts میں ایک SCP Deny کو override نہیں کر سکتے؛ D — SCPs منسلکی کے نقطے کے تحت تمام موجودہ اور مستقبل کے accounts پر فوری لاگو ہوتی ہیں۔

**2. جواب: C** — role بنانے کے اعمال پر ایک condition کے طور پر نافذ کردہ ایک permissions boundary developers کے بنائے گئے کسی بھی role کے زیادہ سے زیادہ permissions کو cap کرتی ہے، privilege escalation روکتے ہوئے جبکہ self-service برقرار رکھتے ہوئے۔ *دیگر کیوں نہیں:* A — دستی جائزہ operational overhead بڑھاتا اور self-service ختم کرتا ہے؛ B — iam:CreateRole سے انکار جائز workflow بلاک کرتا ہے؛ D — CloudTrail alerts detective ہیں، preventive نہیں۔

**3. جواب: B** — trust policy کی condition میں validate کیا گیا ایک customer-defined ExternalId یقینی بناتا ہے کہ SaaS provider صرف درست گاہک کی طرف سے role فرض کرے، confused deputy مسئلہ کم کرتے ہوئے۔ *دیگر کیوں نہیں:* A — MFA خودکار service-to-service assumption کے لیے غیر عملی ہے اور deputy confusion کو حل نہیں کرتا؛ C — ایک ARN (جو خفیہ نہیں) کو encrypt کرنا کچھ حل نہیں کرتا؛ D — طویل المدت IAM user keys roles سے کم محفوظ ہیں۔

**4. جواب: B** — IAM Identity Center Entra ID کے ساتھ ایک بار federate کرتا ہے اور ایک واحد access portal کے ذریعے تمام organization accounts پر مرکزی طور پر permission sets تفویض کرتا ہے۔ *دیگر کیوں نہیں:* A — فی account IAM users بالکل وہی overhead ہے جس سے بچنا ہے؛ C — Cognito ایپلیکیشن (گاہک) شناختوں کے لیے ہے، AWS accounts تک workforce رسائی کے لیے نہیں؛ D — دستی فی account SAML setup کام کرتا ہے لیکن اس کا operational overhead کہیں زیادہ ہے۔

**5. جواب: A** — User pools authentication (email/social sign-in) سنبھالتے ہیں؛ identity pools نتیجہ خیز tokens کا تبادلہ S3 تک رسائی کے لیے IAM roles سے scoped عارضی AWS credentials سے کرتے ہیں۔ *دیگر کیوں نہیں:* B — دونوں خدمات کے مقاصد کو الٹ دیتا ہے؛ C — IAM Identity Center workforce users کے لیے ہے، ایپ گاہکوں کے لیے نہیں؛ D — user pool tokens (JWTs) خود سے AWS خدمت رسائی نہیں دیتے۔

**6. جواب: B** — ایک customer managed key key policy، usage logging، اور disabling کا مکمل کنٹرول دیتی ہے، اور خودکار rotation (default طور پر سالانہ) کی حمایت کرتی ہے۔ *دیگر کیوں نہیں:* A — AWS managed keys آپ کو key policy ایڈٹ یا key disable نہیں کرنے دیتیں؛ C — AWS owned keys گاہک کے لیے مکمل طور پر پوشیدہ ہیں؛ D — imported (BYOK) key material خودکار rotation کی حمایت نہیں کرتا۔

**7. جواب: B** — Envelope encryption: KMS ایک data key بناتا ہے؛ ڈیٹا کو مقامی طور پر plaintext data key سے encrypt کیا جاتا ہے، جسے ضائع کر دیا جاتا ہے، جبکہ data key کی KMS-encrypted نقل ciphertext کے ساتھ محفوظ کی جاتی ہے۔ *دیگر کیوں نہیں:* A اور C — KMS کبھی بڑے payloads کو براہِ راست یا streaming کے ذریعے encrypt نہیں کرتا؛ D — hard-coded keys ایک anti-pattern ہیں اور envelope encryption نہیں۔

**8. جواب: C** — Secrets Manager کی alternating-users حکمت عملی دو credentials برقرار رکھتی ہے اور انہیں باری باری rotate کرتی ہے، اس لیے پچھلے credential استعمال کرنے والے موجودہ connections rotation کے دوران کام کرتے رہتے ہیں۔ *دیگر کیوں نہیں:* A — Parameter Store میں کوئی بلٹ-ان rotation نہیں؛ آپ کو سب کچھ خود بنانا پڑے گا؛ B — single-user rotation فوری طور پر پرانے password کو invalidate کرتی ہے، connection ناکامیوں کا خطرہ مول لیتے ہوئے؛ D — KMS rotation encryption key material کو rotate کرتی ہے، ڈیٹابیس passwords کو نہیں۔

**9. جواب: C** — SSE-C گاہک کو ہر درخواست کے ساتھ encryption key فراہم کرنے دیتا ہے؛ AWS اسے عمل کے لیے memory میں استعمال کرتا ہے اور اسے کبھی محفوظ نہیں کرتا۔ *دیگر کیوں نہیں:* A — SSE-S3 keys مکمل طور پر AWS کے زیر انتظام ہیں؛ B — SSE-KMS keys AWS KMS میں محفوظ ہوتی ہیں؛ D — aws/s3 ایک AWS کے زیر انتظام KMS key ہے اور بالکل client-side نہیں۔

**10. جواب: B** — Object Lock compliance mode retention ختم ہونے تک کسی بھی user، بشمول root، کے ذریعے deletion یا overwriting کو روکتا ہے، اور Object Lock کو versioning درکار ہے۔ *دیگر کیوں نہیں:* A — governance mode کو s3:BypassGovernanceRetention والے users bypass کر سکتے ہیں؛ C — ایک bucket policy کو root user تبدیل یا ہٹا سکتا ہے؛ D — lifecycle expiration مدت کے دوران deletion نہیں روکتا۔

**11. جواب: B** — NACLs stateless ہیں، اس لیے کلائنٹس کے ephemeral source ports تک response ٹریفک کو لازماً صریحاً outbound اجازت دینی چاہیے۔ *دیگر کیوں نہیں:* A — NACLs stateless ہیں، stateful نہیں؛ C — security groups stateful ہیں، اس لیے واپسی ٹریفک خودکار ہے؛ D — 0.0.0.0/0 NACL rules میں بالکل درست ہے۔

**12. جواب: A, B** — Security groups stateful ہیں (واپسی ٹریفک خودکار طور پر اجازت یافتہ)، اور NACLs numbered rules کا ترتیب میں جائزہ لیتی ہیں اور Deny کی حمایت کرتی ہیں۔ *دیگر کیوں نہیں:* C — security groups صرف Allow rules کی حمایت کرتے ہیں؛ D — NACLs subnets سے منسلک ہوتی ہیں، ENIs سے نہیں (security groups ENIs سے منسلک ہوتے ہیں)؛ E — security group rules سب بغیر ترتیب کے ایک ساتھ جانچے جاتے ہیں۔

**13. جواب: B** — Shield Advanced محفوظ وسائل جیسے CloudFront اور ALB کے لیے Shield Response Team، DDoS cost protection، اور حملے کی نمائش/diagnostics فراہم کرتا ہے۔ *دیگر کیوں نہیں:* A — Shield Standard خودکار ہے لیکن اس میں کوئی SRT رسائی یا cost protection شامل نہیں؛ C — WAF layer-7 request patterns کو حل کرتا ہے، پورے تقاضے کے سیٹ کو نہیں؛ D — GuardDuty خطرے کی نشاندہی ہے، DDoS تحفظ نہیں۔

**14. جواب: B** — ALB پر AWS WAF SQLi managed rule group کے ساتھ ایک rate-based rule کے ساتھ دونوں حملے کے patterns کو کسی ایپلیکیشن کوڈ تبدیلی کے بغیر بلاک کرتا ہے۔ *دیگر کیوں نہیں:* A — زیادہ development effort؛ C — Shield Standard L3/L4 floods کا احاطہ کرتا ہے، SQL injection کا نہیں؛ D — security groups request مواد کا معائنہ نہیں کر سکتے۔

**15. جواب: B** — GuardDuty = logs اور threat intel سے خطرے کی نشاندہی؛ Macie = S3 میں حساس ڈیٹا (PII) دریافت؛ Inspector = EC2، ECR images، اور Lambda کی vulnerability (CVE) اسکیننگ۔ *دیگر کیوں نہیں:* A، C، D — ہر ایک خدمت-تا-مقصد نقشوں میں سے کم از کم دو کو الٹ پلٹ دیتا ہے۔

**16. جواب: B** — Gateway endpoints بالکل S3 اور DynamoDB کے لیے موجود ہیں، ٹریفک کو AWS نیٹ ورک پر رکھتے ہیں، اور ان کا کوئی hourly یا data processing چارج نہیں۔ *دیگر کیوں نہیں:* A — NAT gateway public IP space کے ذریعے روٹ کرتا ہے اور فی گھنٹہ/فی GB لاگت لیتا ہے؛ C — interface endpoints hourly اور data چارجز لیتے ہیں، اس لیے کم ترین لاگت نہیں؛ D — ایک internet gateway ٹریفک کو پبلک انٹرنیٹ پر بھیجتا ہے۔

**17. جواب: A** — IMDSv2 کو ایک PUT درخواست کے ذریعے حاصل کردہ ایک session token درکار ہوتا ہے، جسے عام SSRF vectors انجام نہیں دے سکتے؛ HttpTokens=required نافذ کرنا IMDSv1 credential چوری کو بلاک کرتا ہے۔ *دیگر کیوں نہیں:* B — بہت سے agents اور SDKs کو جائز طور پر IMDS درکار ہوتا ہے؛ C — NACLs ایک instance اور اس کے اپنے metadata endpoint کے درمیان link-local ٹریفک کو متاثر نہیں کرتیں؛ D — فائلوں میں static credentials role credentials سے کہیں بدتر ہیں۔

**18. جواب: C** — Standard Parameter Store parameters مفت ہیں اور plaintext config کے لیے ٹھیک ہیں؛ Secrets Manager صرف 5 passwords کے لیے بلٹ-ان rotation شامل کرتا ہے، لاگت کم کرتے ہوئے۔ *دیگر کیوں نہیں:* A — 200 سادہ config اقدار کے لیے Secrets Manager فی secret قیمت ادا کرنا فضول ہے؛ B — اکیلے Parameter Store میں passwords کے لیے کوئی native rotation نہیں؛ D — Parameter Store میں کوئی بلٹ-ان خودکار rotation نہیں، اس لیے یہ آپشن ایک ایسی صلاحیت بیان کرتا ہے جو موجود نہیں۔

**19. جواب: B** — S3 Bucket Keys S3 کو KMS key سے ایک محدود وقت کی bucket کی سطح کی data key پیدا کرنے دیتے ہیں، فی object KMS درخواستوں (اور لاگت) کو ڈرامائی طور پر کم کرتے ہوئے جبکہ SSE-KMS برقرار رکھتے ہوئے۔ *دیگر کیوں نہیں:* A — SSE-S3 KMS تقاضے کو ترک کرتا ہے؛ C — rotation کی تعدد فی request API حجم کو متاثر نہیں کرتی؛ D — imported key material request counts کو تبدیل نہیں کرتا۔

**20. جواب: B, D** — Explicit Deny policy evaluation میں ہمیشہ کسی بھی Allow پر جیتتا ہے، اور permissions boundaries صرف permissions کو cap کرتی ہیں (کبھی نہیں دیتیں)۔ *دیگر کیوں نہیں:* A — SCPs guardrails ہیں جو دستیاب permissions کو محدود کرتی ہیں؛ وہ کچھ نہیں دیتیں؛ C — resource-based policies معمول کے مطابق خود سے cross-account رسائی دیتی ہیں؛ E — IAM default طور پر implicit deny کرتا ہے جب کوئی چیز کسی عمل کی اجازت نہ دے۔

### حصہ 2 — سوالات 21–37

**21. جواب: C** — Multi-AZ AZ ناکامی کے لیے خودکار failover فراہم کرتا ہے؛ read replicas reporting read ٹریفک جذب کرتے ہیں — دو الگ مسائل کے لیے دو features۔ *دیگر کیوں نہیں:* A — ایک روایتی Multi-AZ standby reads پیش نہیں کر سکتا؛ B — replica promotion دستی (یا scripted) ہے اور اکیلے replicas خودکار HA failover نہیں دیتے؛ D — ایک بڑا single-AZ instance AZ resilience پر دونوں تقاضوں میں ناکام ہوتا ہے۔

**22. جواب: B** — ایک Multi-AZ DB cluster deployment ایک reader endpoint کے ساتھ تین AZs میں ایک writer اور دو readable standbys چلاتا ہے، اس لیے standby capacity reads پیش کرتی ہے جبکہ تیز خودکار failover کی بھی حمایت کرتی ہے۔ *دیگر کیوں نہیں:* A — ایک instance deployment میں واحد standby کوئی ٹریفک پیش نہیں کرتا؛ C — read replicas منظم خودکار failover فراہم نہیں کرتیں اور RDS ڈیٹابیسز ALB کے ذریعے load-balanced نہیں ہوتیں؛ D — Single-AZ میں بالکل کوئی failover نہیں۔

**23. جواب: B** — Aurora Global Database replication storage layer پر asynchronous ہے جس میں عام طور پر ذیلی سیکنڈ lag ہوتا ہے، اس لیے cross-Region RPO صفر کے قریب ہے لیکن کبھی بالکل 0 کی ضمانت نہیں دی جا سکتی۔ *دیگر کیوں نہیں:* A — replication Regions کے آر پار synchronous نہیں؛ C — write forwarding writes کو primary تک روٹ کرتا ہے؛ یہ replication semantics تبدیل نہیں کرتا؛ D — replication lag عام طور پر ایک سیکنڈ سے کم ہے، 5 منٹ کا شیڈول نہیں۔

**24. جواب: B** — Recovery Time Objective زیادہ سے زیادہ قابل برداشت downtime ہے (4 گھنٹے)؛ Recovery Point Objective زیادہ سے زیادہ قابل برداشت ڈیٹا نقصان window ہے (15 منٹ)۔ *دیگر کیوں نہیں:* A — تعریفیں الٹ دیتا ہے؛ C — MTBF/MTTR reliability statistics ہیں، DR objectives نہیں؛ D — SLA ایک contractual عہد ہے، ڈیٹا نقصان metric نہیں۔

**25. جواب: B** — Pilot light ڈیٹا کو مسلسل replicated اور بنیادی وسائل کو فراہم لیکن بند رکھتا ہے، کم لاگت پر دسیوں منٹ کا RTO دیتے ہوئے — ایک عین میل۔ *دیگر کیوں نہیں:* A — backup and restore میں کوئی live replication اور کہیں زیادہ لمبا RTO نہیں؛ C — warm standby stack کو چلتا رکھتا ہے، درکار سے زیادہ لاگت لیتے ہوئے؛ D — active/active سب سے مہنگا ہے اور تقاضے سے کہیں آگے ہے۔

**26. جواب: C, E** — Warm standby ایک کم پیمانے، ہمیشہ چلنے والی مکمل نقل ہے؛ multi-site active/active سب سے زیادہ لاگت پر صفر کے قریب RTO کے ساتھ متعدد Regions سے پیش کرتا ہے۔ *دیگر کیوں نہیں:* A — backup and restore کی تعریف ہی وسائل کو پہلے سے نہ چلانے سے ہوتی ہے؛ B — backup and restore کا سب سے زیادہ (بدترین) RTO ہے؛ D — pilot light فراہم لیکن بند ہے، مکمل گنجائش ٹریفک پیش نہیں کرتا۔

**27. جواب: B** — جب 30 سیکنڈ کا visibility timeout پروسیسنگ کے دوران ختم ہو جاتا ہے، تو message دوبارہ ظاہر ہوتا ہے اور ایک اور consumer اسے دوبارہ پروسیس کرتا ہے؛ visibility timeout کو زیادہ سے زیادہ پروسیسنگ وقت سے لمبا سیٹ کریں (مثلاً ایک بہترین طریقے کے طور پر 6×)۔ *دیگر کیوں نہیں:* A — FIFO بمقابلہ standard وجہ نہیں؛ C — long polling خالی-receive کارکردگی کو متاثر کرتا ہے، duplicates کو نہیں؛ D — retention مدت یہ طے کرتی ہے کہ messages کتنی دیر برقرار رہتے ہیں، redelivery نہیں۔

**28. جواب: A** — maxReceiveCount کے ساتھ ایک redrive policy بار بار ناکام ہونے والے ("poison pill") messages کو offline تجزیے کے لیے ایک dead-letter queue میں منتقل کرتی ہے، لامتناہی retry loop روکتے ہوئے۔ *دیگر کیوں نہیں:* B — ایک مختصر visibility timeout loop کو تیزی سے گھماتا ہے؛ C — FIFO خراب messages کو ضائع نہیں کرتی؛ D — 1 منٹ کا retention درست messages کو بھی expire کر دے گا۔

**29. جواب: B** — FIFO queues ایک MessageGroupId کے اندر exactly-once processing اور سخت ordering کی ضمانت دیتے ہیں؛ account ID کو group ID کے طور پر استعمال کرنا cross-account parallelism کے ساتھ فی account ordering دیتا ہے (اور high-throughput FIFO mode مزید scale کر سکتا ہے)۔ *دیگر کیوں نہیں:* A — standard queues ترتیب یا exactly-once کی ضمانت نہیں دے سکتے؛ C — SNS اس pattern کے لیے کوئی ordering یا exactly-once processing ضمانت فراہم نہیں کرتا؛ D — ایک واحد group ID ہر چیز کو serialize کرتا ہے، throughput تباہ کرتے ہوئے۔

**30. جواب: B** — SNS-to-SQS fan-out ہر event کو ہر queue تک پہنچاتا ہے، جہاں ہر consumer کو پائیدار buffering اور آزاد processing رفتار ملتی ہے۔ *دیگر کیوں نہیں:* A — ایک queue پر تین consumers messages کو تقسیم کر دیتے ہیں؛ ہر message صرف ایک consumer کو جاتا ہے؛ C — ترتیب وار invocation buffering کے ساتھ آزاد متوازی processing نہیں؛ D — email subscriptions انسانوں تک پہنچاتی ہیں، پائیدار ایپلیکیشن buffers تک نہیں۔

**31. جواب: B** — Reserved concurrency اہم functions کے لیے وقف concurrency نکال دیتی ہے (اور sale function کو cap کرنا اس کا blast radius محدود کرتا ہے)، ایک function کو مشترکہ account pool ختم کرنے سے روکتے ہوئے۔ *دیگر کیوں نہیں:* A — ایک لمبا timeout concurrency slots کو زیادہ دیر تک پکڑے رکھتا ہے، throttling کو بدتر کرتے ہوئے؛ C — provisioned concurrency environments کو pre-warm کرتی ہے لیکن account concurrency quota نہیں بڑھاتی؛ D — memory size concurrency limits کو متاثر نہیں کرتا۔

**32. جواب: B** — Standard workflows ایک سال تک چلتے ہیں اور waitForTaskToken callback pattern execution کو بغیر کسی کمپیوٹ لاگت کے روک دیتا ہے جب تک SendTaskSuccess/SendTaskFailure token واپس نہ کرے۔ *دیگر کیوں نہیں:* A — Express workflows 5 منٹ پر زیادہ سے زیادہ ہوتے ہیں؛ C — Lambda زیادہ سے زیادہ 15 منٹ چل سکتا ہے اور سونا پیسہ ضائع کرتا ہے؛ D — EventBridge schedules events متحرک کر سکتے ہیں لیکن workflow state کو روک اور دوبارہ شروع نہیں کر سکتے۔

**33. جواب: A** — Express workflows بہت اعلیٰ شرح، مختصر مدتی، at-least-once executions کے لیے کم لاگت پر بنائے گئے ہیں؛ Standard workflows reconciliation job کے لیے exactly-once semantics، ایک سال تک دورانیہ، اور مکمل execution history فراہم کرتے ہیں۔ *دیگر کیوں نہیں:* B — Standard اس استعمال کے معاملے کے لیے 90,000 starts/سیکنڈ کو معاشی طور پر برقرار نہیں رکھ سکتا؛ C — Express 5 منٹ پر زیادہ سے زیادہ اور at-least-once ہے، 12 گھنٹے exactly-once job میں ناکام ہوتے ہوئے؛ D — الٹ تفویض دونوں workloads میں ناکام ہوتی ہے۔

**34. جواب: B** — Failover routing تمام ٹریفک کو primary کو بھیجتا ہے جب تک اس کا health check پاس ہو، پھر جب یہ ناکام ہو تو خودکار طور پر secondary record کے ساتھ جواب دیتا ہے۔ *دیگر کیوں نہیں:* A — weighted 50/50 ہر وقت آدھی ٹریفک passive نقل کو بھیجتا ہے؛ C — latency-based routing ٹریفک کو کارکردگی کے لحاظ سے تقسیم کرتا ہے، active/passive ارادے کے لحاظ سے نہیں؛ D — geolocation user مقام کے لحاظ سے روٹ کرتا ہے، endpoint health پر مبنی failover سے غیر متعلق۔

**35. جواب: B** — ELB health check قسم شامل کرنا ASG کو ALB target-health ناکامیوں کو غیر صحت مند سمجھنے پر مجبور کرتا ہے، اس لیے crashed-app instances ختم اور تبدیل کیے جاتے ہیں حالانکہ EC2 status checks پاس ہوتے ہیں۔ *دیگر کیوں نہیں:* A — detailed monitoring صرف metric granularity تبدیل کرتا ہے؛ C — grace period health evaluation کو تاخیر دیتا ہے، جو درکار کے برعکس ہے؛ D — load balancer قسم مسئلہ نہیں۔

**36. جواب: B** — Network Load Balancer layer 4 (TCP/UDP) پر کام کرتا ہے، لاکھوں درخواستیں فی سیکنڈ انتہائی کم latency کے ساتھ سنبھالتا ہے، اور فی AZ ایک static (یا Elastic) IP کی حمایت کرتا ہے۔ *دیگر کیوں نہیں:* A — ALB layer 7 (HTTP/HTTPS) ہے اور natively کوئی static IPs پیش نہیں کرتا؛ C — Gateway Load Balancer inline virtual appliances تعینات کرنے کے لیے ہے؛ D — Classic Load Balancer قدیم ہے اور کسی بھی تقاضے کو پورا نہیں کرتا۔

**37. جواب: B, C** — CRR کو دونوں buckets پر versioning فعال درکار ہے، اور EFS Standard classes regional (multi-AZ) فائل سسٹمز ہیں جو AZs کے آر پار بیک وقت mountable ہیں۔ *دیگر کیوں نہیں:* A — CRR ترتیب کے بعد صرف نئے objects replicate کرتا ہے جب تک آپ موجودہ کے لیے S3 Batch Replication نہ چلائیں؛ D — EFS ہزاروں ہم وقت NFS clients کی حمایت کرتا ہے، single-attach EBS کے برعکس؛ E — versioning replication کے لیے ایک پیشگی شرط ہے لیکن خود کچھ replicate نہیں کرتی۔

### حصہ 3 — سوالات 38–53

**38. جواب: B** — io2 Block Express 256,000 IOPS تک، ذیلی ملی سیکنڈ latency، اور 99.999% durability فراہم کرتا ہے، تینوں تقاضوں کو پورا کرتے ہوئے۔ *دیگر کیوں نہیں:* A — gp3 اب IOPS نمبر تک پہنچ سکتا ہے (اس کی cap 2025 کے اواخر میں 80,000 تک بڑھائی گئی)، لیکن یہ دیگر دو تقاضوں میں ناکام ہوتا ہے: durability 99.8–99.9% ہے (سوال 99.999% مانگتا ہے) اور اس کی latency سنگل ڈیجٹ ملی سیکنڈ ہے، ضمانت شدہ ذیلی ملی سیکنڈ نہیں؛ B واحد قسم ہے جو تینوں کو پورا کرتی ہے؛ C — st1 HDD پر مبنی ہے اور IOPS-intensive ڈیٹابیسز کے لیے غیر موزوں ہے؛ D — gp2 16,000 IOPS پر زیادہ سے زیادہ ہوتا ہے اور bursting ایک مستقل ضمانت نہیں۔

**39. جواب: C** — FSx for Lustre HPC کے لیے خاص طور پر بنایا گیا ہے جس میں ذیلی ملی سیکنڈ latency، سینکڑوں GB/s throughput، اور native S3 انضمام (lazy-loading اور exporting) ہے۔ *دیگر کیوں نہیں:* A — EFS Lustre کے HPC throughput/latency پروفائل سے میل نہیں کھا سکتا؛ B — FSx for Windows SMB/Windows workloads کو ہدف بناتا ہے، Linux HPC کو نہیں؛ D — Mountpoint for S3 مشترکہ POSIX فائل سسٹم semantics یا درکار latency فراہم نہیں کرتا۔

**40. جواب: B** — FSx for Windows File Server natively SMB، Active Directory انضمام، اور NTFS ACLs کی حمایت کرتا ہے، اور Multi-AZ mode دو-AZ تقاضے کا احاطہ کرتا ہے۔ *دیگر کیوں نہیں:* A — EFS NFS/POSIX ہے اور NTFS permissions محفوظ نہیں رکھتا؛ C — S3 object storage ہے، ایک SMB فائل share نہیں؛ D — Lustre ایک Linux HPC فائل سسٹم ہے جس میں SMB/AD سپورٹ نہیں۔

**41. جواب: D, E** — Transfer Acceleration اپلوڈز کو AWS edge/backbone نیٹ ورک پر روٹ کرتا ہے تاکہ طویل فاصلے کی منتقلیاں تیز ہوں، اور multipart upload منتقلیوں کو متوازی کرتا ہے اور ناکام parts کو پورے 40 GB فائل کو دوبارہ شروع کیے بغیر دوبارہ آزمانے دیتا ہے۔ *دیگر کیوں نہیں:* A — One Zone-IA redundancy تبدیل کرتا ہے، اپلوڈ کارکردگی نہیں؛ B — آپ اپلوڈز کے لیے S3 کے سامنے ایک ALB نہیں رکھ سکتے؛ C — CRR اپلوڈ کے بعد replicate کرتا ہے اور ingest میں مدد نہیں کرتا۔

**42. جواب: B** — Instance store NVMe SSDs جسمانی طور پر host سے منسلک ہیں، عارضی ڈیٹا کے لیے کم ترین latency پیش کرتے ہوئے جو دوبارہ پیدا ہو سکتا ہے۔ *دیگر کیوں نہیں:* A اور D — EBS نیٹ ورک عبور کرتا ہے اور latency بڑھاتا ہے؛ C — EFS ایک نیٹ ورک فائل سسٹم ہے جس کی latency دونوں سے زیادہ ہے۔

**43. جواب: B** — کم مجموعی utilization کے ساتھ hot partitions پر throttling کلاسیکی low-cardinality partition key مسئلہ ہے؛ ایک high-cardinality key (مثلاً game_id#player_id) ٹریفک کو یکساں طور پر تقسیم کرتا ہے۔ *دیگر کیوں نہیں:* A — capacity mode تبدیلیاں hot partitions ٹھیک نہیں کرتیں؛ C — ایک LSI وہی partition key اور وہی hot partitions شیئر کرتا ہے؛ D — Streams تبدیلیاں کیپچر کرتی ہیں، وہ writes کو دوبارہ تقسیم نہیں کرتیں۔

**44. جواب: B** — DAX ایک DynamoDB مطابق، API-transparent in-memory cache ہے جو کم سے کم کوڈ تبدیلی کے ساتھ مائیکرو سیکنڈ reads فراہم کرتا ہے۔ *دیگر کیوں نہیں:* A — ElastiCache کو cache کا انتظام کرنے کے لیے ایپلیکیشن دوبارہ لکھنے درکار ہیں؛ C — ایک GSI hot items کو cache نہیں کرتا یا مائیکرو سیکنڈ latency نہیں دیتا؛ D — Global Tables multi-region رسائی کو حل کرتے ہیں، single-item read latency کو نہیں۔

**45. جواب: B** — ایک GSI کسی بھی وقت ایک موجودہ table میں شامل کیا جا سکتا ہے، ایک نئی partition/sort key مجموعہ کی حمایت کرتا ہے، اور اس کی اپنی provisioned throughput base table سے الگ تھلگ ہوتی ہے۔ *دیگر کیوں نہیں:* A — LSIs صرف table تخلیق کے وقت بنائے جا سکتے ہیں، table کی partition key شیئر کرتے ہیں، اور table throughput شیئر کرتے ہیں؛ C — table دوبارہ بنانا خلل ڈالنے والا اور غیر ضروری ہے؛ D — Streams change capture کے لیے ہیں، ad hoc queries کے لیے نہیں۔

**46. جواب: B** — DynamoDB TTL expire شدہ items کو background میں خودکار طور پر بغیر کسی اضافی لاگت کے حذف کر دیتا ہے۔ *دیگر کیوں نہیں:* A — scheduled scans read/write capacity استعمال کرتے ہیں اور پیسہ خرچ کرتے ہیں؛ C — lifecycle policies ایک S3/EFS تصور ہیں، DynamoDB نہیں؛ D — Streams downstream events فلٹر کرتی ہیں لیکن table سے items حذف نہیں کرتیں۔

**47. جواب: B** — RDS Proxy connections کو pool اور multiplex کرتا ہے، ہزاروں Lambda invocations کو صرف ایک connection-string تبدیلی کے ساتھ ڈیٹابیس connections کے ایک چھوٹے سیٹ کو شیئر کرنے دیتا ہے۔ *دیگر کیوں نہیں:* A — upsizing مہنگا ہے اور صرف حد کو ملتوی کرتا ہے؛ C — ایک ڈیٹابیس منتقلی ایک بڑی ایپلیکیشن تبدیلی ہے؛ D — Lambda کو 10 پر throttle کرنا connection management حل کرنے کے بجائے throughput کو معذور کر دیتا ہے۔

**48. جواب: A** — reader endpoint کے پیچھے Aurora Replicas (15 تک) replica auto scaling کے ساتھ کم سے کم operational کام کے ساتھ read ٹریفک offload کرتے ہیں۔ *دیگر کیوں نہیں:* B — Aurora ایک passive standby ماڈل استعمال نہیں کرتا؛ کلاسیکی RDS اصطلاحات میں standbys ٹریفک پیش نہیں کرتے؛ C — sharding ایک read-scaling مسئلے کے لیے زیادہ operational overhead ہے؛ D — Backtrack ڈیٹابیس کو وقت میں پیچھے کرتا ہے، یہ reads پیش نہیں کرتا۔

**49. جواب: B** — Global Accelerator دو static anycast IPs فراہم کرتا ہے، UDP کی حمایت کرتا ہے، متعدد regions میں NLBs کے سامنے رہتا ہے، اور AWS backbone پر سیکنڈوں میں fail over کرتا ہے۔ *دیگر کیوں نہیں:* A — CloudFront HTTP/HTTPS مواد پیش کرتا ہے، اختیاری UDP نہیں، اور اس کے کوئی static client-facing IPs نہیں؛ C — Route 53 latency routing failover کے لیے DNS TTLs پر انحصار کرتا ہے اور کوئی static IPs فراہم نہیں کرتا؛ D — ایک ALB regional اور HTTP-only ہے۔

**50. جواب: B** — Geolocation routing user کے ملک کی بنیاد پر DNS queries کا جواب دیتا ہے، licensing تعمیل کے لیے جرمنی→eu-central-1 اور فرانس→eu-west-3 کو deterministically نافذ کرتے ہوئے۔ *دیگر کیوں نہیں:* A — latency routing سب سے تیز endpoint منتخب کرتا ہے، جو licensing قاعدے کی خلاف ورزی کر سکتا ہے؛ C — geoproximity bias فاصلے کے لحاظ سے حدود منتقل کرتا ہے لیکن سخت ملک نقشہ سازی کی ضمانت نہیں دیتا؛ D — weighted routing وزن کے لحاظ سے بے ترتیب طور پر تقسیم کرتا ہے، مقام کو نظرانداز کرتے ہوئے۔

**51. جواب: C** — ایک cluster placement group instances کو ایک AZ میں قریب پیک کرتا ہے کم ترین latency اور سب سے زیادہ packets-per-second کے لیے، سختی سے منسلک MPI workloads کے لیے مثالی۔ *دیگر کیوں نہیں:* A — spread groups instances کو الگ ہارڈویئر پر علیحدہ کرتے ہیں، latency بڑھاتے ہوئے، اور فی AZ 7 پر cap ہوتے ہیں؛ B — partition groups تقسیم شدہ ڈیٹا سسٹمز کے لیے fault domains کو الگ تھلگ کرتے ہیں، کم latency MPI کے لیے نہیں؛ D — علیحدہ subnets instances کو co-locate کرنے کے لیے کچھ نہیں کرتے۔

**52. جواب: B** — Amazon Data Firehose مکمل منظم ہے، کسی consumers یا shard انتظام کی ضرورت نہیں، records buffer کرتا ہے، اور S3 تک پہنچانے سے پہلے JSON کو Parquet میں تبدیل کر سکتا ہے۔ *دیگر کیوں نہیں:* A — Kinesis Data Streams کو consumers لکھنے/سنبھالنے درکار ہیں؛ C — SQS کے ساتھ EC2 pollers بنانے اور چلانے کے لیے custom بنیادی ڈھانچہ ہے؛ D — MSK کو Kafka clusters اور connectors سنبھالنے درکار ہیں۔

**53. جواب: B** — Glue crawlers schema کا Data Catalog میں اندازہ لگاتے ہیں اور Athena S3 فائلوں کے خلاف براہِ راست serverless SQL چلاتا ہے۔ *دیگر کیوں نہیں:* A — Redshift کو cluster فراہمی اور ڈیٹا loading درکار ہے؛ C — EMR کا مطلب ایک long-running cluster سنبھالنا ہے؛ D — RDS کو ڈیٹا کو ایک ڈیٹابیس سرور میں لوڈ کرنا درکار ہوگا۔

### حصہ 4 — سوالات 54–65

**54. جواب: C** — Checkpointed، restartable batch jobs مثالی Spot workload ہیں، اور instance types/AZs کے آر پار ایک diversified Spot Fleet ~90% تک بچت پر interruption اثر کم کرتا ہے۔ *دیگر کیوں نہیں:* A — On-Demand یہاں بغیر فائدے کے رعایت چھوڑ دیتا ہے؛ B اور D — commitments Spot سے چھوٹی رعایتیں دیتے ہیں اور ایک interruption-friendly job کے لیے خرچ lock کر دیتے ہیں۔

**55. جواب: C** — Compute Savings Plans EC2 (کسی بھی family/region)، Fargate، اور Lambda کے آر پار خودکار طور پر لاگو ہوتے ہیں، جدید کاری کے راستے کے مطابق۔ *دیگر کیوں نہیں:* A — EC2 Instance Savings Plans ایک region میں ایک instance family سے بندھے ہیں اور Fargate/Lambda کو خارج کرتے ہیں؛ B اور D — Reserved Instances صرف EC2 کا احاطہ کرتے ہیں اور Fargate یا Lambda پر لاگو نہیں ہوتے۔

**56. جواب: B** — صرف EC2 Standard Reserved Instances Reserved Instance Marketplace پر فہرست کیے جا سکتے ہیں؛ RDS (اور دیگر خدمات کے) RIs دوبارہ نہیں بیچے جا سکتے۔ *دیگر کیوں نہیں:* A اور C — RDS RIs marketplace کے اہل نہیں؛ D — EC2 Standard RIs درحقیقت marketplace پر قابل فروخت ہیں۔

**57. جواب: B** — AWS instance کو reclaim کرنے سے دو منٹ پہلے ایک Spot interruption notice پہنچاتا ہے، drain اور checkpoint کرنے کا وقت دیتے ہوئے۔ *دیگر کیوں نہیں:* A — ایک وارننگ فراہم کی جاتی ہے؛ C اور D — 15 منٹ اور 24 گھنٹے Spot interruption windows نہیں (rebalance recommendations پہلے آ سکتی ہیں لیکن ایک ضمانت شدہ مقررہ window نہیں)۔

**58. جواب: B** — Glacier Flexible Retrieval کم archival storage لاگت اور Expedited retrievals پیش کرتا ہے جو ڈیٹا کو 1–5 منٹ میں واپس کرتے ہیں (تقریباً $0.03/GB)، 5 منٹ کے تقاضے کو پورا کرتے ہوئے۔ *دیگر کیوں نہیں:* A — Deep Archive کی تیز ترین retrieval ~12 گھنٹے ہے؛ C — Bulk retrievals 5–12 گھنٹے لیتے ہیں؛ D — Standard-IA فوری retrieve کرتا ہے لیکن 7 سالہ شاذ و نادر رسائی شدہ storage کے لیے کہیں زیادہ لاگت لیتا ہے۔

**59. جواب: B** — One Zone-IA Standard-IA سے ~20% کم لاگت لیتا ہے اور single-AZ durability سمجھوتہ دوبارہ پیدا کیے جا سکنے والے thumbnails کے لیے قابل قبول ہے۔ *دیگر کیوں نہیں:* A — Standard-IA اُس redundancy کے لیے زیادہ لاگت لیتا ہے جو ڈیٹا کو درکار نہیں؛ C — Intelligent-Tiering monitoring fees شامل کرتا ہے اور معلوم-شاذ و نادر رسائی کے لیے لاگت کم نہیں کرتا؛ D — Glacier Instant Retrieval کا اس pattern کے لیے ایک 90 دن کا کم سے کم اور ایک مختلف retrieval لاگت پروفائل ہے۔

**60. جواب: A, C** — Intelligent-Tiering ایک چھوٹی فی object monitoring/automation fee لیتا ہے، اور 128 KB سے کم objects محفوظ ہوتے ہیں لیکن نگرانی یا tier نہیں کیے جاتے (Frequent Access شرحوں پر bill کیے جاتے ہیں)۔ *دیگر کیوں نہیں:* B — Intelligent-Tiering کے اپنے خودکار tiers کے درمیان کوئی retrieval fees نہیں؛ D — یہ کبھی cross-region replicate نہیں کرتا؛ E — class میں ہر object کے لیے کوئی 90 دن کا کم سے کم نہیں۔

**61. جواب: B** — نامکمل multipart upload parts storage کے طور پر bill کیے جاتے ہیں لیکن objects کے طور پر پوشیدہ ہوتے ہیں؛ AbortIncompleteMultipartUpload کے ساتھ ایک lifecycle rule انہیں خودکار طور پر حذف کر دیتی ہے۔ *دیگر کیوں نہیں:* A — versioning storage بڑھائے گا، parts صاف نہیں کرے گا؛ C — storage class تبدیل کرنا orphaned parts نہیں ہٹاتا؛ D — Transfer Acceleration منتقلیاں تیز کرتا ہے لیکن پہلے سے ترک شدہ uploads صاف نہیں کرتا۔

**62. جواب: B** — gp3 IOPS/throughput کو size سے الگ کرتا ہے اور فی GB gp2 سے ~20% کم لاگت لیتا ہے، اس لیے درکار IOPS برقرار رکھتے ہوئے capacity کو right-size کیا جا سکتا ہے؛ منتقلی ایک online ModifyVolume عمل ہے۔ *دیگر کیوں نہیں:* A — io2 زیادہ مہنگا ہے، کم نہیں؛ C — st1 درکار IOPS فراہم نہیں کر سکتا؛ D — volumes حذف کرنا live ڈیٹا تباہ کر دیتا ہے۔

**63. جواب: B** — S3 کے لیے ایک gateway VPC endpoint مفت ہے اور ایک ہی region کی S3 ٹریفک کے لیے NAT gateway data processing چارجز ختم کرتا ہے۔ *دیگر کیوں نہیں:* A — ایک NAT instance پھر بھی EC2 اور operational لاگت لیتا ہے؛ C — interface endpoints فی گھنٹہ اور فی GB bill کرتے ہیں، مفت gateway endpoint سے زیادہ لاگت لیتے ہوئے؛ D — public subnets public IPv4 چارجز شامل کرتے ہیں اور سیکیورٹی کمزور کرتے ہیں۔

**64. جواب: B, E** — AWS ہر زیر استعمال public IPv4 ایڈریس کے لیے چارج کرتا ہے، اس لیے غیر ضروری ہٹانا لاگت کم کرتا ہے، اور AWS Budgets forecast/actual خرچ پر proactive threshold alerts فراہم کرتا ہے۔ *دیگر کیوں نہیں:* A — Elastic IPs بھی منسلک ہوتے ہوئے public IPv4 چارج کے تحت bill ہوتے ہیں؛ C — Compute Optimizer right-sizing تجویز کرتا ہے لیکن خرچ thresholds پر بلاک یا alert نہیں کر سکتا؛ D — Shield Advanced ایک DDoS خدمت ہے جو لاگت بڑھاتی ہے۔

**65. جواب: A** — Aurora Serverless v2 0 ACUs تک scaling کی حمایت کرتا ہے (auto-pause، 2024 کے اواخر سے دستیاب) اور connection پر خودکار طور پر دوبارہ شروع ہوتا ہے، idle کے دوران کمپیوٹ لاگت ختم کرتے ہوئے بغیر کسی دستی قدم کے۔ جاننے کے قابل باریکیاں: auto-pause کو حالیہ engine ورژنز درکار ہیں (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+، Aurora MySQL 3.08+)؛ pause کے بعد پہلے connection کو دوبارہ شروع ہونے میں ~15 سیکنڈ لگتے ہیں (24+ گھنٹے paused رہنے کے بعد زیادہ)؛ کمپیوٹ paused ہونے کے دوران storage bill ہوتا رہتا ہے؛ اور کوئی بھی چیز جو connections کھلے رکھے — ایک RDS Proxy، ایک keep-alive health check — pause کو مکمل طور پر روک دیتی ہے۔ *دیگر کیوں نہیں:* B — ایک رکا ہوا provisioned cluster خودکار طور پر بیدار نہیں ہوتا جب developers جڑتے ہیں (اور 7 دن بعد دوبارہ شروع ہوتا ہے)؛ C — headless global database secondaries DR کو حل کرتے ہیں، idle لاگت کو نہیں؛ D — scaled-in readers پھر بھی writer instance کو چلتا اور bill ہوتا چھوڑ دیتے ہیں۔

---

## اسکورنگ گائیڈ

| اسکور | نتیجے کی تشریح |
|---|---|
| 55–65 | امتحان کے لیے تیار۔ امتحان بک کریں۔ صرف اُن سوالات کا جائزہ لیں جو آپ سے چھوٹے۔ |
| 47–54 | پاسنگ رینج میں، لیکن margin پتلا ہے۔ ہر چھوٹے سوال کے پیچھے ابواب دوبارہ پڑھیں (domain tags استعمال کریں)، ایک ہفتے میں دوبارہ دیں۔ |
| 38–46 | بنیاد موجود ہے؛ خلا باقی ہیں۔ دوبارہ دینے سے پہلے اپنے کمزور ڈومینز کے لیے ضمیمہ B کا domain نقشہ پر کام کریں۔ |
| 38 سے کم | اپنے دو کمزور ترین ڈومینز کے ابواب سرے سے آخر تک دوبارہ پڑھیں، ان کی باب کی مشقیں دوبارہ کریں، پھر یہ امتحان دوبارہ دیں۔ |

اپنے چھوٹے ہوئے سوالات کو *domain کے لحاظ سے* ٹریک کریں (ہر سوال tagged ہے)۔ ایک ڈومین میں مرتکز کم اسکور ایک مرکوز مطالعاتی مسئلہ ہے؛ وہی اسکور یکساں طور پر پھیلا ہوا ایک رفتار یا سوال پڑھنے کا مسئلہ ہے — سست ہوں اور نشان لگائیں کہ ہر stem دراصل کیا تقاضا کرتا ہے (HA بمقابلہ DR، لاگت بمقابلہ کارکردگی، "MOST cost-effective" بمقابلہ "LEAST operational overhead")۔
