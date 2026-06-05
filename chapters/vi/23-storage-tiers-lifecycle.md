# Chương 23: Hệ Thống Hồ Sơ Tự Sắp Xếp

Một công ty luật giữ các hồ sơ vụ kiện đang hoạt động trên bàn. S3 làm điều này tự động.

Tom đang xem xét hóa đơn. S3: $847/tháng.

"Khi nào lần cuối cùng ai đó truy cập bản sao lưu từ 18 tháng trước?" Tom hỏi.

Leo kiểm tra nhật ký truy cập. "Tháng Mười năm ngoái. Một lần. Để xác minh định dạng bản sao lưu."

**Các Lớp Lưu Trữ S3: Phổ Đầy Đủ**

**S3 Standard**: Cho dữ liệu truy cập thường xuyên. Độ trễ thấp.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Cho dữ liệu truy cập ít hơn một lần mỗi tháng. Truy xuất ngay lập tức, chi phí lưu trữ thấp hơn.

**S3 Glacier Instant Retrieval**: Lưu trữ dữ liệu truy cập thỉnh thoảng. Truy xuất ngay lập tức. Chi phí lưu trữ rất thấp.

**S3 Glacier Deep Archive**: Rẻ nhất. Truy xuất trong 12 giờ.

**Lifecycle Policy S3: Hệ Thống Hồ Sơ Tự Động**

**Lifecycle policy** thực hiện các chuyển đổi này tự động dựa trên các quy tắc.

Ví dụ policy lifecycle cho biên lai đơn hàng của Nimbus:

```
Chuyển sang S3 Standard-IA sau 90 ngày
Chuyển sang S3 Glacier Instant Retrieval sau 365 ngày
Chuyển sang S3 Glacier Deep Archive sau 2555 ngày (7 năm)
Xóa sau 2920 ngày (8 năm)
```

Tom đã kiểm tra khoản tiết kiệm dự kiến: từ $847/tháng xuống khoảng $220/tháng.

"Bằng cách chỉ xác định những gì cũ và nơi nó nên đến?" anh nói.

"Và S3 di chuyển nó tự động," Leo xác nhận.

## Tóm Tắt

- S3 có bảy lớp lưu trữ: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval và Glacier Deep Archive.
- **Lifecycle policy** tự động hóa các chuyển đổi giữa các lớp lưu trữ dựa trên tuổi.
- **S3 Intelligent-Tiering** tự động di chuyển các đối tượng giữa các tầng dựa trên các mẫu truy cập thực tế.
- **S3 Object Lock** cung cấp lưu trữ WORM cho các tình huống tuân thủ.

## Cảnh Sau Tín Dụng

Tom đã triển khai các lifecycle policy.

Hóa đơn S3 giảm từ $847 xuống $198 tháng tiếp theo.

Anh in bản so sánh và để trên bàn Maya mà không nói gì.

Chương tiếp theo: tầng cơ sở dữ liệu có cùng cuộc trò chuyện, và Aurora là câu trả lời mà Tom không mong đợi thích.
