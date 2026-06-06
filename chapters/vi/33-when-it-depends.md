# Chương 33: Còn Tùy

Hãy hít một hơi cuối cùng trước chương này.

Con trỏ đang nhấp nháy trên slide trống của Maya. Tiêu đề: "Kiến Trúc Tại Nimbus." Cô xóa nó và gõ: "Câu Hỏi." Rồi cô nhìn vào căn phòng và nhận ra cô chẳng cần đến slide đó chút nào.

**Tóm Lược: Từ Review Đến Buổi Thuyết Trình**

Cuộc architecture review với Carlos — giờ đã sáu tháng và vài trăm lần ra mắt nhà hàng trôi qua phía sau họ — đã để lại cho nhóm một chồng ADR và một cách nghĩ sạch sẽ hơn về các quyết định trước khi phát hành. Maya đã đang chuẩn bị cho buổi thuyết trình nhà đầu tư khi cô nhận ra rằng mọi thứ Carlos đã hỏi — và mọi thứ cô đã trả lời một cách tự tin — đều quy về cùng một logic nền tảng. Các nhà đầu tư sẽ hỏi tại sao. Cô đã học được, qua hai năm xây dựng Nimbus, rằng câu trả lời không bao giờ là tên dịch vụ. Câu trả lời luôn là tập hợp những điều kiện khiến một dịch vụ đúng và một dịch vụ khác sai. Cô sắp bước vào một căn phòng đầy người sẽ yêu cầu cô bảo vệ từng lựa chọn kiến trúc. Cô đã sẵn sàng.

**Câu Hỏi**

Ở cuối hầu hết mọi cuộc thảo luận kiến trúc, ai đó cuối cùng sẽ hỏi: "Câu trả lời đúng là gì?"

Và câu trả lời hữu ích nhất, khó chịu nhất, trung thực nhất và bị hiểu lầm nhất trong tất cả kỹ thuật phần mềm là:

**Còn tùy.**

Không phải vì câu hỏi không thể trả lời được. Không phải vì chuyên gia đang né tránh. Mà vì câu trả lời đúng thực sự, về mặt cấu trúc, còn tùy vào ngữ cảnh không có trong câu hỏi.

Chương này là về việc học cách nói "còn tùy" một cách đúng đắn — có nghĩa là có thể hoàn thành câu nói.

Hãy nghĩ về một bác sĩ được hỏi: "Phẫu thuật có phải là phương pháp điều trị đúng không?" Một bác sĩ tồi nói có hoặc không mà không khám bệnh nhân. Một bác sĩ giỏi nói: "Còn tùy — vào chẩn đoán, tuổi của bệnh nhân, các tình trạng khác của họ, và điều gì xảy ra nếu chúng ta chờ đợi." Câu trả lời không phải là sự lảng tránh. Đó là sự chính xác. "Còn tùy" theo sau bởi một câu đầy đủ là điều hữu ích nhất mà một bác sĩ — hay một kiến trúc sư — có thể nói.

**Hồi Kết Của Nimbus**

Hai năm rưỡi sau khởi đầu. Maya đang đứng trong một phòng họp ở Seattle, thuyết trình trước một căn phòng đầy các nhà đầu tư mạo hiểm.

Nimbus đã phát triển: 947 đối tác nhà hàng. 18,000 đơn hàng hàng ngày. $18 triệu GMV hàng tháng. Ba thành phố đang hoạt động, hai thành phố nữa đang ra mắt. Một nhóm mười bốn kỹ sư trên hai múi giờ.

Các nhà đầu tư có câu hỏi. Một trong số họ — một đối tác kỹ thuật của quỹ — ngả người về phía trước.

"Bạn đang sử dụng cơ sở dữ liệu nào?" ông hỏi.

Maya không do dự.

"Cho đơn hàng và dữ liệu khách hàng: Aurora PostgreSQL. Cho danh mục menu: DynamoDB. Cho quản lý phiên và caching: ElastiCache Redis. Cho analytics: Athena trên các tệp Parquet S3, với Redshift cho các truy vấn dashboard tần suất cao."

Ông gật đầu. "Tại sao Aurora cho đơn hàng mà không phải DynamoDB?"

"Vì đơn hàng có cấu trúc quan hệ phức tạp — chúng tham chiếu đến các mục menu, tài khoản khách hàng, địa chỉ nhà hàng, phương thức thanh toán. Chúng ta cần tính nhất quán giao dịch trên nhiều thực thể. Một cơ sở dữ liệu quan hệ là công cụ đúng cho điều đó. Điểm mạnh của DynamoDB là truy cập key-value thông lượng cao với schema linh hoạt, đó chính xác là mẫu truy cập của danh mục menu."

Ông viết điều gì đó xuống. "Còn về mở rộng quy mô? Bạn nói 18,000 đơn hàng hàng ngày. Đó là khoảng 12 mỗi phút trung bình. Bạn đã thiết kế cho giờ cao điểm như thế nào?"

"Giờ cao điểm bữa tối thứ Sáu khoảng 25 lần mức trung bình. Chúng ta mở rộng theo chiều ngang với ECS và Aurora Serverless v2, tự động xử lý burst. CloudFront hấp thụ tải nội dung tĩnh. API là stateless, nên việc mở rộng theo chiều ngang gọn gàng."

"Và nếu Aurora Serverless v2 không thể mở rộng đủ nhanh?"

"Chúng ta có kết quả kiểm thử tải. Thời gian mở rộng cho Aurora Serverless v2 là dưới 10 giây. Đợt tăng đột biến thứ Sáu trung bình của chúng ta mất 8 phút từ mức cơ sở. Chúng ta thoải mái với dư địa đó."

Đối tác kỹ thuật nhìn các nhà đầu tư còn lại. "Cô ấy biết hệ thống của mình."

Ông có thêm câu hỏi.

"Bạn xử lý an toàn triển khai như thế nào? Ở 947 nhà hàng, một lần triển khai tồi có nghĩa là 947 nhà hàng không thể nhận đơn hàng."

Maya đã được hỏi điều này trước đây, trong nội bộ. "Feature flag cho tất cả các thay đổi hành vi. Chúng ta triển khai code liên tục, nhưng hành vi mới được kiểm soát phía sau các flag mà chúng ta bật dần dần. Một lần triển khai thay đổi luồng xác nhận đơn hàng được tung ra cho 1% nhà hàng trong 24 giờ, rồi 10%, rồi 50%, rồi 100% — với tự động rollback nếu tỷ lệ lỗi vượt ngưỡng ở bất kỳ giai đoạn nào."

"Một lần tung ra đầy đủ mất bao lâu?"

"Ba ngày cho một thay đổi rủi ro cao. Một ngày cho rủi ro thấp. Các lần rollback khẩn cấp hoàn tất trong dưới bốn phút."

"P99 latency của Stripe của bạn là bao nhiêu?"

Tom trả lời trước khi Maya kịp. "214 mili giây."

"Cao đấy," nhà đầu tư nói.

"SLA của chúng ta với các nhà hàng là từ khi đặt hàng đến xác nhận trong dưới 5 giây," Tom nói. "214ms cho lệnh gọi Stripe là 4.3% của ngân sách đó. Thời gian còn lại là ghi Aurora, gửi tin nhắn SQS, đẩy thông báo tới tablet của nhà hàng. Chúng ta có dư địa."

"Nếu Stripe gặp sự cố thì sao?"

"Chúng ta dùng asynchronous payment capture của Stripe. Đơn hàng được chấp nhận và nhà hàng được thông báo ngay lập tức. Việc capture thanh toán xảy ra bất đồng bộ. Nếu Stripe chậm, đơn hàng vẫn được xử lý — capture sẽ thử lại. Nếu Stripe hoàn toàn down, chúng ta xếp hàng lần thử capture với exponential backoff và cảnh báo người trực. Chúng ta đã không giữ một đơn hàng vì Stripe trong 14 tháng."

Nhà đầu tư viết điều gì đó. "Bạn có điểm lỗi đơn lẻ nào không?"

Priya trả lời. "Aurora trong một region duy nhất là một phụ thuộc đơn region. Chúng ta có Multi-AZ cho các lỗi cấp AZ, và một Aurora Global Database reader đã đang chạy ở us-east-1. Một lỗi toàn region sẽ có nghĩa là failover sang reader đó — và việc failover region tự động xung quanh nó là thứ chúng ta đang xây dựng trong quý này. Cho đến lúc đó, đúng vậy — một lỗi region us-west-2 sẽ làm Nimbus down."

"Tại sao bạn chưa xây dựng failover đa region?"

"Vì cho đến sáu tháng trước, chi phí kỹ thuật để xây dựng nó một cách đúng đắn vượt quá rủi ro kinh doanh của sự cố ngừng hoạt động," Priya nói. "Chúng ta chưa bao giờ có một lỗi AWS cấp region kéo dài hơn 30 phút trong region vận hành của chúng ta. Ở 287 nhà hàng — khoảng 4,200 đơn hàng mỗi ngày với giá trị đơn hàng trung bình $34 — một sự cố ngừng hoạt động cấp region 2 giờ tốn của chúng ta khoảng $12,000 GMV. Chi phí kỹ thuật của một warm standby được triển khai đúng đắn là 3 tháng thời gian của một kỹ sư cấp cao. Ở mức doanh thu hiện tại của chúng ta, phép tính nghiêng về việc trì hoãn."

"Còn bây giờ?"

"Ở 947 nhà hàng và 18,000 đơn hàng hàng ngày, cùng một sự cố 2 giờ tốn khoảng $51,000 GMV và tạo ra thiệt hại uy tín đáng kể với các đối tác nhà hàng phụ thuộc vào chúng ta cho dịch vụ bữa tối của họ. Phép tính đã thay đổi. Dự án failover bắt đầu vào sprint tới."

Nhà đầu tư nhìn các nhà đầu tư khác trong phòng. "Cô ấy cũng biết hồ sơ rủi ro của mình."


**Bốn Câu Hỏi Bên Dưới "Còn Tùy"**

Cô đã hỏi một phiên bản nào đó của mỗi câu hỏi này trong hai năm mà không biết rằng cô đang hỏi cùng một câu hỏi theo bốn cách khác nhau. Buổi gặp nhà đầu tư đã làm cho nó rõ ràng. Mọi lựa chọn cô đã giải thích một cách tự tin đều quay về cùng bốn trục.

**1. Mẫu truy cập là gì?**

Dữ liệu được ghi và đọc như thế nào? Với tần suất nào? Bởi bao nhiêu người dùng đồng thời? Theo thứ tự nào? Theo khóa nào?

Câu hỏi này xác định việc lựa chọn công nghệ ở cấp độ cơ bản nhất. DynamoDB vs Aurora vs Redshift vs Athena — câu trả lời đúng phụ thuộc gần như hoàn toàn vào mẫu truy cập.

**2. Quy mô là gì?**

Không chỉ bây giờ — trong 12 tháng, trong 5 năm. Quy mô thay đổi câu trả lời đúng. Những gì hoạt động ở 100 request mỗi ngày bị hỏng ở 100 triệu. Những gì là quá mức ở 10 người dùng là cần thiết ở 10,000.

Và quy mô không chỉ là lưu lượng. Đó là quy mô nhóm (kiến trúc phải có thể được duy trì bởi nhóm mà bạn có). Đó là khối lượng dữ liệu. Đó là phạm vi địa lý.

**3. Hậu quả của thất bại là gì?**

Nếu điều này bị hỏng, điều gì xảy ra? Người dùng có thấy một trang chậm không? Một đơn hàng có thất bại không? Tiền có chuyển sai không? Bệnh án của ai đó có trở nên không thể truy cập không?

Hậu quả xác định bạn đầu tư bao nhiêu vào độ tin cậy. Một trang menu chậm cho phép eventual consistency. Một thanh toán thất bại đòi hỏi ghi đồng bộ và xác nhận rõ ràng.

**4. Ràng buộc chi phí là gì?**

Không chỉ tiền — mà còn cả độ phức tạp vận hành (bản thân nó là một dạng chi phí). Một giải pháp đòi hỏi ba dịch vụ bổ sung có thể vượt trội về mặt kỹ thuật so với một giải pháp đơn giản hơn nhưng quá đắt để duy trì với một nhóm bốn người.

"Khoan đã — nhưng *tại sao* mẫu truy cập lại quan trọng đến vậy?" Maya đã hỏi, hai năm trước, khi Tom lần đầu đề xuất tách danh mục menu khỏi cơ sở dữ liệu đơn hàng. "Chúng ta không thể chỉ tối ưu hóa sau này sao?"

Câu hỏi đó, hóa ra, là sự khởi đầu của câu trả lời. Bạn không thể tối ưu hóa một schema quan hệ cho các mẫu truy cập key-value mà không xây dựng lại nó. Mẫu truy cập phải được biết tại thời điểm thiết kế, không phải gắn thêm sau này. Mọi quyết định kiến trúc cô đã đưa ra kể từ đó đều bắt đầu với cùng một câu hỏi.

Bạn có thể đang tự hỏi: nếu "còn tùy" luôn là câu trả lời đúng, thì làm thế nào bạn có thể đưa ra một quyết định? Câu trả lời là hoàn thành câu nói buộc bạn phải gọi tên các điều kiện, và một khi bạn đã gọi tên chúng, bạn biết bạn cần thông tin gì. "Còn tùy vào mẫu truy cập" trở thành "hãy đi tìm hiểu mẫu truy cập thực sự là gì." Bốn câu hỏi không phải là một cách để tránh quyết định — chúng là một cách để đưa ra quyết định với thông tin đúng đắn.

**"Còn Tùy": Cách Hoàn Thành Câu Nói**

Cách đúng để nói "còn tùy" là hoàn thành nó ngay lập tức:

*"Chúng ta nên dùng DynamoDB hay Aurora?"*

"Còn tùy vào mẫu truy cập. Nếu bạn cần tra cứu dựa trên khóa thông lượng cao với schema linh hoạt, dùng DynamoDB. Nếu bạn cần tính nhất quán giao dịch trên các thực thể liên quan với các truy vấn phức tạp, dùng Aurora."

*"Chúng ta nên dùng Lambda hay EC2?"*

"Còn tùy vào đặc điểm của khối lượng công việc. Lambda cho các khối lượng công việc hướng sự kiện, thời gian ngắn, biến đổi, nơi chi phí nhàn rỗi bằng không là quan trọng. EC2 hoặc ECS cho các quy trình bền vững, stateful, hoặc chạy lâu, nơi hiệu suất có thể dự đoán quan trọng hơn chi phí nhàn rỗi."

*"Chúng ta nên dùng Multi-AZ hay Multi-Region?"*

"Còn tùy vào yêu cầu RTO/RPO và mô hình mối đe dọa của bạn. Multi-AZ bảo vệ chống lại các lỗi AZ (failure mode AWS phổ biến nhất) và cung cấp RPO ~0 và RTO ~60 giây cho RDS. Multi-Region bảo vệ chống lại các lỗi region (hiếm) và phục vụ những người dùng phân tán toàn cầu. Nếu bạn cần failover dưới một phút từ một thảm họa cấp region, dùng Multi-Region. Nếu khả năng phục hồi cấp AZ là đủ, Multi-AZ đơn giản hơn nhiều và rẻ hơn."

"Còn tùy" không phải là kết thúc của câu trả lời. Đó là khởi đầu của câu trả lời thực sự.


*"Chúng ta nên dùng EKS hay ECS cho điều phối container?"*

Nhà đầu tư đã hỏi câu này trước khi Maya chuyển sang slide tiếp theo. Cô dừng lại.

"Còn tùy vào quy mô nhóm, chuyên môn Kubernetes hiện có, và liệu bạn có cần các tính năng riêng của Kubernetes hay không."

"Hãy mở rộng điều đó," ông nói.

"Kubernetes là một nền tảng điều phối mạnh mẽ," Maya nói. "Nó có một hệ sinh thái phong phú — Helm charts, custom resource definition, multi-cluster federation, các chính sách lập lịch nâng cao. Nếu bạn có một nhóm biết Kubernetes, đã xây dựng công cụ xung quanh nó, và cần những khả năng đó, EKS là lựa chọn đúng. Bạn nhận được một control plane được quản lý, nhưng bạn vẫn đang quản lý độ phức tạp của Kubernetes về network policy, pod security, resource quota, và những thứ còn lại."

"Còn ECS?"

"ECS đơn giản hơn. Không có Kubernetes API. Không có etcd. Không có độ phức tạp pod networking. Bạn định nghĩa các task, service, và cluster. IAM tích hợp một cách tự nhiên mà không cần các plugin bổ sung. Mô hình tư duy nhỏ hơn đáng kể. Đối với một nhóm chưa biết Kubernetes, ECS loại bỏ nhiều tháng đường cong học tập."

"Nimbus đang dùng cái nào?"

"ECS," cô nói. "Chúng ta đã đánh giá EKS mười tám tháng trước. Chúng ta có một kỹ sư có kinh nghiệm Kubernetes. Những người khác sẽ cần 3 đến 4 tháng để trở nên hiệu quả trong một môi trường Kubernetes production. Các tính năng mà EKS sẽ mang lại cho chúng ta — quản lý đa cluster, lập lịch tùy chỉnh — chúng ta không cần. ECS với Fargate chạy các container của chúng ta. Nhóm đã hiệu quả trong hai tuần."

"Đó có phải là lựa chọn đúng ở 50 kỹ sư không?" ông hỏi.

"Có thể không," Maya nói. "Ở 50 kỹ sư với nhiều nhóm sản phẩm cần các namespace cô lập, các chính sách networking tùy chỉnh, và resource quota theo phạm vi nhóm — mô hình namespace của Kubernetes trở nên thực sự có giá trị. ECS không có sự cô lập namespace tương đương. Ở quy mô đó, đường cong học tập Kubernetes được phân bổ đều trên một nhóm lớn hơn nhiều. Câu trả lời 'còn tùy' chuyển dịch."

"Ở quy mô nhóm nào thì sự chuyển dịch xảy ra?" ông hỏi.

Cô đã suy nghĩ về điều này. "Quy tắc tôi dùng: khi chi phí vận hành của Kubernetes trở nên thấp hơn chi phí tổ chức của việc làm việc xoay quanh các hạn chế của ECS, hãy chuyển đổi. Đối với một nhóm 14 người, dùng ECS. Đối với một nhóm 50 người với nhiều mảng sản phẩm dọc, có lẽ là EKS. Con số không cố định — nó còn tùy vào những gì bạn đang xây dựng và ai đang xây dựng nó."

"Khoan đã — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya tự hỏi chính mình, lặp lại câu hỏi cô đã học được từ hai năm xây dựng. "Tại sao không chỉ chọn một cái và gắn bó với nó?"

Vì câu trả lời đúng thay đổi khi tổ chức thay đổi. Một quyết định kiến trúc được đưa ra cho một nhóm 4 người không nhất thiết đúng cho một nhóm 40 người. Các điều kiện thay đổi. Câu trả lời thay đổi theo chúng.

"Đó là vấn đề," cô nói với nhà đầu tư. "Câu trả lời đúng hôm nay là ECS. Câu trả lời đúng trong ba năm nữa có thể là EKS. Chúng ta sẽ xem xét lại khi các điều kiện đòi hỏi điều đó. Chúng ta có một ADR ghi lại tại sao chúng ta chọn ECS, và nó liệt kê rõ ràng điều gì sẽ kích hoạt việc xem xét lại."

Nhà đầu tư viết thêm một ghi chú nữa. "Đó là một cách trưởng thành để giữ một quyết định kỹ thuật."


**Biến Thể: Khi "Còn Tùy" Khiến Bạn Gặp Rắc Rối**

Nếu mẫu truy cập thiên về tra cứu key-value và bạn chọn DynamoDB, bạn sẽ vượt trội hơn Aurora ở quy mô lớn — nhưng nếu bạn thêm một tính năng đòi hỏi các truy vấn JOIN trên ba thực thể, bạn đã xây dựng nền tảng sai và sẽ cần phải di chuyển dưới áp lực. Câu trả lời "còn tùy" chỉ tốt bằng sự hiểu biết của bạn về các điều kiện mà bạn đang phụ thuộc vào.

Nếu bạn tối ưu hóa cho quy mô hiện tại và mẫu truy cập hiện tại, bạn sẽ đưa ra quyết định đúng cho hôm nay — nhưng nếu lưu lượng tăng 50 lần trong một năm mà kiến trúc của bạn không thích nghi, quyết định đúng cho ngày đầu tiên trở thành nút thắt cổ chai cho ngày thứ 365. Bốn câu hỏi phải được hỏi không chỉ tại thời điểm thiết kế mà còn được xem xét lại khi hệ thống phát triển.

**Các Mẫu Không Thay Đổi**

Trong khi các lựa chọn công nghệ cụ thể phát triển — các dịch vụ mới ra mắt, giá thay đổi, các lựa chọn thay thế tốt hơn xuất hiện — một số mẫu nền tảng đã ổn định trong nhiều thập kỷ:

**Tách biệt mối quan tâm**: Các thành phần làm những việc khác nhau nên độc lập. Một thay đổi ở cái này không nên đòi hỏi một thay đổi ở cái khác. Đây là lý do tại sao bạn tách rời bằng SQS, không phải các lệnh gọi trực tiếp. Tại sao bạn dùng S3 cho các object, không phải cơ sở dữ liệu. Tại sao tầng web và tầng cơ sở dữ liệu là riêng biệt.

**Bảo vệ theo chiều sâu**: Không có biện pháp kiểm soát bảo mật đơn lẻ nào là đủ. Bạn có IAM, security group, NACL, WAF, GuardDuty, Secrets Manager, KMS. Nếu một lớp thất bại, lớp tiếp theo bắt lấy nó.

**Trả tiền cho những gì bạn dùng, khi bạn dùng nó**: Nguyên tắc kinh tế nền tảng của cloud. Lambda thu nhỏ về không. Spot instance dùng năng lực dư thừa. Các chính sách lifecycle của S3 chuyển dữ liệu lạnh sang lưu trữ rẻ hơn. DynamoDB on-demand tính phí theo từng request. Tom đã hỏi "Cái đó tốn bao nhiêu mỗi tháng?" mười nghìn lần trong hai năm. Câu hỏi đó — được hỏi một cách nhất quán, được trả lời một cách nghiêm túc — đã biến thành gần $36,000 tiết kiệm hàng năm. Các mẫu khác nhau; nguyên tắc giống nhau.

**Tối ưu hóa cho thất bại có khả năng xảy ra nhất**: Multi-AZ trước (các lỗi AZ xảy ra). Cross-region DR thứ hai (các lỗi region hiếm hơn). Dự phòng trong-AZ (nhiều instance) trước khi đến độ phức tạp cross-region. Xây dựng cho thất bại thực tế, không phải thất bại thảm khốc nhưng khó xảy ra.

**Đo lường trước khi tối ưu hóa**: Cách tiếp cận của Tom — kéo các metric CloudWatch, hiểu mẫu thực tế, rồi đưa ra quyết định — có giá trị hơn việc tối ưu hóa sớm dựa trên các giả định. Bản năng của Leo về các batch job hàng đêm — "Sẽ ổn thôi" — là điều quan trọng nhất cần tự rèn để loại bỏ. Nó thường ổn, cho đến một lần nó không ổn, và bạn đã không đo lường bất cứ điều gì.


**Chi phí tích lũy của các giá trị mặc định sai**.

Tom có thêm một mẫu nữa để thêm vào danh sách, một mẫu mà anh chỉ xác định được sau ba tháng review chi phí: chi phí của việc không thay đổi giá trị mặc định.

Các dịch vụ AWS được thiết kế để an toàn và hoạt động được ngay khi dùng. Các giá trị mặc định không được thiết kế để tối ưu cho mọi khối lượng công việc. gp2 là loại volume EBS mặc định cho đến khi gp3 ra mắt vào tháng 12 năm 2020. Sau đó, gp3 trở thành mặc định cho các volume mới — nhưng các volume gp2 hiện có không bao giờ được chuyển đổi, vì AWS không sửa đổi các tài nguyên hiện có của khách hàng mà không có hành động rõ ràng.

Hệ quả về chi phí: mọi nhóm tạo các volume EBS trước gp3 và không bao giờ chạy một cuộc kiểm toán di chuyển đã trả nhiều hơn 25% cho mỗi GB trong nhiều năm, không phải vì họ đưa ra quyết định sai, mà vì họ không đưa ra quyết định nào cả. Giá trị mặc định vẫn tồn tại, và chi phí tích lũy một cách âm thầm.

Đây là lý do tại sao câu hỏi "khoan đã, nhưng tại sao chúng ta lại làm theo cách đó?" đã trở thành điều có giá trị nhất mà nhóm hỏi. Nó không phải lúc nào cũng về việc thách thức một quyết định đã được đưa ra. Đôi khi nó về việc đặt câu hỏi về một sự không-quyết-định: một giá trị mặc định được chấp nhận mà không được xem xét.

Mẫu này khái quát hóa: xem xét lại các giá trị mặc định khi AWS ra mắt một tùy chọn mới. gp2 sang gp3. DynamoDB On-Demand sang provisioned với Auto Scaling khi lưu lượng ổn định. S3 Standard sang Intelligent-Tiering khi các mẫu truy cập trở nên không chắc chắn. Việc xem xét lại không cần phải tốn kém — một buổi chiều phân tích cho mỗi danh mục, mỗi quý. Nhưng nó không thể bị bỏ qua. Các giá trị mặc định tích lũy.

"Mỗi đô la chúng ta đang chi cho thứ gì đó chúng ta đã chọn là một chi phí có chủ ý," Tom nói, trong buổi review hàng tháng. "Mỗi đô la chúng ta đang chi cho thứ gì đó chúng ta chưa xem xét lại kể từ khi cấp phát nó là một giá trị mặc định tiềm năng cần được đặt câu hỏi."

"Chúng ta có bao nhiêu cái như vậy?" Maya hỏi.

"Ít hơn so với sáu tháng trước," anh nói. "Nhiều hơn không."

Đó là câu trả lời trung thực. Nó luôn là câu trả lời trung thực.


**Những Gì Quyển Sách Này Không Thể Dạy Bạn**

Hãy thẳng thắn về các giới hạn.

Quyển sách này đã dạy bạn:

- Mỗi dịch vụ AWS chính làm gì
- Các phép ẩn dụ khiến chúng trở nên trực quan
- Các đánh đổi giữa các lựa chọn thay thế
- Kiến thức thi mà bạn cần cho SAA-C03
- Một khung để suy nghĩ về các quyết định kiến trúc

Quyển sách này không thể dạy bạn:

- **Bản năng production**: Cảm giác mách bảo "cái này sẽ trở nên kỳ lạ dưới tải" trước khi bạn thấy nó xảy ra. Điều này đến từ việc vận hành các hệ thống thực.
- **Phán đoán kỹ thuật dưới áp lực**: Quyết định phải làm gì lúc 3 giờ sáng khi hệ thống bị down và bạn có thông tin không đầy đủ. Điều này đến từ các sự cố.
- **Trực giác về các bên liên quan**: Biết khi nào nên phản đối một yêu cầu kinh doanh vì chi phí kỹ thuật quá cao. Điều này đến từ kinh nghiệm với cả hai mặt kỹ thuật và kinh doanh.
- **Câu hỏi đúng cho ngữ cảnh cụ thể**: Carlos có thể hỏi đúng câu hỏi vì anh đã thấy những vấn đề tương tự hàng chục lần. Kiến thức này được kiếm được, không phải đọc được.

Bạn chưa học xong. Bạn mới chỉ vừa bắt đầu.

**Kỳ Thi Không Phải Là Đích Đến**

Bạn đã cầm quyển sách này lên để chuẩn bị cho kỳ thi AWS Solutions Architect Associate. Điều đó hợp lệ. Chứng chỉ SAA-C03 là thực, có giá trị, và sẽ mở ra những cánh cửa.

Nhưng kỳ thi kiểm tra kiến thức và nhận biết mẫu. Nó không kiểm tra phán đoán. Nó không kiểm tra kinh nghiệm vận hành. Nó không kiểm tra những gì bạn làm khi kiến trúc bạn đã xây dựng ngừng hoạt động lúc 11 giờ tối một thứ Sáu.

Chứng chỉ là một thông tin xác thực khởi đầu. Khi bạn đậu kỳ thi, bạn sẽ biết các dịch vụ AWS hoạt động như thế nào và cách chúng kết hợp. Bạn sẽ có một khung để suy nghĩ về kiến trúc. Bạn sẽ chưa làm điều đó.

Bước tiếp theo sau kỳ thi: xây dựng một thứ gì đó thực. Triển khai nó. Vận hành nó. Xem nó thất bại. Sửa nó. Hết tiền ở một dịch vụ và chuyển chi phí sang chỗ khác. Bị gọi giữa đêm và đưa ra một quyết định với thông tin không đầy đủ.

Đó là cách kiến thức trong quyển sách này trở thành phán đoán.

**Câu Trả Lời Cuối Cùng Của Maya**

Cuối buổi gặp nhà đầu tư, đối tác kỹ thuật có thêm một câu hỏi nữa.

"Nếu bạn bắt đầu lại từ đầu ngày hôm nay, biết những gì bạn biết bây giờ, bạn sẽ làm gì khác đi?"

Maya dành một chút thời gian.

"Tôi sẽ bắt đầu với infrastructure as code từ ngày đầu tiên," cô nói. "Leo đã triển khai instance EC2 đầu tiên một cách thủ công. Chúng ta đã dành sáu tháng để di chuyển mọi thứ sang Terraform. Đó là sáu tháng nợ kỹ thuật khiến chúng ta mất thời gian thực sự."

"Còn gì nữa?"

"Tôi sẽ thận trọng hơn về các managed service trong giai đoạn đầu. Chúng ta đã dùng DynamoDB khi một cơ sở dữ liệu RDS đơn giản lẽ ra đã đủ trong nhiều tháng. Việc thiết kế mẫu truy cập DynamoDB đòi hỏi tư duy có kinh nghiệm mà chúng ta chưa có. Chúng ta đã thiết kế lại schema hai lần."

"Vậy đơn giản hơn thì tốt hơn trong giai đoạn đầu?"

"Đơn giản hơn thì tốt hơn *luôn luôn*. Câu hỏi luôn là: điều đơn giản nhất giải quyết được vấn đề thực sự là gì, không phải vấn đề tương lai được dự đoán? Chúng ta đã thêm độ phức tạp để giải quyết các vấn đề mà chúng ta chưa có. Một số độ phức tạp đó đã gây ra vấn đề của chính nó."

Đối tác kỹ thuật viết điều đó xuống.

"Câu hỏi cuối cùng," ông nói. "Điều quan trọng nhất mà bạn biết về việc xây dựng trên AWS mà bạn đã không biết khi bắt đầu là gì?"

Maya nghĩ về hai năm. Các sự cố. Các cuộc review chi phí. Cuộc Well-Architected review. Các quyết định kiến trúc được đưa ra dưới áp lực và những cái được đưa ra một cách cẩn thận. Những cái họ làm đúng và những cái họ phải làm lại.

"Rằng cloud không giải quyết các vấn đề kiến trúc," cô nói. "Nó khuếch đại chúng. Một quyết định tồi trên on-premises có thể tốn của bạn một tuần. Một quyết định tồi trên cloud có thể tốn tiền mỗi tháng, ở quy mô lớn, cho đến khi ai đó để ý."

Cô dừng lại.

"Cloud khiến các quyết định tốt mở rộng theo quy mô. Và các quyết định tồi cũng vậy."

Tối hôm đó, Maya kể cho Tom, Priya, và Leo về buổi gặp nhà đầu tư.

"Ông ấy hỏi về các lựa chọn cơ sở dữ liệu," cô nói. "Tất cả chúng."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi ngay lập tức, đó chính xác là câu hỏi sai và đồng thời cũng là câu hỏi đúng. "Ông ấy có hỏi về mô hình chi phí không?"

"Có. Tôi đã giải thích về Savings Plans, việc chuyển DynamoDB sang provisioned. Ông ấy gật đầu."

"Còn nếu ai đó cố đột nhập thì sao?" Priya hỏi. "Các câu hỏi bảo mật có được nêu ra không?"

"IAM, mã hóa, GuardDuty. Có. Ông ấy có vẻ hài lòng."

Leo đã im lặng. "Ông ấy có hỏi về những phần không suôn sẻ không?"

"Ông ấy hỏi tôi sẽ làm gì khác đi. Tôi đã kể cho ông ấy về việc bắt đầu với infrastructure as code, và thận trọng hơn về các managed service trong giai đoạn đầu."

"Cái schema DynamoDB mà chúng ta thiết kế lại hai lần," Leo nói. "Tôi luôn cảm thấy đó là lỗi của tôi."

"Đó là lỗi của tất cả chúng ta," Maya nói. "Đó là vấn đề."

**Lời Kết**

Bạn đã học được rất nhiều. Các dịch vụ AWS. Các đánh đổi. Các mẫu.

Bây giờ hãy làm điều gì đó với nó.

Xây dựng một thứ gì đó. Cố tình mắc lỗi. Đọc các post-mortem (chúng là công khai — AWS, Cloudflare, GitHub, Stripe đều xuất bản chúng). Làm việc với những nhóm giỏi hơn bạn ở những điều mà bạn yếu nhất.

Kỳ thi SAA-C03 sẽ kiểm tra xem bạn có biết tài liệu không. Sự nghiệp của bạn sẽ kiểm tra xem bạn có thể áp dụng nó không.

Cả hai đều đáng làm. Cả hai đều không phải là đích đến cuối cùng.

Không có đích đến cuối cùng trong lĩnh vực này. Chỉ có vấn đề tiếp theo, quyết định tiếp theo, và thói quen hỏi câu hỏi tiếp theo đúng đắn.

**Những Bài Học Không Lọt Vào Bộ Slide**

Trên chuyến tàu trở về từ Seattle, Maya kể cho Leo và Priya về hai điều mà cô đã mừng vì nhà đầu tư đã không hỏi trực tiếp — vì những câu trả lời trung thực sẽ mất hai mươi phút mỗi cái.

**Sự cố pipeline analytics**.

Tám tháng trước, pipeline analytics đã được ghép nối với dịch vụ xử lý đơn hàng chính. Các sự kiện đơn hàng được ghi vào cùng một SQS queue mà pipeline analytics tiêu thụ. Sự ghép nối có vẻ hợp lý: analytics cần dữ liệu đơn hàng, xử lý đơn hàng tạo ra dữ liệu đơn hàng.

Vào một tối thứ Tư, một lỗi trong Lambda tổng hợp analytics khiến nó ngừng tiêu thụ từ queue. Độ sâu của queue tăng lên. Vì dịch vụ xử lý đơn hàng dùng chung cùng một SQS queue cho các tin nhắn xác nhận của nó, cả pipeline analytics và đường xác nhận đơn hàng đều bị dồn ứ đồng thời. Các đối tác nhà hàng bắt đầu thấy chậm trễ xác nhận. SQS queue đang tiến gần đến giới hạn lưu giữ tin nhắn của nó.

"Tôi đã triển khai bản sửa rồi," Leo đã nói, lúc 11 giờ tối hôm đó — rồi dừng lại. Bản sửa cho lỗi analytics sẽ đòi hỏi một lần triển khai lại Lambda để xóa sạch queue, nhưng anh đã không kiểm tra liệu các tin nhắn xác nhận đơn hàng trong queue có còn nằm trong visibility timeout của chúng hay không. Nếu timeout đã hết hạn, Lambda sẽ xử lý lại chúng, và các đối tác nhà hàng sẽ nhận được các xác nhận đơn hàng trùng lặp.

Sự cố đã kéo dài ba giờ và đòi hỏi hai lần rollback.

Bài học kiến trúc thì đơn giản: analytics và xử lý vận hành không bao giờ nên dùng chung cùng một queue. Chúng có các đặc điểm hiệu suất khác nhau, các failure mode khác nhau, và các hậu quả khác nhau khi chúng thất bại. Ghép nối chúng có nghĩa là một thất bại trong đường ưu tiên thấp hơn có thể làm suy giảm đường ưu tiên cao hơn.

Sau sự cố, Nimbus tách hoàn toàn các pipeline. Các sự kiện đơn hàng đi tới một queue vận hành riêng. Một quy tắc EventBridge riêng sao chép các sự kiện sang một queue chỉ dành cho analytics. Hai pipeline không có cơ sở hạ tầng chung ngoại trừ nguồn sự kiện. Lần tiếp theo Lambda analytics có một lỗi — và nó có, hai tháng sau — nó thất bại một cách âm thầm, queue analytics bị dồn ứ, các báo cáo buổi sáng đến muộn, và đường xác nhận đơn hàng hoàn toàn không bị ảnh hưởng.

"Tách biệt mối quan tâm," Priya đã nói, sau lỗi Lambda analytics thứ hai. "Cùng một nguyên tắc ở cấp độ cơ sở hạ tầng như ở cấp độ code. Hai thứ thất bại khác nhau không nên dùng chung cùng một failure domain."

**Sự trừu tượng hóa sớm.**

Ba tháng trước Series A, Leo đã đề xuất xây dựng một dịch vụ cấu hình nhà hàng tổng quát. Nimbus có ba loại cấu hình riêng của nhà hàng vào thời điểm đó: cài đặt menu, tham số vùng giao hàng, và tùy chọn thông báo. Một dịch vụ cấu hình tổng quát, Leo lập luận, sẽ cho phép họ thêm các loại cấu hình mới mà không cần xây dựng logic lưu trữ và truy xuất mới mỗi lần.

Nhóm đã xây dựng nó. Hai tuần để thiết kế mô hình dữ liệu. Một tuần để triển khai dịch vụ. Một tuần nữa để di chuyển ba loại cấu hình hiện có vào nó. Tổng cộng bốn tuần.

Đến khi họ hoàn thành việc xây dựng dịch vụ cấu hình tổng quát, họ có... ba loại cấu hình. Vẫn ba loại như trước đó. Dịch vụ tổng quát không thêm khả năng mới nào; nó chỉ khiến khả năng hiện có trở nên khó hiểu hơn. Cái schema key-value khiến dịch vụ trở nên "tổng quát" cũng khiến nó không thể thêm validation hoặc ràng buộc kiểu mà không xây dựng một schema registry trên nó.

"Chúng ta đã xây một framework cho một thư viện," Tom nói, khi anh kể câu chuyện nhà đầu tư cho Leo.

"Điều đó có nghĩa là gì?" Leo hỏi.

"Chúng ta có ba cuốn sách. Chúng ta đã xây một hệ thống quản lý thư viện để sắp xếp chúng. Lẽ ra tốt hơn là chỉ đặt ba cuốn sách lên một cái kệ."

Dịch vụ cấu hình đã bị âm thầm khai tử tám tháng sau, khi nhóm phát triển đủ lớn để bốn kỹ sư đã dành thời gian không nhỏ để học cách nó hoạt động trước khi phát hiện ra nó là một lớp bọc mỏng quanh một bảng DynamoDB. Họ di chuyển trở lại truy cập DynamoDB trực tiếp với các schema có kiểu cho mỗi loại cấu hình trong hai ngày.

"Bốn tuần để xây nó," Tom nói. "Hai ngày để gỡ bỏ nó. Cộng với chi phí liên tục của việc giải thích nó cho mỗi kỹ sư mới."

"Quyết định đúng là gì?" Priya hỏi.

"Xây dịch vụ cấu hình khi bạn có hơn mười loại cấu hình và mẫu rõ ràng đã ổn định," Tom nói. "Không phải khi bạn có ba cái và bạn đang suy đoán về các nhu cầu tương lai. Sự trừu tượng hóa là sớm. Các nhu cầu mà nó được thiết kế cho đã không trở thành hiện thực."

"Chúng ta đã nghĩ đến điều gì xảy ra nếu chúng ta xây dựng các trừu tượng hóa trước khi chúng ta hiểu không gian vấn đề chưa?" Priya hỏi.

"Chúng ta vừa mô tả nó," Tom nói. "Bạn dành thời gian duy trì một trừu tượng hóa tốn nhiều hơn vấn đề mà nó đang giải quyết."

Maya thêm điều này vào mô hình tư duy của cô về các phản mẫu kiến trúc: dịch vụ tổng quát được xây cho ba trường hợp sử dụng. Pipeline bị ghép nối. Quyết định định cỡ đúng được đưa ra trên một cửa sổ quan sát không đầy đủ. Mỗi cái là một quyết định có ý nghĩa cục bộ, trong khoảnh khắc đó, với thông tin có sẵn. Mỗi cái hóa ra sai theo những cách chỉ trở nên rõ ràng sau này.

"Những cái trông ổn trên giấy," cô nói với Priya, "là những cái tốn của bạn nhiều nhất."

"Vì bạn không xem xét lại chúng," Priya nói. "Bạn nhìn vào thiết kế, nó mạch lạc, logic vững vàng, và bạn tiếp tục. Failure mode là vô hình cho đến khi hệ thống ở dưới một tải hoặc một áp lực mà phiên bản trên giấy chưa bao giờ mô hình hóa."

"Đó là lý do tại sao architecture review quan trọng," Maya nói. "Không phải vì người review biết nhiều hơn. Mà vì họ sẽ hỏi câu hỏi mà bạn không nghĩ đến để hỏi."


## Tóm Tắt

Buổi gặp nhà đầu tư đã diễn ra tốt đẹp. Không phải vì Maya đã ghi nhớ cấu trúc giá của mọi dịch vụ, mà vì cô có thể trả lời *tại sao* cho mọi lựa chọn mà Nimbus đã đưa ra. Những câu trả lời "còn tùy" mà cô đã đưa ra đều chính xác, có điều kiện, và bắt nguồn từ cùng bốn câu hỏi mà cô đã hỏi, theo nhiều hình thức khác nhau, trong hai năm.

- **"Còn tùy" là khởi đầu của câu trả lời**, không phải kết thúc. Luôn hoàn thành câu nói với các điều kiện mà nó phụ thuộc vào.
- Bốn câu hỏi bên dưới mỗi đánh đổi kiến trúc: mẫu truy cập, quy mô, hậu quả của thất bại, ràng buộc chi phí.
- Các mẫu bền vững: tách biệt mối quan tâm, bảo vệ theo chiều sâu, trả tiền cho những gì bạn dùng, tối ưu hóa cho thất bại có khả năng xảy ra, đo lường trước khi tối ưu hóa.
- **Cloud khuếch đại các quyết định** — cả tốt lẫn tồi. Một quyết định tồi trên on-premises tốn một tuần; một quyết định tồi trên cloud tích lũy hàng tháng, ở quy mô lớn.
- Chứng chỉ SAA-C03 kiểm tra kiến thức và nhận biết mẫu. Kinh nghiệm production biến kiến thức đó thành phán đoán.

## Mẹo Thi

*SAA-C03 Domain: Xuyên domain — tất cả các domain*

Chương này khép lại nội dung thi của quyển sách này. Trước khi bạn bước vào kỳ thi:

**Xem lại các dịch vụ mà bạn ít tự tin nhất**:

- Đối với hầu hết mọi người: Kinesis vs SQS (sự phân biệt giữa stream và queue)
- VPC networking (route table, subnet, NAT Gateway, Internet Gateway)
- Logic đánh giá policy IAM (deny rõ ràng > allow rõ ràng > deny ngầm định)
- Lựa chọn storage class (biết cả tám storage class của S3 và các đánh đổi của chúng)
- RDS vs Aurora vs DynamoDB cho các trường hợp sử dụng cụ thể

**Biết cấu trúc kịch bản điển hình của kỳ thi**:

SAA-C03 trình bày một yêu cầu kinh doanh ("công ty cần khả dụng 99.99%") và yêu cầu bạn xác định kiến trúc đáp ứng nó. Luôn đọc yêu cầu, xác định ràng buộc then chốt, và loại bỏ các lựa chọn không đáp ứng nó.

**Thực hành nhận biết phương án gây nhiễu**:

Mỗi câu trả lời sai trong kỳ thi đều sai vì một lý do cụ thể. Học cách xác định *tại sao* mỗi câu trả lời sai có giá trị hơn việc ghi nhớ các câu trả lời đúng.

**Kỳ thi thưởng cho việc nhận biết mẫu**:

- "Tách rời" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Độ trễ thấp toàn cầu" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Tuân thủ/kiểm toán" → CloudTrail, Config, Security Hub, Macie
- "Tối ưu hóa chi phí" → Spot Instances, Savings Plans, các chính sách lifecycle, right-sizing

**Bạn đã sẵn sàng**. Không phải vì quyển sách này bao gồm mọi thứ — không có gì làm được điều đó. Mà vì bạn hiểu các nguyên tắc đủ sâu để lý luận đến câu trả lời ngay cả khi bạn không ngay lập tức nhận ra kịch bản chính xác.

## Bài Tập

**Bài Tập Cuối Cùng**

Không còn câu hỏi thi có cấu trúc nào sau chương này.

Thay vào đó: một câu hỏi mở.

Bạn sẽ xây dựng hệ thống nào ngày hôm nay, biết những gì bạn biết?

Hãy viết nó xuống. Phác thảo kiến trúc. Xác định các dịch vụ. Ghi chú các đánh đổi mà bạn sẽ thực hiện và tại sao. Dự đoán các failure mode.

Rồi xây dựng nó.

Đó là bài tập. Không có hạn chót. Không có điểm số. Chỉ có công việc.

## Cảnh Sau Tín Dụng

Khoản đầu tư đã được chấp thuận.

Series A. $4 triệu. Đủ để mở rộng sang năm thành phố mới, tăng gấp ba lần nhóm kỹ thuật, và xây dựng Nimbus Instant.

Tối hôm đó, Maya ở nhà hàng của gia đình. Cái nhà hàng gốc. Cái nơi Nimbus bắt đầu, khi cô nhận ra họ đang mất các đơn hàng vì điện thoại luôn bận.

Cô gọi arepa — món ăn cô luôn gọi.

Trong khi chờ đợi, cô mở laptop và đọc chương đầu tiên của quyển sách này.

*"Một website tồn tại ở đâu?"*

Cô nhớ mình đã không biết câu trả lời.

Cô mỉm cười.

Cô đóng laptop lại.

Thức ăn đến.

Nó hoàn hảo.

Trong chương tiếp theo: điều gì thay đổi khi công việc không còn là xây dựng hệ thống — mà là chịu trách nhiệm về nó.
