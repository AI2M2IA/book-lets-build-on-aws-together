# অধ্যায় ৯: টেবিল বড় হলে

মেনু টেবিলে ৫০,০০০ item ছিল।

এটি ২৮৭টি রেস্তোরাঁ জুড়ে ছিল, প্রতিটিতে দৈনিক বিশেষ, মৌসুমী item এবং আঞ্চলিক বৈচিত্র্য। কিছু item-এর modifier ছিল — আকার, মশলার স্তর, প্রোটিনের পছন্দ। কিছুতে combo deal ছিল যা অন্য item-এর reference করত। কিছু শুধু সপ্তাহের দিনে, বা শুধু দুপুরে, বা শুধু নির্দিষ্ট শহরে মেনুতে ছিল।

একটি রেস্তোরাঁর পুরো মেনু retrieve করা SQL query ২০০ মিলিসেকেন্ডে ফিরত।

এখন চার সেকেন্ড লাগছিল।

চার সেকেন্ড কারো অর্ডার দেওয়া এবং অ্যাপ বন্ধ করার মধ্যে পার্থক্য। Leo query plan চালিয়েছিল। Tom index কনফিগারেশন দেখেছিল। Priya read replica সংখ্যা বাড়িয়েছিল। কোনোটিই অর্থবহ পার্থক্য করেনি।

এবং সেটি ঘরের মেজাজ পরিবর্তন করল।

যখন একটি সমস্যা indexing, caching প্রচেষ্টা এবং একটি অতিরিক্ত replica থেকে বেঁচে যায়, মানুষ এটা ধরে নেওয়া বন্ধ করে যে fix টি চালাক হবে।

কখনো কখনো fix হলো সিস্টেমের আকৃতি ভুল।

"সমস্যা," Leo বলল, "ডেটার আকৃতি। SQL সবকিছু row এবং column-এ চায়। আমাদের মেনুর একটি নির্দিষ্ট আকৃতি নেই।"

সেটাই ছিল একটি দীর্ঘ কথোপকথনের শুরু।

**সবকিছু একটি টেবিলে রাখার সমস্যা**

Relational ডেটাবেসের মূল উত্তেজনা এখানে: এগুলি *নির্দিষ্ট* আকৃতিতে *কাঠামোগত* ডেটা সংরক্ষণের জন্য ডিজাইন।

যদি প্রতিটি মেনু item-এর একই field থাকত — নাম, দাম, বিবরণ, ক্যাটাগরি — SQL নিখুঁত হত। আপনার একটি পরিষ্কার `menu_items` টেবিল, প্রতিটি item-এর জন্য row এবং বোধগম্য query থাকত।

কিন্তু বাস্তব মেনু সেভাবে কাজ করে না।

একটি item-এ "spice level" modifier থাকতে পারে। অন্যটিতে "প্রোটিনের পছন্দ" থাকতে পারে। তৃতীয়টিতে nested combo থাকতে পারে — "family meal অর্ডার করুন এবং আপনি দুটি main, দুটি side এবং একটি drink পাবেন।" ডেটার কাঠামো *item প্রতি* পরিবর্তিত হয়।

SQL-এ, আপনার দুটি বিকল্প আছে:

**বিকল্প ১**: প্রতিটি সম্ভাব্য modifier-এর জন্য একটি column তৈরি করুন। এটি একটি খুব চওড়া টেবিল তৈরি করে যেখানে বেশিরভাগ column বেশিরভাগ সময় খালি।

**বিকল্প ২**: একটি পৃথক modifiers টেবিল তৈরি করুন এবং menu items টেবিলে join করুন। এটি কাজ করে, কিন্তু জটিল মেনুর জন্য একাধিক join প্রয়োজন, এবং উচ্চ read volume সহ পঞ্চাশ হাজার item-এ, সেই join ব্যয়বহুল হয়।

"একটি তৃতীয় বিকল্প আছে," Priya বলল, যে কোণে চুপচাপ ডকুমেন্টেশন পড়ছিল।

সে একটি নতুন ট্যাব খুলল। "ডেটা যদি একটি টেবিলে fit করতে না হয় তাহলে কী?"

**ডেটা সম্পর্কে একটি ভিন্ন চিন্তা করার উপায়**

Relational ডেটাবেস টেবিলে row-এ ডেটা সংরক্ষণ করে। প্রতিটি row টেবিলের schema-র সাথে সামঞ্জস্যপূর্ণ হতে হবে। Schema আগে থেকেই সম্মত।

NoSQL ডেটাবেস ডেটা ভিন্নভাবে সংরক্ষণ করে। একটি সাধারণ পদ্ধতি হলো *document model*: প্রতিটি রেকর্ড একটি স্বনির্ভর document হিসেবে সংরক্ষিত (সাধারণত JSON), এবং একই collection-এর document গুলিকে একই field থাকতে হয় না।

একটি document model-এ একটি menu item এভাবে দেখাতে পারে:

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

অন্য একটি item সম্পূর্ণ ভিন্ন দেখাতে পারে:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

ভিন্ন আকৃতি। একই collection। কোনো সমস্যা নেই।

"তাহলে ডেটাবেস একটি টেবিলের চেয়ে একটি ফাইলিং সিস্টেমের মতো," Maya বলল।

"ঠিক," Priya বলল। "আপনি যেকোনো drawer-এ যেকোনো document রাখতে পারেন। আপনাকে document কে একটি নির্দিষ্ট আকারে কাটতে হবে না।"

**DynamoDB-এর সাথে পরিচয়**

Amazon DynamoDB হলো AWS-এর managed NoSQL database service। এটি data item হিসেবে সংরক্ষণ করে (row নয়), এবং item গুলি table-এ সংগ্রহ করা হয় (naming SQL-এর মতো, কিন্তু আচরণ ভিন্ন)।

একটি DynamoDB table-এ প্রতিটি item-এর একটি **primary key** থাকতে হবে যা এটিকে অনন্যভাবে চিহ্নিত করে। বাকি সবকিছু নমনীয়।

Primary key দুটি ফর্মের একটি হতে পারে:

**Partition key only**: একটি একক attribute যা সমস্ত item-এ অনন্য হতে হবে।

**Partition key + sort key (composite primary key)**: দুটি attribute যা *একসাথে* একটি অনন্য সমন্বয় গঠন করে। এটি আপনাকে একই partition key সহ একাধিক item রাখতে দেয়, তাদের sort key দ্বারা পার্থক্য করা।

Nimbus-এর মেনুর জন্য:

- Partition key: `restaurantId`
- Sort key: `itemId`

এর মানে আপনি একটি নির্দিষ্ট রেস্তোরাঁর সমস্ত item দক্ষতার সাথে retrieve করতে পারবেন — DynamoDB ঠিক জানে কোন partition-এ দেখতে হবে।

"এটাকে partition key কেন বলা হয়?" Tom জিজ্ঞেস করল।

**DynamoDB কীভাবে অভ্যন্তরীণভাবে ডেটা সংরক্ষণ করে**

DynamoDB বিশাল আকারে horizontally scale করার জন্য নির্মিত। এটি *partitioning* এর মাধ্যমে এটি অর্জন করে — partition key-এর উপর ভিত্তি করে ডেটা অনেক physical machine-এ বিভক্ত করা হয়।

আপনি একটি item লিখলে, DynamoDB partition key value hash করে এবং সেই hash ব্যবহার করে কোন physical partition (এবং এইভাবে কোন সার্ভার) item সংরক্ষণ করে তা নির্ধারণ করে। আপনি একটি item পড়লে, DynamoDB তাৎক্ষণিকভাবে এটি খুঁজে পেতে একই গণনা করে।

একটি postal system-এর মতো মনে করুন। প্রতিটি envelope-এ zip code থাকলে, postal service প্রতিটি envelope পড়ে কোথায় যাবে তা বের করে না — এটি zip code দ্বারা sort করে। DynamoDB partition key hash দ্বারা sort করে।

এজন্যই একটি ভালো partition key বেছে নেওয়া গুরুত্বপূর্ণ:

- **ভালো**: উচ্চ cardinality, সমানভাবে বিতরণ করা মান (`restaurantId` অনেক রেস্তোরাঁ সহ)
- **খারাপ**: কম cardinality (`true/false`, `category`) — বেশিরভাগ ডেটা কয়েকটি partition-এ পড়ে, "hot spot" তৈরি করে

একটি hot spot মানে একটি partition বেশিরভাগ ট্রাফিক পায়। সেই partition বাধা হয়ে পড়ে। DynamoDB অনুরোধ throttle শুরু করে। ব্যবহারকারীরা error দেখতে শুরু করে।

"তাহলে যদি আমি `available: true` partition key হিসেবে ব্যবহার করতাম," Leo ধীরে ধীরে বলল, "সমস্ত available item একই partition-এ জমা হত।"

"এবং আপনার ডেটাবেস dinner rush-এ গলে যেত," Priya নিশ্চিত করল।

Leo তার ল্যাপটপ ধীরে বন্ধ করল।

**স্কেলে পড়া এবং লেখা**

DynamoDB প্রতি সেকেন্ডে কোটি অনুরোধ সামলাতে পারে। কিন্তু এটি কতটুকু ক্যাপাসিটি প্রভিশন করতে হবে তা জানতে হবে।

দুটি capacity mode আছে:

**Provisioned capacity**: আপনি কতটি read এবং write unit চান তা নির্দিষ্ট করুন। DynamoDB আপনার জন্য সেই ক্যাপাসিটি reserve করে এবং এটি অতিক্রম করা ট্রাফিক throttle করে। পূর্বানুমানযোগ্য খরচ, প্রতি অনুরোধে কম দাম।

**On-demand capacity**: DynamoDB স্বয়ংক্রিয়ভাবে আপনার প্রকৃত ট্রাফিকের সাথে scale করে। কোনো নিয়মিত capacity পরিকল্পনা প্রয়োজন নেই। প্রতি অনুরোধে বেশি খরচ, এবং পরিচালনামূলকভাবে অনেক সহজ, যদিও সাম্প্রতিক ট্রাফিক প্যাটার্নের বাইরে হঠাৎ স্পাইক এখনও throttling ঘটাতে পারে যদি খুব দ্রুত বাড়ে।

Nimbus-এর জন্য, মেনু লেখার চেয়ে অনেক বেশি পড়া হয়। একজন গ্রাহক অ্যাপ খোলে, মেনু browse করে — এটি অনেক read। একজন রেস্তোরাঁ অংশীদার সপ্তাহে দুবার মেনু আপডেট করে — এটি মাঝে মাঝে write।

"On-demand এখনকার জন্য অর্থপূর্ণ," Tom বলল। "আমরা এখনো আমাদের ট্রাফিক প্যাটার্ন জানি না। Throttled হওয়ার চেয়ে প্রতি অনুরোধে বেশি পেমেন্ট করা ভালো।"

অনিচ্ছুক অবকাঠামো জ্ঞান। Tom-এর কাছ থেকে। দল আনুষ্ঠানিকভাবে বেড়েছে।

**Consistency: আপনার ডেটা কতটা তাজা?**

DynamoDB স্বয়ংক্রিয়ভাবে একাধিক Availability Zone জুড়ে ডেটা replicate করে। এটি durability-র জন্য দুর্দান্ত, কিন্তু এর মানে আপনাকে read consistency সম্পর্কে স্পষ্টভাবে ভাবতে হবে।

DynamoDB থেকে read করার সময়, আপনার একটি পছন্দ আছে:

**Eventually consistent read**: এটি ডিফল্ট। এটি সস্তা, এবং ফলাফল সম্প্রতি সম্পন্ন write-এর পেছনে সংক্ষিপ্তভাবে lag করতে পারে।

**Strongly consistent read**: একটি table বা local secondary index-এর বিরুদ্ধে read-এর জন্য, DynamoDB সফল পূর্ববর্তী write থেকে সর্বশেষ commit করা মান return করতে পারে। এটি বেশি read capacity খরচ করে এবং global secondary index-এর জন্য পাওয়া যায় না।

মেনু ডেটার জন্য, eventual consistency ঠিক আছে। একটি মেনু item যা এক মিলিসেকেন্ড পুরানো তা গুরুত্ব দেয় না।

অর্ডার নিশ্চিতকরণ ডেটার জন্য — "এই অর্ডার কি place করা হয়েছে?" — আপনি strong consistency চাইবেন। গ্রাহক একটি "আবার চেষ্টা করুন" বার্তা দেখা উচিত নয় যখন তাদের অর্ডার সবে সেভ হয়েছে।

"এটা অ্যাপে ব্যাংক ব্যালেন্স চেক করা বনাম সরাসরি ব্যাংকে ফোন করার মতো," Maya বলল। "অ্যাপ ত্রিশ সেকেন্ড পিছিয়ে থাকতে পারে। ফোন কল সবসময় বর্তমান।"

**আপোস: DynamoDB যা করতে পারে না**

NoSQL SQL-এর চেয়ে কঠোরভাবে ভালো নয়। এটি একটি ভিন্ন কাজের জন্য একটি ভিন্ন হাতিয়ার।

DynamoDB যা ছাড়ে:

**নমনীয় query**: SQL-এ, আপনি যেকোনো column দ্বারা filter এবং sort করতে পারেন। DynamoDB-এ, আপনি শুধুমাত্র primary key দ্বারা দক্ষতার সাথে query করতে পারেন। Arbitrary field দ্বারা query করার জন্য একটি *scan* প্রয়োজন (table-এ প্রতিটি item পড়া), যা স্কেলে ব্যয়বহুল এবং ধীর।

**Join**: DynamoDB join করে না। আপনার দুটি table থেকে ডেটা প্রয়োজন হলে, আপনি আপনার অ্যাপ্লিকেশন code-এ দুটি পৃথক read করেন।

**Transaction**: DynamoDB transaction সমর্থন করে, কিন্তু relational ডেটাবেস এখনো অনেক multi-entity workflow, reporting-heavy system এবং join-heavy design-এর জন্য আরো স্বাভাবিক fit।

**পরিচিতি**: SQL tooling, দক্ষতা এবং mental model-এর দশক সরাসরি transfer হয় না।

DynamoDB কোথায় দুর্দান্ত:

- Key-value এবং document access pattern
- বিশাল স্কেল (যেকোনো আকারে single-digit millisecond লেটেন্সি)
- Serverless, কোনো অবকাঠামো ব্যবস্থাপনা নেই
- স্বয়ংক্রিয় scaling, multi-AZ replication, ব্যাকআপ
- Data volume নির্বিশেষে পূর্বানুমানযোগ্য পারফরম্যান্স

"তাহলে নিয়মটি হলো," Maya বলল, "DynamoDB ব্যবহার করুন যখন আপনি জানেন *ঠিক* কীভাবে আপনি ডেটা অ্যাক্সেস করবেন। SQL ব্যবহার করুন যখন আপনি এখনো জানেন না।"

Priya মাথা নাড়ল। "প্রথমে আপনার access pattern ডিজাইন করুন। তারপর আপনার ডেটাবেস বেছে নিন।"

এটি একটি ডেটাবেস কথোপকথন যে সবচেয়ে senior জিনিস উৎপন্ন করতে পারে।

**কখন কোনটি ব্যবহার করবেন**

| পরিস্থিতি                                                | পৌঁছান                    |
|----------------------------------------------------------|---------------------------|
| কাঠামোগত ডেটা, জটিল query, reporting                    | RDS (PostgreSQL, MySQL)   |
| নমনীয় ডেটা আকৃতি, key-based access, বিশাল স্কেল        | DynamoDB                  |
| জটিল সম্পর্ক সহ write-heavy                              | RDS                       |
| পূর্বানুমানযোগ্য access pattern সহ read-heavy           | DynamoDB                  |
| Join এবং aggregate প্রয়োজন                              | RDS                       |
| লক্ষ লক্ষ req/sec-এ millisecond লেটেন্সি প্রয়োজন       | DynamoDB                  |
| একাধিক entity জুড়ে transaction                           | RDS (সাধারণত)             |
| Serverless / অপ্রত্যাশিত ট্রাফিক স্পাইক                 | DynamoDB on-demand        |

ভুল উত্তর সবসময় "সর্বদা একটি বা অন্যটি ব্যবহার করুন।" Nimbus শেষ পর্যন্ত উভয় ব্যবহার করল: অর্ডার ইতিহাস এবং আর্থিক রেকর্ডের জন্য RDS (কাঠামোগত, relational, reporting প্রয়োজন), মেনুর জন্য DynamoDB (নমনীয় schema, উচ্চ read volume, রেস্তোরাঁ ID দ্বারা access)।

## শক্তি এবং সীমাবদ্ধতা

**DynamoDB কেন শক্তিশালী**:

- যেকোনো স্কেলে single-digit millisecond লেটেন্সি
- সম্পূর্ণ managed — কোনো patching, কোনো replication সেটআপ, কোনো maintenance window নেই
- স্বয়ংক্রিয় multi-AZ replication (অন্তর্নির্মিত durability)
- On-demand scaling মানে শূন্য capacity পরিকল্পনা
- Lambda, API Gateway, Streams-এর সাথে native integration
- Point-in-time recovery (RDS স্বয়ংক্রিয় ব্যাকআপের মতো)
- DynamoDB Streams — প্রতিটি পরিবর্তন একটি event হিসেবে capture (real-time প্রক্রিয়াকরণের জন্য দরকারী)

**DynamoDB কোথায় জটিল হয়**:

- Access pattern design অলঙ্ঘনীয় — ভুলগুলি unwind করা কষ্টসাধ্য
- জটিল query-র জন্য secondary index প্রয়োজন (খরচ এবং জটিলতা যোগ করে)
- Scan ব্যয়বহুল — production-এ এড়িয়ে চলুন
- "Item size limit" ৪০০KB — বড় item-এর ভিন্ন storage প্রয়োজন
- Read/write unit খরচ না বুঝলে মূল্য অবাক করতে পারে

## সারসংক্ষেপ

- DynamoDB হলো AWS-এর managed NoSQL database service।
- Item গুলি flexible document হিসেবে সংরক্ষিত — কোনো নির্দিষ্ট schema প্রয়োজন নেই।
- প্রতিটি item-এর একটি **primary key** থাকতে হবে: শুধু একটি partition key, বা একটি partition key + sort key।
- Partition key নির্ধারণ করে কোন physical partition item সংরক্ষণ করে। এমনভাবে বেছে নিন যা সমানভাবে বিতরণ করে।
- **On-demand** capacity auto-scale করে; **provisioned** capacity সস্তা যদি আপনার ট্রাফিক পূর্বানুমানযোগ্য।
- **Eventually consistent** read সস্তা এবং দ্রুত। **Strongly consistent** read সবসময় বর্তমান।
- DynamoDB বিশাল স্কেলে key-based access-এ দুর্দান্ত। এটি ad-hoc query এবং join-এ সংগ্রাম করে।
- Relational ডেটার জন্য RDS ব্যবহার করুন। Document/key-value ডেটার জন্য DynamoDB ব্যবহার করুন। পরিস্থিতি দাবি করলে উভয় ব্যবহার করুন।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৩)*

- Partition key নিয়ম জানুন: **উচ্চ cardinality, সমান বিতরণ**। Hot partition একটি সাধারণ পরীক্ষার trap।
- **On-demand বনাম provisioned**: অপ্রত্যাশিত ট্রাফিকের জন্য on-demand; পূর্বানুমানযোগ্য কাজের লোডের জন্য provisioned (Auto Scaling সহ)।
- **DynamoDB Streams**: real-time-এ item-স্তরের পরিবর্তন capture করে। সাধারণ পরীক্ষার দৃশ্যকল্প: "একটি রেকর্ড পরিবর্তন হলে একটি Lambda function trigger করুন।"
- **Global Tables**: বৈশ্বিকভাবে বিতরণ করা অ্যাপ্লিকেশন এবং disaster recovery পরিস্থিতির জন্য multi-Region, multi-active replication। পরীক্ষায়, যখন কাজের লোডের একাধিক Region-এ local read এবং write প্রয়োজন তখন এটি একটি শক্তিশালী সংকেত।
- **DAX (DynamoDB Accelerator)**: DynamoDB-এর জন্য in-memory caching layer। Read লেটেন্সি millisecond থেকে microsecond-এ কমায়। পরীক্ষা এটি ব্যবহার করে যখন RDS read replica সাহায্য করবে না (কারণ এটি DynamoDB-নির্দিষ্ট cache)।
- **Composite primary key**: partition key + sort key একটি partition-এর মধ্যে নমনীয় query অনুমতি দেয়। উদাহরণ: দুটি তারিখের মধ্যে একজন গ্রাহকের সমস্ত অর্ডার retrieve করুন — `customerId` partition key, `orderDate` sort key।
- DynamoDB কখন না ব্যবহার করবেন জানুন: জটিল join, ad-hoc reporting, multi-entity transaction → RDS সাধারণত উত্তর।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

একটি partition key এবং একটি sort key-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। আপনি উভয় কখন ব্যবহার করবেন?

*(ইঙ্গিত: Nimbus মেনু নিয়ে ভাবুন — কেন partition key হিসেবে restaurantId এবং sort key হিসেবে itemId থাকলে একটি রেস্তোরাঁর সম্পূর্ণ মেনু retrieve করা দক্ষ হয়?)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি global gaming company DynamoDB-এ player profile সংরক্ষণ করে। প্রতিটি profile-এ username, level, achievements এবং inventory-র মতো field রয়েছে। কিছু player-এর ১০টি inventory item আছে; অন্যদের ৫,০০০ custom configuration আছে। সক্রিয় gameplay-এর সময় profile lookup-এর জন্য company-র single-digit millisecond read লেটেন্সি প্রয়োজন।

কোন design পদ্ধতি এই প্রয়োজনীয়তা সর্বোত্তমভাবে সমর্থন করে?

A) প্রতিটি region-এ read replica সহ RDS Aurora-তে migrate করুন  
B) `playerId` partition key হিসেবে এবং পুরো profile একটি একক item হিসেবে সংরক্ষণ করে DynamoDB ব্যবহার করুন  
C) একই দক্ষতার player গ্রুপ করতে `level` partition key হিসেবে DynamoDB ব্যবহার করুন  
D) Sub-millisecond লেটেন্সি অর্জন করতে RDS-এর সামনে ElastiCache ব্যবহার করুন

**ইঙ্গিত ১**: Access pattern হলো "ID দ্বারা একটি নির্দিষ্ট player খুঁজুন।" কোন key এটি দক্ষ করে?

**ইঙ্গিত ২**: একটি বিকল্প একটি ভয়াবহ hot partition তৈরি করে। কোন attribute-এর cardinality খুব কম?

**ইঙ্গিত ৩**: DynamoDB ইতিমধ্যে natively single-digit millisecond লেটেন্সি প্রদান করে।

**উত্তর**: B

**ব্যাখ্যা**: `playerId` partition key হিসেবে ব্যবহার করলে partition জুড়ে সমানভাবে ডেটা বিতরণ হয় এবং player ID দ্বারা তাৎক্ষণিক lookup সক্ষম হয় — ঠিক বর্ণিত access pattern। DynamoDB-এর flexible document model schema পরিবর্তন ছাড়াই varying inventory আকার সামলায়।

**কেন A নয়?** RDS Aurora read replica যোগ করে জটিলতা এবং এখনো এই ধরনের key-based profile lookup-এ gaming স্কেলে প্রাকৃতিক প্রথম পছন্দ নয়।

**কেন C নয়?** `level` partition key হিসেবে ব্যবহার করলে মারাত্মক hot partition তৈরি হয় — বেশিরভাগ ট্রাফিক level 1 (নতুন player) বা max level (সক্রিয় veteran)-এ যায়, অন্য partition idle রাখে।

**কেন D নয়?** প্রশ্নটি DynamoDB বর্ণনা করে, RDS নয়। RDS-এর সামনে ElastiCache যোগ করলে দুটি নতুন পরিষেবা আসে যখন DynamoDB একাই সমস্যা সমাধান করে।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৩*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus একটি "favorites" feature যোগ করছে: গ্রাহকরা তাদের পছন্দের মেনু item সেভ করতে এবং এক ক্লিকে পুনরায় অর্ডার করতে পারবেন।

এই feature-এর জন্য DynamoDB table ডিজাইন করুন। Partition key কী হবে? আপনি কি sort key ব্যবহার করবেন? Item structure কেমন দেখাবে?

তারপর বিবেচনা করুন: সমস্ত গ্রাহক জুড়ে "শীর্ষ ১০০ সবচেয়ে-favorited item" দেখাতে হলে কী হবে? DynamoDB কি দক্ষতার সাথে এটির উত্তর দিতে পারে? না পারলে, আর্কিটেকচারে আপনি কী যোগ করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো access pattern-এর জন্য ডিজাইন অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Leo সপ্তাহের শেষে মেনু DynamoDB-তে migrate করেছিল। Read দ্রুত ছিল। Schema নমনীয় ছিল। রেস্তোরাঁ অংশীদাররা যেকোনো modifier field যোগ করতে পারত।

সে নিজের সম্পর্কে ভালো অনুভব করছিল।

তারপর Priya monitoring dashboard দেখল।

"Leo," সে বলল, "প্রতিটি page load ৪৭টি DynamoDB অনুরোধ করছে।"

"রেস্তোরাঁ প্রতি একটি," Leo নিশ্চিত করল। "কারণ গ্রাহক browse-all page-এ।"

"এবং প্রতিটি অনুরোধে প্রায় চার মিলিসেকেন্ড লাগছে।"

Leo গণনা করল। সাতচল্লিশ গুণ চার। "এটা... শুধু মেনুর জন্য একশত আটাশি মিলিসেকেন্ড। Rendering-এর আগে।"

"প্রতিটি page load-এ।"

"প্রতিটি গ্রাহকের জন্য।"

সে স্ক্রিনের দিকে তাকাল।

"আমাদের একটি cache দরকার," সে বলল।

পরবর্তী অধ্যায়ে: Nimbus-এর অ্যাপ্লিকেশন এবং এর ডেটাবেসের মধ্যবর্তী স্তর যা ধীর query দ্রুত করে।
