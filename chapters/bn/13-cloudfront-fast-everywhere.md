# অধ্যায় ১৩: সর্বত্র দ্রুত

Oregon-এর একটি সার্ভার থেকে Boston-এর একটি ফোনে ভ্রমণকারী একটি ফটো মোটামুটি ৪,১০০ কিলোমিটার fiber optic cable অতিক্রম করে। আলোর দুই-তৃতীয়াংশ গতিতে, এটি প্রায় ২৫ মিলিসেকেন্ড বিশুদ্ধ physics — অনিবার্য, অলঙ্ঘনীয়, মহাবিশ্বের নিয়মে baked in।

তারপর round trip যোগ করুন। তারপর processing time যোগ করুন। Browser এখনো render শুরু করেনি এবং ৮০ মিলিসেকেন্ড ইতিমধ্যে চলে গেছে।

---

*`eatnimbus.com` live ছিল এবং domain name প্রকৃত ছিল। ব্যবহারকারীরা অ্যাপ খুঁজে পেত। কিন্তু এটি খুঁজে পাওয়া এটি উপভোগ করার সমান ছিল না। Tom বিভিন্ন শহর থেকে latency measurement চালাচ্ছিল, এবং East Coast এবং South America-র সংখ্যাগুলি ভালো ছিল না। Domain name সমস্যা সমাধান হয়েছিল। Physics সমস্যা হয়নি।*

---

`eatnimbus.com` live ছিল। Leo East Coast ব্যবহারকারীদের কাছ থেকে latency metrics check করেছিল: প্রতি অনুরোধে ৮০-১০০ মিলিসেকেন্ড। এটি ছোট মনে হতে পারে, কিন্তু এটি যোগ হয়।

মেনু লোড করুন: ৯০ms। রেস্তোরাঁর তালিকা লোড করুন: ৮০ms। রেস্তোরাঁর ফটো লোড করুন: ২০০ms (ইমেজ বড়)। একজন ব্যবহারকারী অর্ডার দেওয়ার আগে মোট সময়: একটি ভালো connection-এ আধা সেকেন্ডেরও বেশি।

"Physics-টা সমস্যা," Leo বলল। "সার্ভার Oregon-এ। বৃদ্ধি East Coast-এ — এবং São Paulo-তে।"

"তাহলে সার্ভার East Coast-এ সরান," Tom বলল।

"সেটা অর্থ খরচ করে।"

"মাসে এর খরচ কত?" Tom জিজ্ঞেস করল।

"us-east-1-এ আমাদের অবকাঠামোর একটি পূর্ণ duplicate চালানো? সম্ভবত আমাদের বর্তমান খরচের তিনগুণ। এবং এটি একটি সম্পূর্ণ নতুন সমস্যা তৈরি করে: West Coast ডেটাবেস এবং East Coast ডেটাবেস sync-এ রাখা।"

Priya তার laptop থেকে মাথা তুলল। "অথবা আমরা সার্ভার সরাই না। আমরা *content* সরাই।"

Maya মাথা তুলল। "পার্থক্য কী? Content যদি একটি সার্ভারে থাকে, এবং সার্ভার Oregon-এ থাকে, content Oregon-এ।"

"একটি page যা deliver করে তার বেশিরভাগ static," Priya বলল। "ইমেজ, stylesheet, JavaScript ফাইল, ফন্ট। সেগুলি প্রতিটি ব্যবহারকারীর জন্য একই। সেগুলি ডেটাবেস থেকে আসে না। সেগুলি S3-তে থাকে। এবং S3 object যেকোনো জায়গা থেকে পরিবেশন করা যায়।"

"তাহলে আমরা সেগুলি ব্যবহারকারীদের কাছাকাছি সার্ভারে copy করি?"

"আমরা একটি পরিষেবাকে আমাদের জন্য সেটা পরিচালনা করতে দিই। একটি source of truth। যেখানে দরকার সর্বত্র copy।"

Tom ইতিমধ্যে pricing page খুলেছিল। Priya ব্যাখ্যা শেষ করার আগে সে গণনা করছিল।

**Pre-Stocked Warehouse উপমা**

Amazon retailer কল্পনা করুন, cloud company নয়। তাদের একটি location-এ প্রতিটি product সহ একটি বিশাল warehouse আছে। তারা প্রতিটি order সেই একটি warehouse থেকে ship করলে, দূরবর্তী শহরের গ্রাহকরা দিনের পর দিন অপেক্ষা করত।

পরিবর্তে, Amazon-এর বড় জনসংখ্যা কেন্দ্রের কাছাকাছি fulfillment center আছে। যখন একটি product জনপ্রিয়, তারা সেই local warehouse আগে থেকে stock করে। Seattle-র একজন গ্রাহক একটি বই order করলে, এটি local fulfillment center থেকে ship হয় — দেশের ওপার থেকে নয়।

এটি একটি **Content Delivery Network (CDN)**: ভৌগোলিকভাবে বিতরণ করা সার্ভারের একটি network যা আপনার content-এর copy আপনার ব্যবহারকারীদের কাছাকাছি cache করে।

Boston-এর একজন ব্যবহারকারী আপনার homepage request করলে, CDN Boston-এর একটি সার্ভার থেকে এটি পরিবেশন করে। Oregon থেকে নয়। request কখনো দেশ অতিক্রম করে না।

**CloudFront-এর সাথে পরিচয়**

Amazon CloudFront হলো AWS-এর CDN। এটি **edge location**-এর একটি global network-এর মাধ্যমে কাজ করে — বিশ্বজুড়ে শহরে অবস্থিত caching server। এই লেখার সময়, 100+ শহরে 750টিরও বেশি point of presence আছে।

আপনি CloudFront configure করার সময়, আপনি একটি **origin** নির্দিষ্ট করেন: আপনার প্রকৃত content-এর উৎস। আপনার origin হতে পারে:

- একটি S3 bucket (static file: ইমেজ, CSS, JavaScript, PDF)
- একটি Application Load Balancer (আপনার অ্যাপ্লিকেশন থেকে dynamic content)
- একটি EC2 instance
- ইন্টারনেটের যেকোনো জায়গায় একটি HTTP server

CloudFront আপনার origin-এর সামনে বসে। অনুরোধগুলি নিকটতম edge location-এ আসে। Edge-এ content cached থাকলে, এটি তাৎক্ষণিকভাবে return করে। না থাকলে (একটি *cache miss*), এটি আপনার origin থেকে fetch করে, cache করে এবং return করে।

**CloudFront Caching কীভাবে কাজ করে**

যেকোনো piece of content-এর প্রথম অনুরোধ সবসময় একটি cache miss — এটি origin-এ যায়। প্রতিটি পরবর্তী অনুরোধ edge location-এ cache hit করে।

Nimbus-এর জন্য, মেনু ফটো নিখুঁত CloudFront candidate। রেস্তোরাঁর ফটো বিরল ঘটনায় পরিবর্তিত হয় (হয়তো রেস্তোরাঁ তাদের profile আপডেট করলে)। CloudFront-এর সাথে:

১. Boston-এর একজন ব্যবহারকারী `images.eatnimbus.com/restaurant-047/photo.jpg` request করে
২. CloudFront Boston-এর edge location check করে — এখনো cached নয় (cache miss)
৩. CloudFront us-west-2-এ S3 থেকে fetch করে (~৮০ms)
৪. CloudFront Boston edge location-এ ফটো সংরক্ষণ করে
৫. Boston-এর পরবর্তী ব্যবহারকারী একই ফটো request করে
৬. CloudFront local edge cache থেকে পরিবেশন করে (~৫ms)

প্রথম request-এর জন্য একই ৮০ms penalty। কিন্তু একই শহর থেকে হাজারতম request হলো ৫ মিলিসেকেন্ড।

CloudFront-এ **Cache-Control header** এবং **TTL setting** নির্ধারণ করে কতক্ষণ edge-এ content cached থাকে। Image file ঘণ্টা বা দিনের জন্য cached হতে পারে। HTML page (যেগুলি প্রায়ই পরিবর্তিত হয়) মিনিট বা সেকেন্ডের জন্য cached হতে পারে।

আপনি হয়তো ভাবছেন: একটি CDN ব্যবহার করার পরিবর্তে কেন পুরো অ্যাপ্লিকেশন একাধিক region-এ host করব না? ডেটা যদি Oregon-এ থাকে, কেন New York, Tokyo এবং São Paulo-তে একটি পূর্ণ copy রাখব না? আপনি পারেন। কিন্তু এর মানে একাধিক ডেটাবেস synchronized রাখা, একসাথে region জুড়ে deployment পরিচালনা, split-brain দৃশ্যকল্প সামলানো যেখানে region-গুলি ভিন্নমত পোষণ করে। Static এবং semi-static content-এর জন্য একটি CDN অনেক সহজ উত্তর: একটি origin, edge-এ অনেক cached copy। আপনি শুধু তখনই multi-region জটিলতা যোগ করেন যখন আপনার সত্যিই ব্যবহারকারীর কাছে compute বা database operation দরকার — বেশিরভাগ content-এর জন্য, edge caching যথেষ্ট।

"দাঁড়াও — কিন্তু আমরা *কেন* এভাবে করব?" Maya জিজ্ঞেস করল। "শুধু Oregon-এ একটি বড় ElastiCache cluster যোগ করার পরিবর্তে edge-এ cache কেন রাখব?"

"কারণ physics-টা এখনো সমস্যা," Priya বলল। "এমনকি Oregon যদি এক মিলিসেকেন্ডে সাড়া দেয়, সেই response-কে এখনো Boston-এ ভ্রমণ করতে হবে। Round-trip time ন্যূনতম 70 মিলিসেকেন্ড — আলোর গতি আমাদের সার্ভার কত দ্রুত তা পরোয়া করে না। Edge caching উত্তরটিকে প্রশ্নের কাছাকাছি সরায়।"

**Dynamic Content: Caching-এর চেয়ে বেশি CloudFront**

"কিন্তু আমাদের API response সম্পর্কে কী?" Leo জিজ্ঞেস করল। "সেগুলি dynamic — ব্যবহারকারী প্রতি, request প্রতি পরিবর্তিত হয়। আপনি একটি order history page cache করতে পারেন না।"

সত্য। কিন্তু CloudFront এখনো dynamic content-এ সাহায্য করে।

এমনকি content cache না হলেও, CloudFront request edge location থেকে AWS-এর private backbone network-এর মাধ্যমে origin-এ route করে — বৈশ্বিকভাবে AWS অবকাঠামো সংযোগকারী high-speed fiber। এটি public internet-এ routing-এর চেয়ে দ্রুত এবং আরো নির্ভরযোগ্য, যেখানে ট্রাফিক একাধিক carrier-এর মাধ্যমে bounce করতে পারে।

ফলাফল: dynamic request এখনো public internet-এ সরাসরি origin-এ যাওয়ার চেয়ে CloudFront-এর মাধ্যমে ২০-৪০% দ্রুত। Caching-এর কারণে নয়, বরং network path-এর কারণে।

"এটা মিলছে না," Maya বলল। "API response যদি এখনো Oregon থেকে edge-এ এবং তারপর Boston-এ ভ্রমণ করতে হয়, এটা Oregon থেকে সরাসরি Boston-এ যাওয়ার চেয়ে কীভাবে দ্রুত?"

"দুটি কারণ," Priya বলল। "প্রথম, AWS-এর private backbone public internet-এর চেয়ে দ্রুত এবং আরো নির্ভরযোগ্য। Public internet ট্রাফিক একাধিক carrier-এর মাধ্যমে route করে, প্রতিটি তার নিজস্ব latency এবং পরিবর্তনশীলতা যোগ করে। Backbone হলো সরাসরি, low-latency fiber। দ্বিতীয়, SSL termination edge-এ হয়। ব্যবহারকারী নিকটতম CloudFront edge location-এ একটি TLS connection স্থাপন করে — handshake দ্রুত। CloudFront তারপর origin-এ একটি persistent, pre-established connection রাখে। একটি দীর্ঘ-দূরত্বের connection-এর পরিবর্তে দুটি স্বল্প-দূরত্বের connection।"

"তাহলে non-cached content-এর জন্যও, CloudFront connection overhead থেকে সময় কমায়," Leo বলল।

"সাধারণত দশ থেকে চল্লিশ শতাংশ। Caching-এর মতো নাটকীয় নয়। কিন্তু বাস্তব।"

উপরন্তু, CloudFront প্রদান করে:

**SSL/TLS termination**: CloudFront edge-এ HTTPS সামলায়। ব্যবহারকারী এবং CloudFront-এর মধ্যে connection encrypted। CloudFront অভ্যন্তরীণভাবে HTTP-এর মাধ্যমে আপনার origin-এ connect করতে পারে (origin লোড কমিয়ে) বা HTTPS (end-to-end encryption-এর জন্য)।

**DDoS protection**: CloudFront AWS Shield Standard-এর সাথে integrated। শত শত edge location জুড়ে বিতরণ করা ট্রাফিক মানে আক্রমণ আপনার origin-এ চাপ দেওয়ার পরিবর্তে edge-এ absorbed হয়।

**Geo-restriction**: নির্দিষ্ট দেশ থেকে অ্যাক্সেস block করুন। যদি Nimbus শুধুমাত্র নির্দিষ্ট বাজারে পরিচালনার license পায়, CloudFront request কখনো আপনার সার্ভারে পৌঁছানোর আগে edge-এ এটি enforce করতে পারে।

**আর কেউ যদি CDN-এর মাধ্যমে ভাঙার চেষ্টা করে?** Priya জিজ্ঞেস করল। "Cache poisoning — কেউ যদি edge cache-এ খারাপ content inject করতে পরিচালনা করে?"

"CloudFront-এর cache key নিয়ন্ত্রণ আছে," Leo বলল। "আপনি ঠিক সংজ্ঞায়িত করেন কোন attribute নির্ধারণ করে দুটি request একই cached response পায় কিনা। Header, query string, cookie। একজন আক্রমণকারী সঠিক cache key না মিলিয়ে একটি ভিন্ন cached response inject করতে পারে না।"

"এবং Origin Access Control মানে S3 bucket এমন কিছু পরিবেশন করবে না যা CloudFront-এর মাধ্যমে আসে না," Priya বলল। "দুটির পরিবর্তে একটি attack surface।"

**CloudFront Behavior: Fine-Grained Caching নিয়ম**

একটি CloudFront distribution-এ একাধিক **behavior** থাকতে পারে — URL pattern-এর উপর ভিত্তি করে routing নিয়ম।

Nimbus-এর জন্য:

- `/images/*` → ৭ দিনের জন্য edge-এ cache করুন (ফটো প্রায়ই পরিবর্তিত হয় না)
- `/static/*` → ৩০ দিনের জন্য edge-এ cache করুন (versioned filename সহ CSS এবং JavaScript)
- `/api/*` → cache করবেন না; সরাসরি load balancer-এ forward করুন
- `/*` → ৫ মিনিটের জন্য cache করুন (HTML page)

এটি CloudFront-কে smart করতে দেয়: যা stable তা aggressively cache করুন, যা dynamic তা pass through করুন।

Behavior সবচেয়ে নির্দিষ্ট থেকে সবচেয়ে কম নির্দিষ্ট পর্যন্ত মিলানো হয়। `/images/hero.jpg` `/*`-এর সাথে মেলার আগে `/images/*`-এর সাথে মেলে। নিচের catch-all `/*` হলো ডিফল্ট — এটি এমন যেকোনো কিছুতে প্রযোজ্য যা একটি আরো নির্দিষ্ট pattern-এর সাথে মেলে না।

"আমরা যদি authenticated বনাম unauthenticated ব্যবহারকারীদের জন্য ভিন্ন caching চাই?" Priya জিজ্ঞেস করল। "একজন ব্যবহারকারী লগ ইন কিনা তার উপর নির্ভর করে একই URL ভিন্ন content return করতে পারে।"

"তাহলে আপনি cache key-তে session cookie অন্তর্ভুক্ত করেন," Leo বলল। "কিন্তু এর মানে প্রতিটি লগ-ইন ব্যবহারকারী তার নিজস্ব cache entry পায়। Authenticated content-এর জন্য আপনার hit rate ধসে পড়ে।"

"এজন্যই আপনি URL স্তরে authenticated content public content থেকে আলাদা করেন," Priya বলল। "Authentication প্রয়োজনীয় যেকোনো কিছু `/app/*`-এ যায় এবং cached হয় না। Public content `/browse/*`-এ যায় এবং aggressively cached হয়। একটি পরিষ্কার boundary।"

শিক্ষা: আপনার URL structure যখন caching অভিপ্রায় প্রতিফলিত করে তখন CloudFront সবচেয়ে ভালো কাজ করে। সম্পূর্ণ public, static ডেটায় নির্দেশকারী URL personalized, dynamic ডেটা return করা URL থেকে আলাদা দেখাতে হবে। সেগুলি যদি CloudFront-এর কাছে একই দেখায়, হয় cache ভাঙা বা ভুল content পরিবেশিত হয়।

Leo একটি weekend-এ Nimbus URL scheme পুনর্গঠন করল। Browsing endpoint `/browse/`-এ সরল। API endpoint `/api/`-তে সরল। Authenticated app UI `/app/`-এ সরল। তিনটি behavior, তিনটি পরিষ্কার caching policy, শূন্য অস্পষ্টতা।

"এটা একটু refactor," সে বলল।

"এটা সঠিক structure," Priya বলল। "আপনার শেষ পর্যন্ত এটা দরকার হত।"

**Origin Access Control: CloudFront দিয়ে S3 সুরক্ষিত করা**

আপনার S3 bucket-এ private content থাকলে যা শুধুমাত্র CloudFront-এর মাধ্যমে পরিবেশন হওয়া উচিত (সরাসরি নয়), আপনি **Origin Access Control (OAC)** ব্যবহার করতে পারেন নিশ্চিত করতে যে S3 CloudFront থেকে না আসা request reject করে।

এভাবে:

- `d1234abcd.cloudfront.net/image.jpg` → পরিবেশিত (CloudFront-এর অনুমতি আছে)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Blocked (সরাসরি S3 অ্যাক্সেস অস্বীকৃত)

আপনার content শুধুমাত্র আপনার distribution-এর মাধ্যমে পৌঁছানো যায়, আপনার cache নিয়ম এবং নিরাপত্তা সেটিং প্রয়োগ সহ।

---

**Stale Photo ঘটনা**

Restaurant 112 — Eastside-এর Colombian জায়গা — এক বৃহস্পতিবার সকালে support-এ email করল। একজন গ্রাহক অভিযোগ করেছিল যে রেস্তোরাঁর hero ফটো এখনো পুরানো storefront দেখাচ্ছে, যদিও মালিক দুই দিন আগে একটি নতুন upload করেছিলেন।

Leo CloudFront distribution setting টানল।

`/images/*`-এর behavior-এর একটি TTL ছিল সাত দিন। রেস্তোরাঁ অংশীদার portal দুই দিন আগে একটি নতুন ফটো upload করেছিল, একই S3 key path-এ ফাইল প্রতিস্থাপন করে: `restaurant-112/hero.jpg`। পুরানো ফাইল S3 থেকে চলে গিয়েছিল। কিন্তু CloudFront এখনো প্রতিটি edge location থেকে এটি cache থেকে পরিবেশন করছিল যা গত সাত দিনে এটি fetch করেছিল।

"আমরা origin-এ content পরিবর্তন করেছি," Leo বলল। "কিন্তু CloudFront তা জানে না। এর একটি cached copy আছে এবং এটি সাত দিন check করবে না।"

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" সে ধরে নিয়েছিল S3 ফাইল প্রতিস্থাপন করলে স্বয়ংক্রিয়ভাবে CloudFront cache refresh হবে। তা হয় না। CloudFront-এর একটি S3 key-তে content পরিবর্তিত হয়েছে তা detect করার কোনো mechanism নেই — এটি TTL expire না হওয়া পর্যন্ত যা cache করেছে তাই পরিবেশন করে।

দুটি বিকল্প:

**বিকল্প এক: Invalidation।** CloudFront-কে `/images/restaurant-112/hero.jpg`-এর জন্য একটি invalidation request পাঠান। CloudFront সমস্ত edge location-এ সেই path stale চিহ্নিত করে। সেই path-এর পরবর্তী request S3 থেকে fresh content fetch করে। খরচ: প্রতি মাসে প্রথম 1,000টি invalidation path প্রতিটি বিনামূল্যে; এর বাইরে, *প্রতি path* $0.005। একটি ফাইলের জন্য, বিনামূল্যে। একটি bulk update-এর সময় হাজার হাজার ফাইল invalidate করার জন্য, খরচ যোগ হয়।

**বিকল্প দুই: Versioned file name।** `hero.jpg`-এর পরিবর্তে, ফাইলের নাম দিন `hero-v2.jpg`। ডেটাবেসে reference আপডেট করুন। CloudFront-এর `hero-v2.jpg`-এর জন্য কোনো cached entry নেই — প্রথম request এটি S3 থেকে fetch করে, এবং ব্যবহারকারীরা তাৎক্ষণিকভাবে এটি দেখে। পুরানো `hero.jpg` cached থাকে কিন্তু আর কোথাও reference করা হয় না। এটি সাত দিন পরে স্বাভাবিকভাবে expire হয়।

"User-uploaded content-এর জন্য," Priya বলল, "versioned নাম সঠিক pattern। filename-এ একটি hash বা timestamp যোগ করুন। প্রতিটি নতুন upload একটি নতুন cache entry। কোনো invalidation খরচ নেই, কোনো stale content নেই।"

Leo partner portal আপডেট করল। নতুন upload এখন `hero-{timestamp}.jpg` হিসেবে সংরক্ষিত হবে। ডেটাবেস record নতুন path দিয়ে আপডেট হলো। পুরানো cached path অপ্রাসঙ্গিক ছিল।

"Deployment-এর ক্ষেত্রে কী?" Maya জিজ্ঞেস করল। "যখন আমরা অ্যাপের একটি নতুন সংস্করণ push করি এবং JavaScript পরিবর্তিত হয়?"

"একই নীতি," Priya বলল। "Webpack-এর মতো build tool hashed filename output করে: `app.a3b9c2d4.js`। একটি নতুন সংস্করণ deploy করুন এবং hash পরিবর্তিত হয়: `app.f7e1b3c5.js`। CloudFront উভয়ই cache থেকে পরিবেশন করে — পুরানো ব্যবহারকারীরা পুরানো ফাইল পায়, নতুন ব্যবহারকারীরা নতুন ফাইল পায়। কোনো invalidation নেই, কোনো coordination সমস্যা নেই।"

"HTML page বর্তমান hash reference করে," Leo বলল। "তাই নতুন ব্যবহারকারীরা নতুন JS hash সহ নতুন HTML পায়, এবং CDN সঠিক ফাইল পরিবেশন করে।"

"Standard practice," Priya নিশ্চিত করল।

---

**প্রকৃত সংখ্যা সহ Latency**

Tom তিনটি শহর থেকে latency measurement চালাচ্ছিল।

| অবস্থান | CloudFront ছাড়া | CloudFront সহ | উন্নতি |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| New York | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tokyo | 260ms | 28ms | 89% |

"physics সমস্যা যেখানে সবচেয়ে খারাপ সেখানে উন্নতি সবচেয়ে বড়," Tom লক্ষ্য করল। "São Paulo থেকে Oregon দুইশত মিলিসেকেন্ডেরও বেশি। সেটা এক সেকেন্ডের চার ভাগের একের বেশি, শুধু কথোপকথন শুরু করতে।"

"এবং দ্বিতীয়বার content কখনো São Paulo-তে পৌঁছায় না," Leo বলল। "São Paulo-র প্রথম ব্যবহারকারী Oregon থেকে fetch করে এবং এটি locally cache করে। এর পরের প্রতিটি ব্যবহারকারী পঁয়ত্রিশ মিলিসেকেন্ড পায়।"

"São Paulo-র প্রথম ব্যবহারকারী খরচ বহন করে," Tom বলল। "বাকি সবাই উপকৃত হয়।"

"এভাবেই CDN কাজ করে," Priya বলল। "প্রথম request cache populate করে। এর পরে প্রতিটি cache hit প্রায় বিনামূল্যে।"

Global product-এর জন্য তাৎপর্য উল্লেখযোগ্য। CloudFront ছাড়া, Tokyo-র একজন ব্যবহারকারী আপনার hero image-এর জন্য 260 মিলিসেকেন্ড অপেক্ষা করছে physics-এর কারণে — fiber optic cable এবং আলোর গতি। CloudFront-এর সাথে, আপনি সেই image-এর একটি copy Tokyo-তে রাখেন, এবং physics সমস্যা মূলত অদৃশ্য হয়ে যায়।

---

**একাধিক Origin: ALB এবং S3 একসাথে**

"আমাদের ইমেজ S3-তে এবং আমাদের API load balancer-এ আছে," Maya বলল। "আমাদের কি দুটি CloudFront distribution দরকার?"

"না," Leo বলল। "একটি distribution, একাধিক origin।"

একটি একক CloudFront distribution ভিন্ন URL pattern ভিন্ন origin-এ route করতে পারে। এটি হলো multi-origin pattern:

```
eatnimbus.com/*         → Origin: ALB in us-west-2 (dynamic content)
eatnimbus.com/images/*  → Origin: S3 bucket (static images)
eatnimbus.com/static/*  → Origin: S3 bucket (CSS, JS, fonts)
```

CloudFront নির্দিষ্টতার ক্রম অনুযায়ী behavior মূল্যায়ন করে। `/images/hero.jpg`-এ একটি request `/images/*` behavior-এর সাথে মেলে এবং S3-তে যায়। `/api/orders`-এ একটি request `/*` catch-all-এর সাথে মেলে এবং ALB-তে যায়।

সুবিধা: একটি domain, একটি SSL certificate, একটি CloudFront distribution, একাধিক backend। ব্যবহারকারীরা একটি unified domain দেখে। তাদের কাছে routing অদৃশ্য।

একটি operational বিস্তারিত যা একটি নিশ্চিত পরীক্ষার তথ্যও: সেই SSL certificate AWS Certificate Manager (ACM) থেকে আসে, এবং **CloudFront ব্যবহৃত একটি certificate অবশ্যই `us-east-1`-এ request বা import করতে হবে** — আপনার origin যেখানেই থাকুক না কেন। CloudFront হলো একটি global পরিষেবা যার control plane us-east-1-এ থাকে; us-west-2-তে থাকা একটি certificate কেবল distribution-এর dropdown-এ দেখা যাবে না। (ALB-এর মতো regional পরিষেবার জন্য, certificate ALB-এর নিজস্ব region-এ থাকে।)

"এবং ALB public-facing নয়?" Priya জিজ্ঞেস করল।

"শুধুমাত্র CloudFront ALB-এর সাথে কথা বলে," Leo বলল। "আমরা ALB-এর security group CloudFront-এর managed prefix list-এ সীমাবদ্ধ করি। ইন্টারনেট থেকে ALB-তে সরাসরি connection blocked।"

"তাহলে অ্যাপ্লিকেশনে পৌঁছানোর একমাত্র উপায় হলো CloudFront-এর মাধ্যমে।"

"যার মানে WAF নিয়ম, SSL termination এবং DDoS protection আমাদের কাছে পৌঁছানোর আগে সমস্ত ট্রাফিকে প্রযোজ্য।"

---

**CloudFront Functions বনাম Lambda@Edge**

"edge-এ একটি URL rewrite করতে হলে আমরা কী করব তা নিয়ে আমরা ভেবেছি কি?" Priya জিজ্ঞেস করল। "অথবা প্রতিটি response-এ একটি security header যোগ করতে?"

"আমরা কি অ্যাপ্লিকেশনে এটা করতে পারি না?" Leo জিজ্ঞেস করল।

"আমরা পারি। কিন্তু এটি যদি edge-এ ঘটে — CloudFront cache থেকে পরিবেশন করার আগে — আমরা origin-এ একটি round trip সাশ্রয় করি।"

CloudFront edge-এ code চালানোর জন্য দুটি mechanism সমর্থন করে:

**CloudFront Functions** হলো lightweight JavaScript function যা প্রতিটি edge location-এ চলে। সেগুলি sub-millisecond সময়ে execute হয়, প্রতি সেকেন্ডে লক্ষ লক্ষ request সামলায়, এবং সহজ transformation-এর জন্য ডিজাইন করা: URL rewrite, header manipulation, query string normalization, সহজ redirect। সেগুলি viewer request এবং viewer response-এ চলতে পারে (cache-এর আগে এবং পরে, ব্যবহারকারীর দৃষ্টিকোণ থেকে)। সেগুলি network call করতে পারে না। খরচ: প্রতি মিলিয়ন invocation-এ $0.10।

**Lambda@Edge** CloudFront-এর regional edge location-এ প্রকৃত Lambda function চালায় (প্রতিটি pop নয়, কিন্তু বিশ্বব্যাপী কয়েক ডজন প্রধান)। Lambda@Edge network call করতে পারে, ডেটাবেস অ্যাক্সেস করতে পারে, dynamic response তৈরি করতে পারে, জটিল authentication logic করতে পারে। এটি viewer request, origin request, origin response এবং viewer response-এ চলে — request lifecycle-এ আপনাকে চারটি hard intervention point দেয়। খরচ: CloudFront Functions-এর চেয়ে বেশি, request এবং duration অনুযায়ী bill করা।

Mental model:

| ব্যবহারের ক্ষেত্র | সরঞ্জাম |
|---|---|
| `/old-path`-কে `/new-path`-এ rewrite করুন | CloudFront Functions |
| `Strict-Transport-Security` header যোগ করুন | CloudFront Functions |
| Cache lookup-এর আগে query string normalize করুন | CloudFront Functions |
| A/B test: viewer request-এ একটি test cookie assign করুন | CloudFront Functions |
| A/B test: ব্যবহারকারীদের ১০% একটি ভিন্ন origin-এ route করুন | Lambda@Edge (origin request — CloudFront Functions origin পরিবর্তন করতে পারে না) |
| একটি JWT token authenticate করুন (crypto library প্রয়োজন) | Lambda@Edge |
| edge-এ একটি ডেটাবেস থেকে personalized content fetch করুন | Lambda@Edge |
| edge-এ on-demand একটি image thumbnail তৈরি করুন | Lambda@Edge |

Nimbus-এর জন্য: তারা প্রতিটি response-এ security header যোগ করতে একটি CloudFront Function ব্যবহার করল — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`। দুই ডজন লাইন JavaScript। Sub-millisecond execution। কোনো origin roundtrip দরকার নেই।

"একজন junior engineer-কে header ব্যাখ্যা করতে," Leo বলল, "function লেখার চেয়ে বেশি সময় লাগত।"

---

**Price Class: কোন Edge Location বেছে নেওয়া**

"এটা স্কেলে কত খরচ করে তা নিয়ে আমরা ভেবেছি কি?" Tom জিজ্ঞেস করল, CloudFront pricing page scroll করে।

"মাসে এর খরচ কত?" এখানে প্রযুক্তিগতভাবে দুটি প্রশ্ন ছিল। প্রথম: CloudFront কত charge করে? দ্বিতীয়: আপনার কি বিশ্বের প্রতিটি edge location দরকার?

CloudFront ডেটা transfer pricing region অনুযায়ী পরিবর্তিত হয়। North America এবং Europe-এর edge location থেকে পরিবেশিত ট্রাফিক সবচেয়ে সস্তা। South America, Asia Pacific, Australia এবং India থেকে ট্রাফিক বেশি ব্যয়বহুল — কারণ সেখানে অবকাঠামোর খরচ বেশি।

AWS আপনাকে আপনার distribution-এর জন্য একটি **price class** বেছে নিতে দেয়:

- **Price Class All**: বিশ্বব্যাপী সমস্ত edge location ব্যবহার করে। সর্বত্র সর্বোত্তম পারফরম্যান্স। North America এবং Europe-এর বাইরের region-এর জন্য সর্বোচ্চ ডেটা transfer খরচ।
- **Price Class 200**: বেশিরভাগ edge location ব্যবহার করে (North America, Europe, Asia, Middle East, Africa)। সবচেয়ে ব্যয়বহুল South American এবং কিছু Oceania location বাদ দেয়।
- **Price Class 100**: শুধুমাত্র North America এবং Europe edge location ব্যবহার করে। সবচেয়ে সস্তা। São Paulo, Tokyo এবং Sydney-র ব্যবহারকারীরা এখনো পরিবেশিত হয় — কিন্তু একটি North American বা European edge থেকে, তাদের নিকটতম থেকে নয়।

"তাহলে আমরা যদি Price Class 100 বেছে নিই," Tom বলল, "São Paulo-র একজন ব্যবহারকারী পরিবেশিত হয়... Miami থেকে? New York থেকে?"

"যেখানে নিকটতম অন্তর্ভুক্ত edge। হয়তো Oregon-এ সরাসরি 230 মিলিসেকেন্ডের পরিবর্তে 50 মিলিসেকেন্ড," Priya বলল। "এখনো একটি অর্থবহ উন্নতি। Price Class All-এর মতো ভালো নয়।"

"এবং খরচের পার্থক্য?"

"South America থেকে ডেটা transfer North America-র খরচের প্রায় দ্বিগুণ। ট্রাফিক তৈরি করতে থাকা একটি startup-এর জন্য, Price Class 200 একটি যুক্তিসঙ্গত সমঝোতা — আপনি Price Class All-এর চেয়ে কম খরচে Asia এবং Europe পান, এবং আপনার বেশিরভাগ ব্যবহারকারী covered।"

"200 দিয়ে শুরু করুন," Tom বলল। "যখন আমাদের প্রতিটি region থেকে প্রকৃত ট্রাফিক ডেটা থাকবে, আমরা সিদ্ধান্ত নেব All মূল্যবান কিনা।"

সঠিক price class আপনার ব্যবহারকারীরা কোথায় তার উপর নির্ভর করে। আপনার যদি South America-তে কোনো ব্যবহারকারী না থাকে, South American edge location-এর জন্য পেমেন্ট করা বিশুদ্ধ খরচ। আপনার রাজস্বের বিশ শতাংশ যদি Brazil থেকে আসে, Price Class All থেকে পারফরম্যান্স উন্নতি সম্ভবত নিজের খরচ পুষিয়ে দেয়।

---

**Cache Key Design**

"দুজন ভিন্ন ব্যবহারকারী একই URL request করে কিন্তু ভিন্ন content পেলে কী হয় তা নিয়ে আমরা ভেবেছি কি?" Priya জিজ্ঞেস করল।

Leo এটি নিয়ে ভাবল। "Personalized page।"

"অথবা language-specific page। অথবা mobile বনাম desktop সংস্করণ। অথবা cookie দ্বারা পরিবর্তিত page।"

ডিফল্টরূপে, CloudFront শুধুমাত্র URL path-কে cache key হিসেবে ব্যবহার করে। `/browse`-এ দুটি request একই cached response পায়, ব্যবহারকারীর language preference, device type, বা session cookie নির্বিশেষে।

আপনার অ্যাপ্লিকেশন যদি query string, header, বা cookie-র উপর ভিত্তি করে ভিন্ন content পরিবেশন করে — এবং আপনি চান CloudFront সেই variation আলাদাভাবে cache করুক — আপনাকে সেই attribute **cache key**-তে অন্তর্ভুক্ত করতে হবে।

Nimbus-এর জন্য:

- `/browse?city=miami` `/browse?city=boston` থেকে আলাদাভাবে cache হওয়া উচিত — ভিন্ন রেস্তোরাঁ তালিকা। Cache key-তে query string অন্তর্ভুক্ত করুন।
- Mobile ব্যবহারকারীরা একটি ভিন্ন layout পেতে পারে। Cache key-তে একটি normalized device type (`User-Agent` header থেকে প্রাপ্ত) অন্তর্ভুক্ত করুন।
- `Accept-Language` header নির্ধারণ করে page কোন ভাষায় render হয়। Cache key-তে এটি অন্তর্ভুক্ত করুন।

তবে সাবধান। আপনি যোগ করা প্রতিটি cache key attribute আরো cache variation তৈরি করে। আপনি যদি সম্পূর্ণ `User-Agent` string অন্তর্ভুক্ত করেন (যা browser version, OS version এবং patch level অনুযায়ী পরিবর্তিত হয়), আপনি কার্যকরভাবে caching ভেঙে ফেলেন — প্রতিটি ব্যবহারকারীর সামান্য ভিন্ন User-Agent আছে, তাই প্রতিটি request একটি cache miss।

শৃঙ্খলা: caching-এর আগে normalize করুন। "iPhone 15 Pro Safari 17.4.1"-কে "mobile"-এ কমিয়ে দিন। সমস্ত accepted language-কে আপনি আসলে যে দুই বা তিনটি সমর্থন করেন তাতে কমিয়ে দিন। শুধু যা প্রকৃতপক্ষে response পরিবর্তন করে তাই অন্তর্ভুক্ত করুন।

"আপনার cache key যত বেশি নির্দিষ্ট," Leo বলল, "আপনার hit rate তত খারাপ।"

"এবং যত বেশি generic," Priya বলল, "আপনি ভুল ব্যবহারকারীকে ভুল content পরিবেশন করার সম্ভাবনা তত বেশি।"

"তাহলে cache key design caching-এর অন্য সবকিছুর মতো একই tradeoff।"

"হ্যাঁ," Priya বলল। "এটা সবসময় একই tradeoff।"

---

## যখন CloudFront উত্তর নয়: Global Accelerator

Nimbus mobile অ্যাপের একটি feature ছিল যা Tom দুই মাস ধরে নীরবে দেখছিল: real-time order status। একজন গ্রাহক একটি অর্ডার দিলে, অ্যাপ WebSocket-এর মাধ্যমে সংযুক্ত থাকত এবং রান্নাঘরের order management screen real-time-এ আপডেট হত। কোনো refresh button নেই। কোনো polling নেই। একটি live connection যা রান্নাঘর একটি item ready চিহ্নিত করার মুহূর্তে আপডেট push করত।

"এটা WebSocket ব্যবহার করছে," Tom বলল, এক সকালে latency metrics দেখে। "São Paulo-র ব্যবহারকারীদের কাছ থেকে, connection establishment 340 মিলিসেকেন্ড নিচ্ছে। কিছু একটা ঠিক নেই।"

"CloudFront WebSocket connection cache করে না," Leo বলল। "এটি সেগুলি proxy করে — origin-এ pass through করে। কোনো caching সুবিধা নেই।"

"ঠিক। তাহলে এটা এখনো ধীর কেন?"

"কারণ WebSocket এখনো São Paulo থেকে public internet-এ Oregon-এর আমাদের সার্ভারে ভ্রমণ করছে," Leo বলল। "CloudFront সাহায্য করে, কারণ এটি edge-এ TLS handshake terminate করে এবং তারপর origin-এ AWS-এর backbone ব্যবহার করে। কিন্তু একটি persistent WebSocket connection-এর জন্য, এটা এখনো একটি দীর্ঘ-দূরত্বের connection।"

"ঠিক এই সমস্যার জন্য একটি পরিষেবা আছে," Priya বলল।

**AWS Global Accelerator** একটি CDN নয়। এটি কিছুই cache করে না। এটি edge location থেকে content পরিবেশন করে না। এটি যা করে তা হলো আপনাকে দুটি static Anycast IP address দেয় যা একই সাথে সমস্ত AWS edge location থেকে বিশ্বব্যাপী advertise করা হয় — এবং তারপর আপনার ব্যবহারকারীদের ট্রাফিক public internet-এর পরিবর্তে AWS-এর private backbone-এ route করে।

São Paulo-র একজন গ্রাহক Nimbus অ্যাপ খুললে, তাদের device নিকটতম AWS edge location-এ connect হয় (যা São Paulo-তেই থাকতে পারে)। সেই edge location থেকে, ট্রাফিক public internet-এর পরিবর্তে AWS-এর private, monitored, optimized fiber network-এর মাধ্যমে Oregon-এর Nimbus-এর সার্ভারে ভ্রমণ করে, যেখানে packet অপ্রত্যাশিত carrier এবং routing hop-এর মধ্যে bounce করে।

Public internet latency-র জন্য ডিজাইন করা হয়নি। এটি resilience-এর জন্য ডিজাইন করা — packet যেকোনো উপলব্ধ path নিতে পারে। AWS-এর backbone ভিন্নভাবে ডিজাইন করা: এটি সরাসরি, low-congestion এবং AWS-এর operational নিয়ন্ত্রণে।

Tom পার্থক্য benchmark করল।

| Route | Latency (São Paulo থেকে Oregon) |
|---|---|
| Public internet | 340ms |
| Global Accelerator-এর মাধ্যমে | 180ms |

একটি 47% হ্রাস। Caching থেকে নয় — একটি ভালো network path থেকে।

"তাহলে আমরা সবকিছুর জন্য শুধু CloudFront ব্যবহার করব না কেন?" Maya জিজ্ঞেস করল। "CloudFront ইতিমধ্যে dynamic content-এর জন্য AWS-এর backbone-এর মাধ্যমে route করে।"

"CloudFront শুধুমাত্র HTTP এবং HTTPS," Priya বলল। "WebSocket CloudFront-এর সাথে কাজ করে, কিন্তু শুধুমাত্র HTTP upgrade-এর মাধ্যমে। এবং আমাদের কিছু protocol — IoT sensor data, উদাহরণস্বরূপ — বিশুদ্ধ TCP বা UDP। CloudFront সেগুলি সামলায় না। Global Accelerator protocol-agnostic। TCP, UDP, WebSocket, যাই হোক। এটি HTTP request নয়, packet সরায়।"

আরো একটি পার্থক্য ছিল যা Priya তার security documentation-এ উল্লেখ করল।

"Global Accelerator আমাদের দুটি static Anycast IP দেয়," সে বলল। "সেই IP কখনো পরিবর্তিত হয় না। এর মানে আমরা সেগুলি আমাদের security policy-তে যোগ করতে পারি, partner whitelist-এ যোগ করতে পারি, firewall নিয়মে যোগ করতে পারি। CloudFront-এর IP address সময়ের সাথে পরিবর্তিত হয় — সেগুলি AWS দ্বারা পরিচালিত এবং fixed নয়।"

"Failover সম্পর্কে কী?" Leo জিজ্ঞেস করল।

"তাৎক্ষণিক," Priya বলল। "আমাদের us-west-2 অ্যাপ্লিকেশনের সমস্যা হলে, Global Accelerator 30 সেকেন্ডের কম সময়ে us-east-1-এর একটি backup-এ ট্রাফিক shift করতে পারে — ব্যবহারকারীরা যে IP address-এ connect হচ্ছে তা পরিবর্তন না করে। Route 53-এর মাধ্যমে DNS failover TTL-এর উপর নির্ভর করে 60-300 সেকেন্ড নেয়। Global Accelerator দ্রুত।"

**CloudFront বনাম Global Accelerator — mental model:**

CloudFront caching দ্বারা delivery উন্নত করে। এটি HTTP/HTTPS-এর জন্য নির্মিত এবং সুবিধা সবচেয়ে বড় যখন content ব্যবহারকারীদের কাছাকাছি cache করা যায় — static file, image, JavaScript। Content cache না করা গেলে, CloudFront এখনো backbone routing-এর মাধ্যমে সাহায্য করে, কিন্তু উন্নতি ছোট।

Global Accelerator routing দ্বারা delivery উন্নত করে। এটি কোনো content সরায় না। এটি কিছুই cache করে না। সুবিধা প্রতিটি packet-এ প্রযোজ্য — cached হোক বা না, HTTP হোক বা না, static হোক বা dynamic। দুটি static IP বিশ্বব্যাপী কাজ করে। Failover প্রায়-তাৎক্ষণিক। যে ব্যবহারের ক্ষেত্রে CloudFront যথেষ্ট নয় — real-time WebSocket, UDP-based protocol, non-HTTP ট্রাফিক, fixed IP প্রয়োজনীয় global অ্যাপ্লিকেশন — সেখানে Global Accelerator সঠিক সরঞ্জাম।

Tom real-time order status feature-এর জন্য Global Accelerator endpoint-এ connect করতে Nimbus mobile অ্যাপ আপডেট করল। São Paulo-তে WebSocket connection establishment 340ms থেকে 180ms-এ নামল। রান্নাঘরের আপডেট এখনো তাৎক্ষণিক অনুভব হত — কারণ এখন, North America-র বাইরের ব্যবহারকারীদের জন্য, সেগুলি প্রকৃতপক্ষে ছিল।

## শক্তি এবং সীমাবদ্ধতা

**CloudFront কেন শক্তিশালী**:

- 100+ শহরে 750টিরও বেশি point of presence — বেশিরভাগ ব্যবহারকারী <20ms দূর থেকে content পায়
- প্রথম cache-এর পরে single-digit millisecond-এ static content পরিবেশিত
- Origin লোড উল্লেখযোগ্যভাবে কমায় (repeat ট্রাফিক কখনো আপনার সার্ভারে পৌঁছায় না)
- AWS Shield, WAF এবং Certificate Manager-এর সাথে integrated
- কোনো capacity planning দরকার নেই — CloudFront স্বয়ংক্রিয়ভাবে scale করে
- Multi-origin distribution একটি domain থেকে ভিন্ন path ভিন্ন backend-এ route করে
- CloudFront Functions sub-millisecond latency-তে lightweight edge logic সামলায়

**যেখানে জটিল হয়**:

- Cached content stale হতে পারে — cache invalidate করা অর্থ খরচ করে (প্রতি মাসে প্রথম 1,000 বিনামূল্যে path-এর পরে প্রতি path $0.005)। পরিবর্তে versioned filename ব্যবহার করুন।
- Cache-Control header অবশ্যই origin-এ সঠিকভাবে set করতে হবে — ভুলে stale content হয়
- Dynamic content routing optimization থেকে উপকৃত হয় কিন্তু caching থেকে নয়
- Cache আচরণ debug করা (কোথায় কতক্ষণ কী cached) একাধিক layer বোঝা প্রয়োজন: origin header, CloudFront TTL setting, behavior নিয়ম
- CloudFront-এর মাধ্যমে ডেটা transfer out অর্থ খরচ করে, যদিও standard ডেটা transfer-এর চেয়ে কম
- Cache key design সাবধানে চিন্তা প্রয়োজন — অতিরিক্ত নির্দিষ্ট caching ভাঙে, অতিরিক্ত generic ভুল content পরিবেশন করে

## সারসংক্ষেপ

CloudFront physics পরিবর্তন করেনি। আলো এখনো একই গতিতে ভ্রমণ করে। কিন্তু এটি উত্তরটি কোথায় থাকে তা পরিবর্তন করেছে — এবং বেশিরভাগ ব্যবহারকারীর জন্য, উত্তরটি এখন কয়েকশো-র পরিবর্তে কয়েক মিলিসেকেন্ড দূরে ছিল। Deployment-এর পরে cache hit rate: 83%। এর মানে প্রতি মিলিয়ন request-এর মধ্যে 830,000 কখনো origin সার্ভারে পৌঁছায়নি। São Paulo-র ব্যবহারকারীরা 290 মিলিসেকেন্ড থেকে 35 মিলিসেকেন্ডে গেল। Tokyo-র ব্যবহারকারীরা 260 থেকে 28-এ।

- একটি **CDN** আপনার ব্যবহারকারীদের কাছাকাছি edge location-এ আপনার content-এর copy cache করে — latency এবং origin লোড কমায়।
- **CloudFront** হলো AWS-এর CDN, বিশ্বজুড়ে 750+ point of presence সহ।
- Cache miss **origin** (S3, ALB, EC2) থেকে fetch করে। Cache hit edge থেকে পরিবেশন করে — কয়েকশো মিলিসেকেন্ড নয়, মিলিসেকেন্ড।
- **Behavior** আপনাকে ভিন্ন URL pattern-এর জন্য ভিন্ন caching নিয়ম সেট করতে দেয়। একটি distribution `/images/*` S3 থেকে এবং `/*` একটি ALB থেকে পরিবেশন করতে পারে।
- Dynamic content cached নয়, কিন্তু CloudFront এখনো AWS-এর private backbone network-এর মাধ্যমে পারফরম্যান্স উন্নত করে।
- Invalidation-এর পরিবর্তে versioned filename (যেমন, `hero-v2.jpg`) ব্যবহার করে **stale content এড়ান** — সস্তা এবং আরো নির্ভরযোগ্য।
- **CloudFront Functions** sub-millisecond গতিতে lightweight edge logic সামলায় (header manipulation, URL rewrite)। **Lambda@Edge** network call প্রয়োজনীয় ভারী processing সামলায়।
- **Price class** আপনাকে নিয়ন্ত্রণ করতে দেয় কোন edge location আপনার ট্রাফিক পরিবেশন করে — এবং তাই আপনার ডেটা transfer খরচ।
- **Cache key design** নির্ধারণ করে কোন request attribute আলাদা cached variation তৈরি করে। আরো নির্দিষ্ট key = কম hit rate। কম নির্দিষ্ট = ভুল content পরিবেশনের ঝুঁকি।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৪)*

- **CloudFront + S3**: বৈশ্বিকভাবে static ওয়েবসাইট পরিবেশনের জন্য Classic exam pattern। Origin হিসেবে S3 bucket, CDN হিসেবে CloudFront, সরাসরি S3 অ্যাক্সেস প্রতিরোধ করতে Origin Access Control।
- **Edge location বনাম Region বনাম AZ**: Edge location বেশি সংখ্যক এবং শুধুমাত্র caching/CDN উদ্দেশ্যে বিদ্যমান। এগুলি AZ-এর মতো নয় (যেগুলি আপনার compute চালায়)।
- **Cache invalidation**: একটি `/images/*` invalidation তৈরি করলে CloudFront fresh content fetch করতে বাধ্য হয়। অর্থ খরচ করে — পরীক্ষা cost-effective বিকল্প জিজ্ঞেস করতে পারে: versioned URL (`image-v2.jpg` `image.jpg`-এর পরিবর্তে), যা naturally cache bypass করে।
- **TTL নিয়ন্ত্রণ**: origin-এ `Cache-Control: max-age=3600` একটি ১ ঘণ্টার cache TTL set করে। CloudFront এই header মেনে চলে। Minimum TTL, maximum TTL এবং default TTL-ও distribution behavior-এ set করা যায়।
- **CloudFront Functions বনাম Lambda@Edge**: CloudFront Functions lightweight request/response manipulation-এর জন্য edge-এ চলে (sub-millisecond)। Lambda@Edge ভারী processing-এর জন্য regional edge location-এ আপনার Lambda code চালায়। পরীক্ষা ব্যবহারের ক্ষেত্রের জটিলতা দ্বারা তাদের আলাদা করে। CloudFront Functions network call করতে পারে না; Lambda@Edge পারে।
- **Signed URL এবং Signed Cookie**: CloudFront-এর মাধ্যমে কে content অ্যাক্সেস করতে পারে তা নিয়ন্ত্রণ করুন। Signed URL নির্দিষ্ট file-এ অ্যাক্সেস দেয়; signed cookie একাধিক file-এ অ্যাক্সেস দেয়। পরীক্ষা "paid subscriber content"-এর জন্য এগুলি ব্যবহার করে।
- **Price Class**: পরীক্ষা জিজ্ঞেস করতে পারে একটি global audience বনাম একটি North America/Europe audience-এর জন্য কোন price class বেছে নিতে হবে। Price Class All = সর্বোত্তম পারফরম্যান্স, সর্বোচ্চ খরচ। Price Class 100 = শুধুমাত্র North America এবং Europe, সর্বনিম্ন খরচ।
- **Cache key**: ডিফল্ট cache key হলো URL। Cache key-তে query string, header, বা cookie যোগ করলে আলাদা cached variation তৈরি হয় — কিন্তু cache miss rate বাড়ায়। পরীক্ষা একটি দৃশ্যকল্প উপস্থাপন করতে পারে যেখানে content একটি query parameter দ্বারা পরিবর্তিত হয় এবং caching কীভাবে configure করতে হবে জিজ্ঞেস করে।
- **Origin failover**: CloudFront একটি primary এবং secondary origin সহ একটি origin group সমর্থন করে। Primary origin একটি 5xx error return করলে, CloudFront স্বয়ংক্রিয়ভাবে secondary দিয়ে retry করে। Route 53 failover থেকে ভিন্ন — এটি একটি একক CloudFront distribution-এর মধ্যে।
- **Multi-origin behavior**: একটি একক distribution `/images/*` S3-তে এবং `/*` একটি ALB-তে route করতে পারে। পরীক্ষা এটি "দুটি distribution ছাড়া একটি domain থেকে static এবং dynamic content কীভাবে পরিবেশন করতে হবে" হিসেবে উপস্থাপন করতে পারে।
- **CloudFront বনাম Global Accelerator:** CloudFront = HTTP/HTTPS CDN, edge location-এ content cache করে, origin লোড কমায়, static এবং cacheable content-এর জন্য সেরা। Global Accelerator = যেকোনো TCP/UDP protocol, কিছুই cache করে না, AWS-এর private backbone-এ ট্রাফিক route করে, 2টি static Anycast IP প্রদান করে, প্রায়-তাৎক্ষণিক regional failover সমর্থন করে। পরীক্ষার trigger: "non-HTTP ট্রাফিকের জন্য latency উন্নত করুন" বা "একটি global অ্যাপ্লিকেশনের জন্য static IP" বা "global ব্যবহারকারীদের জন্য WebSocket পারফরম্যান্স" বা "DNS-এর চেয়ে দ্রুত regional failover" → Global Accelerator। "কম latency-তে বৈশ্বিকভাবে static file পরিবেশন করুন" → CloudFront।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

একটি CloudFront cache hit এবং একটি cache miss-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। প্রতিটি ক্ষেত্রে কী ঘটে?

*(ইঙ্গিত: content কোথা থেকে আসে এবং দুটি ক্ষেত্রে response time কীভাবে আলাদা হয় সে সম্পর্কে ভাবুন।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি software company বিশ্বজুড়ে গ্রাহকদের কাছে একটি S3 bucket থেকে বড় installer file (~২GB প্রতিটি) বিতরণ করে। Asia-র গ্রাহকদের জন্য download গতি ধীর। দল multiple region-এ S3 bucket replicate না করে পারফরম্যান্স উন্নত করতে চায়। তারা শুধুমাত্র paying customer installer ডাউনলোড করতে পারে তাও নিশ্চিত করতে চায়।

কোন সমাধানটি এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) bucket-এ S3 Transfer Acceleration সক্ষম করুন এবং paying customer-এর জন্য pre-signed URL তৈরি করুন  
B) Origin হিসেবে S3 bucket সহ CloudFront ব্যবহার করুন, Origin Access Control সক্ষম করুন এবং paying customer-এর জন্য CloudFront Signed URL ব্যবহার করুন  
C) প্রতিটি AWS region-এ একটি S3 bucket তৈরি করুন এবং customer-কে নিকটতম bucket-এ direct করতে Route 53 geolocation routing ব্যবহার করুন  
D) প্রতিটি region-এ EC2 instance-এর সাথে একটি Application Load Balancer ব্যবহার করুন যা installer file পরিবেশন করে

**ইঙ্গিত ১**: প্রয়োজনীয়তা হলো bucket replicate না করে global পারফরম্যান্স উন্নত করা। কোন বিকল্পে একাধিক bucket দরকার নেই?

**ইঙ্গিত ২**: কোন পরিষেবা বিশেষভাবে CloudFront-এর মাধ্যমে পরিবেশিত content কে অ্যাক্সেস করতে পারে তা নিয়ন্ত্রণ করে?

**ইঙ্গিত ৩**: S3 Transfer Acceleration long-distance S3-*এ* upload-এর জন্য optimize করা। S3 *থেকে* বৈশ্বিকভাবে content deliver করার জন্য, CloudFront সঠিক সরঞ্জাম।

**উত্তর**: B

**ব্যাখ্যা**: CloudFront প্রথম download-এর পরে বৈশ্বিকভাবে installer file edge location-এ cache করে। একই region থেকে পরবর্তী download edge থেকে আসে — us-west-2-এ S3 থেকে Pacific অতিক্রম করার চেয়ে অনেক দ্রুত। Origin Access Control নিশ্চিত করে S3 bucket শুধুমাত্র CloudFront-এর মাধ্যমে accessible। Signed URL paying customer-এর অ্যাক্সেস সীমাবদ্ধ করে।

**কেন A নয়?** S3 Transfer Acceleration long-distance *upload* S3-এ optimize করা — S3 থেকে একটি global audience-কে content *distribute* করার জন্য নয়। সেটির জন্য CloudFront সঠিক সরঞ্জাম। Pre-signed URL অ্যাক্সেস নিয়ন্ত্রণ করে কিন্তু global পারফরম্যান্স উন্নত করে না।

**কেন C নয়?** প্রতি region-এ একটি S3 bucket তৈরি করা পারফরম্যান্সের জন্য কাজ করে, কিন্তু এটি replication এড়ানোর প্রয়োজনীয়তার বিরোধিতা করে। এটি bucket জুড়ে একটি ডেটা synchronization strategy-ও প্রয়োজন।

**কেন D নয়?** প্রতিটি region-এ একটি load balancer-এর পেছনে EC2 instance CloudFront-এর চেয়ে উল্লেখযোগ্যভাবে বেশি ব্যয়বহুল এবং একাধিক region-এ সার্ভার পরিচালনা প্রয়োজন।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৪*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus video content যোগ করতে চায় — রেস্তোরাঁ অংশীদারদের থেকে short cooking tutorial ভিডিও। ভিডিও ৫০-৫০০MB হতে পারে। তারা আশা করছে publish করার কয়েক ঘণ্টার মধ্যে হাজার হাজার ব্যবহারকারী একই শহরে একই ভিডিও দেখবে।

Storage এবং delivery architecture design করুন। আপনি কি S3 এবং CloudFront ব্যবহার করবেন? ভিডিও cache হওয়ার আগে delay কমাতে আপনি প্রথম request (cold start) কীভাবে handle করবেন? Publish করার পরে পরিবর্তন না হওয়া একটি ভিডিওর জন্য আপনি কোন cache TTL set করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো CDN design সিদ্ধান্ত অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo CloudFront distribution ভুল origin-এ point করেছিল — production-এর পরিবর্তে development S3 bucket-এ। প্রায় চার মিনিটের জন্য, কিছু West Coast ব্যবহারকারী অ্যাপের একটি পুরানো সংস্করণ দেখেছিল। সে origin setting ঠিক করেছিল, cache invalidate করেছিল এবং নীরবে incident log আপডেট করেছিল।

Priya deployment-এর পরে CloudFront metrics দেখল।

Cache hit rate: 83%।

"এর মানে কী?" Tom জিজ্ঞেস করল।

"এর মানে আমাদের 83% ব্যবহারকারী us-west-2 থেকে নয়, তাদের কাছাকাছি একটি edge location থেকে content পাচ্ছে।"

"এবং অন্য 17%?"

"প্রথমবারের অনুরোধ। Content যা এখনো সেই edge location-এ cached হয়নি।"

Tom metrics-এর দিকে তাকাল। "তাহলে আমরা প্রতিদিন প্রায় দশ লক্ষ অনুরোধ CloudFront edge node থেকে পরিবেশন করছি। এবং সেগুলির মধ্যে মাত্র 170,000 প্রকৃতপক্ষে আমাদের সার্ভার hit করে।"

"হ্যাঁ।"

"তাহলে CloudFront না থাকলে, আমাদের সার্ভার দশ লক্ষ অনুরোধ সামলাত।"

"Global ব্যবহারকারীদের জন্য প্রতিটি 140-160 মিলিসেকেন্ডে।"

Tom পিছনে হেলান দিল। তার একটি চেহারা ছিল যা Maya চিনত — রিয়েল টাইমে খরচ পুনর্গণনা করছে এমন কারো চেহারা।

"এটা মূল্যবান," সে বলল।

Maya ইতিমধ্যে তার laptop-এ ছিল। "দুজন নতুন engineer আগামী সপ্তাহে আমাদের সাথে যোগ দিচ্ছে। Soo-Jin তার শেষ company-র platform team থেকে, এবং Rafael — সে security-তে specialization করেছে। আমি চাই তারা প্রথম দিনের আগে IAM-এ onboard হোক।"

"IAM advanced?" Leo জিজ্ঞেস করল।

"Role, policy, cross-account access। প্রকৃত stuff।"

পরবর্তী অধ্যায়ে: fine-grained permission যা সিস্টেমের একটি অংশকে অন্য অংশের সাথে কথা বলতে দেয় — নিরাপদে।
