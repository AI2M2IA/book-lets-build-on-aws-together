# Chương 25: Con Đường Cao Tốc Riêng Tư

Đứng dậy một chút. Vẩy tay ra.

Chúng ta sẽ nói về việc di chuyển dữ liệu. Không phải giữa các dịch vụ trong AWS, mà giữa thế giới thực và AWS — giữa văn phòng của bạn và cơ sở hạ tầng cloud của bạn, giữa các lục địa.

Nhóm cơ sở hạ tầng của Nimbus (nay là bốn kỹ sư) làm việc từ một văn phòng chung ở Seattle. Họ cần truy cập vào cơ sở hạ tầng AWS mà họ quản lý. Một số thao tác cần kết nối với các tài nguyên trong VPC.

Hiện tại, họ sử dụng VPN trên laptop để truy cập bastion host trong public subnet, sau đó SSH đến các tài nguyên từ đó.

Nó hoạt động. Nó chậm. Kết nối VPN định tuyến qua internet công cộng: Seattle → cáp quang xuyên quốc gia → nhiều chặng nhà mạng → us-east-1. Mỗi vòng khứ hồi là 80+ mili giây.

"Đối với SSH hằng ngày, điều đó chấp nhận được," Leo nói. "Nhưng chúng ta sắp bắt đầu di chuyển cơ sở dữ liệu analytics. 4 terabyte dữ liệu đơn hàng lịch sử. Qua kết nối này, quá trình di chuyển sẽ mất vài tuần."

"Chúng ta cần kết nối tốt hơn," Maya nói.

"Kết nối riêng tư," Priya thêm vào. "Không qua internet công cộng."

Hãy nghĩ như việc đi làm. Site-to-Site VPN giống như lái xe trên đường công cộng: bạn khóa cửa xe (mã hóa), nhưng bạn vẫn chia sẻ làn đường với mọi người, và tắc đường làm chậm bạn một cách không thể đoán trước. Direct Connect giống như thuê một làn đường riêng tư dành riêng trên xa lộ — không có lưu lượng chia sẻ, tốc độ nhất quán, và phí hàng tháng cao hơn. Hầu hết các ngày đường công cộng là ổn. Khi bạn đang chuyển một xe tải đầy hàng hóa có giá trị theo lịch trình chặt chẽ, bạn trả tiền cho làn đường riêng.

**AWS Site-to-Site VPN: Lựa Chọn Nhanh**

**AWS Site-to-Site VPN** tạo ra một đường hầm được mã hóa giữa mạng on-premises của bạn và VPC của bạn, đi qua internet công cộng.

Thiết lập:

1. Tạo Virtual Private Gateway (VGW) gắn vào VPC của bạn
2. Tạo Customer Gateway đại diện cho bộ định tuyến on-premises của bạn
3. Thiết lập hai đường hầm VPN (để dự phòng) giữa chúng

Lưu lượng được mã hóa (AES-256). Nó đi qua internet công cộng, có nghĩa là độ trễ phụ thuộc vào điều kiện internet. AWS tự động cung cấp hai đường hầm để dự phòng — nếu một đường hầm gặp vấn đề, lưu lượng chuyển sang đường hầm kia.

**Khi nào sử dụng Site-to-Site VPN**:

- Thiết lập nhanh (phút đến giờ)
- Tiết kiệm chi phí ($0.05/giờ mỗi kết nối VPN)
- Băng thông: tối đa 1.25 Gbps mỗi đường hầm
- Độ trễ internet chấp nhận được cho trường hợp sử dụng

Đối với quá trình di chuyển 4TB của Nimbus, VPN dựa trên internet ở tốc độ tối đa 1.25 Gbps sẽ mất: 4TB / 1.25 Gbps ≈ 7 giờ tối thiểu, với chi phí thực tế gần hơn 12-20 giờ. Chấp nhận được, nhưng tắc nghẽn trên đường dẫn internet công cộng làm nó không thể đoán trước.

"Lựa chọn khác là gì?" Tom hỏi.

**AWS Direct Connect: Đường Dây Dành Riêng**

**AWS Direct Connect** thiết lập kết nối mạng riêng tư, dành riêng giữa vị trí của bạn (hoặc cơ sở colocation của bạn) và AWS. Lưu lượng không bao giờ chạm vào internet công cộng.

Direct Connect là kết nối vật lý — một đường cáp quang từ mạng của bạn đến vị trí AWS Direct Connect. Bạn làm việc với nhà cung cấp viễn thông để thiết lập mạch vật lý. AWS cung cấp cổng ở phía của họ.

**Lợi ích**:

- Độ trễ nhất quán, có thể dự đoán (không có biến động internet công cộng)
- Tốc độ từ 50 Mbps đến 100 Gbps
- Chi phí chuyển dữ liệu thấp hơn so với internet (tỷ lệ chuyển dữ liệu Direct Connect rẻ hơn tỷ lệ chuyển dữ liệu ra AWS tiêu chuẩn)
- Bảo mật hơn (mạch riêng tư, không phải internet công cộng)

**Đánh đổi**:

- Thiết lập mất vài tuần đến vài tháng (cấp phát cơ sở hạ tầng vật lý)
- Chi phí cao hơn đáng kể so với VPN ($0.025-0.30/giờ mỗi cổng, cộng chi phí mạch viễn thông — thường tối thiểu $500-1000+/tháng)
- Không có dự phòng tích hợp sẵn (bạn tự thiết lập các mạch dự phòng)
- Không phù hợp cho các văn phòng phân tán địa lý mà không có nhiều mạch

Đối với Nimbus: Direct Connect là quá mức cần thiết cho quy mô hiện tại của họ. Nhưng đối với các doanh nghiệp có khối lượng chuyển dữ liệu đáng kể hoặc yêu cầu tuân thủ về kết nối mạng riêng tư, Direct Connect tự bù đắp chi phí.

**Hosted Connections: Điểm Trung Gian**

Không phải mọi tổ chức đều có thể cam kết với một mạch cáp quang dành riêng 100 Gbps. **Direct Connect Hosted Connections** cho phép các Đối Tác AWS Direct Connect (các công ty viễn thông được chấp thuận) cấp phát các kết nối dưới 1Gbps mà bạn chia sẻ với các khách hàng khác.

Thiết lập nhanh hơn (ngày đến tuần, không phải tháng) và chi phí thấp hơn kết nối dành riêng. Đánh đổi: năng lực chia sẻ có nghĩa là thông lượng kém nhất quán hơn.

Đối với Nimbus (khi họ tăng trưởng): một kết nối hosted 500 Mbps qua đối tác sẽ cung cấp kết nối riêng tư ở mức giá hợp lý.

**AWS Transit Gateway: Hub-and-Spoke cho VPCs**

Khi Nimbus phát triển, họ sẽ tích lũy nhiều VPC: production VPC, staging VPC, analytics VPC, security tooling VPC.

Không có kế hoạch cẩn thận, việc kết nối các VPC này đòi hỏi một mạng lưới đầy đủ các kết nối VPC peering. Cho 4 VPC: 6 kết nối peering. Cho 10 VPC: 45 kết nối peering. Cho 20 VPC: 190 kết nối. Điều này không có khả năng mở rộng.

**AWS Transit Gateway** là một hub mạng kết nối nhiều VPC và mạng on-premises. Thay vì một mạng lưới các kết nối peering, mỗi VPC kết nối đến Transit Gateway. Transit Gateway định tuyến lưu lượng giữa chúng.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Định tuyến bắc cầu**: Nếu VPC A và VPC B đều kết nối đến Transit Gateway, chúng có thể giao tiếp — mà không cần kết nối peer trực tiếp. Transit Gateway xử lý việc định tuyến. Không giống như VPC peering (không bắc cầu), Transit Gateway cho phép cấu trúc hub-and-spoke.

**Chi phí Transit Gateway**: tính phí cho mỗi attachment (kết nối VPC hoặc VPN/Direct Connect) cộng với mỗi GB dữ liệu được xử lý. Ở quy mô lớn, điều này đáng giá cho sự đơn giản hóa.

**VPC Endpoints: Truy Cập Riêng Tư Đến Các Dịch Vụ AWS**

Một vấn đề chi phí và bảo mật tinh tế: khi instance EC2 của bạn (trong private subnet) gọi API S3, lưu lượng đó định tuyến qua NAT Gateway (để đến internet, nơi endpoint công khai của S3 là). Bạn trả tiền cho việc xử lý NAT Gateway.

**VPC Endpoints** cho phép các tài nguyên trong VPC của bạn giao tiếp với các dịch vụ AWS một cách riêng tư, mà không đi qua internet công cộng — và không có NAT Gateway.

Hai loại:

**Gateway endpoints** (miễn phí): Cho S3 và DynamoDB. Bạn thêm một tuyến đường trong bảng định tuyến của mình chuyển hướng lưu lượng S3 hoặc DynamoDB đến endpoint thay vì NAT Gateway. Miễn phí để tạo; miễn phí để sử dụng.

**Interface endpoints** (có giá): Cho các dịch vụ AWS khác (SQS, SNS, Secrets Manager, SSM, v.v.). Tạo một ENI (Elastic Network Interface) trong subnet của bạn với IP riêng tư. Lưu lượng đến dịch vụ sử dụng IP riêng tư này. Chi phí ~$0.01/giờ mỗi AZ cộng xử lý dữ liệu.

Tom ngay lập tức tạo Gateway endpoints cho S3 và DynamoDB sau khi biết chúng miễn phí. Phí xử lý dữ liệu NAT Gateway giảm 30%.

**AWS Global Accelerator: Định Tuyến Tại Edge**

Khi Nimbus phục vụ người dùng Bờ Tây từ us-east-1 (Virginia), độ trễ là 80ms. Không phải vì máy chủ quá xa, mà vì việc định tuyến internet công cộng giữa Seattle và Virginia không tối ưu, đi qua nhiều mạng nhà mạng.

**AWS Global Accelerator** sử dụng mạng backbone riêng tư của AWS (cùng cơ sở hạ tầng hỗ trợ CloudFront) để định tuyến lưu lượng giữa người dùng và các ứng dụng AWS. Thay vì định tuyến internet công cộng, lưu lượng vào mạng AWS tại vị trí edge gần nhất và di chuyển theo đường dẫn riêng tư được tối ưu hóa đến ứng dụng của bạn.

Đối với Nimbus, một người dùng ở Seattle sẽ:

- **Không có Global Accelerator**: Định tuyến qua các nhà mạng internet công cộng → ~80ms
- **Với Global Accelerator**: Chạm vào AWS edge gần nhất ở Seattle → di chuyển qua backbone AWS → đến us-east-1 → ~45ms

Global Accelerator không cache nội dung (đó là CloudFront). Nó tối ưu hóa đường dẫn mạng cho các yêu cầu động.

**Khi Nào Dùng Global Accelerator vs CloudFront**:

- CloudFront: nội dung tĩnh và có thể cache, trường hợp sử dụng CDN
- Global Accelerator: nội dung động, các giao thức không phải HTTP (UDP, gaming, IoT), hoặc khi bạn cần một địa chỉ IP Anycast tĩnh

## Điểm Mạnh và Hạn Chế

**Site-to-Site VPN**:

- Thiết lập nhanh, chi phí thấp
- Đường dẫn internet công cộng có nghĩa là độ trễ biến đổi
- Giới hạn băng thông có hạn

**Direct Connect**:

- Nhất quán, riêng tư, băng thông cao
- Thiết lập chậm, chi phí định kỳ đáng kể
- Mạch vật lý là điểm thất bại duy nhất (thêm dự phòng)

**Transit Gateway**:

- Đơn giản hóa đáng kể kết nối đa VPC
- Định tuyến bắc cầu (không giống VPC peering)
- Chi phí cộng dồn cho nhiều attachment

**VPC Endpoints**:

- Lợi ích bảo mật và chi phí cho S3/DynamoDB (gateway endpoint miễn phí)
- Loại bỏ chi phí NAT Gateway cho lưu lượng dịch vụ AWS

**Global Accelerator**:

- Cải thiện độ trễ ứng dụng động cho người dùng toàn cầu
- IP Anycast cố định (không giống IP động của CloudFront)
- Chi phí bổ sung ($0.025/giờ mỗi accelerator + chuyển dữ liệu)

## Tóm Tắt

- **Site-to-Site VPN**: Đường hầm được mã hóa qua internet công cộng giữa on-premises và VPC. Thiết lập nhanh, chi phí thấp hơn, độ trễ biến đổi.
- **Direct Connect**: Kết nối cáp quang riêng tư, dành riêng đến AWS. Độ trễ có thể dự đoán, băng thông cao hơn, mất vài tuần để thiết lập, chi phí đáng kể.
- **Transit Gateway**: Hub cho kết nối VPC và on-premises. Cho phép định tuyến bắc cầu. Mở rộng đến hàng trăm kết nối.
- **VPC Endpoints**: Truy cập riêng tư đến các dịch vụ AWS mà không có NAT Gateway. Gateway endpoints (S3, DynamoDB) miễn phí.
- **Global Accelerator**: Định tuyến lưu lượng động qua backbone AWS để có độ trễ thấp hơn, nhất quán hơn trên toàn cầu.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Hiệu Suất Cao (Domain 3, Task 3.4)*

- **Tín hiệu VPN vs Direct Connect**: VPN = "mã hóa lưu lượng đến VPC," "thiết lập nhanh," "nhạy cảm về chi phí." Direct Connect = "độ trễ thấp nhất quán," "chuyển dữ liệu lớn," "kết nối riêng tư," "tuân thủ yêu cầu mạng riêng tư."
- **Transit Gateway vs VPC Peering**: Peering không bắc cầu (A→B→C không cho phép A→C). Transit Gateway bắc cầu. "Nhiều VPC cần giao tiếp" → Transit Gateway.
- **VPC Gateway Endpoints**: Miễn phí. Chỉ S3 và DynamoDB. Thay đổi bảng định tuyến. Không tốn thêm chi phí. Kịch bản kỳ thi: "giảm chi phí chuyển dữ liệu cho truy cập S3 từ private subnet" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = nội dung động, non-HTTP, IP tĩnh, tối ưu hóa mạng. CloudFront = caching, nội dung HTTP, CDN.
- **Direct Connect + VPN**: Bạn có thể sử dụng VPN làm backup cho kết nối Direct Connect. Nếu mạch Direct Connect bị lỗi, lưu lượng chuyển sang VPN. Đắt hơn chỉ VPN, đáng tin cậy hơn chỉ Direct Connect.
- **Direct Connect Gateway**: Kết nối mạch Direct Connect đến nhiều VPC trên nhiều region hoặc account. Không có nó, một mạch Direct Connect kết nối đến một VGW trong một region.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích sự khác biệt giữa AWS Site-to-Site VPN và AWS Direct Connect. Trong kịch bản nào bạn sẽ chọn từng cái?

*(Gợi ý: Hãy nghĩ về thời gian thiết lập, chi phí, tính nhất quán độ trễ, và yêu cầu băng thông.)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Một công ty dịch vụ tài chính yêu cầu kết nối mạng riêng tư, được mã hóa, dành riêng từ trung tâm dữ liệu on-premises của họ đến AWS. Họ chuyển 500GB dữ liệu tài chính nhạy cảm hằng ngày. Kết nối phải có độ trễ nhất quán, có thể dự đoán và không được đi qua internet công cộng. Họ cũng cần kết nối dự phòng trong trường hợp kết nối chính bị lỗi.

Kiến trúc nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Kết nối Site-to-Site VPN với định tuyến BGP và VPN thứ hai để dự phòng  
B) Kết nối Direct Connect với Site-to-Site VPN làm backup  
C) Hai kết nối Site-to-Site VPN qua các nhà cung cấp internet khác nhau  
D) Kết nối Direct Connect Hosted với Direct Connect Gateway

**Gợi ý 1**: "Không được đi qua internet công cộng" — lưu lượng VPN đi qua internet công cộng (được mã hóa). Chỉ Direct Connect là riêng tư.

**Gợi ý 2**: "Độ trễ nhất quán, có thể dự đoán" — hiệu suất VPN internet công cộng biến đổi. Direct Connect nhất quán.

**Gợi ý 3**: "Kết nối dự phòng" — cách tiếp cận được khuyến nghị là gì khi Direct Connect là kết nối chính?

**Đáp án**: B

**Giải thích**: Direct Connect cung cấp kết nối riêng tư, dành riêng không đi qua internet công cộng — đáp ứng yêu cầu về quyền riêng tư và độ trễ. Site-to-Site VPN làm backup cung cấp tính dự phòng: nếu mạch Direct Connect bị lỗi, lưu lượng chuyển sang VPN được mã hóa. Đây là mẫu HA tiêu chuẩn cho Direct Connect.

**Tại sao không phải A?** Lưu lượng Site-to-Site VPN đi qua internet công cộng, vi phạm yêu cầu "không được đi qua internet công cộng."

**Tại sao không phải C?** Hai kết nối VPN qua các ISP khác nhau vẫn đi qua internet công cộng, dù được mã hóa. Không đáp ứng yêu cầu mạng riêng tư.

**Tại sao không phải D?** Một Hosted Connection cung cấp kết nối Direct Connect nhưng lựa chọn D không bao gồm backup. Direct Connect đơn lẻ không có backup là điểm thất bại duy nhất — cáp quang vật lý có thể bị đứt.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Hiệu Suất Cao — Task 3.4*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Nimbus đang mở rộng để có các nhóm kỹ thuật khu vực ở Seattle, Berlin và Singapore. Mỗi nhóm khu vực cần truy cập vào:

- Production VPC (chỉ đọc để debug)
- Staging VPC (quyền truy cập đầy đủ để kiểm thử)
- Analytics VPC (chỉ đọc để báo cáo)

Thiết kế kết nối mạng. Bạn sẽ dùng Transit Gateway không? Direct Connect ở mỗi region hay Site-to-Site VPN? Làm thế nào để thực thi quyền chỉ đọc cho production? (Gợi ý: đây là cả câu hỏi về mạng lẫn IAM.)

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành thiết kế mạng đa vùng, đa nhóm.)*

## Cảnh Sau Tín Dụng

Quá trình di chuyển dữ liệu hoàn tất trong 14 giờ.

Không phải qua đường dẫn internet công cộng chậm — Leo đã sử dụng AWS Snow Family (các thiết bị lưu trữ vật lý được gửi đến và từ AWS) cho phần lớn dữ liệu, sau đó đồng bộ phần delta còn lại qua VPN.

"Lần tới," anh nói, "chúng ta nên thiết lập Direct Connect."

Tom tra giá.

"Một cổng 1Gbps dành riêng là $216/tháng," anh nói. "Cộng với mạch từ văn phòng của chúng ta, mà một công ty viễn thông báo giá $800/tháng."

"Vậy tổng khoảng một nghìn một tháng."

"Với những gì chúng ta làm bây giờ, có lẽ không đáng. Nhưng nếu chúng ta bắt đầu chuyển hơn 10TB mỗi tháng giữa văn phòng và AWS, tiết kiệm chuyển dữ liệu trên Direct Connect sẽ bù đắp chi phí."

"Vậy chúng ta theo dõi khối lượng chuyển dữ liệu," Priya nói, "và xem xét lại khi nó vượt ngưỡng."

"Đó là kiến trúc có ý thức về chi phí," Tom nói.

"Đó luôn là vấn đề cốt lõi," Maya nói.

Trong chương tiếp theo: điều gì xảy ra khi bạn có nhiều dữ liệu hơn bất kỳ cơ sở dữ liệu nào có thể lưu trữ hợp lý, và bạn cần hiểu tất cả.
