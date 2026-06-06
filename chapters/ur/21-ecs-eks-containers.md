# باب 21: Code کے لیے Shipping Containers

1956 سے پہلے، ایک جہاز پر cargo لادنا ایک ہنرمند اور خصوصی مذاکرات تھا۔ ہر جہاز کے مختلف holds تھے۔ ہر بندرگاہ کے مختلف cranes تھے۔ ہر carrier کے پاس یہ ٹریک کرنے کے مختلف نظام تھے کہ کیا کہاں گیا۔ سامان کا ایک crate truck سے dock تک، جہاز تک، dock تک، truck تک لوگوں کی ایک زنجیر کے ذریعے منتقل ہوتا جو سب اسے مختلف طریقے سے سنبھالتے۔ Cargo کھو جاتا۔ Cargo خراب ہو جاتا۔ وہی سامان، دو بار بھیجا گیا، مختلف حالت میں پہنچتا کیونکہ handling دونوں بار مختلف تھی۔

جواب، جب کسی نے آخرکار اسے واضح طور پر پوچھا، یہ تھا: container کو standardize کرو۔ مسئلہ ہر بندرگاہ پر حل نہ کرو۔ اسے ایک بار، container کی سطح پر حل کرو۔ ڈبہ بھیجو، صرف مواد نہیں۔

standardized shipping container نے صرف shipping کو تیز نہیں بنایا۔ اس نے shipping کو *قابل پیش گوئی* بنایا۔ Shanghai میں ایک container کا مواد بالکل اسی حالت میں تھا جب وہ Rotterdam پہنچا — کیونکہ container نے انہیں ہر transfer point پر تغیر سے بچایا۔

یہ بالکل وہی مسئلہ تھا جو Leo کو تھا۔ Nimbus API ہر "بندرگاہ" پر مختلف طریقے سے "لادی" جا رہی تھی: staging production سے مختلف deploy ہوتی، instance ایک instance تین سے مختلف deploy ہوتی، اور غیر دستاویزی تبدیلیوں کے چھ ہفتوں نے fleet کو غیر متوقع بنا دیا تھا۔

Container Leo کو ایک تیز developer نہیں بناتا۔ یہ deployments کو قابل پیش گوئی بناتا۔

---

Lambda migration نے چھوٹی services کے لیے EC2 bill کم کر دیا تھا۔ لیکن core API مختلف تھی — یہ مسلسل چلتی، تمام order traffic لے جاتی، اور آٹھ ماہ سے configuration history جمع کر رہی تھی۔ Lambda نے idleness حل کی۔ Containers inconsistency حل کریں گے۔

Core API idle نہیں تھی؛ یہ Lambda میں منتقل نہیں ہو سکتی تھی۔ لیکن اس کا ایک مختلف مسئلہ تھا: اسے چلانے والی EC2 instances ایک دوسرے سے مختلف ہو گئی تھیں۔

---

Leo نے بلند آواز میں "یہ میری مشین پر کام کرتا ہے" نہ کہنا سیکھ لیا تھا۔ یہ ایک دفاع نہیں تھا — یہ ایک تشخیص تھی۔ اور اس بار تشخیص production EC2 instance نمبر تین تھی، جسے چھ ہفتے پہلے ایک library patch ملا تھا جسے کسی نے دستاویز نہیں کیا تھا، جو دوسری دو instances کو نہیں ملا تھا، اور جو اب ایک bug پیدا کر رہا تھا جو صرف وہاں موجود تھا، اس ایک instance میں، ہر جگہ اور invisible۔

اس نے گزشتہ رات تین گھنٹے اسے ڈھونڈنے میں گزارے تھے۔

"ہر بار جب ہم deploy کرتے ہیں،" اس نے اگلی صبح کہا، "ہم متعدد instances میں coordinate کرتے ہیں۔ نیا version، مختلف dependencies۔ staging میں کام کرتا ہے، production میں ٹوٹتا ہے کیونکہ environments مختلف ہو گئے ہیں۔"

"کیونکہ کسی نے instance تین پر ایک package update کیا بغیر دوسروں کو update کیے،" Priya نے کہا۔ بے رحمی سے نہیں۔

"مجھے ایک مخصوص version چاہیے تھا—"

"مجھے معلوم ہے،" اس نے کہا۔ "اور اب instance تین کی instance ایک اور دو سے مختلف history ہے۔ یہ configuration drift ہے۔ یہ خاموش رہتا ہے جب تک نہیں رہتا۔"

"اصل حل کیا ہے؟" Maya نے پوچھا۔

"سرورز کو ایسی مستقل چیزوں کی طرح سمجھنا بند کرو جنہیں آپ configure کرتے ہیں،" Priya نے کہا۔ "انہیں disposable units کی طرح سمجھنا شروع کرو جنہیں آپ replace کرتے ہیں۔"

**Container کیا ہے؟**

"اسے ایک shipping container کی طرح سوچو،" Leo نے ایک marker پکڑتے ہوئے کہا۔ "Container کو پرواہ نہیں کہ یہ کس جہاز پر ہے۔ جہاز کو پرواہ نہیں کہ container میں کیا ہے۔ وہ dimensions اور locking mechanism پر متفق ہو گئے۔ باقی سب کچھ ڈبے کے اندر ہے۔"

ایک **container** ایک ہلکا، portable unit ہے جو آپ کی application کو اس کے چلنے کے لیے درکار ہر چیز کے ساتھ package کرتا ہے: runtime (Python 3.11، Node.js 20، Java 17)، libraries اور dependencies، configuration files، اور خود application code۔

ایک virtual machine کے برعکس (جو ایک پورے کمپیوٹر کی نقل کرتا ہے، operating system kernel سمیت)، ایک container باقی سب کچھ isolated رکھتے ہوئے host OS kernel شیئر کرتا ہے۔ یہ containers کو شروع ہونے میں تیز (سیکنڈ، کبھی کبھی ملی سیکنڈ) اور چھوٹا (megabytes، gigabytes نہیں) بناتا ہے۔

سب سے مقبول container technology **Docker** ہے۔ ایک Docker image blueprint ہے — application اور اس کے environment کا ایک snapshot۔ ایک Docker container اس image کی ایک چلتی instance ہے۔

اہم خاصیت: **immutability**۔ آج بنائی گئی ایک image کسی بھی ایسے host پر یکساں چلے گی جو Docker کو سپورٹ کرتا ہے — ایک laptop، ایک EC2 instance، ایک مختلف data center میں ایک server۔ Environment baked-in ہے۔ Configuration drift ناممکن ہے۔

"تو EC2 instance پر کیا install ہے اس کی فکر کرنے کے بجائے،" Leo نے کہا، "ہم ایک ایسی image بناتے ہیں جس میں سب کچھ ہے۔ Image ہر جگہ ایک ہی طرح چلتی ہے۔"

"اور اگر آپ کو اسے مقامی طور پر test کرنا ہو، آپ وہی image چلاتے ہیں،" Priya نے شامل کیا۔ "مزید کوئی 'یہ میری مشین پر کام کرتا ہے' نہیں۔"

**Docker Image بنانا اور ECR کو Push کرنا**

اس سے پہلے کہ کوئی orchestrator container کو manage کر سکے، Leo کو اسے بنانا اور کہیں اسٹور کرنا تھا جہاں سے ECS pull کر سکے۔

اس نے Dockerfile لکھا:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

اہم لائن: `FROM python:3.11-slim`۔ Python 3.9 نہیں۔ Python 3.10 نہیں۔ 3.11 — وہ مخصوص version جس پر ٹیم متفق ہوئی تھی، image میں baked-in۔ یہ image چلانے والی ہر instance بالکل Python 3.11 استعمال کرے گی۔ Decimal module کا rounding behavior ہر جگہ یکساں ہوگا۔

اس نے image مقامی طور پر بنائی: `docker build -t nimbus-api:1.0.0 .`

Build میں 4 منٹ لگے۔ Docker نے base image pull کی، dependencies install کیں، application code کاپی کیا، اور `nimbus-api:1.0.0` tagged ایک image تیار کی۔

اس نے اسے مقامی طور پر چلایا: `docker run -p 8000:8000 nimbus-api:1.0.0`

API شروع ہو گئی۔ وہی port، production server جیسا ہی behavior — کیونکہ environment یکساں تھا۔

پھر اس نے اسے ECR کو push کیا:

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Tag the image for ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Push
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Push میں 2 منٹ لگے۔ ECR نے image اسٹور کی، فوراً ایک image scan trigger کیا، اور 5 منٹ کے اندر نتائج report کیے۔

**Amazon ECS: Orchestrator**

ایک container چلانا آسان ہے۔ متعدد hosts میں درجنوں containers چلانا، ان کے درمیان ٹریفک route کرنا، ناکام containers restart کرنا، بغیر downtime کے نئے versions deploy کرنا — اس کے لیے ایک **orchestrator** درکار ہے۔

**Amazon ECS (Elastic Container Service)** AWS کی managed container orchestration service ہے۔ آپ define کرتے ہیں:

- **Task definition**: کون سی container image چلانی ہے، کتنا CPU اور memory، کون سے environment variables، کون سے ports expose کرنے ہیں
- **Service**: task کی کتنی copies چلانی ہیں، failures اور deployments کیسے سنبھالنے ہیں
- **Cluster**: underlying compute infrastructure

ECS باقی سنبھالتا ہے: tasks کو دستیاب capacity پر رکھنا، ناکام tasks restart کرنا، deployments کے دوران connections drain کرنا، صحت مند tasks کو لوڈ بیلنسر کے ساتھ register کرنا۔

Nimbus کے لیے، API ہاتھ سے managed deployments والی EC2 instances سے ECS میں منتقل ہوئی۔ ہر نیا deployment ایک نئی Docker image **Amazon ECR (Elastic Container Registry)** کو push کرتا — AWS کا managed container registry — اور ECS اسے تمام tasks میں صفر downtime کے ساتھ roll out کرتا۔

**Fargate بمقابلہ EC2 Launch Type**

ECS دو modes میں containers چلا سکتا ہے:

**EC2 launch type**: آپ underlying EC2 instances manage کرتے ہیں۔ آپ instances کو patch کرنے، انہیں right-size کرنے، اور یقینی بنانے کے ذمہ دار ہیں کہ آپ کے containers کے لیے کافی capacity ہو۔ زیادہ کنٹرول، زیادہ ذمہ داری۔

**Fargate (containers کے لیے serverless compute)**: AWS underlying infrastructure مکمل طور پر manage کرتا ہے۔ آپ فی task CPU اور memory specify کرتے ہیں؛ Fargate خودبخود صحیح capacity provision کرتا ہے۔ manage کرنے کے لیے کوئی EC2 instances نہیں۔ آپ فی vCPU-second اور GB-second memory ادائیگی کرتے ہیں۔

Fargate "serverless containers" نمونہ ہے — آپ کو سرورز manage کیے بغیر containers کی environment isolation ملتی ہے۔ Trade-off: underlying instance configuration پر کم کنٹرول اور قدرے زیادہ فی-unit لاگت۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے pricing calculator کھولتے ہوئے پوچھا۔ "Fargate بمقابلہ EC2 launch type — میں اصل نمبر دیکھنا چاہتا ہوں۔"

Leo کا اندازہ — وہ جو ہر کوئی ساتھ لیے پھرتا ہے — یہ تھا کہ Fargate زیادہ خرچ کرے گا۔ Serverless آسانی، premium قیمت۔ اس نے اندازہ لگایا شاید EC2 سے بیس یا تیس فیصد زیادہ۔

"اصل نمبر چلاؤ،" Tom نے کہا، کیونکہ یہ Tom تھا۔

Nimbus API service 3 tasks چلاتی، ہر ایک کو 0.5 vCPU اور 1GB memory کی ضرورت، 24/7:

**Fargate**: $0.04048/vCPU-hour × 0.5 × 3 × 720 گھنٹے = CPU کے لیے $43.72/مہینہ۔ $0.004445/GB-hour × 1 × 3 × 720 = memory کے لیے $9.60/مہینہ۔ کل: $53.32/مہینہ۔

**EC2 launch type** ($0.0416/گھنٹہ پر 3 × t3.medium): $0.0416 × 3 × 720 = $89.86/مہینہ۔

"رکو،" Tom نے کہا۔ "Fargate سستا ہے؟"

"اس سائز پر، ہاں،" Leo نے کہا۔ "Fargate بالکل اس کے لیے charge کرتا ہے جو آپ مختص کرتے ہیں۔ EC2 instances کا overhead ہوتا ہے — OS اور ECS agent کچھ CPU اور memory استعمال کرتے ہیں آپ کے containers شروع ہونے سے پہلے۔ ایک t3.medium 2 vCPU اور 4GB دیتا ہے، لیکن آپ فی container 0.5 vCPU اور 1GB استعمال کر رہے ہیں۔ باقی ضائع ہوتا ہے۔"

"لیکن EC2 launch type آپ کو ایک instance پر متعدد tasks pack کرنے دیتا ہے۔"

"ہاں۔ بڑے پیمانوں پر، احتیاط سے bin-packing کے ساتھ، EC2 launch type سستا ہو جاتا ہے۔ ہمارے پیمانے پر — تین tasks — Fargate جیتتا ہے۔"

Tom نے یہ لکھ لیا۔

Nimbus کے لیے: API service کے لیے Fargate۔ وہ containers کے لیے EC2 instances manage نہیں کرنا چاہتے تھے۔

اگر آپ Fargate کے ساتھ containerize کرتے ہیں، آپ تمام EC2 management overhead ختم کر دیتے ہیں — لیکن آپ instance types کو customize کرنے کی صلاحیت چھوڑ دیتے ہیں، جو GPU workloads یا خصوصی networking کے لیے اہمیت رکھتی ہے۔ اگر آپ AWS-native سادگی کے لیے ECS منتخب کرتے ہیں، آپ کو تنگ IAM اور ALB انضمام ملتا ہے — لیکن آپ Kubernetes ecosystem سے باہر رہ جاتے ہیں، جس کے لیے دوبارہ architecture کرنا پڑتا ہے اگر آپ کو بعد میں multi-cloud portability کی ضرورت ہو۔

**Amazon EKS: جب آپ کو Kubernetes چاہیے**

**Kubernetes** ایک open-source container orchestration system ہے — بنیادی طور پر پیمانے پر containers manage کرنے کا industry standard۔ یہ طاقتور، توسیع پذیر، اور پیچیدہ ہے۔

**Amazon EKS (Elastic Kubernetes Service)** AWS کی managed Kubernetes service ہے۔ یہ آپ کے لیے Kubernetes control plane (management layer) چلاتی ہے، جبکہ آپ worker nodes manage کرتے ہیں (یا ان کے لیے بھی Fargate استعمال کرتے ہیں)۔

آپ شاید سوچ رہے ہوں: اگر Kubernetes industry standard ہے اور ہر job posting اس کا ذکر کرتا ہے، تو ہم اسے بس استعمال کیوں نہ کریں؟ کیونکہ "industry standard" اس کی وضاحت کرتا ہے جو dedicated platform teams والی بڑی کمپنیاں استعمال کرتی ہیں۔ ایک food-ordering app بنانے والی چھ افراد کی ٹیم کے لیے، Kubernetes ابھی کسی عملی فائدے کے بغیر operational پیچیدگی شامل کرتا ہے۔ پیچیدگی حقیقی ہے؛ فائدہ اس پیمانے پر نظریاتی ہے۔

Kubernetes پیچیدگی کی ایک ایسی سطح پر قدر فراہم کرتا ہے جس کی زیادہ تر ٹیموں کو ضرورت نہیں: internal platforms بنانے کے لیے custom resource definitions، advanced scheduling constraints، باریک deployment کنٹرول کے لیے pod disruption budgets، اور سینکڑوں microservices کے درمیان traffic management کے لیے service mesh انضمام۔ یہ حقیقی صلاحیتیں ہیں۔ یہ ایسی صلاحیتیں بھی ہیں جنہیں Nimbus کے سائز کا ایک startup کبھی استعمال نہیں کرے گا۔

یہاں engineering اصول کو کبھی کبھی YAGNI کہا جاتا ہے: You Aren't Gonna Need It (تمہیں اس کی ضرورت نہیں پڑے گی)۔ ECS Nimbus کو وہ سب کچھ دیتا ہے جس کی انہیں فی الحال ضرورت ہے۔ EKS انہیں ان کی ضرورت سے زیادہ دیتا ہے، علاوہ ایک نمایاں سیکھنے کا منحنی خط اور operational overhead۔ "یہ بعد میں مفید ہوگا" ابھی پیچیدگی شامل کرنے کی اچھی وجہ نہیں ہے۔

آپ کو EKS بمقابلہ ECS کب استعمال کرنا چاہیے؟

**ECS استعمال کریں** اگر:

- آپ بنیادی طور پر AWS پر ہیں اور آسان، زیادہ AWS-native تجربہ چاہتے ہیں
- آپ کی ٹیم کے پاس موجودہ Kubernetes مہارت نہیں ہے
- آپ کم operational overhead چاہتے ہیں

**EKS استعمال کریں** اگر:

- آپ کو Kubernetes-specific features چاہئیں (Custom Resource Definitions، Helm charts، Kubernetes ecosystem)
- آپ کی ٹیم پہلے ہی Kubernetes جانتی ہے
- آپ ایک hybrid environment چلا رہے ہیں (کچھ on-premises، کچھ AWS میں) اور ایک مستقل orchestration layer چاہتے ہیں
- آپ کے workload کی ایسی ضروریات ہیں جو Kubernetes کی توسیع پذیری سے match کرتی ہیں

**Container Networking: Ephemeral IPs اور Service Discovery**

ایک چیز جو ٹیموں کو containers میں منتقل ہوتے وقت چونکا دیتی ہے: ایک container کا IP address ہر بار جب یہ restart ہوتا ہے بدل جاتا ہے۔

EC2 دنیا میں، instances کے نسبتاً مستحکم private IPs تھے۔ آپ (اگرچہ آپ کو نہیں کرنا چاہیے) انہیں configuration files میں hardcode کر سکتے تھے۔ Services ایک دوسرے کو IP سے جانتی تھیں۔

Container دنیا میں، ECS میں ہر task کو شروع ہوتے وقت VPC subnet سے ایک IP ملتا ہے۔ جب یہ رکتا ہے اور ایک نیا task شروع ہوتا ہے (ایک deployment یا restart کے حصے کے طور پر)، اس نئے task کو ایک مختلف IP ملتا ہے۔

"کیا ہوتا ہے جب ایک service `10.0.1.45` کو call کرنے کے لیے hardcoded ہو اور وہ container `10.0.1.82` سے replace ہو جائے؟" Priya نے پوچھا۔ "Calling service کچھ نہیں کو hit کرنا شروع کر دیتی ہے۔"

یہی وجہ ہے کہ container environments میں service discovery اہمیت رکھتی ہے۔ ECS + Application Load Balancer اسے خودبخود سنبھالتا ہے: ALB کا DNS name مستحکم ہے؛ ECS صحت مند tasks کو target group کے ساتھ register کرتا ہے؛ ALB ان tasks کی طرف route کرتا ہے جو فی الحال صحت مند ہیں۔ Calling service ALB DNS name سے بات کرتی ہے، انفرادی container IPs سے نہیں۔

internal service-to-service communication کے لیے (user-facing نہیں)، **AWS Cloud Map** service discovery فراہم کرتا ہے: ہر ECS service Cloud Map کے ساتھ register کرتی ہے، جو ایک مستحکم DNS name فراہم کرتا ہے۔ Order service `http://notification.nimbus.local:8080` کو call کرتی ہے، اور Cloud Map اسے notification service میں ان tasks تک resolve کرتا ہے جو فی الحال صحت مند ہیں۔

"تو containers ایک دوسرے سے DNS names کے ذریعے بات کرتے ہیں، IPs سے نہیں؟" Leo نے تصدیق کی۔

"درست۔ IP ephemeral ہے۔ DNS name contract ہے۔"

**Secrets Injection: Environment Variables میں کوئی Secrets نہیں**

اصل EC2 deployment کا ایک مسئلہ تھا جسے Priya مہینوں سے نشان زد کر رہی تھی: secrets (database password، API keys، SES credentials) EC2 instance پر environment variables میں اسٹور تھے، ایک deployment script کے ذریعے سیٹ کیے گئے۔

Environment variables instance پر چلنے والے کسی بھی process کے لیے قابل رسائی ہیں۔ وہ debugging tools میں، بعض crash reports میں، اور process lists میں نظر آتے ہیں۔ وہ CloudWatch میں بھی نظر آتے ہیں اگر آپ انہیں log کریں (جو کچھ development tools default کے طور پر کرتے ہیں)۔

Containers اسے خودبخود حل نہیں کرتے — آپ پھر بھی ECS task definition میں secrets کو environment variables کے طور پر pass کر سکتے ہیں۔ اور ECS task definitions AWS console میں اسٹور ہوتے ہیں، ECS رسائی والے کسی بھی شخص کو نظر آتے ہیں۔

صحیح pattern: **AWS Secrets Manager + ECS task definition انضمام**۔

task definition میں database password اسٹور کرنے کے بجائے:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS task launch کے وقت Secrets Manager سے secret حاصل کرتا ہے اور اسے ایک environment variable کے طور پر container میں inject کرتا ہے۔ Secret value کبھی task definition میں اسٹور نہیں ہوتی — صرف Secrets Manager secret کا ARN۔ Container value کو runtime پر وصول کرتا ہے۔ Secrets Manager task definition تبدیل کیے بغیر value کو rotate کر سکتا ہے۔

"اور اگر کوئی task definition پڑھے؟" Priya نے پوچھا۔ "وہ Secrets Manager ARN دیکھیں گے، لیکن value نہیں۔"

"اور صحیح IAM permissions کے بغیر،" Leo نے تصدیق کی، "وہ Secrets Manager سے value بھی حاصل نہیں کر سکتے۔"

"یہی ڈیزائن ہے،" Priya نے کہا۔ "Task کے execution role کو وہ مخصوص secret پڑھنے کی اجازت ہے۔ اور کچھ نہیں۔ task definition compromise کرنا آپ کو ایک ARN دیتا ہے، password نہیں۔"

"ہمیں کون سا استعمال کرنا چاہیے؟" Maya نے پوچھا۔ "اور Kubernetes کیوں نہیں؟ یہ ہر job description میں ہے۔ ہر conference talk میں۔"

"ECS،" Priya نے فوراً کہا۔ "ہمارے پاس Kubernetes مہارت نہیں ہے۔ ECS وہ سب کچھ کرتا ہے جس کی ہمیں ضرورت ہے۔ Kubernetes کو ابھی شامل کرنا کسی عملی فائدے کے بغیر operational پیچیدگی شامل کرنا ہوگا۔"

Soo-Jin، جس نے اپنی پچھلی کمپنی میں Kubernetes clusters چلائے تھے، نے سر ہلایا۔ "میں نے وہ pager اٹھایا ہے۔ آپ اسے نہیں چاہتے جب تک آپ کو اس کی ضرورت نہ ہو۔"

"اگر ہم ECS سے بڑھ جائیں تو ہم ہمیشہ بعد میں EKS میں منتقل ہو سکتے ہیں،" Leo نے شامل کیا۔

یہ ایک درست senior جواب ہے: وہ آسان tool منتخب کریں جو آپ کی موجودہ ضروریات سے match کرتا ہو۔

**ECR: آپ کی Images کو محفوظ بنانا**

"اور اگر کوئی ایک vulnerable base image کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "کوئی ایک معلوم CVE والی پرانی image لیتا ہے اور اسے application container میں قدم جمانے کے لیے استعمال کرتا ہے؟"

یہ production میں کوئی بھی container deploy کرنے سے پہلے پوچھنے کے لیے صحیح سوال تھا۔

**Amazon ECR (Elastic Container Registry)** آپ کی Docker images اسٹور کرتا ہے اور deployment سے پہلے انہیں معلوم vulnerabilities کے لیے scan کر سکتا ہے۔ ECR image scanning image کو معلوم CVEs (Common Vulnerabilities and Exposures) کے ایک database کے خلاف چیک کرتا ہے اور مسائل کو severity کے لحاظ سے نشان زد کرتا ہے۔

Priya نے جو policy لکھی: ایک CRITICAL severity CVE والی کوئی image production میں deploy نہیں کی جائے گی۔ CI/CD pipeline ECS service اپڈیٹ کرنے سے پہلے scan results چیک کرے گی۔ اگر ایک critical vulnerability پائی جائے، pipeline ناکام ہو جائے گی اور ٹیم کو alert کرے گی۔

"یہ paranoia نہیں ہے،" Priya نے کہا۔ "یہ بس deploy کرنے سے پہلے ایک check رکھنا ہے۔"

**Containers Deployments کو کیسے بدلتے ہیں**

Containers سے پہلے، Nimbus API کا ایک نیا version deploy کرنے کا مطلب تھا:

1. ہر EC2 instance میں SSH کریں
2. Git سے تازہ ترین code pull کریں
3. Dependencies install/update کریں
4. Application process restart کریں
5. Health verify کریں
6. اگلی instance کی طرف بڑھیں

یہ error-prone اور سست تھا۔ اس کے لیے coordination درکار تھی۔ اگر instance 4 پر step 3 ناکام ہو، آپ کے پاس ایک mixed deployment ہوتا جس میں کچھ instances پرانا version چلا رہی ہوتیں اور کچھ نیا version چلانے میں ناکام ہوتیں۔

ECS اور containers کے ساتھ:

1. ایک نئی Docker image بنائیں (CI/CD pipeline میں خودکار)
2. ECR کو push کریں
3. ECS service کو نئی image version استعمال کرنے کے لیے اپڈیٹ کریں

ECS rolling deployment سنبھالتا ہے: نئی image کے ساتھ نئے tasks شروع کرتا ہے، ان کے صحت مند ہونے کا انتظار کرتا ہے، پھر پرانے tasks روک دیتا ہے۔ صفر-downtime deployment، خودکار۔

اگر نیا version health checks میں ناکام ہو، ECS deployment روک دیتا ہے اور پرانا version ٹریفک serve کرتا رہتا ہے۔

**Deployment کی کم سے کم Config: Health Checks**

container deployments کی پوری حفاظت health checks کے دراصل کام کرنے پر منحصر ہے۔

ECS دو قسم کے health checks استعمال کرتا ہے:

**Container-level health check**: Dockerfile یا task definition میں define کیا گیا۔ Container کے اندر چلتا ہے یہ verify کرنے کے لیے کہ application جواب دے رہی ہے۔

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**ALB target group health check**: لوڈ بیلنسر وقتاً فوقتاً ایک health endpoint کو HTTP requests بھیجتا ہے۔ Health check میں ناکام ہونے والے tasks target group سے ہٹا دیے جاتے ہیں۔

اگر کوئی بھی health check صحیح طریقے سے configure نہ ہو، ECS ہر task کو صحت مند سمجھتا ہے — اور بغیر رکے ایک ٹوٹی ہوئی image deploy کرے گا۔ یہ سب سے عام container deployment غلطی ہے۔

"کیا health check endpoint internal معلومات leak کر سکتا ہے؟" Priya نے پوچھا۔

`/health` پر health check endpoint صرف یہ واپس کرتا: `{"status": "ok"}`۔ کوئی version numbers نہیں، کوئی dependency states نہیں، کوئی internal configuration نہیں۔ health response میں کوئی بھی معلومات application کو map کرنے والے کسی کے لیے مفید ہو سکتی ہے۔ Health endpoints کو کم سے کم رکھیں۔

تفصیلی internal health status (database connectivity، dependency checks) کے لیے، ایک علیحدہ authenticated `/health/detail` endpoint استعمال کریں — صرف VPC کے اندر سے قابل رسائی۔

**Structured Logging: ایک چلتے Container میں واحد کھڑکی**

EC2 پر، کچھ غلط ہوتا اور آپ SSH کرتے۔ آپ log file کو tail کرتے۔ آپ process table دیکھتے۔ آپ disk usage چیک کرتے۔ آپ ادھر ادھر کھوجتے۔

ایک container میں، کوئی SSH نہیں ہے۔ Container ephemeral ہے — یہ cluster کے کسی بھی host پر چل رہا ہو سکتا ہے، اور ECS اسے بغیر انتباہ کے replace کر دے گا اگر یہ health checks میں ناکام ہو۔ جب تک آپ SSH کرنے کے بارے میں سوچتے ہیں، وہ container جسے آپ جانچنا چاہتے تھے شاید مزید موجود نہ ہو۔

Logs containerized environments میں ایک debugging سہولت نہیں ہیں۔ وہ واحد ثبوت ہیں کہ کچھ ہوا۔

"اور اگر ایک container خاموشی سے ناکام ہو جائے اور ہمارے پاس کوئی logs نہ ہوں؟" Priya نے containers architecture review کے دوران پوچھا۔ "ایک task code 1 کے ساتھ exit ہو سکتا ہے اور ہمیں کبھی وجہ معلوم نہ ہو اگر اس کے terminate ہونے سے پہلے logs capture نہ کیے گئے ہوں۔"

یہ فرضی نہیں ہے۔ یہ پہلی container deployments پر ہوتا ہے، مسلسل۔

صحیح pattern: ہر container کو `awslogs` log driver استعمال کرتے ہوئے **Amazon CloudWatch Logs** کو structured logs بھیجنے کے لیے configure کریں۔ ECS shipping خودبخود سنبھالتا ہے — install کرنے کے لیے کوئی log agent نہیں، درکار کوئی sidecar container نہیں۔

task definition میں:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

container کے اندر stdout یا stderr کو لکھی گئی ہر لائن capture ہوتی ہے اور log group `/ecs/nimbus-api` کو بھیجی جاتی ہے، task ID کے لحاظ سے منظم۔ ECS ہر task کے لیے ایک نیا log stream بناتا ہے، تاکہ آپ اس مخصوص container کے logs تلاش کر سکیں جو ناکام ہوا — اس کے replace ہونے کے بعد بھی۔

task execution role کو CloudWatch Logs میں لکھنے کی اجازت چاہیے۔ اس کے بغیر، log driver خاموشی سے ناکام ہو جاتا ہے اور تمام log output ضائع ہو جاتا ہے۔

**Structured logs بمقابلہ plain text**: Plain text logs ("Order 7741 placed") کے لیے grep درکار ہے۔ Structured JSON logs (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) کو CloudWatch Logs Insights کے ساتھ ایک ایسے syntax کا استعمال کرتے ہوئے query کیا جا سکتا ہے جو SQL سے مشابہ ہے:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

وہ query براہ راست log group کے خلاف چلتی ہے۔ کوئی database نہیں۔ کوئی data pipeline نہیں۔ کوئی ETL job نہیں۔ جواب سیکنڈوں میں وہاں موجود ہے۔

یہ اس analytics data lake کی جگہ نہیں لیتا جسے ہم باب 26 میں بنائیں گے۔ یہ operational سوالات کا جواب دیتا ہے — "پچھلے 30 منٹ میں ریستوران 47 سے کتنے آرڈرز؟" — ایک incident کے بیچ میں، جب آپ کے پاس ایک Athena query چلانے کا وقت نہیں ہوتا۔

**CloudWatch Container Insights**

**Container Insights** ایک CloudWatch feature ہے جو container-level metrics — CPU، memory، network I/O، storage I/O — جمع اور aggregate کرتا ہے، فی ECS cluster، service، اور task۔ EC2-level metrics (host کیسا کر رہا ہے؟) کے بجائے، آپ task-level metrics دیکھتے ہیں (یہ مخصوص ECS service کیسا کر رہی ہے؟)۔

اسے ECS cluster پر ایک setting کے ساتھ فعال کریں:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

فعال کرنے کے بعد:

- آپ فی service ایک dashboard دیکھتے ہیں: task count، CPU utilization، memory utilization
- آپ task-level CPU پر alarm کر سکتے ہیں (EC2 host CPU کے بجائے، جو ایک کہیں زیادہ کند signal ہے)
- آپ memory spikes کو log events سے correlate کر سکتے ہیں — task memory 14:22 پر 95% تک چڑھی؛ logs بالکل 14:21 پر ریستوران 47 کے menu import سے inbound requests میں ایک spike دکھاتے ہیں

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے پوچھا۔

Container Insights اس کے پیدا کردہ custom metrics اور log storage کے لیے charge کرتا ہے۔ Nimbus کے پیمانے پر (تین services، ہر ایک 3-6 tasks)، یہ تقریباً $12/مہینہ تھا — task-level operational visibility کے لیے ایک معقول سودا۔

Leo نے اسے دن کے اندر فعال کر دیا۔

پہلی بار جب ایک task health check میں ناکام ہوا اور ECS سے replace ہوا، Container Insights dashboard نے event خودبخود capture کیا: task ID، start time، failure time، exit code۔ اس task کے لیے CloudWatch log stream نے termination سے پہلے output کی آخری 40 لائنیں محفوظ رکھیں — جنہوں نے ایک نئے ریستوران partner سے ایک malformed menu JSON کے ذریعے trigger ہونے والا ایک uncaught exception دکھایا۔

Container Insights اور structured logging کے بغیر: error rates میں ایک پراسرار spike، تحقیق کے لیے ایک ایسے host میں SSH کرنا درکار جو اب ناکام task نہیں چلاتا، 45 منٹ کی قیاس آرائی۔

ان کے ساتھ: CloudWatch dashboard میں ایک log stream link، عین exception، ریستوران ID، قصوروار field — پانچ منٹ سے کم میں۔

"کوئی SSH نہیں،" Leo نے post-mortem کا جائزہ لیتے ہوئے کہا۔ "تحقیق کرنے کے لیے کوئی downtime نہیں۔ Logs نے کام کیا۔"

"Logs صرف تب کام کرتے ہیں،" Priya نے کہا، "اگر آپ نے انہیں capture ہونے کے لیے configure کیا ہو۔"


**جب Containers غلط انتخاب ہوں**

"رکو — لیکن ہم ہر چیز کو containerize *کیوں* نہ کریں؟" Maya نے پوچھا۔ "تم نے ابھی مجھے قائل کیا کہ containers تمام configuration drift مسائل حل کرتے ہیں۔ ہر ایک service کو ایک container کے طور پر کیوں نہ چلائیں؟"

یہ وہی سوال تھا جو اس نے Lambda کے بارے میں پوچھا تھا۔ جواب مشابہ تھا۔

Containers operational requirements شامل کرتے ہیں: آپ کو ایک container registry (ECR) چاہیے، ایک CI/CD pipeline جو images بناتی اور push کرتی ہے، ایک orchestrator (ECS)، instance-level کے بجائے task-level visibility کے لیے configured monitoring، اور ایک ٹیم جو Docker اور image versioning سمجھتی ہے۔

ایک ایسی service کے لیے جو پہلے ہی EC2 پر اچھی طرح کام کر رہی ہے، مستحکم ہے، اور configuration drift سے نہیں جوجھ رہی، اسے containerize کرنے کی لاگت فائدے سے زیادہ ہو سکتی ہے۔

مخصوص صورتیں جہاں containers غلط انتخاب ہیں:

**Stateful services جو container mobility کے لیے نہیں بنائے گئے**: Containers میں databases کو احتیاط سے persistent volume management کی ضرورت ہے۔ Containers میں databases چلانے والی زیادہ تر ٹیمیں اس پیچیدگی کا سامنا کرنے کے بعد بالآخر انہیں managed services (RDS، ElastiCache) میں واپس منتقل کر دیتی ہیں۔

**خصوصی hardware requirements والی services**: GPU workloads، مخصوص network interface configurations، یا FPGA-based processing کے لیے مخصوص hardware والی EC2 instances درکار ہیں۔ Containers اسے تبدیل نہیں کرتے — آپ پھر بھی EC2 launch type استعمال کریں گے، بس اوپر containers کے ساتھ، اور container abstraction بغیر فائدے کے پیچیدگی شامل کرتا ہے۔

**بہت سادہ scripts اور jobs**: ایک 40-لائن Python script جو ہفتے میں ایک بار چلتا ہے اور کوئی dependency drift مسائل نہیں رکھتا۔ اس کے لیے Docker، ECR، ECS task definitions، اور ایک CI/CD pipeline شامل کرنا غیر متناسب ہے۔ Lambda آسان ہے۔ ایک سادہ EC2 cron job اور بھی آسان ہو سکتا ہے۔

"اصول،" Leo نے کہا، "ہمیشہ کی طرح ہی ہے: tool کو مسئلے سے match کریں۔ Containers configuration drift اور deployment consistency حل کرتے ہیں۔ اگر آپ کو وہ مسئلہ نہیں ہے، آپ کو containers کی ضرورت نہیں۔"

## AWS Batch: بڑے پیمانے کے Jobs کے لیے Containers

ECS اور EKS long-running services کے لیے ڈیزائن کیے گئے ہیں — وہ applications جو مسلسل چلتی ہیں، requests قبول کرتی ہیں، اور ٹریفک کے ساتھ scale کرتی ہیں۔ لیکن کچھ workloads مختلف ہیں: وہ ایک مقررہ مدت کے لیے چلتے ہیں، ایک متعین dataset process کرتے ہیں، پھر رک جاتے ہیں۔ سینکڑوں ریستورانوں کے لیے ماہ کے آخر کے invoices تیار کرنا۔ ایک machine learning training job چلانا۔ ایک رات کا analytics export process کرنا۔

ان workloads کے لیے، آپ ایک service نہیں چاہتے — آپ ایک job چاہتے ہیں۔

**AWS Batch** ایک fully managed service ہے جو کسی بھی پیمانے پر batch computing jobs چلاتی ہے۔ آپ اپنے job کو ایک Docker container کے طور پر define کرتے ہیں (وہی container format جو ECS استعمال کرتا ہے)، اور Batch باقی سنبھالتا ہے: EC2 یا Fargate compute provision کرنا، jobs کو queues میں schedule کرنا، jobs آنے پر capacity scale up کرنا اور ان کے ہو جانے پر واپس صفر تک۔

اہم تصورات:

- **Job definition:** Docker container، resource requirements (vCPU، memory)، اور چلانے کے لیے command
- **Job queue:** جہاں submit کیے گئے jobs چلنے سے پہلے انتظار کرتے ہیں؛ ہر queue ایک یا زیادہ compute environments سے منسلک ہوتی ہے
- **Compute environment:** underlying EC2 یا Fargate capacity۔ 90% تک لاگت کی بچت کے لیے Spot Instances استعمال کر سکتا ہے — Batch interruptions اور retries خودبخود سنبھالتا ہے

"رکو — لیکن ہم بس ایک ECS task چلانے کے بجائے Batch *کیوں* استعمال کریں؟" Maya نے پوچھا۔

"کیونکہ ایک ECS service ہمیشہ on ہوتی ہے،" Leo نے کہا۔ "یہ requests کا انتظار کرتی ہے۔ ایک Batch job چلتا ہے، ختم ہوتا ہے، اور Batch compute کو واپس صفر تک scale کرتا ہے۔ آپ runs کے درمیان کچھ ادا نہیں کرتے۔"

Tom نے pricing page سے نظر اٹھائی۔ "اور Spot Instances؟"

"Batch Spot پر چل سکتا ہے۔ اگر ایک Spot Instance mid-job reclaim ہو جائے، Batch خودبخود retry کرتا ہے۔ ایک 45-منٹ کے invoice job کے لیے، یہ ٹھیک ہے۔"

**بمقابلہ ECS/EKS:** ECS/EKS services چلاتے ہیں — ہمیشہ on، request-driven۔ Batch jobs چلاتا ہے — محدود مدت، data-driven، بیکار ہونے پر صفر تک scale۔

**بمقابلہ Lambda:** Lambda کی 15-منٹ timeout ہے۔ Batch jobs گھنٹوں یا دنوں کے لیے چل سکتے ہیں۔

Nimbus سیاق و سباق: رات کی invoice generation job سینکڑوں ریستوران partners کے لیے 45 منٹ لیتی ہے۔ Lambda 15 منٹ پر timeout ہو جاتا ہے۔ ایک always-on ECS service دن کے 23 گھنٹے پیسہ ضائع کرتی ہے۔ Batch job کو Spot Instances پر چلاتا ہے، 38 منٹ میں ختم کرتا ہے، $1.20 خرچ کرتا ہے، اور بند ہو جاتا ہے۔

"یہ اس coffee سے سستا ہے جو میں نے پرانی script کے ختم ہونے کا انتظار کرتے ہوئے خریدی،" Leo نے کہا۔

"اور manage کرنے کے لیے کوئی EC2 نہیں،" Priya نے شامل کیا۔ "Batch اسے provision کرتا ہے، چلاتا ہے، terminate کرتا ہے۔"

## خوبیاں اور حدود

**Containers**:

- environment inconsistency ختم کرتے ہیں ("میری مشین پر کام کرتا ہے")
- تیز، قابل اعتماد deployments کو قابل بناتے ہیں
- Immutable — وہی image ہر جگہ یکساں چلتی ہے
- کارآمد — VMs سے ہلکے، تیز startup

**ECS**:

- AWS-centric workloads کے لیے Kubernetes سے آسان
- تنگ AWS انضمام (IAM، ALB، CloudWatch، Secrets Manager)
- Fargate option EC2 management مکمل طور پر ہٹا دیتا ہے

**EKS**:

- مکمل Kubernetes compatibility — پورا ecosystem استعمال کریں
- hybrid environments یا Kubernetes مہارت والی ٹیموں کے لیے بہتر
- ECS سے سیٹ اپ اور operate کرنا زیادہ پیچیدہ

**جہاں یہ پیچیدہ ہو جاتا ہے**:

- Container images کو بنانا اور version کرنا ضروری ہے — ایک CI/CD pipeline درکار ہے
- Containers debug کرنے کے لیے روایتی processes debug کرنے سے مختلف tooling درکار ہے
- Stateful containers (containers میں databases) کو احتیاط سے persistent storage configuration درکار ہے
- Containers کے درمیان networking (service-to-service communication) کے لیے container networking تصورات سمجھنا ضروری ہے

## خلاصہ

Lambda نے idle compute کو مفت بنایا۔ Containers نے deployment کو deterministic بنایا۔ ایک ساتھ، انہوں نے بڑھتی ہوئی engineering teams کے لیے operational تکلیف کی دو سب سے عام وجوہات حل کر دیں۔

- **Containers** application code، runtime، اور dependencies کو ایک ساتھ package کرتے ہیں — کہیں بھی یکساں چلتے ہیں۔
- **Docker** standard container technology ہے۔ Images blueprints ہیں؛ containers چلتی instances ہیں۔
- **ECR (Elastic Container Registry)** AWS کا managed Docker registry ہے — اپنی images یہاں اسٹور، version، اور scan کریں۔ Deployment سے پہلے CVEs پکڑنے کے لیے image scanning فعال کریں۔
- **ECS (Elastic Container Service)** containers کو orchestrate کرتا ہے۔ آپ tasks اور services define کرتے ہیں؛ ECS placement اور lifecycle manage کرتا ہے۔
- **Fargate** containers کے لیے serverless compute ہے — manage کرنے کے لیے کوئی EC2 instances نہیں۔ EC2 overhead کے خاتمے کی وجہ سے چھوٹے پیمانوں پر اکثر EC2 launch type سے سستا۔ احتیاط سے task bin-packing کے ساتھ بڑے پیمانوں پر، EC2 launch type زیادہ cost-effective ہو سکتا ہے۔
- **EKS (Elastic Kubernetes Service)** managed Kubernetes ہے — ان ٹیموں کے لیے جنہیں Kubernetes features یا compatibility چاہیے۔
- **Secrets Manager انضمام**: task definition کے ذریعے launch کے وقت containers میں secrets inject کریں — secret values کو براہ راست environment variables یا task definitions میں اسٹور نہ کریں۔
- **Service discovery**: container IPs ephemeral ہیں۔ مستحکم service addressing کے لیے ALB DNS names یا Cloud Map استعمال کریں۔
- AWS پر سادگی کے لیے ECS منتخب کریں؛ Kubernetes ecosystem compatibility کے لیے EKS منتخب کریں۔

## امتحانی نکات

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں (ڈومین 2، ٹاسک 2.1)*

- **ECS بمقابلہ EKS signals**: امتحانی scenarios جو "Kubernetes،" "Helm،" "موجودہ Kubernetes مہارت،" یا "multi-cloud container orchestration" کا ذکر کرتے ہیں → EKS۔ باقی سب کچھ → ECS۔
- **Fargate بمقابلہ EC2 launch type**: "containers کے لیے EC2 instances manage نہیں کرنا چاہتے،" "serverless containers،" "کوئی infrastructure management نہیں" → Fargate۔ "مخصوص instance types چاہئیں،" "GPU workloads،" "باریک instance کنٹرول" → EC2 launch type۔
- **Task role بمقابلہ task execution role** — ایک حقیقی امتحانی تمیز۔ **task execution role** task کی طرف سے ECS *agent* استعمال کرتا ہے، آپ کے code سے پہلے اور اس کے ارد گرد: ECR سے image pull کرنا، Secrets Manager سے secrets حاصل کرنا، CloudWatch کو logs لکھنا۔ **task role** وہ ہے جو *container کے اندر آپ کا application code* AWS services کو call کرنے کے لیے استعمال کرتا ہے: S3 سے پڑھنا، DynamoDB کو لکھنا — EC2 instance roles کی طرح، لیکن فی task، تاکہ ہر task کی مختلف permissions ہو سکیں۔ "Container کو S3 سے پڑھنے کی ضرورت ہے" → **task role** (task definition میں منسلک)۔ "Task اپنی image pull کرنے میں ناکام / اپنا secret حاصل نہیں کر سکتا" → **execution role** میں permissions کی کمی ہے۔
- **Fargate Spot**: fault-tolerant containers کو spare capacity پر ~70% تک کم پر چلائیں، دو منٹ کے interruption warning کے ساتھ — EC2 Spot کا Fargate مساوی، capacity providers کے ذریعے configured۔ امتحانی trigger: "instances manage کیے بغیر سب سے کم لاگت پر interruption-tolerant containers چلائیں" → Fargate Spot۔
- **ECR image scanning**: ECR container images کو معلوم vulnerabilities (CVEs) کے لیے scan کر سکتا ہے۔ امتحانی signal: "security vulnerabilities کے لیے containers scan کریں" → ECR image scanning۔
- **Blue/green deployments**: ECS CodeDeploy انضمام کے ذریعے blue/green deployments سپورٹ کرتا ہے۔ خودکار rollback کے ساتھ صفر-downtime deployment۔ امتحانی pattern: "خودکار rollback کے ساتھ بغیر downtime deploy کریں" → ECS + CodeDeploy blue/green۔
- **Secrets Manager انضمام**: امتحانی signal: "task definitions میں values اسٹور کیے بغیر containers میں secrets inject کریں" → ایک Secrets Manager ARN کا حوالہ دیتے ہوئے task definition میں `secrets` field استعمال کریں۔ task execution role کو `secretsmanager:GetSecretValue` permission چاہیے۔
- **ECS Service Auto Scaling**: CPU، memory، یا custom CloudWatch metrics کی بنیاد پر tasks کی تعداد scale کریں۔ ALB کے ساتھ کام کرتا ہے تاکہ ٹریفک کو چلتے tasks کی صحیح تعداد کی طرف route کیا جا سکے۔
- **AWS Batch:** Docker containers کے لیے managed batch compute۔ Job queue → compute environment (EC2 یا Fargate، Spot سپورٹ کرتا ہے)۔ استعمال کریں جب: Lambda timeout بہت چھوٹا ہو، ECS service محدود jobs کے لیے فضول ہو۔ امتحانی trigger: "بڑے پیمانے کی batch processing" یا "ایک job جو گھنٹوں چلتا ہے" → AWS Batch۔

## مشقیں

**مشق 1 — یادداشت**

ایک Docker image اور ایک Docker container کے درمیان فرق کی وضاحت کریں۔ ECS اور ECR کے درمیان فرق کی وضاحت کریں۔

*(اشارہ: Image container کے لیے وہی ہے جو ایک recipe ایک پکی ہوئی dish کے لیے۔ ECR images اسٹور کرتا ہے؛ ECS انہیں چلاتا ہے۔)*

**مشق 2 — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی کی ایک microservices application فی الحال ہاتھ سے managed EC2 instances پر چل رہی ہے۔ ٹیم غیر مستقل deployments سے جوجھتی ہے — مختلف EC2 instances کی مختلف library versions ہیں، جو دوبارہ پیدا کرنے میں مشکل bugs کا سبب بنتی ہیں۔ وہ deployments کو standardize کرنا چاہتے ہیں جبکہ underlying servers manage کرنے کے operational overhead کو کم سے کم کرتے ہیں۔ ٹیم کے پاس کوئی Kubernetes تجربہ نہیں ہے۔

کون سا حل ان ضروریات کو سب سے بہتر طریقے سے پورا کرتا ہے؟

A) application کو Docker کے ساتھ containerize کریں؛ Fargate launch type کے ساتھ Amazon ECS استعمال کریں  
B) instances کو مستقل رکھنے کے لیے AWS Systems Manager Patch Manager کے ساتھ EC2 پر deploy کریں  
C) application کو Docker کے ساتھ containerize کریں؛ self-managed node groups کے ساتھ Amazon EKS استعمال کریں  
D) deployments اور instance configuration کو خودبخود manage کرنے کے لیے AWS Elastic Beanstalk استعمال کریں

**اشارہ 1**: Containers "غیر مستقل environment" مسئلہ براہ راست حل کرتے ہیں۔ کون سے options containers استعمال کرتے ہیں؟

**اشارہ 2**: "servers manage کرنے کے operational overhead کو کم سے کم کریں" → Fargate (کوئی EC2 management نہیں) بمقابلہ self-managed nodes (پھر بھی EC2 manage کریں)۔

**اشارہ 3**: "کوئی Kubernetes تجربہ نہیں" → EKS ECS سے زیادہ operational پیچیدگی ہے۔

**جواب**: A

**وضاحت**: Docker کے ساتھ containerize کرنا یقینی بناتا ہے کہ ہر deployment وہی image وہی dependencies کے ساتھ استعمال کرے — configuration drift ختم کرتے ہوئے۔ Fargate کے ساتھ ECS کا مطلب manage کرنے کے لیے کوئی EC2 instances نہیں۔ ٹیم application code اور container definitions پر توجہ مرکوز کرتی ہے، server maintenance پر نہیں۔ ECS (EKS نہیں) Kubernetes تجربے کے بغیر ٹیموں کے لیے مناسب ہے۔

**B کیوں نہیں؟** Patch Manager EC2 instances کو updated رکھتا ہے لیکن applications کے درمیان library version inconsistency حل نہیں کرتا۔ بنیادی مسئلہ (مختلف instances پر مختلف code environments) باقی رہتا ہے۔

**C کیوں نہیں؟** self-managed node groups کے ساتھ EKS کے لیے EC2 instances manage کرنا *اور* Kubernetes سیکھنا درکار ہے۔ کوئی بھی ضروریات سے match نہیں کرتا۔

**D کیوں نہیں؟** Elastic Beanstalk EC2 پر application deployment manage کرتا ہے لیکن بنیادی environment inconsistency حل نہیں کرتا جب تک containers استعمال نہ کیے جائیں۔ Beanstalk default کے طور پر Docker images استعمال نہیں کرتا (اگرچہ اسے ایسا کرنے کے لیے configure کیا جا سکتا ہے)۔

*SAA-C03 ڈومین: Resilient Architectures ڈیزائن کریں — ٹاسک 2.1*

**مشق 3 — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus monolithic API کو تین microservices میں تقسیم کر رہا ہے: order service، menu service، اور notification service۔ ہر service کی مختلف scaling requirements ہیں (order service ٹریفک کے ساتھ scale کرتی ہے؛ menu service زیادہ تر read-only اور مستحکم ہے؛ notification service کے تیز bursts ہیں)۔

ان تین services کے لیے ECS architecture ڈیزائن کریں۔ آپ service-to-service communication کیسے سنبھالیں گے؟ کیا آپ ایک ECS cluster استعمال کریں گے یا تین؟ آپ ہر service کے لیے Auto Scaling مختلف طریقے سے کیسے configure کریں گے؟

غور کریں: menu service read-heavy ہے اور 60 سیکنڈ کے لیے stale data serve کر سکتی ہے — کیا آپ اس کے سامنے caching شامل کریں گے؟ notification service جمعہ کی شاموں کو بھاری burst-scale کرتی ہے — کیا آپ Fargate Min capacity کو 1 اور Max کو 20 سیٹ کریں گے؟ ایک scale-down event کے دوران in-flight notifications کا کیا ہوتا ہے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد ECS پر microservices architecture کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

پہلا container deployment بے عیب تھا۔

API کا نیا version: صفر downtime۔ ECS نے اسے roll out کیا، health checks pass ہوئے، پرانے tasks drain ہوئے، نئے tasks نے ذمہ سنبھال لیا۔ Leo نے console میں task status کو کسی ایسی چیز کے ساتھ دیکھا جو بے یقینی کے قریب تھی۔

"یہ بس کام کر گیا،" اس نے کہا۔

"پچھلے ہفتے تم نے instance تین پر ناکام ہونے سے پہلے manual SSH deploy کے بارے میں یہی کہا تھا،" Priya نے کہا۔

"میں نے پہلے ہی اسے deploy کر دیا — اوہ۔" Leo رکا۔ "میں نے image version tag کیے بغیر deploy کیا۔ مجھے اسے fix کرنے دو۔"

"یہی بات ہے،" Priya نے کہا۔ "Image versioning وہ طریقہ ہے جس سے آپ track کرتے ہیں کہ کیا چل رہا ہے۔"

"آپ کیسے جانتے ہیں کہ ابھی production میں کون سا version ہے؟" Maya نے پوچھا۔

Leo نے ECS console کھولا۔ چلتے task کے تحت، image درج تھی: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`۔ Version 1.0.3۔ 14:22 UTC پر بنائی گئی۔ 14:31 UTC پر deploy کی گئی۔

"پرانی EC2 setup پر،" Leo نے کہا، "مجھے ایک instance میں SSH کرنا پڑتا اور یہ دیکھنے کے لیے `pip show` چلانا پڑتا کہ ہر dependency کا کون سا version install ہے۔ اور یہ دوسری instances پر مختلف ہو سکتا تھا۔"

"اور اب؟"

"Image پر tag مجھے بالکل بتاتا ہے کہ کیا چل رہا ہے۔ ECR scan history مجھے بتاتی ہے کہ یہ scan ہوئی تھی یا نہیں۔ ECS deployment history مجھے بتاتی ہے کہ یہ کب deploy ہوئی اور پچھلا version کیا تھا۔"

"کوئی SSH نہیں۔ کوئی downtime نہیں۔ کوئی 'اس کے restart ہونے کا انتظار کرو' نہیں۔"

"Image deployment artifact ہے،" Priya نے کہا۔ "Environment immutable ہے۔ Deployment process declarative ہے۔ Software اسی طرح ship ہونا چاہیے۔"

Leo نے ایک اور لمحے کے لیے console کو گھورا۔

"میں نے تین سال EC2 deployments coordinate کرنے میں گزارے،" اس نے کہا۔ "SSH scripts coordinate کرنے میں۔ Deployment runbooks لکھنے میں۔"

"تم ایک مسئلہ حل کر رہے تھے،" Priya نے کہا، "جسے containers ڈیزائن کے لحاظ سے حل کرتے ہیں۔"

اس کے بعد اس نے کچھ نہیں کہا۔ لیکن اگلی صبح، اس نے container build process پر documentation لکھنا شروع کی، تاکہ کسی اور کو اسے سمجھنے میں تین سال نہ گزارنے پڑیں۔

instance-تین bug، غیر دستاویزی drift کے چھ ہفتے، اور اس جیسے مسائل جو انہوں نے ابھی تک نہیں پکڑے تھے — اس سب کی ایک واحد جڑ تھی۔ کوئی malicious actor نہیں۔ کوئی hardware failure نہیں۔ بس ایک server جسے ایک disposable unit کے بجائے ایک مستقل fixture کی طرح سمجھا گیا تھا۔

Container اس کا جواب تھا۔ اس لیے نہیں کہ یہ نیا اور دلچسپ تھا۔ اس لیے کہ اس نے سوال کو پوچھنا ناممکن بنا دیا۔

اگلے باب میں: وہ flowchart جو خود کو چلاتا ہے — اور یاد رکھتا ہے کہ یہ کہاں رکا تھا۔
