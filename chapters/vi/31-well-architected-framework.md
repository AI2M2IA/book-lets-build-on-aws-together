# Chương 31: Thanh Tra Xây Dựng Cho Kiến Trúc Cloud

Đứng dậy. Duỗi người. Nghỉ giải lao thực sự nếu bạn cần.

Chương này khác với những chương trước. Chúng ta đã dành 30 chương xây dựng kiến thức về các dịch vụ và mẫu cụ thể. Bây giờ chúng ta lùi lại và nhìn vào bức tranh tổng thể.

*Kiến trúc cloud tốt* thực sự trông như thế nào? Có cách hệ thống nào để đánh giá xem những gì bạn đã xây dựng có được thiết kế tốt thực sự — hay chỉ là hoạt động được không?

Có. AWS gọi nó là Well-Architected Framework.

Nimbus đã chạy được hai năm. Nhóm đã đưa ra hàng trăm quyết định kiến trúc — một số có ý thức, một số ngẫu nhiên, một số dưới áp lực. Hệ thống hoạt động. Nhưng Maya có một câu hỏi.

"Kiến trúc của chúng ta có thực sự *tốt* không?" cô hỏi. "Không chỉ là hoạt động được. Tốt."

Không ai trả lời ngay.

"Vì tôi đã nghe về Well-Architected Review," cô tiếp tục. "AWS cung cấp nó cho khách hàng. Một số nhà đầu tư của chúng ta đã đề cập đến nó. Tôi nghĩ chúng ta nên thực hiện một cái."

"Đó là gì?" Leo hỏi.

"Khung đánh giá kiến trúc cloud của AWS," Priya nói. "Sáu trụ cột. Một tập hợp câu hỏi và các thực hành tốt nhất cho mỗi cái. Bạn đánh giá kiến trúc của mình dựa trên tất cả chúng và xác định những gì còn thiếu."

"Nó giống như thanh tra xây dựng," Tom nói. "Bạn biết tòa nhà hoạt động. Việc thanh tra cho bạn biết nó có tuân theo code không và cái gì có thể bị hỏng trong trận động đất."

**Sáu Trụ Cột**

AWS Well-Architected Framework được tổ chức xung quanh sáu trụ cột. Mỗi trụ cột có một tập hợp các nguyên tắc thiết kế, các thực hành tốt nhất và câu hỏi để đánh giá kiến trúc của bạn.

**1. Xuất Sắc Vận Hành**

*Trọng tâm*: Chạy và giám sát các hệ thống để cung cấp giá trị kinh doanh, và liên tục cải thiện các quy trình và thủ tục.

Các lĩnh vực chính:

- Bạn triển khai các thay đổi như thế nào? (CI/CD, infrastructure as code, triển khai tự động)
- Bạn giám sát hệ thống và biết khi nào có vấn đề như thế nào?
- Bạn học hỏi từ các thất bại như thế nào? (post-mortem, runbook, văn hóa không đổ lỗi)
- Bạn xử lý các thay đổi ở quy mô như thế nào?

Đánh giá Nimbus:

- Có: Pipeline CI/CD với triển khai tự động
- Có: Cảnh báo CloudWatch và GuardDuty
- Có: Kiểm thử chaos engineering hàng quý
- Cảnh báo: Quy trình post-mortem chưa được chính thức hóa — các sự cố được điều tra nhưng bài học chưa được ghi lại có hệ thống

**2. Bảo Mật**

*Trọng tâm*: Bảo vệ thông tin, hệ thống và tài sản thông qua đánh giá và chiến lược giảm thiểu rủi ro.

Các lĩnh vực chính:

- Ai có thể làm gì, và với đặc quyền tối thiểu có thể?
- Dữ liệu được mã hóa tại chỗ và trong khi truyền như thế nào?
- Bạn phát hiện và phản ứng với các mối đe dọa như thế nào?
- Có kiểm soát bảo mật tự động không?

Đánh giá Nimbus:

- Có: IAM với đặc quyền tối thiểu (sau khi dọn dẹp trong Chương 14)
- Có: KMS để mã hóa dữ liệu, Secrets Manager để quản lý thông tin xác thực
- Có: GuardDuty, WAF, Shield Standard
- Có: VPC với private subnets, security groups
- Cảnh báo: Vá bảo mật trên các instance EC2 chưa được tự động hóa đầy đủ (Priya đã gắn cờ điều này vài tháng trước, chưa giải quyết)

**3. Độ Tin Cậy**

*Trọng tâm*: Đảm bảo hệ thống thực hiện chức năng dự định của mình một cách chính xác và nhất quán, và có khả năng phục hồi từ các thất bại.

Các lĩnh vực chính:

- Hệ thống xử lý thất bại ở cấp độ thành phần như thế nào?
- Nó phục hồi từ các thất bại vùng như thế nào?
- Nhu cầu được quản lý như thế nào?
- Hệ thống được kiểm thử về thất bại như thế nào?

Đánh giá Nimbus:

- Có: Multi-AZ cho tất cả các thành phần quan trọng
- Có: Aurora Serverless với failover tự động
- Có: Auto Scaling cho EC2 và ECS
- Có: Kiểm thử chaos engineering (hàng quý)
- Cảnh báo: Không có triển khai đa vùng (warm standby chưa được triển khai — dự kiến cho quý tới)

**4. Hiệu Quả Hiệu Suất**

*Trọng tâm*: Sử dụng tài nguyên IT và điện toán hiệu quả.

Các lĩnh vực chính:

- Có đúng loại instance và loại cơ sở dữ liệu được sử dụng cho khối lượng công việc không?
- Mở rộng có được cấu hình đúng không?
- Dữ liệu có được phân phối đến người dùng từ vị trí tối ưu không?

Đánh giá Nimbus:

- Có: CloudFront để phân phối nội dung toàn cầu
- Có: ElastiCache để tăng tốc đọc cơ sở dữ liệu
- Có: Aurora read replicas
- Có: Lambda cho các khối lượng công việc phù hợp
- Cảnh báo: Một số instance EC2 chưa bao giờ được right-sized kể từ khi triển khai ban đầu

**5. Tối Ưu Hóa Chi Phí**

*Trọng tâm*: Tránh các chi phí không cần thiết.

Các lĩnh vực chính:

- Tài nguyên có được right-sized phù hợp không?
- Tài nguyên không sử dụng có được ngừng hoạt động không?
- Các mô hình giá phù hợp có đang được sử dụng không?
- Các bất thường chi tiêu có được phát hiện không?

Đánh giá Nimbus:

- Có: Savings Plans được triển khai (Chương 27)
- Có: Chính sách lifecycle S3 (Chương 23)
- Có: DynamoDB Auto Scaling
- Có: AWS Budgets với cảnh báo
- Có: Đánh giá chi phí hàng quý

**6. Bền Vững**

*Trọng tâm*: Giảm thiểu tác động môi trường khi chạy các khối lượng công việc cloud.

Các lĩnh vực chính:

- Mức sử dụng có được tối đa hóa không (tránh tài nguyên nhàn rỗi)?
- Các loại instance có được chọn vì hiệu quả năng lượng không?
- Dữ liệu có được lưu trữ chỉ khi cần thiết không?

Đánh giá Nimbus:

- Có: Lambda và Fargate cho các khối lượng công việc serverless/containerized (hiệu quả tài nguyên tốt hơn EC2 chuyên dụng)
- Có: Chính sách lifecycle S3 (xóa dữ liệu khi không còn cần thiết)
- Cảnh báo: Một số instance dựa trên Graviton chưa được áp dụng (AWS Graviton hiệu quả năng lượng hơn và rẻ hơn)

**Quy Trình Well-Architected Review**

Review không phải là bài kiểm tra bạn đậu hay trượt. Đó là cuộc trò chuyện có cấu trúc về kiến trúc của bạn, được hướng dẫn bởi 60+ câu hỏi trên sáu trụ cột.

Mỗi câu hỏi xác định một thực hành tốt nhất. Nếu kiến trúc của bạn tuân theo nó, đó là điểm mạnh. Nếu không, đó là "vấn đề" — được phân loại theo mức độ rủi ro (cao, trung bình, thấp).

Kết quả: danh sách ưu tiên các khuyến nghị cải tiến. Không phải mọi thứ đều cần được sửa ngay. Khung giúp bạn hiểu các đánh đổi của mỗi khoảng cách và quyết định cái gì cần giải quyết trước.

AWS Well-Architected Tool (có sẵn trong AWS console, miễn phí) cung cấp khung câu hỏi và tạo báo cáo với các khuyến nghị.

Đối với Nimbus, Maya đã lên lịch một workshop nửa ngày. Tất cả bốn thành viên nhóm xem xét từng trụ cột cùng nhau. Vào cuối, họ có danh sách 12 "vấn đề" — ba rủi ro cao, năm rủi ro trung bình, bốn rủi ro thấp.

**Vấn đề rủi ro cao**:

1. Không có kế hoạch DR đa vùng (độ tin cậy)
2. Vá bảo mật EC2 không tự động hóa (bảo mật)
3. Không có quy trình phản ứng sự cố chính thức (xuất sắc vận hành)

**Vấn đề rủi ro trung bình**:

5 mục bao gồm: không áp dụng Graviton, một số instance EC2 chưa được right-sized, không có runbook chính thức cho failover cơ sở dữ liệu

**Vấn đề rủi ro thấp**:

4 mục bao gồm: tỷ lệ cache hit CloudFront có thể cao hơn với TTL được điều chỉnh, một vài quy tắc security group rộng hơn cần thiết

**Lens: Chuyên Biệt Hóa Review**

Well-Architected Framework cốt lõi là trung lập về công nghệ. AWS cũng xuất bản **Lenses** — phần mở rộng của khung cho các trường hợp sử dụng hoặc ngành cụ thể:

- **Serverless Lens**: Câu hỏi bổ sung cho các kiến trúc nặng về Lambda
- **SaaS Lens**: Cho các ứng dụng SaaS đa người thuê
- **Machine Learning Lens**: Cho các khối lượng công việc đào tạo và suy luận ML
- **Financial Services Lens**: Câu hỏi quy định và tuân thủ cho FinTech
- **Healthcare Lens**: Các cân nhắc HIPAA

Đối với Nimbus, SaaS Lens có liên quan. Nó thêm câu hỏi về cô lập người thuê, tự động hóa onboarding và phân bổ chi phí theo người thuê — tất cả các lĩnh vực Nimbus đang tích cực phát triển.

**Sự Khác Biệt Giữa Được Thiết Kế Tốt và Chỉ Hoạt Động Được**

"Hệ thống của chúng ta hoạt động," Leo nói sau review. "Nhưng tôi không nhận ra có bao nhiêu thứ chúng ta đã làm 'đủ tốt' và tiếp tục."

"Điều đó là bình thường," Priya nói. "Xây dựng dưới áp lực thời gian có nghĩa là bạn đưa ra các lựa chọn thực dụng. Well-Architected review là thời gian có lịch để xem xét lại chúng."

"Một số khoảng cách này có vẻ rõ ràng nhìn lại," anh tiếp tục. "Việc vá bảo mật — tôi biết chúng ta chưa tự động hóa nó. Tôi chỉ không bao giờ ưu tiên sửa nó."

"Vì 'nó hoạt động' và 'nó được kiến trúc tốt' cảm giác giống nhau hàng ngày," Maya nói. "Sự khác biệt chỉ trở nên hiển thị khi có vấn đề."

Đây là một trong những điều quan trọng nhất mà kỹ sư cấp cao hiểu: sự vắng mặt của sự cố không có nghĩa là sự vắng mặt của rủi ro. Nó có nghĩa là rủi ro chưa kích hoạt.

**Infrastructure as Code: Yếu Tố Kích Hoạt Xuất Sắc Vận Hành**

Một chủ đề xuyên suốt nhiều trụ cột: **Infrastructure as Code (IaC)**.

Nếu cơ sở hạ tầng của bạn được cấu hình thủ công qua console, thì:

- Tái tạo nó trong kịch bản DR chậm và dễ xảy ra lỗi
- Kiểm toán các thay đổi là không thể (ai đã thay đổi gì, và khi nào?)
- Khôi phục một thay đổi xấu yêu cầu đảo ngược thủ công
- Tính nhất quán giữa các môi trường (dev/staging/production) yêu cầu kỷ luật

**AWS CloudFormation** cho phép bạn định nghĩa cơ sở hạ tầng trong các template YAML/JSON. **AWS CDK (Cloud Development Kit)** cho phép bạn định nghĩa cơ sở hạ tầng sử dụng các ngôn ngữ lập trình (Python, TypeScript, Java). **Terraform** là một lựa chọn thay thế bên thứ ba phổ biến.

Nimbus đã dần chuyển sang IaC sử dụng Terraform. Vào thời điểm Well-Architected review, khoảng 60% cơ sở hạ tầng của họ được định nghĩa trong code. Review khuyến nghị đến 100%.

"Tại sao 40% còn lại?" Leo hỏi.

"40% còn lại là nơi cơ sở hạ tầng quan trọng của chúng ta tồn tại," Priya nói. "Nếu chúng ta không thể tái tạo nó từ code, chúng ta không thể phục hồi từ một thảm họa vùng một cách đáng tin cậy."

## Điểm Mạnh và Hạn Chế

**Những gì Well-Architected Framework làm tốt**: Nó cung cấp cho các nhóm ngôn ngữ chung để thảo luận về các đánh đổi kiến trúc — một ngôn ngữ tồn tại sau khi thay đổi nhân sự và các cuộc trò chuyện với nhà cung cấp. Thực hiện Well-Architected Review buộc phải thừa nhận rõ ràng các rủi ro mà thường vô hình: "Đúng, chúng ta biết chúng ta có điểm thất bại duy nhất ở đây; chúng ta chấp nhận đánh đổi đó vì chi phí loại bỏ nó vượt quá chi phí dự kiến của thất bại." Loại đánh đổi có tài liệu, có chủ ý đó là kết quả của một review tốt.

**Những gì nó không thể làm**: Framework là mô tả, không phải quy định. Nó mô tả các thuộc tính của các hệ thống được kiến trúc tốt — nó không nói cho bạn cách xây dựng chúng. Kiểm tra mọi hộp trong Well-Architected Review không đảm bảo kiến trúc tốt. Một hệ thống có thể có khả dụng cao, xuất sắc về vận hành, tối ưu về chi phí, và vẫn giải quyết vấn đề sai. Framework là một lens, không phải bản thiết kế. Sử dụng nó để đặt ra các câu hỏi đúng, không để trả lời chúng.

## Tóm Tắt

- **AWS Well-Architected Framework** có sáu trụ cột: Xuất Sắc Vận Hành, Bảo Mật, Độ Tin Cậy, Hiệu Quả Hiệu Suất, Tối Ưu Hóa Chi Phí và Bền Vững.
- Mỗi trụ cột có các nguyên tắc thiết kế và các thực hành tốt nhất được đánh giá qua một bộ câu hỏi có cấu trúc.
- **Well-Architected Tool** (miễn phí trong AWS console) hướng dẫn review và tạo báo cáo.
- Kết quả là danh sách ưu tiên các cải tiến kiến trúc được phân loại theo rủi ro.
- **Lenses** chuyên biệt hóa khung cho các lĩnh vực cụ thể (serverless, SaaS, y tế, ML).
- **Infrastructure as Code** là yếu tố kích hoạt xuyên trụ cột — được khuyến nghị bởi các trụ cột Xuất Sắc Vận Hành, Bảo Mật và Độ Tin Cậy.
- Well-Architected review không phải là bài kiểm tra đậu/trượt. Đó là cuộc trò chuyện cải tiến có cấu trúc.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Xuyên domain — tất cả domain*

- **Biết tất cả sáu trụ cột và trọng tâm chính của chúng**. Kỳ thi sẽ mô tả một kịch bản (ví dụ: "nhóm muốn đảm bảo hệ thống của họ có thể phục hồi từ lỗi AZ") và hỏi trụ cột nào nó thuộc về (Độ Tin Cậy).
- **Ánh xạ trụ cột**:
  - "Triển khai thay đổi đáng tin cậy, học hỏi từ thất bại, giám sát" → Xuất Sắc Vận Hành
  - "IAM, mã hóa, kiểm soát mạng, phát hiện mối đe dọa" → Bảo Mật
  - "HA, failover, mở rộng, DR" → Độ Tin Cậy
  - "Right-sizing, CDN, lựa chọn công nghệ đúng" → Hiệu Quả Hiệu Suất
  - "Mô hình giá, tài nguyên không sử dụng, khả năng hiển thị chi phí" → Tối Ưu Hóa Chi Phí
  - "Hiệu quả năng lượng, sử dụng tài nguyên, vòng đời dữ liệu" → Bền Vững
- **Infrastructure as Code**: Được khuyến nghị bởi khung để có tính lặp lại, khả năng kiểm toán và phục hồi. CloudFormation, CDK và SAM là công cụ IaC gốc AWS.
- **Well-Architected Tool**: Công cụ console AWS hướng dẫn quy trình review. Miễn phí để sử dụng. Tạo kế hoạch cải tiến.
- **AWS Trusted Advisor**: Tương tự như khung Well-Architected nhưng tự động — quét tài khoản của bạn và cung cấp các khuyến nghị về chi phí, hiệu suất, bảo mật và khả năng chịu lỗi. Sự chồng chéo là thực: Trusted Advisor tự động hóa một số những gì khung đánh giá thủ công.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Đặt tên sáu trụ cột của AWS Well-Architected Framework và mô tả mối quan tâm chính của mỗi cái trong một câu.

*(Cố gắng thực hiện từ trí nhớ. Nếu bạn gặp khó khăn, đó là thông tin hữu ích về trụ cột nào cần được chú ý hơn.)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Một nhóm kỹ thuật đang chuẩn bị cho Well-Architected review. Ứng dụng của họ chạy trên EC2 với RDS Multi-AZ. Gần đây, họ phát hiện ra rằng:

- Quy trình triển khai của họ đôi khi để lại các instance EC2 với các phiên bản thư viện khác nhau (configuration drift)
- Họ không có cảnh báo tự động khi RDS failover được kích hoạt
- Tất cả người dùng IAM của họ đều có AdministratorAccess
- Họ không kiểm thử quy trình khôi phục backup của mình trong 14 tháng

Ánh xạ từng vấn đề đến trụ cột Well-Architected LIÊN QUAN NHẤT.

A) Configuration drift: Xuất Sắc Vận Hành; Không có cảnh báo failover RDS: Độ Tin Cậy; AdministratorAccess: Bảo Mật; Không kiểm thử khôi phục backup: Độ Tin Cậy

B) Configuration drift: Bảo Mật; Không có cảnh báo failover RDS: Hiệu Quả Hiệu Suất; AdministratorAccess: Xuất Sắc Vận Hành; Không kiểm thử khôi phục backup: Tối Ưu Hóa Chi Phí

C) Configuration drift: Độ Tin Cậy; Không có cảnh báo failover RDS: Hiệu Quả Hiệu Suất; AdministratorAccess: Bảo Mật; Không kiểm thử khôi phục backup: Xuất Sắc Vận Hành

D) Configuration drift: Bảo Mật; Không có cảnh báo failover RDS: Độ Tin Cậy; AdministratorAccess: Tối Ưu Hóa Chi Phí; Không kiểm thử khôi phục backup: Bảo Mật

**Gợi ý 1**: "Configuration drift" trong quy trình triển khai → trụ cột nào bao gồm các thực hành triển khai?

**Gợi ý 2**: "AdministratorAccess" cho tất cả người dùng → trụ cột nào bao gồm kiểm soát truy cập?

**Gợi ý 3**: "Khôi phục backup chưa được kiểm thử" → trụ cột nào bao gồm kiểm thử cơ chế phục hồi của bạn?

**Đáp án**: A

**Giải thích**: Configuration drift trong các triển khai (môi trường không nhất quán) là vấn đề Xuất Sắc Vận Hành — đó là về các thực hành triển khai đáng tin cậy, nhất quán. Không có cảnh báo về failover RDS có nghĩa là bạn không biết khi nào các cơ chế HA được kích hoạt — vấn đề Độ Tin Cậy (biết sức khỏe hệ thống của bạn). AdministratorAccess cho tất cả người dùng vi phạm đặc quyền tối thiểu — vấn đề Bảo Mật. Khôi phục backup chưa được kiểm thử có nghĩa là các cơ chế Độ Tin Cậy của bạn (DR) chưa được xác minh.

**Tại sao không phải B?** B gán sai configuration drift cho Bảo Mật (các phiên bản thư viện không nhất quán là vấn đề vận hành triển khai, không phải mối đe dọa bảo mật) và AdministratorAccess cho Xuất Sắc Vận Hành (kiểm soát truy cập là mối quan tâm Bảo Mật, không phải quy trình vận hành).

**Tại sao không phải C?** C đặt đúng AdministratorAccess trong Bảo Mật nhưng gán sai configuration drift cho Độ Tin Cậy (tính nhất quán triển khai là Xuất Sắc Vận Hành) và khôi phục backup chưa được kiểm thử cho Xuất Sắc Vận Hành (kiểm thử phục hồi là mối quan tâm Độ Tin Cậy — bạn đang xác minh rằng hệ thống của bạn có thể phục hồi, không phải quy trình của bạn nhất quán).

**Tại sao không phải D?** D gán AdministratorAccess cho Tối Ưu Hóa Chi Phí (quyền quá rộng không liên quan đến chi phí) và khôi phục backup chưa được kiểm thử cho Bảo Mật (không thể khôi phục backup là thất bại Độ Tin Cậy, không phải lỗ hổng bảo mật).

*SAA-C03 Domain: Xuyên domain*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Thực hiện một mini Well-Architected review về một ứng dụng bạn biết hoặc đang xây dựng. Đối với mỗi trụ cột trong sáu trụ cột, hãy viết:

- Một điều ứng dụng làm tốt
- Một điều ứng dụng có thể cải thiện

Sau đó xếp hạng các mục cải tiến của bạn theo rủi ro (điều gì có nhiều khả năng gây ra sự cố hoặc lãng phí nhất?) và ưu tiên (điều gì sẽ có tác động lớn nhất nếu được sửa?).

*(Bài tập này có giá trị hơn bạn nghĩ. Thực hành đánh giá hệ thống có hệ thống từ nhiều góc độ là kỹ năng kỹ sư cấp cao cốt lõi.)*

## Cảnh Sau Tín Dụng

Ba tuần sau Well-Architected review, nhóm đã triển khai ba sửa chữa rủi ro cao.

Vá EC2 hiện đã được tự động hóa qua AWS Systems Manager Patch Manager. Một tài liệu quy trình phản ứng sự cố đã tồn tại (không hoàn hảo, nhưng được viết và chia sẻ). Kế hoạch warm standby đa vùng đã được phác thảo và được lên lịch để triển khai vào quý tới.

Priya xem xét báo cáo Well-Architected Tool. Số lượng rủi ro cao: 0. Rủi ro trung bình: 3. Rủi ro thấp: 4.

"Chúng ta đang ở trạng thái tốt hơn so với trước," cô nói.

"Điều đó có tốt không?" Leo hỏi.

"Đó là tiến bộ," cô nói. "Bạn không hoàn thành Well-Architected review. Bạn tiến bộ, sau đó review lại sau sáu tháng."

Maya đang nghĩ về điều gì đó.

"Chúng ta đã dành 31 chương học các dịch vụ AWS riêng lẻ," cô nói. "Và bây giờ chúng ta bắt đầu nhìn vào toàn bộ hệ thống. Đó là cách kiến trúc sư nghĩ."

"Chúng ta đã nghĩ như kiến trúc sư trong một thời gian rồi," Leo nói.

"Chúng ta đã đưa ra các quyết định kiến trúc," Maya nói. "Điều đó khác. Nghĩ như kiến trúc sư có nghĩa là bạn đánh giá các quyết định *trước* khi đưa ra chúng, không phải sau."

"Sự khác biệt là gì?" Tom hỏi.

"Trong chương tiếp theo," cô nói, "chúng ta cố gắng trả lời điều đó."

Trong chương tiếp theo: một cuộc review kiến trúc thực sự trông như thế nào, từ các nguyên tắc đầu tiên.
