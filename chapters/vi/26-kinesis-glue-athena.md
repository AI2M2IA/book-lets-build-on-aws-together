# Chương 26: Hiểu Được Mọi Thứ

Tom đang nhìn chằm chằm vào một bản in.

Đó là hai trang số liệu: số lượng đơn hàng, tổng doanh thu, các dấu thời gian, các mã khu vực. Anh đã nhờ Leo tổng hợp mọi thứ có sẵn về các mẫu đặt hàng của thứ Sáu. Leo đã dành một giờ viết một script nối ba nguồn dữ liệu khác nhau — DynamoDB, CloudWatch logs, và một bản xuất analytics S3 — và đây là thứ kết quả ra.

Các con số đều ở đó. Chúng chẳng nói cho anh điều gì.

Anh có thể thấy rằng 847 đơn hàng đã được đặt vào thứ Sáu. Anh không thể nói khi nào chúng được đặt, nhà hàng nào bận rộn nhất, hay giờ cao điểm là lúc nào. Thông tin đó nằm trong dữ liệu. Nó chỉ là vô hình.

---

Toàn bộ việc tối ưu hóa mạng từ chương 25 đã làm cho cơ sở hạ tầng của Nimbus nhanh hơn và rẻ hơn. Nhưng dữ liệu mà cơ sở hạ tầng đó đang tạo ra — trong DynamoDB, trong CloudWatch logs, trong bản xuất analytics S3 chạy một lần mỗi đêm — đang nằm ở ba nơi khác nhau, với ba định dạng khác nhau, không kết nối với bất cứ thứ gì mà Tom thực sự có thể dùng.

Câu hỏi của Maya làm cho nó cụ thể. "Giờ đặt hàng bận rộn nhất vào thứ Sáu của chúng ta là lúc nào?"

Leo nhìn cô. "Điều đó không có trong dashboard của chúng ta."

"Chúng ta có thể thêm nó không?"

"Dữ liệu nằm trong DynamoDB. Và trong CloudWatch logs. Và trong S3 từ job xuất analytics." Leo dừng lại. "Ở ba nơi khác nhau, với ba định dạng khác nhau."

Maya thêm vào: "Và việc xuất analytics chỉ chạy một lần mỗi đêm. Nếu bạn muốn dữ liệu thứ Sáu, bạn sẽ phải đợi đến sáng thứ Bảy."

Tom nhìn vào bản in. "Vậy chúng ta có dữ liệu. Chúng ta chỉ không thể dùng nó."

Câu nói đó mô tả một nửa của analytics hiện đại.

---

**Tấm Bảng Trắng**

Maya đến văn phòng sớm và đã lấp đầy nửa tấm bảng trắng vào lúc Leo đến.

Bảy câu hỏi, được viết thành hai cột, tất cả đều là các câu hỏi kinh doanh, không câu nào có thể trả lời từ các dashboard hiện tại:

1. Nhà hàng nào có tỷ lệ hủy đơn cao nhất trong 30 ngày đầu tiên?
2. Thời gian trung bình giữa khi một nhà hàng nhận được thông báo đơn hàng và khi xác nhận nó là bao lâu? Điều này thay đổi như thế nào theo nhà hàng và theo ngày trong tuần?
3. Thành phố nào có tỷ lệ khách hàng đặt lại từ cùng một nhà hàng trong vòng 14 ngày cao nhất?
4. Bao nhiêu phần trăm đơn hàng được đặt trong phiên đầu tiên của ứng dụng so với các phiên quay lại?
5. Danh mục menu nào tạo ra doanh thu cao nhất mỗi nhà hàng?
6. Mối tương quan giữa thời gian phản hồi của nhà hàng và tỷ lệ đặt lại của khách hàng là gì?
7. Khối lượng đơn hàng thay đổi như thế nào trong 48 giờ trước và sau khi một đối tác nhà hàng đăng bài lên mạng xã hội?

"Chúng ta có thể trả lời câu nào trong số này không?" cô hỏi.

Leo nhìn vào danh sách. Anh nhìn vào dashboard hiện tại — số lượng đơn hàng, tổng doanh thu, các nhà hàng đang hoạt động.

"Câu số một," anh nói chậm rãi. "Một phần. Chúng ta có các bản ghi hủy đơn. Nhưng chúng ta sẽ cần nối chúng với các ngày onboarding nhà hàng, và cái đó nằm ở một hệ thống khác."

"Câu số hai?" Tom hỏi.

"Chúng ta lưu dấu thời gian thông báo. Chúng ta lưu dấu thời gian xác nhận. Chúng ở các bảng khác nhau với các định dạng khác nhau. Chúng ta sẽ cần JOIN chúng và tính phần chênh lệch."

"Vậy dữ liệu tồn tại," Maya nói.

"Dữ liệu tồn tại," Leo xác nhận. "Chúng ta chỉ không có cách nào để truy vấn xuyên qua nó."

"Khoan — nhưng *tại sao* chúng ta không thể chỉ truy vấn cơ sở dữ liệu?" Maya hỏi. "Chúng ta có PostgreSQL. Chúng ta có tất cả dữ liệu này."

"Vì dữ liệu nằm ở ba nơi," Leo nói. "Các sự kiện đơn hàng nằm trong DynamoDB. Các dấu thời gian thông báo nằm trong CloudWatch logs. Các ngày onboarding nằm trong cơ sở dữ liệu RDS PostgreSQL. Và một số trong đó — các bản xuất analytics — nằm trong S3 dưới dạng các tệp JSON mà chưa ai từng nối với bất cứ thứ gì."

Tom nhìn vào tấm bảng trắng. "Chúng ta đã tạo ra dữ liệu này suốt 18 tháng," anh nói. "Chúng ta đã bay mù suốt 18 tháng."

"Không phải mù," Maya nói. "Chỉ là cận thị. Chúng ta có thể thấy những gì ngay trước mắt mình. Chúng ta không thể thấy các mô hình."

Đó là cách diễn đạt đúng. Từng điểm dữ liệu riêng lẻ đều ở đó. Hệ thống để kết nối chúng thì không.

**Ba Vấn Đề Khác Nhau**

Vấn đề dữ liệu của Nimbus có ba chiều:

**Streaming thời gian thực**: Các đơn hàng đang được đặt ngay bây giờ. Bạn muốn xem một dashboard trực tiếp về tốc độ đặt hàng — bao nhiêu mỗi phút, theo khu vực, theo nhà hàng. Dữ liệu cần được xử lý khi nó đến.

**Chuyển đổi dữ liệu**: Dữ liệu nằm trong S3 từ nhiều hệ thống khác nhau, với các định dạng khác nhau (JSON, CSV, Parquet). Trước khi bạn có thể phân tích nó, bạn cần chuẩn hóa nó — cùng schema, cùng định dạng, được làm sạch, được nối với dữ liệu tham chiếu.

**Phân tích ad-hoc**: Một khi dữ liệu được tổ chức, bạn muốn chạy các truy vấn SQL trên đó mà không cần tải nó vào một cơ sở dữ liệu trước. "Cho tôi 10 nhà hàng có doanh thu cao nhất trong 30 ngày qua." Mà không cần tải dữ liệu vào một cơ sở dữ liệu.

Mỗi vấn đề trong số này là một vấn đề riêng biệt. AWS có một dịch vụ chuyên dụng cho mỗi vấn đề.

**Stream Thời Gian Thực: Một Băng Ticker Cho Dữ Liệu**

Hãy tưởng tượng một máy ticker tape — loại in giá cổ phiếu trên một cuộn giấy liên tục. Giá cả được in ra khi chúng thay đổi. Mọi người muốn biết giá hiện tại đều có thể đọc băng. Không ai phải chờ bất kỳ ai khác; băng cứ tiếp tục in bất kể có bao nhiêu người đang đọc nó.

Đó là mô hình cho streaming dữ liệu thời gian thực. Các producer gửi dữ liệu khi nó diễn ra. Nhiều consumer có thể đọc stream đồng thời, mỗi cái với tốc độ riêng của nó, mỗi cái nhận được bức tranh đầy đủ.

**Amazon Kinesis Data Streams** là chiếc máy đó cho Nimbus. Khi một đơn hàng được đặt, ứng dụng xuất bản một sự kiện vào một Kinesis stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Các consumer của stream này:

- Một dashboard thời gian thực (đọc các sự kiện khi chúng đến, cập nhật các chỉ số)
- Một Lambda phát hiện gian lận (tìm các mẫu đặt hàng bất thường)
- Một stream tới S3 để lưu trữ lâu dài

**Các khái niệm Kinesis Data Streams**:

- **Shard**: Đơn vị năng lực cơ bản. Một shard xử lý 1 MB/s ghi, 2 MB/s đọc.
- **Thời gian lưu giữ**: Dữ liệu ở trong stream 24 giờ (mặc định), có thể mở rộng tới **365 ngày** (1 năm) với Extended Data Retention.
- **Số thứ tự**: Mỗi bản ghi có một số thứ tự. Các consumer theo dõi vị trí của họ trong stream.

**Amazon Data Firehose** (trước đây là **Kinesis Data Firehose**): Dịch vụ phân phối được quản lý giữa các producer streaming và các đích đến như S3, Redshift, và OpenSearch. Nó tự động đệm, nén, chuyển đổi, và phân phối dữ liệu.

Đối với Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (định dạng Parquet, được nén, được phân vùng theo ngày).

"Tôi đã triển khai nó rồi — à." Leo đã đặt số lượng shard là một mà không tính toán thông lượng ghi trước. Ở khối lượng đơn hàng của Nimbus, một shard là ổn. Anh xác nhận điều này trước khi ai đó nhận ra anh đã đoán.

**Người Phiên Dịch: Hiểu Được Dữ Liệu Thô**

Dữ liệu trong S3 là thô. Trước khi bạn có thể phân tích nó một cách hiệu quả, bạn cần khám phá những gì có ở đó, chuyển đổi nó thành một định dạng nhất quán, nối các tập dữ liệu khác nhau với nhau, và xử lý các bản ghi lỗi và các giá trị thiếu.

Đó là công việc cho một lớp phiên dịch chuyên dụng.

**AWS Glue** là một dịch vụ ETL (Extract, Transform, Load) được quản lý hoàn toàn. Nó có hai thành phần chính:

**Glue Data Catalog**: Một kho metadata mô tả dữ liệu S3 của bạn — những bảng nào tồn tại, chúng có những cột nào, các tệp dữ liệu nằm ở đâu. Nó giống như một tủ phiếu mục lục cho data lake của bạn.

**Glue Crawlers**: Các agent tự động quét S3, suy ra schema, và điền vào Data Catalog. Chạy một crawler trên bucket S3 của bạn và 10 phút sau bạn có một danh mục tất cả các bảng của mình.

**Glue Jobs**: Các job Spark/Python serverless thực hiện việc chuyển đổi thực tế. Bạn viết logic chuyển đổi (hoặc dùng công cụ ETL trực quan của Glue), và Glue chạy nó trên cơ sở hạ tầng được quản lý.

Đối với Nimbus:

1. Glue Crawler quét dữ liệu đơn hàng trong S3 → tạo một định nghĩa bảng trong Glue Data Catalog
2. Glue Job chuyển đổi các sự kiện đơn hàng JSON thô thành một định dạng Parquet sạch, được phân vùng
3. Dữ liệu đã chuyển đổi được ghi trở lại vào S3 theo một bố cục được tối ưu hóa cho truy vấn

**Khi ETL Hỏng: Vấn Đề Tiến Hóa Schema**

Pipeline Glue chạy trơn tru trong ba tuần đầu. Rồi đối tác nhà hàng #412 thêm một trường mới vào bản xuất menu của họ: `allergen_tags`. Trường này là một mảng các chuỗi — `["gluten", "dairy", "nuts"]` — và nó xuất hiện trong bản xuất dữ liệu hằng đêm của nhà hàng.

Schema của Glue job là nghiêm ngặt. Nó được viết để mong đợi các trường cụ thể trong JSON đơn hàng. Khi nó gặp `allergen_tags` — một trường không có trong schema — Glue job thất bại.

Sáu giờ dữ liệu đơn hàng từ 47 nhà hàng (tất cả dùng cùng định dạng xuất menu như đối tác #412) tích lũy trong S3 mà không được xử lý. Lần chạy Glue hằng đêm lẽ ra phải làm cho các đơn hàng đêm qua có thể truy vấn được vào buổi sáng thay vào đó đã dừng lại lúc 2:47 sáng và ghi một bản ghi thất bại vào CloudWatch.

Tom phát hiện ra nó khi anh thử chạy một truy vấn Athena lúc 9 giờ sáng và nhận `0 rows returned` cho 12 giờ trước đó.

"ETL hỏng vì dữ liệu nguồn thay đổi?" Maya hỏi, khi Leo giải thích chuyện gì đã xảy ra.

"ETL hỏng vì ETL không biết cách xử lý một thay đổi schema," Leo nói. "Chúng ta đã viết một job nghiêm ngặt mong đợi chính xác các trường này. Khi một trường mới xuất hiện, nó hoảng loạn."

"Và sẽ thế nào nếu ai đó cố đột nhập thông qua một thay đổi schema?" Priya hỏi. "Một đối tác nhà hàng ác ý cố tình gửi các trường không mong đợi để làm sập pipeline?"

Câu hỏi đáng để cân nhắc. Một pipeline ETL sập khi gặp đầu vào không mong đợi là một vector từ-chối-dịch-vụ: gửi một định dạng dữ liệu bất thường, làm sập pipeline, và nhà hàng đó (cùng tất cả các nhà hàng khác chia sẻ định dạng đó) ngừng xử lý.

Cách khắc phục có hai phần:

**Tiến hóa schema của Glue**: Dynamic frame của Glue hỗ trợ tiến hóa schema — các trường không có trong schema mong đợi được truyền qua thay vì gây ra thất bại. Bật nó bằng cách dùng DynamicFrame thay vì DataFrame trong script job, với `mergeSchema` được đặt trong các tùy chọn bổ sung. Các trường mới được thêm vào schema tự động trong lần chạy crawler tiếp theo.

```python
# Trước (nghiêm ngặt, hỏng khi gặp trường mới)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Sau (đã bật tiến hóa schema)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Cảnh báo Glue job**: Sự thất bại của pipeline đã âm thầm trong khoảng sáu giờ trước khi Tom nhận ra. Một cảnh báo CloudWatch trên trạng thái lần chạy Glue job (`FAILED`) sẽ đã cảnh báo kỹ sư trực ban trong vòng 5 phút. Chi phí cảnh báo: mười xu một tháng — gần như miễn phí (bản thân chỉ số không tốn gì, và mười cảnh báo đầu tiên thuộc tầng miễn phí).

"Sáu giờ dữ liệu nằm chưa được xử lý trong S3," Leo nói, sau khi chạy lại Glue job thủ công để bắt kịp. "Không có gì bị mất — nhưng analytics tụt lại chừng đó. Nếu chúng ta có cảnh báo, độ trễ sẽ là 30 phút."

Bài học rộng hơn: các pipeline ETL xử lý dữ liệu bên ngoài cần xử lý các thay đổi schema một cách uyển chuyển. Các đối tác bên ngoài — các nhà hàng, các nhà cung cấp thanh toán, các dịch vụ giao hàng — sẽ thay đổi các định dạng dữ liệu của họ. Pipeline phải không dễ vỡ trước những thay đổi đó.

**Lớp Truy Vấn: SQL Trực Tiếp Trên S3**

Giờ dữ liệu đã ở trong S3, ở định dạng Parquet, được phân vùng theo ngày. Mảnh ghép cuối cùng: một cách để đặt câu hỏi cho nó mà không cần tải nó vào một cơ sở dữ liệu trước.

**Amazon Athena** là một dịch vụ truy vấn tương tác, serverless chạy các truy vấn SQL trực tiếp trên dữ liệu S3. Không có cơ sở dữ liệu để cấp phát, không có dữ liệu để tải. Bạn định nghĩa một bảng (hoặc dùng Glue Data Catalog), viết SQL, và Athena thực thi truy vấn trên các tệp S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Giá Athena dựa trên lượng dữ liệu mà một truy vấn quét. Ở us-east-1, us-west-2, và hầu hết các khu vực lớn, các truy vấn SQL tiêu chuẩn tốn $5 mỗi terabyte được quét. Dùng định dạng Parquet (columnar) với partition pruning (`WHERE year='2024' AND month='09'`) có nghĩa là Athena chỉ quét các tệp nó cần, điều này giảm chi phí một cách đáng kể.

"Chúng ta có thể chạy truy vấn này cho 30 ngày dữ liệu," Leo nói, "và nó có thể tốn ít đáng ngạc nhiên nếu chúng ta lưu trữ nó tốt."

"Làm sao nó có thể tốn ít đến vậy?" Maya hỏi. "Nếu nó quét hàng terabyte dữ liệu, làm sao mà không đắt?"

Leo giải thích về Parquet. Trong một định dạng dựa-trên-hàng (JSON, CSV), một truy vấn tìm hai cột trong số hai mươi cột phải đọc cả hai mươi. Trong một định dạng columnar như Parquet, nó chỉ đọc hai cột nó cần. Với một tập dữ liệu 50TB, một truy vấn được tối ưu hóa tốt có thể chỉ quét 200GB. Ở mức $5/TB, đó là một đô la.

"Và sẽ thế nào nếu ai đó vô tình truy vấn cả bảng?" Maya gặng hỏi.

"Đó là rủi ro chi phí thực sự," Leo nói.

Bạn có thể đang tự hỏi: nếu Athena tính phí mỗi terabyte được quét, liệu một truy vấn được viết tồi có thể tạo ra một hóa đơn lớn ngoài dự kiến không? Có — và điều này xảy ra trong các môi trường sản xuất thực tế. Một truy vấn trên một bảng 50TB chưa tối ưu hóa có thể tốn nhiều hơn cả hóa đơn S3 hàng tháng của bạn. Đây là lý do định dạng Parquet và việc phân vùng không phải là các tối ưu hóa tùy chọn — chúng là các biện pháp kiểm soát chi phí. Athena cũng hỗ trợ các giới hạn quét truy vấn theo workgroup giới hạn lượng dữ liệu mà một truy vấn đơn lẻ được phép quét.

"Cho bất kỳ câu hỏi tùy ý nào chúng ta có thể nghĩ ra?" Tom hỏi.

"Bất kỳ câu hỏi nào chúng ta có thể diễn đạt bằng SQL, đối với bất kỳ dữ liệu nào chúng ta đã lưu trong S3."

Tom ngồi xuống trước laptop của Leo và viết truy vấn đầu tiên:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

Truy vấn chạy trong 11 giây. Kết quả: 20 nhà hàng, được sắp xếp theo thời gian xác nhận trung bình nhanh nhất, cùng với tỷ lệ đặt lại của chúng.

Tom nhìn chằm chằm vào kết quả.

Các nhà hàng xác nhận nhanh nhất — những nhà hàng ghi nhận và xác nhận đơn hàng trong trung bình 3-4 phút — có tỷ lệ đặt lại trung bình là 41%. Các nhà hàng xác nhận chậm nhất (thời gian xác nhận trung bình 18-22 phút) có tỷ lệ đặt lại là 13%.

"Các nhà hàng xác nhận nhanh có lượng khách quay lại gấp ba lần," Tom nói.

"Đó là một khoảng cách khổng lồ," Maya nói. "Tại sao tốc độ xác nhận lại ảnh hưởng đến tỷ lệ đặt lại nhiều đến vậy?"

"Vì khách hàng đã đặt một đơn hàng rồi ngồi đó nhìn vào điện thoại của họ," Leo nói. "Nếu xác nhận đến trong 3 phút, họ cảm thấy chắc chắn. Nếu nó đến trong 22 phút — hoặc không bao giờ — họ cảm thấy lo lắng. Sự lo lắng chính là thất bại của sản phẩm, ngay cả khi đồ ăn đến nơi vẫn ổn."

"Đây là một thông tin chuyên sâu về sản phẩm," Maya nói. "Không chỉ là một thông tin chuyên sâu về analytics. Chúng ta nên cho các nhà hàng thấy mốc chuẩn thời gian xác nhận của họ so với mức trung bình của danh mục."

Truy vấn Athena đã quét 1.2 GB dữ liệu (hai tháng đơn hàng ở định dạng Parquet, được phân vùng theo năm và tháng). Chi phí: $0.006.

Nửa xu. Cho một thông tin chuyên sâu kinh doanh đã thay đổi cách Nimbus sẽ thiết kế việc onboarding nhà hàng — những nhà hàng nào nên ưu tiên cho việc huấn luyện thành công, các mục tiêu thời gian xác nhận nào nên đặt như một phần của các SLA đối tác.

Tom có cái nhìn của một người đang tính toán lại giá trị của tất cả dữ liệu mà họ đã vứt bỏ.

"Và sẽ thế nào nếu ai đó cố đột nhập thông qua lớp truy vấn?" Priya hỏi. "Hoặc chỉ là một nhà phân tích vô tình xuất các địa chỉ khách hàng từ dữ liệu đơn hàng thô? PII khách hàng, lịch sử đơn hàng, các bản ghi tài chính — ai kiểm soát những bảng nào thậm chí có thể nhìn thấy được?"

Trước khi cô hỏi xong câu hỏi, Leo cũng đã nhận ra vấn đề vận hành: làm thế nào để bạn ngăn một nhóm chạy một lần quét cả-bảng thảm họa tạo ra một hóa đơn Athena $500 trong một truy vấn duy nhất?

**Athena Workgroups** giải quyết cả hai vấn đề cùng một lúc.

Một workgroup là một cấu hình có tên nhóm các người dùng Athena lại và áp dụng các cài đặt chung: vị trí kết quả truy vấn, mã hóa, và — quan trọng là — các giới hạn quét dữ liệu mỗi-truy-vấn.

```
Workgroup: analytics-team
  Giới hạn quét truy vấn: 10 GB mỗi truy vấn
  Hành động khi vượt giới hạn: Hủy truy vấn

Workgroup: engineering-team
  Giới hạn quét truy vấn: 100 GB mỗi truy vấn
  Hành động khi vượt giới hạn: Chỉ cảnh báo

Workgroup: finance-reports
  Giới hạn quét truy vấn: 1 GB mỗi truy vấn
  Hành động khi vượt giới hạn: Hủy truy vấn
```

Một nhà phân tích trong workgroup `analytics-team` không thể vô tình quét 50TB dữ liệu và tạo ra một khoản phí Athena $250. Truy vấn bị hủy khi nó vượt quá 10GB dữ liệu được quét. Nhà phân tích thấy một thông báo lỗi và biết rằng họ cần thêm một bộ lọc phân vùng.

Các workgroup cũng thực thi các vị trí kết quả riêng biệt cho mỗi nhóm: các kết quả truy vấn của nhóm kỹ thuật đi tới `s3://nimbus-query-results/engineering/`; các kết quả của nhóm tài chính đi tới `s3://nimbus-query-results/finance/`. Không có truy cập kết quả truy vấn xuyên-nhóm.

IAM kiểm soát những người dùng nào có thể dùng workgroup nào. Một hàm Lambda chạy các báo cáo tự động dùng workgroup `finance-reports` (bị giới hạn chặt chẽ). Một kỹ sư debug một vấn đề sản xuất dùng workgroup `engineering-team` (giới hạn rộng hơn, cảnh báo chứ không hủy). Truy cập tới bảng sự kiện thô (chứa PII khách hàng) bị hạn chế chỉ trong workgroup `engineering-team` thông qua một điều kiện IAM trên bảng Glue Data Catalog.

"Đó không chỉ là kiểm soát chi phí," Priya nói. "Đó là kiểm soát truy cập. Các workgroup là điểm thực thi."

Nó trả lời câu hỏi của cô một cách đầy đủ. Mọi cuộc thảo luận về pipeline dữ liệu bỏ qua kiểm soát truy cập cuối cùng đều trở thành một sự cố tuân thủ — và ở đây, nhóm analytics chỉ thấy các bảng đơn hàng đã tổng hợp, trong khi các sự kiện thô chứa PII khách hàng vẫn nằm sau một sự cấp quyền IAM rõ ràng. Glue Data Catalog không chỉ là một thư mục schema. Nó là một ranh giới kiểm soát truy cập.

"Đó không phải là công việc phụ trội," Priya nói. "Đó là thiết kế."

**Kiến Trúc Data Lake**

Ba dịch vụ này kết hợp lại thành cái được gọi là một **kiến trúc data lake** — một kho lưu trữ S3 tập trung cho tất cả dữ liệu của bạn, với các công cụ để xử lý và truy vấn nó:

```
Ứng dụng (đơn hàng, menu, sự kiện)
    |
    | Sự kiện thời gian thực
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (thô)
                                                   |
                                                   | Glue Crawler khám phá schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs chuyển đổi
                                                   ↓
                                              S3 (sạch, Parquet, được phân vùng)
                                                   |
                                                   | Truy vấn SQL
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Công cụ Business Intelligence
                                       (QuickSight, Tableau, v.v.)
```

Dữ liệu thô luôn được bảo tồn (trong bucket S3 gốc). Dữ liệu đã chuyển đổi có thể truy vấn được qua Athena. Các câu hỏi mới luôn có thể được trả lời bằng cách chạy các Glue job mới trên dữ liệu thô.

**Amazon Redshift: Khi Athena Không Đủ**

Đối với một số trường hợp dùng, Athena quá chậm hoặc quá tốn kém:

- Các truy vấn rất phức tạp với nhiều phép nối
- Các dashboard chạy cùng một truy vấn hàng nghìn lần mỗi ngày
- Machine learning trên dữ liệu có cấu trúc
- Các yêu cầu thời gian phản hồi dưới-giây cho các công cụ BI

**Amazon Redshift** là một kho dữ liệu (data warehouse) được quản lý hoàn toàn: một cơ sở dữ liệu analytics columnar được thiết kế cho các khối lượng công việc analytics lớn, lặp lại. Không giống Athena, vốn truy vấn dữ liệu ngay tại nơi nó nằm trong S3, Redshift tải dữ liệu vào lưu trữ kho được tối ưu hóa và dùng tối ưu hóa truy vấn, các chiến lược sắp xếp, và các chiến lược phân phối để tăng tốc analytics phức tạp.

Nếu khối lượng dữ liệu của bạn nhỏ và các truy vấn của bạn chạy không thường xuyên (hàng tuần hoặc hàng tháng), Athena với dữ liệu S3 được tổ chức tốt là đủ và gần như miễn phí — nhưng nếu bạn chạy cùng các dashboard analytics hàng trăm lần mỗi ngày, lưu trữ columnar được tối ưu hóa trước của Redshift sẽ nhanh hơn và cuối cùng tiết kiệm chi phí hơn, mặc dù đòi hỏi dữ liệu phải được tải trước.

Redshift nhanh hơn đáng kể cho các truy vấn analytics phức tạp với cái giá là chi phí (năng lực được cấp phát) và yêu cầu tải dữ liệu trước khi truy vấn.

**Redshift Serverless** loại bỏ gánh nặng lập kế hoạch năng lực — bạn truy vấn, Redshift mở rộng. Chi phí dựa trên năng lực tính toán thực sự được dùng, được đo bằng **RPU-giờ** và tính phí theo giây (với mức tối thiểu 60 giây mỗi lần kích hoạt), cộng với lưu trữ được quản lý mỗi GB-tháng — và không tốn gì cho tính toán khi kho ngồi yên nhàn rỗi. (Athena là cái được tính giá theo truy vấn: $5 mỗi TB được quét.)

Đối với Nimbus ở quy mô hiện tại của họ: Athena là đủ. Ở gấp năm lần khối lượng dữ liệu và với các công cụ BI truy vấn cùng các dashboard hàng trăm lần mỗi ngày, Redshift sẽ trở nên tiết kiệm chi phí.

**Khi Athena Là Công Cụ Sai**

"Vậy điểm hạn chế là gì?" Maya hỏi. "Tại sao chúng ta không dùng Athena cho mọi thứ? Nó serverless, trả theo truy vấn, không cơ sở hạ tầng — nghe có vẻ hoàn hảo."

Các trường hợp mà Athena không phải là câu trả lời đúng:

**Các dashboard tần suất cao**: Một dashboard analytics hướng-khách-hàng làm mới mỗi 30 giây và chạy 50 truy vấn mỗi phút không phải là một trường hợp dùng Athena tốt. Ở mức $5/TB được quét, các truy vấn đó cần được tối ưu hóa cực kỳ tốt để tiết kiệm chi phí ở tần suất đó. Redshift hoặc một cơ sở dữ liệu được tổng hợp trước (kể cả RDS) phù hợp hơn cho các dashboard có yêu cầu thời gian phản hồi dưới-giây.

**Các truy vấn vận hành với yêu cầu độ trễ thấp**: Nếu một nhân viên dịch vụ khách hàng cần tra cứu một đơn hàng cụ thể trong dưới 500ms, Athena không phải là công cụ — một lần tra cứu DynamoDB hoặc một truy vấn RDS mới là. Athena được tối ưu hóa cho thông lượng analytics, không phải độ trễ vận hành. Ngay cả một truy vấn Athena được tinh chỉnh tốt trên một tập dữ liệu nhỏ cũng có phụ trội khởi-động-nguội 1-3 giây.

**Các hệ thống giao dịch**: Athena là chỉ-đọc. Bạn không thể INSERT, UPDATE, hay DELETE các bản ghi trong Athena (ngoại trừ thông qua các tích hợp cụ thể như Lake Formation hoặc định dạng bảng Iceberg, vốn có độ phức tạp riêng của chúng). Đối với các khối lượng công việc ghi vận hành, hãy dùng một cơ sở dữ liệu giao dịch.

**Các tập dữ liệu rất nhỏ, thay đổi thường xuyên**: Nếu tập dữ liệu của bạn thay đổi mỗi phút và chỉ 1GB, việc tải nó vào RDS hoặc DynamoDB và truy vấn ở đó đơn giản hơn và nhanh hơn so với chạy các truy vấn Athena trên các tệp S3 có thể đã cũ. Athena truy vấn các tệp S3 tại-thời-điểm của truy vấn — nếu các tệp được ghi 2 phút trước, đó là mức độ tươi mới bạn nhận được.

Mô hình nổi lên: Athena tuyệt vời cho các truy vấn analytics quy-mô-lớn, không-thường-xuyên, ad-hoc trên dữ liệu S3. Đối với bất cứ thứ gì vận hành, giao dịch, hoặc đòi hỏi độ trễ dưới-giây, hãy dùng cơ sở dữ liệu vận hành phù hợp.

**Kinesis vs SQS: Làm Rõ Sự Nhầm Lẫn**

Đây là câu hỏi xuất hiện trong mọi cuộc thảo luận về kiến trúc dữ liệu. Kinesis và SQS đều xử lý các thông điệp. Khi nào bạn dùng từng cái?

Sự nhầm lẫn đến từ điểm tương đồng bề mặt: cả hai đều chấp nhận các thông điệp từ các producer. Cả hai đều phân phối các thông điệp đó tới các consumer. Cả hai đều là các dịch vụ AWS được quản lý. Nhưng mô hình dữ liệu của chúng khác nhau về căn bản.

**SQS (Simple Queue Service)** là một hàng đợi tác vụ. Bạn đặt một thông điệp vào. Một consumer lấy nó ra và xử lý nó. Khi xử lý hoàn tất, thông điệp bị xóa. Nếu bạn có mười consumer, mỗi thông điệp đi tới đúng một trong số chúng. Thông điệp biến mất sau khi được tiêu thụ.

**Kinesis Data Streams** là một log. Bạn đặt một bản ghi vào. Mọi consumer đọc mọi bản ghi. Consumer A đọc tất cả chúng. Consumer B cũng đọc tất cả chúng, với tốc độ riêng của nó. Không consumer nào xóa bản ghi — nó ở trong stream cho đến khi thời gian lưu giữ hết hạn. Bạn có thể thêm một consumer thứ ba bất cứ lúc nào, và nó có thể đọc từ đầu stream (trong cửa sổ lưu giữ).

"Khi nào bạn thực sự muốn mọi consumer thấy mọi thông điệp?" Maya hỏi.

Câu trả lời là các trường hợp dùng nơi Kinesis tỏa sáng:

**Dashboard thời gian thực + phát hiện gian lận + lưu trữ S3**: Cả ba đều tiêu thụ cùng một stream sự kiện đơn hàng đồng thời. Nếu bạn dùng SQS, bạn sẽ cần xuất bản tới ba hàng đợi riêng biệt — và bất cứ ai xuất bản đều phải biết về cả ba consumer. Với Kinesis, producer xuất bản một lần; bất kỳ số lượng consumer nào cũng có thể đọc một cách độc lập.

**Phát lại (Replay)**: Một consumer thất bại trong 2 giờ (chạm giới hạn đồng thời của Lambda, dịch vụ hạ nguồn ngừng hoạt động). Với SQS, các thông điệp đó đã bị xóa rồi (hoặc có một visibility timeout được định nghĩa). Với Kinesis, consumer tiếp tục từ checkpoint cuối cùng của nó và xử lý 2 giờ các bản ghi bị bỏ lỡ. Dữ liệu được lưu giữ trong stream (lên đến 365 ngày với Extended Data Retention).

**Thứ tự trong một shard**: Các bản ghi có cùng partition key luôn đi tới cùng một shard, bảo tồn thứ tự. Đối với một hệ thống giao dịch chứng khoán nơi bạn cần tất cả các giao dịch cho mã `AMZN` được xử lý theo thứ tự, Kinesis đảm bảo điều này. SQS FIFO cung cấp thứ tự theo-nhóm nhưng ở thông lượng thấp hơn (lên đến 3,000 thông điệp/giây mỗi hàng đợi với batching ở chế độ tiêu chuẩn — chế độ thông-lượng-cao nâng con số này lên hàng chục nghìn — so với 1 MB/s hoặc 1,000 bản ghi/giây mỗi shard của Kinesis, nhân với số shard tùy theo bạn cần).

Câu hỏi quyết định: **Mỗi thông điệp có cần được tiêu thụ bởi đúng một consumer rồi loại bỏ không?** → SQS. **Mỗi thông điệp có cần được thấy bởi nhiều consumer một cách độc lập không, hoặc bạn có cần khả năng phát lại không?** → Kinesis.

Đối với dashboard thời gian thực của Nimbus: Kinesis. Nhiều consumer (dashboard, phát hiện gian lận, lưu trữ S3) đều đọc cùng một stream.

Đối với hàng đợi xử lý đơn hàng của Nimbus (một đơn hàng được đặt → một ECS task xử lý nó): SQS. Một consumer, không cần phát lại, không cần fan-out.

## Trực Quan Hóa Dữ Liệu: Amazon QuickSight

Athena truy vấn dữ liệu. Glue chuẩn bị nó. Nhưng đến một lúc nào đó ai đó cần thấy một biểu đồ — và không phải bằng cách chạy các truy vấn SQL trong console.

"Chúng ta có thực sự cần thêm một dịch vụ nữa cho việc đó không?" Maya hỏi. "Tôi không thể chỉ xuất kết quả Athena ra một bảng tính sao?"

"Cho một truy vấn, thì được," Tom nói. Anh có cái nhìn của một người đã thử việc này rồi. "Cho một dashboard mà bạn muốn chia sẻ với cả nhóm, đó là một bảng tính mới mỗi sáng."

**Amazon QuickSight** là dịch vụ business intelligence (BI) được quản lý của AWS. Nó kết nối trực tiếp tới Athena, S3, RDS, Redshift, và các nguồn khác, và cho phép bạn xây dựng các dashboard và trực quan hóa mà không cần một máy chủ BI riêng.

Các tính năng chính:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight có thể nhập các tập dữ liệu vào engine in-memory của nó để có hiệu suất truy vấn dưới-giây ở quy mô lớn, mà không cần truy vấn lại Athena mỗi lần tải dashboard
- **ML Insights:** phát hiện bất thường và dự báo được tích hợp sẵn — không cần khoa học dữ liệu
- **Các dashboard nhúng:** bạn có thể nhúng các dashboard QuickSight vào ứng dụng web của riêng mình qua một URL

Tom kết nối QuickSight tới nguồn dữ liệu Athena và có một dashboard hoạt động hiển thị đơn hàng hằng ngày, doanh thu theo nhà hàng, và phễu chuyển đổi trong vòng một buổi chiều.

"Cái đó tốn bao nhiêu mỗi tháng?" anh hỏi — rồi tự trả lời câu hỏi của mình trước khi ai khác kịp. "QuickSight chạy khoảng $24/tháng mỗi author — những người xây dựng các dashboard — và $3/tháng mỗi reader. Chúng ta có bốn người sẽ dùng nó."

"Vậy khoảng một trăm đô la một tháng," Maya nói.

"Cho một dịch vụ BI mà nếu không sẽ đòi hỏi chạy một máy chủ analytics riêng," Priya nói. "Đúng vậy."

Tom xuất bản dashboard. Sáng hôm sau, thay vì chạy các truy vấn Athena, cả nhóm mở một URL.

> **Mẹo Thi — QuickSight**
>
> QuickSight là dịch vụ BI và trực quan hóa được quản lý của AWS. Kết nối tới Athena, S3, Redshift, RDS. SPICE là engine truy vấn in-memory tăng tốc các truy vấn dashboard lặp lại. Tín hiệu thi: "dashboard business intelligence trên AWS" hoặc "trực quan hóa dữ liệu từ Athena/Redshift" → QuickSight.

## Quản Trị Hồ Dữ Liệu: AWS Lake Formation

Khi data lake của Nimbus phát triển, việc truy cập dữ liệu trở thành một vấn đề quản trị.

"Ai có thể truy vấn các nhật ký giao dịch thô?" Priya hỏi, tại buổi rà soát kiến trúc tiếp theo. "Ai có thể thấy PII khách hàng? Ai có thể truy cập các bảng tóm tắt tài chính?"

"Kỹ thuật có quyền truy cập đầy đủ," Leo nói. "Nhóm analytics có quyền truy cập các bảng đã tổng hợp. Tài chính có quyền truy cập các bảng doanh thu."

"Được cấu hình ở đâu?"

Leo dừng lại. "Ở... một vài nơi khác nhau. Các bucket policy của S3, các chính sách IAM, các quyền của Glue catalog."

"Ba hệ thống riêng biệt, tất cả đều phải nhất quán," Priya nói. "Điều gì xảy ra khi chúng ta thêm một nhà phân tích mới? Hoặc khi chúng ta quyết định hạn chế truy cập một cột cụ thể — chẳng hạn, số điện thoại khách hàng — khỏi nhóm analytics?"

Câu hỏi đó phơi bày khoảng trống. Việc quản lý truy cập dữ liệu chi-tiết trên các bucket policy của S3, IAM, và Glue Data Catalog cùng một lúc là dễ vỡ.

**AWS Lake Formation** là một dịch vụ được quản lý tập trung hóa việc kiểm soát truy cập cho data lake của bạn. Thay vì quản lý các bucket policy, các chính sách IAM, và các quyền Glue catalog một cách riêng biệt, Lake Formation cung cấp một nơi duy nhất để cấp các quyền cấp-cột, cấp-hàng, và cấp-bảng trên dữ liệu của bạn.

Các tính năng chính:

- Nằm trên S3 và Glue Data Catalog — không cần di chuyển dữ liệu
- **Kiểm soát truy cập chi tiết:** cấp cho các người dùng hoặc role cụ thể quyền truy cập các bảng, cột, hoặc thậm chí các hàng được lọc cụ thể — tương đương với các quyền cấp-cơ-sở-dữ-liệu trên dữ liệu S3
- **Lọc dữ liệu:** khi một người dùng truy vấn một bảng được quản trị bởi Lake Formation qua Athena, Lake Formation tự động lọc bỏ các cột hoặc hàng mà họ không được phép thấy

Priya thiết lập Lake Formation với ba tầng quyền, với Rafael soạn các quy tắc cấp-cột: role kỹ thuật thấy tất cả các bảng và tất cả các cột. Role analytics thấy các bảng đơn hàng đã tổng hợp nhưng không thấy các cột PII khách hàng. Role tài chính thấy các bảng doanh thu với các định danh khách hàng được che giấu.

"Vậy nhà phân tích chạy cùng một truy vấn Athena," Leo xác nhận. "Nhưng Lake Formation chặn nó lại và loại bỏ các cột mà họ không được cấp quyền để thấy?"

"Chính xác. Việc lọc là tự động. Nhà phân tích không cần biết nó đang diễn ra — và họ không thể đi vòng qua nó bằng cách truy vấn các tệp S3 thô trực tiếp, vì Lake Formation kiểm soát truy cập ở cấp catalog."

"Đó không phải là công việc phụ trội," Priya nói. "Đó là thiết kế."

> **Mẹo Thi — Lake Formation**
>
> Lake Formation tập trung hóa việc kiểm soát truy cập cho một data lake được xây trên S3 và Glue Data Catalog. Hỗ trợ các quyền chi tiết ở cấp bảng, cột, và hàng. Tín hiệu thi: "hạn chế truy cập các cột cụ thể trong một data lake S3" hoặc "tập trung hóa quản trị data lake" → Lake Formation. Sự phân biệt then chốt so với IAM thuần túy: Lake Formation thực thi việc lọc cấp-cột và cấp-hàng mà chỉ riêng các chính sách IAM không thể diễn đạt được.

## Điểm Mạnh và Hạn Chế

**Kinesis Data Streams**: Dùng Kinesis khi dữ liệu của bạn đến liên tục và thứ tự quan trọng — clickstream, các giao dịch tài chính, telemetry IoT. Kinesis bảo tồn thứ tự bản ghi trong một shard và cho phép phát lại trong cửa sổ lưu giữ được cấu hình (24 giờ theo mặc định, lên đến 365 ngày với Extended Data Retention), điều khiến nó khác biệt về căn bản so với SQS. Đánh đổi là độ phức tạp vận hành: trong chế độ được cấp phát, bạn quản lý năng lực shard và hành vi consumer. Đối với các hàng đợi tác vụ đơn giản nơi thứ tự không quan trọng và phát lại không cần thiết, SQS là lựa chọn đơn giản hơn.

**AWS Glue**: Glue loại bỏ cơ sở hạ tầng của một cụm ETL truyền thống. Bạn viết logic chuyển đổi; AWS quản lý môi trường Spark. Điều này có giá trị khi các chuyển đổi phức tạp hoặc khối lượng dữ liệu lớn. Hạn chế là chi phí và khởi-động-nguội — các Glue job có độ trễ khởi động vài phút, khiến chúng không phù hợp cho các chuyển đổi gần-thời-gian-thực. Đối với các chuyển đổi định dạng tệp đơn giản (CSV sang Parquet), chi phí phụ trội của Glue có thể không đáng so với một hàm Lambda hoặc một script nhẹ.

**Amazon Athena**: Athena cho phép bạn truy vấn dữ liệu S3 với SQL tiêu chuẩn và không có cơ sở hạ tầng để quản lý. Ràng buộc quan trọng là chi phí: Athena tính phí mỗi terabyte dữ liệu được quét. Một truy vấn trên một bảng 10 TB quét toàn bộ tốn nhiều hơn đáng kể so với cùng truy vấn đó trên một bảng được định dạng Parquet, được phân vùng chỉ quét 200 GB. Luôn dùng các định dạng columnar (Parquet hoặc ORC) và phân vùng dữ liệu của bạn trước khi chạy Athena trong sản xuất. Không có các tối ưu hóa này, các hóa đơn Athena có thể khiến bạn bất ngờ.

## Tóm Tắt

Công việc mạng trong chương 25 đã làm cho pipeline dữ liệu của Nimbus trở nên khả thi. Chương này là về mục đích của pipeline đó: làm cho tất cả dữ liệu mà Nimbus đã tạo ra thực sự nhìn thấy được và có thể hành động được.

- **Amazon Kinesis**: Streaming dữ liệu thời gian thực. Các producer ghi các bản ghi; các consumer đọc theo tốc độ riêng của họ. Amazon Data Firehose sau đó có thể phân phối dữ liệu streaming tới S3, Redshift, và các đích đến khác với ít công việc vận hành hơn.
- **AWS Glue**: ETL và lập danh mục dữ liệu. Các crawler khám phá schema; các job chuyển đổi dữ liệu; Data Catalog làm cho dữ liệu có thể khám phá được bởi Athena và các công cụ khác.
- **Amazon Athena**: SQL serverless trên S3. Truy vấn bất kỳ dữ liệu nào trong S3 dùng SQL tiêu chuẩn. Được tính giá theo TB được quét — dùng Parquet và phân vùng để giảm thiểu chi phí.
- **Amazon Redshift**: Kho dữ liệu được quản lý cho analytics hiệu năng cao. Tải dữ liệu vào, tối ưu hóa cho các truy vấn analytics lặp lại, và truy vấn nhanh ở quy mô kho.
- **Mẫu data lake**: dữ liệu thô tới S3 → Glue chuyển đổi nó → Athena truy vấn nó → các công cụ BI trực quan hóa nó.
- **Tiến hóa schema của Glue**: các pipeline ETL xử lý dữ liệu bên ngoài phải xử lý các thay đổi schema một cách uyển chuyển. Dùng DynamicFrame với `mergeSchema: true` để tránh các thất bại pipeline khi dữ liệu thượng nguồn thêm các trường mới.
- **Athena Workgroups**: các giới hạn quét dữ liệu và vị trí kết quả theo từng nhóm. Kiểm soát chi phí và kiểm soát truy cập trong một cấu hình. Bắt buộc cho bất kỳ triển khai Athena đa-nhóm nào.
- **Kinesis vs SQS**: Kinesis cho việc fan-out tới nhiều consumer và khả năng phát lại. SQS Standard cho các hàng đợi tác vụ đơn giản; SQS FIFO cho việc xử lý tác vụ có thứ tự, đã khử trùng lặp. Câu hỏi quyết định: mỗi consumer có cần thấy mọi thông điệp không, hay mỗi thông điệp đi tới một consumer?
- **Khi Athena là sai**: các dashboard tần suất cao (dùng Redshift), các truy vấn vận hành (dùng RDS hoặc DynamoDB), các tập dữ liệu rất nhỏ thay đổi thường xuyên (chỉ cần dùng một cơ sở dữ liệu).
- **Amazon QuickSight**: dịch vụ BI được quản lý của AWS. Kết nối tới Athena, S3, Redshift, và RDS để xây dựng các dashboard mà không cần chạy một máy chủ BI riêng. SPICE là engine in-memory tăng tốc các truy vấn dashboard lặp lại.
- **AWS Lake Formation**: Kiểm soát truy cập tập trung cho các data lake trên S3 + Glue Data Catalog. Cho phép các quyền cấp-cột, cấp-hàng, và cấp-bảng — quản trị dữ liệu chi tiết mà chỉ riêng IAM không thể diễn đạt được.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Hiệu Năng Cao (Lĩnh vực 3, Nhiệm vụ 3.5)*

- **Kinesis vs SQS**: Kinesis = có thứ tự, streaming thời gian thực, nhiều consumer, phát lại trong cửa sổ lưu giữ (24 giờ mặc định, lên đến 365 ngày). SQS = hàng đợi tác vụ, mỗi thông điệp được xử lý một lần. "Nhiều consumer đọc cùng một stream đồng thời" → Kinesis. "Một worker cho mỗi thông điệp" → SQS.
- **Các tín hiệu thi Athena**: "SQL serverless trên S3," "phân tích dữ liệu S3 mà không tải nó vào một cơ sở dữ liệu," "trả theo truy vấn" → Athena.
- **Tối ưu hóa chi phí Athena**: Định dạng columnar (Parquet hoặc ORC) + phân vùng giảm đáng kể dữ liệu được quét và chi phí. Đề thi có thể hỏi cách giảm chi phí Athena.
- **Giá Athena**: $5 mỗi TB được quét (us-east-1, us-west-2, và hầu hết các khu vực lớn). Chi phí được tính trên dữ liệu được quét, không phải dữ liệu được trả về — luôn tối ưu hóa định dạng lưu trữ trước khi chạy các truy vấn sản xuất.
- **Glue Crawler**: "Tự động khám phá schema của dữ liệu S3" → Glue Crawler.
- **Amazon Data Firehose**: "Tự động tải dữ liệu streaming vào S3/Redshift/OpenSearch mà không quản lý các consumer" → Amazon Data Firehose. Các tài liệu cũ có thể vẫn gọi nó là Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift cho các truy vấn tần suất cao, phức tạp trên một tập dữ liệu cố định (các dashboard BI). Athena cho các truy vấn ad-hoc trên dữ liệu S3 thay đổi thường xuyên.
- **EMR (Elastic MapReduce)**: Các cụm Hadoop/Spark được quản lý bởi AWS. Đề thi dùng cái này khi "các khối lượng công việc Hadoop/Spark hiện có" hoặc "các framework xử lý dữ liệu tùy chỉnh" được đề cập. Glue là lựa chọn thay thế được quản lý cho hầu hết các trường hợp dùng.
- **QuickSight:** BI và trực quan hóa được quản lý của AWS. Kết nối tới Athena, S3, Redshift, RDS. SPICE = engine in-memory cho các truy vấn lặp lại nhanh. Tín hiệu thi: "dashboard business intelligence trên AWS" → QuickSight.
- **Lake Formation:** Kiểm soát truy cập tập trung cho một data lake (S3 + Glue Data Catalog). Các quyền chi tiết: cấp bảng, cột, và hàng. Tín hiệu thi: "hạn chế truy cập các cột cụ thể trong data lake S3" hoặc "tập trung hóa quản trị data lake" → Lake Formation.

## Bài Tập

**Bài tập 1 — Ôn lại**

Giải thích sự khác biệt giữa Amazon Kinesis và Amazon SQS. Khi nào bạn sẽ dùng từng cái?

*(Gợi ý: Hãy nghĩ về việc bao nhiêu consumer có thể đọc cùng một dữ liệu, liệu các thông điệp có bị xóa sau khi đọc không, và liệu thứ tự có quan trọng không.)*

**Bài tập 2 — Tình huống SAA-C03**

*Tình huống*: Một công ty chia sẻ xe muốn phân tích dữ liệu chuyến đi. 1 triệu chuyến đi được hoàn thành hằng ngày. Các bản ghi chuyến đi được lưu trữ trong S3 dưới dạng các tệp JSON (khoảng 2KB mỗi tệp). Nhóm analytics muốn chạy các truy vấn SQL ad-hoc như "thời gian chuyến đi trung bình theo thành phố tuần qua." Các truy vấn nên hoàn thành trong dưới 2 phút. Chi phí lưu trữ nên được giảm thiểu. Nhóm sẽ chạy 20-30 truy vấn mỗi tuần.

Kiến trúc nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Dùng AWS Glue để chuyển đổi JSON sang định dạng Parquet được phân vùng theo ngày và thành phố; truy vấn bằng Amazon Athena  
B) Tải dữ liệu chuyến đi vào RDS PostgreSQL hằng ngày; truy vấn bằng SQL tiêu chuẩn  
C) Dùng Amazon Data Firehose để phân phối dữ liệu chuyến đi tới Amazon Redshift; truy vấn bằng Redshift  
D) Tải dữ liệu chuyến đi vào DynamoDB và dùng PartiQL cho các truy vấn SQL

**Gợi ý 1**: 20-30 truy vấn mỗi tuần là tần suất thấp. Dịch vụ nào tiết kiệm chi phí nhất cho việc truy vấn thỉnh thoảng?

**Gợi ý 2**: Định dạng Parquet + phân vùng giảm đáng kể dữ liệu được quét bởi Athena — và do đó chi phí.

**Gợi ý 3**: 1 triệu chuyến đi × 2KB = ~2GB mỗi ngày. Trong một tuần, ~14GB. Ở mức $5/TB cho Athena, ngay cả không có tối ưu hóa, điều này là chi phí phải chăng.

**Đáp án**: A

**Giải thích**: Glue chuyển đổi JSON sang Parquet (định dạng columnar giảm đáng kể dữ liệu được quét) được phân vùng theo ngày và thành phố (partition pruning có nghĩa là các truy vấn "tuần qua" chỉ quét 7 ngày phân vùng). Athena truy vấn S3 trực tiếp với SQL tiêu chuẩn. Cho 20-30 truy vấn mỗi tuần, Athena trả-theo-truy-vấn cực kỳ tiết kiệm chi phí so với Redshift luôn-chạy.

**Tại sao không phải B?** Tải 2GB dữ liệu hằng ngày vào RDS, rồi truy vấn, đòi hỏi một instance cơ sở dữ liệu chạy 24/7. Cho 20-30 truy vấn mỗi tuần, điều này được thiết kế quá mức và tốn kém.

**Tại sao không phải C?** Redshift tiết kiệm chi phí cho các truy vấn tần suất cao (hàng trăm mỗi ngày trên cùng tập dữ liệu). Cho 20-30 truy vấn mỗi tuần, cụm Redshift luôn-bật tốn nhiều hơn nhiều so với giá theo-truy-vấn của Athena.

**Tại sao không phải D?** DynamoDB là một kho key-value/document được tối ưu hóa cho truy cập dựa-trên-key, không phải các truy vấn analytics ad-hoc. PartiQL trên DynamoDB không hỗ trợ loại tổng hợp GROUP BY được mô tả.

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Hiệu Năng Cao — Nhiệm vụ 3.5*

**Bài tập 3 — Thử thách Kiến trúc** *(Tùy chọn)*

Nimbus muốn xây dựng một hệ thống phát hiện gian lận thời gian thực cho các đơn hàng. Hệ thống nên:

- Phát hiện các đơn hàng được đặt bởi cùng một tài khoản hơn 5 lần trong 60 giây
- Gắn cờ các đơn hàng trên $500 từ các tài khoản mới (< 30 ngày tuổi)
- Gửi các đơn hàng bị gắn cờ tới một hàng đợi xem xét của con người

Thiết kế kiến trúc. Kinesis cung cấp gì? Logic gian lận chạy ở đâu? Làm thế nào để bạn tương quan "cùng tài khoản, cửa sổ 60 giây"? Dịch vụ nào nhận các đơn hàng bị gắn cờ?

*(Không có một câu trả lời đúng duy nhất. Mục tiêu là luyện tập thiết kế kiến trúc streaming thời gian thực.)*

## Cảnh Sau Tín Dụng

Tom chạy truy vấn Athena đầu tiên.

"10 nhà hàng có doanh thu cao nhất quý vừa rồi," anh nói.

12 giây sau, các kết quả xuất hiện.

Anh nhìn chằm chằm vào chúng.

"Nhà hàng 47 đứng đầu," anh nói. Đó là nhà hàng của gia đình Maya — nơi Nimbus bắt đầu.

"Tất nhiên rồi," Maya nói. "Arepa ngon đến vậy mà."

Tom chạy thêm một truy vấn. Và rồi thêm nữa. "Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi trước khi Leo kịp nói gì. Leo kiểm tra lịch sử quét truy vấn. Ba truy vấn, tổng dữ liệu được quét: 1.2GB. Chi phí: dưới một xu.

Sau một giờ, Tom có một bức tranh hoàn chỉnh về hoạt động kinh doanh của Nimbus theo một cách anh chưa từng có trước đây. Danh mục nhà hàng nào tăng trưởng nhanh nhất. Nhóm khách hàng nào lưu giữ lâu nhất. Món menu nào thúc đẩy nhiều đơn hàng lặp lại nhất.

"Tại sao chúng ta không xây dựng điều này sớm hơn?" anh hỏi.

"Chúng ta có dữ liệu," Leo nói. "Chúng ta chỉ không có pipeline để dùng nó."

"Dữ liệu luôn ở đó," Maya nói nhẹ nhàng. "Chúng ta chỉ không thể nhìn thấy nó."

Trong chương tiếp theo: giờ đây chúng ta có thể nhìn thấy hoạt động kinh doanh một cách rõ ràng, hãy nói về cách trả tiền cho cơ sở hạ tầng vận hành nó — một cách hiệu quả hơn.
