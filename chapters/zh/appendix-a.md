# 附录 A：AWS 服务快速参考

本书中涵盖的每项服务，按介绍顺序排列。在考试备考期间将其作为学习参考和快速查阅工具。

---

## 计算

**EC2 — Elastic Compute Cloud** *（第 4 章）*

云中的虚拟机。你选择实例类型（CPU、内存、存储）、操作系统和区域。按小时付费（按需）、按承诺付费（预留实例/Savings Plans）或按空闲容量插槽付费（竞价实例）。这是基础计算原语。

关键概念：AMI（Amazon Machine Image）、实例类型（t3、m6g、r6g、c6g 系列）、密钥对、实例配置文件、置放群组。

考试信号：当场景需要持久、有状态或长时运行的计算时——EC2 或 ECS。当场景需要短时运行、事件触发或零空闲成本计算时——Lambda。

---

**Auto Scaling + Application Load Balancer** *（第 7 章）*

Auto Scaling Groups（ASG）根据负载添加和删除 EC2 实例。Application Load Balancers（ALB）在实例之间分发流量，并按路径或主机路由。它们共同构成水平扩展层。

关键概念：启动模板、扩展策略（目标追踪、步进、计划）、健康检查、ALB 目标组、监听器规则、加权路由。

考试信号："处理可变负载"或"跨 AZ 高可用性"→ ASG + ALB。

---

**Lambda** *（第 20 章）*

无服务器函数。你编写代码；AWS 响应事件运行它。无需管理服务器。按调用次数和每毫秒执行时间付费。自动扩展到数千个并发执行。

关键概念：事件源（API Gateway、S3、SQS、EventBridge、Kinesis）、执行角色、并发限制、预留并发和预置并发、冷启动、层（Layers）、最长 15 分钟持续时间。

考试信号："无服务器"、"事件驱动"、"短时运行任务"、"无空闲成本"→ Lambda。

---

**ECS — Elastic Container Service** *（第 21 章）*

在 AWS 上运行 Docker 容器。两种启动类型：EC2（你管理主机）和 Fargate（AWS 管理主机）。ECS 管理任务定义、服务、集群调度，以及与负载均衡器和服务发现的集成。

关键概念：任务定义、ECS 服务、Fargate 与 EC2 启动类型、ECR（容器注册表）、任务 IAM 角色、服务自动扩展。

考试信号："容器化工作负载"、"微服务"、"AWS 上的 Docker"→ ECS（通常用 Fargate 实现无服务器容器）。

---

**EKS — Elastic Kubernetes Service** *（第 21 章）*

托管 Kubernetes。AWS 运行控制平面；你运行工作节点（EC2 或 Fargate）。当你的团队已经使用 Kubernetes 或有需要 Kubernetes 特定功能的工作负载时使用 EKS。

考试信号："Kubernetes"、"需要迁移现有 K8s 工作负载"→ EKS。"只需要容器而不需要 K8s 开销"→ ECS。

---

**AWS Batch** *（第 21 章）*

面向 Docker 容器的托管批量计算。你定义一个作业（Docker 镜像 + 命令）、一个作业队列和一个计算环境（EC2 或 Fargate）。AWS Batch 自动预置和扩展计算资源，作业完成后将其终止。支持竞价实例以降低成本。

关键概念：作业定义（运行什么）、作业队列（作业在哪里等待）、计算环境（EC2 或 Fargate、按需或竞价）、数组作业（并行运行同一作业的多个副本）。

考试信号："超过 Lambda 15 分钟超时的批量处理"、"容器上的有限计算作业"、"AWS 上的 HPC 工作负载"→ AWS Batch。

---

**AWS Outposts** *（第 2 章）*

安装在你自己的数据中心或托管设施中的、完全托管的 AWS 硬件机架。在本地物理环境中运行与公有云相同的 AWS 服务、API 和工具（EC2、EBS、RDS、EKS、S3 on Outposts）。

关键概念：本地环境中相同的 AWS API、AWS 负责安装和打补丁、客户提供机架空间和电力、Local Gateway（LGW）将 Outposts 连接到本地网络。

考试信号："在你自己的数据中心运行 AWS"、"数据驻留要求计算必须留在本地"、"不依赖互联网的 AWS API"→ Outposts。

---

**AWS Wavelength** *（第 2 章）*

部署在 5G 电信运营商网络内部的 AWS 基础设施。Wavelength Zones 位于 5G 网络边缘，可为移动设备提供个位数毫秒级延迟。

关键概念：Wavelength Zones 是 AWS 区域在电信网络中的延伸，设备与 Wavelength Zone 之间的流量始终留在运营商网络上。

考试信号："面向 5G 移动用户的个位数毫秒级延迟"、"移动 AR/VR"、"移动端实时游戏"、"自动驾驶车辆遥测"→ Wavelength。

---

**AWS Application Migration Service (MGN)** *（第 25 章）*

重新托管（直接迁移，lift-and-shift）的迁移服务。代理将源服务器的磁盘逐块复制到 AWS 中的低成本暂存区；你可以按需启动测试副本；在切换时，MGN 将复制的服务器转换为原生 EC2 实例。无需修改应用程序。

关键概念：块级持续复制、暂存区、切换前的测试启动、"7 R"迁移策略（MGN = rehost，重新托管）。

考试信号："快速迁移数百台 VM 且无需修改代码"、"将服务器直接迁移到 EC2"→ MGN。DataSync 迁移的是*文件*；DMS 迁移的是*数据库*；MGN 迁移的是*整台服务器*。

---

## 存储

**S3 — Simple Storage Service** *（第 5 章）*

对象存储。无限容量，99.999999999%（11 个 9）耐久性。将文件作为对象存储在桶中。桶位于特定区域。对象大小从 0 字节到 5TB 不等。

关键概念：桶策略、对象 ACL、版本控制、静态网站托管、预签名 URL、分段上传、Transfer Acceleration、存储类（Standard、Intelligent-Tiering、Standard-IA、One Zone-IA、Glacier Instant Retrieval、Glacier Flexible Retrieval、Glacier Deep Archive，以及面向单 AZ、延迟敏感的目录桶工作负载的 S3 Express One Zone）。

考试信号："存储和检索文件"、"静态资源"、"备份"、"数据湖"→ S3。正确的存储类取决于访问频率和检索速度。

---

**EBS — Elastic Block Store** *（第 6 章）*

附加到单个 EC2 实例的块存储。像硬盘一样工作。独立于实例生命周期持久存在（你可以分离并重新附加）。最常见的类型：gp3（通用 SSD，默认值）、io2（面向数据库的预置 IOPS）、st1（面向顺序读取的吞吐量优化 HDD）。

关键概念：快照（增量，存储在 S3 中）、加密（KMS）、Multi-Attach（仅限 io1/io2）、IOPS 和吞吐量预置。

考试信号："EC2 的持久存储"、"数据库存储"、"需要低延迟块访问"→ EBS。

---

**EFS — Elastic File System** *（第 6 章）*

可同时从多个 EC2 实例访问的共享文件系统。NFS 协议。自动扩展。每 GB 比 EBS 更贵。存储类包括 Standard、Infrequent Access 和 Archive。Intelligent-Tiering 自动移动文件。

考试信号："共享文件系统"、"多个 EC2 实例需要相同文件"、"NFS"→ EFS。

---

**FSx 系列** *（第 6 章）*

面向特定技术的托管文件服务器。FSx for Windows File Server：SMB 协议、NTFS、Active Directory 集成、Multi-AZ。FSx for Lustre：面向 HPC/ML 的并行高性能文件系统，将 S3 对象呈现为文件（延迟加载）。FSx for NetApp ONTAP：多协议（NFS + SMB + iSCSI）、快照、SnapMirror 复制。FSx for OpenZFS：低延迟 NFS、即时快照和可写克隆。

考试信号："SMB/Active Directory"→ FSx for Windows。"基于 S3 数据的 HPC/ML 训练"→ FSx for Lustre。"NFS 和 SMB 访问同一份数据/NetApp 迁移"→ FSx for ONTAP。"ZFS 迁移/即时克隆"→ FSx for OpenZFS。

---

**S3 存储类和生命周期策略** *（第 23 章）*

S3 Intelligent-Tiering 根据访问频率自动在访问层之间移动对象。生命周期策略根据对象使用时长规则在存储类之间转换对象（Standard → Standard-IA → Glacier）。Glacier 存储类的检索延迟从几分钟（Glacier Instant）到 12 小时（Glacier Deep Archive）不等。

考试信号："降低不频繁访问数据的存储成本"→ 生命周期策略、Intelligent-Tiering 或 Glacier。

---

**AWS Storage Gateway** *（第 6 章）*

将本地环境连接到 AWS 存储的混合存储服务。以应用程序已经理解的协议提供存储，同时将数据持久化到 S3、S3 Glacier 或 EBS 快照。

关键概念：File Gateway（NFS/SMB → S3）、Volume Gateway（iSCSI，缓存或存储模式）、Tape Gateway（虚拟磁带库 → Glacier）。

考试信号："本地应用程序需要云存储且无需修改代码"→ Storage Gateway。"替换磁带备份"→ Tape Gateway。

---

**AWS DataSync** *（第 25 章）*

基于代理的数据迁移和复制服务。轻量级代理通过 NFS 或 SMB 连接到本地文件服务器，将共享目录同步到 S3、EFS 或 FSx——内置调度、带宽限制和完整性验证。

关键概念：DataSync 代理（本地 VM 或 EC2）、NFS/SMB 来源、S3/EFS/FSx 目标、计划增量传输。

考试信号："通过网络将大量文件从本地 NAS 迁移或持续同步到 AWS"→ DataSync。

---

**AWS Transfer Family** *（第 25 章）*

以 S3 或 EFS 作为存储目标的完全托管 SFTP、FTPS 和 FTP 服务器。客户端使用其现有的 SFTP 软件连接；上传的文件直接落入桶或文件系统。

关键概念：托管端点（可选静态 IP）、S3 或 EFS 后端存储、与外部合作伙伴现有协议的兼容性。

考试信号："合作伙伴必须继续通过 SFTP 上传，但文件应落入 S3"→ Transfer Family。

---

**AWS Snow 系列** *（第 25 章）*

用于离线批量数据迁移的物理数据传输设备。Snowball Edge Storage Optimized：80 TB 可用容量，加固外壳，邮寄到你的所在地；你在本地装载数据后寄回，由 AWS 摄取到 S3。

关键概念：先算传输账——如果网络传输大约需要一周或更长时间，物理设备更划算。*遗留说明（2026）*：AWS 一直在逐步退役该系列——Snowmobile（2024 年）和 Snowcone（2024 年末）已下线，Snow 设备于 2025 年 11 月停止接受新客户（AWS 现在推荐 DataSync 和 Data Transfer Terminals）。SAA-C03 题库早于这一变化，因此考试仍然把 Snowball 当作正确答案。

考试信号："PB 级迁移"、"带宽有限，需要数周传输时间"→ Snow 系列。

---

**AWS Backup** *（第 18 章和第 23 章）*

跨 EBS、RDS、DynamoDB、EFS 和 Storage Gateway 的集中式、基于策略的备份服务。备份计划定义调度和保留期；保管库（vault）存储恢复点。

关键概念：备份计划和保管库、跨区域和跨账户副本、用于不可变性的 Vault Lock。

考试信号："跨多个 AWS 服务集中并自动化备份"、"用于防范勒索软件/账户被入侵的跨账户备份副本"→ AWS Backup。

---

## 数据库

**RDS — Relational Database Service** *（第 8 章）*

托管关系数据库。支持的引擎：MySQL、PostgreSQL、MariaDB、Oracle、SQL Server 以及 Aurora（AWS 的专有引擎）。AWS 处理备份、补丁、故障转移和复制。你管理模式设计、查询和实例规格选择。

关键概念：Multi-AZ 部署（自动故障转移，同步复制）、读副本（异步，用于读取扩展）、自动备份（保留 1-35 天）、手动快照（保留直到删除）、RDS Proxy（连接池）。

考试信号："关系数据库"、"ACID 事务"、"现有 SQL 工作负载"→ RDS 或 Aurora。

---

**Aurora** *（第 24 章）*

AWS 的关系数据库引擎，与 MySQL 和 PostgreSQL 兼容。分布式存储引擎，在 3 个 AZ 中保存 6 份数据副本。通常比 MySQL 快 5 倍。Aurora Serverless v2 自动扩展容量（以 ACU——Aurora 容量单位衡量），并且在受支持的引擎版本上，当没有连接保持打开时可以自动暂停到 0 ACU。

关键概念：Aurora 集群（写入实例 + 最多 15 个 Aurora 副本，统一通过一个读取端点访问）、Aurora Global Database（跨区域读副本，复制延迟 < 1 秒）、Aurora Serverless v2、ACU、自动暂停/恢复行为。

考试信号："高性能关系数据库"、"MySQL/PostgreSQL 兼容"、"全球读取"、"可变工作负载"→ Aurora。

---

**DynamoDB** *（第 9 章）*

完全托管的 NoSQL 数据库。键值和文档模型。以个位数毫秒级性能扩展到任意吞吐量。两种容量模式：按需（按请求付费）和预置（每小时按容量单位付费，带 Auto Scaling）。

关键概念：分区键（必需）、排序键（可选）、全局二级索引（GSI）、本地二级索引（LSI）、DynamoDB Streams（变更数据捕获）、DynamoDB Accelerator（DAX）——内存缓存、TTL（生存时间）、事务。

考试信号："高吞吐量基于键的访问"、"灵活模式"、"无服务器 NoSQL"→ DynamoDB。

---

**ElastiCache** *（第 10 章）*

托管的内存缓存。两种引擎：Redis（持久化、发布/订阅、Lua 脚本、数据结构）和 Memcached（纯缓存，更简单，多线程）。用于减少数据库负载，以微秒级速度提供频繁读取的数据。

关键概念：Cache-aside 模式、Write-through 模式、驱逐策略、TTL、集群模式（Redis）、带自动故障转移的 Multi-AZ。

考试信号："减少数据库负载"、"亚毫秒读取延迟"、"会话管理"、"实时排行榜"→ ElastiCache Redis。

---

**Amazon MemoryDB for Redis** *（第 10 章）*

持久的、Redis 兼容的内存主数据库。与 ElastiCache（一种可接受数据丢失的缓存）不同，MemoryDB 存储 Multi-AZ 事务日志并保证持久性。你可以将 MemoryDB 用作主数据库——而不仅仅是另一个数据库前面的缓存。

关键概念：Redis API 兼容性、Multi-AZ 事务日志（持久性保证）、内存级性能、主数据库（而非缓存层）。

考试信号："Redis 兼容且不可接受数据丢失"、"持久的内存数据库"→ MemoryDB。"Redis 用作缓存，可接受数据丢失"→ ElastiCache Redis。

---

**专用数据库** *（第 9、10 和 24 章）*

让数据形态与引擎匹配。DocumentDB：MongoDB 兼容的文档。Neptune：图数据库（关系、遍历——Gremlin/SPARQL）。Keyspaces：Cassandra 兼容的宽列。Timestream：时间序列（当前产品形态：Timestream for InfluxDB）。MemoryDB：持久的 Redis 兼容*主*数据库（对比 ElastiCache = 缓存）。QLDB（"不可变加密账本"）已于 2025 年停止服务——将其视为遗留干扰项。

考试信号："社交图谱/推荐/欺诈团伙"→ Neptune。"MongoDB"→ DocumentDB。"Cassandra"→ Keyspaces。"随时间变化的 IoT 遥测"→ Timestream。

---

**AWS DMS — Database Migration Service** *（第 8 章）*

以最小停机时间将数据库迁移到 AWS。支持全量加载（初始复制）加 CDC（变更数据捕获），在迁移过程中保持源和目标同步。在相同引擎类型之间迁移时（MySQL → MySQL、PostgreSQL → PostgreSQL），直接使用 DMS。在不同引擎类型之间迁移时（Oracle → Aurora PostgreSQL），先使用 AWS Schema Conversion Tool（SCT）转换模式，再用 DMS 迁移数据。

关键概念：复制实例、源端点和目标端点、全量加载 + CDC、用于异构迁移的 SCT（Schema Conversion Tool）。

考试信号："以最小停机时间迁移数据库"→ DMS。"Oracle 到 Aurora"或任何异构迁移 → SCT + DMS。"相同引擎，相同类型"→ 直接用 DMS。

---

## 网络

**VPC — Virtual Private Cloud** *（第 11 章）*

AWS 中的隔离网络。跨越区域中的所有 AZ。你定义 IP 地址空间（CIDR 块），创建子网（公有或私有），配置路由表，并通过安全组和 NACL 控制访问。

关键概念：公有子网（路由到 Internet Gateway）、私有子网（出站流量路由到 NAT Gateway）、Internet Gateway（与互联网之间的入站 + 出站）、NAT Gateway（仅供私有实例出站）、VPC 对等连接（连接两个 VPC）、VPC 终端节点（不经互联网连接到 AWS 服务）。

考试信号："AWS 上的私有网络"、"将资源与互联网隔离"、"控制网络流量"→ VPC。

---

**安全组和 NACL** *（第 15 章）*

安全组是实例级别的有状态防火墙——只有允许规则，返回流量自动放行。NACL（网络访问控制列表）是子网级别的无状态防火墙——需要同时配置入站和出站规则，按规则编号顺序评估。

考试信号："阻止特定 IP 访问子网"→ NACL。"控制进出实例的流量"→ 安全组。

---

**Route 53** *（第 12 章）*

AWS 的 DNS 服务和域名注册商。将互联网流量路由到 AWS 资源和外部端点。路由策略：简单、加权、基于延迟、故障转移、地理位置、地理近邻、多值应答。

关键概念：托管区域（公有和私有）、记录类型（A、AAAA、CNAME、Alias）、健康检查、Traffic Flow（可视化策略编辑器——注意，地理近邻路由也可以作为记录上的直接路由策略使用，带可调节的偏置，无需借助 Traffic Flow）。

考试信号："DNS 路由"、"区域之间的故障转移"、"基于延迟或位置路由"→ Route 53 搭配适当的路由策略。

---

**CloudFront** *（第 13 章）*

内容分发网络（CDN）。在边缘位置（全球 750 多个接入点）缓存内容。降低最终用户延迟。通过缓存降低源站传输成本。可与 S3、EC2、ALB 和 API Gateway 作为源站集成。

关键概念：分发、源站、行为（按路径路由到源站）、TTL（缓存控制）、缓存失效、签名 URL 和签名 Cookie（访问控制）、Lambda@Edge 和 CloudFront Functions（在边缘运行代码）、Origin Shield（减少源站负载）。

考试信号："全球低延迟"、"缓存静态内容"、"减少源站负载"、"配合 Shield 防御 DDoS"→ CloudFront。

---

**Direct Connect 和 VPN** *（第 25 章）*

AWS Direct Connect 是从你的本地数据中心到 AWS 的专用物理网络连接。绕过公共互联网。带宽和延迟更稳定。AWS Site-to-Site VPN 是通过公共互联网的加密隧道——设置更快，成本更低，但性能不稳定。

关键概念：虚拟接口（VIF）、Direct Connect Gateway（连接到多个区域）、Transit Gateway（中心辐射式网络拓扑）、VPN 隧道冗余。

考试信号："到 AWS 的专用私有连接"→ Direct Connect。"加密连接，设置更快"→ VPN。"连接多个 VPC"→ Transit Gateway。

---

**VPC 终端节点** *（第 30 章）*

将私有资源连接到 AWS 服务，无需使用公共互联网或 NAT Gateway。网关终端节点：免费，仅适用于 S3 和 DynamoDB。接口终端节点（PrivateLink）：按小时 + 按 GB 计费，适用于大多数 AWS 服务。

考试信号："私有子网中的 EC2 调用 S3/DynamoDB——降低 NAT Gateway 成本"→ 网关终端节点（免费）。"从私有子网到 SQS、SSM、Secrets Manager 的私有连接"→ 接口终端节点。

---

**AWS Client VPN** *（第 11 章）*

托管的 OpenVPN 端点，让单个设备（笔记本电脑、工作站）通过互联网安全地连接到 VPC。身份验证选项：Active Directory、与身份提供商的 SAML 2.0 联合，或双向 TLS（基于证书）。支持分割隧道（只有发往 VPC 的流量走隧道）和全隧道（所有流量经由 AWS 路由）。

关键概念：Client VPN 端点、目标网络（VPC 子网关联）、授权规则、分割隧道与全隧道。

考试信号："远程工程师需要从家中安全访问 VPC"、"单个设备到 VPC 的连接"→ Client VPN。对比：Site-to-Site VPN = 网络到网络。Client VPN = 设备到网络。

---

**Network Load Balancer (NLB) 和 Gateway Load Balancer (GWLB)** *（第 7 章）*

NLB 工作在第 4 层（TCP/UDP/TLS）：不做 HTTP 检查，只以极高速度路由数据包——每秒数百万请求，每个 AZ 有静态 IP，并保留源 IP。GWLB 工作在第 3 层，存在的唯一目的是：将第三方虚拟网络设备（防火墙、IDS/IPS、深度包检测）内联插入到流量路径中。

关键概念：NLB = 第 4 层、静态 IP、超低延迟、非 HTTP 协议。GWLB = 第 3 层、GENEVE 封装、单一入口背后的设备集群。ALB = 第 7 层（路径/主机路由）。

考试信号："每秒数百万 TCP 请求"、"负载均衡器需要静态 IP"、"保留源 IP"→ NLB。"将第三方安全设备插入流量路径"→ GWLB。

---

**AWS Global Accelerator** *（第 25 章）*

在最近的边缘位置将用户流量引入 AWS 的私有全球骨干网，而不是穿越公共互联网。提供两个静态 Anycast IP 地址，作为一个或多个区域中 ALB、NLB 或 EC2 实例的前端。改善*动态*（不可缓存）流量的延迟和一致性。

关键概念：静态 Anycast IP、在边缘接入 AWS 骨干网、基于健康检查的秒级区域故障转移、带流量调节旋钮（traffic dial）的端点组。

考试信号："全球用户、动态/非 HTTP 流量、静态 IP、快速区域故障转移"→ Global Accelerator。"可缓存/静态内容"→ 改用 CloudFront。

---

## 安全与身份

**IAM — Identity and Access Management** *（第 3 章和第 14 章）*

控制谁可以在你的 AWS 账户中做什么。用户（长期凭证）、组（共享权限的用户）、角色（供服务和跨账户访问使用的临时凭证）、策略（定义允许/拒绝规则的 JSON 文档）。

关键概念：主体、操作、资源、条件、明确拒绝 > 明确允许 > 隐式拒绝、SCP（AWS Organizations 中的服务控制策略）、权限边界、AssumeRole。

考试信号：IAM 涉及每个安全问题。关键模式：服务使用 IAM 角色（而不是用户）。跨账户访问使用角色代入。最小权限——只授予所需的权限。

---

**KMS — Key Management Service** *（第 16 章）*

托管的加密密钥服务。创建、存储和控制加密密钥。客户管理密钥（CMK）允许你定义轮换、使用和访问策略。AWS 管理的密钥则自动托管。

关键概念：密钥策略（独立于 IAM 策略）、信封加密（数据用数据密钥加密；数据密钥用 CMK 加密）、自动密钥轮换、多区域密钥、授权（Grants）。

考试信号："加密静态数据"、"客户管理的加密密钥"、"密钥轮换"→ KMS。

---

**Secrets Manager** *（第 16 章）*

存储并自动轮换敏感值：数据库凭证、API 密钥、OAuth 令牌。与 RDS 集成以实现自动密码轮换。应用程序在运行时通过 API 检索机密——永远不要硬编码凭证。

考试信号："存储和轮换数据库凭证"、"避免硬编码机密"→ Secrets Manager。"存储配置值，而非机密"→ Parameter Store（SSM）。

---

**AWS Shield** *（第 17 章）*

DDoS 防护。Shield Standard 自动且免费——防御常见的容量型和协议攻击。Shield Advanced 增加财务保护、24/7 DDoS 响应团队和详细的攻击可见性。

考试信号："防御 DDoS"→ Shield Standard（自动）或 Shield Advanced（企业级，带 SLA）。

---

**WAF — Web Application Firewall** *（第 17 章）*

根据规则过滤 HTTP/HTTPS 流量：IP 封锁、速率限制、SQL 注入模式、XSS 模式、地理限制、自定义规则。可附加到 CloudFront、ALB、API Gateway 或 AppSync。

考试信号："封锁特定 IP 地址"、"在边缘防止 SQL 注入"、"限制 API 调用速率"→ WAF。

---

**GuardDuty** *（第 17 章）*

威胁检测服务。使用机器学习和威胁情报分析 CloudTrail 日志、VPC Flow Logs 和 DNS 日志。检测异常的 API 活动、与已知恶意 IP 的通信、被盗用的凭证。

考试信号："检测异常活动"、"识别被盗用的 IAM 凭证"、"持续威胁监控"→ GuardDuty。

---

**Amazon Inspector** *（第 17 章）*

自动化漏洞评估服务。持续扫描 EC2 实例、Amazon ECR 容器镜像和 Lambda 函数中的软件漏洞（CVE）以及意外的网络暴露。检测结果发送到 AWS Security Hub 进行集中管理。

关键概念：CVE 扫描、持续（而非一次性）评估、覆盖 EC2 + ECR + Lambda、Security Hub 集成。

考试信号："自动扫描 EC2 的已知漏洞"、"容器镜像的 CVE 扫描"、"持续漏洞评估"→ Inspector。

---

**Amazon Cognito** *（第 14 章）*

为你的应用程序的最终用户提供托管身份验证——一个你不必自己构建的用户目录。User Pools 处理注册、登录、MFA、密码重置和社交身份提供商（Google、Facebook、任何 OIDC 提供商），颁发由你的应用程序验证的 JWT。Identity Pools 将这些令牌交换为临时 AWS 凭证。

关键概念：User Pool（身份验证，JWT）与 Identity Pool（临时 AWS 凭证）、托管 UI、社交/OIDC/SAML 联合、API Gateway Cognito 授权方。

考试信号："应用程序需要用户注册/登录"、"社交登录"、"让移动应用用户临时访问 AWS 资源"→ Cognito。对比：IAM 面向你的工程师和服务；Cognito 面向你的客户。

---

**AWS Certificate Manager (ACM)** *（第 16 章）*

为 AWS 托管服务（ALB、CloudFront、API Gateway）提供免费的公有 TLS/SSL 证书，并处理整个生命周期——无需续期日历，无需接触私钥。通过 DNS 验证自动续期。

关键概念：DNS 验证与电子邮件验证、自动续期、CloudFront 使用的证书必须位于 us-east-1、免费公有证书无法导出（2025 年起提供付费可导出选项）。

考试信号："负载均衡器或 CDN 上的 HTTPS"、"自动证书续期"→ ACM。

---

**Amazon Macie** *（第 17 章）*

面向 S3 的敏感数据发现。使用机器学习和模式匹配在桶中查找 PII（姓名、卡号、凭证），并标记公开暴露等访问风险。与 GuardDuty 互补：GuardDuty 监视行为；Macie 审计存储的内容。

关键概念：托管数据标识符（PII 模式）、仅限 S3 的范围、检测结果发送到 Security Hub/EventBridge。

考试信号："发现 S3 中的 PII"、"识别敏感数据暴露"→ Macie。

---

**AWS Control Tower** *（第 14 章）*

自动化多账户环境的搭建和治理。创建着陆区（landing zone）——预先配置好 Organizations、CloudTrail、Config 和护栏的管理、日志归档和审计账户——只需几分钟，而不是数天的手动配置。

关键概念：着陆区、护栏（预防性 = SCP，检测性 = Config 规则）、用于标准化新账户的 Account Factory。

考试信号："自动按最佳实践搭建和治理新的多账户环境"→ Control Tower。对比：Organizations 是原始构建块；Control Tower 是自动化组装。

---

## 消息传递和事件处理

**SQS — Simple Queue Service** *（第 19 章）*

托管消息队列。生产者发送消息；消费者读取并删除它们。解耦服务：发送方不需要知道接收方是否可用。Standard 队列：至少一次传递，尽力而为的顺序。FIFO 队列：恰好一次处理，严格顺序。

关键概念：可见性超时（消息在处理期间对其他消费者隐藏）、用于反复失败消息的死信队列（DLQ）、消息保留（默认 4 天，最长 14 天）、长轮询（减少空响应）、最大负载默认 256KB（自 2025 年起可提升至 1 MiB；更大的负载使用 Extended Client Library 将消息体存储在 S3 中）。

考试信号："解耦服务"、"在负载峰值期间缓冲请求"、"异步处理"→ SQS。"顺序重要且需要恰好一次"→ SQS FIFO。

---

**SNS — Simple Notification Service** *（第 19 章）*

托管的发布/订阅服务。发布者向主题发送消息；所有订阅者各收到一份副本。扇出模式：一条消息 → 多个消费者。协议：SQS、Lambda、HTTP/HTTPS、电子邮件、SMS、移动推送。

关键概念：主题、订阅、扇出模式（SNS → 多个 SQS 队列）、消息过滤（订阅者只接收匹配的消息）。

考试信号："同时向多个端点发送通知"、"将单个事件扇出到多个消费者"→ SNS。常见模式：SNS + SQS 实现持久扇出。

---

**EventBridge** *（第 22 章）*

用于构建事件驱动架构的事件总线。将来自 AWS 服务、SaaS 合作伙伴和自定义来源的事件路由到 Lambda、SQS、SNS、Step Functions 和其他目标。支持计划规则（cron）和模式匹配。

考试信号："将 AWS 服务的事件路由到目标"、"调度 Lambda 函数"、"事件驱动编排"→ EventBridge。

---

**Step Functions** *（第 22 章）*

无服务器工作流编排。将 Lambda 函数、ECS 任务、DynamoDB、SNS、SQS 和其他服务协调成可视化状态机。处理重试、错误处理、并行分支和等待状态。

关键概念：状态机、状态类型（Task、Wait、Choice、Parallel、Map、Pass、Succeed、Fail）、Standard 工作流（恰好一次，长时运行）与 Express 工作流：异步（至少一次，高量——把任务设计为幂等）和同步（至多一次，像 API 调用一样直接返回结果）。

考试信号："编排多个 Lambda 函数"、"带重试逻辑的长时运行工作流"、"人工审批步骤"→ Step Functions。

---

**Kinesis** *（第 26 章）*

实时数据流。Kinesis Data Streams：持久的、有序的记录流（像分布式提交日志）。消费者处理记录；数据保留 24 小时（默认）到 365 天（启用 Extended Data Retention）。Amazon Data Firehose（前身为 Kinesis Data Firehose）：到 S3、Redshift、OpenSearch、Splunk 的完全托管传递——无需管理消费者。

关键概念：分片（吞吐量单位：1MB/s 写，2MB/s 读）、分区键（决定分片分配）、序列号、检查点（KCL 或 Lambda）、Firehose 与 Streams 的对比。

考试信号："实时流"、"有序记录"、"重播事件"→ Kinesis Data Streams。"将流数据传递到 S3/Redshift，无需管理消费者"→ Amazon Data Firehose（较旧的题目可能写作"Kinesis Data Firehose"）。"对流数据执行 SQL"→ Amazon Managed Service for Apache Flink（前身为 Kinesis Data Analytics）。与 SQS 对比：Kinesis 保留并可重播；SQS 在消费时删除。

---

**Amazon MQ** *（第 19 章）*

支持 Apache ActiveMQ 和 RabbitMQ 的托管消息代理服务。支持行业标准消息协议：AMQP、STOMP、MQTT、OpenWire 和 WebSocket。主要使用场景是本地消息代理工作负载的直接迁移——已经使用 ActiveMQ 或 RabbitMQ 的应用程序可以在不修改代码的情况下接入。

关键概念：ActiveMQ 与 RabbitMQ 引擎选择、协议支持（AMQP/STOMP/MQTT）、单实例或主备（active/standby）代理配置以实现高可用。

考试信号："将本地 ActiveMQ 或 RabbitMQ 迁移到 AWS 且不修改应用程序代码"→ Amazon MQ。"全新的 AWS 原生消息传递"→ SQS 或 SNS（更简单、更可扩展）。

---

## 分析

**Athena** *（第 26 章）*

对存储在 S3 中的数据进行无服务器 SQL 查询。无需管理基础设施。按查询付费（按扫描的 TB 计算）。最适合列式格式（Parquet、ORC）和分区数据。

考试信号："使用 SQL 查询 S3 数据"、"对数据湖进行临时分析"、"无需基础设施管理"→ Athena。

---

**Glue** *（第 26 章）*

无服务器 ETL（提取、转换、加载）服务。Glue 爬虫发现数据并更新 Glue Data Catalog。Glue 作业运行 Spark 或 Python 转换。Data Catalog 与 Athena、Redshift Spectrum 和 EMR 集成。

考试信号："为分析转换和加载数据"、"发现 S3 数据的模式"、"ETL 流水线"→ Glue。

---

**Amazon QuickSight** *（第 26 章）*

托管的商业智能和数据可视化服务。使用 SPICE（Super-fast, Parallel, In-memory Calculation Engine），一个缓存导入数据以快速渲染仪表板的内存引擎。连接到 Athena、S3、Redshift、RDS 和其他 AWS 数据源。无需管理 BI 服务器。

关键概念：SPICE（内存引擎）、数据集、分析、仪表板、ML Insights（异常检测、预测）、行级和列级安全。

考试信号："在 AWS 上构建 BI 仪表板且无需管理服务器"、"可视化来自 Athena 或 Redshift 的数据"→ QuickSight。

---

**AWS Lake Formation** *（第 26 章）*

构建在 S3 和 Glue Data Catalog 之上的集中式数据湖访问控制层。提供表、列和行级别的细粒度权限——比单独的 S3 桶策略更精细。简化安全数据湖的搭建：Lake Formation 负责权限模型；Glue 负责目录；S3 保存数据。

关键概念：数据湖权限（表/列/行级别）、Glue Data Catalog 集成、用于基于属性访问控制的 LF 标签、对 Athena 和 Redshift Spectrum 查询的集中授予/撤销。

考试信号："数据湖上的细粒度访问控制"、"S3 数据的列级或行级安全"→ Lake Formation。

---

## 高可用性和灾难恢复

**Multi-AZ 和 Multi-Region** *（第 18 章）*

Multi-AZ：区域内的同步复制，实现自动故障转移（RDS Multi-AZ、跨 AZ 的负载均衡器）。RPO 约为 0，RDS 的 RTO 约为 60 秒。Multi-Region：异步复制，实现地理冗余并为全球用户降低延迟。

关键概念：RTO（恢复时间目标——恢复需要多长时间）、RPO（恢复点目标——可以丢失多少数据）。Pilot Light、Warm Standby、Active-Active 灾难恢复策略。

考试信号：区分 AZ 级故障（由 Multi-AZ 处理）与区域级故障（由 Multi-Region 处理）。Multi-Region 的成本和复杂性显著增加。

---

**AWS Elastic Disaster Recovery (DRS)** *（第 18 章）*

面向服务器（本地或 EC2）的托管灾难恢复。将源服务器逐块持续复制到低成本暂存区，需要时在几分钟内启动完整的恢复实例——一个托管的 pilot light：以接近备份恢复的价格获得接近 warm standby 的恢复时间。

关键概念：持续块级复制、低成本暂存区、按需启动恢复、时间点恢复。

考试信号："用托管 DR 服务最小化基于服务器的工作负载的停机时间和数据丢失"、"不用自己搭建的 pilot light"→ DRS。

---

## 成本优化

**EC2 定价模式** *（第 27 章）*

按需：全价，无承诺。预留实例（1 年或 3 年）：对特定实例类型享受 30-72% 折扣。Savings Plans（Compute 或 EC2 Instance）：承诺每小时支出以换取灵活性。竞价实例：可中断工作负载享受 60-90% 折扣。

考试信号："最大限度降低可预测工作负载的成本"→ Savings Plans 或预留实例。"容错的批量处理"→ 竞价实例。"不可预测或短期"→ 按需。

---

**数据传输定价** *（第 30 章）*

进入 AWS：免费。同一 AZ 内：免费。跨 AZ：每个方向 $0.01/GB。跨区域：$0.02-0.08/GB。互联网（出站）：约 $0.09/GB。NAT Gateway 处理：$0.045/GB。CloudFront 的数据传输比 EC2 直接到互联网更便宜，且缓存能减少总量。

考试信号："降低从私有子网访问 S3/DynamoDB 的数据传输成本"→ 网关终端节点（免费）。"降低其他服务的 NAT Gateway 成本"→ 接口终端节点。

---

## 可观测性

**CloudWatch** *（全书引用）*

监控和可观测性。CloudWatch Metrics：来自 AWS 服务和自定义应用程序的数字时间序列数据。CloudWatch Logs：收集、搜索和分析日志数据。CloudWatch Alarms：根据指标阈值触发通知或自动扩展。CloudWatch Dashboards：可视化指标。

关键概念：指标维度、保留期、日志组和日志流、指标过滤器、CloudWatch Agent（用于来自 EC2 的操作系统级指标和日志）、Container Insights。

---

**CloudTrail** *（全书引用）*

记录你 AWS 账户中发出的每个 API 调用：谁发出的，从哪里，什么时候，响应是什么。多区域跟踪将日志无限期存储在 S3 中。用于安全审计、合规和事故调查。

考试信号："谁删除了那个资源？""审计所有 API 活动"→ CloudTrail。

---

**X-Ray** *（第 20 章）*

分布式追踪：跟踪单个请求在各服务之间的流转（trace → segment → subsegment），构建带每一跳延迟和错误率的服务地图。采样使开销保持在低水平；注解（annotations）让追踪可搜索。在 Lambda 和 API Gateway 阶段上开启主动追踪（active tracing）。

考试信号："跨微服务追踪请求"、"找到服务之间的瓶颈"→ X-Ray（不是 CloudWatch，也不是 CloudTrail）。

---

**AWS Config** *（第 31 章中引用）*

随时间追踪资源配置变更。根据合规规则评估资源。记录每个资源每次配置变更的历史。与 Systems Manager 集成以进行修复。

考试信号："这个资源是否符合我们的安全策略？""这个资源上周的配置是什么样的？"→ AWS Config。

---

## Well-Architected

**六大支柱** *（第 31 章）*

| 支柱 | 核心问题 | 关键服务 |
|------|---------|---------|
| 运营卓越 | 我们运营得好吗？ | CloudWatch、CloudTrail、SSM、Config |
| 安全 | 我们受到保护吗？ | IAM、KMS、GuardDuty、WAF、Shield、Secrets Manager |
| 可靠性 | 我们能从故障中恢复吗？ | Multi-AZ、Route 53 故障转移、备份/恢复、SQS |
| 性能效率 | 我们使用了正确的资源吗？ | 正确调整规格、Auto Scaling、CloudFront、Kinesis |
| 成本优化 | 我们花钱花得明智吗？ | Savings Plans、竞价实例、S3 生命周期、VPC 终端节点 |
| 可持续性 | 我们在最大限度减少环境影响吗？ | 正确调整规格、Graviton、高效存储层 |

AWS Well-Architected Tool：根据六大支柱评估你的架构。在考试前使用它来理解每个支柱问题背后的推理。
