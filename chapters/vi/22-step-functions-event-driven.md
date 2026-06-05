# Chương 22: Sơ Đồ Tự Chạy

Xác nhận đơn hàng tại Nimbus yêu cầu năm thứ xảy ra tuần tự: tính phí thẻ, gửi email xác nhận, thông báo nhà hàng, cập nhật kho, và ghi nhật ký giao dịch cho kế toán. Nếu bước ba thất bại — nếu thông báo nhà hàng hết thời gian — bước một và hai đã xảy ra.

Leo có tên cho loại bug này: thành công một phần.

**AWS Step Functions: Điều Phối Workflow**

**AWS Step Functions** là dịch vụ điều phối serverless điều phối các bước của ứng dụng như một workflow trực quan.

Mỗi bước là một **state** trong một **state machine**.

Mỗi state có thể:

- **Thực thi một hàm Lambda** (mẫu phổ biến nhất)
- **Thực thi một ECS task**
- **Chờ đợi thời gian cụ thể**
- **Chọn một con đường** dựa trên điều kiện
- **Chạy các nhánh song song** đồng thời
- **Thử lại khi lỗi** với backoff có thể cấu hình
- **Bắt lỗi** và định tuyến đến các state xử lý lỗi

**Standard so với Express Workflow**

**Standard workflow**: Tối đa một năm. Bền vững, có thể kiểm tra, ít nhất một lần.

**Express workflow**: Tối đa 5 phút. Thông lượng cao hơn. Tốt cho xử lý sự kiện thời gian thực.

## Tóm Tắt

- **Step Functions** điều phối các workflow nhiều bước dưới dạng state machine.
- **Retry và catch** được tích hợp trong mỗi state.
- **Standard workflow**: chạy dài (đến 1 năm), bền vững, ít nhất một lần. Cho các quy trình kinh doanh quan trọng.
- **Express workflow**: thời gian ngắn (đến 5 phút), thông lượng cao. Cho xử lý sự kiện khối lượng lớn.
- **Kiến trúc hướng sự kiện** sử dụng SNS, SQS, Lambda và EventBridge để tách rời các hệ thống xung quanh các sự kiện.

## Cảnh Sau Tín Dụng

Workflow đăng ký nhà hàng đã hoạt động.

Trong tháng tiếp theo, 12 đối tác nhà hàng mới đã được đăng ký. Hai trường hợp có lỗi trong bước xử lý thanh toán. Trong cả hai trường hợp, Step Functions đã ghi lại lỗi chính xác, lưu trạng thái thực thi.

Leo đã sửa nguyên nhân gốc và sau đó thử lại cả hai lần thực thi từ bước ba. Các lần thực thi hoàn thành trong 23 giây mỗi lần, tiếp tục chính xác từ nơi chúng đã thất bại.

Chương tiếp theo: phải làm gì với dữ liệu bạn không truy cập ngay bây giờ, nhưng chắc chắn muốn giữ mãi mãi.
