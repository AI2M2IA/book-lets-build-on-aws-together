# Chương 11: Góc Riêng Tư Của Bạn Trong Đám Mây

Priya có một tờ giấy với một bản vẽ trên đó.

Đó không phải là bản vẽ phức tạp. Một hình chữ nhật, được gán nhãn "AWS". Bên trong hình chữ nhật, một cụm hộp: EC2 instance, cơ sở dữ liệu RDS, cụm ElastiCache. Các đường kết nối mọi thứ với nhau. Và bên ngoài hình chữ nhật, một nhãn duy nhất: "Internet".

Cô đặt nó ở giữa bàn.

"Đây là những gì chúng ta có," cô nói. "Cơ sở dữ liệu của chúng ta có địa chỉ IP công khai. Lớp cache của chúng ta có thể tiếp cận từ internet. Các EC2 instance của chúng ta đều trên cùng mạng phẳng."

"Nghe có vẻ ổn," Leo nói. "Chúng ta có security group."

"Security group mà bạn đã cấu hình," Priya nói. "Vào ban đêm. Trong quá trình thiết lập ban đầu."

Leo không nói gì.

"Khi mọi thứ sống trên mạng phẳng công khai, một cấu hình sai duy nhất là sự khác biệt giữa hệ thống hoạt động và hệ thống có thể truy cập bởi mọi người trên internet."

**VPC Là Gì?**

**Virtual Private Cloud (VPC)** là một phần mạng được cô lập về mặt logic của đám mây AWS — một mạng riêng tư mà bạn xác định, chỉ có tài nguyên của bạn có thể truy cập theo mặc định.

Khi bạn tạo VPC, bạn xác định:

**Khối CIDR**: Phạm vi địa chỉ IP có sẵn bên trong mạng của bạn.

**Subnet**: Các phân khu của VPC, mỗi cái được gán một phần của dải địa chỉ IP.

**Bảng định tuyến**: Các quy tắc xác định nơi lưu lượng mạng đi.

**Internet Gateway**: Kết nối giữa VPC và internet công khai.

**Subnet: Công Khai So Với Riêng Tư**

**Subnet công khai** kết nối với Internet Gateway và có thể có các tài nguyên với địa chỉ IP công khai.

**Subnet riêng tư** không có kết nối internet trực tiếp. Các tài nguyên trong subnet riêng tư chỉ có thể giao tiếp với các tài nguyên khác trong VPC.

Đối với Nimbus, thiết kế trở nên rõ ràng: Load balancer công khai — nó cần nhận lưu lượng từ internet. EC2 instance riêng tư — chúng chỉ nhận lưu lượng từ load balancer. Cơ sở dữ liệu riêng tư — chúng chỉ nhận lưu lượng từ EC2 instance.

**NAT Gateway: Subnet Riêng Tư Vẫn Có Thể Tải Xuống**

Subnet riêng tư không thể tiếp cận internet. Nhưng đôi khi chúng cần. EC2 instance của bạn cần tải xuống bản cập nhật phần mềm.

**NAT Gateway** (Network Address Translation) ngồi trong subnet công khai. Các tài nguyên trong subnet riêng tư có thể gửi lưu lượng đi đến NAT Gateway, chuyển tiếp nó đến internet — nhưng internet không thể khởi tạo kết nối ngược lại.

## Tóm Tắt

- **VPC** là mạng riêng tư được cô lập về mặt logic trong AWS.
- **Subnet** chia VPC theo Availability Zone. Subnet công khai kết nối với Internet Gateway; subnet riêng tư không.
- Đặt tài nguyên đối mặt với internet (load balancer) trong subnet công khai. Đặt tất cả mọi thứ khác (EC2, cơ sở dữ liệu, cache) trong subnet riêng tư.
- **NAT Gateway** (trong subnet công khai) cho phép tài nguyên riêng tư khởi tạo kết nối internet đi mà không chấp nhận kết nối đến.
- **VPC Peering** kết nối hai VPC một cách riêng tư. Không chuyển tiếp.

## Mẹo Thi

- **Subnet công khai so với riêng tư**: sự khác biệt là bảng định tuyến. Subnet công khai có tuyến đến Internet Gateway. Subnet riêng tư không.
- **Vị trí NAT Gateway**: luôn trong subnet *công khai*.
- **VPC Peering không chuyển tiếp**: kỳ thi sẽ mô tả ba VPC và hỏi liệu chúng có thể giao tiếp qua cái ở giữa — câu trả lời là không.
- **VPC Endpoint**: cho phép tài nguyên riêng tư tiếp cận các AWS service (S3, DynamoDB) mà không cần đi qua NAT Gateway.

## Cảnh Sau Tín Dụng

Priya đã thiết kế lại mạng.

Ba ngày sau, mọi tài nguyên đều ở đúng vị trí. EC2 instance trong subnet riêng tư. Load balancer trong subnet công khai. RDS và ElastiCache chỉ có thể truy cập từ lớp ứng dụng.

Leo đã thử SSH trực tiếp vào cơ sở dữ liệu để kiểm tra điều gì đó. Anh không thể. Kết nối hết thời gian.

"Tốt," Priya nói.

Chương tiếp theo: cách internet tìm thấy Nimbus — bộ máy vô hình của tên miền.
