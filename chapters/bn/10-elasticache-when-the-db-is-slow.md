# অধ্যায় ১০: ডেটাবেস খুব ধীর হলে

Page load metrics স্ক্রিনে খোলা ছিল। Leo বিশ মিনিট ধরে কিছু না বলে সেগুলি দেখছিল।

প্রতি page load-এ সাতচল্লিশটি DynamoDB অনুরোধ। শুধু ডেটা retrieve করতে একশত আটাশি মিলিসেকেন্ড — ব্রাউজার একটি pixel render করার আগেই।

সে গণনা করেছিল। শুক্রবার সন্ধ্যায় দশ হাজার সমসাময়িক ব্যবহারকারী: প্রতি মিনিটে চার লক্ষ সত্তর হাজার DynamoDB read। খরচ বাস্তব ছিল। কিন্তু লেটেন্সি ছিল প্রকৃত সমস্যা। Nimbus browse page খোলা একজন ব্যবহারকারী একটি দ্রুত সংযোগে প্রায় দুইশত মিলিসেকেন্ড অপেক্ষা করে যতক্ষণ না কিছু দেখা যায়।

"ডেটাবেস প্রতি অনুরোধে চার মিলিসেকেন্ডে সাড়া দিচ্ছে," Leo বলল। "এটা আসলে দ্রুত। DynamoDB তার কাজ করছে।"

"তাহলে page কেন ধীর?" Maya জিজ্ঞেস করল।

"কারণ আমরা প্রতি page load-এ এটিকে সাতচল্লিশবার call করছি," Priya বলল। "সমস্যা ডেটাবেস নয়। সমস্যা হলো আমরা এটিকে অনেক বেশি কথা বলছি।"

Tom সামনে ঝুঁকল। তার সেই দেখা ছিল যখন একটি সমস্যা একটি খরচ কথোপকথন হতে চলেছে। "তাহলে সমাধান হলো এটির সাথে কম কথা বলা?"

"কম কথা বলা। বেশি মনে রাখা।"

**রেস্তোরাঁর উপমা**

একটি রেস্তোরাঁর রান্নাঘর কল্পনা করুন। প্রতিবার একজন ওয়েটারকে দিনের বিশেষ কী জানতে হয়, সে পেছনে হেঁটে যায়, শেফকে জিজ্ঞেস করে এবং টেবিলে ফিরে আসে।

দুজন ওয়েটার এবং তিনটি টেবিল থাকলে এটি ঠিক আছে।

এখন দুইশত ওয়েটার এবং এক হাজার টেবিল কল্পনা করুন। তাদের প্রত্যেকেই একই প্রশ্নের জন্য পেছনে হেঁটে যাচ্ছে। রান্নাঘর bottleneck হয়। শেফ ঘণ্টায় চারশতবার একই প্রশ্নের উত্তর দিচ্ছে।

স্পষ্ট সমাধান: রেস্তোরাঁর সামনে একটি board-এ বিশেষ লিখুন। প্রতিটি ওয়েটার board থেকে পড়ে। রান্নাঘর বিশ্রাম পায়। বিশেষ পরিবর্তিত হলে board আপডেট হয়।

সেই board হলো একটি cache।

একটি cache হলো সম্প্রতি retrieve করা ডেটার একটি দ্রুত, local store। একটি ধীর উৎস থেকে একই জিনিস বারবার fetch করার পরিবর্তে, আপনি একবার fetch করেন এবং কাছাকাছি রাখেন।

**কেন শুধু মেমরি ব্যবহার করবেন না?**

"আমরা কি অ্যাপ্লিকেশনের মেমরিতে মেনু সংরক্ষণ করতে পারি না?" Leo জিজ্ঞেস করল।

বৈধ প্রশ্ন।

আপনি পারেন। একটি single-server অ্যাপ্লিকেশনের জন্য, in-memory caching ঠিক কাজ করে। কিন্তু Nimbus একটি load balancer-এর পেছনে, একাধিক EC2 instance জুড়ে চলে। যদি একটি instance তার মেমরিতে মেনু cache করে, অন্য instance গুলির সেই ডেটা থাকে না। তারা প্রত্যেকে আলাদা cache বজায় রাখে। মেনু আপডেট হলে, আপনাকে সেগুলির সব invalidate করতে হবে।

এটি হলো *cache coherence সমস্যা* — একাধিক cache সামঞ্জস্যপূর্ণ রাখা।

ElastiCache এটি একটি *centralized* cache প্রদান করে সমাধান করে যা আপনার সমস্ত instance ভাগ করে। প্রতিটি সার্ভারের নিজস্ব মেমরির পরিবর্তে, প্রতিটি সার্ভার একই cache থেকে পড়ে এবং লেখে। একটি আপডেট সবার কাছে propagate হয়।

**ElastiCache-এর সাথে পরিচয়**

Amazon ElastiCache হলো একটি managed caching service। এটি জনপ্রিয় caching engine — Redis এবং Memcached — চালায় আপনাকে সার্ভার পরিচালনা না করে।

**Redis** দুটির মধ্যে আরো শক্তিশালী। এটি জটিল ডেটা structure (string, list, set, hash, sorted set), persistence (ডেটা restart-এ টিকে থাকে), replication এবং pub/sub messaging সমর্থন করে। Redis caching-এর বাইরে আরো করতে পারে — এটি একটি lightweight data store হিসেবে কাজ করতে পারে।

**Memcached** সহজ। Pure key-value caching, horizontally scalable, কোনো persistence নেই। সহজ ব্যবহারের ক্ষেত্রে দ্রুত কিন্তু কম feature।

Nimbus-এর জন্য: Redis। তাদের মেনু ডেটা (structured), session token (key-value) cache করতে হবে এবং পরে "trending restaurants" ranking-এর জন্য sorted set চাইবে।

**Caching ব্যবহারিকভাবে কীভাবে কাজ করে**

মূল caching pattern **cache-aside** নামে পরিচিত (lazy loading-ও বলা হয়):

১. অ্যাপ্লিকেশনের ডেটা দরকার
২. প্রথমে cache check করুন
৩. পাওয়া গেলে (*cache hit*): তাৎক্ষণিকভাবে ডেটা return করুন
৪. না পাওয়া গেলে (*cache miss*): ডেটাবেসে যান, ডেটা পান, cache-এ সংরক্ষণ করুন, return করুন

Pseudocode-এ:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # ৫ মিনিট cache করুন
return menuData
```

প্রথম অনুরোধ সবসময় ডেটাবেস hit করে। পরবর্তী প্রতিটি অনুরোধ cache hit করে। একটি cache দিয়ে, Nimbus-এর প্রতি page load-এ সাতচল্লিশটি DynamoDB read এক বা দুটি cache lookup হয়ে যায়। দ্রুত, সস্তা এবং scalable।

**TTL: কতক্ষণ মনে রাখবেন?**

প্রতিটি cache entry-র একটি **Time-To-Live (TTL)** আছে: মেয়াদ যার পরে entry expire হয় এবং পরবর্তী অনুরোধ fresh ডেটার জন্য ডেটাবেসে ফিরে যায়।

এটি caching-এর মূল উত্তেজনা: freshness বনাম পারফরম্যান্স।

- **Short TTL (সেকেন্ড)**: খুব fresh ডেটা, কিন্তু অনেক cache miss। Cache খুব কমই সাহায্য করে।
- **Long TTL (ঘণ্টা বা দিন)**: খুব দ্রুত, কিন্তু ডেটা stale হতে পারে। গ্রাহক গতকালের মেনু দেখে।

মেনু ডেটার জন্য, পাঁচ মিনিট যুক্তিসঙ্গত। মেনু প্রতি সেকেন্ডে পরিবর্তিত হয় না। যদি একটি রেস্তোরাঁ তাদের মেনু আপডেট করে, গ্রাহকরা পাঁচ মিনিট পর্যন্ত পুরানো সংস্করণ দেখতে পারে — গ্রহণযোগ্য।

Session token (এই ব্যবহারকারী কি লগ ইন করেছে?)-এর জন্য, shorter TTL অর্থপূর্ণ, অথবা session পরিবর্তিত হলে আপনি তাৎক্ষণিকভাবে cache আপডেট করেন।

আর্থিক ডেটার জন্য (অর্ডার মোট, পেমেন্ট রেকর্ড), cache করবেন না — অথবা যদি করেন, write-এ তাৎক্ষণিকভাবে invalidate করুন।

"কম্পিউটার বিজ্ঞানে শুধু দুটি কঠিন সমস্যা আছে," Leo উদ্ধৃত করল, আগে বলেছিল এমন কারো practiced delivery সহ। "Cache invalidation এবং naming things।"

"Cache invalidation কেন কঠিন?" Maya জিজ্ঞেস করল।

"কারণ ডেটা *আসলে* কখন পরিবর্তিত হয়? মেনু কি একজন রেস্তোরাঁ অংশীদার আপডেট করার কারণে পরিবর্তিত হয়েছে? নাকি একটি cron job চলার কারণে? নাকি একজন admin ম্যানুয়ালি সম্পাদনা করার কারণে? ডেটা পরিবর্তন করতে পারে এমন প্রতিটি জায়গা cache-কে বলতে জানতে হবে।"

এজন্যই senior engineer "চলুন Redis যোগ করি" দিয়ে শুরু করার পরিবর্তে "write path গুলি কী?" দিয়ে একটি caching কথোপকথন শুরু করে।

**Cache Eviction: Board পূর্ণ হলে**

বিশেষ board-এ সীমিত জায়গা আছে। পূর্ণ হলে, নতুন জায়গা করতে কিছু মুছতে হয়।

Redis (এবং সাধারণভাবে cache) *eviction policy* থাকে যা মেমরি পূর্ণ হলে কী সরানো হবে নির্ধারণ করে:

- **LRU (Least Recently Used)**: সবচেয়ে দীর্ঘ সময় অ্যাক্সেস না হওয়া item সরান।
- **LFU (Least Frequently Used)**: সবচেয়ে কম অ্যাক্সেস হওয়া item সরান।
- **allkeys-random**: Random eviction। সহজ, সর্বোত্তম নয়।
- **noeviction**: মেমরি পূর্ণ হলে error return করুন (অ্যাপ্লিকেশনকে এটি সামলাতে হবে)।

বেশিরভাগ ওয়েব অ্যাপ্লিকেশনের জন্য: LRU। যে জিনিসগুলি আপনি সম্প্রতি দেখেননি সেগুলি সম্ভবত কম প্রয়োজন।

**Redis-এর জন্য ElastiCache: আপনি কী Managed পান**

RDS-এর মতো, ElastiCache একটি open-source সরঞ্জাম নেয় এবং পরিচালনামূলক কাজ সামলায়:

- **স্বয়ংক্রিয় ব্যাকআপ**: schedule-এ Redis snapshot
- **Multi-AZ replication**: Primary node + ভিন্ন AZ-এ read replica
- **স্বয়ংক্রিয় failover**: Primary Redis node ব্যর্থ হলে, একটি replica স্বয়ংক্রিয়ভাবে promote হয়
- **Cluster mode**: খুব বড় cache-এর জন্য একাধিক node জুড়ে horizontal sharding
- **এনক্রিপশন**: সম্মতির জন্য in-transit এবং at-rest এনক্রিপশন
- **VPC integration**: Cache আপনার private network-এ চলে, publicly accessible নয়

Tom feature list দেখল। "এর দাম কত?"

"আমরা যে DynamoDB read replace করছি তার চেয়ে কম," Leo বলল। "আমি numbers run করেছি।"

Tom-এর expression skeptical থেকে interested-এ পরিবর্তিত হলো। এটি progress ছিল।

## শক্তি এবং সীমাবদ্ধতা

**Caching কেন শক্তিশালী**:

- নাটকীয়ভাবে ডেটাবেস লোড কমায় (কম query, কম খরচ)
- Cache hit-এর জন্য sub-millisecond response time
- ট্রাফিক স্পাইক থেকে আপনার ডেটাবেস রক্ষা করে
- Redis সরল key-value store-এর চেয়ে সমৃদ্ধ ডেটা structure সমর্থন করে

**Caching কোথায় জটিল হয়**:

- Cache invalidation সত্যিই কঠিন — stale ডেটা bug ঘটায়
- পরিচালনামূলক জটিলতা যোগ করে (monitor করার জন্য আরো একটি পরিষেবা, আরো একটি failure point)
- Cold start সমস্যা: fresh deploy করলে, cache খালি — ডেটাবেস সম্পূর্ণ লোড নেয়
- Cache stampede: যদি একসাথে অনেক entry expire হয়, সমস্ত অনুরোধ একসাথে ডেটাবেস hit করে
- ElastiCache node বিনামূল্যে নয় — আপনি idle থাকলেও পেমেন্ট করেন

**ElastiCache বনাম DynamoDB DAX**:

আপনি যদি বিশেষভাবে DynamoDB ডেটা cache করছেন, AWS **DAX (DynamoDB Accelerator)** অফার করে — DynamoDB-এর জন্য একটি উদ্দেশ্য-নির্মিত in-memory cache। DAX আপনার অ্যাপ্লিকেশন code-এ transparent (একই API), DynamoDB read লেটেন্সি microsecond-এ কমায় এবং স্বয়ংক্রিয়ভাবে cache invalidation সামলায়।

আপনার bottleneck DynamoDB read হলে DAX ব্যবহার করুন। যেকোনো ডেটা উৎসের জন্য general-purpose cache দরকার হলে ElastiCache ব্যবহার করুন।

## সারসংক্ষেপ

- একটি cache হলো সম্প্রতি retrieved ডেটার একটি দ্রুত store — একবার জিজ্ঞেস করুন, উত্তর মনে রাখুন।
- ElastiCache হলো AWS-এর managed caching service, Redis এবং Memcached সমর্থন করে।
- **Redis** সমৃদ্ধ (জটিল ডেটা structure, persistence, pub/sub)। **Memcached** সহজ (pure key-value, horizontally scalable)।
- **Cache-aside pattern** (lazy loading): প্রথমে cache check করুন, miss-এ ডেটাবেসে fall back করুন।
- **TTL** কতক্ষণ ডেটা cached থাকে তা নিয়ন্ত্রণ করে। Short TTL = fresh, অনেক miss। Long TTL = দ্রুত, সম্ভাব্য stale।
- Cache invalidation কঠিন। Cache যোগ করার আগে সমস্ত write path জানুন।
- ElastiCache replication, failover, ব্যাকআপ এবং এনক্রিপশন পরিচালনা করে — আপনি cache design-এ focus করেন।
- **DAX** হলো DynamoDB-নির্দিষ্ট cache। ElastiCache general-purpose।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৩)*

- **পরীক্ষায় Redis বনাম Memcached**: Redis = persistence, replication, জটিল structure, pub/sub। Memcached = simple key-value, pure horizontal scaling। দৃশ্যকল্পে যখন "cached ডেটা হারানো যাবে না" বলা হয়, উত্তর Redis (এটি ডিস্কে persist করে)।
- **ElastiCache ব্যবহারের ক্ষেত্রের সংকেত**: "ডেটাবেস bottleneck", "read-heavy workload", "লেটেন্সি কমান", "session store" — সবই ElastiCache নির্দেশ করে।
- **DAX সংকেত**: "DynamoDB read লেটেন্সি কমান" বা "DynamoDB read অনেক ধীর" → DAX, ElastiCache নয়।
- **Session management**: ElastiCache Redis হলো user session data সংরক্ষণের canonical উত্তর। Stateless application + Redis session store = consistent session সহ horizontal scaling।
- **Write-through বনাম cache-aside**: Cache-aside (lazy loading) সবচেয়ে সাধারণ। Write-through প্রতিটি write-এ cache আপডেট করে — কখনো stale নয়, কিন্তু আরো write অপারেশন। পরীক্ষা তাদের আলাদা করতে পারে।
- **Cache eviction policies**: LRU (least recently used) সাধারণ web workload-এর জন্য সবচেয়ে সাধারণ পরীক্ষার উত্তর।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

আপনার নিজের ভাষায়: cache invalidation কী, এবং কেন এটি কঠিন?

*(ইঙ্গিত: Nimbus-এ মেনু ডেটা আপডেট হতে পারে এমন সমস্ত জায়গা নিয়ে ভাবুন — রেস্তোরাঁ অংশীদার portal, একটি admin tool, একটি cron job। এই path-গুলির প্রতিটিকে cache সম্পর্কে জানতে হবে।)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

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

**কেন A নয়?** Read replica আরো ডেটাবেস node জুড়ে read ট্রাফিক বিতরণ করে কিন্তু মোট query সংখ্যা কমায় না। ঘন ঘন পুনরাবৃত্ত query scaling-এর জন্য কার্যকর, ডেটাবেস লোড কমানোর জন্য নয়।

**কেন B নয়?** DynamoDB-তে migrate করলে underlying সমস্যা সমাধান হয় না — catalog ডেটা প্রতিটি ব্যবহারকারীর অনুরোধে ডেটাবেস (DynamoDB) থেকে এখনো fetch হবে।

**কেন D নয়?** Instance আকার বাড়ালে আরো সমসাময়িক query সামলানো যায় কিন্তু query সংখ্যা কমে না। মূল অদক্ষতা থাকে।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৩*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus একটি "trending restaurants" feature যোগ করতে চায়: গত ২৪ ঘণ্টায় অর্ডার volume অনুসারে শীর্ষ ১০ রেস্তোরাঁর একটি ranked list, প্রতি ১৫ মিনিটে আপডেট।

আপনি ElastiCache Redis দিয়ে এটি কীভাবে implement করবেন? Ranking-এর জন্য আপনি কোন Redis data structure ব্যবহার করবেন? আপনার cache TTL কী হবে এবং ঠিক কখন cache আপডেট করবেন?

এছাড়াও বিবেচনা করুন: ElastiCache node ডাউন হলে কী হয়? Feature কি ভাঙে? আপনি এই failure-এর চারপাশে কীভাবে ডিজাইন করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো cache design এবং failure চিন্তা অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Leo মেনুর জন্য Redis caching যোগ করল। Page load time ১৮৮ মিলিসেকেন্ড থেকে ১২ মিলিসেকেন্ডে নামল।

সাতচল্লিশটি DynamoDB call একটি Redis lookup হয়ে গেল। Call ছিল ০.৮ মিলিসেকেন্ড।

সে সোমবার standup-এ এটি ঘোষণা করল।

"ভালো কাজ," Priya তার ল্যাপটপ থেকে না তাকিয়ে বলল।

"ধন্যবাদ," Leo বলল।

"আপনি সর্বশেষ Redis auth token কখন rotate করেছেন?"

Leo তার নোট দেখল। "আমি মনে করি আমি একটি set করিনি।"

"তাহলে cache unauthenticated।"

"এটা VPC-এর ভেতরে।"

"আপস করা সবকিছুও তাই।" সে অবশেষে মাথা তুলল। "যদি Leo-র laptop infected হয় এবং কেউ VPC-তে pivot করে, আপনার cache-এ কোনো password নেই।"

Leo তার দিকে তাকাল।

"আমি auth token set করব," সে বলল।

পরবর্তী অধ্যায়ে: private network যা Nimbus মালিকানাধীন থেকে বাকি ইন্টারনেট আলাদা করে।
