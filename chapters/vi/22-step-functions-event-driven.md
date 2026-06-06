# Chương 22: Sơ Đồ Tự Chạy

Leo đã nhìn chằm chằm vào cùng một file log suốt một giờ. Các stack trace đủ rõ ràng khi xét riêng từng cái, nhưng mẫu xuyên suốt chúng — cái cách một bước thất bại âm thầm và bước tiếp theo vẫn chạy — đã mất của anh một lúc để nhận ra. Cuối cùng anh ngả người ra sau, đặt cốc cà phê xuống, và viết một từ duy nhất lên cuốn sổ tay: *điều phối*.

Hãy tưởng tượng một nhạc trưởng bước khỏi bục giữa buổi diễn. Dàn nhạc vẫn tiếp tục chơi — nhưng không ai đưa kèn đồng vào ở nhịp 47, không ai báo hiệu sự im lặng trước phần kết. Từng nhạc công chơi đúng phần của mình. Buổi diễn vẫn sụp đổ, vì các phần phụ thuộc vào sự điều phối mà không ai đang quản lý.

Đó là vấn đề Leo đã tìm thấy trong code xác nhận đơn hàng. Không phải một bug ở bất kỳ bước riêng lẻ nào. Một thất bại về điều phối.

---

Các container đang chạy đúng và triển khai sạch sẽ. Pipeline triển khai ECS đã vững chắc. Nhưng bên trong code ứng dụng, một loại thất bại khác đã tích lũy trong nhiều tuần. Các container thì ổn. Logic bên trong một trong số chúng thì không.

Leo đã theo dõi mẫu này trong các log nhưng không hiểu nó cho đến khi anh đếm số lần xảy ra.

Mười một lần. Trong hai tuần.

---

Một lần xác nhận đơn hàng tại Nimbus đòi hỏi năm thứ xảy ra tuần tự: tính phí thẻ, gửi email xác nhận, thông báo nhà hàng, cập nhật tồn kho, và ghi nhật ký giao dịch cho kế toán.

Khi Leo viết hàm xác nhận đơn hàng ban đầu, anh đã bọc toàn bộ trong một khối `try/except` duy nhất và nói "sẽ ổn thôi — chúng ta sẽ bắt các lỗi trong log." Đó là tám tháng trước.

Nó không ổn.

Nếu bước ba thất bại — nếu thông báo nhà hàng hết thời gian — bước một và hai đã xảy ra rồi. Khách hàng đã bị tính tiền. Email đã được gửi. Nhưng nhà hàng không biết đơn hàng tồn tại.

Leo có một tên cho loại bug này: thành công một phần. "Mọi thứ đều hoạt động," anh nói, "ngoại trừ phần quan trọng."

"Chuyện này đã xảy ra bao nhiêu lần?" Maya hỏi.

"Mười một lần trong hai tuần qua. Chúng ta bắt được hầu hết từ các cuộc gọi giận dữ đến nhà hàng. Hai cái chúng ta tìm thấy trong log, sau khi sự việc đã rồi."

"Vậy chúng ta không có điều phối," Priya nói. "Năm bước, chạy như một script, không có gì đảm bảo tất cả chúng hoàn tất. Và nếu có ai cố đột nhập trong bước hai — sau khi tính phí qua nhưng trước khi nhà hàng được thông báo thì sao? Chúng ta đã tính tiền khách hàng cho một đơn hàng mà nhà hàng không có."

"Hoặc rằng chúng hoàn tất theo đúng thứ tự."

"Hoặc rằng chúng ta biết cái nào đã thất bại."

Leo mở code lên máy chiếu. Đó là một hàm Python: năm mươi dòng, năm lệnh gọi API tuần tự, một khối try/except duy nhất bao quanh toàn bộ.

"Chúng ta cần một workflow," Maya nói. "Cái gì đó theo dõi từng bước. Khoan — nhưng *tại sao* chúng ta không thể chỉ thêm xử lý lỗi tốt hơn vào hàm Python hiện có? Tại sao chúng ta cần cả một dịch vụ mới?"

"Vì xử lý lỗi tốt hơn vẫn chạy trong một tiến trình đơn lẻ có thể thất bại ở bất kỳ điểm nào," Leo nói. "Nếu máy chủ khởi động lại giữa lúc thực thi, việc xử lý lỗi khởi động lại cùng nó. Step Functions lưu giữ trạng thái ở bên ngoài."

Hãy nghĩ về một danh sách kiểm tra sản xuất — một cái mà mỗi trạm xác nhận hoàn tất trước khi chuyển sang trạm tiếp theo, và nơi toàn bộ dây chuyền giữ vị trí của nó khi có điều gì đó thất bại. Dây chuyền không khởi động lại từ đầu. Nó tiếp tục từ đúng trạm đã thất bại. Trạng thái của trạm đó được ghi lại. Các bước trước nó đã xong và không lặp lại. Các bước sau nó chờ cho đến khi vấn đề được giải quyết.

Đó là cái mà luồng xác nhận đơn hàng cần. Không phải thêm code quanh vấn đề. Một hệ thống được thiết kế để quản lý vấn đề.

**AWS Step Functions: Điều Phối Workflow**

**AWS Step Functions** là một dịch vụ điều phối serverless phối hợp các bước của một ứng dụng như một workflow trực quan. Mỗi bước là một **state** trong một **state machine**.

Thay vì một script Python chạy từ trên xuống dưới và sập, bạn định nghĩa workflow như một state machine JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Mỗi state có thể:

- **Thực thi một hàm Lambda** (mẫu phổ biến nhất)
- **Thực thi một ECS task** (cho công việc chạy lâu hơn)
- **Chờ một thời điểm cụ thể** hoặc **sự kiện** (tạm dừng workflow cho đến khi điều gì đó bên ngoài xảy ra)
- **Chọn một con đường** dựa trên các điều kiện (logic if/else)
- **Chạy các nhánh song song** đồng thời
- **Thử lại khi thất bại** với backoff có thể cấu hình
- **Bắt các lỗi** và định tuyến đến các state xử lý lỗi

Step Functions quản lý trạng thái thực thi một cách bền vững. Nếu bước 3 thất bại, lần thực thi tạm dừng ở bước 3. Bạn có thể kiểm tra lần thực thi thất bại trong console, sửa vấn đề, và khởi động lại từ bước 3 — mà không lặp lại bước 1 và 2.

Bạn có thể đang thắc mắc: bạn không thể chỉ viết logic thử lại trong hàm Lambda của bạn sao? Có thể — nhưng rồi bạn cũng đang viết theo dõi thất bại, lưu giữ trạng thái, và ghi log audit trong code. Và khi bước 3 trong 7 thất bại, bạn cần biết nhà hàng nào đang được xử lý, điều gì đã xảy ra trước đó, và tiếp tục ở đâu. Step Functions làm tất cả những điều đó.

**Luồng Đơn Hàng Nimbus: State Machine Có Chú Thích**

Đây là một phiên bản đơn giản hóa của state machine Step Functions thực tế mà Nimbus đã xây dựng cho xác nhận đơn hàng — được chú thích để bạn có thể thấy mỗi phần làm gì:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Vài điều cần chú ý:

**`ChargeCard` có hai mệnh đề Catch.** Một cho `PaymentDeclinedError` (một thất bại đã biết, được mong đợi — thẻ bị từ chối, không phải lỗi hệ thống) và một cho `States.ALL` (bất cứ thứ gì khác — một lần mất điện hệ thống, một timeout, một exception bất ngờ). Chúng định tuyến đến các state khác nhau vì chúng có nghĩa khác nhau.

**`NotifyRestaurant` có một Catch định tuyến đến `RestaurantNotificationFailed`.** Đây là cái bug đã gây ra mười một sự cố. Trong script Python cũ, không có cái tương đương — nếu thông báo thất bại, hàm hoặc sập âm thầm hoặc ghi log một lỗi và tiếp tục. Step Functions làm cho con đường thất bại trở nên tường minh: nó đi đến một nơi cụ thể, và nơi đó cảnh báo đội hỗ trợ trước khi có ai phải gọi.

**Mỗi Task có Retry.** Nếu dịch vụ email có một timeout thoáng qua, nó thử lại tự động, ba lần, với backoff tăng dần. Khách hàng không bao giờ thấy điều này. Đơn hàng không bị mất.

**Luồng là một đồ thị, không phải một script.** Nếu `NotifyRestaurant` thất bại vĩnh viễn (sau các lần thử lại), việc thực thi không tiếp tục đến `UpdateInventory`. Workflow dừng ở `RestaurantNotificationFailed`. Tồn kho không được cập nhật cho một nhà hàng không biết về đơn hàng. Đây là hành vi đúng.

"Khoan — nhưng *tại sao* chúng ta cần các con đường thất bại riêng cho thẻ bị từ chối so với lỗi hệ thống?" Maya hỏi.

"Vì chúng đòi hỏi các phản ứng hoàn toàn khác nhau," Leo nói. "Một thẻ bị từ chối nghĩa là chúng ta email khách hàng và yêu cầu họ thử lại. Một lỗi hệ thống trong hàm tính phí nghĩa là chúng ta cần một kỹ sư điều tra tại sao hàm Lambda đang thất bại. Cùng kết quả quan sát được — đơn hàng không thành công — nhưng việc khắc phục hoàn toàn khác nhau."

**Các Loại State: Các Khối Xây Dựng**

**Task**: Thực thi một hành động — gọi một hàm Lambda, khởi động một ECS task, gọi một API. Đây là nơi công việc thực sự xảy ra.

**Choice**: Rẽ nhánh dựa trên các điều kiện trong dữ liệu đầu vào. Như một if/else trong code.

**Parallel**: Chạy nhiều nhánh đồng thời và chờ tất cả hoàn tất.

**Map**: Áp dụng một tập state cho mỗi mục trong một danh sách. Xử lý 50 món thực đơn nhà hàng song song.

Khi Nimbus import thực đơn của một nhà hàng, thực đơn có thể chứa từ 8 đến 200 món. Đối với mỗi món, quy trình import cần: xác thực định dạng, kiểm tra dữ liệu chất gây dị ứng, thay đổi kích thước ảnh, và ghi bản ghi vào DynamoDB.

Không có state Map, đây sẽ là một Lambda đơn lẻ xử lý các món tuần tự — 200 món × 200ms mỗi món = 40 giây thời gian xử lý. Với state Map, Step Functions khởi chạy các lần thực thi đồng thời của các state xử lý — tới giới hạn concurrency được cấu hình — và chờ tất cả chúng hoàn tất. Cùng 200 món có thể xong trong dưới 5 giây.

**Wait**: Tạm dừng trong một thời gian được chỉ định hoặc cho đến một dấu thời gian. Hữu ích cho các trì hoãn được lên lịch.

**Pass**: Truyền đầu vào sang đầu ra mà không làm việc. Được dùng cho biến đổi dữ liệu và kiểm thử.

**Succeed/Fail**: Các state cuối kết thúc lần thực thi.

Đối với việc đăng ký nhà hàng, Leo thiết kế một workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, với 3 lần thử lại)
3. Nhánh song song:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, chờ song song hoàn tất)
5. NotifySalesTeam (Task → Lambda)

Các bước 3a và 3b chạy song song — chúng không phụ thuộc vào nhau, và chạy chúng đồng thời tiết kiệm thời gian.

Sau khi nhóm nhà hàng đầu tiên hoàn tất đăng ký, một yêu cầu tuân thủ nổi lên: trước khi một đối tác nhà hàng có thể đi vào hoạt động, một account manager của Nimbus phải xem xét và phê duyệt thủ công tài liệu giấy phép. Điều này có thể mất một đến ba ngày làm việc.

"Và nếu có ai cố đột nhập trong cửa sổ đó thì sao?" Priya hỏi. "Nếu nhà hàng được cấu hình một phần — tài khoản thanh toán đã tạo nhưng chưa được phê duyệt — và có người phát hiện ra trạng thái đang chờ, họ có thể cố khai thác cấu hình nửa-mở."

Thực tế hơn: làm sao bạn tạm dừng một workflow Step Functions trong ba ngày để chờ một con người?

Câu trả lời là **mẫu callback với task token**.

Khi `ValidateLicense` chạy, thay vì hoàn tất tự động, nó gọi một Lambda làm ba việc:

1. Gửi một email đến account manager với các tài liệu của nhà hàng
2. Ghi một **task token** (một định danh duy nhất Step Functions tạo ra cho lần thực thi và state cụ thể này) trong một database, liên kết với việc xem xét đang chờ đó
3. Trả về cho Step Functions với `.waitForTaskToken` — vốn báo cho Step Functions tạm dừng việc thực thi ở state này vô thời hạn

Step Functions đỗ lại lần thực thi. Không gì khác bị chặn — không máy chủ nào ngồi chờ. State machine chỉ chờ, không tiêu thụ tài nguyên compute nào.

Ba ngày sau, account manager nhấp "Approve" trong công cụ admin nội bộ. Công cụ admin tra cứu task token từ database và gọi:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions tiếp tục. Lần thực thi tiếp tục từ bước 2 (`ImportMenu`), với thông tin của người xem xét sẵn có trong trạng thái workflow.

"Lần thực thi đã bị tạm dừng ba ngày," Leo nói, "và điều duy nhất xảy ra khi tôi phê duyệt nó là một lệnh gọi API."

"Và nếu account manager từ chối nó?" Maya hỏi.

"Chúng ta gọi `send_task_failure` thay vào. State machine bắt cái đó và định tuyến đến một state `NotifyRejection` email đối tác nhà hàng."

Step Functions không poll. Nó không thử lại. Nó không timeout (trừ khi bạn đặt một heartbeat timeout). Nó đơn giản chờ cho đến khi callback đến, rồi tiếp tục. Điều này về cơ bản khác với việc poll một database hay một hàng đợi — và đó là lý do tại sao Step Functions phù hợp tốt cho các workflow trộn các bước tự động và thủ công.

**Đọc Console Thực Thi: Một Thất Bại Trông Như Thế Nào**

Khi Lambda thông báo nhà hàng timeout trong tuần đầu tiên của Nimbus trên Step Functions, Leo mở console Step Functions và nhấp vào lần thực thi thất bại.

**Execution Event History** hiển thị một dòng thời gian về chính xác những gì đã xảy ra:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

Trong 42 giây, Step Functions đã tính phí thẻ, gửi email, thử thông báo nhà hàng ba lần, bắt thất bại, cảnh báo đội hỗ trợ, và ghi lại toàn bộ lịch sử. Trước Step Functions, thất bại này sẽ vô hình — hàm Python sẽ ghi log "notification failed" và trả về 200 cho bên gọi như thể không có gì sai.

"Dòng thời gian hiển thị chính xác mọi thứ sai ở đâu và khi nào," Leo nói. "Và mỗi lần thử lại được gắn dấu thời gian. Bạn có thể thấy các khoảng backoff."

Priya nhìn vào console. "Và lịch sử này được lưu trữ bao lâu?"

Lịch sử thực thi của Standard workflow được lưu trữ trong 90 ngày. Đối với tuân thủ hoặc audit dài hạn, các sự kiện thực thi cũng có thể được export sang CloudWatch Logs và giữ lại vô thời hạn.

**Standard so với Express Workflow**

Step Functions cung cấp hai loại workflow:

**Standard workflow**:

- Thời lượng tối đa: 1 năm
- Các lần thực thi bền vững — trạng thái được lưu giữ, có thể kiểm tra và audit
- Thực thi đúng một lần (một task không bao giờ chạy quá một lần trừ khi bạn cấu hình một Retry)
- Định giá mỗi chuyển trạng thái
- Tốt nhất cho các workflow chạy lâu, quan trọng (xử lý đơn hàng, đăng ký, các luồng thanh toán)

**Express workflow**:

- Thời lượng tối đa: 5 phút
- Thông lượng cao hơn — tới 100.000 mỗi giây
- Thực thi ít nhất một lần (bất đồng bộ) hoặc nhiều nhất một lần (đồng bộ) — thiết kế các task để idempotent
- Định giá mỗi thời lượng (như Lambda)
- Tốt nhất cho các workflow khối lượng cao, thời lượng ngắn (xử lý sự kiện thời gian thực, thu nạp dữ liệu IoT)

"Cái đó tốn bao nhiêu mỗi tháng?" Tom hỏi, mở trang giá. "Mỗi chuyển trạng thái cho Standard — cái đó cộng dồn nếu bạn có nhiều bước."

Leo đi qua phép tính. Đối với workflow đăng ký nhà hàng (sáu task state mỗi lần thực thi, khoảng 12-15 nhà hàng mới mỗi tháng): ít hơn một trăm chuyển trạng thái — ít hơn một xu, và hoàn toàn nằm trong free tier hàng tháng 4.000 chuyển trạng thái, nên thực tế là $0. Đối với workflow xác nhận đơn hàng ở lưu lượng Nimbus đầy đủ: có ý nghĩa hơn, nhưng vẫn thấp hơn nhiều so với chi phí gỡ lỗi mười một thành công một phần mỗi tháng một cách thủ công.

"Thời gian gỡ lỗi là chi phí ẩn," Leo nói.

"Đó luôn là chi phí ẩn," Tom nói.

Tom chạy các con số cẩn thận hơn, vì đó là Tom.

**Chi phí Standard workflow cho luồng xác nhận đơn hàng của Nimbus**: năm state mỗi đơn hàng trên con đường suôn sẻ, ở $0.000025 mỗi chuyển trạng thái. Năm chuyển trạng thái × $0.000025 × 15.000 đơn hàng mỗi tháng = **$1.88/tháng**. Ở mười lần khối lượng đơn hàng: khoảng $19/tháng. Chi phí gỡ lỗi cho một sự cố thành công-một-phần (24 phút thời gian của kỹ sư hỗ trợ) vượt quá hóa đơn Step Functions hàng tháng nhiều lần.

So sánh trở nên quan trọng nếu có ai đề xuất dùng Standard workflow cho các sự kiện phân tích tần suất cao. Giả sử Nimbus muốn dùng Step Functions để xử lý mọi sự kiện clickstream thô — mọi lần xem trang thực đơn, mọi lần cuộn, mọi lần tìm kiếm. Đó là khoảng 800.000 sự kiện mỗi ngày ở quy mô hiện tại của họ. Một Standard workflow năm-state cho mỗi sự kiện: 800.000 × 5 × $0.000025 × 30 ngày = **$3.000/tháng**. Đó là tiền thật cho một analytics pipeline.

Express workflow cho cùng khối lượng đó: định giá mỗi request cộng thời lượng, không phải mỗi chuyển trạng thái. 24 triệu lần thực thi hàng tháng tốn $1.00 mỗi triệu request = $24. Thời lượng: 24M × 500ms ở mức billing tối thiểu 64MB ≈ 208 GB-giờ × $0.06 = $12.50. Tổng ≈ **$36.50/tháng** — gần hai bậc độ lớn rẻ hơn $3.000 của Standard.

"Vậy loại workflow không chỉ là một quyết định kiến trúc," Tom nói. "Nó là một quyết định chi phí. Cùng số lượng state có thể tốn gần một trăm lần nhiều hơn tùy vào loại workflow nào bạn dùng."

"Và cái nào tốt hơn phụ thuộc hoàn toàn vào việc workflow làm gì," Leo nói. "Xác nhận đơn hàng: Standard. Nó quan trọng, nó có các con đường thất bại có ý nghĩa, chúng ta muốn dấu vết audit. Xử lý sự kiện phân tích: Express. Nó khối lượng cao, thời lượng ngắn, và chúng ta không cần lịch sử thực thi 90 ngày cho mỗi lần xem trang."

Nếu quy trình của bạn có hai bước và không cần dấu vết audit, một hàm Lambda đơn giản rẻ hơn và không đòi hỏi cú pháp state machine JSON — nhưng nếu bất kỳ bước nào có thể thất bại độc lập và cần được thử lại hoặc khởi động lại mà không lặp lại các bước trước đó, Step Functions tự trang trải chi phí của nó qua việc giảm gỡ lỗi và khắc phục thủ công.

Đối với việc đăng ký nhà hàng của Nimbus: Standard (nó quan trọng, bền vững, có thể mất hàng giờ nếu các bước thủ công liên quan).

Đối với cập nhật trạng thái đơn hàng thời gian thực của Nimbus: Express (khối lượng cao, thời lượng ngắn, ít quan trọng hơn).

**Kiến Trúc Hướng Sự Kiện: Bức Tranh Lớn Hơn**

Step Functions là một mảnh của một mẫu lớn hơn: **kiến trúc hướng sự kiện (event-driven architecture)**. Thay vì các dịch vụ gọi nhau trực tiếp (ghép chặt), các dịch vụ phát ra các sự kiện, và các dịch vụ khác phản ứng với những sự kiện đó.

Chúng ta đã thấy điều này xuyên suốt cuốn sách:

- Đơn hàng được đặt → SNS publish sự kiện → các hàng đợi SQS giao đến các consumer
- File S3 được tải lên → Lambda được kích hoạt để xử lý nó
- Bản ghi DynamoDB thay đổi → DynamoDB Streams → Lambda cập nhật một cache

**Amazon EventBridge** (trước đây là CloudWatch Events) là event bus nâng cao cho mẫu này. Nó định tuyến các sự kiện từ các dịch vụ AWS và các ứng dụng của riêng bạn đến các target (Lambda, SQS, Step Functions, v.v.) dựa trên các quy tắc.

EventBridge cho phép ghép lỏng ở cấp độ kiến trúc: dịch vụ order publish các sự kiện `order.placed` mà không biết ai đang lắng nghe. Dịch vụ phân tích, dịch vụ thông báo, và dịch vụ điểm thưởng tất cả đều lắng nghe độc lập. Thêm một người nghe mới không đòi hỏi thay đổi dịch vụ order.

EventBridge cũng tích hợp một cách tự nhiên với hàng chục dịch vụ AWS như các **nguồn sự kiện**. Khi một lệnh gọi API CloudTrail khớp với một mẫu, EventBridge có thể kích hoạt một quy tắc. Khi một EC2 instance đổi trạng thái, EventBridge có thể kích hoạt một Lambda. Khi một RDS instance failover, EventBridge có thể cảnh báo kỹ sư trực. Bạn có thể coi toàn bộ control plane AWS như một dòng sự kiện.

Đối với Nimbus, một quy tắc EventBridge đặc biệt hữu ích: kích hoạt một Lambda mỗi khi một image mới được đẩy lên ECR. Lambda kiểm tra kết quả quét image và đăng vào kênh Slack kỹ thuật nếu bất kỳ CVE HIGH hay CRITICAL nào được tìm thấy — trước khi có ai triển khai image. Điều này kết hợp việc quét bảo mật của ECR (từ chương 21) với việc định tuyến sự kiện của EventBridge thành một cổng bảo mật tự động.

Nguyên lý của kiến trúc hướng sự kiện giống như logic thử lại của Step Functions: làm cho thất bại trở nên tường minh và được định tuyến, không phải âm thầm và bị nuốt. Các dịch vụ giao tiếp qua các sự kiện thất bại một cách duyên dáng — nếu Lambda điểm thưởng bị tắt khi một sự kiện `OrderConfirmed` kích hoạt, EventBridge có thể thử lại việc giao hoặc gửi đến một dead-letter queue. Bản thân việc xác nhận đơn hàng không bị ảnh hưởng. Sự tách rời chính là khả năng chống chịu.

**EventBridge: Tách Rời Các Tác Dụng Phụ Khỏi Luồng Chính**

Sau khi state machine xác nhận đơn hàng đang chạy sạch sẽ, Maya nêu một câu hỏi tại buổi review kiến trúc tiếp theo.

"Chúng ta muốn thêm điểm thưởng khi một đơn hàng được xác nhận. Khách hàng nhận một điểm mỗi đô la chi tiêu. Cái đó đi đâu trong state machine?"

Bản năng đầu tiên của Leo: thêm một state `GrantLoyaltyPoints` sau `LogTransaction`.

Phản hồi của Priya: "Và rồi khi chúng ta thêm các khoản thưởng giới thiệu? Và các khảo sát sau đơn hàng? Và các yêu cầu đánh giá nhà hàng? Mỗi cái thêm một state vào con đường tới hạn. Nếu Lambda điểm thưởng thất bại, toàn bộ việc xác nhận đơn hàng thất bại."

"Luồng xác nhận đơn hàng nên làm một việc," cô nói. "Xác nhận đơn hàng. Mọi thứ khác là một tác dụng phụ."

Đây là lập luận kiến trúc cho **Amazon EventBridge** như cơ chế để ghép-lỏng các tác dụng phụ khỏi workflow chính.

Cách tiếp cận đã sửa: khi state `LogTransaction` hoàn tất thành công, Lambda publish một sự kiện đến EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Rồi các quy tắc EventBridge định tuyến sự kiện đó đến các target độc lập:

- **Quy tắc 1**: `OrderConfirmed` → Lambda Điểm Thưởng (cấp 32 điểm cho một đơn hàng $32)
- **Quy tắc 2**: `OrderConfirmed` → Lambda Khảo Sát Sau Đơn Hàng (xếp hàng một khảo sát cho 2 giờ sau khi giao)
- **Quy tắc 3**: `OrderConfirmed` → Kinesis Stream Phân Tích (cấp cho dashboard thời gian thực)

Mỗi quy tắc độc lập. Lambda Điểm Thưởng có thể thất bại mà không ảnh hưởng đến hàng đợi khảo sát. Analytics pipeline có thể bị tụt lại mà không chặn hệ thống điểm thưởng. Thêm một tác dụng phụ mới (một yêu cầu đánh giá nhà hàng, một thông báo hoàn tiền) đòi hỏi tạo một quy tắc EventBridge mới — không sửa đổi state machine.

"Và nếu có ai cố đột nhập qua một quy tắc EventBridge thì sao?" Priya hỏi. "Nếu sự kiện chứa PII khách hàng, mỗi Lambda nhận nó giờ là một điểm truy cập PII."

Sự kiện được thiết kế cẩn thận: chỉ các ID, không phải tên, địa chỉ, hay chi tiết thanh toán. Bất kỳ Lambda nào cần dữ liệu khách hàng sẽ tra cứu nó từ database dùng customer ID — với các quyền IAM riêng của nó kiểm soát cái nó có thể truy cập.

"Sự kiện là một tín hiệu," Priya nói. "Không phải một bãi dữ liệu."

**Khi Step Functions Là Công Cụ Đúng**

Step Functions xuất sắc khi bạn có:

**Các workflow nhiều bước** cần theo dõi tiến trình qua các bước

**Các quy trình có con người tham gia (human-in-the-loop)** — Step Functions có thể chờ vô thời hạn cho một sự kiện bên ngoài (như một con người phê duyệt điều gì đó) rồi tiếp tục

**Xử lý lỗi ở quy mô** — logic retry, catch, và fallback được tích hợp qua nhiều bước

**Các quy trình có thể audit** — mỗi lần thực thi ghi lại mọi chuyển trạng thái. Bạn có thể thấy chính xác những gì đã xảy ra và khi nào.

**Logic song song hoặc tuần tự phức tạp** — workflow trực quan làm cho việc lý luận về nó dễ hơn so với code tương đương

Step Functions là quá mức cần thiết cho các quy trình hai bước đơn giản. Dùng nó khi bản thân việc điều phối có giá trị và các kịch bản thất bại quan trọng.

**Khi Step Functions Là Công Cụ Sai**

"Khoan — nhưng *tại sao* chúng ta lại không dùng Step Functions cho mọi thứ?" Maya hỏi vào cuối buổi thiết kế. "Chúng ta đã xây dựng workflow đăng ký nhà hàng. Chúng ta có luồng xác nhận đơn hàng. Tại sao không chuyển mọi thứ thành state machine?"

Câu trả lời trung thực: vì Step Functions thêm chi phí phụ trội mà không phải mọi workflow đều biện minh được.

**Các quy trình hai bước đơn giản**: Nếu bạn có một Lambda xử lý một file đã tải lên bằng cách gọi một Lambda thứ hai, chi phí điều phối phụ trội của một state machine không đáng với lợi ích vận hành. Hai Lambda được gọi tuần tự trong một hàm duy nhất thì đơn giản hơn, dễ kiểm thử hơn, và không có chi phí mỗi-chuyển-trạng-thái.

**Các workflow tần suất siêu cao, dưới-giây**: Standard workflow có một chi phí mỗi-chuyển-trạng-thái không tầm thường tích lũy ở khối lượng cao (như ví dụ phân tích ở trên cho thấy). Express workflow giải quyết vấn đề chi phí nhưng không cung cấp lịch sử trạng thái bền vững. Ở tần suất rất cao với thời lượng rất ngắn, SQS cộng Lambda (mẫu từ chương 19) thì đơn giản hơn và rẻ hơn cả hai loại Step Functions.

**Fan-out thuần không có điều phối**: Nếu bạn cần gửi cùng một sự kiện đến hai mươi consumer và không quan tâm đến kết quả của mỗi cái, SNS là công cụ. Step Functions thêm theo dõi trạng thái mà bạn không cần và sẽ trả tiền một cách không cần thiết.

**Các tương tác người dùng đồng bộ thời gian thực**: Các lần thực thi Step Functions là bất đồng bộ. Nếu một người dùng đang chờ ở màn hình thanh toán cho một phản hồi đồng bộ trong dưới 500ms, một Standard workflow của Step Functions không được thiết kế cho điều này (Express workflow có thể được gọi đồng bộ, nhưng chi phí phụ trội về độ trễ vẫn cao hơn một lệnh gọi Lambda trực tiếp). Đối với các luồng đối mặt người dùng đồng bộ, Lambda + API Gateway với xử lý lỗi được thiết kế tốt thường phù hợp hơn.

Nguyên lý: dùng Step Functions khi bản thân việc *điều phối* các bước phức tạp — khi các bước có thể thất bại độc lập, khi bạn cần thử lại các bước riêng lẻ mà không lặp lại các bước trước, khi lịch sử thực thi có giá trị tuân thủ hoặc gỡ lỗi, hoặc khi workflow liên quan đến các bước phê duyệt của con người có thể mất nhiều ngày. Đừng dùng nó để thêm chi phí điều phối phụ trội vào logic tuần tự đơn giản chạy tốt như một hàm duy nhất.

## Điểm Mạnh Và Hạn Chế

**Tại sao Step Functions mạnh mẽ**:

- Lịch sử thực thi trực quan — thấy chính xác workflow đang ở đâu (hoặc đã thất bại)
- Retry và xử lý lỗi tích hợp — không cần code retry tùy chỉnh
- Trạng thái bền vững — các lần thực thi sống sót qua các lần khởi động lại dịch vụ và mất điện
- Tích hợp trực tiếp với 200+ dịch vụ AWS (không chỉ Lambda)
- Workflow trực quan tự ghi tài liệu
- Mẫu callback cho phép chờ vô thời hạn cho các hành động của con người mà không tiêu thụ compute

**Khi nào nó trở nên phức tạp**:

- Standard workflow được định giá mỗi chuyển trạng thái — các workflow phức tạp với nhiều state có thể trở nên đắt ở quy mô
- Định dạng JSON ASL (Amazon States Language) có một đường cong học tập
- Kích thước payload tối đa là 256KB — dữ liệu lớn phải được truyền qua các tham chiếu S3, không trực tiếp qua workflow
- Các workflow chạy lâu với nhiều bước thủ công đòi hỏi cấu hình timeout cẩn thận
- Gỡ lỗi các lỗi ASL đòi hỏi chạy các lần thực thi; không có trình giả lập cục bộ nào có khả năng như dịch vụ thực
- Các quyền IAM phải được cấp riêng cho mỗi tài nguyên mà state machine gọi — quên một quyền gây ra một lỗi khó hiểu lúc chạy

## Tóm Tắt

Các container trong chương 21 làm cho các lần triển khai đáng tin cậy. Step Functions làm cho các quy trình kinh doanh nhiều bước đáng tin cậy — cùng nguyên lý "loại bỏ rủi ro bàn giao" áp dụng vào logic ứng dụng.

- **Step Functions** điều phối các workflow nhiều bước như các state machine.
- Mỗi **state** có thể chạy một hàm Lambda, thực thi một ECS task, chờ, rẽ nhánh, hoặc chạy các bước song song.
- **Retry và catch** được tích hợp vào mỗi state — không cần code retry tùy chỉnh.
- **Standard workflow**: chạy lâu (tới 1 năm), bền vững, đúng một lần. Cho các quy trình kinh doanh tới hạn.
- **Express workflow**: thời lượng ngắn (tới 5 phút), thông lượng cao. Cho xử lý sự kiện khối lượng cao.
- **Mẫu callback với task token**: tạm dừng một workflow vô thời hạn để chờ một sự kiện bên ngoài hoặc hành động của con người; tiếp tục với một lệnh gọi API duy nhất.
- **State Map**: xử lý một danh sách các mục đồng thời — thay thế các vòng lặp tuần tự bằng fan-out song song.
- **Tích hợp SDK trực tiếp**: gọi DynamoDB, S3, SQS, và 200+ dịch vụ AWS trực tiếp từ một state, không cần một lớp bọc Lambda.
- **EventBridge**: tách rời các tác dụng phụ khỏi workflow chính — publish một sự kiện duy nhất, để các quy tắc độc lập định tuyến nó đến các dịch vụ điểm thưởng, phân tích, và khảo sát mà không sửa đổi state machine cốt lõi.
- **Chi phí Standard so với Express**: Standard ở $0.000025 mỗi chuyển trạng thái hoạt động tốt cho các workflow tới hạn khối lượng thấp (xác nhận đơn hàng ở $1.88/tháng cho Nimbus). Express ở định giá mỗi-request-cộng-thời-lượng phù hợp cho các sự kiện tần suất cao nơi Standard sẽ tốn nhiều chục lần hơn (~80 lần trong phép tính clickstream của Nimbus).
- **Kiến trúc hướng sự kiện** dùng các dịch vụ như SNS, SQS, Lambda, và EventBridge để tách rời các hệ thống xung quanh các sự kiện thay vì các lệnh gọi trực tiếp.
- Dùng Step Functions khi việc điều phối các bước bản thân nó phức tạp và khi khả năng audit quan trọng. Đừng dùng nó cho các chuỗi hai bước đơn giản, các workflow tần suất siêu cao, fan-out thuần, hoặc các luồng đối mặt người dùng đồng bộ.

## Mẹo Thi

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Có Khả Năng Chống Chịu (Lĩnh vực 2, Nhiệm vụ 2.1)*

- **Tín hiệu trường hợp sử dụng Step Functions**: "điều phối nhiều hàm Lambda," "workflow với retry và xử lý lỗi," "bước phê duyệt của con người trong một workflow tự động," "dấu vết audit của mỗi bước workflow" → Step Functions.
- **Standard so với Express**: Standard cho các workflow chạy lâu, có thể audit, tới hạn kinh doanh. Express cho xử lý sự kiện thông lượng cao, thời lượng ngắn.
- **SQS so với Step Functions**: SQS cho các hàng đợi task đơn giản (producer/consumer). Step Functions cho các workflow nhiều bước với logic phức tạp, retry, và theo dõi trạng thái.
- **Tín hiệu EventBridge**: "định tuyến các sự kiện từ các dịch vụ AWS đến các target," "tích hợp hướng sự kiện giữa các dịch vụ," "lên lịch một hàm Lambda" → EventBridge (trước đây là CloudWatch Events).
- **Mẫu callback**: Step Functions có thể tạm dừng việc thực thi và chờ một callback bên ngoài (một task token). Worker gọi lại khi xong. Hữu ích cho các ECS task chạy lâu nơi bạn không muốn giới hạn 15 phút của Lambda.
- **Tích hợp SDK trực tiếp**: Step Functions có thể gọi các dịch vụ AWS trực tiếp (DynamoDB, S3, SQS, v.v.) mà không đi qua Lambda. Giảm chi phí và độ trễ cho các lệnh gọi dịch vụ đơn giản. Ví dụ, ghi một bản ghi đơn hàng vào DynamoDB có thể là một lệnh gọi SDK trực tiếp từ state machine mà không cần một hàm Lambda: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Điều này loại bỏ cold start của Lambda, chi phí thực thi Lambda, và code chỉ gọi `dynamodb.put_item(...)` và trả về.

## Bài Tập

**Bài tập 1 — Ôn lại**

Giải thích tại sao Step Functions hữu ích cho các workflow nhiều bước. Nó cung cấp gì mà một hàm Lambda đơn giản gọi các hàm Lambda khác không cung cấp?

*(Gợi ý: Hãy nghĩ về chuyện gì xảy ra khi bước 3 trong 5 thất bại trong mỗi cách tiếp cận. Làm sao bạn biết điều gì đã xảy ra? Làm sao bạn thử lại chỉ bước 3?)*

**Bài tập 2 — Kịch bản SAA-C03**

*Kịch bản*: Một công ty dịch vụ tài chính xử lý các đơn xin vay trong nhiều bước: kiểm tra tín dụng, xác minh thu nhập, xác thực tài liệu, xem xét của thẩm định viên (thủ công), và thông báo quyết định. Mỗi bước có thể mất từ vài giây (kiểm tra tín dụng) đến vài ngày (xem xét của thẩm định viên). Công ty cần một dấu vết audit hoàn chỉnh của mỗi bước cho tuân thủ. Các bước tự động thất bại phải thử lại tự động; các bước thủ công phải tạm dừng và chờ một quyết định của con người.

Dịch vụ nào đáp ứng TỐT NHẤT các yêu cầu này?

A) Các hàm AWS Lambda được nối với nhau với các hàng đợi SQS giữa mỗi bước  
B) Các Standard workflow của AWS Step Functions với một mẫu Wait for callback cho bước xem xét của thẩm định viên  
C) Các Express workflow của AWS Step Functions cho các bước tự động và SQS FIFO cho bước thủ công  
D) Amazon EventBridge với các quy tắc sự kiện định tuyến giữa các hàm Lambda cho mỗi bước

**Gợi ý 1**: Thời lượng "tới vài ngày" — loại Step Functions nào hỗ trợ điều này?

**Gợi ý 2**: "Chờ một quyết định của con người" — mẫu Step Functions nào được thiết kế cho điều này?

**Gợi ý 3**: "Dấu vết audit hoàn chỉnh cho tuân thủ" — dịch vụ nào cung cấp lịch sử trạng thái mỗi-lần-thực-thi?

**Đáp án**: B

**Giải thích**: Các Standard workflow của Step Functions có thể chạy tới 1 năm, hỗ trợ bước xem xét của thẩm định viên kéo dài nhiều ngày. Mẫu Wait for callback tạm dừng việc thực thi ở bước thẩm định viên với một task token; khi thẩm định viên ra một quyết định, họ gọi lại với token để tiếp tục workflow. Các Standard workflow ghi lại mọi chuyển trạng thái — dấu vết audit hoàn chỉnh cho tuân thủ.

**Tại sao không phải A?** Lambda được nối qua SQS không cung cấp theo dõi trạng thái hoặc dấu vết audit tích hợp. Các bước thất bại đòi hỏi logic retry tùy chỉnh. Khởi động lại từ một bước thất bại cụ thể đòi hỏi triển khai tùy chỉnh.

**Tại sao không phải C?** Các Express workflow có thời lượng tối đa 5 phút — không tương thích với một bước có thể mất vài ngày.

**Tại sao không phải D?** EventBridge định tuyến các sự kiện giữa các dịch vụ nhưng không duy trì trạng thái workflow hoặc cung cấp retry/audit tích hợp. Xây dựng điều này chỉ trên EventBridge đòi hỏi quản lý trạng thái tùy chỉnh.

*Lĩnh vực SAA-C03: Thiết Kế Kiến Trúc Có Khả Năng Chống Chịu — Nhiệm vụ 2.1*

**Bài tập 3 — Thử thách kiến trúc** *(Tùy chọn)*

Nimbus đang xây dựng một quy trình giải quyết tranh chấp về chất lượng đồ ăn. Khi một khách hàng báo cáo một trải nghiệm tồi:

1. Báo cáo được xác thực tự động (kiểm tra xem đơn hàng có tồn tại không, có đủ gần đây không)
2. Nhà hàng được thông báo tự động
3. Một nhân viên hỗ trợ Nimbus xem xét khiếu nại (bước thủ công — có thể mất 1-3 ngày làm việc)
4. Dựa trên quyết định của nhân viên: hoàn tiền (Lambda → payment processor) HOẶC gửi phiếu xin lỗi (Lambda → coupon service) HOẶC chuyển lên cấp quản lý (Step Functions sub-workflow)
5. Khách hàng được thông báo về kết quả

Thiết kế cái này như một workflow Step Functions. Loại state nào xử lý mỗi bước? Bạn sẽ xử lý việc chờ 1-3 ngày thế nào? Bạn sẽ mô hình hóa nhánh ở bước 4 thế nào?

*(Không có câu trả lời đúng duy nhất. Mục tiêu là thực hành thiết kế state Step Functions.)*

**Mở rộng**: Sau khi state machine hoàn tất (bất kể nhánh nào), nó publish một sự kiện `OrderDisputeResolved` đến EventBridge. Những tác dụng phụ nào có thể lắng nghe sự kiện này? Cân nhắc: hệ thống đánh giá của nhà hàng, điểm thưởng của khách hàng (hoàn tiền có thể trừ điểm), analytics pipeline (tỷ lệ tranh chấp là một metric chất lượng nhà hàng quan trọng), và dashboard theo dõi SLA của đội hỗ trợ khách hàng. Việc dùng EventBridge ở đây giữ cho state machine tranh chấp khỏi trở thành một mạng nhện phụ thuộc thế nào?

## Cảnh Sau Tín Dụng

Workflow đăng ký nhà hàng đã hoạt động.

Trong tháng tiếp theo, 12 đối tác nhà hàng mới đã đăng ký. Hai cái có thất bại trong bước xử lý thanh toán (bước 3). Trong cả hai trường hợp, Step Functions bắt được lỗi chính xác, lưu trạng thái của lần thực thi, và gửi một cảnh báo đến đội Nimbus.

Leo sửa nguyên nhân gốc (một API key cấu hình sai cho nhà cung cấp thanh toán) và thử lại cả hai lần thực thi từ bước 3. Các lần thực thi hoàn tất trong 23 giây mỗi lần, tiếp tục từ chính xác nơi chúng đã thất bại.

Không nhà hàng nào cần được import lại. Không IAM role nào bị tạo gấp đôi. Không email chào mừng trùng lặp nào được gửi.

"Trước Step Functions," Leo nói với Maya, "cái này sẽ đòi hỏi ai đó theo dõi thủ công cái gì đã và chưa được làm cho mỗi nhà hàng, và chạy lại thủ công các bước còn thiếu."

"Và giờ?"

"Giờ tôi nhấp retry trong console. Hệ thống biết cái gì đã xong."

Maya nghĩ về điều này.

"Đó không chỉ là một cải tiến kỹ thuật," cô nói. "Đó là sự khác biệt giữa một quy trình mở rộng được và một quy trình không."

Trong chương tiếp theo: phải làm gì với dữ liệu mà bạn không đang truy cập ngay bây giờ, nhưng chắc chắn muốn giữ mãi mãi.
