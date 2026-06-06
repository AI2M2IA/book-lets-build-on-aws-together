# Chương 9: Khi Bảng Trở Nên Lớn

Căn bếp tại nhà hàng đối tác đầu tiên của Nimbus tỏa mùi tỏi và bánh mì ấm ngay cả lúc mười giờ sáng. Maya đã có mặt ở đó để demo, quan sát một đầu bếp vuốt qua ứng dụng để ghi lại một sự thay thế — cá thay vì tôm, tạm thời hết hàng. Cú vuốt diễn ra. Menu cập nhật. Một khách hàng ở khu vực khác của thành phố thấy thay đổi trong vòng vài giây.

Điều đó đã có cảm giác như phép màu.

Trở lại văn phòng, phép màu đã bắt đầu chậm lại.

Bảng menu có 50.000 mục.

Đó là qua 287 nhà hàng — số lượng đối tác đã bùng nổ từ bốn mươi bảy của thời cân bằng tải lên gần ba trăm trong chưa đầy một năm — mỗi cái với các món đặc biệt theo ngày, các mục theo mùa và các biến thể khu vực. Một số mục có các thông số — kích thước, độ cay, lựa chọn protein. Một số có các gói combo tham chiếu đến các mục khác. Một số xuất hiện trên menu chỉ vào ngày thường, hoặc chỉ trong giờ trưa, hoặc chỉ ở một số thành phố nhất định.

Truy vấn SQL truy xuất toàn bộ menu của một nhà hàng từng trả về trong 200 mili giây.

Bây giờ nó mất bốn giây.

Bốn giây là sự khác biệt giữa ai đó đặt hàng và ai đó đóng ứng dụng. Leo đã chạy kế hoạch truy vấn. Tom đã xem xét cấu hình chỉ mục. Priya đã tăng số lượng read replica. Không có gì tạo ra khác biệt đáng kể.

Và điều đó đã thay đổi tâm trạng trong phòng.

---

**Nỗ Lực Đầu Tiên: Thêm Chỉ Mục**

Leo mở kế hoạch truy vấn. Anh lần theo nó một cách cẩn thận.

"Vấn đề là phép join này," anh nói. "Khi chúng ta kéo menu của một nhà hàng, chúng ta join bảng menu_items với bảng modifiers, rồi với bảng combos, rồi với bảng availability_windows. Bốn bảng, ba phép join, năm mươi nghìn hàng."

Anh thêm một chỉ mục trên `restaurantId` trong mọi bảng. Anh chạy lại truy vấn. Hai giây. Tốt hơn, nhưng chưa đủ tốt.

Tom đã đọc đâu đó về query hint. Anh dành cả buổi chiều để tinh chỉnh. Một phẩy ba giây. Vẫn không tốt.

"Nếu chúng ta phi chuẩn hóa thì sao?" Leo hỏi. "Gộp các modifier vào một cột JSON ngay trên bảng menu_items. Ít phép join hơn."

Họ thử nó. Đúng một giây. Cảm giác như có tiến triển. Maya gửi tin nhắn cho các đối tác nhà hàng nói rằng họ đã khắc phục vấn đề tốc độ. Đó là thứ Ba.

Đến thứ Năm truy vấn lại trở về 2,8 giây. Dữ liệu của họ đã tăng. Nhiều nhà hàng hơn đã tham gia. Nhiều mục hơn cho mỗi nhà hàng. Truy vấn tưởng như đã được giải quyết thì lại chưa được giải quyết.

"Cách tiếp cận chỉ mục đang theo kịp dữ liệu hôm nay," Priya nói. "Nhưng chúng ta đang thêm bốn mươi nhà hàng mỗi tuần. Đến quý sau chúng ta sẽ có gấp đôi số mục. Truy vấn sẽ trông như thế nào khi đó?"

"Tối thiểu ba giây," Leo nói. "Có lẽ là năm."

"Vậy chúng ta đã mua được cho mình vài tuần."

"Đúng vậy."

Họ ngồi với điều đó. Một cách khắc phục có hạn sử dụng thì không thực sự là cách khắc phục.

---

**Nỗ Lực Thứ Hai: Read Replica**

Priya đã tăng số lượng read replica một lần rồi. Cô thử lại — bây giờ là hai read replica, và ứng dụng cân bằng tải giữa chúng. Lý thuyết là hợp lý: trải lưu lượng đọc ra, mỗi replica xử lý ít công việc hơn.

Nó giúp được một chút. Tải đỉnh giảm từ 2,8 giây xuống 2,2 giây.

"Đó là vì nút thắt không phải là số lượng lần đọc," Tom nói, nhìn vào các chỉ số cơ sở dữ liệu. "Đó là chính truy vấn. Nhiều replica hơn nghĩa là nhiều server hơn chạy cùng một truy vấn chậm. Truy vấn vẫn chậm."

"Cái đó tốn bao nhiêu mỗi tháng?" anh thêm vào, vì anh luôn hỏi. "Hai read replica thêm trên db.r5.large — đó là khoảng 350 đô la mỗi tháng. Cho việc cải thiện hai giây."

Leo đóng bảng điều khiển replica.

"Vậy thêm phần cứng không khắc phục được một truy vấn tồi," Maya nói.

"Khi một vấn đề sống sót qua việc lập chỉ mục, các nỗ lực bộ nhớ đệm, và các replica thêm vào," Leo nói chậm rãi, "có lẽ vấn đề không phải là cấu hình. Có lẽ nó là hình dạng của hệ thống."

Đó là khởi đầu của một cuộc trò chuyện dài hơn.

---

*Tuần trước, cuối cùng đội ngũ đã kiểm soát được RDS. Standby Multi-AZ, sao lưu tự động, một read replica xử lý các truy vấn báo cáo. Vấn đề DBA — cái từng đánh thức Leo dậy vào ban đêm — đã được giải quyết. Lớp cơ sở dữ liệu được quản lý đã ổn định. Nhưng ổn định không có nghĩa là nhanh, và nhanh bây giờ là vấn đề. Bảng menu đã bắt đầu chạm tới các giới hạn mà nhiều replica hơn cũng không thể khắc phục. Hình dạng của chính dữ liệu là sai.*

---

**Vấn Đề Với Việc Nhét Mọi Thứ Vào Bảng**

Đây là sự căng thẳng cốt lõi của cơ sở dữ liệu quan hệ: chúng được thiết kế để lưu trữ dữ liệu *có cấu trúc* trong các hình dạng *cố định*.

Nếu mọi mục menu đều có cùng các trường — tên, giá, mô tả, danh mục — SQL sẽ hoàn hảo. Bạn sẽ có một bảng `menu_items` gọn gàng, các hàng cho mỗi mục, và các truy vấn có ý nghĩa.

Nhưng menu thực tế không hoạt động theo cách đó.

Một mục có thể có một modifier "độ cay". Một mục khác có thể có một "lựa chọn protein". Mục thứ ba có thể có combo lồng nhau — "đặt suất ăn gia đình và bạn nhận được hai món chính, hai món phụ, và một đồ uống." Cấu trúc của dữ liệu thay đổi *theo từng mục*.

Trong SQL, bạn có hai lựa chọn:

**Lựa chọn 1**: Tạo một cột cho mọi modifier có thể có. Điều này tạo ra một bảng rất rộng nơi hầu hết các cột đều trống hầu hết thời gian.

**Lựa chọn 2**: Tạo một bảng modifiers riêng và join nó với bảng menu_items. Cách này hoạt động, nhưng các menu phức tạp đòi hỏi nhiều phép join, và ở năm mươi nghìn mục với khối lượng đọc cao, những phép join đó trở nên tốn kém.

"Có một lựa chọn thứ ba," Priya nói, người đã lặng lẽ đọc tài liệu ở góc phòng.

Cô mở một tab mới. "Nếu dữ liệu không cần phải nhét vừa vào một bảng thì sao?"

**Cách Khác Để Nghĩ Về Dữ Liệu**

Cơ sở dữ liệu quan hệ lưu trữ dữ liệu dưới dạng các hàng trong các bảng. Mỗi hàng phải tuân theo lược đồ của bảng. Lược đồ được thống nhất từ trước.

Cơ sở dữ liệu NoSQL lưu trữ dữ liệu khác đi. Một cách tiếp cận phổ biến là *mô hình tài liệu*: mỗi bản ghi được lưu trữ dưới dạng một tài liệu độc lập (thường là JSON), và các tài liệu trong cùng một bộ sưu tập không nhất thiết phải có cùng các trường.

Một mục menu trong mô hình tài liệu có thể trông như thế này:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Một mục khác có thể trông hoàn toàn khác:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Các hình dạng khác nhau. Cùng một bộ sưu tập. Không có vấn đề gì.

"Vậy cơ sở dữ liệu giống một hệ thống lưu hồ sơ hơn là một bảng," Maya nói.

"Chính xác," Priya nói. "Bạn có thể đặt bất kỳ tài liệu nào vào bất kỳ ngăn kéo nào. Bạn không phải cắt tài liệu cho vừa một kích thước cố định."

**Gặp Gỡ DynamoDB**

Amazon DynamoDB là dịch vụ cơ sở dữ liệu NoSQL được quản lý của AWS. Nó lưu trữ dữ liệu dưới dạng các mục (không phải hàng), và các mục được thu thập vào các bảng (cách đặt tên tương tự SQL, nhưng hành vi khác nhau).

Mỗi mục trong một bảng DynamoDB phải có một **khóa chính**, xác định duy nhất nó. Mọi thứ còn lại đều linh hoạt.

Khóa chính có thể là một trong hai dạng:

**Chỉ khóa phân vùng**: Một thuộc tính duy nhất phải là duy nhất trong tất cả các mục.

**Khóa phân vùng + khóa sắp xếp (khóa chính phức hợp)**: Hai thuộc tính *cùng nhau* tạo thành một tổ hợp duy nhất. Điều này cho phép bạn có nhiều mục với cùng một khóa phân vùng, được phân biệt bởi khóa sắp xếp của chúng.

Đối với menu của Nimbus:

- Khóa phân vùng: `restaurantId`
- Khóa sắp xếp: `itemId`

Điều này có nghĩa là bạn có thể truy xuất hiệu quả tất cả các mục cho một nhà hàng cụ thể — DynamoDB biết chính xác phân vùng nào để tìm kiếm.

"Tại sao nó được gọi là khóa phân vùng?" Tom hỏi.

"Và nếu ai đó cố gắng đột nhập thì sao?" Priya hỏi. "Nếu khóa phân vùng có thể đoán được, liệu ai đó có thể spam một phân vùng bằng các lần ghi và cố tình gây ra tình trạng điểm nóng không?"

"Có," Leo nói. "Đó thực ra là một vector tấn công từ chối dịch vụ cho các bảng được thiết kế tồi. Đó là một lý do nữa để chọn các khóa có cardinality cao."

Priya ghi điều đó xuống.

**Cách DynamoDB Lưu Trữ Dữ Liệu Bên Trong**

DynamoDB được xây dựng để mở rộng theo chiều ngang đến các kích thước khổng lồ. Nó đạt được điều này thông qua *phân vùng* — dữ liệu được chia ra trên nhiều máy vật lý dựa trên khóa phân vùng.

Khi bạn ghi một mục, DynamoDB băm giá trị khóa phân vùng và dùng giá trị băm đó để xác định phân vùng vật lý nào (và do đó server nào) lưu trữ mục đó. Khi bạn đọc một mục, DynamoDB thực hiện cùng phép tính để tìm nó ngay lập tức.

Hãy nghĩ về nó như một hệ thống bưu chính. Nếu mọi phong bì đều có mã bưu chính, dịch vụ bưu chính không đọc từng phong bì để xác định nó thuộc về đâu — nó phân loại theo mã bưu chính. DynamoDB phân loại theo giá trị băm của khóa phân vùng.

"Khoan đã — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Tại sao việc chọn khóa phân vùng lại quan trọng đến vậy? Chúng ta không thể chọn bất kỳ thứ gì sao?"

Đây là câu hỏi đúng. Khóa phân vùng là quyết định thiết kế quan trọng nhất duy nhất trong một lược đồ DynamoDB. Đây là lý do:

Nếu bạn chọn một khóa phân vùng với cardinality thấp — chẳng hạn `available: true/false`, hoặc `category: "main/side/drink"` — hầu hết dữ liệu của bạn đổ về cùng một vài phân vùng. DynamoDB gọi đây là "phân vùng nóng". Một server xử lý phần lớn lưu lượng. Nó bị quá tải. DynamoDB bắt đầu điều tiết (throttle) các yêu cầu. Người dùng bắt đầu thấy lỗi.

- **Tốt**: Cardinality cao, các giá trị phân phối đều (`restaurantId` với nhiều nhà hàng)
- **Xấu**: Cardinality thấp (`true/false`, `category`) — hầu hết dữ liệu đổ vào một vài phân vùng, tạo ra "điểm nóng"

"Vậy nếu tôi dùng `available: true` làm khóa phân vùng," Leo nói chậm rãi, "tất cả các mục có sẵn sẽ chất đống trên cùng một phân vùng."

"Và cơ sở dữ liệu của bạn sẽ nóng chảy vào giờ cao điểm bữa tối," Priya xác nhận.

Leo từ từ đóng laptop lại.

---

**Sự Cố Phân Vùng Nóng**

Họ sẽ không phải tưởng tượng ra nó. Nhiều tháng sau — trong tháng thứ hai của họ với DynamoDB, trước khi họ thực sự thấm nhuần quy tắc này — họ sẽ học nó theo cách khó khăn.

Đội ngũ đã ra mắt một tính năng mới: huy hiệu "Mục Nổi Bật". Các đối tác nhà hàng có thể đánh dấu tối đa năm mục là nổi bật. Tính năng này lưu trữ một thuộc tính `featured: true` trên mỗi mục.

Leo nghĩ rằng sẽ hữu ích nếu truy vấn tất cả các mục nổi bật trên tất cả các nhà hàng — cho một widget "mục đang thịnh hành" trên trang chủ. Anh đã tạo một chỉ mục thứ cấp để hỗ trợ truy vấn này. Chỉ mục dùng `featured` làm khóa phân vùng của nó.

"Sẽ ổn thôi," anh đã nói. "Có thể có bao nhiêu mục nổi bật chứ?"

Khoảng một nghìn hai trăm, trải trên hai trăm bốn mươi nhà hàng.

Nhưng widget "mục đang thịnh hành" tải trên mọi trang. Mỗi lần tải trang kích hoạt một truy vấn đối với chỉ mục `featured`. Tất cả một nghìn hai trăm mục đều nằm trên hai phân vùng — `true` và `false`. Phân vùng `true` chịu mọi cú đánh.

Giờ cao điểm bữa tối tối thứ Sáu. Tám nghìn người dùng đồng thời. Tất cả đang tải trang chủ.

Tỷ lệ lỗi DynamoDB tăng vọt lên mười tám phần trăm. Một số người dùng nhận được widget thịnh hành trống. Một số nhận được vòng xoay tải. Một số nhận được lỗi lan ra cả luồng đặt hàng.

Leo kéo các chỉ số ra. "Phân vùng chỉ mục đang bị điều tiết," anh nói. "Chúng ta đang chạm giới hạn thông lượng trên một phân vùng duy nhất."

"Sao lại thế?" Priya hỏi.

"Khóa `featured` chỉ có hai giá trị. Tất cả một nghìn hai trăm mục nổi bật đều nằm trên cùng một phân vùng. Mỗi lần tải trang chủ đều đánh vào phân vùng đó."

Họ tắt widget thịnh hành trong vòng ba phút. Tỷ lệ lỗi giảm về không.

"Vậy một khóa phân vùng hai giá trị đã điều tiết chúng ta vào tối thứ Sáu," Tom nói.

"Đúng vậy," Leo nói.

"Cái đó tốn của chúng ta bao nhiêu?"

"Khoảng bốn mươi phút trải nghiệm suy giảm trên tám nghìn người dùng," Priya nói. "Tác động doanh thu, có lẽ vài trăm đơn hàng."

Leo thay thế chỉ mục bằng một thiết kế khác: một bảng DynamoDB chuyên dụng tên là `featured_items` với `restaurantId` làm khóa phân vùng và một Lambda được lên lịch — một đoạn mã nhỏ AWS chạy cho bạn (Chương 20) — cập nhật nó mỗi mười lăm phút từ bảng chính. Truy vấn trở thành một phép scan trên một bảng nhỏ, biệt lập thay vì một phân vùng nóng trên bảng chính.

"Hãy thiết kế các mẫu truy cập của bạn trước," Priya nói. "Rồi mới chọn mô hình dữ liệu của bạn."

"Tôi biết," Leo nói. "Bây giờ thì tôi biết rồi."

---

**Đọc và Ghi ở Quy Mô Lớn**

DynamoDB có thể xử lý hàng triệu yêu cầu mỗi giây. Nhưng nó cần biết phải cấp phát bao nhiêu dung lượng.

Có hai chế độ dung lượng:

**Dung lượng được cấp phép (Provisioned)**: Bạn chỉ định bao nhiêu đơn vị đọc và ghi bạn muốn. DynamoDB dành riêng dung lượng đó cho bạn và điều tiết lưu lượng vượt quá nó. Chi phí có thể đoán trước, giá thấp hơn cho mỗi yêu cầu.

Các đơn vị có định nghĩa chính xác, và kỳ thi mong đợi bạn biết chúng: một **Đơn Vị Dung Lượng Đọc (RCU)** là một lần đọc nhất quán mạnh mỗi giây của một mục lên đến 4 KB — hoặc hai lần đọc nhất quán cuối cùng cùng kích thước. Một **Đơn Vị Dung Lượng Ghi (WCU)** là một lần ghi mỗi giây của một mục lên đến 1 KB. Các mục lớn hơn tiêu thụ tỷ lệ thuận nhiều hơn: đọc một mục 12 KB theo nhất quán mạnh tốn 3 RCU; ghi một mục 3 KB tốn 3 WCU.

**Dung lượng theo yêu cầu (On-demand)**: DynamoDB tự động mở rộng với lưu lượng thực tế của bạn. Không cần lập kế hoạch dung lượng định kỳ. Chi phí cao hơn cho mỗi yêu cầu, và đơn giản hơn nhiều về mặt vận hành, mặc dù các đợt tăng đột ngột vượt xa mẫu lưu lượng gần đây của một bảng vẫn có thể gây điều tiết nếu chúng tăng quá nhanh.

Đối với Nimbus, menu được đọc thường xuyên hơn nhiều so với được ghi. Một khách hàng mở ứng dụng, duyệt menu — đó là nhiều lần đọc. Một đối tác nhà hàng cập nhật menu của họ hai lần một tuần — đó là các lần ghi thỉnh thoảng.

"On-demand hợp lý cho bây giờ," Tom nói. "Chúng ta chưa biết các mẫu lưu lượng của mình. Tốt hơn là trả nhiều hơn cho mỗi yêu cầu còn hơn cấp phát thiếu và bị điều tiết."

Trí tuệ hạ tầng miễn cưỡng. Từ Tom. Đội ngũ đã chính thức trưởng thành.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi, mở công cụ tính giá lên.

"Ở khối lượng đọc hiện tại của chúng ta — khoảng bốn mươi nghìn lần đọc mỗi ngày — on-demand khoảng mười hai đô la một tháng," Leo nói. "Provisioned, nếu chúng ta tinh chỉnh đúng, gần bốn hơn. Nhưng chúng ta sẽ phải đặt dung lượng thủ công và mạo hiểm bị điều tiết nếu đoán sai."

Tom viết cả hai con số xuống. Anh luôn viết các con số xuống.

**Tính Nhất Quán: Dữ Liệu Của Bạn Mới Đến Mức Nào?**

DynamoDB sao chép dữ liệu trên nhiều Availability Zone một cách tự động. Điều đó rất tốt cho độ bền, nhưng nó cũng có nghĩa là bạn cần suy nghĩ rõ ràng về tính nhất quán của lần đọc.

Khi bạn đọc từ DynamoDB, bạn có một lựa chọn:

**Đọc nhất quán cuối cùng (Eventually consistent)**: Đây là mặc định. Nó rẻ hơn, và kết quả có thể tạm thời chậm hơn so với một lần ghi vừa hoàn thành gần đây.

**Đọc nhất quán mạnh (Strongly consistent)**: Đối với các lần đọc đối với một bảng hoặc chỉ mục thứ cấp cục bộ, DynamoDB có thể trả về giá trị đã commit mới nhất từ các lần ghi thành công trước đó. Điều này tốn nhiều dung lượng đọc hơn và không khả dụng cho chỉ mục thứ cấp toàn cục.

Đối với dữ liệu menu, nhất quán cuối cùng là ổn. Một mục menu cũ một mili giây thì không quan trọng.

Đối với dữ liệu xác nhận đơn hàng — "đơn hàng này đã được đặt chưa?" — bạn sẽ muốn nhất quán mạnh. Khách hàng không nên thấy thông báo "thử lại" khi đơn hàng của họ vừa được lưu.

"Nó giống như sự khác biệt giữa việc kiểm tra số dư ngân hàng của bạn trên ứng dụng so với gọi trực tiếp cho ngân hàng," Maya nói. "Ứng dụng có thể chậm hơn ba mươi giây. Cuộc gọi điện thoại luôn cập nhật."

Bạn có thể đang tự hỏi: nếu DynamoDB sao chép trên nhiều AZ một cách tự động, tại sao chế độ nhất quán lại quan trọng chút nào? Đây là câu trả lời: sao chép mất một khoảng thời gian nhỏ nhưng khác không — thường là vài mili giây. Một lần đọc nhất quán cuối cùng có thể được phục vụ từ một replica chưa nhận được lần ghi mới nhất. Một lần đọc nhất quán mạnh luôn liên hệ với bản sao chính của dữ liệu. Đối với hầu hết các trường hợp sử dụng (mục menu, danh mục sản phẩm, hồ sơ người dùng) độ trễ là không thể nhận thấy. Đối với các trường hợp sử dụng mà tính đúng đắn quan trọng ngay tại thời điểm đọc (xác nhận thanh toán, tính khả dụng của hàng tồn kho), bạn muốn nhất quán mạnh.

**Chỉ Mục Thứ Cấp: Truy Vấn Vượt Ra Ngoài Khóa Chính**

Nếu bạn cần truy cập dữ liệu theo cách khác với cách mà khóa chính cho phép thì sao?

DynamoDB hỗ trợ **chỉ mục thứ cấp** — các khóa thay thế cho phép bạn truy vấn cùng một dữ liệu bằng các thuộc tính khác.

**Chỉ Mục Thứ Cấp Cục Bộ (LSI)**: Dùng cùng khóa phân vùng với bảng, nhưng một khóa sắp xếp khác. Phải được định nghĩa tại thời điểm tạo bảng và không thể thêm sau. Chia sẻ dung lượng được cấp phép của bảng. Vì các LSI chia sẻ phân vùng, chúng hỗ trợ các lần đọc nhất quán mạnh.

**Chỉ Mục Thứ Cấp Toàn Cục (GSI)**: Một chỉ mục hoàn toàn riêng biệt với khóa phân vùng và khóa sắp xếp riêng của nó — khác với khóa chính của bảng. Có thể được thêm hoặc xóa sau khi bảng đã tồn tại, điều này cho bạn sự linh hoạt. Có các cài đặt dung lượng được cấp phép riêng của nó, tách biệt với bảng.

Đối với Nimbus: nếu họ cần truy vấn các mục theo khoảng giá, một GSI có thể hỗ trợ điều đó — nhưng với một quy tắc cần ghi nhớ: một khóa phân vùng chỉ chấp nhận các phép so sánh *bằng*, vì vậy `price` (mà bạn muốn so sánh theo khoảng) phải là **khóa sắp xếp**, với một thuộc tính nhóm như category hoặc `cuisineType#region` làm khóa phân vùng của GSI. Đó chính xác là chỉ mục được xây dựng trong phần hướng dẫn bên dưới.

Nếu bạn chọn một LSI, thì bạn có được tính nhất quán mạnh và dung lượng được chia sẻ, nhưng bạn bị khóa vào thiết kế đó tại thời điểm tạo bảng; nếu bạn chọn một GSI, thì bạn có được sự linh hoạt để thêm nó sau và mở rộng độc lập, nhưng bạn mất khả năng thực hiện các lần đọc nhất quán mạnh đối với chỉ mục.

---

**Hướng Dẫn Truy Vấn GSI**

Priya đi qua một ví dụ cụ thể. Nimbus muốn hỗ trợ một tính năng "duyệt theo ẩm thực": hiển thị tất cả các món có sẵn của một loại ẩm thực cụ thể trên tất cả các nhà hàng đối tác.

Bảng chính có `restaurantId` làm khóa phân vùng và `itemId` làm khóa sắp xếp. Bạn không thể truy vấn "tất cả các mục với cuisineType = Colombian" một cách hiệu quả — điều đó sẽ đòi hỏi một phép scan trên mọi phân vùng.

Họ tạo một GSI:

- Khóa phân vùng GSI: `cuisineType#region` (ví dụ "Colombian#NYC", "Mexican#Chicago")
- Khóa sắp xếp GSI: `price`

GSI sao chép một phép chiếu của mỗi mục — chỉ các trường cần thiết cho trang duyệt — vào bộ lưu trữ chỉ mục. Bây giờ một truy vấn đối với GSI với `cuisineType#region = "Colombian#NYC"` đi thẳng đến phân vùng đó của chỉ mục.

"Tại sao không chỉ dùng `cuisineType` đơn lẻ?" Leo hỏi.

"Vì cuisineType đơn lẻ có cardinality thấp," Priya nói. "Colombian, Mexican, Thai — tổng cộng hai mươi giá trị. Lại các phân vùng nóng. Thêm khu vực vào cho chúng ta Colombian#NYC, Colombian#Chicago, Colombian#LA. Nhiều phân vùng hơn, phân phối tốt hơn."

"Nghe có vẻ hơi chắp vá."

"Đó là một mẫu DynamoDB chuẩn. Nó được gọi là sharding khóa phân vùng. Đôi khi bạn phải làm việc với công cụ."

Truy vấn GSI trong mã trông như thế này:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Điều đó trả về tất cả các món Colombia ở Thành phố New York có giá từ 10 đến 25 đô la, được sắp xếp theo giá, trong khoảng 4 mili giây.

"Đó là nhanh hơn truy vấn SQL cũ một nghìn lần," Leo nói.

"Vì nó chỉ chạm vào một phân vùng của một chỉ mục," Priya xác nhận. "Không scan mọi hàng trong một bảng đã join."

---

**DynamoDB Streams: Phản Ứng Với Thay Đổi**

"Chúng ta đã nghĩ về điều gì xảy ra khi một mục menu được cập nhật chưa?" Priya hỏi một buổi sáng. "Một đối tác nhà hàng thay đổi giá. Chúng ta cần cập nhật chỉ mục tìm kiếm. Chúng ta cần vô hiệu hóa mục ElastiCache" — dịch vụ bộ nhớ đệm chúng ta sẽ gặp ở chương tiếp theo — "và chúng ta cần ghi lại thay đổi cho đường ống phân tích của mình."

"Chúng ta có thể làm tất cả những điều đó trong trình xử lý API," Leo nói. "Khi lần ghi xảy ra, kích hoạt tất cả các cập nhật phía sau."

"Và nếu một trong số chúng thất bại?"

"Thì... chúng ta thử lại."

"Nếu instance EC2 sập sau khi ghi nhưng trước khi các cập nhật phía sau? Dữ liệu đã được lưu, nhưng không có gì biết về thay đổi đó."

Leo suy nghĩ về điều đó.

"Chúng ta cần cập nhật được đảm bảo," anh nói. "Ngay cả khi mã ứng dụng của chúng ta thất bại giữa chừng."

Đây là điều mà **DynamoDB Streams** giải quyết.

DynamoDB Streams ghi lại một nhật ký theo thứ tự thời gian của mọi sửa đổi mục trong một bảng DynamoDB. Mỗi lần chèn, cập nhật, và xóa được ghi vào stream dưới dạng một sự kiện. Stream giữ lại các sự kiện trong 24 giờ.

Bạn có thể gắn một hàm Lambda vào stream. Mỗi khi một mục thay đổi, hàm Lambda được gọi với trạng thái trước-và-sau của mục. Lambda sau đó có thể:

- Cập nhật một chỉ mục tìm kiếm (OpenSearch)
- Vô hiệu hóa một mục bộ nhớ đệm trong ElastiCache
- Gửi một thông báo đến hệ thống khác
- Cung cấp cho một đường ống phân tích
- Sao chép thay đổi sang một bảng hoặc cơ sở dữ liệu khác

Sự khác biệt then chốt: Streams tách rời lần ghi khỏi các hiệu ứng phía sau. Lần ghi DynamoDB thành công độc lập với việc Lambda có thành công hay không. Nếu Lambda thất bại, DynamoDB thử lại nó. Nếu ứng dụng sập sau khi ghi, sự kiện stream vẫn còn đó — Lambda sẽ xử lý nó khi mọi thứ khôi phục.

"Vậy chúng ta ghi vào DynamoDB," Leo nói chậm rãi, "và DynamoDB đảm bảo việc xử lý phía sau xảy ra cuối cùng, ngay cả khi chúng ta sập."

"Chính xác," Priya nói. "Đó là sự khác biệt giữa hy vọng tất cả các hiệu ứng phụ của bạn chạy và việc cơ sở dữ liệu đảm bảo chúng."

Đối với Nimbus, họ nối DynamoDB Streams trên bảng menu vào một Lambda vô hiệu hóa các mục ElastiCache khi các mục menu thay đổi. Bộ nhớ đệm giữ nhất quán với cơ sở dữ liệu, một cách tự động, mà không có mã ứng dụng nào quản lý việc vô hiệu hóa.

"Streams tốn bao nhiêu?" Tom hỏi.

"Bạn trả tiền cho việc đọc từ stream — mỗi lần gọi Lambda đọc từ nó. Ở khối lượng của chúng ta, có lẽ hai đến ba đô la một tháng."

Tom phê duyệt nó mà không hỏi thêm. Anh đã học được khi nào hai đô la một tháng là đáng giá.

**Sự Đánh Đổi: Điều DynamoDB Không Thể Làm**

NoSQL không hoàn toàn tốt hơn SQL. Nó là một công cụ khác cho một công việc khác.

Điều DynamoDB từ bỏ:

**Truy vấn linh hoạt**: Trong SQL, bạn có thể lọc và sắp xếp theo bất kỳ cột nào. Trong DynamoDB, bạn chỉ có thể truy vấn hiệu quả theo khóa chính. Truy vấn theo các trường tùy ý đòi hỏi một *scan* (đọc mọi mục trong bảng), điều này tốn kém và chậm ở quy mô lớn.

**Phép join**: DynamoDB không làm phép join. Nếu bạn cần dữ liệu từ hai bảng, bạn thực hiện hai lần đọc riêng biệt trong mã ứng dụng của mình.

**Giao dịch**: DynamoDB hỗ trợ giao dịch, nhưng cơ sở dữ liệu quan hệ vẫn phù hợp tự nhiên hơn cho nhiều quy trình đa thực thể, các hệ thống nặng về báo cáo, và các thiết kế nặng về join.

**Sự quen thuộc**: Hàng thập kỷ công cụ, kỹ năng, và mô hình tư duy SQL không chuyển giao trực tiếp.

Điều DynamoDB xuất sắc:

- Các mẫu truy cập khóa-giá trị và tài liệu
- Quy mô khổng lồ (độ trễ một chữ số mili giây ở bất kỳ kích thước nào)
- Serverless, không quản lý hạ tầng
- Tự động mở rộng, sao chép Multi-AZ, sao lưu
- Hiệu suất có thể đoán trước bất kể khối lượng dữ liệu

"Vậy quy tắc là," Maya nói, "dùng DynamoDB khi bạn biết *chính xác* cách bạn sẽ truy cập dữ liệu. Dùng SQL khi bạn chưa biết."

Priya gật đầu. "Hãy thiết kế các mẫu truy cập của bạn trước. Rồi mới chọn cơ sở dữ liệu của bạn."

Đây là một trong những điều cao cấp nhất mà một cuộc trò chuyện về cơ sở dữ liệu có thể tạo ra.

---

**Khi DynamoDB Là Lựa Chọn Sai**

Tom, người đã đảm nhận mô-đun báo cáo tài chính, có một câu hỏi.

"Chúng ta đang xây dựng báo cáo tài chính," anh nói. "Tóm tắt doanh thu hàng tháng cho mỗi nhà hàng, tính toán thuế, lịch sử hóa đơn. Chúng ta có thể đặt cái đó vào DynamoDB không?"

Đội ngũ nhìn nhau.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi, trước khi Priya kịp.

Priya mỉm cười. Maya đang học theo thói quen này.

"Hãy dẫn chúng tôi qua các truy vấn," Priya nói với Tom.

Anh mở bản đặc tả lên. "Chúng ta cần: tổng doanh thu cho mỗi nhà hàng, nhóm theo tuần. Các mục bán chạy nhất theo số lượng đơn hàng, trên tất cả các nhà hàng. Doanh thu phân chia theo loại ẩm thực. Giá trị đơn hàng trung bình theo thành phố. So sánh năm-này-với-năm-trước cho báo cáo đối tác."

Leo đọc danh sách. "Mỗi cái trong số đó là một phép tổng hợp. Sum, group, average, compare."

"DynamoDB không có hàm tổng hợp," Priya nói. "Không có GROUP BY. Không có SUM. Không có AVG. Để trả lời 'tổng doanh thu cho mỗi nhà hàng tuần này,' bạn sẽ phải scan mọi đơn hàng trong tuần, kéo tất cả vào bộ nhớ ứng dụng, và tự tính toán."

"Nghe có vẻ tệ," Tom nói.

"Ở quy mô của chúng ta, đó là hàng chục nghìn bản ghi kéo vào bộ nhớ cho mỗi yêu cầu báo cáo. Nó sẽ chậm và tốn kém. Và mỗi lần chúng ta thêm một yêu cầu báo cáo mới, chúng ta sẽ viết mã scan-và-tính-toán mới."

"Vậy chúng ta dùng gì?"

"Cho báo cáo tài chính? RDS. PostgreSQL với các chỉ mục phù hợp. Các truy vấn bạn mô tả chính xác là những gì SQL được thiết kế cho. Chúng sẽ là mười dòng SQL. Chúng sẽ là hai trăm dòng mã scan DynamoDB."

DynamoDB là sai khi:

- Bạn không biết các mẫu truy cập của mình trước (báo cáo vốn dĩ mang tính khám phá)
- Bạn cần các phép tổng hợp (SUM, GROUP BY, COUNT) trên các tập dữ liệu lớn
- Dữ liệu của bạn có các mối quan hệ phức tạp và bạn cần phép join
- Bạn cần sự linh hoạt truy vấn ad-hoc — để đặt các câu hỏi bạn chưa nghĩ đến
- Dữ liệu của bạn có cấu trúc quan hệ cơ bản không ánh xạ tự nhiên sang khóa-giá trị

"Vậy lựa chọn không phải là 'công nghệ mới thì tốt hơn,'" Maya nói.

"Lựa chọn là 'dữ liệu của bạn có hình dạng gì, và bạn sẽ truy cập nó như thế nào,'" Priya xác nhận. "DynamoDB thực sự tốt hơn cho menu. Nó sẽ thực sự tệ hơn cho các báo cáo tài chính. Cả hai phát biểu đều đúng cùng một lúc."

Tom xây dựng báo cáo tài chính trên PostgreSQL. Truy vấn GROUP BY đầu tiên anh viết trả về trong 80 mili giây. Anh không phải viết một dòng mã scan nào.

---

**Khi Nào Dùng Mỗi Loại**

| Tình huống                                            | Hãy Dùng                |
|-------------------------------------------------------|-------------------------|
| Dữ liệu có cấu trúc, truy vấn phức tạp, báo cáo        | RDS (PostgreSQL, MySQL) |
| Hình dạng dữ liệu linh hoạt, truy cập theo khóa, quy mô lớn | DynamoDB           |
| Nặng về ghi với các mối quan hệ phức tạp              | RDS                     |
| Nặng về đọc với các mẫu truy cập có thể đoán trước     | DynamoDB                |
| Bạn cần phép join và tổng hợp                          | RDS                     |
| Bạn cần độ trễ mili giây ở hàng triệu yêu cầu/giây    | DynamoDB                |
| Giao dịch trên nhiều thực thể                          | RDS (thường là vậy)     |
| Serverless / đợt tăng lưu lượng không thể đoán trước  | DynamoDB on-demand      |
| Báo cáo tài chính, phân tích ad-hoc                   | RDS hoặc data warehouse |
| Event sourcing, ghi nhận thay đổi, xử lý thời gian thực | DynamoDB + Streams    |

Câu trả lời sai luôn là "luôn dùng một cái này hoặc cái kia". Nimbus cuối cùng dùng cả hai: RDS cho lịch sử đơn hàng và hồ sơ tài chính (có cấu trúc, quan hệ, cần báo cáo), DynamoDB cho menu (lược đồ linh hoạt, khối lượng đọc cao, truy cập theo ID nhà hàng).

## Cơ Sở Dữ Liệu Đúng Cho Khối Lượng Công Việc Đúng

Nhảy tới sáu tháng sau — sau khi việc di chuyển DynamoDB đã ổn định — và Nimbus có ba dự án mới trên bảng. Maya dẫn đội ngũ qua chúng vào một sáng thứ Ba.

"Thứ nhất: một bộ máy đề xuất. Chúng ta muốn hiển thị cho khách hàng các món họ có khả năng đặt dựa trên lịch sử của họ và những gì những người có khẩu vị tương tự đã đặt. Thứ hai: chúng ta đang chuyển dữ liệu menu để hỗ trợ nội dung phong phú hơn — các tài liệu menu đầy đủ trong JSON, cấu trúc khác nhau cho mỗi nhà hàng, lược đồ linh hoạt. Thứ ba: chúng ta sắp hoàn tất thương vụ mua lại Barato, và đội ngũ dữ liệu của họ chạy một cụm Cassandra cho dữ liệu hành vi khách hàng. Họ muốn mang nó lên AWS mà không cần viết lại các đường ống của họ."

Ba dự án. Ba yêu cầu dữ liệu rất khác nhau. Không cái nào trong số chúng là sự phù hợp DynamoDB rõ ràng.

"Tất cả những cái này đều cần các cơ sở dữ liệu khác nhau," Priya nói.

"Chúng ta có DynamoDB," Leo nói.

"Chúng ta có quyền chọn công cụ đúng," Priya nói.

**Amazon DocumentDB: Khi Khối Lượng Công Việc Của Bạn Nói MongoDB**

Dự án thứ hai — các tài liệu menu JSON phong phú với lược đồ linh hoạt, theo từng nhà hàng — mô tả một cơ sở dữ liệu tài liệu. Nimbus đã dùng lược đồ linh hoạt của DynamoDB cho menu, nhưng khi đội ngũ xây dựng các tính năng menu tinh vi hơn (các modifier lồng nhau, định giá theo thời gian, các cấu trúc combo phức tạp), mô hình truy vấn DynamoDB đang bộc lộ các giới hạn của nó. Đội ngũ muốn các truy vấn tài liệu phong phú hơn: tìm tất cả các mục menu nơi một modifier lồng nhau chứa một tùy chọn cụ thể, lọc theo các trường tùy ý bên trong cấu trúc JSON.

"Đó là một mẫu cơ sở dữ liệu tài liệu," Priya nói. "MongoDB."

"Chúng ta có thể chạy MongoDB trên EC2," Leo đề nghị.

"Hoặc chúng ta có thể dùng DocumentDB," Priya nói.

**Amazon DocumentDB** là một cơ sở dữ liệu tài liệu được quản lý tương thích MongoDB. Nó lưu trữ dữ liệu dưới dạng các tài liệu giống JSON với lược đồ linh hoạt — các tài liệu khác nhau trong cùng một bộ sưu tập có thể có các trường khác nhau. DocumentDB hỗ trợ ngôn ngữ truy vấn, các API, và các driver của MongoDB. Nếu khối lượng công việc của bạn hiện chạy trên MongoDB, DocumentDB nói cùng một ngôn ngữ. Con đường di chuyển là chuyển một chuỗi kết nối, không phải viết lại một ứng dụng.

DocumentDB được quản lý hoàn toàn: không vá lỗi, sao lưu tự động, tính sẵn sàng cao Multi-AZ, các read replica, và bộ lưu trữ tự động tăng khi dữ liệu của bạn tăng.

"Vậy chúng ta di chuyển menu sang DocumentDB," Leo nói. "Và các truy vấn chúng ta đã có trong cú pháp MongoDB cứ thế hoạt động?"

"Với việc kiểm tra tương thích nhỏ, đúng vậy," Priya xác nhận. "DocumentDB hỗ trợ hầu hết API truy vấn của MongoDB. Hãy kiểm tra ma trận tương thích trước khi giả định độ bao phủ đầy đủ, nhưng đối với các truy vấn và tổng hợp tài liệu, nó đơn giản."

Tín hiệu kỳ thi cho DocumentDB rất đơn giản: **"tương thích MongoDB"** hoặc **"kho lưu trữ tài liệu."** Nếu một kịch bản đề cập đến MongoDB hoặc dữ liệu hướng tài liệu, DocumentDB là câu trả lời AWS được quản lý.

**Amazon Neptune: Khi Các Mối Quan Hệ Chính Là Dữ Liệu**

Bộ máy đề xuất là một vấn đề khó hơn.

Câu hỏi không phải là "khách hàng này đã đặt gì?" — đó là một phép tra cứu DynamoDB đơn giản. Câu hỏi là: "những khách hàng nào có hồ sơ khẩu vị tương tự với khách hàng này, và những món nào mà những khách hàng đó đã thích mà khách hàng này chưa thử?"

Đó là một vấn đề đồ thị. Mô hình dữ liệu không phải là một bảng các hàng hay một bộ sưu tập các tài liệu. Nó là một mạng lưới các mối quan hệ: khách hàng kết nối với các món (đã đặt, đã đánh giá, đã xem), các món kết nối với các nhà hàng và các loại ẩm thực, các nhà hàng kết nối với các khu phố và thành phố. Đề xuất không nằm trong các điểm dữ liệu — nó nằm trong các đường đi giữa chúng.

"Chúng ta cần một cơ sở dữ liệu đồ thị," Priya nói.

**Amazon Neptune** là một cơ sở dữ liệu đồ thị được quản lý hoàn toàn. Nó hỗ trợ hai mô hình đồ thị: **property graph** (được truy vấn bằng ngôn ngữ duyệt Gremlin) và **RDF** (được truy vấn bằng SPARQL). Bạn chọn dựa trên ngăn xếp đồ thị hiện có hoặc sở thích của đội ngũ; cả hai chạy trên cùng hạ tầng Neptune.

Các cơ sở dữ liệu đồ thị được xây dựng có chủ đích cho các khối lượng công việc nơi các mối quan hệ giữa các điểm dữ liệu quan trọng như chính dữ liệu: mạng xã hội (ai kết nối với ai), các bộ máy đề xuất (những người dùng tương tự đã thích gì), phát hiện gian lận (những giao dịch nào chia sẻ các mẫu đáng ngờ qua các tài khoản), và các đồ thị tri thức (các khái niệm liên quan như thế nào).

Đối với bộ máy đề xuất của Nimbus: khách hàng và các món trở thành các nút trong Neptune. Các sự kiện đặt hàng trở thành các cạnh. Một phép duyệt Gremlin có thể tìm thấy, trong một truy vấn duy nhất, tất cả các món mà các khách hàng có lịch sử đặt hàng tương tự đã đánh giá cao, được sắp xếp theo độ mạnh của kết nối — mà không có các chuỗi JOIN phức tạp sẽ được đòi hỏi trong một cơ sở dữ liệu quan hệ hay các truy vấn nhiều lượt đi-về sẽ được cần đến trong DynamoDB.

Tín hiệu kỳ thi cho Neptune: **"mạng xã hội," "bộ máy đề xuất," "đồ thị tri thức," "phát hiện gian lận,"** hoặc **"duyệt đồ thị."** Nếu một kịch bản mô tả dữ liệu nơi các kết nối quan trọng như chính dữ liệu, Neptune là câu trả lời.

**Amazon Keyspaces: Cassandra Không Cần Vận Hành**

Thương vụ mua lại Barato đem một cụm Cassandra vào bức tranh. Cassandra là một cơ sở dữ liệu NoSQL cột rộng (wide-column) — được thiết kế cho thông lượng ghi rất cao và khả năng mở rộng theo chiều ngang, thường dùng cho dữ liệu chuỗi thời gian, nhật ký hoạt động người dùng, và đo từ xa IoT. Đội ngũ dữ liệu Barato dùng nó để theo dõi hành vi khách hàng: những mục nào được xem, những mục nào được thêm vào giỏ hàng, những mục nào bị bỏ dở.

Di chuyển Cassandra lên AWS có hai lựa chọn: chạy nó trên EC2 (chi phí vận hành của việc quản lý cụm, nâng cấp, mở rộng) hoặc dùng lựa chọn được quản lý.

"Amazon Keyspaces," Priya nói.

**Amazon Keyspaces** là một cơ sở dữ liệu được quản lý serverless, tương thích Cassandra. Nó hỗ trợ Ngôn Ngữ Truy Vấn Cassandra (CQL) — cùng ngôn ngữ truy vấn mà các đường ống của Barato đã dùng. Giống như DocumentDB cho MongoDB, Keyspaces là con đường được quản lý: giữ mã ứng dụng nguyên trạng, trỏ nó đến một điểm cuối Keyspaces thay vì cụm tự quản lý, và để AWS xử lý hạ tầng.

Keyspaces tự động mở rộng với lưu lượng, không đòi hỏi lập kế hoạch dung lượng, và là serverless — bạn trả tiền cho các lần đọc và ghi bạn thực sự thực hiện. Đối với dữ liệu theo dõi hành vi của Barato, đây là mô hình đúng: khối lượng cực kỳ biến đổi (giờ cao điểm bữa tối so với 3 giờ sáng), lược đồ cột rộng, thông lượng ghi cao.

Tín hiệu kỳ thi: **"tương thích Cassandra," "cột rộng," "CQL,"** hoặc **"khối lượng công việc Cassandra."**

**Chọn Cơ Sở Dữ Liệu Đúng: Một Bảng Tham Khảo**

Đến thời điểm này trong câu chuyện, bối cảnh cơ sở dữ liệu của Nimbus trông không giống gì với chương bảy. Công cụ đúng cho mỗi khối lượng công việc:

| Cụm Từ Kích Hoạt | Cơ Sở Dữ Liệu |
|---|---|
| "tương thích MongoDB" hoặc "kho lưu trữ tài liệu" | DocumentDB |
| "quan hệ đồ thị," "mạng xã hội," "bộ máy đề xuất" | Neptune |
| "tương thích Cassandra" hoặc "cột rộng" | Keyspaces |
| "khóa-giá trị ở bất kỳ quy mô nào," "độ trễ một chữ số mili giây" | DynamoDB |
| "quan hệ + serverless," "SQL tự động mở rộng" | Aurora Serverless |
| "dữ liệu có cấu trúc, truy vấn phức tạp, báo cáo" | RDS (PostgreSQL, MySQL) |

"Cái này sẽ tiếp tục tăng lên chứ?" Leo hỏi, nhìn vào danh sách.

"Có," Maya nói. "Vì các vấn đề khác nhau có các hình dạng khác nhau. Và dùng hình dạng sai khiến bạn tốn hoặc hiệu suất, hoặc thời gian lập trình viên, hoặc cả hai."

"Câu hỏi đúng không phải là 'chúng ta nên dùng cơ sở dữ liệu nào,'" Priya thêm vào. "Nó là 'dữ liệu của chúng ta có hình dạng gì, và chúng ta sẽ truy cập nó như thế nào?' Cơ sở dữ liệu sẽ theo sau câu trả lời."

Đó là điều quan trọng nhất cô đã nói về cơ sở dữ liệu trong hai năm.

## Điểm Mạnh và Hạn Chế

**Tại sao DynamoDB mạnh mẽ**:

- Độ trễ một chữ số mili giây ở bất kỳ quy mô nào
- Được quản lý hoàn toàn — không vá lỗi, không thiết lập sao chép, không cửa sổ bảo trì
- Sao chép Multi-AZ tự động (độ bền tích hợp sẵn)
- Mở rộng on-demand nghĩa là không lập kế hoạch dung lượng
- Tích hợp gốc với Lambda, API Gateway, Streams
- Khôi phục tại thời điểm bất kỳ (tương tự sao lưu tự động RDS)
- DynamoDB Streams — ghi nhận mọi thay đổi dưới dạng một sự kiện (hữu ích cho xử lý thời gian thực)

**Nơi DynamoDB trở nên phức tạp**:

- Thiết kế mẫu truy cập là không thể thương lượng — các sai lầm rất tốn kém để gỡ
- Các truy vấn phức tạp đòi hỏi chỉ mục thứ cấp (thêm chi phí và sự phức tạp)
- Các phép scan tốn kém — tránh chúng trong môi trường production
- "Giới hạn kích thước mục" là 400KB — các mục lớn cần bộ lưu trữ khác
- Định giá có thể làm bạn bất ngờ nếu bạn không hiểu chi phí đơn vị đọc/ghi
- Các phân vùng nóng là sát thủ thầm lặng — không có lỗi nào cho đến khi điều tiết bắt đầu

## Tóm Tắt

Việc thiết kế lại lược đồ đã mất hai ngày và rất nhiều không gian bảng trắng. Chọn một cơ sở dữ liệu NoSQL không chỉ là một quyết định kỹ thuật — nó thay đổi hoàn toàn cách bạn nghĩ về dữ liệu. Nhưng kết quả là một bảng menu có thể tăng đến bất kỳ kích thước nào mà không chậm lại. Cũng quan trọng không kém: đội ngũ đã học được đâu là các giới hạn của DynamoDB, và các cơ sở dữ liệu chuyên dụng nào cần tìm đến khi vấn đề thay đổi hình dạng.

- DynamoDB là dịch vụ cơ sở dữ liệu NoSQL được quản lý của AWS. Các mục là các tài liệu linh hoạt — không có lược đồ cố định. Mỗi mục phải có một **khóa chính**: chỉ một khóa phân vùng, hoặc một khóa phân vùng + khóa sắp xếp. Hãy chọn khóa phân vùng để phân phối đều — các phân vùng nóng gây ra điều tiết.
- Dung lượng **on-demand** tự động mở rộng; dung lượng **provisioned** rẻ hơn cho lưu lượng có thể đoán trước. Các lần đọc **nhất quán cuối cùng** rẻ hơn; các lần đọc **nhất quán mạnh** luôn cập nhật nhưng không khả dụng trên các GSI.
- **DynamoDB Streams** ghi nhận các thay đổi cấp độ mục theo thời gian thực — dùng chúng để điều khiển việc vô hiệu hóa bộ nhớ đệm, cập nhật chỉ mục tìm kiếm, và các đường ống phân tích.
- DynamoDB là lựa chọn sai cho báo cáo, các phép join phức tạp, và các truy vấn ad-hoc — dùng RDS cho những việc đó.
- **DocumentDB** (tương thích MongoDB), **Neptune** (cơ sở dữ liệu đồ thị), và **Keyspaces** (tương thích Cassandra) là các giải pháp thay thế được quản lý của AWS cho các khối lượng công việc không phù hợp mô hình khóa-giá trị của DynamoDB.

## Mẹo Thi

*SAA-C03 Domain: Thiết kế kiến trúc hiệu suất cao (Domain 3, Task 3.3)*

- Biết các quy tắc khóa phân vùng: **cardinality cao, phân phối đều**. Các phân vùng nóng là một bẫy thi phổ biến.
- **On-demand so với provisioned**: on-demand cho lưu lượng không thể đoán trước; provisioned (với Auto Scaling) cho các khối lượng công việc có thể đoán trước.
- **DynamoDB Streams**: ghi nhận các thay đổi cấp độ mục theo thời gian thực. Kịch bản thi phổ biến: "kích hoạt một hàm Lambda khi một bản ghi thay đổi."
- **Global Tables**: sao chép đa-Region, đa-active cho các ứng dụng phân tán toàn cầu và các kịch bản khắc phục thảm họa. Trong kỳ thi, đây là một tín hiệu mạnh khi khối lượng công việc cần đọc và ghi cục bộ ở nhiều hơn một Region.
- **DynamoDB TTL (Time to Live)**: đặt một thuộc tính dấu thời gian hết hạn trên các mục và DynamoDB xóa chúng tự động sau khi hết hạn — **miễn phí**, không tiêu thụ dung lượng ghi. Kích hoạt thi: "dữ liệu phiên/các mục tạm thời phải được xóa tự động sau N giờ với chi phí thấp nhất" → TTL, không bao giờ là một Lambda scan được lên lịch. Các mục đã hết hạn cũng có thể chảy vào DynamoDB Streams để lưu trữ.
- **DAX (DynamoDB Accelerator)**: lớp bộ nhớ đệm trong bộ nhớ cho DynamoDB. Giảm độ trễ đọc từ mili giây xuống micro giây. Kỳ thi dùng cái này khi các read replica RDS sẽ không giúp ích (vì nó là một bộ nhớ đệm dành riêng cho DynamoDB).
- **Khóa chính phức hợp**: khóa phân vùng + khóa sắp xếp cho phép các truy vấn linh hoạt trong một phân vùng. Ví dụ: truy xuất tất cả các đơn hàng cho một khách hàng giữa hai ngày — `customerId` là khóa phân vùng, `orderDate` là khóa sắp xếp.
- **GSI so với LSI**: GSI có thể được thêm sau khi tạo bảng; LSI thì không. LSI hỗ trợ các lần đọc nhất quán mạnh; GSI thì không. LSI chia sẻ dung lượng bảng; GSI có dung lượng riêng của nó.
- Biết khi nào KHÔNG dùng DynamoDB: các phép join phức tạp, báo cáo ad-hoc, các giao dịch đa thực thể → RDS thường là câu trả lời.
- **Chọn cơ sở dữ liệu có mục đích chuyên biệt** — kỳ thi thường trình bày một kịch bản và hỏi cơ sở dữ liệu nào phù hợp. Dùng cái này làm tham khảo nhanh của bạn: "tương thích MongoDB" → DocumentDB. "Đồ thị/mạng xã hội/bộ máy đề xuất/đồ thị tri thức" → Neptune. "Tương thích Cassandra/cột rộng" → Keyspaces. "Khóa-giá trị ở bất kỳ quy mô nào/độ trễ mili giây" → DynamoDB. "Quan hệ/truy vấn phức tạp/báo cáo" → RDS hoặc Aurora.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Giải thích sự khác biệt giữa một khóa phân vùng và một khóa sắp xếp. Khi nào bạn sẽ dùng cả hai?

*(Gợi ý: Hãy nghĩ về menu Nimbus — tại sao việc có restaurantId làm khóa phân vùng và itemId làm khóa sắp xếp khiến việc truy xuất toàn bộ menu của một nhà hàng trở nên hiệu quả?)*

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một công ty game toàn cầu lưu trữ hồ sơ người chơi trong DynamoDB. Mỗi hồ sơ bao gồm các trường như username, level, achievements, và inventory. Một số người chơi có 10 mục inventory; những người khác có vài trăm — các hồ sơ thay đổi về hình dạng nhưng mỗi cái đều nằm thoải mái dưới giới hạn kích thước mục 400KB của DynamoDB. Công ty cần độ trễ đọc một chữ số mili giây cho việc tra cứu hồ sơ trong lúc chơi game tích cực.

Cách tiếp cận thiết kế nào hỗ trợ TỐT NHẤT cho yêu cầu này?

A) Dùng DynamoDB với `playerId` làm khóa phân vùng và lưu trữ toàn bộ hồ sơ dưới dạng một mục duy nhất  
B) Di chuyển sang RDS Aurora với các read replica ở mỗi region  
C) Dùng DynamoDB với `level` làm khóa phân vùng để nhóm những người chơi có kỹ năng tương tự  
D) Dùng ElastiCache trước RDS để đạt độ trễ dưới mili giây

**Gợi ý 1**: Mẫu truy cập là "tra cứu một người chơi cụ thể theo ID." Khóa nào khiến điều đó hiệu quả?

**Gợi ý 2**: Một lựa chọn tạo ra một phân vùng nóng tồi tệ. Thuộc tính nào có cardinality rất thấp?

**Gợi ý 3**: DynamoDB đã cung cấp độ trễ một chữ số mili giây một cách tự nhiên.

**Đáp án**: A

**Giải thích**: Dùng `playerId` làm khóa phân vùng phân phối dữ liệu đều trên các phân vùng và cho phép tra cứu tức thời theo ID người chơi — chính xác là mẫu truy cập được mô tả. Mô hình tài liệu linh hoạt của DynamoDB xử lý các kích thước inventory thay đổi mà không cần thay đổi lược đồ.

**Tại sao không phải B?** RDS Aurora với các read replica thêm sự phức tạp và vẫn không phải là lựa chọn đầu tiên tự nhiên cho loại tra cứu hồ sơ theo khóa này ở quy mô game.

**Tại sao không phải C?** Dùng `level` làm khóa phân vùng tạo ra các phân vùng nóng nghiêm trọng — hầu hết lưu lượng đi đến level 1 (người chơi mới) hoặc level tối đa (cựu binh tích cực), để các phân vùng khác nhàn rỗi.

**Tại sao không phải D?** Câu hỏi mô tả DynamoDB, không phải RDS. Thêm ElastiCache trước RDS đưa vào hai dịch vụ mới khi chỉ DynamoDB đã giải quyết được vấn đề.

*SAA-C03 Domain: Thiết kế kiến trúc hiệu suất cao — Task 3.3*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Nimbus đang thêm một tính năng "yêu thích": khách hàng có thể lưu các mục menu yêu thích của họ và đặt lại chúng với một lần chạm.

Thiết kế bảng DynamoDB cho tính năng này. Khóa phân vùng sẽ là gì? Bạn có dùng một khóa sắp xếp không? Cấu trúc mục sẽ trông như thế nào?

Sau đó hãy cân nhắc: điều gì xảy ra nếu bạn cần hiển thị "100 mục được yêu thích nhiều nhất trên tất cả các khách hàng"? DynamoDB có thể trả lời điều đó một cách hiệu quả không? Nếu không, bạn sẽ thêm gì vào kiến trúc?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là luyện tập thiết kế cho các mẫu truy cập.)*

## Cảnh Sau Tín Dụng

"Tôi đã triển khai nó rồi — ồ." Leo đã chạy việc di chuyển menu sang DynamoDB vào tối thứ Năm mà không nói với ai. Nó hoạt động. Các lần đọc nhanh. Lược đồ linh hoạt. Các đối tác nhà hàng có thể thêm bất kỳ trường modifier nào họ muốn. Nhưng anh đã quên cập nhật các bảng điều khiển giám sát, và Priya đã dành hai mươi phút sáng thứ Sáu tự hỏi tại sao các chỉ số cơ sở dữ liệu lại đi ngang.

Anh vẫn cảm thấy hài lòng về bản thân.

Rồi Priya, sau khi khôi phục các bảng điều khiển, nhìn vào các chỉ số.

"Leo," cô nói, "mỗi lần tải trang đang thực hiện bốn mươi bảy yêu cầu DynamoDB."

"Một cho mỗi nhà hàng được hiển thị," Leo xác nhận. "Trang duyệt tải bốn mươi bảy nhà hàng gần nhất cho vị trí của khách hàng."

"Và mỗi yêu cầu trong số đó mất khoảng bốn mili giây."

Leo làm toán. Bốn mươi bảy nhân bốn. "Đó là... một trăm tám mươi tám mili giây chỉ cho menu. Trước khi kết xuất."

"Trên mỗi lần tải trang."

"Cho mỗi khách hàng."

Anh nhìn chằm chằm vào màn hình.

"Chúng ta cần một bộ nhớ đệm," anh nói.

Chương tiếp theo: lớp giữa ứng dụng Nimbus và cơ sở dữ liệu của nó giúp các truy vấn chậm trở nên nhanh.
