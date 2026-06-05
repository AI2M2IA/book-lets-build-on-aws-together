# Concept Registry — Let's Build on AWS Together

**Purpose**: Track every AWS concept introduced, its analogy, SAA-C03 mapping, and chapter location.

**Update policy**: Update this file immediately after writing each chapter — do not batch.

| Ch  | Slug                             | Primary Concept                                            | Analogy                                                                                | SAA-C03 Domain   | SAA-C03 Tasks | Secondary Chapters | Status  |
|-----|----------------------------------|------------------------------------------------------------|----------------------------------------------------------------------------------------|------------------|---------------|--------------------|---------|
| 00  | introduction                     | Cloud computing (concept)                                  | Renting a venue vs. buying a building                                                  | Cross-domain     | —             | All                | ✅ final |
| 01  | why-the-cloud                    | Cloud benefits + Shared Responsibility Model               | Renting a venue for a party vs. owning the building                                    | Cross-domain     | —             | All                | ✅ final |
| 02  | aws-global-infrastructure        | Regions, AZs, Edge Locations                               | A chain of warehouses around the world                                                 | D1 T1.1, D2 T2.2 | —             | 11, 18, 25         | ✅ final |
| 03  | iam-who-are-you                  | IAM users, groups, roles, policies                         | A keycard system in an office building                                                 | D1 T1.1          | 14            | 14, 15, 16         | ✅ final |
| 04  | ec2-renting-a-computer           | EC2 instances, AMIs, key pairs                             | Renting a computer in someone else's building                                          | D3 T3.2          | —             | 07, 21, 27         | ✅ final |
| 05  | s3-files-that-never-disappear    | S3 buckets, objects, storage classes                       | A hard drive on the internet that never fills up                                       | D3 T3.1          | —             | 06, 23, 28         | ✅ final |
| 06  | ebs-efs-attached-storage         | EBS vs. EFS                                                | An external hard drive attached to a laptop (EBS) vs. a shared network drive (EFS)     | D3 T3.1          | —             | 23, 28             | ✅ final |
| 07  | auto-scaling-load-balancing      | Auto Scaling Groups, ALB                                   | A restaurant that adds tables and waitstaff when it gets busy                          | D2 T2.1, D3 T3.2 | —             | 18, 19             | ✅ final |
| 08  | rds-a-database-you-dont-manage   | RDS, managed databases, Multi-AZ                           | Hiring a DBA who never calls in sick                                                   | D3 T3.3          | —             | 09, 10, 24, 29     | ✅ final |
| 09  | dynamodb-when-the-table-gets-big | DynamoDB, NoSQL, partition keys                            | A search-indexed archive vs. a filing cabinet                                          | D3 T3.3          | —             | 29                 | ✅ final |
| 10  | elasticache-when-the-db-is-slow  | ElastiCache, Redis, caching strategies                     | Keeping the most-ordered items already plated                                          | D3 T3.3          | —             | —                  | ✅ final |
| 11  | vpc-your-private-corner          | VPC, subnets, security groups, NAT                         | A fenced private lot inside a massive public parking garage                            | D1 T1.2          | —             | 15, 25             | ✅ final |
| 12  | route53-how-internet-finds-you   | Route 53, DNS, routing policies                            | A phone book for the internet                                                          | D2 T2.2          | —             | 25                 | ✅ final |
| 13  | cloudfront-fast-everywhere       | CloudFront, CDN, edge locations                            | Local warehouses pre-stocked with popular items                                        | D3 T3.4          | —             | 30                 | ✅ final |
| 14  | iam-advanced-roles-policies      | IAM roles for services, permission boundaries              | A contractor badge that only works in certain rooms                                    | D1 T1.1          | —             | 16                 | ✅ final |
| 15  | security-groups-nacls            | Security groups (stateful) vs. NACLs (stateless)           | A security guard (stateful) vs. a metal detector (stateless)                           | D1 T1.2          | —             | —                  | ✅ final |
| 16  | kms-secrets-manager              | KMS, Secrets Manager, key rotation                         | A lockbox that only authorized people can open                                         | D1 T1.3          | —             | —                  | ✅ final |
| 17  | shield-waf-guardduty             | AWS Shield, WAF, GuardDuty                                 | A bouncer (Shield), a filter (WAF), and a security camera (GuardDuty)                  | D1 T1.2          | —             | —                  | ✅ final |
| 18  | multi-az-multi-region            | Multi-AZ, Multi-Region, RTO/RPO                            | A backup generator and a second restaurant location                                    | D2 T2.2          | —             | 28, 32             | ✅ final |
| 19  | sqs-sns-decoupling               | SQS, SNS, pub/sub                                          | A ticket machine at a deli counter                                                     | D2 T2.1          | —             | 22                 | ✅ final |
| 20  | lambda-serverless                | Lambda, event triggers, cold start                         | Paying a freelancer per task vs. a full-time employee                                  | D2 T2.1          | —             | 22, 30             | ✅ final |
| 21  | ecs-eks-containers               | ECS, EKS, Fargate                                          | A standardized shipping container                                                      | D2 T2.1          | —             | 32                 | ✅ final |
| 22  | step-functions-event-driven      | Step Functions, state machines                             | A flowchart that runs itself                                                           | D2 T2.1          | —             | —                  | ✅ final |
| 23  | storage-tiers-lifecycle          | S3 storage classes, lifecycle policies                     | A filing system that automatically moves old files to the basement                     | D3 T3.1, D4 T4.1 | —             | 28                 | ✅ final |
| 24  | aurora-read-replicas             | Aurora, read replicas, Aurora Serverless                   | A library with multiple copies of the same book at different desks                     | D3 T3.3          | —             | 29                 | ✅ final |
| 25  | network-performance              | Direct Connect, VPN, Transit Gateway                       | A private highway vs. the public road                                                  | D3 T3.4          | —             | 30                 | ✅ final |
| 26  | kinesis-glue-athena              | Kinesis, Glue, Athena                                      | A real-time ticker tape machine (Kinesis) + a translator (Glue) + a librarian (Athena) | D3 T3.5          | —             | —                  | ✅ final |
| 27  | ec2-pricing-models               | On-Demand, Reserved, Savings Plans, Spot                   | Hotel rates: walk-in vs. booked vs. last-minute standby                                | D4 T4.2          | —             | 29, 30             | ✅ final |
| 28  | cost-optimized-storage           | S3 Intelligent-Tiering, cost allocation tags               | A smart filing system that automatically decides where to store things                 | D4 T4.1          | —             | —                  | ✅ final |
| 29  | cost-optimized-databases         | RDS reserved instances, DynamoDB on-demand vs. provisioned | Choosing between a monthly gym membership vs. pay-per-visit                            | D4 T4.3          | —             | —                  | ✅ final |
| 30  | cost-optimized-networking        | NAT gateway pricing, VPC endpoints, data transfer          | Paying for highways vs. using back roads that are free                                 | D4 T4.4          | —             | —                  | ✅ final |
| 31  | well-architected-framework       | 6 pillars of Well-Architected                              | A building inspection checklist — but for cloud architecture                           | Cross-domain     | All           | —                  | ✅ final |
| 32  | architecture-review              | Full architecture design + due diligence                   | Defending a business plan to investors                                                 | Cross-domain     | All           | —                  | ✅ final |
| 33  | when-it-depends                  | Architectural trade-off reasoning                          | A wise mentor who says "it depends" and actually explains why                          | Cross-domain     | All           | —                  | ✅ final |

---

## Status Legend

| Symbol    | Meaning                            |
|-----------|------------------------------------|
| ⬜ draft   | Chapter created and ready to write |
| 🟡 writing | Chapter in progress                |
| 🟠 review  | Written, pending review            |
| ✅ final   | Reviewed and approved              |

