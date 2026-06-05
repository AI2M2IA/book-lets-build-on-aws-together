# Chương 30: Chi Phí Ẩn

Chi phí lưu trữ xuất hiện như một dòng: "S3: $198." Chi phí tính toán xuất hiện như một dòng: "EC2: $2,340." Chi phí mạng phân tán trên một chục mục hóa đơn với các tên như "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer," và "CloudFront Data Transfer." Hầu hết các kỹ sư cộng chúng lại một lần, nháy mắt, và cộng lại lần nữa.

Tom đã nói: "Chi phí mạng. Đó là phần tiếp theo."

Anh mở hóa đơn lên. Tìm phần chuyển dữ liệu. Cộng tất cả các mục hóa đơn.

Chi phí mạng trong AWS giống như hệ thống thu phí của một thành phố: lái xe vào thành phố miễn phí, nhưng mỗi đường hầm bạn đi ra trả tiền, và lái xe giữa các khu phố cũng tốn một ít. Hầu hết mọi người không nghĩ về các khoản thu phí cho đến khi họ nhận được hóa đơn vào cuối tháng và nhận ra họ đã đi qua đường hầm mỗi ngày khi có một con đường bề mặt miễn phí suốt thời gian. Mục tiêu của chương này là hiểu mọi trạm thu phí — và quyết định cái nào đáng trả.

$847/tháng.

"Chúng ta đang chi $847 một tháng cho chuyển dữ liệu," anh nói.

"Nhiều không?" Leo hỏi.

"Nhiều hơn hóa đơn S3 của chúng ta trước khi chúng ta tối ưu hóa nó. Và tôi thậm chí không biết chúng ta có hóa đơn chuyển dữ liệu với quy mô này."

Maya nhìn qua. "Chuyển dữ liệu chính xác là gì?"

"Đó là những gì AWS tính phí cho việc di chuyển byte. Byte vào AWS: thường miễn phí. Byte ra khỏi AWS đến internet: tính phí. Byte giữa các dịch vụ ở các region khác nhau: tính phí. Byte đi qua NAT Gateway: tính phí."

"Bạn có thể phân tích chi tiết không?"

Tom có thể. Và những gì anh tìm thấy đã thay đổi cách nhóm nghĩ về kiến trúc của họ.

**Cách AWS Tính Phí Chuyển Dữ Liệu**

Giá chuyển dữ liệu của AWS là bất đối xứng:

**Vào AWS (inbound)**: Miễn phí. Bạn có thể tải lên bao nhiêu dữ liệu tùy muốn.

**Ra khỏi AWS đến internet (outbound)**: Tính phí. 100GB/tháng đầu tiên miễn phí. Sau đó:

- $0.09/GB cho 10TB/tháng đầu tiên (các region Mỹ)
- $0.085/GB cho 40TB tiếp theo
- Thấp hơn ở khối lượng cao hơn

**Trong cùng Availability Zone**: Miễn phí. Các instance EC2 nói chuyện với nhau trong cùng AZ không trả gì.

**Giữa các Availability Zone (cùng region)**: $0.01/GB mỗi chiều. Chi phí nhỏ nhưng thực.

**Giữa các Region**: $0.02-0.08/GB tùy thuộc vào region. Lưu lượng cross-region đắt hơn đáng kể.

**NAT Gateway**: $0.045/GB được xử lý. Mỗi byte instance EC2 riêng tư của bạn gửi qua NAT Gateway để đến internet — và mỗi byte trả về — đều bị tính phí.

**CloudFront**: Tỷ lệ chuyển dữ liệu thấp hơn so với trực tiếp AWS-to-internet. $0.085/GB cho 10TB đầu tiên (ít hơn một chút so với chuyển dữ liệu ra trực tiếp). CloudFront thường giảm tổng chi phí chuyển vì cache edge của nó có nghĩa là origin phục vụ dữ liệu ít thường xuyên hơn.

**Phân Tích Của Tom**

Sau khi phân loại từng mục hóa đơn:

**Dữ liệu outbound đến internet**: $214/tháng

- Phản hồi API đến khách hàng toàn cầu
- Cache fills CloudFront (khi các edge location fetch từ origin)

**Xử lý NAT Gateway**: $289/tháng

- Máy chủ ứng dụng gọi API bên ngoài (bộ xử lý thanh toán, dịch vụ email, dữ liệu bản đồ)
- Các cuộc gọi DynamoDB đi qua NAT Gateway (trước khi VPC endpoints được thiết lập cho một số bảng)

**Chuyển dữ liệu Cross-AZ**: $178/tháng

- Bộ cân bằng tải đến instance EC2 (bộ cân bằng tải ở một AZ, một số instance ở AZ khác)
- Máy chủ ứng dụng đến RDS read replica (ở AZ khác)

**Chuyển dữ liệu Cross-Region**: $166/tháng

- Sao chép Aurora Global Database (primary ở us-east-1, reader ở us-west-2)
- S3 Cross-Region Replication để backup

**NAT Gateway: Điều Ngạc Nhiên Lớn Nhất**

$289/tháng trong phí xử lý NAT Gateway là mục lớn nhất. Và một phần không cần thiết.

Trong Chương 11, Tom đã thiết lập VPC Gateway Endpoints cho S3 và DynamoDB. Những cái này miễn phí. Nhưng anh đã bỏ lỡ việc thiết lập Interface Endpoints cho một số dịch vụ khác:

- Systems Manager (SSM) để quản lý patch
- Secrets Manager để lấy thông tin xác thực
- CloudWatch để gửi chỉ số và nhật ký
- SQS để polling tin nhắn

Mỗi cuộc gọi đến các dịch vụ này từ các instance EC2 riêng tư đang đi qua NAT Gateway. Mỗi cuộc gọi tính phí $0.045/GB.

**Interface Endpoints** cho các dịch vụ này: $0.01/giờ mỗi AZ + $0.01/GB dữ liệu được xử lý.

Ở khối lượng của Nimbus, SSM Interface Endpoint sẽ tốn khoảng $15/tháng và tiết kiệm khoảng $43/tháng trong phí NAT Gateway (vì SSM tạo ra khối lượng dữ liệu đáng kể cho quản lý patch và các cuộc gọi parameter store).

Chi phí và tiết kiệm endpoint biến đổi theo dịch vụ và khối lượng. Tom tính toán rằng việc thiết lập Interface Endpoints cho bốn dịch vụ lưu lượng cao sẽ tốn $62/tháng và tiết kiệm khoảng $140/tháng trong xử lý NAT Gateway.

Tiết kiệm ròng: $78/tháng chỉ từ thiết lập endpoint.

**Lưu Lượng Cross-AZ: Câu Hỏi Kiến Trúc**

$178/tháng trong chuyển dữ liệu cross-AZ khó xử lý hơn.

Một phần là không thể tránh khỏi: bộ cân bằng tải phân phối lưu lượng trên các AZ, vì vậy một số yêu cầu bắt nguồn từ một AZ và bộ cân bằng tải chuyển tiếp chúng đến instance ở AZ khác.

Một phần có thể tối ưu hóa: ứng dụng được cấu hình để ghi vào RDS primary (ở us-east-1a) và đọc từ read replica (ở us-east-1b). Mỗi truy vấn đọc vượt qua ranh giới AZ.

Đối với lượng đọc, một giải pháp: cấu hình ứng dụng để ưu tiên read replica trong cùng AZ với instance yêu cầu. Mỗi AZ nhận read replica riêng. Lưu lượng giữ nguyên trong nội bộ.

Đánh đổi: nhiều read replica hơn = chi phí nhiều hơn. Nếu chi phí lưu lượng cross-AZ là $50/tháng và một read replica bổ sung tốn $190/tháng, tối ưu hóa AZ-local không có lợi.

Tom tính toán: ở khối lượng truy vấn hiện tại của họ, lưu lượng cross-AZ chỉ là $31/tháng trong tổng $178. Không đáng thêm replica vì điều này.

Các chi phí cross-AZ khác là định tuyến bộ cân bằng tải và giao tiếp service-to-service — phần lớn không thể tránh ở cấp độ kiến trúc hiện tại.

"Đây là một trong những trường hợp mà hiểu chi phí không có nghĩa là bạn nên sửa nó," Tom nói.

"Chi phí để loại bỏ hoàn toàn lưu lượng cross-AZ là bao nhiêu?" Maya hỏi.

"Tất cả trong một AZ đánh bại mục đích của Multi-AZ. Đó là tiết kiệm $31/tháng với cái giá mất tính khả dụng cao."

"Vậy chúng ta để nguyên," cô nói.

"Chúng ta để nguyên."

Đây là cuộc trò chuyện chi phí trưởng thành: đôi khi bạn trả cho thứ gì đó vì lựa chọn thay thế tốn nhiều hơn về rủi ro.

**CloudFront: Giảm Giá Chuyển Dữ Liệu**

Đây là một thực tế phản trực giác: phục vụ dữ liệu qua CloudFront nói chung rẻ hơn phục vụ trực tiếp từ EC2 hoặc S3.

**EC2 trực tiếp đến internet**: $0.09/GB
**CloudFront đến internet**: $0.085/GB (rẻ hơn một chút)

Nhưng tiết kiệm thực sự không phải ở tỷ lệ mỗi GB — mà ở chỗ CloudFront cache dữ liệu tại các edge location. Nếu 1,000 người dùng yêu cầu cùng một ảnh menu:

- **Không có CloudFront**: 1,000 yêu cầu chạm vào origin S3 × kích thước ảnh × $0.09/GB
- **Với CloudFront**: 1 yêu cầu chạm vào S3 (cache miss) + 999 yêu cầu được phục vụ từ edge cache ở tỷ lệ CloudFront

Đối với Nimbus với tỷ lệ cache hit 83% (từ Chương 13), họ đang phục vụ 83% yêu cầu từ edge cache. Chuyển dữ liệu origin thực tế là 17% tổng yêu cầu — 83% lưu lượng "outbound" của họ được cache tại edge.

"CloudFront không chỉ là CDN cho hiệu suất," Tom nói. "Nó cũng là tối ưu hóa chi phí cho chuyển dữ liệu."

Leo có vẻ suy nghĩ. "Chúng ta nên chuyển tất cả phân phối nội dung tĩnh qua CloudFront, ngay cả cho các asset không nhạy cảm về độ trễ."

"Đúng vậy. Nếu người dùng đang tải nó từ AWS, nó nên đi qua CloudFront."

**S3 Select: Giảm Chuyển Dữ Liệu Trong Truy Vấn**

Một tối ưu hóa tinh tế: **S3 Select** cho phép bạn chỉ lấy các hàng và cột bạn cần từ một S3 object (CSV, JSON, Parquet), thay vì tải toàn bộ tệp để lọc trong ứng dụng của bạn.

Không có S3 Select:
```python
# Tải xuống tệp 500MB, xử lý trong bộ nhớ
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Với S3 Select:
```python
# Để S3 lọc trước, chỉ chuyển các hàng khớp (~2MB thay vì 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select giảm dữ liệu được chuyển từ S3 đến ứng dụng của bạn. Đối với các tệp lớn với các truy vấn chọn lọc, điều này có thể giảm khối lượng dữ liệu từ 10-100 lần — và do đó chi phí.

**Tối Ưu Hóa Mạng Đầy Đủ**

Sau ba tuần phân tích và triển khai:

| Mục Chi Phí                                      | Trước    | Sau      | Tiết Kiệm Hàng Tháng |
|---------------------------------------------------|----------|----------|----------------------|
| NAT Gateway (Interface Endpoints)                 | $289     | $211     | $78                  |
| Tối ưu hóa CloudFront (chuyển thêm asset)         | $214     | $147     | $67                  |
| Lưu lượng Cross-AZ (chấp nhận như cũ)             | $178     | $178     | $0                   |
| Lưu lượng Cross-Region (chấp nhận như cũ)         | $166     | $166     | $0                   |
| **Tổng**                                          | **$847** | **$702** | **$145/tháng**       |

$145/tháng, $1,740/năm tiết kiệm mạng. Khiêm tốn so với tính toán và lưu trữ, nhưng có ý nghĩa.

Quan trọng hơn: Tom bây giờ hiểu mọi dòng của hóa đơn mạng. Anh có thể giải thích từng chi phí và đã có ý thức quyết định cái nào sẽ tối ưu hóa và cái nào chấp nhận.

## Điểm Mạnh và Hạn Chế

**Chi phí NAT Gateway**:

- Khối lượng dữ liệu lớn qua NAT Gateway tích lũy nhanh
- VPC Endpoints loại bỏ hoàn toàn một số chi phí NAT
- Xem xét dịch vụ nào instance riêng tư của bạn gọi và liệu endpoints có sẵn không

**CloudFront để tiết kiệm chi phí**:

- Tỷ lệ cache hit trực tiếp xác định tiết kiệm chi phí
- Tỷ lệ cache hit cao = chuyển origin thấp hơn + tổng chi phí chuyển thấp hơn
- Chuyển tất cả phân phối asset tĩnh qua CloudFront

**Đánh đổi Cross-AZ**:

- Loại bỏ lưu lượng cross-AZ thường đòi hỏi thay đổi kiến trúc tốn nhiều hơn tiết kiệm
- Tính toán cẩn thận trước khi tối ưu hóa

**S3 Select**:

- Tiết kiệm đáng kể cho các truy vấn chọn lọc trên S3 object lớn
- Không giúp ích khi bạn cần toàn bộ tệp

Trong chương tiếp theo: khung sáu trụ cột đặt ra các câu hỏi mọi cuộc xem xét kiến trúc nên bắt đầu.

## Tóm Tắt

- AWS tính phí cho **dữ liệu outbound** (internet: ~$0.09/GB), **lưu lượng cross-AZ** ($0.01/GB mỗi chiều), **lưu lượng cross-region** ($0.02-0.08/GB), và **xử lý NAT Gateway** ($0.045/GB).
- **Dữ liệu inbound** miễn phí. **Lưu lượng cùng AZ** miễn phí.
- **VPC Gateway Endpoints** (S3, DynamoDB): Miễn phí. Loại bỏ chi phí NAT Gateway cho các dịch vụ này.
- **VPC Interface Endpoints**: Tính phí theo giờ cộng mỗi GB. Rẻ hơn NAT Gateway cho các dịch vụ lưu lượng cao.
- **CloudFront** phục vụ dữ liệu ở tỷ lệ thấp hơn so với EC2-to-internet trực tiếp và giảm đáng kể khối lượng chuyển origin thông qua caching.
- **S3 Select** giảm chuyển dữ liệu từ S3 bằng cách lọc tại nguồn.
- Một số chi phí mạng là đánh đổi kiến trúc (cross-AZ cho HA) — hiểu chúng, đừng luôn loại bỏ chúng.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Domain 4, Task 4.4)*

- **NAT Gateway vs VPC Endpoints**: Kịch bản kỳ thi: "EC2 trong private subnet thường xuyên gọi S3/DynamoDB — cách giảm chi phí NAT Gateway?" → VPC Gateway Endpoints (miễn phí cho S3 và DynamoDB).
- **Quy tắc giá chuyển dữ liệu**:
  - Vào AWS: miễn phí
  - Cùng AZ: miễn phí
  - Cross-AZ: tính phí
  - Cross-region: tính phí (tỷ lệ cao hơn)
  - Internet: tính phí (tỷ lệ đáng kể)
- **CloudFront để tối ưu chi phí**: "Giảm chi phí chuyển dữ liệu cho phân phối nội dung toàn cầu" → CloudFront. Lớp cache giảm yêu cầu origin.
- **S3 Transfer Acceleration**: Tăng tốc tải lên *đến* S3 sử dụng các edge location CloudFront. Chi phí cao hơn S3 tiêu chuẩn. Dùng cho khách hàng tải lên các tệp lớn từ vị trí địa lý xa.
- **Chi phí sao chép cross-region**: Sao chép dữ liệu trên các region phát sinh phí chuyển dữ liệu. Đối với S3 CRR, bạn trả cả tỷ lệ chuyển dữ liệu ra lẫn chi phí yêu cầu S3.
- **PrivateLink (VPC Interface Endpoints)**: Cung cấp kết nối riêng tư đến các dịch vụ AWS và các dịch vụ được lưu trữ bởi các khách hàng AWS khác. Bảo mật hơn qua NAT, thường rẻ hơn cho các dịch vụ lưu lượng cao.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích sự khác biệt giữa VPC Gateway Endpoint và VPC Interface Endpoint. Mỗi cái khả dụng cho những dịch vụ AWS nào, và chi phí của mỗi cái là bao nhiêu?

*(Gợi ý: Gateway Endpoints miễn phí nhưng chỉ cho S3 và DynamoDB. Interface Endpoints tính phí theo giờ nhưng hoạt động cho hầu hết các dịch vụ AWS khác.)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Ứng dụng của một công ty chạy trên các instance EC2 trong private subnets. Các instance thực hiện các cuộc gọi API thường xuyên đến Amazon SQS và Amazon S3. Hiện tại, tất cả lưu lượng thoát qua NAT Gateway. Nhóm muốn giảm chi phí NAT Gateway. Bảo mật dữ liệu phải được duy trì — không có lưu lượng nào nên đi qua internet công cộng.

Cách tiếp cận nào đáp ứng TỐT NHẤT các yêu cầu này với chi phí liên tục tối thiểu?

A) Tạo Gateway Endpoint cho SQS và Gateway Endpoint cho S3  
B) Tạo Interface Endpoint cho SQS và Gateway Endpoint cho S3  
C) Tạo Interface Endpoints cho cả SQS và S3  
D) Loại bỏ NAT Gateway và sử dụng internet gateway trực tiếp cho các cuộc gọi API

**Gợi ý 1**: Gateway Endpoints chỉ khả dụng cho S3 và DynamoDB.

**Gợi ý 2**: Interface Endpoints khả dụng cho SQS và nhiều dịch vụ khác (nhưng tốn tiền).

**Gợi ý 3**: Internet Gateway trong bảng định tuyến private subnet sẽ biến nó thành public subnet — vi phạm yêu cầu bảo mật.

**Đáp án**: B

**Giải thích**: S3 sử dụng Gateway Endpoint (miễn phí). SQS yêu cầu Interface Endpoint (có tính phí). Sự kết hợp này loại bỏ chi phí xử lý dữ liệu NAT Gateway cho cả hai dịch vụ. Tất cả lưu lượng giữ nguyên trong mạng riêng tư của AWS — không có đường đi qua internet công cộng.

**Tại sao không phải A?** Gateway Endpoints không khả dụng cho SQS. Chỉ S3 và DynamoDB có Gateway Endpoints.

**Tại sao không phải C?** Mặc dù điều này hoạt động, sử dụng Interface Endpoint cho S3 (thay vì Gateway Endpoint miễn phí) phát sinh phí theo giờ không cần thiết. Luôn sử dụng Gateway Endpoint miễn phí cho S3 và DynamoDB.

**Tại sao không phải D?** Thêm route đến Internet Gateway từ private subnet biến nó thành public subnet. Các instance EC2 trong private subnet thường không có Elastic IP, vì vậy chúng thực sự không thể định tuyến qua Internet Gateway mà không có thay đổi bổ sung — và làm vậy sẽ để lộ chúng với lưu lượng internet inbound.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Task 4.4*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Người dùng Bờ Tây của Nimbus tạo ra lưu lượng đáng kể. Ứng dụng phục vụ họ từ us-east-1 (Virginia). Hiện tại:

- Phản hồi API đi trực tiếp từ instance EC2 us-east-1 đến người dùng Bờ Tây (~80ms, $0.09/GB)
- Ảnh menu đi từ S3 us-east-1 qua CloudFront edge ở Seattle (~8ms sau khi cache)

Nhóm đang xem xét thêm một region ứng dụng thứ hai ở us-west-2 (Oregon) cho người dùng Bờ Tây để giảm độ trễ API.

Phân tích chi phí chuyển dữ liệu của sự thay đổi này. Chi phí chuyển dữ liệu cross-region mới nào mà thiết lập dual-region sẽ phát sinh? Liệu định tuyến dựa trên độ trễ Route 53 có giảm hay tăng tổng chi phí chuyển? Trong điều kiện nào (khối lượng lưu lượng, độ nhạy cảm độ trễ) thiết lập dual-region sẽ có hiệu quả?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành phân tích chi phí-lợi ích đa vùng.)*

## Cảnh Sau Tín Dụng

Tom đóng phân tích mạng lại.

Tổng tác động dự án tối ưu hóa ba tháng:

- EC2 Savings Plans: -$14,200/năm
- Lưu trữ (S3 + EBS): -$6,200/năm
- Tầng cơ sở dữ liệu: -$11,220/năm
- Mạng: -$1,740/năm
- **Tổng: -$33,360/năm**

Anh viết nó lên bảng trắng trong phòng họp.

Leo nhìn chằm chằm vào nó. "Ba mươi ba nghìn."

"Và thêm một ít," Tom nói.

"Mỗi năm."

"Mỗi năm."

Priya tính toán. "Đó là $2,780 mỗi tháng chúng ta đang chi cho những thứ không tạo ra giá trị."

"Không phải tất cả," Tom sửa lại. "Một số là những thứ chúng ta đang nhận được giá trị từ, nhưng trả quá nhiều. Savings Plans — chúng ta đang nhận được chính xác cùng năng lực EC2, chỉ ở giá tốt hơn."

Maya đứng trước bảng trắng trong một thời gian dài.

"Khi chúng ta bắt đầu Nimbus," cô nói, "mỗi đô la đều quan trọng. Chúng ta hầu như không đủ tiền cho instance EC2 đầu tiên."

"Đúng vậy," Tom nói.

"Và ở đâu đó trên đường đi, chúng ta ngừng theo dõi đô la một cách cẩn thận."

"Tăng trưởng làm điều đó," Priya nói. "Trọng tâm chuyển sang xây dựng, không phải tối ưu hóa."

"Cả hai đều quan trọng," Maya nói. "Cả hai, luôn luôn. Thêm điều này vào wiki. Và đặt xem xét hàng quý về chi phí."

Tom đã mở lịch của mình.

Trong vài chương tiếp theo: chúng ta thu phóng ra khỏi các dịch vụ riêng lẻ và bắt đầu suy nghĩ như kiến trúc sư.
