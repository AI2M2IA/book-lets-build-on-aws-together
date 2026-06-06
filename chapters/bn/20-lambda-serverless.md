# অধ্যায় ২০: ফ্রিল্যান্সার মডেল

এটি একটি শান্ত বুধবার বিকেল ছিল। Priya একবারের জন্য তার headphone খুলে রেখেছিল, এবং অফিসে এমন একটি নিচু গুঞ্জন ছিল যার মানে সবাই মনোযোগী ছিল কিন্তু কেউ আতঙ্কিত ছিল না। Leo-র এক স্ক্রিনে একটি cost dashboard খোলা ছিল এবং অন্যটিতে EC2 instance তালিকা।

এমন একজন freelancer-এর কথা ভাবুন যে on-call কাজ করে। তারা নয়টা থেকে পাঁচটা পর্যন্ত একটি ডেস্কে বসে থাকে না। তারা অপেক্ষা করে। ফোন বাজে, তারা কাজ করে, তারা একটি invoice পাঠায়, তারা আবার অপেক্ষায় ফিরে যায়। কোনো কাজ নেই, কোনো খরচ নেই। request-এর একটি burst, তারা একসাথে সবগুলি handle করে। আপনি শুধুমাত্র প্রকৃতপক্ষে কাজ করা ঘণ্টার জন্য পেমেন্ট করেন — তারা available থাকা ঘণ্টার জন্য নয়।

সেটাই এই অধ্যায়ের মডেল।

এখানে ধরে রাখার মতো একটি সূক্ষ্মতা আছে। ঐতিহ্যবাহী মডেল হলো: একজন কর্মচারী নিয়োগ করুন, ৮ ঘণ্টার জন্য পেমেন্ট করুন, পরিবর্তনশীল output পান। Freelancer মডেল হলো: শুধুমাত্র ফোন বাজলে পেমেন্ট করুন, ঠিক যা request করা হয়েছিল তাই পান। পূর্বানুমেয়, ধ্রুবক চাহিদা সহ একটি কোম্পানির জন্য, কর্মচারী মডেল আরও দক্ষ — আপনি জানেন ফোন ক্রমাগত বাজবে, তাই ঘণ্টায় পেমেন্ট সমতুল্য এবং engagement ও disengagement-এর কোনো overhead নেই। পরিবর্তনশীল, spiky, বা অনিয়মিত চাহিদা সহ একটি কোম্পানির জন্য, freelancer মডেল নাটকীয়ভাবে সস্তা।

AWS compute-এর জন্য সেই মডেল offer করে — এবং এটি অর্থপূর্ণ কিনা তা আপনার চাহিদার pattern-এর উপর নির্ভর করে। প্রথম প্রশ্নটি কখনো "এই মডেল কি ভালো?" নয় বরং "আমার workload আসলে কেমন দেখায়?"

একটি startup-এর চেয়ে বড় বেশিরভাগ workload-এর জন্য: একটি মিশ্রণ। কিছু জিনিস ক্রমাগত চলে (API server, database)। কিছু জিনিস শুধুমাত্র trigger হলে চলে (event processing, report generation, image resizing)। Freelancer মডেল দ্বিতীয় বিভাগের জন্য — এবং Nimbus আবিষ্কার করতে চলেছিল তার বিলের কতটা সেখানে অন্তর্গত।

---

SQS/SNS fan-out order flow decouple করেছিল, কিন্তু সেই queue consume করা worker-গুলি এখনও EC2 instance-এ চলত যা ঘণ্টায় চার্জ করত — তারা আসলে কতগুলি email পাঠিয়েছে তা নির্বিশেষে। Architecture সঠিক ছিল; cost মডেলে এখনও একটি ফুটো ছিল।

Priya এটি প্রথমে লক্ষ্য করেছিল।

"Email service," সে বলল। "আমরা প্রতিদিন কতগুলি email পাঠাই?"

Leo metric check করল। "গড়ে দিনে ৪০০। শুক্রবার রাতে peak প্রায় ১,২০০।"

"এবং email service চালানো EC2 instance — কতক্ষণ চলে?"

"সবসময়। ২৪/৭।"

"রাত ৩টায়ও যখন আমরা শূন্য email পাঠাই?"

নীরবতা।

Leo email service EC2 instance-এর জন্য CloudWatch CPU graph টেনে আনল। Graph ১৮ ঘণ্টার ক্রমাগত operation দেখাল। শুক্রবার peak-এ: CPU ৩৮%-এ, email burst handle করছে। মধ্যরাতের পরে: CPU ৩%-এ নেমে এল। Lunch order শুরু না হওয়া পর্যন্ত সেখানে রইল।

টানা ১৮ ঘণ্টা তিন শতাংশ CPU। Instance চলছিল। এটি বিল করছিল। এটি অর্থপূর্ণ কিছু করছিল না।

"আমরা একটি কম্পিউটারের জন্য পেমেন্ট করছি যা সেখানে বসে কিছু করছে না," Leo বলল।

"দিনে কত ঘণ্টার জন্য?"

আরও নীরবতা।

"প্রায় ১৮।"

Tom এখন খুব মনোযোগী ছিল।

"এবং এটা শুধু email service নয়," Priya যোগ করল। "রেস্তোরাঁর ছবির জন্য image resizing service বেশিরভাগ সময় ১% CPU-তে চলে। এটি কেবল spike করে যখন একটি রেস্তোরাঁ একটি নতুন menu আপলোড করে। যা ঘটে, কী, প্রতি রেস্তোরাঁ দিনে কয়েকবার?"

"হ্যাঁ," Leo নিশ্চিত করল।

"রাতের cleanup job যা temp file delete করে — সেটা রাত ২টায় ৪ মিনিট চলে এবং তারপর সম্পূর্ণভাবে ২৩ ঘণ্টা ৫৬ মিনিট নিষ্ক্রিয় বসে থাকে।"

"এটাও হ্যাঁ।"

Nimbus-এর সমস্ত ছোট service জুড়ে pattern একই ছিল: compute দিনে ২৪ ঘণ্টার জন্য পেমেন্ট করা, তার একটি ভগ্নাংশের জন্য ব্যবহৃত।

---

**সার্ভার সবসময় উত্তর নয়**

EC2 instance স্থায়ী। আপনি একটি শুরু করেন এবং এটি চলতে থাকে যতক্ষণ না আপনি এটি বন্ধ করেন — দিনে ২৪ ঘণ্টা, সপ্তাহে ৭ দিন, প্রকৃত ব্যবহার নির্বিশেষে। আপনার web server-এর জন্য (যা সব ঘণ্টায় traffic handle করে), এটি সঠিক। Email service-এর জন্য (যা email-এর burst পাঠায় এবং তারপর ঘণ্টার পর ঘণ্টা নিষ্ক্রিয় থাকে), এটি অপচয়।

Auto Scaling Group off-peak ঘণ্টায় email service-কে একটি instance-এ scale down করতে পারে। কিন্তু একটি instance এখনও ক্রমাগত চলে।

এটি সেই প্রশ্ন যেখানে Tom বিল দেখার সময় বারবার ফিরে আসত: সেই ১৮ ঘণ্টার ৩% CPU-এর সময় প্রতিটি service আসলে কী করছিল? প্রযুক্তিগতভাবে কিছুই নয় — instance অপেক্ষা করছিল, event check করছিল, তার state বজায় রাখছিল। কিন্তু ব্যবসায়িক দৃষ্টিকোণ থেকে: কিছুই নয়। Service কোনো মূল্য সরবরাহ করছিল না। এটি বিল করছিল।

যে workload বেশিরভাগ সময় সত্যিকারের নিষ্ক্রিয়, তার জন্য একটি always-on EC2 instance এমন একটি apartment-এর ভাড়া দেওয়ার মতো যা আপনি শুধু weekend-এ যান। Apartment-টি আপনার; ভাড়া থামে না।

Freelancer মডেল এটি সম্পূর্ণভাবে সমাধান করে। কোডটি বিদ্যমান। এটি চালানোর কারণ না থাকা পর্যন্ত এটি কেবল চলে না। কোনো নিষ্ক্রিয় খরচ নেই। কোনো reserved capacity নেই। ফোনের পাশে কোনো server অপেক্ষা করছে না।

সেটাই **serverless computing**-এর ভিত্তি।

**AWS Lambda: সার্ভার ছাড়া কোড**

**AWS Lambda** আপনাকে server provision বা পরিচালনা না করেই event-এর প্রতিক্রিয়ায় কোড চালাতে দেয়। আপনি একটি function আপলোড করেন, কী এটিকে trigger করে তা নির্দিষ্ট করেন, এবং trigger fire হলে Lambda এটি চালায়।

একটি Lambda function:

- কোনো persistent state নেই (প্রতিটি invocation স্বাধীন)
- প্রতি invocation-এ সর্বোচ্চ ১৫ মিনিট চলে
- স্বয়ংক্রিয়ভাবে ০ থেকে হাজার হাজার concurrent invocation-এ scale করে
- শুধুমাত্র চলার সময় বিল করা হয় (প্রতি ১ ms execution-এর জন্য, উপরে গোল করা, প্রতি GB বরাদ্দকৃত memory-র জন্য)

যখন কোনো trigger নেই, Lambda-র কোনো খরচ নেই। যখন trigger fire হয়, Lambda চলে এবং চার্জ করে। যখন ১০,০০০ trigger একসাথে fire হয়, Lambda ১০,০০০টি concurrent invocation চালায়। Scaling স্বয়ংক্রিয় এবং প্রায়-তাৎক্ষণিক।

**ইভেন্ট ট্রিগার: কী Lambda-কে জাগায়**

Lambda function নিজে থেকে চলে না — তারা event-এ সাড়া দেয়। সাধারণ trigger-এর মধ্যে রয়েছে:

- **SQS queue**: একটি queue থেকে message process করুন। Lambda queue poll করে এবং message-এর batch সহ function invoke করে।
- **API Gateway**: একটি HTTP request আসে। API Gateway Lambda trigger করে। Lambda একটি response তৈরি করে।
- **S3 event**: একটি file S3-তে আপলোড হয়। Lambda এটি process করে (একটি image resize করুন, একটি CSV parse করুন, একটি document যাচাই করুন)।
- **SNS**: একটি message একটি topic-এ publish হয়। Lambda notified হয়।
- **DynamoDB Streams**: DynamoDB-তে একটি record পরিবর্তন হয়। Lambda পরিবর্তন process করে।
- **CloudWatch Events (EventBridge)**: একটি scheduled event (যেমন একটি cron job) একটি নির্ধারিত সময়ে চলে।
- **ALB**: load balancer-এ একটি HTTP request আসে। Lambda নির্দিষ্ট route handle করতে পারে।

Nimbus-এর জন্য, email service তার SQS queue দ্বারা trigger করা একটি Lambda function-এ পরিণত হল। Queue-তে একটি message আসলে, Lambda message content সহ invoke করা হয়, SES (Simple Email Service)-এর মাধ্যমে email পাঠায় এবং বের হয়।

শূন্য server। শূন্য নিষ্ক্রিয় সময়। নিষ্ক্রিয় থাকলে শূন্য খরচ।

Lambda + SQS-এর pattern আত্মস্থ করার মূল্য আছে: SQS queue, durability, retry logic এবং DLQ handle করে। Lambda processing handle করে। আপনি Lambda-র scale-to-zero economics সহ SQS-এর decoupling benefit পান। কোনো service অন্যের কাজ করে না। তারা পরিষ্কারভাবে compose করে।

"Queue-তে একটি malformed message-এ কী হয়?" Priya জিজ্ঞেস করল। "খারাপ input কি Lambda-কে এমনভাবে crash করতে পারে যা account-এর অন্য function প্রভাবিত করে?"

Lambda invocation একে অপরের থেকে isolated। একটি crashing function অন্য function প্রভাবিত করে না। একটি Lambda যা একটি malformed message-এ একটি unhandled exception throw করে: message queue-তে ফিরে যায়, configured limit পর্যন্ত retry করে, তারপর DLQ-তে সরে যায়। Lambda নিজেই পরবর্তী message-এর জন্য available থাকে। Lambda handler-এর ভিতরে input validation এখনও গুরুত্বপূর্ণ — process করার চেষ্টা করার আগে malformed data ধরতে — কিন্তু একটি single খারাপ message function-কে নামিয়ে ফেলতে পারে না।

**কোল্ড স্টার্ট সমস্যা**

Lambda function **execution environment**-এ চলে — ছোট, isolated container। যখন একটি function invoke করা হয়:

1. AWS check করে একটি warm execution environment available কিনা (একটি যা সম্প্রতি একটি invocation handle করেছে)
2. Warm হলে: function তাৎক্ষণিকভাবে চলে
3. Cold হলে: AWS একটি নতুন execution environment initialize করে — আপনার কোড ডাউনলোড করে, runtime শুরু করে, আপনার initialization কোড চালায় — তারপর function চালায়

একটি **cold start** runtime-এর উপর নির্ভর করে ১০০ms থেকে কয়েক সেকেন্ড latency যোগ করে (Java এবং .NET-এর Python এবং Node.js-এর চেয়ে দীর্ঘ cold start থাকে) এবং আপনার কোড package-এর আকার।

আপনি হয়তো ভাবছেন: Lambda প্রতিবার scratch থেকে শুরু হলে, এটা কি ইতিমধ্যে চলমান একটি server-এর চেয়ে ধীর করে না? হ্যাঁ — কখনো কখনো। এটাই cold start সমস্যা, এবং এটি time-sensitive user-facing API-এর জন্য গুরুত্বপূর্ণ। যেখানে ব্যবহারকারী ইতিমধ্যে তাদের confirmation পেয়েছে এমন background job-এর জন্য এটা মোটেও গুরুত্বপূর্ণ নয়। Background-এ চলা একটি email service-এ একটি ২০০ms cold start যে কারো কাছে অদৃশ্য।

Asynchronous processing-এর জন্য (email পাঠানো, image resizing), cold start ব্যবহারকারীদের কাছে অদৃশ্য।

Synchronous API-এর জন্য (HTTP request যেখানে একজন ব্যবহারকারী একটি response-এর জন্য অপেক্ষা করছে), cold start মাঝে মাঝে ধীর response সৃষ্টি করতে পারে।

**প্রশমন**:

- **Provisioned concurrency**: একটি নির্দিষ্ট সংখ্যক execution environment প্রি-ওয়ার্ম করুন। তারা সবসময় প্রস্তুত। request process না করলেও আপনি এর জন্য পেমেন্ট করেন।
- **ছোট package সাইজ**: ছোট কোড দ্রুত initialize করে।
- **ওয়ার্ম-আপ invocation**: function warm রাখতে scheduled ping (একটি সাধারণ কিন্তু অসুন্দর পদ্ধতি)।
- **সঠিক runtime বেছে নিন**: Python এবং Node.js Java-এর চেয়ে দ্রুত cold start করে।

**একটি বাস্তব Cold Start তদন্ত**

Lambda migration-এর দুই সপ্তাহ পর, Leo একটি রেস্তোরাঁ partner-এর কাছ থেকে একটি Slack message পেল: "Order confirmation কখনো কখনো ৩ সেকেন্ড নেয়। সাধারণত এটা দ্রুত। কী হচ্ছে?"

Leo Lambda function-এর জন্য CloudWatch metric টেনে আনল। "Duration" graph-এ, সে একটি pattern দেখতে পেল: ১৫-২০ মিনিটের বেশি যেকোনো gap-এর পরে প্রথম invocation ২,৮০০-৩,২০০ মিলিসেকেন্ডে spike করত। পরবর্তী invocation: ১৮০-২২০ মিলিসেকেন্ড।

ক্লাসিক cold start।

সে ৩-সেকেন্ডের invocation-গুলির একটির জন্য X-Ray trace টেনে আনল। Timeline এটি স্পষ্টভাবে দেখাল:

- Initialization phase: ২,৬৪০ms (function কোড ডাউনলোড করা, Node.js runtime শুরু করা, module-level initialization কোড চালানো)
- Handler function execution: ২৯০ms

Initialization phase ছিল সমস্যা। সে initialization কোড দেখল। Function একটি বড় SDK import করছিল, একটি database connection initialize করছিল, এবং AWS Secrets Manager থেকে configuration load করছিল — সব startup-এ।

"এই initialization-এর কিছু শুধুমাত্র প্রতি execution environment-এ একবার ঘটতে হবে," Leo বলল। "কিন্তু এটা প্রতিটি cold start-এ ঘটছে।"

সে Lambda কোড restructure করল handler function-এর বাইরে database connection initialize করতে (যাতে এটা warm invocation জুড়ে reuse হয়) এবং অব্যবহৃত SDK module সরিয়ে package আকার কমাল। সে সম্পূর্ণ AWS SDK bundle করার পরিবর্তে শুধুমাত্র তার প্রয়োজনীয় নির্দিষ্ট service import করতে switch করল।

Optimization-এর পরে:

- Cold start duration: ১,১০০ms (এখনও বিদ্যমান, কিন্তু কম তীব্র)
- Warm invocation: ১৬৫ms

১.১-সেকেন্ডের cold start এখনও মাঝে মাঝে ঘটত। Email service-এর জন্য (asynchronous, user-facing delay অদৃশ্য), এটা গ্রহণযোগ্য ছিল। Restaurant notification Lambda-এর জন্য (customer-facing, একটি tablet থেকে order করা), Priya provisioned concurrency-এর জন্য চাপ দিল: দুটি প্রি-ওয়ার্ম environment সবসময় প্রস্তুত।

"এটার মাসে কত খরচ?" Tom জিজ্ঞেস করল।

২৫৬MB-তে দুটি provisioned concurrency environment: মাসে প্রায় $5.40। Latency spike থেমে গেল।

**Lambda মূল্য নির্ধারণ: কেন Tom হাসল**

Lambda মূল্য নির্ধারণের দুটি উপাদান আছে:

1. **Request charge**: প্রতি মিলিয়ন invocation-এ $0.20
2. **Duration charge**: প্রতি GB-second-এ $0.0000166667 (বরাদ্দকৃত memory × সেকেন্ডে চলার সময়)

প্রতি মাসে প্রথম মিলিয়ন request বিনামূল্যে (সবসময়, শুধু প্রথম বছরে নয়)।

"এটার মাসে কত খরচ?" Leo calculator খোলার আগে Tom জিজ্ঞেস করল।

Tom email service-এর জন্য নিজেই হিসাব করল:

- ধরুন প্রতিদিন একটি শুক্রবার — worst case: প্রতিদিন ১,২০০ email × ৩০ দিন = প্রতি মাসে ৩৬,০০০ invocation
- প্রতিটি invocation ২৫৬MB memory-তে ~২ সেকেন্ড নেয়
- Duration: ৩৬,০০০ × ২ × ০.২৫GB × $0.0000166667 = $0.30/মাস
- Request: ৩৬,০০০ << ১,০০০,০০০ (free tier) = $0.00/মাস

"এবং সেই ১৮,০০০ GB-second সবসময়-বিনামূল্যে ৪০০,০০০ GB-second duration-এর মধ্যে ভালোভাবেই আছে," Tom যোগ করল। "তাই প্রকৃত চার্জ শূন্য হবে। কিন্তু আমি ইচ্ছাকৃতভাবে free tier উপেক্ষা করছি — আমি প্রকৃত unit cost জানতে চাই।"

Email service-এর জন্য EC2 instance: $18/মাস।

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo নিজেকে থামাল। সে DLQ configuration শেষ করার আগে email service Lambda production-এ push করেছিল। "আমাকে পাঁচ মিনিট দাও।"

Tom এক মুহূর্ত চুপ রইল। তারপর: "আমাদের এটা সবকিছুর জন্য করা উচিত।"

**Lambda কীসে ভালো (এবং কীসে নয়)**

"দাঁড়াও — কিন্তু তাহলে আমরা কেন সবকিছুর জন্য Lambda ব্যবহার করব না?" Maya জিজ্ঞেস করল। "এটা সস্তা এবং স্বয়ংক্রিয়ভাবে scale করলে, ফাঁদ কী?"

"১৫-মিনিটের সীমা," Leo বলল। "এবং user-facing যেকোনো কিছুর জন্য cold start। এবং statelessness — আপনি invocation-এর মধ্যে memory-তে কিছু রাখতে পারবেন না।"

আপনার workload spiky, event-driven হলে এবং ১৫ মিনিটের মধ্যে সম্পূর্ণ হলে, Lambda একটি always-on EC2 instance-এর একটি ভগ্নাংশ খরচ করবে — কিন্তু আপনার workload একটি long-running data processing job হলে যা ১৫-মিনিটের সীমার কাছাকাছি বা ছাড়িয়ে যায়, Lambda ভুল tool এবং আপনার ECS, Batch, বা একটি EC2-ভিত্তিক পদ্ধতি প্রয়োজন হবে।

Lambda চমৎকার:

- **Event-driven processing**: event-এ সাড়া দেওয়া (file আপলোড, queue message, scheduled task)
- **Short-running task**: processing যা ১৫ মিনিটের মধ্যে ভালোভাবে সম্পূর্ণ হয়
- **Spiky, অপ্রত্যাশিত traffic**: Lambda ০ থেকে হাজার হাজারে তাৎক্ষণিকভাবে scale করে — কোনো প্রি-প্রভিশনিং নেই
- **অনিয়মিত operation**: একটি report যা প্রতিদিন রাত ২টায় চলে। একটি cleanup job যা সাপ্তাহিক চলে।
- **Glue code**: ছোট function যা service-গুলির মধ্যে ডেটা সরায়

আপনি হয়তো ভাবছেন: ১০,০০০ event-এর হঠাৎ একটি burst একসাথে আসলে Lambda-র scaling-এর কী হয়? Lambda-র ডিফল্ট concurrency limit প্রতি account-এ ১,০০০ concurrent execution। ১০,০০০ event একসাথে আসলে, ১,০০০ পর্যন্ত invocation তাৎক্ষণিকভাবে চলে; বাকি SQS queue-তে অপেক্ষা করে (SQS-এর মাধ্যমে trigger হলে) এবং capacity মুক্ত হওয়ার সাথে process হয়। এটা সাধারণত queue-ভিত্তিক processing-এর জন্য ঠিক। Latency-sensitive use case-এর জন্য, Lambda-র burst limit (যে initial হারে নতুন concurrent execution যোগ করা হয়) হঠাৎ spike-এর সময় সংক্ষিপ্ত throttling সৃষ্টি করতে পারে — provisioned concurrency capacity প্রি-allocated রেখে এটা এড়ায়।

Nimbus-এর email service-এর জন্য তাদের current scale-এ, ১,০০০ concurrent invocation তাদের প্রয়োজনের চেয়ে অনেক বেশি ছিল। কিন্তু এটা hit করার আগে জানার মতো সঠিক constraint।

Lambda দুর্বল:

- **Long-running process**: ১৫-মিনিটের সীমা একটি কঠিন দেয়াল
- **Stateful application**: Lambda function design অনুযায়ী stateless — প্রতিটি invocation স্বাধীন
- **High-throughput, low-latency API**: cold start latency spike সৃষ্টি করতে পারে; provisioned concurrency এটি হ্রাস করে কিন্তু খরচ যোগ করে
- **Persistent connection প্রয়োজন এমন application**: Lambda সহজে একটি long-lived database connection pool বজায় রাখতে পারে না (যদিও RDS Proxy-এর মতো connection pooling tool সাহায্য করে)
- **ঐতিহ্যবাহী web server**: সম্ভব, কিন্তু স্বাভাবিক fit নয়

**১৫-মিনিটের দেয়াল: যখন Lambda ভুল Tool**

Migration-এর তিন সপ্তাহ পর, Leo আরও একটি workload Lambda-তে সরানোর চেষ্টা করল: রাতের analytics report generator। এটি database থেকে order data টানত, রেস্তোরাঁ metadata-এর সাথে join করত, পরিসংখ্যান হিসাব করত, এবং একটি PDF তৈরি করত।

প্রথম রাতে, Lambda invocation একটি timeout error সহ ব্যর্থ হল।

"Report generation ১৭ মিনিট নিল," পরের সকালে Leo বলল।

"Lambda-র সর্বোচ্চ ১৫," Priya বলল।

"হ্যাঁ। আমি এখন সেটা জানি।"

সে গড় processing time (৮ মিনিট) check করেছিল এবং ধরে নিয়েছিল Lambda কাজ করবে। সে tail check করেনি — যে রাতে data volume বেশি ছিল এবং query বেশি সময় নিয়েছিল। সেই রাতে, ১৫ মিনিট যথেষ্ট ছিল না।

"তাহলে report কেবল... তৈরি হয় না?" Maya জিজ্ঞেস করল।

"সঠিক। কোনো error notification নেই। কোনো partial report নেই। শুধু নীরবতা।"

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ," Leo বলল।

এটা ছিল Lambda-র অসুন্দরভাবে ব্যর্থ হওয়ার নির্দিষ্ট উপায়গুলির একটি: একটি timeout কোনো output উৎপন্ন করে না, application-এ কোনো error message নেই, শুধু একটি CloudWatch error log। আপনি যদি বিশেষভাবে Lambda timeout error monitor না করেন, আপনি কয়েক দিন লক্ষ্য নাও করতে পারেন।

Fix: report generator-কে ECS Fargate-এ সরান — server পরিচালনা না করে container; পরবর্তী অধ্যায় — যার কোনো time limit নেই। Lambda সেই workload-এর জন্য ভুল tool যা মাঝে মাঝেও ১৫ মিনিট ছাড়িয়ে যেতে পারে। শিক্ষা ছিল না "Lambda খারাপ।" শিক্ষা ছিল "Lambda সেই workload-এর জন্য সঠিক tool যা তার constraint-এর মধ্যে fit করে — এবং যখন তারা করে না তখন আশ্চর্যজনক failure-এর উৎস।"

**RDS Proxy: Lambda-র জন্য Connection Pooling**

Lambda-র stateless প্রকৃতি একটি নির্দিষ্ট database সমস্যা তৈরি করে।

যখন একটি EC2 instance RDS-এ সংযোগ করে, এটি একটি persistent connection pool বজায় রাখে। Application pool থেকে connection reuse করে। RDS, ধরা যাক, ২০০টি একসাথে connection handle করতে পারে।

যখন Lambda ৫০০টি একসাথে invocation handle করে, প্রতিটি invocation তার নিজস্ব database connection খোলার চেষ্টা করে। সেটা ৫০০টি নতুন connection — ২০০ সমর্থন করা একটি database-কে overwhelm করছে।

**Amazon RDS Proxy** Lambda function এবং RDS-এর মধ্যে বসে, একটি persistent connection pool বজায় রাখে এবং তার মাধ্যমে Lambda-র short-lived connection multiplex করে।

এর পরিবর্তে: Lambda invocation → নতুন RDS connection (৫০০টি concurrent invocation-এর প্রতিটির জন্য)

RDS Proxy সহ: Lambda invocation → RDS Proxy → ২০টি persistent RDS connection-এর pool

"Proxy-র RDS credential প্রয়োজন," Priya বলল। "সেগুলি কোথায় থাকে? এটা কি সেগুলি store করে?"

RDS Proxy Secrets Manager-এ credential store করে এবং স্বয়ংক্রিয়ভাবে rotate করে। Lambda function-এর IAM role এটিকে proxy-তে access দেয় (IAM authentication ব্যবহার করে), সরাসরি RDS credential-এ নয়। Credential কখনো Lambda কোডের কাছে প্রকাশিত হয় না।

"তাহলে Lambda function IAM-এর মাধ্যমে authenticate করে," Leo নিশ্চিত করল, "এবং proxy প্রকৃত database credential handle করে।"

Nimbus-এর order processing Lambda-এর জন্য (যেটি order validation-এর জন্য RDS query করছিল), RDS Proxy peak শুক্রবার traffic-এর সময় connection pool exhaustion দূর করল।

**Lambda Layers: শেয়ারড Dependency**

Email service Lambda, notification Lambda, এবং report Lambda সবাই একই internal library কোড শেয়ার করত: currency format করার, input sanitize করার, standard format-এ log করার utility function।

Lambda Layers ছাড়া, সেই shared কোড প্রতিটি function-এর deployment package-এ bundle করতে হত। তিনটি function, একই 2MB library-র তিনটি copy। Library আপডেট হলে, তিনটি function-এরই নতুন deployment প্রয়োজন হত।

**Lambda Layers** হলো পৃথক package যা Lambda function runtime-এ reference করতে পারে। Shared library একটি layer-এ extract করা হল। তিনটি function layer reference করত। Shared library-তে আপডেট মানে layer version আপডেট করা — তিনটি function পুনরায় deploy করা নয়।

অতিরিক্ত সুবিধা: ছোট individual function package মানে দ্রুত cold start।

"Layers যা একটি জিনিস পরিবর্তন করে না: execution role," Priya বলল। "একটি Lambda-র যদি অতি-বিস্তৃত permission থাকে, একটি compromised function account-এর সবকিছু access করতে পারে।"

"EC2 role-এর মতো একই নীতি," Leo বলল। "Least privilege। প্রতিটি Lambda শুধুমাত্র সেই permission পায় যা এটির আসলে প্রয়োজন।"

"তাহলে Lambda EC2-এর প্রতিস্থাপন নয়," Maya বলল। "এটি বিভিন্ন কাজের জন্য একটি ভিন্ন tool।"

"Nimbus web API EC2 বা ECS-এ থাকে," Leo নিশ্চিত করল। "Email service, image resizer, রাতের report generator, log cleaner — সেগুলি Lambda-তে যায়।"

**সার্ভারলেস দর্শন**

Lambda একটি বৃহত্তর ধারণার অংশ: **serverless** — এমন application তৈরি করা যেখানে আপনি কোনো server পরিচালনা করেন না, শুধুমাত্র কোড।

একটি সম্পূর্ণ serverless Nimbus stack এমন দেখতে পারে:

- API Gateway + Lambda (web server সহ EC2-এর পরিবর্তে)
- DynamoDB (RDS-এর পরিবর্তে — এটিও serverless, কোনো server management নেই)
- S3 (static asset — সহজাতভাবে serverless)
- SNS + SQS (messaging — serverless)
- Lambda (সমস্ত background processing)

আকর্ষণ: আপনি কোড লেখেন; AWS বাকি সব পরিচালনা করে। কোনো patching নেই, কোনো scaling configuration নেই, কোনো capacity planning নেই।

## Amazon API Gateway

Lambda trigger তালিকা সংক্ষেপে API Gateway উল্লেখ করেছিল: একটি HTTP request আসে, API Gateway Lambda trigger করে। সেটা সঠিক, কিন্তু API Gateway আসলে কী তা কম মূল্যায়ন করে।

"দাঁড়াও — কিন্তু আমরা কেন Lambda-র সামনে API Gateway রাখব?" Maya জিজ্ঞেস করল। "Lambda কি সরাসরি HTTP request পেতে পারে না?"

Lambda একটি function URL-এর মাধ্যমে HTTP request পেতে পারে — একটি সহজ, সরাসরি HTTPS endpoint। কিন্তু এটি routing, authorization, throttling, caching, বা request transformation handle করে না। একটি production API-এর জন্য, আপনার backend Lambda বা EC2 হোক না কেন সেই concern বিদ্যমান।

**Amazon API Gateway** হলো যেকোনো scale-এ API তৈরি, deploy এবং পরিচালনার জন্য একটি fully managed service। এটি traffic management, authorization, throttling, caching এবং monitoring handle করে যাতে আপনার Lambda function (বা EC2, বা যেকোনো HTTP backend) সেগুলি নিজে implement করতে না হয়।

**তিনটি API type:**

**REST API** হলো সবচেয়ে feature-rich option। এটি request এবং response transformation, response caching, API key-এর সাথে যুক্ত usage plan, এবং সমস্ত authorization type সমর্থন করে। API Gateway উল্লেখ করা বেশিরভাগ SAA-C03 পরীক্ষার প্রশ্ন REST API জড়িত করে।

**HTTP API** সহজ এবং সস্তা — REST API-এর চেয়ে মোটামুটি ৭০% কম খরচ। এটি Lambda backend এবং HTTP proxy-এর জন্য design করা। এটি OIDC এবং OAuth 2.0 authorization সমর্থন করে কিন্তু request transformation বা caching নয়। আপনার REST API-এর advanced feature প্রয়োজন না হলে, HTTP API সঠিক পছন্দ।

**WebSocket API** persistent two-way connection পরিচালনা করে। API Gateway connection lifecycle handle করে এবং message content-এর উপর ভিত্তি করে Lambda-তে message route করে। Lambda function-এর socket state পরিচালনা করার দরকার নেই — API Gateway তা করে।

**Authorization option** (পরীক্ষা যেগুলি test করে):

**Cognito User Pool authorizer** একটি Cognito User Pool থেকে একটি JWT যাচাই করে। কোনো Lambda প্রয়োজন নেই। API Gateway নিজেই token check করে। এটি valid হলে, request pass হয়।

**Lambda authorizer** একটি token যাচাই করতে আপনার নিজস্ব Lambda function চালায় — একটি custom JWT, একটি third-party identity provider থেকে একটি OAuth token, একটি proprietary format-এ একটি API key। Lambda একটি IAM policy return করে। Policy action অনুমোদন করলে, request এগিয়ে যায়।

**API key** হলো একটি request header-এ pass করা একটি সহজ key। API key client দ্বারা rate limiting-এর জন্য, authentication-এর জন্য নয়। সেগুলিকে একটি security mechanism হিসেবে ব্যবহার করবেন না — সেগুলি secret নয়, সেগুলি identifier।

**Throttling এবং usage plan:**

ডিফল্টভাবে, API Gateway account level-এ প্রতি সেকেন্ডে ১০,০০০ request অনুমতি দেয় (একটি soft limit), ৫,০০০-এর burst সহ। এটি ছাড়িয়ে গেলে client একটি `429 Too Many Requests` পায় — আপনার backend এটা কখনো অনুভবও করে না। আপনার per-client limit প্রয়োজন হলে, আপনি একটি usage plan তৈরি করেন: এটি একটি API key-এর সাথে যুক্ত করুন, একটি request rate এবং daily বা monthly quota সেট করুন। একটি client-এর burst অন্য client-এর allocation consume করে না।

রাখার মতো দুটি সংখ্যা: maximum payload হলো **10 MB**, এবং ডিফল্ট integration timeout হলো **29 সেকেন্ড** — আপনার backend বেশি সময় নিলে, gateway হাল ছেড়ে দেয়। (২০২৪ থেকে, একটি quota increase-এর মাধ্যমে Regional এবং private REST API-এর জন্য সেই timeout ২৯ সেকেন্ডের বেশি বাড়ানো যায় — কিন্তু ২৯-সেকেন্ডের ডিফল্ট এখনও পরীক্ষা যা আশা করে।) API Gateway request/response API-এর জন্য, long-running job-এর জন্য নয়; সেগুলির জন্য, কাজটি SQS বা Step Functions-এ হস্তান্তর করুন এবং তাৎক্ষণিকভাবে উত্তর দিন।

"এটার মাসে কত খরচ?" Tom জিজ্ঞেস করল।

REST API-এর জন্য: প্রতি মিলিয়ন API call-এ $3.50, plus প্রতি GB data transfer-এ $0.09। small-to-medium traffic-এর জন্য, এটা মূলত বিনামূল্যে। High-volume API-এর জন্য, HTTP API-এর কম price point অর্থপূর্ণ হয়ে ওঠে।

Leo তার আগে লেখা Lambda trigger তালিকার দিকে নির্দেশ করল। "তাহলে API Gateway কেবল Lambda trigger করার একটি উপায় নয়। এটা সেই জিনিস যা Lambda-কে একটি real API-এর মতো অনুভব করায়।"

"Lambda function business logic handle করে," Priya বলল। "API Gateway এর সামনে সবকিছু handle করে — routing, auth, throttling, monitoring। প্রতিটি একটি জিনিস করে।"

"এবং কেউ যদি API Gateway bypass করে সরাসরি Lambda call করার চেষ্টা করে?"

"Lambda execution policy শুধুমাত্র API Gateway থেকে invocation অনুমতি দেয়," Priya বলল। "Lambda-র resource-based policy বাকি সব কিছু অস্বীকার করে।"

বাস্তবতা: serverless-এর নিজস্ব operational জটিলতা আছে — distributed Lambda function debug করা, cold start পরিচালনা করা, concurrency limit বোঝা। এটা সহজ নয়, শুধু ভিন্ন।

"দাঁড়াও — কিন্তু serverless কেন 'সহজ নয়'?" Maya জিজ্ঞেস করল। "পুরো pitch হলো এটা operational burden সরিয়ে দেয়।"

"এটা কিছু operational burden সরায়," Leo বলল। "Infrastructure provisioning, patching, scaling configuration — সেগুলি চলে যায়। যা বাকি থাকে তা ভিন্ন: cold start management, যে function-এ আপনি SSH করতে পারেন না সেগুলি জুড়ে distributed tracing, concurrency limit, function version এবং alias পরিচালনা করা, Layer আপডেট কীভাবে propagate হয় তা বোঝা, ১৫-মিনিটের timeout সুন্দরভাবে handle করা।"

"তাহলে burden shift হয়," Priya বলল। "Infrastructure operation থেকে function operation-এ।"

"হ্যাঁ। অনেক workload-এর জন্য — বিশেষত event-driven, ছোট, spiky ওগুলির জন্য — সেটা একটি ভালো trade। যে long-running application server-এর সাথে engineer-দের interact এবং debug করতে হয়, তার জন্য EC2 বা container প্রায়ই সঠিক পছন্দ থেকে যায়।"

আপনি হয়তো ভাবছেন: serverless কি ভবিষ্যৎ, এবং সবকিছু কি শেষ পর্যন্ত Lambda-তে সরা উচিত? সৎ উত্তর হলো এটা workload-এর উপর নির্ভর করে। Serverless event-driven processing-এ আধিপত্য করেছে। এটি HTTP API-তে উল্লেখযোগ্য অগ্রগতি করেছে (API Gateway + Lambda-এর মাধ্যমে)। এটি always-on application server, long-running batch processing, বা stateful service প্রতিস্থাপন করেনি — এবং সম্ভবত করবে না, কারণ সেই use case-গুলি Lambda-র মডেল থেকে উপকৃত হয় না। সঠিক tool প্রশ্ন কখনো চলে যায় না; এটা কেবল সময়ের সাথে বিভিন্ন option-এ প্রযোজ্য হয়।

## শক্তি এবং সীমাবদ্ধতা

**Lambda কেন শক্তিশালী**:

- সত্যিকারের pay-per-use — নিষ্ক্রিয় থাকলে শূন্য খরচ
- configuration ছাড়াই স্বয়ংক্রিয় scaling
- কোনো server patch বা maintain করার নেই
- উদার free tier (প্রতি মাসে ১ মিলিয়ন request, চিরকালের জন্য বিনামূল্যে)
- AWS-এর বাকি অংশের সাথে শক্ত integration
- RDS Proxy এবং Lambda Layers architectural পরিবর্তন প্রয়োজন না করে দুটি সবচেয়ে সাধারণ Lambda pain point (connection pooling এবং code sharing) সমাধান করে

**যেখানে জটিল হয়**:

- cold start বাস্তব এবং latency-sensitive workload-এর জন্য সাবধানে handle করা প্রয়োজন
- ১৫-মিনিটের execution limit long-running task বাদ দেয়
- debugging কঠিন — SSH করার জন্য কোনো persistent server নেই
- stateless design-এর জন্য সমস্ত state externalize করা প্রয়োজন (database, cache, S3)
- concurrency limit (ডিফল্ট প্রতি account-এ ১,০০০ concurrent invocation) scale-এ throttle করতে পারে
- VPC-সংযুক্ত Lambda function-এ অতিরিক্ত latency এবং cold start সমস্যা আছে

**SSH ছাড়া Lambda Monitor করা**

প্রথমবার একটি Lambda function-এ কিছু ভেঙে গেলে, Leo-র সহজাত প্রবৃত্তি ছিল SSH করে process দেখা। SSH করার জন্য কোনো process নেই। Lambda-র execution environment ephemeral এবং inaccessible।

Lambda debug করার জন্য একটি ভিন্ন toolkit শেখা প্রয়োজন:

**CloudWatch Logs**: প্রতিটি Lambda invocation তার stdout/stderr একটি CloudWatch Log Group-এ লেখে। Structured logging (JSON format) এগুলিকে filterable করে। সবচেয়ে দরকারী field: function name, invocation ID, duration, error type, এবং আপনার custom correlation ID।

**CloudWatch Metrics**: Lambda স্বয়ংক্রিয়ভাবে Invocations, Duration, Errors, Throttles, এবং ConcurrentExecutions metric publish করে। Errors এবং Throttles-এ alarm সেট করা যেকোনো Lambda deployment-এর প্রথম দিন হওয়া উচিত।

**AWS X-Ray**: Lambda-র জন্য distributed tracing। একটি ছোট overhead যোগ করে (প্রতি invocation ২-৫ms) কিন্তু আপনাকে function-এর ভিতরে সময় কোথায় ব্যয় হয় তার একটি flame graph দেয়। Cold start analysis-এর জন্য অপরিহার্য — X-Ray initialization phase-কে handler phase থেকে আলাদাভাবে দেখায়।

**Lambda Insights**: Lambda-র জন্য enhanced monitoring, CloudWatch Lambda Insights-এর মাধ্যমে উপলব্ধ। standard metric-এ memory usage, CPU time, এবং init duration যোগ করে। সামান্য বেশি খরচ হয় কিন্তু production function-এর জন্য মূল্যবান।

"এবং কেউ যদি execution environment-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "Lambda function isolated container-এ চলে, কিন্তু একটি dependency-তে একটি vulnerability থাকলে, একজন attacker কি আমাদের Lambda-র ভিতরে code execution পেতে পারে?"

প্রশমন: dependency minimal এবং up-to-date রাখুন (cold start analysis ইতিমধ্যে Leo-কে package আকার কমাতে ঠেলে দিয়েছিল), shared library version করতে Lambda Layers ব্যবহার করুন, এবং Lambda execution role-কে সর্বনিম্ন প্রয়োজনীয় permission দিন। Function যদি শুধুমাত্র একটি নির্দিষ্ট S3 bucket-এ লিখতে এবং একটি নির্দিষ্ট DynamoDB table query করতে পারে, একটি compromised function-এর blast radius ঠিক সেটিতে সীমাবদ্ধ।

"Lambda execution role-এর জন্য least privilege ঐচ্ছিক নয়," Priya বলল। "এটা সেই জিনিস যা কিছু ভুল হলে ক্ষতি সীমিত করে।"

সে ঠিক ছিল। এবং বেশিরভাগ security পরামর্শের মতো, এটা কেবল ভালো engineering-ও ছিল।

## সারসংক্ষেপ

অধ্যায় ১৯-এর SQS/SNS architecture কাজ accept করা এবং process করার concern আলাদা করেছিল। Lambda এটিকে আরও এগিয়ে নেয়: এটি কাজ process করা এবং তা করার capacity-র জন্য পেমেন্ট করার concern আলাদা করে।

- **AWS Lambda** server পরিচালনা না করেই event-এর প্রতিক্রিয়ায় কোড চালায়।
- **Pay per use**: প্রতি invocation এবং প্রতি ১ ms execution-এর জন্য (উপরে গোল করা) বিল করা হয়। নিষ্ক্রিয় থাকলে শূন্য খরচ।
- স্বয়ংক্রিয়ভাবে ০ থেকে হাজার হাজার concurrent invocation-এ scale করে।
- **Cold start**: কোনো warm execution environment না থাকলে initialization latency। provisioned concurrency বা lightweight runtime দিয়ে প্রশমিত।
- **Lambda Layers**: shared code package যা একাধিক function reference করতে পারে, duplication এবং package আকার কমায়।
- **RDS Proxy**: Lambda এবং RDS-এর মধ্যে একটি persistent database connection pool বজায় রেখে Lambda-র connection exhaustion সমস্যা সমাধান করে।
- **Monitoring**: CloudWatch Logs, Metrics, X-Ray tracing, এবং Lambda Insights ব্যবহার করুন — SSH করার জন্য কোনো server নেই।
- সর্বোত্তম: event-driven, short-running, spiky, বা অনিয়মিত workload।
- আদর্শ নয়: long-running task (১৫-মিনিটের কঠিন সীমা), stateful application, provisioned concurrency ছাড়া high-throughput low-latency API।
- **Serverless** একটি design দর্শন — আপনি কোড পরিচালনা করেন, অবকাঠামো নয়। Operational জটিলতা shift হয়, অদৃশ্য হয় না।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Resilient Architectures (ডোমেন ২, টাস্ক ২.১)*

- **Lambda + S3**: ক্লাসিক pattern — S3-তে file আপলোড হলে processing-এর জন্য Lambda trigger হয় (thumbnail generation, virus scanning, data transformation)। কোনো server প্রয়োজন নেই।
- **Lambda + SQS**: Lambda SQS poll করে এবং batch process করে। SQS retry/DLQ mechanism প্রদান করে। Lambda processing প্রদান করে।
- **Lambda + API Gateway**: serverless HTTP API। API Gateway routing, auth, throttling handle করে। Lambda business logic handle করে।
- **API Gateway type:** REST API = full feature, request transformation, caching, usage plan। HTTP API = সহজ, সস্তা, শুধুমাত্র OIDC/OAuth। WebSocket API = persistent bidirectional connection। **Authorization:** Cognito authorizer = natively Cognito JWT যাচাই করুন। Lambda authorizer = custom token validation logic। API key = প্রতি client rate limiting (authentication নয়)। পরীক্ষার trigger: "serverless REST API" → API Gateway + Lambda।
- **Cold start সংকেত**: "প্রথম request-এ latency spike," "অসামঞ্জস্যপূর্ণ response time" → cold start। সমাধান: provisioned concurrency (খরচ হয়), ছোট package, হালকা runtime।
- **Execution limit**: সর্বোচ্চ ১৫ মিনিট। সর্বোচ্চ ১০GB memory। ডিফল্টভাবে ৫১২MB /tmp ephemeral storage (১০GB পর্যন্ত configurable)। এই limit পরীক্ষার scenario-তে দেখা যায়।
- **Lambda timeout error নীরব**: একটি Lambda function timeout হলে, এটি একটি CloudWatch error উৎপন্ন করে কিন্তু কোনো application-level error response নেই। CloudWatch Lambda Timeout error স্পষ্টভাবে monitor করুন। এভাবেই Leo-র ১৭-মিনিটের report generator কোনো application-level alarm ছাড়াই প্রথম রাতে ব্যর্থ হয়েছিল।
- **VPC Lambda cold start**: একটি VPC-এর ভিতরে Lambda function-এ অতিরিক্ত cold start latency থাকে (ENI provisioning)। AWS Hyperplane ENI দিয়ে এটি উল্লেখযোগ্যভাবে উন্নত করেছে, কিন্তু VPC Lambda cold start এখনও non-VPC-এর চেয়ে ধীর। VPC resource প্রয়োজন নেই এমন Lambda function-এর জন্য VPC এড়িয়ে চলুন (অর্থাৎ, RDS, ElastiCache, বা অন্য VPC-only resource-এ সংযোগ না করলে)।
- **Lambda concurrency**: ডিফল্ট প্রতি account-এ ১,০০০ concurrent execution (বাড়ানো যায়)। **Reserved concurrency**: একটি function নির্দিষ্ট সংখ্যক execution পায় তা guarantee করুন; অন্য function-গুলিকে সেগুলি consume করতে বাধা দেয়। **Provisioned concurrency**: কয়েকটি execution environment প্রি-ওয়ার্ম করুন।
- **Event source mapping**: Lambda feature যা SQS/DynamoDB Streams/Kinesis-কে Lambda-র সাথে সংযুক্ত করে। Lambda source poll করে এবং record batch করে।
- **Account limit hit করা**: "scale করার সাথে application throttle হচ্ছে / LimitExceeded" → **Service Quotas**-এ limit check করুন এবং সেখানে একটি increase request করুন (অনেক quota, যেমন Lambda concurrency, adjustable; কিছু hard limit)।
- **RDS Proxy**: পরীক্ষার সংকেত: "Lambda function অনেক বেশি database connection সৃষ্টি করছে," "Lambda সহ connection pool exhaustion।" → RDS Proxy persistent connection বজায় রাখে এবং Lambda-র short-lived connection multiplex করে।
- **Lambda Layers**: পরীক্ষার সংকেত: "একাধিক Lambda function জুড়ে code share করুন," "deployment package আকার কমান" → Lambda Layers।
- **Lambda + X-Ray**: Lambda-র জন্য distributed tracing। পরীক্ষার scenario: "একাধিক Lambda function এবং service জুড়ে request trace করুন" → Lambda-তে X-Ray tracing সক্ষম করুন।
- **Lambda Destinations:** asynchronous Lambda invocation-এর জন্য, আপনি success এবং failure উভয় outcome-এর জন্য একটি Destination configure করতে পারেন। সফল ফলাফল SQS, SNS, EventBridge, বা অন্য একটি Lambda function-এ পাঠান। alerting-এর জন্য failure SQS বা SNS-এ পাঠান। এটি async invocation-এর জন্য DLQ-এর preferred বিকল্প কারণ এটি success এবং failure উভয় capture করে, শুধু failure নয়। পরীক্ষার সংকেত: "সফল Lambda ফলাফল অন্য service-এ route করুন" বা "async Lambda থেকে success এবং failure উভয় outcome capture করুন" → Lambda Destinations। "async invocation-এর জন্য শুধুমাত্র ব্যর্থ message capture করুন" → DLQ এখনও valid কিন্তু Destinations আরও সম্পূর্ণ সমাধান।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

Cold start সমস্যা ব্যাখ্যা করুন। কোন ধরনের application-এ cold start সবচেয়ে সমস্যাজনক হবে? কোন ধরনে এগুলি গ্রহণযোগ্য হবে?

*(ইঙ্গিত: একটি real-time API (ব্যবহারকারী একটি response-এর জন্য অপেক্ষা করছে) একটি asynchronous background job-এর (ব্যবহারকারী ইতিমধ্যে তাদের confirmation পেয়েছে এবং অন্য কিছু করছে) সাথে তুলনা করুন।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি কোম্পানি তাদের supplier-দের কাছ থেকে একটি S3 bucket-এর মাধ্যমে পণ্যের ছবি পায়। প্রতিটি ছবিকে চারটি standard dimension-এ (thumbnail, small, medium, large) resize করতে হবে এবং S3-তে ফিরে store করতে হবে। Volume অপ্রত্যাশিত — কিছু দিন ১০টি ছবি, কিছু দিন ১,০০,০০০। প্রতি ছবি processing ১০ মিনিটের মধ্যে সম্পূর্ণ হতে হবে। খরচ minimize করতে হবে।

কোন architecture এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) long polling দিয়ে S3 bucket monitor করা একটি Auto Scaling Group-এ EC2 instance  
B) প্রতি মিনিটে নতুন ছবির জন্য S3 check করা একটি cron job সহ একটি dedicated EC2 instance  
C) একটি SQS queue দ্বারা trigger করা ECS Fargate task, S3 event queue-তে publish করছে  
D) একটি Lambda function trigger করা S3 event notification যা ছবি resize করে এবং ফলাফল S3-তে store করে

**ইঙ্গিত ১**: অপ্রত্যাশিত volume scaling-to-zero-এর পক্ষে। কোন option সেটা করে?

**ইঙ্গিত ২**: প্রতি ছবি ১০ মিনিট Lambda-র ১৫-মিনিটের সীমার মধ্যে। ছবি resizing কাজ Lambda-র constraint-এর মধ্যে fit হয় কিনা check করুন।

**ইঙ্গিত ৩**: ২৪/৭ চলা একটি dedicated EC2 instance ব্যয়বহুল এবং scale করে না।

**উত্তর**: D

**ব্যাখ্যা**: S3 event notification একটি ছবি আপলোড হলে Lambda trigger করে। Lambda ছবিটিকে চারটি dimension-এ resize করে এবং ফলাফল S3-তে store করে। Lambda স্বয়ংক্রিয়ভাবে ০ থেকে হাজার হাজার concurrent invocation-এ scale করে, প্রি-প্রভিশনিং ছাড়াই অপ্রত্যাশিত volume handle করে। কোনো ছবি process না হলে শূন্য খরচ।

**কেন A নয়?** ASG-তে EC2 শূন্যে scale করে না — সর্বদা ন্যূনতম একটি instance চলে। S3-তে long polling একটি native S3 event mechanism নয়। Spiky workload-এর জন্য Lambda-এর চেয়ে বেশি খরচ।

**কেন B নয়?** একটি dedicated EC2 instance একটি single point of failure, scale করে না, ২৪/৭ চলে, এবং একটি cron-ভিত্তিক পদ্ধতিতে ৬০-সেকেন্ড পর্যন্ত detection lag থাকে।

**কেন C নয়?** ECS Fargate কাজ করে, কিন্তু এটি আরও জটিল (container management, ECR, task definition প্রয়োজন) এবং Fargate task startup কয়েক দশ সেকেন্ড থেকে মিনিট নেয় — একটি Lambda cold start-এর চেয়ে অনেক ধীর — যা spiky, event-driven কাজের জন্য এটিকে একটি খারাপ fit করে। এই use case-এর জন্য Lambda সহজ।

*SAA-C03 ডোমেন: Design Resilient Architectures — টাস্ক ২.১*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus প্রতিদিন সকাল ৫টায় আগের দিনের order volume অনুযায়ী শীর্ষ ১০ রেস্তোরাঁ সহ একটি দৈনিক report তৈরি করতে চায়। Report-টি DynamoDB ডেটা থেকে তৈরি, একটি PDF হিসেবে format করা, S3-তে store করা এবং সমস্ত রেস্তোরাঁ partner-কে email করা।

এর জন্য সম্পূর্ণ Lambda-ভিত্তিক pipeline design করুন। কী Lambda trigger করে? PDF generation-এ ১২ মিনিট লাগলে কী হয়? ৫,০০০ রেস্তোরাঁ partner থাকলে এবং তাদের সবাইকে email করতে সময় লাগলে? আপনি কি একটি Lambda ব্যবহার করবেন নাকি একাধিক?

এছাড়াও বিবেচনা করুন: Lambda যদি ৫,০০০-এর মধ্যে ৪,৫০০ রেস্তোরাঁ email process করার পর ১৪ মিনিটে timeout হয় তাহলে কী? Lambda retry হলে আপনি কীভাবে duplicate email পাঠানো এড়াবেন? এই Lambda-র কোন IAM permission প্রয়োজন, এবং সর্বনিম্ন প্রয়োজনীয় set কী?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো Lambda-কে অন্যান্য service-এর সাথে compose করার অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Tom মাসের শেষে বিল পর্যালোচনা করল।

Email service: EC2 বিল থেকে চলে গেছে।
Image resizing job: চলে গেছে।
রাতের cleanup task: চলে গেছে।
দৈনিক analytics report: চলে গেছে। (১৭-মিনিটের timeout incident-এর পর report generator ECS Fargate-এ সরানো হয়েছিল, কিন্তু Lambda compute cost শূন্য ছিল কারণ এটা এখন ভিন্নভাবে orchestrate করা হত।)

মাসের মোট Lambda চার্জ: $5.47।

"পাঁচ ডলার," Tom বলল।

"এবং সাতচল্লিশ সেন্ট," Leo সহায়কভাবে যোগ করল।

Tom আগের মাসের বিল দেখল, যখন সেই service-গুলি সব EC2 instance-এ ছিল।

"আমরা সেই একই workload-এর জন্য $187 দিচ্ছিলাম।"

"Lambda নিষ্ক্রিয় সময়ের জন্য চার্জ করে না," Leo বলল। "এবং সেই service-গুলির বেশিরভাগ ৯০% সময় নিষ্ক্রিয় ছিল।"

Tom আরও একবার CloudWatch graph টেনে আনল। Email service Lambda ৩৬,৪১২ বার invoke হয়েছিল। মোট duration: প্রায় ১৮,২০০ GB-second। প্রতি GB-second-এ $0.0000166667-এ: $0.30 — এবং এমনকি সেটাও notional, যেহেতু ১৮,২০০ GB-second সবসময়-বিনামূল্যে ৪০০,০০০ GB-second duration-এর মধ্যে স্বাচ্ছন্দ্যে বসেছিল। প্রকৃত line item শূন্য ছিল।

"EC2 instance মাসে $18 ছিল," Tom বলল। "আমরা ত্রিশ সেন্ট খরচ করেছি — এবং সেটা আমি free tier উপেক্ষা করছি, যাতে আমরা প্রকৃত unit cost জানি। বিল বলে শূন্য।"

"$5.47-এর বেশিরভাগ ছিল notification Lambda-তে provisioned concurrency — সেটা চলুক বা না চলুক বিল করে। Image resizer, cleanup task, এবং বাকিগুলি free tier-এর মধ্যে fit করে।"

Tom অনেকক্ষণ স্ক্রিনের দিকে তাকিয়ে রইল।

"Serverless একটি hype শব্দ বলে আমি যা যা বলেছিলাম তা ফিরিয়ে নিচ্ছি," সে বলল।

"তুমি কখনো সেটা বলোনি," Leo বলল।

"আমি খুব জোরে ভেবেছিলাম।"

পরবর্তী অধ্যায়ে: সেই shipping container যা যেকোনো server-কে ঘরের মতো অনুভব করায়।
