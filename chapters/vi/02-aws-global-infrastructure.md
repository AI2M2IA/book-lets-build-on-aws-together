# Chương 2: Máy Chủ Của Bạn Ở Đâu Trên Thế Giới?

Đứng dậy. Đi đến cửa sổ nếu có một cái ở gần.

Nhìn ra ngoài. Bất cứ thứ gì bạn thấy — tòa nhà, cây cối, bãi đỗ xe, sân sau của ai đó — không có thứ nào trong số đó là nơi dữ liệu của bạn sống. Dữ liệu của bạn sống ở nơi khác hoàn toàn. Có lẽ ở một nơi bạn chưa bao giờ đến.

Điều đó không phải là vấn đề. Nhưng việc hiểu *ở đâu* làm cho một số điều bất ngờ có ý nghĩa.

Sau phiên bảng trắng, quyết định đã được đưa ra: Nimbus sẽ sử dụng AWS. Đám mây là câu trả lời. Nhưng "đám mây" hóa ra là một thứ cụ thể ở một vị trí cụ thể — và Leo đã chọn vị trí đó mà không có ý định.

Sáng hôm sau, Maya nhận thấy máy chủ đang ở Singapore.

"Tại sao lại là Singapore?" cô hỏi.

"Đó là mặc định," Leo nói.

Tom ngước nhìn khỏi cà phê. "Tốn bao nhiêu để chạy một máy chủ ở Singapore khi tất cả khách hàng của chúng ta ở Bờ Tây?"

Leo không có câu trả lời.

Priya đã có một mối lo khác. "Và ai biết dữ liệu đó đang đi qua những khu vực pháp lý nào?"

Chương này nói về việc sửa quyết định đó — và hiểu tại sao nó quan trọng.

**Vấn Đề Với "Ở Đâu Đó"**

Khi bạn sử dụng AWS, bạn không sử dụng một trung tâm dữ liệu. Bạn đang sử dụng một mạng lưới toàn cầu của chúng. AWS có cơ sở hạ tầng ở hàng chục quốc gia.

Đó là một tính năng, không chỉ là một sự thật. Nhưng nó có nghĩa là bạn phải đưa ra lựa chọn: *ở đâu* bạn muốn cơ sở hạ tầng của mình chạy?

Lựa chọn quan trọng vì ba lý do:

**Hiệu năng.** Máy chủ của bạn càng gần người dùng, phản hồi càng nhanh. Vật lý không thể thương lượng. Dữ liệu di chuyển ở khoảng hai phần ba tốc độ ánh sáng qua cáp quang. Một chuyến khứ hồi từ Seattle đến Singapore mất khoảng 170 mili giây chỉ riêng truyền dẫn — trước khi ứng dụng của bạn làm bất cứ điều gì. Cùng yêu cầu đó từ Seattle đến Oregon (`us-west-2`) mất khoảng 20 mili giây. Sự khác biệt không phải là lỗi làm tròn. Đối với một ứng dụng đặt hàng nhà hàng nơi khách hàng mong đợi các trang cảm thấy tức thì — và nơi một trang đơn lẻ kích hoạt vài chuyến khứ hồi — 170ms độ trễ cơ bản cho mỗi chuyến khứ hồi là sự khác biệt giữa một sản phẩm nhanh và một sản phẩm chậm chạp.

Tom rút điện thoại ra, mở ứng dụng Nimbus, và tải một trang nhà hàng. Anh tính giờ bằng một ứng dụng bấm giờ.

"Gần ba giây," anh nói.

Leo kiểm tra bảng phân tích độ trễ trong nhật ký máy chủ. Chỉ riêng chuyến khứ hồi đến Singapore — không liên quan gì đến truy vấn cơ sở dữ liệu — đang thêm khoảng 170 mili giây cho mỗi yêu cầu, và ứng dụng thực hiện nhiều chuyến khứ hồi cho mỗi trang.

"Và nếu chúng ta chuyển máy chủ sang Oregon?" Tom hỏi.

"Hai mươi mili giây," Leo nói. "Có lẽ ít hơn."

"Tốn bao nhiêu mỗi tháng?"

Sự khác biệt về giá là vài phần trăm. Không phải bằng không, nhưng không phải biến số chính. Họ chuyển máy chủ sang `us-west-2` chiều hôm đó.

"Tôi đã triển khai agent giám sát lên instance Singapore," Leo nói, nửa với chính mình. "Ồ." Anh dừng lại. "Tôi sẽ thiết lập nó ở Oregon thay vào đó."

**Tuân thủ.** Một số ngành có luật về nơi dữ liệu có thể được lưu trữ. Dữ liệu y tế của Hoa Kỳ có thể cần ở lại trong nước. Dữ liệu tài chính có thể cần ở lại trong một khu vực cụ thể. Chọn sai Region có thể tạo ra các vấn đề pháp lý.

Priya đã nghiên cứu điều này trước khi ai yêu cầu cô.

"GDPR," cô nói, ngước nhìn khỏi ghi chú tại buổi standup sáng hôm sau. "Nếu Nimbus có bao giờ phục vụ khách hàng ở Liên minh Châu Âu — dù chỉ một khách hàng — dữ liệu cá nhân về họ có thể cần ở lại trong EU hoặc ở một quốc gia với các biện pháp bảo vệ tương đương. Đó không phải tùy chọn. Đó là luật."

"Chúng ta là một ứng dụng đặt hàng nhà hàng," Leo nói. "Ở California."

"Hiện tại," Priya nói. "Chúng ta đã nghĩ về chuyện gì xảy ra nếu chúng ta mở rộng sang Châu Âu trong mười tám tháng và nhận ra chúng ta đã lưu trữ dữ liệu khách hàng Châu Âu ở Oregon trong một năm rưỡi chưa?"

Một khoảng dừng.

"Chúng ta sẽ sửa nó khi đó," Leo nói.

"Bạn không thể sửa các vi phạm cư trú dữ liệu hồi tố," Priya nói. "Vi phạm đã xảy ra rồi."

Cô không hề làm quá. Tiền phạt GDPR lên đến 4% doanh thu toàn cầu hàng năm. Vi phạm HIPAA trong y tế Hoa Kỳ có thể đạt hơn 2 triệu đô la cho mỗi loại vi phạm mỗi năm. Đây không phải giả thuyết — chúng là lý do tại sao các quyết định đám mây doanh nghiệp lớn bắt đầu với việc lập bản đồ tuân thủ, không phải cấu hình cơ sở hạ tầng.

Đối với Nimbus, mức độ phơi nhiễm quy định trước mắt là thấp: khách hàng Hoa Kỳ, không có dữ liệu y tế, không có dịch vụ tài chính. Nhưng chọn một Region cho một doanh nghiệp có ý định phát triển có nghĩa là chọn với sự tăng trưởng trong tâm trí.

**Khả năng phục hồi sau thảm họa.** Nếu một vị trí có sự cố mất điện, một trận động đất, hoặc một sự cố mạng, bạn muốn hệ thống của mình sống sót. Trải rộng cơ sở hạ tầng trên nhiều vị trí là cách bạn bảo vệ chống lại các thảm họa cục bộ.

**Cách AWS Tổ Chức Cơ Sở Hạ Tầng Của Nó**

AWS chia cơ sở hạ tầng toàn cầu của nó thành ba khái niệm lồng nhau. Hãy nghĩ về chúng như những con búp bê Nga, từ lớn nhất đến nhỏ nhất: một con búp bê lớn mở ra để lộ một con búp bê vừa, mở ra để lộ một con nhỏ. Mỗi lớp lồng bên trong lớp tiếp theo.

Con búp bê ngoài cùng là cái mà AWS gọi là **Region**. Bên trong một Region nằm một cụm **Availability Zone**. Và rải rác khắp nơi trên toàn cầu, độc lập với cả hai, là **Edge Location**.

Hãy mở từng cái.

**Region: Những Hộp Lớn**

Một **Region** là một khu vực địa lý nơi AWS có một cụm trung tâm dữ liệu. Mỗi Region được đặt tên theo vị trí của nó: `us-west-2` là Oregon, `us-east-1` là Bắc Virginia, `eu-west-1` là Ireland, `ap-southeast-1` là Singapore — nơi máy chủ của Leo đang ẩn náu.

Có gần 40 Region trên toàn thế giới, và AWS thêm nhiều hơn đều đặn. Danh sách tiếp tục tăng khi AWS mở rộng: có Region ở Bắc Mỹ, Nam Mỹ, Châu Âu, Trung Đông, Châu Á Thái Bình Dương, và Châu Phi. Mỗi Region mới thường công bố vài tháng trước khi mở, bao gồm ít nhất ba Availability Zone khi ra mắt, và mất vài năm trước khi tất cả các dịch vụ AWS có sẵn trong nó.

Mỗi Region hoàn toàn độc lập. Dữ liệu ở `us-west-2` ở lại trong `us-west-2` trừ khi bạn cố ý di chuyển nó. Điều này quan trọng đối với tuân thủ và khả năng phục hồi — một sự cố lớn ở một Region không tự động ảnh hưởng đến những Region khác. Một sự kiện làm gián đoạn lưới điện ở Bắc Virginia không ảnh hưởng đến Oregon. Một thảm họa thiên nhiên ở Ireland không ảnh hưởng đến Singapore. Các Region thực sự cách ly với nhau ở cấp cơ sở hạ tầng vật lý.

Sự độc lập hoàn chỉnh đến mức nếu một Region đang trải qua một sự cố lớn, ngay cả console quản lý AWS cũng có thể tải chậm — vì console tự nó chạy trong cơ sở hạ tầng AWS. Điều này đáng biết: trong một sự cố AWS thực sự, bạn có thể thấy khó truy cập các công cụ giám sát bạn cần chính xác khi bạn cần chúng nhất. Đây là một phần lý do tại sao các nhóm giàu kinh nghiệm giám sát các dịch vụ của riêng họ độc lập với console của AWS.

"Vậy chúng ta nên chọn `us-west-2` cho Nimbus?" Tom hỏi.

Đúng. Đối với một doanh nghiệp Hoa Kỳ nhắm tới khách hàng Bờ Tây, đúng. Độ trễ thấp hơn và người dùng của bạn nhận được phản hồi nhanh hơn.

"Nó đắt hơn Singapore bao nhiêu?" Tom thêm vào.

Giá thay đổi theo Region — thường là vài phần trăm. Lợi ích về hiệu năng và tuân thủ của Region đúng đáng với sự khác biệt giá nhỏ.

**Cuộc Tranh Luận Về Lựa Chọn Region Mà Nimbus Suýt Sai**

Trước khi nhóm chốt `us-west-2`, có một cuộc tranh luận ngắn về việc liệu `us-east-1` (Bắc Virginia) có hợp lý hơn không. Nó là Region lâu đời nhất, lớn nhất, nơi AWS phát hành dịch vụ mới đầu tiên. Nó cũng là Region rẻ nhất trên hầu hết các trang giá. Tom thích điều này.

"Nhưng người dùng của chúng ta ở California, Oregon, và Washington," Maya nói. "Tại sao chúng ta lại chạy máy chủ ở phía bên kia của đất nước?"

"Rẻ hơn," Tom nói. "Và nhiều dịch vụ có sẵn hơn."

"Khoan đã — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya nói. "Người dùng của chúng ta ở Bờ Tây. Máy chủ của chúng ta nên ở Bờ Tây. Sự khác biệt giá là bao nhiêu, sáu phần trăm? Bảy? Chúng ta sẽ chi nhiều hơn cho độ trễ thêm dưới dạng khách hàng mất hơn là chúng ta sẽ tiết kiệm trong hóa đơn tính toán."

Cô đúng. Region đúng cho một khối lượng công việc là Region gần nhất với những người dùng quan trọng nhất — trừ khi tuân thủ, tính khả dụng của dịch vụ, hoặc chênh lệch chi phí biện minh cho sự đánh đổi. Đối với Nimbus, không có cái nào trong số đó biện minh.

Đây là một quyết định cảm thấy nhỏ nhưng không phải. Các nhóm chọn `us-east-1` vì "nó là mặc định" rồi phục vụ người dùng Bờ Tây từ Bờ Đông đang để lại hiệu năng thực sự trên bàn. Console AWS mặc định là `us-east-1` vì lý do lịch sử. Nó không phải là một khuyến nghị.

**Availability Zone: Dự Phòng Thực Sự**

Đây là nơi nó trở nên thú vị.

Mỗi Region không phải là một trung tâm dữ liệu duy nhất. Nó là một cụm nhiều trung tâm dữ liệu tách biệt về vật lý gọi là **Availability Zone** (hay AZ).

Oregon (`us-west-2`) có bốn Availability Zone: `us-west-2a`, `us-west-2b`, `us-west-2c`, `us-west-2d`. Đây là những tòa nhà thật, cách nhau bởi những khoảng cách có ý nghĩa — đủ xa để một đám cháy, lũ lụt, hoặc mất điện ở một cái sẽ không ảnh hưởng đến những cái khác, nhưng đủ gần để mạng giữa chúng cực kỳ nhanh (độ trễ mili giây một chữ số).

Cách nhau bao xa là "khoảng cách có ý nghĩa"? AWS không công bố tọa độ chính xác, nhưng các nhà nghiên cứu độc lập ước tính các AZ trong một Region thường cách nhau hàng chục dặm — đủ xa để ở trên các lưới điện khác nhau và các đường cáp quang khác nhau, không quá xa đến mức tốc độ ánh sáng trở thành yếu tố giới hạn cho sao chép đồng bộ.

Sự tách biệt này là cố ý và quan trọng. Nếu hai AZ chia sẻ cùng một trạm biến áp, một sự cố trạm biến áp sẽ làm sập cả hai AZ đồng thời — loại bỏ dự phòng. Sự tách biệt vật lý đảm bảo rằng các lỗi chế độ chung (loại ảnh hưởng đến toàn bộ một khu vực địa lý) thực sự là những sự kiện hiếm chứ không phải rủi ro có thể lường trước.

Đây là kiến trúc làm cho AWS đáng tin cậy ở một mức độ mà không trung tâm dữ liệu đơn lẻ nào có thể sánh kịp.

Priya nghiêng người về phía trước. "Vậy nếu chúng ta chạy ứng dụng của mình trên hai Availability Zone và một cái sập—"

"Cái kia tiếp tục chạy," Maya kết thúc.

"Chính xác."

Leo, người đã lắng nghe trong im lặng: "Tôi đã triển khai mọi thứ trong một AZ."

"Đúng," Priya nói. "Chúng tôi đã nhận thấy."

Khái niệm trải rộng ứng dụng của bạn trên nhiều AZ — gọi là **triển khai Multi-AZ** — là một trong những mẫu phục hồi quan trọng nhất trong AWS. Chúng ta đi sâu vào nó ở Chương 18. Hiện tại, hãy hiểu rằng các AZ tồn tại đặc biệt để làm cho điều này khả thi.

Một sắc thái đáng biết: tên AZ (`us-west-2a`, `us-west-2b`, v.v.) không nhất quán trên các tài khoản AWS. Cái xuất hiện là `us-west-2a` trong tài khoản của bạn có thể là một trung tâm dữ liệu vật lý khác với cái xuất hiện là `us-west-2a` trong tài khoản của đồng nghiệp. AWS ngẫu nhiên hóa ánh xạ để ngăn tất cả khách hàng triển khai vào cùng một AZ vật lý khi họ mặc định là "a." Nếu bạn cần phối hợp AZ vật lý nào bạn đang ở với một tài khoản khác (cho giao tiếp giữa các tài khoản độ trễ thấp, chẳng hạn), AWS cung cấp AZ ID — các định danh ổn định ánh xạ tới cùng một vị trí vật lý trên các tài khoản. Các AZ được đặt tên (`2a`, `2b`) là tương đối theo tài khoản. Các AZ ID (`usw2-az1`, `usw2-az2`) là vật lý. Kỳ thi thỉnh thoảng kiểm tra sự phân biệt này.

**Một Sự Cố AZ Thực Sự Trông Như Thế Nào**

Đây không phải là trừu tượng. Hãy để tôi đi qua một dòng thời gian thực.

Bây giờ là 2:47 chiều thứ Ba. Một lỗi điện trong một trong các máy biến áp cung cấp điện cho `us-west-2b` gây ra một sự cố trong trung tâm dữ liệu đó. Sự kiện không được dự đoán.

Nếu Nimbus chạy hoàn toàn trong `us-west-2b`:
- 2:47 chiều: EC2 instance mất điện. Máy chủ cơ sở dữ liệu mất điện.
- 2:47 chiều: các yêu cầu đến ứng dụng Nimbus bắt đầu thất bại với timeout kết nối.
- 2:47 chiều: các cảnh báo giám sát của Tom kích hoạt.
- 2:50 chiều: Leo bắt đầu quá trình khôi phục. Anh khởi động một EC2 instance mới trong `us-west-2a`.
- 3:05 chiều: cơ sở dữ liệu trở lại trực tuyến từ khôi phục snapshot.
- 3:12 chiều: ứng dụng được cấu hình lại để trỏ vào endpoint cơ sở dữ liệu mới.
- 3:20 chiều: Nimbus phục vụ lưu lượng trở lại.

Đó là 33 phút ngừng hoạt động. Trong giờ phục vụ bữa tối thứ Sáu, 33 phút có thể tốn hàng nghìn đô la đơn hàng mất và loại thiệt hại danh tiếng không hiện ra trong báo cáo sự cố.

Nếu Nimbus chạy trên `us-west-2a` và `us-west-2b` với triển khai Multi-AZ đúng đắn:
- 2:47 chiều: EC2 instance trong `us-west-2b` mất điện.
- 2:47 chiều: Application Load Balancer phát hiện instance không khỏe qua kiểm tra sức khỏe.
- 2:47 chiều: ALB ngừng định tuyến lưu lượng đến instance bị lỗi, một cách tự động.
- 2:47 chiều: lưu lượng tiếp tục chảy đến instance trong `us-west-2a`.
- 2:48 chiều: Auto Scaling Group khởi động một instance thay thế.
- 2:55 chiều: instance thay thế vượt qua kiểm tra sức khỏe và tái gia nhập đội.

Ngừng hoạt động: bằng không. Tác động đến khách hàng: gần bằng không. Giám sát của Tom kích hoạt, nhưng hành động của Leo là "theo dõi và xác nhận khôi phục hoàn tất," không phải "xây dựng lại mọi thứ thủ công."

Đây là sự khác biệt giữa Multi-AZ và single-AZ. Ranh giới AZ là nơi thiết kế dự phòng của AWS trở thành khả năng phục hồi của ứng dụng của bạn.

**Phép Toán Độ Tin Cậy Multi-AZ**

AWS thiết kế mỗi AZ để độc lập — không chỉ về mặt vật lý, mà với điện, làm mát, và mạng riêng biệt. Xác suất hai AZ trong cùng một Region thất bại đồng thời được thiết kế để cực kỳ thấp.

Nếu một AZ đơn lẻ có tính khả dụng 99,9% (khoảng 8,7 giờ ngừng hoạt động mỗi năm), thì một kiến trúc hai AZ coi các lỗi là sự kiện độc lập có tính khả dụng khoảng 99,9999% cho cùng một chế độ lỗi — khoảng 31 giây ngừng hoạt động mỗi năm từ các lỗi AZ.

Trong thực tế, yếu tố giới hạn cho hầu hết các ứng dụng không phải là tính khả dụng AZ. Đó là mã ứng dụng, quá trình triển khai, và cơ sở dữ liệu. Nhưng phép toán minh họa tại sao Multi-AZ là chuẩn cơ sở: chi phí chạy trên hai AZ là khiêm tốn; cải thiện tính khả dụng là lớn.

**Edge Location: Tốc Độ, Khắp Mọi Nơi**

AZ giải quyết khả năng phục hồi. Chúng không giải quyết vấn đề phục vụ nội dung nhanh cho người dùng ở các thành phố xa Region chính của bạn.

Hãy gặp **Edge Location**.

Edge Location là các điểm cơ sở hạ tầng nhỏ, nhẹ — hơn 750 điểm hiện diện trải rộng trên hơn 100 thành phố trên toàn thế giới. Chúng không phải là trung tâm dữ liệu đầy đủ — chúng không thể chạy ứng dụng của bạn. Cái chúng *có thể* làm là lưu nội dung vào bộ nhớ đệm gần người dùng của bạn.

Hãy tưởng tượng một hình ảnh thực đơn được lưu trữ trên một máy chủ ở Virginia. Mỗi khi ai đó ở Tokyo muốn xem nó, yêu cầu di chuyển qua Thái Bình Dương và trở lại. Với Edge Location, AWS có thể lưu trữ một bản sao của tệp đó ở Tokyo và phục vụ nó cục bộ — mili giây thay vì hàng trăm mili giây.

Đây là xương sống của CloudFront, mạng phân phối nội dung của AWS. Chúng ta đào sâu vào CloudFront ở Chương 13. Hiện tại: Edge Location là về tốc độ cho nội dung tĩnh.

Bạn có thể đang tự hỏi: nếu Edge Location lưu nội dung vào bộ nhớ đệm, chúng có lưu trữ dữ liệu của bạn vĩnh viễn không? Không. Edge Location giữ các bản sao tạm thời của nội dung để phục vụ nó nhanh hơn — bản gốc luôn sống trong Region của bạn. Nếu bộ nhớ đệm hết hạn hoặc nội dung thay đổi, Edge Location lấy một bản sao mới từ nguồn.

Mạng Edge Location tách biệt với cấu trúc Region và AZ. Khi bạn nghĩ về nơi ứng dụng của bạn *chạy*, bạn nghĩ về Region và AZ. Khi bạn nghĩ về cách nội dung đến với người dùng của bạn *nhanh chóng*, bạn nghĩ về Edge Location và CloudFront. Chúng giải quyết các vấn đề khác nhau và hoạt động ở các lớp khác nhau.

AWS cũng có một khái niệm liên quan gọi là **Regional Edge Cache** — các nút bộ nhớ đệm lớn hơn nằm giữa Region của bạn và các Edge Location. Nếu một Edge Location trong một thành phố không có bản sao đã lưu của một tệp, nó lấy từ Regional Edge Cache thay vì đi tận về Region của bạn. Điều này giảm tải trên nguồn gốc của bạn và cải thiện tỷ lệ trúng bộ nhớ đệm cho nội dung ít phổ biến hơn. Bạn không cấu hình Regional Edge Cache trực tiếp — chúng là một phần của cơ sở hạ tầng CloudFront hoạt động tự động.

Kết quả thực tế cho Nimbus: khi nhóm thêm CloudFront ở Chương 13, các hình ảnh thực đơn từng di chuyển từ Oregon đến trình duyệt của khách hàng trên mỗi yêu cầu sẽ thay vào đó được phục vụ từ Edge Location gần nhất — Dallas cho khách hàng Texas, Atlanta cho khách hàng Georgia, Chicago cho khách hàng Illinois. Người dùng ở Chicago nhận hình ảnh thực đơn của họ từ một máy chủ cách 300 dặm thay vì 2.000 dặm. Sự khác biệt có thể đo được và có ý nghĩa.

**Một Lưu Ý Về Các Bản Sao Đã Lưu**

Có một chi tiết về Edge Location đáng đánh dấu bây giờ, mặc dù câu chuyện đầy đủ thuộc về Chương 13: một bản sao đã lưu là một *bản sao*, và các bản sao có thể trở nên cũ. Nếu bản gốc thay đổi trong Region của bạn, Edge Location có thể tiếp tục phục vụ phiên bản cũ trong một thời gian. Bao lâu, và bạn có thể làm gì về nó, chính là loại điều khiển mà một CDN cho bạn — và chính là cái nhóm sẽ vật lộn với khi Nimbus thực sự triển khai CloudFront. Hiện tại, chỉ mang theo điều này: nội dung có thể sống gần người dùng, và "gần" đôi khi có nghĩa là "hơi lỗi thời."

**Chọn Một Region: Danh Sách Kiểm Tra Của Kỹ Sư Cấp Cao**

Nếu một ngày nào đó Nimbus mở rộng để phục vụ người dùng ở Mexico và Colombia — một tình huống chúng ta sẽ luyện tập trong các bài tập của chương này — quyết định Region không phải tùy tiện. Đây là cách suy nghĩ:

**1. Người dùng của bạn ở đâu?**

Bắt đầu từ đây. Chọn Region gần nhất với đa số người dùng của bạn. Độ trễ là tác động trực tiếp nhất, có thể đo được nhất của lựa chọn Region.

Khoảng cách vật lý giữa một người dùng và một máy chủ quan trọng theo cách dễ bị đánh giá thấp. Một chuyến khứ hồi 170ms đến Singapore so với một chuyến khứ hồi 20ms đến Oregon không phải là một chỉ số hiệu năng trừu tượng — đó là sự khác biệt giữa một trang cảm thấy tức thì và một trang cảm thấy chậm chạp. Trên một thiết bị di động với độ trễ vô tuyến bổ sung, hình phạt Singapore tăng thêm. Đối với một người dùng ở San Jose, `us-west-2` (Oregon) là Region đúng trước cả khi bạn xem xét bất kỳ yếu tố nào khác.

**2. Có yêu cầu tuân thủ không?**

Khối lượng công việc y tế, tài chính, và chính phủ thường có quy tắc nghiêm ngặt về cư trú dữ liệu. Hãy biết môi trường quy định của bạn trước khi chọn. GDPR yêu cầu dữ liệu cá nhân từ cư dân EU được lưu trữ trong các khu vực pháp lý có bảo vệ dữ liệu đầy đủ — hoặc chính EU hoặc một quốc gia với quyết định đầy đủ. HIPAA yêu cầu các biện pháp bảo vệ được ghi chép cho dữ liệu y tế Hoa Kỳ. Đây không phải là những cân nhắc tùy chọn để xem lại sau.

Trong thực tế: nói chuyện với nhóm pháp lý của bạn trước khi chọn một Region cho bất kỳ khối lượng công việc được quản lý nào. AWS duy trì tài liệu tuân thủ rộng rãi cho mỗi Region, bao gồm các chứng nhận như SOC 2, ISO 27001, PCI DSS, và đủ điều kiện HIPAA. Nhưng các chứng nhận cho bạn biết AWS đã làm gì; nhóm pháp lý của bạn cho bạn biết liệu điều đó có đủ cho bối cảnh quy định cụ thể của bạn hay không.

**3. Bạn cần những dịch vụ nào?**

Không phải mọi dịch vụ AWS đều có sẵn ở mọi Region. Các dịch vụ mới ra mắt ở `us-east-1` đầu tiên. Nếu bạn cần một dịch vụ cụ thể, hãy xác minh Region mục tiêu của bạn hỗ trợ nó.

Đây ít là mối lo đối với các dịch vụ trong cuốn sách này — tất cả các dịch vụ chính đều có sẵn rộng rãi — nhưng quan trọng đối với các dịch vụ mới hơn, phần cứng chuyên dụng (một số loại instance GPU chỉ tồn tại ở một số Region nhất định), và AWS GovCloud (một Region riêng biệt được thiết kế cho khối lượng công việc của chính phủ Hoa Kỳ với các yêu cầu quy định cụ thể).

**4. Giá là bao nhiêu?**

Các Region khác nhau về giá. `us-east-1` (Bắc Virginia) có xu hướng rẻ nhất vì quy mô và tuổi của nó. Nam Mỹ hơi đắt hơn. Kiểm tra trang giá AWS trước khi hoàn thiện.

Chênh lệch giá thường nhỏ — vài đến mười phần trăm giữa các Region phổ biến. Nó hiếm khi là yếu tố quyết định. Nhưng đối với một khối lượng công việc nhạy cảm với chi phí chạy hàng nghìn instance, ngay cả sự khác biệt giá 5% cũng tích lũy theo thời gian. Tom sẽ kiểm tra con số và tính nó vào, như Tom kiểm tra tất cả các con số và tính chúng vào.

**5. Bạn có cần multi-Region không?**

Đối với hầu hết các ứng dụng, nhiều AZ trong một Region là đủ khả năng phục hồi. Đối với các ứng dụng quan trọng nơi ngay cả một sự cố cấp khu vực cũng không thể chấp nhận, bạn thiết kế cho multi-Region — nhưng đó là một cam kết kiến trúc đáng kể. Đừng làm nó một cách suy đoán.

"Quy tắc cho khi nào chúng ta thêm một Region thứ hai là gì?" Leo hỏi.

"Khi chúng ta có một yêu cầu được ghi chép nói rằng 'phải duy trì hoạt động nếu toàn bộ một AWS Region không khả dụng,'" Priya nói. "Không phải 'sẽ tốt nếu.' Một yêu cầu cụ thể, với một biện minh kinh doanh cụ thể, mà chúng ta đã cân nhắc so với độ phức tạp và chi phí."

"Điều đó trông như thế nào trong thực tế?"

"Một hợp đồng khách hàng với SLA yêu cầu thời gian hoạt động 99,99%. Một bắt buộc quy định về dự phòng địa lý. Một tình huống mất Region mà chúng ta thực sự có thể định lượng về mặt doanh thu. Không chỉ 'điều gì xảy ra nếu us-west-2 sập.'"

Leo nhìn vào kiến trúc Nimbus hiện tại. Họ vẫn ở một AZ.

"Multi-AZ trước," anh nói.

"Multi-AZ trước," Priya xác nhận.

**Hạn Chế Không Ai Nói Về**

Region mạnh mẽ, nhưng chúng tạo ra một căng thẳng quan trọng.

Chạy ở nhiều Region thực sự khó.

Sao chép dữ liệu giữa các Region có độ trễ. Giữ hai Region đồng bộ — để một giao dịch ở Region A ngay lập tức hiển thị ở Region B — là một trong những vấn đề khó nhất trong các hệ thống phân tán. AWS cung cấp công cụ cho nó, nhưng nó tốn tiền và thêm độ phức tạp vận hành.

Hầu hết các ứng dụng nên bắt đầu với một Region, nhiều AZ, và mở rộng sang multi-Region chỉ khi chúng có một yêu cầu rõ ràng: bắt buộc quy định, SLA hợp đồng yêu cầu thời gian ngừng hoạt động khu vực gần bằng không, hoặc một cơ sở người dùng thực sự phân tán trên các châu lục.

Sao chép dữ liệu trên các region thêm chi phí — truyền dữ liệu giữa các region là một trong những mục bị đánh giá thấp nhất trên hóa đơn AWS. Nó cũng thêm độ phức tạp vận hành: mỗi lần ghi phải nhất quán trên các region thêm độ trễ.

Hầu hết các lỗi ảnh hưởng đến các ứng dụng thực không phải là thảm họa giữa các region. Chúng là các vấn đề trong cùng một region như một security group cấu hình sai hoặc một triển khai hỏng. Tình huống kịch tính "toàn bộ region sập" lên tiêu đề chính xác vì nó hiếm. Đầu tư vào multi-AZ trước multi-region. Thêm multi-region khi trường hợp kinh doanh rõ ràng.

Để đặt con số cụ thể vào nó: AWS đã có một số nhỏ các sự kiện single-region đáng kể trong lịch sử của nó. Các sự cố region đầy đủ thực sự không phổ biến. Các sự kiện cấp AZ — các sự cố ngắn ảnh hưởng đến một trung tâm dữ liệu trong một region — ít hiếm hơn và chính là cái mà triển khai Multi-AZ được thiết kế để hấp thụ. Tần suất các sự kiện AZ so với các sự kiện region cao hơn khoảng một bậc độ lớn. Chi tiêu nỗ lực kiến trúc vào chế độ lỗi phổ biến hơn trước là lựa chọn hợp lý.

Kiến trúc multi-Region sớm là một trong những sai lầm phổ biến nhất và tốn kém nhất mà các kỹ sư cấp thấp mắc phải khi họ bắt đầu cảm thấy tự tin.

Tom gật đầu. "Vậy chúng ta không làm multi-Region chỉ vì chúng ta có thể."

"Không cho đến khi chúng ta cần," Maya nói. "Và chúng ta sẽ biết khi nào chúng ta cần."

"Làm sao chúng ta sẽ biết?" Leo hỏi.

"Khi tài liệu rà soát kiến trúc của bạn có một yêu cầu nói 'phải sống sót qua một sự cố khu vực,'" Priya nói. "Chúng ta đã nghĩ về chuyện gì xảy ra nếu toàn bộ một AZ sập trước cả khi chúng ta thiết lập Multi-AZ chưa? Chúng ta nên sửa cái đó trước. Cho đến lúc đó: multi-AZ."

Bạn có thể đang tự hỏi: làm sao bạn xác minh rằng triển khai Multi-AZ của bạn thực sự hoạt động trước khi bạn cần nó? Bạn kiểm tra nó. AWS cung cấp một công cụ gọi là **AWS Fault Injection Service (FIS)** — trước đây là Fault Injection Simulator — có thể mô phỏng các lỗi AZ, chấm dứt instance, và các điều kiện lỗi khác chống lại kiến trúc đang chạy của bạn — để bạn có thể quan sát cách hệ thống của bạn hoạt động dưới các điều kiện lỗi theo cách được kiểm soát, thay vì khám phá hành vi trong một sự cố thực tế. Kiểm tra kiến trúc khả năng phục hồi của bạn cũng quan trọng như xây dựng nó. Priya đặt "kiểm tra fault injection" vào lịch rà soát kiến trúc hàng quý ngay sau khi đọc về nó.

## Khi AWS Đến Với Bạn: Outposts Và Wavelength

Region và Availability Zone bao phủ thế giới — nhưng không phải mọi vấn đề đều được giải quyết bằng cách di chuyển dữ liệu sang AWS. Một số khối lượng công việc phải ở lại on-premises: các hệ thống sàn sản xuất cần độ trễ dưới mili giây, các ứng dụng y tế với yêu cầu cư trú dữ liệu, các hệ thống điểm bán hàng bán lẻ trong các cửa hàng không có internet đáng tin cậy. Đối với những cái này, AWS mở rộng cơ sở hạ tầng của nó đến vị trí của khách hàng.

"Khoan đã — nếu cuối cùng chúng ta làm việc với một hệ thống bệnh viện thì sao?" Priya hỏi. "Phần mềm giám sát bệnh nhân của họ thực sự không thể chịu được một chuyến khứ hồi đám mây. Và nó có thể không hợp pháp được phép rời khỏi tòa nhà."

Maya mở tài liệu AWS. Hai dịch vụ tiếp tục xuất hiện.

**AWS Outposts**

Một rack phần cứng AWS được quản lý hoàn toàn được lắp đặt trong trung tâm dữ liệu của riêng bạn hoặc cơ sở co-location. Outposts chạy cùng cơ sở hạ tầng, dịch vụ, API, và công cụ AWS như đám mây AWS — EC2, EBS, RDS, EKS, S3 trên Outposts — nhưng về mặt vật lý trong tòa nhà của bạn.

Trường hợp sử dụng: khối lượng công việc sản xuất nhạy cảm với độ trễ, yêu cầu cư trú dữ liệu nơi dữ liệu phải ở lại về mặt vật lý ở một vị trí cụ thể, các ứng dụng cần API AWS nhưng không thể chịu được khoảng trống kết nối đến đám mây công cộng.

Điểm chính: Outposts vẫn được quản lý bởi AWS. AWS lắp đặt nó, vá nó, và giám sát nó. Bạn sở hữu không gian rack và điện. Các API và công cụ giống hệt với đám mây công cộng — cùng các template CloudFormation, cùng các chính sách IAM, cùng các lệnh CLI. Sự phân biệt trong kỳ thi là vị trí vật lý, không phải mô hình vận hành.

"Vậy nó là AWS, nhưng trong tòa nhà của khách hàng của chúng ta," Leo nói.

"Chính xác," Maya nói. "Cùng API. Mã zip khác nhau."

**AWS Wavelength**

Cơ sở hạ tầng AWS được triển khai bên trong mạng 5G của các nhà cung cấp viễn thông. Wavelength Zone nằm ở rìa của các mạng 5G, gần về mặt vật lý với người dùng di động, cho phép độ trễ mili giây một chữ số cho các ứng dụng di động.

Trường hợp sử dụng: chơi game thời gian thực, AR/VR, đo từ xa xe tự lái, xử lý video trực tiếp ở rìa 5G.

"Cái đó không dành cho một bệnh viện," Tom nói. "Đó dành cho ai đó đang xây dựng thế hệ tiếp theo của trò chơi di động nhiều người chơi."

"Hoặc đo từ xa xe tự lái," Priya nói. "Bất cứ thứ gì mà một thiết bị di động cần nói chuyện với một máy chủ và 50 mili giây là quá chậm."

**Sự khác biệt:** Outposts mang AWS đến trung tâm dữ liệu của bạn — tòa nhà của bạn, rack của bạn, điện của bạn. Wavelength mang AWS đến rìa mạng viễn thông — đặt cùng vị trí về mặt vật lý với cơ sở hạ tầng vô tuyến 5G, gần với người dùng di động không bao giờ chạm vào mạng riêng của bạn.

**AWS Local Zones**

Có một anh em thứ ba trong gia đình này — và trong kỳ thi, nó là cái được kiểm tra thường xuyên nhất trong ba cái. **Local Zone** là cơ sở hạ tầng AWS được triển khai ở các khu vực đô thị lớn không có một Region đầy đủ — Los Angeles, Houston, Miami, Lagos, và hàng chục cái nữa. Một Local Zone là một phần mở rộng của một Region cha: bạn chạy EC2, EBS, và một tập con của các dịch vụ khác *trong chính khu vực đô thị đó*, nhận độ trễ mili giây một chữ số đến người dùng trong thành phố đó, trong khi mọi thứ khác (và tất cả quản lý) ở lại trong Region cha.

Mẫu để ghi nhớ — ba anh em "edge compute", ba kích hoạt:

- "Độ trễ mili giây một chữ số đến người dùng cuối **ở một thành phố/khu vực đô thị cụ thể**" → **Local Zones**
- "Độ trễ siêu thấp cho **thiết bị di động 5G**" → **Wavelength**
- "Các dịch vụ AWS chạy **trong trung tâm dữ liệu của riêng chúng ta** / dữ liệu phải ở lại on-premises" → **Outposts**

Không cái nào trong ba cái là câu trả lời cho một ứng dụng web điển hình. Tất cả chúng xuất hiện trong kỳ thi SAA-C03 như các bẫy khớp mẫu: cụm từ kích hoạt quan trọng.

## Điểm Mạnh Và Hạn Chế

**Sử dụng thiết kế multi-region và multi-AZ khi**: ứng dụng của bạn có người dùng ở nhiều khu vực địa lý và độ trễ quan trọng; SLA của bạn yêu cầu tính khả dụng 99,99% hoặc cao hơn; các yêu cầu quy định bắt buộc cư trú dữ liệu ở các region cụ thể; bạn cần khôi phục thảm họa với RTO dưới một giờ.

**Các sự đánh đổi là thực**: Chạy ở nhiều Region cho bạn dự phòng chống lại các sự cố khu vực — nhưng với chi phí và độ phức tạp đáng kể.

Hãy nhớ cảnh báo về chi phí từ phần trước của chương này: mỗi byte di chuyển giữa các region tốn tiền. Trong một thiết lập multi-region active-active nơi các lần ghi phải nhất quán, bạn đang trả chi phí đó liên tục.

Độ phức tạp vận hành cũng tăng theo. Gỡ lỗi một sự cố trong một region khó. Gỡ lỗi một sự cố phân tán, giữa các region — nơi cùng một yêu cầu chạm vào cơ sở hạ tầng ở hai châu lục — là một loại khó hoàn toàn khác.

**Tiến trình đúng cho hầu hết các ứng dụng**: Bắt đầu với một Region đơn lẻ và nhiều AZ. Điều đó cho bạn khả năng phục hồi chống lại các lỗi thực sự xảy ra — các sự cố cấp AZ, lỗi phần cứng, sự kiện điện — với một phần nhỏ độ phức tạp của một kiến trúc multi-region. Thêm multi-region khi một yêu cầu cụ thể, được ghi chép làm cho nó cần thiết. Không sớm hơn.

Mẫu phổ biến cho các nhóm nhảy sang multi-region quá sớm: độ phức tạp của việc quản lý hai region giới thiệu các chế độ lỗi của riêng nó — lỗi đồng bộ dữ liệu, tình huống split-brain, triển khai không nhất quán. Chính kiến trúc khả năng phục hồi được thiết kế để ngăn lỗi đôi khi giới thiệu các loại lỗi mới mà sẽ không tồn tại trong một thiết kế đơn giản hơn.

Priya có một tài liệu cô gọi là "ngân sách độ phức tạp." Ý tưởng: mọi quyết định kiến trúc thêm độ phức tạp vận hành đều có chi phí, và tổ chức có một năng lực hữu hạn để quản lý độ phức tạp đó. Chi tiêu ngân sách độ phức tạp vào kiến trúc multi-region trước khi bạn đã thành thạo độ tin cậy single-region là một khoản đầu tư tồi. Độ phức tạp nên hướng tới các chế độ lỗi bạn thực sự đối mặt, không phải những cái tạo ra các câu chuyện khôi phục thảm họa hay.

"Chúng ta có một region, một AZ, và một quá trình triển khai làm Leo lo lắng mỗi lần anh chạy nó," Priya nói. "Bước tiếp theo đúng là multi-AZ, không phải multi-region."

Tom viết "ngân sách độ phức tạp" trong cuốn sổ tay của mình. Anh sẽ dùng cụm từ đó đều đặn trong hai năm tới.

## Tóm Tắt

Sự cố Singapore của Leo hóa ra là một bài học hữu ích — không phải vì nó gây thiệt hại lâu dài, mà vì nó buộc nhóm hiểu một điều thường bị bỏ qua: nơi cơ sở hạ tầng của bạn chạy không phải là một quyết định mang tính thẩm mỹ. Vật lý không thể thương lượng. Một trăm bảy mươi mili giây độ trễ cơ bản cho mỗi chuyến khứ hồi là sự khác biệt giữa một sản phẩm nhanh và một sản phẩm chậm chạp, và các quy tắc tuân thủ về nơi dữ liệu sống không quan tâm bạn đã di chuyển nhanh đến đâu.

- AWS tổ chức cơ sở hạ tầng toàn cầu của nó thành **Region**, **Availability Zone**, và **Edge Location**.
- Một **Region** là một cụm trung tâm dữ liệu địa lý. Mỗi Region được cách ly — dữ liệu ở lại trong Region trừ khi bạn cố ý di chuyển nó.
- **Availability Zone** là các trung tâm dữ liệu tách biệt về vật lý trong một Region, được kết nối bằng mạng độ trễ thấp. Triển khai trên nhiều AZ là cách chuẩn để sống sót qua các lỗi cục bộ.
- Chọn Region của bạn dựa trên vị trí người dùng, yêu cầu tuân thủ, tính khả dụng của dịch vụ, và giá — theo thứ tự đó.
- Multi-AZ là chuẩn cơ sở khả năng phục hồi. Multi-Region dành cho các khối lượng công việc quan trọng với các yêu cầu cụ thể, được ghi chép — không phải một điểm khởi đầu mặc định.

## Mẹo Thi

*SAA-C03 Domain 1 — Task 1.1 / Domain 2 — Task 2.2*

- **Region được cách ly theo mặc định.** Dữ liệu không sao chép giữa các Region trừ khi
  bạn cấu hình nó. Điều này quan trọng cho các tình huống chủ quyền dữ liệu và tuân thủ.
- **AZ là đơn vị khả năng phục hồi cho hầu hết các câu hỏi.** Khi kỳ thi hỏi cách sống sót
  qua một sự cố trung tâm dữ liệu, câu trả lời liên quan đến nhiều AZ trong một Region.
- **Multi-Region dành cho khả năng phục hồi sự cố khu vực.** Nếu tình huống nói "phải duy trì
  hoạt động ngay cả khi toàn bộ một AWS Region thất bại," câu trả lời liên quan đến kiến trúc
  multi-Region.
- **Edge Location ≠ AZ.** Edge Location lưu nội dung vào bộ nhớ đệm — chúng không thể chạy
  máy chủ ứng dụng của bạn. Đừng nhầm lẫn chúng với trung tâm dữ liệu.
- Kỳ thi thường xuyên kiểm tra mối quan hệ giữa tuân thủ và lựa chọn Region.
  Nếu một tình huống đề cập đến yêu cầu cư trú dữ liệu, lựa chọn Region là một phần của câu trả lời.
- Các tình huống **GDPR và cư trú dữ liệu** trong kỳ thi thường chỉ ra việc giữ dữ liệu trong một Region cụ thể và đảm bảo sao chép giữa các region bị tắt hoặc được kiểm soát.
- **Outposts so với Wavelength so với Local Zones:** Outposts = rack AWS trong trung tâm dữ liệu của bạn (on-premises, cư trú dữ liệu, độ trễ cục bộ). Wavelength = AWS trong rìa mạng 5G (người dùng di động, độ trễ siêu thấp). Local Zones = tính toán AWS trong một khu vực đô thị không có một Region đầy đủ. Kích hoạt thi: "chạy AWS trong cơ sở của riêng bạn" → Outposts. "Độ trễ siêu thấp cho người dùng di động 5G" → Wavelength. "Độ trễ mili giây một chữ số đến người dùng ở một thành phố cụ thể" → Local Zones.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của bạn: sự khác biệt giữa một Region và một Availability Zone là gì?
Tại sao sự phân biệt đó quan trọng khi thiết kế một ứng dụng web có khả năng phục hồi?

*(Gợi ý: Nghĩ về hai loại lỗi khác nhau mà mỗi cái bảo vệ chống lại.)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty y tế Hoa Kỳ phải lưu trữ tất cả dữ liệu bệnh nhân trong một AWS
Region duy nhất để tuân thủ các chính sách cư trú dữ liệu nội bộ. Họ đang thiết kế một ứng dụng
đám mây mới ở Bờ Tây và muốn tối đa hóa khả năng phục hồi mà không di chuyển dữ liệu sang
một Region khác.

Cấu hình nào đáp ứng TỐT NHẤT yêu cầu của họ?

A) Triển khai ở `us-east-1` và sử dụng CloudFront Edge Location ở Oregon để phục vụ nội dung
   nhanh hơn  
B) Triển khai ở `us-west-2` trong một Availability Zone duy nhất để giảm thiểu chi phí  
C) Triển khai ở nhiều Region bao gồm `us-west-2` và `us-east-1` với sao chép dữ liệu
   giữa các Region  
D) Triển khai ở `us-west-2` (Oregon) trên nhiều Availability Zone

**Gợi ý 1**: Chính sách có nghĩa là dữ liệu phải ở lại trong một Region duy nhất. Lựa chọn nào
di chuyển dữ liệu sang một Region khác?

**Gợi ý 2**: Trong số các lựa chọn giữ dữ liệu ở `us-west-2`, cái nào cung cấp khả năng phục hồi nhất?

**Gợi ý 3**: Nhiều AZ trong một Region duy nhất cung cấp khả năng phục hồi mà không vượt qua
ranh giới Region.

**Đáp án**: D

**Giải thích**: `us-west-2` giữ tất cả dữ liệu trong một Region duy nhất, thỏa mãn yêu cầu
chính sách. Triển khai trên nhiều AZ trong Region đó bảo vệ chống lại
các sự cố trung tâm dữ liệu mà không di chuyển dữ liệu sang một Region khác. Đây là sự cân bằng đúng
giữa tuân thủ và khả năng phục hồi.

**Tại sao không A?** Lựa chọn A triển khai ở `us-east-1`, xa người dùng Bờ Tây — và
CloudFront sẽ lưu nội dung kề-bệnh-nhân vào bộ nhớ đệm ở các Edge Location bên ngoài Region được chọn,
vi phạm chính sách cư trú.

**Tại sao không B?** Một AZ duy nhất không có khả năng phục hồi. Nếu AZ đó trải qua một sự cố,
ứng dụng thất bại hoàn toàn.

**Tại sao không C?** Sao chép sang `us-east-1` di chuyển dữ liệu bệnh nhân sang Bờ Đông,
trực tiếp vi phạm yêu cầu single-Region.

*SAA-C03 Domain 1 — Task 1.1 (cơ sở hạ tầng toàn cầu, chủ quyền dữ liệu)*

**Bài tập 3 — Thách thức kiến trúc** *(Tùy chọn)*

Nimbus đang mở rộng để phục vụ khách hàng ở Mexico và Colombia. Hiện tại mọi thứ
chạy ở `us-west-2`. Nhóm đang tranh luận: họ có nên thêm một Region thứ hai `us-east-1`,
hay ở lại single-Region với nhiều AZ?

Bạn sẽ hỏi những câu hỏi nào trước khi quyết định? Những chi phí và rủi ro chính của việc
thêm một Region thứ hai là gì? Chi phí chính của việc *không* thêm một cái là gì?

*(Không có câu trả lời đúng duy nhất. Luyện tập lập luận sự đánh đổi multi-Region.)*

## Cảnh Sau Tín Dụng

Leo sửa vấn đề Singapore. Nimbus chuyển sang `us-west-2`. Độ trễ giảm.
Câu hỏi theo dõi duy nhất của Tom — "điều đó có thay đổi hóa đơn của chúng ta không?" — được trả lời bằng một
con số hơi cao hơn, mà anh chấp nhận với sự miễn cưỡng có thể thấy được.

Điều đó kéo dài hai ngày trước vấn đề tiếp theo.

Leo đến buổi standup với biểu cảm mà Maya đã học cách nhận ra: cái nhìn của
ai đó đã làm điều gì đó họ không thể hoàn tác.

"Vậy," anh nói cẩn thận. "Tôi đã thiết lập máy chủ. Và tôi cần một cách để đăng nhập.
Vậy nên tôi đã tạo một tên người dùng."

"Và?" Priya hỏi.

"'Admin'."

Im lặng.

"Và mật khẩu?"

Một sự im lặng dài hơn.

"'Admin123'."

Priya đứng dậy.

Chương tiếp theo: cách Nimbus kiểm soát ai có thể chạm vào cái gì — và chuyện gì xảy ra khi họ làm sai.
