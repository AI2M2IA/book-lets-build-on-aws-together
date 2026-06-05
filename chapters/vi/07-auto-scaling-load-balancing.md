# Chương 7: Nhà Hàng Tăng Trưởng Khi Bận Rộn

Đã là 7:43 tối thứ Sáu khi tỷ lệ lỗi vượt qua 12%.

Tom nhận thấy đầu tiên vì Tom luôn nhận thấy đầu tiên. Anh có một tab mở trên bảng điều khiển CloudWatch mà anh làm mới theo cách người khác kiểm tra mạng xã hội — phản xạ, liên tục, không hoàn toàn có ý định.

"Leo," anh nói.

Leo đã nhìn. Thời gian phản hồi: đang leo. Các yêu cầu đã xếp hàng: đang leo. EC2 instance duy nhất — ngay cả cái lớn hơn mà họ đã nâng cấp tháng trước — đang ở 94% CPU.

"Chúng ta đang xua đuổi khách hàng," Tom nói.

"Chúng ta không xua đuổi họ," Leo nói. "Máy chủ đang làm vậy."

"Cùng một chuyện."

Đúng vậy. Và điều đó đã xảy ra mỗi thứ Sáu trong ba tuần. Nimbus đã sống sót qua cuộc khủng hoảng lưu trữ — cơ sở dữ liệu có ổ đĩa riêng, ảnh sống trong S3 — nhưng ổn định và có thể mở rộng là những vấn đề hoàn toàn khác nhau.

Nhóm cần hệ thống của họ xử lý tải thay đổi tự động. Không mua đủ máy chủ cho trường hợp xấu nhất và lãng phí tiền trong thời gian yên tĩnh. Và không phải vật lộn thủ công khi xuất hiện các đợt tăng đột biến lưu lượng.

Có một mẫu cho điều này. AWS có hai service triển khai nó.

**Khái Niệm: Mở Rộng Theo Chiều Ngang**

Có hai cách để hệ thống xử lý thêm tải.

**Mở rộng theo chiều dọc** có nghĩa là làm cho máy chủ đơn lẻ lớn hơn. Nhiều CPU hơn. Nhiều RAM hơn. Chúng ta đã làm điều này trong Chương 4 khi nâng cấp từ `t3.micro` lên `t3.large`. Nó giúp ích. Nhưng nó có giới hạn: bạn chỉ có thể đi xa như vậy, instance phải khởi động lại để thay đổi kích thước, và bạn vẫn có điểm lỗi duy nhất.

**Mở rộng theo chiều ngang** có nghĩa là thêm nhiều máy chủ hơn. Thay vì một máy chủ lớn, chạy năm máy chủ vừa. Khi lưu lượng giảm, chạy hai. Khi nó tăng vọt, chạy mười.

Mở rộng theo chiều ngang có những lợi thế mà chiều dọc không có:

- Không có điểm lỗi duy nhất. Nếu một máy chủ chết, các máy khác vẫn tiếp tục phục vụ.
- Không cần khởi động lại để thêm dung lượng.
- Chỉ trả tiền cho những gì bạn đang sử dụng — thêm máy chủ khi cần, bỏ khi không.
- Mở rộng tuyến tính: gấp đôi máy chủ, khoảng gấp đôi thông lượng.

Điểm bắt: nếu bạn có nhiều máy chủ, làm sao người dùng biết máy chủ nào để nói chuyện?

**Application Load Balancer: Một Cửa, Nhiều Phòng**

**Application Load Balancer** (ALB) là cửa trước của ứng dụng bạn.

Người dùng kết nối với load balancer. Load balancer phân phối các yêu cầu đến qua toàn bộ EC2 instance. Mỗi người dùng nhìn thấy một địa chỉ (URL của load balancer). Phía sau địa chỉ đó, các yêu cầu được phân tán qua bao nhiêu máy chủ đang chạy.

Hãy nghĩ như một nhà hàng lớn với bàn tiếp tân ở cửa. Thực khách đến và người tiếp tân hướng dẫn họ vào bàn còn trống. Người tiếp tân biết bàn nào đang bận và bàn nào còn trống. Thực khách không cần biết có bao nhiêu bàn — họ chỉ bước vào và người tiếp tân xử lý việc phân bổ.

ALB làm điều này với các yêu cầu web. Nó nhận mỗi yêu cầu HTTP đến và quyết định EC2 instance nào (được gọi là **target**) nên xử lý nó, dựa trên các yếu tố như:

- Round-robin (mỗi máy chủ thay nhau)
- Ít yêu cầu đang xử lý nhất
- Sức khỏe — chỉ các target khỏe mạnh nhận lưu lượng

**Kiểm tra sức khỏe** rất quan trọng. ALB thường xuyên gửi các yêu cầu thử nghiệm đến mỗi target. Nếu target không phản hồi đúng cách, ALB đánh dấu nó không khỏe và ngừng gửi lưu lượng đến nó.

**Auto Scaling: Nhà Hàng Mở Thêm Bàn**

ALB phân phối lưu lượng qua các máy chủ hiện có của bạn. Nhưng nó không thêm máy chủ khi bạn cần nhiều hơn.

**Auto Scaling** làm điều đó.

**Auto Scaling Group** (ASG) là một cấu hình cho AWS biết:

- Số lượng instance tối thiểu cần luôn chạy
- Số lượng instance tối đa được phép
- Các điều kiện để scale out (thêm instance) hoặc scale in (xóa chúng)

Các điều kiện mở rộng được gọi là **policy**. Loại phổ biến nhất:

**Target tracking**: "Giữ mức sử dụng CPU trung bình ở 70%." Khi CPU trung bình vượt 70%, AWS khởi chạy các instance mới. Khi nó giảm, các instance bị chấm dứt.

Điều này tự động. Không ai phải xem các số liệu. Không ai phải khởi chạy máy chủ thủ công.

Priya đã xem điều này xảy ra trực tiếp trong một buổi tối thứ Sáu lần đầu tiên. Số lượng máy chủ tăng từ 2 lên 5 trong mười lăm phút, rồi trở lại 2 sau khi hết giờ cao điểm.

"Điều đó," cô nói, "thực sự ấn tượng."

Tom đang xem biểu đồ chi phí thay thế. Hóa đơn tăng trong giờ cao điểm và giảm sau đó. "Chúng ta chỉ trả tiền cho những gì chúng ta đã sử dụng," anh nói, ấn tượng không kém.

**Cách ALB và ASG Hoạt Động Cùng Nhau**

Hai service được thiết kế để sử dụng cùng nhau.

Bạn đặt ALB ở phía trước. ALB trỏ đến một **target group** — tập hợp các instance nên nhận lưu lượng. Auto Scaling Group quản lý các instance đó: thêm chúng vào target group khi scale out, xóa khi scale in.

Dòng chảy:

1. Lưu lượng đến ALB
2. ALB phân phối yêu cầu đến các target khỏe mạnh
3. CPU/tải leo trên các target đó
4. ASG phát hiện tải tăng, khởi chạy instance mới
5. Instance mới vượt qua kiểm tra sức khỏe, đăng ký với ALB
6. ALB bắt đầu gửi lưu lượng đến chúng
7. Tải giảm, ASG chấm dứt các instance thêm
8. ALB ngừng gửi lưu lượng đến các instance bị chấm dứt

Điều này xảy ra mà không cần bất kỳ sự can thiệp của con người.

**Session Dính: Một Vấn Đề Tinh Tế**

Đây là thứ làm nhiều nhóm vấp ngã khi lần đầu triển khai load balancing.

Một số ứng dụng web lưu trữ dữ liệu session — trạng thái đăng nhập, nội dung giỏ hàng — trên chính máy chủ (trong bộ nhớ hoặc ổ đĩa cục bộ). Điều này hoạt động tốt với một máy chủ. Với nhiều máy chủ, nó bị hỏng.

Người dùng đăng nhập. Yêu cầu đến Máy chủ A. Máy chủ A lưu session. Yêu cầu tiếp theo đến Máy chủ B. Máy chủ B không có session. Người dùng có vẻ đã đăng xuất.

Có thể giải quyết theo hai cách:

**Session dính** (hoặc session affinity): Cấu hình ALB để luôn gửi yêu cầu từ cùng người dùng đến cùng máy chủ. Đây là sửa chữa ngắn hạn.

**Thiết kế ứng dụng không trạng thái**: Lưu trữ dữ liệu session bên ngoài — trong cơ sở dữ liệu hoặc bộ nhớ đệm như ElastiCache (Chương 10). Đây là cách tiếp cận đúng cho ứng dụng có thể mở rộng theo chiều ngang.

## Tóm Tắt

- **Mở rộng theo chiều ngang** (thêm nhiều máy chủ) được ưu tiên hơn mở rộng theo chiều dọc.
- **Application Load Balancer (ALB)** phân phối lưu lượng HTTP/HTTPS đến qua nhiều EC2 target. Nó thực hiện kiểm tra sức khỏe và chỉ định tuyến đến các instance khỏe mạnh.
- **Auto Scaling Group (ASG)** tự động điều chỉnh số lượng EC2 instance dựa trên các policy.
- ALB và ASG hoạt động cùng nhau: ASG quản lý fleet, ALB phân phối lưu lượng qua nó.
- Ứng dụng có trạng thái phải sử dụng session dính (sửa ngắn hạn) hoặc ngoại hóa trạng thái (thiết kế dài hạn đúng).

## Mẹo Thi

*SAA-C03 Domain 2 — Task 2.1 / Domain 3 — Task 3.2*

- **Kiểm tra sức khỏe ASG có thể đến từ EC2 hoặc ALB.** Kiểm tra sức khỏe EC2 chỉ phát hiện nếu instance đang chạy. Kiểm tra sức khỏe ALB phát hiện nếu ứng dụng đang phản hồi đúng cách.
- **Target tracking scaling là câu trả lời kỳ thi phổ biến nhất** cho các policy mở rộng.
- **Scale-out nhanh; scale-in chậm.** AWS chấm dứt instance dần dần trong quá trình scale-in.
- **Số lượng instance tối thiểu là sàn khả năng phục hồi của bạn.** Nếu bạn đặt minimum = 1 và instance đó bị lỗi, ứng dụng của bạn bị tắt trước khi ASG có thể phản ứng.

## Cảnh Sau Tín Dụng

Thứ Sáu đầu tiên sau khi triển khai Auto Scaling và ALB, nhóm theo dõi các số liệu cùng nhau.

7:15 tối: hai instance đang chạy. Tải bình thường.
7:45 tối: tải leo. Auto Scaling khởi chạy thêm hai instance.
8:00 tối: bốn instance xử lý đỉnh. Thời gian phản hồi ổn định.
9:30 tối: tải giảm. Auto Scaling chấm dứt hai instance.
9:45 tối: trở lại hai instance.

Trang web không bao giờ bị tắt. Không một lần.

Leo làm mới trang số liệu ba lần, như thể anh mong tìm một lỗi mà mình đã bỏ lỡ.

"Có kỳ lạ không khi tôi cảm thấy hơi thất vọng vì không có gì bị hỏng?" anh nói.

"Có," Priya nói.

Tom đang nhìn hóa đơn. Chi phí đã theo dõi lưu lượng gần như hoàn hảo. "Chúng ta đã trả đúng cho những gì chúng ta đã sử dụng," anh nói. "Không nhiều hơn. Không ít hơn."

Nghe thực sự ngạc nhiên.

Sáng hôm sau, Maya tìm thấy một vấn đề mới trong nhật ký lỗi. Không phải mất điện — tệ hơn.

"Cơ sở dữ liệu của chúng ta," cô nói, "đang trả về thời gian truy vấn trung bình tám giây."

Tám giây. Cho ứng dụng đặt hàng nhà hàng.

Chương tiếp theo: cơ sở dữ liệu không yêu cầu DBA — chỉ cần thẻ tín dụng.
