# Chương 21: Container Vận Chuyển Cho Code

"Nó chạy trên máy của tôi."

Leo đã học không nói điều này to lên. Đó không phải là lý do bào chữa — đó là chẩn đoán. Và chẩn đoán lần này là EC2 instance sản xuất số ba, đã nhận một bản vá thư viện sáu tuần trước mà không ai ghi lại.

**Container Là Gì?**

**Container** là một đơn vị nhẹ, di động đóng gói ứng dụng cùng với mọi thứ nó cần để chạy: runtime, thư viện, file cấu hình và code ứng dụng.

Không giống như máy ảo (giả lập toàn bộ máy tính bao gồm kernel OS), container chia sẻ kernel OS của máy chủ trong khi giữ mọi thứ khác được cô lập.

Thuộc tính chính: **Bất biến**. Một image được xây dựng hôm nay sẽ chạy giống hệt trên bất kỳ máy chủ nào hỗ trợ Docker.

**Amazon ECS: Bộ Điều Phối**

**Amazon ECS (Elastic Container Service)** là dịch vụ điều phối container được quản lý của AWS. Bạn xác định:

- **Task definition**: Image container nào để chạy, bao nhiêu CPU và bộ nhớ
- **Service**: Bao nhiêu bản sao của task để chạy
- **Cluster**: Cơ sở hạ tầng tính toán cơ bản

**Fargate so với EC2 Launch Type**

**EC2 launch type**: Bạn quản lý các EC2 instance bên dưới.

**Fargate (serverless compute for containers)**: AWS quản lý hoàn toàn cơ sở hạ tầng bên dưới.

**Amazon EKS: Khi Bạn Cần Kubernetes**

**Amazon EKS** là Kubernetes được quản lý trên AWS.

**Khi nào dùng ECS so với EKS?**

**Dùng ECS** nếu:
- Bạn chủ yếu trên AWS và muốn trải nghiệm đơn giản hơn
- Nhóm của bạn không có chuyên môn Kubernetes hiện có

**Dùng EKS** nếu:
- Bạn cần các tính năng Kubernetes cụ thể
- Nhóm của bạn đã biết Kubernetes

"ECS," Priya nói ngay lập tức. "Chúng ta không có chuyên môn Kubernetes. ECS làm tất cả những gì chúng ta cần."

## Tóm Tắt

- **Container** đóng gói code ứng dụng, runtime và phụ thuộc — chạy giống hệt ở mọi nơi.
- **Docker** là công nghệ container tiêu chuẩn. Image là blueprint; container là instance đang chạy.
- **ECR (Elastic Container Registry)** là Docker registry được quản lý của AWS.
- **ECS** điều phối container. Bạn xác định task và service; ECS quản lý vị trí và vòng đời.
- **Fargate** là serverless compute cho container — không có EC2 instance để quản lý.
- **EKS** là Kubernetes được quản lý — cho các nhóm cần hệ sinh thái Kubernetes.

## Cảnh Sau Tín Dụng

Triển khai container đầu tiên hoàn hảo.

Phiên bản mới của API: không có thời gian ngừng hoạt động. ECS đã triển khai nó, kiểm tra sức khỏe vượt qua, các task cũ thoát ra, các task mới tiếp quản.

"Nó chỉ hoạt động," Leo nói.

"Đó là điểm mấu chốt," Priya nói.

Chương tiếp theo: sơ đồ luồng tự chạy — và nhớ nơi nó dừng lại.
