# Chương 29: Hóa Đơn Cơ Sở Dữ Liệu

Tom in các chỉ số CloudWatch. Mười bốn trang. Anh trải chúng ra khắp bàn trước khi tin tưởng bản thân có thể đọc các con số. Tốt hơn là thấy mọi thứ cùng một lúc còn hơn là tìm ra bất ngờ giữa trang.

**Tóm tắt nhanh: Lưu Trữ Đã Xong, Cơ Sở Dữ Liệu Là Tiếp Theo**

Đợt kiểm toán lưu trữ đã phát hiện $6,700 lãng phí tích lũy — không phải từ những quyết định tồi, mà từ sự thiếu chú ý. Các volume không được gắn, snapshot cũ, lịch sử phiên bản mà không ai bảo S3 dọn dẹp, các tải lên multipart chưa hoàn thành tích lũy lặng lẽ trong nhiều tháng. Tom đã sửa tất cả, triển khai các quy tắc dọn dẹp tự động, và chuyển sang tab tiếp theo trong bảng tính. Tầng dữ liệu là ẩn số lớn nhất còn lại: cơ sở dữ liệu quan hệ, bảng NoSQL, node cache, lưu trữ backup, và một khoản mục đã làm anh bận lòng trong nhiều tuần.

Các khoản mục tầng dữ liệu đang được xem xét:

Cụm Aurora: $647/tháng.
RDS PostgreSQL read replica cũ: $340/tháng.
Bảng DynamoDB: $340/tháng.
ElastiCache: $185/tháng.
Snapshot thủ công Aurora: $87/tháng.

Tổng tầng dữ liệu đang được xem xét: $1,599/tháng.

"Để tôi hiểu từng cái trước khi quyết định bất cứ điều gì," anh nói. "Vì cơ sở dữ liệu không phải nơi tiết kiệm tiền bằng cách cắt góc."

Điều này khôn ngoan. Cấu hình cơ sở dữ liệu sai gây ra mất dữ liệu hoặc suy giảm hiệu suất tốn kém hơn nhiều so với khoản tiết kiệm.

Hãy nghĩ về cơ sở dữ liệu như động cơ của một chiếc xe. Bạn có thể tiết kiệm tiền cho xe bằng cách chuyển sang nhiên liệu rẻ hơn, điều chỉnh áp suất lốp và loại bỏ trọng lượng không cần thiết khỏi cốp. Nhưng nếu bạn cố tiết kiệm tiền bằng cách bỏ qua thay dầu, bạn có nguy cơ bó động cơ — và một động cơ bị bó tốn kém hơn nhiều so với bất kỳ khoản tiết kiệm nhiên liệu nào. Cuộc kiểm toán mà Tom sắp thực hiện tuân theo cùng logic: tìm lãng phí trong cốp và thùng nhiên liệu, và để yên động cơ cho đến khi bạn biết chính xác bạn đang làm gì.

**Hiểu Khối Lượng Công Việc Cơ Sở Dữ Liệu Của Bạn Trước**

Tối ưu hóa chi phí trong cơ sở dữ liệu đòi hỏi hiểu khối lượng công việc trước khi chạm vào bất cứ thứ gì. Tom đã học được điều này từ một lần suýt sai sáu tháng trước: anh đã bắt đầu giảm kích thước instance cơ sở dữ liệu dựa trên mức sử dụng CPU trung bình — 18% — mà không xem các con số p95 trước. Một đồng nghiệp đã yêu cầu anh kiểm tra các chỉ số CloudWatch cẩn thận hơn. CPU p95 là 61%, và trong một đợt cao điểm bữa tối thứ Sáu đặc biệt nặng, nó đã chạm 84%.

"Mức trung bình không cho bạn biết điều gì xảy ra ở cao điểm," Tom nói, khi anh kể cho Priya về điều đó. "Nếu tôi đã right-size theo mức trung bình, chúng ta sẽ bị throttle vào các tối thứ Sáu."

"Đó là lý do tại sao bạn nhìn p95, không phải trung bình," Priya nói. "Luôn luôn."

Nguyên tắc đó mở rộng ra ngoài CPU. Tom giờ có một danh sách kiểm tra trước kiểm toán tiêu chuẩn:

- CPU: p95, không phải trung bình
- Bộ nhớ: FreeableMemory (tính bằng byte tuyệt đối, không phải phần trăm) — chúng ta gần với giới hạn đến mức nào?
- Kết nối: DatabaseConnections tối đa trong 30 ngày gần nhất — chúng ta đã đến gần giới hạn kết nối đến mức nào?
- Tỷ lệ đọc/ghi: Xác định liệu các read replica có xứng đáng với chi phí của chúng không
- Tốc độ tăng trưởng lưu trữ: Chúng ta đang thêm bao nhiêu GB mỗi tháng?
- Độ trễ sao chép (cho các replica): Replica có theo kịp không?

Các câu hỏi chính:

- Mức sử dụng CPU trung bình và cao điểm là bao nhiêu?
- Tỷ lệ đọc/ghi là bao nhiêu?
- Lưu trữ đang tăng, ổn định, hay giảm?
- Các read replica có đang được sử dụng không?
- Instance có được cấp phát thiếu (gây chậm) hay cấp phát dư (trả tiền cho năng lực nhàn rỗi)?

Tom đã mở các chỉ số CloudWatch cho tất cả ba dịch vụ cơ sở dữ liệu trong 30 ngày trước:

**Cụm Aurora**:

- CPU trung bình: 18% (p95: 61%; cao điểm: 84% vào các tối thứ Sáu)
- FreeableMemory: luôn trên 4GB trong số 8GB khả dụng. Không phải mối lo.
- Tỷ lệ đọc/ghi: 14:1 (nặng về đọc)
- Lưu trữ: 180GB (tăng ~5GB/tháng)
- DatabaseConnections tối đa: 312 trong số 1,000 khả dụng. Thoải mái.

**Read replicas (RDS PostgreSQL, riêng biệt từ Aurora)**:

- Đây là hai RDS read replica cũ được tạo trước khi di chuyển Aurora, vẫn đang chạy.
- Số kết nối trung bình đến mỗi cái: 2 mỗi ngày. CPU trung bình: 3%.
- FreeableMemory: 7.2GB trong số 8GB khả dụng. Các instance gần như nhàn rỗi.

"Tại sao những cái này vẫn đang chạy?" Tom hỏi.

"Tôi đã triển khai chúng rồi — ồ," Leo nói. Anh nhìn vào ngày tạo instance. "Chúng dành cho dự phòng trong quá trình di chuyển Aurora. Tôi không bao giờ xóa chúng."

Khoảnh khắc đó — khi một thứ tốn kém đã chạy trong nhiều tháng mà không được sử dụng — quen thuộc trong môi trường cloud. Leo đã tạo các replica như một lưới an toàn. Lưới an toàn chưa bao giờ được cần đến. Nhưng không ai đặt câu hỏi cho đến bây giờ.

"Tình hình connection pool ra sao?" Priya hỏi, ghé vào. "Trước khi xóa chúng, có bất kỳ thành phần ứng dụng nào vẫn đang định tuyến các lượt đọc đến đó không?"

Tom kiểm tra log kết nối. Hai kết nối mỗi ngày đến từ một script giám sát mà Priya đã viết mười bốn tháng trước — nó thăm dò tất cả các endpoint cơ sở dữ liệu đã biết để xác minh chúng đang phản hồi. Các replica chỉ được truy vấn bởi bộ kiểm tra sức khỏe, không phải bởi bất kỳ lưu lượng ứng dụng thực tế nào.

"Xóa chúng đi," Maya nói.

Các replica đã bị kết thúc. Tiết kiệm hằng tháng: $340.

**Suýt Sai Về Connection Pool**

Trong khi đang mở các chỉ số kết nối, Tom chạy một đợt kiểm tra rộng hơn trên tất cả các endpoint cơ sở dữ liệu. Điều anh tìm thấy khiến anh dừng lại.

Endpoint writer của Aurora cho thấy DatabaseConnections tối đa là 312. Thoải mái. Nhưng endpoint reader kể một câu chuyện khác.

"Endpoint reader chạm 847 kết nối vào ba tối thứ Sáu liên tiếp," Tom nói.

"Giới hạn là bao nhiêu?" Priya hỏi.

"Giới hạn cho lớp instance hiện tại của chúng ta là 1,000. Chúng ta đến 847. Đó là 85% của giới hạn."

"Và chúng ta không để ý vì chúng ta không bị báo động cho đến 90%?" Maya hỏi.

"Chúng ta hoàn toàn không bị báo động," Tom nói. "Không có cảnh báo CloudWatch nào về các kết nối endpoint reader. Tôi chỉ tìm ra điều này vì tôi đang nhìn vào các chỉ số thô."

Ở 1,000 kết nối, cơ sở dữ liệu từ chối các kết nối mới. Bất kỳ luồng ứng dụng nào cố gắng lấy một kết nối cơ sở dữ liệu vào thời điểm đó sẽ ném ra một ngoại lệ. Nếu ngoại lệ đó không được xử lý một cách linh hoạt, người dùng thấy lỗi 500.

"Chúng ta chỉ cách một sự cố tối thứ Sáu ba mươi giây," Leo nói. "Ba lần liên tiếp."

"Chúng ta đã nghĩ về điều gì xảy ra khi ngưỡng đó bị vượt qua chưa?" Priya hỏi.

"Các đối tác nhà hàng thấy đơn hàng thất bại trong giờ cao điểm bữa tối," Maya nói. "Đó không phải là một mối lo lý thuyết."

Tom thiết lập một cảnh báo CloudWatch ngay lập tức: cảnh báo ở 750 kết nối (75% giới hạn), nhắn tin khẩn ở 900 (90%). Anh cũng triển khai RDS Proxy cho endpoint reader — RDS Proxy gộp và quản lý các kết nối cơ sở dữ liệu từ tầng ứng dụng, nghĩa là năm mươi luồng ứng dụng có thể chia sẻ mười kết nối cơ sở dữ liệu. Proxy xử lý việc ghép kênh. Cơ sở dữ liệu thấy ít kết nối hơn nhiều ngay cả khi ứng dụng đang chịu tải nặng.

"Đối với Aurora Serverless v2, RDS Proxy được tính giá $0.015 mỗi ACU mỗi giờ, với mức phí tối thiểu 8 ACU mỗi proxy," Tom nói. "Nhưng nếu một lần vi phạm giới hạn kết nối gây ra dù chỉ một sự cố một phần vào tối thứ Sáu, chi phí danh tiếng cho Nimbus cao hơn nhiều bậc."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom tự hỏi, chạy con số. Reader của họ chạy trên Serverless v2, nên proxy tính phí theo mức tối thiểu 8 ACU: $0.015 × 8 × 730 = $87.60/tháng. Đó là một chi phí anh vui lòng trả.

Bạn có thể đang tự hỏi: nếu chúng ta đã tiết kiệm tiền với khả năng tự động mở rộng của Serverless v2, tại sao phải bận tâm với Reserved Instances cho tầng được cấp phát? Câu trả lời là việc mở rộng của Serverless v2 có một chi phí — bạn trả theo ACU-giờ dù bạn có lên kế hoạch cho nó hay không. Đối với các nhóm chạy cấu hình Aurora cố định, cam kết RI chuyển chi phí biến đổi thành chi phí có thể dự đoán. Đối với các nhóm chạy instance được cấp phát (không phải Serverless v2), sự phân biệt đó quan trọng đáng kể.

**RDS Reserved Instances: Cho Các Tầng Cơ Sở Dữ Liệu Được Cấp Phát**

Giống như EC2, RDS cung cấp Reserved Instances cho cam kết sử dụng.

Đối với các nhóm sử dụng cấu hình Aurora instance cố định (không phải Serverless v2), Reserved Instances có thể tiết kiệm 30-60%. Đây là cách tiếp cận RI được cấp phát hoạt động: bạn cam kết với một loại instance cụ thể trong 1 hoặc 3 năm để đổi lấy mức giảm đáng kể trên mức giá theo giờ.

Để minh họa: một instance writer db.r6g.large ở $0.26/giờ On-Demand chạy $190/tháng. Một Reserved Instance 1 năm cho cùng cái đó giảm xuống còn khoảng $108/tháng — tiết kiệm $82/tháng mỗi instance, hoặc gần $1,000 mỗi năm mỗi instance cơ sở dữ liệu.

**Aurora Serverless v2 vs Standard RI — Điểm Hòa Vốn**

Tom chạy các con số cho cấu hình Aurora cụ thể của họ. Câu hỏi: liệu khả năng tự động mở rộng của Aurora Serverless v2 có mang lại đủ lợi ích không, hay một instance được cấp phát cố định với cam kết Reserved Instance sẽ rẻ hơn?

Giá Serverless v2: $0.12 mỗi ACU-giờ. Cụm của họ mở rộng giữa 0.5 ACU (nhàn rỗi) và 16 ACU (tải cao điểm). Trong 30 ngày gần nhất, mức trung bình là 4.2 ACU.

Chi phí Serverless v2 hằng tháng: 4.2 ACU × $0.12 × 730 giờ = $368/tháng cho writer.

So sánh: một db.r6g.2xlarge cố định (mức tương đương được cấp phát ước tính của họ, được định cỡ để xử lý tải p95) với một RI 1 năm: $0.48/giờ × 0.60 (giảm giá RI) × 730 = $210/tháng.

"RI rẻ hơn," Leo nói.

"Đối với một tải cố định thì đúng," Tom nói. "Nhưng nhìn vào độ chênh. Giai đoạn lưu lượng thấp của chúng ta — 2 giờ sáng đến 7 giờ sáng, thứ Hai đến thứ Năm — trung bình 0.8 ACU. Trên một instance được cấp phát cố định, chúng ta sẽ trả cho gấp 8 lần những gì chúng ta đang dùng trong những giờ đó, chỉ ngồi nhàn rỗi."

"Và Serverless v2 thu nhỏ xuống để khớp?"

"Xuống 0.5 ACU. Chi phí nhàn rỗi chỉ là một phần nhỏ của những gì chúng ta sẽ trả cho một instance được cấp phát định cỡ cho cao điểm."

Phép tính điểm hòa vốn: Serverless v2 rẻ hơn khi tỷ lệ cao điểm/cơ sở của bạn trên khoảng 4:1. Đối với Nimbus, với cao điểm thứ Sáu ở 16 ACU và mức tối thiểu sáng thứ Hai ở 0.8 ACU — tỷ lệ 20:1 — Serverless v2 là lựa chọn đúng. Nếu lưu lượng của họ nhất quán hơn (chẳng hạn, 8 ACU ± 20%), một RI được cấp phát sẽ rẻ hơn.

"Nó không chỉ là về con số nào nhỏ hơn tháng này," Tom nói. "Nó là về mô hình nào xử lý sự tăng trưởng của chúng ta đúng cách. Nếu chúng ta tăng 50% quý sau, Serverless v2 chỉ cần mở rộng lên. Một RI được cấp phát sẽ cần định cỡ lại, và chúng ta sẽ trả cho khoảng dự phòng không sử dụng trong giai đoạn chuyển tiếp."

Tom vạch ra so sánh cả năm một cách rõ ràng để nhóm có thể theo dõi lý luận, không chỉ kết luận.

**Chi phí Aurora theo từng tháng: Serverless v2 vs RI được cấp phát**

Lựa chọn được cấp phát: một db.r6g.2xlarge với một Reserved Instance 1 năm. Chi phí: $0.48/giờ On-Demand × 0.60 (giảm giá RI) × 730 giờ = $210/tháng. Cố định, bất kể tải.

Lựa chọn Serverless v2: trả theo ACU-giờ ở $0.12. Biến đổi, theo dõi tải thực tế.

Tom kéo 30 ngày chỉ số ACU của Aurora Serverless v2 từ CloudWatch và xây dựng một phân phối:

- 2 giờ sáng–7 giờ sáng, thứ Hai–thứ Năm (lưu lượng thấp): trung bình 0.8 ACU → $0.096/giờ
- 7 giờ sáng–11 giờ sáng, các ngày trong tuần (vừa phải): trung bình 3.2 ACU → $0.384/giờ  
- 11 giờ sáng–9 giờ tối, các ngày trong tuần (giờ kinh doanh cao điểm): trung bình 5.8 ACU → $0.696/giờ
- Thứ Sáu 6 giờ tối–10 giờ tối (cao điểm bữa tối): trung bình 14.1 ACU → $1.692/giờ
- Thứ Bảy 12 giờ trưa–8 giờ tối (cuối tuần bận rộn): trung bình 9.3 ACU → $1.116/giờ
- Chủ Nhật (ngày nhẹ nhất): trung bình 2.1 ACU → $0.252/giờ

Trung bình có trọng số trên toàn bộ tháng: 4.2 ACU → $0.504/giờ → $368/tháng.

Trên một RI được cấp phát: $210/tháng. Serverless: $368/tháng. Lựa chọn được cấp phát tiết kiệm $158/tháng.

"Cái đó có vẻ hiển nhiên," Leo nói. "Tại sao chúng ta lại dùng Serverless?"

"Vì $368 là mức trung bình," Tom nói. "Nhìn vào các tối thứ Sáu."

Thứ Sáu 6–10 giờ tối: trung bình 14.1 ACU. Cho cửa sổ bốn giờ đó, Serverless tốn $1.692/giờ. Một db.r6g.2xlarge được cấp phát ở $210/tháng — năng lực tối đa của nó — là 8 vCPU. Cụm Serverless đang chạy tương đương khoảng 16 vCPU trong cửa sổ đó.

"Một instance được cấp phát định cỡ cho cao điểm thứ Sáu của chúng ta sẽ là một db.r6g.4xlarge," Tom nói. "Ở mức giá RI, đó là $0.96/giờ × 0.60 = $0.576/giờ. Hằng tháng: $420/tháng."

"Đó là nhiều hơn mức trung bình Serverless $368," Maya nói.

"Đúng. Và nếu chúng ta định cỡ instance được cấp phát cho mức cơ sở ngày thường — db.r6g.2xlarge — các tối thứ Sáu sẽ là một vấn đề. Ở tải cao điểm, chúng ta sẽ đẩy tương đương 14 ACU trên một instance 8 vCPU. Đó là bão hòa CPU."

"Vậy bạn sẽ cần định cỡ trước cho cao điểm," Priya nói.

"Với cái giá phải trả cho năng lực nhàn rỗi 160 giờ còn lại của tuần," Tom nói. "Phép tính RI được cấp phát ra rẻ hơn chỉ hoạt động khi tỷ lệ cao điểm/cơ sở của bạn thấp. Của chúng ta là 20:1. Đó chính xác là kịch bản mà Serverless v2 được thiết kế cho."

Anh đưa các con số ra cạnh nhau:

| Lựa chọn | Tháng trung bình | Đêm yên tĩnh (2 giờ sáng) | Cao điểm thứ Sáu (8 giờ tối) |
|---|---|---|---|
| Serverless v2 | $368 | $0.096/giờ | $1.692/giờ |
| RI được cấp phát (r6g.2xl) | $210 | $210/730giờ = $0.288/giờ | bị giới hạn — rủi ro bão hòa |
| RI được cấp phát (r6g.4xl) | $420 | $0.576/giờ | khoảng dự phòng thoải mái |

"Lựa chọn Serverless là $368," Tom nói. "Lựa chọn được cấp phát đã right-size là $420 — và đó là trước khi tính đến chi phí vận hành của việc giám sát và mở rộng thủ công instance được cấp phát khi các mẫu lưu lượng của chúng ta thay đổi quý sau."

"Và chi phí vận hành," Priya nói, "không phải là không có gì."

"Không. Với Serverless, chúng ta không phải nghĩ về việc định cỡ instance. Aurora xử lý nó. Với được cấp phát, mỗi quý tôi sẽ cần đánh giá lại liệu lớp instance hiện tại có còn phù hợp với lưu lượng của chúng ta không. Điều đó không tốn kém về thời gian, nhưng nó là thứ có thể xảy ra sai sót nếu chúng ta ngừng chú ý."

"Sẽ ổn thôi miễn là chúng ta không quên định cỡ lại nó," Leo nói, rồi tự dừng lại. "Mà đó chính xác là khi nó sẽ không ổn."

"Chính xác," Tom nói.

Kết luận giữ vững: Serverless v2 ở $368/tháng là lựa chọn đúng cho tỷ lệ cao điểm/cơ sở 20:1 của Nimbus và sự ưa thích của nhóm về sự đơn giản trong vận hành. RI được cấp phát chỉ hấp dẫn cho các nhóm có lưu lượng không biến đổi đáng kể — một tỷ lệ 2:1 hoặc 3:1 nơi instance được cấp phát hiếm khi nhàn rỗi.

"Điều gì sẽ khiến chúng ta chuyển sang được cấp phát?" Maya hỏi.

"Nếu mẫu lưu lượng của chúng ta phẳng ra," Tom nói. "Nếu Nimbus phát triển đến mức mà mức cơ sở lưu lượng thấp cũng cao — chẳng hạn, 8 ACU lúc 2 giờ sáng thay vì 0.8 — tỷ lệ sẽ giảm xuống 2:1 và được cấp phát sẽ hợp lý về mặt kinh tế. Đó là một vấn đề kinh doanh khác. Một vấn đề chúng ta muốn có."


Đối với Aurora với Serverless v2, Reserved Instances không trực tiếp áp dụng — Serverless v2 mở rộng động và bạn trả theo ACU-giờ. Đây là cấu hình hiện tại của Nimbus: writer và reader Aurora chính đều dùng Serverless v2. Tiết kiệm cho Nimbus đến từ chính bản chất tự động mở rộng của Serverless v2 — bạn không trả cho năng lực không sử dụng khi lưu lượng thấp.

Các nhóm vẫn chạy instance Aurora cố định nên đánh giá cam kết RI một khi loại instance đã ổn định trong ba tháng trở lên.

**DynamoDB: On-Demand vs Được Cấp Phát**

Trong Chương 9, chúng ta đã giới thiệu hai chế độ năng lực của DynamoDB: on-demand và được cấp phát.

Nimbus đã chạy DynamoDB ở chế độ on-demand từ đầu. Ở lưu lượng thấp, điều này là đúng — on-demand đắt hơn mỗi yêu cầu nhưng không có phí tối thiểu.

Bây giờ, với 18 tháng dữ liệu lưu lượng trong CloudWatch, Tom có thể thấy các mẫu.

Yêu cầu đọc trung bình: 225 mỗi giây (khoảng 19.4 triệu mỗi ngày)
Yêu cầu ghi trung bình: 60 mỗi giây (khoảng 5.2 triệu mỗi ngày)
Ngày cao điểm (thứ Sáu): 180% yêu cầu DynamoDB trung bình (ElastiCache hấp thụ ~95% lượng đọc, vì vậy DynamoDB chỉ thấy một phần nhỏ của đợt tăng 25x tổng lượng đặt hàng)

**Giá on-demand**: $1.25 mỗi triệu yêu cầu ghi, $0.25 mỗi triệu yêu cầu đọc.
**Giá được cấp phát**: $0.00065 mỗi đơn vị ghi năng lực mỗi giờ, $0.00013 mỗi đơn vị đọc năng lực mỗi giờ.

Tom tính toán điểm hòa vốn: năng lực được cấp phát trở nên rẻ hơn khi bạn sử dụng nó đủ nhất quán để không trả phí bổ sung on-demand trong các giai đoạn nhàn rỗi.

(Một lưu ý về các con số trong phần này: chúng phản ánh hóa đơn của nhóm tại thời điểm đó, và mang tính minh họa. Cuối năm 2024, AWS đã cắt giảm 50% giá on-demand của DynamoDB, điều này đã dịch chuyển điểm hòa vốn đáng kể — ngày nay, năng lực được cấp phát chỉ thắng khi mức sử dụng nhất quán cao. Luôn làm lại phép tính này với giá hiện tại.)

Với 18 tháng dữ liệu cho thấy các mẫu hằng ngày nhất quán, năng lực được cấp phát với **DynamoDB Auto Scaling** là lựa chọn đúng:

- Đặt năng lực tối thiểu ở 60% tải trung bình
- Đặt tối đa ở 250% trung bình (xử lý đợt tăng thứ Sáu)
- Auto Scaling điều chỉnh năng lực được cấp phát giữa các giới hạn này

Chi phí DynamoDB hằng tháng: giảm từ $340 (on-demand) xuống còn $230 (được cấp phát với auto scaling). Giảm 32%.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Chúng ta đã dùng on-demand từ đầu vì chúng ta không tin tưởng các mẫu lưu lượng của chính mình. Điều gì đã thay đổi?"

"Mười tám tháng dữ liệu," Tom nói. "Bây giờ chúng ta biết các mẫu của mình trông như thế nào — mức cơ sở ngày thường nhất quán, cao điểm thứ Sáu, các giai đoạn yên tĩnh Chủ Nhật. On-demand là quyết định đúng khi chúng ta không biết. Được cấp phát với Auto Scaling là quyết định đúng bây giờ khi chúng ta đã biết."

"Nhưng nếu chúng ta cấp phát quá mức," Leo hỏi, "chúng ta trả cho năng lực không sử dụng."

"Đó là rủi ro," Tom nói. "Với Auto Scaling, chúng ta đặt mức tối thiểu đủ cao để tránh bị throttle, và để AWS quản lý trong phạm vi của chúng ta."

"Và nếu mẫu lưu lượng của chúng ta thay đổi đáng kể?"

"Thì chúng ta điều chỉnh các giới hạn. Chúng ta xem xét lại điều này hằng quý."

**ElastiCache: Right-Sizing và Câu Chuyện Cảnh Báo**

Hóa đơn ElastiCache: $185/tháng. Một instance cache.r6g.large Redis ở mỗi AZ (hai node, primary + replica).

Các chỉ số CloudWatch cho thấy:

- Mức sử dụng bộ nhớ trung bình: 34%
- Cao điểm: 58%

Instance được cấp phát dư. Một cache.r6g.medium có thể xử lý tải với khoảng dự phòng.

Nhưng đến đây Tom dừng lại. Anh nhớ điều đã xảy ra ở một công ty trước đây khi anh đã right-size một cache một cách hung hăng — và anh kể cho nhóm câu chuyện đầy đủ, vì đó là loại câu chuyện cần được kể trước khi bạn thấy mình đang ở giữa nó.

Ở công ty trước của anh — một nền tảng SaaS cho báo cáo tài chính — cụm ElastiCache đã là một cache.r6g.large. Hai node, primary và replica. Mức sử dụng bộ nhớ trung bình: 31%. Cao điểm quan sát được: 54%. Kỹ sư trực đã gắn cờ nó đã làm phép tính: một cache.r6g.medium sẽ xử lý tải với khoảng dự phòng 25% trên mức cao điểm quan sát được. Tiết kiệm: $60/tháng — giá ở region và thế hệ node của công ty đó vào thời điểm đó, nhỏ hơn khoảng chênh tương đương ở Nimbus hôm nay. Thay đổi được phê duyệt vào một ngày thứ Ba.

Tháng tiếp theo, vào một tối thứ Năm lúc 11:47 tối, đợt batch quyết toán cuối tháng bắt đầu.

Đợt batch quyết toán chạy hằng quý. Nó kéo các bản ghi giao dịch của mọi tài khoản đang hoạt động trong ba tháng trước, tổng hợp chúng, tính thuế, và ghi các bản ghi quyết toán. Cache được dùng để lưu trữ trạng thái tổng hợp trung gian — tổng đang chạy của mỗi tài khoản khi đợt batch tiến hành. cache.r6g.large luôn xử lý được nó. Không ai đã nhìn vào các chỉ số đợt batch quyết toán cụ thể khi đưa ra quyết định right-sizing, vì đợt batch là hằng quý và cửa sổ quan sát đã là bốn tuần.

Trên instance medium, maxMemoryPolicy được đặt thành `allkeys-lru` — khi bộ nhớ đầy, Redis sẽ loại bỏ key ít được dùng gần đây nhất để tạo chỗ. Đó là chính sách đúng cho một cache tổng quát. Nhưng đối với đợt batch quyết toán, mọi key trong cache đều được cần đến tích cực. Khi bộ nhớ đầy ở 84% của 6.38 GB của instance medium, Redis bắt đầu loại bỏ các key. Mỗi lần loại bỏ là một cache miss. Mỗi cache miss gửi một truy vấn đến cơ sở dữ liệu PostgreSQL bên dưới để tính toán lại giá trị bị loại bỏ từ các bản ghi giao dịch thô.

Connection pool của cơ sở dữ liệu được cấu hình cho lưu lượng trạng thái ổn định, không phải tải đợt batch quyết toán. Trong vòng bốn phút sau khi các lần loại bỏ bắt đầu, cơ sở dữ liệu có 847 kết nối đang hoạt động. Giới hạn kết nối là 1,000. Ở 9 phút, các luồng ứng dụng đầu tiên bắt đầu thấy lỗi "too many connections." Ở 12 phút, ba dịch vụ chia sẻ connection pool của cơ sở dữ liệu — đợt batch quyết toán, dịch vụ báo cáo thời gian thực, và API hướng tới khách hàng — đều bị ảnh hưởng.

Kỹ sư trực leo thang vào 11:59 tối. Đợt xem xét sự cố bắt đầu vào 12:08 sáng.

Phản ứng đầu tiên: tăng thời gian chờ Lambda cho hàm đợt batch quyết toán (đợt batch quyết toán một phần dựa trên Lambda). Điều này sai. Thời gian chờ không phải là vấn đề.

Phản ứng thứ hai: thêm một hàm Lambda thứ hai để song song hóa đợt batch quyết toán. Cũng sai. Nhiều song song hơn nghĩa là nhiều truy cập cache đồng thời hơn, nghĩa là loại bỏ nhanh hơn, làm cho tình hình tệ hơn.

Phản ứng thứ ba: thu nhỏ đợt batch quyết toán để giảm áp lực cơ sở dữ liệu. Điều này giúp một chút nhưng không giải quyết nguyên nhân gốc.

Phản ứng thứ tư, vào 2:31 sáng: khôi phục cache.r6g.large. Áp lực bộ nhớ giảm ngay lập tức. Việc loại bỏ dừng lại. Connection pool của cơ sở dữ liệu được giải tỏa. Đợt batch quyết toán hoàn thành vào 4:17 sáng, trễ hơn bốn giờ.

Tổng sự cố: bốn giờ hiệu suất API suy giảm cho các khách hàng cố gắng truy cập báo cáo. Một đợt batch quyết toán hoàn chỉnh bị trễ. Thời gian kỹ thuật: khoảng 22 giờ trên năm kỹ sư. Chi phí trực tiếp ước tính: $40,000.

Khoản tiết kiệm $60/tháng đã tốn $40,000 trong một sự cố duy nhất.

"Sai lầm không phải là quyết định right-sizing," Tom nói. "Quyết định có thể biện minh được dựa trên dữ liệu sẵn có. Sai lầm là cửa sổ quan sát. Chúng tôi đã đo bốn tuần chỉ số. Đợt batch quyết toán là hằng quý. Chúng tôi đang nhìn vào khung thời gian sai."

"Vậy làm sao để tránh nó?" Maya hỏi.

"Bạn hỏi: hoạt động có rủi ro cao nhất mà cache này hỗ trợ là gì? Và bạn tìm các chỉ số cụ thể của hoạt động đó. Không phải tuần trung bình. Tuần cụ thể — hoặc tháng — hoặc quý — khi tải cao nhất. Và bạn định cỡ cho cái đó."

"Và nếu bạn không thể tìm thấy các chỉ số vì hoạt động hiếm khi xảy ra?"

"Đó là câu trả lời," Tom nói. "Nếu bạn không thể tìm thấy các chỉ số cho một kịch bản tải cao cụ thể, phản ứng đúng là chưa right-size. Đợi lần xảy ra tiếp theo, đo đạc nó kỹ lưỡng, rồi định cỡ dựa trên những gì bạn quan sát được."

Cụm ElastiCache của Nimbus có hoạt động rủi ro cao của riêng nó: cao điểm bữa tối thứ Sáu. Tom có dữ liệu đó — ba tối thứ Sáu liên tiếp đã chạm 58% mức sử dụng bộ nhớ trên r6g.large. Nếu anh chuyển sang r6g.medium và một thứ gì đó trong pipeline xử lý đơn hàng thay đổi để dùng nhiều không gian cache hơn — một tính năng mới, một chiến lược cache khác — 58% đó có thể trở thành 80%, và 80% trên một medium là vùng loại bỏ.

Anh vẫn chạy các con số. Chuyển từ r6g.large sang r6g.medium: hai node ở $0.127/giờ so với hai node ở $0.065/giờ, chạy 730 giờ mỗi tháng. Large: $185/tháng. Medium: $95/tháng. Tiết kiệm tiềm năng: $90/tháng. Anh đã kiểm thử instance medium trong staging trong hai tuần dưới tải. Bộ nhớ đạt đỉnh ở 71% — đủ gần với giới hạn để anh không thoải mái.

Rồi anh định giá phương án thay thế: giữ cache.r6g.large, nhưng mua Reserved Nodes (cam kết 1 năm). Từ On-Demand $185 xuống Reserved $120/tháng. Tiết kiệm: $65/tháng mà không thay đổi loại instance.

"$65/tháng tôi sẽ tiết kiệm trên Reserved Nodes ở cùng kích thước instance là một khoản tiết kiệm thực," Tom nói. "$90/tháng tôi sẽ tiết kiệm bằng cách chuyển sang medium là một sự tiết kiệm giả nếu nó gây rủi ro cho cao điểm bữa tối thứ Sáu. Đôi khi right-sizing sang một instance nhỏ hơn gây rủi ro xảy ra sự cố hiệu suất — Reserved Nodes cho chúng ta hầu hết khoản tiết kiệm mà không có rủi ro nào."

Anh đã mua Reserved Nodes cho r6g.large.

"$25 chênh lệch trong tiết kiệm hằng tháng," Tom nói, "không đáng giá một sự cố tối thứ Sáu."

**Lưu Giữ Backup RDS: Đánh Đổi Lưu Trữ**

Backup tự động RDS được lưu trữ trong S3 (không tính phí thêm cho lưu trữ lên đến 100% kích thước cơ sở dữ liệu của bạn). Mặc định lưu giữ là 7 ngày.

Đối với cơ sở dữ liệu Aurora 180GB của Nimbus, 7 ngày backup là phù hợp — họ đã có thể khôi phục từ backup trong cửa sổ đó khi kiểm thử.

Nhưng Tom nhận thấy: họ cũng có các snapshot thủ công từ mỗi lần triển khai quan trọng, được giữ vô thời hạn.

23 snapshot thủ công, tổng 4.1TB lưu trữ snapshot.
Chi phí: $0.021/GB/tháng cho lưu trữ backup Aurora = khoảng $87/tháng trong lưu trữ snapshot thủ công.

Họ giữ 3 snapshot thủ công cuối cùng cho mỗi môi trường (production, staging). Xóa phần còn lại — khoảng 1.1TB được giữ lại.
Tiết kiệm: $64/tháng.

"Chúng ta đang trả $64 một tháng cho bảo hiểm chúng ta chưa bao giờ sử dụng," Leo nói.

"Chúng ta đang trả cho sự yên tâm," Tom sửa lại. "Câu hỏi là: sự yên tâm đáng giá $64 một tháng đến mức nào?"

"Với kế hoạch disaster recovery đúng đắn," Priya nói, "bạn có thể có cùng sự yên tâm từ 7 ngày backup tự động và 3 snapshot thủ công."

"Đồng ý. Bây giờ."

**Biến Thể: Khi Được Cấp Phát Phản Tác Dụng**

Nếu mẫu lưu lượng của bạn nhất quán và có thể dự đoán, năng lực được cấp phát với Auto Scaling tiết kiệm 30% so với on-demand. Nhưng nếu một tính năng mới ra mắt và khối lượng ghi của bạn tăng vọt 5x qua đêm, bạn sẽ bị throttle trước khi Auto Scaling theo kịp — Auto Scaling phản ứng với lưu lượng quan sát được, nghĩa là có một độ trễ. Giữ chế độ on-demand trong các tuần xung quanh một lần ra mắt tính năng lớn là một sự đánh đổi hợp lý: chi phí cao hơn một chút, không có rủi ro bị throttle trong một giai đoạn khi bạn đang theo dõi các mẫu lưu lượng thay đổi theo thời gian thực.

Nếu bạn loại bỏ các read replica không sử dụng (như các replica PostgreSQL cũ của Nimbus), khoản tiết kiệm là ngay lập tức và rõ ràng — không có sự đánh đổi nào, vì các replica không mang lại giá trị nào. Nhưng nếu bạn bị cám dỗ loại bỏ một read replica chỉ xử lý 2% lưu lượng, hãy kiểm tra điều gì xảy ra với primary khi 2% đó không có chỗ để đi trong một cao điểm. Một số read replica tồn tại để dự phòng, không phải cho tải hiện tại.

**Tóm Tắt Tối Ưu Hóa Cơ Sở Dữ Liệu**

| Dịch vụ                                            | Trước      | Sau      | Tiết Kiệm Hằng Tháng |
|---------------------------------------------------|------------|----------|----------------------|
| Aurora (giữ Serverless v2 sau phân tích)          | $647       | $647     | $0 (mô hình đúng) |
| RDS Read Replicas (không sử dụng)                 | $340       | $0       | $340           |
| DynamoDB (On-Demand -> Được Cấp Phát + Auto Scaling) | $340       | $230     | $110           |
| ElastiCache (Reserved Nodes)                      | $185       | $120     | $65            |
| Snapshot thủ công Aurora                          | $87        | $23      | $64            |
| RDS Proxy (an toàn kết nối)                       | $0         | $88      | -$88           |
| **Tổng**                                          | **$1,599** | **$1,108** | **$491/tháng** |

$491 mỗi tháng trong tiết kiệm cơ sở dữ liệu. $5,892 mỗi năm.

Tom đặt con số này bên cạnh đợt dọn dẹp lưu trữ ($6,200/năm), các chính sách lifecycle S3 từ Chương 23 ($7,800/năm), và khoản tiết kiệm Savings Plan ($14,200/năm).

Tổng tác động tối ưu hóa đến nay: $34,092/năm.

"Đó là đường băng thực sự," Maya nói.

"Hoặc vài thử nghiệm nghiêm túc," Priya nói.

"Hoặc mười hai tháng thử nghiệm," Leo nói.

Cả ba đều đúng.

## Điểm Mạnh và Hạn Chế

**DynamoDB Được Cấp Phát với Auto Scaling**:

- Rẻ hơn on-demand cho các khối lượng công việc có thể dự đoán, nhất quán
- Auto Scaling xử lý tính biến đổi mà không cấp phát dư vĩnh viễn
- Yêu cầu theo dõi để đảm bảo các giới hạn năng lực vẫn phù hợp

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Tiết kiệm đáng kể cho các khối lượng công việc ổn định, chạy lâu dài
- Cam kết bị khóa — nếu nhu cầu của bạn thay đổi, bạn đã trả cho năng lực không sử dụng
- Không giống EC2 Standard RI, RDS RI **không thể** được bán lại trên Thị trường Reserved Instance — Thị trường chỉ dành cho EC2. Một RDS RI không sử dụng là chi phí chìm, điều này làm cho quyết định định cỡ quan trọng hơn

**Nguyên tắc chung**:

- Luôn hiểu mức sử dụng trước khi tối ưu hóa — dùng p95, không phải trung bình
- Tài nguyên không sử dụng (như các read replica cũ) là tối ưu hóa lợi nhuận cao nhất
- Right-sizing đòi hỏi xác thực trong staging trước khi áp dụng vào production, và kiểm tra các mẫu khối lượng công việc theo mùa có thể không xuất hiện trong một cửa sổ quan sát tiêu chuẩn
- Giá Reserved yêu cầu sự tự tin về tính ổn định khối lượng công việc

## Tóm Tắt

- **Kiểm toán trước**: Mở các chỉ số CloudWatch trước khi thực hiện bất kỳ thay đổi cơ sở dữ liệu nào. Dùng độ trễ p95 và CPU p95 — không phải mức trung bình. Kiểm tra FreeableMemory và các mức tối đa kết nối.
- **Xóa tài nguyên không sử dụng**: Read replica, cơ sở dữ liệu nhàn rỗi và các instance kiểm thử không còn cần thiết.
- **Theo dõi connection pool của bạn**: Đặt cảnh báo về DatabaseConnections ở 75% và 90% của giới hạn. Cân nhắc RDS Proxy để ghép kênh kết nối.
- **DynamoDB On-Demand vs Được Cấp Phát**: On-Demand cho lưu lượng không thể đoán trước; Được Cấp Phát + Auto Scaling cho các mẫu nhất quán.
- **ElastiCache right-sizing**: Kiểm thử trong staging dưới các tải cao điểm thực tế, bao gồm cao điểm theo mùa. Reserved Nodes mang lại tiết kiệm ở cùng kích thước instance khi việc thu nhỏ hung hăng mang rủi ro.
- **Quản lý snapshot RDS**: Chỉ giữ các snapshot bạn cần. Snapshot thủ công được lưu trữ vô thời hạn trừ khi bị xóa.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Domain 4, Task 4.3)*

- **Các chế độ giá DynamoDB**: On-Demand = trả theo yêu cầu (chi phí cao hơn mỗi đơn vị, không có mức tối thiểu). Được Cấp Phát = trả theo đơn vị năng lực mỗi giờ (chi phí thấp hơn mỗi đơn vị, phải phân bổ năng lực). **DynamoDB Auto Scaling** tự động điều chỉnh năng lực được cấp phát.
- **RDS Reserved Instances**: Khả dụng cho tất cả các loại engine RDS. Triển khai Multi-AZ có thể sử dụng Reserved Instances (bạn cam kết với Multi-AZ). Thời hạn 1 hoặc 3 năm.
- **ElastiCache Reserved Nodes**: Cùng mô hình cam kết như EC2 Reserved Instances. Áp dụng cho mỗi node, không phải mỗi cụm.
- **Lưu trữ snapshot RDS**: Backup tự động miễn phí lên đến 100% kích thước cơ sở dữ liệu. Snapshot thủ công tính phí mỗi GB mỗi tháng trong S3. Kịch bản kỳ thi: "giảm chi phí lưu trữ RDS" → xóa snapshot thủ công cũ.
- **DynamoDB reserved capacity**: Cũng có sẵn cho DynamoDB (cam kết với năng lực đọc/ghi cụ thể trong 1 hoặc 3 năm với giảm giá). Khác với tiêu chuẩn được cấp phát — bạn trả trước cho năng lực trên tất cả các bảng DynamoDB của bạn trong một region.
- **Aurora Serverless v2 vs được cấp phát**: Serverless v2 tự động mở rộng, lý tưởng cho các khối lượng công việc biến đổi. Được cấp phát với Reserved Instances rẻ hơn cho các khối lượng công việc ổn định, có thể dự đoán.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích khi nào bạn nên sử dụng năng lực on-demand của DynamoDB so với năng lực được cấp phát với Auto Scaling. Bạn cần thông tin gì để đưa ra quyết định này?

*(Gợi ý: Hãy nghĩ về "có thể đoán trước" có nghĩa gì theo dữ liệu lưu lượng, và rủi ro nào on-demand loại bỏ mà được cấp phát giới thiệu.)*

**Bài Tập 2 — Kịch Bản SAA-C03**

*Kịch bản*: Một công ty chạy bảng DynamoDB cho bảng xếp hạng của một trò chơi di động. Lưu lượng rất nhất quán quanh năm, ngoại trừ trong một sự kiện theo mùa được lên lịch trước nhiều tháng (một tuần mỗi quý, đạt lưu lượng gấp 10 lần bình thường khi người chơi tham gia trong ngày đầu tiên). Ưu tiên của công ty là giảm thiểu chi phí cơ sở dữ liệu trong các giai đoạn trạng thái ổn định dài, có thể dự đoán trong khi duy trì hiệu suất qua các tuần sự kiện đã biết.

Chiến lược năng lực DynamoDB nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Năng lực on-demand để xử lý các cao điểm theo mùa mà không bị throttle  
B) Năng lực được cấp phát đặt ở mức cao điểm theo mùa (luôn được cấp phát cho lưu lượng gấp 10 lần)  
C) Năng lực được cấp phát với DynamoDB Auto Scaling, với năng lực tối đa được đặt cho đỉnh theo mùa  
D) Đơn vị năng lực DynamoDB reserved trong 3 năm ở mức lưu lượng bình thường

**Gợi ý 1**: "Lưu lượng rất nhất quán ngoại trừ một cao điểm theo mùa đã lên lịch, đã biết" — chế độ nào xử lý cả hai hiệu quả? (Sức mạnh của on-demand là lưu lượng *không thể đoán trước*; lưu lượng này có thể dự đoán.)

**Gợi ý 2**: "Giảm thiểu chi phí" trong giai đoạn ngoài đỉnh có nghĩa là bạn không thể cấp phát dư cho 10x mọi lúc.

**Gợi ý 3**: DynamoDB Auto Scaling có thể mở rộng lên cho sự kiện theo mùa và thu nhỏ lại sau đó.

**Đáp án**: C

**Giải thích**: Năng lực được cấp phát với Auto Scaling mở rộng bảng dựa trên lưu lượng thực tế. Trong các giai đoạn bình thường, năng lực ở mức bình thường (chi phí thấp). Trong sự kiện theo mùa — mà ngày của nó được biết trước và lưu lượng tăng dần trong ngày đầu tiên — Auto Scaling theo dõi sự tăng lên đến mức tối đa được cấu hình (xử lý đỉnh 10x), và nhóm cũng có thể nâng mức tối thiểu trước khi bắt đầu theo lịch như khoảng dự phòng bổ sung. Sau sự kiện, năng lực thu nhỏ lại. Điều này rẻ hơn on-demand trong trạng thái ổn định chiếm phần lớn năm (on-demand tốn nhiều hơn mỗi yêu cầu) và rẻ hơn việc luôn cấp phát cho 10x.

**Tại sao không phải A?** On-demand xử lý các cao điểm mà không bị throttle, nhưng sức mạnh của nó là lưu lượng *không thể đoán trước*. Ở đây lưu lượng rất nhất quán và cao điểm được lên lịch và tăng dần — trả phí bổ sung mỗi yêu cầu của on-demand cho ~92% của năm là trạng thái ổn định mâu thuẫn với ưu tiên đã nêu là giảm thiểu chi phí trong các giai đoạn bình thường.

**Tại sao không phải B?** Cấp phát ở mức 10x vĩnh viễn có nghĩa là ~90% năng lực được cấp phát không được sử dụng trong ~92% của năm — trả tiền cho năng lực không bao giờ được dùng.

**Tại sao không phải D?** Đơn vị năng lực reserved khóa bạn ở mức lưu lượng bình thường. Trong sự kiện 10x theo mùa, bạn sẽ bị throttle vượt quá lượng reserved, hoặc bạn sẽ cần thêm on-demand bổ sung.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Task 4.3*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Nimbus đang đánh giá một tính năng mới: một dashboard analytics nhà hàng hiển thị số lượng đơn hàng thời gian thực, doanh thu mỗi giờ và thông tin nhân khẩu học khách hàng. Dữ liệu này sẽ truy vấn một cơ sở dữ liệu khoảng 200 lần mỗi phút (một truy vấn mỗi nhà phân tích mỗi lần làm mới trang, với 10 nhà phân tích).

Hiện tại dữ liệu analytics đang ở trong Athena (S3). Họ có nên xây dựng dashboard trên Athena, hay họ nên tải dữ liệu vào một cơ sở dữ liệu? Nếu là cơ sở dữ liệu, cái nào (Aurora, DynamoDB, Redshift)?

Xem xét: tần suất truy vấn, yêu cầu độ mới dữ liệu, độ phức tạp truy vấn (tổng hợp, nối), và chi phí mỗi truy vấn ở khối lượng này.

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành lựa chọn cơ sở dữ liệu cho các khối lượng công việc analytics.)*

## Cảnh Sau Tín Dụng

Tom đã trình bày tóm tắt tối ưu hóa chi phí đầy đủ cho Maya.

Ba tháng làm việc. $34,092 tiết kiệm hằng năm được xác định, hầu hết đã được thực hiện.

"Phần còn lại là gì?" Maya hỏi.

"Các tối ưu hóa tôi chưa tự tin," Tom nói. "Cấu hình Aurora có thể được right-size thêm, nhưng tôi muốn thêm một quý dữ liệu trước khi cam kết. Và có một câu hỏi về chuyển dữ liệu tôi chưa phân tích đầy đủ."

"Chi phí mạng."

"Đúng vậy. Đó là phần tiếp theo."

Maya nhìn vào các con số. "Tom, tôi muốn hiểu điều gì đó. Việc tối ưu hóa này — anh đã làm trong ba tháng. Đó là một phần đáng kể thời gian của anh."

"Khoảng 30%."

"Và anh tìm thấy khoảng $34,000 mỗi năm. Vậy tối ưu hóa tự bù đắp trong — bao lâu, vài tháng lương của anh?"

Tom nhìn cô. "Khoảng vậy."

"Và mỗi năm sau, đó là tiết kiệm thuần túy."

"Hoặc tái đầu tư thuần túy," anh nói. "Cùng hiệu ứng."

Maya gật đầu. "Đây là điều tôi muốn anh làm. Không chỉ về lưu trữ và cơ sở dữ liệu — về mọi thứ. Biến tối ưu hóa chi phí thành một chức năng liên tục trong vai trò của anh."

Tom chưa bao giờ nghe công việc của mình được mô tả theo cách này. Anh thấy điều đó vừa chính xác vừa thỏa mãn.

Trong chương tiếp theo: danh mục chi phí còn lại cuối cùng — và cái khiến hầu như mọi người bất ngờ.
