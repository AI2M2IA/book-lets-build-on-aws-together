# Chương 4: Một Máy Tính Trong Tòa Nhà Của Người Khác

Biểu đồ CPU đã trở thành nhạc nền.

Máy tính xách tay của Tom ngồi mở trên góc bàn của anh, CloudWatch làm mới mỗi phút, đường mức sử dụng leo lên ở một độ dốc có nghĩa là có gì đó đang làm việc cật lực. Maya đã nhận thấy nó ba ngày trước và không nói với ai. Cô đã theo dõi hàng đợi đơn hàng thay vào đó.

IAM đã được đặt vào chỗ. Thông tin đăng nhập đã ngăn nắp. Priya có MFA trên mọi thứ. Nhóm cảm thấy, lần đầu tiên, như họ đang hơi có trách nhiệm. Nhưng có trách nhiệm không giải quyết vấn đề Maya đang theo dõi: các con số trên bảng điều khiển đơn hàng leo lên trong khi đường CPU leo lên cùng chúng.

Ứng dụng Nimbus đang chạy trên instance mà Leo đã khởi động mà không nghĩ về nó — cái anh "triển khai ở đâu đó" hồi trước khi ai biết một Region là gì.

Điều đó ổn cho việc cho các nhà đầu tư xem một bản demo. Nó không ổn khi Maya nhấn "ra mắt" và hai trăm lượt đăng ký đến trong tuần đầu tiên — bốn mươi bảy nhà hàng tích cực nhận đơn hàng mỗi ngày. Instance ngẫu hứng của Leo giờ đang xử lý các đơn hàng thực, các thực đơn thực, và các khách hàng thực — một máy được chọn một cách tình cờ, được định cỡ theo mặc định, được cấu hình bởi một người đã học AWS khi anh gõ.

"Chúng ta cần một máy chủ," Maya nói. "Một cái thực sự. Một cái ai đó thực sự chọn một cách có chủ đích."

Tom nhìn biểu đồ CPU. Đường đó nhìn thấy được từ bên kia phòng.

Đó là khi họ bắt đầu xem xét việc thuê một máy tính thực sự có nghĩa là gì.

**Sự Trừu Tượng Không Ai Giải Thích**

Khi người ta nói ứng dụng của họ "chạy trên đám mây," họ thường có nghĩa là nó chạy trên một máy ảo — một máy tính không tồn tại về mặt vật lý như phần cứng chuyên dụng, nhưng hoạt động về mọi mặt như thể nó có.

Đây là cơ chế.

Một máy chủ vật lý trong một trung tâm dữ liệu AWS có rất nhiều tài nguyên: lõi CPU, bộ nhớ, đĩa, và băng thông mạng. AWS lấy máy chủ vật lý đó và chia nó bằng phần mềm gọi là **hypervisor** — phần mềm hoạt động như một người quản lý tòa nhà, chia tài nguyên của máy chủ vật lý cho nhiều người thuê ảo. Hypervisor tạo ra nhiều máy ảo, mỗi cái xuất hiện như có CPU, bộ nhớ, và đĩa chuyên dụng riêng của nó — nhưng thực sự chia sẻ phần cứng vật lý cơ bản.

Hãy nghĩ về nó như thuê một căn hộ trong một tòa nhà lớn, thay vì mua một ngôi nhà.

Chủ tòa nhà (AWS) bảo trì cấu trúc vật lý — đường ống nước, điện, an ninh. Bạn nhận một đơn vị. Bạn trang bị nó theo cách bạn muốn. Bạn trả hàng tháng (hoặc hàng giờ). Khi bạn cần thêm không gian, bạn chuyển sang một đơn vị lớn hơn. Khi bạn dọn ra, bạn ngừng trả tiền.

Mỗi cái thuê máy ảo đó là cái mà AWS gọi là một **EC2 instance** — Elastic Compute Cloud.

EC2 viết tắt của Elastic Compute Cloud. Phần "elastic" (đàn hồi) quan trọng, và chúng ta sẽ đến đó. Hiện tại: một EC2 instance là một máy tính bạn thuê theo giờ. Nó có một hệ điều hành, một kết nối mạng, và sức mạnh tính toán. Nó chạy ứng dụng của bạn giống như một máy chủ vật lý sẽ làm.

**Chọn Instance Của Bạn: Kích Cỡ Quan Trọng**

Không phải tất cả các EC2 instance đều giống nhau. AWS cung cấp hàng trăm loại instance, được tổ chức thành các họ dựa trên những gì chúng được tối ưu hóa cho.

**General purpose** (ví dụ, `t3`, `m6i`): CPU và bộ nhớ cân bằng. Lựa chọn mặc định tốt cho hầu hết các ứng dụng web. Họ `t3` là burstable — nó tích lũy CPU credit trong các giai đoạn mức sử dụng thấp và chi tiêu chúng trong các đợt bùng nổ. Tuyệt vời cho các môi trường phát triển và khối lượng công việc với nhu cầu CPU biến đổi. Họ `m6i` cung cấp hiệu năng nhất quán, không burstable — tốt hơn cho các khối lượng công việc production với nhu cầu CPU bền vững.

**Compute optimized** (ví dụ, `c7g`): Nhiều CPU hơn so với bộ nhớ. Tốt cho mã hóa video, mô hình hóa khoa học, xử lý hàng loạt. Hậu tố "g" trong `c7g` có nghĩa là instance sử dụng các bộ xử lý AWS Graviton — các chip dựa trên ARM mà AWS thiết kế nội bộ, cung cấp tỷ lệ giá-trên-hiệu-năng tốt hơn cho nhiều khối lượng công việc so với các instance x86 tương đương.

**Memory optimized** (ví dụ, `r7i`): Nhiều bộ nhớ hơn so với CPU. Tốt cho cơ sở dữ liệu, bộ nhớ đệm, phân tích trong bộ nhớ. Nếu bạn đang chạy một cơ sở dữ liệu nơi hiệu năng cải thiện đáng kể bằng cách giữ nhiều dữ liệu hơn trong RAM, họ R là điểm khởi đầu đúng.

**Storage optimized** (ví dụ, `i3`): Lưu trữ cục bộ tốc độ cao. Tốt cho các khối lượng công việc tốn nhiều dữ liệu cần I/O đĩa rất nhanh. Lưu trữ NVMe cục bộ trên các instance này nhanh hơn đáng kể so với EBS — nhưng nó cũng tạm thời. Sử dụng nó cho dữ liệu tạm thời, không phải cho bất cứ điều gì bạn không thể chịu mất.

**Accelerated computing** (ví dụ, `p4`): GPU được gắn. Tốt cho huấn luyện học máy và kết xuất đồ họa. Các instance này đắt đỏ — một `p3.8xlarge` tốn hơn 12 đô la mỗi giờ — nhưng đối với các khối lượng công việc hưởng lợi từ song song GPU, không có gì thay thế.

Mỗi họ có các kích cỡ. Một `t3.micro` có 2 CPU ảo và 1 GB bộ nhớ. Một `t3.xlarge` có 4 CPU ảo và 16 GB. Một `t3.2xlarge` lại gấp đôi. Mẫu đặt tên nhất quán: hậu tố đi `nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`, `4xlarge`, `8xlarge`, và xa hơn.

Leo đã chọn một `t3.micro`.

"Một `t3.micro` có thể xử lý bao nhiêu người dùng?" Tom hỏi. "Và một cái lớn hơn tốn thêm bao nhiêu?"

"Tùy thuộc vào ứng dụng," Leo nói. "Nhưng có lẽ không phải một trăm người dùng đồng thời chạy tải ảnh lên và truy vấn cơ sở dữ liệu."

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi, nhìn vào trang so sánh loại instance.

Leo mở trang giá AWS. t3.micro tốn khoảng 8 đô la mỗi tháng. t3.small là 17 đô la. t3.medium là 33 đô la. t3.large khoảng 60 đô la. Khoảng cách rộng ra nhanh khi bạn đi lên — không tuyến tính, mà gần như gấp đôi với mỗi bước kích cỡ. Tom viết các con số xuống, lưu ý rằng mỗi bước kích cỡ gấp đôi bộ nhớ — nhưng, kỳ lạ thay, không phải số lượng CPU. Mỗi t3 từ micro đến large có cùng 2 vCPU; số lượng không tăng cho đến xlarge. Cái phát triển với mỗi bước là **đường cơ sở CPU credit** — phần của những vCPU đó mà instance có thể sử dụng liên tục mà không đốt hết các burst credit của nó.

Tom viết "t3.micro" lên bảng trắng và vẽ một khuôn mặt buồn bên cạnh nó.

**Cuộc Trò Chuyện Về Định Cỡ Đúng**

t3.micro kéo dài khoảng một tháng trước khi lưu lượng tối thứ Sáu đè bẹp nó. Leo nâng cấp vội vàng — thẳng lên t3.large, lý luận rằng quá lớn an toàn hơn quá nhỏ. Hai tuần sau khi chuyển sang t3.large, Tom đánh dấu một điều.

"CPU ở mức 9%," anh nói. "Trung bình. Trong bảy ngày qua."

Leo nhìn biểu đồ CloudWatch. CPU trung bình 9%. Đỉnh có lẽ 35% trong bữa tối thứ Sáu. Phần còn lại của thời gian: hầu như không nhúc nhích.

"Chúng ta đang chạy một máy chủ 60-đô-la-một-tháng," Tom nói, "ở 9% công suất của nó."

"Nhưng còn các đỉnh thứ Sáu thì sao?" Leo nói. "Chúng ta cần khoảng dư."

"Các đỉnh thứ Sáu đạt 35%," Tom nói. "Một t3.small có cùng hai vCPU — cái nhỏ hơn là đường cơ sở credit, khoảng 20% bền vững. Chúng ta trung bình 9%. Điều đó có nghĩa là chúng ta sẽ tích lũy CPU credit cả ngày, mỗi ngày, và chi tiêu một số trong vài giờ vào các tối thứ Sáu. Tôi đã kiểm tra phép toán `CPUCreditBalance` — số dư không bao giờ gần cạn. Nó là 17 đô la một tháng. Chúng ta có khoảng dư."

Leo nhìn các con số. Anh nhìn biểu đồ. Anh cảm thấy sự khó chịu của một kỹ sư đã cung cấp quá mức và biết điều đó.

"Nhưng nếu chúng ta gặp một đợt tăng vọt thì sao?" anh nói.

"Thì các chỉ số sẽ cho chúng ta biết trước khi nó gây hại," Priya nói. "Và cuối cùng chúng ta sẽ thiết lập Auto Scaling — đó là chính xác cái nó dành cho. Bạn sẽ không cần cung cấp cho đợt tăng vọt một cách thủ công một khi hệ thống có thể thêm instance tự động."

Họ giảm cỡ xuống một t3.small. Hóa đơn hàng tháng giảm 40 đô la. Trong một năm, đó là 480 đô la — không phải không gì, đặc biệt cho một startup. Tom ghi nó trong bảng tính của mình với sự hài lòng lặng lẽ của một người đã chờ đợi để nêu điểm này trong hai tuần.

Mẫu này có một tên: **định cỡ đúng** (right-sizing). Nó có nghĩa là khớp kích cỡ instance với khối lượng công việc thực tế, không phải trường hợp xấu nhất tưởng tượng. Các công cụ AWS như AWS Compute Optimizer và các chỉ số CloudWatch làm cho việc định cỡ đúng trở thành một quyết định dựa trên dữ liệu thay vì một sự đoán.

**AMI: Trạng Thái Khởi Đầu Của Máy Bạn**

Trước khi bạn khởi động một EC2 instance, bạn chọn hệ điều hành và cấu hình ban đầu của nó. Trong AWS, đây được gọi là một **Amazon Machine Image** (AMI).

Một AMI là một template. Nó định nghĩa:

- Hệ điều hành (Amazon Linux, Ubuntu, Windows Server, v.v.)
- Phần mềm cài đặt sẵn
- Trạng thái đĩa ban đầu

Khi bạn khởi động một instance từ một AMI, AWS tạo một bản sao mới của template đó chỉ cho bạn. Bạn cũng có thể tạo các AMI của riêng mình — nếu bạn cấu hình một máy chủ chính xác theo cách bạn muốn, bạn có thể "lưu" trạng thái đó như một AMI tùy chỉnh và sử dụng nó để khởi động các máy chủ giống hệt một cách nhanh chóng. Đây là cách bạn triển khai các môi trường nhất quán ở quy mô.

Hãy nghĩ về một AMI như một công thức nấu ăn. Công thức mô tả món ăn. Mỗi lần bạn theo công thức, bạn nhận cùng một món ăn. Nếu bạn muốn thay đổi món ăn vĩnh viễn, bạn cập nhật công thức.

AWS cung cấp một thị trường các AMI — một số do AWS bảo trì (Amazon Linux 2, Amazon Linux 2023), một số được bảo trì bởi các bản phân phối Linux lớn (Ubuntu, Red Hat, SUSE), và một số đến từ các nhà cung cấp bên thứ ba (máy chủ cơ sở dữ liệu được cấu hình sẵn, thiết bị bảo mật, phần mềm thương mại). Đối với hầu hết các ứng dụng web, một AMI Amazon Linux do AWS bảo trì hoặc AMI Ubuntu LTS là điểm khởi đầu đúng.

Đối với Nimbus, Leo đã xây dựng một AMI tùy chỉnh bắt đầu từ cơ sở Amazon Linux 2023 mới nhất và thêm runtime Node.js, các phụ thuộc hệ thống của ứng dụng, và một tệp dịch vụ được tạo sẵn cho quy trình ứng dụng. Các instance mới khởi động từ AMI này bắt đầu phục vụ lưu lượng trong dưới 90 giây — nhanh hơn đáng kể so với thời gian khởi động bốn phút khi sử dụng các script UserData để cài đặt mọi thứ từ đầu.

Có một sự đánh đổi: các AMI tùy chỉnh cần được bảo trì. Mỗi khi bạn cập nhật một phụ thuộc hệ thống hoặc phiên bản runtime, bạn cần xây dựng lại AMI. Các nhóm để các AMI của họ trở nên cũ thấy mình đang chạy các instance với phần mềm lỗi thời — một rủi ro bảo mật. Priya đặt "xây dựng lại AMI với các gói mới nhất" vào danh sách kiểm tra kỹ thuật hàng tháng.

"Lưu trữ AMI tốn bao nhiêu?" Tom hỏi.

Các AMI được lưu trữ dưới dạng EBS snapshot — bạn trả mức snapshot EBS (khoảng 0,05 đô la mỗi GB mỗi tháng) cho kích cỡ của AMI. Một AMI Amazon Linux điển hình với ngăn xếp ứng dụng Nimbus tốn khoảng 4 GB. Ở mức 0,05 đô la/GB: 0,20 đô la mỗi tháng cho mỗi AMI. Giữ năm AMI lịch sử cho mục đích rollback: 1 đô la/tháng. Không phải một chi phí đáng kể.

**UserData: Script Khởi Động**

Có thêm một tùy chọn cấu hình trên EC2 mà Leo khám phá khi anh đang cố tránh xây dựng một AMI mới mỗi khi mã ứng dụng thay đổi.

Khi bạn khởi động một EC2 instance, bạn có thể cung cấp một **script UserData** — một shell script chạy tự động khi instance khởi động lần đầu tiên. Nó chạy với tư cách root, trước khi instance được coi là "sẵn sàng".

Đối với Nimbus, script UserData trông như thế này:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Script đó cài đặt Node.js, kéo mã ứng dụng mới nhất, cài đặt các phụ thuộc, và khởi động dịch vụ ứng dụng. Mỗi instance mới khởi động từ AMI cơ sở chạy script này và xuất hiện với phiên bản hiện tại của ứng dụng được cài đặt — một cách tự động.

Cách tiếp cận này có nghĩa là AMI vẫn đơn giản (chỉ một hệ điều hành cơ sở), và UserData xử lý thiết lập ứng dụng. Sự đánh đổi: các script UserData mất thời gian để chạy. Một instance có thể mất ba đến năm phút để khởi động và trở nên sẵn sàng. Đối với các ứng dụng nơi thời gian khởi động quan trọng — cho Auto Scaling, nơi bạn cần các instance mới sẵn sàng nhanh chóng — nướng sẵn ứng dụng vào một AMI tùy chỉnh giảm thời gian khởi động đáng kể.

"Sẽ ổn thôi," Leo nói, khi Priya hỏi về thời gian khởi động.

"Thời gian khởi động là bao nhiêu?" cô hỏi.

"Bốn phút."

"Và trong bốn phút đó, instance đang chạy nhưng không phục vụ lưu lượng?"

"Đúng."

"Vậy trong một đợt tăng lưu lượng đột ngột, chúng ta có thể có bốn phút nơi các instance mới chưa giúp ích?"

Leo nhìn script UserData của mình. Anh bắt đầu xem xét cách xây dựng một AMI tùy chỉnh.

**Key Pair: Cách Đúng Để Truy Cập Một Máy Chủ**

Nhớ thảm họa "Admin123" từ chương trước không?

Cách đúng để đăng nhập vào một EC2 instance là với một **key pair** (cặp khóa).

Một key pair là một cặp mã hóa: một public key (được AWS lưu trên máy chủ) và một private key (một tệp bạn tải xuống và giữ bí mật). Để đăng nhập, bạn sử dụng SSH — một giao thức an toàn — với private key của bạn. Không có mật khẩu. Nếu bạn mất private key, bạn mất quyền truy cập. Không có "quên mật khẩu" cho SSH.

Điều này quan trọng vì các key pair là:

- Duy nhất đối với bạn
- Không thể đoán về mặt mã hóa
- Không được AWS lưu trữ (bạn giữ private key)
- Dễ thu hồi (xóa khóa khỏi máy chủ, tạo một cặp mới)

Priya đã thiết lập truy cập dựa trên khóa trên máy chủ Nimbus. Máy chủ Admin123 đã được ngừng hoạt động. Không ai buồn về nó.

"Và nếu ai đó cố xâm nhập và chặn một key pair trong khi truyền thì sao?" Priya hỏi. Cô đã tìm ra câu trả lời: private key không bao giờ di chuyển qua mạng. Bạn tải nó xuống một lần. Bạn giữ nó cục bộ. Nó không bao giờ rời khỏi máy của bạn.

**Chuyện Gì Xảy Ra Nếu Bạn Mất Key Pair**

Leo hỏi câu hỏi này vào tuần thứ ba, với năng lượng cụ thể của một người chưa mất key pair của mình nhưng đang nghĩ về nó.

"Nếu tôi mất tệp private key, chuyện gì xảy ra?"

"Bạn mất quyền truy cập SSH vào instance," Priya nói.

"Vĩnh viễn?"

"Không nhất thiết. Nhưng quá trình khôi phục khó chịu."

Quá trình khôi phục: dừng instance, tách volume EBS root của nó, gắn nó vào một instance khác mà bạn *có* quyền truy cập, mount volume, thêm một public key mới vào tệp `authorized_keys` trên volume được mount, tách và gắn lại nó vào instance gốc, khởi động lại.

Điều này hoạt động. Nó mất ba mươi đến sáu mươi phút và đòi hỏi thực thi cẩn thận. Một bước sai và bạn có thể làm mọi thứ tệ hơn.

Lựa chọn thay thế, nếu ứng dụng của bạn không lưu gì quan trọng trên volume root (vì bạn đã theo lời khuyên trong cuốn sách này và lưu dữ liệu trong S3 và EBS): chấm dứt instance và khởi động một cái mới từ AMI. Tạo một key pair mới khi bạn làm.

"Lưu private key ở đâu đó an toàn," Priya nói. "Và không bao giờ trên một EC2 instance."

Leo nhìn thư mục desktop của mình có nhãn `AWS_keys`. Rồi nhìn Priya. Rồi anh chuyển thư mục vào trình quản lý mật khẩu được mã hóa của mình.

**Security Group: Tường Lửa Của Instance Bạn**

Khi một EC2 instance khởi động, nó cần một **security group** — một tường lửa ảo kiểm soát lưu lượng mạng nào có thể đến nó và lưu lượng nào nó có thể gửi ra.

Một security group có hai bộ quy tắc: **inbound** (lưu lượng đến) và **outbound** (lưu lượng đi ra).

Theo mặc định, một security group mới chặn tất cả lưu lượng inbound và cho phép tất cả lưu lượng outbound. Bạn thêm các quy tắc inbound để mở các cổng cụ thể cho các nguồn cụ thể.

Đối với máy chủ web Nimbus, Priya cấu hình:

- Cho phép TCP cổng 443 (HTTPS) từ `0.0.0.0/0` (toàn bộ internet)
- Cho phép TCP cổng 80 (HTTP) từ `0.0.0.0/0` (chuyển hướng đến 443 trong ứng dụng)
- Cho phép TCP cổng 22 (SSH) chỉ từ địa chỉ IP văn phòng — không phải từ internet

"Khoan đã — nhưng *tại sao* chúng ta lại hạn chế SSH chỉ cho IP văn phòng?" Maya hỏi.

"Vì nếu SSH mở cho toàn bộ internet," Priya nói, "các bot tự động sẽ tấn công cổng 22 thử các tổ hợp thông tin đăng nhập hai mươi bốn giờ một ngày. Nhật ký của chúng ta sẽ đầy các lần thử thất bại. Và nếu có bao giờ một lỗ hổng trong chính daemon SSH, mọi kẻ tấn công trên thế giới có thể cố khai thác nó."

"Nhưng nếu Leo cần đăng nhập từ nhà thì sao?"

"VPN," Priya nói.

Leo đã có một VPN được thiết lập. Anh có biểu cảm của một người đã được hỏi câu hỏi này trước.

Cơ sở dữ liệu vẫn sống trên cùng máy với ứng dụng — nhưng Priya chuẩn bị một security group riêng cho ngày nó sẽ không: cổng cơ sở dữ liệu mở chỉ cho lưu lượng từ security group của máy chủ web — không phải từ internet, không phải từ SSH (để truy cập DB trực tiếp), không phải từ bất kỳ nơi nào khác. Trong khi đó, cô đảm bảo security group của instance chia sẻ không để lộ cổng cơ sở dữ liệu cho internet chút nào. Cơ sở dữ liệu sẽ vô hình với mọi thứ trừ ứng dụng cần nó.

Để đến cơ sở dữ liệu trực tiếp, một kẻ tấn công sẽ cần xâm phạm máy chủ web trước. Đó là lớp phòng thủ đầu tiên.

"Và lớp thứ hai?" Tom hỏi.

"Xác thực IAM cho cơ sở dữ liệu. Và mã hóa trong khi truyền."

Cô thêm cả hai vào danh sách kiểm tra thiết lập.

**EC2 Instance Metadata và IMDSv2**

Có thêm một phần bảo mật EC2 quan trọng trong thực tế, ngay cả khi nó hiếm khi được giải thích trong nội dung giới thiệu.

Khi một ứng dụng chạy trên một EC2 instance, nó có thể truy vấn một endpoint nội bộ đặc biệt tại `http://169.254.169.254/latest/meta-data/` để lấy thông tin về instance: instance ID của nó, Region của nó, availability zone của nó, và — quan trọng — thông tin đăng nhập IAM tạm thời liên kết với bất kỳ IAM Role được gắn nào.

Đây là cách ứng dụng trên EC2 instance gọi các dịch vụ AWS mà không có thông tin đăng nhập được mã hóa cứng. Nó hỏi dịch vụ metadata: "Tôi nên sử dụng thông tin đăng nhập nào ngay bây giờ?" Dịch vụ metadata trả về thông tin đăng nhập tạm thời hết hạn và xoay tự động.

Vấn đề bảo mật: các phiên bản cũ hơn của dịch vụ metadata này (IMDSv1) sẽ phản hồi bất kỳ yêu cầu nào từ bất kỳ quy trình nào trên instance. Nếu một ứng dụng có một lỗ hổng server-side request forgery (SSRF) — một lỗi nơi một kẻ tấn công có thể khiến máy chủ lấy một URL theo lựa chọn của kẻ tấn công — kẻ tấn công có thể sử dụng lỗ hổng đó để lấy `http://169.254.169.254/latest/meta-data/iam/security-credentials/` và lấy thông tin đăng nhập IAM của instance.

Cuộc tấn công này đã được sử dụng trong các vụ rò rỉ thực.

**IMDSv2** (Instance Metadata Service phiên bản 2) sửa điều này bằng cách yêu cầu một session token trước khi dịch vụ metadata phản hồi. Token được lấy qua một yêu cầu PUT. Các cuộc tấn công SSRF, thường sử dụng các yêu cầu GET, không thể hoàn thành bước PUT — vậy nên chúng không thể lấy token, và metadata không được trả về.

"Chúng ta nên bật IMDSv2 không?" Leo hỏi.

"Nó là mặc định cho các instance mới bây giờ," Priya nói. "Nhưng cho các instance hiện có, bạn phải chọn tham gia."

Cô bật nó trên tất cả các instance Nimbus hiện có chiều hôm đó.

**Vòng Đời Instance: Không Phải Mãi Mãi**

Đây là điều mà nhiều người mới bắt đầu bỏ lỡ.

Các EC2 instance không phải vĩnh viễn theo mặc định. Khi bạn dừng một instance, tài nguyên tính toán được giải phóng. Khi bạn khởi động nó lại, nó có thể chạy trên phần cứng vật lý khác. Bất kỳ dữ liệu nào được lưu trữ *trên chính instance* (trên volume root của nó) sống sót qua một chu kỳ dừng/khởi động — nhưng địa chỉ IP công khai thay đổi.

Khi bạn *chấm dứt* một instance, nó biến mất. Trừ khi bạn có lưu trữ riêng được gắn (mà chúng ta đề cập ở Chương 6), bất kỳ dữ liệu nào trên instance biến mất.

Bốn trạng thái mà một EC2 instance có thể ở trong:

**Pending**: Instance đang khởi động. Nó đã được phân bổ phần cứng nhưng chưa hoàn thành khởi động. Script UserData đang chạy.

**Running**: Instance đang hoạt động và có thể truy cập. Bạn đang trả tiền cho nó.

**Stopping/Stopped**: Instance bị tắt. Volume EBS root được bảo toàn. Bạn không trả tiền cho tính toán, nhưng bạn vẫn trả tiền cho lưu trữ EBS được gắn.

**Shutting-down/Terminated**: Instance đang bị xóa. Trừ khi bạn đã cấu hình các volume EBS để tồn tại, dữ liệu của chúng biến mất.

"Tính tạm thời" này thực sự là một tính năng, không phải một lỗi. Nó có nghĩa là bạn có thể khởi động các máy chủ, sử dụng chúng, và vứt chúng đi. Nó cho phép mở rộng ngang. Nhưng nó cũng có nghĩa là bạn không bao giờ nên lưu trữ dữ liệu quan trọng *trên* chính EC2 instance.

Vậy dữ liệu sống ở đâu?

Trong lưu trữ riêng. Chúng ta đến đó trong hai chương tiếp theo.

Bạn có thể đang tự hỏi: nếu một instance nhận một địa chỉ IP mới mỗi khi nó khởi động lại, làm sao ứng dụng của bạn giữ một địa chỉ ổn định? AWS có một giải pháp gọi là Elastic IP — một IP công khai tĩnh mà bạn sở hữu và giữ nguyên ngay cả sau khi khởi động lại. Một lưu ý về chi phí: kể từ tháng 2 năm 2024, AWS tính một phí hàng giờ nhỏ cho mọi địa chỉ IPv4 công khai — các Elastic IP (được gắn hay không) và các IP công khai được tự động gán trên các instance như nhau. IPv4 công khai không còn miễn phí, đó là một lý do nữa để giữ các instance trong các subnet riêng tư đằng sau một bộ cân bằng tải.

Đối với các ứng dụng đằng sau một bộ cân bằng tải — đó là kiến trúc đúng cho bất kỳ ứng dụng web production nào — bạn không cần các Elastic IP chút nào. Người dùng kết nối đến tên DNS ổn định của bộ cân bằng tải. Bộ cân bằng tải kết nối đến các instance bằng địa chỉ IP riêng tư của chúng trong VPC. Các instance có thể đến và đi, nhận IP mới, mở rộng vào và ra — bộ cân bằng tải xử lý tất cả nó một cách trong suốt. Các Elastic IP dành cho các trường hợp sử dụng cụ thể: một máy chủ mà các client kết nối trực tiếp bằng IP, một bastion host với một địa chỉ ổn định, một ứng dụng không đằng sau một bộ cân bằng tải vì một lý do cụ thể nào đó.

Leo ban đầu lên kế hoạch sử dụng các Elastic IP cho các máy chủ web Nimbus. Priya chỉ ra rằng với một bộ cân bằng tải, địa chỉ IP của các máy chủ web không liên quan đến các client bên ngoài. Bộ cân bằng tải có tên DNS ổn định. Các instance đằng sau nó có thể vứt bỏ theo thiết kế.

"Vậy các Elastic IP dành cho ngoại lệ, không phải quy tắc," Leo nói.

"Đúng," Priya nói. "Và nếu bạn thấy mình với tay lấy một cái, hãy hỏi liệu kiến trúc có nên có một bộ cân bằng tải thay vào đó không."

**"Elastic" Có Nghĩa Là Gì**

Chúng ta nói EC2 viết tắt của Elastic Compute Cloud. Cái gì là đàn hồi về nó?

Hai điều:

**Tính đàn hồi dọc**: Bạn có thể thay đổi kích cỡ của một instance. Dừng instance, thay đổi nó từ `t3.micro` sang `t3.xlarge`, khởi động lại nó. Nhiều CPU và bộ nhớ hơn, cùng ứng dụng, cùng thiết lập.

**Tính đàn hồi ngang**: Bạn có thể thêm nhiều instance hơn. Thay vì một máy chủ lớn, chạy mười máy chủ vừa đằng sau một bộ cân bằng tải. Khi lưu lượng giảm, gỡ các instance và ngừng trả tiền cho chúng.

Cả hai cách tiếp cận giải quyết vấn đề "một máy chủ, quá nhiều lưu lượng". Chúng có các sự đánh đổi khác nhau, mà chúng ta khám phá ở Chương 7 khi chúng ta thêm Auto Scaling vào câu chuyện.

Hiểu biết chính: với EC2, sức mạnh tính toán là thứ bạn *vặn núm* thay vì thứ bạn *mua*. Cần thêm? Vặn núm lên. Cần ít hơn? Vặn nó xuống. Trả tiền tương ứng.

Maya nhìn bảng loại instance. "Nếu chúng ta chỉ có thể làm máy chủ lớn hơn, tại sao phải bận tâm với mười cái vừa?"

"Vì," Leo nói, "một máy chủ lớn vẫn là một máy chủ. Nếu nó sập, mọi thứ sập. Mười máy chủ vừa có nghĩa là một cái có thể thất bại và chín cái tiếp tục chạy."

"Và," Priya thêm vào, "bạn không thể làm một máy chủ lớn hơn mà không khởi động lại nó. Mười cái nhỏ có nghĩa là bạn có thể thêm nhiều hơn mà không chạm vào những cái đang chạy."

Tom đã viết "khởi động lại = ngừng hoạt động" trong cuốn sổ tay của mình.

## Điểm Mạnh Và Hạn Chế

**Tại sao EC2 mạnh mẽ**:

- Kiểm soát đầy đủ. Bạn chọn hệ điều hành, phần mềm, cấu hình. Đó là máy tính của bạn.
- Định cỡ linh hoạt. Hàng trăm loại instance trên mọi trường hợp sử dụng.
- Không có phần cứng để quản lý. AWS xử lý lớp vật lý.
- Tính phí theo giây, với tối thiểu 60 giây, cho các AMI Amazon Linux, Windows, và Ubuntu. (Một số AMI Linux thương mại, như RHEL và SUSE, vẫn tính phí theo giờ — kiểm tra các điều khoản tính phí của AMI.) Bạn dừng instance, bạn ngừng trả tiền.
- Hoạt động với mọi thứ. EC2 là nền tảng mà hầu hết các dịch vụ AWS khác được xây dựng trên.
- Nhiều mô hình giá (On-Demand, Reserved, Spot) cho phép tối ưu hóa chi phí đáng kể
  cho các khối lượng công việc có thể đoán trước hoặc linh hoạt — được đề cập chi tiết ở Chương 27.

**Nơi nó trở nên phức tạp**:

- Bạn chịu trách nhiệm vá và cập nhật hệ điều hành. (Mô Hình Trách Nhiệm Chung
  — đây là phần "trong đám mây" thuộc về bạn.)
- Vá hệ điều hành không phải tùy chọn. Các EC2 instance không được vá là một trong những
  vector tấn công phổ biến nhất trong các vụ rò rỉ đám mây. AWS Systems Manager Patch Manager có thể tự động hóa
  điều này — nhưng bạn phải cấu hình nó và giám sát nó.
- Quản lý EC2 ở quy mô có nghĩa là quản lý trạng thái instance, các AMI, các bản vá bảo mật, và
  vòng đời trên có khả năng hàng nghìn máy. Đó là chi phí vận hành.
- EC2 không phải câu trả lời đúng cho mọi thứ. Đối với mã hướng sự kiện chạy
  không thường xuyên, Lambda (Chương 20) rẻ hơn và đơn giản hơn. Đối với các khối lượng công việc
  container hóa, ECS và EKS (Chương 21) cung cấp hiệu quả tài nguyên tốt hơn.
- Các instance không sử dụng vẫn tốn tiền. Nếu bạn dừng một instance, bạn ngừng trả tiền cho
  tính toán — nhưng nếu bạn có lưu trữ được gắn, bạn vẫn trả tiền cho cái đó.

**Quyết định khi-nào-không-dùng-EC2**: EC2 cho bạn kiểm soát tối đa — nhưng kiểm soát có một chi phí vận hành. Mỗi EC2 instance bạn chạy là thứ bạn phải vá, giám sát, và cuối cùng thay thế. Đối với các ứng dụng chạy không thường xuyên (Lambda rẻ hơn), đối với các ứng dụng cần mở rộng ngang đến hàng chục hoặc hàng trăm instance (container hiệu quả hơn), hoặc đối với cơ sở dữ liệu và các khối lượng công việc được quản lý khác (RDS, ElastiCache), các dịch vụ được quản lý hoàn toàn loại bỏ chi phí vận hành đáng kể với một mức phí cao hơn khiêm tốn. EC2 là lựa chọn đúng khi bạn cần kiểm soát mà nó cung cấp — không phải theo mặc định.

Priya có một quy tắc kinh nghiệm: "Nếu chúng ta sẽ hài lòng với một dịch vụ được quản lý làm những gì chúng ta cần, hãy sử dụng dịch vụ được quản lý. Sử dụng EC2 khi lựa chọn được quản lý không tồn tại hoặc không phù hợp."

Leo ban đầu phản đối điều này. "Nhưng EC2 cho chúng ta nhiều lựa chọn hơn."

"Lựa chọn là chi phí," Priya nói. "Chúng ta không cần mọi lựa chọn. Chúng ta cần cấu hình đúng, được bảo trì đáng tin cậy."

**EC2 Placement Group: Kiểm Soát Nơi Các Instance Hạ Cánh**

EC2 cho bạn kiểm soát instance của bạn là gì — kích cỡ của nó, hệ điều hành của nó, cấu hình của nó. Nó cũng cho bạn kiểm soát hạn chế về *nơi* nó hạ cánh về mặt vật lý, qua một tính năng gọi là **placement group**.

Theo mặc định, AWS trải các instance trên phần cứng vật lý để tối đa hóa tính khả dụng. Nhưng đối với một số khối lượng công việc nhất định, bạn muốn ghi đè mặc định đó — hoặc để các instance gần nhau hơn, hoặc để đảm bảo chúng ở xa nhau.

Ba loại placement group:

**Cluster**: Đóng gói các instance gần nhau trong một Availability Zone duy nhất, thường trên cùng rack vật lý hoặc phần cứng liền kề. Kết quả là độ trễ mạng thấp nhất và thông lượng mạng cao nhất giữa các instance trong nhóm — với thông lượng mạng 10 Gbps hoặc cao hơn giữa các instance (đừng nhầm lẫn điều này với Enhanced Networking/ENA, là một tính năng mạng theo từng instance độc lập với placement group). Đây là lựa chọn cho HPC (điện toán hiệu năng cao), các tác vụ huấn luyện ML quy mô lớn, và các khối lượng công việc song song được ghép chặt nơi các instance dành nhiều thời gian gửi dữ liệu cho nhau. Sự đánh đổi là tính khả dụng: nếu phân đoạn phần cứng cơ bản thất bại, tất cả các instance trong cluster có thể bị ảnh hưởng đồng thời.

**Partition**: Chia các instance trên các phân vùng logic, nơi mỗi phân vùng nằm trên bộ phần cứng riêng của nó — các rack riêng biệt, điện riêng biệt, switch mạng riêng biệt. Các instance trong một phân vùng chia sẻ phần cứng với nhau, nhưng các phân vùng không bao giờ chia sẻ phần cứng với các phân vùng khác. Thiết kế này giới hạn bán kính vụ nổ của một lỗi phần cứng: một rack sập ảnh hưởng đến một phân vùng nhưng không phải các phân vùng khác. Các partition placement group được xây dựng cho các khối lượng công việc phân tán và được sao chép lớn — Apache Hadoop, Apache Cassandra, Apache Kafka — nơi bạn muốn đủ cách ly lỗi để một lỗi cấp rack không làm sập toàn bộ cluster của bạn.

**Spread**: Đặt mỗi instance trên phần cứng cơ bản hoàn toàn riêng biệt. Cách ly tối đa giữa các instance. Nếu bạn có năm instance ứng dụng quan trọng không bao giờ được chia sẻ một host vật lý (vì một lỗi phần cứng đơn lẻ không bao giờ nên làm sập nhiều hơn một), Spread là câu trả lời. Giới hạn: **7 instance mỗi Availability Zone mỗi placement group**. Spread được thiết kế cho số lượng nhỏ các instance quan trọng không thể chịu được sự đồng vị trí, không phải cho các đội lớn.

"Vậy Cluster dành cho tốc độ, Spread dành cho cách ly, và Partition dành cho các hệ thống phân tán cần cả một chút clustering và một chút cách ly?" Maya hỏi.

"Gần đủ," Priya nói. "Cluster: độ trễ thấp giữa các instance, một rủi ro lớn. Spread: cách ly tối đa, giới hạn cứng bảy mỗi AZ. Partition: cách ly có cấu trúc cho các hệ thống phân tán lớn — bạn kiểm soát mỗi instance đi vào phân vùng nào."

Đối với kiến trúc hiện tại của Nimbus, không cái nào trong số này áp dụng. Nhưng biết chúng tồn tại có nghĩa là biết khi nào nên với tay lấy chúng — và trực tiếp hơn, biết một câu hỏi thi về "các khối lượng công việc HPC cần độ trễ giữa các nút thấp" thực sự đang hỏi về cái gì.

## Tóm Tắt

Một instance được khởi động một cách tình cờ không bao giờ sẽ là một máy chủ production. Hiểu EC2 đúng cách không chỉ giải quyết vấn đề công suất — nó giới thiệu một bộ khái niệm mới sẽ xuất hiện trong gần như mọi chương tiếp theo. Các loại instance, AMI, key pair, security group, và định cỡ đúng không phải là chuyện vặt về EC2; chúng là từ vựng mà phần còn lại của cuốn sách được xây dựng trên. Học chúng ở đây và mọi thứ khác có ý nghĩa hơn.

- Một **EC2 instance** là một máy ảo bạn thuê trong AWS. Các loại instance được tổ chức theo trường hợp sử dụng: general purpose, compute optimized, memory optimized, storage optimized. Chọn họ đúng và định cỡ đúng theo các chỉ số khối lượng công việc thực tế — không phải trường hợp xấu nhất tưởng tượng.
- Một **AMI** (Amazon Machine Image) là template cho hệ điều hành và cấu hình ban đầu của instance bạn. Các AMI tùy chỉnh cho phép các triển khai nhất quán, có thể lặp lại.
- **Key pair** là cách an toàn để truy cập các EC2 instance. **Security group** là tường lửa của instance bạn — hạn chế SSH cho các IP đã biết và khóa các cổng cơ sở dữ liệu chỉ cho security group của ứng dụng.
- **IMDSv2** nên được bật trên tất cả các instance để bảo vệ chống lại đánh cắp thông tin đăng nhập dựa trên SSRF từ dịch vụ metadata instance.
- Các EC2 instance không phải vĩnh viễn theo mặc định. Các instance bị chấm dứt mất dữ liệu cục bộ của chúng — lưu trữ dữ liệu quan trọng trong S3 hoặc EBS, không phải trên đĩa instance.

## Mẹo Thi

*SAA-C03 Domain 3 — Task 3.2 (giải pháp tính toán hiệu năng cao)*

- **Trách Nhiệm Chung cho EC2**: Bạn chịu trách nhiệm vá hệ điều hành.
  AWS bảo trì phần cứng vật lý và hypervisor. Đây là một sự phân biệt thường được kiểm tra.
- **Các họ instance quan trọng cho các câu hỏi tình huống.** Nếu một tình huống đề cập đến yêu cầu
  bộ nhớ cao (bộ nhớ đệm trong bộ nhớ, SAP HANA), câu trả lời có khả năng liên quan đến một
  instance memory-optimized. Nếu nó đề cập đến xử lý hàng loạt hoặc HPC, compute-optimized.
- **Dừng ≠ Chấm dứt.** Dừng một instance bảo toàn nó (bạn có thể khởi động lại).
  Chấm dứt xóa nó. Các tình huống thi kiểm tra liệu bạn có biết sự phân biệt này không.
- **IP công khai thay đổi khi khởi động lại.** Nếu ứng dụng của bạn cần một địa chỉ IP ổn định,
  sử dụng một **Elastic IP** — một IP công khai tĩnh giữ liên kết với tài khoản của bạn.
  Kể từ tháng 2 năm 2024, AWS tính phí mọi địa chỉ IPv4 công khai theo giờ — các Elastic IP
  (được gắn hay không) và các IP công khai được tự động gán như nhau.
- **Các mô hình giá On-Demand, Reserved, và Spot** được kiểm tra nhiều trong Domain 4.
  Chúng ta đề cập chúng ở Chương 27. Hiện tại, hãy biết rằng On-Demand có nghĩa là trả theo giây
  không cam kết.
- **Security group là stateful.** Nếu bạn cho phép lưu lượng inbound trên một cổng, lưu lượng
  trả về tự động được cho phép mà không có một quy tắc outbound rõ ràng. NACL
  (đề cập ở Chương 15) là stateless — chúng đòi hỏi cả quy tắc inbound và outbound.
- **Placement Group:** Cluster = độ trễ thấp nhất giữa các instance (HPC, huấn luyện ML — nhưng rủi ro điểm-lỗi-đơn-lẻ cho nhóm); Partition = các hệ thống phân tán (Hadoop, Kafka, Cassandra) với cách ly lỗi theo từng phân vùng; Spread = cách ly instance tối đa, tối đa 7 mỗi AZ. Mẫu câu hỏi thi: "khối lượng công việc HPC ghép chặt cần thông lượng mạng tối đa giữa các nút" → Cluster placement group.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của bạn: một EC2 instance là gì? Một AMI là gì? Mối quan hệ giữa
chúng là gì?

*(Gợi ý: Nghĩ về phép so sánh công thức nấu ăn — công thức là gì, và món ăn là gì?)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty đang triển khai một ứng dụng web lưu lượng cao. Ứng dụng
xử lý các tìm kiếm catalog sản phẩm với logic lọc phức tạp tốn nhiều CPU.
Nhóm mong đợi các đợt tăng lưu lượng đáng kể trong các sự kiện giảm giá. Họ muốn đảm bảo
họ chọn đúng loại EC2 instance và sẵn sàng cho các đợt tăng lưu lượng.

Tổ hợp lựa chọn nào đáp ứng TỐT NHẤT yêu cầu của họ?

A) Các instance memory-optimized với một số lượng cố định để đảm bảo hiệu năng nhất quán  
B) Các instance compute-optimized với Auto Scaling để xử lý các đợt tăng lưu lượng  
C) Các instance general-purpose với một kích cỡ instance lớn duy nhất  
D) Các instance storage-optimized vì catalog sản phẩm đòi hỏi truy cập đĩa nhanh

**Gợi ý 1**: Khối lượng công việc được mô tả là "tốn nhiều CPU." Họ instance nào được
tối ưu hóa cho CPU?

**Gợi ý 2**: Tình huống đề cập đến "các đợt tăng lưu lượng trong các sự kiện giảm giá." Một số lượng cố định
của các instance sẽ không xử lý lưu lượng biến đổi một cách hiệu quả. Tính năng AWS nào xử lý điều này?

**Gợi ý 3**: Các instance compute-optimized xử lý công việc nặng CPU. Auto Scaling thêm
và gỡ các instance dựa trên nhu cầu. Cùng nhau chúng trả lời cả hai yêu cầu.

**Đáp án**: B

**Giải thích**: Các instance compute-optimized (như họ `c`) cung cấp nhiều CPU
trên mỗi đô la hơn cho các khối lượng công việc tốn nhiều CPU. Auto Scaling tự động điều chỉnh số lượng
các instance dựa trên tải — thêm các instance trong các sự kiện giảm giá, gỡ chúng khi
lưu lượng trở lại bình thường. Tổ hợp này tối ưu hóa cả hiệu năng và chi phí.

**Tại sao không A?** Các instance memory-optimized được thiết kế cho các khối lượng công việc cần lượng lớn
RAM (cơ sở dữ liệu, bộ nhớ đệm trong bộ nhớ). Đây là một khối lượng công việc bị giới hạn CPU. Và số lượng instance
cố định có nghĩa là hoặc cung cấp quá mức (lãng phí) hoặc cung cấp dưới mức (thất bại).

**Tại sao không C?** Các instance general-purpose đánh đổi một số hiệu quả CPU để lấy sự cân bằng. Đối với
một khối lượng công việc tốn nhiều CPU đã biết, compute-optimized phù hợp hơn. Và một instance
lớn duy nhất là một điểm lỗi đơn lẻ.

**Tại sao không D?** Điểm nghẽn là CPU, không phải I/O đĩa. Các instance storage-optimized
được thiết kế cho các khối lượng công việc cần thông lượng rất cao đến lưu trữ cục bộ.

*SAA-C03 Domain 3 — Task 3.2*

**Bài tập 3 — Thách thức kiến trúc** *(Tùy chọn)*

Nimbus hiện chạy một EC2 instance `t3.micro` duy nhất cho toàn bộ ứng dụng.
Nhóm cần quyết định: nâng cấp lên một instance lớn hơn (`t3.2xlarge`) hay thêm nhiều
instance `t3.micro` đằng sau một bộ cân bằng tải?

Phân tích các sự đánh đổi. Lợi thế của mỗi cách tiếp cận là gì? Những câu hỏi
nào bạn sẽ hỏi để quyết định? (Gợi ý: nghĩ về các điểm lỗi đơn lẻ,
chi phí, độ phức tạp triển khai, và chuyện gì xảy ra trong khi bảo trì.)

*(Không có câu trả lời đúng duy nhất. Đây là về lập luận qua mở rộng dọc so với
ngang.)*

## Cảnh Sau Tín Dụng

Leo dành buổi chiều thực thi việc giảm cỡ. Anh chuyển từ `t3.large` xuống một `t3.small`,
sử dụng dữ liệu định cỡ đúng mà Tom đã thu thập từ CloudWatch. CPU ổn định ở khoảng
12% trong tải bình thường. Các trang tải trong dưới một giây.

Tom theo dõi hóa đơn AWS cập nhật theo thời gian thực. t3.small vẫn tốn khoảng gấp đôi mỗi giờ so với micro ban đầu — nhưng một phần ba của t3.large mà họ đã trả quá nhiều. Anh ghi một lưu ý: *40 đô la/tháng tiết kiệm so với t3.large trước. Quyết định đúng.*

Maya đang nhìn thứ gì đó khác trên màn hình của cô.

"Leo," cô nói. "Trong khi bạn đang định cỡ lại instance, website đã ngừng hoạt động trong
mười hai phút."

Leo ngước nhìn.

"Chúng ta có một hàng đợi hai trăm đơn hàng chưa hoàn thành."

Anh nhìn màn hình. Rồi nhìn trần nhà. Rồi quay lại màn hình.

"Chúng ta cần thứ gì đó cho hình ảnh của mình," anh nói, thay đổi chủ đề một chút. "Ngay bây giờ,
các ảnh thực đơn được tải lên được lưu trực tiếp trên máy chủ. Nếu chúng ta định cỡ lại hoặc khởi động lại
instance, chúng ta có mất chúng không?"

Priya đã biết câu trả lời.

Chương tiếp theo: nơi các tệp sống khi không có ổ cứng nào để chỉ vào.
