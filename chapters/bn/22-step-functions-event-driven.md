# অধ্যায় ২২: ফ্লোচার্ট যা নিজেই চলে

Leo একই log file-এর দিকে এক ঘণ্টা ধরে তাকিয়ে ছিল। Stack trace-গুলি পৃথকভাবে যথেষ্ট স্পষ্ট ছিল, কিন্তু তাদের জুড়ে pattern — যেভাবে একটি step নীরবে ব্যর্থ হত এবং পরের step তবুও চলত — দেখতে তার কিছুটা সময় লেগেছিল। সে অবশেষে পিছনে হেলান দিল, তার coffee রাখল, এবং তার notepad-এ একটি মাত্র শব্দ লিখল: *coordination*।

পরিবেশনার মাঝখানে একজন conductor podium থেকে নেমে যাওয়ার কল্পনা করুন। Orchestra বাজাতে থাকে — কিন্তু bar 47-এ brass আনার কেউ নেই, finale-এর আগে নীরবতার ইঙ্গিত দেওয়ার কেউ নেই। পৃথক সঙ্গীতশিল্পীরা তাদের অংশ সঠিকভাবে বাজায়। পরিবেশনা তবুও ভেঙে পড়ে, কারণ অংশগুলি এমন coordination-এর উপর নির্ভর করে যা কেউ পরিচালনা করছে না।

সেটাই সমস্যা Leo order confirmation কোডে খুঁজে পেয়েছিল। কোনো পৃথক step-এ একটি bug নয়। একটি coordination failure।

---

Container-গুলি সঠিকভাবে চলছিল এবং পরিষ্কারভাবে deploy হচ্ছিল। ECS deployment pipeline মজবুত ছিল। কিন্তু application কোডের ভিতরে, একটি ভিন্ন ধরনের failure সপ্তাহ ধরে জমা হচ্ছিল। Container ঠিক ছিল। তাদের একটির ভিতরের logic ছিল না।

Leo log-এ pattern ট্র্যাক করছিল কিন্তু ঘটনাগুলি গণনা না করা পর্যন্ত এটা বোঝেনি।

এগারো বার। দুই সপ্তাহে।

---

Nimbus-এ একটি order confirmation-এর জন্য পাঁচটি জিনিস ক্রমানুসারে ঘটতে হত: card charge করা, confirmation email পাঠানো, রেস্তোরাঁকে notify করা, inventory আপডেট করা, এবং accounting-এর জন্য transaction log করা।

Leo যখন মূল order confirmation function লিখেছিল, সে পুরো জিনিসটিকে একটি `try/except` block-এ মুড়ে দিয়েছিল এবং বলেছিল "এটা ঠিক থাকবে — আমরা log-এ error ধরব।" সেটা ছিল আট মাস আগে।

এটা ঠিক ছিল না।

Step তিন ব্যর্থ হলে — রেস্তোরাঁ notification timeout হলে — step এক এবং দুই ইতিমধ্যে ঘটে গিয়েছিল। গ্রাহককে charge করা হয়েছিল। Email পাঠানো হয়েছিল। কিন্তু রেস্তোরাঁ জানত না order বিদ্যমান।

Leo-র এই শ্রেণীর bug-এর জন্য একটি নাম ছিল: partial success। "সব কিছু কাজ করেছে," সে বলল, "যে অংশটি গুরুত্বপূর্ণ ছিল সেটা ছাড়া।"

"এটা কতবার হয়েছে?" Maya জিজ্ঞেস করল।

"গত দুই সপ্তাহে এগারো বার। আমরা বেশিরভাগ রেস্তোরাঁয় রাগান্বিত কল থেকে ধরেছিলাম। দুটি আমরা log-এ পরে খুঁজে পেয়েছিলাম।"

"তাহলে আমাদের কোনো coordination নেই," Priya বলল। "পাঁচটি step, একটি script হিসেবে চলছে, সেগুলি সব সম্পূর্ণ হওয়ার কোনো গ্যারান্টি ছাড়াই। এবং কেউ যদি step দুইয়ের সময় ভাঙার চেষ্টা করে — charge হয়ে যাওয়ার পর কিন্তু রেস্তোরাঁ notify হওয়ার আগে? আমরা ইতিমধ্যে রেস্তোরাঁর কাছে নেই এমন একটি order-এর জন্য গ্রাহককে বিল করেছি।"

"অথবা তারা সঠিক order-এ সম্পূর্ণ হয়।"

"অথবা আমরা জানি কোনটি ব্যর্থ হয়েছে।"

Leo projector-এ কোড টেনে আনল। এটা ছিল একটি Python function: পঞ্চাশটি লাইন, পাঁচটি ক্রমিক API call, পুরো জিনিসটির চারপাশে একটি একক try/except block।

"আমাদের একটি workflow দরকার," Maya বলল। "এমন কিছু যা প্রতিটি step ট্র্যাক করে। দাঁড়াও — কিন্তু আমরা কেন কেবল বিদ্যমান Python function-এ ভালো error handling যোগ করতে পারি না? আমাদের কেন একটি সম্পূর্ণ নতুন service দরকার?"

"কারণ ভালো error handling এখনও একটি single process-এ চলে যা যেকোনো point-এ ব্যর্থ হতে পারে," Leo বলল। "Server execution-এর মাঝখানে restart হলে, error handling এর সাথে restart হয়। Step Functions state বাহ্যিকভাবে persist করে।"

একটি manufacturing checklist-এর কথা ভাবুন — একটি যেখানে প্রতিটি station পরবর্তীতে যাওয়ার আগে completion নিশ্চিত করে, এবং যেখানে কিছু ব্যর্থ হলে পুরো line তার অবস্থান ধরে রাখে। Line শুরু থেকে restart হয় না। এটা ঠিক যে station ব্যর্থ হয়েছিল সেখান থেকে resume করে। সেই station-এর state রেকর্ড করা। এর আগের step-গুলি সম্পন্ন এবং পুনরাবৃত্তি হয় না। এর পরের step-গুলি সমস্যা সমাধান না হওয়া পর্যন্ত অপেক্ষা করে।

সেটাই order confirmation flow-এর প্রয়োজন ছিল। সমস্যার চারপাশে আরও কোড নয়। সমস্যা পরিচালনার জন্য design করা একটি সিস্টেম।

**AWS Step Functions: Workflow Orchestrate করা**

**AWS Step Functions** হলো একটি serverless orchestration service যা একটি application-এর step-গুলিকে একটি visual workflow হিসেবে সমন্বয় করে। প্রতিটি step একটি **state machine**-এ একটি **state**।

উপরে-থেকে-নিচে চলা এবং crash হওয়া একটি Python script-এর পরিবর্তে, আপনি workflow-টিকে একটি JSON/YAML state machine হিসেবে সংজ্ঞায়িত করেন:

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

প্রতিটি state পারে:

- **একটি Lambda function execute করা** (সবচেয়ে সাধারণ pattern)
- **একটি ECS task execute করা** (দীর্ঘ-চলমান কাজের জন্য)
- **একটি নির্দিষ্ট সময়** বা **event-এর জন্য অপেক্ষা করা** (বাহ্যিক কিছু না ঘটা পর্যন্ত workflow pause করুন)
- **শর্তের উপর ভিত্তি করে একটি path বেছে নেওয়া** (if/else logic)
- **সমান্তরাল branch চালানো** একসাথে
- **failure-এ retry করা** configurable backoff সহ
- **error catch করা** এবং error-handling state-এ route করা

Step Functions execution state durably পরিচালনা করে। Step 3 ব্যর্থ হলে, execution step 3-এ pause হয়। আপনি console-এ ব্যর্থ execution পরিদর্শন করতে পারেন, issue ঠিক করতে পারেন, এবং step 3 থেকে restart করতে পারেন — step 1 এবং 2 পুনরাবৃত্তি না করেই।

আপনি হয়তো ভাবছেন: আপনি কি আপনার Lambda function-এ কেবল retry logic লিখতে পারেন না? হ্যাঁ — কিন্তু তখন আপনি কোডে failure tracking, state persistence, এবং audit logging-ও লিখছেন। এবং 7-এর মধ্যে step 3 ব্যর্থ হলে, আপনার জানা দরকার কোন রেস্তোরাঁ process হচ্ছিল, আগে কী ঘটেছিল, এবং কোথায় resume করতে হবে। Step Functions সেগুলি সব করে।

**Nimbus Order Flow: টীকাযুক্ত State Machine**

এখানে Nimbus order confirmation-এর জন্য তৈরি করা প্রকৃত Step Functions state machine-এর একটি সরলীকৃত version — টীকাযুক্ত যাতে আপনি দেখতে পারেন প্রতিটি টুকরো কী করে:

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

লক্ষ্য করার মতো কয়েকটি জিনিস:

**`ChargeCard`-এর দুটি Catch clause আছে।** একটি `PaymentDeclinedError`-এর জন্য (একটি পরিচিত, প্রত্যাশিত failure — card declined হয়েছিল, একটি system error নয়) এবং একটি `States.ALL`-এর জন্য (অন্য যেকোনো কিছু — একটি system outage, একটি timeout, একটি অপ্রত্যাশিত exception)। তারা ভিন্ন state-এ route করে কারণ তারা ভিন্ন জিনিস বোঝায়।

**`NotifyRestaurant`-এর একটি Catch আছে যা `RestaurantNotificationFailed`-এ route করে।** এটাই সেই bug যা এগারোটি incident ঘটিয়েছিল। পুরানো Python script-এ, কোনো সমতুল্য ছিল না — notification ব্যর্থ হলে, function হয় নীরবে crash করত বা একটি error log করে চলতে থাকত। Step Functions failure path স্পষ্ট করে: এটা একটি নির্দিষ্ট জায়গায় যায়, এবং সেই জায়গা কাউকে কল করতে হওয়ার আগে support team-কে alert করে।

**প্রতিটি Task-এর Retry আছে।** Email service-এর একটি transient timeout হলে, এটা স্বয়ংক্রিয়ভাবে retry করে, তিনবার, ক্রমবর্ধমান backoff সহ। গ্রাহক এটা কখনো দেখে না। Order হারায় না।

**Flow একটি graph, একটি script নয়।** `NotifyRestaurant` স্থায়ীভাবে ব্যর্থ হলে (retry-এর পরে), execution `UpdateInventory`-তে চলতে থাকে না। Workflow `RestaurantNotificationFailed`-এ থামে। একটি রেস্তোরাঁ যা order সম্পর্কে জানে না তার জন্য inventory আপডেট হয় না। এটা সঠিক আচরণ।

"দাঁড়াও — কিন্তু payment declined বনাম system error-এর জন্য আমাদের কেন পৃথক failure path দরকার?" Maya জিজ্ঞেস করল।

"কারণ তাদের সম্পূর্ণ ভিন্ন response প্রয়োজন," Leo বলল। "একটি declined card মানে আমরা গ্রাহককে email করি এবং তাদের আবার চেষ্টা করতে বলি। charge function-এ একটি system error মানে আমাদের একজন engineer দরকার তদন্ত করতে কেন Lambda function ব্যর্থ হচ্ছে। একই observable outcome — order হয়নি — কিন্তু সম্পূর্ণ ভিন্ন remediation।"

**State Type: বিল্ডিং ব্লক**

**Task**: একটি action execute করুন — একটি Lambda function call করুন, একটি ECS task শুরু করুন, একটি API call করুন। এখানেই আসল কাজ হয়।

**Choice**: input data-র শর্তের উপর ভিত্তি করে branch করুন। কোডে একটি if/else-এর মতো।

**Parallel**: একসাথে একাধিক branch চালান এবং সব সম্পূর্ণ হওয়ার জন্য অপেক্ষা করুন।

**Map**: একটি list-এর প্রতিটি item-এ state-এর একটি set প্রয়োগ করুন। ৫০টি রেস্তোরাঁ menu item সমান্তরালে process করুন।

Nimbus একটি রেস্তোরাঁর menu import করলে, menu-তে ৮ থেকে ২০০টি item থাকতে পারত। প্রতিটি item-এর জন্য, import process-এর প্রয়োজন ছিল: format যাচাই করা, allergen data check করা, ছবি resize করা, এবং record DynamoDB-তে লেখা।

Map state ছাড়া, এটা হত একটি single Lambda item-গুলি ক্রমানুসারে process করছে — ২০০ item × প্রতি item ২০০ms = ৪০ সেকেন্ড processing time। Map state সহ, Step Functions processing state-গুলির concurrent execution launch করে — configured concurrency limit পর্যন্ত — এবং সেগুলি সব সম্পূর্ণ হওয়ার জন্য অপেক্ষা করে। একই ২০০টি item ৫ সেকেন্ডের মধ্যে শেষ হতে পারে।

**Wait**: একটি নির্দিষ্ট সময়ের জন্য বা একটি timestamp পর্যন্ত pause করুন। scheduled delay-এর জন্য উপযোগী।

**Pass**: কাজ না করে input থেকে output-এ pass করুন। data transformation এবং testing-এর জন্য ব্যবহৃত।

**Succeed/Fail**: terminal state যা execution শেষ করে।

রেস্তোরাঁ onboarding-এর জন্য, Leo একটি workflow design করল:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, ৩টি retry সহ)
3. সমান্তরাল branch:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, সমান্তরাল সম্পূর্ণ হওয়ার জন্য অপেক্ষা করে)
5. NotifySalesTeam (Task → Lambda)

Step 3a এবং 3b সমান্তরালে চলে — তারা একে অপরের উপর নির্ভর করে না, এবং সেগুলি একসাথে চালানো সময় বাঁচায়।

প্রথম রেস্তোরাঁ cohort onboarding সম্পূর্ণ করার পরে, একটি compliance প্রয়োজনীয়তা উদ্ভূত হল: একটি রেস্তোরাঁ partner live হওয়ার আগে, একজন Nimbus account manager-কে ম্যানুয়ালি license documentation পর্যালোচনা এবং অনুমোদন করতে হত। এটা এক থেকে তিন ব্যবসায়িক দিন নিতে পারত।

"এবং কেউ যদি সেই window-এর সময় ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "রেস্তোরাঁ আংশিকভাবে configure করা হলে — payment account তৈরি কিন্তু এখনও অনুমোদিত নয় — এবং কেউ pending state আবিষ্কার করলে, তারা half-open configuration exploit করার চেষ্টা করতে পারে।"

আরও ব্যবহারিকভাবে: আপনি একজন মানুষের জন্য অপেক্ষা করে তিন দিনের জন্য একটি Step Functions workflow কীভাবে pause করবেন?

উত্তর হলো একটি **task token সহ callback pattern**।

`ValidateLicense` চললে, স্বয়ংক্রিয়ভাবে সম্পূর্ণ হওয়ার পরিবর্তে, এটা একটি Lambda call করে যা তিনটি জিনিস করে:

1. রেস্তোরাঁর document সহ account manager-কে একটি email পাঠায়
2. একটি database-এ একটি **task token** (এই নির্দিষ্ট execution এবং state-এর জন্য Step Functions যে একটি unique identifier তৈরি করে) রেকর্ড করে, সেই pending review-এর সাথে যুক্ত করে
3. `.waitForTaskToken` সহ Step Functions-এ return করে — যা Step Functions-কে এই state-এ অনির্দিষ্টকালের জন্য execution pause করতে বলে

Step Functions execution park করে। অন্য কিছু block হয় না — কোনো server অপেক্ষা করে বসে থাকে না। State machine কেবল অপেক্ষা করে, কোনো compute resource consume না করে।

তিন দিন পরে, account manager internal admin tool-এ "Approve" ক্লিক করে। Admin tool database থেকে task token খুঁজে নেয় এবং call করে:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions resume করে। Execution step 2 (`ImportMenu`) থেকে চলতে থাকে, workflow state-এ reviewer-এর তথ্য available সহ।

"Execution তিন দিনের জন্য pause ছিল," Leo বলল, "এবং আমি অনুমোদন করার সময় একমাত্র যে জিনিস ঘটল তা ছিল একটি API call।"

"এবং account manager এটা reject করলে?" Maya জিজ্ঞেস করল।

"আমরা পরিবর্তে `send_task_failure` call করি। State machine সেটা catch করে এবং একটি `NotifyRejection` state-এ route করে যা রেস্তোরাঁ partner-কে email করে।"

Step Functions poll করে না। এটা retry করে না। এটা timeout হয় না (যদি না আপনি একটি heartbeat timeout সেট করেন)। এটা কেবল callback না আসা পর্যন্ত অপেক্ষা করে, তারপর চলতে থাকে। এটা একটি database বা queue poll করার থেকে মৌলিকভাবে ভিন্ন — এবং এই কারণেই Step Functions স্বয়ংক্রিয় এবং ম্যানুয়াল step মিশ্রিত করা workflow-এর জন্য উপযুক্ত।

**Execution Console পড়া: একটি Failure দেখতে কেমন**

Step Functions-এ Nimbus-এর প্রথম সপ্তাহে রেস্তোরাঁ notification Lambda timeout হলে, Leo Step Functions console খুলল এবং ব্যর্থ execution-এ ক্লিক করল।

**Execution Event History** ঠিক কী ঘটেছিল তার একটি timeline দেখাল:

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

৪২ সেকেন্ডে, Step Functions card charge করেছিল, email পাঠিয়েছিল, রেস্তোরাঁ notification তিনবার চেষ্টা করেছিল, failure catch করেছিল, support team-কে alert করেছিল, এবং সম্পূর্ণ history রেকর্ড করেছিল। Step Functions-এর আগে, এই failure অদৃশ্য থাকত — Python function "notification failed" log করত এবং caller-এর কাছে 200 return করত যেন কিছু ভুল ছিল না।

"Timeline ঠিক দেখায় কোথায় জিনিস ভুল হয়েছিল এবং কখন," Leo বলল। "এবং প্রতিটি retry attempt timestamp করা। আপনি backoff interval দেখতে পারেন।"

Priya console-এর দিকে তাকাল। "এবং এই history কতদিন store করা হয়?"

Standard workflow execution history ৯০ দিনের জন্য store করা হয়। compliance বা দীর্ঘমেয়াদী auditing-এর জন্য, execution event CloudWatch Logs-এও export করা যায় এবং অনির্দিষ্টকালের জন্য রাখা যায়।

**Standard বনাম Express Workflow**

Step Functions দুটি workflow type offer করে:

**Standard workflow**:

- সর্বোচ্চ সময়কাল: ১ বছর
- Execution durable — state persist করা, পরিদর্শন এবং audit করা যায়
- Exactly-once execution (আপনি একটি Retry configure না করলে একটি task কখনো একাধিকবার চলে না)
- প্রতি state transition-এ মূল্য নির্ধারণ
- দীর্ঘ-চলমান, গুরুত্বপূর্ণ workflow-এর জন্য সর্বোত্তম (order processing, onboarding, payment flow)

**Express workflow**:

- সর্বোচ্চ সময়কাল: ৫ মিনিট
- উচ্চতর throughput — প্রতি সেকেন্ডে ১,০০,০০০ পর্যন্ত
- At-least-once execution (asynchronous) বা at-most-once (synchronous) — task-গুলিকে idempotent হতে design করুন
- সময়কাল অনুযায়ী মূল্য (Lambda-এর মতো)
- উচ্চ-volume, স্বল্প-সময়ের workflow-এর জন্য সর্বোত্তম (real-time event processing, IoT data ingestion)

"এটার মাসে কত খরচ?" Tom pricing page টেনে জিজ্ঞেস করল। "Standard-এর জন্য প্রতি state transition — আপনার অনেক step থাকলে এটা যোগ হয়।"

Leo হিসাবটা ব্যাখ্যা করল। রেস্তোরাঁ onboarding workflow-এর জন্য (প্রতি execution ছয়টি task state, মোটামুটি মাসে 12-15টি নতুন রেস্তোরাঁ): একশর কম state transition — এক সেন্টের কম, এবং সম্পূর্ণভাবে 4,000-transition মাসিক free tier-এর মধ্যে, তাই কার্যত $0। পূর্ণ Nimbus traffic-এ order confirmation workflow-এর জন্য: আরও অর্থপূর্ণ, কিন্তু এখনও মাসে এগারোটি partial success ম্যানুয়ালি debug করার cost-এর অনেক নিচে।

"Debugging time হলো লুকানো cost," Leo বলল।

"সেটা সবসময়ই লুকানো cost," Tom বলল।

Tom সংখ্যাগুলি আরও সাবধানে চালাল, কারণ সেটাই Tom।

**Nimbus-এর order confirmation flow-এর জন্য Standard workflow cost**: happy path-এ প্রতি order পাঁচটি state, প্রতি state transition $0.000025-এ। পাঁচটি state transition × $0.000025 × মাসে ১৫,০০০ order = **$1.88/মাস**। order volume-এর দশ গুণে: মাসে প্রায় $19। একটি partial-success incident-এর জন্য debugging cost (২৪ মিনিটের support engineer সময়) মাসিক Step Functions বিলকে বহুগুণ ছাড়িয়ে যেত।

তুলনাটি গুরুত্বপূর্ণ হয়ে ওঠে যদি কেউ high-frequency analytics event-এর জন্য Standard workflow ব্যবহার করার পরামর্শ দেয়। ধরুন Nimbus প্রতিটি raw clickstream event process করতে Step Functions ব্যবহার করতে চাইল — প্রতিটি menu page view, প্রতিটি scroll, প্রতিটি search। সেটা তাদের current scale-এ মোটামুটি প্রতিদিন ৮,০০,০০০ event। প্রতিটি event-এর জন্য একটি পাঁচ-state Standard workflow: ৮,০০,০০০ × ৫ × $0.000025 × ৩০ দিন = **$3,000/মাস**। সেটা একটি analytics pipeline-এর জন্য বাস্তব অর্থ।

সেই একই volume-এর জন্য Express workflow: প্রতি state transition নয়, প্রতি request plus সময়কাল অনুযায়ী মূল্য। ২৪ মিলিয়ন মাসিক execution প্রতি মিলিয়ন request $1.00-এ = $24। সময়কাল: 64MB billing ন্যূনতমে ২৪M × 500ms ≈ ২০৮ GB-hour × $0.06 = $12.50। মোট ≈ **$36.50/মাস** — Standard-এর $3,000-এর চেয়ে প্রায় দুই order of magnitude সস্তা।

"তাহলে workflow-এর type কেবল একটি architectural সিদ্ধান্ত নয়," Tom বলল। "এটা একটি cost সিদ্ধান্ত। আপনি কোন workflow type ব্যবহার করেন তার উপর নির্ভর করে একই সংখ্যক state প্রায় একশ গুণ বেশি খরচ করতে পারে।"

"এবং কোনটি ভালো তা সম্পূর্ণভাবে workflow কী করে তার উপর নির্ভর করে," Leo বলল। "Order confirmation: Standard। এটা গুরুত্বপূর্ণ, এর অর্থপূর্ণ failure path আছে, আমরা audit trail চাই। Analytics event processing: Express। এটা high volume, short duration, এবং আমাদের প্রতিটি page view-এর জন্য ৯০-দিনের execution history দরকার নেই।"

আপনার process-এর দুটি step থাকলে এবং একটি audit trail দরকার না হলে, একটি সহজ Lambda function সস্তা এবং কোনো JSON state machine syntax প্রয়োজন হয় না — কিন্তু কোনো step স্বাধীনভাবে ব্যর্থ হতে পারলে এবং আগের step পুনরাবৃত্তি না করে retry বা restart করতে হলে, Step Functions কমানো debugging এবং ম্যানুয়াল remediation-এ এর খরচ উঠিয়ে আনে।

Nimbus-এর রেস্তোরাঁ onboarding-এর জন্য: Standard (এটা গুরুত্বপূর্ণ, durable, ম্যানুয়াল step জড়িত থাকলে ঘণ্টা নিতে পারে)।

Nimbus-এর real-time order status update-এর জন্য: Express (high volume, short duration, কম critical)।

**Event-Driven Architecture: বৃহত্তর চিত্র**

Step Functions একটি বৃহত্তর pattern-এর একটি অংশ: **event-driven architecture**। service-গুলি একে অপরকে সরাসরি call করার (tight coupling) পরিবর্তে, service-গুলি event নির্গত করে, এবং অন্য service-গুলি সেই event-এ প্রতিক্রিয়া জানায়।

আমরা এটা বই জুড়ে দেখেছি:

- Order placed → SNS event publish করে → SQS queue consumer-দের কাছে deliver করে
- S3 file uploaded → এটা process করতে Lambda trigger হয়
- DynamoDB record changed → DynamoDB Streams → Lambda একটি cache আপডেট করে

**Amazon EventBridge** (পূর্বে CloudWatch Events) এই pattern-এর জন্য advanced event bus। এটা AWS service এবং আপনার নিজস্ব application থেকে event-গুলিকে rule-এর উপর ভিত্তি করে target (Lambda, SQS, Step Functions, ইত্যাদি)-এ route করে।

EventBridge একটি architectural স্তরে loose coupling অনুমতি দেয়: order service কে শুনছে তা না জেনে `order.placed` event publish করে। Analytics service, notification service, এবং loyalty points service সবাই স্বাধীনভাবে শোনে। একটি নতুন listener যোগ করতে order service পরিবর্তন করতে হয় না।

EventBridge **event source** হিসেবে ডজন ডজন AWS service-এর সাথে natively integrate-ও করে। একটি CloudTrail API call একটি pattern match করলে, EventBridge একটি rule fire করতে পারে। একটি EC2 instance state পরিবর্তন করলে, EventBridge একটি Lambda trigger করতে পারে। একটি RDS instance failover হলে, EventBridge on-call engineer-কে alert করতে পারে। আপনি পুরো AWS control plane-কে একটি event stream হিসেবে treat করতে পারেন।

Nimbus-এর জন্য, একটি বিশেষভাবে দরকারী EventBridge rule: ECR-এ একটি নতুন image push হলে যখনই একটি Lambda trigger করুন। Lambda image scan result check করে এবং কোনো HIGH বা CRITICAL CVE পাওয়া গেলে engineering Slack channel-এ post করে — কেউ image deploy করার আগে। এটা ECR-এর security scanning (অধ্যায় ২১ থেকে)-কে EventBridge-এর event routing-এর সাথে একটি স্বয়ংক্রিয় security gate-এ সংযুক্ত করে।

Event-driven architecture-এর নীতি Step Functions-এর retry logic-এর মতোই: failure-কে স্পষ্ট এবং routed করুন, নীরব এবং গিলে ফেলা নয়। যে service event-এর মাধ্যমে যোগাযোগ করে তারা gracefully ব্যর্থ হয় — একটি `OrderConfirmed` event fire করার সময় loyalty points Lambda ডাউন থাকলে, EventBridge delivery retry করতে পারে বা একটি dead-letter queue-তে পাঠাতে পারে। Order confirmation নিজেই unaffected। Decoupling-ই হলো resilience।

**EventBridge: Main Flow থেকে Side Effect Decouple করা**

Order confirmation state machine পরিষ্কারভাবে চলার পরে, Maya পরবর্তী architecture review-তে একটি প্রশ্ন তুলল।

"আমরা একটি order confirmed হলে loyalty points যোগ করতে চাই। গ্রাহক প্রতি ডলার খরচে একটি point পায়। সেটা state machine-এ কোথায় যায়?"

Leo-র প্রথম অন্তর্দৃষ্টি: `LogTransaction`-এর পরে একটি `GrantLoyaltyPoints` state যোগ করা।

Priya-র প্রতিক্রিয়া: "এবং তারপর যখন আমরা referral bonus যোগ করি? এবং post-order survey? এবং restaurant rating request? প্রতিটি critical path-এ একটি state যোগ করে। loyalty points Lambda ব্যর্থ হলে, পুরো order confirmation ব্যর্থ হয়।"

"Order confirmation flow-এর একটি জিনিস করা উচিত," সে বলল। "Order confirm করা। বাকি সব একটি side effect।"

এটাই main workflow থেকে side effect loose-coupling করার mechanism হিসেবে **Amazon EventBridge**-এর architectural যুক্তি।

সংশোধিত পদ্ধতি: `LogTransaction` state সফলভাবে সম্পূর্ণ হলে, Lambda EventBridge-এ একটি event publish করে:

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

তারপর EventBridge rule সেই event-কে স্বাধীন target-এ route করে:

- **Rule 1**: `OrderConfirmed` → Loyalty Points Lambda (একটি $32 order-এর জন্য 32 point দেয়)
- **Rule 2**: `OrderConfirmed` → Post-Order Survey Lambda (delivery-র ২ ঘণ্টা পরে একটি survey queue করে)
- **Rule 3**: `OrderConfirmed` → Analytics Kinesis Stream (real-time dashboard-এ feed করে)

প্রতিটি rule স্বাধীন। Loyalty Points Lambda survey queue প্রভাবিত না করে ব্যর্থ হতে পারে। Analytics pipeline loyalty system block না করে পিছিয়ে পড়তে পারে। একটি নতুন side effect যোগ করা (একটি restaurant rating request, একটি cashback notification) একটি নতুন EventBridge rule তৈরি করা প্রয়োজন — state machine পরিবর্তন করা নয়।

"এবং কেউ যদি একটি EventBridge rule-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "Event-এ customer PII থাকলে, এটা receive করা প্রতিটি Lambda এখন একটি PII access point।"

Event সাবধানে design করা হয়েছিল: শুধুমাত্র ID, name, address, বা payment detail নয়। customer data প্রয়োজন এমন যেকোনো Lambda customer ID ব্যবহার করে database থেকে এটা খুঁজে নিত — এটা কী access করতে পারে তা নিয়ন্ত্রণ করা নিজস্ব IAM permission সহ।

"Event একটি signal," Priya বলল। "একটি data dump নয়।"

**যখন Step Functions সঠিক Tool**

Step Functions দুর্দান্ত হয় যখন আপনার থাকে:

**Multi-step workflow** যা step জুড়ে progress ট্র্যাক করতে হবে

**Human-in-the-loop process** — Step Functions একটি বাহ্যিক event-এর জন্য (যেমন একজন মানুষের কিছু অনুমোদন করা) অনির্দিষ্টকালের জন্য অপেক্ষা করতে পারে এবং তারপর চলতে পারে

**Scale-এ error handling** — অনেক step জুড়ে বিল্ট-ইন retry, catch, এবং fallback logic

**Auditable process** — প্রতিটি execution প্রতিটি state transition রেকর্ড করে। আপনি ঠিক কী ঘটেছিল এবং কখন দেখতে পারেন।

**জটিল সমান্তরাল বা ক্রমিক logic** — visual workflow সমতুল্য কোডের চেয়ে যুক্তি করা সহজ করে

Step Functions সহজ দুই-step process-এর জন্য overkill। এটা ব্যবহার করুন যখন coordination নিজেই মূল্যবান এবং failure scenario গুরুত্বপূর্ণ।

**যখন Step Functions ভুল Tool**

"দাঁড়াও — কিন্তু আমরা কেন সবকিছুর জন্য Step Functions ব্যবহার করব না?" design session-এর শেষে Maya জিজ্ঞেস করল। "আমরা রেস্তোরাঁ onboarding workflow তৈরি করেছি। আমাদের order confirmation flow আছে। সবকিছু state machine-এ convert করব না কেন?"

সৎ উত্তর: কারণ Step Functions এমন overhead যোগ করে যা প্রতিটি workflow justify করে না।

**সহজ দুই-step process**: আপনার একটি Lambda থাকলে যা একটি দ্বিতীয় Lambda call করে একটি uploaded file process করে, একটি state machine-এর coordination overhead operational benefit-এর মূল্যের নয়। একটি single function-এর মধ্যে ক্রমানুসারে call করা দুটি Lambda সহজ, test করা সহজ, এবং কোনো per-state-transition cost নেই।

**Ultra-high frequency, sub-second workflow**: Standard workflow-এর একটি non-trivial per-state-transition cost আছে যা high volume-এ জমা হয় (উপরের analytics উদাহরণ যেমন দেখিয়েছে)। Express workflow cost সমস্যা সমাধান করে কিন্তু durable state history প্রদান করে না। খুব high frequency-এ খুব short duration সহ, SQS plus Lambda (অধ্যায় ১৯-এর pattern) উভয় Step Functions type-এর চেয়ে সহজ এবং সস্তা।

**Pure fan-out কোনো coordination ছাড়া**: আপনার একই event বিশটি consumer-এ পাঠাতে হলে এবং প্রতিটির outcome নিয়ে চিন্তা না করলে, SNS হলো tool। Step Functions এমন state tracking যোগ করে যা আপনার দরকার নেই এবং অপ্রয়োজনীয়ভাবে এর জন্য পেমেন্ট করবেন।

**Real-time synchronous user interaction**: Step Functions execution asynchronous। একজন ব্যবহারকারী ৫০০ms-এর নিচে একটি synchronous response-এর জন্য একটি checkout screen-এ অপেক্ষা করলে, একটি Step Functions Standard workflow এর জন্য design করা নয় (Express workflow synchronously invoke করা যায়, কিন্তু latency overhead এখনও একটি সরাসরি Lambda call-এর চেয়ে বেশি)। synchronous user-facing flow-এর জন্য, ভালো-design করা error handling সহ Lambda + API Gateway প্রায়ই বেশি উপযুক্ত।

নীতি: Step Functions ব্যবহার করুন যখন step-গুলির *coordination* নিজেই জটিল — যখন step স্বাধীনভাবে ব্যর্থ হতে পারে, যখন আপনার আগের step পুনরাবৃত্তি না করে individual step retry করতে হয়, যখন execution history-র compliance বা debugging মূল্য আছে, বা যখন workflow-এ মানুষের অনুমোদন step জড়িত যা দিন নিতে পারে। সহজ ক্রমিক logic যা একটি single function হিসেবে ভালো কাজ করে তাতে orchestration overhead যোগ করতে এটা ব্যবহার করবেন না।

## শক্তি এবং সীমাবদ্ধতা

**কেন Step Functions শক্তিশালী**:

- visual execution history — একটি workflow কোথায় আছে (বা ব্যর্থ হয়েছে) ঠিক দেখুন
- বিল্ট-ইন retry এবং error handling — কোনো custom retry কোড নেই
- durable state — execution service restart এবং outage থেকে বেঁচে থাকে
- ২০০+ AWS service-এর সাথে সরাসরি integration (শুধু Lambda নয়)
- visual workflow self-documenting
- callback pattern compute consume না করে মানুষের action-এর জন্য অনির্দিষ্ট অপেক্ষা সক্ষম করে

**যেখানে জটিল হয়**:

- Standard workflow প্রতি state transition-এ মূল্য নির্ধারণ করে — অনেক state সহ জটিল workflow scale-এ ব্যয়বহুল হতে পারে
- ASL (Amazon States Language) JSON format-এর একটি learning curve আছে
- সর্বোচ্চ payload size 256KB — বড় data সরাসরি workflow-এর মাধ্যমে নয়, S3 reference-এর মাধ্যমে pass করতে হবে
- অনেক ম্যানুয়াল step সহ দীর্ঘ-চলমান workflow-এর সাবধান timeout configuration প্রয়োজন
- ASL error debug করতে execution চালানো প্রয়োজন; প্রকৃত service-এর মতো সক্ষম কোনো local emulator নেই
- state machine যে প্রতিটি resource call করে তার জন্য IAM permission আলাদাভাবে দিতে হবে — একটি permission ভুলে গেলে runtime-এ একটি বিভ্রান্তিকর error হয়

## সারসংক্ষেপ

অধ্যায় ২১-এর container deployment নির্ভরযোগ্য করেছিল। Step Functions multi-step ব্যবসায়িক process নির্ভরযোগ্য করে — "handoff risk দূর করুন" একই নীতি application logic-এ প্রয়োগ করা।

- **Step Functions** state machine হিসেবে multi-step workflow orchestrate করে।
- প্রতিটি **state** একটি Lambda function চালাতে, একটি ECS task execute করতে, অপেক্ষা করতে, branch করতে, বা সমান্তরাল step চালাতে পারে।
- **Retry এবং catch** প্রতিটি state-এ বিল্ট-ইন — কোনো custom retry কোড প্রয়োজন নেই।
- **Standard workflow**: দীর্ঘ-চলমান (১ বছর পর্যন্ত), durable, exactly-once। critical ব্যবসায়িক process-এর জন্য।
- **Express workflow**: স্বল্প-সময় (৫ মিনিট পর্যন্ত), high-throughput। high-volume event processing-এর জন্য।
- **task token সহ callback pattern**: একটি বাহ্যিক event বা মানুষের action-এর জন্য অপেক্ষা করে একটি workflow অনির্দিষ্টকালের জন্য pause করুন; একটি single API call দিয়ে resume করুন।
- **Map state**: একটি item-এর list concurrently process করুন — ক্রমিক loop-কে সমান্তরাল fan-out দিয়ে প্রতিস্থাপন করুন।
- **Direct SDK integration**: একটি Lambda wrapper ছাড়াই একটি state থেকে সরাসরি DynamoDB, S3, SQS, এবং ২০০+ AWS service call করুন।
- **EventBridge**: main workflow থেকে side effect decouple করুন — একটি single event publish করুন, core state machine পরিবর্তন না করে স্বাধীন rule-কে এটা loyalty points, analytics, এবং survey service-এ route করতে দিন।
- **Standard বনাম Express cost**: প্রতি state transition $0.000025-এ Standard low-volume critical workflow-এর জন্য ভালো কাজ করে (Nimbus-এর জন্য মাসে $1.88-এ order confirmation)। per-request-plus-duration মূল্যে Express high-frequency event-এর জন্য উপযুক্ত যেখানে Standard কয়েক ডজন গুণ বেশি খরচ করত (Nimbus-এর clickstream হিসাবে ~80x)।
- **Event-driven architecture** সরাসরি call-এর পরিবর্তে event-এর চারপাশে সিস্টেম decouple করতে SNS, SQS, Lambda, এবং EventBridge-এর মতো service ব্যবহার করে।
- Step Functions ব্যবহার করুন যখন step-গুলির coordination নিজেই জটিল এবং যখন auditability গুরুত্বপূর্ণ। সহজ দুই-step sequence, ultra-high-frequency workflow, pure fan-out, বা synchronous user-facing flow-এর জন্য এটা ব্যবহার করবেন না।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Resilient Architectures (ডোমেন ২, টাস্ক ২.১)*

- **Step Functions use case সংকেত**: "একাধিক Lambda function orchestrate করুন," "retry এবং error handling সহ workflow," "একটি স্বয়ংক্রিয় workflow-এ মানুষের অনুমোদন step," "প্রতিটি workflow step-এর audit trail" → Step Functions।
- **Standard বনাম Express**: দীর্ঘ-চলমান, auditable, business-critical workflow-এর জন্য Standard। high-throughput, short-duration event processing-এর জন্য Express।
- **SQS বনাম Step Functions**: সহজ task queue (producer/consumer)-এর জন্য SQS। জটিল logic, retry, এবং state tracking সহ multi-step workflow-এর জন্য Step Functions।
- **EventBridge সংকেত**: "AWS service থেকে target-এ event route করুন," "service-গুলির মধ্যে event-driven integration," "একটি Lambda function schedule করুন" → EventBridge (পূর্বে CloudWatch Events)।
- **Callback pattern**: Step Functions execution pause করতে এবং একটি বাহ্যিক callback-এর জন্য অপেক্ষা করতে পারে (একটি task token)। worker সম্পন্ন হলে callback করে। দীর্ঘ-চলমান ECS task-এর জন্য উপযোগী যেখানে আপনি Lambda-র ১৫-মিনিটের সীমা চান না।
- **Direct SDK integration**: Step Functions Lambda-র মাধ্যমে না গিয়ে সরাসরি AWS service (DynamoDB, S3, SQS, ইত্যাদি) call করতে পারে। সহজ service call-এর জন্য cost এবং latency কমায়। উদাহরণস্বরূপ, DynamoDB-তে একটি order record লেখা একটি Lambda function ছাড়াই state machine থেকে একটি direct SDK call হতে পারে: `"Resource": "arn:aws:states:::dynamodb:putItem"`। এটা Lambda cold start, Lambda execution cost, এবং যে কোড কেবল `dynamodb.put_item(...)` call করে এবং return করে তা দূর করে।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

multi-step workflow-এর জন্য Step Functions কেন উপযোগী তা ব্যাখ্যা করুন। এটা এমন কী প্রদান করে যা অন্য Lambda function call করা একটি সহজ Lambda function করে না?

*(ইঙ্গিত: প্রতিটি পদ্ধতিতে 5-এর মধ্যে step 3 ব্যর্থ হলে কী হয় তা নিয়ে ভাবুন। আপনি কীভাবে জানেন কী হয়েছে? আপনি কীভাবে শুধুমাত্র step 3 retry করেন?)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি financial services কোম্পানি একাধিক step-এ loan application process করে: credit check, income verification, document validation, underwriter review (ম্যানুয়াল), এবং decision notification। প্রতিটি step সেকেন্ড (credit check) থেকে দিন (underwriter review) পর্যন্ত যেকোনো সময় নিতে পারে। কোম্পানির compliance-এর জন্য প্রতিটি step-এর একটি সম্পূর্ণ audit trail প্রয়োজন। ব্যর্থ স্বয়ংক্রিয় step অবশ্যই স্বয়ংক্রিয়ভাবে retry করতে হবে; ম্যানুয়াল step অবশ্যই pause করতে এবং একজন মানুষের সিদ্ধান্তের জন্য অপেক্ষা করতে হবে।

কোন service এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) প্রতিটি step-এর মধ্যে SQS queue সহ একসাথে chain করা AWS Lambda function  
B) underwriter review step-এর জন্য Wait for callback pattern সহ AWS Step Functions Standard workflow  
C) স্বয়ংক্রিয় step-এর জন্য AWS Step Functions Express workflow এবং ম্যানুয়াল step-এর জন্য SQS FIFO  
D) প্রতিটি step-এর জন্য Lambda function-গুলির মধ্যে event rule routing সহ Amazon EventBridge

**ইঙ্গিত ১**: "দিন পর্যন্ত" সময়কাল — কোন Step Functions type এটা সমর্থন করে?

**ইঙ্গিত ২**: "একজন মানুষের সিদ্ধান্তের জন্য অপেক্ষা করুন" — কোন Step Functions pattern এর জন্য design করা?

**ইঙ্গিত ৩**: "compliance-এর জন্য সম্পূর্ণ audit trail" — কোন service per-execution state history প্রদান করে?

**উত্তর**: B

**ব্যাখ্যা**: Step Functions Standard workflow ১ বছর পর্যন্ত চলতে পারে, দিনব্যাপী underwriter review step সমর্থন করে। Wait for callback pattern একটি task token সহ underwriter step-এ execution pause করে; underwriter একটি সিদ্ধান্ত নিলে, তারা workflow চালিয়ে যেতে token সহ callback করে। Standard workflow প্রতিটি state transition রেকর্ড করে — compliance-এর জন্য সম্পূর্ণ audit trail।

**কেন A নয়?** SQS-এর মাধ্যমে chain করা Lambda কোনো বিল্ট-ইন state tracking বা audit trail প্রদান করে না। ব্যর্থ step-এর custom retry logic প্রয়োজন। একটি নির্দিষ্ট ব্যর্থ step থেকে restart করতে custom implementation প্রয়োজন।

**কেন C নয়?** Express workflow-এর সর্বোচ্চ ৫-মিনিটের সময়কাল — দিন নিতে পারে এমন একটি step-এর সাথে অসামঞ্জস্যপূর্ণ।

**কেন D নয়?** EventBridge service-গুলির মধ্যে event route করে কিন্তু workflow state বজায় রাখে না বা বিল্ট-ইন retry/audit প্রদান করে না। শুধুমাত্র EventBridge-এ এটা তৈরি করতে custom state management প্রয়োজন।

*SAA-C03 ডোমেন: Design Resilient Architectures — টাস্ক ২.১*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus একটি food quality dispute resolution process তৈরি করছে। একজন গ্রাহক একটি খারাপ অভিজ্ঞতা রিপোর্ট করলে:

1. রিপোর্টটি স্বয়ংক্রিয়ভাবে যাচাই করা হয় (order বিদ্যমান কিনা, এটা যথেষ্ট সাম্প্রতিক কিনা check করে)
2. রেস্তোরাঁকে স্বয়ংক্রিয়ভাবে notify করা হয়
3. একজন Nimbus support agent অভিযোগ পর্যালোচনা করে (ম্যানুয়াল step — ১-৩ ব্যবসায়িক দিন নিতে পারে)
4. agent-এর সিদ্ধান্তের উপর ভিত্তি করে: refund issue করুন (Lambda → payment processor) অথবা apology coupon পাঠান (Lambda → coupon service) অথবা management-এ escalate করুন (Step Functions sub-workflow)
5. গ্রাহককে outcome সম্পর্কে notify করা হয়

এটাকে একটি Step Functions workflow হিসেবে design করুন। কোন state type প্রতিটি step handle করে? ১-৩ দিনের অপেক্ষা কীভাবে handle করবেন? step 4-এ branch কীভাবে model করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো Step Functions state design অনুশীলন করা।)*

**এক্সটেনশন**: state machine সম্পূর্ণ হওয়ার পরে (যে branch-ই হোক), এটা EventBridge-এ একটি `OrderDisputeResolved` event publish করে। কোন side effect এই event শুনতে পারে? বিবেচনা করুন: রেস্তোরাঁর rating system, গ্রাহকের loyalty points (refund point কেটে নিতে পারে), analytics pipeline (dispute rate একটি মূল রেস্তোরাঁ quality metric), এবং customer support team-এর SLA tracking dashboard। এখানে EventBridge ব্যবহার করা কীভাবে dispute state machine-কে একটি dependency spider হওয়া থেকে রক্ষা করে?

## পোস্ট-ক্রেডিটস দৃশ্য

রেস্তোরাঁ onboarding workflow live ছিল।

পরের মাসে, ১২টি নতুন রেস্তোরাঁ partner onboard হল। দুটিতে payment processing step (step 3)-এ failure ছিল। উভয় ক্ষেত্রে, Step Functions সঠিক error capture করল, execution-এর state সংরক্ষণ করল, এবং Nimbus দলকে একটি alert পাঠাল।

Leo root cause ঠিক করল (payment provider-এর জন্য একটি ভুল configure করা API key) এবং উভয় execution step 3 থেকে retry করল। Execution-গুলি প্রতিটি ২৩ সেকেন্ডে সম্পূর্ণ হল, ঠিক যেখানে ব্যর্থ হয়েছিল সেখান থেকে তুলে নিয়ে।

কোনো রেস্তোরাঁ পুনরায় import করতে হয়নি। কোনো IAM role দ্বিগুণ তৈরি হয়নি। কোনো duplicate welcome email পাঠানো হয়নি।

"Step Functions-এর আগে," Leo Maya-কে বলল, "এর জন্য কাউকে প্রতিটি রেস্তোরাঁর জন্য কী করা হয়েছে এবং হয়নি তা ম্যানুয়ালি ট্র্যাক করতে হত, এবং অনুপস্থিত step-গুলি ম্যানুয়ালি পুনরায় চালাতে হত।"

"এবং এখন?"

"এখন আমি console-এ retry ক্লিক করি। সিস্টেম জানে কী করা হয়েছে।"

Maya এটা নিয়ে ভাবল।

"এটা কেবল একটি প্রযুক্তিগত উন্নতি নয়," সে বলল। "এটা এমন একটি process-এর মধ্যে পার্থক্য যা scale করে এবং যেটা করে না।"

পরবর্তী অধ্যায়ে: আপনি এখন access করছেন না কিন্তু অবশ্যই চিরকাল রাখতে চান এমন data নিয়ে কী করবেন।
