# Phụ Lục D: Bài Thi Thực Hành Đầy Đủ (65 Câu Hỏi)

Đây là một bài thi thực hành SAA-C03 đầy đủ: 65 câu hỏi, phản ánh trọng số phạm vi của kỳ thi thật — Design Secure Architectures (Câu 1–20, ~30%), Design Resilient Architectures (21–37, ~26%), Design High-Performing Architectures (38–53, ~24%) và Design Cost-Optimized Architectures (54–65, ~20%).

**Cách làm bài:**

- Đặt đồng hồ hẹn giờ **130 phút** — thời lượng của kỳ thi thật. Luyện nhịp độ: đó là hai phút mỗi câu.
- Bảy câu hỏi nói **"(Chọn HAI.)"** — chúng có năm tùy chọn và chính xác hai đáp án đúng, giống hệt các mục đa phản hồi của kỳ thi thật. Cả hai phải đúng để được điểm câu hỏi.
- Đừng nhìn đáp án cho đến khi bạn hoàn thành cả 65 câu. Trong kỳ thi thật không có phản hồi giữa chừng, và rèn luyện khả năng chịu đựng sự không chắc chắn là một phần của quá trình chuẩn bị.
- Kỳ thi thật bao gồm 15 câu hỏi thử nghiệm không tính điểm mà bạn không thể nhận ra. Cả 65 câu ở đây đều được "tính điểm." Một mốc chuẩn để đậu: **47 câu đúng trở lên (~72%)** đặt bạn vào phạm vi của điểm đậu theo thang 720/1000. Dưới 47, hãy xem lại các chương được ánh xạ trong Phụ Lục B cho các phạm vi yếu của bạn trước khi đăng ký thi.
- Với mỗi câu bạn làm sai — và mỗi câu bạn làm đúng nhưng do dự — hãy đọc phần phân tích distractor. Kỳ thi kiểm tra *sự khác biệt* giữa các tùy chọn hợp lý, và đó là nơi sự học hỏi nằm ở đó.

---

## Phần 1 — Design Secure Architectures (Câu 1–20)

**Câu 1** *(Domain 1 — Task 1.1)*
Một công ty dịch vụ tài chính dùng AWS Organizations với tất cả tính năng được bật. Đội bảo mật đã gắn một service control policy (SCP) vào root của tổ chức từ chối việc dùng tất cả AWS Region trừ eu-west-1. Trong một cuộc kiểm toán, đội phát hiện rằng một quản trị viên trong một tài khoản vẫn có thể khởi chạy các instance EC2 ở us-east-2 bất chấp SCP. Tài khoản nào nhiều khả năng nhất đã cho phép hành động này?

A) Một tài khoản thành viên trong một organizational unit (OU) lồng nhau, vì SCP không lan truyền đến các OU lồng nhau
B) Tài khoản quản lý, vì SCP không áp dụng cho tài khoản quản lý
C) Một tài khoản thành viên có IAM administrator policy bao gồm một Allow rõ ràng, ghi đè SCP
D) Một tài khoản thành viên được tạo sau khi SCP được gắn, vì SCP chỉ áp dụng cho các tài khoản tồn tại tại thời điểm gắn

**Câu 2** *(Domain 1 — Task 1.1)*
Một startup muốn cho phép các nhà phát triển của mình tạo IAM role cho các ứng dụng của họ, nhưng đội bảo mật lo ngại rằng nhà phát triển có thể tạo các role với nhiều quyền hơn chính bản thân các nhà phát triển có, dẫn đến leo thang đặc quyền. Đội bảo mật muốn các nhà phát triển giữ quyền tự tạo role. Giải pháp PHÙ HỢP NHẤT là gì?

A) Yêu cầu các nhà phát triển gửi yêu cầu tạo role qua một hệ thống ticket được đội bảo mật xem xét
B) Gắn một SCP vào các tài khoản của nhà phát triển từ chối hoàn toàn action iam:CreateRole
C) Yêu cầu rằng tất cả các role được nhà phát triển tạo phải bao gồm một permissions boundary cụ thể, được thực thi bằng một IAM condition trên iam:CreateRole và iam:AttachRolePolicy
D) Bật AWS CloudTrail và cấu hình cảnh báo bất cứ khi nào một nhà phát triển tạo một IAM role mới

**Câu 3** *(Domain 1 — Task 1.1)*
Một nhà cung cấp SaaS cần truy cập tài nguyên trong các tài khoản AWS của khách hàng để thực hiện phân tích chi phí tự động. Khách hàng tạo một IAM role mà tài khoản của nhà cung cấp SaaS có thể đảm nhận. Một cố vấn bảo mật cảnh báo rằng một bên thứ ba biết được role ARN của khách hàng có thể lừa nhà cung cấp SaaS truy cập tài khoản của khách hàng đó thay mặt cho bên thứ ba. Cơ chế nào giảm thiểu rủi ro "confused deputy" này?

A) Yêu cầu multi-factor authentication (MFA) trên trust policy của cross-account role
B) Yêu cầu nhà cung cấp SaaS truyền một ExternalId duy nhất, do khách hàng định nghĩa, trong cuộc gọi sts:AssumeRole và được xác thực bằng một condition trong trust policy của role
C) Mã hóa role ARN bằng AWS KMS trước khi chia sẻ với nhà cung cấp SaaS
D) Thay thế cross-account role bằng một IAM user có access key được rotation mỗi 90 ngày

**Câu 4** *(Domain 1 — Task 1.1)*
Một công ty với 40 tài khoản AWS trong AWS Organizations muốn nhân viên của mình đăng nhập một lần với thông tin xác thực Microsoft Entra ID (Azure AD) hiện có của họ và truy cập tất cả các tài khoản AWS qua một portal duy nhất, với quyền được gán tập trung theo từng tài khoản. Giải pháp nào đáp ứng các yêu cầu này với chi phí vận hành ÍT NHẤT?

A) Tạo IAM user trong mỗi 40 tài khoản và đồng bộ mật khẩu với Entra ID
B) Cấu hình AWS IAM Identity Center với Entra ID làm nhà cung cấp danh tính bên ngoài và gán permission set cho user và group theo từng tài khoản
C) Triển khai Amazon Cognito user pool trong mỗi tài khoản và liên kết chúng với Entra ID
D) Tạo một SAML identity provider trong mỗi tài khoản và viết các IAM role và trust policy theo từng tài khoản một cách thủ công

**Câu 5** *(Domain 1 — Task 1.1)*
Một công ty game di động đang xây dựng một ứng dụng nơi người chơi đăng ký bằng một địa chỉ email hoặc đăng nhập xã hội, và sau khi xác thực, ứng dụng phải tải lên ảnh chụp màn hình của người chơi trực tiếp đến một Amazon S3 bucket dùng thông tin xác thực AWS tạm thời. Kết hợp dịch vụ nào kiến trúc sư giải pháp nên đề xuất?

A) Một Amazon Cognito user pool cho đăng ký/đăng nhập, và một Amazon Cognito identity pool để đổi token đã xác thực lấy thông tin xác thực AWS tạm thời
B) Một Amazon Cognito identity pool cho đăng ký/đăng nhập, và một Amazon Cognito user pool để phát hành thông tin xác thực AWS tạm thời
C) AWS IAM Identity Center cho đăng ký/đăng nhập, và AWS STS GetSessionToken cho thông tin xác thực
D) Chỉ một Amazon Cognito user pool, vì token của user pool cấp quyền truy cập trực tiếp đến S3

**Câu 6** *(Domain 1 — Task 1.3)*
Một công ty chăm sóc sức khỏe phải mã hóa dữ liệu trong Amazon S3 bằng một khóa hỗ trợ rotation tự động hàng năm do AWS quản lý, trong khi vẫn cho phép công ty định nghĩa key policy, bật ghi log CloudTrail về việc sử dụng khóa, và vô hiệu hóa khóa nếu cần. Loại KMS key nào đáp ứng các yêu cầu này?

A) Một AWS managed key (aws/s3)
B) Một customer managed key với rotation tự động được bật
C) Một AWS owned key
D) Một customer managed key với key material được nhập (BYOK) và rotation tự động được bật

**Câu 7** *(Domain 1 — Task 1.3)*
Một kiến trúc sư giải pháp đang giải thích cách AWS KMS mã hóa một tệp 4 GB được lưu bởi một ứng dụng, biết rằng KMS chỉ có thể mã hóa trực tiếp tối đa 4 KB dữ liệu. Câu nào mô tả chính xác envelope encryption?

A) KMS chia tệp thành các đoạn 4 KB và mã hóa mỗi đoạn bằng KMS key
B) Ứng dụng yêu cầu một data key từ KMS, mã hóa tệp cục bộ bằng plaintext data key, sau đó lưu data key đã mã hóa cùng với dữ liệu và loại bỏ plaintext data key
C) KMS truyền tệp qua KMS API, mã hóa nó phía máy chủ bằng KMS key
D) Ứng dụng mã hóa tệp bằng một khóa đối xứng hardcode, và KMS ký kết quả để toàn vẹn

**Câu 8** *(Domain 1 — Task 1.3)*
Một công ty lưu trữ mật khẩu master của Amazon RDS for PostgreSQL và cần nó được rotation tự động mỗi 30 ngày mà không có thời gian ngừng ứng dụng. Ứng dụng giữ các kết nối cơ sở dữ liệu dài hạn, vì vậy đội muốn một chiến lược rotation trong đó thông tin xác thực trước đó vẫn còn hiệu lực trong khi cái mới được kích hoạt. Giải pháp nào đáp ứng các yêu cầu này?

A) Các tham số SecureString của AWS Systems Manager Parameter Store với một hàm Lambda được kích hoạt hàng tháng
B) AWS Secrets Manager với chiến lược rotation single-user
C) AWS Secrets Manager với chiến lược rotation alternating-users, chuyển đổi giữa hai database user để một thông tin xác thực luôn còn hiệu lực
D) Rotation khóa tự động của AWS KMS được áp dụng cho mật khẩu cơ sở dữ liệu

**Câu 9** *(Domain 1 — Task 1.3)*
Một công ty truyền thông lưu video thô trong Amazon S3. Tuân thủ yêu cầu rằng công ty quản lý và cung cấp khóa mã hóa của riêng mình, rằng AWS không bao giờ lưu các khóa đó, và rằng các khóa được cung cấp với mỗi yêu cầu. Tùy chọn mã hóa nào đáp ứng các yêu cầu này?

A) SSE-S3
B) SSE-KMS với một customer managed key
C) SSE-C
D) Mã hóa phía client dùng AWS managed key aws/s3

**Câu 10** *(Domain 1 — Task 1.3)*
Một broker-dealer phải lưu giữ hồ sơ giao dịch trong Amazon S3 trong bảy năm theo cách ngăn bất kỳ ai—bao gồm cả AWS account root user—xóa hoặc ghi đè các object trong thời gian lưu giữ, để thỏa mãn SEC Rule 17a-4. Cấu hình nào đáp ứng yêu cầu này?

A) S3 Object Lock ở chế độ governance với thời gian lưu giữ 7 năm
B) S3 Object Lock ở chế độ compliance với thời gian lưu giữ 7 năm trên một bucket được bật versioning
C) Một S3 bucket policy từ chối s3:DeleteObject cho tất cả principal
D) S3 Glacier Deep Archive với một quy tắc lifecycle hết hạn các object sau 7 năm

**Câu 11** *(Domain 1 — Task 1.2)*
Một ứng dụng web chạy trên các instance EC2 phía sau một Application Load Balancer. Một kỹ sư mạng thêm một quy tắc network ACL vào subnet cho phép TCP port 443 vào từ 0.0.0.0/0, nhưng client vẫn không thể hoàn thành các yêu cầu HTTPS. Các security group được cấu hình đúng. Nguyên nhân NHIỀU KHẢ NĂNG NHẤT là gì?

A) Network ACL có trạng thái và yêu cầu một quy tắc connection-tracking
B) Network ACL không có quy tắc ra cho phép các ephemeral port (1024–65535), vì vậy lưu lượng trả về bị chặn vì NACL không trạng thái
C) Security group cũng phải cho phép port 443 ra, vì security group không trạng thái
D) Network ACL không thể cho phép lưu lượng từ 0.0.0.0/0; một CIDR cụ thể là bắt buộc

**Câu 12** *(Domain 1 — Task 1.2)*
HAI câu nào về security group và network ACL trong một VPC là chính xác? (Chọn HAI.)

A) Security group có trạng thái, vì vậy lưu lượng trả về tự động được cho phép bất kể các quy tắc ra
B) Network ACL đánh giá các quy tắc theo thứ tự số và hỗ trợ các quy tắc Deny rõ ràng
C) Security group hỗ trợ cả quy tắc Allow và Deny
D) Network ACL được gắn vào các elastic network interface riêng lẻ
E) Các quy tắc security group được đánh giá theo thứ tự số, dừng tại match đầu tiên

**Câu 13** *(Domain 1 — Task 1.2)*
Một công ty thương mại điện tử chạy một ứng dụng hướng công khai trên CloudFront và ALB lo ngại về các tấn công DDoS lớn, tinh vi. Công ty muốn quyền truy cập 24/7 đến AWS Shield Response Team, bảo vệ chi phí chống lại các khoản phí mở rộng do tấn công gây ra, và chẩn đoán tấn công. Dịch vụ nào nên dùng?

A) AWS Shield Standard, được bật tự động miễn phí
B) AWS Shield Advanced
C) AWS WAF với các quy tắc dựa trên tốc độ
D) Amazon GuardDuty với gói bảo vệ EC2

**Câu 14** *(Domain 1 — Task 1.2)*
Một REST API phía sau một Application Load Balancer đang bị tấn công bằng các nỗ lực SQL injection và các yêu cầu quá mức từ một tập nhỏ các địa chỉ IP. Giải pháp nào chặn các mẫu yêu cầu độc hại tại edge của ứng dụng với ÍT công sức phát triển NHẤT?

A) Thêm code xác thực đầu vào vào mọi API handler
B) Liên kết AWS WAF với ALB, dùng nhóm quy tắc được quản lý SQL injection và một quy tắc dựa trên tốc độ
C) Bật AWS Shield Standard trên ALB
D) Cấu hình security group của ALB từ chối các yêu cầu chứa từ khóa SQL

**Câu 15** *(Domain 1 — Task 1.2)*
Một công ty muốn giải quyết ba nhu cầu bảo mật: (1) liên tục phát hiện các instance EC2 bị xâm phạm và hoạt động API bất thường dùng threat intelligence, (2) khám phá và phân loại thông tin nhận dạng cá nhân (PII) được lưu trong các S3 bucket, và (3) quét các instance EC2 và image container để tìm các lỗ hổng phần mềm (CVE). Ánh xạ nào của các dịch vụ AWS đến nhu cầu là đúng?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Câu 16** *(Domain 1 — Task 1.2)*
Một ứng dụng chạy trên các instance EC2 trong các subnet riêng tư phải tải các object lên Amazon S3 và gọi Amazon DynamoDB. Chính sách công ty cấm lưu lượng băng qua internet công cộng, và đội muốn tùy chọn chi phí thấp nhất cho cả hai dịch vụ. Giải pháp nào đáp ứng các yêu cầu này?

A) Một NAT gateway trong một subnet công khai
B) Gateway VPC endpoint cho S3 và DynamoDB, được tham chiếu trong route table của các subnet
C) Interface VPC endpoint (AWS PrivateLink) cho S3 và DynamoDB
D) Một internet gateway với các quy tắc security group hạn chế

**Câu 17** *(Domain 1 — Task 1.3)*
Sau một sự cố server-side request forgery (SSRF) trong đó một kẻ tấn công truy xuất thông tin xác thực IAM role từ metadata service của một instance EC2 qua một ứng dụng web dễ bị tổn thương, một đội bảo mật muốn củng cố tất cả các instance chống lại lớp tấn công này. Đội nên làm gì?

A) Thực thi IMDSv2 bằng cách yêu cầu session token (HttpTokens=required), để các yêu cầu metadata cần một token có được qua PUT mà các yêu cầu SSRF đơn giản không thể có được
B) Vô hiệu hóa instance metadata service trên tất cả các instance, vì các ứng dụng không bao giờ cần nó
C) Chặn 169.254.169.254 trong network ACL của subnet
D) Chuyển thông tin xác thực của instance role vào một tệp cấu hình trên instance

**Câu 18** *(Domain 1 — Task 1.3)*
Một kiến trúc sư giải pháp phải lưu khoảng 200 giá trị cấu hình ứng dụng plaintext (feature flag, tên môi trường, URL endpoint) và 5 mật khẩu cơ sở dữ liệu. Các mật khẩu yêu cầu rotation tự động; các giá trị cấu hình thì không, và đội muốn giảm thiểu chi phí. Kết hợp nào TỐI ƯU CHI PHÍ NHẤT?

A) Lưu mọi thứ trong AWS Secrets Manager
B) Lưu mọi thứ trong các tham số standard của AWS Systems Manager Parameter Store
C) Lưu các giá trị cấu hình trong các tham số standard của Parameter Store (miễn phí) và các mật khẩu trong AWS Secrets Manager với rotation được bật
D) Lưu các giá trị cấu hình trong S3 và các mật khẩu trong các tham số SecureString của Parameter Store với rotation tự động tích hợp sẵn

**Câu 19** *(Domain 1 — Task 1.3)*
Một công ty mã hóa các object S3 với SSE-KMS dùng một customer managed key. Một ứng dụng trong cùng tài khoản đọc các object này hàng nghìn lần mỗi giây, và đội đang thấy throttling và lo ngại về chi phí từ các cuộc gọi KMS API. Thay đổi nào giảm lưu lượng yêu cầu KMS trong khi vẫn giữ mã hóa SSE-KMS?

A) Chuyển bucket sang SSE-S3, không dùng khóa nào
B) Bật S3 Bucket Keys, để S3 dùng một khóa cấp bucket ngắn hạn để giảm các cuộc gọi đến KMS
C) Vô hiệu hóa rotation khóa tự động trên customer managed key
D) Thay thế customer managed key bằng key material được nhập

**Câu 20** *(Domain 1 — Task 1.1)*
HAI câu nào về đánh giá IAM policy và AWS Organizations là chính xác? (Chọn HAI.)

A) SCP cấp quyền cho các IAM user và role trong các tài khoản thành viên
B) Một Deny rõ ràng trong bất kỳ policy áp dụng nào luôn ghi đè bất kỳ Allow nào
C) Resource-based policy không thể cấp truy cập cross-account mà không có một SCP
D) Một permissions boundary thiết lập quyền tối đa mà một identity-based policy có thể cấp cho một user hoặc role, nhưng tự nó không cấp gì cả
E) Nếu không có policy nào đề cập đến một action, action đó được cho phép theo mặc định cho các IAM user

---

## Phần 2 — Design Resilient Architectures (Câu 21–37)

**Câu 21** *(Domain 2 — Task 2.2)*
Một nhà bán lẻ trực tuyến chạy Amazon RDS for MySQL. Cơ sở dữ liệu trải qua lưu lượng đọc nặng từ các dashboard báo cáo, và công ty cũng cần cơ sở dữ liệu sống sót qua một lỗi Availability Zone với failover tự động và không can thiệp thủ công. Kết hợp nào giải quyết CẢ HAI yêu cầu?

A) Chỉ bật Multi-AZ deployment; instance standby có thể phục vụ các lượt đọc báo cáo
B) Chỉ tạo read replica; một replica được tự động thăng cấp khi AZ của primary lỗi
C) Bật Multi-AZ deployment cho failover tự động, và thêm read replica để giảm tải các lượt đọc báo cáo
D) Di chuyển sang một loại instance single-AZ lớn hơn để xử lý cả hai khối lượng công việc

**Câu 22** *(Domain 2 — Task 2.2)*
Một công ty muốn RDS tính khả dụng cao trên các Availability Zone, nhưng phản đối việc trả tiền cho một instance standby Multi-AZ truyền thống không phục vụ lưu lượng nào. Tùy chọn deployment RDS nào cung cấp failover tự động VÀ cho phép năng lực standby phục vụ lưu lượng đọc?

A) RDS Multi-AZ DB instance deployment (một standby)
B) RDS Multi-AZ DB cluster deployment, có hai instance standby có thể đọc với một reader endpoint
C) RDS read replica trong ba AZ với một Application Load Balancer
D) RDS Single-AZ với automated backup

**Câu 23** *(Domain 2 — Task 2.2)*
Một nền tảng thanh toán toàn cầu trên Amazon Aurora phải failover sang một AWS Region thứ hai nếu Region chính trở nên không khả dụng. Đội tuân thủ hỏi liệu Aurora Global Database có thể đảm bảo mất dữ liệu bằng không (RPO = 0) trên các Region. Kiến trúc sư giải pháp nên nói gì với họ?

A) Có — Aurora Global Database sao chép đồng bộ trên các Region, vì vậy RPO chính xác là 0
B) Không — Aurora Global Database dùng sao chép dựa trên lưu trữ không đồng bộ với độ trễ điển hình dưới 1 giây, vì vậy RPO cross-Region gần bằng không nhưng không bao giờ được đảm bảo chính xác là 0
C) Có — nhưng chỉ khi write forwarding được bật trên Region thứ cấp
D) Không — Aurora Global Database sao chép theo lịch 5 phút, cho một RPO 5 phút

**Câu 24** *(Domain 2 — Task 2.2)*
Kế hoạch khôi phục sau thảm họa của một công ty nêu: "Sau một sự cố Region, hệ thống đơn hàng phải chạy lại trong vòng 4 giờ, và không quá 15 phút giao dịch có thể bị mất." Câu nào ánh xạ đúng các con số này đến các metric DR?

A) RTO = 15 phút; RPO = 4 giờ
B) RTO = 4 giờ; RPO = 15 phút
C) MTBF = 4 giờ; MTTR = 15 phút
D) RPO = 4 giờ; SLA = 15 phút

**Câu 25** *(Domain 2 — Task 2.2)*
Một công ty bảo hiểm cần một chiến lược DR cho một ứng dụng quan trọng. Yêu cầu: dữ liệu phải được sao chép liên tục đến DR Region; cơ sở hạ tầng cốt lõi (cơ sở dữ liệu, AMI, stack tối thiểu) phải đã tồn tại trong DR Region nhưng tính toán nên giữ tắt cho đến khi có thảm họa, để kiểm soát chi phí; một RTO hàng chục phút là chấp nhận được. Chiến lược DR nào khớp?

A) Backup and restore
B) Pilot light — các thành phần cốt lõi được cấp phát trong DR Region với dữ liệu được sao chép trực tiếp, nhưng tính toán tắt cho đến khi failover
C) Warm standby — một bản sao đầy đủ thu nhỏ nhưng luôn chạy của khối lượng công việc
D) Multi-site active/active

**Câu 26** *(Domain 2 — Task 2.2)*
HAI câu nào về các chiến lược khôi phục sau thảm họa của AWS là chính xác? (Chọn HAI.)

A) Backup and restore yêu cầu tài nguyên được cấp phát trước và chạy trong recovery Region
B) Backup and restore cung cấp RTO thấp nhất trong bốn chiến lược
C) Multi-site active/active phục vụ lưu lượng từ nhiều Region đồng thời và cung cấp RTO gần bằng không với chi phí cao nhất
D) Pilot light giữ một bản sao đầy đủ năng lực của ứng dụng phục vụ lưu lượng sản xuất trong recovery Region
E) Warm standby giữ một bản sao thu nhỏ nhưng đầy đủ chức năng của khối lượng công việc luôn chạy trong recovery Region

**Câu 27** *(Domain 2 — Task 2.1)*
Một ứng dụng xử lý ảnh đọc tin nhắn từ một Amazon SQS standard queue. Xử lý một ảnh mất đến 3 phút, nhưng visibility timeout của queue được đặt là 30 giây. Người dùng báo cáo rằng một số ảnh được xử lý hai hoặc ba lần. Nguyên nhân và cách khắc phục NHIỀU KHẢ NĂNG NHẤT là gì?

A) Queue là FIFO; chuyển sang một standard queue
B) Visibility timeout hết hạn trước khi xử lý kết thúc, làm tin nhắn hiển thị lại cho các consumer khác; tăng visibility timeout vượt thời gian xử lý
C) Long polling bị vô hiệu hóa; bật một ReceiveMessageWaitTime 20 giây
D) Thời gian lưu giữ tin nhắn quá ngắn; tăng nó lên 14 ngày

**Câu 28** *(Domain 2 — Task 2.1)*
Một ứng dụng billing tiêu thụ tin nhắn từ một SQS queue. Đôi khi một tin nhắn bị lỗi định dạng khiến consumer thất bại lặp đi lặp lại, và tin nhắn quay vòng qua queue mãi mãi, lãng phí tính toán. Kiến trúc sư nên cấu hình gì?

A) Một dead-letter queue với một redrive policy maxReceiveCount, để các tin nhắn thất bại lặp đi lặp lại được chuyển sang một bên để phân tích
B) Một visibility timeout ngắn hơn để tin nhắn xấu được thử lại nhanh hơn
C) Sắp xếp FIFO, tự động loại bỏ các tin nhắn bị lỗi định dạng
D) Một thời gian lưu giữ tin nhắn 1 phút để các tin nhắn xấu hết hạn nhanh

**Câu 29** *(Domain 2 — Task 2.1)*
Một công ty môi giới xử lý các sự kiện giao dịch theo từng tài khoản khách hàng. Các sự kiện cho cùng một tài khoản phải được xử lý nghiêm ngặt theo thứ tự và chính xác một lần, nhưng các sự kiện cho các tài khoản khác nhau có thể được xử lý song song để có thông lượng. Giải pháp nào đáp ứng các yêu cầu này?

A) Một SQS standard queue với một luồng consumer
B) Một SQS FIFO queue dùng ID tài khoản khách hàng làm MessageGroupId, bảo toàn thứ tự trong mỗi group trong khi cho phép song song trên các group
C) Một SNS standard topic với lọc tin nhắn theo ID tài khoản
D) Một SQS FIFO queue với một MessageGroupId duy nhất cho tất cả khách hàng

**Câu 30** *(Domain 2 — Task 2.1)*
Khi một đơn hàng được đặt, một nền tảng thương mại điện tử phải đồng thời kích hoạt ba quy trình độc lập: tạo hóa đơn, hoàn thành kho hàng và nhập phân tích. Mỗi quy trình phải nhận mọi sự kiện đơn hàng, đệm nó bền vững, và xử lý nó theo tốc độ riêng của mình. Kiến trúc nào đáp ứng các yêu cầu này?

A) Một SQS queue với ba consumer polling cùng một queue
B) Một SNS topic fan-out đến ba SQS queue, mỗi queue được đăng ký cho một quy trình
C) Ba hàm Lambda được Step Functions gọi tuần tự
D) Một SNS topic với ba subscription email

**Câu 31** *(Domain 2 — Task 2.1)*
Trong một flash sale, một hàm Lambda được API Gateway kích hoạt bắt đầu trả về các lỗi throttling 429 trong khi các hàm Lambda quan trọng khác trong cùng tài khoản cũng bắt đầu bị throttling. Tài khoản đang ở quota concurrency mặc định của nó. Hành động nào bảo vệ các hàm quan trọng khỏi bị bỏ đói bởi hàm sale?

A) Tăng timeout của hàm sale từ 3 giây lên mức tối đa 15 phút
B) Cấu hình reserved concurrency trên các hàm quan trọng (và tùy chọn giới hạn hàm sale), đảm bảo cho chúng concurrency dành riêng từ account pool
C) Bật provisioned concurrency trên hàm sale, làm tăng quota toàn tài khoản
D) Chuyển các hàm quan trọng sang cấu hình bộ nhớ 10 GB

**Câu 32** *(Domain 2 — Task 2.1)*
Một công ty truyền thông có một quy trình xuất bản video với một bước chờ đến 2 ngày để một người kiểm duyệt phê duyệt nội dung qua một công cụ bên ngoài trước khi tiếp tục. Quy trình phải có thể kiểm toán, chạy trong nhiều ngày, và tiếp tục chính xác nơi nó tạm dừng khi người kiểm duyệt phản hồi. Giải pháp nào phù hợp NHẤT?

A) Một Express Step Functions workflow với một Wait state
B) Một Standard Step Functions workflow dùng mẫu callback: một task token (waitForTaskToken) được gửi đến hệ thống kiểm duyệt, và workflow tiếp tục khi SendTaskSuccess được gọi
C) Một hàm Lambda ngủ cho đến khi người kiểm duyệt phê duyệt
D) Một EventBridge rule với một độ trễ theo lịch 2 ngày

**Câu 33** *(Domain 2 — Task 2.1)*
Một công ty chạy một đường dẫn nhập IoT khối lượng lớn thực thi khoảng 90.000 lần thực thi workflow ngắn mỗi giây, mỗi lần hoàn thành trong dưới 5 giây. Ngữ nghĩa thực thi chính xác một lần không bắt buộc, nhưng chi phí phải được giảm thiểu. Riêng biệt, một workflow đối chiếu tài chính hàng tháng chạy trong 12 giờ và yêu cầu thực thi chính xác một lần với lịch sử thực thi đầy đủ. Loại workflow Step Functions nào nên được dùng?

A) Express workflow cho đường dẫn IoT; Standard workflow cho việc đối chiếu
B) Standard workflow cho cả hai
C) Express workflow cho cả hai, vì Express hỗ trợ thực thi lên đến một năm
D) Standard workflow cho đường dẫn IoT; Express workflow cho việc đối chiếu

**Câu 34** *(Domain 2 — Task 2.2)*
Một công ty host ứng dụng web chính của mình trên một ALB ở us-east-1 và một bản sao khôi phục thụ động ở us-west-2. Công ty muốn Route 53 gửi tất cả lưu lượng đến us-east-1 và tự động chuyển hướng người dùng đến us-west-2 chỉ khi endpoint chính trở nên không lành mạnh. Cấu hình Route 53 nào đáp ứng yêu cầu này?

A) Weighted routing với trọng số 50/50
B) Failover routing với một health check trên bản ghi chính và bản ghi us-west-2 được đặt làm thứ cấp
C) Latency-based routing giữa hai Region
D) Geolocation routing với một bản ghi mặc định trỏ đến us-west-2

**Câu 35** *(Domain 2 — Task 2.2)*
Một Auto Scaling group chạy các web server EC2 phía sau một Application Load Balancer trên ba Availability Zone. ALB đánh dấu một số instance không lành mạnh vì tiến trình web server crash, nhưng Auto Scaling group không bao giờ thay thế chúng vì bản thân các instance EC2 vẫn vượt qua status check. Kiến trúc sư giải pháp nên thay đổi gì?

A) Bật giám sát CloudWatch chi tiết trên các instance
B) Cấu hình Auto Scaling group để dùng ELB health check ngoài EC2 status check, để các instance thất bại ALB target health bị chấm dứt và thay thế
C) Tăng health check grace period của ASG
D) Chuyển ALB sang một Network Load Balancer

**Câu 36** *(Domain 2 — Task 2.1)*
Một công ty giao dịch cần một load balancer cho một giao thức TCP tùy chỉnh phải xử lý hàng triệu yêu cầu mỗi giây với độ trễ siêu thấp và phơi ra một địa chỉ IP tĩnh cho mỗi Availability Zone. Load balancer nào công ty nên chọn?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Câu 37** *(Domain 2 — Task 2.2)*
HAI câu nào về xây dựng lưu trữ kiên cường trên AWS là chính xác? (Chọn HAI.)

A) S3 Cross-Region Replication sao chép hồi tố tất cả các object đã tồn tại trước khi replication được cấu hình, không cần hành động bổ sung nào
B) Các storage class Amazon EFS Standard lưu dữ liệu dự phòng trên nhiều Availability Zone và có thể được mount đồng thời bởi các instance ở các AZ khác nhau
C) S3 Cross-Region Replication yêu cầu versioning được bật trên cả bucket nguồn và đích
D) Các volume Amazon EFS chỉ có thể được gắn vào một instance EC2 tại một thời điểm, giống như EBS
E) Bật S3 versioning tự động sao chép các object đến một Region khác

---

## Phần 3 — Design High-Performing Architectures (Câu 38–53)

**Câu 38** *(Domain 3 — Task 3.1)*
Một công ty phân tích truyền thông chạy một cơ sở dữ liệu PostgreSQL trên Amazon RDS dùng một volume EBS gp3. Một khối lượng công việc báo cáo mới yêu cầu 50.000 IOPS bền vững với độ trễ dưới mili giây và một đảm bảo độ bền 99,999%. Volume phải hỗ trợ điều này một cách nhất quán mà không bursting. Loại volume EBS nào kiến trúc sư giải pháp nên đề xuất?

A) gp3 được cấp phát với IOPS tối đa
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 với kích thước volume 16 TiB

**Câu 39** *(Domain 3 — Task 3.1)*
Một công ty nghiên cứu genomics cần lưu trữ tệp chia sẻ cho một cluster high-performance computing (HPC) dựa trên Linux gồm 500 instance EC2. Khối lượng công việc yêu cầu độ trễ dưới mili giây và hàng trăm GB/s thông lượng tổng hợp, và các tập dữ liệu đầu vào được staging trong Amazon S3. Dịch vụ lưu trữ nào đáp ứng tốt nhất các yêu cầu này?

A) Amazon EFS với chế độ hiệu suất Max I/O
B) Amazon FSx for Windows File Server với lưu trữ SSD
C) Amazon FSx for Lustre liên kết với S3 bucket
D) Amazon S3 được truy cập qua Mountpoint trên mỗi instance

**Câu 40** *(Domain 3 — Task 3.1)*
Một công ty đang di chuyển một ứng dụng Windows tại chỗ dựa vào các file share SMB và các access control list tích hợp Active Directory. Ứng dụng sẽ chạy trên các instance EC2 Windows ở hai Availability Zone và phải giữ các quyền NTFS hiện có của nó. Dịch vụ lưu trữ AWS nào kiến trúc sư giải pháp nên chọn?

A) Amazon EFS với quyền POSIX
B) Amazon FSx for Windows File Server ở chế độ deployment Multi-AZ
C) Amazon S3 với các bucket policy được ánh xạ đến các group AD
D) Amazon FSx for Lustre với lưu trữ persistent

**Câu 41** *(Domain 3 — Task 3.1)*
Một công ty sản xuất video ở Singapore tải lên các tệp footage thô 40 GB đến một S3 bucket ở us-east-1 từ các văn phòng trên toàn thế giới. Việc tải lên thường xuyên thất bại giữa chừng qua internet công cộng, buộc khởi động lại hoàn toàn, và thời gian chuyển tổng thể chậm. Kết hợp hành động nào kiến trúc sư giải pháp nên đề xuất? (Chọn HAI.)

A) Chuyển đổi bucket sang S3 One Zone-IA để cải thiện thông lượng ghi
B) Đặt một Application Load Balancer phía trước bucket ở mỗi region
C) Bật S3 Cross-Region Replication đến một bucket ở ap-southeast-1
D) Bật S3 Transfer Acceleration trên bucket và tải lên qua accelerated endpoint
E) Dùng multipart upload cho các tệp lớn

**Câu 42** *(Domain 3 — Task 3.1)*
Một nền tảng đấu giá thời gian thực chạy một khối lượng công việc NoSQL trên EC2 cần độ trễ lưu trữ thấp tuyệt đối cho dữ liệu scratch tạm thời. Dữ liệu được tái tạo khi khởi động và không cần sống sót qua việc dừng hoặc chấm dứt instance. Tùy chọn lưu trữ nào cung cấp hiệu suất cao nhất cho trường hợp sử dụng này?

A) volume io2 EBS với 64.000 IOPS được cấp phát
B) Các volume instance store (NVMe SSD) trên một instance được tối ưu lưu trữ
C) Amazon EFS ở chế độ General Purpose
D) volume gp3 EBS với thông lượng được cấp phát tối đa

**Câu 43** *(Domain 3 — Task 3.3)*
Một công ty game lưu dữ liệu session của người chơi trong một bảng DynamoDB với partition key `game_id`. Chỉ có 12 game phổ biến, và bảng đang trải qua throttling trên một vài partition trong khi năng lực tiêu thụ tổng thể thấp hơn nhiều so với năng lực được cấp phát. Kiến trúc sư giải pháp nên đề xuất gì?

A) Chuyển bảng sang provisioned capacity với auto scaling
B) Dùng một partition key có độ phân biệt cao, chẳng hạn một composite của game_id và player_id
C) Tạo một local secondary index trên player_id
D) Bật DynamoDB Streams để phân tán các lượt ghi trên các partition

**Câu 44** *(Domain 3 — Task 3.3)*
Một trang thương mại điện tử lưu dữ liệu catalog sản phẩm trong DynamoDB. Lưu lượng đọc cực kỳ nặng đọc với cùng các item được yêu cầu hàng triệu lần mỗi ngày, và đội cần độ trễ đọc micro giây mà không viết lại các cuộc gọi DynamoDB API của ứng dụng. Kiến trúc sư giải pháp nên đề xuất gì?

A) Triển khai Amazon ElastiCache for Redis và sửa đổi ứng dụng để kiểm tra cache trước
B) Thêm DynamoDB Accelerator (DAX) phía trước bảng
C) Tạo một global secondary index để phân tán các lượt đọc
D) Bật DynamoDB Global Tables ở một region thứ hai

**Câu 45** *(Domain 3 — Task 3.3)*
Một công ty logistics có một bảng DynamoDB trong sản xuất cần một mẫu truy vấn mới: truy vấn các lô hàng theo `carrier_id` và sắp xếp theo `delivery_date`, với thông lượng được cấp phát riêng để các truy vấn phân tích mới không ảnh hưởng đến ứng dụng chính. Bảng đã tồn tại và có lưu lượng trực tiếp. Giải pháp nào đáp ứng các yêu cầu này?

A) Tạo một local secondary index với carrier_id làm sort key
B) Tạo một global secondary index với carrier_id làm partition key và delivery_date làm sort key
C) Tạo lại bảng với một composite primary key của carrier_id và delivery_date
D) Bật một DynamoDB Stream và truy vấn stream theo carrier_id

**Câu 46** *(Domain 3 — Task 3.3)*
Một dịch vụ quản lý session lưu các session người dùng trong DynamoDB. Các session trở nên vô dụng sau 24 giờ, và đội muốn các item hết hạn được xóa tự động mà không có chi phí bổ sung. Kiến trúc sư giải pháp nên triển khai gì?

A) Một hàm Lambda theo lịch quét bảng hàng giờ và xóa các item cũ
B) DynamoDB Time to Live (TTL) với một thuộc tính timestamp hết hạn trên mỗi item
C) Một lifecycle policy trên bảng DynamoDB
D) DynamoDB Streams với một filter để loại bỏ các item cũ hơn 24 giờ

**Câu 47** *(Domain 3 — Task 3.3)*
Một ứng dụng serverless dùng các hàm Lambda kết nối với một cơ sở dữ liệu Amazon RDS for MySQL. Trong các đợt tăng lưu lượng, hàng trăm lần gọi Lambda đồng thời làm cạn kiệt giới hạn kết nối của cơ sở dữ liệu, gây ra lỗi. Giải pháp nào giải quyết điều này với ít thay đổi ứng dụng nhất?

A) Tăng kích thước instance RDS để nâng max_connections
B) Đặt Amazon RDS Proxy giữa các hàm Lambda và cơ sở dữ liệu
C) Di chuyển cơ sở dữ liệu sang DynamoDB
D) Cấu hình Lambda reserved concurrency là 10

**Câu 48** *(Domain 3 — Task 3.3)*
Một trang tin tức tài chính dùng Amazon Aurora MySQL. Lưu lượng đọc tăng 20 lần trong giờ thị trường và instance chính bị giới hạn CPU phục vụ các truy vấn SELECT. Các lượt ghi khiêm tốn. Cách hiệu quả vận hành NHẤT để mở rộng các lượt đọc là gì?

A) Thêm Aurora Replicas và hướng lưu lượng đọc đến cluster reader endpoint với auto scaling
B) Tạo một Multi-AZ standby và gửi các lượt đọc đến standby
C) Shard cơ sở dữ liệu trên nhiều Aurora cluster
D) Bật Aurora Backtrack để giảm tải các lượt đọc

**Câu 49** *(Domain 3 — Task 3.4)*
Một công ty game nhiều người chơi chạy một ứng dụng nhạy độ trễ dùng giao thức UDP trên các Network Load Balancer ở hai AWS Region. Người chơi trên toàn thế giới cần các địa chỉ IP tĩnh để allow-listing và failover region nhanh. Dịch vụ nào kiến trúc sư giải pháp nên chọn?

A) Amazon CloudFront với hai custom origin
B) AWS Global Accelerator với các endpoint group ở cả hai region
C) Amazon Route 53 với latency-based routing
D) Một Application Load Balancer với cross-zone load balancing

**Câu 50** *(Domain 3 — Task 3.4)*
Một công ty streaming phải tuân thủ các quy tắc cấp phép nội dung: người dùng ở Đức phải luôn được phục vụ từ deployment eu-central-1, và người dùng ở Pháp từ deployment eu-west-3, bất kể endpoint nào cung cấp độ trễ thấp hơn. Chính sách định tuyến Route 53 nào nên được dùng?

A) Latency-based routing
B) Geolocation routing
C) Geoproximity routing với một positive bias trên eu-central-1
D) Weighted routing với trọng số 50/50

**Câu 51** *(Domain 3 — Task 3.2)*
Một kiến trúc sư giải pháp đang triển khai một khối lượng công việc HPC liên kết chặt chẽ dùng MPI và yêu cầu độ trễ mạng thấp nhất có thể và hiệu suất gói mỗi giây cao nhất giữa 32 instance EC2. Chiến lược placement nào nên được dùng?

A) Spread placement group trên ba Availability Zone
B) Partition placement group với 7 partition
C) Cluster placement group trong một Availability Zone duy nhất
D) Khởi chạy các instance trong các subnet riêng biệt với enhanced networking

**Câu 52** *(Domain 3 — Task 3.5)*
Một công ty IoT nhập dữ liệu clickstream phải được giao đến Amazon S3 gần thời gian thực để phân tích. Đội muốn một giải pháp được quản lý hoàn toàn không có ứng dụng consumer để viết, không quản lý shard, và buffering record tích hợp sẵn và chuyển đổi định dạng sang Parquet. Dịch vụ nào họ nên dùng?

A) Amazon Kinesis Data Streams với một Lambda consumer
B) Amazon Data Firehose (trước đây là Kinesis Data Firehose) với một đích S3
C) Amazon SQS với một đội EC2 poller
D) Amazon MSK với một custom Kafka Connect sink

**Câu 53** *(Domain 3 — Task 3.5)*
Một công ty lưu các log ứng dụng dưới dạng các tệp JSON nén trong Amazon S3 và muốn các nhà phân tích chạy các truy vấn SQL ad hoc trên chúng mà không cấp phát máy chủ hoặc nạp dữ liệu vào một cơ sở dữ liệu. Schema nên được khám phá và lập catalog tự động. Kết hợp nào kiến trúc sư giải pháp nên đề xuất?

A) Amazon Redshift với các lệnh COPY và refresh theo lịch
B) AWS Glue crawler để điền Data Catalog và Amazon Athena cho các truy vấn SQL
C) Amazon EMR với một cluster Presto chạy lâu
D) Amazon RDS for PostgreSQL với extension aws_s3

---

## Phần 4 — Design Cost-Optimized Architectures (Câu 54–65)

**Câu 54** *(Domain 4 — Task 4.2)*
Một viện nghiên cứu chạy các mô phỏng batch hàng đêm trên EC2 mất khoảng 90 phút, checkpoint tiến độ đến Amazon S3 mỗi 5 phút, và có thể được khởi động lại từ checkpoint cuối cùng bất cứ lúc nào. Viện muốn chi phí tính toán thấp nhất có thể. Tùy chọn mua nào kiến trúc sư giải pháp nên đề xuất?

A) On-Demand Instances trong một AZ duy nhất
B) Standard Reserved Instances với một kỳ hạn 3 năm
C) Spot Instances dùng một Spot Fleet đa dạng hóa trên nhiều loại instance và AZ
D) Một Compute Savings Plan có kích thước theo đỉnh của khối lượng công việc batch

**Câu 55** *(Domain 4 — Task 4.2)*
Một công ty SaaS có một chi tiêu tính toán cơ bản ổn định nhưng dự kiến sẽ di chuyển các khối lượng công việc giữa EC2, AWS Fargate và AWS Lambda trong ba năm tới khi hiện đại hóa. Công ty muốn một khoản giảm giá dựa trên cam kết tự động áp dụng trên cả ba dịch vụ tính toán và tất cả các region. Tùy chọn nào kiến trúc sư giải pháp nên đề xuất?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Câu 56** *(Domain 4 — Task 4.2)*
Một công ty đã mua Standard Reserved Instances 3 năm cho Amazon RDS và cho Amazon EC2. Sau một sự tái kiến trúc, công ty không còn cần đặt chỗ nào nữa. Đội tài chính hỏi đặt chỗ nào có thể được bán để thu hồi chi phí. Kiến trúc sư giải pháp nên nói gì với họ?

A) Cả Reserved Instances EC2 và RDS đều có thể được bán trên Reserved Instance Marketplace
B) Chỉ Reserved Instances EC2 có thể được bán trên Reserved Instance Marketplace; RDS RI không thể được bán lại
C) Chỉ Reserved Instances RDS có thể được bán, vì các đặt chỗ cơ sở dữ liệu có thể chuyển nhượng
D) Không cái nào có thể được bán; Reserved Instances không hoàn lại và không chuyển nhượng trong mọi trường hợp

**Câu 57** *(Domain 4 — Task 4.2)*
Một đội phát triển chạy xử lý dữ liệu chịu lỗi containerized trên Amazon ECS với năng lực EC2 Spot. Họ cần các worker drain và checkpoint một cách lịch sự trước khi bị thu hồi. AWS cung cấp bao nhiêu cảnh báo trước khi một Spot Instance bị gián đoạn?

A) Không có cảnh báo nào được cung cấp
B) Một thông báo gián đoạn 2 phút
C) Một thông báo gián đoạn 15 phút
D) Một cửa sổ rebalance 24 giờ

**Câu 58** *(Domain 4 — Task 4.1)*
Một kho lưu trữ chăm sóc sức khỏe lưu các hồ sơ tuân thủ trong Amazon S3 hiếm khi được truy cập nhưng, khi bị triệu tập, phải có thể truy xuất trong vòng 5 phút. Các hồ sơ được giữ trong 7 năm và chi phí lưu trữ phải được giảm thiểu. Storage class nào đáp ứng các yêu cầu này?

A) S3 Glacier Deep Archive với Standard retrieval
B) S3 Glacier Flexible Retrieval với Expedited retrieval khi cần
C) S3 Glacier Flexible Retrieval với Bulk retrieval
D) S3 Standard-IA

**Câu 59** *(Domain 4 — Task 4.1)*
Một startup chia sẻ ảnh lưu các ảnh thumbnail dễ tái tạo được truy cập không thường xuyên. Đội muốn tùy chọn truy cập không thường xuyên chi phí thấp nhất và chấp nhận rằng mất một Availability Zone duy nhất có thể yêu cầu tái tạo các thumbnail từ bản gốc. Storage class nào nên được dùng?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Câu 60** *(Domain 4 — Task 4.1)*
Một công ty có một S3 bucket với hàng triệu object có mẫu truy cập không xác định và thay đổi không thể dự đoán. Một kiến trúc sư giải pháp đang đánh giá S3 Intelligent-Tiering. HAI câu nào về Intelligent-Tiering là chính xác? (Chọn HAI.)

A) Nó tính một phí giám sát và tự động hóa nhỏ theo từng object cho các object nó giám sát
B) Nó tính phí truy xuất mỗi khi một object di chuyển trở lại tầng Frequent Access
C) Các object nhỏ hơn 128 KB không được giám sát hoặc tự động phân tầng và được tính ở mức tầng Frequent Access
D) Nó tự động sao chép các object đến một region thứ hai
E) Nó yêu cầu một thời gian lưu trữ tối thiểu 90 ngày cho mọi object

**Câu 61** *(Domain 4 — Task 4.1)*
Một đội phân tích thường xuyên hủy các multipart upload lớn đến một S3 data lake bucket, và AWS Cost Explorer cho thấy các khoản phí lưu trữ tăng dù số lượng object hiển thị của bucket không đổi. Cách khắc phục TỐI ƯU CHI PHÍ NHẤT là gì?

A) Bật S3 Versioning để theo dõi các part mồ côi
B) Thêm một quy tắc lifecycle hủy các multipart upload chưa hoàn thành sau một số ngày nhất định
C) Di chuyển bucket sang S3 One Zone-IA
D) Bật S3 Transfer Acceleration để hoàn thành các upload nhanh hơn

**Câu 62** *(Domain 4 — Task 4.1)*
Một đội EC2 fleet của một công ty dùng hàng trăm volume EBS gp2 được kích cỡ lớn thuần túy để có được IOPS cơ bản. Các đánh giá sử dụng cho thấy IOPS được cần nhưng phần lớn dung lượng thì không. Kiến trúc sư giải pháp nên làm gì để giảm chi phí lưu trữ mà không mất hiệu suất?

A) Di chuyển các volume sang io2 và cấp phát cùng IOPS
B) Di chuyển các volume sang gp3, right-size dung lượng, và cấp phát IOPS độc lập
C) Chuyển đổi các volume sang st1 throughput-optimized HDD
D) Snapshot các volume hàng ngày và xóa bản gốc

**Câu 63** *(Domain 4 — Task 4.4)*
Một đường dẫn dữ liệu trong các subnet riêng tư chuyển 60 TB mỗi tháng từ các instance EC2 đến Amazon S3 trong cùng region qua một NAT gateway, tạo ra các khoản phí xử lý dữ liệu lớn. Thay đổi TỐI ƯU CHI PHÍ NHẤT là gì?

A) Thay thế NAT gateway bằng một NAT instance trên một instance EC2 lớn
B) Tạo một gateway VPC endpoint cho S3 và định tuyến lưu lượng qua nó
C) Tạo một interface VPC endpoint (PrivateLink) cho S3
D) Chuyển các instance EC2 sang các subnet công khai với các địa chỉ IPv4 công khai

**Câu 64** *(Domain 4 — Task 4.4)*
Hóa đơn hàng tháng của một startup cho thấy các khoản phí bất ngờ cho các địa chỉ IPv4 công khai đang sử dụng trên hàng chục instance EC2 chỉ gọi các dịch vụ AWS khác trong VPC. Đội tài chính cũng muốn các cảnh báo trước khi chi tiêu tổng thể tháng tới vượt một ngưỡng. Kết hợp hành động nào kiến trúc sư giải pháp nên thực hiện? (Chọn HAI.)

A) Thay thế IPv4 công khai bằng Elastic IP trên mỗi instance, vốn luôn miễn phí khi được gắn
B) Loại bỏ các địa chỉ IPv4 công khai và dùng kết nối riêng tư (VPC endpoint/NAT khi cần), vì AWS tính phí cho các địa chỉ IPv4 công khai đang sử dụng
C) Dùng AWS Compute Optimizer để chặn chi tiêu trên ngưỡng
D) Bật AWS Shield Advanced để giới hạn chi tiêu hàng tháng
E) Tạo một AWS Budgets cost budget với một ngưỡng cảnh báo và thông báo email

**Câu 65** *(Domain 4 — Task 4.3)*
Một môi trường phát triển dùng một cluster Amazon Aurora PostgreSQL nhàn rỗi vào ban đêm và cuối tuần nhưng phải tự động thức dậy khi các nhà phát triển kết nối, mà không can thiệp thủ công hoặc thay đổi kích thước instance. Chi phí nên giảm xuống gần bằng không cho tính toán khi nhàn rỗi. Giải pháp nào đáp ứng các yêu cầu này?

A) Aurora Serverless v2 được cấu hình với năng lực tối thiểu 0 ACU để nó tự động tạm dừng khi nhàn rỗi
B) Một cluster Aurora được cấp phát được dừng bởi một hàm Lambda theo lịch mỗi đêm
C) Một Aurora global database với một cluster thứ cấp headless
D) Aurora được cấp phát với hai reader instance được scale in vào ban đêm

---

## Đáp Án

### Phần 1 — Câu 1–20

**1. Đáp án: B** — SCP không bao giờ áp dụng cho tài khoản quản lý của tổ chức, vì vậy các principal của nó không bị ảnh hưởng bởi các hạn chế Region. *Tại sao không phải các đáp án khác:* A — SCP có kế thừa qua các OU lồng nhau; C — IAM Allow không thể ghi đè một SCP Deny trong các tài khoản thành viên; D — SCP áp dụng ngay lập tức cho tất cả các tài khoản hiện tại và tương lai dưới điểm gắn.

**2. Đáp án: C** — Một permissions boundary được thực thi như một condition trên các action tạo role giới hạn quyền tối đa của bất kỳ role nào nhà phát triển tạo, ngăn leo thang đặc quyền trong khi bảo toàn tự phục vụ. *Tại sao không phải các đáp án khác:* A — xem xét thủ công thêm chi phí vận hành và loại bỏ tự phục vụ; B — từ chối iam:CreateRole chặn quy trình làm việc hợp pháp; D — cảnh báo CloudTrail là phát hiện, không phải phòng ngừa.

**3. Đáp án: B** — Một ExternalId do khách hàng định nghĩa được xác thực trong condition của trust policy đảm bảo nhà cung cấp SaaS chỉ đảm nhận role thay mặt cho đúng khách hàng, giảm thiểu vấn đề confused deputy. *Tại sao không phải các đáp án khác:* A — MFA không thực tế cho việc đảm nhận tự động dịch vụ-đến-dịch vụ và không giải quyết sự nhầm lẫn deputy; C — mã hóa một ARN (vốn không bí mật) không giải quyết gì cả; D — access key IAM user dài hạn kém an toàn hơn role.

**4. Đáp án: B** — IAM Identity Center liên kết một lần với Entra ID và gán permission set một cách tập trung trên tất cả các tài khoản tổ chức qua một access portal duy nhất. *Tại sao không phải các đáp án khác:* A — IAM user theo từng tài khoản chính là chi phí cần tránh; C — Cognito dành cho danh tính ứng dụng (khách hàng), không phải truy cập workforce đến các tài khoản AWS; D — thiết lập SAML thủ công theo từng tài khoản hoạt động được nhưng có chi phí vận hành cao hơn nhiều.

**5. Đáp án: A** — User pool xử lý xác thực (đăng nhập email/xã hội); identity pool đổi các token kết quả lấy thông tin xác thực AWS tạm thời được giới hạn phạm vi bởi các IAM role để truy cập S3. *Tại sao không phải các đáp án khác:* B — đảo ngược mục đích của hai dịch vụ; C — IAM Identity Center dành cho người dùng workforce, không phải khách hàng ứng dụng; D — token user pool (JWT) không tự cấp quyền truy cập dịch vụ AWS.

**6. Đáp án: B** — Một customer managed key cho toàn quyền kiểm soát key policy, ghi log sử dụng, và vô hiệu hóa, và hỗ trợ rotation tự động (hàng năm theo mặc định). *Tại sao không phải các đáp án khác:* A — AWS managed key không cho bạn chỉnh sửa key policy hoặc vô hiệu hóa khóa; C — AWS owned key hoàn toàn vô hình với khách hàng; D — key material được nhập (BYOK) không hỗ trợ rotation tự động.

**7. Đáp án: B** — Envelope encryption: KMS tạo một data key; dữ liệu được mã hóa cục bộ bằng plaintext data key, vốn bị loại bỏ, trong khi bản sao được KMS mã hóa của data key được lưu cùng ciphertext. *Tại sao không phải các đáp án khác:* A và C — KMS không bao giờ mã hóa các payload lớn trực tiếp hoặc qua streaming; D — khóa hardcode là một anti-pattern và không phải envelope encryption.

**8. Đáp án: C** — Chiến lược alternating-users của Secrets Manager duy trì hai thông tin xác thực và rotation chúng lần lượt, vì vậy các kết nối hiện có dùng thông tin xác thực trước đó vẫn hoạt động trong khi rotation. *Tại sao không phải các đáp án khác:* A — Parameter Store không có rotation tích hợp; bạn phải tự xây dựng tất cả; B — rotation single-user làm mật khẩu cũ vô hiệu ngay lập tức, gây rủi ro thất bại kết nối; D — rotation KMS rotation key material mã hóa, không phải mật khẩu cơ sở dữ liệu.

**9. Đáp án: C** — SSE-C cho phép khách hàng cung cấp khóa mã hóa với mỗi yêu cầu; AWS dùng nó trong bộ nhớ cho thao tác và không bao giờ lưu nó. *Tại sao không phải các đáp án khác:* A — khóa SSE-S3 hoàn toàn do AWS quản lý; B — khóa SSE-KMS được lưu trong AWS KMS; D — aws/s3 là một AWS-managed KMS key và hoàn toàn không phải phía client.

**10. Đáp án: B** — Object Lock chế độ compliance ngăn xóa hoặc ghi đè bởi bất kỳ user nào, bao gồm cả root, cho đến khi lưu giữ hết hạn, và Object Lock yêu cầu versioning. *Tại sao không phải các đáp án khác:* A — chế độ governance có thể bị bỏ qua bởi các user có s3:BypassGovernanceRetention; C — một bucket policy có thể bị sửa đổi hoặc loại bỏ bởi root user; D — hết hạn lifecycle không ngăn xóa trong thời gian đó.

**11. Đáp án: B** — NACL không trạng thái, vì vậy lưu lượng phản hồi đến các ephemeral source port của client phải được cho phép ra một cách rõ ràng. *Tại sao không phải các đáp án khác:* A — NACL không trạng thái, không phải có trạng thái; C — security group có trạng thái, vì vậy lưu lượng trả về tự động; D — 0.0.0.0/0 hoàn toàn hợp lệ trong các quy tắc NACL.

**12. Đáp án: A, B** — Security group có trạng thái (lưu lượng trả về tự động được cho phép), và NACL xử lý các quy tắc được đánh số theo thứ tự và hỗ trợ Deny. *Tại sao không phải các đáp án khác:* C — security group chỉ hỗ trợ quy tắc Allow; D — NACL gắn vào subnet, không phải ENI (security group gắn vào ENI); E — các quy tắc security group đều được đánh giá cùng nhau không có thứ tự.

**13. Đáp án: B** — Shield Advanced cung cấp Shield Response Team, bảo vệ chi phí DDoS, và khả năng hiển thị/chẩn đoán tấn công cho các tài nguyên được bảo vệ như CloudFront và ALB. *Tại sao không phải các đáp án khác:* A — Shield Standard tự động nhưng không bao gồm truy cập SRT hoặc bảo vệ chi phí; C — WAF giải quyết các mẫu yêu cầu layer-7, không phải toàn bộ tập yêu cầu; D — GuardDuty là phát hiện mối đe dọa, không phải bảo vệ DDoS.

**14. Đáp án: B** — AWS WAF trên ALB với nhóm quy tắc được quản lý SQLi cộng với một quy tắc dựa trên tốc độ chặn cả hai mẫu tấn công không thay đổi code ứng dụng. *Tại sao không phải các đáp án khác:* A — công sức phát triển cao; C — Shield Standard bao gồm các flood L3/L4, không phải SQL injection; D — security group không thể kiểm tra nội dung yêu cầu.

**15. Đáp án: B** — GuardDuty = phát hiện mối đe dọa từ log và threat intel; Macie = khám phá dữ liệu nhạy cảm (PII) trong S3; Inspector = quét lỗ hổng (CVE) của EC2, image ECR và Lambda. *Tại sao không phải các đáp án khác:* A, C, D — mỗi cái xáo trộn ít nhất hai trong các ánh xạ dịch vụ-đến-mục đích.

**16. Đáp án: B** — Gateway endpoint tồn tại chính xác cho S3 và DynamoDB, giữ lưu lượng trên mạng AWS, và không có phí theo giờ hoặc xử lý dữ liệu. *Tại sao không phải các đáp án khác:* A — NAT gateway định tuyến qua không gian IP công cộng và tính phí theo giờ/theo GB; C — interface endpoint phát sinh phí theo giờ và phí dữ liệu, nên không phải chi phí thấp nhất; D — một internet gateway gửi lưu lượng qua internet công cộng.

**17. Đáp án: A** — IMDSv2 yêu cầu một session token có được qua một yêu cầu PUT, mà các vector SSRF điển hình không thể thực hiện; thực thi HttpTokens=required chặn việc trộm thông tin xác thực IMDSv1. *Tại sao không phải các đáp án khác:* B — nhiều agent và SDK hợp pháp cần IMDS; C — NACL không ảnh hưởng đến lưu lượng link-local giữa một instance và endpoint metadata của chính nó; D — thông tin xác thực tĩnh trong tệp tồi tệ hơn nhiều so với thông tin xác thực role.

**18. Đáp án: C** — Các tham số Parameter Store standard miễn phí và phù hợp cho cấu hình plaintext; Secrets Manager thêm rotation tích hợp cho chỉ 5 mật khẩu, giảm thiểu chi phí. *Tại sao không phải các đáp án khác:* A — trả định giá theo từng secret của Secrets Manager cho 200 giá trị cấu hình thuần túy là lãng phí; B — chỉ Parameter Store không có rotation native cho các mật khẩu; D — Parameter Store không có rotation tự động tích hợp, vì vậy tùy chọn này nêu một khả năng không tồn tại.

**19. Đáp án: B** — S3 Bucket Keys cho phép S3 tạo một data key cấp bucket có thời hạn từ KMS key, giảm đáng kể các yêu cầu KMS theo từng object (và chi phí) trong khi vẫn là SSE-KMS. *Tại sao không phải các đáp án khác:* A — SSE-S3 từ bỏ yêu cầu KMS; C — tần suất rotation không ảnh hưởng đến khối lượng API theo từng yêu cầu; D — key material được nhập không thay đổi số lượng yêu cầu.

**20. Đáp án: B, D** — Deny rõ ràng luôn thắng bất kỳ Allow nào trong đánh giá policy, và permissions boundary chỉ giới hạn (không bao giờ cấp) quyền. *Tại sao không phải các đáp án khác:* A — SCP là guardrail giới hạn các quyền có sẵn; chúng không cấp gì cả; C — resource-based policy thường xuyên cấp truy cập cross-account một cách độc lập; E — IAM mặc định là implicit deny khi không có gì cho phép một action.

### Phần 2 — Câu 21–37

**21. Đáp án: C** — Multi-AZ cung cấp failover tự động cho lỗi AZ; read replica hấp thụ lưu lượng đọc báo cáo — hai tính năng cho hai vấn đề riêng biệt. *Tại sao không phải các đáp án khác:* A — một standby Multi-AZ truyền thống không thể phục vụ các lượt đọc; B — thăng cấp replica là thủ công (hoặc được script) và chỉ replica không cho failover HA tự động; D — một instance single-AZ lớn hơn thất bại cả hai yêu cầu về tính kiên cường AZ.

**22. Đáp án: B** — Một Multi-AZ DB cluster deployment chạy một writer và hai standby có thể đọc trên ba AZ, với một reader endpoint, vì vậy năng lực standby phục vụ các lượt đọc trong khi vẫn hỗ trợ failover tự động nhanh. *Tại sao không phải các đáp án khác:* A — standby duy nhất trong một instance deployment không phục vụ lưu lượng nào; C — read replica không cung cấp failover tự động được quản lý và các cơ sở dữ liệu RDS không được load-balanced qua ALB; D — Single-AZ không có failover nào cả.

**23. Đáp án: B** — Sao chép Aurora Global Database là không đồng bộ ở lớp lưu trữ với độ trễ điển hình dưới một giây, vì vậy RPO cross-Region gần bằng không nhưng không bao giờ có thể được đảm bảo chính xác là 0. *Tại sao không phải các đáp án khác:* A — sao chép không đồng bộ trên các Region; C — write forwarding định tuyến các lượt ghi đến primary; nó không thay đổi ngữ nghĩa sao chép; D — độ trễ sao chép điển hình dưới một giây, không phải một lịch 5 phút.

**24. Đáp án: B** — Recovery Time Objective là thời gian ngừng hoạt động chịu đựng được tối đa (4 giờ); Recovery Point Objective là cửa sổ mất dữ liệu chịu đựng được tối đa (15 phút). *Tại sao không phải các đáp án khác:* A — đảo ngược các định nghĩa; C — MTBF/MTTR là các thống kê độ tin cậy, không phải mục tiêu DR; D — SLA là một cam kết hợp đồng, không phải một metric mất dữ liệu.

**25. Đáp án: B** — Pilot light giữ dữ liệu được sao chép liên tục và các tài nguyên cốt lõi được cấp phát nhưng tắt, mang lại một RTO hàng chục phút với chi phí thấp — một match chính xác. *Tại sao không phải các đáp án khác:* A — backup and restore không có sao chép trực tiếp và một RTO dài hơn nhiều; C — warm standby giữ stack chạy, tốn nhiều hơn yêu cầu; D — active/active đắt nhất và vượt xa yêu cầu.

**26. Đáp án: C, E** — Warm standby là một bản sao đầy đủ thu nhỏ, luôn chạy; multi-site active/active phục vụ từ nhiều Region với RTO gần bằng không với chi phí cao nhất. *Tại sao không phải các đáp án khác:* A — backup and restore được định nghĩa bởi việc không chạy trước tài nguyên; B — backup and restore có RTO cao nhất (tệ nhất); D — pilot light là được cấp phát nhưng tắt, không phải đầy đủ năng lực phục vụ lưu lượng.

**27. Đáp án: B** — Khi visibility timeout 30 giây hết hạn giữa chừng xử lý, tin nhắn xuất hiện lại và một consumer khác xử lý nó lần nữa; đặt visibility timeout dài hơn thời gian xử lý tối đa (ví dụ, gấp 6 lần là một thực hành tốt nhất). *Tại sao không phải các đáp án khác:* A — FIFO vs. standard không phải nguyên nhân; C — long polling ảnh hưởng đến hiệu quả nhận-rỗng, không phải trùng lặp; D — thời gian lưu giữ chi phối các tin nhắn tồn tại bao lâu, không phải giao lại.

**28. Đáp án: A** — Một redrive policy với maxReceiveCount chuyển các tin nhắn thất bại lặp đi lặp lại ("poison pill") đến một dead-letter queue để phân tích ngoại tuyến, dừng vòng lặp thử lại vô hạn. *Tại sao không phải các đáp án khác:* B — một visibility timeout ngắn hơn làm vòng lặp quay nhanh hơn; C — FIFO không loại bỏ các tin nhắn bị lỗi định dạng; D — một thời gian lưu giữ 1 phút cũng sẽ làm hết hạn các tin nhắn hợp lệ.

**29. Đáp án: B** — FIFO queue đảm bảo xử lý chính xác một lần và sắp xếp nghiêm ngặt trong một MessageGroupId; dùng ID tài khoản làm group ID cho sắp xếp theo từng tài khoản với song song cross-account (và chế độ FIFO thông lượng cao có thể mở rộng xa hơn). *Tại sao không phải các đáp án khác:* A — standard queue không thể đảm bảo thứ tự hoặc chính xác một lần; C — SNS không cung cấp đảm bảo sắp xếp hoặc xử lý chính xác một lần cho mẫu này; D — một group ID duy nhất tuần tự hóa mọi thứ, phá hủy thông lượng.

**30. Đáp án: B** — Fan-out SNS-đến-SQS giao mọi sự kiện đến mỗi queue, nơi mỗi consumer có buffering bền vững và tốc độ xử lý độc lập. *Tại sao không phải các đáp án khác:* A — ba consumer trên một queue chia các tin nhắn; mỗi tin nhắn chỉ đến một consumer; C — gọi tuần tự không phải xử lý song song độc lập với buffering; D — subscription email giao đến con người, không phải các buffer ứng dụng bền vững.

**31. Đáp án: B** — Reserved concurrency tạo ra concurrency dành riêng cho các hàm quan trọng (và giới hạn hàm sale giới hạn bán kính ảnh hưởng của nó), ngăn một hàm làm cạn kiệt account pool chia sẻ. *Tại sao không phải các đáp án khác:* A — một timeout dài hơn giữ các slot concurrency lâu hơn, làm throttling tệ hơn; C — provisioned concurrency làm ấm trước các môi trường nhưng không nâng quota concurrency tài khoản; D — kích thước bộ nhớ không ảnh hưởng đến giới hạn concurrency.

**32. Đáp án: B** — Standard workflow chạy lên đến một năm và mẫu callback waitForTaskToken tạm dừng việc thực thi không có chi phí tính toán cho đến khi SendTaskSuccess/SendTaskFailure trả về token. *Tại sao không phải các đáp án khác:* A — Express workflow tối đa 5 phút; C — Lambda có thể chạy tối đa 15 phút và ngủ lãng phí tiền; D — lịch EventBridge có thể kích hoạt sự kiện nhưng không thể tạm dừng và tiếp tục trạng thái workflow.

**33. Đáp án: A** — Express workflow được xây dựng cho các lần thực thi tốc độ rất cao, thời lượng ngắn, ít nhất một lần với chi phí thấp hơn; Standard workflow cung cấp ngữ nghĩa chính xác một lần, thời lượng lên đến một năm, và lịch sử thực thi đầy đủ cho job đối chiếu. *Tại sao không phải các đáp án khác:* B — Standard không thể duy trì kinh tế 90.000 lần khởi động/giây cho trường hợp sử dụng này; C — Express tối đa 5 phút và là ít nhất một lần, thất bại job 12 giờ chính xác một lần; D — các gán đảo ngược thất bại cả hai khối lượng công việc.

**34. Đáp án: B** — Failover routing gửi tất cả lưu lượng đến primary trong khi health check của nó vượt qua, sau đó tự động trả lời bằng bản ghi thứ cấp khi nó thất bại. *Tại sao không phải các đáp án khác:* A — weighted 50/50 gửi một nửa lưu lượng đến bản sao thụ động mọi lúc; C — latency-based routing chia lưu lượng theo hiệu suất, không phải ý định active/passive; D — geolocation định tuyến theo vị trí người dùng, không liên quan đến failover dựa trên sức khỏe endpoint.

**35. Đáp án: B** — Thêm loại ELB health check khiến ASG coi các thất bại ALB target-health là không lành mạnh, vì vậy các instance app crash bị chấm dứt và thay thế ngay cả khi EC2 status check vượt qua. *Tại sao không phải các đáp án khác:* A — giám sát chi tiết chỉ thay đổi độ chi tiết của metric; C — grace period trì hoãn đánh giá sức khỏe, ngược với những gì cần thiết; D — loại load balancer không phải vấn đề.

**36. Đáp án: B** — Network Load Balancer hoạt động ở layer 4 (TCP/UDP), xử lý hàng triệu yêu cầu mỗi giây với độ trễ siêu thấp, và hỗ trợ một IP tĩnh (hoặc Elastic) mỗi AZ. *Tại sao không phải các đáp án khác:* A — ALB là layer 7 (HTTP/HTTPS) và không cung cấp IP tĩnh một cách native; C — Gateway Load Balancer dành cho triển khai các thiết bị ảo inline; D — Classic Load Balancer là di sản và không đáp ứng yêu cầu nào.

**37. Đáp án: B, C** — CRR yêu cầu versioning được bật trên cả hai bucket, và các class EFS Standard là hệ thống tệp regional (multi-AZ) có thể mount đồng thời trên các AZ. *Tại sao không phải các đáp án khác:* A — CRR chỉ sao chép các object mới sau cấu hình trừ khi bạn chạy S3 Batch Replication cho các object hiện có; D — EFS hỗ trợ hàng nghìn client NFS đồng thời, không giống EBS single-attach; E — versioning là điều kiện tiên quyết cho replication nhưng tự nó không sao chép gì cả.

### Phần 3 — Câu 38–53

**38. Đáp án: B** — io2 Block Express cung cấp lên đến 256.000 IOPS, độ trễ dưới mili giây, và độ bền 99,999%, đáp ứng cả ba yêu cầu. *Tại sao không phải các đáp án khác:* A — gp3 hiện có thể đạt con số IOPS (giới hạn của nó được nâng lên 80.000 vào cuối năm 2025), nhưng nó thất bại hai yêu cầu còn lại: độ bền là 99,8–99,9% (câu hỏi yêu cầu 99,999%) và độ trễ của nó là một chữ số mili giây, không được đảm bảo dưới mili giây; B là loại duy nhất đáp ứng cả ba; C — st1 dựa trên HDD và không phù hợp cho các cơ sở dữ liệu IOPS-intensive; D — gp2 tối đa 16.000 IOPS và bursting không phải một đảm bảo bền vững.

**39. Đáp án: C** — FSx for Lustre được xây dựng chuyên dụng cho HPC với độ trễ dưới mili giây, hàng trăm GB/s thông lượng, và tích hợp S3 native (lazy-loading và exporting). *Tại sao không phải các đáp án khác:* A — EFS không thể sánh với hồ sơ thông lượng/độ trễ HPC của Lustre; B — FSx for Windows nhắm đến các khối lượng công việc SMB/Windows, không phải Linux HPC; D — Mountpoint for S3 không cung cấp ngữ nghĩa hệ thống tệp POSIX chia sẻ hoặc độ trễ yêu cầu.

**40. Đáp án: B** — FSx for Windows File Server native hỗ trợ SMB, tích hợp Active Directory, và NTFS ACL, và chế độ Multi-AZ bao phủ yêu cầu hai-AZ. *Tại sao không phải các đáp án khác:* A — EFS là NFS/POSIX và không bảo toàn các quyền NTFS; C — S3 là object storage, không phải một SMB file share; D — Lustre là một hệ thống tệp Linux HPC không có hỗ trợ SMB/AD.

**41. Đáp án: D, E** — Transfer Acceleration định tuyến các upload qua mạng edge/backbone AWS để tăng tốc các chuyển khoảng cách xa, và multipart upload song song hóa các chuyển và cho phép các part thất bại được thử lại mà không khởi động lại toàn bộ tệp 40 GB. *Tại sao không phải các đáp án khác:* A — One Zone-IA thay đổi dự phòng, không phải hiệu suất upload; B — bạn không thể đặt một ALB phía trước S3 cho các upload; C — CRR sao chép sau upload và không giúp ích cho việc nhập.

**42. Đáp án: B** — Instance store NVMe SSD được gắn vật lý vào host, cung cấp độ trễ thấp nhất cho dữ liệu tạm thời có thể tái tạo. *Tại sao không phải các đáp án khác:* A và D — EBS băng qua mạng và thêm độ trễ; C — EFS là một hệ thống tệp mạng với độ trễ cao hơn cả hai.

**43. Đáp án: B** — Throttling trên các partition nóng với sử dụng tổng thể thấp là vấn đề partition key có độ phân biệt thấp kinh điển; một khóa có độ phân biệt cao (ví dụ, game_id#player_id) phân phối lưu lượng đều. *Tại sao không phải các đáp án khác:* A — thay đổi chế độ năng lực không sửa các partition nóng; C — một LSI chia sẻ cùng partition key và cùng các partition nóng; D — Streams ghi lại các thay đổi, chúng không phân phối lại các lượt ghi.

**44. Đáp án: B** — DAX là một cache trong bộ nhớ tương thích DynamoDB, trong suốt API cung cấp các lượt đọc micro giây với thay đổi code tối thiểu. *Tại sao không phải các đáp án khác:* A — ElastiCache yêu cầu viết lại ứng dụng để quản lý cache; C — một GSI không cache các item nóng hoặc cho độ trễ micro giây; D — Global Tables giải quyết truy cập multi-region, không phải độ trễ đọc một item.

**45. Đáp án: B** — Một GSI có thể được thêm vào một bảng hiện có bất cứ lúc nào, hỗ trợ một kết hợp partition/sort key mới, và có thông lượng được cấp phát riêng cách ly với bảng cơ sở. *Tại sao không phải các đáp án khác:* A — LSI chỉ có thể được tạo khi tạo bảng, chia sẻ partition key của bảng, và chia sẻ thông lượng bảng; C — tạo lại bảng gây gián đoạn và không cần thiết; D — Streams dành cho change capture, không phải truy vấn ad hoc.

**46. Đáp án: B** — DynamoDB TTL xóa các item hết hạn tự động trong nền không có chi phí thêm. *Tại sao không phải các đáp án khác:* A — các lần quét theo lịch tiêu thụ năng lực đọc/ghi và tốn tiền; C — lifecycle policy là một khái niệm S3/EFS, không phải DynamoDB; D — Streams lọc các sự kiện xuôi dòng nhưng không xóa các item khỏi bảng.

**47. Đáp án: B** — RDS Proxy gộp và ghép kênh các kết nối, cho phép hàng nghìn lần gọi Lambda chia sẻ một tập nhỏ các kết nối cơ sở dữ liệu chỉ với một thay đổi connection-string. *Tại sao không phải các đáp án khác:* A — nâng cấp tốn kém và chỉ trì hoãn giới hạn; C — một di chuyển cơ sở dữ liệu là một thay đổi ứng dụng lớn; D — throttling Lambda xuống 10 làm tê liệt thông lượng thay vì giải quyết quản lý kết nối.

**48. Đáp án: A** — Aurora Replicas (lên đến 15) phía sau reader endpoint với auto scaling replica giảm tải lưu lượng đọc với công việc vận hành tối thiểu. *Tại sao không phải các đáp án khác:* B — Aurora không dùng một mô hình standby thụ động; standby theo nghĩa RDS cổ điển không phục vụ lưu lượng; C — sharding là chi phí vận hành cao cho một vấn đề mở rộng đọc; D — Backtrack tua ngược cơ sở dữ liệu về thời gian, nó không phục vụ các lượt đọc.

**49. Đáp án: B** — Global Accelerator cung cấp hai IP anycast tĩnh, hỗ trợ UDP, đứng trước các NLB ở nhiều region, và failover trong vài giây qua backbone AWS. *Tại sao không phải các đáp án khác:* A — CloudFront phục vụ nội dung HTTP/HTTPS, không phải UDP tùy ý, và không có IP tĩnh hướng client; C — Route 53 latency routing phụ thuộc vào DNS TTL cho failover và không cung cấp IP tĩnh; D — một ALB là regional và chỉ HTTP.

**50. Đáp án: B** — Geolocation routing trả lời các truy vấn DNS dựa trên quốc gia của người dùng, thực thi Đức→eu-central-1 và Pháp→eu-west-3 một cách xác định cho tuân thủ cấp phép. *Tại sao không phải các đáp án khác:* A — latency routing chọn endpoint nhanh nhất, có thể vi phạm quy tắc cấp phép; C — geoproximity bias dịch chuyển các ranh giới theo khoảng cách nhưng không đảm bảo ánh xạ quốc gia nghiêm ngặt; D — weighted routing phân phối ngẫu nhiên theo trọng số, bỏ qua vị trí.

**51. Đáp án: C** — Một cluster placement group đóng gói các instance gần nhau trong một AZ cho độ trễ thấp nhất và gói mỗi giây cao nhất, lý tưởng cho các khối lượng công việc MPI liên kết chặt chẽ. *Tại sao không phải các đáp án khác:* A — spread group tách các instance lên phần cứng riêng biệt, tăng độ trễ, và giới hạn 7 mỗi AZ; B — partition group cô lập các fault domain cho các hệ thống dữ liệu phân tán, không phải MPI độ trễ thấp; D — các subnet riêng biệt không làm gì để đặt các instance gần nhau.

**52. Đáp án: B** — Amazon Data Firehose được quản lý hoàn toàn, không yêu cầu consumer hoặc quản lý shard, đệm các record, và có thể chuyển đổi JSON sang Parquet trước khi giao đến S3. *Tại sao không phải các đáp án khác:* A — Kinesis Data Streams yêu cầu viết/quản lý các consumer; C — SQS cộng với EC2 poller là cơ sở hạ tầng tùy chỉnh để xây dựng và chạy; D — MSK yêu cầu quản lý các cluster Kafka và connector.

**53. Đáp án: B** — Glue crawler suy ra schema vào Data Catalog và Athena chạy SQL serverless trực tiếp trên các tệp S3. *Tại sao không phải các đáp án khác:* A — Redshift yêu cầu cấp phát cluster và nạp dữ liệu; C — EMR có nghĩa là quản lý một cluster chạy lâu; D — RDS sẽ yêu cầu nạp dữ liệu vào một máy chủ cơ sở dữ liệu.

### Phần 4 — Câu 54–65

**54. Đáp án: C** — Các job batch được checkpoint, có thể khởi động lại là khối lượng công việc Spot lý tưởng, và một Spot Fleet đa dạng hóa trên các loại instance/AZ giảm thiểu tác động gián đoạn với tiết kiệm lên đến ~90%. *Tại sao không phải các đáp án khác:* A — On-Demand từ bỏ khoản giảm giá không có lợi ích ở đây; B và D — các cam kết cho khoản giảm giá nhỏ hơn Spot và khóa chi tiêu cho một job thân thiện với gián đoạn.

**55. Đáp án: C** — Compute Savings Plans áp dụng tự động trên EC2 (bất kỳ họ/region nào), Fargate và Lambda, phù hợp với con đường hiện đại hóa. *Tại sao không phải các đáp án khác:* A — EC2 Instance Savings Plans bị khóa vào một họ instance trong một region và loại trừ Fargate/Lambda; B và D — Reserved Instances chỉ bao gồm EC2 và không áp dụng cho Fargate hoặc Lambda.

**56. Đáp án: B** — Chỉ EC2 Standard Reserved Instances có thể được niêm yết trên Reserved Instance Marketplace; RDS (và các dịch vụ khác) RI không thể được bán lại. *Tại sao không phải các đáp án khác:* A và C — RDS RI không đủ điều kiện marketplace; D — EC2 Standard RI thực tế có thể bán được trên marketplace.

**57. Đáp án: B** — AWS giao một thông báo gián đoạn Spot hai phút trước khi thu hồi instance, cho thời gian để drain và checkpoint. *Tại sao không phải các đáp án khác:* A — một cảnh báo được cung cấp; C và D — 15 phút và 24 giờ không phải các cửa sổ gián đoạn Spot (các khuyến nghị rebalance có thể đến sớm hơn nhưng không phải một cửa sổ cố định được đảm bảo).

**58. Đáp án: B** — Glacier Flexible Retrieval cung cấp chi phí lưu trữ lưu trữ thấp và Expedited retrieval trả về dữ liệu trong 1–5 phút (khoảng $0,03/GB), đáp ứng yêu cầu 5 phút. *Tại sao không phải các đáp án khác:* A — truy xuất nhanh nhất của Deep Archive là ~12 giờ; C — Bulk retrieval mất 5–12 giờ; D — Standard-IA truy xuất ngay lập tức nhưng tốn nhiều hơn cho lưu trữ 7 năm hiếm khi được truy cập.

**59. Đáp án: B** — One Zone-IA tốn ~20% ít hơn Standard-IA và sự đánh đổi độ bền single-AZ là chấp nhận được cho các thumbnail có thể tái tạo. *Tại sao không phải các đáp án khác:* A — Standard-IA tốn nhiều hơn cho dự phòng mà dữ liệu không cần; C — Intelligent-Tiering thêm phí giám sát và không giảm thiểu chi phí cho truy cập không-thường-xuyên đã biết; D — Glacier Instant Retrieval có một tối thiểu 90 ngày và một hồ sơ chi phí truy xuất khác cho mẫu này.

**60. Đáp án: A, C** — Intelligent-Tiering tính một phí giám sát/tự động hóa nhỏ theo từng object, và các object dưới 128 KB được lưu nhưng không được giám sát hoặc phân tầng (được tính ở mức Frequent Access). *Tại sao không phải các đáp án khác:* B — Intelligent-Tiering không có phí truy xuất giữa các tầng tự động của nó; D — nó không bao giờ sao chép cross-region; E — không có tối thiểu 90 ngày cho mọi object trong class.

**61. Đáp án: B** — Các part multipart upload chưa hoàn thành được tính như lưu trữ nhưng vô hình như các object; một quy tắc lifecycle với AbortIncompleteMultipartUpload xóa chúng tự động. *Tại sao không phải các đáp án khác:* A — versioning sẽ tăng lưu trữ, không dọn dẹp các part; C — thay đổi storage class không loại bỏ các part mồ côi; D — Transfer Acceleration tăng tốc các chuyển nhưng không dọn dẹp các upload đã bị bỏ rơi.

**62. Đáp án: B** — gp3 tách rời IOPS/thông lượng khỏi kích thước và tốn ~20% ít hơn mỗi GB so với gp2, vì vậy dung lượng có thể được right-sized trong khi giữ IOPS cần thiết; di chuyển là một thao tác ModifyVolume online. *Tại sao không phải các đáp án khác:* A — io2 đắt hơn, không rẻ hơn; C — st1 không thể cung cấp IOPS yêu cầu; D — xóa các volume phá hủy dữ liệu trực tiếp.

**63. Đáp án: B** — Một gateway VPC endpoint cho S3 miễn phí và loại bỏ các khoản phí xử lý dữ liệu NAT gateway cho lưu lượng S3 cùng-region. *Tại sao không phải các đáp án khác:* A — một NAT instance vẫn phát sinh chi phí EC2 và vận hành; C — interface endpoint tính phí theo giờ và theo GB, tốn nhiều hơn gateway endpoint miễn phí; D — các subnet công khai thêm các khoản phí IPv4 công khai và làm yếu bảo mật.

**64. Đáp án: B, E** — AWS tính phí cho mọi địa chỉ IPv4 công khai đang sử dụng, vì vậy loại bỏ những cái không cần thiết cắt giảm chi phí, và AWS Budgets cung cấp các cảnh báo ngưỡng chủ động trên chi tiêu dự báo/thực tế. *Tại sao không phải các đáp án khác:* A — Elastic IP cũng được tính theo khoản phí IPv4 công khai ngay cả khi được gắn; C — Compute Optimizer khuyến nghị right-sizing nhưng không thể chặn hoặc cảnh báo trên các ngưỡng chi tiêu; D — Shield Advanced là một dịch vụ DDoS thêm chi phí.

**65. Đáp án: A** — Aurora Serverless v2 hỗ trợ mở rộng xuống 0 ACU (tự động tạm dừng, có sẵn từ cuối năm 2024) và tự động tiếp tục khi kết nối, loại bỏ chi phí tính toán khi nhàn rỗi mà không có bước thủ công nào. Các sắc thái đáng biết: tự động tạm dừng yêu cầu các phiên bản engine gần đây (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); kết nối đầu tiên sau một lần tạm dừng mất ~15 giây để tiếp tục (lâu hơn sau 24+ giờ tạm dừng); lưu trữ vẫn tính phí trong khi tính toán bị tạm dừng; và bất cứ thứ gì giữ kết nối mở — một RDS Proxy, một keep-alive health check — ngăn việc tạm dừng hoàn toàn. *Tại sao không phải các đáp án khác:* B — một cluster được cấp phát đã dừng không tự động thức dậy khi các nhà phát triển kết nối (và khởi động lại sau 7 ngày); C — các thứ cấp global database headless giải quyết DR, không phải chi phí nhàn rỗi; D — các reader được scale in vẫn để writer instance chạy và tính phí.

---

## Hướng Dẫn Chấm Điểm

| Điểm | Cách hiểu kết quả |
|---|---|
| 55–65 | Sẵn sàng thi. Đăng ký thi. Chỉ xem lại các câu bạn làm sai. |
| 47–54 | Trong phạm vi đậu, nhưng biên độ mỏng. Đọc lại các chương đằng sau mỗi câu sai (dùng các tag domain), thi lại sau một tuần. |
| 38–46 | Nền tảng có đó; khoảng trống còn lại. Làm việc qua bản đồ domain của Phụ Lục B cho các domain yếu của bạn trước khi thi lại. |
| Dưới 38 | Đọc lại các chương cho hai domain yếu nhất của bạn từ đầu đến cuối, làm lại các bài tập chương của chúng, rồi thi lại bài thi này. |

Theo dõi các câu sai của bạn *theo domain* (mỗi câu hỏi được gắn tag). Một điểm thấp tập trung vào một domain là một vấn đề học tập tập trung; cùng một điểm trải đều là một vấn đề về nhịp độ hoặc đọc câu hỏi — hãy chậm lại và gạch chân những gì mỗi đề bài thực sự yêu cầu (HA vs DR, chi phí vs hiệu suất, "TỐI ƯU CHI PHÍ NHẤT" vs "ÍT chi phí vận hành NHẤT").
