# Chương 20: Mô Hình Freelancer

Hàm thông báo đơn hàng chạy đúng một lần mỗi đơn hàng. Giữa các đơn hàng, nó không làm gì. Trong mười bảy giờ vào thứ Ba, không có đơn hàng nào đến. Trong mười bảy giờ đó, hàm không tốn gì. Không một xu.

"Dịch vụ email," Priya nói. "Chúng ta gửi bao nhiêu email mỗi giờ?"

"Trung bình 400. Đỉnh khoảng 1.200 vào tối thứ Sáu."

"Và EC2 instance chạy dịch vụ email — nó chạy bao lâu?"

"Luôn luôn. 24/7."

"Ngay cả lúc 3 giờ sáng khi chúng ta gửi không email nào?"

Im lặng.

"Chúng ta đang trả tiền cho một máy tính ngồi đó không làm gì," Leo nói.

**AWS Lambda: Code Không Có Máy Chủ**

**AWS Lambda** cho phép bạn chạy code để phản hồi các sự kiện mà không cần cung cấp hoặc quản lý máy chủ.

Một hàm Lambda:

- Không có trạng thái bền vững
- Chạy tối đa 15 phút mỗi lần gọi
- Tự động mở rộng từ 0 đến hàng nghìn lần gọi đồng thời
- Chỉ được tính phí khi chạy (mỗi 1ms thực thi)

**Trigger Sự Kiện**

Các trigger phổ biến bao gồm: SQS queue, API Gateway, S3 event, SNS, DynamoDB Streams, EventBridge.

**Vấn Đề Cold Start**

Khi hàm được gọi:

1. AWS kiểm tra xem có môi trường thực thi ấm không
2. Nếu ấm: hàm chạy ngay lập tức
3. Nếu lạnh: AWS khởi tạo môi trường thực thi mới — tải code, khởi động runtime — rồi chạy hàm

**Cold start** thêm 100ms đến vài giây độ trễ.

**Định Giá Lambda**

Hai thành phần:

1. **Phí yêu cầu**: $0.20 mỗi triệu lần gọi
2. **Phí thời gian**: $0.0000166667 mỗi GB-giây

Một triệu yêu cầu đầu tiên mỗi tháng là miễn phí (luôn luôn).

## Tóm Tắt

- **AWS Lambda** chạy code để phản hồi các sự kiện mà không quản lý máy chủ.
- **Trả theo mức sử dụng**: được tính phí mỗi lần gọi và mỗi 1ms thực thi. Chi phí bằng không khi không hoạt động.
- Tự động mở rộng từ 0 đến hàng nghìn lần gọi đồng thời.
- **Cold start**: độ trễ khởi tạo khi không có môi trường thực thi ấm.
- Tốt nhất cho: xử lý hướng sự kiện, công việc ngắn, lưu lượng không đều.
- Không tốt cho: quy trình dài (giới hạn 15 phút), ứng dụng có trạng thái.

## Cảnh Sau Tín Dụng

Tom xem lại hóa đơn cuối tháng.

Dịch vụ email: biến mất khỏi hóa đơn EC2. Xử lý thay đổi kích thước ảnh: biến mất. Tác vụ dọn dẹp hàng đêm: biến mất.

Tổng phí Lambda cho tháng: $4.23.

"Bốn đô la," Tom nói.

"Và hai mươi ba xu," Leo thêm vào.

Tom nhìn hóa đơn tháng trước, khi tất cả các dịch vụ đó đều trên EC2.

"Chúng ta đang trả $187 cho cùng các workload."

"Lambda không tính phí thời gian không hoạt động," Leo nói.

Tom nhìn chằm chằm vào màn hình một lúc.

"Tôi rút lại mọi thứ tôi đã nói về serverless là một từ hype," anh nói.

Chương tiếp theo: container vận chuyển làm cho mọi máy chủ cảm thấy như ở nhà.
