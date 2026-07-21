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

**AWS Batch** *(Chương 21)*

Tính toán batch được quản lý cho Docker container. Bạn định nghĩa một job (Docker image + lệnh), một job queue và một compute environment (EC2 hoặc Fargate). AWS Batch tự động cấp phát và mở rộng tính toán, sau đó chấm dứt khi job hoàn tất. Hỗ trợ Spot Instances để giảm chi phí.

Các khái niệm chính: Job definition (chạy gì), job queue (nơi job chờ), compute environment (EC2 hoặc Fargate, On-Demand hoặc Spot), array job (chạy nhiều bản sao song song của cùng một job).

Tín hiệu kỳ thi: "Xử lý batch vượt quá thời gian chờ 15 phút của Lambda," "job tính toán hữu hạn trên container," "khối lượng công việc HPC trên AWS" → AWS Batch.

---

**AWS Outposts** *(Chương 2)*

Một rack phần cứng AWS được quản lý hoàn toàn, được lắp đặt trong trung tâm dữ liệu của riêng bạn hoặc cơ sở co-location. Chạy cùng các dịch vụ, API và công cụ AWS như public cloud (EC2, EBS, RDS, EKS, S3 trên Outposts) nhưng đặt vật lý tại chỗ.

Các khái niệm chính: Cùng API AWS tại chỗ, AWS quản lý lắp đặt và vá lỗi, khách hàng cung cấp không gian rack và nguồn điện, Local Gateway (LGW) kết nối Outposts với mạng tại chỗ.

Tín hiệu kỳ thi: "Chạy AWS trong trung tâm dữ liệu của riêng bạn," "yêu cầu trú ngụ dữ liệu buộc tính toán phải ở tại chỗ," "API AWS không phụ thuộc internet" → Outposts.

---

**AWS Wavelength** *(Chương 2)*

Cơ sở hạ tầng AWS được triển khai bên trong mạng của các nhà cung cấp viễn thông 5G. Wavelength Zone nằm tại biên mạng 5G, cho phép độ trễ một chữ số mili giây đến các thiết bị di động.

Các khái niệm chính: Wavelength Zone là phần mở rộng của AWS Region bên trong mạng viễn thông, lưu lượng ở lại trên mạng nhà mạng giữa thiết bị và Wavelength Zone.

Tín hiệu kỳ thi: "Độ trễ một chữ số mili giây đến người dùng di động 5G," "AR/VR di động," "game thời gian thực trên di động," "telemetry xe tự lái" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Chương 25)*

Dịch vụ di chuyển kiểu rehost (lift-and-shift). Một agent sao chép đĩa của các máy chủ nguồn từng block một vào một khu vực staging chi phí thấp trên AWS; bạn khởi chạy các bản sao kiểm thử theo nhu cầu; tại thời điểm cutover, MGN chuyển đổi các máy chủ đã sao chép thành các instance EC2 nguyên bản. Không cần thay đổi ứng dụng.

Các khái niệm chính: Sao chép liên tục cấp block, khu vực staging, khởi chạy kiểm thử trước cutover, các chiến lược di chuyển "7 Rs" (MGN = rehost).

Tín hiệu kỳ thi: "Di chuyển hàng trăm VM nhanh chóng không thay đổi code," "lift-and-shift máy chủ sang EC2" → MGN. DataSync di chuyển *tệp*; DMS di chuyển *cơ sở dữ liệu*; MGN di chuyển *toàn bộ máy chủ*.

---

## Lưu Trữ

**S3 — Simple Storage Service** *(Chương 5)*

Object storage. Dung lượng không giới hạn, độ bền 99.999999999% (mười một số chín). Lưu trữ tệp như object trong bucket. Bucket tồn tại trong một region. Object có thể từ 0 byte đến 5TB.

Các khái niệm chính: Bucket policy, object ACL, versioning, static website hosting, presigned URL, multipart upload, Transfer Acceleration, storage class (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, cùng với S3 Express One Zone cho các khối lượng công việc directory-bucket một-AZ, nhạy độ trễ).

Tín hiệu kỳ thi: "Lưu trữ và truy xuất tệp," "asset tĩnh," "backup," "data lake" → S3. Storage class đúng phụ thuộc vào tần suất truy cập và tốc độ truy xuất.

---

**EBS — Elastic Block Store** *(Chương 6)*

Block storage được gắn vào một instance EC2 duy nhất. Hoạt động như ổ cứng. Tồn tại độc lập với vòng đời instance (bạn có thể tách và gắn lại). Loại phổ biến nhất: gp3 (SSD mục đích chung, mặc định), io2 (IOPS được cấp phát cho cơ sở dữ liệu), st1 (HDD được tối ưu hóa thông lượng cho lần đọc tuần tự).

Các khái niệm chính: Snapshot (tăng dần, lưu trong S3), mã hóa (KMS), Multi-Attach (chỉ io1/io2), cấp phát IOPS và thông lượng.

Tín hiệu kỳ thi: "Lưu trữ bền vững cho EC2," "lưu trữ cơ sở dữ liệu," "cần truy cập block độ trễ thấp" → EBS.

---

**EFS — Elastic File System** *(Chương 6)*

Hệ thống tệp chia sẻ, có thể truy cập từ nhiều instance EC2 đồng thời. Giao thức NFS. Tự động mở rộng. Đắt hơn EBS mỗi GB. Các storage class bao gồm Standard, Infrequent Access và Archive. Intelligent-Tiering tự động di chuyển tệp.

Tín hiệu kỳ thi: "Hệ thống tệp chia sẻ," "nhiều instance EC2 cần cùng tệp," "NFS" → EFS.

---

**Họ FSx** *(Chương 6)*

Máy chủ tệp được quản lý cho các công nghệ có tên cụ thể. FSx for Windows File Server: giao thức SMB, NTFS, tích hợp Active Directory, Multi-AZ. FSx for Lustre: hệ thống tệp hiệu năng cao song song cho HPC/ML, trình bày object S3 như tệp (lazy loading). FSx for NetApp ONTAP: đa giao thức (NFS + SMB + iSCSI), snapshot, sao chép SnapMirror. FSx for OpenZFS: NFS độ trễ thấp, snapshot tức thời và clone có thể ghi.

Tín hiệu kỳ thi: "SMB/Active Directory" → FSx for Windows. "Huấn luyện HPC/ML trên dữ liệu S3" → FSx for Lustre. "NFS và SMB đến cùng dữ liệu / di chuyển NetApp" → FSx for ONTAP. "Di chuyển ZFS / clone tức thời" → FSx for OpenZFS.

---

**Storage Class S3 và Chính Sách Lifecycle** *(Chương 23)*

S3 Intelligent-Tiering tự động di chuyển object giữa các tầng truy cập dựa trên tần suất truy cập. Chính sách lifecycle chuyển object giữa các class (Standard → Standard-IA → Glacier) dựa trên các quy tắc tuổi. Các storage class Glacier có độ trễ truy xuất từ mili giây (Glacier Instant Retrieval) đến 12 giờ (Glacier Deep Archive).

Tín hiệu kỳ thi: "Giảm chi phí lưu trữ cho dữ liệu truy cập không thường xuyên" → chính sách lifecycle, Intelligent-Tiering, hoặc Glacier.

---

**AWS Storage Gateway** *(Chương 6)*

Dịch vụ lưu trữ lai kết nối các môi trường tại chỗ với lưu trữ AWS. Trình bày lưu trữ qua các giao thức mà ứng dụng đã hiểu trong khi lưu giữ dữ liệu trong S3, S3 Glacier, hoặc dưới dạng EBS snapshot.

Các khái niệm chính: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, chế độ cached hoặc stored), Tape Gateway (thư viện băng từ ảo → Glacier).

Tín hiệu kỳ thi: "Ứng dụng tại chỗ cần lưu trữ cloud mà không thay đổi code" → Storage Gateway. "Thay thế sao lưu băng từ" → Tape Gateway.

---

**AWS DataSync** *(Chương 25)*

Dịch vụ di chuyển và sao chép dữ liệu dựa trên agent. Một agent nhẹ kết nối với các máy chủ tệp tại chỗ qua NFS hoặc SMB và đồng bộ hóa các share đến S3, EFS, hoặc FSx — với lập lịch, điều tiết băng thông và xác minh toàn vẹn tích hợp sẵn.

Các khái niệm chính: DataSync agent (VM tại chỗ hoặc EC2), nguồn NFS/SMB, đích S3/EFS/FSx, chuyển tăng dần theo lịch.

Tín hiệu kỳ thi: "Di chuyển hoặc đồng bộ liên tục số lượng lớn tệp từ NAS tại chỗ sang AWS qua mạng" → DataSync.

---

**AWS Transfer Family** *(Chương 25)*

Máy chủ SFTP, FTPS và FTP được quản lý hoàn toàn, được hỗ trợ bởi S3 hoặc EFS làm đích lưu trữ. Client kết nối bằng phần mềm SFTP hiện có của họ; các tệp được tải lên hạ cánh trực tiếp vào một bucket hoặc hệ thống tệp.

Các khái niệm chính: Endpoint được quản lý (tùy chọn với IP tĩnh), lưu trữ nền S3 hoặc EFS, tương thích giao thức hiện có cho các đối tác bên ngoài.

Tín hiệu kỳ thi: "Đối tác phải tiếp tục tải lên qua SFTP, nhưng tệp nên hạ cánh trong S3" → Transfer Family.

---

**AWS Snow Family** *(Chương 25)*

Các thiết bị chuyển dữ liệu vật lý cho di chuyển dữ liệu khối lượng lớn, ngoại tuyến. Snowball Edge Storage Optimized: 80 TB sử dụng được, vỏ bọc gia cố, được vận chuyển đến vị trí của bạn; bạn nạp dữ liệu cục bộ và gửi lại để nhập vào S3.

Các khái niệm chính: Hãy làm phép toán chuyển trước — nếu chuyển qua mạng mất khoảng một tuần hoặc hơn, một thiết bị vật lý thắng. *Lưu ý di sản (2026)*: AWS đã và đang ngừng họ này — Snowmobile (2024) và Snowcone (cuối 2024) đã biến mất, và các thiết bị Snow đóng cửa với khách hàng mới vào tháng 11 năm 2025 (AWS hiện trỏ đến DataSync và Data Transfer Terminals). Ngân hàng câu hỏi SAA-C03 có trước điều này, nên kỳ thi vẫn kỳ vọng Snowball là đáp án.

Tín hiệu kỳ thi: "Di chuyển quy mô petabyte," "băng thông hạn chế, hàng tuần thời gian chuyển" → Snow Family.

---

**AWS Backup** *(Chương 18 và 23)*

Dịch vụ sao lưu tập trung, dựa trên chính sách trên EBS, RDS, DynamoDB, EFS và Storage Gateway. Backup plan định nghĩa lịch trình và lưu giữ; vault lưu trữ các recovery point.

Các khái niệm chính: Backup plan và vault, bản sao cross-region và cross-account, Vault Lock cho tính bất biến.

Tín hiệu kỳ thi: "Tập trung và tự động hóa sao lưu trên nhiều dịch vụ AWS," "bản sao sao lưu cross-account để bảo vệ chống ransomware/xâm phạm tài khoản" → AWS Backup.

---

## Cơ Sở Dữ Liệu

**RDS — Relational Database Service** *(Chương 8)*

Cơ sở dữ liệu quan hệ được quản lý. Các engine được hỗ trợ: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, và Aurora (engine độc quyền của AWS). AWS xử lý backup, vá lỗi, failover và sao chép. Bạn quản lý thiết kế schema, truy vấn và kích thước instance.

Các khái niệm chính: Multi-AZ deployment (failover tự động, sao chép đồng bộ), Read Replicas (không đồng bộ, để mở rộng đọc), backup tự động (lưu giữ 1-35 ngày), snapshot thủ công (giữ cho đến khi bị xóa), RDS Proxy (connection pooling).

Tín hiệu kỳ thi: "Cơ sở dữ liệu quan hệ," "giao dịch ACID," "khối lượng công việc SQL hiện có" → RDS hoặc Aurora.

---

**Aurora** *(Chương 24)*

Engine cơ sở dữ liệu quan hệ của AWS, tương thích với MySQL và PostgreSQL. Engine lưu trữ phân tán sao chép dữ liệu trên 3 AZ trong 6 bản sao. Thường nhanh hơn MySQL 5 lần. Aurora Serverless v2 tự động mở rộng năng lực (được đo bằng ACU — Aurora Capacity Units) và, trên các phiên bản engine được hỗ trợ, có thể tự động tạm dừng về 0 ACU khi không có kết nối nào được giữ mở.

Các khái niệm chính: Aurora cluster (writer + lên đến 15 Aurora Replicas phía sau một reader endpoint duy nhất), Aurora Global Database (read replica cross-region với độ trễ sao chép < 1 giây), Aurora Serverless v2, ACU, hành vi tự động tạm dừng/tiếp tục.

Tín hiệu kỳ thi: "Cơ sở dữ liệu quan hệ hiệu suất cao," "tương thích MySQL/PostgreSQL," "lượng đọc toàn cầu," "khối lượng công việc biến đổi" → Aurora.

---

**DynamoDB** *(Chương 9)*

Cơ sở dữ liệu NoSQL được quản lý hoàn toàn. Mô hình key-value và document. Mở rộng đến bất kỳ thông lượng nào với hiệu suất mili giây một chữ số. Hai chế độ năng lực: on-demand (trả theo yêu cầu) và được cấp phát (trả theo đơn vị năng lực mỗi giờ, với Auto Scaling).

Các khái niệm chính: Partition key (bắt buộc), sort key (tùy chọn), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (change data capture), DynamoDB Accelerator (DAX) — cache trong bộ nhớ, TTL (Time to Live), giao dịch.

Tín hiệu kỳ thi: "Truy cập dựa trên khóa thông lượng cao," "schema linh hoạt," "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Chương 10)*

Caching trong bộ nhớ được quản lý. Hai engine: Redis (bền vững, pub/sub, scripting Lua, cấu trúc dữ liệu) và Memcached (cache thuần túy, đơn giản hơn, đa luồng). Dùng để giảm tải cơ sở dữ liệu và phục vụ dữ liệu được đọc thường xuyên trong vài micro giây.

Các khái niệm chính: Mẫu cache-aside, mẫu write-through, chính sách eviction, TTL, cluster mode (Redis), Multi-AZ với failover tự động.

Tín hiệu kỳ thi: "Giảm tải cơ sở dữ liệu," "độ trễ đọc dưới mili giây," "quản lý session," "bảng xếp hạng thời gian thực" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Chương 10)*

Cơ sở dữ liệu chính trong bộ nhớ, bền vững, tương thích Redis. Khác với ElastiCache (là một cache nơi mất dữ liệu là chấp nhận được), MemoryDB lưu một transaction log Multi-AZ và đảm bảo độ bền. Bạn có thể dùng MemoryDB làm cơ sở dữ liệu chính của mình — không chỉ là cache đứng trước một cơ sở dữ liệu khác.

Các khái niệm chính: Tương thích Redis API, transaction log Multi-AZ (đảm bảo độ bền), hiệu suất trong bộ nhớ, cơ sở dữ liệu chính (không phải lớp cache).

Tín hiệu kỳ thi: "Tương thích Redis VÀ mất dữ liệu là không chấp nhận được," "cơ sở dữ liệu trong bộ nhớ bền vững" → MemoryDB. "Redis làm cache, mất dữ liệu chấp nhận được" → ElastiCache Redis.

---

**Cơ Sở Dữ Liệu Chuyên Dụng** *(Chương 9, 10 và 24)*

Khớp hình dạng dữ liệu với engine. DocumentDB: document tương thích MongoDB. Neptune: cơ sở dữ liệu đồ thị (quan hệ, traversal — Gremlin/SPARQL). Keyspaces: wide-column tương thích Cassandra. Timestream: chuỗi thời gian (sản phẩm hiện tại: Timestream for InfluxDB). MemoryDB: cơ sở dữ liệu *chính* tương thích Redis bền vững (vs ElastiCache = cache). QLDB ("ledger mật mã bất biến") đã bị ngừng vào năm 2025 — coi như một distractor di sản.

Tín hiệu kỳ thi: "đồ thị xã hội / khuyến nghị / vòng gian lận" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "telemetry IoT theo thời gian" → Timestream.

---

**AWS DMS — Database Migration Service** *(Chương 8)*

Di chuyển cơ sở dữ liệu sang AWS với thời gian ngừng tối thiểu. Hỗ trợ full load (bản sao ban đầu) cộng với CDC (Change Data Capture) để giữ nguồn và đích đồng bộ trong khi di chuyển chạy. Khi di chuyển giữa cùng loại engine (MySQL → MySQL, PostgreSQL → PostgreSQL), dùng DMS trực tiếp. Khi di chuyển giữa các loại engine khác nhau (Oracle → Aurora PostgreSQL), dùng AWS Schema Conversion Tool (SCT) trước để chuyển đổi schema, sau đó DMS cho dữ liệu.

Các khái niệm chính: Replication instance, source và target endpoint, full load + CDC, SCT (Schema Conversion Tool) cho di chuyển dị thể.

Tín hiệu kỳ thi: "Di chuyển cơ sở dữ liệu với thời gian ngừng tối thiểu" → DMS. "Oracle sang Aurora" hoặc bất kỳ di chuyển dị thể nào → SCT + DMS. "Cùng engine, cùng loại" → DMS trực tiếp.

---

## Mạng

**VPC — Virtual Private Cloud** *(Chương 11)*

Một mạng cô lập bên trong AWS. Trải dài tất cả các AZ trong một region. Bạn định nghĩa không gian địa chỉ IP (khối CIDR), tạo subnet (công khai hoặc riêng tư), cấu hình route table và kiểm soát truy cập qua security group và NACL.

Các khái niệm chính: Subnet công khai (route đến Internet Gateway), subnet riêng tư (route đến NAT Gateway cho ra ngoài), Internet Gateway (vào + ra internet), NAT Gateway (chỉ ra ngoài cho instance riêng tư), VPC Peering (kết nối hai VPC), VPC Endpoints (kết nối đến dịch vụ AWS không qua internet).

Tín hiệu kỳ thi: "Mạng riêng trên AWS," "cô lập tài nguyên khỏi internet," "kiểm soát lưu lượng mạng" → VPC.

---

**Security Group và NACL** *(Chương 15)*

Security group là tường lửa có trạng thái ở cấp instance — chỉ có quy tắc allow, lưu lượng trả về tự động. NACL (Network Access Control List) là tường lửa không trạng thái ở cấp subnet — yêu cầu cả quy tắc vào và ra, được đánh giá theo thứ tự theo số quy tắc.

Tín hiệu kỳ thi: "Chặn một IP cụ thể truy cập subnet" → NACL. "Kiểm soát lưu lượng đến/từ một instance" → security group.

---

**Route 53** *(Chương 12)*

Dịch vụ DNS và nhà đăng ký tên miền của AWS. Định tuyến lưu lượng internet đến tài nguyên AWS và các endpoint bên ngoài. Chính sách định tuyến: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer.

Các khái niệm chính: Hosted zone (công khai và riêng tư), loại bản ghi (A, AAAA, CNAME, Alias), health check, Traffic Flow (trình chỉnh sửa chính sách trực quan — lưu ý rằng geoproximity cũng có sẵn như một chính sách định tuyến trực tiếp trên các bản ghi, với độ thiên lệch có thể điều chỉnh, mà không cần Traffic Flow).

Tín hiệu kỳ thi: "Định tuyến DNS," "failover giữa các region," "định tuyến dựa trên độ trễ hoặc vị trí" → Route 53 với chính sách định tuyến phù hợp.

---

**CloudFront** *(Chương 13)*

Mạng phân phối nội dung (CDN). Cache nội dung tại các edge location (750+ điểm hiện diện trên toàn thế giới). Giảm độ trễ cho người dùng cuối. Giảm chi phí chuyển từ origin thông qua caching. Tích hợp với S3, EC2, ALB và API Gateway làm origin.

Các khái niệm chính: Distribution, origin, behavior (định tuyến theo đường dẫn đến origin), TTL (kiểm soát cache), cache invalidation, signed URL và cookie (kiểm soát truy cập), Lambda@Edge và CloudFront Functions (chạy code tại edge), Origin Shield (giảm tải origin).

Tín hiệu kỳ thi: "Độ trễ thấp toàn cầu," "cache nội dung tĩnh," "giảm tải origin," "bảo vệ chống DDoS với Shield" → CloudFront.

---

**Direct Connect và VPN** *(Chương 25)*

AWS Direct Connect là một kết nối mạng vật lý chuyên dụng từ trung tâm dữ liệu tại chỗ của bạn đến AWS. Bỏ qua internet công cộng. Băng thông và độ trễ nhất quán hơn. AWS Site-to-Site VPN là một đường hầm được mã hóa qua internet công cộng — thiết lập nhanh hơn, chi phí thấp hơn, nhưng hiệu suất biến đổi.

Các khái niệm chính: Virtual Interface (VIF), Direct Connect Gateway (kết nối đến nhiều region), Transit Gateway (cấu trúc mạng hub-and-spoke), dự phòng đường hầm VPN.

Tín hiệu kỳ thi: "Kết nối riêng tư chuyên dụng đến AWS" → Direct Connect. "Kết nối được mã hóa, thiết lập nhanh hơn" → VPN. "Kết nối nhiều VPC" → Transit Gateway.

---

**VPC Endpoints** *(Chương 30)*

Kết nối tài nguyên riêng tư đến dịch vụ AWS mà không dùng internet công cộng hoặc NAT Gateway. Gateway Endpoints: miễn phí, có sẵn chỉ cho S3 và DynamoDB. Interface Endpoints (PrivateLink): tính phí theo giờ + theo GB, có sẵn cho hầu hết các dịch vụ AWS.

Tín hiệu kỳ thi: "EC2 trong subnet riêng tư gọi S3/DynamoDB — giảm chi phí NAT Gateway" → Gateway Endpoint (miễn phí). "Kết nối riêng tư đến SQS, SSM, Secrets Manager từ subnet riêng tư" → Interface Endpoint.

---

**AWS Client VPN** *(Chương 11)*

Endpoint OpenVPN được quản lý cho phép các thiết bị cá nhân (laptop, máy trạm) kết nối an toàn đến một VPC qua internet. Các tùy chọn xác thực: Active Directory, liên kết SAML 2.0 với một nhà cung cấp danh tính, hoặc TLS tương hỗ (dựa trên chứng chỉ). Hỗ trợ split-tunnel (chỉ lưu lượng hướng VPC đi qua đường hầm) và full-tunnel (tất cả lưu lượng định tuyến qua AWS).

Các khái niệm chính: Client VPN endpoint, target network (liên kết subnet VPC), authorization rule, split-tunnel vs. full-tunnel.

Tín hiệu kỳ thi: "Kỹ sư từ xa cần truy cập an toàn đến một VPC từ nhà," "kết nối thiết bị cá nhân đến VPC" → Client VPN. Đối lập: Site-to-Site VPN = mạng-đến-mạng. Client VPN = thiết bị-đến-mạng.

---

**Network Load Balancer (NLB) và Gateway Load Balancer (GWLB)** *(Chương 7)*

NLB hoạt động ở Layer 4 (TCP/UDP/TLS): không kiểm tra HTTP, chỉ định tuyến gói với tốc độ cực cao — hàng triệu yêu cầu mỗi giây, với một IP tĩnh mỗi AZ và bảo toàn IP nguồn. GWLB hoạt động ở Layer 3 và tồn tại cho một mục đích: chèn các thiết bị mạng ảo của bên thứ ba (tường lửa, IDS/IPS, kiểm tra gói sâu) vào luồng lưu lượng.

Các khái niệm chính: NLB = Layer 4, IP tĩnh, độ trễ siêu thấp, giao thức không phải HTTP. GWLB = Layer 3, đóng gói GENEVE, các đội thiết bị phía sau một điểm vào duy nhất. ALB = Layer 7 (định tuyến đường dẫn/host).

Tín hiệu kỳ thi: "Hàng triệu yêu cầu TCP mỗi giây," "IP tĩnh cho load balancer," "bảo toàn IP nguồn" → NLB. "Chèn thiết bị bảo mật bên thứ ba vào đường lưu lượng" → GWLB.

---

**AWS Global Accelerator** *(Chương 25)*

Định tuyến lưu lượng người dùng vào backbone toàn cầu riêng của AWS tại edge location gần nhất, thay vì băng qua internet công cộng. Cung cấp hai địa chỉ IP Anycast tĩnh đứng trước các ALB, NLB, hoặc instance EC2 của bạn ở một hoặc nhiều region. Cải thiện độ trễ và tính nhất quán cho lưu lượng *động* (không thể cache).

Các khái niệm chính: IP Anycast tĩnh, onboarding edge vào backbone AWS, failover region dựa trên health-check trong vài giây, endpoint group với traffic dial.

Tín hiệu kỳ thi: "Người dùng toàn cầu, lưu lượng động/không phải HTTP, IP tĩnh, failover region nhanh" → Global Accelerator. "Nội dung có thể cache/tĩnh" → CloudFront thay thế.

---

## Bảo Mật và Danh Tính

**IAM — Identity and Access Management** *(Chương 3 và 14)*

Kiểm soát ai có thể làm gì trong tài khoản AWS của bạn. User (thông tin xác thực dài hạn), Group (user chia sẻ quyền), Role (thông tin xác thực tạm thời cho dịch vụ và truy cập cross-account), Policy (tài liệu JSON định nghĩa quy tắc allow/deny).

Các khái niệm chính: Principal, Action, Resource, Condition, explicit deny > explicit allow > implicit deny, SCP (Service Control Policy trong AWS Organizations), Permission boundary, AssumeRole.

Tín hiệu kỳ thi: IAM tham gia vào mọi câu hỏi bảo mật. Mẫu chính: dịch vụ dùng IAM role (không phải user). Truy cập cross-account dùng đảm nhận role. Đặc quyền tối thiểu — chỉ cấp những gì được yêu cầu.

---

**KMS — Key Management Service** *(Chương 16)*

Dịch vụ khóa mã hóa được quản lý. Tạo, lưu trữ và kiểm soát các khóa mật mã. Customer-managed key (CMK) cho phép bạn định nghĩa rotation, sử dụng và chính sách truy cập. AWS-managed key được quản lý tự động.

Các khái niệm chính: Key policy (tách biệt với IAM policy), Envelope encryption (dữ liệu được mã hóa với data key; data key được mã hóa với CMK), Tự động rotation khóa, khóa multi-region, Grant.

Tín hiệu kỳ thi: "Mã hóa dữ liệu khi nghỉ," "khóa mã hóa do khách hàng quản lý," "rotation khóa" → KMS.

---

**Secrets Manager** *(Chương 16)*

Lưu trữ và tự động rotation các giá trị nhạy cảm: thông tin xác thực cơ sở dữ liệu, khóa API, token OAuth. Tích hợp với RDS để tự động rotation mật khẩu. Ứng dụng truy xuất secret tại thời gian chạy qua API — không bao giờ hardcode thông tin xác thực.

Tín hiệu kỳ thi: "Lưu trữ và rotation thông tin xác thực cơ sở dữ liệu," "tránh secret hardcode" → Secrets Manager. "Lưu trữ giá trị cấu hình, không phải secret" → Parameter Store (SSM).

---

**AWS Shield** *(Chương 17)*

Bảo vệ DDoS. Shield Standard tự động và miễn phí — bảo vệ chống các tấn công volumetric và giao thức phổ biến. Shield Advanced thêm bảo vệ tài chính, đội phản ứng DDoS 24/7 và khả năng hiển thị tấn công chi tiết.

Tín hiệu kỳ thi: "Bảo vệ chống DDoS" → Shield Standard (tự động) hoặc Shield Advanced (doanh nghiệp, có SLA).

---

**WAF — Web Application Firewall** *(Chương 17)*

Lọc lưu lượng HTTP/HTTPS dựa trên quy tắc: chặn IP, giới hạn tốc độ, mẫu SQL injection, mẫu XSS, hạn chế địa lý, quy tắc tùy chỉnh. Gắn vào CloudFront, ALB, API Gateway, hoặc AppSync.

Tín hiệu kỳ thi: "Chặn các địa chỉ IP cụ thể," "ngăn SQL injection tại edge," "giới hạn tốc độ cuộc gọi API" → WAF.

---

**GuardDuty** *(Chương 17)*

Dịch vụ phát hiện mối đe dọa. Phân tích log CloudTrail, VPC Flow Logs và log DNS bằng ML và threat intelligence. Phát hiện hoạt động API bất thường, giao tiếp với các IP độc hại đã biết, thông tin xác thực bị xâm phạm.

Tín hiệu kỳ thi: "Phát hiện hoạt động bất thường," "xác định thông tin xác thực IAM bị xâm phạm," "giám sát mối đe dọa liên tục" → GuardDuty.

---

**Amazon Inspector** *(Chương 17)*

Dịch vụ đánh giá lỗ hổng tự động. Liên tục quét các instance EC2, image container Amazon ECR và hàm Lambda để tìm các lỗ hổng phần mềm (CVE) và phơi nhiễm mạng ngoài ý muốn. Các phát hiện được gửi đến AWS Security Hub để quản lý tập trung.

Các khái niệm chính: Quét CVE, đánh giá liên tục (không phải một lần), bao phủ EC2 + ECR + Lambda, tích hợp Security Hub.

Tín hiệu kỳ thi: "Tự động quét EC2 để tìm lỗ hổng đã biết," "quét CVE cho image container," "đánh giá lỗ hổng liên tục" → Inspector.

---

**Amazon Cognito** *(Chương 14)*

Xác thực được quản lý cho người dùng cuối của ứng dụng của bạn — một thư mục người dùng bạn không phải xây dựng. User Pool xử lý đăng ký, đăng nhập, MFA, đặt lại mật khẩu và các nhà cung cấp danh tính xã hội (Google, Facebook, bất kỳ nhà cung cấp OIDC nào), phát hành JWT mà ứng dụng của bạn xác thực. Identity Pool đổi các token đó lấy thông tin xác thực AWS tạm thời.

Các khái niệm chính: User Pool (xác thực, JWT) vs. Identity Pool (thông tin xác thực AWS tạm thời), hosted UI, liên kết social/OIDC/SAML, Cognito authorizer của API Gateway.

Tín hiệu kỳ thi: "Ứng dụng cần đăng ký/đăng nhập người dùng," "đăng nhập xã hội," "cấp cho người dùng ứng dụng di động quyền truy cập tạm thời đến tài nguyên AWS" → Cognito. Đối lập: IAM dành cho kỹ sư và dịch vụ của bạn; Cognito dành cho khách hàng của bạn.

---

**AWS Certificate Manager (ACM)** *(Chương 16)*

Cấp phát chứng chỉ TLS/SSL công khai miễn phí cho các dịch vụ do AWS quản lý (ALB, CloudFront, API Gateway) và xử lý toàn bộ vòng đời — không có lịch gia hạn, không xử lý khóa riêng tư. Tự động gia hạn qua xác thực DNS.

Các khái niệm chính: Xác thực DNS vs. email, tự động gia hạn, chứng chỉ cho CloudFront phải ở us-east-1, chứng chỉ công khai miễn phí không thể xuất khẩu (một tùy chọn có thể xuất khẩu trả phí tồn tại từ năm 2025).

Tín hiệu kỳ thi: "HTTPS trên một load balancer hoặc CDN," "tự động gia hạn chứng chỉ" → ACM.

---

**Amazon Macie** *(Chương 17)*

Khám phá dữ liệu nhạy cảm cho S3. Dùng machine learning và khớp mẫu để tìm PII (tên, số thẻ, thông tin xác thực) trong bucket và đánh dấu các rủi ro truy cập như phơi nhiễm công khai. Bổ sung cho GuardDuty: GuardDuty theo dõi hành vi; Macie kiểm tra những gì được lưu trữ.

Các khái niệm chính: Trình định danh dữ liệu được quản lý (mẫu PII), phạm vi chỉ S3, phát hiện đến Security Hub/EventBridge.

Tín hiệu kỳ thi: "Khám phá PII trong S3," "xác định phơi nhiễm dữ liệu nhạy cảm" → Macie.

---

**AWS Control Tower** *(Chương 14)*

Tự động hóa thiết lập và quản trị của một môi trường đa tài khoản. Tạo một landing zone — tài khoản quản lý, lưu trữ log và kiểm toán được kết nối sẵn với Organizations, CloudTrail, Config và guardrail — trong vài phút thay vì hàng ngày kết nối thủ công.

Các khái niệm chính: Landing zone, guardrail (phòng ngừa = SCP, phát hiện = quy tắc Config), Account Factory cho các tài khoản mới được tiêu chuẩn hóa.

Tín hiệu kỳ thi: "Thiết lập và quản trị một môi trường đa tài khoản mới với các thực hành tốt nhất tự động" → Control Tower. Đối lập: Organizations là khối xây dựng thô; Control Tower là sự lắp ráp tự động.

---

## Nhắn Tin và Xử Lý Sự Kiện

**SQS — Simple Queue Service** *(Chương 19)*

Hàng đợi tin nhắn được quản lý. Producer gửi tin nhắn; consumer đọc và xóa chúng. Tách rời các dịch vụ: người gửi không cần biết người nhận có sẵn hay không. Standard queue: giao ít nhất một lần, sắp xếp nỗ lực tốt nhất. FIFO queue: xử lý chính xác một lần, sắp xếp nghiêm ngặt.

Các khái niệm chính: Visibility timeout (tin nhắn ẩn khỏi các consumer khác trong khi xử lý), Dead Letter Queue (DLQ) cho tin nhắn thất bại lặp đi lặp lại, lưu giữ tin nhắn (mặc định 4 ngày, lên đến 14), Long polling (giảm phản hồi rỗng), payload tối đa 256KB theo mặc định (có thể nâng lên 1 MiB từ năm 2025; với payload lớn hơn, Extended Client Library lưu phần thân trong S3).

Tín hiệu kỳ thi: "Tách rời các dịch vụ," "đệm yêu cầu trong các đợt tải cao điểm," "xử lý không đồng bộ" → SQS. "Thứ tự quan trọng và chính xác một lần là bắt buộc" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Chương 19)*

Dịch vụ pub/sub được quản lý. Publisher gửi một tin nhắn đến một topic; tất cả subscriber nhận một bản sao. Mẫu fan-out: một tin nhắn → nhiều consumer. Giao thức: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push.

Các khái niệm chính: Topic, subscription, mẫu fan-out (SNS → nhiều SQS queue), lọc tin nhắn (subscriber chỉ nhận tin nhắn phù hợp).

Tín hiệu kỳ thi: "Gửi thông báo đến nhiều endpoint đồng thời," "fan-out một sự kiện đơn lẻ đến nhiều consumer" → SNS. Mẫu phổ biến: SNS + SQS cho fan-out bền vững.

---

**EventBridge** *(Chương 22)*

Event bus để xây dựng kiến trúc hướng sự kiện. Định tuyến sự kiện từ các dịch vụ AWS, đối tác SaaS và nguồn tùy chỉnh đến Lambda, SQS, SNS, Step Functions và các target khác. Hỗ trợ quy tắc theo lịch (cron) và khớp mẫu.

Tín hiệu kỳ thi: "Định tuyến sự kiện từ dịch vụ AWS đến target," "lập lịch hàm Lambda," "điều phối hướng sự kiện" → EventBridge.

---

**Step Functions** *(Chương 22)*

Điều phối quy trình làm việc serverless. Phối hợp các hàm Lambda, task ECS, DynamoDB, SNS, SQS và các dịch vụ khác thành các máy trạng thái trực quan. Xử lý retry, xử lý lỗi, nhánh song song và trạng thái chờ.

Các khái niệm chính: State machine, loại trạng thái (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (chính xác một lần, chạy lâu) vs. Express Workflows: Bất đồng bộ (ít nhất một lần, khối lượng lớn — thiết kế task để idempotent) và Đồng bộ (nhiều nhất một lần, trả kết quả trực tiếp như một cuộc gọi API).

Tín hiệu kỳ thi: "Điều phối nhiều hàm Lambda," "quy trình chạy lâu với logic retry," "bước phê duyệt của con người" → Step Functions.

---

**Kinesis** *(Chương 26)*

Streaming dữ liệu thời gian thực. Kinesis Data Streams: stream record bền vững, có thứ tự (như một commit log phân tán). Consumer xử lý record; dữ liệu được lưu giữ 24 giờ (mặc định) đến 365 ngày (với Extended Data Retention). Amazon Data Firehose (trước đây là Kinesis Data Firehose): giao được quản lý hoàn toàn đến S3, Redshift, OpenSearch, Splunk — không cần quản lý consumer.

Các khái niệm chính: Shard (đơn vị thông lượng: ghi 1MB/s, đọc 2MB/s), partition key (xác định gán shard), sequence number, checkpointing (KCL hoặc Lambda), Firehose vs. Streams.

Tín hiệu kỳ thi: "Streaming thời gian thực," "record có thứ tự," "phát lại sự kiện" → Kinesis Data Streams. "Giao dữ liệu streaming đến S3/Redshift mà không quản lý consumer" → Amazon Data Firehose (câu hỏi cũ hơn có thể nói "Kinesis Data Firehose"). "SQL trên dữ liệu streaming" → Amazon Managed Service for Apache Flink (trước đây là Kinesis Data Analytics). Đối lập với SQS: Kinesis lưu giữ và phát lại; SQS xóa khi tiêu thụ.

---

**Amazon MQ** *(Chương 19)*

Dịch vụ message broker được quản lý hỗ trợ Apache ActiveMQ và RabbitMQ. Hỗ trợ các giao thức nhắn tin tiêu chuẩn ngành: AMQP, STOMP, MQTT, OpenWire và WebSocket. Trường hợp sử dụng chính là di chuyển lift-and-shift của các khối lượng công việc message broker tại chỗ — các ứng dụng đã dùng ActiveMQ hoặc RabbitMQ có thể kết nối mà không thay đổi code.

Các khái niệm chính: Lựa chọn engine ActiveMQ vs. RabbitMQ, hỗ trợ giao thức (AMQP/STOMP/MQTT), cấu hình broker single-instance hoặc active/standby cho HA.

Tín hiệu kỳ thi: "Di chuyển ActiveMQ hoặc RabbitMQ tại chỗ sang AWS mà không thay đổi code ứng dụng" → Amazon MQ. "Nhắn tin AWS-native từ đầu" → SQS hoặc SNS (đơn giản hơn, mở rộng hơn).

---

## Phân Tích

**Athena** *(Chương 26)*

Truy vấn SQL serverless trên dữ liệu lưu trong S3. Không có cơ sở hạ tầng để quản lý. Trả theo truy vấn (theo TB được quét). Tốt nhất với định dạng cột (Parquet, ORC) và dữ liệu được phân vùng.

Tín hiệu kỳ thi: "Truy vấn dữ liệu S3 với SQL," "phân tích ad-hoc trên data lake," "không quản lý cơ sở hạ tầng" → Athena.

---

**Glue** *(Chương 26)*

Dịch vụ ETL (Extract, Transform, Load) serverless. Glue Crawler khám phá dữ liệu và cập nhật Glue Data Catalog. Glue Job chạy các phép biến đổi Spark hoặc Python. Data Catalog tích hợp với Athena, Redshift Spectrum và EMR.

Tín hiệu kỳ thi: "Biến đổi và nạp dữ liệu để phân tích," "khám phá schema của dữ liệu S3," "đường dẫn ETL" → Glue.

---

**Amazon QuickSight** *(Chương 26)*

Dịch vụ trí tuệ kinh doanh và trực quan hóa dữ liệu được quản lý. Dùng SPICE (Super-fast, Parallel, In-memory Calculation Engine), một engine trong bộ nhớ cache dữ liệu được nhập để hiển thị dashboard nhanh. Kết nối với Athena, S3, Redshift, RDS và các nguồn dữ liệu AWS khác. Không có máy chủ BI để quản lý.

Các khái niệm chính: SPICE (engine trong bộ nhớ), dataset, analysis, dashboard, ML Insights (phát hiện bất thường, dự báo), bảo mật cấp hàng và cấp cột.

Tín hiệu kỳ thi: "Dashboard BI trên AWS mà không quản lý máy chủ," "trực quan hóa dữ liệu từ Athena hoặc Redshift" → QuickSight.

---

**AWS Lake Formation** *(Chương 26)*

Lớp kiểm soát truy cập data lake tập trung trên S3 và Glue Data Catalog. Cung cấp quyền chi tiết ở cấp bảng, cột và hàng — chi tiết hơn so với chỉ bucket policy của S3. Đơn giản hóa việc thiết lập một data lake an toàn: Lake Formation xử lý mô hình quyền; Glue xử lý catalog; S3 giữ dữ liệu.

Các khái niệm chính: Quyền data lake (cấp bảng/cột/hàng), tích hợp Glue Data Catalog, LF-tag cho kiểm soát truy cập dựa trên thuộc tính, grant/revoke tập trung cho truy vấn Athena và Redshift Spectrum.

Tín hiệu kỳ thi: "Kiểm soát truy cập chi tiết trên data lake," "bảo mật cấp cột hoặc cấp hàng trên dữ liệu S3" → Lake Formation.

---

## Tính Khả Dụng Cao và Khôi Phục Sau Thảm Họa

**Multi-AZ và Multi-Region** *(Chương 18)*

Multi-AZ: sao chép đồng bộ trong một region để failover tự động (RDS Multi-AZ, load balancer trên các AZ). RPO ~0, RTO ~60 giây cho RDS. Multi-Region: sao chép không đồng bộ cho dự phòng địa lý và độ trễ thấp hơn cho người dùng toàn cầu.

Các khái niệm chính: RTO (Recovery Time Objective — bao lâu để khôi phục), RPO (Recovery Point Objective — bao nhiêu dữ liệu có thể mất). Các chiến lược DR Pilot Light, Warm Standby, Active-Active.

Tín hiệu kỳ thi: Phân biệt giữa lỗi cấp AZ (Multi-AZ xử lý) vs. lỗi cấp region (Multi-Region xử lý). Chi phí và độ phức tạp tăng đáng kể với Multi-Region.

---

**AWS Elastic Disaster Recovery (DRS)** *(Chương 18)*

Khôi phục sau thảm họa được quản lý cho máy chủ (tại chỗ hoặc EC2). Liên tục sao chép các máy chủ nguồn từng block một vào một khu vực staging chi phí thấp và khởi chạy các instance khôi phục đầy đủ trong vài phút khi cần — một pilot light được quản lý: thời gian khôi phục gần như warm-standby với giá gần như sao lưu-và-khôi phục.

Các khái niệm chính: Sao chép liên tục cấp block, khu vực staging chi phí thấp, khởi chạy khôi phục theo nhu cầu, khôi phục theo thời điểm.

Tín hiệu kỳ thi: "Giảm thiểu thời gian ngừng và mất dữ liệu cho khối lượng công việc dựa trên máy chủ với một dịch vụ DR được quản lý," "pilot light mà không tự xây dựng" → DRS.

---

## Tối Ưu Hóa Chi Phí

**Mô Hình Định Giá EC2** *(Chương 27)*

On-Demand: giá đầy đủ, không cam kết. Reserved Instances (1 hoặc 3 năm): giảm 30-72% cho loại instance cụ thể. Savings Plans (Compute hoặc EC2 Instance): chi tiêu theo giờ cam kết cho tính linh hoạt. Spot: giảm 60-90% cho khối lượng công việc có thể gián đoạn.

Tín hiệu kỳ thi: "Giảm chi phí cho khối lượng công việc dự đoán được" → Savings Plans hoặc Reserved Instances. "Xử lý batch chịu lỗi" → Spot. "Không dự đoán được hoặc ngắn hạn" → On-Demand.

---

**Định Giá Chuyển Dữ Liệu** *(Chương 30)*

Vào AWS: miễn phí. Cùng AZ: miễn phí. Cross-AZ: $0.01/GB mỗi chiều. Cross-region: $0.02-0.08/GB. Internet (ra ngoài): ~$0.09/GB. Xử lý NAT Gateway: $0.045/GB. Chuyển dữ liệu CloudFront rẻ hơn so với trực tiếp EC2-đến-internet, và caching giảm tổng khối lượng.

Tín hiệu kỳ thi: "Giảm chi phí chuyển dữ liệu cho S3/DynamoDB từ subnet riêng tư" → Gateway Endpoints (miễn phí). "Giảm chi phí NAT Gateway cho các dịch vụ khác" → Interface Endpoints.

---

## Khả Năng Quan Sát

**CloudWatch** *(được tham chiếu xuyên suốt)*

Giám sát và khả năng quan sát. CloudWatch Metrics: dữ liệu chuỗi thời gian số từ các dịch vụ AWS và ứng dụng tùy chỉnh. CloudWatch Logs: thu thập, tìm kiếm và phân tích dữ liệu log. CloudWatch Alarms: kích hoạt thông báo hoặc auto scaling dựa trên ngưỡng metric. CloudWatch Dashboards: trực quan hóa metric.

Các khái niệm chính: Chiều metric, khoảng thời gian lưu giữ, log group và log stream, metric filter, CloudWatch Agent (cho metric và log cấp OS từ EC2), Container Insights.

---

**CloudTrail** *(được tham chiếu xuyên suốt)*

Ghi lại mọi cuộc gọi API được thực hiện trong tài khoản AWS của bạn: ai thực hiện nó, từ đâu, khi nào, và phản hồi là gì. Trail multi-region lưu log trong S3 vô thời hạn. Dùng cho kiểm toán bảo mật, tuân thủ và điều tra sự cố.

Tín hiệu kỳ thi: "Ai đã xóa tài nguyên đó?" "Kiểm toán tất cả hoạt động API" → CloudTrail.

---

**X-Ray** *(Chương 20)*

Truy vết phân tán: theo dõi từng yêu cầu riêng lẻ qua các dịch vụ (trace → segment → subsegment), xây dựng một service map với độ trễ và tỷ lệ lỗi mỗi chặng. Lấy mẫu giữ chi phí thấp; annotation làm cho trace có thể tìm kiếm. Active tracing bật trên Lambda và các stage API Gateway.

Tín hiệu kỳ thi: "Truy vết yêu cầu qua các microservice," "tìm nút thắt cổ chai giữa các dịch vụ" → X-Ray (không phải CloudWatch, không phải CloudTrail).

---

**AWS Config** *(được tham chiếu trong Chương 31)*

Theo dõi các thay đổi cấu hình tài nguyên theo thời gian. Đánh giá tài nguyên so với các quy tắc tuân thủ. Ghi lại lịch sử của mọi thay đổi cấu hình cho mọi tài nguyên. Tích hợp với Systems Manager để khắc phục.

Tín hiệu kỳ thi: "Tài nguyên này có tuân thủ chính sách bảo mật của chúng ta không?" "Cấu hình của tài nguyên này trông như thế nào tuần trước?" → AWS Config.

---

## Well-Architected

**Sáu Trụ Cột** *(Chương 31)*

| Trụ cột                  | Câu hỏi cốt lõi                          | Dịch vụ chính                                     |
|--------------------------|------------------------------------------|---------------------------------------------------|
| Operational Excellence   | Chúng ta có vận hành tốt không?          | CloudWatch, CloudTrail, SSM, Config               |
| Security                 | Chúng ta có được bảo vệ không?           | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability              | Chúng ta có khôi phục từ lỗi không?      | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Performance Efficiency   | Chúng ta dùng đúng tài nguyên không?     | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Cost Optimization        | Chúng ta chi tiêu khôn ngoan không?      | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| Sustainability           | Chúng ta giảm thiểu tác động môi trường không? | Right-sizing, Graviton, tầng lưu trữ hiệu quả |

AWS Well-Architected Tool: đánh giá kiến trúc của bạn so với sáu trụ cột. Dùng nó trước kỳ thi để hiểu lý luận đằng sau câu hỏi của mỗi trụ cột.
