# Chương 6: Ổ Đĩa Đi Theo Bạn Khắp Nơi

Tom có bút đỏ và một thói quen khiến Leo lo lắng.

Mỗi sáng thứ Bảy, anh ngồi xuống với một ly cà phê và in một thứ gì đó. Không phải email. Không phải báo cáo. Anh in danh sách những gì Nimbus đang chạy và đọc nó như một sổ cái, từng dòng một, bút trên tay. Anh đã làm điều này từ tuần thứ hai. Âm thanh máy in khởi động đã trở thành một phần của cuối tuần.

Leo gọi nó là "cái thứ Tom làm khiến Leo cảm thấy như anh đã làm điều gì đó sai."

Thứ Bảy đó, Tom khoanh tròn một thứ và để bản in trên bàn của Maya mà không nói một lời.

Cô tìm thấy nó vào sáng thứ Hai. Một vòng tròn. Một ghi chú ở lề, ba từ:

*Mọi thứ. Một máy.*

Các ảnh giờ đã an toàn trong S3 — vấn đề đó đã được giải quyết. Nhưng cơ sở dữ liệu vẫn ở trên cùng EC2 instance với máy chủ web. Lịch sử đơn hàng, bản ghi khách hàng, hai tháng giao dịch. Ứng dụng và mọi thứ bên dưới nó, chia sẻ một đĩa ảo duy nhất.

"Chuyện gì xảy ra với cơ sở dữ liệu nếu instance sập?" Maya hỏi, bản in trong tay cô.

"Nó cũng sập," Leo nói.

"Và dữ liệu?"

"Tùy thuộc vào cách cơ sở dữ liệu lưu trữ nó."

Cái "tùy thuộc" đó là vấn đề.

**Cách Các EC2 Instance Lưu Trữ Dữ Liệu**

Khi một EC2 instance chạy, hệ điều hành của nó sống ở đâu đó trên một đĩa. Đĩa đó được gọi là **root volume**. Theo mặc định, đây là một **EBS volume** — ngay cả khi bạn không nghĩ về nó.

Nhưng có một thứ khác: các EC2 instance cũng có lưu trữ **instance store**.

Instance store là lưu trữ tạm thời được gắn về mặt vật lý vào phần cứng cơ bản chạy máy ảo của bạn. Nó cực kỳ nhanh — nhanh hơn hầu hết bất kỳ lựa chọn lưu trữ nào khác trong AWS. Nhưng nó đi kèm một điểm khó khăn.

Instance store là **tạm thời**.

Khi instance dừng hoặc bị chấm dứt, dữ liệu instance store biến mất. Vĩnh viễn. Không thể khôi phục. AWS không cảnh báo bạn rất to về điều này, đó là cách các nhóm khám phá ra nó: bằng cách mất dữ liệu.

Instance store phù hợp cho bộ nhớ đệm, các tệp xử lý tạm thời, và không gian nháp. Không bao giờ cho dữ liệu bạn quan tâm.

**EBS: Đĩa Bền Vững**

Hãy tưởng tượng một ổ cứng ngoài mà bạn có thể cắm vào EC2 instance của mình — một cái không biến mất khi bạn rút nó, và mà bạn có thể di chuyển sang một máy khác nếu bạn cần. AWS gọi cái này là **EBS**: Elastic Block Store.

EBS là lưu trữ block bền vững cho các EC2 instance.

Lưu trữ block có nghĩa là nó hoạt động như một ổ cứng thực: hệ điều hành của bạn có thể tạo các hệ thống tệp trên nó, đọc và ghi các byte tùy ý ở các vị trí tùy ý, chạy cơ sở dữ liệu trên nó, và đối xử với nó chính xác như một đĩa được gắn.

Các thuộc tính chính:

**Bền vững.** Không giống instance store, các EBS volume sống sót qua các lần dừng, khởi động instance, và thậm chí cả việc chấm dứt instance (tùy thuộc vào cấu hình). Dữ liệu ở lại trên volume ngay cả khi không instance nào đang sử dụng nó.

Có một sắc thái cấu hình ở đây: khi bạn tạo một EC2 instance, root volume có một cài đặt gọi là "Delete on Termination." Theo mặc định, điều này được đặt thành true — root volume bị xóa khi instance bị chấm dứt. Đối với các data volume bổ sung bạn gắn, mặc định là false — chúng tồn tại sau khi instance bị chấm dứt. Bạn có thể thay đổi cả hai cài đặt. Nếu bạn muốn root volume sống sót qua việc chấm dứt instance (cho phân tích pháp y hoặc khôi phục dữ liệu), vô hiệu hóa "Delete on Termination." Nếu bạn muốn các data volume được dọn dẹp tự động, bật nó.

**Có thể gắn và tháo.** Một EBS volume có thể được tháo khỏi một instance và gắn vào một instance khác. Nếu bạn cần di chuyển dữ liệu hoặc khôi phục từ một instance thất bại, bạn có thể tháo volume và gắn lại nó ở nơi khác.

Quy trình tháo-và-gắn-lại chậm hơn so với khôi phục snapshot nhưng bảo toàn trạng thái chính xác của volume — tất cả các lần ghi chưa commit, tất cả dữ liệu đã lưu, trạng thái hệ thống tệp chính xác. Điều này làm cho nó hữu ích cho phân tích pháp y (gắn volume vào một instance phân tích mà không khởi động hệ thống gốc) và cho di chuyển dữ liệu (di chuyển một database volume sang một instance lớn hơn mà không lấy một snapshot).

**Gắn đơn (hầu hết).** Theo mặc định, một EBS volume được gắn vào chính xác một EC2 instance tại một thời điểm. Một instance đơn có thể có nhiều EBS volume, nhưng một EBS volume đơn không thể được mount bởi nhiều instance đồng thời (với một ngoại lệ: EBS Multi-Attach, có các trường hợp sử dụng hạn chế và các hạn chế quan trọng).

EBS Multi-Attach cho phép các volume io1/io2 (Provisioned IOPS) được gắn vào nhiều instance đồng thời trong cùng AZ. Điều này nghe có vẻ giải quyết vấn đề "lưu trữ chia sẻ", nhưng nó đi kèm các ràng buộc nghiêm trọng: các ứng dụng trên các instance được gắn phải có thể phối hợp truy cập đồng thời — ngữ nghĩa hệ thống tệp chia sẻ (quản lý khóa, thứ tự ghi) không được cung cấp bởi EBS. Trong thực tế, EBS Multi-Attach được sử dụng cho các ứng dụng cơ sở dữ liệu cụm tự xử lý việc phối hợp. Đối với truy cập tệp chia sẻ chung, EFS đơn giản hơn và phù hợp hơn.

Phép so sánh EBS: một ổ cứng ngoài cắm vào một máy tính xách tay. Máy tính xách tay (EC2 instance) có thể đọc và ghi vào nó. Khi bạn xong, bạn có thể rút nó ra và cắm nó vào một máy tính xách tay khác.

**Các Loại EBS Volume**

Không phải tất cả các EBS volume đều giống nhau. AWS cung cấp một số loại với các hồ sơ hiệu năng và chi phí khác nhau.

**gp3 (General Purpose SSD)**: Lựa chọn mặc định cho hầu hết các khối lượng công việc. Cân bằng tốt giữa hiệu năng và giá. Phù hợp cho các boot volume, các cơ sở dữ liệu nhỏ, và các môi trường phát triển.

Trước khi gp3 trở thành mặc định, có **gp2** — và bạn vẫn sẽ gặp nó trong thực tế. Các volume gp2 buộc hiệu năng IOPS của chúng trực tiếp với kích cỡ volume: bạn nhận 3 IOPS mỗi gigabyte, lên đến tối đa 16.000 IOPS (đòi hỏi một volume 5.334 GB). Thông lượng bị giới hạn ở 250 MB/s. Sự ghép nối này có nghĩa là trên gp2, cách duy nhất để nhận nhiều IOPS hơn là làm volume lớn hơn — ngay cả khi bạn không cần không gian thêm. gp3 phá vỡ sự phụ thuộc đó: nó bắt đầu ở 3.000 IOPS và 125 MB/s bất kể kích cỡ, và cho phép bạn cấu hình IOPS và thông lượng độc lập, với chi phí thấp hơn. AWS khuyến nghị gp3 cho các volume mới, nhưng vì nhiều khối lượng công việc hiện có vẫn chạy trên gp2, bạn cần biết cả hai.

**io2 (Provisioned IOPS SSD)**: Lựa chọn hiệu năng cao cho các khối lượng công việc tốn nhiều I/O. Bạn chỉ định bao nhiêu thao tác I/O mỗi giây (IOPS) bạn cần, và AWS đảm bảo hiệu năng đó. Phù hợp cho các cơ sở dữ liệu production lớn.

**st1 (Throughput Optimized HDD)**: Lưu trữ từ tính được tối ưu hóa cho các lần đọc và ghi tuần tự lớn. Chi phí thấp hơn SSD, nhưng chậm hơn cho I/O ngẫu nhiên. Tốt cho kho dữ liệu và xử lý nhật ký.

**sc1 (Cold HDD)**: Lựa chọn EBS rẻ nhất. Cho dữ liệu được truy cập không thường xuyên. Không phù hợp cho bất cứ điều gì nhạy cảm với thời gian.

"io2 tốn thêm bao nhiêu so với gp3?" Tom hỏi, ngước nhìn khỏi cuốn sổ tay của mình.

Leo mở trang giá. io2 chạy nhiều hơn 50–60% mỗi GB so với gp3, cộng thêm một khoản phí riêng cho mỗi IOPS được cấp phát — và trên một volume hiệu suất cao, các khoản phí theo IOPS đó là những gì chiếm lĩnh hóa đơn. Tom lưu ý khoảng cách. "Vậy chúng ta sử dụng gp3 cho đến khi cơ sở dữ liệu thực sự cần đảm bảo hiệu năng."

Kỳ thi không đòi hỏi bạn ghi nhớ tất cả các loại. Nó kiểm tra khả năng của bạn để khớp các yêu cầu với loại đúng: yêu cầu IOPS → io2. Các khối lượng công việc tuần tự nhạy cảm với chi phí → st1. Các ứng dụng web chung → gp3.

**IOPS so với Thông Lượng: Tại Sao Sự Phân Biệt Quan Trọng**

Tom quay lại câu hỏi về EBS volume vào thứ Ba sau, sau khi kiểm tra CloudWatch.

"Tôi thấy hai chỉ số trên bảng điều khiển EBS," anh nói. "IOPS và thông lượng. Chúng là những thứ khác nhau?"

Đúng vậy.

**IOPS** (Input/Output Operations Per Second) đo bao nhiêu thao tác đọc hoặc ghi đĩa có thể xử lý mỗi giây. Mỗi thao tác thường nhỏ — 4KB đến 256KB. IOPS cao quan trọng cho các cơ sở dữ liệu thực hiện nhiều lần đọc và ghi ngẫu nhiên, nhỏ: lấy các hàng riêng lẻ, cập nhật các bản ghi, xử lý các truy vấn đồng thời.

**Thông lượng** (đo bằng MB/s) đo bao nhiêu dữ liệu di chuyển mỗi giây. Thông lượng cao quan trọng cho các khối lượng công việc tuần tự: đọc các tệp nhật ký lớn, phân tích streaming, tải các tập dữ liệu lớn.

Một cơ sở dữ liệu thường cần IOPS cao và thông lượng thấp-đến-trung-bình. Một kho dữ liệu quét các bảng lớn cần thông lượng cao và có thể sống với IOPS trung bình.

Tom đã theo dõi các chỉ số CloudWatch của cơ sở dữ liệu Nimbus. IOPS đang tăng vọt trong giờ cao điểm bữa tối — các lần đọc ngẫu nhiên, ngắn khi ứng dụng lấy các mục thực đơn và dữ liệu đơn hàng. Thông lượng thấp. Mẫu khớp với một khối lượng công việc cơ sở dữ liệu cần IOPS tốt hơn, không phải thông lượng tốt hơn.

"Vậy nếu cơ sở dữ liệu trở nên chậm," Tom nói, "chúng ta kiểm tra liệu nó bị giới hạn IOPS hay bị giới hạn thông lượng trước khi chúng ta nâng cấp volume?"

"Đúng," Priya nói. "Nâng cấp từ gp3 lên io2 thêm IOPS với một chi phí. Nếu vấn đề là thông lượng, nâng cấp đó sẽ không giúp ích. Kiểm tra chỉ số trước."

Đây chính xác là cách bạn tránh các nâng cấp lưu trữ đắt đỏ giải quyết sai vấn đề.

**EBS Snapshot: Bản Sao Lưu**

Đây là một thứ cứu các công ty một cách đều đặn.

Một **EBS snapshot** là một bản sao lưu tại một thời điểm của một EBS volume, được lưu trữ trong S3 (mặc dù bạn truy cập nó qua giao diện EBS, không trực tiếp qua S3). Các snapshot là gia tăng: snapshot đầu tiên chụp toàn bộ volume; các snapshot tiếp theo chỉ lưu trữ những gì đã thay đổi kể từ cái cuối cùng.

Bạn có thể tạo một EBS volume mới từ một snapshot — khôi phục về một thời điểm trước một sự hỏng cơ sở dữ liệu, một triển khai tồi, hoặc một sự xóa vô tình.

Bạn nên tự động hóa các snapshot. AWS cung cấp **Amazon Data Lifecycle Manager** cho mục đích này: định nghĩa một policy (lấy một snapshot mỗi 6 giờ, giữ 7 ngày cuối), và nó chạy tự động.

Priya đã thiết lập điều này trước cả khi cơ sở dữ liệu đi vào production.

Leo đã không nghĩ đến nó.

"Chúng ta đã nghĩ về chuyện gì xảy ra nếu công việc snapshot thất bại âm thầm chưa?" Priya hỏi. "Nếu policy chạy nhưng các snapshot thực ra không hợp lệ?"

Họ kiểm tra quá trình khôi phục chiều hôm đó.

Policy sao lưu snapshot đầy đủ của Priya cho cơ sở dữ liệu production Nimbus, một khi cô có thời gian để ghi chép nó đúng cách:

- **Snapshot hàng ngày**, giữ trong 7 ngày. Những cái này bao gồm tình huống khôi phục bình thường: một triển khai tồi, một sự xóa vô tình, một sự kiện hỏng được phát hiện trong vòng một tuần.
- **Snapshot hàng tuần** (lấy mỗi Chủ nhật lúc 2 giờ sáng), giữ trong 30 ngày. Những cái này bao gồm tình huống nơi một vấn đề không được phát hiện ngay lập tức — một sự hỏng dữ liệu tinh vi chỉ được nhận thấy vài tuần sau.
- Sao chép snapshot giữa các region sang `us-east-1`, một lần một tuần, giữ trong 30 ngày. Những cái này bao gồm tình huống nơi toàn bộ Region `us-west-2` không khả dụng và Nimbus cần xây dựng lại cơ sở dữ liệu ở nơi khác.

"Đó có vẻ là nhiều snapshot," Leo nói.

"Mỗi snapshot gia tăng sau cái đầu tiên nhỏ," Priya nói. "Bạn chỉ lưu trữ những gì đã thay đổi. Tổng chi phí lưu trữ khiêm tốn."

Tom đã tra giá. Snapshot hàng ngày của một cơ sở dữ liệu 50GB, giữ trong 7 ngày, cộng các snapshot hàng tuần giữ trong 30 ngày — khoảng 3 đến 5 đô la mỗi tháng. Chi phí của việc không có chúng, nếu cơ sở dữ liệu có bao giờ bị hỏng, là cao hơn một cách không thể đo lường.

"Và Fast Snapshot Restore?" Leo hỏi. "Tôi đã thấy tùy chọn đó khi tôi đang nhìn các cài đặt."

**Fast Snapshot Restore** (FSR) là một tính năng EBS loại bỏ hình phạt hiệu năng I/O thường xảy ra khi bạn lần đầu sử dụng một snapshot được khôi phục. Không có FSR, một EBS volume vừa được khôi phục hoạt động kém trong vài phút hoặc giờ đầu tiên khi dữ liệu được tải lười biếng từ S3 — các lần đọc tấn công S3 cho dữ liệu chưa được kéo về volume. Với FSR được bật trên một snapshot trong một AZ cụ thể, volume được khôi phục ngay lập tức sẵn sàng cho hiệu năng đầy đủ.

FSR tốn thêm — bạn trả tiền cho mỗi snapshot mỗi AZ mỗi giờ mà FSR được bật. Đối với các snapshot khôi phục thảm họa của Nimbus, việc sử dụng thỉnh thoảng không biện minh cho chi phí FSR liên tục. Đối với một snapshot cơ sở dữ liệu production cần được khôi phục và vận hành trong vòng vài phút trong một tình huống khẩn cấp, FSR đáng giá.

"Bật FSR trên snapshot hàng tuần mà chúng ta thực sự sẽ sử dụng cho khôi phục thảm họa," Priya nói. "Đừng bật nó trên mọi snapshot hàng ngày trong cửa sổ giữ."

Tom thêm phép tính chi phí vào bảng tính của mình.

**Sao Chép Snapshot Giữa Các Region Cho Khôi Phục Thảm Họa**

Các EBS snapshot sống trong Region nơi chúng được tạo. Nếu toàn bộ Region `us-west-2` sập, các snapshot của bạn trong `us-west-2` không thể truy cập.

Giải pháp: **sao chép snapshot giữa các region**. Bạn có thể sao chép một EBS snapshot sang một Region khác, cho bạn một bản sao lưu có thể sử dụng ngay cả khi Region chính của bạn không khả dụng.

AWS Data Lifecycle Manager hỗ trợ sao chép giữa các region tự động như một phần của một policy snapshot: lấy một snapshot hàng ngày trong `us-west-2`, tự động sao chép nó sang `us-east-1` một lần một tuần. Nếu thảm họa xảy ra, khởi động một EC2 instance mới trong `us-east-1`, khôi phục từ snapshot giữa các region, cập nhật endpoint DNS, và tiếp tục vận hành.

"Đây là kế hoạch khôi phục thảm họa của chúng ta cho cơ sở dữ liệu," Priya nói, trình bày tài liệu policy cho nhóm. "Không phải một kiến trúc multi-region đầy đủ — đó là nhiều độ phức tạp hơn chúng ta cần ngay bây giờ. Nhưng nếu `us-west-2` sập hoàn toàn, chúng ta có thể khôi phục trong `us-east-1` trong vòng hai giờ."

"Hai giờ ngừng hoạt động," Tom nói.

"So với ngừng hoạt động vô hạn," Priya nói.

Tom thừa nhận sự phân biệt.

**Mã Hóa EBS: Câu Chuyện Về Tại Sao Bạn Không Thể Mã Hóa Tại Chỗ**

Cơ sở dữ liệu production Nimbus đã chạy được sáu tuần khi Priya đánh dấu một điều.

"EBS volume không được mã hóa," cô nói.

"Chúng ta có thể mã hóa nó không?" Leo hỏi.

"Có. Nhưng không tại chỗ."

Đây là điều về mã hóa EBS: bạn không thể mã hóa một EBS volume hiện có, không được mã hóa một cách trực tiếp. Dữ liệu đã được ghi bằng văn bản rõ. Để mã hóa nó, bạn phải:

1. Tạo một snapshot của volume không được mã hóa
2. Sao chép snapshot, bật mã hóa trên bản sao
3. Tạo một EBS volume được mã hóa mới từ snapshot được mã hóa
4. Dừng instance
5. Tháo volume không được mã hóa cũ
6. Gắn volume được mã hóa mới
7. Khởi động instance và xác minh mọi thứ hoạt động

Quá trình này có một cửa sổ ngừng hoạt động — chuỗi dừng, tháo, gắn, khởi động. Đối với Nimbus, với một cơ sở dữ liệu nhỏ, cửa sổ khoảng mười lăm phút. Đối với một cơ sở dữ liệu production lớn với hàng trăm GB, quá trình snapshot và sao chép có thể mất lâu hơn, mặc dù thời gian ngừng hoạt động instance thực tế vẫn chỉ là chu kỳ dừng/khởi động.

"Tại sao chúng ta không thể chỉ bật một công tắc?" Leo hỏi.

"Vì dữ liệu hiện có trên đĩa là các byte không được mã hóa," Priya nói. "AWS không thể mã hóa lại chúng mà không đọc và ghi lại mọi block — đó chính xác là cái quá trình sao chép snapshot làm. Nó đọc mọi block từ snapshot nguồn, mã hóa mỗi cái, và ghi nó vào snapshot mới."

Leo đi qua quá trình. Volume được mã hóa mới được gắn. Instance trở lại trực tuyến. Cơ sở dữ liệu đang chạy trên một volume được mã hóa.

"Các EBS volume mới có thể được tạo được mã hóa theo mặc định," Priya nói. "Có một cài đặt cấp tài khoản. Mọi volume mới được mã hóa tự động. Chúng ta đáng lẽ nên bật điều này vào ngày đầu tiên."

Cô bật nó. Từ thời điểm đó trở đi, mọi EBS volume được tạo trong tài khoản AWS của Nimbus được mã hóa theo mặc định — không cần bước thêm.

**EFS: Tủ Hồ Sơ Chia Sẻ**

EBS là một đĩa được gắn vào một instance. Nếu nhiều instance cần truy cập cùng các tệp đồng thời thì sao?

Cái bạn cần là thứ gì đó như tủ hồ sơ ở trung tâm một văn phòng — bất kỳ ai cũng có thể bước tới, lấy một tệp, đặt nó lại, và người tiếp theo thấy thay đổi ngay lập tức. Nhiều người, đồng thời, truy cập cùng lưu trữ.

AWS gọi cái này là **EFS**: Elastic File System.

EFS là một hệ thống tệp mạng được quản lý. Nhiều EC2 instance có thể mount cùng một hệ thống tệp EFS cùng lúc và đọc/ghi vào các tệp chia sẻ. Đây là khả năng chính mà EBS không cung cấp.

Nói một cách thẳng thắn:

EBS là một ổ cứng ngoài cắm vào một máy tính xách tay. Chỉ máy tính xách tay đó có thể sử dụng nó tại một thời điểm.

EFS là tủ hồ sơ ở trung tâm văn phòng. Bất kỳ thành viên nhóm nào cũng có thể bước tới, mở một ngăn kéo, đọc một tệp, đặt lại thứ gì đó.

**Khi nào bạn cần EFS?**

- Khi nhiều EC2 instance cần chia sẻ tệp — các hệ thống quản lý nội dung, các tệp cấu hình chia sẻ, các thư viện truyền thông chia sẻ
- Khi bạn có một ứng dụng được mở rộng ngang nơi tất cả các instance cần truy cập vào cùng dữ liệu
- Khi bạn cần một hệ thống tệp bền vững sống sót qua các sự cố instance

EFS được truy cập qua mạng sử dụng giao thức NFS (cụ thể là NFSv4). Bất kỳ EC2 instance nào có kết nối mạng đến mount target EFS đều có thể mount nó — bao gồm các instance ở các AZ khác nhau trong cùng Region. Bạn cấu hình các mount target ở mỗi AZ, và các instance kết nối đến mount target gần nhất cho hiệu năng tối ưu.

Hàm ý thực tế: EFS hoạt động trên các AZ ngay từ đầu. Nếu bạn có các máy chủ web ở `us-west-2a` và `us-west-2b` cùng mount cùng một hệ thống tệp EFS, một tệp được ghi bởi một máy chủ ở `2a` ngay lập tức hiển thị với một máy chủ ở `2b`. Đây là hành vi hệ thống tệp chia sẻ mà EBS không thể cung cấp.

**Các Performance Mode Của EFS**

EFS có hai chế độ thông lượng quan trọng cho việc định cỡ:

**Elastic Throughput** (mặc định cho hầu hết các hệ thống tệp mới): EFS tự động mở rộng thông lượng lên và xuống dựa trên việc sử dụng thực tế. Bạn không cấp phát một mức thông lượng. Bạn trả cho những gì bạn sử dụng. Đây là chế độ đúng cho các khối lượng công việc biến đổi nơi nhu cầu thông lượng dao động — như Nimbus, nơi lưu lượng sáng thứ Hai khác với buổi tối thứ Sáu.

**Provisioned Throughput**: Bạn chỉ định mức thông lượng bất kể dữ liệu được lưu trữ. Hữu ích khi khối lượng công việc của bạn cần thông lượng cao nhất quán vượt quá những gì khối lượng dữ liệu được lưu trữ sẽ cung cấp trong chế độ Elastic. Nếu bạn đang chạy một hệ thống build đọc hàng chục gigabyte mỗi phút bất kể bao nhiêu được lưu trữ, Provisioned Throughput là phù hợp.

Cũng có một chế độ thứ ba, **Bursting Throughput**, là hành vi EFS gốc và vẫn là mặc định cho các hệ thống tệp được tạo trước khi Elastic trở nên có sẵn. Trong chế độ Bursting, thông lượng mở rộng với bao nhiêu dữ liệu bạn lưu trữ: bạn nhận một đường cơ sở 50 KB/s mỗi GB, cộng các burst credit tích lũy khi bạn dưới đường cơ sở và có thể được chi tiêu khi bạn cần thông lượng cao hơn (lên đến 100 MB/s cho các hệ thống tệp nhỏ hơn, hoặc lên đến một bội số của đường cơ sở cho các hệ thống lớn hơn). Nó là lựa chọn đúng cho các khối lượng công việc với các mẫu truy cập không thể đoán trước hoặc đột biến nơi hệ thống tệp đủ lớn để kiếm các burst credit có ý nghĩa. Nếu hệ thống tệp của bạn nhỏ và mẫu truy cập của bạn đột biến, bạn có thể đốt hết các credit của mình nhanh chóng — theo dõi chỉ số CloudWatch `BurstCreditBalance` để biết bạn đứng ở đâu.

Câu hỏi của Tom là ngay lập tức: "Elastic đắt hơn không?"

"Tùy thuộc vào mẫu sử dụng," Leo nói. "Với Elastic, bạn trả cho thông lượng bạn thực sự tiêu thụ. Với Provisioned, bạn trả cho thông lượng bạn đã chỉ định ngay cả khi bạn không sử dụng nó."

"Vậy cho các khối lượng công việc biến đổi, Elastic thường rẻ hơn," Tom nói.

"Thường," Priya nói. "Kiểm tra các mẫu thông lượng thực tế của bạn trong CloudWatch trước khi quyết định."

EFS cũng có hai performance mode: **General Purpose** (độ trễ thấp, phù hợp cho hầu hết các khối lượng công việc, mặc định) và **Max I/O** (thông lượng cao hơn cho các khối lượng công việc song song hóa cao với chi phí độ trễ hơi cao hơn). General Purpose xử lý đại đa số các trường hợp sử dụng. Max I/O được thiết kế cho các ứng dụng cần thực hiện hàng nghìn thao tác hệ thống tệp đồng thời — các đường ống xử lý truyền thông quy mô lớn, các luồng công việc điện toán khoa học với nhiều người đọc song song.

**EFS so với S3:** EFS là một hệ thống tệp (thư mục, tệp, quyền, khóa). S3 là lưu trữ đối tượng (tải lên, tải xuống, không có ngữ nghĩa hệ thống tệp). EFS đắt hơn nhiều so với S3 — khoảng 0,30 đô la mỗi GB mỗi tháng cho EFS Standard so với 0,023 đô la mỗi GB mỗi tháng cho S3 Standard. Sử dụng S3 cho các tệp được lưu trữ và lấy toàn bộ. Sử dụng EFS cho các tệp mà các ứng dụng tích cực đọc và ghi qua các thao tác hệ thống tệp chuẩn.

**Nếu EBS Thì Một Instance, Nhưng Nếu EFS Thì Nhiều**

Quyết định EBS/EFS đến với một câu hỏi: bao nhiêu instance cần truy cập lưu trữ này cùng một lúc?

Nếu bạn xây dựng một ứng dụng được mở rộng ngang trên EBS, thì mỗi instance có đĩa riêng của nó — nhưng khi một người dùng tải một tệp lên instance A, instance B không thể thấy nó. Điều đó ổn cho các cơ sở dữ liệu (mỗi DB có đĩa riêng của nó), nhưng hỏng cho nội dung chia sẻ. Nếu bạn cần truy cập chia sẻ, EFS là câu trả lời — nhưng EFS tốn nhiều hơn mỗi GB so với S3, và có độ trễ cao hơn EBS cho I/O ngẫu nhiên. Lựa chọn đúng phụ thuộc hoàn toàn vào những gì ứng dụng của bạn làm với dữ liệu.

**Chọn Lưu Trữ Đúng**

Đến giờ bạn đã thấy ba loại lưu trữ trong AWS. Hãy làm cho quyết định rõ ràng.

| Nhu cầu                                  | Loại lưu trữ     |
|------------------------------------------|------------------|
| Cơ sở dữ liệu cần đĩa bền vững, nhanh     | EBS (gp3 hoặc io2) |
| Nhiều máy chủ cần tệp chia sẻ            | EFS              |
| Tệp, bản sao lưu, hình ảnh, đối tượng lớn | S3               |
| Không gian nháp tính toán tạm thời       | Instance Store   |
| Lưu trữ dài hạn với chi phí tối thiểu    | S3 Glacier       |

Bạn có thể đang tự hỏi: nếu EFS cho phép nhiều instance chia sẻ tệp, tại sao không chỉ sử dụng nó cho mọi thứ? Vì EFS tốn nhiều hơn đáng kể mỗi GB so với S3, và có độ trễ cao hơn EBS cục bộ cho I/O ngẫu nhiên. Nó là công cụ đúng cho truy cập hệ thống tệp chia sẻ — không phải cho lưu trữ tệp chung hoặc lưu trữ cơ sở dữ liệu.

Đưa ra quyết định này đúng quan trọng. Sử dụng S3 nơi bạn cần EFS thêm độ phức tạp vận hành. Sử dụng EBS nơi bạn cần EFS gây ra các lỗi khi bạn mở rộng. Sử dụng instance store nơi bạn cần sự bền vững mất dữ liệu.

Priya in bảng này và dán nó lên tường.

"Mỗi khi chúng ta thêm một yêu cầu lưu trữ," cô nói, "chúng ta bắt đầu ở đây."

Hãy đi qua một vài tình huống thực để làm cho quyết định cụ thể:

**Tình huống A**: Một công việc huấn luyện học máy chạy trên một GPU EC2 instance và cần đọc một tập dữ liệu 200GB. Công việc chạy một lần một ngày và mất hai giờ. Tập dữ liệu được chia sẻ bởi nhiều nhóm nghiên cứu.

Quyết định: S3. Tập dữ liệu lớn, đọc-một-lần-mỗi-công-việc, và chia sẻ. S3 rẻ, bền, và có thể truy cập từ bất kỳ EC2 instance hoặc tài khoản của bất kỳ nhóm nào. GPU instance đọc nó qua API S3. Không cần một hệ thống tệp ở đây.

**Tình huống B**: Một site WordPress chạy trên bốn EC2 instance đằng sau một bộ cân bằng tải. WordPress lưu trữ các tệp plugin, các tệp theme, và các tệp người dùng tải lên trong một thư mục trên máy chủ. Tất cả bốn instance cần đọc và ghi cùng các tệp.

Quyết định: EFS. WordPress sử dụng ngữ nghĩa hệ thống tệp — nó tạo các thư mục, ghi các tệp, đọc các tệp theo đường dẫn. S3 sẽ đòi hỏi viết lại hệ sinh thái plugin WordPress. EFS mount như một hệ thống tệp NFS chuẩn, mà WordPress hoạt động với một cách tự nhiên.

**Tình huống C**: Một cơ sở dữ liệu PostgreSQL chạy trên một EC2 instance. Nó cần I/O ngẫu nhiên nhanh cho việc thực thi truy vấn và tra cứu chỉ mục.

Quyết định: EBS (gp3 hoặc io2). Các cơ sở dữ liệu cần lưu trữ block với độ trễ thấp cho các lần đọc và ghi ngẫu nhiên, nhỏ. S3 quá chậm và không hỗ trợ ngữ nghĩa hệ thống tệp. EFS có độ trễ cao hơn EBS cho I/O ngẫu nhiên.

Mẫu: mặc định cho các tệp là S3. Thêm EBS khi bạn cần lưu trữ block cho một instance cụ thể. Thêm EFS khi nhiều instance cần chia sẻ một hệ thống tệp. Instance store chỉ cho không gian nháp tạm thời.

## Khi EFS Không Đủ: Amazon FSx

Bài học lưu trữ tiếp theo không đến như một sự cố hoặc một cuộc tranh luận bảng trắng. Nó đến như một hợp đồng bán hàng — loại Maya đã theo đuổi kể từ khi portal ra mắt, loại mất cả một quý demo và các cuộc gọi theo dõi để chốt. Ba tháng sau khi portal nhà điều hành nhà hàng ra mắt, Nimbus ký khách hàng đa địa điểm đầu tiên của mình: Copper Kettle, một nhóm gia đình một tá địa điểm trên khắp miền trung tây. Maya đã chạy thương vụ. Tom đã xây dựng mô hình tài chính. Leo đã bắt đầu lên kế hoạch tích hợp kỹ thuật trước khi mực khô.

Rồi anh đọc các ghi chú cơ sở hạ tầng từ nhóm IT của Copper Kettle.

"Máy chủ tệp của họ là Windows," anh nói. "Mọi thứ là Windows. Phần mềm quản lý bếp của họ, hệ thống HR của họ, công cụ lập lịch của họ — tất cả nó ghi vào các ổ đĩa chia sẻ trên các máy chủ tệp Windows. Giao thức SMB. Xác thực Active Directory."

"Chúng ta có thể nâng họ lên EFS không?" Maya hỏi.

Leo lắc đầu. "EFS sử dụng NFS. Các ứng dụng của họ nói SMB. Đó là các giao thức khác nhau. Phần mềm Copper Kettle không biết NFS là gì. Bạn không thể chỉ trỏ nó vào một mount EFS."

"Vậy chúng ta không thể sử dụng EFS."

"Không cho cái này. Có một dịch vụ khác."

**FSx for Windows File Server: EFS, Nhưng Cho Windows**

**Amazon FSx for Windows File Server** là một hệ thống tệp chia sẻ Windows-gốc, được quản lý hoàn toàn. Nó hỗ trợ giao thức SMB (Server Message Block) — cùng giao thức mà các máy chủ Windows, các ứng dụng Windows, và các ổ đĩa tệp Windows on-premises đã sử dụng trong nhiều thập kỷ. Nó tích hợp với Active Directory, hỗ trợ Windows ACL (quyền cấp tệp), và hỗ trợ các tính năng đặc thù Windows mà các ứng dụng Windows thực sự phụ thuộc.

Hãy nghĩ về nó như EFS, nhưng cho Windows — với tất cả các tính năng đặc thù Windows mà môi trường Active Directory của bạn đã mong đợi. Phần mềm quản lý bếp Copper Kettle sẽ kết nối với nó chính xác như nó đã kết nối với các máy chủ tệp on-premises. Ứng dụng không thay đổi. Giao thức không thay đổi. Dữ liệu chỉ sống trên một dịch vụ AWS được quản lý thay vì một máy chủ trong một tầng hầm ở đâu đó tại Chicago.

Đối với việc di chuyển Copper Kettle: Leo cấp phát một hệ thống tệp FSx for Windows File Server, kết nối nó với Active Directory của Copper Kettle (được mở rộng đến AWS qua AWS Managed Microsoft AD), và ánh xạ các chữ cái ổ đĩa hiện có. Phần mềm bếp tìm thấy các ổ đĩa tệp chia sẻ của nó chính xác nơi nó mong đợi chúng.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

Leo đã tra. FSx for Windows được định giá mỗi GB lưu trữ mỗi tháng — đắt hơn EFS, đáng kể hơn S3, nhưng rẻ hơn nhiều so với bảo trì các máy chủ tệp Windows trên một tá địa điểm. Tom viết con số xuống mà không phản đối.

**FSx for Lustre: Khi Công Việc ML Của Bạn Cần Nuôi Hàng Trăm GPU**

Trong khi đó, Leo đã bắt đầu tạo nguyên mẫu một engine đề xuất bên cạnh — dự đoán món ăn nào một khách hàng có khả năng đặt dựa trên hành vi quá khứ và những gì các khách hàng tương tự đã đặt. Dữ liệu huấn luyện vẫn còn nhỏ, nhưng thử nghiệm đưa anh xuống một hố thỏ về cách các nhóm ML nghiêm túc nuôi các mô hình của họ: các công việc huấn luyện đọc hàng trăm gigabyte từ S3 trong mỗi lần chạy.

"Mẫu cứ liên tục xuất hiện trong các case study," anh báo cáo tại bữa trưa nhóm tiếp theo, "là các công việc huấn luyện bị nghẽn cổ chai trên I/O. Các GPU đắt đỏ ngồi nhàn rỗi 40% thời gian, chờ đợi lô dữ liệu tiếp theo."

Đây là một vấn đề khác với lưu trữ tệp chia sẻ. Nó là một vấn đề điện toán hiệu năng cao (HPC): khi bạn có hàng trăm đơn vị xử lý tất cả cần đọc dữ liệu đồng thời, ở thông lượng rất cao, từ cùng tập dữ liệu.

**Amazon FSx for Lustre** là một triển khai được quản lý hoàn toàn của hệ thống tệp song song Lustre. Lustre được xây dựng có mục đích chính xác cho tình huống này — các lần đọc song song ở thông lượng cực cao, trên nhiều client đồng thời. Nó tích hợp gốc với S3: bạn trỏ FSx for Lustre vào một bucket S3, và nó tự động làm cho dữ liệu đó có sẵn qua hệ thống tệp Lustre. Công việc huấn luyện đọc từ một điểm mount cục bộ; FSx stream dữ liệu từ S3 đằng sau hậu trường.

Khi công việc huấn luyện ML của bạn cần nuôi dữ liệu cho hàng trăm GPU đồng thời, FSx for Lustre là công cụ. Tương tự áp dụng cho mô hình hóa tài chính, các khối lượng công việc genomics, và kết xuất video — bất kỳ khối lượng công việc nào nơi điểm nghẽn là thông lượng I/O song song chứ không phải dung lượng lưu trữ.

Case study mà Leo đã đánh dấu kể câu chuyện trong hai con số: sau khi di chuyển công việc huấn luyện sang FSx for Lustre, mức sử dụng GPU leo từ 60% lên 94%, và lần chạy huấn luyện đã mất sáu giờ hoàn thành trong ba tiếng rưỡi. Nimbus sẽ không cần loại sức mạnh đó trong một thời gian dài — nhưng Leo cất mẫu đi cho ngày engine đề xuất trưởng thành.

**Các Tùy Chọn FSx Khác**

AWS cũng cung cấp **FSx for NetApp ONTAP** — cho các doanh nghiệp đã chạy lưu trữ NetApp on-premises và muốn truy cập đa giao thức (NFS, SMB, và iSCSI từ cùng một hệ thống tệp) — và **FSx for OpenZFS**, cho các khối lượng công việc cần các tính năng đặc thù ZFS như snapshot và clone ở cấp hệ thống tệp. Cả hai là các công cụ chuyên dụng cho các tổ chức với cơ sở hạ tầng hoặc yêu cầu hiện có cụ thể.

Đối với hầu hết các nhóm, quyết định là giữa bốn biến thể FSx và EFS. Câu hỏi luôn giống nhau: khối lượng công việc nói giao thức gì, và nó cần các đặc điểm hiệu năng nào?

---

> **Mẹo Thi — Amazon FSx**
>
> *SAA-C03 Domain: Thiết kế Kiến trúc Hiệu năng Cao (Domain 3, Task 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + các khối lượng công việc Windows**. Các tín hiệu thi: "máy chủ tệp Windows," "giao thức SMB," "tích hợp Active Directory," "lift-and-shift các ứng dụng Windows." Khi bạn thấy bất kỳ cụm từ nào trong số đó, FSx for Windows là câu trả lời.
> - **FSx for Lustre = HPC + huấn luyện ML + I/O song song + tích hợp S3**. Các tín hiệu thi: "huấn luyện học máy," "điện toán hiệu năng cao," "HPC," "hệ thống tệp song song," "các khối lượng công việc tốn nhiều I/O," "cụm GPU," "tích hợp hệ thống tệp với S3." Khi bạn thấy những cụm từ đó, FSx for Lustre là câu trả lời.
> - **EFS không phải là thay thế cho cái nào.** EFS là NFS cho các khối lượng công việc Linux. Nó không nói SMB. Nó không phải là một hệ thống tệp hiệu năng cao song song. Sử dụng EFS nơi FSx cần có nghĩa là ứng dụng không hoạt động (Windows) hoặc bị nghẽn cổ chai I/O (HPC).
> - **FSx for NetApp ONTAP và FSx for OpenZFS** xuất hiện ít thường xuyên hơn, nhưng các tín hiệu đặc trưng. "Di chuyển lưu trữ NetApp/ONTAP hiện có," "truy cập đa giao thức (NFS + SMB + iSCSI)," hoặc "SnapMirror" → FSx for NetApp ONTAP. "ZFS," "NFS với snapshot/clone tức thì," hoặc "di chuyển một máy chủ tệp ZFS on-premises" → FSx for OpenZFS.
> - Tham khảo nhanh: "SMB hoặc máy chủ tệp Windows" → FSx for Windows. "Huấn luyện học máy hoặc điện toán hiệu năng cao" → FSx for Lustre. "NetApp/đa giao thức" → FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## Cầu Nối Đến Đám Mây: AWS Storage Gateway

Khách hàng tiềm năng lớn nhất của Nimbus cho đến nay — một chuỗi khu vực gọi là Meridian Kitchen, hai mươi địa điểm trên khắp ba tiểu bang — đến với một vấn đề không thể được giải quyết bằng `aws s3 cp`.

Meridian có nhiều năm dữ liệu vận hành sống trên các máy chủ tệp on-premises. Công thức, hóa đơn, đoạn quay video bếp, hợp đồng nhà cung cấp. Không phải vài gigabyte. Terabyte. Và phần mềm tạo ra và tiêu thụ dữ liệu này — hệ thống quản lý bếp của họ, nền tảng lập hóa đơn của họ, các công cụ HR của họ — tất cả nó ghi vào các ổ đĩa tệp cục bộ sử dụng NFS hoặc SMB. Viết lại những ứng dụng đó không khả thi. Di chuyển tất cả dữ liệu qua đêm cũng không khả thi.

"Vậy làm sao chúng ta bắt đầu đưa dữ liệu của họ vào AWS," Maya hỏi, "mà không yêu cầu họ thay đổi một ứng dụng nào?"

"Có một dịch vụ chính xác cho điều này," Priya nói. "Nó chạy trong trung tâm dữ liệu của họ như một VM, trông như một máy chủ tệp hoặc thiết bị lưu trữ bình thường đối với phần mềm hiện có của họ, và lặng lẽ lưu trữ mọi thứ trong AWS đằng sau hậu trường."

Dịch vụ đó là **AWS Storage Gateway**: một dịch vụ lưu trữ lai kết nối các môi trường on-premises với lưu trữ AWS. Nó trình bày lưu trữ cho các ứng dụng của bạn sử dụng các giao thức chúng đã hiểu, trong khi thực sự lưu giữ dữ liệu trong S3, S3 Glacier, hoặc dưới dạng EBS snapshot.

Có ba loại gateway, mỗi cái giải quyết một vấn đề on-premises khác nhau.

**File Gateway** trình bày một giao diện NFS hoặc SMB cho các ứng dụng on-premises. Các tệp được ghi vào gateway được lưu trữ dưới dạng đối tượng trong S3 — nhưng ứng dụng không biết điều đó. Nó thấy một hệ thống tệp. Các tệp được truy cập thường xuyên được lưu vào bộ nhớ đệm cục bộ cho các lần đọc độ trễ thấp; phần còn lại sống trong S3. Đây là cái Meridian cần: phần mềm quản lý bếp ghi vào cái trông như một ổ đĩa tệp, và dữ liệu kết thúc trong S3 nơi Nimbus có thể phân tích nó, sao lưu nó, và tìm kiếm nó.

"Khoan đã — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Tại sao không chỉ trỏ phần mềm vào S3 trực tiếp?"

Vì NFS và SMB không phải là S3. Phần mềm bếp không nói API của S3. Nó mở các đường dẫn tệp. Nó ghi byte vào một thư mục. File Gateway dịch điều đó thành các thao tác đối tượng S3 mà ứng dụng không biết gì đã thay đổi.

**Volume Gateway** trình bày các volume lưu trữ block iSCSI cho các máy chủ on-premises — cùng giao diện mà một ổ cứng vật lý hoặc thiết bị SAN sẽ trình bày. Nó có hai chế độ: *stored volumes* giữ dữ liệu chính on-premises với các bản sao lưu không đồng bộ sang S3 dưới dạng EBS snapshot (cho các khối lượng công việc on-premises-trước cũng muốn sao lưu đám mây), và *cached volumes* giữ dữ liệu chính trong S3 với dữ liệu được truy cập thường xuyên được lưu vào bộ nhớ đệm on-premises (cho các tổ chức sẵn sàng đối xử với S3 như lưu trữ chính).

**Tape Gateway** trình bày một thư viện băng ảo (VTL) cho phần mềm sao lưu như Veeam, Veritas, hoặc NetBackup. Phần mềm sao lưu ghi vào cái trông như các hộp băng vật lý. Những băng ảo đó được lưu trữ trong S3 và có thể được lưu trữ vào S3 Glacier. Phần mềm sao lưu không thay đổi. Các robot băng vật lý và kệ biến mất.

"Nhóm sao lưu của Meridian chạy Veeam," Leo nói. "Họ có băng vật lý thực. Lưu trữ ngoài site, lịch trình xoay vòng, toàn bộ."

"Tape Gateway thay thế các băng vật lý," Priya nói. "Cùng cấu hình Veeam. Cùng các công việc sao lưu. Các băng chỉ sống trong S3 thay vì một rack."

Tom tra giá lưu trữ băng ngoài site. Anh đóng tab đó mà không bình luận và phê duyệt kế hoạch di chuyển.

---

> **Mẹo Thi — AWS Storage Gateway**
>
> *SAA-C03 Domain: Thiết kế Kiến trúc Hiệu năng Cao (Domain 3)*
>
> - **File Gateway = NFS/SMB → S3.** Các tệp được ghi bởi các ứng dụng on-premises trở thành các đối tượng S3. Các tệp được truy cập thường xuyên được lưu vào bộ nhớ đệm cục bộ. Kích hoạt thi: "ứng dụng on-premises cần lưu trữ tệp trong S3 mà không thay đổi mã."
> - **Volume Gateway = lưu trữ block iSCSI → S3 snapshot.** Chế độ stored: dữ liệu chính on-premises, được sao lưu sang S3 dưới dạng EBS snapshot. Chế độ cached: dữ liệu chính trong S3, các block được truy cập thường xuyên được lưu vào bộ nhớ đệm cục bộ. Kích hoạt thi: "máy chủ on-premises cần lưu trữ block được sao lưu đám mây."
> - **Tape Gateway = VTL → S3/Glacier.** Phần mềm sao lưu ghi vào các băng ảo; các băng được lưu trữ trong S3 hoặc được lưu trữ vào Glacier. Kích hoạt thi: "thay thế cơ sở hạ tầng sao lưu băng vật lý mà không thay đổi phần mềm sao lưu."
> - **Mẫu thi chính:** "ứng dụng on-premises cần lưu trữ đám mây mà không thay đổi mã" → Storage Gateway. "Thay thế sao lưu băng" → Tape Gateway cụ thể.

---

## Điểm Mạnh Và Hạn Chế

**Điểm mạnh của EBS**:

- Lưu trữ block bền vững, nhanh cho EC2
- Snapshot cho sao lưu và khôi phục tại một thời điểm
- Nhiều tầng hiệu năng cho các khối lượng công việc khác nhau
- Mã hóa khi nghỉ được hỗ trợ gốc — bật mã hóa cấp tài khoản theo mặc định

**Hạn chế của EBS**:

- Được gắn vào một instance tại một thời điểm (với các ngoại lệ nhỏ)
- Trong cùng AZ với EC2 instance (sao chép sang một AZ khác đòi hỏi một snapshot)
- Bạn trả tiền cho lưu trữ được cấp phát, không chỉ những gì bạn sử dụng
- Mã hóa một volume hiện có không được mã hóa đòi hỏi một chu kỳ snapshot-sao-chép-khôi-phục với một cửa sổ bảo trì

**Điểm mạnh của EFS**:

- Hệ thống tệp chia sẻ đa instance — giao thức NFS gốc
- Mở rộng tự động, bạn không cấp phát dung lượng
- Có thể truy cập trên các AZ trong một Region
- Chế độ Elastic Throughput điều chỉnh tự động theo khối lượng công việc

**Hạn chế của EFS**:

- Đắt hơn S3 mỗi GB
- Độ trễ cao hơn EBS cho I/O ngẫu nhiên
- Không có sẵn ở tất cả các Region

## Di Chuyển Dữ Liệu Hàng Loạt: DataSync Và Snow Family

Storage Gateway giữ các ứng dụng on-premises *được kết nối liên tục* với lưu trữ đám mây. Nhưng hai tình huống di chuyển khác xuất hiện liên tục trong kỳ thi — và cuối cùng trong các dự án thực:

**AWS DataSync** dành cho *truyền hàng loạt trực tuyến*: di chuyển các tập dữ liệu lớn qua mạng giữa các máy chủ tệp NFS/SMB on-premises (hoặc các đám mây khác) và S3, EFS, hoặc FSx — một lần, hoặc theo lịch. Nó xử lý song song hóa, xác minh tính toàn vẹn, thử lại, và điều tiết băng thông, và nó nhanh hơn khoảng 10 lần so với các script kiểu rsync tự làm. Kích hoạt thi: "di chuyển/truyền hàng triệu tệp từ một máy chủ NFS on-premises sang Amazon EFS/S3" → DataSync. (Đừng nhầm lẫn nó với Storage Gateway, dành cho *truy cập lai liên tục*, hoặc DMS, di chuyển *cơ sở dữ liệu*.)

**AWS Snow Family** dành cho khi mạng là điểm nghẽn. Di chuyển 100 TB qua một đường 100 Mbps mất hơn ba tháng; một chiếc xe tải nhanh hơn. **Snowball Edge** là một thiết bị chắc chắn mà AWS gửi cho bạn — tải lên đến ~80 TB cục bộ, gửi nó trở lại, AWS nhập nó vào S3. **Snowcone** là phiên bản di động nhỏ (~8–14 TB) cho các vị trí edge — ngừng sản xuất vào cuối năm 2024, mặc dù nó vẫn có thể xuất hiện trong các câu hỏi thi cũ hơn (xem kiểm tra thực tế ở Chương 25). Kích hoạt phép toán thi: khi đề bài cho bạn một kích cỡ tập dữ liệu và một đường mỏng hoặc không đáng tin cậy và hỏi về di chuyển nhanh nhất/thực tế nhất, tính thời gian truyền — nếu nó là vài tuần hoặc vài tháng, câu trả lời là Snow Family.

> **Mẹo Thi — AWS Backup**
>
> Thêm một dịch vụ nữa khâu chương này lại với nhau: **AWS Backup** tập trung hóa và tự động hóa các bản sao lưu trên EBS, EFS, RDS, DynamoDB, FSx, và Storage Gateway với một kế hoạch sao lưu duy nhất — lịch trình, giữ, sao chép giữa các region và giữa các tài khoản, và Backup Vault Lock cho tính bất biến. Kích hoạt thi: "quản lý tập trung các bản sao lưu trên nhiều dịch vụ/tài khoản AWS" → AWS Backup, không phải các script theo từng dịch vụ.


## Tóm Tắt

Bút đỏ của Tom khoanh tròn vấn đề thực sự: quá nhiều trên một máy. Di chuyển lưu trữ khỏi EC2 instance không chỉ là về dung lượng — nó là về tách biệt các mối quan tâm để mỗi lớp có thể được quản lý, mở rộng, và bảo mật độc lập. Lựa chọn lưu trữ đúng phụ thuộc vào bốn câu hỏi: cái gì cần lưu trữ, bao nhiêu thứ cần nó cùng lúc, nó sống bao lâu, và nó được truy cập như thế nào? Bốn câu hỏi đó liên tục dẫn đến câu trả lời đúng.

- **EBS** (Elastic Block Store) là lưu trữ block bền vững cho một EC2 instance đơn lẻ. Nó sống sót qua các lần dừng instance và có thể được snapshot để sao lưu. Sử dụng gp3 cho các khối lượng công việc chung, io2 cho các yêu cầu IOPS cao. Instance store là tạm thời và nhanh nhưng mất khi instance chấm dứt.
- **EFS** (Elastic File System) là một hệ thống tệp mạng chia sẻ mà nhiều instance có thể mount đồng thời. EFS trải trên các AZ trong một Region; EBS bị giới hạn trong một AZ duy nhất.
- Khớp loại lưu trữ với yêu cầu: cơ sở dữ liệu EC2 đơn → EBS; tệp chia sẻ trên các máy chủ → EFS; đối tượng, truyền thông, bản sao lưu → S3; lưu trữ → S3 Glacier.
- Mã hóa một EBS volume hiện có đòi hỏi: snapshot → bản sao được mã hóa → volume mới → hoán đổi. Bật mã hóa cấp tài khoản theo mặc định để tránh điều này cho các volume mới.
- **EBS "Delete on Termination"**: các root volume mặc định xóa khi chấm dứt instance; các data volume mặc định tồn tại. Rà soát cả hai cài đặt khi thiết kế các policy vòng đời instance.

## Mẹo Thi

*SAA-C03 Domain 3 — Task 3.1 (giải pháp lưu trữ)*

- **Các EBS volume sống trong một AZ.** Chúng chỉ có thể được gắn vào một instance trong
  cùng AZ. Để sử dụng một EBS volume ở một AZ khác, bạn tạo một snapshot và khôi phục
  nó ở AZ mục tiêu.
- **Các EBS snapshot là gia tăng và được lưu trữ trong S3.** Snapshot đầu tiên là đầy đủ;
  các cái tiếp theo chỉ lưu trữ các thay đổi. Bạn có thể sao chép các snapshot sang các Region khác cho
  khôi phục thảm họa.
- **EFS là cross-AZ.** Nhiều instance ở các AZ khác nhau trong cùng Region
  có thể mount cùng một hệ thống tệp EFS. Đây là một yếu tố phân biệt chính với EBS.
- **Khi một tình huống thi nói "ứng dụng web với nội dung chia sẻ" hoặc "nhiều
  instance truy cập cùng các tệp," hãy nghĩ EFS.** Khi nó nói "lưu trữ cơ sở dữ liệu"
  hoặc "đĩa bền vững cho một máy chủ," hãy nghĩ EBS.
- **Dữ liệu instance store sống sót qua một lần reboot nhưng không qua một lần dừng hoặc chấm dứt.** Một câu hỏi
  có thể mô tả dữ liệu "biến mất sau khi instance bị dừng" — đó là instance
  store đang trong cuộc chơi.
- **gp3 so với io2**: gp3 là mặc định cho sử dụng chung; io2 dành cho các khối lượng công việc
  cần IOPS được đảm bảo (các cơ sở dữ liệu lớn, các hệ thống nhiệm vụ quan trọng). Các tình huống thi
  mô tả "yêu cầu IOPS" hoặc "hiệu năng cơ sở dữ liệu độ trễ thấp nhất quán"
  chỉ ra io2.
- **gp2 so với gp3:** IOPS gp2 được ghép với kích cỡ (3 IOPS/GB, tối đa 16.000 IOPS ở 5.334 GB); IOPS gp3 độc lập với kích cỡ (3.000 cơ sở, có thể cấu hình lên đến 80.000 kể từ tháng 9 năm 2025 — tài liệu cũ hơn, và có thể ngân hàng câu hỏi thi, vẫn giả định giới hạn 16.000 trước đó). Mẫu câu hỏi thi: một khối lượng công việc cần nhiều IOPS hơn mà không tăng lưu trữ — câu trả lời là gp3 hoặc io2, không phải gp2.
- **Mã hóa khi nghỉ cho EBS**: Bạn không thể mã hóa một volume hiện có không được mã hóa
  tại chỗ — bạn phải snapshot, sao chép được mã hóa, khôi phục. Bật mặc định mã hóa cấp tài khoản
  để tránh tạo các volume không được mã hóa một cách vô tình. Mã hóa là AES-256
  sử dụng các khóa KMS.
- **Fast Snapshot Restore** loại bỏ hình phạt hiệu năng trên các volume vừa được khôi phục
  nhưng tốn tiền mỗi snapshot mỗi AZ. Các câu hỏi thi về khôi phục các volume
  "ngay lập tức ở hiệu năng đầy đủ" chỉ ra FSR.
- **Các performance mode của EFS**: General Purpose (độ trễ thấp, phù hợp cho hầu hết các khối lượng công việc)
  so với Max I/O (thông lượng cao hơn cho các khối lượng công việc song song hóa cao).
- **Các throughput mode của EFS — ba tùy chọn:** Bursting (thông lượng mở rộng với kích cỡ lưu trữ, sử dụng burst credit — tốt cho các khối lượng công việc đột biến), Elastic (tự động mở rộng, trả theo mức sử dụng — tốt cho các khối lượng công việc không thể đoán trước), Provisioned (thông lượng cố định bất kể lưu trữ — tốt cho các nhu cầu thông lượng cao nhất quán). Kỳ thi kiểm tra liệu bạn có biết khi nào cấp phát thông lượng so với để nó mở rộng đàn hồi hoặc dựa vào burst credit không.
- **Sao chép snapshot giữa các region**: Các EBS snapshot có thể được sao chép sang các Region khác cho
  khôi phục thảm họa. Snapshot được sao chép là độc lập và không thêm chi phí truyền dữ liệu
  trong khi khôi phục — chỉ trong khi chính thao tác sao chép.
- **Các loại Storage Gateway:** File Gateway = NFS/SMB → S3 (các tệp trở thành các đối tượng). Volume Gateway = lưu trữ block iSCSI → S3 snapshot (stored: chính on-prem; cached: chính trong S3). Tape Gateway = VTL → S3/Glacier (thay thế các băng vật lý). Kích hoạt thi: "ứng dụng on-premises cần lưu trữ đám mây mà không thay đổi mã" → Storage Gateway. "Thay thế sao lưu băng" → Tape Gateway.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của bạn: sự khác biệt giữa EBS và EFS là gì? Khi nào bạn sẽ chọn
một cái thay vì cái kia?

*(Gợi ý: Nghĩ về việc liệu một instance hay nhiều instance cần truy cập
lưu trữ cùng một lúc.)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty chạy một ứng dụng web trên bốn EC2 instance đằng sau một bộ
cân bằng tải. Người dùng có thể tải lên ảnh hồ sơ. Bất kỳ ảnh nào phải có thể xem được bởi người dùng
ngay lập tức sau khi tải lên, bất kể instance nào đã xử lý nó. Các ảnh được
phục vụ cho các trình duyệt qua HTTP, không bao giờ được sửa đổi tại chỗ, và nhóm muốn giải pháp
hiệu quả về chi phí NHẤT, có thể mở rộng với ít chi phí vận hành nhất.

Giải pháp lưu trữ nào đáp ứng TỐT NHẤT yêu cầu của họ?

A) Gắn một EBS gp3 volume vào mỗi EC2 instance và đồng bộ các tệp giữa chúng sử dụng
   một cron job  
B) Lưu trữ các ảnh trực tiếp trên instance store của EC2 instance  
C) Sử dụng Amazon EFS, được mount trên cả bốn EC2 instance đồng thời  
D) Lưu trữ các ảnh trong S3 và truy cập chúng trực tiếp từ mã ứng dụng

**Gợi ý 1**: Yêu cầu là "cả bốn instance phải phục vụ bất kỳ ảnh nào." Lựa chọn nào
làm cho một tệp ngay lập tức hiển thị với tất cả các instance?

**Gợi ý 2**: Instance store là tạm thời. EBS không thể được mount trên nhiều instance
đồng thời. Điều đó thu hẹp nó lại.

**Gợi ý 3**: Cả C và D về lý thuyết có thể hoạt động. Cái nào phù hợp hơn cho một
trường hợp nơi ứng dụng cần truy cập các ảnh qua các thao tác hệ thống tệp so với
các yêu cầu HTTP?

**Đáp án**: D

**Giải thích**: Lưu trữ các ảnh trong S3 và phục vụ chúng qua URL là lựa chọn
đúng về mặt kiến trúc cho một ứng dụng web. Các ảnh được tải lên ngay lập tức có thể truy cập từ
bất kỳ máy chủ nào (và từ bất kỳ trình duyệt nào) qua URL của S3. S3 được thiết kế chính xác cho
trường hợp sử dụng này: lưu trữ các tệp được người dùng tải lên ở quy mô với tính khả dụng cao và không
chi phí quản lý.

Lưu ý: C (EFS) về kỹ thuật sẽ hoạt động, nhưng S3 là mẫu ưa thích cho các tệp nhị phân
được người dùng tải lên trong các ứng dụng web vì nó rẻ hơn, có thể mở rộng hơn, và phục vụ các tệp
qua HTTP trực tiếp mà không cần ứng dụng hoạt động như một proxy.

**Tại sao không A?** Đồng bộ các tệp qua cron job tạo ra các điều kiện đua và các vấn đề
nhất quán. Giữa các lần tải lên và lần đồng bộ tiếp theo, các tệp sẽ thiếu trên các instance khác.

**Tại sao không B?** Dữ liệu instance store bị mất khi instance bị dừng hoặc chấm dứt.
Các ảnh sẽ biến mất.

**Tại sao không C?** EFS là câu trả lời đúng khi câu hỏi đòi hỏi ngữ nghĩa hệ thống tệp
(ví dụ, một CMS sửa đổi các tệp tại chỗ). Đối với các ảnh được người dùng tải lên được phục vụ qua
web, S3 đơn giản hơn, rẻ hơn, và phù hợp hơn.

**Cảnh báo từ khóa thi**: trong kỳ thi thực, đọc đề bài theo nghĩa đen. Nếu nó nói
"lưu trữ **tệp** chia sẻ," "hệ thống tệp," "NFS," hoặc "POSIX," câu trả lời được khóa là
**EFS** — đừng ghi đè yêu cầu đã nêu bằng gu kiến trúc. Tình huống
này khóa vào S3 vì nó hỏi về phân phối đối tượng hiệu quả về chi phí qua HTTP,
không phải cho một hệ thống tệp.

*SAA-C03 Domain 3 — Task 3.1*

**Bài tập 3 — Thách thức kiến trúc** *(Tùy chọn)*

Nimbus đang thêm một tính năng mới: các chủ nhà hàng có thể tải lên các thực đơn PDF mà sau đó
được phân tích cú pháp và sử dụng để điền vào cơ sở dữ liệu Nimbus. Công việc xử lý PDF chạy
trên một đội EC2 instance cần: (a) đọc PDF được tải lên, (b) ghi
các tệp xử lý tạm thời, (c) ghi đầu ra được phân tích cú pháp.

Những dịch vụ lưu trữ nào bạn sẽ sử dụng cho mỗi trong ba bước này, và tại sao?

*(Không có câu trả lời đúng duy nhất. Tập trung vào việc khớp loại lưu trữ với các
đặc điểm của mỗi bước.)*

## Cảnh Sau Tín Dụng

Chiều hôm đó, Nimbus tách biệt lưu trữ của họ đúng cách. Cơ sở dữ liệu có EBS volume riêng
của nó với các snapshot tự động và mã hóa được bật. Các ảnh thực đơn chuyển sang S3. EC2 instance
cuối cùng có chỗ để thở.

Leo chạy một bài kiểm tra tải. Site xử lý hai trăm người dùng đồng thời mà không đổ
một giọt mồ hôi.

"Sẽ ổn từ đây," anh nói, theo dõi các biểu đồ ổn định mượt mà.

Tom nhìn hóa đơn. EBS volume đang thêm 8 đô la một tháng. Anh viết nó xuống.

"Tôi cứ thêm các thứ vào hóa đơn này," anh nói. "Khi nào nó cân bằng?"

"Khi chúng ta ngừng có các sự cố," Maya nói. "Mỗi sự cố tốn nhiều hơn việc phòng ngừa."

Tom trông không bị thuyết phục. Anh sẽ được, cuối cùng.

Ba ngày sau, một chủ nhà hàng trên nền tảng cố đặt một đơn hàng và nhận được
một lỗi. Maya kiểm tra nhật ký.

Cơ sở dữ liệu ở đó. Ứng dụng đang chạy. Nhưng hai mươi người dùng đồng thời
tất cả đang cố đọc thực đơn cùng một lúc, và mỗi người đang tấn công cơ sở dữ liệu.

"Mỗi lần tải trang là một truy vấn cơ sở dữ liệu," Leo nói. "Mỗi một cái."

Priya đã đang Google một thứ gì đó.

Chương tiếp theo: chuyện gì xảy ra khi nhiều khách hàng đến hơn máy chủ có thể xử lý.
