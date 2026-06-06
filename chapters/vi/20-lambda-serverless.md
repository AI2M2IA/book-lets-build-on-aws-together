# Chương 20: Mô Hình Freelancer

Đó là một chiều thứ Tư yên ả. Priya tháo tai nghe ra một lần hiếm hoi, và văn phòng có loại tiếng rì rầm khe khẽ nghĩa là mọi người đang tập trung nhưng không ai hoảng loạn. Leo có một cost dashboard mở trên một màn hình và danh sách EC2 instance trên màn hình kia.

Hãy nghĩ về một freelancer làm việc theo kiểu trực. Họ không ngồi ở bàn từ chín giờ đến năm giờ. Họ chờ. Điện thoại reo, họ làm việc, họ gửi hóa đơn, họ quay lại chờ. Không có việc, không có chi phí. Một đợt bùng nổ các yêu cầu, họ xử lý tất cả đồng thời. Bạn chỉ trả cho những giờ thực sự làm việc — không phải những giờ họ ngồi sẵn sàng.

Đó là mô hình mà chương này nói về.

Có một sự tinh tế ở đây đáng giữ lại. Mô hình truyền thống là: thuê một nhân viên, trả cho 8 giờ, nhận đầu ra biến thiên. Mô hình freelancer là: chỉ trả khi điện thoại reo, nhận đúng những gì được yêu cầu. Đối với một công ty có nhu cầu dự đoán được, ổn định, mô hình nhân viên hiệu quả hơn — bạn biết điện thoại sẽ reo liên tục, nên trả theo giờ là tương đương và không có chi phí phụ trội của việc bắt đầu và kết thúc gắn kết. Đối với một công ty có nhu cầu biến thiên, đột biến, hoặc không thường xuyên, mô hình freelancer rẻ hơn đáng kể.

AWS cung cấp mô hình đó cho compute — và liệu nó có hợp lý không phụ thuộc vào mẫu nhu cầu của bạn. Câu hỏi đầu tiên không bao giờ là "mô hình này có tốt không?" mà là "workload của tôi thực sự trông như thế nào?"

Đối với hầu hết các workload lớn hơn một startup: một hỗn hợp. Một số thứ chạy liên tục (máy chủ API, database). Một số thứ chỉ chạy khi được kích hoạt (xử lý sự kiện, tạo báo cáo, thay đổi kích thước ảnh). Mô hình freelancer dành cho loại thứ hai — và Nimbus sắp khám phá ra bao nhiêu phần hóa đơn của họ thuộc về đó.

---

Fan-out SQS/SNS đã tách rời luồng đặt hàng, nhưng các worker tiêu thụ các hàng đợi đó vẫn chạy trên các EC2 instance tính phí theo giờ — bất kể chúng thực sự gửi bao nhiêu email. Kiến trúc đã đúng; mô hình chi phí vẫn còn một chỗ rò rỉ.

Priya là người nhận ra nó đầu tiên.

"Dịch vụ email," cô nói. "Chúng ta gửi bao nhiêu email mỗi ngày?"

Leo kiểm tra các metric. "Trung bình 400 mỗi ngày. Đỉnh khoảng 1.200 vào tối thứ Sáu."

"Và EC2 instance chạy dịch vụ email — nó chạy bao lâu?"

"Luôn luôn. 24/7."

"Ngay cả lúc 3 giờ sáng khi chúng ta gửi không email nào?"

Im lặng.

Leo mở biểu đồ CPU CloudWatch cho EC2 instance của dịch vụ email. Biểu đồ hiển thị 18 giờ vận hành liên tục. Vào đỉnh thứ Sáu: CPU ở 38%, xử lý đợt bùng nổ email. Sau nửa đêm: CPU giảm xuống 3%. Ở đó cho đến khi các đơn hàng bữa trưa bắt đầu.

Ba phần trăm CPU trong 18 giờ liên tục. Instance đang chạy. Nó đang tính phí. Nó không làm gì có ý nghĩa.

"Chúng ta đang trả tiền cho một máy tính ngồi đó không làm gì," Leo nói.

"Trong bao nhiêu giờ mỗi ngày?"

Lại im lặng.

"Khoảng 18."

Tom giờ rất chú ý.

"Và không chỉ dịch vụ email," Priya thêm. "Dịch vụ thay đổi kích thước ảnh cho ảnh nhà hàng chạy ở 1% CPU hầu hết thời gian. Nó chỉ tăng vọt khi một nhà hàng tải lên một thực đơn mới. Cái đó xảy ra, gì nhỉ, vài lần một ngày mỗi nhà hàng?"

"Đúng," Leo xác nhận.

"Công việc dọn dẹp hàng đêm xóa các file tạm — cái đó chạy 4 phút lúc 2 giờ sáng rồi ngồi hoàn toàn nhàn rỗi trong 23 giờ 56 phút."

"Cũng đúng."

Mẫu này giống nhau trên tất cả các dịch vụ nhỏ hơn của Nimbus: compute được trả tiền cho 24 giờ một ngày, sử dụng chỉ một phần nhỏ của khoảng đó.

---

**Máy Chủ Không Phải Lúc Nào Cũng Là Câu Trả Lời**

Các EC2 instance là vĩnh viễn. Bạn khởi động một cái và nó chạy cho đến khi bạn dừng nó — 24 giờ một ngày, 7 ngày một tuần, bất kể mức sử dụng thực tế. Đối với máy chủ web của bạn (vốn xử lý lưu lượng ở mọi giờ), điều đó đúng. Đối với dịch vụ email (vốn gửi các đợt email rồi nhàn rỗi hàng giờ), nó lãng phí.

Auto Scaling Group có thể thu nhỏ dịch vụ email xuống một instance trong các giờ thấp điểm. Nhưng một instance vẫn chạy liên tục.

Đây là câu hỏi mà Tom liên tục quay lại khi nhìn vào hóa đơn: mỗi dịch vụ thực sự đang làm gì trong 18 giờ với 3% CPU đó? Không phải không gì, về mặt kỹ thuật — instance đang chờ, kiểm tra các sự kiện, duy trì trạng thái của nó. Nhưng từ góc độ kinh doanh: không gì. Dịch vụ không mang lại giá trị. Nó đang tính phí.

Đối với các workload thực sự nhàn rỗi hầu hết thời gian, một EC2 instance luôn-bật là trả tiền thuê một căn hộ bạn chỉ ghé vào cuối tuần. Căn hộ là của bạn; tiền thuê không dừng.

Mô hình freelancer giải quyết điều này hoàn toàn. Code tồn tại. Nó chỉ là không chạy cho đến khi có lý do để chạy. Không chi phí nhàn rỗi. Không công suất dự trữ. Không máy chủ chờ bên điện thoại.

Đó là tiền đề của **điện toán serverless**.

**AWS Lambda: Code Không Có Máy Chủ**

**AWS Lambda** cho phép bạn chạy code để phản hồi các sự kiện mà không cần cung cấp hoặc quản lý máy chủ. Bạn tải lên một hàm, chỉ định cái gì kích hoạt nó, và Lambda chạy nó khi trigger kích hoạt.

Một hàm Lambda:

- Không có trạng thái bền vững (mỗi lần gọi là độc lập)
- Chạy tối đa 15 phút mỗi lần gọi
- Tự động mở rộng từ 0 đến hàng nghìn lần gọi đồng thời
- Chỉ được tính phí khi chạy (mỗi 1 ms thực thi, làm tròn lên, mỗi GB bộ nhớ được cấp phát)

Khi không có trigger, Lambda không tốn gì. Khi các trigger kích hoạt, Lambda chạy và tính phí. Khi 10.000 trigger kích hoạt đồng thời, Lambda chạy 10.000 lần gọi đồng thời. Việc mở rộng là tự động và gần như tức thì.

**Trigger Sự Kiện: Cái Gì Đánh Thức Lambda Dậy**

Các hàm Lambda không tự chạy — chúng phản hồi các sự kiện. Các trigger phổ biến bao gồm:

- **Hàng đợi SQS**: Xử lý các tin nhắn từ một hàng đợi. Lambda poll hàng đợi và gọi hàm với các batch tin nhắn.
- **API Gateway**: Một request HTTP đến. API Gateway kích hoạt Lambda. Lambda tạo ra một phản hồi.
- **Sự kiện S3**: Một file được tải lên S3. Lambda xử lý nó (thay đổi kích thước một ảnh, phân tích một CSV, xác thực một tài liệu).
- **SNS**: Một tin nhắn được publish đến một topic. Lambda được thông báo.
- **DynamoDB Streams**: Một bản ghi trong DynamoDB thay đổi. Lambda xử lý thay đổi.
- **CloudWatch Events (EventBridge)**: Một sự kiện được lên lịch (như một cron job) chạy vào một thời điểm định trước.
- **ALB**: Một request HTTP đến load balancer. Lambda có thể xử lý một số route nhất định.

Đối với Nimbus, dịch vụ email trở thành một hàm Lambda được kích hoạt bởi hàng đợi SQS của nó. Khi một tin nhắn đến hàng đợi, Lambda được gọi với nội dung tin nhắn, gửi email qua SES (Simple Email Service), và thoát.

Không máy chủ. Không thời gian nhàn rỗi. Không chi phí khi nhàn rỗi.

Mẫu Lambda + SQS đáng để thấm nhuần: SQS xử lý hàng đợi, độ bền, logic thử lại, và DLQ. Lambda xử lý việc xử lý. Bạn nhận được lợi ích tách rời của SQS với kinh tế học mở-rộng-xuống-không của Lambda. Không dịch vụ nào làm việc của cái kia. Chúng kết hợp một cách sạch sẽ.

"Chuyện gì xảy ra với một tin nhắn dị dạng trong hàng đợi?" Priya hỏi. "Liệu đầu vào xấu có thể làm sập Lambda theo cách ảnh hưởng đến các hàm khác trong tài khoản không?"

Các lần gọi Lambda được cô lập với nhau. Một hàm bị sập không ảnh hưởng đến các hàm khác. Một Lambda ném ra một exception không được xử lý trên một tin nhắn dị dạng: tin nhắn quay lại hàng đợi, thử lại tới giới hạn được cấu hình, rồi chuyển đến DLQ. Bản thân Lambda vẫn sẵn sàng cho tin nhắn tiếp theo. Xác thực đầu vào bên trong handler Lambda vẫn quan trọng — để bắt dữ liệu dị dạng trước khi cố xử lý nó — nhưng một tin nhắn xấu đơn lẻ không thể kéo đổ hàm.

**Vấn Đề Cold Start**

Các hàm Lambda chạy trong **môi trường thực thi** — các container nhỏ, được cô lập. Khi một hàm được gọi:

1. AWS kiểm tra xem có một môi trường thực thi ấm sẵn không (một cái đã xử lý một lần gọi gần đây)
2. Nếu ấm: hàm chạy ngay lập tức
3. Nếu lạnh: AWS khởi tạo một môi trường thực thi mới — tải code của bạn, khởi động runtime, chạy code khởi tạo của bạn — rồi chạy hàm

Một **cold start** thêm 100ms đến vài giây độ trễ tùy vào runtime (Java và .NET có cold start dài hơn Python và Node.js) và kích thước gói code của bạn.

Bạn có thể đang thắc mắc: nếu Lambda khởi động từ đầu mỗi lần, chẳng phải điều đó làm nó chậm hơn một máy chủ đã đang chạy sao? Đúng — đôi khi. Đó là vấn đề cold start, và nó quan trọng đối với các API đối mặt với người dùng nhạy cảm về thời gian. Nó hoàn toàn không quan trọng đối với các công việc nền nơi người dùng đã nhận được xác nhận của họ. Một cold start 200ms trên một dịch vụ email chạy ở nền là vô hình với bất kỳ ai.

Đối với xử lý bất đồng bộ (gửi email, thay đổi kích thước ảnh), các cold start là vô hình với người dùng.

Đối với các API đồng bộ (các request HTTP nơi một người dùng đang chờ một phản hồi), các cold start có thể gây ra các phản hồi chậm thỉnh thoảng.

**Cách giảm thiểu**:

- **Provisioned concurrency**: Làm ấm trước một số lượng môi trường thực thi được chỉ định. Chúng luôn sẵn sàng. Bạn trả tiền cho điều này ngay cả khi chúng không xử lý request.
- **Kích thước gói nhỏ hơn**: Code nhỏ hơn khởi tạo nhanh hơn.
- **Các lần gọi làm ấm**: Các ping được lên lịch để giữ các hàm ấm (một cách tiếp cận phổ biến nhưng không thanh lịch).
- **Chọn runtime đúng**: Python và Node.js cold start nhanh hơn Java.

**Một Cuộc Điều Tra Cold Start Thực Sự**

Hai tuần sau khi chuyển sang Lambda, Leo nhận được một tin nhắn Slack từ một đối tác nhà hàng: "Xác nhận đơn hàng đôi khi mất 3 giây. Thường thì nhanh. Đang có chuyện gì vậy?"

Leo mở các metric CloudWatch cho hàm Lambda. Trong biểu đồ "Duration," anh có thể thấy một mẫu: lần gọi đầu tiên sau bất kỳ khoảng trống nào hơn 15-20 phút sẽ tăng vọt lên 2.800-3.200 mili giây. Các lần gọi tiếp theo: 180-220 mili giây.

Cold start kinh điển.

Anh kéo trace X-Ray cho một trong các lần gọi 3 giây. Dòng thời gian hiển thị nó rõ ràng:

- Giai đoạn khởi tạo: 2.640ms (tải code hàm, khởi động runtime Node.js, chạy code khởi tạo cấp module)
- Thực thi hàm handler: 290ms

Giai đoạn khởi tạo là vấn đề. Anh nhìn vào code khởi tạo. Hàm đang import một SDK lớn, khởi tạo một kết nối database, và tải cấu hình từ AWS Secrets Manager — tất cả lúc khởi động.

"Một phần của việc khởi tạo này chỉ cần xảy ra một lần mỗi môi trường thực thi," Leo nói. "Nhưng nó đang xảy ra trên mỗi cold start."

Anh tái cấu trúc code Lambda để khởi tạo kết nối database bên ngoài hàm handler (để nó được tái sử dụng qua các lần gọi ấm) và giảm kích thước gói bằng cách gỡ các module SDK không dùng. Anh cũng chuyển từ đóng gói toàn bộ AWS SDK sang import chỉ các dịch vụ cụ thể anh cần.

Sau khi tối ưu:

- Thời gian cold start: 1.100ms (vẫn còn, nhưng ít nghiêm trọng hơn)
- Các lần gọi ấm: 165ms

Cold start 1,1 giây vẫn xảy ra thỉnh thoảng. Đối với dịch vụ email (bất đồng bộ, độ trễ đối mặt người dùng vô hình), điều này chấp nhận được. Đối với Lambda thông báo nhà hàng (đối mặt khách hàng, đặt từ một máy tính bảng), Priya thúc đẩy provisioned concurrency: hai môi trường được làm ấm trước luôn sẵn sàng.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

Hai môi trường provisioned concurrency ở 256MB: khoảng $5.40/tháng. Các đợt tăng vọt độ trễ dừng lại.

**Định Giá Lambda: Tại Sao Tom Mỉm Cười**

Định giá Lambda có hai thành phần:

1. **Phí yêu cầu**: $0.20 mỗi triệu lần gọi
2. **Phí thời gian**: $0.0000166667 mỗi GB-giây (bộ nhớ được cấp phát × số giây chạy)

Một triệu yêu cầu đầu tiên mỗi tháng là miễn phí (luôn luôn, không chỉ trong năm đầu).

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi trước khi Leo kịp mở máy tính.

Tom tự làm phép tính cho dịch vụ email:

- Giả định mỗi ngày là một thứ Sáu — trường hợp xấu nhất: 1.200 email mỗi ngày × 30 ngày = 36.000 lần gọi mỗi tháng
- Mỗi lần gọi mất ~2 giây ở 256MB bộ nhớ
- Thời gian: 36.000 × 2 × 0,25GB × $0.0000166667 = $0.30/tháng
- Yêu cầu: 36.000 << 1.000.000 (free tier) = $0.00/tháng

"Và 18.000 GB-giây đó nằm gọn trong 400.000 GB-giây thời gian luôn miễn phí," Tom thêm. "Nên khoản phí thực tế sẽ là không. Nhưng tôi cố tình bỏ qua free tier — tôi muốn biết chi phí đơn vị thực."

EC2 instance cho dịch vụ email: $18/tháng.

"Tôi đã triển khai nó rồi — ồ." Leo tự dừng mình lại. Anh đã đẩy Lambda dịch vụ email lên production trước khi hoàn tất cấu hình DLQ. "Cho tôi năm phút."

Tom im lặng một lúc. Rồi: "Chúng ta nên làm cái này cho mọi thứ."

**Lambda Giỏi Cái Gì (và Cái Gì Không)**

"Khoan — nhưng *tại sao* chúng ta lại không chỉ dùng Lambda cho mọi thứ luôn?" Maya hỏi. "Nếu nó rẻ hơn và mở rộng tự động, vướng mắc là gì?"

"Giới hạn 15 phút," Leo nói. "Và cold start cho bất cứ thứ gì đối mặt người dùng. Và tính không trạng thái — bạn không thể giữ gì trong bộ nhớ giữa các lần gọi."

Nếu workload của bạn đột biến, hướng sự kiện, và hoàn thành trong dưới 15 phút, Lambda sẽ tốn một phần nhỏ của một EC2 instance luôn-bật — nhưng nếu workload của bạn là một công việc xử lý dữ liệu chạy lâu tiệm cận hoặc vượt giới hạn 15 phút, Lambda là công cụ sai và bạn sẽ cần ECS, Batch, hoặc một cách tiếp cận dựa trên EC2.

Lambda xuất sắc cho:

- **Xử lý hướng sự kiện**: Phản hồi các sự kiện (tải file lên, tin nhắn hàng đợi, các tác vụ được lên lịch)
- **Các tác vụ chạy ngắn**: Xử lý hoàn thành thoải mái trong 15 phút
- **Lưu lượng đột biến, không dự đoán được**: Lambda mở rộng từ 0 đến hàng nghìn tức thì — không cần cấp phát trước
- **Các thao tác không thường xuyên**: Một báo cáo chạy lúc 2 giờ sáng hàng ngày. Một công việc dọn dẹp chạy hàng tuần.
- **Code keo (glue code)**: Các hàm nhỏ di chuyển dữ liệu giữa các dịch vụ

Bạn có thể đang thắc mắc: chuyện gì xảy ra với việc mở rộng của Lambda khi một đợt bùng nổ đột ngột 10.000 sự kiện đến đồng thời? Giới hạn concurrency mặc định của Lambda là 1.000 lần thực thi đồng thời mỗi tài khoản. Nếu 10.000 sự kiện đến cùng lúc, tới 1.000 lần gọi chạy ngay lập tức; phần còn lại chờ trong hàng đợi SQS (nếu được kích hoạt qua SQS) và được xử lý khi công suất giải phóng. Điều này thường ổn cho xử lý dựa trên hàng đợi. Đối với các trường hợp nhạy cảm về độ trễ, giới hạn burst của Lambda (tốc độ ban đầu mà các lần thực thi đồng thời mới được thêm vào) có thể gây throttling ngắn trong các đợt tăng vọt đột ngột — provisioned concurrency né tránh điều này bằng cách có công suất được cấp phát trước.

Đối với dịch vụ email của Nimbus ở quy mô hiện tại, 1.000 lần gọi đồng thời là nhiều hơn nhiều so với những gì họ từng cần. Nhưng đó là ràng buộc đúng để biết trước khi bạn chạm đến nó.

Lambda kém cho:

- **Các quy trình chạy lâu**: Giới hạn 15 phút là một bức tường cứng
- **Các ứng dụng có trạng thái**: Các hàm Lambda không trạng thái theo thiết kế — mỗi lần gọi là độc lập
- **Các API thông lượng cao, độ trễ thấp**: Các cold start có thể gây các đợt tăng vọt độ trễ; provisioned concurrency giảm thiểu điều này nhưng thêm chi phí
- **Các ứng dụng cần kết nối bền vững**: Lambda không thể duy trì dễ dàng một connection pool database tồn tại lâu (dù các công cụ connection pooling như RDS Proxy giúp ích)
- **Các máy chủ web truyền thống**: Có thể, nhưng không phải sự phù hợp tự nhiên

**Bức Tường 15 Phút: Khi Lambda Là Công Cụ Sai**

Ba tuần sau khi chuyển đổi, Leo cố di chuyển một workload nữa sang Lambda: bộ tạo báo cáo phân tích hàng đêm. Nó kéo dữ liệu đơn hàng từ database, nối nó với metadata nhà hàng, tính toán thống kê, và tạo một PDF.

Vào đêm đầu tiên, lần gọi Lambda thất bại với một lỗi timeout.

"Việc tạo báo cáo mất 17 phút," Leo nói sáng hôm sau.

"Tối đa của Lambda là 15," Priya nói.

"Đúng. Giờ tôi biết rồi."

Anh đã kiểm tra thời gian xử lý trung bình (8 phút) và giả định Lambda sẽ hoạt động. Anh đã không kiểm tra cái đuôi — những đêm khi khối lượng dữ liệu cao hơn và truy vấn mất lâu hơn. Vào những đêm đó, 15 phút không đủ.

"Vậy báo cáo chỉ là... không được tạo?" Maya hỏi.

"Đúng. Không thông báo lỗi. Không báo cáo một phần. Chỉ im lặng."

"Tôi đã triển khai nó rồi — ồ," Leo nói.

Đây là một trong những cách cụ thể mà Lambda thất bại không duyên dáng: một timeout không tạo ra đầu ra nào, không thông báo lỗi nào trong ứng dụng, chỉ một log lỗi CloudWatch. Nếu bạn không giám sát các lỗi timeout Lambda cụ thể, bạn có thể không nhận thấy trong nhiều ngày.

Cách khắc phục: di chuyển bộ tạo báo cáo sang ECS Fargate — các container không quản lý máy chủ; chương sau — vốn không có giới hạn thời gian. Lambda là công cụ sai cho các workload có thể vượt 15 phút dù chỉ thỉnh thoảng. Bài học không phải là "Lambda dở." Bài học là "Lambda là công cụ đúng cho các workload phù hợp với các ràng buộc của nó — và một nguồn của những thất bại đáng ngạc nhiên khi chúng không phù hợp."

**RDS Proxy: Connection Pooling Cho Lambda**

Bản chất không trạng thái của Lambda tạo ra một vấn đề database cụ thể.

Khi một EC2 instance kết nối với RDS, nó duy trì một connection pool bền vững. Ứng dụng tái sử dụng các kết nối từ pool. RDS có thể xử lý, giả sử, 200 kết nối đồng thời.

Khi Lambda xử lý 500 lần gọi đồng thời, mỗi lần gọi cố mở kết nối database riêng của nó. Đó là 500 kết nối mới — làm quá tải một database hỗ trợ 200.

**Amazon RDS Proxy** ngồi giữa các hàm Lambda và RDS, duy trì một connection pool bền vững và ghép kênh các kết nối tồn tại ngắn của Lambda qua nó.

Thay vì: lần gọi Lambda → kết nối RDS mới (cho mỗi trong 500 lần gọi đồng thời)

Với RDS Proxy: lần gọi Lambda → RDS Proxy → pool của 20 kết nối RDS bền vững

"Proxy cần thông tin xác thực RDS," Priya nói. "Những cái đó sống ở đâu? Nó có lưu trữ chúng không?"

RDS Proxy lưu trữ thông tin xác thực trong Secrets Manager và xoay vòng chúng tự động. IAM role của hàm Lambda cấp cho nó quyền truy cập proxy (dùng xác thực IAM), không phải truy cập trực tiếp thông tin xác thực RDS. Thông tin xác thực không bao giờ bị phơi bày cho code Lambda.

"Vậy hàm Lambda xác thực qua IAM," Leo xác nhận, "và proxy xử lý thông tin xác thực database thực sự."

Đối với Lambda xử lý đơn hàng của Nimbus (cái truy vấn RDS để xác thực đơn hàng), RDS Proxy loại bỏ tình trạng cạn kiệt connection pool trong giờ cao điểm thứ Sáu.

**Lambda Layers: Các Phụ Thuộc Dùng Chung**

Lambda dịch vụ email, Lambda thông báo, và Lambda báo cáo đều dùng chung cùng code thư viện nội bộ: các hàm tiện ích cho định dạng tiền tệ, làm sạch đầu vào, ghi log theo định dạng chuẩn.

Không có Lambda Layers, code dùng chung đó phải được đóng gói vào gói triển khai của mỗi hàm. Ba hàm, ba bản sao của cùng thư viện 2MB. Khi thư viện cập nhật, cả ba hàm cần các lần triển khai mới.

**Lambda Layers** là các gói riêng biệt mà các hàm Lambda có thể tham chiếu lúc chạy. Thư viện dùng chung được tách vào một layer. Ba hàm tham chiếu layer. Các cập nhật cho thư viện dùng chung nghĩa là cập nhật phiên bản layer — không triển khai lại cả ba hàm.

Lợi ích thêm: các gói hàm riêng lẻ nhỏ hơn nghĩa là cold start nhanh hơn.

"Một thứ mà layer không thay đổi: execution role," Priya nói. "Nếu một Lambda có quyền quá rộng, một hàm bị xâm phạm có thể truy cập mọi thứ trong tài khoản."

"Cùng nguyên lý như các role EC2," Leo nói. "Đặc quyền tối thiểu. Mỗi Lambda chỉ nhận các quyền nó thực sự cần."

"Vậy Lambda không phải là một sự thay thế cho EC2," Maya nói. "Nó là một công cụ khác cho các công việc khác."

"Web API của Nimbus ở lại trên EC2 hoặc ECS," Leo xác nhận. "Dịch vụ email, bộ thay đổi kích thước ảnh, bộ tạo báo cáo hàng đêm, bộ dọn log — những cái đó chuyển sang Lambda."

**Triết Lý Serverless**

Lambda là một phần của một khái niệm rộng hơn: **serverless** — xây dựng các ứng dụng nơi bạn không quản lý máy chủ nào, chỉ code.

Một ngăn xếp Nimbus serverless hoàn toàn có thể trông như:

- API Gateway + Lambda (thay vì EC2 với một máy chủ web)
- DynamoDB (thay vì RDS — cũng serverless, không quản lý máy chủ)
- S3 (các tài sản tĩnh — vốn dĩ serverless)
- SNS + SQS (nhắn tin — serverless)
- Lambda (tất cả xử lý nền)

Sức hấp dẫn: bạn viết code; AWS quản lý mọi thứ khác. Không vá lỗi, không cấu hình mở rộng, không lập kế hoạch công suất.

## Amazon API Gateway

Danh sách trigger Lambda đề cập đến API Gateway một cách ngắn gọn: request HTTP đến, API Gateway kích hoạt Lambda. Điều đó chính xác, nhưng nó đánh giá thấp API Gateway thực sự là gì.

"Khoan — nhưng *tại sao* chúng ta lại đặt API Gateway trước Lambda?" Maya hỏi. "Lambda không thể nhận các request HTTP trực tiếp sao?"

Lambda có thể nhận các request HTTP qua một function URL — một endpoint HTTPS đơn giản, trực tiếp. Nhưng nó không xử lý định tuyến, ủy quyền, throttling, caching, hay biến đổi request. Đối với một API production, những mối quan tâm đó tồn tại bất kể backend của bạn là Lambda hay EC2.

**Amazon API Gateway** là một dịch vụ được quản lý hoàn toàn để tạo, triển khai, và quản lý các API ở bất kỳ quy mô nào. Nó xử lý quản lý lưu lượng, ủy quyền, throttling, caching, và giám sát để hàm Lambda của bạn (hoặc EC2, hoặc bất kỳ backend HTTP nào) không phải tự triển khai chúng.

**Ba loại API:**

**REST API** là lựa chọn nhiều tính năng nhất. Nó hỗ trợ biến đổi request và response, caching response, các usage plan gắn với API key, và tất cả các loại ủy quyền. Hầu hết các câu hỏi thi SAA-C03 đề cập đến API Gateway liên quan đến REST API.

**HTTP API** đơn giản hơn và rẻ hơn — chi phí thấp hơn khoảng 70% so với REST API. Nó được thiết kế cho các backend Lambda và các HTTP proxy. Nó hỗ trợ ủy quyền OIDC và OAuth 2.0 nhưng không hỗ trợ biến đổi request hay caching. Nếu bạn không cần các tính năng nâng cao của REST API, HTTP API là lựa chọn đúng.

**WebSocket API** quản lý các kết nối hai chiều bền vững. API Gateway xử lý vòng đời kết nối và định tuyến các tin nhắn đến Lambda dựa trên nội dung tin nhắn. Hàm Lambda không cần quản lý trạng thái socket — API Gateway làm điều đó.

**Các lựa chọn ủy quyền** (những cái đề thi kiểm tra):

**Cognito User Pool authorizer** xác thực một JWT từ một Cognito User Pool. Không cần Lambda. API Gateway tự kiểm tra token. Nếu nó hợp lệ, request đi qua.

**Lambda authorizer** chạy hàm Lambda của riêng bạn để xác thực một token — một JWT tùy chỉnh, một token OAuth từ một nhà cung cấp danh tính bên thứ ba, một API key ở định dạng độc quyền. Lambda trả về một IAM policy. Nếu policy cho phép hành động, request tiến hành.

**API key** là một key đơn giản được truyền trong một header request. Các API key dùng để giới hạn tốc độ theo client, không phải để xác thực. Đừng dùng chúng như một cơ chế bảo mật — chúng không phải là bí mật, chúng là các định danh.

**Throttling và usage plan:**

Theo mặc định, API Gateway cho phép 10.000 request mỗi giây ở cấp tài khoản (một giới hạn mềm), với một burst là 5.000. Vượt nó và các client nhận được một `429 Too Many Requests` — backend của bạn thậm chí không bao giờ cảm thấy nó. Khi bạn cần giới hạn theo từng client, bạn tạo một usage plan: gắn nó với một API key, đặt một tốc độ request và một hạn ngạch hàng ngày hoặc hàng tháng. Các đợt bùng nổ của một client không tiêu thụ phần phân bổ của một client khác.

Hai con số đáng giữ: payload tối đa là **10 MB**, và timeout tích hợp mặc định là **29 giây** — nếu backend của bạn mất lâu hơn, gateway bỏ cuộc. (Từ 2024, timeout đó có thể được nâng vượt 29 giây cho các REST API Regional và private qua một lần tăng hạn ngạch — nhưng mặc định 29 giây vẫn là cái đề thi mong đợi.) API Gateway dành cho các API request/response, không phải các công việc chạy lâu; đối với những cái đó, hãy giao việc cho SQS hoặc Step Functions và trả lời ngay.

"Cái này tốn bao nhiêu mỗi tháng?" Tom hỏi.

Đối với REST API: $3.50 mỗi triệu API call, cộng $0.09 mỗi GB chuyển dữ liệu. Đối với lưu lượng nhỏ-đến-trung bình, về cơ bản là miễn phí. Đối với các API khối lượng cao, mức giá thấp hơn của HTTP API trở nên có ý nghĩa.

Leo chỉ vào danh sách trigger Lambda anh đã viết trước đó. "Vậy API Gateway không chỉ là một cách để kích hoạt Lambda. Nó là thứ làm cho Lambda cảm thấy như một API thực sự."

"Hàm Lambda xử lý logic nghiệp vụ," Priya nói. "API Gateway xử lý mọi thứ phía trước nó — định tuyến, auth, throttling, giám sát. Mỗi cái làm một việc."

"Và nếu có ai cố gọi Lambda trực tiếp, bỏ qua API Gateway thì sao?"

"Execution policy của Lambda chỉ cho phép các lần gọi từ API Gateway," Priya nói. "Resource-based policy trên Lambda từ chối mọi thứ khác."

Thực tế: serverless có sự phức tạp vận hành riêng — gỡ lỗi các hàm Lambda phân tán, quản lý các cold start, hiểu các giới hạn concurrency. Nó không đơn giản hơn, chỉ khác đi.

"Khoan — nhưng *tại sao* serverless 'không đơn giản hơn'?" Maya hỏi. "Toàn bộ lời quảng cáo là nó loại bỏ gánh nặng vận hành."

"Nó loại bỏ một phần gánh nặng vận hành," Leo nói. "Cấp phát hạ tầng, vá lỗi, cấu hình mở rộng — những cái đó biến mất. Cái còn lại thì khác: quản lý cold start, distributed tracing qua các hàm bạn không thể SSH vào, các giới hạn concurrency, quản lý các phiên bản và alias của hàm, hiểu cách các cập nhật Layer lan truyền, xử lý các timeout 15 phút một cách duyên dáng."

"Vậy gánh nặng dịch chuyển," Priya nói. "Từ vận hành hạ tầng sang vận hành hàm."

"Đúng. Đối với rất nhiều workload — đặc biệt là các cái hướng sự kiện, nhỏ, đột biến — đó là một sự đánh đổi tốt hơn. Đối với một máy chủ ứng dụng chạy lâu mà các kỹ sư cần tương tác và gỡ lỗi, EC2 hoặc container thường vẫn là lựa chọn đúng."

Bạn có thể đang thắc mắc: serverless có phải là tương lai, và liệu mọi thứ cuối cùng có nên chuyển sang Lambda không? Câu trả lời trung thực là nó phụ thuộc vào workload. Serverless đã thống trị xử lý hướng sự kiện. Nó đã có những bước tiến đáng kể trong các HTTP API (qua API Gateway + Lambda). Nó chưa thay thế các máy chủ ứng dụng luôn-bật, xử lý theo lô chạy lâu, hay các dịch vụ có trạng thái — và có lẽ sẽ không, vì những trường hợp sử dụng đó không hưởng lợi từ mô hình của Lambda. Câu hỏi về công cụ đúng không bao giờ biến mất; nó chỉ áp dụng cho các lựa chọn khác nhau theo thời gian.

## Điểm Mạnh Và Hạn Chế

**Tại sao Lambda mạnh mẽ**:

- Trả-theo-mức-sử-dụng thực sự — chi phí bằng không khi nhàn rỗi
- Mở rộng tự động không cần cấu hình
- Không có máy chủ để vá hay bảo trì
- Free tier hào phóng (1 triệu request mỗi tháng, miễn phí mãi mãi)
- Tích hợp chặt chẽ với phần còn lại của AWS
- RDS Proxy và Lambda Layers giải quyết hai trong số các điểm đau phổ biến nhất của Lambda (connection pooling và chia sẻ code) mà không đòi hỏi thay đổi kiến trúc

**Khi nào nó trở nên phức tạp**:

- Các cold start là có thật và đòi hỏi xử lý cẩn thận cho các workload nhạy cảm về độ trễ
- Giới hạn thực thi 15 phút loại trừ các tác vụ chạy lâu
- Gỡ lỗi khó hơn — không có máy chủ bền vững để SSH vào
- Thiết kế không trạng thái đòi hỏi đưa toàn bộ trạng thái ra ngoài (database, cache, S3)
- Các giới hạn concurrency (mặc định 1.000 lần gọi đồng thời mỗi tài khoản) có thể throttle ở quy mô
- Các hàm Lambda kết nối VPC có độ trễ và các vấn đề cold start bổ sung

**Giám Sát Lambda Mà Không Có SSH**

Lần đầu tiên có thứ gì đó hỏng trong một hàm Lambda, bản năng của Leo là SSH vào và nhìn vào tiến trình. Không có tiến trình để SSH vào. Các môi trường thực thi của Lambda là phù du và không truy cập được.

Gỡ lỗi Lambda đòi hỏi học một bộ công cụ khác:

**CloudWatch Logs**: Mỗi lần gọi Lambda ghi stdout/stderr của nó vào một CloudWatch Log Group. Ghi log có cấu trúc (định dạng JSON) làm cho những cái này lọc được. Các trường hữu ích nhất: tên hàm, ID lần gọi, thời gian, loại lỗi, và correlation ID tùy chỉnh của bạn.

**CloudWatch Metrics**: Lambda publish các metric Invocations, Duration, Errors, Throttles, và ConcurrentExecutions tự động. Đặt các alarm trên Errors và Throttles nên là ngày một của bất kỳ lần triển khai Lambda nào.

**AWS X-Ray**: Distributed tracing cho Lambda. Thêm một chi phí phụ trội nhỏ (2-5ms mỗi lần gọi) nhưng cho bạn một flame graph về nơi thời gian được tiêu tốn bên trong hàm. Thiết yếu cho phân tích cold start — X-Ray hiển thị giai đoạn khởi tạo riêng biệt với giai đoạn handler.

**Lambda Insights**: Giám sát nâng cao cho Lambda, có sẵn qua CloudWatch Lambda Insights. Thêm mức sử dụng bộ nhớ, thời gian CPU, và thời gian init vào các metric chuẩn. Tốn thêm chút ít nhưng đáng giá cho các hàm production.

"Và nếu có ai cố đột nhập qua môi trường thực thi thì sao?" Priya hỏi. "Các hàm Lambda chạy trong các container được cô lập, nhưng nếu một phụ thuộc có một lỗ hổng, liệu một kẻ tấn công có thể giành được thực thi code bên trong Lambda của chúng ta không?"

Các cách giảm thiểu: giữ các phụ thuộc tối thiểu và cập nhật (phân tích cold start đã thúc đẩy Leo giảm kích thước gói), dùng Lambda Layers để quản lý phiên bản các thư viện dùng chung, và cấp cho execution role của Lambda các quyền tối thiểu cần thiết. Nếu hàm chỉ có thể ghi vào một bucket S3 cụ thể và truy vấn một bảng DynamoDB cụ thể, bán kính tác động của một hàm bị xâm phạm bị giới hạn đúng vào đó.

"Đặc quyền tối thiểu cho các execution role của Lambda không phải là tùy chọn," Priya nói. "Đó là cái giới hạn thiệt hại khi có gì đó sai."

Cô đúng. Và như hầu hết các lời khuyên bảo mật, nó cũng chỉ là kỹ thuật tốt.

## Tóm Tắt

Kiến trúc SQS/SNS từ chương 19 tách các mối quan tâm về việc nhận công việc và xử lý nó. Lambda đưa điều đó đi xa hơn: nó tách các mối quan tâm về việc xử lý công việc và trả tiền cho công suất để làm nó.

- **AWS Lambda** chạy code để phản hồi các sự kiện mà không quản lý máy chủ.
- **Trả theo mức sử dụng**: được tính phí mỗi lần gọi và mỗi 1 ms thực thi (làm tròn lên). Chi phí bằng không khi nhàn rỗi.
- Tự động mở rộng từ 0 đến hàng nghìn lần gọi đồng thời.
- **Cold start**: độ trễ khởi tạo khi không có môi trường thực thi ấm. Được giảm thiểu với provisioned concurrency hoặc các runtime nhẹ.
- **Lambda Layers**: các gói code dùng chung mà nhiều hàm có thể tham chiếu, giảm trùng lặp và kích thước gói.
- **RDS Proxy**: giải quyết vấn đề cạn kiệt kết nối của Lambda bằng cách duy trì một connection pool database bền vững giữa Lambda và RDS.
- **Giám sát**: dùng CloudWatch Logs, Metrics, X-Ray tracing, và Lambda Insights — không có máy chủ để SSH vào.
- Tốt nhất cho: các workload hướng sự kiện, chạy ngắn, đột biến, hoặc không thường xuyên.
- Không lý tưởng cho: các tác vụ chạy lâu (giới hạn cứng 15 phút), các ứng dụng có trạng thái, các API thông lượng cao độ trễ thấp không có provisioned concurrency.
- **Serverless** là một triết lý thiết kế — bạn quản lý code, không phải hạ tầng. Sự phức tạp vận hành dịch chuyển, không biến mất.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Có Khả Năng Chống Chịu (Lĩnh vực 2, Nhiệm vụ 2.1)*

- **Lambda + S3**: Mẫu kinh điển — file được tải lên S3 kích hoạt Lambda để xử lý (tạo thumbnail, quét virus, biến đổi dữ liệu). Không cần máy chủ.
- **Lambda + SQS**: Lambda poll SQS và xử lý các batch. SQS cung cấp cơ chế retry/DLQ. Lambda cung cấp việc xử lý.
- **Lambda + API Gateway**: HTTP API serverless. API Gateway xử lý định tuyến, auth, throttling. Lambda xử lý logic nghiệp vụ.
- **Các loại API Gateway:** REST API = đầy đủ tính năng, biến đổi request, caching, usage plan. HTTP API = đơn giản hơn, rẻ hơn, chỉ OIDC/OAuth. WebSocket API = các kết nối hai chiều bền vững. **Ủy quyền:** Cognito authorizer = xác thực JWT Cognito một cách tự nhiên. Lambda authorizer = logic xác thực token tùy chỉnh. API key = giới hạn tốc độ theo client (không phải xác thực). Trigger thi: "REST API serverless" → API Gateway + Lambda.
- **Tín hiệu cold start**: "các đợt tăng vọt độ trễ trên request đầu tiên," "thời gian phản hồi không nhất quán" → cold start. Giải pháp: provisioned concurrency (tốn tiền), gói nhỏ hơn, runtime nhẹ hơn.
- **Các giới hạn thực thi**: tối đa 15 phút. tối đa 10GB bộ nhớ. 512MB lưu trữ phù du /tmp theo mặc định (có thể cấu hình lên tới 10GB). Các giới hạn này xuất hiện trong các kịch bản thi.
- **Các lỗi timeout Lambda là im lặng**: Nếu một hàm Lambda timeout, nó tạo ra một lỗi CloudWatch nhưng không có phản hồi lỗi cấp ứng dụng. Giám sát các lỗi Lambda Timeout của CloudWatch một cách tường minh. Đây là cách bộ tạo báo cáo 17 phút của Leo thất bại vào đêm đầu tiên mà không có alarm cấp ứng dụng nào.
- **Cold start của VPC Lambda**: Các hàm Lambda bên trong một VPC có độ trễ cold start bổ sung (cấp phát ENI). AWS đã cải thiện điều này đáng kể với Hyperplane ENI, nhưng các cold start của VPC Lambda vẫn chậm hơn không-VPC. Tránh VPC cho các hàm Lambda không cần tài nguyên VPC (tức là, không kết nối với RDS, ElastiCache, hoặc các tài nguyên chỉ-VPC khác).
- **Concurrency của Lambda**: Mặc định 1.000 lần thực thi đồng thời mỗi tài khoản (có thể tăng). **Reserved concurrency**: đảm bảo một hàm nhận một số lần thực thi cụ thể; ngăn các hàm khác tiêu thụ chúng. **Provisioned concurrency**: làm ấm trước một số môi trường thực thi.
- **Event source mapping**: Tính năng Lambda kết nối SQS/DynamoDB Streams/Kinesis với Lambda. Lambda poll nguồn và batch các bản ghi.
- **Chạm các giới hạn tài khoản**: "ứng dụng đang bị throttle / LimitExceeded khi nó mở rộng" → kiểm tra giới hạn trong **Service Quotas** và yêu cầu tăng ở đó (nhiều hạn ngạch, như concurrency Lambda, có thể điều chỉnh; một số là giới hạn cứng).
- **RDS Proxy**: Tín hiệu thi: "các hàm Lambda gây quá nhiều kết nối database," "cạn kiệt connection pool với Lambda." → RDS Proxy duy trì các kết nối bền vững và ghép kênh các kết nối tồn tại ngắn của Lambda.
- **Lambda Layers**: Tín hiệu thi: "chia sẻ code qua nhiều hàm Lambda," "giảm kích thước gói triển khai" → Lambda Layers.
- **Lambda + X-Ray**: Distributed tracing cho Lambda. Kịch bản thi: "truy vết các request qua nhiều hàm Lambda và dịch vụ" → bật X-Ray tracing trên Lambda.
- **Lambda Destinations:** Đối với các lần gọi Lambda bất đồng bộ, bạn có thể cấu hình một Destination cho cả kết quả thành công lẫn thất bại. Gửi các kết quả thành công đến SQS, SNS, EventBridge, hoặc một hàm Lambda khác. Gửi các thất bại đến SQS hoặc SNS để cảnh báo. Đây là phương án thay thế ưu tiên cho các DLQ đối với các lần gọi bất đồng bộ vì nó bắt cả thành công lẫn thất bại, không chỉ thất bại. Tín hiệu thi: "định tuyến các kết quả Lambda thành công đến một dịch vụ khác" hoặc "bắt cả kết quả thành công lẫn thất bại từ Lambda bất đồng bộ" → Lambda Destinations. "Chỉ bắt các tin nhắn thất bại cho lần gọi bất đồng bộ" → DLQ vẫn hợp lệ nhưng Destinations là giải pháp đầy đủ hơn.

## Bài Tập

**Bài tập 1 — Ôn lại**

Giải thích vấn đề cold start. Trong loại ứng dụng nào thì các cold start sẽ gây vấn đề nhất? Trong loại nào thì chúng chấp nhận được?

*(Gợi ý: So sánh một API thời gian thực (người dùng đang chờ một phản hồi) với một công việc nền bất đồng bộ (người dùng đã nhận được xác nhận của họ và đang làm việc khác).)*

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một công ty nhận các ảnh sản phẩm từ các nhà cung cấp của họ qua một bucket S3. Mỗi ảnh cần được thay đổi kích thước thành bốn kích thước tiêu chuẩn (thumbnail, small, medium, large) và lưu trữ lại trong S3. Khối lượng không dự đoán được — một số ngày 10 ảnh, một số ngày 100.000. Việc xử lý phải hoàn thành trong vòng 10 phút mỗi ảnh. Chi phí phải được giảm thiểu.

Kiến trúc nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Các EC2 instance trong một Auto Scaling Group giám sát bucket S3 với long polling  
B) Một EC2 instance chuyên dụng với một cron job kiểm tra S3 mỗi phút để tìm ảnh mới  
C) Các task ECS Fargate được kích hoạt bởi một hàng đợi SQS, với các sự kiện S3 publish đến hàng đợi  
D) Thông báo sự kiện S3 kích hoạt một hàm Lambda thay đổi kích thước các ảnh và lưu trữ kết quả trong S3

**Gợi ý 1**: Khối lượng không dự đoán được ưu ái mở-rộng-xuống-không. Lựa chọn nào làm điều đó?

**Gợi ý 2**: 10 phút mỗi ảnh nằm trong giới hạn 15 phút của Lambda. Kiểm tra xem công việc thay đổi kích thước ảnh có phù hợp với các ràng buộc của Lambda không.

**Gợi ý 3**: Một EC2 instance chuyên dụng chạy 24/7 đắt và không mở rộng.

**Đáp án**: D

**Giải thích**: Các thông báo sự kiện S3 kích hoạt Lambda khi một ảnh được tải lên. Lambda thay đổi kích thước ảnh thành bốn kích thước và lưu trữ kết quả trong S3. Lambda mở rộng từ 0 đến hàng nghìn lần gọi đồng thời tự động, xử lý khối lượng không dự đoán được mà không cấp phát trước. Chi phí bằng không khi không có ảnh nào đang được xử lý.

**Tại sao không phải A?** EC2 trong một ASG không mở rộng xuống không — tối thiểu một instance luôn chạy. Long polling S3 không phải là một cơ chế sự kiện S3 tự nhiên. Chi phí cao hơn Lambda cho các workload đột biến.

**Tại sao không phải B?** Một EC2 instance chuyên dụng là một điểm lỗi đơn lẻ, không mở rộng, chạy 24/7, và một cách tiếp cận dựa trên cron có độ trễ phát hiện tới 60 giây.

**Tại sao không phải C?** ECS Fargate hoạt động, nhưng nó phức tạp hơn (đòi hỏi quản lý container, ECR, các task definition) và việc khởi động task Fargate mất hàng chục giây đến hàng phút — chậm hơn nhiều một cold start Lambda — khiến nó là sự phù hợp kém cho công việc đột biến, hướng sự kiện. Lambda đơn giản hơn cho trường hợp sử dụng này.

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Có Khả Năng Chống Chịu — Nhiệm vụ 2.1*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Nimbus muốn tạo một báo cáo hàng ngày lúc 5 giờ sáng với top 10 nhà hàng theo khối lượng đơn hàng của ngày hôm trước. Báo cáo được tạo từ dữ liệu DynamoDB, định dạng thành một PDF, lưu trữ trong S3, và gửi email đến tất cả các đối tác nhà hàng.

Thiết kế pipeline đầy đủ dựa trên Lambda cho việc này. Cái gì kích hoạt Lambda? Chuyện gì xảy ra nếu việc tạo PDF mất 12 phút? Nếu có 5.000 đối tác nhà hàng và gửi email cho tất cả họ mất thời gian thì sao? Bạn sẽ dùng một Lambda hay nhiều?

Cân nhắc thêm: nếu Lambda timeout sau 14 phút, đã xử lý 4.500 trong 5.000 email nhà hàng thì sao? Bạn tránh gửi các email trùng lặp thế nào khi Lambda được thử lại? Lambda này cần các quyền IAM nào, và bộ tối thiểu cần thiết là gì?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành kết hợp Lambda với các dịch vụ khác.)*

## Cảnh Sau Tín Dụng

Tom xem lại hóa đơn vào cuối tháng.

Dịch vụ email: đã biến mất khỏi hóa đơn EC2.
Công việc thay đổi kích thước ảnh: biến mất.
Tác vụ dọn dẹp hàng đêm: biến mất.
Báo cáo phân tích hàng ngày: biến mất. (Bộ tạo báo cáo đã được chuyển sang ECS Fargate sau sự cố timeout 17 phút, nhưng chi phí compute Lambda là không vì nó giờ được điều phối khác đi.)

Tổng phí Lambda cho tháng: $5.47.

"Năm đô la," Tom nói.

"Và bốn mươi bảy xu," Leo thêm vào một cách hữu ích.

Tom nhìn hóa đơn tháng trước, khi tất cả các dịch vụ đó đều trên các EC2 instance.

"Chúng ta đang trả $187 cho cùng các workload đó."

"Lambda không tính phí thời gian nhàn rỗi," Leo nói. "Và hầu hết các dịch vụ đó nhàn rỗi 90% thời gian."

Tom mở các biểu đồ CloudWatch thêm một lần nữa. Lambda dịch vụ email đã được gọi 36.412 lần. Tổng thời gian: khoảng 18.200 GB-giây. Ở $0.0000166667 mỗi GB-giây: $0.30 — và ngay cả cái đó cũng chỉ là trên giấy, vì 18.200 GB-giây nằm thoải mái trong 400.000 GB-giây thời gian luôn-miễn-phí. Mục dòng thực tế là không.

"EC2 instance là $18 một tháng," Tom nói. "Chúng ta tiêu ba mươi xu — và đó là tôi bỏ qua free tier, để chúng ta biết chi phí đơn vị thực. Hóa đơn nói không."

"Hầu hết $5.47 là provisioned concurrency trên Lambda thông báo — cái đó tính phí dù nó chạy hay không. Bộ thay đổi kích thước ảnh, tác vụ dọn dẹp, và phần còn lại nằm trong free tier."

Tom nhìn chằm chằm vào màn hình một lúc lâu.

"Tôi rút lại mọi thứ tôi đã nói về serverless là một từ hype," anh nói.

"Anh chưa bao giờ nói thế," Leo nói.

"Tôi đã nghĩ nó rất to."

Trong chương tiếp theo: container vận chuyển làm cho mọi máy chủ cảm thấy như ở nhà.
