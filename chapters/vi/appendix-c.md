# Phụ Lục C: Sổ Đăng Ký Khái Niệm

Mỗi khái niệm chính được giới thiệu trong sách, được ánh xạ đến chương, phép so sánh được sử dụng và phạm vi (domain) SAA-C03 nơi nó xuất hiện.

Dùng đây làm chỉ mục học tập: nếu bạn còn mơ hồ về một khái niệm trước kỳ thi, tìm nó ở đây và quay lại chương của nó để có ngữ cảnh.

---

## A

**ACM (AWS Certificate Manager)** — Chứng chỉ TLS công khai miễn phí cho ALB, CloudFront và API Gateway, với tự động gia hạn qua xác thực DNS. Chứng chỉ CloudFront phải tồn tại ở us-east-1. Chương 16. Domain 1.

**ACU (Aurora Capacity Unit)** — Đơn vị đo lường năng lực Aurora Serverless v2. Tự động mở rộng và, trên các phiên bản engine được hỗ trợ, có thể tự động tạm dừng về 0 ACU khi không có kết nối nào được giữ mở. Chương 24. Domain 3.

**Alarm (CloudWatch)** — Một quy tắc kích hoạt khi một metric vượt qua ngưỡng, kích hoạt một thông báo hoặc hành động auto scaling. Chương 7. Domain 2.

**ALB (Application Load Balancer)** — Load balancer Layer 7 định tuyến lưu lượng HTTP/HTTPS dựa trên quy tắc đường dẫn và host. Chương 7. Domain 2.

**AMI (Amazon Machine Image)** — Một template chứa OS, phần mềm và cấu hình cho một instance EC2. Chương 4. Domain 3.

**Tư duy kiến trúc sư** — Hỏi "cái gì hỏng trước, làm sao chúng ta biết, và ai đó làm gì lúc 3 giờ sáng?" thay vì chỉ "cái này hoạt động thế nào?" Chương 32, Chương 34. Liên domain.

**Architecture Decision Record (ADR)** — Một tài liệu ngắn ghi lại một quyết định, các lựa chọn thay thế, lý do và điều gì sẽ khiến phải xem xét lại. Chương 32. Liên domain.

**Đánh giá kiến trúc** — Một quy trình có cấu trúc bao gồm: ràng buộc → ẩn số → tùy chọn → chế độ lỗi → giám sát → runbook. Chương 32. Liên domain.

**Athena** — Dịch vụ truy vấn SQL serverless cho dữ liệu trong S3. Trả theo TB được quét. Tốt nhất với định dạng cột Parquet/ORC. Chương 26. Domain 3.

**Auto Scaling Group (ASG)** — Một nhóm instance EC2 được quản lý cùng nhau, tự động thay thế các instance không lành mạnh và mở rộng dựa trên tải. Chương 7. Domain 2, 3.

**Availability Zone (AZ)** — Một hoặc nhiều trung tâm dữ liệu tách biệt vật lý trong một region, được kết nối bằng các liên kết độ trễ thấp. Chương 2. Domain 2.

---

## B

**AWS Backup** — Sao lưu tập trung, dựa trên chính sách trên EBS, RDS, DynamoDB, EFS và Storage Gateway. Hỗ trợ bản sao cross-region và cross-account. Chương 18, 23. Domain 2.

**AWS Batch** — Tính toán batch được quản lý cho Docker container. Bao gồm một job definition (chạy gì), một job queue (nơi job chờ) và một compute environment (EC2 hoặc Fargate, On-Demand hoặc Spot). Cho các khối lượng công việc vượt giới hạn 15 phút của Lambda. Chương 21. Domain 3.

**Bucket (S3)** — Một container cho object S3. Bucket có tên toàn cầu duy nhất và tồn tại trong một region cụ thể. Chương 5. Domain 3.

**Bucket policy** — Một policy dựa trên tài nguyên gắn vào một bucket S3 kiểm soát truy cập cho các IAM principal và tài khoản bên ngoài. Chương 5. Domain 1.

---

## C

**Mẫu cache-aside** — Ứng dụng kiểm tra cache trước; khi miss, truy vấn cơ sở dữ liệu, rồi lưu kết quả vào cache. Chương 10. Domain 3.

**Tỷ lệ cache hit** — Phần trăm yêu cầu được phục vụ từ cache thay vì origin. Cao hơn là tốt hơn. Chương 13. Domain 3.

**AWS Client VPN** — Endpoint OpenVPN được quản lý. Kết nối các thiết bị cá nhân (laptop, máy trạm) đến một VPC qua internet. Xác thực qua Active Directory, liên kết SAML 2.0 với một nhà cung cấp danh tính, hoặc TLS tương hỗ. Hỗ trợ chế độ split-tunnel và full-tunnel. Đối lập với Site-to-Site VPN (mạng-đến-mạng). Chương 11. Domain 1.

**CloudFront** — CDN của AWS. Cache nội dung tại 750+ edge location trên toàn thế giới. Giảm độ trễ và chi phí chuyển dữ liệu origin. Chương 13. Domain 3, 4.

**CloudTrail** — Ghi lại mọi cuộc gọi API AWS: ai, cái gì, khi nào, từ đâu. Lưu trong S3. Dùng cho kiểm toán và điều tra sự cố. Domain 1.

**CloudWatch** — Metric, log, alarm và dashboard cho tài nguyên AWS và ứng dụng tùy chỉnh. Được tham chiếu xuyên suốt. Tất cả domain.

**Amazon Cognito** — Xác thực cho người dùng cuối của ứng dụng của bạn: User Pool là một thư mục người dùng được quản lý (đăng ký, đăng nhập, MFA, đăng nhập xã hội, JWT); Identity Pool phát hành thông tin xác thực AWS tạm thời. IAM dành cho kỹ sư của bạn; Cognito dành cho khách hàng của bạn. Chương 14. Domain 1.

**Cold start (Lambda)** — Độ trễ trong lần gọi đầu tiên (hoặc sau khi không hoạt động) khi Lambda khởi tạo môi trường thực thi. Dùng provisioned concurrency để loại bỏ. Chương 20. Domain 3.

**Compute Savings Plan** — Cam kết một số tiền chi tiêu EC2 theo giờ, áp dụng cho bất kỳ loại hoặc kích thước instance nào. Chương 27. Domain 4.

**Config (AWS)** — Theo dõi các thay đổi cấu hình của tài nguyên AWS theo thời gian và đánh giá tuân thủ so với quy tắc. Chương 31. Domain 1.

**AWS Control Tower** — Tự động hóa quản trị đa tài khoản: xây dựng một landing zone (tài khoản quản lý, lưu trữ log và kiểm toán) với guardrail trong vài phút — phiên bản đúc sẵn của việc kết nối Organizations, CloudTrail và Config bằng tay. Chương 14. Domain 1.

**Chuyển dữ liệu cross-AZ** — Lưu lượng giữa các Availability Zone trong một region. Tính phí $0.01/GB mỗi chiều. Chương 30. Domain 4.

**Sao chép cross-region** — Sao chép dữ liệu (S3 CRR, Aurora Global, DynamoDB Global Tables) đến một region khác. Phát sinh phí chuyển dữ liệu. Chương 18, 23, 30. Domain 2.

---

## D

**AWS DataSync** — Di chuyển và đồng bộ các file share (NFS/SMB) đến S3, EFS, hoặc FSx dựa trên agent. "rsync nâng cấp, với một console AWS." Chương 25. Domain 3.

**DAX (DynamoDB Accelerator)** — Cache trong bộ nhớ dành riêng cho DynamoDB. Độ trễ đọc micro giây. Chương 9. Domain 3.

**Dead Letter Queue (DLQ)** — Một hàng đợi nơi các tin nhắn thất bại xử lý lặp đi lặp lại được gửi đến, ngăn chặn tắc nghẽn hàng đợi. Chương 19. Domain 2.

**AWS DMS (Database Migration Service)** — Di chuyển cơ sở dữ liệu sang AWS với thời gian ngừng tối thiểu. Full load (bản sao ban đầu) cộng với CDC (Change Data Capture) giữ nguồn và đích đồng bộ trong khi di chuyển. Di chuyển đồng thể (cùng loại engine): dùng DMS trực tiếp. Di chuyển dị thể (các loại engine khác nhau, ví dụ Oracle → Aurora PostgreSQL): dùng SCT (Schema Conversion Tool) trước, rồi DMS. Chương 8. Domain 3.

**Dedicated Host** — Một máy chủ EC2 vật lý được dành riêng cho bạn dùng. Bắt buộc cho một số giấy phép phần mềm nhất định. Chương 27. Domain 4.

**Phòng thủ theo chiều sâu** — Phân lớp nhiều kiểm soát bảo mật (IAM + security group + NACL + WAF + GuardDuty) để việc xâm phạm một lớp không làm lộ hệ thống. Chương 33. Domain 1.

**Direct Connect** — Một kết nối mạng riêng tư chuyên dụng từ một vị trí tại chỗ đến AWS. Nhất quán hơn VPN. Chương 25. Domain 3.

**DLQ** — Xem Dead Letter Queue.

**DynamoDB** — Cơ sở dữ liệu NoSQL được quản lý hoàn toàn với độ trễ mili giây một chữ số ở bất kỳ quy mô nào. Mô hình key-value và document. Chương 9. Domain 3.

**DynamoDB Auto Scaling** — Tự động điều chỉnh năng lực đọc/ghi được cấp phát dựa trên metric CloudWatch. Chương 29. Domain 4.

**DynamoDB Streams** — Một change log theo thứ tự thời gian của tất cả các thay đổi item trong một bảng DynamoDB. Dùng với Lambda cho xử lý hướng sự kiện. Chương 9. Domain 2.

---

## E

**EBS (Elastic Block Store)** — Block storage được gắn vào một instance EC2 duy nhất. Tồn tại độc lập. Loại: gp3, io2, st1. Chương 6. Domain 3.

**EC2 (Elastic Compute Cloud)** — Máy ảo trên cloud. Chương 4. Domain 3.

**ECS (Elastic Container Service)** — Điều phối container được quản lý. Loại khởi động Fargate loại bỏ việc quản lý máy chủ. Chương 21. Domain 2, 3.

**EFS (Elastic File System)** — Hệ thống tệp NFS chia sẻ có thể truy cập từ nhiều instance EC2. Tự động mở rộng. Các storage class bao gồm Standard, Infrequent Access và Archive, với Intelligent-Tiering cho việc di chuyển tự động giữa các tầng. Chương 6. Domain 3.

**EKS (Elastic Kubernetes Service)** — Control plane Kubernetes được quản lý trên AWS. Chương 21. Domain 3.

**Elastic Disaster Recovery (DRS)** — Sao chép liên tục cấp block của các máy chủ (tại chỗ hoặc EC2) vào một khu vực staging chi phí thấp, với các instance khôi phục được khởi chạy trong vài phút — một pilot light được quản lý. Chương 18. Domain 2.

**ElastiCache** — Caching trong bộ nhớ được quản lý. Redis (nhiều tính năng hơn) hoặc Memcached (đơn giản hơn). Chương 10. Domain 3.

**Elastic IP** — Một địa chỉ IP công khai tĩnh bạn có thể cấp phát và liên kết lại với các instance EC2. Chương 11. Domain 3.

**Envelope encryption** — Một mẫu trong đó dữ liệu được mã hóa với một data key (DEK), và DEK được mã hóa với một master key (CMK trong KMS). Chương 16. Domain 1.

**EventBridge** — Event bus để định tuyến sự kiện từ các dịch vụ AWS, đối tác SaaS và nguồn tùy chỉnh đến target. Hỗ trợ quy tắc theo lịch. Chương 22. Domain 2.

**Explicit deny** — Một câu lệnh deny IAM không thể bị ghi đè bởi bất kỳ allow nào. Có quyền ưu tiên trên tất cả allow. Chương 3. Domain 1.

---

## F

**Failover routing (Route 53)** — Định tuyến lưu lượng đến một endpoint thứ cấp khi endpoint chính thất bại health check. Chương 12. Domain 2.

**Fargate** — Engine tính toán serverless cho ECS và EKS. Không có instance EC2 để quản lý. Chương 21. Domain 3.

**Mẫu fan-out** — Một SNS topic giao cùng một tin nhắn đến nhiều SQS queue đồng thời. Chương 19. Domain 2.

**FIFO queue (SQS)** — Xử lý chính xác một lần, sắp xếp nghiêm ngặt. Thông lượng thấp hơn standard queue. Chương 19. Domain 2.

**Chế độ lỗi (Failure mode)** — Một cách cụ thể mà một hệ thống có thể thất bại. Xác định các chế độ lỗi trước khi sản xuất là cốt lõi của đánh giá kiến trúc. Chương 32. Liên domain.

---

## G

**Gateway Endpoint** — Một loại VPC endpoint miễn phí cho S3 và DynamoDB. Định tuyến lưu lượng qua mạng riêng AWS, loại bỏ phí NAT Gateway. Chương 30. Domain 4.

**Gateway Load Balancer (GWLB)** — Load balancer Layer 3 để chèn các thiết bị mạng ảo của bên thứ ba (tường lửa, IDS/IPS) vào luồng lưu lượng. Chương 7. Domain 1.

**Geolocation routing (Route 53)** — Định tuyến dựa trên vị trí địa lý của nguồn truy vấn DNS. Chương 12. Domain 3.

**Global Accelerator** — Định tuyến lưu lượng đến edge AWS gần nhất qua Anycast, cải thiện độ trễ cho các ứng dụng động. Chương 25. Domain 3.

**Glue (AWS)** — ETL serverless. Glue Crawler khám phá schema; Glue Job biến đổi dữ liệu; Data Catalog lưu trữ metadata. Chương 26. Domain 3.

**GSI (Global Secondary Index)** — Một index thay thế trên một bảng DynamoDB với một partition key khác và sort key tùy chọn. Cho phép các mẫu truy vấn linh hoạt. Chương 9. Domain 3.

**GuardDuty** — Dịch vụ phát hiện mối đe dọa dùng ML trên log CloudTrail, VPC Flow Logs và DNS để phát hiện hoạt động bất thường. Chương 17. Domain 1.

---

## H

**Health check (Route 53)** — Giám sát tính khả dụng của endpoint. Health check thất bại kích hoạt failover routing. Chương 12. Domain 2.

**Hot partition (DynamoDB)** — Một partition nhận lưu lượng không cân xứng vì nhiều yêu cầu chia sẻ cùng một partition key. Chương 9. Domain 3.

---

## I

**IAM (Identity and Access Management)** — Kiểm soát xác thực và ủy quyền cho các tài khoản AWS. User, group, role, policy. Chương 3, 14. Domain 1.

**IAM role** — Một danh tính IAM với thông tin xác thực tạm thời, được đảm nhận bởi dịch vụ, user, hoặc các tài khoản khác. Chương 3, 14. Domain 1.

**Idempotency (Tính lũy đẳng)** — Thuộc tính của một thao tác tạo ra cùng kết quả dù được gọi một lần hay nhiều lần. Quan trọng cho hệ thống phân tán (hoàn tiền, thanh toán, xử lý đơn hàng). Chương 32. Liên domain.

**Khóa idempotency** — Một định danh duy nhất cho một thao tác, được kiểm tra trước khi thực thi để ngăn xử lý trùng lặp. Chương 32. Liên domain.

**Interface Endpoint (PrivateLink)** — Một VPC endpoint cho hầu hết các dịch vụ AWS. Tính phí theo giờ + theo GB. Cung cấp kết nối riêng tư không qua internet hoặc NAT. Chương 30. Domain 4.

**Internet Gateway (IGW)** — Cho phép các instance trong subnet công khai giao tiếp với internet. Yêu cầu route table của subnet có một route đến IGW. Chương 11. Domain 3.

**"Còn tùy"** — Câu trả lời trung thực cho hầu hết các câu hỏi kiến trúc, luôn phải được hoàn thành: "Còn tùy vào mẫu truy cập / quy mô / hậu quả lỗi / ràng buộc chi phí." Chương 33. Liên domain.

---

## K

**Kinesis Data Firehose** — Tên cũ của Amazon Data Firehose: giao được quản lý của dữ liệu streaming đến S3, Redshift, OpenSearch. Không quản lý consumer. Câu hỏi kỳ thi cũ hơn vẫn có thể dùng tên cũ. Chương 26. Domain 3.

**Kinesis Data Streams** — Stream sự kiện có thứ tự thời gian thực. Bền vững, có thể phát lại trong cửa sổ lưu giữ (mặc định 24 giờ, lên đến 365 ngày). Được đo bằng shard. Chương 26. Domain 3.

**KMS (Key Management Service)** — Tạo, lưu trữ và kiểm soát các khóa mật mã cho mã hóa khi nghỉ. Chương 16. Domain 1.

---

## L

**Lambda** — Hàm serverless được kích hoạt bởi sự kiện. Trả theo lần gọi và theo ms. Thời gian tối đa 15 phút. Chương 20. Domain 2, 3, 4.

**Lambda@Edge** — Các hàm Lambda chạy tại các edge location CloudFront, sửa đổi yêu cầu và phản hồi. Chương 13. Domain 3.

**AWS Lake Formation** — Lớp kiểm soát truy cập data lake tập trung trên S3 và Glue Data Catalog. Cung cấp quyền chi tiết ở cấp bảng, cột và hàng. Đơn giản hóa thiết lập data lake an toàn. Chương 26. Domain 3.

**Latency-based routing (Route 53)** — Định tuyến truy vấn DNS đến region AWS có độ trễ đo được thấp nhất. Chương 12. Domain 3.

**Launch template** — Một template có phiên bản chỉ định cấu hình instance EC2 cho Auto Scaling Group. Chương 7. Domain 3.

**Đặc quyền tối thiểu** — Thực hành tốt nhất IAM: chỉ cấp những quyền cần thiết, không hơn. Chương 3. Domain 1.

**Lifecycle policy (S3)** — Các quy tắc tự động chuyển object sang các storage class rẻ hơn hoặc xóa chúng dựa trên tuổi. Chương 23. Domain 4.

**LSI (Local Secondary Index)** — Một index thay thế trên một bảng DynamoDB dùng cùng partition key nhưng một sort key khác. Phải được tạo khi tạo bảng. Chương 9. Domain 3.

---

## M

**Amazon Macie** — Khám phá dữ liệu nhạy cảm (PII) trong S3 dựa trên ML và đánh dấu các rủi ro phơi nhiễm. GuardDuty theo dõi hành vi; Macie kiểm tra những gì được lưu trữ. Chương 17. Domain 1.

**Memcached** — Engine caching trong bộ nhớ đơn giản, đa luồng. Không bền vững, không có cấu trúc dữ liệu. Dùng Redis trừ khi bạn cụ thể cần đa luồng với cái giá là các tính năng. Chương 10. Domain 3.

**Amazon MemoryDB for Redis** — Cơ sở dữ liệu chính trong bộ nhớ, bền vững, tương thích Redis. Khác với ElastiCache, MemoryDB ghi vào một transaction log Multi-AZ, đảm bảo độ bền dữ liệu. Dùng khi cần tương thích Redis API VÀ mất dữ liệu không chấp nhận được. Chương 10. Domain 3.

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: sao chép cấp block của toàn bộ máy chủ vào AWS, khởi chạy kiểm thử, rồi cutover sang các instance EC2 nguyên bản. DataSync di chuyển tệp; DMS di chuyển cơ sở dữ liệu; MGN di chuyển máy chủ. Chương 25. Domain 3.

**Amazon MQ** — Broker ActiveMQ/RabbitMQ được quản lý nói các giao thức tiêu chuẩn (AMQP, MQTT, STOMP). Cho lift-and-shift của các khối lượng công việc broker hiện có mà không thay đổi code; nhắn tin từ đầu → SQS/SNS. Chương 19. Domain 2.

**Multi-AZ (RDS)** — Replica standby đồng bộ ở một AZ khác với failover tự động. RPO ~0, RTO ~60 giây. Cho tính khả dụng cao, không phải mở rộng đọc. Chương 8, 18. Domain 2.

**Multi-Region** — Triển khai các thành phần ứng dụng trên nhiều region AWS cho dự phòng địa lý và hiệu suất toàn cầu. Độ phức tạp và chi phí cao hơn. Chương 18. Domain 2.

---

## N

**Network Load Balancer (NLB)** — Load balancer Layer 4 (TCP/UDP/TLS): hàng triệu yêu cầu mỗi giây, IP tĩnh mỗi AZ, bảo toàn IP nguồn. Không nhận biết HTTP — đó là việc của ALB. Chương 7. Domain 3.

**NACL (Network Access Control List)** — Tường lửa không trạng thái ở cấp subnet. Yêu cầu cả quy tắc vào và ra. Quy tắc được đánh giá theo thứ tự số. Chương 15. Domain 1.

**NAT Gateway** — Cho phép các instance trong subnet riêng tư thực hiện các kết nối ra ngoài đến internet. Tính phí $0.045/GB được xử lý. Chương 11, 30. Domain 4.

---

## O

**Object (S3)** — Một tệp được lưu trong S3. Bao gồm key (tên), value (dữ liệu) và metadata. Kích thước tối đa 5TB. Chương 5. Domain 3.

**On-Demand capacity (DynamoDB)** — Chế độ trả theo yêu cầu. Đắt hơn mỗi yêu cầu so với provisioned, nhưng không cần lập kế hoạch năng lực. Chương 29. Domain 4.

**On-Demand instances (EC2)** — Trả theo giờ không cam kết. Linh hoạt tối đa, giá tối đa. Chương 27. Domain 4.

**AWS Outposts** — Một rack phần cứng AWS được quản lý hoàn toàn được lắp đặt trong trung tâm dữ liệu của riêng khách hàng hoặc cơ sở co-location. Chạy cùng các dịch vụ, API và công cụ AWS như public cloud tại chỗ. AWS quản lý lắp đặt và vá lỗi; khách hàng cung cấp không gian rack và nguồn điện. Cho trú ngụ dữ liệu, khối lượng công việc tại chỗ độ trễ thấp, hoặc các kịch bản ngắt kết nối. Chương 2. Domain 4.

---

## P

**Partition key (DynamoDB)** — Thành phần khóa chính xác định partition nào lưu một item. Chọn một khóa có độ phân biệt cao để phân phối đều. Chương 9. Domain 3.

**Permission boundary** — Một IAM policy thiết lập quyền tối đa mà một danh tính IAM có thể có, ngay cả khi các policy khác cấp nhiều hơn. Chương 14. Domain 1.

**Placement group** — Kiểm soát vị trí vật lý của các instance EC2 để giảm thiểu độ trễ (cluster) hoặc tối đa hóa tính khả dụng (spread). Chương 4. Domain 3.

**PrivateLink** — Dịch vụ AWS để tạo các endpoint riêng tư đến các dịch vụ được host trong AWS, có thể truy cập qua Interface Endpoint. Chương 30. Domain 1.

**Provisioned concurrency (Lambda)** — Các môi trường thực thi được khởi tạo trước loại bỏ độ trễ cold start. Chương 20. Domain 3.

**Provisioned capacity (DynamoDB)** — Thông lượng đọc và ghi được cấp phát trước, được đo bằng đơn vị năng lực mỗi giây. Rẻ hơn on-demand cho lưu lượng dự đoán được. Chương 9, 29. Domain 4.

---

## Q

**Amazon QuickSight** — Dịch vụ trí tuệ kinh doanh và trực quan hóa dữ liệu được quản lý. Dùng SPICE (Super-fast, Parallel, In-memory Calculation Engine) để cache dữ liệu cho việc hiển thị dashboard nhanh. Kết nối với Athena, S3, Redshift, RDS và các nguồn dữ liệu AWS khác. Không có máy chủ BI để quản lý. Chương 26. Domain 3.

---

## R

**RDS (Relational Database Service)** — Cơ sở dữ liệu quan hệ được quản lý. Xử lý backup, vá lỗi, failover. Chương 8. Domain 3.

**RDS Proxy** — Quản lý một connection pool giữa Lambda/ứng dụng và RDS, ngăn cạn kiệt kết nối. Chương 8. Domain 3.

**Read Replica (RDS)** — Bản sao không đồng bộ của cơ sở dữ liệu để mở rộng đọc. KHÔNG cung cấp failover tự động. Chương 8, 24. Domain 3.

**Redis** — Kho cấu trúc dữ liệu trong bộ nhớ dùng cho caching, quản lý session, bảng xếp hạng thời gian thực, pub/sub. Chương 10. Domain 3.

**Reserved Instance (EC2)** — Một cam kết dùng một loại instance cụ thể ở một region cụ thể trong 1 hoặc 3 năm để đổi lấy một khoản giảm giá. Chương 27. Domain 4.

**Route 53** — Dịch vụ DNS và nhà đăng ký tên miền của AWS. Hỗ trợ nhiều chính sách định tuyến. Chương 12. Domain 2, 3.

**RPO (Recovery Point Objective)** — Mất dữ liệu tối đa chấp nhận được đo bằng thời gian. "Chúng ta có thể chấp nhận mất bao nhiêu dữ liệu?" Chương 18. Domain 2.

**RTO (Recovery Time Objective)** — Thời gian tối đa chấp nhận được để khôi phục dịch vụ sau một lỗi. "Chúng ta có thể ngừng hoạt động bao lâu?" Chương 18. Domain 2.

**Runbook** — Hướng dẫn từng bước để vận hành một hệ thống, cụ thể cho phản ứng sự cố. "Ai đó làm gì lúc 3 giờ sáng?" Chương 32. Liên domain.

---

## S

**S3 Intelligent-Tiering** — Tự động di chuyển object S3 giữa các tầng truy cập dựa trên mẫu truy cập. Không phí truy xuất. Chương 23. Domain 4.

**S3 Select** — Truy xuất một tập con nội dung object S3 dùng biểu thức SQL, giảm chuyển dữ liệu. Di sản: không khả dụng cho khách hàng mới từ giữa năm 2024 — Athena hiện là con đường chính để lọc và truy vấn dữ liệu trong S3. S3 Object Lambda, từng là giải pháp thay thế được đề xuất, bản thân nó là di sản (đóng cửa với khách hàng mới vào tháng 11 năm 2025; các khối lượng công việc hiện có vẫn hoạt động). Chương 30. Domain 4.

**Savings Plan** — Một mô hình định giá linh hoạt cam kết một số tiền chi tiêu theo giờ để đổi lấy một khoản giảm giá. Linh hoạt hơn Reserved Instances. Chương 27. Domain 4.

**SCP (Service Control Policy)** — Policy AWS Organizations hạn chế quyền tối đa có sẵn cho các tài khoản trong một OU. Chương 14. Domain 1.

**Secrets Manager** — Lưu trữ và tự động rotation secret (mật khẩu cơ sở dữ liệu, khóa API). Chương 16. Domain 1.

**Security group** — Một tường lửa ảo có trạng thái ở cấp instance. Chỉ quy tắc allow; lưu lượng trả về tự động. Chương 15. Domain 1.

**Shard (Kinesis)** — Đơn vị thông lượng cơ bản trong Kinesis Data Streams: ghi 1 MB/s, đọc 2 MB/s. Chương 26. Domain 3.

**Mô Hình Trách Nhiệm Chung** — AWS chịu trách nhiệm về bảo mật *của* cloud (cơ sở hạ tầng); bạn chịu trách nhiệm về bảo mật *trong* cloud (dữ liệu, cấu hình, truy cập). Chương 1. Domain 1.

**Shield** — Bảo vệ DDoS. Standard: miễn phí, tự động. Advanced: trả phí, với hỗ trợ DRT và bảo vệ tài chính. Chương 17. Domain 1.

**Snow Family** — Các thiết bị vật lý cho chuyển dữ liệu khối lượng lớn ngoại tuyến (Snowball Edge: 80 TB) — thuê một chuyến bay vận tải hàng hóa thay vì lái xe trên đường cao tốc. Di sản (2026): Snowmobile và Snowcone bị ngừng; các thiết bị Snow đóng cửa với khách hàng mới vào tháng 11 năm 2025 (AWS trỏ đến DataSync và Data Transfer Terminals), nhưng kỳ thi SAA-C03 vẫn kỳ vọng Snowball cho "hàng tuần chuyển, băng thông hạn chế." Chương 25. Domain 3.

**SNS (Simple Notification Service)** — Nhắn tin pub/sub. Đẩy tin nhắn đến tất cả subscriber đồng thời. Mẫu fan-out. Chương 19. Domain 2.

**Sort key (DynamoDB)** — Thành phần thứ hai tùy chọn của khóa chính. Cho phép truy vấn phạm vi trong một partition. Chương 9. Domain 3.

**Spot Instances** — Các instance EC2 dùng năng lực dự phòng với giảm giá 60-90%. Có thể bị gián đoạn với thông báo 2 phút. Chỉ cho khối lượng công việc chịu lỗi. Chương 27. Domain 4.

**SQS (Simple Queue Service)** — Hàng đợi tin nhắn được quản lý. Tách rời producer khỏi consumer. Standard (ít nhất một lần) và FIFO (chính xác một lần) queue. Chương 19. Domain 2.

**Step Functions** — Dịch vụ điều phối quy trình làm việc serverless. State machine để phối hợp các dịch vụ AWS. Chương 22. Domain 2.

**AWS Storage Gateway** — Cầu nối giữa lưu trữ tại chỗ và cloud: trình bày các giao diện NFS/SMB (File), iSCSI (Volume), hoặc băng từ ảo (Tape) cục bộ trong khi lưu giữ dữ liệu trong S3, Glacier, hoặc EBS snapshot. Chương 6. Domain 3.

---

## T

**Target tracking scaling** — Policy Auto Scaling điều chỉnh năng lực để duy trì một giá trị metric mục tiêu (ví dụ, 60% sử dụng CPU). Chương 7. Domain 2.

**AWS Transfer Family** — Endpoint SFTP/FTPS/FTP được quản lý được hỗ trợ bởi S3 hoặc EFS. Đối tác giữ các client SFTP hiện có của họ; tệp hạ cánh trực tiếp vào bucket của bạn. Chương 25. Domain 3.

**Transit Gateway** — Cấu trúc mạng hub-and-spoke kết nối nhiều VPC và mạng tại chỗ qua một gateway trung tâm. Chương 25. Domain 3.

**TTL (Time to Live)** — Một timestamp sau đó DynamoDB tự động xóa một item. Cũng được dùng trong DNS (resolver cache một bản ghi bao lâu) và caching (một giá trị được cache hợp lệ bao lâu). Chương 9, 12. Domain 3.

---

## V

**VIF (Virtual Interface)** — Kết nối logic được dùng với AWS Direct Connect. Public VIF truy cập các endpoint công khai AWS; Private VIF truy cập tài nguyên VPC. Chương 25. Domain 3.

**Visibility timeout (SQS)** — Khoảng thời gian một tin nhắn được nhận bị ẩn khỏi các consumer khác. Cho phép xử lý mà các consumer khác không thấy cùng một tin nhắn. Chương 19. Domain 2.

**VPC (Virtual Private Cloud)** — Một mạng ảo cô lập trong AWS. Chứa subnet, route table và gateway. Chương 11. Domain 1.

**VPC Endpoint** — Kết nối tài nguyên VPC đến các dịch vụ AWS qua mạng riêng AWS. Gateway (miễn phí, S3/DynamoDB) và Interface (tính phí, hầu hết các dịch vụ khác). Chương 30. Domain 1, 4.

**VPC Flow Logs** — Ghi lại thông tin về lưu lượng IP đi đến và đi từ các network interface trong một VPC. Được GuardDuty dùng và cho khắc phục sự cố mạng. Chương 17. Domain 1.

**VPC Peering** — Một kết nối mạng giữa hai VPC cho phép lưu lượng định tuyến giữa chúng dùng địa chỉ IP riêng tư. Chương 11. Domain 3.

---

## W

**WAF (Web Application Firewall)** — Lọc lưu lượng HTTP/HTTPS dùng quy tắc (chặn IP, SQL injection, giới hạn tốc độ). Gắn vào CloudFront, ALB, hoặc API Gateway. Chương 17. Domain 1.

**AWS Wavelength** — Cơ sở hạ tầng AWS được triển khai bên trong mạng của các nhà cung cấp viễn thông 5G tại biên radio. Cho phép độ trễ một chữ số mili giây đến các thiết bị di động. Cho AR/VR di động, game thời gian thực, telemetry xe tự lái và video trực tiếp tại biên 5G. Wavelength Zone là phần mở rộng của AWS Region bên trong mạng viễn thông. Chương 2. Domain 3.

**Well-Architected Framework** — Framework đánh giá sáu trụ cột của AWS: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Chương 31. Liên domain.

**Weighted routing (Route 53)** — Phân phối truy vấn DNS trên các endpoint theo trọng số. Dùng cho triển khai blue-green và kiểm thử A/B. Chương 12. Domain 3.

**Write-through caching** — Cập nhật cache mỗi khi cơ sở dữ liệu được cập nhật. Dữ liệu luôn nhất quán nhưng cache có thể giữ nhiều item không bao giờ được đọc lại. Chương 10. Domain 3.

---

## Tham Khảo Nhanh Mẫu SAA-C03

| Nếu kỳ thi nói...                              | Hãy nghĩ...                                  |
|-----------------------------------------------|----------------------------------------------|
| "Tách rời các dịch vụ"                        | SQS, SNS, EventBridge                        |
| "Fan-out đến nhiều consumer"                  | SNS + subscription SQS                       |
| "Sự kiện có thứ tự thời gian thực"            | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Độ trễ thấp toàn cầu (động)"                 | Global Accelerator                           |
| "Độ trễ thấp toàn cầu (tĩnh/cache)"           | CloudFront                                   |
| "Bảo vệ DDoS"                                 | Shield (Standard: miễn phí; Advanced: trả phí) |
| "Chặn SQL injection tại edge"                 | WAF                                          |
| "Phát hiện thông tin xác thực bị xâm phạm"    | GuardDuty                                    |
| "Kiểm toán hoạt động API"                     | CloudTrail                                   |
| "Rotation thông tin xác thực cơ sở dữ liệu"   | Secrets Manager                              |
| "Mã hóa dữ liệu khi nghỉ, khóa do khách hàng quản lý" | KMS với CMK                          |
| "Lưu trữ giá trị cấu hình"                    | SSM Parameter Store                          |
| "Lưu trữ cơ sở dữ liệu IOPS cao"              | io2 EBS                                      |
| "Hệ thống tệp chia sẻ cho EC2"                | EFS                                          |
| "Truy vấn dữ liệu S3 với SQL"                 | Athena                                       |
| "Đường dẫn ETL cho phân tích"                 | AWS Glue                                     |
| "Giao dữ liệu streaming đến S3"               | Amazon Data Firehose                         |
| "Job batch chịu lỗi, giảm thiểu chi phí"      | Spot Instances                              |
| "Khối lượng công việc sản xuất ổn định, cam kết" | Savings Plans                            |
| "Subnet riêng tư → S3 không qua NAT"          | S3 Gateway Endpoint                          |
| "Subnet riêng tư → SQS không qua NAT"         | SQS Interface Endpoint                       |
| "Multi-AZ cho RDS"                            | Failover tự động (không phải mở rộng đọc)    |
| "Read Replica cho RDS"                        | Mở rộng đọc (không phải failover tự động)    |
| "Thời gian khôi phục 1–2 phút, cross-AZ"      | Multi-AZ (RDS failover: 60–120 giây)         |
| "Khôi phục trên các region, RTO phút"         | Pilot Light hoặc Warm Standby                |
| "Active-Active, RTO bằng không"               | Multi-Region Active-Active (phức tạp nhất)   |
| "Xử lý batch vượt timeout Lambda"             | AWS Batch                                    |
| "Tương thích Redis VÀ bền vững"               | MemoryDB for Redis                           |
| "Kỹ sư từ xa truy cập VPC từ nhà"             | Client VPN                                   |
| "Di chuyển cơ sở dữ liệu với thời gian ngừng tối thiểu" | DMS (+ SCT cho dị thể)             |
| "Dashboard BI trên AWS"                       | QuickSight                                   |
| "Chạy AWS trong trung tâm dữ liệu của riêng bạn" | Outposts                                  |
| "Tính toán biên di động 5G"                   | Wavelength                                   |
