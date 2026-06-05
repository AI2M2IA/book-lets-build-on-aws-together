# Chương 33: Tùy Thuộc

Hít một hơi thở cuối cùng trước chương này.

Bạn đã đến cuối quyển sách. Đây vừa là kết thúc vừa là khởi đầu — chương cuối, và ngày đầu tiên bạn sẽ đưa ra các quyết định kiến trúc một mình.

Chương này có một công việc: trung thực với bạn về điều mà không ai nói với bạn đủ rõ ràng.

**Câu Hỏi**

Ở cuối hầu hết mọi cuộc thảo luận kiến trúc, ai đó cuối cùng hỏi: "Câu trả lời đúng là gì?"

Và câu trả lời hữu ích nhất, khó chịu nhất, trung thực nhất và bị hiểu lầm nhất trong tất cả kỹ thuật phần mềm là:

**Tùy thuộc.**

Không phải vì câu hỏi không thể trả lời được. Không phải vì chuyên gia đang né tránh. Mà vì câu trả lời đúng thực sự, về mặt cấu trúc, phụ thuộc vào ngữ cảnh không có trong câu hỏi.

Chương này là về việc học cách nói "tùy thuộc" một cách đúng đắn — có nghĩa là có thể hoàn thành câu.

Hãy nghĩ về một bác sĩ được hỏi: "Phẫu thuật có phải là phương pháp điều trị đúng không?" Một bác sĩ tồi nói có hoặc không mà không khám bệnh nhân. Một bác sĩ giỏi nói: "Tùy thuộc — vào chẩn đoán, tuổi bệnh nhân, các tình trạng khác của họ, và điều gì xảy ra nếu chúng ta chờ đợi." Câu trả lời không phải là lảng tránh. Đó là độ chính xác. "Tùy thuộc" theo sau bởi một câu đầy đủ là điều hữu ích nhất mà bác sĩ — hay kiến trúc sư — có thể nói.

**Kết Thúc Của Nimbus**

Hai năm sau khi bắt đầu. Maya đang đứng trong phòng họp ở Seattle, trình bày cho phòng của các nhà đầu tư mạo hiểm.

Nimbus đã phát triển: 947 đối tác nhà hàng. 18,000 đơn hàng hằng ngày. $2.1 triệu GMV hàng tháng. Ba thành phố đang hoạt động, hai thành phố nữa đang ra mắt. Một nhóm mười bốn kỹ sư trên hai múi giờ.

Các nhà đầu tư có câu hỏi. Một trong số họ — đối tác kỹ thuật của quỹ — ngả người về phía trước.

"Bạn đang sử dụng cơ sở dữ liệu nào?" ông hỏi.

Maya không do dự.

"Cho đơn hàng và dữ liệu khách hàng: Aurora PostgreSQL. Cho danh mục menu: DynamoDB. Cho quản lý phiên và caching: ElastiCache Redis. Cho analytics: Athena trên các tệp Parquet S3, với Redshift cho các truy vấn dashboard tần suất cao."

Ông gật đầu. "Tại sao Aurora cho đơn hàng và không phải DynamoDB?"

"Vì đơn hàng có cấu trúc quan hệ phức tạp — chúng tham chiếu đến các mục menu, tài khoản khách hàng, địa chỉ nhà hàng, phương thức thanh toán. Chúng ta cần tính nhất quán giao dịch trên nhiều thực thể. Cơ sở dữ liệu quan hệ là công cụ đúng cho điều đó. Điểm mạnh của DynamoDB là truy cập key-value thông lượng cao với schema linh hoạt, chính xác là mẫu truy cập của danh mục menu."

Ông viết điều gì đó xuống. "Còn về mở rộng? Bạn nói 18,000 đơn hàng hằng ngày. Đó là khoảng 12 mỗi phút trung bình. Bạn đã thiết kế cho giờ cao điểm như thế nào?"

"Giờ cao điểm tối thứ Sáu là khoảng 25 lần trung bình. Chúng ta mở rộng ngang với ECS và Aurora Serverless v2, tự động xử lý burst. CloudFront hấp thụ tải nội dung tĩnh. API là stateless, vì vậy mở rộng ngang sạch."

"Và nếu Aurora Serverless v2 không thể mở rộng đủ nhanh?"

"Chúng ta có kết quả kiểm thử tải. Thời gian mở rộng cho Aurora Serverless v2 là dưới 10 giây. Đợt tăng vọt thứ Sáu trung bình của chúng ta mất 8 phút từ tải cơ sở. Chúng ta thoải mái với khoảng dự phòng."

Đối tác kỹ thuật nhìn các nhà đầu tư còn lại. "Cô ấy biết hệ thống của mình."

**Bốn Câu Hỏi Dưới "Tùy Thuộc"**

Mọi đánh đổi kiến trúc đều rút gọn xuống bốn câu hỏi cơ bản. Không phải mọi câu hỏi đều quan trọng như nhau cho mỗi quyết định, nhưng tất cả bốn câu hỏi luôn có mặt:

**1. Mẫu truy cập là gì?**

Dữ liệu được ghi và đọc như thế nào? Với tần suất nào? Bởi bao nhiêu người dùng đồng thời? Theo thứ tự nào? Theo khóa nào?

Câu hỏi này xác định lựa chọn công nghệ ở cấp độ cơ bản nhất. DynamoDB vs Aurora vs Redshift vs Athena — câu trả lời đúng phụ thuộc gần như hoàn toàn vào mẫu truy cập.

**2. Quy mô là gì?**

Không chỉ bây giờ — trong 12 tháng, trong 5 năm. Quy mô thay đổi câu trả lời đúng. Những gì hoạt động ở 100 yêu cầu mỗi ngày bị hỏng ở 100 triệu. Những gì là quá mức ở 10 người dùng là cần thiết ở 10,000.

Và quy mô không chỉ là lưu lượng. Đó là quy mô nhóm (kiến trúc phải có thể duy trì bởi nhóm bạn có). Đó là khối lượng dữ liệu. Đó là phạm vi địa lý.

**3. Hậu quả thất bại là gì?**

Nếu điều này bị hỏng, điều gì xảy ra? Người dùng có thấy trang chậm không? Đơn hàng có thất bại không? Tiền có chuyển sai không? Bệnh án của ai đó có trở nên không thể truy cập không?

Hậu quả xác định bạn đầu tư bao nhiêu vào độ tin cậy. Một trang menu chậm bảo đảm eventual consistency. Một thanh toán thất bại bảo đảm ghi đồng bộ và xác nhận rõ ràng.

**4. Ràng buộc chi phí là gì?**

Không chỉ tiền — cũng độ phức tạp vận hành (bản thân nó là một dạng chi phí). Một giải pháp yêu cầu ba dịch vụ bổ sung có thể vượt trội về mặt kỹ thuật so với một giải pháp đơn giản hơn nhưng quá đắt để duy trì với một nhóm bốn người.

**"Tùy Thuộc": Cách Hoàn Thành Câu**

Cách đúng để nói "tùy thuộc" là hoàn thành nó ngay lập tức:

*"Chúng ta nên sử dụng DynamoDB hay Aurora?"*

"Tùy thuộc vào mẫu truy cập. Nếu bạn cần tra cứu key-based thông lượng cao với schema linh hoạt, DynamoDB. Nếu bạn cần tính nhất quán giao dịch trên các thực thể liên quan với các truy vấn phức tạp, Aurora."

*"Chúng ta nên sử dụng Lambda hay EC2?"*

"Tùy thuộc vào đặc điểm khối lượng công việc. Lambda cho các khối lượng công việc event-driven, thời gian ngắn, biến đổi nơi chi phí nhàn rỗi bằng không quan trọng. EC2 hoặc ECS cho các quy trình bền vững, stateful hoặc chạy lâu nơi hiệu suất có thể dự đoán quan trọng hơn chi phí nhàn rỗi."

*"Chúng ta nên sử dụng Multi-AZ hay Multi-Region?"*

"Tùy thuộc vào yêu cầu RTO/RPO và mô hình mối đe dọa của bạn. Multi-AZ bảo vệ chống lại lỗi AZ (chế độ lỗi AWS phổ biến nhất) và cung cấp RPO ~0 và RTO ~60 giây cho RDS. Multi-Region bảo vệ chống lại lỗi vùng (hiếm) và phục vụ người dùng phân tán toàn cầu. Nếu bạn cần failover dưới một phút từ thảm họa vùng, Multi-Region. Nếu khả năng phục hồi AZ là đủ, Multi-AZ đơn giản hơn nhiều và rẻ hơn."

"Tùy thuộc" không phải là kết thúc của câu trả lời. Đó là bắt đầu của câu trả lời thực sự.

**Các Mẫu Không Thay Đổi**

Trong khi các lựa chọn công nghệ cụ thể phát triển — dịch vụ mới ra mắt, giá thay đổi, lựa chọn thay thế tốt hơn xuất hiện — một số mẫu cơ bản đã ổn định trong nhiều thập kỷ:

**Tách biệt mối quan tâm**: Các thành phần làm những việc khác nhau nên độc lập. Thay đổi một cái không nên yêu cầu thay đổi cái khác. Đây là lý do tại sao bạn tách rời bằng SQS, không gọi trực tiếp. Tại sao bạn dùng S3 cho object, không phải cơ sở dữ liệu. Tại sao tầng web và tầng cơ sở dữ liệu là riêng biệt.

**Bảo vệ theo chiều sâu**: Không có kiểm soát bảo mật đơn lẻ nào là đủ. Bạn có IAM, security groups, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Nếu một lớp bị lỗi, lớp tiếp theo bắt lấy.

**Trả tiền cho những gì bạn sử dụng, khi bạn sử dụng nó**: Nguyên tắc kinh tế cơ bản của cloud. Lambda thu nhỏ về không. Spot instance sử dụng năng lực dự phòng. Chính sách lifecycle S3 chuyển dữ liệu lạnh đến lưu trữ rẻ hơn. DynamoDB on-demand tính phí theo yêu cầu. Các mẫu khác nhau; nguyên tắc giống nhau.

**Tối ưu hóa cho thất bại có nhiều khả năng xảy ra nhất**: Multi-AZ trước (lỗi AZ xảy ra). Cross-region DR thứ hai (lỗi vùng hiếm hơn). Dự phòng trong-AZ (nhiều instance) trước khi phức tạp cross-region. Xây dựng cho thất bại thực tế, không phải thảm khốc nhưng không chắc chắn xảy ra.

**Đo lường trước khi tối ưu hóa**: Cách tiếp cận của Tom — mở các chỉ số CloudWatch, hiểu mẫu thực tế, sau đó đưa ra quyết định — có giá trị hơn tối ưu hóa sớm dựa trên giả định.

**Những Gì Quyển Sách Này Không Thể Dạy Bạn**

Hãy trực tiếp về các giới hạn.

Quyển sách này đã dạy bạn:

- Mỗi dịch vụ AWS chính làm gì
- Các phép so sánh làm chúng trực quan
- Các đánh đổi giữa các lựa chọn thay thế
- Kiến thức kỳ thi bạn cần cho SAA-C03
- Khung để suy nghĩ về các quyết định kiến trúc

Quyển sách này không thể dạy bạn:

- **Trực giác production**: Cảm giác nói "điều này sẽ trở nên kỳ lạ dưới tải" trước khi bạn thấy nó xảy ra. Điều này đến từ việc vận hành các hệ thống thực.
- **Phán đoán kỹ thuật dưới áp lực**: Quyết định phải làm gì lúc 3 giờ sáng khi hệ thống bị down và bạn có thông tin không đầy đủ. Điều này đến từ các sự cố.
- **Trực giác stakeholder**: Biết khi nào cần phản đối yêu cầu kinh doanh vì chi phí kỹ thuật quá cao. Điều này đến từ kinh nghiệm với cả hai mặt kỹ thuật và kinh doanh.
- **Câu hỏi đúng cho ngữ cảnh cụ thể**: Carlos có thể hỏi đúng câu hỏi vì anh đã thấy những vấn đề tương tự hàng chục lần. Kiến thức này được kiếm, không phải đọc.

Bạn chưa học xong. Bạn mới chỉ bắt đầu.

**Kỳ Thi Không Phải Là Đích Đến**

Bạn đã chọn quyển sách này để chuẩn bị cho kỳ thi AWS Solutions Architect Associate. Điều đó hợp lệ. Chứng chỉ SAA-C03 là thực, có giá trị, và sẽ mở ra cánh cửa.

Nhưng kỳ thi kiểm tra kiến thức và nhận biết mẫu. Nó không kiểm tra phán đoán. Không kiểm tra kinh nghiệm vận hành. Không kiểm tra những gì bạn làm khi kiến trúc bạn xây dựng ngừng hoạt động lúc 11 giờ tối một thứ Sáu.

Chứng chỉ là thông tin xác thực bắt đầu. Khi bạn đậu kỳ thi, bạn sẽ biết các dịch vụ AWS hoạt động như thế nào và cách chúng kết hợp. Bạn sẽ có khung để suy nghĩ về kiến trúc. Bạn sẽ chưa làm điều đó.

Bước tiếp theo sau kỳ thi: xây dựng điều gì đó thực. Triển khai nó. Vận hành nó. Xem nó thất bại. Sửa nó. Hết tiền trong một dịch vụ và chuyển chi phí sang chỗ khác. Bị gọi giữa đêm và đưa ra quyết định với thông tin không đầy đủ.

Đó là cách kiến thức trong quyển sách này trở thành phán đoán.

**Câu Trả Lời Cuối Cùng Của Maya**

Cuối buổi họp nhà đầu tư, đối tác kỹ thuật có thêm một câu hỏi nữa.

"Nếu bạn bắt đầu lại ngày hôm nay, biết những gì bạn biết bây giờ, bạn sẽ làm gì khác đi?"

Maya dành một chút thời gian.

"Tôi sẽ bắt đầu với infrastructure as code từ ngày đầu," cô nói. "Leo đã triển khai instance EC2 đầu tiên theo cách thủ công. Chúng ta đã dành sáu tháng di chuyển mọi thứ sang Terraform. Đó là sáu tháng nợ kỹ thuật tốn thời gian thực sự của chúng ta."

"Còn gì nữa?"

"Tôi sẽ thận trọng hơn về các managed service trong giai đoạn đầu. Chúng ta đã sử dụng DynamoDB khi một cơ sở dữ liệu RDS đơn giản sẽ đủ trong nhiều tháng. Thiết kế mẫu truy cập DynamoDB yêu cầu tư duy có kinh nghiệm mà chúng ta chưa có. Chúng ta đã thiết kế lại schema hai lần."

"Vậy đơn giản hơn là tốt hơn trong giai đoạn đầu?"

"Đơn giản hơn là tốt hơn *luôn luôn*. Câu hỏi luôn là: điều đơn giản nhất giải quyết vấn đề thực sự là gì, không phải vấn đề tương lai dự đoán? Chúng ta đã thêm độ phức tạp để giải quyết các vấn đề chúng ta chưa có. Một số độ phức tạp đó đã gây ra vấn đề của chính nó."

Đối tác kỹ thuật viết điều đó xuống.

"Câu hỏi cuối cùng," ông nói. "Điều quan trọng nhất bạn biết về xây dựng trên AWS mà bạn không biết khi bắt đầu là gì?"

Maya nghĩ về hai năm. Các sự cố. Các đánh giá chi phí. Well-Architected review. Các quyết định kiến trúc được đưa ra dưới áp lực và những cái được thực hiện cẩn thận. Những cái họ làm đúng và những cái phải làm lại.

"Cloud không giải quyết các vấn đề kiến trúc," cô nói. "Nó khuếch đại chúng. Một quyết định tồi on-premises có thể tốn của bạn một tuần. Một quyết định tồi trên cloud có thể tốn tiền mỗi tháng, ở quy mô, cho đến khi ai đó chú ý."

Cô dừng lại.

"Cloud làm cho các quyết định tốt có quy mô. Và các quyết định tồi cũng vậy."

**Phần Kết**

Bạn đã học được rất nhiều. Các dịch vụ AWS. Các đánh đổi. Các mẫu.

Bây giờ hãy làm điều gì đó với nó.

Xây dựng điều gì đó. Cố tình mắc lỗi. Đọc post-mortem (chúng là công khai — AWS, Cloudflare, GitHub, Stripe đều xuất bản chúng). Làm việc với các nhóm giỏi hơn bạn về những điều bạn yếu nhất.

Kỳ thi SAA-C03 sẽ kiểm tra xem bạn có biết tài liệu không. Sự nghiệp của bạn sẽ kiểm tra xem bạn có thể áp dụng nó không.

Cả hai đều đáng làm. Cả hai đều không phải là đích đến cuối cùng.

Không có đích đến cuối cùng trong lĩnh vực này. Chỉ có vấn đề tiếp theo, quyết định tiếp theo, và thói quen hỏi câu hỏi đúng tiếp theo.

Chúc may mắn.

Trong chương tiếp theo: điều gì thay đổi khi công việc không còn là xây dựng hệ thống — mà là chịu trách nhiệm về nó.

## Tóm Tắt

- **"Tùy thuộc" là bắt đầu của câu trả lời**, không phải kết thúc. Luôn hoàn thành câu với các điều kiện nó phụ thuộc vào.
- Bốn câu hỏi dưới mỗi đánh đổi kiến trúc: mẫu truy cập, quy mô, hậu quả thất bại, ràng buộc chi phí.
- Các mẫu bền vững: tách biệt mối quan tâm, bảo vệ theo chiều sâu, trả tiền cho những gì bạn sử dụng, tối ưu hóa cho thất bại có khả năng xảy ra, đo lường trước khi tối ưu hóa.
- **Cloud khuếch đại các quyết định** — tốt và tồi. Một quyết định tồi on-premises tốn một tuần; một quyết định tồi trên cloud tích lũy hàng tháng, ở quy mô.
- Chứng chỉ SAA-C03 kiểm tra kiến thức và nhận biết mẫu. Kinh nghiệm production biến kiến thức đó thành phán đoán.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Xuyên domain — tất cả domain*

Chương này kết thúc nội dung kỳ thi của quyển sách này. Trước khi bạn thi:

**Xem xét các dịch vụ bạn ít tự tin nhất về**:

- Đối với hầu hết mọi người: Kinesis vs SQS (sự phân biệt stream vs queue)
- VPC networking (bảng định tuyến, subnets, NAT Gateway, Internet Gateway)
- Logic đánh giá policy IAM (deny rõ ràng > allow rõ ràng > deny ngầm định)
- Lựa chọn storage class (biết cả sáu storage class S3 và đánh đổi của chúng)
- RDS vs Aurora vs DynamoDB cho các trường hợp sử dụng cụ thể

**Biết cấu trúc kịch bản điển hình của kỳ thi**:

SAA-C03 trình bày một yêu cầu kinh doanh ("công ty cần khả dụng 99.99%") và yêu cầu bạn xác định kiến trúc đáp ứng nó. Luôn đọc yêu cầu, xác định ràng buộc chính, và loại bỏ các lựa chọn không đáp ứng nó.

**Thực hành nhận biết câu trả lời gây lạc hướng**:

Mỗi câu trả lời sai trong kỳ thi là sai vì một lý do cụ thể. Học cách xác định *tại sao* mỗi câu trả lời sai có giá trị hơn ghi nhớ câu trả lời đúng.

**Kỳ thi thưởng nhận biết mẫu**:

- "Tách rời" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Độ trễ thấp toàn cầu" → CloudFront, Global Accelerator, DynamoDB Toàn cầu, Aurora Toàn cầu
- "Tuân thủ/kiểm toán" → CloudTrail, Config, Security Hub, Macie
- "Tối ưu hóa chi phí" → Spot Instances, Savings Plans, chính sách lifecycle, right-sizing

**Bạn đã sẵn sàng**. Không phải vì quyển sách này bao gồm mọi thứ — không có gì làm được. Mà vì bạn hiểu các nguyên tắc đủ để lý luận đến câu trả lời ngay cả khi bạn không ngay lập tức nhận ra kịch bản chính xác.


## Bài Tập

**Bài Tập Cuối Cùng**

Không còn câu hỏi kỳ thi có cấu trúc nào sau chương này.

Thay vào đó: một câu hỏi mở.

Bạn sẽ xây dựng hệ thống nào ngày hôm nay, biết những gì bạn biết?

Viết nó xuống. Phác thảo kiến trúc. Xác định các dịch vụ. Lưu ý các đánh đổi bạn sẽ thực hiện và lý do tại sao. Dự đoán các failure mode.

Sau đó xây dựng nó.

Đó là nhiệm vụ. Không có hạn chót. Không có điểm. Chỉ có công việc.

## Cảnh Sau Tín Dụng

Khoản đầu tư đã được chấp thuận.

Series A. $4 triệu. Đủ để mở rộng đến năm thành phố mới, tăng gấp ba nhóm kỹ thuật, và xây dựng Nimbus Instant.

Buổi tối hôm đó, Maya ở nhà hàng của gia đình. Cái gốc. Cái nơi Nimbus bắt đầu, khi cô nhận ra họ đang mất đơn hàng vì điện thoại luôn bận.

Cô gọi arepa — món ăn cô luôn gọi.

Trong khi chờ, cô mở laptop và đọc chương đầu tiên của quyển sách này.

*"Website tồn tại ở đâu?"*

Cô nhớ mình không biết câu trả lời.

Cô mỉm cười.

Cô đóng laptop lại.

Thức ăn đến.

Nó hoàn hảo.

*Cảm ơn bạn đã đọc.*

*Kỳ thi AWS Solutions Architect Associate (SAA-C03) có sẵn tại các trung tâm kiểm tra Pearson VUE và trực tuyến qua hệ thống kiểm tra từ xa của họ. Truy cập aws.amazon.com/certification để đăng ký.*

*Câu chuyện về Nimbus là hư cấu. Các dịch vụ AWS, mô hình giá và các thực hành tốt nhất được mô tả trong quyển sách này là thực. Cả hai đều có thể thay đổi — AWS cập nhật dịch vụ thường xuyên. Luôn xác minh giá hiện tại và khả năng dịch vụ tại aws.amazon.com.*

*Chúc may mắn.*
