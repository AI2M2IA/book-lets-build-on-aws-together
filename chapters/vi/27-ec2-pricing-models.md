# Chương 27: Trả Tiền Cho Những Gì Bạn Cần

Tom đã xem xét hóa đơn AWS mỗi tháng kể từ khi Nimbus bắt đầu. Trong năm đầu tiên, anh hiểu khoảng 60% những gì anh thấy. Đến bây giờ, anh hiểu hầu hết mọi thứ — trừ phần EC2.

Phần EC2 là hỗn hợp các "instance On-Demand" với nhiều loại instance khác nhau, tất cả được tính giá theo giờ, tất cả cộng lại thành $2,340/tháng.

"Tôi biết chúng ta cần các instance này," Tom nói. "Nhưng tôi không hiểu tại sao chúng ta đang trả giá theo hệ số phòng cho tất cả chúng."

"Giá theo hệ số phòng?" Leo hỏi.

"Giá On-Demand," Tom nói. "Nó giống như đặt phòng khách sạn vào buổi sáng ngày bạn cần. Linh hoạt tối đa. Giá cao nhất."

"Vậy lựa chọn thay thế là gì?"

Tom mở trang giá EC2 lên.

"Có bốn mô hình giá," anh nói. "Và chúng ta chỉ đang sử dụng một."

**Phép So Sánh Khách Sạn**

Giá EC2 khớp đáng ngạc nhiên với các chiến lược đặt phòng khách sạn:

**On-Demand**: Bước đến quầy lễ tân mà không có đặt trước. Bạn trả giá rack đầy đủ, nhưng bạn có thể trả phòng bất cứ lúc nào bạn muốn. Hoàn hảo cho những lần lưu trú không thể đoán trước.

**Reserved Instances/Savings Plans**: Đặt phòng cả năm trước. Bạn được giảm giá đáng kể — giảm 30-72% — để đổi lấy cam kết sử dụng nó.

**Spot Instances**: Đấu giá cho các phòng không bán được với mức giá mà khách sạn sẵn sàng chấp nhận tại thời điểm đó. Giảm đến 90%. Nhưng khách sạn có thể yêu cầu bạn rời đi với thông báo hai phút nếu họ cần phòng cho khách trả giá đầy đủ.

**Dedicated Hosts**: Thuê toàn bộ tầng của khách sạn dành riêng cho bạn. Không chia sẻ với khách khác. Đắt hơn đáng kể. Cần thiết khi giấy phép phần mềm hoặc quy tắc tuân thủ cấm chia sẻ máy chủ vật lý.

Mỗi mô hình có trường hợp sử dụng. Sai lầm Nimbus đang mắc phải: sử dụng On-Demand cho mọi thứ, kể cả các khối lượng công việc chạy 24/7 và hoàn toàn có thể dự đoán được.

**Instance On-Demand: Linh Hoạt Tối Đa, Chi Phí Tối Đa**

**Khi nào sử dụng**:

- Khối lượng công việc không thể đoán trước (đợt tăng lưu lượng bạn không thể dự báo)
- Phát triển và kiểm thử (khởi động và dừng thường xuyên)
- Khối lượng công việc ngắn hạn (chạy thử nghiệm trong một tuần)
- Triển khai đầu tiên (trước khi bạn hiểu các mẫu sử dụng của mình)

**Khi nào không sử dụng**:

- Các khối lượng công việc production trạng thái ổn định mà bạn biết sẽ chạy hơn một năm
- Bất cứ thứ gì có tải cơ sở có thể dự đoán

Tom xác định các instance On-Demand của Nimbus:

- Máy chủ web API: 4 instance EC2, chạy 24/7 trong 18 tháng. *Tải cơ sở có thể dự đoán.*
- Database proxy (RDS Proxy): Luôn chạy. *Tải cơ sở có thể dự đoán.*
- Máy chủ VPN: Luôn chạy. *Tải cơ sở có thể dự đoán.*
- Máy chủ API bổ sung cho các đợt tăng lưu lượng: Không thể đoán trước. *On-Demand là đúng ở đây.*

**Reserved Instances: Cam Kết Cả Năm**

**Reserved Instances (RIs)** là cam kết thanh toán — bạn đồng ý sử dụng một loại instance cụ thể trong một region cụ thể trong 1 hoặc 3 năm. Đổi lại, AWS tính mức giá theo giờ thấp hơn.

**Bậc giảm giá**:

- 1 năm, Không trả trước: ~30-40% giảm so với On-Demand
- 1 năm, Trả một phần trước: ~35-45% giảm (trả một phần bây giờ, ít hơn mỗi giờ)
- 1 năm, Trả toàn bộ trước: ~40-50% giảm (trả toàn bộ năm ngay bây giờ)
- 3 năm, Trả toàn bộ trước: ~55-72% giảm (giảm tối đa, cam kết tối đa)

**RI Tiêu Chuẩn vs Có Thể Chuyển Đổi**:

- **Tiêu chuẩn**: Bị khóa với loại instance và region cụ thể. Có thể bán trên Thị trường Reserved Instance nếu bạn không còn cần nó.
- **Có thể chuyển đổi**: Có thể thay đổi loại instance, hệ điều hành và tenancy trong thời gian cam kết. Giảm giá ít hơn Tiêu chuẩn (~50% tối đa so với 72%).

Tom tính toán cho 4 máy chủ API (r6g.large, $0.252/giờ On-Demand):

- Chi phí On-Demand hằng năm: $0.252 × 24 × 365 × 4 = $8,820
- RI Trả toàn bộ trước 1 năm (1 instance): ~$1,600 trả trước
- 4 instance: ~$6,400 trả trước = **Tiết kiệm $2,420 trong năm đầu tiên**

"Chúng ta có thể tiết kiệm $2,420 trong năm đầu tiên chỉ bằng cách cam kết," Tom nói.

"Đó là một cam kết," Maya nói. "Nếu chúng ta cần thay đổi loại instance thì sao?"

"Chúng ta dùng Convertible RI nếu chúng ta nghĩ mình có thể."

"Nếu AWS phát hành loại instance tốt hơn thì sao?"

"Chúng ta kiểm tra khi RI hết hạn. Nếu loại mới tốt hơn, chúng ta mua RI mới."

**Savings Plans: Cam Kết Linh Hoạt**

**Savings Plans** là một lựa chọn thay thế mới hơn, linh hoạt hơn cho Reserved Instances. Thay vì cam kết với một loại instance cụ thể, bạn cam kết với một *mức chi tiêu theo giờ* cụ thể (tính bằng đô la).

**Compute Savings Plans**: Áp dụng cho bất kỳ instance EC2 nào, bất kể loại, kích thước, region, hoặc hệ điều hành. Linh hoạt nhất. Giảm đến 66%.

**EC2 Instance Savings Plans**: Áp dụng cho một họ instance cụ thể trong một region (ví dụ: "instance c6g ở us-east-1"). Hạn chế hơn Compute, nhưng giảm đến 72% (giống mức tối đa RI).

**SageMaker Savings Plans**: Dành riêng cho đào tạo ML và suy luận SageMaker.

Đối với Nimbus: Compute Savings Plans cho các máy chủ API của họ. Họ cam kết $1.50/giờ chi tiêu EC2. Bất kỳ loại instance nào, bất kỳ kích thước nào. Khi họ mở rộng đội hoặc thay đổi loại instance, Savings Plan vẫn áp dụng.

"Điều này tốt hơn Reserved Instances cho chúng ta," Leo nói. "Chúng ta vẫn đang thử nghiệm với các loại instance. Compute Savings Plan cho chúng ta giảm giá mà không khóa chúng ta với r6g cụ thể."

**Spot Instances: Giảm 90%**

**Spot Instances** sử dụng năng lực EC2 dự phòng của AWS. Khi AWS có máy chủ chưa sử dụng, bạn có thể thuê chúng với mức 60-90% dưới giá On-Demand. Khi AWS cần lấy lại năng lực (cho khách hàng On-Demand hoặc Reserved), họ sẽ cảnh báo trước 2 phút và kết thúc instance của bạn.

Rủi ro gián đoạn là đặc điểm xác định. Spot Instances chỉ phù hợp cho:

- **Khối lượng công việc chịu lỗi**: Nếu một instance kết thúc giữa chừng, tác vụ có thể khởi động lại mà không làm hỏng bất cứ thứ gì
- **Xử lý stateless**: Thay đổi kích thước ảnh, mã hóa video, batch analytics, đào tạo ML
- **Công việc batch ngắn hạn**: Cảnh báo 2 phút đủ để lưu trạng thái và tạo checkpoint
- **Đội hỗn hợp Auto Scaling**: Sử dụng Spot cho phần lớn ASG của bạn với On-Demand làm tải cơ sở

Đối với Nimbus: Spot Instances phù hợp cho các công việc batch analytics chạy mỗi đêm (xử lý dữ liệu đơn hàng trong ngày thành các báo cáo tổng hợp). Nếu Spot Instance bị kết thúc giữa chừng công việc, công việc thất bại, nhưng nó khởi động lại từ đầu trên một instance mới. Dữ liệu trong S3 an toàn.

"Sử dụng Spot cho công việc nightly đã giảm chi phí từ $12/đêm xuống còn $2/đêm," Leo báo cáo.

**Dedicated Hosts: Lựa Chọn Tuân Thủ**

Một số giấy phép phần mềm (Oracle, Windows Server trong một số cấu hình) được tính giá theo socket vật lý hoặc core. Khi bạn chạy phần mềm này trên máy chủ chia sẻ (mặc định cho EC2), bạn có thể đang trả cho năng lực mà bạn không sử dụng.

**Dedicated Hosts** cho bạn quyền truy cập vào một máy chủ vật lý hoàn toàn cho mục đích sử dụng của bạn. Bạn có thể mang giấy phép theo socket hiện có. Không có instance của bất kỳ khách hàng AWS nào khác chạy trên cùng phần cứng.

Dedicated Hosts đắt hơn đáng kể so với EC2 tiêu chuẩn. Chúng là công cụ tuân thủ và cấp phép, không phải công cụ tối ưu hóa chi phí.

Nimbus không có yêu cầu cấp phép cần Dedicated Hosts. Hầu hết các ứng dụng cloud-native đều không có.

**Xây Dựng Đội Hỗn Hợp**

Cách tiếp cận trưởng thành: sử dụng nhiều mô hình giá cùng nhau.

Đối với đội API của Nimbus:

- **Tải cơ sở (4 instance, luôn chạy)**: Được bao phủ bởi cam kết Savings Plan
- **Giờ cao điểm có thể dự đoán (2 instance bổ sung trong giờ làm việc)**: Được bao phủ bởi Savings Plan nếu cam kết bao gồm chúng, nếu không thì On-Demand
- **Tràn đợt tăng lưu lượng**: Spot Instances (chấp nhận được vì các máy chủ API là stateless — các yêu cầu phân phối lại nếu một instance kết thúc)

Kết quả: một đội tối ưu hóa chi phí ở mọi lớp — giá cam kết cho phần có thể dự đoán, On-Demand cho tăng trưởng không thể đoán trước, Spot cho năng lực đột biến.

## Điểm Mạnh và Hạn Chế

**On-Demand**: Không cam kết. Giá đầy đủ. Dùng cho các khối lượng công việc không thể đoán trước hoặc ngắn hạn.

**Reserved Instances**: Giảm đến 72%. Bị khóa với loại/region/hệ điều hành instance cụ thể. Bán năng lực không sử dụng trên Thị trường RI.

**Savings Plans**: Giảm đến 66-72%. Linh hoạt hơn RI (Compute Savings Plans áp dụng cho bất kỳ loại instance nào). Tự động áp dụng cho việc sử dụng phù hợp.

**Spot Instances**: Giảm đến 90%. Rủi ro gián đoạn 2 phút. Chỉ cho các khối lượng công việc chịu lỗi, stateless, có thể gián đoạn.

**Dedicated Hosts**: Máy chủ vật lý đầy đủ. Đắt nhất. Cần thiết cho một số kịch bản cấp phép hoặc tuân thủ nhất định.

## Tóm Tắt

- Giá EC2 có bốn mô hình: **On-Demand** (giá đầy đủ, không cam kết), **Reserved Instances/Savings Plans** (chi tiêu cam kết để được giảm giá đáng kể), **Spot** (năng lực dự phòng giảm 60-90%, có thể gián đoạn), **Dedicated Hosts** (độc quyền máy chủ vật lý).
- **Savings Plans** nói chung được ưu tiên hơn Reserved Instances vì tính linh hoạt.
- **Spot Instances** yêu cầu các khối lượng công việc chịu lỗi, stateless — chỉ cho công việc batch, đào tạo ML và xử lý có thể gián đoạn.
- Chiến lược tối ưu là **đội hỗn hợp**: Savings Plans cho tải cơ sở, On-Demand cho tăng trưởng không thể đoán trước, Spot cho công việc batch có thể gián đoạn.
- Xem xét các mô hình giá khi các khối lượng công việc đã chạy ổn định trong 3+ tháng — đó là lúc On-Demand bắt đầu là lãng phí.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Domain 4, Task 4.2)*

- **Savings Plans vs Reserved Instances**: Savings Plans linh hoạt hơn (áp dụng cho bất kỳ instance EC2 nào cho Compute Savings Plans). Reserved Instances khóa với một loại instance cụ thể. Kịch bản kỳ thi: "cần linh hoạt tối đa trong khi vẫn được giảm giá" → Savings Plans. "Biết loại instance chính xác trong 3 năm" → Standard RI để giảm giá tối đa.
- **Tín hiệu Spot**: "nhạy cảm về chi phí," "chịu lỗi," "xử lý batch," "có thể xử lý gián đoạn," "khối lượng công việc stateless," "đào tạo ML" → Spot.
- **Xử lý gián đoạn Spot**: Spot instance nhận cảnh báo 2 phút trước khi kết thúc. Ứng dụng của bạn phải xử lý điều này một cách linh hoạt (lưu trạng thái, thoát kết nối, thoát sạch).
- **On-Demand vs Spot cho máy chủ web**: Máy chủ web phục vụ lưu lượng người dùng trực tiếp KHÔNG nên sử dụng Spot (gián đoạn gây ra yêu cầu thất bại). Sử dụng On-Demand hoặc Savings Plans cho tầng web.
- **EC2 Savings Plans vs Compute Savings Plans**: EC2 Savings Plans áp dụng cho một họ instance và region cụ thể (giảm giá cao hơn). Compute Savings Plans áp dụng cho bất kỳ instance EC2, Lambda và Fargate nào (giảm giá tối đa thấp hơn, linh hoạt hơn).
- **Thị trường RI**: Các Reserved Instance Tiêu Chuẩn chưa sử dụng có thể được bán cho các khách hàng AWS khác. Convertible RI không thể được bán.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích khi nào Spot Instances phù hợp và khi nào không. Đặc điểm nào làm cho khối lượng công việc phù hợp với Spot?

*(Gợi ý: Hãy nghĩ về điều gì xảy ra khi instance bị kết thúc với thông báo 2 phút. Khối lượng công việc nào phục hồi tốt? Khối lượng công việc nào không?)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Một công ty truyền thông chạy pipeline mã hóa video chuyển đổi video đã tải lên thành nhiều định dạng. Các công việc mã hóa chạy liên tục bất cứ khi nào video được tải lên (hoạt động 24/7, khối lượng biến đổi). Mỗi công việc mất 5-30 phút. Nếu công việc mã hóa bị gián đoạn, công việc có thể được khởi động lại từ đầu mà không mất dữ liệu. Công ty muốn giảm thiểu chi phí.

Mô hình giá EC2 nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Instance On-Demand trong Auto Scaling Group  
B) Reserved Instances (1 năm, Trả toàn bộ trước)  
C) Spot Instances với Spot Fleet để tự động đa dạng hóa instance  
D) Dedicated Hosts với giấy phép phần mềm media hiện có của công ty

**Gợi ý 1**: "Có thể khởi động lại từ đầu mà không mất dữ liệu" — đây là cụm từ chính cho phép một mô hình giá cụ thể.

**Gợi ý 2**: "Giảm thiểu chi phí" với khối lượng công việc có thể gián đoạn chỉ đến lựa chọn giảm giá tối đa.

**Gợi ý 3**: Spot Fleet yêu cầu instance từ nhiều loại instance và AZ, giảm khả năng gián đoạn.

**Đáp án**: C

**Giải thích**: Các công việc mã hóa chịu lỗi — chúng có thể được khởi động lại nếu bị gián đoạn. Điều này làm cho chúng lý tưởng cho Spot Instances, cung cấp giảm 60-90% so với On-Demand. Spot Fleet đa dạng hóa trên các loại instance và Availability Zones, giảm khả năng gián đoạn hàng loạt.

**Tại sao không phải A?** On-Demand là lựa chọn chi phí cao nhất. Đối với khối lượng công việc chịu lỗi chạy liên tục, điều này là lãng phí.

**Tại sao không phải B?** Reserved Instances cung cấp giảm giá 50-72% nhưng không cung cấp tiềm năng giảm 90% của Spot cho các khối lượng công việc chịu lỗi. Ngoài ra, RI dành cho các khối lượng công việc ổn định, có thể dự đoán — Spot dành riêng cho xử lý batch có thể gián đoạn.

**Tại sao không phải D?** Dedicated Hosts dành cho tuân thủ cấp phép, không phải tối ưu hóa chi phí. Chúng là lựa chọn đắt nhất.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Task 4.2*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Cơ sở hạ tầng của Nimbus có các khối lượng công việc sau:

1. Máy chủ API: 6 instance, chạy 24/7, ổn định trong 2 năm, sử dụng r6g.large
2. Công việc batch analytics nightly: 4 instance, chạy 3 giờ sáng-6 giờ sáng mỗi đêm, luôn cùng loại instance
3. Môi trường kiểm thử: 2 instance, được dùng bởi kỹ sư 9 giờ sáng-6 giờ chiều các ngày trong tuần
4. Tràn đợt tăng lưu lượng: 0-8 instance, khởi động trong giờ cao điểm, hoàn toàn không thể đoán trước

Thiết kế chiến lược giá tối ưu cho mỗi loại khối lượng công việc. Mức cam kết Savings Plan nào sẽ bao phủ khối lượng công việc 1 và 2? Đối với khối lượng công việc 3, có chiến lược thông minh hơn On-Demand không?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành chiến lược giá EC2.)*

## Cảnh Sau Tín Dụng

Tom gửi đơn mua Savings Plan.

Cam kết $5.76/giờ. Thời hạn ba năm. Compute Savings Plans để linh hoạt.

Ước tính tiết kiệm: $42,500 trong ba năm.

Maya đọc con số. "Bốn mươi hai nghìn đô la."

"So với On-Demand cho cùng các instance, trong ba năm."

"Chi phí để làm điều này là bao nhiêu?"

"Một buổi chiều phân tích," Tom nói. "Và quyết định cam kết."

"Ba năm là thời gian dài," Leo nói. "Nếu chúng ta thay đổi loại instance thì sao?"

"Compute Savings Plans áp dụng cho bất kỳ loại instance EC2 nào. Và trong ba năm, chúng ta đủ lớn để cuộc trò chuyện này trông khác đi dù sao."

Leo suy nghĩ về điều đó.

"Bạn đã biết về Savings Plans bao lâu rồi?" anh hỏi.

"Từ khi chúng ta bắt đầu," Tom nói. "Tôi đang chờ cho đến khi khối lượng công việc đủ ổn định để cam kết."

"Mười tám tháng trả On-Demand trong khi chờ đợi."

"Đúng vậy." Tom đóng console lại. "Đôi khi thứ tốn kém nhất bạn làm là chờ đợi để tiết kiệm tiền."

Trong chương tiếp theo: cùng kỷ luật được áp dụng cho chi phí lưu trữ, với một vài bất ngờ về những gì đang thúc đẩy hóa đơn.
