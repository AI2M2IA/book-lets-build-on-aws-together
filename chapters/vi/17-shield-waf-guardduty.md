# Chương 17: Những Người Canh Gác

Sự cố với IP Romania đã được chứa. Các bí mật ở trong Secrets Manager. Các thông tin xác thực đã được xoay vòng. Các kiểm soát mạng đã được siết chặt.

Nhưng Priya đã hỏi câu hỏi kết thúc Chương 16: "Nếu một thứ gì đó bất thường xuất hiện trong CloudTrail, làm sao chúng ta biết?"

Câu trả lời thành thật là: họ có lẽ sẽ không biết.

---

*Mọi thứ có thể được khóa đã được khóa. Các bí mật ở trong Secrets Manager. Các khóa mã hóa ở trong KMS. Lưu lượng mạng được kiểm soát bởi các security group và các NACL. Các phòng thủ vành đai vững chắc. Nhưng các phòng thủ vành đai giả định bạn biết một cuộc tấn công trông như thế nào trước khi nó đến. Câu hỏi Priya đang hỏi thì khác: còn các cuộc tấn công bạn không thấy đến thì sao?*

---

CloudTrail ghi log hàng nghìn sự kiện mỗi ngày. Không ai đọc tất cả chúng. Priya kiểm tra thủ công mỗi tuần, nhưng điều đó nghĩa là một thứ gì đó có thể xảy ra vào một thứ Ba và không được nhận thấy cho đến thứ Hai tiếp theo.

"Chúng ta cần một thứ gì đó theo dõi các log thay chúng ta," cô nói.

Maya ngước nhìn. "Tự động?"

"Tự động."

"Và nếu ai đó cố gắng đột nhập thì sao?" Priya tiếp tục. "Không chỉ một thông tin xác thực bị xâm phạm — nếu ai đó tung ra một DDoS thì sao? Nếu họ bắt đầu thăm dò các endpoint API của chúng ta tìm các lỗ hổng injection thì sao? Nếu họ đã ở bên trong và chúng ta không biết thì sao?"

"Đó là ba vấn đề khác nhau," Leo nói.

"Đúng," Priya nói. "Và AWS có ba dịch vụ khác nhau để giải quyết chúng."

**Ba Danh Mục Mối Đe Dọa**

Các mối đe dọa bảo mật chống lại một ứng dụng đám mây nói chung thuộc ba danh mục:

**Các cuộc tấn công khối lượng (DDoS)**: Một kẻ tấn công gửi quá nhiều lưu lượng đến mức ứng dụng của bạn không thể phản hồi các người dùng hợp pháp. Cuộc tấn công có thể là hàng triệu yêu cầu HTTP, hoặc một lũ các gói TCP SYN được thiết kế để làm cạn kiệt bảng kết nối của máy chủ của bạn.

**Các cuộc tấn công ứng dụng (Khai thác)**: Một kẻ tấn công gửi các yêu cầu được chế tạo cụ thể được thiết kế để khai thác các điểm yếu trong ứng dụng của bạn — SQL injection, cross-site scripting, đầu vào dị dạng làm sập một parser.

**Các bất thường hành vi (Trinh sát và xâm phạm)**: Các lần gọi API không nên xảy ra (ai đó truy vấn cả cơ sở dữ liệu người dùng của bạn lúc 3 giờ sáng), hoạt động IAM bất thường (các thông tin xác thực được dùng từ một quốc gia mới), hoặc lưu lượng mạng đến các đích bất ngờ.

AWS có một dịch vụ chuyên dụng cho mỗi cái:

- **AWS Shield**: Bảo vệ DDoS
- **AWS WAF**: Bảo vệ cấp độ ứng dụng
- **Amazon GuardDuty**: Phát hiện mối đe dọa hành vi

**AWS Shield: Bộ Hấp Thụ DDoS**

**AWS Shield Standard** được bật tự động cho tất cả các khách hàng AWS mà không có phí bổ sung. Nó bảo vệ chống lại các cuộc tấn công DDoS lớp 3 (mạng) và lớp 4 (vận chuyển) phổ biến nhất — SYN flood, UDP flood, các cuộc tấn công khuếch đại DNS.

CloudFront, Route 53, và Elastic Load Balancing ngồi ở rìa mạng của AWS. Khi một cuộc tấn công DDoS nhắm vào ứng dụng của bạn, nó chạm vào các dịch vụ được quản lý này trước. Hạ tầng mạng của AWS hấp thụ cuộc tấn công trước khi nó đến các EC2 instance của bạn.

**AWS Shield Advanced** là bậc cao cấp ($3.000/tháng cho mỗi tổ chức, với cam kết một năm). Nó là một đăng ký riêng biệt — nó *không* được bao gồm trong bất kỳ gói AWS Support nào. Nó thêm:

- Bảo vệ cho EC2, ELB, CloudFront, Global Accelerator, và Route 53
- Các thông báo tấn công gần thời gian thực
- Quyền truy cập vào AWS Shield Response Team (SRT) — các kỹ sư bảo mật có thể giúp bạn phản ứng với các cuộc tấn công (việc tham gia SRT bổ sung đòi hỏi một gói Business hoặc Enterprise Support)
- Bảo vệ chi phí: nếu một cuộc tấn công khiến hóa đơn của bạn tăng vọt, AWS ghi có các chi phí tăng đột biến
- Phát hiện và giảm thiểu DDoS nâng cao ở lớp 7 (lớp ứng dụng)

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

"Ba nghìn đô la," Priya nói. "Cho mỗi tổ chức."

Tom im lặng một lúc.

"Đối với các doanh nghiệp xử lý hàng triệu doanh thu, một DDoS làm họ sập trong hai giờ tốn nhiều hơn ba nghìn đô la," Priya nói.

Tom làm toán lặng lẽ.

"Chúng ta sẽ bắt đầu với Standard," cuối cùng anh nói.

---

**Sự Cố DDoS: Shield Trông Như Thế Nào Khi Hoạt Động**

Tám tháng sau khi ra mắt, Nimbus nhận cuộc tấn công DDoS thật đầu tiên của nó.

Nó bắt đầu lúc 11:43 sáng một thứ Ba. Bảng điều khiển CloudWatch cho load balancer cho thấy các yêu cầu kết nối đến tăng vọt từ mức bình thường 3.000 mỗi phút lên 180.000 mỗi phút trong dưới chín mươi giây. Các IP nguồn được phân tán qua bốn mươi quốc gia, và khối lượng đến đạt đỉnh khoảng năm mươi gigabit mỗi giây. Mẫu không thể nhầm lẫn: một botnet tung ra một SYN flood.

Leo thấy các chỉ số CloudFront đầu tiên. "Tỷ lệ yêu cầu tăng sáu mươi lần. Thời gian phản hồi đang tăng vọt."

Priya kéo các chỉ số CloudWatch lên cạnh nhau: các nỗ lực kết nối ở edge leo lên theo chiều dọc, các yêu cầu thực sự đến origin — phẳng. "Shield Standard đang ăn nó," cô nói. Không có cảnh báo, không có sự kiện bảng điều khiển, không có thông báo. Shield Standard hoạt động lặng lẽ: nó luôn bật, nó miễn phí, và nó cho bạn **không có khả năng nhìn thấy cuộc tấn công** — không console sự kiện, không thông báo, không nhóm phản hồi DDoS. (Khả năng nhìn thấy đó — các bảng điều khiển và cảnh báo tấn công gần thời gian thực — chính xác là cái mà Shield *Advanced* bán.) Cách duy nhất Priya có thể thấy cuộc tấn công chút nào là qua các chỉ số CloudWatch của chính cô.

Shield Standard đã tự động phát hiện SYN flood và tham gia giảm thiểu trong hai phút đầu tiên. Lưu lượng tấn công đang được hấp thụ ở các node edge của CloudFront toàn cầu — cùng hơn 750 điểm hiện diện phục vụ nội dung hợp pháp cũng hấp thụ khối lượng tấn công.

Đến 11:52 sáng — chín phút sau khi cuộc tấn công bắt đầu — việc giảm thiểu của Shield đã đưa tỷ lệ yêu cầu ở origin về bình thường. Cuộc tấn công vẫn đang chạy ở cấp độ mạng, nhưng việc giảm thiểu đang xử lý nó. Ứng dụng Nimbus tiếp tục phục vụ người dùng suốt thời gian.

"Người dùng không nhận thấy?" Leo hỏi, nhìn chỉ số tỷ lệ lỗi.

"Tỷ lệ lỗi tăng khoảng hai phần trăm trong khoảng bốn phút," Priya nói. "Một số người dùng nhận một phản hồi hơi chậm hơn. Không có sự cố ngừng hoạt động. Ứng dụng vẫn hoạt động."

"Vì Shield hấp thụ lũ ở edge."

"Trước khi nó đến load balancer của chúng ta. SYN flood năm mươi gigabit chạm vào CloudFront. Đến lúc mẫu lưu lượng được nhận diện và giảm thiểu, origin của chúng ta chỉ thấy khối lượng yêu cầu bình thường."

Cuộc tấn công kéo dài bốn mươi bảy phút. Đến 12:30 chiều các chỉ số edge đã trở về mức cơ sở — tín hiệu "đã giải quyết" duy nhất mà Shield Standard cho bạn.

"Và đây là Shield Standard," Tom nói. "Phiên bản miễn phí."

"Các cuộc tấn công lớp 3 và 4. Standard bảo vệ chống lại những cái đó tự động. Nếu cuộc tấn công tinh vi hơn — một HTTP flood lớp 7, ví dụ, nơi mọi yêu cầu trông hợp pháp — Standard sẽ không đủ. Cái đó đòi hỏi Shield Advanced cộng WAF."

Tom viết xuống "Giám sát các mẫu DDoS lớp 7" trong lộ trình bảo mật của anh.

---

**AWS WAF: Bộ Lọc Ứng Dụng**

**AWS WAF (Web Application Firewall)** hoạt động ở cấp độ HTTP — nó kiểm tra nội dung của các yêu cầu web trước khi chúng đến ứng dụng của bạn.

WAF được cấu hình với các **Web ACL (Access Control List)** — các bộ quy tắc xác định cái gì để cho phép, chặn, hoặc đếm.

WAF có thể được gắn vào:

- Các phân phối CloudFront (kiểm tra các yêu cầu ở edge, toàn cầu)
- Các Application Load Balancer (kiểm tra các yêu cầu ở cấp độ region)
- API Gateway
- AWS AppSync

**Các Quy Tắc Được Quản Lý WAF**: AWS và các nhà cung cấp bên thứ ba xuất bản các bộ quy tắc được xây dựng sẵn:

- **AWS Managed Rules - Core Rule Set**: Cùng với các nhóm quy tắc đồng hành (SQL database, Known Bad Inputs), bao phủ các lỗ hổng OWASP Top 10 (SQL injection, XSS, command injection, path traversal, v.v.)
- **AWS Managed Rules - Known Bad Inputs**: Chặn các yêu cầu khớp các mẫu tấn công đã biết
- **AWS Managed Rules - Amazon IP Reputation List**: Chặn các IP biết là liên quan đến các botnet và trình quét
- **AWS Managed Rules - Bot Control**: Xác định và quản lý lưu lượng bot

Bạn cũng có thể tạo các quy tắc tùy chỉnh:

- "Chặn bất kỳ yêu cầu nào với một header User-Agent chứa 'sqlmap'" (một trình quét SQL injection phổ biến)
- "Giới hạn tốc độ: cho phép không quá 1000 yêu cầu cho mỗi IP cho mỗi 5 phút"
- "Chặn các yêu cầu chứa `<script>` trong bất kỳ giá trị tham số nào"

Đối với Nimbus, thiết lập thực tế: WAF trên phân phối CloudFront với Core Rule Set được bật. Cái này chặn các mẫu tấn công phổ biến nhất trước khi các yêu cầu từng đến các EC2 instance.

Bạn có thể đang tự hỏi: nếu WAF chặn các mẫu tấn công đã biết, điều gì xảy ra khi một mẫu tấn công mới xuất hiện mà WAF không biết? Các bộ quy tắc được quản lý của WAF được cập nhật bởi AWS và các nhà cung cấp bên thứ ba khi các mối đe dọa mới xuất hiện — bạn không phải cập nhật các quy tắc thủ công. Nhưng bạn đúng rằng WAF về cơ bản phản ứng với các mẫu đã biết. Các kỹ thuật tấn công mới, mới lạ sẽ không bị chặn bởi một quy tắc chưa tồn tại. Đây là lý do GuardDuty tồn tại bên cạnh WAF: WAF lọc cửa trước, GuardDuty theo dõi hành vi bất thường bên trong nhà. Một loại tấn công mới có thể qua được WAF, nhưng GuardDuty vẫn có thể gắn cờ hoạt động bất thường mà nó gây ra — các lần gọi API bất thường, các đích mạng bất ngờ, các mẫu truy cập không khớp với mức cơ sở.

**Chúng ta đã nghĩ về điều gì xảy ra nếu WAF gây ra các báo động giả chưa?** Priya hỏi. "Một yêu cầu của người dùng hợp pháp bị chặn bởi Core Rule Set?"

"WAF có một chế độ 'Count'," Leo nói. "Thay vì chặn, nó chỉ đếm các yêu cầu khớp. Bạn chạy nó ở chế độ Count trước, xem lại nó sẽ chặn gì, xác minh không có báo động giả, rồi chuyển sang Block."

"Tốt," Priya nói. "Chúng ta bắt đầu ở chế độ Count."

---

**Tạo Một Quy Tắc WAF: Câu Chuyện Giới Hạn Tốc Độ**

Hai tuần sau khi bật WAF ở chế độ Count, Priya xem lại các log. Các phát hiện Core Rule Set sạch sẽ — không có báo động giả trên lưu lượng hợp pháp, một nhúm các nỗ lực SQL injection bị chặn từ các trình quét tự động.

Nhưng cô nhận thấy một mẫu mà Core Rule Set không gắn cờ: một địa chỉ IP đã thực hiện 847 yêu cầu đến `/api/search` trong năm phút. Mỗi yêu cầu hợp lệ về mặt cấu trúc. Nhưng 847 lần tìm kiếm trong năm phút không phải là một con người.

"Trình cào giá," cô nói. "Ai đó đang tự động truy vấn tìm kiếm nhà hàng của chúng ta để xây dựng một cơ sở dữ liệu giá cạnh tranh."

"Chúng ta có quan tâm không?" Leo hỏi.

"Nó dùng các tài nguyên tính toán của chúng ta và nó vi phạm điều khoản dịch vụ của chúng ta," Tom nói.

"Chúng ta quan tâm," Priya xác nhận.

Cô tạo một quy tắc dựa trên tốc độ WAF tùy chỉnh:

```
Tên quy tắc: RateLimitSearchAPI
Loại quy tắc: Quy tắc dựa trên tốc độ
Giới hạn tốc độ: 100 yêu cầu cho mỗi địa chỉ IP
Cửa sổ đánh giá: 5 phút (có thể cấu hình: 1, 2, 5, hoặc 10 phút)
Câu lệnh thu hẹp phạm vi: Đường dẫn URI bắt đầu với /api/search
Hành động: Block
```

Câu lệnh thu hẹp phạm vi quan trọng — giới hạn tốc độ chỉ áp dụng cho `/api/search`. Lưu lượng API hợp pháp đến các endpoint khác không bị ảnh hưởng. Và lưu ý cách việc chặn hoạt động: không có thời gian "phạt" cố định — WAF đánh giá lại tỷ lệ yêu cầu của mỗi IP liên tục, chặn nó trong khi tỷ lệ ở trên giới hạn, và bỏ chặn nó (thường trong vòng vài giây) một khi tỷ lệ giảm trở lại dưới.

Cô đặt nó ở chế độ Count trước. Chạy nó trong 24 giờ. IP duy nhất kích hoạt quy tắc là trình cào. Không người dùng hợp pháp nào từng gửi hơn 12 yêu cầu đến endpoint tìm kiếm trong năm phút.

Cô chuyển sang chế độ Block. Yêu cầu tiếp theo của trình cào nhận một 403. Nó chuyển sang một IP khác. Giới hạn tốc độ cũng bắt được cái đó.

"Họ sẽ vượt qua nó cuối cùng," Leo nói. "Phân tán qua nhiều IP hơn."

"Đến lúc đó họ đang dùng nhiều hạ tầng hơn, trả nhiều hơn, và nhận ít dữ liệu hơn," Priya nói. "Chúng ta không cần dừng họ hoàn toàn. Chúng ta cần làm nó đủ đắt để không đáng giá."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

Định giá WAF là theo mỗi Web ACL mỗi tháng, theo mỗi quy tắc mỗi tháng, và theo mỗi triệu yêu cầu. Đối với thiết lập Nimbus — một Web ACL, năm quy tắc trên CloudFront — khoảng 15 đô la mỗi tháng cộng các phí yêu cầu.

Tom phê duyệt nó ngay lập tức.

---

**Amazon GuardDuty: Nhà Phân Tích Hành Vi**

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Nếu WAF đang chặn các cuộc tấn công và Shield đang hấp thụ các lũ, tại sao chúng ta cần một dịch vụ thứ ba? GuardDuty thực sự đang theo dõi điều gì?"

WAF và Shield là các bộ lọc — chúng chặn lưu lượng xấu trước khi nó đến ứng dụng của bạn. GuardDuty theo dõi điều gì xảy ra sau khi lưu lượng đến. Nó nhìn vào những gì hạ tầng của bạn đang làm: các thông tin xác thực IAM nào đang được dùng, các domain nào các instance của bạn đang liên hệ, các lần gọi API nào đang xảy ra lúc 3 giờ sáng. Một kẻ tấn công vượt qua cửa trước qua một yêu cầu trông hợp pháp sẽ không bị dừng bởi WAF — nhưng GuardDuty sẽ nhận thấy rằng cùng một thông tin xác thực đột nhiên đang thực hiện các lần gọi API từ Romania.

GuardDuty về cơ bản khác với Shield và WAF. Nó không chặn các cuộc tấn công — nó **phát hiện hành vi bất thường**.

GuardDuty liên tục phân tích một số luồng hoạt động để phát hiện các mối đe dọa: **các sự kiện management và data của CloudTrail** (các lần gọi API và các hành động), **VPC Flow Logs** (các mẫu lưu lượng mạng), và **các log truy vấn DNS** (các lần tra cứu domain). Đây là ba nguồn nền tảng mà GuardDuty luôn dựa vào:

- **Các log AWS CloudTrail**: các thay đổi IAM, các lần gọi API, các lần đăng nhập console
- **VPC Flow Logs**: các mẫu lưu lượng mạng trong VPC của bạn
- **Các log truy vấn DNS**: những gì các instance của bạn đang phân giải (malware đã biết thường phân giải các domain C2 cụ thể)

Nhưng GuardDuty đã mở rộng đáng kể vượt ra ngoài ba cái này. AWS gọi các tiện ích bổ sung tùy chọn là **các protection plan** — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring, và Malware Protection — mỗi cái được bật riêng lẻ. Tùy thuộc cái nào bạn bật, GuardDuty cũng có thể phân tích **các sự kiện data S3** (các mẫu truy cập bất thường đến các bucket của bạn), **các log kiểm toán EKS và hoạt động runtime** (hành vi độc hại bên trong các container đang chạy), **các sự kiện đăng nhập RDS** (các nỗ lực đăng nhập cơ sở dữ liệu bất thường), **lưu lượng mạng Lambda** (các hàm gọi các đích bên ngoài bất ngờ), **hành vi runtime ECS/EC2**, và **các volume EBS được quét tìm malware**. Cho kỳ thi, biết ba nguồn cốt lõi thuộc lòng; các protection plan xuất hiện trong các kịch bản về các bối cảnh phát hiện mối đe dọa cụ thể — "phát hiện các nỗ lực đăng nhập bất thường đến RDS" hoặc "xác định hành vi độc hại bên trong một container đang chạy" là các tín hiệu để nghĩ về các protection plan tùy chọn của GuardDuty.

Các mô hình học máy xác định các mẫu lệch khỏi mức cơ sở của bạn. GuardDuty tạo ra các **phát hiện (finding)** — các cảnh báo được phân loại — khi nó phát hiện các bất thường.

Các ví dụ về những gì GuardDuty có thể phát hiện:

- Một IAM user đăng nhập từ một địa chỉ IP không được nhận diện (ở một quốc gia họ chưa bao giờ dùng trước đây)
- Các lần gọi API được thực hiện từ một nút thoát Tor
- Một EC2 instance giao tiếp với một pool đào tiền điện tử đã biết
- Khối lượng lần gọi API cao bất thường (lạm dụng thông tin xác thực hoặc quét)
- Một bucket S3 được truy cập bởi một địa chỉ IP đã bị gắn cờ vì hoạt động độc hại
- Lưu lượng đi đến một domain biết là liên quan đến command-and-control malware

"Đây là điều đã bắt được IP Romania," Leo nói thầm.

"Nếu chúng ta đã bật GuardDuty, nó sẽ đã gắn cờ EC2 instance thực hiện các kết nối đi đến một IP bên ngoài không được nhận diện lúc 2 giờ sáng," Priya xác nhận.

---

**Năm Loại Phát Hiện GuardDuty Và Phải Làm Gì**

Priya tạo một runbook cho năm phát hiện GuardDuty phổ biến nhất. Khi một phát hiện kích hoạt, đội ngũ biết ngay nó nghĩa là gì và phải làm gì.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Một IAM user đã đăng nhập thành công vào AWS Console từ một địa chỉ IP chưa được thấy cho tài khoản này trước đây, hoặc từ một vị trí địa lý không nhất quán với các lần đăng nhập trước.

Phản ứng: Xác minh với người dùng rằng họ khởi tạo lần đăng nhập. Nếu họ không — hoặc không thể liên lạc được — ngay lập tức: tắt access key và mật khẩu console của user, thu hồi các session đang hoạt động, và bắt đầu một cuộc kiểm toán CloudTrail về mọi thứ user đó đã làm trong 24 giờ qua. Phát hiện này thường đi trước lạm dụng thông tin xác thực.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Một EC2 instance đang truy vấn các địa chỉ IP hoặc các tên domain liên quan đến các pool đào tiền điện tử. Cái này hầu như luôn là kết quả của một EC2 instance bị xâm phạm và được dùng làm một bot đào.

Phản ứng: Cô lập instance ngay lập tức — sửa đổi security group của nó để chặn tất cả lưu lượng đến và đi ngoại trừ cho bastion host của bạn. Chụp một snapshot pháp y của volume EBS. Rồi chấm dứt instance và khởi chạy một cái thay thế từ một AMI sạch.

**3. Recon:EC2/PortProbeUnprotectedPort**

Một EC2 instance có một cổng mở ra internet đang bị thăm dò bởi các trình quét đã biết hoặc từ một nút thoát Tor. GuardDuty gắn cờ các cổng xuất hiện trong các flow log như có thể truy cập từ các nguồn bên ngoài.

Phản ứng: Xem lại các quy tắc security group. Nếu cổng được mở có chủ ý, đánh dấu phát hiện là đã giải quyết với một ghi chú. Nếu nó không phải có chủ ý, đóng cổng ngay lập tức. Kiểm tra CloudTrail tìm bất kỳ quyền truy cập nào có thể đã xảy ra qua cổng đó.

**4. Trojan:EC2/BlackholeTraffic**

Một EC2 instance đang cố giao tiếp với một địa chỉ IP đã được xác định là một "black hole" — một đích liên quan đến hạ tầng command-and-control malware. Lưu lượng đến các IP này gợi ý instance đã bị nhiễm và đang cố gọi về nhà.

Phản ứng: Giống như các phát hiện CryptoCurrency — cô lập, snapshot, thay thế. Phát hiện này chỉ ra malware đang hoạt động trên instance. Đừng cố dọn dẹp instance tại chỗ; xây dựng một cái mới từ một AMI sạch.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Ai đó đã tắt cài đặt Block Public Access trên một bucket S3. Cái này không nghĩa là bucket công khai — nó nghĩa là cơ chế an toàn ngăn phơi bày công khai do tai nạn đã bị tắt cho bucket đó. Cái này thường được làm do tai nạn hoặc như một phần của một triển khai bị cấu hình sai.

Phản ứng: Điều tra ai đã làm thay đổi (CloudTrail sẽ có lần gọi API). Bật lại Block Public Access trừ khi có một lý do được tài liệu hóa nó nên bị tắt. Cân nhắc bật cài đặt Block Public Access cấp độ tài khoản để ngăn phát hiện này xảy ra trong tương lai.

"Điều quan trọng nhất về các phát hiện GuardDuty," Priya nói, "là chúng không phải là các cảnh báo — chúng là các giả thuyết. Mỗi phát hiện nói 'mẫu này trông bất thường.' Bạn xác minh, bạn điều tra, bạn phản ứng. Một số sẽ là báo động giả. Hầu hết sẽ không."

"Chúng ta ưu tiên như thế nào?" Rafael hỏi.

"GuardDuty gán các mức độ nghiêm trọng: Thấp, Trung bình, Cao. Các phát hiện mức độ Cao đòi hỏi phản ứng trong ngày. Các phát hiện Trojan và xâm phạm thông tin xác thực luôn là Cao. Các phát hiện thăm dò cổng có thể là Trung bình hoặc Thấp. Bắt đầu với Cao, làm xuống."

---

"Nó tốn bao nhiêu?" Tom hỏi.

Định giá GuardDuty dựa trên khối lượng các log được phân tích — các sự kiện CloudTrail, dữ liệu VPC flow, các truy vấn DNS. Đối với một ứng dụng nhỏ đến trung bình, thường 50-150 đô la/tháng. Ở quy mô lớn, nó vẫn là một phần nhỏ của các chi phí hạ tầng.

Tom mở console lên và bật nó.

"Sẽ ổn thôi," Leo nói. "Nó chỉ là giám sát. Không phải nó sẽ làm hỏng cái gì."

"Tôi đã triển khai nó rồi," Leo thêm vào — rồi kiểm tra bảng điều khiển GuardDuty. "Ồ. Chỉ các phát hiện mẫu. Các cái thật mất một lúc."

"GuardDuty cần thời gian để xây dựng một mức cơ sở của bình thường trông như thế nào," Priya nói. "Cho nó vài ngày. Phát hiện thật đầu tiên sẽ đến — chúng luôn đến."

Cô hóa ra đúng về điều đó. Nhưng phát hiện đầu tiên là một câu chuyện cho cuối chương này.

**Kết Nối Ba Dịch Vụ**

Shield, WAF, và GuardDuty hoạt động ở các lớp khác nhau và bổ sung cho nhau:

| Dịch vụ    | Lớp                       | Bảo vệ chống lại                            | Hành động                          |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Mạng/Vận chuyển (L3/L4)   | Các lũ DDoS                                 | Hấp thụ/giảm thiểu các cuộc tấn công |
| AWS WAF    | Ứng dụng (L7)             | OWASP Top 10, các bot, các trình cào        | Cho phép, chặn, hoặc đếm các yêu cầu |
| GuardDuty  | Hành vi (tất cả các log)  | Các bất thường, các thông tin xác thực bị xâm phạm, malware | Phát hiện và cảnh báo  |

Shield dừng lũ. WAF lọc nước. GuardDuty theo dõi đường ống tìm các mẫu chảy bất thường. Macie kiểm toán những gì được lưu trữ trong các hồ chứa. Security Hub là phòng điều khiển nơi tất cả các bảng điều khiển nhìn thấy được cùng một lúc.

Chế độ thất bại của mỗi cái giải thích tại sao bạn cần tất cả chúng:

- Một SYN flood 50 Gbps không phải là một yêu cầu web. WAF không thể kiểm tra nó. GuardDuty có thể nhận thấy các sự kiện CloudTrail liên quan. Shield dừng nó.
- Một yêu cầu SQL injection đơn lẻ không phải là một lũ. Shield bỏ qua nó. GuardDuty không biết nội dung của các yêu cầu HTTP. WAF bắt nó.
- Một người dùng AWS hợp pháp dùng các thông tin xác thực riêng của họ để lấy cắp dữ liệu chậm rãi — không DDoS, không injection, HTTP hợp lệ — Shield và WAF không thấy gì bất thường. GuardDuty nhận thấy các thông tin xác thực đang được dùng từ một quốc gia mới lúc 3 giờ sáng.
- Một lập trình viên vô tình tải lên dữ liệu khách hàng đến một bucket có thể truy cập công khai không tạo ra hành vi bất thường nào chút nào. GuardDuty không có gì để gắn cờ. Macie quét bucket và tìm thấy PII.

Mỗi dịch vụ có một điểm mù. Sự kết hợp bao phủ các điểm mù đó.

**CloudTrail: Nền Tảng**

Cả ba dịch vụ dựa vào các log. **AWS CloudTrail** là dịch vụ ghi log ghi lại mọi lần gọi API trong tài khoản AWS của bạn — ai đã gọi gì, khi nào, từ đâu, với kết quả gì.

CloudTrail được bật theo mặc định cho một lịch sử 90 ngày trong console. Để giữ các log dài hạn:

1. Tạo một trail ghi vào một bucket S3
2. Tùy chọn, gửi đến CloudWatch Logs cho cảnh báo thời gian thực
3. Bật xác thực tệp log (để phát hiện nếu các log bị giả mạo)

GuardDuty, AWS Config, Security Hub, và IAM Access Analyzer tất cả đọc từ CloudTrail. Không có các log CloudTrail, các dịch vụ này không có gì để phân tích.

"Nếu ai đó cố tắt CloudTrail thì sao?" Priya hỏi. "Nếu một kẻ tấn công giành quyền administrator, hành động đầu tiên của họ có thể là tắt việc ghi log — che dấu vết của họ."

"Đó là cái mà SCP từ Chương 14 ngăn," Leo nói. "Không ai trong tài khoản này có thể tắt CloudTrail, ngay cả các administrator."

"Và nếu họ bằng cách nào đó làm được?"

"Security Hub sẽ tạo một phát hiện. CloudTrail gửi một thông báo đến SNS về các thay đổi cấu hình. Chúng ta nhận một cảnh báo trong vòng hai phút sau bất kỳ sửa đổi CloudTrail nào."

"Và GuardDuty sẽ gắn cờ lần gọi API," Rafael thêm vào, "như một hành động IAM bất thường — tắt việc ghi log không phải là một hoạt động vận hành bình thường."

Nhiều lớp phát hiện cho một trong những hành động bảo mật quan trọng nhất: giả mạo các log. Cái này không phải là một tai nạn. Priya đã thiết kế nó một cách có chủ ý.

"Phòng thủ theo chiều sâu áp dụng cho lớp giám sát nữa," cô nói. "Không chỉ lớp ứng dụng."

**Amazon Macie: Dữ Liệu Nhạy Cảm Trong S3**

"Chúng ta đã nghĩ về điều gì xảy ra nếu ai đó vô tình tải lên một tệp với các số thẻ tín dụng khách hàng đến S3 chưa?" Priya hỏi. "Không phải độc hại — chỉ là một lập trình viên xuất dữ liệu để debug và tải lên nhầm tệp?"

"Chúng ta sẽ không bao giờ biết," Leo nói.

"Chính xác. Trừ khi chúng ta có Macie."

**Amazon Macie** là một dịch vụ bảo mật dữ liệu dùng học máy để tự động khám phá và bảo vệ dữ liệu nhạy cảm trong S3. Nó liên tục quét các bucket S3 và xác định:

- PII (Thông Tin Nhận Dạng Cá Nhân): các tên, các địa chỉ email, các số điện thoại, các ngày sinh
- Dữ liệu tài chính: các số thẻ tín dụng, các số tài khoản ngân hàng
- Các thông tin xác thực: các mật khẩu, các access key, các khóa riêng tư được nhúng trong các tệp
- Thông tin sức khỏe: các hồ sơ bệnh nhân, các chẩn đoán

Macie tạo ra các phát hiện khi nó phát hiện dữ liệu nhạy cảm ở những nơi nó không nên — hoặc khi các bucket S3 có các cấu hình truy cập quá dễ dãi.

"Cái này có giống GuardDuty không?" Maya hỏi.

"Mục đích khác," Priya nói. "GuardDuty theo dõi hành vi — các hành động nào đang được thực hiện, liệu các hành động đó có trông bất thường. Macie theo dõi dữ liệu — nội dung gì được lưu trữ, liệu nội dung đó có nhạy cảm. GuardDuty sẽ gắn cờ một EC2 instance thực hiện các lần gọi API bất thường. Macie sẽ gắn cờ một bucket S3 chứa các số thẻ tín dụng."

"Vậy GuardDuty là nhà phân tích hành vi," Leo nói, "và Macie là kiểm toán viên dữ liệu."

"Chính xác. Bạn cần cả hai. Một kẻ tấn công lấy cắp dữ liệu qua một lần gọi API trông hợp pháp có thể bị gắn cờ bởi GuardDuty vì mẫu API bất thường. Nhưng nếu một nhân viên tải lên một tệp với 10.000 bản ghi khách hàng đến một bucket phát triển, không có hành vi bất thường nào để phát hiện — chỉ là dữ liệu nhạy cảm ở sai chỗ. Macie bắt cái đó."

Đối với Nimbus, giá trị tức thời nhất của Macie là trên bucket `nimbus-debug-exports` — một bucket các lập trình viên dùng để đổ dữ liệu cho việc debug. Macie tìm thấy ba tệp chứa các lịch sử đơn hàng với các tên khách hàng và các địa chỉ giao hàng. Không phải dữ liệu thanh toán, nhưng dữ liệu cá nhân không nên ở trong một bucket phát triển không được mã hóa.

Các tệp đã được loại bỏ. Một policy đã được thêm: bucket debug bị hạn chế vào chỉ dữ liệu test tổng hợp. Dữ liệu khách hàng thật đòi hỏi sự phê duyệt của Priya để xuất đến bất kỳ môi trường nào ngoài production.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

Macie tính phí dựa trên số lượng các bucket S3 được đánh giá mỗi tháng và khối lượng dữ liệu được quét. Đối với một startup với một số lượng vừa phải các bucket, khoảng 10-50 đô la mỗi tháng. Miễn phí cho 30 ngày đầu tiên.

Tom bật nó trước bữa trưa.

---

**AWS Security Hub: Bảng Điều Khiển**

Nếu bạn đang chạy nhiều tài khoản AWS hoặc cần một cái nhìn hợp nhất về các phát hiện bảo mật, **AWS Security Hub** tổng hợp các phát hiện từ GuardDuty, Inspector (đánh giá lỗ hổng), Macie (quyền riêng tư dữ liệu), Config, và Firewall Manager vào một bảng điều khiển duy nhất.

Nó cũng kiểm tra cấu hình của bạn đối với các thực hành bảo mật tốt nhất (tiêu chuẩn AWS Foundational Security Best Practices) và CIS AWS Foundations Benchmark.

Security Hub là câu trả lời cho "làm sao tôi thấy tất cả các phát hiện bảo mật của tôi ở một nơi mà không chuyển giữa năm console khác nhau?" Khi GuardDuty tạo một phát hiện, nó xuất hiện trong GuardDuty và trong Security Hub. Khi Macie tìm thấy dữ liệu nhạy cảm trong một bucket S3, nó xuất hiện trong Macie và trong Security Hub. Khi một quy tắc Config phát hiện một cấu hình sai, nó xuất hiện trong Config và trong Security Hub.

Đối với một đội ngũ một-tài-khoản, Security Hub thêm giá trị biên — nó là một console khác để kiểm tra. Sức mạnh của nó xuất hiện ở quy mô lớn: ba tài khoản, mười tài khoản, năm mươi tài khoản. Tất cả các phát hiện từ tất cả các tài khoản tổng hợp vào Security Hub của một tài khoản quản lý. Một đội ngũ giám sát một bảng điều khiển. Một bộ cảnh báo. Không kiểm tra log theo từng tài khoản.

Đối với Nimbus: Security Hub chưa cần thiết. Khi họ phát triển thành ba tài khoản (dev, staging, production), nó sẽ trở nên thiết yếu.

"Thiết lập nó bây giờ," Soo-Jin nói, vào tuần thứ ba của cô. "Mất mười lăm phút để bật. Mất ba tháng để ước bạn đã làm nó sớm hơn."

Họ bật nó.

**Amazon Inspector: Đánh Giá Lỗ Hổng**

Một tuần sau khi bật Macie, một CVE được xuất bản cho phiên bản OpenSSL chạy trên cả đội EC2 production Nimbus. Priya đọc cảnh báo bên ly cà phê.

"Chúng ta cần biết những instance nào của chúng ta bị ảnh hưởng," cô nói.

"Tôi có thể chạy một lần quét thủ công," Leo nói.

"Cho chín instance, được. Cho chín mươi? Cho các container?" Priya mở console Inspector. "Đây là cái Inspector dùng để làm."

**Amazon Inspector** là một dịch vụ đánh giá lỗ hổng tự động. Nơi GuardDuty theo dõi hành vi — những gì hạ tầng của bạn đang làm ngay bây giờ — Inspector nhìn vào những gì hiện diện có thể bị khai thác.

- **Các EC2 instance:** Inspector quét hệ điều hành và các gói được cài đặt đối với NVD (National Vulnerability Database) — danh mục có thẩm quyền của các CVE đã biết. Nếu bạn đang chạy OpenSSL 1.1.1 và một CVE nhắm vào phiên bản đó, Inspector gắn cờ nó.
- **Các container image ECR:** Inspector quét các container image trong Elastic Container Registry trước khi chúng được triển khai. Một gói có lỗ hổng trong một base image xuất hiện như một phát hiện trước khi container từng chạy trong production.
- **Các gói hàm Lambda:** Inspector phân tích các phụ thuộc được đóng gói vào các hàm Lambda của bạn — các gói Python, các module Node, các phụ thuộc Java — tìm các lỗ hổng đã biết.

Sự khác biệt then chốt với một lần quét một-lần: Inspector chạy **liên tục**. Nó không chỉ kiểm tra các instance của bạn một lần khi bạn bật nó và tuyên bố chúng sạch. Khi một CVE mới được xuất bản, Inspector tự động đánh giá lại các tài nguyên hiện có của bạn đối với lỗ hổng mới. Khi một EC2 instance thay đổi — gói mới được cài đặt, AMI được cập nhật — Inspector quét lại nó. Đội EC2 của Priya đã bị gắn cờ cho CVE OpenSSL trong vòng vài phút sau khi bật Inspector, không phải vì cô đã yêu cầu nó quét, mà vì đó là cái nó làm.

Các phát hiện được xếp hạng mức độ nghiêm trọng: Critical, High, Medium, Low, Informational. Chúng chảy đến Security Hub bên cạnh các phát hiện GuardDuty và Macie. Một bảng điều khiển. Cả ba lăng kính.

"Ba instance bị ảnh hưởng," Leo nói, đọc các phát hiện Inspector. "Sáu cái kia ở trên một phiên bản đã vá."

"Vá ba cái đó tuần này," Priya nói.

"Còn các container image thì sao?"

Priya nhìn các phát hiện ECR của Inspector. Hai base image trong kho container của họ có các lỗ hổng đã biết — các phiên bản cũ hơn của các gói từ đó đã được vá. Cô gắn thẻ chúng để xây dựng lại.

"Điều quan trọng," Priya nói, "là chúng ta tìm thấy cái này trước khi nó bị khai thác. Không phải sau."

**Mô Hình Ba Lăng Kính**

GuardDuty, Inspector, và Macie mỗi cái theo dõi một thứ khác nhau:

- **GuardDuty** là hành vi. Nó hỏi: *điều gì đang xảy ra ngay bây giờ trông sai?* Các lần gọi API từ các vị trí bất ngờ, các EC2 instance liên hệ các server command-and-control, các thông tin xác thực được dùng vào các giờ bất thường. Nó bắt các mối đe dọa và bất thường đang hoạt động.
- **Inspector** là cấu trúc. Nó hỏi: *cái gì hiện diện trong môi trường của chúng ta có thể bị khai thác?* Các gói chưa vá, các phụ thuộc có lỗ hổng, các runtime lỗi thời. Nó bắt các điều kiện làm cho các cuộc tấn công có thể.
- **Macie** là về dữ liệu. Nó hỏi: *thông tin nhạy cảm nào đang nằm trong các bucket S3 của chúng ta không nên ở đó?* PII, các hồ sơ tài chính, các thông tin xác thực còn lại trong các tệp. Nó bắt sự phơi bày không tạo ra hành vi bất thường nào — chỉ là dữ liệu ở sai chỗ.

Một vụ xâm phạm liên quan đến một CVE đã biết có thể xuất hiện trong cả ba: Inspector sẽ đã gắn cờ lỗ hổng trước cuộc tấn công. GuardDuty sẽ gắn cờ hành vi bất thường trong cuộc tấn công. Macie sẽ gắn cờ dữ liệu bị lấy cắp sau khi nó đáp xuống S3.

Ba lăng kính khác nhau, ba chân trời thời gian khác nhau, không cái nào thay thế cho các cái khác.

**AWS Network Firewall: Bộ Kiểm Tra Lưu Lượng**

Thêm một chuyên gia xứng đáng một đề cập trước khi bộ công cụ đóng lại. Các security group và các NACL (Chương 15) lọc lưu lượng theo IP, cổng, và giao thức — chúng có thể nói *ai* có thể nói chuyện với *cái gì*, nhưng chúng không thể nhìn vào bên trong cuộc trò chuyện. **AWS Network Firewall** là một tường lửa được quản lý, stateful mà bạn triển khai ở cấp độ VPC. Nó thực hiện kiểm tra gói sâu: lọc theo tên domain (chỉ cho phép đi đến `*.eatnimbus.com` và các kho gói của bạn), chặn lưu lượng khớp các chữ ký xâm nhập (IDS/IPS, tương thích với các quy tắc Suricata), và kiểm tra các luồng mà các security group sẽ đơn giản vẫy qua vì số cổng trông ổn.

"Vậy nó là một security group có bộ não," Leo nói.

"Nó là thiết bị bạn sẽ mua từ một nhà cung cấp tường lửa," Priya nói, "ngoại trừ được quản lý, tự động mở rộng, và được triển khai trong subnet riêng của nó để tất cả lưu lượng vào và ra khỏi VPC định tuyến qua nó."

Các tín hiệu thi: "kiểm tra hoặc lọc lưu lượng theo tên domain hoặc payload," "phát hiện/ngăn xâm nhập (IDS/IPS) cho một VPC," hoặc "lọc đi tập trung cho lưu lượng đi" → Network Firewall. Các security group và các NACL là câu trả lời cho allow/deny cấp độ instance và cấp độ subnet theo cổng và IP; Network Firewall là câu trả lời khi câu hỏi đòi hỏi kiểm tra *bên trong* lưu lượng. Và khi câu hỏi hỏi cách quản lý các quy tắc WAF, Shield Advanced, các security group, *và* các policy Network Firewall một cách nhất quán qua nhiều tài khoản — đó là **AWS Firewall Manager**, lớp quản trị policy ở trên đỉnh.

## Điểm Mạnh và Hạn Chế

**AWS Shield**:

- Standard: miễn phí và tự động — không lý do gì để không dùng nó
- Advanced: tuyệt vời cho các mục tiêu nổi bật; đắt cho các đội ngũ nhỏ
- Standard hấp thụ các cuộc tấn công lớp 3/4 (SYN flood, UDP flood, khuếch đại DNS) tự động
- Advanced thêm bảo vệ lớp 7, các thông báo thời gian thực, và Shield Response Team

**AWS WAF**:

- Các nhóm quy tắc được quản lý đơn giản hóa thiết lập đáng kể — bảo vệ OWASP Top 10 với vài lần nhấp
- Các quy tắc tùy chỉnh đòi hỏi hiểu các mẫu tấn công HTTP
- Giới hạn tốc độ là một tính năng mạnh mẽ thường bị bỏ qua — hiệu quả chống lại các trình cào và brute force
- WAF không phải là một sự thay thế cho mã ứng dụng an toàn — nó là một lớp phòng thủ theo chiều sâu
- Bắt đầu ở chế độ Count, xác thực, rồi chuyển sang Block

**GuardDuty**:

- Cực kỳ ít công sức để bật (vài lần nhấp, dùng thử miễn phí 30 ngày)
- Các phát hiện đòi hỏi xem xét và phản ứng của con người — GuardDuty phát hiện, nó không sửa
- Các báo động giả xảy ra — một số hoạt động hợp pháp trông bất thường đối với các mô hình ML
- Các mức độ nghiêm trọng (Thấp/Trung bình/Cao) giúp ưu tiên phản ứng
- Tích hợp với Security Hub, EventBridge, và Lambda cho các quy trình phản ứng tự động

**Amazon Inspector**:

- Quét lỗ hổng liên tục, tự động — không phải một lần kiểm tra một-lần
- Quét lại tự động khi các CVE mới được xuất bản hoặc khi các tài nguyên thay đổi
- Bao phủ các EC2 instance (OS và các gói ứng dụng), các container image ECR, và các gói hàm Lambda
- Các phát hiện chảy đến Security Hub; các xếp hạng mức độ nghiêm trọng giúp ưu tiên vá
- Không chặn các cuộc tấn công — nó làm nổi các điều kiện làm cho các cuộc tấn công có thể

**Amazon Macie**:

- Tự động khám phá dữ liệu nhạy cảm (PII, các thông tin xác thực, dữ liệu tài chính) trong S3
- Bắt sự phơi bày dữ liệu không có mẫu hành vi bất thường — GuardDuty sẽ bỏ lỡ nó
- Dùng thử miễn phí 30 ngày; trả theo mỗi bucket mỗi tháng sau đó
- Có giá trị nhất cho các đội ngũ với nhiều bucket S3 và các mức độ nhạy cảm khác nhau

**AWS Security Hub**:

- Tổng hợp các phát hiện từ GuardDuty, Macie, Inspector, Config, và Firewall Manager
- Kiểm tra cấu hình đối với các điểm chuẩn bảo mật (CIS, NIST, PCI-DSS)
- Có giá trị nhất ở quy mô đa-tài-khoản
- Bật sớm, ngay cả khi bạn chỉ có một tài khoản — lịch sử phát hiện là tích lũy

## Tóm Tắt

Năm dịch vụ, năm lớp. Mỗi cái giải quyết một loại mối đe dọa khác nhau — và không cái nào thay thế các cái khác. Một cuộc tấn công DDoS vượt qua WAF và GuardDuty. Một nỗ lực SQL injection vượt qua Shield. Một thông tin xác thực bị xâm phạm được dùng chậm rãi và cẩn thận có thể vượt qua Shield và WAF hoàn toàn — nhưng GuardDuty sẽ thấy bất thường. Một lập trình viên vô tình tải lên PII khách hàng đến một bucket S3 debug vượt qua cả ba — nhưng Macie bắt nó.

- **AWS Shield Standard**: Bảo vệ DDoS miễn phí, tự động ở lớp 3/4. Luôn bật. Hấp thụ SYN flood 50 Gbps trước khi nó đến load balancer Nimbus.
- **AWS Shield Advanced**: Bảo vệ DDoS cao cấp với quyền truy cập SRT và bảo vệ chi phí. Trường hợp sử dụng doanh nghiệp.
- **AWS WAF**: Tường lửa cấp độ ứng dụng. Kiểm tra và lọc các yêu cầu HTTP. Gắn vào CloudFront, ALB, hoặc API Gateway. Dùng các Nhóm Quy Tắc Được Quản Lý cho bảo vệ OWASP Top 10. Các quy tắc dựa trên tốc độ cho phòng thủ trình cào.
- **Amazon GuardDuty**: Phát hiện mối đe dọa hành vi. Các nguồn dữ liệu cốt lõi: các sự kiện CloudTrail, VPC Flow Logs, và các log DNS. Các bảo vệ mở rộng tùy chọn thêm các sự kiện S3, giám sát runtime EKS/ECS, các sự kiện đăng nhập RDS, và hoạt động mạng Lambda. Tạo ra các phát hiện được phân loại cho hoạt động bất thường. Năm loại phát hiện then chốt: UnauthorizedAccess (đăng nhập console), CryptoCurrency (đào), Recon (thăm dò cổng), Trojan (lưu lượng C2), Policy (cấu hình sai S3).
- **Amazon Inspector**: Đánh giá lỗ hổng tự động. Quét các EC2 instance, các container image ECR, và các gói hàm Lambda tìm các CVE đã biết. Chạy liên tục và đánh giá lại khi các lỗ hổng mới được xuất bản. Các phát hiện chảy đến Security Hub.
- **Amazon Macie**: Khám phá dữ liệu nhạy cảm trong S3. Phát hiện PII, các thông tin xác thực, và dữ liệu tài chính. Bắt sự phơi bày không có mẫu hành vi bất thường.
- **AWS Security Hub**: Tổng hợp các phát hiện từ tất cả các dịch vụ bảo mật vào một bảng điều khiển. Cho phép giám sát tập trung qua nhiều tài khoản.
- **CloudTrail**: Nền tảng của tất cả việc ghi log bảo mật AWS. Bật một trail ghi vào S3 để giữ dài hạn. Mọi dịch vụ bảo mật đọc từ nó.

## Mẹo Thi

*SAA-C03 Domain: Thiết kế kiến trúc an toàn (Domain 1, Task 1.2)*

- **Shield Standard so với Advanced**: Standard miễn phí và tự động. Advanced tốn tiền và thêm SRT, bảo vệ chi phí, và phát hiện tốt hơn. Các tín hiệu thi cho Advanced: "DDoS quy mô lớn," "đảm bảo SLA trong các cuộc tấn công," "bảo vệ tài chính chống lại các đột biến chi phí liên quan đến DDoS."
- **Các tín hiệu trường hợp sử dụng WAF**: "chặn SQL injection," "chặn cross-site scripting," "giới hạn tốc độ các lần gọi API," "chặn các user-agent cụ thể," "bảo vệ OWASP Top 10" → WAF.
- **Các tín hiệu GuardDuty**: "phát hiện hoạt động API bất thường," "xác định các thông tin xác thực bị xâm phạm," "gắn cờ các kết nối mạng EC2 bất thường," "thông tin tình báo về mối đe dọa" → GuardDuty.
- **Gắn WAF**: Có thể gắn vào CloudFront (toàn cầu), ALB (theo region), API Gateway (theo region), AppSync.
- **Các nguồn dữ liệu GuardDuty**: Ba nguồn cốt lõi — các sự kiện CloudTrail, VPC Flow Logs, các log DNS. Các nguồn mở rộng tùy chọn bao gồm các sự kiện data S3, các log kiểm toán EKS, các sự kiện đăng nhập RDS, hoạt động mạng Lambda, và runtime ECS. Kỳ thi có thể hỏi nguồn dữ liệu nào liên quan đến một kịch bản phát hiện cụ thể: "các lần đăng nhập RDS bất thường" → GuardDuty RDS Protection; "các mối đe dọa runtime container" → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie so với GuardDuty**: Đây là một câu gây nhiễu thi phổ biến. **Macie** dùng ML để phát hiện dữ liệu nhạy cảm trong S3 (PII, các thông tin xác thực, dữ liệu tài chính). **GuardDuty** phát hiện các mối đe dọa và bất thường trong hành vi. Macie là về nội dung. GuardDuty là về hành vi.
- **Inspector so với GuardDuty so với Macie:** Ba lăng kính khác nhau, không cái nào thay thế các cái khác. **Inspector** = quét lỗ hổng — các CVE trên các EC2 instance, các container image trong ECR, và các gói hàm Lambda. Chạy liên tục và quét lại khi các CVE mới được xuất bản. **GuardDuty** = phát hiện mối đe dọa hành vi — điều gì đang xảy ra ngay bây giờ trông bất thường. **Macie** = khám phá dữ liệu nhạy cảm trong S3 — PII, các thông tin xác thực, và dữ liệu tài chính không nên ở đó. Kích hoạt thi: "xác định các lỗ hổng chưa vá trên EC2" hoặc "quét các container image tìm các CVE" → Inspector. "Phát hiện các lần gọi API bất thường hoặc các thông tin xác thực bị xâm phạm" → GuardDuty. "Tìm PII hoặc dữ liệu nhạy cảm trong S3" → Macie.
- **Security Hub**: Tổng hợp các phát hiện bảo mật từ nhiều dịch vụ và tài khoản. Kịch bản thi: "công ty có nhiều tài khoản AWS và muốn một cái nhìn duy nhất về tất cả các phát hiện bảo mật" → Security Hub.
- **Các quy tắc dựa trên tốc độ trong WAF**: Dùng để giới hạn các yêu cầu cho mỗi IP trong một cửa sổ thời gian. Khác với Core Rule Set (vốn khớp các mẫu tấn công). Kỳ thi dùng các quy tắc dựa trên tốc độ cho "ngăn các nỗ lực đăng nhập brute force" hoặc "giảm thiểu cào."
- **CloudTrail + GuardDuty + Security Hub**: Ba cái này cùng nhau tạo thành cốt lõi của khả năng quan sát bảo mật AWS. Bật CloudTrail trước (GuardDuty và Security Hub phụ thuộc vào nó), rồi GuardDuty, rồi Security Hub để tổng hợp các phát hiện.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Giải thích sự khác biệt giữa AWS WAF và Amazon GuardDuty. Mỗi dịch vụ bảo vệ chống lại gì, và mỗi cái hoạt động ở lớp nào?

*(Gợi ý: Hãy nghĩ về WAF như một bộ lọc trên các yêu cầu đến, và GuardDuty như một nhà phân tích hành vi theo dõi các log của bạn.)*

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Website của một công ty bán lẻ đang bị nhắm vào bởi một botnet gửi hàng triệu yêu cầu mỗi giờ đến API tìm kiếm sản phẩm của họ. Các yêu cầu trông hợp pháp (các chuỗi User-Agent hợp lệ, các cookie session hợp lệ) nhưng không dẫn đến các giao dịch mua — chúng đang cào các giá sản phẩm. Cuộc tấn công đang khiến các khách hàng hợp pháp trải nghiệm thời gian phản hồi chậm.

Sự kết hợp các dịch vụ nào giải quyết TỐT NHẤT mối đe dọa này?

A) AWS WAF với các quy tắc giới hạn tốc độ và CloudFront  
B) AWS Shield Advanced và CloudFront  
C) Amazon GuardDuty và AWS Shield Standard  
D) Các Network ACL chặn các dải IP của botnet

**Gợi ý 1**: Các yêu cầu ở cấp độ HTTP (lớp ứng dụng). Dịch vụ nào hoạt động ở lớp HTTP?

**Gợi ý 2**: Các botnet dùng nhiều địa chỉ IP khác nhau — chặn các dải IP cụ thể ở cấp độ NACL không hiệu quả chống lại các botnet lớn.

**Gợi ý 3**: Giới hạn tốc độ theo địa chỉ IP có thể làm chậm việc cào ngay cả khi bạn không thể chặn nó hoàn toàn.

**Đáp án**: A

**Giải thích**: AWS WAF có thể giới hạn tốc độ các yêu cầu cho mỗi địa chỉ IP, giảm tác động của việc cào khối lượng cao từ bất kỳ nguồn đơn lẻ nào. CloudFront phân phối lưu lượng đến qua mạng edge của AWS, hấp thụ khối lượng và bảo vệ origin. Các quy tắc WAF cũng có thể khớp trên các mẫu yêu cầu (các yêu cầu tuần tự nhanh đến cùng một endpoint API) để xác định hành vi cào.

**Tại sao không phải B?** Shield Advanced bảo vệ chống lại các lũ DDoS (lớp 3/4). Kịch bản mô tả việc cào cấp độ ứng dụng (các yêu cầu HTTP lớp 7), vốn Shield không kiểm tra.

**Tại sao không phải C?** GuardDuty phát hiện các bất thường trong hành vi tài khoản AWS của bạn — nó không chặn các yêu cầu HTTP đến. Shield Standard không xử lý các cuộc tấn công cấp độ ứng dụng.

**Tại sao không phải D?** Các botnet lớn dùng hàng nghìn địa chỉ IP từ các nguồn phân tán. Chặn các dải cụ thể là một cách tiếp cận đập-chuột-chũi thất bại chống lại các botnet tinh vi.

*SAA-C03 Domain: Thiết kế kiến trúc an toàn — Task 1.2*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Nimbus đang cân nhắc mô hình mối đe dọa của họ khi họ chuẩn bị xử lý dữ liệu thẻ tín dụng. Một cuộc đánh giá tuân thủ PCI-DSS đòi hỏi:

- Bảo vệ chống lại các cuộc tấn công DDoS cấp độ mạng
- Lọc cấp độ ứng dụng cho các khai thác web đã biết
- Ghi log của tất cả các lần gọi API đến một kho dài hạn, có bằng chứng giả mạo
- Phát hiện các mẫu truy cập bất thường đến dịch vụ thanh toán

Ánh xạ mỗi yêu cầu đến một dịch vụ AWS hoặc cấu hình cụ thể. Shield Standard có đủ không, hay bối cảnh PCI-DSS gợi ý Advanced? Bạn sẽ gắn WAF ở đâu?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là luyện tập việc ánh xạ các yêu cầu tuân thủ đến các dịch vụ AWS.)*

## Cảnh Sau Tín Dụng

GuardDuty đã được bật.

Bốn mươi tám giờ sau, nó tạo ra phát hiện đầu tiên của nó: *"EC2 Instance i-0abc123 đang giao tiếp với một nút thoát Tor đã biết."*

Leo nhìn vào ID instance.

"Đó là instance giám sát nội bộ," anh nói. "Cái tôi thiết lập để chạy các chẩn đoán mạng."

"Nó có được giả định giao tiếp với các nút thoát Tor không?"

"Không." Anh dừng lại. "Tại sao nó lại làm vậy?"

Anh kéo instance lên. Ai đó đã cài đặt một công cụ lên nó — một trình quét mạng mã nguồn mở hợp pháp mà, hóa ra, cũng giao tiếp với hạ tầng Tor cho việc thu thập dữ liệu ẩn danh.

"Vậy công cụ đang gọi về nhà," Priya nói.

"Mà không có sự biết của tôi," Leo xác nhận.

"Đó là một rủi ro chuỗi cung ứng. Một phụ thuộc làm những điều bạn không ủy quyền."

Leo gỡ cài đặt công cụ. Anh thiết lập một quy trình để xem xét mọi công cụ bên thứ ba trước khi cài đặt.

"Đây là mức độ hoang tưởng chúng ta đang ở bây giờ?" Maya hỏi.

"Đúng," Priya nói.

"Đây là mức độ chúng ta luôn nên ở?" Maya hỏi.

"Cũng đúng," Priya nói.

Chương tiếp theo: điều gì xảy ra khi trung tâm dữ liệu ở Oregon biến mất — và tại sao Nimbus vẫn chạy.
