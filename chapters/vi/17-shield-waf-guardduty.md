# Chương 17: Những Người Canh Gác

Sự cố với IP Romania đã được ngăn chặn. Priya hỏi: "Nếu điều gì đó bất thường xuất hiện trong nhật ký CloudTrail, làm sao chúng ta biết?"

Câu trả lời thành thật là: có lẽ không biết.

CloudTrail ghi lại hàng nghìn sự kiện mỗi ngày. Không ai đọc tất cả chúng.

"Chúng ta cần thứ gì đó theo dõi nhật ký thay chúng ta," cô nói.

**Ba Danh Mục Mối Đe Dọa**

Các mối đe dọa bảo mật chống lại ứng dụng đám mây thuộc ba danh mục:

**Tấn công khối lượng (DDoS)**: Kẻ tấn công gửi quá nhiều lưu lượng.

**Tấn công ứng dụng (Khai thác)**: Kẻ tấn công gửi các yêu cầu SQL injection, cross-site scripting.

**Sự bất thường hành vi (Trinh sát và xâm phạm)**: Các lời gọi API không nên xảy ra, hoạt động IAM bất thường.

AWS có dịch vụ chuyên dụng cho từng loại:

- **AWS Shield**: Bảo vệ DDoS
- **AWS WAF**: Bảo vệ lớp ứng dụng
- **Amazon GuardDuty**: Phát hiện mối đe dọa hành vi

**AWS Shield**

**AWS Shield Standard** được bật tự động cho tất cả khách hàng AWS miễn phí. Bảo vệ chống lại các cuộc tấn công DDoS lớp 3 và 4 phổ biến nhất.

**AWS Shield Advanced** ($3.000/tháng mỗi tổ chức): Thêm bảo vệ cho EC2, ELB, CloudFront. Thông báo tấn công gần thời gian thực. Quyền truy cập Nhóm Phản Hồi AWS Shield.

**AWS WAF**

**AWS WAF** hoạt động ở cấp HTTP — kiểm tra nội dung của các yêu cầu web trước khi chúng đến ứng dụng.

**Nhóm Quy Tắc Được Quản Lý**:

- **AWS Managed Rules - Core Rule Set**: Bảo vệ chống lại OWASP Top 10
- **AWS Managed Rules - Amazon IP Reputation List**: Chặn IP liên quan đến botnet

**Amazon GuardDuty**

GuardDuty phân tích liên tục:

- **Nhật ký AWS CloudTrail**: Thay đổi IAM, lời gọi API, đăng nhập console
- **Nhật ký VPC Flow**: Các mẫu lưu lượng mạng trong VPC
- **Nhật ký truy vấn DNS**

"Đây là điều đã bắt được IP Romania," Leo nói thầm.

GuardDuty đã được bật.

## Tóm Tắt

- **AWS Shield Standard**: Bảo vệ DDoS lớp 3/4 miễn phí và tự động.
- **AWS Shield Advanced**: Bảo vệ DDoS cao cấp với quyền truy cập SRT và bảo vệ chi phí.
- **AWS WAF**: Tường lửa lớp ứng dụng. Kiểm tra và lọc các yêu cầu HTTP.
- **Amazon GuardDuty**: Phát hiện mối đe dọa hành vi. Phân tích CloudTrail, VPC Flow Log và nhật ký DNS.
- **CloudTrail**: Nền tảng của tất cả ghi nhật ký bảo mật AWS.

## Mẹo Thi

- **Shield Standard so với Advanced**: Standard miễn phí và tự động. Advanced trả tiền và thêm SRT, bảo vệ chi phí.
- **Tín hiệu WAF**: "chặn SQL injection," "giới hạn lời gọi API," "OWASP Top 10" → WAF.
- **Tín hiệu GuardDuty**: "phát hiện hoạt động API bất thường," "xác định IAM bị xâm phạm" → GuardDuty.

## Cảnh Sau Tín Dụng

GuardDuty đã được bật.

Bốn mươi tám giờ sau, nó tạo ra phát hiện đầu tiên: *"EC2 Instance đang giao tiếp với một nút thoát Tor đã biết."*

Leo nhìn vào ID instance.

"Đó là instance giám sát nội bộ," anh nói.

"Nó có được giả định giao tiếp với các nút thoát Tor không?"

"Không." Anh dừng lại. "Tại sao vậy?"

Anh kéo lên instance. Ai đó đã cài đặt một công cụ lên nó — một trình quét mạng mã nguồn mở hợp lệ cũng giao tiếp với cơ sở hạ tầng Tor để thu thập dữ liệu ẩn danh.

Leo đã gỡ cài đặt công cụ đó. Anh thiết lập quy trình xem xét mọi công cụ bên thứ ba trước khi cài đặt.

Chương tiếp theo: điều gì xảy ra khi trung tâm dữ liệu ở Virginia biến mất — và tại sao Nimbus vẫn chạy.
