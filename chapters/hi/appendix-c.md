# परिशिष्ट C: अवधारणा रजिस्ट्री

पुस्तक में प्रस्तुत प्रत्येक मुख्य अवधारणा, उसके अध्याय, उपयोग की गई उपमा, और जिस SAA-C03 डोमेन में वह दिखाई देती है, से मैप की गई है।

इसे एक अध्ययन सूचकांक के रूप में उपयोग करें: यदि परीक्षा से पहले आप किसी अवधारणा पर अस्पष्ट हैं, तो उसे यहाँ खोजें और संदर्भ के लिए उसके अध्याय पर लौटें।

---

## A

**ACM (AWS Certificate Manager)** — ALB, CloudFront, और API Gateway के लिए मुफ़्त public TLS certificates, DNS validation के माध्यम से स्वचालित नवीनीकरण के साथ। CloudFront certificates us-east-1 में होने चाहिए। अध्याय 16। Domain 1।

**ACU (Aurora Capacity Unit)** — Aurora Serverless v2 capacity के लिए माप की इकाई। स्वचालित रूप से स्केल करता है और, समर्थित engine संस्करणों पर, जब कोई कनेक्शन खुला नहीं रखा जाता तब 0 ACUs तक auto-pause कर सकता है। अध्याय 24। Domain 3।

**Alarm (CloudWatch)** — एक नियम जो तब fire होता है जब कोई metric एक threshold पार करता है, जो एक notification या auto scaling action ट्रिगर करता है। अध्याय 7। Domain 2।

**ALB (Application Load Balancer)** — Layer 7 load balancer जो path और host rules के आधार पर HTTP/HTTPS ट्रैफ़िक रूट करता है। अध्याय 7। Domain 2।

**AMI (Amazon Machine Image)** — एक template जिसमें EC2 instance के लिए OS, software, और configuration शामिल है। अध्याय 4। Domain 3।

**Architect mindset** — केवल "यह कैसे काम करता है?" के बजाय "पहले क्या टूटता है, हमें कैसे पता चलता है, और सुबह 3 बजे कोई क्या करता है?" पूछना। अध्याय 32, अध्याय 34। Cross-domain।

**Architecture Decision Record (ADR)** — एक संक्षिप्त दस्तावेज़ जो एक निर्णय, उसके विकल्प, उसके औचित्य, और किस कारण से पुनर्विचार होगा, को दर्ज करता है। अध्याय 32। Cross-domain।

**Architecture review** — एक संरचित प्रक्रिया जो शामिल करती है: constraints → unknowns → options → failure modes → monitoring → runbooks। अध्याय 32। Cross-domain।

**Athena** — S3 में डेटा के लिए serverless SQL query सेवा। प्रति TB स्कैन भुगतान। Parquet/ORC columnar formats के साथ सर्वोत्तम। अध्याय 26। Domain 3।

**Auto Scaling Group (ASG)** — एक साथ प्रबंधित EC2 instances का एक समूह, जो अस्वस्थ instances को स्वचालित रूप से बदलता है और लोड के आधार पर स्केल करता है। अध्याय 7। Domain 2, 3।

**Availability Zone (AZ)** — एक region के भीतर एक या अधिक भौतिक रूप से अलग डेटा सेंटर, low-latency links से जुड़े। अध्याय 2। Domain 2।

---

## B

**AWS Backup** — EBS, RDS, DynamoDB, EFS, और Storage Gateway में केंद्रीकृत, नीति-आधारित backup। cross-region और cross-account प्रतियों का समर्थन करता है। अध्याय 18, 23। Domain 2।

**AWS Batch** — Docker containers के लिए प्रबंधित बैच कंप्यूट। एक job definition (क्या चलाना है), एक job queue (jobs कहाँ प्रतीक्षा करते हैं), और एक compute environment (EC2 या Fargate, On-Demand या Spot) से बना है। उन workloads के लिए जो Lambda की 15-मिनट सीमा से अधिक हैं। अध्याय 21। Domain 3।

**Bucket (S3)** — S3 objects के लिए एक container। Buckets के अद्वितीय global नाम होते हैं और एक विशिष्ट region में रहते हैं। अध्याय 5। Domain 3।

**Bucket policy** — एक S3 bucket से जुड़ी एक resource-based policy जो IAM principals और बाहरी खातों के लिए access नियंत्रित करती है। अध्याय 5। Domain 1।

---

## C

**Cache-aside pattern** — एप्लिकेशन पहले cache जाँचता है; miss पर, database से query करता है, फिर परिणाम cache में संग्रहीत करता है। अध्याय 10। Domain 3।

**Cache hit rate** — origin के बजाय cache से सर्व किए गए अनुरोधों का प्रतिशत। अधिक बेहतर है। अध्याय 13। Domain 3।

**AWS Client VPN** — प्रबंधित OpenVPN endpoint। व्यक्तिगत devices (laptops, workstations) को इंटरनेट पर एक VPC से जोड़ता है। Active Directory, किसी identity provider के साथ SAML 2.0 federation, या mutual TLS के माध्यम से प्रमाणीकरण। split-tunnel और full-tunnel modes का समर्थन करता है। Site-to-Site VPN (network-to-network) से तुलना करें। अध्याय 11। Domain 1।

**CloudFront** — AWS CDN। दुनिया भर में 750+ edge locations पर सामग्री cache करता है। लेटेंसी और origin data transfer लागत कम करता है। अध्याय 13। Domain 3, 4।

**CloudTrail** — प्रत्येक AWS API call को log करता है: कौन, क्या, कब, कहाँ से। S3 में संग्रहीत। ऑडिटिंग और घटना जाँच के लिए उपयोग किया जाता है। Domain 1।

**CloudWatch** — AWS resources और custom एप्लिकेशनों के लिए metrics, logs, alarms, और dashboards। पूरे में संदर्भित। सभी डोमेन।

**Amazon Cognito** — आपके एप्लिकेशन के अंतिम उपयोगकर्ताओं के लिए प्रमाणीकरण: User Pools एक प्रबंधित user directory हैं (sign-up, sign-in, MFA, social login, JWTs); Identity Pools अस्थायी AWS credentials जारी करते हैं। IAM आपके इंजीनियरों के लिए है; Cognito आपके ग्राहकों के लिए है। अध्याय 14। Domain 1।

**Cold start (Lambda)** — पहली invocation पर (या निष्क्रियता के बाद) विलंब क्योंकि Lambda execution environment को आरंभ करता है। समाप्त करने के लिए provisioned concurrency का उपयोग करें। अध्याय 20। Domain 3।

**Compute Savings Plan** — प्रति घंटा EC2 खर्च की एक डॉलर राशि के लिए प्रतिबद्धता, जो किसी भी instance type या size पर लागू होती है। अध्याय 27। Domain 4।

**Config (AWS)** — समय के साथ AWS resources में configuration परिवर्तनों को ट्रैक करता है और नियमों के विरुद्ध अनुपालन का मूल्यांकन करता है। अध्याय 31। Domain 1।

**AWS Control Tower** — multi-account governance को स्वचालित करता है: मिनटों में guardrails के साथ एक landing zone (management, log archive, और audit accounts) बनाता है — Organizations, CloudTrail, और Config को हाथ से वायर करने का prefab संस्करण। अध्याय 14। Domain 1।

**Cross-AZ data transfer** — एक region के भीतर Availability Zones के बीच ट्रैफ़िक। प्रत्येक दिशा में $0.01/GB शुल्क। अध्याय 30। Domain 4।

**Cross-region replication** — डेटा (S3 CRR, Aurora Global, DynamoDB Global Tables) को एक अलग region में कॉपी करना। data transfer शुल्क लगता है। अध्याय 18, 23, 30। Domain 2।

---

## D

**AWS DataSync** — file shares (NFS/SMB) का S3, EFS, या FSx में एजेंट-आधारित माइग्रेशन और sync। "rsync on steroids, with an AWS console." अध्याय 25। Domain 3।

**DAX (DynamoDB Accelerator)** — विशेष रूप से DynamoDB के लिए in-memory cache। माइक्रोसेकंड read latency। अध्याय 9। Domain 3।

**Dead Letter Queue (DLQ)** — एक queue जहाँ ऐसे messages भेजे जाते हैं जो बार-बार processing में विफल होते हैं, queue blockage रोकते हुए। अध्याय 19। Domain 2।

**AWS DMS (Database Migration Service)** — न्यूनतम डाउनटाइम के साथ डेटाबेस को AWS में माइग्रेट करता है। Full load (प्रारंभिक प्रतिलिपि) के साथ-साथ CDC (Change Data Capture) माइग्रेशन के दौरान स्रोत और लक्ष्य को सिंक में रखता है। Homogeneous migrations (समान engine type): DMS का सीधे उपयोग करें। Heterogeneous migrations (विभिन्न engine types, उदा. Oracle → Aurora PostgreSQL): पहले SCT (Schema Conversion Tool), फिर DMS। अध्याय 8। Domain 3।

**Dedicated Host** — आपके विशेष उपयोग के लिए आरक्षित एक भौतिक EC2 server। कुछ software licenses के लिए आवश्यक। अध्याय 27। Domain 4।

**Defense in depth** — कई सुरक्षा नियंत्रणों को परतों में रखना (IAM + security groups + NACLs + WAF + GuardDuty) ताकि एक परत के समझौते से सिस्टम उजागर न हो। अध्याय 33। Domain 1।

**Direct Connect** — एक ऑन-प्रिमाइसेस स्थान से AWS तक एक समर्पित private नेटवर्क कनेक्शन। VPN से अधिक सुसंगत। अध्याय 25। Domain 3।

**DLQ** — देखें Dead Letter Queue।

**DynamoDB** — किसी भी पैमाने पर single-digit मिलीसेकंड latency के साथ पूरी तरह प्रबंधित NoSQL डेटाबेस। Key-value और document मॉडल। अध्याय 9। Domain 3।

**DynamoDB Auto Scaling** — CloudWatch metrics के आधार पर provisioned read/write capacity को स्वचालित रूप से समायोजित करता है। अध्याय 29। Domain 4।

**DynamoDB Streams** — DynamoDB table में सभी item परिवर्तनों का एक time-ordered change log। event-driven processing के लिए Lambda के साथ उपयोग किया जाता है। अध्याय 9। Domain 2।

---

## E

**EBS (Elastic Block Store)** — एकल EC2 instance से जुड़ा block storage। स्वतंत्र रूप से बना रहता है। Types: gp3, io2, st1। अध्याय 6। Domain 3।

**EC2 (Elastic Compute Cloud)** — क्लाउड में वर्चुअल मशीनें। अध्याय 4। Domain 3।

**ECS (Elastic Container Service)** — प्रबंधित container orchestration। Fargate launch type server management को हटा देता है। अध्याय 21। Domain 2, 3।

**EFS (Elastic File System)** — कई EC2 instances से सुलभ साझा NFS फ़ाइल सिस्टम। स्वचालित रूप से स्केल करता है। Storage classes में Standard, Infrequent Access, और Archive शामिल हैं, tiers के बीच स्वचालित आवाजाही के लिए Intelligent-Tiering के साथ। अध्याय 6। Domain 3।

**EKS (Elastic Kubernetes Service)** — AWS पर प्रबंधित Kubernetes control plane। अध्याय 21। Domain 3।

**Elastic Disaster Recovery (DRS)** — सर्वरों (ऑन-प्रिमाइसेस या EC2) की निरंतर block-level प्रतिकृति एक कम-लागत वाले स्टेजिंग क्षेत्र में, recovery instances मिनटों में लॉन्च होते हैं — एक प्रबंधित pilot light। अध्याय 18। Domain 2।

**ElastiCache** — प्रबंधित in-memory caching। Redis (अधिक समृद्ध सुविधाएँ) या Memcached (सरल)। अध्याय 10। Domain 3।

**Elastic IP** — एक static public IP पता जिसे आप आवंटित कर सकते हैं और EC2 instances के साथ फिर से संबद्ध कर सकते हैं। अध्याय 11। Domain 3।

**Envelope encryption** — एक pattern जहाँ डेटा को एक data key (DEK) से encrypt किया जाता है, और DEK को एक master key (KMS में CMK) से encrypt किया जाता है। अध्याय 16। Domain 1।

**EventBridge** — AWS सेवाओं, SaaS partners, और custom स्रोतों से events को targets पर रूट करने के लिए event bus। scheduled rules का समर्थन करता है। अध्याय 22। Domain 2।

**Explicit deny** — एक IAM deny statement जिसे किसी भी allow द्वारा override नहीं किया जा सकता। सभी allows पर प्राथमिकता लेता है। अध्याय 3। Domain 1।

---

## F

**Failover routing (Route 53)** — जब primary health checks में विफल होता है तब ट्रैफ़िक को एक secondary endpoint पर रूट करता है। अध्याय 12। Domain 2।

**Fargate** — ECS और EKS के लिए serverless compute engine। प्रबंधित करने के लिए कोई EC2 instances नहीं। अध्याय 21। Domain 3।

**Fan-out pattern** — एक SNS topic एक साथ कई SQS queues में एक ही message पहुँचाता है। अध्याय 19। Domain 2।

**FIFO queue (SQS)** — Exactly-once processing, सख्त ordering। standard queues की तुलना में कम throughput। अध्याय 19। Domain 2।

**Failure mode** — एक विशिष्ट तरीका जिससे एक सिस्टम विफल हो सकता है। प्रोडक्शन से पहले failure modes की पहचान architecture review का मूल है। अध्याय 32। Cross-domain।

---

## G

**Gateway Endpoint** — S3 और DynamoDB के लिए एक मुफ़्त VPC endpoint type। AWS private नेटवर्क के माध्यम से ट्रैफ़िक रूट करता है, NAT Gateway शुल्क समाप्त करता है। अध्याय 30। Domain 4।

**Gateway Load Balancer (GWLB)** — third-party वर्चुअल नेटवर्क appliances (firewalls, IDS/IPS) को ट्रैफ़िक प्रवाह में inline डालने के लिए Layer 3 load balancer। अध्याय 7। Domain 1।

**Geolocation routing (Route 53)** — DNS query मूल के भौगोलिक स्थान के आधार पर रूट करता है। अध्याय 12। Domain 3।

**Global Accelerator** — Anycast के माध्यम से ट्रैफ़िक को निकटतम AWS edge पर रूट करता है, dynamic एप्लिकेशनों के लिए latency में सुधार करता है। अध्याय 25। Domain 3।

**Glue (AWS)** — Serverless ETL। Glue Crawlers schema खोजते हैं; Glue Jobs डेटा transform करते हैं; Data Catalog metadata संग्रहीत करता है। अध्याय 26। Domain 3।

**GSI (Global Secondary Index)** — एक अलग partition key और वैकल्पिक sort key के साथ एक DynamoDB table पर एक वैकल्पिक index। लचीले query patterns सक्षम करता है। अध्याय 9। Domain 3।

**GuardDuty** — असामान्य गतिविधि का पता लगाने के लिए CloudTrail, VPC Flow Logs, और DNS logs पर ML का उपयोग करने वाली threat detection सेवा। अध्याय 17। Domain 1।

---

## H

**Health check (Route 53)** — endpoint उपलब्धता की निगरानी करता है। विफल health checks failover routing ट्रिगर करते हैं। अध्याय 12। Domain 2।

**Hot partition (DynamoDB)** — एक partition जो असंगत ट्रैफ़िक प्राप्त करता है क्योंकि कई अनुरोध एक ही partition key साझा करते हैं। अध्याय 9। Domain 3।

---

## I

**IAM (Identity and Access Management)** — AWS खातों के लिए authentication और authorization नियंत्रित करता है। Users, groups, roles, policies। अध्याय 3, 14। Domain 1।

**IAM role** — अस्थायी credentials के साथ एक IAM identity, सेवाओं, users, या अन्य खातों द्वारा assume की गई। अध्याय 3, 14। Domain 1।

**Idempotency** — एक operation का गुण जो एक बार या कई बार बुलाए जाने पर समान परिणाम उत्पन्न करता है। distributed systems (refunds, payments, order processing) के लिए महत्वपूर्ण। अध्याय 32। Cross-domain।

**Idempotency key** — एक operation के लिए एक अद्वितीय पहचानकर्ता, निष्पादन से पहले जाँचा जाता है ताकि duplicate processing रोकी जा सके। अध्याय 32। Cross-domain।

**Interface Endpoint (PrivateLink)** — अधिकांश AWS सेवाओं के लिए एक VPC endpoint। प्रति घंटा + प्रति GB मूल्य। इंटरनेट या NAT के बिना private connectivity प्रदान करता है। अध्याय 30। Domain 4।

**Internet Gateway (IGW)** — public subnets में instances को इंटरनेट के साथ संचार करने देता है। subnet की route table में IGW तक एक route होना आवश्यक है। अध्याय 11। Domain 3।

**"It depends"** — अधिकांश आर्किटेक्चर प्रश्नों का ईमानदार उत्तर, जिसे हमेशा पूरा किया जाना चाहिए: "It depends on the access pattern / scale / failure consequence / cost constraint." अध्याय 33। Cross-domain।

---

## K

**Kinesis Data Firehose** — Amazon Data Firehose का पूर्व नाम: S3, Redshift, OpenSearch में streaming डेटा की प्रबंधित delivery। कोई consumer management नहीं। पुराने परीक्षा प्रश्न अभी भी पुराने नाम का उपयोग कर सकते हैं। अध्याय 26। Domain 3।

**Kinesis Data Streams** — Real-time ordered event stream। टिकाऊ, retention window के भीतर replayable (24 घंटे डिफ़ॉल्ट, 365 दिन तक)। shards में मापा जाता है। अध्याय 26। Domain 3।

**KMS (Key Management Service)** — encryption at rest के लिए cryptographic keys बनाता, संग्रहीत और नियंत्रित करता है। अध्याय 16। Domain 1।

---

## L

**Lambda** — events द्वारा ट्रिगर किए गए serverless functions। प्रति invocation और प्रति ms भुगतान। अधिकतम 15-मिनट अवधि। अध्याय 20। Domain 2, 3, 4।

**Lambda@Edge** — Lambda functions जो CloudFront edge locations पर चलते हैं, requests और responses को संशोधित करते हैं। अध्याय 13। Domain 3।

**AWS Lake Formation** — S3 और Glue Data Catalog के ऊपर केंद्रीकृत data lake access control परत। table, column, और row स्तर पर fine-grained permissions प्रदान करता है। सुरक्षित data lake सेटअप को सरल बनाता है। अध्याय 26। Domain 3।

**Latency-based routing (Route 53)** — DNS queries को सबसे कम मापी गई latency वाले AWS region पर रूट करता है। अध्याय 12। Domain 3।

**Launch template** — Auto Scaling Groups के लिए EC2 instance configuration निर्दिष्ट करने वाला एक versioned template। अध्याय 7। Domain 3।

**Least privilege** — IAM सर्वोत्तम अभ्यास: केवल आवश्यक permissions दें, उससे अधिक नहीं। अध्याय 3। Domain 1।

**Lifecycle policy (S3)** — नियम जो objects को आयु के आधार पर स्वचालित रूप से सस्ती storage classes में स्थानांतरित या हटा देते हैं। अध्याय 23। Domain 4।

**LSI (Local Secondary Index)** — समान partition key लेकिन एक अलग sort key का उपयोग करते हुए एक DynamoDB table पर एक वैकल्पिक index। table निर्माण के समय बनाया जाना चाहिए। अध्याय 9। Domain 3।

---

## M

**Amazon Macie** — S3 में संवेदनशील डेटा (PII) की ML-आधारित खोज और exposure risks का flagging। GuardDuty व्यवहार देखता है; Macie ऑडिट करता है कि क्या संग्रहीत है। अध्याय 17। Domain 1।

**Memcached** — सरल, multi-threaded in-memory caching engine। कोई persistence नहीं, कोई data structures नहीं। Redis का उपयोग करें जब तक कि आपको विशेष रूप से सुविधाओं की कीमत पर multi-threading की आवश्यकता न हो। अध्याय 10। Domain 3।

**Amazon MemoryDB for Redis** — टिकाऊ, Redis-संगत, in-memory primary database। ElastiCache के विपरीत, MemoryDB एक Multi-AZ transaction log में लिखता है, डेटा टिकाऊपन की गारंटी देता है। उपयोग करें जब Redis API संगतता आवश्यक हो AND डेटा हानि स्वीकार्य न हो। अध्याय 10। Domain 3।

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: पूरे सर्वरों की block-level प्रतिकृति AWS में, परीक्षण लॉन्च, फिर नेटिव EC2 instances में cutover। DataSync files ले जाता है; DMS databases ले जाता है; MGN servers ले जाता है। अध्याय 25। Domain 3।

**Amazon MQ** — standard protocols (AMQP, MQTT, STOMP) बोलने वाला प्रबंधित ActiveMQ/RabbitMQ broker। मौजूदा broker workloads के lift-and-shift के लिए बिना कोड बदलाव के; greenfield messaging → SQS/SNS। अध्याय 19। Domain 2।

**Multi-AZ (RDS)** — स्वचालित failover के साथ एक अलग AZ में synchronous standby replica। RPO ~0, RTO ~60 सेकंड। उच्च उपलब्धता के लिए, read scaling के लिए नहीं। अध्याय 8, 18। Domain 2।

**Multi-Region** — भौगोलिक अतिरेक और global प्रदर्शन के लिए कई AWS regions में एप्लिकेशन घटकों को तैनात करना। अधिक जटिलता और लागत। अध्याय 18। Domain 2।

---

## N

**Network Load Balancer (NLB)** — Layer 4 (TCP/UDP/TLS) load balancer: प्रति सेकंड लाखों अनुरोध, प्रति AZ static IP, source IP संरक्षित करता है। कोई HTTP जागरूकता नहीं — वह ALB का काम है। अध्याय 7। Domain 3।

**NACL (Network Access Control List)** — subnet स्तर पर stateless firewall। inbound और outbound दोनों rules की आवश्यकता है। Rules numeric क्रम में मूल्यांकित। अध्याय 15। Domain 1।

**NAT Gateway** — private subnets में instances को इंटरनेट से outbound कनेक्शन बनाने देता है। प्रोसेस किए गए प्रति GB $0.045 शुल्क। अध्याय 11, 30। Domain 4।

---

## O

**Object (S3)** — S3 में संग्रहीत एक फ़ाइल। key (नाम), value (डेटा), और metadata से बना है। अधिकतम आकार 5TB। अध्याय 5। Domain 3।

**On-Demand capacity (DynamoDB)** — प्रति अनुरोध भुगतान mode। provisioned की तुलना में प्रति अनुरोध अधिक महँगा, लेकिन कोई capacity planning आवश्यक नहीं। अध्याय 29। Domain 4।

**On-Demand instances (EC2)** — बिना प्रतिबद्धता के प्रति घंटा भुगतान। अधिकतम लचीलापन, अधिकतम मूल्य। अध्याय 27। Domain 4।

**AWS Outposts** — किसी ग्राहक के अपने डेटा सेंटर या को-लोकेशन सुविधा में स्थापित AWS हार्डवेयर का पूरी तरह प्रबंधित रैक। सार्वजनिक क्लाउड जैसी ही AWS सेवाएँ, APIs, और टूलिंग ऑन-प्रिमाइसेस चलाता है। AWS स्थापना और patching प्रबंधित करता है; ग्राहक रैक स्पेस और बिजली प्रदान करता है। data residency, low-latency on-premises workloads, या disconnected परिदृश्यों के लिए। अध्याय 2। Domain 4।

---

## P

**Partition key (DynamoDB)** — प्राथमिक key घटक जो निर्धारित करता है कि कौन सा partition एक item संग्रहीत करता है। समान वितरण के लिए एक high-cardinality key चुनें। अध्याय 9। Domain 3।

**Permission boundary** — एक IAM policy जो एक IAM identity के पास अधिकतम permissions निर्धारित करती है, भले ही अन्य policies अधिक प्रदान करें। अध्याय 14। Domain 1।

**Placement group** — latency कम करने (cluster) या उपलब्धता अधिकतम करने (spread) के लिए EC2 instances की भौतिक नियुक्ति को नियंत्रित करता है। अध्याय 4। Domain 3।

**PrivateLink** — AWS में होस्ट की गई सेवाओं के लिए private endpoints बनाने के लिए AWS सेवा, Interface Endpoints के माध्यम से सुलभ। अध्याय 30। Domain 1।

**Provisioned concurrency (Lambda)** — पूर्व-आरंभ किए गए execution environments जो cold start विलंब समाप्त करते हैं। अध्याय 20। Domain 3।

**Provisioned capacity (DynamoDB)** — पूर्व-आवंटित read और write throughput, प्रति सेकंड capacity units में मापा जाता है। predictable ट्रैफ़िक के लिए on-demand से सस्ता। अध्याय 9, 29। Domain 4।

---

## Q

**Amazon QuickSight** — प्रबंधित business intelligence और data visualization सेवा। तेज़ dashboard rendering के लिए डेटा को cache करने हेतु SPICE (Super-fast, Parallel, In-memory Calculation Engine) का उपयोग करता है। Athena, S3, Redshift, RDS, और अन्य AWS डेटा स्रोतों से जुड़ता है। प्रबंधित करने के लिए कोई BI server नहीं। अध्याय 26। Domain 3।

---

## R

**RDS (Relational Database Service)** — प्रबंधित रिलेशनल डेटाबेस। backups, patching, failover संभालता है। अध्याय 8। Domain 3।

**RDS Proxy** — Lambda/application और RDS के बीच एक connection pool प्रबंधित करता है, connection exhaustion रोकता है। अध्याय 8। Domain 3।

**Read Replica (RDS)** — read scaling के लिए database की asynchronous प्रति। स्वचालित failover प्रदान नहीं करती। अध्याय 8, 24। Domain 3।

**Redis** — caching, session management, real-time leaderboards, pub/sub के लिए उपयोग किया जाने वाला in-memory data structure store। अध्याय 10। Domain 3।

**Reserved Instance (EC2)** — छूट के बदले 1 या 3 वर्ष के लिए एक विशिष्ट region में एक विशिष्ट instance type का उपयोग करने की प्रतिबद्धता। अध्याय 27। Domain 4।

**Route 53** — AWS DNS सेवा और domain registrar। कई routing policies का समर्थन करती है। अध्याय 12। Domain 2, 3।

**RPO (Recovery Point Objective)** — समय में मापी गई अधिकतम स्वीकार्य डेटा हानि। "हम कितना डेटा खोने का जोखिम उठा सकते हैं?" अध्याय 18। Domain 2।

**RTO (Recovery Time Objective)** — विफलता के बाद सेवा बहाल करने में अधिकतम स्वीकार्य समय। "हम कितनी देर तक down रह सकते हैं?" अध्याय 18। Domain 2।

**Runbook** — एक सिस्टम को संचालित करने के लिए चरण-दर-चरण निर्देश, विशेष रूप से घटना प्रतिक्रिया के लिए। "सुबह 3 बजे कोई क्या करता है?" अध्याय 32। Cross-domain।

---

## S

**S3 Intelligent-Tiering** — access patterns के आधार पर S3 objects को access tiers के बीच स्वचालित रूप से स्थानांतरित करता है। कोई retrieval fee नहीं। अध्याय 23। Domain 4।

**S3 Select** — SQL expressions का उपयोग करके एक S3 object सामग्री का एक उपसमुच्चय प्राप्त करता है, data transfer कम करता है। विरासत: mid-2024 से नए ग्राहकों के लिए अनुपलब्ध — Athena अब S3 में डेटा फ़िल्टर और query करने का प्राथमिक मार्ग है। S3 Object Lambda, जो कभी सुझाया गया विकल्प था, स्वयं विरासत है (नवंबर 2025 में नए ग्राहकों के लिए बंद; मौजूदा workloads काम करते रहते हैं)। अध्याय 30। Domain 4।

**Savings Plan** — छूट के बदले प्रति घंटा खर्च की एक डॉलर राशि के लिए प्रतिबद्ध एक लचीला pricing मॉडल। Reserved Instances से अधिक लचीला। अध्याय 27। Domain 4।

**SCP (Service Control Policy)** — AWS Organizations policy जो एक OU में खातों के लिए उपलब्ध अधिकतम permissions को प्रतिबंधित करती है। अध्याय 14। Domain 1।

**Secrets Manager** — secrets (database passwords, API keys) को संग्रहीत और स्वचालित रूप से rotate करता है। अध्याय 16। Domain 1।

**Security group** — instance स्तर पर एक stateful वर्चुअल firewall। केवल allow rules; return ट्रैफ़िक स्वचालित है। अध्याय 15। Domain 1।

**Shard (Kinesis)** — Kinesis Data Streams में throughput की मूल इकाई: 1 MB/s write, 2 MB/s read। अध्याय 26। Domain 3।

**Shared Responsibility Model** — AWS क्लाउड *की* सुरक्षा (infrastructure) के लिए जिम्मेदार है; आप क्लाउड *में* सुरक्षा (data, configuration, access) के लिए जिम्मेदार हैं। अध्याय 1। Domain 1।

**Shield** — DDoS सुरक्षा। Standard: मुफ़्त, स्वचालित। Advanced: भुगतान योग्य, DRT समर्थन और वित्तीय सुरक्षा के साथ। अध्याय 17। Domain 1।

**Snow Family** — offline bulk data transfer के लिए भौतिक उपकरण (Snowball Edge: 80 TB) — हाईवे पर गाड़ी चलाने के बजाय एक cargo flight चार्टर करना। विरासत (2026): Snowmobile और Snowcone बंद; Snow उपकरण नवंबर 2025 में नए ग्राहकों के लिए बंद (AWS DataSync और Data Transfer Terminals की ओर इशारा करता है), लेकिन SAA-C03 परीक्षा अभी भी "weeks of transfer, limited bandwidth" के लिए Snowball की अपेक्षा करती है। अध्याय 25। Domain 3।

**SNS (Simple Notification Service)** — Pub/sub messaging। एक साथ सभी subscribers को messages push करता है। Fan-out pattern। अध्याय 19। Domain 2।

**Sort key (DynamoDB)** — प्राथमिक key का वैकल्पिक दूसरा घटक। एक partition के भीतर range queries सक्षम करता है। अध्याय 9। Domain 3।

**Spot Instances** — 60-90% छूट पर अतिरिक्त capacity का उपयोग करने वाले EC2 instances। 2-मिनट की सूचना के साथ बाधित किया जा सकता है। केवल fault-tolerant workloads के लिए। अध्याय 27। Domain 4।

**SQS (Simple Queue Service)** — प्रबंधित message queue। producers को consumers से decouple करता है। Standard (at-least-once) और FIFO (exactly-once) queues। अध्याय 19। Domain 2।

**Step Functions** — Serverless workflow orchestration सेवा। AWS सेवाओं के समन्वय के लिए state machines। अध्याय 22। Domain 2।

**AWS Storage Gateway** — ऑन-प्रिमाइसेस और cloud storage के बीच पुल: स्थानीय रूप से NFS/SMB (File), iSCSI (Volume), या virtual tape (Tape) interfaces प्रस्तुत करता है जबकि डेटा को S3, Glacier, या EBS snapshots में बनाए रखता है। अध्याय 6। Domain 3।

---

## T

**Target tracking scaling** — Auto Scaling policy जो एक target metric value (उदा. 60% CPU utilization) बनाए रखने के लिए capacity समायोजित करती है। अध्याय 7। Domain 2।

**AWS Transfer Family** — S3 या EFS द्वारा समर्थित प्रबंधित SFTP/FTPS/FTP endpoint। Partners अपने मौजूदा SFTP clients रखते हैं; फ़ाइलें सीधे आपके bucket में पहुँचती हैं। अध्याय 25। Domain 3।

**Transit Gateway** — एक केंद्रीय gateway के माध्यम से कई VPCs और ऑन-प्रिमाइसेस नेटवर्कों को जोड़ने वाली hub-and-spoke नेटवर्क topology। अध्याय 25। Domain 3।

**TTL (Time to Live)** — एक timestamp जिसके बाद DynamoDB एक item को स्वचालित रूप से हटा देता है। DNS में भी उपयोग किया जाता है (resolvers एक record को कितनी देर cache करते हैं) और caching में (एक cached value कितनी देर मान्य है)। अध्याय 9, 12। Domain 3।

---

## V

**VIF (Virtual Interface)** — AWS Direct Connect के साथ उपयोग किया जाने वाला logical कनेक्शन। Public VIF AWS public endpoints तक पहुँचता है; Private VIF VPC resources तक पहुँचता है। अध्याय 25। Domain 3।

**Visibility timeout (SQS)** — वह अवधि जिसके दौरान एक प्राप्त message अन्य consumers से छिपा रहता है। अन्य consumers द्वारा एक ही message देखे बिना processing की अनुमति देता है। अध्याय 19। Domain 2।

**VPC (Virtual Private Cloud)** — AWS में एक पृथक वर्चुअल नेटवर्क। subnets, route tables, और gateways शामिल हैं। अध्याय 11। Domain 1।

**VPC Endpoint** — AWS private नेटवर्क के माध्यम से VPC resources को AWS सेवाओं से जोड़ता है। Gateway (मुफ़्त, S3/DynamoDB) और Interface (मूल्य निर्धारित, अधिकांश अन्य सेवाएँ)। अध्याय 30। Domain 1, 4।

**VPC Flow Logs** — एक VPC में network interfaces से आने-जाने वाले IP ट्रैफ़िक के बारे में जानकारी कैप्चर करता है। GuardDuty द्वारा और network troubleshooting के लिए उपयोग किया जाता है। अध्याय 17। Domain 1।

**VPC Peering** — दो VPCs के बीच एक नेटवर्क कनेक्शन जो उन्हें private IP addresses का उपयोग करके उनके बीच ट्रैफ़िक रूट करने में सक्षम बनाता है। अध्याय 11। Domain 3।

---

## W

**WAF (Web Application Firewall)** — rules (IP blocks, SQL injection, rate limits) का उपयोग करके HTTP/HTTPS ट्रैफ़िक फ़िल्टर करता है। CloudFront, ALB, या API Gateway से जुड़ता है। अध्याय 17। Domain 1।

**AWS Wavelength** — radio edge पर 5G दूरसंचार प्रदाताओं के नेटवर्क के भीतर तैनात AWS इन्फ्रास्ट्रक्चर। मोबाइल devices के लिए single-digit मिलीसेकंड latency सक्षम करता है। 5G edge पर mobile AR/VR, real-time gaming, autonomous vehicle telemetry, और live video के लिए। Wavelength Zones दूरसंचार नेटवर्कों के भीतर AWS Regions के विस्तार हैं। अध्याय 2। Domain 3।

**Well-Architected Framework** — AWS का छह-स्तंभ मूल्यांकन framework: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability। अध्याय 31। Cross-domain।

**Weighted routing (Route 53)** — weight के अनुसार endpoints में DNS queries वितरित करता है। blue-green deployments और A/B testing के लिए उपयोग किया जाता है। अध्याय 12। Domain 3।

**Write-through caching** — जब भी database अपडेट होता है तब cache अपडेट करता है। डेटा हमेशा सुसंगत होता है लेकिन cache कई items रख सकता है जो कभी फिर से नहीं पढ़े जाते। अध्याय 10। Domain 3।

---

## SAA-C03 त्वरित पैटर्न संदर्भ

| यदि परीक्षा कहती है...                          | सोचें...                                      |
|-----------------------------------------------|----------------------------------------------|
| "Decouple services"                           | SQS, SNS, EventBridge                        |
| "Fan-out to multiple consumers"               | SNS + SQS subscriptions                      |
| "Real-time ordered events"                    | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Global low latency (dynamic)"                | Global Accelerator                           |
| "Global low latency (static/cached)"          | CloudFront                                   |
| "DDoS protection"                             | Shield (Standard: मुफ़्त; Advanced: भुगतान)   |
| "Block SQL injection at edge"                 | WAF                                          |
| "Detect compromised credentials"              | GuardDuty                                    |
| "Audit API activity"                          | CloudTrail                                   |
| "Rotate database credentials"                 | Secrets Manager                              |
| "Encrypt data at rest, customer-managed keys" | KMS with CMK                                 |
| "Store configuration values"                  | SSM Parameter Store                          |
| "High IOPS database storage"                  | io2 EBS                                      |
| "Shared file system for EC2"                  | EFS                                          |
| "Query S3 data with SQL"                      | Athena                                       |
| "ETL pipeline for analytics"                  | AWS Glue                                     |
| "Deliver streaming data to S3"                | Amazon Data Firehose                         |
| "Fault-tolerant batch jobs, minimize cost"    | Spot Instances                               |
| "Committed, stable production workload"       | Savings Plans                                |
| "Private subnet → S3 without NAT"             | S3 Gateway Endpoint                          |
| "Private subnet → SQS without NAT"            | SQS Interface Endpoint                       |
| "Multi-AZ for RDS"                            | Automatic failover (read scaling नहीं)        |
| "Read Replica for RDS"                        | Read scaling (automatic failover नहीं)        |
| "Recovery time of 1–2 minutes, cross-AZ"      | Multi-AZ (RDS failover: 60–120 सेकंड)         |
| "Recovery across regions, minutes RTO"        | Pilot Light या Warm Standby                  |
| "Active-Active, zero RTO"                     | Multi-Region Active-Active (सबसे जटिल)        |
| "Batch processing beyond Lambda timeout"      | AWS Batch                                    |
| "Redis-compatible AND durable"                | MemoryDB for Redis                           |
| "Remote engineers access VPC from home"       | Client VPN                                   |
| "Migrate database with minimal downtime"      | DMS (+ heterogeneous के लिए SCT)              |
| "BI dashboard on AWS"                         | QuickSight                                   |
| "Run AWS in your own data center"             | Outposts                                     |
| "5G mobile edge compute"                      | Wavelength                                   |
