# Chương 15: Những Người Gác Ở Cổng

Văn phòng yên tĩnh vào một sáng thứ Ba khi Priya mở các VPC flow log và bắt đầu đọc. Bên ngoài cửa sổ, thành phố đang thức dậy. Bên trong, màn hình hiển thị một thứ không nên ở đó: một kết nối đi từ một EC2 instance lúc 2:17 sáng đến một địa chỉ IP ở Romania.

Key deploy cũ từ phiên bản đầu tiên của Nimbus vẫn còn hoạt động. Nó đã thực hiện ba lần gọi API tuần trước. Leo không biết điều gì đã thực hiện chúng.

---

*Cuộc đại tu IAM đã thay thế các access key bằng các role. Mọi dịch vụ giờ có chính xác các quyền nó cần. Nhưng trong khi công việc đó đang xảy ra, một vấn đề cũ hơn đã lặng lẽ trở nên tồi tệ hơn: một thông tin xác thực đang hoạt động từ một pipeline triển khai đã ngừng hoạt động vẫn còn sống, và cái gì đó đã dùng nó. Lớp IAM đã được củng cố. Các kiểm soát mạng có thể đã chứa được thiệt hại cần cùng sự chú ý.*

---

Priya kéo các VPC flow log lên — các hồ sơ lưu lượng mạng hiển thị mọi kết nối vào và ra khỏi VPC.

"Vào thứ Ba lúc 2:17 sáng," cô nói, "có một kết nối đi từ EC2 instance chạy API cũ đến một địa chỉ IP ở Romania."

"Đó không phải là hạ tầng của chúng ta," Leo nói.

"Không."

"Vậy ai đó đã ở trên EC2 instance của chúng ta."

"Hoặc cái gì đó."

Họ truy ngược lại: key deploy cũ đã được dùng để tải lên một script nhỏ lên EC2 instance. Script đã cố gắng quét các cổng trên các máy chủ lân cận. Hầu hết các lần quét đã thất bại.

"Tôi đã triển khai nó rồi — ồ." Leo đã triển khai một cách khắc phục cho quy tắc security group trước khi cuộc điều tra hoàn tất. Cách khắc phục đúng, nhưng anh đã làm nó trước khi Priya đọc xong các flow log. Cô đã phải dừng lại và xác minh rằng thay đổi không ảnh hưởng đến bất cứ thứ gì bất ngờ.

"Lần sau, chờ cho đến khi cuộc điều tra đóng lại trước khi đẩy các thay đổi," cô nói.

"Các security group đã chặn chúng," Priya nói. "Kẻ tấn công lọt vào một EC2 instance. Chúng không thể tiếp cận những cái khác vì các security group chỉ cho phép lưu lượng từ load balancer."

"Vậy thiệt hại đã được chứa."

"Vì chúng ta đã cấu hình đúng các security group. Hãy tưởng tượng nếu chúng ta để cổng 5432 mở cho bất kỳ EC2 instance nào trong tài khoản."

Leo không cần phải tưởng tượng. Anh đã thấy cấu hình đó trong thiết lập ban đầu.

"Chúng ta đã nghĩ về điều đó sẽ nghĩa là gì chưa?" Priya tiếp tục. "Bất kỳ EC2 instance nào trong tài khoản — kể cả cái với key bị xâm phạm — có thể đã kết nối trực tiếp với cơ sở dữ liệu. Chạy SQL tùy ý. Tải xuống lịch sử đơn hàng của mọi khách hàng. Xóa các bảng."

"Thay vào đó chúng bị từ chối mỗi lần chúng thử," Leo nói.

"Đúng. Vì security group cơ sở dữ liệu chỉ chấp nhận các kết nối từ security group API. Không từ bất kỳ EC2 nào trong tài khoản. Không từ bất kỳ IP nào. Cụ thể từ security group API."

"Một quyết định thiết kế đó," Maya nói, "là sự khác biệt giữa một sự cố được chứa và một vụ rò rỉ dữ liệu hoàn toàn."

"Thiết kế security group không phải là một ô đánh dấu," Priya nói. "Nó là bảo mật thực tế của hệ thống."

Rafael đã lắng nghe. "Làm sao bạn học được cấu hình đúng là gì? Các quy tắc có vẻ tùy tiện lúc đầu."

"Bạn bắt đầu bằng cách liệt kê những gì mỗi thành phần cần làm," Priya nói. "Load balancer cần chấp nhận HTTPS từ bất kỳ đâu. Máy chủ API cần chấp nhận HTTP chỉ từ load balancer. Cơ sở dữ liệu cần chấp nhận PostgreSQL chỉ từ máy chủ API. Redis cần chấp nhận cổng 6379 chỉ từ máy chủ API. Những yêu cầu đó ánh xạ trực tiếp đến các quy tắc đến. Mọi thứ khác bị từ chối theo mặc định."

"Và đi?"

"Đi là nơi mọi người lười. Hầu hết các đội ngũ để đi là cho-phép-tất-cả. Điều đó nghĩa là một instance bị xâm phạm có thể gọi bất cứ thứ gì. Chúng ta sẽ siết chặt cái đó."

**Hai Lớp Bảo Mật Mạng**

Trong một VPC, bạn có hai công cụ riêng biệt để kiểm soát lưu lượng mạng:

**Security Group**: Các tường lửa ảo được gắn vào các tài nguyên riêng lẻ (các EC2 instance, các cơ sở dữ liệu RDS, các load balancer, các hàm Lambda trong một VPC). Chúng hoạt động ở cấp độ tài nguyên.

**Network ACL (NACL)**: Các quy tắc tường lửa được gắn vào các subnet. Chúng hoạt động ở ranh giới subnet — trước khi lưu lượng đến bất kỳ tài nguyên nào trong subnet đó.

Hiểu cả hai đòi hỏi hiểu một sự khác biệt then chốt: **stateful so với stateless**.

**Stateful: Security Group**

Một security group là **stateful**.

Khi bạn cho phép lưu lượng đến trên một cổng cụ thể, lưu lượng phản hồi được tự động cho phép đi ra, ngay cả khi không có quy tắc đi rõ ràng cho nó.

Khi bạn cho phép lưu lượng đi đến một đích, phản hồi trở lại được tự động cho phép.

Hãy nghĩ về một bảo vệ stateful ở một tòa nhà văn phòng. Bạn trình thẻ của bạn để vào. Bạn đi ra sau đó. Bảo vệ không cần kiểm tra bạn lại trên đường ra — hệ thống biết bạn đã được cho vào, và bạn được phép rời đi.

**Các Quy Tắc Security Group cho EC2 instance API Nimbus:**

- **Đến — TCP 8080 — từ SG Load Balancer** → Chấp nhận lưu lượng API từ ALB
- **Đến — TCP 22 — từ SG Bastion Host** → SSH chỉ từ bastion
- **Đi — TCP 5432 — đến SG RDS** → Kết nối với PostgreSQL
- **Đi — TCP 6379 — đến SG ElastiCache** → Kết nối với Redis
- **Đi — TCP 443 — đến 0.0.0.0/0** → HTTPS đến các API bên ngoài

Lưu ý: không có quy tắc đi rõ ràng cho cổng 8080. Quy tắc đến là stateful — lưu lượng phản hồi (câu trả lời của API cho load balancer) được tự động cho phép.

Cũng lưu ý: các quy tắc security group tham chiếu *các security group khác*, không phải các địa chỉ IP. "Cho phép đến từ security group của load balancer" nghĩa là "cho phép lưu lượng từ bất kỳ tài nguyên nào có security group này được gắn." Cái này linh hoạt hơn và dễ bảo trì hơn theo dõi các địa chỉ IP.

**Hành vi mặc định:**

- Theo mặc định, tất cả lưu lượng đến bị từ chối
- Theo mặc định, tất cả lưu lượng đi được cho phép
- Tất cả các quy tắc được đánh giá (các security group không có các quy tắc có thứ tự — tất cả các quy tắc khớp đều áp dụng)
- Các security group chỉ có thể **cho phép** lưu lượng — bạn không thể tạo các quy tắc từ chối rõ ràng

**Stateless: NACL**

Một NACL là **stateless**.

Khi bạn cho phép lưu lượng đến trên cổng 8080, điều đó chỉ bao gồm lưu lượng đến. Phản hồi (lưu lượng đi trên các cổng tạm thời) phải được cho phép rõ ràng với một quy tắc đi.

Hãy nghĩ về một máy dò kim loại. Bạn đi qua nó trên đường vào. Máy dò kim loại không biết bạn đã đi qua rồi — bạn phải đi qua lại trên đường ra.

**Các quy tắc NACL được đánh số và đánh giá theo thứ tự.** Quy tắc khớp đầu tiên thắng. Quy tắc 100 được đánh giá trước quy tắc 200. Nếu quy tắc 100 từ chối lưu lượng và quy tắc 200 cho phép nó, lưu lượng bị từ chối.

Các NACL có thể **từ chối** lưu lượng một cách rõ ràng — không giống các security group, vốn chỉ có thể cho phép. Điều này làm chúng hữu ích cho việc chặn các dải IP cụ thể.

**Hành vi NACL mặc định:**

- NACL mặc định (được tạo với VPC của bạn) cho phép tất cả lưu lượng đến và đi
- Một NACL tùy chỉnh từ chối tất cả lưu lượng theo mặc định (bạn phải cho phép rõ ràng những gì bạn muốn)

**NACL cho subnet công khai (đơn giản hóa):**

*Các quy tắc đến (được đánh giá theo thứ tự — khớp đầu tiên thắng):*

- Quy tắc 100: TCP 443, từ 0.0.0.0/0 → **Allow** (HTTPS)
- Quy tắc 110: TCP 80, từ 0.0.0.0/0 → **Allow** (HTTP)
- Quy tắc 120: TCP 1024–65535, từ 0.0.0.0/0 → **Allow** (các cổng trả về tạm thời)
- Quy tắc \*: Tất cả lưu lượng → **Deny**

*Các quy tắc đi:*

- Quy tắc 100: TCP 443, đến 0.0.0.0/0 → **Allow** (HTTPS)
- Quy tắc 110: TCP 80, đến 0.0.0.0/0 → **Allow** (HTTP)
- Quy tắc 120: TCP 1024–65535, đến 0.0.0.0/0 → **Allow** (các cổng trả về tạm thời)
- Quy tắc \*: Tất cả lưu lượng → **Deny**

Quy tắc 120 (các cổng 1024-65535) cho phép các cổng tạm thời — các cổng số cao tạm thời được dùng cho lưu lượng phản hồi TCP. Vì các NACL là stateless, bạn phải cho phép rõ ràng những cái này đi ra, hoặc các phản hồi của máy chủ của bạn sẽ không qua được.

**Khi Nào Dùng Cái Nào**

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Tại sao có hai công cụ riêng biệt — các security group *và* các NACL — nếu các security group đã hoạt động? Mục đích của sự phức tạp thêm là gì?"

Câu trả lời là chúng hoạt động ở các cấp độ khác nhau và có các khả năng khác nhau. Các security group bảo vệ các tài nguyên riêng lẻ và chỉ có thể cho phép lưu lượng. Các NACL bảo vệ cả các subnet và có thể từ chối rõ ràng. Có cả hai nghĩa là bạn có thể áp dụng các quy tắc cho phép chi tiết ở cấp độ tài nguyên và các quy tắc từ chối rộng ở cấp độ subnet — mà không cái nào can thiệp vào cái kia.

Dùng **các security group** cho lớp kiểm soát truy cập chính. Chúng dễ quản lý hơn, stateful (ít khả năng chặn do tai nạn từ việc quên các cổng tạm thời), và hỗ trợ tham chiếu các security group khác.

Dùng **các NACL** cho các kiểm soát cấp độ subnet, đặc biệt:

- **Các quy tắc từ chối rõ ràng**: Chặn một địa chỉ IP hoặc dải cụ thể không tiếp cận cả một subnet
- **Chặn khẩn cấp**: Một IP đang tích cực tấn công — thêm một quy tắc từ chối NACL để chặn cả subnet trước khi nó đến bất kỳ tài nguyên nào

Bạn có thể đang tự hỏi: nếu các security group là stateful và chặn tất cả lưu lượng đến theo mặc định, khi nào bạn thực sự cần các NACL? Các security group xử lý hầu hết các trường hợp tốt. Nhưng có một điều chúng không thể làm: từ chối rõ ràng. Một security group chỉ có thể cho phép lưu lượng — nếu một quy tắc không khớp, lưu lượng bị từ chối theo mặc định. Bạn không thể thêm một quy tắc nói "chặn IP cụ thể này." Cho điều đó, bạn cần một NACL: một quy tắc từ chối được đánh số dừng một dải địa chỉ cụ thể trước khi nó đến bất kỳ tài nguyên nào trong subnet. Các NACL hữu ích nhất cho phản ứng khẩn cấp (chặn một kẻ tấn công đang hoạt động) và cho việc thực thi các ranh giới cấp độ subnet không nên phụ thuộc vào cấu hình tài nguyên riêng lẻ.

"Vậy security group là kiểm soát chi tiết," Maya nói, "và NACL là nét vẽ rộng?"

"Các security group bảo vệ các tài nguyên riêng lẻ," Priya xác nhận. "Các NACL bảo vệ cả các subnet. Khi bạn muốn chặn một IP không tiếp cận bất cứ thứ gì trong mạng của bạn, NACL. Khi bạn muốn chỉ cho phép load balancer tiếp cận máy chủ API, security group."

"Chúng ta đã nghĩ về điều gì xảy ra nếu kẻ tấn công quay lại với một IP khác chưa?" Priya nói. "NACL chặn một dải. Chúng chuyển sang một cái khác."

"Đó là mục đích của GuardDuty," Leo nói. "Phát hiện hành vi. Nếu cùng một script chạy từ một IP mới, mẫu lưu lượng trông giống nhau."

"Chúng ta sẽ đến đó," Priya nói. "Việc đầu tiên trước."

"Tất cả cái này tốn bao nhiêu mỗi tháng?" Tom hỏi.

Các security group và các NACL bản thân chúng miễn phí. AWS không tính phí cho số lượng security group, số lượng quy tắc, hoặc số lượng các mục NACL. Sự cân nhắc chi phí là gián tiếp: các quy tắc security group đi chặt chẽ hơn có thể định tuyến ít lưu lượng hơn qua NAT Gateway, giảm các phí xử lý dữ liệu.

"Vậy các kiểm soát bảo mật miễn phí," Rafael nói. "Chi phí là hạ tầng hỗ trợ chúng."

"Đúng. Các NAT Gateway cho tính sẵn sàng cao. Các Interface VPC Endpoint cho các dịch vụ mà nếu không sẽ đi qua NAT. Những cái đó có chi phí. Bản thân các quy tắc security group thì không."

**Ghép Lại Với Nhau: Phòng Thủ Phân Lớp**

Sau sự cố, Priya vẽ các lớp phòng thủ Nimbus lên bảng trắng:

```
Internet
  ↓
CloudFront + Shield (hấp thụ DDoS)
  ↓
WAF (lọc cấp độ ứng dụng)
  ↓
Internet Gateway
  ↓
NACL trên subnet công khai (các quy tắc cấp độ subnet, chặn khẩn cấp)
  ↓
Security Group ALB (HTTPS từ bất kỳ đâu)
  ↓
NACL trên subnet app riêng tư
  ↓
Security Group API EC2 (cổng 8080 chỉ từ SG ALB)
  ↓
NACL trên subnet dữ liệu riêng tư
  ↓
Security Group RDS (cổng 5432 chỉ từ SG API)
```

"Mỗi lớp giả định lớp trước có thể thất bại," cô nói. "Cơ sở dữ liệu không tin rằng lớp mạng đã dừng kẻ tấn công. EC2 instance không tin rằng ALB đã dừng kẻ tấn công. Mỗi lớp thực thi các quy tắc riêng của nó một cách độc lập."

"Phòng thủ theo chiều sâu," Maya nói.

"Phòng thủ theo chiều sâu. Một kẻ tấn công vượt qua một lớp vẫn đối mặt với lớp tiếp theo. Không cấu hình sai đơn lẻ nào là thảm họa. Nó nghĩa là một lớp thất bại, và những cái khác giữ vững."

Leo nhìn sơ đồ. Kẻ tấn công đã xâm phạm một EC2 instance. Chúng đã vượt qua lớp thông tin xác thực. Nhưng mọi lớp tiếp theo đã giữ vững.

Đó là phòng thủ theo chiều sâu trông như thế nào trong thực tế.

**Sự Cố: Những Gì Các Lớp Bắt Được**

Quay lại cuộc tấn công IP Romania:

**Điều gì đã xảy ra**: Kẻ tấn công dùng key deploy bị xâm phạm để tải lên một script quét lên một EC2 instance. Script cố gắng kết nối với các dịch vụ khác.

**Điều gì đã dừng chúng**:

- Security group RDS chỉ cho phép đến trên cổng 5432 từ security group EC2 API. Script không thể tiếp cận cơ sở dữ liệu từ một công cụ quét — nó không gắn security group đúng.
- Security group ElastiCache chỉ cho phép đến trên cổng 6379 từ security group EC2 API.
- Các EC2 instance khác chỉ cho phép SSH từ security group bastion host.

**Điều gì không dừng chúng**:

- Các quy tắc đi của EC2 instance cho phép HTTPS đến 0.0.0.0/0 (cần thiết cho việc tải xuống gói). Script dùng cái này để thực hiện các kết nối đi đến máy chủ của kẻ tấn công.

Sau sự cố, Priya thêm:

- Một quy tắc NACL chặn dải IP Romania
- Một quy tắc đi hạn chế hơn trên các EC2 instance (chỉ cho phép các đích biết-tốt cụ thể)
- Một kiểm tra rằng **IMDSv2 được thực thi** (`HttpTokens=required`) trên mọi instance — script đã chạy *trên* instance, điều đó nghĩa là nó có thể đã truy vấn dịch vụ metadata để lấy các thông tin xác thực tạm thời của role instance. IMDSv2 đã được bật từ Chương 4; Priya xác minh nó vẫn được yêu cầu ở mọi nơi, vì một kẻ tấn công với thực thi mã cộng IMDSv1 bằng các thông tin xác thực AWS bị đánh cắp.

---

**Đọc Các Flow Log: Những Gì Priya Đã Thấy**

Cuộc điều tra bắt đầu với các VPC flow log. Priya mở CloudWatch Logs Insights và chạy một truy vấn đối với nhóm flow log cho 48 giờ qua:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` là EC2 instance bị xâm phạm. Bộ lọc REJECT hiển thị các nỗ lực kết nối đã bị chặn.

Kết quả:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # EC2 instance khác — SSH bị chặn
10.0.10.7 → 10.0.10.9  port 22    REJECT   # EC2 khác — SSH bị chặn
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — bị chặn bởi security group
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # RDS replica — bị chặn
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — bị chặn
```

Cuộc quét đã chạm vào mọi dịch vụ nội bộ. Mọi nỗ lực đã bị từ chối. Thiết kế security group đã giữ vững.

Nhưng cũng có một mục ACCEPT đi:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

Đó là nỗ lực lấy cắp dữ liệu — 2,8 kilobyte được gửi đến IP Romania qua HTTPS. Security group cho phép HTTPS đi cho việc tải xuống gói hợp pháp. Kẻ tấn công đã dùng quy tắc đó.

"Các security group đã dừng sự di chuyển ngang," Priya nói, dẫn đội ngũ qua các log. "Nhưng quy tắc đi quá dễ dãi. Chúng ta đã cho phép HTTPS đến bất kỳ đích nào. Chúng ta nên cho phép HTTPS chỉ đến các endpoint AWS biết — CloudWatch, Secrets Manager, S3 — và đến các CDN kho gói."

Cô cho thấy các quy tắc đi security group đã cập nhật:

```
TCP 443 → pl-63a5400a (prefix list gateway endpoint AWS S3)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (các kho gói AWS — thu hẹp theo thời gian)
```

"Cái đó loại bỏ quy tắc HTTPS đi chung. HTTPS đi giờ chỉ đến các đích biết-tốt."

"Còn các hàm Lambda gọi các API bên thứ ba thì sao?" Leo hỏi.

"Những cái đó đi qua NAT Gateway, vốn có quy tắc đi riêng dành riêng của nó," Priya nói. "Lambda không dùng security group EC2. Giao diện mạng khác, bộ quy tắc khác."

---

**Câu Chuyện Debug Stateless**

Hai tuần sau sự cố, Rafael — vẫn trong tháng đầu tiên của anh — đang giúp thiết lập một đường ống dữ liệu mới. Nó liên quan đến một hàm Lambda trong một VPC cần gọi một API nội bộ chạy trên EC2.

Hàm Lambda hết thời gian. Mọi lần gọi hết thời gian.

Rafael kiểm tra các security group. Security group Lambda có một quy tắc đi cho TCP 8080 đến security group EC2. Security group EC2 có một quy tắc đến cho TCP 8080 từ security group Lambda. Các quy tắc trông đúng.

Anh quay sang Leo. "Các security group trông ổn. Tại sao nó hết thời gian?"

Leo nhìn cấu hình subnet. Hàm Lambda ở trong một subnet riêng tư. Subnet có một NACL tùy chỉnh mà Priya đã áp dụng trong quá trình củng cố bảo mật.

Anh nhìn các quy tắc đi NACL:

```
Quy tắc 100: TCP 443  → 0.0.0.0/0  ALLOW
Quy tắc 110: TCP 5432 → 10.0.20.0/24 ALLOW
Quy tắc *:   Tất cả   → 0.0.0.0/0  DENY
```

"NACL cho phép HTTPS đi và PostgreSQL đi," Leo nói. "Nó không cho phép TCP 8080 đi."

"Security group cho phép nó," Rafael nói.

"NACL thì không. Và NACL là stateless. Ngay cả khi security group của hàm Lambda cho phép kết nối đi, NACL ở ranh giới subnet vẫn đánh giá lưu lượng đi. NACL đang chặn lần gọi của Lambda trước khi nó rời subnet."

"Nhưng nếu tôi thêm ALLOW cho TCP 8080 đi vào NACL—"

"Bạn cũng cần thêm ALLOW cho các cổng tạm thời đến," Leo nói. "Phản hồi từ EC2 instance trở lại trên một cổng ngẫu nhiên giữa 1024 và 65535. Nếu các quy tắc đến của NACL không cho phép những cái đó, phản hồi bị chặn trên chuyến trở về."

Rafael cập nhật NACL:

```
Quy tắc 100:  TCP 443       → 0.0.0.0/0      ALLOW  (đi)
Quy tắc 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (đi đến subnet EC2)
Quy tắc 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (đi đến subnet DB)
Quy tắc *:    Tất cả        → 0.0.0.0/0      DENY
```

Và ở phía đến:

```
Quy tắc 100:  TCP 1024-65535 từ 10.0.10.0/24  ALLOW  (lưu lượng trả về từ EC2)
Quy tắc *:    Tất cả                           DENY
```

Hàm Lambda kết nối ngay lập tức.

"Đây là lý do mọi người ghét các NACL," Rafael nói.

"Đây là lý do bạn cần hiểu chúng," Priya nói. "Các lỗi chúng tạo ra chính xác là các lỗi chúng được thiết kế để ngăn — các luồng lưu lượng bất ngờ. Hiểu mô hình stateless cho bạn biết chính xác nơi để nhìn khi một kết nối thất bại một cách bí ẩn."

"Security group stateful — lưu lượng trả về tự động. NACL stateless — lưu lượng trả về cần các quy tắc rõ ràng," Rafael lặp lại.

"Hãy nói nó cho đến khi nó là một phần của cách bạn nghĩ," Priya nói.

---

**Chặn Khẩn Cấp NACL: Quy Tắc /24**

Sau khi xác định dải IP nguồn của kẻ tấn công, phản ứng của Priya là tức thời: thêm một quy tắc từ chối NACL.

Nhưng cô không chỉ chặn IP duy nhất. Cô chặn cả `/24` — subnet 256-địa chỉ mà kẻ tấn công đang hoạt động từ đó.

"Tại sao cả /24?" Leo hỏi.

"Vì chặn IP riêng lẻ là một trò chơi thua. Các kẻ tấn công dùng nhiều IP trong một dải, xoay vòng qua chúng khi một cái bị chặn. Chặn /24 làm nó khó hơn — chúng sẽ cần chuyển sang một khối địa chỉ khác, vốn tốn của chúng thời gian và công sức."

Quy tắc NACL:

```
Quy tắc 90:  TẤT CẢ từ 185.220.101.0/24 → DENY
```

Quy tắc 90 được đánh giá trước bất kỳ quy tắc cho phép nào (vốn bắt đầu ở quy tắc 100). Cả dải bị chặn trước khi bất kỳ quy tắc cho phép nào được cân nhắc.

"Và cái này áp dụng cho mọi tài nguyên trong subnet?" Leo hỏi.

"Mọi tài nguyên. Đó là mục đích của một NACL — nó áp dụng trước khi lưu lượng đến security group của bất kỳ tài nguyên riêng lẻ nào. Một từ chối NACL ở quy tắc 90 nghĩa là gói không bao giờ đến việc đánh giá security group."

"Chúng ta có thể làm điều này với một security group thay vào đó không?"

"Không. Các security group chỉ có thể cho phép lưu lượng. Không có quy tắc từ chối. Nếu bạn muốn chặn một IP cụ thể không tiếp cận bất kỳ tài nguyên nào trong một subnet, NACL là lựa chọn duy nhất."

Đây là trường hợp sử dụng chính cho các quy tắc từ chối NACL: phản ứng khẩn cấp với các cuộc tấn công đang hoạt động. Security group là cơ chế kiểm soát chính. NACL là phanh khẩn cấp.

---

**Mẫu Thiết Kế Security Group: Tham Chiếu Theo ID**

"Chúng ta đã nghĩ về điều gì xảy ra khi các EC2 instance của chúng ta bị thay thế chưa?" Priya hỏi. "Auto Scaling chấm dứt các instance cũ và khởi chạy các cái mới. Các instance mới nhận các địa chỉ IP riêng tư mới."

"Nếu các quy tắc security group tham chiếu các địa chỉ IP," Leo nói chậm rãi, "chúng ta sẽ phải cập nhật các quy tắc mỗi lần một instance bị thay thế."

"Chính xác. Đó là lý do bạn không tham chiếu các địa chỉ IP trong các quy tắc security group cho lưu lượng trong-VPC."

Các security group có thể tham chiếu các security group khác thay vì các địa chỉ IP. Khi một quy tắc nói "cho phép đến từ security group của load balancer," nó nghĩa là "cho phép lưu lượng từ bất kỳ tài nguyên nào có security group của load balancer được gắn." Auto Scaling có thể khởi chạy một nghìn instance mới với một IP mới mỗi cái, và quy tắc vẫn hợp lệ.

Cấu trúc security group Nimbus:

```
nimbus-alb-sg (Load Balancer)
  - Đến: TCP 443 từ 0.0.0.0/0
  - Đến: TCP 80 từ 0.0.0.0/0

nimbus-api-sg (các EC2 instance API)
  - Đến: TCP 8080 từ nimbus-alb-sg
  - Đến: TCP 22 từ nimbus-bastion-sg
  - Đi: TCP 5432 đến nimbus-rds-sg
  - Đi: TCP 6379 đến nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Đến: TCP 5432 từ nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Đến: TCP 6379 từ nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Đến: TCP 22 từ <IP VPN văn phòng>
```

Không có địa chỉ IP cho lưu lượng nội bộ. Chỉ các ID security group. Khi một instance bị thay thế, thành viên security group chuyển tự động sang instance mới.

"Và cho các microservice chúng ta đang lập kế hoạch?" Rafael hỏi. "Chúng ta sẽ có một tá dịch vụ cuối cùng. Mỗi cái cần nói chuyện với một số cái khác, nhưng không phải tất cả những cái khác."

"Mỗi dịch vụ nhận security group riêng của nó," Priya nói. "Security group của Dịch vụ A được tham chiếu trong các quy tắc đến của mọi dịch vụ mà Dịch vụ A được phép gọi. Các dịch vụ không nên giao tiếp đơn giản không tham chiếu các security group của nhau."

Đây là **mẫu security group hub-and-spoke** cho các microservice. Một security group cơ sở dữ liệu chia sẻ có các quy tắc đến từ năm security group dịch vụ khác nhau. Nếu một dịch vụ thứ sáu cần quyền truy cập cơ sở dữ liệu, bạn thêm security group của nó vào quy tắc đến của cơ sở dữ liệu. Nếu quyền truy cập nên được loại bỏ, bạn loại bỏ tham chiếu. Không quản lý IP. Không quy tắc cũ trỏ đến các máy chủ đã ngừng hoạt động.

"Security group là danh tính," Priya nói. "Địa chỉ IP là một tai nạn của lập lịch."

---

**Tường Lửa Đặc Quyền Tối Thiểu: Kỷ Luật**

"Chúng ta đã nghĩ về thế trận đúng cho các quy tắc đi là gì chưa?" Priya hỏi trong cuộc đánh giá sau sự cố.

Hầu hết các đội ngũ để các quy tắc đi security group EC2 ở mặc định: cho phép tất cả đi. Cái này tiện lợi — ứng dụng có thể gọi bất cứ thứ gì — nhưng nó không phải là đặc quyền tối thiểu.

Nguyên tắc của Priya: các quy tắc đi nên cụ thể như các quy tắc đến.

Các quy tắc đi security group API Nimbus, sau khi củng cố:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL đến RDS)
TCP 6379 → nimbus-redis-sg     (Redis đến ElastiCache)
TCP 443  → prefix list s3.amazonaws.com    (gateway endpoint S3)
TCP 443  → endpoint secretsmanager         (Secrets Manager)
TCP 443  → endpoint logs                   (CloudWatch Logs)
```

Không "cho phép tất cả đi." Mọi đích được nêu tên.

"Đây là rất nhiều bảo trì," Leo nói.

"Nó là nhiều bảo trì hơn cho-phép-tất-cả," Priya thừa nhận. "Nó là ít dọn dẹp hơn một vụ rò rỉ dữ liệu. Kẻ tấn công xâm phạm EC2 instance có thể đã lấy cắp nhiều dữ liệu hơn nếu các quy tắc đi mở. Chúng dùng quy tắc HTTPS-đến-bất-kỳ-đâu vì nó ở đó."

"Và với các quy tắc đi cụ thể, ngay cả một instance bị xâm phạm cũng chỉ có thể gửi dữ liệu đến các đích được phê duyệt."

"Chính xác. Security group trở thành tuyến chứa cuối cùng, không chỉ tuyến phòng thủ đầu tiên."

---

## Điểm Mạnh và Hạn Chế

**Các Security Group**:

- Stateful (không đau đầu cổng tạm thời)
- Có thể tham chiếu các security group khác (linh hoạt hơn các IP)
- Chỉ các quy tắc cho phép — không từ chối rõ ràng
- Hoạt động ở cấp độ tài nguyên — chi tiết
- Các quy tắc áp dụng ngay lập tức — không thứ tự, không ưu tiên
- Nhiều security group có thể được gắn vào một tài nguyên — các quy tắc từ tất cả được kết hợp

**Các NACL**:

- Stateless (đòi hỏi các quy tắc rõ ràng cho cả hai hướng kể cả các cổng tạm thời)
- Có thể từ chối rõ ràng — hữu ích cho việc chặn các IP biết-xấu
- Hoạt động ở cấp độ subnet — nét rộng hơn
- Các quy tắc được đánh số đánh giá theo thứ tự — có thể đoán trước nhưng đòi hỏi quản lý cẩn thận
- Áp dụng trước khi lưu lượng đến bất kỳ tài nguyên nào trong subnet — tuyến phòng thủ đầu tiên
- Hiệu quả cho việc chặn IP khẩn cấp trên cả một subnet

**Nơi mỗi công cụ phù hợp**:

Dùng các security group cho mọi thứ theo mặc định. Thêm các NACL khi bạn cần các quy tắc từ chối rõ ràng — chặn một dải IP, chặn một cổng ở cấp độ subnet bất kể cấu hình tài nguyên riêng lẻ, hoặc thực thi rằng một subnet dữ liệu không bao giờ có thể nhận lưu lượng từ một nguồn cụ thể. Các NACL không phải là một sự thay thế cho các security group; chúng là một sự bổ sung cho các tình huống nơi thiết kế chỉ-cho-phép của các security group không đủ.

## Tóm Tắt

Sự cố IP Romania đã được chứa bởi các kiểm soát bảo mật đã có sẵn — không phải do may mắn, mà do thiết kế. Các security group đã ngăn sự di chuyển ngang trong VPC. Sau sự cố, các NACL thêm khả năng chặn rõ ràng dải IP của kẻ tấn công ở ranh giới subnet. Các VPC flow log làm cho cuộc tấn công nhìn thấy được. Hai công cụ, hai lớp, hai công việc khác nhau — với việc ghi log để chứng minh điều gì đã xảy ra.

- **Các Security Group** là các tường lửa ảo stateful cho các tài nguyên riêng lẻ. Chỉ các quy tắc cho phép. Tất cả các quy tắc được đánh giá đồng thời.
- **Các NACL** là các tường lửa stateless cho cả các subnet. Các quy tắc cho phép và từ chối. Các quy tắc được đánh giá theo thứ tự số — khớp đầu tiên thắng.
- **Stateful** nghĩa là lưu lượng phản hồi được tự động cho phép. **Stateless** nghĩa là bạn phải cho phép lưu lượng rõ ràng theo cả hai hướng, kể cả các cổng trả về tạm thời.
- Các security group là lớp kiểm soát truy cập chính của bạn. Các NACL là sự ghi đè cấp độ subnet — đặc biệt cho chặn khẩn cấp.
- Khi một NACL cho phép lưu lượng đến, bạn cũng phải cho phép các cổng tạm thời đi (1024-65535) để phản hồi TCP qua được.
- **Tham chiếu các security group theo ID**, không phải địa chỉ IP, cho lưu lượng trong-VPC. Auto Scaling thay thế các instance; thành viên security group chuyển tự động.
- **Các quy tắc đi cụ thể** trên các EC2 instance giới hạn những gì một instance bị xâm phạm có thể làm — tường lửa đặc quyền tối thiểu.
- Dùng các flow log để thấy các security group và các NACL thực sự đang làm gì. Các quy tắc là lý thuyết. Các log là bằng chứng.

## Mẹo Thi

*SAA-C03 Domain: Thiết kế kiến trúc an toàn (Domain 1, Task 1.2)*

- **Stateful so với stateless**: Sự phân biệt này là khái niệm được kiểm tra nhiều nhất trong chương này. Các security group = stateful = phản hồi được cho phép tự động. Các NACL = stateless = phải cho phép rõ ràng lưu lượng phản hồi.
- **Các quy tắc security group**: Không từ chối rõ ràng. Khi nhiều security group được gắn vào một instance, hợp của tất cả các quy tắc áp dụng. Tất cả các quy tắc khớp được đánh giá đồng thời.
- **Thứ tự quy tắc NACL**: Các quy tắc được đánh giá từ số thấp nhất đến cao nhất. Quy tắc 100 trước 200. Khớp đầu tiên thắng. Quy tắc `*` (dấu hoa thị) ở dưới cùng là từ chối ngầm. Thêm một quy tắc từ chối ở quy tắc 90 chặn trước bất kỳ quy tắc cho phép nào ở 100.
- **Các cổng tạm thời**: Lỗi NACL cổ điển là quên cho phép đi trên các cổng 1024-65535. Nếu NACL của bạn cho phép HTTP đến (cổng 80) nhưng không cho phép các cổng tạm thời đi, người dùng có thể gửi các yêu cầu nhưng không bao giờ nhận các phản hồi. Đây là kịch bản thi NACL phổ biến nhất.
- **Tham chiếu security group**: Bạn có thể cho phép lưu lượng từ một security group khác (không chỉ một IP). Đây là mẫu được khuyến nghị cho lưu lượng trong-VPC. Kỳ thi thường dùng "cho phép đến từ security group ALB" làm câu trả lời đúng cho việc hạn chế quyền truy cập EC2.
- **NACL mặc định so với NACL tùy chỉnh**: NACL mặc định cho phép tất cả lưu lượng. Một NACL tùy chỉnh (cái bạn tạo) từ chối tất cả lưu lượng theo mặc định. Kịch bản thi: "đã tạo một NACL mới và giờ lưu lượng bị chặn" → kiểm tra các quy tắc cho phép bị thiếu.
- **Chặn IP của một kẻ tấn công**: Các security group không thể chặn các IP cụ thể (chỉ cho phép). Các NACL có thể từ chối rõ ràng một IP hoặc CIDR cụ thể. Kịch bản thi: "chặn một IP cụ thể không tiếp cận bất kỳ tài nguyên nào trong subnet" → quy tắc từ chối NACL.
- **Debug các thất bại kết nối**: Kiểm tra thứ tự: security group trên nguồn (đi) → security group trên đích (đến) → NACL trên subnet nguồn (đi + các cổng tạm thời) → NACL trên subnet đích (đến). Hầu hết các thất bại kết nối trong kỳ thi do một quy tắc đi NACL bị thiếu hoặc sự cho phép cổng tạm thời bị thiếu.
- **Nhiều subnet và các NACL**: Một NACL áp dụng cho tất cả các subnet được liên kết với nó. Một subnet chỉ có thể được liên kết với một NACL. Kỳ thi có thể hỏi NACL nào để cập nhật khi lưu lượng của một subnet cụ thể bị ảnh hưởng.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Một lập trình viên thêm một quy tắc đến vào một security group cho phép lưu lượng trên cổng 443. Cô có cần thêm một quy tắc đi để cho phép phản hồi của máy chủ không? Tại sao có hoặc tại sao không?

Nếu thay vào đó cô thêm một quy tắc đến vào một NACL cho phép lưu lượng trên cổng 443, cô có cần thêm một quy tắc đi không? Tại sao có hoặc tại sao không?

**Gợi ý**: Hãy nghĩ lại các phép tương tự của chương — mỗi cái là bảo vệ nhớ đã cho bạn vào, hay máy dò kim loại bạn phải đi qua lại trên đường ra?

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một công ty có một ứng dụng web chạy trên các EC2 instance trong một subnet công khai. Ứng dụng chấp nhận lưu lượng HTTPS (cổng 443) từ internet. Người dùng đang báo cáo rằng họ có thể kết nối với ứng dụng nhưng không thể nhận các phản hồi — các yêu cầu treo và hết thời gian.

Security group EC2 có một quy tắc đến cho phép TCP 443 từ 0.0.0.0/0. NACL của subnet có một quy tắc đến (quy tắc 100) cho phép TCP 443 từ 0.0.0.0/0 và một quy tắc đi (quy tắc 100) cho phép TCP 443 đến 0.0.0.0/0.

Nguyên nhân CÓ KHẢ NĂNG NHẤT của vấn đề là gì?

A) Security group thiếu một quy tắc đi cho TCP 443  
B) Các EC2 instance không có các địa chỉ Elastic IP  
C) Security group thiếu một quy tắc đến cho các cổng tạm thời  
D) NACL thiếu một quy tắc đi cho phép các cổng tạm thời (1024-65535)

**Gợi ý 1**: Các security group là stateful — chúng tự động cho phép các phản hồi. Các NACL là stateless — chúng không.

**Gợi ý 2**: Khi một trình duyệt kết nối với một máy chủ web trên cổng 443, phản hồi của máy chủ đi trở lại trên một cổng tạm thời ngẫu nhiên (1024-65535), không phải cổng 443.

**Gợi ý 3**: NACL có một quy tắc đi cho 443, nhưng phản hồi không đi đến cổng 443.

**Đáp án**: D

**Giải thích**: NACL là stateless. Khi người dùng kết nối với máy chủ trên cổng 443, phản hồi TCP của máy chủ đi trở lại trên một cổng tạm thời (được chọn ngẫu nhiên từ 1024-65535). Quy tắc đi NACL chỉ cho phép cổng 443, vậy phản hồi bị chặn bởi quy tắc từ chối mặc định. Thêm một quy tắc đi NACL cho phép TCP 1024-65535 sẽ khắc phục điều này.

**Tại sao không phải A?** Các security group là stateful — lưu lượng phản hồi được tự động cho phép bất kể các quy tắc đi. Không cần quy tắc đi security group.

**Tại sao không phải B?** Các Elastic IP ảnh hưởng đến liệu các instance có các IP công khai hay không, không phải liệu các kết nối đã thiết lập có thể nhận các phản hồi.

**Tại sao không phải C?** Các cổng tạm thời là cho lưu lượng phản hồi đi, không phải đến. Kết nối đến từ người dùng đến trên cổng 443, vốn đã được cho phép.

*SAA-C03 Domain: Thiết kế kiến trúc an toàn — Task 1.2*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Sau cuộc tấn công IP Romania, Priya muốn triển khai hai kiểm soát bổ sung:

1. Chặn cả dải IP 185.0.0.0/8 không tiếp cận bất kỳ tài nguyên nào trong subnet công khai
2. Đảm bảo rằng subnet riêng tư chứa cơ sở dữ liệu không bao giờ có thể giao tiếp với internet, ngay cả khi ai đó cấu hình sai một security group

Các công cụ nào bạn sẽ dùng cho mỗi yêu cầu, và bạn sẽ cấu hình chúng như thế nào? Bạn có thể dùng các security group cho cả hai không? Bạn có thể dùng các NACL cho cả hai không?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là hiểu công cụ nào phù hợp với vấn đề nào.)*

## Cảnh Sau Tín Dụng

Sự cố đã được chứa. Key deploy bị xâm phạm đã bị vô hiệu hóa. Dải IP Romania đã bị chặn tại NACL. Script cũ đã được loại bỏ khỏi EC2 instance.

Priya viết một báo cáo sự cố. Cô chia sẻ nó với đội ngũ.

Dòng cuối cùng của báo cáo: "Nguyên nhân gốc: một thông tin xác thực đang hoạt động từ một pipeline triển khai đã ngừng hoạt động không bao giờ được xoay vòng hoặc thu hồi. Khuyến nghị: xoay vòng thông tin xác thực tự động và kiểm toán định kỳ tất cả các thông tin xác thực IAM."

Leo đọc nó ba lần.

"Tôi nên đã xoay vòng key đó," anh nói.

"Đúng," Priya nói.

"Làm sao chúng ta đảm bảo điều này không xảy ra lại?"

"Tự động hóa," cô nói. "Và một thứ gì đó canh chừng những người canh chừng."

Chương tiếp theo: lockbox nơi Nimbus giữ các bí mật của mình — và việc xoay vòng làm cho các key bị đánh cắp trở nên vô dụng.
