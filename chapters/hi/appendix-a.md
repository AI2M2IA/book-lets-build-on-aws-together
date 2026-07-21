# परिशिष्ट A: AWS सेवाओं का त्वरित संदर्भ

इस पुस्तक में शामिल हर सेवा, उसी क्रम में जिसमें उसे प्रस्तुत किया गया था। इसे अध्ययन संदर्भ के रूप में और परीक्षा की तैयारी के दौरान त्वरित लुकअप के रूप में उपयोग करें।

---

## कंप्यूट

**EC2 — Elastic Compute Cloud** *(अध्याय 4)*

क्लाउड में वर्चुअल मशीनें। आप इंस्टेंस प्रकार (CPU, मेमोरी, स्टोरेज), ऑपरेटिंग सिस्टम और रीजन चुनते हैं। आप प्रति घंटा (On-Demand), प्रति प्रतिबद्धता (Reserved Instances / Savings Plans), या प्रति अतिरिक्त-क्षमता स्लॉट (Spot) के हिसाब से भुगतान करते हैं। यह मूलभूत कंप्यूट प्रिमिटिव है।

मुख्य अवधारणाएँ: AMI (Amazon Machine Image), इंस्टेंस प्रकार (t3, m6g, r6g, c6g परिवार), key pairs, instance profiles, placement groups।

परीक्षा संकेत: जब किसी परिदृश्य में स्थायी, स्टेटफुल, या लंबे समय तक चलने वाली कंप्यूट की आवश्यकता हो — EC2 या ECS। जब किसी परिदृश्य में अल्पकालिक, इवेंट-ट्रिगर्ड, या शून्य-निष्क्रिय-लागत वाली कंप्यूट की आवश्यकता हो — Lambda।

---

**Auto Scaling + Application Load Balancer** *(अध्याय 7)*

Auto Scaling Groups (ASGs) लोड के आधार पर EC2 इंस्टेंस जोड़ते और हटाते हैं। Application Load Balancers (ALBs) ट्रैफ़िक को इंस्टेंसों में वितरित करते हैं और पथ या होस्ट के आधार पर रूट करते हैं। साथ मिलकर ये क्षैतिज स्केलिंग परत बनाते हैं।

मुख्य अवधारणाएँ: Launch template, scaling policies (target tracking, step, scheduled), health checks, ALB target groups, listener rules, weighted routing।

परीक्षा संकेत: "Handle variable load" या "high availability across AZs" → ASG + ALB।

---

**Lambda** *(अध्याय 20)*

सर्वरलेस फ़ंक्शन। आप कोड लिखते हैं; AWS उसे इवेंट्स के जवाब में चलाता है। प्रबंधित करने के लिए कोई सर्वर नहीं। आप प्रति इन्वोकेशन और निष्पादन के प्रति मिलीसेकंड भुगतान करते हैं। यह हज़ारों समवर्ती निष्पादनों तक स्वचालित रूप से स्केल करता है।

मुख्य अवधारणाएँ: Event sources (API Gateway, S3, SQS, EventBridge, Kinesis), execution role, concurrency limits, reserved और provisioned concurrency, cold start, Layers, 15-मिनट अधिकतम अवधि।

परीक्षा संकेत: "Serverless," "event-driven," "short-duration tasks," "no idle cost" → Lambda।

---

**ECS — Elastic Container Service** *(अध्याय 21)*

AWS पर Docker कंटेनर चलाता है। दो लॉन्च प्रकार: EC2 (आप होस्ट प्रबंधित करते हैं) और Fargate (AWS होस्ट प्रबंधित करता है)। ECS task definitions, services, cluster scheduling, और load balancers तथा service discovery के साथ एकीकरण प्रबंधित करता है।

मुख्य अवधारणाएँ: Task definition, ECS service, Fargate बनाम EC2 launch type, ECR (container registry), task IAM role, service auto scaling।

परीक्षा संकेत: "Containerized workloads," "microservices," "Docker on AWS" → ECS (सर्वरलेस कंटेनरों के लिए आमतौर पर Fargate)।

---

**EKS — Elastic Kubernetes Service** *(अध्याय 21)*

प्रबंधित Kubernetes। AWS control plane चलाता है; आप worker nodes (EC2 या Fargate) चलाते हैं। EKS का उपयोग तब करें जब आपकी टीम पहले से Kubernetes का उपयोग करती है या ऐसे workloads हैं जिन्हें Kubernetes-विशिष्ट सुविधाओं की आवश्यकता है।

परीक्षा संकेत: "Kubernetes," "need to migrate existing K8s workloads" → EKS। "Just need containers without K8s overhead" → ECS।

---

**AWS Batch** *(अध्याय 21)*

Docker कंटेनरों के लिए प्रबंधित बैच कंप्यूट। आप एक job (Docker image + command), एक job queue, और एक compute environment (EC2 या Fargate) परिभाषित करते हैं। AWS Batch कंप्यूट को स्वचालित रूप से प्रावधानित और स्केल करता है, फिर job समाप्त होने पर उसे समाप्त कर देता है। लागत कम करने के लिए Spot Instances का समर्थन करता है।

मुख्य अवधारणाएँ: Job definition (क्या चलाना है), job queue (jobs कहाँ प्रतीक्षा करते हैं), compute environment (EC2 या Fargate, On-Demand या Spot), array jobs (एक ही job की कई समानांतर प्रतियाँ चलाना)।

परीक्षा संकेत: "Batch processing that exceeds Lambda's 15-minute timeout," "finite compute jobs on containers," "HPC workloads on AWS" → AWS Batch।

---

**AWS Outposts** *(अध्याय 2)*

आपके अपने डेटा सेंटर या को-लोकेशन सुविधा में स्थापित AWS हार्डवेयर का पूरी तरह प्रबंधित रैक। सार्वजनिक क्लाउड (EC2, EBS, RDS, EKS, Outposts पर S3) जैसी ही AWS सेवाएँ, APIs और टूलिंग चलाता है, लेकिन भौतिक रूप से ऑन-प्रिमाइसेस।

मुख्य अवधारणाएँ: ऑन-प्रिमाइसेस वही AWS APIs, AWS स्थापना और patching प्रबंधित करता है, ग्राहक रैक स्पेस और बिजली प्रदान करता है, Local Gateway (LGW) Outposts को ऑन-प्रिमाइसेस नेटवर्क से जोड़ता है।

परीक्षा संकेत: "Run AWS in your own data center," "data residency requires compute to stay on-premises," "AWS APIs with no internet dependency" → Outposts।

---

**AWS Wavelength** *(अध्याय 2)*

5G दूरसंचार प्रदाताओं के नेटवर्क के भीतर तैनात AWS इन्फ्रास्ट्रक्चर। Wavelength Zones 5G नेटवर्क एज पर स्थित होते हैं, जो मोबाइल डिवाइसों के लिए सिंगल-डिजिट मिलीसेकंड लेटेंसी सक्षम करते हैं।

मुख्य अवधारणाएँ: Wavelength Zones दूरसंचार नेटवर्कों के भीतर AWS Regions के विस्तार हैं, ट्रैफ़िक डिवाइस और Wavelength Zone के बीच कैरियर नेटवर्क पर ही रहता है।

परीक्षा संकेत: "Single-digit-millisecond latency to 5G mobile users," "mobile AR/VR," "real-time gaming on mobile," "autonomous vehicle telemetry" → Wavelength।

---

**AWS Application Migration Service (MGN)** *(अध्याय 25)*

Rehost (lift-and-shift) माइग्रेशन सेवा। एक एजेंट स्रोत सर्वरों की डिस्क को ब्लॉक-दर-ब्लॉक AWS में एक कम-लागत वाले स्टेजिंग क्षेत्र में दोहराता है; आप माँग पर परीक्षण प्रतियाँ लॉन्च करते हैं; cutover पर, MGN दोहराए गए सर्वरों को नेटिव EC2 इंस्टेंस में बदल देता है। किसी एप्लिकेशन बदलाव की आवश्यकता नहीं।

मुख्य अवधारणाएँ: ब्लॉक-स्तरीय निरंतर प्रतिकृति, स्टेजिंग क्षेत्र, cutover से पहले परीक्षण लॉन्च, "7 Rs" माइग्रेशन रणनीतियाँ (MGN = rehost)।

परीक्षा संकेत: "Migrate hundreds of VMs quickly with no code changes," "lift-and-shift servers to EC2" → MGN। DataSync *files* ले जाता है; DMS *databases* ले जाता है; MGN *whole servers* ले जाता है।

---

## स्टोरेज

**S3 — Simple Storage Service** *(अध्याय 5)*

ऑब्जेक्ट स्टोरेज। असीमित क्षमता, 99.999999999% (ग्यारह नाइन) टिकाऊपन। फ़ाइलों को buckets में objects के रूप में संग्रहीत करता है। Buckets एक रीजन में रहते हैं। Objects 0 बाइट से 5TB तक हो सकते हैं।

मुख्य अवधारणाएँ: Bucket policy, object ACL, versioning, static website hosting, presigned URLs, multipart upload, Transfer Acceleration, storage classes (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, साथ ही single-AZ, latency-critical directory-bucket workloads के लिए S3 Express One Zone)।

परीक्षा संकेत: "Store and retrieve files," "static assets," "backups," "data lake" → S3। सही storage class एक्सेस आवृत्ति और retrieval गति पर निर्भर करती है।

---

**EBS — Elastic Block Store** *(अध्याय 6)*

एकल EC2 इंस्टेंस से जुड़ा ब्लॉक स्टोरेज। एक हार्ड ड्राइव की तरह काम करता है। इंस्टेंस के जीवनचक्र से स्वतंत्र रूप से बना रहता है (आप इसे detach और re-attach कर सकते हैं)। सबसे आम प्रकार: gp3 (general purpose SSD, डिफ़ॉल्ट), io2 (databases के लिए provisioned IOPS), st1 (sequential reads के लिए throughput-optimized HDD)।

मुख्य अवधारणाएँ: Snapshots (incremental, S3 में संग्रहीत), encryption (KMS), Multi-Attach (केवल io1/io2), IOPS और throughput provisioning।

परीक्षा संकेत: "Persistent storage for EC2," "database storage," "requires low-latency block access" → EBS।

---

**EFS — Elastic File System** *(अध्याय 6)*

साझा फ़ाइल सिस्टम, कई EC2 इंस्टेंसों से एक साथ सुलभ। NFS प्रोटोकॉल। स्वचालित रूप से स्केल करता है। प्रति GB EBS से अधिक महँगा। Storage classes में Standard, Infrequent Access, और Archive शामिल हैं। Intelligent-Tiering फ़ाइलों को स्वचालित रूप से स्थानांतरित करता है।

परीक्षा संकेत: "Shared file system," "multiple EC2 instances need the same files," "NFS" → EFS।

---

**FSx परिवार** *(अध्याय 6)*

नामित तकनीकों के लिए प्रबंधित फ़ाइल सर्वर। FSx for Windows File Server: SMB प्रोटोकॉल, NTFS, Active Directory एकीकरण, Multi-AZ। FSx for Lustre: HPC/ML के लिए समानांतर उच्च-प्रदर्शन फ़ाइल सिस्टम, S3 objects को फ़ाइलों के रूप में प्रस्तुत करता है (lazy loading)। FSx for NetApp ONTAP: multi-protocol (NFS + SMB + iSCSI), snapshots, SnapMirror प्रतिकृति। FSx for OpenZFS: low-latency NFS, तत्काल snapshots और writable clones।

परीक्षा संकेत: "SMB/Active Directory" → FSx for Windows। "HPC/ML training on S3 data" → FSx for Lustre। "NFS and SMB to the same data / NetApp migration" → FSx for ONTAP। "ZFS migration / instant clones" → FSx for OpenZFS।

---

**S3 Storage Classes और Lifecycle Policies** *(अध्याय 23)*

S3 Intelligent-Tiering एक्सेस आवृत्ति के आधार पर objects को access tiers के बीच स्वचालित रूप से स्थानांतरित करता है। Lifecycle policies आयु नियमों के आधार पर objects को classes के बीच (Standard → Standard-IA → Glacier) स्थानांतरित करती हैं। Glacier storage classes में retrieval विलंब मिलीसेकंड (Glacier Instant Retrieval) से लेकर 12 घंटे (Glacier Deep Archive) तक होता है।

परीक्षा संकेत: "Reduce storage costs for infrequently accessed data" → lifecycle policies, Intelligent-Tiering, या Glacier।

---

**AWS Storage Gateway** *(अध्याय 6)*

हाइब्रिड स्टोरेज सेवा जो ऑन-प्रिमाइसेस वातावरण को AWS स्टोरेज से जोड़ती है। एप्लिकेशन जिन प्रोटोकॉल को पहले से समझते हैं उन्हीं पर स्टोरेज प्रस्तुत करती है, जबकि डेटा को S3, S3 Glacier, या EBS snapshots के रूप में बनाए रखती है।

मुख्य अवधारणाएँ: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, cached या stored mode), Tape Gateway (virtual tape library → Glacier)।

परीक्षा संकेत: "On-premises application needs cloud storage without code changes" → Storage Gateway। "Replace tape backup" → Tape Gateway।

---

**AWS DataSync** *(अध्याय 25)*

एजेंट-आधारित डेटा माइग्रेशन और प्रतिकृति सेवा। एक हल्का एजेंट NFS या SMB पर ऑन-प्रिमाइसेस फ़ाइल सर्वरों से जुड़ता है और shares को S3, EFS, या FSx में सिंक्रनाइज़ करता है — scheduling, bandwidth throttling, और integrity verification अंतर्निहित रूप से।

मुख्य अवधारणाएँ: DataSync agent (ऑन-प्रिमाइसेस VM या EC2), NFS/SMB स्रोत, S3/EFS/FSx गंतव्य, scheduled incremental transfers।

परीक्षा संकेत: "Migrate or continuously sync large numbers of files from on-premises NAS to AWS over the network" → DataSync।

---

**AWS Transfer Family** *(अध्याय 25)*

स्टोरेज गंतव्य के रूप में S3 या EFS द्वारा समर्थित पूरी तरह प्रबंधित SFTP, FTPS, और FTP सर्वर। क्लाइंट अपने मौजूदा SFTP सॉफ़्टवेयर से जुड़ते हैं; अपलोड की गई फ़ाइलें सीधे एक bucket या फ़ाइल सिस्टम में पहुँचती हैं।

मुख्य अवधारणाएँ: Managed endpoint (वैकल्पिक रूप से static IP के साथ), S3 या EFS backing storage, बाहरी भागीदारों के लिए मौजूदा-प्रोटोकॉल संगतता।

परीक्षा संकेत: "Partners must keep uploading via SFTP, but files should land in S3" → Transfer Family।

---

**AWS Snow Family** *(अध्याय 25)*

ऑफ़लाइन, थोक डेटा माइग्रेशन के लिए भौतिक डेटा स्थानांतरण उपकरण। Snowball Edge Storage Optimized: 80 TB प्रयोग योग्य, मज़बूत आवरण, आपके स्थान पर भेजा जाता है; आप स्थानीय रूप से डेटा लोड करते हैं और इसे S3 में अंतर्ग्रहण के लिए वापस भेजते हैं।

मुख्य अवधारणाएँ: पहले transfer गणित करें — यदि नेटवर्क transfer में लगभग एक सप्ताह या अधिक लगेगा, तो एक भौतिक उपकरण जीतता है। *विरासत नोट (2026)*: AWS इस परिवार को सेवानिवृत्त करता रहा है — Snowmobile (2024) और Snowcone (late 2024) समाप्त हो चुके हैं, और Snow उपकरण नवंबर 2025 में नए ग्राहकों के लिए बंद हो गए (AWS अब DataSync और Data Transfer Terminals की ओर इशारा करता है)। SAA-C03 प्रश्न बैंक इससे पहले का है, इसलिए परीक्षा अभी भी उत्तर के रूप में Snowball की अपेक्षा करती है।

परीक्षा संकेत: "Petabyte-scale migration," "limited bandwidth, weeks of transfer time" → Snow Family।

---

**AWS Backup** *(अध्याय 18 और 23)*

EBS, RDS, DynamoDB, EFS, और Storage Gateway में केंद्रीकृत, नीति-आधारित backup सेवा। Backup plans schedules और retention परिभाषित करते हैं; vaults recovery points संग्रहीत करते हैं।

मुख्य अवधारणाएँ: Backup plans और vaults, cross-region और cross-account प्रतियाँ, अपरिवर्तनीयता के लिए Vault Lock।

परीक्षा संकेत: "Centralize and automate backups across multiple AWS services," "cross-account backup copies for ransomware/account-compromise protection" → AWS Backup।

---

## डेटाबेस

**RDS — Relational Database Service** *(अध्याय 8)*

प्रबंधित रिलेशनल डेटाबेस। समर्थित engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, और Aurora (AWS का स्वामित्व वाला engine)। AWS backups, patching, failover, और प्रतिकृति संभालता है। आप schema design, queries, और instance sizing प्रबंधित करते हैं।

मुख्य अवधारणाएँ: Multi-AZ deployment (स्वचालित failover, synchronous प्रतिकृति), Read Replicas (asynchronous, read scaling के लिए), automated backups (1-35 दिन retention), manual snapshots (हटाए जाने तक रखे जाते हैं), RDS Proxy (connection pooling)।

परीक्षा संकेत: "Relational database," "ACID transactions," "existing SQL workload" → RDS या Aurora।

---

**Aurora** *(अध्याय 24)*

AWS का रिलेशनल डेटाबेस engine, MySQL और PostgreSQL के साथ संगत। वितरित स्टोरेज engine जो डेटा को 3 AZs में 6 प्रतियों में दोहराता है। आमतौर पर MySQL से 5x तेज़। Aurora Serverless v2 क्षमता को स्वचालित रूप से स्केल करता है (ACUs में मापा जाता है — Aurora Capacity Units) और, समर्थित engine संस्करणों पर, जब कोई कनेक्शन खुला नहीं रखा जाता तब 0 ACUs तक auto-pause कर सकता है।

मुख्य अवधारणाएँ: Aurora cluster (writer + एकल reader endpoint के पीछे 15 तक Aurora Replicas), Aurora Global Database (< 1 सेकंड प्रतिकृति लैग के साथ cross-region read replicas), Aurora Serverless v2, ACUs, auto-pause/resume व्यवहार।

परीक्षा संकेत: "High-performance relational database," "MySQL/PostgreSQL compatible," "global reads," "variable workload" → Aurora।

---

**DynamoDB** *(अध्याय 9)*

पूरी तरह प्रबंधित NoSQL डेटाबेस। Key-value और document मॉडल। single-digit मिलीसेकंड प्रदर्शन के साथ किसी भी throughput तक स्केल करता है। दो capacity modes: on-demand (प्रति अनुरोध भुगतान) और provisioned (प्रति capacity unit प्रति घंटा भुगतान, Auto Scaling के साथ)।

मुख्य अवधारणाएँ: Partition key (आवश्यक), sort key (वैकल्पिक), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (change data capture), DynamoDB Accelerator (DAX) — in-memory cache, TTL (Time to Live), transactions।

परीक्षा संकेत: "High-throughput key-based access," "flexible schema," "serverless NoSQL" → DynamoDB।

---

**ElastiCache** *(अध्याय 10)*

प्रबंधित in-memory caching। दो engines: Redis (persistent, pub/sub, Lua scripting, data structures) और Memcached (शुद्ध cache, सरल, multi-threaded)। डेटाबेस लोड कम करने और अक्सर पढ़े जाने वाले डेटा को माइक्रोसेकंड में सर्व करने के लिए उपयोग करें।

मुख्य अवधारणाएँ: Cache-aside pattern, write-through pattern, eviction policies, TTL, cluster mode (Redis), स्वचालित failover के साथ Multi-AZ।

परीक्षा संकेत: "Reduce database load," "sub-millisecond read latency," "session management," "real-time leaderboard" → ElastiCache Redis।

---

**Amazon MemoryDB for Redis** *(अध्याय 10)*

टिकाऊ, Redis-संगत, in-memory प्राथमिक डेटाबेस। ElastiCache के विपरीत (जो एक cache है जहाँ डेटा हानि स्वीकार्य है), MemoryDB एक Multi-AZ transaction log संग्रहीत करता है और टिकाऊपन की गारंटी देता है। आप MemoryDB को अपने प्राथमिक डेटाबेस के रूप में उपयोग कर सकते हैं — न कि केवल किसी अन्य डेटाबेस के सामने एक cache के रूप में।

मुख्य अवधारणाएँ: Redis API संगतता, Multi-AZ transaction log (टिकाऊपन गारंटी), in-memory प्रदर्शन, प्राथमिक डेटाबेस (cache परत नहीं)।

परीक्षा संकेत: "Redis-compatible AND data loss is not acceptable," "durable in-memory database" → MemoryDB। "Redis as cache, data loss acceptable" → ElastiCache Redis।

---

**Purpose-Built Databases** *(अध्याय 9, 10, और 24)*

डेटा के आकार को engine से मिलाएँ। DocumentDB: MongoDB-संगत documents। Neptune: graph database (relationships, traversals — Gremlin/SPARQL)। Keyspaces: Cassandra-संगत wide-column। Timestream: time-series (वर्तमान पेशकश: Timestream for InfluxDB)। MemoryDB: टिकाऊ Redis-संगत *primary* database (बनाम ElastiCache = cache)। QLDB ("immutable cryptographic ledger") 2025 में बंद कर दिया गया — इसे एक विरासत distractor मानें।

परीक्षा संकेत: "social graph / recommendations / fraud rings" → Neptune। "MongoDB" → DocumentDB। "Cassandra" → Keyspaces। "IoT telemetry over time" → Timestream।

---

**AWS DMS — Database Migration Service** *(अध्याय 8)*

न्यूनतम डाउनटाइम के साथ डेटाबेस को AWS में माइग्रेट करता है। full load (प्रारंभिक प्रतिलिपि) के साथ-साथ CDC (Change Data Capture) का समर्थन करता है ताकि माइग्रेशन चलने के दौरान स्रोत और लक्ष्य को सिंक में रखा जा सके। समान engine प्रकार के बीच माइग्रेट करते समय (MySQL → MySQL, PostgreSQL → PostgreSQL), DMS का सीधे उपयोग करें। विभिन्न engine प्रकारों के बीच माइग्रेट करते समय (Oracle → Aurora PostgreSQL), पहले schema को बदलने के लिए AWS Schema Conversion Tool (SCT) का उपयोग करें, फिर डेटा के लिए DMS।

मुख्य अवधारणाएँ: Replication instance, source और target endpoints, full load + CDC, heterogeneous migrations के लिए SCT (Schema Conversion Tool)।

परीक्षा संकेत: "Migrate database with minimal downtime" → DMS। "Oracle to Aurora" या कोई भी heterogeneous माइग्रेशन → SCT + DMS। "Same engine, same type" → DMS direct।

---

## नेटवर्किंग

**VPC — Virtual Private Cloud** *(अध्याय 11)*

AWS के भीतर एक पृथक नेटवर्क। रीजन में सभी AZs तक फैला हुआ। आप IP पता स्पेस (CIDR block) परिभाषित करते हैं, subnets (public या private) बनाते हैं, route tables कॉन्फ़िगर करते हैं, और security groups तथा NACLs के माध्यम से एक्सेस नियंत्रित करते हैं।

मुख्य अवधारणाएँ: Public subnet (Internet Gateway तक route), private subnet (outbound के लिए NAT Gateway तक route), Internet Gateway (इंटरनेट से inbound + outbound), NAT Gateway (private instances के लिए केवल outbound), VPC Peering (दो VPCs जोड़ें), VPC Endpoints (इंटरनेट के बिना AWS सेवाओं से जुड़ें)।

परीक्षा संकेत: "Private network on AWS," "isolate resources from internet," "control network traffic" → VPC।

---

**Security Groups और NACLs** *(अध्याय 15)*

Security groups इंस्टेंस स्तर पर stateful firewalls हैं — केवल allow rules, return ट्रैफ़िक स्वचालित है। NACLs (Network Access Control Lists) subnet स्तर पर stateless firewalls हैं — inbound और outbound दोनों rules की आवश्यकता होती है, rule number के क्रम में मूल्यांकित।

परीक्षा संकेत: "Block a specific IP from accessing the subnet" → NACL। "Control traffic to/from an instance" → security group।

---

**Route 53** *(अध्याय 12)*

AWS की DNS सेवा और domain registrar। इंटरनेट ट्रैफ़िक को AWS resources और बाहरी endpoints पर रूट करता है। Routing policies: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer।

मुख्य अवधारणाएँ: Hosted zones (public और private), record types (A, AAAA, CNAME, Alias), health checks, Traffic Flow (visual policy editor — ध्यान दें कि geoproximity records पर एक सीधी routing policy के रूप में भी उपलब्ध है, एक समायोज्य bias के साथ, Traffic Flow की आवश्यकता के बिना)।

परीक्षा संकेत: "DNS routing," "failover between regions," "route based on latency or location" → उपयुक्त routing policy के साथ Route 53।

---

**CloudFront** *(अध्याय 13)*

Content Delivery Network (CDN)। edge locations (दुनिया भर में 750+ points of presence) पर सामग्री cache करता है। अंतिम उपयोगकर्ताओं के लिए लेटेंसी कम करता है। caching के माध्यम से origin transfer लागत कम करता है। S3, EC2, ALB, और API Gateway को origins के रूप में एकीकृत करता है।

मुख्य अवधारणाएँ: Distribution, origins, behaviors (origins तक path-based routing), TTL (cache control), cache invalidation, signed URLs और cookies (access control), Lambda@Edge और CloudFront Functions (edge पर कोड चलाएँ), Origin Shield (origin लोड कम करें)।

परीक्षा संकेत: "Global low latency," "cache static content," "reduce origin load," "protect against DDoS with Shield" → CloudFront।

---

**Direct Connect और VPN** *(अध्याय 25)*

AWS Direct Connect आपके ऑन-प्रिमाइसेस डेटा सेंटर से AWS तक एक समर्पित भौतिक नेटवर्क कनेक्शन है। सार्वजनिक इंटरनेट को बायपास करता है। अधिक सुसंगत bandwidth और लेटेंसी। AWS Site-to-Site VPN सार्वजनिक इंटरनेट पर एक encrypted tunnel है — सेटअप करने में तेज़, कम लागत, लेकिन परिवर्तनशील प्रदर्शन।

मुख्य अवधारणाएँ: Virtual Interface (VIF), Direct Connect Gateway (कई regions से कनेक्ट करें), Transit Gateway (hub-and-spoke नेटवर्क topology), VPN tunnel redundancy।

परीक्षा संकेत: "Dedicated private connection to AWS" → Direct Connect। "Encrypted connection, faster setup" → VPN। "Connect multiple VPCs" → Transit Gateway।

---

**VPC Endpoints** *(अध्याय 30)*

सार्वजनिक इंटरनेट या NAT Gateway का उपयोग किए बिना private resources को AWS सेवाओं से जोड़ें। Gateway Endpoints: मुफ़्त, केवल S3 और DynamoDB के लिए उपलब्ध। Interface Endpoints (PrivateLink): प्रति घंटा + प्रति GB मूल्य, अधिकांश AWS सेवाओं के लिए उपलब्ध।

परीक्षा संकेत: "EC2 in private subnet calls S3/DynamoDB — reduce NAT Gateway costs" → Gateway Endpoint (मुफ़्त)। "Private connection to SQS, SSM, Secrets Manager from private subnet" → Interface Endpoint।

---

**AWS Client VPN** *(अध्याय 11)*

प्रबंधित OpenVPN endpoint जो व्यक्तिगत डिवाइसों (laptops, workstations) को इंटरनेट पर एक VPC से सुरक्षित रूप से कनेक्ट करने देता है। प्रमाणीकरण विकल्प: Active Directory, किसी identity provider के साथ SAML 2.0 federation, या mutual TLS (certificate-based)। split-tunnel (केवल VPC-bound ट्रैफ़िक tunnel से गुज़रता है) और full-tunnel (सभी ट्रैफ़िक AWS से रूट होता है) का समर्थन करता है।

मुख्य अवधारणाएँ: Client VPN endpoint, target network (VPC subnet association), authorization rules, split-tunnel बनाम full-tunnel।

परीक्षा संकेत: "Remote engineers need secure access to a VPC from home," "individual device to VPC connectivity" → Client VPN। तुलना: Site-to-Site VPN = network-to-network। Client VPN = device-to-network।

---

**Network Load Balancer (NLB) और Gateway Load Balancer (GWLB)** *(अध्याय 7)*

NLB Layer 4 (TCP/UDP/TLS) पर काम करता है: कोई HTTP inspection नहीं, बस अत्यधिक गति पर packet routing — प्रति सेकंड लाखों अनुरोध, प्रति AZ एक static IP और source IP preservation के साथ। GWLB Layer 3 पर काम करता है और एक उद्देश्य के लिए मौजूद है: third-party वर्चुअल नेटवर्क appliances (firewalls, IDS/IPS, deep packet inspection) को ट्रैफ़िक प्रवाह में inline डालना।

मुख्य अवधारणाएँ: NLB = Layer 4, static IPs, ultra-low latency, non-HTTP protocols। GWLB = Layer 3, GENEVE encapsulation, एकल entry point के पीछे appliance fleets। ALB = Layer 7 (path/host routing)।

परीक्षा संकेत: "Millions of TCP requests per second," "static IP for the load balancer," "preserve source IP" → NLB। "Insert third-party security appliances into the traffic path" → GWLB।

---

**AWS Global Accelerator** *(अध्याय 25)*

सार्वजनिक इंटरनेट पार करने के बजाय निकटतम edge location पर उपयोगकर्ता ट्रैफ़िक को AWS के निजी global backbone पर रूट करता है। दो static Anycast IP पते प्रदान करता है जो एक या अधिक regions में आपके ALBs, NLBs, या EC2 instances के सामने होते हैं। *dynamic* (non-cacheable) ट्रैफ़िक के लिए लेटेंसी और संगति में सुधार करता है।

मुख्य अवधारणाएँ: Static Anycast IPs, AWS backbone पर edge onboarding, सेकंडों में health-check-based regional failover, traffic dials के साथ endpoint groups।

परीक्षा संकेत: "Global users, dynamic/non-HTTP traffic, static IP, fast regional failover" → Global Accelerator। "Cacheable/static content" → इसके बजाय CloudFront।

---

## सुरक्षा और पहचान

**IAM — Identity and Access Management** *(अध्याय 3 और 14)*

नियंत्रित करता है कि आपके AWS खाते में कौन क्या कर सकता है। Users (दीर्घकालिक credentials), Groups (permissions साझा करने वाले users), Roles (सेवाओं और cross-account access के लिए अस्थायी credentials), Policies (allow/deny rules परिभाषित करने वाले JSON documents)।

मुख्य अवधारणाएँ: Principal, Action, Resource, Condition, explicit deny > explicit allow > implicit deny, SCP (AWS Organizations में Service Control Policy), Permission boundary, AssumeRole।

परीक्षा संकेत: IAM हर सुरक्षा प्रश्न में शामिल होता है। मुख्य पैटर्न: सेवाएँ IAM roles का उपयोग करती हैं (users का नहीं)। Cross-account access role assumption का उपयोग करता है। Least privilege — केवल वही दें जो आवश्यक है।

---

**KMS — Key Management Service** *(अध्याय 16)*

प्रबंधित encryption key सेवा। cryptographic keys बनाती, संग्रहीत और नियंत्रित करती है। Customer-managed keys (CMKs) आपको rotation, उपयोग, और access policies परिभाषित करने देती हैं। AWS-managed keys स्वचालित रूप से प्रबंधित होती हैं।

मुख्य अवधारणाएँ: Key policy (IAM policy से अलग), Envelope encryption (डेटा को एक data key से encrypt किया जाता है; data key को CMK से encrypt किया जाता है), स्वचालित key rotation, Multi-region keys, Grants।

परीक्षा संकेत: "Encrypt data at rest," "customer-managed encryption keys," "key rotation" → KMS।

---

**Secrets Manager** *(अध्याय 16)*

संवेदनशील मानों को संग्रहीत और स्वचालित रूप से rotate करता है: database credentials, API keys, OAuth tokens। स्वचालित password rotation के लिए RDS के साथ एकीकृत होता है। एप्लिकेशन रनटाइम पर API के माध्यम से secrets प्राप्त करते हैं — credentials को कभी hardcode न करें।

परीक्षा संकेत: "Store and rotate database credentials," "avoid hardcoded secrets" → Secrets Manager। "Store configuration values, not secrets" → Parameter Store (SSM)।

---

**AWS Shield** *(अध्याय 17)*

DDoS सुरक्षा। Shield Standard स्वचालित और मुफ़्त है — सामान्य volumetric और protocol हमलों से बचाता है। Shield Advanced वित्तीय सुरक्षा, 24/7 DDoS response team, और विस्तृत हमले की दृश्यता जोड़ता है।

परीक्षा संकेत: "Protect against DDoS" → Shield Standard (स्वचालित) या Shield Advanced (एंटरप्राइज़, SLA के साथ)।

---

**WAF — Web Application Firewall** *(अध्याय 17)*

नियमों के आधार पर HTTP/HTTPS ट्रैफ़िक फ़िल्टर करता है: IP blocks, rate limits, SQL injection patterns, XSS patterns, भौगोलिक प्रतिबंध, custom rules। CloudFront, ALB, API Gateway, या AppSync से जुड़ता है।

परीक्षा संकेत: "Block specific IP addresses," "prevent SQL injection at the edge," "rate limit API calls" → WAF।

---

**GuardDuty** *(अध्याय 17)*

खतरा पहचान सेवा। ML और threat intelligence का उपयोग करके CloudTrail logs, VPC Flow Logs, और DNS logs का विश्लेषण करता है। असामान्य API गतिविधि, ज्ञात दुर्भावनापूर्ण IPs के साथ संचार, समझौता किए गए credentials का पता लगाता है।

परीक्षा संकेत: "Detect unusual activity," "identify compromised IAM credentials," "continuous threat monitoring" → GuardDuty।

---

**Amazon Inspector** *(अध्याय 17)*

स्वचालित भेद्यता मूल्यांकन सेवा। software vulnerabilities (CVEs) और अनपेक्षित नेटवर्क एक्सपोज़र के लिए EC2 instances, Amazon ECR container images, और Lambda functions को लगातार स्कैन करता है। निष्कर्ष केंद्रीकृत प्रबंधन के लिए AWS Security Hub को भेजे जाते हैं।

मुख्य अवधारणाएँ: CVE scanning, निरंतर (one-shot नहीं) मूल्यांकन, EC2 + ECR + Lambda coverage, Security Hub एकीकरण।

परीक्षा संकेत: "Automatically scan EC2 for known vulnerabilities," "CVE scanning for container images," "continuous vulnerability assessment" → Inspector।

---

**Amazon Cognito** *(अध्याय 14)*

आपके एप्लिकेशन के अंतिम उपयोगकर्ताओं के लिए प्रबंधित प्रमाणीकरण — एक user directory जिसे आपको बनाने की आवश्यकता नहीं। User Pools sign-up, sign-in, MFA, password reset, और social identity providers (Google, Facebook, कोई भी OIDC provider) संभालते हैं, ऐसे JWTs जारी करते हैं जिन्हें आपका एप्लिकेशन सत्यापित करता है। Identity Pools उन tokens को अस्थायी AWS credentials के लिए विनिमय करते हैं।

मुख्य अवधारणाएँ: User Pool (authentication, JWTs) बनाम Identity Pool (अस्थायी AWS credentials), hosted UI, social/OIDC/SAML federation, API Gateway Cognito authorizer।

परीक्षा संकेत: "Application needs user sign-up/sign-in," "social login," "give mobile app users temporary access to AWS resources" → Cognito। तुलना: IAM आपके इंजीनियरों और सेवाओं के लिए है; Cognito आपके ग्राहकों के लिए है।

---

**AWS Certificate Manager (ACM)** *(अध्याय 16)*

AWS-प्रबंधित सेवाओं (ALB, CloudFront, API Gateway) के लिए मुफ़्त public TLS/SSL certificates प्रदान करता है और पूरे जीवनचक्र को संभालता है — कोई renewal calendar नहीं, कोई private key handling नहीं। DNS validation के माध्यम से स्वतः-नवीनीकरण करता है।

मुख्य अवधारणाएँ: DNS बनाम email validation, स्वतः-नवीनीकरण, CloudFront के लिए certificates us-east-1 में होने चाहिए, मुफ़्त public certificates निर्यात नहीं किए जा सकते (2025 से एक भुगतान योग्य निर्यात विकल्प मौजूद है)।

परीक्षा संकेत: "HTTPS on a load balancer or CDN," "automatic certificate renewal" → ACM।

---

**Amazon Macie** *(अध्याय 17)*

S3 के लिए संवेदनशील डेटा खोज। buckets में PII (names, card numbers, credentials) खोजने के लिए मशीन लर्निंग और pattern matching का उपयोग करता है और public exposure जैसे access risks को flag करता है। GuardDuty का पूरक: GuardDuty व्यवहार देखता है; Macie ऑडिट करता है कि क्या संग्रहीत है।

मुख्य अवधारणाएँ: Managed data identifiers (PII patterns), S3-only scope, findings को Security Hub/EventBridge में।

परीक्षा संकेत: "Discover PII in S3," "identify sensitive data exposure" → Macie।

---

**AWS Control Tower** *(अध्याय 14)*

multi-account वातावरण के सेटअप और governance को स्वचालित करता है। एक landing zone बनाता है — management, log archive, और audit accounts जो Organizations, CloudTrail, Config, और guardrails के साथ पूर्व-वायर्ड हैं — मैन्युअल वायरिंग के दिनों के बजाय मिनटों में।

मुख्य अवधारणाएँ: Landing zone, guardrails (preventive = SCPs, detective = Config rules), मानकीकृत नए खातों के लिए Account Factory।

परीक्षा संकेत: "Set up and govern a new multi-account environment with best practices automatically" → Control Tower। तुलना: Organizations कच्चा building block है; Control Tower स्वचालित असेंबली है।

---

## मैसेजिंग और इवेंट प्रोसेसिंग

**SQS — Simple Queue Service** *(अध्याय 19)*

प्रबंधित message queue। Producers messages भेजते हैं; consumers उन्हें पढ़ते और हटाते हैं। सेवाओं को decouple करता है: भेजने वाले को यह जानने की आवश्यकता नहीं कि प्राप्तकर्ता उपलब्ध है या नहीं। Standard queues: at-least-once delivery, best-effort ordering। FIFO queues: exactly-once processing, सख्त ordering।

मुख्य अवधारणाएँ: Visibility timeout (processing के दौरान message अन्य consumers से छिपा रहता है), बार-बार विफल होने वाले messages के लिए Dead Letter Queue (DLQ), Message retention (4 दिन डिफ़ॉल्ट, 14 तक), Long polling (खाली प्रतिक्रियाएँ कम करें), डिफ़ॉल्ट रूप से अधिकतम payload 256KB (2025 से 1 MiB तक बढ़ाया जा सकता है; बड़े payloads के लिए, Extended Client Library body को S3 में संग्रहीत करता है)।

परीक्षा संकेत: "Decouple services," "buffer requests during load spikes," "async processing" → SQS। "Order matters and exactly-once is required" → SQS FIFO।

---

**SNS — Simple Notification Service** *(अध्याय 19)*

प्रबंधित pub/sub सेवा। Publishers एक topic पर message भेजते हैं; सभी subscribers एक प्रति प्राप्त करते हैं। Fan-out pattern: एक message → कई consumers। Protocols: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push।

मुख्य अवधारणाएँ: Topic, subscription, fan-out pattern (SNS → कई SQS queues), message filtering (subscribers केवल मिलते-जुलते messages प्राप्त करते हैं)।

परीक्षा संकेत: "Send notifications to multiple endpoints simultaneously," "fan-out a single event to multiple consumers" → SNS। सामान्य पैटर्न: टिकाऊ fan-out के लिए SNS + SQS।

---

**EventBridge** *(अध्याय 22)*

event-driven architectures बनाने के लिए event bus। AWS सेवाओं, SaaS partners, और custom स्रोतों से events को Lambda, SQS, SNS, Step Functions, और अन्य targets पर रूट करता है। scheduled rules (cron) और pattern matching का समर्थन करता है।

परीक्षा संकेत: "Route events from AWS services to targets," "schedule Lambda functions," "event-driven orchestration" → EventBridge।

---

**Step Functions** *(अध्याय 22)*

सर्वरलेस workflow orchestration। Lambda functions, ECS tasks, DynamoDB, SNS, SQS, और अन्य सेवाओं को visual state machines में समन्वित करता है। retries, error handling, parallel branches, और wait states संभालता है।

मुख्य अवधारणाएँ: State machine, state types (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (exactly-once, long-running) बनाम Express Workflows: Asynchronous (at-least-once, high-volume — tasks को idempotent बनाने के लिए डिज़ाइन करें) और Synchronous (at-most-once, API call की तरह सीधे result लौटाता है)।

परीक्षा संकेत: "Orchestrate multiple Lambda functions," "long-running workflows with retry logic," "human approval steps" → Step Functions।

---

**Kinesis** *(अध्याय 26)*

रियल-टाइम डेटा streaming। Kinesis Data Streams: records की टिकाऊ, ordered stream (एक distributed commit log की तरह)। Consumers records प्रोसेस करते हैं; डेटा 24 घंटे (डिफ़ॉल्ट) से 365 दिन (Extended Data Retention के साथ) तक बना रहता है। Amazon Data Firehose (पूर्व में Kinesis Data Firehose): S3, Redshift, OpenSearch, Splunk में पूरी तरह प्रबंधित delivery — किसी consumer management की आवश्यकता नहीं।

मुख्य अवधारणाएँ: Shard (throughput की इकाई: 1MB/s write, 2MB/s read), partition key (shard assignment निर्धारित करता है), sequence number, checkpointing (KCL या Lambda), Firehose बनाम Streams।

परीक्षा संकेत: "Real-time streaming," "ordered records," "replay events" → Kinesis Data Streams। "Deliver streaming data to S3/Redshift without managing consumers" → Amazon Data Firehose (पुराने प्रश्न "Kinesis Data Firehose" कह सकते हैं)। "SQL on streaming data" → Amazon Managed Service for Apache Flink (पूर्व में Kinesis Data Analytics)। SQS से तुलना: Kinesis retain और replay करता है; SQS consumption पर हटा देता है।

---

**Amazon MQ** *(अध्याय 19)*

Apache ActiveMQ और RabbitMQ का समर्थन करने वाली प्रबंधित message broker सेवा। उद्योग-मानक messaging protocols का समर्थन करता है: AMQP, STOMP, MQTT, OpenWire, और WebSocket। प्राथमिक उपयोग मामला ऑन-प्रिमाइसेस message broker workloads का lift-and-shift माइग्रेशन है — ऐसे एप्लिकेशन जो पहले से ActiveMQ या RabbitMQ का उपयोग करते हैं, बिना कोड बदलाव के कनेक्ट हो सकते हैं।

मुख्य अवधारणाएँ: ActiveMQ बनाम RabbitMQ engine विकल्प, protocol support (AMQP/STOMP/MQTT), HA के लिए single-instance या active/standby broker configuration।

परीक्षा संकेत: "Migrate on-premises ActiveMQ or RabbitMQ to AWS without changing application code" → Amazon MQ। "Greenfield AWS-native messaging" → SQS या SNS (सरल, अधिक स्केलेबल)।

---

## एनालिटिक्स

**Athena** *(अध्याय 26)*

S3 में संग्रहीत डेटा पर सर्वरलेस SQL queries। प्रबंधित करने के लिए कोई इन्फ्रास्ट्रक्चर नहीं। प्रति query भुगतान (प्रति TB स्कैन)। columnar formats (Parquet, ORC) और partitioned डेटा के साथ सर्वोत्तम।

परीक्षा संकेत: "Query S3 data with SQL," "ad-hoc analytics on data lake," "no infrastructure management" → Athena।

---

**Glue** *(अध्याय 26)*

सर्वरलेस ETL (Extract, Transform, Load) सेवा। Glue Crawlers डेटा खोजते हैं और Glue Data Catalog को अपडेट करते हैं। Glue Jobs Spark या Python transformations चलाते हैं। Data Catalog Athena, Redshift Spectrum, और EMR के साथ एकीकृत होता है।

परीक्षा संकेत: "Transform and load data for analytics," "discover schema of S3 data," "ETL pipeline" → Glue।

---

**Amazon QuickSight** *(अध्याय 26)*

प्रबंधित business intelligence और data visualization सेवा। SPICE (Super-fast, Parallel, In-memory Calculation Engine) का उपयोग करता है, एक in-memory engine जो तेज़ dashboard rendering के लिए आयातित डेटा को cache करता है। Athena, S3, Redshift, RDS, और अन्य AWS डेटा स्रोतों से जुड़ता है। प्रबंधित करने के लिए कोई BI server नहीं।

मुख्य अवधारणाएँ: SPICE (in-memory engine), datasets, analyses, dashboards, ML Insights (anomaly detection, forecasting), row-level और column-level security।

परीक्षा संकेत: "BI dashboard on AWS without managing a server," "visualize data from Athena or Redshift" → QuickSight।

---

**AWS Lake Formation** *(अध्याय 26)*

S3 और Glue Data Catalog के ऊपर केंद्रीकृत data lake access control परत। table, column, और row स्तर पर fine-grained permissions प्रदान करता है — अकेले S3 bucket policies से अधिक granular। एक सुरक्षित data lake स्थापित करना सरल बनाता है: Lake Formation permission मॉडल संभालता है; Glue catalog संभालता है; S3 डेटा रखता है।

मुख्य अवधारणाएँ: Data lake permissions (table/column/row-level), Glue Data Catalog एकीकरण, attribute-based access control के लिए LF-tags, Athena और Redshift Spectrum queries के लिए केंद्रीकृत grant/revoke।

परीक्षा संकेत: "Fine-grained access control on data lake," "column-level or row-level security on S3 data" → Lake Formation।

---

## उच्च उपलब्धता और आपदा पुनर्प्राप्ति

**Multi-AZ और Multi-Region** *(अध्याय 18)*

Multi-AZ: स्वचालित failover के लिए एक region के भीतर synchronous प्रतिकृति (RDS Multi-AZ, AZs में load balancer)। RDS के लिए RPO ~0, RTO ~60s। Multi-Region: भौगोलिक अतिरेक और global उपयोगकर्ताओं के लिए कम लेटेंसी के लिए asynchronous प्रतिकृति।

मुख्य अवधारणाएँ: RTO (Recovery Time Objective — पुनर्प्राप्ति में कितना समय), RPO (Recovery Point Objective — कितना डेटा खोया जा सकता है)। Pilot Light, Warm Standby, Active-Active DR रणनीतियाँ।

परीक्षा संकेत: AZ-स्तरीय विफलताओं (Multi-AZ संभालता है) बनाम regional विफलताओं (Multi-Region संभालता है) के बीच अंतर करें। Multi-Region के साथ लागत और जटिलता काफी बढ़ जाती है।

---

**AWS Elastic Disaster Recovery (DRS)** *(अध्याय 18)*

सर्वरों (ऑन-प्रिमाइसेस या EC2) के लिए प्रबंधित आपदा पुनर्प्राप्ति। स्रोत सर्वरों को ब्लॉक-दर-ब्लॉक एक कम-लागत वाले स्टेजिंग क्षेत्र में लगातार दोहराता है और आवश्यकता पड़ने पर मिनटों में पूर्ण recovery instances लॉन्च करता है — एक प्रबंधित pilot light: backup-and-restore के करीब कीमतों पर near-warm-standby पुनर्प्राप्ति समय।

मुख्य अवधारणाएँ: निरंतर ब्लॉक-स्तरीय प्रतिकृति, कम-लागत वाला स्टेजिंग क्षेत्र, on-demand recovery launch, point-in-time recovery।

परीक्षा संकेत: "Minimize downtime and data loss for server-based workloads with a managed DR service," "pilot light without building it yourself" → DRS।

---

## लागत अनुकूलन

**EC2 Pricing Models** *(अध्याय 27)*

On-Demand: पूर्ण मूल्य, कोई प्रतिबद्धता नहीं। Reserved Instances (1 या 3 वर्ष): विशिष्ट instance type के लिए 30-72% छूट। Savings Plans (Compute या EC2 Instance): लचीलेपन के लिए प्रतिबद्ध प्रति घंटा खर्च। Spot: interruptible workloads के लिए 60-90% छूट।

परीक्षा संकेत: "Minimize cost for predictable workload" → Savings Plans या Reserved Instances। "Fault-tolerant batch processing" → Spot। "Unpredictable or short-term" → On-Demand।

---

**Data Transfer Pricing** *(अध्याय 30)*

AWS में Inbound: मुफ़्त। Same-AZ: मुफ़्त। Cross-AZ: प्रत्येक दिशा में $0.01/GB। Cross-region: $0.02-0.08/GB। Internet (outbound): ~$0.09/GB। NAT Gateway processing: $0.045/GB। CloudFront data transfer सीधे EC2-to-internet से सस्ता है, और caching कुल मात्रा को कम करता है।

परीक्षा संकेत: "Reduce data transfer costs for S3/DynamoDB from private subnet" → Gateway Endpoints (मुफ़्त)। "Reduce NAT Gateway costs for other services" → Interface Endpoints।

---

## ऑब्ज़र्वेबिलिटी

**CloudWatch** *(पूरे में संदर्भित)*

Monitoring और observability। CloudWatch Metrics: AWS सेवाओं और custom एप्लिकेशनों से numeric time-series डेटा। CloudWatch Logs: log डेटा एकत्र, खोज और विश्लेषण करें। CloudWatch Alarms: metric thresholds के आधार पर notifications या auto scaling ट्रिगर करें। CloudWatch Dashboards: metrics को visualize करें।

मुख्य अवधारणाएँ: Metric dimensions, retention periods, log groups और log streams, metric filters, CloudWatch Agent (EC2 से OS-स्तरीय metrics और logs के लिए), Container Insights।

---

**CloudTrail** *(पूरे में संदर्भित)*

आपके AWS खाते में किए गए हर API call को log करता है: किसने किया, कहाँ से, कब, और प्रतिक्रिया क्या थी। Multi-region trail logs को S3 में अनिश्चितकाल तक संग्रहीत करता है। सुरक्षा ऑडिटिंग, अनुपालन, और घटना जाँच के लिए उपयोग किया जाता है।

परीक्षा संकेत: "Who deleted that resource?" "Audit all API activity" → CloudTrail।

---

**X-Ray** *(अध्याय 20)*

Distributed tracing: सेवाओं में अलग-अलग अनुरोधों का अनुसरण करता है (traces → segments → subsegments), प्रति hop लेटेंसी और error rates के साथ एक service map बनाता है। Sampling overhead कम रखता है; annotations traces को खोजने योग्य बनाते हैं। Active tracing Lambda और API Gateway stages पर toggle होता है।

परीक्षा संकेत: "Trace requests across microservices," "find the bottleneck between services" → X-Ray (CloudWatch नहीं, CloudTrail नहीं)।

---

**AWS Config** *(अध्याय 31 में संदर्भित)*

समय के साथ resource configuration परिवर्तनों को ट्रैक करता है। अनुपालन नियमों के विरुद्ध resources का मूल्यांकन करता है। प्रत्येक resource के प्रत्येक configuration परिवर्तन का इतिहास रिकॉर्ड करता है। remediation के लिए Systems Manager के साथ एकीकृत होता है।

परीक्षा संकेत: "Is this resource compliant with our security policy?" "What did this resource's configuration look like last week?" → AWS Config।

---

## Well-Architected

**छह स्तंभ** *(अध्याय 31)*

| स्तंभ                   | मूल प्रश्न                                | मुख्य सेवाएँ                                        |
|------------------------|-----------------------------------------|---------------------------------------------------|
| Operational Excellence | क्या हम अच्छी तरह चल रहे हैं?              | CloudWatch, CloudTrail, SSM, Config               |
| Security               | क्या हम सुरक्षित हैं?                      | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability            | क्या हम विफलता से उबरते हैं?               | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Performance Efficiency | क्या हम सही संसाधनों का उपयोग कर रहे हैं?  | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Cost Optimization      | क्या हम समझदारी से खर्च कर रहे हैं?         | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| Sustainability         | क्या हम पर्यावरणीय प्रभाव कम कर रहे हैं?    | Right-sizing, Graviton, efficient storage tiers   |

AWS Well-Architected Tool: छह स्तंभों के विरुद्ध आपके आर्किटेक्चर का मूल्यांकन करता है। प्रत्येक स्तंभ के प्रश्नों के पीछे के तर्क को समझने के लिए इसे परीक्षा से पहले उपयोग करें।
