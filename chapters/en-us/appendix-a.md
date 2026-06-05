# Appendix A: AWS Services Quick Reference

Every service covered in this book, in the order introduced. Use this as a study reference and a quick lookup during exam prep.

---

## Compute

**EC2 — Elastic Compute Cloud** *(Chapter 4)*

Virtual machines in the cloud. You choose the instance type (CPU, memory, storage), the operating system, and the region. You pay per hour (On-Demand), per commitment (Reserved Instances / Savings Plans), or per spare-capacity slot (Spot). The foundational compute primitive.

Key concepts: AMI (Amazon Machine Image), instance types (t3, m6g, r6g, c6g families), key pairs, instance profiles, placement groups.

Exam signal: When a scenario requires persistent, stateful, or long-running compute — EC2 or ECS. When a scenario requires short-duration, event-triggered, or zero-idle-cost compute — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Chapter 7)*

Auto Scaling Groups (ASGs) add and remove EC2 instances based on load. Application Load Balancers (ALBs) distribute traffic across instances and route by path or host. Together they form the horizontal scaling layer.

Key concepts: Launch template, scaling policies (target tracking, step, scheduled), health checks, ALB target groups, listener rules, weighted routing.

Exam signal: "Handle variable load" or "high availability across AZs" → ASG + ALB.

---

**Lambda** *(Chapter 20)*

Serverless functions. You write code; AWS runs it in response to events. No servers to manage. You pay per invocation and per millisecond of execution. Scales automatically to thousands of concurrent executions.

Key concepts: Event sources (API Gateway, S3, SQS, EventBridge, Kinesis), execution role, concurrency limits, reserved and provisioned concurrency, cold start, Layers, 15-minute max duration.

Exam signal: "Serverless," "event-driven," "short-duration tasks," "no idle cost" → Lambda.

---

**ECS — Elastic Container Service** *(Chapter 21)*

Runs Docker containers on AWS. Two launch types: EC2 (you manage the host) and Fargate (AWS manages the host). ECS manages task definitions, services, cluster scheduling, and integration with load balancers and service discovery.

Key concepts: Task definition, ECS service, Fargate vs. EC2 launch type, ECR (container registry), task IAM role, service auto scaling.

Exam signal: "Containerized workloads," "microservices," "Docker on AWS" → ECS (usually Fargate for serverless containers).

---

**EKS — Elastic Kubernetes Service** *(Chapter 21)*

Managed Kubernetes. AWS runs the control plane; you run the worker nodes (EC2 or Fargate). Use EKS when your team already uses Kubernetes or has workloads requiring Kubernetes-specific features.

Exam signal: "Kubernetes," "need to migrate existing K8s workloads" → EKS. "Just need containers without K8s overhead" → ECS.

---

**AWS Batch** *(Chapter 21)*

Managed batch compute for Docker containers. You define a job (Docker image + command), a job queue, and a compute environment (EC2 or Fargate). AWS Batch provisions and scales the compute automatically, then terminates it when the job finishes. Supports Spot Instances to reduce cost.

Key concepts: Job definition (what to run), job queue (where jobs wait), compute environment (EC2 or Fargate, On-Demand or Spot), array jobs (run many parallel copies of the same job).

Exam signal: "Batch processing that exceeds Lambda's 15-minute timeout," "finite compute jobs on containers," "HPC workloads on AWS" → AWS Batch.

---

**AWS Outposts** *(Chapter 2)*

A fully managed rack of AWS hardware installed in your own data center or co-location facility. Runs the same AWS services, APIs, and tooling as the public cloud (EC2, EBS, RDS, EKS, S3 on Outposts) but physically on-premises.

Key concepts: Same AWS APIs on-premises, AWS manages installation and patching, customer provides rack space and power, Local Gateway (LGW) connects Outposts to on-premises networks.

Exam signal: "Run AWS in your own data center," "data residency requires compute to stay on-premises," "AWS APIs with no internet dependency" → Outposts.

---

**AWS Wavelength** *(Chapter 2)*

AWS infrastructure deployed inside 5G telecommunications providers' networks. Wavelength Zones sit at the 5G network edge, enabling single-digit millisecond latency to mobile devices.

Key concepts: Wavelength Zones are extensions of AWS Regions within telecom networks, traffic stays on the carrier network between the device and the Wavelength Zone.

Exam signal: "Single-digit-millisecond latency to 5G mobile users," "mobile AR/VR," "real-time gaming on mobile," "autonomous vehicle telemetry" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Chapter 25)*

Rehost (lift-and-shift) migration service. An agent replicates source servers' disks block by block into a low-cost staging area in AWS; you launch test copies on demand; at cutover, MGN converts the replicated servers into native EC2 instances. No application changes required.

Key concepts: Block-level continuous replication, staging area, test launches before cutover, the "7 Rs" migration strategies (MGN = rehost).

Exam signal: "Migrate hundreds of VMs quickly with no code changes," "lift-and-shift servers to EC2" → MGN. DataSync moves *files*; DMS moves *databases*; MGN moves *whole servers*.

---

## Storage

**S3 — Simple Storage Service** *(Chapter 5)*

Object storage. Unlimited capacity, 99.999999999% (eleven nines) durability. Stores files as objects in buckets. Buckets live in a region. Objects can range from 0 bytes to 5TB.

Key concepts: Bucket policy, object ACL, versioning, static website hosting, presigned URLs, multipart upload, Transfer Acceleration, storage classes (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, plus S3 Express One Zone for single-AZ, latency-critical directory-bucket workloads).

Exam signal: "Store and retrieve files," "static assets," "backups," "data lake" → S3. The right storage class depends on access frequency and retrieval speed.

---

**EBS — Elastic Block Store** *(Chapter 6)*

Block storage attached to a single EC2 instance. Acts like a hard drive. Persists independently of the instance lifecycle (you can detach and re-attach). Most common types: gp3 (general purpose SSD, the default), io2 (provisioned IOPS for databases), st1 (throughput-optimized HDD for sequential reads).

Key concepts: Snapshots (incremental, stored in S3), encryption (KMS), Multi-Attach (io1/io2 only), IOPS and throughput provisioning.

Exam signal: "Persistent storage for EC2," "database storage," "requires low-latency block access" → EBS.

---

**EFS — Elastic File System** *(Chapter 6)*

Shared file system, accessible from multiple EC2 instances simultaneously. NFS protocol. Scales automatically. More expensive than EBS per GB. Storage classes include Standard, Infrequent Access, and Archive. Intelligent-Tiering moves files automatically.

Exam signal: "Shared file system," "multiple EC2 instances need the same files," "NFS" → EFS.

---

**FSx Family** *(Chapter 6)*

Managed file servers for named technologies. FSx for Windows File Server: SMB protocol, NTFS, Active Directory integration, Multi-AZ. FSx for Lustre: parallel high-performance file system for HPC/ML, presents S3 objects as files (lazy loading). FSx for NetApp ONTAP: multi-protocol (NFS + SMB + iSCSI), snapshots, SnapMirror replication. FSx for OpenZFS: low-latency NFS, instant snapshots and writable clones.

Exam signal: "SMB/Active Directory" → FSx for Windows. "HPC/ML training on S3 data" → FSx for Lustre. "NFS and SMB to the same data / NetApp migration" → FSx for ONTAP. "ZFS migration / instant clones" → FSx for OpenZFS.

---

**S3 Storage Classes and Lifecycle Policies** *(Chapter 23)*

S3 Intelligent-Tiering automatically moves objects between access tiers based on access frequency. Lifecycle policies transition objects between classes (Standard → Standard-IA → Glacier) based on age rules. Glacier storage classes have retrieval delay ranging from minutes (Glacier Instant) to 12 hours (Glacier Deep Archive).

Exam signal: "Reduce storage costs for infrequently accessed data" → lifecycle policies, Intelligent-Tiering, or Glacier.

---

**AWS Storage Gateway** *(Chapter 6)*

Hybrid storage service connecting on-premises environments to AWS storage. Presents storage over the protocols applications already understand while persisting data in S3, S3 Glacier, or as EBS snapshots.

Key concepts: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, cached or stored mode), Tape Gateway (virtual tape library → Glacier).

Exam signal: "On-premises application needs cloud storage without code changes" → Storage Gateway. "Replace tape backup" → Tape Gateway.

---

**AWS DataSync** *(Chapter 25)*

Agent-based data migration and replication service. A lightweight agent connects to on-premises file servers over NFS or SMB and synchronizes shares to S3, EFS, or FSx — with scheduling, bandwidth throttling, and integrity verification built in.

Key concepts: DataSync agent (VM on-premises or EC2), NFS/SMB sources, S3/EFS/FSx destinations, scheduled incremental transfers.

Exam signal: "Migrate or continuously sync large numbers of files from on-premises NAS to AWS over the network" → DataSync.

---

**AWS Transfer Family** *(Chapter 25)*

Fully managed SFTP, FTPS, and FTP server backed by S3 or EFS as the storage destination. Clients connect with their existing SFTP software; uploaded files land directly in a bucket or file system.

Key concepts: Managed endpoint (optionally with static IP), S3 or EFS backing storage, existing-protocol compatibility for external partners.

Exam signal: "Partners must keep uploading via SFTP, but files should land in S3" → Transfer Family.

---

**AWS Snow Family** *(Chapter 25)*

Physical data transfer devices for offline, bulk data migration. Snowball Edge Storage Optimized: 80 TB usable, hardened enclosure, ships to your location; you load data locally and ship it back for ingestion into S3.

Key concepts: Do the transfer math first — if the network transfer would take roughly a week or more, a physical device wins. *Legacy note (2026)*: AWS has been retiring the family — Snowmobile (2024) and Snowcone (late 2024) are gone, and Snow devices closed to new customers in November 2025 (AWS now points to DataSync and Data Transfer Terminals). The SAA-C03 question bank predates this, so the exam still expects Snowball as the answer.

Exam signal: "Petabyte-scale migration," "limited bandwidth, weeks of transfer time" → Snow Family.

---

**AWS Backup** *(Chapters 18 and 23)*

Centralized, policy-based backup service across EBS, RDS, DynamoDB, EFS, and Storage Gateway. Backup plans define schedules and retention; vaults store the recovery points.

Key concepts: Backup plans and vaults, cross-region and cross-account copies, Vault Lock for immutability.

Exam signal: "Centralize and automate backups across multiple AWS services," "cross-account backup copies for ransomware/account-compromise protection" → AWS Backup.

---

## Databases

**RDS — Relational Database Service** *(Chapter 8)*

Managed relational databases. Supported engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Aurora (AWS's proprietary engine). AWS handles backups, patching, failover, and replication. You manage schema design, queries, and instance sizing.

Key concepts: Multi-AZ deployment (automatic failover, synchronous replication), Read Replicas (asynchronous, for read scaling), automated backups (1-35 days retention), manual snapshots (kept until deleted), RDS Proxy (connection pooling).

Exam signal: "Relational database," "ACID transactions," "existing SQL workload" → RDS or Aurora.

---

**Aurora** *(Chapter 24)*

AWS's relational database engine, compatible with MySQL and PostgreSQL. Distributed storage engine that replicates data across 3 AZs in 6 copies. Typically 5x faster than MySQL. Aurora Serverless v2 scales capacity automatically (measured in ACUs — Aurora Capacity Units) and, on supported engine versions, can auto-pause to 0 ACUs when no connections are held open.

Key concepts: Aurora cluster (writer + up to 15 Aurora Replicas behind a single reader endpoint), Aurora Global Database (cross-region read replicas with < 1 second replication lag), Aurora Serverless v2, ACUs, auto-pause/resume behavior.

Exam signal: "High-performance relational database," "MySQL/PostgreSQL compatible," "global reads," "variable workload" → Aurora.

---

**DynamoDB** *(Chapter 9)*

Fully managed NoSQL database. Key-value and document model. Scales to any throughput with single-digit millisecond performance. Two capacity modes: on-demand (pay per request) and provisioned (pay per capacity unit per hour, with Auto Scaling).

Key concepts: Partition key (required), sort key (optional), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (change data capture), DynamoDB Accelerator (DAX) — in-memory cache, TTL (Time to Live), transactions.

Exam signal: "High-throughput key-based access," "flexible schema," "serverless NoSQL" → DynamoDB.

---

**ElastiCache** *(Chapter 10)*

Managed in-memory caching. Two engines: Redis (persistent, pub/sub, Lua scripting, data structures) and Memcached (pure cache, simpler, multi-threaded). Use to reduce database load and serve frequently-read data in microseconds.

Key concepts: Cache-aside pattern, write-through pattern, eviction policies, TTL, cluster mode (Redis), Multi-AZ with automatic failover.

Exam signal: "Reduce database load," "sub-millisecond read latency," "session management," "real-time leaderboard" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Chapter 10)*

Durable, Redis-compatible, in-memory primary database. Unlike ElastiCache (which is a cache where data loss is acceptable), MemoryDB stores a Multi-AZ transaction log and guarantees durability. You can use MemoryDB as your primary database — not just a cache in front of another database.

Key concepts: Redis API compatibility, Multi-AZ transaction log (durability guarantee), in-memory performance, primary database (not a cache layer).

Exam signal: "Redis-compatible AND data loss is not acceptable," "durable in-memory database" → MemoryDB. "Redis as cache, data loss acceptable" → ElastiCache Redis.

---

**Purpose-Built Databases** *(Chapters 9, 10, and 24)*

Match the data shape to the engine. DocumentDB: MongoDB-compatible documents. Neptune: graph database (relationships, traversals — Gremlin/SPARQL). Keyspaces: Cassandra-compatible wide-column. Timestream: time-series (current offering: Timestream for InfluxDB). MemoryDB: durable Redis-compatible *primary* database (vs ElastiCache = cache). QLDB ("immutable cryptographic ledger") was discontinued in 2025 — treat as a legacy distractor.

Exam signal: "social graph / recommendations / fraud rings" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "IoT telemetry over time" → Timestream.

---

**AWS DMS — Database Migration Service** *(Chapter 8)*

Migrates databases to AWS with minimal downtime. Supports full load (initial copy) plus CDC (Change Data Capture) to keep the source and target in sync while the migration runs. When migrating between the same engine type (MySQL → MySQL, PostgreSQL → PostgreSQL), use DMS directly. When migrating between different engine types (Oracle → Aurora PostgreSQL), use the AWS Schema Conversion Tool (SCT) first to convert the schema, then DMS for the data.

Key concepts: Replication instance, source and target endpoints, full load + CDC, SCT (Schema Conversion Tool) for heterogeneous migrations.

Exam signal: "Migrate database with minimal downtime" → DMS. "Oracle to Aurora" or any heterogeneous migration → SCT + DMS. "Same engine, same type" → DMS direct.

---

## Networking

**VPC — Virtual Private Cloud** *(Chapter 11)*

An isolated network within AWS. Spans all AZs in a region. You define the IP address space (CIDR block), create subnets (public or private), configure route tables, and control access via security groups and NACLs.

Key concepts: Public subnet (route to Internet Gateway), private subnet (route to NAT Gateway for outbound), Internet Gateway (inbound + outbound to internet), NAT Gateway (outbound only for private instances), VPC Peering (connect two VPCs), VPC Endpoints (connect to AWS services without internet).

Exam signal: "Private network on AWS," "isolate resources from internet," "control network traffic" → VPC.

---

**Security Groups and NACLs** *(Chapter 15)*

Security groups are stateful firewalls at the instance level — allow rules only, return traffic is automatic. NACLs (Network Access Control Lists) are stateless firewalls at the subnet level — require both inbound and outbound rules, evaluated in order by rule number.

Exam signal: "Block a specific IP from accessing the subnet" → NACL. "Control traffic to/from an instance" → security group.

---

**Route 53** *(Chapter 12)*

AWS's DNS service and domain registrar. Routes internet traffic to AWS resources and external endpoints. Routing policies: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer.

Key concepts: Hosted zones (public and private), record types (A, AAAA, CNAME, Alias), health checks, Traffic Flow (visual policy editor — note that geoproximity is also available as a direct routing policy on records, with an adjustable bias, without requiring Traffic Flow).

Exam signal: "DNS routing," "failover between regions," "route based on latency or location" → Route 53 with the appropriate routing policy.

---

**CloudFront** *(Chapter 13)*

Content Delivery Network (CDN). Caches content at edge locations (750+ points of presence worldwide). Reduces latency for end users. Reduces origin transfer costs through caching. Integrates with S3, EC2, ALB, and API Gateway as origins.

Key concepts: Distribution, origins, behaviors (path-based routing to origins), TTL (cache control), cache invalidation, signed URLs and cookies (access control), Lambda@Edge and CloudFront Functions (run code at the edge), Origin Shield (reduce origin load).

Exam signal: "Global low latency," "cache static content," "reduce origin load," "protect against DDoS with Shield" → CloudFront.

---

**Direct Connect and VPN** *(Chapter 25)*

AWS Direct Connect is a dedicated physical network connection from your on-premises data center to AWS. Bypasses the public internet. More consistent bandwidth and latency. AWS Site-to-Site VPN is an encrypted tunnel over the public internet — faster to set up, lower cost, but variable performance.

Key concepts: Virtual Interface (VIF), Direct Connect Gateway (connect to multiple regions), Transit Gateway (hub-and-spoke network topology), VPN tunnel redundancy.

Exam signal: "Dedicated private connection to AWS" → Direct Connect. "Encrypted connection, faster setup" → VPN. "Connect multiple VPCs" → Transit Gateway.

---

**VPC Endpoints** *(Chapter 30)*

Connect private resources to AWS services without using the public internet or NAT Gateway. Gateway Endpoints: free, available for S3 and DynamoDB only. Interface Endpoints (PrivateLink): priced per hour + per GB, available for most AWS services.

Exam signal: "EC2 in private subnet calls S3/DynamoDB — reduce NAT Gateway costs" → Gateway Endpoint (free). "Private connection to SQS, SSM, Secrets Manager from private subnet" → Interface Endpoint.

---

**AWS Client VPN** *(Chapter 11)*

Managed OpenVPN endpoint that lets individual devices (laptops, workstations) connect securely to a VPC over the internet. Authentication options: Active Directory, SAML 2.0 federation with an identity provider, or mutual TLS (certificate-based). Supports split-tunnel (only VPC-bound traffic goes through the tunnel) and full-tunnel (all traffic routes through AWS).

Key concepts: Client VPN endpoint, target network (VPC subnet association), authorization rules, split-tunnel vs. full-tunnel.

Exam signal: "Remote engineers need secure access to a VPC from home," "individual device to VPC connectivity" → Client VPN. Contrast: Site-to-Site VPN = network-to-network. Client VPN = device-to-network.

---

**Network Load Balancer (NLB) and Gateway Load Balancer (GWLB)** *(Chapter 7)*

NLB operates at Layer 4 (TCP/UDP/TLS): no HTTP inspection, just packet routing at extreme speed — millions of requests per second, with a static IP per AZ and source IP preservation. GWLB operates at Layer 3 and exists for one purpose: inserting third-party virtual network appliances (firewalls, IDS/IPS, deep packet inspection) inline into traffic flows.

Key concepts: NLB = Layer 4, static IPs, ultra-low latency, non-HTTP protocols. GWLB = Layer 3, GENEVE encapsulation, appliance fleets behind a single entry point. ALB = Layer 7 (path/host routing).

Exam signal: "Millions of TCP requests per second," "static IP for the load balancer," "preserve source IP" → NLB. "Insert third-party security appliances into the traffic path" → GWLB.

---

**AWS Global Accelerator** *(Chapter 25)*

Routes user traffic onto AWS's private global backbone at the nearest edge location, instead of crossing the public internet. Provides two static Anycast IP addresses that front your ALBs, NLBs, or EC2 instances in one or more regions. Improves latency and consistency for *dynamic* (non-cacheable) traffic.

Key concepts: Static Anycast IPs, edge onboarding onto the AWS backbone, health-check-based regional failover in seconds, endpoint groups with traffic dials.

Exam signal: "Global users, dynamic/non-HTTP traffic, static IP, fast regional failover" → Global Accelerator. "Cacheable/static content" → CloudFront instead.

---

## Security and Identity

**IAM — Identity and Access Management** *(Chapters 3 and 14)*

Controls who can do what in your AWS account. Users (long-term credentials), Groups (users sharing permissions), Roles (temporary credentials for services and cross-account access), Policies (JSON documents defining allow/deny rules).

Key concepts: Principal, Action, Resource, Condition, explicit deny > explicit allow > implicit deny, SCP (Service Control Policy in AWS Organizations), Permission boundary, AssumeRole.

Exam signal: IAM is involved in every security question. Key pattern: services use IAM roles (not users). Cross-account access uses role assumption. Least privilege — grant only what is required.

---

**KMS — Key Management Service** *(Chapter 16)*

Managed encryption key service. Creates, stores, and controls cryptographic keys. Customer-managed keys (CMKs) allow you to define rotation, usage, and access policies. AWS-managed keys are automatically managed.

Key concepts: Key policy (separate from IAM policy), Envelope encryption (data encrypted with a data key; data key encrypted with CMK), Automatic key rotation, Multi-region keys, Grants.

Exam signal: "Encrypt data at rest," "customer-managed encryption keys," "key rotation" → KMS.

---

**Secrets Manager** *(Chapter 16)*

Stores and automatically rotates sensitive values: database credentials, API keys, OAuth tokens. Integrates with RDS for automatic password rotation. Applications retrieve secrets at runtime via API — never hardcode credentials.

Exam signal: "Store and rotate database credentials," "avoid hardcoded secrets" → Secrets Manager. "Store configuration values, not secrets" → Parameter Store (SSM).

---

**AWS Shield** *(Chapter 17)*

DDoS protection. Shield Standard is automatic and free — protects against common volumetric and protocol attacks. Shield Advanced adds financial protection, 24/7 DDoS response team, and detailed attack visibility.

Exam signal: "Protect against DDoS" → Shield Standard (automatic) or Shield Advanced (enterprise, with SLA).

---

**WAF — Web Application Firewall** *(Chapter 17)*

Filters HTTP/HTTPS traffic based on rules: IP blocks, rate limits, SQL injection patterns, XSS patterns, geographic restrictions, custom rules. Attaches to CloudFront, ALB, API Gateway, or AppSync.

Exam signal: "Block specific IP addresses," "prevent SQL injection at the edge," "rate limit API calls" → WAF.

---

**GuardDuty** *(Chapter 17)*

Threat detection service. Analyzes CloudTrail logs, VPC Flow Logs, and DNS logs using ML and threat intelligence. Detects unusual API activity, communication with known malicious IPs, compromised credentials.

Exam signal: "Detect unusual activity," "identify compromised IAM credentials," "continuous threat monitoring" → GuardDuty.

---

**Amazon Inspector** *(Chapter 17)*

Automated vulnerability assessment service. Continuously scans EC2 instances, Amazon ECR container images, and Lambda functions for software vulnerabilities (CVEs) and unintended network exposure. Findings are sent to AWS Security Hub for centralized management.

Key concepts: CVE scanning, continuous (not one-shot) assessment, EC2 + ECR + Lambda coverage, Security Hub integration.

Exam signal: "Automatically scan EC2 for known vulnerabilities," "CVE scanning for container images," "continuous vulnerability assessment" → Inspector.

---

**Amazon Cognito** *(Chapter 14)*

Managed authentication for your application's end users — a user directory you don't have to build. User Pools handle sign-up, sign-in, MFA, password reset, and social identity providers (Google, Facebook, any OIDC provider), issuing JWTs your application validates. Identity Pools exchange those tokens for temporary AWS credentials.

Key concepts: User Pool (authentication, JWTs) vs. Identity Pool (temporary AWS credentials), hosted UI, social/OIDC/SAML federation, API Gateway Cognito authorizer.

Exam signal: "Application needs user sign-up/sign-in," "social login," "give mobile app users temporary access to AWS resources" → Cognito. Contrast: IAM is for your engineers and services; Cognito is for your customers.

---

**AWS Certificate Manager (ACM)** *(Chapter 16)*

Provisions free public TLS/SSL certificates for AWS-managed services (ALB, CloudFront, API Gateway) and handles the entire lifecycle — no renewal calendar, no private key handling. Auto-renews via DNS validation.

Key concepts: DNS vs. email validation, auto-renewal, certificates for CloudFront must be in us-east-1, free public certificates cannot be exported (a paid exportable option exists since 2025).

Exam signal: "HTTPS on a load balancer or CDN," "automatic certificate renewal" → ACM.

---

**Amazon Macie** *(Chapter 17)*

Sensitive data discovery for S3. Uses machine learning and pattern matching to find PII (names, card numbers, credentials) in buckets and flags access risks like public exposure. Complements GuardDuty: GuardDuty watches behavior; Macie audits what's stored.

Key concepts: Managed data identifiers (PII patterns), S3-only scope, findings to Security Hub/EventBridge.

Exam signal: "Discover PII in S3," "identify sensitive data exposure" → Macie.

---

**AWS Control Tower** *(Chapter 14)*

Automates setup and governance of a multi-account environment. Creates a landing zone — management, log archive, and audit accounts pre-wired with Organizations, CloudTrail, Config, and guardrails — in minutes instead of days of manual wiring.

Key concepts: Landing zone, guardrails (preventive = SCPs, detective = Config rules), Account Factory for standardized new accounts.

Exam signal: "Set up and govern a new multi-account environment with best practices automatically" → Control Tower. Contrast: Organizations is the raw building block; Control Tower is the automated assembly.

---

## Messaging and Event Processing

**SQS — Simple Queue Service** *(Chapter 19)*

Managed message queue. Producers send messages; consumers read and delete them. Decouples services: the sender doesn't need to know if the receiver is available. Standard queues: at-least-once delivery, best-effort ordering. FIFO queues: exactly-once processing, strict ordering.

Key concepts: Visibility timeout (message hidden from other consumers while processing), Dead Letter Queue (DLQ) for messages that fail repeatedly, Message retention (4 days default, up to 14), Long polling (reduce empty responses), Max payload 256KB by default (raisable to 1 MiB since 2025; for larger payloads, the Extended Client Library stores the body in S3).

Exam signal: "Decouple services," "buffer requests during load spikes," "async processing" → SQS. "Order matters and exactly-once is required" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Chapter 19)*

Managed pub/sub service. Publishers send a message to a topic; all subscribers receive a copy. Fan-out pattern: one message → many consumers. Protocols: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push.

Key concepts: Topic, subscription, fan-out pattern (SNS → multiple SQS queues), message filtering (subscribers receive only matching messages).

Exam signal: "Send notifications to multiple endpoints simultaneously," "fan-out a single event to multiple consumers" → SNS. Common pattern: SNS + SQS for durable fan-out.

---

**EventBridge** *(Chapter 22)*

Event bus for building event-driven architectures. Routes events from AWS services, SaaS partners, and custom sources to Lambda, SQS, SNS, Step Functions, and other targets. Supports scheduled rules (cron) and pattern matching.

Exam signal: "Route events from AWS services to targets," "schedule Lambda functions," "event-driven orchestration" → EventBridge.

---

**Step Functions** *(Chapter 22)*

Serverless workflow orchestration. Coordinates Lambda functions, ECS tasks, DynamoDB, SNS, SQS, and other services into visual state machines. Handles retries, error handling, parallel branches, and wait states.

Key concepts: State machine, state types (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (exactly-once, long-running) vs. Express Workflows: Asynchronous (at-least-once, high-volume — design tasks to be idempotent) and Synchronous (at-most-once, returns result directly like an API call).

Exam signal: "Orchestrate multiple Lambda functions," "long-running workflows with retry logic," "human approval steps" → Step Functions.

---

**Kinesis** *(Chapter 26)*

Real-time data streaming. Kinesis Data Streams: durable, ordered stream of records (like a distributed commit log). Consumers process records; data retained 24 hours (default) to 365 days (with Extended Data Retention). Amazon Data Firehose (formerly Kinesis Data Firehose): fully managed delivery to S3, Redshift, OpenSearch, Splunk — no consumer management needed.

Key concepts: Shard (unit of throughput: 1MB/s write, 2MB/s read), partition key (determines shard assignment), sequence number, checkpointing (KCL or Lambda), Firehose vs. Streams.

Exam signal: "Real-time streaming," "ordered records," "replay events" → Kinesis Data Streams. "Deliver streaming data to S3/Redshift without managing consumers" → Amazon Data Firehose (older questions may say "Kinesis Data Firehose"). "SQL on streaming data" → Amazon Managed Service for Apache Flink (formerly Kinesis Data Analytics). Contrast with SQS: Kinesis retains and replays; SQS deletes on consumption.

---

**Amazon MQ** *(Chapter 19)*

Managed message broker service supporting Apache ActiveMQ and RabbitMQ. Supports industry-standard messaging protocols: AMQP, STOMP, MQTT, OpenWire, and WebSocket. The primary use case is lift-and-shift migration of on-premises message broker workloads — applications that already use ActiveMQ or RabbitMQ can connect without code changes.

Key concepts: ActiveMQ vs. RabbitMQ engine choice, protocol support (AMQP/STOMP/MQTT), single-instance or active/standby broker configuration for HA.

Exam signal: "Migrate on-premises ActiveMQ or RabbitMQ to AWS without changing application code" → Amazon MQ. "Greenfield AWS-native messaging" → SQS or SNS (simpler, more scalable).

---

## Analytics

**Athena** *(Chapter 26)*

Serverless SQL queries on data stored in S3. No infrastructure to manage. Pay per query (per TB scanned). Best with columnar formats (Parquet, ORC) and partitioned data.

Exam signal: "Query S3 data with SQL," "ad-hoc analytics on data lake," "no infrastructure management" → Athena.

---

**Glue** *(Chapter 26)*

Serverless ETL (Extract, Transform, Load) service. Glue Crawlers discover data and update the Glue Data Catalog. Glue Jobs run Spark or Python transformations. The Data Catalog integrates with Athena, Redshift Spectrum, and EMR.

Exam signal: "Transform and load data for analytics," "discover schema of S3 data," "ETL pipeline" → Glue.

---

**Amazon QuickSight** *(Chapter 26)*

Managed business intelligence and data visualization service. Uses SPICE (Super-fast, Parallel, In-memory Calculation Engine), an in-memory engine that caches imported data for fast dashboard rendering. Connects to Athena, S3, Redshift, RDS, and other AWS data sources. No BI server to manage.

Key concepts: SPICE (in-memory engine), datasets, analyses, dashboards, ML Insights (anomaly detection, forecasting), row-level and column-level security.

Exam signal: "BI dashboard on AWS without managing a server," "visualize data from Athena or Redshift" → QuickSight.

---

**AWS Lake Formation** *(Chapter 26)*

Centralized data lake access control layer on top of S3 and the Glue Data Catalog. Provides fine-grained permissions at the table, column, and row level — more granular than S3 bucket policies alone. Simplifies setting up a secure data lake: Lake Formation handles the permission model; Glue handles the catalog; S3 holds the data.

Key concepts: Data lake permissions (table/column/row-level), Glue Data Catalog integration, LF-tags for attribute-based access control, centralized grant/revoke for Athena and Redshift Spectrum queries.

Exam signal: "Fine-grained access control on data lake," "column-level or row-level security on S3 data" → Lake Formation.

---

## High Availability and Disaster Recovery

**Multi-AZ and Multi-Region** *(Chapter 18)*

Multi-AZ: synchronous replication within a region for automatic failover (RDS Multi-AZ, load balancer across AZs). RPO ~0, RTO ~60s for RDS. Multi-Region: asynchronous replication for geographic redundancy and lower latency for global users.

Key concepts: RTO (Recovery Time Objective — how long to recover), RPO (Recovery Point Objective — how much data can be lost). Pilot Light, Warm Standby, Active-Active DR strategies.

Exam signal: Distinguish between AZ-level failures (Multi-AZ handles) vs. regional failures (Multi-Region handles). Cost and complexity increase significantly with Multi-Region.

---

**AWS Elastic Disaster Recovery (DRS)** *(Chapter 18)*

Managed disaster recovery for servers (on-premises or EC2). Continuously replicates source servers block by block into a low-cost staging area and launches full recovery instances in minutes when needed — a managed pilot light: near-warm-standby recovery times at close to backup-and-restore prices.

Key concepts: Continuous block-level replication, low-cost staging area, on-demand recovery launch, point-in-time recovery.

Exam signal: "Minimize downtime and data loss for server-based workloads with a managed DR service," "pilot light without building it yourself" → DRS.

---

## Cost Optimization

**EC2 Pricing Models** *(Chapter 27)*

On-Demand: full price, no commitment. Reserved Instances (1 or 3 year): 30-72% discount for specific instance type. Savings Plans (Compute or EC2 Instance): committed hourly spend for flexibility. Spot: 60-90% off for interruptible workloads.

Exam signal: "Minimize cost for predictable workload" → Savings Plans or Reserved Instances. "Fault-tolerant batch processing" → Spot. "Unpredictable or short-term" → On-Demand.

---

**Data Transfer Pricing** *(Chapter 30)*

Inbound to AWS: free. Same-AZ: free. Cross-AZ: $0.01/GB each direction. Cross-region: $0.02-0.08/GB. Internet (outbound): ~$0.09/GB. NAT Gateway processing: $0.045/GB. CloudFront data transfer is cheaper than direct EC2-to-internet, and caching reduces total volume.

Exam signal: "Reduce data transfer costs for S3/DynamoDB from private subnet" → Gateway Endpoints (free). "Reduce NAT Gateway costs for other services" → Interface Endpoints.

---

## Observability

**CloudWatch** *(referenced throughout)*

Monitoring and observability. CloudWatch Metrics: numeric time-series data from AWS services and custom applications. CloudWatch Logs: collect, search, and analyze log data. CloudWatch Alarms: trigger notifications or auto scaling based on metric thresholds. CloudWatch Dashboards: visualize metrics.

Key concepts: Metric dimensions, retention periods, log groups and log streams, metric filters, CloudWatch Agent (for OS-level metrics and logs from EC2), Container Insights.

---

**CloudTrail** *(referenced throughout)*

Logs every API call made in your AWS account: who made it, from where, when, and what was the response. Multi-region trail stores logs in S3 indefinitely. Used for security auditing, compliance, and incident investigation.

Exam signal: "Who deleted that resource?" "Audit all API activity" → CloudTrail.

---

**X-Ray** *(Chapter 20)*

Distributed tracing: follows individual requests across services (traces → segments → subsegments), builds a service map with latency and error rates per hop. Sampling keeps overhead low; annotations make traces searchable. Active tracing toggles on Lambda and API Gateway stages.

Exam signal: "Trace requests across microservices," "find the bottleneck between services" → X-Ray (not CloudWatch, not CloudTrail).

---

**AWS Config** *(referenced in Chapter 31)*

Tracks resource configuration changes over time. Evaluates resources against compliance rules. Records the history of every configuration change for every resource. Integrates with Systems Manager for remediation.

Exam signal: "Is this resource compliant with our security policy?" "What did this resource's configuration look like last week?" → AWS Config.

---

## Well-Architected

**The Six Pillars** *(Chapter 31)*

| Pillar                 | Core question                           | Key services                                      |
|------------------------|-----------------------------------------|---------------------------------------------------|
| Operational Excellence | Are we running well?                    | CloudWatch, CloudTrail, SSM, Config               |
| Security               | Are we protected?                       | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability            | Do we recover from failure?             | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Performance Efficiency | Are we using the right resources?       | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Cost Optimization      | Are we spending wisely?                 | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| Sustainability         | Are we minimizing environmental impact? | Right-sizing, Graviton, efficient storage tiers   |

AWS Well-Architected Tool: evaluates your architecture against the six pillars. Use it before the exam to understand the reasoning behind each pillar's questions.
