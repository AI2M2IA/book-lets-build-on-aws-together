# অধ্যায় ৯: টেবিল বড় হলে

Nimbus-এর প্রথম রেস্তোরাঁ অংশীদারের রান্নাঘরে সকাল দশটাতেও রসুন আর গরম রুটির গন্ধ পাওয়া যাচ্ছিল। Maya একটি ডেমোর জন্য সেখানে ছিল, দেখছিল একজন রাঁধুনি অ্যাপে একটি substitution লগ করতে swipe করছে — চিংড়ির বদলে মাছ, সাময়িকভাবে শেষ। Swipe-টি হলো। মেনু আপডেট হলো। শহরের অন্য প্রান্তের একজন গ্রাহক কয়েক সেকেন্ডের মধ্যে পরিবর্তনটি দেখল।

সেটা যাদুর মতো অনুভব হয়েছিল।

অফিসে ফিরে, যাদু ধীর হতে শুরু করেছিল।

মেনু টেবিলে ৫০,০০০ item ছিল।

এটি ২৮৭টি রেস্তোরাঁ জুড়ে ছিল — অংশীদারের সংখ্যা load-balancer যুগের সাতচল্লিশ থেকে এক বছরেরও কম সময়ে প্রায় তিনশতে বিস্ফোরিত হয়েছিল — প্রতিটিতে দৈনিক বিশেষ, মৌসুমী item এবং আঞ্চলিক বৈচিত্র্য। কিছু item-এর modifier ছিল — আকার, মশলার স্তর, প্রোটিনের পছন্দ। কিছুতে combo deal ছিল যা অন্য item-এর reference করত। কিছু শুধু সপ্তাহের দিনে, বা শুধু দুপুরে, বা শুধু নির্দিষ্ট শহরে মেনুতে দেখা যেত।

একটি রেস্তোরাঁর পুরো মেনু retrieve করা SQL query আগে ২০০ মিলিসেকেন্ডে ফিরত।

এখন চার সেকেন্ড লাগছিল।

চার সেকেন্ড কারো অর্ডার দেওয়া এবং কারো অ্যাপ বন্ধ করার মধ্যে পার্থক্য। Leo query plan চালিয়েছিল। Tom index কনফিগারেশন দেখেছিল। Priya read replica সংখ্যা বাড়িয়েছিল। কোনোটিই অর্থবহ পার্থক্য করেনি।

এবং সেটি ঘরের মেজাজ পরিবর্তন করল।

---

**প্রথম প্রচেষ্টা: আরো index**

Leo-র query plan খোলা ছিল। সে সাবধানে এর মধ্য দিয়ে গেল।

"সমস্যাটা এই join," সে বলল। "যখন আমরা একটি রেস্তোরাঁর মেনু টানি, আমরা menu_items টেবিল modifiers টেবিলের সাথে join করি, তারপর combos টেবিলের সাথে, তারপর availability_windows টেবিলের সাথে। চারটি টেবিল, তিনটি join, পঞ্চাশ হাজার row।"

সে প্রতিটি টেবিলে `restaurantId`-এর উপর একটি index যোগ করল। সে আবার query চালাল। দুই সেকেন্ড। ভালো, কিন্তু যথেষ্ট ভালো নয়।

Tom query hint সম্পর্কে কিছু পড়েছিল। সে একটি বিকেল ধরে টিউনিং করল। এক দশমিক তিন সেকেন্ড। তবু ভালো নয়।

"যদি আমরা denormalize করি?" Leo জিজ্ঞেস করল। "Modifier গুলিকে menu_items টেবিলেই একটি JSON column-এ একত্রিত করি। কম join।"

তারা এটি চেষ্টা করল। ঠিক এক সেকেন্ড। অগ্রগতির মতো অনুভব হলো। Maya রেস্তোরাঁ অংশীদারদের একটি বার্তা পাঠাল যে তারা গতির সমস্যা ঠিক করেছে। সেটি ছিল একটি মঙ্গলবার।

বৃহস্পতিবারের মধ্যে query আবার ২.৮ সেকেন্ডে ফিরে এল। তাদের ডেটা বেড়েছিল। আরো রেস্তোরাঁ onboard হয়েছিল। প্রতি রেস্তোরাঁয় আরো item। যে query সমাধান হয়েছে বলে মনে হয়েছিল তা সমাধান হয়নি।

"Index পদ্ধতি আজকের ডেটার সাথে তাল মেলাচ্ছে," Priya বলল। "কিন্তু আমরা সপ্তাহে চল্লিশটি রেস্তোরাঁ যোগ করছি। পরের কোয়ার্টারে আমাদের দ্বিগুণ item হবে। তখন query কেমন দেখাবে?"

"কমপক্ষে তিন সেকেন্ড," Leo বলল। "সম্ভবত পাঁচ।"

"তাহলে আমরা নিজেদের কয়েক সপ্তাহ কিনে নিয়েছি।"

"হ্যাঁ।"

তারা সেটি নিয়ে বসে রইল। যে fix-এর মেয়াদ শেষ হয় তা আসলে fix নয়।

---

**দ্বিতীয় প্রচেষ্টা: read replica**

Priya ইতিমধ্যে একবার read replica সংখ্যা বাড়িয়েছিল। সে আবার চেষ্টা করল — এখন দুটি read replica, এবং অ্যাপ্লিকেশন তাদের মধ্যে load-balance করল। তত্ত্বটি সঠিক ছিল: read ট্রাফিক ছড়িয়ে দাও, প্রতিটি replica কম কাজ সামলায়।

এটি সামান্য সাহায্য করল। Peak load ২.৮ সেকেন্ড থেকে ২.২ সেকেন্ডে নামল।

"কারণ bottleneck হলো read-এর সংখ্যা নয়," Tom বলল, ডেটাবেস metrics দেখে। "এটা query নিজেই। আরো replica মানে আরো বেশি সার্ভার একই ধীর query চালাচ্ছে। Query এখনো ধীর।"

"মাসে এর খরচ কত?" সে যোগ করল, কারণ সে সবসময় জিজ্ঞেস করত। "একটি db.r5.large-এ দুটি অতিরিক্ত read replica — মাসে প্রায় ৩৫০ ডলার। দুই সেকেন্ড উন্নতির জন্য।"

Leo replica প্যানেল বন্ধ করল।

"তাহলে আরো হার্ডওয়্যার একটি খারাপ query ঠিক করে না," Maya বলল।

"যখন একটি সমস্যা indexing, caching প্রচেষ্টা এবং অতিরিক্ত replica থেকে বেঁচে যায়," Leo ধীরে বলল, "হয়তো সমস্যাটা কনফিগারেশন নয়। হয়তো এটা সিস্টেমের আকৃতি।"

সেটাই ছিল একটি দীর্ঘ কথোপকথনের শুরু।

---

*গত সপ্তাহে, দল অবশেষে RDS নিয়ন্ত্রণে এনেছিল। Multi-AZ standby, স্বয়ংক্রিয় ব্যাকআপ, reporting query সামলানো একটি read replica। DBA সমস্যা — যা একসময় Leo-কে রাতে জাগিয়ে রাখত — সমাধান হয়েছিল। Managed ডেটাবেস স্তর স্থিতিশীল ছিল। কিন্তু স্থিতিশীল মানে দ্রুত নয়, এবং দ্রুত এখন সমস্যা ছিল। মেনু টেবিল এমন সীমায় আঘাত করতে শুরু করেছিল যা আরো replica ঠিক করতে পারত না। ডেটার আকৃতিটাই ভুল ছিল।*

---

**সবকিছু একটি টেবিলে ঢোকানোর সমস্যা**

Relational ডেটাবেসের মূল উত্তেজনা এখানে: এগুলি *নির্দিষ্ট* আকৃতিতে *কাঠামোগত* ডেটা সংরক্ষণের জন্য ডিজাইন করা হয়েছে।

যদি প্রতিটি মেনু item-এর একই field থাকত — নাম, দাম, বিবরণ, ক্যাটাগরি — SQL নিখুঁত হত। আপনার একটি পরিষ্কার `menu_items` টেবিল, প্রতিটি item-এর জন্য row এবং বোধগম্য query থাকত।

কিন্তু বাস্তব মেনু সেভাবে কাজ করে না।

একটি item-এ "spice level" modifier থাকতে পারে। অন্যটিতে "প্রোটিনের পছন্দ" থাকতে পারে। তৃতীয়টিতে nested combo থাকতে পারে — "family meal অর্ডার করুন এবং আপনি দুটি main, দুটি side এবং একটি drink পাবেন।" ডেটার কাঠামো *item প্রতি* পরিবর্তিত হয়।

SQL-এ, আপনার দুটি বিকল্প আছে:

**বিকল্প ১**: প্রতিটি সম্ভাব্য modifier-এর জন্য একটি column তৈরি করুন। এটি একটি খুব চওড়া টেবিল তৈরি করে যেখানে বেশিরভাগ column বেশিরভাগ সময় খালি থাকে।

**বিকল্প ২**: একটি পৃথক modifiers টেবিল তৈরি করুন এবং menu items টেবিলে join করুন। এটি কাজ করে, কিন্তু জটিল মেনুর জন্য একাধিক join প্রয়োজন, এবং উচ্চ read volume সহ পঞ্চাশ হাজার item-এ, সেই join ব্যয়বহুল হয়ে ওঠে।

"একটি তৃতীয় বিকল্প আছে," বলল Priya, যে কোণে চুপচাপ ডকুমেন্টেশন পড়ছিল।

সে একটি নতুন ট্যাব খুলল। "ডেটা যদি একটি টেবিলে fit করতে না হত তাহলে কী হত?"

**ডেটা সম্পর্কে চিন্তা করার একটি ভিন্ন উপায়**

Relational ডেটাবেস টেবিলে row হিসেবে ডেটা সংরক্ষণ করে। প্রতিটি row টেবিলের schema-র সাথে সামঞ্জস্যপূর্ণ হতে হবে। Schema আগে থেকেই সম্মত হয়।

NoSQL ডেটাবেস ডেটা ভিন্নভাবে সংরক্ষণ করে। একটি সাধারণ পদ্ধতি হলো *document model*: প্রতিটি রেকর্ড একটি স্বনির্ভর document হিসেবে সংরক্ষিত হয় (সাধারণত JSON), এবং একই collection-এর document গুলির একই field থাকতে হয় না।

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

"তাহলে ডেটাবেস একটি টেবিলের চেয়ে একটি ফাইলিং সিস্টেমের মতো," বলল Maya।

"ঠিক," বলল Priya। "আপনি যেকোনো drawer-এ যেকোনো document রাখতে পারেন। আপনাকে document-কে একটি নির্দিষ্ট আকারে কাটতে হবে না।"

**DynamoDB-এর সাথে পরিচয়**

Amazon DynamoDB হলো AWS-এর managed NoSQL database service। এটি ডেটা item হিসেবে সংরক্ষণ করে (row নয়), এবং item গুলি table-এ সংগ্রহ করা হয় (naming SQL-এর মতো, কিন্তু আচরণ ভিন্ন)।

একটি DynamoDB table-এ প্রতিটি item-এর একটি **primary key** থাকতে হবে, যা এটিকে অনন্যভাবে চিহ্নিত করে। বাকি সবকিছু নমনীয়।

Primary key দুটি ফর্মের একটি হতে পারে:

**Partition key only**: একটি একক attribute যা সমস্ত item জুড়ে অনন্য হতে হবে।

**Partition key + sort key (composite primary key)**: দুটি attribute যা *একসাথে* একটি অনন্য সমন্বয় গঠন করে। এটি আপনাকে একই partition key সহ একাধিক item রাখতে দেয়, তাদের sort key দ্বারা পার্থক্য করা হয়।

Nimbus-এর মেনুর জন্য:

- Partition key: `restaurantId`
- Sort key: `itemId`

এর মানে আপনি একটি নির্দিষ্ট রেস্তোরাঁর সমস্ত item দক্ষতার সাথে retrieve করতে পারবেন — DynamoDB ঠিক জানে কোন partition-এ দেখতে হবে।

"এটাকে partition key কেন বলা হয়?" Tom জিজ্ঞেস করল।

"আর কেউ যদি ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "Partition key যদি অনুমানযোগ্য হয়, কেউ কি ইচ্ছাকৃতভাবে একটি partition-এ write দিয়ে spam করে hot-spot অবস্থা তৈরি করতে পারে?"

"হ্যাঁ," Leo বলল। "এটা আসলে খারাপভাবে ডিজাইন করা table-এর জন্য একটি denial-of-service vector। যা high-cardinality key বেছে নেওয়ার আরো একটি কারণ।"

Priya সেটি লিখে নিল।

**DynamoDB কীভাবে অভ্যন্তরীণভাবে ডেটা সংরক্ষণ করে**

DynamoDB বিশাল আকারে horizontally scale করার জন্য নির্মিত। এটি *partitioning* এর মাধ্যমে এটি অর্জন করে — partition key-এর উপর ভিত্তি করে ডেটা অনেক physical machine জুড়ে বিভক্ত করা হয়।

আপনি একটি item লিখলে, DynamoDB partition key value hash করে এবং সেই hash ব্যবহার করে কোন physical partition (এবং এইভাবে কোন সার্ভার) item সংরক্ষণ করে তা নির্ধারণ করে। আপনি একটি item পড়লে, DynamoDB তাৎক্ষণিকভাবে এটি খুঁজে পেতে একই গণনা করে।

একটি postal system-এর মতো মনে করুন। প্রতিটি envelope-এ zip code থাকলে, postal service প্রতিটি envelope পড়ে কোথায় যাবে তা বের করে না — এটি zip code দ্বারা sort করে। DynamoDB partition key hash দ্বারা sort করে।

"দাঁড়াও — কিন্তু আমরা *কেন* এভাবে করব?" Maya জিজ্ঞেস করল। "Partition key-এর পছন্দ কেন এত গুরুত্বপূর্ণ? আমরা কি যেকোনো কিছু বেছে নিতে পারি না?"

এটাই সঠিক প্রশ্ন। Partition key হলো একটি DynamoDB schema-তে সবচেয়ে গুরুত্বপূর্ণ একক design সিদ্ধান্ত। এখানে কেন:

আপনি যদি কম cardinality সহ একটি partition key বেছে নেন — ধরুন, `available: true/false`, বা `category: "main/side/drink"` — আপনার বেশিরভাগ ডেটা একই কয়েকটি partition-এ পড়ে। DynamoDB একে "hot partition" বলে। একটি সার্ভার বেশিরভাগ ট্রাফিক সামলায়। এটি overloaded হয়ে যায়। DynamoDB অনুরোধ throttle করতে শুরু করে। ব্যবহারকারীরা error দেখতে শুরু করে।

- **ভালো**: উচ্চ cardinality, সমানভাবে বিতরণ করা মান (`restaurantId` অনেক রেস্তোরাঁ সহ)
- **খারাপ**: কম cardinality (`true/false`, `category`) — বেশিরভাগ ডেটা কয়েকটি partition-এ পড়ে, "hot spot" তৈরি করে

"তাহলে যদি আমি `available: true` partition key হিসেবে ব্যবহার করতাম," Leo ধীরে ধীরে বলল, "সমস্ত available item একই partition-এ জমা হত।"

"এবং আপনার ডেটাবেস dinner rush-এ গলে যেত," Priya নিশ্চিত করল।

Leo তার ল্যাপটপ ধীরে বন্ধ করল।

---

**Hot Partition ঘটনা**

তাদের এটি কল্পনা করতে হবে না। কয়েক মাস পরে — DynamoDB-তে তাদের দ্বিতীয় মাসে, যখন তারা নিয়মটি সত্যিকার অর্থে আত্মস্থ করেনি — তারা কঠিনভাবে এটি শিখবে।

দল একটি নতুন feature চালু করেছিল: একটি "Featured Items" badge। রেস্তোরাঁ অংশীদাররা পাঁচটি পর্যন্ত item featured হিসেবে চিহ্নিত করতে পারত। Feature-টি প্রতিটি item-এ একটি `featured: true` attribute সংরক্ষণ করত।

Leo ভেবেছিল সমস্ত রেস্তোরাঁ জুড়ে সমস্ত featured item query করা উপকারী হবে — homepage-এ একটি "trending items" widget-এর জন্য। সে এই query সমর্থন করতে একটি secondary index তৈরি করেছিল। Index-টি `featured`-কে এর partition key হিসেবে ব্যবহার করেছিল।

"ঠিক হয়ে যাবে," সে বলেছিল। "কতগুলো featured item-ই বা থাকতে পারে?"

প্রায় বারোশো, দুইশো চল্লিশটি রেস্তোরাঁ জুড়ে ছড়িয়ে।

কিন্তু "trending items" widget প্রতিটি page-এ লোড হত। প্রতিটি page load `featured` index-এর বিরুদ্ধে একটি query trigger করত। সমস্ত বারোশো item দুটি partition-এ থাকত — `true` এবং `false`। `true` partition প্রতিটি আঘাত নিত।

শুক্রবার সন্ধ্যার dinner rush। আট হাজার concurrent ব্যবহারকারী। সবাই homepage লোড করছে।

DynamoDB error rate আঠারো শতাংশে লাফিয়ে উঠল। কিছু ব্যবহারকারী একটি খালি trending widget পেল। কিছু loading spinner পেল। কিছু error পেল যা ordering flow-এ উঠে এল।

Leo metrics টানল। "Index partition throttle হচ্ছে," সে বলল। "আমরা একটি একক partition-এ throughput সীমায় আঘাত করছি।"

"কীভাবে?" Priya জিজ্ঞেস করল।

"`featured` key-এর শুধু দুটি মান আছে। সমস্ত বারোশো featured item একই partition-এ থাকে। প্রতিটি homepage load সেই partition-এ আঘাত করে।"

তারা তিন মিনিটের মধ্যে trending widget অক্ষম করল। Error rate শূন্যে নামল।

"তাহলে একটি দুই-মানের partition key আমাদের শুক্রবার রাতে throttle করল," Tom বলল।

"হ্যাঁ," Leo বলল।

"এটা আমাদের কত খরচ করল?"

"আট হাজার ব্যবহারকারী জুড়ে প্রায় চল্লিশ মিনিটের অবনত অভিজ্ঞতা," Priya বলল। "রাজস্ব প্রভাব, সম্ভবত কয়েকশো অর্ডার।"

Leo একটি ভিন্ন design দিয়ে index প্রতিস্থাপন করল: `featured_items` নামে একটি ডেডিকেটেড DynamoDB table, `restaurantId`-কে partition key হিসেবে, এবং একটি scheduled Lambda — AWS আপনার জন্য চালায় এমন একটি ছোট কোড (অধ্যায় ২০) — যা প্রতি পনেরো মিনিটে মূল table থেকে এটি আপডেট করত। Query টি মূল table-এ একটি hot partition-এর বদলে একটি ছোট, বিচ্ছিন্ন table-এর উপর একটি scan হয়ে গেল।

"প্রথমে আপনার access pattern ডিজাইন করুন," Priya বলল। "তারপর আপনার data model বেছে নিন।"

"আমি জানি," Leo বলল। "আমি এখন জানি।"

---

**স্কেলে পড়া এবং লেখা**

DynamoDB প্রতি সেকেন্ডে লক্ষ লক্ষ অনুরোধ সামলাতে পারে। কিন্তু এটিকে জানতে হবে কতটুকু capacity provision করতে হবে।

দুটি capacity mode আছে:

**Provisioned capacity**: আপনি কতটি read এবং write unit চান তা নির্দিষ্ট করুন। DynamoDB আপনার জন্য সেই capacity reserve করে এবং এটি অতিক্রম করা ট্রাফিক throttle করে। পূর্বানুমানযোগ্য খরচ, প্রতি অনুরোধে কম দাম।

Unit গুলির নির্ভুল সংজ্ঞা আছে, এবং পরীক্ষা আশা করে আপনি সেগুলি জানবেন: একটি **Read Capacity Unit (RCU)** হলো প্রতি সেকেন্ডে ৪ KB পর্যন্ত একটি item-এর একটি strongly consistent read — অথবা একই আকারের দুটি eventually consistent read। একটি **Write Capacity Unit (WCU)** হলো প্রতি সেকেন্ডে ১ KB পর্যন্ত একটি item-এর একটি write। বড় item আনুপাতিকভাবে বেশি খরচ করে: একটি ১২ KB item strongly consistently পড়তে ৩ RCU লাগে; একটি ৩ KB item লিখতে ৩ WCU লাগে।

**On-demand capacity**: DynamoDB স্বয়ংক্রিয়ভাবে আপনার প্রকৃত ট্রাফিকের সাথে scale করে। কোনো নিয়মিত capacity পরিকল্পনা প্রয়োজন নেই। প্রতি অনুরোধে বেশি খরচ, এবং পরিচালনামূলকভাবে অনেক সহজ, যদিও একটি table-এর সাম্প্রতিক ট্রাফিক প্যাটার্নের বহু বাইরে হঠাৎ স্পাইক খুব দ্রুত বাড়লে এখনও throttling ঘটাতে পারে।

Nimbus-এর জন্য, মেনু লেখার চেয়ে অনেক বেশি পড়া হয়। একজন গ্রাহক অ্যাপ খোলে, মেনু browse করে — এটি অনেক read। একজন রেস্তোরাঁ অংশীদার সপ্তাহে দুবার তাদের মেনু আপডেট করে — এটি মাঝে মাঝে write।

"On-demand এখনকার জন্য অর্থপূর্ণ," Tom বলল। "আমরা এখনো আমাদের ট্রাফিক প্যাটার্ন জানি না। Under-provision করে throttled হওয়ার চেয়ে প্রতি অনুরোধে বেশি পেমেন্ট করা ভালো।"

অনিচ্ছুক অবকাঠামো জ্ঞান। Tom-এর কাছ থেকে। দল আনুষ্ঠানিকভাবে বেড়েছে।

"মাসে এর খরচ কত?" Tom জিজ্ঞেস করল, pricing calculator টেনে।

"আমাদের বর্তমান read volume-এ — দিনে প্রায় চল্লিশ হাজার read — on-demand মাসে প্রায় বারো ডলার," Leo বলল। "Provisioned, যদি আমরা ঠিকভাবে tune করি, চারের কাছাকাছি। কিন্তু আমাদের capacity ম্যানুয়ালি সেট করতে হবে এবং ভুল অনুমান করলে throttling-এর ঝুঁকি নিতে হবে।"

Tom দুটি সংখ্যাই লিখে নিল। সে সবসময় সংখ্যা লিখে নিত।

**Consistency: আপনার ডেটা কতটা তাজা?**

DynamoDB স্বয়ংক্রিয়ভাবে একাধিক Availability Zone জুড়ে ডেটা replicate করে। এটি durability-র জন্য দুর্দান্ত, কিন্তু এর মানে আপনাকে read consistency সম্পর্কে স্পষ্টভাবে ভাবতে হবে।

DynamoDB থেকে read করার সময়, আপনার একটি পছন্দ আছে:

**Eventually consistent read**: এটি ডিফল্ট। এটি সস্তা, এবং ফলাফল সম্প্রতি সম্পন্ন একটি write-এর পেছনে সংক্ষিপ্তভাবে lag করতে পারে।

**Strongly consistent read**: একটি table বা local secondary index-এর বিরুদ্ধে read-এর জন্য, DynamoDB সফল পূর্ববর্তী write থেকে সর্বশেষ commit করা মান return করতে পারে। এটি বেশি read capacity খরচ করে এবং global secondary index-এর জন্য পাওয়া যায় না।

মেনু ডেটার জন্য, eventual consistency ঠিক আছে। একটি মেনু item যা এক মিলিসেকেন্ড পুরানো তা কোনো গুরুত্ব রাখে না।

অর্ডার নিশ্চিতকরণ ডেটার জন্য — "এই অর্ডার কি place করা হয়েছে?" — আপনি strong consistency চাইবেন। গ্রাহকের একটি "আবার চেষ্টা করুন" বার্তা দেখা উচিত নয় যখন তাদের অর্ডার সবে সেভ হয়েছে।

"এটা অ্যাপে ব্যাংক ব্যালেন্স চেক করা বনাম সরাসরি ব্যাংকে ফোন করার মধ্যে পার্থক্যের মতো," Maya বলল। "অ্যাপ ত্রিশ সেকেন্ড পিছিয়ে থাকতে পারে। ফোন কল সবসময় বর্তমান।"

আপনি হয়তো ভাবছেন: DynamoDB যদি স্বয়ংক্রিয়ভাবে একাধিক AZ জুড়ে replicate করে, তাহলে consistency mode-এর আদৌ গুরুত্ব কেন? এখানে উত্তর: replication-এ একটি ছোট কিন্তু non-zero সময় লাগে — সাধারণত মিলিসেকেন্ড। একটি eventually consistent read এমন একটি replica থেকে পরিবেশন হতে পারে যা এখনো সর্বশেষ write পায়নি। একটি strongly consistent read সবসময় ডেটার primary কপির সাথে যোগাযোগ করে। বেশিরভাগ use case-এর জন্য (মেনু item, product catalog, user profile) lag অদৃশ্য। যেসব use case-এ read-এর মুহূর্তে correctness গুরুত্বপূর্ণ (payment confirmation, inventory availability), আপনি strong consistency চান।

**Secondary Index: primary key-এর বাইরে query করা**

আপনার যদি primary key যেভাবে অনুমতি দেয় তার চেয়ে ভিন্নভাবে ডেটা access করতে হয় তাহলে কী?

DynamoDB **secondary index** সমর্থন করে — বিকল্প key যা আপনাকে ভিন্ন attribute ব্যবহার করে একই ডেটা query করতে দেয়।

**Local Secondary Index (LSI)**: table-এর মতো একই partition key ব্যবহার করে, কিন্তু একটি ভিন্ন sort key। Table তৈরির সময় সংজ্ঞায়িত করতে হবে এবং পরে যোগ করা যায় না। Table-এর provisioned capacity শেয়ার করে। যেহেতু LSI partition শেয়ার করে, তারা strongly consistent read সমর্থন করে।

**Global Secondary Index (GSI)**: এর নিজস্ব partition key এবং sort key সহ একটি সম্পূর্ণ পৃথক index — table-এর primary key থেকে ভিন্ন। Table থাকার পরে যোগ বা সরানো যায়, যা আপনাকে নমনীয়তা দেয়। Table থেকে পৃথক এর নিজস্ব provisioned capacity সেটিংস আছে।

Nimbus-এর জন্য: তাদের যদি price range দ্বারা item query করতে হয়, একটি GSI সেটি সমর্থন করতে পারে — তবে একটি নিয়ম মাথায় রেখে: একটি partition key শুধুমাত্র *equality* তুলনা গ্রহণ করে, তাই `price` (যার উপর আপনি range করতে চান) অবশ্যই **sort key** হতে হবে, category বা `cuisineType#region`-এর মতো একটি grouping attribute GSI partition key হিসেবে। নিচের walkthrough-এ ঠিক সেই index-ই তৈরি করা হয়েছে।

আপনি যদি একটি LSI বেছে নেন, তাহলে আপনি strong consistency এবং shared capacity পান, কিন্তু আপনি table তৈরির সময় সেই design-এ আটকে যান; আপনি যদি একটি GSI বেছে নেন, তাহলে আপনি পরে এটি যোগ করার নমনীয়তা এবং স্বাধীন scaling পান, কিন্তু আপনি index-এর বিরুদ্ধে strongly consistent read করার ক্ষমতা হারান।

---

**একটি GSI Query Walkthrough**

Priya একটি concrete উদাহরণের মধ্য দিয়ে গেল। Nimbus একটি "browse by cuisine" feature সমর্থন করতে চেয়েছিল: সমস্ত অংশীদার রেস্তোরাঁ জুড়ে একটি নির্দিষ্ট cuisine type-এর সমস্ত available dish দেখানো।

মূল table-এ `restaurantId` partition key হিসেবে এবং `itemId` sort key হিসেবে আছে। আপনি "সমস্ত item যেখানে cuisineType = Colombian" দক্ষতার সাথে query করতে পারবেন না — সেটির জন্য প্রতিটি partition জুড়ে একটি scan প্রয়োজন হবে।

তারা একটি GSI তৈরি করল:

- GSI partition key: `cuisineType#region` (যেমন, "Colombian#NYC", "Mexican#Chicago")
- GSI sort key: `price`

GSI প্রতিটি item-এর একটি projection ডুপ্লিকেট করে — শুধু browse page-এর জন্য প্রয়োজনীয় field গুলি — index storage-এ। এখন `cuisineType#region = "Colombian#NYC"` সহ GSI-এর বিরুদ্ধে একটি query সরাসরি index-এর সেই partition-এ যায়।

"শুধু `cuisineType` একা কেন ব্যবহার করব না?" Leo জিজ্ঞেস করল।

"কারণ cuisineType একা কম cardinality-র," Priya বলল। "Colombian, Mexican, Thai — মোট বিশটি মান। আবার hot partition। region যোগ করলে আমরা Colombian#NYC, Colombian#Chicago, Colombian#LA পাই। আরো partition, ভালো বিতরণ।"

"এটা একটু hacky মনে হয়।"

"এটা একটি standard DynamoDB pattern। একে partition key sharding বলে। কখনো কখনো আপনাকে টুলের সাথে কাজ করতে হয়।"

কোডে GSI query এমন দেখাত:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

এটি New York City-তে $10 থেকে $25-এর মধ্যে দামের সমস্ত Colombian dish, দাম অনুযায়ী sort করা, প্রায় ৪ মিলিসেকেন্ডে return করল।

"এটা পুরানো SQL query-র চেয়ে এক হাজার গুণ দ্রুত," Leo বলল।

"কারণ এটা শুধু একটি index-এর একটি partition স্পর্শ করছে," Priya নিশ্চিত করল। "একটি joined table-এর প্রতিটি row scan করছে না।"

---

**DynamoDB Streams: পরিবর্তনে প্রতিক্রিয়া জানানো**

"একটি মেনু item আপডেট হলে কী হয় তা নিয়ে আমরা ভেবেছি কি?" Priya এক সকালে জিজ্ঞেস করল। "একজন রেস্তোরাঁ অংশীদার একটি দাম পরিবর্তন করে। আমাদের search index আপডেট করতে হবে। আমাদের ElastiCache entry invalidate করতে হবে" — caching পরিষেবা যা আমরা পরের অধ্যায়ে দেখব — "এবং আমাদের analytics pipeline-এর জন্য পরিবর্তনটি log করতে হবে।"

"আমরা API handler-এ এই সব করতে পারি," Leo বলল। "যখন write হয়, সমস্ত downstream আপডেট trigger করি।"

"আর যদি তাদের একটি ব্যর্থ হয়?"

"তাহলে... আমরা retry করি।"

"Write-এর পরে কিন্তু downstream আপডেটের আগে EC2 instance crash করলে কী হবে? ডেটা সেভ হয়েছে, কিন্তু পরিবর্তন সম্পর্কে কেউ জানে না।"

Leo এটি নিয়ে ভাবল।

"আপডেটটি নিশ্চিত হতে হবে," সে বলল। "এমনকি যদি আমাদের অ্যাপ্লিকেশন কোড মাঝপথে ব্যর্থ হয়।"

এটাই **DynamoDB Streams** সমাধান করে।

DynamoDB Streams একটি DynamoDB table-এ প্রতিটি item পরিবর্তনের একটি time-ordered log capture করে। প্রতিটি insert, update এবং delete একটি event হিসেবে stream-এ লেখা হয়। Stream ২৪ ঘণ্টার জন্য event ধরে রাখে।

আপনি stream-এ একটি Lambda function সংযুক্ত করতে পারেন। প্রতিবার একটি item পরিবর্তন হলে, Lambda function item-এর before-and-after state সহ invoke হয়। Lambda তখন করতে পারে:

- একটি search index আপডেট (OpenSearch)
- ElastiCache-এ একটি cache entry invalidate
- অন্য একটি সিস্টেমে একটি notification পাঠানো
- একটি analytics pipeline-এ feed করা
- পরিবর্তনটি অন্য একটি table বা ডেটাবেসে replicate করা

গুরুত্বপূর্ণ পার্থক্য: Streams write-কে downstream effect থেকে decouple করে। DynamoDB write Lambda সফল হোক বা না হোক স্বাধীনভাবে সফল হয়। Lambda ব্যর্থ হলে, DynamoDB এটি retry করে। Write-এর পরে অ্যাপ্লিকেশন crash করলে, stream event তখনো সেখানে থাকে — জিনিসগুলি recover হলে Lambda এটি প্রক্রিয়া করবে।

"তাহলে আমরা DynamoDB-তে লিখি," Leo ধীরে ধীরে বলল, "এবং DynamoDB নিশ্চিত করে যে downstream প্রক্রিয়াকরণ অবশেষে হয়, এমনকি যদি আমরা crash করি।"

"ঠিক," Priya বলল। "এটা আপনার সমস্ত side effect চলবে বলে আশা করা এবং ডেটাবেস সেগুলির গ্যারান্টি দেওয়ার মধ্যে পার্থক্য।"

Nimbus-এর জন্য, তারা মেনু table-এ DynamoDB Streams এমন একটি Lambda-তে wire করল যা মেনু item পরিবর্তন হলে ElastiCache entry invalidate করত। Cache ডেটাবেসের সাথে সামঞ্জস্যপূর্ণ থাকল, স্বয়ংক্রিয়ভাবে, invalidation পরিচালনাকারী কোনো অ্যাপ্লিকেশন কোড ছাড়াই।

"Streams-এর খরচ কত?" Tom জিজ্ঞেস করল।

"আপনি stream থেকে read করার জন্য পেমেন্ট করেন — প্রতিটি Lambda invocation এটি থেকে read করে। আমাদের volume-এ, সম্ভবত মাসে দুই থেকে তিন ডলার।"

Tom আর কোনো প্রশ্ন ছাড়াই এটি অনুমোদন করল। সে শিখেছিল কখন মাসে দুই ডলার মূল্যবান।

**আপোস: DynamoDB যা করতে পারে না**

NoSQL SQL-এর চেয়ে কঠোরভাবে ভালো নয়। এটি একটি ভিন্ন কাজের জন্য একটি ভিন্ন হাতিয়ার।

DynamoDB যা ছেড়ে দেয়:

**নমনীয় query**: SQL-এ, আপনি যেকোনো column দ্বারা filter এবং sort করতে পারেন। DynamoDB-এ, আপনি শুধুমাত্র primary key দ্বারা দক্ষতার সাথে query করতে পারেন। Arbitrary field দ্বারা query করার জন্য একটি *scan* প্রয়োজন (table-এর প্রতিটি item পড়া), যা স্কেলে ব্যয়বহুল এবং ধীর।

**Join**: DynamoDB join করে না। আপনার দুটি table থেকে ডেটা প্রয়োজন হলে, আপনি আপনার অ্যাপ্লিকেশন কোডে দুটি পৃথক read করেন।

**Transaction**: DynamoDB transaction সমর্থন করে, কিন্তু relational ডেটাবেস এখনো অনেক multi-entity workflow, reporting-heavy system এবং join-heavy design-এর জন্য আরো স্বাভাবিক fit।

**পরিচিতি**: SQL tooling, দক্ষতা এবং mental model-এর দশকগুলি সরাসরি transfer হয় না।

DynamoDB কোথায় দুর্দান্ত:

- Key-value এবং document access pattern
- বিশাল স্কেল (যেকোনো আকারে single-digit millisecond লেটেন্সি)
- Serverless, কোনো অবকাঠামো ব্যবস্থাপনা নেই
- স্বয়ংক্রিয় scaling, multi-AZ replication, ব্যাকআপ
- Data volume নির্বিশেষে পূর্বানুমানযোগ্য পারফরম্যান্স

"তাহলে নিয়মটি হলো," বলল Maya, "DynamoDB ব্যবহার করুন যখন আপনি *ঠিক* জানেন কীভাবে আপনি ডেটা অ্যাক্সেস করবেন। SQL ব্যবহার করুন যখন আপনি এখনো জানেন না।"

Priya মাথা নাড়ল। "প্রথমে আপনার access pattern ডিজাইন করুন। তারপর আপনার ডেটাবেস বেছে নিন।"

এটি একটি ডেটাবেস কথোপকথন যা উৎপন্ন করতে পারে এমন সবচেয়ে senior জিনিসগুলির একটি।

---

**কখন DynamoDB ভুল পছন্দ**

Tom, যে financial reporting module নিয়েছিল, একটি প্রশ্ন করল।

"আমরা financial reporting তৈরি করছি," সে বলল। "প্রতি রেস্তোরাঁয় মাসিক রাজস্ব সারাংশ, কর গণনা, invoice ইতিহাস। আমরা কি এটাও DynamoDB-তে রাখতে পারি?"

দল একে অপরের দিকে তাকাল।

"দাঁড়াও — কিন্তু আমরা *কেন* এভাবে করব?" Maya জিজ্ঞেস করল, Priya করার আগে।

Priya হাসল। Maya অভ্যাসটি ধরছিল।

"Query গুলির মধ্য দিয়ে আমাদের নিয়ে চলো," Priya Tom-কে বলল।

সে spec টানল। "আমাদের প্রয়োজন: প্রতি রেস্তোরাঁয় মোট রাজস্ব, সপ্তাহ অনুযায়ী গ্রুপ করা। অর্ডার সংখ্যা অনুযায়ী top-performing item, সমস্ত রেস্তোরাঁ জুড়ে। Cuisine type অনুযায়ী রাজস্বের ভাঙন। শহর অনুযায়ী গড় অর্ডার মূল্য। অংশীদার reporting-এর জন্য year-over-year তুলনা।"

Leo তালিকাটি পড়ল। "এগুলির প্রতিটি একটি aggregation। Sum, group, average, compare।"

"DynamoDB-এর কোনো aggregation function নেই," Priya বলল। "কোনো GROUP BY নেই। কোনো SUM নেই। কোনো AVG নেই। 'এই সপ্তাহে প্রতি রেস্তোরাঁয় মোট রাজস্ব'-এর উত্তর দিতে, আপনাকে সপ্তাহের প্রতিটি অর্ডার scan করতে হবে, সব অ্যাপ্লিকেশন memory-তে টানতে হবে, এবং নিজে গণনা করতে হবে।"

"এটা খারাপ শোনাচ্ছে," Tom বলল।

"আমাদের স্কেলে, এটা প্রতিটি report অনুরোধের জন্য memory-তে টানা হাজার হাজার রেকর্ড। এটা ধীর এবং ব্যয়বহুল হবে। এবং প্রতিবার আমরা একটি নতুন report প্রয়োজনীয়তা যোগ করলে, আমরা নতুন scan-and-compute কোড লিখব।"

"তাহলে আমরা কী ব্যবহার করি?"

"Financial reporting-এর জন্য? RDS। সঠিক index সহ PostgreSQL। আপনি যে query গুলি বর্ণনা করলেন তা ঠিক যার জন্য SQL ডিজাইন করা হয়েছিল। সেগুলি দশ লাইন SQL হবে। সেগুলি দুইশো লাইন DynamoDB scan কোড হবে।"

DynamoDB ভুল যখন:

- আপনি আগে থেকে আপনার access pattern জানেন না (reporting সহজাতভাবে exploratory)
- আপনার বড় dataset জুড়ে aggregation (SUM, GROUP BY, COUNT) প্রয়োজন
- আপনার ডেটার জটিল সম্পর্ক আছে এবং আপনার join প্রয়োজন
- আপনার ad-hoc query নমনীয়তা প্রয়োজন — এমন প্রশ্ন করতে যা আপনি এখনো ভাবেননি
- আপনার ডেটার একটি মৌলিকভাবে relational কাঠামো আছে যা স্বাভাবিকভাবে key-value-তে map করে না

"তাহলে পছন্দটা 'নতুন প্রযুক্তি ভালো' নয়," Maya বলল।

"পছন্দটা হলো 'আপনার ডেটার আকৃতি কী, এবং আপনি কীভাবে এটি access করবেন,'" Priya নিশ্চিত করল। "DynamoDB মেনুর জন্য সত্যিই ভালো। এটা financial report-এর জন্য সত্যিই খারাপ হবে। দুটি বক্তব্য একই সময়ে সত্য।"

Tom PostgreSQL-এ financial reporting তৈরি করল। সে লেখা প্রথম GROUP BY query ৮০ মিলিসেকেন্ডে return করল। তাকে একটি লাইনও scan কোড লিখতে হয়নি।

---

**কখন কোনটি ব্যবহার করবেন**

| পরিস্থিতি                                                | পৌঁছান                    |
|----------------------------------------------------------|---------------------------|
| কাঠামোগত ডেটা, জটিল query, reporting                    | RDS (PostgreSQL, MySQL)   |
| নমনীয় ডেটা আকৃতি, key-based access, বিশাল স্কেল        | DynamoDB                  |
| জটিল সম্পর্ক সহ write-heavy                              | RDS                       |
| পূর্বানুমানযোগ্য access pattern সহ read-heavy           | DynamoDB                  |
| আপনার join এবং aggregate প্রয়োজন                        | RDS                       |
| লক্ষ লক্ষ req/sec-এ millisecond লেটেন্সি প্রয়োজন       | DynamoDB                  |
| একাধিক entity জুড়ে transaction                           | RDS (সাধারণত)             |
| Serverless / অপ্রত্যাশিত ট্রাফিক স্পাইক                 | DynamoDB on-demand        |
| Financial reporting, ad-hoc analytics                    | RDS বা একটি data warehouse |
| Event sourcing, change capture, real-time প্রক্রিয়াকরণ  | DynamoDB + Streams        |

ভুল উত্তর সবসময় "সর্বদা একটি বা অন্যটি ব্যবহার করুন।" Nimbus শেষ পর্যন্ত উভয় ব্যবহার করল: অর্ডার ইতিহাস এবং আর্থিক রেকর্ডের জন্য RDS (কাঠামোগত, relational, reporting প্রয়োজন), মেনুর জন্য DynamoDB (নমনীয় schema, উচ্চ read volume, রেস্তোরাঁ ID দ্বারা access)।

## সঠিক Workload-এর জন্য সঠিক ডেটাবেস

ছয় মাস এগিয়ে যান — DynamoDB migration ভালোভাবে স্থির হওয়ার অনেক পরে — এবং Nimbus-এর বোর্ডে তিনটি নতুন প্রকল্প ছিল। Maya এক মঙ্গলবার সকালে দলকে সেগুলির মধ্য দিয়ে নিয়ে গেল।

"প্রথম: একটি recommendation engine। আমরা গ্রাহকদের এমন dish দেখাতে চাই যা তারা তাদের ইতিহাস এবং একই রুচির মানুষ যা অর্ডার করেছে তার উপর ভিত্তি করে অর্ডার করার সম্ভাবনা আছে। দ্বিতীয়: আমরা মেনু ডেটাকে আরো সমৃদ্ধ content সমর্থন করতে সরাচ্ছি — JSON-এ সম্পূর্ণ মেনু document, প্রতি রেস্তোরাঁয় ভিন্ন কাঠামো, নমনীয় schema। তৃতীয়: আমরা Barato অধিগ্রহণ বন্ধ করতে চলেছি, এবং তাদের data team গ্রাহক আচরণ ডেটার জন্য একটি Cassandra cluster চালায়। তারা তাদের pipeline পুনর্লিখন না করে এটি AWS-এ আনতে চায়।"

তিনটি প্রকল্প। তিনটি খুব ভিন্ন ডেটা প্রয়োজনীয়তা। কোনোটিই স্পষ্ট DynamoDB fit ছিল না।

"এগুলির সবার ভিন্ন ডেটাবেস প্রয়োজন," Priya বলল।

"আমাদের DynamoDB আছে," Leo বলল।

"আমাদের সঠিক টুল বেছে নেওয়ার অধিকার আছে," Priya বলল।

**Amazon DocumentDB: যখন আপনার Workload MongoDB বলে**

দ্বিতীয় প্রকল্প — নমনীয়, প্রতি-রেস্তোরাঁ schema সহ সমৃদ্ধ JSON মেনু document — একটি document database বর্ণনা করেছিল। Nimbus ইতিমধ্যে মেনুর জন্য DynamoDB-এর নমনীয় schema ব্যবহার করছিল, কিন্তু দল যত আরো পরিশীলিত মেনু feature তৈরি করল (nested modifier, time-based pricing, জটিল combo কাঠামো), DynamoDB query model তার সীমা দেখাচ্ছিল। দল আরো সমৃদ্ধ document query চেয়েছিল: সমস্ত মেনু item খুঁজুন যেখানে একটি nested modifier-এ একটি নির্দিষ্ট option আছে, JSON কাঠামোর ভিতরে arbitrary field দ্বারা filter করুন।

"এটা একটা document database pattern," Priya বলল। "MongoDB।"

"আমরা EC2-তে MongoDB চালাতে পারি," Leo প্রস্তাব করল।

"অথবা আমরা DocumentDB ব্যবহার করতে পারি," Priya বলল।

**Amazon DocumentDB** হলো একটি MongoDB-compatible managed document database। এটি নমনীয় schema সহ JSON-এর মতো document হিসেবে ডেটা সংরক্ষণ করে — একই collection-এর ভিন্ন document-এর ভিন্ন field থাকতে পারে। DocumentDB MongoDB-এর query language, API এবং driver সমর্থন করে। আপনার workload যদি বর্তমানে MongoDB-তে চলে, DocumentDB একই ভাষা বলে। Migration path হলো একটি connection string সরানো, একটি অ্যাপ্লিকেশন পুনর্লিখন নয়।

DocumentDB সম্পূর্ণ managed: কোনো patching নেই, স্বয়ংক্রিয় ব্যাকআপ, Multi-AZ high availability, read replica, এবং storage যা আপনার ডেটা বাড়ার সাথে স্বয়ংক্রিয়ভাবে বাড়ে।

"তাহলে আমরা মেনু DocumentDB-তে migrate করি," Leo বলল। "এবং MongoDB syntax-এ আমাদের ইতিমধ্যে থাকা query গুলি ঠিক কাজ করে?"

"সামান্য compatibility testing সহ, হ্যাঁ," Priya নিশ্চিত করল। "DocumentDB MongoDB-এর বেশিরভাগ query API সমর্থন করে। সম্পূর্ণ coverage ধরে নেওয়ার আগে compatibility matrix চেক করুন, কিন্তু document query এবং aggregation-এর জন্য, এটা সরল।"

DocumentDB-এর জন্য পরীক্ষার সংকেত সহজ: **"MongoDB-compatible"** বা **"document store।"** একটি দৃশ্যকল্প যদি MongoDB বা document-oriented ডেটা উল্লেখ করে, DocumentDB হলো managed AWS উত্তর।

**Amazon Neptune: যখন সম্পর্কগুলিই ডেটা**

Recommendation engine একটি কঠিন সমস্যা ছিল।

প্রশ্ন ছিল না "এই গ্রাহক কী অর্ডার করল?" — সেটা ছিল একটি সহজ DynamoDB lookup। প্রশ্ন ছিল: "কোন গ্রাহকদের এই গ্রাহকের অনুরূপ রুচি profile আছে, এবং সেই গ্রাহকরা কোন dish পছন্দ করেছে যা এই গ্রাহক এখনো চেষ্টা করেনি?"

এটা একটা graph সমস্যা। ডেটা model হলো row-এর একটি টেবিল বা document-এর একটি collection নয়। এটা সম্পর্কের একটি network: গ্রাহকরা dish-এর সাথে সংযুক্ত (অর্ডার করা, রেট করা, দেখা), dish রেস্তোরাঁ এবং cuisine type-এর সাথে সংযুক্ত, রেস্তোরাঁ পাড়া এবং শহরের সাথে সংযুক্ত। Recommendation ডেটা পয়েন্টে নেই — এটা তাদের মধ্যবর্তী path-এ।

"আমাদের একটি graph database প্রয়োজন," Priya বলল।

**Amazon Neptune** হলো একটি সম্পূর্ণ managed graph database। এটি দুটি graph model সমর্থন করে: **property graph** (Gremlin traversal language দিয়ে query করা) এবং **RDF** (SPARQL দিয়ে query করা)। আপনি আপনার বিদ্যমান graph stack বা team preference-এর উপর ভিত্তি করে বেছে নেন; উভয়ই একই Neptune অবকাঠামোতে চলে।

Graph database এমন workload-এর জন্য বিশেষভাবে তৈরি যেখানে ডেটা পয়েন্টের মধ্যে সম্পর্ক ডেটা নিজেই যতটা গুরুত্বপূর্ণ ততটাই গুরুত্বপূর্ণ: social network (কে কার সাথে সংযুক্ত), recommendation engine (অনুরূপ ব্যবহারকারীরা কী পছন্দ করেছে), fraud detection (কোন transaction অ্যাকাউন্ট জুড়ে সন্দেহজনক pattern শেয়ার করে), এবং knowledge graph (ধারণাগুলি কীভাবে সম্পর্কিত)।

Nimbus-এর recommendation engine-এর জন্য: গ্রাহক এবং dish Neptune-এ node হয়ে গেল। Order event edge হয়ে গেল। একটি Gremlin traversal একটি একক query-তে খুঁজে পেতে পারত, অনুরূপ order ইতিহাস সহ গ্রাহকরা উচ্চ রেট করা সমস্ত dish, সংযোগের শক্তি অনুযায়ী sort করা — একটি relational ডেটাবেসে প্রয়োজনীয় জটিল JOIN chain বা DynamoDB-তে প্রয়োজনীয় একাধিক round-trip query ছাড়াই।

Neptune-এর জন্য পরীক্ষার সংকেত: **"social network," "recommendation engine," "knowledge graph," "fraud detection,"** বা **"graph traversal।"** একটি দৃশ্যকল্প যদি এমন ডেটা বর্ণনা করে যেখানে সংযোগ ডেটা নিজের মতোই গুরুত্বপূর্ণ, Neptune হলো উত্তর।

**Amazon Keyspaces: Operations ছাড়া Cassandra**

Barato অধিগ্রহণ একটি Cassandra cluster ছবিতে নিয়ে এল। Cassandra হলো একটি wide-column NoSQL database — খুব উচ্চ write throughput এবং horizontal scalability-র জন্য ডিজাইন করা, সাধারণত time-series ডেটা, user activity log এবং IoT telemetry-র জন্য ব্যবহৃত। Barato data team এটি গ্রাহক আচরণ ট্র্যাক করতে ব্যবহার করত: কোন item দেখা হয়েছিল, কোনগুলি cart-এ যোগ করা হয়েছিল, কোনগুলি পরিত্যক্ত হয়েছিল।

Cassandra AWS-এ migrate করার দুটি বিকল্প ছিল: EC2-তে চালানো (cluster, upgrade, scaling পরিচালনার operational overhead) বা managed বিকল্প ব্যবহার করা।

"Amazon Keyspaces," Priya বলল।

**Amazon Keyspaces** হলো একটি serverless, Cassandra-compatible managed database। এটি Cassandra Query Language (CQL) সমর্থন করে — একই query language যা Barato-র pipeline ইতিমধ্যে ব্যবহার করছিল। MongoDB-র জন্য DocumentDB-এর মতো, Keyspaces হলো managed path: অ্যাপ্লিকেশন কোড যেমন আছে রাখুন, এটিকে self-managed cluster-এর বদলে একটি Keyspaces endpoint-এ point করুন, এবং AWS-কে অবকাঠামো সামলাতে দিন।

Keyspaces ট্রাফিকের সাথে স্বয়ংক্রিয়ভাবে scale করে, কোনো capacity পরিকল্পনা প্রয়োজন হয় না, এবং serverless — আপনি প্রকৃতপক্ষে যে read এবং write করেন তার জন্য পেমেন্ট করেন। Barato-র behavior tracking ডেটার জন্য, এটি সঠিক model ছিল: অত্যন্ত পরিবর্তনশীল volume (dinner rush বনাম রাত ৩টা), wide-column schema, উচ্চ write throughput।

পরীক্ষার সংকেত: **"Cassandra-compatible," "wide-column," "CQL,"** বা **"Cassandra workload।"**

**সঠিক ডেটাবেস বেছে নেওয়া: একটি রেফারেন্স টেবিল**

গল্পের এই পর্যায়ে, Nimbus-এর ডেটাবেস ল্যান্ডস্কেপ অধ্যায় সাতের মতো দেখাত না। প্রতিটি workload-এর জন্য সঠিক টুল:

| Trigger Phrase | Database |
|---|---|
| "MongoDB-compatible" বা "document store" | DocumentDB |
| "Graph relationships," "social network," "recommendation engine" | Neptune |
| "Cassandra-compatible" বা "wide-column" | Keyspaces |
| "Key-value at any scale," "single-digit millisecond latency" | DynamoDB |
| "Relational + serverless," "auto-scaling SQL" | Aurora Serverless |
| "Structured data, complex queries, reporting" | RDS (PostgreSQL, MySQL) |

"এটা কি বাড়তেই থাকবে?" Leo জিজ্ঞেস করল, তালিকার দিকে তাকিয়ে।

"হ্যাঁ," Maya বলল। "কারণ ভিন্ন সমস্যার ভিন্ন আকৃতি আছে। এবং ভুল আকৃতি ব্যবহার করলে আপনার performance, developer time, বা উভয়ই খরচ হয়।"

"সঠিক প্রশ্নটা 'আমরা কোন ডেটাবেস ব্যবহার করব' নয়," Priya যোগ করল। "এটা 'আমাদের ডেটার আকৃতি কী, এবং আমরা কীভাবে এটি access করব?' ডেটাবেস উত্তর থেকে অনুসরণ করে।"

এটি দুই বছরে ডেটাবেস সম্পর্কে সে বলা সবচেয়ে গুরুত্বপূর্ণ জিনিস ছিল।

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
- Scan ব্যয়বহুল — production-এ এগুলি এড়িয়ে চলুন
- "Item size limit" ৪০০KB — বড় item-এর ভিন্ন storage প্রয়োজন
- Read/write unit খরচ না বুঝলে মূল্য আপনাকে অবাক করতে পারে
- Hot partition নীরব ঘাতক — throttling শুরু না হওয়া পর্যন্ত কোনো error নেই

## সারসংক্ষেপ

Schema পুনর্গঠনে দুই দিন এবং প্রচুর whiteboard স্থান লেগেছিল। একটি NoSQL ডেটাবেস বেছে নেওয়া শুধু একটি প্রযুক্তিগত সিদ্ধান্ত নয় — এটি আপনি ডেটা সম্পর্কে কীভাবে ভাবেন তা সম্পূর্ণ পরিবর্তন করে। কিন্তু ফলাফল ছিল একটি মেনু টেবিল যা ধীর না হয়ে যেকোনো আকারে বাড়তে পারত। সমান গুরুত্বপূর্ণ: দল শিখেছিল DynamoDB-এর প্রান্তগুলি কোথায়, এবং সমস্যা আকৃতি পরিবর্তন করলে কোন বিশেষায়িত ডেটাবেসের জন্য পৌঁছাতে হবে।

- DynamoDB হলো AWS-এর managed NoSQL database service। Item গুলি নমনীয় document — কোনো নির্দিষ্ট schema নেই। প্রতিটি item-এর একটি **primary key** থাকতে হবে: শুধু একটি partition key, বা একটি partition key + sort key। সমান বিতরণের জন্য partition key বেছে নিন — hot partition throttling ঘটায়।
- **On-demand** capacity auto-scale করে; **provisioned** capacity পূর্বানুমানযোগ্য ট্রাফিকের জন্য সস্তা। **Eventually consistent** read সস্তা; **strongly consistent** read সবসময় বর্তমান কিন্তু GSI-তে অনুপলব্ধ।
- **DynamoDB Streams** real-time-এ item-স্তরের পরিবর্তন capture করে — cache invalidation, search index আপডেট এবং analytics pipeline চালাতে এগুলি ব্যবহার করুন।
- DynamoDB reporting, জটিল join এবং ad-hoc query-র জন্য ভুল পছন্দ — সেগুলির জন্য RDS ব্যবহার করুন।
- **DocumentDB** (MongoDB-compatible), **Neptune** (graph database) এবং **Keyspaces** (Cassandra-compatible) হলো DynamoDB-এর key-value model-এ fit না হওয়া workload-এর জন্য AWS managed বিকল্প।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৩)*

- Partition key নিয়ম জানুন: **উচ্চ cardinality, সমান বিতরণ**। Hot partition একটি সাধারণ পরীক্ষার trap।
- **On-demand বনাম provisioned**: অপ্রত্যাশিত ট্রাফিকের জন্য on-demand; পূর্বানুমানযোগ্য workload-এর জন্য provisioned (Auto Scaling সহ)।
- **DynamoDB Streams**: real-time-এ item-স্তরের পরিবর্তন capture করে। সাধারণ পরীক্ষার দৃশ্যকল্প: "একটি রেকর্ড পরিবর্তন হলে একটি Lambda function trigger করুন।"
- **Global Tables**: বৈশ্বিকভাবে বিতরণ করা অ্যাপ্লিকেশন এবং disaster recovery পরিস্থিতির জন্য multi-Region, multi-active replication। পরীক্ষায়, যখন workload-এর একাধিক Region-এ local read এবং write প্রয়োজন তখন এটি একটি শক্তিশালী সংকেত।
- **DynamoDB TTL (Time to Live)**: item-এ একটি expiration timestamp attribute সেট করুন এবং DynamoDB মেয়াদ শেষ হওয়ার পর স্বয়ংক্রিয়ভাবে সেগুলি মুছে দেয় — **বিনা খরচে**, কোনো write capacity না খেয়ে। পরীক্ষার trigger: "session data/temporary item সর্বনিম্ন খরচে N ঘণ্টা পর স্বয়ংক্রিয়ভাবে সরাতে হবে" → TTL, কখনো একটি scheduled Lambda scan নয়। মেয়াদ শেষ হওয়া item সংরক্ষণাগারের জন্য DynamoDB Streams-এও যেতে পারে।
- **DAX (DynamoDB Accelerator)**: DynamoDB-এর জন্য in-memory caching layer। Read লেটেন্সি millisecond থেকে microsecond-এ কমায়। পরীক্ষা এটি ব্যবহার করে যখন RDS read replica সাহায্য করবে না (কারণ এটি DynamoDB-নির্দিষ্ট cache)।
- **Composite primary key**: partition key + sort key একটি partition-এর মধ্যে নমনীয় query অনুমতি দেয়। উদাহরণ: দুটি তারিখের মধ্যে একজন গ্রাহকের সমস্ত অর্ডার retrieve করুন — `customerId` partition key, `orderDate` sort key।
- **GSI বনাম LSI**: GSI table তৈরির পরে যোগ করা যায়; LSI যায় না। LSI strongly consistent read সমর্থন করে; GSI করে না। LSI table capacity শেয়ার করে; GSI-এর নিজস্ব আছে।
- DynamoDB কখন না ব্যবহার করবেন জানুন: জটিল join, ad-hoc reporting, multi-entity transaction → RDS সাধারণত উত্তর।
- **Purpose-built database selection** — পরীক্ষা প্রায়ই একটি দৃশ্যকল্প উপস্থাপন করে এবং জিজ্ঞেস করে কোন ডেটাবেস fit করে। এটি আপনার দ্রুত রেফারেন্স হিসেবে ব্যবহার করুন: "MongoDB-compatible" → DocumentDB। "Graph/social network/recommendation engine/knowledge graph" → Neptune। "Cassandra-compatible/wide-column" → Keyspaces। "Key-value at any scale/millisecond latency" → DynamoDB। "Relational/complex queries/reporting" → RDS বা Aurora।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

একটি partition key এবং একটি sort key-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। আপনি উভয় কখন ব্যবহার করবেন?

*(ইঙ্গিত: Nimbus মেনু নিয়ে ভাবুন — কেন partition key হিসেবে restaurantId এবং sort key হিসেবে itemId থাকলে একটি রেস্তোরাঁর সম্পূর্ণ মেনু retrieve করা দক্ষ হয়?)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি global gaming company DynamoDB-এ player profile সংরক্ষণ করে। প্রতিটি profile-এ username, level, achievements এবং inventory-র মতো field রয়েছে। কিছু player-এর ১০টি inventory item আছে; অন্যদের কয়েকশো — profile আকৃতিতে পরিবর্তিত হয় কিন্তু প্রতিটি আরামদায়কভাবে DynamoDB-এর 400KB item size সীমার নিচে থাকে। সক্রিয় gameplay-এর সময় profile lookup-এর জন্য company-র single-digit millisecond read লেটেন্সি প্রয়োজন।

কোন design পদ্ধতি এই প্রয়োজনীয়তা সর্বোত্তমভাবে সমর্থন করে?

A) `playerId` partition key হিসেবে এবং পুরো profile একটি একক item হিসেবে সংরক্ষণ করে DynamoDB ব্যবহার করুন  
B) প্রতিটি region-এ read replica সহ RDS Aurora-তে migrate করুন  
C) একই দক্ষতার player গ্রুপ করতে `level` partition key হিসেবে DynamoDB ব্যবহার করুন  
D) Sub-millisecond লেটেন্সি অর্জন করতে RDS-এর সামনে ElastiCache ব্যবহার করুন

**ইঙ্গিত ১**: Access pattern হলো "ID দ্বারা একটি নির্দিষ্ট player খুঁজুন।" কোন key এটি দক্ষ করে?

**ইঙ্গিত ২**: একটি বিকল্প একটি ভয়াবহ hot partition তৈরি করে। কোন attribute-এর cardinality খুব কম?

**ইঙ্গিত ৩**: DynamoDB ইতিমধ্যে natively single-digit millisecond লেটেন্সি প্রদান করে।

**উত্তর**: A

**ব্যাখ্যা**: `playerId` partition key হিসেবে ব্যবহার করলে partition জুড়ে সমানভাবে ডেটা বিতরণ হয় এবং player ID দ্বারা তাৎক্ষণিক lookup সক্ষম হয় — ঠিক বর্ণিত access pattern। DynamoDB-এর flexible document model schema পরিবর্তন ছাড়াই varying inventory আকার সামলায়।

**কেন B নয়?** RDS Aurora read replica সহ জটিলতা যোগ করে এবং এখনো এই ধরনের key-based profile lookup-এ gaming স্কেলে প্রাকৃতিক প্রথম পছন্দ নয়।

**কেন C নয়?** `level` partition key হিসেবে ব্যবহার করলে মারাত্মক hot partition তৈরি হয় — বেশিরভাগ ট্রাফিক level 1 (নতুন player) বা max level (সক্রিয় veteran)-এ যায়, অন্য partition idle রাখে।

**কেন D নয়?** প্রশ্নটি DynamoDB বর্ণনা করে, RDS নয়। RDS-এর সামনে ElastiCache যোগ করলে দুটি নতুন পরিষেবা আসে যখন DynamoDB একাই সমস্যা সমাধান করে।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৩*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus একটি "favorites" feature যোগ করছে: গ্রাহকরা তাদের পছন্দের মেনু item সেভ করতে এবং এক ট্যাপে পুনরায় অর্ডার করতে পারবেন।

এই feature-এর জন্য DynamoDB table ডিজাইন করুন। Partition key কী হবে? আপনি কি sort key ব্যবহার করবেন? Item structure কেমন দেখাবে?

তারপর বিবেচনা করুন: সমস্ত গ্রাহক জুড়ে "শীর্ষ ১০০ সবচেয়ে-favorited item" দেখাতে হলে কী হবে? DynamoDB কি দক্ষতার সাথে এটির উত্তর দিতে পারে? না পারলে, আর্কিটেকচারে আপনি কী যোগ করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো access pattern-এর জন্য ডিজাইন অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo বৃহস্পতিবার রাতে কাউকে না বলে DynamoDB-তে মেনু migration চালিয়েছিল। এটা কাজ করল। Read দ্রুত ছিল। Schema নমনীয় ছিল। রেস্তোরাঁ অংশীদাররা তারা চাওয়া যেকোনো modifier field যোগ করতে পারত। কিন্তু সে monitoring dashboard আপডেট করতে ভুলে গিয়েছিল, এবং Priya শুক্রবার সকালে বিশ মিনিট ব্যয় করেছিল ভাবতে যে ডেটাবেস metrics কেন সমতল হয়ে গেছে।

সে তবু নিজের সম্পর্কে ভালো অনুভব করছিল।

তারপর Priya, dashboard পুনরুদ্ধার করে, metrics দেখল।

"Leo," সে বলল, "প্রতিটি page load ৪৭টি DynamoDB অনুরোধ করছে।"

"প্রতিটি দেখানো রেস্তোরাঁ প্রতি একটি," Leo নিশ্চিত করল। "Browse page গ্রাহকের অবস্থানের জন্য নিকটতম সাতচল্লিশটি রেস্তোরাঁ লোড করে।"

"এবং সেই অনুরোধগুলির প্রতিটিতে প্রায় চার মিলিসেকেন্ড লাগছে।"

Leo গণনা করল। সাতচল্লিশ গুণ চার। "এটা... শুধু মেনুর জন্য একশত আটাশি মিলিসেকেন্ড। Rendering-এর আগে।"

"প্রতিটি page load-এ।"

"প্রতিটি গ্রাহকের জন্য।"

সে স্ক্রিনের দিকে তাকাল।

"আমাদের একটি cache দরকার," সে বলল।

পরবর্তী অধ্যায়ে: Nimbus-এর অ্যাপ্লিকেশন এবং এর ডেটাবেসের মধ্যবর্তী স্তর যা ধীর query দ্রুত করে।
