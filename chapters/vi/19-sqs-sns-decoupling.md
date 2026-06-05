# Chương 19: Máy Phát Số

Nimbus có một vấn đề không cảm thấy như vấn đề cho đến khi các đơn hàng trở nên phổ biến.

Mỗi khi một đơn hàng được đặt, máy chủ API phải:

1. Lưu đơn hàng vào cơ sở dữ liệu
2. Gửi thông báo đến máy tính bảng của nhà hàng
3. Gửi email xác nhận đến khách hàng
4. Cập nhật bảng điều khiển phân tích
5. Ghi nhật ký sự kiện để thanh toán

Tất cả điều này phải xảy ra đồng bộ trước khi API có thể phản hồi khách hàng. Nếu dịch vụ email chậm, khách hàng phải chờ. Nếu bảng điều khiển phân tích bị tắt, đơn hàng bị lỗi.

"Chúng ta bị ghép chặt chẽ," Priya nói. "Nếu bất kỳ bước nào ở dưới bị lỗi, toàn bộ đơn hàng bị lỗi."

**Amazon SQS: Hàng Đợi**

**Amazon SQS (Simple Queue Service)** là dịch vụ hàng đợi tin nhắn được quản lý.

Luồng cơ bản:

1. **Producer** (máy chủ API) đặt tin nhắn vào hàng đợi
2. API ngay lập tức phản hồi khách hàng: "Đơn hàng đã xác nhận!"
3. **Consumer** (các worker service riêng biệt) đọc tin nhắn từ hàng đợi và xử lý chúng

**Khái Niệm Chính Của SQS**

**Visibility timeout**: Khi consumer đọc tin nhắn, tin nhắn trở nên *vô hình* với các consumer khác.

**Dead-letter queue (DLQ)**: Nếu tin nhắn không xử lý được quá nhiều lần, SQS chuyển nó sang DLQ.

**Loại hàng đợi**:

**Hàng đợi Standard**: Thông lượng tối đa. Thứ tự giao hàng là best-effort.

**Hàng đợi FIFO**: Thứ tự nghiêm ngặt. Giao hàng đúng một lần.

**Amazon SNS: Nhà Phát Sóng**

**Amazon SNS** là dịch vụ tin nhắn publish/subscribe. Một tin nhắn được giao đến *nhiều subscriber* đồng thời.

**Mẫu Fan-Out SNS/SQS**

```
Máy chủ API
    |
    ↓
SNS Topic: "order-placed"
    |
    ↓ → SQS (notifications) → Worker
    ↓ → SQS (email)         → Worker
    ↓ → SQS (analytics)     → Worker
```

**Mỗi hàng đợi độc lập.** Nếu dịch vụ phân tích chậm, hàng đợi của nó tăng lên, nhưng các dịch vụ thông báo và email không bị ảnh hưởng.

## Tóm Tắt

- **SQS** là hàng đợi được quản lý. Nhà sản xuất gửi tin nhắn; consumer đọc và xử lý bất đồng bộ.
- **SQS Standard**: Thông lượng cao, thứ tự best-effort, giao hàng ít nhất một lần.
- **SQS FIFO**: Thứ tự nghiêm ngặt, giao hàng đúng một lần, thông lượng thấp hơn.
- **SNS** là dịch vụ pub/sub. Một tin nhắn, nhiều subscriber đồng thời.
- **SNS + SQS fan-out**: Mẫu tiêu chuẩn cho một sự kiện kích hoạt nhiều pipeline xử lý độc lập.

## Cảnh Sau Tín Dụng

Luồng đặt hàng mới đã hoạt động.

Khách hàng đặt hàng. API phản hồi trong 95 mili giây.

Dịch vụ phân tích có lỗi gây ra nó bị sập trên các đơn hàng có ký tự đặc biệt. Hàng đợi của nó tăng lên 3.200 tin nhắn.

Khách hàng không bao giờ nhận thấy.

"Đây là ý nghĩa của decoupling," Priya nói.

Chương tiếp theo: hàm chỉ chạy khi có ai đó gõ cửa — và không tốn gì khi không có.
