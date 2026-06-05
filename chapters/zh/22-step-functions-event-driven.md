# 第二十二章：自己运行的流程图

Leo 盯着同一个日志文件已经一个小时了。一条条堆栈跟踪单独看都足够清晰，但它们之间的规律——某个步骤悄无声息地失败，而下一个步骤照常运行——他花了好一会儿才看出来。他终于向后一靠，放下咖啡，在记事本上写下一个词：*协调*。

想象一位指挥家在演出进行到一半时走下指挥台。乐队继续演奏——但没有人在第 47 小节示意铜管声部进入，没有人在终曲之前提示那段静默。每位乐手都正确地演奏着自己的部分。演出仍然分崩离析，因为各个部分依赖的协调已经无人打理。

这就是 Leo 在订单确认代码中发现的问题。不是某个单独步骤里的 bug。而是一次协调失败。

---

容器运行正常，部署干净利落。ECS 部署流水线很稳固。但在应用程序代码内部，另一类故障已经积累了数周。容器没问题。其中一个容器里的逻辑有问题。

Leo 一直在日志里追踪这个规律，但直到数清楚出现次数，他才真正理解它。

十一次。两周之内。

---

Nimbus 的一次订单确认需要五件事按顺序发生：扣款、发送确认邮件、通知餐厅、更新库存，以及记录交易以供财务使用。

当初 Leo 编写订单确认函数时，他把整个流程包在一个 `try/except` 块里，说"没事的——我们会在日志里捕获错误"。那是八个月前的事了。

并不是没事。

如果第三步失败——如果餐厅通知超时——第一步和第二步已经发生了。客户已被扣款。邮件已发送。但餐厅不知道这个订单的存在。

Leo 给这类 bug 起了个名字：部分成功。"一切都正常，"他说，"除了那个真正重要的部分。"

"这种情况发生了多少次？"Maya 问。

"过去两周十一次。我们大部分是从餐厅愤怒的电话中发现的。有两次是事后在日志中发现的。"

"所以我们没有协调，"Priya 说，"五个步骤，作为一个脚本运行，没有任何保证它们全部完成。而且如果有人试图在第二步期间入侵呢——在扣款成功之后、餐厅被通知之前？我们已经为一个餐厅手里根本没有的订单向客户收了钱。"

"或者保证它们按正确顺序完成。"

"或者保证我们知道是哪一个失败了。"

Leo 把代码投到投影仪上。这是一个 Python 函数：五十行，五个连续的 API 调用，整个函数外只包了一个 try/except 块。

"我们需要一个工作流，"Maya 说，"能追踪每个步骤的东西。等等——可是*为什么*我们不能直接给现有的 Python 函数加上更好的错误处理？为什么需要一整个新服务？"

"因为更好的错误处理仍然运行在一个随时可能挂掉的单一进程里，"Leo 说，"如果服务器在执行中途重启，错误处理也跟着重启。Step Functions 把状态持久化在外部。"

想象一条制造业的检查单——每个工位在传递给下一个工位之前都要确认完成，并且当某个环节出问题时，整条生产线保持原位。生产线不会从头重来。它从恰好失败的那个工位恢复。那个工位的状态被记录了下来。它之前的步骤已经完成，不会重复。它之后的步骤等待问题被解决。

这就是订单确认流程需要的东西。不是在问题周围堆更多代码。而是一个专为管理这个问题而设计的系统。

**AWS Step Functions：编排工作流**

**AWS Step Functions** 是一个无服务器编排服务，将应用程序的步骤协调为可视化工作流。每个步骤是**状态机**中的一个**状态**。

不再是一个从上到下运行然后崩溃的 Python 脚本，而是将工作流定义为 JSON/YAML 状态机：

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

每个状态可以：

- **执行一个 Lambda 函数**（最常见的模式）
- **执行一个 ECS 任务**（用于运行时间较长的工作）
- **等待特定时间**或**事件**（暂停工作流，直到外部的某件事发生）
- **基于条件选择路径**（if/else 逻辑）
- **同时运行并行分支**
- **失败时重试**，可配置退避策略
- **捕获错误**并路由到错误处理状态

Step Functions 持久地管理执行状态。如果第 3 步失败，执行就在第 3 步暂停。你可以在控制台中检查失败的执行，修复问题，然后从第 3 步重新启动——无需重复第 1 步和第 2 步。

你可能会想：难道不能直接在 Lambda 函数里写重试逻辑吗？可以——但那样你还得在代码里写失败追踪、状态持久化和审计日志。而且当 7 步中的第 3 步失败时，你需要知道当时正在处理哪家餐厅、之前发生了什么、从哪里恢复。Step Functions 把这些全包了。

**Nimbus 订单流程：带注解的状态机**

下面是 Nimbus 为订单确认实际构建的 Step Functions 状态机的简化版本——附有注解，让你看清每一部分的作用：

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

有几点值得注意：

**`ChargeCard` 有两个 Catch 子句。** 一个针对 `PaymentDeclinedError`（一种已知的、意料之中的失败——卡被拒了，不是系统错误），另一个针对 `States.ALL`（其他一切——系统中断、超时、意外异常）。它们路由到不同的状态，因为它们意味着不同的事情。

**`NotifyRestaurant` 有一个路由到 `RestaurantNotificationFailed` 的 Catch。** 这就是导致那十一次事故的 bug。在旧的 Python 脚本里，没有与之对应的东西——如果通知失败，函数要么悄无声息地崩溃，要么记下一条错误日志后继续运行。Step Functions 让失败路径变得显式：它会去一个特定的地方，而那个地方会在任何人不得不打电话之前就向支持团队告警。

**每个 Task 都有 Retry。** 如果邮件服务出现瞬时超时，它会自动重试三次，退避间隔递增。客户对此毫无察觉。订单不会丢失。

**这个流程是一张图，不是一个脚本。** 如果 `NotifyRestaurant` 永久失败（重试之后），执行不会继续到 `UpdateInventory`。工作流停在 `RestaurantNotificationFailed`。库存不会为一家根本不知道这个订单存在的餐厅而更新。这才是正确的行为。

"等等——可是*为什么*我们需要为'支付被拒'和'系统错误'分别设置失败路径？"Maya 问。

"因为它们需要的应对完全不同，"Leo 说，"卡被拒意味着我们给客户发邮件，请他们再试一次。扣款函数里的系统错误意味着我们需要一名工程师去调查 Lambda 函数为什么失败。可观察到的结果一样——订单没有成功——但补救措施完全不同。"

**状态类型：构建块**

**Task**：执行一个操作——调用 Lambda 函数、启动 ECS 任务、调用 API。这是真正的工作发生的地方。

**Choice**：根据输入数据中的条件进行分支。类似代码中的 if/else。

**Parallel**：同时运行多个分支并等待全部完成。

**Map**：对列表中的每个条目应用一组状态。并行处理 50 个餐厅菜单条目。

当 Nimbus 导入一家餐厅的菜单时，菜单可能包含 8 到 200 个不等的条目。对于每个条目，导入流程需要：验证格式、检查过敏原数据、调整照片尺寸，并把记录写入 DynamoDB。

没有 Map 状态，这将是一个 Lambda 顺序处理各个条目——200 个条目 × 每条 200 毫秒 = 40 秒的处理时间。有了 Map 状态，Step Functions 会并发启动这些处理状态的执行——直至配置的并发上限——并等待它们全部完成。同样的 200 个条目可以在 5 秒内完成。

**Wait**：暂停指定时长或直到某个时间戳。对计划性延迟很有用。

**Pass**：将输入传递给输出而不做任何工作。用于数据转换和测试。

**Succeed/Fail**：结束执行的终止状态。

对于餐厅入驻，Leo 设计了一个工作流：

1. ValidateLicense（Task → Lambda）
2. ImportMenu（Task → Lambda，重试 3 次）
3. 并行分支：
   a. SetupPayments（Task → Lambda）
   b. CreateIAMRole（Task → Lambda）
4. SendWelcomeEmail（Task → Lambda，等待并行分支完成）
5. NotifySalesTeam（Task → Lambda）

步骤 3a 和 3b 并行运行——它们互不依赖，同时运行能节省时间。

第一批餐厅完成入驻后，一项合规要求出现了：在一家餐厅合作伙伴上线之前，必须有一名 Nimbus 客户经理人工审核并批准其执照文件。这可能需要一到三个工作日。

"那如果有人试图在这个窗口期入侵呢？"Priya 问，"如果餐厅处于部分配置状态——支付账户已创建但尚未批准——而有人发现了这个待定状态，他们可能会试图利用这个半开的配置。"

更现实的问题是：你如何让一个 Step Functions 工作流暂停三天，等待一个人？

答案是**带任务令牌的回调模式**。

`ValidateLicense` 运行时，不再自动完成，而是调用一个做三件事的 Lambda：

1. 向客户经理发送一封包含该餐厅文件的邮件
2. 在数据库中记录一个**任务令牌**（Step Functions 为这次特定执行和状态生成的唯一标识符），并与这条待审核记录关联
3. 以 `.waitForTaskToken` 返回给 Step Functions——这告诉 Step Functions 在此状态无限期暂停执行

Step Functions 把这次执行"停靠"起来。其他任何东西都没有被阻塞——没有服务器在干等。状态机只是等待，不消耗任何计算资源。

三天后，客户经理在内部管理工具里点击"批准"。管理工具从数据库中查出任务令牌并调用：

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions 恢复运行。执行从第 2 步（`ImportMenu`）继续，审核人的信息已写入工作流状态中可供使用。

"这次执行暂停了三天，"Leo 说，"而我批准它的时候，发生的唯一一件事就是一次 API 调用。"

"那如果客户经理拒绝了呢？"Maya 问。

"我们就改为调用 `send_task_failure`。状态机捕获它，并路由到一个 `NotifyRejection` 状态，给餐厅合作伙伴发邮件。"

Step Functions 不轮询。它不重试。它不超时（除非你设置了心跳超时）。它只是等待，直到回调到达，然后继续。这与轮询数据库或队列有着根本的不同——这也是为什么 Step Functions 非常适合那些混合了自动步骤和人工步骤的工作流。

**读懂执行控制台：一次失败长什么样**

Nimbus 用上 Step Functions 的第一周，餐厅通知 Lambda 超时了。Leo 打开 Step Functions 控制台，点开那次失败的执行。

**执行事件历史（Execution Event History）** 展示了一条精确记录所发生一切的时间线：

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

在 42 秒内，Step Functions 完成了扣款、发送邮件、三次尝试餐厅通知、捕获失败、向支持团队告警，并记录了完整的历史。在 Step Functions 之前，这次失败将是不可见的——那个 Python 函数会记一条"notification failed"日志，然后若无其事地向调用方返回 200。

"时间线精确地展示了哪里出了问题、什么时候出的，"Leo 说，"而且每次重试都有时间戳。你能看到退避的间隔。"

Priya 看着控制台。"这份历史会保存多久？"

标准工作流的执行历史保存 90 天。出于合规或长期审计的需要，执行事件还可以导出到 CloudWatch Logs 并无限期保留。

**标准工作流与快速工作流**

Step Functions 提供两种工作流类型：

**标准工作流**：

- 最长持续时间：1 年
- 执行是持久的——状态被持久化，可以检查和审计
- 精确一次执行（除非你配置了 Retry，否则一个任务永远不会被运行多于一次）
- 按状态转换计费
- 最适合长时间运行的重要工作流（订单处理、入驻流程、支付流程）

**快速工作流**：

- 最长持续时间：5 分钟
- 更高的吞吐量——每秒最多 100,000 次
- 至少一次执行（异步）或至多一次执行（同步）——要把任务设计成幂等的
- 按持续时间计费（类似 Lambda）
- 最适合高量、短时长的工作流（实时事件处理、IoT 数据摄取）

"这每个月要花多少钱？"Tom 一边问一边打开定价页面，"标准工作流按状态转换收费——步骤一多，费用就累积起来了。"

Leo 把账算了一遍。对于餐厅入驻工作流（每次执行六个任务状态，每月大约 12-15 家新餐厅）：不到一百次状态转换——不到一美分，而且完全落在每月 4,000 次转换的免费额度之内，所以实际上是 $0。对于满负荷 Nimbus 流量下的订单确认工作流：更可观一些，但仍然远低于每月手动调试十一次部分成功的成本。

"调试时间才是隐藏成本，"Leo 说。

"隐藏成本从来都是它，"Tom 说。

Tom 把数字算得更仔细了，因为 Tom 就是这样的人。

**Nimbus 订单确认流程的标准工作流成本**：顺利路径上每个订单五个状态，每次状态转换 $0.000025。五次状态转换 × $0.000025 × 每月 15,000 个订单 = **每月 $1.88**。订单量翻十倍：约每月 $19。一次部分成功事故的调试成本（支持工程师 24 分钟的时间）就是 Step Functions 月度账单的好多倍。

如果有人建议用标准工作流处理高频分析事件，这个对比就变得重要了。假设 Nimbus 想用 Step Functions 处理每一条原始点击流事件——每次菜单页浏览、每次滚动、每次搜索。按他们当前的规模，那大约是每天 800,000 个事件。为每个事件跑一个五状态的标准工作流：800,000 × 5 × $0.000025 × 30 天 = **每月 $3,000**。对一条分析管道来说，这可是真金白银。

同样的量级用快速工作流：按请求数加持续时间计费，而不是按状态转换。每月 2,400 万次执行，按每百万请求 $1.00 计 = $24。持续时间：2,400 万 × 500 毫秒，按 64MB 计费下限 ≈ 208 GB-小时 × $0.06 = $12.50。总计 ≈ **每月 $36.50**——比标准工作流的 $3,000 便宜了将近两个数量级。

"所以工作流类型不只是一个架构决策，"Tom 说，"它还是一个成本决策。同样数量的状态，取决于你用哪种工作流类型，成本可能相差近一百倍。"

"而哪种更好，完全取决于这个工作流是做什么的，"Leo 说，"订单确认：标准。它很重要，它有意义明确的失败路径，我们想要审计跟踪。分析事件处理：快速。它量大、时长短，而且我们不需要为每次页面浏览保留 90 天的执行历史。" 

如果你的流程只有两个步骤、不需要审计跟踪，一个简单的 Lambda 函数更便宜，也不需要写 JSON 状态机语法——但如果任何一个步骤可能独立失败、需要在不重复前面步骤的情况下重试或重启，Step Functions 在减少调试和人工补救方面就能把成本赚回来。

对于 Nimbus 的餐厅入驻：标准工作流（它很重要，需要持久化，如果涉及人工步骤可能需要数小时）。

对于 Nimbus 的实时订单状态更新：快速工作流（量大、时长短、没那么关键）。

**事件驱动架构：更大的图景**

Step Functions 是一个更大模式的一部分：**事件驱动架构**。不是服务之间直接互相调用（紧耦合），而是服务发出事件，其他服务对这些事件做出反应。

我们在本书中已经多次见过这种模式：

- 下单 → SNS 发布事件 → SQS 队列传递给消费者
- S3 文件上传 → Lambda 被触发去处理它
- DynamoDB 记录变更 → DynamoDB Streams → Lambda 更新缓存

**Amazon EventBridge**（前身为 CloudWatch Events）是这种模式的高级事件总线。它根据规则将来自 AWS 服务和你自己应用程序的事件路由到目标（Lambda、SQS、Step Functions 等）。

EventBridge 实现了架构层面的松耦合：订单服务发布 `order.placed` 事件，而无需知道谁在监听。分析服务、通知服务和积分服务各自独立地监听。添加新的监听者不需要更改订单服务。

EventBridge 还与数十个 AWS 服务原生集成，作为**事件源**。当一次 CloudTrail API 调用匹配某个模式时，EventBridge 可以触发一条规则。当一台 EC2 实例改变状态时，EventBridge 可以触发一个 Lambda。当一个 RDS 实例发生故障转移时，EventBridge 可以通知值班工程师。你可以把整个 AWS 控制平面当作一条事件流。

对 Nimbus 来说，有一条特别实用的 EventBridge 规则：每当有新镜像推送到 ECR 时触发一个 Lambda。这个 Lambda 检查镜像扫描结果，如果发现任何 HIGH 或 CRITICAL 级别的 CVE，就发消息到工程团队的 Slack 频道——在任何人部署这个镜像之前。这把 ECR 的安全扫描（来自第 21 章）和 EventBridge 的事件路由组合成了一道自动化的安全闸门。

事件驱动架构的原则与 Step Functions 的重试逻辑相同：让失败显式化、被路由，而不是无声无息地被吞掉。通过事件通信的服务能够优雅地失败——如果 `OrderConfirmed` 事件触发时积分 Lambda 恰好宕机，EventBridge 可以重试投递，或发送到死信队列。订单确认本身不受影响。解耦就是韧性。

**EventBridge：把副作用从主流程中解耦**

订单确认状态机平稳运行之后，Maya 在下一次架构评审上提出了一个问题。

"我们想在订单确认时给客户加积分。客户每消费一美元得一分。这该放在状态机的哪里？"

Leo 的第一反应：在 `LogTransaction` 之后加一个 `GrantLoyaltyPoints` 状态。

Priya 的回应："那等我们再加推荐奖励呢？还有订单后调查？还有餐厅评分请求？每一个都往关键路径上加一个状态。如果积分 Lambda 失败，整个订单确认就失败。"

"订单确认流程应该只做一件事，"她说，"确认订单。其他一切都是副作用。"

这就是用 **Amazon EventBridge** 作为机制、把副作用从主工作流中松耦合出去的架构论证。

修订后的方案：当 `LogTransaction` 状态成功完成时，Lambda 向 EventBridge 发布一个事件：

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

然后由 EventBridge 规则把这个事件路由到各个独立的目标：

- **规则 1**：`OrderConfirmed` → 积分 Lambda（为一笔 $32 的订单授予 32 个积分）
- **规则 2**：`OrderConfirmed` → 订单后调查 Lambda（在送达后 2 小时排入一份调查问卷）
- **规则 3**：`OrderConfirmed` → 分析 Kinesis 流（供给实时仪表板）

每条规则都是独立的。积分 Lambda 可以失败而不影响调查队列。分析管道可以滞后而不阻塞积分系统。添加一个新的副作用（餐厅评分请求、返现通知）只需要创建一条新的 EventBridge 规则——而不是修改状态机。

"那如果有人试图通过 EventBridge 规则入侵呢？"Priya 问，"如果事件里包含客户的个人身份信息，每一个接收它的 Lambda 现在都成了一个 PII 访问点。"

这个事件经过了精心设计：只有 ID，没有姓名、地址或支付详情。任何需要客户数据的 Lambda 都要用客户 ID 去数据库查询——由它自己的 IAM 权限控制它能访问什么。

"事件是一个信号，"Priya 说，"不是一次数据倾倒。"

**何时 Step Functions 是正确的工具**

Step Functions 在以下情况下表现出色：

**多步骤工作流**——需要跨步骤追踪进度

**人在回路中的流程**——Step Functions 可以无限期等待一个外部事件（比如某人批准某事），然后继续

**规模化的错误处理**——在众多步骤中内置重试、捕获和回退逻辑

**可审计的流程**——每次执行记录每一次状态转换。你可以精确看到发生了什么、何时发生。

**复杂的并行或顺序逻辑**——可视化工作流比等效代码更容易推理

对于简单的两步流程，Step Functions 是过度设计。当协调本身有价值、且失败场景很重要时再使用它。

**何时 Step Functions 是错误的工具**

"等等——可是*为什么*不把所有东西都用 Step Functions 呢？"Maya 在设计会议的尾声问，"我们已经搭好了餐厅入驻工作流。订单确认流程也有了。为什么不把一切都改成状态机？"

诚实的答案是：因为 Step Functions 带来的开销，不是每个工作流都值得承担。

**简单的两步流程**：如果你有一个 Lambda 处理上传的文件，再调用第二个 Lambda，状态机的协调开销配不上它带来的运维收益。在一个函数内顺序调用两个 Lambda 更简单、更容易测试，而且没有按状态转换计费的成本。

**超高频、亚秒级的工作流**：标准工作流的按状态转换成本不可忽视，在高量级下会累积起来（正如上面的分析示例所示）。快速工作流解决了成本问题，但不提供持久的状态历史。在频率极高、时长极短的场景下，SQS 加 Lambda（第 19 章的模式）比两种 Step Functions 类型都更简单、更便宜。

**没有协调的纯扇出**：如果你需要把同一个事件发给二十个消费者，并且不关心每个消费者的结果，那 SNS 才是合适的工具。Step Functions 会增加你不需要的状态追踪，而且你要为此白白付费。

**实时同步的用户交互**：Step Functions 的执行是异步的。如果用户正在结账页面等待一个 500 毫秒以内的同步响应，Step Functions 标准工作流不是为此设计的（快速工作流可以同步调用，但延迟开销仍然高于直接的 Lambda 调用）。对于同步的、面向用户的流程，搭配良好错误处理设计的 Lambda + API Gateway 通常更合适。

原则是：当步骤的*协调*本身就很复杂时使用 Step Functions——当步骤可能独立失败、当你需要在不重复前面步骤的情况下重试单个步骤、当执行历史具有合规或调试价值、或者当工作流包含可能耗时数天的人工审批步骤时。不要用它给那些作为单个函数就运行得很好的简单顺序逻辑增加编排开销。

## 优势与局限

**Step Functions 的强大之处**：

- 可视化执行历史——精确看到工作流在哪里（或在哪里失败了）
- 内置重试和错误处理——无需自定义重试代码
- 持久状态——执行在服务重启和中断后仍然存活
- 与 200 多个 AWS 服务的直接集成（不只是 Lambda）
- 可视化工作流即文档
- 回调模式可以无限期等待人工操作，而不消耗计算资源

**复杂性所在**：

- 标准工作流按状态转换计费——状态众多的复杂工作流在规模扩大时可能变得昂贵
- ASL（Amazon States Language）JSON 格式有学习曲线
- 最大有效载荷为 256KB——大型数据必须通过 S3 引用传递，而不能直接穿过工作流
- 包含许多人工步骤的长期运行工作流需要仔细的超时配置
- 调试 ASL 错误需要实际运行执行；没有任何本地模拟器能像真实服务一样强大
- 必须为状态机调用的每个资源单独授予 IAM 权限——漏掉一个权限就会在运行时引发令人困惑的错误

## 总结

第 21 章的容器让部署变得可靠。Step Functions 让多步骤的业务流程变得可靠——同样是"消除交接风险"这条原则，应用到了应用逻辑上。

- **Step Functions** 将多步骤工作流编排为状态机。
- 每个**状态**可以运行 Lambda 函数、执行 ECS 任务、等待、分支或运行并行步骤。
- **重试和捕获**内置于每个状态——不需要自定义重试代码。
- **标准工作流**：长期运行（最长 1 年）、持久、精确一次。用于关键业务流程。
- **快速工作流**：短时长（最长 5 分钟）、高吞吐量。用于高量事件处理。
- **带任务令牌的回调模式**：让工作流无限期暂停，等待外部事件或人工操作；用一次 API 调用恢复。
- **Map 状态**：并发处理一个列表中的条目——用并行扇出取代顺序循环。
- **直接 SDK 集成**：从一个状态直接调用 DynamoDB、S3、SQS 以及 200 多个 AWS 服务，无需 Lambda 包装。
- **EventBridge**：把副作用从主工作流中解耦——发布一个事件，让独立的规则把它路由到积分、分析和调查服务，而无需修改核心状态机。
- **标准与快速的成本对比**：标准工作流按每次状态转换 $0.000025 计费，适合低量级的关键工作流（Nimbus 的订单确认每月 $1.88）。快速工作流按请求数加持续时间计费，适合高频事件——在那些场景下标准工作流的成本会高出几十倍（Nimbus 的点击流测算中约为 80 倍）。
- **事件驱动架构**使用 SNS、SQS、Lambda 和 EventBridge 等服务，围绕事件而非直接调用将系统解耦。
- 当步骤的协调本身就很复杂、且可审计性重要时，使用 Step Functions。不要把它用于简单的两步序列、超高频工作流、纯扇出，或同步的面向用户的流程。

## 考试技巧

*SAA-C03 领域：设计弹性架构（领域 2，任务 2.1）*

- **Step Functions 用例信号**："编排多个 Lambda 函数"、"具有重试和错误处理的工作流"、"自动化工作流中的人工审批步骤"、"每个工作流步骤的审计跟踪"→ Step Functions。
- **标准与快速对比**：标准工作流用于长期运行、可审计、业务关键的工作流。快速工作流用于高吞吐量、短时长的事件处理。
- **SQS 与 Step Functions 对比**：SQS 用于简单的任务队列（生产者/消费者）。Step Functions 用于具有复杂逻辑、重试和状态追踪的多步骤工作流。
- **EventBridge 信号**："将 AWS 服务的事件路由到目标"、"服务之间的事件驱动集成"、"调度 Lambda 函数"→ EventBridge（前身为 CloudWatch Events）。
- **回调模式**：Step Functions 可以暂停执行并等待外部回调（任务令牌）。worker 完成后回调。对于不想受 Lambda 15 分钟限制的长时间运行 ECS 任务很有用。
- **直接 SDK 集成**：Step Functions 可以直接调用 AWS 服务（DynamoDB、S3、SQS 等），而无需经过 Lambda。降低简单服务调用的成本和延迟。例如，把一条订单记录写入 DynamoDB 可以是状态机的一次直接 SDK 调用，不需要 Lambda 函数：`"Resource": "arn:aws:states:::dynamodb:putItem"`。这消除了 Lambda 冷启动、Lambda 执行成本，以及那段只是调用 `dynamodb.put_item(...)` 然后返回的代码。

## 练习

**练习 1 — 回顾**

解释为什么 Step Functions 对多步骤工作流很有用。它提供了什么是简单的"Lambda 函数调用其他 Lambda 函数"所不具备的？

*（提示：想想当五步中的第三步失败时，在每种方法中会发生什么。你如何知道发生了什么？如何只重试第三步？）*

**练习 2 — SAA-C03 场景**

*场景*：一家金融服务公司以多个步骤处理贷款申请：信用检查、收入验证、文件验证、承销商审查（人工），以及决定通知。每个步骤的耗时从几秒（信用检查）到几天（承销商审查）不等。公司需要每个步骤的完整审计跟踪以满足合规要求。失败的自动步骤必须自动重试；人工步骤必须暂停并等待人工决定。

哪种服务最符合这些要求？

A) AWS Lambda 函数通过 SQS 队列链接，每个步骤之间有一个队列  
B) AWS Step Functions 标准工作流，对承销商审查步骤使用等待回调模式  
C) AWS Step Functions 快速工作流用于自动步骤，SQS FIFO 用于人工步骤  
D) Amazon EventBridge，使用事件规则在各步骤的 Lambda 函数之间路由

**提示 1**："最长几天"的持续时间——哪种 Step Functions 类型支持这个？

**提示 2**："等待人工决定"——哪种 Step Functions 模式是为此设计的？

**提示 3**："用于合规的完整审计跟踪"——哪种服务提供每次执行的状态历史？

**答案**：B

**解释**：Step Functions 标准工作流可以运行长达 1 年，支持可能持续数天的承销商审查步骤。等待回调模式在承销商步骤处暂停执行并附带任务令牌；当承销商做出决定时，用令牌回调以继续工作流。标准工作流记录每一次状态转换——满足合规所需的完整审计跟踪。

**为什么不选 A？** 通过 SQS 链接的 Lambda 不提供内置的状态追踪或审计跟踪。失败的步骤需要自定义重试逻辑。从特定的失败步骤重新启动需要自定义实现。

**为什么不选 C？** 快速工作流最长持续 5 分钟——与可能需要几天的步骤不兼容。

**为什么不选 D？** EventBridge 在服务之间路由事件，但不维护工作流状态，也不提供内置的重试/审计。仅用 EventBridge 构建这套系统需要自定义状态管理。

*SAA-C03 领域：设计弹性架构 — 任务 2.1*

**练习 3 — 架构挑战** *（可选）*

Nimbus 正在构建食品质量纠纷解决流程。当客户报告糟糕的体验时：

1. 报告被自动验证（检查订单是否存在，是否足够近期）
2. 餐厅被自动通知
3. 一名 Nimbus 支持人员审查投诉（人工步骤——可能需要 1-3 个工作日）
4. 根据支持人员的决定：发起退款（Lambda → 支付处理器）或发送道歉优惠券（Lambda → 优惠券服务）或升级给管理层（Step Functions 子工作流）
5. 客户收到结果通知

将此设计为一个 Step Functions 工作流。每个步骤使用什么状态类型？你如何处理 1-3 天的等待？你如何建模第 4 步的分支？

*（没有唯一正确答案。目标是练习 Step Functions 状态设计。）*

**延伸**：状态机完成后（无论走的哪个分支），它向 EventBridge 发布一个 `OrderDisputeResolved` 事件。哪些副作用可能监听这个事件？考虑：餐厅评分系统、客户的积分（退款可能要扣减积分）、分析管道（纠纷率是衡量餐厅质量的关键指标），以及客户支持团队的 SLA 跟踪仪表板。在这里使用 EventBridge，如何避免纠纷状态机变成一只依赖蜘蛛？

## 片尾彩蛋

餐厅入驻工作流上线了。

接下来的一个月，12 家新餐厅合作伙伴完成了入驻。其中两家在支付处理步骤（第 3 步）出现了失败。在这两个案例中，Step Functions 都捕获了确切的错误，保存了执行状态，并向 Nimbus 团队发送了告警。

Leo 修复了根本原因（支付提供商的 API 密钥配置错误），并从第 3 步重试了这两次执行。每次执行都在 23 秒内完成，从它们失败的确切位置恢复。

没有餐厅需要重新导入。没有 IAM 角色被重复创建。没有重复的欢迎邮件被发送。

"在 Step Functions 之前，"Leo 告诉 Maya，"这需要有人手动追踪每家餐厅哪些步骤已完成、哪些还没有，然后手动重新运行缺失的步骤。"

"现在呢？"

"现在我在控制台里点一下重试。系统知道哪些已经完成了。"

Maya 思考着这件事。

"这不只是技术上的改进，"她说，"这是一个能规模化的流程和一个不能规模化的流程之间的区别。"

下一章：如何处理你现在不访问、但绝对想永远保留的数据。
