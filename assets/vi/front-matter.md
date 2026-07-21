\newpage

*Bản quyền © 2026 AI(2)M(2)IA*

*Cuốn sách này miễn phí. Bạn được tự do đọc, sao chép, dịch, chuyển thể và chia sẻ nó — bằng bất kỳ ngôn ngữ nào và ở bất kỳ định dạng nào — miễn phí, theo giấy phép Creative Commons Ghi công-Phi thương mại-Chia sẻ tương tự 4.0 Quốc tế (CC BY-NC-SA 4.0).*

*Nói đơn giản: bạn không được bán cuốn sách này hay bất cứ thứ gì bạn tạo ra từ nó, và không được đặt nó sau tường phí — quyền truy cập phải luôn miễn phí. Bạn được phép kêu gọi hỗ trợ tự nguyện cho công sức của mình, nhưng sự hỗ trợ đó không bao giờ được là điều kiện để đọc.*

*Ví dụ: nếu bạn dịch cuốn sách này sang tiếng Esperanto và xuất bản phiên bản của mình, bạn có thể mời độc giả đóng góp — nhưng bất kỳ ai cũng phải đọc được bản dịch của bạn mà không phải trả tiền. Nếu bạn tạo một kho lưu trữ mới và xây dựng một hướng dẫn học tập mới dựa trên nội dung này, quy tắc vẫn vậy: quyên góp thì được; đặt giá cho quyền truy cập thì không.*

*Tác giả giữ quyền bán các ấn bản của riêng mình — ví dụ ấn bản Kindle trên Amazon, việc mua nó giúp tài trợ cho cuốn sách tiếp theo.*

*Cuốn sách này có những người bạn đồng hành miễn phí. Đọc mã nguồn, dịch hoặc giúp cải thiện tại kho lưu trữ: https://github.com/AI2M2IA/book-lets-build-on-aws-together. Học miễn phí với ứng dụng luyện tập (một trò chơi): https://ai2m2ia.github.io/book-lets-build-on-aws-together. Xem video: https://www.youtube.com/playlist?list=PL9jytbqPPUEgTdZvVIdHxtXahX8922oYN. Điều khoản đầy đủ: LICENSE-CONTENT (văn bản sách, CC BY-NC-SA 4.0) và LICENSE (mã, AGPL-3.0).*

*Câu chuyện về Nimbus và các nhân vật là hư cấu. Bất kỳ sự tương đồng nào với người thật còn sống hoặc đã mất, hay với các sự kiện thật, đều là ngẫu nhiên.*

*Các dịch vụ AWS, mô hình định giá, thực hành tốt nhất và nội dung kỳ thi được mô tả trong cuốn sách này dựa trên tài liệu công khai có sẵn tại thời điểm xuất bản. Amazon Web Services, AWS và các dấu hiệu liên quan là thương hiệu của Amazon.com, Inc. hoặc các công ty liên kết. Cuốn sách này là tài nguyên giáo dục độc lập và không liên kết, không được chứng thực hoặc tài trợ bởi Amazon Web Services.*

*Giá cả AWS và tính năng dịch vụ thay đổi thường xuyên. Luôn xác minh thông tin hiện tại tại aws.amazon.com trước khi đưa ra các quyết định kiến trúc hay tài chính.*

*Kỳ thi AWS Solutions Architect Associate (SAA-C03) là một kỳ thi chứng chỉ thật. Truy cập aws.amazon.com/certification để đăng ký.*

*Ấn bản đầu tiên, 2026*

*In ấn và phân phối qua Amazon KDP*

---

\newpage

# Ghi Chú Về Phương Pháp

Cuốn sách này được viết với sự hỗ trợ của AI và công bố dưới bút danh AI(2)M(2)IA, phù hợp với thông lệ của mọi tập trong bộ sách này.

Chương trình học bạn sắp theo dõi — tiền đề của nó, các nhân vật, hình dạng cơ sở hạ tầng của Nimbus từ đường dây điện thoại nhà hàng đến kiến trúc AWS cấp độ sản xuất, những sự đánh đổi mà nhóm thực hiện dưới áp lực và những gì họ làm sai đầu tiên — những điều này được lựa chọn bởi một tác giả người thật và được thực hiện, từng dịch vụ một, qua sự cộng tác lâu dài với một mô hình ngôn ngữ lớn. Bìa sách được thiết kế với sự hỗ trợ của mô hình tạo ảnh dưới sự chỉ đạo tương tự. Bản thân cuốn sách điện tử được chuẩn bị bằng công cụ tự động.

Những gì bạn đọc là những gì đã được giữ lại.

Không có tuyên bố nào trong những trang này về quyền tác giả không có sự hỗ trợ; cũng không có tuyên bố rằng máy móc một mình là tác giả. Tác phẩm, giống như cơ sở hạ tầng mà nó mô tả, được duy trì bởi các lớp phụ thuộc lẫn nhau.

---

\newpage

*Dành cho tất cả những ai đã mở trình duyệt, gõ một lệnh và làm cho điều gì đó hoạt động —
và cho tất cả những ai đã mở trình duyệt, gõ một lệnh và học hỏi từ những gì không thành công.*

---

\newpage

# Lời Tựa

Có lẽ bạn đã từng cố gắng học AWS trước đây.

Có thể bạn đã mở tài liệu và, mười phút sau, thấy mình đang nhìn chằm chằm vào cú pháp chính sách IAM trước khi bạn thậm chí hiểu IAM dùng để làm gì.

Có thể bạn đã hoàn thành một khóa học video và nhận ra mình vẫn không thể giải thích một trang web thực sự tồn tại ở đâu.

Có thể bạn đã đánh dấu tài liệu ôn thi, ghi nhớ tên dịch vụ, rồi lại bị tê liệt lần đầu tiên khi một tình huống hỏi bạn sẽ làm gì nếu cơ sở dữ liệu bị lỗi trong giờ cao điểm bữa tối.

Đó không phải lỗi của bạn.

Đó là cách điện toán đám mây thường được dạy: trước tiên là danh mục, sau đó mới là hệ thống.

Cuốn sách này hoạt động khác.

**Bạn sẽ không học về AWS. Bạn sẽ sử dụng nó.**

Chúng ta bắt đầu với một nhà hàng đang mất đơn hàng vì đường dây điện thoại bận và không có trang web.

Từ đó, bạn sẽ theo dõi Maya, Tom, Priya và Leo khi họ xây dựng cơ sở hạ tầng của Nimbus từng quyết định một. Không theo thứ tự gọn gàng mà một giáo trình chứng chỉ ưa thích, mà theo thứ tự lộn xộn mà các hệ thống thực sự đòi hỏi.

Đến cuối, Nimbus sẽ xử lý 18.000 đơn hàng mỗi ngày: chạy trên nhiều Vùng Khả Dụng, tự động phục hồi sau sự cố, phục vụ người dùng Bờ Tây trong mili giây thông qua mạng phân phối nội dung, xử lý mọi đơn hàng qua đường dẫn phân tích thời gian thực, và kiểm soát chi phí khi kiến trúc trưởng thành cùng doanh nghiệp.

Mọi dịch vụ AWS trong cuốn sách này xuất hiện đúng lúc nó trở nên cần thiết. Không phải vì giáo trình đòi hỏi. Mà vì hệ thống cần.

**Cuốn sách này dành cho ai** Nếu bạn học tốt hơn qua vấn đề thay vì qua tài liệu, cuốn sách này được viết cho bạn. Nếu bạn đang chuẩn bị cho chứng chỉ AWS Solutions Architect Associate (SAA-C03), cuốn sách này cũng dành cho bạn: mọi phạm vi kỳ thi đều được bao gồm, và mỗi chương kết thúc bằng Mẹo Thi và câu hỏi thực hành theo phong cách SAA-C03. Nếu bạn đã làm trong lĩnh vực kỹ thuật và muốn hiểu *tại sao* các quyết định kiến trúc hoạt động, không chỉ tên dịch vụ là gì, bạn sẽ tìm thấy lý luận đó trên mỗi trang.

**Những gì bạn sẽ không tìm thấy ở đây** Một lối tắt. Đây không phải là tài liệu học vẹt. Nó dài hơn tài liệu học vẹt vì hiểu biết cần thời gian hơn ghi nhớ, và đó là sự hiểu biết chuyển đổi sang vai trò tiếp theo của bạn, hệ thống tiếp theo, và sự cố sản xuất mà không ai ghi lại đúng cách.

**Cách đọc cuốn sách này** Đọc nó như một cuốn tiểu thuyết trong lần đọc đầu tiên. Hãy để kiến trúc tự tiết lộ khi nhóm gặp phải các vấn đề thực sự và thực hiện các sự đánh đổi thực sự. Cuối mỗi chương, hãy dừng lại và sử dụng Mẹo Thi và bài tập một cách chủ động: che đáp án, tự suy luận qua tình huống, và chỉ sau đó kiểm tra những gì đã xảy ra.

Khi bạn hoàn thành, Nimbus sẽ đang trong sản xuất. Sự hiểu biết của bạn về AWS cũng vậy.

Hãy bắt đầu.
