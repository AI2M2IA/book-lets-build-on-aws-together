# Appendix B: SAA-C03 Domain Map

The AWS Solutions Architect Associate exam (SAA-C03) is organized into four domains. This appendix maps every chapter in the book to the relevant domain and task, so you can study by exam area rather than by chapter order.

---

## Domain Overview

| Domain                                         | Weight | Description                                            |
|------------------------------------------------|--------|--------------------------------------------------------|
| Domain 1: Design Secure Architectures          | 30%    | IAM, network security, data protection                 |
| Domain 2: Design Resilient Architectures       | 26%    | High availability, fault tolerance, disaster recovery  |
| Domain 3: Design High-Performing Architectures | 24%    | Compute, storage, database, network performance        |
| Domain 4: Design Cost-Optimized Architectures  | 20%    | Pricing models, cost management, resource optimization |

---

## Domain 1: Design Secure Architectures (30%)

**Task 1.1 — Design secure access to AWS resources**

Core concepts: IAM users, groups, roles, policies. Principle of least privilege. Cross-account access. Service roles. SCP (Service Control Policies) in AWS Organizations.

| Chapter    | Topic                                                                        |
|------------|------------------------------------------------------------------------------|
| Chapter 3  | IAM fundamentals: users, groups, roles, policies, policy evaluation          |
| Chapter 14 | IAM advanced: roles for services, permission boundaries, cross-account roles |
| Chapter 3  | Policy evaluation logic: explicit deny > explicit allow > implicit deny      |
| Chapter 14 | AWS Organizations, SCPs, Control Tower, Account Factory                      |
| Chapter 14 | Cognito: User Pools (app sign-in, JWTs) and Identity Pools (temporary AWS credentials) |

Key exam patterns:

- "EC2 needs to access S3 without hardcoded credentials" → IAM role with S3 policy attached to EC2 instance profile
- "Different accounts need to share resources" → IAM role with cross-account trust policy
- "Prevent all IAM users in an OU from accessing a service" → SCP in AWS Organizations

---

**Task 1.2 — Design secure workloads and applications**

Core concepts: VPC design, security groups vs. NACLs, network isolation, DDoS protection, WAF, GuardDuty.

| Chapter    | Topic                                                                                      |
|------------|--------------------------------------------------------------------------------------------|
| Chapter 11 | VPC design: public/private subnets, NAT Gateway, Internet Gateway, route tables            |
| Chapter 15 | Security groups (stateful, instance-level) vs. NACLs (stateless, subnet-level)             |
| Chapter 17 | Shield (DDoS), WAF (app firewall), GuardDuty (threat detection), Inspector (CVE scanning)  |
| Chapter 17 | Macie: sensitive data discovery in S3 (PII, credentials)                                   |
| Chapter 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                          |

Key exam patterns:

- "Block a specific IP from the subnet" → NACL deny rule
- "Allow HTTP in, automatically allow HTTP response out" → Security group (stateful)
- "Protect web application from SQL injection" → WAF with SQL injection rule
- "Detect compromised IAM credentials" → GuardDuty

---

**Task 1.3 — Determine appropriate data security controls**

Core concepts: Encryption at rest and in transit, KMS, Secrets Manager, Parameter Store, S3 server-side encryption.

| Chapter    | Topic                                                                    |
|------------|--------------------------------------------------------------------------|
| Chapter 16 | KMS: customer-managed keys, key rotation, envelope encryption            |
| Chapter 16 | Secrets Manager: automatic credential rotation, runtime secret retrieval |
| Chapter 16 | ACM (AWS Certificate Manager): SSL/TLS certificates for ALB, CloudFront  |
| Chapter 5  | S3 encryption options: SSE-S3, SSE-KMS, SSE-C                            |
| Chapter 8  | RDS encryption at rest (must be enabled at creation)                     |

Key exam patterns:

- "Rotate database credentials automatically" → Secrets Manager with RDS integration
- "Control who can use encryption keys across accounts" → KMS key policy
- "Store non-secret configuration values" → SSM Parameter Store (not Secrets Manager)
- "Encrypt S3 objects with company-managed keys" → SSE-KMS with CMK

---

## Domain 2: Design Resilient Architectures (26%)

**Task 2.1 — Design scalable and loosely coupled architectures**

Core concepts: Auto Scaling, load balancers, SQS/SNS decoupling, Lambda event triggers, ECS/EKS, Step Functions.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 7  | Auto Scaling Groups, Application Load Balancer, scaling policies   |
| Chapter 19 | SQS (decoupling with queues), SNS (fan-out notifications)          |
| Chapter 20 | Lambda: serverless compute, event triggers, concurrency            |
| Chapter 20 | API Gateway: managed REST/HTTP/WebSocket APIs, standalone or + Lambda |
| Chapter 21 | ECS and EKS: containerized microservices                           |
| Chapter 22 | Step Functions: workflow orchestration                             |
| Chapter 26 | Kinesis: real-time data streaming                                  |

Key exam patterns:

- "Decouple order processing from inventory update" → SQS queue between services
- "Notify multiple services when a new order is placed" → SNS topic with SQS subscriptions (fan-out)
- "Process S3 uploads automatically" → S3 event notification → Lambda
- "Run a multi-step workflow with retry logic" → Step Functions

---

**Task 2.2 — Design highly available and/or fault-tolerant architectures**

Core concepts: Multi-AZ, Multi-Region, Route 53 failover, RDS read replicas, Aurora Global Database, backup and restore.

| Chapter    | Topic                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| Chapter 2  | AWS global infrastructure: Regions, AZs, edge locations                                      |
| Chapter 7  | ALB across multiple AZs, ASG replaces unhealthy instances                                    |
| Chapter 8  | RDS Multi-AZ: synchronous replication, automatic failover                                    |
| Chapter 12 | Route 53: failover routing, latency routing, health checks                                   |
| Chapter 18 | Multi-AZ vs. Multi-Region: RTO/RPO, DR strategies (pilot light, warm standby, active-active) |
| Chapter 18 | AWS Backup (centralized, cross-account backups), Elastic Disaster Recovery (managed pilot light) |
| Chapter 24 | Aurora Global Database: cross-region read replicas, < 1s replication lag                     |

Key exam patterns:

- "Automatically failover if primary RDS fails" → RDS Multi-AZ (not Read Replica)
- "Serve reads globally with low latency" → Aurora Global Database
- "Route traffic to secondary region if primary is unavailable" → Route 53 with Failover routing + health checks
- "RTO of 1 minute, RPO of 0" → Multi-AZ deployment (not Multi-Region)
- "RTO of 15 minutes, cross-region" → Pilot Light strategy

---

## Domain 3: Design High-Performing Architectures (24%)

**Task 3.1 — Determine high-performing and/or scalable storage solutions**

Core concepts: S3 vs. EBS vs. EFS, storage class selection, S3 Transfer Acceleration, multipart upload, CloudFront for assets.

| Chapter    | Topic                                                                   |
|------------|-------------------------------------------------------------------------|
| Chapter 5  | S3: object storage, storage classes, versioning, lifecycle              |
| Chapter 6  | EBS: block storage types (gp3, io2, st1), EFS: shared file storage      |
| Chapter 6  | Storage Gateway: hybrid on-premises to S3 bridge (File, Volume, Tape)   |
| Chapter 23 | S3 storage class transitions, Glacier retrieval options                 |
| Chapter 25 | DataSync (online file sync), Transfer Family (managed SFTP→S3), Snow Family (offline bulk transfer — legacy: closed to new customers in November 2025; AWS now points to DataSync and Data Transfer Terminals), MGN (server rehost) |
| Chapter 28 | EBS right-sizing, gp2→gp3 migration, snapshot management                |

Key exam patterns:

- "Shared file system accessible from multiple EC2 instances" → EFS (not EBS; EBS attaches to one instance)
- "High IOPS for database workload" → io2 EBS
- "Reduce cost for files not accessed in 90 days" → S3 lifecycle policy → Glacier
- "Upload large files from distant locations faster" → S3 Transfer Acceleration
- "Weeks of transfer over limited bandwidth" → the SAA-C03 exam still expects Snowball, despite the Snow Family's 2025 closure to new customers

---

**Task 3.2 — Determine high-performing and/or scalable compute solutions**

Core concepts: EC2 instance families, Graviton processors, Auto Scaling, Lambda, Fargate, Spot Instances.

| Chapter    | Topic                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Chapter 4  | EC2 instance types: compute-optimized (c), memory-optimized (r), general purpose (m, t) |
| Chapter 7  | Auto Scaling: horizontal scaling for web tiers                                          |
| Chapter 20 | Lambda: concurrency, provisioned concurrency (for consistent latency)                   |
| Chapter 21 | ECS Fargate: serverless containers                                                      |
| Chapter 21 | AWS Batch: managed batch compute for Docker containers, Spot-backed                     |
| Chapter 27 | Spot Instances for fault-tolerant batch workloads                                       |

Key exam patterns:

- "ML training workload, minimize cost, can be interrupted" → Spot Instances
- "Consistent sub-100ms Lambda response" → Provisioned concurrency (eliminates cold start)
- "Containerized microservice, no infrastructure management" → ECS Fargate

---

**Task 3.3 — Determine high-performing database solutions**

Core concepts: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, access patterns, read replicas, DAX.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 8  | RDS: managed relational databases, when to use RDBMS               |
| Chapter 9  | DynamoDB: NoSQL, partition keys, GSI, DAX (in-memory cache)        |
| Chapter 10 | ElastiCache: Redis vs. Memcached, cache strategies                 |
| Chapter 10 | MemoryDB for Redis: durable Redis-compatible primary database       |
| Chapter 24 | Aurora: performance, Serverless v2, read replicas, Global Database |
| Chapter 29 | DynamoDB on-demand vs. provisioned capacity with Auto Scaling      |

Key exam patterns:

- "Microsecond reads for a session store" → ElastiCache Redis or DAX (if DynamoDB backend)
- "High-throughput key-value access with flexible schema" → DynamoDB
- "Complex joins and ACID transactions" → Aurora or RDS
- "Analytics on petabytes of structured data" → Redshift (not covered in detail but signal: "data warehouse" → Redshift)

---

**Task 3.4 — Determine high-performing and/or scalable network architectures**

Core concepts: CloudFront, Global Accelerator, Direct Connect, VPN, placement groups, enhanced networking.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 7  | NLB (Layer 4) and GWLB (Gateway Load Balancer for network appliances) |
| Chapter 11 | Client VPN: individual device to VPC encrypted access              |
| Chapter 12 | Route 53: routing policies: latency-based, geolocation, weighted   |
| Chapter 13 | CloudFront: CDN, edge caching, Lambda@Edge                         |
| Chapter 25 | AWS Global Accelerator: Anycast routing onto the AWS backbone      |
| Chapter 25 | Direct Connect: dedicated private connectivity                     |
| Chapter 30 | VPC Endpoints: private connectivity to AWS services                |

Key exam patterns:

- "Reduce latency for global users accessing dynamic API responses" → Global Accelerator (not CloudFront, which is best for cacheable content)
- "Reduce latency for static assets globally" → CloudFront
- "Consistent private connectivity to AWS from on-premises" → Direct Connect
- "Fast upload from customers worldwide to your S3 bucket" → S3 Transfer Acceleration

---

**Task 3.5 — Determine high-performing data ingestion and transformation solutions**

Core concepts: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Chapter    | Topic                                                               |
|------------|---------------------------------------------------------------------|
| Chapter 26 | Kinesis Data Streams: real-time ordered event processing            |
| Chapter 26 | Amazon Data Firehose (ex-Kinesis Data Firehose): managed delivery to S3, Redshift, OpenSearch |
| Chapter 26 | AWS Glue: serverless ETL, Data Catalog, Crawlers                    |
| Chapter 26 | Athena: serverless SQL on S3                                        |
| Chapter 26 | QuickSight: managed BI dashboards, SPICE in-memory engine           |
| Chapter 26 | Lake Formation: fine-grained data lake access control               |

Key exam patterns:

- "Process click-stream data in real time" → Kinesis Data Streams + Lambda or Managed Service for Apache Flink (formerly Kinesis Data Analytics)
- "Deliver streaming data to S3 for later analysis" → Amazon Data Firehose
- "Transform and catalog data from multiple sources" → AWS Glue
- "Query historical data stored in S3 with SQL" → Athena

---

## Domain 4: Design Cost-Optimized Architectures (20%)

**Task 4.1 — Design cost-optimized storage solutions**

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 23 | S3 lifecycle policies, storage class transitions                   |
| Chapter 28 | EBS right-sizing, gp2→gp3 migration, S3 versioning lifecycle rules |
| Chapter 28 | EFS Intelligent-Tiering, cost allocation tags, AWS Budgets         |

Key exam patterns:

- "Identify which team is generating the most S3 costs" → Cost allocation tags + Cost Explorer
- "Reduce costs for rarely-accessed objects automatically" → S3 Intelligent-Tiering
- "Alert when monthly costs exceed $10,000" → AWS Budgets

---

**Task 4.2 — Design cost-optimized compute solutions**

| Chapter    | Topic                                                                            |
|------------|----------------------------------------------------------------------------------|
| Chapter 2  | Outposts: on-premises AWS rack (capital cost vs. cloud opex trade-off)           |
| Chapter 2  | Wavelength: 5G edge compute (telecom partnership, latency-driven placement)      |
| Chapter 27 | EC2 pricing: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Chapter 20 | Lambda: pay per invocation (zero idle cost)                                      |

Key exam patterns:

- "Reduce cost for steady-state production workloads" → Savings Plans (more flexible) or Reserved Instances
- "Minimize cost for batch jobs that can be interrupted" → Spot Instances
- "Event-driven processing with zero idle cost" → Lambda

---

**Task 4.3 — Design cost-optimized database solutions**

| Chapter    | Topic                                             |
|------------|---------------------------------------------------|
| Chapter 29 | DynamoDB on-demand vs. provisioned + Auto Scaling |
| Chapter 29 | RDS and ElastiCache Reserved Instances/Nodes      |
| Chapter 29 | RDS snapshot management                           |

Key exam patterns:

- "Unpredictable DynamoDB traffic" → On-demand capacity mode
- "Consistent DynamoDB traffic with known peaks" → Provisioned + Auto Scaling
- "Reduce RDS costs for stable workload" → Reserved Instances (1- or 3-year)

---

**Task 4.4 — Design cost-optimized network architectures**

| Chapter    | Topic                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| Chapter 30 | Data transfer pricing: inbound (free), cross-AZ ($0.01/GB), cross-region, internet ($0.09/GB) |
| Chapter 30 | NAT Gateway ($0.045/GB) vs. VPC Endpoints (Gateway: free; Interface: priced)                  |
| Chapter 30 | CloudFront as data transfer cost optimizer                                                    |

Key exam patterns:

- "EC2 in private subnet calls S3 — eliminate NAT Gateway costs" → S3 Gateway Endpoint (free)
- "EC2 in private subnet calls SQS — reduce NAT Gateway costs" → SQS Interface Endpoint
- "Reduce data transfer costs for global content delivery" → CloudFront (caching reduces origin requests)

---

## Cross-Domain Topics

Some topics appear across multiple domains:

| Topic                              | Domains | Chapters     |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | All     | 31           |
| Architecture reviews and ADRs      | All     | 32           |
| Trade-off reasoning ("it depends") | All     | 33           |
| Multi-AZ design                    | 2, 3    | 7, 8, 18, 24 |
| Monitoring and observability       | 1, 2    | Throughout   |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Pre-Exam Checklist

Before sitting the SAA-C03:

**High-weight areas (most likely to appear)**

- [ ] IAM policy evaluation logic (explicit deny → explicit allow → implicit deny)
- [ ] VPC components: subnets, route tables, IGW, NAT Gateway, security groups, NACLs
- [ ] S3 storage classes and when to use each
- [ ] RDS Multi-AZ vs. Read Replica (failover vs. read scaling)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. event routing)
- [ ] EC2 pricing models: Spot for fault-tolerant, Savings Plans for committed workloads
- [ ] Lambda triggers and concurrency
- [ ] DynamoDB vs. Aurora vs. Redshift (access pattern determines choice)
- [ ] CloudFront: CDN for static, Global Accelerator for dynamic

**Common traps**

- [ ] EBS attaches to ONE instance; EFS is shared
- [ ] RDS Read Replicas are for read scaling, NOT automatic failover (that's Multi-AZ)
- [ ] NACLs are stateless (need both inbound and outbound rules)
- [ ] Gateway Endpoints are free and only for S3 and DynamoDB
- [ ] Kinesis retains and replays; SQS deletes on consumption
- [ ] "Decouple" does not always mean SQS — SNS fan-out and EventBridge are also decoupling patterns
- [ ] Shield Standard is free and automatic; Advanced is a paid subscription
- [ ] ElastiCache vs. MemoryDB: ElastiCache = cache (data loss OK). MemoryDB = durable primary database.
- [ ] Client VPN vs. Site-to-Site VPN: Client VPN = individual devices. Site-to-Site = network-to-network.
- [ ] Outposts vs. Wavelength: Outposts = on-premises AWS rack. Wavelength = 5G edge.
- [ ] DMS: homogeneous = DMS direct. Heterogeneous = SCT first, then DMS.
- [ ] DataSync moves *files*; DMS moves *databases*; MGN moves *whole servers*.

**The exam structure**

- 65 questions, 130 minutes (2 hours 10 minutes)
- Multiple choice (one correct) and multiple response (select N correct)
- Passing score: 720 out of 1000
- Unscored questions are embedded; you can't tell which ones they are
- Manage time: ~2 minutes per question; flag difficult ones and return
