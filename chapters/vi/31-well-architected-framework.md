# Chương 31: Thanh Tra Xây Dựng Cho Kiến Trúc Cloud

Đứng dậy. Duỗi người. Nghỉ giải lao thực sự nếu bạn cần.

Chương này khác với những chương trước. Chúng ta đã dành 30 chương xây dựng kiến thức về các dịch vụ và mẫu cụ thể. Bây giờ chúng ta lùi lại và nhìn vào bức tranh tổng thể.

*Kiến trúc cloud tốt* thực sự trông như thế nào? Có cách hệ thống nào để đánh giá xem những gì bạn đã xây dựng có được thiết kế tốt thực sự — hay chỉ là hoạt động được không?

Có. AWS gọi nó là Well-Architected Framework.

**Tóm tắt nhanh: Câu Hỏi Theo Sau Các Con Số**

Ba tháng tối ưu hóa chi phí đã tạo ra một con số khiến tất cả họ ngạc nhiên: $35,904 tiết kiệm hằng năm, được xác định và hầu hết đã được triển khai. EC2 Savings Plans, các chính sách lifecycle S3, đợt dọn dẹp lưu trữ, các replica cơ sở dữ liệu không sử dụng, các endpoint NAT Gateway — mỗi cái đều là một khám phá riêng, một sửa chữa riêng. Nhưng ở đâu đó trong quá trình đó, Maya đã bắt đầu hỏi một câu hỏi khác. Không phải "lãng phí ở đâu?" mà "ngay từ đầu nó tích lũy như thế nào?" Các vấn đề chi phí là triệu chứng của một thứ gì đó. Well-Architected Framework là từ vựng để gọi tên thứ đó là gì.

Nimbus đã chạy được hai năm. Nhóm đã đưa ra hàng trăm quyết định kiến trúc — một số có ý thức, một số ngẫu nhiên, một số dưới áp lực. Hệ thống hoạt động. Nhưng Maya có một câu hỏi.

"Kiến trúc của chúng ta có thực sự *tốt* không?" cô hỏi. "Không chỉ là hoạt động được. Tốt."

Không ai trả lời ngay.

"Vì tôi đã nghe về Well-Architected Review," cô tiếp tục. "AWS cung cấp nó cho khách hàng. Một số nhà đầu tư của chúng ta đã đề cập đến nó. Tôi nghĩ chúng ta nên thực hiện một cái."

"Đó là gì?" Leo hỏi.

"Khung đánh giá kiến trúc cloud của AWS," Priya nói. "Sáu trụ cột. Một tập hợp câu hỏi và các thực hành tốt nhất cho mỗi cái. Bạn đánh giá kiến trúc của mình dựa trên tất cả chúng và xác định những gì còn thiếu."

"Nó giống như thanh tra xây dựng," Tom nói. "Bạn biết tòa nhà hoạt động. Việc thanh tra cho bạn biết nó có tuân theo code không và cái gì có thể bị hỏng trong trận động đất."

**Sáu Trụ Cột**

AWS Well-Architected Framework được tổ chức xung quanh sáu trụ cột. Mỗi trụ cột có một tập hợp các nguyên tắc thiết kế, các thực hành tốt nhất và câu hỏi để đánh giá kiến trúc của bạn.

**1. Xuất Sắc Vận Hành**

*Trọng tâm*: Chạy và giám sát các hệ thống để cung cấp giá trị kinh doanh, và liên tục cải thiện các quy trình và thủ tục.

Các lĩnh vực chính:

- Bạn triển khai các thay đổi như thế nào? (CI/CD, infrastructure as code, triển khai tự động)
- Bạn giám sát hệ thống và biết khi nào có vấn đề như thế nào?
- Bạn học hỏi từ các thất bại như thế nào? (post-mortem, runbook, văn hóa không đổ lỗi)
- Bạn xử lý các thay đổi ở quy mô như thế nào?

Đánh giá Nimbus:

- Có: Pipeline CI/CD với triển khai tự động
- Có: Cảnh báo CloudWatch và GuardDuty
- Có: Kiểm thử chaos engineering hằng quý
- Cảnh báo: Quy trình post-mortem chưa được chính thức hóa — các sự cố được điều tra nhưng bài học chưa được ghi lại có hệ thống

**2. Bảo Mật**

*Trọng tâm*: Bảo vệ thông tin, hệ thống và tài sản thông qua đánh giá và chiến lược giảm thiểu rủi ro.

Các lĩnh vực chính:

- Ai có thể truy cập gì, và với đặc quyền tối thiểu có thể?
- Dữ liệu được mã hóa tại chỗ và trong khi truyền như thế nào?
- Bạn phát hiện và phản ứng với các mối đe dọa như thế nào?
- Có kiểm soát bảo mật tự động không?

Đánh giá Nimbus:

- Có: IAM với đặc quyền tối thiểu (sau khi dọn dẹp trong Chương 14)
- Có: KMS để mã hóa dữ liệu, Secrets Manager để quản lý thông tin xác thực
- Có: GuardDuty, WAF, Shield Standard
- Có: VPC với private subnets, security groups
- Cảnh báo: Vá bảo mật trên các instance EC2 chưa được tự động hóa đầy đủ (Priya đã gắn cờ điều này vài tháng trước, chưa giải quyết)

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi, khi khoảng trống vá bảo mật xuất hiện. "Chúng ta đã tự động hóa các triển khai. Chúng ta đã tự động hóa các backup. Tại sao chúng ta lại để việc vá thủ công?"

"Vì việc vá có cảm giác khác với việc triển khai code," Priya nói. "Chúng ta lo lắng về việc vá làm hỏng thứ gì đó. Nên chúng ta giữ nó thủ công để duy trì kiểm soát."

"Và bằng cách giữ nó thủ công, chúng ta làm cho nó không nhất quán," Maya nói. "Điều đó tệ hơn."

"Đúng," Priya nói. "AWS Systems Manager Patch Manager giải quyết điều này. Chúng ta lẽ ra phải làm nó sáu tháng trước."

**3. Độ Tin Cậy**

*Trọng tâm*: Đảm bảo hệ thống thực hiện chức năng dự định của mình một cách chính xác và nhất quán, và có khả năng phục hồi từ các thất bại.

Các lĩnh vực chính:

- Hệ thống xử lý thất bại ở cấp độ thành phần như thế nào?
- Nó phục hồi từ các thất bại vùng như thế nào?
- Nhu cầu được quản lý như thế nào?
- Hệ thống được kiểm thử về thất bại như thế nào?

Đánh giá Nimbus:

- Có: Multi-AZ cho tất cả các thành phần quan trọng
- Có: Aurora Serverless với failover tự động
- Có: Auto Scaling cho EC2 và ECS
- Có: Kiểm thử chaos engineering (hằng quý)
- Cảnh báo: Không có triển khai đa vùng (warm standby chưa được triển khai — dự kiến cho quý tới)

**4. Hiệu Quả Hiệu Suất**

*Trọng tâm*: Sử dụng tài nguyên IT và điện toán hiệu quả.

Các lĩnh vực chính:

- Có đúng loại instance và loại cơ sở dữ liệu được sử dụng cho khối lượng công việc không?
- Mở rộng có được cấu hình đúng không?
- Dữ liệu có được phân phối đến người dùng từ vị trí tối ưu không?

Đánh giá Nimbus:

- Có: CloudFront để phân phối nội dung toàn cầu
- Có: ElastiCache để tăng tốc đọc cơ sở dữ liệu
- Có: Aurora read replicas
- Có: Lambda cho các khối lượng công việc phù hợp
- Cảnh báo: Một số instance EC2 chưa bao giờ được right-sized kể từ khi triển khai ban đầu

**5. Tối Ưu Hóa Chi Phí**

*Trọng tâm*: Tránh các chi phí không cần thiết.

Các lĩnh vực chính:

- Tài nguyên có được right-sized phù hợp không?
- Tài nguyên không sử dụng có được ngừng hoạt động không?
- Các mô hình giá phù hợp có đang được sử dụng không?
- Các bất thường chi tiêu có được phát hiện không?

Đánh giá Nimbus:

- Có: Savings Plans được triển khai (Chương 27)
- Có: Chính sách lifecycle S3 (Chương 23)
- Có: DynamoDB Auto Scaling
- Có: AWS Budgets với cảnh báo
- Có: Đánh giá chi phí hằng quý

"Cái đó tốn bao nhiêu mỗi tháng, chính xác — tất cả những thứ chúng ta chưa right-size?" Tom hỏi. "Các instance EC2 chưa bao giờ được đánh giá. Những cái vẫn ở kích thước chúng ta cấp phát vào năm đầu tiên."

"Tôi không biết," Leo nói. "Đó là vấn đề."

"Đó là khoảng trống Hiệu Quả Hiệu Suất," Priya nói. "Chúng ta đã tối ưu hóa những thứ chúng ta biết. Chúng ta không có một con số cho những thứ chúng ta chưa nhìn vào."

**6. Bền Vững**

*Trọng tâm*: Giảm thiểu tác động môi trường khi chạy các khối lượng công việc cloud.

Các lĩnh vực chính:

- Mức sử dụng có được tối đa hóa không (tránh tài nguyên nhàn rỗi)?
- Các loại instance có được chọn vì hiệu quả năng lượng không?
- Dữ liệu có được lưu trữ chỉ khi cần thiết không?

Đánh giá Nimbus:

- Có: Lambda và Fargate cho các khối lượng công việc serverless/containerized (hiệu quả tài nguyên tốt hơn EC2 chuyên dụng)
- Có: Chính sách lifecycle S3 (xóa dữ liệu khi không còn cần thiết)
- Cảnh báo: Một số instance dựa trên Graviton chưa được áp dụng (AWS Graviton hiệu quả năng lượng hơn và rẻ hơn)

**Quy Trình Well-Architected Review**

Review không phải là bài kiểm tra bạn đậu hay trượt. Đó là cuộc trò chuyện có cấu trúc về kiến trúc của bạn, được hướng dẫn bởi 60+ câu hỏi trên sáu trụ cột.

Mỗi câu hỏi xác định một thực hành tốt nhất. Nếu kiến trúc của bạn tuân theo nó, đó là điểm mạnh. Nếu không, đó là một "vấn đề" — được phân loại theo mức độ rủi ro (cao, trung bình, thấp).

Kết quả: danh sách ưu tiên các khuyến nghị cải tiến. Không phải mọi thứ đều cần được sửa ngay. Khung giúp bạn hiểu các đánh đổi của mỗi khoảng trống và quyết định cái gì cần giải quyết trước.

AWS Well-Architected Tool (có sẵn trong AWS console, miễn phí) cung cấp khung câu hỏi và tạo báo cáo với các khuyến nghị.

Đối với Nimbus, Maya đã lên lịch một phiên review nửa ngày bao gồm tất cả sáu trụ cột — và quyết định không tự mình thực hiện nó. Bản thân phiên đó, và danh sách các phát hiện mà nó tạo ra, là nơi chương này hướng đến.

**Lens: Chuyên Biệt Hóa Review**

Well-Architected Framework cốt lõi là trung lập về công nghệ. AWS cũng xuất bản **Lenses** — phần mở rộng của khung cho các trường hợp sử dụng hoặc ngành cụ thể:

- **Serverless Lens**: Câu hỏi bổ sung cho các kiến trúc nặng về Lambda
- **SaaS Lens**: Cho các ứng dụng SaaS đa người thuê
- **Machine Learning Lens**: Cho các khối lượng công việc đào tạo và suy luận ML
- **Financial Services Lens**: Câu hỏi quy định và tuân thủ cho FinTech
- **Healthcare Lens**: Các cân nhắc HIPAA

Bạn có thể đang tự hỏi: bạn có cần chạy đầy đủ Well-Architected review trên tất cả sáu trụ cột trước khi bạn ra mắt không? Không. Giá trị nằm ở các câu hỏi, không phải điểm số. Nếu bạn ở giai đoạn trước ra mắt, hãy chọn hai trụ cột liên quan nhất đến tình huống của bạn — Bảo Mật và Độ Tin Cậy hầu như luôn là điểm khởi đầu đúng — và làm việc qua chỉ những câu hỏi đó. Một review một phần thực sự được thực hiện có giá trị hơn một review đầy đủ bị hoãn cho đến khi kiến trúc "sẵn sàng."

Đối với Nimbus, SaaS Lens có liên quan. Nó thêm câu hỏi về cô lập người thuê, tự động hóa onboarding và phân bổ chi phí theo người thuê — tất cả các lĩnh vực Nimbus đang tích cực phát triển.

**Phiên Well-Architected Review: Carlos Điều Phối**

Maya đã mời Carlos — một kiến trúc sư cấp cao cô gặp tại một sự kiện cộng đồng AWS, người điều phối các đợt Well-Architected review cho các nhóm như họ — để chạy phiên này. Anh đến với Well-Architected Tool mở trên laptop và một cuốn sổ tay duy nhất. Không có chương trình nghị sự. Chỉ có câu hỏi.

"Tôi sẽ hỏi, các bạn trả lời trung thực," anh nói. "Nếu câu trả lời trung thực là 'chúng tôi không biết,' hãy nói vậy. Đó là một phát hiện."

Anh bắt đầu với Xuất Sắc Vận Hành.

"Các bạn có runbook cho năm sự cố hàng đầu của mình không?"

Tom nhìn Leo. Leo nhìn trần nhà.

"Chúng tôi có runbook cho hai sự cố," Priya nói. "Vi phạm giới hạn kết nối cơ sở dữ liệu và timeout origin CloudFront. Ba cái còn lại — lỗi instance EC2 trong giờ cao điểm, throttling DynamoDB, và lỗi webhook Stripe — chúng tôi xử lý tùy ứng."

Carlos viết: *OPS-1: Runbook cho 5 sự cố hàng đầu. Hiện tại: 2/5. Khoảng trống: 3.*

"Lần cuối các bạn chạy qua các runbook hiện có trong một buổi diễn tập là khi nào?"

Im lặng.

"Chúng tôi chưa làm," Priya nói. "Chúng tôi viết chúng sau các sự cố. Chúng tôi chưa bao giờ kiểm thử xem chúng còn chính xác không."

*OPS-2: Xác thực runbook. Lần kiểm thử cuối: không bao giờ.*

Carlos chuyển tiếp. Bảo Mật.

"Ngay bây giờ ai có quyền truy cập tài khoản root?"

"Root?" Leo nói. "Chỉ Maya. Và tôi nghĩ Tom vẫn có thông tin xác thực root từ khi chúng ta thiết lập tài khoản — nhưng chúng ta đã xoay vòng chúng sau Chương 14." Anh dừng lại. "Tom, chúng ta có xoay vòng root sau đợt dọn dẹp IAM không?"

Tom mở một mục 1Password. "Chúng ta đã đổi mật khẩu và thêm MFA. Nhưng thông tin xác thực root vẫn ở trong vault 1Password được chia sẻ. Ba người có quyền truy cập vault đó: tôi, Maya, và Leo."

"Vậy ba người có quyền truy cập root," Carlos nói. "Hướng dẫn của AWS là root chỉ nên được sử dụng cho một danh sách ngắn các tác vụ có ghi chép — khoảng mười thao tác cấp tài khoản, tất cả đều hiếm và hầu hết chỉ dành cho trường hợp khẩn cấp. Sau các thao tác đó, phiên root nên được kết thúc. Quyền truy cập root có được ghi nhật ký riêng không?"

"CloudTrail ghi nhật ký nó," Priya nói.

"Có cảnh báo khi root được sử dụng không?"

Một khoảng dừng nữa.

"Không," Tom nói.

Carlos viết: *SEC-1: Kiểm soát quyền truy cập tài khoản root. Hiện tại: 3 người dùng trong vault được chia sẻ, không có cảnh báo sử dụng. Khoảng trống: Việc sử dụng root nên kích hoạt một cảnh báo SNS ngay lập tức. Mục tiêu: 0 phiên root không khẩn cấp.*

"Tiếp theo: ai xem xét các thay đổi quyền IAM? Có quy trình peer review cho các vai trò IAM mới hoặc mở rộng chính sách không?"

"Priya xem xét chúng," Leo nói. "Cô ấy là người xem xét bảo mật trên thực tế."

"Điều gì xảy ra khi Priya đi nghỉ?"

Không ai trả lời.

"Đó là một khoảng trống quy trình," Carlos nói, không phán xét. "Không phải khoảng trống trong năng lực của Priya — một khoảng trống trong thiết kế quy trình. Một đợt review bảo mật phụ thuộc vào sự sẵn có của một người là một điểm thất bại duy nhất trong tư thế bảo mật của bạn."

*SEC-2: Quy trình review IAM. Hiện tại: một người review duy nhất, không có dự phòng. Khoảng trống: Xác định một người review dự phòng và ghi chép các tiêu chí review.*

Carlos chuyển sang Độ Tin Cậy.

"Các bạn đã kiểm thử failover Aurora Multi-AZ dưới tải chưa?"

"Chúng tôi đã kiểm thử nó ở trạng thái nhàn rỗi," Tom nói. "Chúng tôi đã chạy lệnh failover khi hệ thống yên tĩnh và xác nhận replica được thăng cấp trong vòng 45 giây."

"Tải vào thời điểm đó là bao nhiêu?"

"Có lẽ 5% của cao điểm."

"Điều gì xảy ra với connection pool trong khi failover ở 80% tải cao điểm?"

Tom suy nghĩ về nó. "Endpoint DNS cập nhật. Các ứng dụng dùng endpoint writer sẽ thấy lỗi kết nối trong cửa sổ chuyển đổi — thường là 20-45 giây. Ở 5% tải, chúng tôi có mười kết nối đang hoạt động. Ở cao điểm, chúng tôi sẽ có 300. Với RDS Proxy ở phía trước, proxy xử lý việc kết nối lại."

"RDS Proxy có thực sự kết nối lại một cách trong suốt trong khi failover Multi-AZ không?"

Tom nhìn Priya. "Tôi tin là vậy. Nhưng tôi chưa kiểm thử nó."

"Đó là một câu trả lời khác với 'có,'" Carlos nói. "Một giả định chưa được kiểm thử trong thiết kế khả dụng cao của bạn là một phát hiện."

*REL-1: Failover Aurora Multi-AZ dưới tải. Đã kiểm thử: chỉ ở trạng thái nhàn rỗi. Khoảng trống: Kiểm thử ở 70% tải cao điểm với RDS Proxy có sẵn. Xác thực hành vi connection pool trong cửa sổ failover.*

"Các bạn đã nghĩ về điều gì xảy ra nếu failover mất 90 giây thay vì 45 chưa?" Priya hỏi, hướng đến Tom hơn là Carlos. Cô đã đang làm công việc đó rồi.

"Ở 90 giây, chúng ta sẽ có timeout ứng dụng cho bất kỳ yêu cầu nào không thể thử lại," Tom nói. "Luồng đặt hàng có logic thử lại. Luồng xác nhận — ít hơn. Một failover 90 giây trong giờ cao điểm bữa tối sẽ có nghĩa là một tập hợp con các xác nhận thất bại, các nhà hàng không nhận được đơn hàng, khách hàng được hoàn tiền."

"Đó là bán kính nổ," Carlos nói. "Tốt. Bây giờ các bạn biết các bạn đang bảo vệ chống lại cái gì và cách đo nó. Bài kiểm thử nên xác thực cả thời lượng failover và hành vi ứng dụng trong cửa sổ chuyển đổi."

Anh chuyển sang Hiệu Quả Hiệu Suất.

"Các bạn có right-size các instance EC2 của mình không?"

"Chúng tôi đã right-size trong đợt review chi phí," Tom nói. "Savings Plans cam kết với các loại instance hiện tại."

"Lần cuối các bạn nhìn vào các khuyến nghị của Compute Optimizer là khi nào?"

Tom mở nó lên. AWS Compute Optimizer đã gắn cờ ba instance là có khả năng được cấp phát quá mức: hai bộ xử lý nền c6g.medium và một máy chủ VPN t3.medium. Khuyến nghị cho máy chủ VPN là thu nhỏ xuống t3.small. Các bộ xử lý được gắn cờ là "được cấp phát quá mức" với độ tin cậy 82%.

"Chúng tôi chưa nhìn vào cái này kể từ khi thiết lập nó," Tom thừa nhận.

"Compute Optimizer đã tạo ra các khuyến nghị trong bao lâu?"

Tom kiểm tra. "Sáu tuần."

Carlos viết: *PERF-1: Right-sizing EC2 qua Compute Optimizer. Hiện tại: các khuyến nghị có sẵn, chưa được xem xét. Khoảng trống: Review hằng tháng đầu ra Compute Optimizer; áp dụng các khuyến nghị sau khi xác thực staging.*

"Một cái nữa," Carlos nói. "Cái này xuyên tất cả các trụ cột." Anh viết trên bảng trắng:

*Không có sự cố không giống với được thiết kế tốt.*

Anh để nó nằm đó một lúc.

"Hệ thống của các bạn đã chạy hai năm mà không có một sự cố lớn ảnh hưởng đến khách hàng," anh nói. "Điều đó thực sự tốt. Nhưng tôi muốn các bạn để ý điều đó nói lên gì — và điều gì nó không nói."

"Nó nói với chúng tôi rằng chúng tôi đã may mắn?" Leo đề xuất.

"Nó nói với các bạn rằng các chế độ thất bại các bạn đã gặp nằm trong khả năng xử lý của các bạn, với kiến trúc các bạn có hôm nay. Nó không nói với các bạn rằng kiến trúc là vững chắc. Một hệ thống chưa thất bại không được chứng minh là có khả năng phục hồi. Nó được chứng minh là chưa gặp các điều kiện cụ thể sẽ phơi bày những điểm yếu của nó."

"Vậy không thất bại không có nghĩa là không dễ bị tổn thương," Maya nói.

"Đúng. Well-Architected review không tìm kiếm bằng chứng về các thất bại trong quá khứ. Nó tìm kiếm sự phơi bày trong tương lai. Failover chưa được kiểm thử. Các runbook không tồn tại. Vai trò IAM quá rộng. Không cái nào trong số này đã gây ra sự cố. Tất cả chúng đều có thể."

"Đó là lý do tại sao khoảng trống vá quan trọng," Priya nói. "Chúng ta chưa bị xâm nhập qua một instance EC2 chưa vá. Điều đó không có nghĩa là chúng ta sẽ không bị."

"Chính xác," Carlos nói. "Sự vắng mặt của tổn hại không phải là bằng chứng của sự an toàn. Sự hiện diện của một lỗ hổng chưa được giải quyết là bằng chứng của rủi ro — bất kể rủi ro đã thành hiện thực hay chưa."

Anh đậy nắp bút.

"Đó là sự khác biệt giữa một hệ thống được thiết kế tốt và một hệ thống may mắn."


**Phát Hiện Quyền IAM Quá Mức**

Carlos gắn cờ một phát hiện thứ hai trong đợt review trụ cột bảo mật đòi hỏi một cái nhìn sâu hơn.

"Hàm Lambda của các bạn xử lý các thông báo đơn hàng — nó có những quyền IAM nào?"

Leo mở vai trò thực thi. Mất ba mươi giây lâu hơn lẽ ra để tìm nó — vai trò đã được tạo sớm trong cuộc đời của Nimbus và được đặt tên chung chung.

"Toàn quyền S3," anh nói, khi anh tìm thấy nó.

Carlos chờ đợi.

"Bucket nào?" anh hỏi.

"Tất cả các bucket," Leo nói. Anh đọc chính sách. "`arn:aws:s3:::*`. Chúng tôi đã cho nó toàn quyền S3."

"Hàm này thực sự làm gì với S3?"

"Nó đọc cấu hình nhà hàng từ một bucket," Leo nói. "Bucket `nimbus-restaurant-config`. Cụ thể là các object `restaurants/{restaurant_id}/config.json`. Nó đọc chúng. Chỉ vậy thôi."

"Vậy hàm cần `s3:GetObject` trên `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json`," Carlos nói. "Cái nó có là toàn quyền S3 trên mọi bucket trong tài khoản."

"Bao gồm," Priya nói, "bucket snapshot Aurora. Bucket log CloudTrail. Bucket lịch sử đơn hàng khách hàng."

"Nếu hàm Lambda này bị xâm phạm," Carlos nói, "một kẻ tấn công có toàn quyền truy cập vào mọi bucket S3 trong tài khoản. Chúng có thể đọc, ghi, hoặc xóa bất kỳ dữ liệu nào."

"Tôi đã triển khai nó rồi — ồ," Leo nói. Anh đang đọc chính sách. "Tôi đã viết cái này hai năm trước. Tôi đang vội để hệ thống thông báo hoạt động. Tôi đã cho nó quyền truy cập rộng vì tôi chưa chắc nó cần gì. Và tôi không bao giờ quay lại để thu hẹp nó."

"Đó là nguồn quyền quá mức phổ biến nhất trong các hệ thống production," Carlos nói, không buộc tội. "Không phải sự cẩu thả cố ý — một lối tắt được thực hiện dưới áp lực thời gian, mà không bao giờ được xem lại."

Tom đã đang nhìn vào danh sách đầy đủ các vai trò thực thi Lambda.

"Bao nhiêu hàm Lambda của chúng ta có quyền quá rộng?" Maya hỏi.

Câu trả lời, sau hai mươi phút review: 7 trong số 23 hàm Lambda có quyền rộng hơn mục đích được ghi chép của chúng đòi hỏi. Cái đáng lo ngại nhất: hàm Lambda xác nhận thanh toán có `dynamodb:*` trên tất cả các bảng. Nó chỉ cần `dynamodb:GetItem` và `dynamodb:PutItem` trên bảng orders.

"Ba giờ làm việc để sửa cả bảy," Priya ước tính. "Viết các chính sách đặc quyền tối thiểu, gắn chúng, loại bỏ các chính sách rộng."

"Đây có phải là phát hiện rủi ro cao nhất cho đến nay không?" Maya hỏi Carlos.

"Ngang với khoảng trống runbook," anh nói. "Vấn đề IAM là vấn đề bán kính nổ — nếu bất kỳ hàm nào trong số này bị xâm phạm, quyền truy cập của kẻ tấn công lớn hơn nhiều so với mức nên có. Vấn đề runbook là vấn đề thời gian phục hồi — khi có gì đó sai, các bạn đang ứng biến thay vì tuân theo một quy trình đã được kiểm thử. Cả hai đều thực sự rủi ro cao."

Maya đánh dấu cả hai là P1 trong tài liệu theo dõi.

"Và nếu ai đó cố đột nhập?" Priya nói. "Chúng ta đã lo lắng về các kẻ tấn công bên ngoài. Nhưng một Lambda quá quyền có nghĩa là một thất bại nội bộ — một cấu hình sai, một lỗ hổng phụ thuộc, một cuộc tấn công chuỗi cung ứng — có thể có cùng bán kính nổ."

"Phòng thủ theo chiều sâu giả định mỗi lớp có quyền truy cập tối thiểu cần thiết," Carlos nói. "Khi một lớp có nhiều quyền truy cập hơn nó cần, phòng thủ theo chiều sâu ngừng hoạt động như được thiết kế. Bạn có một lớp bị xâm phạm, nhưng nó có chìa khóa cho ba lớp khác."

Priya đánh dấu phát hiện quyền IAM quá mức là P1, cột một, với ngày đến hạn là một tuần.


**Xếp Hạng Các Phát Hiện: P1, P2, P3**

Vào cuối phiên, nhóm có 14 phát hiện trên bảng. Carlos yêu cầu họ phân loại ưu tiên trước khi rời đi.

"Mỗi phát hiện trong danh sách này cần một mức ưu tiên," anh nói. "Không phải mọi thứ đều quan trọng như nhau. Ưu tiên theo: bán kính nổ là gì nếu cái này thất bại? Khả năng nó thất bại là bao nhiêu? Khó sửa đến mức nào?"

14 phát hiện:

1. Không có runbook cho 3 trong 5 sự cố hàng đầu (OPS)
2. Runbook chưa bao giờ được kiểm thử (OPS)
3. Không có quy trình phản ứng sự cố chính thức ngoài các runbook (OPS)
4. Quyền truy cập root trong vault được chia sẻ, không có cảnh báo sử dụng (SEC)
5. Quy trình review IAM không có người review dự phòng (SEC)
6. 7 hàm Lambda quá quyền (SEC) ← Lambda thông báo của Leo
7. Một vài quy tắc security group rộng hơn cần thiết (SEC)
8. Failover Aurora chưa được kiểm thử dưới tải (REL)
9. Kế hoạch DR đa vùng chưa được triển khai (REL)
10. Vá bảo mật không được tự động hóa (SEC)
11. Right-sizing EC2 chưa được xem xét kể từ khi ra mắt (PERF)
12. Các instance Graviton chưa được áp dụng (SUST)
13. CloudFront cache TTL chưa được điều chỉnh (PERF)
14. 40% cơ sở hạ tầng không ở trong IaC (OPS)

"Bắt đầu với những cái rõ ràng," Carlos nói. "Ba cái nào các bạn sẽ sửa trước nếu chỉ có một tuần?"

Maya nói ngay: "Cảnh báo truy cập root. Quyền Lambda quá mức. Tự động hóa vá bảo mật."

"Tại sao?" Carlos hỏi.

"Vì ba cái đó là khoảng trống bảo mật với một bán kính nổ rõ ràng. Những cái khác là cải tiến độ tin cậy và vận hành — quan trọng, nhưng chúng ta đã sống với chúng và chúng chưa gây ra sự cố. Các khoảng trống bảo mật đang âm thầm tích lũy mỗi ngày chúng ta không sửa chúng."

Tom không đồng ý, một cách nhẹ nhàng. "Quyền Lambda quá mức là cấp bách. Nhưng tôi sẽ đổi vá bảo mật lấy bài kiểm thử failover Aurora. Chúng ta chưa bao giờ xác nhận thiết lập Multi-AZ của mình hoạt động đúng dưới tải. Nếu nó thất bại trong giờ cao điểm bữa tối thứ Sáu và chúng ta không có một runbook đã được kiểm thử cho nó, chúng ta gặp rắc rối."

"Cả hai đều có thể là P1," Priya nói. "Chúng ta có một tuần. Năm ngày làm việc. Quyền Lambda là một sửa chữa hai giờ cho mỗi hàm. Cảnh báo truy cập root là một quy tắc sự kiện CloudWatch ba mươi phút. Tự động hóa vá bảo mật là hai ngày thiết lập và kiểm thử Systems Manager. Bài kiểm thử failover Aurora là nửa ngày được lên lịch vào một thứ Ba lúc 2 giờ sáng."

Carlos gật đầu. "Đó là cách đúng để phân loại ưu tiên. Không chỉ 'cái gì quan trọng nhất' mà 'chúng ta thực sự có thể làm gì trong tuần này, và theo thứ tự nào?'"

Phân loại ưu tiên cuối cùng:

**P1 (tuần này)**:
- Sửa đặc quyền tối thiểu cho vai trò thực thi Lambda (7 hàm)
- Cảnh báo CloudWatch tài khoản root
- Bài kiểm thử failover Aurora Multi-AZ dưới tải (lên lịch cho thứ Ba tới, 2 giờ sáng)

**P2 (tháng này)**:
- Tự động hóa vá bảo mật qua Systems Manager
- Các runbook bị thiếu cho 3 sự cố hàng đầu
- Quy trình phản ứng sự cố chính thức được ghi chép
- Di chuyển 40% IaC — xác định tài nguyên nào, xây dựng kế hoạch di chuyển

**P3 (quý này)**:
- Buổi diễn tập xác thực runbook
- Người review dự phòng cho quy trình review IAM được ghi chép
- Các quy tắc security group quá rộng được thắt chặt
- Đợt review right-sizing EC2 qua Compute Optimizer
- Kế hoạch áp dụng Graviton
- Điều chỉnh TTL CloudFront

"Đó là mười bốn phát hiện với chủ sở hữu, ngày đến hạn, và mức ưu tiên," Maya nói. "Chúng ta chưa bao giờ tổ chức như thế này về nợ kỹ thuật."

"Đó là mục đích của review," Carlos nói. "Không phải để làm các bạn cảm thấy tồi tệ về các khoảng trống. Để cho các bạn một từ vựng và một danh sách mà các bạn thực sự có thể thực thi."


**Sự Khác Biệt Giữa Được Thiết Kế Tốt và Chỉ Hoạt Động Được**

"Hệ thống của chúng ta hoạt động," Leo nói sau review. "Nhưng tôi không nhận ra có bao nhiêu thứ chúng ta đã làm 'đủ tốt' và tiếp tục."

"Chúng ta đã nghĩ về điều gì xảy ra nếu chúng ta cứ để các khoảng trống này chưa?" Priya hỏi. "Vấn đề vá đã mở trong nhiều tháng. Quy trình phản ứng sự cố không tồn tại. Đây không phải là những điều nhỏ — chúng là những điều quyết định liệu một sự cố tối thứ Sáu là một sửa chữa 20 phút hay một thảm họa bốn giờ."

"Đó là lý do chúng ta đang làm review," Maya nói.

"Điều đó là bình thường," Priya nói. "Xây dựng dưới áp lực thời gian có nghĩa là bạn đưa ra các lựa chọn thực dụng. Well-Architected review là thời gian có lịch để xem xét lại chúng."

"Một số khoảng trống này có vẻ rõ ràng khi nhìn lại," cô tiếp tục. "Việc vá bảo mật — tôi biết chúng ta chưa tự động hóa nó. Tôi chỉ không bao giờ ưu tiên sửa nó."

"Vì 'nó hoạt động' và 'nó được kiến trúc tốt' cảm giác giống nhau hằng ngày," Maya nói. "Sự khác biệt chỉ trở nên hiển thị khi có vấn đề."

Đây là một trong những điều quan trọng nhất mà một kỹ sư cấp cao hiểu: sự vắng mặt của sự cố không có nghĩa là sự vắng mặt của rủi ro. Nó có nghĩa là rủi ro chưa kích hoạt.

**Infrastructure as Code: Yếu Tố Kích Hoạt Xuất Sắc Vận Hành**

Một chủ đề xuyên suốt nhiều trụ cột: **Infrastructure as Code (IaC)**.

Nếu cơ sở hạ tầng của bạn được cấu hình thủ công qua console, thì:

- Tái tạo nó trong kịch bản DR chậm và dễ xảy ra lỗi
- Kiểm toán các thay đổi là không thể (ai đã thay đổi gì, và khi nào?)
- Khôi phục một thay đổi xấu yêu cầu đảo ngược thủ công
- Tính nhất quán giữa các môi trường (dev/staging/production) yêu cầu kỷ luật

**AWS CloudFormation** cho phép bạn định nghĩa cơ sở hạ tầng trong các template YAML/JSON. **AWS CDK (Cloud Development Kit)** cho phép bạn định nghĩa cơ sở hạ tầng sử dụng các ngôn ngữ lập trình (Python, TypeScript, Java). **Terraform** là một lựa chọn thay thế bên thứ ba phổ biến.

Nimbus đã dần chuyển sang IaC sử dụng Terraform. Vào thời điểm Well-Architected review, khoảng 60% cơ sở hạ tầng của họ được định nghĩa trong code. Review khuyến nghị đến 100%.

"Tại sao 40% còn lại?" Leo hỏi.

"40% còn lại là nơi cơ sở hạ tầng quan trọng của chúng ta tồn tại," Priya nói. "Nếu chúng ta không thể tái tạo nó từ code, chúng ta không thể phục hồi từ một thảm họa vùng một cách đáng tin cậy."

Leo nhìn vào danh sách. "40% còn lại — ừ. Sẽ ổn thôi, chúng ta sẽ di chuyển nó vào sprint tới."

Priya giữ ánh mắt trên màn hình. "Đó là cơ sở hạ tầng quan trọng. Cấu hình failover đa vùng. Phân cấp vai trò IAM. Những thứ mà, nếu chúng ta phải xây dựng lại từ đầu lúc 3 giờ sáng, chúng ta cần biết là chính xác đúng."

Leo cân nhắc điều đó một lúc.

"...Bạn nói đúng," anh nói nhẹ nhàng. "Chúng ta đã có cấu hình thủ công đã trôi dạt khỏi những gì ai đó đã ghi xuống. Nếu chúng ta phải xây dựng lại nó từ đầu, chúng ta sẽ đoán mò."

"Đó là lý do tại sao review tìm ra nó," Maya nói. "Không phải để đổ lỗi. Để sửa nó trước khi nó quan trọng."

**CloudFormation Chuyên Sâu: Công Cụ IaC Gốc AWS**

Trong khi Nimbus đã áp dụng Terraform, Well-Architected review cũng làm nổi lên rằng nhóm chưa bao giờ hiểu đầy đủ AWS CloudFormation — dịch vụ IaC gốc AWS làm nền tảng cho các dịch vụ như CDK, SAM (mô hình ứng dụng serverless), và Service Catalog. Kỳ thi kiểm tra CloudFormation cụ thể, và một số dịch vụ AWS đòi hỏi hiểu nó.

Vấn đề Carlos đã gọi tên sớm hơn trong phiên là cụ thể: Leo đã thủ công nhấp qua console để tạo các môi trường. Mỗi lần mất 45 phút, và bất kỳ sự khác biệt nào giữa staging và production đều vô hình cho đến khi có gì đó hỏng. Ba trong năm sự cố production trong năm qua đã gây ra bởi một cấu hình trong production không khớp với staging — các quy tắc security group khác nhau, các biến môi trường khác nhau, một loại instance khác.

"Console là một cánh cửa một chiều," Carlos nói. "Bạn có thể đi vào và thay đổi mọi thứ, nhưng bạn không thể dễ dàng đi trở ra và xem chính xác cái gì đã được thay đổi, hoặc tái tạo trạng thái của ngày hôm qua."

CloudFormation là câu trả lời cho điều đó. Đây là cách nó hoạt động:

**Template**: Một tệp YAML hoặc JSON khai báo cơ sở hạ tầng AWS bạn muốn. Không phải hướng dẫn về cách tạo nó — một khai báo về nó nên trông như thế nào. "Tôi muốn một VPC với các dải CIDR này, hai public subnet, hai private subnet, một Internet Gateway, và các bảng định tuyến này." CloudFormation đọc template và tìm ra cách làm cho cơ sở hạ tầng thực khớp với khai báo.

Hãy nghĩ về một template như một công thức cho một môi trường. Công thức không thay đổi. Mọi môi trường được tạo từ nó đều giống hệt nhau. Staging và production dùng cùng template, với các tham số khác nhau (kích thước instance khác nhau, tên miền khác nhau). Các quyết định cấu trúc — subnet nào tồn tại, security group nào, vai trò IAM nào — đều giống hệt.

**Stack**: Phiên bản đã triển khai của một template. Khi Leo chạy `aws cloudformation deploy --template-file infrastructure.yaml`, CloudFormation tạo một Stack — một tập hợp được đặt tên gồm các tài nguyên AWS thực tế mà template mô tả. Stack ghi nhớ tài nguyên nào nó đã tạo, và nó quản lý chúng như một đơn vị. Cập nhật template và triển khai lại Stack: CloudFormation tính toán sự khác biệt giữa trạng thái hiện tại và template mới, và áp dụng chỉ những thay đổi cần thiết. Xóa Stack: CloudFormation tháo dỡ mọi tài nguyên nó đã tạo, theo đúng thứ tự, mà bạn không phải nhớ chúng.

"Vậy Stack là việc triển khai, không phải template?" Maya hỏi.

"Template là công thức. Stack là bữa ăn. Bạn có thể làm cùng một bữa ăn từ cùng một công thức bao nhiêu lần tùy thích. Mỗi lần nó đều giống nhau."

**Change Set**: Trước khi áp dụng một bản cập nhật cho một Stack đang chạy, bạn có thể tạo một Change Set — một bản xem trước của những gì CloudFormation sẽ làm. Thêm một tài nguyên mới? Change Set hiển thị nó. Sửa đổi một security group? Change Set hiển thị trước và sau. Thay thế một instance RDS? Change Set gắn cờ nó là một sự thay thế — có nghĩa là downtime — trước khi bạn cam kết.

"Xem diff trước khi áp dụng," Priya nói. "Đây là cái chúng ta đang thiếu khi Leo nhấp các thứ trong console."

Đối với Nimbus, chính sách trở thành: tất cả các thay đổi cơ sở hạ tầng cho production phải đi qua một đợt review Change Set. Không có chỉnh sửa console trực tiếp. Change Set là quy trình peer review cho cơ sở hạ tầng.

**Drift Detection**: Theo thời gian, mọi người nhấp các thứ trong console. Một quy tắc security group được thêm trong một sự cố. Một biến môi trường được đổi giữa một lần triển khai. Một loại instance được tăng thủ công khi sửa chữa theo lịch mất quá lâu. CloudFormation gọi điều này là **drift** — khi trạng thái thực tế của một tài nguyên không còn khớp với những gì template của Stack nói nó nên là.

Drift detection của CloudFormation quét các tài nguyên của Stack và báo cáo bất kỳ sự khác biệt nào giữa trạng thái thực tế và trạng thái được định nghĩa bởi template. Khi Leo chạy drift detection trên các stack Nimbus hiện có lần đầu tiên, anh tìm thấy mười một tài nguyên bị drift. Bảy trong số chúng là sửa đổi security group. Ba là thay đổi chính sách IAM. Một là một bucket S3 đã có chính sách lifecycle của nó được thay đổi trực tiếp trong console sáu tháng trước và không bao giờ được phản ánh trong template.

"Mười một tài nguyên nơi cơ sở hạ tầng thực và template không đồng nhất," Priya nói. "Mười một sự không nhất quán tiềm năng giữa staging và production mà chúng ta không biết."

Leo không nói gì. Một số sửa đổi đó là của anh.

Anh dành tuần tiếp theo để đối chiếu các tài nguyên bị drift với các template. Ba trong số các thay đổi thủ công là lỗi — cấu hình lẽ ra không bao giờ được áp dụng. Phần còn lại là các thay đổi hợp lệ chỉ là không bao giờ được cam kết trở lại template.

**Tại Sao Nó Quan Trọng Cho Well-Architected Framework**: Infrastructure as Code nằm ở giao điểm của Xuất Sắc Vận Hành (triển khai lặp lại được, cơ sở hạ tầng được kiểm soát phiên bản, khả năng kiểm toán mọi thay đổi), Độ Tin Cậy (nếu một Region thất bại, bạn có thể tái tạo môi trường từ template, không phải từ trí nhớ), và Bảo Mật (các vai trò IAM và quy tắc security group được review trong code, không phải phát hiện sau khi đã rồi trong console). Nó không phải là thứ tốt-thì-có — nó là một trong những thực hành nền tảng mà khung liên tục khuyến nghị.

---

> **Mẹo Thi — CloudFormation**
>
> *SAA-C03 Domain: Xuyên domain — Xuất Sắc Vận Hành và Độ Tin Cậy*
>
> - **CloudFormation = IaC khai báo trên AWS.** Bạn khai báo trạng thái mong muốn trong một template; CloudFormation tạo và quản lý các tài nguyên. Tín hiệu kỳ thi: "triển khai lặp lại được," "infrastructure as code," "các môi trường nhất quán."
> - **Template** → **Stack**: template là khai báo; Stack là các tài nguyên đã triển khai. Một Stack có thể được tạo, cập nhật, hoặc xóa như một đơn vị.
> - **Change Set**: Xem trước những gì sẽ thay đổi trước khi áp dụng một bản cập nhật cho một Stack đang chạy. "Xem diff trước khi áp dụng." Tín hiệu kỳ thi: "review các thay đổi cơ sở hạ tầng trước khi triển khai" → Change Set.
> - **Drift Detection**: Xác định các tài nguyên đã được thay đổi thủ công bên ngoài CloudFormation. "Ai đó đã nhấp gì đó trong console" → Drift Detection.
> - **Thuộc tính DeletionPolicy**: Kiểm soát điều gì xảy ra với một tài nguyên khi Stack của nó bị xóa. `Retain` — tài nguyên được giữ (hữu ích cho các bucket S3 có dữ liệu bạn không muốn mất). `Delete` — tài nguyên bị phá hủy (mặc định). `Snapshot` — đối với RDS và một số dịch vụ khác, CloudFormation chụp một snapshot cuối cùng trước khi xóa. Tín hiệu kỳ thi: "ngăn một database RDS bị xóa khi stack bị xóa" → `DeletionPolicy: Snapshot` hoặc `DeletionPolicy: Retain`.
> - **CloudFormation StackSets**: Triển khai cùng một Stack trên nhiều tài khoản AWS và region từ một thao tác duy nhất. Tín hiệu kỳ thi: "triển khai cùng một cơ sở hạ tầng trên tất cả các tài khoản trong một organization."

**Biến Thể: Khi Khung Đánh Lừa Bạn**

Nếu bạn đánh dấu mọi hộp trong một Well-Architected review nhưng chưa xác thực việc phục hồi sau thất bại của mình trong staging, kiến trúc khả dụng cao của bạn sẽ thất bại trong sự cố thực đầu tiên — vì tài liệu về khả năng phục hồi không giống với khả năng phục hồi đã được kiểm thử. Khung hỏi "bạn có Multi-AZ không?" chứ không phải "bạn đã xác nhận rằng failover thực sự hoạt động đúng trong cấu hình cụ thể của bạn chưa?"

Nếu bạn dùng khung như một danh sách kiểm tra để làm hài lòng một kiểm toán viên thay vì như một công cụ tư duy để cải thiện hệ thống, bạn sẽ tạo ra tài liệu chính xác về một kiến trúc bạn không hiểu đầy đủ. Các câu hỏi có giá trị nhất khi chúng tiết lộ các khoảng trống bạn không ngờ tìm thấy.

## Điểm Mạnh và Hạn Chế

**Những gì Well-Architected Framework làm tốt**: Nó cung cấp cho các nhóm ngôn ngữ chung để thảo luận về các đánh đổi kiến trúc — một ngôn ngữ tồn tại sau khi thay đổi nhân sự và các cuộc trò chuyện với nhà cung cấp. Thực hiện Well-Architected Review buộc phải thừa nhận rõ ràng các rủi ro mà thường vô hình: "Đúng, chúng ta biết chúng ta có điểm thất bại duy nhất ở đây; chúng ta chấp nhận đánh đổi đó vì chi phí loại bỏ nó vượt quá chi phí dự kiến của thất bại." Loại đánh đổi có tài liệu, có chủ ý đó là kết quả của một review tốt.

**Những gì nó không thể làm**: Framework là mô tả, không phải quy định. Nó mô tả các thuộc tính của các hệ thống được kiến trúc tốt — nó không nói cho bạn cách xây dựng chúng. Kiểm tra mọi hộp trong Well-Architected Review không đảm bảo một kiến trúc tốt. Một hệ thống có thể có khả dụng cao, xuất sắc về vận hành, tối ưu về chi phí, và vẫn giải quyết vấn đề sai. Framework là một lens, không phải bản thiết kế. Sử dụng nó để làm nổi lên các câu hỏi đúng, không để trả lời chúng.

## Tóm Tắt

Well-Architected review để lại cho họ 14 mục — ba mục cần chú ý ngay, phần còn lại cần một kế hoạch. Các phát hiện rủi ro cao không hẳn là bất ngờ; chúng là những thứ nhóm đã biết và chưa kịp giải quyết. Review cho họ một cách có cấu trúc để thừa nhận các khoảng trống đó một cách cởi mở, ưu tiên chúng theo rủi ro, và cam kết với một mốc thời gian. Trách nhiệm giải trình đó, hơn bất kỳ phát hiện cá nhân nào, là giá trị.

- **AWS Well-Architected Framework** có sáu trụ cột: Xuất Sắc Vận Hành, Bảo Mật, Độ Tin Cậy, Hiệu Quả Hiệu Suất, Tối Ưu Hóa Chi Phí và Bền Vững.
- Mỗi trụ cột có các nguyên tắc thiết kế và các thực hành tốt nhất được đánh giá qua một bộ câu hỏi có cấu trúc.
- **Well-Architected Tool** (miễn phí trong AWS console) hướng dẫn review và tạo báo cáo.
- Kết quả là một danh sách ưu tiên các cải tiến kiến trúc được phân loại theo rủi ro.
- **Infrastructure as Code** là một yếu tố kích hoạt xuyên trụ cột — được khuyến nghị bởi các trụ cột Xuất Sắc Vận Hành, Bảo Mật và Độ Tin Cậy.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Xuyên domain — tất cả domain*

- **Biết tất cả sáu trụ cột và trọng tâm chính của chúng**. Kỳ thi sẽ mô tả một kịch bản (ví dụ: "nhóm muốn đảm bảo hệ thống của họ có thể phục hồi từ lỗi AZ") và hỏi trụ cột nào nó thuộc về (Độ Tin Cậy).
- **Ánh xạ trụ cột**:
  - "Triển khai thay đổi đáng tin cậy, học hỏi từ thất bại, giám sát" → Xuất Sắc Vận Hành
  - "IAM, mã hóa, kiểm soát mạng, phát hiện mối đe dọa" → Bảo Mật
  - "HA, failover, mở rộng, DR" → Độ Tin Cậy
  - "Right-sizing, CDN, lựa chọn công nghệ đúng" → Hiệu Quả Hiệu Suất
  - "Mô hình giá, tài nguyên không sử dụng, khả năng hiển thị chi phí" → Tối Ưu Hóa Chi Phí
  - "Hiệu quả năng lượng, sử dụng tài nguyên, vòng đời dữ liệu" → Bền Vững
- **Infrastructure as Code**: Được khuyến nghị bởi khung để có tính lặp lại, khả năng kiểm toán và phục hồi. CloudFormation, CDK và SAM là công cụ IaC gốc AWS.
- **Well-Architected Tool**: Công cụ console AWS hướng dẫn quy trình review. Miễn phí để sử dụng. Tạo kế hoạch cải tiến.
- **AWS Trusted Advisor**: Tương tự như khung Well-Architected nhưng tự động — quét tài khoản của bạn và cung cấp các khuyến nghị về chi phí, hiệu suất, bảo mật và khả năng chịu lỗi. Sự chồng chéo là thực: Trusted Advisor tự động hóa một số những gì khung đánh giá thủ công.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Đặt tên sáu trụ cột của AWS Well-Architected Framework và mô tả mối quan tâm chính của mỗi cái trong một câu.

*(Cố gắng thực hiện từ trí nhớ. Nếu bạn gặp khó khăn, đó là thông tin hữu ích về trụ cột nào cần được chú ý hơn.)*

**Bài Tập 2 — Kịch Bản SAA-C03**

*Kịch bản*: Một nhóm kỹ thuật đang chuẩn bị cho Well-Architected review. Ứng dụng của họ chạy trên EC2 với RDS Multi-AZ. Gần đây, họ phát hiện ra rằng:

- Quy trình triển khai của họ đôi khi để lại các instance EC2 với các phiên bản thư viện khác nhau (configuration drift)
- Họ không có cảnh báo tự động khi RDS failover được kích hoạt
- Tất cả người dùng IAM của họ đều có AdministratorAccess
- Họ không kiểm thử quy trình khôi phục backup của mình trong 14 tháng

Ánh xạ từng vấn đề đến trụ cột Well-Architected LIÊN QUAN NHẤT.

A) Configuration drift: Xuất Sắc Vận Hành; Không có cảnh báo failover RDS: Độ Tin Cậy; AdministratorAccess: Bảo Mật; Không kiểm thử khôi phục backup: Độ Tin Cậy

B) Configuration drift: Bảo Mật; Không có cảnh báo failover RDS: Hiệu Quả Hiệu Suất; AdministratorAccess: Xuất Sắc Vận Hành; Không kiểm thử khôi phục backup: Tối Ưu Hóa Chi Phí

C) Configuration drift: Độ Tin Cậy; Không có cảnh báo failover RDS: Hiệu Quả Hiệu Suất; AdministratorAccess: Bảo Mật; Không kiểm thử khôi phục backup: Xuất Sắc Vận Hành

D) Configuration drift: Bảo Mật; Không có cảnh báo failover RDS: Độ Tin Cậy; AdministratorAccess: Tối Ưu Hóa Chi Phí; Không kiểm thử khôi phục backup: Bảo Mật

**Gợi ý 1**: "Configuration drift" trong quy trình triển khai → trụ cột nào bao gồm các thực hành triển khai?

**Gợi ý 2**: "AdministratorAccess" cho tất cả người dùng → trụ cột nào bao gồm kiểm soát truy cập?

**Gợi ý 3**: "Khôi phục backup chưa được kiểm thử" → trụ cột nào bao gồm kiểm thử cơ chế phục hồi của bạn?

**Đáp án**: A

**Giải thích**: Configuration drift trong các triển khai (môi trường không nhất quán) là vấn đề Xuất Sắc Vận Hành — đó là về các thực hành triển khai đáng tin cậy, nhất quán. Không có cảnh báo về failover RDS có nghĩa là bạn không biết khi nào các cơ chế HA được kích hoạt — vấn đề Độ Tin Cậy (biết sức khỏe hệ thống của bạn). AdministratorAccess cho tất cả người dùng vi phạm đặc quyền tối thiểu — vấn đề Bảo Mật. Khôi phục backup chưa được kiểm thử có nghĩa là các cơ chế Độ Tin Cậy của bạn (DR) chưa được xác minh.

**Tại sao không phải B?** B gán sai configuration drift cho Bảo Mật (các phiên bản thư viện không nhất quán là vấn đề vận hành triển khai, không phải mối đe dọa bảo mật) và AdministratorAccess cho Xuất Sắc Vận Hành (kiểm soát truy cập là mối quan tâm Bảo Mật, không phải quy trình vận hành).

**Tại sao không phải C?** C đặt đúng AdministratorAccess trong Bảo Mật nhưng gán sai configuration drift cho Độ Tin Cậy (tính nhất quán triển khai là Xuất Sắc Vận Hành) và khôi phục backup chưa được kiểm thử cho Xuất Sắc Vận Hành (kiểm thử phục hồi là mối quan tâm Độ Tin Cậy — bạn đang xác minh rằng hệ thống của bạn có thể phục hồi, không phải quy trình của bạn nhất quán).

**Tại sao không phải D?** D gán AdministratorAccess cho Tối Ưu Hóa Chi Phí (quyền quá rộng không liên quan đến chi phí) và khôi phục backup chưa được kiểm thử cho Bảo Mật (không thể khôi phục backup là thất bại Độ Tin Cậy, không phải lỗ hổng bảo mật).

*SAA-C03 Domain: Xuyên domain*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Thực hiện một mini Well-Architected review về một ứng dụng bạn biết hoặc đang xây dựng. Đối với mỗi trụ cột trong sáu trụ cột, hãy viết:

- Một điều ứng dụng làm tốt
- Một điều ứng dụng có thể cải thiện

Sau đó xếp hạng các mục cải tiến của bạn theo rủi ro (điều gì có nhiều khả năng gây ra sự cố hoặc lãng phí nhất?) và ưu tiên (điều gì sẽ có tác động lớn nhất nếu được sửa?).

*(Bài tập này có giá trị hơn bạn nghĩ. Thực hành đánh giá hệ thống có hệ thống từ nhiều góc độ là kỹ năng kỹ sư cấp cao cốt lõi.)*

## Cảnh Sau Tín Dụng

Ba tuần sau Well-Architected review, nhóm đã triển khai ba sửa chữa P1 — bảy vai trò Lambda đã là đặc quyền tối thiểu, việc sử dụng root kích hoạt một cảnh báo, và failover Aurora đã được kiểm thử dưới tải vào một thứ Ba lúc 2 giờ sáng — và công việc P2 đang được tiến hành.

Vá EC2 hiện đã được tự động hóa qua AWS Systems Manager Patch Manager. Một tài liệu quy trình phản ứng sự cố đã tồn tại (không hoàn hảo, nhưng được viết và chia sẻ). Kế hoạch warm standby đa vùng đã được phác thảo và được lên lịch để triển khai vào quý tới.

Priya xem xét báo cáo Well-Architected Tool. Các phát hiện P1 đã được đóng hoặc được giao với bằng chứng. Các mục rủi ro trung bình và thấp đang thu nhỏ, với chủ sở hữu và ngày tháng.

"Chúng ta đang ở trạng thái tốt hơn so với trước," cô nói.

"Điều đó có tốt không?" Leo hỏi.

"Đó là tiến bộ," cô nói. "Bạn không hoàn thành một Well-Architected review. Bạn tiến bộ, sau đó review lại sau sáu tháng."

Maya đang nghĩ về điều gì đó.

"Chúng ta đã dành 31 chương học các dịch vụ AWS riêng lẻ," cô nói. "Và bây giờ chúng ta bắt đầu nhìn vào toàn bộ hệ thống. Đó là cách kiến trúc sư nghĩ."

"Chúng ta đã nghĩ như kiến trúc sư trong một thời gian rồi," Leo nói.

"Chúng ta đã đưa ra các quyết định kiến trúc," Maya nói. "Điều đó khác. Nghĩ như một kiến trúc sư có nghĩa là bạn đánh giá các quyết định *trước* khi đưa ra chúng, không phải sau."

"Sự khác biệt là gì?" Tom hỏi.

"Trong chương tiếp theo," cô nói, "chúng ta cố gắng trả lời điều đó."

Trong chương tiếp theo: một cuộc review kiến trúc thực sự trông như thế nào, từ các nguyên tắc đầu tiên.
