# Chương 2: Máy Chủ Của Bạn Ở Đâu Trên Thế Giới?

Đứng dậy. Đi đến cửa sổ nếu có một cái ở gần.

Nhìn ra ngoài. Bất cứ thứ gì bạn thấy — tòa nhà, cây cối, bãi đỗ xe, sân sau của ai đó — không có thứ nào trong số đó là nơi dữ liệu của bạn sống. Dữ liệu của bạn sống ở nơi khác hoàn toàn. Có lẽ ở một nơi bạn chưa bao giờ đến.

Điều đó không phải là vấn đề. Nhưng việc hiểu *ở đâu* làm cho một số điều bất ngờ có ý nghĩa.

Chương trước, Leo đã tạo tài khoản AWS lúc 11 giờ đêm và khởi động một máy chủ ở đâu đó. "Ở đâu đó" là từ khóa — anh không chắc mình đã chọn phần nào của thế giới, vì anh không cố ý chọn.

Sáng hôm sau, Maya nhận thấy máy chủ đang ở Singapore.

"Tại sao lại là Singapore?" cô hỏi.

"Đó là mặc định," Leo nói.

Tom ngước nhìn khỏi cà phê. "Tốn bao nhiêu để chạy một máy chủ ở Singapore khi tất cả khách hàng của chúng ta ở Bờ Tây?"

Leo không có câu trả lời.

Priya thì đã có: "Nó cũng chậm hơn nữa. Mỗi yêu cầu phải đi vòng quanh nửa thế giới."

Chương này nói về việc sửa quyết định đó — và hiểu tại sao nó quan trọng.

**Vấn Đề Với "Ở Đâu Đó"**

Khi bạn sử dụng AWS, bạn không sử dụng một trung tâm dữ liệu. Bạn đang sử dụng một mạng lưới toàn cầu của chúng. AWS có cơ sở hạ tầng ở hàng chục quốc gia.

Đó là một tính năng, không chỉ là một sự thật. Nhưng nó có nghĩa là bạn phải đưa ra lựa chọn: *ở đâu* bạn muốn cơ sở hạ tầng của mình chạy?

Lựa chọn quan trọng vì ba lý do:

**Hiệu suất.** Máy chủ của bạn càng gần người dùng, phản hồi càng nhanh. Vật lý học không thể thương lượng. Dữ liệu di chuyển với tốc độ khoảng hai phần ba tốc độ ánh sáng qua cáp quang. Một yêu cầu từ Seattle đến Singapore mất khoảng 300 mili giây chỉ trong quá trình vận chuyển — trước khi ứng dụng của bạn làm bất cứ điều gì.

**Tuân thủ.** Một số ngành có luật về nơi lưu trữ dữ liệu. Dữ liệu chăm sóc sức khỏe Hoa Kỳ có thể cần ở lại trong nước. Dữ liệu tài chính có thể cần ở lại trong một region cụ thể. Chọn Region sai có thể tạo ra vấn đề pháp lý.

**Khả năng phục hồi thảm họa.** Nếu một địa điểm bị mất điện, động đất, hoặc lỗi mạng, bạn muốn hệ thống của mình tồn tại. Phân tán cơ sở hạ tầng trên nhiều địa điểm là cách bạn bảo vệ chống lại thảm họa cục bộ.

**Cách AWS Tổ Chức Cơ Sở Hạ Tầng**

AWS chia cơ sở hạ tầng toàn cầu của mình thành ba khái niệm lồng nhau. Hãy nghĩ về chúng như búp bê Nga, từ lớn nhất đến nhỏ nhất.

**Regions → Availability Zones → Edge Locations**

Hãy mở từng cái.

**Regions: Những Hộp Lớn**

Một **Region** là một khu vực địa lý nơi AWS có một cụm trung tâm dữ liệu. Mỗi Region được đặt tên theo vị trí: `us-west-2` là Oregon, `us-east-1` là Northern Virginia, `eu-west-1` là Ireland, `ap-southeast-1` là Singapore — nơi máy chủ của Leo đang ẩn náu.

Có hơn 30 Region trên toàn thế giới, và AWS thêm thường xuyên.

Mỗi Region hoàn toàn độc lập. Dữ liệu trong `us-west-2` ở lại `us-west-2` trừ khi bạn chuyển nó một cách rõ ràng. Điều này rất quan trọng cho tuân thủ và khả năng phục hồi — một sự cố lớn trong một Region không tự động ảnh hưởng đến những cái khác.

"Vậy chúng ta nên chọn `us-west-2` cho Nimbus?" Tom hỏi.

Đúng. Đối với một doanh nghiệp Mỹ nhắm vào khách hàng Bờ Tây, đúng vậy. Độ trễ thấp hơn và người dùng của bạn nhận được phản hồi nhanh hơn.

"Nó đắt hơn Singapore bao nhiêu?" Tom thêm vào.

Giá cả thay đổi theo Region — thường vài phần trăm. Lợi ích hiệu suất và tuân thủ của Region đúng đáng để chênh lệch giá nhỏ.

**Availability Zones: Sự Dư Thừa Thực Sự**

Đây là nơi nó trở nên thú vị.

Mỗi Region không phải là một trung tâm dữ liệu duy nhất. Đó là một cụm nhiều trung tâm dữ liệu vật lý riêng biệt được gọi là **Availability Zones** (hay AZs).

Oregon (`us-west-2`) có bốn Availability Zone: `us-west-2a`, `us-west-2b`, `us-west-2c`, `us-west-2d`. Đây là những tòa nhà thực sự, được tách biệt bởi khoảng cách có ý nghĩa — đủ xa để hỏa hoạn, lũ lụt, hoặc mất điện ở một cái không ảnh hưởng đến những cái khác, nhưng đủ gần để mạng giữa chúng cực kỳ nhanh (độ trễ một chữ số mili giây).

Đây là kiến trúc làm cho AWS đáng tin cậy ở mức độ mà không có trung tâm dữ liệu đơn lẻ nào có thể sánh được.

Priya nghiêng về phía trước. "Vậy nếu chúng ta chạy ứng dụng trên hai Availability Zone và một cái bị tắt—"

"Cái kia tiếp tục chạy," Maya hoàn thành.

"Chính xác."

Leo, người đã lắng nghe yên lặng: "Tôi đã triển khai mọi thứ trong một AZ."

"Đúng vậy," Priya nói. "Chúng tôi đã nhận ra."

Khái niệm phân tán ứng dụng qua nhiều AZ — gọi là **triển khai Multi-AZ** — là một trong những mẫu khả năng phục hồi quan trọng nhất trong AWS. Chúng ta sẽ đi sâu vào nó trong Chương 18.

**Edge Locations: Tốc Độ, Khắp Nơi**

AZ giải quyết khả năng phục hồi. Chúng không giải quyết vấn đề phục vụ nội dung nhanh chóng cho người dùng ở các thành phố xa Region chính của bạn.

Nhập **Edge Locations**.

Edge Location là các điểm cơ sở hạ tầng nhỏ, nhẹ được phân tán trên hơn 400 thành phố trên toàn thế giới. Chúng không phải là trung tâm dữ liệu đầy đủ — chúng không thể chạy ứng dụng của bạn. Điều chúng *có thể* làm là lưu trữ nội dung gần người dùng của bạn.

Hãy tưởng tượng một hình ảnh menu được lưu trữ trên máy chủ ở Virginia. Mỗi khi ai đó ở Tokyo muốn xem nó, yêu cầu phải đi qua Thái Bình Dương và trở lại. Với Edge Location, AWS có thể lưu trữ một bản sao của tệp đó ở Tokyo và phục vụ nó cục bộ — mili giây thay vì hàng trăm mili giây.

Đây là xương sống của CloudFront, mạng phân phối nội dung của AWS. Chúng ta sẽ tìm hiểu CloudFront trong Chương 13.

**Chọn Region: Danh Sách Kiểm Tra Của Kỹ Sư Cấp Cao**

Khi Nimbus mở rộng phục vụ người dùng ở Mexico và Colombia (điều này xảy ra trong Chương 12), quyết định Region không phải là tùy tiện. Đây là cách suy nghĩ:

**1. Người dùng của bạn ở đâu?**

Bắt đầu từ đây. Chọn Region gần nhất với đa số người dùng của bạn. Độ trễ là tác động trực tiếp và đo lường được nhất của việc chọn Region.

**2. Có yêu cầu tuân thủ không?**

Các công việc trong lĩnh vực chăm sóc sức khỏe, tài chính và chính phủ thường có quy tắc nghiêm ngặt về lưu trú dữ liệu. Biết môi trường quy định của bạn trước khi chọn.

**3. Bạn cần những dịch vụ nào?**

Không phải mọi AWS service đều có sẵn ở mọi Region. Các service mới ra mắt ở `us-east-1` đầu tiên. Nếu bạn cần một service cụ thể, hãy xác minh Region mục tiêu của bạn hỗ trợ nó.

**4. Giá cả là bao nhiêu?**

Region có giá khác nhau. `us-east-1` (Northern Virginia) có xu hướng rẻ nhất do quy mô và tuổi tác của nó. Nam Mỹ đắt hơn một chút. Kiểm tra trang giá AWS trước khi hoàn tất.

**5. Bạn có cần Multi-Region không?**

Đối với hầu hết các ứng dụng, nhiều AZ trong một Region là đủ khả năng phục hồi. Đối với các ứng dụng quan trọng mà ngay cả một sự cố khu vực cũng không thể chấp nhận được, bạn thiết kế cho Multi-Region — nhưng đó là một cam kết kiến trúc đáng kể. Đừng làm điều đó một cách suy đoán.

**Hạn Chế Mà Không Ai Nói Đến**

Region mạnh mẽ, nhưng chúng tạo ra một sự căng thẳng quan trọng.

Chạy trong nhiều Region thực sự khó.

Sao chép dữ liệu giữa các Region có độ trễ. Giữ hai Region đồng bộ — để một giao dịch trong Region A hiển thị ngay lập tức trong Region B — là một trong những vấn đề khó nhất trong các hệ thống phân tán. AWS cung cấp các công cụ cho điều đó, nhưng nó tốn tiền và thêm độ phức tạp vận hành.

Hầu hết các ứng dụng nên bắt đầu với một Region, nhiều AZ, và mở rộng sang Multi-Region chỉ khi có yêu cầu rõ ràng: các quy định bắt buộc, SLA hợp đồng yêu cầu thời gian ngừng hoạt động khu vực gần như bằng không, hoặc cơ sở người dùng thực sự phân tán trên các lục địa.

Kiến trúc Multi-Region sớm quá là một trong những sai lầm phổ biến và tốn kém nhất mà các kỹ sư cấp thấp mắc phải khi họ bắt đầu cảm thấy tự tin.

Tom gật đầu. "Vậy chúng ta không làm Multi-Region chỉ vì chúng ta có thể."

"Không cho đến khi chúng ta cần," Maya nói. "Và chúng ta sẽ biết khi nào chúng ta cần."

"Làm sao chúng ta biết?" Leo hỏi.

"Khi tài liệu đánh giá kiến trúc của bạn có yêu cầu nói 'phải tồn tại được sau khi một Region bị tắt'," Priya nói. "Cho đến lúc đó: Multi-AZ."

## Điểm Mạnh Và Hạn Chế

**Sử dụng thiết kế Multi-Region và Multi-AZ khi**: ứng dụng của bạn có người dùng ở nhiều địa lý và độ trễ quan trọng; SLA của bạn yêu cầu tính khả dụng 99.99% hoặc cao hơn; yêu cầu quy định bắt buộc dữ liệu phải lưu trú ở các region cụ thể; bạn cần phục hồi thảm họa với RTO dưới một giờ.

**Sự đánh đổi là thật**: Sao chép dữ liệu giữa các region thêm chi phí — truyền dữ liệu xuyên region là một trong những mục ít được đánh giá nhất trong hóa đơn AWS. Nó cũng thêm độ phức tạp vận hành.

## Tóm Tắt

- AWS tổ chức cơ sở hạ tầng toàn cầu thành **Regions**, **Availability Zones** và **Edge Locations**.
- Một **Region** là cụm trung tâm dữ liệu địa lý. Mỗi Region bị cô lập — dữ liệu ở lại trong Region trừ khi bạn chuyển nó một cách rõ ràng.
- **Availability Zones** là các trung tâm dữ liệu vật lý riêng biệt trong một Region, được kết nối bởi mạng có độ trễ thấp.
- **Edge Locations** lưu trữ nội dung gần người dùng trên toàn thế giới. Chúng cung cấp năng lượng cho CloudFront.
- Chọn Region dựa trên vị trí người dùng, yêu cầu tuân thủ, tính khả dụng của service và giá cả — theo thứ tự đó.
- Multi-AZ là cơ sở khả năng phục hồi tiêu chuẩn. Multi-Region dành cho các công việc quan trọng với các yêu cầu cụ thể, được ghi lại — không phải điểm khởi đầu mặc định.

## Mẹo Thi

*SAA-C03 Domain 1 — Task 1.1 / Domain 2 — Task 2.2*

- **Region bị cô lập theo mặc định.** Dữ liệu không sao chép giữa các Region trừ khi bạn cấu hình nó.
- **AZ là đơn vị khả năng phục hồi cho hầu hết các câu hỏi.** Khi kỳ thi hỏi cách tồn tại sau khi trung tâm dữ liệu bị lỗi, câu trả lời liên quan đến nhiều AZ trong một Region.
- **Multi-Region dành cho khả năng phục hồi sự cố khu vực.** Nếu tình huống nói "phải vẫn hoạt động ngay cả khi một AWS Region hoàn chỉnh bị lỗi," câu trả lời liên quan đến kiến trúc Multi-Region.
- **Edge Location ≠ AZ.** Edge Location lưu trữ nội dung — chúng không thể chạy máy chủ ứng dụng của bạn.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của bạn: sự khác biệt giữa Region và Availability Zone là gì? Tại sao sự phân biệt đó quan trọng khi thiết kế ứng dụng web có khả năng phục hồi?

**Bài tập 2 — Thực hành thi**

*Tình huống*: Một công ty chăm sóc sức khỏe Hoa Kỳ phải lưu trữ tất cả dữ liệu bệnh nhân trong một AWS Region để tuân thủ chính sách lưu trú dữ liệu nội bộ. Họ đang thiết kế ứng dụng đám mây mới ở Bờ Tây và muốn tối đa hóa khả năng phục hồi mà không di chuyển dữ liệu sang Region khác.

Cấu hình nào BEST đáp ứng yêu cầu của họ?

A) Triển khai trong `us-east-1` và sử dụng CloudFront Edge Locations ở Oregon để phục vụ nội dung nhanh hơn  
B) Triển khai trong `us-west-2` (Oregon) trên nhiều Availability Zone  
C) Triển khai trong nhiều Region bao gồm `us-west-2` và `us-east-1` với sao chép dữ liệu xuyên Region  
D) Triển khai trong `us-west-2` trong một Availability Zone duy nhất để giảm thiểu chi phí

**Đáp án**: B

**Giải thích**: `us-west-2` giữ tất cả dữ liệu trong một Region duy nhất, thỏa mãn yêu cầu chính sách. Triển khai trên nhiều AZ trong Region đó bảo vệ chống lại các lỗi trung tâm dữ liệu mà không di chuyển dữ liệu sang Region khác.

*SAA-C03 Domain 1 — Task 1.1*

## Cảnh Sau Tín Dụng

Leo đã sửa vấn đề Singapore. Nimbus đã chuyển sang `us-west-2`. Độ trễ giảm xuống. Câu hỏi tiếp theo của Tom — "điều đó có thay đổi hóa đơn của chúng ta không?" — được trả lời bằng một con số cao hơn một chút, mà anh chấp nhận với vẻ miễn cưỡng rõ ràng.

Điều đó kéo dài hai ngày trước khi vấn đề tiếp theo xảy ra.

Leo đến cuộc họp đứng với biểu hiện Maya đã học cách nhận ra: vẻ mặt của ai đó đã làm điều gì đó không thể hoàn tác.

"Vậy là," anh nói cẩn thận. "Tôi đã cài đặt máy chủ. Và tôi cần một cách để đăng nhập. Nên tôi đã tạo tên người dùng."

"Và?" Priya hỏi.

"'Admin'."

Im lặng.

"Và mật khẩu?"

Im lặng dài hơn.

"'Admin123'."

Priya đứng dậy.

Chương tiếp theo: cách Nimbus kiểm soát ai có thể chạm vào gì — và điều gì xảy ra khi họ làm sai.
