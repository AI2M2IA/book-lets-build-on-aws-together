# Appendix C: Concept Registry

Every key concept introduced in the book, mapped to its chapter, the analogy used, and the SAA-C03 domain where it appears.

Use this as a study index: if you're fuzzy on a concept before the exam, find it here and return to its chapter for context.

---

## A

**ACM (AWS Certificate Manager)** — Free public TLS certificates for ALB, CloudFront, and API Gateway, with automatic renewal via DNS validation. CloudFront certificates must live in us-east-1. Chapter 16. Domain 1.

**ACU (Aurora Capacity Unit)** — The unit of measurement for Aurora Serverless v2 capacity. Scales automatically and, on supported engine versions, can auto-pause to 0 ACUs when no connections are held open. Chapter 24. Domain 3.

**Alarm (CloudWatch)** — A rule that fires when a metric crosses a threshold, triggering a notification or auto scaling action. Chapter 7. Domain 2.

**ALB (Application Load Balancer)** — Layer 7 load balancer that routes HTTP/HTTPS traffic based on path and host rules. Chapter 7. Domain 2.

**AMI (Amazon Machine Image)** — A template containing the OS, software, and configuration for an EC2 instance. Chapter 4. Domain 3.

**Architect mindset** — Asking "what breaks first, how do we know, and what does someone do at 3 AM?" rather than only "how does this work?" Chapter 32, Chapter 34. Cross-domain.

**Architecture Decision Record (ADR)** — A short document capturing a decision, its alternatives, its rationale, and what would cause reconsideration. Chapter 32. Cross-domain.

**Architecture review** — A structured process covering: constraints → unknowns → options → failure modes → monitoring → runbooks. Chapter 32. Cross-domain.

**Athena** — Serverless SQL query service for data in S3. Pay per TB scanned. Best with Parquet/ORC columnar formats. Chapter 26. Domain 3.

**Auto Scaling Group (ASG)** — A group of EC2 instances managed together, automatically replacing unhealthy instances and scaling based on load. Chapter 7. Domain 2, 3.

**Availability Zone (AZ)** — One or more physically separate data centers within a region, connected by low-latency links. Chapter 2. Domain 2.

---

## B

**AWS Backup** — Centralized, policy-based backup across EBS, RDS, DynamoDB, EFS, and Storage Gateway. Supports cross-region and cross-account copies. Chapters 18, 23. Domain 2.

**AWS Batch** — Managed batch compute for Docker containers. Composed of a job definition (what to run), a job queue (where jobs wait), and a compute environment (EC2 or Fargate, On-Demand or Spot). For workloads that exceed Lambda's 15-minute limit. Chapter 21. Domain 3.

**Bucket (S3)** — A container for S3 objects. Buckets have unique global names and live in a specific region. Chapter 5. Domain 3.

**Bucket policy** — A resource-based policy attached to an S3 bucket controlling access for IAM principals and external accounts. Chapter 5. Domain 1.

---

## C

**Cache-aside pattern** — Application checks cache first; on miss, queries database, then stores result in cache. Chapter 10. Domain 3.

**Cache hit rate** — Percentage of requests served from cache rather than the origin. Higher is better. Chapter 13. Domain 3.

**AWS Client VPN** — Managed OpenVPN endpoint. Connects individual devices (laptops, workstations) to a VPC over the internet. Authentication via Active Directory, SAML 2.0 federation with an identity provider, or mutual TLS. Supports split-tunnel and full-tunnel modes. Contrast with Site-to-Site VPN (network-to-network). Chapter 11. Domain 1.

**CloudFront** — AWS CDN. Caches content at 750+ edge locations worldwide. Reduces latency and origin data transfer costs. Chapter 13. Domain 3, 4.

**CloudTrail** — Logs every AWS API call: who, what, when, from where. Stored in S3. Used for auditing and incident investigation. Domain 1.

**CloudWatch** — Metrics, logs, alarms, and dashboards for AWS resources and custom applications. Referenced throughout. All domains.

**Amazon Cognito** — Authentication for your application's end users: User Pools are a managed user directory (sign-up, sign-in, MFA, social login, JWTs); Identity Pools issue temporary AWS credentials. IAM is for your engineers; Cognito is for your customers. Chapter 14. Domain 1.

**Cold start (Lambda)** — Delay on first invocation (or after inactivity) as Lambda initializes the execution environment. Use provisioned concurrency to eliminate. Chapter 20. Domain 3.

**Compute Savings Plan** — Commitment to a dollar amount of hourly EC2 spend, applying to any instance type or size. Chapter 27. Domain 4.

**Config (AWS)** — Tracks configuration changes to AWS resources over time and evaluates compliance against rules. Chapter 31. Domain 1.

**AWS Control Tower** — Automates multi-account governance: builds a landing zone (management, log archive, and audit accounts) with guardrails in minutes — the prefab version of wiring Organizations, CloudTrail, and Config by hand. Chapter 14. Domain 1.

**Cross-AZ data transfer** — Traffic between Availability Zones within a region. Charged at $0.01/GB each direction. Chapter 30. Domain 4.

**Cross-region replication** — Copying data (S3 CRR, Aurora Global, DynamoDB Global Tables) to a different region. Incurs data transfer charges. Chapters 18, 23, 30. Domain 2.

---

## D

**AWS DataSync** — Agent-based migration and sync of file shares (NFS/SMB) to S3, EFS, or FSx. "rsync on steroids, with an AWS console." Chapter 25. Domain 3.

**DAX (DynamoDB Accelerator)** — In-memory cache specifically for DynamoDB. Microsecond read latency. Chapter 9. Domain 3.

**Dead Letter Queue (DLQ)** — A queue where messages that fail processing repeatedly are sent, preventing queue blockage. Chapter 19. Domain 2.

**AWS DMS (Database Migration Service)** — Migrates databases to AWS with minimal downtime. Full load (initial copy) plus CDC (Change Data Capture) keeps source and target in sync during migration. Homogeneous migrations (same engine type): use DMS directly. Heterogeneous migrations (different engine types, e.g. Oracle → Aurora PostgreSQL): use SCT (Schema Conversion Tool) first, then DMS. Chapter 8. Domain 3.

**Dedicated Host** — A physical EC2 server reserved exclusively for your use. Required for certain software licenses. Chapter 27. Domain 4.

**Defense in depth** — Layering multiple security controls (IAM + security groups + NACLs + WAF + GuardDuty) so that compromise of one layer doesn't expose the system. Chapter 33. Domain 1.

**Direct Connect** — A dedicated private network connection from an on-premises location to AWS. More consistent than VPN. Chapter 25. Domain 3.

**DLQ** — See Dead Letter Queue.

**DynamoDB** — Fully managed NoSQL database with single-digit millisecond latency at any scale. Key-value and document model. Chapter 9. Domain 3.

**DynamoDB Auto Scaling** — Automatically adjusts provisioned read/write capacity based on CloudWatch metrics. Chapter 29. Domain 4.

**DynamoDB Streams** — A time-ordered change log of all item changes in a DynamoDB table. Used with Lambda for event-driven processing. Chapter 9. Domain 2.

---

## E

**EBS (Elastic Block Store)** — Block storage attached to a single EC2 instance. Persists independently. Types: gp3, io2, st1. Chapter 6. Domain 3.

**EC2 (Elastic Compute Cloud)** — Virtual machines in the cloud. Chapter 4. Domain 3.

**ECS (Elastic Container Service)** — Managed container orchestration. Fargate launch type removes server management. Chapter 21. Domain 2, 3.

**EFS (Elastic File System)** — Shared NFS file system accessible from multiple EC2 instances. Scales automatically. Storage classes include Standard, Infrequent Access, and Archive, with Intelligent-Tiering for automatic movement between tiers. Chapter 6. Domain 3.

**EKS (Elastic Kubernetes Service)** — Managed Kubernetes control plane on AWS. Chapter 21. Domain 3.

**Elastic Disaster Recovery (DRS)** — Continuous block-level replication of servers (on-premises or EC2) into a low-cost staging area, with recovery instances launched in minutes — a managed pilot light. Chapter 18. Domain 2.

**ElastiCache** — Managed in-memory caching. Redis (richer features) or Memcached (simpler). Chapter 10. Domain 3.

**Elastic IP** — A static public IP address you can allocate and re-associate with EC2 instances. Chapter 11. Domain 3.

**Envelope encryption** — A pattern where data is encrypted with a data key (DEK), and the DEK is encrypted with a master key (CMK in KMS). Chapter 16. Domain 1.

**EventBridge** — Event bus for routing events from AWS services, SaaS partners, and custom sources to targets. Supports scheduled rules. Chapter 22. Domain 2.

**Explicit deny** — An IAM deny statement that cannot be overridden by any allow. Takes precedence over all allows. Chapter 3. Domain 1.

---

## F

**Failover routing (Route 53)** — Routes traffic to a secondary endpoint when the primary fails health checks. Chapter 12. Domain 2.

**Fargate** — Serverless compute engine for ECS and EKS. No EC2 instances to manage. Chapter 21. Domain 3.

**Fan-out pattern** — One SNS topic delivers the same message to multiple SQS queues simultaneously. Chapter 19. Domain 2.

**FIFO queue (SQS)** — Exactly-once processing, strict ordering. Lower throughput than standard queues. Chapter 19. Domain 2.

**Failure mode** — A specific way a system can fail. Identifying failure modes before production is the core of architecture review. Chapter 32. Cross-domain.

---

## G

**Gateway Endpoint** — A free VPC endpoint type for S3 and DynamoDB. Routes traffic through AWS private network, eliminating NAT Gateway charges. Chapter 30. Domain 4.

**Gateway Load Balancer (GWLB)** — Layer 3 load balancer for inserting third-party virtual network appliances (firewalls, IDS/IPS) inline into traffic flows. Chapter 7. Domain 1.

**Geolocation routing (Route 53)** — Routes based on the geographic location of the DNS query origin. Chapter 12. Domain 3.

**Global Accelerator** — Routes traffic to the nearest AWS edge via Anycast, improving latency for dynamic applications. Chapter 25. Domain 3.

**Glue (AWS)** — Serverless ETL. Glue Crawlers discover schema; Glue Jobs transform data; Data Catalog stores metadata. Chapter 26. Domain 3.

**GSI (Global Secondary Index)** — An alternate index on a DynamoDB table with a different partition key and optional sort key. Enables flexible query patterns. Chapter 9. Domain 3.

**GuardDuty** — Threat detection service using ML on CloudTrail, VPC Flow Logs, and DNS logs to detect unusual activity. Chapter 17. Domain 1.

---

## H

**Health check (Route 53)** — Monitors endpoint availability. Failed health checks trigger failover routing. Chapter 12. Domain 2.

**Hot partition (DynamoDB)** — A partition receiving disproportionate traffic because many requests share the same partition key. Chapter 9. Domain 3.

---

## I

**IAM (Identity and Access Management)** — Controls authentication and authorization for AWS accounts. Users, groups, roles, policies. Chapter 3, 14. Domain 1.

**IAM role** — An IAM identity with temporary credentials, assumed by services, users, or other accounts. Chapter 3, 14. Domain 1.

**Idempotency** — The property of an operation that produces the same result whether called once or many times. Critical for distributed systems (refunds, payments, order processing). Chapter 32. Cross-domain.

**Idempotency key** — A unique identifier for an operation, checked before execution to prevent duplicate processing. Chapter 32. Cross-domain.

**Interface Endpoint (PrivateLink)** — A VPC endpoint for most AWS services. Priced per hour + per GB. Provides private connectivity without internet or NAT. Chapter 30. Domain 4.

**Internet Gateway (IGW)** — Allows instances in public subnets to communicate with the internet. Requires the subnet's route table to have a route to the IGW. Chapter 11. Domain 3.

**"It depends"** — The honest answer to most architecture questions, which must always be completed: "It depends on the access pattern / scale / failure consequence / cost constraint." Chapter 33. Cross-domain.

---

## K

**Kinesis Data Firehose** — Former name of Amazon Data Firehose: managed delivery of streaming data to S3, Redshift, OpenSearch. No consumer management. Older exam questions may still use the old name. Chapter 26. Domain 3.

**Kinesis Data Streams** — Real-time ordered event stream. Durable, replayable within the retention window (24 hours default, up to 365 days). Measured in shards. Chapter 26. Domain 3.

**KMS (Key Management Service)** — Creates, stores, and controls cryptographic keys for encryption at rest. Chapter 16. Domain 1.

---

## L

**Lambda** — Serverless functions triggered by events. Pay per invocation and per ms. Max 15-minute duration. Chapter 20. Domain 2, 3, 4.

**Lambda@Edge** — Lambda functions that run at CloudFront edge locations, modifying requests and responses. Chapter 13. Domain 3.

**AWS Lake Formation** — Centralized data lake access control layer on top of S3 and the Glue Data Catalog. Provides fine-grained permissions at the table, column, and row level. Simplifies secure data lake setup. Chapter 26. Domain 3.

**Latency-based routing (Route 53)** — Routes DNS queries to the AWS region with the lowest measured latency. Chapter 12. Domain 3.

**Launch template** — A versioned template specifying EC2 instance configuration for Auto Scaling Groups. Chapter 7. Domain 3.

**Least privilege** — IAM best practice: grant only the permissions needed, no more. Chapter 3. Domain 1.

**Lifecycle policy (S3)** — Rules that automatically transition objects to cheaper storage classes or delete them based on age. Chapter 23. Domain 4.

**LSI (Local Secondary Index)** — An alternate index on a DynamoDB table using the same partition key but a different sort key. Must be created at table creation. Chapter 9. Domain 3.

---

## M

**Amazon Macie** — ML-based discovery of sensitive data (PII) in S3 and flagging of exposure risks. GuardDuty watches behavior; Macie audits what's stored. Chapter 17. Domain 1.

**Memcached** — Simple, multi-threaded in-memory caching engine. No persistence, no data structures. Use Redis unless you specifically need multi-threading at the cost of features. Chapter 10. Domain 3.

**Amazon MemoryDB for Redis** — Durable, Redis-compatible, in-memory primary database. Unlike ElastiCache, MemoryDB writes to a Multi-AZ transaction log, guaranteeing data durability. Use when Redis API compatibility is required AND data loss is not acceptable. Chapter 10. Domain 3.

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: block-level replication of whole servers into AWS, test launches, then cutover to native EC2 instances. DataSync moves files; DMS moves databases; MGN moves servers. Chapter 25. Domain 3.

**Amazon MQ** — Managed ActiveMQ/RabbitMQ broker speaking standard protocols (AMQP, MQTT, STOMP). For lift-and-shift of existing broker workloads without code changes; greenfield messaging → SQS/SNS. Chapter 19. Domain 2.

**Multi-AZ (RDS)** — Synchronous standby replica in a different AZ with automatic failover. RPO ~0, RTO ~60 seconds. For high availability, not read scaling. Chapter 8, 18. Domain 2.

**Multi-Region** — Deploying application components across multiple AWS regions for geographic redundancy and global performance. Higher complexity and cost. Chapter 18. Domain 2.

---

## N

**Network Load Balancer (NLB)** — Layer 4 (TCP/UDP/TLS) load balancer: millions of requests per second, static IP per AZ, preserves source IP. No HTTP awareness — that's the ALB's job. Chapter 7. Domain 3.

**NACL (Network Access Control List)** — Stateless firewall at the subnet level. Requires both inbound and outbound rules. Rules evaluated in numeric order. Chapter 15. Domain 1.

**NAT Gateway** — Allows instances in private subnets to make outbound connections to the internet. Charges $0.045/GB processed. Chapter 11, 30. Domain 4.

---

## O

**Object (S3)** — A file stored in S3. Consists of key (name), value (data), and metadata. Maximum size 5TB. Chapter 5. Domain 3.

**On-Demand capacity (DynamoDB)** — Pay per request mode. More expensive per request than provisioned, but no capacity planning needed. Chapter 29. Domain 4.

**On-Demand instances (EC2)** — Pay per hour with no commitment. Maximum flexibility, maximum price. Chapter 27. Domain 4.

**AWS Outposts** — A fully managed rack of AWS hardware installed in a customer's own data center or co-location facility. Runs the same AWS services, APIs, and tooling as the public cloud on-premises. AWS manages installation and patching; the customer provides rack space and power. For data residency, low-latency on-premises workloads, or disconnected scenarios. Chapter 2. Domain 4.

---

## P

**Partition key (DynamoDB)** — The primary key component that determines which partition stores an item. Choose a high-cardinality key for even distribution. Chapter 9. Domain 3.

**Permission boundary** — An IAM policy that sets the maximum permissions an IAM identity can have, even if other policies grant more. Chapter 14. Domain 1.

**Placement group** — Controls physical placement of EC2 instances to minimize latency (cluster) or maximize availability (spread). Chapter 4. Domain 3.

**PrivateLink** — AWS service for creating private endpoints to services hosted in AWS, accessible via Interface Endpoints. Chapter 30. Domain 1.

**Provisioned concurrency (Lambda)** — Pre-initialized execution environments that eliminate cold start delays. Chapter 20. Domain 3.

**Provisioned capacity (DynamoDB)** — Pre-allocated read and write throughput, measured in capacity units per second. Cheaper than on-demand for predictable traffic. Chapter 9, 29. Domain 4.

---

## Q

**Amazon QuickSight** — Managed business intelligence and data visualization service. Uses SPICE (Super-fast, Parallel, In-memory Calculation Engine) to cache data for fast dashboard rendering. Connects to Athena, S3, Redshift, RDS, and other AWS data sources. No BI server to manage. Chapter 26. Domain 3.

---

## R

**RDS (Relational Database Service)** — Managed relational database. Handles backups, patching, failover. Chapter 8. Domain 3.

**RDS Proxy** — Manages a connection pool between Lambda/application and RDS, preventing connection exhaustion. Chapter 8. Domain 3.

**Read Replica (RDS)** — Asynchronous copy of the database for read scaling. Does NOT provide automatic failover. Chapter 8, 24. Domain 3.

**Redis** — In-memory data structure store used for caching, session management, real-time leaderboards, pub/sub. Chapter 10. Domain 3.

**Reserved Instance (EC2)** — A commitment to use a specific instance type in a specific region for 1 or 3 years in exchange for a discount. Chapter 27. Domain 4.

**Route 53** — AWS DNS service and domain registrar. Supports multiple routing policies. Chapter 12. Domain 2, 3.

**RPO (Recovery Point Objective)** — Maximum acceptable data loss measured in time. "How much data can we afford to lose?" Chapter 18. Domain 2.

**RTO (Recovery Time Objective)** — Maximum acceptable time to restore service after a failure. "How long can we be down?" Chapter 18. Domain 2.

**Runbook** — Step-by-step instructions for operating a system, specifically for incident response. "What does someone do at 3 AM?" Chapter 32. Cross-domain.

---

## S

**S3 Intelligent-Tiering** — Automatically moves S3 objects between access tiers based on access patterns. No retrieval fee. Chapter 23. Domain 4.

**S3 Select** — Retrieves a subset of S3 object content using SQL expressions, reducing data transfer. Legacy: unavailable to new customers since mid-2024 — Athena is now the primary path for filtering and querying data in S3. S3 Object Lambda, once the suggested alternative, is itself legacy (closed to new customers in November 2025; existing workloads keep working). Chapter 30. Domain 4.

**Savings Plan** — A flexible pricing model committing to a dollar amount of hourly spend in exchange for a discount. More flexible than Reserved Instances. Chapter 27. Domain 4.

**SCP (Service Control Policy)** — AWS Organizations policy that restricts the maximum permissions available to accounts in an OU. Chapter 14. Domain 1.

**Secrets Manager** — Stores and automatically rotates secrets (database passwords, API keys). Chapter 16. Domain 1.

**Security group** — A stateful virtual firewall at the instance level. Allow rules only; return traffic is automatic. Chapter 15. Domain 1.

**Shard (Kinesis)** — The base unit of throughput in Kinesis Data Streams: 1 MB/s write, 2 MB/s read. Chapter 26. Domain 3.

**Shared Responsibility Model** — AWS is responsible for security *of* the cloud (infrastructure); you are responsible for security *in* the cloud (data, configuration, access). Chapter 1. Domain 1.

**Shield** — DDoS protection. Standard: free, automatic. Advanced: paid, with DRT support and financial protection. Chapter 17. Domain 1.

**Snow Family** — Physical devices for offline bulk data transfer (Snowball Edge: 80 TB) — chartering a cargo flight instead of driving the highway. Legacy (2026): Snowmobile and Snowcone discontinued; Snow devices closed to new customers in November 2025 (AWS points to DataSync and Data Transfer Terminals), but the SAA-C03 exam still expects Snowball for "weeks of transfer, limited bandwidth." Chapter 25. Domain 3.

**SNS (Simple Notification Service)** — Pub/sub messaging. Pushes messages to all subscribers simultaneously. Fan-out pattern. Chapter 19. Domain 2.

**Sort key (DynamoDB)** — Optional second component of the primary key. Enables range queries within a partition. Chapter 9. Domain 3.

**Spot Instances** — EC2 instances using spare capacity at 60-90% discount. Can be interrupted with 2-minute notice. Only for fault-tolerant workloads. Chapter 27. Domain 4.

**SQS (Simple Queue Service)** — Managed message queue. Decouples producers from consumers. Standard (at-least-once) and FIFO (exactly-once) queues. Chapter 19. Domain 2.

**Step Functions** — Serverless workflow orchestration service. State machines for coordinating AWS services. Chapter 22. Domain 2.

**AWS Storage Gateway** — The bridge between on-premises and cloud storage: presents NFS/SMB (File), iSCSI (Volume), or virtual tape (Tape) interfaces locally while persisting data in S3, Glacier, or EBS snapshots. Chapter 6. Domain 3.

---

## T

**Target tracking scaling** — Auto Scaling policy that adjusts capacity to maintain a target metric value (e.g., 60% CPU utilization). Chapter 7. Domain 2.

**AWS Transfer Family** — Managed SFTP/FTPS/FTP endpoint backed by S3 or EFS. Partners keep their existing SFTP clients; files land directly in your bucket. Chapter 25. Domain 3.

**Transit Gateway** — Hub-and-spoke network topology connecting multiple VPCs and on-premises networks through a central gateway. Chapter 25. Domain 3.

**TTL (Time to Live)** — A timestamp after which DynamoDB automatically deletes an item. Also used in DNS (how long resolvers cache a record) and caching (how long a cached value is valid). Chapters 9, 12. Domain 3.

---

## V

**VIF (Virtual Interface)** — The logical connection used with AWS Direct Connect. Public VIF accesses AWS public endpoints; Private VIF accesses VPC resources. Chapter 25. Domain 3.

**Visibility timeout (SQS)** — The period during which a received message is hidden from other consumers. Allows processing without other consumers seeing the same message. Chapter 19. Domain 2.

**VPC (Virtual Private Cloud)** — An isolated virtual network in AWS. Contains subnets, route tables, and gateways. Chapter 11. Domain 1.

**VPC Endpoint** — Connects VPC resources to AWS services via AWS private network. Gateway (free, S3/DynamoDB) and Interface (priced, most other services). Chapter 30. Domain 1, 4.

**VPC Flow Logs** — Captures information about IP traffic going to and from network interfaces in a VPC. Used by GuardDuty and for network troubleshooting. Chapter 17. Domain 1.

**VPC Peering** — A network connection between two VPCs enabling traffic to route between them using private IP addresses. Chapter 11. Domain 3.

---

## W

**WAF (Web Application Firewall)** — Filters HTTP/HTTPS traffic using rules (IP blocks, SQL injection, rate limits). Attaches to CloudFront, ALB, or API Gateway. Chapter 17. Domain 1.

**AWS Wavelength** — AWS infrastructure deployed inside 5G telecommunications providers' networks at the radio edge. Enables single-digit millisecond latency to mobile devices. For mobile AR/VR, real-time gaming, autonomous vehicle telemetry, and live video at the 5G edge. Wavelength Zones are extensions of AWS Regions within telecom networks. Chapter 2. Domain 3.

**Well-Architected Framework** — AWS's six-pillar evaluation framework: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Chapter 31. Cross-domain.

**Weighted routing (Route 53)** — Distributes DNS queries across endpoints by weight. Used for blue-green deployments and A/B testing. Chapter 12. Domain 3.

**Write-through caching** — Updates the cache whenever the database is updated. Data is always consistent but cache may hold many items that are never re-read. Chapter 10. Domain 3.

---

## SAA-C03 Quick Pattern Reference

| If the exam says...                           | Think...                                     |
|-----------------------------------------------|----------------------------------------------|
| "Decouple services"                           | SQS, SNS, EventBridge                        |
| "Fan-out to multiple consumers"               | SNS + SQS subscriptions                      |
| "Real-time ordered events"                    | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Global low latency (dynamic)"                | Global Accelerator                           |
| "Global low latency (static/cached)"          | CloudFront                                   |
| "DDoS protection"                             | Shield (Standard: free; Advanced: paid)      |
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
| "Multi-AZ for RDS"                            | Automatic failover (not read scaling)        |
| "Read Replica for RDS"                        | Read scaling (not automatic failover)        |
| "Recovery time of 1–2 minutes, cross-AZ"      | Multi-AZ (RDS failover: 60–120 seconds)      |
| "Recovery across regions, minutes RTO"        | Pilot Light or Warm Standby                  |
| "Active-Active, zero RTO"                     | Multi-Region Active-Active (most complex)    |
| "Batch processing beyond Lambda timeout"      | AWS Batch                                    |
| "Redis-compatible AND durable"                | MemoryDB for Redis                           |
| "Remote engineers access VPC from home"       | Client VPN                                   |
| "Migrate database with minimal downtime"      | DMS (+ SCT for heterogeneous)                |
| "BI dashboard on AWS"                         | QuickSight                                   |
| "Run AWS in your own data center"             | Outposts                                     |
| "5G mobile edge compute"                      | Wavelength                                   |
