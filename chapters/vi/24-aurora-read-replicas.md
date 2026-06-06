# Chương 24: Cơ Sở Dữ Liệu Phát Triển Cùng Bạn

Hãy tưởng tượng một thư viện khởi đầu với hai kệ sách và một thủ thư. Như thế là đủ, trong một thời gian. Người thủ thư biết mọi thứ ở đâu. Các yêu cầu được đáp ứng nhanh chóng. Rồi thư viện lớn lên: mười kệ, hai mươi, bốn mươi. Vẫn cùng một thủ thư, cùng một quầy, cùng một tủ phiếu mục lục. Giờ đây tìm bất cứ thứ gì đều phải chờ đợi. Người thủ thư không hề chậm — chỉ là có nhiều thư viện hơn mức một người có thể phục vụ với tốc độ ban đầu.

Giải pháp không phải là một thủ thư nhanh hơn. Mà là một loại thư viện khác.

---

Sau khi giảm chi phí S3, Tom tiếp tục cuộc rà soát của mình. Tầng cơ sở dữ liệu là một loại vấn đề khác — không phải dữ liệu nhàn rỗi nằm sai lớp lưu trữ, mà là một hệ thống đang thực sự vật lộn dưới tải của sáu tháng tăng trưởng lưu lượng.

---

Các con số không hề dễ chịu.

Nimbus đang chạy RDS PostgreSQL: Multi-AZ, instance db.r6g.large. $340/tháng.

Leo mở bảng điều khiển các chỉ số CloudWatch. Các con số có một mô hình.

**DatabaseConnections**: 198 trên tối đa 200 trong giờ cao điểm thứ Sáu. Còn hai kết nối nữa là bão hòa. Ở mức 200, các nỗ lực kết nối mới sẽ thất bại với lỗi "too many connections" — một lỗi sẽ hiện ra dưới dạng HTTP 500 với các khách hàng đang đặt bữa tối.

**CPUUtilization**: 89% ở đỉnh trong giờ cao điểm ăn tối thứ Sáu. Instance được thiết kế để xử lý các đợt tăng vọt — một db.r6g.large có 2 vCPU và 16 GB bộ nhớ — nhưng CPU duy trì ở 89% có nghĩa là cơ sở dữ liệu đã ở mức công suất tối đa trước cả khi giờ cao điểm đến.

**ReadLatency**: 840 mili-giây P95. Sáu tháng trước, nó là 180ms. Sự suy giảm diễn ra dần dần — 10 đến 20ms mỗi tuần — vô hình cho đến khi nó trở thành thảm họa. Tuần trước cuộc rà soát của Tom, độ trễ P99 đã vượt qua một giây trọn vẹn. Các khách hàng nhấp vào menu nhà hàng phải chờ hơn một giây để trang tải xong.

**FreeStorageSpace**: còn lại 18% dung lượng lưu trữ đã cấp phát. Với tốc độ tăng trưởng hiện tại, cơ sở dữ liệu sẽ cạn dung lượng lưu trữ đã cấp phát trong khoảng 11 tuần.

"Mỗi cái trong số này đều có thể giải quyết riêng lẻ," Leo nói, nhìn vào bảng điều khiển. "Nhưng chúng ta có cả bốn cùng một lúc."

Đợt tăng vọt số lượng kết nối chỉ ra các vấn đề connection pooling trong ứng dụng — quá nhiều ECS task mở các kết nối cơ sở dữ liệu riêng của chúng. Vấn đề CPU chỉ ra các truy vấn tốn kém. Vấn đề độ trễ và vấn đề CPU gần như chắc chắn là cùng một vấn đề: một truy vấn chậm chạy quá thường xuyên.

"Khoan — nhưng *tại sao* chúng ta lại ở mức 198 kết nối?" Maya hỏi. "Chúng ta có ba ECS task. Làm sao chúng ta có gần 200 kết nối cơ sở dữ liệu?"

Mỗi ECS task dùng SQLAlchemy với kích thước pool mặc định là 5 kết nối cộng với một overflow là 10. Ba task × 15 kết nối tiềm năng = 45 kết nối từ ứng dụng. 153 kết nối còn lại đến từ các hàm Lambda phân tích, các worker chạy job nền, job Glue ETL, các kết nối cục bộ của nhóm phát triển thông qua bastion host, và một vài kết nối đã được mở nhưng không được đóng đúng cách bởi một phiên bản cũ của code.

"Vấn đề số lượng kết nối," Leo nói, "thực ra là một vấn đề ứng dụng trông giống một vấn đề cơ sở dữ liệu." Anh thêm PgBouncer (một connection pooler) vào danh sách công việc — nhưng nút cổ chai trước mắt là truy vấn chậm.

CPU cơ sở dữ liệu đang tăng vọt lên 89% trong giờ cao điểm ăn tối thứ Sáu. Các truy vấn đọc đang xếp hàng chờ. Độ trễ truy vấn P95 đã tăng gấp đôi trong sáu tháng.

"Cơ sở dữ liệu là nút cổ chai," anh nói. "Lưu lượng đã tăng. Cơ sở dữ liệu chưa mở rộng theo kịp."

"Chúng ta có thể chỉ cần làm instance lớn hơn không?" Maya hỏi. "Khoan — nhưng *tại sao* chúng ta có một cơ sở dữ liệu duy nhất xử lý tất cả các lệnh đọc và ghi? Tại sao chúng ta không phân tán việc này ngay từ đầu?"

"Có," Leo nói. "Đó là mở rộng theo chiều dọc. Chúng ta chuyển từ r6g.large sang r6g.xlarge. Nhiều CPU hơn, nhiều bộ nhớ hơn. Sẽ tốn kém hơn và giúp chúng ta có thêm thời gian."

"Nhưng nó không khắc phục vấn đề cơ bản," Priya nói. "Cuối cùng chúng ta sẽ chạm đến instance lớn nhất và cần một cách tiếp cận khác. Và chúng ta đã nghĩ đến điều gì xảy ra nếu một lệnh ghi vô tình đi đến một read replica chưa? Replica từ chối nó và đơn hàng âm thầm thất bại."

"Có hai cách tiếp cận," Leo nói. "Read replicas, hoặc Aurora."

"Sự khác biệt là gì?"

"Hãy nghĩ về nó như một thư viện," Leo nói, cầm lấy một cây bút lông. "Một thủ thư vừa nhận sách trả lại vừa trả lời câu hỏi của độc giả. Khi thư viện trở nên phổ biến, một hàng chờ hình thành. Cách khắc phục: thuê thêm thủ thư — nhưng chỉ để trả lời câu hỏi. Việc nhận sách vẫn đi qua quầy gốc."

"Đó là một read replica," Priya nói.

"Chính xác. Aurora tiến thêm một bước — nó thiết kế lại chính hệ thống kệ sách để mỗi thủ thư đều dùng chung cùng một kệ và luôn nhìn thấy cùng những cuốn sách, không có độ trễ. Không phải chờ các cập nhật rỉ ra từ quầy này sang quầy khác."

**Read Replicas: Phân Phối Lưu Lượng Đọc**

Hầu hết các ứng dụng web đọc dữ liệu thường xuyên hơn nhiều so với ghi. Một khách hàng duyệt menu thực hiện hàng chục truy vấn SELECT. Đặt một đơn hàng thực hiện một vài truy vấn INSERT/UPDATE. Tỷ lệ thường là 10:1 hoặc cao hơn.

**Read replica** là một instance RDS bổ sung nhận một bản sao của tất cả các lệnh ghi từ primary và cung cấp các lệnh ghi đó cho các truy vấn SELECT.

Cách hoạt động:

1. Các lệnh ghi của ứng dụng (INSERT, UPDATE, DELETE) đi đến cơ sở dữ liệu primary
2. Primary sao chép các thay đổi đó một cách không đồng bộ đến các read replica
3. Các lệnh đọc của ứng dụng (SELECT) được phân phối trên các read replica
4. Các read replica chia sẻ tải — mỗi cái xử lý một phần lưu lượng đọc tổng thể

Kết quả: cơ sở dữ liệu primary chỉ xử lý các lệnh ghi (và tùy chọn một số lệnh đọc). Các read replica xử lý tải đọc. Với tỷ lệ đọc/ghi 10:1, việc thêm một read replica sẽ giảm khoảng một nửa tổng tải của primary.

**Giới hạn quan trọng**: Sao chép là **không đồng bộ**. Có độ trễ sao chép — thường là mili-giây, nhưng có thể là giây khi tải nặng. Một lần đọc từ replica có thể thấy dữ liệu hơi cũ hơn so với primary. Đối với hầu hết các lần đọc (duyệt menu, xem lịch sử đơn hàng), điều này là chấp nhận được. Đối với "đơn hàng của tôi vừa được xử lý chưa?" — đọc từ primary.

**Read Replicas: Chi Tiết**

- Bạn có thể có tối đa 15 read replica cho mỗi instance RDS primary (MySQL, PostgreSQL, MariaDB)
- Read replica có thể ở cùng region hoặc khác region (cross-region replicas)
- Read replica có thể tự có read replica của chính chúng (chaining)
- Read replica là các endpoint riêng biệt — ứng dụng của bạn phải chuyển hướng các lệnh đọc đến endpoint của replica
- Read replica có thể được thăng cấp thành cơ sở dữ liệu độc lập (hữu ích cho DR)

Đối với Nimbus, Leo đã thêm một read replica. "Sẽ ổn thôi," anh nói khi Priya hỏi liệu anh đã kiểm tra logic định tuyến đọc/ghi của ứng dụng trước khi chuyển lưu lượng hay chưa. Anh chưa làm. Anh dành bốn mươi phút sau đó để xác minh rằng các lệnh ghi không đi đến endpoint của read replica.

Anh cập nhật ứng dụng để:

- Các thao tác ghi → endpoint primary
- Duyệt menu, lịch sử đơn hàng → endpoint replica

CPU trên primary giảm từ 89% xuống 41% ở giờ cao điểm.

**Vấn Đề Nhất Quán Đọc-Sau-Ghi**

Ba ngày sau khi bật read replica, một ticket hỗ trợ xuất hiện. Một đối tác nhà hàng đã cập nhật menu của họ — xóa một món đã ngừng kinh doanh — rồi gọi điện để xác nhận nó đã được xóa. Nhân viên dịch vụ khách hàng mở menu từ giao diện Nimbus. Món đó vẫn còn đó.

Hai mươi giây sau, nó biến mất.

Độ trễ sao chép không đồng bộ. Lệnh ghi (DELETE món menu) đi đến primary. Lệnh đọc của nhân viên dịch vụ khách hàng đi đến replica, vốn chưa nhận được thay đổi. Replica đang chậm hơn 15 giây vào thời điểm đó — không bất thường, nhưng hữu hình.

"Và sẽ thế nào nếu ai đó cố đột nhập thông qua cửa sổ nhất quán cuối cùng?" Priya hỏi. "Hoặc đơn giản — sẽ thế nào nếu một đơn hàng được đặt cho một món menu vừa bị xóa? Chúng ta sẽ tính tiền khách hàng và nhà hàng sẽ không có món đó."

Đây là một mối lo ngại nhất quán thực sự, không chỉ là một sự khó chịu về UX.

Giải pháp: xác định những lần đọc nào có yêu cầu nhất quán và định tuyến chúng đến primary.

**Các lần đọc có thể đi đến replica** (nhất quán cuối cùng là ổn):
- Khách hàng duyệt menu của một nhà hàng (cũ đi 1-2 giây là không thể nhận thấy)
- Các truy vấn lịch sử đơn hàng (một người dùng xem lịch sử đơn hàng của họ từ một phút trước)
- Các lần đọc kiểu phân tích (các nhà hàng hàng đầu tuần này)

**Các lần đọc phải đi đến primary** (yêu cầu nhất quán đọc-sau-ghi):
- Ngay sau một lệnh ghi, khi ứng dụng cần xác nhận lệnh ghi đã thành công
- Các lần đọc trạng thái đơn hàng ngay sau khi đặt đơn hàng
- Các lần đọc menu được kích hoạt bởi giao diện quản lý nhà hàng (nhà hàng vừa thay đổi menu)

Ứng dụng đã thêm một gợi ý định tuyến trong tầng kết nối cơ sở dữ liệu: nếu yêu cầu đến từ bảng điều khiển quản lý nhà hàng, định tuyến đến primary. Nếu nó đến từ một khách hàng đang duyệt, định tuyến đến replica. Header HTTP `X-Read-Consistency: strong` đóng vai trò làm tín hiệu.

"Không khó lắm," Leo nói. "Bạn chỉ cần biết những lần đọc nào yêu cầu nó."

"Và ghi lại tài liệu," Priya nói. "Để người tiếp theo thêm một endpoint mới biết nên dùng pool nào."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi. Đó là câu hỏi mở đầu tiêu chuẩn của anh cho bất kỳ dịch vụ mới nào.

Một read replica cùng loại instance tốn bằng với primary. Từ $340/tháng lên $680/tháng.

"Chúng ta đã tăng gấp đôi chi phí để giảm khoảng một nửa tải," Tom nói.

"Đúng vậy. Nhưng lựa chọn thay thế là chuyển sang một loại instance lớn hơn, điều đó cũng sẽ tốn kém hơn và sẽ không phân phối tải đọc."

Tom tính toán. Anh gật đầu, miễn cưỡng.

"Sẽ thế nào nếu primary thất bại?" Maya hỏi, trước khi Tom kịp chuyển sang Aurora. "Điều gì xảy ra với read replica?"

Leo giải thích việc thăng cấp replica.

**Nếu instance RDS primary thất bại**, AWS tự động failover sang replica standby trong cấu hình Multi-AZ (một loại replica khác — một standby đồng bộ, không phải read replica). Standby Multi-AZ trở thành primary mới. Các read replica tiếp tục phục vụ các lệnh đọc, giờ sao chép từ primary mới. Từ góc nhìn của ứng dụng, DNS của endpoint primary thay đổi để trỏ tới standby cũ, và ứng dụng kết nối lại.

Việc failover thường mất 60-120 giây cho RDS PostgreSQL. Trong cửa sổ đó, các lệnh ghi thất bại.

**Việc thăng cấp read replica** là một thao tác riêng biệt — và một kịch bản riêng biệt. Nếu bạn muốn lấy một read replica và biến nó thành một cơ sở dữ liệu độc lập, có thể ghi được (cho DR, cho việc di chuyển sang một region mới, hoặc vì primary đã không còn và bạn cần thăng cấp thay vì chờ failover Multi-AZ), bạn có thể thăng cấp một read replica thành một primary độc lập. Việc thăng cấp mất vài phút, sau đó replica không còn sao chép từ primary ban đầu nữa — nó là cơ sở dữ liệu của riêng nó.

"Chúng ta đã nghĩ đến điều gì xảy ra nếu primary us-west-2 sập hoàn toàn chưa?" Priya hỏi. "Không chỉ là một failover sang standby Multi-AZ — mà cả region."

"Nếu region thất bại," Leo nói, "standby Multi-AZ cũng ở us-west-2. Cả hai cùng thất bại."

"Vậy với một kịch bản DR cấp region thực sự," Tom nói, "chúng ta sẽ cần một read replica ở us-east-1 mà chúng ta có thể thăng cấp."

"Đúng. Một cross-region read replica. Chúng ta chưa có cái nào."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi. Anh đã biết câu trả lời sẽ liên quan đến một quyết định.

Một cross-region read replica của một db.r6g.large ở us-east-1: $340/tháng (cùng chi phí instance). Cộng với truyền dữ liệu cross-region cho việc sao chép: tối thiểu ở khối lượng ghi của Nimbus. Tổng cộng: khoảng $350/tháng cho một replica DR.

"Đó là $4,200 mỗi năm," Tom nói, "để bảo vệ chống lại một kịch bản đã xảy ra với các region AWS chưa đến năm lần trong mười năm."

"Còn chi phí cho việc Nimbus ngừng hoạt động 24 giờ trong một sự kiện cấp region là bao nhiêu?" Priya hỏi.

Tom tính toán. Anh không trả lời thành tiếng. Nhưng anh thêm "cross-region read replica" vào danh sách tồn đọng DR.

"Aurora là gì?" anh hỏi.

**Amazon Aurora: Tái Tư Duy Về Engine Cơ Sở Dữ Liệu**

Aurora là engine cơ sở dữ liệu quan hệ độc quyền của AWS, tương thích với MySQL và PostgreSQL. Nó được thiết kế từ đầu cho các khối lượng công việc trên cloud, tái tưởng tượng cách hoạt động của tầng lưu trữ trong một cơ sở dữ liệu quan hệ.

Trong một thiết lập RDS truyền thống (MySQL, PostgreSQL), lưu trữ và tính toán được kết hợp chặt chẽ. Engine cơ sở dữ liệu quản lý các tệp dữ liệu. Sao chép sao chép dữ liệu từ primary sang replica. Replica phải thực hiện lại mọi thao tác ghi.

Điều này tạo ra một trần giới hạn cho tốc độ sao chép: một replica chỉ có thể áp dụng các lệnh ghi nhanh bằng tốc độ nó có thể xử lý log sao chép. Trong một giai đoạn nặng về ghi — một lần import hàng loạt, một đợt flash sale, một cập nhật theo lô — replica có thể tụt lại phía sau. Độ trễ sao chép không phải là một lỗi trong cách triển khai; nó là một hệ quả của kiến trúc.

Priya đã đánh dấu điều này ngay lập tức khi Leo đề xuất read replica. "Và chúng ta đã nghĩ đến điều gì xảy ra nếu độ trễ sao chép tăng vọt lên 30 giây trong giờ cao điểm thứ Sáu chưa? Replica chậm hơn 30 giây. Một khách hàng đặt một đơn hàng, suất bếp được đặt chỗ trong primary, nhưng một khách hàng thứ hai truy vấn replica không thấy đặt chỗ đó. Hai đơn hàng, một suất."

"Đó là một vấn đề nhất quán tồn kho," Leo nói.

"Đó chính xác là một vấn đề nhất quán tồn kho," Priya xác nhận. "Đó là lý do các lần đọc tồn kho — 'món này còn không?' — phải đi đến primary."

Kiến trúc của Aurora giải quyết độ trễ một cách trực tiếp.

Aurora tách lưu trữ ra khỏi tính toán. Nó dùng một tầng lưu trữ phân tán, chịu lỗi, tự động sao chép dữ liệu trên ba Availability Zone trong sáu bản sao. Tầng tính toán (các instance cơ sở dữ liệu) nằm trên tầng lưu trữ này.

**Điều này thay đổi gì**:

**Read replicas**: Các Aurora replica không cần sao chép dữ liệu — chúng đã chia sẻ cùng một tầng lưu trữ. Điều này có nghĩa là:

- Lên đến 15 Aurora Replica chia sẻ cùng một volume lưu trữ (RDS thông thường cũng cho phép tối đa 15 read replica, nhưng mỗi cái là một bản sao dữ liệu đầy đủ)
- Độ trễ sao chép thường dưới 100 mili-giây (so với hàng giây cho RDS khi tải nặng)
- Replica có thể được thăng cấp thành primary trong dưới 30 giây (so với vài phút)

**Failover**: Vì các replica chia sẻ lưu trữ, failover nhanh hơn nhiều — việc thăng cấp không liên quan đến chuyển dữ liệu, chỉ là chuyển hướng các lệnh ghi.

**Lưu trữ**: Aurora tự động mở rộng lưu trữ theo từng mức 10GB, lên đến 128 TiB (256 TiB trong các phiên bản engine gần đây). Bạn không bao giờ cấp phát lưu trữ trước.

**Hiệu suất**: Aurora tuyên bố thông lượng gấp 5 lần MySQL tiêu chuẩn và gấp 3 lần PostgreSQL tiêu chuẩn cho các loại instance tương đương.

Bạn có thể đang tự hỏi: nếu tất cả các replica chia sẻ cùng một lưu trữ, chẳng phải lưu trữ đó trở thành một điểm thất bại duy nhất sao? Tầng lưu trữ của Aurora tự động sao chép dữ liệu trên sáu bản sao trong ba Availability Zone. Bản thân lưu trữ này có khả năng phục hồi cao hơn bất kỳ thiết lập RDS Multi-AZ đơn lẻ nào — nó được thiết kế để sống sót qua việc mất cả một AZ với mất mát dữ liệu bằng không và không cần failover.

Một câu hỏi phổ biến thứ hai: nếu Aurora tương thích MySQL/PostgreSQL, bạn có thể di chuyển từ RDS PostgreSQL sang Aurora PostgreSQL mà không cần thay đổi code ứng dụng không? Gần như vậy. Tính tương thích Aurora PostgreSQL nghĩa là Aurora triển khai giao thức wire của PostgreSQL và hỗ trợ phần lớn cú pháp và tính năng SQL của PostgreSQL. Hầu hết các ứng dụng di chuyển mà không cần thay đổi code nào. Các trường hợp đặc biệt: một số ít extension PostgreSQL không có sẵn trên Aurora, một số truy vấn catalog hệ thống trả về các giá trị khác, và một số thao tác quản trị nhất định có khác biệt. Đối với các lần di chuyển sản xuất, hãy kiểm tra với lưu lượng đọc song song trước khi chuyển các lệnh ghi.

Đối với Nimbus, việc di chuyển từ RDS PostgreSQL sang Aurora PostgreSQL mất một buổi chiều. Ứng dụng trỏ vào endpoint Aurora. Truy vấn menu — sau khi Leo thêm index mà Performance Insights đã chỉ ra là thứ tiêu thụ tải cơ sở dữ liệu nhiều nhất — chạy trong 4ms thay vì 620ms. Connection pool không còn chạm mức 198 trên 200. Độ trễ P95 giảm xuống 28ms.

"Đó là một engine cơ sở dữ liệu khác," Leo nói, "mà ứng dụng nghĩ là cùng một engine cơ sở dữ liệu."

"Và phần thú vị?" Maya hỏi.

"Sao chép cơ sở dữ liệu nhanh."

"Đã ghi nhận," Sam nói khẽ từ phía bên kia phòng, đã đang gõ phím. Sam là một kỹ sư backend gia nhập nhóm vài tuần trước để gánh bớt một phần công việc cơ sở dữ liệu cho Leo. Không ai hỏi anh đang làm gì.

**Giá Aurora: Câu Hỏi Của Tom**

Giá Aurora khác với RDS:

**Giá instance**: Tương tự như giá instance RDS theo loại.

**Giá lưu trữ**: $0.10 mỗi GB mỗi tháng (bạn trả cho những gì được lưu trữ, tự động mở rộng).

**Giá I/O**: Aurora tính phí cho mỗi yêu cầu I/O (đọc/ghi vào lưu trữ). Điều này có thể đáng kể cho các khối lượng công việc nặng về ghi.

"Khoan," Tom nói. "Chúng ta đang trả riêng cho I/O?"

"Aurora Serverless v2 và Aurora I/O-Optimized thay đổi mô hình giá này," Leo nói. "Aurora I/O-Optimized không tính phí I/O nhưng có giá lưu trữ và instance cao hơn. Tốt hơn cho các khối lượng công việc nặng về I/O."

Tom nhìn vào sự đánh đổi. Đối với Nimbus, vốn nặng về đọc (nhiều truy vấn menu, ít lệnh ghi), Aurora I/O-Optimized có thể tốn kém hơn. Giá Aurora tiêu chuẩn có thể phù hợp.

Một quy tắc kinh nghiệm hữu ích: nếu các khoản phí I/O của bạn vượt quá khoảng 25% tổng hóa đơn Aurora, I/O-Optimized có khả năng rẻ hơn. Đối với khối lượng công việc nặng về đọc của Nimbus, các khoản phí I/O thấp — giá tiêu chuẩn áp dụng. Đối với một khối lượng công việc nặng về ghi như một hệ thống ghi nhật ký sự kiện, I/O-Optimized có thể giảm chi phí đáng kể.

Đây là một quyết định chi phí thực sự mà các kỹ sư cấp cao đưa ra: bạn cần biết các mẫu I/O của khối lượng công việc để chọn đúng.

Nếu khối lượng công việc của bạn nhỏ, ổn định và có thể dự đoán, RDS PostgreSQL đơn giản hơn và rẻ hơn một cách đáng kể — nhưng nếu lưu lượng của bạn không thể dự đoán, khối lượng dữ liệu đang tăng vượt quá những gì bạn có thể cấp phát trước, hoặc bạn cần failover tự động trong dưới 30 giây, mô hình lưu trữ chia sẻ của Aurora biện minh cho chi phí cơ bản cao hơn.

**Aurora Serverless: Mở Rộng Mà Không Cần Lo Về Instance**

**Aurora Serverless v2** là một cấu hình tự động mở rộng năng lực tính toán dựa trên tải cơ sở dữ liệu thực tế. Thay vì chọn một kích thước instance cố định (db.r6g.large), bạn đặt năng lực tối thiểu và tối đa theo Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Mở rộng lên trong vài giây khi tải tăng
- Thu nhỏ xuống trong các giai đoạn nhàn rỗi — và kể từ cuối năm 2024, có thể tự động tạm dừng về tận 0 ACU khi không có kết nối nào (việc khôi phục mất khoảng 15 giây; tự động tạm dừng không hoạt động với RDS Proxy hoặc các proxy giữ kết nối khác)
- Chi phí: $0.12 mỗi ACU-giờ (cộng thêm lưu trữ và I/O)

Đối với các khối lượng công việc có lưu lượng biến đổi — các đợt tăng vọt vào thứ Sáu so với buổi sáng thứ Hai yên tĩnh của Nimbus — Serverless v2 giảm chi phí trong các giai đoạn ngoài giờ cao điểm và xử lý các đợt tăng vọt mà không cần cấp phát trước.

"Vậy trong đợt tăng vọt thứ Sáu," Leo nói, "Aurora tự động mở rộng lên. Sáng Chủ Nhật khi chúng ta gần như không có lưu lượng, nó thu nhỏ lại về mức tối thiểu."

"Và chúng ta chỉ trả cho năng lực mà chúng ta đang sử dụng," Tom nói.

"Chính xác."

Sau một tháng dùng Aurora Serverless v2, Leo mở biểu đồ ACU (Aurora Capacity Unit) của tuần trước.

Biểu đồ cho thấy hai mô hình rõ rệt. Trong tuần, cơ sở dữ liệu chạy ở 2-4 ACU — một tiếng vo ve nhẹ của các truy vấn nền, các health check ECS, các job Glue ETL, và kiểm thử phát triển. Vào tối thứ Sáu giữa 18:00 và 22:00, số lượng ACU leo lên:

```
Thứ Sáu 18:00  → 6 ACU
Thứ Sáu 19:00  → 14 ACU
Thứ Sáu 19:45  → 26 ACU  (đỉnh — đơn pizza tăng vọt trước giờ khai cuộc NFL)
Thứ Sáu 20:30  → 18 ACU
Thứ Sáu 21:00  → 12 ACU
Thứ Sáu 22:30  → 4 ACU
Thứ Bảy 02:00  → 2 ACU  (tối thiểu)
```

Việc mở rộng gần như tức thì — Aurora Serverless v2 mở rộng theo từng mức 0.5 ACU, và nó có thể thêm năng lực trong vài giây thay vì vài phút cần thiết để cấp phát một instance RDS mới.

"Đỉnh thứ Sáu đó tốn bao nhiêu?" Tom hỏi.

Ở mức $0.12 mỗi ACU-giờ: đỉnh thứ Sáu là 4 giờ trung bình 18 ACU → $8.64 cho giai đoạn đỉnh. Phần còn lại của tuần ở mức trung bình 3 ACU × 164 giờ × $0.12 = $59.04. Tổng cho tuần: $67.68.

Instance được cấp phát tương đương để xử lý đỉnh thứ Sáu (db.r6g.xlarge, 4 vCPU, 32 GB) sẽ tốn $0.937/giờ × 168 giờ = **$157.42 cho tuần** — bất kể đỉnh thứ Sáu có thực sự xảy ra hay không.

"Serverless v2 là $67 cho tuần. Một instance được cấp phát theo đỉnh là $157," Tom nói. "Đó là mức giảm 57%."

"Trên một cơ sở dữ liệu thực sự dùng 26 ACU trong bốn giờ vào thứ Sáu và 2 ACU cho phần còn lại của tuần," Leo nói. "Nếu cơ sở dữ liệu của bạn chạy ở tải cao ổn định suốt tuần, một instance được cấp phát sẽ rẻ hơn. Khoản tiết kiệm đến từ sự biến đổi."

Tom gật đầu chậm rãi. Anh đang thêm điều này vào một mô hình trong các ghi chú của mình: mọi câu chuyện tiết kiệm trong quý này đều có cùng một hình dạng. Bạn trả cho những gì bạn dùng, không phải cho những gì bạn có thể cần. Các lifecycle policy S3 chỉ trả cho lớp lưu trữ mà mỗi đối tượng xứng đáng. Lambda chỉ trả cho thời gian gọi. Fargate chỉ trả cho CPU và bộ nhớ của task. Aurora Serverless v2 chỉ trả cho các ACU mà cơ sở dữ liệu thực sự tiêu thụ.

Tom có biểu hiện của một người vừa tìm thấy chính xác thứ họ đang tìm kiếm.

**Khôi Phục Từ Một Lần Di Chuyển Tồi: Clone, PITR, và Nút Hoàn Tác**

Hai tuần sau khi chuyển sang Aurora, Sam chạy một script di chuyển cơ sở dữ liệu trong sản xuất. Script được cho là để xóa cột `legacy_menu_format` khỏi bảng `menu_items`. Anh chạy nó mà không có mệnh đề WHERE mà anh tưởng mình đã đưa vào.

Kết quả không phải là xóa một cột. Mà là một câu lệnh DELETE xóa sạch 40,000 hàng khỏi bảng `menu_items` — dữ liệu menu của khoảng 200 nhà hàng, biến mất.

Cảnh báo kích hoạt trong vòng 30 giây. Các lỗi đơn hàng tăng vọt. Dịch vụ menu bắt đầu trả về kết quả rỗng cho 200 nhà hàng.

"Lẽ ra nó phải có một mệnh đề WHERE," Sam nói, nhìn chằm chằm vào console.

Con đường khôi phục truyền thống: khôi phục từ snapshot backup tự động gần nhất. Các backup tự động chạy một lần mỗi 24 giờ, và một lần khôi phục-và-hoán-đổi đầy đủ sẽ mất 20-40 phút — trong khoảng đó *tất cả* các nhà hàng sẽ tối đèn, không chỉ 200 nhà hàng bị ảnh hưởng — và mọi đơn hàng được đặt kể từ backup sẽ bị mất.

Leo không làm thế. Giống như RDS tiêu chuẩn, Aurora giữ các backup liên tục cho **khôi phục theo thời điểm (point-in-time recovery — PITR)** — bạn có thể khôi phục cluster về bất kỳ giây nào trong cửa sổ lưu giữ backup, không chỉ về snapshot đêm gần nhất. Và quan trọng là, việc khôi phục tạo ra một cluster *mới*; sản xuất vẫn hoạt động trong khi bạn khôi phục.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

Dấu thời gian: 15:42:00Z — bốn phút trước khi Sam chạy script di chuyển. Trong khi cluster khôi phục được khởi tạo, phần còn lại của sản xuất tiếp tục phục vụ các nhà hàng không bị ảnh hưởng. Khi nó có sẵn, Leo dump các hàng `menu_items` của 200 nhà hàng bị ảnh hưởng từ cluster khôi phục và chèn chúng trở lại vào sản xuất. Tổng thời gian từ cảnh báo đến menu được khôi phục hoàn toàn: hơn một chút dưới 40 phút — và vì anh sửa các hàng một cách phẫu thuật thay vì hoán đổi cả cơ sở dữ liệu, không một đơn hàng nào được đặt sau 15:42 bị mất. Cluster khôi phục được xóa sau đó; nó đã hoàn thành nhiệm vụ của mình.

"Chúng ta đã mất gì?" Maya hỏi.

Sáu đơn hàng được đặt với các menu rỗng tạm thời đã thất bại ở khâu thanh toán — tất cả chúng đều ở trong hàng đợi SQS và có thể được phát lại. Không có dữ liệu khách hàng nào bị mất vĩnh viễn.

"Và đây là lúc **sao chép cơ sở dữ liệu nhanh** phát huy tác dụng," Leo nói, tập hợp cả nhóm lại sau đó. Aurora có thể tạo một **clone** của một cluster trong vài phút, bất kể kích thước cơ sở dữ liệu, dùng cơ chế copy-on-write: clone chia sẻ tầng lưu trữ của bản gốc và chỉ các trang mới hoặc đã thay đổi mới tiêu thụ thêm dung lượng. Một clone của cơ sở dữ liệu sản xuất hiện tại là rẻ, nhanh, và hoàn toàn cách ly — các lệnh ghi vào clone không bao giờ chạm đến sản xuất.

"Điều đó có nghĩa là," Priya nói, nhìn Sam, "script di chuyển được kiểm tra trên một clone của dữ liệu sản xuất trước khi nó từng chạy trong sản xuất. Đó là quy tắc mới."

Sam gật đầu. Anh đã viết nó lên một mảnh giấy ghi chú.

Còn một công cụ nữa thuộc về bức tranh này. Aurora MySQL — không phải Aurora PostgreSQL — có **Aurora Backtrack**: một tính năng tua lại cluster *tại chỗ* về một thời điểm cụ thể, mà không hề khôi phục sang một cluster mới. Nếu cluster của Nimbus là Aurora MySQL, Leo có thể đã tua lại nó về 15:42 trong dưới ba phút — mặc dù việc tua lại cả cluster cũng sẽ hoàn tác một số ít đơn hàng hợp lệ được ghi sau lần xóa, điều mà cách tiếp cận PITR phẫu thuật đã bảo toàn.

"Và sẽ thế nào nếu ai đó cố đột nhập dùng Backtrack — hoặc một lần khôi phục theo thời điểm?" Priya hỏi. "Một kẻ tấn công có thể tua lại các nhật ký kiểm toán hay dữ liệu tuân thủ không?"

Backtrack đòi hỏi quyền API `rds:BacktrackDBCluster`, và các lần khôi phục đòi hỏi `rds:RestoreDBClusterToPointInTime` — các hành động IAM riêng biệt so với các thao tác cơ sở dữ liệu bình thường. Các application role tiêu chuẩn không có các quyền này. Chỉ nhóm vận hành, với chính sách IAM rõ ràng cho phép họ, mới có thể dùng chúng. Cô thêm điều này vào danh sách kiểm tra rà soát quyền IAM.

Các lưu ý quan trọng: Aurora Backtrack chỉ có sẵn cho các cluster tương thích Aurora MySQL, không phải PostgreSQL. Cửa sổ Backtrack được cấu hình khi tạo cluster (1 giờ đến 72 giờ, tính phí mỗi giờ của cửa sổ backtrack). Và Backtrack ảnh hưởng đến cả cluster — bạn không thể Backtrack một bảng hay một tập hợp hàng. Để khôi phục cấp hàng một cách phẫu thuật — trên cả hai engine — cách tiếp cận PITR-sang-một-cluster-tạm-thời mà Leo dùng mới là công cụ.

**Aurora Global Database: Đọc Đa Vùng**

**Aurora Global Database** mở rộng Aurora trên nhiều AWS region:

- **Một primary region** xử lý tất cả các lệnh ghi
- **Lên đến năm secondary region** phục vụ các lệnh đọc với độ trễ sao chép thường <1 giây
- Các secondary region có thể được thăng cấp thành primary trong dưới 1 phút (cho các kịch bản DR)

Đối với việc mở rộng toàn cầu của Nimbus, Aurora Global Database sẽ cho phép một đối tác nhà hàng ở London truy vấn menu địa phương của họ từ EU read replica, trong khi tất cả các đơn hàng (lệnh ghi) vẫn đi qua primary ở Mỹ.

**RDS vs Aurora: Khi Nào Chọn Cái Nào**

| Yếu Tố            | RDS (PostgreSQL/MySQL)         | Aurora                                                      |
|-------------------|-------------------------------|------------------------------------------------------------|
| Chi phí           | Thấp hơn cho khối lượng nhỏ   | Cơ bản cao hơn, nhưng mở rộng tốt hơn                       |
| Tương thích       | Đầy đủ                        | Tương thích MySQL/PostgreSQL (với khác biệt nhỏ)           |
| Số replica tối đa | 15 (mỗi cái là bản sao đầy đủ)| 15 (chung volume lưu trữ)                                   |
| Độ trễ replica    | Có thể là giây                | Thường <100ms                                              |
| Lưu trữ           | Cấp phát cố định              | Tự động mở rộng đến 128 TiB (256 TiB ở bản gần đây)         |
| Thời gian failover| 60-120 giây                   | <30 giây                                                   |
| Tùy chọn serverless| Hạn chế                      | Aurora Serverless v2                                        |
| Tốt nhất cho      | Khối lượng ổn định, dự đoán được | Lưu lượng biến đổi, lượng đọc cao, cần failover nhanh    |

**Vượt Ra Ngoài Quan Hệ: Gia Đình Được Xây Cho Mục Đích Riêng**

Chương 9 đã giới thiệu DocumentDB (tài liệu tương thích MongoDB), Neptune (quan hệ đồ thị), và Keyspaces (wide-column tương thích Cassandra), và chương 10 đã giới thiệu MemoryDB (cơ sở dữ liệu primary bền vững tương thích Redis). Hai cái tên nữa hoàn thiện gia đình — bạn không cần đào sâu về chúng, chỉ cần khả năng nhận ra hình dạng dữ liệu nào trỏ tới engine nào, vì chúng xuất hiện liên tục như các lựa chọn đáp án:

- **Amazon Timestream**: dữ liệu **chuỗi thời gian (time-series)** — các số đo cảm biến, các chỉ số, telemetry. Tín hiệu thi: "các phép đo IoT theo thời gian." (Trong thực tế, sản phẩm hiện tại là Timestream for InfluxDB; phiên bản "LiveAnalytics" ban đầu đã ngừng nhận khách hàng mới vào năm 2025.)
- **Amazon QLDB**: bạn vẫn có thể gặp nó trong các câu hỏi cũ hơn như "sổ cái bất biến, có thể xác minh bằng mật mã." AWS đã ngừng QLDB vào năm 2025 (khuyến nghị dùng Aurora PostgreSQL thay thế) — hãy coi nó như một lựa chọn gây nhiễu cũ, không phải một khối xây dựng.

Quy tắc đáng viết lên bảng trắng: **hàng quan hệ → RDS/Aurora; key-value ở quy mô lớn → DynamoDB; tài liệu → DocumentDB; quan hệ → Neptune; thời gian → Timestream; Cassandra → Keyspaces; Redis bền vững → MemoryDB.** Khớp hình dạng, và câu hỏi sẽ tự trả lời.

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
- Việc khôi phục Serverless v2 từ tự động tạm dừng (khoảng 15 giây) và việc mở rộng lên nhanh có thể gây ra các đợt tăng độ trễ

## Tóm Tắt

Công việc lifecycle S3 trong chương 23 đã giảm chi phí bằng cách chuyển dữ liệu sang đúng lớp lưu trữ. Aurora làm điều tương đương cho tính toán: thay vì cấp phát theo tải đỉnh và trả tiền cho nó mọi lúc, Serverless v2 mở rộng để khớp với nhu cầu.

- **Read replicas** phân phối lưu lượng đọc từ primary. Sao chép không đồng bộ — độ trễ nhỏ chấp nhận được cho hầu hết các lần đọc. Định tuyến các lần đọc yêu cầu nhất quán ghi (các lần đọc ngay sau ghi, các lần đọc giao diện quản trị) đến primary, không phải replica.
- **Aurora** tái tưởng tượng tầng lưu trữ: phân tán, chia sẻ trên các replica, tự động mở rộng.
- Aurora cung cấp: 15 read replica, độ trễ replica <100ms, failover <30 giây, lưu trữ tự động mở rộng lên 128 TiB (256 TiB ở các bản gần đây).
- **Performance Insights**: xác định các truy vấn SQL cụ thể gây tải cơ sở dữ liệu trước khi quyết định cách mở rộng. Một index thiếu có thể loại bỏ nhu cầu về một instance lớn hơn.
- **Các chỉ số cơ sở dữ liệu CloudWatch**: DatabaseConnections (gần bão hòa có nghĩa là connection pooling của ứng dụng bị hỏng), CPUUtilization (CPU cao duy trì có nghĩa là các truy vấn tốn kém), ReadLatency (sự suy giảm theo thời gian thường là một bảng đang lớn lên với một index thiếu).
- **Aurora Serverless v2**: tự động mở rộng tính toán theo từng mức 0.5 ACU. Tính phí mỗi ACU-giờ. Rẻ hơn đáng kể so với các instance được cấp phát cho các khối lượng công việc có độ biến đổi cao giữa giờ cao điểm và ngoài cao điểm.
- **Khôi phục theo thời điểm (PITR)**: khôi phục một cluster Aurora về bất kỳ giây nào trong cửa sổ lưu giữ backup — vào một cluster *mới*, để sản xuất vẫn hoạt động trong khi bạn sao chép một cách phẫu thuật các hàng đã mất trở lại.
- **Sao chép cơ sở dữ liệu nhanh**: clone copy-on-write của một cluster trong vài phút bất kể kích thước. Rẻ, cách ly — dùng nó để kiểm tra các lần di chuyển trên dữ liệu sản xuất trước khi chúng chạy trong sản xuất.
- **Aurora Backtrack** (chỉ tương thích MySQL — không phải PostgreSQL): tua lại cluster tại chỗ về một thời điểm mà không cần khôi phục từ một backup. Có sẵn cho các cửa sổ lên đến 72 giờ. Đòi hỏi quyền IAM `rds:BacktrackDBCluster` — hạn chế cho nhóm vận hành.
- **Aurora Global Database**: primary ở một region, read replica ở tối đa năm region.
- **Thăng cấp read replica**: các cross-region read replica có thể được thăng cấp thành primary độc lập cho DR cấp region. Cân nhắc lợi ích DR so với chi phí chạy một instance đầy đủ thứ hai.
- Chọn RDS cho các khối lượng công việc nhỏ hơn, ổn định, có thể dự đoán. Chọn Aurora khi bạn cần mở rộng, failover nhanh, hoặc xử lý lưu lượng biến đổi.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Hiệu Năng Cao (Lĩnh vực 3, Nhiệm vụ 3.3)*

- **Aurora replica vs RDS read replica**: Aurora replica chia sẻ lưu trữ (độ trễ gần bằng không, failover <30 giây). RDS read replica sao chép dữ liệu (có thể có độ trễ, mất vài phút để failover).
- **Aurora Serverless v2**: "tự động mở rộng năng lực cơ sở dữ liệu," "lưu lượng cơ sở dữ liệu không thể đoán trước hoặc đột biến" → Aurora Serverless v2. Lưu ý: trong lịch sử chỉ Serverless **v1** mới thu nhỏ về không; mức tối thiểu của v2 là 0.5 ACU cho đến cuối năm 2024, khi v2 có được tính năng tự động tạm dừng về 0 ACU. Các câu hỏi thi cũ hơn vẫn có thể giả định v2 không thể thu nhỏ về không.
- **Aurora Global Database**: "cơ sở dữ liệu đa vùng," "đọc từ EU với độ trễ thấp từ primary Mỹ," "RTO < 1 phút cho failover cấp vùng" → Aurora Global Database.
- **Thời gian failover**: Aurora < 30 giây. RDS Multi-AZ 60-120 giây. Biết cả hai.
- **Các cơ sở dữ liệu xây cho mục đích riêng theo hình dạng dữ liệu**: "đồ thị xã hội / gợi ý / vòng gian lận" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "chuỗi thời gian / telemetry IoT" → Timestream. "cơ sở dữ liệu *primary* tương thích Redis (bền vững)" → MemoryDB (so với ElastiCache = cache). "Sổ cái mật mã bất biến" → QLDB trong các câu hỏi cũ (đã ngừng vào năm 2025).
- **Aurora I/O-Optimized**: Chi phí lưu trữ và instance cao hơn, không tính phí mỗi I/O. Dùng khi chi phí I/O chiếm ưu thế (nặng về ghi). Aurora tiêu chuẩn: chi phí lưu trữ thấp hơn, trả theo I/O. Dùng cho nặng về đọc.
- **Aurora Backtrack**: Tua lại cơ sở dữ liệu tại chỗ về một thời điểm cụ thể mà không cần khôi phục từ một snapshot backup. Chỉ có sẵn cho Aurora tương thích MySQL — với Aurora PostgreSQL, đáp án là khôi phục theo thời điểm (sang một cluster mới) hoặc một clone nhanh. Tín hiệu thi: "vô tình xóa dữ liệu, cần khôi phục nhanh mà không cần khôi phục toàn bộ backup" + MySQL → Backtrack.
- **Sao chép cơ sở dữ liệu nhanh của Aurora**: clone copy-on-write trong vài phút, bất kể kích thước cơ sở dữ liệu. Tín hiệu thi: "kiểm tra trên một bản sao của dữ liệu sản xuất nhanh chóng và rẻ" → clone, không phải khôi phục snapshot.

## Bài Tập

**Bài tập 1 — Ôn lại**

Giải thích sự khác biệt giữa Aurora và RDS read replica tiêu chuẩn. Tại sao độ trễ sao chép của Aurora thường thấp hơn?

*(Gợi ý: Sự khác biệt chính là lưu trữ chia sẻ so với sao chép dữ liệu. Hãy nghĩ về những gì mỗi replica phải làm khi có lệnh ghi đến.)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Cơ sở dữ liệu MySQL của một nền tảng mạng xã hội đang gặp độ trễ đọc cao do lưu lượng tăng. Ứng dụng nặng về đọc (95% đọc, 5% ghi). Nhóm cần độ trễ đọc nhất quán, ngay cả trong các đợt tăng lưu lượng. Họ cần failover tự động với thời gian ngừng hoạt động tối thiểu (mục tiêu RTO < 30 giây). Khối lượng dữ liệu đang tăng không thể đoán trước.

Giải pháp cơ sở dữ liệu nào đáp ứng TỐT NHẤT các yêu cầu này?

A) RDS MySQL Multi-AZ với năm read replica  
B) Aurora MySQL với Aurora Replicas và Aurora Serverless v2  
C) RDS MySQL với một loại instance lớn hơn (mở rộng theo chiều dọc)  
D) DynamoDB với DynamoDB DAX để cache đọc

**Gợi ý 1**: "RTO < 30 giây" — dịch vụ nào đạt được điều này? Kiểm tra thời gian failover cho mỗi lựa chọn.

**Gợi ý 2**: "Độ trễ đọc nhất quán trong các đợt tăng" — replica của dịch vụ nào có độ trễ gần bằng không so với độ trễ tiềm năng hàng giây?

**Gợi ý 3**: "Khối lượng dữ liệu tăng không thể đoán trước" — dịch vụ nào tự động mở rộng lưu trữ?

**Đáp án**: B

**Giải thích**: Aurora MySQL với Aurora Replicas cung cấp độ trễ sao chép gần bằng không (mili-giây, không phải giây) cho hiệu suất đọc nhất quán khi tải nặng. Aurora Serverless v2 tự động mở rộng tính toán trong các đợt tăng lưu lượng mà không cần cấp phát quá mức. Lưu trữ Aurora tự động mở rộng khi dữ liệu tăng. Failover Aurora (thăng cấp một replica) hoàn thành trong dưới 30 giây — đáp ứng yêu cầu RTO.

**Tại sao không phải A?** RDS Multi-AZ failover mất 60-120 giây — không đáp ứng RTO < 30 giây. Độ trễ RDS read replica tiêu chuẩn có thể đạt đến giây khi tải nặng — khó đảm bảo độ trễ đọc "nhất quán".

**Tại sao không phải C?** Mở rộng theo chiều dọc (instance lớn hơn) tăng năng lực nhưng không phân phối tải đọc. Cơ sở dữ liệu vẫn là một điểm thất bại duy nhất cho việc đọc.

**Tại sao không phải D?** DynamoDB là NoSQL — di chuyển từ MySQL sang DynamoDB đòi hỏi tái kiến trúc mô hình dữ liệu và các truy vấn ứng dụng, vượt xa phạm vi của nhiệm vụ cải thiện hiệu suất này.

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Hiệu Năng Cao — Nhiệm vụ 3.3*

**Bài tập 3 — Thử thách Kiến trúc** *(Tùy chọn)*

Nimbus đang thiết kế một cuộc mở rộng toàn cầu. Họ muốn các đối tác nhà hàng ở Bờ Đông, ở Đức, và ở Úc thấy dữ liệu đơn hàng của riêng họ nhanh chóng, không có độ trễ cross-region. Tuy nhiên, tất cả các lệnh ghi phải đi qua một primary us-west-2 duy nhất để duy trì tính nhất quán.

Thiết kế kiến trúc cơ sở dữ liệu dùng Aurora. Bạn sẽ cấu trúc Global Database như thế nào — ví dụ, các cluster secondary ở us-east-1, eu-central-1, và ap-southeast-2? Điều gì xảy ra nếu primary us-west-2 ngừng hoạt động? Bạn sẽ xử lý quá trình thăng cấp như thế nào?

*(Không có một câu trả lời đúng duy nhất. Mục tiêu là luyện tập thiết kế cơ sở dữ liệu đa vùng.)*

## Cảnh Sau Tín Dụng

Leo đã di chuyển sang Aurora với Serverless v2.

Đợt tăng vọt thứ Sáu đến và đi. CPU không bao giờ vượt quá 60%. Độ trễ truy vấn vẫn nhất quán. Aurora đã tự động mở rộng lên để xử lý tải, rồi thu nhỏ lại sau giờ cao điểm.

"Chi phí so với thứ Sáu tuần trước là bao nhiêu?" Tom hỏi vào sáng thứ Hai.

Leo mở billing explorer. "Thứ Sáu trung bình khoảng $2.16/giờ qua giờ cao điểm buổi tối. Sáng thứ Bảy là $0.24/giờ."

Tom không nói gì.

"Thiết lập cũ là cố định $0.47/giờ bất kể tải," Leo thêm vào.

"Vậy chúng ta đã trả nhiều hơn trong đợt tăng vọt so với trước," Tom nói.

"Đúng vậy. Nhưng ít hơn đáng kể trong giờ ngoài cao điểm. Chi phí ròng trong tuần thấp hơn."

Tom tính toán. Rồi gật đầu.

"Có một bài học ở đây," anh nói. "Câu hỏi đúng không phải là 'cái này có rẻ hơn không?' Mà là 'cái này có rẻ hơn cho mẫu sử dụng thực tế của chúng ta không?'"

"Đó," Priya nói từ phía bên kia phòng, "là bản năng của một kỹ sư cấp cao."

Tom trông có vẻ hơi giật mình khi được mô tả như vậy.

Trong chương tiếp theo: khi mạng của bạn là nút cổ chai, và tại sao một con đường cao tốc riêng tư có thể đáng giá khoản phí cầu đường.
