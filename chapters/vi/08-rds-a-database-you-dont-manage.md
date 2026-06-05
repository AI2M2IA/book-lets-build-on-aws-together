# Chương 8: Quản Trị Viên Cơ Sở Dữ Liệu Không Bao Giờ Ốm

Đã là 3 giờ sáng khi cảnh báo đến.

Máy chủ cơ sở dữ liệu cần một bản vá bảo mật — loại đòi hỏi phải khởi động lại. Lỗ hổng là thật, bản vá có sẵn, và cửa sổ để áp dụng nó mà không làm gián đoạn khách hàng là ngay bây giờ, giữa đêm, khi lưu lượng thấp.

Priya là người duy nhất thức. Cô áp dụng bản vá, khởi động lại máy chủ, theo dõi nhật ký cho đến khi ứng dụng hoạt động trở lại, và đi ngủ lúc 4:15 sáng.

Sáng hôm sau cô kể với nhóm những gì đã xảy ra. Có một khoảng lặng.

"Điều đó sẽ xảy ra lại," Tom nói.

"Nó sẽ xảy ra mỗi lần có bản vá," Priya nói. "Và luôn có bản vá. Phải có cách tốt hơn để làm điều này."

Có. Nó chỉ đòi hỏi từ bỏ ý tưởng rằng họ cần tự quản lý cơ sở dữ liệu.

**Vấn Đề Cơ Sở Dữ Liệu Truyền Thống**

Khi bạn tự chạy cơ sở dữ liệu trên EC2 instance, bạn chịu trách nhiệm cho mọi thứ.

Cài đặt phần mềm cơ sở dữ liệu. Cấu hình bảo mật. Vá lỗi khi phát hiện lỗ hổng bảo mật. Sao lưu. Kiểm tra rằng các bản sao lưu thực sự hoạt động (bước mà hầu hết các nhóm bỏ qua cho đến khi quá muộn). Giám sát dung lượng ổ đĩa. Thiết lập replication để dự phòng. Cấu hình failover khi máy chủ chính bị tắt. Tối ưu hiệu suất truy vấn. Quản lý kết nối dưới tải.

Không ai trong số này là ứng dụng. Không ai trong số này thêm tính năng. Tất cả đều đòi hỏi chuyên môn.

Hầu hết các nhóm phát triển không phải là quản trị viên cơ sở dữ liệu. Điều này tạo ra một mẫu có thể đoán trước: cơ sở dữ liệu được cài đặt, cấu hình tối thiểu, rồi hầu hết bị lãng quên cho đến khi có điều gì đó đi sai nghiêm trọng.

"Đó có phải là những gì chúng ta đã làm không?" Maya hỏi.

Câu trả lời của Leo là im lặng, có nghĩa là có.

**Amazon RDS: Cơ Sở Dữ Liệu Được Quản Lý**

**Amazon RDS** — Relational Database Service — xử lý gánh nặng vận hành của việc chạy cơ sở dữ liệu quan hệ để bạn không phải làm.

Với RDS, AWS quản lý:

- Cài đặt và vá lỗi database engine
- Sao lưu tự động (lưu trữ trong S3, giữ lại đến 35 ngày)
- Tự động failover (khi master bị tắt, standby tiếp quản tự động)
- Giám sát và số liệu
- Mã hóa khi nghỉ và khi truyền
- Auto-scaling dung lượng lưu trữ (nếu bạn bật, ổ đĩa tăng khi đầy)

Bạn quản lý:

- Lược đồ cơ sở dữ liệu (cấu trúc của các bảng)
- Các truy vấn và logic ứng dụng
- Ai có quyền truy cập cơ sở dữ liệu
- Loại instance nào chạy cơ sở dữ liệu
- Điều chỉnh tham số (mặc dù RDS cung cấp các mặc định hợp lý)

Tương tự: thuê một quản trị viên cơ sở dữ liệu không bao giờ nghỉ bệnh, không bao giờ mắc lỗi cấu hình, tự động sao lưu hàng ngày, và tự sửa chữa nếu có gì đó bị hỏng — nhưng người không viết logic ứng dụng của bạn.

**Các Engine Được Hỗ Trợ**

RDS hỗ trợ nhiều database engine phổ biến:

- **MySQL** — cơ sở dữ liệu quan hệ mã nguồn mở được sử dụng rộng rãi nhất
- **PostgreSQL** — mạnh mẽ, có thể mở rộng, ngày càng phổ biến cho các công việc phức tạp
- **MariaDB** — fork MySQL mã nguồn mở, hoàn toàn tương thích
- **Oracle** — cấp doanh nghiệp
- **Microsoft SQL Server** — cho môi trường Windows
- **Amazon Aurora** — engine AWS tương thích MySQL/PostgreSQL (sẽ đề cập sâu trong Chương 24)

Đối với Nimbus, lựa chọn là PostgreSQL.

**Multi-AZ: Standby Tiếp Quản**

Đây là tính năng thay đổi hoàn toàn phép tính độ tin cậy.

**Triển khai Multi-AZ** có nghĩa là RDS duy trì một instance standby đồng bộ trong Availability Zone khác với primary. Mỗi giao dịch được commit trên primary được sao chép đồng bộ sang standby trước khi commit được xác nhận.

Khi primary bị lỗi — lỗi phần cứng, sự cố AZ, phần mềm bị sập — RDS tự động chuyển sang standby. Bản ghi DNS cho endpoint cơ sở dữ liệu được cập nhật. Ứng dụng của bạn kết nối lại với primary mới.

Failover mất 60-120 giây. Trong cửa sổ đó, ứng dụng của bạn sẽ gặp lỗi kết nối. Ứng dụng được viết đúng nên xử lý điều này một cách duyên dáng (kết nối lại với backoff).

Standby không phải là read replica. Nó không phục vụ lưu lượng đọc. Mục đích duy nhất của nó là sẵn sàng tiếp quản.

Tom: "Multi-AZ tốn bao nhiêu?"

Khoảng gấp đôi chi phí của một instance đơn — vì bạn thực sự đang chạy hai database instance. Standby tốn bằng primary.

Tom: "Và một lần mất điện không có kế hoạch tốn bao nhiêu?"

Anh tự trả lời bằng cách mở lịch sử đơn hàng và ước tính doanh thu mỗi giờ trong đợt cao điểm thứ Sáu.

Multi-AZ được bật chiều hôm đó.

**Sao Lưu Tự Động Và Phục Hồi Điểm Trong Thời Gian**

RDS sao lưu tự động hàng ngày. AWS lưu trữ các bản sao lưu này trong S3. Bạn có thể khôi phục cơ sở dữ liệu về bất kỳ thời điểm nào trong thời gian lưu giữ sao lưu.

**Phục hồi điểm trong thời gian** là một trong những tính năng có giá trị nhất: bạn có thể khôi phục về bất kỳ giây nào trong thời gian lưu giữ. Không chỉ là snapshot hàng ngày — *bất kỳ giây nào*.

Nếu ai đó vô tình chạy `DELETE FROM orders WHERE 1=1` lúc 2:37 chiều, bạn có thể khôi phục về 2:36 chiều.

Leo nới lỏng rõ ràng khi hiểu điều này.

"Chúng ta có thể đã phục hồi từ những gì tôi đã xóa tháng trước không?" anh hỏi.

"Trước RDS? Không," Priya nói. "Sau RDS? Có."

**Read Replica: Mở Rộng Lưu Lượng Đọc**

Multi-AZ là về tính khả dụng. **Read replica** là về hiệu suất.

Read replica là bản sao bất đồng bộ của cơ sở dữ liệu chính có thể phục vụ các truy vấn đọc. Có thể có tới năm read replica cho hầu hết các engine RDS.

Ứng dụng được sửa đổi để gửi truy vấn đọc đến replica và truy vấn ghi đến primary. Điều này phân phối tải.

Các đặc điểm chính:

- Replication là **bất đồng bộ** — có thể có độ trễ nhỏ giữa primary và replica.
- Read replica có thể ở cùng Region hoặc Region khác.
- Read replica có thể được thăng cấp thành cơ sở dữ liệu độc lập trong tình huống thảm họa.

## Tóm Tắt

- **Amazon RDS** là dịch vụ cơ sở dữ liệu quan hệ được quản lý. AWS xử lý vá lỗi, sao lưu, failover và quản lý dung lượng lưu trữ.
- **Multi-AZ** duy trì standby đồng bộ trong AZ khác. Tự động failover xảy ra trong 60-120 giây nếu primary bị lỗi.
- **Sao lưu tự động** với **phục hồi điểm trong thời gian** cho phép khôi phục về bất kỳ giây nào trong thời gian lưu giữ.
- **Read replica** là các bản sao bất đồng bộ phục vụ lưu lượng đọc.

## Mẹo Thi

*SAA-C03 Domain 3 — Task 3.3 (giải pháp cơ sở dữ liệu)*

- **Multi-AZ dành cho tính khả dụng cao, không phải hiệu suất.** Standby không phục vụ lưu lượng đọc. Read replica dành cho hiệu suất.
- **Tự động failover Multi-AZ.** Bạn không cấu hình khi nào hoặc cách nó xảy ra.
- **Độ trễ replication quan trọng.** Read replica có thể hơi chậm hơn primary.
- **Sao lưu tự động được giữ 0-35 ngày.** Đặt thời gian lưu giữ về 0 tắt sao lưu tự động.

## Cảnh Sau Tín Dụng

Đến cuối ngày, Nimbus đã chuyển sang RDS PostgreSQL với Multi-AZ được bật.

Tom đã theo dõi hóa đơn cẩn thận.

"RDS instance," anh nói, "tốn gấp đôi so với cơ sở dữ liệu EC2."

"Và tự động failover chúng ta sẽ nhận miễn phí nếu primary chết?" Maya hỏi.

Tom không có giá cho điều đó. Anh ghi lại như một câu hỏi.

Ba ngày sau, cơ sở dữ liệu khỏe mạnh. Thời gian truy vấn giảm một chút nhưng không đủ. Menu vẫn tải chậm.

"Vấn đề," Priya nói, "không phải là database engine. Đó là mô hình dữ liệu."

Cô dừng lại.

"Một số dữ liệu này hoàn toàn không phải là quan hệ. Các mục menu, hồ sơ nhà hàng, khu vực giao hàng — dữ liệu này có hình dạng biến đổi. SQL đang chống lại chúng ta."

Leo đã nghiên cứu điều gì đó.

Chương tiếp theo: cơ sở dữ liệu không chậm lại, ngay cả khi một triệu người đặt hàng cùng lúc.
