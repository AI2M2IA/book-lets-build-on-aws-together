# Phụ Lục C: Sổ Đăng Ký Khái Niệm

Mỗi khái niệm chính được giới thiệu trong quyển sách, được ánh xạ đến chương, phép so sánh được sử dụng và domain SAA-C03 nơi nó xuất hiện.

Dùng đây như chỉ mục học tập: nếu bạn không rõ về một khái niệm trước kỳ thi, tìm nó ở đây và quay lại chương của nó để có ngữ cảnh.

---

## A

**ACU (Aurora Capacity Unit)** — Đơn vị đo năng lực Aurora Serverless v2. Tự động mở rộng. Chương 24. Domain 3.

**Alarm (CloudWatch)** — Quy tắc kích hoạt khi chỉ số vượt ngưỡng, kích hoạt thông báo hoặc hành động auto scaling. Chương 7. Domain 2.

**ALB (Application Load Balancer)** — Bộ cân bằng tải Layer 7 định tuyến lưu lượng HTTP/HTTPS dựa trên quy tắc đường dẫn và host. Chương 7. Domain 2.

**AMI (Amazon Machine Image)** — Template chứa OS, phần mềm và cấu hình cho instance EC2. Chương 4. Domain 3.

**Tư duy kiến trúc sư** — Hỏi "điều gì hỏng đầu tiên, làm thế nào chúng ta biết, và ai đó làm gì lúc 3 giờ sáng?" thay vì chỉ "điều này hoạt động như thế nào?" Chương 32, Chương 34. Xuyên domain.

**Architecture Decision Record (ADR)** — Tài liệu ngắn nắm bắt quyết định, các lựa chọn thay thế, lý luận và những gì sẽ gây ra xem xét lại. Chương 32. Xuyên domain.

**Architecture review** — Quy trình có cấu trúc bao gồm: ràng buộc → điều không biết → lựa chọn → failure mode → monitoring → runbook. Chương 32. Xuyên domain.

**Athena** — Dịch vụ truy vấn SQL serverless cho dữ liệu trong S3. Trả theo TB được quét. Tốt nhất với định dạng columnar Parquet/ORC. Chương 26. Domain 3.

**Auto Scaling Group (ASG)** — Nhóm instance EC2 được quản lý cùng nhau, tự động thay thế instance không lành mạnh và mở rộng dựa trên tải. Chương 7. Domain 2, 3.

**Availability Zone (AZ)** — Một hoặc nhiều trung tâm dữ liệu tách biệt vật lý trong một region, được kết nối bằng liên kết độ trễ thấp. Chương 2. Domain 2.

---

## B

**Bucket (S3)** — Container cho S3 object. Bucket có tên duy nhất toàn cầu và tồn tại trong một region cụ thể. Chương 5. Domain 3.

**Bucket policy** — Policy dựa trên tài nguyên gắn vào S3 bucket kiểm soát truy cập cho IAM principal và tài khoản bên ngoài. Chương 5. Domain 1.

---

## C

**Mẫu cache-aside** — Ứng dụng kiểm tra cache trước; khi cache miss, truy vấn cơ sở dữ liệu, sau đó lưu kết quả trong cache. Chương 10. Domain 3.

**Tỷ lệ cache hit** — Phần trăm yêu cầu được phục vụ từ cache thay vì origin. Cao hơn là tốt hơn. Chương 13. Domain 3.

**CloudFront** — AWS CDN. Cache nội dung tại 400+ edge location trên toàn thế giới. Giảm độ trễ và chi phí chuyển dữ liệu origin. Chương 13. Domain 3, 4.

**CloudTrail** — Ghi nhật ký mọi lời gọi API AWS: ai, gì, khi nào, từ đâu. Được lưu trong S3. Dùng để kiểm toán và điều tra sự cố. Domain 1.

**CloudWatch** — Chỉ số, log, cảnh báo và dashboard cho tài nguyên AWS và ứng dụng tùy chỉnh. Được tham chiếu xuyên suốt. Tất cả domain.

**Cold start (Lambda)** — Độ trễ khi gọi lần đầu (hoặc sau khi không hoạt động) khi Lambda khởi tạo môi trường thực thi. Dùng provisioned concurrency để loại bỏ. Chương 20. Domain 3.

**Compute Savings Plan** — Cam kết với một mức chi tiêu EC2 theo giờ tính bằng đô la, áp dụng cho bất kỳ loại hoặc kích thước instance nào. Chương 27. Domain 4.

**Config (AWS)** — Theo dõi thay đổi cấu hình tài nguyên AWS theo thời gian và đánh giá tuân thủ theo quy tắc. Chương 31. Domain 1.

**Chuyển dữ liệu Cross-AZ** — Lưu lượng giữa Availability Zone trong cùng region. Tính phí ở $0.01/GB mỗi chiều. Chương 30. Domain 4.

**Sao chép cross-region** — Sao chép dữ liệu (S3 CRR, Aurora Global, DynamoDB Global Tables) đến một region khác. Phát sinh phí chuyển dữ liệu. Chương 18, 30. Domain 2.

---

## D

**DAX (DynamoDB Accelerator)** — Cache trong bộ nhớ dành riêng cho DynamoDB. Độ trễ đọc micro giây. Chương 9. Domain 3.

**Dead Letter Queue (DLQ)** — Hàng đợi nơi tin nhắn thất bại xử lý lặp đi lặp lại được gửi đến, ngăn chặn tắc nghẽn hàng đợi. Chương 19. Domain 2.

**Dedicated Host** — Máy chủ EC2 vật lý được dành riêng cho mục đích sử dụng của bạn. Cần thiết cho một số giấy phép phần mềm. Chương 27. Domain 4.

**Bảo vệ theo chiều sâu** — Xếp lớp nhiều kiểm soát bảo mật (IAM + security group + NACL + WAF + GuardDuty) để sự xâm phạm một lớp không để lộ hệ thống. Chương 33. Domain 1.

**Direct Connect** — Kết nối mạng private dành riêng từ vị trí on-premises đến AWS. Nhất quán hơn VPN. Chương 25. Domain 3.

**DLQ** — Xem Dead Letter Queue.

**DynamoDB** — Cơ sở dữ liệu NoSQL được quản lý hoàn toàn với độ trễ mili giây một chữ số ở mọi quy mô. Mô hình key-value và document. Chương 9. Domain 3.

**DynamoDB Auto Scaling** — Tự động điều chỉnh năng lực đọc/ghi được cấp phát dựa trên chỉ số CloudWatch. Chương 29. Domain 4.

**DynamoDB Streams** — Nhật ký thay đổi có thứ tự theo thời gian của tất cả thay đổi item trong bảng DynamoDB. Dùng với Lambda để xử lý event-driven. Chương 9. Domain 2.

---

## E

**EBS (Elastic Block Store)** — Block storage được gắn vào một instance EC2 duy nhất. Tồn tại độc lập. Loại: gp3, io2, st1. Chương 6. Domain 3.

**EC2 (Elastic Compute Cloud)** — Máy ảo trên cloud. Chương 4. Domain 3.

**ECS (Elastic Container Service)** — Điều phối container được quản lý. Fargate launch type loại bỏ quản lý máy chủ. Chương 21. Domain 2, 3.

**EFS (Elastic File System)** — Hệ thống tệp NFS chia sẻ có thể truy cập từ nhiều instance EC2. Tự động mở rộng. Chương 6. Domain 3.

**EKS (Elastic Kubernetes Service)** — Control plane Kubernetes được quản lý trên AWS. Chương 21. Domain 3.

**ElastiCache** — Caching trong bộ nhớ được quản lý. Redis (tính năng phong phú hơn) hoặc Memcached (đơn giản hơn). Chương 10. Domain 3.

**Elastic IP** — Địa chỉ IP công cộng tĩnh bạn có thể cấp phát và liên kết lại với các instance EC2. Chương 11. Domain 3.

**Envelope encryption** — Mẫu trong đó dữ liệu được mã hóa với data key (DEK), và DEK được mã hóa với master key (CMK trong KMS). Chương 16. Domain 1.

**EventBridge** — Event bus để định tuyến sự kiện từ dịch vụ AWS, đối tác SaaS và nguồn tùy chỉnh đến target. Hỗ trợ quy tắc theo lịch. Chương 22. Domain 2.

**Explicit deny** — Câu lệnh deny IAM không thể bị ghi đè bởi bất kỳ allow nào. Ưu tiên hơn tất cả allow. Chương 3. Domain 1.

---

## F

**Failover routing (Route 53)** — Định tuyến lưu lượng đến endpoint phụ khi endpoint chính thất bại health check. Chương 12. Domain 2.

**Fargate** — Engine tính toán serverless cho ECS và EKS. Không có instance EC2 để quản lý. Chương 21. Domain 3.

**Mẫu fan-out** — Một SNS topic phân phối cùng tin nhắn đến nhiều hàng đợi SQS đồng thời. Chương 19. Domain 2.

**Hàng đợi FIFO (SQS)** — Xử lý chính xác một lần, thứ tự nghiêm ngặt. Thông lượng thấp hơn hàng đợi standard. Chương 19. Domain 2.

**Failure mode** — Cách cụ thể hệ thống có thể bị lỗi. Xác định failure mode trước production là cốt lõi của architecture review. Chương 32. Xuyên domain.

---

## G

**Gateway Endpoint** — Loại VPC endpoint miễn phí cho S3 và DynamoDB. Định tuyến lưu lượng qua mạng private AWS, loại bỏ phí NAT Gateway. Chương 30. Domain 4.

**Geolocation routing (Route 53)** — Định tuyến dựa trên vị trí địa lý của nguồn truy vấn DNS. Chương 12. Domain 3.

**Global Accelerator** — Định tuyến lưu lượng đến edge AWS gần nhất qua Anycast, cải thiện độ trễ cho ứng dụng động. Chương 25. Domain 3.

**Glue (AWS)** — ETL serverless. Glue Crawler khám phá schema; Glue Job chuyển đổi dữ liệu; Data Catalog lưu trữ metadata. Chương 26. Domain 3.

**GSI (Global Secondary Index)** — Index thay thế trên bảng DynamoDB với partition key và sort key tùy chọn khác. Cho phép các mẫu truy vấn linh hoạt. Chương 9. Domain 3.

**GuardDuty** — Dịch vụ phát hiện mối đe dọa sử dụng ML trên CloudTrail, VPC Flow Logs và log DNS để phát hiện hoạt động bất thường. Chương 17. Domain 1.

---

## H

**Health check (Route 53)** — Theo dõi tính khả dụng của endpoint. Health check thất bại kích hoạt failover routing. Chương 12. Domain 2.

**Hot partition (DynamoDB)** — Partition nhận lưu lượng không cân đối vì nhiều yêu cầu có cùng partition key. Chương 9. Domain 3.

---

## I

**IAM (Identity and Access Management)** — Kiểm soát xác thực và ủy quyền cho tài khoản AWS. User, group, role, policy. Chương 3, 14. Domain 1.

**IAM role** — IAM identity với thông tin xác thực tạm thời, được đảm nhận bởi dịch vụ, người dùng hoặc tài khoản khác. Chương 3, 14. Domain 1.

**Idempotency** — Thuộc tính của một thao tác tạo ra cùng kết quả dù được gọi một lần hay nhiều lần. Quan trọng cho hệ thống phân tán (hoàn tiền, thanh toán, xử lý đơn hàng). Chương 32. Xuyên domain.

**Idempotency key** — Định danh duy nhất cho một thao tác, được kiểm tra trước khi thực thi để ngăn xử lý trùng lặp. Chương 32. Xuyên domain.

**Interface Endpoint (PrivateLink)** — VPC endpoint cho hầu hết các dịch vụ AWS. Tính phí theo giờ + mỗi GB. Cung cấp kết nối private mà không cần internet hoặc NAT. Chương 30. Domain 4.

**Internet Gateway (IGW)** — Cho phép instance trong public subnet giao tiếp với internet. Yêu cầu bảng định tuyến của subnet có route đến IGW. Chương 11. Domain 3.

**"Tùy thuộc"** — Câu trả lời trung thực cho hầu hết câu hỏi kiến trúc, phải luôn được hoàn thành: "Tùy thuộc vào mẫu truy cập / quy mô / hậu quả thất bại / ràng buộc chi phí." Chương 33. Xuyên domain.

---

## K

**Kinesis Data Firehose** — Phân phối được quản lý dữ liệu streaming đến S3, Redshift, OpenSearch. Không quản lý consumer. Chương 26. Domain 3.

**Kinesis Data Streams** — Stream sự kiện có thứ tự thời gian thực. Bền vững, có thể phát lại. Đo bằng shard. Chương 26. Domain 3.

**KMS (Key Management Service)** — Tạo, lưu trữ và kiểm soát khóa mã hóa cho mã hóa tại chỗ. Chương 16. Domain 1.

---

## L

**Lambda** — Hàm serverless được kích hoạt bởi sự kiện. Trả theo lần gọi và mỗi ms. Thời gian tối đa 15 phút. Chương 20. Domain 2, 3, 4.

**Lambda@Edge** — Lambda function chạy tại các edge location CloudFront, sửa đổi yêu cầu và phản hồi. Chương 13. Domain 3.

**Latency-based routing (Route 53)** — Định tuyến truy vấn DNS đến AWS region với độ trễ đo thấp nhất. Chương 12. Domain 3.

**Launch template** — Template phiên bản chỉ định cấu hình instance EC2 cho Auto Scaling Group. Chương 7. Domain 3.

**Đặc quyền tối thiểu** — Thực hành tốt nhất IAM: chỉ cấp quyền cần thiết, không hơn. Chương 3. Domain 1.

**Chính sách lifecycle (S3)** — Quy tắc tự động chuyển object đến storage class rẻ hơn hoặc xóa chúng dựa trên tuổi. Chương 23. Domain 4.

**LSI (Local Secondary Index)** — Index thay thế trên bảng DynamoDB sử dụng cùng partition key nhưng sort key khác. Phải được tạo khi tạo bảng. Chương 9. Domain 3.

---

## M

**Memcached** — Engine caching trong bộ nhớ đơn giản, đa luồng. Không có tính bền vững, không có cấu trúc dữ liệu. Dùng Redis trừ khi bạn cần đa luồng với chi phí tính năng. Chương 10. Domain 3.

**Multi-AZ (RDS)** — Bản sao standby đồng bộ trong AZ khác với failover tự động. RPO ~0, RTO ~60 giây. Để khả dụng cao, không phải mở rộng đọc. Chương 8, 18. Domain 2.

**Multi-Region** — Triển khai các thành phần ứng dụng trên nhiều AWS region để dự phòng địa lý và hiệu suất toàn cầu. Độ phức tạp và chi phí cao hơn. Chương 18. Domain 2.

---

## N

**NACL (Network Access Control List)** — Tường lửa stateless ở cấp subnet. Yêu cầu cả quy tắc inbound và outbound. Quy tắc được đánh giá theo thứ tự số. Chương 15. Domain 1.

**NAT Gateway** — Cho phép instance trong private subnet thực hiện kết nối outbound đến internet. Tính phí $0.045/GB được xử lý. Chương 11, 30. Domain 4.

---

## O

**Object (S3)** — Tệp được lưu trong S3. Bao gồm key (tên), value (dữ liệu) và metadata. Kích thước tối đa 5TB. Chương 5. Domain 3.

**Năng lực On-Demand (DynamoDB)** — Chế độ trả theo yêu cầu. Đắt hơn mỗi yêu cầu so với được cấp phát, nhưng không cần lập kế hoạch năng lực. Chương 29. Domain 4.

**Instance On-Demand (EC2)** — Trả theo giờ mà không có cam kết. Linh hoạt tối đa, giá tối đa. Chương 27. Domain 4.

---

## P

**Partition key (DynamoDB)** — Thành phần primary key xác định partition nào lưu trữ item. Chọn key có cardinality cao để phân phối đều. Chương 9. Domain 3.

**Permission boundary** — Chính sách IAM đặt quyền tối đa mà IAM identity có thể có, ngay cả khi các policy khác cấp nhiều hơn. Chương 14. Domain 1.

**Placement group** — Kiểm soát vị trí vật lý của các instance EC2 để giảm thiểu độ trễ (cluster) hoặc tối đa hóa khả dụng (spread). Chương 4. Domain 3.

**PrivateLink** — Dịch vụ AWS để tạo endpoint private đến dịch vụ được lưu trữ trong AWS, có thể truy cập qua Interface Endpoints. Chương 30. Domain 1.

**Provisioned concurrency (Lambda)** — Môi trường thực thi được khởi tạo trước loại bỏ độ trễ cold start. Chương 20. Domain 3.

**Năng lực được cấp phát (DynamoDB)** — Thông lượng đọc và ghi được phân bổ trước, đo bằng đơn vị năng lực mỗi giây. Rẻ hơn on-demand cho lưu lượng có thể dự đoán. Chương 9, 29. Domain 4.

---

## R

**RDS (Relational Database Service)** — Cơ sở dữ liệu quan hệ được quản lý. Xử lý backup, vá lỗi, failover. Chương 8. Domain 3.

**RDS Proxy** — Quản lý connection pool giữa Lambda/ứng dụng và RDS, ngăn cạn kiệt kết nối. Chương 8. Domain 3.

**Read Replica (RDS)** — Bản sao không đồng bộ của cơ sở dữ liệu để mở rộng đọc. KHÔNG cung cấp failover tự động. Chương 8, 24. Domain 3.

**Redis** — Kho cấu trúc dữ liệu trong bộ nhớ dùng để caching, quản lý phiên, bảng xếp hạng thời gian thực, pub/sub. Chương 10. Domain 3.

**Reserved Instance (EC2)** — Cam kết sử dụng loại instance cụ thể trong region cụ thể trong 1 hoặc 3 năm để được giảm giá. Chương 27. Domain 4.

**Route 53** — Dịch vụ DNS AWS và đăng ký tên miền. Hỗ trợ nhiều chính sách định tuyến. Chương 12. Domain 2, 3.

**RPO (Recovery Point Objective)** — Mất dữ liệu tối đa có thể chấp nhận được đo bằng thời gian. "Chúng ta có thể chịu mất bao nhiêu dữ liệu?" Chương 18. Domain 2.

**RTO (Recovery Time Objective)** — Thời gian tối đa có thể chấp nhận được để khôi phục dịch vụ sau thất bại. "Chúng ta có thể bị down bao lâu?" Chương 18. Domain 2.

**Runbook** — Hướng dẫn từng bước để vận hành hệ thống, đặc biệt để phản ứng sự cố. "Ai đó làm gì lúc 3 giờ sáng?" Chương 32. Xuyên domain.

---

## S

**S3 Intelligent-Tiering** — Tự động di chuyển S3 object giữa các tầng truy cập dựa trên mẫu truy cập. Không tính phí truy xuất. Chương 23. Domain 4.

**S3 Select** — Truy xuất một phần nội dung S3 object sử dụng SQL expression, giảm chuyển dữ liệu. Chương 30. Domain 4.

**Savings Plan** — Mô hình giá linh hoạt cam kết với mức chi tiêu theo giờ để được giảm giá. Linh hoạt hơn Reserved Instances. Chương 27. Domain 4.

**SCP (Service Control Policy)** — Chính sách AWS Organizations hạn chế quyền tối đa có sẵn cho các tài khoản trong OU. Chương 14. Domain 1.

**Secrets Manager** — Lưu trữ và tự động xoay vòng bí mật (mật khẩu cơ sở dữ liệu, API key). Chương 16. Domain 1.

**Security group** — Tường lửa ảo stateful ở cấp instance. Chỉ quy tắc allow; lưu lượng trả về tự động. Chương 15. Domain 1.

**Shard (Kinesis)** — Đơn vị thông lượng cơ bản trong Kinesis Data Streams: 1 MB/s ghi, 2 MB/s đọc. Chương 26. Domain 3.

**Mô Hình Trách Nhiệm Chia Sẻ** — AWS chịu trách nhiệm về bảo mật *của* cloud (cơ sở hạ tầng); bạn chịu trách nhiệm về bảo mật *trong* cloud (dữ liệu, cấu hình, truy cập). Chương 1. Domain 1.

**Shield** — Bảo vệ DDoS. Standard: miễn phí, tự động. Advanced: trả phí, với hỗ trợ DRT và bảo vệ tài chính. Chương 17. Domain 1.

**SNS (Simple Notification Service)** — Nhắn tin pub/sub. Đẩy tin nhắn đến tất cả subscriber đồng thời. Mẫu fan-out. Chương 19. Domain 2.

**Sort key (DynamoDB)** — Thành phần tùy chọn thứ hai của primary key. Cho phép truy vấn phạm vi trong một partition. Chương 9. Domain 3.

**Spot Instances** — Instance EC2 sử dụng năng lực dự phòng giảm 60-90%. Có thể bị gián đoạn với thông báo 2 phút. Chỉ cho khối lượng công việc chịu lỗi. Chương 27. Domain 4.

**SQS (Simple Queue Service)** — Hàng đợi tin nhắn được quản lý. Tách rời producer khỏi consumer. Hàng đợi Standard (ít nhất một lần) và FIFO (chính xác một lần). Chương 19. Domain 2.

**Step Functions** — Dịch vụ điều phối workflow serverless. State machine để phối hợp dịch vụ AWS. Chương 22. Domain 2.

---

## T

**Target tracking scaling** — Chính sách Auto Scaling điều chỉnh năng lực để duy trì giá trị chỉ số mục tiêu (ví dụ: 60% CPU). Chương 7. Domain 2.

**Transit Gateway** — Cấu trúc mạng hub-and-spoke kết nối nhiều VPC và mạng on-premises qua gateway trung tâm. Chương 25. Domain 3.

**TTL (Time to Live)** — Dấu thời gian sau đó DynamoDB tự động xóa item. Cũng được dùng trong DNS (thời gian resolver cache bản ghi) và caching (thời gian giá trị cache hợp lệ). Chương 9, 12. Domain 3.

---

## V

**VIF (Virtual Interface)** — Kết nối logic được dùng với AWS Direct Connect. Public VIF truy cập endpoint công khai AWS; Private VIF truy cập tài nguyên VPC. Chương 25. Domain 3.

**Visibility timeout (SQS)** — Khoảng thời gian trong đó tin nhắn được nhận bị ẩn khỏi các consumer khác. Cho phép xử lý mà không có consumer khác nhìn thấy cùng tin nhắn. Chương 19. Domain 2.

**VPC (Virtual Private Cloud)** — Mạng ảo được cô lập trong AWS. Chứa subnet, bảng định tuyến và gateway. Chương 11. Domain 1.

**VPC Endpoint** — Kết nối tài nguyên VPC đến dịch vụ AWS qua mạng private AWS. Gateway (miễn phí, S3/DynamoDB) và Interface (có giá, hầu hết các dịch vụ khác). Chương 30. Domain 1, 4.

**VPC Flow Logs** — Ghi lại thông tin về lưu lượng IP đến và đi từ network interface trong VPC. Được sử dụng bởi GuardDuty và để khắc phục sự cố mạng. Chương 17. Domain 1.

**VPC Peering** — Kết nối mạng giữa hai VPC cho phép lưu lượng định tuyến giữa chúng sử dụng địa chỉ IP private. Chương 11. Domain 3.

---

## W

**WAF (Web Application Firewall)** — Lọc lưu lượng HTTP/HTTPS sử dụng quy tắc (chặn IP, SQL injection, giới hạn tốc độ). Gắn vào CloudFront, ALB hoặc API Gateway. Chương 17. Domain 1.

**Well-Architected Framework** — Khung đánh giá sáu trụ cột của AWS: Xuất Sắc Vận Hành, Bảo Mật, Độ Tin Cậy, Hiệu Quả Hiệu Suất, Tối Ưu Hóa Chi Phí, Bền Vững. Chương 31. Xuyên domain.

**Weighted routing (Route 53)** — Phân phối truy vấn DNS trên các endpoint theo trọng số. Dùng cho triển khai blue-green và kiểm thử A/B. Chương 12. Domain 3.

**Write-through caching** — Cập nhật cache bất cứ khi nào cơ sở dữ liệu được cập nhật. Dữ liệu luôn nhất quán nhưng cache có thể chứa nhiều item không bao giờ được đọc lại. Chương 10. Domain 3.

---

## Tài Liệu Tham Khảo Nhanh Mẫu SAA-C03

| Nếu kỳ thi nói...                              | Hãy nghĩ đến...                                      |
|------------------------------------------------|------------------------------------------------------|
| "Tách rời dịch vụ"                             | SQS, SNS, EventBridge                                |
| "Fan-out đến nhiều consumer"                   | SNS + SQS subscription                               |
| "Sự kiện có thứ tự thời gian thực"             | Kinesis Data Streams                                 |
| "Serverless"                                   | Lambda, DynamoDB, Aurora Serverless, Fargate         |
| "Độ trễ thấp toàn cầu (động)"                  | Global Accelerator                                   |
| "Độ trễ thấp toàn cầu (tĩnh/cache)"            | CloudFront                                           |
| "Bảo vệ DDoS"                                  | Shield (Standard: miễn phí; Advanced: trả phí)       |
| "Chặn SQL injection tại edge"                  | WAF                                                  |
| "Phát hiện thông tin xác thực bị xâm phạm"     | GuardDuty                                            |
| "Kiểm toán hoạt động API"                      | CloudTrail                                           |
| "Xoay vòng thông tin xác thực cơ sở dữ liệu"   | Secrets Manager                                      |
| "Mã hóa dữ liệu tại chỗ, khóa do khách hàng quản lý" | KMS với CMK                                  |
| "Lưu trữ giá trị cấu hình"                     | SSM Parameter Store                                  |
| "Lưu trữ cơ sở dữ liệu IOPS cao"               | io2 EBS                                              |
| "Hệ thống tệp chia sẻ cho EC2"                 | EFS                                                  |
| "Truy vấn dữ liệu S3 bằng SQL"                 | Athena                                               |
| "ETL pipeline cho analytics"                   | AWS Glue                                             |
| "Phân phối dữ liệu streaming đến S3"            | Kinesis Firehose                                     |
| "Công việc batch chịu lỗi, giảm thiểu chi phí" | Spot Instances                                       |
| "Khối lượng công việc production cam kết, ổn định" | Savings Plans                                     |
| "Private subnet → S3 không có NAT"             | S3 Gateway Endpoint                                  |
| "Private subnet → SQS không có NAT"            | SQS Interface Endpoint                               |
| "Multi-AZ cho RDS"                             | Failover tự động (không phải mở rộng đọc)            |
| "Read Replica cho RDS"                         | Mở rộng đọc (không phải failover tự động)           |
| "Thời gian phục hồi < 1 phút, cross-AZ"        | Multi-AZ                                             |
| "Phục hồi trên region, RTO vài phút"           | Pilot Light hoặc Warm Standby                        |
| "Active-Active, RTO bằng không"                | Multi-Region Active-Active (phức tạp nhất)           |
