# Chương 3: Bạn Là Ai, Chính Xác?

Vừa quá chín giờ sáng. Leo đã ở bàn làm việc từ bảy giờ, cà phê đã nguội bên cạnh bàn phím. Văn phòng yên tĩnh — Maya chưa đến, Tom đang gọi điện. Bên ngoài, có ai đó đang cắt cỏ.

Leo gõ lệnh thêm một lần nữa.

Terminal trả về hai từ: Access Denied.

Cuộc khủng hoảng Singapore đã ở phía sau họ. Region đã được sửa, máy chủ đang chạy ở us-west-2, và nhóm cảm thấy mình có năng lực trong chốc lát. Cảm giác đó kéo dài khoảng bốn mươi tám giờ trước khi vấn đề mới nổi lên: Leo không thể triển khai lên production. Không ai đã thiết lập quyền cho anh. Không ai đã thiết lập quyền cho bất kỳ ai. Tài khoản AWS mở toang ở cấp root và khóa kín ở mọi nơi khác, và không ai nhận thấy vì không ai đã thử.

"Tôi đã triển khai nó rồi — ồ," Leo lẩm bẩm, cuộn ngược lại qua terminal của mình. Anh đã triển khai lên cái anh nghĩ là production trong một tuần. Đó là staging. Môi trường production thực sự chưa bao giờ bị chạm vào.

Maya nhìn qua vai anh vào thông báo lỗi. "Ai đã cấp cho anh quyền đó?"

Leo quay lại. "Quyền nào?"

"Quyền triển khai lên production. Ai đã thiết lập điều đó?"

Leo mở console AWS và bắt đầu nhấp qua các menu. Không ai đã làm. Không có policy, không có role, không có cấp quyền rõ ràng. Cũng không có từ chối rõ ràng — chỉ là một sự vắng mặt. Không ai ở Nimbus đã từng ngồi xuống và nghĩ về ai có thể làm gì.

Đó là vấn đề.

**Vấn Đề Với Mật Khẩu**

Mật khẩu là một mô hình tồi cho các hệ thống máy tính.

Không phải vì chúng luôn yếu. Vì chúng nhị phân: bạn hoặc có mật khẩu hoặc không. Nếu bạn có nó, bạn có thể làm bất cứ điều gì tài khoản được phép làm.

Điều đó ổn cho một người dùng đơn lẻ trên máy tính xách tay cá nhân của họ. Nó là thảm họa cho cơ sở hạ tầng đám mây của một công ty.

Hãy xem xét những gì Nimbus cần quản lý: máy chủ web, cơ sở dữ liệu, lưu trữ tệp, mạng, cảnh báo thanh toán, tài khoản người dùng. Nếu mọi thứ được bảo vệ bởi một mật khẩu — hoặc thậm chí một bộ thông tin đăng nhập — thì bất kỳ ai có được mật khẩu đó có được mọi thứ.

Và "mọi thứ" trên AWS có nghĩa là khả năng xóa cơ sở dữ liệu. Khởi động các máy chủ tích lũy một hóa đơn 50.000 đô la. Trích xuất mọi bản ghi khách hàng. Phá hủy dữ liệu sao lưu.

Có một vấn đề khác ngoài bản chất nhị phân của mật khẩu: mật khẩu là tĩnh. Chúng không tự động hết hạn. Chúng thường được tái sử dụng trên các dịch vụ. Chúng bị viết ra. Chúng bị lưu trữ trong các bảng tính có nhãn "mật khẩu KHÔNG CHIA SẺ." Chúng vẫn bị chia sẻ, vì sự tiện lợi đánh bại bảo mật khi cơ chế bảo mật là ma sát.

Vấn đề "thông tin đăng nhập chia sẻ" không phải là một khiếm khuyết về tính cách. Nó là một vấn đề hệ thống. Khi cách duy nhất để cấp cho ai đó quyền truy cập tạm thời vào một hệ thống là cho họ mật khẩu vĩnh viễn, người ta chia sẻ mật khẩu. Giải pháp là xây dựng một hệ thống nơi quyền truy cập tạm thời, có phạm vi là mặc định — không phải một cách giải quyết đòi hỏi nỗ lực anh hùng.

Đó là những gì IAM làm. Không chỉ "mật khẩu tốt hơn", mà là một mô hình hoàn toàn khác nơi quyền truy cập được định nghĩa bởi danh tính và policy thay vì bởi ai biết một chuỗi ký tự.

Priya không mô tả điều này bằng những thuật ngữ bình tĩnh, trừu tượng. Cô mô tả nó như một câu chuyện.

**Vụ Rò Rỉ Tốn 80.000 Đô La Trong Bốn Giờ**

Một nhà phát triển tại một startup đã đẩy một script triển khai GitHub Actions lên kho lưu trữ công khai của họ. Script chứa thông tin đăng nhập AWS được mã hóa cứng thành các biến môi trường — một sai lầm đủ phổ biến để có loại riêng của nó trong các phân tích sự cố bảo mật đám mây. Thông tin đăng nhập có quyền truy cập admin đầy đủ vào tài khoản AWS của công ty, vì ai đó đã cấu hình chúng theo cách đó sáu tháng trước để tránh phải đối phó với các policy IAM.

Thông tin đăng nhập ở trong tệp khoảng sáu phút trước khi một trình quét tự động — được chạy bởi một kẻ tấn công, không phải một nhà nghiên cứu bảo mật — tìm thấy chúng.

Trình quét lập chỉ mục thông tin đăng nhập, đánh giá quyền tài khoản, và bắt đầu khởi động các instance GPU ở nhiều region. Các instance GPU đắt đỏ. Chúng cũng hữu ích cho việc khai thác tiền điện tử. Trong giờ đầu tiên, bốn mươi bảy instance `p3.8xlarge` đang chạy trên `us-east-1`, `eu-west-1`, và `ap-southeast-1`.

Một `p3.8xlarge` tốn khoảng 12 đô la mỗi giờ. Bốn mươi bảy cái tốn 564 đô la mỗi giờ.

Đến lúc cảnh báo thanh toán của startup kích hoạt — được cấu hình ở mức 1.000 đô la mỗi ngày, mà không ai nghĩ đến việc siết chặt — bốn giờ đã trôi qua. Hóa đơn đang tiến đến 2.200 đô la và leo lên.

Đến lúc ai đó hiểu chuyện gì đang xảy ra và thu hồi thông tin đăng nhập, hóa đơn đã đạt 3.400 đô la cho vài giờ đó. Nhưng chi phí thực đến sau: cuộc kiểm tra tiết lộ rằng kẻ tấn công đã khai thác trong nhiều tuần rồi, một cách lặng lẽ, vào ban đêm, sử dụng một bộ thông tin đăng nhập bị rò rỉ thứ hai mà không ai nhận thấy. Tổng thiệt hại đến lúc cuộc kiểm tra hoàn thành: hơn 80.000 đô la.

"Và họ đóng cửa?" Tom hỏi.

"Ba tháng sau," Priya nói. "Các nhà đầu tư rút lui. Vụ rò rỉ được công bố. Đưa tin báo chí làm cho việc gọi vốn không thể."

Căn phòng yên lặng.

"Vậy thì lựa chọn thay thế là gì?" Tom hỏi.

**Khái Niệm: Quản Lý Danh Tính và Quyền Truy Cập**

Lựa chọn thay thế là một hệ thống nơi bạn không đưa cho mọi người cùng một chìa khóa.

Hãy tưởng tượng một tòa nhà văn phòng nơi mỗi tầng có các khu vực khác nhau, và mỗi nhân viên có một thẻ từ chỉ mở các cửa họ cần cho công việc của mình. Thẻ từ của thực tập sinh hoạt động ở tầng ba. Thẻ từ của kế toán mở văn phòng tài chính nhưng không mở phòng máy chủ. Không ai đi qua một cửa mà họ không có lý do để đi qua.

Đó là mô hình AWS sử dụng.

AWS gọi hệ thống này là **IAM**: Identity and Access Management (Quản lý Danh tính và Quyền truy cập).

IAM là hệ thống thẻ từ cho toàn bộ tài khoản đám mây của bạn. Bạn định nghĩa ai tồn tại (danh tính), những gì họ được phép làm (quyền), và áp dụng các quyền đó thông qua policy. Tòa nhà có hàng chục tầng. IAM đảm bảo mỗi người chỉ có thể đến các tầng họ cần.

Phép so sánh thẻ từ mở rộng hơn nữa. Trong một tòa nhà được vận hành tốt, bạn biết tại bất kỳ thời điểm nào ai có quyền truy cập vào cái gì. Bạn có thể in một báo cáo: đây là quyền truy cập của mọi thẻ từ. Đây là ai đã ở trong phòng máy chủ trong 30 ngày qua. Đây là những thẻ chưa được sử dụng trong 90 ngày (một chỉ báo có thể có về thẻ của một nhân viên đã bị chấm dứt mà không được vô hiệu hóa).

IAM cung cấp cùng một khả năng hiển thị. Mọi hành động được thực hiện qua IAM — mọi lệnh gọi API, mọi lần đăng nhập console, mọi cấp quyền — được ghi lại trong **AWS CloudTrail**. Nếu bạn cần biết ai đã xóa một cơ sở dữ liệu lúc 2 giờ sáng thứ Ba, CloudTrail có câu trả lời. Nếu bạn cần chứng minh với một kiểm toán viên rằng chỉ những người dùng được ủy quyền mới có quyền truy cập vào các hệ thống production, CloudTrail cung cấp bằng chứng.

AWS CloudTrail tự động giữ lịch sử 90 ngày của các sự kiện quản lý, có thể đọc từ console. Nhưng 90 ngày có cách trở nên không đủ khi nhóm bảo mật của bạn cần kiểm tra điều gì đó từ quý trước. Đối với ghi nhật ký dai dẳng, dài hạn — và cho cảnh báo — bạn cần tạo một **Trail**, ghi tất cả các sự kiện vào một bucket S3 và có thể stream đến CloudWatch Logs. Trail không tự động; nó là thứ bạn cấu hình một lần và rồi quên đi. Cho đến khi bạn cần nó.

Sự kết hợp giữa kiểm soát truy cập của IAM và ghi nhật ký kiểm toán của CloudTrail là những gì cho phép các tổ chức lớn vận hành các tài khoản AWS ở quy mô với sự tự tin: quyền truy cập được định nghĩa và thực thi bởi IAM; mọi lần thực thi quyền truy cập đó được ghi lại bởi CloudTrail.

**Phép So Sánh Với Bệnh Viện**

Đây là một cách thứ hai để nghĩ về nó — một cách làm cho hệ thống phân cấp truy cập trực quan hơn.

Hãy tưởng tượng một bệnh viện. Không chỉ là tòa nhà vật lý, mà là toàn bộ cấu trúc tổ chức của con người, vai trò, và dữ liệu.

**Nhân viên lễ tân** có thể xem lịch hẹn của bệnh nhân và thông tin bảo hiểm. Họ có thể nhận và trả bệnh nhân. Họ không thể truy cập hồ sơ y tế, không thể sửa đổi đơn thuốc, không thể xem lịch sử phẫu thuật.

**Y tá** có thể truy cập hồ sơ y tế cho các bệnh nhân ở khu của họ. Họ có thể cho thuốc theo lệnh của bác sĩ. Họ không thể kê đơn thuốc. Họ không thể cho phép phẫu thuật.

**Bác sĩ** có thể xem và sửa đổi hồ sơ y tế, viết đơn thuốc, và yêu cầu xét nghiệm. Họ không thể truy cập hệ thống lương. Họ không thể sửa đổi đơn thuốc của các bác sĩ khác mà không có một ghi đè cụ thể.

**Bác sĩ phẫu thuật** có thể truy cập các hệ thống phòng mổ. Họ có quyền cụ thể cho hồ sơ phẫu thuật mà hầu hết các bác sĩ không cần.

**Nhân viên dọn dẹp** có thể truy cập sơ đồ tầng và lịch phòng. Họ không thể truy cập bất kỳ dữ liệu bệnh nhân nào.

Mỗi người trong bệnh viện có quyền truy cập họ cần cho công việc của mình — và chỉ vậy. Nhân viên lễ tân không có quyền truy cập phẫu thuật. Nhân viên dọn dẹp không thấy hồ sơ bệnh nhân. Và quan trọng: nếu thẻ từ của một nhân viên dọn dẹp bị đánh cắp, kẻ tấn công có được lịch dọn dẹp. Họ không có được hồ sơ bệnh nhân. Bán kính vụ nổ của vụ rò rỉ bị giới hạn ở những gì thẻ từ đó có thể truy cập.

Đây là cách IAM hoạt động. Mỗi danh tính — mỗi user, mỗi dịch vụ, mỗi quy trình tự động — nhận chính xác các quyền nó cần. Không hơn.

Tom ngả người ra sau. "Vậy Leo là y tá, và tôi là kế toán."

"Đại loại vậy," Priya nói. "Và cả hai bạn đều không phải bác sĩ phẫu thuật."

"Ai là bác sĩ phẫu thuật?"

"Không ai cả, hàng ngày," Priya nói. "Tài khoản root là bác sĩ phẫu thuật. Nó chỉ xuất hiện cho các thủ tục cụ thể, được ghi chép."

**Các Khối Xây Dựng Của IAM**

IAM có bốn khái niệm cốt lõi. Chúng xây dựng trên nhau.

**Users** là các danh tính cá nhân. Maya có một user IAM. Tom có một user IAM. Mỗi user có thông tin đăng nhập riêng — và chỉ nên có các quyền mà họ cụ thể cần.

Một user IAM có hai loại thông tin đăng nhập: một **mật khẩu** cho truy cập console (đăng nhập vào giao diện web AWS) và **access key** (một key ID và secret key) cho truy cập theo chương trình qua CLI hoặc SDK. Bạn không phải lúc nào cũng cần cả hai. Một nhà phát triển chỉ sử dụng CLI không cần mật khẩu console. Một người dùng phi kỹ thuật chỉ cần console không cần access key. Chỉ cấp những gì cần thiết.

**Groups** là tập hợp của users. Thay vì thiết lập quyền cho Maya, Tom, Priya và Leo riêng lẻ, bạn tạo một nhóm "Developers" với quyền nhà phát triển và thêm họ vào đó. Khi một người thứ năm tham gia, bạn thêm họ vào nhóm và họ ngay lập tức kế thừa các quyền đúng.

Lợi ích thực tế của nhóm là khả năng bảo trì. Nếu nhóm "Developers" cần một quyền mới — chẳng hạn, truy cập vào một bucket S3 mới — bạn thêm nó vào nhóm một lần và tất cả các nhà phát triển ngay lập tức có nó. Không có nhóm, bạn sẽ cập nhật từng user riêng lẻ, điều này tạo ra cơ hội cho sự không nhất quán và bỏ sót người.

**Roles** là các danh tính tạm thời có thể được *đảm nhận* bởi ai đó — một người, một dịch vụ, hoặc một tài khoản AWS khác. Chúng ta sẽ đi sâu vào role trong Chương 14. Hiện tại: nếu User là nhân viên cố định, Role là thẻ khách. Nó cấp quyền truy cập cụ thể trong một khoảng thời gian hoặc mục đích cụ thể.

Cách sử dụng Role quan trọng nhất cho chương này: IAM Role cho các EC2 instance. Khi bạn gắn một Role vào một EC2 instance, ứng dụng chạy trên instance đó có thể thực hiện các lệnh gọi API AWS bằng cách sử dụng quyền của Role — mà không có bất kỳ thông tin đăng nhập tĩnh nào được lưu trữ ở đâu cả. Thông tin đăng nhập là tạm thời, được xoay tự động bởi AWS, và được giới hạn phạm vi theo các policy của Role. Điều này loại bỏ hoàn toàn vấn đề "thông tin đăng nhập trong các tệp cấu hình".

**Policies** là các quy tắc quyền thực sự. Một policy là một tài liệu (viết bằng JSON nội bộ, nhưng bạn không cần ghi nhớ định dạng) nói rằng: "Người nắm giữ policy này ĐƯỢC PHÉP thực hiện hành động X trên tài nguyên Y." Hoặc "BỊ TỪ CHỐI hành động Z."

AWS cung cấp hàng trăm **managed policy** — các policy được viết sẵn cho các trường hợp sử dụng phổ biến. `AmazonS3ReadOnlyAccess` cấp quyền đọc cho tất cả các bucket S3. `AmazonEC2FullAccess` cấp toàn quyền kiểm soát EC2. Đối với sử dụng production, bạn thường muốn **customer-managed policy** — các policy bạn tự viết, giới hạn phạm vi chính xác theo các tài nguyên và hành động mà ứng dụng của bạn thực sự cần.

Mô hình đánh giá IAM là: theo mặc định, mọi thứ bị từ chối. Quyền phải được cấp rõ ràng. Nếu một policy không nói bạn có thể làm điều gì đó, bạn không thể.

**Nguyên Tắc Đặc Quyền Tối Thiểu**

Cho người và hệ thống chỉ quyền truy cập họ cần để làm công việc của mình. Không hơn.

Priya gọi đây là "nguyên tắc đặc quyền tối thiểu." Nó nghe có vẻ hiển nhiên. Trong thực tế, hầu hết các nhóm vi phạm nó liên tục — không phải ác ý, mà vì tiện lợi.

"Chúng ta có thể chỉ cấp cho Leo quyền truy cập admin để anh ấy có thể triển khai mọi thứ nhanh hơn không?"

Không.

"Chúng ta có thể chỉ sử dụng tài khoản root cho mọi thứ không?"

Tuyệt đối không.

Tài khoản root là chìa khóa chủ cho toàn bộ tài khoản AWS của bạn. Nó có thể làm bất cứ điều gì, bao gồm đóng chính tài khoản. Bạn nên tạo nó một lần, thiết lập xác thực đa yếu tố, và rồi không bao giờ sử dụng nó lại cho công việc hàng ngày.

Có chính xác một số ít tác vụ đòi hỏi tài khoản root: thay đổi địa chỉ email tài khoản, xem thông tin thanh toán không được ủy quyền theo cách khác, đóng tài khoản, và một số thao tác quản trị khác mà AWS rõ ràng hạn chế cho root. Đối với mọi thứ khác — tạo người dùng, triển khai cơ sở hạ tầng, truy cập cơ sở dữ liệu — bạn sử dụng các user và role IAM. Tài khoản root dành cho người quản lý tòa nhà. Mọi người khác có thẻ từ phù hợp.

Priya đã tạo các user IAM riêng biệt cho mọi người chiều hôm đó. Cô cho Leo quyền triển khai lên môi trường phát triển. Không phải production. Không phải thanh toán. Không phải mạng. Chỉ triển khai.

"Điều này cảm thấy hạn chế," Leo nói.

"Đó là cách bạn biết nó đúng," Priya đáp.

Ranh giới phát triển-so với-production là đường đặc quyền tối thiểu đầu tiên và quan trọng nhất mà Priya vạch ra. Các nhà phát triển cần di chuyển nhanh trong phát triển: tạo tài nguyên, kiểm tra cấu hình, mắc lỗi. Nhưng production thì khác. Các thay đổi production cần phải có chủ ý, được rà soát, và được thực thi qua một quy trình được kiểm soát. Cho một nhà phát triển quyền truy cập production trực tiếp là cho họ khả năng mắc lỗi production ở tốc độ phát triển.

Theo thời gian, Priya xây dựng một hệ thống nơi quyền truy cập production được cấp tạm thời qua một quy trình đảm nhận role: một nhà phát triển cần thực hiện một thay đổi production yêu cầu quyền truy cập, nhận nó trong một cửa sổ 4 giờ, thực hiện thay đổi, và quyền truy cập tự động hết hạn. Cửa sổ được ghi lại trong CloudTrail. Quyền truy cập không thể được sử dụng sau khi nó hết hạn. Production được bảo vệ không phải bằng cách từ chối quyền truy cập vĩnh viễn, mà bằng cách làm cho quyền truy cập có giới hạn thời gian và có thể kiểm toán.

Bạn có thể đang tự hỏi: nếu mọi thứ bị từ chối theo mặc định, tại sao tài khoản root có quyền truy cập đầy đủ? Tài khoản root đặc biệt — nó bỏ qua IAM hoàn toàn. Đó chính xác là lý do tại sao bạn khóa nó đi. Mọi hành động khác trong AWS đi qua chuỗi đánh giá của IAM, nơi một Allow bị thiếu giống như một Deny.

**Bán Kính Vụ Nổ: Tại Sao Đặc Quyền Tối Thiểu Cứu Các Công Ty**

Có một khái niệm mà các kỹ sư bảo mật sử dụng để nghĩ về việc xâm phạm thông tin đăng nhập: **bán kính vụ nổ**.

Bán kính vụ nổ là thiệt hại tối đa mà một kẻ tấn công có thể gây ra nếu họ có được một thông tin đăng nhập nhất định.

Một kẻ tấn công với thông tin đăng nhập root của một tài khoản AWS có bán kính vụ nổ không giới hạn. Họ có thể xóa mọi tài nguyên, trích xuất mọi byte dữ liệu, khởi động các instance GPU ở mọi Region, và đóng tài khoản. Bản thân thông tin đăng nhập không chứa giới hạn nào.

Một kẻ tấn công với thông tin đăng nhập IAM của Leo — được giới hạn phạm vi để triển khai lên môi trường phát triển và đọc từ một bucket S3 — có một bán kính vụ nổ nhỏ xíu. Họ có thể triển khai lên dev. Họ có thể đọc một số tệp. Họ không thể chạm vào production. Họ không thể truy cập cơ sở dữ liệu. Họ không thể thấy thanh toán. Họ không thể khởi động các instance GPU.

Câu chuyện rò rỉ từ trước có bán kính vụ nổ lớn vì thông tin đăng nhập của nhà phát triển là admin. Nếu cùng những thông tin đăng nhập đó được giới hạn phạm vi theo công việc thực tế của họ — triển khai lên một môi trường cụ thể — thiệt hại sẽ nhỏ hơn nhiều. Cuộc tấn công vẫn có thể đã xảy ra. Kết quả sẽ khác đi.

Đây là lý do tại sao đặc quyền tối thiểu không chỉ là policy. Nó là kiến trúc. Mọi quyền bạn không cấp là bán kính vụ nổ bạn không có.

**Chuyện Gì Xảy Ra Khi Bạn Làm Sai Điều Này**

Ba tình huống, theo thứ tự mức độ nghiêm trọng tăng dần:

**Tình huống 1**: Một nhân viên với quyền truy cập admin rời công ty. Không ai vô hiệu hóa tài khoản của họ. Ba tháng sau, họ vẫn có quyền truy cập. Điều này xảy ra liên tục. IAM giải quyết nó: bạn vô hiệu hóa user. Ngay lập tức, ở mọi nơi.

Đây là chế độ lỗi IAM phổ biến nhất, và nó hoàn toàn có thể ngăn ngừa. Hầu hết các tổ chức có một quy trình thu hồi quyền truy cập vật lý (trả lại thẻ, trả lại máy tính xách tay) nhưng bỏ qua IAM. Danh sách kiểm tra rời việc bao gồm "vô hiệu hóa user IAM" và "xóa khỏi tất cả các nhóm IAM" không phải là một thách thức kỹ thuật phức tạp — nó là kỷ luật quy trình. Các nhóm làm nó một cách nhất quán là những nhóm không bao giờ phát hiện ra chuyện gì xảy ra khi một cựu nhân viên vẫn có thể truy cập cơ sở dữ liệu production.

**Tình huống 2**: Máy tính xách tay của một nhà phát triển bị xâm phạm. Kẻ tấn công tìm thấy thông tin đăng nhập AWS được lưu trữ trong một tệp cấu hình với quyền admin đầy đủ. Vì thông tin đăng nhập có quyền truy cập rộng, kẻ tấn công có thể làm bất cứ điều gì: khai thác tiền điện tử, đánh cắp dữ liệu, xóa các bản sao lưu. Với đặc quyền tối thiểu: thông tin đăng nhập chỉ hoạt động cho phạm vi giới hạn của chúng. Bán kính vụ nổ được kiềm chế.

Mẫu thông tin đăng nhập trong một tệp cấu hình phổ biến hơn nó nên có. Các nhà phát triển thường lưu trữ thông tin đăng nhập AWS trong `~/.aws/credentials` cho phát triển cục bộ — điều đó ổn. Vấn đề là khi những thông tin đăng nhập đó có quyền truy cập cấp production thay vì được giới hạn phạm vi vào một môi trường sandbox. Thông tin đăng nhập phát triển nên được giới hạn phạm vi vào một môi trường phát triển. Quyền truy cập production nên đòi hỏi các bước rõ ràng để đảm nhận, không phải hiện diện trên mọi máy tính xách tay mọi lúc.

**Tình huống 3**: Một ứng dụng được viết tồi vô tình để lộ thông tin đăng nhập AWS trong nhật ký của nó. Nếu những thông tin đăng nhập đó có quyền truy cập rộng, bạn có một vụ rò rỉ thảm họa. Nếu chúng có quyền truy cập hẹp — chỉ vào bucket S3 cụ thể mà ứng dụng cần — sự phơi nhiễm bị giới hạn và kiềm chế.

Tình huống thông tin-đăng-nhập-ứng-dụng-trong-nhật-ký tinh vi. Nó thường xảy ra khi mã gỡ lỗi ghi nhật ký toàn bộ ngữ cảnh yêu cầu — bao gồm các header ủy quyền — hoặc khi một trình xử lý lỗi tuần tự hóa tất cả các biến môi trường (bao gồm `AWS_ACCESS_KEY_ID`) vào một tệp nhật ký. Biện pháp bảo vệ ở đây là IAM Role cho EC2, loại bỏ thông tin đăng nhập tĩnh khỏi môi trường ứng dụng hoàn toàn. Nếu không có thông tin đăng nhập tĩnh, chúng không thể xuất hiện trong nhật ký.

Mẫu: quyền truy cập nên được giới hạn phạm vi ở mức tối thiểu. Luôn luôn. Không phải vì bạn không tin tưởng người của bạn, mà vì bạn không thể kiểm soát chuyện gì xảy ra với thông tin đăng nhập bị xâm phạm.

**Nếu Quyền Truy Cập Rộng Thì Tiện Lợi Nhưng Phơi Nhiễm**

Luôn có một cám dỗ để cho các nhóm quyền truy cập rộng hơn họ cần — nó làm cho các triển khai nhanh hơn, giảm ma sát, tránh các khoảnh khắc "Access Denied" làm gián đoạn dòng chảy. Nếu bạn cho mọi người quyền truy cập admin, thì các triển khai mượt mà và không ai bị chặn — nhưng khi thông tin đăng nhập bị rò rỉ (và chúng sẽ rò rỉ), kẻ tấn công kế thừa quyền admin đầy đủ. Một máy tính xách tay bị xâm phạm trở thành một vụ rò rỉ tài khoản hoàn chỉnh. Viết quyền tối thiểu trước. Mở rộng chỉ khi điều gì đó thất bại. Quy tắc đó cứu các công ty.

**Xác Thực Đa Yếu Tố: Ổ Khóa Thứ Hai**

Ngay cả với đặc quyền tối thiểu, thông tin đăng nhập có thể bị đánh cắp. Mật khẩu có thể bị đoán, lừa đảo, hoặc rò rỉ. IAM giải quyết điều này với **Xác thực Đa yếu tố (MFA)**.

MFA đòi hỏi thứ gì đó bạn *biết* (mật khẩu) cộng với thứ gì đó bạn *có* (một điện thoại, một khóa phần cứng). Ngay cả khi một kẻ tấn công đánh cắp mật khẩu của bạn, họ không thể đăng nhập mà không cũng có điện thoại của bạn.

MFA nên được bật cho mọi user IAM. Nó không thể thương lượng đối với tài khoản root.

Priya dành buổi chiều thiết lập nó cho mọi người. Nó không diễn ra suôn sẻ.

Ứng dụng xác thực của Leo đăng ký sai tài khoản hai lần. Anh phải quét mã QR ba lần vì đồng hồ trên máy tính xách tay của anh hơi không đồng bộ, khiến các token dựa trên thời gian thất bại. Ở lần thử thứ ba, nó hoạt động.

"Có cách nào làm điều này mà không cần ứng dụng không?" Leo hỏi, nhìn vào điện thoại của mình.

"Khóa phần cứng," Priya nói. "Một thiết bị vật lý cắm vào USB. An toàn hơn ứng dụng. Đắt hơn."

"Đắt hơn bao nhiêu?"

"Khoảng 50 đô la mỗi khóa. Bạn sẽ muốn hai cái, phòng khi bạn làm mất một cái."

Tom viết "100 đô la mỗi nhà phát triển" trong cuốn sổ tay của mình.

"Chúng ta đang mua chúng," Priya nói. "Cho tài khoản root ở mức tối thiểu."

Tom hỏi liệu nó có quá nhiều ma sát về tổng thể không. Priya mở lại câu chuyện rò rỉ.

Tom thiết lập MFA ngay lập tức.

"Và nếu ai đó cố xâm nhập trong khi chúng ta đang ở giữa quá trình chuyển đổi này thì sao?" Priya hỏi. "Trước khi mọi người đã bật MFA?"

Không ai có câu trả lời tốt. Cô thiết lập MFA cho tài khoản root trước, trước bất kỳ ai khác.

**IAM Access Analyzer: Cặp Mắt Thứ Hai**

Priya có thêm một công cụ để cho nhóm xem sau khi thiết lập MFA hoàn thành.

"Cái này chạy tự động," cô nói, mở một tab console mới.

**IAM Access Analyzer** là một dịch vụ liên tục phân tích các policy IAM của bạn và đánh dấu bất cứ điều gì cấp quyền truy cập vào các tài nguyên bên ngoài tài khoản của bạn — hoặc bên ngoài những gì bạn mong đợi.

Nó tìm thấy điều gì đó trong lần chạy đầu tiên.

Một bucket S3 — một cái Leo đã thiết lập là "tạm thời" ba tuần trước rồi quên — có một bucket policy cho phép quyền đọc công khai. Bucket chứa một số tệp dữ liệu thử nghiệm, không có gì nhạy cảm. Nhưng nó cũng chứa một thư mục mà Leo đã đặt tên là `db-backups-staging` và điền vào một số tệp SQL được xuất để kiểm tra quy trình nhập.

"Có gì nhạy cảm trong những tệp SQL đó không?" Priya hỏi.

Leo nhìn tên thư mục. Rồi nhìn các tệp bên trong nó. Rồi nhìn trần nhà.

"Tôi đã xuất cơ sở dữ liệu staging," anh nói. "Cái có các bản sao của dữ liệu khách hàng production ban đầu."

Priya đóng máy tính xách tay của mình một cách chậm rãi.

Bucket được đặt thành riêng tư trong vòng năm phút. Access Analyzer tiếp tục giám sát cho bất kỳ policy tương lai nào mở các tài nguyên một cách bất ngờ.

"Hãy nghĩ về nó như một báo động chu vi," Priya nói. "Mỗi khi ai đó vô tình để một cửa mở, nó báo cho chúng ta."

Bạn có thể đang tự hỏi: IAM Access Analyzer có thay thế rà soát policy thủ công không? Không. Nó là một công cụ phát hiện, không phải một công cụ ngăn ngừa. Nó cho bạn biết về quyền truy cập đã được cấp — nó không thể cho bạn biết liệu quyền truy cập đó có cố ý hay không. Việc con người rà soát "policy này có đúng không?" vẫn phải xảy ra. Access Analyzer chỉ đảm bảo các cửa sổ mở không bị bỏ qua.

## Điểm Mạnh Và Hạn Chế

**IAM là công cụ đúng cho**:

- Kiểm soát ai và cái gì có thể truy cập mọi tài nguyên AWS
- Triển khai đặc quyền tối thiểu trên các user, dịch vụ, và ranh giới giữa các tài khoản
- Loại bỏ nhu cầu chia sẻ thông tin đăng nhập tồn tại lâu giữa các hệ thống
- Mọi hành động IAM được ghi lại tự động, cho bạn một dấu vết kiểm toán về ai đã làm gì và khi nào (đề cập ở Chương 14)
- Truy cập giữa các tài khoản: một IAM Role trong Tài khoản A có thể được đảm nhận bởi một principal trong Tài khoản B, cho phép chia sẻ tài nguyên có kiểm soát giữa các tài khoản AWS mà không cần chia sẻ thông tin đăng nhập

**Nơi IAM trở nên khó khăn**: Các policy IAM có thể phát triển thành hàng trăm câu lệnh trên hàng chục role, và gỡ lỗi một lỗi "Access Denied" đòi hỏi hiểu cái nào trong số các policy đó là cái có hiệu lực — một tác vụ khó hơn nó nghe có vẻ. Sai lầm IAM phổ biến nhất không phải là quá ít quyền truy cập — đó là quá nhiều. Các policy quá rộng được tạo ra để "chỉ làm cho nó hoạt động" trở thành các trách nhiệm bảo mật đau đớn để cuộn lại sau này. Viết quyền tối thiểu trước. Mở rộng chỉ khi điều gì đó thất bại.

Có một thách thức thực tế với IAM ở quy mô: **sự lan tràn policy**. Các tổ chức đã vận hành AWS trong vài năm thường có hàng chục hoặc hàng trăm policy tùy chỉnh, nhiều trong số đó chồng chéo, một số chưa bao giờ được sử dụng, và một vài cái mâu thuẫn với nhau theo những cách không ai nhận thấy vì các mâu thuẫn chỉ quan trọng cho các trường hợp biên. AWS cung cấp **IAM Access Analyzer** (mà chúng ta đã giới thiệu trong chương này) và các công cụ **mô phỏng policy IAM** để giúp kiểm toán và hợp lý hóa các policy. Nhưng chiến lược hiệu quả nhất là xây dựng các policy sạch từ đầu và kiểm toán đều đặn — thay vì để các policy tích lũy và cố gắng gỡ rối chúng sau này.

Priya thiết lập một cuộc rà soát IAM hàng quý: liệt kê tất cả các role và policy, kiểm tra cái nào đang được sử dụng tích cực qua nhật ký CloudTrail, đánh dấu bất kỳ thông tin đăng nhập không được sử dụng hoặc policy quá rộng nào để xóa hoặc hạn chế. Cuộc rà soát mất hai giờ mỗi quý và bắt được ba vấn đề policy trong năm đầu tiên của nó.

"Đó không phải công việc thú vị," cô nói. "Nhưng các cuộc rà soát truy cập là cách bạn tìm thấy những thứ sẽ là thảm họa nếu ai đó nhận thấy chúng trước."

## Tóm Tắt

Mật khẩu Admin123 là triệu chứng. Căn bệnh là Nimbus không có chiến lược kiểm soát truy cập nào cả — một thông tin đăng nhập root chia sẻ, không có role, không có policy, không có dấu vết kiểm toán. IAM không chỉ sửa triệu chứng; nó buộc nhóm trả lời một câu hỏi họ đã tránh: ai, chính xác, được phép làm gì? Câu trả lời cho câu hỏi đó là nền tảng của mọi kiến trúc AWS an toàn.

- **IAM** (Identity and Access Management) là cách bạn kiểm soát ai có thể làm gì trong AWS. Các khối xây dựng cốt lõi là: **Users**, **Groups**, **Roles**, và **Policies**.
- Theo mặc định, mọi thứ trong AWS bị **từ chối**. Quyền phải được cấp rõ ràng.
- **Nguyên Tắc Đặc Quyền Tối Thiểu** có nghĩa là cho mỗi danh tính chỉ quyền truy cập nó cần — giảm thiểu **bán kính vụ nổ** nếu một thông tin đăng nhập bị xâm phạm.
- **Tài khoản root** có thể làm bất cứ điều gì, bao gồm những điều thảm họa. Khóa nó sau MFA và sử dụng nó càng ít càng tốt.
- Bật **MFA** cho mọi user IAM. Không thể thương lượng — trong kỳ thi và trong production.

## Mẹo Thi

*SAA-C03 Domain 1 — Task 1.1 (truy cập an toàn vào tài nguyên AWS)*

- **Mọi thứ bị từ chối theo mặc định.** Một "Allow" rõ ràng là cần thiết. Nếu một policy
  không đề cập đến một hành động, hành động bị từ chối.
- **Explicit Deny luôn thắng.** Nếu bất kỳ policy nào trong chuỗi từ chối một hành động, từ chối đó
  không thể bị ghi đè bởi một Allow ở bất kỳ nơi nào khác trong chuỗi. Điều này khiến nhiều
  thí sinh mất cảnh giác.
- **Tài khoản root ≠ admin IAM.** Tài khoản root là một thông tin đăng nhập riêng biệt với IAM.
  Bạn không thể xóa tài khoản root. Bạn *có thể* (và nên) hạn chế khi nào nó được sử dụng.
- **IAM là toàn cầu**, không phải theo Region. Các user, group, role, và policy IAM tồn tại
  trên toàn bộ tài khoản AWS, không phải theo từng Region.
- **Role là cách ưa thích để cấp quyền truy cập cho các dịch vụ AWS.** Nếu một EC2 instance
  cần truy cập S3, bạn gắn một IAM Role vào instance — bạn không lưu trữ
  thông tin đăng nhập trên máy. Mẫu này xuất hiện liên tục trong kỳ thi.
- **IAM Access Analyzer** tạo ra các phát hiện khi các tài nguyên có thể truy cập từ bên ngoài tài khoản hoặc từ bên ngoài tổ chức. Khi một tình huống thi đề cập đến phát hiện truy cập bên ngoài không mong muốn vào S3 hoặc KMS, Access Analyzer là câu trả lời.
- **MFA cho tài khoản root là bắt buộc**, không phải tùy chọn, trong bối cảnh các thực hành tốt nhất về bảo mật AWS. Các câu hỏi thi về bảo mật tài khoản root luôn bao gồm MFA như một phần của câu trả lời đúng.
- **Permission boundary** là một tính năng IAM nâng cao (đề cập ở Chương 14) giới hạn quyền tối đa mà một user hoặc role IAM có thể có, ngay cả khi các policy của họ cấp nhiều hơn. Các câu hỏi thi về "ngăn chặn leo thang đặc quyền" hoặc "đặt một trần quyền tối đa" chỉ ra permission boundary.
- **Service Control Policies (SCPs)** là các policy cấp tổ chức hạn chế những gì có thể được làm trong các tài khoản thành viên của một AWS Organization. Chúng hoạt động trên cấp IAM — ngay cả một quản trị viên tài khoản cũng không thể vượt quá các giới hạn được đặt bởi một SCP. Khi một tình huống thi liên quan đến quản trị bảo mật đa tài khoản, hãy nghĩ đến SCP.
- **CloudTrail** ghi lại tất cả các lệnh gọi API IAM. Khi một tình huống thi hỏi "làm sao bạn sẽ kiểm toán xem những user nào đã thực hiện thay đổi đối với các policy IAM," câu trả lời là CloudTrail. Mọi hành động IAM — tạo một user, sửa đổi một policy, đảm nhận một role — được ghi lại. Lịch sử sự kiện 90 ngày là tự động và miễn phí; để lưu giữ dài hạn và cảnh báo, bạn phải tạo một Trail giao nhật ký đến một bucket S3.

## Bài Tập

**Bài tập 1 — Nhớ lại**

Bằng lời của bạn: sự khác biệt giữa một IAM User, một Group, và một Role là gì?
Khi nào bạn sẽ sử dụng mỗi cái?

*(Gợi ý: Nghĩ về phép so sánh tòa nhà thẻ từ — cái nào là thẻ vĩnh viễn,
cái nào là nhóm phòng ban, và cái nào là thẻ khách?)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty chạy một ứng dụng web trên các EC2 instance cần đọc các tệp
từ một bucket S3. Một nhà phát triển cấp thấp đề xuất lưu trữ các access key AWS trực tiếp trong
mã ứng dụng trên các EC2 instance. Nhóm bảo mật phản đối.

Giải pháp AN TOÀN NHẤT và phù hợp về mặt vận hành là gì?

A) Lưu trữ các access key trong các biến môi trường trên EC2 instance thay vì
   mã  
B) Tạo một user IAM chuyên dụng với quyền đọc S3 và chia sẻ thông tin đăng nhập
   với nhóm phát triển  
C) Gắn một IAM Role với quyền đọc S3 phù hợp trực tiếp vào các EC2
   instance  
D) Sử dụng thông tin đăng nhập tài khoản root để cho ứng dụng quyền truy cập đầy đủ vào tất cả các tài nguyên
   AWS

**Gợi ý 1**: Vấn đề với việc lưu trữ thông tin đăng nhập ở bất kỳ đâu trên instance là
thông tin đăng nhập có thể bị rò rỉ. Có cách nào để cho EC2 instance quyền truy cập mà không
sử dụng thông tin đăng nhập nào không?

**Gợi ý 2**: AWS có một cơ chế nơi các dịch vụ có thể được cấp quyền mà không
cần thông tin đăng nhập tĩnh. Cơ chế đó gọi là gì?

**Gợi ý 3**: IAM Role có thể được gắn vào các EC2 instance. Khi chúng được gắn, instance
tự động nhận thông tin đăng nhập tạm thời được xoay bởi AWS. Không cần thông tin đăng nhập
tĩnh.

**Đáp án**: C

**Giải thích**: Gắn một IAM Role vào một EC2 instance là mẫu đúng.
Instance tự động nhận thông tin đăng nhập tạm thời, xoay vòng qua dịch vụ
metadata EC2. Không có thông tin đăng nhập tồn tại lâu để rò rỉ, xoay, hoặc vô tình
commit vào một kho lưu trữ.

**Tại sao không A?** Các biến môi trường trên một EC2 instance vẫn có thể bị rò rỉ —
qua nhật ký ứng dụng, các endpoint gỡ lỗi, hoặc nếu instance bị xâm phạm.
Thông tin đăng nhập tĩnh là vấn đề, không phải vị trí của chúng.

**Tại sao không B?** Tạo một user IAM chia sẻ và phân phối thông tin đăng nhập cho một nhóm
vi phạm đặc quyền tối thiểu và làm cho việc xoay thông tin đăng nhập trở thành một cơn ác mộng. Nếu một người
rời đi, bạn không thể dễ dàng thu hồi chỉ quyền truy cập của họ mà không thay đổi thông tin đăng nhập chia sẻ.

**Tại sao không D?** Sử dụng thông tin đăng nhập tài khoản root cho bất kỳ ứng dụng nào là một vi phạm
bảo mật nghiêm trọng. Tài khoản root có quyền truy cập không giới hạn và thông tin đăng nhập của nó không bao giờ nên
rời khỏi sự kiểm soát của chủ tài khoản.

*SAA-C03 Domain 1 — Task 1.1 (IAM role, đặc quyền tối thiểu)*

**Bài tập 3 — Thách thức kiến trúc** *(Tùy chọn)*

Nimbus đang tiếp nhận ba nhà phát triển mới vào tháng tới. Mỗi người sẽ cần các cấp độ
truy cập khác nhau: một người làm việc trên lớp cơ sở dữ liệu, một người trên các máy chủ ứng dụng, một người trên
các tệp tĩnh front-end. Cũng có một pipeline CI/CD cần triển khai mã.

Thiết kế một cấu trúc IAM cho tình huống này. Những user, group, role, và policy nào
bạn sẽ tạo? Ranh giới đặc quyền tối thiểu quan trọng nhất để thực thi sẽ là gì?

*(Không có câu trả lời đúng duy nhất. Nghĩ về việc giảm thiểu bán kính vụ nổ nếu bất kỳ
danh tính nào bị xâm phạm.)*

## Cảnh Sau Tín Dụng

Đến cuối ngày, mọi user IAM đã bật MFA. Tài khoản của Leo đã được giảm
xuống quyền truy cập cấp nhà phát triển: triển khai lên môi trường dev, đọc từ bucket cấu hình
chia sẻ, không gì khác.

Anh đã thử, một lần, để truy cập cơ sở dữ liệu production.

Access denied.

"Đây có phải cảm giác được tin tưởng nhưng không quá nhiều không?" anh hỏi.

"Đó chính xác là cảm giác đó," Priya nói.

Sáng hôm sau, Tom đến sớm và tìm thấy điều gì đó khiến anh ngay lập tức gọi
nhóm vào.

Trên console AWS, anh có thể thấy rằng website của họ đang nhận được lưu lượng. Nhiều hơn
họ đã mong đợi. Và máy chủ web — cái ban đầu của Leo — đang chạy nóng. Thực sự nóng.

"Chúng ta có một trăm người dùng đồng thời," Tom nói. "Và một máy chủ."

Chương tiếp theo: máy chủ đầu tiên — thuê một máy tính trong trung tâm dữ liệu của người khác.
