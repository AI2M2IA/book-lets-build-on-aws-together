# Chương 26: Tìm Hiểu Mọi Thứ

Dữ liệu là thô: dấu thời gian, lần nhấp chuột, sự kiện, con số. Thông tin là thứ bạn có được khi dữ liệu được tổ chức, xử lý và được cung cấp ngữ cảnh. Khoảng cách giữa hai thứ đó là nơi chương này tồn tại.

Và trong các hệ thống đang tăng trưởng, khoảng cách đó nhanh chóng trở nên tốn kém.

Nimbus đang tạo ra lượng dữ liệu khổng lồ. Mỗi đơn hàng: được ghi lại. Mỗi lần xem menu: được ghi nhật ký. Mỗi lần cập nhật nhà hàng: được ghi lại. Mỗi tương tác khách hàng: được theo dõi.

Tom có một câu hỏi.

"Giờ đặt hàng bận rộn nhất vào thứ Sáu của chúng ta là lúc nào?"

Leo nhìn anh. "Điều đó không có trong dashboard của chúng ta."

"Chúng ta có thể thêm nó không?"

"Dữ liệu đang ở trong DynamoDB. Và trong CloudWatch logs. Và trong S3 từ công việc xuất analytics." Leo dừng lại. "Ở ba nơi khác nhau, với ba định dạng khác nhau."

Maya thêm vào: "Và việc xuất analytics chỉ chạy một lần mỗi đêm. Nếu bạn muốn dữ liệu thứ Sáu, bạn sẽ phải đợi đến sáng thứ Bảy."

Tom nhìn vào màn hình. "Vậy chúng ta có dữ liệu. Chúng ta chỉ không thể sử dụng nó."

Câu nói đó mô tả một nửa analytics hiện đại.

Đây là vấn đề kỹ thuật dữ liệu: bạn có dữ liệu, nhưng nó không ở dạng bạn có thể phân tích khi bạn cần.

**Ba Vấn Đề Khác Nhau**

Vấn đề dữ liệu của Nimbus có ba chiều:

**Streaming thời gian thực**: Các đơn hàng đang được đặt ngay bây giờ. Bạn muốn xem dashboard trực tiếp về tốc độ đặt hàng — bao nhiêu mỗi phút, theo khu vực, theo nhà hàng. Dữ liệu cần được xử lý khi nó đến.

**Chuyển đổi dữ liệu**: Dữ liệu ở S3 từ các hệ thống khác nhau, với các định dạng khác nhau (JSON, CSV, Parquet). Trước khi bạn có thể phân tích nó, bạn cần chuẩn hóa nó — cùng schema, cùng định dạng, được làm sạch, được kết hợp với dữ liệu tham chiếu.

**Phân tích ad-hoc**: Một khi dữ liệu được tổ chức, bạn muốn chạy các truy vấn SQL trên đó mà không cần tải nó vào cơ sở dữ liệu trước. "Cho tôi 10 nhà hàng có doanh thu cao nhất trong 30 ngày qua." Mà không cần tải dữ liệu vào cơ sở dữ liệu.

Mỗi vấn đề này là một vấn đề riêng biệt. AWS có một dịch vụ chuyên dụng cho mỗi vấn đề:

- **Amazon Kinesis**: Streaming dữ liệu thời gian thực
- **AWS Glue**: Chuyển đổi dữ liệu và lập danh mục
- **Amazon Athena**: Truy vấn SQL serverless trên S3

**Amazon Kinesis: Băng Ticker Thời Gian Thực**

**Amazon Kinesis Data Streams** là dịch vụ streaming dữ liệu thời gian thực. Các producers gửi các bản ghi dữ liệu đến stream. Nhiều consumers có thể đọc từ stream đồng thời, mỗi cái với tốc độ riêng của mình.

Hãy nghĩ về một máy ticker tape: giá cả được in liên tục, mọi người đều có thể đọc băng, và băng không chậm lại cho bất kỳ người đọc nào.

Đối với Nimbus, khi một đơn hàng được đặt, ứng dụng xuất bản một sự kiện vào Kinesis stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Các consumers của stream này:

- Một dashboard thời gian thực (đọc sự kiện khi chúng đến, cập nhật chỉ số)
- Một Lambda phát hiện gian lận (tìm kiếm các mẫu đặt hàng bất thường)
- Một stream đến S3 để lưu trữ lâu dài

**Các khái niệm Kinesis Data Streams**:

- **Shard**: Đơn vị năng lực cơ bản. Một shard xử lý 1 MB/s ghi, 2 MB/s đọc.
- **Thời gian lưu giữ**: Dữ liệu ở trong stream 24 giờ (mặc định) đến 7 ngày.
- **Số thứ tự**: Mỗi bản ghi có một số thứ tự. Consumers theo dõi vị trí của họ trong stream.

**Amazon Data Firehose** (trước đây là **Kinesis Data Firehose**): Dịch vụ phân phối được quản lý giữa các producers streaming và các đích đến như S3, Redshift và OpenSearch. Nó tự động đệm, nén, chuyển đổi và phân phối dữ liệu.

Đối với Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (định dạng Parquet, nén, được phân vùng theo ngày).

**AWS Glue: Người Phiên Dịch**

Dữ liệu trong S3 là thô. Trước khi bạn có thể phân tích nó hiệu quả, bạn cần:

- Khám phá những gì có ở đó và schema của nó (những cột nào, những kiểu nào)
- Chuyển đổi nó thành định dạng nhất quán
- Kết hợp các tập dữ liệu khác nhau với nhau
- Xử lý các bản ghi lỗi, thay đổi schema, giá trị thiếu

**AWS Glue** là dịch vụ ETL (Extract, Transform, Load) được quản lý hoàn toàn. Nó có hai thành phần chính:

**Glue Data Catalog**: Một kho lưu trữ metadata mô tả dữ liệu S3 của bạn — những bảng nào tồn tại, chúng có những cột nào, các tệp dữ liệu ở đâu. Nó giống như một danh mục thư viện cho data lake của bạn.

**Glue Crawlers**: Các agent tự động quét S3, suy ra schema và điền vào Data Catalog. Chạy crawler trên S3 bucket của bạn và 10 phút sau bạn có danh mục tất cả các bảng của mình.

**Glue Jobs**: Các công việc Spark/Python serverless thực hiện chuyển đổi thực tế. Bạn viết logic chuyển đổi (hoặc dùng công cụ ETL trực quan của Glue), và Glue chạy nó trên cơ sở hạ tầng được quản lý.

Đối với Nimbus:

1. Glue Crawler quét dữ liệu đơn hàng trong S3 → tạo định nghĩa bảng trong Glue Data Catalog
2. Glue Job chuyển đổi các sự kiện đơn hàng JSON thô thành định dạng Parquet sạch, được phân vùng
3. Dữ liệu đã chuyển đổi được ghi lại vào S3 theo bố cục được tối ưu hóa cho truy vấn

**Amazon Athena: Người Thủ Thư**

**Amazon Athena** là dịch vụ truy vấn tương tác serverless chạy các truy vấn SQL trực tiếp trên dữ liệu S3. Không có cơ sở dữ liệu để cấp phát, không có dữ liệu để tải. Bạn định nghĩa một bảng (hoặc dùng Glue Data Catalog), viết SQL, và Athena thực thi truy vấn trên các tệp S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Giá Athena dựa trên lượng dữ liệu mà một truy vấn quét. Ở nhiều khu vực, các truy vấn SQL tiêu chuẩn bắt đầu ở $5 mỗi terabyte được quét. Sử dụng định dạng Parquet (columnar) với partition pruning (`WHERE year='2024' AND month='01'`) có nghĩa là Athena chỉ quét các tệp nó cần, giảm đáng kể chi phí.

"Chúng ta có thể chạy truy vấn này cho 30 ngày dữ liệu," Leo nói, "và nó có thể tốn kém đáng ngạc nhiên thấp nếu chúng ta lưu trữ tốt."

"Cho bất kỳ câu hỏi tùy ý nào chúng ta có thể nghĩ ra?" Tom hỏi.

"Bất kỳ câu hỏi nào chúng ta có thể diễn đạt bằng SQL, đối với bất kỳ dữ liệu nào chúng ta đã lưu trữ trong S3."

Tom có biểu hiện của người đang tính toán lại giá trị của tất cả dữ liệu mà họ đã bỏ đi.

**Kiến Trúc Data Lake**

Ba dịch vụ này kết hợp thành cái được gọi là **kiến trúc data lake** — một kho lưu trữ S3 tập trung cho tất cả dữ liệu của bạn, với các công cụ để xử lý và truy vấn nó:

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

Dữ liệu thô luôn được bảo tồn (trong S3 bucket gốc). Dữ liệu đã chuyển đổi có thể được truy vấn qua Athena. Các câu hỏi mới luôn có thể được trả lời bằng cách chạy các Glue Job mới trên dữ liệu thô.

**Amazon Redshift: Khi Athena Không Đủ**

Đối với một số trường hợp sử dụng, Athena quá chậm hoặc quá tốn kém:

- Các truy vấn rất phức tạp với nhiều phép nối
- Các dashboard chạy cùng một truy vấn hàng nghìn lần mỗi ngày
- Machine learning trên dữ liệu có cấu trúc
- Yêu cầu thời gian phản hồi dưới giây cho các công cụ BI

**Amazon Redshift** là một kho dữ liệu được quản lý hoàn toàn: một cơ sở dữ liệu analytics columnar được thiết kế cho các khối lượng công việc analytics lớn, lặp lại. Không giống Athena, truy vấn dữ liệu ngay tại nơi nó tồn tại trong S3, Redshift tải dữ liệu vào bộ nhớ kho tối ưu hóa và sử dụng tối ưu hóa truy vấn, chiến lược sắp xếp và chiến lược phân phối để tăng tốc analytics phức tạp.

Redshift nhanh hơn đáng kể cho các truy vấn analytics phức tạp với chi phí là chi phí (năng lực được cấp phát) và yêu cầu tải dữ liệu trước khi truy vấn.

**Redshift Serverless** loại bỏ gánh nặng lập kế hoạch năng lực — bạn truy vấn, Redshift mở rộng. Chi phí theo truy vấn.

Đối với Nimbus ở quy mô hiện tại của họ: Athena là đủ. Ở gấp năm lần khối lượng dữ liệu và với các công cụ BI truy vấn cùng một dashboard hàng trăm lần mỗi ngày, Redshift sẽ trở nên tiết kiệm chi phí hơn.

## Điểm Mạnh và Hạn Chế

**Kinesis Data Streams**: Sử dụng Kinesis khi dữ liệu của bạn đến liên tục và thứ tự quan trọng — clickstream, giao dịch tài chính, telemetry IoT. Kinesis bảo tồn thứ tự bản ghi trong một shard và cho phép phát lại trong cửa sổ lưu giữ đã cấu hình, điều này khiến nó về cơ bản khác với SQS. Đánh đổi là độ phức tạp vận hành: trong chế độ được cấp phát, bạn quản lý năng lực shard và hành vi consumer. Đối với các hàng đợi tác vụ đơn giản nơi thứ tự không quan trọng và phát lại không cần thiết, SQS là lựa chọn đơn giản hơn.

**AWS Glue**: Glue loại bỏ cơ sở hạ tầng của một cụm ETL truyền thống. Bạn viết logic chuyển đổi; AWS quản lý môi trường Spark. Điều này có giá trị khi các chuyển đổi phức tạp hoặc khối lượng dữ liệu lớn. Hạn chế là chi phí và thời gian khởi động nguội — các Glue Job có độ trễ khởi động vài phút, khiến chúng không phù hợp cho các chuyển đổi gần thời gian thực. Đối với các chuyển đổi định dạng tệp đơn giản (CSV sang Parquet), chi phí của Glue có thể không đáng so với Lambda function hoặc script nhẹ.

**Amazon Athena**: Athena cho phép bạn truy vấn dữ liệu S3 bằng SQL tiêu chuẩn mà không cần quản lý cơ sở hạ tầng. Ràng buộc quan trọng là chi phí: Athena tính phí mỗi terabyte dữ liệu được quét. Một truy vấn trên bảng 10 TB quét toàn bộ tốn nhiều hơn đáng kể so với cùng truy vấn trên bảng được định dạng Parquet, được phân vùng chỉ quét 200 GB. Luôn sử dụng định dạng columnar (Parquet hoặc ORC) và phân vùng dữ liệu của bạn trước khi chạy Athena trong production. Không có những tối ưu hóa này, hóa đơn Athena có thể gây bất ngờ.

## Tóm Tắt

- **Amazon Kinesis**: Streaming dữ liệu thời gian thực. Producers ghi bản ghi; consumers đọc theo tốc độ riêng của mình. Amazon Data Firehose sau đó có thể phân phối dữ liệu streaming đến S3, Redshift và các đích đến khác với ít công việc vận hành hơn.
- **AWS Glue**: ETL và lập danh mục dữ liệu. Crawlers khám phá schema; Jobs chuyển đổi dữ liệu; Data Catalog làm cho dữ liệu có thể khám phá bởi Athena và các công cụ khác.
- **Amazon Athena**: SQL Serverless trên S3. Truy vấn bất kỳ dữ liệu nào trong S3 bằng SQL tiêu chuẩn. Giá theo TB được quét — sử dụng Parquet và phân vùng để giảm thiểu chi phí.
- **Amazon Redshift**: Kho dữ liệu được quản lý cho analytics hiệu suất cao. Tải dữ liệu vào, tối ưu hóa cho các truy vấn analytics lặp lại, và truy vấn nhanh ở quy mô kho.
- **Mẫu data lake**: dữ liệu thô đến S3 → Glue chuyển đổi nó → Athena truy vấn nó → các công cụ BI trực quan hóa nó.

## Mẹo Cho Kỳ Thi

*SAA-C03 Domain: Thiết Kế Kiến Trúc Hiệu Suất Cao (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = thứ tự, streaming thời gian thực, nhiều consumer, phát lại trong cửa sổ lưu giữ. SQS = hàng đợi tác vụ, mỗi tin nhắn xử lý một lần. "Nhiều consumer đọc cùng một stream đồng thời" → Kinesis. "Một worker mỗi tin nhắn" → SQS.
- **Tín hiệu kỳ thi Athena**: "SQL serverless trên S3," "phân tích dữ liệu S3 mà không tải vào cơ sở dữ liệu," "trả theo truy vấn" → Athena.
- **Tối ưu hóa chi phí Athena**: Định dạng columnar (Parquet hoặc ORC) + phân vùng giảm đáng kể dữ liệu được quét và chi phí. Kỳ thi có thể hỏi cách giảm chi phí Athena.
- **Glue Crawler**: "Tự động khám phá schema của dữ liệu S3" → Glue Crawler.
- **Amazon Data Firehose**: "Tự động tải dữ liệu streaming vào S3/Redshift/OpenSearch mà không quản lý consumer" → Amazon Data Firehose. Các tài liệu cũ có thể vẫn gọi nó là Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift cho các truy vấn tần suất cao, phức tạp trên một tập dữ liệu cố định (dashboard BI). Athena cho các truy vấn ad-hoc trên dữ liệu S3 thay đổi thường xuyên.
- **EMR (Elastic MapReduce)**: Cụm Hadoop/Spark được quản lý bởi AWS. Kỳ thi sử dụng điều này khi "khối lượng công việc Hadoop/Spark hiện có" hoặc "các framework xử lý dữ liệu tùy chỉnh" được đề cập. Glue là lựa chọn thay thế được quản lý cho hầu hết các trường hợp sử dụng.

## Bài Tập

**Bài Tập 1 — Ghi Nhớ**

Giải thích sự khác biệt giữa Amazon Kinesis và Amazon SQS. Khi nào bạn sẽ dùng từng cái?

*(Gợi ý: Hãy nghĩ về số lượng consumer có thể đọc cùng một dữ liệu, tin nhắn có bị xóa sau khi đọc không, và thứ tự có quan trọng không.)*

**Bài Tập 2 — Luyện Tập Kỳ Thi**

*Kịch bản*: Một công ty chia sẻ xe muốn phân tích dữ liệu chuyến đi. 1 triệu chuyến đi được hoàn thành hằng ngày. Các bản ghi chuyến đi được lưu trữ trong S3 dưới dạng tệp JSON (khoảng 2KB mỗi tệp). Nhóm analytics muốn chạy các truy vấn SQL ad-hoc như "thời gian chuyến đi trung bình theo thành phố tuần qua." Các truy vấn nên hoàn thành trong dưới 2 phút. Chi phí lưu trữ nên được giảm thiểu. Nhóm sẽ chạy 20-30 truy vấn mỗi tuần.

Kiến trúc nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Tải dữ liệu chuyến đi vào RDS PostgreSQL hằng ngày; truy vấn bằng SQL tiêu chuẩn  
B) Sử dụng AWS Glue để chuyển đổi JSON sang định dạng Parquet được phân vùng theo ngày và thành phố; truy vấn bằng Amazon Athena  
C) Sử dụng Amazon Data Firehose để phân phối dữ liệu chuyến đi đến Amazon Redshift; truy vấn bằng Redshift  
D) Tải dữ liệu chuyến đi vào DynamoDB và dùng PartiQL cho các truy vấn SQL

**Gợi ý 1**: 20-30 truy vấn mỗi tuần là tần suất thấp. Dịch vụ nào tiết kiệm chi phí nhất cho truy vấn thỉnh thoảng?

**Gợi ý 2**: Định dạng Parquet + phân vùng giảm đáng kể dữ liệu được quét bởi Athena — và do đó chi phí.

**Gợi ý 3**: 1 triệu chuyến đi × 2KB = ~2GB mỗi ngày. Trong một tuần, ~14GB. Ở $5/TB cho Athena, ngay cả không có tối ưu hóa, điều này là chi phí hợp lý.

**Đáp án**: B

**Giải thích**: Glue chuyển đổi JSON sang Parquet (định dạng columnar giảm đáng kể dữ liệu được quét) được phân vùng theo ngày và thành phố (partition pruning có nghĩa là các truy vấn "tuần qua" chỉ quét 7 ngày phân vùng). Athena truy vấn S3 trực tiếp bằng SQL tiêu chuẩn. Cho 20-30 truy vấn mỗi tuần, Athena trả theo truy vấn là cực kỳ tiết kiệm chi phí so với Redshift luôn chạy.

**Tại sao không phải A?** Tải 2GB dữ liệu hằng ngày vào RDS, sau đó truy vấn, yêu cầu một instance cơ sở dữ liệu chạy 24/7. Cho 20-30 truy vấn mỗi tuần, điều này quá phức tạp và tốn kém.

**Tại sao không phải C?** Redshift tiết kiệm chi phí cho các truy vấn tần suất cao (hàng trăm mỗi ngày trên cùng tập dữ liệu). Cho 20-30 truy vấn mỗi tuần, cụm Redshift luôn bật tốn kém hơn nhiều so với giá theo truy vấn của Athena.

**Tại sao không phải D?** DynamoDB là kho key-value/document được tối ưu hóa cho truy cập dựa trên key, không phải các truy vấn analytics ad-hoc. PartiQL trên DynamoDB không hỗ trợ loại tổng hợp GROUP BY được mô tả.

*SAA-C03 Domain: Thiết Kế Kiến Trúc Hiệu Suất Cao — Task 3.5*

**Bài Tập 3 — Thử Thách Kiến Trúc** *(Tùy chọn)*

Nimbus muốn xây dựng hệ thống phát hiện gian lận thời gian thực cho đơn hàng. Hệ thống nên:

- Phát hiện các đơn hàng được đặt bởi cùng một tài khoản hơn 5 lần trong 60 giây
- Gắn cờ các đơn hàng trên $500 từ các tài khoản mới (< 30 ngày tuổi)
- Gửi các đơn hàng bị gắn cờ vào hàng đợi xem xét của con người

Thiết kế kiến trúc. Kinesis cung cấp gì? Logic gian lận chạy ở đâu? Làm thế nào để bạn tương quan "cùng tài khoản, cửa sổ 60 giây"? Dịch vụ nào nhận các đơn hàng bị gắn cờ?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành thiết kế kiến trúc streaming thời gian thực.)*

## Cảnh Sau Tín Dụng

Tom chạy truy vấn Athena đầu tiên.

"10 nhà hàng có doanh thu cao nhất quý vừa rồi," anh nói.

12 giây sau, kết quả xuất hiện.

Anh nhìn chằm chằm vào chúng.

"Nhà hàng 47 đứng đầu," anh nói. Đó là nhà hàng của gia đình Maya — nhà hàng nơi Nimbus bắt đầu.

"Tất nhiên rồi," Maya nói. "Arepa ngon như vậy mà."

Tom chạy thêm một truy vấn. Và rồi thêm nữa. Mỗi cái được trả lời trong vài giây, mỗi cái tốn chỉ một phần nhỏ của xu.

Sau một giờ, anh có một bức tranh hoàn chỉnh về hoạt động kinh doanh của Nimbus theo cách anh chưa từng có trước đây. Danh mục nhà hàng nào tăng trưởng nhanh nhất. Nhóm khách hàng nào có thời gian lưu giữ lâu nhất. Món ăn nào thúc đẩy nhiều đơn hàng lặp lại nhất.

"Tại sao chúng ta không xây dựng điều này sớm hơn?" anh hỏi.

"Chúng ta có dữ liệu," Leo nói. "Chúng ta chỉ không có pipeline để sử dụng nó."

"Dữ liệu luôn ở đó," Maya nói nhẹ nhàng. "Chúng ta chỉ không thể nhìn thấy nó."

Trong chương tiếp theo: giờ đây chúng ta có thể nhìn thấy hoạt động kinh doanh rõ ràng, hãy nói về cách trả tiền cho cơ sở hạ tầng chạy nó — hiệu quả hơn.
