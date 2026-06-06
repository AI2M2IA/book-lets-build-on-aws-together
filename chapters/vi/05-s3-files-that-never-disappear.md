# Chương 5: Tủ Hồ Sơ Sống Trong Đám Mây

Leo đang dọn dẹp EC2 instance lúc chín giờ sáng khi anh tìm thấy thư mục.

Văn phòng yên tĩnh. Maya chưa đến. Cà phê vẫn đang pha. Bên ngoài cửa sổ, những người đi làm sớm đang lác đác đi qua. Leo cắm tai nghe và đang cuộn qua các thư mục khi anh dừng lại.

Tám trăm tệp. Tất cả chúng đều là ảnh thực đơn. Tất cả chúng đều trên một máy duy nhất không có bản sao lưu.

EC2 instance nơi ứng dụng Nimbus chạy đã được nâng cấp một lần kể từ sự cố mười hai phút, nhưng lưu trữ ảnh chưa bao giờ di chuyển. Mỗi bánh arepa giòn, mỗi đĩa cá hồi nướng, mỗi tô salad bày biện hoàn hảo — ngồi trên một máy ảo duy nhất mà họ đã chứng minh có thể sập mà không báo trước.

Và nếu máy đó có bao giờ bị khởi động lại, định cỡ lại, hoặc thay thế?

Biến mất.

"Cho đến nay khách hàng đã tải lên bao nhiêu ảnh?" Maya hỏi, khi cô đến.

Leo quay lại. "Khoảng tám trăm."

"Và chuyện gì xảy ra với tám trăm ảnh đó nếu chúng ta khởi động lại máy chủ?"

Một trong những khoảng dừng đầy ý nghĩa khác của Leo.

Chương này nói về nơi các tệp thực sự thuộc về trong đám mây.

**Vấn Đề Với Việc Lưu Trữ Tệp "Trên Máy Chủ"**

Khi bạn lưu trữ tệp trực tiếp trên một EC2 instance — bên trong hệ thống tệp của nó — bạn đang buộc các tệp đó vào vòng đời của máy cụ thể đó.

Điều này tạo ra một số vấn đề:

**Tạm thời theo bản chất.** Các EC2 instance có thể bị dừng, chấm dứt, thay thế. Đĩa cục bộ của chúng không có nghĩa là vĩnh viễn. Đó là không gian nháp tạm thời.

**Điểm lỗi đơn lẻ.** Nếu instance thất bại, các tệp đi cùng nó. Không dự phòng. Không sao lưu. Một buổi sáng tồi tệ và tám trăm ảnh thực đơn biến mất.

**Không thể chia sẻ giữa các instance.** Khi bạn thêm một máy chủ thứ hai (mà bạn sẽ làm, ở Chương 7), nó sẽ không thấy các tệp được lưu trên đĩa của máy chủ thứ nhất. Hai máy chủ bị cô lập. Một người dùng tải lên một ảnh có thể thấy nó; một người dùng khác truy cập một máy chủ khác có thể không.

**Không quy mô.** Không gian đĩa EC2 hữu hạn. Nếu bạn làm đầy nó, bạn hoặc ngừng chấp nhận tải lên hoặc loay hoay mở rộng lưu trữ dưới áp lực.

Leo đã không xem xét chuyện gì xảy ra với nhiều máy chủ. Anh đề cập đến nó một cách thoải mái với Priya.

"Khoan đã — vấn đề ảnh sẽ hoạt động như thế nào với hai máy chủ?" Priya hỏi.

"Ý bạn là gì?"

"Nếu chúng ta có Máy chủ A và Máy chủ B đằng sau một bộ cân bằng tải," Priya nói, "và một khách hàng tải lên một ảnh — yêu cầu của họ đi đến Máy chủ A, đúng không? Vậy ảnh được lưu trên đĩa của Máy chủ A. Bây giờ yêu cầu tiếp theo của họ đi đến Máy chủ B. Máy chủ B không có ảnh. Khách hàng thấy gì?"

Leo mở miệng. Rồi đóng lại.

"Một hình ảnh bị hỏng," anh cuối cùng nói.

"Hoặc một lỗi 404," Priya nói. "Hoặc, nếu ứng dụng cố tải nó và sập, một trang lỗi."

Cô phác thảo kế hoạch bộ cân bằng tải lên bảng trắng — thêm một máy chủ thứ hai đã có trong lộ trình. Khoảnh khắc nó xảy ra, mỗi lần tải ảnh lên sẽ trở thành một lần tung đồng xu: tải lên Máy chủ A, có thể được phục vụ từ Máy chủ B, ảnh bị thiếu, khách hàng bối rối.

"Chúng ta sẽ đã gỡ lỗi nó trong một tuần trước khi tìm ra điều gì sai," Leo nói.

"Chúng ta đã nghĩ về chuyện gì xảy ra khi chúng ta bật Auto Scaling và đột nhiên có ba hoặc bốn máy chủ chưa?" Priya hỏi. "Chúng ta sẽ thiếu ảnh liên tục."

Đây là một loại lỗi không hiện ra trong các bài kiểm tra đơn vị. Nó chỉ xuất hiện trong production, dưới tải, khi lưu lượng thực được trải ra trên nhiều máy chủ. Cách sửa là ngừng lưu trữ tệp trên các máy chủ hoàn toàn.

Có một mô hình tốt hơn. AWS đã xây dựng nó vào năm 2006, và nó vẫn là một trong những dịch vụ đám mây được sử dụng rộng rãi nhất trên thế giới.

**Ổ Cứng Sống Trực Tuyến**

Hãy hình dung một ổ cứng sống trên internet — một cái mở rộng để chứa nhiều như bạn từng cần, và chỉ tính phí bạn cho những gì bạn thực sự sử dụng. Bạn không bao giờ cấp phát nó. Bạn không bao giờ lo lắng về việc hết không gian. Nếu bạn đặt tám trăm ảnh vào hôm nay và tám triệu vào năm sau, không có gì thay đổi về phía bạn ngoại trừ mục hóa đơn.

Đó là những gì AWS cung cấp. Họ gọi nó là **Amazon S3** — Simple Storage Service.

S3 là dịch vụ lưu trữ đối tượng của AWS. Nó không hoàn toàn giống một hệ thống tệp, và không hoàn toàn giống một cơ sở dữ liệu. Nó lưu trữ tệp — gọi là đối tượng — trong các container được đặt tên gọi là bucket. Mô hình đơn giản, và sự đơn giản đó là điểm mấu chốt.

Khái niệm chính trong S3 là **đối tượng** (object).

Một đối tượng là bất kỳ tệp nào: một ảnh, một video, một PDF, một CSV, một bản sao lưu, một tệp nhật ký. S3 không quan tâm đến loại hoặc cấu trúc. Nó lưu trữ byte và trả lại chúng khi bạn hỏi.

Các đối tượng sống bên trong **bucket**. Một bucket giống như một thư mục cấp cao nhất — một container được đặt tên trong S3 chứa các đối tượng của bạn. Mỗi bucket có một tên duy nhất toàn cầu (không hai bucket nào trên tất cả các tài khoản AWS có thể chia sẻ một tên) và tồn tại ở một Region cụ thể.

**Cách S3 Hoạt Động**

Bạn **tải lên** một đối tượng vào một bucket. S3 cho nó một **key** — về cơ bản là một tên đường dẫn như `menus/restaurant-001/photo-arepa.jpg`. Key đó xác định duy nhất đối tượng trong bucket.

Bạn **tải xuống** (hoặc lấy) đối tượng bằng cách sử dụng tên bucket và key.

Bạn cũng có thể làm các đối tượng có thể truy cập công khai — có nghĩa là bất kỳ ai có URL đều có thể tải xuống chúng. Đây là cách hầu hết các website phục vụ hình ảnh: lưu trữ hình ảnh trong S3, làm nó công khai, nhúng URL vào HTML của bạn.

Hoặc bạn giữ các đối tượng riêng tư — chỉ có thể truy cập đối với các yêu cầu được xác thực. Đây là mô hình đúng cho dữ liệu khách hàng, bản sao lưu, và bất cứ điều gì nhạy cảm.

S3 không phải là một hệ thống tệp. Không có thư mục thực. Dấu `/` trong một tên key chỉ là một quy ước — S3 đối xử với toàn bộ key như một chuỗi phẳng. Nhưng nó trông giống các thư mục và hầu hết các công cụ trình bày nó như các thư mục, vậy nên đừng lo về sự phân biệt này trong thực tế.

Có một vài đặc điểm vận hành của S3 quan trọng trong thực tế nhưng không rõ ràng từ mô tả:

**Tính bất biến của đối tượng**: Các đối tượng S3 không được chỉnh sửa tại chỗ. Nếu bạn cập nhật một tệp, bạn tải lên một phiên bản mới của đối tượng với cùng key. S3 thay thế đối tượng cũ bằng cái mới (hoặc, với versioning được bật, giữ cả hai). Không giống một cơ sở dữ liệu nơi bạn `UPDATE` một hàng, các đối tượng S3 là ghi-một-lần, đọc-nhiều-lần. Đối với các tệp văn bản và tài liệu bạn chỉnh sửa thường xuyên, điều này ổn — chỉ cần tải lên phiên bản mới. Đối với các tệp rất lớn nơi bạn chỉ muốn cập nhật một phần nội dung, mô hình đối tượng của S3 có nghĩa là bạn tải lại toàn bộ tệp mỗi lần.

**Tính nhất quán đọc-sau-ghi mạnh**: Kể từ tháng 12 năm 2020, S3 cung cấp tính nhất quán mạnh cho tất cả các đối tượng — các lần ghi mới ngay lập tức hiển thị với các lần đọc tiếp theo. Trước năm 2020, S3 có tính nhất quán cuối cùng cho một số thao tác, điều này gây ra các lỗi tinh vi trong các ứng dụng ghi một đối tượng và ngay lập tức cố đọc nó. Cải thiện mô hình nhất quán đã loại bỏ loại lỗi này.

**URL đối tượng**: Mỗi đối tượng S3 có một URL. Đối với một đối tượng công khai, nó trông như: `https://bucket-name.s3.region.amazonaws.com/key/path`. Đối với các đối tượng riêng tư, bạn có thể tạo các pre-signed URL bao gồm thông tin xác thực và hết hạn sau một thời gian được cấu hình. Cả hai định dạng URL là cách các ứng dụng và trình duyệt thực sự lấy các đối tượng — không có giao thức độc quyền nào liên quan.

**Không có thư mục để tạo**: Vì S3 không có thư mục thực, không có thao tác tạo thư mục. Bạn chỉ cần tải lên một đối tượng với một key bao gồm tiền tố đường dẫn. "Thư mục" xuất hiện tự động trong console khi các đối tượng với tiền tố đó tồn tại, và biến mất tự động khi tất cả các đối tượng với tiền tố đó bị xóa.

**Tại Sao S3 Khác Một Ổ Cứng Thông Thường**

Ba điều làm cho S3 khác biệt về cơ bản với lưu trữ tệp trên một EC2 instance:

**Độ bền.** AWS thiết kế S3 cho độ bền 99,999999999% (mười một số chín). Điều đó có nghĩa là nếu bạn lưu trữ mười triệu đối tượng, bạn có thể mong đợi mất một đối tượng mỗi mười nghìn năm do lỗi phần cứng. Họ đạt được điều này bằng cách lưu trữ nhiều bản sao của mỗi đối tượng trên ít nhất ba Availability Zone một cách tự động.

Nhưng độ bền bảo vệ chống lại lỗi phần cứng — không phải chống lại việc bạn vô tình xóa thứ gì đó. Đó là cái versioning dành cho.

Có một sự phân biệt quan trọng giữa **độ bền** và **tính khả dụng**. Độ bền là về việc liệu dữ liệu của bạn còn tồn tại hay không. Tính khả dụng là về việc liệu bạn có thể truy cập nó ngay bây giờ hay không. S3 Standard cung cấp độ bền 99,999999999% và tính khả dụng 99,99%. Con số độ bền cao gần như không thể hiểu nổi; con số tính khả dụng 99,99% là một *mục tiêu thiết kế* — khoảng 52 phút không khả dụng mỗi năm. *SLA* hợp đồng thực ra thấp hơn (99,9% mỗi tháng), và bỏ lỡ nó kiếm cho bạn tín dụng dịch vụ, không phải thời gian hoạt động. Trong thực tế, tính khả dụng S3 cao hơn nhiều so với cả hai con số — nhưng đáng hiểu rằng độ bền và tính khả dụng là các đảm bảo riêng biệt, và các mục tiêu thiết kế và SLA là các lời hứa riêng biệt.

**Tính khả dụng.** S3 được thiết kế để có thể truy cập ngay cả khi các thành phần riêng lẻ thất bại. Bạn không kết nối đến một máy chủ — bạn đang kết nối đến một hệ thống phân tán định tuyến quanh các lỗi.

**Quy mô.** S3 chứa một lượng dữ liệu về cơ bản không giới hạn. Một bucket duy nhất có thể chứa hàng nghìn tỷ đối tượng. Bản thân Amazon sử dụng S3 để lưu trữ dữ liệu ở một quy mô khó hiểu. Các bucket S3 lớn nhất trên thế giới chứa exabyte dữ liệu — hàng triệu terabyte. Bạn không quản lý quy mô này; bạn chỉ tải lên các đối tượng và S3 xử lý mọi thứ bên dưới.

**Chi phí.** S3 Standard tốn khoảng 0,023 đô la mỗi GB mỗi tháng tính đến thời điểm viết. Đối với tám trăm ảnh thực đơn của Nimbus trung bình 2MB mỗi cái, đó là 1,6 GB lưu trữ — khoảng 0,04 đô la mỗi tháng. Ngay cả ở 800.000 ảnh, bạn nhìn vào 37 đô la mỗi tháng cho lưu trữ. Chi phí của cùng lưu trữ trên một volume EBS sẽ khoảng 128 đô la mỗi tháng, với một trần cố định đòi hỏi mở rộng trước khi bạn có thể thêm nhiều hơn. S3 phát triển tự động và tính phí tỷ lệ. EBS có một kích cỡ cố định và một chi phí cố định.

**Versioning: Nút Hoàn Tác**

Đây là một điều Maya tìm thấy khi cô đang khám phá console S3.

S3 hỗ trợ **versioning**. Khi bạn bật versioning trên một bucket, S3 giữ mọi phiên bản của mọi đối tượng — bao gồm các phiên bản trước và các phiên bản bị xóa.

Đây là nút hoàn tác cho các tệp của bạn.

Priya muốn kiểm tra nó trước khi tin tưởng nó. Cô tải lên một ảnh thực đơn vào bucket, rồi tải lên một phiên bản mới với tệp sai — một hình ảnh hoàn toàn đen cô tạo trong ba mươi giây.

Cô mở console S3, nhấp "Show versions," và tìm thấy cả hai: phiên bản tồi (hiện tại) và bản gốc (trước). Cô khôi phục phiên bản trước bằng cách sao chép nó lại như phiên bản hiện tại mới.

"Nó hoạt động," cô nói.

"Giữ tất cả các phiên bản đó tốn bao nhiêu?" Tom hỏi.

Bạn trả tiền cho lưu trữ của mọi phiên bản. Nếu bạn có nhiều phiên bản của các tệp lớn, nó tích lũy. AWS có **lifecycle policy** tự động xóa các phiên bản cũ sau một thời gian nhất định — chúng ta đề cập những cái đó ở Chương 23 khi chúng ta đi sâu vào tối ưu hóa chi phí.

"Vậy chúng ta bật versioning nhưng đặt một lifecycle rule để xóa các phiên bản cũ sau ba mươi ngày," Priya nói. "Theo cách đó chúng ta có một cửa sổ khôi phục mà không phải trả tiền để lưu trữ mọi phiên bản mãi mãi."

Tom viết con số xuống. Chi phí lưu trữ cho ba mươi ngày của các phiên bản là chấp nhận được.

**S3 Event Notifications: Các Tệp Làm Việc**

Leo đang nhìn các ảnh thực đơn từ một góc độ khác.

"Ngay bây giờ," anh nói, "khi một nhà hàng tải lên một ảnh, chúng ta lưu trữ bản gốc ở độ phân giải đầy đủ. Một số chúng là bốn nghìn nhân ba nghìn pixel. Mỗi khi một khách hàng tải trang thực đơn trên một điện thoại, chúng ta đang phục vụ một hình ảnh bốn megabyte."

"Cái đó tốn bao nhiêu băng thông?" Tom hỏi.

Leo mở các con số truyền dữ liệu trên hóa đơn. Câu trả lời là "nhiều hơn nó nên."

S3 có một tính năng gọi là **Event Notifications**. Khi một đối tượng được tải lên một bucket, S3 có thể tự động kích hoạt một dịch vụ khác — như Lambda, dịch vụ điện toán serverless mà chúng ta đề cập ở Chương 20. Kích hoạt đó có thể chạy mã đáp ứng việc tải lên mà không có bất kỳ can thiệp thủ công nào.

Giải pháp Nimbus: mỗi khi một ảnh được tải lên bucket ảnh thô, một S3 Event Notification kích hoạt một hàm Lambda. Hàm Lambda đọc ảnh gốc, tạo một thumbnail rộng 400 pixel, và lưu nó vào một bucket ảnh đã xử lý. Ứng dụng hướng tới khách hàng phục vụ thumbnail thay vì bản gốc.

Đường ống:

1. Nhà hàng tải lên ảnh gốc 4MB vào `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. S3 kích hoạt Event Notification
3. Hàm Lambda đọc bản gốc, tạo một thumbnail 400x300
4. Lambda lưu thumbnail vào `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. Khách hàng tải thực đơn, ứng dụng phục vụ thumbnail 40KB thay vì bản gốc 4MB

Kết quả: giảm 99% băng thông hình ảnh. Tải trang nhanh hơn. Một dòng truyền dữ liệu nhỏ hơn trên hóa đơn. Các bản gốc được bảo toàn trong bucket thô, vậy nên nếu Nimbus có bao giờ muốn tạo các phiên bản độ phân giải cao hơn, vật liệu nguồn ở đó.

"Cái đó chạy tự động?" Maya hỏi.

"Mỗi khi bất kỳ ai tải lên một ảnh," Leo nói. "Chúng ta không bao giờ chạm vào nó."

Mẫu này — xử lý hướng sự kiện được kích hoạt bởi các sự kiện lưu trữ — là một trong những mẫu phổ biến nhất và mạnh mẽ nhất trong kiến trúc đám mây hiện đại. Chúng ta xem lại nó kỹ lưỡng ở Chương 20.

**Cross-Region Replication: Khi Một Bản Sao Không Đủ**

Priya nêu một câu hỏi tuân thủ vào cuối tuần.

"Nếu Nimbus mở rộng để phục vụ các nhà hàng ở EU," cô nói, "và những nhà hàng đó tải lên ảnh — những ảnh đó có được lưu trữ trong bucket `us-west-2` của chúng ta không?"

"Đúng," Leo nói.

"Và GDPR có nói gì về nơi dữ liệu đó được lưu trữ không?"

Có. Các điều khoản truyền dữ liệu của GDPR có nghĩa là dữ liệu cá nhân về cư dân EU có thể đòi hỏi lưu trữ trong EU hoặc trong một khu vực pháp lý với bảo vệ dữ liệu đầy đủ.

Câu trả lời của S3 cho điều này là **Cross-Region Replication** (CRR). Khi bạn bật CRR trên một bucket, mọi đối tượng mới được tải lên tự động được sao chép sang một bucket ở một Region khác. Bạn cấu hình bucket nguồn, bucket đích, và IAM role cho S3 quyền thực hiện sao chép.

Khi việc mở rộng EU xảy ra, kế hoạch là thế này: các ảnh được tải lên bởi các nhà hàng EU sẽ đi vào một bucket `eu-west-1`, và CRR sẽ sao chép chúng sang một bucket sao lưu ở `eu-central-1` (Frankfurt) cho khôi phục thảm họa. Dữ liệu EU ở lại trong các Region EU.

"Cái đó sẽ tốn bao nhiêu?" Tom hỏi.

Chi phí truyền và lưu trữ dữ liệu giữa các region áp dụng — khoảng mức truyền theo GB từ Region nguồn đến đích, cộng lưu trữ cho các bản sao được sao chép. Tom làm phép toán trên khối lượng ảnh EU dự kiến của Nimbus và xác định nó sẽ chấp nhận được.

"Và nếu ai đó cố xâm nhập vào đường ống sao chép thì sao?" Priya hỏi. "IAM role thực hiện sao chép nên được giới hạn phạm vi chặt chẽ — chỉ các hành động sao chép S3, chỉ trên các bucket cụ thể."

Cô viết yêu cầu đó vào kế hoạch mở rộng.

**Multipart Upload Và Vấn Đề Tải Lên Chưa Hoàn Thành**

Tom tìm thấy một mục bất ngờ trên hóa đơn AWS.

"Chúng ta đang trả tiền cho lưu trữ trong S3," anh nói, "nhưng số lượng cao hơn tôi mong đợi từ số lượng ảnh chúng ta có."

Leo điều tra. Anh tìm thấy một loại trong báo cáo S3 Storage Lens: **incomplete multipart uploads** (các lần tải lên đa phần chưa hoàn thành).

Khi S3 tải lên một tệp lớn hơn một kích cỡ nhất định, nó sử dụng **multipart upload**: tệp được chia thành các phần, mỗi phần được tải lên riêng, và rồi các phần được lắp ráp thành đối tượng cuối cùng. Điều này làm cho các lần tải lên lớn đáng tin cậy hơn — nếu một phần thất bại, chỉ phần đó cần được thử lại, không phải toàn bộ tệp.

Nhưng nếu một multipart upload được bắt đầu và rồi bị bỏ rơi — người dùng đóng trình duyệt, mạng bị rớt, ứng dụng sập — các phần một phần vẫn ở trong S3, tích lũy các khoản phí lưu trữ. Chúng không hiển thị như các đối tượng đã hoàn thành, nhưng chúng đang bị tính phí như lưu trữ.

"Bao nhiêu?" Tom hỏi.

"Khoảng 12 đô la một tháng," Leo nói. "Từ các lần tải lên một phần chưa bao giờ được hoàn thành."

Cách sửa: một **lifecycle rule** S3 tự động xóa các incomplete multipart uploads sau bảy ngày. Bất kỳ lần tải lên nào chưa hoàn thành trong một tuần đều bị bỏ rơi, và các phần một phần được dọn dẹp.

Tom thêm lifecycle rule chiều hôm đó. Khoản phí 12 đô la/tháng biến mất trong vài ngày.

"Đó là 144 đô la một năm," Tom nói, nhìn bảng tính của mình. "Cho không gì cả."

"Tôi đã thiết lập một bài kiểm tra tải sử dụng các multipart upload," Leo nói. "Ồ." Một khoảng dừng. "Đó có lẽ là hầu hết chúng. Tôi quên dọn dẹp nó khi bài kiểm tra xong."

Tom viết nó xuống dù sao đi nữa.

**Kiểm Soát Truy Cập: Công Khai so với Riêng Tư**

Theo mặc định, mọi thứ trong S3 là riêng tư. Chỉ tài khoản AWS của bạn có thể truy cập nó.

Bạn có thể làm các đối tượng riêng lẻ công khai — đó là cách bạn sẽ phục vụ hình ảnh thực đơn cho các khách truy cập website. Hoặc bạn có thể giữ mọi thứ riêng tư và tạo các **pre-signed URL**: các liên kết có giới hạn thời gian cho phép ai đó tải xuống một đối tượng cụ thể mà không cần thông tin đăng nhập AWS. Hoàn hảo để cho một khách hàng tải xuống hóa đơn của họ trong 24 giờ.

Priya có những ý kiến rất mạnh mẽ về điều này.

"Và nếu ai đó cố xâm nhập qua một bucket cấu hình sai thì sao?" cô nói. "Không bao giờ làm một bucket hoàn toàn công khai trừ khi bạn đã cố ý quyết định làm mọi đối tượng trong nó có thể truy cập đối với toàn bộ internet. Sai lầm bảo mật S3 phổ biến nhất là vô tình để lộ một bucket chứa dữ liệu nhạy cảm."

AWS bây giờ có một cài đặt "Block Public Access" mà bạn có thể áp dụng ở cấp tài khoản, buộc tất cả các bucket riêng tư trừ khi bạn rõ ràng ghi đè nó theo từng bucket.

Bật nó. Luôn luôn.

Lịch sử đằng sau điều này: trước khi AWS thêm Block Public Access cấp tài khoản, sự cố bảo mật S3 phổ biến nhất là vô tình làm một bucket công khai. Một nhà phát triển tạo một bucket để kiểm tra, đánh dấu ô "công khai" cho tiện lợi, thêm một số tệp bao gồm một vài từ các thư mục khác họ không nghĩ đến, và rồi quên về nó. Bucket ngồi đó, có thể truy cập công khai, trong nhiều tháng. Trong một vài trường hợp nổi bật, "bucket kiểm tra bị quên" chứa dữ liệu khách hàng, tài liệu nội bộ, hoặc thông tin đăng nhập.

Block Public Access cấp tài khoản là một biện pháp bảo vệ chống lại điều này. Ngay cả khi một nhà phát triển vô tình cấu hình một bucket để công khai, cài đặt cấp tài khoản ghi đè nó. Bạn phải rõ ràng vô hiệu hóa cài đặt cấp tài khoản trước khi bất kỳ bucket nào có thể trở nên công khai — điều này tạo ra một gờ giảm tốc có chủ ý ngăn các tai nạn.

Nimbus có Block Public Access được bật ở cấp tài khoản. Vậy làm sao các hình ảnh thực đơn cần có thể truy cập công khai được phục vụ? Mẫu chuẩn — một cái Nimbus sẽ áp dụng sau, ở Chương 13 — là đặt một CDN như CloudFront trước bucket với một policy Origin Access Control: CDN có thể lấy các đối tượng từ một bucket S3 riêng tư, nhưng không ai có thể truy cập bucket trực tiếp. Mẫu này an toàn hơn một bucket công khai và cho phép bộ nhớ đệm của CDN giảm chi phí yêu cầu S3.

"Khoan đã — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Các hình ảnh dù sao cũng công khai, vậy tại sao nó lại quan trọng nếu bucket công khai?"

"Vì một bucket công khai có nghĩa là bất kỳ ai cũng có thể liệt kê những gì trong nó," Priya nói. "Họ có thể liệt kê tất cả các đối tượng trong bucket. Với CloudFront ở phía trước, họ chỉ thấy các URL chúng ta để lộ trong ứng dụng. Bản thân bucket vẫn riêng tư."

Maya thêm "liệt kê" vào mô hình tâm trí của cô về các bề mặt tấn công.

**S3 Storage Class: Không Phải Tất Cả Dữ Liệu Đều Bằng Nhau**

Không phải tất cả dữ liệu đều được truy cập bằng nhau.

Các ảnh thực đơn phổ biến nhất của bạn được lấy hàng chục lần mỗi giây. Các nhật ký của bạn từ ba năm trước được truy cập có lẽ một lần một năm, nếu có. S3 nhận ra điều này và cung cấp các **storage class** khác nhau với các sự đánh đổi hiệu năng và chi phí khác nhau.

| Storage Class           | Trường hợp sử dụng                                | Truy xuất        | Chi phí                        |
|-------------------------|--------------------------------------------------|------------------|--------------------------------|
| S3 Standard             | Dữ liệu được truy cập thường xuyên               | Ngay lập tức     | Cao hơn mỗi GB                 |
| S3 Standard-IA          | Truy cập không thường xuyên, vẫn cần truy xuất nhanh | Ngay lập tức  | Thấp hơn mỗi GB, phí truy xuất |
| S3 Glacier Instant      | Lưu trữ được truy cập thỉnh thoảng               | Ngay lập tức     | Thấp hơn nhiều                 |
| S3 Glacier Flexible     | Lưu trữ hiếm khi được truy cập                   | Phút đến giờ     | Rất thấp                       |
| S3 Glacier Deep Archive | Lưu trữ tuân thủ, hầu như không bao giờ được truy cập | Lên đến 12 giờ | Thấp nhất                  |

Chúng ta đi sâu vào những cái này ở Chương 23. Hiện tại: khái niệm là bạn có thể tự động di chuyển các đối tượng giữa các storage class dựa trên tuổi và mẫu truy cập của chúng, tiết kiệm tiền đáng kể cho dữ liệu bạn hiếm khi chạm.

Cũng có **S3 Intelligent-Tiering** — một storage class tự động di chuyển các đối tượng giữa các tầng truy cập thường xuyên và truy cập không thường xuyên dựa trên các mẫu truy cập được quan sát. Bạn trả một phí giám sát nhỏ cho mỗi đối tượng mỗi tháng, và S3 xử lý việc phân tầng tự động. Điều này hữu ích khi bạn không chắc đối tượng nào sẽ được truy cập thường xuyên và cái nào sẽ không — dịch vụ học mẫu và tối ưu hóa tương ứng.

Cách tiếp cận của Tom thủ công hơn: "Tôi muốn biết mỗi đô la đi đâu." Anh chọn các lifecycle rule rõ ràng thay vì Intelligent-Tiering, vì các quy tắc rõ ràng có thể đoán trước và có thể kiểm toán. Sau sáu tháng vận hành lưu trữ S3 của Nimbus, anh có một bức tranh rõ ràng về các mẫu truy cập và có thể đặt các lifecycle rule di chuyển các đối tượng sang Standard-IA sau 30 ngày và sang Glacier Flexible Retrieval sau 180 ngày.

Tổng tiết kiệm lưu trữ từ quản lý vòng đời trong năm đầu tiên: khoảng 340 đô la. Không thay đổi cuộc đời, nhưng thực — và mẫu lặp lại trên hàng chục bucket trong bất kỳ tài khoản AWS nghiêm túc nào.

"Đó gần như một chuyến bay khứ hồi," Maya nói.

"Đó là thực hành kỹ thuật tốt," Tom nói. Anh đặt nó vào bảng tính.

Có một cái bẫy trong việc lựa chọn storage class bắt được nhiều nhóm: **thời lượng lưu trữ tối thiểu**. S3 Standard-IA có thời lượng lưu trữ tối thiểu 30 ngày — nếu bạn lưu trữ một đối tượng trong Standard-IA và xóa nó sau 15 ngày, bạn vẫn trả tiền cho 30 ngày. Glacier Flexible Retrieval có tối thiểu 90 ngày. Glacier Deep Archive có tối thiểu 180 ngày.

Đối với các đối tượng bị xóa thường xuyên hoặc có tuổi thọ ngắn, các mức tối thiểu này làm cho các class IA và Glacier đắt hơn Standard, không phải rẻ hơn. Trước khi chuyển sang một storage class rẻ hơn, hãy xác minh rằng các đối tượng sẽ thực sự sống ở đó đủ lâu để các khoản tiết kiệm vượt quá các hình phạt thời lượng tối thiểu.

## Điểm Mạnh Và Hạn Chế

**Tại sao S3 tuyệt vời**:

- Độ bền mười một số chín. Dữ liệu của bạn an toàn hơn trong S3 so với hầu hết bất kỳ hệ thống nào khác.
- Quy mô không giới hạn. Bạn không bao giờ cần cấp phát lưu trữ — nó chỉ phát triển.
- Cực kỳ rẻ cho những gì nó cung cấp (phần nhỏ của một xu mỗi GB mỗi tháng).
- Tích hợp gốc với hầu hết mọi dịch vụ AWS khác.
- Hỗ trợ lưu trữ website tĩnh — bạn có thể phục vụ một website tĩnh hoàn chỉnh
  trực tiếp từ S3, không cần máy chủ.
- Xử lý hướng sự kiện: S3 Event Notifications kích hoạt Lambda, SQS, hoặc SNS
  tự động khi các đối tượng được tạo hoặc xóa, cho phép các đường ống xử lý mạnh mẽ
  mà không cần polling hoặc các tác vụ lập lịch.
- Cross-Region Replication cho cư trú dữ liệu tuân thủ và khôi phục thảm họa.

**Nơi S3 không phải là lựa chọn đúng**:

- S3 không phải là một hệ thống tệp. Nếu ứng dụng của bạn cần mount một ổ đĩa và sử dụng nó như
  một đĩa cục bộ (đọc, ghi, sửa đổi tệp tại chỗ), S3 là công cụ sai.
  Sử dụng EFS (Elastic File System, Chương 6) hoặc EBS thay vào đó.
- S3 có độ trễ cao hơn đáng kể so với một đĩa cục bộ. Đối với cơ sở dữ liệu hoặc
  các ứng dụng cần I/O truy cập ngẫu nhiên, nhanh, lưu trữ block (EBS, Chương 6)
  là phù hợp.
- Truyền dữ liệu *vào* S3 không có phí băng thông — nhưng không hoàn toàn miễn phí:
  mỗi lần tải lên là một yêu cầu PUT, và S3 tính phí mỗi yêu cầu. Tải lên hàng triệu
  đối tượng nhỏ có thể tốn nhiều hơn về phí yêu cầu so với lưu trữ. Truyền dữ liệu *ra*
  tốn tiền mỗi GB. Cả hai là các bất ngờ hóa đơn phổ biến — chúng ta giải quyết chúng ở Chương 30.
- S3 không phải là một cơ sở dữ liệu. Bạn có thể lưu trữ và lấy các đối tượng theo key, nhưng bạn không thể
  truy vấn các đối tượng theo nội dung của chúng, chạy các tổng hợp, hoặc thực hiện các thao tác quan hệ.
  Nếu bạn cần truy vấn nội dung của dữ liệu được lưu trữ (không chỉ lấy nó theo tên),
  bạn cần một cơ sở dữ liệu hoặc một dịch vụ như Athena (Chương 26) có thể truy vấn các đối tượng S3
  bằng SQL.
- Versioning đối tượng lưu trữ các chi phí tích lũy. Mọi phiên bản trước của mọi
  đối tượng được phiên bản hóa được tính phí như lưu trữ. Các lifecycle rule hết hạn các phiên bản cũ
  không phải tùy chọn — chúng là một phần của chiến lược quản lý chi phí cho bất kỳ bucket nào
  có versioning được bật.

**Cách Các Đối Tượng S3 Được Mã Hóa**

"Và nếu ai đó cố xâm nhập thì sao?" Priya hỏi, một cách có thể đoán trước, vào ngày các ảnh đi vào hoạt động. "Những đối tượng này có được mã hóa khi nghỉ không?"

Chúng có — và điều đó đáng hiểu, vì mã hóa S3 là một trong những chủ đề được kiểm tra nhiều nhất trong kỳ thi. Mọi đối tượng được tải lên S3 được mã hóa khi nghỉ theo mặc định. Câu hỏi là *ai giữ khóa*:

**SSE-S3 (mặc định)**: S3 mã hóa mọi đối tượng với các khóa mà chính S3 quản lý, sử dụng AES-256. Bạn không làm gì, không cấu hình gì, không trả gì. Kể từ tháng 1 năm 2023, điều này tự động trên mọi bucket. Đối với hầu hết dữ liệu, nó là đủ.

**SSE-KMS**: S3 mã hóa các đối tượng với một khóa KMS — hoặc khóa do AWS quản lý `aws/s3` hoặc một khóa do khách hàng quản lý mà bạn kiểm soát (Chương 16 đề cập KMS chi tiết). Cái bạn đạt được: một dấu vết kiểm toán trong CloudTrail của mọi lần sử dụng khóa, khả năng kiểm soát chính xác ai có thể giải mã qua key policy, và khả năng thu hồi quyền truy cập bằng cách vô hiệu hóa khóa. Cái bạn trả: các khoản phí API KMS mỗi yêu cầu. Ở tỷ lệ yêu cầu cao, bật **S3 Bucket Keys** — S3 lấy một khóa cấp bucket tồn tại ngắn từ khóa KMS của bạn, cắt các lệnh gọi API KMS (và chi phí) lên đến 99%.

**SSE-C**: Bạn cung cấp khóa mã hóa của riêng mình *với mỗi yêu cầu*. AWS sử dụng nó trong bộ nhớ và không bao giờ lưu trữ nó. Đối với các tổ chức có quy tắc tuân thủ nói rằng AWS không bao giờ được giữ khóa. Đòi hỏi cao về vận hành — mất khóa, mất dữ liệu.

Mẫu thi: "mã hóa với một dấu vết kiểm toán về việc sử dụng khóa" hoặc "kiểm soát ai có thể giải mã" → SSE-KMS. "Công ty phải quản lý khóa của riêng mình và AWS không bao giờ được lưu trữ chúng" → SSE-C. "Mã hóa khi nghỉ không có chi phí quản lý" → SSE-S3 (đã bật).

**S3 Object Lock: Ghi Một Lần, Đọc Nhiều Lần**

Một số dữ liệu phải *không thể* xóa — không được bảo vệ bởi policy, mà bất biến về mặt cấu trúc. Hồ sơ giao dịch tài chính, nhật ký kiểm toán, bằng chứng pháp lý. **S3 Object Lock** làm cho các đối tượng không thể xóa và không thể sửa đổi trong một thời gian lưu giữ, ngay cả bởi các quản trị viên. Nó đòi hỏi versioning, và nó có hai chế độ mà kỳ thi thích đối chiếu: **governance mode** (người dùng với một quyền đặc biệt vẫn có thể bỏ qua khóa) và **compliance mode** (không ai có thể rút ngắn thời gian lưu giữ hoặc xóa đối tượng — ngay cả người dùng root — cho đến khi thời gian hết hạn). Các cụm từ quy định như "WORM storage" hoặc "SEC Rule 17a-4" là các kích hoạt thi cho Object Lock trong compliance mode.

**S3 Transfer Acceleration: Tải Lên Nhanh Từ Xa**

Khi người dùng tải lên các tệp lớn vào một bucket từ phía bên kia của thế giới, phần chậm là đường đi internet công cộng dài đến region của bucket. **S3 Transfer Acceleration** cho bucket một endpoint đặc biệt định tuyến các lần tải lên vào edge location AWS gần nhất, rồi mang chúng qua xương sống riêng của AWS đến bucket. Kích hoạt thi: "người dùng trên khắp thế giới tải lên các tệp lớn vào một bucket trung tâm; các lần tải lên chậm" → Transfer Acceleration (thường được ghép với multipart upload). Lưu ý hướng: Transfer Acceleration là về việc đưa dữ liệu *vào* S3; CloudFront là về việc phục vụ dữ liệu *ra*.

Một storage class nữa đáng biết bây giờ: **S3 One Zone-IA** — giống Standard-IA nhưng được lưu trữ trong một Availability Zone duy nhất, rẻ hơn khoảng 20%, cho dữ liệu được truy cập không thường xuyên mà bạn có thể tạo lại nếu AZ đó bị mất (thumbnail, báo cáo có thể tạo lại). Nó là một distractor thi chuẩn; Chương 23 đề cập toàn bộ phổ storage-class.


## Tóm Tắt

Tám trăm ảnh trên một instance duy nhất là vấn đề. S3 giải quyết nó — nhưng S3 hơn là một nơi để cất tệp. Nó là một kho lưu trữ đối tượng bền, có thể mở rộng, có thể truy cập toàn cầu với mô hình truy cập riêng, các storage class, các lifecycle policy, và hệ thống sự kiện. Hiểu S3 giỏi về gì, và cái nó cố ý không phải, định hình mọi quyết định lưu trữ mà nhóm sẽ đưa ra từ đây trở đi.

- **Amazon S3** là lưu trữ đối tượng — các tệp (đối tượng) trong các container được đặt tên (bucket). Nó lưu trữ các bản sao trên ít nhất ba Availability Zone cho độ bền mười một số chín. S3 không phải là một hệ thống tệp: sử dụng EFS cho các mount chia sẻ, EBS cho lưu trữ block single-instance.
- Các tệp được lưu trữ trên các EC2 instance bị buộc vào vòng đời của instance đó, gây ra các lỗi ảnh-bị-thiếu khi lưu lượng trải ra trên nhiều máy chủ. S3 giải quyết điều này bằng cách độc lập với bất kỳ instance nào.
- **Versioning** bảo toàn các phiên bản đối tượng trước. **Lifecycle rule** tự động hóa các chuyển đổi giữa các storage class và dọn dẹp các incomplete multipart upload mà nếu không sẽ tích lũy các khoản phí hóa đơn âm thầm.
- Theo mặc định, S3 là riêng tư. Bật "Block Public Access" ở cấp tài khoản. Phục vụ các đối tượng công khai qua CloudFront với Origin Access Control thay vì làm các bucket trực tiếp công khai.
- Các S3 storage class cho phép bạn khớp chi phí với tần suất truy cập — nhưng theo dõi các khoản phí thời lượng lưu trữ tối thiểu trước khi chuyển các đối tượng tuổi thọ ngắn sang các tầng Infrequent Access hoặc Glacier.

## Mẹo Thi

*SAA-C03 Domain 3 — Task 3.1 (giải pháp lưu trữ hiệu năng cao)*

- **S3 là lưu trữ đối tượng, không phải lưu trữ block.** Khi một tình huống thi cần một
  hệ thống tệp mà nhiều máy chủ có thể mount, đó là EFS. Khi nó cần một đĩa
  cho một EC2 instance duy nhất, đó là EBS. Khi nó cần lưu trữ tệp, bản sao lưu,
  hình ảnh, hoặc dữ liệu được truy cập qua HTTP — đó là S3.
- **Độ bền mười một số chín** có nghĩa là S3 sao chép dữ liệu trên nhiều AZ
  tự động. Bạn không cấu hình điều này — nó là mặc định.
- **S3 là theo Region**, nhưng có thể truy cập toàn cầu. Các bucket tồn tại ở một Region cụ thể,
  nhưng bạn có thể truy cập chúng từ bất kỳ đâu.
- **Pre-signed URL** cho phép truy cập có giới hạn thời gian đến các đối tượng riêng tư. Mẫu phổ biến:
  ứng dụng của bạn tạo một pre-signed URL có hiệu lực trong 15 phút, cho nó cho
  người dùng, người dùng tải xuống tệp trực tiếp từ S3.
- **S3 Standard-IA** có một khoản phí thời lượng lưu trữ tối thiểu (30 ngày). Đừng sử dụng nó
  cho dữ liệu bạn sẽ xóa nhanh. Kỳ thi kiểm tra liệu bạn có biết các sự đánh đổi
  giữa các storage class không.
- **Cây quyết định storage class**: *được truy cập thường xuyên* → S3 Standard; *được truy cập không thường xuyên nhưng cần truy xuất nhanh* → S3 Standard-IA; *lưu trữ được truy cập thỉnh thoảng* → S3 Glacier Instant Retrieval; *lưu trữ hiếm khi được truy cập* → S3 Glacier Flexible Retrieval; *lưu trữ tuân thủ, hầu như không bao giờ được truy cập* → S3 Glacier Deep Archive.
- **Cross-Region Replication** đòi hỏi versioning được bật trên cả bucket nguồn và đích. Các câu hỏi thi về khôi phục thảm họa hoặc chủ quyền dữ liệu thường liên quan đến CRR.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của bạn: một đối tượng S3 là gì? Một bucket S3 là gì? Tại sao lưu trữ tệp
trong S3 tốt hơn lưu trữ chúng trên đĩa cục bộ của một EC2 instance?

*(Gợi ý: Nghĩ về chuyện gì xảy ra với các tệp trên một EC2 instance nếu instance bị
chấm dứt. S3 làm gì khác?)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty truyền thông sản xuất các video tài liệu. Họ cần lưu trữ các đoạn
quay 4K gốc (được truy cập thường xuyên trong sản xuất), các bản cắt cuối được chỉnh sửa (được truy cập hàng tháng
để phân phối), và các bản gốc lưu trữ (được giữ vô thời hạn nhưng được truy cập nhiều nhất một lần
một năm cho mục đích tuân thủ). Họ muốn giảm thiểu chi phí lưu trữ trong khi đáp ứng
yêu cầu truy cập của mỗi tầng.

Chiến lược lưu trữ nào đáp ứng TỐT NHẤT nhu cầu của họ?

A) Lưu trữ đoạn quay gốc trong S3 Standard, các bản cắt cuối trong S3 Standard-IA, và các lưu trữ
   trong S3 Glacier Deep Archive  
B) Lưu trữ tất cả nội dung trong S3 Standard cho hiệu năng nhất quán và sự đơn giản  
C) Lưu trữ tất cả nội dung trên lưu trữ EC2 instance cho truy cập nhanh nhất  
D) Lưu trữ tất cả nội dung trong S3 Glacier Deep Archive để giảm thiểu chi phí

**Gợi ý 1**: Các tệp khác nhau có các mẫu truy cập khác nhau. S3 cung cấp các storage
class khác nhau cho các tần suất truy cập khác nhau. Class nào khớp với "được truy cập thường xuyên"?

**Gợi ý 2**: Các lưu trữ được truy cập "nhiều nhất một lần một năm" không cần truy xuất ngay lập tức.
Storage class nào được thiết kế cho lưu trữ dài hạn với chi phí tối thiểu?

**Gợi ý 3**: Khớp tần suất truy cập của mỗi tầng với storage class phù hợp.
Được truy cập thường xuyên = Standard. Hàng tháng = Standard-IA. Một lần một năm = Glacier Deep Archive.

**Đáp án**: A

**Giải thích**: Chiến lược này khớp đúng mỗi tầng dữ liệu với storage class S3
phù hợp. Đoạn quay gốc được truy cập thường xuyên ở lại trong Standard cho
truy cập ngay lập tức không có phí truy xuất. Các bản cắt cuối được truy cập hàng tháng đi đến Standard-IA
(chi phí lưu trữ thấp hơn, phí truy xuất phải chăng). Các lưu trữ được truy cập một lần một năm đi đến
Glacier Deep Archive cho chi phí lưu trữ thấp nhất có thể.

**Tại sao không B?** Lưu trữ mọi thứ trong Standard đơn giản nhưng đắt.

**Tại sao không C?** Lưu trữ EC2 instance là tạm thời và không phù hợp cho lưu trữ
truyền thông dài hạn. Nếu instance bị chấm dứt, tất cả nội dung bị mất.

**Tại sao không D?** Glacier Deep Archive có thời gian truy xuất lên đến 12 giờ. Lưu trữ
đoạn quay sản xuất được truy cập thường xuyên ở đó sẽ làm cho công việc sản xuất không thể.

*SAA-C03 Domain 3 — Task 3.1 / Domain 4 — Task 4.1*

**Bài tập 3 — Thách thức kiến trúc** *(Tùy chọn)*

Nimbus lưu trữ các ảnh đơn hàng được khách hàng tải lên trong S3. Một quy định bảo vệ dữ liệu
yêu cầu rằng các ảnh khách hàng phải được lưu trữ trong 7 năm nhưng có thể bị xóa sau
đó. Nhóm cũng muốn giảm thiểu chi phí lưu trữ các ảnh cũ từ các năm trước.

Thiết kế một chiến lược lưu trữ S3 cho yêu cầu này. Các storage class nào bạn sẽ
sử dụng, và khi nào bạn sẽ chuyển đổi giữa chúng? Bạn sẽ làm gì về yêu cầu
xóa?

*(Gợi ý: Nghĩ về các lifecycle policy. Không có câu trả lời đúng duy nhất — lập luận
qua các sự đánh đổi chi phí so với thời gian truy xuất.)*

## Cảnh Sau Tín Dụng

Leo di chuyển các ảnh thực đơn sang S3 chiều hôm đó. Tám trăm đối tượng, được lưu trữ
an toàn trên ba Availability Zone, với versioning được bật.

"Chúng thực sự an toàn hơn bây giờ so với trước," anh nói, với một chút hài lòng.

"Chúng luôn an toàn hơn trong S3," Priya nói. "Chúng ta chỉ chờ cho đến sau khi chúng ta xây dựng
vấn đề để sửa nó."

Leo chấp nhận điều này.

Sáng hôm sau, Tom đến với một bản in. Hóa đơn AWS, được chú thích bằng bút đỏ.

"Chúng ta có một vấn đề cơ sở dữ liệu," anh nói. "Chúng ta đang chạy cơ sở dữ liệu đơn hàng trên cùng
EC2 instance với máy chủ web. Và cơ sở dữ liệu thực đơn của chúng ta. Và các bản ghi khách hàng của chúng ta."

Anh dừng lại.

"Mọi thứ ở trong cùng một máy. Một máy. Tất cả dữ liệu của chúng ta."

Maya nhìn bản in. Rồi nhìn Tom. Rồi nhìn trần nhà.

"Và nếu máy đó hỏng?"

Tom chỉ vào chú thích bút đỏ.

Chương tiếp theo: sự khác biệt giữa một ổ cứng bạn thuê và một tủ hồ sơ mà cả văn phòng chia sẻ.
