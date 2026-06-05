# Appendix D: Full Practice Exam (65 Questions)

This is a full-length SAA-C03 practice exam: 65 questions, mirroring the real exam's domain weights — Design Secure Architectures (Questions 1–20, ~30%), Design Resilient Architectures (21–37, ~26%), Design High-Performing Architectures (38–53, ~24%), and Design Cost-Optimized Architectures (54–65, ~20%).

**How to take it:**

- Set a timer for **130 minutes** — the real exam's duration. Practice the pacing: that's two minutes per question.
- Seven questions say **"(Choose TWO.)"** — they have five options and exactly two correct answers, just like the real exam's multiple-response items. Both must be correct to score the question.
- Don't look at the answer key until you've finished all 65. On the real exam there's no feedback mid-flight, and training your tolerance for uncertainty is part of the preparation.
- The real exam includes 15 unscored experimental questions you can't identify. All 65 here are "scored." A passing benchmark: **47 or more correct (~72%)** puts you in the range of the 720/1000 scaled passing score. Below 47, revisit the chapters mapped in Appendix B for your weak domains before booking the exam.
- For every question you miss — and every question you get right but hesitated on — read the distractor analysis. The exam tests the *differences* between plausible options, and that's where the learning lives.

---

## Part 1 — Design Secure Architectures (Questions 1–20)

**Question 1** *(Domain 1 — Task 1.1)*
A financial services company uses AWS Organizations with all features enabled. The security team attached a service control policy (SCP) to the root of the organization that denies the use of all AWS Regions except eu-west-1. During an audit, the team discovers that an administrator in one account was still able to launch EC2 instances in us-east-2 despite the SCP. Which account most likely allowed this action?

A) A member account in a nested organizational unit (OU), because SCPs do not propagate to nested OUs
B) The management account, because SCPs do not apply to the management account
C) A member account whose IAM administrator policy includes an explicit Allow, which overrides SCPs
D) A member account created after the SCP was attached, because SCPs only apply to accounts that existed at attachment time

**Question 2** *(Domain 1 — Task 1.1)*
A startup wants to allow its developers to create IAM roles for their applications, but the security team is concerned that developers could create roles with more permissions than the developers themselves have, leading to privilege escalation. The security team wants developers to retain self-service role creation. What is the MOST appropriate solution?

A) Require developers to submit role creation requests through a ticketing system reviewed by the security team
B) Attach an SCP to the developers' accounts that denies the iam:CreateRole action entirely
C) Require that all roles created by developers include a specific permissions boundary, enforced with an IAM condition on iam:CreateRole and iam:AttachRolePolicy
D) Enable AWS CloudTrail and configure alerts whenever a developer creates a new IAM role

**Question 3** *(Domain 1 — Task 1.1)*
A SaaS provider needs to access resources in its customers' AWS accounts to perform automated cost analysis. Customers create an IAM role that the SaaS provider's account can assume. A security consultant warns that a third party who learns a customer's role ARN could trick the SaaS provider into accessing that customer's account on the third party's behalf. Which mechanism mitigates this "confused deputy" risk?

A) Require multi-factor authentication (MFA) on the cross-account role's trust policy
B) Require the SaaS provider to pass a unique ExternalId, defined by the customer, in the sts:AssumeRole call and validated by a condition in the role's trust policy
C) Encrypt the role ARN with AWS KMS before sharing it with the SaaS provider
D) Replace the cross-account role with an IAM user whose access keys are rotated every 90 days

**Question 4** *(Domain 1 — Task 1.1)*
A company with 40 AWS accounts in AWS Organizations wants its employees to sign in once with their existing Microsoft Entra ID (Azure AD) credentials and access all AWS accounts through a single portal, with permissions assigned centrally per account. Which solution meets these requirements with the LEAST operational overhead?

A) Create IAM users in each of the 40 accounts and synchronize passwords with Entra ID
B) Configure AWS IAM Identity Center with Entra ID as the external identity provider and assign permission sets to users and groups per account
C) Deploy Amazon Cognito user pools in each account and federate them to Entra ID
D) Create a SAML identity provider in each account and write per-account IAM roles and trust policies manually

**Question 5** *(Domain 1 — Task 1.1)*
A mobile gaming company is building an app where players sign up with an email address or social login, and after authentication the app must upload player screenshots directly to an Amazon S3 bucket using temporary AWS credentials. Which combination of services should the solutions architect recommend?

A) An Amazon Cognito user pool for sign-up/sign-in, and an Amazon Cognito identity pool to exchange the authenticated token for temporary AWS credentials
B) An Amazon Cognito identity pool for sign-up/sign-in, and an Amazon Cognito user pool to issue temporary AWS credentials
C) AWS IAM Identity Center for sign-up/sign-in, and AWS STS GetSessionToken for credentials
D) An Amazon Cognito user pool alone, because user pool tokens grant direct access to S3

**Question 6** *(Domain 1 — Task 1.3)*
A healthcare company must encrypt data in Amazon S3 with a key that supports automatic annual rotation managed by AWS, while still allowing the company to define the key policy, enable CloudTrail logging of key usage, and disable the key if needed. Which KMS key type meets these requirements?

A) An AWS managed key (aws/s3)
B) A customer managed key with automatic rotation enabled
C) An AWS owned key
D) An imported key material (BYOK) customer managed key with automatic rotation enabled

**Question 7** *(Domain 1 — Task 1.3)*
A solutions architect is explaining how AWS KMS encrypts a 4 GB file stored by an application, given that KMS can only encrypt up to 4 KB of data directly. Which statement accurately describes envelope encryption?

A) KMS splits the file into 4 KB chunks and encrypts each chunk with the KMS key
B) The application requests a data key from KMS, encrypts the file locally with the plaintext data key, then stores the encrypted data key alongside the data and discards the plaintext data key
C) KMS streams the file through the KMS API, which encrypts it server-side with the KMS key
D) The application encrypts the file with a hard-coded symmetric key, and KMS signs the result for integrity

**Question 8** *(Domain 1 — Task 1.3)*
A company stores an Amazon RDS for PostgreSQL master password and needs it rotated automatically every 30 days without application downtime. The application keeps long-lived database connections, so the team wants a rotation strategy where the previous credential remains valid while the new one is activated. Which solution meets these requirements?

A) AWS Systems Manager Parameter Store SecureString parameters with a Lambda function triggered monthly
B) AWS Secrets Manager with the single-user rotation strategy
C) AWS Secrets Manager with the alternating-users rotation strategy, which switches between two database users so one credential always remains valid
D) AWS KMS automatic key rotation applied to the database password

**Question 9** *(Domain 1 — Task 1.3)*
A media company stores raw video in Amazon S3. Compliance requires that the company manage and supply its own encryption keys, that AWS never store those keys, and that the keys be provided with every request. Which encryption option meets these requirements?

A) SSE-S3
B) SSE-KMS with a customer managed key
C) SSE-C
D) Client-side encryption using the AWS managed key aws/s3

**Question 10** *(Domain 1 — Task 1.3)*
A broker-dealer must retain trade records in Amazon S3 for seven years in a way that prevents anyone—including the AWS account root user—from deleting or overwriting the objects during the retention period, to satisfy SEC Rule 17a-4. Which configuration meets this requirement?

A) S3 Object Lock in governance mode with a 7-year retention period
B) S3 Object Lock in compliance mode with a 7-year retention period on a versioning-enabled bucket
C) An S3 bucket policy denying s3:DeleteObject for all principals
D) S3 Glacier Deep Archive with a lifecycle rule that expires objects after 7 years

**Question 11** *(Domain 1 — Task 1.2)*
A web application runs on EC2 instances behind an Application Load Balancer. A network engineer adds a network ACL rule to the subnet allowing inbound TCP port 443 from 0.0.0.0/0, but clients still cannot complete HTTPS requests. The security groups are configured correctly. What is the MOST likely cause?

A) The network ACL is stateful and requires a connection-tracking rule
B) The network ACL has no outbound rule allowing ephemeral ports (1024–65535), so return traffic is blocked because NACLs are stateless
C) The security group must also allow outbound port 443, because security groups are stateless
D) Network ACLs cannot allow traffic from 0.0.0.0/0; a specific CIDR is required

**Question 12** *(Domain 1 — Task 1.2)*
Which TWO statements about security groups and network ACLs in a VPC are accurate? (Choose TWO.)

A) Security groups are stateful, so return traffic is automatically allowed regardless of outbound rules
B) Network ACLs evaluate rules in numerical order and support explicit Deny rules
C) Security groups support both Allow and Deny rules
D) Network ACLs are attached to individual elastic network interfaces
E) Security group rules are evaluated in numerical order, stopping at the first match

**Question 13** *(Domain 1 — Task 1.2)*
An e-commerce company running a public-facing application on CloudFront and ALB is concerned about large, sophisticated DDoS attacks. The company wants 24/7 access to the AWS Shield Response Team, cost protection against scaling charges caused by attacks, and attack diagnostics. Which service should it use?

A) AWS Shield Standard, which is enabled automatically at no cost
B) AWS Shield Advanced
C) AWS WAF with rate-based rules
D) Amazon GuardDuty with the EC2 protection plan

**Question 14** *(Domain 1 — Task 1.2)*
A REST API behind an Application Load Balancer is being attacked with SQL injection attempts and excessive requests from a small set of IP addresses. Which solution blocks the malicious request patterns at the edge of the application with the LEAST development effort?

A) Add input validation code to every API handler
B) Associate AWS WAF with the ALB, using the SQL injection managed rule group and a rate-based rule
C) Enable AWS Shield Standard on the ALB
D) Configure the ALB security group to deny requests containing SQL keywords

**Question 15** *(Domain 1 — Task 1.2)*
A company wants to address three security needs: (1) continuously detect compromised EC2 instances and anomalous API activity using threat intelligence, (2) discover and classify personally identifiable information (PII) stored in S3 buckets, and (3) scan EC2 instances and container images for software vulnerabilities (CVEs). Which mapping of AWS services to needs is correct?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Question 16** *(Domain 1 — Task 1.2)*
An application running on EC2 instances in private subnets must upload objects to Amazon S3 and call Amazon DynamoDB. Corporate policy forbids the traffic from traversing the public internet, and the team wants the lowest-cost option for both services. Which solution meets these requirements?

A) A NAT gateway in a public subnet
B) Gateway VPC endpoints for S3 and DynamoDB, referenced in the subnets' route tables
C) Interface VPC endpoints (AWS PrivateLink) for S3 and DynamoDB
D) An internet gateway with restrictive security group rules

**Question 17** *(Domain 1 — Task 1.3)*
After a server-side request forgery (SSRF) incident in which an attacker retrieved IAM role credentials from an EC2 instance's metadata service via a vulnerable web application, a security team wants to harden all instances against this attack class. What should the team do?

A) Enforce IMDSv2 by requiring session tokens (HttpTokens=required), so metadata requests need a PUT-obtained token that simple SSRF requests cannot acquire
B) Disable the instance metadata service on all instances, since applications never need it
C) Block 169.254.169.254 in the subnet's network ACL
D) Move the instance role's credentials into a configuration file on the instance

**Question 18** *(Domain 1 — Task 1.3)*
A solutions architect must store about 200 plaintext application configuration values (feature flags, environment names, endpoint URLs) and 5 database passwords. The passwords require automatic rotation; the configuration values do not, and the team wants to minimize cost. Which combination is MOST cost-effective?

A) Store everything in AWS Secrets Manager
B) Store everything in AWS Systems Manager Parameter Store standard parameters
C) Store configuration values in Parameter Store standard parameters (no charge) and the passwords in AWS Secrets Manager with rotation enabled
D) Store configuration values in S3 and the passwords in Parameter Store SecureString parameters with built-in automatic rotation

**Question 19** *(Domain 1 — Task 1.3)*
A company encrypts S3 objects with SSE-KMS using a customer managed key. An application in the same account reads these objects thousands of times per second, and the team is seeing throttling and cost concerns from KMS API calls. Which change reduces KMS request traffic while keeping SSE-KMS encryption?

A) Switch the bucket to SSE-S3, which uses no keys
B) Enable S3 Bucket Keys, so S3 uses a short-lived bucket-level key to reduce calls to KMS
C) Disable automatic key rotation on the customer managed key
D) Replace the customer managed key with imported key material

**Question 20** *(Domain 1 — Task 1.1)*
Which TWO statements about IAM policy evaluation and AWS Organizations are accurate? (Choose TWO.)

A) SCPs grant permissions to IAM users and roles in member accounts
B) An explicit Deny in any applicable policy always overrides any Allow
C) Resource-based policies cannot grant cross-account access without an SCP
D) A permissions boundary sets the maximum permissions an identity-based policy can grant to a user or role, but grants nothing by itself
E) If no policy mentions an action, the action is allowed by default for IAM users

---

## Part 2 — Design Resilient Architectures (Questions 21–37)

**Question 21** *(Domain 2 — Task 2.2)*
An online retailer runs Amazon RDS for MySQL. The database experiences heavy read traffic from reporting dashboards, and the company also needs the database to survive an Availability Zone failure with automatic failover and no manual intervention. Which combination addresses BOTH requirements?

A) Enable Multi-AZ deployment only; the standby instance can serve the reporting reads
B) Create read replicas only; a replica is automatically promoted when the primary's AZ fails
C) Enable Multi-AZ deployment for automatic failover, and add read replicas to offload the reporting reads
D) Migrate to a larger single-AZ instance class to handle both workloads

**Question 22** *(Domain 2 — Task 2.2)*
A company wants RDS high availability across Availability Zones, but it objects to paying for a traditional Multi-AZ standby instance that serves no traffic. Which RDS deployment option provides automatic failover AND allows the standby capacity to serve read traffic?

A) RDS Multi-AZ DB instance deployment (one standby)
B) RDS Multi-AZ DB cluster deployment, which has two readable standby instances with a reader endpoint
C) RDS read replicas in three AZs with an Application Load Balancer
D) RDS Single-AZ with automated backups

**Question 23** *(Domain 2 — Task 2.2)*
A global payments platform on Amazon Aurora must fail over to a second AWS Region if the primary Region becomes unavailable. The compliance team asks whether Aurora Global Database can guarantee zero data loss (RPO = 0) across Regions. What should the solutions architect tell them?

A) Yes — Aurora Global Database replicates synchronously across Regions, so RPO is exactly 0
B) No — Aurora Global Database uses asynchronous storage-based replication with typical lag under 1 second, so the cross-Region RPO is near zero but never guaranteed to be exactly 0
C) Yes — but only if write forwarding is enabled on the secondary Region
D) No — Aurora Global Database replicates on a 5-minute schedule, giving a 5-minute RPO

**Question 24** *(Domain 2 — Task 2.2)*
A company's disaster recovery plan states: "After a Regional outage, the order system must be running again within 4 hours, and no more than 15 minutes of transactions may be lost." Which statement correctly maps these numbers to DR metrics?

A) RTO = 15 minutes; RPO = 4 hours
B) RTO = 4 hours; RPO = 15 minutes
C) MTBF = 4 hours; MTTR = 15 minutes
D) RPO = 4 hours; SLA = 15 minutes

**Question 25** *(Domain 2 — Task 2.2)*
An insurance company needs a DR strategy for a critical application. Requirements: data must be continuously replicated to the DR Region; core infrastructure (database, AMIs, minimal stack) must already exist in the DR Region but compute should remain switched off until a disaster, to control cost; an RTO of tens of minutes is acceptable. Which DR strategy matches?

A) Backup and restore
B) Pilot light — core elements provisioned in the DR Region with data live-replicated, but compute off until failover
C) Warm standby — a scaled-down but always-running full copy of the workload
D) Multi-site active/active

**Question 26** *(Domain 2 — Task 2.2)*
Which TWO statements about AWS disaster recovery strategies are accurate? (Choose TWO.)

A) Backup and restore requires resources to be pre-provisioned and running in the recovery Region
B) Backup and restore offers the lowest RTO of the four strategies
C) Multi-site active/active serves traffic from multiple Regions simultaneously and offers an RTO near zero at the highest cost
D) Pilot light keeps a full-capacity copy of the application serving production traffic in the recovery Region
E) Warm standby keeps a scaled-down but fully functional copy of the workload always running in the recovery Region

**Question 27** *(Domain 2 — Task 2.1)*
An image-processing application reads messages from an Amazon SQS standard queue. Processing one image takes up to 3 minutes, but the queue's visibility timeout is set to 30 seconds. Users report that some images are processed two or three times. What is the MOST likely cause and fix?

A) The queue is FIFO; switch to a standard queue
B) The visibility timeout expires before processing finishes, making the message visible to other consumers again; increase the visibility timeout beyond the processing time
C) Long polling is disabled; enable a 20-second ReceiveMessageWaitTime
D) The message retention period is too short; increase it to 14 days

**Question 28** *(Domain 2 — Task 2.1)*
A billing application consumes messages from an SQS queue. Occasionally a malformed message causes the consumer to fail repeatedly, and the message cycles through the queue forever, wasting compute. What should the architect configure?

A) A dead-letter queue with a maxReceiveCount redrive policy, so messages that fail repeatedly are moved aside for analysis
B) A shorter visibility timeout so the bad message is retried more quickly
C) FIFO ordering, which automatically discards malformed messages
D) A message retention period of 1 minute so bad messages expire fast

**Question 29** *(Domain 2 — Task 2.1)*
A brokerage processes trade events per customer account. Events for the same account must be processed strictly in order and exactly once, but events for different accounts may be processed in parallel for throughput. Which solution meets these requirements?

A) An SQS standard queue with one consumer thread
B) An SQS FIFO queue using the customer account ID as the MessageGroupId, which preserves order within each group while allowing parallelism across groups
C) An SNS standard topic with message filtering by account ID
D) An SQS FIFO queue with a single MessageGroupId for all customers

**Question 30** *(Domain 2 — Task 2.1)*
When an order is placed, an e-commerce platform must simultaneously trigger three independent processes: invoice generation, warehouse fulfillment, and analytics ingestion. Each process must receive every order event, buffer it durably, and process it at its own pace. Which architecture meets these requirements?

A) One SQS queue with three consumers polling the same queue
B) An SNS topic that fans out to three SQS queues, one subscribed per process
C) Three Lambda functions invoked sequentially by Step Functions
D) An SNS topic with three email subscriptions

**Question 31** *(Domain 2 — Task 2.1)*
During a flash sale, a Lambda function triggered by API Gateway begins returning 429 throttling errors while other critical Lambda functions in the same account also start being throttled. The account is at its default concurrency quota. Which action protects the critical functions from being starved by the sale function?

A) Increase the sale function's timeout from 3 seconds to the 15-minute maximum
B) Configure reserved concurrency on the critical functions (and optionally cap the sale function), guaranteeing them dedicated concurrency from the account pool
C) Enable provisioned concurrency on the sale function, which raises the account-wide quota
D) Move the critical functions to a 10 GB memory configuration

**Question 32** *(Domain 2 — Task 2.1)*
A media company has a video-publishing workflow with a step that waits up to 2 days for a human moderator to approve content via an external tool before continuing. The workflow must be auditable, run for days, and resume exactly where it paused once the moderator responds. Which solution fits BEST?

A) An Express Step Functions workflow with a Wait state
B) A Standard Step Functions workflow using the callback pattern: a task token (waitForTaskToken) is sent to the moderation system, and the workflow resumes when SendTaskSuccess is called
C) A Lambda function that sleeps until the moderator approves
D) An EventBridge rule with a 2-day scheduled delay

**Question 33** *(Domain 2 — Task 2.1)*
A company runs a high-volume IoT ingestion pipeline executing about 90,000 short workflow executions per second, each completing in under 5 seconds. Exactly-once execution semantics are not required, but cost must be minimized. Separately, a monthly financial reconciliation workflow runs for 12 hours and requires exactly-once execution with full execution history. Which Step Functions workflow types should be used?

A) Express workflows for the IoT pipeline; Standard workflows for the reconciliation
B) Standard workflows for both
C) Express workflows for both, since Express supports up to one year of execution
D) Standard workflows for the IoT pipeline; Express workflows for the reconciliation

**Question 34** *(Domain 2 — Task 2.2)*
A company hosts its primary web application on an ALB in us-east-1 and a passive recovery copy in us-west-2. The company wants Route 53 to send all traffic to us-east-1 and automatically redirect users to us-west-2 only when the primary endpoint becomes unhealthy. Which Route 53 configuration meets this requirement?

A) Weighted routing with 50/50 weights
B) Failover routing with a health check on the primary record and the us-west-2 record set as secondary
C) Latency-based routing between the two Regions
D) Geolocation routing with a default record pointing to us-west-2

**Question 35** *(Domain 2 — Task 2.2)*
An Auto Scaling group runs EC2 web servers behind an Application Load Balancer across three Availability Zones. The ALB marks some instances unhealthy because the web server process crashes, yet the Auto Scaling group never replaces them because the EC2 instances themselves still pass status checks. What should the solutions architect change?

A) Enable detailed CloudWatch monitoring on the instances
B) Configure the Auto Scaling group to use ELB health checks in addition to EC2 status checks, so instances failing ALB target health are terminated and replaced
C) Increase the ASG health check grace period
D) Switch the ALB to a Network Load Balancer

**Question 36** *(Domain 2 — Task 2.1)*
A trading firm needs a load balancer for a custom TCP protocol that must handle millions of requests per second with ultra-low latency and expose a static IP address per Availability Zone. Which load balancer should the firm choose?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Question 37** *(Domain 2 — Task 2.2)*
Which TWO statements about building resilient storage on AWS are accurate? (Choose TWO.)

A) S3 Cross-Region Replication retroactively copies all objects that existed before replication was configured, with no additional action
B) Amazon EFS Standard storage classes store data redundantly across multiple Availability Zones and can be mounted concurrently by instances in different AZs
C) S3 Cross-Region Replication requires versioning to be enabled on both the source and destination buckets
D) Amazon EFS volumes can be attached to only one EC2 instance at a time, like EBS
E) Enabling S3 versioning automatically replicates objects to another Region

---

## Part 3 — Design High-Performing Architectures (Questions 38–53)

**Question 38** *(Domain 3 — Task 3.1)*
A media analytics company runs a PostgreSQL database on Amazon RDS using a gp3 EBS volume. A new reporting workload requires sustained 50,000 IOPS with sub-millisecond latency and a durability guarantee of 99.999%. The volume must support this consistently without bursting. Which EBS volume type should a solutions architect recommend?

A) gp3 provisioned with maximum IOPS
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 with a volume size of 16 TiB

**Question 39** *(Domain 3 — Task 3.1)*
A genomics research firm needs shared file storage for a Linux-based high-performance computing (HPC) cluster of 500 EC2 instances. The workload requires sub-millisecond latencies and hundreds of GB/s of aggregate throughput, and input datasets are staged in Amazon S3. Which storage service best meets these requirements?

A) Amazon EFS with Max I/O performance mode
B) Amazon FSx for Windows File Server with SSD storage
C) Amazon FSx for Lustre linked to the S3 bucket
D) Amazon S3 accessed through Mountpoint on each instance

**Question 40** *(Domain 3 — Task 3.1)*
A company is migrating an on-premises Windows application that relies on SMB file shares and Active Directory–integrated access control lists. The application will run on EC2 Windows instances in two Availability Zones and must keep its existing NTFS permissions. Which AWS storage service should the solutions architect choose?

A) Amazon EFS with POSIX permissions
B) Amazon FSx for Windows File Server in Multi-AZ deployment mode
C) Amazon S3 with bucket policies mapped to AD groups
D) Amazon FSx for Lustre with persistent storage

**Question 41** *(Domain 3 — Task 3.1)*
A video production company in Singapore uploads 40 GB raw footage files to an S3 bucket in us-east-1 from offices worldwide. Uploads frequently fail partway through over the public internet, forcing complete restarts, and overall transfer times are slow. Which combination of actions should a solutions architect recommend? (Choose TWO.)

A) Convert the bucket to S3 One Zone-IA to improve write throughput
B) Front the bucket with an Application Load Balancer in each region
C) Enable S3 Cross-Region Replication to a bucket in ap-southeast-1
D) Enable S3 Transfer Acceleration on the bucket and upload through the accelerated endpoint
E) Use multipart upload for the large files

**Question 42** *(Domain 3 — Task 3.1)*
A real-time bidding platform runs a NoSQL workload on EC2 that needs the absolute lowest storage latency for temporary scratch data. The data is regenerated on startup and does not need to survive instance stop or termination. Which storage option provides the highest performance for this use case?

A) io2 EBS volume with 64,000 provisioned IOPS
B) Instance store (NVMe SSD) volumes on a storage-optimized instance
C) Amazon EFS in General Purpose mode
D) gp3 EBS volume with maximum provisioned throughput

**Question 43** *(Domain 3 — Task 3.3)*
A gaming company stores player session data in a DynamoDB table with the partition key `game_id`. There are only 12 popular games, and the table is experiencing throttling on a few partitions while overall consumed capacity is far below provisioned capacity. What should a solutions architect recommend?

A) Switch the table to provisioned capacity with auto scaling
B) Use a high-cardinality partition key, such as a composite of game_id and player_id
C) Create a local secondary index on player_id
D) Enable DynamoDB Streams to spread writes across partitions

**Question 44** *(Domain 3 — Task 3.3)*
An e-commerce site stores product catalog data in DynamoDB. Read traffic is extremely read-heavy with the same items requested millions of times per day, and the team needs microsecond read latency without rewriting the application's DynamoDB API calls. What should the solutions architect recommend?

A) Deploy Amazon ElastiCache for Redis and modify the application to check the cache first
B) Add DynamoDB Accelerator (DAX) in front of the table
C) Create a global secondary index to distribute reads
D) Enable DynamoDB Global Tables in a second region

**Question 45** *(Domain 3 — Task 3.3)*
A logistics company has a DynamoDB table in production that needs a new query pattern: querying shipments by `carrier_id` and sorting by `delivery_date`, with its own provisioned throughput so the new analytics queries don't affect the main application. The table already exists and has live traffic. Which solution meets these requirements?

A) Create a local secondary index with carrier_id as the sort key
B) Create a global secondary index with carrier_id as the partition key and delivery_date as the sort key
C) Recreate the table with a composite primary key of carrier_id and delivery_date
D) Enable a DynamoDB Stream and query the stream by carrier_id

**Question 46** *(Domain 3 — Task 3.3)*
A session-management service stores user sessions in DynamoDB. Sessions become useless after 24 hours, and the team wants expired items removed automatically at no additional cost. What should the solutions architect implement?

A) A scheduled Lambda function that scans the table hourly and deletes old items
B) DynamoDB Time to Live (TTL) with an expiration timestamp attribute on each item
C) A lifecycle policy on the DynamoDB table
D) DynamoDB Streams with a filter to drop items older than 24 hours

**Question 47** *(Domain 3 — Task 3.3)*
A serverless application uses Lambda functions that connect to an Amazon RDS for MySQL database. During traffic spikes, hundreds of concurrent Lambda invocations exhaust the database's connection limit, causing errors. Which solution addresses this with the least application change?

A) Increase the RDS instance size to raise max_connections
B) Place Amazon RDS Proxy between the Lambda functions and the database
C) Migrate the database to DynamoDB
D) Configure Lambda reserved concurrency of 10

**Question 48** *(Domain 3 — Task 3.3)*
A financial news site uses Amazon Aurora MySQL. Read traffic spikes 20x during market hours and the primary instance is CPU-bound serving SELECT queries. Writes are modest. What is the MOST operationally efficient way to scale reads?

A) Add Aurora Replicas and direct read traffic to the cluster reader endpoint with auto scaling
B) Create a Multi-AZ standby and send reads to the standby
C) Shard the database across multiple Aurora clusters
D) Enable Aurora Backtrack to offload reads

**Question 49** *(Domain 3 — Task 3.4)*
A multiplayer gaming company runs a latency-sensitive application using the UDP protocol on Network Load Balancers in two AWS Regions. Players worldwide need static IP addresses for allow-listing and fast regional failover. Which service should the solutions architect choose?

A) Amazon CloudFront with two custom origins
B) AWS Global Accelerator with endpoint groups in both regions
C) Amazon Route 53 with latency-based routing
D) An Application Load Balancer with cross-zone load balancing

**Question 50** *(Domain 3 — Task 3.4)*
A streaming company must comply with content licensing rules: users in Germany must always be served from the eu-central-1 deployment, and users in France from the eu-west-3 deployment, regardless of which endpoint offers lower latency. Which Route 53 routing policy should be used?

A) Latency-based routing
B) Geolocation routing
C) Geoproximity routing with a positive bias on eu-central-1
D) Weighted routing with 50/50 weights

**Question 51** *(Domain 3 — Task 3.2)*
A solutions architect is deploying a tightly coupled HPC workload that uses MPI and requires the lowest possible network latency and highest packet-per-second performance between 32 EC2 instances. Which placement strategy should be used?

A) Spread placement group across three Availability Zones
B) Partition placement group with 7 partitions
C) Cluster placement group in a single Availability Zone
D) Launch instances in separate subnets with enhanced networking

**Question 52** *(Domain 3 — Task 3.5)*
An IoT company ingests clickstream data that must be delivered to Amazon S3 in near real time for analytics. The team wants a fully managed solution with no consumer applications to write, no shard management, and built-in record buffering and format conversion to Parquet. Which service should they use?

A) Amazon Kinesis Data Streams with a Lambda consumer
B) Amazon Data Firehose (formerly Kinesis Data Firehose) with an S3 destination
C) Amazon SQS with a fleet of EC2 pollers
D) Amazon MSK with a custom Kafka Connect sink

**Question 53** *(Domain 3 — Task 3.5)*
A company stores application logs as compressed JSON files in Amazon S3 and wants analysts to run ad hoc SQL queries against them without provisioning servers or loading data into a database. The schema should be discovered and cataloged automatically. Which combination should the solutions architect recommend?

A) Amazon Redshift with COPY commands and scheduled refreshes
B) AWS Glue crawlers to populate the Data Catalog and Amazon Athena for SQL queries
C) Amazon EMR with a long-running Presto cluster
D) Amazon RDS for PostgreSQL with the aws_s3 extension

---

## Part 4 — Design Cost-Optimized Architectures (Questions 54–65)

**Question 54** *(Domain 4 — Task 4.2)*
A research institute runs nightly batch simulations on EC2 that take roughly 90 minutes, checkpoint progress to Amazon S3 every 5 minutes, and can be restarted from the last checkpoint at any time. The institute wants the lowest possible compute cost. Which purchasing option should the solutions architect recommend?

A) On-Demand Instances in a single AZ
B) Standard Reserved Instances with a 3-year term
C) Spot Instances using a Spot Fleet diversified across multiple instance types and AZs
D) A Compute Savings Plan sized to the batch workload's peak

**Question 55** *(Domain 4 — Task 4.2)*
A SaaS company has a steady baseline compute spend but expects to migrate workloads between EC2, AWS Fargate, and AWS Lambda over the next three years as it modernizes. It wants a commitment-based discount that automatically applies across all three compute services and all regions. Which option should the solutions architect recommend?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Question 56** *(Domain 4 — Task 4.2)*
A company purchased 3-year Standard Reserved Instances for Amazon RDS and for Amazon EC2. After a re-architecture, it no longer needs either reservation. The finance team asks which reservations can be sold to recover costs. What should the solutions architect tell them?

A) Both the EC2 and RDS Reserved Instances can be sold on the Reserved Instance Marketplace
B) Only the EC2 Reserved Instances can be sold on the Reserved Instance Marketplace; RDS RIs cannot be resold
C) Only the RDS Reserved Instances can be sold, because database reservations are transferable
D) Neither can be sold; Reserved Instances are nonrefundable and nontransferable in all cases

**Question 57** *(Domain 4 — Task 4.2)*
A development team runs containerized fault-tolerant data processing on Amazon ECS with EC2 Spot capacity. They need workers to gracefully drain and checkpoint before reclamation. How much advance warning does AWS provide before a Spot Instance is interrupted?

A) No warning is provided
B) A 2-minute interruption notice
C) A 15-minute interruption notice
D) A 24-hour rebalance window

**Question 58** *(Domain 4 — Task 4.1)*
A healthcare archive stores compliance records in Amazon S3 that are rarely accessed but, when subpoenaed, must be retrievable within 5 minutes. The records are kept for 7 years and storage cost must be minimized. Which storage class meets these requirements?

A) S3 Glacier Deep Archive with Standard retrieval
B) S3 Glacier Flexible Retrieval with Expedited retrievals when needed
C) S3 Glacier Flexible Retrieval with Bulk retrievals
D) S3 Standard-IA

**Question 59** *(Domain 4 — Task 4.1)*
A photo-sharing startup stores easily reproducible thumbnail images that are accessed infrequently. The team wants the lowest-cost infrequent-access option and accepts that loss of a single Availability Zone could require regenerating the thumbnails from originals. Which storage class should be used?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Question 60** *(Domain 4 — Task 4.1)*
A company has an S3 bucket with millions of objects whose access patterns are unknown and change unpredictably. A solutions architect is evaluating S3 Intelligent-Tiering. Which TWO statements about Intelligent-Tiering are accurate? (Choose TWO.)

A) It charges a small per-object monitoring and automation fee for objects it monitors
B) It charges retrieval fees each time an object moves back to the Frequent Access tier
C) Objects smaller than 128 KB are not monitored or auto-tiered and are billed at the Frequent Access tier rate
D) It replicates objects to a second region automatically
E) It requires a 90-day minimum storage duration for every object

**Question 61** *(Domain 4 — Task 4.1)*
An analytics team frequently aborts large multipart uploads to an S3 data lake bucket, and AWS Cost Explorer shows storage charges growing even though the bucket's visible object count is flat. What is the MOST cost-effective fix?

A) Enable S3 Versioning to track the orphaned parts
B) Add a lifecycle rule that aborts incomplete multipart uploads after a set number of days
C) Migrate the bucket to S3 One Zone-IA
D) Turn on S3 Transfer Acceleration to finish uploads faster

**Question 62** *(Domain 4 — Task 4.1)*
A company's EC2 fleet uses hundreds of gp2 EBS volumes sized large purely to obtain baseline IOPS. Utilization reviews show the IOPS are needed but much of the capacity is not. What should the solutions architect do to reduce storage cost without losing performance?

A) Migrate the volumes to io2 and provision the same IOPS
B) Migrate the volumes to gp3, right-size capacity, and provision IOPS independently
C) Convert the volumes to st1 throughput-optimized HDD
D) Snapshot the volumes daily and delete the originals

**Question 63** *(Domain 4 — Task 4.4)*
A data pipeline in private subnets transfers 60 TB per month from EC2 instances to Amazon S3 in the same region through a NAT gateway, generating large data processing charges. What is the MOST cost-effective change?

A) Replace the NAT gateway with a NAT instance on a large EC2 instance
B) Create a gateway VPC endpoint for S3 and route the traffic through it
C) Create an interface VPC endpoint (PrivateLink) for S3
D) Move the EC2 instances to public subnets with public IPv4 addresses

**Question 64** *(Domain 4 — Task 4.4)*
A startup's monthly bill shows unexpected charges for in-use public IPv4 addresses across dozens of EC2 instances that only call other AWS services within the VPC. The finance team also wants alerts before next month's overall spend exceeds a threshold. Which combination of actions should the solutions architect take? (Choose TWO.)

A) Replace public IPv4 with Elastic IPs on each instance, which are always free while attached
B) Remove the public IPv4 addresses and use private connectivity (VPC endpoints/NAT as needed), since AWS charges for public IPv4 addresses in use
C) Use AWS Compute Optimizer to block spending above the threshold
D) Enable AWS Shield Advanced to cap monthly spend
E) Create an AWS Budgets cost budget with an alert threshold and email notification

**Question 65** *(Domain 4 — Task 4.3)*
A development environment uses an Amazon Aurora PostgreSQL cluster that is idle nights and weekends but must wake automatically when developers connect, without manual intervention or instance resizing. Cost should drop to near zero for compute while idle. Which solution meets these requirements?

A) Aurora Serverless v2 configured with a minimum capacity of 0 ACUs so it auto-pauses when idle
B) A provisioned Aurora cluster stopped by a scheduled Lambda function each night
C) An Aurora global database with a headless secondary cluster
D) Provisioned Aurora with two reader instances scaled in at night

---

## Answer Key

### Part 1 — Questions 1–20

**1. Answer: B** — SCPs never apply to the management account of the organization, so its principals are unaffected by Region restrictions. *Why not the others:* A — SCPs do inherit through nested OUs; C — IAM Allows cannot override an SCP Deny in member accounts; D — SCPs apply immediately to all current and future accounts under the attachment point.

**2. Answer: C** — A permissions boundary enforced as a condition on role-creation actions caps the maximum permissions of any role developers create, preventing privilege escalation while preserving self-service. *Why not the others:* A — manual review adds operational overhead and removes self-service; B — denying iam:CreateRole blocks the legitimate workflow; D — CloudTrail alerts are detective, not preventive.

**3. Answer: B** — A customer-defined ExternalId validated in the trust policy's condition ensures the SaaS provider only assumes the role on behalf of the correct customer, mitigating the confused deputy problem. *Why not the others:* A — MFA is impractical for automated service-to-service assumption and doesn't address the deputy confusion; C — encrypting an ARN (which is not secret) solves nothing; D — long-lived IAM user keys are less secure than roles.

**4. Answer: B** — IAM Identity Center federates once with Entra ID and centrally assigns permission sets across all organization accounts via a single access portal. *Why not the others:* A — per-account IAM users are exactly the overhead to avoid; C — Cognito is for application (customer) identities, not workforce access to AWS accounts; D — manual per-account SAML setup works but has far higher operational overhead.

**5. Answer: A** — User pools handle authentication (email/social sign-in); identity pools exchange the resulting tokens for temporary AWS credentials scoped by IAM roles to access S3. *Why not the others:* B — reverses the two services' purposes; C — IAM Identity Center is for workforce users, not app customers; D — user pool tokens (JWTs) do not grant AWS service access by themselves.

**6. Answer: B** — A customer managed key gives full control of the key policy, usage logging, and disabling, and supports automatic rotation (yearly by default). *Why not the others:* A — AWS managed keys don't let you edit the key policy or disable the key; C — AWS owned keys are invisible to the customer entirely; D — imported (BYOK) key material does not support automatic rotation.

**7. Answer: B** — Envelope encryption: KMS generates a data key; the data is encrypted locally with the plaintext data key, which is discarded, while the KMS-encrypted copy of the data key is stored with the ciphertext. *Why not the others:* A and C — KMS never encrypts large payloads directly or via streaming; D — hard-coded keys are an anti-pattern and not envelope encryption.

**8. Answer: C** — Secrets Manager's alternating-users strategy maintains two credentials and rotates them in turn, so existing connections using the previous credential keep working during rotation. *Why not the others:* A — Parameter Store has no built-in rotation; you'd build it all yourself; B — single-user rotation invalidates the old password immediately, risking connection failures; D — KMS rotation rotates encryption key material, not database passwords.

**9. Answer: C** — SSE-C lets the customer supply the encryption key with every request; AWS uses it in memory for the operation and never stores it. *Why not the others:* A — SSE-S3 keys are fully AWS-managed; B — SSE-KMS keys are stored in AWS KMS; D — aws/s3 is an AWS-managed KMS key and is not client-side at all.

**10. Answer: B** — Object Lock compliance mode prevents deletion or overwriting by any user, including root, until retention expires, and Object Lock requires versioning. *Why not the others:* A — governance mode can be bypassed by users with s3:BypassGovernanceRetention; C — a bucket policy can be modified or removed by the root user; D — lifecycle expiration doesn't prevent deletion during the period.

**11. Answer: B** — NACLs are stateless, so the response traffic to clients' ephemeral source ports must be explicitly allowed outbound. *Why not the others:* A — NACLs are stateless, not stateful; C — security groups are stateful, so return traffic is automatic; D — 0.0.0.0/0 is perfectly valid in NACL rules.

**12. Answer: A, B** — Security groups are stateful (return traffic auto-allowed), and NACLs process numbered rules in order and support Deny. *Why not the others:* C — security groups support only Allow rules; D — NACLs attach to subnets, not ENIs (security groups attach to ENIs); E — security group rules are all evaluated together with no ordering.

**13. Answer: B** — Shield Advanced provides the Shield Response Team, DDoS cost protection, and attack visibility/diagnostics for protected resources like CloudFront and ALB. *Why not the others:* A — Shield Standard is automatic but includes no SRT access or cost protection; C — WAF addresses layer-7 request patterns, not the full requirement set; D — GuardDuty is threat detection, not DDoS protection.

**14. Answer: B** — AWS WAF on the ALB with the SQLi managed rule group plus a rate-based rule blocks both attack patterns with no application code changes. *Why not the others:* A — high development effort; C — Shield Standard covers L3/L4 floods, not SQL injection; D — security groups can't inspect request content.

**15. Answer: B** — GuardDuty = threat detection from logs and threat intel; Macie = sensitive-data (PII) discovery in S3; Inspector = vulnerability (CVE) scanning of EC2, ECR images, and Lambda. *Why not the others:* A, C, D — each scrambles at least two of the service-to-purpose mappings.

**16. Answer: B** — Gateway endpoints exist for exactly S3 and DynamoDB, keep traffic on the AWS network, and have no hourly or data processing charge. *Why not the others:* A — NAT gateway routes via public IP space and costs per-hour/per-GB; C — interface endpoints incur hourly and data charges, so not lowest cost; D — an internet gateway sends traffic over the public internet.

**17. Answer: A** — IMDSv2 requires a session token obtained via a PUT request, which typical SSRF vectors cannot perform; enforcing HttpTokens=required blocks IMDSv1 credential theft. *Why not the others:* B — many agents and SDKs legitimately need IMDS; C — NACLs do not affect link-local traffic between an instance and its own metadata endpoint; D — static credentials in files are far worse than role credentials.

**18. Answer: C** — Standard Parameter Store parameters are free and fine for plaintext config; Secrets Manager adds built-in rotation for just the 5 passwords, minimizing cost. *Why not the others:* A — paying Secrets Manager per-secret pricing for 200 plain config values is wasteful; B — Parameter Store alone has no native rotation for the passwords; D — Parameter Store has no built-in automatic rotation, so this option states a capability that doesn't exist.

**19. Answer: B** — S3 Bucket Keys let S3 generate a time-limited bucket-level data key from the KMS key, dramatically reducing per-object KMS requests (and cost) while remaining SSE-KMS. *Why not the others:* A — SSE-S3 abandons the KMS requirement; C — rotation frequency doesn't affect per-request API volume; D — imported key material doesn't change request counts.

**20. Answer: B, D** — Explicit Deny always wins over any Allow in policy evaluation, and permissions boundaries only cap (never grant) permissions. *Why not the others:* A — SCPs are guardrails that limit available permissions; they grant nothing; C — resource-based policies routinely grant cross-account access on their own; E — IAM defaults to implicit deny when nothing allows an action.

### Part 2 — Questions 21–37

**21. Answer: C** — Multi-AZ provides automatic failover for AZ failure; read replicas absorb the reporting read traffic — two features for two distinct problems. *Why not the others:* A — a traditional Multi-AZ standby cannot serve reads; B — replica promotion is manual (or scripted) and replicas alone don't give automatic HA failover; D — a bigger single-AZ instance fails both requirements on AZ resilience.

**22. Answer: B** — A Multi-AZ DB cluster deployment runs one writer and two readable standbys across three AZs, with a reader endpoint, so standby capacity serves reads while still supporting fast automatic failover. *Why not the others:* A — the single standby in an instance deployment serves no traffic; C — read replicas don't provide managed automatic failover and RDS databases aren't load-balanced via ALB; D — Single-AZ has no failover at all.

**23. Answer: B** — Aurora Global Database replication is asynchronous at the storage layer with typical sub-second lag, so cross-Region RPO is near zero but can never be guaranteed exactly 0. *Why not the others:* A — replication is not synchronous across Regions; C — write forwarding routes writes to the primary; it doesn't change replication semantics; D — replication lag is typically under a second, not a 5-minute schedule.

**24. Answer: B** — Recovery Time Objective is the maximum tolerable downtime (4 hours); Recovery Point Objective is the maximum tolerable data loss window (15 minutes). *Why not the others:* A — reverses the definitions; C — MTBF/MTTR are reliability statistics, not DR objectives; D — SLA is a contractual commitment, not a data-loss metric.

**25. Answer: B** — Pilot light keeps data continuously replicated and core resources provisioned but switched off, yielding an RTO of tens of minutes at low cost — an exact match. *Why not the others:* A — backup and restore has no live replication and a much longer RTO; C — warm standby keeps the stack running, costing more than required; D — active/active is the most expensive and far exceeds the requirement.

**26. Answer: C, E** — Warm standby is a scaled-down, always-running full copy; multi-site active/active serves from multiple Regions with near-zero RTO at the highest cost. *Why not the others:* A — backup and restore is defined by not pre-running resources; B — backup and restore has the highest (worst) RTO; D — pilot light is provisioned-but-off, not full capacity serving traffic.

**27. Answer: B** — When the 30-second visibility timeout lapses mid-processing, the message reappears and another consumer processes it again; set the visibility timeout longer than the maximum processing time (e.g., 6× as a best practice). *Why not the others:* A — FIFO vs. standard isn't the cause; C — long polling affects empty-receive efficiency, not duplicates; D — retention period governs how long messages persist, not redelivery.

**28. Answer: A** — A redrive policy with maxReceiveCount moves repeatedly failing ("poison pill") messages to a dead-letter queue for offline analysis, stopping the infinite retry loop. *Why not the others:* B — a shorter visibility timeout makes the loop spin faster; C — FIFO does not discard malformed messages; D — a 1-minute retention would also expire valid messages.

**29. Answer: B** — FIFO queues guarantee exactly-once processing and strict ordering within a MessageGroupId; using account ID as the group ID gives per-account ordering with cross-account parallelism (and high-throughput FIFO mode can scale further). *Why not the others:* A — standard queues can't guarantee order or exactly-once; C — SNS provides no ordering or exactly-once processing guarantee for this pattern; D — a single group ID serializes everything, destroying throughput.

**30. Answer: B** — SNS-to-SQS fan-out delivers every event to each queue, where each consumer gets durable buffering and independent processing pace. *Why not the others:* A — three consumers on one queue split the messages; each message goes to only one consumer; C — sequential invocation isn't independent parallel processing with buffering; D — email subscriptions deliver to humans, not durable application buffers.

**31. Answer: B** — Reserved concurrency carves out dedicated concurrency for the critical functions (and capping the sale function limits its blast radius), preventing one function from exhausting the shared account pool. *Why not the others:* A — a longer timeout holds concurrency slots longer, making throttling worse; C — provisioned concurrency pre-warms environments but does not raise the account concurrency quota; D — memory size doesn't affect concurrency limits.

**32. Answer: B** — Standard workflows run up to one year and the waitForTaskToken callback pattern pauses the execution at no compute cost until SendTaskSuccess/SendTaskFailure returns the token. *Why not the others:* A — Express workflows max out at 5 minutes; C — Lambda can run at most 15 minutes and sleeping wastes money; D — EventBridge schedules can trigger events but can't pause and resume workflow state.

**33. Answer: A** — Express workflows are built for very high-rate, short-duration, at-least-once executions at lower cost; Standard workflows provide exactly-once semantics, up to one year duration, and full execution history for the reconciliation job. *Why not the others:* B — Standard can't economically sustain 90,000 starts/second for this use case; C — Express maxes at 5 minutes and is at-least-once, failing the 12-hour exactly-once job; D — reversed assignments fail both workloads.

**34. Answer: B** — Failover routing sends all traffic to the primary while its health check passes, then automatically answers with the secondary record when it fails. *Why not the others:* A — weighted 50/50 sends half the traffic to the passive copy all the time; C — latency-based routing splits traffic by performance, not active/passive intent; D — geolocation routes by user location, unrelated to endpoint health-based failover.

**35. Answer: B** — Adding the ELB health check type makes the ASG treat ALB target-health failures as unhealthy, so crashed-app instances are terminated and replaced even though EC2 status checks pass. *Why not the others:* A — detailed monitoring changes metric granularity only; C — grace period delays health evaluation, the opposite of what's needed; D — the load balancer type isn't the issue.

**36. Answer: B** — Network Load Balancer operates at layer 4 (TCP/UDP), handles millions of requests per second with ultra-low latency, and supports a static (or Elastic) IP per AZ. *Why not the others:* A — ALB is layer 7 (HTTP/HTTPS) and offers no static IPs natively; C — Gateway Load Balancer is for deploying inline virtual appliances; D — Classic Load Balancer is legacy and meets neither requirement.

**37. Answer: B, C** — CRR requires versioning enabled on both buckets, and EFS Standard classes are regional (multi-AZ) file systems mountable concurrently across AZs. *Why not the others:* A — CRR only replicates new objects after configuration unless you run S3 Batch Replication for existing ones; D — EFS supports thousands of concurrent NFS clients, unlike single-attach EBS; E — versioning is a prerequisite for replication but does not itself replicate anything.

### Part 3 — Questions 38–53

**38. Answer: B** — io2 Block Express delivers up to 256,000 IOPS, sub-millisecond latency, and 99.999% durability, meeting all three requirements. *Why not the others:* A — gp3 can now reach the IOPS number (its cap was raised to 80,000 in late 2025), but it fails the other two requirements: durability is 99.8–99.9% (the question demands 99.999%) and its latency is single-digit milliseconds, not guaranteed sub-millisecond; B is the only type meeting all three; C — st1 is HDD-based and unsuitable for IOPS-intensive databases; D — gp2 maxes at 16,000 IOPS and bursting is not a sustained guarantee.

**39. Answer: C** — FSx for Lustre is purpose-built for HPC with sub-millisecond latency, hundreds of GB/s throughput, and native S3 integration (lazy-loading and exporting). *Why not the others:* A — EFS cannot match Lustre's HPC throughput/latency profile; B — FSx for Windows targets SMB/Windows workloads, not Linux HPC; D — Mountpoint for S3 doesn't deliver shared POSIX file system semantics or the required latency.

**40. Answer: B** — FSx for Windows File Server natively supports SMB, Active Directory integration, and NTFS ACLs, and Multi-AZ mode covers the two-AZ requirement. *Why not the others:* A — EFS is NFS/POSIX and doesn't preserve NTFS permissions; C — S3 is object storage, not an SMB file share; D — Lustre is a Linux HPC file system without SMB/AD support.

**41. Answer: D, E** — Transfer Acceleration routes uploads over the AWS edge/backbone network to speed long-distance transfers, and multipart upload parallelizes transfers and lets failed parts be retried without restarting the whole 40 GB file. *Why not the others:* A — One Zone-IA changes redundancy, not upload performance; B — you cannot put an ALB in front of S3 for uploads; C — CRR replicates after upload and doesn't help ingest.

**42. Answer: B** — Instance store NVMe SSDs are physically attached to the host, offering the lowest latency for ephemeral data that can be regenerated. *Why not the others:* A and D — EBS traverses the network and adds latency; C — EFS is a network file system with higher latency than both.

**43. Answer: B** — Throttling on hot partitions with low overall utilization is the classic low-cardinality partition key problem; a high-cardinality key (e.g., game_id#player_id) distributes traffic evenly. *Why not the others:* A — capacity mode changes don't fix hot partitions; C — an LSI shares the same partition key and the same hot partitions; D — Streams capture changes, they don't redistribute writes.

**44. Answer: B** — DAX is a DynamoDB-compatible, API-transparent in-memory cache delivering microsecond reads with minimal code change. *Why not the others:* A — ElastiCache requires application rewrites to manage the cache; C — a GSI doesn't cache hot items or give microsecond latency; D — Global Tables address multi-region access, not single-item read latency.

**45. Answer: B** — A GSI can be added to an existing table at any time, supports a new partition/sort key combination, and has its own provisioned throughput isolated from the base table. *Why not the others:* A — LSIs can only be created at table creation, share the table's partition key, and share table throughput; C — recreating the table is disruptive and unnecessary; D — Streams are for change capture, not ad hoc queries.

**46. Answer: B** — DynamoDB TTL deletes expired items automatically in the background at no extra cost. *Why not the others:* A — scheduled scans consume read/write capacity and cost money; C — lifecycle policies are an S3/EFS concept, not DynamoDB; D — Streams filter events downstream but don't delete items from the table.

**47. Answer: B** — RDS Proxy pools and multiplexes connections, letting thousands of Lambda invocations share a small set of database connections with only a connection-string change. *Why not the others:* A — upsizing is costly and just postpones the limit; C — a database migration is a major application change; D — throttling Lambda to 10 cripples throughput rather than solving connection management.

**48. Answer: A** — Aurora Replicas (up to 15) behind the reader endpoint with replica auto scaling offload read traffic with minimal operational work. *Why not the others:* B — Aurora doesn't use a passive standby model; standbys in classic RDS terms don't serve traffic; C — sharding is high operational overhead for a read-scaling problem; D — Backtrack rewinds the database in time, it doesn't serve reads.

**49. Answer: B** — Global Accelerator provides two static anycast IPs, supports UDP, fronts NLBs in multiple regions, and fails over in seconds over the AWS backbone. *Why not the others:* A — CloudFront serves HTTP/HTTPS content, not arbitrary UDP, and has no static client-facing IPs; C — Route 53 latency routing depends on DNS TTLs for failover and provides no static IPs; D — an ALB is regional and HTTP-only.

**50. Answer: B** — Geolocation routing answers DNS queries based on the user's country, enforcing Germany→eu-central-1 and France→eu-west-3 deterministically for licensing compliance. *Why not the others:* A — latency routing picks the fastest endpoint, which may violate the licensing rule; C — geoproximity bias shifts boundaries by distance but doesn't guarantee strict country mapping; D — weighted routing distributes randomly by weight, ignoring location.

**51. Answer: C** — A cluster placement group packs instances close together in one AZ for the lowest latency and highest packets-per-second, ideal for tightly coupled MPI workloads. *Why not the others:* A — spread groups separate instances onto distinct hardware, increasing latency, and cap at 7 per AZ; B — partition groups isolate fault domains for distributed data systems, not low-latency MPI; D — separate subnets do nothing to co-locate instances.

**52. Answer: B** — Amazon Data Firehose is fully managed, requires no consumers or shard management, buffers records, and can convert JSON to Parquet before delivering to S3. *Why not the others:* A — Kinesis Data Streams requires writing/managing consumers; C — SQS plus EC2 pollers is custom infrastructure to build and run; D — MSK requires managing Kafka clusters and connectors.

**53. Answer: B** — Glue crawlers infer schema into the Data Catalog and Athena runs serverless SQL directly against the S3 files. *Why not the others:* A — Redshift requires cluster provisioning and data loading; C — EMR means managing a long-running cluster; D — RDS would require loading the data into a database server.

### Part 4 — Questions 54–65

**54. Answer: C** — Checkpointed, restartable batch jobs are the ideal Spot workload, and a diversified Spot Fleet across instance types/AZs minimizes interruption impact at up to ~90% savings. *Why not the others:* A — On-Demand forgoes the discount with no benefit here; B and D — commitments give smaller discounts than Spot and lock in spend for an interruption-friendly job.

**55. Answer: C** — Compute Savings Plans apply automatically across EC2 (any family/region), Fargate, and Lambda, fitting the modernization path. *Why not the others:* A — EC2 Instance Savings Plans are locked to an instance family in a region and exclude Fargate/Lambda; B and D — Reserved Instances cover EC2 only and don't apply to Fargate or Lambda.

**56. Answer: B** — Only EC2 Standard Reserved Instances can be listed on the Reserved Instance Marketplace; RDS (and other service) RIs cannot be resold. *Why not the others:* A and C — RDS RIs are not marketplace-eligible; D — EC2 Standard RIs are in fact sellable on the marketplace.

**57. Answer: B** — AWS delivers a Spot interruption notice two minutes before reclaiming the instance, giving time to drain and checkpoint. *Why not the others:* A — a warning is provided; C and D — 15 minutes and 24 hours are not Spot interruption windows (rebalance recommendations can arrive earlier but are not a guaranteed fixed window).

**58. Answer: B** — Glacier Flexible Retrieval offers low archival storage cost and Expedited retrievals that return data in 1–5 minutes (about $0.03/GB), meeting the 5-minute requirement. *Why not the others:* A — Deep Archive's fastest retrieval is ~12 hours; C — Bulk retrievals take 5–12 hours; D — Standard-IA retrieves instantly but costs far more for 7-year rarely accessed storage.

**59. Answer: B** — One Zone-IA costs ~20% less than Standard-IA and the single-AZ durability tradeoff is acceptable for reproducible thumbnails. *Why not the others:* A — Standard-IA costs more for redundancy the data doesn't need; C — Intelligent-Tiering adds monitoring fees and doesn't minimize cost for known-infrequent access; D — Glacier Instant Retrieval has a 90-day minimum and a different retrieval cost profile for this pattern.

**60. Answer: A, C** — Intelligent-Tiering charges a small per-object monitoring/automation fee, and objects under 128 KB are stored but not monitored or tiered (billed at Frequent Access rates). *Why not the others:* B — Intelligent-Tiering has no retrieval fees between its automatic tiers; D — it never replicates cross-region; E — there is no 90-day minimum for every object in the class.

**61. Answer: B** — Incomplete multipart upload parts are billed as storage but invisible as objects; a lifecycle rule with AbortIncompleteMultipartUpload deletes them automatically. *Why not the others:* A — versioning would increase storage, not clean up parts; C — changing storage class doesn't remove orphaned parts; D — Transfer Acceleration speeds transfers but doesn't clean up already-abandoned uploads.

**62. Answer: B** — gp3 decouples IOPS/throughput from size and costs ~20% less per GB than gp2, so capacity can be right-sized while keeping the needed IOPS; the migration is an online ModifyVolume operation. *Why not the others:* A — io2 is more expensive, not less; C — st1 cannot deliver the required IOPS; D — deleting volumes destroys live data.

**63. Answer: B** — A gateway VPC endpoint for S3 is free and eliminates NAT gateway data processing charges for same-region S3 traffic. *Why not the others:* A — a NAT instance still incurs EC2 and operational costs; C — interface endpoints bill per-hour and per-GB, costing more than the free gateway endpoint; D — public subnets add public IPv4 charges and weaken security.

**64. Answer: B, E** — AWS charges for every in-use public IPv4 address, so removing unneeded ones cuts cost, and AWS Budgets provides proactive threshold alerts on forecast/actual spend. *Why not the others:* A — Elastic IPs are also billed under the public IPv4 charge even while attached; C — Compute Optimizer recommends right-sizing but cannot block or alert on spend thresholds; D — Shield Advanced is a DDoS service that adds cost.

**65. Answer: A** — Aurora Serverless v2 supports scaling to 0 ACUs (auto-pause, available since late 2024) and automatically resumes on connection, eliminating compute cost while idle with no manual steps. Nuances worth knowing: auto-pause requires recent engine versions (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); the first connection after a pause takes ~15 seconds to resume (longer after 24+ hours paused); storage keeps billing while compute is paused; and anything holding connections open — an RDS Proxy, a keep-alive health check — prevents the pause entirely. *Why not the others:* B — a stopped provisioned cluster does not wake automatically when developers connect (and restarts after 7 days); C — headless global database secondaries address DR, not idle cost; D — scaled-in readers still leave the writer instance running and billing.

---

## Scoring Guide

| Score | Reading of the result |
|---|---|
| 55–65 | Exam-ready. Book the exam. Review only the questions you missed. |
| 47–54 | In passing range, but margin is thin. Re-read the chapters behind every miss (use the domain tags), retake in one week. |
| 38–46 | Foundation is there; gaps remain. Work through Appendix B's domain map for your weak domains before retaking. |
| Below 38 | Re-read the chapters for your two weakest domains end to end, redo their chapter exercises, then retake this exam. |

Track your misses *by domain* (each question is tagged). A low score concentrated in one domain is a focused study problem; the same score spread evenly is a pacing or question-reading problem — slow down and underline what each stem actually requires (HA vs DR, cost vs performance, "MOST cost-effective" vs "LEAST operational overhead").
