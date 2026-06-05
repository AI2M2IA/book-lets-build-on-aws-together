# Phụ Lục B: Bản Đồ Domain SAA-C03

Kỳ thi AWS Solutions Architect Associate (SAA-C03) được tổ chức thành bốn domain. Phụ lục này ánh xạ mọi chương trong quyển sách đến domain và task liên quan, để bạn có thể học theo lĩnh vực kỳ thi thay vì theo thứ tự chương.

---

## Tổng Quan Domain

| Domain                                              | Trọng Số | Mô Tả                                                    |
|-----------------------------------------------------|----------|----------------------------------------------------------|
| Domain 1: Thiết Kế Kiến Trúc Bảo Mật               | 30%      | IAM, bảo mật mạng, bảo vệ dữ liệu                       |
| Domain 2: Thiết Kế Kiến Trúc Có Khả Năng Phục Hồi  | 26%      | Khả dụng cao, chịu lỗi, disaster recovery                |
| Domain 3: Thiết Kế Kiến Trúc Hiệu Suất Cao         | 24%      | Hiệu suất tính toán, lưu trữ, cơ sở dữ liệu, mạng       |
| Domain 4: Thiết Kế Kiến Trúc Tối Ưu Chi Phí        | 20%      | Mô hình giá, quản lý chi phí, tối ưu hóa tài nguyên     |

---

## Domain 1: Thiết Kế Kiến Trúc Bảo Mật (30%)

**Task 1.1 — Thiết kế quyền truy cập an toàn vào tài nguyên AWS**

Các khái niệm cốt lõi: IAM user, group, role, policy. Nguyên tắc đặc quyền tối thiểu. Truy cập cross-account. Service role. SCP (Service Control Policy trong AWS Organizations).

| Chương    | Chủ Đề                                                                                            |
|-----------|---------------------------------------------------------------------------------------------------|
| Chương 3  | Cơ bản IAM: user, group, role, policy, logic đánh giá policy                                     |
| Chương 14 | IAM nâng cao: role cho dịch vụ, permission boundary, role cross-account                           |
| Chương 3  | Logic đánh giá policy: explicit deny > explicit allow > implicit deny                             |
| Chương 14 | AWS Organizations và SCP                                                                          |

Mẫu kỳ thi chính:

- "EC2 cần truy cập S3 mà không có thông tin xác thực được hardcode" → IAM role với policy S3 gắn vào EC2 instance profile
- "Các tài khoản khác nhau cần chia sẻ tài nguyên" → IAM role với cross-account trust policy
- "Ngăn tất cả IAM user trong một OU truy cập một dịch vụ" → SCP trong AWS Organizations

---

**Task 1.2 — Thiết kế khối lượng công việc và ứng dụng bảo mật**

Các khái niệm cốt lõi: Thiết kế VPC, security group vs. NACL, cô lập mạng, bảo vệ DDoS, WAF, GuardDuty.

| Chương    | Chủ Đề                                                                                                   |
|-----------|----------------------------------------------------------------------------------------------------------|
| Chương 11 | Thiết kế VPC: public/private subnet, NAT Gateway, Internet Gateway, bảng định tuyến                     |
| Chương 15 | Security group (stateful, cấp instance) vs. NACL (stateless, cấp subnet)                                |
| Chương 17 | Shield (bảo vệ DDoS), WAF (tường lửa ứng dụng), GuardDuty (phát hiện mối đe dọa)                       |
| Chương 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                                        |

Mẫu kỳ thi chính:

- "Chặn một IP cụ thể khỏi subnet" → Quy tắc deny NACL
- "Cho phép HTTP vào, tự động cho phép HTTP phản hồi ra" → Security group (stateful)
- "Bảo vệ ứng dụng web khỏi SQL injection" → WAF với quy tắc SQL injection
- "Phát hiện thông tin xác thực IAM bị xâm phạm" → GuardDuty

---

**Task 1.3 — Xác định kiểm soát bảo mật dữ liệu phù hợp**

Các khái niệm cốt lõi: Mã hóa tại chỗ và trong khi truyền, KMS, Secrets Manager, Parameter Store, mã hóa server-side S3.

| Chương    | Chủ Đề                                                                         |
|-----------|--------------------------------------------------------------------------------|
| Chương 16 | KMS: customer-managed key, xoay vòng khóa, envelope encryption                |
| Chương 16 | Secrets Manager: xoay vòng thông tin xác thực tự động, truy xuất bí mật runtime |
| Chương 5  | Tùy chọn mã hóa S3: SSE-S3, SSE-KMS, SSE-C                                    |
| Chương 8  | Mã hóa RDS tại chỗ (phải được bật khi tạo)                                    |

Mẫu kỳ thi chính:

- "Xoay vòng thông tin xác thực cơ sở dữ liệu tự động" → Secrets Manager với tích hợp RDS
- "Kiểm soát ai có thể sử dụng khóa mã hóa trên các tài khoản" → KMS key policy
- "Lưu trữ giá trị cấu hình không phải bí mật" → SSM Parameter Store (không phải Secrets Manager)
- "Mã hóa S3 object với khóa do công ty quản lý" → SSE-KMS với CMK

---

## Domain 2: Thiết Kế Kiến Trúc Có Khả Năng Phục Hồi (26%)

**Task 2.1 — Thiết kế kiến trúc có thể mở rộng và được ghép nối lỏng lẻo**

Các khái niệm cốt lõi: Auto Scaling, load balancer, tách rời SQS/SNS, Lambda event trigger, ECS/EKS, Step Functions.

| Chương    | Chủ Đề                                                                          |
|-----------|---------------------------------------------------------------------------------|
| Chương 7  | Auto Scaling Groups, Application Load Balancer, scaling policy                  |
| Chương 19 | SQS (tách rời với hàng đợi), SNS (thông báo fan-out)                            |
| Chương 20 | Lambda: serverless compute, event trigger, đồng thời                           |
| Chương 21 | ECS và EKS: microservice containerized                                          |
| Chương 22 | Step Functions: điều phối workflow                                               |
| Chương 26 | Kinesis: streaming dữ liệu thời gian thực                                       |

Mẫu kỳ thi chính:

- "Tách rời xử lý đơn hàng khỏi cập nhật kho" → Hàng đợi SQS giữa các dịch vụ
- "Thông báo nhiều dịch vụ khi đơn hàng mới được đặt" → SNS topic với SQS subscription (fan-out)
- "Tự động xử lý tải lên S3" → S3 event notification → Lambda
- "Chạy workflow đa bước với logic retry" → Step Functions

---

**Task 2.2 — Thiết kế kiến trúc có khả dụng cao và/hoặc chịu lỗi**

Các khái niệm cốt lõi: Multi-AZ, Multi-Region, failover Route 53, RDS read replica, Aurora Global Database, backup và restore.

| Chương    | Chủ Đề                                                                                                  |
|-----------|---------------------------------------------------------------------------------------------------------|
| Chương 2  | Cơ sở hạ tầng toàn cầu AWS: Region, AZ, edge location                                                   |
| Chương 7  | ALB trên nhiều AZ, ASG thay thế instance không lành mạnh                                                |
| Chương 8  | RDS Multi-AZ: sao chép đồng bộ, failover tự động                                                       |
| Chương 12 | Route 53: failover routing, latency routing, health check                                               |
| Chương 18 | Multi-AZ vs. Multi-Region: RTO/RPO, chiến lược DR (pilot light, warm standby, active-active)            |
| Chương 24 | Aurora Global Database: read replica cross-region, độ trễ sao chép < 1 giây                            |

Mẫu kỳ thi chính:

- "Tự động failover nếu RDS chính bị lỗi" → RDS Multi-AZ (không phải Read Replica)
- "Phục vụ đọc toàn cầu với độ trễ thấp" → Aurora Global Database
- "Định tuyến lưu lượng đến region phụ nếu region chính không khả dụng" → Route 53 với Failover routing + health check
- "RTO 1 phút, RPO 0" → Triển khai Multi-AZ (không phải Multi-Region)
- "RTO 15 phút, cross-region" → Chiến lược Pilot Light

---

## Domain 3: Thiết Kế Kiến Trúc Hiệu Suất Cao (24%)

**Task 3.1 — Xác định giải pháp lưu trữ hiệu suất cao và/hoặc có thể mở rộng**

Các khái niệm cốt lõi: S3 vs. EBS vs. EFS, lựa chọn storage class, S3 Transfer Acceleration, multipart upload, CloudFront cho asset.

| Chương    | Chủ Đề                                                                          |
|-----------|---------------------------------------------------------------------------------|
| Chương 5  | S3: object storage, storage class, versioning, lifecycle                        |
| Chương 6  | EBS: loại block storage (gp3, io2, st1), EFS: lưu trữ tệp chia sẻ             |
| Chương 23 | Chuyển đổi storage class S3, tùy chọn truy xuất Glacier                        |
| Chương 28 | EBS right-sizing, chuyển gp2→gp3, quản lý snapshot                             |

Mẫu kỳ thi chính:

- "Hệ thống tệp chia sẻ có thể truy cập từ nhiều instance EC2" → EFS (không phải EBS; EBS gắn vào một instance)
- "IOPS cao cho khối lượng công việc cơ sở dữ liệu" → io2 EBS
- "Giảm chi phí cho tệp không được truy cập trong 90 ngày" → Chính sách lifecycle S3 → Glacier
- "Tải lên tệp lớn từ vị trí xa nhanh hơn" → S3 Transfer Acceleration

---

**Task 3.2 — Xác định giải pháp tính toán hiệu suất cao và/hoặc có thể mở rộng**

Các khái niệm cốt lõi: Họ instance EC2, processor Graviton, Auto Scaling, Lambda, Fargate, Spot Instances.

| Chương    | Chủ Đề                                                                                               |
|-----------|------------------------------------------------------------------------------------------------------|
| Chương 4  | Loại instance EC2: compute-optimized (c), memory-optimized (r), general purpose (m, t)              |
| Chương 7  | Auto Scaling: mở rộng ngang cho tầng web                                                            |
| Chương 20 | Lambda: đồng thời, provisioned concurrency (cho độ trễ nhất quán)                                  |
| Chương 21 | ECS Fargate: container serverless                                                                    |
| Chương 27 | Spot Instances cho khối lượng công việc batch chịu lỗi                                             |

Mẫu kỳ thi chính:

- "Khối lượng công việc đào tạo ML, giảm thiểu chi phí, có thể gián đoạn" → Spot Instances
- "Phản hồi Lambda nhất quán dưới 100ms" → Provisioned concurrency (loại bỏ cold start)
- "Microservice containerized, không quản lý cơ sở hạ tầng" → ECS Fargate

---

**Task 3.3 — Xác định giải pháp cơ sở dữ liệu hiệu suất cao**

Các khái niệm cốt lõi: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, mẫu truy cập, read replica, DAX.

| Chương    | Chủ Đề                                                                          |
|-----------|---------------------------------------------------------------------------------|
| Chương 8  | RDS: cơ sở dữ liệu quan hệ được quản lý, khi nào dùng RDBMS                   |
| Chương 9  | DynamoDB: NoSQL, partition key, GSI, DAX (cache trong bộ nhớ)                  |
| Chương 10 | ElastiCache: Redis vs. Memcached, chiến lược cache                              |
| Chương 24 | Aurora: hiệu suất, Serverless v2, read replica, Global Database                |
| Chương 29 | DynamoDB on-demand vs. năng lực được cấp phát với Auto Scaling                 |

Mẫu kỳ thi chính:

- "Đọc micro giây cho session store" → ElastiCache Redis hoặc DAX (nếu backend DynamoDB)
- "Truy cập key-value thông lượng cao với schema linh hoạt" → DynamoDB
- "Join phức tạp và giao dịch ACID" → Aurora hoặc RDS
- "Analytics trên petabyte dữ liệu có cấu trúc" → Redshift (không được đề cập chi tiết nhưng tín hiệu: "data warehouse" → Redshift)

---

**Task 3.4 — Xác định kiến trúc mạng hiệu suất cao và/hoặc có thể mở rộng**

Các khái niệm cốt lõi: CloudFront, Global Accelerator, Direct Connect, VPN, placement group, enhanced networking.

| Chương    | Chủ Đề                                                                         |
|-----------|--------------------------------------------------------------------------------|
| Chương 12 | Route 53: chính sách định tuyến: latency-based, geolocation, weighted          |
| Chương 13 | CloudFront: CDN, edge caching, Lambda@Edge                                     |
| Chương 25 | Direct Connect: kết nối private dành riêng                                     |
| Chương 25 | AWS Global Accelerator: định tuyến Anycast đến edge AWS gần nhất               |
| Chương 30 | VPC Endpoints: kết nối private đến dịch vụ AWS                                 |

Mẫu kỳ thi chính:

- "Giảm độ trễ cho người dùng toàn cầu truy cập phản hồi API động" → Global Accelerator (không phải CloudFront, tốt nhất cho nội dung có thể cache)
- "Giảm độ trễ cho asset tĩnh toàn cầu" → CloudFront
- "Kết nối private nhất quán đến AWS từ on-premises" → Direct Connect
- "Tải lên nhanh từ khách hàng trên toàn thế giới đến S3 bucket" → S3 Transfer Acceleration

---

**Task 3.5 — Xác định giải pháp nhập và chuyển đổi dữ liệu hiệu suất cao**

Các khái niệm cốt lõi: Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR.

| Chương    | Chủ Đề                                                                          |
|-----------|---------------------------------------------------------------------------------|
| Chương 26 | Kinesis Data Streams: xử lý sự kiện có thứ tự thời gian thực                   |
| Chương 26 | Kinesis Data Firehose: phân phối được quản lý đến S3, Redshift, OpenSearch      |
| Chương 26 | AWS Glue: ETL serverless, Data Catalog, Crawler                                 |
| Chương 26 | Athena: SQL serverless trên S3                                                  |

Mẫu kỳ thi chính:

- "Xử lý dữ liệu click-stream thời gian thực" → Kinesis Data Streams + Lambda hoặc KDA
- "Phân phối dữ liệu streaming đến S3 để phân tích sau" → Kinesis Firehose
- "Chuyển đổi và lập danh mục dữ liệu từ nhiều nguồn" → AWS Glue
- "Truy vấn dữ liệu lịch sử được lưu trong S3 bằng SQL" → Athena

---

## Domain 4: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (20%)

**Task 4.1 — Thiết kế giải pháp lưu trữ tối ưu chi phí**

| Chương    | Chủ Đề                                                                               |
|-----------|--------------------------------------------------------------------------------------|
| Chương 23 | Chính sách lifecycle S3, chuyển đổi storage class                                    |
| Chương 28 | EBS right-sizing, chuyển gp2→gp3, quy tắc lifecycle versioning S3                   |
| Chương 28 | EFS Intelligent-Tiering, thẻ phân bổ chi phí, AWS Budgets                           |

Mẫu kỳ thi chính:

- "Xác định nhóm nào đang tạo ra nhiều chi phí S3 nhất" → Thẻ phân bổ chi phí + Cost Explorer
- "Giảm chi phí cho object truy cập không thường xuyên tự động" → S3 Intelligent-Tiering
- "Cảnh báo khi chi phí hàng tháng vượt $10,000" → AWS Budgets

---

**Task 4.2 — Thiết kế giải pháp tính toán tối ưu chi phí**

| Chương    | Chủ Đề                                                                                             |
|-----------|----------------------------------------------------------------------------------------------------|
| Chương 27 | Giá EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts                      |
| Chương 20 | Lambda: trả theo lần gọi (chi phí nhàn rỗi bằng không)                                           |

Mẫu kỳ thi chính:

- "Giảm chi phí cho khối lượng công việc production trạng thái ổn định" → Savings Plans (linh hoạt hơn) hoặc Reserved Instances
- "Giảm thiểu chi phí cho công việc batch có thể gián đoạn" → Spot Instances
- "Xử lý event-driven với chi phí nhàn rỗi bằng không" → Lambda

---

**Task 4.3 — Thiết kế giải pháp cơ sở dữ liệu tối ưu chi phí**

| Chương    | Chủ Đề                                                          |
|-----------|-----------------------------------------------------------------|
| Chương 29 | DynamoDB on-demand vs. được cấp phát + Auto Scaling            |
| Chương 29 | RDS và ElastiCache Reserved Instances/Node                     |
| Chương 29 | Quản lý snapshot RDS                                           |

Mẫu kỳ thi chính:

- "Lưu lượng DynamoDB không thể đoán trước" → Chế độ năng lực on-demand
- "Lưu lượng DynamoDB nhất quán với các đỉnh đã biết" → Được cấp phát + Auto Scaling
- "Giảm chi phí RDS cho khối lượng công việc ổn định" → Reserved Instances (1 hoặc 3 năm)

---

**Task 4.4 — Thiết kế kiến trúc mạng tối ưu chi phí**

| Chương    | Chủ Đề                                                                                                  |
|-----------|---------------------------------------------------------------------------------------------------------|
| Chương 30 | Giá chuyển dữ liệu: inbound (miễn phí), cross-AZ ($0.01/GB), cross-region, internet ($0.09/GB)         |
| Chương 30 | NAT Gateway ($0.045/GB) vs. VPC Endpoints (Gateway: miễn phí; Interface: có giá)                       |
| Chương 30 | CloudFront như công cụ tối ưu chi phí chuyển dữ liệu                                                   |

Mẫu kỳ thi chính:

- "EC2 trong private subnet gọi S3 — loại bỏ chi phí NAT Gateway" → S3 Gateway Endpoint (miễn phí)
- "EC2 trong private subnet gọi SQS — giảm chi phí NAT Gateway" → SQS Interface Endpoint
- "Giảm chi phí chuyển dữ liệu cho phân phối nội dung toàn cầu" → CloudFront (caching giảm yêu cầu origin)

---

## Chủ Đề Xuyên Domain

Một số chủ đề xuất hiện trên nhiều domain:

| Chủ Đề                              | Domain  | Chương       |
|-------------------------------------|---------|--------------|
| AWS Well-Architected Framework      | Tất cả  | 31           |
| Architecture review và ADR          | Tất cả  | 32           |
| Lý luận đánh đổi ("tùy thuộc")      | Tất cả  | 33           |
| Thiết kế Multi-AZ                   | 2, 3    | 7, 8, 18, 24 |
| Monitoring và khả năng quan sát     | 1, 2    | Xuyên suốt  |
| CloudFront                          | 3, 4    | 13, 30       |

---

## Danh Sách Kiểm Tra Trước Kỳ Thi

Trước khi thi SAA-C03:

**Lĩnh vực có trọng số cao (có nhiều khả năng xuất hiện nhất)**

- [ ] Logic đánh giá IAM policy (explicit deny → explicit allow → implicit deny)
- [ ] Các thành phần VPC: subnet, bảng định tuyến, IGW, NAT Gateway, security group, NACL
- [ ] Storage class S3 và khi nào dùng mỗi cái
- [ ] RDS Multi-AZ vs. Read Replica (failover vs. mở rộng đọc)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. định tuyến sự kiện)
- [ ] Mô hình giá EC2: Spot cho chịu lỗi, Savings Plans cho khối lượng công việc cam kết
- [ ] Lambda trigger và đồng thời
- [ ] DynamoDB vs. Aurora vs. Redshift (mẫu truy cập xác định lựa chọn)
- [ ] CloudFront: CDN cho tĩnh, Global Accelerator cho động

**Bẫy phổ biến**

- [ ] EBS gắn vào MỘT instance; EFS được chia sẻ
- [ ] RDS Read Replica để mở rộng đọc, KHÔNG phải failover tự động (đó là Multi-AZ)
- [ ] NACL là stateless (cần cả quy tắc inbound và outbound)
- [ ] Gateway Endpoint miễn phí và chỉ cho S3 và DynamoDB
- [ ] Kinesis giữ lại và phát lại; SQS xóa khi tiêu thụ
- [ ] "Tách rời" không phải lúc nào cũng có nghĩa là SQS — SNS fan-out và EventBridge cũng là các mẫu tách rời
- [ ] Shield Standard miễn phí và tự động; Advanced là đăng ký trả phí

**Cấu trúc kỳ thi**

- 65 câu hỏi, 130 phút (2 giờ 10 phút)
- Nhiều lựa chọn (một đúng) và nhiều phản hồi (chọn N đúng)
- Điểm đậu: 720 trên 1000
- Câu hỏi không được tính điểm được nhúng; bạn không thể biết cái nào là chúng
- Quản lý thời gian: ~2 phút mỗi câu hỏi; gắn cờ câu khó và quay lại
