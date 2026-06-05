# Chương 16: Khóa, Ổ Khóa Và Bí Mật

Leo đang xem lịch sử git khi tìm thấy nó. Mật khẩu cơ sở dữ liệu. Được commit sáu tháng trước, dạng văn bản thuần, bởi ai đó không còn làm việc tại Nimbus.

Đó là ngày Nimbus quyết định ngừng đặt bí mật vào code.

**Hai Vấn Đề: Lưu Trữ Bí Mật Và Mã Hóa Dữ Liệu**

Bảo mật xung quanh thông tin nhạy cảm có hai vấn đề riêng biệt:

**Lưu trữ thông tin đăng nhập**: Chúng sống ở đâu? Ai có thể truy cập chúng? Làm thế nào để xoay chúng?

**Mã hóa dữ liệu**: Làm thế nào để đảm bảo ngay cả khi ai đó lấy được quyền truy cập trái phép vào cơ sở dữ liệu hoặc bucket S3, họ không thể đọc dữ liệu?

AWS có dịch vụ chuyên dụng cho mỗi vấn đề:

- **AWS Secrets Manager**: Lưu trữ và quản lý thông tin đăng nhập một cách an toàn
- **AWS KMS (Key Management Service)**: Quản lý khóa mã hóa

**AWS Secrets Manager**

Secrets Manager là kho lưu trữ an toàn cho các bí mật. Thay vì ứng dụng đọc mật khẩu từ biến môi trường hoặc file cấu hình, nó gọi API Secrets Manager khi khởi động và lấy bí mật.

**Xoay Vòng Tự Động: Sức Mạnh Thực Sự**

Mỗi 30 ngày, Secrets Manager tạo mật khẩu cơ sở dữ liệu mới, cập nhật nó trong RDS, cập nhật bí mật được lưu trữ, và ứng dụng của bạn lấy mật khẩu mới vào lần tiếp theo cần. Không có sự can thiệp thủ công.

**AWS KMS**

AWS KMS quản lý **khóa mật mã** — các giá trị bí mật được sử dụng để mã hóa và giải mã dữ liệu.

**Khóa được AWS quản lý**: AWS tự động tạo và quản lý khóa cho các dịch vụ như S3, EBS, RDS. Miễn phí.

**Khóa do khách hàng quản lý**: Bạn tạo khóa trong KMS và kiểm soát mọi khía cạnh của nó.

**Mã Hóa Phong Bì: Cách KMS Thực Sự Hoạt Động**

KMS không mã hóa dữ liệu của bạn trực tiếp trong hầu hết các trường hợp. Nó sử dụng **mã hóa phong bì**:

1. KMS tạo **khóa dữ liệu** (khóa đối xứng duy nhất)
2. Dịch vụ dùng khóa dữ liệu để mã hóa dữ liệu của bạn cục bộ
3. Dịch vụ yêu cầu KMS mã hóa chính khóa dữ liệu
4. Cả dữ liệu được mã hóa và khóa dữ liệu được mã hóa đều được lưu trữ

## Tóm Tắt

- Không bao giờ lưu trữ thông tin đăng nhập trong code, biến môi trường, hoặc file cấu hình.
- **Secrets Manager** lưu trữ thông tin đăng nhập an toàn và xoay vòng chúng tự động.
- **KMS** quản lý các khóa mã hóa. Hầu hết AWS service tích hợp với KMS để mã hóa khi nghỉ.
- **Mã hóa phong bì**: KMS mã hóa khóa, không phải dữ liệu trực tiếp.
- **Parameter Store** là lựa chọn thay thế nhẹ hơn cho Secrets Manager đối với các giá trị cấu hình không nhạy cảm.

## Mẹo Thi

- **Secrets Manager so với SSM Parameter Store**: Secrets Manager cho thông tin đăng nhập cần xoay vòng tự động; Parameter Store cho cấu hình chung.
- **KMS key policy**: Một khóa KMS có key policy riêng của nó. IAM policy một mình không cấp quyền truy cập vào khóa KMS.
- **Mã hóa RDS**: Không thể bật mã hóa trên RDS instance không được mã hóa hiện có.

## Cảnh Sau Tín Dụng

Các bí mật đã được di chuyển.

Mật khẩu cơ sở dữ liệu: Secrets Manager, xoay vòng mỗi 30 ngày. Key API: Secrets Manager. Dữ liệu đơn hàng khách hàng: được mã hóa bằng khóa KMS do khách hàng quản lý. Thông tin đăng nhập cũ: bị vô hiệu hóa.

"Chúng ta sẵn sàng kiểm toán rồi," Priya nói.

Chương tiếp theo: ba lớp phòng thủ đứng giữa Nimbus và internet.
