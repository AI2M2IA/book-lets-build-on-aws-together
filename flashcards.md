# AWS SAA-C03 Flashcards — Let's Learn AWS Together

One card per service. Format: **what it is · use when · keywords · key trade-off**.
Organized by SAA-C03 domain. Use the CSV version (`flashcards.csv`) to import into Anki.

---

## DOMAIN 1 — Secure Architectures (30%)

---

### IAM — Identity and Access Management
**What it is:** Controls who can do what in your AWS account. Users, groups, roles, and policies.
**Use when:** Any access control question. Always the answer when credentials or permissions are involved.
**Keywords:** user · group · role · policy · least privilege · trust policy · instance profile · SCP · permission boundary · explicit deny
**Trade-off:** Broad permissions are fast to set up but create blast radius. Least privilege is slower to configure but limits damage from compromised credentials.

---

### IAM Role
**What it is:** A temporary identity that AWS services (or users) can assume to get permissions — no long-lived credentials.
**Use when:** EC2 needs to access S3. Lambda needs to write to DynamoDB. Cross-account access.
**Keywords:** assume role · trust policy · instance profile · temporary credentials · STS · no access keys
**Trade-off:** Roles are safer than access keys (no secret to leak) but require the consuming code to refresh credentials automatically.

---

### AWS Organizations / SCPs
**What it is:** Manage multiple AWS accounts centrally. SCPs (Service Control Policies) set hard limits on what any account in an OU can do.
**Use when:** Multi-account setup. Prevent an entire OU from launching EC2 in certain regions. Enforce compliance guardrails.
**Keywords:** OU · management account · SCP · guardrail · consolidated billing
**Trade-off:** SCPs are powerful blunt instruments — they override everything, including root. One wrong SCP can break an account.

---

### VPC — Virtual Private Cloud
**What it is:** A logically isolated private network inside AWS. Your resources live here and are unreachable by default.
**Use when:** Any time you deploy EC2, RDS, Lambda in VPC, or need network isolation.
**Keywords:** subnet · route table · Internet Gateway · NAT Gateway · CIDR · private · public · peering · Transit Gateway
**Trade-off:** VPC gives strong isolation but requires upfront CIDR planning — CIDR blocks are hard to change later.

---

### Security Groups
**What it is:** Virtual firewall at the resource level (EC2, RDS, ALB). Stateful — allow inbound, response is automatically allowed.
**Use when:** Controlling which ports and IPs can reach a specific resource.
**Keywords:** stateful · inbound · outbound · allow only · no deny rules · instance-level · port 22 · port 443
**Trade-off:** Easy to configure, but lack of explicit deny means a misconfigured rule silently opens access.

---

### NACLs — Network Access Control Lists
**What it is:** Subnet-level firewall. Stateless — must explicitly allow both inbound AND outbound.
**Use when:** Blocking an IP range from an entire subnet. Extra layer below security groups.
**Keywords:** stateless · subnet-level · explicit allow + deny · rule number · inbound + outbound separate
**Trade-off:** More control than security groups but easier to misconfigure (forgetting return traffic breaks connections).

---

### KMS — Key Management Service
**What it is:** Creates and manages encryption keys. Never gives you the raw key material — encrypts and decrypts on your behalf.
**Use when:** Encrypting S3, EBS, RDS, Secrets Manager, or any service that integrates with KMS.
**Keywords:** CMK · AWS managed key · customer managed key · key policy · envelope encryption · rotation · CloudTrail audit
**Trade-off:** AWS Managed Keys are free and automatic. Customer Managed Keys give you control over rotation and deletion but cost $1/month/key.

---

### Secrets Manager
**What it is:** Stores and automatically rotates secrets (DB passwords, API keys). Applications fetch secrets at runtime — no secrets in code.
**Use when:** Database credentials. API keys. Any secret that should never be in source code or environment variables.
**Keywords:** automatic rotation · Lambda rotation function · versioning · cross-account · no plaintext secrets
**Trade-off:** ~$0.40/secret/month. Cheaper than one data breach.

---

### AWS Shield
**What it is:** DDoS protection. Standard is automatic and free. Advanced adds SRT support and cost protection.
**Use when:** Any internet-facing workload needs Standard (always on). Advanced for high-profile targets or SLA guarantees.
**Keywords:** DDoS · Layer 3/4 · SYN flood · volumetric · Shield Standard (free) · Shield Advanced ($3k/month) · SRT
**Trade-off:** Standard covers the common attacks for free. Advanced is expensive but the SRT and cost protection matter at enterprise scale.

---

### AWS WAF — Web Application Firewall
**What it is:** Inspects HTTP requests at Layer 7. Blocks SQL injection, XSS, bots, specific IPs, rate limits.
**Use when:** Protecting APIs or web apps from OWASP Top 10. Rate limiting. Bot control.
**Keywords:** Web ACL · managed rules · OWASP Top 10 · rate limit · SQL injection · XSS · CloudFront / ALB / API Gateway attachment
**Trade-off:** Managed rules are quick to enable but can produce false positives. Custom rules require knowledge of HTTP attack patterns.

---

### Amazon GuardDuty
**What it is:** Behavioral threat detection. Analyzes CloudTrail, VPC Flow Logs, and DNS logs using ML to detect anomalies.
**Use when:** You want to detect compromised credentials, unusual API calls, malware communications — without building your own SIEM.
**Keywords:** behavioral · ML · findings · CloudTrail · VPC Flow Logs · DNS · Tor exit node · cryptocurrency mining · 30-day free trial
**Trade-off:** Low effort to enable. Findings require human review — GuardDuty detects, it doesn't fix.

---

### AWS CloudTrail
**What it is:** Records every API call in your account — who did what, when, from where, with what result.
**Use when:** Auditing. Compliance. Forensics after an incident. Foundation for GuardDuty, Config, Security Hub.
**Keywords:** API audit · 90-day default · S3 trail for long-term · log integrity validation · management events · data events
**Trade-off:** Free for 90-day console history. Long-term retention requires S3 + storage cost. Data events (S3 object-level) generate high volume.

---

### Amazon Macie
**What it is:** Uses ML to discover and classify sensitive data (PII, credentials, financial data) in S3.
**Use when:** You need to know if an S3 bucket contains customer names, credit cards, or access keys you forgot about.
**Keywords:** PII · sensitive data · S3 classification · ML · data privacy · findings
**Trade-off:** Macie vs GuardDuty — Macie finds sensitive DATA in S3. GuardDuty finds suspicious BEHAVIOR in logs. Different use cases.

---

## DOMAIN 2 — Resilient Architectures (26%)

---

### Multi-AZ (High Availability)
**What it is:** Spreading resources across multiple Availability Zones so one AZ failure doesn't take down the service.
**Use when:** Any production workload. RDS Multi-AZ. ALB across AZs. ASG across AZs.
**Keywords:** AZ failure · standby · automatic failover · RDS ~60s failover · RPO ≈ 0 · RTO < 2 min · same region
**Trade-off:** Multi-AZ roughly doubles infrastructure cost but protects against the most common AWS failure mode.

---

### Multi-Region (Disaster Recovery)
**What it is:** Replicating infrastructure and data to a second AWS Region. Protects against full regional failures.
**Use when:** RPO/RTO requirements that Multi-AZ can't meet. Global user base needing low latency everywhere.
**Keywords:** RPO · RTO · pilot light · warm standby · active-active · Aurora Global · Route 53 failover · cross-region replication
**Trade-off:** Much higher cost and complexity than Multi-AZ. Regional failures are rare — validate the business case before building multi-region.

---

### Auto Scaling Group (ASG)
**What it is:** Automatically adds/removes EC2 instances based on load. Replaces unhealthy instances automatically.
**Use when:** Variable traffic. High availability. Stateless compute workloads.
**Keywords:** launch template · scaling policy · target tracking · min/max/desired · health check · scale-in · scale-out · cooldown · warm pool
**Trade-off:** Scales horizontally but takes minutes. For zero-latency scaling, pre-warm with Warm Pools or use Lambda/Fargate.

---

### Application Load Balancer (ALB)
**What it is:** Layer 7 load balancer. Distributes HTTP/HTTPS traffic to targets (EC2, ECS, Lambda) based on path, host, headers.
**Use when:** Web apps, APIs, microservices. Path-based routing (`/api/*` vs `/static/*`). SSL termination.
**Keywords:** Layer 7 · target group · listener rule · path routing · host routing · sticky sessions · health check · WAF attachment
**Trade-off:** ALB for HTTP/HTTPS. NLB for TCP/UDP/extreme performance. Both are managed — no server to patch.

---

### Amazon SQS — Simple Queue Service
**What it is:** Fully managed message queue. Decouples producers from consumers. Messages persist until consumed.
**Use when:** Decouple services. Buffer spiky workloads. Retry failed jobs. Async processing.
**Keywords:** queue · message · visibility timeout · DLQ · at-least-once · FIFO · Standard · polling · decoupling
**Trade-off:** Standard: high throughput, messages may arrive out of order or duplicate. FIFO: exactly-once, ordered, but 3,000 msg/s ceiling.

---

### Amazon SNS — Simple Notification Service
**What it is:** Pub/sub messaging. One publisher, many subscribers (SQS, Lambda, email, SMS, HTTP).
**Use when:** Fan-out (one event → multiple consumers). Notifications. Push to multiple endpoints at once.
**Keywords:** topic · publisher · subscriber · fan-out · push · SQS + SNS pattern · SMS · email · Lambda trigger
**Trade-off:** SNS pushes (fire and forget). SQS pulls (consumer controls pace). Combine them for fan-out with independent processing rates.

---

### AWS Lambda
**What it is:** Runs code in response to events without managing servers. Pay per invocation and per ms of execution.
**Use when:** Event-driven, short-duration, spiky, or infrequent workloads. Zero idle cost needed.
**Keywords:** serverless · event trigger · cold start · 15-min limit · stateless · SQS/S3/API Gateway trigger · provisioned concurrency · reserved concurrency
**Trade-off:** Zero idle cost but cold starts can add latency. 15-minute hard limit excludes long-running jobs.

---

### AWS Step Functions
**What it is:** Orchestrates multi-step workflows as state machines. Tracks state, handles retries, records execution history.
**Use when:** Multi-step processes where any step can fail independently. Order flows. Data pipelines. Long-running workflows.
**Keywords:** state machine · workflow · retry · catch · execution history · Standard (90-day) · Express (5-min) · idempotency
**Trade-off:** Standard workflow: durable, auditable, $0.025/1k transitions. Express: fast and cheap but no audit history.

---

### Amazon ECS — Elastic Container Service
**What it is:** Runs Docker containers on AWS. Fargate (serverless) or EC2 (self-managed hosts).
**Use when:** Containerized microservices. Long-running services. Teams moving off EC2 to containers.
**Keywords:** task definition · ECS service · Fargate · EC2 launch type · ECR · task IAM role · service auto scaling · ALB integration
**Trade-off:** ECS for AWS-native simplicity. EKS if you already use Kubernetes or need the ecosystem. Fargate if you don't want to manage hosts.

---

### Amazon EKS — Elastic Kubernetes Service
**What it is:** Managed Kubernetes control plane. You run worker nodes (EC2 or Fargate). Use when you need the Kubernetes ecosystem.
**Use when:** Migrating existing K8s workloads. Team already knows Kubernetes. Multi-cloud portability needed.
**Keywords:** Kubernetes · control plane · worker nodes · pod · namespace · Helm · Fargate profile · EKS Anywhere
**Trade-off:** More operational complexity than ECS. The right choice if Kubernetes-specific tooling matters to your team.

---

## DOMAIN 3 — High-Performing Architectures (24%)

---

### Amazon EC2 — Elastic Compute Cloud
**What it is:** Virtual machines in the cloud. Choose CPU, memory, storage, OS. Pay per hour.
**Use when:** Persistent, stateful, or long-running compute. Custom OS. Applications that need full server control.
**Keywords:** instance type · AMI · key pair · instance profile · EBS-backed · On-Demand · Reserved · Spot · placement group · UserData
**Trade-off:** Maximum control but maximum management responsibility. The more managed a workload, the less you should use raw EC2.

---

### Amazon S3 — Simple Storage Service
**What it is:** Object storage. Store any file in buckets. Eleven-nines durability. Scales to any size.
**Use when:** Static files, images, backups, logs, data lakes, static websites. Anything not needing a filesystem.
**Keywords:** bucket · object · key · eleven-nines · versioning · lifecycle · storage class · presigned URL · event notification · Block Public Access
**Trade-off:** Not a filesystem — S3 is key-value. Can't mount it. Latency is higher than block storage. Use EBS/EFS for file I/O.

---

### Amazon EBS — Elastic Block Store
**What it is:** Persistent block storage for a single EC2 instance. Acts like an attached hard drive. Survives instance stop/start.
**Use when:** OS disk for EC2. Database storage (RDS uses EBS). Any app needing fast, local-style I/O.
**Keywords:** volume · snapshot · gp3 · io2 · st1 · AZ-bound · one instance · IOPS · throughput · encryption · Fast Snapshot Restore
**Trade-off:** Tied to one AZ and one instance (except io2 Multi-Attach). Must snapshot for backup/cross-AZ migration.

---

### Amazon EFS — Elastic File System
**What it is:** Managed NFS filesystem. Mounts to multiple EC2 instances simultaneously. Grows automatically.
**Use when:** Shared file storage across multiple EC2 instances. CMS media. Shared configs. Multi-AZ shared state.
**Keywords:** NFS · shared · multi-instance · elastic · Bursting · Provisioned throughput · One Zone · Standard · lifecycle
**Trade-off:** Higher cost than EBS. Slower than EBS for single-instance I/O. Right choice only when multiple instances need the same data.

---

### Amazon RDS — Relational Database Service
**What it is:** Managed relational database (PostgreSQL, MySQL, MariaDB, Oracle, SQL Server). AWS handles patching, backups, failover.
**Use when:** Relational data with complex queries. Transactional consistency needed. Team shouldn't manage the database engine.
**Keywords:** managed · Multi-AZ · read replica · automated backups · point-in-time recovery · parameter groups · RDS Proxy · no OS access
**Trade-off:** You give up OS-level access. Can't do custom extensions that require OS. Write scaling requires Aurora or sharding.

---

### Amazon Aurora
**What it is:** AWS-built MySQL/PostgreSQL-compatible database. Shared distributed storage (6 copies across 3 AZs). 5× faster than MySQL.
**Use when:** High availability + performance for relational workloads. Replacing RDS when you hit its limits. Global applications.
**Keywords:** shared storage · 6 copies · 3 AZs · read replicas (up to 15) · Aurora Global · Serverless v2 · Backtrack · ~30s failover
**Trade-off:** Higher base cost than RDS. Worth it for write-heavy or read-heavy workloads needing high availability.

---

### Amazon DynamoDB
**What it is:** Fully managed NoSQL key-value and document store. Single-digit millisecond latency at any scale.
**Use when:** High-throughput key-based lookups. Flexible schema. Unpredictable or massive scale. Session data, shopping carts.
**Keywords:** partition key · sort key · GSI · LSI · on-demand · provisioned · DynamoDB Streams · DAX · hot partition
**Trade-off:** No complex joins or transactions across tables (well, limited transactions exist). Access pattern must be designed upfront — schema changes are expensive.

---

### Amazon ElastiCache
**What it is:** Managed in-memory cache (Redis or Memcached). Stores frequently-read data to reduce database load.
**Use when:** Database reads are slow and repetitive. Session storage. Leaderboards. Rate limiting.
**Keywords:** Redis · Memcached · cache hit · cache miss · TTL · eviction · cluster · replication · Sub-millisecond latency
**Trade-off:** Cache is eventually consistent. Cache invalidation (knowing when to expire a cached value) is the hard part.

---

### Amazon CloudFront
**What it is:** CDN (Content Delivery Network). Caches content at 400+ edge locations globally. Reduces origin load and latency.
**Use when:** Static assets, images, video. Global user base. API acceleration. DDoS absorption at the edge.
**Keywords:** edge location · origin · cache behavior · TTL · invalidation · presigned URL · Lambda@Edge · CloudFront Functions · WAF attachment
**Trade-off:** Cache reduces latency but stale content can persist until TTL expires. Set TTL carefully for frequently-changing content.

---

### Amazon Route 53
**What it is:** AWS DNS service. Registers domains. Routes traffic globally with health checks and routing policies.
**Use when:** Domain registration. DNS failover. Weighted/latency/geolocation routing. Health-check-based routing.
**Keywords:** hosted zone · A record · CNAME · alias · health check · failover · latency routing · weighted routing · geolocation · TTL
**Trade-off:** Routing policies add resilience but add complexity. Latency routing needs endpoints in multiple regions to be useful.

---

### Amazon Kinesis Data Streams
**What it is:** Real-time data streaming. Multiple consumers read the same stream independently. Data retained for 24h–365 days.
**Use when:** Real-time analytics. Multiple consumers reading the same event stream. Order must be maintained per shard.
**Keywords:** shard · producer · consumer · retention · replay · partition key · Enhanced Fan-Out · Kinesis vs SQS
**Trade-off:** Kinesis: replay data, multiple consumers, ordered per shard, must provision shards. SQS: message disappears after consumption, simpler, auto-scales.

---

### AWS Glue
**What it is:** Serverless ETL (Extract, Transform, Load). Discovers schemas (Glue Crawler), stores metadata (Data Catalog), runs Spark jobs.
**Use when:** Building data pipelines. Transforming raw data for analytics. Schema discovery for S3 data.
**Keywords:** ETL · crawler · Data Catalog · Spark · serverless · schema · partition · Parquet conversion · job bookmark
**Trade-off:** Glue is powerful but cold-start time for jobs can be minutes. For sub-second latency, use Kinesis + Lambda.

---

### Amazon Athena
**What it is:** Serverless SQL engine that queries data directly in S3. Pay per TB scanned.
**Use when:** Ad-hoc analysis on S3 data. Log analysis. Running SQL without a database server.
**Keywords:** serverless SQL · S3 · Parquet · partition · $5/TB scanned · Glue Data Catalog · pay per query · Workgroups
**Trade-off:** Parquet + partitioning can reduce scan cost by 99%. Unoptimized queries on large datasets are expensive.

---

## DOMAIN 4 — Cost-Optimized Architectures (20%)

---

### EC2 On-Demand
**What it is:** Pay per hour/second, no commitment. Start and stop anytime.
**Use when:** Short-term, unpredictable workloads. Dev/test. Anything you can't commit to.
**Keywords:** no commitment · per second · most expensive · baseline · flexible
**Trade-off:** Maximum flexibility, maximum price. Baseline for comparison.

---

### EC2 Reserved Instances / Savings Plans
**What it is:** Commit to a usage amount for 1 or 3 years. Up to 72% discount vs On-Demand.
**Use when:** Predictable, steady-state workloads running 24/7. Production web servers. Databases.
**Keywords:** 1-year · 3-year · Standard RI · Convertible RI · Compute Savings Plan · EC2 Savings Plan · break-even ~7 months
**Trade-off:** Discount in exchange for commitment. Standard RIs lock you to instance family/region. Compute Savings Plans are flexible.

---

### EC2 Spot Instances
**What it is:** Use spare AWS capacity at up to 90% discount. AWS can reclaim with 2-minute warning.
**Use when:** Fault-tolerant, stateless, interruptible workloads. Batch jobs. CI/CD. Data processing with checkpointing.
**Keywords:** 2-minute warning · interruption · checkpoint · Spot Fleet · diversification · not for databases · not for critical APIs
**Trade-off:** Massive savings but no availability guarantee. Design for interruption or don't use Spot.

---

### S3 Storage Classes
**What it is:** Different tiers for different access patterns. Cheaper for data you access less often.
**Use when:** Data with different access frequencies. Lifecycle policies to move data automatically.

| Class | Access | Retrieval | Use for |
|---|---|---|---|
| Standard | Frequent | Immediate | Active data |
| Standard-IA | Infrequent | Immediate | Monthly access |
| Glacier Instant | Rare | Immediate | Archives, fast recall |
| Glacier Flexible | Very rare | Minutes–hours | Long-term archives |
| Deep Archive | Almost never | Up to 12h | Compliance archives |
| Intelligent-Tiering | Unknown | Immediate | Unpredictable access |

**Trade-off:** Lower per-GB price → retrieval fee. Intelligent-Tiering has no retrieval fee but a per-object monitoring charge (bad for millions of tiny files).

---

### NAT Gateway
**What it is:** Allows private subnet resources to initiate outbound internet connections. Internet cannot initiate inbound.
**Use when:** EC2/Lambda in private subnets need to download packages, call external APIs.
**Keywords:** outbound only · public subnet · private subnet · one-way door · per-hour + per-GB · HA = one per AZ · VPC endpoint avoids it
**Trade-off:** Per-GB processing fee adds up. Use VPC Gateway Endpoints for S3/DynamoDB (free) to avoid routing through NAT.

---

### VPC Endpoints
**What it is:** Private connection from your VPC to AWS services — no internet, no NAT Gateway.
**Use when:** EC2 in private subnet needs to reach S3 or DynamoDB without going through NAT.
**Keywords:** Gateway endpoint (S3, DynamoDB — free) · Interface endpoint (other services — $/hr) · no internet · PrivateLink
**Trade-off:** Gateway endpoints for S3/DynamoDB are free and should always be used. Interface endpoints cost ~$0.01/hr per AZ.

---

## CROSS-DOMAIN CONCEPTS

---

### Shared Responsibility Model
**What it is:** AWS secures the cloud infrastructure. You secure what you put in it.
**AWS responsible for:** Physical hardware · data centers · hypervisors · global network
**You responsible for:** Your data · OS patching (EC2) · IAM config · app security · network settings
**Key nuance:** The more managed the service, the more responsibility shifts to AWS. RDS: AWS patches the DB engine. EC2: you patch the OS.

---

### RTO and RPO
**RTO (Recovery Time Objective):** How long can the system be down before it becomes a business problem?
**RPO (Recovery Point Objective):** How much data can you lose? (Time between last backup and the failure)
**Memory aid:** RTO = time to recover. RPO = data you're willing to lose.
**Exam pattern:** Scenario says "RPO of 1 hour" → backups every hour. "RPO of 0" → synchronous replication (Multi-AZ). Careful: Aurora Global Database replicates **asynchronously** across regions — RPO is near zero (~1s), not zero.

---

### Well-Architected Framework — 6 Pillars
| Pillar | One-line | Key question |
|---|---|---|
| Operational Excellence | Run and improve systems | Do you have runbooks? IaC? |
| Security | Protect data and systems | Least privilege? Encryption? |
| Reliability | Recover from failures | Multi-AZ? Backups? Tested? |
| Performance Efficiency | Use resources efficiently | Right instance type? Cache? |
| Cost Optimization | Avoid unnecessary spend | Reserved? Lifecycle? Right-sized? |
| Sustainability | Minimize environmental impact | Graviton? Efficient regions? |

---

### CapEx vs OpEx
**CapEx (Capital Expenditure):** Buy hardware upfront. Depreciate over time. On-premises.
**OpEx (Operational Expenditure):** Pay as you go. Monthly bill. Cloud.
**Exam signal:** "Eliminate upfront costs" / "shift from CapEx to OpEx" → cloud adoption answer.

---

### Exam Pattern Recognition (Quick Reference)

| Scenario keyword | Think |
|---|---|
| "Decouple services" | SQS / SNS |
| "Serverless" | Lambda · DynamoDB · Aurora Serverless · Fargate |
| "Global low latency" | CloudFront · Global Accelerator · Aurora Global · DynamoDB Global |
| "DDoS protection" | Shield · CloudFront · WAF |
| "Detect anomalous behavior" | GuardDuty |
| "Sensitive data in S3" | Macie |
| "Audit all API calls" | CloudTrail |
| "Compliance / configuration drift" | AWS Config |
| "Scale to zero, pay per request" | Lambda · DynamoDB On-Demand · Fargate |
| "Shared file storage (multiple EC2)" | EFS |
| "Block storage (single EC2)" | EBS |
| "Object storage" | S3 |
| "Managed relational DB, complex queries" | RDS · Aurora |
| "High-throughput key-value, flexible schema" | DynamoDB |
| "Cost optimization — compute" | Savings Plans · Reserved Instances · Spot |
| "Cost optimization — storage" | S3 lifecycle · gp2 → gp3 migration · EBS orphan cleanup |
| "RPO = 0 (no data loss, same region)" | Multi-AZ RDS (synchronous standby) |
| "Cross-region DR, RPO ~1s, RTO < 1 min" | Aurora Global Database (async, near-zero — not zero — RPO) |
| "Real-time stream, multiple consumers" | Kinesis Data Streams |
| "Message queue, one consumer" | SQS |
| "Encrypt data at rest" | KMS + S3/EBS/RDS encryption |
| "Credentials in code is a problem" | Secrets Manager · IAM Roles |
| "Private connection to AWS services" | VPC Endpoints |
| "On-premises to AWS private link" | Direct Connect · VPN |
