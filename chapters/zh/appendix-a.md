# 附录 A：AWS 服务快速参考

本书中涵盖的每项服务，按介绍顺序排列。在考试备考和复习期间将其作为学习参考和快速查阅工具。

---

## 计算

**EC2 — Elastic Compute Cloud** *（第 4 章）*

云中的虚拟机。你选择实例类型（CPU、内存、存储）、操作系统和区域。按小时付费（按需）、按承诺付费（预留实例/Savings Plans）或按空闲容量插槽付费（竞价实例）。这是基础计算原语。

关键概念：AMI（Amazon Machine Image）、实例类型（t3、m6g、r6g、c6g 系列）、密钥对、实例配置文件、置放群组。

考试信号：当场景需要持久、有状态或长时运行的计算时——EC2 或 ECS。当场景需要短时运行、事件触发或零空闲成本计算时——Lambda。

---

**Auto Scaling + Application Load Balancer** *（第 7 章）*

Auto Scaling Groups（ASG）根据负载添加和删除 EC2 实例。Application Load Balancers（ALB）在实例之间分发流量，并按路径或主机路由。它们共同形成水平扩展层。

关键概念：启动模板、扩展策略（目标追踪、步进、计划）、健康检查、ALB 目标组、监听器规则、加权路由。

考试信号："处理可变负载"或"跨 AZ 高可用性"→ ASG + ALB。

---

**Lambda** *（第 20 章）*

无服务器函数。你编写代码；AWS 响应事件运行它。无需管理服务器。按调用次数和每毫秒执行时间付费。自动扩展到数千个并发执行。

关键概念：事件源（API Gateway、S3、SQS、EventBridge、Kinesis）、执行角色、并发限制、预留和预置并发、冷启动、层、最长 15 分钟持续时间。

考试信号："无服务器"、"事件驱动"、"短时运行任务"、"无空闲成本"→ Lambda。

---

**ECS — Elastic Container Service** *（第 21 章）*

在 AWS 上运行 Docker 容器。两种启动类型：EC2（你管理主机）和 Fargate（AWS 管理主机）。ECS 管理任务定义、服务、集群调度以及与负载均衡器和服务发现的集成。

关键概念：任务定义、ECS 服务、Fargate 与 EC2 启动类型、ECR（容器注册表）、任务 IAM 角色、服务自动扩展。

考试信号："容器化工作负载"、"微服务"、"AWS 上的 Docker"→ ECS（通常用 Fargate 实现无服务器容器）。

---

**EKS — Elastic Kubernetes Service** *（第 21 章）*

托管 Kubernetes。AWS 为你运行 Kubernetes 控制平面；你运行工作节点（EC2 或 Fargate）。当你的团队已经使用 Kubernetes 或有需要 Kubernetes 特定功能的工作负载时使用 EKS。

考试信号："Kubernetes"、"需要迁移现有 K8s 工作负载"→ EKS。"只需要容器而不需要 K8s 开销"→ ECS。

---

## 存储

**S3 — Simple Storage Service** *（第 5 章）*

对象存储。无限容量，99.999999999%（11 个 9）耐久性。将文件作为对象存储在桶中。桶位于特定区域。对象大小从 0 字节到 5TB 不等。

关键概念：桶策略、对象 ACL、版本控制、静态网站托管、预签名 URL、分段上传、Transfer Acceleration、存储类（Standard、Intelligent-Tiering、Standard-IA、One Zone-IA、Glacier Instant Retrieval、Glacier Flexible Retrieval、Glacier Deep Archive）。

考试信号："存储和检索文件"、"静态资源"、"备份"、"数据湖"→ S3。正确的存储类取决于访问频率和检索速度。

---

**EBS — Elastic Block Store** *（第 6 章）*

附加到单个 EC2 实例的块存储。像硬盘一样运行。独立于实例生命周期持久存在（你可以分离并重新附加）。最常见的类型：gp3（通用 SSD，默认值）、io2（数据库的预置 IOPS）、st1（顺序读取的吞吐量优化 HDD）。

关键概念：快照（增量，存储在 S3 中）、加密（KMS）、Multi-Attach（仅限 io1/io2）、IOPS 和吞吐量配置。

考试信号："EC2 的持久存储"、"数据库存储"、"需要低延迟块访问"→ EBS。

---

**EFS — Elastic File System** *（第 6 章）*

可同时从多个 EC2 实例访问的共享文件系统。NFS 协议。自动扩展。每 GB 比 EBS 更贵。两种存储类：Standard 和 Infrequent Access。Intelligent-Tiering 自动移动文件。

考试信号："共享文件系统"、"多个 EC2 实例需要相同文件"、"NFS"→ EFS。

---

**S3 存储类和生命周期策略** *（第 23 章）*

S3 Intelligent-Tiering 根据访问频率自动在访问层之间移动对象。生命周期策略根据使用时长规则将对象在类之间转换（Standard → Standard-IA → Glacier）。Glacier 存储类的检索延迟从几分钟（Glacier Instant）到 12 小时（Glacier Deep Archive）不等。

考试信号："自动降低不频繁访问数据的存储成本"→ 生命周期策略、Intelligent-Tiering 或 Glacier。

---

## 数据库

**RDS — Relational Database Service** *（第 8 章）*

托管关系数据库。支持的引擎：MySQL、PostgreSQL、MariaDB、Oracle、SQL Server 以及 Aurora（AWS 的专有引擎）。AWS 处理备份、补丁、故障转移和复制。你管理模式设计、查询和实例调整大小。

关键概念：Multi-AZ 部署（自动故障转移，同步复制）、读副本（异步，用于读取扩展）、自动备份（保留 1-35 天）、手动快照（保留直到删除）、RDS Proxy（连接池）。

考试信号："关系数据库"、"ACID 事务"、"现有 SQL 工作负载"→ RDS 或 Aurora。

---

**Aurora** *（第 24 章）*

AWS 的关系数据库引擎，与 MySQL 和 PostgreSQL 兼容。分布式存储引擎，在 3 个 AZ 的 6 个副本中复制数据。通常比 MySQL 快 5 倍。Aurora Serverless v2 自动扩展容量（以 ACU——Aurora 容量单位衡量）。

关键概念：Aurora 集群（主库 + 最多 15 个读端点）、Aurora Global Database（跨区域读副本，复制延迟 <1 秒）、Aurora Serverless v2。

考试信号："高性能关系数据库"、"MySQL/PostgreSQL 兼容"、"全球读取"、"可变工作负载"→ Aurora。

---

**DynamoDB** *（第 9 章）*

完全托管的 NoSQL 数据库。键值和文档模型。以单个位数毫秒的性能扩展到任意吞吐量。两种容量模式：按需（按请求付费）和预置（每小时按容量单位付费，带 Auto Scaling）。

关键概念：分区键（必需）、排序键（可选）、全局二级索引（GSI）、本地二级索引（LSI）、DynamoDB Streams（变更数据捕获）、DynamoDB Accelerator（DAX）——内存缓存、TTL（生存时间）、事务。

考试信号："高吞吐量基于键的访问"、"灵活模式"、"无服务器 NoSQL"→ DynamoDB。

---

**ElastiCache** *（第 10 章）*

托管的内存缓存。两种引擎：Redis（持久、发布/订阅、Lua 脚本、数据结构）和 Memcached（纯缓存，更简单，多线程）。用于减少数据库负载，以微秒速度提供频繁读取的数据。

关键概念：Cache-aside 模式、Write-through 模式、驱逐策略、TTL、集群模式（Redis）、自动故障转移的 Multi-AZ。

考试信号："减少数据库负载"、"亚毫秒读取延迟"、"会话管理"、"实时排行榜"→ ElastiCache Redis。

---

## 网络

**VPC — Virtual Private Cloud** *（第 11 章）*

AWS 中的隔离网络。跨区域中的所有 AZ。你定义 IP 地址空间（CIDR 块），创建子网（公共或私有），配置路由表，并通过安全组和 NACL 控制访问。

关键概念：公共子网（路由到 Internet Gateway）、私有子网（路由到 NAT Gateway 用于出站）、Internet Gateway（到互联网的入站 + 出站）、NAT Gateway（仅对私有实例的出站）、VPC 对等（连接两个 VPC）、VPC 终端节点（连接到 AWS 服务而不经过互联网）。

考试信号："AWS 上的私有网络"、"将资源与互联网隔离"、"控制网络流量"→ VPC。

---

**安全组和 NACL** *（第 15 章）*

安全组是实例级别的有状态防火墙——只有允许规则，返回流量是自动的。NACL（网络访问控制列表）是子网级别的无状态防火墙——需要入站和出站规则，按规则号顺序评估。

考试信号："阻止特定 IP 访问子网"→ NACL。"控制到/从实例的流量"→ 安全组。

---

**Route 53** *（第 12 章）*

AWS 的 DNS 服务和域名注册商。将互联网流量路由到 AWS 资源和外部端点。路由策略：简单、加权、基于延迟、故障转移、地理位置、地理近邻、多值应答。

关键概念：托管区域（公共和私有）、记录类型（A、AAAA、CNAME、Alias）、健康检查、Traffic Flow（可视化策略编辑器）。

考试信号："DNS 路由"、"区域之间的故障转移"、"基于延迟或位置路由"→ Route 53 搭配适当的路由策略。

---

**CloudFront** *（第 13 章）*

内容分发网络（CDN）。在边缘位置（全球 400 多个）缓存内容。降低最终用户延迟。通过缓存降低原始传输成本。与 S3、EC2、ALB 和 API Gateway 作为来源集成。

关键概念：分发、来源、行为（基于路径路由到来源）、TTL（缓存控制）、缓存失效、签名 URL 和 Cookie（访问控制）、Lambda@Edge 和 CloudFront Functions（在边缘运行代码）、Origin Shield（减少原始负载）。

考试信号："全球低延迟"、"缓存静态内容"、"减少原始负载"、"使用 Shield 防御 DDoS"→ CloudFront。

---

**Direct Connect 和 VPN** *（第 25 章）*

AWS Direct Connect 是从你的本地数据中心到 AWS 的专用物理网络连接。绕过公共互联网。更一致的带宽和延迟。AWS Site-to-Site VPN 是通过公共互联网的加密隧道——设置更快，成本更低，但性能可变。

关键概念：虚拟接口（VIF）、Direct Connect Gateway（连接到多个区域）、Transit Gateway（中心辐射式网络拓扑）、VPN 隧道冗余。

考试信号："到 AWS 的专用私有连接"→ Direct Connect。"加密连接，更快设置"→ VPN。"连接多个 VPC"→ Transit Gateway。

---

**VPC 终端节点** *（第 30 章）*

将私有资源连接到 AWS 服务，无需使用公共互联网或 NAT Gateway。网关终端节点：免费，仅适用于 S3 和 DynamoDB。接口终端节点（PrivateLink）：按小时 + 按 GB 计费，适用于大多数 AWS 服务。

考试信号："私有子网中的 EC2 调用 S3/DynamoDB——降低 NAT Gateway 成本"→ 网关终端节点（免费）。"从私有子网到 SQS、SSM、Secrets Manager 的私有连接"→ 接口终端节点。

---

## 安全与身份

**IAM — Identity and Access Management** *（第 3 章和第 14 章）*

控制谁可以在你的 AWS 账户中做什么。用户（长期凭证）、组（共享权限的用户）、角色（服务和跨账户访问的临时凭证）、策略（定义允许/拒绝规则的 JSON 文档）。

关键概念：主体、操作、资源、条件、明确拒绝 > 明确允许 > 隐式拒绝、SCP（AWS Organizations 中的服务控制策略）、权限边界、AssumeRole。

考试信号：IAM 涉及每个安全问题。关键模式：服务使用 IAM 角色（不是用户）。跨账户访问使用角色假设。最小权限——只授予所需的权限。

---

**KMS — Key Management Service** *（第 16 章）*

托管的加密密钥服务。创建、存储和控制加密密钥。客户管理密钥（CMK）允许你定义轮换、使用和访问策略。AWS 管理密钥自动管理。

关键概念：密钥策略（独立于 IAM 策略）、信封加密（数据用数据密钥加密；数据密钥用 CMK 加密）、自动密钥轮换、多区域密钥、授权。

考试信号："加密静态数据"、"客户管理的加密密钥"、"密钥轮换"→ KMS。

---

**Secrets Manager** *（第 16 章）*

存储并自动轮换敏感值：数据库凭证、API 密钥、OAuth 令牌。与 RDS 集成以实现自动密码轮换。应用程序在运行时通过 API 检索密码——永远不要硬编码凭证。

考试信号："存储和轮换数据库凭证"、"避免硬编码密钥"→ Secrets Manager。"存储配置值，而非密钥"→ Parameter Store（SSM）。

---

**AWS Shield** *（第 17 章）*

DDoS 防护。Shield Standard 自动且免费——防御常见的容量型和协议攻击。Shield Advanced 添加财务保护、24/7 DDoS 响应团队和详细的攻击可见性。

考试信号："防御 DDoS"→ Shield Standard（自动）或 Shield Advanced（企业级，有 SLA）。

---

**WAF — Web Application Firewall** *（第 17 章）*

根据规则过滤 HTTP/HTTPS 流量：IP 封锁、速率限制、SQL 注入模式、XSS 模式、地理限制、自定义规则。附加到 CloudFront、ALB、API Gateway 或 AppSync。

考试信号："封锁特定 IP 地址"、"在边缘防止 SQL 注入"、"限制 API 调用速率"→ WAF。

---

**GuardDuty** *（第 17 章）*

威胁检测服务。使用机器学习和威胁情报分析 CloudTrail 日志、VPC Flow Logs 和 DNS 日志。检测异常的 API 活动、与已知恶意 IP 的通信、被入侵的凭证。

考试信号："检测异常活动"、"识别被入侵的 IAM 凭证"、"持续威胁监控"→ GuardDuty。

---

## 消息传递和事件处理

**SQS — Simple Queue Service** *（第 19 章）*

托管消息队列。生产者发送消息；消费者读取并删除它们。解耦服务：发送者不需要知道接收者是否可用。Standard 队列：至少一次传递，尽力而为的顺序。FIFO 队列：恰好一次处理，严格顺序。

关键概念：可见性超时（消息在处理时对其他消费者不可见）、死信队列（DLQ）用于多次失败的消息、消息保留（默认 4 天，最长 14 天）、长轮询（减少空响应）。

考试信号："解耦服务"、"在负载峰值期间缓冲请求"、"异步处理"→ SQS。"顺序重要且需要恰好一次"→ SQS FIFO。

---

**SNS — Simple Notification Service** *（第 19 章）*

托管的发布/订阅服务。发布者向主题发送消息；所有订阅者接收副本。扇出模式：一条消息 → 多个消费者。协议：SQS、Lambda、HTTP/HTTPS、电子邮件、SMS、手机推送。

关键概念：主题、订阅、扇出模式（SNS → 多个 SQS 队列）、消息过滤（订阅者只接收匹配的消息）。

考试信号："同时向多个端点发送通知"、"将单个事件扇出到多个消费者"→ SNS。常见模式：SNS + SQS 用于持久扇出。

---

**EventBridge** *（第 22 章）*

用于构建事件驱动架构的事件总线。将来自 AWS 服务、SaaS 合作伙伴和自定义来源的事件路由到 Lambda、SQS、SNS、Step Functions 和其他目标。支持计划规则（cron）和模式匹配。

考试信号："将 AWS 服务的事件路由到目标"、"调度 Lambda 函数"、"服务之间的事件驱动编排"→ EventBridge。

---

**Step Functions** *（第 22 章）*

无服务器工作流编排。将 Lambda 函数、ECS 任务、DynamoDB、SNS、SQS 和其他服务协调成可视化状态机。处理重试、错误处理、并行分支和等待状态。

关键概念：状态机、状态类型（Task、Wait、Choice、Parallel、Map、Pass、Succeed、Fail）、标准工作流（恰好一次，长时运行）与快速工作流（至少一次，高量）。

考试信号："编排多个 Lambda 函数"、"具有重试逻辑的长时运行工作流"、"人工审批步骤"→ Step Functions。

---

**Kinesis** *（第 26 章）*

实时数据流。Kinesis Data Streams：持久的、有序的记录流（像分布式提交日志）。消费者处理记录；数据保留 24 小时到 7 天。Kinesis Data Firehose：到 S3、Redshift、OpenSearch、Splunk 的完全托管传递——不需要消费者管理。

关键概念：分片（吞吐量单位：1MB/s 写，2MB/s 读）、分区键（决定分片分配）、序列号、检查点（KCL 或 Lambda）、Firehose 与 Streams 对比。

考试信号："实时流"、"有序记录"、"重播事件"→ Kinesis Data Streams。"将流数据传递到 S3/Redshift，无需管理消费者"→ Kinesis Firehose。与 SQS 对比：Kinesis 保留和重播；SQS 在消费时删除。

---

## 分析

**Athena** *（第 26 章）*

对存储在 S3 中的数据进行无服务器 SQL 查询。无需管理基础设施。按查询付费（按扫描的 TB 计算）。最适合列式格式（Parquet、ORC）和分区数据。

考试信号："使用 SQL 查询 S3 数据"、"对数据湖进行临时分析，无需基础设施管理"→ Athena。

---

**Glue** *（第 26 章）*

无服务器 ETL（提取、转换、加载）服务。Glue 爬虫发现数据并更新 Glue Data Catalog。Glue 作业运行 Spark 或 Python 转换。Data Catalog 与 Athena、Redshift Spectrum 和 EMR 集成。

考试信号："转换和加载分析数据"、"发现 S3 数据的模式"、"ETL 流水线"→ Glue。

---

## 高可用性和灾难恢复

**Multi-AZ 和 Multi-Region** *（第 18 章）*

Multi-AZ：区域内的同步复制用于自动故障转移（RDS Multi-AZ，跨 AZ 的负载均衡器）。RPO ~0，RDS 的 RTO ~60 秒。Multi-Region：用于地理冗余和全球用户更低延迟的异步复制。

关键概念：RTO（恢复时间目标——多长时间可以恢复）、RPO（恢复点目标——可以丢失多少数据）。Pilot Light、Warm Standby、Active-Active 灾难恢复策略。

考试信号：区分 AZ 级故障（Multi-AZ 处理）与区域故障（Multi-Region 处理）。Multi-Region 的成本和复杂性明显增加。

---

## 成本优化

**EC2 定价模式** *（第 27 章）*

按需：全价，无承诺。预留实例（1 年或 3 年）：对特定实例类型享受 30-72% 折扣。Savings Plans（计算或 EC2 实例）：承诺每小时支出以获得灵活性。竞价实例：可中断工作负载享受 60-90% 折扣。

考试信号："最大限度降低可预测工作负载的成本"→ Savings Plans 或预留实例。"容错批量处理"→ 竞价实例。"不可预测或短期"→ 按需。

---

**数据传输定价** *（第 30 章）*

进入 AWS：免费。同一 AZ：免费。跨 AZ：每个方向 $0.01/GB。跨区域：$0.02-0.08/GB。互联网（出站）：约 $0.09/GB。NAT Gateway 处理：$0.045/GB。CloudFront 数据传输比直接 EC2 到互联网更便宜，缓存降低总量。

考试信号："降低从私有子网访问 S3/DynamoDB 的数据传输成本"→ 网关终端节点（免费）。"降低其他服务的 NAT Gateway 成本"→ 接口终端节点。

---

## 可观测性

**CloudWatch** *（全书引用）*

监控和可观测性。CloudWatch Metrics：来自 AWS 服务和自定义应用程序的数字时间序列数据。CloudWatch Logs：收集、搜索和分析日志数据。CloudWatch Alarms：根据指标阈值触发通知或自动扩展。CloudWatch Dashboards：可视化指标。

关键概念：指标维度、保留期、日志组和日志流、指标过滤器、CloudWatch Agent（用于 EC2 的操作系统级指标和日志）、Container Insights。

---

**CloudTrail** *（全书引用）*

记录你 AWS 账户中发出的每个 API 调用：谁发出的，从哪里，什么时候，响应是什么。多区域跟踪将日志无限期存储在 S3 中。用于安全审计、合规和事故调查。

考试信号："谁删除了那个资源？""审计所有 API 活动"→ CloudTrail。

---

**AWS Config** *（第 31 章中引用）*

随时间追踪资源配置变更。根据合规规则评估资源。记录每个资源的每次配置变更历史。与 Systems Manager 集成以进行修复。

考试信号："这个资源是否符合我们的安全策略？""这个资源上周的配置是什么样的？"→ AWS Config。

---

## Well-Architected

**六个支柱** *（第 31 章）*

| 支柱 | 核心问题 | 关键服务 |
|------|---------|---------|
| 运营卓越 | 我们运营良好吗？ | CloudWatch、CloudTrail、SSM、Config |
| 安全 | 我们受到保护吗？ | IAM、KMS、GuardDuty、WAF、Shield、Secrets Manager |
| 可靠性 | 我们能从失败中恢复吗？ | Multi-AZ、Route 53 故障转移、备份/恢复、SQS |
| 性能效率 | 我们使用了正确的资源吗？ | 正确调整大小、Auto Scaling、CloudFront、Kinesis |
| 成本优化 | 我们明智地消费吗？ | Savings Plans、竞价实例、S3 生命周期、VPC 终端节点 |
| 可持续性 | 我们在最大限度减少环境影响吗？ | 正确调整大小、Graviton、高效存储层 |

AWS Well-Architected Tool：根据六个支柱评估你的架构。在考试前使用它来理解每个支柱问题背后的推理。
