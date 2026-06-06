# Chương 32: Bảo Vệ Kế Hoạch

Carlos đã quay lại, vài tuần sau buổi Well-Architected. Lần này chiếc laptop vẫn nằm trong túi của anh; thay vào đó anh cầm lấy một cây bút bảng trắng, chào từng người trong phòng, tìm một chỗ gần bảng, và mở nắp bút.

"Hãy kể cho tôi nghe về Nimbus," anh nói. Như thể anh chưa từng nghe đến nó.

**Tóm Lược: Từ Review Đến Đối Mặt**

Buổi Well-Architected review ở Chương 31 đã làm lộ ra ba phát hiện rủi ro cao và nhận thức ngày càng lớn của Maya rằng có một khoảng cách giữa những quyết định mà nhóm đã đưa ra và những quyết định mà họ *đã suy nghĩ thấu đáo*. Khung framework đã cho họ một bộ từ vựng để gọi tên khoảng cách đó. Điều mà nó không thể cho họ là phương pháp thực hành để khép lại khoảng cách ấy theo thời gian thực — trước khi một tính năng được phát hành, chứ không phải sau đó. Đó là lý do Carlos có mặt ở đây. Maya đã mời anh một cách cụ thể vì Nimbus sắp xây dựng một thứ gì đó quan trọng, và cô muốn có một thử thách có cấu trúc trước khi dòng code production đầu tiên được viết ra.

Một cuộc architecture review tốt giống như danh sách kiểm tra trước chuyến bay của phi công. Máy bay có thể trông hoàn toàn sẵn sàng để bay — động cơ đang chạy, nhiên liệu đầy, hành khách đã lên tàu. Nhưng danh sách kiểm tra tồn tại vì các phi công có kinh nghiệm biết rằng những thứ có nhiều khả năng gây ra vấn đề nhất chính là những thứ cảm thấy ổn cho đến tận khi chúng không còn ổn nữa. Danh sách kiểm tra không có nghĩa là phi công không biết mình đang làm gì. Nó có nghĩa là họ đã thấm nhuần việc ngay cả các chuyên gia cũng bỏ lỡ những điều khi họ bỏ qua quy trình có cấu trúc.

**Bước Đầu Tiên Của Kiến Trúc Sư**

Điều xảy ra tiếp theo đã làm nhóm bất ngờ.

Maya bắt đầu mô tả hệ thống — các instance EC2, Aurora, CloudFront, ElastiCache, DynamoDB cho menu, VPC với private subnets...

Carlos dừng cô lại nhẹ nhàng.

"Bắt đầu với hoạt động kinh doanh," anh nói. "Không phải công nghệ."

Cô dừng lại. Sau đó: "Nimbus là nền tảng đặt hàng nhà hàng. Chúng ta có 287 đối tác nhà hàng. Chúng ta xử lý khoảng 4,200 đơn hàng mỗi ngày. Giá trị đơn hàng trung bình là $34. Chúng ta đang tăng trưởng 18% mỗi quý."

"Tốt. Điều quan trọng nhất mà Nimbus phải làm là gì?"

"Xử lý đơn hàng," Leo nói.

"Cụ thể hơn," Carlos thúc.

"Một đơn hàng phải đến nhà hàng trong vòng năm giây sau khi đặt hàng," Priya nói, "nếu không nhà bếp sẽ bỏ lỡ cửa sổ thời gian."

"Điều gì xảy ra nếu không đến kịp?"

"Nhà hàng mắc lỗi. Khách hàng nhận được món sai, hoặc chờ đợi quá lâu. Họ phàn nàn. Chúng ta mất một đối tác nhà hàng."

"Vậy SLA năm giây," Carlos nói, "không phải là một mục tiêu kỹ thuật. Đó là một yêu cầu sống còn của doanh nghiệp."

Im lặng.

"Đó," anh nói, "là lý do tại sao các cuộc trò chuyện về kiến trúc phải bắt đầu với yêu cầu kinh doanh. Công nghệ nằm ở phía hạ nguồn của ràng buộc."

**Cấu Trúc Của Architecture Review**

Một architecture review thực sự — loại diễn ra trước khi bạn xây dựng điều gì đó quan trọng, hoặc khi bạn đang đánh giá việc có nên mở rộng quy mô hay không — có một cấu trúc.

Carlos viết nó lên bảng trắng:

**1. Hiểu các ràng buộc**

Điều gì phải đúng? Điều gì không thể xảy ra? (Không phải "chúng ta muốn gì." Điều gì là không thể thương lượng?)

**2. Hiểu các điều chưa biết**

Chúng ta không biết những gì? Chúng ta đang đưa ra giả định ở đâu? Điều gì xảy ra nếu những giả định đó sai?

**3. Đánh giá các lựa chọn**

Các lựa chọn thay thế thực tế là gì? Đánh đổi của mỗi cái là gì?

**4. Xác định các failure mode**

Điều này hỏng như thế nào? Chuỗi sự kiện là gì khi mỗi failure mode được kích hoạt?

**5. Xác thực monitoring**

Bạn sẽ biết khi nào có vấn đề bằng cách nào? Trước khi người dùng nói cho bạn biết?

**6. Định nghĩa runbook**

Ai đó sẽ làm gì lúc 3 giờ sáng khi điều này bị hỏng?

Đây không phải là một danh sách kiểm tra để tuân theo một cách máy móc. Đó là một khung tư duy. Mục tiêu là đảm bảo rằng các câu hỏi quan trọng được đặt ra *trước* khi bạn ở trong production.

**Thực Hiện Review: Tính Năng Mới Của Nimbus**

Carlos đã được mời một cách cụ thể vì Nimbus sắp xây dựng điều gì đó mới.

**Tính năng**: "Nimbus Instant" — đảm bảo giao hàng trong 15 phút. Nếu một nhà hàng đối tác không đáp ứng cửa sổ 15 phút hơn một lần mỗi tuần, Nimbus sẽ tự động hoàn tiền cho khách hàng.

"Hãy dẫn tôi qua các yêu cầu kỹ thuật," Carlos nói.

Priya bắt đầu. "Chúng ta cần theo dõi thời gian thực từ khi đặt hàng đến khi giao hàng. Chúng ta cần so sánh thời gian giao hàng thực tế với SLA 15 phút. Chúng ta cần kích hoạt hoàn tiền một cách tự động."

"Yêu cầu về độ trễ cho dữ liệu theo dõi là gì?"

"Gần thời gian thực. Khách hàng thấy cập nhật trạng thái trên điện thoại của họ."

"Trong vòng bao lâu?"

"Có lẽ năm giây."

"Có lẽ?"

"Trong vòng năm giây. Đó là yêu cầu sản phẩm."

"Tốt. Vậy thì dùng Kinesis cho event stream. Failure mode là gì nếu Kinesis bị trễ?"

"Cập nhật trạng thái đến muộn cho khách hàng."

"Điều đó có chấp nhận được không?"

"Trong 10 giây? Có lẽ. Trong 60 giây? Không."

"Vậy SLA cho hệ thống theo dõi là gì?"

Priya nhìn Leo. "Chúng ta chưa có cái đó."

Carlos viết lên bảng: *Chưa biết: SLA theo dõi.*

"Điều này quan trọng," anh nói. "Vì SLA xác định thiết kế cơ sở hạ tầng. Nếu SLA của bạn là 5 giây, bạn cần một giải pháp khác so với nếu nó là 60 giây."

"Khoan đã — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Tại sao không chỉ dùng một cơ chế polling mà app kiểm tra mỗi vài giây thay vì một push thời gian thực?"

"Độ trễ và chi phí," Carlos nói. "Một cách tiếp cận polling ở quy mô lớn — chẳng hạn 10,000 đơn hàng đang hoạt động, mỗi app polling mỗi 5 giây — là 2,000 request mỗi giây, tức 120,000 request mỗi phút. Một mô hình push thông qua Kinesis chỉ gửi cập nhật khi trạng thái thay đổi. Ít request hơn, độ trễ thấp hơn, và cam kết SLA dễ kiểm toán hơn từ một event log. Polling hoạt động tốt ở quy mô nhỏ. Ở quy mô mà Nimbus đang hướng tới, push là nền tảng đúng đắn."

Leo đã im lặng trong suốt phần giải thích của Carlos. Rồi: "Tôi định xây dựng cái này bằng WebSockets."

Carlos nhìn anh. "Hãy dẫn tôi qua nó."

"Mỗi đơn hàng có một kết nối WebSocket. Client kết nối khi đơn hàng được đặt. Server đẩy các thay đổi trạng thái — đã xác nhận, đang chuẩn bị, đang trên đường, đã giao — khi chúng xảy ra. Không polling, độ trễ thấp, mô hình đơn giản."

"Cái gì duy trì kết nối WebSocket?"

"Một endpoint WebSocket của API Gateway. Các Lambda function xử lý các sự kiện kết nối và tin nhắn. DynamoDB lưu trữ các connection ID."

Carlos viết nó lên bảng. "Và failure mode khi mạng của client bị rớt trong 15 giây?"

"Kết nối bị chấm dứt. Client kết nối lại và hỏi trạng thái hiện tại."

"Từ đâu?"

"Từ... Lambda handler, đọc từ DynamoDB."

"Vậy bạn có cả một đường push và một đường pull," Carlos nói. "Push qua WebSocket là happy path. Đọc từ DynamoDB là đường phục hồi. Làm thế nào bạn đảm bảo kết nối được thiết lập lại trước khi khách hàng nhận thấy trạng thái bị cũ?"

Leo suy nghĩ. "Client phát hiện ngắt kết nối và kết nối lại trong vòng vài giây. Logic kết nối lại đơn giản."

"Ở 10,000 đơn hàng đang hoạt động đồng thời — đó là nơi Nimbus đang hướng tới — đó là bao nhiêu kết nối WebSocket đồng thời?"

"10,000."

"WebSocket của API Gateway có quota mặc định là 500 **kết nối mới mỗi giây** trên mỗi tài khoản," Carlos nói. "Không phải kết nối đồng thời — đó là *tốc độ* kết nối. 10,000 kết nối ổn định thì không sao. Vấn đề là cơn bão kết nối lại: khi một sự cố mạng nhỏ làm rớt vài nghìn client cùng lúc và tất cả họ kết nối lại trong cùng hai giây, bạn chạm vào quota tốc độ và các kết nối lại bắt đầu thất bại đúng vào lúc người dùng đang chú ý nhất. Bạn có thể yêu cầu tăng quota, nhưng đó là một quota mà bạn sẽ phải xem xét lại khi tăng trưởng. Ngoài ra: WebSocket của API Gateway tính phí $0.25 cho mỗi triệu connection-minute, cộng với $1.00 cho mỗi triệu tin nhắn. Ở 10,000 đơn hàng mỗi ngày với cửa sổ theo dõi trung bình 40 phút, đó chỉ khoảng 400,000 connection-minute mỗi ngày — chỉ vài xu. Ở 10,000 đơn hàng đang hoạt động đồng thời, đó là một quy mô khác."

"Đó không phải là nhiều," Leo nói.

"Không nhiều ở 10,000 đơn hàng đang hoạt động," Carlos nói. "Ở quy mô đó, tính ra khoảng $150 mỗi tháng với phí connection-minute và phí tin nhắn. Chi phí không phải là lý lẽ chống lại WebSockets ở đây. Quota tốc độ kết nối dưới các cơn bão kết nối lại, và việc quản lý trạng thái kết nối, mới là lý lẽ."

"Vậy WebSockets trở nên phức tạp ở quy mô lớn," Maya nói.

"Chúng trở nên có thể quản lý được ở quy mô lớn nếu bạn thiết kế kiến trúc cho điều đó," Carlos nói. "Nó không sai — nó là một bộ đánh đổi khác. Bây giờ hãy để tôi cho bạn thấy lựa chọn polling."

Anh vẽ lựa chọn thứ hai.

"Polling: client gửi một request GET tới `/orders/{order_id}/status` mỗi 5 giây. Backend đọc từ DynamoDB. Trả về trạng thái hiện tại."

"Đó là rất nhiều request," Priya nói.

"10,000 đơn hàng đang hoạt động × 1 lần poll mỗi 5 giây = 2,000 request mỗi giây. API của bạn cần xử lý 2,000 RPS. DynamoDB tự động scale. API Gateway xử lý tải. Chi phí: 2,000 RPS × 3,600 giây × 24 giờ × 30 ngày = 5.18 tỷ request mỗi tháng. Giá API Gateway REST API: $3.50 cho mỗi triệu request = $18,130/tháng."

Cả phòng im lặng.

"Đó không phải là một lựa chọn khả thi ở quy mô lớn," Tom nói.

"Chính xác," Carlos nói. "Polling ở khoảng cách 5 giây là cách triển khai đơn giản nhất và đắt nhất ở quy mô lớn. Nó cũng tạo ra tải tỷ lệ với số kết nối đang hoạt động, không phải tỷ lệ với số thay đổi trạng thái. Nếu một đơn hàng nằm ở 'đang chuẩn bị' trong 20 phút, polling tạo ra 240 request mà tất cả đều trả về cùng một trạng thái. Đó là lãng phí."

"Còn Kinesis?" Maya hỏi.

"Kinesis tạo ra một sự kiện cho mỗi thay đổi trạng thái. Xác nhận đơn hàng: một sự kiện. Nhà bếp chấp nhận: một sự kiện. Tài xế nhận hàng: một sự kiện. Giao hàng: một sự kiện. Bốn sự kiện cho mỗi đơn hàng, bất kể mỗi trạng thái kéo dài bao lâu. Bên tiêu thụ — backend của bạn — đọc từ Kinesis stream và đẩy cập nhật tới client thông qua bất kỳ cơ chế phân phối nào bạn chọn."

"Nhưng client vẫn cần một cách để nhận push," Leo nói.

"Đúng. Bạn có thể dùng Server-Sent Events, một endpoint long-poll, hoặc WebSockets cho phần phân phối chặng cuối. Kinesis xử lý event stream đáng tin cậy, có thứ tự, có thể replay cho backend của bạn. Cơ chế phân phối tới client là một quyết định riêng. Lợi thế then chốt: Kinesis tách rời nguồn sự kiện khỏi bên tiêu thụ. Hệ thống theo dõi giao hàng, hệ thống hoàn tiền, hệ thống thông báo cho nhà hàng, và màn hình trạng thái cho khách hàng đều tiêu thụ từ cùng một Kinesis stream một cách độc lập."

"Vậy nó không phải là Kinesis thay cho WebSockets," Maya nói. "Nó là Kinesis cộng với một cơ chế phân phối tới client nhẹ hơn."

"Chính xác. Phân tích đánh đổi:"

Anh viết nó:

| Lựa chọn | Độ trễ | Chi phí (500 / 10K đơn hàng đang hoạt động) | Độ phức tạp |
|---|---|---|---|
| Chỉ WebSockets | ~50ms | $8 / $150 mỗi tháng | Trung bình |
| Polling (5s) | 0–5s | $906 / $18,130 mỗi tháng | Thấp |
| Kinesis + SSE | ~200ms | $8 / $75 mỗi tháng | Trung bình-cao |

"Lựa chọn polling bị loại bỏ bởi chi phí," Carlos nói. "WebSockets khả thi nhưng cần quản lý kết nối ở quy mô lớn. Kinesis cộng với Server-Sent Events có độ trễ cao hơn một chút và chi phí tương đương — điều nó mang lại cho bạn là event log bền vững, có thể replay mà bạn cần cho hệ thống hoàn tiền, và các bên tiêu thụ được tách rời."

"Khoan đã — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Nếu WebSockets có độ trễ thấp hơn, tại sao chấp nhận độ trễ cao hơn từ Kinesis cộng SSE?"

"200ms so với 50ms có cảm nhận được không đối với một khách hàng đang theo dõi cập nhật trạng thái giao hàng?" Carlos hỏi.

"Không," cô nói.

"Vậy thì khác biệt về độ trễ nằm dưới ngưỡng cảm nhận. Khác biệt về chi phí ở mười nghìn đơn hàng đang hoạt động là khiêm tốn — $75 so với $150 mỗi tháng. Khác biệt về kiến trúc mới là lý lẽ thực sự: Kinesis cho bạn một event log bền vững, có thể replay — thứ mà bạn sẽ cần cho dấu vết kiểm toán hoàn tiền — và tách rời các bên tiêu thụ theo dõi của bạn. WebSockets sẽ đòi hỏi bạn xây dựng lại sự tách rời đó sau này."

Leo nhìn xuống bàn. "Chúng ta suýt đã phát hành phiên bản WebSocket."

"Nó vẫn sẽ hoạt động," Carlos nói. "Đó là điều quan trọng cần hiểu. WebSockets vẫn sẽ hoạt động. Câu hỏi trong kiến trúc hiếm khi là 'cái này có hoạt động không?' Câu hỏi là 'cái này tốn bao nhiêu khi nó tăng trưởng, và chúng ta phải xây dựng lại gì sau này?'"


**Các Câu Hỏi Mà Kiến Trúc Sư Đặt Ra**

Trong hai giờ tiếp theo, Carlos hướng dẫn nhóm qua cuộc review. Một số câu hỏi của anh:

**Về lưu trữ dữ liệu**:

"Trạng thái đơn hàng được lưu trữ ở đâu trong quá trình thực hiện? Nếu ứng dụng crash giữa chừng giao hàng, quy trình phục hồi là gì? Bạn có thể tái tạo trạng thái chỉ từ các sự kiện không?"

**Về cơ chế hoàn tiền**:

"Hoàn tiền được kích hoạt tự động. Điều gì ngăn một khoản hoàn tiền được phát hành hai lần? Điều gì xảy ra nếu bộ xử lý thanh toán hết thời gian chờ và bạn không chắc chắn liệu hoàn tiền có được chấp nhận hay không?"

**Về theo dõi giao hàng**:

"Bạn đang dựa vào dữ liệu GPS của tài xế. Điều gì xảy ra nếu tín hiệu GPS bị mất trong 90 giây? Làm thế nào bạn phân biệt 'mất GPS' với 'giao hàng đang tiến hành' với 'vấn đề giao hàng'?"

**Về xử lý thất bại**:

"Nếu dịch vụ hoàn tiền bị down, đơn hàng có vẫn được xử lý không? Khách hàng có vẫn nhận được món ăn của họ không? Trải nghiệm người dùng là gì trong một thất bại hệ thống một phần?"

**Về khả năng quan sát**:

"Làm thế nào ngay bây giờ bạn biết có bao nhiêu đơn hàng hiện đang trong vòng 5 phút so với SLA 15 phút? Nếu con số đó tăng vọt, ai được thông báo?"

Mỗi câu hỏi tiết lộ một giả định mà nhóm đã mắc phải mà không nhận ra.

"Tôi đã triển khai nó rồi — ồ," Leo nói. "Endpoint hoàn tiền. Tôi chỉ định gọi trực tiếp API thanh toán. Chúng ta đã không nghĩ đến việc gọi nó hai lần." Anh dừng lại. "Vậy nếu lần gọi đầu tiên thành công nhưng xác nhận của chúng ta bị mất trên đường truyền, chúng ta gọi lại và khách hàng nhận được hai khoản hoàn tiền."

"Chúng ta đã nghĩ đến điều gì xảy ra nếu API thanh toán chấp nhận lần gọi đầu tiên nhưng xác nhận của chúng ta bị mất trên đường truyền chưa?" Priya hỏi.

"Đó là idempotency," Carlos nói.

"Một idempotency key — một ID duy nhất cho mỗi lần thử hoàn tiền, được lưu trong DB trước khi gọi API thanh toán," Priya nói. "Nếu chúng ta gọi hai lần với cùng một key, API thanh toán bỏ qua lần gọi thứ hai."

"Điều đó có nghĩa là," Carlos thêm vào, "bạn cần một kho lưu trữ trạng thái bền vững cho các thao tác hoàn tiền, không chỉ là một sự kiện trong một hàng đợi."


"Monitoring mà chúng ta đã thảo luận," Carlos nói, "đều là monitoring cơ sở hạ tầng. CPU. Số lượng kết nối. Độ trễ của Kinesis. Những thứ này quan trọng — nhưng chúng không phải là monitoring cho bạn biết liệu Nimbus Instant có đang hoạt động hay không."

"Monitoring nào cho chúng ta biết nó đang hoạt động?" Maya hỏi.

"Thời gian xác nhận P95 cho mỗi nhà hàng. Ở phân vị thứ 95, mất bao lâu từ khi đặt hàng đến khi nhà hàng xác nhận — được đo riêng cho từng đối tác nhà hàng?"

"Chúng ta không có metric đó," Priya nói.

"Đó là khoảng cách," Carlos nói. "Bạn có thể có cơ sở hạ tầng hoàn hảo — CloudWatch xanh trên mọi alarm — và vẫn có một đối tác nhà hàng mà độ trễ xác nhận của họ đã suy giảm trong ba tuần vì phần mềm trên tablet của họ có lỗi. Cơ sở hạ tầng thì ổn. SLA kinh doanh đang bị vi phạm. Và bạn sẽ không biết cho đến khi nhà hàng gọi điện để phàn nàn."

"Làm thế nào chúng ta nắm bắt điều đó?" Leo hỏi.

"Phát ra một custom metric của CloudWatch hoặc đẩy tới pipeline phân tích của bạn mỗi khi một xác nhận đơn hàng được nhận. Đánh dấu thời gian đặt hàng. Đánh dấu thời gian xác nhận. Tính chênh lệch. Phát ra nó với thẻ `restaurant_id`. Xây dựng một dashboard CloudWatch hiển thị thời gian xác nhận p95 theo nhà hàng trong 7 ngày gần nhất."

"Và cảnh báo khi nó suy giảm?" Tom hỏi.

"Cảnh báo khi p95 cho một nhà hàng cụ thể vượt quá 90 giây trong hơn 5 phút liên tục," Carlos nói. "Đó là một bất thường đáng để chủ động liên hệ, không phải một phản ứng chờ-đến-khi-có-phàn-nàn."

"Đây là sự khác biệt giữa monitoring cơ sở hạ tầng và monitoring sản phẩm," Priya nói.

"Chính xác," Carlos nói. "Monitoring cơ sở hạ tầng cho bạn biết liệu hệ thống của bạn có khỏe mạnh hay không. Monitoring ở cấp độ kinh doanh cho bạn biết liệu khách hàng của bạn có đang trải nghiệm điều bạn đã hứa với họ hay không. Bạn cần cả hai. Hầu hết các nhóm chỉ có cái đầu tiên."

Maya thêm nó vào phụ lục ADR: theo dõi thời gian xác nhận p95 cho mỗi nhà hàng bên cạnh các metric sức khỏe cơ sở hạ tầng. Các ngưỡng alarm sẽ được nhóm sản phẩm xác định khi tham vấn với nhóm thành công của nhà hàng.

"Đây cũng là nơi monitoring chi phí và monitoring kinh doanh giao nhau," Tom nói. "Nếu độ trễ xác nhận của chúng ta tăng vọt cho một nhóm nhỏ nhà hàng vào tối thứ Sáu, nguyên nhân gốc rễ có thể là một Lambda cold start chạm vào các shard của những nhà hàng đó trong Kinesis. Metric kinh doanh tiết lộ triệu chứng. Các metric cơ sở hạ tầng tiết lộ nguyên nhân."

"Và giải pháp có thể không phải là thêm cơ sở hạ tầng," Carlos nói. "Nó có thể là provisioned concurrency trên Lambda function cụ thể đó. Hoặc nó có thể là cân bằng lại shard. Hoặc nó có thể là một lỗi trong endpoint xác nhận của nhà hàng. Bạn không thể biết là cái nào cho đến khi bạn có cả hai tầng quan sát."

"Chúng ta đã nghĩ đến điều gì xảy ra nếu chúng ta sửa cơ sở hạ tầng mà metric kinh doanh vẫn không cải thiện chưa?" Priya hỏi.

"Thì nguyên nhân gốc rễ không nằm trong cơ sở hạ tầng," Carlos nói. "Đó là thông tin có giá trị. Không có metric kinh doanh, bạn sẽ đuổi theo các cải tiến cơ sở hạ tầng cho một vấn đề nằm ở nơi khác."


"Cái đó tốn bao nhiêu mỗi tháng khi chúng ta có 500 lần giao hàng đồng thời đang được theo dõi?" Tom hỏi. "Kho trạng thái, Kinesis stream, các Lambda function xử lý sự kiện?"

Carlos gật đầu. "Đó là câu hỏi đúng để hỏi ngay bây giờ, khi bạn đang thiết kế, không phải sau khi bạn đã xây dựng nó."

Đây là loại chi tiết kiến trúc xuất hiện trong một cuộc review có cấu trúc — và thường không xuất hiện khi bạn chỉ đang xây dựng.

**Architecture Decision Record**

Sau cuộc review, Carlos đề xuất nhóm ghi lại các quyết định của họ trong **Architecture Decision Records (ADRs)** — các tài liệu ngắn nắm bắt:

- **Quyết định gì đã được đưa ra**
- **Các lựa chọn thay thế nào đã được xem xét**
- **Tại sao quyết định này được đưa ra (bối cảnh và ràng buộc tại thời điểm đó)**
- **Đánh đổi là gì**
- **Điều gì sẽ khiến chúng ta xem xét lại quyết định này**

Bạn có thể đang tự hỏi: ADR có cần phải là tài liệu chính thức không? Không. Một ADR có thể là một đoạn văn trong một thread Slack nếu đó là nơi nhóm của bạn làm việc. Định dạng không quan trọng. Hành động viết ra điều bạn đã quyết định và lý do — trước khi tiếp tục — là điều tạo ra trí nhớ thể chế.

"ADRs dành cho bản thân tương lai của bạn," Carlos nói. "Sau 18 tháng, bạn sẽ nhìn vào một đoạn kiến trúc và tự hỏi tại sao nó được làm theo cách đó. Nếu bạn có một ADR, bạn sẽ hiểu bối cảnh. Nếu không, bạn sẽ hoặc để nguyên nó (vì bạn sợ chạm vào nó) hoặc thay đổi nó (vì bạn không hiểu tại sao nó được làm theo cách đó)."

Leo viết ADR đầu tiên vào chiều hôm đó: quyết định sử dụng Kinesis cho các sự kiện theo dõi giao hàng, với bối cảnh, các lựa chọn thay thế được xem xét (SQS, EventBridge, polling), và các đánh đổi.

Carlos nhìn vào ADR mà Leo đã soạn. Anh đọc nó trong ba mươi giây. Rồi anh nói: "Cho cả nhóm thấy ADR-007 trông như thế nào."

Leo chiếu nó lên.

---

**ADR-007: Hạ Tầng Sự Kiện Theo Dõi Giao Hàng**

**Ngày**: 2025-03-14
**Trạng thái**: Đã chấp nhận
**Tác giả**: Leo (với review từ Carlos, Priya)

---

**Vấn đề**

Nimbus Instant yêu cầu theo dõi trạng thái giao hàng thời gian thực. Các đơn hàng phải cập nhật trạng thái của chúng (đã xác nhận → đang chuẩn bị → đang trên đường → đã giao) và hiển thị những cập nhật đó tới app di động của khách hàng trong vòng 5 giây kể từ khi trạng thái thay đổi. Hệ thống hoàn tiền cũng cần một log các sự kiện giao hàng có thể kiểm toán, có thể replay để xác định việc tuân thủ SLA.

---

**Các Lựa Chọn Được Xem Xét**

**Lựa chọn 1: API Gateway WebSocket + trạng thái DynamoDB**
- Client duy trì một kết nối WebSocket cho mỗi đơn hàng
- Backend đẩy các thay đổi trạng thái qua kết nối đang mở
- Khi kết nối lại, client kéo trạng thái hiện tại từ DynamoDB
- Chi phí ước tính ở quy mô lớn (10K đơn hàng đang hoạt động đồng thời): ~$150/tháng
- Điểm yếu: Quản lý giới hạn kết nối ở quy mô lớn; không có replay tích hợp sẵn cho kiểm toán

**Lựa chọn 2: Client polling (khoảng cách 5 giây)**
- Client poll `/orders/{order_id}/status` mỗi 5 giây
- Backend đọc từ DynamoDB ở mỗi lần poll
- Cách triển khai đơn giản nhất
- Chi phí ước tính ở quy mô lớn (10K đơn hàng đang hoạt động đồng thời): $18,130/tháng
- Bị loại bỏ do chi phí

**Lựa chọn 3: Kinesis Data Streams + Server-Sent Events**
- Các thay đổi trạng thái giao hàng được xuất bản tới Kinesis stream, được định cỡ theo throughput: một shard nạp vào 1 MB/s hoặc 1,000 record/s. Ở 10K đơn hàng đang hoạt động (~4 sự kiện thay đổi trạng thái cho mỗi đơn hàng, payload JSON nhỏ), tốc độ ghi đỉnh là ~40-50 sự kiện/s — bằng một shard. Cấp phát 3 shard để phân tán partition và dư địa cho bên tiêu thụ.
- Endpoint SSE đăng ký Kinesis shard được gán cho partition của đơn hàng
- Client nhận các sự kiện SSE; kết nối lại bằng EventSource API tiêu chuẩn
- Chi phí ước tính ở quy mô lớn (10K đơn hàng đang hoạt động đồng thời): ~$75/tháng
- Cung cấp event log bền vững, có thể replay; tách rời tất cả các bên tiêu thụ

---

**Quyết định**

Lựa chọn 3: Kinesis Data Streams + SSE.

Lý do: lợi thế chi phí là đáng kể ở quy mô lớn; event log của Kinesis đáp ứng yêu cầu kiểm toán hoàn tiền mà không cần một cách triển khai dấu vết kiểm toán riêng; việc xử lý kết nối lại của SSE đơn giản hơn việc quản lý kết nối WebSocket ở quy mô lớn.

---

**Hệ quả**

- *Tích cực*: Hệ thống hoàn tiền, hệ thống thông báo cho nhà hàng, và app khách hàng đều tiêu thụ từ cùng một Kinesis stream một cách độc lập. Các bên tiêu thụ mới có thể được thêm vào mà không cần sửa đổi bên sản xuất.
- *Tích cực*: Các sự kiện có thể replay được trong tối đa 7 ngày (extended retention mà chúng ta cấu hình; Kinesis hỗ trợ tối đa 365 ngày với chi phí thêm). Nếu Lambda xử lý hoàn tiền thất bại, nó có thể replay các sự kiện bị bỏ lỡ.
- *Tiêu cực*: Độ trễ SSE (~200ms) cao hơn độ trễ WebSocket (~50ms). Chấp nhận được vì khác biệt này nằm dưới ngưỡng cảm nhận của khách hàng đối với cập nhật trạng thái.
- *Tiêu cực*: Giá provisioned của Kinesis scale theo shard-hour, và extended retention gần như nhân đôi chi phí mỗi shard. Dư địa throughput lớn (một shard nạp vào 1,000 record/s), nhưng khi số lượng bên tiêu thụ và tải đọc của mỗi bên tiêu thụ tăng vượt khoảng 50K đơn hàng hoạt động hàng ngày, số lượng shard — và một chiến lược re-shard/consumer-fan-out — sẽ cần được xem xét lại.

**Điều gì sẽ khiến chúng ta xem xét lại quyết định này**: Nếu khối lượng đơn hàng tăng đến mức chi phí shard của Kinesis vượt quá chi phí WebSocket ở quy mô mới, hoặc nếu độ trễ SSE 200ms trở thành một vấn đề khác biệt hóa sản phẩm.

---

"Dòng cuối cùng," Maya nói. "Đó là dòng mà tôi đã không nghĩ tới."

"Yếu tố kích hoạt việc xem xét lại," Carlos nói. "Mọi quyết định đều có những điều kiện mà dưới đó nó trở nên sai. Viết chúng ra có nghĩa là bạn sẽ nhận ra chúng khi chúng xuất hiện."

"Thay vì phát hiện ra chúng trong một cuộc post-mortem," Priya nói.

"Thay vì điều đó, đúng vậy."

Tom đang đọc phần hệ quả về chi phí. "Chiến lược re-shard và fan-out — chúng ta chưa có cái đó."

"Bạn không cần nó cho đến 50K đơn hàng hoạt động hàng ngày," Carlos nói. "Ở 287 nhà hàng và 4,200 đơn hàng hàng ngày hiện tại, bạn có dư địa đáng kể. ADR cho bạn biết cái gì cần xây dựng trước khi nó trở nên cấp bách, không phải trước khi nó trở nên liên quan."

Leo đã đang ghi chú. "ADR đang làm hai việc," anh nói. "Nó đang ghi lại điều chúng ta đã quyết định. Và nó đang ghi lại điều chúng ta sẽ cần quyết định tiếp theo nếu tình huống thay đổi."

"Đó là điều khiến một ADR hữu ích trong mười tám tháng," Carlos nói. "Không phải bản thân quyết định — các quyết định trở nên cũ. Mà là lý lẽ. Lý lẽ cho bạn biết liệu quyết định có nên được xem xét lại hay không, ngay cả khi quyết định vẫn còn hiệu lực."


**Điều Gì Tạo Nên Một Kiến Trúc Sư**

Cuối buổi, Maya hỏi Carlos câu hỏi ban đầu: "Sự khác biệt giữa việc đưa ra các quyết định kiến trúc và suy nghĩ như một kiến trúc sư là gì?"

Anh suy nghĩ về nó.

"Một kiến trúc sư không biết nhiều công nghệ hơn một kỹ sư cấp cao," anh nói. "Một kiến trúc sư giỏi có lẽ biết ít hơn một chút về những framework mới nhất. Nhưng một kiến trúc sư có một bộ câu hỏi mặc định khác."

"Ý anh là gì?"

"Khi bạn là một kỹ sư cấp cao nhìn vào một tính năng mới, những câu hỏi đầu tiên của bạn thường là: 'Chúng ta xây dựng gì? Nó hoạt động như thế nào? Thư viện tốt nhất cho điều này là gì?' Khi một kiến trúc sư nhìn vào cùng một tính năng, những câu hỏi đầu tiên là: 'Vấn đề này giải quyết điều gì? Điều gì hỏng đầu tiên khi lưu lượng tăng gấp đôi? Làm thế nào chúng ta biết khi nó đã bị xuống cấp? Người dùng trải nghiệm điều gì khi bộ xử lý thanh toán chậm?'"

"Kiến trúc sư hỏi về hệ thống dưới áp lực," Leo nói.

"Và về hậu quả kinh doanh của mỗi thất bại," Priya thêm vào.

"Và," Tom nói, "về điều gì xảy ra với hóa đơn khi điều này mở rộng quy mô."

Carlos gật đầu. "Tất cả các bạn đã đang làm điều này rồi. Bạn đã làm nó từ Chương 1. Sự khác biệt giữa một kỹ sư cấp cao và một kiến trúc sư không phải là một chứng nhận hay một chức danh. Đó là thói quen hỏi câu hỏi tiếp theo — câu hỏi tiết lộ điều mà bạn chưa nghĩ tới."

**Biến Thể: Khi Một Architecture Review Thêm Vào Rủi Ro Thay Vì Loại Bỏ Nó**

Nếu cuộc review của bạn được coi như một cổng phê duyệt thay vì một quá trình học hỏi, các nhóm sẽ bắt đầu giấu các lựa chọn thiết kế để tránh sự trì hoãn — và các failure mode sẽ vẫn tồn tại, chỉ là không được ghi chép. Một architecture review làm chậm việc phát hành mà không cải thiện chất lượng còn tệ hơn là không có review nào cả.

Nếu vấn đề idempotency cho dịch vụ hoàn tiền đã được coi như một sự trì hoãn ngoài ý muốn đối với việc ra mắt tính năng thay vì một khám phá cần thiết, Leo sẽ phát hành endpoint ban đầu, sự hoàn tiền đôi cuối cùng sẽ xảy ra, và nhóm sẽ biết về nó từ một khách hàng giận dữ. Cuộc review làm lộ ra vấn đề ở một thời điểm mà việc sửa nó tốn một ngày, không phải một cuộc rollback.

Giá trị của cuộc review tỷ lệ với mức độ sẵn lòng của nhóm trong việc để nó thay đổi thiết kế.

## Điểm Mạnh và Hạn Chế

**Architecture review**:

- Phát hiện các failure mode trước khi chúng ở trong production
- Tạo ra hiểu biết chung giữa các thành viên nhóm thường có kiến thức bị cô lập
- Tạo ra tài liệu (ADRs) mang lại lợi ích trong nhiều năm
- Làm chậm việc ra quyết định theo những cách có lợi — "đi nhanh" mà không có review là "đi nhanh và đâm vào bức tường mà bạn không thấy"

**Nơi chúng trở nên phức tạp**:

- Yêu cầu một người đủ kỹ năng để hỏi đúng câu hỏi — cuộc review chỉ tốt bằng người review
- Có thể trở nên quan liêu nếu được coi như một ô đánh dấu thay vì một cuộc trò chuyện
- Một số quyết định kiến trúc thực sự không cần một cuộc review đầy đủ — biết cái nào cần tự nó đã là một kỹ năng kiến trúc
- Đầu ra (ADRs, sơ đồ, nhật ký quyết định) phải được duy trì khi hệ thống phát triển

## Tóm Tắt

Cuộc review với Carlos đã mất hai giờ và tạo ra ba ADR, một danh sách sáu điều chưa biết cần giải quyết trước khi tính năng được xây dựng, và một thay đổi kiến trúc (kho trạng thái idempotency) mà lẽ ra sẽ rất khó khăn để gắn thêm sau khi ra mắt. Phép ẩn dụ về danh sách kiểm tra trước chuyến bay đã đúng xuyên suốt: không có gì thảm khốc được phát hiện, nhưng một số thứ lẽ ra sẽ gây ra vấn đề sau này đã được bắt và ghi chép lại trong khi chúng vẫn còn dễ sửa.

- Các architecture review bắt đầu với **yêu cầu kinh doanh, không phải công nghệ**.
- Cấu trúc review: ràng buộc → điều chưa biết → lựa chọn → failure mode → monitoring → runbook.
- Kiến trúc sư hỏi: Điều gì hỏng đầu tiên? Làm thế nào chúng ta biết nó đã xuống cấp? Người dùng trải nghiệm gì khi có thất bại? Chi phí là bao nhiêu ở quy mô lớn?
- **Architecture Decision Records (ADRs)** nắm bắt điều gì đã được quyết định, tại sao, và điều gì sẽ gây ra việc xem xét lại.
- Suy nghĩ như một kiến trúc sư là một thói quen: hỏi câu hỏi tiếp theo, đặc biệt về failure mode, hậu quả kinh doanh, và kinh tế học của quy mô.

## Mẹo Thi

*SAA-C03 Domain: Xuyên domain — lý luận kiến trúc*

Chương này ít về các chủ đề thi cụ thể và nhiều hơn về tư duy mà kỳ thi kiểm tra.

- **Các kịch bản SAA-C03** hầu như luôn mô tả một ràng buộc kinh doanh trước ("công ty không thể chịu đựng hơn 1 giờ ngừng hoạt động") và yêu cầu bạn chọn kiến trúc đáp ứng nó. Hãy luyện tập việc chuyển đổi các ràng buộc kinh doanh thành các yêu cầu kỹ thuật.
- **Tư duy failure mode**: Nhiều câu hỏi thi mô tả một hệ thống và hỏi điều gì xảy ra khi một thành phần bị lỗi. Hãy luyện tập việc hỏi "điều gì hỏng đầu tiên?" cho các kiến trúc mà bạn gặp.
- **Tư duy đánh đổi**: Kỳ thi hiếm khi có một câu trả lời "hoàn hảo." Nó hỏi câu trả lời *tốt nhất* cho một tập hợp ràng buộc. Hãy thoải mái với "lựa chọn này đúng cho những yêu cầu cụ thể này, ngay cả khi một lựa chọn khác sẽ tốt hơn dưới những yêu cầu khác."
- **Architecture Decision Records**: Không phải một dịch vụ AWS, nhưng là một thực hành tốt nhất phản ánh trụ cột Xuất Sắc Vận Hành của Well-Architected Framework.
- **Kinesis cho event streaming thời gian thực**: Tính năng Nimbus Instant của chương này dùng Kinesis cho streaming các sự kiện giao hàng. Tín hiệu thi: "thu nạp sự kiện thời gian thực với xử lý có thứ tự" → Kinesis Data Streams. "Tách rời các thành phần, phân phối ít nhất một lần" → SQS. Biết khi nào nên dùng cái nào là một mẫu thi lặp đi lặp lại.
- **Idempotency như một mẫu có thể kiểm tra**: SAA-C03 thường xuyên kiểm tra idempotency trong các hệ thống phân tán. Mẫu cốt lõi: tạo một idempotency key duy nhất trước khi gọi một hệ thống bên ngoài; lưu key và kết quả; khi thử lại, kiểm tra key hiện có trước khi thực thi lại. Nếu tìm thấy, trả về kết quả đã lưu trước đó mà không thực thi lại. Điều này ngăn việc tính phí đôi, gửi đôi, và thay đổi trạng thái trùng lặp khi các lần thử lại xảy ra sau một timeout mạng. Tín hiệu thi: "ngăn các thao tác trùng lặp khi một lệnh gọi dịch vụ được thử lại" hoặc "đảm bảo xử lý chính xác một lần các sự kiện thanh toán" → idempotency key được lưu trong DynamoDB với conditional write.
- **Server-Sent Events so với WebSockets**: SSE là một chiều (từ server tới client), dùng HTTP tiêu chuẩn, và tự động kết nối lại thông qua EventSource API. WebSockets là hai chiều, yêu cầu quản lý kết nối, và phù hợp khi client cũng cần đẩy dữ liệu tới server. Đối với cập nhật trạng thái giao hàng (chỉ từ server tới client), SSE đơn giản hơn và rẻ hơn WebSockets ở quy mô lớn.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Carlos đặt ra sáu loại câu hỏi trong quá trình architecture review. Bạn có thể tái tạo sáu lĩnh vực mà không nhìn vào chương không?

*(Gợi ý: Chúng được liệt kê trong phần "Cấu Trúc Của Architecture Review." Hãy cố gắng nhớ lại chúng từ trí nhớ — hành động cố gắng nhớ lại (ngay cả khi bạn thất bại) tăng cường khả năng lưu giữ lâu dài.)*

**Bài Tập 2 — Kịch Bản SAA-C03**

*Kịch bản*: Một công ty đang xây dựng một hệ thống quản lý đấu giá thời gian thực cho quảng cáo trực tuyến. Các lượt đấu giá phải được đánh giá và phản hồi trong vòng 100 mili giây. Hệ thống xử lý 1 triệu lượt đấu giá mỗi giây vào lúc cao điểm. Nếu hệ thống đấu giá bị down, công ty mất doanh thu quảng cáo. Nhóm cơ sở dữ liệu của công ty đề xuất sử dụng RDS Aurora với 10 read replica. Kiến trúc sư giải pháp phải đánh giá liệu đề xuất có khả thi về cơ bản hay không trước khi xem xét các đặc điểm thứ cấp của nó.

Kiến trúc sư nên nêu mối lo ngại nào ĐẦU TIÊN?

A) Chi phí của 10 Aurora read replica là quá cao so với ngân sách  
B) Aurora read replica có độ trễ sao chép có thể gây ra các vấn đề nhất quán  
C) Độ trễ truy vấn điển hình 1-5ms của Aurora có thể không đáp ứng SLA phản hồi 100ms  
D) RDS Aurora không hỗ trợ khối lượng giao dịch 1 triệu request mỗi giây ở yêu cầu độ trễ này

**Gợi ý 1**: Ràng buộc chính là thời gian phản hồi tổng cộng 100ms ở 1 triệu request/giây. Mối lo ngại nào trong số này, nếu đúng, khiến đề xuất không khả thi bất kể ba mối lo còn lại được xử lý như thế nào?

**Gợi ý 2**: Độ trễ truy vấn Aurora thường là 1-5ms. 1-5ms cho truy vấn cơ sở dữ liệu để lại 95-99ms cho mạng, logic ứng dụng, và tuần tự hóa. Ràng buộc 100ms có bị rủi ro không?

**Gợi ý 3**: Aurora có thể xử lý IOPS cao, nhưng 1 triệu request mỗi giây là một tốc độ phi thường. Điều gì xảy ra với kiến trúc ở quy mô đó?

**Đáp án**: D

**Giải thích**: Mặc dù Aurora có hiệu suất cao, 1 triệu request mỗi giây ở thời gian phản hồi tổng cộng 100ms là một yêu cầu cực đoan — đó là vật cản kiến trúc quyết định liệu đề xuất có thể tồn tại hay không. Kiến trúc sư trước tiên nên đặt câu hỏi liệu Aurora (hoặc bất kỳ cơ sở dữ liệu quan hệ nào) có thể phục vụ như hệ thống tra cứu chính ở quy mô và độ trễ này hay không. Các hệ thống như thế này thường dùng kho dữ liệu trong bộ nhớ (Redis) hoặc cơ sở dữ liệu độ trễ thấp chuyên dụng, không phải cơ sở dữ liệu quan hệ với ngữ nghĩa SQL đầy đủ. SLA 100ms có thể đạt được cho riêng các truy vấn Aurora, nhưng sự kết hợp của 1M RPS và SLA tổng cộng 100ms vượt quá các đặc điểm throughput điển hình của Aurora. "ĐẦU TIÊN" có nghĩa là tính khả thi trước khi tinh chỉnh: nếu engine không thể duy trì tải, mọi mối lo ngại khác về đề xuất đều trở nên vô nghĩa.

**Tại sao không phải A?** Chi phí là một mối lo ngại hợp lệ, nhưng mối lo ngại đầu tiên nên là liệu kiến trúc có khả thi về mặt kỹ thuật ở các yêu cầu đã nêu hay không.

**Tại sao không phải B?** Độ trễ sao chép là một đặc điểm thực nhưng *thứ cấp* của đề xuất — một thuộc tính bạn tinh chỉnh một khi kiến trúc đã khả thi. Độ trễ replica của Aurora thường <100ms và chấp nhận được cho hầu hết các trường hợp sử dụng; nêu nó đầu tiên có nghĩa là tranh luận về hành vi nhất quán của một hệ thống mà ngay từ đầu đã không thể duy trì throughput yêu cầu. Câu hỏi về tính khả thi (D) bao gồm nó.

**Tại sao không phải C?** Độ trễ Aurora 1-5ms nằm trong SLA 100ms cho phần truy vấn cơ sở dữ liệu. Đây không phải là mối lo ngại chính.

*SAA-C03 Domain: Xuyên domain — thiết kế hệ thống*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Áp dụng cấu trúc architecture review cho một hệ thống thực hoặc giả thuyết:

Một startup muốn xây dựng một trò chơi đố vui đa người chơi thời gian thực. Người chơi tham gia các phòng chơi (tối đa 10 người mỗi phòng). Mỗi vòng hiển thị một câu hỏi trong 15 giây; tất cả người chơi trả lời đồng thời. Điểm được tính tức thì sau mỗi câu hỏi. Trò chơi kéo dài 10 vòng. Sử dụng cao điểm: 50,000 trò chơi đồng thời.

Thực hiện qua sáu bước review:

1. Các ràng buộc không thể thương lượng là gì?
2. Các điều chưa biết và giả định là gì?
3. Các lựa chọn công nghệ thực tế là gì?
4. Các failure mode là gì?
5. Bạn sẽ biết khi nó xuống cấp như thế nào?
6. Runbook lúc 3 giờ sáng trông như thế nào?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành cấu trúc review như một công cụ tư duy.)*

## Cảnh Sau Tín Dụng

Carlos rời văn phòng lúc 6 giờ tối.

Nhóm ngồi một lúc sau đó, không làm gì cụ thể.

"Tôi cảm thấy như tôi đã học được nhiều hơn trong hai giờ đó so với bất kỳ chương dịch vụ AWS riêng lẻ nào," Leo nói.

"Vì những chương đó là về công cụ," Maya nói. "Đây là về phán đoán."

"Phán đoán có thể dạy được không?" anh hỏi.

"Có," Priya nói. "Nhưng không phải qua việc đọc. Mà qua thực hành. Qua việc đưa ra quyết định, xem điều gì bị hỏng, suy nghĩ về lý do tại sao."

"Qua kinh nghiệm," Tom nói.

"Qua kinh nghiệm có cấu trúc," Priya sửa lại. "Kinh nghiệm không có sự suy ngẫm thì không xây dựng nên phán đoán. Bạn phải đặt các câu hỏi sau đó."

Maya nhìn vào bảng trắng. Các ghi chú review vẫn còn ở đó — ràng buộc, điều chưa biết, failure mode, các câu hỏi monitoring. Nó lấp đầy hai bảng trắng.

"Điều này nên đưa vào ADR," cô nói.

Leo đã đang gõ phím.

Trong chương cuối cùng: điều duy nhất mà không công cụ hay framework nào có thể cho bạn — và tại sao "còn tùy" là câu trả lời trung thực và mạnh mẽ nhất trong kiến trúc phần mềm.
