# Chương 4: Một Máy Tính Trong Tòa Nhà Của Người Khác

Ứng dụng Nimbus đang chạy trên máy tính xách tay của Tom.

Điều đó ổn để giới thiệu demo cho các nhà đầu tư. Nhưng nó không ổn khi Maya nhấn "ra mắt" và 200 nhà hàng đăng ký trong tuần đầu tiên. Máy tính xách tay của Tom giờ đang xử lý các đơn hàng thực, menu thực và khách hàng thực — nằm dưới bàn của Tom, chạy qua Wi-Fi văn phòng, cắm vào một ổ cắm điện cũng cấp năng lượng cho máy sưởi và máy pha cà phê.

"Chúng ta cần một máy chủ," Maya nói. "Một cái thực sự. Chạy ở đâu đó không phải dưới bàn của bạn."

Tom nhìn máy tính xách tay. Quạt nghe rõ từ khắp phòng.

Đó là lúc họ bắt đầu xem xét thực sự thuê máy tính có nghĩa là gì.

**Sự Trừu Tượng Mà Không Ai Giải Thích**

Khi mọi người nói ứng dụng của họ "chạy trên đám mây," họ thường có nghĩa là nó chạy trên một máy ảo — một máy tính không tồn tại về mặt vật lý như phần cứng chuyên dụng, nhưng hoạt động theo mọi cách như thể nó có.

Đây là cơ chế.

Một máy chủ vật lý trong trung tâm dữ liệu AWS có nhiều tài nguyên: lõi CPU, bộ nhớ, ổ đĩa và băng thông mạng. AWS lấy máy chủ vật lý đó và chia nhỏ nó bằng phần mềm gọi là **hypervisor**. Hypervisor tạo ra nhiều máy ảo, mỗi cái có vẻ như có CPU, bộ nhớ và ổ đĩa riêng — nhưng thực ra chia sẻ phần cứng vật lý bên dưới.

Mỗi máy ảo đó là điều mà AWS gọi là **EC2 instance**.

EC2 viết tắt của Elastic Compute Cloud. Phần "elastic" quan trọng, và chúng ta sẽ đến đó. Hiện tại: một EC2 instance là một máy tính bạn thuê theo giờ. Nó có hệ điều hành, kết nối mạng và sức mạnh tính toán. Nó chạy ứng dụng của bạn giống như một máy chủ vật lý sẽ làm.

Tương tự: thuê căn hộ trong một tòa nhà lớn so với mua nhà.

Chủ tòa nhà (AWS) duy trì cấu trúc vật lý, hệ thống ống nước, điện, bảo mật. Bạn có một đơn vị. Bạn trang bị nó theo cách bạn muốn. Bạn trả hàng tháng (hoặc hàng giờ). Khi bạn cần nhiều không gian hơn, bạn chuyển sang đơn vị lớn hơn. Khi bạn chuyển đi, bạn ngừng trả tiền.

**Chọn Instance Của Bạn: Kích Thước Quan Trọng**

Không phải tất cả EC2 instance đều giống nhau. AWS cung cấp hàng trăm loại instance, được tổ chức thành các họ dựa trên những gì chúng được tối ưu hóa cho.

**Mục đích chung** (ví dụ: `t3`, `m6i`): CPU và bộ nhớ cân bằng. Lựa chọn mặc định tốt cho hầu hết các ứng dụng web.

**Tối ưu hóa tính toán** (ví dụ: `c7g`): Nhiều CPU hơn so với bộ nhớ. Tốt cho mã hóa video, mô hình khoa học, xử lý hàng loạt.

**Tối ưu hóa bộ nhớ** (ví dụ: `r7i`): Nhiều bộ nhớ hơn so với CPU. Tốt cho cơ sở dữ liệu, bộ nhớ đệm, phân tích trong bộ nhớ.

**Tối ưu hóa lưu trữ** (ví dụ: `i3`): Lưu trữ cục bộ tốc độ cao. Tốt cho các công việc tính toán dữ liệu chuyên sâu cần I/O đĩa rất nhanh.

**Tính toán tăng tốc** (ví dụ: `p4`): GPU gắn vào. Tốt cho huấn luyện học máy và kết xuất đồ họa.

Mỗi họ có các kích thước. `t3.micro` có 2 CPU ảo và 1 GB bộ nhớ. `t3.xlarge` có 4 CPU ảo và 16 GB. Bạn chọn kích thước phù hợp cho công việc.

Leo đã chọn `t3.micro`.

"Một `t3.micro` có thể xử lý bao nhiêu người dùng?" Tom hỏi.

"Tùy thuộc vào ứng dụng," Leo nói. "Nhưng có lẽ không phải một trăm người dùng đồng thời đang chạy tải lên hình ảnh và truy vấn cơ sở dữ liệu."

Tom viết "t3.micro" lên bảng trắng và vẽ khuôn mặt buồn bên cạnh nó.

**AMI: Trạng Thái Khởi Đầu Của Máy**

Trước khi bạn khởi động EC2 instance, bạn chọn hệ điều hành và cấu hình ban đầu của nó. Trong AWS, đây được gọi là **Amazon Machine Image** (AMI).

AMI là một mẫu. Nó xác định:

- Hệ điều hành (Amazon Linux, Ubuntu, Windows Server, v.v.)
- Phần mềm được cài đặt sẵn
- Trạng thái đĩa ban đầu

Khi bạn khởi động một instance từ AMI, AWS tạo một bản sao mới của mẫu đó chỉ cho bạn. Bạn cũng có thể tạo AMI của riêng mình — nếu bạn cấu hình một máy chủ chính xác theo cách bạn muốn, bạn có thể "lưu" trạng thái đó dưới dạng AMI tùy chỉnh và sử dụng nó để khởi động các máy chủ giống hệt nhau nhanh chóng. Đây là cách bạn triển khai các môi trường nhất quán ở quy mô lớn.

Hãy nghĩ về AMI như một công thức nấu ăn. Công thức mô tả món ăn. Mỗi lần bạn làm theo công thức, bạn nhận được cùng một món ăn. Nếu bạn muốn thay đổi món ăn vĩnh viễn, bạn cập nhật công thức.

**Cặp Khóa: Cách Đúng Để Truy Cập Máy Chủ**

Còn nhớ thảm họa "Admin123" từ chương trước không?

Cách đúng để đăng nhập vào EC2 instance là bằng **cặp khóa**.

Cặp khóa là một cặp mật mã: khóa công khai (được AWS lưu trữ trên máy chủ) và khóa riêng tư (một tệp bạn tải xuống và giữ bí mật). Để đăng nhập, bạn dùng SSH — một giao thức bảo mật — với khóa riêng tư của mình. Không có mật khẩu. Nếu bạn mất khóa riêng tư, bạn mất quyền truy cập. Không có "quên mật khẩu" cho SSH.

Điều này quan trọng vì cặp khóa là:

- Duy nhất cho bạn
- Không thể đoán về mặt mật mã
- Không được lưu trữ bởi AWS (bạn giữ khóa riêng tư)
- Dễ thu hồi (xóa khóa khỏi máy chủ, tạo cặp mới)

Priya đã thiết lập quyền truy cập dựa trên khóa trên máy chủ Nimbus. Máy chủ Admin123 đã bị ngừng hoạt động. Không ai buồn về điều đó.

**Vòng Đời Instance: Không Phải Mãi Mãi**

Đây là thứ nhiều người mới bắt đầu bỏ lỡ.

EC2 instance không phải là vĩnh viễn theo mặc định. Khi bạn dừng một instance, tài nguyên tính toán được giải phóng. Khi bạn khởi động lại, nó có thể chạy trên phần cứng vật lý khác. Bất kỳ dữ liệu nào được lưu trữ *trên chính instance* (trên ổ đĩa gốc của nó) tồn tại qua chu kỳ dừng/khởi động — nhưng địa chỉ IP công khai thay đổi.

Khi bạn *chấm dứt* một instance, nó biến mất. Trừ khi bạn có lưu trữ riêng được gắn vào (chúng ta sẽ đề cập trong Chương 6), bất kỳ dữ liệu nào trên instance sẽ biến mất.

"Tính phù du" này thực sự là một tính năng, không phải lỗi. Nó có nghĩa là bạn có thể khởi động các máy chủ, sử dụng chúng và vứt bỏ chúng. Nó cho phép mở rộng theo chiều ngang. Nhưng nó cũng có nghĩa là bạn không bao giờ nên lưu trữ dữ liệu quan trọng *trên* chính EC2 instance.

Vậy dữ liệu sống ở đâu?

Trong lưu trữ riêng biệt. Chúng ta sẽ đến đó trong hai chương tiếp theo.

**"Elastic" Nghĩa Là Gì**

Chúng ta đã nói EC2 viết tắt của Elastic Compute Cloud. Elastic ở chỗ nào?

Hai thứ:

**Tính đàn hồi theo chiều dọc**: Bạn có thể thay đổi kích thước của một instance. Dừng instance, thay đổi từ `t3.micro` sang `t3.xlarge`, khởi động lại. Nhiều CPU và bộ nhớ hơn, cùng ứng dụng, cùng thiết lập.

**Tính đàn hồi theo chiều ngang**: Bạn có thể thêm nhiều instance hơn. Thay vì một máy chủ lớn, chạy mười máy chủ vừa phía sau load balancer. Khi lưu lượng giảm, hãy xóa các instance và ngừng trả tiền.

Cả hai cách tiếp cận đều giải quyết vấn đề "một máy chủ, quá nhiều lưu lượng". Chúng có sự đánh đổi khác nhau, mà chúng ta khám phá trong Chương 7 khi chúng ta thêm Auto Scaling vào câu chuyện.

Hiểu biết chính: với EC2, sức mạnh tính toán là thứ bạn *điều chỉnh* chứ không phải thứ bạn *mua*. Cần nhiều hơn? Tăng lên. Cần ít hơn? Giảm xuống. Trả tiền tương ứng.

## Điểm Mạnh Và Hạn Chế

**Tại sao EC2 mạnh**:

- Kiểm soát hoàn toàn. Bạn chọn hệ điều hành, phần mềm, cấu hình. Đó là máy tính của bạn.
- Kích thước linh hoạt. Hàng trăm loại instance cho mọi trường hợp sử dụng.
- Không có phần cứng để quản lý. AWS xử lý lớp vật lý.
- Thanh toán theo giây (cho hầu hết các loại instance). Bạn dừng instance, bạn ngừng trả tiền.
- Hoạt động với mọi thứ. EC2 là nền tảng mà hầu hết các AWS service khác được xây dựng trên đó.

**Nơi nó trở nên phức tạp**:

- Bạn chịu trách nhiệm vá và cập nhật hệ điều hành.
- Quản lý EC2 ở quy mô lớn có nghĩa là quản lý trạng thái instance, AMI, bản vá bảo mật và vòng đời.
- EC2 không phải là câu trả lời đúng cho mọi thứ.
- Các instance chưa sử dụng vẫn tốn tiền.

## Tóm Tắt

- Một **EC2 instance** là một máy ảo bạn thuê trong AWS. Nó có hệ điều hành, quyền truy cập mạng và tài nguyên tính toán.
- Các loại instance được tổ chức theo trường hợp sử dụng: mục đích chung, tối ưu hóa tính toán, tối ưu hóa bộ nhớ, tối ưu hóa lưu trữ, tính toán tăng tốc.
- **AMI** (Amazon Machine Image) là mẫu cho hệ điều hành và cấu hình ban đầu của instance. AMI tùy chỉnh cho phép triển khai nhất quán, có thể lặp lại.
- **Cặp khóa** là cách bảo mật để truy cập EC2 instance. Không có mật khẩu.
- EC2 instance không phải là vĩnh viễn theo mặc định. Các instance bị chấm dứt mất dữ liệu của chúng.
- "Elastic" có nghĩa là bạn có thể mở rộng tính toán lên và xuống — cả theo chiều dọc (instance lớn hơn) và chiều ngang (nhiều instance hơn).

## Mẹo Thi

*SAA-C03 Domain 3 — Task 3.2 (giải pháp tính toán hiệu suất cao)*

- **Trách nhiệm chung cho EC2**: Bạn chịu trách nhiệm vá hệ điều hành. AWS duy trì phần cứng vật lý và hypervisor.
- **Họ instance quan trọng cho câu hỏi tình huống.** Nếu tình huống đề cập yêu cầu bộ nhớ cao, câu trả lời có thể liên quan đến instance tối ưu hóa bộ nhớ.
- **Dừng ≠ Chấm dứt.** Dừng một instance bảo tồn nó. Chấm dứt xóa nó.
- **IP công khai thay đổi khi khởi động lại.** Nếu ứng dụng của bạn cần địa chỉ IP ổn định, hãy dùng **Elastic IP**.

## Cảnh Sau Tín Dụng

Leo dành buổi chiều thay đổi kích thước máy chủ. Anh chuyển từ `t3.micro` sang `t3.large`. CPU giảm xuống 30%. Các trang tải trong dưới một giây.

Tom xem hóa đơn AWS cập nhật theo thời gian thực. Instance mới tốn gấp bốn lần một giờ. Anh ghi chú.

Maya đang nhìn vào thứ gì khác trên màn hình.

"Leo," cô nói. "Trong khi bạn đang thay đổi kích thước instance, website đã bị tắt trong mười hai phút."

Leo ngước nhìn.

"Chúng ta có một hàng đợi hai trăm đơn hàng chưa được thực hiện."

Anh nhìn màn hình. Rồi nhìn trần nhà. Rồi nhìn lại màn hình.

"Chúng ta cần thứ gì đó cho hình ảnh của chúng ta," anh nói, đổi chủ đề một chút. "Hiện tại, ảnh menu được tải lên được lưu trực tiếp trên máy chủ. Nếu chúng ta thay đổi kích thước hoặc khởi động lại instance, chúng ta có mất chúng không?"

Priya đã biết câu trả lời.

Chương tiếp theo: nơi file sống khi không có ổ cứng để chỉ vào.
