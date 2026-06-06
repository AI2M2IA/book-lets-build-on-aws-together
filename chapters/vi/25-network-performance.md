# Chương 25: Con Đường Cao Tốc Riêng Tư

Đứng dậy một chút. Vẩy tay ra.

Cảm nhận khoảng cách giữa đầu ngón tay của bạn và một thứ gì đó ở phía bên kia của đất nước. Hãy tưởng tượng việc gửi đi một thông điệp phải đi qua khoảng cách đó, tìm đường qua hàng chục lần chuyển giao giữa các nhà mạng, và quay trở lại trước khi bạn có thể tiếp tục làm việc. Giờ hãy tưởng tượng làm điều đó hàng nghìn lần mỗi giây.

Đó chính là việc truyền dữ liệu thực sự — khoảng cách vật lý, cơ sở hạ tầng vật lý, các ràng buộc vật lý.

Chúng ta sẽ nói về việc di chuyển dữ liệu. Không phải giữa các dịch vụ trong AWS, mà giữa thế giới thực và AWS — giữa văn phòng của bạn và cơ sở hạ tầng cloud của bạn, giữa các lục địa.

---

Với cơ sở dữ liệu đã được mở rộng và chi phí lưu trữ đã giảm, Tom chuyển sang hóa đơn mạng. Nhưng Leo có một vấn đề cấp bách hơn — việc di chuyển 4 terabyte dữ liệu đơn hàng lịch sử lên AWS đang phơi bày các giới hạn của kết nối hiện tại của họ.

---

Nhóm cơ sở hạ tầng của Nimbus (nay là bốn kỹ sư) làm việc từ một văn phòng chung ở Seattle. Họ cần truy cập vào cơ sở hạ tầng AWS mà họ quản lý. Một số thao tác cần kết nối tới các tài nguyên trong VPC.

Hiện tại, họ dùng VPN trên laptop để truy cập bastion host trong public subnet, sau đó SSH tới các tài nguyên từ đó.

Nó hoạt động. Nó chậm. Kết nối VPN định tuyến qua internet công cộng: Seattle → nhiều chặng nhà mạng → us-west-2. Các vòng khứ hồi không nhất quán — 30 đến 80 mili-giây tùy theo giờ — và thông lượng bị giới hạn bởi đường lên (uplink) của văn phòng và đường dẫn công cộng.

"Đối với SSH hằng ngày, điều đó chấp nhận được," Leo nói. "Nhưng chúng ta sắp bắt đầu di chuyển cơ sở dữ liệu analytics. 4 terabyte dữ liệu đơn hàng lịch sử. Qua kết nối này, quá trình di chuyển sẽ mất vài tuần."

"Chúng ta cần một kết nối tốt hơn," Maya nói.

"Một kết nối riêng tư," Priya thêm vào. "Không qua internet công cộng. Và sẽ thế nào nếu ai đó cố đột nhập trong quá trình truyền dữ liệu? 4TB lịch sử đơn hàng qua internet công cộng — kể cả được mã hóa — vẫn cảm thấy như một mục tiêu."

Hãy nghĩ về nó như việc đi làm. Một Site-to-Site VPN giống như lái xe trên đường công cộng: bạn khóa cửa xe (mã hóa), nhưng bạn vẫn chia sẻ làn đường với mọi người khác, và kẹt xe làm bạn chậm lại một cách không thể đoán trước. Direct Connect giống như thuê một làn đường riêng dành riêng trên xa lộ — không có lưu lượng chia sẻ, tốc độ nhất quán, và một khoản phí cầu đường hàng tháng cao hơn. Hầu hết các ngày, đường công cộng là ổn. Khi bạn đang chuyển một xe tải đầy hàng hóa giá trị theo một lịch trình chặt chẽ, bạn trả tiền cho làn đường riêng.

Snow Family là lựa chọn mà hầu hết mọi người không nghĩ đến: thuê hẳn một chuyến bay chở hàng thật sự. Nó không phải lúc nào cũng có sẵn. Nó không phù hợp cho các lô nhỏ. Nhưng với một xe tải đầy, nó đến nhanh hơn lái xe và không phụ thuộc chút nào vào điều kiện đường xá. Vật lý không hề thay đổi — bạn vẫn đang di chuyển cùng những bit dữ liệu đó — nhưng cơ chế thì khác biệt về căn bản.

**AWS Site-to-Site VPN: Lựa Chọn Nhanh**

**AWS Site-to-Site VPN** tạo ra một đường hầm được mã hóa giữa mạng on-premises của bạn và VPC của bạn, đi qua internet công cộng.

Thiết lập:

1. Tạo một Virtual Private Gateway (VGW) gắn vào VPC của bạn
2. Tạo một Customer Gateway đại diện cho bộ định tuyến on-premises của bạn
3. Thiết lập hai đường hầm VPN (để dự phòng) giữa chúng

Lưu lượng được mã hóa (AES-256). Nó đi qua internet công cộng, có nghĩa là độ trễ phụ thuộc vào điều kiện internet. AWS tự động cung cấp hai đường hầm để dự phòng — nếu một đường hầm gặp vấn đề, lưu lượng chuyển sang đường hầm kia.

**Khi nào dùng Site-to-Site VPN**:

- Thiết lập nhanh (phút đến giờ)
- Tiết kiệm chi phí ($0.05/giờ mỗi kết nối VPN)
- Băng thông: tối đa 1.25 Gbps mỗi đường hầm
- Độ trễ internet chấp nhận được cho trường hợp sử dụng

**Accelerated Site-to-Site VPN** định tuyến lưu lượng VPN qua mạng toàn cầu của AWS thay vì internet công cộng — cùng cách tối ưu hóa mà Global Accelerator cung cấp, áp dụng cho các đường hầm VPN. Độ trễ thấp hơn và nhất quán hơn so với VPN tiêu chuẩn. Chi phí cao hơn một chút (các khoản phí chuyển dữ liệu Global Accelerator áp dụng). Đối với các nhóm muốn sự thiết lập nhanh và chi phí thấp của VPN nhưng cần độ trễ tốt hơn, Accelerated VPN là con đường trung gian thiết thực giữa VPN tiêu chuẩn và Direct Connect.

Đối với quá trình di chuyển 4TB của Nimbus, VPN dựa trên internet ở tốc độ tối đa 1.25 Gbps sẽ mất: 4TB / 1.25 Gbps ≈ 7 giờ tối thiểu, với chi phí phụ trội thực tế gần hơn với 12-20 giờ. Chấp nhận được, nhưng tắc nghẽn trên đường dẫn internet công cộng khiến nó không thể đoán trước.

Leo tính toán cẩn thận hơn, vì tính toán lý thuyết và thời gian truyền thực tế chưa từng một lần nào khớp nhau trong kinh nghiệm của anh.

**Lý thuyết**: 4 TB = 4,096 GB = 32,768 Gb. Ở mức 1 Gbps: 32,768 giây ≈ 9.1 giờ. Làm tròn thành 9 giờ.

**Thực tế**: Leo đã chạy một lần truyền thử nghiệm tuần trước — 50 GB từ văn phòng Seattle lên S3. Thời gian lý thuyết ở tốc độ tải lên đo được của họ (875 Mbps): 457 giây. Thời gian thực tế: 724 giây. Hệ số phụ trội: 1.58.

Áp dụng cho lần truyền 4TB ở tốc độ tải lên 875 Mbps: 32,768 Gb / 0.875 Gbps × 1.58 phụ trội ≈ **59,200 giây ≈ 16.4 giờ**.

Phần phụ trội đến từ nhiều nguồn: TCP slow-start khi thiết lập kết nối, mất gói tin đòi hỏi truyền lại (đường dẫn công cộng từ Seattle tới us-west-2 trung bình mất 0.2% gói tin — nhỏ, nhưng nhân lên qua hàng triệu gói tin), phụ trội bắt tay HTTPS cho mỗi đoạn multipart upload, và thời gian xử lý để S3 ráp các multipart upload.

"Mười sáu giờ là ổn cho một lần di chuyển một-lần," Leo nói. "Vấn đề thực sự là nếu lần truyền bị gián đoạn ở giờ thứ 14."

S3 multipart upload giải quyết vấn đề gián đoạn: nếu lần truyền thất bại ở giờ thứ 14, chỉ phần hiện tại cần được tải lên lại. Các phần trước đó được lưu trong S3 và lần truyền có thể tiếp tục. Nhưng phụ trội của việc quản lý các multipart upload đã thêm khoảng 3% vào tổng thời gian truyền.

Ước tính thực tế cuối cùng: **khoảng 9 giờ lý thuyết qua internet 1 Gbps, khoảng 17 giờ thực tế** — tính đến tốc độ tải lên đo được 875 Mbps của văn phòng họ, phụ trội mất gói tin, và xử lý multipart upload.

Leo cân nhắc điều này một lúc. Rồi anh nhìn vào trang bảng giá Snow Family.

"Lựa chọn khác là gì?" Tom hỏi.

"Khoan — nhưng *tại sao* chúng ta lại cần thứ gì hơn một VPN?" Maya hỏi. "Lần di chuyển 4TB là một sự kiện một-lần."

"Không phải vậy," Priya nói. "Một khi dữ liệu đã ở trong AWS, nhóm vẫn cần truy cập nó hằng ngày. Và độ trễ VPN cộng dồn lại."

**AWS Direct Connect: Đường Dây Dành Riêng**

**AWS Direct Connect** thiết lập một kết nối mạng riêng tư, dành riêng giữa vị trí của bạn (hoặc cơ sở colocation của bạn) và AWS. Lưu lượng không bao giờ chạm vào internet công cộng.

Direct Connect là một kết nối vật lý — một đường cáp quang từ mạng của bạn tới một vị trí AWS Direct Connect. Bạn làm việc với một nhà cung cấp viễn thông để thiết lập mạch vật lý. AWS cung cấp cổng ở phía của họ.

**Lợi ích**:

- Độ trễ nhất quán, có thể dự đoán (không có biến động internet công cộng)
- Tốc độ từ 50 Mbps đến 100 Gbps (với các cổng dành riêng 400 Gbps gốc tại một số vị trí chọn lọc kể từ năm 2024)
- Chi phí chuyển dữ liệu thấp hơn so với internet (tỷ lệ chuyển dữ liệu Direct Connect rẻ hơn tỷ lệ chuyển dữ liệu ra AWS tiêu chuẩn)
- Bảo mật hơn (mạch riêng tư, không phải internet công cộng)

**Đánh đổi**:

- Thiết lập mất vài tuần đến vài tháng (cấp phát cơ sở hạ tầng vật lý)
- Chi phí cao hơn đáng kể so với VPN
- Không có dự phòng tích hợp sẵn (bạn tự thiết lập các mạch dự phòng)
- Không phù hợp cho các văn phòng phân tán về mặt địa lý mà không có nhiều mạch

Bạn có thể đang tự hỏi: nếu Direct Connect là một đường cáp quang vật lý, điều gì xảy ra nếu ai đó vô tình cắt nó? Đó là vấn đề điểm-thất-bại-duy-nhất với một mạch đơn lẻ — đó là lý do các thiết lập Direct Connect sản xuất dùng các mạch dự phòng trên các đường dẫn tách biệt về mặt địa lý, hoặc duy trì một VPN làm dự phòng. Cáp có thể bị cắt; doanh nghiệp vẫn tiếp tục.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi. Anh đã tra cứu trước rồi. "Một cổng 1Gbps dành riêng là $216/tháng," anh nói. "Cộng với mạch từ văn phòng của chúng ta, mà một công ty viễn thông báo giá $800/tháng."

"Vậy tổng cộng khoảng một nghìn một tháng."

Đối với Nimbus: Direct Connect là quá mức cần thiết cho quy mô hiện tại của họ. Nhưng đối với các doanh nghiệp có khối lượng chuyển dữ liệu đáng kể hoặc các yêu cầu tuân thủ về kết nối mạng riêng tư, Direct Connect tự bù đắp chi phí của nó.

**Hosted Connections: Điểm Trung Gian**

Không phải mọi tổ chức đều có thể cam kết với một mạch cáp quang dành riêng 100 Gbps. **Direct Connect Hosted Connections** cho phép các Đối Tác AWS Direct Connect (các công ty viễn thông được chấp thuận) cấp phát các kết nối dưới 1Gbps mà bạn chia sẻ với các khách hàng khác.

Việc thiết lập nhanh hơn (ngày đến tuần, không phải tháng) và chi phí thấp hơn một kết nối dành riêng. Đánh đổi: năng lực chia sẻ có nghĩa là thông lượng kém nhất quán hơn.

Đối với Nimbus (khi họ tăng trưởng): một kết nối hosted 500 Mbps qua một đối tác sẽ cung cấp kết nối riêng tư ở một mức giá hợp lý.

Sự khác biệt thực tế quan trọng vào lúc thi: Hosted Connections có sẵn ở các tốc độ từ 50 Mbps đến 10 Gbps (một số đối tác cung cấp lên đến 25 Gbps), được cấp phát bởi một Đối Tác AWS. Dedicated Connections đi thẳng tới AWS và có sẵn ở 1 Gbps, 10 Gbps, và 100 Gbps (cộng thêm 400 Gbps tại các vị trí chọn lọc). Đối với các tốc độ dưới 1 Gbps, một Hosted Connection là lựa chọn Direct Connect duy nhất — Dedicated Connections bắt đầu ở mức tối thiểu 1 Gbps.

**AWS Transit Gateway: Hub-and-Spoke cho các VPC**

Khi Nimbus phát triển, họ sẽ tích lũy nhiều VPC: production VPC, staging VPC, analytics VPC, security tooling VPC.

Không có kế hoạch cẩn thận, việc kết nối các VPC này đòi hỏi một mạng lưới đầy đủ các kết nối VPC peering. Cho 4 VPC: 6 kết nối peering. Cho 10 VPC: 45 kết nối peering. Cho 20 VPC: 190 kết nối. Điều này không có khả năng mở rộng.

**AWS Transit Gateway** là một hub mạng kết nối nhiều VPC và mạng on-premises. Thay vì một mạng lưới các kết nối peering, mỗi VPC kết nối tới Transit Gateway. Transit Gateway định tuyến lưu lượng giữa chúng.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Định tuyến bắc cầu**: Nếu VPC A và VPC B đều kết nối tới Transit Gateway, chúng có thể giao tiếp — mà không cần một kết nối peer trực tiếp. Transit Gateway xử lý việc định tuyến. Không giống VPC peering (vốn không bắc cầu), Transit Gateway cho phép cấu trúc hub-and-spoke.

**Chi phí Transit Gateway**: tính phí cho mỗi attachment (kết nối VPC hoặc VPN/Direct Connect) cộng với mỗi GB dữ liệu được xử lý. Ở quy mô lớn, điều này đáng giá cho sự đơn giản.

Đối với Nimbus, sự kiện kích hoạt Transit Gateway là việc thêm một VPC thứ tư. Họ có: production, staging, analytics, và giờ là security tooling (một VPC cho quét lỗ hổng và giám sát tuân thủ SOC2 mà không nên nằm trên cùng một phân đoạn mạng với production).

Không có Transit Gateway, kết nối bốn VPC đòi hỏi sáu kết nối peering:
- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

Sáu kết nối peering, sáu mục trong bảng định tuyến cho mỗi VPC, sáu quy tắc security group để rà soát. Và VPC peering không bắc cầu: nếu Production và Analytics được peer, và Analytics và Security được peer, Production không thể tiếp cận Security thông qua Analytics VPC. Bạn cần kết nối peering Production ↔ Security một cách rõ ràng.

Với Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

Bốn attachment. Một bảng định tuyến để quản lý. Định tuyến bắc cầu: Production có thể tiếp cận Security thông qua Transit Gateway mà không cần một kết nối peer trực tiếp.

"Và sẽ thế nào nếu ai đó cố đột nhập thông qua Transit Gateway?" Priya hỏi. "Nếu cả bốn VPC chia sẻ một Transit Gateway, một tài nguyên bị xâm phạm trong Staging VPC có thể tiếp cận Production."

Transit Gateway hỗ trợ **các bảng định tuyến có cách ly**: bạn có thể định nghĩa những VPC nào được phép giao tiếp qua Transit Gateway và những VPC nào bị cách ly. Security tooling VPC có thể tiếp cận tất cả các VPC khác (nó cần quét chúng). Staging không thể tiếp cận Production. Production không thể tiếp cận Analytics trực tiếp (Analytics truy vấn dữ liệu thông qua một endpoint chỉ-đọc cụ thể).

"Một Transit Gateway," Priya nói, "với các chính sách định tuyến thể hiện mô hình truy cập thực tế. So với sáu kết nối peering mà không có cách tập trung nào để kiểm toán cái gì tiếp cận cái gì."

**VPC Endpoints: Truy Cập Riêng Tư Đến Các Dịch Vụ AWS**

Một vấn đề chi phí và bảo mật tinh tế: khi instance EC2 của bạn (trong một private subnet) gọi API S3, lưu lượng đó định tuyến qua NAT Gateway (để đến internet, nơi endpoint công khai của S3 nằm). Bạn trả tiền cho việc xử lý NAT Gateway.

**VPC Endpoints** cho phép các tài nguyên trong VPC của bạn giao tiếp với các dịch vụ AWS một cách riêng tư, mà không đi qua internet công cộng — và không có NAT Gateway.

Hai loại:

**Gateway endpoints** (miễn phí): Cho S3 và DynamoDB. Bạn thêm một tuyến đường trong bảng định tuyến của mình chuyển hướng lưu lượng S3 hoặc DynamoDB tới endpoint thay vì NAT Gateway. Miễn phí để tạo; miễn phí để dùng.

**Interface endpoints** (có giá): Cho các dịch vụ AWS khác (SQS, SNS, Secrets Manager, SSM, v.v.). Tạo một ENI (Elastic Network Interface) trong subnet của bạn với một IP riêng tư. Lưu lượng tới dịch vụ dùng IP riêng tư này. Chi phí khoảng $0.01/giờ mỗi AZ cộng xử lý dữ liệu.

Leo đã tạo các Gateway endpoint tuần trước mà không cập nhật các bảng định tuyến. "Tôi đã triển khai nó rồi — à," anh nói, kiểm tra cấu hình. "Các tuyến đường chưa được cập nhật. Để tôi sửa cái đó."

Tom ngay lập tức tạo các Gateway endpoint cho S3 và DynamoDB sau khi biết chúng miễn phí. Phí xử lý dữ liệu NAT Gateway giảm 65%.

Phép tính lý do: các hàm Lambda và các ECS task của Nimbus trong các private subnet đang gửi các yêu cầu liên tục tới S3 (đọc các tệp config, ghi các bản xuất nhật ký) và tới DynamoDB (đọc dữ liệu nhà hàng, ghi các bản ghi đơn hàng). Mỗi yêu cầu định tuyến qua NAT Gateway, vốn tính phí $0.045 mỗi GB dữ liệu được xử lý.

Việc xử lý dữ liệu NAT Gateway hàng tháng của Nimbus: 533 GB. Chi phí: $24/tháng. Sau khi thêm các Gateway Endpoint cho S3 và DynamoDB và cập nhật các bảng định tuyến: lưu lượng S3 và DynamoDB bỏ qua NAT Gateway hoàn toàn. Việc xử lý NAT Gateway hàng tháng giảm xuống 187 GB — lưu lượng còn lại là các lệnh gọi API tới các dịch vụ khác (Secrets Manager, SES, các webhook bên ngoài). Chi phí: $8.40/tháng.

Tiết kiệm: $15.60/tháng, $187/năm, cho hai cấu hình Gateway Endpoint miễn phí mất 10 phút để thiết lập.

"Miễn phí," Tom nói, lần thứ ba.

"Các Gateway endpoint miễn phí để tạo và miễn phí để dùng," Leo xác nhận. "Chúng không chỉ là một cải thiện bảo mật — định tuyến lưu lượng S3 và DynamoDB qua một endpoint riêng tư thay vì NAT Gateway loại bỏ nó khỏi internet công cộng hoàn toàn."

"Và sẽ thế nào nếu ai đó cố đột nhập thông qua lưu lượng NAT Gateway?" Priya hỏi. "Nếu lưu lượng tới S3 đi qua NAT, nó có thể định địa chỉ từ internet. Qua Gateway Endpoint, nó là riêng tư."

Đây là lợi ích thứ cấp của các Gateway Endpoint mà cuộc thảo luận về chi phí đôi khi làm lu mờ. Lưu lượng tới S3 và DynamoDB thông qua một VPC Gateway Endpoint không bao giờ rời khỏi mạng AWS, không bao giờ đi qua một địa chỉ IP công cộng, và được chi phối bởi chính sách endpoint (một chính sách dựa-trên-tài-nguyên có thể hạn chế những bucket S3 hoặc bảng DynamoDB nào mà endpoint có thể truy cập). Một Gateway Endpoint trên một bucket lưu trữ dữ liệu khách hàng thêm một lớp bổ sung: ngay cả với một bucket policy bị cấu hình sai, chính sách endpoint vẫn có thể hạn chế truy cập chỉ với lưu lượng bắt nguồn từ bên trong VPC cụ thể.

**AWS Global Accelerator: Định Tuyến Tại Edge**

Khi Nimbus phục vụ người dùng Bờ Đông từ us-west-2 (Oregon), độ trễ là 80ms. Không phải vì máy chủ quá xa, mà vì việc định tuyến internet công cộng giữa Boston và Oregon không tối ưu, nảy qua nhiều mạng nhà mạng.

**AWS Global Accelerator** dùng backbone toàn cầu riêng tư của AWS — một mạng phân tán các vị trí edge định tuyến lưu lượng tới ứng dụng của bạn thông qua các đường dẫn do-AWS-kiểm-soát thay vì các chặng nhà mạng internet công cộng. Thay vì định tuyến internet công cộng, lưu lượng vào mạng của AWS tại vị trí edge gần nhất và di chuyển theo đường dẫn riêng tư được tối ưu hóa tới ứng dụng của bạn.

Đối với Nimbus, một người dùng ở Boston sẽ:

- **Không có Global Accelerator**: Định tuyến qua các nhà mạng internet công cộng → ~80ms
- **Với Global Accelerator**: Chạm vào AWS edge gần nhất ở Boston → di chuyển qua backbone AWS → tới us-west-2 → ~60ms

Global Accelerator không cache nội dung (đó là CloudFront). Nó tối ưu hóa đường dẫn mạng cho các yêu cầu động.

Leo chạy một so sánh độ trễ qua một vài thành phố sau khi bật Global Accelerator cho API của Nimbus:

| Thành phố | Trước | Sau | Cải thiện |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

Sự cải thiện là rõ rệt nhất đối với người dùng ở xa về mặt địa lý — Tokyo từ 180ms xuống 95ms, Sydney từ 210ms xuống 118ms. Đối với Seattle (gần các trung tâm dữ liệu us-west-2 ở Oregon), sự cải thiện nhỏ hơn — có ít chặng internet công cộng hơn để tối ưu.

"Khoan — nhưng *tại sao* Tokyo lại được cải thiện 47%?" Maya hỏi. "Nếu trung tâm dữ liệu vẫn ở us-west-2, chẳng phải tốc độ ánh sáng là ràng buộc thực sự sao?"

"Tốc độ ánh sáng là sàn," Leo nói. "Ràng buộc thực sự là việc định tuyến internet công cộng. Lưu lượng từ Tokyo tới us-west-2 đi qua hàng chục hệ thống tự trị — các nhà mạng khác nhau, các bộ định tuyến khác nhau, các thỏa thuận peering khác nhau. Mỗi chặng thêm độ trễ. Global Accelerator định tuyến lưu lượng từ vị trí edge Tokyo tới us-west-2 qua cáp quang riêng tư của AWS, vốn có các đường dẫn ngắn hơn và định tuyến được tinh chỉnh tốt hơn."

Mức tối thiểu lý thuyết từ Tokyo tới us-west-2 (dựa trên tốc độ ánh sáng qua cáp quang, khoảng 15,500 km khứ hồi): ~77ms. Mức 95ms với Global Accelerator đang tiến gần đến mức tối thiểu lý thuyết đó. Mức 180ms khi không có nó phản ánh sự kém hiệu quả của việc định tuyến internet công cộng, không phải các định luật vật lý.

Global Accelerator cung cấp hai **địa chỉ IP anycast** tĩnh định tuyến tới vị trí edge gần nhất. Không giống CloudFront (vốn dùng các địa chỉ IP động thay đổi), các IP này ổn định — hữu ích cho việc cho phép qua firewall (allowlist) và cho các ứng dụng đòi hỏi một IP cố định để các client kết nối tới.

**Khi nào dùng Global Accelerator vs CloudFront**:

- CloudFront: nội dung tĩnh và có thể cache, trường hợp dùng CDN
- Global Accelerator: nội dung động, các giao thức không phải HTTP (UDP, gaming, IoT), hoặc khi bạn cần một địa chỉ IP Anycast tĩnh

## Di Chuyển Dữ Liệu, Không Chỉ Lưu Lượng: DataSync và Transfer Family

Trong khi kiến trúc mạng đang dần hình thành, Maya nhận được ba dự án onboarding chuỗi nhà hàng mới cùng lúc. Mỗi dự án có một yêu cầu di chuyển dữ liệu — và mỗi yêu cầu lại khác nhau.

Chuỗi đầu tiên, Pacific Table, cần chuyển 40 TB các file share NFS sang S3. Lưu trữ tệp hiện tại của họ là on-premises, trải rộng trên bốn file server tại trụ sở Seattle của họ. Leo bắt đầu viết một kế hoạch di chuyển.

Chuỗi thứ hai, Marisol Group, có một nhóm kế toán tải lên các hóa đơn hằng ngày lên một máy chủ SFTP cục bộ. Quy trình SFTP đã chạy từ năm 2015. Nhân viên kế toán biết một điều: họ mở client SFTP của mình mỗi sáng lúc 9 giờ, thả các hóa đơn của họ vào, và đóng nó lại. Không ai muốn thay đổi điều này. "Các kế toán viên của họ dùng WinSCP," Maya nói. "Đó là điều không thể thương lượng."

"Đó là hai công cụ khác nhau," Priya nói.

"Đúng," Leo nói. "Nhưng cả hai đều tồn tại."

**AWS DataSync: rsync Tăng Lực, Với Một AWS Console**

Đối với lần di chuyển 40 TB của Pacific Table, thách thức không phải là băng thông — văn phòng Seattle có một kết nối tải lên vững chắc. Thách thức là việc điều phối: khám phá những tệp nào tồn tại, truyền chúng một cách đáng tin cậy, xác minh các checksum, lên lịch lần truyền để tránh làm bão hòa mạng văn phòng trong giờ làm việc, và giám sát tiến độ qua nhiều ngày hoạt động liên tục.

**AWS DataSync** là một dịch vụ di chuyển và sao chép dữ liệu dựa-trên-agent. Bạn cài đặt một DataSync agent nhẹ trong môi trường on-premises của mình — một máy ảo chạy trên VMware hoặc như một instance EC2. Agent kết nối tới các file server của bạn qua NFS hoặc SMB, khám phá các share của bạn, và đồng bộ chúng tới một đích trong AWS: một bucket S3, một filesystem EFS, hoặc một filesystem FSx.

Hãy nghĩ về nó như rsync tăng lực, với một AWS console. DataSync xử lý:

- **Khám phá**: agent tự động kiểm kê các share nguồn của bạn
- **Lên lịch**: các lần truyền có thể chạy theo một lịch trình được định nghĩa (ngoài giờ làm việc) hoặc liên tục
- **Xác minh**: DataSync tính các checksum ở cả hai đầu và cảnh báo bạn về bất kỳ sự không nhất quán nào
- **Giám sát**: tiến độ truyền, số lượng tệp, các báo cáo lỗi, và mức sử dụng băng thông đều hiển thị trong console
- **Mã hóa khi truyền**: tất cả dữ liệu được mã hóa dùng TLS trong quá trình truyền

Đối với Pacific Table, Leo cài đặt DataSync agent trên một VM trong mạng Seattle của họ, trỏ nó vào bốn share NFS, và cấu hình một lịch trình truyền: 8 giờ tối đến 6 giờ sáng vào các ngày trong tuần, liên tục vào cuối tuần. Sau sáu ngày, toàn bộ 40 TB đã hạ cánh vào S3. Anh xác minh lần truyền với báo cáo checksum tích hợp sẵn của DataSync. Không một sai lệch nào.

"Còn cho việc sao chép liên tục thì sao?" Maya hỏi. "Pacific Table vẫn sẽ thêm các tệp sau lần di chuyển."

"DataSync hỗ trợ các lần truyền tăng dần," Leo nói. "Sau lần đồng bộ ban đầu, nó chỉ sao chép những gì đã thay đổi. Chúng ta có thể chạy nó hằng đêm như một job sao chép."

**AWS Transfer Family: Quy Trình SFTP Của Bạn, Được Hậu Thuẫn Bởi S3**

Đối với nhóm kế toán của Marisol Group, yêu cầu thì khác. Không ai chuyển đi khỏi SFTP. Các kế toán viên sẽ tiếp tục dùng WinSCP. Câu hỏi là: những lần tải lên SFTP đó hạ cánh ở đâu?

Hiện tại, chúng hạ cánh trên một máy chủ Linux cục bộ trong văn phòng hậu cần của Marisol. Các tệp sau đó được di chuyển thủ công vào hệ thống kế toán của họ. Máy chủ cục bộ đòi hỏi bảo trì, sao lưu, và một người với quyền SSH để quản lý nó.

**AWS Transfer Family** là một máy chủ SFTP, FTPS, và FTP được quản lý hoàn toàn — được hậu thuẫn bởi S3 hoặc EFS làm đích lưu trữ. Bạn cấp phát một endpoint Transfer Family (nó nhận một hostname và, tùy chọn, một địa chỉ IP tĩnh). Các client của bạn kết nối tới nó dùng phần mềm SFTP hiện có của họ. Khi họ tải lên các tệp, các tệp đó hạ cánh trực tiếp vào một bucket S3.

Nhóm kế toán không thay đổi gì cả. Họ vẫn mở WinSCP mỗi sáng lúc 9 giờ. Họ vẫn kết nối tới một máy chủ SFTP với thông tin xác thực hiện có của họ. Họ vẫn thả các hóa đơn của họ vào cùng một thư mục. Sự khác biệt là vô hình với họ: ở phía máy chủ, các tệp giờ đi trực tiếp vào S3 thay vì lên một máy chủ Linux cục bộ.

"Và từ S3, chúng ta có thể kích hoạt phần còn lại của quy trình một cách tự động," Priya nói. "Một sự kiện S3 kích hoạt một hàm Lambda xử lý hóa đơn và chèn nó vào hệ thống kế toán. Không có bước thủ công."

"Vậy quy trình của các kế toán viên không thay đổi," Maya nói, "nhưng ở phía chúng ta, toàn bộ mọi thứ được tự động hóa."

"Đúng. Và bản thân máy chủ SFTP được quản lý hoàn toàn — không vá lỗi, không sao lưu, không có máy chủ để bảo trì."

Tom đã tra cứu giá. Transfer Family tính phí mỗi giờ endpoint sẵn sàng cộng với mỗi GB được truyền. Đối với khối lượng hóa đơn của Marisol Group, chi phí hàng tháng dưới $30 khá nhiều. Chi phí bảo trì máy chủ cục bộ mà nó thay thế — khấu hao phần cứng, thời gian kỹ thuật cho bảo trì, quản lý sao lưu — đáng kể hơn nhiều.

---

> **Mẹo Thi — DataSync và Transfer Family**
>
> *Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Hiệu Năng Cao (Lĩnh vực 3, Nhiệm vụ 3.1)*
>
> - **DataSync** = di chuyển dữ liệu hàng loạt từ on-premises lên AWS (các file share NFS hoặc SMB → S3, EFS, hoặc FSx). Các tín hiệu thi: "di chuyển các file share," "sao chép dữ liệu NFS lên S3," "chuyển dữ liệu từ on-premises lên AWS," "sao chép liên tục dữ liệu tệp." DataSync dùng một agent được cài on-premises; agent xử lý việc khám phá, lên lịch, và xác minh.
> - **Transfer Family** = chuyển tệp liên tục dùng các giao thức SFTP, FTPS, hoặc FTP, mà không thay đổi các công cụ client. Các tín hiệu thi: "quy trình SFTP hiện có," "các đối tác tải lên các tệp qua SFTP," "máy chủ SFTP được hậu thuẫn bởi S3," "lift-and-shift SFTP," "không thể thay đổi quy trình chuyển tệp." Transfer Family là đáp án khi yêu cầu là tính tương thích SFTP, không phải khối lượng dữ liệu.
> - **Sự phân biệt quan trọng**: DataSync dành cho di chuyển và sao chép hàng loạt (dựa-trên-agent, theo-lịch, tối-ưu-mạng). Transfer Family dành cho các dịch vụ chuyển tệp tương thích giao thức (dựa-trên-endpoint, luôn-bật, trong-suốt-với-client). Chúng giải quyết các vấn đề khác nhau.
> - DataSync hỗ trợ S3, EFS, và FSx làm đích. Transfer Family hỗ trợ S3 và EFS làm backend lưu trữ.

---

**Di Chuyển Máy Chủ, Không Chỉ Tệp: 7 Chữ R và MGN**

Chuỗi thứ ba trong danh sách của Maya không chỉ có các tệp — nó có cả các máy chủ: một ứng dụng đặt chỗ tùy chỉnh chạy trên hai máy on-premises mà không ai muốn viết lại trước khi chuyển. Việc di chuyển *các ứng dụng* là một bộ môn riêng của nó, và AWS mô tả **bảy cách để di chuyển** (các "7 chữ R") mà bạn chủ yếu cần nhận ra:

- **Rehost** ("lift and shift"): chuyển các máy chủ y nguyên. Nhanh nhất, ít thay đổi nhất.
- **Replatform** ("lift, tinker, and shift"): các nâng cấp nhỏ trên đường đi — như chuyển một cơ sở dữ liệu tự-quản-lý sang RDS.
- **Repurchase**: bỏ hệ thống cũ, mua SaaS thay thế.
- **Refactor**: thiết kế lại theo kiểu cloud-native. Nhiều công sức nhất, nhiều lợi ích nhất.
- **Retire**: hóa ra không ai dùng nó. Xóa nó đi.
- **Retain**: để nó ở nguyên chỗ, tạm thời.
- **Relocate**: chuyển ở cấp hypervisor mà không thay đổi gì.

Đối với trường hợp rehost, công cụ là **AWS Application Migration Service (MGN)**: một agent sao chép các ổ đĩa của các máy chủ nguồn, từng khối một, vào một khu vực dàn dựng chi phí thấp trong AWS; bạn khởi chạy các bản sao thử nghiệm bất cứ khi nào bạn muốn; tại lúc chuyển đổi (cutover), MGN chuyển các máy chủ đã sao chép thành các instance EC2 gốc. Lift, shift, xong — việc refactor có thể đến sau, theo thời gian của cloud. (Các bạn đồng hành của nó cho việc lập kế hoạch danh mục, Application Discovery Service và Migration Hub, đã đóng cửa với khách hàng mới vào cuối năm 2025 — hãy biết tên của chúng là "khám phá kiểm kê" và "theo dõi di chuyển tập trung" nếu đề thi đề cập đến chúng.)

---

**AWS Snow Family: Lựa Chọn Vật Lý**

Vẫn còn vấn đề của bộ dữ liệu lịch sử 4TB và ước tính 17 giờ qua internet. Sau khi tính toán nó, Leo đã nhìn vào trang bảng giá Snow Family và đưa ra quyết định ngay lập tức.

Đối với các lần di chuyển trên vài terabyte mà thời gian quan trọng hơn sự đơn giản, AWS gửi các thiết bị lưu trữ vật lý tới vị trí của bạn. Bạn nạp dữ liệu vào chúng. Bạn gửi chúng trở lại. AWS nạp dữ liệu trực tiếp vào S3.

**Snowball Edge Storage Optimized**: 80 TB dung lượng sử dụng được, vỏ bọc gia cường. Gửi tới vị trí của bạn trong 2-5 ngày làm việc. Bạn nạp dữ liệu dùng giao diện cục bộ (NFS, giao diện S3). Bạn gửi nó trở lại. AWS nạp dữ liệu trong khoảng 1-3 ngày làm việc sau khi nhận.

Đối với lần di chuyển 4TB của Nimbus, quy trình:

1. **Đặt** một Snowball Edge qua AWS console (mất 2 phút, gửi trong 3 ngày)
2. **Kết nối** thiết bị vào mạng văn phòng Seattle; nó hiện ra như một điểm gắn (mount point) NFS
3. **Sao chép** 4TB dữ liệu đơn hàng lịch sử dùng giao diện tương thích S3 của thiết bị: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Sao chép hoàn tất** trong khoảng 2 giờ (mạng cục bộ, không internet)
5. **Gửi** thiết bị trở lại AWS (đã bao gồm nhãn trả phí trước)
6. AWS **nạp** dữ liệu vào S3 trong vòng 72 giờ kể từ khi nhận
7. **Xác minh** — S3 cung cấp một báo cáo hoàn thành job hiển thị mọi tệp được truyền và checksum

Tổng thời gian trôi qua: 3 ngày để giao + 2 giờ để sao chép + 1 ngày vận chuyển + 2 ngày nạp = khoảng 7 ngày theo lịch. So với khoảng 17 giờ liên tục — vốn sẽ đòi hỏi một kết nối internet ổn định, không bị gián đoạn, làm bão hòa đường lên văn phòng suốt đêm và qua hầu hết một ngày làm việc.

Chi phí: thuê thiết bị Snowball Edge là $300 cho 10 ngày. Vận chuyển (hai chiều): khoảng $80. Chuyển dữ liệu vào S3 miễn phí. Tổng chi phí di chuyển: **$380**.

So với khoảng 17 giờ sử dụng internet 875 Mbps duy trì: đường hầm VPN miễn phí ($0.05/giờ nhưng đường hầm vốn đã đang chạy); chuyển dữ liệu vào S3 miễn phí. Đường dẫn internet "miễn phí" có một chi phí thực về thời gian kỹ thuật (giám sát một lần truyền 17 giờ), rủi ro (bất kỳ gián đoạn nào đòi hỏi khởi động lại), và chi phí cơ hội (kết nối internet của họ bị bão hòa trong cửa sổ truyền). Leo đặt hàng. Cách nó diễn ra nằm trong cảnh sau tín dụng của chương này.

---

## Điểm Mạnh và Hạn Chế

**Site-to-Site VPN**:

- Thiết lập nhanh, chi phí thấp
- Đường dẫn internet công cộng có nghĩa là độ trễ biến đổi
- Trần băng thông có hạn (1.25 Gbps mỗi đường hầm)
- Lựa chọn Accelerated VPN cải thiện độ trễ với chi phí cao hơn một chút

**Direct Connect**:

- Nhất quán, riêng tư, băng thông cao
- Thiết lập chậm, chi phí định kỳ đáng kể
- Mạch vật lý là một điểm thất bại duy nhất (thêm dự phòng hoặc duy trì VPN làm backup)
- Hòa vốn với khoản tiết kiệm chi phí egress ở khoảng 10-15 TB/tháng tùy theo kịch bản giá

**AWS Snow Family**:

- Đối với các lần di chuyển một-lần trên 1-2 TB, thường nhanh hơn và rẻ hơn so với truyền qua mạng
- Không tiêu thụ băng thông internet trong quá trình di chuyển
- Cửa sổ thuê thiết bị 10 ngày; vận chuyển trả phí trước

**Transit Gateway**:

- Đơn giản hóa đáng kể kết nối đa VPC
- Định tuyến bắc cầu (không giống VPC peering)
- Các bảng định tuyến cách ly cho phép phân đoạn mà không cần các kết nối peering riêng biệt
- Chi phí cộng dồn cho nhiều attachment

**VPC Endpoints**:

- Lợi ích bảo mật và chi phí cho S3/DynamoDB (gateway endpoint miễn phí)
- Loại bỏ chi phí NAT Gateway cho lưu lượng dịch vụ AWS
- Các chính sách endpoint thêm một lớp kiểm soát truy cập bổ sung vượt ngoài IAM và bucket policy
- Các interface endpoint cho các dịch vụ khác (Secrets Manager, SSM, SES) giữ lưu lượng riêng tư nhưng tốn khoảng $0.01/giờ mỗi AZ

**Global Accelerator**:

- Cải thiện độ trễ ứng dụng động cho người dùng toàn cầu: cải thiện 33-47% trong thực tế cho người dùng ở xa
- Các IP Anycast cố định (không giống các IP động của CloudFront) — hữu ích cho việc allowlist firewall
- Các giao thức không phải HTTP (UDP, TCP) — CloudFront chỉ HTTP/HTTPS
- Chi phí bổ sung ($0.025/giờ mỗi accelerator + chuyển dữ liệu)

## Tóm Tắt

Công việc Aurora trong chương 24 đã tối ưu hóa cách Nimbus phục vụ dữ liệu cho ứng dụng của chính nó. Chương này nói về cách dữ liệu di chuyển giữa thế giới bên ngoài và AWS — và cách làm cho sự di chuyển đó đáng tin cậy hơn, nhanh hơn, và ít tốn kém hơn.

- **Site-to-Site VPN**: Đường hầm được mã hóa qua internet công cộng giữa on-premises và VPC. Thiết lập nhanh, chi phí thấp hơn, độ trễ biến đổi. Hai đường hầm để dự phòng. Tối đa 1.25 Gbps mỗi đường hầm.
- **Direct Connect**: Kết nối cáp quang riêng tư, dành riêng tới AWS. Độ trễ có thể dự đoán, băng thông cao hơn, mất vài tuần để thiết lập, chi phí đáng kể. Hòa vốn với khoản tiết kiệm egress của VPN ở khoảng 13.5 TB/tháng cho kịch bản giá của Nimbus.
- **AWS Snow Family**: Các thiết bị lưu trữ vật lý cho di chuyển dữ liệu hàng loạt. Nhanh hơn truyền qua internet cho các lần di chuyển nhiều-TB. Tổng cộng $380 cho lần di chuyển 4TB của Nimbus so với khoảng 17 giờ làm bão hòa mạng.
- **Transit Gateway**: Hub cho kết nối VPC và on-premises. Cho phép định tuyến bắc cầu (không giống VPC peering). Hỗ trợ các bảng định tuyến cách ly để kiểm soát VPC nào có thể tiếp cận VPC nào. Mở rộng đến hàng trăm kết nối.
- **VPC Endpoints**: Truy cập riêng tư tới các dịch vụ AWS mà không cần NAT Gateway. Các gateway endpoint (S3, DynamoDB) miễn phí — thêm chúng vào mọi VPC truy cập S3 hoặc DynamoDB. Tiết kiệm cho Nimbus $15.60/tháng và loại bỏ lưu lượng S3/DynamoDB khỏi NAT Gateway.
- **Global Accelerator**: Định tuyến lưu lượng động qua backbone riêng tư của AWS để có độ trễ thấp hơn, nhất quán hơn trên toàn cầu. Các IP Anycast tĩnh. Cải thiện độ trễ 33-47% cho người dùng ở xa (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms). Không phải một CDN — không cache.
- **AWS DataSync**: Dịch vụ dựa-trên-agent để di chuyển và sao chép dữ liệu tệp NFS/SMB on-premises tới S3, EFS, hoặc FSx. Xử lý việc lên lịch, xác minh checksum, giám sát. Dùng cho các lần di chuyển một-lần và sao chép liên tục các file share.
- **AWS Transfer Family**: Máy chủ SFTP, FTPS, và FTP được quản lý, được hậu thuẫn bởi S3 hoặc EFS. Cho phép các client SFTP hiện có tải lên các tệp vào S3 mà không thay đổi quy trình của họ.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Hiệu Năng Cao (Lĩnh vực 3, Nhiệm vụ 3.4)*

- **Các tín hiệu VPN vs Direct Connect**: VPN = "mã hóa lưu lượng tới VPC," "thiết lập nhanh," "nhạy cảm về chi phí." Direct Connect = "độ trễ thấp nhất quán," "chuyển dữ liệu lớn," "kết nối riêng tư," "tuân thủ đòi hỏi mạng riêng tư."
- **Transit Gateway vs VPC Peering**: Peering không bắc cầu (A→B→C không cho phép A→C). Transit Gateway bắc cầu. "Nhiều VPC cần giao tiếp" → Transit Gateway.
- **VPC Gateway Endpoints**: Miễn phí. Chỉ S3 và DynamoDB. Thay đổi bảng định tuyến. Không tốn thêm chi phí. Kịch bản thi: "giảm chi phí chuyển dữ liệu cho truy cập S3 từ private subnet" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = nội dung động, non-HTTP, IP tĩnh, tối ưu hóa mạng. CloudFront = caching, nội dung HTTP, CDN.
- **Direct Connect + VPN**: Bạn có thể dùng một VPN làm backup cho một kết nối Direct Connect. Nếu mạch Direct Connect bị lỗi, lưu lượng chuyển sang VPN. Đắt hơn chỉ VPN, đáng tin cậy hơn chỉ Direct Connect.
- **Direct Connect Gateway**: Kết nối một mạch Direct Connect tới nhiều VPC trên nhiều region hoặc account. Không có nó, một mạch Direct Connect kết nối tới một VGW trong một region.
- **AWS Snow Family**: "Di chuyển dữ liệu lớn," "tốc độ truyền quá chậm," "di chuyển quy mô petabyte" → Snow Family. Snowball Edge = lên đến 80TB. Hãy làm phép toán truyền trước: nếu việc chuyển dữ liệu qua mạng sẵn có sẽ mất khoảng một tuần hoặc hơn, đáp án là một thiết bị vật lý. *Kiểm tra thực tế (2026)*: AWS đã và đang ngừng dòng sản phẩm này — Snowmobile bị rút lui vào năm 2024, Snowcone bị ngừng vào cuối năm 2024, và tính đến tháng 11 năm 2025, các thiết bị Snow không còn được cung cấp cho khách hàng mới (AWS giờ trỏ tới DataSync qua các đường liên kết nhanh và tới **Data Transfer Terminals**, các vị trí an toàn nơi bạn mang ổ đĩa của riêng mình tới). Ngân hàng câu hỏi SAA-C03 có trước tất cả những điều này, nên trong đề thi, "vài tuần truyền qua mạng, băng thông hạn chế" vẫn trỏ tới Snowball.
- **Các bảng định tuyến Transit Gateway**: Transit Gateway hỗ trợ nhiều bảng định tuyến để phân đoạn mạng. Tín hiệu thi: "cách ly production VPC khỏi staging" với kết nối chia sẻ qua Transit Gateway → các bảng định tuyến riêng biệt.
- **Các IP cố định của Global Accelerator**: Không giống CloudFront, Global Accelerator cung cấp hai IP Anycast tĩnh. Tín hiệu thi: "ứng dụng cần một địa chỉ IP cố định để các client allowlist" hoặc "lưu lượng UDP" → Global Accelerator (CloudFront chỉ HTTP/HTTPS).
- **Các tín hiệu AWS DataSync**: "di chuyển các file share NFS/SMB tới S3/EFS/FSx," "sao chép liên tục dữ liệu tệp on-premises," "di chuyển tệp dựa-trên-agent." DataSync không dành cho việc chuyển SFTP tương thích giao thức — nó dành cho di chuyển và sao chép file share hàng loạt.
- **Các tín hiệu AWS Transfer Family**: "quy trình SFTP hiện có," "các đối tác hoặc khách hàng tải lên tệp qua SFTP," "lift máy chủ SFTP lên cloud mà không thay đổi công cụ client," "SFTP/FTPS/FTP được hậu thuẫn bởi S3." Transfer Family không phải một công cụ di chuyển dữ liệu — nó là một endpoint giao thức được quản lý. Sự phân biệt: DataSync di chuyển dữ liệu hàng loạt theo lịch; Transfer Family cung cấp một endpoint SFTP/FTP luôn-bật cho các lần tải lên tệp liên tục.
- **MGN (Application Migration Service)**: "di chuyển hàng trăm VM nhanh chóng, không thay đổi code," "rehost / lift-and-shift các máy chủ lên EC2" → MGN (sao chép cấp khối, khởi chạy thử nghiệm, chuyển đổi sang các instance EC2 gốc). DataSync di chuyển *tệp*; DMS di chuyển *cơ sở dữ liệu*; MGN di chuyển *toàn bộ máy chủ*.

## Bài Tập

**Bài tập 1 — Ôn lại**

Giải thích sự khác biệt giữa AWS Site-to-Site VPN và AWS Direct Connect. Trong kịch bản nào bạn sẽ chọn từng cái?

*(Gợi ý: Hãy nghĩ về thời gian thiết lập, chi phí, tính nhất quán độ trễ, và các yêu cầu băng thông.)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty dịch vụ tài chính đòi hỏi một kết nối mạng riêng tư, được mã hóa, dành riêng từ trung tâm dữ liệu on-premises của họ tới AWS. Họ chuyển 500GB dữ liệu tài chính nhạy cảm hằng ngày. Kết nối phải có độ trễ nhất quán, có thể dự đoán và không được đi qua internet công cộng. Họ cũng cần một kết nối dự phòng trong trường hợp kết nối chính bị lỗi.

Kiến trúc nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Một kết nối Site-to-Site VPN với định tuyến BGP và một VPN thứ hai để dự phòng  
B) Một Direct Connect Hosted Connection với Direct Connect Gateway  
C) Hai kết nối Site-to-Site VPN qua các nhà cung cấp internet khác nhau  
D) Một kết nối Direct Connect với một Site-to-Site VPN làm backup

**Gợi ý 1**: "Không được đi qua internet công cộng" — lưu lượng VPN đi qua internet công cộng (được mã hóa). Chỉ Direct Connect là riêng tư.

**Gợi ý 2**: "Độ trễ nhất quán, có thể dự đoán" — hiệu suất VPN internet công cộng biến đổi. Direct Connect nhất quán.

**Gợi ý 3**: "Kết nối dự phòng" — cách tiếp cận được khuyến nghị là gì khi Direct Connect là kết nối chính?

**Đáp án**: D

**Giải thích**: Direct Connect cung cấp một kết nối riêng tư, dành riêng không đi qua internet công cộng — đáp ứng các yêu cầu về quyền riêng tư và độ trễ. Một Site-to-Site VPN làm backup cung cấp tính dự phòng: nếu mạch Direct Connect bị lỗi, lưu lượng chuyển sang VPN được mã hóa. Đây là mẫu HA tiêu chuẩn cho Direct Connect.

**Tại sao không phải A?** Lưu lượng Site-to-Site VPN đi qua internet công cộng, vi phạm yêu cầu "không được đi qua internet công cộng."

**Tại sao không phải B?** Một Hosted Connection cung cấp một kết nối Direct Connect nhưng lựa chọn B không bao gồm một backup. Direct Connect đơn lẻ không có backup là một điểm thất bại duy nhất — cáp quang vật lý có thể bị cắt.

**Tại sao không phải C?** Hai kết nối VPN qua các ISP khác nhau vẫn đi qua internet công cộng, dù được mã hóa. Không đáp ứng yêu cầu mạng riêng tư.

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Hiệu Năng Cao — Nhiệm vụ 3.4*

**Bài tập 3 — Thử thách Kiến trúc** *(Tùy chọn)*

Nimbus đang mở rộng để có các nhóm kỹ thuật khu vực ở Seattle, Berlin, và Singapore. Mỗi nhóm khu vực cần truy cập vào:

- Production VPC (chỉ đọc để debug)
- Staging VPC (quyền truy cập đầy đủ để kiểm thử)
- Analytics VPC (chỉ đọc để báo cáo)

Thiết kế kết nối mạng. Bạn sẽ dùng Transit Gateway không? Direct Connect ở mỗi region hay Site-to-Site VPN? Làm thế nào để bạn thực thi quyền chỉ đọc cho production? (Gợi ý: đây là cả một câu hỏi về mạng lẫn IAM.)

*(Không có một câu trả lời đúng duy nhất. Mục tiêu là luyện tập thiết kế mạng đa vùng, đa nhóm.)*

**Phần mở rộng**: Nhóm Berlin báo cáo rằng độ trễ VPN của họ tới production VPC (us-west-2) trung bình 160ms. Ở khối lượng dữ liệu nào thì Accelerated Site-to-Site VPN hoặc một Direct Connect Hosted Connection trở thành lựa chọn tốt hơn? Hãy nghiên cứu giá Direct Connect Hosted Connection hiện tại từ một Đối Tác AWS châu Âu. Liệu chỉ riêng sự cải thiện độ trễ có biện minh cho chi phí ở khối lượng dữ liệu bạn ước tính không?

## Cảnh Sau Tín Dụng

Quá trình di chuyển dữ liệu hoàn tất trong 8 ngày theo lịch — 3 ngày để Snowball Edge đến, 94 phút để sao chép dữ liệu, 4 ngày để AWS nhận thiết bị và nạp dữ liệu, rồi một lần đồng bộ cuối cùng của phần delta đã tích lũy trong khi Snowball đang trên đường vận chuyển. Thời gian thao tác trực tiếp cho toàn bộ việc này: dưới bốn giờ.

Bước cuối cùng đó quan trọng. Snowball Edge đã sao chép một snapshot tại-một-thời-điểm của bộ dữ liệu 4TB. Trong khi nó đang vận chuyển, cơ sở dữ liệu sản xuất vẫn tiếp tục chạy — các đơn hàng mới đang được đặt, các bản ghi mới đang được tạo. Lần đồng bộ delta qua VPN là 12GB, hoàn thành trong 18 phút.

"Lần truyền hàng loạt là Snowball," Leo nói. "Lần đồng bộ chỉ là dữ liệu hoàn-toàn-mới từ 8 ngày nó mất."

"Tôi đã triển khai nó rồi — à," Leo nói, theo dõi lần sao chép hoàn tất trên Snowball Edge sau 94 phút. "Lẽ ra tôi nên đặt giới hạn băng thông trên lần sao chép cục bộ để tránh làm bão hòa mạng văn phòng trong giờ làm việc."

Anh đã không đặt giới hạn. Internet văn phòng vẫn ổn — Snowball là một thao tác mạng cục bộ. Nhưng switch mạng tạm thời trở thành một nút cổ chai khi lần sao chép tiến gần đến thông lượng cục bộ 9 Gbps.

"Điểm mấu chốt," anh nói, sau khi sửa cài đặt giới hạn, "là thư tín vật lý nhanh hơn internet trên một khối lượng dữ liệu nhất định."

"Điều đó hoặc là hiển nhiên hoặc là phản trực giác," Maya nói, "tùy thuộc vào cách bạn nghĩ về nó."

"Lần tới," Leo nói, "chúng ta nên thiết lập một Direct Connect."

Tom không với lấy máy tính — anh đã làm phép toán từ trước rồi, khi Direct Connect lần đầu được nhắc đến: khoảng một nghìn một tháng, cổng cộng mạch.

"Với những gì chúng ta làm bây giờ, có lẽ không đáng. Nhưng nếu chúng ta bắt đầu chuyển hơn 10TB một tháng giữa văn phòng và AWS, khoản tiết kiệm chuyển dữ liệu trên Direct Connect sẽ bù đắp chi phí."

"Vậy chúng ta theo dõi khối lượng chuyển dữ liệu," Priya nói, "và xem xét lại khi nó vượt ngưỡng."

"Đó là kiến trúc có ý thức về chi phí," Tom nói.

"Đó luôn là vấn đề cốt lõi," Maya nói.

Priya đã theo dõi quá trình di chuyển từ phía bên kia phòng. "Lần tới chúng ta làm một việc như thế này," cô nói, "chúng ta có thể làm nó trước khi dữ liệu ở trong sản xuất và doanh nghiệp phụ thuộc vào nó không? Di chuyển dữ liệu trực tiếp luôn rủi ro hơn so với di chuyển dữ liệu ở trạng thái nghỉ."

"Nó không bao giờ ở trạng thái nghỉ khi doanh nghiệp đang hoạt động," Leo nói.

"Tôi biết," cô nói. "Đó chính là vấn đề. Hãy lên kế hoạch di chuyển trước khi bạn cần đến nó. Không phải sau."

Tom đã tính toán xem sẽ tốn bao nhiêu để có một bộ cơ sở hạ tầng thứ hai ở us-east-1 sẵn sàng tiếp nhận một lần di chuyển bất cứ lúc nào. Anh giữ con số đó cho riêng mình lúc này. Có những chương cấp bách hơn để khép lại.

Trong chương tiếp theo: điều gì xảy ra khi bạn có nhiều dữ liệu hơn bất kỳ cơ sở dữ liệu nào có thể lưu trữ một cách hợp lý, và bạn cần hiểu được tất cả.
