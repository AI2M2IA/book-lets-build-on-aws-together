# Chương 21: Container Vận Chuyển Cho Code

Trước năm 1956, việc xếp hàng hóa lên một con tàu là một sự thương lượng đòi hỏi kỹ năng và chuyên môn. Mỗi con tàu có các khoang khác nhau. Mỗi cảng có các cần cẩu khác nhau. Mỗi hãng vận tải có các hệ thống khác nhau để theo dõi cái gì đi đâu. Một thùng hàng di chuyển từ xe tải đến bến tàu đến tàu đến bến tàu đến xe tải qua một chuỗi người mà tất cả đều xử lý nó khác nhau. Hàng hóa bị thất lạc. Hàng hóa bị hư hỏng. Cùng một hàng hóa, vận chuyển hai lần, đến nơi trong tình trạng khác nhau vì việc xử lý đã khác nhau cả hai lần.

Câu trả lời, khi cuối cùng có người hỏi nó một cách rõ ràng, là: chuẩn hóa container. Đừng giải quyết vấn đề ở mỗi cảng. Giải quyết nó một lần, ở cấp độ container. Vận chuyển cái hộp, không chỉ nội dung.

Container vận chuyển được chuẩn hóa không chỉ làm cho việc vận chuyển nhanh hơn. Nó làm cho việc vận chuyển *dự đoán được*. Nội dung của một container ở Thượng Hải ở chính xác cùng tình trạng khi chúng đến Rotterdam — vì container bảo vệ chúng khỏi sự biến thiên ở mọi điểm chuyển giao.

Đó chính xác là cùng vấn đề mà Leo có. API Nimbus đang được "xếp" khác nhau ở mọi "cảng": staging triển khai khác production, instance một triển khai khác instance ba, và sáu tuần thay đổi không được ghi lại đã làm cho đội máy chủ trở nên không dự đoán được.

Container sẽ không làm cho Leo trở thành một lập trình viên nhanh hơn. Nó sẽ làm cho các lần triển khai dự đoán được.

---

Việc chuyển sang Lambda đã giảm hóa đơn EC2 cho các dịch vụ nhỏ hơn. Nhưng API cốt lõi thì khác — nó chạy liên tục, mang toàn bộ lưu lượng đơn hàng, và đã tích lũy lịch sử cấu hình trong tám tháng. Lambda giải quyết sự nhàn rỗi. Container sẽ giải quyết sự không nhất quán.

API cốt lõi không nhàn rỗi; nó không thể chuyển sang Lambda. Nhưng nó có một vấn đề khác: các EC2 instance chạy nó đã phân kỳ với nhau.

---

Leo đã học cách không nói "nó chạy trên máy của tôi" to lên. Đó không phải là một sự bào chữa — đó là một chẩn đoán. Và chẩn đoán lần này là EC2 instance production số ba, vốn đã nhận một bản vá thư viện sáu tuần trước mà không ai ghi lại, mà hai instance kia không nhận, và giờ đang gây ra một lỗi chỉ tồn tại ở đó, trong một instance đó, vô hình ở mọi nơi khác.

Anh đã dành ba giờ đêm hôm trước để truy ra nó.

"Mỗi lần chúng ta triển khai," anh nói sáng hôm sau, "chúng ta điều phối qua nhiều instance. Phiên bản mới, các phụ thuộc khác nhau. Chạy trong staging, hỏng trong production vì các môi trường đã phân kỳ."

"Vì có người đã cập nhật một gói trên instance ba mà không cập nhật những cái khác," Priya nói. Không có ác ý.

"Tôi cần một phiên bản cụ thể của—"

"Tôi biết," cô nói. "Và giờ instance ba có một lịch sử khác với instance một và hai. Đó là configuration drift. Nó im lặng cho đến khi nó không còn im lặng."

"Giải pháp thực sự là gì?" Maya hỏi.

"Ngừng đối xử với các máy chủ như những thứ vĩnh viễn mà bạn cấu hình," Priya nói. "Bắt đầu đối xử với chúng như những đơn vị dùng-một-lần mà bạn thay thế."

**Container Là Gì?**

"Hãy nghĩ về nó như một container vận chuyển," Leo nói, vớ lấy một cây bút lông. "Container không quan tâm nó ở trên con tàu nào. Con tàu không quan tâm cái gì ở trong container. Họ đồng ý về kích thước và cơ chế khóa. Mọi thứ khác ở trong hộp."

Một **container** là một đơn vị nhẹ, di động đóng gói ứng dụng của bạn cùng với mọi thứ nó cần để chạy: runtime (Python 3.11, Node.js 20, Java 17), các thư viện và phụ thuộc, các file cấu hình, và chính code ứng dụng.

Không giống như một máy ảo (vốn giả lập toàn bộ một máy tính, bao gồm kernel hệ điều hành), một container chia sẻ kernel OS của máy chủ trong khi giữ mọi thứ khác được cô lập. Điều này làm cho các container khởi động nhanh (vài giây, đôi khi vài mili giây) và nhỏ (megabyte, không phải gigabyte).

Công nghệ container phổ biến nhất là **Docker**. Một Docker image là bản thiết kế — một ảnh chụp nhanh của ứng dụng và môi trường của nó. Một Docker container là một instance đang chạy của image đó.

Thuộc tính chính: **tính bất biến (immutability)**. Một image được xây dựng hôm nay sẽ chạy giống hệt trên bất kỳ máy chủ nào hỗ trợ Docker — một laptop, một EC2 instance, một máy chủ trong một trung tâm dữ liệu khác. Môi trường được nướng sẵn vào. Configuration drift là không thể.

"Vậy thay vì lo lắng về cái gì được cài trên EC2 instance," Leo nói, "chúng ta xây dựng một image có mọi thứ. Image chạy theo cùng một cách ở mọi nơi."

"Và nếu bạn cần kiểm thử nó cục bộ, bạn chạy cùng image," Priya thêm. "Không còn 'nó chạy trên máy của tôi' nữa."

**Xây Dựng Docker Image và Đẩy Lên ECR**

Trước khi bất kỳ bộ điều phối nào có thể quản lý container, Leo phải xây dựng nó và lưu trữ nó ở đâu đó ECS có thể kéo từ.

Anh viết Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Dòng quan trọng: `FROM python:3.11-slim`. Không phải Python 3.9. Không phải Python 3.10. 3.11 — phiên bản cụ thể mà cả nhóm đã đồng ý, nướng sẵn vào image. Mọi instance chạy image này sẽ dùng đúng Python 3.11. Hành vi làm tròn của module decimal sẽ giống hệt ở mọi nơi.

Anh xây dựng image cục bộ: `docker build -t nimbus-api:1.0.0 .`

Việc build mất 4 phút. Docker kéo base image, cài các phụ thuộc, sao chép code ứng dụng, và tạo ra một image được gắn tag `nimbus-api:1.0.0`.

Anh chạy nó cục bộ: `docker run -p 8000:8000 nimbus-api:1.0.0`

API khởi động. Cùng port, cùng hành vi như máy chủ production — vì môi trường giống hệt.

Rồi anh đẩy nó lên ECR:

```bash
# Xác thực Docker với ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Gắn tag image cho ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Đẩy
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Việc đẩy mất 2 phút. ECR lưu trữ image, ngay lập tức kích hoạt một lần quét image, và báo cáo kết quả trong vòng 5 phút.

**Amazon ECS: Bộ Điều Phối**

Chạy một container thì đơn giản. Chạy hàng chục container qua nhiều máy chủ, định tuyến lưu lượng giữa chúng, khởi động lại các container lỗi, triển khai các phiên bản mới mà không ngừng hoạt động — điều đó đòi hỏi một **bộ điều phối (orchestrator)**.

**Amazon ECS (Elastic Container Service)** là dịch vụ điều phối container được quản lý của AWS. Bạn xác định:

- **Task definition**: Image container nào để chạy, bao nhiêu CPU và bộ nhớ, các biến môi trường nào, các port nào để phơi bày
- **Service**: Bao nhiêu bản sao của task để chạy, cách xử lý các lỗi và triển khai
- **Cluster**: Cơ sở hạ tầng tính toán bên dưới

ECS xử lý phần còn lại: đặt các task lên công suất sẵn có, khởi động lại các task lỗi, drain các kết nối trong khi triển khai, đăng ký các task lành mạnh với load balancer.

Đối với Nimbus, API chuyển từ các EC2 instance với các lần triển khai quản lý thủ công sang ECS. Mỗi lần triển khai mới đẩy một Docker image mới lên **Amazon ECR (Elastic Container Registry)** — container registry được quản lý của AWS — và ECS triển khai nó ra tất cả các task với không ngừng hoạt động.

**Fargate so với EC2 Launch Type**

ECS có thể chạy các container ở hai chế độ:

**EC2 launch type**: Bạn quản lý các EC2 instance bên dưới. Bạn chịu trách nhiệm vá lỗi các instance, điều chỉnh kích thước cho phù hợp, và đảm bảo có đủ công suất cho các container của bạn. Nhiều kiểm soát hơn, nhiều trách nhiệm hơn.

**Fargate (serverless compute for containers)**: AWS quản lý hoàn toàn cơ sở hạ tầng bên dưới. Bạn chỉ định CPU và bộ nhớ mỗi task; Fargate cấp phát công suất đúng một cách tự động. Không có EC2 instance để quản lý. Bạn trả tiền mỗi vCPU-giây và GB-giây bộ nhớ.

Fargate là mô hình "serverless container" — bạn nhận được sự cô lập môi trường của các container mà không quản lý máy chủ. Sự đánh đổi: ít kiểm soát hơn đối với cấu hình instance bên dưới và chi phí trên mỗi đơn vị hơi cao hơn.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi, mở pricing calculator. "Fargate so với EC2 launch type — tôi muốn thấy các con số thực tế."

Ước tính theo cảm tính của Leo — cái mà mọi người mang theo — là Fargate sẽ tốn nhiều hơn. Sự tiện lợi serverless, giá cao cấp. Anh đoán có lẽ hai mươi hay ba mươi phần trăm trên EC2.

"Chạy các con số thực tế," Tom nói, vì đó là Tom.

Dịch vụ API Nimbus chạy 3 task, mỗi cái cần 0,5 vCPU và 1GB bộ nhớ, 24/7:

**Fargate**: $0.04048/vCPU-giờ × 0,5 × 3 × 720 giờ = $43.72/tháng cho CPU. $0.004445/GB-giờ × 1 × 3 × 720 = $9.60/tháng cho bộ nhớ. Tổng: $53.32/tháng.

**EC2 launch type** (3 × t3.medium ở $0.0416/giờ): $0.0416 × 3 × 720 = $89.86/tháng.

"Khoan," Tom nói. "Fargate rẻ hơn?"

"Ở kích thước này, đúng," Leo nói. "Fargate tính phí chính xác cho cái bạn cấp phát. Các EC2 instance có chi phí phụ trội — OS và ECS agent tiêu thụ một ít CPU và bộ nhớ trước khi các container của bạn thậm chí khởi động. Một t3.medium cho 2 vCPU và 4GB, nhưng bạn đang dùng 0,5 vCPU và 1GB mỗi container. Phần còn lại bị lãng phí."

"Nhưng EC2 launch type cho phép bạn gói nhiều task lên một instance."

"Đúng. Ở các quy mô lớn hơn, với bin-packing cẩn thận, EC2 launch type trở nên rẻ hơn. Ở quy mô của chúng ta — ba task — Fargate thắng."

Tom ghi cái này lại.

Đối với Nimbus: Fargate cho dịch vụ API. Họ không muốn quản lý các EC2 instance cho các container.

Nếu bạn container hóa với Fargate, bạn loại bỏ toàn bộ chi phí phụ trội quản lý EC2 — nhưng bạn từ bỏ khả năng tùy chỉnh các loại instance, điều quan trọng đối với các workload GPU hoặc mạng chuyên biệt. Nếu bạn chọn ECS vì sự đơn giản native-AWS, bạn được tích hợp chặt chẽ IAM và ALB — nhưng bạn bị khóa ngoài hệ sinh thái Kubernetes, vốn đòi hỏi tái kiến trúc nếu sau này bạn cần khả năng di chuyển đa đám mây.

**Amazon EKS: Khi Bạn Cần Kubernetes**

**Kubernetes** là một hệ thống điều phối container mã nguồn mở — về cơ bản là tiêu chuẩn ngành để quản lý các container ở quy mô. Nó mạnh mẽ, có thể mở rộng, và phức tạp.

**Amazon EKS (Elastic Kubernetes Service)** là dịch vụ Kubernetes được quản lý của AWS. Nó chạy control plane Kubernetes (lớp quản lý) cho bạn, trong khi bạn quản lý các worker node (hoặc dùng Fargate cho cả những cái đó nữa).

Bạn có thể đang thắc mắc: nếu Kubernetes là tiêu chuẩn ngành và mọi tin tuyển dụng đều đề cập đến nó, tại sao chúng ta lại không chỉ dùng nó? Vì "tiêu chuẩn ngành" mô tả cái mà các công ty lớn với các đội platform chuyên trách dùng. Đối với một nhóm sáu người xây dựng một ứng dụng đặt đồ ăn, Kubernetes thêm sự phức tạp vận hành mà không có lợi ích thực tế ngay bây giờ. Sự phức tạp là có thật; lợi ích là lý thuyết ở quy mô này.

Kubernetes cung cấp giá trị ở một mức độ phức tạp mà hầu hết các nhóm không cần: các custom resource definition để xây dựng các nền tảng nội bộ, các ràng buộc lập lịch nâng cao, các pod disruption budget cho kiểm soát triển khai chi tiết, và tích hợp service mesh cho quản lý lưu lượng giữa hàng trăm microservice. Đây là những khả năng thực sự. Chúng cũng là những khả năng mà một startup ở kích thước của Nimbus sẽ không bao giờ vận dụng.

Nguyên lý kỹ thuật ở đây đôi khi được gọi là YAGNI: You Aren't Gonna Need It (Bạn Sẽ Không Cần Nó). ECS cho Nimbus mọi thứ họ hiện cần. EKS cho họ nhiều hơn họ cần, cộng với một đường cong học tập đáng kể và chi phí vận hành phụ trội. "Nó sẽ hữu ích sau này" không phải là một lý do tốt để thêm sự phức tạp ngay bây giờ.

Khi nào bạn nên dùng EKS so với ECS?

**Dùng ECS** nếu:

- Bạn chủ yếu trên AWS và muốn trải nghiệm đơn giản hơn, native-AWS hơn
- Nhóm của bạn không có chuyên môn Kubernetes hiện có
- Bạn muốn ít chi phí vận hành phụ trội hơn

**Dùng EKS** nếu:

- Bạn cần các tính năng dành riêng cho Kubernetes (Custom Resource Definitions, Helm chart, hệ sinh thái Kubernetes)
- Nhóm của bạn đã biết Kubernetes
- Bạn đang chạy một môi trường hybrid (một số on-premises, một số trong AWS) và muốn một lớp điều phối nhất quán
- Workload của bạn có các yêu cầu khớp với khả năng mở rộng của Kubernetes

**Mạng Container: Các IP Phù Du và Service Discovery**

Một điều khiến các nhóm bất ngờ khi chuyển sang container: địa chỉ IP của một container thay đổi mỗi lần nó khởi động lại.

Trong thế giới EC2, các instance có các IP riêng tương đối ổn định. Bạn có thể (dù bạn không nên) hardcode chúng trong các file cấu hình. Các dịch vụ biết nhau qua IP.

Trong thế giới container, mỗi task trong ECS nhận một IP từ subnet VPC khi nó khởi động. Khi nó dừng và một task mới khởi động (như một phần của một lần triển khai hoặc một lần khởi động lại), task mới đó nhận một IP khác.

"Chuyện gì xảy ra khi một dịch vụ được hardcode để gọi `10.0.1.45` và container đó bị thay thế bằng `10.0.1.82`?" Priya hỏi. "Dịch vụ gọi bắt đầu truy cập vào hư không."

Đây là lý do tại sao service discovery quan trọng trong các môi trường container. ECS + Application Load Balancer xử lý điều này tự động: tên DNS của ALB ổn định; ECS đăng ký các task lành mạnh với target group; ALB định tuyến đến bất kỳ task nào hiện đang lành mạnh. Dịch vụ gọi nói chuyện với tên DNS của ALB, không phải với các IP container riêng lẻ.

Đối với giao tiếp dịch-vụ-đến-dịch-vụ nội bộ (không đối mặt người dùng), **AWS Cloud Map** cung cấp service discovery: mỗi dịch vụ ECS đăng ký với Cloud Map, vốn cung cấp một tên DNS ổn định. Dịch vụ order gọi `http://notification.nimbus.local:8080`, và Cloud Map phân giải cái đó thành bất kỳ task nào trong dịch vụ notification hiện đang lành mạnh.

"Vậy các container nói chuyện với nhau qua các tên DNS, không phải IP?" Leo xác nhận.

"Đúng. IP là phù du. Tên DNS là hợp đồng."

**Tiêm Bí Mật: Không Có Bí Mật Trong Các Biến Môi Trường**

Lần triển khai EC2 ban đầu có một vấn đề mà Priya đã cảnh báo trong nhiều tháng: các bí mật (mật khẩu database, các API key, thông tin xác thực SES) được lưu trữ trong các biến môi trường trên EC2 instance, được đặt qua một script triển khai.

Các biến môi trường có thể truy cập được với bất kỳ tiến trình nào chạy trên instance. Chúng xuất hiện trong các công cụ gỡ lỗi, trong một số báo cáo crash, và trong các danh sách tiến trình. Chúng cũng hiển thị trong CloudWatch nếu bạn log chúng (mà một số công cụ phát triển làm theo mặc định).

Container không giải quyết điều này tự động — bạn vẫn có thể truyền các bí mật như các biến môi trường trong ECS task definition. Và các ECS task definition được lưu trữ trong console AWS, hiển thị với bất kỳ ai có quyền truy cập ECS.

Mẫu đúng: **tích hợp AWS Secrets Manager + ECS task definition**.

Thay vì lưu trữ mật khẩu database trong task definition:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS lấy bí mật từ Secrets Manager vào lúc khởi chạy task và tiêm nó vào container như một biến môi trường. Giá trị bí mật không bao giờ được lưu trữ trong task definition — chỉ ARN của bí mật Secrets Manager. Container nhận giá trị lúc chạy. Secrets Manager có thể xoay vòng giá trị mà không thay đổi task definition.

"Và nếu có ai đọc task definition?" Priya hỏi. "Họ sẽ thấy ARN Secrets Manager, nhưng không thấy giá trị."

"Và không có các quyền IAM đúng," Leo xác nhận, "họ cũng không thể lấy giá trị từ Secrets Manager."

"Đó là thiết kế," Priya nói. "Execution role của task có quyền đọc bí mật cụ thể đó. Không gì khác. Xâm phạm task definition cho bạn một ARN, không phải một mật khẩu."

"Chúng ta nên dùng cái nào?" Maya hỏi. "Và tại sao không Kubernetes? Nó có trong mọi mô tả công việc. Mọi bài nói chuyện hội nghị."

"ECS," Priya nói ngay lập tức. "Chúng ta không có chuyên môn Kubernetes. ECS làm tất cả những gì chúng ta cần. Thêm Kubernetes ngay bây giờ sẽ là thêm sự phức tạp vận hành mà không có lợi ích thực tế."

Soo-Jin, người đã chạy các cụm Kubernetes ở công ty trước, gật đầu. "Tôi đã mang cái pager đó. Bạn không muốn nó cho đến khi bạn cần nó."

"Chúng ta luôn có thể di chuyển sang EKS sau này nếu chúng ta vượt quá ECS," Leo thêm.

Đây là một câu trả lời cấp cao đúng đắn: chọn công cụ đơn giản hơn phù hợp với các nhu cầu hiện tại của bạn.

**ECR: Bảo Mật Các Image Của Bạn**

"Và nếu có ai cố đột nhập qua một base image có lỗ hổng thì sao?" Priya hỏi. "Có người vớ một image cũ với một CVE đã biết và dùng nó để có chỗ đứng trong container ứng dụng?"

Đó là câu hỏi đúng để hỏi trước khi triển khai bất kỳ container nào trong production.

**Amazon ECR (Elastic Container Registry)** lưu trữ các Docker image của bạn và có thể quét chúng tìm các lỗ hổng đã biết trước khi triển khai. Việc quét image của ECR kiểm tra image so với một cơ sở dữ liệu các CVE đã biết (Common Vulnerabilities and Exposures) và đánh dấu các vấn đề theo mức độ nghiêm trọng.

Policy mà Priya viết: không image nào với một CVE mức độ CRITICAL sẽ được triển khai lên production. Pipeline CI/CD sẽ kiểm tra các kết quả quét trước khi cập nhật dịch vụ ECS. Nếu một lỗ hổng critical được tìm thấy, pipeline sẽ thất bại và cảnh báo cả nhóm.

"Đó không phải là hoang tưởng," Priya nói. "Đó chỉ là có một lần kiểm tra trước khi bạn triển khai."

**Cách Container Thay Đổi Các Lần Triển Khai**

Trước container, triển khai một phiên bản mới của API Nimbus nghĩa là:

1. SSH vào mỗi EC2 instance
2. Kéo code mới nhất từ Git
3. Cài/cập nhật các phụ thuộc
4. Khởi động lại tiến trình ứng dụng
5. Xác minh sức khỏe
6. Chuyển sang instance tiếp theo

Điều này dễ lỗi và chậm. Nó đòi hỏi sự điều phối. Nếu bước 3 thất bại trên instance 4, bạn có một lần triển khai lẫn lộn với một số instance chạy phiên bản cũ và một số thất bại chạy phiên bản mới.

Với ECS và các container:

1. Xây dựng một Docker image mới (tự động trong pipeline CI/CD)
2. Đẩy lên ECR
3. Cập nhật dịch vụ ECS để dùng phiên bản image mới

ECS xử lý việc triển khai cuốn chiếu: khởi động các task mới với image mới, chờ chúng lành mạnh, rồi dừng các task cũ. Triển khai không-ngừng-hoạt-động, tự động.

Nếu phiên bản mới thất bại các health check, ECS dừng việc triển khai và phiên bản cũ tiếp tục phục vụ lưu lượng.

**Cấu Hình Tối Thiểu Cho Triển Khai: Health Check**

Toàn bộ sự an toàn của các lần triển khai container phụ thuộc vào việc các health check thực sự hoạt động.

ECS dùng hai loại health check:

**Health check cấp container**: Được định nghĩa trong Dockerfile hoặc task definition. Chạy bên trong container để xác minh ứng dụng đang phản hồi.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Health check target group ALB**: Load balancer định kỳ gửi các request HTTP đến một endpoint sức khỏe. Các task thất bại health check bị gỡ khỏi target group.

Nếu cả hai health check không được cấu hình đúng, ECS coi mọi task là lành mạnh — và sẽ triển khai một image hỏng mà không dừng lại. Đây là sai lầm triển khai container phổ biến nhất.

"Liệu endpoint health check có thể rò rỉ thông tin nội bộ không?" Priya hỏi.

Endpoint health check tại `/health` chỉ trả về: `{"status": "ok"}`. Không có số phiên bản, không có trạng thái phụ thuộc, không có cấu hình nội bộ. Bất kỳ thông tin nào trong phản hồi sức khỏe có thể hữu ích cho ai đó đang lập bản đồ ứng dụng. Hãy giữ các endpoint sức khỏe tối thiểu.

Đối với trạng thái sức khỏe nội bộ chi tiết (khả năng kết nối database, các kiểm tra phụ thuộc), dùng một endpoint `/health/detail` có xác thực riêng — chỉ truy cập được từ bên trong VPC.

**Ghi Log Có Cấu Trúc: Cửa Sổ Duy Nhất Vào Một Container Đang Chạy**

Trên EC2, có gì đó sai và bạn SSH vào. Bạn tail file log. Bạn nhìn vào bảng tiến trình. Bạn kiểm tra mức sử dụng đĩa. Bạn ngó nghiêng xung quanh.

Trong một container, không có SSH. Container là phù du — nó có thể đang chạy trên bất kỳ máy chủ nào trong cụm, và ECS sẽ thay thế nó không cảnh báo nếu nó thất bại các health check. Vào lúc bạn nghĩ đến việc SSH vào, container bạn muốn kiểm tra có thể không còn tồn tại.

Log không phải là một sự tiện lợi gỡ lỗi trong các môi trường container hóa. Chúng là bằng chứng duy nhất rằng có điều gì đó đã xảy ra.

"Và nếu một container thất bại âm thầm và chúng ta không có log thì sao?" Priya hỏi trong buổi review kiến trúc container. "Chúng ta có thể có một task thoát với code 1 và không bao giờ biết nguyên nhân nếu các log không được bắt giữ trước khi nó chấm dứt."

Đây không phải là giả thuyết. Nó xảy ra trên các lần triển khai container đầu tiên, một cách nhất quán.

Mẫu đúng: cấu hình mọi container để gửi các log có cấu trúc đến **Amazon CloudWatch Logs** dùng log driver `awslogs`. ECS xử lý việc vận chuyển tự động — không có log agent để cài, không cần container sidecar.

Trong task definition:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Mọi dòng được ghi vào stdout hoặc stderr bên trong container được bắt giữ và gửi đến log group `/ecs/nimbus-api`, được tổ chức theo task ID. ECS tạo một log stream mới cho mỗi task, nên bạn có thể tìm các log cho container cụ thể đã thất bại — ngay cả sau khi nó đã bị thay thế.

Task execution role cần quyền ghi vào CloudWatch Logs. Không có nó, log driver thất bại âm thầm và toàn bộ đầu ra log bị mất.

**Log có cấu trúc so với văn bản thuần**: Các log văn bản thuần ("Order 7741 placed") đòi hỏi grep. Các log JSON có cấu trúc (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) có thể được truy vấn với CloudWatch Logs Insights dùng một cú pháp giống SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Truy vấn đó chạy trực tiếp trên log group. Không có database. Không có data pipeline. Không có ETL job. Câu trả lời ở đó trong vài giây.

Điều này không thay thế data lake phân tích mà chúng ta sẽ xây dựng trong chương 26. Nó trả lời các câu hỏi vận hành — "bao nhiêu đơn hàng từ nhà hàng 47 trong 30 phút qua?" — giữa một sự cố, khi bạn không có thời gian để chạy một truy vấn Athena.

**CloudWatch Container Insights**

**Container Insights** là một tính năng CloudWatch thu thập và tổng hợp các metric cấp container — CPU, bộ nhớ, I/O mạng, I/O lưu trữ — mỗi cụm, dịch vụ, và task ECS. Thay vì các metric cấp EC2 (máy chủ đang thế nào?), bạn thấy các metric cấp task (dịch vụ ECS cụ thể này đang thế nào?).

Bật nó với một thiết lập trên cụm ECS:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Sau khi bật:

- Bạn thấy một dashboard mỗi dịch vụ: số lượng task, mức sử dụng CPU, mức sử dụng bộ nhớ
- Bạn có thể đặt alarm trên CPU cấp task (thay vì CPU máy chủ EC2, vốn là một tín hiệu thô hơn nhiều)
- Bạn có thể tương quan các đợt tăng vọt bộ nhớ với các sự kiện log — bộ nhớ task leo lên 95% lúc 14:22; các log hiển thị một đợt tăng vọt trong các request đến từ việc import thực đơn của nhà hàng 47 đúng lúc 14:21

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

Container Insights tính phí cho các custom metric và lưu trữ log mà nó tạo ra. Ở quy mô của Nimbus (ba dịch vụ, 3-6 task mỗi cái), điều này khoảng $12/tháng — một sự đánh đổi hợp lý cho khả năng quan sát vận hành cấp task.

Leo đã bật nó trong ngày.

Lần đầu tiên một task thất bại một health check và bị ECS thay thế, dashboard Container Insights bắt giữ sự kiện tự động: task ID, thời gian khởi động, thời gian thất bại, exit code. Log stream CloudWatch cho task đó giữ lại 40 dòng đầu ra cuối cùng trước khi chấm dứt — vốn hiển thị một exception không được bắt giữ được kích hoạt bởi một JSON thực đơn dị dạng từ một đối tác nhà hàng mới.

Không có Container Insights và ghi log có cấu trúc: một đợt tăng vọt bí ẩn trong các tỷ lệ lỗi, việc điều tra đòi hỏi SSH đến một máy chủ không còn chạy task thất bại, 45 phút đoán mò.

Với chúng: một liên kết log stream trong dashboard CloudWatch, exception chính xác, ID nhà hàng, trường gây lỗi — trong dưới năm phút.

"Không SSH," Leo nói, xem lại bản phân tích hậu sự cố. "Không ngừng hoạt động để điều tra. Các log đã làm công việc."

"Các log chỉ làm công việc," Priya nói, "nếu bạn đã cấu hình chúng để được bắt giữ."


**Khi Container Là Lựa Chọn Sai**

"Khoan — nhưng *tại sao* chúng ta lại không container hóa mọi thứ?" Maya hỏi. "Anh vừa thuyết phục tôi rằng các container giải quyết mọi vấn đề configuration drift. Tại sao không chạy từng dịch vụ một như một container?"

Đó là cùng câu hỏi cô đã hỏi về Lambda. Câu trả lời tương tự.

Các container thêm các yêu cầu vận hành: bạn cần một container registry (ECR), một pipeline CI/CD xây dựng và đẩy các image, một bộ điều phối (ECS), giám sát được cấu hình cho khả năng quan sát cấp task thay vì cấp instance, và một nhóm hiểu Docker và việc quản lý phiên bản image.

Đối với một dịch vụ đã chạy tốt trên EC2, ổn định, và không bị configuration drift, chi phí của việc container hóa nó có thể vượt quá lợi ích.

Các trường hợp cụ thể nơi container là lựa chọn sai:

**Các dịch vụ có trạng thái không được xây dựng cho khả năng di chuyển container**: Các database trong container đòi hỏi quản lý persistent volume cẩn thận. Hầu hết các nhóm chạy database trong container cuối cùng chuyển chúng trở lại các dịch vụ được quản lý (RDS, ElastiCache) sau khi gặp phải sự phức tạp này.

**Các dịch vụ với các yêu cầu phần cứng chuyên biệt**: Các workload GPU, các cấu hình network interface cụ thể, hoặc xử lý dựa trên FPGA đòi hỏi các EC2 instance với phần cứng cụ thể. Container không thay đổi điều này — bạn vẫn sẽ dùng EC2 launch type, chỉ với các container ở trên, và sự trừu tượng container thêm sự phức tạp mà không có lợi ích.

**Các script và công việc rất đơn giản**: Một script Python 40 dòng chạy một lần một tuần và không có các vấn đề dependency drift. Thêm Docker, ECR, các ECS task definition, và một pipeline CI/CD cho cái này là không cân xứng. Lambda đơn giản hơn. Một cron job EC2 thuần có thể còn đơn giản hơn.

"Nguyên lý," Leo nói, "vẫn như mọi khi: khớp công cụ với vấn đề. Các container giải quyết configuration drift và sự nhất quán triển khai. Nếu bạn không có vấn đề đó, bạn không cần container."

## AWS Batch: Container Cho Các Công Việc Quy Mô Lớn

ECS và EKS được thiết kế cho các dịch vụ chạy lâu — các ứng dụng chạy liên tục, nhận các request, và mở rộng với lưu lượng. Nhưng một số workload thì khác: chúng chạy trong một khoảng thời gian cố định, xử lý một tập dữ liệu định trước, rồi dừng. Tạo các hóa đơn cuối tháng cho hàng trăm nhà hàng. Chạy một công việc huấn luyện machine learning. Xử lý một export phân tích hàng đêm.

Đối với các workload này, bạn không muốn một dịch vụ — bạn muốn một công việc (job).

**AWS Batch** là một dịch vụ được quản lý hoàn toàn chạy các công việc tính toán theo lô ở bất kỳ quy mô nào. Bạn định nghĩa công việc của mình như một Docker container (cùng định dạng container mà ECS dùng), và Batch xử lý phần còn lại: cấp phát compute EC2 hoặc Fargate, lập lịch các công việc vào các hàng đợi, mở rộng công suất lên khi các công việc đến và trở về không khi chúng xong.

Các khái niệm chính:

- **Job definition:** Docker container, các yêu cầu tài nguyên (vCPU, bộ nhớ), và lệnh để chạy
- **Job queue:** nơi các công việc đã gửi chờ trước khi chạy; mỗi hàng đợi được liên kết với một hoặc nhiều compute environment
- **Compute environment:** công suất EC2 hoặc Fargate bên dưới. Có thể dùng Spot Instance để tiết kiệm chi phí tới 90% — Batch xử lý các gián đoạn và thử lại tự động

"Khoan — nhưng *tại sao* chúng ta lại dùng Batch thay vì chỉ chạy một task ECS?" Maya hỏi.

"Vì một dịch vụ ECS luôn bật," Leo nói. "Nó chờ các request. Một công việc Batch chạy, hoàn tất, và Batch thu nhỏ compute trở về không. Bạn không trả gì giữa các lần chạy."

Tom ngẩng lên từ trang giá. "Còn Spot Instance?"

"Batch có thể chạy trên Spot. Nếu một Spot Instance bị thu hồi giữa công việc, Batch thử lại tự động. Đối với một công việc hóa đơn 45 phút, điều đó ổn."

**so với ECS/EKS:** ECS/EKS chạy các dịch vụ — luôn bật, hướng request. Batch chạy các công việc — thời gian hữu hạn, hướng dữ liệu, mở rộng xuống không khi nhàn rỗi.

**so với Lambda:** Lambda có timeout 15 phút. Các công việc Batch có thể chạy hàng giờ hoặc hàng ngày.

Bối cảnh Nimbus: công việc tạo hóa đơn hàng đêm mất 45 phút cho hàng trăm đối tác nhà hàng. Lambda timeout ở 15 phút. Một dịch vụ ECS luôn-bật lãng phí tiền 23 giờ một ngày. Batch chạy công việc trên các Spot Instance, hoàn tất trong 38 phút, tốn $1.20, và tắt đi.

"Cái đó rẻ hơn ly cà phê tôi mua trong khi chờ script cũ hoàn tất," Leo nói.

"Và không có EC2 để quản lý," Priya thêm. "Batch cấp phát nó, chạy nó, chấm dứt nó."

## Điểm Mạnh Và Hạn Chế

**Container**:

- Loại bỏ sự không nhất quán môi trường ("chạy trên máy của tôi")
- Cho phép các lần triển khai nhanh, đáng tin cậy
- Bất biến — cùng image chạy giống hệt ở mọi nơi
- Hiệu quả — nhẹ hơn VM, khởi động nhanh hơn

**ECS**:

- Đơn giản hơn Kubernetes cho các workload tập trung vào AWS
- Tích hợp AWS chặt chẽ (IAM, ALB, CloudWatch, Secrets Manager)
- Lựa chọn Fargate loại bỏ hoàn toàn việc quản lý EC2

**EKS**:

- Tương thích Kubernetes đầy đủ — dùng toàn bộ hệ sinh thái
- Tốt hơn cho các môi trường hybrid hoặc các nhóm có chuyên môn Kubernetes
- Phức tạp hơn để thiết lập và vận hành so với ECS

**Khi nào nó trở nên phức tạp**:

- Các container image phải được xây dựng và quản lý phiên bản — đòi hỏi một pipeline CI/CD
- Gỡ lỗi các container đòi hỏi công cụ khác với gỡ lỗi các tiến trình truyền thống
- Các container có trạng thái (database trong container) đòi hỏi cấu hình lưu trữ bền vững cẩn thận
- Mạng giữa các container (giao tiếp dịch-vụ-đến-dịch-vụ) đòi hỏi hiểu các khái niệm mạng container

## Tóm Tắt

Lambda làm cho compute nhàn rỗi miễn phí. Container làm cho việc triển khai mang tính tất định. Cùng nhau, chúng giải quyết hai trong số các nguyên nhân phổ biến nhất của nỗi đau vận hành cho các đội kỹ thuật đang phát triển.

- **Container** đóng gói code ứng dụng, runtime, và các phụ thuộc cùng nhau — chạy giống hệt ở bất kỳ đâu.
- **Docker** là công nghệ container tiêu chuẩn. Image là blueprint; container là các instance đang chạy.
- **ECR (Elastic Container Registry)** là Docker registry được quản lý của AWS — lưu trữ, quản lý phiên bản, và quét các image của bạn ở đây. Bật quét image để bắt các CVE trước khi triển khai.
- **ECS (Elastic Container Service)** điều phối các container. Bạn xác định các task và dịch vụ; ECS quản lý vị trí và vòng đời.
- **Fargate** là serverless compute cho các container — không có EC2 instance để quản lý. Thường rẻ hơn EC2 launch type ở các quy mô nhỏ do loại bỏ chi phí phụ trội EC2. Ở các quy mô lớn hơn với bin-packing task cẩn thận, EC2 launch type có thể trở nên hiệu quả chi phí hơn.
- **EKS (Elastic Kubernetes Service)** là Kubernetes được quản lý — cho các nhóm cần các tính năng hoặc tính tương thích Kubernetes.
- **Tích hợp Secrets Manager**: tiêm các bí mật vào các container lúc khởi chạy qua task definition — đừng lưu trữ các giá trị bí mật trong các biến môi trường hoặc task definition trực tiếp.
- **Service discovery**: các IP container là phù du. Dùng các tên DNS ALB hoặc Cloud Map để định địa chỉ dịch vụ ổn định.
- Chọn ECS vì sự đơn giản trên AWS; chọn EKS vì tính tương thích hệ sinh thái Kubernetes.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Có Khả Năng Chống Chịu (Lĩnh vực 2, Nhiệm vụ 2.1)*

- **Tín hiệu ECS so với EKS**: Các kịch bản thi đề cập đến "Kubernetes," "Helm," "chuyên môn Kubernetes hiện có," hoặc "điều phối container đa đám mây" → EKS. Mọi thứ khác → ECS.
- **Fargate so với EC2 launch type**: "Không muốn quản lý các EC2 instance cho container," "serverless container," "không quản lý hạ tầng" → Fargate. "Cần các loại instance cụ thể," "các workload GPU," "kiểm soát instance chi tiết" → EC2 launch type.
- **Task role so với task execution role** — một yếu tố phân biệt thi thực sự. **Task execution role** được dùng bởi *agent* ECS thay mặt cho task, trước và xung quanh code của bạn: kéo image từ ECR, lấy các bí mật từ Secrets Manager, ghi các log vào CloudWatch. **Task role** là cái mà *code ứng dụng của bạn bên trong container* dùng để gọi các dịch vụ AWS: đọc từ S3, ghi vào DynamoDB — như các instance role EC2, nhưng theo từng task, nên mỗi task có thể có các quyền khác nhau. "Container cần đọc từ S3" → **task role** (gắn trong task definition). "Task thất bại kéo image / không thể lấy bí mật" → **execution role** thiếu các quyền.
- **Fargate Spot**: chạy các container chịu lỗi trên công suất dư với giảm tới ~70%, với một cảnh báo gián đoạn hai phút — tương đương của Fargate với EC2 Spot, được cấu hình qua các capacity provider. Trigger thi: "chạy các container chịu được gián đoạn ở chi phí thấp nhất mà không quản lý các instance" → Fargate Spot.
- **Quét image ECR**: ECR có thể quét các container image tìm các lỗ hổng đã biết (CVE). Tín hiệu thi: "quét các container tìm các lỗ hổng bảo mật" → quét image ECR.
- **Triển khai blue/green**: ECS hỗ trợ các lần triển khai blue/green qua tích hợp CodeDeploy. Triển khai không-ngừng-hoạt-động với rollback tự động. Mẫu thi: "triển khai không ngừng hoạt động với rollback tự động" → ECS + CodeDeploy blue/green.
- **Tích hợp Secrets Manager**: Tín hiệu thi: "tiêm các bí mật vào các container mà không lưu trữ các giá trị trong các task definition" → dùng trường `secrets` trong task definition tham chiếu một ARN Secrets Manager. Task execution role cần quyền `secretsmanager:GetSecretValue`.
- **ECS Service Auto Scaling**: Mở rộng số lượng task dựa trên CPU, bộ nhớ, hoặc các custom CloudWatch metric. Hoạt động với ALB để định tuyến lưu lượng đến đúng số lượng task đang chạy.
- **AWS Batch:** Compute theo lô được quản lý cho các Docker container. Job queue → compute environment (EC2 hoặc Fargate, hỗ trợ Spot). Dùng khi: timeout Lambda quá ngắn, dịch vụ ECS lãng phí cho các công việc hữu hạn. Trigger thi: "xử lý theo lô quy mô lớn" hoặc "công việc chạy hàng giờ" → AWS Batch.

## Bài Tập

**Bài tập 1 — Ôn lại**

Giải thích sự khác biệt giữa một Docker image và một Docker container. Giải thích sự khác biệt giữa ECS và ECR.

*(Gợi ý: Image so với container thì như công thức so với món ăn đã nấu. ECR lưu trữ các image; ECS chạy chúng.)*

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một công ty có một ứng dụng microservice hiện đang chạy trên các EC2 instance được quản lý thủ công. Đội ngũ vật lộn với các lần triển khai không nhất quán — các EC2 instance khác nhau có các phiên bản thư viện khác nhau, gây ra các lỗi khó tái tạo. Họ muốn chuẩn hóa các lần triển khai trong khi giảm thiểu chi phí vận hành phụ trội cho việc quản lý các máy chủ bên dưới. Đội ngũ không có kinh nghiệm Kubernetes.

Giải pháp nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Container hóa ứng dụng với Docker; dùng Amazon ECS với launch type Fargate  
B) Triển khai trên EC2 với AWS Systems Manager Patch Manager để giữ các instance nhất quán  
C) Container hóa ứng dụng với Docker; dùng Amazon EKS với các node group tự quản lý  
D) Dùng AWS Elastic Beanstalk để quản lý các lần triển khai và cấu hình instance tự động

**Gợi ý 1**: Các container giải quyết trực tiếp vấn đề "môi trường không nhất quán". Các lựa chọn nào dùng container?

**Gợi ý 2**: "Giảm thiểu chi phí vận hành phụ trội cho việc quản lý các máy chủ" → Fargate (không quản lý EC2) so với các node tự quản lý (vẫn quản lý EC2).

**Gợi ý 3**: "Không có kinh nghiệm Kubernetes" → EKS là sự phức tạp vận hành nhiều hơn ECS.

**Đáp án**: A

**Giải thích**: Container hóa với Docker đảm bảo mọi lần triển khai dùng cùng image với cùng các phụ thuộc — loại bỏ configuration drift. ECS với Fargate nghĩa là không có EC2 instance để quản lý. Đội ngũ tập trung vào code ứng dụng và các định nghĩa container, không phải bảo trì máy chủ. ECS (không phải EKS) phù hợp cho các nhóm không có kinh nghiệm Kubernetes.

**Tại sao không phải B?** Patch Manager giữ các EC2 instance được cập nhật nhưng không giải quyết sự không nhất quán phiên bản thư viện giữa các ứng dụng. Vấn đề căn bản (các môi trường code khác nhau trên các instance khác nhau) vẫn còn.

**Tại sao không phải C?** EKS với các node group tự quản lý đòi hỏi quản lý các EC2 instance *và* học Kubernetes. Không cái nào phù hợp với các yêu cầu.

**Tại sao không phải D?** Elastic Beanstalk quản lý việc triển khai ứng dụng trên EC2 nhưng không giải quyết sự không nhất quán môi trường căn bản trừ khi các container được dùng. Beanstalk không dùng các Docker image theo mặc định (dù nó có thể được cấu hình để dùng).

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Có Khả Năng Chống Chịu — Nhiệm vụ 2.1*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Nimbus đang tách API monolithic thành ba microservice: dịch vụ order, dịch vụ menu, và dịch vụ notification. Mỗi dịch vụ có các yêu cầu mở rộng khác nhau (dịch vụ order mở rộng với lưu lượng; dịch vụ menu hầu hết chỉ-đọc và ổn định; dịch vụ notification có các đợt bùng nổ đột biến).

Thiết kế kiến trúc ECS cho ba dịch vụ này. Bạn sẽ xử lý giao tiếp dịch-vụ-đến-dịch-vụ thế nào? Bạn sẽ dùng một cụm ECS hay ba? Bạn sẽ cấu hình Auto Scaling khác nhau cho mỗi dịch vụ thế nào?

Cân nhắc: dịch vụ menu nặng-đọc và có thể phục vụ dữ liệu cũ trong 60 giây — bạn sẽ thêm caching trước nó không? Dịch vụ notification mở-rộng-đột-biến mạnh vào các tối thứ Sáu — bạn sẽ đặt Fargate Min capacity là 1 và Max là 20 không? Chuyện gì xảy ra với các thông báo đang trên đường trong một sự kiện thu nhỏ?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành kiến trúc microservice trên ECS.)*

## Cảnh Sau Tín Dụng

Lần triển khai container đầu tiên hoàn hảo.

Phiên bản mới của API: không ngừng hoạt động. ECS triển khai nó ra, các health check vượt qua, các task cũ drain, các task mới tiếp quản. Leo theo dõi trạng thái task trong console với một thứ gì đó tiệm cận sự hoài nghi.

"Nó chỉ hoạt động," anh nói.

"Tuần trước anh đã nói cùng điều đó về lần triển khai SSH thủ công trước khi nó thất bại trên instance ba," Priya nói.

"Tôi đã triển khai nó rồi — ồ." Leo dừng lại. "Tôi đã triển khai mà không gắn tag phiên bản image. Để tôi sửa cái đó."

"Đó là điểm mấu chốt," Priya nói. "Quản lý phiên bản image là cách bạn theo dõi cái gì đang chạy."

"Làm sao anh biết phiên bản nào đang ở trong production ngay bây giờ?" Maya hỏi.

Leo mở console ECS. Dưới task đang chạy, image được liệt kê: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Phiên bản 1.0.3. Được build lúc 14:22 UTC. Được triển khai lúc 14:31 UTC.

"Trên thiết lập EC2 cũ," Leo nói, "tôi sẽ phải SSH vào một instance và chạy `pip show` để xem phiên bản nào của mỗi phụ thuộc đã được cài. Và nó có thể đã khác trên các instance khác."

"Và giờ?"

"Tag trên image cho tôi biết chính xác cái gì đang chạy. Lịch sử quét ECR cho tôi biết liệu nó đã được quét chưa. Lịch sử triển khai ECS cho tôi biết khi nào nó được triển khai và phiên bản trước là gì."

"Không SSH. Không ngừng hoạt động. Không 'chờ nó khởi động lại.'"

"Image là artifact triển khai," Priya nói. "Môi trường là bất biến. Quy trình triển khai là khai báo. Đây là cách phần mềm nên được vận chuyển."

Leo nhìn chằm chằm vào console thêm một lúc.

"Tôi đã dành ba năm điều phối các lần triển khai EC2," anh nói. "Điều phối các script SSH. Viết các runbook triển khai."

"Anh đang giải quyết một vấn đề," Priya nói, "mà các container giải quyết theo thiết kế."

Anh không nói gì sau đó. Nhưng sáng hôm sau, anh bắt đầu viết tài liệu về quy trình build container, để không ai khác phải dành ba năm tìm ra nó.

Lỗi instance-ba, sáu tuần drift không được ghi lại, và các vấn đề như nó mà họ chưa bắt được — tất cả đều có một nguyên nhân gốc duy nhất. Không phải một kẻ xấu. Không phải một lỗi phần cứng. Chỉ là một máy chủ đã được đối xử như một vật cố định vĩnh viễn thay vì một đơn vị dùng-một-lần.

Container là câu trả lời cho điều đó. Không phải vì nó mới và thú vị. Mà vì nó làm cho câu hỏi không thể hỏi được.

Trong chương tiếp theo: sơ đồ luồng tự chạy — và nhớ nơi nó dừng lại.
