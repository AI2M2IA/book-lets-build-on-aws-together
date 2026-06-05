# Chương 18: Khi Mọi Thứ Bị Hỏng

Chương này nói về sự cố — được lên kế hoạch, được thiết kế để chống lại, và cuối cùng được chấp nhận là không thể tránh khỏi. Đây có thể là chương quan trọng nhất trong cuốn sách.

Nimbus đang chạy tốt. Các lớp bảo mật đã được triển khai.

Rồi Leo nhận được thông báo Slack lúc 11:23 tối một ngày thứ Năm: lỗi phần cứng ở us-east-1b.

Hai mươi hai phút dịch vụ bị suy giảm trước khi anh nhận thấy và chuyển sang us-east-1a.

**Tương Tự Lưới Điện**

Hãy nghĩ về cách nhà bạn nhận điện. Điện không đến từ một sợi dây duy nhất từ một máy phát. Nó đến từ một lưới — mạng lưới máy phát, trạm biến thế và đường dây truyền tải hỗ trợ lẫn nhau.

Availability Zone của AWS hoạt động theo cách tương tự.

**Từ Vựng Về Sự Cố**

**Tính khả dụng**: Phần trăm thời gian hệ thống hoạt động. "Bốn chín" (99,99%) có nghĩa là ít hơn 52 phút ngừng hoạt động mỗi năm.

**RTO (Recovery Time Objective)**: Hệ thống có thể bị tắt bao lâu?

**RPO (Recovery Point Objective)**: Bạn có thể mất bao nhiêu dữ liệu?

**Triển Khai Multi-AZ**

Triển khai Multi-AZ phân tán tài nguyên qua hai hay nhiều AZ trong một Region. Nếu một AZ bị lỗi, load balancer dừng định tuyến đến các instance không lành mạnh trong AZ đó, Auto Scaling Group thay thế instance — nhưng trong AZ *lành mạnh*, RDS chuyển sang standby trong AZ lành mạnh.

**Các Chiến Lược Phục Hồi Thảm Họa: Một Phổ**

**Sao lưu và Phục hồi** (giờ RPO/RTO):

- Sao lưu mọi thứ vào S3 ở Region khác
- Chi phí: rất thấp

**Đèn Pilot** (phút đến 1 giờ RPO/RTO):

- Giữ phiên bản tối thiểu của ứng dụng chạy trong DR region

**Warm Standby** (giây đến phút RPO/RTO):

- Chạy phiên bản thu nhỏ của toàn bộ ứng dụng trong DR region

**Active-Active / Multi-Site** (RPO/RTO gần-bằng-không):

- Đầy đủ công suất ở hai hay nhiều Region, phục vụ lưu lượng đồng thời

## Tóm Tắt

- **RTO**: Bao lâu bạn có thể bị tắt. **RPO**: Bạn có thể mất bao nhiêu dữ liệu.
- **Multi-AZ** phân tán tài nguyên qua các AZ trong một Region. Bảo vệ chống lỗi AZ.
- **Multi-Region** triển khai ở nhiều AWS Region. Bảo vệ chống lỗi khu vực.
- Chiến lược DR (rẻ đến đắt nhất): Sao lưu và Phục hồi → Đèn Pilot → Warm Standby → Active-Active.
- RDS Multi-AZ: đồng bộ, tự động failover, RPO = 0. Read replica: bất đồng bộ, nâng cấp thủ công, RPO > 0.

## Cảnh Sau Tín Dụng

Leo đã xây dựng runbook kỹ thuật hỗn loạn.

Lần đầu tiên chạy nó, bước 2 mất 4 phút 17 giây.

"Cam kết RTO của chúng ta với các đối tác nhà hàng là 5 phút," Tom nói.

"Vậy chúng ta đã vượt qua. Chút thôi."

Leo nhìn chằm chằm vào 4:17 trên màn hình.

"Vậy chúng ta cần làm cho nó nhanh hơn," anh nói. Và anh bắt đầu đọc tài liệu Aurora.

Chương tiếp theo: máy phát số lấy số cho phép mỗi phần của Nimbus làm việc theo tốc độ riêng của mình.
