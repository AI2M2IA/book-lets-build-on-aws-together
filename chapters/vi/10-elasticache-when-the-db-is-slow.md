# Chương 10: Khi Cơ Sở Dữ Liệu Quá Chậm

Các số liệu thời gian tải trang đang mở trên màn hình. Leo đã nhìn chúng hai mươi phút mà không nói gì.

Bốn mươi bảy yêu cầu DynamoDB mỗi lần tải trang. Một trăm tám mươi tám mili giây chỉ để truy xuất dữ liệu — trước khi trình duyệt hiển thị một pixel.

"Cơ sở dữ liệu phản hồi trong bốn mili giây mỗi yêu cầu," Leo nói. "Đó thực sự là nhanh. DynamoDB đang làm đúng công việc của nó."

"Vậy tại sao trang chậm?" Maya hỏi.

"Vì chúng ta đang gọi nó bốn mươi bảy lần mỗi lần tải trang," Priya nói. "Vấn đề không phải là cơ sở dữ liệu. Vấn đề là chúng ta đang nói chuyện với nó quá nhiều."

**Tương Tự Về Nhà Hàng**

Hãy tưởng tượng bếp của một nhà hàng. Mỗi khi người phục vụ cần biết món đặc biệt trong ngày, họ đi vào bếp, hỏi đầu bếp, và đi lại bàn.

Điều đó hoạt động tốt nếu bạn có hai người phục vụ và ba bàn.

Bây giờ hãy tưởng tượng hai trăm người phục vụ và một nghìn bàn. Bếp trở thành nút thắt cổ chai.

Giải pháp rõ ràng: viết món đặc biệt lên bảng ở phía trước nhà hàng. Mọi người phục vụ đọc từ bảng. Bếp được nghỉ ngơi.

Bảng đó là bộ nhớ đệm (cache).

Bộ nhớ đệm là một kho lưu trữ nhanh của dữ liệu đã truy xuất gần đây. Thay vì lấy cùng một thứ từ nguồn chậm nhiều lần, bạn lấy một lần và giữ nó gần.

**Gặp Gỡ ElastiCache**

Amazon ElastiCache là dịch vụ caching được quản lý. Nó chạy các engine caching phổ biến — Redis và Memcached — mà bạn không cần quản lý máy chủ.

**Redis** là mạnh mẽ hơn. Nó hỗ trợ các cấu trúc dữ liệu phức tạp (chuỗi, danh sách, tập hợp, hash, sorted sets), tính bền vững (dữ liệu tồn tại qua các lần khởi động lại), replication và pub/sub messaging.

**Memcached** đơn giản hơn. Caching key-value thuần túy, có thể mở rộng theo chiều ngang, không có tính bền vững.

Đối với Nimbus: Redis. Họ cần cache dữ liệu menu (có cấu trúc), token session (key-value), và sau đó sẽ muốn sorted sets cho bảng xếp hạng "nhà hàng xu hướng".

**Cách Caching Hoạt Động Trong Thực Tế**

Mẫu caching cơ bản được gọi là **cache-aside** (còn gọi là lazy loading):

1. Ứng dụng cần dữ liệu
2. Kiểm tra cache trước
3. Nếu tìm thấy (*cache hit*): trả về dữ liệu ngay lập tức
4. Nếu không tìm thấy (*cache miss*): đến cơ sở dữ liệu, lấy dữ liệu, lưu vào cache, trả về

**TTL: Ghi Nhớ Bao Lâu?**

Mỗi mục cache có một **Time-To-Live (TTL)**: thời gian sau đó mục sẽ hết hạn và yêu cầu tiếp theo quay lại cơ sở dữ liệu để lấy dữ liệu mới.

## Tóm Tắt

- Bộ nhớ đệm là kho lưu trữ nhanh của dữ liệu đã truy xuất gần đây.
- ElastiCache là dịch vụ caching được quản lý của AWS, hỗ trợ Redis và Memcached.
- **Redis** phong phú hơn (cấu trúc dữ liệu phức tạp, tính bền vững, pub/sub). **Memcached** đơn giản hơn.
- **DAX** là cache dành riêng cho DynamoDB. ElastiCache là mục đích chung.

## Mẹo Thi

- **Redis so với Memcached trong kỳ thi**: Redis = tính bền vững, replication, cấu trúc phức tạp, pub/sub. Memcached = key-value đơn giản, mở rộng theo chiều ngang thuần túy.
- **Tín hiệu sử dụng ElastiCache**: "cơ sở dữ liệu là nút thắt cổ chai," "công việc đọc nặng," "giảm độ trễ," "lưu trữ session."
- **Tín hiệu DAX**: "giảm độ trễ đọc DynamoDB" → DAX, không phải ElastiCache.

## Cảnh Sau Tín Dụng

Leo đã thêm Redis caching cho menu. Thời gian tải trang giảm từ 188 mili giây xuống 12 mili giây.

Bốn mươi bảy lần gọi DynamoDB trở thành một lần tra cứu Redis. Cuộc gọi mất 0,8 mili giây.

Anh thông báo điều này tại cuộc họp đứng thứ Hai.

"Tốt lắm," Priya nói, không nhìn lên khỏi máy tính xách tay.

"Cảm ơn," Leo nói.

"Gần đây nhất bạn xoay token xác thực Redis là khi nào?"

Leo nhìn vào ghi chú. "Tôi không nghĩ mình đã thiết lập một cái."

"Vậy cache không được xác thực."

"Nó ở trong VPC."

"Giống như mọi thứ khác bị xâm phạm." Cô cuối cùng ngước nhìn. "Nếu máy tính của Leo bị nhiễm và ai đó xoay vào VPC, cache của bạn không có mật khẩu."

Leo nhìn chằm chằm vào cô.

"Tôi sẽ thiết lập token xác thực," anh nói.

Chương tiếp theo: mạng riêng tư tách biệt những gì Nimbus sở hữu với phần còn lại của internet.
