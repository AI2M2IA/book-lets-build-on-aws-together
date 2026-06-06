# ضمیمہ C: تصورات کی فہرست

کتاب میں متعارف کرایا گیا ہر اہم تصور، اس کے باب، استعمال کی گئی تشبیہ، اور اُس SAA-C03 ڈومین سے جوڑا گیا جہاں وہ ظاہر ہوتا ہے۔

اسے ایک مطالعاتی اشاریہ کے طور پر استعمال کریں: اگر امتحان سے پہلے آپ کسی تصور پر مبہم ہیں، تو اسے یہاں تلاش کریں اور سیاق و سباق کے لیے اس کے باب پر واپس جائیں۔

---

## A

**ACM (AWS Certificate Manager)** — ALB، CloudFront، اور API Gateway کے لیے مفت public TLS certificates، DNS validation کے ذریعے خودکار تجدید کے ساتھ۔ CloudFront certificates کو us-east-1 میں رہنا چاہیے۔ باب 16۔ ڈومین 1۔

**ACU (Aurora Capacity Unit)** — Aurora Serverless v2 capacity کی پیمائش کی اکائی۔ خودکار طور پر اسکیل ہوتی ہے اور، معاون engine ورژنز پر، جب کوئی connection کھلا نہ ہو تو 0 ACUs تک auto-pause ہو سکتی ہے۔ باب 24۔ ڈومین 3۔

**Alarm (CloudWatch)** — ایک قاعدہ جو اُس وقت چلتا ہے جب کوئی metric کسی threshold کو عبور کرے، ایک notification یا auto scaling عمل کو متحرک کرتے ہوئے۔ باب 7۔ ڈومین 2۔

**ALB (Application Load Balancer)** — Layer 7 load balancer جو path اور host قواعد کی بنیاد پر HTTP/HTTPS ٹریفک کو روٹ کرتا ہے۔ باب 7۔ ڈومین 2۔

**AMI (Amazon Machine Image)** — ایک template جس میں EC2 instance کے لیے OS، سافٹ ویئر، اور configuration ہوتی ہے۔ باب 4۔ ڈومین 3۔

**Architect mindset** — صرف "یہ کیسے کام کرتا ہے؟" کے بجائے یہ پوچھنا کہ "پہلے کیا ٹوٹتا ہے، ہمیں کیسے پتہ چلتا ہے، اور رات 3 بجے کوئی کیا کرتا ہے؟" باب 32، باب 34۔ بین الڈومین۔

**Architecture Decision Record (ADR)** — ایک مختصر دستاویز جو ایک فیصلے، اس کے متبادل، اس کی منطق، اور اس بات کو قید کرتی ہے کہ کیا چیز اس پر دوبارہ غور کا سبب بنے گی۔ باب 32۔ بین الڈومین۔

**Architecture review** — ایک منظم عمل جو احاطہ کرتا ہے: رکاوٹیں → نامعلوم → اختیارات → failure modes → نگرانی → runbooks۔ باب 32۔ بین الڈومین۔

**Athena** — S3 میں ڈیٹا کے لیے serverless SQL query خدمت۔ فی TB اسکین ادائیگی۔ Parquet/ORC columnar formats کے ساتھ بہترین۔ باب 26۔ ڈومین 3۔

**Auto Scaling Group (ASG)** — EC2 instances کا ایک گروپ جو مل کر منظم ہوتا ہے، خودکار طور پر غیر صحت مند instances کی جگہ لیتا ہے اور لوڈ کی بنیاد پر اسکیل ہوتا ہے۔ باب 7۔ ڈومین 2، 3۔

**Availability Zone (AZ)** — ایک region کے اندر ایک یا زیادہ جسمانی طور پر الگ ڈیٹا سینٹرز، کم latency والے links سے جڑے ہوئے۔ باب 2۔ ڈومین 2۔

---

## B

**AWS Backup** — EBS، RDS، DynamoDB، EFS، اور Storage Gateway میں مرکزی، پالیسی پر مبنی بیک اپ۔ cross-region اور cross-account نقلوں کی حمایت کرتا ہے۔ باب 18، 23۔ ڈومین 2۔

**AWS Batch** — Docker containers کے لیے منظم batch کمپیوٹ۔ ایک job definition (کیا چلانا ہے)، ایک job queue (jobs کہاں انتظار کرتے ہیں)، اور ایک compute environment (EC2 یا Fargate، On-Demand یا Spot) پر مشتمل۔ اُن workloads کے لیے جو Lambda کی 15 منٹ کی حد سے تجاوز کریں۔ باب 21۔ ڈومین 3۔

**Bucket (S3)** — S3 objects کے لیے ایک کنٹینر۔ Buckets کے منفرد عالمی نام ہوتے ہیں اور وہ ایک مخصوص region میں رہتے ہیں۔ باب 5۔ ڈومین 3۔

**Bucket policy** — کسی S3 bucket سے منسلک ایک resource پر مبنی policy جو IAM principals اور بیرونی accounts کے لیے رسائی کو قابو کرتی ہے۔ باب 5۔ ڈومین 1۔

---

## C

**Cache-aside pattern** — ایپلیکیشن پہلے cache چیک کرتی ہے؛ miss پر، ڈیٹابیس سے query کرتی ہے، پھر نتیجہ cache میں محفوظ کرتی ہے۔ باب 10۔ ڈومین 3۔

**Cache hit rate** — origin کے بجائے cache سے پیش کی جانے والی درخواستوں کا فیصد۔ زیادہ بہتر ہے۔ باب 13۔ ڈومین 3۔

**AWS Client VPN** — منظم OpenVPN endpoint۔ انفرادی آلات (لیپ ٹاپ، ورک سٹیشن) کو انٹرنیٹ پر ایک VPC سے جوڑتا ہے۔ Authentication بذریعہ Active Directory، کسی identity provider کے ساتھ SAML 2.0 federation، یا mutual TLS۔ split-tunnel اور full-tunnel modes کی حمایت کرتا ہے۔ Site-to-Site VPN (نیٹ ورک سے نیٹ ورک) سے موازنہ کریں۔ باب 11۔ ڈومین 1۔

**CloudFront** — AWS CDN۔ دنیا بھر میں 750+ edge locations پر مواد cache کرتا ہے۔ latency اور origin data transfer لاگت کم کرتا ہے۔ باب 13۔ ڈومین 3، 4۔

**CloudTrail** — ہر AWS API کال کو log کرتا ہے: کس نے، کیا، کب، کہاں سے۔ S3 میں محفوظ۔ آڈیٹنگ اور واقعے کی تفتیش کے لیے استعمال ہوتا ہے۔ ڈومین 1۔

**CloudWatch** — AWS وسائل اور custom ایپلیکیشنز کے لیے metrics، logs، alarms، اور dashboards۔ پوری کتاب میں حوالہ دیا گیا۔ تمام ڈومینز۔

**Amazon Cognito** — آپ کی ایپلیکیشن کے آخری صارفین کے لیے authentication: User Pools ایک منظم user directory ہیں (sign-up، sign-in، MFA، social login، JWTs)؛ Identity Pools عارضی AWS credentials جاری کرتے ہیں۔ IAM آپ کے انجینئرز کے لیے ہے؛ Cognito آپ کے گاہکوں کے لیے ہے۔ باب 14۔ ڈومین 1۔

**Cold start (Lambda)** — پہلے invocation پر (یا غیر فعالیت کے بعد) تاخیر جب Lambda execution environment کو initialize کرتا ہے۔ ختم کرنے کے لیے provisioned concurrency استعمال کریں۔ باب 20۔ ڈومین 3۔

**Compute Savings Plan** — فی گھنٹہ EC2 خرچ کی ایک ڈالر رقم کا عہد، کسی بھی instance type یا size پر لاگو ہوتا ہے۔ باب 27۔ ڈومین 4۔

**Config (AWS)** — وقت کے ساتھ AWS وسائل میں configuration تبدیلیوں کو ٹریک کرتا ہے اور قواعد کے خلاف تعمیل کا جائزہ لیتا ہے۔ باب 31۔ ڈومین 1۔

**AWS Control Tower** — multi-account governance کو خودکار کرتا ہے: ایک landing zone (management، log archive، اور audit accounts) منٹوں میں guardrails کے ساتھ بناتا ہے — Organizations، CloudTrail، اور Config کو ہاتھ سے جوڑنے کا تیار شدہ نسخہ۔ باب 14۔ ڈومین 1۔

**Cross-AZ data transfer** — ایک region کے اندر Availability Zones کے درمیان ٹریفک۔ ہر سمت $0.01/GB پر چارج کی جاتی ہے۔ باب 30۔ ڈومین 4۔

**Cross-region replication** — ڈیٹا (S3 CRR، Aurora Global، DynamoDB Global Tables) کو کسی مختلف region میں نقل کرنا۔ data transfer چارجز لگتے ہیں۔ باب 18، 23، 30۔ ڈومین 2۔

---

## D

**AWS DataSync** — فائل shares (NFS/SMB) کی S3، EFS، یا FSx تک agent پر مبنی منتقلی اور sync۔ "rsync سٹیرائڈز پر، ایک AWS console کے ساتھ۔" باب 25۔ ڈومین 3۔

**DAX (DynamoDB Accelerator)** — خاص طور پر DynamoDB کے لیے in-memory cache۔ مائیکرو سیکنڈ read latency۔ باب 9۔ ڈومین 3۔

**Dead Letter Queue (DLQ)** — ایک queue جہاں بار بار پروسیسنگ میں ناکام ہونے والے messages بھیجے جاتے ہیں، queue کی رکاوٹ کو روکتے ہوئے۔ باب 19۔ ڈومین 2۔

**AWS DMS (Database Migration Service)** — ڈیٹابیسز کو کم سے کم downtime کے ساتھ AWS منتقل کرتا ہے۔ Full load (ابتدائی نقل) کے ساتھ CDC (Change Data Capture) منتقلی کے دوران ماخذ اور ہدف کو ہم وقت رکھتا ہے۔ Homogeneous منتقلیاں (ایک ہی engine قسم): براہِ راست DMS استعمال کریں۔ Heterogeneous منتقلیاں (مختلف engine اقسام، مثلاً Oracle → Aurora PostgreSQL): پہلے SCT (Schema Conversion Tool)، پھر DMS۔ باب 8۔ ڈومین 3۔

**Dedicated Host** — ایک جسمانی EC2 سرور جو خصوصی طور پر آپ کے استعمال کے لیے محفوظ ہے۔ بعض سافٹ ویئر لائسنسوں کے لیے درکار۔ باب 27۔ ڈومین 4۔

**Defense in depth** — متعدد سیکیورٹی کنٹرولز کو پرت در پرت لگانا (IAM + security groups + NACLs + WAF + GuardDuty) تاکہ ایک پرت کے سمجھوتے سے نظام بے نقاب نہ ہو۔ باب 33۔ ڈومین 1۔

**Direct Connect** — کسی on-premises مقام سے AWS تک ایک وقف شدہ private نیٹ ورک کنکشن۔ VPN سے زیادہ مستقل۔ باب 25۔ ڈومین 3۔

**DLQ** — دیکھیں Dead Letter Queue۔

**DynamoDB** — کسی بھی پیمانے پر سنگل ڈیجٹ ملی سیکنڈ latency کے ساتھ مکمل منظم NoSQL ڈیٹابیس۔ Key-value اور document ماڈل۔ باب 9۔ ڈومین 3۔

**DynamoDB Auto Scaling** — CloudWatch metrics کی بنیاد پر provisioned read/write capacity کو خودکار طور پر ایڈجسٹ کرتا ہے۔ باب 29۔ ڈومین 4۔

**DynamoDB Streams** — ایک DynamoDB table میں تمام item تبدیلیوں کا ایک وقت کے لحاظ سے مرتب change log۔ event-driven پروسیسنگ کے لیے Lambda کے ساتھ استعمال ہوتا ہے۔ باب 9۔ ڈومین 2۔

---

## E

**EBS (Elastic Block Store)** — ایک واحد EC2 instance سے منسلک block storage۔ آزادانہ طور پر برقرار رہتا ہے۔ اقسام: gp3، io2، st1۔ باب 6۔ ڈومین 3۔

**EC2 (Elastic Compute Cloud)** — کلاؤڈ میں ورچوئل مشینیں۔ باب 4۔ ڈومین 3۔

**ECS (Elastic Container Service)** — منظم container orchestration۔ Fargate launch type سرور انتظام کو ختم کرتا ہے۔ باب 21۔ ڈومین 2، 3۔

**EFS (Elastic File System)** — متعدد EC2 instances سے قابل رسائی مشترکہ NFS فائل سسٹم۔ خودکار طور پر اسکیل ہوتا ہے۔ Storage classes میں Standard، Infrequent Access، اور Archive شامل ہیں، tiers کے درمیان خودکار حرکت کے لیے Intelligent-Tiering کے ساتھ۔ باب 6۔ ڈومین 3۔

**EKS (Elastic Kubernetes Service)** — AWS پر منظم Kubernetes control plane۔ باب 21۔ ڈومین 3۔

**Elastic Disaster Recovery (DRS)** — سرورز (on-premises یا EC2) کی کم لاگت staging علاقے میں مسلسل بلاک سطح کی replication، منٹوں میں شروع کیے جانے والے recovery instances کے ساتھ — ایک منظم pilot light۔ باب 18۔ ڈومین 2۔

**ElastiCache** — منظم in-memory caching۔ Redis (زیادہ خصوصیات) یا Memcached (آسان تر)۔ باب 10۔ ڈومین 3۔

**Elastic IP** — ایک static public IP ایڈریس جسے آپ مختص کر کے EC2 instances سے دوبارہ منسلک کر سکتے ہیں۔ باب 11۔ ڈومین 3۔

**Envelope encryption** — ایک pattern جہاں ڈیٹا کو ایک data key (DEK) سے encrypt کیا جاتا ہے، اور DEK کو ایک master key (KMS میں CMK) سے encrypt کیا جاتا ہے۔ باب 16۔ ڈومین 1۔

**EventBridge** — AWS خدمات، SaaS شراکت داروں، اور custom ماخذ سے واقعات کو targets تک روٹ کرنے کے لیے event bus۔ Scheduled rules کی حمایت کرتا ہے۔ باب 22۔ ڈومین 2۔

**Explicit deny** — ایک IAM deny statement جسے کسی بھی allow سے override نہیں کیا جا سکتا۔ تمام allows پر فوقیت رکھتا ہے۔ باب 3۔ ڈومین 1۔

---

## F

**Failover routing (Route 53)** — جب primary health checks میں ناکام ہو تو ٹریفک کو secondary endpoint تک روٹ کرتا ہے۔ باب 12۔ ڈومین 2۔

**Fargate** — ECS اور EKS کے لیے serverless کمپیوٹ engine۔ سنبھالنے کے لیے کوئی EC2 instances نہیں۔ باب 21۔ ڈومین 3۔

**Fan-out pattern** — ایک SNS topic بیک وقت متعدد SQS queues کو وہی message پہنچاتا ہے۔ باب 19۔ ڈومین 2۔

**FIFO queue (SQS)** — Exactly-once processing، سخت ordering۔ standard queues سے کم throughput۔ باب 19۔ ڈومین 2۔

**Failure mode** — ایک مخصوص طریقہ جس سے ایک نظام ناکام ہو سکتا ہے۔ پیداوار سے پہلے failure modes کی شناخت فن تعمیر کے جائزے کا مرکز ہے۔ باب 32۔ بین الڈومین۔

---

## G

**Gateway Endpoint** — S3 اور DynamoDB کے لیے ایک مفت VPC endpoint قسم۔ ٹریفک کو AWS private نیٹ ورک سے روٹ کرتا ہے، NAT Gateway چارجز ختم کرتے ہوئے۔ باب 30۔ ڈومین 4۔

**Gateway Load Balancer (GWLB)** — تیسرے فریق کے ورچوئل نیٹ ورک آلات (firewalls، IDS/IPS) کو ٹریفک کے بہاؤ میں inline ڈالنے کے لیے Layer 3 load balancer۔ باب 7۔ ڈومین 1۔

**Geolocation routing (Route 53)** — DNS query کے ماخذ کے جغرافیائی مقام کی بنیاد پر روٹ کرتا ہے۔ باب 12۔ ڈومین 3۔

**Global Accelerator** — Anycast کے ذریعے ٹریفک کو قریب ترین AWS edge تک روٹ کرتا ہے، dynamic ایپلیکیشنز کے لیے latency بہتر بناتا ہے۔ باب 25۔ ڈومین 3۔

**Glue (AWS)** — Serverless ETL۔ Glue Crawlers schema دریافت کرتے ہیں؛ Glue Jobs ڈیٹا تبدیل کرتے ہیں؛ Data Catalog metadata محفوظ کرتا ہے۔ باب 26۔ ڈومین 3۔

**GSI (Global Secondary Index)** — DynamoDB table پر ایک متبادل index جس کی ایک مختلف partition key اور اختیاری sort key ہوتی ہے۔ لچکدار query patterns کو ممکن بناتا ہے۔ باب 9۔ ڈومین 3۔

**GuardDuty** — غیر معمولی سرگرمی کا پتہ لگانے کے لیے CloudTrail، VPC Flow Logs، اور DNS logs پر ML استعمال کرنے والی خطرے کی نشاندہی کی خدمت۔ باب 17۔ ڈومین 1۔

---

## H

**Health check (Route 53)** — endpoint کی دستیابی کی نگرانی کرتا ہے۔ ناکام health checks failover routing کو متحرک کرتے ہیں۔ باب 12۔ ڈومین 2۔

**Hot partition (DynamoDB)** — ایک partition جو غیر متناسب ٹریفک وصول کرتا ہے کیونکہ بہت سی درخواستیں ایک ہی partition key شیئر کرتی ہیں۔ باب 9۔ ڈومین 3۔

---

## I

**IAM (Identity and Access Management)** — AWS accounts کے لیے authentication اور authorization کو قابو کرتا ہے۔ Users، groups، roles، policies۔ باب 3، 14۔ ڈومین 1۔

**IAM role** — عارضی credentials کے ساتھ ایک IAM شناخت، جسے خدمات، users، یا دیگر accounts فرض کرتے ہیں۔ باب 3، 14۔ ڈومین 1۔

**Idempotency** — کسی عمل کی وہ خاصیت جو وہی نتیجہ پیدا کرے چاہے اسے ایک بار کال کیا جائے یا کئی بار۔ تقسیم شدہ نظاموں (refunds، payments، order processing) کے لیے اہم۔ باب 32۔ بین الڈومین۔

**Idempotency key** — کسی عمل کے لیے ایک منفرد شناخت کنندہ، جسے دوہری پروسیسنگ روکنے کے لیے execution سے پہلے چیک کیا جاتا ہے۔ باب 32۔ بین الڈومین۔

**Interface Endpoint (PrivateLink)** — زیادہ تر AWS خدمات کے لیے ایک VPC endpoint۔ فی گھنٹہ + فی GB قیمت۔ انٹرنیٹ یا NAT کے بغیر private رابطہ فراہم کرتا ہے۔ باب 30۔ ڈومین 4۔

**Internet Gateway (IGW)** — public subnets میں instances کو انٹرنیٹ سے بات چیت کرنے دیتا ہے۔ subnet کے route table میں IGW تک ایک route ہونا ضروری ہے۔ باب 11۔ ڈومین 3۔

**"It depends"** — زیادہ تر فن تعمیر کے سوالات کا ایماندارانہ جواب، جسے ہمیشہ مکمل کیا جانا چاہیے: "یہ access pattern / پیمانے / ناکامی کے نتیجے / لاگت کی رکاوٹ پر منحصر ہے۔" باب 33۔ بین الڈومین۔

---

## K

**Kinesis Data Firehose** — Amazon Data Firehose کا سابقہ نام: streaming ڈیٹا کی S3، Redshift، OpenSearch تک منظم delivery۔ کوئی consumer انتظام نہیں۔ پرانے امتحانی سوالات اب بھی پرانا نام استعمال کر سکتے ہیں۔ باب 26۔ ڈومین 3۔

**Kinesis Data Streams** — حقیقی وقت کی مرتب event stream۔ پائیدار، retention window (24 گھنٹے default، 365 دن تک) کے اندر قابل replay۔ shards میں ماپی جاتی ہے۔ باب 26۔ ڈومین 3۔

**KMS (Key Management Service)** — at rest encryption کے لیے cryptographic keys بناتی، محفوظ کرتی، اور قابو کرتی ہے۔ باب 16۔ ڈومین 1۔

---

## L

**Lambda** — واقعات سے متحرک ہونے والی serverless functions۔ فی invocation اور فی ms ادائیگی۔ زیادہ سے زیادہ 15 منٹ دورانیہ۔ باب 20۔ ڈومین 2، 3، 4۔

**Lambda@Edge** — Lambda functions جو CloudFront edge locations پر چلتی ہیں، درخواستوں اور responses میں ترمیم کرتی ہیں۔ باب 13۔ ڈومین 3۔

**AWS Lake Formation** — S3 اور Glue Data Catalog کے اوپر مرکزی data lake رسائی کنٹرول پرت۔ table، column، اور row کی سطح پر باریک permissions فراہم کرتی ہے۔ محفوظ data lake setup کو آسان بناتی ہے۔ باب 26۔ ڈومین 3۔

**Latency-based routing (Route 53)** — DNS queries کو سب سے کم ماپی گئی latency والے AWS region تک روٹ کرتا ہے۔ باب 12۔ ڈومین 3۔

**Launch template** — Auto Scaling Groups کے لیے EC2 instance configuration متعین کرنے والا ایک ورژن دار template۔ باب 7۔ ڈومین 3۔

**Least privilege** — IAM بہترین طریقہ: صرف درکار permissions دیں، اس سے زیادہ نہیں۔ باب 3۔ ڈومین 1۔

**Lifecycle policy (S3)** — وہ قواعد جو objects کو عمر کی بنیاد پر خودکار طور پر سستی storage classes میں منتقل کرتے ہیں یا انہیں حذف کرتے ہیں۔ باب 23۔ ڈومین 4۔

**LSI (Local Secondary Index)** — DynamoDB table پر ایک متبادل index جو وہی partition key لیکن ایک مختلف sort key استعمال کرتا ہے۔ table تخلیق کے وقت بنایا جانا ضروری ہے۔ باب 9۔ ڈومین 3۔

---

## M

**Amazon Macie** — S3 میں حساس ڈیٹا (PII) کی ML پر مبنی دریافت اور نمائش خطرات کی نشاندہی۔ GuardDuty رویہ دیکھتا ہے؛ Macie یہ آڈٹ کرتا ہے کہ کیا محفوظ ہے۔ باب 17۔ ڈومین 1۔

**Memcached** — آسان، multi-threaded in-memory caching engine۔ کوئی persistence نہیں، کوئی ڈیٹا ڈھانچے نہیں۔ Redis استعمال کریں سوائے اس کے کہ آپ کو خاص طور پر خصوصیات کی قیمت پر multi-threading درکار ہو۔ باب 10۔ ڈومین 3۔

**Amazon MemoryDB for Redis** — پائیدار، Redis مطابق، in-memory primary ڈیٹابیس۔ ElastiCache کے برعکس، MemoryDB ایک Multi-AZ transaction log میں لکھتا ہے، ڈیٹا durability کی ضمانت دیتا ہے۔ اُس وقت استعمال کریں جب Redis API مطابقت درکار ہو اور ڈیٹا کا نقصان ناقابل قبول ہو۔ باب 10۔ ڈومین 3۔

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: پورے سرورز کی AWS میں بلاک سطح کی replication، آزمائشی launches، پھر native EC2 instances تک cutover۔ DataSync فائلیں منتقل کرتا ہے؛ DMS ڈیٹابیسز منتقل کرتا ہے؛ MGN سرورز منتقل کرتا ہے۔ باب 25۔ ڈومین 3۔

**Amazon MQ** — معیاری protocols (AMQP، MQTT، STOMP) بولنے والا منظم ActiveMQ/RabbitMQ broker۔ کوڈ تبدیلیوں کے بغیر موجودہ broker workloads کی lift-and-shift کے لیے؛ greenfield messaging → SQS/SNS۔ باب 19۔ ڈومین 2۔

**Multi-AZ (RDS)** — خودکار failover کے ساتھ ایک مختلف AZ میں synchronous standby replica۔ RPO ~0، RTO ~60 سیکنڈ۔ اعلیٰ دستیابی کے لیے، read اسکیلنگ کے لیے نہیں۔ باب 8، 18۔ ڈومین 2۔

**Multi-Region** — جغرافیائی فالتو پن اور عالمی کارکردگی کے لیے ایپلیکیشن اجزاء کو متعدد AWS regions میں تعینات کرنا۔ زیادہ پیچیدگی اور لاگت۔ باب 18۔ ڈومین 2۔

---

## N

**Network Load Balancer (NLB)** — Layer 4 (TCP/UDP/TLS) load balancer: لاکھوں درخواستیں فی سیکنڈ، فی AZ static IP، source IP محفوظ رکھتا ہے۔ کوئی HTTP آگاہی نہیں — یہ ALB کا کام ہے۔ باب 7۔ ڈومین 3۔

**NACL (Network Access Control List)** — subnet کی سطح پر stateless firewall۔ inbound اور outbound دونوں rules درکار۔ Rules عددی ترتیب میں جانچے جاتے ہیں۔ باب 15۔ ڈومین 1۔

**NAT Gateway** — private subnets میں instances کو انٹرنیٹ سے outbound کنکشن بنانے دیتا ہے۔ پروسیس شدہ $0.045/GB چارج کرتا ہے۔ باب 11، 30۔ ڈومین 4۔

---

## O

**Object (S3)** — S3 میں محفوظ ایک فائل۔ key (نام)، value (ڈیٹا)، اور metadata پر مشتمل۔ زیادہ سے زیادہ حجم 5TB۔ باب 5۔ ڈومین 3۔

**On-Demand capacity (DynamoDB)** — فی درخواست ادائیگی mode۔ provisioned سے فی درخواست زیادہ مہنگا، لیکن کوئی capacity planning کی ضرورت نہیں۔ باب 29۔ ڈومین 4۔

**On-Demand instances (EC2)** — کسی عہد کے بغیر فی گھنٹہ ادائیگی۔ زیادہ سے زیادہ لچک، زیادہ سے زیادہ قیمت۔ باب 27۔ ڈومین 4۔

**AWS Outposts** — AWS ہارڈویئر کا ایک مکمل منظم rack جو گاہک کے اپنے ڈیٹا سینٹر یا co-location سہولت میں نصب ہوتا ہے۔ پبلک کلاؤڈ جیسی ہی AWS خدمات، APIs، اور اوزار on-premises چلاتا ہے۔ AWS تنصیب اور patching سنبھالتا ہے؛ گاہک rack کی جگہ اور بجلی فراہم کرتا ہے۔ ڈیٹا residency، کم latency والے on-premises workloads، یا منقطع منظرناموں کے لیے۔ باب 2۔ ڈومین 4۔

---

## P

**Partition key (DynamoDB)** — primary key کا وہ جزو جو یہ طے کرتا ہے کہ کون سا partition ایک item محفوظ کرتا ہے۔ یکساں تقسیم کے لیے ایک high-cardinality key منتخب کریں۔ باب 9۔ ڈومین 3۔

**Permission boundary** — ایک IAM policy جو زیادہ سے زیادہ permissions طے کرتی ہے جو ایک IAM شناخت رکھ سکتی ہے، چاہے دیگر policies زیادہ دیں۔ باب 14۔ ڈومین 1۔

**Placement group** — latency کم کرنے (cluster) یا دستیابی زیادہ کرنے (spread) کے لیے EC2 instances کی جسمانی جگہ کو قابو کرتا ہے۔ باب 4۔ ڈومین 3۔

**PrivateLink** — AWS میں میزبان خدمات تک private endpoints بنانے کے لیے AWS خدمت، Interface Endpoints کے ذریعے قابل رسائی۔ باب 30۔ ڈومین 1۔

**Provisioned concurrency (Lambda)** — پہلے سے initialize شدہ execution environments جو cold start تاخیر کو ختم کرتے ہیں۔ باب 20۔ ڈومین 3۔

**Provisioned capacity (DynamoDB)** — پہلے سے مختص read اور write throughput، فی سیکنڈ capacity units میں ماپی جاتی ہے۔ قابل پیش گوئی ٹریفک کے لیے on-demand سے سستی۔ باب 9، 29۔ ڈومین 4۔

---

## Q

**Amazon QuickSight** — منظم business intelligence اور ڈیٹا visualization خدمت۔ تیز dashboard rendering کے لیے ڈیٹا cache کرنے کے لیے SPICE (Super-fast، Parallel، In-memory Calculation Engine) استعمال کرتی ہے۔ Athena، S3، Redshift، RDS، اور دیگر AWS ڈیٹا ذرائع سے جڑتا ہے۔ سنبھالنے کے لیے کوئی BI سرور نہیں۔ باب 26۔ ڈومین 3۔

---

## R

**RDS (Relational Database Service)** — منظم relational ڈیٹابیس۔ backups، patching، failover سنبھالتا ہے۔ باب 8۔ ڈومین 3۔

**RDS Proxy** — Lambda/ایپلیکیشن اور RDS کے درمیان ایک connection pool کا انتظام کرتا ہے، connection کی کمی کو روکتے ہوئے۔ باب 8۔ ڈومین 3۔

**Read Replica (RDS)** — read اسکیلنگ کے لیے ڈیٹابیس کی asynchronous نقل۔ خودکار failover فراہم نہیں کرتی۔ باب 8، 24۔ ڈومین 3۔

**Redis** — caching، session management، حقیقی وقت کے leaderboards، pub/sub کے لیے استعمال ہونے والا in-memory ڈیٹا ڈھانچہ store۔ باب 10۔ ڈومین 3۔

**Reserved Instance (EC2)** — رعایت کے بدلے ایک مخصوص region میں ایک مخصوص instance type کو 1 یا 3 سال استعمال کرنے کا عہد۔ باب 27۔ ڈومین 4۔

**Route 53** — AWS DNS خدمت اور domain registrar۔ متعدد routing policies کی حمایت کرتا ہے۔ باب 12۔ ڈومین 2، 3۔

**RPO (Recovery Point Objective)** — وقت میں ماپا گیا زیادہ سے زیادہ قابل قبول ڈیٹا نقصان۔ "ہم کتنا ڈیٹا کھونے کے متحمل ہو سکتے ہیں؟" باب 18۔ ڈومین 2۔

**RTO (Recovery Time Objective)** — ناکامی کے بعد خدمت بحال کرنے کا زیادہ سے زیادہ قابل قبول وقت۔ "ہم کتنی دیر بند رہ سکتے ہیں؟" باب 18۔ ڈومین 2۔

**Runbook** — کسی نظام کو چلانے کے لیے قدم بہ قدم ہدایات، خاص طور پر واقعے کے ردعمل کے لیے۔ "رات 3 بجے کوئی کیا کرتا ہے؟" باب 32۔ بین الڈومین۔

---

## S

**S3 Intelligent-Tiering** — access patterns کی بنیاد پر S3 objects کو خودکار طور پر access tiers کے درمیان منتقل کرتا ہے۔ کوئی retrieval fee نہیں۔ باب 23۔ ڈومین 4۔

**S3 Select** — SQL expressions استعمال کرتے ہوئے کسی S3 object کے مواد کا ایک ذیلی حصہ حاصل کرتا ہے، data transfer کم کرتا ہے۔ قدیم: 2024 کے وسط سے نئے گاہکوں کے لیے دستیاب نہیں — Athena اب S3 میں ڈیٹا فلٹر اور query کرنے کا بنیادی راستہ ہے۔ S3 Object Lambda، جو کبھی تجویز کردہ متبادل تھا، خود قدیم ہے (نومبر 2025 میں نئے گاہکوں کے لیے بند؛ موجودہ workloads کام کرتے رہتے ہیں)۔ باب 30۔ ڈومین 4۔

**Savings Plan** — ایک لچکدار قیمتوں کا ماڈل جو رعایت کے بدلے فی گھنٹہ خرچ کی ایک ڈالر رقم کا عہد کرتا ہے۔ Reserved Instances سے زیادہ لچکدار۔ باب 27۔ ڈومین 4۔

**SCP (Service Control Policy)** — AWS Organizations policy جو کسی OU میں accounts کے لیے دستیاب زیادہ سے زیادہ permissions کو محدود کرتی ہے۔ باب 14۔ ڈومین 1۔

**Secrets Manager** — secrets (ڈیٹابیس passwords، API keys) محفوظ اور خودکار طور پر rotate کرتا ہے۔ باب 16۔ ڈومین 1۔

**Security group** — instance کی سطح پر ایک stateful ورچوئل firewall۔ صرف allow rules؛ واپسی ٹریفک خودکار۔ باب 15۔ ڈومین 1۔

**Shard (Kinesis)** — Kinesis Data Streams میں throughput کی بنیادی اکائی: 1 MB/s write، 2 MB/s read۔ باب 26۔ ڈومین 3۔

**Shared Responsibility Model** — AWS کلاؤڈ *کی* سیکیورٹی (بنیادی ڈھانچہ) کا ذمہ دار ہے؛ آپ کلاؤڈ *میں* سیکیورٹی (ڈیٹا، configuration، رسائی) کے ذمہ دار ہیں۔ باب 1۔ ڈومین 1۔

**Shield** — DDoS تحفظ۔ Standard: مفت، خودکار۔ Advanced: ادا شدہ، DRT سپورٹ اور مالی تحفظ کے ساتھ۔ باب 17۔ ڈومین 1۔

**Snow Family** — آف لائن بلک ڈیٹا منتقلی کے لیے جسمانی آلات (Snowball Edge: 80 TB) — ہائی وے پر گاڑی چلانے کے بجائے ایک کارگو فلائٹ چارٹر کرنا۔ قدیم (2026): Snowmobile اور Snowcone بند کر دیے گئے؛ Snow آلات نومبر 2025 میں نئے گاہکوں کے لیے بند ہوئے (AWS DataSync اور Data Transfer Terminals کی طرف اشارہ کرتا ہے)، لیکن SAA-C03 امتحان اب بھی "منتقلی کے کئی ہفتے، محدود bandwidth" کے لیے Snowball کو متوقع رکھتا ہے۔ باب 25۔ ڈومین 3۔

**SNS (Simple Notification Service)** — Pub/sub messaging۔ messages کو بیک وقت تمام subscribers تک push کرتا ہے۔ Fan-out pattern۔ باب 19۔ ڈومین 2۔

**Sort key (DynamoDB)** — primary key کا اختیاری دوسرا جزو۔ ایک partition کے اندر range queries کو ممکن بناتا ہے۔ باب 9۔ ڈومین 3۔

**Spot Instances** — فاضل گنجائش 60-90% رعایت پر استعمال کرنے والے EC2 instances۔ 2 منٹ نوٹس کے ساتھ تعطل ہو سکتا ہے۔ صرف fault-tolerant workloads کے لیے۔ باب 27۔ ڈومین 4۔

**SQS (Simple Queue Service)** — منظم message queue۔ Producers کو consumers سے decouple کرتا ہے۔ Standard (at-least-once) اور FIFO (exactly-once) queues۔ باب 19۔ ڈومین 2۔

**Step Functions** — Serverless workflow orchestration خدمت۔ AWS خدمات کو مربوط کرنے کے لیے state machines۔ باب 22۔ ڈومین 2۔

**AWS Storage Gateway** — on-premises اور cloud اسٹوریج کے درمیان پل: مقامی طور پر NFS/SMB (File)، iSCSI (Volume)، یا ورچوئل ٹیپ (Tape) interfaces پیش کرتا ہے جبکہ ڈیٹا کو S3، Glacier، یا EBS snapshots میں برقرار رکھتا ہے۔ باب 6۔ ڈومین 3۔

---

## T

**Target tracking scaling** — Auto Scaling policy جو ایک target metric value (مثلاً 60% CPU utilization) برقرار رکھنے کے لیے capacity ایڈجسٹ کرتی ہے۔ باب 7۔ ڈومین 2۔

**AWS Transfer Family** — S3 یا EFS کے پیچھے منظم SFTP/FTPS/FTP endpoint۔ شراکت دار اپنے موجودہ SFTP کلائنٹس رکھتے ہیں؛ فائلیں براہِ راست آپ کے bucket میں پہنچتی ہیں۔ باب 25۔ ڈومین 3۔

**Transit Gateway** — متعدد VPCs اور on-premises نیٹ ورکس کو ایک مرکزی gateway کے ذریعے جوڑنے والی hub-and-spoke نیٹ ورک topology۔ باب 25۔ ڈومین 3۔

**TTL (Time to Live)** — ایک timestamp جس کے بعد DynamoDB خودکار طور پر ایک item حذف کر دیتا ہے۔ DNS میں بھی استعمال ہوتا ہے (resolvers کسی record کو کتنی دیر cache کرتے ہیں) اور caching میں (cache شدہ value کتنی دیر درست رہتی ہے)۔ باب 9، 12۔ ڈومین 3۔

---

## V

**VIF (Virtual Interface)** — AWS Direct Connect کے ساتھ استعمال ہونے والا منطقی کنکشن۔ Public VIF AWS public endpoints تک رسائی دیتا ہے؛ Private VIF VPC وسائل تک رسائی دیتا ہے۔ باب 25۔ ڈومین 3۔

**Visibility timeout (SQS)** — وہ مدت جس کے دوران ایک وصول شدہ message دوسرے consumers سے چھپا رہتا ہے۔ دوسرے consumers کے وہی message دیکھے بغیر پروسیسنگ کی اجازت دیتا ہے۔ باب 19۔ ڈومین 2۔

**VPC (Virtual Private Cloud)** — AWS میں ایک الگ تھلگ ورچوئل نیٹ ورک۔ subnets، route tables، اور gateways پر مشتمل۔ باب 11۔ ڈومین 1۔

**VPC Endpoint** — VPC وسائل کو AWS private نیٹ ورک کے ذریعے AWS خدمات سے جوڑتا ہے۔ Gateway (مفت، S3/DynamoDB) اور Interface (قیمت والا، زیادہ تر دیگر خدمات)۔ باب 30۔ ڈومین 1، 4۔

**VPC Flow Logs** — کسی VPC میں نیٹ ورک interfaces سے آنے اور جانے والے IP ٹریفک کے بارے میں معلومات کیپچر کرتا ہے۔ GuardDuty اور نیٹ ورک troubleshooting کے لیے استعمال ہوتا ہے۔ باب 17۔ ڈومین 1۔

**VPC Peering** — دو VPCs کے درمیان ایک نیٹ ورک کنکشن جو private IP ایڈریسز استعمال کرتے ہوئے ان کے درمیان ٹریفک کو روٹ کرنے کے قابل بناتا ہے۔ باب 11۔ ڈومین 3۔

---

## W

**WAF (Web Application Firewall)** — قواعد (IP blocks، SQL injection، rate limits) استعمال کرتے ہوئے HTTP/HTTPS ٹریفک کو فلٹر کرتا ہے۔ CloudFront، ALB، یا API Gateway سے منسلک ہوتا ہے۔ باب 17۔ ڈومین 1۔

**AWS Wavelength** — AWS بنیادی ڈھانچہ جو 5G ٹیلی کمیونیکیشن فراہم کنندگان کے نیٹ ورکس کے اندر radio edge پر تعینات ہوتا ہے۔ موبائل آلات تک سنگل ڈیجٹ ملی سیکنڈ latency ممکن بناتا ہے۔ موبائل AR/VR، حقیقی وقت کی گیمنگ، خود مختار گاڑیوں کی telemetry، اور 5G edge پر براہِ راست ویڈیو کے لیے۔ Wavelength Zones ٹیلی کام نیٹ ورکس کے اندر AWS Regions کی توسیعات ہیں۔ باب 2۔ ڈومین 3۔

**Well-Architected Framework** — AWS کا چھ ستونی جائزہ framework: Operational Excellence، Security، Reliability، Performance Efficiency، Cost Optimization، Sustainability۔ باب 31۔ بین الڈومین۔

**Weighted routing (Route 53)** — DNS queries کو وزن کے مطابق endpoints میں تقسیم کرتا ہے۔ blue-green deployments اور A/B testing کے لیے استعمال ہوتا ہے۔ باب 12۔ ڈومین 3۔

**Write-through caching** — جب بھی ڈیٹابیس اپ ڈیٹ ہوتا ہے cache کو اپ ڈیٹ کرتا ہے۔ ڈیٹا ہمیشہ مطابق ہوتا ہے لیکن cache میں ایسے بہت سے items ہو سکتے ہیں جنہیں کبھی دوبارہ نہیں پڑھا جاتا۔ باب 10۔ ڈومین 3۔

---

## SAA-C03 فوری Pattern حوالہ

| اگر امتحان کہے...                              | سوچیں...                                     |
|-----------------------------------------------|----------------------------------------------|
| "خدمات کو decouple کریں"                       | SQS، SNS، EventBridge                        |
| "متعدد consumers تک fan-out"                   | SNS + SQS subscriptions                      |
| "حقیقی وقت کے مرتب واقعات"                     | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda، DynamoDB، Aurora Serverless، Fargate |
| "عالمی کم latency (dynamic)"                   | Global Accelerator                           |
| "عالمی کم latency (static/cached)"             | CloudFront                                   |
| "DDoS تحفظ"                                    | Shield (Standard: مفت؛ Advanced: ادا شدہ)    |
| "edge پر SQL injection بلاک کریں"             | WAF                                          |
| "خراب credentials کا پتہ لگائیں"               | GuardDuty                                    |
| "API سرگرمی آڈٹ کریں"                          | CloudTrail                                   |
| "ڈیٹابیس credentials rotate کریں"             | Secrets Manager                              |
| "at rest encryption، customer-managed keys"   | CMK کے ساتھ KMS                              |
| "configuration اقدار محفوظ کریں"             | SSM Parameter Store                          |
| "اعلیٰ IOPS ڈیٹابیس اسٹوریج"                   | io2 EBS                                      |
| "EC2 کے لیے مشترکہ فائل سسٹم"                  | EFS                                          |
| "S3 ڈیٹا کو SQL سے query کریں"                | Athena                                       |
| "تجزیات کے لیے ETL pipeline"                   | AWS Glue                                     |
| "streaming ڈیٹا S3 تک پہنچائیں"               | Amazon Data Firehose                         |
| "Fault-tolerant batch jobs، لاگت کم کریں"      | Spot Instances                               |
| "عہد شدہ، مستحکم پیداواری workload"            | Savings Plans                                |
| "Private subnet → S3 بغیر NAT"               | S3 Gateway Endpoint                          |
| "Private subnet → SQS بغیر NAT"              | SQS Interface Endpoint                       |
| "RDS کے لیے Multi-AZ"                          | خودکار failover (read اسکیلنگ نہیں)          |
| "RDS کے لیے Read Replica"                      | Read اسکیلنگ (خودکار failover نہیں)          |
| "recovery وقت 1–2 منٹ، cross-AZ"             | Multi-AZ (RDS failover: 60–120 سیکنڈ)        |
| "regions کے آر پار recovery، منٹوں کا RTO"    | Pilot Light یا Warm Standby                  |
| "Active-Active، صفر RTO"                       | Multi-Region Active-Active (سب سے پیچیدہ)    |
| "Lambda timeout سے آگے batch پروسیسنگ"        | AWS Batch                                    |
| "Redis مطابق اور پائیدار"                     | MemoryDB for Redis                           |
| "ریموٹ انجینئرز گھر سے VPC تک رسائی"          | Client VPN                                   |
| "کم سے کم downtime کے ساتھ ڈیٹابیس منتقل کریں" | DMS (+ heterogeneous کے لیے SCT)             |
| "AWS پر BI dashboard"                          | QuickSight                                   |
| "اپنے ڈیٹا سینٹر میں AWS چلائیں"              | Outposts                                     |
| "5G موبائل edge کمپیوٹ"                        | Wavelength                                   |
