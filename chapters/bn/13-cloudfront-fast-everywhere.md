# অধ্যায় ১৩: সর্বত্র দ্রুত

Virginia-র একটি সার্ভার থেকে Seattle-এর একটি ফোনে ভ্রমণকারী একটি ফটো মোটামুটি ৪,৪০০ কিলোমিটার fiber optic cable অতিক্রম করে। আলোর দুই-তৃতীয়াংশ গতিতে, এটি প্রায় ২৫ মিলিসেকেন্ড순수 physics — অনিবার্য, অলঙ্ঘনীয়, মহাবিশ্বের নিয়মে baked in।

তারপর round trip যোগ করুন। তারপর processing time। Browser এখনো render শুরু করেনি এবং ৮০ মিলিসেকেন্ড চলে গেছে।

`eatnimbus.com` live ছিল। Leo পশ্চিম উপকূলের ব্যবহারকারীদের কাছ থেকে latency metrics check করেছিল: প্রতি অনুরোধে ৮০-১০০ মিলিসেকেন্ড। এটি ছোট মনে হতে পারে, কিন্তু এটি যোগ হয়।

মেনু লোড করুন: ৯০ms। রেস্তোরাঁর তালিকা লোড করুন: ৮০ms। রেস্তোরাঁর ফটো লোড করুন: ২০০ms (ইমেজ বড়)। একজন ব্যবহারকারী অর্ডার দেওয়ার আগে মোট সময়: একটি ভালো connection-এ আধা সেকেন্ডেরও বেশি।

"Physics সমস্যা," Leo বলল। "সার্ভার Virginia-তে। ব্যবহারকারীরা পশ্চিম উপকূলে।"

"তাহলে পশ্চিম উপকূলে সার্ভার সরান," Tom বলল।

"সেটা অর্থ ব্যয় করে।"

"কত?"

"অনেক। এবং এটি একটি সম্পূর্ণ নতুন সমস্যা তৈরি করে: পূর্ব উপকূলের ডেটাবেস এবং পশ্চিম উপকূলের ডেটাবেস sync-এ রাখা।"

Priya তার laptop থেকে মাথা তুলল। "অথবা আমরা সার্ভার সরাই না। আমরা *content* সরাই।"

**Pre-Stocked Warehouse উপমা**

Amazon retailer কল্পনা করুন, cloud company নয়। তাদের একটি location-এ প্রতিটি product সহ একটি বিশাল warehouse আছে। তারা প্রতিটি order সেই একটি warehouse থেকে ship করলে, দূরবর্তী শহরের গ্রাহকরা দিনের পর দিন অপেক্ষা করত।

পরিবর্তে, Amazon বড় জনসংখ্যা কেন্দ্রের কাছাকাছি fulfillment center আছে। যখন একটি product জনপ্রিয়, তারা সেই local warehouse আগে থেকে stock করে। Seattle-র একজন গ্রাহক একটি বই order করলে, এটি local fulfillment center থেকে ship হয় — Virginia থেকে নয়।

এটি একটি **Content Delivery Network (CDN)**: ভৌগোলিকভাবে বিতরণ করা সার্ভারের একটি network যা আপনার content-এর copy আপনার ব্যবহারকারীদের কাছাকাছি cache করে।

Seattle-র একজন ব্যবহারকারী আপনার homepage request করলে, CDN Seattle-র একটি সার্ভার থেকে এটি পরিবেশন করে। Virginia থেকে নয়। request কখনো দেশ অতিক্রম করে না।

**CloudFront-এর সাথে পরিচয়**

Amazon CloudFront হলো AWS-এর CDN। এটি বিশ্বজুড়ে শহরে অবস্থিত **edge location** — caching server-এর একটি global network-এর মাধ্যমে কাজ করে। এই লেখার সময়, ৯০+ শহরে ৫০০টিরও বেশি edge location আছে।

আপনি CloudFront configure করার সময়, আপনি একটি **origin** নির্দিষ্ট করেন: আপনার প্রকৃত content-এর উৎস। আপনার origin হতে পারে:

- একটি S3 bucket (static file: ইমেজ, CSS, JavaScript, PDF)
- একটি Application Load Balancer (আপনার অ্যাপ্লিকেশন থেকে dynamic content)
- একটি EC2 instance
- ইন্টারনেটের যেকোনো জায়গায় একটি HTTP server

CloudFront আপনার origin-এর সামনে বসে। অনুরোধগুলি নিকটতম edge location-এ আসে। Edge-এ content cached থাকলে, এটি তাৎক্ষণিকভাবে return করে। না থাকলে (*cache miss*), এটি আপনার origin থেকে fetch করে, cache করে এবং return করে।

**CloudFront Caching কীভাবে কাজ করে**

যেকোনো piece of content-এর প্রথম অনুরোধ সবসময় cache miss — এটি origin-এ যায়। প্রতিটি পরবর্তী অনুরোধ edge location-এ cache hit করে।

Nimbus-এর জন্য, মেনু ফটো নিখুঁত CloudFront candidate। রেস্তোরাঁর ফটো বিরল ঘটনায় পরিবর্তিত হয় (হয়তো রেস্তোরাঁ profile আপডেট করলে)। CloudFront-এর সাথে:

১. Seattle-র একজন ব্যবহারকারী `images.eatnimbus.com/restaurant-047/photo.jpg` request করে
২. CloudFront Seattle-র edge location check করে — এখনো cached নয় (cache miss)
৩. CloudFront us-east-1-এ S3 থেকে fetch করে (~৮০ms)
৪. CloudFront Seattle edge location-এ ফটো সংরক্ষণ করে
৫. Seattle-র পরবর্তী ব্যবহারকারী একই ফটো request করে
৬. CloudFront local edge cache থেকে পরিবেশন করে (~৫ms)

প্রথম request-এর জন্য একই ৮০ms penalty। কিন্তু একই শহর থেকে হাজারতম request হলো ৫ মিলিসেকেন্ড।

**Cache-Control header** এবং CloudFront-এ **TTL setting** নির্ধারণ করে কতক্ষণ edge-এ content cached থাকে। Image file ঘণ্টা বা দিনের জন্য cached হতে পারে। HTML page (যেগুলি প্রায়ই পরিবর্তিত হয়) মিনিট বা সেকেন্ডের জন্য cached হতে পারে।

**Dynamic Content: Caching-এর বাইরে CloudFront**

"কিন্তু আমাদের API response সম্পর্কে কী?" Leo জিজ্ঞেস করল। "সেগুলি dynamic — ব্যবহারকারী প্রতি, request প্রতি পরিবর্তিত হয়। আপনি একটি order history page cache করতে পারেন না।"

সত্য। কিন্তু CloudFront dynamic content-এও সাহায্য করে।

content cache না হলেও, CloudFront request edge location থেকে AWS-এর private backbone network-এর মাধ্যমে origin-এ route করে — বৈশ্বিকভাবে AWS অবকাঠামো সংযোগকারী high-speed fiber। এটি public internet-এ routing-এর চেয়ে দ্রুত এবং আরো নির্ভরযোগ্য, যেখানে ট্রাফিক একাধিক carrier-এর মাধ্যমে bounce করতে পারে।

ফলাফল: dynamic request এখনো CloudFront-এর মাধ্যমে সরাসরি origin-এর চেয়ে ২০-৪০% দ্রুত। Caching-এর কারণে নয়, বরং network path-এর কারণে।

উপরন্তু, CloudFront প্রদান করে:

**SSL/TLS termination**: CloudFront edge-এ HTTPS সামলায়। ব্যবহারকারী এবং CloudFront-এর মধ্যে connection encrypted। CloudFront অভ্যন্তরীণভাবে HTTP-এর মাধ্যমে আপনার origin-এ connect করতে পারে (origin লোড কমাতে) বা HTTPS (end-to-end encryption-এর জন্য)।

**DDoS protection**: CloudFront AWS Shield Standard-এর সাথে integrated। শত শত edge location জুড়ে বিতরণ করা ট্রাফিক মানে আক্রমণ আপনার origin-এ চাপ দেওয়ার পরিবর্তে edge-এ absorbed হয়।

**Geo-restriction**: নির্দিষ্ট দেশ থেকে অ্যাক্সেস block করুন। যদি Nimbus শুধুমাত্র নির্দিষ্ট বাজারে পরিচালনার license থাকে, CloudFront request কখনো আপনার সার্ভারে পৌঁছানোর আগে edge-এ এটি enforce করতে পারে।

**CloudFront Behavior: Fine-Grained Caching নিয়ম**

একটি CloudFront distribution-এ একাধিক **behavior** থাকতে পারে — URL pattern-এর উপর ভিত্তি করে routing নিয়ম।

Nimbus-এর জন্য:

- `/images/*` → ৭ দিনের জন্য edge-এ cache করুন (ফটো প্রায়ই পরিবর্তিত হয় না)
- `/static/*` → ৩০ দিনের জন্য edge-এ cache করুন (versioned filename সহ CSS এবং JavaScript)
- `/api/*` → cache করবেন না; সরাসরি load balancer-এ forward করুন
- `/*` → ৫ মিনিটের জন্য cache করুন (HTML page)

এটি CloudFront-কে smart করতে দেয়: stable যা আছে তা aggressively cache করুন, dynamic যা আছে তা pass through করুন।

**Origin Access Control: CloudFront দিয়ে S3 সুরক্ষিত করা**

আপনার S3 bucket-এ private content থাকলে যা শুধুমাত্র CloudFront-এর মাধ্যমে পরিবেশন হওয়া উচিত (সরাসরি নয়), আপনি **Origin Access Control (OAC)** ব্যবহার করতে পারেন নিশ্চিত করতে S3 CloudFront থেকে না আসা request reject করে।

এভাবে:

- `d1234abcd.cloudfront.net/image.jpg` পরিবেশিত (CloudFront-এর অনুমতি আছে)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Blocked (সরাসরি S3 অ্যাক্সেস অস্বীকৃত)

আপনার content শুধুমাত্র আপনার distribution-এর মাধ্যমে পৌঁছানো যায়, আপনার cache নিয়ম এবং নিরাপত্তা সেটিং প্রয়োগ সহ।

## শক্তি এবং সীমাবদ্ধতা

**CloudFront কেন শক্তিশালী**:

- ৯০+ শহরে edge location — বেশিরভাগ ব্যবহারকারী <২০ms-এর মধ্যে content পায়
- প্রথম cache-এর পরে single-digit millisecond-এ static content পরিবেশিত
- Repeat ট্রাফিক কখনো আপনার সার্ভারে পৌঁছায় না — Origin লোড উল্লেখযোগ্যভাবে কমায়
- AWS Shield, WAF এবং Certificate Manager-এর সাথে integrated
- কোনো capacity planning দরকার নেই — CloudFront স্বয়ংক্রিয়ভাবে scale করে

**যেখানে জটিল হয়**:

- Cached content stale হতে পারে — cache invalidation-এর মূল্য আছে ($০.০০৫ প্রতি ১,০০০ path)
- Cache-Control header অবশ্যই origin-এ সঠিকভাবে set করতে হবে — ভুলে stale content হয়
- Dynamic content routing optimization থেকে উপকৃত হয় কিন্তু caching থেকে নয়
- Cache আচরণ debug করা (কোথায় কতক্ষণ কী cached) origin header, CloudFront TTL setting, behavior নিয়ম সহ একাধিক layer বোঝা প্রয়োজন
- CloudFront-এর মাধ্যমে ডেটা transfer-এর মূল্য আছে, যদিও standard ডেটা transfer-এর চেয়ে কম

## সারসংক্ষেপ

- একটি **CDN** আপনার ব্যবহারকারীদের কাছাকাছি edge location-এ আপনার content-এর copy cache করে — latency এবং origin লোড কমায়।
- **CloudFront** হলো AWS-এর CDN, বিশ্বজুড়ে ৫০০+ edge location সহ।
- Cache miss **origin** (S3, ALB, EC2) থেকে fetch করে। Cache hit edge থেকে পরিবেশন করে — শত শত মিলিসেকেন্ড নয়, মিলিসেকেন্ড।
- **Behavior** আপনাকে বিভিন্ন URL pattern-এর জন্য ভিন্ন caching নিয়ম সেট করতে দেয়।
- Dynamic content cached নয়, কিন্তু CloudFront এখনো AWS-এর private backbone network-এর মাধ্যমে পারফরম্যান্স উন্নত করে।
- **Origin Access Control** direct S3 অ্যাক্সেস সীমাবদ্ধ করে — শুধুমাত্র CloudFront-এর মাধ্যমে পরিবেশিত content।
- Shield (DDoS), WAF (application firewall) এবং ACM (SSL certificate)-এর সাথে integrated।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৪)*

- **CloudFront + S3**: বৈশ্বিকভাবে static ওয়েবসাইট পরিবেশনের জন্য Classic exam pattern। Origin হিসেবে S3 bucket, CDN হিসেবে CloudFront, সরাসরি S3 অ্যাক্সেস প্রতিরোধ করতে Origin Access Control।
- **Edge location বনাম Region বনাম AZ**: Edge location বেশি সংখ্যক এবং শুধুমাত্র caching/CDN উদ্দেশ্যে বিদ্যমান। এগুলি AZ-এর মতো নয় (যেগুলি আপনার compute চালায়)।
- **Cache invalidation**: `/images/*` invalidation তৈরি করলে CloudFront fresh content fetch করতে বাধ্য হয়। মূল্য আছে — পরীক্ষা cost-effective বিকল্প জিজ্ঞেস করতে পারে: versioned URL (`image-v2.jpg` `image.jpg`-এর পরিবর্তে), যা naturally cache bypass করে।
- **TTL নিয়ন্ত্রণ**: origin-এ `Cache-Control: max-age=3600` ১ ঘণ্টার cache TTL set করে। CloudFront এই header মেনে চলে।
- **CloudFront Functions বনাম Lambda@Edge**: CloudFront Functions edge-এ lightweight request/response manipulation-এর জন্য চলে (sub-millisecond)। Lambda@Edge ভারী processing-এর জন্য edge location-এ আপনার Lambda code চালায়। পরীক্ষা ব্যবহারের ক্ষেত্রের জটিলতা দ্বারা তাদের আলাদা করে।
- **Signed URL এবং Signed Cookie**: CloudFront-এর মাধ্যমে content কে অ্যাক্সেস করতে পারে তা নিয়ন্ত্রণ করুন। Signed URL নির্দিষ্ট file-এ অ্যাক্সেস দেয়; Signed Cookie একাধিক file-এ অ্যাক্সেস দেয়। পরীক্ষা "paid subscriber content"-এর জন্য এগুলি ব্যবহার করে।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

একটি CloudFront cache hit এবং একটি cache miss-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। প্রতিটি ক্ষেত্রে কী ঘটে?

*(ইঙ্গিত: content কোথা থেকে আসে এবং দুটি ক্ষেত্রে response time কীভাবে আলাদা হয় সে সম্পর্কে ভাবুন।)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

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

**ব্যাখ্যা**: CloudFront প্রথম download-এর পরে বৈশ্বিকভাবে installer file edge location-এ cache করে। একই region থেকে পরবর্তী download edge থেকে আসে — us-east-1-এ S3 থেকে Pacific অতিক্রম করার চেয়ে অনেক দ্রুত। Origin Access Control নিশ্চিত করে S3 bucket শুধুমাত্র CloudFront-এর মাধ্যমে accessible। Signed URL paying customer-এর অ্যাক্সেস সীমাবদ্ধ করে।

**কেন A নয়?** S3 Transfer Acceleration long-distance *upload* S3-এ optimize করা — S3 থেকে global audience-কে content *distribute* করার জন্য নয়। সেটির জন্য CloudFront সঠিক সরঞ্জাম। Pre-signed URL অ্যাক্সেস নিয়ন্ত্রণ করে কিন্তু global পারফরম্যান্স উন্নত করে না।

**কেন C নয়?** প্রতিটি region-এ S3 bucket তৈরি করা পারফরম্যান্সের জন্য কাজ করে, কিন্তু replication এড়ানোর প্রয়োজনীয়তার বিরুদ্ধে। এটি একটি ডেটা synchronization strategy-ও প্রয়োজন।

**কেন D নয়?** প্রতিটি region-এ load balancer-এর পেছনে EC2 instance CloudFront-এর চেয়ে উল্লেখযোগ্যভাবে বেশি ব্যয়বহুল এবং একাধিক region-এ সার্ভার পরিচালনা প্রয়োজন।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৪*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus video content যোগ করতে চায় — রেস্তোরাঁ অংশীদারদের থেকে short cooking tutorial ভিডিও। ভিডিও ৫০-৫০০MB হতে পারে। তারা আশা করছে publish করার কয়েক ঘণ্টার মধ্যে হাজার হাজার ব্যবহারকারী একই শহরে একই ভিডিও দেখবে।

Storage এবং delivery architecture design করুন। আপনি কি S3 এবং CloudFront ব্যবহার করবেন? ভিডিও cache হওয়ার আগে delay কমাতে আপনি প্রথম request (cold start) কীভাবে handle করবেন? Publish করার পরে পরিবর্তন না হওয়া ভিডিওর জন্য আপনি কোন cache TTL set করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো CDN design সিদ্ধান্ত অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Priya deployment-এর পরে CloudFront metrics দেখল।

Cache hit rate: ৮৩%।

"এর মানে কী?" Tom জিজ্ঞেস করল।

"এর মানে আমাদের ৮৩% ব্যবহারকারী us-east-1 থেকে নয়, তাদের কাছাকাছি একটি edge location থেকে content পাচ্ছে।"

"এবং অন্য ১৭%?"

"প্রথমবারের অনুরোধ। Content যা এখনো সেই edge location-এ cached হয়নি।"

Tom metrics দেখল। "তাহলে আমরা প্রতিদিন প্রায় দশ লক্ষ অনুরোধ CloudFront edge node থেকে পরিবেশন করছি। এবং সেই দশ লক্ষ-এর মধ্যে মাত্র ১৭০,০০০ প্রকৃতপক্ষে আমাদের সার্ভার hit করে।"

"হ্যাঁ।"

"তাহলে CloudFront না থাকলে, আমাদের সার্ভার দশ লক্ষ অনুরোধ সামলাত।"

"Global ব্যবহারকারীদের জন্য প্রতিটি ১৪০-১৬০ মিলিসেকেন্ডে।"

Tom পিছনে হেলান দিল। তার একটি দেখা ছিল যা Maya চিনত — রিয়েল টাইমে খরচ পুনর্গণনা করছে কারো দেখা।

"এটা মূল্য," সে বলল।

Maya ইতিমধ্যে তার laptop-এ ছিল। "দুজন নতুন engineer আগামী সপ্তাহে যোগ দিচ্ছে। Soo-Jin platform team-এর তার শেষ company থেকে, এবং Rafael — সে security-তে specialization করেছে। আমি চাই তারা প্রথম দিনের আগে IAM-এ onboard হোক।"

"IAM advanced?" Leo জিজ্ঞেস করল।

"Role, policy, cross-account access। বাস্তব stuff।"

পরবর্তী অধ্যায়ে: fine-grained permission যা সিস্টেমের একটি অংশকে অন্য অংশের সাথে নিরাপদে কথা বলতে দেয়।
