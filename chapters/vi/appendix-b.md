# Phụ Lục B: Bản Đồ Phạm Vi SAA-C03

Kỳ thi AWS Solutions Architect Associate (SAA-C03) được tổ chức thành bốn phạm vi (domain). Phụ lục này ánh xạ mọi chương trong sách đến phạm vi và task liên quan, để bạn có thể học theo khu vực kỳ thi thay vì theo thứ tự chương.

---

## Tổng Quan Phạm Vi

| Phạm vi                                          | Trọng số | Mô tả                                                  |
|-------------------------------------------------|----------|--------------------------------------------------------|
| Domain 1: Design Secure Architectures           | 30%      | IAM, bảo mật mạng, bảo vệ dữ liệu                      |
| Domain 2: Design Resilient Architectures        | 26%      | Tính khả dụng cao, chịu lỗi, khôi phục sau thảm họa    |
| Domain 3: Design High-Performing Architectures  | 24%      | Hiệu suất tính toán, lưu trữ, cơ sở dữ liệu, mạng      |
| Domain 4: Design Cost-Optimized Architectures   | 20%      | Mô hình định giá, quản lý chi phí, tối ưu hóa tài nguyên |

---

## Domain 1: Design Secure Architectures (30%)

**Task 1.1 — Thiết kế truy cập an toàn đến tài nguyên AWS**

Khái niệm cốt lõi: IAM user, group, role, policy. Nguyên tắc đặc quyền tối thiểu. Truy cập cross-account. Service role. SCP (Service Control Policies) trong AWS Organizations.

| Chương     | Chủ đề                                                                        |
|------------|------------------------------------------------------------------------------|
| Chương 3   | Nền tảng IAM: user, group, role, policy, đánh giá policy                      |
| Chương 14  | IAM nâng cao: role cho dịch vụ, permission boundary, role cross-account       |
| Chương 3   | Logic đánh giá policy: explicit deny > explicit allow > implicit deny         |
| Chương 14  | AWS Organizations, SCP, Control Tower, Account Factory                        |
| Chương 14  | Cognito: User Pool (đăng nhập ứng dụng, JWT) và Identity Pool (thông tin xác thực AWS tạm thời) |

Các mẫu kỳ thi chính:

- "EC2 cần truy cập S3 mà không có thông tin xác thực hardcode" → IAM role với S3 policy gắn vào instance profile của EC2
- "Các tài khoản khác nhau cần chia sẻ tài nguyên" → IAM role với trust policy cross-account
- "Ngăn tất cả IAM user trong một OU truy cập một dịch vụ" → SCP trong AWS Organizations

---

**Task 1.2 — Thiết kế khối lượng công việc và ứng dụng an toàn**

Khái niệm cốt lõi: Thiết kế VPC, security group vs. NACL, cô lập mạng, bảo vệ DDoS, WAF, GuardDuty.

| Chương     | Chủ đề                                                                                      |
|------------|--------------------------------------------------------------------------------------------|
| Chương 11  | Thiết kế VPC: subnet công khai/riêng tư, NAT Gateway, Internet Gateway, route table         |
| Chương 15  | Security group (có trạng thái, cấp instance) vs. NACL (không trạng thái, cấp subnet)        |
| Chương 17  | Shield (DDoS), WAF (tường lửa ứng dụng), GuardDuty (phát hiện mối đe dọa), Inspector (quét CVE) |
| Chương 17  | Macie: khám phá dữ liệu nhạy cảm trong S3 (PII, thông tin xác thực)                         |
| Chương 25  | Direct Connect, VPN, Transit Gateway, PrivateLink                                           |

Các mẫu kỳ thi chính:

- "Chặn một IP cụ thể khỏi subnet" → quy tắc deny NACL
- "Cho phép HTTP vào, tự động cho phép phản hồi HTTP ra" → Security group (có trạng thái)
- "Bảo vệ ứng dụng web khỏi SQL injection" → WAF với quy tắc SQL injection
- "Phát hiện thông tin xác thực IAM bị xâm phạm" → GuardDuty

---

**Task 1.3 — Xác định các kiểm soát bảo mật dữ liệu phù hợp**

Khái niệm cốt lõi: Mã hóa khi nghỉ và khi truyền, KMS, Secrets Manager, Parameter Store, mã hóa phía máy chủ của S3.

| Chương     | Chủ đề                                                                    |
|------------|--------------------------------------------------------------------------|
| Chương 16  | KMS: customer-managed key, rotation khóa, envelope encryption             |
| Chương 16  | Secrets Manager: tự động rotation thông tin xác thực, truy xuất secret tại thời gian chạy |
| Chương 16  | ACM (AWS Certificate Manager): chứng chỉ SSL/TLS cho ALB, CloudFront      |
| Chương 5   | Các tùy chọn mã hóa S3: SSE-S3, SSE-KMS, SSE-C                            |
| Chương 8   | Mã hóa RDS khi nghỉ (phải bật khi tạo)                                    |

Các mẫu kỳ thi chính:

- "Tự động rotation thông tin xác thực cơ sở dữ liệu" → Secrets Manager với tích hợp RDS
- "Kiểm soát ai có thể dùng khóa mã hóa trên các tài khoản" → KMS key policy
- "Lưu trữ giá trị cấu hình không phải secret" → SSM Parameter Store (không phải Secrets Manager)
- "Mã hóa object S3 với khóa do công ty quản lý" → SSE-KMS với CMK

---

## Domain 2: Design Resilient Architectures (26%)

**Task 2.1 — Thiết kế kiến trúc mở rộng và liên kết lỏng lẻo**

Khái niệm cốt lõi: Auto Scaling, load balancer, tách rời SQS/SNS, trigger sự kiện Lambda, ECS/EKS, Step Functions.

| Chương     | Chủ đề                                                              |
|------------|--------------------------------------------------------------------|
| Chương 7   | Auto Scaling Group, Application Load Balancer, scaling policy       |
| Chương 19  | SQS (tách rời với hàng đợi), SNS (thông báo fan-out)               |
| Chương 20  | Lambda: tính toán serverless, trigger sự kiện, concurrency          |
| Chương 20  | API Gateway: REST/HTTP/WebSocket API được quản lý, độc lập hoặc + Lambda |
| Chương 21  | ECS và EKS: microservice containerized                             |
| Chương 22  | Step Functions: điều phối quy trình làm việc                       |
| Chương 26  | Kinesis: streaming dữ liệu thời gian thực                          |

Các mẫu kỳ thi chính:

- "Tách rời xử lý đơn hàng khỏi cập nhật tồn kho" → SQS queue giữa các dịch vụ
- "Thông báo cho nhiều dịch vụ khi một đơn hàng mới được đặt" → SNS topic với subscription SQS (fan-out)
- "Xử lý tải lên S3 tự động" → thông báo sự kiện S3 → Lambda
- "Chạy một quy trình làm việc nhiều bước với logic retry" → Step Functions

---

**Task 2.2 — Thiết kế kiến trúc khả dụng cao và/hoặc chịu lỗi**

Khái niệm cốt lõi: Multi-AZ, Multi-Region, Route 53 failover, RDS read replica, Aurora Global Database, backup và restore.

| Chương     | Chủ đề                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| Chương 2   | Cơ sở hạ tầng toàn cầu AWS: Region, AZ, edge location                                         |
| Chương 7   | ALB trên nhiều AZ, ASG thay thế các instance không lành mạnh                                  |
| Chương 8   | RDS Multi-AZ: sao chép đồng bộ, failover tự động                                              |
| Chương 12  | Route 53: failover routing, latency routing, health check                                     |
| Chương 18  | Multi-AZ vs. Multi-Region: RTO/RPO, chiến lược DR (pilot light, warm standby, active-active) |
| Chương 18  | AWS Backup (sao lưu tập trung, cross-account), Elastic Disaster Recovery (pilot light được quản lý) |
| Chương 24  | Aurora Global Database: read replica cross-region, độ trễ sao chép < 1 giây                  |

Các mẫu kỳ thi chính:

- "Tự động failover nếu RDS chính lỗi" → RDS Multi-AZ (không phải Read Replica)
- "Phục vụ lượng đọc toàn cầu với độ trễ thấp" → Aurora Global Database
- "Định tuyến lưu lượng đến region thứ hai nếu chính không khả dụng" → Route 53 với Failover routing + health check
- "RTO 1 phút, RPO 0" → Multi-AZ deployment (không phải Multi-Region)
- "RTO 15 phút, cross-region" → chiến lược Pilot Light

---

## Domain 3: Design High-Performing Architectures (24%)

**Task 3.1 — Xác định giải pháp lưu trữ hiệu suất cao và/hoặc mở rộng**

Khái niệm cốt lõi: S3 vs. EBS vs. EFS, lựa chọn storage class, S3 Transfer Acceleration, multipart upload, CloudFront cho asset.

| Chương     | Chủ đề                                                                   |
|------------|-------------------------------------------------------------------------|
| Chương 5   | S3: object storage, storage class, versioning, lifecycle                 |
| Chương 6   | EBS: các loại block storage (gp3, io2, st1), EFS: lưu trữ tệp chia sẻ    |
| Chương 6   | Storage Gateway: cầu nối lai từ tại chỗ đến S3 (File, Volume, Tape)      |
| Chương 23  | Chuyển đổi storage class S3, các tùy chọn truy xuất Glacier              |
| Chương 25  | DataSync (đồng bộ tệp trực tuyến), Transfer Family (SFTP→S3 được quản lý), Snow Family (chuyển khối lượng lớn ngoại tuyến — di sản: đóng cửa với khách hàng mới vào tháng 11 năm 2025; AWS hiện trỏ đến DataSync và Data Transfer Terminals), MGN (rehost máy chủ) |
| Chương 28  | Right-sizing EBS, di chuyển gp2→gp3, quản lý snapshot                    |

Các mẫu kỳ thi chính:

- "Hệ thống tệp chia sẻ có thể truy cập từ nhiều instance EC2" → EFS (không phải EBS; EBS gắn vào một instance)
- "IOPS cao cho khối lượng công việc cơ sở dữ liệu" → io2 EBS
- "Giảm chi phí cho tệp không được truy cập trong 90 ngày" → S3 lifecycle policy → Glacier
- "Tải lên tệp lớn từ các vị trí xa nhanh hơn" → S3 Transfer Acceleration
- "Hàng tuần chuyển qua băng thông hạn chế" → kỳ thi SAA-C03 vẫn kỳ vọng Snowball, dù họ Snow đóng cửa với khách hàng mới năm 2025

---

**Task 3.2 — Xác định giải pháp tính toán hiệu suất cao và/hoặc mở rộng**

Khái niệm cốt lõi: Các họ instance EC2, bộ xử lý Graviton, Auto Scaling, Lambda, Fargate, Spot Instances.

| Chương     | Chủ đề                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Chương 4   | Loại instance EC2: tối ưu tính toán (c), tối ưu bộ nhớ (r), mục đích chung (m, t)        |
| Chương 7   | Auto Scaling: mở rộng ngang cho tầng web                                                |
| Chương 20  | Lambda: concurrency, provisioned concurrency (cho độ trễ nhất quán)                     |
| Chương 21  | ECS Fargate: container serverless                                                       |
| Chương 21  | AWS Batch: tính toán batch được quản lý cho Docker container, hỗ trợ Spot              |
| Chương 27  | Spot Instances cho khối lượng công việc batch chịu lỗi                                  |

Các mẫu kỳ thi chính:

- "Khối lượng công việc huấn luyện ML, giảm chi phí, có thể gián đoạn" → Spot Instances
- "Phản hồi Lambda nhất quán dưới 100ms" → Provisioned concurrency (loại bỏ cold start)
- "Microservice containerized, không quản lý cơ sở hạ tầng" → ECS Fargate

---

**Task 3.3 — Xác định giải pháp cơ sở dữ liệu hiệu suất cao**

Khái niệm cốt lõi: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, mẫu truy cập, read replica, DAX.

| Chương     | Chủ đề                                                              |
|------------|--------------------------------------------------------------------|
| Chương 8   | RDS: cơ sở dữ liệu quan hệ được quản lý, khi nào dùng RDBMS         |
| Chương 9   | DynamoDB: NoSQL, partition key, GSI, DAX (cache trong bộ nhớ)       |
| Chương 10  | ElastiCache: Redis vs. Memcached, chiến lược cache                  |
| Chương 10  | MemoryDB for Redis: cơ sở dữ liệu chính tương thích Redis bền vững  |
| Chương 24  | Aurora: hiệu suất, Serverless v2, read replica, Global Database     |
| Chương 29  | DynamoDB on-demand vs. provisioned capacity với Auto Scaling        |

Các mẫu kỳ thi chính:

- "Đọc micro giây cho một session store" → ElastiCache Redis hoặc DAX (nếu backend DynamoDB)
- "Truy cập key-value thông lượng cao với schema linh hoạt" → DynamoDB
- "Join phức tạp và giao dịch ACID" → Aurora hoặc RDS
- "Phân tích trên petabyte dữ liệu có cấu trúc" → Redshift (không được đề cập chi tiết nhưng tín hiệu: "data warehouse" → Redshift)

---

**Task 3.4 — Xác định kiến trúc mạng hiệu suất cao và/hoặc mở rộng**

Khái niệm cốt lõi: CloudFront, Global Accelerator, Direct Connect, VPN, placement group, enhanced networking.

| Chương     | Chủ đề                                                              |
|------------|--------------------------------------------------------------------|
| Chương 7   | NLB (Layer 4) và GWLB (Gateway Load Balancer cho thiết bị mạng)     |
| Chương 11  | Client VPN: truy cập được mã hóa từ thiết bị cá nhân đến VPC        |
| Chương 12  | Route 53: chính sách định tuyến: latency-based, geolocation, weighted |
| Chương 13  | CloudFront: CDN, edge caching, Lambda@Edge                         |
| Chương 25  | AWS Global Accelerator: định tuyến Anycast vào backbone AWS         |
| Chương 25  | Direct Connect: kết nối riêng tư chuyên dụng                       |
| Chương 30  | VPC Endpoints: kết nối riêng tư đến dịch vụ AWS                    |

Các mẫu kỳ thi chính:

- "Giảm độ trễ cho người dùng toàn cầu truy cập phản hồi API động" → Global Accelerator (không phải CloudFront, tốt nhất cho nội dung có thể cache)
- "Giảm độ trễ cho asset tĩnh trên toàn cầu" → CloudFront
- "Kết nối riêng tư nhất quán đến AWS từ tại chỗ" → Direct Connect
- "Tải lên nhanh từ khách hàng toàn cầu đến bucket S3 của bạn" → S3 Transfer Acceleration

---

**Task 3.5 — Xác định giải pháp nhập và biến đổi dữ liệu hiệu suất cao**

Khái niệm cốt lõi: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Chương     | Chủ đề                                                               |
|------------|---------------------------------------------------------------------|
| Chương 26  | Kinesis Data Streams: xử lý sự kiện có thứ tự thời gian thực         |
| Chương 26  | Amazon Data Firehose (cựu Kinesis Data Firehose): giao được quản lý đến S3, Redshift, OpenSearch |
| Chương 26  | AWS Glue: ETL serverless, Data Catalog, Crawler                     |
| Chương 26  | Athena: SQL serverless trên S3                                      |
| Chương 26  | QuickSight: dashboard BI được quản lý, engine trong bộ nhớ SPICE     |
| Chương 26  | Lake Formation: kiểm soát truy cập data lake chi tiết               |

Các mẫu kỳ thi chính:

- "Xử lý dữ liệu click-stream theo thời gian thực" → Kinesis Data Streams + Lambda hoặc Managed Service for Apache Flink (trước đây là Kinesis Data Analytics)
- "Giao dữ liệu streaming đến S3 để phân tích sau" → Amazon Data Firehose
- "Biến đổi và lập catalog dữ liệu từ nhiều nguồn" → AWS Glue
- "Truy vấn dữ liệu lịch sử lưu trong S3 với SQL" → Athena

---

## Domain 4: Design Cost-Optimized Architectures (20%)

**Task 4.1 — Thiết kế giải pháp lưu trữ tối ưu chi phí**

| Chương     | Chủ đề                                                              |
|------------|--------------------------------------------------------------------|
| Chương 23  | S3 lifecycle policy, chuyển đổi storage class                       |
| Chương 28  | Right-sizing EBS, di chuyển gp2→gp3, quy tắc lifecycle versioning S3 |
| Chương 28  | EFS Intelligent-Tiering, cost allocation tag, AWS Budgets           |

Các mẫu kỳ thi chính:

- "Xác định nhóm nào đang tạo ra chi phí S3 nhiều nhất" → Cost allocation tag + Cost Explorer
- "Giảm chi phí cho object hiếm khi được truy cập tự động" → S3 Intelligent-Tiering
- "Cảnh báo khi chi phí hàng tháng vượt $10,000" → AWS Budgets

---

**Task 4.2 — Thiết kế giải pháp tính toán tối ưu chi phí**

| Chương     | Chủ đề                                                                            |
|------------|----------------------------------------------------------------------------------|
| Chương 2   | Outposts: rack AWS tại chỗ (đánh đổi chi phí vốn vs. opex cloud)                  |
| Chương 2   | Wavelength: tính toán biên 5G (hợp tác viễn thông, đặt theo độ trễ)               |
| Chương 27  | Định giá EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Chương 20  | Lambda: trả theo lần gọi (chi phí nhàn rỗi bằng không)                            |

Các mẫu kỳ thi chính:

- "Giảm chi phí cho khối lượng công việc sản xuất ổn định" → Savings Plans (linh hoạt hơn) hoặc Reserved Instances
- "Giảm thiểu chi phí cho job batch có thể gián đoạn" → Spot Instances
- "Xử lý hướng sự kiện với chi phí nhàn rỗi bằng không" → Lambda

---

**Task 4.3 — Thiết kế giải pháp cơ sở dữ liệu tối ưu chi phí**

| Chương     | Chủ đề                                             |
|------------|---------------------------------------------------|
| Chương 29  | DynamoDB on-demand vs. provisioned + Auto Scaling |
| Chương 29  | RDS và ElastiCache Reserved Instances/Node        |
| Chương 29  | Quản lý snapshot RDS                               |

Các mẫu kỳ thi chính:

- "Lưu lượng DynamoDB không dự đoán được" → chế độ on-demand capacity
- "Lưu lượng DynamoDB nhất quán với đỉnh đã biết" → Provisioned + Auto Scaling
- "Giảm chi phí RDS cho khối lượng công việc ổn định" → Reserved Instances (1 hoặc 3 năm)

---

**Task 4.4 — Thiết kế kiến trúc mạng tối ưu chi phí**

| Chương     | Chủ đề                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| Chương 30  | Định giá chuyển dữ liệu: vào (miễn phí), cross-AZ ($0.01/GB), cross-region, internet ($0.09/GB) |
| Chương 30  | NAT Gateway ($0.045/GB) vs. VPC Endpoints (Gateway: miễn phí; Interface: tính phí)             |
| Chương 30  | CloudFront như công cụ tối ưu chi phí chuyển dữ liệu                                            |

Các mẫu kỳ thi chính:

- "EC2 trong subnet riêng tư gọi S3 — loại bỏ chi phí NAT Gateway" → S3 Gateway Endpoint (miễn phí)
- "EC2 trong subnet riêng tư gọi SQS — giảm chi phí NAT Gateway" → SQS Interface Endpoint
- "Giảm chi phí chuyển dữ liệu cho giao nội dung toàn cầu" → CloudFront (caching giảm yêu cầu origin)

---

## Các Chủ Đề Liên Phạm Vi

Một số chủ đề xuất hiện trên nhiều phạm vi:

| Chủ đề                               | Phạm vi | Chương       |
|--------------------------------------|---------|--------------|
| Well-Architected Framework           | Tất cả  | 31           |
| Đánh giá kiến trúc và ADR            | Tất cả  | 32           |
| Lý luận đánh đổi ("còn tùy")         | Tất cả  | 33           |
| Thiết kế Multi-AZ                    | 2, 3    | 7, 8, 18, 24 |
| Giám sát và khả năng quan sát        | 1, 2    | Xuyên suốt   |
| CloudFront                           | 3, 4    | 13, 30       |

---

## Danh Sách Kiểm Tra Trước Kỳ Thi

Trước khi dự thi SAA-C03:

**Khu vực trọng số cao (nhiều khả năng xuất hiện nhất)**

- [ ] Logic đánh giá policy IAM (explicit deny → explicit allow → implicit deny)
- [ ] Các thành phần VPC: subnet, route table, IGW, NAT Gateway, security group, NACL
- [ ] Storage class S3 và khi nào dùng mỗi loại
- [ ] RDS Multi-AZ vs. Read Replica (failover vs. mở rộng đọc)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. định tuyến sự kiện)
- [ ] Mô hình định giá EC2: Spot cho chịu lỗi, Savings Plans cho khối lượng công việc cam kết
- [ ] Trigger và concurrency Lambda
- [ ] DynamoDB vs. Aurora vs. Redshift (mẫu truy cập quyết định lựa chọn)
- [ ] CloudFront: CDN cho tĩnh, Global Accelerator cho động

**Cạm bẫy phổ biến**

- [ ] EBS gắn vào MỘT instance; EFS được chia sẻ
- [ ] RDS Read Replica dành cho mở rộng đọc, KHÔNG phải failover tự động (đó là Multi-AZ)
- [ ] NACL không trạng thái (cần cả quy tắc vào và ra)
- [ ] Gateway Endpoint miễn phí và chỉ cho S3 và DynamoDB
- [ ] Kinesis lưu giữ và phát lại; SQS xóa khi tiêu thụ
- [ ] "Tách rời" không phải lúc nào cũng có nghĩa SQS — SNS fan-out và EventBridge cũng là các mẫu tách rời
- [ ] Shield Standard miễn phí và tự động; Advanced là thuê bao trả phí
- [ ] ElastiCache vs. MemoryDB: ElastiCache = cache (mất dữ liệu OK). MemoryDB = cơ sở dữ liệu chính bền vững.
- [ ] Client VPN vs. Site-to-Site VPN: Client VPN = thiết bị cá nhân. Site-to-Site = mạng-đến-mạng.
- [ ] Outposts vs. Wavelength: Outposts = rack AWS tại chỗ. Wavelength = biên 5G.
- [ ] DMS: đồng thể = DMS trực tiếp. Dị thể = SCT trước, rồi DMS.
- [ ] DataSync di chuyển *tệp*; DMS di chuyển *cơ sở dữ liệu*; MGN di chuyển *toàn bộ máy chủ*.

**Cấu trúc kỳ thi**

- 65 câu hỏi, 130 phút (2 giờ 10 phút)
- Trắc nghiệm (một đáp án đúng) và đa lựa chọn (chọn N đáp án đúng)
- Điểm đậu: 720 trên 1000
- Câu hỏi không tính điểm được nhúng; bạn không thể biết câu nào
- Quản lý thời gian: ~2 phút mỗi câu; đánh dấu câu khó và quay lại
