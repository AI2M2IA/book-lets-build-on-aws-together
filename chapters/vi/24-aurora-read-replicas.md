# Chương 24: Cơ Sở Dữ Liệu Phát Triển Cùng Bạn

Quá trình xem xét chi phí của Tom đã phát hiện ra điều bất ngờ trong tầng cơ sở dữ liệu.

Nimbus đang chạy RDS PostgreSQL: Multi-AZ, instance db.r6g.large. $340/tháng.

"Có vẻ cao," Tom nói. "Nhưng tôi không biết so sánh với gì."

Leo mở các chỉ số hiệu suất lên. CPU của cơ sở dữ liệu đang tăng vọt lên 85% trong giờ cao điểm tối thứ Sáu. Các truy vấn đọc đang xếp hàng chờ. Độ trễ truy vấn P95 đã tăng gấp đôi trong sáu tháng.

"Cơ sở dữ liệu là nút cổ chai," anh nói. "Lưu lượng truy cập đã tăng. Cơ sở dữ liệu chưa mở rộng theo kịp."

"Chúng ta có thể làm instance lớn hơn không?" Maya hỏi.

"Có thể," Leo nói. "Đó là mở rộng theo chiều dọc. Chúng ta chuyển từ r6g.large sang r6g.xlarge. Nhiều CPU hơn, nhiều bộ nhớ hơn. Sẽ tốn kém hơn và giúp chúng ta có thêm thời gian."

"Nhưng điều đó không giải quyết vấn đề cơ bản," Priya nói. "Cuối cùng chúng ta sẽ chạm đến instance lớn nhất và cần một cách tiếp cận khác."

"Có hai cách tiếp cận," Leo nói. "Read replicas, hoặc Aurora."

"Sự khác biệt là gì?"

Câu hỏi hay. Phần còn lại của chương này là câu trả lời.

Hãy tưởng tượng một thư viện đông đúc với một thủ thư vừa nhận sách trả lại vừa trả lời câu hỏi của độc giả. Khi thư viện trở nên phổ biến, một hàng chờ hình thành. Giải pháp: thuê thêm thủ thư — nhưng chỉ để trả lời câu hỏi. Việc nhận sách vẫn đi qua quầy gốc. Đó là read replica: năng lực bổ sung xử lý việc đọc, trong khi tất cả các lệnh ghi vẫn đi qua một nguồn có thẩm quyền duy nhất. Aurora tiến xa hơn một bước, thiết kế lại hệ thống lưu trữ để mỗi thủ thư đều dùng chung kệ sách và luôn nhìn thấy cùng một cuốn sách, không có độ trễ.

**Read Replicas: Phân Phối Lưu Lượng Đọc**

Hầu hết các ứng dụng web đọc dữ liệu thường xuyên hơn nhiều so với ghi. Một khách hàng duyệt menu thực hiện hàng chục truy vấn SELECT. Đặt một đơn hàng thực hiện một vài truy vấn INSERT/UPDATE. Tỷ lệ thường là 10:1 hoặc cao hơn.

**Read replica** là một instance RDS bổ sung nhận bản sao của tất cả các lệnh ghi từ primary và cung cấp các lệnh ghi đó cho các truy vấn SELECT.

Cách hoạt động:

1. Các lệnh ghi của ứng dụng (INSERT, UPDATE, DELETE) đi đến cơ sở dữ liệu primary
2. Primary sao chép các thay đổi đó một cách không đồng bộ đến các read replica
3. Các lệnh đọc của ứng dụng (SELECT) được phân phối trên các read replica
4. Các read replica chia sẻ tải — mỗi cái xử lý một phần lưu lượng đọc tổng thể

Kết quả: cơ sở dữ liệu primary chỉ xử lý các lệnh ghi (và tùy chọn một số lệnh đọc). Các read replica xử lý tải đọc. Với tỷ lệ đọc/ghi 10:1, việc thêm một read replica sẽ giảm khoảng một nửa tổng tải của primary.

**Giới hạn quan trọng**: Sao chép là **không đồng bộ**. Có độ trễ sao chép — thường là mili giây, nhưng có thể là giây khi tải nặng. Một lần đọc từ replica có thể thấy dữ liệu hơi cũ hơn primary. Đối với hầu hết các lần đọc (duyệt menu, xem lịch sử đơn hàng), điều này là chấp nhận được. Đối với "đơn hàng của tôi vừa được xử lý chưa?" — đọc từ primary.

**Read Replicas: Chi Tiết**

- Bạn có thể có tối đa 5 read replica cho mỗi instance RDS primary
- Read replica có thể ở cùng region hoặc khác region (cross-region replicas)
- Read replica có thể có read replica của chính chúng (chaining)
- Read replica là các endpoint riêng biệt — ứng dụng của bạn phải chuyển hướng các lệnh đọc đến endpoint của replica
- Read replica có thể được thăng cấp thành cơ sở dữ liệu độc lập (hữu ích cho DR)

Đối với Nimbus, Leo đã thêm một read replica. Anh đã cập nhật ứng dụng để:

- Các thao tác ghi → endpoint primary
- Duyệt menu, lịch sử đơn hàng → endpoint replica

CPU trên primary đã giảm từ 85% xuống 41% vào giờ cao điểm.

Tom nhìn vào chi phí: một read replica cùng loại instance có giá bằng primary. Từ $340/tháng lên $680/tháng.

"Chúng ta đã tăng gấp đôi chi phí để giảm khoảng một nửa tải," Tom nói.

"Đúng vậy. Nhưng lựa chọn thay thế là chuyển sang loại instance lớn hơn, điều đó cũng sẽ tốn kém hơn và không phân phối tải đọc."

Tom tính toán. Anh gật đầu, miễn cưỡng.

"Aurora là gì?" anh hỏi.

**Amazon Aurora: Tái Tư Duy Về Engine Cơ Sở Dữ Liệu**

Aurora là engine cơ sở dữ liệu quan hệ độc quyền của AWS, tương thích với MySQL và PostgreSQL. Nó được thiết kế từ đầu cho các khối lượng công việc trên cloud, tái tưởng tượng cách hoạt động của tầng lưu trữ trong cơ sở dữ liệu quan hệ.

Trong thiết lập RDS truyền thống (MySQL, PostgreSQL), lưu trữ và tính toán được kết hợp chặt chẽ. Engine cơ sở dữ liệu quản lý các tệp dữ liệu. Sao chép sao chép dữ liệu từ primary sang replica. Replica phải thực hiện lại mọi thao tác ghi.

Aurora tách lưu trữ ra khỏi tính toán. Nó sử dụng tầng lưu trữ phân tán, chịu lỗi, tự động sao chép dữ liệu trên ba Availability Zone trong sáu bản sao. Tầng tính toán (các instance cơ sở dữ liệu) nằm trên tầng lưu trữ này.

**Điều này thay đổi gì**:

**Read replicas**: Các Aurora replica không cần sao chép dữ liệu — chúng đã chia sẻ cùng một tầng lưu trữ. Điều này có nghĩa là:

- Lên đến 15 read replica (so với 5 cho RDS thông thường)
- Độ trễ sao chép thường dưới 100 mili giây (so với giây cho RDS khi tải nặng)
- Replica có thể được thăng cấp thành primary trong dưới 30 giây (so với vài phút)

**Failover**: Vì các replica chia sẻ lưu trữ, failover nhanh hơn nhiều — việc thăng cấp không liên quan đến chuyển dữ liệu, chỉ chuyển hướng các lệnh ghi.

**Lưu trữ**: Aurora tự động mở rộng lưu trữ theo từng 10GB, lên đến 128TB. Bạn không bao giờ cần cấp phát lưu trữ trước.

**Hiệu suất**: Aurora tuyên bố thông lượng gấp 5 lần so với MySQL tiêu chuẩn và gấp 3 lần PostgreSQL tiêu chuẩn cho các loại instance tương đương.

**Giá Aurora: Câu Hỏi Của Tom**

"Chi phí bao nhiêu?" Tom hỏi.

Giá Aurora khác với RDS:

**Giá instance**: Tương tự như giá instance RDS theo loại.

**Giá lưu trữ**: $0.10 mỗi GB mỗi tháng (bạn trả cho những gì được lưu trữ, tự động mở rộng).

**Giá I/O**: Aurora tính phí cho mỗi yêu cầu I/O (đọc/ghi vào lưu trữ). Điều này có thể đáng kể cho các khối lượng công việc nặng về ghi.

"Khoan," Tom nói. "Chúng ta đang trả riêng cho I/O?"

"Aurora Serverless v2 và Aurora I/O-Optimized thay đổi mô hình giá này," Leo nói. "Aurora I/O-Optimized không tính phí I/O nhưng có giá lưu trữ và instance cao hơn. Tốt hơn cho các khối lượng công việc nặng về I/O."

Tom nhìn vào sự đánh đổi. Đối với Nimbus, vốn nặng về đọc (nhiều truy vấn menu, ít lệnh ghi), Aurora I/O-Optimized có thể tốn kém hơn. Giá Aurora tiêu chuẩn có thể phù hợp hơn.

Đây là quyết định chi phí thực sự mà các kỹ sư cấp cao phải đưa ra: bạn cần biết các mẫu I/O của khối lượng công việc để chọn đúng.

**Aurora Serverless: Mở Rộng Mà Không Cần Lo Về Instance**

**Aurora Serverless v2** là một cấu hình tự động mở rộng năng lực tính toán dựa trên tải cơ sở dữ liệu thực tế. Thay vì chọn một kích thước instance cố định (db.r6g.large), bạn đặt năng lực tối thiểu và tối đa theo Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Mở rộng trong vài giây khi tải tăng
- Thu nhỏ xuống gần như không khi nhàn rỗi
- Chi phí: $0.12 mỗi ACU-giờ (cộng thêm lưu trữ và I/O)

Đối với các khối lượng công việc có lưu lượng biến đổi — các đợt tăng vọt vào thứ Sáu so với buổi sáng thứ Hai yên tĩnh của Nimbus — Serverless v2 giảm chi phí trong các giai đoạn ngoài giờ cao điểm và xử lý các đợt tăng vọt mà không cần cấp phát trước.

"Vì vậy trong đợt tăng vọt thứ Sáu," Leo nói, "Aurora tự động mở rộng lên. Sáng Chủ Nhật khi chúng ta gần như không có lưu lượng truy cập, nó thu nhỏ xuống mức tối thiểu."

"Và chúng ta chỉ trả cho năng lực mà chúng ta đang sử dụng," Tom nói.

"Chính xác."

Tom có biểu hiện của người vừa tìm thấy chính xác thứ họ đang tìm kiếm.

**Aurora Global Database: Đọc Đa Vùng**

**Aurora Global Database** mở rộng Aurora trên nhiều AWS region:

- **Một primary region** xử lý tất cả các lệnh ghi
- **Lên đến năm secondary region** phục vụ các lệnh đọc với độ trễ sao chép thường <1 giây
- Các secondary region có thể được thăng cấp thành primary trong dưới 1 phút (cho các kịch bản DR)

Đối với việc mở rộng toàn cầu của Nimbus, Aurora Global Database sẽ cho phép một đối tác nhà hàng ở London truy vấn menu địa phương của họ từ EU read replica, trong khi tất cả các đơn hàng (lệnh ghi) vẫn đi qua primary ở Mỹ.

**RDS vs Aurora: Khi Nào Chọn Cái Nào**

| Yếu Tố           | RDS (PostgreSQL/MySQL)              | Aurora                                                            |
|-------------------|-------------------------------------|-------------------------------------------------------------------|
| Chi phí           | Thấp hơn cho khối lượng nhỏ        | Cao hơn ở cơ bản, nhưng mở rộng tốt hơn                         |
| Tương thích       | Đầy đủ                              | Tương thích MySQL/PostgreSQL (với một số khác biệt nhỏ)           |
| Số replica tối đa | 5                                   | 15                                                                |
| Độ trễ replica    | Có thể là giây                      | Thường <100ms                                                    |
| Lưu trữ           | Cấp phát cố định                    | Tự động mở rộng đến 128TB                                        |
| Thời gian failover| 60-120 giây                         | <30 giây                                                          |
| Tùy chọn serverless| Hạn chế                            | Aurora Serverless v2                                              |
| Tốt nhất cho      | Khối lượng công việc ổn định, có thể dự đoán | Lưu lượng biến đổi, lượng đọc cao, cần failover nhanh   |

## Điểm Mạnh và Hạn Chế

**Điểm mạnh của Aurora**:

- Failover nhanh hơn đáng kể so với RDS tiêu chuẩn
- Lên đến 15 read replica với độ trễ tối thiểu
- Lưu trữ tự động mở rộng
- Serverless v2 cho các khối lượng công việc biến đổi
- Global Database cho triển khai đa vùng

**Hạn chế của Aurora**:

- Chi phí cao hơn cho các khối lượng công việc nhỏ, ổn định
- Giá I/O có thể đáng kể cho các khối lượng công việc nặng về ghi (dùng I/O-Optimized cho trường hợp này)
- Một số khác biệt tương thích MySQL/PostgreSQL nhỏ có thể yêu cầu thay đổi code
- Khởi động nguội Serverless v2 (từ gần không) có thể gây ra các đợt tăng độ trễ

## Tóm Tắt

- **Read replicas** phân phối lưu lượng đọc từ primary. Sao chép không đồng bộ — độ trễ nhỏ chấp nhận được cho hầu hết các lần đọc.
- **Aurora** tái tưởng tượng tầng lưu trữ: phân tán, chia sẻ trên các replica, tự động mở rộng.
- Aurora cung cấp: 15 read replica, độ trễ replica <100ms, failover <30 giây, lưu trữ tự động mở rộng lên 128TB.
- **Aurora Serverless v2**: tự động mở rộng năng lực tính toán dựa trên tải. Tốt cho lưu lượng biến đổi.
- **Aurora Global Database**: primary ở một region, read replica ở tối đa năm region.
- Chọn RDS cho các khối lượng công việc nhỏ hơn, ổn định, có thể dự đoán. Chọn Aurora khi bạn cần mở rộng, failover nhanh, hoặc xử lý lưu lượng biến đổi.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Hiệu Suất Cao (Domain 3, Task 3.3)*

- **Aurora replica vs RDS read replica**: Aurora replica chia sẻ lưu trữ (độ trễ gần bằng không, failover <30 giây). RDS read replica sao chép dữ liệu (có thể có độ trễ, mất vài phút để failover).
- **Aurora Serverless v2**: "tự động mở rộng năng lực cơ sở dữ liệu," "lưu lượng cơ sở dữ liệu không thể đoán trước hoặc đột biến," "thu nhỏ về không" → Aurora Serverless v2.
- **Aurora Global Database**: "cơ sở dữ liệu đa vùng," "đọc từ EU với độ trễ thấp từ primary Mỹ," "RTO < 1 phút cho failover vùng" → Aurora Global Database.
- **Thời gian failover**: Aurora < 30 giây. RDS Multi-AZ 60-120 giây. Biết cả hai.
- **Aurora I/O-Optimized**: Chi phí lưu trữ và instance cao hơn, không tính phí mỗi I/O. Dùng khi chi phí I/O chiếm ưu thế (nặng về ghi). Aurora tiêu chuẩn: chi phí lưu trữ thấp hơn, trả theo I/O. Dùng cho nặng về đọc.
- **Aurora Backtrack**: Tua lại cơ sở dữ liệu về một thời điểm cụ thể mà không cần khôi phục từ snapshot backup. Chỉ khả dụng cho Aurora tương thích MySQL. Tín hiệu kỳ thi: "vô tình xóa dữ liệu, cần khôi phục nhanh mà không cần khôi phục toàn bộ backup."

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích sự khác biệt giữa Aurora và RDS read replica tiêu chuẩn. Tại sao độ trễ sao chép của Aurora thường thấp hơn?

*(Gợi ý: Sự khác biệt chính là lưu trữ chia sẻ so với sao chép dữ liệu. Hãy nghĩ về những gì mỗi replica phải làm khi có lệnh ghi đến.)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Cơ sở dữ liệu MySQL của một nền tảng mạng xã hội đang gặp độ trễ đọc cao do lưu lượng tăng. Ứng dụng nặng về đọc (95% đọc, 5% ghi). Nhóm cần độ trễ đọc nhất quán, ngay cả trong các đợt tăng lưu lượng. Họ cần failover tự động với thời gian ngừng hoạt động tối thiểu (mục tiêu RTO < 30 giây). Khối lượng dữ liệu đang tăng không thể đoán trước.

Giải pháp cơ sở dữ liệu nào đáp ứng TỐT NHẤT các yêu cầu này?

A) RDS MySQL Multi-AZ với năm read replica  
B) Aurora MySQL với Aurora Replicas và Aurora Serverless v2  
C) RDS MySQL với loại instance lớn hơn (mở rộng theo chiều dọc)  
D) DynamoDB với DynamoDB DAX để cache đọc

**Gợi ý 1**: "RTO < 30 giây" — dịch vụ nào đạt được điều này? Kiểm tra thời gian failover cho mỗi lựa chọn.

**Gợi ý 2**: "Độ trễ đọc nhất quán trong đợt tăng" — replica của dịch vụ nào có độ trễ gần bằng không so với độ trễ có thể là giây?

**Gợi ý 3**: "Khối lượng dữ liệu tăng không thể đoán trước" — dịch vụ nào tự động mở rộng lưu trữ?

**Đáp án**: B

**Giải thích**: Aurora MySQL với Aurora Replicas cung cấp độ trễ sao chép gần bằng không (mili giây, không phải giây) để đọc hiệu suất nhất quán khi tải nặng. Aurora Serverless v2 tự động mở rộng tính toán trong các đợt tăng lưu lượng mà không cần cấp phát quá mức. Lưu trữ Aurora tự động mở rộng khi dữ liệu tăng. Failover Aurora (thăng cấp replica) hoàn thành trong dưới 30 giây — đáp ứng yêu cầu RTO.

**Tại sao không phải A?** RDS Multi-AZ failover mất 60-120 giây — không đáp ứng RTO < 30 giây. Độ trễ RDS read replica tiêu chuẩn có thể đạt đến giây khi tải nặng — khó đảm bảo độ trễ đọc "nhất quán".

**Tại sao không phải C?** Mở rộng theo chiều dọc (instance lớn hơn) tăng năng lực nhưng không phân phối tải đọc. Cơ sở dữ liệu vẫn là điểm thất bại duy nhất cho việc đọc.

**Tại sao không phải D?** DynamoDB là NoSQL — di chuyển từ MySQL sang DynamoDB yêu cầu tái kiến trúc mô hình dữ liệu và các truy vấn ứng dụng, vượt xa phạm vi của nhiệm vụ cải thiện hiệu suất này.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Hiệu Suất Cao — Task 3.3*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Nimbus đang thiết kế mở rộng toàn cầu. Họ muốn các đối tác nhà hàng ở Bờ Tây, Đức và Úc xem dữ liệu đơn hàng của họ nhanh chóng, không có độ trễ cross-region. Tuy nhiên, tất cả các lệnh ghi phải đi qua một primary US-East duy nhất để duy trì tính nhất quán.

Thiết kế kiến trúc cơ sở dữ liệu sử dụng Aurora. Bạn sẽ cấu trúc Global Database như thế nào? Điều gì xảy ra nếu primary US-East ngừng hoạt động? Bạn sẽ xử lý quá trình thăng cấp như thế nào?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành thiết kế cơ sở dữ liệu đa vùng.)*

## Cảnh Sau Tín Dụng

Leo đã di chuyển sang Aurora với Serverless v2.

Đợt tăng vọt thứ Sáu đến và đi. CPU không bao giờ vượt quá 60%. Độ trễ truy vấn vẫn nhất quán. Aurora đã tự động mở rộng lên để xử lý tải, sau đó thu nhỏ lại sau giờ cao điểm.

"Chi phí so với thứ Sáu tuần trước là bao nhiêu?" Tom hỏi vào sáng thứ Hai.

Leo mở billing explorer lên. "Thứ Sáu đạt đỉnh ở $0.89/giờ. Sáng thứ Bảy là $0.11/giờ."

Tom không nói gì.

"Thiết lập cũ là $0.47/giờ cố định bất kể tải," Leo thêm vào.

"Vậy chúng ta đã trả nhiều hơn trong đợt tăng vọt so với trước," Tom nói.

"Đúng vậy. Nhưng ít hơn đáng kể trong giờ ngoài cao điểm. Chi phí ròng trong tuần thấp hơn."

Tom tính toán. Sau đó gật đầu.

"Có một bài học ở đây," anh nói. "Câu hỏi đúng không phải là 'cái này có rẻ hơn không?' Mà là 'cái này có rẻ hơn cho mẫu sử dụng thực tế của chúng ta không?'"

"Đó," Priya nói từ phía bên kia phòng, "là bản năng của kỹ sư cấp cao."

Tom trông có vẻ hơi giật mình khi được mô tả như vậy.

Trong chương tiếp theo: khi mạng của bạn là nút cổ chai, và tại sao con đường riêng tư có thể đáng giá khoản phí.
