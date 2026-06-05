# Chương 6: Ổ Đĩa Đi Theo Bạn Khắp Nơi

Tom có bút đỏ và một thói quen khiến Leo lo lắng.

Mỗi sáng thứ Bảy, Tom in bản tóm tắt console AWS — các instance đang chạy, volume lưu trữ, ổ đĩa được gắn — và đi qua từng dòng một. Anh đã làm điều này từ tuần thứ hai. Anh gọi nó là "sổ cái". Leo gọi nó là "thứ Tom làm khiến Leo cảm thấy mình đã làm gì đó sai."

Thứ Bảy hôm đó, Tom khoanh tròn một thứ và để bản in trên bàn của Maya mà không nói gì.

Cô tìm thấy nó sáng thứ Hai. Một vòng tròn. Một ghi chú ở lề, ba từ:

*Tất cả. Một máy.*

Máy chủ web. Cơ sở dữ liệu. Tất cả hồ sơ khách hàng. Hai tháng lịch sử đơn hàng. Tất cả đang chạy trên một EC2 instance duy nhất.

"Điều gì xảy ra với cơ sở dữ liệu nếu instance bị sập?" Maya hỏi, bản in trên tay.

"Nó cũng sập," Leo nói.

"Và dữ liệu?"

"Tùy thuộc vào cách cơ sở dữ liệu lưu trữ nó."

Cái "tùy thuộc" đó là vấn đề.

**Cách EC2 Instance Lưu Trữ Dữ Liệu**

Khi EC2 instance chạy, hệ điều hành của nó sống ở đâu đó trên một ổ đĩa. Ổ đĩa đó được gọi là **root volume**. Theo mặc định, đây là **EBS volume** — ngay cả khi bạn không nghĩ đến điều đó.

Nhưng còn có thứ khác: EC2 instance cũng có lưu trữ **instance store**.

Instance store là lưu trữ tạm thời được gắn vật lý vào phần cứng bên dưới chạy máy ảo của bạn. Nó cực kỳ nhanh — nhanh hơn hầu hết mọi tùy chọn lưu trữ khác trong AWS. Nhưng nó có một điểm bắt.

Instance store là **phù du**.

Khi instance bị dừng hoặc chấm dứt, dữ liệu instance store biến mất. Vĩnh viễn. Không thể phục hồi.

Instance store thích hợp cho bộ nhớ đệm, file xử lý tạm thời và scratch space. Không bao giờ cho dữ liệu bạn quan tâm.

**EBS: Ổ Đĩa Bền Vững**

**Amazon EBS** — Elastic Block Store — là lưu trữ khối bền vững cho EC2 instance.

Lưu trữ khối có nghĩa là nó hoạt động như một ổ cứng thực sự: hệ điều hành của bạn có thể tạo hệ thống file trên nó, đọc và ghi byte tùy ý ở các vị trí tùy ý, chạy cơ sở dữ liệu trên nó và coi nó như một ổ đĩa được gắn vào.

Các thuộc tính chính:

**Bền vững.** Không giống instance store, EBS volume tồn tại qua các lần dừng, khởi động và thậm chí chấm dứt instance (tùy thuộc vào cấu hình). Dữ liệu ở lại trên volume ngay cả khi không có instance nào đang sử dụng nó.

**Có thể gắn và tháo.** EBS volume có thể được tháo ra từ một instance và gắn vào instance khác.

**Gắn đơn (thường).** Theo mặc định, EBS volume được gắn vào chính xác một EC2 instance tại một thời điểm.

Tương tự: EBS là ổ cứng ngoài bạn cắm vào laptop. Laptop (EC2 instance) có thể đọc và ghi vào nó. Khi xong, bạn có thể rút ra và cắm vào laptop khác.

**Các Loại EBS Volume**

**gp3 (General Purpose SSD)**: Lựa chọn mặc định cho hầu hết các công việc. Cân bằng tốt giữa hiệu suất và giá cả.

**io2 (Provisioned IOPS SSD)**: Tùy chọn hiệu suất cao cho các công việc tính toán I/O chuyên sâu.

**st1 (Throughput Optimized HDD)**: Lưu trữ từ được tối ưu hóa cho các lần đọc và ghi tuần tự lớn.

**sc1 (Cold HDD)**: Tùy chọn EBS rẻ nhất. Cho dữ liệu truy cập không thường xuyên.

**EBS Snapshot: Bản Sao Lưu**

**EBS snapshot** là bản sao lưu tại một thời điểm của EBS volume, được lưu trong S3. Snapshot là gia tăng: snapshot đầu tiên chụp volume đầy đủ; các snapshot tiếp theo chỉ lưu những gì đã thay đổi kể từ lần cuối.

Bạn có thể tạo EBS volume mới từ snapshot — khôi phục về một thời điểm trước khi cơ sở dữ liệu bị hỏng, triển khai tệ hoặc xóa nhầm.

Priya đã thiết lập điều này trước khi cơ sở dữ liệu thậm chí đưa vào sản xuất.

Leo đã không nghĩ đến nó.

**EFS: Tủ Hồ Sơ Dùng Chung**

EBS là ổ đĩa gắn vào một instance. Còn nếu nhiều instance cần truy cập cùng một file đồng thời thì sao?

Nhập **Amazon EFS** — Elastic File System.

EFS là hệ thống file mạng được quản lý. Nhiều EC2 instance có thể mount cùng một hệ thống file EFS đồng thời và đọc/ghi vào các file chung.

EBS là ổ cứng ngoài cắm vào một laptop. Chỉ laptop đó có thể sử dụng nó tại một thời điểm.

EFS là tủ hồ sơ ở giữa văn phòng. Bất kỳ thành viên nhóm nào cũng có thể đến, mở ngăn kéo, đọc file, cất lại. Nhiều người, đồng thời, truy cập cùng một lưu trữ.

**Khi nào bạn cần EFS?**

- Khi nhiều EC2 instance cần chia sẻ file
- Khi bạn có ứng dụng được mở rộng theo chiều ngang mà tất cả các instance cần truy cập cùng dữ liệu
- Khi bạn cần hệ thống file bền vững tồn tại qua các lỗi instance

**EFS so với S3:** EFS là hệ thống file (thư mục, file, quyền, khóa). S3 là lưu trữ đối tượng (tải lên, tải xuống, không có ngữ nghĩa hệ thống file). EFS đắt hơn nhiều so với S3.

**Chọn Lưu Trữ Đúng**

| Nhu Cầu                                   | Loại Lưu Trữ       |
|-------------------------------------------|--------------------|
| Cơ sở dữ liệu cần ổ đĩa nhanh, bền vững  | EBS (gp3 or io2)   |
| Nhiều máy chủ cần file dùng chung          | EFS                |
| File, bản sao lưu, hình ảnh, đối tượng lớn | S3                |
| Scratch space tính toán tạm thời           | Instance Store     |
| Lưu trữ dài hạn với chi phí tối thiểu     | S3 Glacier         |

## Tóm Tắt

- **Instance store** là lưu trữ nhanh, tạm thời được gắn vật lý vào máy chủ. Dữ liệu bị mất khi instance dừng. Chỉ cho scratch space.
- **EBS** (Elastic Block Store) là lưu trữ khối bền vững cho một EC2 instance duy nhất. Nó tồn tại qua các lần dừng instance. Có thể chụp snapshot để sao lưu.
- **EFS** (Elastic File System) là hệ thống file mạng dùng chung mà nhiều instance có thể mount đồng thời.
- Khớp loại lưu trữ với yêu cầu: cơ sở dữ liệu → EBS; file dùng chung → EFS; đối tượng/sao lưu → S3; lưu trữ → S3 Glacier.

## Mẹo Thi

*SAA-C03 Domain 3 — Task 3.1 (giải pháp lưu trữ)*

- **EBS volume sống trong một AZ.** Chúng chỉ có thể được gắn vào một instance trong cùng AZ.
- **EBS snapshot là gia tăng và được lưu trong S3.** Snapshot đầu tiên đầy đủ; các snapshot tiếp theo chỉ lưu các thay đổi.
- **EFS là xuyên AZ.** Nhiều instance trong các AZ khác nhau trong cùng Region có thể mount cùng hệ thống file EFS.

## Cảnh Sau Tín Dụng

Chiều hôm đó, Nimbus đã phân tách đúng cách lưu trữ của họ. Cơ sở dữ liệu có EBS volume riêng với snapshot tự động. Ảnh menu chuyển sang S3. EC2 instance cuối cùng có không gian để thở.

Leo chạy bài kiểm tra tải. Trang web xử lý hai trăm người dùng đồng thời mà không gặp khó khăn.

Tom nhìn hóa đơn. EBS volume thêm 8 USD mỗi tháng. Anh ghi lại.

"Tôi tiếp tục thêm thứ vào hóa đơn này," anh nói. "Khi nào nó cân bằng?"

"Khi chúng ta ngừng bị mất điện," Maya nói. "Mỗi lần mất điện tốn nhiều hơn việc phòng ngừa."

Tom không có vẻ bị thuyết phục. Anh sẽ thay đổi, cuối cùng.

Ba ngày sau, một chủ nhà hàng trên nền tảng cố gắng đặt hàng và nhận được lỗi.

"Vấn đề," Priya nói, "không phải là engine cơ sở dữ liệu. Đó là mô hình dữ liệu."

Cô dừng lại.

"Một số dữ liệu này không phải quan hệ chút nào. Các mục menu, hồ sơ nhà hàng, khu vực giao hàng — dữ liệu này có hình dạng biến đổi. SQL đang chống lại chúng ta."

Leo đã nghiên cứu điều gì đó.

Chương tiếp theo: điều gì xảy ra khi nhiều khách hàng đến hơn máy chủ có thể xử lý.
