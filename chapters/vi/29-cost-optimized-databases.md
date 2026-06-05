# Chương 29: Hóa Đơn Cơ Sở Dữ Liệu

Kiểm toán lưu trữ của Tom đã xác định $8,800 lãng phí. Anh chuyển sang các mục hóa đơn cơ sở dữ liệu.

RDS Aurora: $647/tháng.
RDS PostgreSQL (read replicas): $340/tháng.
ElastiCache: $183/tháng.

Tổng tầng cơ sở dữ liệu: $1,170/tháng.

"Để tôi hiểu từng cái trước khi quyết định bất cứ điều gì," anh nói. "Vì cơ sở dữ liệu không phải nơi tiết kiệm tiền bằng cách cắt góc."

Điều này khôn ngoan. Cấu hình cơ sở dữ liệu sai gây ra mất dữ liệu hoặc suy giảm hiệu suất tốn kém hơn nhiều so với khoản tiết kiệm.

Hãy nghĩ về cơ sở dữ liệu như động cơ của một chiếc xe. Bạn có thể tiết kiệm tiền cho xe bằng cách chuyển sang nhiên liệu rẻ hơn, điều chỉnh áp suất lốp và loại bỏ trọng lượng không cần thiết khỏi cốp. Nhưng nếu bạn cố tiết kiệm tiền bằng cách bỏ qua thay dầu, bạn có nguy cơ bó động cơ — và một động cơ bị bó tốn kém hơn nhiều so với bất kỳ khoản tiết kiệm nhiên liệu nào. Cuộc kiểm toán mà Tom sắp thực hiện tuân theo cùng logic: tìm lãng phí trong cốp và thùng nhiên liệu, và để yên động cơ cho đến khi bạn biết chính xác bạn đang làm gì.

**Hiểu Khối Lượng Công Việc Cơ Sở Dữ Liệu Của Bạn Trước**

Tối ưu hóa chi phí trong cơ sở dữ liệu đòi hỏi hiểu khối lượng công việc trước khi chạm vào bất cứ thứ gì.

Các câu hỏi chính:

- Mức sử dụng CPU trung bình và cao điểm là bao nhiêu?
- Tỷ lệ đọc/ghi là bao nhiêu?
- Lưu trữ đang tăng, ổn định, hay giảm?
- Các read replica có đang được sử dụng không?
- Instance có được cấp phát thiếu (gây chậm) hay cấp phát dư (trả tiền cho năng lực nhàn rỗi)?

Tom đã mở các chỉ số CloudWatch cho tất cả ba dịch vụ cơ sở dữ liệu trong 30 ngày trước:

**Cụm Aurora**:

- CPU trung bình: 18% (cao điểm: 67% vào tối thứ Sáu)
- Tỷ lệ đọc/ghi: 14:1 (nặng về đọc)
- Lưu trữ: 180GB (tăng ~5GB/tháng)

**Read replicas (RDS PostgreSQL, riêng biệt từ Aurora)**:

- Đây là hai RDS read replica cũ được tạo trước khi di chuyển Aurora, vẫn đang chạy.
- Số kết nối trung bình đến mỗi cái: 2 mỗi ngày. CPU trung bình: 3%.

"Tại sao những cái này vẫn đang chạy?" Tom hỏi.

Leo nhìn vào ngày tạo instance. "Chúng được tạo trong quá trình di chuyển Aurora để dự phòng. Chúng ta quên xóa chúng."

Khoảnh khắc đó — khi một thứ tốn kém đã chạy trong nhiều tháng mà không được sử dụng — quen thuộc trong môi trường cloud.

Các replica đã bị kết thúc. Tiết kiệm hàng tháng: $340.

**RDS Reserved Instances: Phiên Bản Cơ Sở Dữ Liệu**

Giống như EC2, RDS cung cấp Reserved Instances cho cam kết sử dụng.

Đối với Aurora với Serverless v2, Reserved Instances không trực tiếp áp dụng — Serverless v2 mở rộng động và bạn trả theo ACU-giờ. Tuy nhiên, nếu bạn đang sử dụng cấu hình Aurora instance cố định (không phải Serverless), Reserved Instances có thể tiết kiệm 30-60%.

Tom đã xem xét các instance Aurora được cấp phát (writer và một reader):

- Instance writer: db.r6g.large, On-Demand = $0.26/giờ = $190/tháng
- Instance reader: db.r6g.large, On-Demand = $0.26/giờ = $190/tháng

Reserved Instances 1 năm cho cả hai: ~$108/tháng mỗi cái. Tiết kiệm hàng năm: $984.

"Khoan," Leo nói. "Chúng ta đã di chuyển sang Aurora Serverless v2 trong Chương 24. Tại sao Tom lại nhìn vào On-Demand cho các instance được cấp phát?"

Phát hiện tốt. Hãy chính xác: Aurora writer chính của Nimbus sử dụng Serverless v2. Reader (cho read replicas) cũng sử dụng Serverless v2. Serverless v2 không có Reserved Instances truyền thống — bạn trả theo ACU-giờ.

Đối với các nhóm chạy instance Aurora cố định (không phải Serverless), Reserved Instances là tiết kiệm đáng kể. Đối với các khối lượng công việc Serverless v2, tiết kiệm đến từ bản chất tự động mở rộng của dịch vụ — bạn không trả cho năng lực không sử dụng.

**DynamoDB: On-Demand vs Được Cấp Phát**

Trong Chương 9, chúng ta đã giới thiệu hai chế độ năng lực của DynamoDB: on-demand và được cấp phát.

Nimbus đã chạy DynamoDB ở chế độ on-demand từ đầu. Ở lưu lượng thấp, điều này là đúng — on-demand đắt hơn mỗi yêu cầu nhưng không có phí tối thiểu.

Bây giờ, với 18 tháng dữ liệu lưu lượng trong CloudWatch, Tom có thể thấy các mẫu.

Đơn vị đọc năng lực trung bình mỗi ngày: 45,000
Đơn vị ghi năng lực trung bình mỗi ngày: 12,000
Ngày cao điểm (thứ Sáu): 180% yêu cầu DynamoDB trung bình (ElastiCache hấp thụ ~95% lượng đọc, vì vậy DynamoDB chỉ thấy một phần nhỏ của đợt tăng 25x tổng lượng đặt hàng)

**Giá on-demand**: $1.25 mỗi triệu yêu cầu ghi, $0.25 mỗi triệu yêu cầu đọc.
**Giá được cấp phát**: $0.00065 mỗi đơn vị ghi năng lực mỗi giờ, $0.00013 mỗi đơn vị đọc năng lực mỗi giờ.

Tom tính toán điểm hòa vốn: năng lực được cấp phát trở nên rẻ hơn khi bạn sử dụng nó đủ nhất quán để không trả phí bổ sung on-demand trong các giai đoạn nhàn rỗi.

Với 18 tháng dữ liệu cho thấy các mẫu hằng ngày nhất quán, năng lực được cấp phát với **DynamoDB Auto Scaling** là lựa chọn đúng:

- Đặt năng lực tối thiểu ở 60% tải trung bình
- Đặt tối đa ở 250% trung bình (xử lý đợt tăng thứ Sáu)
- Auto Scaling điều chỉnh năng lực được cấp phát giữa các giới hạn này

Chi phí DynamoDB hàng tháng: giảm từ $340 (on-demand) xuống còn $230 (được cấp phát với auto scaling). Giảm 32%.

"Nhưng nếu chúng ta cấp phát quá mức," Leo hỏi, "chúng ta trả cho năng lực không sử dụng."

"Đó là rủi ro," Tom nói. "Với Auto Scaling, chúng ta đặt mức tối thiểu đủ cao để tránh bị throttle, và để AWS quản lý trong phạm vi của chúng ta."

"Và nếu mẫu lưu lượng của chúng ta thay đổi đáng kể?"

"Thì chúng ta điều chỉnh các giới hạn. Chúng ta xem xét lại điều này hàng quý."

**ElastiCache: Right-Sizing và Reserved Nodes**

Hóa đơn ElastiCache: $183/tháng. Một instance cache.r6g.large Redis ở mỗi AZ (hai node, primary + replica).

Các chỉ số CloudWatch cho thấy:

- Mức sử dụng bộ nhớ trung bình: 34%
- Cao điểm: 58%

Instance được cấp phát dư. Một cache.r6g.medium có thể xử lý tải với khoảng dự phòng.

Chuyển từ r6g.large (2 node × $0.127/giờ) sang r6g.medium (2 node × $0.065/giờ):

- Tiết kiệm hàng tháng: $113 → khoan.

Thực ra tính toán: large = 2 × $0.127 × 730 giờ = $185/tháng. Medium = 2 × $0.065 × 730 = $95/tháng. Tiết kiệm: $90/tháng.

Tom đã kiểm thử instance medium trong staging trong hai tuần dưới tải. Bộ nhớ đạt đỉnh ở 71%. Đủ gần với giới hạn để anh không thoải mái.

Anh thử cache.r6g.large nhưng với Reserved Nodes (cam kết 1 năm): từ On-Demand $185 xuống Reserved $120/tháng. Tiết kiệm: $65/tháng mà không cần thay đổi loại instance.

"Đôi khi right-sizing sang instance nhỏ hơn có rủi ro xảy ra sự cố hiệu suất," anh nói. "Reserved Nodes cho chúng ta cùng khoản tiết kiệm với ít rủi ro hơn."

**Lưu Giữ Backup RDS: Đánh Đổi Lưu Trữ**

Backup tự động RDS được lưu trữ trong S3 (không tính phí thêm cho lưu trữ lên đến 100% kích thước cơ sở dữ liệu của bạn). Mặc định lưu giữ là 7 ngày.

Đối với cơ sở dữ liệu Aurora 180GB của Nimbus, 7 ngày backup là phù hợp — họ đã có thể khôi phục từ backup trong cửa sổ đó khi kiểm thử.

Nhưng Tom nhận thấy: họ cũng có các snapshot thủ công từ mỗi lần triển khai quan trọng, được giữ vô thời hạn.

23 snapshot thủ công, tổng 4.1TB lưu trữ snapshot.
Chi phí: $0.095/GB/tháng cho backup Aurora = $389/tháng trong lưu trữ snapshot thủ công.

Họ giữ 3 snapshot thủ công cuối cùng cho mỗi môi trường (production, staging). Xóa phần còn lại.
Tiết kiệm: $350/tháng.

"Chúng ta đang trả $350 một tháng cho bảo hiểm chúng ta chưa bao giờ sử dụng," Leo nói.

"Chúng ta đang trả cho sự yên tâm," Tom sửa lại. "Câu hỏi là: sự yên tâm đáng giá $350 một tháng không?"

"Với kế hoạch disaster recovery đúng đắn," Priya nói, "bạn có thể có cùng sự yên tâm từ 7 ngày backup tự động và 3 snapshot thủ công."

"Đồng ý. Bây giờ."

**Tóm Tắt Tối Ưu Hóa Cơ Sở Dữ Liệu**

| Dịch Vụ                                               | Trước      | Sau      | Tiết Kiệm Hàng Tháng |
|-------------------------------------------------------|------------|----------|----------------------|
| RDS Read Replicas (không sử dụng)                     | $340       | $0       | $340                 |
| Aurora (Reserved Instances)                           | $190       | $120     | $70                  |
| DynamoDB (On-Demand → Được Cấp Phát + Auto Scaling)   | $340       | $230     | $110                 |
| ElastiCache (Reserved Nodes)                          | $185       | $120     | $65                  |
| Snapshot thủ công Aurora                              | $389       | $39      | $350                 |
| **Tổng**                                              | **$1,444** | **$509** | **$935/tháng**       |

$935 mỗi tháng trong tiết kiệm cơ sở dữ liệu. $11,220 mỗi năm.

Tom đặt con số này bên cạnh tiết kiệm lưu trữ ($6,200/năm) và tiết kiệm Savings Plan ($14,200/năm).

Tổng tác động tối ưu hóa: $31,620/năm.

"Đó là ba kỹ sư cấp thấp," Maya nói.

"Hoặc một kỹ sư cấp cao," Priya nói.

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
- Thị trường RI cho phép bán RDS RI không sử dụng (không giống Convertible, không thể bán)

**Nguyên tắc chung**:

- Luôn hiểu mức sử dụng trước khi tối ưu hóa
- Tài nguyên không sử dụng (như các read replica cũ) là tối ưu hóa lợi nhuận cao nhất
- Right-sizing đòi hỏi xác thực trong staging trước khi áp dụng vào production
- Giá Reserved yêu cầu sự tự tin về tính ổn định khối lượng công việc

## Tóm Tắt

- **Kiểm toán trước**: Mở các chỉ số CloudWatch trước khi thực hiện bất kỳ thay đổi cơ sở dữ liệu nào.
- **Xóa tài nguyên không sử dụng**: Read replica, cơ sở dữ liệu nhàn rỗi và các instance kiểm thử không còn cần thiết.
- **DynamoDB On-Demand vs Được Cấp Phát**: On-Demand cho lưu lượng không thể đoán trước; Được Cấp Phát + Auto Scaling cho các mẫu nhất quán.
- **ElastiCache Reserved Nodes**: Giống Reserved Instances EC2 cho Redis/Memcached. Tiết kiệm 30-50% cho các khối lượng công việc ổn định.
- **Quản lý snapshot RDS**: Chỉ giữ các snapshot bạn cần. Snapshot thủ công được lưu trữ vô thời hạn trừ khi bị xóa.
- **Right-size cẩn thận**: Right-sizing cơ sở dữ liệu có rủi ro sự cố hiệu suất. Kiểm thử trong staging, xác thực dưới tải.

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

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Một công ty chạy bảng DynamoDB cho bảng xếp hạng trò chơi di động. Lưu lượng đạt đỉnh nặng trong một sự kiện theo mùa (một tuần mỗi quý, lưu lượng gấp 10 lần bình thường) nhưng ngoài ra rất nhất quán. Ngoài sự kiện theo mùa, công ty muốn giảm thiểu chi phí cơ sở dữ liệu trong khi duy trì hiệu suất.

Chiến lược năng lực DynamoDB nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Năng lực on-demand để xử lý các đợt tăng theo mùa mà không bị throttle  
B) Năng lực được cấp phát đặt ở mức cao điểm theo mùa (luôn được cấp phát cho lưu lượng gấp 10 lần)  
C) Năng lực được cấp phát với DynamoDB Auto Scaling, với năng lực tối đa được đặt cho đỉnh theo mùa  
D) Đơn vị năng lực DynamoDB reserved trong 3 năm ở mức lưu lượng bình thường

**Gợi ý 1**: "Lưu lượng nhất quán ngoại trừ các đợt tăng theo mùa đã biết" — chế độ nào xử lý cả hai hiệu quả?

**Gợi ý 2**: "Giảm thiểu chi phí" trong giai đoạn ngoài đỉnh có nghĩa là bạn không thể cấp phát dư cho 10x mọi lúc.

**Gợi ý 3**: DynamoDB Auto Scaling có thể mở rộng lên cho sự kiện theo mùa và thu nhỏ lại sau đó.

**Đáp án**: C

**Giải thích**: Năng lực được cấp phát với Auto Scaling mở rộng bảng dựa trên lưu lượng thực tế. Trong các giai đoạn bình thường, năng lực ở mức bình thường (chi phí thấp). Trong sự kiện theo mùa, Auto Scaling phát hiện tăng lưu lượng và mở rộng lên mức tối đa được cấu hình (xử lý đỉnh 10x). Sau sự kiện, nó thu nhỏ lại. Điều này rẻ hơn on-demand trong các giai đoạn bình thường (on-demand tốn nhiều hơn mỗi yêu cầu) và rẻ hơn việc luôn cấp phát cho 10x.

**Tại sao không phải A?** On-demand xử lý các đỉnh mà không bị throttle nhưng tốn nhiều hơn mỗi yêu cầu so với được cấp phát trong lưu lượng bình thường, có thể đoán trước.

**Tại sao không phải B?** Cấp phát ở mức 10x vĩnh viễn có nghĩa là 75% năng lực được cấp phát không được sử dụng 75% năm — trả tiền cho năng lực không bao giờ được dùng.

**Tại sao không phải D?** Đơn vị năng lực reserved khóa bạn ở mức lưu lượng bình thường. Trong sự kiện 10x theo mùa, bạn sẽ bị throttle vượt quá lượng reserved, hoặc bạn sẽ cần thêm on-demand bổ sung.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Task 4.3*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Nimbus đang đánh giá một tính năng mới: dashboard analytics nhà hàng hiển thị số lượng đơn hàng thời gian thực, doanh thu mỗi giờ và thông tin khách hàng. Dữ liệu này sẽ truy vấn cơ sở dữ liệu khoảng 200 lần mỗi phút (một truy vấn mỗi nhà phân tích mỗi lần làm mới trang, với 10 nhà phân tích).

Hiện tại dữ liệu analytics đang ở trong Athena (S3). Họ có nên xây dựng dashboard trên Athena, hay họ nên tải dữ liệu vào cơ sở dữ liệu? Nếu là cơ sở dữ liệu, cái nào (Aurora, DynamoDB, Redshift)?

Xem xét: tần suất truy vấn, yêu cầu độ mới dữ liệu, độ phức tạp truy vấn (tổng hợp, nối), và chi phí mỗi truy vấn ở khối lượng này.

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành lựa chọn cơ sở dữ liệu cho các khối lượng công việc analytics.)*

## Cảnh Sau Tín Dụng

Tom đã trình bày tóm tắt tối ưu hóa chi phí đầy đủ cho Maya.

Ba tháng làm việc. $31,620 tiết kiệm hàng năm được xác định. $26,400 trong các thay đổi đã được thực hiện.

"$5,220 còn lại là gì?" Maya hỏi.

"Các tối ưu hóa tôi chưa tự tin," Tom nói. "Cấu hình Aurora có thể được right-sized thêm, nhưng tôi muốn thêm một quý dữ liệu trước khi cam kết. Và có một câu hỏi về chuyển dữ liệu tôi chưa phân tích đầy đủ."

"Chi phí mạng."

"Đúng vậy. Đó là phần tiếp theo."

Maya nhìn vào các con số. "Tom, tôi muốn hiểu điều gì đó. Việc tối ưu hóa này — anh đã làm trong ba tháng. Đó là một phần đáng kể thời gian của anh."

"Khoảng 30%."

"Và anh tiết kiệm $26,400 mỗi năm. Vì vậy, tối ưu hóa tự bù đắp trong — bao lâu, bốn tháng lương của anh?"

Tom nhìn cô. "Khoảng vậy."

"Và mỗi năm sau, đó là tiết kiệm thuần túy."

"Hoặc tái đầu tư thuần túy," anh nói. "Cùng hiệu ứng."

Maya gật đầu. "Đây là điều tôi muốn anh làm. Không chỉ về lưu trữ và cơ sở dữ liệu — về mọi thứ. Biến tối ưu hóa chi phí thành chức năng liên tục trong vai trò của anh."

Tom chưa bao giờ nghe công việc của mình được mô tả theo cách này. Anh thấy điều đó vừa chính xác vừa thỏa mãn.

Trong chương tiếp theo: danh mục chi phí còn lại — và cái bất ngờ hầu như mọi người.
