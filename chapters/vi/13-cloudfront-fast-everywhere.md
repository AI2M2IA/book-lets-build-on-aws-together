# Chương 13: Nhanh Ở Khắp Nơi

Một bức ảnh đi từ một máy chủ ở Oregon đến một điện thoại ở Boston băng qua khoảng 4.100 km cáp quang. Ở hai phần ba tốc độ ánh sáng, đó là khoảng 25 mili giây của vật lý học thuần túy — không thể tránh khỏi, không thể thương lượng, được nướng vào các định luật của vũ trụ.

Rồi thêm chuyến đi-về. Rồi thêm thời gian xử lý. Trình duyệt chưa bắt đầu kết xuất và 80 mili giây đã trôi qua.

---

*`eatnimbus.com` đã hoạt động và tên miền là thật. Người dùng có thể tìm thấy ứng dụng. Nhưng tìm thấy nó không giống như thưởng thức nó. Tom đã chạy các đo lường độ trễ từ các thành phố khác nhau, và các con số từ Bờ Đông và Nam Mỹ không tốt. Vấn đề tên miền đã được giải quyết. Vấn đề vật lý học thì chưa.*

---

`eatnimbus.com` đã hoạt động. Leo đã kiểm tra các chỉ số độ trễ từ người dùng Bờ Đông: 80-100 mili giây mỗi yêu cầu. Điều đó nghe có vẻ nhỏ, nhưng nó cộng dồn.

Tải menu: 90ms. Tải danh sách nhà hàng: 80ms. Tải các bức ảnh của nhà hàng: 200ms (hình ảnh lớn). Tổng thời gian trước khi một người dùng có thể đặt hàng: hơn nửa giây trên một kết nối tốt.

"Vật lý học là vấn đề," Leo nói. "Các máy chủ ở Oregon. Sự tăng trưởng ở Bờ Đông — và ở São Paulo."

"Vậy hãy chuyển các máy chủ sang Bờ Đông," Tom nói.

"Điều đó tốn tiền."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

"Chạy một bản sao đầy đủ của hạ tầng của chúng ta ở us-east-1? Có lẽ gấp ba chi phí hiện tại của chúng ta. Và nó tạo ra một vấn đề hoàn toàn mới: giữ cơ sở dữ liệu Bờ Tây và cơ sở dữ liệu Bờ Đông đồng bộ."

Priya ngước nhìn lên khỏi laptop của cô. "Hoặc chúng ta không chuyển các máy chủ. Chúng ta chuyển *nội dung*."

Maya ngước nhìn. "Có gì khác nhau? Nếu nội dung ở trên một máy chủ, và máy chủ ở Oregon, nội dung ở Oregon."

"Hầu hết những gì một trang cung cấp là tĩnh," Priya nói. "Hình ảnh, stylesheet, các tệp JavaScript, font. Những cái đó giống nhau cho mọi người dùng. Chúng không đến từ cơ sở dữ liệu. Chúng sống trong S3. Và các object S3 có thể được phục vụ từ bất kỳ đâu."

"Vậy chúng ta sao chép chúng đến các máy chủ gần người dùng hơn?"

"Chúng ta để một dịch vụ quản lý điều đó cho chúng ta. Một nguồn sự thật. Các bản sao ở mọi nơi chúng cần."

Tom đã mở trang định giá rồi. Anh đang tính toán trước khi Priya giải thích xong.

**Tương Tự Kho Hàng Được Chuẩn Bị Sẵn**

Hãy tưởng tượng Amazon nhà bán lẻ, không phải công ty đám mây. Họ có một kho hàng khổng lồ ở một vị trí với mọi sản phẩm. Nếu họ giao mọi đơn hàng từ kho hàng duy nhất đó, khách hàng ở các thành phố xa sẽ chờ hàng ngày.

Thay vào đó, Amazon có các trung tâm thực hiện gần các trung tâm dân số lớn. Khi một sản phẩm phổ biến, họ chuẩn bị sẵn các kho địa phương đó. Khi một khách hàng ở Seattle đặt một cuốn sách, nó được giao từ trung tâm thực hiện địa phương — không phải từ bên kia đất nước.

Đây là một **Mạng Phân Phối Nội Dung (CDN)**: một mạng các máy chủ được phân tán về mặt địa lý cache các bản sao nội dung của bạn gần người dùng của bạn.

Khi một người dùng ở Boston yêu cầu trang chủ của bạn, CDN phục vụ nó từ một máy chủ ở Boston. Không phải Oregon. Yêu cầu không bao giờ băng qua đất nước.

**Gặp Gỡ CloudFront**

Amazon CloudFront là CDN của AWS. Nó hoạt động thông qua một mạng toàn cầu các **edge location** — các máy chủ caching được đặt ở các thành phố trên khắp thế giới. Tính đến thời điểm viết bài này, có hơn 750 điểm hiện diện ở hơn 100 thành phố.

Khi bạn cấu hình CloudFront, bạn chỉ định một **origin**: nguồn nội dung thực tế của bạn. Origin của bạn có thể là:

- Một bucket S3 (các tệp tĩnh: hình ảnh, CSS, JavaScript, PDF)
- Một Application Load Balancer (nội dung động từ ứng dụng của bạn)
- Một EC2 instance
- Một máy chủ HTTP bất kỳ đâu trên internet

CloudFront ngồi trước origin của bạn. Các yêu cầu đến tại edge location gần nhất. Nếu edge có nội dung được cache, nó trả về ngay lập tức. Nếu không (một *cache miss*), nó lấy từ origin của bạn, cache nó, và trả về nó.

**Cách Caching CloudFront Hoạt Động**

Yêu cầu đầu tiên cho bất kỳ phần nội dung nào luôn là một cache miss — nó đi đến origin. Mọi yêu cầu tiếp theo chạm vào cache ở edge location.

Đối với Nimbus, các bức ảnh menu là các ứng viên CloudFront hoàn hảo. Các bức ảnh nhà hàng thay đổi không thường xuyên (có lẽ khi nhà hàng cập nhật hồ sơ của họ). Với CloudFront:

1. Người dùng ở Boston yêu cầu `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront kiểm tra edge location ở Boston — chưa được cache (cache miss)
3. CloudFront lấy từ S3 ở us-west-2 (~80ms)
4. CloudFront lưu trữ bức ảnh trong edge location Boston
5. Người dùng tiếp theo ở Boston yêu cầu cùng bức ảnh
6. CloudFront phục vụ từ cache edge cục bộ (~5ms)

Cùng phạt 80ms cho yêu cầu đầu tiên. Nhưng yêu cầu thứ một nghìn từ cùng thành phố là 5 mili giây.

Các **header Cache-Control** và các **cài đặt TTL** trong CloudFront xác định nội dung ở lại cache ở edge bao lâu. Các tệp hình ảnh có thể được cache hàng giờ hoặc hàng ngày. Các trang HTML (thay đổi thường xuyên hơn) có thể được cache trong vài phút hoặc vài giây.

Bạn có thể đang tự hỏi: tại sao không chỉ host toàn bộ ứng dụng ở nhiều region thay vì dùng một CDN? Nếu dữ liệu ở Oregon, tại sao không đặt một bản sao đầy đủ ở New York, Tokyo, và São Paulo? Bạn có thể. Nhưng điều đó nghĩa là giữ nhiều cơ sở dữ liệu đồng bộ, quản lý các triển khai qua các region đồng thời, xử lý các kịch bản split-brain nơi các region bất đồng. Một CDN là một câu trả lời đơn giản hơn nhiều cho nội dung tĩnh và bán-tĩnh: một origin, nhiều bản sao được cache ở edge. Bạn chỉ thêm sự phức tạp đa-region khi bạn thực sự cần các thao tác tính toán hoặc cơ sở dữ liệu gần người dùng — đối với hầu hết nội dung, caching ở edge là đủ.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Tại sao đặt cache ở edge thay vì chỉ thêm một cụm ElastiCache lớn hơn ở Oregon?"

"Vì vật lý học vẫn là vấn đề," Priya nói. "Ngay cả khi Oregon phản hồi trong một mili giây, phản hồi đó vẫn phải đi đến Boston. Thời gian đi-về là tối thiểu 70 mili giây — tốc độ ánh sáng không quan tâm các máy chủ của chúng ta nhanh đến đâu. Caching ở edge di chuyển câu trả lời gần câu hỏi hơn."

**Nội Dung Động: CloudFront Cho Nhiều Hơn Caching**

"Nhưng còn các phản hồi API của chúng ta thì sao?" Leo hỏi. "Những cái đó là động — chúng thay đổi theo người dùng, theo yêu cầu. Bạn không thể cache một trang lịch sử đơn hàng."

Đúng. Nhưng CloudFront vẫn giúp với nội dung động.

Ngay cả khi nội dung không thể được cache, CloudFront định tuyến yêu cầu từ edge location đến origin qua mạng xương sống riêng của AWS — sợi quang tốc độ cao kết nối hạ tầng AWS toàn cầu. Cái này nhanh hơn và đáng tin cậy hơn việc định tuyến qua internet công khai, nơi lưu lượng có thể nảy qua nhiều nhà mạng.

Kết quả: các yêu cầu động vẫn nhanh hơn 20-40% qua CloudFront so với đi trực tiếp đến origin qua internet công khai. Không phải vì caching, mà vì đường mạng.

"Cái đó không hợp lý," Maya nói. "Nếu phản hồi API vẫn phải đi từ Oregon đến edge rồi đến Boston, làm sao cái đó nhanh hơn đi trực tiếp từ Oregon đến Boston?"

"Hai lý do," Priya nói. "Thứ nhất, xương sống riêng của AWS nhanh hơn và đáng tin cậy hơn internet công khai. Lưu lượng internet công khai định tuyến qua nhiều nhà mạng, mỗi cái thêm độ trễ và sự biến đổi riêng của họ. Xương sống là sợi quang trực tiếp, độ trễ thấp. Thứ hai, kết thúc SSL xảy ra ở edge. Người dùng thiết lập một kết nối TLS đến edge location CloudFront gần nhất — bắt tay là nhanh. CloudFront sau đó giữ một kết nối liên tục, được thiết lập trước đến origin. Hai kết nối khoảng cách ngắn thay vì một kết nối khoảng cách dài."

"Vậy ngay cả với nội dung không được cache, CloudFront cắt bớt thời gian khỏi chi phí kết nối," Leo nói.

"Thường mười đến bốn mươi phần trăm. Không kịch tính như caching. Nhưng thật."

Ngoài ra, CloudFront cung cấp:

**Kết thúc SSL/TLS**: CloudFront xử lý HTTPS ở edge. Kết nối giữa người dùng và CloudFront được mã hóa. CloudFront có thể kết nối với origin của bạn qua HTTP nội bộ (giảm tải origin) hoặc HTTPS (cho mã hóa đầu-cuối).

**Bảo vệ DDoS**: CloudFront được tích hợp với AWS Shield Standard. Lưu lượng được phân tán qua hàng trăm edge location nghĩa là các cuộc tấn công được hấp thụ ở edge thay vì đập vào origin của bạn.

**Hạn chế theo địa lý**: Chặn quyền truy cập từ các quốc gia cụ thể. Nếu Nimbus chỉ được cấp phép hoạt động ở một số thị trường nhất định, CloudFront có thể thực thi điều đó ở edge mà không cần yêu cầu bao giờ đến các máy chủ của bạn.

**Và nếu ai đó cố gắng đột nhập qua CDN thì sao?** Priya hỏi. "Đầu độc cache (cache poisoning) — nếu ai đó xoay xở chèn nội dung xấu vào cache edge thì sao?"

"CloudFront có các kiểm soát khóa cache," Leo nói. "Bạn xác định chính xác những thuộc tính nào quyết định liệu hai yêu cầu có nhận cùng một phản hồi được cache hay không. Các header, query string, cookie. Một kẻ tấn công không thể chèn một phản hồi được cache khác mà không khớp khóa cache chính xác."

"Và Origin Access Control nghĩa là bucket S3 sẽ không phục vụ bất cứ thứ gì không đến qua CloudFront," Priya nói. "Một bề mặt tấn công thay vì hai."

**CloudFront Behavior: Các Quy Tắc Caching Chi Tiết**

Một phân phối CloudFront có thể có nhiều **behavior** — các quy tắc định tuyến dựa trên các mẫu URL.

Đối với Nimbus:

- `/images/*` → Cache ở edge trong 7 ngày (các bức ảnh không thay đổi thường xuyên)
- `/static/*` → Cache ở edge trong 30 ngày (CSS và JavaScript với các tên tệp có phiên bản)
- `/api/*` → Không cache; chuyển tiếp trực tiếp đến load balancer
- `/*` → Cache trong 5 phút (các trang HTML)

Cái này cho phép CloudFront thông minh: cache mạnh mẽ những gì ổn định, chuyển qua những gì động.

Các behavior được khớp từ cụ thể nhất đến ít cụ thể nhất. `/images/hero.jpg` khớp `/images/*` trước khi nó khớp `/*`. Cái bắt-tất-cả `/*` ở dưới cùng là mặc định — nó áp dụng cho bất cứ thứ gì không khớp một mẫu cụ thể hơn.

"Nếu chúng ta muốn caching khác nhau cho người dùng đã xác thực so với chưa xác thực thì sao?" Priya hỏi. "Cùng một URL có thể trả về nội dung khác nhau tùy thuộc liệu một người dùng đã đăng nhập hay chưa."

"Thì bạn bao gồm cookie session trong khóa cache," Leo nói. "Nhưng điều đó nghĩa là mọi người dùng đã đăng nhập nhận mục cache riêng của họ. Tỷ lệ hit của bạn sụp đổ cho nội dung đã xác thực."

"Đó là lý do bạn tách nội dung đã xác thực khỏi nội dung công khai ở cấp độ URL," Priya nói. "Bất cứ thứ gì đòi hỏi xác thực đi đến `/app/*` và không được cache. Nội dung công khai đi đến `/browse/*` và được cache mạnh mẽ. Một ranh giới rõ ràng."

Bài học: CloudFront hoạt động tốt nhất khi cấu trúc URL của bạn phản ánh ý định caching. Các URL trỏ đến dữ liệu hoàn toàn công khai, tĩnh nên trông khác với các URL trả về dữ liệu được cá nhân hóa, động. Nếu chúng trông giống nhau đối với CloudFront, hoặc cache bị hỏng hoặc nội dung sai được phục vụ.

Leo tái cấu trúc lược đồ URL Nimbus trong một cuối tuần. Các endpoint duyệt chuyển sang `/browse/`. Các endpoint API chuyển sang `/api/`. Giao diện app đã xác thực chuyển sang `/app/`. Ba behavior, ba chính sách caching rõ ràng, không mơ hồ.

"Đó là một chút tái cấu trúc," anh nói.

"Đó là cấu trúc đúng," Priya nói. "Bạn sẽ cần nó cuối cùng."

**Origin Access Control: Bảo Mật S3 Với CloudFront**

Nếu bucket S3 của bạn chứa nội dung riêng tư chỉ nên được phục vụ qua CloudFront (không trực tiếp), bạn có thể dùng **Origin Access Control (OAC)** để đảm bảo S3 từ chối các yêu cầu không đến từ CloudFront.

Theo cách này:

- `d1234abcd.cloudfront.net/image.jpg` → Được phục vụ (CloudFront có quyền)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Bị chặn (truy cập S3 trực tiếp bị từ chối)

Nội dung của bạn chỉ tiếp cận được qua phân phối của bạn, với các quy tắc cache và các cài đặt bảo mật của bạn được áp dụng.

---

**Sự Cố Ảnh Cũ**

Nhà hàng 112 — quán Colombia ở Eastside — đã gửi email cho bộ phận hỗ trợ vào một sáng thứ Năm. Một khách hàng đã phàn nàn rằng bức ảnh chính của nhà hàng vẫn hiển thị mặt tiền cửa hàng cũ, mặc dù chủ quán đã tải lên một cái mới hai ngày trước.

Leo mở các cài đặt phân phối CloudFront.

Behavior cho `/images/*` có một TTL là bảy ngày. Cổng đối tác nhà hàng đã tải lên một bức ảnh mới hai ngày trước, thay thế tệp ở cùng đường dẫn khóa S3: `restaurant-112/hero.jpg`. Tệp cũ đã biến mất khỏi S3. Nhưng CloudFront vẫn đang phục vụ nó từ cache ở mọi edge location đã lấy nó trong bảy ngày qua.

"Chúng ta đã thay đổi nội dung ở origin," Leo nói. "Nhưng CloudFront không biết điều đó. Nó có một bản sao được cache và nó sẽ không kiểm tra trong bảy ngày."

"Tôi đã triển khai nó rồi — ồ." Anh đã giả định việc thay thế tệp S3 sẽ tự động làm mới cache CloudFront. Nó không. CloudFront không có cơ chế để phát hiện rằng nội dung ở một khóa S3 đã thay đổi — nó đơn giản phục vụ bất cứ thứ gì nó đã cache cho đến khi TTL hết hạn.

Hai lựa chọn:

**Lựa chọn một: Invalidation (vô hiệu hóa).** Gửi cho CloudFront một yêu cầu invalidation cho `/images/restaurant-112/hero.jpg`. CloudFront đánh dấu đường dẫn đó cũ ở tất cả các edge location. Yêu cầu tiếp theo cho đường dẫn đó lấy nội dung mới từ S3. Chi phí: 1.000 đường dẫn invalidation đầu tiên mỗi tháng miễn phí; vượt quá đó, 0,005 đô la *cho mỗi đường dẫn*. Đối với một tệp, miễn phí. Đối với việc vô hiệu hóa hàng nghìn tệp trong một cập nhật hàng loạt, chi phí cộng dồn.

**Lựa chọn hai: Tên tệp có phiên bản.** Thay vì `hero.jpg`, đặt tên tệp là `hero-v2.jpg`. Cập nhật tham chiếu trong cơ sở dữ liệu. CloudFront không có mục được cache cho `hero-v2.jpg` — yêu cầu đầu tiên lấy nó từ S3, và người dùng thấy nó ngay lập tức. `hero.jpg` cũ vẫn được cache nhưng không còn được tham chiếu ở bất kỳ đâu. Nó hết hạn tự nhiên sau bảy ngày.

"Đối với nội dung do người dùng tải lên," Priya nói, "các tên có phiên bản là mẫu đúng. Thêm một hash hoặc dấu thời gian vào tên tệp. Mỗi lần tải lên mới là một mục cache mới. Không chi phí invalidation, không nội dung cũ."

Leo cập nhật cổng đối tác. Các lần tải lên mới giờ sẽ được lưu trữ là `hero-{timestamp}.jpg`. Bản ghi cơ sở dữ liệu được cập nhật với đường dẫn mới. Đường dẫn được cache cũ không liên quan.

"Còn trường hợp triển khai thì sao?" Maya hỏi. "Khi chúng ta đẩy một phiên bản mới của ứng dụng và JavaScript thay đổi?"

"Cùng nguyên tắc," Priya nói. "Các công cụ build như Webpack xuất các tên tệp được hash: `app.a3b9c2d4.js`. Triển khai một phiên bản mới và hash thay đổi: `app.f7e1b3c5.js`. CloudFront phục vụ cả hai từ cache — người dùng cũ nhận tệp cũ, người dùng mới nhận tệp mới. Không invalidation, không vấn đề phối hợp."

"Trang HTML tham chiếu hash hiện tại," Leo nói. "Vậy người dùng mới nhận HTML mới với hash JS mới, và CDN phục vụ tệp đúng."

"Thực hành tiêu chuẩn," Priya xác nhận.

---

**Độ Trễ Với Các Con Số Thật**

Tom đã chạy các đo lường độ trễ từ ba thành phố.

| Vị trí | Không có CloudFront | Với CloudFront | Cải thiện |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| New York | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tokyo | 260ms | 28ms | 89% |

"Sự cải thiện lớn nhất ở nơi vấn đề vật lý học tệ nhất," Tom nhận xét. "São Paulo đến Oregon là hơn hai trăm mili giây. Đó là hơn một phần tư giây, chỉ để bắt đầu cuộc trò chuyện."

"Và nội dung không bao giờ đến São Paulo lần thứ hai," Leo nói. "Người dùng đầu tiên ở São Paulo lấy từ Oregon và cache nó cục bộ. Mọi người dùng sau đó nhận ba mươi lăm mili giây."

"Người dùng đầu tiên ở São Paulo chịu chi phí," Tom nói. "Mọi người khác hưởng lợi."

"Đó là cách các CDN hoạt động," Priya nói. "Yêu cầu đầu tiên lấp đầy cache. Mọi cache hit sau đó gần như miễn phí."

Hệ quả cho các sản phẩm toàn cầu là đáng kể. Không có CloudFront, một người dùng ở Tokyo chờ 260 mili giây cho hình ảnh chính của bạn đang chờ vì vật lý học — cáp quang và tốc độ ánh sáng. Với CloudFront, bạn đặt một bản sao của hình ảnh đó ở Tokyo, và vấn đề vật lý học về cơ bản biến mất.

---

**Nhiều Origin: ALB và S3 Cùng Nhau**

"Chúng ta có hình ảnh của mình trên S3 và API của mình trên load balancer," Maya nói. "Chúng ta cần hai phân phối CloudFront không?"

"Không," Leo nói. "Một phân phối, nhiều origin."

Một phân phối CloudFront duy nhất có thể định tuyến các mẫu URL khác nhau đến các origin khác nhau. Đây là mẫu đa-origin:

```
eatnimbus.com/*         → Origin: ALB ở us-west-2 (nội dung động)
eatnimbus.com/images/*  → Origin: bucket S3 (hình ảnh tĩnh)
eatnimbus.com/static/*  → Origin: bucket S3 (CSS, JS, font)
```

CloudFront đánh giá các behavior theo thứ tự cụ thể. Một yêu cầu đến `/images/hero.jpg` khớp behavior `/images/*` và đi đến S3. Một yêu cầu đến `/api/orders` khớp cái bắt-tất-cả `/*` và đi đến ALB.

Lợi ích: một tên miền, một chứng chỉ SSL, một phân phối CloudFront, nhiều backend. Người dùng thấy một tên miền thống nhất. Việc định tuyến là vô hình đối với họ.

Một chi tiết vận hành cũng là một sự thật thi được đảm bảo: chứng chỉ SSL đó đến từ AWS Certificate Manager (ACM), và **một chứng chỉ được dùng bởi CloudFront phải được yêu cầu hoặc nhập trong `us-east-1`** — bất kể các origin của bạn sống ở đâu. CloudFront là một dịch vụ toàn cầu có control plane sống ở us-east-1; một chứng chỉ nằm ở us-west-2 đơn giản sẽ không xuất hiện trong dropdown của phân phối. (Đối với các dịch vụ theo region như một ALB, chứng chỉ sống trong region riêng của ALB.)

"Và ALB không đối mặt với công khai?" Priya hỏi.

"Chỉ CloudFront nói chuyện với ALB," Leo nói. "Chúng ta hạn chế security group của ALB vào prefix list được quản lý của CloudFront. Các kết nối trực tiếp đến ALB từ internet bị chặn."

"Vậy cách duy nhất để tiếp cận ứng dụng là qua CloudFront."

"Điều đó nghĩa là các quy tắc WAF, kết thúc SSL, và bảo vệ DDoS áp dụng cho tất cả lưu lượng trước khi nó đến chúng ta."

---

**CloudFront Functions so với Lambda@Edge**

"Chúng ta đã nghĩ về điều chúng ta sẽ làm nếu chúng ta cần viết lại một URL ở edge chưa?" Priya hỏi. "Hoặc thêm một header bảo mật vào mọi phản hồi?"

"Chúng ta không thể làm điều đó trong ứng dụng sao?" Leo hỏi.

"Chúng ta có thể. Nhưng nếu nó xảy ra ở edge — trước khi CloudFront phục vụ từ cache — chúng ta tiết kiệm một chuyến đi-về đến origin."

CloudFront hỗ trợ hai cơ chế để chạy mã ở edge:

**CloudFront Functions** là các hàm JavaScript nhẹ chạy ở mọi edge location. Chúng thực thi trong thời gian dưới mili giây, xử lý hàng triệu yêu cầu mỗi giây, và được thiết kế cho các biến đổi đơn giản: viết lại URL, thao tác header, chuẩn hóa query string, các chuyển hướng đơn giản. Chúng có thể chạy trên các yêu cầu của viewer và các phản hồi của viewer (trước và sau cache, từ góc nhìn của người dùng). Chúng không thể thực hiện các lần gọi mạng. Chi phí: 0,10 đô la cho mỗi triệu lần gọi.

**Lambda@Edge** chạy các hàm Lambda thực tế ở các edge location theo region của CloudFront (không phải mọi pop, mà hàng chục cái lớn toàn cầu). Lambda@Edge có thể thực hiện các lần gọi mạng, truy cập các cơ sở dữ liệu, tạo các phản hồi động, làm logic xác thực phức tạp. Nó chạy trên các yêu cầu của viewer, các yêu cầu của origin, các phản hồi của origin, và các phản hồi của viewer — cho bạn bốn điểm can thiệp trong vòng đời yêu cầu. Chi phí: cao hơn CloudFront Functions, được tính theo yêu cầu và thời lượng.

Mô hình tư duy:

| Trường hợp sử dụng | Công cụ |
|---|---|
| Viết lại `/old-path` thành `/new-path` | CloudFront Functions |
| Thêm header `Strict-Transport-Security` | CloudFront Functions |
| Chuẩn hóa các query string trước khi tra cứu cache | CloudFront Functions |
| Kiểm thử A/B: gán một cookie test trên yêu cầu của viewer | CloudFront Functions |
| Kiểm thử A/B: định tuyến 10% người dùng đến một origin khác | Lambda@Edge (yêu cầu origin — CloudFront Functions không thể thay đổi origin) |
| Xác thực một token JWT (đòi hỏi thư viện crypto) | Lambda@Edge |
| Lấy nội dung được cá nhân hóa từ một cơ sở dữ liệu ở edge | Lambda@Edge |
| Tạo một thumbnail hình ảnh theo yêu cầu ở edge | Lambda@Edge |

Đối với Nimbus: họ dùng một CloudFront Function để thêm các header bảo mật vào mọi phản hồi — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Hai chục dòng JavaScript. Thực thi dưới mili giây. Không cần chuyến đi-về đến origin.

"Sẽ mất lâu hơn để giải thích các header cho một kỹ sư cấp dưới," Leo nói, "so với viết hàm."

---

**Price Class: Chọn Các Edge Location Nào**

"Chúng ta đã nghĩ về điều này tốn bao nhiêu ở quy mô lớn chưa?" Tom hỏi, cuộn qua trang định giá CloudFront.

"Cái đó tốn bao nhiêu mỗi tháng?" về mặt kỹ thuật là hai câu hỏi ở đây. Câu đầu tiên: CloudFront tính phí gì? Câu thứ hai: bạn có cần mọi edge location trên thế giới không?

Định giá truyền dữ liệu CloudFront thay đổi theo region. Lưu lượng được phục vụ từ các edge location ở Bắc Mỹ và châu Âu là rẻ nhất. Lưu lượng từ Nam Mỹ, châu Á-Thái Bình Dương, Úc, và Ấn Độ đắt hơn — vì hạ tầng tốn nhiều hơn ở đó.

AWS cho phép bạn chọn một **price class** cho phân phối của bạn:

- **Price Class All**: Dùng tất cả các edge location toàn cầu. Hiệu suất tốt nhất ở khắp nơi. Chi phí truyền dữ liệu cao nhất cho các region ngoài Bắc Mỹ và châu Âu.
- **Price Class 200**: Dùng hầu hết các edge location (Bắc Mỹ, châu Âu, châu Á, Trung Đông, châu Phi). Loại trừ các vị trí Nam Mỹ đắt nhất và một số vị trí châu Đại Dương.
- **Price Class 100**: Chỉ dùng các edge location Bắc Mỹ và châu Âu. Rẻ nhất. Người dùng ở São Paulo, Tokyo, và Sydney vẫn được phục vụ — nhưng từ một edge Bắc Mỹ hoặc châu Âu, không phải cái gần nhất của họ.

"Vậy nếu chúng ta chọn Price Class 100," Tom nói, "một người dùng ở São Paulo được phục vụ từ... Miami? New York?"

"Bất cứ đâu edge được bao gồm gần nhất. Có lẽ 50 mili giây thay vì 230 mili giây trực tiếp đến Oregon," Priya nói. "Vẫn là một cải thiện có ý nghĩa. Không tốt bằng Price Class All."

"Và sự khác biệt chi phí?"

"Truyền dữ liệu ra khỏi Nam Mỹ tốn khoảng gấp đôi chi phí của Bắc Mỹ. Đối với một startup vẫn đang xây dựng lưu lượng, Price Class 200 là một thỏa hiệp hợp lý — bạn có được châu Á và châu Âu với chi phí thấp hơn Price Class All, và hầu hết người dùng của bạn được bao phủ."

"Bắt đầu với 200," Tom nói. "Khi chúng ta có dữ liệu lưu lượng thật từ mỗi region, chúng ta sẽ quyết định liệu All có đáng giá không."

Price class đúng phụ thuộc vào nơi người dùng của bạn ở. Nếu bạn không có người dùng ở Nam Mỹ, trả tiền cho các edge location Nam Mỹ là chi phí thuần túy. Nếu hai mươi phần trăm doanh thu của bạn đến từ Brazil, sự cải thiện hiệu suất từ Price Class All có lẽ tự trả cho chính nó.

---

**Thiết Kế Khóa Cache**

"Chúng ta đã nghĩ về điều gì xảy ra khi hai người dùng khác nhau yêu cầu cùng một URL nhưng nhận nội dung khác nhau chưa?" Priya hỏi.

Leo nghĩ về nó. "Các trang được cá nhân hóa."

"Hoặc các trang theo ngôn ngữ. Hoặc các phiên bản di động so với máy tính để bàn. Hoặc các trang thay đổi theo cookie."

Theo mặc định, CloudFront chỉ dùng đường dẫn URL làm khóa cache. Hai yêu cầu đến `/browse` nhận cùng một phản hồi được cache, bất kể sở thích ngôn ngữ, loại thiết bị, hoặc cookie session của người dùng.

Nếu ứng dụng của bạn phục vụ nội dung khác nhau dựa trên các query string, header, hoặc cookie — và bạn muốn CloudFront cache các biến thể đó riêng biệt — bạn cần bao gồm các thuộc tính đó trong **khóa cache**.

Đối với Nimbus:

- `/browse?city=miami` nên cache riêng biệt với `/browse?city=boston` — các danh sách nhà hàng khác nhau. Bao gồm các query string trong khóa cache.
- Người dùng di động có thể nhận một bố cục khác. Bao gồm một loại thiết bị được chuẩn hóa (suy ra từ header `User-Agent`) trong khóa cache.
- Header `Accept-Language` xác định trang kết xuất bằng ngôn ngữ nào. Bao gồm nó trong khóa cache.

Tuy nhiên, hãy cẩn thận. Mỗi thuộc tính khóa cache bạn thêm tạo ra nhiều biến thể cache hơn. Nếu bạn bao gồm toàn bộ chuỗi `User-Agent` (vốn thay đổi theo phiên bản trình duyệt, phiên bản OS, và mức vá), bạn thực ra phá vỡ caching — mỗi người dùng có một User-Agent hơi khác, vậy mỗi yêu cầu là một cache miss.

Kỷ luật: chuẩn hóa trước khi cache. Giảm "iPhone 15 Pro Safari 17.4.1" thành "mobile." Giảm tất cả các ngôn ngữ được chấp nhận thành hai hoặc ba cái bạn thực sự hỗ trợ. Chỉ bao gồm những gì thực sự thay đổi phản hồi.

"Khóa cache của bạn càng cụ thể," Leo nói, "tỷ lệ hit của bạn càng tệ."

"Và càng chung chung," Priya nói, "bạn càng có khả năng phục vụ nội dung sai cho người dùng sai."

"Vậy thiết kế khóa cache là cùng sự đánh đổi như mọi thứ khác trong caching."

"Đúng," Priya nói. "Nó luôn là cùng sự đánh đổi."

---

## Khi CloudFront Không Phải Là Câu Trả Lời: Global Accelerator

Ứng dụng di động Nimbus có một tính năng mà Tom đã lặng lẽ theo dõi trong hai tháng: trạng thái đơn hàng thời gian thực. Khi một khách hàng đặt một đơn hàng, ứng dụng giữ kết nối qua WebSocket và màn hình quản lý đơn hàng của nhà bếp cập nhật theo thời gian thực. Không nút làm mới. Không polling. Một kết nối trực tiếp đẩy các cập nhật ngay khi một nhà bếp đánh dấu một mục sẵn sàng.

"Cái này đang dùng WebSocket," Tom nói, nhìn vào các chỉ số độ trễ một buổi sáng. "Từ người dùng ở São Paulo, việc thiết lập kết nối đang mất 340 mili giây. Có gì đó không ổn."

"CloudFront không cache các kết nối WebSocket," Leo nói. "Nó proxy chúng — chuyển chúng qua đến origin. Không lợi ích caching."

"Đúng. Vậy tại sao nó vẫn chậm?"

"Vì WebSocket vẫn đi từ São Paulo đến các máy chủ của chúng ta ở Oregon qua internet công khai," Leo nói. "CloudFront giúp, vì nó kết thúc bắt tay TLS ở edge rồi dùng xương sống của AWS đến origin. Nhưng đối với một kết nối WebSocket liên tục, đó vẫn là một kết nối khoảng cách dài."

"Có một dịch vụ cho chính xác vấn đề này," Priya nói.

**AWS Global Accelerator** không phải là một CDN. Nó cache không gì cả. Nó không phục vụ nội dung từ các edge location. Những gì nó làm là cho bạn hai địa chỉ IP Anycast tĩnh được quảng bá toàn cầu từ tất cả các edge location AWS đồng thời — và rồi định tuyến lưu lượng của người dùng của bạn qua xương sống riêng của AWS thay vì internet công khai.

Khi một khách hàng ở São Paulo mở ứng dụng Nimbus, thiết bị của họ kết nối với edge location AWS gần nhất (có thể ở chính São Paulo). Từ edge location đó, lưu lượng đi đến các máy chủ của Nimbus ở Oregon qua mạng sợi quang riêng tư, được giám sát, được tối ưu hóa của AWS — không qua internet công khai nơi các gói nảy qua các nhà mạng không thể đoán trước và các bước nhảy định tuyến.

Internet công khai không được thiết kế cho độ trễ. Nó được thiết kế cho khả năng phục hồi — các gói có thể đi bất kỳ đường nào có sẵn. Xương sống của AWS được thiết kế khác đi: nó trực tiếp, ít tắc nghẽn, và dưới sự kiểm soát vận hành của AWS.

Tom đo điểm chuẩn sự khác biệt.

| Đường | Độ trễ (São Paulo đến Oregon) |
|---|---|
| Internet công khai | 340ms |
| Qua Global Accelerator | 180ms |

Giảm 47%. Không phải từ caching — từ một đường mạng tốt hơn.

"Vậy tại sao chúng ta không chỉ dùng CloudFront cho mọi thứ?" Maya hỏi. "CloudFront đã định tuyến qua xương sống của AWS cho nội dung động."

"CloudFront chỉ là HTTP và HTTPS," Priya nói. "WebSocket hoạt động với CloudFront, nhưng chỉ qua nâng cấp HTTP. Và một số giao thức của chúng ta — dữ liệu cảm biến IoT, ví dụ — là TCP hoặc UDP thuần túy. CloudFront không xử lý những cái đó. Global Accelerator độc lập với giao thức. TCP, UDP, WebSocket, bất cứ gì. Nó di chuyển các gói, không phải các yêu cầu HTTP."

Có một sự khác biệt khác mà Priya đã ghi chú trong tài liệu bảo mật của cô.

"Global Accelerator cho chúng ta hai IP Anycast tĩnh," cô nói. "Các IP đó không bao giờ thay đổi. Điều đó nghĩa là chúng ta có thể thêm chúng vào chính sách bảo mật của chúng ta, thêm chúng vào các danh sách trắng của đối tác, thêm chúng vào các quy tắc tường lửa. Các địa chỉ IP của CloudFront thay đổi theo thời gian — chúng được quản lý bởi AWS và không cố định."

"Còn failover thì sao?" Leo hỏi.

"Tức thời," Priya nói. "Nếu ứng dụng us-west-2 của chúng ta có một vấn đề, Global Accelerator có thể chuyển lưu lượng đến một bản dự phòng ở us-east-1 trong dưới 30 giây — mà không thay đổi địa chỉ IP mà người dùng đang kết nối. Failover DNS qua Route 53 mất 60-300 giây tùy thuộc TTL. Global Accelerator nhanh hơn."

**CloudFront so với Global Accelerator — mô hình tư duy:**

CloudFront cải thiện phân phối bằng caching. Nó được xây dựng cho HTTP/HTTPS và lợi ích lớn nhất khi nội dung có thể được cache gần người dùng — các tệp tĩnh, hình ảnh, JavaScript. Khi nội dung không thể được cache, CloudFront vẫn giúp qua định tuyến xương sống, nhưng sự cải thiện nhỏ hơn.

Global Accelerator cải thiện phân phối bằng định tuyến. Nó di chuyển không nội dung. Nó cache không gì cả. Lợi ích áp dụng cho mọi gói — được cache hay không, HTTP hay không, tĩnh hay động. Hai IP tĩnh hoạt động toàn cầu. Failover gần như tức thời. Các trường hợp sử dụng nơi CloudFront không đủ — WebSocket thời gian thực, các giao thức dựa trên UDP, lưu lượng không phải HTTP, các ứng dụng toàn cầu đòi hỏi IP cố định — là nơi Global Accelerator là công cụ đúng.

Tom cập nhật ứng dụng di động Nimbus để kết nối với endpoint Global Accelerator cho tính năng trạng thái đơn hàng thời gian thực. Việc thiết lập kết nối WebSocket ở São Paulo giảm từ 340ms xuống 180ms. Các cập nhật nhà bếp vẫn có cảm giác tức thời — vì bây giờ, đối với người dùng ngoài Bắc Mỹ, chúng thực sự là vậy.

## Điểm Mạnh và Hạn Chế

**Tại sao CloudFront mạnh mẽ**:

- Hơn 750 điểm hiện diện ở hơn 100 thành phố — hầu hết người dùng nhận nội dung từ <20ms cách họ
- Nội dung tĩnh được phục vụ trong một chữ số mili giây sau cache đầu tiên
- Giảm tải origin đáng kể (lưu lượng lặp lại không bao giờ chạm vào các máy chủ của bạn)
- Tích hợp với AWS Shield, WAF, và Certificate Manager
- Không cần lập kế hoạch dung lượng — CloudFront tự động mở rộng
- Các phân phối đa-origin định tuyến các đường dẫn khác nhau đến các backend khác nhau từ một tên miền
- CloudFront Functions xử lý logic edge nhẹ ở độ trễ dưới mili giây

**Nơi nó trở nên phức tạp**:

- Nội dung được cache có thể cũ — vô hiệu hóa cache tốn tiền (0,005 đô la cho mỗi đường dẫn sau 1.000 đường dẫn miễn phí đầu tiên mỗi tháng). Dùng các tên tệp có phiên bản thay vào đó.
- Các header Cache-Control phải được đặt đúng ở origin — các sai lầm gây ra nội dung cũ
- Nội dung động hưởng lợi từ tối ưu hóa định tuyến nhưng không từ caching
- Debug hành vi cache (cái gì được cache ở đâu, trong bao lâu) đòi hỏi hiểu nhiều lớp: các header origin, các cài đặt TTL CloudFront, các quy tắc behavior
- Truyền dữ liệu ra qua CloudFront tốn tiền, mặc dù ít hơn truyền dữ liệu tiêu chuẩn
- Thiết kế khóa cache đòi hỏi suy nghĩ cẩn thận — quá cụ thể phá vỡ caching, quá chung chung phục vụ nội dung sai

## Tóm Tắt

CloudFront không thay đổi vật lý học. Ánh sáng vẫn đi ở cùng tốc độ. Nhưng nó thay đổi nơi câu trả lời sống — và đối với hầu hết người dùng, câu trả lời giờ cách vài mili giây thay vì vài trăm. Tỷ lệ cache hit sau khi triển khai: 83%. Điều đó nghĩa là 830.000 trong mỗi triệu yêu cầu không bao giờ đến các máy chủ origin chút nào. Người dùng ở São Paulo đi từ 290 mili giây xuống 35 mili giây. Người dùng ở Tokyo từ 260 xuống 28.

- Một **CDN** cache các bản sao nội dung của bạn ở các edge location gần người dùng của bạn — giảm độ trễ và tải origin.
- **CloudFront** là CDN của AWS, với hơn 750 điểm hiện diện toàn cầu.
- Các cache miss lấy từ **origin** (S3, ALB, EC2). Các cache hit phục vụ từ edge — mili giây, không phải hàng trăm mili giây.
- **Behavior** cho phép bạn đặt các quy tắc caching khác nhau cho các mẫu URL khác nhau. Một phân phối có thể phục vụ `/images/*` từ S3 và `/*` từ một ALB.
- Nội dung động không được cache, nhưng CloudFront vẫn cải thiện hiệu suất qua mạng xương sống riêng của AWS.
- **Tránh nội dung cũ** bằng cách dùng các tên tệp có phiên bản (ví dụ, `hero-v2.jpg`) thay vì invalidation — rẻ hơn và đáng tin cậy hơn.
- **CloudFront Functions** xử lý logic edge nhẹ (thao tác header, viết lại URL) ở tốc độ dưới mili giây. **Lambda@Edge** xử lý xử lý nặng hơn đòi hỏi các lần gọi mạng.
- **Price class** cho phép bạn kiểm soát các edge location nào phục vụ lưu lượng của bạn — và do đó chi phí truyền dữ liệu của bạn.
- **Thiết kế khóa cache** xác định các thuộc tính yêu cầu nào tạo ra các biến thể được cache riêng biệt. Các khóa cụ thể hơn = tỷ lệ hit thấp hơn. Ít cụ thể hơn = rủi ro phục vụ nội dung sai.

## Mẹo Thi

*SAA-C03 Domain: Thiết kế kiến trúc hiệu suất cao (Domain 3, Task 3.4)*

- **CloudFront + S3**: Mẫu thi cổ điển để phục vụ các website tĩnh toàn cầu. Bucket S3 làm origin, CloudFront làm CDN, Origin Access Control để ngăn truy cập S3 trực tiếp.
- **Edge location so với Region so với AZ**: Các edge location nhiều hơn và chỉ tồn tại cho các mục đích caching/CDN. Chúng không giống các AZ (vốn chạy tính toán của bạn).
- **Vô hiệu hóa cache**: Tạo một invalidation `/images/*` để buộc CloudFront lấy nội dung mới. Tốn tiền — kỳ thi có thể hỏi giải pháp thay thế tiết kiệm chi phí: các URL có phiên bản (`image-v2.jpg` thay vì `image.jpg`), vốn tự nhiên bỏ qua cache.
- **Kiểm soát TTL**: `Cache-Control: max-age=3600` ở origin đặt một TTL cache 1 giờ. CloudFront tôn trọng các header này. TTL tối thiểu, TTL tối đa, và TTL mặc định cũng có thể được đặt trong behavior phân phối.
- **CloudFront Functions so với Lambda@Edge**: CloudFront Functions chạy ở edge cho thao tác yêu cầu/phản hồi nhẹ (dưới mili giây). Lambda@Edge chạy mã Lambda của bạn ở các edge location theo region cho xử lý nặng hơn. Kỳ thi phân biệt chúng theo độ phức tạp trường hợp sử dụng. CloudFront Functions không thể thực hiện các lần gọi mạng; Lambda@Edge có thể.
- **Signed URL và Signed Cookie**: Kiểm soát ai có thể truy cập nội dung qua CloudFront. Signed URL cho quyền truy cập đến các tệp cụ thể; signed cookie cho quyền truy cập đến nhiều tệp. Kỳ thi dùng những cái này cho "nội dung của người đăng ký trả phí."
- **Price Class**: Kỳ thi có thể hỏi price class nào để chọn cho một khán giả toàn cầu so với một khán giả Bắc Mỹ/châu Âu. Price Class All = hiệu suất tốt nhất, chi phí cao nhất. Price Class 100 = chỉ Bắc Mỹ và châu Âu, chi phí thấp nhất.
- **Khóa cache**: Khóa cache mặc định là URL. Thêm các query string, header, hoặc cookie vào khóa cache tạo ra các biến thể được cache riêng biệt — nhưng tăng tỷ lệ cache miss. Kỳ thi có thể trình bày một kịch bản nơi nội dung thay đổi theo một tham số query và hỏi cách cấu hình caching.
- **Origin failover**: CloudFront hỗ trợ một origin group với một origin primary và secondary. Nếu origin primary trả về một lỗi 5xx, CloudFront tự động thử lại với secondary. Khác với failover Route 53 — cái này nằm trong một phân phối CloudFront duy nhất.
- **Các behavior đa-origin**: Một phân phối duy nhất có thể định tuyến `/images/*` đến S3 và `/*` đến một ALB. Kỳ thi có thể trình bày cái này như "cách phục vụ nội dung tĩnh và động từ một tên miền mà không cần hai phân phối."
- **CloudFront so với Global Accelerator:** CloudFront = CDN HTTP/HTTPS, cache nội dung ở các edge location, giảm tải origin, tốt nhất cho nội dung tĩnh và có thể cache. Global Accelerator = bất kỳ giao thức TCP/UDP nào, cache không gì cả, định tuyến lưu lượng qua xương sống riêng của AWS, cung cấp 2 IP Anycast tĩnh, hỗ trợ failover theo region gần như tức thời. Kích hoạt thi: "cải thiện độ trễ cho lưu lượng không phải HTTP" hoặc "IP tĩnh cho một ứng dụng toàn cầu" hoặc "hiệu suất WebSocket cho người dùng toàn cầu" hoặc "failover theo region nhanh hơn DNS" → Global Accelerator. "Phục vụ các tệp tĩnh toàn cầu với độ trễ thấp" → CloudFront.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Giải thích sự khác biệt giữa một cache hit CloudFront và một cache miss. Điều gì xảy ra trong mỗi trường hợp?

*(Gợi ý: Hãy nghĩ về nơi nội dung đến từ, và thời gian phản hồi khác nhau như thế nào giữa hai trường hợp.)*

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một công ty phần mềm phân phối các tệp cài đặt lớn (~2GB mỗi cái) từ một bucket S3 đến các khách hàng trên toàn thế giới. Tốc độ tải xuống chậm cho các khách hàng ở châu Á. Đội ngũ muốn cải thiện hiệu suất mà không sao chép bucket S3 sang nhiều region. Họ cũng cần đảm bảo rằng chỉ các khách hàng trả phí mới có thể tải xuống các tệp cài đặt.

Giải pháp nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Bật S3 Transfer Acceleration trên bucket và tạo các URL pre-signed cho các khách hàng trả phí  
B) Dùng CloudFront với bucket S3 làm origin, bật Origin Access Control, và dùng CloudFront Signed URL cho các khách hàng trả phí  
C) Tạo một bucket S3 ở mỗi AWS region và dùng định tuyến theo địa lý Route 53 để hướng các khách hàng đến bucket gần nhất  
D) Dùng một Application Load Balancer ở mỗi region với các EC2 instance phục vụ các tệp cài đặt

**Gợi ý 1**: Yêu cầu là cải thiện hiệu suất toàn cầu *mà không* sao chép bucket. Lựa chọn nào không đòi hỏi nhiều bucket?

**Gợi ý 2**: Dịch vụ nào cụ thể kiểm soát ai có thể truy cập nội dung được phục vụ qua CloudFront?

**Gợi ý 3**: S3 Transfer Acceleration được tối ưu hóa cho các lần tải lên khoảng cách dài *đến* S3. Để phân phối nội dung *từ* S3 đến người dùng cuối toàn cầu, CloudFront là công cụ đúng.

**Đáp án**: B

**Giải thích**: CloudFront cache các tệp cài đặt ở các edge location toàn cầu sau lần tải xuống đầu tiên. Các lần tải xuống tiếp theo từ cùng region đến từ edge — nhanh hơn nhiều so với băng qua Thái Bình Dương từ S3 ở us-west-2. Origin Access Control đảm bảo bucket S3 chỉ có thể truy cập qua CloudFront. Signed URL hạn chế quyền truy cập cho các khách hàng trả phí.

**Tại sao không phải A?** S3 Transfer Acceleration được tối ưu hóa cho các lần tải lên khoảng cách dài *vào* S3 — không phải để phân phối nội dung *từ* S3 đến một khán giả toàn cầu. Cho điều đó, CloudFront là công cụ đúng. Các URL pre-signed kiểm soát quyền truy cập nhưng không cải thiện hiệu suất toàn cầu.

**Tại sao không phải C?** Tạo một bucket S3 cho mỗi region có hoạt động cho hiệu suất, nhưng nó mâu thuẫn với yêu cầu tránh sao chép. Nó cũng đòi hỏi một chiến lược đồng bộ dữ liệu qua các bucket.

**Tại sao không phải D?** Các EC2 instance phía sau một load balancer ở mỗi region đắt hơn đáng kể so với CloudFront và đòi hỏi quản lý các máy chủ ở nhiều region.

*SAA-C03 Domain: Thiết kế kiến trúc hiệu suất cao — Task 3.4*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Nimbus muốn thêm nội dung video — các video hướng dẫn nấu ăn ngắn từ các đối tác nhà hàng. Các video có thể là 50-500MB. Họ kỳ vọng cùng một video được xem bởi hàng nghìn người dùng ở cùng một thành phố trong vòng vài giờ sau khi xuất bản.

Thiết kế kiến trúc lưu trữ và phân phối. Bạn có dùng S3 và CloudFront không? Bạn sẽ xử lý yêu cầu đầu tiên (khởi động nguội) như thế nào để giảm thiểu sự chậm trễ trước khi video được cache? TTL cache nào bạn sẽ đặt cho một video sẽ không thay đổi sau khi xuất bản?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là luyện tập các quyết định thiết kế CDN.)*

## Cảnh Sau Tín Dụng

"Tôi đã triển khai nó rồi — ồ." Leo đã trỏ phân phối CloudFront vào sai origin — bucket S3 phát triển thay vì cái production. Trong khoảng bốn phút, một số người dùng Bờ Tây đã thấy một phiên bản cũ của ứng dụng. Anh đã sửa các cài đặt origin, vô hiệu hóa cache, và lặng lẽ cập nhật nhật ký sự cố.

Priya xem các chỉ số CloudFront sau khi triển khai.

Tỷ lệ cache hit: 83%.

"Điều đó có nghĩa là gì?" Tom hỏi.

"Nó có nghĩa là 83% người dùng của chúng ta đang nhận nội dung từ một edge location gần họ, không phải từ us-west-2."

"Và 17% còn lại?"

"Các yêu cầu lần đầu. Nội dung chưa được cache ở edge location đó."

Tom nhìn chằm chằm vào các chỉ số. "Vậy chúng ta đang phục vụ gần một triệu yêu cầu mỗi ngày từ các node edge CloudFront. Và chỉ 170.000 trong số đó thực sự chạm vào các máy chủ của chúng ta."

"Đúng vậy."

"Vậy nếu chúng ta không có CloudFront, các máy chủ của chúng ta sẽ xử lý một triệu yêu cầu."

"Ở 140-160 mili giây mỗi cái, cho người dùng toàn cầu."

Tom ngả ra sau. Anh có một vẻ mặt mà Maya nhận ra — vẻ mặt của một người đang tính toán lại chi phí theo thời gian thực.

"Điều này xứng đáng," anh nói.

Maya đã ở trên laptop của cô. "Hai kỹ sư mới gia nhập chúng ta tuần tới. Soo-Jin từ đội ngũ nền tảng ở công ty cuối của cô, và Rafael — anh chuyên về bảo mật. Tôi muốn họ được onboard về IAM trước ngày đầu tiên của họ."

"IAM nâng cao?" Leo hỏi.

"Các vai trò, các chính sách, truy cập đa-tài-khoản. Thứ thực sự."

Chương tiếp theo: các quyền chi tiết cho phép một phần của hệ thống nói chuyện với một phần khác — một cách an toàn.
