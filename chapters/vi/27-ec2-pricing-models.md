# Chương 27: Trả Tiền Cho Những Gì Bạn Cần

Tom pha cà phê trước khi mở tab thanh toán. Anh luôn làm vậy — một số báo cáo nên được tiếp cận khi còn ấm. Anh ngồi xuống chiếc ghế bên cửa sổ, tay cầm cốc, sáng thứ Bảy vẫn còn yên tĩnh bên ngoài. Không có thông báo, không có standup. Chỉ có bảng tính và những con số.

Anh mở tab.

**Tóm tắt nhanh: Từ Phát Hiện Của Athena Đến Hóa Đơn**

Phân tích Athena của chương trước đã làm được một điều bất ngờ: bằng cách truy vấn trực tiếp các báo cáo chi phí và sử dụng từ S3, cuối cùng Tom có thể thấy không chỉ tổng hóa đơn AWS, mà còn cả phân tích chi tiết từng dịch vụ thực sự tốn bao nhiêu, tuần này qua tuần khác, trong sáu tháng. Bức tranh hiện ra đủ rõ ràng để khiến người ta lo lắng. EC2 là khoản mục lớn nhất, và mẫu hình thì không thể nhầm lẫn — nhóm đã trả giá khách vãng lai cho một khách sạn mà họ ở toàn thời gian. Nhận thức đó đã đưa Tom đến trang giá EC2 vào một sáng thứ Bảy với một cốc cà phê mới pha và quyết tâm hiểu mọi lựa chọn trước khi hóa đơn hằng tháng tiếp theo đến.

Tom đã xem xét hóa đơn AWS mỗi tháng kể từ khi Nimbus bắt đầu. Trong năm đầu tiên, anh hiểu khoảng 60% những gì anh thấy. Đến bây giờ, anh hiểu hầu hết mọi thứ — trừ việc tại sao phần EC2 luôn khiến anh có cảm giác họ đang trả quá nhiều. Phần EC2 là hỗn hợp các "instance On-Demand" với nhiều loại instance khác nhau, tất cả được tính giá theo giờ, tất cả cộng lại thành $2,340/tháng.

Trước khi gọi cho ai, anh dành một giờ tự mình xem qua danh sách instance — không phải để kết luận điều gì, mà để hình thành những giả định anh có thể kiểm chứng.

Anh thấy bốn instance r6g.large được gắn nhãn "api-prod." Anh thấy hai instance c6g.medium chạy các bộ xử lý công việc nền. Anh thấy một t3.medium được gắn nhãn "vpn-server" đã chạy kể từ tháng thứ ba từ khi công ty tồn tại. Anh thấy một cặp instance được gắn nhãn "analytics-batch" xuất hiện lúc 3 giờ sáng và biến mất trước 7 giờ sáng mỗi đêm.

Anh viết xuống một cột các giả định:

- Máy chủ API: có thể dự đoán, luôn chạy.
- Bộ xử lý nền: có lẽ có thể dự đoán.
- Máy chủ VPN: luôn chạy, không bao giờ thay đổi.
- Batch analytics: có thể đủ điều kiện cho Spot?

Rồi anh viết bên lề: *xác minh từng cái trước khi quyết định bất cứ điều gì.*

Kỷ luật đó — tách biệt "điều tôi giả định" với "điều tôi biết" — chính là thứ làm cho các đợt xem xét chi phí của Tom hữu ích. Anh gọi những người còn lại.

"Chúng ta có thể cứ tiếp tục trả giá khách vãng lai," Tom nói, khi những người khác tham gia cuộc gọi. "Nhưng chúng ta sẽ không làm vậy."

"Giá khách vãng lai?" Leo hỏi.

"Giá On-Demand," Tom nói. "Nó giống như đặt phòng khách sạn vào buổi sáng ngày bạn cần. Linh hoạt tối đa. Giá cao nhất."

"Vậy lựa chọn thay thế là gì?"

**Phép So Sánh Khách Sạn**

Tom nghĩ một lúc. "Bạn biết có những người đặt phòng khách sạn vào buổi sáng ngày họ đến không? Đó là chúng ta lúc này. Có những chiến lược tốt hơn — đặt trước sáu tháng và được giảm giá, lấy một phòng chưa bán được vào phút chót với mức giá hời, hoặc thuê cả tầng nếu bạn cần cả tầng. Cùng một khách sạn, bốn mức giá khác nhau."

Leo nhìn anh. "Và các phiên bản AWS của những cái đó là gì?"

Tom mở trang giá EC2 lên. "Có bốn mô hình giá. Và chúng ta chỉ đang sử dụng một."

Giá EC2 khớp đáng ngạc nhiên với các chiến lược đặt phòng khách sạn:

**On-Demand**: Bước đến quầy lễ tân mà không có đặt trước. Bạn trả giá rack đầy đủ, nhưng bạn có thể trả phòng bất cứ lúc nào bạn muốn. Hoàn hảo cho những lần lưu trú không thể đoán trước.

**Reserved Instances/Savings Plans**: Đặt phòng cả năm trước. Bạn được giảm giá đáng kể — giảm 30-72% — để đổi lấy cam kết sử dụng nó.

**Spot Instances**: Lấy một phòng chưa bán được với mức giá giảm sâu hiện hành của khách sạn — không mặc cả, khách sạn đặt giá dựa trên mức độ trống. Giảm đến 90%. Nhưng khách sạn có thể yêu cầu bạn rời đi với thông báo hai phút nếu họ cần phòng cho khách trả giá đầy đủ. (Nhiều năm trước bạn phải *đấu giá* cho năng lực Spot; AWS đã loại bỏ việc đấu giá vào năm 2017 — bạn chỉ cần trả giá Spot hiện tại.)

**Dedicated Hosts**: Thuê toàn bộ tầng của khách sạn dành riêng cho bạn. Không chia sẻ với khách khác. Đắt hơn đáng kể. Cần thiết khi giấy phép phần mềm hoặc quy tắc tuân thủ cấm chia sẻ máy chủ vật lý.

Mỗi mô hình có một trường hợp sử dụng. Sai lầm Nimbus đang mắc phải: sử dụng On-Demand cho mọi thứ, kể cả các khối lượng công việc chạy 24/7 và hoàn toàn có thể dự đoán được.

**Instance On-Demand: Linh Hoạt Tối Đa, Chi Phí Tối Đa**

**Khi nào sử dụng**:

- Khối lượng công việc không thể đoán trước (đợt tăng lưu lượng bạn không thể dự báo)
- Phát triển và kiểm thử (khởi động và dừng thường xuyên)
- Khối lượng công việc ngắn hạn (chạy thử nghiệm trong một tuần)
- Triển khai đầu tiên (trước khi bạn hiểu các mẫu sử dụng của mình)

**Khi nào không sử dụng**:

- Các khối lượng công việc production trạng thái ổn định mà bạn biết sẽ chạy hơn một năm
- Bất cứ thứ gì có tải cơ sở có thể dự đoán

**EC2 Hibernation: Tạm Dừng Mà Không Mất Trạng Thái**

Một kỹ thuật tối ưu hóa chi phí không được chú ý đủ là **EC2 Hibernation**. Khi bạn dừng một instance thông thường, nội dung RAM biến mất — lần khởi động tiếp theo là khởi động nguội. Hệ điều hành khởi động, ứng dụng khởi tạo, các kết nối database được thiết lập lại. Với hầu hết các máy chủ web production, điều này ổn. Với một số khối lượng công việc nhất định, nó tốn kém.

Khi bạn cho một instance ngủ đông (hibernate), nội dung RAM được lưu vào volume gốc EBS trước khi tắt. Vào lần khởi động tiếp theo, instance tiếp tục đúng nơi nó đã dừng — tiến trình đang chạy, kết nối đã thiết lập, trạng thái ứng dụng nguyên vẹn — trong một phần thời gian so với khởi động nguội. Nó đặc biệt hữu ích cho các công việc phân tích chạy lâu mà bạn muốn tạm dừng qua đêm mà không mất trạng thái, hoặc cho các instance phát triển mất vài phút để khởi động và cấu hình môi trường của chúng.

"Tôi có một instance khoa học dữ liệu," Leo nói, nhìn vào bản in. "Nó mất chín phút để khởi động. Môi trường tùy chỉnh, một tá gói Python, một số trọng số mô hình được nạp sẵn. Tôi dừng nó mỗi đêm và khởi động lại mỗi sáng."

"Vậy là bạn dành chín phút mỗi ngày để xem nó khởi động," Tom nói.

"Đúng vậy."

"Đó là 45 phút mỗi tuần thời gian kỹ thuật chờ một instance EC2."

"Đúng vậy."

"Cho nó ngủ đông đi."

Với hibernation, instance của Leo tạm dừng vào cuối ngày, lưu RAM vào volume gốc EBS, và tiếp tục trong dưới 90 giây vào sáng hôm sau. Các phiên phân tích tiếp tục đúng nơi anh đã dừng lại.

Yêu cầu hibernation: hibernation phải được **bật khi khởi chạy** — bạn không thể bật nó cho một instance đang chạy (Leo đã phải khởi chạy lại hộp khoa học dữ liệu của mình từ một AMI để có được nó). Instance phải có RAM tối đa 150 GB (nội dung RAM phải vừa với volume gốc EBS), volume gốc phải đủ lớn để chứa cả hệ điều hành và bản đổ RAM, và volume gốc phải được mã hóa (hibernation lưu dữ liệu nhạy cảm trong bộ nhớ ra đĩa). Các instance bare-metal và instance có hơn 150 GB RAM không hỗ trợ hibernation. Một giới hạn nữa: một instance có thể ở trạng thái ngủ đông tối đa **60 ngày** — sau đó nó phải được khởi động, dừng, hoặc kết thúc; nó không thể ngủ vô thời hạn.

Tom xác định các instance On-Demand của Nimbus:

- Máy chủ web API: 4 instance EC2, chạy 24/7 trong 18 tháng. *Tải cơ sở có thể dự đoán.*
- Máy chủ VPN: Luôn chạy. *Tải cơ sở có thể dự đoán.*
- Máy chủ API bổ sung cho các đợt tăng lưu lượng: Không thể đoán trước. *On-Demand là đúng ở đây.*

"Khoan — nhưng *tại sao* các máy chủ đợt tăng lại nên giữ On-Demand?" Maya hỏi. "Nếu chúng ta có đợt tăng mỗi thứ Sáu, chẳng phải điều đó đủ dự đoán được để cam kết sao?"

Tom cân nhắc. "Tải cơ sở thì có thể dự đoán. Đợt tăng có thể dự đoán về thời điểm, nhưng không về quy mô. Có những tối thứ Sáu cao hơn bình thường 30%; có những tối cao hơn 150%. Nếu tôi mua năng lực Reserved cho sáu instance và một đợt tăng chỉ cần thêm hai, tôi đã cam kết quá mức. Nếu tôi mua cho hai và đợt tăng cần tám, tôi thiếu và phần tràn vẫn chạy On-Demand. Dành riêng cho năng lực đột biến, On-Demand hoặc Spot là đúng — bạn không thể mua một Reserved Instance trong thời gian thực khi lưu lượng bắt đầu leo thang."

Có một lý do khiến danh sách "khi nào không sử dụng" quan trọng: nếu bạn đã chạy cùng các instance trong sáu tháng và bạn có thể dự đoán chúng sẽ tiếp tục chạy, mỗi tháng dùng On-Demand là một tháng bạn trả giá khách vãng lai cho một phòng mà bạn chiếm dụng vĩnh viễn.

**Reserved Instances: Cam Kết Cả Năm**

**Reserved Instances (RIs)** là cam kết thanh toán — bạn đồng ý sử dụng một loại instance cụ thể trong một region cụ thể trong 1 hoặc 3 năm. Đổi lại, AWS tính mức giá theo giờ thấp hơn.

**Bậc giảm giá**:

- 1 năm, Không trả trước: ~30-40% giảm so với On-Demand
- 1 năm, Trả một phần trước: ~35-45% giảm (trả một phần bây giờ, ít hơn mỗi giờ)
- 1 năm, Trả toàn bộ trước: ~40-50% giảm (trả toàn bộ năm ngay bây giờ)
- 3 năm, Trả toàn bộ trước: ~55-72% giảm (giảm tối đa, cam kết tối đa)

**RI Tiêu Chuẩn vs Có Thể Chuyển Đổi**:

- **Tiêu chuẩn**: Bị khóa với loại instance và region chính xác. Có thể bán trên Thị trường Reserved Instance nếu bạn không còn cần nó.
- **Có thể chuyển đổi**: Có thể thay đổi loại instance, hệ điều hành và tenancy trong thời gian cam kết. Giảm giá ít hơn Tiêu chuẩn (đến ~66% so với 72%).

Tom tính toán cho 4 máy chủ API (r6g.large, khoảng $0.101/giờ On-Demand):

- Chi phí On-Demand hằng năm: $0.101 × 24 × 365 × 4 ≈ $3,540
- RI Trả toàn bộ trước 1 năm (1 instance): ~$520 trả trước (≈41% giảm)
- 4 instance: ~$2,080 trả trước = **tiết kiệm khoảng $1,460 trong năm đầu tiên**

"Chúng ta có thể tiết kiệm gần một nghìn năm trăm đô la trong năm đầu tiên chỉ bằng cách cam kết," Tom nói. "Chi phí đó là bao nhiêu mỗi tháng, chính xác — mỗi reserved instance so với những gì chúng ta đang trả bây giờ?"

"Nó dồn về phía trước," Maya nói. "Bạn trả toàn bộ năm trước."

"Khoan — nhưng *tại sao* chúng ta lại cam kết với Standard RI nếu các loại instance vẫn đang tiến hóa?" Maya hỏi. "Lỡ r6g trở nên lỗi thời vào năm sau thì sao?"

"Chúng ta dùng Convertible RI nếu chúng ta nghĩ mình có thể cần thay đổi. Giảm giá ít hơn — đến ~66% thay vì 72% — nhưng có sự linh hoạt để chuyển đổi họ instance trong thời gian cam kết."

"Và nếu AWS phát hành loại instance tốt hơn sau khi chúng ta cam kết thì sao?"

"Chúng ta kiểm tra khi RI hết hạn. Nếu loại mới tốt hơn, chúng ta mua RI mới cho kỳ tiếp theo. RI hiện tại vẫn chạy hết thời hạn của nó ở mức giá đã cam kết."

Tom kéo bảng so sánh điểm hòa vốn lên màn hình chung để mọi người có thể theo dõi:

**So sánh ba chiều: r6g.large, 4 instance, 12 tháng**

| Lựa chọn | Chi phí hằng năm | Tương đương hằng tháng | Linh hoạt |
|---|---|---|---|
| On-Demand ($0.101/giờ × 4) | $3,540 | $295 | Đầy đủ |
| Compute Savings Plan (~34% giảm 1 năm, cam kết $0.27/giờ) | $2,365 | $197 | Cao |
| Standard RI, Trả toàn bộ trước 1 năm (4 × $520) | $2,080 | $173 | Thấp |

"Khoan," Leo nói. "RI rẻ hơn Savings Plan?"

"Cùng thời hạn thì đúng — đó là cái giá của sự linh hoạt," Tom nói. "Một Compute Savings Plan áp dụng cho *bất kỳ* loại instance nào, kích thước, region, kể cả Fargate và Lambda, nên mức giảm tối đa của nó thấp hơn — đến 66% ở bậc 3 năm. Một Standard RI, hoặc một EC2 Instance Savings Plan, khóa bạn vào một họ instance và trả công cho việc khóa đó bằng mức giảm đến 72%. Bạn càng giữ nhiều tự do, AWS càng giảm giá ít."

"Điểm hòa vốn cho RI 3 năm là gì?"

"Trả toàn bộ trước 3 năm: khoảng $1,060 mỗi instance, vậy tổng cộng $4,240 cho cả bốn — số đó mua được 36 tháng. Tương đương hằng tháng: $118, so với $295 On-Demand. Khoản trả trước tự hoàn vốn vào khoảng tháng mười bốn; sau đó bạn ở trong vùng tiết kiệm gần hai năm nữa."

"Vậy nếu chúng ta quyết định vào tháng thứ tư rằng chúng ta cần một họ instance khác," Priya nói, "chúng ta vẫn đang trả cho cam kết ban đầu."

"Đúng. Bạn có thể bán Standard RI trên Thị trường RI, nhưng không phải lúc nào cũng với giá trị đầy đủ. Convertible RI có thể được trao đổi nhưng không thể bán. Đây là lý do tại sao Savings Plan thường là lựa chọn an toàn hơn — cùng nguyên tắc, ít khóa hơn."

**Savings Plans: Cam Kết Linh Hoạt**

**Savings Plans** là một lựa chọn thay thế mới hơn, linh hoạt hơn cho Reserved Instances. Thay vì cam kết với một loại instance cụ thể, bạn cam kết với một *mức chi tiêu theo giờ* cụ thể (tính bằng đô la).

**Compute Savings Plans**: Áp dụng cho bất kỳ instance EC2 nào, bất kể loại, kích thước, region, hoặc hệ điều hành. Linh hoạt nhất. Giảm đến 66%.

**EC2 Instance Savings Plans**: Áp dụng cho một họ instance cụ thể trong một region (ví dụ: "instance c6g ở us-west-2"). Hạn chế hơn Compute, nhưng giảm đến 72% (giống mức tối đa RI).

**SageMaker Savings Plans**: Dành riêng cho đào tạo ML và suy luận SageMaker.

Đối với Nimbus: Compute Savings Plans cho các máy chủ API của họ. Họ cam kết $0.45/giờ chi tiêu compute. Bất kỳ loại instance nào, bất kỳ kích thước nào — và cam kết cũng bao gồm Fargate và Lambda, điều này quan trọng cho những gì sắp diễn ra. Khi họ mở rộng đội hoặc thay đổi loại instance, Savings Plan vẫn áp dụng.

"Điều này tốt hơn Reserved Instances cho chúng ta," Leo nói. "Chúng ta vẫn đang thử nghiệm với các loại instance. Compute Savings Plan cho chúng ta giảm giá mà không khóa chúng ta với r6g cụ thể."

"Điều gì xảy ra khi chúng ta cam kết $0.45/giờ và chỉ dùng $0.36 vào một số tháng?" Maya hỏi.

"Bạn trả $0.45 bất kể," Tom nói. "Cam kết là vô điều kiện. Savings Plan áp dụng cho bất kỳ mức sử dụng nào bạn có lên đến mức cam kết. Bất cứ thứ gì vượt quá sẽ chạy ở mức giá On-Demand. Kỷ luật là đặt cam kết ở mức bạn tự tin sẽ luôn đạt được."

"Và chúng ta không nên cam kết theo mức trung bình — chúng ta nên cam kết theo mức sàn," Priya nói.

"Chính xác. Hãy nhìn vào sáu tháng qua. Tìm tuần thấp nhất. Cam kết 90% của con số đó. Rồi xem xét hằng quý khi chúng ta phát triển."

"Chúng ta đã nghĩ về điều gì xảy ra nếu chúng ta cam kết quá mức chưa?" Priya tiếp tục. "Chúng ta mua một gói $2/giờ, rồi quý sau chúng ta tối ưu hóa và mức sử dụng compute giảm xuống $1.50?"

"Khoảng chênh $0.50/giờ trở thành lãng phí," Tom nói. "Chúng ta đang trả cho năng lực không còn tồn tại. Đó là rủi ro của việc đặt cam kết quá cao. Đợt xem xét hằng quý chính là để bắt được điều này — nếu mức sử dụng của chúng ta giảm xuống dưới cam kết, chúng ta biết lần mua tiếp theo nên nhỏ hơn. Một sắc thái quan trọng: một Compute Savings Plan đi theo bạn đến Fargate và Lambda — việc di chuyển khối lượng công việc EC2 sang container sẽ không làm nó mắc kẹt. Thứ làm cam kết mắc kẹt là thực sự dùng ít compute hơn, hoặc giữ một EC2 Instance Savings Plan hoặc RI cho một họ instance bạn đã ngừng sử dụng."

Bạn có thể đang tự hỏi: tại sao không cứ luôn mua Savings Plans ở mức tối đa có thể chi trả và để AWS sắp xếp? Câu trả lời là cam kết là một mức sàn, không phải mức trần. Nếu bạn cam kết $5/giờ nhưng chỉ dùng $3/giờ, bạn trả $5/giờ. Mỗi đô la chi tiêu cam kết không khớp với mức sử dụng thực tế là một đô la lãng phí. Đợt xem xét hằng quý không phải là tùy chọn — đó là thứ giữ cho Savings Plan là một sự tối ưu hóa chứ không phải một cam kết quá mức.

**Spot Instances: Giảm 90%**

**Spot Instances** sử dụng năng lực EC2 dự phòng của AWS. Khi AWS có máy chủ chưa sử dụng, bạn có thể thuê chúng với mức 60-90% dưới giá On-Demand. Khi AWS cần lấy lại năng lực (cho khách hàng On-Demand hoặc Reserved), họ sẽ cảnh báo trước 2 phút và kết thúc instance của bạn.

Bạn có thể đang tự hỏi: ai lại thiết kế một hệ thống xung quanh các instance có thể biến mất với thông báo hai phút? Câu trả lời là: bất kỳ ai mà công việc có thể được khởi động lại từ đầu. Công việc batch, phân tích, pipeline render — không cái nào trong số này đòi hỏi instance cụ thể đã bắt đầu công việc phải là cái hoàn thành nó. Cảnh báo 2 phút đủ để lưu một checkpoint, thoát kết nối, và thoát sạch.

Rủi ro gián đoạn là đặc điểm xác định. Spot Instances chỉ phù hợp cho:

- **Khối lượng công việc chịu lỗi**: Nếu một instance kết thúc giữa chừng, tác vụ có thể khởi động lại mà không làm hỏng bất cứ thứ gì
- **Xử lý stateless**: Thay đổi kích thước ảnh, mã hóa video, batch analytics, đào tạo ML
- **Công việc batch ngắn hạn**: Cảnh báo 2 phút đủ để lưu trạng thái và tạo checkpoint
- **Đội hỗn hợp Auto Scaling**: Sử dụng Spot cho phần lớn ASG của bạn với On-Demand làm tải cơ sở

Đối với Nimbus: Spot Instances phù hợp cho các công việc batch analytics chạy mỗi đêm (xử lý dữ liệu đơn hàng trong ngày thành các báo cáo tổng hợp). Nếu Spot Instance bị kết thúc giữa chừng công việc, công việc thất bại, nhưng nó khởi động lại từ đầu trên một instance mới. Dữ liệu trong S3 an toàn.

Nhưng Leo đã học được điều này theo cách khó khăn trước khi cả nhóm hiểu đầy đủ mẫu hình này.

Ba tháng trước, anh đã chuyển công việc batch nightly sang Spot mà không xây dựng logic checkpoint. Đêm đầu tiên, Spot Instance chạy ổn. Đêm thứ hai, nó bị gián đoạn lúc 4:47 sáng — bốn mươi bảy phút vào một công việc mất một giờ hai mươi phút để hoàn thành. Công việc thất bại. Báo cáo cuối cùng cho các đơn hàng của ngày hôm trước bị thiếu khi các đối tác nhà hàng đăng nhập sáng hôm đó.

"Tôi đã triển khai nó rồi — ồ," Leo đã nói, nhìn vào thông báo công việc thất bại. "Tôi tưởng nó sẽ ổn. Đêm đầu tiên nó đã ổn."

"Chuyện gì xảy ra?" Maya đã hỏi.

"Gián đoạn Spot. AWS cần lấy lại năng lực, cho chúng ta hai phút, instance bị kết thúc. Công việc không có checkpoint. Khi một Spot Instance mới khởi chạy lúc 5 giờ sáng để thử lại, nó bắt đầu từ con số không. Hoàn thành lúc 6:40 sáng. Các báo cáo trễ hai giờ."

Cách khắc phục thì đơn giản: ghi kết quả trung gian ra S3 mỗi mười lăm phút. Mỗi checkpoint là một trạng thái cục bộ hoàn chỉnh — đủ để một instance mới đọc checkpoint cuối cùng và tiếp tục từ điểm đó thay vì khởi động lại từ đầu.

"Sử dụng Spot cho công việc nightly đã giảm chi phí từ $12/đêm xuống còn $2/đêm," Leo báo cáo, sau khi cách khắc phục được áp dụng. "Ngay cả với một đêm tệ, tổng chi phí chạy nó trong ba tháng vẫn ít hơn hai tuần giá On-Demand."

"Nó sẽ ổn," Leo nói thêm, "ngay cả khi nó bị gián đoạn giữa chừng — đúng không?"

"Với checkpoint đã có, đúng," Tom nói. "Không có nó, không. Khả năng chịu gián đoạn phải được xây dựng vào công việc, không phải giả định."

"Và nếu ai đó cố đột nhập thì sao?" Priya hỏi. "Spot Instance ở trên phần cứng chia sẻ. Nếu nó bị gián đoạn và một cái mới khởi chạy, có sự phơi bày dữ liệu nào giữa các instance không?"

"Không," Tom nói. "AWS xóa sạch bộ nhớ instance khi kết thúc. Khách hàng tiếp theo nhận phần cứng đó thấy một bảng trống. Nhưng đó là một bản năng tốt — bất cứ khi nào bạn dùng năng lực chia sẻ, đáng để xác minh mô hình cách ly."

**Đa Dạng Hóa Spot Fleet**

Leo đã học thêm một điều từ công việc batch bị gián đoạn: khi bạn yêu cầu một loại Spot Instance duy nhất, bạn đang đặt cược vào tính sẵn có của loại cụ thể đó trong AZ đó. Nếu năng lực Spot cho c5.2xlarge ở us-west-2a cạn kiệt, công việc của bạn chờ — hoặc thất bại.

**Spot Fleet** giải quyết điều này bằng cách cho phép bạn chỉ định nhiều loại instance và AZ trong một yêu cầu duy nhất. AWS đáp ứng đội từ bất kỳ tổ hợp nào có năng lực sẵn có ở giá thấp nhất.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Với một đội đa dạng hóa, một gián đoạn ở một loại instance hoặc AZ chỉ ảnh hưởng đến một phần của đội. Phần còn lại tiếp tục chạy. Đối với công việc batch của Nimbus, chạy một Spot Fleet bốn instance thay vì một instance lớn duy nhất có nghĩa là ngay cả một gián đoạn cục bộ cũng cho phép công việc hoàn thành — chậm hơn, nhưng không khởi động lại hoàn toàn.

"Đội đa dạng hóa cũng có xu hướng được giá tốt hơn," Tom nói. "AWS cho bạn giá thấp nhất trên tất cả các loại trong đội của bạn. Vào một số đêm bạn được c5a với giá thấp hơn c5 vì tình cờ có năng lực ở đó."

"Cái đó tốn bao nhiêu mỗi tháng so với chỉ dùng một loại instance duy nhất?" Tom tự hỏi to lên — thói quen đó giờ đã hoàn toàn theo phản xạ. Anh chạy con số. Spot Fleet với giá hỗn hợp trung bình $1.80/đêm so với $2.00/đêm với yêu cầu một loại duy nhất. Khác biệt nhỏ về giá trị tuyệt đối, nhưng chỉ riêng sự cải thiện độ tin cậy đã biện minh cho thay đổi.

"Và nếu ai đó cố đột nhập vào Spot Fleet thì sao?" Priya hỏi.

"Cùng câu trả lời như mọi khi," Tom nói. "Mỗi instance được cách ly với những cái khác. Đội không tự động đặt chúng trên một phân đoạn riêng tư chung. Các security group của bạn vẫn áp dụng cho từng instance riêng lẻ."

Checkpoint đã làm cho các gián đoạn có thể quản lý được, chứ không loại bỏ. Công việc vẫn khởi động lại từ checkpoint cuối cùng, và nếu lần khởi động lại trùng với một giai đoạn giá Spot tăng vọt, instance thay thế có thể mất 10 đến 20 phút để sẵn sàng. Công việc đã được checkpoint cuối cùng che phủ sẽ được bỏ qua khi khởi động lại; công việc từ đó trở đi được làm lại. Tổng chi phí làm lại: nhỏ, nhưng có thật.

Spot Fleet đã giải quyết vấn đề tính sẵn có một cách gọn gàng. Bằng cách chỉ định năm loại instance trên ba AZ, Leo đã giảm xác suất một khoảng trống năng lực hoàn toàn xuống gần như bằng không. Chiến lược phân bổ của AWS — đa dạng hóa — phân phối đội bốn instance trên các nhóm, vì vậy không một gián đoạn của nhóm nào có thể dừng công việc. Khi một instance bị gián đoạn, ba cái còn lại tiếp tục xử lý, và checkpoint có nghĩa là instance thay thế chỉ tiếp tục công việc mà cái bị gián đoạn đang xử lý dở. Từ đầu đến cuối, công việc không bao giờ lỡ hạn báo cáo 7 giờ sáng nữa.

"Sự đa dạng hóa tốn bao nhiêu về độ phức tạp?" Maya hỏi, khi Leo ghi lại điều này.

"Ba dòng thêm trong yêu cầu Spot Fleet," Leo nói. "Mã xử lý không biết hoặc không quan tâm nó đang chạy trên loại instance nào. Độ phức tạp nằm hoàn toàn trong cấu hình đội, không phải trong ứng dụng."

Đó là lợi thế của việc thiết kế ứng dụng stateless ngay từ đầu: các quyết định mở rộng và chịu lỗi trở thành quyết định hạ tầng, không phải quyết định mã.


**Dedicated Hosts: Lựa Chọn Tuân Thủ**

Một số giấy phép phần mềm (Oracle, Windows Server trong một số cấu hình) được tính giá theo socket vật lý hoặc core. Khi bạn chạy phần mềm này trên máy chủ chia sẻ (mặc định cho EC2), bạn có thể đang trả cho năng lực mà bạn không sử dụng.

**Dedicated Hosts** cho bạn quyền truy cập vào một máy chủ vật lý hoàn toàn cho mục đích sử dụng của bạn. Bạn có thể mang giấy phép theo socket hiện có. Không có instance của bất kỳ khách hàng AWS nào khác chạy trên cùng phần cứng.

Dedicated Hosts đắt hơn đáng kể so với EC2 tiêu chuẩn. Chúng là công cụ tuân thủ và cấp phép, không phải công cụ tối ưu hóa chi phí.

Nimbus không có yêu cầu cấp phép cần Dedicated Hosts. Hầu hết các ứng dụng cloud-native đều không có.

**Biến Thể: Khi Cam Kết Phản Tác Dụng**

Nếu khối lượng công việc của bạn có thể dự đoán và ổn định trong 12 tháng, Reserved Instances mang lại mức giảm tối đa — nhưng nếu nhu cầu loại instance của bạn có thể thay đổi đáng kể trong giai đoạn đó, sự khóa đó sẽ tốn của bạn sự linh hoạt đáng giá hơn chênh lệch giá. Convertible RI giải quyết một phần điều đó, nhưng với mức giảm thấp hơn. Compute Savings Plans giải quyết phần lớn, với mức giảm tối đa thấp hơn một chút so với Standard RI.

Nếu bạn dùng Spot Instances cho các công việc batch chịu lỗi, bạn có thể đạt được mức tiết kiệm 60-90% — nhưng nếu cùng các instance đó phục vụ yêu cầu người dùng trực tiếp, một gián đoạn giữa chừng yêu cầu có nghĩa là giao dịch thất bại và khách hàng không hài lòng. Khả năng chịu gián đoạn của khối lượng công việc là biến số quyết định.

Có một trường hợp chọn sai tinh tế hơn: cam kết quá mức một Savings Plan. Nếu bạn mua một Compute Savings Plan $3.00/giờ vì mức sử dụng compute của bạn trung bình $3.00/giờ quý trước, rồi tối ưu hóa các dịch vụ quý này (giảm tổng sử dụng xuống $1.80/giờ), bạn trả $3.00/giờ đã cam kết bất kể. Khoảng chênh $1.20/giờ là lãng phí. (Lưu ý rằng việc chuyển khối lượng công việc EC2 sang Fargate hoặc Lambda sẽ *không* làm một Compute Savings Plan mắc kẹt — nó bao gồm cả ba. Rủi ro mắc kẹt là giảm sử dụng thực sự, hoặc khóa họ với EC2 Instance Savings Plans và RI.) Đây là lý do tại sao chiến lược mức sàn quan trọng: cam kết theo mức tối thiểu của bạn, không phải mức trung bình. Và xem xét hằng quý.

Quy tắc: cam kết những gì bạn chắc chắn. Dùng On-Demand cho những gì bạn không chắc. Dùng Spot chỉ cho những gì có thể sống sót qua một lần dừng đột ngột.

**Xây Dựng Đội Hỗn Hợp**

Cách tiếp cận trưởng thành: sử dụng nhiều mô hình giá cùng nhau.

Đối với đội API của Nimbus:

- **Tải cơ sở (4 instance, luôn chạy)**: Được bao phủ bởi cam kết Savings Plan
- **Cao điểm có thể dự đoán (2 instance bổ sung trong giờ làm việc)**: Được bao phủ bởi Savings Plan nếu cam kết bao gồm chúng, nếu không thì On-Demand
- **Tràn đợt tăng lưu lượng**: Spot Instances (chấp nhận được vì các máy chủ API là stateless — các yêu cầu phân phối lại nếu một instance kết thúc)

Kết quả: một đội tối ưu hóa chi phí ở mọi lớp — giá cam kết cho phần có thể dự đoán, On-Demand cho tăng trưởng không thể đoán trước, Spot cho năng lực đột biến.

**Giám Sát Mức Sử Dụng Savings Plan**

Mua một Savings Plan không phải là kết thúc công việc. Đó là khởi đầu của một nghĩa vụ định kỳ: biết liệu cam kết có đang được tận dụng hay không.

Tom đặt một lời nhắc lịch vào thứ Hai đầu tiên của mỗi quý: xem xét mức sử dụng Savings Plan. Công cụ là AWS Cost Explorer. Cụ thể, tab "Savings Plans" dưới "Reservations and Savings Plans," hiển thị ba con số anh quan tâm:

- **Tỷ lệ sử dụng (utilization rate)**: Bao nhiêu phần trăm chi tiêu cam kết thực sự được khớp bởi mức sử dụng đủ điều kiện? Một con số dưới 100% có nghĩa là anh đang trả cho cam kết không được sử dụng.
- **Tỷ lệ che phủ (coverage rate)**: Bao nhiêu phần trăm mức sử dụng EC2 đủ điều kiện đang được Savings Plan che phủ, so với chạy ở mức giá On-Demand? Một con số dưới 80% có nghĩa là có mức sử dụng chưa được che phủ mà một cam kết lớn hơn sẽ nắm bắt.
- **Chi tiêu On-Demand**: Phần chi tiêu EC2 không được bất kỳ Savings Plan nào che phủ. Nếu nó đang tăng, hoặc Savings Plan thiếu kích thước hoặc các khối lượng công việc mới đã được thêm vào ngoài phạm vi cam kết.

Tại đợt xem xét hằng quý đầu tiên, các con số trông như thế này:

- Sử dụng: 97%. Ba phần trăm chi tiêu cam kết không được khớp — $9.90 mỗi tháng trên cam kết $330/tháng. Điều đó chấp nhận được; nó có nghĩa là cam kết được đặt hơi cao hơn mức sử dụng sàn thực tế, điều này là có chủ ý.
- Che phủ: 84%. Mười sáu phần trăm mức sử dụng EC2 đủ điều kiện đang chạy On-Demand. Đó là năng lực đột biến — các instance tràn khởi động trong các đợt tăng lưu lượng và không được cam kết che phủ.
- Chi tiêu EC2 On-Demand: $147/tháng. Spot Instances (không được Savings Plans che phủ, tính giá riêng) chiếm phần lớn phần còn lại.

"Mức sử dụng 97% là khỏe mạnh," Tom nói. "Nó có nghĩa là chúng ta không cam kết quá mức. Nếu cái này là 80%, tôi sẽ biết chúng ta đã mua quá nhiều."

"Còn che phủ 84%?" Maya hỏi.

"Cái đó cũng ổn. 16% là On-Demand chính là năng lực đột biến — các instance chạy trong vài giờ trong giờ cao điểm, không phải cả ngày. Chúng ta sẽ cần mua nhiều cam kết Savings Plan hơn đáng kể để che phủ chúng, và chúng có thể không biện minh cho điều đó." Anh chạy phép tính: các instance On-Demand chưa được che phủ chạy có lẽ 40 giờ mỗi tháng với $0.101/giờ mỗi instance. Che phủ chúng bằng một Savings Plan sẽ đòi hỏi một cam kết mà chúng ta sẽ chưa sử dụng hết 90% thời gian. Tốt hơn là để chúng On-Demand.

Tại đợt xem xét hằng quý thứ hai, sáu tháng sau, một chỉ số đã thay đổi: chi tiêu EC2 On-Demand đã tăng lên $290/tháng. Tính năng Nimbus Instant đã ra mắt, và một số instance dịch vụ nền mới đã được thêm vào mà Tom không để ý.

"Ba instance này," Tom nói, chỉ vào phân tích Cost Explorer. "Chúng đã chạy On-Demand trong ba tháng. Nếu chúng sẽ tiếp tục chạy, chúng ta nên thêm chúng vào cam kết Savings Plan."

Đợt xem xét hằng quý đã bắt được nó. Không có đợt xem xét, ba instance đó sẽ tiếp tục ở mức giá khách vãng lai vô thời hạn.

"Bạn điều chỉnh cam kết như thế nào?" Priya hỏi.

"Bạn mua một Savings Plan mới, bổ sung lên trên cái hiện có," Tom nói. "Savings Plans xếp chồng lên nhau. Tôi sẽ thêm một Compute Savings Plan $0.10/giờ cho tải cơ sở mới. Gói $0.45/giờ hiện có tiếp tục cho đến khi thời hạn ba năm của nó kết thúc. Gói mới bắt đầu thời hạn ba năm của riêng nó."

"Vậy chúng ta sẽ có hai Savings Plan chồng lên nhau."

"Đúng. Chúng áp dụng độc lập cho bất kỳ mức sử dụng đủ điều kiện nào tồn tại. AWS khớp chúng theo thứ tự có lợi nhất đến ít có lợi nhất."

"Chúng ta đã nghĩ về điều gì xảy ra nếu chúng ta bán một trong những dịch vụ nền đó vào năm sau chưa?" Priya hỏi. "Chúng ta đã cam kết $0.55/giờ trong ba năm."

"Đó là rủi ro của thời hạn ba năm," Tom nói. "Đó là lý do tại sao cam kết mới nhỏ hơn — tôi cam kết theo mức sàn của các khối lượng công việc mới, không phải mức trung bình. Nếu chúng ta ngừng một dịch vụ và mức sử dụng giảm, các dịch vụ còn lại vẫn nên tiêu thụ toàn bộ mức cam kết."

Kỷ luật của đợt xem xét hằng quý không hào nhoáng. Đó là mười lăm phút trong Cost Explorer, ba con số được kiểm tra, một quyết định được đưa ra hoặc trì hoãn. Nhưng qua ba năm, kỷ luật đó là sự khác biệt giữa một Savings Plan mang lại mức sử dụng 90%+ — tiết kiệm thực sự — và một cái trôi vào lãng phí một phần khi hạ tầng tiến hóa xung quanh nó.

## Điểm Mạnh và Hạn Chế

**On-Demand**: Không cam kết. Giá đầy đủ. Dùng cho các khối lượng công việc không thể đoán trước hoặc ngắn hạn.

**Reserved Instances**: Giảm đến 72%. Bị khóa với loại/region/hệ điều hành instance cụ thể. Bán năng lực không sử dụng trên Thị trường RI.

**Savings Plans**: Giảm đến 66-72%. Linh hoạt hơn RI (Compute Savings Plans áp dụng cho bất kỳ loại instance nào). Tự động áp dụng cho việc sử dụng phù hợp.

**Spot Instances**: Giảm đến 90%. Rủi ro gián đoạn 2 phút. Chỉ cho các khối lượng công việc chịu lỗi, stateless, có thể gián đoạn.

**Dedicated Hosts**: Máy chủ vật lý đầy đủ. Đắt nhất. Cần thiết cho một số kịch bản cấp phép hoặc tuân thủ nhất định.

## Tóm Tắt

Tom dành phần còn lại của thứ Bảy để ánh xạ mọi khối lượng công việc của Nimbus đến mô hình giá lý tưởng của nó — tải cơ sở sang Savings Plans, công việc batch nightly sang Spot, tràn không thể đoán trước sang On-Demand. Bài tập đó biến ba tháng trả giá khách vãng lai thành một chiến lược có chủ đích. Các con số, một khi được tính toán, thật khó để bỏ qua.

- Giá EC2 có bốn mô hình: **On-Demand** (giá đầy đủ, không cam kết), **Reserved Instances/Savings Plans** (chi tiêu cam kết để được giảm giá đáng kể), **Spot** (năng lực dự phòng giảm 60-90%, có thể gián đoạn), **Dedicated Hosts** (độc quyền máy chủ vật lý).
- **Savings Plans** nói chung được ưu tiên hơn Reserved Instances vì tính linh hoạt.
- **Spot Instances** yêu cầu các khối lượng công việc chịu lỗi, stateless — chỉ cho công việc batch, đào tạo ML và xử lý có thể gián đoạn.
- **Checkpoint vào lưu trữ bền vững** (S3) là bắt buộc cho các công việc batch dựa trên Spot — các công việc bị gián đoạn nên tiếp tục từ checkpoint cuối cùng, không khởi động lại từ con số không.
- **Đa dạng hóa Spot Fleet** trên nhiều loại instance và AZ giảm rủi ro gián đoạn và thường mang lại giá tốt hơn.
- Chiến lược tối ưu là **đội hỗn hợp**: Savings Plans cho tải cơ sở, On-Demand cho tăng trưởng không thể đoán trước, Spot cho công việc batch có thể gián đoạn.
- Xem xét các mô hình giá khi các khối lượng công việc đã chạy ổn định trong 3+ tháng — đó là lúc On-Demand bắt đầu là lãng phí.
- **Xem xét các cam kết Savings Plan hằng quý** — cam kết theo mức sàn, không phải mức trung bình, và điều chỉnh khi các mẫu sử dụng thay đổi.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Domain 4, Task 4.2)*

- **Savings Plans vs Reserved Instances**: Savings Plans linh hoạt hơn (áp dụng cho bất kỳ instance EC2 nào cho Compute Savings Plans). Reserved Instances khóa với một loại instance cụ thể. Kịch bản kỳ thi: "cần linh hoạt tối đa trong khi vẫn được giảm giá" → Savings Plans. "Biết loại instance chính xác trong 3 năm" → Standard RI để giảm giá tối đa.
- **Tín hiệu Spot**: "nhạy cảm về chi phí," "chịu lỗi," "xử lý batch," "có thể xử lý gián đoạn," "khối lượng công việc stateless," "đào tạo ML" → Spot.
- **Xử lý gián đoạn Spot**: Spot instance nhận cảnh báo 2 phút trước khi kết thúc. Ứng dụng của bạn phải xử lý điều này một cách linh hoạt (lưu trạng thái, thoát kết nối, thoát sạch).
- **On-Demand vs Spot cho máy chủ web**: Máy chủ web phục vụ lưu lượng người dùng trực tiếp KHÔNG nên sử dụng Spot (gián đoạn gây ra yêu cầu thất bại). Sử dụng On-Demand hoặc Savings Plans cho tầng web.
- **EC2 Savings Plans vs Compute Savings Plans**: EC2 Savings Plans áp dụng cho một họ instance và region cụ thể (giảm giá cao hơn). Compute Savings Plans áp dụng cho bất kỳ instance EC2, Lambda và Fargate nào (giảm giá tối đa thấp hơn, linh hoạt hơn).
- **Thị trường RI**: Các Reserved Instance Tiêu Chuẩn chưa sử dụng có thể được bán cho các khách hàng AWS khác. Convertible RI không thể được bán.
- **Hibernation:** Lưu nội dung RAM vào volume gốc EBS khi dừng; khôi phục chúng khi khởi động. Instance tiếp tục nhanh hơn khởi động nguội với tất cả tiến trình và trạng thái nguyên vẹn. Dùng khi trạng thái instance phải được bảo toàn giữa các phiên. Yêu cầu: bật khi khởi chạy (không thể thêm vào một instance hiện có), RAM ≤ 150 GB, volume gốc EBS được mã hóa, không khả dụng cho các instance bare-metal; tối đa 60 ngày ngủ đông. Tín hiệu kỳ thi: "tiếp tục instance nhanh chóng với trạng thái trong bộ nhớ được bảo toàn" hoặc "instance phát triển mất quá lâu để khởi tạo" → Hibernation.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích khi nào Spot Instances phù hợp và khi nào không. Đặc điểm nào làm cho khối lượng công việc phù hợp với Spot?

*(Gợi ý: Hãy nghĩ về điều gì xảy ra khi instance bị kết thúc với thông báo 2 phút. Khối lượng công việc nào phục hồi tốt? Khối lượng công việc nào không?)*

**Bài Tập 2 — Kịch Bản SAA-C03**

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

Cam kết $0.45/giờ. Thời hạn ba năm. Compute Savings Plans để linh hoạt.

Kết hợp với Spot fleet cho công việc batch nightly, mức tiết kiệm ước tính: $42,500 trong ba năm — chỉ hơn $14,000 mỗi năm.

Maya đọc con số. "Bốn mươi hai nghìn đô la."

"So với chạy mọi thứ On-Demand, trong ba năm."

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
