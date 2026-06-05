# Chương 9: Khi Bảng Trở Nên Lớn

Bảng menu có 50.000 mục.

Đó là qua 287 nhà hàng, mỗi cái với các món đặc biệt theo ngày, các mục theo mùa và các biến thể khu vực. Một số mục có các thông số — kích thước, độ cay, lựa chọn protein. Một số có các gói combo tham chiếu đến các mục khác.

Truy vấn SQL truy xuất toàn bộ menu của một nhà hàng từng trả về trong 200 mili giây.

Bây giờ nó mất bốn giây.

Bốn giây là sự khác biệt giữa ai đó đặt hàng và ai đó đóng ứng dụng.

**Vấn Đề Với Việc Nhét Mọi Thứ Vào Bảng**

Đây là sự căng thẳng cốt lõi của cơ sở dữ liệu quan hệ: chúng được thiết kế để lưu trữ dữ liệu *có cấu trúc* trong các hình dạng *cố định*.

Nếu mọi mục menu đều có cùng các trường — tên, giá, mô tả, danh mục — SQL sẽ hoàn hảo. Nhưng menu thực tế không hoạt động theo cách đó.

**Cách Khác Để Nghĩ Về Dữ Liệu**

Cơ sở dữ liệu NoSQL lưu trữ dữ liệu khác nhau. Một cách tiếp cận phổ biến là *mô hình tài liệu*: mỗi bản ghi được lưu trữ dưới dạng tài liệu độc lập (thường là JSON), và các tài liệu trong cùng bộ sưu tập không nhất thiết phải có cùng các trường.

Một mục menu trong mô hình tài liệu có thể trông như thế này:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Một mục khác có thể trông hoàn toàn khác. Các hình dạng khác nhau. Cùng bộ sưu tập. Không có vấn đề gì.

**Gặp Gỡ DynamoDB**

Amazon DynamoDB là dịch vụ cơ sở dữ liệu NoSQL được quản lý của AWS. Nó lưu trữ dữ liệu dưới dạng các mục (không phải hàng), và các mục được thu thập vào các bảng.

Mỗi mục trong bảng DynamoDB phải có một **khóa chính**, xác định duy nhất nó. Mọi thứ còn lại đều linh hoạt.

Khóa chính có thể là một trong hai dạng:

**Chỉ khóa phân vùng**: Một thuộc tính duy nhất phải là duy nhất trong tất cả các mục.

**Khóa phân vùng + khóa sắp xếp (khóa chính phức hợp)**: Hai thuộc tính cùng nhau tạo thành một tổ hợp duy nhất.

Đối với menu của Nimbus:

- Khóa phân vùng: `restaurantId`
- Khóa sắp xếp: `itemId`

Điều này có nghĩa là bạn có thể truy xuất hiệu quả tất cả các mục cho một nhà hàng cụ thể — DynamoDB biết chính xác phân vùng nào để tìm kiếm.

**Chọn khóa phân vùng tốt**:

- **Tốt**: Cardinality cao, các giá trị phân phối đều (`restaurantId` với nhiều nhà hàng)
- **Xấu**: Cardinality thấp (`true/false`, `category`) — hầu hết dữ liệu đổ vào một vài phân vùng, tạo ra "điểm nóng"

**Các Chế Độ Dung Lượng**

**Dung lượng được cấp phép**: Bạn chỉ định bao nhiêu đơn vị đọc và ghi bạn muốn.

**Dung lượng theo yêu cầu**: DynamoDB tự động mở rộng với lưu lượng thực tế.

**Tính Nhất Quán**

**Đọc nhất quán cuối cùng**: Mặc định. Rẻ hơn, và kết quả có thể hơi chậm hơn so với lần ghi gần đây nhất.

**Đọc nhất quán mạnh**: DynamoDB có thể trả về giá trị commit mới nhất. Tốn nhiều dung lượng đọc hơn.

## Tóm Tắt

- DynamoDB là dịch vụ cơ sở dữ liệu NoSQL được quản lý của AWS.
- Các mục được lưu trữ dưới dạng tài liệu linh hoạt — không cần lược đồ cố định.
- Mỗi mục phải có **khóa chính**: chỉ khóa phân vùng, hoặc khóa phân vùng + khóa sắp xếp.
- **Theo yêu cầu** tự động mở rộng; **được cấp phép** rẻ hơn nếu lưu lượng của bạn có thể đoán trước.
- Đọc **nhất quán cuối cùng** rẻ và nhanh hơn. Đọc **nhất quán mạnh** luôn cập nhật.

## Mẹo Thi

*SAA-C03 Domain: Thiết kế kiến trúc hiệu suất cao (Domain 3, Task 3.3)*

- Biết quy tắc khóa phân vùng: **cardinality cao, phân phối đều**. Các phân vùng nóng là bẫy thi phổ biến.
- **DynamoDB Streams**: Chụp thay đổi cấp độ mục theo thời gian thực.
- **DAX (DynamoDB Accelerator)**: Lớp bộ nhớ đệm trong bộ nhớ cho DynamoDB.

## Cảnh Sau Tín Dụng

Leo đã di chuyển menu sang DynamoDB vào cuối tuần. Các lần đọc nhanh. Lược đồ linh hoạt.

Sau đó Priya nhìn vào bảng điều khiển giám sát.

"Leo," cô nói, "mỗi lần tải trang đang thực hiện bốn mươi bảy yêu cầu DynamoDB."

"Một cho mỗi nhà hàng," Leo xác nhận. "Vì khách hàng đang ở trang duyệt tất cả."

"Và mỗi yêu cầu mất khoảng bốn mili giây."

Leo làm toán. Bốn mươi bảy nhân bốn. "Đó là... một trăm tám mươi tám mili giây chỉ cho menu. Trước khi kết xuất."

"Trên mỗi lần tải trang."

"Cho mỗi khách hàng."

Anh nhìn chằm chằm vào màn hình.

"Chúng ta cần bộ nhớ đệm," anh nói.

Chương tiếp theo: lớp giữa ứng dụng Nimbus và cơ sở dữ liệu của nó giúp truy vấn chậm trở nên nhanh.
