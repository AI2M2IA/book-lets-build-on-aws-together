# 附录 B：SAA-C03 领域地图

AWS Solutions Architect Associate 考试（SAA-C03）分为四个领域。本附录将本书的每一章映射到相关的领域和任务，以便你可以按考试领域而非章节顺序来学习。

---

## 领域概览

| 领域 | 权重 | 描述 |
|------|------|------|
| 领域 1：设计安全架构 | 30% | IAM、网络安全、数据保护 |
| 领域 2：设计弹性架构 | 26% | 高可用性、容错、灾难恢复 |
| 领域 3：设计高性能架构 | 24% | 计算、存储、数据库、网络性能 |
| 领域 4：设计成本优化架构 | 20% | 定价模式、成本管理、资源优化 |

---

## 领域 1：设计安全架构（30%）

**任务 1.1 — 设计对 AWS 资源的安全访问**

核心概念：IAM 用户、组、角色、策略。最小权限原则。跨账户访问。服务角色。AWS Organizations 中的 SCP（服务控制策略）。

| 章节 | 主题 |
|------|------|
| 第 3 章 | IAM 基础：用户、组、角色、策略、策略评估 |
| 第 14 章 | IAM 高级：服务角色、权限边界、跨账户角色 |
| 第 3 章 | 策略评估逻辑：明确拒绝 > 明确允许 > 隐式拒绝 |
| 第 14 章 | AWS Organizations、SCP、Control Tower、Account Factory |
| 第 14 章 | Cognito：User Pools（应用登录，JWT）和 Identity Pools（临时 AWS 凭证） |

关键考试模式：

- "EC2 需要访问 S3 而无需硬编码凭证"→ 附加到 EC2 实例配置文件的带 S3 策略的 IAM 角色
- "不同账户需要共享资源"→ 带跨账户信任策略的 IAM 角色
- "防止 OU 中的所有 IAM 用户访问某项服务"→ AWS Organizations 中的 SCP

---

**任务 1.2 — 设计安全的工作负载和应用程序**

核心概念：VPC 设计、安全组与 NACL、网络隔离、DDoS 防护、WAF、GuardDuty。

| 章节 | 主题 |
|------|------|
| 第 11 章 | VPC 设计：公有/私有子网、NAT Gateway、Internet Gateway、路由表 |
| 第 15 章 | 安全组（有状态，实例级别）与 NACL（无状态，子网级别） |
| 第 17 章 | Shield（DDoS）、WAF（应用防火墙）、GuardDuty（威胁检测）、Inspector（CVE 扫描） |
| 第 17 章 | Macie：S3 中的敏感数据发现（PII、凭证） |
| 第 25 章 | Direct Connect、VPN、Transit Gateway、PrivateLink |

关键考试模式：

- "阻止特定 IP 访问子网"→ NACL 拒绝规则
- "允许 HTTP 进入，自动允许 HTTP 响应出去"→ 安全组（有状态）
- "保护 Web 应用程序免受 SQL 注入"→ 带 SQL 注入规则的 WAF
- "检测被盗用的 IAM 凭证"→ GuardDuty

---

**任务 1.3 — 确定适当的数据安全控制**

核心概念：静态和传输中的加密、KMS、Secrets Manager、Parameter Store、S3 服务器端加密。

| 章节 | 主题 |
|------|------|
| 第 16 章 | KMS：客户管理密钥、密钥轮换、信封加密 |
| 第 16 章 | Secrets Manager：自动凭证轮换、运行时机密检索 |
| 第 16 章 | ACM（AWS Certificate Manager）：用于 ALB、CloudFront 的 SSL/TLS 证书 |
| 第 5 章 | S3 加密选项：SSE-S3、SSE-KMS、SSE-C |
| 第 8 章 | RDS 静态加密（必须在创建时启用） |

关键考试模式：

- "自动轮换数据库凭证"→ 带 RDS 集成的 Secrets Manager
- "跨账户控制谁可以使用加密密钥"→ KMS 密钥策略
- "存储非机密配置值"→ SSM Parameter Store（不是 Secrets Manager）
- "使用公司管理密钥加密 S3 对象"→ 带 CMK 的 SSE-KMS

---

## 领域 2：设计弹性架构（26%）

**任务 2.1 — 设计可扩展和松耦合的架构**

核心概念：Auto Scaling、负载均衡器、SQS/SNS 解耦、Lambda 事件触发器、ECS/EKS、Step Functions。

| 章节 | 主题 |
|------|------|
| 第 7 章 | Auto Scaling Groups、Application Load Balancer、扩展策略 |
| 第 19 章 | SQS（使用队列解耦）、SNS（扇出通知） |
| 第 20 章 | Lambda：无服务器计算、事件触发器、并发 |
| 第 20 章 | API Gateway：托管 REST/HTTP/WebSocket API，可独立使用或搭配 Lambda |
| 第 21 章 | ECS 和 EKS：容器化微服务 |
| 第 22 章 | Step Functions：工作流编排 |
| 第 26 章 | Kinesis：实时数据流 |

关键考试模式：

- "将订单处理与库存更新解耦"→ 服务之间的 SQS 队列
- "新订单下单时通知多个服务"→ 带 SQS 订阅的 SNS 主题（扇出）
- "自动处理 S3 上传"→ S3 事件通知 → Lambda
- "运行带重试逻辑的多步骤工作流"→ Step Functions

---

**任务 2.2 — 设计高可用性和/或容错架构**

核心概念：Multi-AZ、Multi-Region、Route 53 故障转移、RDS 读副本、Aurora Global Database、备份和恢复。

| 章节 | 主题 |
|------|------|
| 第 2 章 | AWS 全球基础设施：区域、AZ、边缘位置 |
| 第 7 章 | 跨多个 AZ 的 ALB，ASG 替换不健康的实例 |
| 第 8 章 | RDS Multi-AZ：同步复制，自动故障转移 |
| 第 12 章 | Route 53：故障转移路由、延迟路由、健康检查 |
| 第 18 章 | Multi-AZ 与 Multi-Region：RTO/RPO，灾难恢复策略（pilot light、warm standby、active-active） |
| 第 18 章 | AWS Backup（集中式、跨账户备份）、Elastic Disaster Recovery（托管的 pilot light） |
| 第 24 章 | Aurora Global Database：跨区域读副本，< 1 秒复制延迟 |

关键考试模式：

- "主 RDS 失败时自动故障转移"→ RDS Multi-AZ（不是读副本）
- "以低延迟向全球提供读取"→ Aurora Global Database
- "主区域不可用时将流量路由到次要区域"→ Route 53 故障转移路由 + 健康检查
- "RTO 1 分钟，RPO 为 0"→ Multi-AZ 部署（不是 Multi-Region）
- "RTO 15 分钟，跨区域"→ Pilot Light 策略

---

## 领域 3：设计高性能架构（24%）

**任务 3.1 — 确定高性能和/或可扩展的存储解决方案**

核心概念：S3 与 EBS 与 EFS、存储类选择、S3 Transfer Acceleration、分段上传、CloudFront 用于静态资源。

| 章节 | 主题 |
|------|------|
| 第 5 章 | S3：对象存储、存储类、版本控制、生命周期 |
| 第 6 章 | EBS：块存储类型（gp3、io2、st1），EFS：共享文件存储 |
| 第 6 章 | Storage Gateway：本地到 S3 的混合存储桥梁（File、Volume、Tape） |
| 第 23 章 | S3 存储类转换、Glacier 检索选项 |
| 第 25 章 | DataSync（在线文件同步）、Transfer Family（托管 SFTP→S3）、Snow 系列（离线批量传输——遗留：2025 年 11 月起停止接受新客户；AWS 现在推荐 DataSync 和 Data Transfer Terminals）、MGN（服务器重新托管） |
| 第 28 章 | EBS 正确调整规格、gp2→gp3 迁移、快照管理 |

关键考试模式：

- "可从多个 EC2 实例访问的共享文件系统"→ EFS（不是 EBS；EBS 附加到一个实例）
- "数据库工作负载的高 IOPS"→ io2 EBS
- "降低 90 天未访问文件的成本"→ S3 生命周期策略 → Glacier
- "从遥远位置更快地上传大文件"→ S3 Transfer Acceleration
- "带宽有限，需要数周传输时间"→ 尽管 Snow 系列 2025 年已停止接受新客户，SAA-C03 考试仍然期望 Snowball 作为答案

---

**任务 3.2 — 确定高性能和/或可扩展的计算解决方案**

核心概念：EC2 实例系列、Graviton 处理器、Auto Scaling、Lambda、Fargate、竞价实例。

| 章节 | 主题 |
|------|------|
| 第 4 章 | EC2 实例类型：计算优化（c）、内存优化（r）、通用型（m、t） |
| 第 7 章 | Auto Scaling：Web 层的水平扩展 |
| 第 20 章 | Lambda：并发、预置并发（保证一致延迟） |
| 第 21 章 | ECS Fargate：无服务器容器 |
| 第 21 章 | AWS Batch：面向 Docker 容器的托管批量计算，可由 Spot 支撑 |
| 第 27 章 | 容错批量工作负载的竞价实例 |

关键考试模式：

- "机器学习训练工作负载，最小化成本，可以中断"→ 竞价实例
- "稳定的低于 100ms 的 Lambda 响应"→ 预置并发（消除冷启动）
- "容器化微服务，无基础设施管理"→ ECS Fargate

---

**任务 3.3 — 确定高性能数据库解决方案**

核心概念：RDS 与 DynamoDB 与 Aurora 与 Redshift 与 ElastiCache、访问模式、读副本、DAX。

| 章节 | 主题 |
|------|------|
| 第 8 章 | RDS：托管关系数据库，何时使用 RDBMS |
| 第 9 章 | DynamoDB：NoSQL、分区键、GSI、DAX（内存缓存） |
| 第 10 章 | ElastiCache：Redis 与 Memcached、缓存策略 |
| 第 10 章 | MemoryDB for Redis：持久的 Redis 兼容主数据库 |
| 第 24 章 | Aurora：性能、Serverless v2、读副本、Global Database |
| 第 29 章 | DynamoDB 按需与带 Auto Scaling 的预置容量 |

关键考试模式：

- "会话存储的微秒级读取"→ ElastiCache Redis 或 DAX（如果后端是 DynamoDB）
- "灵活模式的高吞吐量键值访问"→ DynamoDB
- "复杂连接和 ACID 事务"→ Aurora 或 RDS
- "对 PB 级结构化数据的分析"→ Redshift（未详细涵盖，但信号是："数据仓库"→ Redshift）

---

**任务 3.4 — 确定高性能和/或可扩展的网络架构**

核心概念：CloudFront、Global Accelerator、Direct Connect、VPN、置放群组、增强网络。

| 章节 | 主题 |
|------|------|
| 第 7 章 | NLB（第 4 层）和 GWLB（用于网络设备的 Gateway Load Balancer） |
| 第 11 章 | Client VPN：单个设备到 VPC 的加密访问 |
| 第 12 章 | Route 53：路由策略：基于延迟、地理位置、加权 |
| 第 13 章 | CloudFront：CDN、边缘缓存、Lambda@Edge |
| 第 25 章 | AWS Global Accelerator：Anycast 路由接入 AWS 骨干网 |
| 第 25 章 | Direct Connect：专用私有连接 |
| 第 30 章 | VPC 终端节点：到 AWS 服务的私有连接 |

关键考试模式：

- "降低访问动态 API 响应的全球用户延迟"→ Global Accelerator（不是 CloudFront，CloudFront 最适合可缓存内容）
- "降低全球静态资源的延迟"→ CloudFront
- "从本地到 AWS 的稳定私有连接"→ Direct Connect
- "全球各地的客户快速上传到你的 S3 桶"→ S3 Transfer Acceleration

---

**任务 3.5 — 确定高性能数据摄取和转换解决方案**

核心概念：Kinesis Data Streams、Amazon Data Firehose、Glue、Athena、EMR。

| 章节 | 主题 |
|------|------|
| 第 26 章 | Kinesis Data Streams：实时有序事件处理 |
| 第 26 章 | Amazon Data Firehose（前身为 Kinesis Data Firehose）：到 S3、Redshift、OpenSearch 的托管传递 |
| 第 26 章 | AWS Glue：无服务器 ETL、Data Catalog、爬虫 |
| 第 26 章 | Athena：S3 上的无服务器 SQL |
| 第 26 章 | QuickSight：托管 BI 仪表板，SPICE 内存引擎 |
| 第 26 章 | Lake Formation：细粒度数据湖访问控制 |

关键考试模式：

- "实时处理点击流数据"→ Kinesis Data Streams + Lambda 或 Managed Service for Apache Flink（前身为 Kinesis Data Analytics）
- "将流数据传递到 S3 供后续分析"→ Amazon Data Firehose
- "从多个来源转换和编目数据"→ AWS Glue
- "使用 SQL 查询存储在 S3 中的历史数据"→ Athena

---

## 领域 4：设计成本优化架构（20%）

**任务 4.1 — 设计成本优化的存储解决方案**

| 章节 | 主题 |
|------|------|
| 第 23 章 | S3 生命周期策略、存储类转换 |
| 第 28 章 | EBS 正确调整规格、gp2→gp3 迁移、S3 版本控制生命周期规则 |
| 第 28 章 | EFS Intelligent-Tiering、成本分配标签、AWS Budgets |

关键考试模式：

- "确定哪个团队产生了最多的 S3 成本"→ 成本分配标签 + Cost Explorer
- "自动降低很少访问的对象的成本"→ S3 Intelligent-Tiering
- "当月度成本超过 $10,000 时发出警报"→ AWS Budgets

---

**任务 4.2 — 设计成本优化的计算解决方案**

| 章节 | 主题 |
|------|------|
| 第 2 章 | Outposts：本地 AWS 机架（资本成本与云运营支出的权衡） |
| 第 2 章 | Wavelength：5G 边缘计算（电信合作，由延迟驱动的部署位置） |
| 第 27 章 | EC2 定价：按需、预留实例、Savings Plans、竞价实例、专用主机 |
| 第 20 章 | Lambda：按调用付费（零空闲成本） |

关键考试模式：

- "降低稳定生产工作负载的成本"→ Savings Plans（更灵活）或预留实例
- "最大限度降低可中断批量作业的成本"→ 竞价实例
- "零空闲成本的事件驱动处理"→ Lambda

---

**任务 4.3 — 设计成本优化的数据库解决方案**

| 章节 | 主题 |
|------|------|
| 第 29 章 | DynamoDB 按需与预置 + Auto Scaling |
| 第 29 章 | RDS 和 ElastiCache 预留实例/节点 |
| 第 29 章 | RDS 快照管理 |

关键考试模式：

- "不可预测的 DynamoDB 流量"→ 按需容量模式
- "具有已知峰值的稳定 DynamoDB 流量"→ 预置 + Auto Scaling
- "降低稳定工作负载的 RDS 成本"→ 预留实例（1 年或 3 年）

---

**任务 4.4 — 设计成本优化的网络架构**

| 章节 | 主题 |
|------|------|
| 第 30 章 | 数据传输定价：入站（免费）、跨 AZ（$0.01/GB）、跨区域、互联网（$0.09/GB） |
| 第 30 章 | NAT Gateway（$0.045/GB）与 VPC 终端节点（网关：免费；接口：收费） |
| 第 30 章 | CloudFront 作为数据传输成本优化器 |

关键考试模式：

- "私有子网中的 EC2 调用 S3——消除 NAT Gateway 成本"→ S3 网关终端节点（免费）
- "私有子网中的 EC2 调用 SQS——降低 NAT Gateway 成本"→ SQS 接口终端节点
- "降低全球内容分发的数据传输成本"→ CloudFront（缓存减少源站请求）

---

## 跨领域主题

某些主题跨越多个领域：

| 主题 | 领域 | 章节 |
|------|------|------|
| Well-Architected Framework | 所有 | 31 |
| 架构评审和 ADR | 所有 | 32 |
| 权衡推理（"视情况而定"） | 所有 | 33 |
| Multi-AZ 设计 | 2、3 | 7、8、18、24 |
| 监控和可观测性 | 1、2 | 全书 |
| CloudFront | 3、4 | 13、30 |

---

## 考前检查清单

在参加 SAA-C03 之前：

**高权重领域（最可能出现）**

- [ ] IAM 策略评估逻辑（明确拒绝 → 明确允许 → 隐式拒绝）
- [ ] VPC 组件：子网、路由表、IGW、NAT Gateway、安全组、NACL
- [ ] S3 存储类及各自的使用场景
- [ ] RDS Multi-AZ 与读副本（故障转移与读取扩展）
- [ ] SQS 与 SNS 与 EventBridge（拉取与推送与事件路由）
- [ ] EC2 定价模式：竞价实例用于容错工作负载，Savings Plans 用于承诺工作负载
- [ ] Lambda 触发器和并发
- [ ] DynamoDB 与 Aurora 与 Redshift（访问模式决定选择）
- [ ] CloudFront：CDN 用于静态内容，Global Accelerator 用于动态内容

**常见陷阱**

- [ ] EBS 附加到一个实例；EFS 是共享的
- [ ] RDS 读副本用于读取扩展，不是自动故障转移（那是 Multi-AZ）
- [ ] NACL 是无状态的（需要入站和出站规则）
- [ ] 网关终端节点是免费的，只适用于 S3 和 DynamoDB
- [ ] Kinesis 保留并可重播；SQS 在消费时删除
- [ ] "解耦"并不总是意味着 SQS——SNS 扇出和 EventBridge 也是解耦模式
- [ ] Shield Standard 是免费且自动的；Advanced 是付费订阅
- [ ] ElastiCache 与 MemoryDB：ElastiCache = 缓存（可接受数据丢失）。MemoryDB = 持久的主数据库。
- [ ] Client VPN 与 Site-to-Site VPN：Client VPN = 单个设备。Site-to-Site = 网络到网络。
- [ ] Outposts 与 Wavelength：Outposts = 本地 AWS 机架。Wavelength = 5G 边缘。
- [ ] DMS：同构 = 直接用 DMS。异构 = 先用 SCT，再用 DMS。
- [ ] DataSync 迁移*文件*；DMS 迁移*数据库*；MGN 迁移*整台服务器*。

**考试结构**

- 65 题，130 分钟（2 小时 10 分钟）
- 多项选择（一个正确答案）和多项响应（选择 N 个正确答案）
- 通过分数：1000 分中的 720 分
- 未评分题目嵌入其中；你无法判断哪些是未评分的
- 管理时间：每题约 2 分钟；标记难题，稍后返回
