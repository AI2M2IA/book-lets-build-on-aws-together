# Chương 28: Sự Ngạc Nhiên Về Hóa Đơn Lưu Trữ

Bảng tính giờ đã có mười sáu tab. Tom giữ nó mở trong một cửa sổ thứ hai, theo cách một số người giữ danh sách mua sắm — luôn hiển thị, luôn tích lũy. Anh thêm một hàng mới cho EC2 (xong, Savings Plan đã cam kết) và di chuyển con trỏ đến dòng tiếp theo.

Lưu trữ.

**Tóm tắt nhanh: EC2 Đã Xong, Còn Một Khoản Mục Nữa**

Công việc giá compute từ Chương 27 đã khóa chặt chiến lược EC2: một Compute Savings Plan $0.45/giờ với thời hạn ba năm, cộng với Spot cho công việc batch nightly — ước tính tiết kiệm $42,500 trong suốt thời hạn. Công việc đó đã xong, và xong tốt. Nhưng đó chỉ là một dòng trên hóa đơn. Tom đã học được, từ sáu tháng phân tích chi phí bằng Athena, rằng hóa đơn có nhiều dòng — và mỗi dòng đều xứng đáng được xem xét kỹ như nhau. S3 là tiếp theo: $198/tháng, đã được cải thiện từ $847 sau những thay đổi chính sách lifecycle từ Chương 23. Tuy nhiên, con số đập vào mắt anh lại nằm thấp hơn trên trang. EBS: $440/tháng.

"Có vẻ cao," anh nói.

Leo mở danh sách volume EBS lên. Có 47 volume EBS được gắn vào các instance. Và sau đó có thêm 23 volume không được gắn vào bất kỳ instance nào.

"23 volume này," Tom nói. "Chúng là gì?"

**Kiểm Toán Volume Mồ Côi**

Leo bắt đầu xem qua từng cái một. Đây không phải là một quá trình nhanh — các volume không được gắn nhãn đồng nhất, các tag không nhất quán, và một số đã được tạo từ lâu đến mức không ai còn nhớ bối cảnh. Tom kéo một chiếc ghế đến và quan sát.

Volume ebs-021a4c. Tạo cách đây 16 tháng. Tag: "debug-prod-db-snapshot-restore." Kích thước: 200GB. Lần gắn cuối: không bao giờ, hoặc lịch sử gắn đã bị xóa.

"Cái đó thì tôi nhớ," Leo nói. "Chúng ta có một vấn đề truy vấn database và tôi đã khôi phục một snapshot để kiểm tra dữ liệu. Tôi kiểm tra, không tìm thấy vấn đề ở đó, và quên xóa volume."

Volume ebs-07f38b. Tạo cách đây 11 tháng. Tag: "load-test-temp." Kích thước: 400GB.

Leo im lặng một lúc. "Tôi nghĩ đó là bài kiểm thử tải chúng ta đã làm trước buổi thuyết trình Series Seed. Chúng ta đã cấp phát thêm các instance với thêm lưu trữ để mô phỏng tải cao điểm và rồi... Tôi không nghĩ mình đã xóa cái nào sau đó."

"Tôi đã triển khai nó rồi — ồ," anh nói. "Bài kiểm thử tải là tạm thời. Các volume thì không."

Volume ebs-0ab12c đến ebs-0ab134. Tám volume liên tiếp, tạo cách đây 9 tháng. Tag: "k8s-experiment." Kích thước: 100GB mỗi cái, tổng cộng 800GB.

"Đó là đợt đánh giá Kubernetes," Priya nói, nhìn qua vai Leo. "Chúng ta đã dành ba tuần đánh giá liệu có nên di chuyển sang ECS hay EKS. EKS là á quân. Chúng ta đã tháo dỡ cụm thử nghiệm nhưng rõ ràng đã để lại các persistent volume."

Tom đang cộng dồn trên một tab riêng. Volume này qua volume khác, các con số tích lũy:

- Volume khôi phục debug: 4 volume × 200GB = 800GB
- Volume kiểm thử tải: sáu volume từ 200 đến 400GB — khoảng 1,200GB tổng cộng
- Volume thử nghiệm Kubernetes: 8 volume × 100GB = 800GB
- Lặt vặt chưa gắn tag: 5 volume × nhiều kích thước = ~700GB

Tổng: khoảng 3,500GB trên 23 volume không được gắn.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi. Câu trả lời: gp3 với $0.08/GB/tháng. 3,500GB × $0.08 = $280/tháng.

Anh kiểm tra ngày tạo cũ nhất. Mười sáu tháng. Anh lấy máy tính ra.

"Chúng ta đã trả cho một số cái này trong mười sáu tháng," anh nói. "Một số trong chín tháng. Trung bình có lẽ mười tháng trên tất cả chúng." 23 volume, trung bình $12/tháng mỗi cái, trung bình 10 tháng. Đó là khoảng $2,760. Cộng các volume lớn hơn và phép tính ra khoảng $3,200 tổng lãng phí.

"Ba nghìn hai trăm đô la," Tom nói. "Từ các volume không ai sử dụng."

"Và không ai để ý vì khoản phí được trải rộng trên hàng chục khoản mục," Leo nói. "Nó không phải là một khoản phí $3,200. Nó là 23 khoản phí $12 hoặc $50 hoặc $80 một tháng, mỗi khoản đủ nhỏ riêng lẻ để không kích hoạt bất kỳ báo động nào."

Tom đã xóa cả 23 volume không được gắn. Anh xác nhận với Leo và Priya rằng mỗi cái không có dữ liệu họ cần — volume debug là dữ liệu cũ từ một database đã được di chuyển, dữ liệu kiểm thử tải không liên quan, các volume thử nghiệm Kubernetes thì trống. Việc xóa mất mười lăm phút. Tháng tiếp theo, hóa đơn EBS giảm từ $440 xuống $160.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi, khi Tom giải thích cho cô về phát hiện này. "Tại sao việc xóa volume không phải là mặc định khi bạn kết thúc một instance?"

"Tùy vào volume," Tom nói. "Volume **gốc** thì được xóa theo mặc định — `DeleteOnTermination` là true cho nó. Nhưng bất kỳ volume dữ liệu **bổ sung** nào bạn gắn thì mặc định được bảo toàn. Giả định là bạn có thể cần dữ liệu trên chúng. 23 volume mồ côi này đều là volume dữ liệu — được gắn cho một phiên debug hoặc một bài kiểm thử tải, rồi bị bỏ lại khi instance bị kết thúc."

"Vậy mặc định bảo vệ bạn khỏi mất dữ liệu vô tình trên volume dữ liệu."

"Và tốn tiền của bạn nếu bạn không chú ý. Từ giờ trở đi: bất kỳ volume dữ liệu bổ sung nào đều bị xóa rõ ràng khi instance kết thúc — hoặc được đặt `DeleteOnTermination` lúc gắn — trừ khi ai đó đưa ra lý lẽ có ghi chép về việc tại sao họ cần giữ chúng."

"Chúng ta đã nghĩ về điều gì xảy ra nếu ai đó quên ghi chép lý lẽ đó chưa?" Priya hỏi. "Chúng ta có thể xóa thứ gì đó quan trọng."

"Đó là sự đánh đổi," Tom nói. "Hiện tại sự đánh đổi đang ở hướng ngược lại — chúng ta đang giả định mọi thứ nên được giữ và trả tiền cho nó khi không cần. Kỷ luật ghi chép 'giữ volume này' ít rủi ro hơn mặc định hiện tại là 'giữ mọi thứ một cách thầm lặng.'"

**Kiểm Toán Chi Phí Lưu Trữ**

Khám phá EBS của Tom là triệu chứng của một mẫu rộng hơn: chi phí lưu trữ tích lũy vô hình. Không giống như tính toán (bạn nhận thấy khi 47 máy chủ đang chạy), lưu trữ tích lũy lặng lẽ.

Hãy nghĩ như thuê kho lưu trữ. Thuê một kho là rõ ràng trên bảng sao kê thẻ tín dụng. Nhưng nếu bạn thuê kho thứ hai cho một dự án, sau đó kho thứ ba cho một số đồ nội thất cũ, và bạn không bao giờ quay lại kiểm tra bên trong — phí tiếp tục xuất hiện mỗi tháng, lặng lẽ, lâu sau khi bạn đã quên những gì bạn đang lưu trữ. Lưu trữ cloud hoạt động theo cùng cách: các byte nằm ở đó, hóa đơn đến, và không ai đặt câu hỏi cho đến khi ai đó cuối cùng mở cửa ra và thấy đầy những thứ không ai cần nữa.

Kiểm toán chi phí lưu trữ kỹ lưỡng xem xét:

**S3**:

- Có chính sách lifecycle cho tất cả các bucket không?
- Có snapshot cũ (RDS, EBS) đang nằm trong S3 không?
- Intelligent-Tiering có phù hợp cho bất kỳ bucket nào có mẫu truy cập không chắc chắn không?
- Có các object được phiên bản tạo nhiều bản sao không bao giờ được truy cập không?
- Có các tải lên multipart chưa hoàn thành tích lũy lặng lẽ không?

**EBS**:

- Có volume nào không được gắn (không có instance đang chạy nào sử dụng chúng) không?
- Các volume gp3 có được cấu hình đúng không? (Các volume gp3 mặc định có thể có thông lượng/IOPS được cấp phát dư không cần thiết)
- Có snapshot cũ hơn mức cần thiết đang được lưu giữ không?

**RDS**:

- Các khoảng thời gian lưu giữ backup tự động có được đặt phù hợp không? (Dài hơn = chi phí lưu trữ nhiều hơn)
- Có snapshot thủ công từ các instance cũ vẫn đang nằm xung quanh không?
- Có read replica từ các quá trình di chuyển cơ sở dữ liệu vẫn đang chạy không?

**EFS**:

- Volume EFS có ở đúng storage class không? (Standard vs Infrequent Access)

**S3 Versioning: Chi Phí Ẩn**

Trong Chương 5, chúng ta đã đề cập rằng S3 versioning giữ mọi phiên bản trước của một object. Điều này xuất sắc cho sự an toàn. Nó tệ cho chi phí nếu bạn cũng không có các quy tắc lifecycle cho các phiên bản.

Khi versioning được bật trên một bucket, mỗi khi bạn ghi đè một object, phiên bản cũ được giữ lại. Theo thời gian:

- Ngày 1: Ảnh được tải lên (v1)
- Ngày 30: Ảnh được cập nhật (v1 bây giờ là phiên bản "không hiện tại," v2 là hiện tại)
- Ngày 60: Ảnh được cập nhật lại (v1 và v2 không hiện tại, v3 là hiện tại)
- Ngày 365: v1, v2... v12 đều được lưu trữ. Bạn đang trả cho 12 bản sao của một ảnh.

Bạn có thể đang tự hỏi tại sao versioning không tự động dọn dẹp các phiên bản cũ. Câu trả lời là có chủ ý — AWS không muốn tự động xóa dữ liệu của bạn. Nhưng hệ quả là mọi phiên bản tích lũy cho đến khi bạn nói rõ cho S3 biết giữ chúng trong bao lâu. Giải pháp: quy tắc lifecycle cho các phiên bản không hiện tại.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom đã áp dụng các quy tắc này cho tất cả các bucket có versioning. Tháng tiếp theo, lưu trữ S3 giảm 18%.

**Tải Lên Multipart Chưa Hoàn Thành: Sự Tích Lũy Vô Hình**

Có một chi phí S3 tinh tế hơn mà hầu hết kỹ sư hoàn toàn bỏ lỡ: các tải lên multipart chưa hoàn thành.

Khi S3 tải lên một tệp lớn, nó chia tệp thành các phần và tải lên từng phần riêng biệt. Đây là cơ chế multipart upload — đáng tin cậy hơn một lần PUT lớn duy nhất cho các tệp trên vài trăm megabyte. Nhưng nếu một lần tải lên bắt đầu và rồi thất bại giữa chừng — một gián đoạn mạng, một sự cố client, một lỗi ứng dụng — các phần đã tải lên vẫn ở lại trong S3. Chúng không hiển thị như các object trong bucket của bạn. Chúng không xuất hiện trong bất kỳ danh sách nào. Nhưng chúng được lưu trữ, và bạn bị tính phí cho chúng ở mức giá S3 tiêu chuẩn.

Tom đã tìm thấy điều này bằng cách bật bảng điều khiển S3 Storage Lens trong console S3 và sắp xếp theo "incomplete multipart uploads." Nimbus có 340GB dữ liệu tải lên multipart chưa hoàn thành nằm lặng lẽ trong các bucket trên bốn tài khoản AWS, một số trong đó hơn một năm tuổi.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi. $0.023/GB/tháng × 340GB = $7.82/tháng. Nhỏ riêng lẻ. Nhưng nó đã tích lũy trong một năm mà không ai để ý.

Giải pháp: thêm một quy tắc lifecycle vào mọi bucket.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Sau bảy ngày, bất kỳ tải lên multipart chưa hoàn thành nào đều được tự động dọn dẹp. Điều này chạy vô thời hạn mà không cần bất kỳ sự chú ý liên tục nào.

"Nếu tất cả những thứ đó đã nằm đó suốt một năm — gọi là $94 chúng ta đã chi cho các lần tải lên thất bại," Leo nói.

"Cho các lần tải lên thất bại," Tom xác nhận. "Thậm chí không phải cho lưu trữ thành công. Đây là định nghĩa của lãng phí hạ tầng."

**EBS: Right-Sizing và Nâng Cấp gp3**

Giá volume EBS có hai thành phần:

1. Lưu trữ (mỗi GB mỗi tháng)
2. IOPS và thông lượng được cấp phát (nếu bạn đang dùng io1/io2 hoặc trả thêm cho hiệu suất gp3)

**Cơ hội gp3**: Trong Chương 6, chúng ta đã lưu ý rằng gp3 là mặc định hiện tại và rẻ hơn gp2. Nếu Nimbus có các volume được tạo trước khi gp3 khả dụng (nó ra mắt vào tháng 12 năm 2020), những volume đó có thể vẫn là gp2.

Việc di chuyển thì đơn giản: sửa đổi loại volume từ gp2 sang gp3 trong console AWS hoặc qua CLI. Không yêu cầu downtime. Volume vẫn khả dụng trong quá trình chuyển đổi. Đặc tính hiệu suất bằng hoặc tốt hơn — gp3 cung cấp 3,000 IOPS và 125 MB/s thông lượng cơ sở, so với mô hình burst của gp2 có thể không nhất quán cho các volume nhỏ hơn.

"Khoan — nhưng *tại sao* chúng ta lại làm theo cách đó?" Maya hỏi. "Nếu gp3 rẻ hơn và ít nhất là tốt như gp2, tại sao AWS không tự động di chuyển mọi người?"

"Vì AWS không thực hiện những thay đổi đơn phương đối với hạ tầng của khách hàng," Tom nói. "Ngay cả những thay đổi có lợi. Việc sửa đổi về mặt lý thuyết có thể có tác dụng phụ cho một số khối lượng công việc. Khách hàng phải tự khởi xướng nó. Đó là lý do tại sao hàng nghìn nhóm vẫn đang trả giá gp2 nhiều năm sau khi gp3 ra mắt, chỉ đơn giản vì không ai đi tìm."

Tom quyết định thực hiện việc di chuyển gp3 vào một sáng thứ Bảy — cùng kỷ luật buổi sáng anh đã áp dụng cho phân tích giá EC2. Thời gian yên tĩnh. Không có standup. Chỉ có console AWS và một kế hoạch.

Anh đã xác định 8 volume trên môi trường production vẫn còn là gp2: bốn volume gốc của máy chủ API, hai volume gắn vào các bộ xử lý nền, và hai volume dữ liệu cũ được tạo trước khi việc di chuyển gp3 trở thành thông lệ tiêu chuẩn cho các triển khai mới. Cộng lại chúng tổng cộng 960 GB.

Quá trình di chuyển là một lời gọi API duy nhất cho mỗi volume:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

Các tham số `--iops 3000` và `--throughput 125` khớp với mức mặc định cơ sở của gp3. Với gp2, Tom đã kiểm tra các chỉ số CloudWatch trước: IOPS trung bình trên mỗi volume là từ 200 đến 800. Không cái nào cần hơn mức cơ sở 3,000 IOPS mà gp3 cung cấp miễn phí. Thông lượng cũng thoải mái tương tự — hoàn toàn trong mức mặc định 125 MB/s.

"Nếu một volume cần thêm IOPS sau khi chúng ta chuyển thì sao?" Maya hỏi, khi Tom giải thích kế hoạch di chuyển.

"Chúng ta có thể tăng IOPS được cấp phát trên một volume gp3 bất cứ lúc nào," Tom nói. "Việc di chuyển không khóa bất cứ thứ gì. Nếu chúng ta chuyển sang gp3 ở 3,000 IOPS và phát hiện ra không đủ, chúng ta sửa đổi volume lần nữa để thêm. Việc sửa đổi diễn ra trực tiếp — không downtime, không unmount."

"Và gp2 không thể được sửa đổi tại chỗ?"

"gp2 có thể được sửa đổi sang gp3 tại chỗ. Điều bạn không thể làm là quay lại từ gp3 về gp2 — ít nhất là không dễ dàng, và không có lý do gì để làm vậy."

Quá trình di chuyển thực tế mất 73 phút từ lệnh đầu tiên đến hoàn thành trên tất cả 8 volume. AWS đã sửa đổi mỗi volume trong khi nó được mount và đang sử dụng. Các máy chủ API tiếp tục nhận lưu lượng trong suốt thời gian đó. CloudWatch không cho thấy đột biến nào về độ trễ I/O trong quá trình chuyển đổi — quá trình chuyển tiếp hoàn toàn trong suốt đối với ứng dụng đang chạy.

"Đó là 'không yêu cầu downtime' thực sự trông như thế nào," Leo nói, nhìn vào các chỉ số trước và sau mà Tom đã ghi lại. "Tôi tưởng 'không downtime' nghĩa là 'khởi động lại ngắn.' Nó nghĩa là theo nghĩa đen không có gì thay đổi từ góc nhìn của ứng dụng."

Mức tiết kiệm: gp2 là $0.10/GB/tháng; gp3 là $0.08/GB/tháng. Trên 960 GB: $96/tháng so với $76.80/tháng. Tiết kiệm hằng tháng: $19.20. Không mang tính chuyển đổi nếu xét riêng, nhưng kỷ luật mà nó đại diện thì có. Bất kỳ volume mới nào được tạo từ thời điểm đó trở đi đều dùng gp3 theo mặc định. Quy tắc tổ chức Tom viết sáng hôm đó: không volume gp2. Bất kỳ kỹ sư nào tạo một volume EBS đều nên dùng gp3 trừ khi có một lý do cụ thể, có ghi chép, để làm khác.

**IOPS và thông lượng**: Volume gp3 đi kèm với 3,000 IOPS và 125 MB/s thông lượng theo mặc định, không tính phí thêm. Bạn có thể cấp phát thêm nếu khối lượng công việc của bạn cần. Xem xét liệu hiệu suất được cấp phát có thực sự được sử dụng không.

Trong cùng đợt kiểm toán, Tom tìm thấy hai volume với 10,000 IOPS được cấp phát — một thiết lập cũ từ trước khi anh tham gia, được định cỡ cho một database đã được di chuyển sang Aurora. Anh kiểm tra các chỉ số CloudWatch: IOPS trung bình thực tế là 1,200. Anh đã giảm IOPS được cấp phát xuống 4,000 (một khoảng dự phòng an toàn trên mức thực tế cao nhất).

Tiết kiệm hằng tháng: $68 chi phí IOPS được cấp phát đã trả cho khoảng dự phòng hiệu suất không ai sử dụng.

**Vòng đời snapshot**: EBS snapshot là tăng dần (mỗi snapshot chỉ lưu những thay đổi kể từ snapshot trước), nhưng chúng tích lũy. Các snapshot cũ từ những ngày đầu của Nimbus vẫn tồn tại. Tom giữ 30 ngày snapshot hằng ngày và xóa phần còn lại.

**EFS: Các Storage Class và Quyết Định Intelligent-Tiering**

Amazon EFS có các storage class riêng:

- **EFS Standard**: Cho các tệp được truy cập thường xuyên. Chi phí cao hơn.
- **EFS Infrequent Access (IA)**: Cho các tệp không được truy cập trong 30 ngày. Rẻ hơn 92% so với Standard.
- **EFS Archive**: Cho các tệp không được truy cập trong 90 ngày. Còn rẻ hơn IA.

**EFS Intelligent-Tiering**: Tự động di chuyển các tệp giữa các storage class dựa trên mẫu truy cập.

Tom đã bật Intelligent-Tiering trên volume EFS. Sáu tuần sau, 68% tệp đã chuyển sang Infrequent Access. Chi phí EFS hằng tháng giảm từ $89 xuống còn $31.

Nhưng lựa chọn giữa Intelligent-Tiering và một quy tắc lifecycle thủ công không hề tầm thường. Tom đã cân nhắc điều đó.

"Khoan — nhưng *tại sao* chúng ta lại dùng Intelligent-Tiering thay vì chỉ đặt một quy tắc lifecycle thủ công?" Maya hỏi. "Nếu chúng ta biết rằng các tệp cũ hơn 30 ngày không được truy cập, tại sao không chỉ đặt quy tắc và xong?"

"Intelligent-Tiering xử lý các tệp quay trở lại," Tom nói. "Nếu tôi đặt một quy tắc lifecycle để chuyển tệp sang IA sau 30 ngày, rồi ai đó truy cập một tệp đã ở trong IA sáu tháng, nó vẫn ở IA. Với Intelligent-Tiering, nếu truy cập tiếp tục, tệp tự động chuyển lại về Standard. Nó là hai chiều."

"Vậy khi nào bạn sẽ ưu tiên quy tắc lifecycle?"

"Khi bạn chắc chắn mẫu truy cập là một chiều. Log lưu trữ — chúng được ghi, chúng già đi, chúng được truy cập một lần cho một đợt kiểm toán tuân thủ rồi không bao giờ nữa. Với mẫu đó, một quy tắc lifecycle chuyển sang Archive sau 90 ngày rẻ hơn Intelligent-Tiering vì bạn không trả chi phí giám sát."

"Có phí giám sát?"

"Với S3 Intelligent-Tiering, có, đó là lý do tại sao chúng ta đã đề cập đến kinh tế học object nhỏ trong chương lifecycle S3. Với EFS, quyết định chủ yếu là về mẫu truy cập: nếu các tệp có thể trở nên nóng lại, Intelligent-Tiering an toàn hơn. Nếu chúng chỉ già đi theo một hướng, một quy tắc lifecycle sang Archive rẻ hơn và đơn giản hơn."

**Thẻ Phân Bổ Chi Phí S3: Tìm Ai Đang Chi Gì**

Khi Nimbus phát triển, nhiều nhóm đang lưu trữ dữ liệu trong S3. Nhóm analytics có bucket riêng của họ. Nhóm kỹ thuật có bucket của họ. Nhóm dữ liệu nhà hàng có bucket của họ.

Hóa đơn chỉ hiển thị "S3: $198." Không có phân tích chi tiết theo nhóm.

**Thẻ phân bổ chi phí** cho phép bạn gắn thẻ tài nguyên AWS với metadata kinh doanh (nhóm, dự án, môi trường) và sau đó xem chi phí được phân tích theo những thẻ đó trong AWS Cost Explorer.

Tom đã thêm thẻ vào tất cả các bucket S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Sau một chu kỳ thanh toán có gắn thẻ, anh có thể thấy: "Data lake của nhóm analytics là $74/tháng. Backup kỹ thuật là $43/tháng. Dữ liệu nhà hàng là $81/tháng."

Bây giờ anh có thể có cuộc trò chuyện ngân sách với từng nhóm thay vì chỉ nhìn vào một con số tổng hợp.

**AWS Cost Explorer và AWS Budgets**

**AWS Cost Explorer**: Trực quan hóa chi phí lịch sử và dự báo theo dịch vụ, region, thẻ và loại sử dụng. Thiết yếu để hiểu tiền đi đâu.

**AWS Budgets**: Đặt cảnh báo khi chi phí vượt quá (hoặc được dự báo sẽ vượt quá) ngưỡng. Bạn có thể lập ngân sách theo dịch vụ, region, thẻ hoặc tài khoản.

Tom đã thiết lập ba ngân sách:

1. Hóa đơn tháng tổng cộng: Cảnh báo ở 90% lượng ngân sách
2. EC2 On-Demand: Cảnh báo nếu chi tiêu On-Demand vượt $500/tháng (tín hiệu thiếu hụt Savings Plan)
3. Chuyển dữ liệu ra: Cảnh báo ở $200/tháng (chi phí chuyển dữ liệu có thể tăng vọt bất ngờ)

Budgets đã gửi cảnh báo đến một kênh Slack. Nhóm thấy khi họ đang tiếp cận giới hạn, thay vì phát hiện ra trong hóa đơn hàng tháng.

**Biên Lai Với Mọi Dòng: Cost and Usage Reports**

Cost Explorer trả lời hầu hết các câu hỏi của Tom. Rồi anh gặp một câu nó không thể: "chính xác những bucket S3 nào, theo từng giờ, đã thúc đẩy đột biến thứ Ba tuần trước — và dưới những thẻ nào?"

Đối với các câu hỏi cấp pháp y, AWS cung cấp **Cost and Usage Report (CUR)** — nay được phân phối qua **Data Exports** — dữ liệu thanh toán chi tiết nhất AWS tạo ra: mọi khoản mục, **theo từng tài nguyên, theo từng giờ**, với thẻ, được phân phối đến một bucket S3 bạn sở hữu. Nó không phải là bảng điều khiển; nó là sổ cái thô. Mẫu hình tiêu chuẩn là truy vấn nó bằng Athena (nó đáp xuống ở định dạng cột) hoặc đưa nó vào QuickSight để làm bảng điều khiển.

Sự phân chia công việc trong kỳ thi: **Cost Explorer** = trực quan hóa tương tác và dự báo trong console. **Budgets** = cảnh báo về ngưỡng. **CUR/Data Exports** = dữ liệu chi tiết nhất, được phân phối đến S3, cho phân tích của riêng bạn. Khi một câu hỏi nói "dữ liệu chi phí cấp tài nguyên, theo giờ để phân tích tùy chỉnh" — đó là CUR, không phải Cost Explorer.

"Chúng ta đã nghĩ về điều gì xảy ra nếu chúng ta không bao giờ nhìn vào cái này chưa?" Priya hỏi. "Chúng ta đã tìm thấy $6,700 trong hai ngày. Còn gì vẫn đang ẩn nấp?"

"Kiểm toán thường xuyên," cô tiếp tục. "Đánh giá Cost Explorer hằng tháng. AWS Trusted Advisor tự động gắn cờ các volume không được gắn và tài nguyên nhàn rỗi. Tự động hóa việc dọn dẹp các mẫu lãng phí đã biết: xóa snapshot cũ hơn N ngày, cảnh báo về volume EBS không được gắn, hết hạn phiên bản S3 cũ."

**S3 Requester-Pays: Chuyển Chi Phí Chuyển Dữ Liệu**

Trong đợt kiểm toán lưu trữ, Tom tìm thấy một tình huống anh chưa lường trước.

Các đối tác nhà hàng của Nimbus cần tải xuống tài sản ảnh menu của họ — các ảnh đã được xử lý, thay đổi kích thước mà nền tảng đặt hàng phục vụ cho khách hàng. Đối với một nhà hàng cập nhật menu, điều này có nghĩa là tải xuống từ 50 MB (một cập nhật nhỏ) đến 800 MB (làm mới theo mùa đầy đủ) các tệp ảnh. Hiện tại, Nimbus đang trả chi phí chuyển dữ liệu ra cho mỗi lần tải xuống: $0.09/GB từ S3 đến vị trí của đối tác.

Với 287 đối tác nhà hàng, với trung bình một lần làm mới menu mỗi tháng và một lần tải xuống trung bình 200 MB, phép tính là: 287 × 0.2GB × $0.09 = $5.17/tháng. Không đáng kể ở quy mô hiện tại.

"Điều gì xảy ra ở 2,000 nhà hàng?" Tom hỏi.

"Cùng phép tính," Maya nói. "Khoảng $36/tháng."

"Còn 10,000 nhà hàng, và các đối tác đang tải xuống các gói tài sản theo mùa lớn — chẳng hạn, 2 GB cho cập nhật menu ngày lễ thì sao?"

Anh chạy nó. 10,000 × 2GB × $0.09 = $1,800/tháng chi phí chuyển dữ liệu, chỉ để các đối tác tải xuống tài sản họ cần.

"Đó là một con số thực," Priya nói.

"Chúng ta đã nghĩ về điều gì xảy ra nếu hóa đơn đó xuất hiện vào cùng tháng chúng ta đang cố chốt Series B chưa?" Priya tiếp tục.

"S3 Requester-Pays," Tom nói.

S3 có một tính năng gọi là Requester-Pays: khi được bật trên một bucket, thực thể thực hiện yêu cầu — không phải chủ sở hữu bucket — trả chi phí chuyển dữ liệu và chi phí yêu cầu. Chủ sở hữu bucket vẫn trả cho lưu trữ. Nhưng mỗi lần tải xuống từ bucket được tính cho tài khoản AWS của người yêu cầu.

Sự đánh đổi là quyền truy cập. Requester-Pays yêu cầu người yêu cầu phải là khách hàng AWS với một tài khoản hợp lệ — truy cập không xác thực hoặc ẩn danh vào một bucket Requester-Pays trả về lỗi. Đối với các đối tác nhà hàng của Nimbus, vốn là các doanh nghiệp với mức độ tinh vi kỹ thuật khác nhau, yêu cầu họ phải có tài khoản AWS để tải xuống tài sản menu của chính họ không phải là một mô hình khả thi.

"Chúng ta không thể dùng Requester-Pays cho truy cập trực tiếp của đối tác," Maya nói. "Hầu hết đối tác của chúng ta sẽ không thiết lập một tài khoản AWS để tải xuống ảnh."

"Đúng," Tom nói. "Nhưng chúng ta có thể dùng nó cho các tích hợp B2B — các chuỗi lớn hơn có đội ngũ kỹ thuật và tài khoản AWS. Không phải nhà hàng nhỏ ở góc phố, mà là chuỗi burger 50 địa điểm có đội ngũ kỹ thuật và tích hợp trực tiếp với API của chúng ta. Đối với phân khúc đó, Requester-Pays hợp lý."

"Còn phần còn lại?"

"Chúng ta cung cấp cho họ một cổng tải xuống dùng pre-signed S3 URL. Việc chuyển vẫn đi qua AWS, chi phí vẫn của chúng ta — nhưng nó cũng đã được tính vào giá đối tác. Lựa chọn Requester-Pays là thứ chúng ta sẽ đưa vào đàm phán hợp đồng cho các đối tác lớn hơn, không phải thứ chúng ta triển khai hôm nay."

Tom đã thêm nó vào bảng tính dưới "các tối ưu hóa tương lai": S3 Requester-Pays cho các đối tác doanh nghiệp có tài khoản AWS. Ở 2,000 nhà hàng với 20% khách hàng doanh nghiệp, ở 2 GB tải xuống hằng tháng: $72/tháng có thể chuyển sang đối tác. Nhỏ ở quy mô đó, nhưng cùng mẫu hình trở nên có ý nghĩa khi các gói tài sản lớn lên. Xem xét khi số lượng đối tác vượt 1,000 hoặc khi các đối tác doanh nghiệp bắt đầu kéo về các gói theo mùa lớn hơn.

"Bài học cũng giống như mọi khi," Tom nói. "Biết chi phí trở thành gì ở quy mô lớn trước khi bạn ở quy mô đó. Vấn đề $5 hôm nay là vấn đề $1,800 trong ba năm. Thiết kế cho nó bây giờ không tốn gì."

**Quản Trị: Tự Động Xóa vs Chỉ Cảnh Báo**

Câu hỏi về tự động hóa là câu tạo ra nhiều bất đồng nhất.

"Chúng ta có nên tự động xóa các volume EBS không được gắn sau 14 ngày không?" Tom hỏi. "Các quy tắc AWS Config có thể gắn cờ chúng. Lambda có thể xóa chúng tự động."

"Không," Priya nói ngay lập tức.

"Tại sao không?"

"Vì tự động xóa nghĩa là cuối cùng chúng ta sẽ xóa thứ gì đó không được gắn vì một lý do. Có thể ai đó đã tách một volume để chuyển nó sang một instance khác, và nó đã nằm đó 12 ngày trong khi một thay đổi đang được xem xét. Tự động xóa ở ngày 14 phá hủy dữ liệu đó."

"Vậy chỉ cảnh báo?" Tom nói. "Chúng ta nhận một thông báo nhưng không tự động xóa."

"Cảnh báo trước," Priya nói. "Buộc một con người đưa ra quyết định. Cảnh báo là: 'Volume này đã không được gắn trong 14 ngày. Gắn thẻ nó là `keep: true` nếu bạn cần, hoặc nó sẽ được gắn cờ để xóa trong lần xem xét tiếp theo.' Quyết định của con người sau đó được ghi chép bằng sự hiện diện hoặc vắng mặt của thẻ."

"Cái đó chậm hơn," Leo nói.

"Nó chậm hơn và ít có khả năng phá hủy dữ liệu hơn," Priya nói. "Chúng ta đã mất $3,200 vì lơ là. Chúng ta chưa mất dữ liệu nào cho tự động hóa. Tôi biết tôi muốn duy trì cái nào hơn."

Tom đáp xuống một phương án lai: tự động cảnh báo ở 7 ngày, yêu cầu một thẻ `keep: true` để chặn các cảnh báo tương lai, và chạy một báo cáo hằng tuần về tất cả các volume chưa gắn thẻ và không được gắn để nhóm cùng xem xét. Không tự động xóa.

**Biến Thể: Khi Dọn Dẹp Tốn Hơn Nó Tiết Kiệm**

Nếu bạn cần sự an toàn của các snapshot bổ sung, hãy giữ chúng — nhưng mỗi snapshot cũ hơn 90 ngày không được truy cập nên xứng đáng với vị trí của nó. Sự đánh đổi là bất đối xứng: xóa một snapshot bạn cần tốn một sự cố; giữ một snapshot bạn không cần chỉ tốn một khoản phí hằng tháng nhỏ. Đối với dữ liệu nhạy cảm về tuân thủ, chi phí giữ các snapshot cũ là thực nhưng thường ít hơn chi phí không có chúng khi một kiểm toán viên hỏi. Đối với các snapshot phát triển từ một bài kiểm thử đã chạy 14 tháng trước, phép tính đi theo hướng khác.

Nếu bạn bật EFS Intelligent-Tiering cho các tệp với mẫu truy cập không chắc chắn, việc phân tầng tự động tiết kiệm tiền và không cần can thiệp liên tục. Nếu các tệp có thể dự đoán sẽ già đi hướng tới truy cập lưu trữ, một quy tắc lifecycle trực tiếp đơn giản hơn. Đo lường trước khi bật.

Kết nối SAA-C03: Kỳ thi kiểm tra liệu bạn có thể chọn giữa các storage class S3 (Standard, IA, Glacier) khi có một kịch bản tần suất truy cập. Cùng logic áp dụng ở đây — class đúng phụ thuộc vào mức độ thường xuyên dữ liệu được truy cập.

**Chi Phí Của Sự Lơ Là**

Tom đã xây dựng một bảng tính. Anh tính toán bao nhiêu Nimbus đã chi cho:

- Volume EBS không được gắn (16 tháng): $3,200
- Snapshot S3 cũ (được phát hiện và xóa): $890
- IOPS được cấp phát không cần thiết: $816
- Tiết kiệm từ việc chuyển gp2 sang gp3 (dự kiến, nếu thực hiện sớm hơn): $346 trong 18 tháng
- Phiên bản S3 không hiện tại tích lũy: $1,340
- Tải lên multipart chưa hoàn thành: $94

Tổng lãng phí được xác định: khoảng $6,700 trong 18 tháng.

"Sáu nghìn bảy trăm đô la," Maya nói.

"Từ sự lơ là," Tom nói. "Không phải từ việc đưa ra quyết định kiến trúc sai. Từ việc không dọn dẹp."

"Giải pháp hệ thống là gì?"

"Và," Tom thêm vào, "biến vệ sinh chi phí thành một phần của quy trình triển khai. Khi một kỹ sư kết thúc một instance EC2, volume EBS sẽ tự động bị xóa trừ khi họ chọn không làm vậy một cách rõ ràng."

## Điểm Mạnh và Hạn Chế

**Kỷ luật tối ưu hóa chi phí**:

- Đánh giá thường xuyên phát hiện lãng phí tích lũy trước khi nó trở nên đáng kể
- Gắn thẻ cho phép trách nhiệm giải trình — các nhóm thấy chi phí của chính họ
- Cảnh báo tự động ngăn ngừa ngạc nhiên thanh toán
- Chính sách lifecycle và right-sizing thường là tiết kiệm đặt một lần rồi quên

**Nơi phức tạp hơn**:

- Xác định lãng phí trên một tài khoản lớn với nhiều nhóm yêu cầu công cụ tập trung
- Một số lãng phí là có chủ ý (giữ thêm snapshot "phòng khi cần") — đánh đổi chi phí/rủi ro là một phán đoán
- Việc chuyển gp3 yêu cầu xác thực cẩn thận (IOPS và thông lượng mặc định có thể khác với hành vi gp2 trong một số trường hợp cạnh)
- Thẻ phân bổ chi phí yêu cầu kỷ luật trên tất cả các nhóm — gắn thẻ không nhất quán làm cho dữ liệu không đầy đủ
- Tự động hóa việc tự động xóa nguy hiểm cho lưu trữ — cảnh báo và xem xét an toàn hơn cho volume và snapshot

## Tóm Tắt

Đợt kiểm toán lưu trữ đã mất hai ngày. Lãng phí mà nó phát hiện — $6,700 trên 18 tháng tích lũy vô hình — không phải là một thất bại của việc ra quyết định mà là một thất bại của sự chú ý. Không có gì được cấu hình sai một cách cố ý. Các snapshot, các volume không được gắn, lịch sử phiên bản tích lũy, các tải lên multipart chưa hoàn thành: mỗi cái đều hợp lý vào thời điểm đó và đơn giản là không bao giờ được xem lại. Bài học không phải về các dịch vụ AWS cụ thể. Nó là về việc xây dựng thói quen nhìn vào.

- **Chi phí lưu trữ tích lũy vô hình** — kiểm toán thường xuyên là thiết yếu.
- **Volume EBS không được gắn** là nguồn lãng phí phổ biến. Xóa chúng (hoặc tự động xóa khi instance kết thúc).
- **EBS right-sizing**: Chuyển gp2 sang gp3 (thường tiết kiệm 20%). Loại bỏ IOPS được cấp phát dư.
- **S3 versioning**: Bật quy tắc lifecycle cho các phiên bản không hiện tại để tránh trả tiền cho lịch sử phiên bản không giới hạn.
- **Tải lên multipart chưa hoàn thành**: Thêm một quy tắc lifecycle `AbortIncompleteMultipartUpload` vào mọi bucket. Điều này thường bị bỏ qua và tích lũy lặng lẽ.
- **EFS Intelligent-Tiering**: Tự động di chuyển tệp đến các tầng chi phí thấp hơn dựa trên tần suất truy cập. Đối với các mẫu truy cập có thể dự đoán, các quy tắc lifecycle thủ công có thể rẻ hơn.
- **Quản trị**: Cảnh báo về các volume không được gắn sau 7-14 ngày; yêu cầu gắn thẻ rõ ràng để chặn. Tránh tự động xóa cho các tài nguyên lưu trữ.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Domain 4, Task 4.1)*

- **Thẻ phân bổ chi phí**: Bật User-Defined Tags để phân bổ chi phí trong console thanh toán; sau đó gắn thẻ tài nguyên. Cost Explorer hiển thị phân tích theo thẻ. Kịch bản kỳ thi: "xác định phòng ban nào đang tạo ra chi phí S3 nhiều nhất" → thẻ phân bổ chi phí.
- **AWS Trusted Advisor**: Xác định các instance EC2 chưa được sử dụng hết, volume EBS không được gắn, bộ cân bằng tải nhàn rỗi và các nguồn lãng phí khác. Kiểm tra cơ bản miễn phí; kiểm tra đầy đủ yêu cầu Business/Enterprise Support.
- **Các thành phần chi phí EBS**: Lưu trữ (mỗi GB), IOPS được cấp phát (nếu io1/io2 hoặc gp3 thêm), thông lượng (nếu gp3 thêm). Biết thành phần nào có thể được right-sized.
- **Chi phí S3 versioning**: Các phiên bản không hiện tại được lưu trữ và tính phí theo cùng mức với phiên bản hiện tại. Các quy tắc lifecycle hết hạn phiên bản không hiện tại là quan trọng để kiểm soát chi phí trong các bucket có versioning.
- **AWS Compute Optimizer**: Phân tích việc sử dụng EC2 và đề xuất các loại instance được right-sized. Tín hiệu kỳ thi: "giảm chi phí EC2 bằng cách chọn đúng loại instance" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Sử dụng ML để phát hiện các mẫu chi tiêu bất thường. Tín hiệu kỳ thi: "tự động phát hiện tăng chi phí bất ngờ" → Cost Anomaly Detection.
- **Bộ công cụ chi phí**: biểu đồ/dự báo tương tác → Cost Explorer. Cảnh báo ngưỡng → Budgets. "Dữ liệu thanh toán chi tiết nhất, cấp tài nguyên/theo giờ được phân phối đến S3 để phân tích tùy chỉnh (Athena/QuickSight)" → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: "chia sẻ một tập dữ liệu S3 lớn; người dùng trả chi phí tải xuống của riêng họ" → S3 Requester Pays (chủ sở hữu vẫn chỉ trả lưu trữ; người yêu cầu phải xác thực với một tài khoản AWS).

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích tại sao các volume EBS không được gắn tạo ra chi phí ngay cả khi không có instance EC2 nào đang sử dụng chúng. Quy trình nào kỹ sư nên tuân theo khi kết thúc một instance EC2 để tránh lãng phí này?

*(Gợi ý: Volume EBS lưu trữ dữ liệu trên đĩa vật lý, và đĩa đó tốn tiền bất kể nó có được đọc hay không.)*

**Bài Tập 2 — Kịch Bản SAA-C03**

*Kịch bản*: Hóa đơn AWS của một công ty đã tăng từ $5,000 lên $9,000/tháng trong sáu tháng, nhưng họ không thêm dịch vụ mới. Nhóm kỹ thuật nghi ngờ chi phí lưu trữ là vấn đề. Sự kết hợp nào của công cụ AWS sẽ TỐT NHẤT xác định và giải thích tăng chi phí?

A) AWS CloudTrail để xem xét các lời gọi API và xác định ai đã tạo tài nguyên mới  
B) AWS Cost Explorer để phân tích chi phí theo cấp độ dịch vụ, và AWS Trusted Advisor để phát hiện tài nguyên nhàn rỗi và không được gắn  
C) Amazon CloudWatch để theo dõi việc sử dụng tài nguyên và tạo cảnh báo chi phí  
D) AWS Config để xác định tất cả tài nguyên và trạng thái tuân thủ của chúng

**Gợi ý 1**: "Xác định tăng chi phí" → trực quan hóa phân tích chi phí theo dịch vụ.

**Gợi ý 2**: "Tài nguyên nhàn rỗi và không được gắn" → một công cụ cụ thể chủ động xác định những tài nguyên này.

**Gợi ý 3**: CloudTrail ghi nhật ký lời gọi API; Cost Explorer hiển thị xu hướng chi phí. Cái nào hữu ích hơn cho phân tích chi phí?

**Đáp án**: B

**Giải thích**: AWS Cost Explorer hiển thị xu hướng chi phí được phân tích theo dịch vụ, region và loại sử dụng — hoàn hảo để xác định dịch vụ nào thúc đẩy tăng chi phí. Các kiểm tra tối ưu hóa chi phí của AWS Trusted Advisor xác định các volume EBS không được gắn, instance EC2 nhàn rỗi, bộ cân bằng tải chưa sử dụng và các nguồn lãng phí phổ biến khác.

**Tại sao không phải A?** CloudTrail ghi nhật ký ai đã tạo tài nguyên và khi nào, nhưng không trực tiếp hiển thị xu hướng chi phí hoặc xác định lãng phí.

**Tại sao không phải C?** CloudWatch theo dõi hiệu suất tài nguyên (CPU, bộ nhớ) — hữu ích để right-sizing nhưng không để xác định lãng phí lưu trữ tích lũy.

**Tại sao không phải D?** AWS Config theo dõi cấu hình tài nguyên và tuân thủ nhưng không phải công cụ phân tích chi phí.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Task 4.1*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Hóa đơn S3 của Nimbus hiển thị $340/tháng cho một bucket có nhãn "backups." Bucket có versioning được bật và chứa:

- Snapshot cơ sở dữ liệu hằng ngày (7 ngày là đủ cho chính sách của họ)
- Backup đầy đủ hàng tuần (giữ trong 3 tháng)
- Lưu trữ hàng quý (giữ trong 7 năm để tuân thủ thuế)

Thiết kế chính sách lifecycle cho bucket này giảm thiểu chi phí trong khi đáp ứng các yêu cầu lưu giữ. Storage class nào nên mỗi loại dữ liệu sử dụng? Bạn sẽ xử lý versioning như thế nào để ngăn các phiên bản cũ tích lũy?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành thiết kế chính sách lifecycle.)*

## Cảnh Sau Tín Dụng

Tom đã xuất bản kết quả kiểm toán chi phí cho nhóm.

Lãng phí được xác định: $6,700 trong 18 tháng.
Tiết kiệm hàng năm dự kiến từ các thay đổi đã thực hiện: $6,200.

Sau đó anh thêm một dòng ở cuối: "Điều này không bao gồm tiết kiệm từ Savings Plans ($14,200/năm) hoặc chính sách lifecycle S3 ($7,800/năm). Tác động tối ưu hóa hàng năm tổng hợp: khoảng $28,200."

Maya đọc nó hai lần.

"Đó gần bằng lương của một kỹ sư cấp thấp," cô nói.

"Trong lãng phí," Tom xác nhận.

"Hoặc," Leo nói, "đó là bằng chứng rằng việc thực hiện các tối ưu hóa này sớm hơn sẽ đã tài trợ cho kỹ sư đó."

Tom nhìn anh.

"Đó là cách đúng để nghĩ về nó," anh nói. "Tối ưu hóa chi phí không phải là cắt giảm. Đó là không trả tiền cho những thứ không tạo ra giá trị."

Maya đã ghim tài liệu vào wiki của công ty.

Trong chương tiếp theo: tầng cơ sở dữ liệu nhận được sự đối xử tương tự, và Tom phát hiện ra một nơi anh thực sự đang đầu tư không đủ.
