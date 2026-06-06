# অধ্যায় ২৫: প্রাইভেট হাইওয়ে

এক মুহূর্তের জন্য উঠে দাঁড়ান। আপনার হাত ঝাড়ুন।

আপনার আঙুলের ডগা এবং দেশের অন্য প্রান্তের কোনো কিছুর মধ্যে দূরত্ব অনুভব করুন। একটি message পাঠানোর কল্পনা করুন যাকে সেই দূরত্ব ভ্রমণ করতে হবে, এক ডজন carrier handoff-এর মধ্য দিয়ে পথ খুঁজে নিতে হবে, এবং আপনি কাজ চালিয়ে যাওয়ার আগে ফিরে আসতে হবে। এখন প্রতি সেকেন্ডে হাজার হাজার বার সেটা করার কল্পনা করুন।

সেটাই data transfer আসলে — শারীরিক দূরত্ব, শারীরিক অবকাঠামো, শারীরিক সীমাবদ্ধতা।

আমরা data সরানো নিয়ে কথা বলতে যাচ্ছি। AWS-এর মধ্যে service-গুলির মধ্যে নয়, বরং বাস্তব জগৎ এবং AWS-এর মধ্যে — আপনার অফিস এবং আপনার cloud অবকাঠামোর মধ্যে, মহাদেশগুলির মধ্যে।

---

Database scale করা এবং storage cost কমানোর সাথে, Tom networking বিলের দিকে ফিরেছিল। কিন্তু Leo-র একটি আরও তাৎক্ষণিক সমস্যা ছিল — ৪ টেরাবাইট ঐতিহাসিক order data AWS-এ সরানো তাদের বর্তমান connection-এর সীমা উন্মোচন করছিল।

---

Nimbus-এর অবকাঠামো দল (এখন চার engineer) Seattle-এ একটি shared অফিস থেকে কাজ করত। তাদের পরিচালিত AWS অবকাঠামোতে access প্রয়োজন ছিল। কিছু operation-এর জন্য VPC-এর resource-এ সংযোগ প্রয়োজন ছিল।

বর্তমানে, তারা public subnet-এ bastion host access করতে তাদের laptop-এ একটি VPN ব্যবহার করত, তারপর সেখান থেকে resource-এ SSH করত।

এটা কাজ করত। এটা ধীর ছিল। VPN connection public internet-এর মাধ্যমে route হত: Seattle → একাধিক carrier hop → us-west-2। Round trip অসামঞ্জস্যপূর্ণ ছিল — ঘণ্টার উপর নির্ভর করে ৩০ থেকে ৮০ মিলিসেকেন্ড — এবং throughput অফিস uplink এবং public path দ্বারা সীমাবদ্ধ ছিল।

"দৈনন্দিন SSH-এর জন্য, সেটা গ্রহণযোগ্য," Leo বলল। "কিন্তু আমরা আমাদের analytics database সরাতে শুরু করতে যাচ্ছি। ৪ টেরাবাইট ঐতিহাসিক order data। এই connection-এর মাধ্যমে, migration সপ্তাহ নেবে।"

"আমাদের একটি ভালো connection দরকার," Maya বলল।

"একটি private connection," Priya যোগ করল। "Public internet-এর মাধ্যমে নয়। এবং কেউ যদি data transfer-এর সময় ভাঙার চেষ্টা করে? Public internet-এর উপর ৪TB order history — এমনকি encrypted — একটি target-এর মতো অনুভব হয়।"

কাজে যাতায়াতের মতো করে ভাবুন। একটি Site-to-Site VPN হলো public রাস্তায় গাড়ি চালানোর মতো: আপনি আপনার গাড়ির দরজা lock করেন (encryption), কিন্তু আপনি এখনও সবার সাথে lane শেয়ার করেন, এবং traffic jam আপনাকে অপ্রত্যাশিতভাবে ধীর করে। Direct Connect হলো highway-তে একটি dedicated private lane ভাড়া করার মতো — কোনো shared traffic নেই, ধারাবাহিক গতি, এবং একটি উচ্চতর মাসিক টোল। বেশিরভাগ দিন public রাস্তা ঠিক আছে। আপনি যখন একটি tight schedule-এ মূল্যবান cargo ভর্তি একটি truck সরাচ্ছেন, আপনি private lane-এর জন্য পেমেন্ট করেন।

Snow Family হলো সেই option যা বেশিরভাগ মানুষ বিবেচনা করে না: একটি প্রকৃত cargo flight চার্টার করা। এটা সবসময় উপলব্ধ নয়। এটা ছোট load-এর জন্য সঠিক নয়। কিন্তু একটি পূর্ণ truck-এর জন্য, এটা গাড়ি চালানোর চেয়ে দ্রুত পৌঁছায় এবং highway condition-এর উপর মোটেও নির্ভর করে না। Physics পরিবর্তন হয়নি — আপনি এখনও একই bit সরাচ্ছেন — কিন্তু mechanism মৌলিকভাবে ভিন্ন।

**AWS Site-to-Site VPN: দ্রুত বিকল্প**

**AWS Site-to-Site VPN** আপনার on-premises network এবং আপনার VPC-এর মধ্যে একটি encrypted tunnel তৈরি করে, public internet অতিক্রম করে।

Setup:

1. আপনার VPC-এর সাথে সংযুক্ত একটি Virtual Private Gateway (VGW) তৈরি করুন
2. আপনার on-premises router প্রতিনিধিত্বকারী একটি Customer Gateway তৈরি করুন
3. তাদের মধ্যে দুটি VPN tunnel স্থাপন করুন (redundancy-র জন্য)

Traffic encrypted (AES-256)। এটা public internet-এর মাধ্যমে ভ্রমণ করে, যার মানে latency internet condition-এর উপর নির্ভর করে। AWS redundancy-র জন্য স্বয়ংক্রিয়ভাবে দুটি tunnel প্রদান করে — একটি tunnel-এ সমস্যা হলে, traffic অন্যটিতে shift হয়।

**কখন Site-to-Site VPN ব্যবহার করবেন**:

- দ্রুত setup (মিনিট থেকে ঘণ্টা)
- সাশ্রয়ী (প্রতি VPN connection $0.05/hour)
- Bandwidth: প্রতি tunnel সর্বোচ্চ 1.25 Gbps
- use case-এর জন্য গ্রহণযোগ্য internet latency

**Accelerated Site-to-Site VPN** public internet-এর পরিবর্তে AWS-এর global network-এর উপর VPN traffic route করে — Global Accelerator যে একই optimization প্রদান করে, VPN tunnel-এ প্রয়োগ করা। Latency standard VPN-এর চেয়ে কম এবং বেশি ধারাবাহিক। Cost সামান্য বেশি (Global Accelerator data transfer চার্জ প্রযোজ্য)। যে দলগুলি VPN-এর দ্রুত setup এবং কম cost চায় কিন্তু ভালো latency প্রয়োজন, তাদের জন্য Accelerated VPN standard VPN এবং Direct Connect-এর মধ্যে ব্যবহারিক মধ্যপথ।

Nimbus-এর ৪TB migration-এর জন্য, সর্বোচ্চ 1.25 Gbps-এ internet-ভিত্তিক VPN নিত: 4TB / 1.25 Gbps ≈ ন্যূনতম ৭ ঘণ্টা, বাস্তব-জগতের overhead সহ ১২-২০ ঘণ্টার কাছাকাছি। গ্রহণযোগ্য, কিন্তু public internet path-এ congestion এটাকে অপ্রত্যাশিত করে।

Leo সংখ্যাগুলি আরও সাবধানে চালাল, কারণ তাত্ত্বিক হিসাব এবং প্রকৃত transfer time তার অভিজ্ঞতায় কখনো একবারও মেলেনি।

**তাত্ত্বিক**: 4 TB = 4,096 GB = 32,768 Gb। 1 Gbps-এ: 32,768 সেকেন্ড ≈ ৯.১ ঘণ্টা। ৯ ঘণ্টায় round করুন।

**প্রকৃত**: Leo আগের সপ্তাহে একটি test transfer চালিয়েছিল — Seattle অফিস থেকে S3-তে 50 GB। তাদের পরিমাপ করা upstream speed-এ (875 Mbps) তাত্ত্বিক সময়: 457 সেকেন্ড। প্রকৃত সময়: 724 সেকেন্ড। Overhead factor: 1.58।

875 Mbps upstream-এ 4TB transfer-এ প্রয়োগ করা: 32,768 Gb / 0.875 Gbps × 1.58 overhead ≈ **59,200 সেকেন্ড ≈ ১৬.৪ ঘণ্টা**।

Overhead কয়েকটি উৎস থেকে এসেছিল: connection establishment-এ TCP slow-start, retransmission প্রয়োজন packet loss (Seattle থেকে us-west-2-এর public path গড়ে 0.2% packet loss — ছোট, কিন্তু লক্ষ লক্ষ packet-এ গুণিত), প্রতিটি multipart upload segment-এর জন্য HTTPS handshake overhead, এবং S3-এর multipart upload একত্রিত করার processing time।

"একটি one-time migration-এর জন্য ষোলো ঘণ্টা ঠিক আছে," Leo বলল। "আসল সমস্যা হলো transfer ১৪তম ঘণ্টায় বাধাগ্রস্ত হলে।"

S3 multipart upload বাধার সমস্যা সমাধান করে: transfer ১৪তম ঘণ্টায় ব্যর্থ হলে, শুধুমাত্র বর্তমান part পুনরায় upload করতে হবে। পূর্ববর্তী part S3-তে store করা এবং transfer resume করতে পারে। কিন্তু multipart upload পরিচালনার overhead মোট transfer time-এ প্রায় ৩% যোগ করেছিল।

চূড়ান্ত বাস্তব-জগতের অনুমান: **1 Gbps internet-এ প্রায় ৯ ঘণ্টা তাত্ত্বিক, প্রায় ১৭ ঘণ্টা প্রকৃত** — তাদের অফিসের 875 Mbps পরিমাপ করা upstream speed, packet loss overhead, এবং multipart upload processing হিসাব করে।

Leo এটা এক মুহূর্ত বিবেচনা করল। তারপর সে Snow Family pricing page দেখল।

"অন্য বিকল্পটা কী?" Tom জিজ্ঞেস করল।

"দাঁড়াও — কিন্তু আমাদের একটি VPN-এর বেশি কিছু কেন দরকার?" Maya জিজ্ঞেস করল। "৪TB migration একটি one-time event।"

"এটা নয়," Priya বলল। "একবার data AWS-এ গেলে, দলের এখনও এটা প্রতিদিন access করতে হবে। এবং VPN latency জমা হয়।"

**AWS Direct Connect: ডেডিকেটেড লাইন**

**AWS Direct Connect** আপনার location (বা আপনার colocation facility) এবং AWS-এর মধ্যে একটি dedicated, private network connection স্থাপন করে। Traffic কখনো public internet স্পর্শ করে না।

Direct Connect একটি physical connection — আপনার network থেকে একটি AWS Direct Connect location-এ একটি fiber line। আপনি physical circuit স্থাপন করতে একটি telecom provider-এর সাথে কাজ করেন। AWS তাদের পক্ষে port প্রদান করে।

**সুবিধা**:

- ধারাবাহিক, পূর্বানুমেয় latency (কোনো public internet variance নেই)
- 50 Mbps থেকে 100 Gbps পর্যন্ত গতি (২০২৪ থেকে নির্বাচিত location-এ native 400 Gbps dedicated port সহ)
- internet-এর চেয়ে কম data transfer cost (Direct Connect data transfer rate standard AWS data transfer out rate-এর চেয়ে সস্তা)
- বেশি secure (private circuit, public internet নয়)

**Trade-off**:

- setup সপ্তাহ থেকে মাস নেয় (physical infrastructure provisioning)
- VPN-এর চেয়ে উল্লেখযোগ্যভাবে বেশি cost
- কোনো built-in redundancy নেই (আপনি নিজে redundant circuit স্থাপন করেন)
- একাধিক circuit ছাড়া ভৌগোলিকভাবে বিতরণ করা অফিসের জন্য উপযুক্ত নয়

আপনি হয়তো ভাবছেন: Direct Connect একটি physical fiber cable হলে, কেউ দুর্ঘটনাক্রমে এটা কাটলে কী হয়? সেটা একটি single circuit-এর সাথে single-point-of-failure সমস্যা — এই কারণেই production Direct Connect setup ভৌগোলিকভাবে পৃথক path-এ redundant circuit ব্যবহার করে, বা একটি backup হিসেবে একটি VPN বজায় রাখে। Cable কাটা যেতে পারে; ব্যবসা চলতে থাকে।

"এটার মাসে কত খরচ?" Tom জিজ্ঞেস করল। সে ইতিমধ্যে এটা দেখেছিল। "একটি dedicated 1Gbps port $216/মাস," সে বলল। "Plus আমাদের অফিস থেকে circuit, যা একটি telecom $800/মাস quote করেছে।"

"তাহলে মোট মাসে প্রায় এক হাজার।"

Nimbus-এর জন্য: Direct Connect তাদের বর্তমান আকারের জন্য overkill ছিল। কিন্তু উল্লেখযোগ্য data transfer volume বা private network connection-এর জন্য compliance প্রয়োজনীয়তা সহ enterprise-এর জন্য, Direct Connect নিজে খরচ উঠিয়ে আনে।

**Hosted Connection: মধ্যম পথ**

প্রতিটি organization একটি 100 Gbps dedicated fiber circuit-এ প্রতিশ্রুতিবদ্ধ হতে পারে না। **Direct Connect Hosted Connection** AWS Direct Connect Partner (অনুমোদিত telecom)-কে sub-1Gbps connection provision করার অনুমতি দেয় যা আপনি অন্য গ্রাহকদের সাথে শেয়ার করেন।

Setup দ্রুত (দিন থেকে সপ্তাহ, মাস নয়) এবং একটি dedicated connection-এর চেয়ে কম খরচ করে। Trade-off: shared capacity মানে কম ধারাবাহিক throughput।

Nimbus-এর জন্য (তারা বাড়ার সাথে): একটি partner-এর মাধ্যমে একটি hosted 500 Mbps connection একটি যুক্তিসঙ্গত মূল্য point-এ private connectivity প্রদান করত।

পরীক্ষার সময় যে ব্যবহারিক পার্থক্য গুরুত্বপূর্ণ: Hosted Connection 50 Mbps থেকে 10 Gbps গতিতে উপলব্ধ (কিছু partner 25 Gbps পর্যন্ত offer করে), একটি AWS Partner দ্বারা provision করা। Dedicated Connection সরাসরি AWS-এ যায় এবং 1 Gbps, 10 Gbps, এবং 100 Gbps-এ উপলব্ধ (plus নির্বাচিত location-এ 400 Gbps)। 1 Gbps-এর নিচে গতির জন্য, একটি Hosted Connection একমাত্র Direct Connect option — Dedicated Connection 1 Gbps minimum-এ শুরু হয়।

**AWS Transit Gateway: VPC-গুলির জন্য Hub-and-Spoke**

Nimbus বাড়ার সাথে, তারা একাধিক VPC জমা করত: production VPC, staging VPC, analytics VPC, security tooling VPC।

সাবধান planning ছাড়া, এই VPC-গুলি সংযুক্ত করতে VPC peering connection-এর একটি full mesh প্রয়োজন। ৪টি VPC-এর জন্য: ৬টি peering connection। ১০টি VPC-এর জন্য: ৪৫টি peering connection। ২০টি VPC-এর জন্য: ১৯০টি connection। এটা scale করে না।

**AWS Transit Gateway** হলো একটি network hub যা একাধিক VPC এবং on-premises network সংযুক্ত করে। peering connection-এর একটি mesh-এর পরিবর্তে, প্রতিটি VPC Transit Gateway-এর সাথে সংযুক্ত হয়। Transit Gateway তাদের মধ্যে traffic route করে।

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitive routing**: VPC A এবং VPC B উভয়ই Transit Gateway-এর সাথে সংযুক্ত হলে, তারা যোগাযোগ করতে পারে — একটি সরাসরি peer ছাড়াই। Transit Gateway routing handle করে। VPC peering-এর বিপরীতে (যা transitive নয়), Transit Gateway hub-and-spoke topology সক্ষম করে।

**Transit Gateway cost**: প্রতি attachment (VPC বা VPN/Direct Connect connection) plus প্রতি GB process করা data চার্জ। scale-এ, এটা সরলতার মূল্যবান।

Nimbus-এর জন্য, Transit Gateway-এর trigger event ছিল একটি চতুর্থ VPC যোগ করা। তাদের ছিল: production, staging, analytics, এবং এখন security tooling (vulnerability scanning এবং SOC2 compliance monitoring-এর জন্য একটি VPC যা production-এর মতো একই network segment-এ থাকা উচিত নয়)।

Transit Gateway ছাড়া, চারটি VPC সংযুক্ত করতে ছয়টি peering connection প্রয়োজন:
- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

ছয়টি peering connection, প্রতি VPC ছয়টি route table entry, পর্যালোচনার জন্য ছয়টি security group rule। এবং VPC peering non-transitive: Production এবং Analytics peered হলে, এবং Analytics এবং Security peered হলে, Production Analytics VPC-এর মাধ্যমে Security-তে পৌঁছাতে পারে না। আপনার Production ↔ Security peering স্পষ্টভাবে দরকার।

Transit Gateway সহ:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

চারটি attachment। পরিচালনার জন্য একটি route table। Transitive routing: Production একটি সরাসরি peer ছাড়াই Transit Gateway-এর মাধ্যমে Security-তে পৌঁছাতে পারে।

"এবং কেউ যদি Transit Gateway-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "চারটি VPC একটি Transit Gateway শেয়ার করলে, Staging VPC-তে একটি compromised resource Production-এ পৌঁছাতে পারে।"

Transit Gateway **isolation সহ route table** সমর্থন করে: আপনি সংজ্ঞায়িত করতে পারেন কোন VPC-গুলিকে Transit Gateway-এর মাধ্যমে যোগাযোগ করার অনুমতি দেওয়া হয় এবং কোনগুলি isolated। security tooling VPC সব অন্যগুলিতে পৌঁছাতে পারে (এটাকে সেগুলি scan করতে হবে)। Staging Production-এ পৌঁছাতে পারে না। Production সরাসরি Analytics-এ পৌঁছাতে পারে না (Analytics একটি নির্দিষ্ট read-only endpoint-এর মাধ্যমে data query করে)।

"একটি Transit Gateway," Priya বলল, "প্রকৃত access model প্রকাশ করা routing policy সহ। কী কীতে পৌঁছায় তা audit করার কোনো centralized উপায় ছাড়া ছয়টি peering connection-এর বিপরীতে।"

**VPC Endpoint: AWS Service-এ Private Access**

একটি সূক্ষ্ম cost এবং security সমস্যা: আপনার EC2 instance (একটি private subnet-এ) যখন S3 API call করে, সেই traffic NAT Gateway-এর মাধ্যমে route হয় (internet-এ পৌঁছাতে, যেখানে S3-এর public endpoint আছে)। আপনি NAT Gateway processing-এর জন্য পেমেন্ট করেন।

**VPC Endpoint** আপনার VPC-এর resource-কে public internet-এর মাধ্যমে না গিয়ে — এবং NAT Gateway ছাড়াই — AWS service-এর সাথে private-ভাবে যোগাযোগ করতে দেয়।

দুই ধরনের:

**Gateway endpoint** (বিনামূল্যে): S3 এবং DynamoDB-এর জন্য। আপনি আপনার route table-এ একটি route যোগ করেন যা S3 বা DynamoDB traffic-কে NAT Gateway-এর পরিবর্তে endpoint-এ নির্দেশ করে। তৈরি করতে বিনামূল্যে; ব্যবহার করতে বিনামূল্যে।

**Interface endpoint** (মূল্যযুক্ত): অন্যান্য AWS service-এর জন্য (SQS, SNS, Secrets Manager, SSM, ইত্যাদি)। আপনার subnet-এ একটি private IP সহ একটি ENI (Elastic Network Interface) তৈরি করে। Service-এ traffic এই private IP ব্যবহার করে। প্রতি AZ ~$0.01/hour plus data processing খরচ করে।

Leo ইতিমধ্যে আগের সপ্তাহে route table আপডেট না করে Gateway endpoint তৈরি করেছিল। "আমি ইতিমধ্যে এটা deploy করেছি — ওহ," সে configuration check করে বলল। "Route আপডেট হয়নি। আমাকে সেটা ঠিক করতে দাও।"

Tom বিনামূল্যে জানার পর সঙ্গে সঙ্গে S3 এবং DynamoDB-এর জন্য Gateway endpoint তৈরি করল। NAT Gateway data processing fee ৬৫% কমে গেল।

কেন তার হিসাব: private subnet-এ Nimbus-এর Lambda function এবং ECS task S3 (config file পড়া, log export লেখা) এবং DynamoDB (রেস্তোরাঁ data পড়া, order record লেখা)-তে ক্রমাগত request করছিল। প্রতিটি request NAT Gateway-এর মাধ্যমে route হত, যা প্রতি GB process করা data $0.045 চার্জ করত।

Nimbus-এর মাসিক NAT Gateway data processing: 533 GB। Cost: $24/মাস। S3 এবং DynamoDB Gateway Endpoint যোগ করে এবং route table আপডেট করার পরে: S3 এবং DynamoDB traffic সম্পূর্ণভাবে NAT Gateway bypass করল। মাসিক NAT Gateway processing 187 GB-তে নেমে এল — অবশিষ্ট traffic ছিল অন্য service-এ API call (Secrets Manager, SES, external webhook)। Cost: $8.40/মাস।

সাশ্রয়: $15.60/মাস, $187/বছর, দুটি বিনামূল্যের Gateway Endpoint configuration-এর জন্য যা সেট আপ করতে ১০ মিনিট লেগেছিল।

"বিনামূল্যে," Tom তৃতীয়বারের মতো বলল।

"Gateway endpoint তৈরি করতে বিনামূল্যে এবং ব্যবহার করতে বিনামূল্যে," Leo নিশ্চিত করল। "তারা কেবল একটি security উন্নতি নয় — NAT Gateway-এর পরিবর্তে একটি private endpoint-এর মাধ্যমে S3 এবং DynamoDB traffic route করা এটাকে public internet থেকে সম্পূর্ণভাবে সরিয়ে দেয়।"

"এবং কেউ যদি NAT Gateway traffic-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "S3-তে traffic NAT-এর মাধ্যমে গেলে, এটা internet থেকে addressable। Gateway Endpoint-এর মাধ্যমে, এটা private।"

এটাই Gateway Endpoint-এর গৌণ সুবিধা যা cost আলোচনা কখনো কখনো ঢেকে দেয়। একটি VPC Gateway Endpoint-এর মাধ্যমে S3 এবং DynamoDB-তে traffic কখনো AWS network ছাড়ে না, কখনো একটি public IP address অতিক্রম করে না, এবং endpoint policy দ্বারা শাসিত হয় (একটি resource-based policy যা endpoint কোন S3 bucket বা DynamoDB table access করতে পারে তা সীমাবদ্ধ করতে পারে)। customer data store করা একটি bucket-এ একটি Gateway Endpoint একটি অতিরিক্ত layer যোগ করে: এমনকি একটি ভুল configure করা bucket policy সহ, endpoint policy নির্দিষ্ট VPC-এর মধ্যে থেকে উদ্ভূত traffic-এ access সীমাবদ্ধ করতে পারে।

**AWS Global Accelerator: Edge-এ Routing**

Nimbus যখন us-west-2 (Oregon) থেকে East Coast ব্যবহারকারীদের পরিবেশন করত, latency ছিল 80ms। server নিষেধজনকভাবে দূরে বলে নয়, বরং Boston এবং Oregon-এর মধ্যে public internet routing suboptimal ছিল, একাধিক carrier network-এর মাধ্যমে বাউন্স করছিল।

**AWS Global Accelerator** AWS-এর private global backbone ব্যবহার করে — edge location-এর একটি distributed network যা public internet carrier hop-এর পরিবর্তে AWS-নিয়ন্ত্রিত path-এর মাধ্যমে আপনার application-এ traffic route করে। public internet routing-এর পরিবর্তে, traffic নিকটতম edge location-এ AWS-এর network-এ প্রবেশ করে এবং আপনার application-এ পৌঁছাতে optimized private path ভ্রমণ করে।

Nimbus-এর জন্য, Boston-এর একজন ব্যবহারকারী:

- **Global Accelerator ছাড়া**: public internet carrier-এর মাধ্যমে route → ~80ms
- **Global Accelerator সহ**: Boston-এ নিকটতম AWS edge-এ hit → AWS backbone ভ্রমণ → us-west-2-এ পৌঁছান → ~60ms

Global Accelerator content cache করে না (সেটা CloudFront)। এটা dynamic request-এর জন্য network path optimize করে।

Nimbus API-এর জন্য Global Accelerator সক্ষম করার পরে Leo কয়েকটি শহর জুড়ে একটি latency তুলনা চালাল:

| City | Before | After | Improvement |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

উন্নতি ভৌগোলিকভাবে দূরের ব্যবহারকারীদের জন্য সবচেয়ে নাটকীয় ছিল — Tokyo 180ms থেকে 95ms, Sydney 210ms থেকে 118ms। Seattle-এর জন্য (Oregon-এর us-west-2 data center-এর কাছাকাছি), উন্নতি ছোট ছিল — optimize করার জন্য কম public internet hop ছিল।

"দাঁড়াও — কিন্তু Tokyo কেন একটি ৪৭% উন্নতি পাচ্ছে?" Maya জিজ্ঞেস করল। "Data center এখনও us-west-2-এ থাকলে, আলোর গতি কি প্রকৃত সীমাবদ্ধতা নয়?"

"আলোর গতি হলো মেঝে," Leo বলল। "প্রকৃত সীমাবদ্ধতা হলো public internet routing। Tokyo থেকে us-west-2-তে traffic ডজন ডজন autonomous system অতিক্রম করে — ভিন্ন carrier, ভিন্ন router, ভিন্ন peering agreement। প্রতিটি hop latency যোগ করে। Global Accelerator Tokyo edge location থেকে us-west-2-তে AWS-এর private fiber-এর উপর traffic route করে, যার ছোট path এবং ভালো-টিউন করা routing আছে।"

Tokyo থেকে us-west-2-এর তাত্ত্বিক ন্যূনতম (fiber-এর উপর আলোর গতির উপর ভিত্তি করে, প্রায় 15,500 km round trip): ~77ms। Global Accelerator সহ 95ms সেই তাত্ত্বিক ন্যূনতমের কাছাকাছি পৌঁছাচ্ছে। এটা ছাড়া 180ms public internet routing-এর অদক্ষতা প্রতিফলিত করে, physics-এর নিয়ম নয়।

Global Accelerator দুটি static **anycast IP address** প্রদান করে যা নিকটতম edge location-এ route করে। CloudFront-এর বিপরীতে (যা পরিবর্তিত dynamic IP address ব্যবহার করে), এই IP স্থিতিশীল — firewall allowlisting-এর জন্য এবং যে application-গুলির client সংযোগ করার জন্য একটি fixed IP প্রয়োজন তাদের জন্য উপযোগী।

**কখন Global Accelerator বনাম CloudFront ব্যবহার করবেন**:

- CloudFront: static এবং cacheable content, CDN use case
- Global Accelerator: dynamic content, non-HTTP protocol (UDP, gaming, IoT), বা যখন আপনার একটি static Anycast IP address প্রয়োজন

## শুধু Traffic নয়, Data সরানো: DataSync এবং Transfer Family

Networking architecture আকার নেওয়ার সময়, Maya-র তিনটি নতুন রেস্তোরাঁ chain onboarding project একসাথে এসে পড়ল। প্রতিটির একটি data migration প্রয়োজনীয়তা ছিল — এবং প্রতিটি প্রয়োজনীয়তা ভিন্ন ছিল।

প্রথম chain, Pacific Table, 40 TB NFS file share S3-তে সরাতে হবে। তাদের বর্তমান file storage on-premises ছিল, তাদের Seattle headquarters-এ চারটি file server জুড়ে ছড়ানো। Leo একটি migration plan লিখতে শুরু করল।

দ্বিতীয় chain, Marisol Group, একটি accounting team ছিল যারা প্রতিদিন একটি local SFTP server-এ invoice upload করত। SFTP workflow ২০১৫ থেকে চলছিল। Accounting staff একটি জিনিস জানত: তারা প্রতি সকাল ৯টায় তাদের SFTP client খুলত, তাদের invoice drop করত, এবং এটা বন্ধ করত। কেউ এটা পরিবর্তন করতে চায়নি। "তাদের accountant-রা WinSCP ব্যবহার করে," Maya বলল। "সেটা আলোচনাযোগ্য নয়।"

"ওগুলো দুটি ভিন্ন tool," Priya বলল।

"হ্যাঁ," Leo বলল। "কিন্তু উভয়ই বিদ্যমান।"

**AWS DataSync: rsync, কিন্তু আরও শক্তিশালী, একটি AWS Console সহ**

Pacific Table-এর 40 TB migration-এর জন্য, চ্যালেঞ্জ bandwidth ছিল না — Seattle অফিসের একটি শক্ত upstream connection ছিল। চ্যালেঞ্জ ছিল orchestration: কোন file বিদ্যমান তা আবিষ্কার করা, নির্ভরযোগ্যভাবে সেগুলি transfer করা, checksum যাচাই করা, business hour-এর সময় অফিস network saturate করা এড়াতে transfer schedule করা, এবং কয়েক দিনের ক্রমাগত operation-এর মধ্যে progress monitor করা।

**AWS DataSync** হলো একটি agent-based data migration এবং replication service। আপনি আপনার on-premises environment-এ একটি lightweight DataSync agent install করেন — একটি virtual machine যা VMware-তে বা একটি EC2 instance হিসেবে চলে। Agent NFS বা SMB-এর উপর আপনার file server-এ সংযোগ করে, আপনার share আবিষ্কার করে, এবং সেগুলি AWS-এর একটি destination-এ synchronize করে: একটি S3 bucket, একটি EFS filesystem, বা একটি FSx filesystem।

এটাকে rsync হিসেবে ভাবুন, কিন্তু আরও শক্তিশালী, একটি AWS console সহ। DataSync handle করে:

- **Discovery**: agent স্বয়ংক্রিয়ভাবে আপনার source share inventory করে
- **Scheduling**: transfer একটি সংজ্ঞায়িত schedule-এ (business hour-এর বাইরে) বা ক্রমাগত চলতে পারে
- **Verification**: DataSync উভয় প্রান্তে checksum হিসাব করে এবং যেকোনো অসামঞ্জস্যে আপনাকে alert করে
- **Monitoring**: transfer progress, file count, error report, এবং bandwidth utilization সবই console-এ দৃশ্যমান
- **Encryption in transit**: transfer-এর সময় সমস্ত data TLS ব্যবহার করে encrypt করা

Pacific Table-এর জন্য, Leo তাদের Seattle network-এ একটি VM-এ DataSync agent install করল, এটাকে চারটি NFS share-এর দিকে নির্দেশ করল, এবং একটি transfer schedule configure করল: সপ্তাহের দিনে রাত ৮টা থেকে ভোর ৬টা, সপ্তাহান্তে ক্রমাগত। ছয় দিন পরে, সমস্ত 40 TB S3-তে গিয়ে পৌঁছাল। সে DataSync-এর built-in checksum report দিয়ে transfer যাচাই করল। শূন্য অসামঞ্জস্য।

"এবং চলমান replication-এর জন্য?" Maya জিজ্ঞেস করল। "Pacific Table migration-এর পরেও file যোগ করতে থাকবে।"

"DataSync incremental transfer সমর্থন করে," Leo বলল। "প্রাথমিক sync-এর পরে, এটা শুধুমাত্র যা পরিবর্তিত হয়েছে তা copy করে। আমরা এটাকে একটি replication job হিসেবে রাতে চালাতে পারি।"

**AWS Transfer Family: আপনার SFTP Workflow, S3 দ্বারা সমর্থিত**

Marisol Group-এর accounting team-এর জন্য, প্রয়োজনীয়তা ভিন্ন ছিল। কেউ SFTP থেকে সরে যাচ্ছিল না। Accountant-রা WinSCP ব্যবহার করতে থাকবে। প্রশ্ন ছিল: সেই SFTP upload কোথায় গিয়ে পৌঁছায়?

বর্তমানে, সেগুলি Marisol back office-এর একটি local Linux server-এ গিয়ে পৌঁছাত। File-গুলি তারপর ম্যানুয়ালি তাদের accounting system-এ সরানো হত। Local server maintenance, backup, এবং এটা পরিচালনার জন্য SSH access সহ কারো প্রয়োজন ছিল।

**AWS Transfer Family** হলো একটি fully managed SFTP, FTPS, এবং FTP server — storage destination হিসেবে S3 বা EFS দ্বারা সমর্থিত। আপনি একটি Transfer Family endpoint provision করেন (এটা একটি hostname এবং, ঐচ্ছিকভাবে, একটি static IP address পায়)। আপনার client তাদের বিদ্যমান SFTP software ব্যবহার করে এটাতে সংযোগ করে। তারা file upload করলে, সেই file সরাসরি একটি S3 bucket-এ গিয়ে পৌঁছায়।

Accounting team কিছু পরিবর্তন করে না। তারা এখনও প্রতি সকাল ৯টায় WinSCP খোলে। তারা এখনও তাদের বিদ্যমান credential দিয়ে একটি SFTP server-এ সংযোগ করে। তারা এখনও একই folder-এ তাদের invoice drop করে। পার্থক্য তাদের কাছে অদৃশ্য: server side-এ, file এখন একটি local Linux server-এর পরিবর্তে সরাসরি S3-তে যায়।

"এবং S3 থেকে, আমরা বাকি workflow স্বয়ংক্রিয়ভাবে trigger করতে পারি," Priya বলল। "একটি S3 event একটি Lambda function trigger করে যা invoice process করে এবং এটা accounting system-এ insert করে। কোনো ম্যানুয়াল step নেই।"

"তাহলে accountant-দের workflow পরিবর্তন হয় না," Maya বলল, "কিন্তু আমাদের দিকে, পুরো জিনিসটা স্বয়ংক্রিয়।"

"হ্যাঁ। এবং SFTP server নিজেই fully managed — কোনো patching নেই, কোনো backup নেই, পরিচালনার কোনো server নেই।"

Tom ইতিমধ্যে pricing দেখেছিল। Transfer Family endpoint availability-র প্রতি ঘণ্টা plus প্রতি GB transfer চার্জ করে। Marisol Group-এর invoice volume-এর জন্য, মাসিক cost $30-এর অনেক নিচে ছিল। এটা যে local server প্রতিস্থাপন করছিল তার maintenance cost — hardware depreciation, maintenance-এর জন্য engineering time, backup management — যথেষ্ট বেশি ছিল।

---

> **পরীক্ষার টিপস — DataSync এবং Transfer Family**
>
> *SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.১)*
>
> - **DataSync** = on-premises থেকে AWS-এ bulk-এ data সরানো (NFS বা SMB file share → S3, EFS, বা FSx)। পরীক্ষার সংকেত: "file share migrate করুন," "NFS data S3-তে replicate করুন," "on-premises থেকে AWS data transfer," "file data-র চলমান replication।" DataSync on-premises install করা একটি agent ব্যবহার করে; agent discovery, scheduling, এবং verification handle করে।
> - **Transfer Family** = client tool পরিবর্তন না করে SFTP, FTPS, বা FTP protocol ব্যবহার করে চলমান file transfer। পরীক্ষার সংকেত: "বিদ্যমান SFTP workflow," "partner-রা SFTP-এর মাধ্যমে file upload করে," "S3 দ্বারা সমর্থিত SFTP server," "lift-and-shift SFTP," "file transfer process পরিবর্তন করা যাবে না।" প্রয়োজনীয়তা যখন SFTP compatibility, data volume নয়, তখন Transfer Family উত্তর।
> - **পার্থক্যটি গুরুত্বপূর্ণ**: DataSync bulk migration এবং replication-এর জন্য (agent-based, schedule-driven, network-optimized)। Transfer Family protocol-compatible file transfer service-এর জন্য (endpoint-based, always-on, client-transparent)। তারা ভিন্ন সমস্যা সমাধান করে।
> - DataSync destination হিসেবে S3, EFS, এবং FSx সমর্থন করে। Transfer Family storage backend হিসেবে S3 এবং EFS সমর্থন করে।

---

**শুধু File নয়, Server Migrate করা: 7 Rs এবং MGN**

Maya-র pipeline-এর তৃতীয় chain-এর শুধু file ছিল না — এর পুরো server ছিল: দুটি on-premises machine-এ চলা একটি custom reservation application যা কেউ move-এর আগে পুনর্লিখন করতে চায়নি। *application* সরানো তার নিজস্ব discipline, এবং AWS **migrate করার সাত উপায়** বর্ণনা করে ("7 Rs") যা আপনার বেশিরভাগ চিনতে হবে:

- **Rehost** ("lift and shift"): server যেমন আছে তেমন সরান। সবচেয়ে দ্রুত, সবচেয়ে কম পরিবর্তন।
- **Replatform** ("lift, tinker, and shift"): পথে ছোট upgrade — যেমন একটি self-managed database RDS-এ সরানো।
- **Repurchase**: পুরানো system বাদ দিন, পরিবর্তে SaaS কিনুন।
- **Refactor**: cloud-native পুনর্নকশা করুন। সবচেয়ে বেশি প্রচেষ্টা, সবচেয়ে বেশি লাভ।
- **Retire**: দেখা গেল কেউ এটা ব্যবহার করেনি। Delete করুন।
- **Retain**: আপাতত যেখানে আছে সেখানে রাখুন।
- **Relocate**: কিছু পরিবর্তন না করে hypervisor স্তরে সরান।

rehost ক্ষেত্রের জন্য, tool হলো **AWS Application Migration Service (MGN)**: একটি agent source server-এর disk block by block AWS-এর একটি low-cost staging area-তে replicate করে; আপনি যখন খুশি test copy launch করেন; cutover-এ, MGN replicate করা server-গুলিকে native EC2 instance-এ রূপান্তর করে। Lift, shift, সম্পন্ন — refactoring পরে আসতে পারে, cloud time-এ। (portfolio planning-এর জন্য এর সঙ্গী, Application Discovery Service এবং Migration Hub, ২০২৫-এর শেষে নতুন গ্রাহকদের জন্য বন্ধ হয়েছিল — পরীক্ষা সেগুলি উল্লেখ করলে "inventory discovery" এবং "central migration tracking" হিসেবে তাদের নাম জানুন।)

---

**AWS Snow Family: Physical বিকল্প**

এখনও 4TB ঐতিহাসিক dataset এবং 17-ঘণ্টার internet অনুমানের বিষয় ছিল। এটা হিসাব করার পরে, Leo Snow Family pricing page দেখেছিল এবং সঙ্গে সঙ্গে সিদ্ধান্ত নিয়েছিল।

কয়েক টেরাবাইটের উপরে migration-এর জন্য যেখানে সময় সরলতার চেয়ে বেশি গুরুত্বপূর্ণ, AWS আপনার location-এ physical storage appliance ship করে। আপনি সেগুলি data দিয়ে ভরেন। আপনি সেগুলি ফেরত ship করেন। AWS data সরাসরি S3-তে ingest করে।

**Snowball Edge Storage Optimized**: 80 TB ব্যবহারযোগ্য capacity, hardened enclosure। আপনার location-এ ২-৫ ব্যবসায়িক দিনে ship করে। আপনি local interface (NFS, S3 interface) ব্যবহার করে data load করেন। আপনি এটা ফেরত ship করেন। AWS receipt-এর প্রায় ১-৩ ব্যবসায়িক দিন পরে data ingest করে।

Nimbus-এর 4TB migration-এর জন্য, process:

1. AWS console-এর মাধ্যমে একটি Snowball Edge **order** করুন (২ মিনিট নেয়, ৩ দিনে ship করে)
2. appliance-কে Seattle অফিস network-এ **connect** করুন; এটা একটি NFS mount point হিসেবে উপস্থিত হয়
3. device-এর S3-compatible interface ব্যবহার করে 4TB ঐতিহাসিক order data **copy** করুন: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Copy সম্পূর্ণ হয়** প্রায় ২ ঘণ্টায় (local network, কোনো internet নেই)
5. appliance-কে AWS-এ ফেরত **ship** করুন (prepaid label অন্তর্ভুক্ত)
6. AWS receipt-এর ৭২ ঘণ্টার মধ্যে data S3-তে **ingest** করে
7. **Verify** — S3 প্রতিটি transfer করা file এবং checksum দেখানো একটি job completion report প্রদান করে

মোট অতিবাহিত সময়: delivery-র জন্য ৩ দিন + copy-র জন্য ২ ঘণ্টা + ১ দিন shipping + ২ দিন ingestion = প্রায় ৭ calendar দিন। ক্রমাগত প্রায় ১৭ ঘণ্টার বিপরীতে — যার একটি স্থিতিশীল, নিরবচ্ছিন্ন internet connection প্রয়োজন হত, রাতভর এবং একটি business day-এর বেশিরভাগ সময় অফিস uplink saturate করে।

Cost: Snowball Edge device ভাড়া ১০ দিনের জন্য $300। Shipping (দুই-পথ): প্রায় $80। S3 data transfer in বিনামূল্যে। মোট migration cost: **$380**।

প্রায় ১৭ ঘণ্টার 875 Mbps টেকসই internet ব্যবহারের সাথে তুলনা করুন: VPN tunnel বিনামূল্যে ছিল ($0.05/hour কিন্তু tunnel ইতিমধ্যে চলছিল); S3 transfer in বিনামূল্যে ছিল। "বিনামূল্যে" internet path-এর engineering time-এ একটি প্রকৃত cost ছিল (একটি ১৭-ঘণ্টার transfer monitor করা), ঝুঁকি (যেকোনো বাধার জন্য restart প্রয়োজন), এবং opportunity cost (transfer window-এর সময় তাদের internet connection saturated ছিল)। Leo order দিল। এটা কীভাবে চলল তা এই অধ্যায়ের post-credits দৃশ্যে আছে।

---

## শক্তি এবং সীমাবদ্ধতা

**Site-to-Site VPN**:

- দ্রুত setup, কম cost
- public internet path মানে পরিবর্তনশীল latency
- সীমিত bandwidth ceiling (প্রতি tunnel 1.25 Gbps)
- Accelerated VPN option সামান্য বেশি cost-এ latency উন্নত করে

**Direct Connect**:

- ধারাবাহিক, private, high-bandwidth
- setup করতে ধীর, উল্লেখযোগ্য পুনরাবৃত্ত cost
- physical circuit একটি single point of failure (redundancy যোগ করুন বা VPN backup বজায় রাখুন)
- pricing scenario-র উপর নির্ভর করে মোটামুটি 10-15 TB/মাসে egress cost সাশ্রয়ের সাথে break-even

**AWS Snow Family**:

- 1-2 TB-এর উপরে one-time migration-এর জন্য, প্রায়ই network transfer-এর চেয়ে দ্রুত এবং সস্তা
- migration-এর সময় কোনো internet bandwidth consumption নেই
- ১০-দিনের device ভাড়া window; prepaid shipping

**Transit Gateway**:

- multi-VPC connectivity নাটকীয়ভাবে সরল করে
- transitive routing (VPC peering-এর বিপরীতে)
- isolation route table পৃথক peering connection ছাড়াই segmentation অনুমতি দেয়
- অনেক attachment-এর জন্য cost যোগ হয়

**VPC Endpoint**:

- S3/DynamoDB-এর জন্য security এবং cost সুবিধা (বিনামূল্যে gateway endpoint)
- AWS service traffic-এর জন্য NAT Gateway cost দূর করে
- endpoint policy IAM এবং bucket policy-র বাইরে একটি অতিরিক্ত access control layer যোগ করে
- অন্য service-এর জন্য interface endpoint (Secrets Manager, SSM, SES) traffic private রাখে কিন্তু প্রতি AZ ~$0.01/hour খরচ করে

**Global Accelerator**:

- global ব্যবহারকারীদের জন্য dynamic application latency উন্নত করে: দূরের ব্যবহারকারীদের জন্য বাস্তবে 33-47% উন্নতি
- fixed Anycast IP (CloudFront-এর dynamic IP-এর বিপরীতে) — firewall allowlisting-এর জন্য উপযোগী
- non-HTTP protocol (UDP, TCP) — CloudFront শুধুমাত্র HTTP/HTTPS
- অতিরিক্ত cost (প্রতি accelerator $0.025/hour + data transfer)

## সারসংক্ষেপ

অধ্যায় ২৪-এর Aurora কাজ Nimbus কীভাবে তার নিজস্ব application-এ data পরিবেশন করে তা optimize করেছিল। এই অধ্যায়টি বাইরের জগৎ এবং AWS-এর মধ্যে data কীভাবে সরে — এবং সেই চলাচলকে কীভাবে আরও নির্ভরযোগ্য, দ্রুত, এবং কম ব্যয়বহুল করা যায় — সে সম্পর্কে।

- **Site-to-Site VPN**: on-premises এবং VPC-এর মধ্যে public internet-এর উপর encrypted tunnel। দ্রুত setup, কম cost, পরিবর্তনশীল latency। redundancy-র জন্য দুটি tunnel। প্রতি tunnel সর্বোচ্চ 1.25 Gbps।
- **Direct Connect**: AWS-এ private, dedicated fiber connection। পূর্বানুমেয় latency, উচ্চতর bandwidth, setup করতে সপ্তাহ, উল্লেখযোগ্য cost। Nimbus-এর pricing scenario-র জন্য প্রায় 13.5 TB/মাসে VPN-এর egress সাশ্রয়ের সাথে break-even।
- **AWS Snow Family**: bulk data migration-এর জন্য physical storage appliance। multi-TB migration-এর জন্য internet transfer-এর চেয়ে দ্রুত। Nimbus-এর 4TB migration-এর জন্য মোট $380 বনাম প্রায় ১৭ ঘণ্টার network saturation।
- **Transit Gateway**: VPC এবং on-premises connectivity-র hub। transitive routing সক্ষম করে (VPC peering-এর বিপরীতে)। কোন VPC কোনটিতে পৌঁছাতে পারে তা নিয়ন্ত্রণ করতে isolation route table সমর্থন করে। শত শত connection-এ scale করে।
- **VPC Endpoint**: NAT Gateway ছাড়াই AWS service-এ private access। Gateway endpoint (S3, DynamoDB) বিনামূল্যে — S3 বা DynamoDB access করা প্রতিটি VPC-তে সেগুলি যোগ করুন। Nimbus-কে $15.60/মাস বাঁচিয়েছে এবং NAT Gateway থেকে S3/DynamoDB traffic সরিয়েছে।
- **Global Accelerator**: বিশ্বব্যাপী কম, আরও ধারাবাহিক latency-র জন্য AWS private backbone-এর উপর dynamic traffic route করে। static Anycast IP। দূরের ব্যবহারকারীদের জন্য 33-47% latency উন্নতি (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms)। একটি CDN নয় — cache করে না।
- **AWS DataSync**: on-premises NFS/SMB file data S3, EFS, বা FSx-এ migrate এবং replicate করার জন্য agent-based service। scheduling, checksum verification, monitoring handle করে। one-time migration এবং file share-এর চলমান replication-এর জন্য ব্যবহৃত।
- **AWS Transfer Family**: S3 বা EFS দ্বারা সমর্থিত managed SFTP, FTPS, এবং FTP server। বিদ্যমান SFTP client-কে তাদের workflow পরিবর্তন না করে S3-তে file upload করতে দেয়।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৪)*

- **VPN বনাম Direct Connect সংকেত**: VPN = "VPC-তে traffic encrypt করুন," "দ্রুত setup," "cost-sensitive।" Direct Connect = "ধারাবাহিক low latency," "বড় data transfer," "private connection," "private network প্রয়োজনীয় compliance।"
- **Transit Gateway বনাম VPC Peering**: Peering non-transitive (A→B→C, A→C অনুমতি দেয় না)। Transit Gateway transitive। "যোগাযোগ করার প্রয়োজন অনেক VPC" → Transit Gateway।
- **VPC Gateway Endpoint**: বিনামূল্যে। শুধুমাত্র S3 এবং DynamoDB। route table পরিবর্তন। কোনো অতিরিক্ত cost নেই। পরীক্ষার scenario: "private subnet থেকে S3 access-এর জন্য data transfer cost কমান" → Gateway Endpoint।
- **Global Accelerator বনাম CloudFront**: Accelerator = dynamic content, non-HTTP, static IP, network optimization। CloudFront = caching, HTTP content, CDN।
- **Direct Connect + VPN**: আপনি একটি Direct Connect connection-এর জন্য backup হিসেবে একটি VPN ব্যবহার করতে পারেন। Direct Connect circuit ব্যর্থ হলে, traffic VPN-এ failover করে। শুধু VPN-এর চেয়ে বেশি ব্যয়বহুল, শুধু Direct Connect-এর চেয়ে বেশি নির্ভরযোগ্য।
- **Direct Connect Gateway**: একটি Direct Connect circuit-কে একাধিক region বা account জুড়ে একাধিক VPC-এর সাথে সংযুক্ত করুন। এটা ছাড়া, একটি Direct Connect circuit একটি region-এ একটি VGW-এর সাথে সংযুক্ত হয়।
- **AWS Snow Family**: "বড় data migration," "transfer speed অনেক ধীর," "petabyte-scale migration" → Snow Family। Snowball Edge = 80TB পর্যন্ত। প্রথমে transfer-এর হিসাব করুন: উপলব্ধ network-এর উপর data সরাতে মোটামুটি এক সপ্তাহ বা তার বেশি লাগলে, উত্তর একটি physical device। *বাস্তবতা যাচাই (২০২৬)*: AWS পরিবারটি অবসর দিচ্ছে — Snowmobile ২০২৪-এ প্রত্যাহার করা হয়েছিল, Snowcone ২০২৪-এর শেষে বন্ধ হয়েছিল, এবং নভেম্বর ২০২৫ অনুযায়ী Snow device আর নতুন গ্রাহকদের offer করা হয় না (AWS এখন দ্রুত link-এর উপর DataSync এবং **Data Transfer Terminals**-এর দিকে নির্দেশ করে, secure location যেখানে আপনি আপনার নিজের drive আনেন)। SAA-C03 question bank এই সবের আগের, তাই পরীক্ষায়, "সপ্তাহের network transfer, সীমিত bandwidth" এখনও Snowball-এর দিকে নির্দেশ করে।
- **Transit Gateway route table**: Transit Gateway network segmentation-এর জন্য একাধিক route table সমর্থন করে। পরীক্ষার সংকেত: Transit Gateway-এর মাধ্যমে shared connectivity সহ "production VPC-কে staging থেকে isolate করুন" → পৃথক route table।
- **Global Accelerator fixed IP**: CloudFront-এর বিপরীতে, Global Accelerator দুটি static Anycast IP প্রদান করে। পরীক্ষার সংকেত: "application-এর client allowlist করার জন্য একটি fixed IP address প্রয়োজন" বা "UDP traffic" → Global Accelerator (CloudFront শুধুমাত্র HTTP/HTTPS)।
- **AWS DataSync সংকেত**: "NFS/SMB file share S3/EFS/FSx-এ migrate করুন," "on-premises file data-র চলমান replication," "agent-based file migration।" DataSync protocol-compatible SFTP transfer-এর জন্য নয় — এটা bulk file share migration এবং replication-এর জন্য।
- **AWS Transfer Family সংকেত**: "বিদ্যমান SFTP workflow," "partner বা customer SFTP-এর মাধ্যমে file upload করে," "client tool পরিবর্তন না করে SFTP server cloud-এ lift করুন," "S3 দ্বারা সমর্থিত SFTP/FTPS/FTP।" Transfer Family একটি data migration tool নয় — এটা একটি managed protocol endpoint। পার্থক্য: DataSync একটি schedule-এ bulk-এ data সরায়; Transfer Family চলমান file upload-এর জন্য একটি always-on SFTP/FTP endpoint প্রদান করে।
- **MGN (Application Migration Service)**: "শত শত VM দ্রুত migrate করুন, কোনো কোড পরিবর্তন নেই," "rehost / lift-and-shift server EC2-তে" → MGN (block-level replication, test launch, native EC2 instance-এ cutover)। DataSync *file* সরায়; DMS *database* সরায়; MGN *পুরো server* সরায়।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

AWS Site-to-Site VPN এবং AWS Direct Connect-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। কোন scenario-তে আপনি প্রতিটি বেছে নেবেন?

*(ইঙ্গিত: setup time, cost, latency সামঞ্জস্য, এবং bandwidth প্রয়োজনীয়তা নিয়ে ভাবুন।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি financial services কোম্পানির তাদের on-premises data center থেকে AWS-এ একটি private, encrypted, dedicated network connection প্রয়োজন। তারা প্রতিদিন 500GB সংবেদনশীল financial data transfer করে। Connection-এর ধারাবাহিক, পূর্বানুমেয় latency থাকতে হবে এবং public internet অতিক্রম করা যাবে না। Primary ব্যর্থ হলে তাদের একটি backup connection-ও প্রয়োজন।

কোন architecture এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) BGP routing এবং redundancy-র জন্য একটি দ্বিতীয় VPN সহ একটি Site-to-Site VPN  
B) Direct Connect Gateway সহ একটি Direct Connect Hosted Connection  
C) ভিন্ন internet provider-এর মাধ্যমে দুটি Site-to-Site VPN connection  
D) backup হিসেবে একটি Site-to-Site VPN সহ একটি Direct Connect connection

**ইঙ্গিত ১**: "public internet অতিক্রম করা যাবে না" — VPN traffic public internet-এর উপর যায় (encrypted)। শুধুমাত্র Direct Connect private।

**ইঙ্গিত ২**: "ধারাবাহিক, পূর্বানুমেয় latency" — public internet VPN performance পরিবর্তিত হয়। Direct Connect ধারাবাহিক।

**ইঙ্গিত ৩**: "backup connection" — Direct Connect primary হলে প্রস্তাবিত পদ্ধতি কী?

**উত্তর**: D

**ব্যাখ্যা**: Direct Connect একটি private, dedicated connection প্রদান করে যা public internet অতিক্রম করে না — privacy এবং latency প্রয়োজনীয়তা পূরণ করে। backup হিসেবে একটি Site-to-Site VPN redundancy প্রদান করে: Direct Connect circuit ব্যর্থ হলে, traffic encrypted VPN-এ failover করে। এটা Direct Connect-এর জন্য standard HA pattern।

**কেন A নয়?** Site-to-Site VPN traffic public internet অতিক্রম করে, যা "public internet অতিক্রম করা যাবে না" প্রয়োজনীয়তা লঙ্ঘন করে।

**কেন B নয়?** একটি Hosted Connection একটি Direct Connect connection প্রদান করে কিন্তু option B একটি backup অন্তর্ভুক্ত করে না। backup ছাড়া একক Direct Connect একটি single point of failure — physical fiber কাটা যেতে পারে।

**কেন C নয়?** ভিন্ন ISP-এর মাধ্যমে দুটি VPN connection এখনও public internet অতিক্রম করে, এমনকি encrypted হলেও। private network প্রয়োজনীয়তা পূরণ করে না।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৪*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus Seattle, Berlin, এবং Singapore-এ regional engineering team রাখতে প্রসারিত হচ্ছে। প্রতিটি regional team-এর access প্রয়োজন:

- Production VPC (debugging-এর জন্য read-only)
- Staging VPC (testing-এর জন্য full access)
- Analytics VPC (reporting-এর জন্য read-only)

Network connectivity design করুন। আপনি কি Transit Gateway ব্যবহার করবেন? প্রতিটি region-এ Direct Connect নাকি Site-to-Site VPN? আপনি production-এর জন্য read-only access কীভাবে প্রয়োগ করবেন? (ইঙ্গিত: এটা একটি network এবং IAM উভয় প্রশ্ন।)

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো multi-region, multi-team network design অনুশীলন করা।)*

**এক্সটেনশন**: Berlin team রিপোর্ট করে যে production VPC (us-west-2)-তে তাদের VPN latency গড়ে 160ms। কোন data volume-এ Accelerated Site-to-Site VPN বা একটি Direct Connect Hosted Connection ভালো option হবে? একটি European AWS Partner থেকে বর্তমান Direct Connect Hosted Connection pricing research করুন। আপনার অনুমানকৃত data volume-এ শুধু latency উন্নতি কি cost justify করবে?

## পোস্ট-ক্রেডিটস দৃশ্য

Data migration ৮ calendar দিনে সম্পূর্ণ হল — Snowball Edge আসতে ৩ দিন, data copy করতে ৯৪ মিনিট, AWS-এর device গ্রহণ এবং data ingest করতে ৪ দিন, তারপর Snowball transit-এ থাকার সময় জমা হওয়া delta-র একটি চূড়ান্ত sync। পুরো জিনিসটির জন্য hands-on সময়: চার ঘণ্টার কম।

সেই শেষ step গুরুত্বপূর্ণ ছিল। Snowball Edge 4TB dataset-এর একটি point-in-time snapshot copy করেছিল। এটা transit-এ থাকার সময়, production database চলতে থেকেছিল — নতুন order দেওয়া হচ্ছিল, নতুন record তৈরি হচ্ছিল। VPN-এর উপর delta sync ছিল 12GB, ১৮ মিনিটে সম্পূর্ণ।

"Bulk transfer ছিল Snowball," Leo বলল। "Sync ছিল শুধু ৮ দিন লাগার net-new data।"

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ," ৯৪ মিনিট পরে Snowball Edge-এ copy সম্পূর্ণ হতে দেখে Leo বলল। "business hour-এর সময় অফিস network saturate করা এড়াতে আমার local copy-তে bandwidth throttle সেট করা উচিত ছিল।"

সে throttle সেট করেনি। অফিস internet ঠিক ছিল — Snowball একটি local network operation ছিল। কিন্তু copy local throughput 9 Gbps-এর কাছাকাছি যাওয়ার সাথে network switch সংক্ষিপ্তভাবে একটি bottleneck হয়ে গিয়েছিল।

"পয়েন্টটা," throttle setting ঠিক করার পরে সে বলল, "হলো একটি নির্দিষ্ট data volume-এর উপরে physical mail internet-এর চেয়ে দ্রুত।"

"সেটা হয় সুস্পষ্ট নয়তো প্রতি-স্বজ্ঞাত," Maya বলল, "আপনি কীভাবে এটা নিয়ে ভাবেন তার উপর নির্ভর করে।"

"পরের বার," Leo বলল, "আমাদের একটি Direct Connect সেট আপ করা উচিত।"

Tom calculator-এর দিকে হাত বাড়াল না — সে ইতিমধ্যে আগে হিসাব চালিয়েছিল, যখন Direct Connect প্রথম এসেছিল: মাসে প্রায় এক হাজার, port plus circuit।

"আমরা এখন যা করি তার জন্য, সম্ভবত মূল্যবান নয়। কিন্তু আমরা আমাদের অফিস এবং AWS-এর মধ্যে মাসে 10TB-এর বেশি সরাতে শুরু করলে, Direct Connect-এ data transfer সাশ্রয় cost অফসেট করবে।"

"তাহলে আমরা data transfer volume monitor করি," Priya বলল, "এবং threshold অতিক্রম করলে পুনর্বিবেচনা করি।"

"সেটা cost-aware architecture," Tom বলল।

"সেটা সবসময়ই পয়েন্ট ছিল," Maya বলল।

Priya ঘরের অন্য পাশ থেকে migration দেখেছিল। "পরের বার আমরা এরকম কিছু করলে," সে বলল, "আমরা কি data production-এ যাওয়ার এবং ব্যবসা এর উপর নির্ভর করার আগে করতে পারি? Live data migrate করা সবসময় at-rest data migrate করার চেয়ে ঝুঁকিপূর্ণ।"

"ব্যবসা চললে এটা কখনো at-rest নয়," Leo বলল।

"আমি জানি," সে বলল। "সেটাই পয়েন্ট। প্রয়োজন হওয়ার আগে migration plan করুন। পরে নয়।"

Tom ইতিমধ্যে হিসাব করেছিল us-east-1-এ যেকোনো সময় একটি migration গ্রহণ করতে প্রস্তুত দ্বিতীয় set অবকাঠামো রাখতে কত খরচ হবে। সে আপাতত সংখ্যাটি নিজের কাছে রাখল। বন্ধ করার আরও তাৎক্ষণিক অধ্যায় ছিল।

পরবর্তী অধ্যায়ে: যখন আপনার কাছে যেকোনো database যুক্তিসঙ্গতভাবে store করতে পারে তার চেয়ে বেশি data থাকে, এবং আপনার এটা সব বোঝার প্রয়োজন হয়।
