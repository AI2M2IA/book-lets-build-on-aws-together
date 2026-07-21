# Chương 29: Hóa Đơn Cơ Sở Dữ Liệu

Tom in các số liệu CloudWatch ra. Mười bốn trang. Anh trải chúng ra bàn trước khi tự tin đọc các con số. Tốt hơn là thấy tất cả cùng một lúc thay vì gặp bất ngờ ở giữa trang.

Kiểm toán lưu trữ đã phát hiện ra 6.700 đô la lãng phí tích lũy — không phải từ các quyết định tồi, mà từ sự bất cẩn. Các volume không gắn kết, snapshot cũ, lịch sử phiên bản mà không ai nói S3 phải dọn dẹp, các multipart upload chưa hoàn tất âm thầm tích lũy trong nhiều tháng. Tom đã sửa tất cả những điều đó, áp dụng các quy tắc dọn dẹp tự động, và chuyển sang tab tiếp theo trong bảng tính. Tầng dữ liệu là ẩn số lớn nhất còn lại: cơ sở dữ liệu quan hệ, bảng NoSQL, nút bộ nhớ đệm, lưu trữ sao lưu, và một khoản mục đã làm anh băn khoăn trong nhiều tuần.

Các khoản mục tầng dữ liệu đang xem xét:

Cụm Aurora: 647 đô la/tháng.
Các read replica RDS PostgreSQL cũ: 340 đô la/tháng.
Bảng DynamoDB: 340 đô la/tháng.
ElastiCache: 185 đô la/tháng.
Snapshot thủ công Aurora: 87 đô la/tháng.

Tổng tầng dữ liệu đang xem xét: 1.599 đô la/tháng.

"Hãy để tôi hiểu từng cái trước khi quyết định bất cứ điều gì," anh nói. "Vì cơ sở dữ liệu không phải nơi để tiết kiệm tiền bằng cách cắt bỏ góc cạnh."

Điều đó thật sáng suốt. Cấu hình sai cơ sở dữ liệu dẫn đến mất dữ liệu hoặc suy giảm hiệu suất sẽ tốn kém hơn nhiều so với bất kỳ khoản tiết kiệm nào.

Hãy nghĩ về cơ sở dữ liệu như động cơ của một chiếc xe. Bạn có thể tiết kiệm tiền từ một chiếc xe bằng cách chuyển sang nhiên liệu rẻ hơn, điều chỉnh áp suất lốp, và loại bỏ trọng lượng không cần thiết ra khỏi cốp xe. Nhưng nếu bạn cố tiết kiệm tiền bằng cách bỏ qua thay dầu, bạn có nguy cơ bóp chết động cơ — và một động cơ bị hỏng tốn kém hơn nhiều so với bất kỳ khoản tiết kiệm nhiên liệu nào. Cuộc kiểm toán mà Tom sắp thực hiện tuân theo cùng logic: tìm lãng phí trong cốp xe và bình nhiên liệu, và đừng chạm vào động cơ cho đến khi bạn biết chính xác những gì bạn đang làm.

**Đầu Tiên Hãy Hiểu Khối Lượng Công Việc Cơ Sở Dữ Liệu**

Tối ưu hóa chi phí trong cơ sở dữ liệu đòi hỏi phải hiểu khối lượng công việc trước khi chạm vào bất cứ điều gì. Tom đã học được điều này từ một lần suýt xảy ra sự cố sáu tháng trước: anh đã bắt đầu giảm kích thước instance cơ sở dữ liệu dựa trên mức sử dụng CPU trung bình — 18% — mà không nhìn vào các con số p95 trước. Một đồng nghiệp đã yêu cầu anh kiểm tra các số liệu CloudWatch cẩn thận hơn. CPU p95 là 61%, và đạt 84% trong một đêm thứ Sáu đặc biệt bận rộn.

"Trung bình không cho bạn biết những gì xảy ra lúc cao điểm," Tom nói với Priya khi kể lại. "Nếu tôi đã điều chỉnh kích thước dựa trên trung bình, chúng ta sẽ bị throttle vào những tối thứ Sáu."

"Đó là lý do tại sao bạn nhìn vào p95, không phải trung bình," Priya nói. "Lúc nào cũng vậy."

Nguyên tắc đó mở rộng ra ngoài CPU. Tom giờ đây có một danh sách kiểm tra tiêu chuẩn trước khi kiểm toán:

- CPU: p95, không phải trung bình
- Bộ nhớ: FreeableMemory (theo byte tuyệt đối, không phải phần trăm) — chúng ta gần giới hạn bao nhiêu?
- Kết nối: DatabaseConnections tối đa trong 30 ngày qua — chúng ta gần giới hạn kết nối đến đâu?
- Tỷ lệ đọc/ghi: Xác định liệu các read replica có xứng đáng với chi phí không
- Tốc độ tăng trưởng lưu trữ: Chúng ta thêm bao nhiêu GB mỗi tháng?
- Độ trễ nhân bản (đối với replica): Replica có theo kịp không?

Các câu hỏi cơ bản:

- Mức sử dụng CPU trung bình và cao điểm là bao nhiêu?
- Tỷ lệ đọc/ghi là bao nhiêu?
- Lưu trữ đang tăng, ổn định, hay giảm?
- Các read replica có đang được sử dụng không?
- Instance được cấp phép không đủ (gây chậm) hay quá mức (trả tiền cho dung lượng rảnh)?

Tom đã lấy số liệu CloudWatch của ba dịch vụ cơ sở dữ liệu trong 30 ngày trước:

**Cụm Aurora**:

- CPU trung bình: 18% (p95: 61%; cao điểm: 84% vào tối thứ Sáu)
- FreeableMemory: Ổn định trên 4GB trong 8GB khả dụng. Không đáng lo ngại.
- Tỷ lệ đọc/ghi: 14:1 (thiên về đọc)
- Lưu trữ: 180GB (~5GB/tháng tăng trưởng)
- DatabaseConnections tối đa: 312 trong 1.000 khả dụng. Thoải mái.

**Read replica (RDS PostgreSQL, tách biệt với Aurora)**:

- Đây là hai read replica RDS cũ được tạo trước khi di chuyển sang Aurora, vẫn đang chạy.
- Kết nối trung bình mỗi cái: 2 mỗi ngày. CPU trung bình: 3%.
- FreeableMemory: 7,2GB trong 8GB khả dụng. Các instance gần như nhàn rỗi.

"Tại sao những cái này vẫn chạy?" Tom hỏi.

"Tôi đã deploy chúng — ồ," Leo nói. Anh nhìn vào ngày tạo instance. "Chúng dự phòng trong quá trình di chuyển Aurora. Tôi không bao giờ xóa chúng."

Khoảnh khắc đó — khi thứ gì đó tốn kém đang chạy mà không được sử dụng trong nhiều tháng — là khoảnh khắc quen thuộc trong môi trường đám mây. Leo đã tạo các replica như một mạng lưới an toàn. Mạng lưới an toàn không bao giờ cần thiết. Nhưng không ai đặt câu hỏi cho đến bây giờ.

"Tình trạng connection pool như thế nào?" Priya hỏi, nghiêng người về phía trước. "Trước khi xóa chúng, có thành phần ứng dụng nào vẫn đang định tuyến reads đến đó không?"

Tom kiểm tra logs kết nối. Hai kết nối mỗi ngày đến từ một script giám sát mà Priya đã viết mười bốn tháng trước — nó thăm dò tất cả các endpoint cơ sở dữ liệu đã biết để xác minh chúng có phản hồi không. Các replica chỉ được truy vấn bởi health checker, không phải bởi bất kỳ lưu lượng ứng dụng thực sự nào.

"Xóa chúng," Maya nói.

Các replica đã bị chấm dứt. Tiết kiệm hàng tháng: 340 đô la.

**Sự Cố Gần Xảy Ra Về Connection Pool**

Khi đang kiểm tra các số liệu kết nối, Tom thực hiện kiểm tra rộng hơn trên tất cả các endpoint cơ sở dữ liệu. Những gì anh tìm thấy đã khiến anh dừng lại.

Endpoint writer Aurora hiển thị DatabaseConnections tối đa là 312. Thoải mái. Nhưng endpoint reader kể một câu chuyện khác.

"Endpoint reader đạt 847 kết nối vào ba tối thứ Sáu liên tiếp," Tom nói.

"Giới hạn là bao nhiêu?" Priya hỏi.

"Giới hạn cho lớp instance hiện tại của chúng ta là 1.000. Chúng ta đạt 847. Đó là 85% giới hạn."

"Và chúng ta không nhận thấy vì cảnh báo không kích hoạt cho đến 90%?" Maya hỏi.

"Không có cảnh báo nào cả," Tom nói. "Không có CloudWatch alarm nào trên các kết nối reader endpoint. Tôi chỉ tìm thấy điều này vì tôi đã xem xét các số liệu thô."

Ở 1.000 kết nối, cơ sở dữ liệu từ chối kết nối mới. Bất kỳ luồng ứng dụng nào đang cố gắng lấy kết nối cơ sở dữ liệu tại thời điểm đó sẽ ném ra một ngoại lệ. Nếu ngoại lệ đó không được xử lý khéo léo, người dùng sẽ thấy lỗi 500.

"Chúng ta cách một sự cố thứ Sáu tối ba mươi giây," Leo nói. "Ba lần liên tiếp."

"Chúng ta đã nghĩ đến điều gì sẽ xảy ra khi ngưỡng đó bị vượt qua chưa?" Priya hỏi.

"Các đối tác nhà hàng thấy đơn hàng thất bại trong giờ cao điểm bữa tối," Maya nói. "Đây không phải là mối lo ngại lý thuyết."

Tom ngay lập tức thiết lập CloudWatch alarm: cảnh báo ở 750 kết nối (75% giới hạn), gọi pager ở 900 (90%). Anh cũng đã triển khai RDS Proxy cho reader endpoint — RDS Proxy pools và quản lý kết nối cơ sở dữ liệu từ lớp ứng dụng, có nghĩa là năm mươi luồng ứng dụng có thể chia sẻ mười kết nối cơ sở dữ liệu. Proxy xử lý việc ghép kênh. Ngay cả khi ứng dụng đang tải nặng, cơ sở dữ liệu sẽ thấy ít kết nối hơn nhiều.

"RDS Proxy cho Aurora Serverless v2 được định giá ở mức 0,015 đô la mỗi giờ mỗi ACU, với mức tối thiểu 8 ACU mỗi proxy," Tom nói. "Nhưng nếu vi phạm giới hạn kết nối gây ra ngay cả một sự cố dừng hoạt động một phần vào một tối thứ Sáu, chi phí danh tiếng cho Nimbus sẽ cao hơn nhiều bậc độ lớn."

"Chi phí mỗi tháng là bao nhiêu?" Tom tự hỏi, tính toán con số. Reader đang chạy trên Serverless v2, vì vậy proxy được tính theo mức tối thiểu 8 ACU: 0,015 × 8 × 730 = 87,60 đô la/tháng. Đó là chi phí mà anh vui lòng trả.

Bạn có thể đang thắc mắc: nếu chúng ta đã tiết kiệm tiền với khả năng tự động scaling của Serverless v2, tại sao lại lo lắng về Reserved Instance với lớp provisioned? Câu trả lời là: scaling của Serverless v2 có chi phí — bạn trả theo ACU-giờ dù bạn có lên kế hoạch hay không. Đối với các nhóm chạy cấu hình Aurora cố định, cam kết RI chuyển đổi chi phí biến đổi thành chi phí có thể dự đoán. Đối với các nhóm chạy instance provisioned (không phải Serverless v2), sự phân biệt này quan trọng đáng kể.

**RDS Reserved Instance: Đối Với Các Lớp Cơ Sở Dữ Liệu Được Cấp Phép**

Giống như EC2, RDS cung cấp Reserved Instance để sử dụng có cam kết.

Đối với các nhóm sử dụng cấu hình Aurora instance cố định (không phải Serverless v2), Reserved Instance có thể tiết kiệm 30–60%. Cách tiếp cận RI provisioned hoạt động như sau: bạn cam kết một loại instance cụ thể trong 1 hoặc 3 năm để đổi lấy khoản giảm giá đáng kể trên tỷ lệ theo giờ.

Ví dụ: một instance writer db.r6g.large theo On-Demand với 0,26 đô la/giờ tốn 190 đô la/tháng. Reserved Instance 1 năm cho cùng loại đó giảm xuống khoảng 108 đô la/tháng — tiết kiệm 82 đô la mỗi tháng mỗi instance, khoảng 1.000 đô la/năm mỗi instance cơ sở dữ liệu.

**Aurora Serverless v2 vs Standard RI — Điểm Hòa Vốn**

Tom tính toán con số cho cấu hình Aurora cụ thể của họ. Câu hỏi: liệu khả năng tự động scaling của Aurora Serverless v2 có mang lại đủ lợi ích, hay một instance provisioned cố định với cam kết Reserved Instance sẽ rẻ hơn?

Định giá Serverless v2: 0,12 đô la mỗi ACU-giờ. Cụm của họ scale từ 0,5 ACU (nhàn rỗi) đến 16 ACU (tải cao điểm). Trung bình trong 30 ngày qua là 4,2 ACU.

Chi phí Serverless v2 hàng tháng: 4,2 ACU × 0,12 đô la × 730 giờ = 368 đô la/tháng.

So sánh: một db.r6g.xlarge cố định với RI 1 năm (có kích thước để xử lý tải p95 ngày thường, tương đương provisioned ước tính): 0,52 đô la/giờ × 0,60 (giảm giá RI) × 730 = 228 đô la/tháng.

"RI rẻ hơn," Leo nói.

"Đối với tải cố định, có," Tom nói. "Nhưng hãy nhìn vào phân phối. Thời gian lưu lượng thấp của chúng ta — thứ Hai đến thứ Năm, 02:00–07:00 — trung bình 0,8 ACU. Với một instance provisioned cố định, chúng ta sẽ trả gấp nhiều lần những gì chúng ta sử dụng trong những giờ đó, chỉ để nó ngồi nhàn rỗi."

"Và Serverless v2 scale xuống để phù hợp?"

"Đến 0,5 ACU. Chi phí nhàn rỗi là một phần nhỏ của những gì chúng ta sẽ trả cho một instance provisioned được kích thước cho cao điểm."

Phép tính hòa vốn: Serverless v2 rẻ hơn khi tỷ lệ cao điểm/nền tảng của bạn vượt quá khoảng 4:1. Đối với Nimbus với cao điểm thứ Sáu là 16 ACU và mức tối thiểu sáng thứ Hai là 0,8 ACU — tỷ lệ 20:1 — Serverless v2 là lựa chọn đúng. Nếu lưu lượng của họ nhất quán hơn (giả sử 8 ACU ± 20%), một RI provisioned sẽ rẻ hơn.

"Đây không chỉ là về con số nào nhỏ hơn tháng này," Tom nói. "Mà là về mô hình nào xử lý tốt sự tăng trưởng của chúng ta. Nếu chúng ta tăng 50% vào quý tới, Serverless v2 chỉ cần scale lên. Một RI provisioned đòi hỏi phải thay đổi kích thước và chúng ta sẽ trả tiền cho dung lượng chưa sử dụng trong quá trình chuyển đổi."

Tom đã làm rõ so sánh trong suốt một năm để nhóm có thể theo dõi lý luận, không chỉ kết quả.

**Chi phí Aurora theo tháng: Serverless v2 vs provisioned RI**

Tùy chọn provisioned: db.r6g.xlarge với Reserved Instance 1 năm. Chi phí: 0,52 đô la/giờ On-Demand × 0,60 (giảm giá RI) × 730 giờ = 228 đô la/tháng. Cố định, bất kể tải.

Tùy chọn Serverless v2: Trả 0,12 đô la mỗi ACU-giờ. Biến đổi, theo dõi tải thực tế.

Tom đã lấy 30 ngày số liệu Aurora Serverless v2 ACU từ CloudWatch và xây dựng phân phối:

- 02:00–07:00, thứ Hai–thứ Năm (lưu lượng thấp): trung bình 0,8 ACU → 0,096 đô la/giờ
- 07:00–11:00, ngày thường (trung bình): trung bình 3,2 ACU → 0,384 đô la/giờ  
- 11:00–21:00, ngày thường (cao điểm giờ làm việc): trung bình 5,8 ACU → 0,696 đô la/giờ
- Thứ Sáu 18:00–22:00 (cao điểm bữa tối): trung bình 14,1 ACU → 1,692 đô la/giờ
- Thứ Bảy 12:00–20:00 (bận rộn cuối tuần): trung bình 9,3 ACU → 1,116 đô la/giờ
- Chủ Nhật (ngày nhẹ nhàng nhất): trung bình 2,1 ACU → 0,252 đô la/giờ

Trung bình có trọng số trong cả tháng: 4,2 ACU → 0,504 đô la/giờ → 368 đô la/tháng.

Trên provisioned RI: 228 đô la/tháng. Serverless: 368 đô la/tháng. Tùy chọn provisioned tiết kiệm 140 đô la/tháng.

"Điều đó có vẻ rõ ràng," Leo nói. "Tại sao chúng ta vẫn dùng Serverless?"

"Vì 368 đô la là trung bình," Tom nói. "Hãy nhìn vào tối thứ Sáu."

Thứ Sáu 18:00–22:00: trung bình 14,1 ACU. Trong khoảng thời gian bốn giờ đó, Serverless tốn 1,692 đô la/giờ. Một db.r6g.xlarge provisioned với RI 228 đô la/tháng có 32 GiB RAM — tương đương khoảng 16 ACU. Cụm Serverless đang chạy trung bình 14,1 ACU trong suốt khoảng thời gian đó, áp sát trần của xlarge mà không có headroom.

"Instance provisioned được kích thước đúng cho cao điểm thứ Sáu của chúng ta sẽ là db.r6g.2xlarge," Tom nói. "Theo tỷ lệ RI, đó là 1,04 đô la/giờ × 0,60 = 0,624 đô la/giờ. Hàng tháng: 456 đô la/tháng."

"Điều đó nhiều hơn trung bình Serverless 368 đô la," Maya nói.

"Đúng vậy. Và nếu chúng ta kích thước instance provisioned cho tải nền ngày thường — db.r6g.xlarge — chúng ta sẽ gặp vấn đề vào tối thứ Sáu. Ở tải cao điểm, chúng ta sẽ đạt tương đương 14 ACU so với toàn bộ dung lượng của xlarge. Đó là saturation."

"Vậy bạn phải kích thước trước cho cao điểm," Priya nói.

"Với chi phí trả cho dung lượng nhàn rỗi trong 160 giờ còn lại của tuần," Tom nói. "Phép tính RI provisioned rẻ hơn chỉ hoạt động khi tỷ lệ cao điểm/nền tảng của bạn thấp. Của chúng ta là 20:1. Đó chính xác là kịch bản Serverless v2 được thiết kế cho."

Anh hiển thị các con số cạnh nhau:

| Tùy chọn | Trung bình/tháng | Đêm yên tĩnh (02:00) | Cao điểm thứ Sáu (20:00) |
|---|---|---|---|
| Serverless v2 | 368 $ | 0,096 $/giờ | 1,692 $/giờ |
| Provisioned RI (r6g.xl) | 228 $ | 228$/730h = 0,312 $/giờ | bị giới hạn — rủi ro saturation |
| Provisioned RI (r6g.2xl) | 456 $ | 0,624 $/giờ | headroom thoải mái |

"Tùy chọn Serverless là 368 đô la," Tom nói. "Tùy chọn provisioned được kích thước đúng là 456 đô la — và đó là trước khi tính chi phí vận hành của việc giám sát và thay đổi kích thước thủ công instance provisioned khi mô hình lưu lượng của chúng ta thay đổi trong quý tới."

"Và chi phí vận hành," Priya nói, "không phải là không đáng kể."

"Không. Với Serverless, chúng ta không cần lo về kích thước instance. Aurora xử lý nó. Với provisioned, tôi cần đánh giá lại liệu lớp instance hiện tại có còn phù hợp với lưu lượng của chúng ta hay không mỗi quý. Điều đó không tốn kém về mặt thời gian nhưng là thứ có thể sai nếu chúng ta ngừng chú ý."

"Sẽ ổn thôi miễn là chúng ta không quên thay đổi kích thước nó," Leo nói, rồi tự kiểm tra mình. "Đó chính xác là lúc nó sẽ không ổn."

"Chính xác," Tom nói.

Phán quyết đứng vững: 368 đô la/tháng Serverless v2 là lựa chọn đúng cho tỷ lệ cao điểm/nền tảng 20:1 của Nimbus và sở thích đơn giản vận hành của nhóm. Provisioned RI chỉ hấp dẫn đối với các nhóm có lưu lượng không biến động đáng kể — tỷ lệ 2:1 hoặc 3:1 nơi instance provisioned hiếm khi nhàn rỗi.

"Điều gì sẽ khiến chúng ta chuyển sang provisioned?" Maya hỏi.

"Nếu mô hình lưu lượng của chúng ta phẳng hơn," Tom nói. "Nếu Nimbus phát triển đến điểm mà ngay cả tải nền lúc 02:00 cũng cao — giả sử 8 ACU thay vì 0,8 — tỷ lệ giảm xuống 2:1 và provisioned trở nên hợp lý về mặt kinh tế. Đó là vấn đề kinh doanh khác nhau. Là vấn đề mà chúng ta muốn có."


Reserved Instance cho Aurora Serverless v2 không áp dụng trực tiếp — Serverless v2 tự động scale và bạn trả theo ACU-giờ. Đây là cấu hình hiện tại của Nimbus: cả Aurora writer và reader chính đều sử dụng Serverless v2. Đối với Nimbus, tiết kiệm đến từ bản chất tự động scaling của Serverless v2 — bạn không trả tiền cho dung lượng chưa sử dụng khi lưu lượng thấp.

Các nhóm vẫn chạy Aurora instance cố định nên xem xét cam kết RI khi loại instance ổn định trong ba tháng hoặc hơn.

**DynamoDB: On-Demand vs Provisioned**

Trong Chương 9, chúng ta đã giới thiệu hai chế độ dung lượng của DynamoDB: on-demand và provisioned.

Nimbus đã chạy DynamoDB ở chế độ on-demand ngay từ đầu. Ở lưu lượng thấp, điều đó đúng — on-demand đắt hơn mỗi request nhưng không có phí tối thiểu.

Bây giờ, với 18 tháng dữ liệu lưu lượng trong CloudWatch, Tom có thể thấy các mô hình.

Trung bình read request: 225/giây (khoảng 19,4 triệu/ngày)
Trung bình write request: 60/giây (khoảng 5,2 triệu/ngày)
Ngày cao điểm (thứ Sáu): khoảng 180% lưu lượng DynamoDB trung bình (ElastiCache hấp thụ ~95% các read, vì vậy DynamoDB chỉ thấy một phần nhỏ của tổng số tăng đột biến đơn hàng gấp 25 lần)

**Định giá on-demand**: 1,25 đô la mỗi triệu write request, 0,25 đô la mỗi triệu read request.
**Định giá provisioned**: 0,00065 đô la mỗi write capacity unit mỗi giờ, 0,00013 đô la mỗi read capacity unit mỗi giờ.

Tom tính toán điểm hòa vốn: dung lượng provisioned trở nên rẻ hơn khi bạn sử dụng nó đủ nhất quán để không trả phụ phí on-demand trong các khoảng thời gian nhàn rỗi.

(Một lưu ý về các con số trong phần này: chúng phản ánh hóa đơn của nhóm vào thời điểm đó và mang tính minh họa. Vào cuối năm 2024, AWS đã giảm giá on-demand DynamoDB 50%, thay đổi đáng kể điểm hòa vốn — ngày nay, provisioned chỉ thắng khi mức sử dụng nhất quán cao. Luôn thực hiện phép tính này với giá hiện hành.)

Với 18 tháng dữ liệu cho thấy các mô hình hàng ngày nhất quán, provisioned capacity với **DynamoDB Auto Scaling** là lựa chọn đúng:

- Đặt capacity tối thiểu ở 60% tải trung bình
- Đặt tối đa ở 250% trung bình (xử lý cao điểm thứ Sáu)
- Auto Scaling điều chỉnh provisioned capacity trong các giới hạn đó

Chi phí DynamoDB hàng tháng giảm từ 340 đô la (on-demand) xuống 230 đô la (provisioned với auto scaling). Giảm 32%.

"Chờ đã — nhưng tại sao chúng ta sẽ làm *điều này*?" Maya hỏi. "Chúng ta đã dùng on-demand từ đầu vì chúng ta không tin tưởng vào các mô hình lưu lượng của mình. Điều gì đã thay đổi?"

"Mười tám tháng dữ liệu," Tom nói. "Bây giờ chúng ta biết các mô hình của mình trông như thế nào — nền tảng ngày thường nhất quán, cao điểm thứ Sáu, giai đoạn chủ nhật yên tĩnh. On-demand là quyết định đúng khi chúng ta không biết. Provisioned với Auto Scaling là quyết định đúng bây giờ chúng ta biết."

"Nhưng nếu chúng ta cấp phép quá mức," Leo hỏi, "chúng ta trả cho dung lượng chưa sử dụng."

"Đó là rủi ro," Tom nói. "Với Auto Scaling, chúng ta đặt mức tối thiểu đủ cao để tránh throttling và để AWS quản lý trong phạm vi của chúng ta."

"Và nếu mô hình lưu lượng của chúng ta thay đổi đáng kể?"

"Thì chúng ta điều chỉnh các giới hạn. Chúng ta xem lại điều này mỗi quý."

**ElastiCache: Điều Chỉnh Kích Thước Phù Hợp và Bài Học Kinh Nghiệm**

Hóa đơn ElastiCache: 185 đô la/tháng. Một instance Redis cache.r6g.large ở mỗi AZ (hai node, primary + replica).

Số liệu CloudWatch cho thấy:

- Mức sử dụng bộ nhớ trung bình: 34%
- Cao điểm: 44%

Instance được cấp phép quá mức. Một cache.m6g.large — một nửa bộ nhớ của r6g.large — có thể xử lý tải với headroom.

Nhưng ở đây Tom dừng lại. Anh nhớ lại điều đã xảy ra tại một công ty trước đây khi anh điều chỉnh cache một cách mạo hiểm — và kể cho nhóm toàn bộ câu chuyện, vì đây là loại câu chuyện cần được kể trước khi bạn thấy mình đang ở giữa nó.

Tại công ty trước của anh — một nền tảng SaaS cho báo cáo tài chính — cụm ElastiCache là một cache.r6g.large. Hai node, primary và replica. Mức sử dụng bộ nhớ trung bình: 26%. Cao điểm quan sát được: 37%. Kỹ sư trực đã tính toán: một cache.m6g.large sẽ xử lý tải với headroom 25% trên cao điểm quan sát được. Tiết kiệm: 60 đô la/tháng — định giá trong khu vực của công ty đó và thế hệ node vào thời điểm đó nhỏ hơn chênh lệch tương đương tại Nimbus ngày nay. Thay đổi được phê duyệt vào một ngày thứ Ba.

Tháng tiếp theo, vào thứ Năm lúc 23:47, công việc batch đối chiếu cuối tháng bắt đầu.

Công việc batch đối chiếu chạy hàng quý. Nó lấy hồ sơ giao dịch của ba tháng trước cho mỗi tài khoản đang hoạt động, tổng hợp chúng, tính thuế, và ghi các bản ghi đối chiếu. Bộ nhớ đệm được sử dụng để lưu trữ trạng thái tổng hợp trung gian — tổng số chạy của mỗi tài khoản khi công việc batch tiến hành. Cache.r6g.large đã luôn xử lý điều này. Không ai đặc biệt nhìn vào số liệu công việc batch khi đưa ra quyết định điều chỉnh kích thước, vì công việc batch là hàng quý và cửa sổ quan sát là bốn tuần.

Trên instance cache.m6g.large, maxMemoryPolicy được đặt là `allkeys-lru` — khi bộ nhớ đầy, Redis sẽ xóa khóa ít được sử dụng gần đây nhất để tạo không gian. Đây là chính sách đúng cho bộ nhớ đệm chung mục đích. Nhưng đối với công việc batch đối chiếu, mọi khóa trong bộ nhớ đệm đều cần thiết đang hoạt động. Khi bộ nhớ đầy đến 84% trong 6,38 GB của instance m6g.large, Redis bắt đầu xóa các khóa. Mỗi lần xóa là một cache miss. Mỗi cache miss gửi một truy vấn đến cơ sở dữ liệu PostgreSQL bên dưới để tính lại giá trị bị xóa từ hồ sơ giao dịch thô.

Connection pool cơ sở dữ liệu được cấu hình cho lưu lượng trạng thái ổn định, không phải tải công việc batch đối chiếu. Bốn phút sau khi bắt đầu xóa, cơ sở dữ liệu có 847 kết nối đang hoạt động. Giới hạn kết nối là 1.000. Đến phút thứ 9, các luồng ứng dụng đầu tiên bắt đầu thấy lỗi "too many connections". Đến phút thứ 12, ba dịch vụ chia sẻ connection pool cơ sở dữ liệu — công việc batch đối chiếu, dịch vụ báo cáo thời gian thực, và API hướng đến khách hàng — tất cả đều bị ảnh hưởng.

Kỹ sư trực leo thang lúc 23:59. Điều tra sự cố bắt đầu lúc 00:08.

Phản hồi đầu tiên: tăng Lambda timeout cho chức năng công việc batch đối chiếu (công việc batch đối chiếu một phần dựa trên Lambda). Điều đó sai. Vấn đề không phải là timeout.

Phản hồi thứ hai: thêm chức năng Lambda thứ hai để song song hóa công việc batch đối chiếu. Cũng sai. Nhiều song song hơn có nghĩa là nhiều truy cập bộ nhớ đệm đồng thời hơn, có nghĩa là xóa nhanh hơn, có nghĩa là làm cho tình trạng tồi tệ hơn.

Phản hồi thứ ba: thu nhỏ công việc batch đối chiếu để giảm áp lực cơ sở dữ liệu. Điều đó giúp một chút nhưng không giải quyết nguyên nhân gốc rễ.

Phản hồi thứ tư, lúc 02:31: khôi phục cache.r6g.large. Áp lực bộ nhớ giảm ngay lập tức. Việc xóa dừng lại. Connection pool cơ sở dữ liệu được xóa sạch. Công việc batch đối chiếu hoàn thành lúc 04:17, trễ hơn bốn giờ.

Tổng số sự cố: bốn giờ hiệu suất API thấp cho khách hàng cố gắng truy cập báo cáo. Một công việc batch đối chiếu đầy đủ bị trễ. Thời gian kỹ thuật: khoảng 22 giờ trên năm kỹ sư. Chi phí trực tiếp ước tính: 40.000 đô la.

Tiết kiệm 60 đô la/tháng đã tốn 40.000 đô la trong một sự cố duy nhất.

"Lỗi không phải là quyết định điều chỉnh kích thước phù hợp," Tom nói. "Quyết định có thể bào chữa được từ dữ liệu có sẵn. Lỗi là cửa sổ quan sát. Chúng ta đã đo bốn tuần số liệu. Công việc batch đối chiếu là hàng quý. Chúng ta đang nhìn vào khung thời gian sai."

"Vậy làm thế nào để tránh điều đó?" Maya hỏi.

"Bạn hỏi: giao dịch rủi ro nhất mà bộ nhớ đệm này hỗ trợ là gì? Và bạn tìm số liệu cụ thể cho giao dịch đó. Không phải tuần trung bình. Tuần cụ thể đó — hoặc tháng — hoặc quý — khi tải cao nhất. Và bạn kích thước cho điều đó."

"Và nếu bạn không thể tìm thấy số liệu vì giao dịch là không thường xuyên?"

"Thì đó là câu trả lời," Tom nói. "Nếu bạn không thể tìm thấy số liệu cho một kịch bản tải cao cụ thể, câu trả lời đúng là chưa điều chỉnh kích thước phù hợp. Chờ lần xuất hiện tiếp theo, đo lường kỹ lưỡng, sau đó kích thước dựa trên những gì bạn quan sát."

Cụm ElastiCache của Nimbus có giao dịch rủi ro cao nhất của riêng mình: cao điểm bữa tối thứ Sáu. Tom có dữ liệu đó — ba tối thứ Sáu liên tiếp, sử dụng bộ nhớ đạt 44% trên r6g.large; khoảng 5,7 GB dữ liệu đang sống. Trên cache.m6g.large với 6,38 GB, cùng working set sẽ ngồi ở khoảng 90% — và nếu bất cứ điều gì trong pipeline xử lý đơn hàng thay đổi để sử dụng nhiều không gian bộ nhớ đệm hơn — một tính năng mới, chiến lược bộ nhớ đệm khác nhau — thì 90% trở thành vùng xóa.

Vẫn vậy, anh tính toán các con số. Chuyển từ cache.r6g.large sang cache.m6g.large: hai node chạy 730 giờ, 0,090 đô la/giờ so với 0,127 đô la/giờ. Large: 185 đô la/tháng. Cặp m6g: 131 đô la/tháng. Tiết kiệm tiềm năng: 54 đô la/tháng. Anh đã kiểm tra instance cache.m6g.large dưới tải trong staging trong hai tuần. Bộ nhớ đạt đỉnh ở 71% — đủ gần giới hạn để cảm thấy không thoải mái.

Sau đó anh định giá lựa chọn thay thế: giữ nguyên cache.r6g.large nhưng mua Reserved Node (cam kết 1 năm). Từ 185 đô la On-Demand xuống 120 đô la/tháng cho Reserved. Tiết kiệm: 65 đô la/tháng mà không thay đổi loại instance.

"65 đô la/tháng tiết kiệm trên Reserved Node trên cùng kích thước instance là tiết kiệm thực sự," Tom nói. "54 đô la/tháng tiết kiệm bằng cách chuyển sang cache.m6g.large là tiết kiệm sai nếu nó gây rủi ro cho cao điểm bữa tối thứ Sáu — và thậm chí không tiết kiệm được nhiều hơn. Đôi khi điều chỉnh kích thước xuống một instance nhỏ hơn gây rủi ro cho một sự cố hiệu suất — Reserved Node tiết kiệm nhiều hơn mà không có rủi ro nào."

Anh đã mua Reserved Node cho r6g.large.

"Khi tùy chọn an toàn hơn cũng tiết kiệm nhiều hơn," Tom nói, "thì đó thậm chí không phải là sự đánh đổi."

**Lưu Giữ Sao Lưu RDS: Đánh Đổi Lưu Trữ**

Sao lưu tự động RDS được lưu trữ trong S3 (không tính phí lưu trữ bổ sung lên đến 100% kích thước cơ sở dữ liệu). Mặc định lưu giữ là 7 ngày.

Đối với cơ sở dữ liệu Aurora 180GB của Nimbus, lưu giữ 7 ngày là phù hợp — họ đã có thể khôi phục từ sao lưu trong khoảng thời gian đó trong các bài kiểm tra.

Nhưng Tom nhận thấy: họ cũng giữ các snapshot thủ công từ mỗi lần deploy quan trọng, vô thời hạn.

23 snapshot thủ công, tổng cộng 4,1TB lưu trữ snapshot.
Chi phí: 0,021 đô la/GB/tháng cho lưu trữ sao lưu Aurora = khoảng 87 đô la/tháng cho lưu trữ snapshot thủ công.

Họ đã giữ lại 3 snapshot thủ công mới nhất cho mỗi môi trường (production, staging). Xóa phần còn lại — giữ lại khoảng 1,1TB.
Tiết kiệm: 64 đô la/tháng.

"Chúng ta đang trả 64 đô la/tháng cho bảo hiểm mà chúng ta không bao giờ sử dụng," Leo nói.

"Chúng ta đang trả cho sự an tâm," Tom sửa lại. "Câu hỏi là: bao nhiêu sự an tâm đáng giá 64 đô la/tháng?"

"Với một kế hoạch phục hồi thảm họa phù hợp," Priya nói, "bạn có thể có cùng sự an tâm từ sao lưu tự động 7 ngày và 3 snapshot thủ công."

"Đồng ý. Bây giờ."

**Biến Thể: Khi Provisioned Phản Tác Dụng**

Nếu mô hình lưu lượng của bạn nhất quán và có thể dự đoán, provisioned capacity với Auto Scaling tiết kiệm khoảng 30% so với on-demand. Nhưng nếu một tính năng mới ra mắt và khối lượng write của bạn tăng đột biến 5 lần trong một đêm, bạn sẽ bị throttle trước khi Auto Scaling theo kịp — Auto Scaling phản ứng với lưu lượng quan sát, có nghĩa là có độ trễ. Giữ chế độ on-demand cho các tuần xung quanh một launch tính năng lớn là sự đánh đổi hợp lý: chi phí cao hơn một chút, không có rủi ro throttling trong giai đoạn mà bạn đang xem các mô hình lưu lượng thay đổi trong thời gian thực.

Nếu bạn loại bỏ các read replica chưa sử dụng (như các replica PostgreSQL cũ của Nimbus), tiết kiệm là ngay lập tức và rõ ràng — không có sự đánh đổi, vì các replica không cung cấp giá trị. Nhưng nếu bạn muốn loại bỏ một read replica xử lý 2% lưu lượng, hãy kiểm tra điều gì xảy ra với primary khi 2% đó không có nơi nào để đi trong thời gian cao điểm. Một số read replica tồn tại cho headroom, không phải cho tải hiện tại.

Trong kỳ thi, logic tương tự áp dụng: tải nền trạng thái ổn định chỉ vào reserved capacity; burst và idle chỉ vào on-demand hoặc Serverless.

**Tóm Tắt Tối Ưu Hóa Cơ Sở Dữ Liệu**

| Dịch vụ | Trước | Sau | Tiết Kiệm/Tháng |
|---|---|---|---|
| Aurora (giữ Serverless v2 sau phân tích) | 647 $ | 647 $ | 0 $ (mô hình đúng) |
| RDS Read Replica (không sử dụng) | 340 $ | 0 $ | 340 $ |
| DynamoDB (On-Demand → Provisioned + Auto Scaling) | 340 $ | 230 $ | 110 $ |
| ElastiCache (Reserved Nodes) | 185 $ | 120 $ | 65 $ |
| Snapshot thủ công Aurora | 87 $ | 23 $ | 64 $ |
| RDS Proxy (bảo vệ kết nối) | 0 $ | 88 $ | -88 $ |
| **Tổng cộng** | **1.599 $** | **1.108 $** | **491 $/tháng** |

Tiết kiệm cơ sở dữ liệu 491 đô la/tháng. 5.892 đô la/năm.

Tom đặt con số đó bên cạnh việc dọn dẹp lưu trữ (6.200 đô la/năm), chính sách vòng đời S3 từ Chương 23 (7.800 đô la/năm), và tiết kiệm Savings Plan (14.200 đô la/năm).

Tổng tác động tối ưu hóa cho đến nay: 34.092 đô la/năm.

"Đó là đường băng thực sự," Maya nói.

"Hay một vài thử nghiệm nghiêm túc," Priya nói.

"Hay mười hai tháng thử nghiệm," Leo nói.

Cả ba đều đúng.

## Điểm Mạnh và Hạn Chế

**DynamoDB Provisioned với Auto Scaling**:

- Rẻ hơn on-demand cho các khối lượng công việc nhất quán, có thể dự đoán
- Auto Scaling xử lý biến động mà không cần cấp phép quá mức vĩnh viễn
- Yêu cầu giám sát để đảm bảo giới hạn dung lượng vẫn phù hợp

**RDS Reserved Instance / ElastiCache Reserved Nodes**:

- Tiết kiệm đáng kể cho các khối lượng công việc ổn định, chạy lâu dài
- Cam kết bị khóa — nếu nhu cầu của bạn thay đổi, bạn đã trả cho dung lượng chưa sử dụng
- Không giống như EC2 Standard RI, RDS RI không thể bán lại trên Reserved Instance Marketplace — Marketplace chỉ dành cho EC2. RDS RI chưa sử dụng là chi phí chìm, làm cho quyết định kích thước trở nên quan trọng hơn

**Nguyên tắc chung**:

- Luôn luôn hiểu mức sử dụng trước khi tối ưu hóa — sử dụng p95, không phải trung bình
- Tài nguyên chưa sử dụng (như read replica cũ) là tối ưu hóa có ROI cao nhất
- Điều chỉnh kích thước phù hợp yêu cầu xác nhận trong staging trước khi áp dụng cho production, và kiểm tra các mô hình khối lượng công việc theo mùa có thể không xuất hiện trong cửa sổ quan sát tiêu chuẩn
- Định giá reserved đòi hỏi sự tự tin về tính ổn định của khối lượng công việc

## Tóm Tắt

Cuộc kiểm toán cơ sở dữ liệu đã đóng 491 đô la thiếu hụt hàng tháng mà không bao giờ chạm vào động cơ — tiết kiệm đến từ cốp xe: replica nhàn rỗi, snapshot bị quên, và dung lượng được định giá cho các mô hình lưu lượng mà Nimbus đã vượt qua. Kỷ luật của Tom đứng vững ở mỗi khoản mục: hiểu khối lượng công việc trước, sau đó tối ưu hóa. Chi phí mới duy nhất, RDS Proxy, là bảo hiểm mà các con số bộ kết nối thứ Sáu tối đã nói rằng họ cần.

- **Kiểm toán trước**: Trước bất kỳ thay đổi cơ sở dữ liệu nào, hãy lấy số liệu CloudWatch. Sử dụng p95 độ trễ và p95 CPU, không phải trung bình. Kiểm tra FreeableMemory và DatabaseConnections tối đa.
- **Xóa tài nguyên chưa sử dụng**: Read replica, cơ sở dữ liệu nhàn rỗi, và instance kiểm tra không còn cần thiết.
- **Theo dõi connection pool của bạn**: Thiết lập alarm ở 75% và 90% giới hạn trên DatabaseConnections. Xem xét RDS Proxy để ghép kênh kết nối.
- **DynamoDB On-Demand vs Provisioned**: On-Demand cho lưu lượng không thể dự đoán; Provisioned + Auto Scaling cho các mô hình nhất quán.
- **Điều chỉnh kích thước ElastiCache**: Kiểm tra trong staging dưới tải cao điểm thực tế bao gồm các đỉnh theo mùa. Khi giảm kích thước mạo hiểm gây rủi ro, Reserved Nodes cung cấp tiết kiệm ở cùng kích thước instance.
- **Quản lý snapshot RDS**: Chỉ giữ các snapshot bạn cần. Snapshot thủ công tồn tại vô thời hạn trừ khi bị xóa.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết kế Kiến trúc Tối ưu hóa Chi phí (Lĩnh vực 4, Nhiệm vụ 4.3)*

- **Chế độ định giá DynamoDB**: On-Demand = trả theo request (chi phí đơn vị cao hơn, không có tối thiểu). Provisioned = trả theo capacity unit mỗi giờ (chi phí đơn vị thấp hơn, bạn phải phân bổ capacity). **DynamoDB Auto Scaling** tự động điều chỉnh provisioned capacity.
- **RDS Reserved Instance**: Có sẵn cho tất cả loại engine RDS. Triển khai Multi-AZ có thể sử dụng Reserved Instance (bạn cam kết Multi-AZ). Thời hạn 1 hoặc 3 năm.
- **ElastiCache Reserved Nodes**: Mô hình cam kết tương tự như EC2 Reserved Instance. Áp dụng theo node, không phải theo cluster.
- **Lưu trữ snapshot RDS**: Sao lưu tự động miễn phí lên đến 100% kích thước cơ sở dữ liệu. Snapshot thủ công được tính phí theo GB mỗi tháng trong S3. Kịch bản thi: "giảm chi phí lưu trữ RDS" → xóa snapshot thủ công cũ.
- **DynamoDB reserved capacity**: Cũng có sẵn cho DynamoDB (cam kết một lượng nhất định read/write capacity với giảm giá trong 1 hoặc 3 năm). Khác với provisioned tiêu chuẩn — bạn trả trước cho capacity trên tất cả các bảng DynamoDB của bạn trong một vùng.
- **Aurora Serverless v2 vs provisioned**: Serverless v2 tự động scale, lý tưởng cho các khối lượng công việc biến đổi. Provisioned với Reserved Instance rẻ hơn cho các khối lượng công việc ổn định, có thể dự đoán.

## Bài Tập

**Bài Tập 1 — Nhớ Lại**

Giải thích khi nào bạn nên sử dụng DynamoDB on-demand capacity so với provisioned capacity với Auto Scaling. Bạn cần thông tin gì để đưa ra quyết định đó?

*(Gợi ý: Hãy nghĩ về ý nghĩa của "có thể dự đoán" về mặt dữ liệu lưu lượng, và rủi ro nào mà on-demand loại bỏ mà provisioned không loại bỏ.)*

**Bài Tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một công ty chạy bảng DynamoDB cho bảng xếp hạng trò chơi di động. Lưu lượng rất nhất quán trong suốt năm, ngoại trừ một sự kiện theo mùa được lên kế hoạch trước nhiều tháng (mỗi quý một tuần, khi người chơi tham gia đạt tới gấp 10 lần lưu lượng bình thường trong ngày đầu tiên). Ưu tiên của công ty là giảm thiểu chi phí cơ sở dữ liệu trong các giai đoạn trạng thái ổn định dài và có thể dự đoán trong khi duy trì hiệu suất trong các tuần sự kiện đã biết.

Chiến lược dung lượng DynamoDB nào đáp ứng TỐT NHẤT các yêu cầu này?

A) On-demand capacity để xử lý các đỉnh theo mùa mà không bị throttle  
B) Provisioned capacity được điều chỉnh ở mức đỉnh theo mùa (luôn cấp phép cho lưu lượng gấp 10 lần)  
C) Provisioned capacity với DynamoDB Auto Scaling, với dung lượng tối đa được điều chỉnh cho đỉnh theo mùa  
D) DynamoDB reserved capacity units ở mức lưu lượng bình thường trong 3 năm

**Gợi ý 1**: "Lưu lượng rất nhất quán ngoại trừ đỉnh theo mùa đã biết, được lên kế hoạch" — chế độ nào xử lý cả hai một cách hiệu quả? (Sức mạnh của on-demand là lưu lượng *không thể dự đoán*; cái này có thể dự đoán.)

**Gợi ý 2**: "Giảm thiểu chi phí" khi ngoài đỉnh có nghĩa là bạn không thể luôn cấp phép quá mức cho lưu lượng gấp 10 lần.

**Gợi ý 3**: DynamoDB Auto Scaling có thể scale lên cho sự kiện theo mùa và scale lại xuống sau đó.

**Đáp án**: C

**Giải thích**: Provisioned capacity với Auto Scaling scale bảng dựa trên lưu lượng thực tế. Trong các giai đoạn bình thường, capacity ở mức bình thường (chi phí thấp). Trong sự kiện theo mùa mà ngày và lưu lượng được biết trước và tăng dần trong ngày đầu tiên, Auto Scaling theo dõi mức tăng đến mức tối đa được cấu hình (xử lý đỉnh gấp 10 lần) và nhóm cũng có thể nâng mức tối thiểu trước khi bắt đầu theo kế hoạch như headroom thêm. Sau sự kiện, capacity scale lại xuống. Điều này rẻ hơn on-demand cho ~92% năm khi nó chiếm phần lớn trạng thái ổn định (on-demand đắt hơn mỗi request) và rẻ hơn luôn cấp phát gấp 10 lần.

**Tại sao không phải A?** On-demand xử lý đỉnh mà không bị throttle, nhưng sức mạnh của nó là lưu lượng *không thể dự đoán*. Ở đây lưu lượng rất nhất quán và đỉnh được lên kế hoạch và tăng dần — trả phụ phí mỗi request on-demand cho ~92% năm khi đó là trạng thái ổn định mâu thuẫn với ưu tiên giảm thiểu chi phí trong các giai đoạn bình thường.

**Tại sao không phải B?** Luôn cấp phát gấp 10 lần có nghĩa là ~90% dung lượng được cấp phát không sử dụng cho ~92% năm — trả cho dung lượng không bao giờ được sử dụng.

**Tại sao không phải D?** Reserved capacity units khóa bạn vào mức lưu lượng bình thường. Trong sự kiện theo mùa, bạn sẽ bị throttle vượt qua lượng reserved, hoặc cần thêm on-demand lên trên đó.

*Lĩnh vực SAA-C03: Thiết kế Kiến trúc Tối ưu hóa Chi phí — Nhiệm vụ 4.3*

**Bài Tập 3 — Thách Thức Kiến Trúc** *(Tùy Chọn)*

Nimbus đang đánh giá một tính năng mới: bảng điều khiển phân tích nhà hàng hiển thị số đơn hàng theo thời gian thực, doanh thu mỗi giờ, và nhân khẩu học khách hàng. Dữ liệu này sẽ truy vấn cơ sở dữ liệu khoảng 200 lần mỗi phút (một truy vấn cho mỗi lần làm mới trang trên mỗi nhà phân tích, với 10 nhà phân tích).

Hiện tại, dữ liệu phân tích ở trong Athena (trên S3). Họ có nên xây dựng bảng điều khiển trên Athena, hay tải dữ liệu vào một cơ sở dữ liệu? Nếu là cơ sở dữ liệu, loại nào (Aurora, DynamoDB, Redshift)?

Xem xét: tần suất truy vấn, yêu cầu độ tươi mới của dữ liệu, độ phức tạp truy vấn (tổng hợp, kết nối), và chi phí mỗi truy vấn ở khối lượng này.

*(Không có một câu trả lời đúng duy nhất. Mục tiêu là thực hành lựa chọn cơ sở dữ liệu cho các khối lượng công việc phân tích.)*

## Cảnh Sau Kết Thúc

Tom trình bày tóm tắt tối ưu hóa chi phí đầy đủ cho Maya.

Ba tháng làm việc. 34.092 đô la tiết kiệm hàng năm đã xác định, hầu hết đã được thực hiện.

"Còn lại gì?" Maya hỏi.

"Các tối ưu hóa tôi chưa chắc chắn," Tom nói. "Cấu hình Aurora có thể điều chỉnh kích thước thêm nhưng tôi muốn thêm một quý dữ liệu trước khi cam kết. Và có một câu hỏi về truyền dữ liệu mà tôi chưa phân tích đầy đủ."

"Chi phí mạng."

"Vâng. Đó là điều tiếp theo."

Maya nhìn vào các con số. "Tom, tôi muốn hiểu một điều. Tối ưu hóa này — bạn đã làm việc với nó trong ba tháng. Đó là phần đáng kể thời gian của bạn."

"Khoảng 30%."

"Và bạn tìm thấy khoảng 34.000 đô la/năm. Vậy tối ưu hóa tự trả lại mình — trong bao lâu, vài tháng lương?"

Tom nhìn cô. "Khoảng vậy."

"Và mỗi năm sau đó, tiết kiệm thuần."

"Hay tái đầu tư thuần," anh nói. "Cùng tác động."

Maya gật đầu. "Đây là điều tôi muốn bạn làm. Không chỉ trong lưu trữ và cơ sở dữ liệu — trong mọi thứ. Biến tối ưu hóa chi phí thành chức năng liên tục trong vai trò của bạn."

Tom chưa bao giờ nghe công việc của mình được mô tả theo cách đó. Anh thấy điều đó vừa đúng vừa thỏa mãn.

Trong chương tiếp theo: danh mục chi phí còn lại cuối cùng — và danh mục làm hầu hết mọi người ngạc nhiên.
