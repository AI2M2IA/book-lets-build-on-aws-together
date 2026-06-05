# Chương 32: Bảo Vệ Kế Hoạch

Câu hỏi của Maya ở cuối Chương 31: "Sự khác biệt giữa việc đưa ra quyết định kiến trúc và suy nghĩ như kiến trúc sư là gì?"

Cô đã mời một khách đến để giúp trả lời nó.

Tên anh ta là Carlos. Anh đã làm kỹ sư 20 năm, quản lý kỹ thuật trong bảy năm, và cố vấn khởi nghiệp trong ba năm. Anh là loại người đã chứng kiến đủ hệ thống thành công và thất bại để có trực giác được hiệu chỉnh về cả hai.

Anh đến với không có gì: không có slide, không có chương trình. Chỉ một cây bút bảng trắng và một câu hỏi.

"Hãy kể cho tôi nghe về Nimbus," anh nói.

Một cuộc review kiến trúc tốt giống như danh sách kiểm tra trước chuyến bay của phi công. Máy bay có thể trông hoàn toàn sẵn sàng để bay — động cơ đang chạy, nhiên liệu đầy, hành khách đã lên tàu. Nhưng danh sách kiểm tra tồn tại vì các phi công có kinh nghiệm biết rằng những thứ có nhiều khả năng gây ra vấn đề nhất chính là những thứ cảm thấy ổn cho đến tận khi chúng không còn ổn nữa. Danh sách kiểm tra không có nghĩa là phi công không biết mình đang làm gì. Nó có nghĩa là họ đã tiếp thu việc ngay cả các chuyên gia cũng bỏ lỡ những điều khi họ bỏ qua quy trình có cấu trúc.

**Bước Đầu Tiên Của Kiến Trúc Sư**

Điều xảy ra tiếp theo đã làm nhóm bất ngờ.

Maya bắt đầu mô tả hệ thống — các instance EC2, Aurora, CloudFront, ElastiCache, DynamoDB cho menu, VPC với private subnets...

Carlos dừng cô nhẹ nhàng.

"Bắt đầu với hoạt động kinh doanh," anh nói. "Không phải công nghệ."

Cô dừng lại. Sau đó: "Nimbus là nền tảng đặt hàng nhà hàng. Chúng ta có 287 đối tác nhà hàng. Chúng ta xử lý khoảng 4,200 đơn hàng mỗi ngày. Giá trị đơn hàng trung bình là $34. Chúng ta đang tăng trưởng 18% mỗi quý."

"Tốt. Điều quan trọng nhất Nimbus phải làm là gì?"

"Xử lý đơn hàng," Leo nói.

"Cụ thể hơn," Carlos thúc.

"Một đơn hàng phải đến nhà hàng trong vòng năm giây sau khi đặt hàng," Priya nói, "hoặc nhà bếp bỏ lỡ cửa sổ thời gian."

"Điều gì xảy ra nếu không xảy ra?"

"Nhà hàng mắc lỗi. Khách hàng nhận được thức ăn sai, hoặc chờ đợi quá lâu. Họ phàn nàn. Chúng ta mất một đối tác nhà hàng."

"Vậy SLA năm giây," Carlos nói, "không phải là mục tiêu kỹ thuật. Đó là yêu cầu sống còn của doanh nghiệp."

Im lặng.

"Đó," anh nói, "là lý do tại sao các cuộc trò chuyện kiến trúc phải bắt đầu với yêu cầu kinh doanh. Công nghệ là downstream của ràng buộc."

**Cấu Trúc Architecture Review**

Một architecture review thực sự — loại xảy ra trước khi bạn xây dựng điều gì đó quan trọng, hoặc khi bạn đang đánh giá việc có nên mở rộng không — có một cấu trúc.

Carlos viết lên bảng trắng:

**1. Hiểu các ràng buộc**

Điều gì phải đúng? Điều gì không thể xảy ra? (Không phải "chúng ta muốn gì." Điều gì là không thương lượng?)

**2. Hiểu các điều không biết**

Chúng ta không biết gì? Chúng ta đang đưa ra giả định ở đâu? Điều gì xảy ra nếu những giả định đó sai?

**3. Đánh giá các lựa chọn**

Các lựa chọn thay thế thực tế là gì? Đánh đổi của mỗi cái là gì?

**4. Xác định các failure mode**

Điều này hỏng như thế nào? Chuỗi sự kiện là gì khi mỗi failure mode kích hoạt?

**5. Xác thực monitoring**

Bạn sẽ biết khi nào có vấn đề như thế nào? Trước khi người dùng cho bạn biết?

**6. Định nghĩa runbook**

Ai đó làm gì lúc 3 giờ sáng khi điều này bị hỏng?

Đây không phải là danh sách kiểm tra để tuân theo một cách máy móc. Đó là khung suy nghĩ. Mục tiêu là đảm bảo các câu hỏi quan trọng được hỏi *trước* khi bạn đưa vào production.

**Thực Hiện Review: Tính Năng Mới Của Nimbus**

Carlos được mời cụ thể vì Nimbus sắp xây dựng điều gì đó mới.

**Tính năng**: "Nimbus Instant" — đảm bảo giao hàng trong 15 phút. Nếu nhà hàng đối tác không đáp ứng cửa sổ 15 phút hơn một lần mỗi tuần, Nimbus sẽ tự động hoàn tiền cho khách hàng.

"Hãy hướng dẫn tôi qua các yêu cầu kỹ thuật," Carlos nói.

Priya bắt đầu. "Chúng ta cần theo dõi thời gian thực từ khi đặt hàng đến giao hàng. Chúng ta cần so sánh thời gian giao hàng thực tế với SLA 15 phút. Chúng ta cần kích hoạt hoàn tiền tự động."

"Yêu cầu độ trễ cho dữ liệu theo dõi là gì?"

"Gần thời gian thực. Khách hàng thấy cập nhật trạng thái trên điện thoại của họ."

"Trong bao lâu?"

"Năm giây có lẽ."

"Có lẽ?"

"Trong vòng năm giây. Đó là yêu cầu sản phẩm."

"Tốt. Kinesis cho event stream, thì đó. Failure mode là gì nếu Kinesis bị trễ?"

"Cập nhật trạng thái đến muộn cho khách hàng."

"Điều đó có chấp nhận được không?"

"Trong 10 giây? Có lẽ. Trong 60 giây? Không."

"Vậy SLA cho hệ thống theo dõi là gì?"

Priya nhìn Leo. "Chúng ta chưa có cái đó."

Carlos viết lên bảng: *Không biết: SLA theo dõi.*

"Điều này quan trọng," anh nói. "Vì SLA xác định thiết kế cơ sở hạ tầng. Nếu SLA của bạn là 5 giây, bạn cần một giải pháp khác so với nếu nó là 60 giây."

**Các Câu Hỏi Kiến Trúc Sư Đặt Ra**

Trong hai giờ tiếp theo, Carlos hướng dẫn nhóm qua review. Một số câu hỏi của anh:

**Về lưu trữ dữ liệu**:

"Trạng thái đơn hàng được lưu trữ ở đâu trong khi thực hiện? Nếu ứng dụng bị crash giữa chừng giao hàng, quy trình phục hồi là gì? Bạn có thể tái tạo trạng thái từ các sự kiện không?"

**Về cơ chế hoàn tiền**:

"Hoàn tiền được kích hoạt tự động. Điều gì ngăn hoàn tiền được phát hành hai lần? Điều gì xảy ra nếu bộ xử lý thanh toán hết thời gian chờ và bạn không chắc chắn liệu hoàn tiền có được chấp nhận không?"

**Về theo dõi giao hàng**:

"Bạn đang dựa vào dữ liệu GPS của courier. Điều gì xảy ra nếu tín hiệu GPS bị mất trong 90 giây? Làm thế nào bạn phân biệt 'GPS mất' với 'giao hàng đang tiến hành' với 'vấn đề giao hàng'?"

**Về xử lý thất bại**:

"Nếu dịch vụ hoàn tiền bị down, đơn hàng có vẫn được xử lý không? Khách hàng có vẫn nhận được thức ăn của họ không? Trải nghiệm người dùng là gì trong thất bại hệ thống một phần?"

**Về khả năng quan sát**:

"Làm thế nào bạn biết ngay bây giờ có bao nhiêu đơn hàng hiện đang trong vòng 5 phút so với SLA 15 phút? Nếu con số đó tăng vọt, ai được thông báo?"

Mỗi câu hỏi tiết lộ một giả định mà nhóm đã mắc mà không nhận ra.

"Chúng ta không nghĩ đến vấn đề hoàn tiền đôi," Leo nói sau đó. "Chúng ta chỉ định gọi API thanh toán."

"Điều đó không sai," Priya nói. "Nhưng bạn cần idempotency. Thao tác hoàn tiền cần an toàn khi gọi hai lần."

"Một idempotency key — một ID duy nhất cho mỗi lần thử hoàn tiền, được lưu trong cơ sở dữ liệu trước khi gọi API thanh toán. Nếu chúng ta gọi hai lần với cùng key, API thanh toán bỏ qua lần gọi thứ hai."

"Điều đó có nghĩa là," Carlos thêm vào, "bạn cần một kho trạng thái bền vững cho các thao tác hoàn tiền, không chỉ là một sự kiện trong hàng đợi."

Đây là loại chi tiết kiến trúc xuất hiện trong một review có cấu trúc — và thường không xuất hiện khi bạn chỉ đang xây dựng.

**Architecture Decision Record**

Sau review, Carlos đề xuất nhóm ghi lại các quyết định của họ trong **Architecture Decision Records (ADRs)** — các tài liệu ngắn nắm bắt:

- **Quyết định gì đã được đưa ra**
- **Các lựa chọn thay thế nào đã được xem xét**
- **Tại sao quyết định này được đưa ra (bối cảnh và ràng buộc tại thời điểm đó)**
- **Đánh đổi là gì**
- **Điều gì sẽ khiến chúng ta xem xét lại quyết định này**

"ADRs dành cho bản thân tương lai của bạn," Carlos nói. "Sau 18 tháng, bạn sẽ nhìn vào một đoạn kiến trúc và tự hỏi tại sao nó được làm theo cách đó. Nếu bạn có ADR, bạn sẽ hiểu bối cảnh. Nếu không, bạn sẽ để nguyên nó (vì bạn sợ chạm vào nó) hoặc thay đổi nó (vì bạn không hiểu tại sao nó được làm theo cách đó)."

Leo viết ADR đầu tiên buổi chiều hôm đó: quyết định sử dụng Kinesis cho các sự kiện theo dõi giao hàng, với bối cảnh, các lựa chọn thay thế được xem xét (SQS, EventBridge, polling), và các đánh đổi.

**Điều Tạo Nên Kiến Trúc Sư**

Cuối buổi, Maya hỏi Carlos câu hỏi ban đầu: "Sự khác biệt giữa việc đưa ra quyết định kiến trúc và suy nghĩ như kiến trúc sư là gì?"

Anh suy nghĩ về nó.

"Kiến trúc sư không biết nhiều công nghệ hơn kỹ sư cấp cao," anh nói. "Một kiến trúc sư giỏi có thể biết ít hơn một chút về các framework mới nhất. Nhưng kiến trúc sư có một bộ câu hỏi mặc định khác."

"Ý anh là gì?"

"Khi bạn là kỹ sư cấp cao nhìn vào một tính năng mới, câu hỏi đầu tiên của bạn thường là: 'Chúng ta xây dựng gì? Nó hoạt động như thế nào? Thư viện tốt nhất cho điều này là gì?' Khi kiến trúc sư nhìn vào cùng một tính năng, câu hỏi đầu tiên là: 'Vấn đề này giải quyết điều gì? Điều gì hỏng đầu tiên khi lưu lượng tăng gấp đôi? Làm thế nào chúng ta biết khi nó bị xuống cấp? Trải nghiệm người dùng là gì khi bộ xử lý thanh toán chậm?'"

"Kiến trúc sư hỏi về hệ thống dưới áp lực," Leo nói.

"Và về hậu quả kinh doanh của mỗi thất bại," Priya thêm vào.

"Và," Tom nói, "về những gì xảy ra với hóa đơn khi điều này mở rộng."

Carlos gật đầu. "Tất cả các bạn đã làm điều này rồi. Bạn đã làm nó từ Chương 1. Sự khác biệt giữa kỹ sư cấp cao và kiến trúc sư không phải là chứng nhận hay chức danh. Đó là thói quen hỏi câu hỏi tiếp theo — câu tiết lộ điều bạn chưa nghĩ đến."

## Điểm Mạnh và Hạn Chế

**Architecture reviews**:

- Phát hiện các failure mode trước khi chúng đưa vào production
- Tạo ra hiểu biết chung giữa các thành viên nhóm thường có kiến thức bị cô lập
- Tạo ra tài liệu (ADRs) mang lại lợi nhuận trong nhiều năm
- Làm chậm quá trình ra quyết định theo cách có lợi — "di chuyển nhanh" mà không có review là "di chuyển nhanh và đụng vào bức tường bạn không thấy"

**Nơi chúng trở nên phức tạp**:

- Yêu cầu ai đó đủ kỹ năng để hỏi đúng câu hỏi — review chỉ tốt bằng người review
- Có thể trở nên quan liêu nếu được coi là hộp kiểm thay vì cuộc trò chuyện
- Một số quyết định kiến trúc thực sự không cần review đầy đủ — biết cái nào thực sự là kỹ năng kiến trúc
- Đầu ra (ADRs, sơ đồ, nhật ký quyết định) phải được duy trì khi hệ thống phát triển

Trong chương tiếp theo: câu trả lời hữu ích nhất, khó chịu nhất và trung thực nhất trong tất cả kỹ thuật phần mềm.

## Tóm Tắt

- Architecture reviews bắt đầu với **yêu cầu kinh doanh, không phải công nghệ**.
- Cấu trúc review: ràng buộc → điều không biết → lựa chọn → failure mode → monitoring → runbook.
- Kiến trúc sư hỏi: Điều gì hỏng đầu tiên? Làm thế nào chúng ta biết nó xuống cấp? Trải nghiệm người dùng là gì khi có thất bại? Chi phí là bao nhiêu ở quy mô?
- **Architecture Decision Records (ADRs)** nắm bắt điều gì đã được quyết định, tại sao, và điều gì sẽ gây ra xem xét lại.
- Suy nghĩ như kiến trúc sư là một thói quen: hỏi câu hỏi tiếp theo, đặc biệt về failure mode, hậu quả kinh doanh và kinh tế quy mô.
- Sự khác biệt giữa đưa ra quyết định và là kiến trúc sư là bộ câu hỏi mặc định: kiến trúc sư mặc định là câu hỏi cấp hệ thống và thất bại, không chỉ câu hỏi triển khai.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Xuyên domain — lý luận kiến trúc*

Chương này ít về các chủ đề kỳ thi cụ thể và nhiều hơn về tư duy kỳ thi kiểm tra.

- **Kịch bản SAA-C03** hầu như luôn mô tả một ràng buộc kinh doanh trước ("công ty không thể chịu đựng hơn 1 giờ ngừng hoạt động") và yêu cầu bạn chọn kiến trúc đáp ứng nó. Thực hành chuyển đổi ràng buộc kinh doanh thành yêu cầu kỹ thuật.
- **Tư duy failure mode**: Nhiều câu hỏi kỳ thi mô tả một hệ thống và hỏi điều gì xảy ra khi một thành phần bị lỗi. Thực hành hỏi "điều gì hỏng đầu tiên?" cho các kiến trúc bạn gặp.
- **Tư duy đánh đổi**: Kỳ thi hiếm khi có câu trả lời "hoàn hảo." Nó hỏi câu trả lời *tốt nhất* cho một tập ràng buộc. Hãy thoải mái với "lựa chọn này đúng cho các yêu cầu cụ thể này, ngay cả khi lựa chọn khác sẽ tốt hơn trong các yêu cầu khác."
- **Idempotency**: Vấn đề hoàn tiền đôi là thách thức hệ thống phân tán thực sự. Idempotency keys (duy nhất cho mỗi thao tác, được kiểm tra trước khi thực thi) là giải pháp tiêu chuẩn. Biết mẫu này.
- **Architecture Decision Records**: Không phải dịch vụ AWS, nhưng là thực hành tốt nhất phản ánh trụ cột Xuất Sắc Vận Hành của Well-Architected Framework.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Carlos đặt sáu loại câu hỏi trong quá trình architecture review. Bạn có thể tái tạo sáu lĩnh vực mà không nhìn vào chương không?

*(Gợi ý: Chúng được liệt kê trong phần "Cấu Trúc Architecture Review." Cố gắng nhớ lại chúng từ trí nhớ — hành động cố gắng nhớ lại (ngay cả khi bạn thất bại) tăng cường khả năng lưu giữ lâu dài.)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Một công ty đang xây dựng hệ thống quản lý đấu thầu thời gian thực cho quảng cáo trực tuyến. Các đấu thầu phải được đánh giá và trả lời trong vòng 100 mili giây. Hệ thống xử lý 1 triệu đấu thầu mỗi giây vào lúc cao điểm. Nếu hệ thống đấu thầu bị down, công ty mất doanh thu quảng cáo. Nhóm cơ sở dữ liệu của công ty đề xuất sử dụng RDS Aurora với 10 read replica. Kiến trúc sư giải pháp phải đánh giá đề xuất này.

Kiến trúc sư nên nêu mối lo ngại nào TRƯỚC TIÊN?

A) Chi phí 10 Aurora read replica quá cao cho ngân sách  
B) Aurora read replica có độ trễ sao chép có thể gây ra vấn đề nhất quán  
C) Độ trễ truy vấn Aurora điển hình là 1-5ms có thể không đáp ứng SLA phản hồi 100ms  
D) RDS Aurora không hỗ trợ khối lượng giao dịch 1 triệu yêu cầu mỗi giây ở yêu cầu độ trễ này

**Gợi ý 1**: Ràng buộc chính là thời gian phản hồi tổng cộng 100ms ở 1 triệu yêu cầu/giây. Mối lo ngại nào trong số này trực tiếp đe dọa đáp ứng ràng buộc này?

**Gợi ý 2**: Độ trễ truy vấn Aurora thường là 1-5ms. 1-5ms cho truy vấn cơ sở dữ liệu để lại 95-99ms cho mạng, logic ứng dụng và tuần tự hóa. Ràng buộc 100ms có bị rủi ro không?

**Gợi ý 3**: Aurora có thể xử lý IOPS cao, nhưng 1 triệu yêu cầu mỗi giây là mức cực đoan. Điều gì xảy ra với kiến trúc ở quy mô đó?

**Đáp án**: D

**Giải thích**: Mặc dù Aurora hiệu suất cao, 1 triệu yêu cầu mỗi giây ở thời gian phản hồi tổng cộng 100ms là yêu cầu cực đoan. Kiến trúc sư trước tiên nên đặt câu hỏi liệu Aurora (hoặc bất kỳ cơ sở dữ liệu quan hệ nào) có thể phục vụ như hệ thống tra cứu chính ở quy mô và độ trễ này không. Các hệ thống như thế này thường sử dụng kho dữ liệu trong bộ nhớ (Redis) hoặc cơ sở dữ liệu độ trễ thấp chuyên dụng, không phải cơ sở dữ liệu quan hệ với ngữ nghĩa SQL đầy đủ. SLA 100ms có thể đạt được cho các truy vấn Aurora một mình, nhưng sự kết hợp của 1M RPS và SLA tổng cộng 100ms vượt quá đặc điểm thông lượng Aurora điển hình.

**Tại sao không phải A?** Chi phí là mối lo ngại hợp lệ, nhưng mối lo ngại đầu tiên nên là liệu kiến trúc có khả thi về mặt kỹ thuật ở các yêu cầu đã nêu không.

**Tại sao không phải B?** Độ trễ sao chép trong Aurora read replica thường <100ms — chấp nhận được cho hầu hết các trường hợp sử dụng. Vấn đề nhất quán là thực nhưng thứ yếu so với câu hỏi khả thi.

**Tại sao không phải C?** Độ trễ Aurora 1-5ms nằm trong SLA 100ms cho phần truy vấn cơ sở dữ liệu. Đây không phải là mối lo ngại chính.

*SAA-C03 Domain: Xuyên domain — thiết kế hệ thống*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Áp dụng cấu trúc architecture review cho một hệ thống thực hoặc giả thuyết:

Một startup muốn xây dựng trò chơi đố vui đa người chơi thời gian thực. Người chơi tham gia các phòng (tối đa 10 người mỗi phòng). Mỗi vòng hiển thị một câu hỏi trong 15 giây; tất cả người chơi trả lời đồng thời. Điểm được tính tức thời sau mỗi câu hỏi. Trò chơi kéo dài 10 vòng. Sử dụng cao điểm: 50,000 trò chơi đồng thời.

Thực hiện qua sáu bước review:

1. Các ràng buộc không thương lượng là gì?
2. Các điều không biết và giả định là gì?
3. Các lựa chọn công nghệ thực tế là gì?
4. Các failure mode là gì?
5. Bạn sẽ biết khi nó xuống cấp như thế nào?
6. Runbook lúc 3 giờ sáng trông như thế nào?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành cấu trúc review như một công cụ suy nghĩ.)*

## Cảnh Sau Tín Dụng

Carlos rời văn phòng lúc 6 giờ tối.

Nhóm ngồi một lúc sau đó, không làm gì cụ thể.

"Tôi cảm thấy như tôi học được nhiều hơn trong hai giờ đó so với bất kỳ chương dịch vụ AWS riêng lẻ nào," Leo nói.

"Vì những chương đó là về công cụ," Maya nói. "Đây là về phán đoán."

"Phán đoán có thể dạy được không?" anh hỏi.

"Có," Priya nói. "Nhưng không phải qua đọc sách. Qua thực hành. Qua đưa ra quyết định, xem điều gì bị hỏng, suy nghĩ về lý do tại sao."

"Qua kinh nghiệm," Tom nói.

"Qua kinh nghiệm có cấu trúc," Priya sửa lại. "Kinh nghiệm không có suy nghĩ không xây dựng phán đoán. Bạn phải hỏi các câu hỏi sau."

Maya nhìn vào bảng trắng. Các ghi chú review vẫn ở đó — ràng buộc, điều không biết, failure mode, câu hỏi monitoring. Nó lấp đầy hai bảng trắng.

"Điều này nên đưa vào ADR," cô nói.

Leo đã gõ phím.

Trong chương cuối cùng: điều duy nhất mà không công cụ hay khung nào có thể cho bạn — và tại sao "tùy thuộc" là câu trả lời trung thực và mạnh mẽ nhất trong kiến trúc phần mềm.
