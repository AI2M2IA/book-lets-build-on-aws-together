# ضمیمہ A: AWS خدمات کا فوری حوالہ

اس کتاب میں شامل ہر خدمت، اُسی ترتیب میں جس میں اسے متعارف کرایا گیا۔ اسے مطالعے کے حوالے اور امتحان کی تیاری کے دوران فوری تلاش کے لیے استعمال کریں۔

---

## کمپیوٹ (Compute)

**EC2 — Elastic Compute Cloud** *(باب 4)*

کلاؤڈ میں ورچوئل مشینیں۔ آپ instance type (CPU، میموری، اسٹوریج)، آپریٹنگ سسٹم، اور Region منتخب کرتے ہیں۔ آپ فی گھنٹہ (On-Demand)، فی عہد (Reserved Instances / Savings Plans)، یا فی فاضل گنجائش کے خانے (Spot) ادائیگی کرتے ہیں۔ یہ بنیادی کمپیوٹ اکائی ہے۔

اہم تصورات: AMI (Amazon Machine Image)، instance types (t3، m6g، r6g، c6g خاندان)، key pairs، instance profiles، placement groups۔

امتحانی اشارہ: جب کوئی منظر نامہ مستقل، حالت محفوظ رکھنے والا، یا طویل المدت کمپیوٹ مانگے — EC2 یا ECS۔ جب کوئی منظر نامہ مختصر مدتی، واقعے سے متحرک ہونے والا، یا صفر idle لاگت والا کمپیوٹ مانگے — Lambda۔

---

**Auto Scaling + Application Load Balancer** *(باب 7)*

Auto Scaling Groups (ASGs) لوڈ کی بنیاد پر EC2 instances شامل اور ہٹاتے ہیں۔ Application Load Balancers (ALBs) ٹریفک کو instances میں تقسیم کرتے ہیں اور path یا host کے مطابق روٹ کرتے ہیں۔ مل کر یہ افقی اسکیلنگ کی پرت تشکیل دیتے ہیں۔

اہم تصورات: Launch template، scaling policies (target tracking، step، scheduled)، health checks، ALB target groups، listener rules، weighted routing۔

امتحانی اشارہ: "متغیر لوڈ سنبھالنا" یا "AZs میں high availability" → ASG + ALB۔

---

**Lambda** *(باب 20)*

Serverless functions۔ آپ کوڈ لکھتے ہیں؛ AWS اسے واقعات کے جواب میں چلاتا ہے۔ کوئی سرور سنبھالنے کی ضرورت نہیں۔ آپ فی invocation اور execution کی فی ملی سیکنڈ ادائیگی کرتے ہیں۔ خودکار طور پر ہزاروں ہم وقت executions تک اسکیل ہوتا ہے۔

اہم تصورات: Event sources (API Gateway، S3، SQS، EventBridge، Kinesis)، execution role، concurrency limits، reserved اور provisioned concurrency، cold start، Layers، 15 منٹ زیادہ سے زیادہ دورانیہ۔

امتحانی اشارہ: "Serverless،" "event-driven،" "مختصر مدتی کام،" "کوئی idle لاگت نہیں" → Lambda۔

---

**ECS — Elastic Container Service** *(باب 21)*

AWS پر Docker containers چلاتا ہے۔ دو launch types: EC2 (آپ host سنبھالتے ہیں) اور Fargate (AWS host سنبھالتا ہے)۔ ECS task definitions، services، cluster scheduling، اور load balancers اور service discovery کے ساتھ انضمام سنبھالتا ہے۔

اہم تصورات: Task definition، ECS service، Fargate بمقابلہ EC2 launch type، ECR (container registry)، task IAM role، service auto scaling۔

امتحانی اشارہ: "Containerized workloads،" "microservices،" "AWS پر Docker" → ECS (serverless containers کے لیے عموماً Fargate)۔

---

**EKS — Elastic Kubernetes Service** *(باب 21)*

منظم Kubernetes۔ AWS control plane چلاتا ہے؛ آپ worker nodes (EC2 یا Fargate) چلاتے ہیں۔ EKS اُس وقت استعمال کریں جب آپ کی ٹیم پہلے سے Kubernetes استعمال کر رہی ہو یا ایسے workloads ہوں جنہیں Kubernetes کی مخصوص خصوصیات درکار ہوں۔

امتحانی اشارہ: "Kubernetes،" "موجودہ K8s workloads منتقل کرنے کی ضرورت" → EKS۔ "K8s کے اضافی بوجھ کے بغیر صرف containers چاہئیں" → ECS۔

---

**AWS Batch** *(باب 21)*

Docker containers کے لیے منظم batch کمپیوٹ۔ آپ ایک job (Docker image + command)، ایک job queue، اور ایک compute environment (EC2 یا Fargate) متعین کرتے ہیں۔ AWS Batch کمپیوٹ خودکار طور پر فراہم اور اسکیل کرتا ہے، پھر job مکمل ہونے پر اسے ختم کر دیتا ہے۔ لاگت کم کرنے کے لیے Spot Instances کی حمایت کرتا ہے۔

اہم تصورات: Job definition (کیا چلانا ہے)، job queue (jobs کہاں انتظار کرتے ہیں)، compute environment (EC2 یا Fargate، On-Demand یا Spot)، array jobs (ایک ہی job کی کئی متوازی نقلیں چلانا)۔

امتحانی اشارہ: "Batch پروسیسنگ جو Lambda کے 15 منٹ ٹائم آؤٹ سے تجاوز کرے،" "containers پر محدود کمپیوٹ jobs،" "AWS پر HPC workloads" → AWS Batch۔

---

**AWS Outposts** *(باب 2)*

AWS ہارڈویئر کا ایک مکمل منظم rack جو آپ کے اپنے ڈیٹا سینٹر یا co-location سہولت میں نصب ہوتا ہے۔ پبلک کلاؤڈ جیسی ہی AWS خدمات، APIs، اور اوزار (EC2، EBS، RDS، EKS، Outposts پر S3) چلاتا ہے، لیکن جسمانی طور پر on-premises۔

اہم تصورات: on-premises پر وہی AWS APIs، AWS تنصیب اور patching سنبھالتا ہے، گاہک rack کی جگہ اور بجلی فراہم کرتا ہے، Local Gateway (LGW) Outposts کو on-premises نیٹ ورکس سے جوڑتا ہے۔

امتحانی اشارہ: "اپنے ڈیٹا سینٹر میں AWS چلانا،" "ڈیٹا residency کے لیے کمپیوٹ کا on-premises رہنا ضروری،" "انٹرنیٹ پر انحصار کے بغیر AWS APIs" → Outposts۔

---

**AWS Wavelength** *(باب 2)*

AWS کا بنیادی ڈھانچہ جو 5G ٹیلی کمیونیکیشن فراہم کنندگان کے نیٹ ورکس کے اندر تعینات ہوتا ہے۔ Wavelength Zones 5G نیٹ ورک کے کنارے پر واقع ہوتے ہیں، جو موبائل آلات تک سنگل ڈیجٹ ملی سیکنڈ latency فراہم کرتے ہیں۔

اہم تصورات: Wavelength Zones ٹیلی کام نیٹ ورکس کے اندر AWS Regions کی توسیعات ہیں، آلے اور Wavelength Zone کے درمیان ٹریفک carrier نیٹ ورک پر رہتی ہے۔

امتحانی اشارہ: "5G موبائل صارفین تک سنگل ڈیجٹ ملی سیکنڈ latency،" "موبائل AR/VR،" "موبائل پر حقیقی وقت کی گیمنگ،" "خود مختار گاڑیوں کی telemetry" → Wavelength۔

---

**AWS Application Migration Service (MGN)** *(باب 25)*

Rehost (lift-and-shift) منتقلی کی خدمت۔ ایک agent ماخذ سرورز کی ڈسکوں کو بلاک در بلاک AWS میں کم لاگت والے staging علاقے میں نقل کرتا ہے؛ آپ مانگ پر آزمائشی نقلیں شروع کرتے ہیں؛ cutover کے وقت، MGN نقل شدہ سرورز کو native EC2 instances میں تبدیل کر دیتا ہے۔ کسی ایپلیکیشن تبدیلی کی ضرورت نہیں۔

اہم تصورات: بلاک سطح کی مسلسل نقل، staging علاقہ، cutover سے پہلے آزمائشی launches، "7 Rs" منتقلی حکمت عملیاں (MGN = rehost)۔

امتحانی اشارہ: "کوڈ تبدیلیوں کے بغیر سینکڑوں VMs کو تیزی سے منتقل کرنا،" "سرورز کو EC2 پر lift-and-shift کرنا" → MGN۔ DataSync *فائلیں* منتقل کرتا ہے؛ DMS *ڈیٹابیسز* منتقل کرتا ہے؛ MGN *پورے سرورز* منتقل کرتا ہے۔

---

## اسٹوریج (Storage)

**S3 — Simple Storage Service** *(باب 5)*

Object storage۔ لامحدود گنجائش، 99.999999999% (گیارہ نائنز) durability۔ فائلوں کو buckets میں objects کے طور پر محفوظ کرتا ہے۔ Buckets ایک Region میں رہتے ہیں۔ Objects کا حجم 0 bytes سے 5TB تک ہو سکتا ہے۔

اہم تصورات: Bucket policy، object ACL، versioning، static website hosting، presigned URLs، multipart upload، Transfer Acceleration، storage classes (Standard، Intelligent-Tiering، Standard-IA، One Zone-IA، Glacier Instant Retrieval، Glacier Flexible Retrieval، Glacier Deep Archive، اور سنگل AZ، latency کے لحاظ سے نازک directory-bucket workloads کے لیے S3 Express One Zone)۔

امتحانی اشارہ: "فائلیں محفوظ اور حاصل کرنا،" "static assets،" "backups،" "data lake" → S3۔ درست storage class رسائی کی تعدد اور بازیافت کی رفتار پر منحصر ہے۔

---

**EBS — Elastic Block Store** *(باب 6)*

Block storage جو ایک واحد EC2 instance سے منسلک ہوتا ہے۔ ہارڈ ڈرائیو کی طرح کام کرتا ہے۔ instance کے lifecycle سے آزادانہ طور پر برقرار رہتا ہے (آپ اسے الگ کر کے دوبارہ منسلک کر سکتے ہیں)۔ سب سے عام اقسام: gp3 (عام مقصد SSD، default)، io2 (ڈیٹابیسز کے لیے provisioned IOPS)، st1 (ترتیب وار reads کے لیے throughput-optimized HDD)۔

اہم تصورات: Snapshots (اضافی، S3 میں محفوظ)، encryption (KMS)، Multi-Attach (صرف io1/io2)، IOPS اور throughput provisioning۔

امتحانی اشارہ: "EC2 کے لیے مستقل اسٹوریج،" "ڈیٹابیس اسٹوریج،" "کم latency والی block رسائی درکار" → EBS۔

---

**EFS — Elastic File System** *(باب 6)*

مشترکہ فائل سسٹم، جو بیک وقت متعدد EC2 instances سے قابل رسائی ہے۔ NFS protocol۔ خودکار طور پر اسکیل ہوتا ہے۔ فی GB EBS سے زیادہ مہنگا۔ Storage classes میں Standard، Infrequent Access، اور Archive شامل ہیں۔ Intelligent-Tiering فائلوں کو خودکار طور پر منتقل کرتا ہے۔

امتحانی اشارہ: "مشترکہ فائل سسٹم،" "متعدد EC2 instances کو وہی فائلیں درکار،" "NFS" → EFS۔

---

**FSx خاندان** *(باب 6)*

نامزد ٹیکنالوجیز کے لیے منظم فائل سرورز۔ FSx for Windows File Server: SMB protocol، NTFS، Active Directory انضمام، Multi-AZ۔ FSx for Lustre: HPC/ML کے لیے متوازی اعلیٰ کارکردگی والا فائل سسٹم، S3 objects کو فائلوں کے طور پر پیش کرتا ہے (lazy loading)۔ FSx for NetApp ONTAP: multi-protocol (NFS + SMB + iSCSI)، snapshots، SnapMirror replication۔ FSx for OpenZFS: کم latency والا NFS، فوری snapshots اور قابل تحریر clones۔

امتحانی اشارہ: "SMB/Active Directory" → FSx for Windows۔ "S3 ڈیٹا پر HPC/ML training" → FSx for Lustre۔ "ایک ہی ڈیٹا تک NFS اور SMB / NetApp منتقلی" → FSx for ONTAP۔ "ZFS منتقلی / فوری clones" → FSx for OpenZFS۔

---

**S3 Storage Classes اور Lifecycle Policies** *(باب 23)*

S3 Intelligent-Tiering objects کو رسائی کی تعدد کی بنیاد پر access tiers کے درمیان خودکار طور پر منتقل کرتا ہے۔ Lifecycle policies عمر کے قواعد کی بنیاد پر objects کو classes (Standard → Standard-IA → Glacier) کے درمیان منتقل کرتی ہیں۔ Glacier storage classes میں بازیافت کی تاخیر ملی سیکنڈز (Glacier Instant Retrieval) سے 12 گھنٹوں (Glacier Deep Archive) تک ہوتی ہے۔

امتحانی اشارہ: "کم استعمال ہونے والے ڈیٹا کے لیے اسٹوریج لاگت کم کرنا" → lifecycle policies، Intelligent-Tiering، یا Glacier۔

---

**AWS Storage Gateway** *(باب 6)*

ہائبرڈ اسٹوریج خدمت جو on-premises ماحول کو AWS اسٹوریج سے جوڑتی ہے۔ اسٹوریج کو اُن protocols پر پیش کرتی ہے جنہیں ایپلیکیشنز پہلے سے سمجھتی ہیں، جبکہ ڈیٹا کو S3، S3 Glacier، یا EBS snapshots کے طور پر برقرار رکھتی ہے۔

اہم تصورات: File Gateway (NFS/SMB → S3)، Volume Gateway (iSCSI، cached یا stored mode)، Tape Gateway (ورچوئل ٹیپ لائبریری → Glacier)۔

امتحانی اشارہ: "on-premises ایپلیکیشن کو کوڈ تبدیلیوں کے بغیر کلاؤڈ اسٹوریج درکار" → Storage Gateway۔ "ٹیپ بیک اپ کی جگہ لینا" → Tape Gateway۔

---

**AWS DataSync** *(باب 25)*

Agent پر مبنی ڈیٹا منتقلی اور replication خدمت۔ ایک ہلکا agent NFS یا SMB پر on-premises فائل سرورز سے جڑتا ہے اور shares کو S3، EFS، یا FSx سے ہم وقت کرتا ہے — اس میں scheduling، bandwidth throttling، اور integrity verification بلٹ-ان ہیں۔

اہم تصورات: DataSync agent (on-premises یا EC2 پر VM)، NFS/SMB ماخذ، S3/EFS/FSx منزلیں، طے شدہ اضافی منتقلیاں۔

امتحانی اشارہ: "نیٹ ورک پر on-premises NAS سے AWS تک بڑی تعداد میں فائلوں کو منتقل یا مسلسل ہم وقت کرنا" → DataSync۔

---

**AWS Transfer Family** *(باب 25)*

مکمل منظم SFTP، FTPS، اور FTP سرور جس کے پیچھے اسٹوریج کی منزل کے طور پر S3 یا EFS ہوتا ہے۔ کلائنٹس اپنے موجودہ SFTP سافٹ ویئر سے جڑتے ہیں؛ اپلوڈ شدہ فائلیں براہِ راست کسی bucket یا فائل سسٹم میں پہنچتی ہیں۔

اہم تصورات: Managed endpoint (اختیاری طور پر static IP کے ساتھ)، S3 یا EFS backing storage، بیرونی شراکت داروں کے لیے موجودہ protocol سے مطابقت۔

امتحانی اشارہ: "شراکت داروں کو SFTP کے ذریعے اپلوڈ کرتے رہنا ہے، لیکن فائلیں S3 میں پہنچنی چاہئیں" → Transfer Family۔

---

**AWS Snow Family** *(باب 25)*

آف لائن، بلک ڈیٹا منتقلی کے لیے جسمانی ڈیٹا منتقلی آلات۔ Snowball Edge Storage Optimized: 80 TB قابل استعمال، مضبوط enclosure، آپ کے مقام تک بھیجا جاتا ہے؛ آپ مقامی طور پر ڈیٹا لوڈ کرتے ہیں اور اسے S3 میں شامل کرنے کے لیے واپس بھیجتے ہیں۔

اہم تصورات: پہلے منتقلی کا حساب کریں — اگر نیٹ ورک منتقلی میں تقریباً ایک ہفتہ یا اس سے زیادہ لگے، تو جسمانی آلہ جیتتا ہے۔ *قدیم نوٹ (2026)*: AWS اس خاندان کو ریٹائر کرتا رہا ہے — Snowmobile (2024) اور Snowcone (اواخر 2024) ختم ہو چکے ہیں، اور Snow آلات نومبر 2025 میں نئے گاہکوں کے لیے بند ہو گئے (AWS اب DataSync اور Data Transfer Terminals کی طرف اشارہ کرتا ہے)۔ SAA-C03 سوال بینک اس سے پہلے کا ہے، اس لیے امتحان اب بھی Snowball کو جواب کے طور پر متوقع رکھتا ہے۔

امتحانی اشارہ: "پیٹا بائٹ پیمانے کی منتقلی،" "محدود bandwidth، منتقلی کے کئی ہفتے" → Snow Family۔

---

**AWS Backup** *(باب 18 اور 23)*

EBS، RDS، DynamoDB، EFS، اور Storage Gateway میں مرکزی، پالیسی پر مبنی بیک اپ خدمت۔ Backup plans schedules اور retention متعین کرتے ہیں؛ vaults recovery points محفوظ کرتے ہیں۔

اہم تصورات: Backup plans اور vaults، cross-region اور cross-account نقلیں، عدم تغیر کے لیے Vault Lock۔

امتحانی اشارہ: "متعدد AWS خدمات میں بیک اپ کو مرکزی اور خودکار کرنا،" "ransomware/account-compromise تحفظ کے لیے cross-account بیک اپ نقلیں" → AWS Backup۔

---

## ڈیٹابیسز (Databases)

**RDS — Relational Database Service** *(باب 8)*

منظم relational ڈیٹابیسز۔ معاون engines: MySQL، PostgreSQL، MariaDB، Oracle، SQL Server، اور Aurora (AWS کا اپنا engine)۔ AWS backups، patching، failover، اور replication سنبھالتا ہے۔ آپ schema ڈیزائن، queries، اور instance sizing سنبھالتے ہیں۔

اہم تصورات: Multi-AZ deployment (خودکار failover، synchronous replication)، Read Replicas (asynchronous، read اسکیلنگ کے لیے)، automated backups (1-35 دن retention)، manual snapshots (حذف ہونے تک رکھے جاتے ہیں)، RDS Proxy (connection pooling)۔

امتحانی اشارہ: "Relational ڈیٹابیس،" "ACID transactions،" "موجودہ SQL workload" → RDS یا Aurora۔

---

**Aurora** *(باب 24)*

AWS کا relational ڈیٹابیس engine، MySQL اور PostgreSQL سے مطابقت رکھنے والا۔ تقسیم شدہ storage engine جو ڈیٹا کو 3 AZs میں 6 نقلوں میں replicate کرتا ہے۔ عام طور پر MySQL سے 5x تیز۔ Aurora Serverless v2 گنجائش کو خودکار طور پر اسکیل کرتا ہے (ACUs — Aurora Capacity Units میں ماپا جاتا ہے) اور، معاون engine ورژنز پر، جب کوئی connection کھلا نہ ہو تو 0 ACUs تک auto-pause ہو سکتا ہے۔

اہم تصورات: Aurora cluster (writer + ایک واحد reader endpoint کے پیچھے 15 تک Aurora Replicas)، Aurora Global Database (cross-region read replicas، < 1 سیکنڈ replication lag کے ساتھ)، Aurora Serverless v2، ACUs، auto-pause/resume رویہ۔

امتحانی اشارہ: "اعلیٰ کارکردگی والی relational ڈیٹابیس،" "MySQL/PostgreSQL مطابق،" "عالمی reads،" "متغیر workload" → Aurora۔

---

**DynamoDB** *(باب 9)*

مکمل منظم NoSQL ڈیٹابیس۔ Key-value اور document ماڈل۔ سنگل ڈیجٹ ملی سیکنڈ کارکردگی کے ساتھ کسی بھی throughput تک اسکیل ہوتا ہے۔ دو capacity modes: on-demand (فی درخواست ادائیگی) اور provisioned (فی capacity unit فی گھنٹہ ادائیگی، Auto Scaling کے ساتھ)۔

اہم تصورات: Partition key (لازمی)، sort key (اختیاری)، Global Secondary Index (GSI)، Local Secondary Index (LSI)، DynamoDB Streams (change data capture)، DynamoDB Accelerator (DAX) — in-memory cache، TTL (Time to Live)، transactions۔

امتحانی اشارہ: "اعلیٰ throughput والی key پر مبنی رسائی،" "لچکدار schema،" "serverless NoSQL" → DynamoDB۔

---

**ElastiCache** *(باب 10)*

منظم in-memory caching۔ دو engines: Redis (persistent، pub/sub، Lua scripting، ڈیٹا ڈھانچے) اور Memcached (خالص cache، آسان تر، multi-threaded)۔ ڈیٹابیس لوڈ کم کرنے اور کثرت سے پڑھے جانے والے ڈیٹا کو مائیکرو سیکنڈوں میں پیش کرنے کے لیے استعمال کریں۔

اہم تصورات: Cache-aside pattern، write-through pattern، eviction policies، TTL، cluster mode (Redis)، خودکار failover کے ساتھ Multi-AZ۔

امتحانی اشارہ: "ڈیٹابیس لوڈ کم کرنا،" "ذیلی ملی سیکنڈ read latency،" "session management،" "حقیقی وقت کا leaderboard" → ElastiCache Redis۔

---

**Amazon MemoryDB for Redis** *(باب 10)*

پائیدار، Redis سے مطابقت رکھنے والی، in-memory primary ڈیٹابیس۔ ElastiCache کے برعکس (جو ایک cache ہے جہاں ڈیٹا کا نقصان قابل قبول ہے)، MemoryDB ایک Multi-AZ transaction log محفوظ کرتا ہے اور durability کی ضمانت دیتا ہے۔ آپ MemoryDB کو اپنی primary ڈیٹابیس کے طور پر استعمال کر سکتے ہیں — نہ کہ صرف کسی دوسری ڈیٹابیس کے سامنے ایک cache۔

اہم تصورات: Redis API مطابقت، Multi-AZ transaction log (durability کی ضمانت)، in-memory کارکردگی، primary ڈیٹابیس (cache پرت نہیں)۔

امتحانی اشارہ: "Redis مطابق اور ڈیٹا کا نقصان ناقابل قبول،" "پائیدار in-memory ڈیٹابیس" → MemoryDB۔ "Redis بطور cache، ڈیٹا کا نقصان قابل قبول" → ElastiCache Redis۔

---

**خاص مقصد کی ڈیٹابیسز** *(باب 9، 10، اور 24)*

ڈیٹا کی شکل کو engine سے ملائیں۔ DocumentDB: MongoDB مطابق documents۔ Neptune: graph ڈیٹابیس (تعلقات، traversals — Gremlin/SPARQL)۔ Keyspaces: Cassandra مطابق wide-column۔ Timestream: time-series (موجودہ پیشکش: Timestream for InfluxDB)۔ MemoryDB: پائیدار Redis مطابق *primary* ڈیٹابیس (بمقابلہ ElastiCache = cache)۔ QLDB ("ناقابل تغیر cryptographic ledger") 2025 میں بند کر دیا گیا — اسے ایک قدیم distractor سمجھیں۔

امتحانی اشارہ: "سوشل گراف / سفارشات / fraud rings" → Neptune۔ "MongoDB" → DocumentDB۔ "Cassandra" → Keyspaces۔ "وقت کے ساتھ IoT telemetry" → Timestream۔

---

**AWS DMS — Database Migration Service** *(باب 8)*

ڈیٹابیسز کو کم سے کم downtime کے ساتھ AWS منتقل کرتا ہے۔ Full load (ابتدائی نقل) کے ساتھ CDC (Change Data Capture) کی حمایت کرتا ہے تاکہ منتقلی کے دوران ماخذ اور ہدف ہم وقت رہیں۔ ایک ہی engine قسم کے درمیان منتقلی کرتے وقت (MySQL → MySQL، PostgreSQL → PostgreSQL)، براہِ راست DMS استعمال کریں۔ مختلف engine اقسام کے درمیان منتقلی کرتے وقت (Oracle → Aurora PostgreSQL)، پہلے AWS Schema Conversion Tool (SCT) استعمال کریں schema تبدیل کرنے کے لیے، پھر ڈیٹا کے لیے DMS۔

اہم تصورات: Replication instance، ماخذ اور ہدف endpoints، full load + CDC، heterogeneous منتقلیوں کے لیے SCT (Schema Conversion Tool)۔

امتحانی اشارہ: "کم سے کم downtime کے ساتھ ڈیٹابیس منتقل کرنا" → DMS۔ "Oracle to Aurora" یا کوئی بھی heterogeneous منتقلی → SCT + DMS۔ "ایک ہی engine، ایک ہی قسم" → براہِ راست DMS۔

---

## نیٹ ورکنگ (Networking)

**VPC — Virtual Private Cloud** *(باب 11)*

AWS کے اندر ایک الگ تھلگ نیٹ ورک۔ ایک Region کے تمام AZs پر پھیلا ہوا۔ آپ IP ایڈریس کی جگہ (CIDR block) متعین کرتے ہیں، subnets (public یا private) بناتے ہیں، route tables ترتیب دیتے ہیں، اور security groups اور NACLs کے ذریعے رسائی کو قابو کرتے ہیں۔

اہم تصورات: Public subnet (Internet Gateway تک route)، private subnet (outbound کے لیے NAT Gateway تک route)، Internet Gateway (انٹرنیٹ تک inbound + outbound)، NAT Gateway (private instances کے لیے صرف outbound)، VPC Peering (دو VPCs کو جوڑنا)، VPC Endpoints (انٹرنیٹ کے بغیر AWS خدمات سے جڑنا)۔

امتحانی اشارہ: "AWS پر private نیٹ ورک،" "وسائل کو انٹرنیٹ سے الگ کرنا،" "نیٹ ورک ٹریفک قابو کرنا" → VPC۔

---

**Security Groups اور NACLs** *(باب 15)*

Security groups instance کی سطح پر stateful firewalls ہیں — صرف allow rules، واپسی ٹریفک خودکار ہوتی ہے۔ NACLs (Network Access Control Lists) subnet کی سطح پر stateless firewalls ہیں — inbound اور outbound دونوں rules درکار، rule نمبر کے مطابق ترتیب وار جانچے جاتے ہیں۔

امتحانی اشارہ: "subnet تک رسائی سے کسی مخصوص IP کو روکنا" → NACL۔ "کسی instance سے/تک ٹریفک قابو کرنا" → security group۔

---

**Route 53** *(باب 12)*

AWS کی DNS خدمت اور domain registrar۔ انٹرنیٹ ٹریفک کو AWS وسائل اور بیرونی endpoints تک روٹ کرتی ہے۔ Routing policies: Simple، Weighted، Latency-based، Failover، Geolocation، Geoproximity، Multivalue answer۔

اہم تصورات: Hosted zones (public اور private)، record types (A، AAAA، CNAME، Alias)، health checks، Traffic Flow (بصری policy editor — نوٹ کریں کہ geoproximity records پر براہِ راست routing policy کے طور پر بھی دستیاب ہے، ایک قابلِ ایڈجسٹ bias کے ساتھ، Traffic Flow کی ضرورت کے بغیر)۔

امتحانی اشارہ: "DNS routing،" "Regions کے درمیان failover،" "latency یا مقام کی بنیاد پر روٹ کرنا" → Route 53 مناسب routing policy کے ساتھ۔

---

**CloudFront** *(باب 13)*

Content Delivery Network (CDN)۔ مواد کو edge locations (دنیا بھر میں 750+ points of presence) پر cache کرتا ہے۔ آخری صارفین کے لیے latency کم کرتا ہے۔ caching کے ذریعے origin transfer لاگت کم کرتا ہے۔ S3، EC2، ALB، اور API Gateway کو origins کے طور پر مربوط کرتا ہے۔

اہم تصورات: Distribution، origins، behaviors (origins تک path پر مبنی routing)، TTL (cache control)، cache invalidation، signed URLs اور cookies (رسائی کنٹرول)، Lambda@Edge اور CloudFront Functions (edge پر کوڈ چلانا)، Origin Shield (origin لوڈ کم کرنا)۔

امتحانی اشارہ: "عالمی کم latency،" "static مواد cache کرنا،" "origin لوڈ کم کرنا،" "Shield کے ساتھ DDoS سے تحفظ" → CloudFront۔

---

**Direct Connect اور VPN** *(باب 25)*

AWS Direct Connect آپ کے on-premises ڈیٹا سینٹر سے AWS تک ایک وقف شدہ جسمانی نیٹ ورک کنکشن ہے۔ پبلک انٹرنیٹ کو نظرانداز کرتا ہے۔ زیادہ مستقل bandwidth اور latency۔ AWS Site-to-Site VPN پبلک انٹرنیٹ پر ایک encrypted tunnel ہے — قائم کرنا تیز تر، لاگت کم، لیکن کارکردگی متغیر۔

اہم تصورات: Virtual Interface (VIF)، Direct Connect Gateway (متعدد regions سے جڑنا)، Transit Gateway (hub-and-spoke نیٹ ورک topology)، VPN tunnel کی فالتو پن۔

امتحانی اشارہ: "AWS تک وقف شدہ private کنکشن" → Direct Connect۔ "Encrypted کنکشن، تیز تر setup" → VPN۔ "متعدد VPCs جوڑنا" → Transit Gateway۔

---

**VPC Endpoints** *(باب 30)*

Private وسائل کو پبلک انٹرنیٹ یا NAT Gateway کے استعمال کے بغیر AWS خدمات سے جوڑتے ہیں۔ Gateway Endpoints: مفت، صرف S3 اور DynamoDB کے لیے دستیاب۔ Interface Endpoints (PrivateLink): فی گھنٹہ + فی GB قیمت، زیادہ تر AWS خدمات کے لیے دستیاب۔

امتحانی اشارہ: "private subnet میں EC2 S3/DynamoDB کو کال کرتا ہے — NAT Gateway کی لاگت کم کریں" → Gateway Endpoint (مفت)۔ "private subnet سے SQS، SSM، Secrets Manager تک private کنکشن" → Interface Endpoint۔

---

**AWS Client VPN** *(باب 11)*

منظم OpenVPN endpoint جو انفرادی آلات (لیپ ٹاپ، ورک سٹیشن) کو انٹرنیٹ پر ایک VPC سے محفوظ طریقے سے جوڑنے دیتا ہے۔ Authentication کے اختیارات: Active Directory، کسی identity provider کے ساتھ SAML 2.0 federation، یا mutual TLS (certificate پر مبنی)۔ Split-tunnel (صرف VPC کی جانب جانے والی ٹریفک tunnel سے گزرتی ہے) اور full-tunnel (تمام ٹریفک AWS کے ذریعے روٹ ہوتی ہے) کی حمایت کرتا ہے۔

اہم تصورات: Client VPN endpoint، target network (VPC subnet association)، authorization rules، split-tunnel بمقابلہ full-tunnel۔

امتحانی اشارہ: "ریموٹ انجینئرز کو گھر سے کسی VPC تک محفوظ رسائی درکار،" "انفرادی آلے سے VPC رابطہ" → Client VPN۔ موازنہ: Site-to-Site VPN = نیٹ ورک سے نیٹ ورک۔ Client VPN = آلے سے نیٹ ورک۔

---

**Network Load Balancer (NLB) اور Gateway Load Balancer (GWLB)** *(باب 7)*

NLB Layer 4 (TCP/UDP/TLS) پر کام کرتا ہے: کوئی HTTP inspection نہیں، صرف انتہائی رفتار سے packet routing — لاکھوں درخواستیں فی سیکنڈ، فی AZ ایک static IP اور source IP کی حفاظت کے ساتھ۔ GWLB Layer 3 پر کام کرتا ہے اور صرف ایک مقصد کے لیے موجود ہے: تیسرے فریق کے ورچوئل نیٹ ورک آلات (firewalls، IDS/IPS، deep packet inspection) کو ٹریفک کے بہاؤ میں inline ڈالنا۔

اہم تصورات: NLB = Layer 4، static IPs، انتہائی کم latency، غیر HTTP protocols۔ GWLB = Layer 3، GENEVE encapsulation، ایک واحد داخلی نقطے کے پیچھے appliance fleets۔ ALB = Layer 7 (path/host routing)۔

امتحانی اشارہ: "لاکھوں TCP درخواستیں فی سیکنڈ،" "load balancer کے لیے static IP،" "source IP محفوظ رکھنا" → NLB۔ "ٹریفک کے راستے میں تیسرے فریق کے سیکیورٹی آلات ڈالنا" → GWLB۔

---

**AWS Global Accelerator** *(باب 25)*

صارف ٹریفک کو پبلک انٹرنیٹ عبور کرنے کے بجائے قریب ترین edge location پر AWS کی private عالمی backbone پر روٹ کرتا ہے۔ دو static Anycast IP ایڈریس فراہم کرتا ہے جو ایک یا زیادہ regions میں آپ کے ALBs، NLBs، یا EC2 instances کے سامنے ہوتے ہیں۔ *dynamic* (ناقابل cache) ٹریفک کے لیے latency اور مستقل مزاجی بہتر بناتا ہے۔

اہم تصورات: Static Anycast IPs، AWS backbone پر edge onboarding، سیکنڈوں میں health-check پر مبنی regional failover، traffic dials کے ساتھ endpoint groups۔

امتحانی اشارہ: "عالمی صارفین، dynamic/غیر HTTP ٹریفک، static IP، تیز regional failover" → Global Accelerator۔ "Cacheable/static مواد" → اس کے بجائے CloudFront۔

---

## سیکیورٹی اور شناخت (Security and Identity)

**IAM — Identity and Access Management** *(باب 3 اور 14)*

قابو کرتا ہے کہ آپ کے AWS اکاؤنٹ میں کون کیا کر سکتا ہے۔ Users (طویل المدت credentials)، Groups (permissions شیئر کرنے والے users)، Roles (خدمات اور cross-account رسائی کے لیے عارضی credentials)، Policies (allow/deny قواعد متعین کرنے والی JSON دستاویزات)۔

اہم تصورات: Principal، Action، Resource، Condition، explicit deny > explicit allow > implicit deny، SCP (AWS Organizations میں Service Control Policy)، Permission boundary، AssumeRole۔

امتحانی اشارہ: IAM ہر سیکیورٹی سوال میں شامل ہے۔ اہم pattern: خدمات IAM roles استعمال کرتی ہیں (نہ کہ users)۔ Cross-account رسائی role assumption استعمال کرتی ہے۔ Least privilege — صرف وہی دیں جو درکار ہو۔

---

**KMS — Key Management Service** *(باب 16)*

منظم encryption key خدمت۔ cryptographic keys بناتی، محفوظ کرتی، اور قابو کرتی ہے۔ Customer-managed keys (CMKs) آپ کو rotation، استعمال، اور رسائی پالیسیاں متعین کرنے دیتی ہیں۔ AWS-managed keys خودکار طور پر منظم ہوتی ہیں۔

اہم تصورات: Key policy (IAM policy سے الگ)، Envelope encryption (ڈیٹا کو data key سے encrypt کیا جاتا ہے؛ data key کو CMK سے encrypt کیا جاتا ہے)، خودکار key rotation، Multi-region keys، Grants۔

امتحانی اشارہ: "ڈیٹا کو at rest encrypt کرنا،" "customer-managed encryption keys،" "key rotation" → KMS۔

---

**Secrets Manager** *(باب 16)*

حساس اقدار کو محفوظ اور خودکار طور پر rotate کرتا ہے: ڈیٹابیس credentials، API keys، OAuth tokens۔ خودکار password rotation کے لیے RDS سے مربوط ہوتا ہے۔ ایپلیکیشنز runtime پر API کے ذریعے secrets حاصل کرتی ہیں — credentials کو کبھی hardcode نہ کریں۔

امتحانی اشارہ: "ڈیٹابیس credentials محفوظ اور rotate کرنا،" "hardcoded secrets سے بچنا" → Secrets Manager۔ "configuration اقدار محفوظ کرنا، secrets نہیں" → Parameter Store (SSM)۔

---

**AWS Shield** *(باب 17)*

DDoS تحفظ۔ Shield Standard خودکار اور مفت ہے — عام volumetric اور protocol حملوں سے بچاتا ہے۔ Shield Advanced مالی تحفظ، 24/7 DDoS response team، اور تفصیلی حملے کی نمائش شامل کرتا ہے۔

امتحانی اشارہ: "DDoS سے تحفظ" → Shield Standard (خودکار) یا Shield Advanced (انٹرپرائز، SLA کے ساتھ)۔

---

**WAF — Web Application Firewall** *(باب 17)*

قواعد کی بنیاد پر HTTP/HTTPS ٹریفک کو فلٹر کرتا ہے: IP blocks، rate limits، SQL injection patterns، XSS patterns، جغرافیائی پابندیاں، custom قواعد۔ CloudFront، ALB، API Gateway، یا AppSync سے منسلک ہوتا ہے۔

امتحانی اشارہ: "مخصوص IP ایڈریس بلاک کرنا،" "edge پر SQL injection روکنا،" "API کالز کو rate limit کرنا" → WAF۔

---

**GuardDuty** *(باب 17)*

خطرے کی نشاندہی کی خدمت۔ ML اور threat intelligence استعمال کرتے ہوئے CloudTrail logs، VPC Flow Logs، اور DNS logs کا تجزیہ کرتا ہے۔ غیر معمولی API سرگرمی، معروف نقصان دہ IPs کے ساتھ رابطہ، خراب credentials کا پتہ لگاتا ہے۔

امتحانی اشارہ: "غیر معمولی سرگرمی کا پتہ لگانا،" "خراب IAM credentials کی شناخت،" "مسلسل خطرے کی نگرانی" → GuardDuty۔

---

**Amazon Inspector** *(باب 17)*

خودکار vulnerability assessment خدمت۔ EC2 instances، Amazon ECR container images، اور Lambda functions کو سافٹ ویئر vulnerabilities (CVEs) اور غیر ارادی نیٹ ورک نمائش کے لیے مسلسل اسکین کرتا ہے۔ نتائج مرکزی انتظام کے لیے AWS Security Hub کو بھیجے جاتے ہیں۔

اہم تصورات: CVE اسکیننگ، مسلسل (نہ کہ ایک بار کی) assessment، EC2 + ECR + Lambda کوریج، Security Hub انضمام۔

امتحانی اشارہ: "معروف vulnerabilities کے لیے EC2 کو خودکار اسکین کرنا،" "container images کے لیے CVE اسکیننگ،" "مسلسل vulnerability assessment" → Inspector۔

---

**Amazon Cognito** *(باب 14)*

آپ کی ایپلیکیشن کے آخری صارفین کے لیے منظم authentication — ایک user directory جو آپ کو بنانے کی ضرورت نہیں۔ User Pools sign-up، sign-in، MFA، password reset، اور social identity providers (Google، Facebook، کوئی بھی OIDC provider) سنبھالتے ہیں، JWTs جاری کرتے ہیں جنہیں آپ کی ایپلیکیشن validate کرتی ہے۔ Identity Pools اُن tokens کا تبادلہ عارضی AWS credentials سے کرتے ہیں۔

اہم تصورات: User Pool (authentication، JWTs) بمقابلہ Identity Pool (عارضی AWS credentials)، hosted UI، social/OIDC/SAML federation، API Gateway Cognito authorizer۔

امتحانی اشارہ: "ایپلیکیشن کو صارف sign-up/sign-in درکار،" "social login،" "موبائل ایپ صارفین کو AWS وسائل تک عارضی رسائی دینا" → Cognito۔ موازنہ: IAM آپ کے انجینئرز اور خدمات کے لیے ہے؛ Cognito آپ کے گاہکوں کے لیے ہے۔

---

**AWS Certificate Manager (ACM)** *(باب 16)*

AWS کی منظم خدمات (ALB، CloudFront، API Gateway) کے لیے مفت public TLS/SSL certificates فراہم کرتا ہے اور پورا lifecycle سنبھالتا ہے — کوئی renewal کیلنڈر نہیں، کوئی private key سنبھالنا نہیں۔ DNS validation کے ذریعے خودکار تجدید کرتا ہے۔

اہم تصورات: DNS بمقابلہ email validation، خودکار تجدید، CloudFront کے certificates us-east-1 میں ہونے چاہئیں، مفت public certificates برآمد نہیں کیے جا سکتے (2025 سے ایک قابل برآمد ادا شدہ آپشن موجود ہے)۔

امتحانی اشارہ: "load balancer یا CDN پر HTTPS،" "خودکار certificate تجدید" → ACM۔

---

**Amazon Macie** *(باب 17)*

S3 کے لیے حساس ڈیٹا کی دریافت۔ buckets میں PII (نام، کارڈ نمبر، credentials) تلاش کرنے کے لیے machine learning اور pattern matching استعمال کرتا ہے اور public نمائش جیسے رسائی خطرات کی نشاندہی کرتا ہے۔ GuardDuty کی تکمیل کرتا ہے: GuardDuty رویہ دیکھتا ہے؛ Macie یہ آڈٹ کرتا ہے کہ کیا محفوظ ہے۔

اہم تصورات: Managed data identifiers (PII patterns)، صرف S3 کا دائرہ، نتائج Security Hub/EventBridge کو۔

امتحانی اشارہ: "S3 میں PII دریافت کرنا،" "حساس ڈیٹا کی نمائش کی شناخت" → Macie۔

---

**AWS Control Tower** *(باب 14)*

ایک multi-account ماحول کے setup اور governance کو خودکار کرتا ہے۔ ایک landing zone بناتا ہے — management، log archive، اور audit accounts جو Organizations، CloudTrail، Config، اور guardrails کے ساتھ پہلے سے جڑے ہوتے ہیں — دنوں کی دستی wiring کے بجائے منٹوں میں۔

اہم تصورات: Landing zone، guardrails (preventive = SCPs، detective = Config rules)، معیاری نئے accounts کے لیے Account Factory۔

امتحانی اشارہ: "بہترین طریقوں کے ساتھ خودکار طور پر ایک نیا multi-account ماحول قائم اور حکومت کرنا" → Control Tower۔ موازنہ: Organizations خام بنیادی بلاک ہے؛ Control Tower خودکار اسمبلی ہے۔

---

## میسجنگ اور ایونٹ پروسیسنگ (Messaging and Event Processing)

**SQS — Simple Queue Service** *(باب 19)*

منظم message queue۔ Producers messages بھیجتے ہیں؛ consumers انہیں پڑھتے اور حذف کرتے ہیں۔ خدمات کو غیر منسلک کرتا ہے: بھیجنے والے کو یہ جاننے کی ضرورت نہیں کہ آیا وصول کنندہ دستیاب ہے۔ Standard queues: at-least-once delivery، best-effort ordering۔ FIFO queues: exactly-once processing، سخت ordering۔

اہم تصورات: Visibility timeout (پروسیسنگ کے دوران message دوسرے consumers سے چھپا رہتا ہے)، Dead Letter Queue (DLQ) اُن messages کے لیے جو بار بار ناکام ہوں، Message retention (4 دن default، 14 تک)، Long polling (خالی responses کم کرنا)، زیادہ سے زیادہ payload default 256KB (2025 سے 1 MiB تک بڑھایا جا سکتا ہے؛ بڑے payloads کے لیے، Extended Client Library body کو S3 میں محفوظ کرتی ہے)۔

امتحانی اشارہ: "خدمات کو غیر منسلک کرنا،" "لوڈ کے دوران درخواستیں buffer کرنا،" "async پروسیسنگ" → SQS۔ "ترتیب اہم ہے اور exactly-once درکار" → SQS FIFO۔

---

**SNS — Simple Notification Service** *(باب 19)*

منظم pub/sub خدمت۔ Publishers کسی topic کو ایک message بھیجتے ہیں؛ تمام subscribers ایک نقل وصول کرتے ہیں۔ Fan-out pattern: ایک message → بہت سے consumers۔ Protocols: SQS، Lambda، HTTP/HTTPS، email، SMS، mobile push۔

اہم تصورات: Topic، subscription، fan-out pattern (SNS → متعدد SQS queues)، message filtering (subscribers صرف میل کھانے والے messages وصول کرتے ہیں)۔

امتحانی اشارہ: "بیک وقت متعدد endpoints کو نوٹیفیکیشنز بھیجنا،" "ایک واحد واقعے کو متعدد consumers تک fan-out کرنا" → SNS۔ عام pattern: پائیدار fan-out کے لیے SNS + SQS۔

---

**EventBridge** *(باب 22)*

Event-driven فن تعمیر بنانے کے لیے event bus۔ AWS خدمات، SaaS شراکت داروں، اور custom ماخذ سے واقعات کو Lambda، SQS، SNS، Step Functions، اور دیگر targets تک روٹ کرتا ہے۔ Scheduled rules (cron) اور pattern matching کی حمایت کرتا ہے۔

امتحانی اشارہ: "AWS خدمات سے واقعات کو targets تک روٹ کرنا،" "Lambda functions شیڈول کرنا،" "event-driven orchestration" → EventBridge۔

---

**Step Functions** *(باب 22)*

Serverless workflow orchestration۔ Lambda functions، ECS tasks، DynamoDB، SNS، SQS، اور دیگر خدمات کو بصری state machines میں مربوط کرتا ہے۔ retries، error handling، متوازی branches، اور wait states سنبھالتا ہے۔

اہم تصورات: State machine، state types (Task، Wait، Choice، Parallel، Map، Pass، Succeed، Fail)، Standard Workflows (exactly-once، طویل المدت) بمقابلہ Express Workflows: Asynchronous (at-least-once، اعلیٰ حجم — tasks کو idempotent بنائیں) اور Synchronous (at-most-once، API کال کی طرح براہِ راست نتیجہ واپس کرتا ہے)۔

امتحانی اشارہ: "متعدد Lambda functions کو مربوط کرنا،" "retry logic کے ساتھ طویل المدت workflows،" "انسانی منظوری کے مراحل" → Step Functions۔

---

**Kinesis** *(باب 26)*

حقیقی وقت کی ڈیٹا streaming۔ Kinesis Data Streams: records کی پائیدار، مرتب stream (ایک تقسیم شدہ commit log کی طرح)۔ Consumers records پروسیس کرتے ہیں؛ ڈیٹا 24 گھنٹے (default) سے 365 دن (Extended Data Retention کے ساتھ) برقرار رہتا ہے۔ Amazon Data Firehose (سابقہ Kinesis Data Firehose): S3، Redshift، OpenSearch، Splunk تک مکمل منظم delivery — کسی consumer انتظام کی ضرورت نہیں۔

اہم تصورات: Shard (throughput کی اکائی: 1MB/s write، 2MB/s read)، partition key (shard assignment طے کرتی ہے)، sequence number، checkpointing (KCL یا Lambda)، Firehose بمقابلہ Streams۔

امتحانی اشارہ: "حقیقی وقت کی streaming،" "مرتب records،" "واقعات replay کرنا" → Kinesis Data Streams۔ "Consumers سنبھالے بغیر streaming ڈیٹا S3/Redshift تک پہنچانا" → Amazon Data Firehose (پرانے سوالات "Kinesis Data Firehose" کہہ سکتے ہیں)۔ "streaming ڈیٹا پر SQL" → Amazon Managed Service for Apache Flink (سابقہ Kinesis Data Analytics)۔ SQS سے موازنہ: Kinesis برقرار رکھتا اور replay کرتا ہے؛ SQS استعمال پر حذف کر دیتا ہے۔

---

**Amazon MQ** *(باب 19)*

Apache ActiveMQ اور RabbitMQ کی حمایت کرنے والی منظم message broker خدمت۔ صنعتی معیار کے messaging protocols کی حمایت کرتا ہے: AMQP، STOMP، MQTT، OpenWire، اور WebSocket۔ بنیادی استعمال کا معاملہ on-premises message broker workloads کی lift-and-shift منتقلی ہے — ایسی ایپلیکیشنز جو پہلے سے ActiveMQ یا RabbitMQ استعمال کرتی ہیں کوڈ تبدیلیوں کے بغیر جڑ سکتی ہیں۔

اہم تصورات: ActiveMQ بمقابلہ RabbitMQ engine کا انتخاب، protocol کی حمایت (AMQP/STOMP/MQTT)، HA کے لیے single-instance یا active/standby broker ترتیب۔

امتحانی اشارہ: "on-premises ActiveMQ یا RabbitMQ کو ایپلیکیشن کوڈ بدلے بغیر AWS منتقل کرنا" → Amazon MQ۔ "Greenfield AWS-native messaging" → SQS یا SNS (آسان تر، زیادہ قابل اسکیل)۔

---

## تجزیات (Analytics)

**Athena** *(باب 26)*

S3 میں محفوظ ڈیٹا پر serverless SQL queries۔ سنبھالنے کے لیے کوئی بنیادی ڈھانچہ نہیں۔ فی query (فی TB اسکین) ادائیگی۔ columnar formats (Parquet، ORC) اور partitioned ڈیٹا کے ساتھ بہترین۔

امتحانی اشارہ: "S3 ڈیٹا کو SQL سے query کرنا،" "data lake پر ad-hoc تجزیات،" "کوئی بنیادی ڈھانچہ انتظام نہیں" → Athena۔

---

**Glue** *(باب 26)*

Serverless ETL (Extract، Transform، Load) خدمت۔ Glue Crawlers ڈیٹا دریافت کرتے اور Glue Data Catalog کو اپ ڈیٹ کرتے ہیں۔ Glue Jobs Spark یا Python تبدیلیاں چلاتے ہیں۔ Data Catalog Athena، Redshift Spectrum، اور EMR سے مربوط ہوتا ہے۔

امتحانی اشارہ: "تجزیات کے لیے ڈیٹا تبدیل اور لوڈ کرنا،" "S3 ڈیٹا کا schema دریافت کرنا،" "ETL pipeline" → Glue۔

---

**Amazon QuickSight** *(باب 26)*

منظم business intelligence اور ڈیٹا visualization خدمت۔ SPICE (Super-fast، Parallel، In-memory Calculation Engine) استعمال کرتی ہے، ایک in-memory engine جو تیز dashboard rendering کے لیے درآمد شدہ ڈیٹا کو cache کرتا ہے۔ Athena، S3، Redshift، RDS، اور دیگر AWS ڈیٹا ذرائع سے جڑتا ہے۔ سنبھالنے کے لیے کوئی BI سرور نہیں۔

اہم تصورات: SPICE (in-memory engine)، datasets، analyses، dashboards، ML Insights (anomaly detection، forecasting)، row-level اور column-level سیکیورٹی۔

امتحانی اشارہ: "AWS پر سرور سنبھالے بغیر BI dashboard،" "Athena یا Redshift سے ڈیٹا visualize کرنا" → QuickSight۔

---

**AWS Lake Formation** *(باب 26)*

S3 اور Glue Data Catalog کے اوپر مرکزی data lake رسائی کنٹرول پرت۔ table، column، اور row کی سطح پر باریک permissions فراہم کرتی ہے — اکیلے S3 bucket policies سے زیادہ باریک۔ ایک محفوظ data lake قائم کرنا آسان بناتی ہے: Lake Formation permission ماڈل سنبھالتا ہے؛ Glue catalog سنبھالتا ہے؛ S3 ڈیٹا رکھتا ہے۔

اہم تصورات: Data lake permissions (table/column/row کی سطح)، Glue Data Catalog انضمام، attribute پر مبنی رسائی کے لیے LF-tags، Athena اور Redshift Spectrum queries کے لیے مرکزی grant/revoke۔

امتحانی اشارہ: "data lake پر باریک رسائی کنٹرول،" "S3 ڈیٹا پر column-level یا row-level سیکیورٹی" → Lake Formation۔

---

## اعلیٰ دستیابی اور آفات سے بحالی (High Availability and Disaster Recovery)

**Multi-AZ اور Multi-Region** *(باب 18)*

Multi-AZ: خودکار failover کے لیے ایک Region کے اندر synchronous replication (RDS Multi-AZ، AZs میں load balancer)۔ RDS کے لیے RPO ~0، RTO ~60s۔ Multi-Region: جغرافیائی فالتو پن اور عالمی صارفین کے لیے کم latency کے لیے asynchronous replication۔

اہم تصورات: RTO (Recovery Time Objective — بحال ہونے میں کتنا وقت)، RPO (Recovery Point Objective — کتنا ڈیٹا ضائع ہو سکتا ہے)۔ Pilot Light، Warm Standby، Active-Active DR حکمت عملیاں۔

امتحانی اشارہ: AZ سطح کی ناکامیوں (Multi-AZ سنبھالتا ہے) اور regional ناکامیوں (Multi-Region سنبھالتا ہے) کے درمیان فرق کریں۔ Multi-Region کے ساتھ لاگت اور پیچیدگی نمایاں طور پر بڑھ جاتی ہے۔

---

**AWS Elastic Disaster Recovery (DRS)** *(باب 18)*

سرورز (on-premises یا EC2) کے لیے منظم disaster recovery۔ ماخذ سرورز کو بلاک در بلاک کم لاگت والے staging علاقے میں مسلسل replicate کرتا ہے اور ضرورت پڑنے پر منٹوں میں مکمل recovery instances شروع کرتا ہے — ایک منظم pilot light: تقریباً backup-and-restore قیمتوں پر تقریباً warm-standby جیسے recovery اوقات۔

اہم تصورات: مسلسل بلاک سطح کی replication، کم لاگت staging علاقہ، مانگ پر recovery launch، point-in-time recovery۔

امتحانی اشارہ: "ایک منظم DR خدمت کے ساتھ سرور پر مبنی workloads کے لیے downtime اور ڈیٹا کا نقصان کم کرنا،" "خود بنائے بغیر pilot light" → DRS۔

---

## لاگت کی اصلاح (Cost Optimization)

**EC2 Pricing Models** *(باب 27)*

On-Demand: مکمل قیمت، کوئی عہد نہیں۔ Reserved Instances (1 یا 3 سال): مخصوص instance type کے لیے 30-72% رعایت۔ Savings Plans (Compute یا EC2 Instance): لچک کے لیے عہد شدہ فی گھنٹہ خرچ۔ Spot: قابل تعطل workloads کے لیے 60-90% رعایت۔

امتحانی اشارہ: "قابل پیش گوئی workload کے لیے لاگت کم کرنا" → Savings Plans یا Reserved Instances۔ "Fault-tolerant batch پروسیسنگ" → Spot۔ "غیر متوقع یا قلیل مدتی" → On-Demand۔

---

**Data Transfer Pricing** *(باب 30)*

AWS میں inbound: مفت۔ ایک ہی AZ: مفت۔ Cross-AZ: $0.01/GB ہر سمت۔ Cross-region: $0.02-0.08/GB۔ انٹرنیٹ (outbound): ~$0.09/GB۔ NAT Gateway پروسیسنگ: $0.045/GB۔ CloudFront ڈیٹا منتقلی براہِ راست EC2-سے-انٹرنیٹ سے سستی ہے، اور caching کل حجم کم کرتی ہے۔

امتحانی اشارہ: "private subnet سے S3/DynamoDB کے لیے ڈیٹا منتقلی لاگت کم کرنا" → Gateway Endpoints (مفت)۔ "دیگر خدمات کے لیے NAT Gateway لاگت کم کرنا" → Interface Endpoints۔

---

## مشاہدہ پذیری (Observability)

**CloudWatch** *(پوری کتاب میں حوالہ دیا گیا)*

نگرانی اور مشاہدہ پذیری۔ CloudWatch Metrics: AWS خدمات اور custom ایپلیکیشنز سے عددی time-series ڈیٹا۔ CloudWatch Logs: log ڈیٹا جمع، تلاش، اور تجزیہ کریں۔ CloudWatch Alarms: metric thresholds کی بنیاد پر نوٹیفیکیشنز یا auto scaling متحرک کریں۔ CloudWatch Dashboards: metrics visualize کریں۔

اہم تصورات: Metric dimensions، retention periods، log groups اور log streams، metric filters، CloudWatch Agent (EC2 سے OS-سطح کے metrics اور logs کے لیے)، Container Insights۔

---

**CloudTrail** *(پوری کتاب میں حوالہ دیا گیا)*

آپ کے AWS اکاؤنٹ میں کی جانے والی ہر API کال کو log کرتا ہے: کس نے کی، کہاں سے، کب، اور جواب کیا تھا۔ Multi-region trail logs کو S3 میں غیر معینہ مدت کے لیے محفوظ کرتا ہے۔ سیکیورٹی آڈیٹنگ، تعمیل، اور واقعے کی تفتیش کے لیے استعمال ہوتا ہے۔

امتحانی اشارہ: "وہ resource کس نے حذف کیا؟" "تمام API سرگرمی آڈٹ کرنا" → CloudTrail۔

---

**X-Ray** *(باب 20)*

تقسیم شدہ tracing: انفرادی درخواستوں کا خدمات کے آر پار پیچھا کرتا ہے (traces → segments → subsegments)، فی hop latency اور error rates کے ساتھ ایک service map بناتا ہے۔ Sampling overhead کم رکھتا ہے؛ annotations traces کو قابل تلاش بناتے ہیں۔ Active tracing Lambda اور API Gateway stages پر آن ہوتی ہے۔

امتحانی اشارہ: "microservices کے آر پار درخواستوں کو trace کرنا،" "خدمات کے درمیان bottleneck تلاش کرنا" → X-Ray (نہ CloudWatch، نہ CloudTrail)۔

---

**AWS Config** *(باب 31 میں حوالہ دیا گیا)*

وقت کے ساتھ resource configuration تبدیلیوں کو ٹریک کرتا ہے۔ وسائل کا تعمیل قواعد کے خلاف جائزہ لیتا ہے۔ ہر resource کی ہر configuration تبدیلی کی تاریخ ریکارڈ کرتا ہے۔ تدارک کے لیے Systems Manager سے مربوط ہوتا ہے۔

امتحانی اشارہ: "کیا یہ resource ہماری سیکیورٹی پالیسی سے ہم آہنگ ہے؟" "پچھلے ہفتے اس resource کی configuration کیسی تھی؟" → AWS Config۔

---

## Well-Architected

**چھ ستون** *(باب 31)*

| ستون                    | بنیادی سوال                              | اہم خدمات                                          |
|------------------------|-----------------------------------------|---------------------------------------------------|
| Operational Excellence | کیا ہم اچھی طرح چل رہے ہیں؟              | CloudWatch، CloudTrail، SSM، Config               |
| Security               | کیا ہم محفوظ ہیں؟                        | IAM، KMS، GuardDuty، WAF، Shield، Secrets Manager |
| Reliability            | کیا ہم ناکامی سے بحال ہوتے ہیں؟          | Multi-AZ، Route 53 failover، backup/restore، SQS  |
| Performance Efficiency | کیا ہم درست وسائل استعمال کر رہے ہیں؟    | Right-sizing، Auto Scaling، CloudFront، Kinesis   |
| Cost Optimization      | کیا ہم دانشمندی سے خرچ کر رہے ہیں؟       | Savings Plans، Spot، S3 lifecycle، VPC Endpoints  |
| Sustainability         | کیا ہم ماحولیاتی اثرات کم کر رہے ہیں؟    | Right-sizing، Graviton، موثر storage tiers        |

AWS Well-Architected Tool: آپ کے فن تعمیر کا چھ ستونوں کے خلاف جائزہ لیتا ہے۔ امتحان سے پہلے اسے استعمال کریں تاکہ ہر ستون کے سوالات کے پیچھے استدلال کو سمجھ سکیں۔
