# Chương 15: Những Người Gác Ở Cổng

Key deploy cũ từ phiên bản đầu tiên của Nimbus vẫn còn hoạt động. Nó đã thực hiện ba cuộc gọi API tuần trước. Leo không biết điều gì đã thực hiện chúng.

Priya đã kéo lên nhật ký VPC flow — hồ sơ lưu lượng mạng hiển thị mọi kết nối vào và ra khỏi VPC.

"Vào thứ Ba lúc 2:17 sáng," cô nói, "có một kết nối đi từ EC2 instance chạy API cũ đến địa chỉ IP ở Romania."

"Đó không phải là cơ sở hạ tầng của chúng ta," Leo nói.

"Không."

Họ đã truy ngược lại: key deploy cũ được sử dụng để tải lên một script nhỏ lên EC2 instance. Script cố gắng quét các cổng trên các máy chủ lân cận. Hầu hết các lần quét đã thất bại.

"Security group đã chặn chúng," Priya nói. "Kẻ tấn công lọt vào một EC2 instance. Chúng không thể tiếp cận những cái khác vì security group chỉ cho phép lưu lượng từ load balancer."

**Hai Lớp Bảo Mật Mạng**

Trong VPC, bạn có hai công cụ riêng biệt để kiểm soát lưu lượng mạng:

**Security Group**: Tường lửa ảo gắn vào các tài nguyên riêng lẻ. Chúng hoạt động ở cấp tài nguyên.

**NACL**: Các quy tắc tường lửa gắn vào subnet. Chúng hoạt động ở ranh giới subnet.

Hiểu cả hai đòi hỏi hiểu một sự khác biệt quan trọng: **stateful so với stateless**.

**Stateful: Security Group**

Security group là **stateful**.

Khi bạn cho phép lưu lượng đến trên một cổng cụ thể, lưu lượng phản hồi được tự động cho phép đi ra.

Security group chỉ có thể **cho phép** lưu lượng — không thể tạo các quy tắc từ chối rõ ràng.

**Stateless: NACL**

NACL là **stateless**.

Khi bạn cho phép lưu lượng đến trên cổng 8080, điều đó chỉ bao gồm lưu lượng đến. Phản hồi (lưu lượng đi trên các cổng tạm thời) phải được cho phép rõ ràng với quy tắc đi.

Các quy tắc NACL được đánh số và đánh giá theo thứ tự. Quy tắc khớp đầu tiên thắng.

NACL có thể **từ chối** lưu lượng một cách rõ ràng.

## Tóm Tắt

- **Security Group** là tường lửa stateful cho các tài nguyên riêng lẻ. Chỉ có quy tắc Allow. Tất cả các quy tắc được đánh giá.
- **NACL** là tường lửa stateless cho toàn bộ subnet. Quy tắc Allow và Deny. Quy tắc được đánh giá theo thứ tự số.
- **Stateful** có nghĩa là lưu lượng phản hồi được tự động cho phép. **Stateless** có nghĩa là phải cho phép lưu lượng rõ ràng theo cả hai hướng.
- Security group là lớp kiểm soát truy cập chính. NACL là lớp bổ sung.

## Mẹo Thi

- **Stateful so với stateless**: Đây là sự khác biệt được kiểm tra nhiều nhất.
- **Quy tắc NACL**: Được đánh giá từ số thấp nhất đến cao nhất.
- **Cổng tạm thời**: Lỗi NACL cổ điển là quên cho phép đi ra trên cổng 1024-65535.
- **NACL mặc định so với tùy chỉnh**: NACL mặc định cho phép tất cả lưu lượng. NACL tùy chỉnh từ chối tất cả lưu lượng theo mặc định.

## Cảnh Sau Tín Dụng

Sự cố đã được ngăn chặn. Key deploy bị xâm phạm đã bị vô hiệu hóa. Dải IP Romania đã bị chặn tại NACL.

Priya đã viết báo cáo sự cố. Dòng cuối cùng: "Nguyên nhân gốc: thông tin đăng nhập đang hoạt động từ pipeline triển khai đã ngừng sử dụng không bao giờ được xoay vòng hoặc thu hồi."

Chương tiếp theo: lockbox nơi Nimbus giữ những bí mật của mình.
