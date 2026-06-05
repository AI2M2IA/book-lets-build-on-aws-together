# অধ্যায় ১৯: Ticket Machine

Ticket machine একটি শান্ত বিপ্লব ছিল। একটি নম্বর নিন, ডাকা হওয়ার জন্য অপেক্ষা করুন। লাইন একটি queue হয়ে গেল। মানুষ বসতে পারল। Service counter নিজের গতিতে কাজ করল। কেউ কাউকে আটকাল না।

Nimbus-এ এমন একটি সমস্যা ছিল যা অর্ডার জনপ্রিয় হওয়া পর্যন্ত সমস্যার মতো অনুভব করেনি।

প্রতিবার কোনো অর্ডার দেওয়া হলে, API server-কে:

১. Database-এ অর্ডার সেভ করতে হত
২. রেস্তোরাঁর tablet-এ notification পাঠাতে হত
৩. গ্রাহককে confirmation email পাঠাতে হত
৪. রেস্তোরাঁর analytics dashboard আপডেট করতে হত
৫. Billing-এর জন্য event log করতে হত

API গ্রাহকের কাছে সাড়া দেওয়ার আগে synchronously এই সবগুলি ঘটাতে হত। Email service ধীর হলে (কখনো কখনো ছিল), গ্রাহক অপেক্ষা করত। Analytics dashboard ডাউন হলে (কখনো কখনো ছিল), অর্ডার ব্যর্থ হত।

"আমরা tightly coupled," Priya বলল। "কোনো downstream step ব্যর্থ হলে, পুরো অর্ডার ব্যর্থ হয়।"

"যদি আমরা অর্ডার সেভ করে গ্রাহককে তাৎক্ষণিকভাবে confirm করতে পারতাম," Leo বলল, "এবং তারপর বাকিটা background-এ process করতাম?"

"এটাই queue," Priya বলল।

**Deli Counter মডেল**

একটি ব্যস্ত deli counter-এ, register-এর ব্যক্তি পরবর্তী গ্রাহকের কাছে যাওয়ার আগে cutter-এর slice করা শেষ হওয়ার অপেক্ষা করে না। তারা অর্ডার নেয়, রান্নাঘরে পৌঁছে দেয় এবং পরবর্তী ব্যক্তির সেবা শুরু করে। রান্নাঘর নিজের গতিতে অর্ডার process করে।

গ্রাহক দ্রুত সেবা পায়। হঠাৎ burst-এ রান্নাঘর overwhelmed হয় না। রান্নাঘরে একটু ধীর মুহূর্ত হলে, অর্ডার register-এ error করার পরিবর্তে queue-এ জমা হয়।

এটি **decoupling**: কাজ accept করা component-কে কাজ process করা component থেকে আলাদা করা।

Software system-এ, queue প্রায়ই একটি message broker — একটি service যা producer-এর কাছ থেকে message accept করে এবং consumer-এর কাছে deliver করে।

**Amazon SQS: Queue**

**Amazon SQS (Simple Queue Service)** হলো AWS-এর managed message queue service। এটি durably message store করে consumer process করা পর্যন্ত।

Basic flow:

১. **Producer** (API server) queue-এ একটি message রাখে: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
২. API তাৎক্ষণিকভাবে গ্রাহকের কাছে সাড়া দেয়: "Order confirmed!"
৩. **Consumer** (আলাদা worker service) queue থেকে message read করে এবং process করে: restaurant notification পাঠায়, confirmation email পাঠায়, analytics আপডেট করে

গ্রাহকের অভিজ্ঞতা: instant confirmation। Downstream processing: asynchronously, worker-দের গতিতে ঘটে।

**SQS-এর মূল Concept**

**Message visibility timeout**: যখন একটি consumer SQS থেকে একটি message read করে, message অন্য consumer-দের কাছে অদৃশ্য হয়ে যায় একটি period-এর জন্য (ডিফল্ট: ৩০ সেকেন্ড)। এটি consumer-কে process করার সময় দেয়। Consumer সফলভাবে শেষ করলে, message delete করে। Consumer crash করলে, visibility timeout expire হয় এবং message আরেকটি consumer-এর জন্য আবার দৃশ্যমান হয়।

এটি at-least-once delivery নিশ্চিত করে: প্রতিটি message কমপক্ষে একবার process হবে, এমনকি consumer মাঝ-processing-এ ব্যর্থ হলেও।

**Dead-letter queue (DLQ)**: একটি message অনেকবার processing ব্যর্থ হলে (configurable — যেমন ৫ retry), SQS এটি dead-letter queue-এ সরায়। সেগুলি না হারিয়ে কেন message ব্যর্থ হচ্ছে তা বুঝতে DLQ inspect করুন।

**Queue type**:

**Standard queue**: Maximum throughput (প্রতি সেকেন্ডে unlimited message)। Delivery order best-effort (guaranteed নয়)। At-least-once delivery (খুব বিরল ক্ষেত্রে, একটি message দুবার deliver হতে পারে)।

**FIFO queue**: Strict first-in, first-out ordering। Exactly-once delivery। Batching সহ প্রতি সেকেন্ডে ৩,০০০ message সীমিত, ছাড়া ৩০০। Order গুরুত্বপূর্ণ হলে ব্যবহার করুন (financial transaction, sequential state পরিবর্তন)।

Nimbus-এর জন্য, বেশিরভাগ queue standard queue ব্যবহার করল। Billing queue charge order-এ process হওয়ার নিশ্চিত করতে FIFO ব্যবহার করল।

**Amazon SNS: Broadcaster**

**Amazon SNS (Simple Notification Service)** হলো একটি publish/subscribe (pub/sub) message service। এক producer, এক consumer (queue)-এর পরিবর্তে, SNS একটি message *অনেক* subscriber-এর কাছে একসাথে deliver সমর্থন করে।

মডেল:

১. একটি **publisher** একটি SNS **topic**-এ একটি message পাঠায়
২. সেই topic-এর সমস্ত **subscriber** একসাথে message পায় (fan-out)

Subscriber হতে পারে:

- SQS queue (async processing-এর জন্য queue-এ message push করুন)
- Lambda function (সরাসরি function trigger করুন)
- HTTP/HTTPS endpoint (webhook delivery)
- Email address
- SMS (phone number)

Nimbus-এর জন্য, order placed event `order-events` নামক একটি SNS topic-এ published হয়:

- Restaurant notification service subscribe করে (তার SQS queue-এ receive করে)
- Email service subscribe করে (তার SQS queue-এ receive করে)
- Analytics service subscribe করে (তার SQS queue-এ receive করে)
- Billing service subscribe করে (তার FIFO SQS queue-এ receive করে)

একটি order event। চারটি subscriber। সবাই একসাথে notified। প্রতিটি নিজের গতিতে process করে।

"তাহলে SNS হলো announcement," Maya বলল, "এবং SQS হলো inbox যেখানে প্রতিটি team নিজের গতিতে announcement process করে।"

"ঠিক," Leo বলল। "SNS/SQS fan-out হলো standard pattern।"

**SNS/SQS Fan-Out Pattern**

এই সংমিশ্রণ — একাধিক SQS queue-এ feed করা SNS topic — AWS-এর সবচেয়ে গুরুত্বপূর্ণ architectural pattern গুলির একটি:

```
API Server
    |
    | publishes to
    ↓
SNS Topic: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
SQS Queue         SQS Queue         SQS Queue
(notifications)  (email service)   (analytics)
    |                 |                 |
    ↓                 ↓                 ↓
Worker             Worker            Worker
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

প্রতিটি queue independent। Analytics service ধীর হতে পারে — তার queue জমে যায়, কিন্তু notification এবং email service unaffected চালিয়ে যায়। Analytics service ডাউন হলে, তার message ফিরে আসা পর্যন্ত queue-এ অপেক্ষা করে। কিছু হারায় না।

এটি মূল property: **independent failure**। একটি consumer-এ সমস্যা অন্যদের কাছে propagate করে না।

**Message Filtering: প্রতিটি Subscriber-এর জন্য প্রতিটি Message নয়**

System বাড়ার সাথে সাথে, আপনি চান না প্রতিটি subscriber প্রতিটি message process করুক। Analytics service-এর failed payment processing সম্পর্কে message পাওয়া উচিত নয় যদি এটি শুধুমাত্র completed order নিয়ে চিন্তা করে।

**SNS message filtering** subscriber-কে filter policy নির্দিষ্ট করতে দেয় — শুধুমাত্র নির্দিষ্ট attribute match করা message deliver করুন।

Restaurant notification service একটি filter সহ subscribe করে: শুধুমাত্র message যেখানে `status = "confirmed"`।

Error alerting service একটি filter সহ subscribe করে: শুধুমাত্র message যেখানে `status = "failed"`।

প্রতিটি subscriber শুধুমাত্র প্রয়োজনীয় পায়।

**কখন SQS বনাম SNS ব্যবহার করবেন**

**শুধু SQS**: এক producer, এক consumer (বা একই queue-এ একাধিক competing consumer)। Message একবার, order-এ (FIFO) বা না (standard) process করতে হবে। Worker queue pattern — একটি queue, একাধিক worker একটি থেকে consuming।

**শুধু SNS**: Fire-and-forget notification। Email, SMS বা HTTP endpoint-এ push করুন। Message queue করার দরকার নেই — শুধু notify করুন এবং চলুন।

**SNS + SQS (fan-out)**: এক event, একাধিক independent consumer। প্রতিটি consumer-এর নিজস্ব queue আছে, independently process করে এবং independently ব্যর্থ হতে পারে।

## শক্তি এবং সীমাবদ্ধতা

**SQS এবং SNS কেন শক্তিশালী**:

- SQS durable, reliable message delivery প্রদান করে — message একাধিক AZ জুড়ে stored
- Decoupling producer এবং consumer service-এর independent scaling এবং deployment সক্ষম করে
- Dead-letter queue নিশ্চিত করে কোনো message silently হারায় না ব্যর্থতায়
- SNS fan-out pattern producer পরিবর্তন না করে নতুন consumer যোগ করতে দেয়

**যেখানে জটিল হয়**:

- At-least-once delivery মানে consumer *idempotent* হতে হবে — একই message দুবার process করা সমস্যা ঘটানো উচিত নয় (duplicate order, duplicate charge)
- FIFO queue আরো ব্যয়বহুল এবং throughput limit আছে
- একাধিক queue এবং service জুড়ে ব্যর্থ message debug করার জন্য ভালো logging এবং observability প্রয়োজন
- একাধিক service জুড়ে message ordering guarantee সীমিত — strict ordering গুরুত্বপূর্ণ হলে, design জটিল হয়

## সারসংক্ষেপ

- **Decoupling** কাজ produce করা component-কে কাজ process করা component থেকে আলাদা করে।
- **SQS** একটি managed queue। Producer message পাঠায়; consumer asynchronously read এবং process করে।
- **SQS Standard**: high throughput, best-effort ordering, at-least-once delivery।
- **SQS FIFO**: strict ordering, exactly-once delivery, কম throughput।
- **SNS** একটি pub/sub service। একটি message, একসাথে অনেক subscriber।
- **SNS + SQS fan-out**: এক event থেকে একাধিক independent processing pipeline trigger করার standard pattern।
- **Dead-letter queue**: অনেক retry-এর পরে processing ব্যর্থ message ধরে।
- **Idempotency**: duplicate message safely process করার জন্য consumer design করুন।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Resilient Architectures (ডোমেন ২, টাস্ক ২.১)*

- **SQS Standard বনাম FIFO**: Ordering এবং delivery guarantee দ্বারা পরীক্ষা আলাদা করে। "Order-এ process করতে হবে" → FIFO। "Maximum throughput" → Standard।
- **Visibility timeout**: At-least-once delivery-র জন্য মূল concept। Consumer ব্যর্থ হলে, timeout-এর পরে message আবার দৃশ্যমান হয়। পরীক্ষার দৃশ্যকল্প: "message দুবার process হচ্ছে" → visibility timeout অনেক ছোট (consumer process করতে timeout-এর চেয়ে বেশি সময় নেয়)।
- **Dead-letter queue**: N retry-এর পরে ব্যর্থ message এখানে সরানো হয়। পরীক্ষার দৃশ্যকল্প: "processing বারবার ব্যর্থ হলেও কোনো message হারানো নিশ্চিত করুন" → DLQ।
- **SNS fan-out**: এক event একসাথে একাধিক consumer trigger করার classic পরীক্ষার pattern। "Order placed notification email, SMS এবং inventory আপডেট একসাথে trigger করতে হবে" → SQS subscription সহ SNS topic।
- **SQS + Lambda**: Lambda একটি SQS queue poll এবং প্রতিটি message batch-এ trigger করার জন্য configure করা যায়। স্কেলে event-driven processing-এর জন্য পরীক্ষা এটি ব্যবহার করে।
- **SQS long polling**: প্রতি কয়েক সেকেন্ডে consumer polling-এর পরিবর্তে (short polling, API call নষ্ট করে), long polling একটি message-এর জন্য ২০ সেকেন্ড পর্যন্ত অপেক্ষা করে। Cost কমায় এবং false empty response কমায়।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

SNS/SQS fan-out pattern ব্যাখ্যা করুন। Pattern SQS queue ব্যবহার করে HTTP endpoint দিয়ে সরাসরি SNS topic subscribe করার পরিবর্তে কেন?

*(ইঙ্গিত: SNS message publish করার সময় HTTP endpoint গুলির একটি ডাউন থাকলে কী হয় তা নিয়ে ভাবুন।)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি e-commerce platform প্রতি ঘণ্টায় ১০,০০০ অর্ডার process করে। অর্ডার দেওয়া হলে, সিস্টেমকে অবশ্যই: (১) database-এ অর্ডার store করতে হবে, (২) inventory বাদ দিতে হবে, (৩) confirmation email পাঠাতে হবে এবং (৪) analytics dashboard আপডেট করতে হবে। বর্তমানে, সব চারটি step synchronously হয় — analytics service ধীর হলে, গ্রাহক অপেক্ষা করে। দল গ্রাহকের response time উন্নত করতে চায় কোনো অর্ডার না হারিয়ে।

কোন architecture এই প্রয়োজনীয়তা সর্বোত্তমভাবে address করে?

A) সব চারটি step sequence-এ process করতে SQS FIFO queue ব্যবহার করুন  
B) API অর্ডার সেভ করে গ্রাহকের কাছে তাৎক্ষণিকভাবে confirm করুক; একটি SNS topic-এ event publish করুক; inventory, email এবং analytics service SQS queue-এর মাধ্যমে subscribe করুক  
C) প্রতিটি step একসাথে synchronously process করতে parallel EC2 instance ব্যবহার করুন  
D) Order processing speed up করতে request validation সহ API Gateway ব্যবহার করুন

**ইঙ্গিত ১**: গ্রাহক confirmation তাৎক্ষণিক হওয়া উচিত। Response-এর আগে কোন step অবশ্যই ঘটতে হবে, এবং কোনগুলি পরে হতে পারে?

**ইঙ্গিত ২**: Analytics service ধীর হওয়া email বা inventory service প্রভাবিত করা উচিত নয়।

**ইঙ্গিত ৩**: SNS fan-out তিনটি downstream service-কে একসাথে event receive করতে দেয়।

**উত্তর**: B

**ব্যাখ্যা**: API database-এ অর্ডার সেভ করে (synchronous — confirm করার আগে অবশ্যই) এবং তাৎক্ষণিকভাবে confirmation return করে। তারপর এটি SNS topic-এ একটি `order-placed` event publish করে। Inventory, email এবং analytics service প্রতিটি independent SQS queue-এর মাধ্যমে subscribe করে। তারা নিজস্ব গতিতে process করে — analytics ধীর হলে, তার queue বাড়ে কিন্তু অন্য service unaffected। কোনো service ব্যর্থ হলে, তার message SQS queue-এ থাকে এবং retry হয়; configured retry-এর পরে ব্যর্থ হলে DLQ-এ সরানো হয়।

**কেন A নয়?** FIFO queue message sequence-এ process করে — এটি synchronous slowdown সাহায্য করে না। Sequential processing মানে analytics ধীর হওয়া এখনো email block করে।

**কেন C নয়?** "Parallel EC2 instance synchronously process করছে" এখনো সমস্ত step শেষ হওয়ার আগে গ্রাহকের কাছে সাড়া দেওয়া প্রয়োজন। Instance যোগ করা synchronous coupling সমাধান করে না।

**কেন D নয়?** API Gateway API routing এবং validation accelerate করে, কিন্তু downstream processing step decouple করে না।

*SAA-C03 ডোমেন: Design Resilient Architectures — টাস্ক ২.১*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus রেস্তোরাঁ অংশীদারদের জন্য একটি notification system তৈরি করছে। গ্রাহক অর্ডার দিলে, রেস্তোরাঁকে notify করতে হবে:

- তাদের tablet app (push notification)
- একটি kitchen display system (তাদের local hardware-এ HTTP webhook)
- একটি backup SMS (tablet notification ব্যর্থ হলে)

Tablet notification service reliable। Kitchen webhook কখনো কখনো ডাউন থাকে (রেস্তোরাঁ closing time-এ hardware বন্ধ করে)। SMS শুধুমাত্র tablet notification ব্যর্থ হলে fire হওয়া উচিত।

SNS এবং SQS ব্যবহার করে architecture design করুন। "Tablet ব্যর্থ হলেই SMS" requirement কীভাবে handle করবেন? Kitchen webhook offline থাকলে tablet notification block না হওয়া কীভাবে নিশ্চিত করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো conditional routing সহ fan-out design অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

নতুন order flow live ছিল।

গ্রাহকরা অর্ডার দিল। API ৯৫ মিলিসেকেন্ডে সাড়া দিল। Confirmation তাদের ফোনে তাৎক্ষণিকভাবে দেখা গেল।

পেছনে: চারটি service asynchronously process করছে। Analytics service-এ একটি bug ছিল যা নির্দিষ্ট item name-এ special character থাকলে crash করত। তার queue দুই ঘণ্টায় ৩,২০০ message-এ জমে গেল।

গ্রাহকরা কখনো notice করেনি।

Leo bug fix করে analytics service restart করলে, ১৮ মিনিটে backlog process হলো। কোনো ডেটা হারায়নি। DLQ খালি ছিল।

"এটাই decoupling মানে," Priya বলল।

Tom SQS pricing page পড়ছিল। "প্রতি মিলিয়ন request, ০.৪০ ডলার।"

"এটা কি খারাপ?"

"আমাদের current volume-এ, মাসে প্রায় বারো ডলার।" সে স্ক্রিনের দিকে তাকাল। "আমি বেশি আশা করেছিলাম।"

তার সেই দেখা ছিল যে এমন কেউ আবিষ্কার করছে যা unexpectedly সস্তা এবং unexpectedly ভালোও।

পরবর্তী অধ্যায়ে: function যা শুধুমাত্র কেউ knock করলে চলে — এবং কেউ না করলে কিছু খরচ করে না।
