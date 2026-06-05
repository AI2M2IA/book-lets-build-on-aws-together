# Chương 14: Ai Được Phép Làm Gì

Tom có các access key mở trong tệp văn bản, sẵn sàng để dán.

"Bạn đang làm gì vậy?" Priya hỏi.

"EC2 instance cần đọc file cấu hình từ S3. Tôi đang đặt thông tin đăng nhập vào cấu hình máy chủ."

Cô nhìn màn hình một lúc. "Đóng tệp đó lại."

"Nếu ai đó xâm phạm máy chủ đó," cô nói, "họ lấy được những key đó. Và những key đó có quyền với bất cứ điều gì IAM user được phép làm."

Tom đóng tệp lại.

"Có cách tốt hơn," cô nói. "Bản thân máy chủ có thể có một role. Hãy nghĩ về nó như một chức danh công việc — instance không cần thông tin đăng nhập vì hệ thống đã biết nó là gì và nó được phép làm gì."

**Quay Lại IAM: Bức Tranh Đầy Đủ**

Các policy IAM là các tài liệu JSON chỉ định những hành động nào được phép hoặc bị từ chối trên tài nguyên nào:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

**Vấn Đề Với "AdministratorAccess"**

`AdministratorAccess` cấp mọi hành động trên mọi tài nguyên. Nếu thành viên nhóm có policy này mắc lỗi — vô tình xóa bucket S3, chấm dứt EC2 instance sai — không có gì AWS có thể làm để ngăn họ.

**IAM Role: Danh Tính Cho Các Service**

Các EC2 instance chạy Nimbus API cần:

- Đọc từ DynamoDB (menu)
- Ghi vào DynamoDB (đơn hàng)
- Đặt đối tượng trong S3 (biên lai, tải lên)
- Ghi nhật ký vào CloudWatch
- Đọc bí mật từ Secrets Manager

Thay vì tạo user với access key và lưu trữ key đó trên EC2 instance — một cơn ác mộng bảo mật — bạn tạo **IAM Role** cho EC2 instance với chính xác những quyền này.

**Permission Boundaries: Giới Hạn Những Gì Role Có Thể Cấp**

**Permission boundary** đặt ra quyền tối đa mà bất kỳ danh tính nào có thể có. Ngay cả khi các policy được gắn vào danh tính rộng hơn, các quyền hiệu quả bị giới hạn bởi permission boundary.

**SCP: Guardrail Cấp Tổ Chức**

**Service Control Policies (SCP)** áp dụng các guardrail ảnh hưởng đến *mọi* thực thể IAM trong tài khoản, kể cả quản trị viên.

## Tóm Tắt

- Tránh **AdministratorAccess** trong sản xuất.
- Policy IAM chỉ định **Effect**, **Action** và **Resource** — cụ thể trên cả ba.
- EC2 instance, hàm Lambda và các AWS service khác nên sử dụng **IAM Role**, không phải access key.
- **Permission boundary** giới hạn quyền tối đa bất kỳ danh tính nào có thể có.
- **SCP** áp dụng các hạn chế toàn tổ chức mà ngay cả quản trị viên không thể ghi đè.

## Mẹo Thi

- **IAM Role cho EC2**: Câu trả lời chuẩn khi EC2 cần truy cập S3, DynamoDB, Secrets Manager.
- **Logic đánh giá policy**: Explicit Deny luôn thắng.
- **Permission boundary**: Được sử dụng khi ủy quyền quản trị IAM.
- **SCP không cấp quyền**: Chúng chỉ hạn chế.

## Cảnh Sau Tín Dụng

Leo dành cả tuần cuối viết lại IAM.

Thứ Hai, mọi service đều có role với chính xác quyền cần thiết.

Priya xem xét công việc của anh sáng thứ Ba.

"Điều này thật tốt," cô nói.

"Cảm ơn," Leo nói.

"Bạn đã để lại một thứ."

Leo cứng người.

"Key deploy cũ từ phiên bản đầu tiên. Trong bí mật GitHub Actions."

"Cái đó đã bị vô hiệu hóa."

Priya gõ điều gì đó. "Có phải không?"

Một khoảng dừng.

"Tôi sẽ điều tra," Leo nói.

Chương tiếp theo: sự khác biệt giữa bảo vệ nhớ mặt và cửa chỉ đọc thẻ.
