# Chương 28: Sự Ngạc Nhiên Về Hóa Đơn Lưu Trữ

Tom đã nộp Savings Plan cho EC2. Dòng tiếp theo trên hóa đơn là S3: $198/tháng (giảm từ $847 sau những thay đổi chính sách lifecycle từ Chương 23).

Rồi anh nhìn vào EBS: $440/tháng.

"Có vẻ cao," anh nói.

Leo mở danh sách volume EBS lên. Có 47 volume EBS được gắn vào các instance. Và sau đó có thêm 23 volume không được gắn vào bất kỳ instance nào.

"23 volume này," Tom nói. "Chúng là gì?"

Leo tra cứu chúng. Tất cả đều bị tách ra — không có instance nào hiện đang sử dụng chúng. Hầu hết đã được tạo từ snapshot để debug. Một số là từ các instance đã bị kết thúc nhưng volume của chúng chưa bị xóa.

"Chúng ta đang trả $0.10 mỗi GB mỗi tháng cho lưu trữ mà không ai đang đọc," Leo nói.

Tom nhìn vào tổng: 2.3 TB volume không được gắn.

"Hai trăm ba mươi đô la mỗi tháng cho lưu trữ chúng ta không sử dụng," Tom nói. "Điều này đã diễn ra bao lâu rồi?"

Leo kiểm tra ngày tạo. Volume cũ nhất là từ 16 tháng trước.

"Ba nghìn sáu trăm tám mươi đô la," Tom nói nhẹ nhàng. "Chúng ta đã chi ba nghìn sáu trăm đô la cho lưu trữ mà không ai truy cập."

Anh đã xóa các volume không được gắn. Tháng tiếp theo, hóa đơn EBS giảm xuống còn $210.

**Kiểm Toán Chi Phí Lưu Trữ**

Khám phá EBS của Tom là triệu chứng của một mẫu rộng hơn: chi phí lưu trữ tích lũy vô hình. Không giống như tính toán (bạn nhận thấy khi 47 máy chủ đang chạy), lưu trữ tích lũy lặng lẽ.

Hãy nghĩ như thuê kho lưu trữ. Thuê một kho là rõ ràng trên bảng sao kê thẻ tín dụng. Nhưng nếu bạn thuê kho thứ hai cho một dự án, sau đó kho thứ ba cho một số đồ nội thất cũ, và bạn không bao giờ quay lại kiểm tra bên trong — phí tiếp tục xuất hiện mỗi tháng, lặng lẽ, lâu sau khi bạn đã quên những gì bạn đang lưu trữ. Lưu trữ cloud hoạt động theo cùng cách: các byte nằm ở đó, hóa đơn đến, và không ai đặt câu hỏi cho đến khi ai đó cuối cùng mở cửa ra và thấy đầy những thứ không ai cần nữa.

Kiểm toán chi phí lưu trữ kỹ lưỡng xem xét:

**S3**:

- Có chính sách lifecycle cho tất cả các bucket không?
- Có snapshot cũ (RDS, EBS) đang nằm trong S3 không?
- Intelligent-Tiering có phù hợp cho bất kỳ bucket nào có mẫu truy cập không chắc chắn không?
- Có các object được phiên bản tạo nhiều bản sao không bao giờ được truy cập không?

**EBS**:

- Có volume nào không được gắn (không có instance đang chạy nào sử dụng chúng) không?
- Các volume gp3 có được cấu hình đúng không? (Các volume gp3 mặc định có thể có thông lượng/IOPS được cấp phát dư không cần thiết)
- Có snapshot cũ hơn mức cần thiết đang được lưu giữ không?

**RDS**:

- Các khoảng thời gian lưu giữ backup tự động có được đặt phù hợp không? (Dài hơn = chi phí lưu trữ nhiều hơn)
- Có snapshot thủ công từ các instance cũ vẫn đang nằm xung quanh không?
- Có read replica từ các quá trình di chuyển cơ sở dữ liệu vẫn đang chạy không?

**EFS**:

- Volume EFS có ở đúng storage class không? (Standard vs Infrequent Access)

**S3 Versioning: Chi Phí Ẩn**

Trong Chương 5, chúng ta đã đề cập rằng S3 versioning giữ mọi phiên bản trước của một object. Điều này xuất sắc cho sự an toàn. Nó tệ cho chi phí nếu bạn cũng không có các quy tắc lifecycle cho các phiên bản.

Khi versioning được bật trên một bucket, mỗi khi bạn ghi đè một object, phiên bản cũ được giữ lại. Theo thời gian:

- Ngày 1: Ảnh được tải lên (v1)
- Ngày 30: Ảnh được cập nhật (v1 bây giờ là phiên bản "không hiện tại," v2 là hiện tại)
- Ngày 60: Ảnh được cập nhật lại (v1 và v2 không hiện tại, v3 là hiện tại)
- Ngày 365: v1, v2... v12 đều được lưu trữ. Bạn đang trả cho 12 bản sao của một ảnh.

Giải pháp: quy tắc lifecycle cho các phiên bản không hiện tại.

```
Hết hạn các phiên bản không hiện tại sau 30 ngày
Xóa các tải lên multipart thất bại sau 7 ngày
```

Tom đã áp dụng các quy tắc này cho tất cả các bucket có versioning. Tháng tiếp theo, lưu trữ S3 giảm 18%.

**EBS: Right-Sizing và Nâng Cấp gp3**

Giá volume EBS có hai thành phần:

1. Lưu trữ (mỗi GB mỗi tháng)
2. IOPS và thông lượng được cấp phát (nếu bạn đang dùng io1/io2 hoặc trả thêm cho hiệu suất gp3)

**Cơ hội gp3**: Trong Chương 6, chúng ta đã lưu ý rằng gp3 là mặc định hiện tại và rẻ hơn gp2. Nếu Nimbus có các volume được tạo trước khi gp3 khả dụng (nó ra mắt vào tháng 12 năm 2020), những volume đó có thể vẫn là gp2.

Tom đã tìm thấy 12 volume gp2 tổng cộng 1,200 GB. Chuyển sang gp3 đã tiết kiệm 20% ngay lập tức cho những volume đó, không có suy giảm hiệu suất.

**IOPS và thông lượng**: Volume gp3 đi kèm với 3,000 IOPS và 125 MB/s thông lượng theo mặc định, không tính phí thêm. Bạn có thể cấp phát thêm nếu khối lượng công việc của bạn cần. Xem xét liệu hiệu suất được cấp phát có thực sự được sử dụng không.

Tom đã tìm thấy hai volume gp3 với 10,000 IOPS được cấp phát. Anh kiểm tra các chỉ số CloudWatch: IOPS trung bình thực tế là 1,200. Anh đã giảm IOPS được cấp phát xuống 4,000 (một khoảng dự phòng an toàn trên mức thực tế cao nhất).

Tiết kiệm hàng tháng: $68.

**Vòng đời snapshot**: EBS snapshot là tăng dần (mỗi snapshot chỉ lưu những thay đổi kể từ snapshot trước), nhưng chúng tích lũy. Các snapshot cũ từ những ngày đầu của Nimbus vẫn tồn tại. Tom giữ 30 ngày snapshot hằng ngày và xóa phần còn lại.

**EFS: Các Storage Class**

Amazon EFS có các storage class riêng:

- **EFS Standard**: Cho các tệp được truy cập thường xuyên. Chi phí cao hơn.
- **EFS Infrequent Access (IA)**: Cho các tệp không được truy cập trong 30 ngày. Rẻ hơn 92% so với Standard.
- **EFS Archive**: Cho các tệp không được truy cập trong 90 ngày. Còn rẻ hơn IA.

**EFS Intelligent-Tiering**: Tự động di chuyển các tệp giữa các storage class dựa trên mẫu truy cập.

Tom đã bật Intelligent-Tiering trên volume EFS. Sáu tuần sau, 68% tệp đã chuyển sang Infrequent Access. Chi phí EFS hàng tháng giảm từ $89 xuống còn $31.

**Thẻ Phân Bổ Chi Phí S3: Tìm Ai Đang Chi Gì**

Khi Nimbus phát triển, nhiều nhóm đang lưu trữ dữ liệu trong S3. Nhóm analytics có bucket riêng của họ. Nhóm kỹ thuật có bucket của họ. Nhóm dữ liệu nhà hàng có bucket của họ.

Hóa đơn chỉ hiển thị "S3: $198." Không có phân tích chi tiết theo nhóm.

**Thẻ phân bổ chi phí** cho phép bạn gắn thẻ tài nguyên AWS với metadata kinh doanh (nhóm, dự án, môi trường) và sau đó xem chi phí được phân tích theo những thẻ đó trong AWS Cost Explorer.

Tom đã thêm thẻ vào tất cả các bucket S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Sau một chu kỳ thanh toán có gắn thẻ, anh có thể thấy: "Data lake của nhóm analytics là $74/tháng. Backup kỹ thuật là $43/tháng. Dữ liệu nhà hàng là $81/tháng."

Bây giờ anh có thể có cuộc trò chuyện ngân sách với từng nhóm thay vì chỉ nhìn vào một con số tổng hợp.

**AWS Cost Explorer và AWS Budgets**

**AWS Cost Explorer**: Trực quan hóa chi phí lịch sử và dự báo theo dịch vụ, region, thẻ và loại sử dụng. Thiết yếu để hiểu tiền đi đâu.

**AWS Budgets**: Đặt cảnh báo khi chi phí vượt quá (hoặc được dự báo sẽ vượt quá) ngưỡng. Bạn có thể lập ngân sách theo dịch vụ, region, thẻ hoặc tài khoản.

Tom đã thiết lập ba ngân sách:

1. Hóa đơn tháng tổng cộng: Cảnh báo ở 90% lượng ngân sách
2. EC2 On-Demand: Cảnh báo nếu chi tiêu On-Demand vượt $500/tháng (tín hiệu thiếu hụt Savings Plan)
3. Chuyển dữ liệu ra: Cảnh báo ở $200/tháng (chi phí chuyển dữ liệu có thể tăng vọt bất ngờ)

Budgets đã gửi cảnh báo đến kênh Slack. Nhóm thấy khi họ đang tiếp cận giới hạn, thay vì phát hiện ra trong hóa đơn hàng tháng.

**Chi Phí Của Sự Lơ Là**

Tom đã xây dựng một bảng tính. Anh tính toán bao nhiêu Nimbus đã chi cho:

- Volume EBS không được gắn (16 tháng): $3,680
- Snapshot S3 cũ (được phát hiện và xóa): $890
- IOPS được cấp phát không cần thiết: $816
- Tiết kiệm từ việc chuyển gp2 sang gp3 (dự kiến, nếu thực hiện sớm hơn): $2,160 trong 18 tháng
- Phiên bản S3 không hiện tại tích lũy: $1,340

Tổng lãng phí được xác định: khoảng $8,800 trong 18 tháng.

"Tám nghìn tám trăm đô la," Maya nói.

"Từ sự lơ là," Tom nói. "Không phải từ việc đưa ra quyết định kiến trúc sai. Từ việc không dọn dẹp."

"Giải pháp hệ thống là gì?"

"Kiểm toán thường xuyên," Priya nói. "Đánh giá Cost Explorer hằng tháng. AWS Trusted Advisor tự động gắn cờ các volume không được gắn và tài nguyên nhàn rỗi. Tự động hóa việc dọn dẹp các mẫu lãng phí đã biết: xóa snapshot cũ hơn N ngày, cảnh báo về volume EBS không được gắn, hết hạn phiên bản S3 cũ."

"Và," Tom thêm vào, "biến vệ sinh chi phí thành một phần của quy trình triển khai. Khi kỹ sư kết thúc một instance EC2, volume EBS sẽ tự động bị xóa trừ khi họ chọn không làm vậy."

## Điểm Mạnh và Hạn Chế

**Kỷ luật tối ưu hóa chi phí**:

- Đánh giá thường xuyên phát hiện lãng phí tích lũy trước khi nó trở nên đáng kể
- Gắn thẻ cho phép trách nhiệm giải trình — các nhóm thấy chi phí của chính họ
- Cảnh báo tự động ngăn ngừa ngạc nhiên thanh toán
- Chính sách lifecycle và right-sizing thường là tiết kiệm đặt một lần

**Nơi phức tạp hơn**:

- Xác định lãng phí trên một tài khoản lớn với nhiều nhóm yêu cầu công cụ tập trung
- Một số lãng phí là có chủ ý (giữ thêm snapshot "phòng khi cần") — đánh đổi chi phí/rủi ro là một phán đoán
- Việc chuyển gp3 yêu cầu xác thực cẩn thận (IOPS và thông lượng mặc định có thể khác với hành vi gp2 trong một số trường hợp cạnh)
- Thẻ phân bổ chi phí yêu cầu kỷ luật trên tất cả các nhóm — gắn thẻ không nhất quán làm cho dữ liệu không đầy đủ

## Tóm Tắt

- **Chi phí lưu trữ tích lũy vô hình** — kiểm toán thường xuyên là thiết yếu.
- **Volume EBS không được gắn** là nguồn lãng phí phổ biến. Xóa chúng (hoặc tự động xóa khi instance kết thúc).
- **EBS right-sizing**: Chuyển gp2 sang gp3 (thường tiết kiệm 20%). Loại bỏ IOPS được cấp phát dư.
- **S3 versioning**: Bật quy tắc lifecycle cho các phiên bản không hiện tại để tránh trả tiền cho lịch sử phiên bản không giới hạn.
- **EFS Intelligent-Tiering**: Tự động di chuyển tệp đến các tầng chi phí thấp hơn dựa trên tần suất truy cập.
- **Thẻ phân bổ chi phí**: Gắn thẻ tài nguyên với metadata nhóm/dự án/môi trường để có khả năng hiển thị và trách nhiệm chi phí.
- **AWS Budgets**: Cảnh báo chủ động khi chi phí tiếp cận ngưỡng. Không bao giờ bị bất ngờ bởi hóa đơn hàng tháng.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Domain 4, Task 4.1)*

- **Thẻ phân bổ chi phí**: Bật User-Defined Tags để phân bổ chi phí trong console thanh toán; sau đó gắn thẻ tài nguyên. Cost Explorer hiển thị phân tích theo thẻ. Kịch bản kỳ thi: "xác định phòng ban nào đang tạo ra chi phí S3 nhiều nhất" → thẻ phân bổ chi phí.
- **AWS Trusted Advisor**: Xác định các instance EC2 chưa được sử dụng hết, volume EBS không được gắn, bộ cân bằng tải nhàn rỗi và các nguồn lãng phí khác. Kiểm tra cơ bản miễn phí; kiểm tra đầy đủ yêu cầu Business/Enterprise Support.
- **Các thành phần chi phí EBS**: Lưu trữ (mỗi GB), IOPS được cấp phát (nếu io1/io2 hoặc gp3 thêm), thông lượng (nếu gp3 thêm). Biết thành phần nào có thể được right-sized.
- **Chi phí S3 versioning**: Các phiên bản không hiện tại được lưu trữ và tính phí theo cùng mức với phiên bản hiện tại. Các quy tắc lifecycle hết hạn phiên bản không hiện tại là quan trọng để kiểm soát chi phí trong các bucket có versioning.
- **AWS Compute Optimizer**: Phân tích việc sử dụng EC2 và đề xuất các loại instance được right-sized. Tín hiệu kỳ thi: "giảm chi phí EC2 bằng cách chọn đúng loại instance" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Sử dụng ML để phát hiện các mẫu chi tiêu bất thường. Tín hiệu kỳ thi: "tự động phát hiện tăng chi phí bất ngờ" → Cost Anomaly Detection.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích tại sao các volume EBS không được gắn tạo ra chi phí ngay cả khi không có instance EC2 nào đang sử dụng chúng. Quy trình nào kỹ sư nên tuân theo khi kết thúc một instance EC2 để tránh lãng phí này?

*(Gợi ý: Volume EBS lưu trữ dữ liệu trên đĩa vật lý, và đĩa đó tốn tiền bất kể nó có được đọc hay không.)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Hóa đơn AWS của một công ty đã tăng từ $5,000 lên $9,000/tháng trong sáu tháng, nhưng họ không thêm dịch vụ mới. Nhóm kỹ thuật nghi ngờ chi phí lưu trữ là vấn đề. Sự kết hợp nào của công cụ AWS sẽ TỐT NHẤT xác định và giải thích tăng chi phí?

A) AWS CloudTrail để xem xét các lời gọi API và xác định ai đã tạo tài nguyên mới  
B) AWS Cost Explorer để phân tích chi phí theo cấp độ dịch vụ, và AWS Trusted Advisor để phát hiện tài nguyên nhàn rỗi và không được gắn  
C) Amazon CloudWatch để theo dõi việc sử dụng tài nguyên và tạo cảnh báo chi phí  
D) AWS Config để xác định tất cả tài nguyên và trạng thái tuân thủ của chúng

**Gợi ý 1**: "Xác định tăng chi phí" → trực quan hóa phân tích chi phí theo dịch vụ.

**Gợi ý 2**: "Tài nguyên nhàn rỗi và không được gắn" → một công cụ cụ thể chủ động xác định những tài nguyên này.

**Gợi ý 3**: CloudTrail ghi nhật ký lời gọi API; Cost Explorer hiển thị xu hướng chi phí. Cái nào hữu ích hơn cho phân tích chi phí?

**Đáp án**: B

**Giải thích**: AWS Cost Explorer hiển thị xu hướng chi phí được phân tích theo dịch vụ, region và loại sử dụng — hoàn hảo để xác định dịch vụ nào thúc đẩy tăng chi phí. Các kiểm tra tối ưu hóa chi phí của AWS Trusted Advisor xác định các volume EBS không được gắn, instance EC2 nhàn rỗi, bộ cân bằng tải chưa sử dụng và các nguồn lãng phí phổ biến khác.

**Tại sao không phải A?** CloudTrail ghi nhật ký ai đã tạo tài nguyên và khi nào, nhưng không trực tiếp hiển thị xu hướng chi phí hoặc xác định lãng phí.

**Tại sao không phải C?** CloudWatch theo dõi hiệu suất tài nguyên (CPU, bộ nhớ) — hữu ích để right-sizing nhưng không để xác định lãng phí lưu trữ tích lũy.

**Tại sao không phải D?** AWS Config theo dõi cấu hình tài nguyên và tuân thủ nhưng không phải công cụ phân tích chi phí.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Task 4.1*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Hóa đơn S3 của Nimbus hiển thị $340/tháng cho một bucket có nhãn "backups." Bucket có versioning được bật và chứa:

- Snapshot cơ sở dữ liệu hằng ngày (7 ngày là đủ cho chính sách của họ)
- Backup đầy đủ hàng tuần (giữ trong 3 tháng)
- Lưu trữ hàng quý (giữ trong 7 năm để tuân thủ thuế)

Thiết kế chính sách lifecycle cho bucket này giảm thiểu chi phí trong khi đáp ứng các yêu cầu lưu giữ. Storage class nào nên mỗi loại dữ liệu sử dụng? Bạn sẽ xử lý versioning như thế nào để ngăn các phiên bản cũ tích lũy?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành thiết kế chính sách lifecycle.)*

## Cảnh Sau Tín Dụng

Tom đã xuất bản kết quả kiểm toán chi phí cho nhóm.

Lãng phí được xác định: $8,800 trong 18 tháng.
Tiết kiệm hàng năm dự kiến từ các thay đổi đã thực hiện: $6,200.

Sau đó anh thêm một dòng ở cuối: "Điều này không bao gồm tiết kiệm từ Savings Plans ($14,200/năm) hoặc chính sách lifecycle S3 ($7,800/năm). Tác động tối ưu hóa hàng năm tổng hợp: khoảng $28,200."

Maya đọc nó hai lần.

"Đó gần bằng lương của một kỹ sư cấp thấp," cô nói.

"Trong lãng phí," Tom xác nhận.

"Hoặc," Leo nói, "đó là bằng chứng rằng việc thực hiện các tối ưu hóa này sớm hơn sẽ đã tài trợ cho kỹ sư đó."

Tom nhìn anh.

"Đó là cách đúng để nghĩ về nó," anh nói. "Tối ưu hóa chi phí không phải là cắt giảm. Đó là không trả tiền cho những thứ không tạo ra giá trị."

Maya đã ghim tài liệu vào wiki của công ty.

Trong chương tiếp theo: tầng cơ sở dữ liệu nhận được sự đối xử tương tự, và Tom phát hiện ra một nơi anh thực sự đang đầu tư không đủ.
