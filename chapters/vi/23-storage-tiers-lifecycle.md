# Chương 23: Hệ Thống Hồ Sơ Tự Sắp Xếp

Một công ty luật giữ các hồ sơ vụ kiện đang hoạt động trên bàn làm việc. Những vụ đã kết thúc được cho vào tủ hồ sơ. Những vụ từ ba năm trước được cho vào các thùng lưu trữ dưới tầng hầm. Những vụ từ mười năm trước được chuyển đến một cơ sở lưu trữ ngoài trụ sở, nơi tính phí vài xu mỗi thùng nhưng mất hai ngày để lấy lại bất cứ thứ gì.

Cùng một thông tin, được lưu trữ với chi phí khác nhau dựa trên tần suất truy cập.

---

Với hệ thống tự động hóa quy trình đã được triển khai và luồng đơn hàng cuối cùng cũng ổn định, Tom quay lại với việc rà soát chi phí của mình. Hóa đơn S3 đã nằm trong tâm trí anh từ quý trước — một trong những khoản chi cứ tăng lên mà chẳng ai nhìn thẳng vào nó. Cuối cùng anh cũng có thời gian để xem xét.

Anh gọi Leo lại.

"Chúng ta có 4.2 terabyte trong S3," Leo nói sau khi kiểm tra.

"Của cái gì?"

"Ảnh nhà hàng. Biên lai đơn hàng. Các bản xuất dữ liệu phân tích. Các snapshot sao lưu từ 18 tháng trước."

"Lần cuối cùng ai đó truy cập một bản sao lưu từ 18 tháng trước là khi nào?"

Leo kiểm tra nhật ký truy cập.

"Tháng Mười năm ngoái," anh nói. "Một lần. Để xác minh định dạng bản sao lưu."

"Vậy là chúng ta đang trả tiền cho 18 tháng sao lưu ở mức giá S3 Standard đầy đủ."

"Đúng vậy."

"Chi phí mỗi tháng là bao nhiêu — Glacier so với Standard?" Tom hỏi, đã mở sẵn trang bảng giá.

S3 Standard: $0.023 mỗi GB mỗi tháng. S3 Glacier Instant Retrieval: $0.004 mỗi GB mỗi tháng.

Tom tính toán.

"Chúng ta có thể giảm hóa đơn này đáng kể," anh nói, "chỉ bằng cách chuyển dữ liệu cũ sang lưu trữ rẻ hơn."

"Chúng ta cần biết cái gì là cũ," Leo nói.

"S3 biết. Nó theo dõi thời gian truy cập gần nhất."

**Các Lớp Lưu Trữ S3: Phổ Đầy Đủ**

Chương 5 đã giới thiệu S3 Standard như lớp lưu trữ chính. S3 thực ra có tám lớp lưu trữ, mỗi lớp được thiết kế cho các mẫu truy cập khác nhau (lớp thứ tám, **S3 Express One Zone**, là một lớp chuyên biệt một-AZ dành cho các khối lượng công việc nhạy cảm với độ trễ và hiếm khi xuất hiện ngoài các tình huống hiệu năng cao):

**S3 Standard**: Cho dữ liệu truy cập thường xuyên. Độ trễ thấp (mili-giây). Chi phí cao nhất. Không có thời lượng lưu trữ tối thiểu. Dùng cho dữ liệu đang hoạt động: ảnh thực đơn hiện tại, đơn hàng hôm nay, nhật ký gần đây.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Cho dữ liệu được truy cập ít hơn một lần mỗi tháng. Truy xuất trong mili-giây giống Standard, nhưng chi phí lưu trữ thấp hơn + phí truy xuất mỗi GB. Thời lượng lưu trữ tối thiểu 30 ngày. Dùng cho dữ liệu bạn cần ngay lập tức khi truy cập, nhưng hiếm khi truy cập: biên lai đơn hàng cũ hơn, các bản xuất phân tích từ 6 tháng trước.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Giống S3 Standard-IA (bao gồm cả mức tối thiểu 30 ngày) nhưng chỉ được lưu trong một Availability Zone (thay vì ba). Kém bền hơn (nếu AZ đó gặp thảm họa, dữ liệu có thể mất), nhưng rẻ hơn 20%. Dùng cho dữ liệu có thể tạo lại nếu mất: bộ nhớ đệm thumbnail, các kết quả xử lý tạm thời.

**S3 Glacier Instant Retrieval**: Dữ liệu lưu trữ mà bạn thỉnh thoảng cần. Truy xuất trong mili-giây. Chi phí lưu trữ rất thấp, chi phí truy xuất mỗi GB cao hơn. Lưu trữ tối thiểu 90 ngày. Dùng cho dữ liệu được truy cập một lần mỗi quý hoặc ít hơn: báo cáo tuân thủ hàng quý, các snapshot sao lưu 12 tháng tuổi.

**S3 Glacier Flexible Retrieval**: Lưu trữ sâu, được truy xuất trong vài phút đến vài giờ. Chi phí thấp hơn Glacier Instant Retrieval. Dùng cho dữ liệu lưu trữ với mức độ khẩn cấp thấp hơn.

**S3 Glacier Deep Archive**: Lựa chọn rẻ nhất. Được truy xuất trong 12 giờ. Lưu trữ tối thiểu 180 ngày. Dùng cho dữ liệu phải được giữ vì tuân thủ quy định nhưng không bao giờ dự kiến được truy cập: hồ sơ thuế 7 năm, nhật ký kiểm toán 10 năm.

Mô hình: khi tần suất truy cập giảm, chi phí giảm nhưng thời gian truy xuất tăng (và chi phí mỗi lần truy xuất tăng). Hãy chọn lớp phù hợp với mẫu truy cập của bạn.

**Lifecycle Policy S3: Hệ Thống Hồ Sơ Tự Động**

Việc di chuyển tệp giữa các lớp lưu trữ một cách thủ công dễ gây lỗi và tốn thời gian. **Lifecycle policy** của S3 tự động hóa việc này dựa trên các quy tắc bạn định nghĩa.

Một quy tắc lifecycle có hai thành phần:

**Filter**: Quy tắc áp dụng cho những đối tượng nào (tất cả đối tượng, đối tượng có tiền tố cụ thể, đối tượng có thẻ cụ thể).

**Actions**: Làm gì, sau bao nhiêu ngày.

Ví dụ lifecycle policy cho biên lai đơn hàng của Nimbus:

```
Chuyển sang S3 Standard-IA sau 90 ngày
Chuyển sang S3 Glacier Instant Retrieval sau 365 ngày
Chuyển sang S3 Glacier Flexible Retrieval sau 540 ngày (18 tháng)
Chuyển sang S3 Glacier Deep Archive sau 2555 ngày (7 năm)
Xóa sau 2920 ngày (8 năm)
```

Policy đơn lẻ này đảm bảo:

- Biên lai đang hoạt động (< 90 ngày): S3 Standard, truy cập nhanh
- Biên lai gần đây (90-365 ngày): Standard-IA, rẻ nhưng có sẵn ngay lập tức
- Biên lai cũ hơn (1 năm đến 18 tháng): Glacier Instant, rất rẻ, mili-giây khi cần
- Biên lai lịch sử (18 tháng đến 7 năm): Glacier Flexible, rẻ hơn nữa — việc truy xuất mất vài giờ, không phải mili-giây
- Biên lai hết hạn (> 8 năm): Tự động xóa

Một điểm vướng mắc suýt làm hỏng kế hoạch. Kể từ cuối năm 2024, các quy tắc lifecycle **mặc định không chuyển các đối tượng nhỏ hơn 128 KB** — và biên lai của Nimbus trung bình chỉ 18 KB mỗi cái. Để policy thực sự di chuyển chúng, Leo phải ghi đè kích thước đối tượng tối thiểu mặc định trên quy tắc (các filter lifecycle cũng có thể chọn theo kích thước với `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). Mặc định này tồn tại vì một lý do chính đáng: các lớp lưu trữ tính phí khoảng 40 KB chi phí metadata mỗi đối tượng và mỗi lần chuyển đổi đều tốn một phí yêu cầu, nên với hàng triệu đối tượng nhỏ, việc chuyển đổi có thể tốn nhiều hơn số tiền tiết kiệm được. Leo tính toán cho các biên lai — với thời gian lưu giữ bảy năm, nó vẫn có lợi.

Tom xem lại khoản tiết kiệm dự kiến: từ $847/tháng xuống còn khoảng $220/tháng.

"Bằng cách chỉ... xác định những gì là cũ và nó nên đi đâu?" anh nói.

"Và S3 di chuyển nó tự động," Leo xác nhận. "Không cron job. Không di chuyển thủ công. Không quên."

"Khoan đã — nhưng *tại sao* S3 không tự làm việc này theo mặc định?" Maya hỏi từ bên kia phòng. "Tại sao bạn phải định nghĩa một policy ngay từ đầu?"

"Vì 'cũ' khác nhau với mỗi bucket," Leo nói. "Một kho lưu trữ tuân thủ và một bucket tải lên ảnh cần các quy tắc lưu giữ hoàn toàn khác nhau. S3 không thể đoán cái nào là cái nào."

Bạn có thể đang tự hỏi: điều gì xảy ra nếu dữ liệu sai bị chuyển sang Glacier và bạn cần nó gấp? Bạn sẽ phải trả một phí truy xuất và chờ đợi — đó là lý do bạn nên kiểm tra các quy tắc lifecycle của mình trên một bucket nhỏ, không quan trọng trước tiên, và xác minh nhật ký truy cập trước khi triển khai cho dữ liệu sản xuất. Một sai lầm truy xuất trên 18 tháng sao lưu sẽ tốn ít hơn nhiều so với một sự cố ảnh hưởng đến khách hàng, nhưng vẫn đáng để kiểm tra trước.

Nếu mẫu truy cập của dữ liệu là có thể dự đoán được (nhật ký luôn nguội sau 30 ngày), hãy dùng các quy tắc lifecycle rõ ràng — chúng tiết kiệm chi phí hơn so với phí giám sát mỗi đối tượng của Intelligent-Tiering. Nếu các mẫu truy cập của bạn thay đổi theo thời gian hoặc khó dự đoán, hãy dùng Intelligent-Tiering — nhưng hãy lưu ý rằng nó đơn giản là bỏ qua các đối tượng nhỏ hơn 128 KB: chúng không được giám sát, không bị tính phí giám sát, và không bao giờ rời khỏi tầng Frequent Access.

**S3 Intelligent-Tiering: Lớp Tự Tổ Chức**

Sẽ thế nào nếu bạn không biết mình sẽ truy cập dữ liệu của mình thường xuyên đến mức nào?

**S3 Intelligent-Tiering** giám sát các mẫu truy cập cho từng đối tượng và tự động di chuyển nó giữa các tầng truy cập:

- **Tầng Frequent Access**: Cho các đối tượng được truy cập gần đây
- **Tầng Infrequent Access**: Các đối tượng không được truy cập trong 30 ngày
- **Tầng Archive Instant Access**: Các đối tượng không được truy cập trong 90 ngày
- **Tầng Archive Access**: Các đối tượng không được truy cập trong 90-730 ngày (tùy chọn)
- **Tầng Deep Archive Access**: Các đối tượng không được truy cập trong 180-730+ ngày (tùy chọn)

S3 Intelligent-Tiering tính một phí giám sát nhỏ mỗi đối tượng mỗi tháng ($0.0025 mỗi 1,000 đối tượng), nhưng không có phí truy xuất cho các tầng Frequent và Infrequent.

Dùng Intelligent-Tiering khi:

- Các mẫu truy cập là không thể dự đoán hoặc thay đổi theo thời gian
- Bạn có hỗn hợp dữ liệu nóng và nguội mà bạn không thể dễ dàng phân loại
- Bạn có các đối tượng lớn hơn 128KB (các đối tượng nhỏ hơn không được giám sát hay tự động phân tầng gì cả)

Dùng các lớp lưu trữ rõ ràng (với lifecycle policy) khi:

- Các mẫu truy cập là có thể dự đoán được
- Bạn muốn mọi đối tượng — bao gồm cả những đối tượng nhỏ — thực sự chuyển sang các lớp rẻ hơn
- Các đối tượng nhỏ (< 128KB)

Điều cần lưu ý về tệp nhỏ đáng được nhấn mạnh. Nimbus có 2.3 triệu đối tượng biên lai đơn hàng trong S3 — mỗi cái là một tệp JSON nhỏ, trung bình khoảng 18KB. Tom ban đầu đã cân nhắc Intelligent-Tiering cho bucket biên lai, cho đến khi anh đọc các điều khoản chi tiết.

Các đối tượng nhỏ hơn 128KB **không được giám sát và không được tự động phân tầng** trong Intelligent-Tiering. Chúng không phải trả phí giám sát ($0.0025 mỗi 1,000 đối tượng mỗi tháng) — nhưng chúng cũng không bao giờ di chuyển: chúng ngồi yên trong tầng Frequent Access, ở mức giá tương đương Standard, mãi mãi.

Vậy với các biên lai 18KB, Intelligent-Tiering sẽ không khiến Nimbus tốn thêm gì — nó chỉ đơn giản là sẽ không *làm* gì cả. 2.3 triệu biên lai nguội sẽ tiếp tục trả mức giá lưu trữ nóng ($0.023/GB) vô thời hạn, trong khi các tầng Archive ($0.00099/GB) nằm ngoài tầm với.

"Vậy Intelligent-Tiering được thiết kế cho các đối tượng lớn," Maya nói.

"Hoặc cho các khối lượng công việc mà bạn thực sự không biết mẫu truy cập," Tom nói. "Với một bucket gồm các tệp nhỏ mà chúng ta biết biên lai nóng trong 90 ngày và nguội sau đó, một quy tắc lifecycle rõ ràng — với phần ghi đè đối tượng nhỏ từ trước — là thứ duy nhất thực sự di chuyển chúng."

Intelligent-Tiering là một dịch vụ tuyệt vời. Nó chỉ không phải là công cụ phù hợp cho mọi bucket: dưới ngưỡng 128KB, nó vô hại nhưng vô dụng, và chỉ các quy tắc lifecycle rõ ràng (với phần ghi đè kích thước) mới phân tầng được các đối tượng nhỏ.

**Khi Bạn Thực Sự Cần Lấy Lại Dữ Liệu: Một Câu Chuyện Truy Xuất Glacier**

Ba tháng sau khi các lifecycle policy được triển khai, Nimbus nhận được một thông báo pháp lý. Một đối tác nhà hàng cũ đang tranh chấp một điều khoản hợp đồng, và các luật sư của Nimbus cần 18 tháng hồ sơ đơn hàng cho đối tác đó — mọi thứ từ khi khai trương đến khi chấm dứt hợp đồng.

"Và sẽ thế nào nếu ai đó cố đột nhập thông qua quy trình điều tra pháp lý?" Priya nói. Cô không đùa. "Luật sư yêu cầu xuất dữ liệu hàng loạt là một vector tấn công social engineering phổ biến. Hãy xác minh rằng yêu cầu là hợp pháp trước khi mở bất kỳ kho dữ liệu nào."

Yêu cầu là hợp pháp. Các hồ sơ nằm trong S3, trải qua ba lớp lưu trữ: 90 ngày gần nhất ở Standard-IA, năm trước đó ở Glacier Instant Retrieval, phần còn lại ở Glacier Flexible Retrieval (lifecycle policy đã dùng Flexible cho dữ liệu cũ hơn 18 tháng).

Các hồ sơ Glacier Instant có sẵn ngay lập tức. Leo lọc theo ID nhà hàng, chạy một truy vấn Athena để xác định các bản ghi đơn hàng khớp, và xuất chúng ra một vị trí S3 an toàn. Năm phút làm việc.

Các hồ sơ Glacier Flexible cần một yêu cầu khôi phục:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **tầng Standard**: 3-5 giờ. Các hồ sơ sẽ có sẵn dưới dạng một bản sao tạm thời trong S3 Standard trong 7 ngày, sau đó tự động bị xóa. Bản sao lưu trữ gốc vẫn còn trong Glacier.

Chi phí của toàn bộ việc truy xuất: $0.01 mỗi GB được truy xuất ở tầng Standard, cho 4.2 GB hồ sơ lưu trữ. Khoảng bốn xu. (Tầng Expedited — 1 đến 5 phút — tốn $0.03 mỗi GB, nhưng tính khả dụng của nó không được đảm bảo theo cách của tầng Standard.)

"Bốn xu," Maya nói, khi Leo báo cáo lại. "Cho 18 tháng hồ sơ."

"Chúng ta đã lưu 4.2GB ở mức $0.0036 mỗi GB mỗi tháng trong một năm rưỡi," Leo nói. "Chi phí lưu trữ tổng cộng khoảng hai mươi bảy xu. Chi phí truy xuất là bốn xu. So với một đô la bảy mươi tư xu nếu chúng ta giữ nó trong S3 Standard suốt 18 tháng."

"Và điều duy nhất quan trọng," Priya nói, "là chúng ta nhớ rằng nó nằm trong Flexible Retrieval và đã lên kế hoạch cho việc chờ 3-5 giờ. Nếu các luật sư cần thứ này trong 30 phút, chúng ta đã gặp rắc rối."

Đây là bài học vận hành quan trọng về Glacier: nó không chỉ là một quyết định về chi phí, nó là một quyết định về SLA truy xuất. Trước khi lưu trữ dữ liệu vào Glacier Flexible hoặc Deep Archive, hãy ghi lại thời gian truy xuất cho bất kỳ ai có thể cần đến. "Dữ liệu tồn tại" và "chúng ta có thể lấy nó trong 30 phút" là hai sự đảm bảo khác nhau.

**Multipart Upload: Cho Các Đối Tượng Lớn**

S3 có giới hạn tải lên đơn lẻ là 5GB. Đối với các đối tượng lớn hơn, bạn phải dùng **multipart upload**: chia đối tượng thành các phần, tải lên từng phần song song, và S3 ráp chúng lại.

Lợi ích:

- Tải lên nhanh hơn (song song)
- Có thể tiếp tục các lần tải lên thất bại (chỉ tải lại các phần thất bại)
- Bắt buộc cho các đối tượng > 5GB

Mẹo về quy tắc lifecycle: Đặt một quy tắc lifecycle để xóa các multipart upload chưa hoàn thành sau 7 ngày. Nếu một lần tải lên thất bại giữa chừng và không được dọn dẹp, các phần một nửa đó sẽ được lưu trữ và bị tính phí — mà không có một đối tượng đã ráp xong để trình ra.

Tom đánh giá rất cao mẹo này.

Anh chạy lệnh AWS CLI để liệt kê các multipart upload chưa hoàn thành trên tất cả các bucket của Nimbus:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

Kết quả dài hơn anh mong đợi. Anh chuyển nó qua một bộ đếm.

340 lần tải lên chưa hoàn thành. Cái cũ nhất là từ 8 tháng trước — bài kiểm tra tải của Leo cho luồng tải lên ảnh nhà hàng. Bài kiểm tra tải đã tạo ra hàng trăm lần tải lên một nửa, không cái nào được hoàn thành (bài kiểm tra không được thiết kế để hoàn thành chúng, chỉ để kiểm tra endpoint khởi tạo). 340 lần tải lên chưa hoàn thành, nằm trong S3, mỗi cái đại diện cho dữ liệu một nửa mà AWS đang lưu trữ và tính phí.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom nói. Anh không hỏi để biết thông tin. Anh đang tính toán thành tiếng.

Tổng kích thước của các phần chưa hoàn thành: 48 GB. Ở mức $0.023/GB: $1.10/tháng. Trong tám tháng: đã tiêu $8.80.

Với tốc độ tăng trưởng hiện tại, nếu không được dọn dẹp: tiếp tục vô thời hạn.

"Leo," Tom nói.

"Tôi đã triển khai nó rồi — à," Leo nói, đi lại gần. "Bài kiểm tra tải. Tôi quên dọn dẹp các lần tải lên một nửa."

"Tám tháng trước."

"Tôi không biết S3 lưu trữ các phần ngay cả khi lần tải lên không bao giờ hoàn thành."

"Nó lưu trữ chúng. Nó tính phí chúng. Và không có bảng điều khiển nào cảnh báo bạn về việc đó. Chúng chỉ tích lũy."

Cách khắc phục: một quy tắc lifecycle để xóa các phần multipart upload chưa hoàn thành sau 7 ngày.

```
Quy tắc: Xóa các phần multipart upload chưa hoàn thành
Prefix: (tất cả đối tượng)
Action: Xóa các multipart upload chưa hoàn thành sau 7 ngày
```

340 lần tải lên hiện có đã được dọn dẹp thủ công. Quy tắc lifecycle đảm bảo không có bài kiểm tra tải hay lần tải lên thất bại nào trong tương lai tích lũy theo cùng cách đó. Khoản $1.10/tháng vốn âm thầm dồn lại suốt tám tháng đã dừng lại — nhỏ về số tiền, nhưng mô hình (vô hình, đang tăng, không có giới hạn) mới là phần đáng tiêu diệt.

"Quy tắc chỉ có ba dòng," Tom nói. "Lẽ ra tôi nên đặt nó trên mọi bucket ngay khi tạo." Anh cập nhật danh sách kiểm tra tạo bucket: mọi bucket S3 mới đều được áp dụng một quy tắc dọn dẹp multipart upload theo mặc định.

**Ba Lớp Bảo Mật: Một Bản Tóm Tắt Nhanh Trước Khi Rẽ Hướng**

"Và sẽ thế nào nếu ai đó cố đột nhập và xóa các nhật ký kiểm toán?" Priya lại hỏi — lần này trong bối cảnh một mô hình mối đe dọa cụ thể. "Không chỉ là một quy tắc lifecycle bị cấu hình sai. Một nội gián ác ý. Một khóa IAM bị xâm phạm với quyền ghi."

Cả nhóm đã có sẵn câu trả lời — họ chỉ chưa áp dụng chúng cho bucket này. Ba lớp, mỗi lớp đã được đề cập trước đó trong sách, mỗi lớp giải quyết một vector đe dọa khác nhau:

**Versioning** (chương 5) khiến việc xóa có thể đảo ngược — một thao tác DELETE trở thành một delete marker, và các phiên bản trước vẫn có thể khôi phục được. Với dữ liệu ghi-một-lần như biên lai đơn hàng, chi phí lưu trữ phụ trội là tối thiểu: chỉ luôn có một phiên bản cho mỗi đối tượng.

**S3 Object Lock** (chương 5) khiến các đối tượng thực sự bất biến — lưu trữ WORM mà ngay cả một khóa admin cũng không thể xóa trong thời gian lưu giữ. Với các biên lai, với yêu cầu lưu giữ thuế 7 năm, cả nhóm chọn chế độ Compliance: không một cấu hình sai lifecycle, không một lỗi IAM, không một thông tin xác thực bị xâm phạm nào có thể xóa chúng trước khi kiểm toán viên yêu cầu. Và Object Lock cùng tồn tại với các chuyển đổi lifecycle — một quy tắc chuyển các biên lai sang Glacier Deep Archive vẫn hoạt động; dữ liệu trở nên rẻ hơn và vẫn bất biến.

**Sự kiện dữ liệu CloudTrail S3** (chương 16-17) cho bạn biết điều gì đã xảy ra với dữ liệu: mọi GET, PUT, DELETE, và COPY được ghi lại với ai, từ đâu, và khi nào — nguyên liệu thô mà GuardDuty (chương 17) dùng để cảnh báo về các bất thường.

"Versioning để khôi phục tai nạn. Object Lock cho tính bất biến tuân thủ. CloudTrail cho điều tra pháp y," Priya tóm tắt. "Chúng ta đã đề cập từng cái một cách riêng lẻ. Quyết định mới hôm nay là bật cả ba cho bucket này."

**Cross-Region Replication: Hồ Sơ Đơn Hàng Như Một Phương Án Khôi Phục Sau Thảm Họa**

Bucket biên lai đơn hàng của Nimbus nằm ở us-west-2. Đó là có chủ đích — us-west-2 là nơi ứng dụng chạy. Nhưng "ứng dụng ở us-west-2" và "tất cả hồ sơ đơn hàng chỉ ở us-west-2" là hai hồ sơ rủi ro khác nhau.

Nếu Nimbus cần kích hoạt một site khôi phục sau thảm họa ở us-east-1, các hồ sơ đơn hàng cũng cần ở đó. Chờ đến giữa một sự cố cấp khu vực mới sao chép chúng không phải là một kế hoạch khôi phục.

Priya đề xuất **Cross-Region Replication (CRR)** cho bucket biên lai đơn hàng. Quy tắc:

```
Nguồn: nimbus-order-receipts (us-west-2)
Đích: nimbus-order-receipts-dr (us-east-1)
Replication: Tất cả đối tượng
Lớp lưu trữ ở đích: S3 Standard-IA (rẻ hơn — đây là bản sao DR, hiếm khi được truy cập)
```

Cơ chế đã quen thuộc từ chương 5: sao chép bất đồng bộ các thao tác ghi mới (hầu hết các đối tượng trong vòng 15 phút; một SLA được đảm bảo đòi hỏi phải trả tiền cho **S3 Replication Time Control**), yêu cầu versioning trên cả hai bucket, một IAM role với quyền đọc-nguồn/ghi-đích. Chi tiết đáng chú ý trong quy tắc trên: đích dùng một *lớp lưu trữ khác* với nguồn — Standard-IA cho bản sao DR, thay vì trả tiền cho một bản sao Standard thứ hai hiếm khi được đọc. Và điều kiện tiên quyết versioning không tốn thêm gì — họ đã bật versioning cho việc khôi phục tai nạn rồi. (Người anh em của CRR, **Same-Region Replication (SRR)**, sao chép các đối tượng giữa các bucket trong *cùng* một khu vực — hữu ích cho một bản sao tuân thủ ở một tài khoản riêng, tổng hợp nhật ký, hoặc các môi trường kiểm thử được gieo từ dữ liệu sản xuất.)

Một cạm bẫy mà Priya nêu ra trước khi ai đó vấp phải: replication **không có tính hồi tố**. Các đối tượng đã tồn tại trong bucket khi bạn bật quy tắc sẽ không được sao chép — chỉ các thao tác ghi mới mới được. Các nhóm bật CRR mong đợi tất cả dữ liệu hiện có của họ xuất hiện ở đích, rồi phát hiện ra bucket DR gần như trống rỗng. Đối với các đối tượng đã tồn tại từ trước, bạn chạy **S3 Batch Replication**, một thao tác riêng biệt áp dụng các quy tắc replication cho các đối tượng vốn đã ở đó. Nimbus chạy nó một lần để gieo cho bucket DR 0.8 TB biên lai hiện có.

"Còn các delete marker?" Priya hỏi. "Nếu ai đó xóa một biên lai ở us-west-2, nó có sao chép việc xóa sang us-east-1 không?"

Theo mặc định thì không — trong các cấu hình replication hiện tại (lược đồ V2 mà console tạo ra), **các delete marker không được sao chép**. Ai đó xóa một biên lai ở us-west-2, và bản sao us-east-1 vẫn tiếp tục phục vụ nó như thể không có gì xảy ra. Nếu bạn *muốn* bucket DR phản chiếu các thao tác xóa, bạn bật replication delete marker một cách rõ ràng trên quy tắc (không được hỗ trợ trên các quy tắc có filter thẻ) — đó là mặc định trong lược đồ V1 cũ, mà các tài liệu cũ hơn vẫn mô tả. Dù bằng cách nào, các lần hết hạn lifecycle không bao giờ sao chép các delete marker của chúng.

Tuy nhiên replication vẫn *không* phải là một giải pháp sao lưu — vì những lý do ngược lại: nó sẽ không bảo vệ chống lại việc xóa phiên bản vĩnh viễn hay việc ghi đè ác ý được sao chép sang bản phản chiếu, và nó không có ngữ nghĩa lưu giữ. Để sao lưu thực sự, hãy ghép versioning với Object Lock, hoặc dùng AWS Backup.

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi.

Lưu trữ cho 0.8 TB trong S3 Standard-IA ở us-east-1: $10.00/tháng. Cộng với truyền dữ liệu replication (tính phí mỗi GB được truyền liên khu vực): tối thiểu ở khối lượng ghi hiện tại của họ. Tổng chi phí phụ trội: khoảng $10-11/tháng cho một bản sao liên khu vực hoàn chỉnh của tất cả hồ sơ đơn hàng.

Tom ghi điều này lại mà không phàn nàn.

**S3 Storage Lens: Nhìn Thấy Bức Tranh Toàn Cảnh**

Tom đã làm cuộc kiểm toán của mình một cách thủ công — mở console AWS từng bucket một, chạy các lệnh AWS CLI để đếm đối tượng, kiểm tra trình khám phá thanh toán để xem chi phí lưu trữ theo từng bucket. Anh mất gần cả một buổi chiều để xây dựng bảng tính đó.

**S3 Storage Lens** là công cụ AWS thay thế cho quy trình thủ công đó. Nó cung cấp khả năng hiển thị trên toàn tổ chức về việc sử dụng và hoạt động S3 trên tất cả các bucket, tất cả các tài khoản, và tất cả các khu vực — trong một bảng điều khiển duy nhất.

Các chỉ số quan trọng nhất cho việc tối ưu hóa chi phí:

**Non-current version bytes**: Bao nhiêu dung lượng lưu trữ bị tiêu thụ bởi các phiên bản cũ hơn (khi versioning được bật). Versioning là thiết yếu cho sự an toàn, nhưng nếu một tài liệu được cập nhật thường xuyên, các phiên bản cũ hơn tích lũy lại. Một quy tắc lifecycle để hết hạn các phiên bản không-hiện-hành sau 30 ngày ngăn chặn sự phình to phiên bản.

**Incomplete multipart upload bytes**: Chính xác là vấn đề mà Leo đã gây ra với bài kiểm tra tải, được hiển thị tự động. Nếu không có Storage Lens, Tom phải tự biết để tìm các multipart upload chưa hoàn thành. Với Storage Lens, chúng hiện ra trong bảng điều khiển như một mục hàng.

**% yêu cầu trả về 403**: Một đợt tăng vọt các phản hồi 403 (Forbidden) trên một bucket lẽ ra phải truy cập công khai được có thể chỉ ra một bucket policy bị cấu hình sai. Một đợt tăng vọt trên một bucket riêng tư có thể chỉ ra một nỗ lực quét hoặc dò xét. Dù bằng cách nào, đó là một tín hiệu đáng để điều tra.

**Kích thước đối tượng trung bình**: Một bucket gồm các đối tượng nhỏ (trung bình 2KB) hành xử khác với một bucket gồm các đối tượng lớn (trung bình 50MB) về mặt kinh tế của Intelligent-Tiering, chi phí yêu cầu, và hiệu năng truy vấn cho Athena.

S3 Storage Lens có một tầng miễn phí bao gồm các chỉ số thiết yếu. Các chỉ số nâng cao (thống kê yêu cầu, các lens group để lọc) có chi phí phụ trội mỗi triệu đối tượng mỗi tháng — nhỏ so với khoản tiết kiệm mà nó cho phép.

"Tại sao chúng ta không dùng cái này ngay từ đầu?" Maya hỏi.

"Chúng ta không có 4.2 terabyte ngay từ đầu," Tom nói. "Ở quy mô nhỏ, một bảng tính là đủ. Ở quy mô này, chính quy mô trở thành lý lẽ cho công cụ."

Đây là một chủ đề lặp đi lặp lại trong kiến trúc Nimbus: công cụ phù hợp cho một quy mô nhất định không phải lúc nào cũng là công cụ phù hợp cho quy mô tiếp theo. S3 Storage Lens đáng được cấu hình ngay khi việc sử dụng S3 của bạn vượt quá những gì bạn có thể kiểm toán thủ công trong một buổi chiều — đó là khoảng thời điểm mà khoản tiết kiệm nó cho phép bắt đầu vượt một cách đáng kể thời gian nó tiết kiệm được.

## Điểm Mạnh và Hạn Chế

**Tại sao các lớp lưu trữ S3 quan trọng**:

- Giảm chi phí đáng kể mà không hy sinh độ bền hay tính khả dụng cho những gì thực sự được truy cập
- Lifecycle policy tự động hóa toàn bộ quy trình — không gánh nặng vận hành
- S3 Intelligent-Tiering loại bỏ nhu cầu dự đoán các mẫu truy cập

**Nơi nó trở nên phức tạp**:

- Các khoản phí thời lượng lưu trữ tối thiểu áp dụng cho các lớp Glacier (90 ngày cho Glacier Instant, 180 ngày cho Deep Archive) — xóa sớm vẫn phát sinh khoản phí tối thiểu
- Các phí truy xuất có thể khiến bạn bất ngờ nếu bạn truy cập dữ liệu lưu trữ thường xuyên
- Các chuyển đổi lifecycle cần thời gian — các đối tượng không được di chuyển tức thì sau khi quy tắc kích hoạt
- Intelligent-Tiering bỏ qua các đối tượng dưới 128KB — không phí, nhưng cũng không phân tầng; và các quy tắc lifecycle bỏ qua chúng theo mặc định trừ khi bạn ghi đè kích thước đối tượng tối thiểu

## Tóm Tắt

Hệ thống tự động hóa quy trình từ chương 22 đã tối ưu hóa cách Nimbus xử lý các yêu cầu. Chương này tối ưu hóa những gì Nimbus trả cho dữ liệu mà nó đang giữ nhưng không truy cập. Nguyên tắc là như nhau: ngừng trả tiền cho lớp sai.

- S3 có tám lớp lưu trữ: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — cộng thêm Express One Zone (chuyên biệt độ trễ thấp, một AZ).
- **Lifecycle policy** tự động hóa các chuyển đổi giữa các lớp lưu trữ dựa trên tuổi — định nghĩa một lần, S3 xử lý nó mãi mãi.
- **S3 Intelligent-Tiering** tự động di chuyển các đối tượng giữa các tầng dựa trên các mẫu truy cập thực tế — dùng cho các khối lượng công việc không thể dự đoán với các đối tượng lớn hơn 128KB. Các đối tượng nhỏ hơn không được giám sát hay tự động phân tầng (và không phải trả phí giám sát) — chúng ở lại tầng Frequent Access.
- **Truy xuất Glacier** đòi hỏi một yêu cầu khôi phục cho các tầng Flexible và Deep Archive. Hãy lên kế hoạch cho thời gian truy xuất (vài phút đến 12 giờ) trước khi lưu trữ bất kỳ dữ liệu nào có SLA cho việc truy xuất.
- **Các multipart upload chưa hoàn thành** tích lũy âm thầm và phát sinh phí lưu trữ. Thêm một quy tắc lifecycle để xóa các phần chưa hoàn thành sau 7 ngày trên mọi bucket.
- **Ba lớp bảo mật**: versioning (xóa có thể đảo ngược), Object Lock (tính bất biến cho tuân thủ), sự kiện dữ liệu CloudTrail (điều tra pháp y và phát hiện bất thường).
- **Cross-Region Replication (CRR)**: sao chép hồ sơ đơn hàng sang một khu vực DR tự động. Đòi hỏi versioning trên cả hai bucket. Cấu hình xem các delete marker có được sao chép hay không dựa trên việc bản sao DR là một bản phản chiếu hay một bản sao lưu.
- **Multipart upload** là bắt buộc cho các đối tượng > 5GB và được khuyến nghị cho bất cứ thứ gì > 100MB.
- **S3 Object Lock** cung cấp lưu trữ WORM cho các tình huống tuân thủ — chế độ Governance có thể bị ghi đè bởi admin; chế độ Compliance không thể bị ghi đè bởi bất kỳ ai.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Tối Ưu Chi Phí (Lĩnh vực 4, Nhiệm vụ 4.1)*

- **Các tín hiệu chọn lớp lưu trữ**:
  - "Truy cập thường xuyên" → Standard
  - "Truy cập một lần mỗi tháng, cần truy xuất tức thì" → Standard-IA
  - "Có thể chấp nhận hàng giờ thời gian truy xuất, hiếm khi truy cập" → Glacier Flexible Retrieval
  - "Tuân thủ quy định, lưu giữ 7+ năm, không bao giờ truy cập" → Glacier Deep Archive
  - "Mẫu truy cập không xác định hoặc thay đổi" → Intelligent-Tiering
- **Các mô hình lifecycle policy trong đề thi**: "tự động giảm chi phí lưu trữ khi dữ liệu cũ đi," "chuyển sang archive sau 90 ngày" → lifecycle policy.
- **Intelligent-Tiering và các đối tượng nhỏ**: các đối tượng dưới 128KB không được giám sát, không phải trả phí giám sát, và không bao giờ tự động phân tầng — chúng ở lại Frequent Access. Các quy tắc lifecycle cũng bỏ qua các đối tượng dưới 128KB theo mặc định (có thể ghi đè). Đề thi có thể kiểm tra một trong hai sự thật.
- **Yêu cầu của CRR**: Versioning phải được bật trên cả bucket nguồn và đích. Nguồn và đích phải ở các khu vực khác nhau.
- **S3 Object Lock**: "WORM," "bất biến," "SEC 17a-4," "không thể xóa hoặc sửa đổi" → Object Lock. Chế độ Governance (có thể bị ghi đè bởi admin). Chế độ Compliance (không thể bị ghi đè bởi bất kỳ ai, kể cả root).
- **Khôi phục Glacier**: Các đối tượng trong Glacier không có sẵn ngay lập tức. Bạn phải "khôi phục" một bản sao về S3 Standard để truy cập. Bản sao đã khôi phục là tạm thời (bạn đặt thời lượng). Bản gốc vẫn ở trong Glacier.

## Bài Tập

**Bài tập 1 — Ôn lại**

Giải thích sự khác biệt giữa S3 Standard-IA và S3 Glacier Instant Retrieval. Mẫu truy cập nào khiến mỗi cái phù hợp?

*(Gợi ý: Hãy nghĩ về việc bạn truy cập dữ liệu thường xuyên đến mức nào và bạn cần nó nhanh đến mức nào khi truy cập.)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty tạo ra 500GB nhật ký ứng dụng mỗi ngày. Nhật ký được truy vấn nhiều trong 7 ngày đầu (gỡ lỗi và giám sát). Sau 7 ngày, nhật ký hiếm khi được truy cập nhưng phải có sẵn trong vòng 30 phút nếu cần. Sau 1 năm, nhật ký phải được lưu giữ để tuân thủ nhưng không bao giờ được truy cập. Công ty cần giảm thiểu chi phí lưu trữ trong khi đáp ứng các yêu cầu này.

Lifecycle policy S3 nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Lưu trong S3 Standard 7 ngày; chuyển sang S3 Glacier Deep Archive sau 7 ngày; hết hạn sau 365 ngày  
B) Lưu trong S3 Standard 7 ngày; chuyển sang S3 Standard-IA sau 7 ngày; chuyển sang S3 Glacier Flexible Retrieval sau 365 ngày  
C) Lưu tất cả nhật ký trong S3 Intelligent-Tiering từ ngày 1  
D) Lưu trong S3 Standard 7 ngày; chuyển sang S3 Glacier Instant Retrieval sau 7 ngày; chuyển sang S3 Glacier Deep Archive sau 365 ngày

**Gợi ý 1**: "Có sẵn trong vòng 30 phút" loại trừ lớp lưu trữ nào?

**Gợi ý 2**: Deep Archive mất 12 giờ để truy xuất — không đáp ứng yêu cầu 30 phút cho ngày 7-365.

**Gợi ý 3**: Sau 365 ngày, thời gian truy xuất không quan trọng (không bao giờ truy cập), nên lựa chọn rẻ nhất được áp dụng.

**Đáp án**: D

**Giải thích**: S3 Standard trong 7 ngày xử lý việc truy cập thường xuyên. Glacier Instant Retrieval cung cấp truy cập mili-giây cho ngày 7-365 — đáp ứng yêu cầu 30 phút với chi phí thấp hơn đáng kể so với Standard-IA. Sau 365 ngày, Glacier Deep Archive là lựa chọn rẻ nhất cho dữ liệu không bao giờ được truy cập.

**Tại sao không phải A?** Glacier Deep Archive mất 12 giờ để truy xuất — không đáp ứng yêu cầu "có sẵn trong 30 phút" cho ngày 7-365.

**Tại sao không phải B?** Standard-IA thậm chí không thể là điểm dừng đầu tiên ở đây: S3 yêu cầu các đối tượng phải đủ 30 ngày tuổi trong Standard trước khi một quy tắc lifecycle có thể chuyển chúng sang Standard-IA hoặc One Zone-IA — nên "Standard-IA sau 7 ngày" là một quy tắc không hợp lệ. (Quy tắc 30 ngày không áp dụng cho các lớp Glacier, đó chính xác là lý do D hoạt động.) Và kể cả gạt điều đó sang một bên, Glacier Instant Retrieval rẻ hơn đáng kể cho dữ liệu hiếm khi được truy cập sau ngày 7.

**Tại sao không phải C?** Intelligent-Tiering có một phí giám sát mỗi đối tượng và có thể không di chuyển nhật ký sang các tầng archive một cách quyết liệt như các quy tắc lifecycle rõ ràng. Với một khối lượng lớn nhật ký có mẫu truy cập có thể dự đoán, các quy tắc lifecycle rõ ràng tiết kiệm chi phí hơn.

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Tối Ưu Chi Phí — Nhiệm vụ 4.1*

**Bài tập 3 — Thử thách Kiến trúc** *(Tùy chọn)*

Nimbus có ba loại dữ liệu S3 với các đặc điểm khác nhau:

- Ảnh nhà hàng: tải lên một lần, được khách hàng truy cập nhiều lần, không bao giờ xóa
- Biên lai đơn hàng: được khách hàng truy cập trong tháng đầu tiên, giữ 7 năm cho mục đích thuế
- Các bản xuất phân tích: tạo ra hàng ngày, được phân tích trong tuần kế tiếp, giữ 2 năm

Thiết kế một lifecycle policy cho mỗi loại. Với ảnh nhà hàng, Intelligent-Tiering có hợp lý không? Với biên lai đơn hàng, lớp lưu trữ nào bao phủ khoảng từ 1 tháng đến 7 năm? Với các bản xuất phân tích, bạn sẽ cấu trúc bucket như thế nào để áp dụng các policy khác nhau cho các tiền tố khác nhau?

*(Không có một câu trả lời đúng duy nhất. Mục tiêu là luyện tập việc chọn lớp lưu trữ cho dữ liệu thực tế.)*

## Cảnh Sau Tín Dụng

Tom đã triển khai các lifecycle policy.

Leo đã giúp cấu hình quy tắc đầu tiên. "Sẽ ổn thôi," anh nói. "Thời lượng lưu trữ tối thiểu chỉ áp dụng nếu chúng ta xóa sớm — và chúng ta không xóa gì cả." Anh kiểm tra các yêu cầu về thời lượng tối thiểu của Glacier giữa chừng. "Thật ra, để tôi đọc lại cái này."

Trên một bucket khác — các bản xuất tạm thời để dàn dựng phân tích — anh suýt kết hợp một chuyển đổi 30 ngày sang Glacier Instant Retrieval với một quy tắc hết hạn 60 ngày. Thời lượng lưu trữ tối thiểu cho Glacier Instant là 90 ngày: các đối tượng đó sẽ vào Glacier ở ngày 30 và bị xóa ở ngày 60, và S3 vẫn sẽ tính đủ 90 ngày cho từng cái một — trả mức giá archive cho dung lượng lưu trữ không còn tồn tại nữa. Anh bỏ hẳn chuyển đổi Glacier cho bucket đó; dữ liệu bị xóa ở ngày 60 không bao giờ sống đủ lâu để khấu hao một mức tối thiểu 90 ngày. Policy biên lai an toàn như thiết kế: chuyển sang Standard-IA ở 90 ngày, Glacier Instant Retrieval ở 365 ngày, Glacier Flexible Retrieval ở 540 ngày, Glacier Deep Archive ở 2,555 ngày.

Anh cũng đặt quy tắc dọn dẹp multipart upload trên mọi bucket. Không phải vì có thêm các lần tải lên bị bỏ rơi — không có — mà vì sẽ có. Các bài kiểm tra tải sẽ diễn ra. Các đợt triển khai sẽ thất bại giữa chừng. Quy tắc rẻ hơn so với trí nhớ cần thiết để nhớ dọn dẹp thủ công.

Hóa đơn S3 giảm từ $847 xuống $198 tháng tiếp theo.

Anh in bản so sánh và để trên bàn Maya mà không nói gì.

Maya nhìn nó. Rồi nhìn ngày tháng. Rồi nhìn Tom.

"Ba tuần," cô nói.

"Một buổi chiều để thiết kế các policy," anh nói. "Một giờ để triển khai chúng. Ba tuần để thấy chu kỳ thanh toán đầy đủ đầu tiên."

"Giảm ba phần tư chi phí S3."

"Cho dữ liệu chúng ta không truy cập."

"Còn cross-region replication thì sao?" Leo hỏi.

"Thêm mười đô la một tháng," Tom nói. "Cho một bản sao hoàn chỉnh của mọi biên lai đơn hàng ở một khu vực thứ hai."

"Đó là quyết định khôi phục sau thảm họa rẻ nhất chúng ta từng đưa ra."

Maya nhìn lại các con số.

"Tom," cô nói, "tôi muốn anh làm cuộc rà soát này cho mọi dịch vụ AWS chúng ta dùng. Lưu trữ, tính toán, mạng. Tìm ra sự lãng phí."

Anh đã quay lại bàn làm việc.

"Tôi đã bắt đầu từ tuần trước," anh nói.

Trong chương tiếp theo: tầng cơ sở dữ liệu có phiên bản riêng của cuộc trò chuyện này, và Aurora là câu trả lời mà Tom không ngờ mình lại thích.
