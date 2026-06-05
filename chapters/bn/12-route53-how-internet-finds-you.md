# অধ্যায় ১২: ইন্টারনেট আপনাকে কীভাবে খুঁজে পায়

Nimbus চলছিল। Load balancer-এর একটি public IP ছিল। EC2 instance-এর private IP ছিল। ডেটাবেস private subnet-এ locked ছিল। Priya network diagram-এর দিকে মাথা নেড়ে approval দিয়েছিল।

Tom load balancer URL দেখল: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`।

"গ্রাহকরা কি এটা তাদের browser-এ টাইপ করে?" সে জিজ্ঞেস করল।

"এটা AWS স্বয়ংক্রিয়ভাবে assign করে," Maya বলল।

"আমি এটা একটি business card-এ লিখব না।"

"আমিও না।"

তাদের একটি domain name দরকার ছিল। তারা একটি domain registrar থেকে `eatnimbus.com` কিনল। এখন তারা সেই নাম তাদের AWS অবকাঠামোর সাথে সংযুক্ত করতে হবে।

"ইন্টারনেট কীভাবে জানবে যে `eatnimbus.com` মানে us-east-1-এর load balancer?" Leo জিজ্ঞেস করল।

ভালো প্রশ্ন, Leo।

**Phone Book উপমা**

Smartphone-এর আগে, প্রতিটি শহরে একটি phone book ছিল। "Mario's Pizza"-তে পৌঁছাতে, আপনি তাদের ফোন নম্বর মুখস্থ করতেন না — আপনি নাম দেখতেন, নম্বর পেতেন এবং call করতেন।

ইন্টারনেটের নিজস্ব phone book আছে: **Domain Name System (DNS)**।

DNS human-readable নাম (যেমন `eatnimbus.com`) machine-readable IP address-এ (যেমন `203.0.113.42`) translate করে। প্রতিবার আপনি একটি ওয়েবসাইট visit করলে, আপনার কম্পিউটার নীরবে DNS-এ domain name look up করে এবং connect করার IP address পায়।

আপনি আপনার সার্ভারের IP address পরিবর্তন করলে, আপনি DNS record আপডেট করবেন — phone book-এ আপনার নম্বর পরিবর্তন করার মতো — এবং ইন্টারনেট আপনাকে আপনার নতুন অবস্থানে খুঁজে পাবে।

**Route 53-এর সাথে পরিচয়**

Amazon Route 53 হলো AWS-এর managed DNS service। এটিকে Route 53 বলা হয় কারণ port 53 হলো standard DNS port। (কখনো কখনো AWS সরাসরি জিনিসের নাম দেয়।)

Route 53 বেশ কয়েকটি জিনিস করে:

**Domain registration**: আপনি সরাসরি Route 53-এর মাধ্যমে domain name কিনতে পারেন।

**DNS hosting (hosted zone)**: আপনি আপনার domain-এর জন্য একটি *hosted zone* তৈরি করেন, এবং Route 53 সেই DNS record পরিচালনা করে যা বিশ্বকে বলে আপনাকে কোথায় পাওয়া যাবে।

**Health checking**: Route 53 আপনার endpoint monitor করতে এবং unhealthy endpoint থেকে ট্রাফিক সরিয়ে দিতে পারে।

**Traffic routing policy**: Route 53 সহজ DNS-এর বাইরে একাধিক routing strategy সমর্থন করে — weighted, latency-based, geolocation, failover।

**DNS Record: Phone Book Entry**

একটি DNS record একটি নামকে একটি গন্তব্যে map করে। সবচেয়ে সাধারণ type:

**A record**: একটি নামকে একটি IPv4 address-এ map করে।
`eatnimbus.com → 203.0.113.42`

**AAAA record**: একটি নামকে একটি IPv6 address-এ map করে।

**CNAME record**: একটি নামকে অন্য একটি নামে (alias) map করে।
`www.eatnimbus.com → eatnimbus.com`

**MX record**: domain-এর জন্য email handle করার সার্ভার নির্দিষ্ট করে।

**TXT record**: Arbitrary text সংরক্ষণ করে। সাধারণত domain verification (আপনি domain-এর মালিক প্রমাণ করা) এবং email authentication (SPF, DKIM)-এর জন্য ব্যবহৃত।

Nimbus-এর জন্য, primary setup:

- `eatnimbus.com` → load balancer-এর IP নির্দেশকারী A record
- `www.eatnimbus.com` → `eatnimbus.com`-এ নির্দেশকারী CNAME
- `api.eatnimbus.com` → API load balancer নির্দেশকারী A record

"অপেক্ষা করুন," Tom বলল। "Load balancer-এর IP পরিবর্তন হতে পারে। AWS documentation-এ তা বলেছে।"

ভালো ধরা, Tom।

**Alias Record: Dynamic IP-এর AWS সমাধান**

Load balancer, CloudFront distribution এবং S3 ওয়েবসাইটের DNS নাম আছে, static IP address নেই। অন্তর্নিহিত IP পরিবর্তিত হতে পারে।

যদি আপনি একটি load balancer-এর DNS নামে নির্দেশকারী একটি CNAME তৈরি করেন, এটি কাজ করে — কিন্তু আপনি root domain-এ (`eatnimbus.com` `www` ছাড়া) CNAME ব্যবহার করতে পারেন না কারণ DNS standard-এর কারণে।

Route 53 এটি **Alias record** দিয়ে সমাধান করে — DNS-এ একটি AWS-নির্দিষ্ট extension। একটি Alias record সরাসরি একটি AWS resource-এ (load balancer, CloudFront distribution, S3 ওয়েবসাইট) একটি নাম map করে, এবং Route 53 স্বয়ংক্রিয়ভাবে dynamic IP resolution সামলায়। Alias record root domain level-এ ব্যবহার করা যায়। এবং বাইরের পরিষেবায় নিয়মিত DNS query-এর বিপরীতে, AWS resource-এ Alias record query বিনামূল্যে।

"তাহলে আমরা load balancer-এ নির্দেশকারী `eatnimbus.com`-এর জন্য একটি Alias record ব্যবহার করি," Leo নিশ্চিত করল।

"এবং Route 53 যেকোনো মুহূর্তে load balancer যে IP ব্যবহার করছে তা সামলায়," Priya যোগ করল।

"বিনামূল্যে," Tom বলল, হঠাৎ খুব আগ্রহী।

**Routing Policy: শুধু "কোথায়?" এর বাইরে**

এখানেই Route 53 আকর্ষণীয় হয়। DNS শুধু একটি lookup service নয় — এটি একটি traffic management সরঞ্জাম হতে পারে।

**Simple routing**: একটি record, একটি গন্তব্য। Standard DNS।

**Weighted routing**: Weight দ্বারা একাধিক গন্তব্যের মধ্যে ট্রাফিক বিভক্ত করুন। Migration-এর সময় নতুন সার্ভারে ৯০% পাঠান, পুরানোতে ১০%। নতুন সার্ভারে আপনার confidence না আসা পর্যন্ত weight সামঞ্জস্য করুন, তারপর ১০০%-এ switch করুন।

**Latency-based routing**: ব্যবহারকারীদের সর্বনিম্ন latency-সহ AWS region-এ route করুন। Seattle-এর একজন ব্যবহারকারী `us-west-2`-এ route হয়। Tokyo-র একজন ব্যবহারকারী `ap-northeast-1`-এ route হয়। একই domain name, ভিন্ন গন্তব্য।

**Geolocation routing**: ব্যবহারকারীর ভৌগোলিক অবস্থানের উপর ভিত্তি করে route করুন। সমস্ত European ব্যবহারকারী `eu-west-1`-এ যায়। সমস্ত North American ব্যবহারকারী `us-east-1`-এ যায়। ডেটা সার্বভৌমত্ব (EU ব্যবহারকারীর ডেটা EU region-এ রাখা) বা content customization (ভাষা, মুদ্রা)-র জন্য দরকারী।

**Failover routing**: একটি primary এবং একটি secondary endpoint মনোনীত করুন। Primary Route 53-এর health check ব্যর্থ হলে, ট্রাফিক স্বয়ংক্রিয়ভাবে secondary-তে redirect হয়। এটি disaster recovery-এর DNS layer।

**Multivalue answer routing**: একটি query-এর জন্য আটটি পর্যন্ত healthy IP address return করুন, client-কে বেছে নিতে দিন। একাধিক সার্ভার জুড়ে ট্রাফিক বিতরণের জন্য একটি load balancer-এর সহজ বিকল্প।

"তাহলে Route 53 শুধু একটি phone book নয়," Maya বলল। "এটি একটি smart phone book যা আপনি কোথা থেকে call করছেন তার উপর ভিত্তি করে call route করতে পারে।"

"এবং নম্বর অস্বাস্থ্যকর হলে disconnect করতে পারে," Priya যোগ করল।

**Health Check: Failure-এর চারপাশে Routing**

Route 53 health check দিয়ে আপনার endpoint monitor করতে পারে। একটি endpoint ব্যর্থ হলে, Route 53 পারে:

- DNS response থেকে এটি সরিয়ে দিন (সেখানে ট্রাফিক পাঠানো বন্ধ করুন)
- একটি backup endpoint-এ failover trigger করুন
- CloudWatch-এর মাধ্যমে একটি alert পাঠান

Health check হলো DNS routing এবং প্রকৃত অ্যাপ্লিকেশন health-এর মধ্যে সংযোগ। একটি failover configuration-এ: Route 53 প্রতি ৩০ সেকেন্ডে primary endpoint monitor করে। পরপর তিনটি check ব্যর্থ হলে, Route 53 secondary endpoint-এর address return করা শুরু করে।

এটি তাৎক্ষণিক নয় — DNS-এর propagation time আছে। Route 53 একটি DNS record পরিবর্তন করলে, বিশ্বজুড়ে DNS resolver-গুলিকে পরিবর্তন তুলে নিতে হবে, যা TTL সেটিংয়ের উপর নির্ভর করে সেকেন্ড থেকে মিনিট সময় নিতে পারে।

**TTL: DNS Cache**

DNS response একাধিক level-এ cached হয় — আপনার router-এ, আপনার ISP-তে, আপনার browser-এ। একটি DNS record-এ **TTL (Time-To-Live)** cache-গুলিকে বলে পুনরায় check করার আগে কতক্ষণ উত্তর মনে রাখবে।

High TTL (১ ঘণ্টা বা তার বেশি): কম DNS query, Route 53-এ কম লোড, কিন্তু পরিবর্তন propagate হতে বেশি সময় লাগে।

Low TTL (৬০ সেকেন্ড বা তার কম): পরিবর্তন দ্রুত propagate হয়, কিন্তু আরো DNS query প্রয়োজন।

একটি পরিকল্পিত migration-এর আগে (নতুন সার্ভার নির্দেশ করতে DNS আপডেট করা), একদিন আগে TTL ৬০ সেকেন্ডে কমিয়ে দিন। তারপর পরিবর্তন করলে, এটি প্রায় এক মিনিটে propagate হয়। Migration-এর পরে, এটি সাধারণ মানে ফিরিয়ে দিন।

"আমরা শুধু migration-এর সময় কমালে এবং আগে না করলে," Leo ধীরে ধীরে বলল, "পুরানো TTL মানে কিছু ব্যবহারকারী এক ঘণ্টা পুরানো সার্ভার দেখবে।"

"ঠিক," Priya বলল। "DNS migration-এ migration-এর আগে পরিকল্পনা প্রয়োজন, শুধু সময়কালে নয়।"

## শক্তি এবং সীমাবদ্ধতা

**Route 53 সঠিক পছন্দ**: সম্পূর্ণ AWS-এর ভেতরে domain name নিবন্ধন এবং পরিচালনার জন্য; একাধিক endpoint জুড়ে latency, geolocation বা weighted distribution-এর উপর ভিত্তি করে ট্রাফিক routing-এর জন্য; region বা primary এবং disaster-recovery endpoint-এর মধ্যে health-check-based failover-এর জন্য; alias record-এর মাধ্যমে অন্যান্য AWS পরিষেবার সাথে DNS integrate করার জন্য।

**Route 53 যখন আপনার প্রয়োজন নয়**: Route 53 একটি DNS service, load balancer নয়। একটি region-এর মধ্যে একাধিক সার্ভার বা container-এর মধ্যে ট্রাফিক বিতরণ করতে হলে, ALB ব্যবহার করুন — Route 53 load balancer-এর মতো connection level-এ weighted round-robin করতে পারে না। Region জুড়ে latency-based routing খরচ এবং পরিচালনামূলক জটিলতা যোগ করে যা শুধুমাত্র তখনই অর্থপূর্ণ হয় যখন আপনার ব্যবহারকারীরা সত্যিই বৈশ্বিকভাবে বিতরণ করা এবং millisecond conversion-এর জন্য গুরুত্বপূর্ণ।

## সারসংক্ষেপ

- **DNS** domain name-কে IP address-এ translate করে — ইন্টারনেটের phone book।
- **Route 53** হলো AWS-এর managed DNS service: domain registration, DNS hosting, health check এবং routing policy।
- **A record** নাম IPv4 address-এ map করে। **CNAME** নাম অন্য নামে map করে। **Alias record** নাম AWS resource-এ (load balancer, CloudFront, S3) map করে।
- Root domain এবং dynamic IP সহ resource-এর জন্য CNAME নয়, Alias record ব্যবহার করুন।
- Routing policy সহজ DNS-এর বাইরে: **weighted** (ট্রাফিক বিভাজন), **latency-based** (পারফরম্যান্স), **geolocation** (ডেটা সার্বভৌমত্ব), **failover** (disaster recovery)।
- **Health check** endpoint monitor করে এবং স্বয়ংক্রিয়ভাবে DNS response থেকে unhealthy target সরায়।
- Migration-এর আগে TTL পরিবর্তন পরিকল্পনা করুন — পরিবর্তন দ্রুত propagate হওয়ার জন্য আগে থেকে TTL কমিয়ে দিন।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৪)*

- **Alias বনাম CNAME**: Alias record root domain-এ ব্যবহার করা যায়; CNAME পারে না। AWS resource-এ Alias record query বিনামূল্যে; CNAME DNS query-এর দাম আছে। পরীক্ষায় একটি load balancer-এ root domain map করার প্রশ্ন থাকলে → Alias record।
- **Routing policy ব্যবহারের ক্ষেত্র** (সাধারণ পরীক্ষার দৃশ্যকল্প):
  - "ধীরে ধীরে একটি নতুন সংস্করণে ট্রাফিক migrate করুন" → Weighted routing
  - "ব্যবহারকারীদের নিকটতম AWS region-এ route করুন" → Latency-based routing
  - "EU ব্যবহারকারীর ডেটা EU region-এ রাখুন" → Geolocation routing
  - "Primary ডাউন হলে স্বয়ংক্রিয় DNS failover" → Health check সহ Failover routing
- **Route 53 health check**: HTTP/HTTPS/TCP endpoint check করতে পারে, এবং CloudWatch alarm trigger করতে পারে। পরীক্ষায় এগুলি disaster recovery দৃশ্যকল্পে ব্যবহার করে।
- **TTL এবং propagation**: TTL DNS resolver কতক্ষণ একটি record cache করে তা নিয়ন্ত্রণ করে জানুন। Short TTL = দ্রুত পরিবর্তন। পরীক্ষার দৃশ্যকল্প: "দল DNS আপডেট করল কিন্তু ব্যবহারকারীরা এখনো পুরানো সার্ভার hit করছে" → TTL অনেক বেশি।
- **Private hosted zone**: Route 53 একটি VPC-এর ভেতরে শুধুমাত্র resolve হওয়া DNS record তৈরি করতে পারে। পরীক্ষায় internal service discovery-এর জন্য এটি ব্যবহার করে (যেমন, একটি private RDS endpoint-এ resolve করছে `database.internal`)।
- Route 53 হলো **global** — এটি একটি region-এ deploy করা হয় না। Hosted zone তৈরি করার সময় কোনো region selection প্রয়োজন নেই।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

একটি CNAME record এবং একটি Alias record-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। আপনি কখন প্রতিটি ব্যবহার করবেন?

*(ইঙ্গিত: root domain-এ CNAME-এর constraint এবং dynamic AWS resource-এর সাথে Alias record-এর আচরণ বিবেচনা করুন।)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি মিডিয়া কোম্পানি দুটি AWS region থেকে একটি ওয়েবসাইট পরিচালনা করে: `us-east-1` (primary) এবং `eu-west-1` (secondary)। Primary region unavailable হলে দল চায় ট্রাফিক স্বয়ংক্রিয়ভাবে `eu-west-1`-এ route হোক। কোম্পানি প্রকৃতপক্ষে primary region নামিয়ে না দিয়েও এই failover mechanism সঠিকভাবে কাজ করে কিনা তা যাচাই করতে চায়।

কোন Route 53 configuration এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) `us-east-1`-এ ১০০% weight এবং `eu-west-1`-এ ০% weight সহ Weighted routing  
B) উভয় endpoint-এ health check সহ Latency-based routing  
C) Primary endpoint-এ health check এবং `eu-west-1` নির্দেশকারী secondary record সহ Failover routing  
D) North America `us-east-1`-এ এবং Europe `eu-west-1`-এ নির্দেশকারী Geolocation routing

**ইঙ্গিত ১**: প্রয়োজনীয়তা হলো primary ডাউন হলে স্বয়ংক্রিয় failover। কোন routing policy ঠিক এই জন্য ডিজাইন করা?

**ইঙ্গিত ২**: "Primary region না নামিয়ে test" — health check ম্যানুয়ালি "unhealthy" সেট করা যায় testing-এর জন্য।

**ইঙ্গিত ৩**: Latency-based routing গতির জন্য optimize করে, failover-এর জন্য নয়।

**উত্তর**: C

**ব্যাখ্যা**: Failover routing ঠিক এই ব্যবহারের ক্ষেত্রের জন্য ডিজাইন করা। Primary record একটি health check সহ `us-east-1`-এ নির্দেশ করে। Secondary record `eu-west-1`-এ নির্দেশ করে। Health check ব্যর্থ হলে, Route 53 স্বয়ংক্রিয়ভাবে secondary record পরিবেশন করে। Primary region প্রকৃতপক্ষে ব্যাহত না করে testing-এর জন্য health check ম্যানুয়ালি ব্যর্থ হতে বাধ্য করা যায়।

**কেন A নয়?** ১০০%/০% সহ Weighted routing কার্যকরভাবে static — primary ব্যর্থ হলে এটি স্বয়ংক্রিয়ভাবে switch করে না।

**কেন B নয়?** Latency-based routing প্রতিটি ব্যবহারকারীর জন্য দ্রুততম endpoint বেছে নেয়। এটি health-এর উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে একটি region exclude করে না — latency favor করলে এটি এখনো unhealthy `us-east-1`-এ কিছু ট্রাফিক route করবে।

**কেন D নয়?** Geolocation routing ব্যবহারকারীর অবস্থান দ্বারা route করে, endpoint health দ্বারা নয়। European ব্যবহারকারীরা `eu-west-1`-এ আটকে থাকবে এমনকি `us-east-1` সুস্থ থাকলেও, এবং North American ব্যবহারকারীরা `us-east-1` ডাউন হলেও `eu-west-1`-এ failover করবে না।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৪*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus আন্তর্জাতিকভাবে expand করছে। তারা চায় পশ্চিম উপকূল, পূর্ব উপকূল এবং Australia-র ব্যবহারকারীদের জন্য `eatnimbus.com` দ্রুত লোড হোক। তাদের একটি নিয়ন্ত্রক প্রয়োজনীয়তাও আছে: European ব্যবহারকারীদের দেওয়া অর্ডার EU সার্ভারে প্রক্রিয়া করতে হবে।

উভয় প্রয়োজনীয়তা পূরণ করে এমন একটি Route 53 routing কৌশল design করুন। আপনি কোন routing policy বা policy-র সংমিশ্রণ ব্যবহার করবেন? প্রতিটি region-এ আপনার কোন অবকাঠামো প্রয়োজন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো multi-region routing design অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

`eatnimbus.com` live ছিল।

Maya তার browser-এ এটি টাইপ করেছিল, এবং Nimbus ordering page লোড হয়েছিল। সে তার নিজের পরিবারের রেস্তোরাঁ থেকে arepa অর্ডার করেছিল, শুধু flow test করতে। অর্ডার চলে গিয়েছিল। রান্নাঘর সেটি পেয়েছিল।

সে পিছনে হেলান দিল।

Tom ইতিমধ্যে Route 53 health check log পড়ছিল। "us-east-1 থেকে response time হলো ৪৭ মিলিসেকেন্ড।"

"এটা কি দ্রুত?" Maya জিজ্ঞেস করল।

"DNS-এর জন্য? হ্যাঁ।"

"কিন্তু Seattle-র একজন ব্যবহারকারীর জন্য?"

Tom latency graph দেখল। "প্রায় ৮০ মিলিসেকেন্ড।"

Maya সেটা নিয়ে ভাবল। "আমাদের বেশিরভাগ গ্রাহক পশ্চিম উপকূলে, এবং আমাদের সার্ভার Virginia-তে..."

"প্রতিটি অনুরোধ Seattle থেকে Virginia এবং ফিরে ভ্রমণ করে," Leo ঘরের ওপার থেকে বলল। "আলোর গতি। আপনি physics beat করতে পারবেন না।"

"তাহলে আমাদের Seattle-এর কাছাকাছি সার্ভার দরকার।"

"অথবা Seattle-এর কাছাকাছি এমন কিছু যা তাদের পক্ষ থেকে content পরিবেশন করে।"

সেই চিন্তাটা বাতাসে ঝুলে রইল।

পরবর্তী অধ্যায়ে: warehouse যা Nimbus-এর content প্রতিটি ব্যবহারকারীর এক মিলিসেকেন্ড কাছে রাখে, সর্বত্র।
