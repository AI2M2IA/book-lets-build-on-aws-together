# Chương 30: Chi Phí Ẩn

Tom có một bảng trắng trong phòng họp với ba cột: tính toán, lưu trữ, mạng. Hai cột đầu đã được điền vào — các con số, ngày tháng, tên các tối ưu hóa đã hoàn thành. Anh đứng trước bảng trắng một lúc trước khi viết bất cứ thứ gì vào cột thứ ba. Các dòng mạng trên hóa đơn AWS rải rác trên trang theo cách mà những cái khác không có. Mỗi cái có một tên khác, một đơn vị khác, một lý do biện minh khác cho việc tại sao tiền đang ra đi.

Anh mở nắp bút.

**Tóm tắt nhanh: Ẩn Số Cuối Cùng Trên Hóa Đơn**

Đợt kiểm toán cơ sở dữ liệu đã đóng lại khoản mục lớn cuối cùng mà Tom đang tích cực làm việc — $491/tháng được thu hồi, $5,892 mỗi năm. Cộng thêm EC2 Savings Plans, các chính sách lifecycle S3, và đợt dọn dẹp lưu trữ, tổng đang chạy là $34,092 tiết kiệm hằng năm sau ba tháng làm việc. Nhưng Tom đã để ý, trong đợt đi sâu vào cơ sở dữ liệu, rằng một danh mục hầu như chưa được xem xét. Chi phí lưu trữ hiện ra như một dòng: "S3: $198." Chi phí tính toán hiện ra như một dòng: "EC2: $2,340" — trước khi các khoản giảm giá Savings Plan từ Chương 27 đáp xuống. Chi phí mạng rải rác trên hàng chục mục với các tên như "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer," và "CloudFront Data Transfer." Anh chưa bao giờ cộng chúng lại và nhìn vào tổng. Đó là công việc của hôm nay.

Tom mở hóa đơn lên. Tìm phần chuyển dữ liệu. Cộng tất cả các mục hóa đơn.

Chi phí mạng trong AWS giống như hệ thống thu phí của một thành phố: lái xe vào thành phố miễn phí, nhưng mỗi đường hầm bạn đi ra trả tiền, và lái xe giữa các khu phố cũng tốn một ít. Hầu hết mọi người không nghĩ về các khoản thu phí cho đến khi họ nhận được hóa đơn vào cuối tháng và nhận ra họ đã đi qua đường hầm mỗi ngày khi có một con đường bề mặt miễn phí suốt thời gian. Mục tiêu của chương này là hiểu mọi trạm thu phí — và quyết định cái nào đáng trả.

$847/tháng.

"Chúng ta đang chi $847 một tháng cho chuyển dữ liệu," anh nói.

"Nhiều không?" Leo hỏi.

"Đúng bằng hóa đơn S3 của chúng ta trước khi chúng ta tối ưu hóa nó. Và tôi thậm chí không biết chúng ta có hóa đơn chuyển dữ liệu với quy mô này."

Maya nhìn qua. "Chuyển dữ liệu chính xác là gì?"

"Đó là những gì AWS tính phí cho việc di chuyển byte. Byte vào AWS: thường miễn phí. Byte ra khỏi AWS đến internet: tính phí. Byte giữa các dịch vụ ở các region khác nhau: tính phí. Byte đi qua NAT Gateway: tính phí."

"Bạn có thể phân tích chi tiết không?"

Tom có thể. Nhưng lần này anh không dừng lại ở console thanh toán. Anh đã bật VPC Flow Logs trên tất cả các VPC của họ và đưa chúng vào CloudWatch Logs Insights. Điều này cho anh truy vấn các luồng lưu lượng thực tế — không chỉ các con số đô la, mà nguồn nào đang gửi dữ liệu đến đâu, và bao nhiêu.

Truy vấn mất hai phút để chạy. Kết hợp với một nguồn log nữa mà anh sẽ kéo vào sớm, đầu ra đủ cụ thể để hành động.

**Phân Tích Lưu Lượng: Điều Gì Thực Sự Tạo Ra Hóa Đơn**

Năm luồng lưu lượng hàng đầu theo khối lượng, theo thứ tự:

1. Máy chủ ứng dụng EC2 → NAT Gateway → các dịch vụ AWS (SSM, Secrets Manager, CloudWatch, SQS): 3.9TB/tháng
2. Máy chủ ứng dụng EC2 → NAT Gateway → các API bên ngoài: 1.3TB/tháng
3. Endpoint reader Aurora → máy chủ ứng dụng EC2 (cross-AZ): 0.4TB/tháng
4. Pipeline analytics → bucket S3 ở us-east-1 (cross-region): 0.3TB/tháng
5. CloudFront → S3 origin (cache miss): 0.2TB/tháng

Bốn cái đầu đến thẳng từ Flow Logs. Cái thứ năm thì không thể: VPC Flow Logs chỉ thấy lưu lượng đi qua các network interface bên trong VPC của bạn, và một cache miss CloudFront fetch từ S3 không bao giờ chạm vào VPC — đó là CloudFront nói chuyện trực tiếp với S3. Với luồng đó, Tom đã kéo các access log tiêu chuẩn của CloudFront và lọc theo trường `x-edge-result-type`: mọi mục được đánh dấu `Miss` là một yêu cầu mà CloudFront phải fetch từ origin, và cộng các byte cho anh con số 0.2TB. Một hóa đơn, hai công cụ — mỗi cái mù với những gì cái kia thấy.

"Luồng số bốn," Priya nói. "Tại sao pipeline analytics của chúng ta đang nói chuyện với một bucket ở us-east-1?"

Leo có một biểu cảm trên mặt mà Tom nhận ra.

"Tôi đã triển khai nó rồi — ồ," Leo nói. "Sáu tháng trước tôi đang kiểm thử liệu pipeline analytics của chúng ta có thể fan-out đến nhiều region song song không. Tôi đã khởi tạo một bucket kiểm thử ở us-east-1, trỏ pipeline vào nó, và chạy trong một tuần. Bài kiểm thử kết thúc nhưng tôi quên xóa đích us-east-1 khỏi cấu hình pipeline."

"Vậy trong năm tháng," Tom nói, "chúng ta đã ghi một bản sao của mọi kết quả analytics vào một bucket ở Virginia."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

Chuyển cross-region từ us-west-2 sang us-east-1: $0.02/GB. 300GB/tháng = $6/tháng cho việc chuyển. Cộng với lưu trữ S3 cho dữ liệu trùng lặp ở us-east-1: 300GB × 5 tháng × $0.023/GB = $34.50 dữ liệu được lưu.

"Không lớn," Leo nói.

"Không lớn mỗi tháng," Tom nói. "Nhưng nó đã chạy trong năm tháng và không ai biết. Đó là chi phí ngoài ý muốn. Câu hỏi không phải là $6 có quan trọng không — mà là liệu chúng ta có biết tại sao mỗi đô la đang được chi không."

Leo đã xóa bucket kiểm thử us-east-1 và loại bỏ đích khỏi cấu hình pipeline.

Phát hiện có thể hành động nhất trong đầu ra flow log là luồng số một: máy chủ ứng dụng EC2 gọi các dịch vụ AWS qua NAT Gateway.

Tom kéo các mục log cụ thể cho truy vấn CloudWatch Logs Insights, được lọc để chỉ hiển thị lưu lượng đến các dải IP của dịch vụ AWS:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

Đầu ra cho thấy điều gì đó anh không ngờ tới: khoảng 300 GB mỗi tháng lưu lượng S3 cùng region — riêng biệt với luồng cross-region đến bucket us-east-1 của Leo — đang đi qua NAT Gateway. Nhưng Tom đã cấu hình S3 Gateway Endpoints từ nhiều tháng trước.

"Chúng ta có một S3 Gateway Endpoint," Leo nói. "Tại sao lưu lượng S3 vẫn đi qua NAT?"

Tom nhìn vào bảng định tuyến. Gateway Endpoint đã được cấu hình — nhưng chỉ cho VPC ứng dụng. Pipeline analytics chạy trong một VPC riêng được tạo chín tháng trước để cách ly dữ liệu. VPC đó không có S3 Gateway Endpoint. Mọi cuộc gọi S3 từ các instance EC2 của pipeline analytics đều định tuyến qua NAT Gateway của VPC đó.

"0.3TB lưu lượng pipeline analytics × $0.045/GB = $13.50/tháng," Tom nói. "Chỉ từ endpoint bị thiếu trong VPC thứ hai."

"Chi phí để thêm endpoint là bao nhiêu?" Leo hỏi.

"Không," Tom nói. "S3 Gateway Endpoints miễn phí. Nó là một mục trong bảng định tuyến."

Thêm Gateway Endpoint vào VPC analytics sẽ mất bốn phút và cắt $13.50 khỏi phí NAT Gateway hằng tháng — một con số tuyệt đối nhỏ, nhưng phát hiện là nguyên tắc. Họ đã thêm một biện pháp kiểm soát chi phí trong một VPC và quên nhân bản nó khi tạo VPC thứ hai. Sự nhất quán đòi hỏi quy trình, không chỉ kiến thức.

Tom thêm vào danh sách kiểm tra triển khai: khi tạo một VPC mới, thêm S3 và DynamoDB Gateway Endpoints trước khi gắn bất kỳ khối lượng công việc nào.

Phát hiện cụ thể thứ hai từ flow log thì đắt hơn. Lưu lượng từ các hàm Lambda chạy hệ thống thông báo đơn hàng — truy cập S3 để đọc các tệp cấu hình nhà hàng — đang đi qua NAT Gateway thay vì endpoint S3. Các hàm Lambda chạy bên trong VPC (để truy cập RDS), và endpoint S3 của VPC chỉ được cấu hình cho các instance EC2 trong subnet ứng dụng. Các hàm Lambda trong subnet Lambda đang định tuyến qua NAT.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Chúng ta có endpoint. Tại sao Lambda không dùng nó?"

"VPC Gateway Endpoints áp dụng theo từng subnet dựa trên bảng định tuyến," Tom nói. "Các hàm Lambda nằm trong subnet riêng của chúng với bảng định tuyến riêng. Bảng định tuyến đó không có route endpoint. Tôi đã thêm nó cho subnet ứng dụng. Tôi đã bỏ lỡ subnet Lambda."

Thêm route endpoint S3 vào bảng định tuyến subnet Lambda sẽ tiết kiệm thêm $41/tháng trong phí xử lý NAT Gateway đã tính cho các cuộc gọi S3 lẽ ra phải miễn phí.

Phân tích flow log đã tự bù đắp. Ba giờ thời gian truy vấn, ba phát hiện cụ thể: endpoint VPC analytics bị quên ($13.50/tháng), khoảng trống định tuyến subnet Lambda ($41/tháng), và phát hiện lớn ban đầu trở thành cơ sở cho các quyết định Interface Endpoint. Tổng tiết kiệm hằng tháng bổ sung được xác định bởi phân tích flow log: $54.50, trên đỉnh của $78 từ Interface Endpoints mà phân tích đã làm nổi lên. Hai cách khắc phục nhỏ hơn đó được đưa vào backlog cho sprint tiếp theo; bảng tiết kiệm ở cuối chương này chỉ tính những gì đã được triển khai.

"Bài học là VPC endpoint không phải là cấu hình một lần," Tom nói. "Mỗi VPC mới, mỗi subnet mới, mỗi loại khối lượng công việc mới đều đòi hỏi cùng đợt kiểm tra. Mặc định cho bất cứ thứ gì trong một private subnet là định tuyến qua NAT. Đợt kiểm tra là: khối lượng công việc này có gọi S3, DynamoDB, hoặc bất kỳ dịch vụ AWS lưu lượng cao nào không? Nếu có, nó có route endpoint không?"

"Chúng ta đã nghĩ về việc tự động hóa đợt kiểm tra đó chưa?" Priya hỏi. "Một quy tắc AWS Config cảnh báo khi một private subnet được tạo mà không có route endpoint S3?"

"Nó nằm trong danh sách," Tom nói. "Ngay sau cảnh báo volume mồ côi."


Và với điều đó, Tom có câu trả lời cho câu hỏi đã khởi đầu phân tích. Chi phí mạng không phải là một vấn đề đơn lẻ. Chúng là năm vấn đề khác nhau, mỗi cái với một giải pháp khác nhau.

**Cách AWS Tính Phí Chuyển Dữ Liệu**

Giá chuyển dữ liệu của AWS là bất đối xứng:

**Vào AWS (inbound)**: Miễn phí. Bạn có thể tải lên bao nhiêu dữ liệu tùy muốn.

**Ra khỏi AWS đến internet (outbound)**: Tính phí. 100GB/tháng đầu tiên miễn phí. Sau đó:

- $0.09/GB cho 10TB/tháng đầu tiên (các region Mỹ)
- $0.085/GB cho 40TB tiếp theo
- Thấp hơn ở khối lượng cao hơn

**Trong cùng Availability Zone**: Miễn phí. Các instance EC2 nói chuyện với nhau trong cùng AZ không trả gì.

**Giữa các Availability Zone (cùng region)**: $0.01/GB mỗi chiều. Chi phí nhỏ nhưng thực.

**Giữa các Region**: $0.02-0.08/GB tùy thuộc vào region. Lưu lượng cross-region đắt hơn đáng kể.

**NAT Gateway**: $0.045/GB được xử lý. Mỗi byte instance EC2 riêng tư của bạn gửi qua NAT Gateway để đến internet — và mỗi byte trả về — đều bị tính phí.

**CloudFront**: Tỷ lệ chuyển dữ liệu thấp hơn so với trực tiếp AWS-to-internet. $0.085/GB cho 10TB đầu tiên (ít hơn một chút so với chuyển dữ liệu ra trực tiếp). CloudFront thường giảm tổng chi phí chuyển vì cache edge của nó có nghĩa là origin phục vụ dữ liệu ít thường xuyên hơn.

**Phân Tích Của Tom**

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi, cho từng mục hóa đơn lần lượt. Anh thêm chúng vào một tab riêng trong bảng tính — không phải tổng hằng tháng, mà từng danh mục được tách ra. Tổng ít hữu ích hơn việc hiểu phần nào của hóa đơn là loại chi phí nào.

Sau khi phân loại từng mục hóa đơn:

**Dữ liệu outbound đến internet**: $214/tháng

- Phản hồi API đến khách hàng toàn cầu
- Các asset vẫn được phục vụ thẳng từ S3 và ALB đến client, bỏ qua CloudFront (bản thân cache fill — CloudFront fetch từ một origin AWS — là miễn phí: AWS miễn phí chuyển origin-to-CloudFront)

**Xử lý NAT Gateway**: $289/tháng

- Máy chủ ứng dụng gọi API bên ngoài (bộ xử lý thanh toán, dịch vụ email, dữ liệu bản đồ)
- Các cuộc gọi DynamoDB đi qua NAT Gateway (trước khi VPC endpoints được thiết lập cho một số bảng)

**Chuyển dữ liệu Cross-AZ**: $178/tháng

- Bộ cân bằng tải đến instance EC2 (bộ cân bằng tải ở một AZ, một số instance ở AZ khác)
- Máy chủ ứng dụng đến RDS read replica (ở AZ khác)

**Chuyển dữ liệu Cross-Region**: $166/tháng

- Sao chép Aurora Global Database (primary ở us-west-2, reader ở us-east-1)
- S3 Cross-Region Replication để backup
- Pipeline kiểm thử bị quên của Leo ($6/tháng của tổng này)

**NAT Gateway: Điều Ngạc Nhiên Lớn Nhất**

$289/tháng trong phí xử lý NAT Gateway là mục lớn nhất. Và phân tích VPC Flow Log đã làm cho nó cụ thể: bên tiêu thụ hàng đầu là các máy chủ ứng dụng gọi các API dịch vụ AWS (SSM, Secrets Manager, CloudWatch Logs) qua NAT Gateway.

Trong Chương 11, Tom đã thiết lập VPC Gateway Endpoints cho S3 và DynamoDB. Những cái này miễn phí. Nhưng anh đã bỏ lỡ việc thiết lập Interface Endpoints cho một số dịch vụ khác:

- Systems Manager (SSM) để quản lý patch
- Secrets Manager để lấy thông tin xác thực
- CloudWatch để gửi chỉ số và nhật ký
- SQS để polling tin nhắn

Mỗi cuộc gọi đến các dịch vụ này từ các instance EC2 riêng tư đang đi qua NAT Gateway. Mỗi cuộc gọi tính phí $0.045/GB.

Bạn có thể đang tự hỏi tại sao AWS tính phí cho lưu lượng đi qua NAT Gateway khi bạn đã ở bên trong mạng của AWS. Câu trả lời là bản thân NAT Gateway là một dịch vụ được quản lý — nó tốn tiền để chạy, và AWS chuyển chi phí đó qua theo từng gigabyte. VPC Endpoints loại bỏ người trung gian, đó là lý do tại sao chúng giảm hóa đơn.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi, khi Tom cho thấy các con số. "Chúng ta đã thiết lập Gateway Endpoints cho S3 và DynamoDB. Tại sao chúng ta không làm tương tự cho SSM và CloudWatch?"

"Gateway Endpoints chỉ khả dụng cho S3 và DynamoDB," Tom nói. "Với mọi thứ khác — SSM, Secrets Manager, SQS — bạn cần Interface Endpoints. Chúng không miễn phí, nhưng rẻ hơn việc định tuyến qua NAT ở khối lượng chúng ta đang tạo ra."

**Interface Endpoints** cho các dịch vụ này: $0.01/giờ mỗi AZ + $0.01/GB dữ liệu được xử lý.

Ở khối lượng của Nimbus, SSM Interface Endpoint sẽ tốn khoảng $25/tháng (phí theo giờ cộng xử lý theo GB) và tiết kiệm khoảng $45/tháng trong phí NAT Gateway (vì SSM tạo ra khối lượng dữ liệu đáng kể cho quản lý patch và các cuộc gọi parameter store).

Chi phí và tiết kiệm endpoint biến đổi theo dịch vụ và khối lượng. Tom tính toán rằng việc thiết lập Interface Endpoints cho bốn dịch vụ lưu lượng cao — hai AZ mỗi cái, cộng với xử lý $0.01/GB trên 3.9TB mà chúng sẽ chuyển — sẽ tốn khoảng $97/tháng tổng cộng và tiết kiệm khoảng $176/tháng trong xử lý NAT Gateway.

Tiết kiệm ròng: $78/tháng chỉ từ thiết lập endpoint.

"Và nếu ai đó cố đột nhập?" Priya nói, khi cuộc trò chuyện về VPC endpoint chuyển sang triển khai. "VPC endpoint có nghĩa là lưu lượng không bao giờ chạm vào internet công cộng — đó không chỉ là chi phí, mà là giảm bề mặt đe dọa. Chúng ta nên làm điều này chỉ vì lợi ích bảo mật."

"Đồng ý," Tom nói. "Tiết kiệm chi phí là phần thưởng."

Leo nhìn vào danh sách các dịch vụ đã đang định tuyến qua NAT. "Tôi có thể đã thiết lập các endpoint logging CloudWatch mà không kiểm tra liệu có VPC endpoint cho nó không," anh nói. "Bây giờ thì ổn — nhưng đúng, cái đó đã đi qua NAT trong sáu tháng."

"Cái đó nằm trong danh sách," Tom nói. "CloudWatch là một trong bốn cái chúng ta đang sửa."

**Phép Tính PrivateLink: Khi Nào Nó Hợp Lý**

Có một phiên bản phức tạp hơn của cuộc trò chuyện này xuất hiện khi các kiến trúc phát triển: sử dụng AWS PrivateLink để cung cấp kết nối riêng tư đến các dịch vụ được lưu trữ bởi các khách hàng AWS khác (hoặc các dịch vụ của riêng bạn trong các VPC khác).

PrivateLink Interface Endpoints tốn $0.01/giờ mỗi AZ cộng $0.01/GB. Đối với một dịch vụ tạo ra 1TB/tháng lưu lượng qua endpoint:

- Chi phí PrivateLink: $0.01 × 2 AZ × 730 giờ + $0.01 × 1,000GB = $14.60 + $10 = $24.60/tháng
- Định tuyến cùng lưu lượng đó qua NAT Gateway hiện có thay vào đó: $0.045 × 1,000GB = $45/tháng phí xử lý gia tăng

So sánh là *gia tăng*, vì NAT Gateway vẫn còn dù sao đi nữa — nó vẫn phục vụ phần còn lại của lưu lượng hướng tới internet, nên chi phí theo giờ của nó ($0.045 × 2 × 730 = $65.70) không biến mất khi dịch vụ này chuyển sang một endpoint. Đối với khối lượng lưu lượng này, PrivateLink tiết kiệm khoảng $20/tháng. Điểm hòa vốn là khoảng 420GB/tháng — dưới mức đó, chi phí theo giờ của riêng endpoint vượt quá khoản tiết kiệm theo GB so với xử lý NAT.

"Khoan — nhưng *tại sao* chúng ta lại dùng PrivateLink thay vì chỉ một VPN hoặc peering?" Maya hỏi.

"VPC Peering đơn giản hơn và miễn phí cho các lần chuyển trong region," Tom nói. "Nhưng peering tạo ra một kết nối được định tuyến đầy đủ giữa các VPC — bất cứ thứ gì trong VPC A đều có thể tiếp cận bất cứ thứ gì trong VPC B. PrivateLink phẫu thuật hơn. Endpoint phơi bày một dịch vụ cụ thể, không phải một route mạng đầy đủ. Đối với các kiến trúc chú trọng bảo mật, sự cụ thể đó quan trọng."

"Và nếu ai đó cố đột nhập vào một VPC được peer?" Priya hỏi. "Peering đầy đủ có nghĩa là một instance bị xâm phạm trong một VPC có một route đến mọi instance trong VPC được peer."

"Đó là lập luận cho PrivateLink hơn peering khi bạn kết nối với một dịch vụ bên thứ ba hoặc một dịch vụ thuộc sở hữu của một nhóm riêng," Tom nói. "Peering cho các VPC nội bộ công ty đáng tin cậy. PrivateLink cho bất cứ thứ gì bạn muốn kết nối phơi bày tối thiểu."

**Lưu Lượng Cross-AZ: Câu Hỏi Kiến Trúc**

$178/tháng trong chuyển dữ liệu cross-AZ khó xử lý hơn.

Một phần là không thể tránh khỏi: bộ cân bằng tải phân phối lưu lượng trên các AZ, vì vậy một số yêu cầu bắt nguồn từ một AZ và bộ cân bằng tải chuyển tiếp chúng đến instance ở AZ khác.

Một phần có thể tối ưu hóa: ứng dụng được cấu hình để ghi vào RDS primary (ở us-west-2a) và đọc từ read replica (ở us-west-2b). Mỗi truy vấn đọc vượt qua ranh giới AZ.

Đối với lượng đọc, một giải pháp: cấu hình ứng dụng để ưu tiên read replica trong cùng AZ với instance yêu cầu. Mỗi AZ nhận read replica riêng. Lưu lượng giữ nguyên trong nội bộ.

Đánh đổi: nhiều read replica hơn = chi phí nhiều hơn. Nếu chi phí lưu lượng cross-AZ là $50/tháng và một read replica bổ sung tốn $190/tháng, tối ưu hóa AZ-local không có lợi.

Tom tính toán: ở khối lượng truy vấn hiện tại của họ, lưu lượng cross-AZ chỉ là $31/tháng trong tổng $178. Không đáng thêm replica vì điều này.

Các chi phí cross-AZ khác là định tuyến bộ cân bằng tải và giao tiếp service-to-service — phần lớn không thể tránh ở cấp độ kiến trúc hiện tại.

"Đây là một trong những trường hợp mà hiểu chi phí không có nghĩa là bạn nên sửa nó," Tom nói.

"Chi phí để loại bỏ hoàn toàn lưu lượng cross-AZ là bao nhiêu?" Maya hỏi.

"Tất cả trong một AZ đánh bại mục đích của Multi-AZ. Đó là tiết kiệm $31/tháng với cái giá mất tính khả dụng cao."

"Vậy chúng ta để nguyên," cô nói.

"Chúng ta để nguyên."

**S3 Select: Giảm Chuyển Dữ Liệu Trong Truy Vấn**

Trong khi xem xét pipeline analytics, Tom tìm thấy một tối ưu hóa khác cụ thể với cách nhóm analytics đang truy vấn các tệp S3 lớn.

Mẫu hình: mỗi sáng, một công việc analytics tải xuống một tệp Parquet 500MB từ S3 để lọc nó trong bộ nhớ cho dữ liệu đơn hàng cụ thể của nhà hàng. Khoảng 95% tệp bị loại bỏ sau khi tải xuống.

**S3 Select** cho phép bạn chỉ lấy các hàng và cột bạn cần từ một S3 object (CSV, JSON, Parquet), thay vì tải toàn bộ tệp để lọc nó trong ứng dụng của bạn.

> **Cập nhật quan trọng**: vào giữa năm 2024, AWS ngừng cung cấp S3 Select cho khách hàng mới — người dùng hiện có vẫn giữ nó, nhưng nó là ngõ cụt cho các kiến trúc mới. Nguyên tắc mà phần này dạy (lọc tại tầng lưu trữ, đừng vận chuyển toàn bộ tệp) là vượt thời gian; công cụ hiện đại cho nó là **Amazon Athena** (SQL trực tiếp trên S3, bao gồm các phép nối và tổng hợp mà S3 Select chưa bao giờ có). **S3 Object Lambda**, từng là lựa chọn thay thế kia, đã theo S3 Select vào tình trạng legacy: tính đến ngày 7 tháng 11 năm 2025 nó cũng đóng cửa với khách hàng mới (các khối lượng công việc hiện có vẫn tiếp tục chạy). Trong một kỳ thi hiện tại, "truy vấn dữ liệu tại chỗ trên S3" trỏ đến Athena. Câu chuyện dưới đây được giữ lại vì *lý luận* — đo lường trước, di chuyển bộ lọc đến dữ liệu — là bài học.

Không có S3 Select:
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Với S3 Select:
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select giảm dữ liệu được di chuyển từ S3 vào ứng dụng của bạn. Đối với các tệp lớn với các truy vấn chọn lọc, điều này có thể giảm khối lượng dữ liệu 10-100 lần — và, vì instance analytics chạy trong cùng region với bucket, lợi ích không phải là hóa đơn chuyển (chuyển S3-to-EC2 cùng region miễn phí): đó là tính toán, bộ nhớ, và thời gian dành cho việc tải xuống và lọc dữ liệu mà bạn ngay lập tức vứt bỏ.

Tom nêu vấn đề với nhóm analytics. Họ phản đối lúc đầu.

"Chúng tôi đã biết cách viết pandas rồi," một nhà phân tích nói.

"Điều này không phải về pandas," Tom nói. "Đó là về việc bạn đang tải xuống 500MB để lấy 2MB dữ liệu. Bản thân việc tải xuống miễn phí — cùng region — nhưng instance thì không. Bạn chạy cái này cho mỗi nhà hàng: 287 nhà hàng, 287 truy vấn, 140GB được kéo và lọc trong pandas mỗi đêm. Đó là thứ giữ cho hộp analytics bận rộn trong hai giờ — và đó là lý do tại sao nó là một xlarge."

"Còn S3 Select?"

"S3 Select tính phí $0.002 mỗi GB được quét và $0.0007 mỗi GB được trả về — khoảng một phần mười xu mỗi truy vấn. Đổi lại, instance nhận 600MB một đêm thay vì 140GB, công việc hoàn thành trong vài phút, và hộp có thể giảm một cỡ."

"Đó là $450 một tháng," nhà phân tích nói, sau khi làm phép tính instance — một ước tính sơ bộ từ mức giá theo giờ của instance và số giờ nó dành để xay nghiền.

"Đó là lý do tôi ở đây," Tom nói. Con số thực sẽ hóa ra thấp hơn — khi Tom sau đó kéo chi phí tính toán thực tế quy cho công việc nightly, nó ra $202/tháng, không phải $450. Phép tính nháp tìm ra vấn đề; đo lường định cỡ nó.

Tom nêu vấn đề với Leo trước, trước khi đưa nhóm analytics vào cuộc trò chuyện. Anh biết Leo sẽ phản đối, và anh muốn hiểu sự phản đối trước khi nó trở thành một cuộc tranh luận cấp phòng.

"S3 Select sẽ tiết kiệm $180/tháng trên các truy vấn pipeline analytics," Tom nói.

"Cái đó đòi hỏi viết lại mọi truy vấn," Leo nói.

"Nó đòi hỏi thay đổi mẫu truy cập dữ liệu từ 'tải xuống và lọc' sang 'truy vấn qua API S3 Select.'"

"Đó là một lần viết lại."

"Đó là một thay đổi trong các cuộc gọi thư viện client," Tom nói. "Logic truy vấn — các biểu thức lọc — vẫn giữ nguyên. Cái thay đổi là nơi việc lọc xảy ra. Hiện tại: EC2. Với S3 Select: S3."

"Tôi đã đọc tài liệu S3 Select," Leo nói. "Bạn không thể làm phép nối. Bạn không thể làm các phép tổng hợp phức tạp hơn SUM và COUNT cơ bản. Một số truy vấn analytics của chúng ta tinh vi hơn thế."

"Tôi biết," Tom nói. "Đó là lý do tôi không đề xuất S3 Select cho tất cả các truy vấn. Tôi đề xuất nó cho các truy vấn tóm tắt hằng ngày cụ thể của nhà hàng. Đó là tệp Parquet 500MB được lọc theo restaurant_id, kéo hai cột. Truy vấn đó là một bộ lọc-và-chiếu thuần túy. S3 Select chính xác là công cụ đúng cho trường hợp đó."

Leo im lặng một lúc. Anh mở truy vấn được đề cập.

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"Phiên bản S3 Select sẽ là gì — cuộc gọi select_object_content?"

"Đúng," Tom nói. "Bạn sẽ thay cuộc gọi read_parquet bằng một cuộc gọi select_object_content đẩy mệnh đề WHERE đến S3. Kết quả trả về đã được lọc sẵn. Bạn nhận một luồng các bản ghi khớp thay vì toàn bộ tệp Parquet."

"Và tôi sẽ phải xử lý phản hồi khác đi."

"Định dạng phản hồi là CSV theo mặc định. Bạn sẽ cần một wrapper nhỏ để phân tích nó trở lại thành một DataFrame, hoặc bạn dùng định dạng đầu ra Parquet nếu bạn muốn giữ logic phân tích hiện tại."

Leo nhìn nó. "Đó là bao nhiêu công việc?"

"Nửa ngày," Tom nói. "Có thể một ngày nếu bạn muốn kiểm thử nó kỹ lưỡng trên tất cả 287 ID nhà hàng trong đợt batch nightly."

"Cho $180/tháng."

"$2,160 mỗi năm," Tom nói. "Và cách tiếp cận mở rộng được. Ở 2,000 nhà hàng, cùng truy vấn trên cùng kích thước tệp tốn còn nhiều hơn nếu không có S3 Select. Bạn đang đầu tư một ngày hôm nay để tránh một vấn đề lớn hơn nhiều sau này."

Leo đóng notebook. "Các truy vấn mà S3 Select không hoạt động — các truy vấn tổng hợp, các so sánh giữa các nhà hàng — những cái đó giữ nguyên?"

"Những cái đó giữ nguyên," Tom xác nhận. "Tôi không cố viết lại pipeline analytics. Tôi đang cố ngừng tải xuống 500 MB để dùng 2 MB của nó."

"Được," Leo nói. "Tôi sẽ làm nó tuần này."

Anh đã làm. Việc triển khai mất sáu giờ. Anh bọc cuộc gọi S3 Select trong một hàm tiện ích khớp với cùng giao diện như cuộc gọi read_parquet hiện có — mã gọi trong đợt batch nightly không cần thay đổi gì cả. Chỉ tầng truy cập dữ liệu thay đổi.

Tháng tiếp theo, hóa đơn tính toán nightly của pipeline analytics giảm từ $202 xuống $22 — công việc hoàn thành trong vài phút thay vì vài giờ, trên một instance nhỏ hơn. Khoản tiết kiệm $180/tháng đã tốn sáu giờ thời gian kỹ thuật. Tính theo năm, đó là lợi nhuận 1,800% trên khoản đầu tư thời gian.

"Phần tôi đã phản đối," Leo nói, trong đợt xem xét hằng tháng, "là việc viết lại. Hóa ra nó là một sự thay thế hàm, không phải một lần viết lại. Tôi đã giải quyết một vấn đề tưởng tượng."

"Điều đó đáng ghi nhận," Tom nói. "Khi bạn đang đánh giá liệu có triển khai một tối ưu hóa không, hãy cụ thể về công việc thực sự là gì. 'Đòi hỏi viết lại các truy vấn' là phiên bản tưởng tượng. 'Đòi hỏi thay đổi hàm truy cập dữ liệu' là phiên bản thực."


**"Chi Phí Có Chủ Ý vs Ngoài Ý Muốn"**

Vào cuối ba tuần phân tích mạng, Tom mang bảng phân tích đầy đủ trở lại cho nhóm. Anh có một cột mới trong bảng tính: "Có chủ ý?" với một câu có hoặc không cho mỗi mục hóa đơn.

"Đó là khung tôi đang dùng bây giờ," anh nói. "Không chỉ 'nó tốn bao nhiêu' mà 'chúng ta đã quyết định chi cái này chưa?'"

"Một chi phí có chủ ý là gì?" Maya hỏi.

"Sao chép Aurora Global Database. Chúng ta quyết định sao chép sang us-east-1 vì chúng ta có các đối tác nhà hàng ở Bờ Đông. Đó là $120/tháng trong sao chép cross-region — khoảng gấp đôi ước tính sơ bộ từ những ngày lập kế hoạch DR. Chúng ta chọn chi phí đó vì một lý do cụ thể."

"Và ngoài ý muốn?"

"Pipeline analytics của Leo ghi vào us-east-1 trong năm tháng sau khi một bài kiểm thử kết thúc. Không ai chọn cái đó. Nó đang xảy ra vì không ai theo dõi."

"Và phí NAT Gateway cho các cuộc gọi dịch vụ AWS?"

"Ở đâu đó ở giữa," Tom nói. "Chúng ta không quyết định rõ ràng định tuyến SSM qua NAT Gateway — đó là mặc định. Chúng ta không biết có một lựa chọn rẻ hơn. Đó có phải là có chủ ý không? Chúng ta đã đưa ra một lựa chọn, chúng ta chỉ không biết mình đang chọn gì."

"Đó là danh mục nguy hiểm nhất," Priya nói. "Các quyết định bạn không biết mình đang đưa ra."

"Đó là lý do tại sao phân tích VPC Flow Logs quan trọng," Tom nói. "Nó làm cho cái vô hình trở nên hữu hình. Mỗi byte vượt qua một ranh giới giờ có một câu chuyện chúng ta có thể truy vết."

"Chúng ta đã nghĩ về điều gì xảy ra nếu chúng ta để cái này trôi dạt lần nữa chưa?" Priya hỏi. "Chúng ta đã làm một phân tích một lần. Trong sáu tháng, Leo sẽ tạo một bucket kiểm thử khác ở đâu đó."

"Tôi sẽ ngay ở đây," Leo nói. "Lần tới tôi sẽ làm nó ở eu-west-1 để ít nhất nó tốn nhiều hơn mỗi GB và mọi người để ý nhanh hơn."

"Xem xét VPC Flow Log hằng tháng," Tom nói. "Tôi sẽ thêm nó vào đợt xem xét chi phí hằng quý. Nếu chúng ta thấy một luồng cross-region mới hoặc một đột biến NAT Gateway, chúng ta truy vết nó trước hóa đơn tiếp theo."

**Biến Thể: Sự Đánh Đổi Bạn Chấp Nhận**

Nếu bạn loại bỏ lưu lượng cross-AZ bằng cách chạy mọi thứ trong một Availability Zone duy nhất, bạn tiết kiệm khoảng $31/tháng ở khối lượng hiện tại của Nimbus — nhưng bạn mất tính dự phòng Multi-AZ đáng giá hơn thế nhiều về rủi ro sự cố. Cuộc trò chuyện chi phí trưởng thành không phải lúc nào cũng về việc tìm kiếm tiết kiệm; đôi khi nó là về việc hiểu chính xác bạn đang trả cho cái gì và quyết định rằng nó đáng giá.

Phí cross-AZ là cái giá của khả năng phục hồi. Một số chi phí mạng là các cam kết kiến trúc, không phải sự kém hiệu quả.

Kết nối SAA-C03: kỳ thi thường xuyên trình bày các kịch bản nơi một "tối ưu hóa chi phí" sẽ loại bỏ một tính dự phòng. Câu trả lời đúng thường là bảo toàn tính dự phòng và tối ưu hóa ở nơi khác — biết sự khác biệt giữa lãng phí và chi phí của độ tin cậy.

**CloudFront: Giảm Giá Chuyển Dữ Liệu**

Đây là một thực tế phản trực giác: phục vụ dữ liệu qua CloudFront nói chung rẻ hơn phục vụ trực tiếp từ EC2 hoặc S3.

**EC2 trực tiếp đến internet**: $0.09/GB
**CloudFront đến internet**: $0.085/GB (rẻ hơn một chút)

Nhưng tiết kiệm thực sự không phải ở tỷ lệ mỗi GB — mà ở chỗ CloudFront cache dữ liệu tại các edge location. Nếu 1,000 người dùng yêu cầu cùng một ảnh menu:

- **Không có CloudFront**: 1,000 yêu cầu rời S3 trực tiếp đến internet × kích thước ảnh × $0.09/GB
- **Với CloudFront**: client lấy ảnh từ edge ở tỷ lệ CloudFront ($0.085/GB), và cache fill — CloudFront fetch từ S3 ở 1 lần miss — là **miễn phí** (AWS miễn phí chuyển origin-to-CloudFront; bạn chỉ trả các yêu cầu GET origin)

Đối với Nimbus với tỷ lệ cache hit 83% (từ Chương 13), 83% yêu cầu không bao giờ chạm vào origin — ít yêu cầu origin hơn, tải origin ít hơn, và mỗi byte được tính ở tỷ lệ edge thay vì tỷ lệ internet của S3.

"CloudFront không chỉ là CDN cho hiệu suất," Tom nói. "Nó cũng là tối ưu hóa chi phí cho chuyển dữ liệu."

Leo có vẻ suy nghĩ. "Chúng ta nên chuyển tất cả phân phối nội dung tĩnh qua CloudFront, ngay cả cho các asset không nhạy cảm về độ trễ."

"Đúng vậy. Nếu người dùng đang tải nó từ AWS, nó nên đi qua CloudFront."

**Tối Ưu Hóa Mạng Đầy Đủ**

Sau ba tuần phân tích và triển khai:

| Mục Chi Phí                                | Trước    | Sau      | Tiết Kiệm Hằng Tháng |
|--------------------------------------------|----------|----------|----------------------|
| NAT Gateway (Interface Endpoints)          | $289     | $211     | $78            |
| Tối ưu hóa CloudFront (chuyển thêm asset)  | $214     | $147     | $67            |
| Lưu lượng Cross-AZ (chấp nhận như cũ)      | $178     | $178     | $0             |
| Lưu lượng Cross-region (bucket kiểm thử của Leo) | $166     | $160     | $6             |
| **Tổng**                                   | **$847** | **$696** | **$151/tháng** |

$151/tháng, $1,812/năm tiết kiệm mạng. Khiêm tốn so với tính toán và lưu trữ, nhưng có ý nghĩa.

Quan trọng hơn: Tom bây giờ hiểu mọi dòng của hóa đơn mạng. Anh có thể giải thích từng chi phí và đã có ý thức quyết định cái nào sẽ tối ưu hóa và cái nào chấp nhận. Sự phân biệt giữa chi phí có chủ ý và ngoài ý muốn giờ đã rõ ràng và được ghi chép.

## Điểm Mạnh và Hạn Chế

**Chi phí NAT Gateway**:

- Khối lượng dữ liệu lớn qua NAT Gateway tích lũy nhanh
- VPC Endpoints loại bỏ hoàn toàn một số chi phí NAT
- Xem xét dịch vụ nào instance riêng tư của bạn gọi và liệu endpoints có sẵn không

**CloudFront để tiết kiệm chi phí**:

- Tỷ lệ cache hit trực tiếp xác định tiết kiệm chi phí
- Tỷ lệ cache hit cao = ít yêu cầu origin hơn và tải origin ít hơn, cộng với nhiều byte hơn được tính ở tỷ lệ phía người xem rẻ hơn của CloudFront (chuyển origin-to-CloudFront từ các origin AWS hoàn toàn không bị tính phí)
- Chuyển tất cả phân phối asset tĩnh qua CloudFront

**Đánh đổi Cross-AZ**:

- Loại bỏ lưu lượng cross-AZ thường đòi hỏi thay đổi kiến trúc tốn nhiều hơn tiết kiệm
- Tính toán cẩn thận trước khi tối ưu hóa

**S3 Select** (legacy — không khả dụng cho khách hàng mới từ 2024; dùng Athena thay thế. S3 Object Lambda cũng là legacy bây giờ — đóng cửa với khách hàng mới tính đến tháng 11 năm 2025, các khối lượng công việc hiện có không bị ảnh hưởng):

- Nguyên tắc vẫn đứng vững: lọc tại tầng lưu trữ thay vì tải xuống các S3 object lớn — khoản tiết kiệm hiện ra trong thời gian tính toán, kích thước instance, và thời lượng công việc (chuyển S3 cùng region đã miễn phí)
- Không giúp ích khi bạn cần toàn bộ tệp

## Tóm Tắt

Tom đóng phân tích mạng với một con số trên bảng trắng và một sự hiểu biết rõ ràng hơn về ẩn số cuối cùng trên hóa đơn thực sự là gì. $847/tháng trong chi phí mạng không phải là một bí ẩn của sự thiếu năng lực — đó là chi phí dự kiến của một hệ thống phân tán trải dài các availability zone, phục vụ người dùng toàn cầu, và sao chép dữ liệu trên các region. Hầu hết nó đáng trả. Một số thì không. Tiến bộ then chốt là có thể nói cái nào là cái nào.

- AWS tính phí cho **dữ liệu outbound** (internet: ~$0.09/GB), **lưu lượng cross-AZ** ($0.01/GB mỗi chiều), **lưu lượng cross-region** ($0.02-0.08/GB), và **xử lý NAT Gateway** ($0.045/GB).
- **Dữ liệu inbound** miễn phí. **Lưu lượng cùng AZ** miễn phí.
- **VPC Flow Logs** tiết lộ các luồng lưu lượng cụ thể nào bên trong VPC của bạn đang tạo ra mỗi danh mục chi phí — thiết yếu cho tối ưu hóa có mục tiêu. Các luồng không bao giờ vượt qua một network interface VPC (như CloudFront fetch từ một origin S3) cần các công cụ riêng của chúng: log tiêu chuẩn CloudFront hoặc log truy cập máy chủ S3.
- **VPC Gateway Endpoints** (S3, DynamoDB): Miễn phí. Loại bỏ chi phí NAT Gateway cho các dịch vụ này.
- **VPC Interface Endpoints**: Tính phí theo giờ cộng mỗi GB. Rẻ hơn NAT Gateway cho các dịch vụ lưu lượng cao.
- **CloudFront** phục vụ dữ liệu ở tỷ lệ thấp hơn so với EC2-to-internet trực tiếp và giảm đáng kể khối lượng chuyển origin thông qua caching.
- Câu hỏi then chốt không chỉ là "bao nhiêu" mà "chi phí này có chủ ý không?" Các chi phí ngoài ý muốn — các pipeline kiểm thử bị quên, định tuyến mặc định qua NAT — là nơi khoản tiết kiệm thực sự ẩn nấp.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Domain 4, Task 4.4)*

- **NAT Gateway vs VPC Endpoints**: Kịch bản kỳ thi: "EC2 trong private subnet thường xuyên gọi S3/DynamoDB — cách giảm chi phí NAT Gateway?" → VPC Gateway Endpoints (miễn phí cho S3 và DynamoDB).
- **Quy tắc giá chuyển dữ liệu**:
  - Vào AWS: miễn phí
  - Cùng AZ: miễn phí
  - Cross-AZ: tính phí
  - Cross-region: tính phí (tỷ lệ cao hơn)
  - Internet: tính phí (tỷ lệ đáng kể)
- **CloudFront để tối ưu chi phí**: "Giảm chi phí chuyển dữ liệu cho phân phối nội dung toàn cầu" → CloudFront. Lớp cache giảm yêu cầu origin.
- **S3 Transfer Acceleration**: Tăng tốc tải lên *đến* S3 sử dụng các edge location CloudFront. Chi phí cao hơn S3 tiêu chuẩn. Dùng cho khách hàng tải lên các tệp lớn từ vị trí địa lý xa.
- **Chi phí sao chép cross-region**: Sao chép dữ liệu trên các region phát sinh phí chuyển dữ liệu. Đối với S3 CRR, bạn trả cả tỷ lệ chuyển dữ liệu ra lẫn chi phí yêu cầu S3.
- **PrivateLink (VPC Interface Endpoints)**: Cung cấp kết nối riêng tư đến các dịch vụ AWS và các dịch vụ được lưu trữ bởi các khách hàng AWS khác. Bảo mật hơn qua NAT, thường rẻ hơn cho các dịch vụ lưu lượng cao. Điểm hòa vốn so với xử lý NAT Gateway là khoảng 420GB/tháng (tính cả chi phí theo giờ mỗi AZ của riêng endpoint, và giả định NAT Gateway vẫn còn cho lưu lượng khác).

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích sự khác biệt giữa VPC Gateway Endpoint và VPC Interface Endpoint. Mỗi cái khả dụng cho những dịch vụ AWS nào, và chi phí của mỗi cái là bao nhiêu?

*(Gợi ý: Gateway Endpoints miễn phí nhưng chỉ cho S3 và DynamoDB. Interface Endpoints tính phí theo giờ nhưng hoạt động cho hầu hết các dịch vụ AWS khác.)*

**Bài Tập 2 — Kịch Bản SAA-C03**

*Kịch bản*: Ứng dụng của một công ty chạy trên các instance EC2 trong private subnets. Các instance thực hiện các cuộc gọi API thường xuyên đến Amazon SQS và Amazon S3. Hiện tại, tất cả lưu lượng thoát qua NAT Gateway. Nhóm muốn giảm chi phí NAT Gateway. Bảo mật dữ liệu phải được duy trì — không có lưu lượng nào nên đi qua internet công cộng.

Cách tiếp cận nào đáp ứng TỐT NHẤT các yêu cầu này với chi phí liên tục tối thiểu?

A) Tạo Gateway Endpoint cho SQS và Gateway Endpoint cho S3  
B) Tạo Interface Endpoints cho cả SQS và S3  
C) Tạo Interface Endpoint cho SQS và Gateway Endpoint cho S3  
D) Loại bỏ NAT Gateway và sử dụng internet gateway trực tiếp cho các cuộc gọi API

**Gợi ý 1**: Gateway Endpoints chỉ khả dụng cho S3 và DynamoDB.

**Gợi ý 2**: Interface Endpoints khả dụng cho SQS và nhiều dịch vụ khác (nhưng tốn tiền).

**Gợi ý 3**: Internet Gateway trong bảng định tuyến private subnet sẽ biến nó thành public subnet — vi phạm yêu cầu bảo mật.

**Đáp án**: C

**Giải thích**: S3 sử dụng Gateway Endpoint (miễn phí). SQS yêu cầu Interface Endpoint (có tính phí). Sự kết hợp này loại bỏ chi phí xử lý dữ liệu NAT Gateway cho cả hai dịch vụ. Tất cả lưu lượng giữ nguyên trong mạng riêng tư của AWS — không có đường đi qua internet công cộng.

**Tại sao không phải A?** Gateway Endpoints không khả dụng cho SQS. Chỉ S3 và DynamoDB có Gateway Endpoints.

**Tại sao không phải B?** Mặc dù điều này hoạt động, sử dụng Interface Endpoint cho S3 (thay vì Gateway Endpoint miễn phí) phát sinh phí theo giờ không cần thiết. Luôn sử dụng Gateway Endpoint miễn phí cho S3 và DynamoDB.

**Tại sao không phải D?** Thêm route đến Internet Gateway từ private subnet biến nó thành public subnet. Các instance EC2 trong private subnet thường không có Elastic IP, vì vậy chúng thực sự không thể định tuyến qua Internet Gateway mà không có thay đổi bổ sung — và làm vậy sẽ để lộ chúng với lưu lượng internet inbound.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Task 4.4*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Người dùng Bờ Đông của Nimbus tạo ra lưu lượng đáng kể. Ứng dụng phục vụ họ từ us-west-2 (Oregon). Hiện tại:

- Phản hồi API đi trực tiếp từ các instance EC2 us-west-2 đến người dùng Bờ Đông (~80ms, $0.09/GB)
- Ảnh menu đi từ S3 us-west-2 qua CloudFront edge ở Boston (~8ms sau khi cache)

Nhóm đang xem xét thêm một region ứng dụng thứ hai ở us-east-1 (Bắc Virginia) cho người dùng Bờ Đông để giảm độ trễ API.

Phân tích chi phí chuyển dữ liệu của sự thay đổi này. Chi phí chuyển dữ liệu cross-region mới nào mà thiết lập dual-region sẽ phát sinh? Liệu định tuyến dựa trên độ trễ Route 53 có giảm hay tăng tổng chi phí chuyển? Trong điều kiện nào (khối lượng lưu lượng, độ nhạy cảm độ trễ) thiết lập dual-region sẽ có hiệu quả?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành phân tích chi phí-lợi ích đa vùng.)*

## Cảnh Sau Tín Dụng

Tom đóng phân tích mạng lại.

Tổng tác động dự án tối ưu hóa ba tháng:

- EC2 Savings Plans: -$14,200/năm
- Các chính sách lifecycle S3: -$7,800/năm
- Lưu trữ (S3 + EBS): -$6,200/năm
- Tầng cơ sở dữ liệu: -$5,892/năm
- Mạng: -$1,812/năm
- **Tổng: -$35,904/năm**

Anh viết nó lên bảng trắng trong phòng họp.

Leo nhìn chằm chằm vào nó. "Ba mươi lăm nghìn."

"Và lẻ," Tom nói.

"Mỗi năm."

"Mỗi năm."

Priya tính toán. "Đó là $2,992 mỗi tháng chúng ta đang chi cho những thứ không tạo ra giá trị."

"Không phải tất cả," Tom sửa lại. "Một số là những thứ chúng ta đang nhận được giá trị từ, nhưng trả quá nhiều. Savings Plans — chúng ta đang nhận được chính xác cùng năng lực EC2, chỉ ở giá tốt hơn."

Maya đứng trước bảng trắng trong một thời gian dài.

"Khi chúng ta bắt đầu Nimbus," cô nói, "mỗi đô la đều quan trọng. Chúng ta hầu như không đủ tiền cho instance EC2 đầu tiên."

"Đúng vậy," Tom nói.

"Và ở đâu đó trên đường đi, chúng ta ngừng theo dõi đô la một cách cẩn thận."

"Tăng trưởng làm điều đó," Priya nói. "Trọng tâm chuyển sang xây dựng, không phải tối ưu hóa."

"Cả hai đều quan trọng," Maya nói. "Cả hai, luôn luôn. Thêm điều này vào wiki. Và đặt một đợt xem xét hằng quý về chi phí."

Tom đã mở lịch của mình.

Trong vài chương tiếp theo: chúng ta thu phóng ra khỏi các dịch vụ riêng lẻ và bắt đầu suy nghĩ như kiến trúc sư.
