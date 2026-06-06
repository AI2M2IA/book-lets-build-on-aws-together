# অধ্যায় ২৩: ফাইলিং সিস্টেম যা নিজেকে সাজায়

একটি আইন সংস্থা সক্রিয় মামলার file ডেস্কে রাখে। সম্পন্ন মামলা একটি filing cabinet-এ যায়। তিন বছর আগের মামলা basement-এ storage box-এ যায়। দশ বছর আগের মামলা একটি off-site archive facility-তে যায় যেখানে প্রতি box-এ সেন্ট খরচ হয় কিন্তু যেকোনো কিছু পুনরুদ্ধার করতে দুই দিন লাগে।

একই তথ্য, কত ঘন ঘন access করা হয় তার উপর ভিত্তি করে ভিন্ন খরচে সংরক্ষিত।

---

Workflow automation জায়গায় থাকা এবং order flow অবশেষে স্থিতিশীল হওয়ার সাথে, Tom তার cost review-তে ফিরে গিয়েছিল। S3 বিল গত quarter থেকে তার মনের পিছনে বসেছিল — সেই line item-গুলির একটি যা কেউ সরাসরি না দেখে বাড়তে থাকত। তার অবশেষে দেখার সময় হয়েছিল।

সে Leo-কে ডাকল।

"আমাদের S3-তে ৪.২ টেরাবাইট আছে," check করার পর Leo বলল।

"কীসের?"

"রেস্তোরাঁর ছবি। Order receipt। Analytics export। ১৮ মাস আগের backup snapshot।"

"কতদিন আগে কেউ ১৮ মাসের পুরানো backup access করেছে?"

Leo access log check করল।

"গত অক্টোবর," সে বলল। "একবার। Backup format যাচাই করতে।"

"তাহলে আমরা ১৮ মাসের backup-এর জন্য পূর্ণ S3 Standard মূল্যে পেমেন্ট করছি।"

"হ্যাঁ।"

"এটার মাসে কত খরচ — Glacier বনাম Standard?" Tom জিজ্ঞেস করল, ইতিমধ্যে pricing page টেনে।

S3 Standard: প্রতি GB প্রতি মাসে $0.023। S3 Glacier Instant Retrieval: প্রতি GB প্রতি মাসে $0.004।

Tom হিসাব করল।

"আমরা এই বিল উল্লেখযোগ্যভাবে কমাতে পারি," সে বলল, "শুধু পুরানো data সস্তা storage-এ সরিয়ে।"

"আমাদের জানতে হবে কোনটা পুরানো," Leo বলল।

"S3 জানে। এটা last access time ট্র্যাক করে।"

**S3 Storage Class: সম্পূর্ণ বর্ণালী**

অধ্যায় ৫ প্রাথমিক storage class হিসেবে S3 Standard পরিচয় করিয়েছিল। S3-এর আসলে আটটি storage class আছে, প্রতিটি ভিন্ন access pattern-এর জন্য design করা (অষ্টমটি, **S3 Express One Zone**, latency-critical workload-এর জন্য একটি বিশেষায়িত single-AZ class এবং high-performance scenario-এর বাইরে খুব কমই আসে):

**S3 Standard**: ঘন ঘন access করা data-র জন্য। কম latency (মিলিসেকেন্ড)। সর্বোচ্চ খরচ। কোনো ন্যূনতম storage duration নেই। সক্রিয় data-র জন্য ব্যবহার করুন: বর্তমান menu ছবি, আজকের order, সাম্প্রতিক log।

**S3 Standard-Infrequent Access (S3 Standard-IA)**: মাসে একবারের কম access করা data-র জন্য। Standard-এর মতো একই মিলিসেকেন্ড retrieval, কিন্তু কম storage খরচ + প্রতি-GB retrieval fee। ৩০-দিনের ন্যূনতম storage duration। যে data আপনি access করলে তাৎক্ষণিকভাবে প্রয়োজন কিন্তু বিরলভাবে করেন তার জন্য ব্যবহার করুন: পুরানো order receipt, ৬-মাস-পুরানো analytics export।

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: S3 Standard-IA-এর মতো (৩০-দিনের ন্যূনতম সহ) কিন্তু শুধুমাত্র একটি Availability Zone-এ সংরক্ষিত (তিনটির পরিবর্তে)। কম durable (সেই AZ-এ একটি disaster হলে, data হারাতে পারে), কিন্তু ২০% সস্তা। হারিয়ে গেলে পুনরায় তৈরি করা যায় এমন data-র জন্য ব্যবহার করুন: thumbnail cache, অস্থায়ী processing output।

**S3 Glacier Instant Retrieval**: আর্কাইভ করা data যা আপনি মাঝে মাঝে প্রয়োজন করেন। মিলিসেকেন্ড retrieval। খুব কম storage খরচ, উচ্চতর প্রতি-GB retrieval খরচ। ৯০-দিনের ন্যূনতম storage। প্রতি quarter-এ বা কম একবার access করা data-র জন্য ব্যবহার করুন: quarterly compliance report, ১২-মাস-পুরানো backup snapshot।

**S3 Glacier Flexible Retrieval**: deep archive, মিনিট থেকে ঘণ্টায় retrieve করা হয়। Glacier Instant Retrieval-এর চেয়ে কম খরচ। কম জরুরি archival data-র জন্য ব্যবহার করুন।

**S3 Glacier Deep Archive**: সবচেয়ে কম খরচের option। ১২ ঘণ্টায় retrieve করা হয়। ১৮০-দিনের ন্যূনতম storage। regulatory compliance-এর জন্য রাখতে হবে কিন্তু কখনো access করা প্রত্যাশিত নয় এমন data-র জন্য ব্যবহার করুন: ৭-বছরের tax record, ১০-বছরের audit log।

Pattern: access frequency কমার সাথে, খরচ কমে কিন্তু retrieval time বাড়ে (এবং প্রতি-retrieval খরচ বাড়ে)। আপনার access pattern-এর সাথে মেলে এমন class বেছে নিন।

**S3 Lifecycle Policy: স্বয়ংক্রিয় ফাইলিং সিস্টেম**

storage class-গুলির মধ্যে ম্যানুয়ালি file সরানো error-prone এবং সময়সাপেক্ষ। S3 **lifecycle policy** আপনার সংজ্ঞায়িত rule-এর উপর ভিত্তি করে এটা স্বয়ংক্রিয় করে।

একটি lifecycle rule-এর দুটি উপাদান আছে:

**Filter**: কোন object-গুলিতে rule প্রযোজ্য হয় (সমস্ত object, একটি নির্দিষ্ট prefix সহ object, নির্দিষ্ট tag সহ object)।

**Action**: কতদিন পরে কী করতে হবে।

Nimbus-এর order receipt-এর জন্য উদাহরণ lifecycle policy:

```
৯০ দিন পরে S3 Standard-IA-তে transition করুন
৩৬৫ দিন পরে S3 Glacier Instant Retrieval-এ transition করুন
৫৪০ দিন পরে (১৮ মাস) S3 Glacier Flexible Retrieval-এ transition করুন
২৫৫৫ দিন পরে (৭ বছর) S3 Glacier Deep Archive-এ transition করুন
২৯২০ দিন পরে (৮ বছর) delete করুন
```

এই একটি policy নিশ্চিত করে:

- সক্রিয় receipt (< ৯০ দিন): S3 Standard, দ্রুত access
- সাম্প্রতিক receipt (৯০-৩৬৫ দিন): Standard-IA, সস্তা কিন্তু তাৎক্ষণিকভাবে উপলব্ধ
- পুরানো receipt (১ বছর থেকে ১৮ মাস): Glacier Instant, খুব সস্তা, প্রয়োজনে মিলিসেকেন্ড
- ঐতিহাসিক receipt (১৮ মাস থেকে ৭ বছর): Glacier Flexible, আরও সস্তা — retrieval ঘণ্টা নেয়, মিলিসেকেন্ড নয়
- মেয়াদ শেষ হওয়া receipt (> ৮ বছর): স্বয়ংক্রিয়ভাবে delete করা

একটি catch প্রায় plan ভেঙে দিয়েছিল। ২০২৪-এর শেষ থেকে, lifecycle rule ডিফল্টভাবে **128 KB-এর ছোট object transition করে না** — এবং Nimbus-এর receipt প্রতিটি গড়ে 18 KB ছিল। policy আসলে সেগুলি সরাতে, Leo-কে rule-এ ডিফল্ট minimum object size override করতে হয়েছিল (lifecycle filter `ObjectSizeGreaterThan`/`ObjectSizeLessThan` দিয়ে size দ্বারাও select করতে পারে)। ডিফল্ট একটি ভালো কারণে বিদ্যমান: archive class প্রতি object ~40 KB metadata overhead বিল করে এবং প্রতিটি transition একটি request fee খরচ করে, তাই লক্ষ লক্ষ ছোট object-এর জন্য transition যা সাশ্রয় করে তার চেয়ে বেশি খরচ করতে পারে। Leo receipt-এর জন্য হিসাব চালাল — সাত-বছরের retention-এ, এটা এখনও লাভজনক ছিল।

Tom প্রক্ষেপিত সাশ্রয় পর্যালোচনা করল: $847/মাস থেকে প্রায় $220/মাস।

"শুধু... কোনটা পুরানো এবং কোথায় যাওয়া উচিত তা সংজ্ঞায়িত করে?" সে বলল।

"এবং S3 স্বয়ংক্রিয়ভাবে এটা সরায়," Leo নিশ্চিত করল। "কোনো cron job নেই। কোনো ম্যানুয়াল migration নেই। কোনো ভুলে যাওয়া নেই।"

"দাঁড়াও — কিন্তু S3 কেন ডিফল্টভাবে এটা করে না?" ঘরের অন্য পাশ থেকে Maya জিজ্ঞেস করল। "আপনাকে আদৌ কেন একটি policy সংজ্ঞায়িত করতে হবে?"

"কারণ 'পুরানো' প্রতিটি bucket-এর জন্য ভিন্ন," Leo বলল। "একটি compliance archive এবং একটি photo upload-এর সম্পূর্ণ ভিন্ন retention rule দরকার। S3 অনুমান করতে পারে না কোনটা কোনটা।"

আপনি হয়তো ভাবছেন: ভুল data Glacier-এ সরানো হলে এবং আপনার জরুরিভাবে এটা দরকার হলে কী হয়? আপনি একটি retrieval fee দেবেন এবং অপেক্ষা করবেন — এই কারণেই আপনার প্রথমে একটি ছোট, non-critical bucket-এ আপনার lifecycle rule test করা উচিত, এবং production data-তে roll out করার আগে access log যাচাই করা উচিত। ১৮ মাসের backup-এ একটি retrieval ভুল একটি customer-facing incident-এর চেয়ে অনেক কম খরচ করবে, কিন্তু প্রথমে test করা এখনও মূল্যবান।

আপনার data-র access pattern পূর্বানুমেয় হলে (log সবসময় ৩০ দিন পরে cold), explicit lifecycle rule ব্যবহার করুন — সেগুলি Intelligent-Tiering-এর per-object monitoring fee-এর চেয়ে বেশি cost-efficient। আপনার access pattern সময়ের সাথে পরিবর্তন হলে বা পূর্বানুমান করা কঠিন হলে, Intelligent-Tiering ব্যবহার করুন — কিন্তু সচেতন থাকুন এটা কেবল 128 KB-এর ছোট object উপেক্ষা করে: সেগুলি monitor করা হয় না, monitoring fee নেওয়া হয় না, এবং কখনো Frequent Access tier ছাড়ে না।

**S3 Intelligent-Tiering: স্ব-সংগঠিত Class**

আপনি যদি না জানেন আপনি কত ঘন ঘন আপনার data access করবেন?

**S3 Intelligent-Tiering** প্রতিটি object-এর access pattern monitor করে এবং স্বয়ংক্রিয়ভাবে এটাকে access tier-গুলির মধ্যে সরায়:

- **Frequent Access tier**: সম্প্রতি access করা object-এর জন্য
- **Infrequent Access tier**: ৩০ দিনের জন্য access না করা object
- **Archive Instant Access tier**: ৯০ দিনের জন্য access না করা object
- **Archive Access tier**: ৯০-৭৩০ দিনের জন্য access না করা object (ঐচ্ছিক)
- **Deep Archive Access tier**: ১৮০-৭৩০+ দিনের জন্য access না করা object (ঐচ্ছিক)

S3 Intelligent-Tiering প্রতি মাসে প্রতি object একটি ছোট monitoring fee চার্জ করে ($0.0025 প্রতি ১,০০০ object), কিন্তু Frequent এবং Infrequent tier-এর জন্য কোনো retrieval fee নেই।

Intelligent-Tiering ব্যবহার করুন যখন:

- access pattern অপ্রত্যাশিত বা সময়ের সাথে পরিবর্তন হয়
- আপনার hot এবং cold data-র একটি মিশ্রণ আছে যা আপনি সহজে শ্রেণীবদ্ধ করতে পারবেন না
- আপনার 128KB-এর বড় object আছে (ছোট object মোটেও monitor বা auto-tier করা হয় না)

explicit storage class ব্যবহার করুন (lifecycle policy সহ) যখন:

- access pattern পূর্বানুমেয়
- আপনি প্রতিটি object — ছোটগুলি সহ — আসলে সস্তা class-এ সরাতে চান
- object ছোট (< 128KB)

ছোট-file caveat-টির উপর জোর দেওয়া দরকার। Nimbus-এর S3-তে ২৩ লক্ষ order receipt object ছিল — প্রতিটি একটি ছোট JSON file, গড়ে প্রায় 18KB। Tom প্রথমে receipt bucket-এর জন্য Intelligent-Tiering বিবেচনা করেছিল, যতক্ষণ না সে fine print পড়ল।

128KB-এর ছোট object Intelligent-Tiering-এ **monitor করা হয় না এবং auto-tier করা হয় না**। তারা monitoring fee দেয় না ($0.0025 প্রতি ১,০০০ object প্রতি মাসে) — কিন্তু তারা কখনো সরেও না: তারা Frequent Access tier-এ বসে থাকে, Standard-সমতুল্য দামে, চিরকাল।

তাই 18KB receipt-এর জন্য, Intelligent-Tiering Nimbus-কে কোনো অতিরিক্ত খরচ করত না — এটা কেবল কিছু *করত* না। ২৩ লক্ষ cold receipt অনির্দিষ্টকালের জন্য hot-storage দাম দিতে থাকত ($0.023/GB), যখন Archive tier ($0.00099/GB) নাগালের বাইরে বসে থাকত।

"তাহলে Intelligent-Tiering বড় object-এর জন্য design করা," Maya বলল।

"অথবা যে workload-এ আপনি সত্যিই access pattern জানেন না তার জন্য," Tom বলল। "ছোট file-এর একটি bucket-এর জন্য যেখানে আমরা জানি receipt ৯০ দিন hot এবং তারপর cold, একটি explicit lifecycle rule — আগের small-object override সহ — একমাত্র জিনিস যা আসলে সেগুলি সরায়।"

Intelligent-Tiering একটি চমৎকার service। এটা কেবল প্রতিটি bucket-এর জন্য সঠিক tool নয়: 128KB threshold-এর নিচে এটা ক্ষতিকর নয় কিন্তু অকার্যকর, এবং কেবল explicit lifecycle rule (একটি size override সহ) ছোট object tier করবে।

**যখন আপনার আসলে Data ফেরত দরকার: একটি Glacier Retrieval গল্প**

Lifecycle policy deploy হওয়ার তিন মাস পর, Nimbus একটি legal notice পেল। একজন প্রাক্তন রেস্তোরাঁ partner একটি contract term নিয়ে বিরোধ করছিল, এবং Nimbus-এর আইনজীবীদের সেই partner-এর জন্য ১৮ মাসের order record দরকার ছিল — opening থেকে contract termination পর্যন্ত সব কিছু।

"এবং কেউ যদি legal discovery process-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya বলল। সে মজা করছিল না। "আইনজীবীরা bulk data export request করা একটি সাধারণ social engineering vector। কোনো data store খোলার আগে request বৈধ কিনা যাচাই করুন।"

Request বৈধ ছিল। Record S3-তে ছিল, তিনটি storage class জুড়ে: সবচেয়ে সাম্প্রতিক ৯০ দিন Standard-IA-তে, আগের বছর Glacier Instant Retrieval-এ, বাকিটা Glacier Flexible Retrieval-এ (lifecycle policy ১৮ মাসের বেশি পুরানো data-র জন্য Flexible ব্যবহার করেছিল)।

Glacier Instant record তাৎক্ষণিকভাবে উপলব্ধ ছিল। Leo রেস্তোরাঁ ID দ্বারা filter করল, matching order record শনাক্ত করতে একটি Athena query চালাল, এবং সেগুলি একটি secure S3 location-এ export করল। পাঁচ মিনিটের কাজ।

Glacier Flexible record-এর একটি restore request প্রয়োজন ছিল:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **Standard tier**: ৩-৫ ঘণ্টা। Record S3 Standard-এ ৭ দিনের জন্য একটি অস্থায়ী copy হিসেবে উপলব্ধ থাকবে, তারপর স্বয়ংক্রিয়ভাবে সরানো হবে। মূল আর্কাইভ করা copy Glacier-এ থাকে।

পুরো retrieval-এর খরচ: Standard tier-এ প্রতি GB retrieve $0.01, ৪.২ GB আর্কাইভ করা record-এর জন্য। প্রায় চার সেন্ট। (Expedited tier — ১ থেকে ৫ মিনিট — প্রতি GB $0.03 খরচ করে, কিন্তু Standard-এর মতো এর availability গ্যারান্টি করা নয়।)

"চার সেন্ট," Leo report করলে Maya বলল। "১৮ মাসের record-এর জন্য।"

"আমরা দেড় বছরের জন্য ৪.২GB প্রতি GB প্রতি মাসে $0.0036-এ store করেছিলাম," Leo বলল। "Storage খরচ মোট প্রায় সাতাশ সেন্ট ছিল। Retrieval খরচ ছিল চার। ১৮ মাসের জন্য S3 Standard-এ রাখলে এক ডলার চুয়াত্তরের বিপরীতে।"

"এবং একমাত্র যে জিনিস গুরুত্বপূর্ণ ছিল," Priya বলল, "তা হলো আমরা মনে রেখেছিলাম এটা Flexible Retrieval-এ ছিল এবং ৩-৫ ঘণ্টার অপেক্ষার জন্য plan করেছিলাম। আইনজীবীদের এটা ৩০ মিনিটে দরকার হলে, আমাদের একটি সমস্যা হত।"

এটাই Glacier সম্পর্কে গুরুত্বপূর্ণ operational শিক্ষা: এটা কেবল একটি cost সিদ্ধান্ত নয়, এটা একটি retrieval SLA সিদ্ধান্ত। Glacier Flexible বা Deep Archive-এ data আর্কাইভ করার আগে, যে কারো প্রয়োজন হতে পারে তার জন্য retrieval time নথিভুক্ত করুন। "Data বিদ্যমান" এবং "আমরা ৩০ মিনিটে এটা পেতে পারি" দুটি ভিন্ন গ্যারান্টি।

**Multipart Upload: বড় Object-এর জন্য**

S3-এর একটি 5GB single upload limit আছে। বড় object-এর জন্য, আপনাকে **multipart upload** ব্যবহার করতে হবে: object-টিকে অংশে বিভক্ত করুন, প্রতিটি সমান্তরালে আপলোড করুন, এবং S3 সেগুলি একত্রিত করে।

সুবিধা:

- দ্রুত upload (সমান্তরাল)
- ব্যর্থ upload resume করতে পারে (শুধুমাত্র ব্যর্থ অংশ পুনরায় upload করুন)
- 5GB-এর বড় object-এর জন্য প্রয়োজনীয়

Lifecycle rule tip: ৭ দিন পরে অসম্পূর্ণ multipart upload delete করতে একটি lifecycle rule সেট করুন। একটি upload মাঝপথে ব্যর্থ হলে এবং পরিষ্কার না করা হলে, সেই আংশিক অংশ store এবং চার্জ করা হয় — দেখানোর জন্য একটি একত্রিত object ছাড়াই।

Tom এই tip-টি প্রচুর প্রশংসা করল।

সে সমস্ত Nimbus bucket জুড়ে অসম্পূর্ণ multipart upload তালিকাভুক্ত করতে AWS CLI command চালাল:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

Output সে যা আশা করেছিল তার চেয়ে দীর্ঘ ছিল। সে এটা একটি counter-এ pipe করল।

৩৪০টি অসম্পূর্ণ upload। সবচেয়ে পুরানো ছিল ৮ মাস আগের — রেস্তোরাঁ photo upload flow-এর Leo-র load test। Load test শত শত আংশিক upload তৈরি করেছিল, যার কোনোটিই সম্পূর্ণ হয়নি (test সেগুলি সম্পূর্ণ করার জন্য design করা ছিল না, শুধু initiation endpoint test করতে)। ৩৪০টি অসম্পূর্ণ upload, S3-তে বসে, প্রতিটি আংশিক data উপস্থাপন করছে যা AWS store এবং চার্জ করছিল।

"এটার মাসে কত খরচ?" Tom বলল। সে তথ্য চাইছিল না। সে জোরে হিসাব করছিল।

অসম্পূর্ণ অংশের সম্মিলিত আকার: 48 GB। $0.023/GB-এ: $1.10/মাস। আট মাসের জন্য: $8.80 ইতিমধ্যে খরচ হয়েছে।

বর্তমান growth rate-এ, পরিষ্কার না করা হলে: অনির্দিষ্টকালের জন্য চলতে থাকবে।

"Leo," Tom বলল।

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ," Leo এসে বলল। "Load test। আমি আংশিক upload পরিষ্কার করতে ভুলে গিয়েছিলাম।"

"আট মাস আগে।"

"আমি জানতাম না upload কখনো সম্পূর্ণ না হলেও S3 অংশ store করে।"

"এটা সেগুলি store করে। এটা সেগুলির জন্য চার্জ করে। এবং আপনাকে এটা সম্পর্কে সতর্ক করার কোনো dashboard নেই। তারা কেবল জমা হয়।"

Fix: ৭ দিন পরে অসম্পূর্ণ multipart upload অংশ delete করতে একটি lifecycle rule।

```
Rule: Delete incomplete multipart upload parts
Prefix: (all objects)
Action: Delete incomplete multipart uploads after 7 days
```

বিদ্যমান ৩৪০টি upload ম্যানুয়ালি পরিষ্কার করা হল। Lifecycle rule নিশ্চিত করে কোনো ভবিষ্যৎ load test বা ব্যর্থ upload একইভাবে জমা না হয়। আট মাস ধরে নীরবে গড়ে ওঠা $1.10/মাস থেমে গেল — ডলারে ছোট, কিন্তু pattern (অদৃশ্য, বর্ধনশীল, uncapped) ছিল মারার মতো অংশ।

"Rule তিন লাইন," Tom বলল। "আমার এটা তৈরির সময় প্রতিটি bucket-এ সেট করা উচিত ছিল।" সে bucket creation checklist আপডেট করল: প্রতিটি নতুন S3 bucket ডিফল্টভাবে একটি multipart upload cleanup rule পায়।

**তিনটি Security Layer: পথচলার আগে একটি দ্রুত পুনরালোচনা**

"এবং কেউ যদি ভাঙতে এবং audit log delete করার চেষ্টা করে?" Priya আবার জিজ্ঞেস করল — এবার একটি নির্দিষ্ট threat model-এর প্রসঙ্গে। "শুধু একটি ভুল configure করা lifecycle rule নয়। একজন malicious insider। write access সহ একটি compromised IAM key।"

দলের কাছে ইতিমধ্যে উত্তর ছিল — তারা কেবল এই bucket-এ সেগুলি প্রয়োগ করেনি। তিনটি layer, প্রতিটি বইয়ের আগে কভার করা, প্রতিটি একটি ভিন্ন threat vector address করছে:

**Versioning** (অধ্যায় ৫) deletion-কে reversible করে — একটি DELETE একটি delete marker হয়ে যায়, এবং পূর্ববর্তী version restorable থাকে। order receipt-এর মতো write-once data-র জন্য, storage overhead minimal: প্রতি object কখনো শুধুমাত্র একটি version থাকে।

**S3 Object Lock** (অধ্যায় ৫) object-গুলিকে সত্যিকারের immutable করে — WORM storage যা retention period-এর সময় এমনকি একটি admin key-ও delete করতে পারে না। receipt-এর জন্য, তাদের ৭-বছরের tax retention প্রয়োজনীয়তা সহ, দল Compliance mode বেছে নিল: কোনো lifecycle misconfiguration, কোনো IAM ভুল, কোনো compromised credential auditor জিজ্ঞাসা করার আগে সেগুলি সরাতে পারে না। এবং Object Lock lifecycle transition-এর সাথে সহাবস্থান করে — receipt-কে Glacier Deep Archive-এ সরানো একটি rule এখনও কাজ করে; data সস্তা হয় এবং immutable থাকে।

**CloudTrail S3 data event** (অধ্যায় ১৬-১৭) আপনাকে বলে data-র কী হয়েছিল: প্রতিটি GET, PUT, DELETE, এবং COPY log করা — কে, কোথা থেকে, এবং কখন — কাঁচা উপাদান যা GuardDuty (অধ্যায় ১৭) anomaly-তে alert করতে ব্যবহার করে।

"দুর্ঘটনা recovery-র জন্য versioning। compliance immutability-র জন্য Object Lock। forensics-এর জন্য CloudTrail," Priya সারসংক্ষেপ করল। "আমরা এগুলির প্রতিটি নিজেরই কভার করেছি। আজকের নতুন সিদ্ধান্ত হলো এই bucket-এর জন্য তিনটিই চালু করা।"

**Cross-Region Replication: Disaster Recovery হিসেবে Order Record**

Nimbus order receipt bucket us-west-2-এ ছিল। সেটা ইচ্ছাকৃত ছিল — us-west-2 হলো যেখানে application চলত। কিন্তু "application us-west-2-এ" এবং "সমস্ত order record শুধুমাত্র us-west-2-এ" ভিন্ন risk profile।

Nimbus-এর us-east-1-এ একটি disaster recovery site সক্রিয় করার প্রয়োজন হলে, order record-ও সেখানে থাকতে হত। একটি regional failure-এর মাঝখানে সেগুলি copy করার জন্য অপেক্ষা করা একটি recovery plan নয়।

Priya order receipt bucket-এর জন্য **Cross-Region Replication (CRR)** সুপারিশ করল। Rule:

```
Source: nimbus-order-receipts (us-west-2)
Destination: nimbus-order-receipts-dr (us-east-1)
Replication: All objects
Storage class in destination: S3 Standard-IA (সস্তা — এটা DR copy, বিরলভাবে access করা)
```

কার্যপ্রণালী অধ্যায় ৫ থেকে পরিচিত ছিল: নতুন write-এর asynchronous replication (বেশিরভাগ object ১৫ মিনিটের মধ্যে; একটি guaranteed SLA-এর জন্য **S3 Replication Time Control**-এর জন্য পেমেন্ট করতে হবে), উভয় bucket-এ versioning প্রয়োজন, read-source/write-destination permission সহ একটি IAM role। উপরের rule-এ লক্ষ্য করার মতো বিস্তারিত: destination source-এর চেয়ে একটি *ভিন্ন storage class* ব্যবহার করে — DR copy-র জন্য Standard-IA, একটি দ্বিতীয় Standard copy-র জন্য পেমেন্ট করার পরিবর্তে যা বিরলভাবে পড়া হয়। এবং versioning prerequisite-এর কোনো অতিরিক্ত খরচ ছিল না — তারা ইতিমধ্যে দুর্ঘটনা recovery-র জন্য versioning সক্ষম করছিল। (CRR-এর ভাই, **Same-Region Replication (SRR)**, *একই* region-এ bucket-গুলির মধ্যে object copy করে — একটি পৃথক account-এ একটি compliance copy, log aggregation, বা production data থেকে seed করা test environment-এর জন্য উপযোগী।)

একটি gotcha Priya কেউ এতে hit করার আগে উল্লেখ করল: replication **retroactive নয়**। আপনি rule সক্ষম করার সময় bucket-এ ইতিমধ্যে বিদ্যমান object replicate হয় না — শুধুমাত্র নতুন write। দলগুলি CRR সক্ষম করে তাদের সমস্ত বিদ্যমান data destination-এ আসার আশায়, তারপর আবিষ্কার করে DR bucket প্রায় খালি। পূর্ব-বিদ্যমান object-এর জন্য, আপনি **S3 Batch Replication** চালান, একটি পৃথক operation যা ইতিমধ্যে সেখানে থাকা object-গুলিতে replication rule প্রয়োগ করে। Nimbus বিদ্যমান 0.8 TB receipt দিয়ে DR bucket seed করতে এটা একবার চালাল।

"এবং delete marker?" Priya জিজ্ঞেস করল। "কেউ us-west-2-এ একটি receipt delete করলে, এটা কি deletion us-east-1-এ replicate করে?"

ডিফল্টভাবে, না — বর্তমান replication configuration-এ (console যে V2 schema তৈরি করে), **delete marker replicate হয় না**। কেউ us-west-2-এ একটি receipt delete করে, এবং us-east-1 copy এটা পরিবেশন করতে থাকে যেন কিছু ঘটেনি। আপনি DR bucket-কে deletion mirror করতে *চাইলে*, আপনি rule-এ স্পষ্টভাবে delete marker replication সক্ষম করেন (tag filter সহ rule-এ সমর্থিত নয়) — সেটা legacy V1 schema-তে ডিফল্ট ছিল, যা পুরানো উপাদান এখনও বর্ণনা করে। যেভাবেই হোক, lifecycle expiration কখনো তাদের delete marker replicate করে না।

Replication এখনও একটি backup সমাধান *নয়*, যদিও — বিপরীত কারণে: এটা permanent version deletion বা mirror-এ replicate করা malicious overwrite থেকে রক্ষা করবে না, এবং এর কোনো retention semantics নেই। প্রকৃত backup-এর জন্য, Object Lock-এর সাথে versioning pair করুন, বা AWS Backup ব্যবহার করুন।

"এটার মাসে কত খরচ?" Tom জিজ্ঞেস করল।

us-east-1-এ S3 Standard-IA-তে 0.8 TB-এর storage: $10.00/মাস। Plus replication data transfer (প্রতি GB cross-region transfer চার্জ): তাদের current write volume-এ minimal। মোট অতিরিক্ত খরচ: সমস্ত order record-এর একটি সম্পূর্ণ cross-region copy-র জন্য মোটামুটি $10-11/মাস।

Tom কোনো অভিযোগ ছাড়াই এটা লিখে রাখল।

**S3 Storage Lens: সম্পূর্ণ চিত্র দেখা**

Tom তার audit ম্যানুয়ালি করেছিল — AWS console bucket by bucket খুলে, object গণনা করতে AWS CLI command চালিয়ে, bucket অনুযায়ী storage cost-এর জন্য billing explorer check করে। সেই spreadsheet তৈরি করতে তার একটি বিকেলের বেশিরভাগ লেগেছিল।

**S3 Storage Lens** হলো সেই AWS tool যা সেই ম্যানুয়াল process প্রতিস্থাপন করে। এটা সমস্ত bucket, সমস্ত account, এবং সমস্ত region জুড়ে S3 usage এবং activity-তে organization-wide দৃশ্যমানতা প্রদান করে — একটি single dashboard-এ।

Cost optimization-এর জন্য সবচেয়ে গুরুত্বপূর্ণ metric:

**Non-current version bytes**: পুরানো version (versioning সক্ষম থাকলে) কতটা storage consume করে। Versioning নিরাপত্তার জন্য অপরিহার্য, কিন্তু একটি document ঘন ঘন আপডেট হলে, পুরানো version জমা হয়। ৩০ দিন পরে non-current version expire করার একটি lifecycle rule version bloat প্রতিরোধ করে।

**Incomplete multipart upload bytes**: ঠিক সেই সমস্যা Leo load test দিয়ে সৃষ্টি করেছিল, স্বয়ংক্রিয়ভাবে সামনে আনা। Storage Lens ছাড়া, Tom-কে অসম্পূর্ণ multipart upload খুঁজতে জানতে হয়েছিল। Storage Lens সহ, তারা dashboard-এ একটি line item হিসেবে দেখা যায়।

**% requests returning 403**: একটি bucket-এ 403 (Forbidden) response-এ একটি spike যা publicly accessible হওয়া উচিত একটি ভুল configure করা bucket policy নির্দেশ করতে পারে। একটি private bucket-এ একটি spike একটি scanning বা probing প্রচেষ্টা নির্দেশ করতে পারে। যেভাবেই হোক, এটা তদন্তের যোগ্য একটি signal।

**Average object size**: ছোট object-এর একটি bucket (গড় 2KB) বড় object-এর একটি bucket (গড় 50MB) থেকে Intelligent-Tiering economics, request cost, এবং Athena-র জন্য query performance-এর দিক থেকে ভিন্নভাবে আচরণ করে।

S3 Storage Lens-এর একটি free tier আছে যা অপরিহার্য metric কভার করে। advanced metric (request statistics, filtering-এর জন্য lens group)-এর প্রতি মাসে প্রতি মিলিয়ন object অতিরিক্ত খরচ আছে — এটা যে সাশ্রয় সক্ষম করে তার তুলনায় ছোট।

"আমরা শুরু থেকে এটা ব্যবহার করিনি কেন?" Maya জিজ্ঞেস করল।

"আমাদের শুরু থেকে ৪.২ টেরাবাইট ছিল না," Tom বলল। "ছোট scale-এ, একটি spreadsheet কাজ করে। এই scale-এ, scale নিজেই tool-এর জন্য একটি যুক্তি হয়ে ওঠে।"

এটা Nimbus architecture-এ একটি পুনরাবৃত্ত theme: একটি প্রদত্ত scale-এর জন্য সঠিক tool সবসময় পরবর্তী scale-এর জন্য সঠিক tool নয়। S3 Storage Lens আপনার S3 usage এক বিকেলে ম্যানুয়ালি audit করতে পারার বাইরে বাড়ার সাথে সাথে configure করার মতো — যা মোটামুটি তখন যখন এটা যে সাশ্রয় সক্ষম করে তা এটা যে সময় বাঁচায় তার চেয়ে অর্থপূর্ণভাবে বেশি হতে শুরু করে।

## শক্তি এবং সীমাবদ্ধতা

**কেন S3 storage tier গুরুত্বপূর্ণ**:

- আসলে যা access করা হয় তার জন্য durability বা availability ত্যাগ না করে উল্লেখযোগ্য cost হ্রাস
- Lifecycle policy সম্পূর্ণ process স্বয়ংক্রিয় করে — কোনো operational বোঝা নেই
- S3 Intelligent-Tiering access pattern পূর্বানুমান করার প্রয়োজনীয়তা দূর করে

**যেখানে জটিল হয়**:

- Glacier class-এ minimum storage duration চার্জ প্রযোজ্য (Glacier Instant-এর জন্য ৯০ দিন, Deep Archive-এর জন্য ১৮০ দিন) — তাড়াতাড়ি delete করলেও minimum চার্জ লাগে
- আপনি ঘন ঘন আর্কাইভ করা data access করলে retrieval fee আপনাকে অবাক করতে পারে
- lifecycle transition সময় নেয় — rule trigger হওয়ার পরে object তাৎক্ষণিকভাবে সরানো হয় না
- Intelligent-Tiering 128KB-এর নিচে object উপেক্ষা করে — কোনো fee নেই, কিন্তু কোনো tiering-ও নেই; এবং lifecycle rule ডিফল্টভাবে সেগুলি skip করে যদি না আপনি minimum object size override করেন

## সারসংক্ষেপ

অধ্যায় ২২-এর workflow automation Nimbus কীভাবে request process করে তা optimize করেছিল। এই অধ্যায়টি Nimbus যে data রাখছে কিন্তু access করছে না তার জন্য কী দেয় তা optimize করে। নীতি একই: ভুল tier-এর জন্য পেমেন্ট বন্ধ করুন।

- S3-এর আটটি storage class আছে: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — plus Express One Zone (বিশেষায়িত low-latency, single AZ)।
- **Lifecycle policy** বয়সের উপর ভিত্তি করে storage class-গুলির মধ্যে transition স্বয়ংক্রিয় করে — একবার সংজ্ঞায়িত করুন, S3 চিরকাল এটা handle করে।
- **S3 Intelligent-Tiering** প্রকৃত access pattern-এর উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে object-গুলিকে tier-এর মধ্যে সরায় — 128KB-এর বড় object সহ অপ্রত্যাশিত workload-এর জন্য ব্যবহার করুন। ছোট object monitor বা auto-tier করা হয় না (এবং কোনো monitoring fee দেয় না) — তারা Frequent Access tier-এ থাকে।
- **Glacier retrieval** Flexible এবং Deep Archive tier-এর জন্য একটি restore request প্রয়োজন। retrieval-এর জন্য একটি SLA সহ কোনো data আর্কাইভ করার আগে retrieval time (মিনিট থেকে ১২ ঘণ্টা) plan করুন।
- **অসম্পূর্ণ multipart upload** নীরবে জমা হয় এবং storage চার্জ লাগে। প্রতিটি bucket-এ ৭ দিন পরে অসম্পূর্ণ অংশ delete করতে একটি lifecycle rule যোগ করুন।
- **তিনটি security layer**: versioning (reversible delete), Object Lock (compliance-এর জন্য immutability), CloudTrail data event (forensics এবং anomaly detection)।
- **Cross-Region Replication (CRR)**: order record স্বয়ংক্রিয়ভাবে একটি DR region-এ replicate করুন। উভয় bucket-এ versioning প্রয়োজন। DR copy একটি mirror নাকি একটি backup তার উপর ভিত্তি করে delete marker replicate করে কিনা configure করুন।
- **Multipart upload** 5GB-এর বড় object-এর জন্য প্রয়োজনীয় এবং 100MB-এর বড় যেকোনো কিছুর জন্য প্রস্তাবিত।
- **S3 Object Lock** compliance scenario-এর জন্য WORM storage প্রদান করে — Governance mode admin দ্বারা override করা যায়; Compliance mode কেউ override করতে পারে না।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Cost-Optimized Architectures (ডোমেন ৪, টাস্ক ৪.১)*

- **Storage class নির্বাচন সংকেত**:
  - "ঘন ঘন access করা হয়" → Standard
  - "মাসে একবার access, তাৎক্ষণিক retrieval প্রয়োজন" → Standard-IA
  - "ঘণ্টার retrieval time সহ্য করতে পারে, বিরলভাবে access করা" → Glacier Flexible Retrieval
  - "regulatory compliance, ৭+ বছর retention, কখনো access নয়" → Glacier Deep Archive
  - "অজানা বা পরিবর্তিত access pattern" → Intelligent-Tiering
- **Lifecycle policy পরীক্ষার pattern**: "data বয়স হওয়ার সাথে স্বয়ংক্রিয়ভাবে storage cost কমান," "৯০ দিন পরে archive-এ transition করুন" → lifecycle policy।
- **Intelligent-Tiering এবং ছোট object**: 128KB-এর নিচে object monitor করা হয় না, কোনো monitoring fee দেয় না, এবং কখনো auto-tier হয় না — তারা Frequent Access-এ থাকে। Lifecycle rule-ও ডিফল্টভাবে 128KB-এর নিচের object skip করে (override করা যায়)। পরীক্ষা যেকোনো তথ্য test করতে পারে।
- **CRR প্রয়োজনীয়তা**: source এবং destination উভয় bucket-এ versioning সক্ষম করতে হবে। source এবং destination ভিন্ন region-এ থাকতে হবে।
- **S3 Object Lock**: "WORM," "immutable," "SEC 17a-4," "delete বা modify করা যাবে না" → Object Lock। Governance mode (admin দ্বারা override করা যায়)। Compliance mode (root সহ কেউ override করতে পারে না)।
- **Glacier restore**: Glacier-এ object তাৎক্ষণিকভাবে উপলব্ধ নয়। আপনাকে access-এর জন্য S3 Standard-এ একটি copy "restore" করতে হবে। restore করা copy অস্থায়ী (আপনি duration সেট করেন)। মূলটি Glacier-এ থাকে।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

S3 Standard-IA এবং S3 Glacier Instant Retrieval-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। কোন access pattern প্রতিটিকে উপযুক্ত করে?

*(ইঙ্গিত: আপনি কত ঘন ঘন data access করবেন এবং যখন access করেন তখন কত দ্রুত প্রয়োজন তা নিয়ে ভাবুন।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি কোম্পানি প্রতিদিন 500GB application log তৈরি করে। প্রথম ৭ দিনের জন্য log ভারীভাবে query করা হয় (debugging এবং monitoring)। ৭ দিন পরে, log বিরলভাবে access করা হয় কিন্তু প্রয়োজন হলে ৩০ মিনিটের মধ্যে উপলব্ধ থাকতে হবে। ১ বছর পরে, log compliance-এর জন্য রাখতে হবে কিন্তু কখনো access করা হয় না। কোম্পানি এই প্রয়োজনীয়তা পূরণ করার সময় storage cost minimize করতে চায়।

কোন S3 lifecycle policy এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) ৭ দিনের জন্য S3 Standard-এ store করুন; ৭ দিন পরে S3 Glacier Deep Archive-এ transition করুন; ৩৬৫ দিন পরে expire করুন  
B) ৭ দিনের জন্য S3 Standard-এ store করুন; ৭ দিন পরে S3 Standard-IA-তে transition করুন; ৩৬৫ দিন পরে S3 Glacier Flexible Retrieval-এ transition করুন  
C) প্রথম দিন থেকে সমস্ত log S3 Intelligent-Tiering-এ store করুন  
D) ৭ দিনের জন্য S3 Standard-এ store করুন; ৭ দিন পরে S3 Glacier Instant Retrieval-এ transition করুন; ৩৬৫ দিন পরে S3 Glacier Deep Archive-এ transition করুন

**ইঙ্গিত ১**: "৩০ মিনিটের মধ্যে উপলব্ধ" কোন storage class বাদ দেয়?

**ইঙ্গিত ২**: Deep Archive retrieve করতে ১২ ঘণ্টা নেয় — দিন ৭-৩৬৫-এর জন্য ৩০-মিনিটের প্রয়োজনীয়তা পূরণ করে না।

**ইঙ্গিত ৩**: ৩৬৫ দিন পরে, retrieval time গুরুত্বপূর্ণ নয় (কখনো access করা হয় না), তাই সবচেয়ে সস্তা option প্রযোজ্য।

**উত্তর**: D

**ব্যাখ্যা**: S3 Standard ৭ দিনের জন্য ঘন ঘন access handle করে। Glacier Instant Retrieval দিন ৭-৩৬৫-এর জন্য মিলিসেকেন্ড access প্রদান করে — Standard-IA-এর চেয়ে উল্লেখযোগ্যভাবে কম খরচে ৩০-মিনিটের প্রয়োজনীয়তা পূরণ করে। ৩৬৫ দিন পরে, Glacier Deep Archive কখনো access না করা data-র জন্য সবচেয়ে সস্তা option।

**কেন A নয়?** Glacier Deep Archive retrieve করতে ১২ ঘণ্টা নেয় — দিন ৭-৩৬৫-এর জন্য "৩০-মিনিটের availability" প্রয়োজনীয়তা পূরণ করে না।

**কেন B নয়?** Standard-IA এখানে প্রথম stop-ও হতে পারে না: S3 একটি lifecycle rule সেগুলিকে Standard-IA বা One Zone-IA-তে transition করার আগে object-গুলিকে Standard-এ ৩০ দিন বয়সী হতে হবে — তাই "৭ দিন পরে Standard-IA" একটি অবৈধ rule। (৩০-দিনের নিয়ম Glacier class-এ প্রযোজ্য নয়, যে কারণেই D কাজ করে।) এবং সেটা একপাশে রাখলেও, দিন ৭-এর পরে বিরলভাবে access করা data-র জন্য Glacier Instant Retrieval উল্লেখযোগ্যভাবে সস্তা।

**কেন C নয়?** Intelligent-Tiering-এর প্রতি object একটি monitoring fee আছে এবং explicit lifecycle rule-এর মতো আগ্রাসিকভাবে log-কে archive tier-এ নাও সরাতে পারে। একটি পূর্বানুমেয় access pattern সহ log-এর বড় volume-এর জন্য, explicit lifecycle rule বেশি cost-effective।

*SAA-C03 ডোমেন: Design Cost-Optimized Architectures — টাস্ক ৪.১*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus-এর ভিন্ন বৈশিষ্ট্য সহ তিন ধরনের S3 data আছে:

- রেস্তোরাঁর ছবি: একবার upload করা, গ্রাহকরা অনেকবার access করে, কখনো delete হয় না
- Order receipt: প্রথম মাসে গ্রাহকরা access করে, tax উদ্দেশ্যে ৭ বছর রাখা হয়
- Analytics export: প্রতিদিন তৈরি, পরের সপ্তাহে বিশ্লেষণ করা, ২ বছর রাখা হয়

প্রতিটির জন্য একটি lifecycle policy design করুন। রেস্তোরাঁর ছবির জন্য, Intelligent-Tiering কি অর্থপূর্ণ হবে? Order receipt-এর জন্য, ১-মাস থেকে ৭-বছরের window কোন storage class কভার করে? Analytics export-এর জন্য, আপনি বিভিন্ন prefix-এ বিভিন্ন policy প্রয়োগ করতে bucket কীভাবে গঠন করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো বাস্তব-জগতের data-র জন্য storage tier নির্বাচন অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Tom lifecycle policy বাস্তবায়ন করল।

Leo প্রথম rule configure করতে সাহায্য করেছিল। "এটা ঠিক থাকবে," সে বলেছিল। "minimum storage duration কেবল তখনই প্রযোজ্য যদি আমরা তাড়াতাড়ি delete করি — এবং আমরা কিছু delete করছি না।" সে মাঝপথে Glacier minimum duration প্রয়োজনীয়তা check করল। "আসলে, আমাকে এটা আবার পড়তে দাও।"

একটি ভিন্ন bucket-এ — অস্থায়ী analytics staging export — সে প্রায় Glacier Instant Retrieval-এ একটি ৩০-দিনের transition একটি ৬০-দিনের expiration rule-এর সাথে একত্রিত করেছিল। Glacier Instant-এর জন্য minimum storage duration ৯০ দিন: সেই object দিন ৩০-এ Glacier-এ প্রবেশ করত এবং দিন ৬০-এ delete হত, এবং S3 তবুও সেগুলির প্রতিটির জন্য পূর্ণ ৯০ দিন বিল করত — আর বিদ্যমান না থাকা storage-এর জন্য archive দাম দিয়ে। সে সেই bucket-এর জন্য Glacier transition সম্পূর্ণভাবে বাদ দিল; দিন ৬০-এ delete করা data কখনো একটি ৯০-দিনের minimum amortize করার মতো দীর্ঘ বাঁচে না। receipt policy design অনুযায়ী নিরাপদ ছিল: দিন ৯০-এ Standard-IA-তে transition, দিন ৩৬৫-এ Glacier Instant Retrieval, দিন ৫৪০-এ Glacier Flexible Retrieval, দিন ২,৫৫৫-এ Glacier Deep Archive।

সে প্রতিটি bucket-এ multipart upload cleanup rule-ও সেট করল। আরও পরিত্যক্ত upload ছিল বলে নয় — ছিল না — কিন্তু কারণ থাকবে। Load test ঘটে। Deployment মাঝপথে ব্যর্থ হয়। Rule ম্যানুয়ালি পরিষ্কার করার কথা মনে রাখতে প্রয়োজনীয় স্মৃতির চেয়ে সস্তা ছিল।

পরের মাসে S3 বিল $847 থেকে $198-এ নেমে এল।

সে তুলনাটি প্রিন্ট করল এবং কিছু না বলে Maya-র ডেস্কে রাখল।

Maya সেদিকে তাকাল। তারপর তারিখের দিকে। তারপর Tom-এর দিকে।

"তিন সপ্তাহ," সে বলল।

"policy design করতে একটি বিকেল," সে বলল। "সেগুলি বাস্তবায়ন করতে এক ঘণ্টা। প্রথম সম্পূর্ণ billing cycle দেখতে তিন সপ্তাহ।"

"S3 cost-এ তিন-চতুর্থাংশ হ্রাস।"

"আমরা যে data access করি না তার জন্য।"

"এবং cross-region replication?" Leo জিজ্ঞেস করল।

"মাসে আরও দশ ডলার," Tom বলল। "একটি দ্বিতীয় region-এ প্রতিটি order receipt-এর একটি সম্পূর্ণ copy-র জন্য।"

"সেটা আমরা নেওয়া সবচেয়ে সস্তা disaster recovery সিদ্ধান্ত।"

Maya আবার সংখ্যাগুলি দেখল।

"Tom," সে বলল, "আমি চাই তুমি আমাদের ব্যবহৃত প্রতিটি AWS service-এর জন্য এই review করো। Storage, compute, networking। অপচয় খুঁজে বের করো।"

সে ইতিমধ্যে তার ডেস্কে ফিরে গিয়েছিল।

"আমি গত সপ্তাহে শুরু করেছি," সে বলল।

পরবর্তী অধ্যায়ে: database tier-এর এই কথোপকথনের নিজস্ব version আছে, এবং Aurora হলো সেই উত্তর যা Tom পছন্দ করবে বলে আশা করেনি।
