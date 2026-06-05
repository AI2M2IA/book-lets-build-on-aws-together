# Phụ Lục A: Tài Liệu Tham Khảo Nhanh Về Các Dịch Vụ AWS

Mỗi dịch vụ được đề cập trong quyển sách này, theo thứ tự giới thiệu. Dùng đây làm tài liệu tham khảo học tập và tra cứu nhanh trong khi ôn thi.

---

## Tính Toán

**EC2 — Elastic Compute Cloud** *(Chương 4)*

Máy ảo trên cloud. Bạn chọn loại instance (CPU, bộ nhớ, lưu trữ), hệ điều hành và region. Bạn trả theo giờ (On-Demand), theo cam kết (Reserved Instances / Savings Plans), hoặc theo slot năng lực dự phòng (Spot). Nguyên thủy tính toán nền tảng.

Các khái niệm chính: AMI (Amazon Machine Image), loại instance (họ t3, m6g, r6g, c6g), cặp khóa, instance profile, placement group.

Tín hiệu kỳ thi: Khi kịch bản yêu cầu tính toán bền vững, stateful hoặc chạy lâu — EC2 hoặc ECS. Khi kịch bản yêu cầu tính toán ngắn hạn, kích hoạt bởi sự kiện hoặc chi phí nhàn rỗi bằng không — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Chương 7)*

Auto Scaling Groups (ASGs) thêm và xóa các instance EC2 dựa trên tải. Application Load Balancers (ALBs) phân phối lưu lượng trên các instance và định tuyến theo đường dẫn hoặc host. Cùng nhau chúng tạo thành lớp mở rộng ngang.

Các khái niệm chính: Launch template, scaling policy (target tracking, step, scheduled), health check, ALB target group, listener rule, định tuyến có trọng số.

Tín hiệu kỳ thi: "Xử lý tải biến đổi" hoặc "tính khả dụng cao trên các AZ" → ASG + ALB.

---

**Lambda** *(Chương 20)*

Hàm serverless. Bạn viết code; AWS chạy nó để phản hồi các sự kiện. Không có máy chủ để quản lý. Bạn trả theo lần gọi và theo mili giây thực thi. Tự động mở rộng đến hàng nghìn thực thi đồng thời.

Các khái niệm chính: Nguồn sự kiện (API Gateway, S3, SQS, EventBridge, Kinesis), execution role, giới hạn đồng thời, reserved và provisioned concurrency, cold start, Layers, thời gian tối đa 15 phút.

Tín hiệu kỳ thi: "Serverless," "event-driven," "tác vụ ngắn hạn," "không có chi phí nhàn rỗi" → Lambda.

---

**ECS — Elastic Container Service** *(Chương 21)*

Chạy Docker container trên AWS. Hai loại khởi động: EC2 (bạn quản lý host) và Fargate (AWS quản lý host). ECS quản lý task definition, service, cluster scheduling và tích hợp với load balancer và service discovery.

Các khái niệm chính: Task definition, ECS service, Fargate vs. EC2 launch type, ECR (container registry), task IAM role, service auto scaling.

Tín hiệu kỳ thi: "Khối lượng công việc containerized," "microservice," "Docker trên AWS" → ECS (thường Fargate cho container serverless).

---

**EKS — Elastic Kubernetes Service** *(Chương 21)*

Kubernetes được quản lý. AWS chạy control plane; bạn chạy worker node (EC2 hoặc Fargate). Dùng EKS khi nhóm của bạn đã sử dụng Kubernetes hoặc có khối lượng công việc yêu cầu các tính năng đặc thù Kubernetes.

Tín hiệu kỳ thi: "Kubernetes," "cần di chuyển khối lượng công việc K8s hiện có" → EKS. "Chỉ cần container mà không có overhead K8s" → ECS.

---

## Lưu Trữ

**S3 — Simple Storage Service** *(Chương 5)*

Object storage. Dung lượng không giới hạn, độ bền 99.999999999% (mười một số chín). Lưu trữ tệp như object trong bucket. Bucket tồn tại trong một region. Object có thể từ 0 byte đến 5TB.

Các khái niệm chính: Bucket policy, object ACL, versioning, static website hosting, presigned URL, multipart upload, Transfer Acceleration, storage class (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Tín hiệu kỳ thi: "Lưu trữ và truy xuất tệp," "asset tĩnh," "backup," "data lake" → S3. Storage class đúng phụ thuộc vào tần suất truy cập và tốc độ truy xuất.

---

**EBS — Elastic Block Store** *(Chương 6)*

Block storage được gắn vào một instance EC2 duy nhất. Hoạt động như ổ cứng. Tồn tại độc lập với vòng đời instance (bạn có thể tách và gắn lại). Loại phổ biến nhất: gp3 (SSD mục đích chung, mặc định), io2 (IOPS được cấp phát cho cơ sở dữ liệu), st1 (HDD được tối ưu hóa thông lượng cho lần đọc tuần tự).

Các khái niệm chính: Snapshot (tăng dần, lưu trong S3), mã hóa (KMS), Multi-Attach (chỉ io1/io2), cấp phát IOPS và thông lượng.

Tín hiệu kỳ thi: "Lưu trữ bền vững cho EC2," "lưu trữ cơ sở dữ liệu," "cần truy cập block độ trễ thấp" → EBS.

---

**EFS — Elastic File System** *(Chương 6)*

Hệ thống tệp chia sẻ, có thể truy cập từ nhiều instance EC2 đồng thời. Giao thức NFS. Tự động mở rộng. Đắt hơn EBS mỗi GB. Hai storage class: Standard và Infrequent Access. Intelligent-Tiering tự động di chuyển tệp.

Tín hiệu kỳ thi: "Hệ thống tệp chia sẻ," "nhiều instance EC2 cần cùng tệp," "NFS" → EFS.

---

**Storage Class S3 và Chính Sách Lifecycle** *(Chương 23)*

S3 Intelligent-Tiering tự động di chuyển object giữa các tầng truy cập dựa trên tần suất truy cập. Chính sách lifecycle chuyển object giữa các class (Standard → Standard-IA → Glacier) dựa trên các quy tắc tuổi. Các storage class Glacier có độ trễ truy xuất từ vài phút (Glacier Instant) đến 12 giờ (Glacier Deep Archive).

Tín hiệu kỳ thi: "Giảm chi phí lưu trữ cho dữ liệu truy cập không thường xuyên" → chính sách lifecycle, Intelligent-Tiering, hoặc Glacier.

---

## Cơ Sở Dữ Liệu

**RDS — Relational Database Service** *(Chương 8)*

Cơ sở dữ liệu quan hệ được quản lý. Các engine được hỗ trợ: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, và Aurora (engine độc quyền của AWS). AWS xử lý backup, vá lỗi, failover và sao chép. Bạn quản lý thiết kế schema, truy vấn và kích thước instance.

Các khái niệm chính: Multi-AZ deployment (failover tự động, sao chép đồng bộ), Read Replicas (không đồng bộ, để mở rộng đọc), backup tự động (lưu giữ 1-35 ngày), snapshot thủ công (giữ cho đến khi bị xóa), RDS Proxy (connection pooling).

Tín hiệu kỳ thi: "Cơ sở dữ liệu quan hệ," "giao dịch ACID," "khối lượng công việc SQL hiện có" → RDS hoặc Aurora.

---

**Aurora** *(Chương 24)*

Engine cơ sở dữ liệu quan hệ của AWS, tương thích với MySQL và PostgreSQL. Engine lưu trữ phân tán sao chép dữ liệu trên 3 AZ trong 6 bản sao. Thường nhanh hơn MySQL 5 lần. Aurora Serverless v2 tự động mở rộng năng lực (được đo bằng ACU — Aurora Capacity Units).

Các khái niệm chính: Aurora cluster (writer + lên đến 15 reader endpoint), Aurora Global Database (read replica cross-region với < 1 giây độ trễ sao chép), Aurora Serverless v2.

Tín hiệu kỳ thi: "Cơ sở dữ liệu quan hệ hiệu suất cao," "tương thích MySQL/PostgreSQL," "lượng đọc toàn cầu," "khối lượng công việc biến đổi" → Aurora.

---

**DynamoDB** *(Chương 9)*

Cơ sở dữ liệu NoSQL được quản lý hoàn toàn. Mô hình key-value và document. Mở rộng đến bất kỳ thông lượng nào với hiệu suất mili giây một chữ số. Hai chế độ năng lực: on-demand (trả theo yêu cầu) và được cấp phát (trả theo đơn vị năng lực mỗi giờ, với Auto Scaling).

Các khái niệm chính: Partition key (bắt buộc), sort key (tùy chọn), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (change data capture), DynamoDB Accelerator (DAX) — cache trong bộ nhớ, TTL (Time to Live), giao dịch.

Tín hiệu kỳ thi: "Truy cập key-based thông lượng cao," "schema linh hoạt," "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Chương 10)*

Caching trong bộ nhớ được quản lý. Hai engine: Redis (bền vững, pub/sub, scripting Lua, cấu trúc dữ liệu) và Memcached (cache thuần túy, đơn giản hơn, đa luồng). Dùng để giảm tải cơ sở dữ liệu và phục vụ dữ liệu được đọc thường xuyên trong micro giây.

Các khái niệm chính: Mẫu cache-aside, mẫu write-through, chính sách eviction, TTL, cluster mode (Redis), Multi-AZ với failover tự động.

Tín hiệu kỳ thi: "Giảm tải cơ sở dữ liệu," "độ trễ đọc dưới mili giây," "quản lý phiên," "bảng xếp hạng thời gian thực" → ElastiCache Redis.

---

## Mạng

**VPC — Virtual Private Cloud** *(Chương 11)*

Mạng được cô lập trong AWS. Trải rộng tất cả AZ trong một region. Bạn định nghĩa không gian địa chỉ IP (CIDR block), tạo subnet (public hoặc private), cấu hình bảng định tuyến và kiểm soát truy cập qua security group và NACL.

Các khái niệm chính: Public subnet (route đến Internet Gateway), private subnet (route đến NAT Gateway cho outbound), Internet Gateway (inbound + outbound đến internet), NAT Gateway (chỉ outbound cho instance private), VPC Peering (kết nối hai VPC), VPC Endpoints (kết nối đến dịch vụ AWS mà không cần internet).

Tín hiệu kỳ thi: "Mạng riêng tư trên AWS," "cô lập tài nguyên khỏi internet," "kiểm soát lưu lượng mạng" → VPC.

---

**Security Groups và NACLs** *(Chương 15)*

Security group là tường lửa stateful ở cấp độ instance — chỉ quy tắc allow, lưu lượng trả về tự động. NACLs (Network Access Control Lists) là tường lửa stateless ở cấp độ subnet — yêu cầu cả quy tắc inbound và outbound, được đánh giá theo thứ tự số quy tắc.

Tín hiệu kỳ thi: "Chặn một IP cụ thể khỏi truy cập subnet" → NACL. "Kiểm soát lưu lượng đến/từ instance" → security group.

---

**Route 53** *(Chương 12)*

Dịch vụ DNS và đăng ký tên miền của AWS. Định tuyến lưu lượng internet đến tài nguyên AWS và endpoint bên ngoài. Chính sách định tuyến: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multi-value answer.

Các khái niệm chính: Hosted zone (public và private), loại record (A, AAAA, CNAME, Alias), health check, Traffic Flow (trình soạn thảo chính sách trực quan).

Tín hiệu kỳ thi: "Định tuyến DNS," "failover giữa các region," "định tuyến dựa trên độ trễ hoặc vị trí" → Route 53 với chính sách định tuyến phù hợp.

---

**CloudFront** *(Chương 13)*

Content Delivery Network (CDN). Cache nội dung tại các edge location (400+ trên toàn thế giới). Giảm độ trễ cho người dùng cuối. Giảm chi phí chuyển origin thông qua caching. Tích hợp với S3, EC2, ALB và API Gateway làm origin.

Các khái niệm chính: Distribution, origin, behavior (định tuyến dựa trên đường dẫn đến origin), TTL (cache control), cache invalidation, signed URL và cookie (kiểm soát truy cập), Lambda@Edge và CloudFront Functions (chạy code tại edge), Origin Shield (giảm tải origin).

Tín hiệu kỳ thi: "Độ trễ thấp toàn cầu," "cache nội dung tĩnh," "giảm tải origin," "bảo vệ chống DDoS với Shield" → CloudFront.

---

**Direct Connect và VPN** *(Chương 25)*

AWS Direct Connect là kết nối mạng vật lý riêng tư dành riêng từ trung tâm dữ liệu on-premises của bạn đến AWS. Bỏ qua internet công cộng. Băng thông và độ trễ nhất quán hơn. AWS Site-to-Site VPN là đường hầm được mã hóa qua internet công cộng — thiết lập nhanh hơn, chi phí thấp hơn, nhưng hiệu suất biến đổi.

Các khái niệm chính: Virtual Interface (VIF), Direct Connect Gateway (kết nối đến nhiều region), Transit Gateway (cấu trúc mạng hub-and-spoke), tính dự phòng đường hầm VPN.

Tín hiệu kỳ thi: "Kết nối riêng tư dành riêng đến AWS" → Direct Connect. "Kết nối được mã hóa, thiết lập nhanh hơn" → VPN. "Kết nối nhiều VPC" → Transit Gateway.

---

**VPC Endpoints** *(Chương 30)*

Kết nối tài nguyên private với dịch vụ AWS mà không sử dụng internet công cộng hoặc NAT Gateway. Gateway Endpoints: miễn phí, chỉ khả dụng cho S3 và DynamoDB. Interface Endpoints (PrivateLink): tính phí theo giờ + mỗi GB, khả dụng cho hầu hết các dịch vụ AWS.

Tín hiệu kỳ thi: "EC2 trong private subnet gọi S3/DynamoDB — giảm chi phí NAT Gateway" → Gateway Endpoint (miễn phí). "Kết nối private đến SQS, SSM, Secrets Manager từ private subnet" → Interface Endpoint.

---

## Bảo Mật và Nhận Dạng

**IAM — Identity and Access Management** *(Chương 3 và 14)*

Kiểm soát ai có thể làm gì trong tài khoản AWS của bạn. User (thông tin xác thực dài hạn), Group (người dùng chia sẻ quyền), Role (thông tin xác thực tạm thời cho dịch vụ và truy cập cross-account), Policy (tài liệu JSON định nghĩa quy tắc allow/deny).

Các khái niệm chính: Principal, Action, Resource, Condition, explicit deny > explicit allow > implicit deny, SCP (Service Control Policy trong AWS Organizations), Permission boundary, AssumeRole.

Tín hiệu kỳ thi: IAM liên quan đến mọi câu hỏi bảo mật. Mẫu chính: dịch vụ sử dụng IAM role (không phải user). Truy cập cross-account sử dụng role assumption. Đặc quyền tối thiểu — chỉ cấp những gì cần thiết.

---

**KMS — Key Management Service** *(Chương 16)*

Dịch vụ khóa mã hóa được quản lý. Tạo, lưu trữ và kiểm soát các khóa mã hóa. Customer-managed keys (CMK) cho phép bạn xác định xoay vòng, sử dụng và chính sách truy cập. AWS-managed keys được quản lý tự động.

Các khái niệm chính: Key policy (riêng biệt với IAM policy), Envelope encryption (dữ liệu được mã hóa với data key; data key được mã hóa với CMK), Xoay vòng khóa tự động, Khóa đa region, Grant.

Tín hiệu kỳ thi: "Mã hóa dữ liệu tại chỗ," "khóa mã hóa do khách hàng quản lý," "xoay vòng khóa" → KMS.

---

**Secrets Manager** *(Chương 16)*

Lưu trữ và tự động xoay vòng các giá trị nhạy cảm: thông tin xác thực cơ sở dữ liệu, API key, OAuth token. Tích hợp với RDS để xoay vòng mật khẩu tự động. Ứng dụng truy xuất bí mật tại thời gian chạy qua API — không bao giờ hardcode thông tin xác thực.

Tín hiệu kỳ thi: "Lưu trữ và xoay vòng thông tin xác thực cơ sở dữ liệu," "tránh bí mật được hardcode" → Secrets Manager. "Lưu trữ giá trị cấu hình, không phải bí mật" → Parameter Store (SSM).

---

**AWS Shield** *(Chương 17)*

Bảo vệ DDoS. Shield Standard tự động và miễn phí — bảo vệ chống lại các cuộc tấn công volumetric và protocol phổ biến. Shield Advanced thêm bảo vệ tài chính, nhóm phản hồi DDoS 24/7 và khả năng hiển thị chi tiết về cuộc tấn công.

Tín hiệu kỳ thi: "Bảo vệ chống DDoS" → Shield Standard (tự động) hoặc Shield Advanced (doanh nghiệp, với SLA).

---

**WAF — Web Application Firewall** *(Chương 17)*

Lọc lưu lượng HTTP/HTTPS dựa trên quy tắc: chặn IP, giới hạn tốc độ, mẫu SQL injection, mẫu XSS, hạn chế địa lý, quy tắc tùy chỉnh. Gắn vào CloudFront, ALB, API Gateway, hoặc AppSync.

Tín hiệu kỳ thi: "Chặn các địa chỉ IP cụ thể," "ngăn SQL injection tại edge," "giới hạn tốc độ lời gọi API" → WAF.

---

**GuardDuty** *(Chương 17)*

Dịch vụ phát hiện mối đe dọa. Phân tích log CloudTrail, VPC Flow Logs và log DNS sử dụng ML và threat intelligence. Phát hiện hoạt động API bất thường, giao tiếp với IP độc hại đã biết, thông tin xác thực bị xâm phạm.

Tín hiệu kỳ thi: "Phát hiện hoạt động bất thường," "xác định thông tin xác thực IAM bị xâm phạm," "giám sát mối đe dọa liên tục" → GuardDuty.

---

## Nhắn Tin và Xử Lý Sự Kiện

**SQS — Simple Queue Service** *(Chương 19)*

Hàng đợi tin nhắn được quản lý. Producer gửi tin nhắn; consumer đọc và xóa chúng. Tách rời dịch vụ: người gửi không cần biết nếu người nhận có sẵn hay không. Hàng đợi Standard: phân phối ít nhất một lần, thứ tự nỗ lực tốt nhất. Hàng đợi FIFO: xử lý chính xác một lần, thứ tự nghiêm ngặt.

Các khái niệm chính: Visibility timeout (tin nhắn bị ẩn khỏi các consumer khác trong khi xử lý), Dead Letter Queue (DLQ) cho các tin nhắn thất bại lặp đi lặp lại, Lưu giữ tin nhắn (mặc định 4 ngày, tối đa 14), Long polling (giảm phản hồi trống).

Tín hiệu kỳ thi: "Tách rời dịch vụ," "đệm yêu cầu trong đợt tăng tải," "xử lý không đồng bộ" → SQS. "Thứ tự quan trọng và yêu cầu chính xác một lần" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Chương 19)*

Dịch vụ pub/sub được quản lý. Publisher gửi tin nhắn đến topic; tất cả subscriber nhận một bản sao. Mẫu fan-out: một tin nhắn → nhiều consumer. Giao thức: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push.

Các khái niệm chính: Topic, subscription, mẫu fan-out (SNS → nhiều hàng đợi SQS), lọc tin nhắn (subscriber chỉ nhận tin nhắn khớp).

Tín hiệu kỳ thi: "Gửi thông báo đến nhiều endpoint đồng thời," "fan-out một sự kiện duy nhất đến nhiều consumer" → SNS. Mẫu phổ biến: SNS + SQS để fan-out bền vững.

---

**EventBridge** *(Chương 22)*

Event bus để xây dựng kiến trúc event-driven. Định tuyến sự kiện từ dịch vụ AWS, đối tác SaaS và nguồn tùy chỉnh đến Lambda, SQS, SNS, Step Functions và các target khác. Hỗ trợ quy tắc theo lịch (cron) và khớp mẫu.

Tín hiệu kỳ thi: "Định tuyến sự kiện từ dịch vụ AWS đến target," "lên lịch Lambda function," "điều phối event-driven" → EventBridge.

---

**Step Functions** *(Chương 22)*

Điều phối workflow serverless. Phối hợp Lambda function, ECS task, DynamoDB, SNS, SQS và các dịch vụ khác vào state machine trực quan. Xử lý retry, error handling, nhánh song song và trạng thái chờ.

Các khái niệm chính: State machine, loại state (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (chính xác một lần, chạy lâu) vs. Express Workflows (ít nhất một lần, khối lượng cao).

Tín hiệu kỳ thi: "Điều phối nhiều Lambda function," "workflow chạy lâu với logic retry," "bước phê duyệt của con người" → Step Functions.

---

**Kinesis** *(Chương 26)*

Streaming dữ liệu thời gian thực. Kinesis Data Streams: stream bản ghi có thứ tự, bền vững (như distributed commit log). Consumer xử lý bản ghi; dữ liệu được giữ 24 giờ đến 7 ngày. Kinesis Data Firehose: phân phối được quản lý đến S3, Redshift, OpenSearch, Splunk — không cần quản lý consumer.

Các khái niệm chính: Shard (đơn vị thông lượng: 1MB/s ghi, 2MB/s đọc), partition key (xác định gán shard), sequence number, checkpointing (KCL hoặc Lambda), Firehose vs. Streams.

Tín hiệu kỳ thi: "Streaming thời gian thực," "bản ghi có thứ tự," "phát lại sự kiện" → Kinesis Data Streams. "Phân phối dữ liệu streaming đến S3/Redshift mà không quản lý consumer" → Kinesis Firehose. Tương phản với SQS: Kinesis giữ lại và phát lại; SQS xóa khi tiêu thụ.

---

## Analytics

**Athena** *(Chương 26)*

Truy vấn SQL serverless trên dữ liệu được lưu trữ trong S3. Không có cơ sở hạ tầng để quản lý. Trả theo truy vấn (mỗi TB được quét). Tốt nhất với định dạng columnar (Parquet, ORC) và dữ liệu được phân vùng.

Tín hiệu kỳ thi: "Truy vấn dữ liệu S3 bằng SQL," "analytics ad-hoc trên data lake," "không quản lý cơ sở hạ tầng" → Athena.

---

**Glue** *(Chương 26)*

Dịch vụ ETL (Extract, Transform, Load) serverless. Glue Crawlers khám phá dữ liệu và cập nhật Glue Data Catalog. Glue Jobs chạy các chuyển đổi Spark hoặc Python. Data Catalog tích hợp với Athena, Redshift Spectrum và EMR.

Tín hiệu kỳ thi: "Chuyển đổi và tải dữ liệu cho analytics," "khám phá schema của dữ liệu S3," "ETL pipeline" → Glue.

---

## Khả Dụng Cao và Disaster Recovery

**Multi-AZ và Multi-Region** *(Chương 18)*

Multi-AZ: sao chép đồng bộ trong một region để failover tự động (RDS Multi-AZ, load balancer trên các AZ). RPO ~0, RTO ~60 giây cho RDS. Multi-Region: sao chép không đồng bộ để dự phòng địa lý và độ trễ thấp hơn cho người dùng toàn cầu.

Các khái niệm chính: RTO (Recovery Time Objective — thời gian phục hồi), RPO (Recovery Point Objective — lượng dữ liệu có thể mất). Chiến lược DR Pilot Light, Warm Standby, Active-Active.

Tín hiệu kỳ thi: Phân biệt giữa lỗi cấp AZ (Multi-AZ xử lý) vs. lỗi vùng (Multi-Region xử lý). Chi phí và độ phức tạp tăng đáng kể với Multi-Region.

---

## Tối Ưu Hóa Chi Phí

**Mô Hình Giá EC2** *(Chương 27)*

On-Demand: giá đầy đủ, không cam kết. Reserved Instances (1 hoặc 3 năm): giảm 30-72% cho loại instance cụ thể. Savings Plans (Compute hoặc EC2 Instance): chi tiêu theo giờ cam kết để linh hoạt. Spot: giảm 60-90% cho các khối lượng công việc có thể gián đoạn.

Tín hiệu kỳ thi: "Giảm thiểu chi phí cho khối lượng công việc có thể dự đoán" → Savings Plans hoặc Reserved Instances. "Xử lý batch chịu lỗi" → Spot. "Không thể đoán trước hoặc ngắn hạn" → On-Demand.

---

**Giá Chuyển Dữ Liệu** *(Chương 30)*

Inbound đến AWS: miễn phí. Cùng AZ: miễn phí. Cross-AZ: $0.01/GB mỗi chiều. Cross-region: $0.02-0.08/GB. Internet (outbound): ~$0.09/GB. Xử lý NAT Gateway: $0.045/GB. Chuyển dữ liệu CloudFront rẻ hơn EC2-to-internet trực tiếp, và caching giảm tổng khối lượng.

Tín hiệu kỳ thi: "Giảm chi phí chuyển dữ liệu cho S3/DynamoDB từ private subnet" → Gateway Endpoints (miễn phí). "Giảm chi phí NAT Gateway cho các dịch vụ khác" → Interface Endpoints.

---

## Khả Năng Quan Sát

**CloudWatch** *(được tham chiếu xuyên suốt)*

Monitoring và khả năng quan sát. CloudWatch Metrics: dữ liệu chuỗi thời gian số từ dịch vụ AWS và ứng dụng tùy chỉnh. CloudWatch Logs: thu thập, tìm kiếm và phân tích dữ liệu log. CloudWatch Alarms: kích hoạt thông báo hoặc auto scaling dựa trên ngưỡng chỉ số. CloudWatch Dashboards: trực quan hóa chỉ số.

Các khái niệm chính: Metric dimension, retention period, log group và log stream, metric filter, CloudWatch Agent (cho chỉ số cấp OS và log từ EC2), Container Insights.

---

**CloudTrail** *(được tham chiếu xuyên suốt)*

Ghi nhật ký mỗi lời gọi API được thực hiện trong tài khoản AWS của bạn: ai thực hiện nó, từ đâu, khi nào và phản hồi là gì. Multi-region trail lưu trữ log trong S3 vô thời hạn. Dùng cho kiểm toán bảo mật, tuân thủ và điều tra sự cố.

Tín hiệu kỳ thi: "Ai đã xóa tài nguyên đó?" "Kiểm toán tất cả hoạt động API" → CloudTrail.

---

**AWS Config** *(được tham chiếu trong Chương 31)*

Theo dõi thay đổi cấu hình tài nguyên theo thời gian. Đánh giá tài nguyên dựa trên các quy tắc tuân thủ. Ghi lại lịch sử của mọi thay đổi cấu hình cho mọi tài nguyên. Tích hợp với Systems Manager để remediation.

Tín hiệu kỳ thi: "Tài nguyên này có tuân thủ chính sách bảo mật của chúng ta không?" "Cấu hình tài nguyên này trông như thế nào tuần trước?" → AWS Config.

---

## Well-Architected

**Sáu Trụ Cột** *(Chương 31)*

| Trụ Cột                | Câu Hỏi Cốt Lõi                       | Dịch Vụ Chính                                               |
|------------------------|----------------------------------------|-------------------------------------------------------------|
| Xuất Sắc Vận Hành      | Chúng ta có đang chạy tốt không?       | CloudWatch, CloudTrail, SSM, Config                          |
| Bảo Mật                | Chúng ta có được bảo vệ không?         | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager           |
| Độ Tin Cậy             | Chúng ta có phục hồi từ thất bại không? | Multi-AZ, Route 53 failover, backup/restore, SQS            |
| Hiệu Quả Hiệu Suất     | Chúng ta có dùng tài nguyên đúng không? | Right-sizing, Auto Scaling, CloudFront, Kinesis             |
| Tối Ưu Hóa Chi Phí     | Chúng ta có chi tiêu khôn ngoan không? | Savings Plans, Spot, S3 lifecycle, VPC Endpoints            |
| Bền Vững               | Chúng ta có giảm thiểu tác động môi trường không? | Right-sizing, Graviton, storage tier hiệu quả |

AWS Well-Architected Tool: đánh giá kiến trúc của bạn dựa trên sáu trụ cột. Dùng nó trước kỳ thi để hiểu lý luận đằng sau câu hỏi của mỗi trụ cột.
