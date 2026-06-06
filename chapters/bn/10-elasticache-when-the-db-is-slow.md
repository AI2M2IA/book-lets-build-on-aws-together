# অধ্যায় ১০: ডেটাবেস যখন খুব ধীর

Page load metrics স্ক্রিনে খোলা ছিল। Leo বিশ মিনিট ধরে কিছু না বলে সেগুলি দেখছিল।

প্রতি page load-এ সাতচল্লিশটি DynamoDB অনুরোধ। শুধু ডেটা retrieve করতে একশত আটাশি মিলিসেকেন্ড — ব্রাউজার একটিও pixel render করার আগে।

সে গণনা করেছিল। শুক্রবার সন্ধ্যায় দশ হাজার সমসাময়িক ব্যবহারকারী, প্রত্যেকে প্রায় মিনিটে একবার browse page লোড করছে: প্রতি মিনিটে চার লক্ষ সত্তর হাজার DynamoDB read। খরচ বাস্তব ছিল। কিন্তু লেটেন্সি ছিল প্রকৃত সমস্যা। Nimbus browse page খোলা একজন ব্যবহারকারী কিছু দেখা যাওয়ার আগে প্রায় দুইশত মিলিসেকেন্ড অপেক্ষা করত — এবং সেটা ছিল একটি দ্রুত সংযোগে।

---

*আগের সপ্তাহে, DynamoDB schema পুনর্গঠন কাজ করেছিল। মেনু টেবিল এখন নমনীয় ছিল — যেকোনো রেস্তোরাঁ যেকোনো modifier, যেকোনো combo কাঠামো, যেকোনো মৌসুমী বৈচিত্র্য যোগ করতে পারত। স্বতন্ত্র lookup-এ পারফরম্যান্স চমৎকার ছিল। কিন্তু চমৎকার স্বতন্ত্র lookup, প্রতি page-এ সাতচল্লিশ দিয়ে গুণ করলে, তবু ধীর page-এ যোগ হত। DynamoDB সমস্যা সমাধান হয়েছিল। একটি নতুন সমস্যা তার জায়গা নিয়েছিল।*

---

"ডেটাবেস প্রতি অনুরোধে চার মিলিসেকেন্ডে সাড়া দিচ্ছে," Leo বলল। "এটা আসলে দ্রুত। DynamoDB তার কাজ করছে।"

"তাহলে page কেন ধীর?" Maya জিজ্ঞেস করল।

"কারণ আমরা প্রতি page load-এ এটিকে সাতচল্লিশবার call করছি," Priya বলল। "সমস্যা ডেটাবেস নয়। সমস্যা হলো আমরা এটির সাথে অনেক বেশি কথা বলছি।"

Tom সামনে ঝুঁকল। তার সেই চেহারা ছিল যা একটি সমস্যা একটি খরচ কথোপকথন হতে চলেছে এমন সময় হয়। "তাহলে সমাধান হলো এটির সাথে কম কথা বলা?"

"কম কথা বলা। বেশি মনে রাখা।"

---

**ভুল প্রথম প্রচেষ্টা**

Leo-র প্রথম প্রবৃত্তি ছিল per-user ডেটা cache করা। প্রতিটি ব্যবহারকারীর একটি session ছিল, এবং session তাদের profile লোড করত: সংরক্ষিত ঠিকানা, পেমেন্ট পদ্ধতি, অর্ডার ইতিহাস সারাংশ। হয়তো সেটি cache করলে জিনিসগুলি দ্রুত হবে।

সে এটি implement করল। Redis key format: `user:{userId}:profile`। TTL: দশ মিনিট।

সে load test চালাল। Page load ছয় মিলিসেকেন্ড কমল।

"এটা বেশি না," Tom লক্ষ্য করল।

"না," Leo বলল।

"কেন না?"

Leo এক মুহূর্ত graph-এর দিকে তাকাল। "কারণ user profile শুধু একটি অনুরোধ। এখনো প্রতি page-এ ছেচল্লিশটি DynamoDB call আছে। এবং সেগুলি মেনু call — browse page-এ প্রতি রেস্তোরাঁ একটি। আমি ভুল জিনিস cache করেছি।"

এটি caching-এ একটি সাধারণ ভুল: যা bottleneck নয় তা optimize করা। User profile দুই মিলিসেকেন্ডে লোড হত। এত দ্রুত কিছু cache করলে প্রায় কিছুই সাশ্রয় হত না। মেনু ডেটা — সাতচল্লিশবার fetch করা, প্রতিটিতে চার মিলিসেকেন্ড লাগা — ছিল প্রকৃত সমস্যা।

"আপনাকে per-menu cache করতে হবে, per-user নয়," Priya বলল। "Restaurant 047-এর মেনু এটি browse করা প্রতিটি ব্যবহারকারীর জন্য একই। এটাই সেই ডেটা যা cache করার মতো — এটা হাজার হাজার অনুরোধ জুড়ে অভিন্ন।"

Per-user cache মূল্যবান যখন ব্যবহারকারীদের ব্যয়বহুল personalized state থাকে। Per-entity cache (মেনু, product catalog, config) মূল্যবান যখন একই ডেটা হাজার হাজার ব্যবহারকারীকে পরিবেশন করা হয়। কোড লেখার আগে জানুন আপনার কোন সমস্যা আছে।

Leo cache key পুনরায় ডিজাইন করল: `menu:{restaurantId}`। প্রতি রেস্তোরাঁয় একটি cache entry, সেই রেস্তোরাঁ browse করা প্রতিটি ব্যবহারকারীর দ্বারা শেয়ার করা।

সে আবার load test চালাল। Page load ১৮৮ মিলিসেকেন্ড থেকে ১২ মিলিসেকেন্ডে নামল। সেটাই ছিল উন্নতি যা তারা খুঁজছিল।

---

**রেস্তোরাঁর উপমা**

একটি রেস্তোরাঁর রান্নাঘর কল্পনা করুন। প্রতিবার একজন ওয়েটারকে দিনের বিশেষ কী জানতে হয়, সে পেছনে হেঁটে যায়, শেফকে জিজ্ঞেস করে এবং টেবিলে ফিরে আসে।

দুজন ওয়েটার এবং তিনটি টেবিল থাকলে এটি ঠিক কাজ করে।

এখন দুইশত ওয়েটার এবং এক হাজার টেবিল কল্পনা করুন। তাদের প্রত্যেকেই একই প্রশ্নের জন্য পেছনে হেঁটে যাচ্ছে। রান্নাঘর bottleneck হয়ে ওঠে। শেফ ঘণ্টায় চারশতবার একই প্রশ্নের উত্তর দিচ্ছে।

স্পষ্ট সমাধান: রেস্তোরাঁর সামনে একটি board-এ বিশেষগুলি লিখুন। প্রতিটি ওয়েটার board থেকে পড়ে। রান্নাঘর বিশ্রাম পায়। বিশেষ পরিবর্তিত হলে board আপডেট হয়।

সেই board হলো একটি cache।

একটি cache হলো সম্প্রতি retrieve করা ডেটার একটি দ্রুত, local store। একটি ধীর উৎস থেকে একই জিনিস বারবার fetch করার পরিবর্তে, আপনি একবার fetch করেন এবং কাছে রাখেন।

প্রকৌশলীরা উপযোগী মনে করেন আরো একটি উপমা: লাইব্রেরির reserve shelf। যখন একটি জনপ্রিয় বই জমা পড়ে, লাইব্রেরিয়ান জানেন এটি শীঘ্রই আবার চাওয়া হবে, তাই তারা এটিকে stack-এ shelf না করে front desk-এর কাছে reserve shelf-এ রাখেন। পরের পাঠককে পুরো লাইব্রেরি হাঁটতে হয় না — তারা এটি ঠিক desk-এ পান। Reserve shelf-এর সীমিত জায়গা আছে। পূর্ণ হলে, নতুনের জন্য জায়গা করতে পুরানো বই stack-এ ফেরত যায়। একটি cache অভিন্নভাবে কাজ করে: ঘন ঘন অ্যাক্সেস হওয়া ডেটা সামনে থাকে, কম অ্যাক্সেস হওয়া ডেটা জায়গা করতে evict হয়।

**কেন শুধু মেমরি ব্যবহার করবেন না?**

"আমরা কি অ্যাপ্লিকেশনের মেমরিতে মেনু সংরক্ষণ করতে পারি না?" Leo জিজ্ঞেস করল।

বৈধ প্রশ্ন।

আপনি পারেন। একটি single-server অ্যাপ্লিকেশনের জন্য, in-memory caching ঠিক কাজ করে। কিন্তু Nimbus একটি load balancer-এর পেছনে, একাধিক EC2 instance জুড়ে চলে। যদি একটি instance তার মেমরিতে মেনু cache করে, অন্য instance গুলির সেই ডেটা থাকে না। তারা প্রত্যেকে আলাদা cache বজায় রাখে। মেনু আপডেট হলে, আপনাকে সেগুলির সব invalidate করতে হবে।

এটি হলো *cache coherence সমস্যা* — একাধিক cache সামঞ্জস্যপূর্ণ রাখা।

ElastiCache এটি একটি *centralized* cache প্রদান করে সমাধান করে যা আপনার সমস্ত instance শেয়ার করে। প্রতিটি সার্ভারের নিজস্ব মেমরি থাকার পরিবর্তে, প্রতিটি সার্ভার একই cache থেকে পড়ে এবং লেখে। একটি আপডেট সবার কাছে propagate হয়।

**ElastiCache-এর সাথে পরিচয়**

"দাঁড়াও — কিন্তু আমরা *কেন* এভাবে করব?" Maya জিজ্ঞেস করল। "একটি পুরো নতুন পরিষেবা কেন? শুধু আরো ডেটাবেস capacity কেন যোগ করব না?"

ভালো প্রশ্ন। উত্তর হলো আরো ডেটাবেস capacity যোগ করা — বড় instance, আরো read replica — মৌলিক সমস্যা ঠিক করে না। সেই সাতচল্লিশটি page-load অনুরোধের প্রতিটি এখনো সময় এবং অর্থ খরচ করে, এমনকি একটি দ্রুত ডেটাবেসেও। একটি cache ডেটাবেসকে দ্রুত করে না; এর মানে ডেটাবেসকে একই প্রশ্ন অনেক কম বার জিজ্ঞেস করা হয়। যে ডেটা বারবার পড়া হয় এবং বিরল ঘটনায় পরিবর্তিত হয় — যেমন একটি রেস্তোরাঁর মেনু — তার জন্য একটি cache মানে ডেটাবেস হয়তো প্রতি page load-এ সাতচল্লিশবারের বদলে প্রতি পাঁচ মিনিটে একবার সেই প্রশ্নের উত্তর দেয়।

Amazon ElastiCache হলো একটি managed caching service। এটি জনপ্রিয় caching engine — Redis এবং Memcached — চালায়, আপনাকে সার্ভার পরিচালনা না করেই।

**Redis** দুটির মধ্যে আরো শক্তিশালী। এটি জটিল ডেটা structure (string, list, set, hash, sorted set), persistence (ডেটা restart-এ টিকে থাকে), replication এবং pub/sub messaging সমর্থন করে। Redis caching-এর বাইরে আরো করতে পারে — এটি একটি lightweight data store হিসেবে কাজ করতে পারে।

**Memcached** সহজ। Pure key-value caching, horizontally scalable, কোনো persistence নেই। সহজ ব্যবহারের ক্ষেত্রে দ্রুত কিন্তু কম feature।

Nimbus-এর জন্য: Redis। তাদের মেনু ডেটা (structured), session token (key-value) cache করতে হবে এবং পরে "trending restaurants" ranking-এর জন্য sorted set চাইবে।

**Caching ব্যবহারিকভাবে কীভাবে কাজ করে**

মূল caching pattern-কে বলা হয় **cache-aside** (lazy loading-ও বলা হয়):

১. অ্যাপ্লিকেশনের ডেটা দরকার
২. প্রথমে cache check করুন
৩. পাওয়া গেলে (*cache hit*): তাৎক্ষণিকভাবে ডেটা return করুন
৪. না পাওয়া গেলে (*cache miss*): ডেটাবেসে যান, ডেটা পান, cache-এ সংরক্ষণ করুন, return করুন

Pseudocode-এ:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # ৫ মিনিটের জন্য cache করুন
return menuData
```

প্রথম অনুরোধ সবসময় ডেটাবেস hit করে। পরবর্তী প্রতিটি অনুরোধ cache hit করে। একটি cache দিয়ে, Nimbus-এর প্রতি page load-এ সাতচল্লিশটি DynamoDB read এক বা দুটি cache lookup হয়ে যায়। দ্রুত, সস্তা এবং scalable।

**TTL: কতক্ষণ মনে রাখবেন?**

প্রতিটি cache entry-র একটি **Time-To-Live (TTL)** আছে: সেই মেয়াদ যার পরে entry expire হয় এবং পরবর্তী অনুরোধ fresh ডেটার জন্য ডেটাবেসে ফিরে যায়।

এটি caching-এর মূল উত্তেজনা: freshness বনাম পারফরম্যান্স।

- **Short TTL (সেকেন্ড)**: খুব fresh ডেটা, কিন্তু অনেক cache miss। Cache খুব কমই সাহায্য করে।
- **Long TTL (ঘণ্টা বা দিন)**: খুব দ্রুত, কিন্তু ডেটা stale হতে পারে। গ্রাহক গতকালের মেনু দেখে।

মেনু ডেটার জন্য, পাঁচ মিনিট যুক্তিসঙ্গত। মেনু প্রতি সেকেন্ডে পরিবর্তিত হয় না। যদি একটি রেস্তোরাঁ তাদের মেনু আপডেট করে, গ্রাহকরা পাঁচ মিনিট পর্যন্ত পুরানো সংস্করণ দেখতে পারে — গ্রহণযোগ্য।

Session token (এই ব্যবহারকারী কি লগ ইন করেছে?)-এর জন্য, shorter TTL অর্থপূর্ণ, অথবা session পরিবর্তিত হলে আপনি তাৎক্ষণিকভাবে cache আপডেট করেন।

আর্থিক ডেটার জন্য (অর্ডার মোট, পেমেন্ট রেকর্ড), এটি cache করবেন না — অথবা যদি করেন, write-এ তাৎক্ষণিকভাবে invalidate করুন।

আপনি হয়তো ভাবছেন: একটি পুরো নতুন caching layer চালু করার পরিবর্তে শুধু আরো ডেটাবেস capacity কেন যোগ করব না? আরো replica, একটি বড় instance — সেটা কেন নয়? উত্তর হলো অতিরিক্ত ডেটাবেস capacity একসাথে অনুরোধ সামলানোর আপনার ক্ষমতা বহুগুণ করে, কিন্তু এটি অনুরোধের সংখ্যা কমায় না। দশ হাজার ব্যবহারকারী যদি প্রত্যেকে প্রতি page load-এ সাতচল্লিশটি read trigger করে, একটি দ্বিতীয় read replica যোগ করা শুধু মানে প্রতিটি replica সাতচল্লিশ হাজারের বদলে তেইশ হাজার অনুরোধ সামলায় — মোট কাজ কমে না। একটি cache অপ্রয়োজনীয় কাজ সম্পূর্ণ নির্মূল করে: সেই দশ হাজার ব্যবহারকারী একই cached ফলাফল শেয়ার করে।

"কম্পিউটার বিজ্ঞানে শুধু দুটি কঠিন সমস্যা আছে," Leo উদ্ধৃত করল, আগে বলেছে এমন কারো practiced delivery সহ। "Cache invalidation এবং naming things।"

"Cache invalidation কেন কঠিন?" Maya জিজ্ঞেস করল।

"কারণ ডেটা *আসলে* কখন পরিবর্তিত হয়? মেনু কি একজন রেস্তোরাঁ অংশীদার আপডেট করার কারণে পরিবর্তিত হয়েছে? নাকি একটি cron job চলার কারণে? নাকি একজন admin ম্যানুয়ালি সম্পাদনা করার কারণে? ডেটা পরিবর্তন করতে পারে এমন প্রতিটি জায়গাকে cache-কে বলতে জানতে হবে।"

এজন্যই senior engineer "চলুন Redis যোগ করি" দিয়ে শুরু করার পরিবর্তে "write path গুলি কী?" দিয়ে একটি caching কথোপকথন শুরু করে।

---

**Cache Invalidation-এর গল্প**

প্রথমবার একজন রেস্তোরাঁ অংশীদার অভিযোগ করায় তারা জানতে পারল cache invalidation কত কঠিন।

Restaurant 112 — Eastside-এর একটি Colombian জয়েন্ট — বৃহস্পতিবার বিকেলে তাদের দাম আপডেট করেছিল। তারা arepa-এর দাম $8 থেকে $9 করেছিল। তারা বিশ মিনিট পরে Nimbus support-এ ফোন করল।

"আমাদের মেনু এখনো পুরানো দাম দেখাচ্ছে," মালিক বললেন। "গ্রাহকরা $8-এ অর্ডার দিচ্ছে। আমাদের এখন সেই দাম সম্মান করতে হচ্ছে।"

Priya bug ট্রেস করার সময় Tom ক্ষতি গণনা করল। সেই বিশ মিনিটে দেওয়া প্রতিটি অর্ডার $8 চার্জ করেছিল। রেস্তোরাঁ $9 চেয়েছিল। Nimbus-কে পার্থক্য শোষণ করতে হবে।

পাঁচ-মিনিটের TTL অনেক আগে expire হওয়া উচিত ছিল। বিশ মিনিট পার হয়েছিল। Priya কোড টানল।

Cache key ছিল `menu:restaurant-112`। এটি একটি 300-সেকেন্ড TTL সহ সেট করা হয়েছিল। সে চেক করল এটি শেষ কখন লেখা হয়েছিল।

"এটা 2:03 PM-এ সেট করা হয়েছিল," সে বলল। "বাইশ মিনিট আগে।"

"কিন্তু TTL পাঁচ মিনিট," Leo বলল।

"TTL প্রথম cache করা থেকে পাঁচ মিনিট। কিন্তু cache hit করা প্রতিটি অনুরোধ TTL refresh করছিল। Cache entry আগত অনুরোধ দ্বারা প্রতি কয়েক সেকেন্ডে স্পর্শ হচ্ছিল, এবং TTL রিসেট হচ্ছিল।"

"তাহলে এটা কখনো expire হয়নি।"

"এই implementation-এ নয়। আমরা প্রতিটি cache read-এ TTL সেট করি। Sliding window। যতক্ষণ কেউ এটি hit করছিল entry ততক্ষণ বেঁচে ছিল।"

সমাধান: শুধু write-এ সেট করা একটি fixed TTL ব্যবহার করুন, read-এ কখনো বর্ধিত না। কতবার পড়া হয় তা নির্বিশেষে entry সংরক্ষিত হওয়ার ঠিক পাঁচ মিনিট পরে expire হয়। যখন রেস্তোরাঁ তাদের মেনু আপডেট করল, পুরানো entry পাঁচ মিনিটের মধ্যে expire হলো এবং পরবর্তী অনুরোধ fresh ডেটা fetch করল।

"আর যেসব ক্ষেত্রে একটি রেস্তোরাঁ দাম আপডেট করে এবং আমাদের এটি তাৎক্ষণিকভাবে প্রতিফলিত হওয়া দরকার?" Tom জিজ্ঞেস করল।

"Active invalidation," Priya বলল। "যখন রেস্তোরাঁ অংশীদার portal একটি আপডেট জমা দেয়, API return করার আগে `cache.delete('menu:restaurant-112')` call করে। পরবর্তী অনুরোধ তাৎক্ষণিকভাবে fresh ডেটা fetch করে।"

"কিন্তু সেটির জন্য portal-কে cache সম্পর্কে জানতে হবে।"

"ডেটাবেসের প্রতিটি write path-কে cache সম্পর্কে জানতে হবে। Leo আগে এটাই বলেছিল। এখন আমরা এটি অনুভব করেছি।"

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo portal-এ invalidation implement করেছিল কিন্তু admin edit interface ভুলে গিয়েছিল। দুই সপ্তাহ পরে, একজন admin internal dashboard-এর মাধ্যমে একটি মেনু আপডেট করেছিল, এবং পুরানো দাম cache-এ পাঁচ মিনিট টিকে ছিল। একই ঘটনার একটি ছোট সংস্করণ।

তারা একটি DynamoDB Streams handler যোগ করল — আগের অধ্যায় থেকে — যা একটি মেনু item পরিবর্তন হলে স্বয়ংক্রিয়ভাবে cache invalidate করত, কোন সিস্টেম write trigger করেছিল তা নির্বিশেষে। একটি handler, সমস্ত write path covered।

---

**Cache Eviction: Board পূর্ণ হলে**

বিশেষ board-এ সীমিত জায়গা আছে। পূর্ণ হলে, জায়গা করতে আপনাকে কিছু মুছতে হয়।

Redis (এবং সাধারণভাবে cache)-এ *eviction policy* থাকে যা মেমরি পূর্ণ হলে কী সরানো হবে নির্ধারণ করে:

- **LRU (Least Recently Used)**: সবচেয়ে দীর্ঘ সময় ধরে অ্যাক্সেস না হওয়া item সরান।
- **LFU (Least Frequently Used)**: সবচেয়ে কম অ্যাক্সেস হওয়া item সরান।
- **allkeys-random**: Random eviction। সহজ, সর্বোত্তম নয়।
- **noeviction**: মেমরি পূর্ণ হলে error return করুন (অ্যাপ্লিকেশনকে এটি সামলাতে হবে)।

বেশিরভাগ ওয়েব অ্যাপ্লিকেশনের জন্য: LRU। যে জিনিসগুলি আপনি সম্প্রতি দেখেননি সেগুলি সম্ভবত কম প্রয়োজন।

---

**Cache Stampede সমস্যা**

"পুরো cache একসাথে খালি হলে কী হয় তা নিয়ে আমরা ভেবেছি কি?" Priya জিজ্ঞেস করল।

"সেটা কখন হবে?" Leo বলল।

"যখন আপনি একটি নতুন ElastiCache cluster deploy করেন। যখন একটি বড় batch entry-র TTL একসাথে expire হয়। যখন একটি bug fix-এর পরে refresh বাধ্য করতে আপনি cache flush করেন।"

Leo এর মধ্য দিয়ে ভাবল। "Cache খালি হলে, প্রতিটি অনুরোধ ডেটাবেসে যায়। সব একসাথে। কয়েক সেকেন্ডের জন্য, ডেটাবেস প্রতিটি সমসাময়িক ব্যবহারকারীর সম্পূর্ণ লোড সামলায়।"

"সামনে কোনো cache ছাড়া।"

"এটা ব্যথা দেবে।" Leo ডেটাবেস capacity সেটিংস দেখল। "আমরা নিশ্চিতভাবে throttled হব।"

একে বলা হয় **cache stampede** (thundering herd-ও বলা হয়)। এটা ঘটে যখন অনেক cache entry একই সময়ে expire হয় — প্রায়ই কারণ সেগুলি সব একটি deploy বা cold start-এর সময় একই সময়ে তৈরি হয়েছিল — এবং cache miss-এর হঠাৎ ঢেউ সব একসাথে ডেটাবেস hit করে।

প্রশমন কৌশল:

**TTL-এ Jitter**: প্রতিটি মেনু entry ঠিক 300 সেকেন্ডে সেট করার পরিবর্তে, random বৈচিত্র্য যোগ করুন: 270 থেকে 330 সেকেন্ড। Entry সামান্য ভিন্ন সময়ে expire হয়, cache miss-এর ঢেউ একসাথে আঘাত করার পরিবর্তে এক মিনিট জুড়ে ছড়িয়ে দেয়।

**Probabilistic early expiration**: একটি entry expire হওয়ার আগে, অনুরোধের একটি ছোট শতাংশ সক্রিয়ভাবে এটি refresh করে। এটি entry-কে stale হওয়ার আগে fresh রাখে, expiration-কে কখনো miss হতে দেয় না।

**Request coalescing (mutex/lock)**: একটি cache miss ঘটলে, ডেটাবেস hit করার আগে একটি lock acquire করুন। একই key-এর জন্য অন্য সমসাময়িক অনুরোধ প্রথম অনুরোধ সম্পূর্ণ হওয়া এবং cache পুনরায় populate করার জন্য অপেক্ষা করে, তারপর cache থেকে পড়ে। উচ্চ concurrency-তেও প্রতি cache miss-এ শুধু একটি ডেটাবেস অনুরোধ করা হয়।

Nimbus-এর জন্য, তারা TTL jitter implement করল। সহজ, কার্যকর, কোনো অতিরিক্ত জটিলতা নেই।

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"দুই লাইন কোড," Leo বলল। "Deploy-এর সময় একটি সম্ভাব্য ডেটাবেস outage প্রতিরোধ করতে।"

"বেশিরভাগ reliability উন্নতি এমনই," Priya বলল। "Implement করা সস্তা, প্রয়োজন ছিল তা শেখা ব্যয়বহুল।"

---

**Redis Data Structure: Key-Value-এর চেয়ে বেশি**

Nimbus যখন "trending restaurants" feature যোগ করল, Leo প্রথমে ranking-কে একটি plain JSON list হিসেবে সংরক্ষণ করল: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`।

এটা কাজ করল, কিন্তু এটা আপডেট করা ছিল অস্বস্তিকর। একটি নতুন রেস্তোরাঁ যোগ করতে বা score আপডেট করতে, তাকে পুরো list পড়তে হত, অ্যাপ্লিকেশন কোডে এটি modify করতে হত, এবং পুরো জিনিস ফেরত লিখতে হত। analytics pipeline থেকে সমসাময়িক write-এর অধীনে, race condition score overwrite করত।

Priya তাকে Redis sorted set-এর দিকে নির্দেশ করল।

Redis-এ একটি **sorted set** সংশ্লিষ্ট সংখ্যাসূচক score সহ member সংরক্ষণ করে। Member স্বয়ংক্রিয়ভাবে score অনুযায়ী sort হয়। অপারেশন atomic — সমসাময়িক আপডেট থেকে কোনো race condition নেই।

```
# একটি রেস্তোরাঁর score যোগ/আপডেট করুন
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# score অনুযায়ী শীর্ষ 10 রেস্তোরাঁ পান (সর্বোচ্চ প্রথম)
ZREVRANGE trending:global 0 9 WITHSCORES

# একটি রেস্তোরাঁর score atomically বাড়ান
ZINCRBY trending:global 50 "NIMBUS-047"
```

প্রতিবার একটি অর্ডার দেওয়া হলে analytics Lambda `ZINCRBY` call করত, রেস্তোরাঁর score বাড়িয়ে। Homepage শীর্ষ দশ পেতে `ZREVRANGE` call করত। কোনো lock নেই, কোনো race condition নেই, কোনো read-modify-write cycle নেই।

Redis সরল key-value-এর বাইরে আরো কয়েকটি ডেটা structure সমর্থন করে:

**List**: ক্রমবদ্ধ ক্রম। সামনে বা পেছনে push করুন। queue, recent activity feed, log stream-এর জন্য ব্যবহার করুন।

**Set**: কোনো ডুপ্লিকেট ছাড়া অক্রমবদ্ধ সংগ্রহ। Union, intersection, difference অপারেশন। "কোন ব্যবহারকারীরা এই notification দেখেছে?" বা "কোন রেস্তোরাঁ এই category-তে আছে?"-এর জন্য ব্যবহার করুন।

**Hash**: একটি key-এর মধ্যে named field। structured object-এর জন্য ব্যবহার করুন যেখানে আপনি পুরো object পুনর্লিখন না করে স্বতন্ত্র field আপডেট করতে চান।

**HyperLogLog**: Probabilistic cardinality estimation। প্রতিটি visitor ID সংরক্ষণ না করে একটি page-এ অনন্য visitor গণনা করুন। কম্প্যাক্ট এবং দ্রুত।

**Pub/Sub**: channel-এ message publish করুন; subscriber সেগুলি real-time-এ পায়। পরিষেবার মধ্যে lightweight real-time notification-এর জন্য ব্যবহার করুন।

"Redis শুধু একটি cache নয়," Leo বলল। "এটা একটি data structure server।"

"এটা এর official বর্ণনা," Priya বলল।

"আমি ভেবেছিলাম এটা শুধু একটা fancy dictionary।"

"এটা সেভাবেই শুরু হয়েছিল।"

---

**Write-Through: অন্য caching pattern**

Cache-aside (lazy loading) সবচেয়ে সাধারণ pattern। কিন্তু জানার মতো একটি দ্বিতীয়টি আছে: **write-through**।

Write-through caching-এ, প্রতিবার আপনার অ্যাপ্লিকেশন ডেটাবেসে লেখে, এটি তাৎক্ষণিকভাবে cache-এও লেখে।

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

সুবিধা: cache সবসময় up to date। একটি write এবং TTL expiry-র মধ্যে কোনো stale ডেটা নেই।

অসুবিধা: প্রতিটি write দুই জায়গায় যায়। এবং আপনি cache-কে এমন ডেটা দিয়ে populate করেন যা হয়তো কখনো পড়া হবে না। যদি দশটি রেস্তোরাঁ তাদের মেনু আপডেট করে কিন্তু তাদের মাত্র দুটি পরের পাঁচ মিনিটে উল্লেখযোগ্য ট্রাফিক পায়, আপনি আটটি cache-এর জন্য write-through কাজ করেছেন যা expire হওয়ার আগে ব্যবহার হবে না।

"দাঁড়াও — কিন্তু আমরা *কেন* এভাবে করব?" Maya জিজ্ঞেস করল। "যদি আমরা প্রতিটি আপডেটে cache-এ লিখি, আমরা আগের চেয়ে প্রতি write-এ বেশি কাজ করছি। এটা কীভাবে ভালো?"

"এটা সবসময় ভালো নয়," Priya বলল। "Write-through অর্থপূর্ণ হয় যখন আপনি একটি write-এর পরে stale ডেটার কোনো window সহ্য করতে পারেন না। Cache-aside প্রতিটি write-এ অতিরিক্ত কাজ না করার বিনিময়ে এক TTL পর্যন্ত staleness গ্রহণ করে।"

Nimbus-এর জন্য: cache-aside ছিল সঠিক পছন্দ। মেনু লেখার চেয়ে অনেক বেশি পড়া হত। একটি পাঁচ-মিনিটের stale window গ্রহণযোগ্য ছিল। একটি financial trading system-এর জন্য যেখানে প্রতিটি দাম আপডেট তাৎক্ষণিকভাবে প্রতিফলিত হওয়া দরকার, write-through আরো উপযুক্ত হবে।

সিদ্ধান্ত দুটি প্রশ্নে নেমে আসে: আপনার write-to-read অনুপাত কী, এবং একটি write-এর পরে আপনি stale read-এর প্রতি কতটা সহনশীল?


---

**Redis-এর জন্য ElastiCache: আপনি যা Managed পান**

RDS-এর মতো, ElastiCache একটি open-source সরঞ্জাম নেয় এবং পরিচালনামূলক কাজ সামলায়:

- **স্বয়ংক্রিয় ব্যাকআপ**: schedule-এ Redis snapshot
- **Multi-AZ replication**: Primary node + ভিন্ন AZ-এ read replica
- **স্বয়ংক্রিয় failover**: Primary Redis node ব্যর্থ হলে, একটি replica স্বয়ংক্রিয়ভাবে promote হয়
- **Cluster mode**: খুব বড় cache-এর জন্য একাধিক node জুড়ে horizontal sharding
- **এনক্রিপশন**: সম্মতির জন্য in-transit এবং at-rest এনক্রিপশন
- **VPC integration**: Cache আপনার private network-এ চলে, publicly accessible নয়

"মাসে এর খরচ কত?" Tom জিজ্ঞেস করল।

"আমরা যে DynamoDB read replace করছি তার চেয়ে কম," Leo বলল। "মাসে প্রায় দুইশত ডলার কম।"

Leo pricing page টানল। সে ইতিমধ্যে গণনা করেছিল, কিন্তু সে Tom-কে এর মধ্য দিয়ে নিয়ে গেল।

একটি `cache.t3.micro` — সবচেয়ে ছোট node — মাসে প্রায় $12। এর 0.5 GB মেমরি ছিল। কয়েকশো cache key সহ একটি ছোট অ্যাপ্লিকেশনের জন্য যথেষ্ট।

একটি `cache.r6g.large` — Nimbus-এর ট্রাফিকের জন্য উপযুক্ত tier — এর 13 GB মেমরি ছিল এবং মাসে প্রায় $140 চলত। তুলনার জন্য, Nimbus caching-এর আগে DynamoDB read-এ মাসে প্রায় $400 খরচ করছিল। Caching-এর পরে, সেই read প্রায় 89 শতাংশ কমেছিল। গণনা DynamoDB read-এ মাসে প্রায় $356 সাশ্রয়ে পরিণত হলো, ElastiCache-এ খরচ $140 বাদ দিয়ে — মাসে প্রায় $216 নেট সাশ্রয়।

Tom-এর অভিব্যক্তি সন্দেহজনক থেকে সন্তুষ্টে পরিবর্তিত হলো। "আমরা scale up করার আগে সংখ্যাগুলি ঠিকভাবে চালান, কিন্তু এটা মিলছে।" সে এটি লিখে নিল।

"আর কেউ যদি ভাঙার চেষ্টা করে?" Priya বলল। "Cache-এ session token থাকতে পারে। User ডেটা। আমাদের Redis instance-এ auth token দরকার এবং কোনো public access নয়।"

"এটা private subnet-এ থাকবে," Leo বলল।

"ভালো। কিন্তু 'এটা ঠিক হয়ে যাবে' একটি security posture নয়," সে বলল। "Auth token। In transit-এ এনক্রিপশন। শুধু VPC।"

Leo মাথা নাড়ল। সে ঠিক ছিল।

---

**Cache Monitor করা**

"Cache সঠিকভাবে কাজ না করলে কী হয় তা নিয়ে আমরা ভেবেছি কি?" Priya জিজ্ঞেস করল, Redis deployment-এর এক সপ্তাহ পরে। "শুধু সম্পূর্ণ ব্যর্থ নয় — কাজ করে, কিন্তু খারাপভাবে। উচ্চ miss rate। উচ্চ eviction rate। লেটেন্সি ধীরে ধীরে বাড়ছে।"

"Page load time বাড়লে আমি লক্ষ্য করব," Leo বলল।

"যে সময়ের মধ্যে ডেটাবেস ইতিমধ্যে সংগ্রাম করছে," সে বলল।

ElastiCache CloudWatch-এর মাধ্যমে metrics প্রকাশ করে। যেগুলি সবচেয়ে গুরুত্বপূর্ণ:

**CacheHitRate**: একটি ফলাফল return করা cache read-এর শতাংশ। একটি পরিপক্ব cache-এর জন্য আদর্শভাবে 80%-এর উপরে। একটি কমতে থাকা hit rate সংকেত দেয় যে আপনার সবচেয়ে-অ্যাক্সেস হওয়া ডেটা cache-এ নেই — হয় TTL খুব ছোট, cache খুব ছোট, বা আপনার access pattern পরিবর্তিত হয়েছে।

**CacheMisses**: cache miss-এর পরম সংখ্যা। এখানে একটি হঠাৎ স্পাইক মানে cache সাহায্য করছে না এবং ডেটাবেস সম্পূর্ণ লোড নিচ্ছে।

**Evictions**: নতুনের জন্য জায়গা করতে evict করা cache item-এর সংখ্যা। উচ্চ eviction rate মানে আপনার cache আপনার working set-এর জন্য খুব ছোট। আপনার আরো মেমরি বা একটি আরো নির্বাচনী caching কৌশল প্রয়োজন।

**CurrConnections**: Redis-এ বর্তমান client connection। অনেক বেশি connection Redis-এর connection সীমা নিঃশেষ করতে পারে। অ্যাপ্লিকেশনের প্রতিটি অনুরোধে একটি নতুন connection খোলা এড়াতে connection pooling ব্যবহার করা উচিত।

**ReplicationLag**: read replica primary থেকে কতটা পিছিয়ে। এটি বাড়লে, replica read stale ডেটা return করতে পারে।

Leo দুটি CloudWatch alarm সেট করল। প্রথম: cache hit rate পনেরো ক্রমাগত মিনিটের জন্য 70%-এর নিচে নামলে alert — সেটা ডেটাবেস অনুভব করার আগে তদন্তের মতো একটি সমস্যার সংকেত দেবে। দ্বিতীয়: eviction rate প্রতি মিনিটে 100 eviction অতিক্রম করলে alert — সেটা cache undersized ছিল এমন সংকেত দেবে।

"দুটি alarm," Priya বলল, configuration পর্যালোচনা করে। "এটা একটা ভালো শুরু।"

"আমি একটি dashboard-ও যোগ করেছি," Leo বলল। "Hit rate, miss rate, eviction, লেটেন্সি। সব এক জায়গায় দৃশ্যমান।"

"এটা page ধীর হওয়ার জন্য অপেক্ষা করার চেয়ে ভালো।"

"যথেষ্ট ভালো," Leo সম্মত হলো।


---

**ElastiCache বনাম DAX: DynamoDB-এর জন্য কোন Cache?**

"আমরা যদি DynamoDB ডেটা cache করছি," Maya জিজ্ঞেস করল, "ElastiCache-এর পরিবর্তে DAX কেন ব্যবহার করব না? আমি এটি ডকুমেন্টেশনে দেখেছি।"

ভালো প্রশ্ন।

**DAX (DynamoDB Accelerator)** হলো DynamoDB-এর জন্য একটি উদ্দেশ্য-নির্মিত in-memory cache। এটি client স্তরে DynamoDB API call intercept করে — আপনার অ্যাপ্লিকেশন কোড একই DynamoDB SDK ব্যবহার করে DAX-এর সাথে কথা বলে। Cache miss স্বয়ংক্রিয়ভাবে DynamoDB থেকে fetch হয়। Cache hit microsecond-এ return হয়। ডেটা পরিবর্তন হলে invalidation স্বয়ংক্রিয়ভাবে সামলানো হয়।

**ElastiCache** হলো একটি general-purpose cache। আপনি cache key, TTL logic, invalidation পরিচালনা করেন — সবকিছু। আরো নিয়ন্ত্রণ, আরো দায়িত্ব।

কখন কোনটি ব্যবহার করবেন:

| দৃশ্যকল্প | সুপারিশ |
|---|---|
| আপনি DynamoDB read cache করছেন এবং শূন্য অ্যাপ্লিকেশন পরিবর্তন চান | DAX |
| আপনার DynamoDB read-এ microsecond লেটেন্সি প্রয়োজন | DAX |
| আপনি একাধিক উৎস থেকে cache করছেন (DynamoDB + RDS + external API) | ElastiCache |
| আপনার Redis data structure প্রয়োজন (sorted set, pub/sub, HyperLogLog) | ElastiCache |
| আপনার fine-grained TTL নিয়ন্ত্রণ এবং custom invalidation logic প্রয়োজন | ElastiCache |
| আপনার session storage, rate limiting, বা distributed lock প্রয়োজন | ElastiCache |

Nimbus-এর জন্য: তারা ElastiCache বেছে নিল কারণ তারা একাধিক উৎস থেকে ডেটা cache করছিল — মেনুর জন্য DynamoDB, অর্ডার ইতিহাস সারাংশের জন্য RDS, রেস্তোরাঁ rating-এর জন্য external API। DAX শুধু DynamoDB-এর সাথে কাজ করে। এবং তাদের trending ranking-এর জন্য Redis sorted set প্রয়োজন ছিল।

"এটা যদি বিশুদ্ধভাবে একটি DynamoDB caching সমস্যা হত," Priya বলল, "DAX হত সহজ উত্তর। একটি পরিষেবা, স্বয়ংক্রিয় invalidation, একই API। কিন্তু আমাদের একাধিক ডেটা উৎস আছে।"

"তাহলে আপনি DynamoDB-only হলে DAX সহজ," Maya সংক্ষেপ করল। "যখন আপনার সম্পূর্ণ toolbox প্রয়োজন তখন ElastiCache।"

"এটাই tradeoff।"

### যখন Cache ডেটা হারানো যায় না: Amazon MemoryDB

"কেউ কেন Redis-কে primary database হিসেবে ব্যবহার করবে?" Maya জিজ্ঞেস করল। "এটা কি একটা cache নয়?"

এটাই ঠিক সঠিক প্রশ্ন।

Redis-এর জন্য ElastiCache একটি cache — দ্রুত, in-memory, এবং design অনুযায়ী, source of truth নয়। একটি ElastiCache node ব্যর্থ হলে, restart-এ cache খালি থাকে। অ্যাপ্লিকেশন ডেটাবেস থেকে এটি পুনরায় warm করে। একটি cache-এর জন্য এটা ঠিক আছে।

কিন্তু কিছু use case Redis-কে cache হিসেবে নয় বরং একটি primary data store হিসেবে গণ্য করে — session state যা restart-এ টিকে থাকতে হবে, একটি real-time leaderboard যা হারানো যাবে না, একটি shopping cart যা একটি AZ failure জুড়ে persist করতে হবে। এই use case-গুলির জন্য, ElastiCache-এর eventual durability একটি ঝুঁকি।

**Amazon MemoryDB for Redis** হলো একটি সম্পূর্ণ managed, Redis-compatible, durable in-memory database। ElastiCache-এর বিপরীতে, MemoryDB একাধিক AZ জুড়ে সংরক্ষিত একটি distributed transaction log ব্যবহার করে যা acknowledge করার আগে প্রতিটি write durable করে। ডেটা node failure-এ টিকে থাকে — একটি ধীর ডেটাবেস থেকে replay করার কারণে নয়, বরং এটা কখনো শুধু একটি জায়গায় ছিল না।

মূল পার্থক্য:

| | ElastiCache for Redis | MemoryDB for Redis |
|---|---|---|
| ভূমিকা | Cache layer | Primary database |
| Durability | Failure-এ নিশ্চিত নয় | Multi-AZ transaction log |
| Latency | Microsecond read এবং write | Microsecond read, single-digit millisecond write |

উভয়ই একই Redis command এবং data structure সমর্থন করে। API একই। Durability গ্যারান্টি নয়।

Nimbus-এর জন্য: দল real-time per-restaurant অর্ডার গণনা একটি Redis sorted set হিসেবে সংরক্ষণ করতে চায় — এবং এটিকে ডেটাবেস থেকে reseed না করে একটি AZ failure টিকতে হবে। সেই প্রয়োজনীয়তা — Redis-compatible *এবং* durable — হলো MemoryDB-এর সঠিক সংকেত।

"তাহলে একটি failure-এর পরে আমাদের এটি পুনরায় warm করতে হবে না?" Leo জিজ্ঞেস করল।

"এটাই মূল কথা," Priya বলল। "Node ব্যর্থ হয়ে ফিরে এলে, ডেটা সেখানে থাকে। Transaction log এটি রেখেছিল।"

Leo এক মুহূর্ত pricing page-এর দিকে তাকাল। "এটা ElastiCache-এর চেয়ে বেশি খরচ করে।"

"বিশ্বাসযোগ্য সবকিছুই করে," Priya বলল।

## শক্তি এবং সীমাবদ্ধতা

**Caching কেন শক্তিশালী**:

- নাটকীয়ভাবে ডেটাবেস লোড কমায় (কম query, কম খরচ)
- Cache hit-এর জন্য sub-millisecond response time
- ট্রাফিক স্পাইক থেকে আপনার ডেটাবেস রক্ষা করে
- Redis সরল key-value store-এর চেয়ে সমৃদ্ধ ডেটা structure সমর্থন করে
- Cache stampede প্রশমন (TTL jitter, coalescing) cold-start surge থেকে রক্ষা করে

**Caching কোথায় জটিল হয়**:

- Cache invalidation সত্যিই কঠিন — stale ডেটা bug ঘটায়
- পরিচালনামূলক জটিলতা যোগ করে (monitor করার জন্য আরো একটি পরিষেবা, আরো একটি failure point)
- Cold start সমস্যা: fresh deploy করলে, cache খালি — ডেটাবেস সম্পূর্ণ লোড নেয়
- Cache stampede: যদি একসাথে অনেক entry expire হয়, সমস্ত অনুরোধ একসাথে ডেটাবেস hit করে
- ElastiCache node বিনামূল্যে নয় — আপনি idle থাকলেও সেগুলির জন্য পেমেন্ট করেন

**ElastiCache বনাম DynamoDB DAX**:

আপনি যদি বিশেষভাবে DynamoDB ডেটা cache করছেন, AWS **DAX (DynamoDB Accelerator)** অফার করে — DynamoDB-এর জন্য একটি উদ্দেশ্য-নির্মিত in-memory cache। DAX আপনার অ্যাপ্লিকেশন কোডে transparent (একই API), DynamoDB read লেটেন্সি microsecond-এ কমায় এবং স্বয়ংক্রিয়ভাবে cache invalidation সামলায়।

আপনার bottleneck বিশেষভাবে DynamoDB read হলে এবং আপনি zero-change caching চাইলে DAX ব্যবহার করুন। যেকোনো ডেটা উৎসের জন্য একটি general-purpose cache দরকার হলে, বা Redis data structure দরকার হলে ElastiCache ব্যবহার করুন।

## সারসংক্ষেপ

সাতচল্লিশটি ডেটাবেস call একটি cache lookup হয়ে গেল। Page 188 মিলিসেকেন্ড থেকে 12-তে গেল। একটি caching layer যোগ করা একটি বাড়ন্ত অ্যাপ্লিকেশন করতে পারে এমন সর্বোচ্চ-লিভারেজ পরিবর্তনগুলির একটি — কিন্তু শুধুমাত্র যখন cache চিন্তাশীলভাবে ডিজাইন করা হয়, "এই ডেটা কখন পরিবর্তিত হয়?" প্রশ্নের স্পষ্ট উত্তর সহ।

- একটি cache হলো সম্প্রতি retrieve করা ডেটার একটি দ্রুত store — একবার জিজ্ঞেস করুন, উত্তর মনে রাখুন। ElastiCache হলো AWS-এর managed caching service, **Redis** (persistence, জটিল ডেটা structure, pub/sub) এবং **Memcached** (pure key-value, horizontal scaling) সমর্থন করে।
- **Cache-aside pattern** (lazy loading): প্রথমে cache check করুন, miss-এ ডেটাবেসে fall back করুন। **TTL** নিয়ন্ত্রণ করে কতক্ষণ ডেটা cached থাকে — short TTL মানে fresh ডেটা এবং বেশি miss; long TTL মানে দ্রুত response এবং সম্ভাব্য staleness।
- সঠিক জিনিস cache করুন: অনেক ব্যবহারকারী জুড়ে শেয়ার করা per-entity ডেটা, প্রতিটি session-এর জন্য অনন্য per-user ডেটা নয়। Cache stampede ঘটে যখন অনেক entry একসাথে expire হয় — TTL jitter দিয়ে প্রশমন করুন।
- **DAX** হলো DynamoDB-only caching-এর জন্য সঠিক পছন্দ। **ElastiCache** multi-source caching এবং Redis data structure-এর জন্য আরো নমনীয়।
- Caching-এর সবচেয়ে কঠিন অংশ হলো invalidation: ডেটা কখন পরিবর্তিত হয় তা জানা এবং এটি লেখা সমস্ত code path জুড়ে cache আপডেট করা। একটি cache তার invalidation কৌশলের মতোই বিশ্বাসযোগ্য।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৩)*

- **পরীক্ষায় Redis বনাম Memcached**: Redis = persistence, replication, জটিল structure, pub/sub। Memcached = simple key-value, pure horizontal scaling। দৃশ্যকল্পে যখন "cached ডেটা হারানো যাবে না" বলা হয়, উত্তর Redis (এটি ডিস্কে persist করে)।
- **ElastiCache ব্যবহারের ক্ষেত্রের সংকেত**: "ডেটাবেস একটি bottleneck", "read-heavy workload", "লেটেন্সি কমান", "session store" — সবই ElastiCache নির্দেশ করে।
- **DAX সংকেত**: "DynamoDB read লেটেন্সি কমান" বা "DynamoDB read অনেক ধীর" → DAX, ElastiCache নয়।
- **Session management**: ElastiCache Redis হলো user session data সংরক্ষণের canonical উত্তর। Stateless application + Redis session store = consistent session সহ horizontal scaling।
- **Write-through বনাম cache-aside**: Cache-aside (lazy loading) সবচেয়ে সাধারণ। Write-through প্রতিটি write-এ cache আপডেট করে — কখনো stale নয়, কিন্তু আরো write অপারেশন। পরীক্ষা তাদের আলাদা করতে পারে।
- **Cache eviction policies**: LRU (least recently used) সাধারণ web workload-এর জন্য সবচেয়ে সাধারণ পরীক্ষার উত্তর।
- **ElastiCache বনাম MemoryDB:** ElastiCache = cache layer, দ্রুত, failure-এ ডেটা হারানো গ্রহণযোগ্য। MemoryDB = durable in-memory primary database, Redis-compatible, multi-AZ transaction log। পরীক্ষার trigger: "Redis-compatible AND durable" বা "primary data store in Redis" → MemoryDB, ElastiCache নয়।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

আপনার নিজের ভাষায়: cache invalidation কী, এবং কেন এটি কঠিন?

*(ইঙ্গিত: Nimbus-এ মেনু ডেটা আপডেট হতে পারে এমন সমস্ত জায়গা নিয়ে ভাবুন — রেস্তোরাঁ অংশীদার portal, একটি admin tool, একটি cron job। এই path-গুলির প্রতিটিকে cache সম্পর্কে জানতে হবে।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি video streaming platform লক্ষ লক্ষ ব্যবহারকারীকে সেবা দেয়। উপলব্ধ চলচ্চিত্রের catalog বিরল ঘটনায় পরিবর্তিত হয় (রাতে আপডেট হয়)। প্রতিটি ব্যবহারকারীর অনুরোধ catalog query করার কারণে অ্যাপ্লিকেশন উচ্চ ডেটাবেস CPU ব্যবহার অনুভব করছে। দল আপডেট থেকে এক ঘণ্টার মধ্যে catalog ডেটা accurate রেখে ডেটাবেস লোড কমাতে চায়।

কোন সমাধানটি এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) ডেটাবেস লোড বিতরণ করতে RDS ডেটাবেসে read replica যোগ করুন  
B) On-demand capacity সহ catalog DynamoDB-তে migrate করুন  
C) Catalog ডেটার জন্য ১ ঘণ্টার TTL সহ ElastiCache for Redis ব্যবহার করুন  
D) আরো সমসাময়িক query সামলাতে RDS instance আকার বাড়ান

**ইঙ্গিত ১**: ডেটা read-heavy এবং বিরল ঘটনায় পরিবর্তিত হয়। এই জন্য কোন pattern আদর্শ?

**ইঙ্গিত ২**: "এক ঘণ্টার মধ্যে accurate" সরাসরি একটি নির্দিষ্ট cache configuration parameter-এ translate হয়।

**ইঙ্গিত ৩**: লক্ষ্য হলো ডেটাবেস লোড *কমানো*, শুধু আরো সামলানো নয়।

**উত্তর**: C

**ব্যাখ্যা**: ElastiCache এক ঘণ্টার TTL সহ প্রতি key-এর প্রথম অনুরোধের পরে catalog ডেটা cache করে। পরবর্তী অনুরোধগুলি ডেটাবেস স্পর্শ না করে cache থেকে return হয়। রাতের আপডেট চলার সময়, entry এক ঘণ্টার মধ্যে expire হয় এবং fresh ডেটা পরবর্তী অনুরোধে লোড হয়।

**কেন A নয়?** Read replica আরো ডেটাবেস node জুড়ে read ট্রাফিক বিতরণ করে কিন্তু মোট query সংখ্যা কমায় না। ঘন ঘন পুনরাবৃত্ত query থেকে ডেটাবেস লোড কমানোর জন্য নয়, read scaling-এর জন্য কার্যকর।

**কেন B নয়?** DynamoDB-তে migrate করলে underlying সমস্যা সমাধান হয় না — catalog ডেটা প্রতিটি ব্যবহারকারীর অনুরোধে এখনো ডেটাবেস (DynamoDB) থেকে fetch হবে।

**কেন D নয়?** Instance আকার বাড়ালে আরো সমসাময়িক query সামলানো যায় কিন্তু query সংখ্যা কমে না। মূল অদক্ষতা থেকে যায়।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৩*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus একটি "trending restaurants" feature যোগ করতে চায়: গত ২৪ ঘণ্টায় অর্ডার volume অনুসারে শীর্ষ ১০ রেস্তোরাঁর একটি ranked list, প্রতি ১৫ মিনিটে আপডেট।

আপনি ElastiCache Redis দিয়ে এটি কীভাবে implement করবেন? Ranking-এর জন্য আপনি কোন Redis data structure ব্যবহার করবেন? আপনার cache TTL কী হবে এবং ঠিক কখন cache আপডেট করবেন?

এছাড়াও বিবেচনা করুন: ElastiCache node ডাউন হলে কী হয়? Feature কি ভাঙে? আপনি এই failure-এর চারপাশে কীভাবে ডিজাইন করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো cache design এবং failure চিন্তা অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo connection pool সেটিংস আপডেট করার আগে Redis integration production-এ push করেছিল। লোডের অধীনে, অ্যাপ্লিকেশন অনেক বেশি Redis connection খুলছিল। তাকে এটি roll back করে সঠিক configuration সহ আবার deploy করতে হয়েছিল।

Leo মেনুর জন্য Redis caching যোগ করল। Page load time 188 মিলিসেকেন্ড থেকে 12 মিলিসেকেন্ডে নামল।

সাতচল্লিশটি DynamoDB call একটি Redis lookup হয়ে গেল। Call ছিল 0.8 মিলিসেকেন্ড।

সে সোমবার standup-এ এটি ঘোষণা করল।

"ভালো কাজ," Priya তার ল্যাপটপ থেকে না তাকিয়ে বলল।

"ধন্যবাদ," Leo বলল।

"আপনি সর্বশেষ Redis auth token কখন rotate করেছেন?"

Leo তার নোট দেখল। "আমি মনে করি না আমি একটি সেট করেছি।"

"তাহলে cache unauthenticated।"

"এটা VPC-এর ভেতরে।"

"আপস করা সবকিছুও তাই।" সে অবশেষে মাথা তুলল। "যদি Leo-র laptop infected হয় এবং কেউ VPC-তে pivot করে, আপনার cache-এ কোনো password নেই।"

Leo তার দিকে তাকাল।

"আমি auth token সেট করব," সে বলল।

পরবর্তী অধ্যায়ে: private network যা Nimbus যা মালিকানাধীন তা বাকি ইন্টারনেট থেকে আলাদা করে।
