# Chương 13: Nhanh Ở Khắp Nơi

Một bức ảnh đi từ máy chủ ở Virginia đến điện thoại ở Seattle đi qua khoảng 4.400 km cáp quang. Với hai phần ba tốc độ ánh sáng, đó là khoảng 25 mili giây của vật lý học thuần túy — không thể tránh khỏi, không thể thương lượng.

`eatnimbus.com` đã hoạt động. Leo đã kiểm tra số liệu độ trễ từ người dùng Bờ Tây: 80-100 mili giây mỗi yêu cầu.

"Vật lý học là vấn đề," Leo nói. "Máy chủ ở Virginia. Người dùng ở Bờ Tây."

"Vậy hãy chuyển máy chủ sang Bờ Tây," Tom nói.

"Điều đó tốn tiền."

"Bao nhiêu?"

"Rất nhiều. Và nó tạo ra một vấn đề hoàn toàn mới: đồng bộ cơ sở dữ liệu Bờ Đông và Bờ Tây."

Priya ngước nhìn. "Hoặc chúng ta không di chuyển máy chủ. Chúng ta di chuyển *nội dung*."

**Tương Tự Kho Hàng Được Chuẩn Bị Sẵn**

Amazon (nhà bán lẻ) có một kho hàng khổng lồ ở một vị trí với mọi sản phẩm. Thay vào đó, Amazon có các trung tâm thực hiện gần các khu dân số lớn. Khi khách hàng ở Seattle đặt hàng, nó được giao từ trung tâm thực hiện địa phương.

Đây là **Mạng Phân Phối Nội Dung (CDN)**: một mạng các máy chủ được phân tán về mặt địa lý lưu trữ các bản sao nội dung của bạn gần người dùng.

**Gặp Gỡ CloudFront**

Amazon CloudFront là CDN của AWS. Nó hoạt động thông qua mạng toàn cầu của **edge location** — các máy chủ caching được đặt trong các thành phố trên toàn thế giới.

Khi bạn cấu hình CloudFront, bạn chỉ định một **origin**: nguồn nội dung thực sự của bạn.

CloudFront ngồi trước origin của bạn. Yêu cầu đến tại edge location gần nhất. Nếu edge có nội dung được cache, nó trả về ngay lập tức. Nếu không (*cache miss*), nó lấy từ origin của bạn, cache nó, và trả về.

## Tóm Tắt

- **CDN** lưu trữ bản sao nội dung của bạn tại các edge location gần người dùng.
- **CloudFront** là CDN của AWS, với hơn 500 edge location trên toàn cầu.
- Cache miss lấy từ **origin** (S3, ALB, EC2). Cache hit phục vụ từ edge.
- **Behavior** cho phép bạn đặt các quy tắc caching khác nhau cho các mẫu URL khác nhau.
- **Origin Access Control** hạn chế quyền truy cập S3 trực tiếp — nội dung chỉ được phục vụ qua CloudFront.
- Tích hợp với Shield (DDoS), WAF (application firewall) và ACM (chứng chỉ SSL).

## Mẹo Thi

- **CloudFront + S3**: Mẫu kỳ thi cổ điển để phục vụ website tĩnh toàn cầu.
- **Edge location so với Region so với AZ**: Edge location nhiều hơn và chỉ tồn tại cho mục đích caching/CDN.
- **Signed URL và Signed Cookie**: Kiểm soát ai có thể truy cập nội dung qua CloudFront.

## Cảnh Sau Tín Dụng

Priya xem các số liệu CloudFront sau khi triển khai.

Tỷ lệ cache hit: 83%.

"Điều đó có nghĩa là gì?" Tom hỏi.

"Có nghĩa là 83% người dùng của chúng ta đang nhận nội dung từ edge location gần họ, không phải từ us-east-1."

Tom ngồi lại. "Vậy nếu chúng ta không có CloudFront, máy chủ của chúng ta sẽ xử lý gần một triệu yêu cầu."

"Với 140-160 mili giây mỗi cái, cho người dùng toàn cầu."

Tom ngồi lại. "Điều này xứng đáng," anh nói.

Chương tiếp theo: các quyền chi tiết cho phép một phần của hệ thống nói chuyện với phần khác — một cách an toàn.
