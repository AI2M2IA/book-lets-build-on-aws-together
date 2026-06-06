# Chương 10: Khi Cơ Sở Dữ Liệu Quá Chậm

Các chỉ số thời gian tải trang đang mở trên màn hình. Leo đã nhìn chúng hai mươi phút mà không nói gì.

Bốn mươi bảy yêu cầu DynamoDB mỗi lần tải trang. Một trăm tám mươi tám mili giây chỉ để truy xuất dữ liệu — trước khi trình duyệt hiển thị một pixel duy nhất.

Anh đã làm toán. Mười nghìn người dùng đồng thời vào một tối thứ Sáu, mỗi người tải trang duyệt khoảng một lần một phút: bốn trăm bảy mươi nghìn lần đọc DynamoDB mỗi phút. Chi phí là thật. Nhưng độ trễ mới là vấn đề thực sự. Một người dùng mở trang duyệt Nimbus phải chờ gần hai trăm mili giây trước khi bất cứ thứ gì xuất hiện — và đó là trên một kết nối nhanh.

---

*Tuần trước, việc thiết kế lại lược đồ DynamoDB đã hiệu quả. Bảng menu giờ đã linh hoạt — bất kỳ nhà hàng nào cũng có thể thêm bất kỳ modifier nào, bất kỳ cấu trúc combo nào, bất kỳ biến thể theo mùa nào. Hiệu suất trên các lần tra cứu riêng lẻ là tuyệt vời. Nhưng các lần tra cứu riêng lẻ tuyệt vời, nhân với bốn mươi bảy cho mỗi trang, vẫn cộng lại thành các trang chậm. Vấn đề DynamoDB đã được giải quyết. Một vấn đề mới đã thế chỗ nó.*

---

"Cơ sở dữ liệu đang phản hồi trong bốn mili giây mỗi yêu cầu," Leo nói. "Đó thực sự là nhanh. DynamoDB đang làm đúng công việc của nó."

"Vậy tại sao trang chậm?" Maya hỏi.

"Vì chúng ta đang gọi nó bốn mươi bảy lần mỗi lần tải trang," Priya nói. "Vấn đề không phải là cơ sở dữ liệu. Vấn đề là chúng ta đang nói chuyện với nó quá nhiều."

Tom nghiêng người về phía trước. Anh có vẻ mặt mà anh thường có khi một vấn đề sắp trở thành một cuộc trò chuyện về chi phí. "Vậy giải pháp là nói chuyện với nó ít hơn?"

"Nói chuyện với nó ít hơn. Ghi nhớ nhiều hơn."

---

**Nỗ Lực Đầu Tiên Sai Lầm**

Bản năng đầu tiên của Leo là cache dữ liệu theo từng người dùng. Mỗi người dùng có một session, và session tải hồ sơ của họ: các địa chỉ đã lưu, các phương thức thanh toán, tóm tắt lịch sử đơn hàng. Có lẽ cache cái đó sẽ tăng tốc mọi thứ.

Anh triển khai nó. Định dạng khóa Redis: `user:{userId}:profile`. TTL: mười phút.

Anh chạy kiểm thử tải. Thời gian tải trang giảm sáu mili giây.

"Đó không nhiều," Tom nhận xét.

"Không," Leo nói.

"Tại sao không?"

Leo nhìn chằm chằm vào biểu đồ một lúc. "Vì hồ sơ người dùng chỉ là một yêu cầu. Vẫn còn bốn mươi sáu lần gọi DynamoDB cho mỗi trang. Và đó là các lần gọi menu — một cho mỗi nhà hàng trên trang duyệt. Tôi đã cache nhầm thứ."

Đây là một sai lầm phổ biến trong caching: tối ưu hóa thứ không phải là nút thắt cổ chai. Hồ sơ người dùng tải trong hai mili giây. Cache thứ gì đó nhanh như vậy hầu như không tiết kiệm được gì. Dữ liệu menu — được lấy bốn mươi bảy lần, mỗi lần mất bốn mili giây — mới là vấn đề thực sự.

"Bạn cần cache theo từng menu, không phải theo từng người dùng," Priya nói. "Menu cho Nhà hàng 047 giống nhau cho mọi người dùng duyệt nó. Đó là dữ liệu đáng cache — nó giống hệt nhau qua hàng nghìn yêu cầu."

Cache theo từng người dùng có giá trị khi người dùng có trạng thái cá nhân hóa tốn kém. Cache theo từng thực thể (menu, danh mục sản phẩm, cấu hình) có giá trị khi cùng một dữ liệu được phục vụ cho hàng nghìn người dùng. Hãy biết bạn có vấn đề nào trước khi viết mã.

Leo thiết kế lại các khóa cache: `menu:{restaurantId}`. Một mục cache cho mỗi nhà hàng, được chia sẻ bởi mọi người dùng duyệt nhà hàng đó.

Anh chạy kiểm thử tải lại. Thời gian tải trang giảm từ 188 mili giây xuống 12 mili giây. Đó là sự cải thiện họ đã tìm kiếm.

---

**Tương Tự Về Nhà Hàng**

Hãy tưởng tượng căn bếp của một nhà hàng. Mỗi khi một người phục vụ cần biết các món đặc biệt trong ngày, họ đi vào phía sau, hỏi đầu bếp, và đi lại bàn.

Điều đó hoạt động tốt nếu bạn có hai người phục vụ và ba bàn.

Bây giờ hãy tưởng tượng hai trăm người phục vụ và một nghìn bàn. Mỗi người trong số họ đi vào phía sau cho cùng một câu hỏi. Căn bếp trở thành nút thắt cổ chai. Đầu bếp đang trả lời cùng một câu hỏi bốn trăm lần một giờ.

Giải pháp rõ ràng: viết các món đặc biệt lên một tấm bảng ở phía trước nhà hàng. Mọi người phục vụ đọc từ tấm bảng. Căn bếp được nghỉ ngơi. Tấm bảng được cập nhật khi các món đặc biệt thay đổi.

Tấm bảng đó là một bộ nhớ đệm (cache).

Một bộ nhớ đệm là một kho lưu trữ nhanh, cục bộ của dữ liệu được truy xuất gần đây. Thay vì lấy cùng một thứ từ một nguồn chậm nhiều lần, bạn lấy nó một lần và giữ nó gần.

Có một phép tương tự khác mà các kỹ sư thấy hữu ích: kệ sách dự trữ của thư viện. Khi một cuốn sách phổ biến được trả lại, người thủ thư biết nó sẽ được yêu cầu lại sớm, nên họ đặt nó lên kệ dự trữ gần bàn trước thay vì xếp nó vào kho. Người mượn tiếp theo không phải đi qua cả thư viện — họ tìm thấy nó ngay tại bàn. Kệ dự trữ có không gian giới hạn. Nếu nó đầy, các cuốn sách cũ hơn được chuyển trở lại kho để nhường chỗ cho các cuốn mới hơn. Một bộ nhớ đệm hoạt động giống hệt: dữ liệu được truy cập thường xuyên ở gần phía trước, dữ liệu được truy cập không thường xuyên bị loại bỏ để nhường chỗ.

**Tại Sao Không Chỉ Dùng Bộ Nhớ?**

"Chúng ta không thể chỉ lưu menu trong bộ nhớ của ứng dụng sao?" Leo hỏi.

Câu hỏi hợp lệ.

Bạn có thể. Đối với một ứng dụng máy chủ đơn lẻ, caching trong bộ nhớ hoạt động tốt. Nhưng Nimbus chạy phía sau một bộ cân bằng tải, qua nhiều instance EC2. Nếu một instance cache menu trong bộ nhớ của nó, các instance khác không có dữ liệu đó. Mỗi cái duy trì các cache riêng biệt. Khi menu cập nhật, bạn sẽ phải vô hiệu hóa tất cả chúng.

Đây là *vấn đề nhất quán cache* (cache coherence) — giữ nhiều cache nhất quán.

ElastiCache giải quyết điều này bằng cách cung cấp một cache *tập trung* mà tất cả các instance của bạn chia sẻ. Thay vì mỗi máy chủ có bộ nhớ riêng, mọi máy chủ đọc từ và ghi vào cùng một cache. Một lần cập nhật lan đến tất cả.

**Gặp Gỡ ElastiCache**

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Tại sao lại cả một dịch vụ mới? Tại sao không chỉ thêm dung lượng cơ sở dữ liệu?"

Câu hỏi hay. Câu trả lời là thêm dung lượng cơ sở dữ liệu — các instance lớn hơn, nhiều read replica hơn — không khắc phục được vấn đề cơ bản. Mỗi yêu cầu trong số bốn mươi bảy yêu cầu tải trang đó vẫn tốn thời gian và tiền bạc, ngay cả trên một cơ sở dữ liệu nhanh hơn. Một cache không làm cho cơ sở dữ liệu nhanh hơn; nó có nghĩa là cơ sở dữ liệu được hỏi cùng một câu hỏi ít thường xuyên hơn nhiều. Đối với dữ liệu được đọc lặp đi lặp lại và thay đổi không thường xuyên — như menu của một nhà hàng — một cache có nghĩa là cơ sở dữ liệu có thể trả lời câu hỏi đó một lần mỗi năm phút thay vì bốn mươi bảy lần mỗi lần tải trang.

Amazon ElastiCache là một dịch vụ caching được quản lý. Nó chạy các engine caching phổ biến — Redis và Memcached — mà bạn không phải quản lý các máy chủ.

**Redis** là cái mạnh mẽ hơn trong hai cái. Nó hỗ trợ các cấu trúc dữ liệu phức tạp (chuỗi, danh sách, tập hợp, hash, sorted sets), tính bền vững (dữ liệu tồn tại qua các lần khởi động lại), replication, và pub/sub messaging. Redis có thể làm nhiều hơn caching — nó có thể hoạt động như một kho dữ liệu nhẹ.

**Memcached** đơn giản hơn. Caching key-value thuần túy, có thể mở rộng theo chiều ngang, không có tính bền vững. Nhanh hơn cho các trường hợp sử dụng đơn giản nhưng ít tính năng hơn.

Đối với Nimbus: Redis. Họ cần cache dữ liệu menu (có cấu trúc), các token session (key-value), và sau đó họ sẽ muốn sorted sets cho các bảng xếp hạng "nhà hàng đang thịnh hành".

**Cách Caching Hoạt Động Trong Thực Tế**

Mẫu caching cơ bản được gọi là **cache-aside** (còn gọi là lazy loading):

1. Ứng dụng cần dữ liệu
2. Kiểm tra cache trước
3. Nếu tìm thấy (*cache hit*): trả về dữ liệu ngay lập tức
4. Nếu không tìm thấy (*cache miss*): đến cơ sở dữ liệu, lấy dữ liệu, lưu nó vào cache, trả về nó

Trong mã giả:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache trong 5 phút
return menuData
```

Yêu cầu đầu tiên luôn chạm vào cơ sở dữ liệu. Mọi yêu cầu tiếp theo chạm vào cache. Với một cache, bốn mươi bảy lần đọc DynamoDB mỗi lần tải trang của Nimbus trở thành một hoặc hai lần tra cứu cache. Nhanh, rẻ, và có thể mở rộng.

**TTL: Ghi Nhớ Bao Lâu?**

Mỗi mục cache có một **Time-To-Live (TTL)**: thời lượng sau đó mục hết hạn và yêu cầu tiếp theo quay lại cơ sở dữ liệu để lấy dữ liệu mới.

Đây là sự căng thẳng cốt lõi của caching: độ mới so với hiệu suất.

- **TTL ngắn (vài giây)**: Dữ liệu rất mới, nhưng nhiều cache miss. Cache hầu như không giúp được.
- **TTL dài (vài giờ hoặc vài ngày)**: Rất nhanh, nhưng dữ liệu có thể trở nên cũ. Khách hàng thấy menu của ngày hôm qua.

Đối với dữ liệu menu, năm phút là hợp lý. Menu không thay đổi mỗi giây. Nếu một nhà hàng cập nhật menu của họ, khách hàng có thể thấy phiên bản cũ trong tối đa năm phút — chấp nhận được.

Đối với các token session (người dùng này đã đăng nhập chưa?), TTL ngắn hơn là hợp lý, hoặc bạn cập nhật cache ngay lập tức khi session thay đổi.

Đối với dữ liệu tài chính (tổng đơn hàng, hồ sơ thanh toán), đừng cache nó — hoặc nếu có, hãy vô hiệu hóa ngay lập tức khi ghi.

Bạn có thể đang tự hỏi: tại sao không chỉ thêm dung lượng cơ sở dữ liệu thay vì đưa vào cả một lớp caching mới? Nhiều replica hơn, một instance lớn hơn — tại sao không thế? Câu trả lời là dung lượng cơ sở dữ liệu bổ sung nhân khả năng xử lý các yêu cầu đồng thời của bạn, nhưng nó không giảm số lượng yêu cầu. Nếu mười nghìn người dùng mỗi người kích hoạt bốn mươi bảy lần đọc mỗi lần tải trang, thêm một read replica thứ hai chỉ có nghĩa là mỗi replica xử lý hai mươi ba nghìn yêu cầu thay vì bốn mươi bảy nghìn — tổng công việc không co lại. Một cache loại bỏ hoàn toàn công việc dư thừa: mười nghìn người dùng đó chia sẻ cùng một kết quả đã cache.

"Chỉ có hai vấn đề khó trong khoa học máy tính," Leo trích dẫn, với cách truyền đạt thành thạo của một người đã nói nó trước đây. "Vô hiệu hóa cache và đặt tên cho mọi thứ."

"Tại sao vô hiệu hóa cache lại khó?" Maya hỏi.

"Vì khi nào dữ liệu *thực sự* thay đổi? Menu thay đổi vì một đối tác nhà hàng cập nhật nó? Hay vì một cron job chạy? Hay vì một admin chỉnh sửa nó thủ công? Mọi nơi có thể thay đổi dữ liệu đều cần biết để báo cho cache."

Đây là lý do các kỹ sư cấp cao bắt đầu một cuộc trò chuyện về caching với "các đường ghi là gì?" thay vì "hãy thêm Redis."

---

**Câu Chuyện Vô Hiệu Hóa Cache**

Họ phát hiện ra vô hiệu hóa cache khó đến mức nào lần đầu tiên một đối tác nhà hàng phàn nàn.

Nhà hàng 112 — một quán Colombia ở Eastside — đã cập nhật giá của họ vào một chiều thứ Năm. Họ đã tăng arepa từ 8 đô la lên 9 đô la. Họ gọi cho bộ phận hỗ trợ Nimbus hai mươi phút sau.

"Menu của chúng tôi vẫn hiển thị giá cũ," chủ quán nói. "Khách hàng đang đặt hàng ở mức 8 đô la. Bây giờ chúng tôi phải tôn trọng mức giá đó."

Tom tính toán khoản lỗ trong khi Priya lần theo lỗi. Mỗi đơn hàng đặt trong hai mươi phút đó đã tính phí 8 đô la. Nhà hàng đã muốn 9 đô la. Nimbus sẽ phải gánh chịu sự chênh lệch.

TTL năm phút lẽ ra đã hết hạn từ lâu. Hai mươi phút đã trôi qua. Priya kéo mã ra.

Khóa cache là `menu:restaurant-112`. Nó đã được đặt với TTL 300 giây. Cô kiểm tra khi nào nó được ghi lần cuối.

"Nó được đặt lúc 2:03 chiều," cô nói. "Hai mươi hai phút trước."

"Nhưng TTL là năm phút," Leo nói.

"TTL là năm phút kể từ khi nó được cache lần đầu. Nhưng mỗi yêu cầu chạm vào cache đều đang làm mới TTL. Mục cache đang bị chạm vào mỗi vài giây bởi các yêu cầu đến, và TTL đang bị đặt lại."

"Vậy nó không bao giờ hết hạn."

"Không trong cách triển khai này. Chúng ta đặt TTL trên mỗi lần đọc cache. Cửa sổ trượt. Mục giữ nguyên sống chừng nào còn ai đó chạm vào nó."

Cách khắc phục: dùng một TTL cố định chỉ đặt khi ghi, không bao giờ kéo dài khi đọc. Mục hết hạn chính xác năm phút sau khi nó được lưu, bất kể nó được đọc bao nhiêu lần. Khi nhà hàng cập nhật menu của họ, mục cũ hết hạn trong vòng năm phút và yêu cầu tiếp theo lấy dữ liệu mới.

"Và cho các trường hợp một nhà hàng cập nhật giá và chúng ta cần nó được phản ánh ngay lập tức?" Tom hỏi.

"Vô hiệu hóa chủ động," Priya nói. "Khi cổng đối tác nhà hàng gửi một cập nhật, API gọi `cache.delete('menu:restaurant-112')` trước khi trả về. Yêu cầu tiếp theo lấy dữ liệu mới ngay lập tức."

"Nhưng điều đó đòi hỏi cổng phải biết về cache."

"Mọi đường ghi vào cơ sở dữ liệu đều cần biết về cache. Đó là điều Leo đã nói trước đó. Bây giờ chúng ta đã trải nghiệm nó."

"Tôi đã triển khai nó rồi — ồ." Leo đã triển khai việc vô hiệu hóa trong cổng nhưng quên giao diện chỉnh sửa admin. Hai tuần sau, một admin đã cập nhật một menu thông qua bảng điều khiển nội bộ, và giá cũ đã tồn tại trong cache trong năm phút. Một phiên bản nhỏ hơn của cùng một sự cố.

Họ thêm một trình xử lý DynamoDB Streams — từ chương trước — tự động vô hiệu hóa cache bất cứ khi nào một mục menu thay đổi, bất kể hệ thống nào đã kích hoạt lần ghi. Một trình xử lý, tất cả các đường ghi được bao phủ.

---

**Loại Bỏ Cache: Khi Tấm Bảng Đầy**

Tấm bảng món đặc biệt có không gian giới hạn. Khi nó đầy, bạn phải xóa thứ gì đó để nhường chỗ.

Redis (và các cache nói chung) có các *chính sách loại bỏ* (eviction policy) xác định cái gì bị xóa khi bộ nhớ đầy:

- **LRU (Least Recently Used)**: Xóa các mục chưa được truy cập trong thời gian dài nhất.
- **LFU (Least Frequently Used)**: Xóa các mục được truy cập ít thường xuyên nhất.
- **allkeys-random**: Loại bỏ ngẫu nhiên. Đơn giản, không tối ưu.
- **noeviction**: Trả về lỗi khi bộ nhớ đầy (ứng dụng phải xử lý điều này).

Đối với hầu hết các ứng dụng web: LRU. Những thứ bạn chưa xem gần đây có lẽ ít cần thiết hơn.

---

**Vấn Đề Cache Stampede**

"Chúng ta đã nghĩ về điều gì xảy ra nếu toàn bộ cache trống cùng một lúc chưa?" Priya hỏi.

"Khi nào điều đó xảy ra?" Leo nói.

"Khi bạn triển khai một cụm ElastiCache mới. Khi TTL trên một lô lớn các mục hết hạn đồng thời. Khi bạn xóa cache để buộc làm mới sau khi sửa lỗi."

Leo suy nghĩ qua nó. "Nếu cache trống, mọi yêu cầu đều đến cơ sở dữ liệu. Tất cả cùng một lúc. Trong vài giây, cơ sở dữ liệu xử lý toàn bộ tải của mọi người dùng đồng thời."

"Không có cache nào ở phía trước nó."

"Điều đó sẽ đau." Leo nhìn vào các cài đặt dung lượng cơ sở dữ liệu. "Chúng ta chắc chắn sẽ bị điều tiết."

Đây được gọi là **cache stampede** (còn gọi là thundering herd). Nó xảy ra khi nhiều mục cache hết hạn cùng một lúc — thường vì chúng đều được tạo cùng một lúc trong quá trình triển khai hoặc khởi động nguội — và làn sóng cache miss đột ngột đều chạm vào cơ sở dữ liệu đồng thời.

Các chiến lược giảm thiểu:

**Jitter trên TTL**: Thay vì đặt mọi mục menu thành chính xác 300 giây, thêm sự biến đổi ngẫu nhiên: 270 đến 330 giây. Các mục hết hạn ở những thời điểm hơi khác nhau, trải làn sóng cache miss ra trong một phút thay vì chạm đồng thời.

**Hết hạn sớm theo xác suất**: Trước khi một mục hết hạn, một phần trăm nhỏ các yêu cầu chủ động làm mới nó. Điều này giữ các mục mới trước khi chúng trở nên cũ, ngăn việc hết hạn trở thành một miss.

**Hợp nhất yêu cầu (mutex/lock)**: Khi một cache miss xảy ra, lấy một khóa trước khi chạm vào cơ sở dữ liệu. Các yêu cầu đồng thời khác cho cùng một khóa chờ yêu cầu đầu tiên hoàn thành và lấp đầy lại cache, sau đó đọc từ cache. Chỉ một yêu cầu cơ sở dữ liệu được thực hiện cho mỗi cache miss, ngay cả dưới mức đồng thời cao.

Đối với Nimbus, họ triển khai TTL jitter. Đơn giản, hiệu quả, không có sự phức tạp bổ sung.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"Hai dòng mã," Leo nói. "Để ngăn một sự cố cơ sở dữ liệu tiềm năng trong quá trình triển khai."

"Hầu hết các cải thiện độ tin cậy đều như vậy," Priya nói. "Rẻ để triển khai, đắt để học rằng bạn cần chúng."

---

**Cấu Trúc Dữ Liệu Redis: Hơn Cả Key-Value**

Khi Nimbus thêm tính năng "nhà hàng đang thịnh hành", ban đầu Leo lưu trữ bảng xếp hạng dưới dạng một danh sách JSON thuần: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Nó hoạt động, nhưng cập nhật nó thì vụng về. Để thêm một nhà hàng mới hoặc cập nhật một điểm số, anh phải đọc toàn bộ danh sách, sửa đổi nó trong mã ứng dụng, và ghi toàn bộ trở lại. Dưới các lần ghi đồng thời từ đường ống phân tích, các điều kiện đua (race condition) khiến các điểm số bị ghi đè.

Priya chỉ anh đến sorted sets của Redis.

Một **sorted set** trong Redis lưu trữ các thành viên với các điểm số (score) bằng số liên quan. Các thành viên được tự động sắp xếp theo điểm số. Các thao tác là nguyên tử (atomic) — không có điều kiện đua từ các cập nhật đồng thời.

```
# Thêm/cập nhật điểm số của một nhà hàng
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Lấy top 10 nhà hàng theo điểm số (cao nhất trước)
ZREVRANGE trending:global 0 9 WITHSCORES

# Tăng điểm số của một nhà hàng một cách nguyên tử
ZINCRBY trending:global 50 "NIMBUS-047"
```

Lambda phân tích gọi `ZINCRBY` mỗi khi một đơn hàng được đặt, tăng điểm số của nhà hàng. Trang chủ gọi `ZREVRANGE` để lấy top mười. Không khóa, không điều kiện đua, không chu kỳ đọc-sửa-ghi.

Redis hỗ trợ một số cấu trúc dữ liệu khác ngoài key-value đơn giản:

**Lists**: Các chuỗi có thứ tự. Đẩy vào phía trước hoặc phía sau. Dùng cho hàng đợi, các luồng hoạt động gần đây, các luồng log.

**Sets**: Các bộ sưu tập không có thứ tự, không trùng lặp. Các thao tác hợp, giao, hiệu. Dùng cho "người dùng nào đã thấy thông báo này?" hoặc "nhà hàng nào trong danh mục này?"

**Hashes**: Các trường được đặt tên trong một khóa. Dùng cho các đối tượng có cấu trúc nơi bạn muốn cập nhật các trường riêng lẻ mà không viết lại toàn bộ đối tượng.

**HyperLogLog**: Ước lượng cardinality theo xác suất. Đếm số khách truy cập duy nhất vào một trang mà không lưu trữ mọi ID khách truy cập. Gọn nhẹ và nhanh.

**Pub/Sub**: Xuất bản tin nhắn đến các kênh; những người đăng ký nhận chúng theo thời gian thực. Dùng cho các thông báo thời gian thực nhẹ giữa các dịch vụ.

"Redis không chỉ là một cache," Leo nói. "Nó là một máy chủ cấu trúc dữ liệu."

"Đó là mô tả chính thức của nó," Priya nói.

"Tôi cứ nghĩ nó chỉ là một từ điển hoa mỹ."

"Nó bắt đầu theo cách đó."

---

**Write-Through: Mẫu Caching Khác**

Cache-aside (lazy loading) là mẫu phổ biến nhất. Nhưng có một mẫu thứ hai đáng biết: **write-through**.

Trong caching write-through, mỗi khi ứng dụng của bạn ghi vào cơ sở dữ liệu, nó cũng ghi vào cache ngay lập tức.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

Lợi thế: cache luôn được cập nhật. Không có dữ liệu cũ giữa một lần ghi và việc hết hạn TTL.

Bất lợi: mỗi lần ghi đi đến hai nơi. Và bạn lấp đầy cache với dữ liệu có thể không bao giờ được đọc. Nếu mười nhà hàng cập nhật menu của họ nhưng chỉ hai trong số đó nhận được lưu lượng đáng kể trong năm phút tiếp theo, bạn đã làm công việc write-through cho tám cache sẽ không được dùng trước khi chúng hết hạn.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Nếu chúng ta ghi vào cache trên mỗi cập nhật, chúng ta đang làm nhiều công việc hơn cho mỗi lần ghi so với trước. Như thế tốt hơn ở chỗ nào?"

"Không phải lúc nào cũng tốt hơn," Priya nói. "Write-through hợp lý khi bạn không thể chịu đựng bất kỳ cửa sổ dữ liệu cũ nào sau một lần ghi. Cache-aside chấp nhận tối đa một TTL độ cũ để đổi lấy việc không làm công việc thêm trên mỗi lần ghi."

Đối với Nimbus: cache-aside là lựa chọn đúng. Menu được đọc thường xuyên hơn nhiều so với được ghi. Một cửa sổ cũ năm phút là chấp nhận được. Đối với một hệ thống giao dịch tài chính nơi mỗi cập nhật giá cần được phản ánh ngay lập tức, write-through sẽ phù hợp hơn.

Quyết định quy về hai câu hỏi: tỷ lệ ghi-trên-đọc của bạn là gì, và bạn chịu đựng được mức độ nào với các lần đọc cũ sau một lần ghi?


---

**ElastiCache cho Redis: Những Gì Bạn Được Quản Lý**

Giống như RDS, ElastiCache lấy một công cụ mã nguồn mở và xử lý công việc vận hành:

- **Sao lưu tự động**: Các snapshot Redis theo lịch
- **Sao chép Multi-AZ**: Node chính + các read replica ở các AZ khác nhau
- **Tự động chuyển đổi dự phòng**: Nếu node Redis chính thất bại, một replica được thăng cấp tự động
- **Chế độ cụm (Cluster mode)**: Sharding theo chiều ngang qua nhiều node cho các cache rất lớn
- **Mã hóa**: Mã hóa khi truyền và khi lưu trữ cho việc tuân thủ
- **Tích hợp VPC**: Cache chạy trong mạng riêng của bạn, không thể truy cập công khai

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

"Ít hơn các lần đọc DynamoDB mà chúng ta đang thay thế," Leo nói. "Khoảng hai trăm đô la một tháng."

Leo mở trang định giá lên. Anh đã làm toán rồi, nhưng anh dẫn Tom qua nó.

Một `cache.t3.micro` — node nhỏ nhất — khoảng 12 đô la một tháng. Nó có 0,5 GB bộ nhớ. Đủ cho một ứng dụng nhỏ với vài trăm khóa cache.

Một `cache.r6g.large` — bậc phù hợp với lưu lượng của Nimbus — có 13 GB bộ nhớ và chạy khoảng 140 đô la một tháng. Để so sánh, Nimbus đã chi khoảng 400 đô la một tháng cho các lần đọc DynamoDB trước khi caching. Sau caching, các lần đọc đó đã giảm khoảng 89 phần trăm. Phép toán ra khoảng 356 đô la một tháng tiết kiệm được trên các lần đọc DynamoDB, trừ đi 140 đô la chi cho ElastiCache — một khoản tiết kiệm ròng khoảng 216 đô la một tháng.

Biểu cảm của Tom chuyển từ hoài nghi sang hài lòng. "Tính toán các con số cho đúng trước khi chúng ta mở rộng quy mô, nhưng cái đó hợp lý." Anh viết nó xuống.

"Và nếu ai đó cố gắng đột nhập thì sao?" Priya nói. "Cache có thể có các token session. Dữ liệu người dùng. Chúng ta cần các token xác thực trên instance Redis và không có truy cập công khai."

"Nó sẽ ở trong subnet riêng," Leo nói.

"Tốt. Nhưng 'nó sẽ ổn thôi' không phải là một thế trận bảo mật," cô nói. "Token xác thực. Mã hóa khi truyền. Chỉ VPC."

Leo gật đầu. Cô đúng.

---

**Giám Sát Cache**

"Chúng ta đã nghĩ về điều gì xảy ra khi cache không hoạt động đúng chưa?" Priya hỏi, một tuần sau khi triển khai Redis. "Không phải thất bại hoàn toàn — hoạt động, nhưng kém. Tỷ lệ miss cao. Tỷ lệ loại bỏ cao. Độ trễ tăng dần."

"Tôi sẽ nhận thấy khi thời gian tải trang tăng," Leo nói.

"Đến thời điểm đó cơ sở dữ liệu đã đang vật lộn rồi," cô nói.

ElastiCache phơi bày các chỉ số thông qua CloudWatch. Những cái quan trọng nhất:

**CacheHitRate**: Tỷ lệ phần trăm các lần đọc cache trả về một kết quả. Lý tưởng là trên 80% cho một cache trưởng thành. Tỷ lệ hit giảm báo hiệu rằng dữ liệu được truy cập nhiều nhất của bạn không có trong cache — hoặc TTL quá ngắn, cache quá nhỏ, hoặc các mẫu truy cập của bạn đã thay đổi.

**CacheMisses**: Số lượng tuyệt đối các cache miss. Một đột biến đột ngột ở đây có nghĩa là cache không giúp ích và cơ sở dữ liệu đang gánh toàn bộ tải.

**Evictions**: Số lượng các mục cache bị loại bỏ để nhường chỗ cho các mục mới. Tỷ lệ loại bỏ cao có nghĩa là cache của bạn quá nhỏ cho tập làm việc của bạn. Bạn cần nhiều bộ nhớ hơn hoặc một chiến lược caching chọn lọc hơn.

**CurrConnections**: Các kết nối client hiện tại đến Redis. Quá nhiều kết nối có thể làm cạn kiệt giới hạn kết nối của Redis. Các ứng dụng nên dùng connection pooling để tránh mở một kết nối mới trên mỗi yêu cầu.

**ReplicationLag**: Read replica chậm so với node chính bao nhiêu. Nếu nó tăng, các lần đọc replica có thể trả về dữ liệu cũ.

Leo thiết lập hai cảnh báo CloudWatch. Thứ nhất: cảnh báo nếu tỷ lệ hit cache giảm xuống dưới 70% trong mười lăm phút liên tiếp — điều đó sẽ báo hiệu một vấn đề đáng điều tra trước khi cơ sở dữ liệu cảm nhận nó. Thứ hai: cảnh báo nếu tỷ lệ loại bỏ vượt quá 100 lần loại bỏ mỗi phút — điều đó sẽ báo hiệu cache bị thiếu kích cỡ.

"Hai cảnh báo," Priya nói, xem lại cấu hình. "Đó là một khởi đầu tốt."

"Tôi cũng đã thêm một bảng điều khiển," Leo nói. "Tỷ lệ hit, tỷ lệ miss, các lần loại bỏ, độ trễ. Tất cả hiển thị ở một nơi."

"Đó tốt hơn là chờ trang chậm đi."

"Tốt hơn đáng kể," Leo đồng ý.


---

**ElastiCache so với DAX: Cache Nào Cho DynamoDB?**

"Nếu chúng ta đang cache dữ liệu DynamoDB," Maya hỏi, "tại sao không dùng DAX thay vì ElastiCache? Tôi đã thấy nó trong tài liệu."

Câu hỏi hay.

**DAX (DynamoDB Accelerator)** là một cache trong bộ nhớ được xây dựng có mục đích cho DynamoDB. Nó chặn các lần gọi API DynamoDB ở cấp độ client — mã ứng dụng của bạn nói chuyện với DAX bằng cùng SDK DynamoDB. Các cache miss được tự động lấy từ DynamoDB. Các cache hit trả về trong micro giây. Việc vô hiệu hóa được xử lý tự động khi dữ liệu thay đổi.

**ElastiCache** là một cache đa năng. Bạn quản lý các khóa cache, logic TTL, việc vô hiệu hóa — tất cả. Nhiều kiểm soát hơn, nhiều trách nhiệm hơn.

Khi nào dùng mỗi cái:

| Kịch bản | Khuyến nghị |
|---|---|
| Bạn đang cache các lần đọc DynamoDB và muốn không thay đổi ứng dụng | DAX |
| Bạn cần độ trễ micro giây trên các lần đọc DynamoDB | DAX |
| Bạn đang cache từ nhiều nguồn (DynamoDB + RDS + API bên ngoài) | ElastiCache |
| Bạn cần các cấu trúc dữ liệu Redis (sorted sets, pub/sub, HyperLogLog) | ElastiCache |
| Bạn cần kiểm soát TTL chi tiết và logic vô hiệu hóa tùy chỉnh | ElastiCache |
| Bạn cần lưu trữ session, giới hạn tốc độ, hoặc khóa phân tán | ElastiCache |

Đối với Nimbus: họ chọn ElastiCache vì họ đang cache dữ liệu từ nhiều nguồn — DynamoDB cho menu, RDS cho các tóm tắt lịch sử đơn hàng, các API bên ngoài cho các đánh giá nhà hàng. DAX chỉ hoạt động với DynamoDB. Và họ cần Redis sorted sets cho các bảng xếp hạng thịnh hành.

"Nếu nó hoàn toàn là một vấn đề caching DynamoDB," Priya nói, "DAX sẽ là câu trả lời đơn giản hơn. Một dịch vụ, vô hiệu hóa tự động, cùng API. Nhưng chúng ta có nhiều hơn một nguồn dữ liệu."

"Vậy DAX đơn giản hơn khi bạn chỉ dùng DynamoDB," Maya tóm tắt. "ElastiCache khi bạn cần toàn bộ bộ công cụ."

"Đó là sự đánh đổi."

### Khi Dữ Liệu Cache Không Thể Mất: Amazon MemoryDB

"Tại sao lại có ai dùng Redis làm cơ sở dữ liệu chính?" Maya hỏi. "Nó không phải là một cache sao?"

Đó chính xác là câu hỏi đúng.

ElastiCache cho Redis là một cache — nhanh, trong bộ nhớ, và theo thiết kế, không phải là nguồn sự thật. Nếu một node ElastiCache thất bại, cache trống khi khởi động lại. Các ứng dụng làm ấm lại nó từ cơ sở dữ liệu. Điều đó ổn cho một cache.

Nhưng một số trường hợp sử dụng coi Redis không phải là một cache mà là một kho dữ liệu chính — trạng thái session phải tồn tại qua các lần khởi động lại, một bảng xếp hạng thời gian thực không thể bị mất, một giỏ hàng phải tồn tại qua một sự cố AZ. Đối với các trường hợp sử dụng này, độ bền cuối cùng của ElastiCache là một rủi ro.

**Amazon MemoryDB cho Redis** là một cơ sở dữ liệu trong bộ nhớ bền, tương thích Redis, được quản lý hoàn toàn. Không giống ElastiCache, MemoryDB dùng một nhật ký giao dịch phân tán được lưu trữ qua nhiều AZ khiến mỗi lần ghi bền trước khi nó được xác nhận. Dữ liệu tồn tại qua các sự cố node — không phải vì nó phát lại từ một cơ sở dữ liệu chậm hơn, mà vì nó không bao giờ chỉ ở một nơi.

Sự phân biệt then chốt:

| | ElastiCache cho Redis | MemoryDB cho Redis |
|---|---|---|
| Vai trò | Lớp cache | Cơ sở dữ liệu chính |
| Độ bền | Không được đảm bảo khi thất bại | Nhật ký giao dịch Multi-AZ |
| Độ trễ | Đọc và ghi micro giây | Đọc micro giây, ghi một chữ số mili giây |

Cả hai hỗ trợ cùng các lệnh Redis và cấu trúc dữ liệu. API giống nhau. Sự đảm bảo độ bền thì không.

Đối với Nimbus: đội ngũ muốn lưu trữ số đơn hàng thời gian thực theo từng nhà hàng dưới dạng một Redis sorted set — và nó phải tồn tại qua một sự cố AZ mà không cần gieo lại từ cơ sở dữ liệu. Yêu cầu đó — tương thích Redis *và* bền — là tín hiệu chính xác cho MemoryDB.

"Vậy chúng ta không phải làm ấm lại nó sau một sự cố?" Leo hỏi.

"Đó là điểm mấu chốt," Priya nói. "Nếu node thất bại và quay lại, dữ liệu vẫn ở đó. Nhật ký giao dịch đã giữ nó."

Leo nhìn chằm chằm vào trang định giá một lúc. "Nó tốn nhiều hơn ElastiCache."

"Mọi thứ đáng tin cậy đều thế," Priya nói.

## Điểm Mạnh và Hạn Chế

**Tại sao caching mạnh mẽ**:

- Giảm đáng kể tải cơ sở dữ liệu (ít truy vấn hơn, chi phí thấp hơn)
- Thời gian phản hồi dưới mili giây cho các cache hit
- Bảo vệ cơ sở dữ liệu của bạn khỏi các đợt tăng lưu lượng
- Redis hỗ trợ các cấu trúc dữ liệu phong phú hơn một kho key-value đơn giản
- Giảm thiểu cache stampede (TTL jitter, hợp nhất) bảo vệ chống lại các đợt tăng do khởi động nguội

**Nơi caching trở nên phức tạp**:

- Vô hiệu hóa cache thực sự khó — dữ liệu cũ gây ra lỗi
- Thêm sự phức tạp vận hành (một dịch vụ khác để giám sát, một điểm thất bại khác)
- Vấn đề khởi động nguội: khi bạn triển khai mới, cache trống — cơ sở dữ liệu gánh toàn bộ tải
- Cache stampede: nếu nhiều mục hết hạn cùng một lúc, mọi yêu cầu chạm vào cơ sở dữ liệu đồng thời
- Các node ElastiCache không miễn phí — bạn trả tiền cho chúng ngay cả khi nhàn rỗi

**ElastiCache so với DynamoDB DAX**:

Nếu bạn đang cache dữ liệu DynamoDB cụ thể, AWS cung cấp **DAX (DynamoDB Accelerator)** — một cache trong bộ nhớ được xây dựng có mục đích cho DynamoDB. DAX trong suốt với mã ứng dụng của bạn (cùng API), giảm độ trễ đọc DynamoDB xuống micro giây, và xử lý việc vô hiệu hóa cache tự động.

Dùng DAX khi nút thắt cổ chai của bạn là các lần đọc DynamoDB và bạn muốn caching không thay đổi. Dùng ElastiCache khi bạn cần một cache đa năng cho bất kỳ nguồn dữ liệu nào, hoặc khi bạn cần các cấu trúc dữ liệu Redis.

## Tóm Tắt

Bốn mươi bảy lần gọi cơ sở dữ liệu trở thành một lần tra cứu cache. Trang đi từ 188 mili giây xuống 12. Thêm một lớp caching là một trong những thay đổi có đòn bẩy cao nhất mà một ứng dụng đang phát triển có thể thực hiện — nhưng chỉ khi cache được thiết kế một cách chu đáo, với các câu trả lời rõ ràng cho câu hỏi "khi nào dữ liệu này thay đổi?"

- Một cache là một kho lưu trữ nhanh của dữ liệu được truy xuất gần đây — bạn hỏi một lần, ghi nhớ câu trả lời. ElastiCache là dịch vụ caching được quản lý của AWS, hỗ trợ **Redis** (tính bền vững, cấu trúc dữ liệu phức tạp, pub/sub) và **Memcached** (key-value thuần túy, mở rộng theo chiều ngang).
- **Mẫu cache-aside** (lazy loading): kiểm tra cache trước, lùi về cơ sở dữ liệu khi miss. **TTL** kiểm soát dữ liệu được cache bao lâu — TTL ngắn nghĩa là dữ liệu mới hơn và nhiều miss hơn; TTL dài nghĩa là phản hồi nhanh hơn và dữ liệu cũ tiềm năng.
- Cache đúng thứ: dữ liệu theo từng thực thể được chia sẻ qua nhiều người dùng, không phải dữ liệu theo từng người dùng duy nhất cho mỗi session. Cache stampede xảy ra khi nhiều mục hết hạn đồng thời — giảm thiểu bằng TTL jitter.
- **DAX** là lựa chọn đúng cho caching chỉ-DynamoDB. **ElastiCache** linh hoạt hơn cho caching đa nguồn và các cấu trúc dữ liệu Redis.
- Phần khó nhất của caching là vô hiệu hóa: biết khi nào dữ liệu thay đổi và cập nhật cache qua tất cả các đường mã ghi nó. Một cache chỉ đáng tin cậy bằng chiến lược vô hiệu hóa của nó.

## Mẹo Thi

*SAA-C03 Domain: Thiết kế kiến trúc hiệu suất cao (Domain 3, Task 3.3)*

- **Redis so với Memcached trong kỳ thi**: Redis = tính bền vững, replication, cấu trúc phức tạp, pub/sub. Memcached = key-value đơn giản, mở rộng theo chiều ngang thuần túy. Khi kịch bản đề cập "bạn không thể mất dữ liệu đã cache," câu trả lời là Redis (nó lưu xuống đĩa).
- **Các tín hiệu trường hợp sử dụng ElastiCache**: "cơ sở dữ liệu là nút thắt cổ chai," "khối lượng công việc đọc nặng," "giảm độ trễ," "lưu trữ session" — tất cả đều chỉ đến ElastiCache.
- **Tín hiệu DAX**: "giảm độ trễ đọc DynamoDB" hoặc "các lần đọc DynamoDB quá chậm" → DAX, không phải ElastiCache.
- **Quản lý session**: ElastiCache Redis là câu trả lời chuẩn cho việc lưu trữ dữ liệu session người dùng. Ứng dụng không trạng thái + kho session Redis = mở rộng theo chiều ngang với các session nhất quán.
- **Write-through so với cache-aside**: Cache-aside (lazy loading) là phổ biến nhất. Write-through cập nhật cache trên mỗi lần ghi — không bao giờ cũ, nhưng nhiều thao tác ghi hơn. Kỳ thi có thể phân biệt chúng.
- **Các chính sách loại bỏ cache**: LRU (least recently used) là câu trả lời thi phổ biến nhất cho các khối lượng công việc web đa năng.
- **ElastiCache so với MemoryDB:** ElastiCache = lớp cache, nhanh, mất dữ liệu chấp nhận được khi thất bại. MemoryDB = cơ sở dữ liệu chính trong bộ nhớ bền, tương thích Redis, nhật ký giao dịch Multi-AZ. Kích hoạt thi: "tương thích Redis VÀ bền" hoặc "kho dữ liệu chính trong Redis" → MemoryDB, không phải ElastiCache.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của riêng bạn: vô hiệu hóa cache là gì, và tại sao nó khó?

*(Gợi ý: Hãy nghĩ về tất cả các nơi trong Nimbus mà dữ liệu menu có thể được cập nhật — cổng đối tác nhà hàng, một công cụ admin, một cron job. Mỗi đường đó cần biết về cache.)*

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một nền tảng phát video phục vụ hàng triệu người dùng. Danh mục các phim có sẵn thay đổi không thường xuyên (cập nhật hàng đêm). Ứng dụng đang gặp tình trạng sử dụng CPU cơ sở dữ liệu cao vì mỗi yêu cầu người dùng truy vấn danh mục. Đội ngũ muốn giảm tải cơ sở dữ liệu trong khi giữ dữ liệu danh mục chính xác trong vòng một giờ kể từ khi cập nhật.

Giải pháp nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Thêm các read replica vào cơ sở dữ liệu RDS để phân phối tải  
B) Di chuyển danh mục sang DynamoDB với dung lượng on-demand  
C) Dùng ElastiCache cho Redis với TTL 1 giờ cho dữ liệu danh mục  
D) Tăng kích thước instance RDS để xử lý nhiều truy vấn đồng thời hơn

**Gợi ý 1**: Dữ liệu nặng về đọc và thay đổi không thường xuyên. Mẫu nào lý tưởng cho điều này?

**Gợi ý 2**: "Chính xác trong vòng một giờ" chuyển trực tiếp thành một tham số cấu hình cache cụ thể.

**Gợi ý 3**: Mục tiêu là giảm tải cơ sở dữ liệu, không chỉ xử lý nhiều hơn nó.

**Đáp án**: C

**Giải thích**: ElastiCache với TTL một giờ cache dữ liệu danh mục sau yêu cầu đầu tiên cho mỗi khóa. Các yêu cầu tiếp theo trả về từ cache mà không chạm vào cơ sở dữ liệu. Khi cập nhật hàng đêm chạy, các mục hết hạn trong vòng một giờ và dữ liệu mới được tải trong yêu cầu tiếp theo.

**Tại sao không phải A?** Các read replica phân phối lưu lượng đọc qua nhiều node cơ sở dữ liệu hơn nhưng không giảm tổng số truy vấn. Chúng hữu ích để mở rộng các lần đọc, không phải để giảm tải cơ sở dữ liệu từ các truy vấn lặp lại thường xuyên.

**Tại sao không phải B?** Di chuyển sang DynamoDB không giải quyết vấn đề cơ bản — dữ liệu danh mục vẫn sẽ được lấy từ cơ sở dữ liệu (DynamoDB) trên mỗi yêu cầu người dùng.

**Tại sao không phải D?** Mở rộng instance xử lý nhiều truy vấn đồng thời hơn nhưng không giảm số lượng truy vấn. Sự kém hiệu quả cơ bản vẫn còn.

*SAA-C03 Domain: Thiết kế kiến trúc hiệu suất cao — Task 3.3*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Nimbus muốn thêm một tính năng "nhà hàng đang thịnh hành": một danh sách xếp hạng top 10 nhà hàng theo khối lượng đơn hàng trong 24 giờ qua, cập nhật mỗi 15 phút.

Bạn sẽ triển khai điều này với ElastiCache Redis như thế nào? Cấu trúc dữ liệu Redis nào bạn sẽ dùng cho bảng xếp hạng? TTL cache của bạn sẽ là gì, và chính xác khi nào bạn sẽ cập nhật cache?

Cũng hãy cân nhắc: điều gì xảy ra nếu node ElastiCache sập? Tính năng có hỏng không? Bạn sẽ thiết kế xung quanh sự cố này như thế nào?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là luyện tập thiết kế cache và tư duy về sự cố.)*

## Cảnh Sau Tín Dụng

"Tôi đã triển khai nó rồi — ồ." Leo đã đẩy tích hợp Redis lên production trước khi cập nhật các cài đặt connection pool. Dưới tải, ứng dụng đang mở quá nhiều kết nối Redis. Anh đã phải cuộn lại và triển khai lại với cấu hình đúng.

Leo thêm Redis caching cho menu. Thời gian tải trang giảm từ 188 mili giây xuống 12 mili giây.

Bốn mươi bảy lần gọi DynamoDB trở thành một lần tra cứu Redis. Cuộc gọi mất 0,8 mili giây.

Anh thông báo điều này tại cuộc họp đứng thứ Hai.

"Làm tốt lắm," Priya nói, không nhìn lên khỏi laptop.

"Cảm ơn," Leo nói.

"Lần cuối bạn xoay token xác thực Redis là khi nào?"

Leo nhìn vào ghi chú của mình. "Tôi không nghĩ mình đã đặt một cái."

"Vậy cache không được xác thực."

"Nó ở trong VPC."

"Mọi thứ khác bị xâm phạm cũng vậy." Cuối cùng cô ngước nhìn lên. "Nếu laptop của Leo bị nhiễm và ai đó xoay vào VPC, cache của bạn không có mật khẩu."

Leo nhìn chằm chằm vào cô.

"Tôi sẽ đặt token xác thực," anh nói.

Chương tiếp theo: mạng riêng tách biệt những gì Nimbus sở hữu với phần còn lại của internet.
