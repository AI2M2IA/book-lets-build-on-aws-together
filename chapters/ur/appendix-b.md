# ضمیمہ B: SAA-C03 ڈومین نقشہ

AWS Solutions Architect Associate امتحان (SAA-C03) چار ڈومینز میں منظم ہے۔ یہ ضمیمہ کتاب کے ہر باب کو متعلقہ ڈومین اور task سے جوڑتا ہے، تاکہ آپ باب کی ترتیب کے بجائے امتحانی شعبے کے لحاظ سے مطالعہ کر سکیں۔

---

## ڈومین کا جائزہ

| ڈومین                                          | وزن    | تفصیل                                                   |
|------------------------------------------------|--------|--------------------------------------------------------|
| ڈومین 1: محفوظ فن تعمیر ڈیزائن کرنا            | 30%    | IAM، نیٹ ورک سیکیورٹی، ڈیٹا تحفظ                        |
| ڈومین 2: مضبوط فن تعمیر ڈیزائن کرنا            | 26%    | اعلیٰ دستیابی، fault tolerance، آفات سے بحالی           |
| ڈومین 3: اعلیٰ کارکردگی والے فن تعمیر ڈیزائن کرنا | 24%    | کمپیوٹ، اسٹوریج، ڈیٹابیس، نیٹ ورک کارکردگی              |
| ڈومین 4: لاگت کے لحاظ سے بہتر فن تعمیر ڈیزائن کرنا | 20%    | قیمتوں کے ماڈلز، لاگت کا انتظام، وسائل کی اصلاح          |

---

## ڈومین 1: محفوظ فن تعمیر ڈیزائن کرنا (30%)

**Task 1.1 — AWS وسائل تک محفوظ رسائی ڈیزائن کرنا**

بنیادی تصورات: IAM users، groups، roles، policies۔ Least privilege کا اصول۔ Cross-account رسائی۔ Service roles۔ AWS Organizations میں SCP (Service Control Policies)۔

| باب        | موضوع                                                                         |
|------------|------------------------------------------------------------------------------|
| باب 3      | IAM بنیادیات: users، groups، roles، policies، policy evaluation                |
| باب 14     | IAM اعلیٰ: خدمات کے لیے roles، permission boundaries، cross-account roles      |
| باب 3      | Policy evaluation منطق: explicit deny > explicit allow > implicit deny         |
| باب 14     | AWS Organizations، SCPs، Control Tower، Account Factory                       |
| باب 14     | Cognito: User Pools (ایپ sign-in، JWTs) اور Identity Pools (عارضی AWS credentials) |

اہم امتحانی patterns:

- "EC2 کو hardcoded credentials کے بغیر S3 تک رسائی درکار" → EC2 instance profile سے منسلک S3 policy کے ساتھ IAM role
- "مختلف accounts کو وسائل شیئر کرنے کی ضرورت" → cross-account trust policy کے ساتھ IAM role
- "کسی OU میں تمام IAM users کو کسی خدمت تک رسائی سے روکنا" → AWS Organizations میں SCP

---

**Task 1.2 — محفوظ workloads اور ایپلیکیشنز ڈیزائن کرنا**

بنیادی تصورات: VPC ڈیزائن، security groups بمقابلہ NACLs، نیٹ ورک isolation، DDoS تحفظ، WAF، GuardDuty۔

| باب        | موضوع                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| باب 11     | VPC ڈیزائن: public/private subnets، NAT Gateway، Internet Gateway، route tables             |
| باب 15     | Security groups (stateful، instance کی سطح) بمقابلہ NACLs (stateless، subnet کی سطح)         |
| باب 17     | Shield (DDoS)، WAF (ایپ firewall)، GuardDuty (خطرے کی نشاندہی)، Inspector (CVE اسکیننگ)     |
| باب 17     | Macie: S3 میں حساس ڈیٹا کی دریافت (PII، credentials)                                        |
| باب 25     | Direct Connect، VPN، Transit Gateway، PrivateLink                                          |

اہم امتحانی patterns:

- "subnet سے کسی مخصوص IP کو بلاک کرنا" → NACL deny rule
- "HTTP اندر آنے دینا، HTTP جواب کو خودکار طور پر باہر جانے دینا" → Security group (stateful)
- "ویب ایپلیکیشن کو SQL injection سے بچانا" → SQL injection rule کے ساتھ WAF
- "خراب IAM credentials کا پتہ لگانا" → GuardDuty

---

**Task 1.3 — مناسب ڈیٹا سیکیورٹی کنٹرولز کا تعین کرنا**

بنیادی تصورات: at rest اور in transit encryption، KMS، Secrets Manager، Parameter Store، S3 server-side encryption۔

| باب        | موضوع                                                                     |
|------------|--------------------------------------------------------------------------|
| باب 16     | KMS: customer-managed keys، key rotation، envelope encryption             |
| باب 16     | Secrets Manager: خودکار credential rotation، runtime secret retrieval     |
| باب 16     | ACM (AWS Certificate Manager): ALB، CloudFront کے لیے SSL/TLS certificates |
| باب 5      | S3 encryption اختیارات: SSE-S3، SSE-KMS، SSE-C                            |
| باب 8      | RDS at rest encryption (تخلیق کے وقت فعال کرنا ضروری)                      |

اہم امتحانی patterns:

- "ڈیٹابیس credentials کو خودکار طور پر rotate کرنا" → RDS انضمام کے ساتھ Secrets Manager
- "کنٹرول کرنا کہ accounts میں کون encryption keys استعمال کر سکتا ہے" → KMS key policy
- "غیر خفیہ configuration اقدار محفوظ کرنا" → SSM Parameter Store (Secrets Manager نہیں)
- "کمپنی کے زیر انتظام keys کے ساتھ S3 objects encrypt کرنا" → CMK کے ساتھ SSE-KMS

---

## ڈومین 2: مضبوط فن تعمیر ڈیزائن کرنا (26%)

**Task 2.1 — قابل اسکیل اور ڈھیلے سے منسلک فن تعمیر ڈیزائن کرنا**

بنیادی تصورات: Auto Scaling، load balancers، SQS/SNS decoupling، Lambda event triggers، ECS/EKS، Step Functions۔

| باب        | موضوع                                                             |
|------------|------------------------------------------------------------------|
| باب 7      | Auto Scaling Groups، Application Load Balancer، scaling policies   |
| باب 19     | SQS (queues کے ساتھ decoupling)، SNS (fan-out notifications)       |
| باب 20     | Lambda: serverless کمپیوٹ، event triggers، concurrency             |
| باب 20     | API Gateway: منظم REST/HTTP/WebSocket APIs، اکیلے یا + Lambda      |
| باب 21     | ECS اور EKS: containerized microservices                          |
| باب 22     | Step Functions: workflow orchestration                            |
| باب 26     | Kinesis: حقیقی وقت کی ڈیٹا streaming                              |

اہم امتحانی patterns:

- "آرڈر پروسیسنگ کو inventory update سے decouple کرنا" → خدمات کے درمیان SQS queue
- "نیا آرڈر دینے پر متعدد خدمات کو مطلع کرنا" → SQS subscriptions کے ساتھ SNS topic (fan-out)
- "S3 اپلوڈز کو خودکار طور پر پروسیس کرنا" → S3 event notification → Lambda
- "retry logic کے ساتھ کثیر مرحلہ workflow چلانا" → Step Functions

---

**Task 2.2 — اعلیٰ دستیاب اور/یا fault-tolerant فن تعمیر ڈیزائن کرنا**

بنیادی تصورات: Multi-AZ، Multi-Region، Route 53 failover، RDS read replicas، Aurora Global Database، backup and restore۔

| باب        | موضوع                                                                                       |
|------------|----------------------------------------------------------------------------------------------|
| باب 2      | AWS عالمی بنیادی ڈھانچہ: Regions، AZs، edge locations                                         |
| باب 7      | متعدد AZs میں ALB، ASG غیر صحت مند instances کی جگہ لیتا ہے                                    |
| باب 8      | RDS Multi-AZ: synchronous replication، خودکار failover                                        |
| باب 12     | Route 53: failover routing، latency routing، health checks                                    |
| باب 18     | Multi-AZ بمقابلہ Multi-Region: RTO/RPO، DR حکمت عملیاں (pilot light، warm standby، active-active) |
| باب 18     | AWS Backup (مرکزی، cross-account backups)، Elastic Disaster Recovery (منظم pilot light)        |
| باب 24     | Aurora Global Database: cross-region read replicas، < 1s replication lag                      |

اہم امتحانی patterns:

- "اگر primary RDS ناکام ہو تو خودکار failover" → RDS Multi-AZ (Read Replica نہیں)
- "عالمی سطح پر کم latency کے ساتھ reads پیش کرنا" → Aurora Global Database
- "اگر primary region دستیاب نہ ہو تو ٹریفک کو secondary region تک روٹ کرنا" → Failover routing + health checks کے ساتھ Route 53
- "RTO 1 منٹ، RPO 0" → Multi-AZ deployment (Multi-Region نہیں)
- "RTO 15 منٹ، cross-region" → Pilot Light حکمت عملی

---

## ڈومین 3: اعلیٰ کارکردگی والے فن تعمیر ڈیزائن کرنا (24%)

**Task 3.1 — اعلیٰ کارکردگی والے اور/یا قابل اسکیل اسٹوریج حل کا تعین کرنا**

بنیادی تصورات: S3 بمقابلہ EBS بمقابلہ EFS، storage class کا انتخاب، S3 Transfer Acceleration، multipart upload، assets کے لیے CloudFront۔

| باب        | موضوع                                                                    |
|------------|-------------------------------------------------------------------------|
| باب 5      | S3: object storage، storage classes، versioning، lifecycle              |
| باب 6      | EBS: block storage اقسام (gp3، io2، st1)، EFS: مشترکہ فائل storage       |
| باب 6      | Storage Gateway: ہائبرڈ on-premises تا S3 پل (File، Volume، Tape)        |
| باب 23     | S3 storage class منتقلیاں، Glacier بازیافت اختیارات                      |
| باب 25     | DataSync (آن لائن فائل sync)، Transfer Family (منظم SFTP→S3)، Snow Family (آف لائن بلک منتقلی — قدیم: نومبر 2025 میں نئے گاہکوں کے لیے بند؛ AWS اب DataSync اور Data Transfer Terminals کی طرف اشارہ کرتا ہے)، MGN (سرور rehost) |
| باب 28     | EBS right-sizing، gp2→gp3 منتقلی، snapshot انتظام                       |

اہم امتحانی patterns:

- "متعدد EC2 instances سے قابل رسائی مشترکہ فائل سسٹم" → EFS (EBS نہیں؛ EBS ایک instance سے منسلک ہوتا ہے)
- "ڈیٹابیس workload کے لیے اعلیٰ IOPS" → io2 EBS
- "90 دن میں رسائی نہ ہونے والی فائلوں کی لاگت کم کرنا" → S3 lifecycle policy → Glacier
- "دور دراز مقامات سے بڑی فائلوں کو تیزی سے اپلوڈ کرنا" → S3 Transfer Acceleration
- "محدود bandwidth پر منتقلی کے کئی ہفتے" → SAA-C03 امتحان اب بھی Snowball کو متوقع رکھتا ہے، Snow Family کے 2025 میں نئے گاہکوں کے لیے بند ہونے کے باوجود

---

**Task 3.2 — اعلیٰ کارکردگی والے اور/یا قابل اسکیل کمپیوٹ حل کا تعین کرنا**

بنیادی تصورات: EC2 instance خاندان، Graviton processors، Auto Scaling، Lambda، Fargate، Spot Instances۔

| باب        | موضوع                                                                                  |
|------------|-----------------------------------------------------------------------------------------|
| باب 4      | EC2 instance اقسام: compute-optimized (c)، memory-optimized (r)، عام مقصد (m، t)        |
| باب 7      | Auto Scaling: ویب tiers کے لیے افقی اسکیلنگ                                              |
| باب 20     | Lambda: concurrency، provisioned concurrency (مستقل latency کے لیے)                      |
| باب 21     | ECS Fargate: serverless containers                                                      |
| باب 21     | AWS Batch: Docker containers کے لیے منظم batch کمپیوٹ، Spot-backed                       |
| باب 27     | Fault-tolerant batch workloads کے لیے Spot Instances                                     |

اہم امتحانی patterns:

- "ML training workload، لاگت کم کریں، تعطل ہو سکتا ہے" → Spot Instances
- "مستقل ذیلی 100ms Lambda جواب" → Provisioned concurrency (cold start ختم کرتا ہے)
- "Containerized microservice، کوئی بنیادی ڈھانچہ انتظام نہیں" → ECS Fargate

---

**Task 3.3 — اعلیٰ کارکردگی والے ڈیٹابیس حل کا تعین کرنا**

بنیادی تصورات: RDS بمقابلہ DynamoDB بمقابلہ Aurora بمقابلہ Redshift بمقابلہ ElastiCache، access patterns، read replicas، DAX۔

| باب        | موضوع                                                             |
|------------|------------------------------------------------------------------|
| باب 8      | RDS: منظم relational ڈیٹابیسز، RDBMS کب استعمال کریں              |
| باب 9      | DynamoDB: NoSQL، partition keys، GSI، DAX (in-memory cache)       |
| باب 10     | ElastiCache: Redis بمقابلہ Memcached، cache حکمت عملیاں           |
| باب 10     | MemoryDB for Redis: پائیدار Redis مطابق primary ڈیٹابیس           |
| باب 24     | Aurora: کارکردگی، Serverless v2، read replicas، Global Database   |
| باب 29     | DynamoDB on-demand بمقابلہ provisioned capacity، Auto Scaling کے ساتھ |

اہم امتحانی patterns:

- "session store کے لیے مائیکرو سیکنڈ reads" → ElastiCache Redis یا DAX (اگر DynamoDB backend)
- "لچکدار schema کے ساتھ اعلیٰ throughput والی key-value رسائی" → DynamoDB
- "پیچیدہ joins اور ACID transactions" → Aurora یا RDS
- "پیٹا بائٹس structured ڈیٹا پر تجزیات" → Redshift (تفصیل سے شامل نہیں لیکن اشارہ: "data warehouse" → Redshift)

---

**Task 3.4 — اعلیٰ کارکردگی والے اور/یا قابل اسکیل نیٹ ورک فن تعمیر کا تعین کرنا**

بنیادی تصورات: CloudFront، Global Accelerator، Direct Connect، VPN، placement groups، enhanced networking۔

| باب        | موضوع                                                             |
|------------|------------------------------------------------------------------|
| باب 7      | NLB (Layer 4) اور GWLB (نیٹ ورک appliances کے لیے Gateway Load Balancer) |
| باب 11     | Client VPN: انفرادی آلے سے VPC encrypted رسائی                    |
| باب 12     | Route 53: routing policies: latency-based، geolocation، weighted   |
| باب 13     | CloudFront: CDN، edge caching، Lambda@Edge                        |
| باب 25     | AWS Global Accelerator: AWS backbone پر Anycast routing           |
| باب 25     | Direct Connect: وقف شدہ private رابطہ                             |
| باب 30     | VPC Endpoints: AWS خدمات تک private رابطہ                         |

اہم امتحانی patterns:

- "dynamic API responses تک رسائی کرنے والے عالمی صارفین کے لیے latency کم کرنا" → Global Accelerator (CloudFront نہیں، جو cacheable مواد کے لیے بہترین ہے)
- "عالمی سطح پر static assets کے لیے latency کم کرنا" → CloudFront
- "on-premises سے AWS تک مستقل private رابطہ" → Direct Connect
- "دنیا بھر کے گاہکوں سے آپ کے S3 bucket تک تیز اپلوڈ" → S3 Transfer Acceleration

---

**Task 3.5 — اعلیٰ کارکردگی والے ڈیٹا ingestion اور transformation حل کا تعین کرنا**

بنیادی تصورات: Kinesis Data Streams، Amazon Data Firehose، Glue، Athena، EMR۔

| باب        | موضوع                                                               |
|------------|---------------------------------------------------------------------|
| باب 26     | Kinesis Data Streams: حقیقی وقت کی مرتب event پروسیسنگ              |
| باب 26     | Amazon Data Firehose (سابقہ Kinesis Data Firehose): S3، Redshift، OpenSearch تک منظم delivery |
| باب 26     | AWS Glue: serverless ETL، Data Catalog، Crawlers                    |
| باب 26     | Athena: S3 پر serverless SQL                                        |
| باب 26     | QuickSight: منظم BI dashboards، SPICE in-memory engine             |
| باب 26     | Lake Formation: باریک data lake رسائی کنٹرول                       |

اہم امتحانی patterns:

- "حقیقی وقت میں click-stream ڈیٹا پروسیس کرنا" → Kinesis Data Streams + Lambda یا Managed Service for Apache Flink (سابقہ Kinesis Data Analytics)
- "بعد میں تجزیے کے لیے streaming ڈیٹا S3 تک پہنچانا" → Amazon Data Firehose
- "متعدد ذرائع سے ڈیٹا تبدیل اور catalog کرنا" → AWS Glue
- "S3 میں محفوظ تاریخی ڈیٹا کو SQL سے query کرنا" → Athena

---

## ڈومین 4: لاگت کے لحاظ سے بہتر فن تعمیر ڈیزائن کرنا (20%)

**Task 4.1 — لاگت کے لحاظ سے بہتر اسٹوریج حل ڈیزائن کرنا**

| باب        | موضوع                                                             |
|------------|------------------------------------------------------------------|
| باب 23     | S3 lifecycle policies، storage class منتقلیاں                     |
| باب 28     | EBS right-sizing، gp2→gp3 منتقلی، S3 versioning lifecycle rules    |
| باب 28     | EFS Intelligent-Tiering، cost allocation tags، AWS Budgets        |

اہم امتحانی patterns:

- "کون سی ٹیم سب سے زیادہ S3 لاگت پیدا کر رہی ہے کی شناخت" → Cost allocation tags + Cost Explorer
- "کم استعمال ہونے والے objects کی لاگت خودکار طور پر کم کرنا" → S3 Intelligent-Tiering
- "جب ماہانہ لاگت $10,000 سے تجاوز کرے تو alert" → AWS Budgets

---

**Task 4.2 — لاگت کے لحاظ سے بہتر کمپیوٹ حل ڈیزائن کرنا**

| باب        | موضوع                                                                            |
|------------|----------------------------------------------------------------------------------|
| باب 2      | Outposts: on-premises AWS rack (capital لاگت بمقابلہ cloud opex سمجھوتہ)          |
| باب 2      | Wavelength: 5G edge کمپیوٹ (ٹیلی کام شراکت، latency پر مبنی تعیناتی)              |
| باب 27     | EC2 قیمتیں: On-Demand، Reserved Instances، Savings Plans، Spot، Dedicated Hosts   |
| باب 20     | Lambda: فی invocation ادائیگی (صفر idle لاگت)                                    |

اہم امتحانی patterns:

- "مستقل پیداواری workloads کی لاگت کم کرنا" → Savings Plans (زیادہ لچکدار) یا Reserved Instances
- "قابل تعطل batch jobs کی لاگت کم کرنا" → Spot Instances
- "صفر idle لاگت کے ساتھ event-driven پروسیسنگ" → Lambda

---

**Task 4.3 — لاگت کے لحاظ سے بہتر ڈیٹابیس حل ڈیزائن کرنا**

| باب        | موضوع                                             |
|------------|---------------------------------------------------|
| باب 29     | DynamoDB on-demand بمقابلہ provisioned + Auto Scaling |
| باب 29     | RDS اور ElastiCache Reserved Instances/Nodes      |
| باب 29     | RDS snapshot انتظام                               |

اہم امتحانی patterns:

- "غیر متوقع DynamoDB ٹریفک" → On-demand capacity mode
- "معلوم peaks کے ساتھ مستقل DynamoDB ٹریفک" → Provisioned + Auto Scaling
- "مستحکم workload کے لیے RDS لاگت کم کرنا" → Reserved Instances (1 یا 3 سال)

---

**Task 4.4 — لاگت کے لحاظ سے بہتر نیٹ ورک فن تعمیر ڈیزائن کرنا**

| باب        | موضوع                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| باب 30     | Data transfer قیمتیں: inbound (مفت)، cross-AZ ($0.01/GB)، cross-region، انٹرنیٹ ($0.09/GB)     |
| باب 30     | NAT Gateway ($0.045/GB) بمقابلہ VPC Endpoints (Gateway: مفت؛ Interface: قیمت والا)             |
| باب 30     | CloudFront بطور data transfer لاگت optimizer                                                   |

اہم امتحانی patterns:

- "private subnet میں EC2 S3 کو کال کرتا ہے — NAT Gateway لاگت ختم کریں" → S3 Gateway Endpoint (مفت)
- "private subnet میں EC2 SQS کو کال کرتا ہے — NAT Gateway لاگت کم کریں" → SQS Interface Endpoint
- "عالمی مواد delivery کی data transfer لاگت کم کریں" → CloudFront (caching origin درخواستیں کم کرتی ہے)

---

## بین الڈومین موضوعات

کچھ موضوعات متعدد ڈومینز میں ظاہر ہوتے ہیں:

| موضوع                              | ڈومینز  | ابواب         |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | تمام    | 31           |
| فن تعمیر کے جائزے اور ADRs          | تمام    | 32           |
| Trade-off استدلال ("یہ منحصر ہے")  | تمام    | 33           |
| Multi-AZ ڈیزائن                    | 2، 3    | 7، 8، 18، 24 |
| نگرانی اور مشاہدہ پذیری            | 1، 2    | پوری کتاب میں |
| CloudFront                         | 3، 4    | 13، 30       |

---

## امتحان سے پہلے کی چیک لسٹ

SAA-C03 میں بیٹھنے سے پہلے:

**زیادہ وزن والے شعبے (ظاہر ہونے کا سب سے زیادہ امکان)**

- [ ] IAM policy evaluation منطق (explicit deny → explicit allow → implicit deny)
- [ ] VPC اجزاء: subnets، route tables، IGW، NAT Gateway، security groups، NACLs
- [ ] S3 storage classes اور ہر ایک کب استعمال کریں
- [ ] RDS Multi-AZ بمقابلہ Read Replica (failover بمقابلہ read اسکیلنگ)
- [ ] SQS بمقابلہ SNS بمقابلہ EventBridge (pull بمقابلہ push بمقابلہ event routing)
- [ ] EC2 قیمتوں کے ماڈلز: fault-tolerant کے لیے Spot، عہد شدہ workloads کے لیے Savings Plans
- [ ] Lambda triggers اور concurrency
- [ ] DynamoDB بمقابلہ Aurora بمقابلہ Redshift (access pattern انتخاب طے کرتا ہے)
- [ ] CloudFront: static کے لیے CDN، dynamic کے لیے Global Accelerator

**عام پھندے**

- [ ] EBS ایک instance سے منسلک ہوتا ہے؛ EFS مشترکہ ہوتا ہے
- [ ] RDS Read Replicas read اسکیلنگ کے لیے ہیں، خودکار failover کے لیے نہیں (وہ Multi-AZ ہے)
- [ ] NACLs stateless ہیں (inbound اور outbound دونوں rules درکار)
- [ ] Gateway Endpoints مفت ہیں اور صرف S3 اور DynamoDB کے لیے
- [ ] Kinesis برقرار رکھتا اور replay کرتا ہے؛ SQS استعمال پر حذف کر دیتا ہے
- [ ] "Decouple" کا مطلب ہمیشہ SQS نہیں — SNS fan-out اور EventBridge بھی decoupling patterns ہیں
- [ ] Shield Standard مفت اور خودکار ہے؛ Advanced ایک ادا شدہ subscription ہے
- [ ] ElastiCache بمقابلہ MemoryDB: ElastiCache = cache (ڈیٹا کا نقصان ٹھیک ہے)۔ MemoryDB = پائیدار primary ڈیٹابیس۔
- [ ] Client VPN بمقابلہ Site-to-Site VPN: Client VPN = انفرادی آلات۔ Site-to-Site = نیٹ ورک سے نیٹ ورک۔
- [ ] Outposts بمقابلہ Wavelength: Outposts = on-premises AWS rack۔ Wavelength = 5G edge۔
- [ ] DMS: homogeneous = براہِ راست DMS۔ Heterogeneous = پہلے SCT، پھر DMS۔
- [ ] DataSync *فائلیں* منتقل کرتا ہے؛ DMS *ڈیٹابیسز* منتقل کرتا ہے؛ MGN *پورے سرورز* منتقل کرتا ہے۔

**امتحان کی ساخت**

- 65 سوالات، 130 منٹ (2 گھنٹے 10 منٹ)
- Multiple choice (ایک درست) اور multiple response (N درست منتخب کریں)
- پاس کرنے کا اسکور: 1000 میں سے 720
- بغیر اسکور والے سوالات شامل ہوتے ہیں؛ آپ نہیں بتا سکتے کہ کون سے ہیں
- وقت کا انتظام کریں: ~2 منٹ فی سوال؛ مشکل سوالات کو نشان زد کریں اور واپس آئیں
