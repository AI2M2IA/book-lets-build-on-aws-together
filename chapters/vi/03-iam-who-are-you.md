# Chương 3: Bạn Là Ai, Chính Xác Thế?

Leo nhấn deploy.

Terminal trả về hai từ: Access Denied.

Anh thử lại. Kết quả như nhau. Anh đã làm việc tại Nimbus được ba tuần, được cấp quyền truy cập vào tài khoản AWS vào ngày đầu tiên, và đã triển khai vào môi trường staging mà không có vấn đề gì. Nhưng đây là production. Và production, rõ ràng, khác.

Maya nhìn qua vai anh vào thông báo lỗi. "Ai cấp quyền đó cho bạn?"

Leo quay lại. "Quyền gì?"

"Quyền triển khai vào production. Ai đã thiết lập điều đó?"

Leo mở console AWS và bắt đầu nhấp qua các menu. Không ai làm. Không có policy, không có role, không có grant rõ ràng. Cũng không có từ chối rõ ràng — chỉ là sự vắng mặt. Không ai tại Nimbus từng ngồi xuống và nghĩ về việc ai có thể làm gì.

Đó là vấn đề.

**Vấn Đề Với Mật Khẩu**

Mật khẩu là mô hình tệ cho các hệ thống máy tính.

Không phải vì chúng luôn yếu. Mà vì chúng nhị phân: bạn có mật khẩu hoặc không. Nếu bạn có nó, bạn có thể làm bất cứ điều gì tài khoản được phép làm.

Điều đó ổn với một người dùng duy nhất trên máy tính cá nhân của họ. Đó là thảm họa cho cơ sở hạ tầng đám mây của một công ty.

Hãy xem xét những gì Nimbus cần quản lý: máy chủ web, cơ sở dữ liệu, lưu trữ file, mạng, cảnh báo thanh toán, tài khoản người dùng. Nếu tất cả được bảo vệ bởi một mật khẩu — hoặc thậm chí một bộ thông tin đăng nhập — thì bất kỳ ai lấy được mật khẩu đó đều có được tất cả.

Và "tất cả" trên AWS có nghĩa là khả năng xóa cơ sở dữ liệu. Khởi động các máy chủ tạo ra hóa đơn 50.000 USD. Rò rỉ mọi hồ sơ khách hàng. Phá hủy dữ liệu sao lưu.

Priya không mô tả điều này theo những thuật ngữ bình tĩnh, trừu tượng. Cô mô tả như một câu chuyện về một startup bị xâm phạm, nhận được hóa đơn AWS 80.000 USD trong 24 giờ từ những kẻ tấn công khai thác tiền điện tử trên tài khoản của họ, và đóng cửa ba tháng sau.

Căn phòng im lặng.

"Vậy thì giải pháp là gì?" Tom hỏi.

**Khái Niệm: Quản Lý Danh Tính và Quyền Truy Cập**

Giải pháp thay thế là một hệ thống trong đó bạn không cho mọi người cùng một chìa khóa. Bạn cho mỗi người — và mỗi dịch vụ — chính xác quyền truy cập họ cần. Không hơn, không kém.

Trong AWS, hệ thống này được gọi là **IAM**: Quản lý Danh tính và Quyền Truy cập.

Hãy nghĩ về IAM như hệ thống thẻ từ trong một tòa nhà văn phòng lớn.

Tòa nhà có hàng chục tầng. Phòng máy chủ ở tầng 12. Văn phòng tài chính ở tầng 8. Khu vực CEO ở tầng 20. Mỗi nhân viên có thẻ từ, nhưng mỗi thẻ chỉ mở những cánh cửa mà nhân viên đó cần mở để làm công việc của mình. Thực tập sinh không thể quẹt vào phòng máy chủ. Kế toán không thể vào tầng điều hành sau giờ làm việc.

IAM hoạt động theo cách tương tự. Bạn xác định ai tồn tại (danh tính), họ được phép làm gì (quyền), và áp dụng những quyền đó thông qua các policy.

**Các Khối Xây Dựng Của IAM**

IAM có bốn khái niệm cốt lõi. Chúng xây dựng lên nhau.

**Users** là các danh tính cá nhân. Maya có user IAM. Tom có user IAM. Mỗi user có thông tin đăng nhập riêng — và chỉ nên có các quyền mà họ cụ thể cần.

**Groups** là tập hợp của users. Thay vì thiết lập quyền cho Maya, Tom, Priya và Leo riêng lẻ, bạn tạo nhóm "Developers" với quyền nhà phát triển và thêm họ vào đó. Khi một người thứ năm tham gia, bạn thêm họ vào nhóm và họ ngay lập tức kế thừa các quyền đúng.

**Roles** là các danh tính tạm thời có thể được *đảm nhận* bởi ai đó — một người, một dịch vụ, hoặc một tài khoản AWS khác. Chúng ta sẽ đi sâu vào role trong Chương 14. Hiện tại: nếu User là nhân viên cố định, Role là thẻ khách. Nó cấp quyền truy cập cụ thể trong khoảng thời gian hoặc mục đích cụ thể.

**Policies** là các quy tắc quyền thực sự. Một policy là một tài liệu (viết bằng JSON nội bộ, nhưng bạn không cần ghi nhớ định dạng) nói rằng: "Người nắm giữ policy này ĐƯỢC PHÉP thực hiện hành động X trên tài nguyên Y." Hoặc "BỊ TỪ CHỐI hành động Z."

Mô hình đánh giá IAM là: theo mặc định, mọi thứ đều bị từ chối. Quyền phải được cấp một cách rõ ràng. Nếu một policy không nói bạn có thể làm gì đó, bạn không thể.

**Nguyên Tắc Đặc Quyền Tối Thiểu**

Đây là khái niệm quan trọng nhất trong tất cả bảo mật, không chỉ IAM.

**Cho người và hệ thống chỉ quyền truy cập họ cần để thực hiện công việc. Không hơn.**

Priya gọi điều này là "nguyên tắc đặc quyền tối thiểu". Nghe có vẻ hiển nhiên. Trong thực tế, hầu hết các nhóm vi phạm nó liên tục — không phải cố ý, mà vì sự tiện lợi.

"Chúng ta có thể chỉ cần cấp cho Leo quyền admin để anh ấy có thể triển khai nhanh hơn không?"

Không.

"Chúng ta có thể chỉ dùng tài khoản root cho mọi thứ không?"

Tuyệt đối không.

Tài khoản root là chìa khóa chính cho toàn bộ tài khoản AWS của bạn. Nó có thể làm bất cứ điều gì, bao gồm cả đóng tài khoản. Bạn nên tạo nó một lần, thiết lập xác thực đa yếu tố, và sau đó không bao giờ dùng lại cho công việc hàng ngày.

Priya đã tạo các IAM user riêng biệt cho mọi người chiều đó. Cô cấp cho Leo quyền triển khai vào môi trường development. Không phải production. Không phải thanh toán. Không phải mạng. Chỉ triển khai.

"Cảm giác này hạn chế quá," Leo nói.

"Đó là lý do bạn biết nó đúng," Priya trả lời.

**Điều Gì Xảy Ra Khi Bạn Làm Sai Điều Này**

Ba tình huống, theo thứ tự nghiêm trọng tăng dần:

**Tình huống 1**: Một nhân viên với quyền admin rời công ty. Không ai vô hiệu hóa tài khoản của họ. Ba tháng sau, họ vẫn có quyền truy cập. Điều này xảy ra thường xuyên. IAM giải quyết nó: bạn vô hiệu hóa user. Ngay lập tức, ở khắp nơi.

**Tình huống 2**: Máy tính xách tay của nhà phát triển bị xâm phạm. Kẻ tấn công tìm thấy thông tin đăng nhập AWS được lưu trong tệp cấu hình với quyền admin đầy đủ. Vì thông tin đăng nhập có quyền truy cập rộng, kẻ tấn công có thể làm bất cứ điều gì. Với đặc quyền tối thiểu: thông tin đăng nhập chỉ hoạt động cho phạm vi hạn chế của chúng. Bán kính nổ được kiểm soát.

**Tình huống 3**: Một ứng dụng được viết kém vô tình tiết lộ thông tin đăng nhập AWS trong nhật ký của nó. Nếu những thông tin đăng nhập đó có quyền truy cập rộng, bạn có vi phạm thảm họa. Nếu chúng có quyền truy cập hẹp — chỉ vào bucket S3 cụ thể mà ứng dụng cần — thì sự tiếp xúc bị hạn chế và kiểm soát.

Mẫu: quyền truy cập nên được giới hạn ở mức tối thiểu. Luôn luôn. Không phải vì bạn không tin tưởng mọi người, mà vì bạn không thể kiểm soát điều gì xảy ra với thông tin đăng nhập bị xâm phạm.

**Xác Thực Đa Yếu Tố: Khóa Thứ Hai**

Thêm một khái niệm nữa trước khi chúng ta đóng chương.

Ngay cả với đặc quyền tối thiểu, thông tin đăng nhập có thể bị đánh cắp. Mật khẩu có thể bị đoán, lừa đảo hoặc rò rỉ. IAM giải quyết điều này bằng **Xác Thực Đa Yếu Tố (MFA)**.

MFA yêu cầu thứ bạn *biết* (mật khẩu) cộng với thứ bạn *có* (điện thoại, khóa phần cứng). Ngay cả khi kẻ tấn công đánh cắp mật khẩu của bạn, họ không thể đăng nhập mà không có điện thoại của bạn.

MFA phải được bật cho mọi IAM user. Đây là điều không thể thương lượng với tài khoản root.

Priya đã dành buổi chiều thiết lập nó cho mọi người.

Tom hỏi liệu nó có tạo ra quá nhiều ma sát không. Priya kéo lại câu chuyện vi phạm.

Tom ngay lập tức thiết lập MFA.

## Điểm Mạnh Và Hạn Chế

**IAM là công cụ đúng cho**: kiểm soát ai và cái gì có thể truy cập mọi tài nguyên AWS; triển khai đặc quyền tối thiểu trên users, dịch vụ và ranh giới xuyên tài khoản; tạo ra lộ trình kiểm tra của mọi lời gọi API thông qua tích hợp CloudTrail; loại bỏ nhu cầu chia sẻ thông tin đăng nhập tồn tại lâu dài giữa các hệ thống.

**Nơi IAM trở nên khó khăn**: các policy IAM có thể phát triển thành hàng trăm câu lệnh trên nhiều chục role, và gỡ lỗi lỗi "Access Denied" đòi hỏi hiểu biết policy nào là policy có hiệu lực — một nhiệm vụ khó hơn nghe có vẻ. Sai lầm IAM phổ biến nhất không phải là ít quyền truy cập — mà là quá nhiều. Các policy quá nhiều quyền được tạo ra để "chỉ làm cho nó hoạt động" trở thành nợ bảo mật gây đau đớn để hoàn tác sau đó.

## Tóm Tắt

- **IAM** (Quản lý Danh tính và Quyền Truy cập) là cách bạn kiểm soát ai có thể làm gì trong AWS.
- Các khối xây dựng cốt lõi là: **Users** (cá nhân), **Groups** (tập hợp users), **Roles** (danh tính tạm thời), và **Policies** (quy tắc quyền).
- Theo mặc định, mọi thứ trong AWS đều **bị từ chối**. Quyền phải được cấp một cách rõ ràng.
- **Nguyên tắc đặc quyền tối thiểu** có nghĩa là chỉ cấp cho mỗi danh tính quyền truy cập nó cần. Không hơn.
- **Tài khoản root** có thể làm bất cứ điều gì, bao gồm những điều thảm họa. Khóa nó sau MFA và sử dụng càng ít càng tốt.
- Bật **MFA** cho mọi IAM user. Không thể thương lượng.

## Mẹo Thi

*SAA-C03 Domain 1 — Task 1.1 (quyền truy cập an toàn vào tài nguyên AWS)*

- **Mọi thứ đều bị từ chối theo mặc định.** Cần có "Allow" rõ ràng. Nếu một policy không đề cập đến một hành động, hành động đó bị từ chối.
- **Explicit Deny luôn thắng.** Nếu bất kỳ policy nào trong chuỗi từ chối một hành động, việc từ chối đó không thể bị ghi đè bởi Allow ở bất kỳ đâu khác trong chuỗi.
- **Tài khoản root ≠ admin IAM.** Tài khoản root là thông tin đăng nhập riêng biệt từ IAM. Bạn không thể xóa tài khoản root. Bạn *có thể* (và nên) hạn chế khi nào nó được dùng.
- **IAM là toàn cầu**, không phải theo Region. IAM users, groups, roles và policies tồn tại trên toàn bộ tài khoản AWS, không phải theo Region.
- **Roles là cách ưu tiên để cấp quyền truy cập vào AWS services.** Nếu một EC2 instance cần truy cập S3, bạn gắn IAM Role vào instance — bạn không lưu trữ thông tin đăng nhập trên máy.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của bạn: sự khác biệt giữa IAM User, Group và Role là gì? Khi nào bạn sẽ sử dụng từng cái?

**Bài tập 2 — Thực hành thi**

*Tình huống*: Một công ty chạy ứng dụng web trên các EC2 instance cần đọc file từ bucket S3. Một nhà phát triển cấp thấp đề xuất lưu trữ AWS access key trực tiếp trong code ứng dụng trên EC2 instance. Nhóm bảo mật phản đối.

Giải pháp nào là MOST an toàn và phù hợp về mặt vận hành?

A) Lưu trữ access key trong biến môi trường trên EC2 instance thay vì code  
B) Tạo IAM user chuyên dụng với quyền đọc S3 và chia sẻ thông tin đăng nhập với nhóm phát triển  
C) Gắn IAM Role với quyền đọc S3 phù hợp trực tiếp vào EC2 instance  
D) Sử dụng thông tin đăng nhập tài khoản root để cấp cho ứng dụng quyền truy cập đầy đủ vào tất cả tài nguyên AWS

**Đáp án**: C

**Giải thích**: Gắn IAM Role vào EC2 instance là mẫu đúng. Instance tự động nhận thông tin đăng nhập tạm thời, được xoay vòng thông qua dịch vụ metadata EC2. Không có thông tin đăng nhập tồn tại lâu dài để rò rỉ, xoay vòng, hoặc vô tình commit vào repository.

*SAA-C03 Domain 1 — Task 1.1*

## Cảnh Sau Tín Dụng

Đến cuối ngày, mọi IAM user đều có MFA được bật. Tài khoản của Leo đã được giảm xuống quyền cấp nhà phát triển: triển khai vào môi trường dev, đọc từ bucket cấu hình chung, không có gì khác.

Anh đã thử, một lần, truy cập cơ sở dữ liệu production.

Access Denied.

"Đây có phải là cảm giác được tin tưởng nhưng không quá nhiều không?" anh hỏi.

"Chính xác là cảm giác như vậy," Priya nói.

Sáng hôm sau, Tom đến sớm và tìm thấy thứ gì đó khiến anh ngay lập tức gọi nhóm.

Trên console AWS, anh có thể thấy website của họ đang nhận được lưu lượng. Nhiều hơn họ mong đợi. Và máy chủ web — cái gốc của Leo — đang chạy nóng. Thực sự nóng.

"Chúng ta có một trăm người dùng đồng thời," Tom nói. "Và một máy chủ."

Chương tiếp theo: máy chủ đầu tiên — thuê một máy tính trong trung tâm dữ liệu của người khác.
