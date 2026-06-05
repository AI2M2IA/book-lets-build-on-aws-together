# Chương 5: Tủ Hồ Sơ Sống Trong Đám Mây

Leo nhận ra rằng Nimbus đang lưu trữ ảnh menu được tải lên trực tiếp trên EC2 instance.
Mọi ảnh mà khách hàng tải lên — chiếc bánh arepa giòn rụm, đĩa cá hồi nướng, bát salad được bày biện hoàn hảo — đang nằm trên một máy ảo duy nhất.

Và nếu máy đó bị khởi động lại, thay đổi kích thước, hoặc thay thế?

Biến mất.

"Khách hàng đã tải lên bao nhiêu ảnh cho đến nay?" Maya hỏi.

Leo mở console. "Khoảng tám trăm."

"Và điều gì xảy ra với tám trăm bức ảnh đó nếu chúng ta khởi động lại máy chủ?"

Một trong những khoảng dừng có ý nghĩa của Leo.

Chương này nói về nơi file thực sự thuộc về trong đám mây.

**Vấn Đề Với Việc Lưu File "Trên Máy Chủ"**

Khi bạn lưu trữ file trực tiếp trên EC2 instance — bên trong hệ thống file của nó — bạn đang gắn những file đó vào vòng đời của máy cụ thể đó.

Điều này tạo ra một số vấn đề:

**Phù du bởi bản chất.** EC2 instance có thể bị dừng, chấm dứt, thay thế. Ổ đĩa cục bộ của chúng không được thiết kế để tồn tại vĩnh viễn.

**Điểm lỗi duy nhất.** Nếu instance bị lỗi, các file biến mất theo nó. Không có dự phòng.

**Không thể chia sẻ qua các instance.** Khi bạn thêm máy chủ thứ hai (mà bạn sẽ làm, trong Chương 7), nó sẽ không thấy các file được lưu trữ trên ổ đĩa của máy chủ đầu tiên.

**Không có khả năng mở rộng.** Dung lượng ổ đĩa EC2 có hạn. Nếu bạn lấp đầy nó, bạn phải ngừng nhận tải lên hoặc cố gắng mở rộng dung lượng lưu trữ dưới áp lực.

Có một mô hình tốt hơn. AWS đã xây dựng nó vào năm 2006, và nó vẫn là một trong những dịch vụ đám mây được sử dụng rộng rãi nhất thế giới.

**Amazon S3: Ổ Cứng Sống Trực Tuyến**

**Amazon S3** — Simple Storage Service — là dịch vụ lưu trữ đối tượng của AWS.

Hãy nghĩ về nó như một ổ cứng sống trên internet. Một ổ cứng vô hạn.
Một cái được tự động sao lưu qua nhiều Availability Zone để việc mất bất kỳ trung tâm dữ liệu đơn lẻ nào không làm mất file của bạn.

Khái niệm chính trong S3 là **đối tượng** (object).

Một đối tượng là bất kỳ file nào: ảnh, video, PDF, CSV, bản sao lưu, file nhật ký. S3 không quan tâm đến loại hay cấu trúc. Nó lưu trữ các byte và trả lại chúng khi bạn yêu cầu.

Các đối tượng sống bên trong **bucket**. Một bucket giống như thư mục cấp cao nhất — một container được đặt tên trong S3 chứa các đối tượng của bạn. Mỗi bucket có tên duy nhất toàn cầu (không có hai bucket trên tất cả các tài khoản AWS có thể dùng chung tên) và tồn tại trong một Region cụ thể.

**Cách S3 Hoạt Động**

Mô hình đơn giản, và sự đơn giản đó chính là điểm mấu chốt.

Bạn **tải lên** một đối tượng vào bucket. S3 đặt cho nó một **key** — về cơ bản là tên đường dẫn như `menus/restaurant-001/photo-arepa.jpg`. Key đó xác định duy nhất đối tượng trong bucket.

Bạn **tải xuống** (hoặc truy xuất) đối tượng bằng tên bucket và key.

Bạn cũng có thể làm cho các đối tượng có thể truy cập công khai — nghĩa là bất kỳ ai có URL đều có thể tải xuống chúng. Đây là cách hầu hết các trang web phục vụ hình ảnh: lưu trữ hình ảnh trong S3, đặt nó công khai, nhúng URL trong HTML của bạn.

Hoặc bạn giữ các đối tượng riêng tư — chỉ có thể truy cập bằng các yêu cầu được xác thực. Đây là mô hình đúng cho dữ liệu khách hàng, bản sao lưu và bất cứ điều gì nhạy cảm.

S3 không phải là hệ thống file. Không có thư mục thực sự. `/` trong tên key chỉ là quy ước — S3 coi toàn bộ key là một chuỗi phẳng.

**Tại Sao S3 Khác Biệt So Với Ổ Cứng Thông Thường**

Ba thứ làm cho S3 khác biệt về cơ bản so với lưu trữ file trên EC2 instance:

**Độ bền.** AWS thiết kế S3 với độ bền 99.999999999% (mười một chín). Điều đó có nghĩa là nếu bạn lưu trữ mười triệu đối tượng, bạn có thể mong đợi mất một đối tượng mỗi mười nghìn năm do lỗi phần cứng. Họ đạt được điều này bằng cách tự động lưu trữ nhiều bản sao của mỗi đối tượng qua ít nhất ba Availability Zone.

**Tính khả dụng.** S3 được thiết kế để có thể truy cập ngay cả khi các thành phần riêng lẻ bị lỗi.

**Mở rộng.** S3 giữ lượng dữ liệu hầu như vô hạn. Một bucket duy nhất có thể chứa hàng nghìn tỷ đối tượng.

**Versioning: Nút Hoàn Tác**

Đây là thứ Maya tìm thấy khi khám phá console S3.

S3 hỗ trợ **versioning**. Khi bạn bật versioning trên một bucket, S3 giữ mọi phiên bản của mọi đối tượng — bao gồm các phiên bản trước và các phiên bản đã xóa.

Đây là nút hoàn tác cho file của bạn.

Tải lên ảnh menu mới vô tình ghi đè cái cũ? Phiên bản cũ vẫn còn đó. Xóa file nhầm? Có thể khôi phục. Bị ransomware ghi đè tất cả file? Với versioning, bạn khôi phục từ trước cuộc tấn công.

"Bảo quản tất cả các phiên bản đó tốn bao nhiêu?" Tom hỏi.

Bạn trả tiền cho dung lượng lưu trữ của mọi phiên bản. AWS có **lifecycle policies** tự động xóa các phiên bản cũ sau một khoảng thời gian nhất định — chúng ta sẽ đề cập những điều này trong Chương 23 khi chúng ta đi sâu vào tối ưu hóa chi phí.

**Kiểm Soát Truy Cập: Công Khai So Với Riêng Tư**

Theo mặc định, mọi thứ trong S3 là riêng tư. Chỉ tài khoản AWS của bạn có thể truy cập nó.

Bạn có thể làm cho các đối tượng riêng lẻ công khai — đây là cách bạn phục vụ ảnh menu cho khách truy cập website. Hoặc bạn có thể giữ tất cả riêng tư và tạo **pre-signed URL**: các liên kết giới hạn thời gian cho phép ai đó tải xuống một đối tượng cụ thể mà không cần thông tin đăng nhập AWS.

Priya có ý kiến rất mạnh về điều này.

"Đừng bao giờ làm cho bucket hoàn toàn công khai trừ khi bạn đã quyết định một cách có ý thức để làm cho mọi đối tượng trong đó có thể truy cập cho toàn bộ internet," cô nói. "Sai lầm bảo mật S3 phổ biến nhất là vô tình tiết lộ một bucket chứa dữ liệu nhạy cảm."

AWS hiện có cài đặt "Block Public Access" bạn có thể áp dụng ở cấp tài khoản, buộc tất cả các bucket phải riêng tư trừ khi bạn ghi đè rõ ràng mỗi bucket.

Bật nó. Luôn luôn.

**Lớp Lưu Trữ S3: Không Phải Tất Cả Dữ Liệu Đều Giống Nhau**

| Lớp Lưu Trữ             | Trường Hợp Sử Dụng                  | Truy Xuất       | Chi Phí                          |
|-------------------------|-------------------------------------|-----------------|----------------------------------|
| S3 Standard             | Dữ liệu truy cập thường xuyên       | Ngay lập tức    | Cao hơn mỗi GB                   |
| S3 Standard-IA          | Truy cập không thường xuyên         | Ngay lập tức    | Thấp hơn mỗi GB, phí truy xuất   |
| S3 Glacier Instant      | Lưu trữ truy cập thỉnh thoảng       | Ngay lập tức    | Thấp hơn nhiều                   |
| S3 Glacier Flexible     | Lưu trữ hiếm khi truy cập           | Phút đến giờ    | Rất thấp                         |
| S3 Glacier Deep Archive | Lưu trữ tuân thủ, hầu như không bao giờ | Đến 12 giờ | Thấp nhất                       |

Chúng ta sẽ đi sâu vào trong Chương 23.

## Tóm Tắt

- **Amazon S3** là lưu trữ đối tượng — nơi lưu trữ file (gọi là đối tượng) trong các container được đặt tên (gọi là bucket).
- S3 được thiết kế với độ bền mười một chín bằng cách tự động lưu trữ bản sao của mỗi đối tượng qua ít nhất ba Availability Zone.
- File được lưu trữ trên EC2 instance gắn với vòng đời của instance đó. File quan trọng thuộc về S3, không phải máy chủ.
- **Versioning** bảo tồn các phiên bản trước của đối tượng — nút hoàn tác của bạn.
- Theo mặc định, S3 là riêng tư. Bật "Block Public Access" ở cấp tài khoản.
- S3 có nhiều **lớp lưu trữ** cho các mẫu truy cập và chi phí khác nhau.

## Mẹo Thi

*SAA-C03 Domain 3 — Task 3.1 (giải pháp lưu trữ hiệu suất cao)*

- **S3 là lưu trữ đối tượng, không phải lưu trữ khối.** Khi tình huống cần hệ thống file mà nhiều máy chủ có thể mount, đó là EFS. Khi cần ổ đĩa cho một EC2 instance duy nhất, đó là EBS. Khi cần lưu trữ file, bản sao lưu, hình ảnh — đó là S3.
- **Độ bền mười một chín** có nghĩa là S3 sao chép dữ liệu qua nhiều AZ tự động. Bạn không cấu hình điều này — đó là mặc định.
- **S3 là theo Region**, nhưng có thể truy cập toàn cầu.
- **Pre-signed URL** cho phép truy cập giới hạn thời gian vào các đối tượng riêng tư.

## Cảnh Sau Tín Dụng

Leo đã di chuyển ảnh menu sang S3 chiều hôm đó. Tám trăm đối tượng, được lưu trữ an toàn trên ba Availability Zone, với versioning được bật.

"Chúng thực sự an toàn hơn bây giờ so với trước," anh nói, với chút thỏa mãn.

"Chúng lúc nào cũng an toàn hơn trong S3," Priya nói. "Chúng ta chỉ chờ cho đến khi xây dựng vấn đề mới sửa nó."

Leo chấp nhận điều đó.

Sáng hôm sau, Tom đến với một bản in. Hóa đơn AWS, được chú thích bằng bút đỏ.

"Chúng ta có vấn đề với cơ sở dữ liệu," anh nói. "Chúng ta đang chạy cơ sở dữ liệu đơn hàng trên cùng EC2 instance với máy chủ web. Và cả cơ sở dữ liệu menu. Và hồ sơ khách hàng."

Anh dừng lại.

"Tất cả đều trên cùng một máy. Một máy. Tất cả dữ liệu của chúng ta."

Maya nhìn bản in. Rồi nhìn Tom. Rồi nhìn trần nhà.

"Và nếu máy đó hỏng?"

Tom chỉ vào ghi chú bằng bút đỏ.

Chương tiếp theo: sự khác biệt giữa ổ cứng bạn thuê và tủ hồ sơ mà cả văn phòng chia sẻ.
