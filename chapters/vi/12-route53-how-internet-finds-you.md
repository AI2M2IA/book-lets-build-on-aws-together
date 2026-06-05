# Chương 12: Cách Internet Tìm Thấy Bạn

Nimbus đang chạy. Load balancer có IP công khai. EC2 instance có IP riêng tư. Cơ sở dữ liệu bị khóa trong subnet riêng tư. Priya gật đầu chấp thuận sơ đồ mạng.

Tom nhìn vào URL của load balancer: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

"Đó là những gì khách hàng gõ vào trình duyệt của họ?" anh hỏi.

"Đó là những gì AWS tự động gán," Maya nói.

"Tôi sẽ không đặt cái đó lên danh thiếp."

"Tôi cũng vậy."

Họ cần một tên miền. Họ đã mua `eatnimbus.com`. Bây giờ họ cần kết nối tên đó với cơ sở hạ tầng AWS.

**Tương Tự Sách Điện Thoại**

Trước điện thoại thông minh, mỗi thành phố có sách điện thoại. Nếu bạn muốn đến "Nhà hàng Mario", bạn không ghi nhớ số điện thoại của họ — bạn tra tên, lấy số, và gọi.

Internet có sách điện thoại riêng của nó: **Hệ Thống Tên Miền (DNS)**.

DNS dịch các tên có thể đọc được bởi con người (như `eatnimbus.com`) thành địa chỉ IP có thể đọc được bởi máy (như `203.0.113.42`).

**Gặp Gỡ Route 53**

Amazon Route 53 là dịch vụ DNS được quản lý của AWS.

Route 53 làm một số thứ:

**Đăng ký tên miền**: Bạn có thể mua tên miền qua Route 53.

**Lưu trữ DNS (hosted zone)**: Bạn tạo *hosted zone* cho tên miền của mình.

**Kiểm tra sức khỏe**: Route 53 có thể theo dõi các endpoint và định tuyến lưu lượng khỏi những cái không khỏe mạnh.

**Các chính sách định tuyến**: Route 53 hỗ trợ nhiều chiến lược định tuyến.

**Bản Ghi DNS**

**Bản ghi A**: Ánh xạ tên đến địa chỉ IPv4.

**CNAME**: Ánh xạ tên đến tên khác.

**Alias record**: Phần mở rộng đặc biệt của AWS cho DNS. Alias record ánh xạ tên trực tiếp đến tài nguyên AWS và Route 53 tự động xử lý phân giải IP động.

**Các Chính Sách Định Tuyến**

**Định tuyến đơn giản**: Một bản ghi, một đích. DNS chuẩn.

**Định tuyến có trọng số**: Phân chia lưu lượng giữa nhiều đích theo trọng số.

**Định tuyến dựa trên độ trễ**: Định tuyến người dùng đến AWS region có độ trễ thấp nhất.

**Định tuyến theo địa lý**: Định tuyến dựa trên vị trí địa lý của người dùng.

**Định tuyến Failover**: Chỉ định primary và secondary. Nếu primary không vượt qua kiểm tra sức khỏe, lưu lượng tự động được chuyển hướng đến secondary.

## Tóm Tắt

- **DNS** dịch tên miền thành địa chỉ IP.
- **Route 53** là dịch vụ DNS được quản lý của AWS.
- **Alias record** ánh xạ tên đến tài nguyên AWS với IP động.
- Các chính sách định tuyến ngoài DNS đơn giản: **có trọng số**, **dựa trên độ trễ**, **địa lý**, **failover**.

## Cảnh Sau Tín Dụng

`eatnimbus.com` đã hoạt động.

Maya đã gõ nó vào trình duyệt và trang đặt hàng Nimbus đã tải. Cô đã đặt bánh arepa từ nhà hàng gia đình, chỉ để kiểm tra luồng. Đơn hàng đã qua. Nhà bếp đã nhận được.

Tom đã đọc nhật ký kiểm tra sức khỏe Route 53. "Thời gian phản hồi là 47 mili giây từ us-east-1."

"Điều đó có nhanh không?" Maya hỏi.

"Đối với DNS? Có."

"Nhưng đối với người dùng ở Seattle?"

Tom nhìn vào biểu đồ độ trễ. "Khoảng 80 mili giây."

Maya nghĩ về điều đó. "Nếu hầu hết khách hàng của chúng ta ở Bờ Tây, và máy chủ của chúng ta ở Virginia..."

"Mỗi yêu cầu đi từ Seattle đến Virginia và trở lại," Leo nói từ phía bên kia phòng. "Tốc độ ánh sáng. Bạn không thể đánh bại vật lý."

"Vậy chúng ta cần máy chủ gần Seattle hơn."

"Hoặc thứ gì đó gần Seattle hơn phục vụ nội dung thay họ."

Suy nghĩ đó lơ lửng trong không khí.

Chương tiếp theo: những nhà kho đặt nội dung của Nimbus chỉ một giây cách mọi người dùng, ở khắp nơi.
