# परिशिष्ट B: SAA-C03 डोमेन मानचित्र

AWS Solutions Architect Associate परीक्षा (SAA-C03) चार डोमेन में व्यवस्थित है। यह परिशिष्ट पुस्तक के प्रत्येक अध्याय को संबंधित डोमेन और task से मैप करता है, ताकि आप अध्याय क्रम के बजाय परीक्षा क्षेत्र के अनुसार अध्ययन कर सकें।

---

## डोमेन अवलोकन

| डोमेन                                          | भार    | विवरण                                                  |
|------------------------------------------------|--------|--------------------------------------------------------|
| Domain 1: Design Secure Architectures          | 30%    | IAM, network security, data protection                 |
| Domain 2: Design Resilient Architectures       | 26%    | High availability, fault tolerance, disaster recovery  |
| Domain 3: Design High-Performing Architectures | 24%    | Compute, storage, database, network performance        |
| Domain 4: Design Cost-Optimized Architectures  | 20%    | Pricing models, cost management, resource optimization |

---

## Domain 1: Design Secure Architectures (30%)

**Task 1.1 — Design secure access to AWS resources**

मूल अवधारणाएँ: IAM users, groups, roles, policies। Principle of least privilege। Cross-account access। Service roles। AWS Organizations में SCP (Service Control Policies)।

| अध्याय     | विषय                                                                          |
|------------|------------------------------------------------------------------------------|
| अध्याय 3   | IAM मूल बातें: users, groups, roles, policies, policy evaluation               |
| अध्याय 14  | IAM उन्नत: सेवाओं के लिए roles, permission boundaries, cross-account roles      |
| अध्याय 3   | Policy evaluation logic: explicit deny > explicit allow > implicit deny        |
| अध्याय 14  | AWS Organizations, SCPs, Control Tower, Account Factory                        |
| अध्याय 14  | Cognito: User Pools (app sign-in, JWTs) और Identity Pools (अस्थायी AWS credentials) |

मुख्य परीक्षा पैटर्न:

- "EC2 needs to access S3 without hardcoded credentials" → EC2 instance profile से जुड़ी S3 policy वाला IAM role
- "Different accounts need to share resources" → cross-account trust policy वाला IAM role
- "Prevent all IAM users in an OU from accessing a service" → AWS Organizations में SCP

---

**Task 1.2 — Design secure workloads and applications**

मूल अवधारणाएँ: VPC design, security groups बनाम NACLs, network isolation, DDoS protection, WAF, GuardDuty।

| अध्याय     | विषय                                                                                        |
|------------|--------------------------------------------------------------------------------------------|
| अध्याय 11  | VPC design: public/private subnets, NAT Gateway, Internet Gateway, route tables             |
| अध्याय 15  | Security groups (stateful, instance-level) बनाम NACLs (stateless, subnet-level)             |
| अध्याय 17  | Shield (DDoS), WAF (app firewall), GuardDuty (threat detection), Inspector (CVE scanning)   |
| अध्याय 17  | Macie: S3 में संवेदनशील डेटा खोज (PII, credentials)                                          |
| अध्याय 25  | Direct Connect, VPN, Transit Gateway, PrivateLink                                           |

मुख्य परीक्षा पैटर्न:

- "Block a specific IP from the subnet" → NACL deny rule
- "Allow HTTP in, automatically allow HTTP response out" → Security group (stateful)
- "Protect web application from SQL injection" → SQL injection rule के साथ WAF
- "Detect compromised IAM credentials" → GuardDuty

---

**Task 1.3 — Determine appropriate data security controls**

मूल अवधारणाएँ: Encryption at rest और in transit, KMS, Secrets Manager, Parameter Store, S3 server-side encryption।

| अध्याय     | विषय                                                                     |
|------------|--------------------------------------------------------------------------|
| अध्याय 16  | KMS: customer-managed keys, key rotation, envelope encryption             |
| अध्याय 16  | Secrets Manager: स्वचालित credential rotation, runtime secret retrieval   |
| अध्याय 16  | ACM (AWS Certificate Manager): ALB, CloudFront के लिए SSL/TLS certificates |
| अध्याय 5   | S3 encryption विकल्प: SSE-S3, SSE-KMS, SSE-C                              |
| अध्याय 8   | RDS encryption at rest (निर्माण के समय सक्षम होना चाहिए)                  |

मुख्य परीक्षा पैटर्न:

- "Rotate database credentials automatically" → RDS एकीकरण के साथ Secrets Manager
- "Control who can use encryption keys across accounts" → KMS key policy
- "Store non-secret configuration values" → SSM Parameter Store (Secrets Manager नहीं)
- "Encrypt S3 objects with company-managed keys" → CMK के साथ SSE-KMS

---

## Domain 2: Design Resilient Architectures (26%)

**Task 2.1 — Design scalable and loosely coupled architectures**

मूल अवधारणाएँ: Auto Scaling, load balancers, SQS/SNS decoupling, Lambda event triggers, ECS/EKS, Step Functions।

| अध्याय     | विषय                                                               |
|------------|--------------------------------------------------------------------|
| अध्याय 7   | Auto Scaling Groups, Application Load Balancer, scaling policies    |
| अध्याय 19  | SQS (queues के साथ decoupling), SNS (fan-out notifications)         |
| अध्याय 20  | Lambda: serverless compute, event triggers, concurrency            |
| अध्याय 20  | API Gateway: प्रबंधित REST/HTTP/WebSocket APIs, अकेले या + Lambda   |
| अध्याय 21  | ECS और EKS: containerized microservices                            |
| अध्याय 22  | Step Functions: workflow orchestration                             |
| अध्याय 26  | Kinesis: real-time data streaming                                  |

मुख्य परीक्षा पैटर्न:

- "Decouple order processing from inventory update" → सेवाओं के बीच SQS queue
- "Notify multiple services when a new order is placed" → SQS subscriptions के साथ SNS topic (fan-out)
- "Process S3 uploads automatically" → S3 event notification → Lambda
- "Run a multi-step workflow with retry logic" → Step Functions

---

**Task 2.2 — Design highly available and/or fault-tolerant architectures**

मूल अवधारणाएँ: Multi-AZ, Multi-Region, Route 53 failover, RDS read replicas, Aurora Global Database, backup और restore।

| अध्याय     | विषय                                                                                          |
|------------|----------------------------------------------------------------------------------------------|
| अध्याय 2   | AWS global infrastructure: Regions, AZs, edge locations                                       |
| अध्याय 7   | कई AZs में ALB, ASG अस्वस्थ instances को बदलता है                                              |
| अध्याय 8   | RDS Multi-AZ: synchronous प्रतिकृति, स्वचालित failover                                        |
| अध्याय 12  | Route 53: failover routing, latency routing, health checks                                    |
| अध्याय 18  | Multi-AZ बनाम Multi-Region: RTO/RPO, DR रणनीतियाँ (pilot light, warm standby, active-active)   |
| अध्याय 18  | AWS Backup (केंद्रीकृत, cross-account backups), Elastic Disaster Recovery (प्रबंधित pilot light) |
| अध्याय 24  | Aurora Global Database: cross-region read replicas, < 1s प्रतिकृति लैग                         |

मुख्य परीक्षा पैटर्न:

- "Automatically failover if primary RDS fails" → RDS Multi-AZ (Read Replica नहीं)
- "Serve reads globally with low latency" → Aurora Global Database
- "Route traffic to secondary region if primary is unavailable" → Failover routing + health checks के साथ Route 53
- "RTO of 1 minute, RPO of 0" → Multi-AZ deployment (Multi-Region नहीं)
- "RTO of 15 minutes, cross-region" → Pilot Light रणनीति

---

## Domain 3: Design High-Performing Architectures (24%)

**Task 3.1 — Determine high-performing and/or scalable storage solutions**

मूल अवधारणाएँ: S3 बनाम EBS बनाम EFS, storage class चयन, S3 Transfer Acceleration, multipart upload, assets के लिए CloudFront।

| अध्याय     | विषय                                                                    |
|------------|-------------------------------------------------------------------------|
| अध्याय 5   | S3: object storage, storage classes, versioning, lifecycle              |
| अध्याय 6   | EBS: block storage types (gp3, io2, st1), EFS: shared file storage      |
| अध्याय 6   | Storage Gateway: hybrid on-premises से S3 bridge (File, Volume, Tape)   |
| अध्याय 23  | S3 storage class transitions, Glacier retrieval विकल्प                  |
| अध्याय 25  | DataSync (online file sync), Transfer Family (managed SFTP→S3), Snow Family (offline bulk transfer — विरासत: नवंबर 2025 में नए ग्राहकों के लिए बंद; AWS अब DataSync और Data Transfer Terminals की ओर इशारा करता है), MGN (server rehost) |
| अध्याय 28  | EBS right-sizing, gp2→gp3 migration, snapshot management                |

मुख्य परीक्षा पैटर्न:

- "Shared file system accessible from multiple EC2 instances" → EFS (EBS नहीं; EBS एक instance से जुड़ता है)
- "High IOPS for database workload" → io2 EBS
- "Reduce cost for files not accessed in 90 days" → S3 lifecycle policy → Glacier
- "Upload large files from distant locations faster" → S3 Transfer Acceleration
- "Weeks of transfer over limited bandwidth" → Snow Family के 2025 में नए ग्राहकों के लिए बंद होने के बावजूद SAA-C03 परीक्षा अभी भी Snowball की अपेक्षा करती है

---

**Task 3.2 — Determine high-performing and/or scalable compute solutions**

मूल अवधारणाएँ: EC2 instance families, Graviton processors, Auto Scaling, Lambda, Fargate, Spot Instances।

| अध्याय     | विषय                                                                                     |
|------------|-----------------------------------------------------------------------------------------|
| अध्याय 4   | EC2 instance types: compute-optimized (c), memory-optimized (r), general purpose (m, t)  |
| अध्याय 7   | Auto Scaling: web tiers के लिए horizontal scaling                                        |
| अध्याय 20  | Lambda: concurrency, provisioned concurrency (सुसंगत latency के लिए)                      |
| अध्याय 21  | ECS Fargate: serverless containers                                                       |
| अध्याय 21  | AWS Batch: Docker containers के लिए प्रबंधित बैच कंप्यूट, Spot-backed                     |
| अध्याय 27  | fault-tolerant बैच workloads के लिए Spot Instances                                        |

मुख्य परीक्षा पैटर्न:

- "ML training workload, minimize cost, can be interrupted" → Spot Instances
- "Consistent sub-100ms Lambda response" → Provisioned concurrency (cold start समाप्त करता है)
- "Containerized microservice, no infrastructure management" → ECS Fargate

---

**Task 3.3 — Determine high-performing database solutions**

मूल अवधारणाएँ: RDS बनाम DynamoDB बनाम Aurora बनाम Redshift बनाम ElastiCache, access patterns, read replicas, DAX।

| अध्याय     | विषय                                                               |
|------------|--------------------------------------------------------------------|
| अध्याय 8   | RDS: प्रबंधित रिलेशनल डेटाबेस, RDBMS कब उपयोग करें                  |
| अध्याय 9   | DynamoDB: NoSQL, partition keys, GSI, DAX (in-memory cache)        |
| अध्याय 10  | ElastiCache: Redis बनाम Memcached, cache रणनीतियाँ                  |
| अध्याय 10  | MemoryDB for Redis: टिकाऊ Redis-संगत primary database              |
| अध्याय 24  | Aurora: performance, Serverless v2, read replicas, Global Database |
| अध्याय 29  | DynamoDB on-demand बनाम provisioned capacity with Auto Scaling     |

मुख्य परीक्षा पैटर्न:

- "Microsecond reads for a session store" → ElastiCache Redis या DAX (यदि DynamoDB backend)
- "High-throughput key-value access with flexible schema" → DynamoDB
- "Complex joins and ACID transactions" → Aurora या RDS
- "Analytics on petabytes of structured data" → Redshift (विस्तार से कवर नहीं लेकिन संकेत: "data warehouse" → Redshift)

---

**Task 3.4 — Determine high-performing and/or scalable network architectures**

मूल अवधारणाएँ: CloudFront, Global Accelerator, Direct Connect, VPN, placement groups, enhanced networking।

| अध्याय     | विषय                                                               |
|------------|--------------------------------------------------------------------|
| अध्याय 7   | NLB (Layer 4) और GWLB (network appliances के लिए Gateway Load Balancer) |
| अध्याय 11  | Client VPN: व्यक्तिगत device से VPC encrypted access               |
| अध्याय 12  | Route 53: routing policies: latency-based, geolocation, weighted   |
| अध्याय 13  | CloudFront: CDN, edge caching, Lambda@Edge                         |
| अध्याय 25  | AWS Global Accelerator: AWS backbone पर Anycast routing            |
| अध्याय 25  | Direct Connect: समर्पित private connectivity                       |
| अध्याय 30  | VPC Endpoints: AWS सेवाओं से private connectivity                  |

मुख्य परीक्षा पैटर्न:

- "Reduce latency for global users accessing dynamic API responses" → Global Accelerator (CloudFront नहीं, जो cacheable सामग्री के लिए सर्वोत्तम है)
- "Reduce latency for static assets globally" → CloudFront
- "Consistent private connectivity to AWS from on-premises" → Direct Connect
- "Fast upload from customers worldwide to your S3 bucket" → S3 Transfer Acceleration

---

**Task 3.5 — Determine high-performing data ingestion and transformation solutions**

मूल अवधारणाएँ: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR।

| अध्याय     | विषय                                                                |
|------------|---------------------------------------------------------------------|
| अध्याय 26  | Kinesis Data Streams: real-time ordered event processing            |
| अध्याय 26  | Amazon Data Firehose (पूर्व-Kinesis Data Firehose): S3, Redshift, OpenSearch में प्रबंधित delivery |
| अध्याय 26  | AWS Glue: serverless ETL, Data Catalog, Crawlers                    |
| अध्याय 26  | Athena: S3 पर serverless SQL                                        |
| अध्याय 26  | QuickSight: प्रबंधित BI dashboards, SPICE in-memory engine          |
| अध्याय 26  | Lake Formation: fine-grained data lake access control               |

मुख्य परीक्षा पैटर्न:

- "Process click-stream data in real time" → Kinesis Data Streams + Lambda या Managed Service for Apache Flink (पूर्व में Kinesis Data Analytics)
- "Deliver streaming data to S3 for later analysis" → Amazon Data Firehose
- "Transform and catalog data from multiple sources" → AWS Glue
- "Query historical data stored in S3 with SQL" → Athena

---

## Domain 4: Design Cost-Optimized Architectures (20%)

**Task 4.1 — Design cost-optimized storage solutions**

| अध्याय     | विषय                                                               |
|------------|--------------------------------------------------------------------|
| अध्याय 23  | S3 lifecycle policies, storage class transitions                   |
| अध्याय 28  | EBS right-sizing, gp2→gp3 migration, S3 versioning lifecycle rules |
| अध्याय 28  | EFS Intelligent-Tiering, cost allocation tags, AWS Budgets         |

मुख्य परीक्षा पैटर्न:

- "Identify which team is generating the most S3 costs" → Cost allocation tags + Cost Explorer
- "Reduce costs for rarely-accessed objects automatically" → S3 Intelligent-Tiering
- "Alert when monthly costs exceed $10,000" → AWS Budgets

---

**Task 4.2 — Design cost-optimized compute solutions**

| अध्याय     | विषय                                                                             |
|------------|----------------------------------------------------------------------------------|
| अध्याय 2   | Outposts: on-premises AWS rack (capital cost बनाम cloud opex trade-off)           |
| अध्याय 2   | Wavelength: 5G edge compute (telecom partnership, latency-driven placement)       |
| अध्याय 27  | EC2 pricing: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts  |
| अध्याय 20  | Lambda: प्रति invocation भुगतान (शून्य idle cost)                                 |

मुख्य परीक्षा पैटर्न:

- "Reduce cost for steady-state production workloads" → Savings Plans (अधिक लचीला) या Reserved Instances
- "Minimize cost for batch jobs that can be interrupted" → Spot Instances
- "Event-driven processing with zero idle cost" → Lambda

---

**Task 4.3 — Design cost-optimized database solutions**

| अध्याय     | विषय                                              |
|------------|---------------------------------------------------|
| अध्याय 29  | DynamoDB on-demand बनाम provisioned + Auto Scaling |
| अध्याय 29  | RDS और ElastiCache Reserved Instances/Nodes        |
| अध्याय 29  | RDS snapshot management                            |

मुख्य परीक्षा पैटर्न:

- "Unpredictable DynamoDB traffic" → On-demand capacity mode
- "Consistent DynamoDB traffic with known peaks" → Provisioned + Auto Scaling
- "Reduce RDS costs for stable workload" → Reserved Instances (1- या 3-वर्ष)

---

**Task 4.4 — Design cost-optimized network architectures**

| अध्याय     | विषय                                                                                          |
|------------|-----------------------------------------------------------------------------------------------|
| अध्याय 30  | Data transfer pricing: inbound (मुफ़्त), cross-AZ ($0.01/GB), cross-region, internet ($0.09/GB) |
| अध्याय 30  | NAT Gateway ($0.045/GB) बनाम VPC Endpoints (Gateway: मुफ़्त; Interface: मूल्य निर्धारित)        |
| अध्याय 30  | data transfer cost optimizer के रूप में CloudFront                                              |

मुख्य परीक्षा पैटर्न:

- "EC2 in private subnet calls S3 — eliminate NAT Gateway costs" → S3 Gateway Endpoint (मुफ़्त)
- "EC2 in private subnet calls SQS — reduce NAT Gateway costs" → SQS Interface Endpoint
- "Reduce data transfer costs for global content delivery" → CloudFront (caching origin requests कम करता है)

---

## क्रॉस-डोमेन विषय

कुछ विषय कई डोमेन में दिखाई देते हैं:

| विषय                                | डोमेन   | अध्याय       |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | सभी     | 31           |
| Architecture reviews और ADRs       | सभी     | 32           |
| Trade-off reasoning ("it depends") | सभी     | 33           |
| Multi-AZ design                    | 2, 3    | 7, 8, 18, 24 |
| Monitoring और observability        | 1, 2    | पूरे में     |
| CloudFront                         | 3, 4    | 13, 30       |

---

## परीक्षा-पूर्व चेकलिस्ट

SAA-C03 में बैठने से पहले:

**उच्च-भार वाले क्षेत्र (दिखाई देने की सबसे अधिक संभावना)**

- [ ] IAM policy evaluation logic (explicit deny → explicit allow → implicit deny)
- [ ] VPC components: subnets, route tables, IGW, NAT Gateway, security groups, NACLs
- [ ] S3 storage classes और प्रत्येक का उपयोग कब करें
- [ ] RDS Multi-AZ बनाम Read Replica (failover बनाम read scaling)
- [ ] SQS बनाम SNS बनाम EventBridge (pull बनाम push बनाम event routing)
- [ ] EC2 pricing models: fault-tolerant के लिए Spot, committed workloads के लिए Savings Plans
- [ ] Lambda triggers और concurrency
- [ ] DynamoDB बनाम Aurora बनाम Redshift (access pattern चयन निर्धारित करता है)
- [ ] CloudFront: static के लिए CDN, dynamic के लिए Global Accelerator

**सामान्य जाल**

- [ ] EBS एक instance से जुड़ता है; EFS साझा है
- [ ] RDS Read Replicas read scaling के लिए हैं, स्वचालित failover के लिए नहीं (वह Multi-AZ है)
- [ ] NACLs stateless हैं (inbound और outbound दोनों rules चाहिए)
- [ ] Gateway Endpoints मुफ़्त हैं और केवल S3 और DynamoDB के लिए
- [ ] Kinesis retain और replay करता है; SQS consumption पर हटा देता है
- [ ] "Decouple" का हमेशा मतलब SQS नहीं होता — SNS fan-out और EventBridge भी decoupling patterns हैं
- [ ] Shield Standard मुफ़्त और स्वचालित है; Advanced एक भुगतान योग्य subscription है
- [ ] ElastiCache बनाम MemoryDB: ElastiCache = cache (डेटा हानि ठीक)। MemoryDB = टिकाऊ primary database।
- [ ] Client VPN बनाम Site-to-Site VPN: Client VPN = व्यक्तिगत devices। Site-to-Site = network-to-network।
- [ ] Outposts बनाम Wavelength: Outposts = on-premises AWS rack। Wavelength = 5G edge।
- [ ] DMS: homogeneous = DMS direct। Heterogeneous = पहले SCT, फिर DMS।
- [ ] DataSync *files* ले जाता है; DMS *databases* ले जाता है; MGN *whole servers* ले जाता है।

**परीक्षा संरचना**

- 65 प्रश्न, 130 मिनट (2 घंटे 10 मिनट)
- Multiple choice (एक सही) और multiple response (N सही चुनें)
- उत्तीर्ण स्कोर: 1000 में से 720
- Unscored प्रश्न embedded हैं; आप नहीं बता सकते कि वे कौन से हैं
- समय प्रबंधन: ~2 मिनट प्रति प्रश्न; कठिन प्रश्नों को flag करें और वापस लौटें
