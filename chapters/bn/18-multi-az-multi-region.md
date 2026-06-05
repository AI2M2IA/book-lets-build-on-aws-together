# অধ্যায় ১৮: জিনিস ভাঙলে

এই অধ্যায়টি failure নিয়ে — planned, designed against এবং শেষ পর্যন্ত অনিবার্য হিসেবে accepted। এটি বইয়ের সবচেয়ে গুরুত্বপূর্ণ অধ্যায় হতে পারে।

Nimbus ভালো চলছিল। Security layer জায়গায় ছিল। Monitoring সক্রিয় ছিল। ট্রাফিক বাড়ছিল।

তারপর Leo বৃহস্পতিবার রাত ১১:২৩-এ একটি Slack notification পেল।

"us-east-1 Availability Zone us-east-1b — hardware failure — degraded service।"

সে AWS console খুলল। us-east-1b-এর EC2 instance status check ব্যর্থ দেখাচ্ছে। তার Auto Scaling Group unhealthy instance detect করেছে এবং replacement spin up করছে — us-east-1b-এ।

ব্যর্থ হচ্ছিল এমন AZ-এ।

নতুন instance শুরুও হতে পারছিল না। তারা একই hardware failure zone-এ ছিল।

"Load balancer উভয় AZ-এ ট্রাফিক route করছে," Leo কাউকে উদ্দেশ্যে বলল না। "আমাদের ট্রাফিকের অর্ধেক কাজ করে না এমন instance-এ যাচ্ছে।"

সে manually ASG-কে শুধুমাত্র us-east-1a ব্যবহার করার জন্য shift করার আগে বাইশ মিনিট degraded service ছিল।

"এটা ঘটেছে কারণ সবকিছু একটি AZ-এ ছিল," পরের সকালে Priya বলল।

"না," Leo বলল। "আমার দুটি AZ-এ instance ছিল। সমস্যা ছিল replacement instance failing AZ-এ spawn হচ্ছিল।"

"Database?"

Leo থামল।

"RDS instance Multi-AZ। Standby us-east-1b-এ। যা ব্যর্থ হচ্ছিল। এবং RDS standby-এ failover করার চেষ্টা করল, যা-ও ব্যর্থ হল।"

বাইশ মিনিটের degraded service আটত্রিশ মিনিট হয়ে গেল।

**Electricity Grid উপমা**

আপনার বাড়িতে বিদ্যুৎ কীভাবে আসে তা ভাবুন। বিদ্যুৎ একটি single generator থেকে একটি single wire দিয়ে আসে না। এটি একটি grid থেকে আসে — generator, substation এবং transmission line-এর একটি নেটওয়ার্ক যা একে অপরকে backup করে। একটি substation আগুন লাগলে, অন্যগুলি তার চারপাশে বিদ্যুৎ reroute করে। আপনি notice করেন না। Light চালু থাকে।

AWS Availability Zone একইভাবে কাজ করে। সবকিছু একটি বিশাল data center-এর উপর depend করার পরিবর্তে, AWS আপনার resource একাধিক physically separate facility-তে ছড়িয়ে দেয়। একটি facility power বা hardware failure পেলে, অন্যগুলি চলতে থাকে। ট্রাফিক স্বয়ংক্রিয়ভাবে reroute হয়। আপনার অ্যাপ্লিকেশন চালু থাকে — কারণ cut করার কোনো single wire ছিল না।

Multi-Region হলো পরবর্তী স্তর: সম্পূর্ণ ভিন্ন শহরে backup generator কল্পনা করুন। সমগ্র local power grid ডাউন হলে, remote শহর নেয়। Setup করা আরো জটিল, কিন্তু catastrophic failure-এর বিরুদ্ধে আরো resilient।

**Failure-এর Vocabulary**

Resilience-এর জন্য design করার আগে, আপনি কীসের বিরুদ্ধে design করছেন তার জন্য শব্দ দরকার।

**Availability**: একটি সিস্টেম operational-এর percentage। "Four nine" (৯৯.৯৯%) মানে প্রতি বছর ৫২ মিনিটের কম downtime। "Five nine" (৯৯.৯৯৯%) মানে প্রায় ৫ মিনিট।

**RTO (Recovery Time Objective)**: সিস্টেম কতক্ষণ ডাউন থাকতে পারে ব্যবসায়িক সমস্যা হওয়ার আগে? আপনার RTO ৪ ঘণ্টা হলে, SLA লঙ্ঘনের আগে service restore করার জন্য ৪ ঘণ্টা আছে।

**RPO (Recovery Point Objective)**: কতটুকু ডেটা হারাতে পারবেন? আপনার RPO ১ ঘণ্টা হলে, একটি catastrophic failure-এ এক ঘণ্টার ডেটা হারানো সহ্য করতে পারবেন। Failure-এর আগের শেষ ঘণ্টায় লেখা সবকিছু চলে গেছে।

**Fault tolerance**: একটি component ব্যর্থ হলে (কিছু স্তরে) চালু থাকার ক্ষমতা।

**Disaster recovery (DR)**: একটি catastrophic failure থেকে recover করার প্রক্রিয়া — data center আগুন, region-wide outage, ঘটনাক্রমে mass deletion।

এই পাঁচটি concept এই অধ্যায়ের প্রতিটি architectural সিদ্ধান্ত drive করে।

**Multi-AZ: Availability Zone Failure থেকে বেঁচে থাকা**

একটি Availability Zone (AZ) হলো একটি Region-এর মধ্যে একটি physically separate data center। AZ independent হওয়ার জন্য design করা: separate power supply, separate cooling, separate network infrastructure। কিন্তু তাদের মধ্যে network latency ১-২ মিলিসেকেন্ড।

**Multi-AZ deployment** একটি Region-এর মধ্যে দুটি বা তার বেশি AZ-এ আপনার resource ছড়িয়ে দেয়। একটি AZ ব্যর্থ হলে:

- Load balancer ব্যর্থ AZ-এর unhealthy instance-এ routing বন্ধ করে
- Auto Scaling Group instance replace করে — কিন্তু *healthy* AZ-এ
- RDS healthy AZ-এর standby-এ failover করে

Leo-র ভুল: তার Auto Scaling Group healthy AZ-এ replacement instance সীমাবদ্ধ করার জন্য configure করা ছিল না। এটি AZ-এর মধ্যে instance count balance বজায় রাখার জন্য configure করা ছিল। us-east-1b ব্যর্থ হলে, ASG us-east-1b-এ replacement spin up করে balance করার চেষ্টা করল — failing AZ।

Fix: ASG সবসময় সক্রিয় AZ-এর ন্যূনতম দুটিতে launch করার জন্য configure করুন।

Deeper lesson: production-এ ঘটার আগে আপনার failure scenario test করুন।

**Failure Simulate করা: Chaos Engineering**

"আমরা কীভাবে জানব আমাদের Multi-AZ setup আসলে কাজ করে?" Maya জিজ্ঞেস করল।

"আমরা ইচ্ছাকৃতভাবে জিনিস ভাঙি," Leo বলল।

এটি বেপরোয়া শোনায়। এটি আসলে সবচেয়ে responsible কাজ যা একটি দল করতে পারে।

**Chaos engineering** হলো ইচ্ছাকৃতভাবে আপনার সিস্টেমে failure inject করার অনুশীলন যে এটি সঠিকভাবে handle করে কিনা তা verify করতে। আপনি ইচ্ছাকৃতভাবে একটি EC2 instance terminate করুন। আপনি ম্যানুয়ালি RDS instance failover করুন। আপনি load balancer থেকে একটি subnet block করুন।

সিস্টেম আপনার RTO-এর মধ্যে স্বয়ংক্রিয়ভাবে recover করলে, আপনার design কাজ করে।

না করলে, আপনি একটি controlled setting-এ শিখেছেন — ২টা production incident-এর সময় নয়।

Nimbus-এর জন্য: Leo প্রতিটি failure scenario test করার জন্য একটি runbook (একটি documented procedure) লিখল। প্রতি quarter-এ, তারা ইচ্ছাকৃতভাবে একটি component fail করত এবং recovery time measure করত। Recovery RTO-এর বেশি সময় নিলে, তারা design fix করত।

**Multi-Region: Regional Failure থেকে বেঁচে থাকা**

বেশিরভাগ AWS failure Availability Zone প্রভাবিত করে, পুরো Region নয়। Regional failure বিরল — কিন্তু ঘটে।

একটি regional failure (বা সত্যিকার অর্থে বৈশ্বিক ব্যবহারকারী সহ অ্যাপ্লিকেশনের জন্য), **Multi-Region** উত্তর: আপনার অ্যাপ্লিকেশন দুটি বা তার বেশি AWS Region-এ deploy করুন।

Multi-Region মৌলিক জটিলতা পরিচয় করিয়ে দেয়:

**ডেটা replication**: আপনার database একাধিক region-এ sync-এ থাকতে হবে। us-east-1-এ লেখা যেকোনো ডেটা শেষ পর্যন্ত eu-west-1-এ পৌঁছাতে হবে। "শেষ পর্যন্ত" হলো সমস্যা — lag-এর সময়, region-গুলির বিশ্বের সামান্য ভিন্ন view আছে।

**Active-passive বনাম active-active**:

- **Active-passive**: একটি region সমস্ত ট্রাফিক পরিবেশন করে। অন্যটি warm standby। ব্যর্থতায়, DNS ট্রাফিক standby-এ switch করে। সহজ, কিন্তু standby idle এবং ব্যয়বহুল।
- **Active-active**: উভয় region একসাথে ট্রাফিক পরিবেশন করে। Build করা আরো জটিল (concurrent write-এর জন্য conflict resolution প্রয়োজন), কিন্তু বৈশ্বিকভাবে কম latency এবং কোনো idle resource নেই।

**Failover time**: DNS পরিবর্তন propagate হতে সময় নেয় (TTL-এর উপর নির্ভর করে)। Propagation window-এর সময়, কিছু ব্যবহারকারী এখনো ব্যর্থ region hit করে। খুব কম RTO-এর জন্য design করার জন্য standby pre-warm করা এবং planned switch-এর আগে TTL minimize করা প্রয়োজন।

**Disaster Recovery Strategy: একটি Spectrum**

চারটি সাধারণ DR strategy আছে, সবচেয়ে সস্তা (এবং recover হতে সবচেয়ে ধীর) থেকে সবচেয়ে ব্যয়বহুল (এবং সবচেয়ে দ্রুত recover হওয়া) পর্যন্ত সাজানো:

**Backup and Restore** (ঘণ্টার RPO/RTO):

- একটি ভিন্ন region-এ S3-এ সবকিছু backup করুন
- Disaster-এ: scratch থেকে অবকাঠামো provision করুন, backup থেকে restore করুন
- Cost: খুব কম (শুধুমাত্র storage-এর জন্য পেমেন্ট করছেন)
- Recovery time: ঘণ্টা

**Pilot Light** (মিনিট থেকে ১ ঘণ্টার RPO/RTO):

- DR region-এ অ্যাপ্লিকেশনের একটি minimal version চালু রাখুন (দ্রুত turn up করা যায় এমন "pilot light")
- Core ডেটা replicated (DR region-এ RDS read replica)
- Disaster-এ: DR region scale up করুন, read replica primary-এ promote করুন, DNS switch করুন
- Cost: moderate (আপনি একটি small running footprint-এর জন্য পেমেন্ট করছেন)
- Recovery time: কয়েক দশ মিনিট

**Warm Standby** (সেকেন্ড থেকে মিনিটের RPO/RTO):

- DR region-এ reduced capacity-এ সম্পূর্ণ অ্যাপ্লিকেশনের scaled-down version চালান
- সম্পূর্ণ operational কিন্তু reduced capacity-এ
- Disaster-এ: scale up করুন, DNS switch করুন
- Cost: বেশি (সর্বদা reduced scale-এ full stack চালাচ্ছেন)
- Recovery time: মিনিট

**Active-Active / Multi-Site** (কাছাকাছি-শূন্যের RPO/RTO):

- একসাথে ট্রাফিক পরিবেশন করছে দুটি বা তার বেশি region-এ full capacity
- কোনো recovery দরকার নেই — একটি region ব্যর্থ হলে, ট্রাফিক automatically অন্যটিতে route হয়
- Cost: সর্বোচ্চ (পূর্ণ scale-এ দুটি full deployment)
- Recovery time: সেকেন্ড (শুধুমাত্র DNS propagation)

Nimbus এই stage-এ: warm standby। তারা active-active সামর্থ্য করতে পারেনি, কিন্তু তাদের ব্যবসায়িক প্রয়োজনীয়তার জন্য backup and restore অনেক ধীর ছিল।

**Amazon RDS: Multi-AZ বনাম Read Replica বনাম Multi-Region**

এই তিনটি আলাদা এবং সাধারণত confused:

| Feature       | Multi-AZ                     | Read Replica     | Multi-Region Read Replica |
|---------------|------------------------------|------------------|---------------------------|
| উদ্দেশ্য      | High availability (failover) | Read scaling     | Read scaling + DR         |
| Data sync     | Synchronous                  | Asynchronous     | Asynchronous              |
| Failover      | Automatic                    | Manual promotion | Manual promotion          |
| Readable?     | না (standby passive)         | হ্যাঁ            | হ্যাঁ                     |
| Cross-region? | না (same region)             | হ্যাঁ (optional) | হ্যাঁ                     |
| ব্যবহার করুন  | HA, RPO~0                    | Read load        | Disaster recovery         |

Key insight: Multi-AZ standby **synchronous** — primary-এ প্রতিটি write commit-এর আগে standby-এ confirmed। এর মানে primary ব্যর্থ হলে, কোনো ডেটা হারায় না। RPO = 0।

Read replica **asynchronous** — replication lag আছে। Primary ব্যর্থ হলে এবং আপনি read replica promote করলে, recent write-এর সেকেন্ড বা মিনিট হারাতে পারেন। RPO > 0।

## শক্তি এবং সীমাবদ্ধতা

**Multi-AZ**:

- Production কাজের লোডের জন্য অপরিহার্য — single-AZ হলো single point of failure
- AWS service (RDS, ElastiCache, EKS, ALB সব Multi-AZ সমর্থন করে) দ্বারা ভালোভাবে সমর্থিত
- এটি প্রদান করা protection-এর তুলনায় তুলনামূলকভাবে কম cost overhead

**Multi-Region**:

- Database-এর জন্য বিশেষত সঠিকভাবে implement করা complex
- ডেটা residency/sovereignty প্রয়োজনীয়তা আসলে এটি প্রয়োজন হতে পারে (EU user data EU-তে থাকতে হবে)
- Global user-এর জন্য latency benefit routing থেকে আসে, multi-region থেকে per se নয় (static content-এর জন্য CloudFront ব্যবহার করুন)
- বেশিরভাগ সংস্থা active-active প্রয়োজন করে না; বেশিরভাগ warm standby-এ under-invest করে

## সারসংক্ষেপ

- **RTO** (Recovery Time Objective): কতক্ষণ ডাউন থাকতে পারবেন। **RPO** (Recovery Point Objective): কতটুকু ডেটা হারাতে পারবেন।
- **Multi-AZ** একটি Region-এর মধ্যে Availability Zone জুড়ে resource ছড়িয়ে দেয়। AZ failure থেকে সুরক্ষা করে।
- **Multi-Region** একাধিক AWS Region-এ deploy করে। Regional failure থেকে সুরক্ষা করে এবং global user-কে কম latency-এ পরিবেশন করে।
- DR strategy (সবচেয়ে সস্তা থেকে সবচেয়ে ব্যয়বহুল): Backup & Restore → Pilot Light → Warm Standby → Active-Active।
- RDS Multi-AZ standby: synchronous, automatic failover, RPO = 0। Read replica: asynchronous, manual promotion, RPO > 0।
- ইচ্ছাকৃতভাবে failure test করুন (chaos engineering) production-এ ঘটার আগে।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Resilient Architectures (ডোমেন ২, টাস্ক ২.২)*

- **RTO বনাম RPO**: পরীক্ষায় requirement দেওয়া হবে ("organization ১ ঘণ্টার বেশি downtime এবং কোনো ডেটা loss সহ্য করতে পারে না") এবং সঠিক DR strategy বেছে নিতে বলা হবে। Map করুন: কোনো ডেটা loss = synchronous replication = Multi-AZ বা active-active। ১ ঘণ্টার downtime = backup-and-restore অনেক ধীর; warm standby কাজ করতে পারে।
- **Multi-AZ RDS বনাম Read Replica**: পরীক্ষায় HA (Multi-AZ) বনাম read scaling (read replica) জিজ্ঞেস করা হবে। Multi-AZ standby readable নয়। Read replica primary-এ promote করা যায় (ম্যানুয়ালি) DR-এর জন্য।
- **Pilot Light বনাম Warm Standby**: Pilot Light-এ minimal infrastructure চলছে (শুধু ডেটা replication)। Warm Standby-এ scaled-down কিন্তু functional অ্যাপ্লিকেশন চলছে। পার্থক্য হলো কত দ্রুত scale up করতে পারবেন।
- **Aurora Global Database**: Multi-region active-passive-এর জন্য Aurora-নির্দিষ্ট feature। Primary region write পরিবেশন করে; secondary region <১ সেকেন্ড replication lag সহ read পরিবেশন করে। Failover-এ, secondary <১ মিনিটে promote হতে পারে। পরীক্ষার সংকেত: "Aurora, multi-region, RTO < 1 minute।"
- **AWS Backup**: EBS, RDS, DynamoDB, EFS, Storage Gateway-এর জন্য Centralized backup service। Backup-and-restore scenario-এর জন্য পরীক্ষা এটি ব্যবহার করে।
- **Route 53 failover**: DR-এর DNS layer। Primary health check ব্যর্থ → Route 53 secondary-তে route করে। Propagation time মানে এটি instant নয়।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

RTO এবং RPO-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। কোনো সংস্থার কেন low RTO (দীর্ঘ ডাউন থাকতে পারে না) কিন্তু high RPO (recent ডেটা হারাতে পারে) থাকতে পারে?

*(ইঙ্গিত: এমন একটি ব্যবসা নিয়ে ভাবুন যেখানে দ্রুত গ্রাহকদের সেবা দেওয়া প্রতিটি transaction সংরক্ষণের চেয়ে বেশি গুরুত্বপূর্ণ।)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি healthcare company `us-east-1`-এ RDS PostgreSQL-এ patient records system চালায়। Regulatory requirement mandate করে যে patient data কখনো হারাতে পারবে না (RPO = 0)। System ৩০ মিনিটের downtime (RTO = ৩০ মিনিট) সহ্য করতে পারে। Cost একটি concern।

কোন architecture এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) `us-east-1`-এ RDS Multi-AZ `us-west-2`-এ S3-এ daily automated backup সহ  
B) `us-east-1`-এ RDS Multi-AZ `us-west-2`-এ manual promotion-এর জন্য configure করা read replica সহ  
C) `us-east-1`-এ RDS active-active replication সহ `us-west-2`-এ warm standby  
D) `us-east-1`-এ primary এবং `us-west-2`-এ secondary সহ Aurora Global Database

**ইঙ্গিত ১**: RPO = 0 মানে কোনো ডেটা loss নেই, যার জন্য synchronous replication বা near-synchronous প্রয়োজন।

**ইঙ্গিত ২**: RTO = ৩০ মিনিট মানে manual intervention-এর সময় আছে। সম্পূর্ণ automatic millisecond failover প্রয়োজন নেই।

**ইঙ্গিত ৩**: কোন বিকল্প Multi-AZ protection (region-এ RPO = 0) plus cross-region DR capability প্রদান করে?

**উত্তর**: A

**ব্যাখ্যা**: us-east-1-এ RDS Multi-AZ একই region-এ standby-এ synchronous replication প্রদান করে — AZ failure-এর জন্য RPO = 0। us-west-2-এ S3-এ daily automated backup cross-region DR প্রদান করে। একটি সম্পূর্ণ regional failure-এ, us-west-2-এ S3 backup থেকে restore করুন — একটি ছোট database-এর জন্য ৩০ মিনিটের মধ্যে। এটি cost-effective এবং উভয় প্রয়োজনীয়তা পূরণ করে।

**কেন B নয়?** Read replica asynchronous — replication lag থাকতে পারে। Primary ব্যর্থ হলে, data written since last replica sync হারিয়ে যাওয়া ডেটা। RPO > 0, যা requirement লঙ্ঘন করে।

**কেন C নয়?** Region জুড়ে PostgreSQL-এর "Active-active replication" implement করা complex এবং standard RDS feature নয়। এই বিকল্পটি technically difficult এবং expensive।

**কেন D নয়?** Aurora Global Database কাজ করবে কিন্তু উল্লেখযোগ্যভাবে বেশি ব্যয়বহুল RDS Multi-AZ-এর চেয়ে। দৃশ্যকল্পে বলা হয়েছে cost একটি concern, এবং Aurora premium pricing।

*SAA-C03 ডোমেন: Design Resilient Architectures — টাস্ক ২.২*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus Seattle-তে একটি major food festival-এর জন্য ordering service প্রদান করতে selected হয়েছে। ৭২ ঘণ্টার জন্য, তারা স্বাভাবিক ট্রাফিকের ৫০x আশা করছে, downtime-এর শূন্য tolerance সহ (festival organizer-এর contract যেকোনো downtime-এর জন্য financial penalty নির্দিষ্ট করে)।

বিশেষ করে festival window-এর জন্য একটি DR strategy design করুন। আপনি কি সেই ৭২ ঘণ্টার জন্য active-active-এ switch করবেন? Failover আগে থেকে কীভাবে test করবেন? আপনার RTO কী হবে, এবং event-এর আগে কীভাবে validate করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো specific SLA requirement-এর জন্য DR design অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Leo chaos engineering runbook তৈরি করল।

প্রতি quarter-এ, planned maintenance window-এ, দল:

১. us-east-1a-তে একটি EC2 instance terminate করত এবং ASG সঠিকভাবে replace করে কিনা দেখত
২. ম্যানুয়ালি RDS Multi-AZ failover force করত এবং verify করত অ্যাপ্লিকেশন ৬০ সেকেন্ডের মধ্যে reconnect করেছে
৩. ASG-এর availability zone সামঞ্জস্য করে একটি সম্পূর্ণ us-east-1b failure simulate করত
৪. একটি নতুন RDS instance-এ এক-সপ্তাহ-পুরানো backup restore করত এবং verify করত ডেটা সঠিক দেখাচ্ছে

প্রথমবার তারা এটি চালাল, step ২ ৪ মিনিট ১৭ সেকেন্ড নিল।

"রেস্তোরাঁ অংশীদারদের প্রতি আমাদের RTO commitment ৫ মিনিট," Tom বলল।

"তাহলে আমরা pass করলাম।辛うじて।"

"Real incident-এ failover ৫ মিনিটের বেশি সময় নিলে কী হত?"

Maya উত্তর দিল: "আমরা SLA লঙ্ঘনে থাকতাম। Contract-এ একটি financial penalty আছে।"

Leo স্ক্রিনে ৪:১৭ দেখল।

"তাহলে আমাদের এটি দ্রুত করতে হবে," সে বলল। এবং সে Aurora-র documentation পড়তে শুরু করল।

পরবর্তী অধ্যায়ে: ticket machine যা Nimbus-এর প্রতিটি অংশকে নিজের গতিতে কাজ করতে দেয়।
