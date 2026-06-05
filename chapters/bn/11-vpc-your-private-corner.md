# অধ্যায় ১১: ক্লাউডের আপনার ব্যক্তিগত কোণা

Priya-র হাতে একটি কাগজে একটি আঁকা ছিল।

এটি জটিল আঁকা ছিল না। একটি আয়তক্ষেত্র, "AWS" লেবেলযুক্ত। আয়তক্ষেত্রের ভেতরে, বাক্সের একটি cluster: EC2 instance, একটি RDS ডেটাবেস, একটি ElastiCache cluster। সবকিছু সবকিছুর সাথে সংযোগকারী লাইন। এবং আয়তক্ষেত্রের বাইরে, একটি একক label: "Internet।"

সে এটি টেবিলের মাঝখানে রাখল।

"এটাই আমাদের কাছে আছে," সে বলল। "আমাদের ডেটাবেসের একটি public IP আছে। আমাদের cache layer ইন্টারনেট থেকে পৌঁছানো যায়। আমাদের EC2 instance গুলি সব একই flat network-এ।"

"এটা ঠিক আছে বলে মনে হচ্ছে," Leo বলল। "আমাদের security group আছে।"

"Security group যা আপনি configure করেছেন," Priya বলল। "রাতে। প্রাথমিক setup-এর সময়।"

Leo কিছু বলল না।

"আমি configuration-এর সমালোচনা করছি না," সে বলল। "আমি বলছি যখন সবকিছু একটি flat public network-এ থাকে, একটি single misconfiguration একটি কাজ করা সিস্টেম এবং ইন্টারনেটের সবার কাছে accessible একটির মধ্যে পার্থক্য।"

সে ডেটাবেসের চারপাশে একটি লাল marker দিয়ে বৃত্ত আঁকল।

"এটি ইন্টারনেট থেকে কখনো পৌঁছানো উচিত নয়। মোটেই না। কোনো security group rule-এর মাধ্যমে নয়, কোনো hardened configuration-এর মাধ্যমে নয়। এটি structurally unreachable হওয়া উচিত।"

"আমাদের network architecture নিয়ে কথা বলতে হবে," Maya বলল।

"তিন মাস আগে কথা বলা দরকার ছিল," Priya বলল। "কিন্তু এখনও ঠিক আছে।"

দল কয়েক সপ্তাহের মধ্যে প্রথমবার whiteboard-এর সামনে জড়ো হলো।

**Open Parking Lot-এর সমস্যা**

একটি বিশাল public parking garage কল্পনা করুন। দশ হাজার গাড়ি। যেকোনো গাড়ি যেকোনো জায়গায় পার্ক করতে পারে। Zone-এর মধ্যে কোনো barrier নেই, কোনো gate নেই, কোনো reserved section নেই।

এটি একটি open network। প্রতিটি পরিষেবা প্রতিটি অন্য পরিষেবার সাথে কথা বলতে পারে। আপনার web server আপনার ডেটাবেসের সাথে কথা বলতে পারে। আপনার ডেটাবেস ইন্টারনেটে পৌঁছাতে পারে। আপনার caching layer যেকোনো জায়গা থেকে connection পেতে পারে।

সবকিছু সবকিছুর সাথে কথা বলতে পারলে, একটি compromise সবকিছুকে প্রভাবিত করে।

"তাহলে কেউ parking garage-এ ঢুকলে," Tom বলল, "তারা যেকোনো গাড়িতে হাঁটতে পারে।"

"এবং যেকোনো গাড়ি থেকে, যেকোনো জায়গায় যেতে পারে," Priya নিশ্চিত করল। "আমরা fence চাই। আমরা locked gate চাই। আমরা zone চাই।"

VPC হলো AWS-এ সেই zone তৈরির উপায়।

**VPC কী?**

একটি **Virtual Private Cloud (VPC)** হলো AWS cloud-এর একটি logically isolated section — একটি private network যা আপনি সংজ্ঞায়িত করেন, যা শুধুমাত্র আপনার resource ডিফল্টরূপে অ্যাক্সেস করতে পারে।

বিশাল public parking garage-এর ভেতরে একটি fenced private lot হিসেবে মনে করুন। আপনার lot-এর নিজস্ব নিয়ম আছে: কে প্রবেশ করতে পারে, কে বের হতে পারে, section-গুলির মধ্যে কোন route বিদ্যমান।

একটি VPC তৈরি করার সময়, আপনি সংজ্ঞায়িত করেন:

**একটি CIDR block**: আপনার network-এর ভেতরে পাওয়া IP address-এর range। উদাহরণস্বরূপ, `10.0.0.0/16` আপনাকে ৬৫,৫৩৬টি সম্ভাব্য IP address দেয় (10.0.0.0 থেকে 10.0.255.255 পর্যন্ত)।

**Subnet**: আপনার VPC-এর বিভাজন, প্রতিটিকে আপনার IP address range-এর একটি অংশ বরাদ্দ করা এবং একটি নির্দিষ্ট Availability Zone-এর সাথে যুক্ত।

**Route table**: নেটওয়ার্ক ট্রাফিক কোথায় যাবে তা নির্ধারণ করে নিয়ম।

**Internet Gateway**: আপনার VPC এবং public internet-এর মধ্যে সংযোগ।

**Subnet: Public বনাম Private**

সমস্ত resource publicly accessible হওয়া উচিত নয়।

আপনার web server-কে ইন্টারনেট থেকে ট্রাফিক গ্রহণ করতে হবে — ব্যবহারকারীর browser-কে এটিতে পৌঁছাতে হবে।

আপনার ডেটাবেস *কখনো* ইন্টারনেট থেকে ট্রাফিক গ্রহণ করা উচিত নয় — শুধুমাত্র আপনার web server এর সাথে কথা বলতে পারা উচিত।

এখানেই subnet আসে।

একটি **public subnet** একটি Internet Gateway-এর সাথে সংযুক্ত এবং public IP address সহ resource থাকতে পারে। ট্রাফিক ইন্টারনেটে এবং থেকে flow করতে পারে।

একটি **private subnet**-এ কোনো সরাসরি ইন্টারনেট সংযোগ নেই। Private subnet-এর resource শুধুমাত্র আপনার VPC-এর অন্য resource-এর সাথে যোগাযোগ করতে পারে (যদি না আপনি নির্দিষ্ট outbound route সেটআপ করেন)। তাদের কোনো public IP address নেই।

Nimbus-এর জন্য, design স্পষ্ট হয়ে গেল:

```
Internet
    |
Internet Gateway
    |
Public Subnet (AZ-a)     Public Subnet (AZ-b)
  [Load Balancer]          [Load Balancer]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [EC2 Instances]           [EC2 Instances]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [RDS Primary]             [RDS Standby]
  [ElastiCache]             [ElastiCache]
```

Load balancer public-facing — এটিকে ইন্টারনেট থেকে ট্রাফিক গ্রহণ করতে হবে। EC2 instance private — তারা শুধুমাত্র load balancer থেকে ট্রাফিক গ্রহণ করে। ডেটাবেস private — তারা শুধুমাত্র EC2 instance থেকে ট্রাফিক গ্রহণ করে।

"তাহলে ডেটাবেসে পৌঁছাতে," Tom বলল, "কাউকে load balancer, তারপর EC2 instance, তারপর ডেটাবেস security group দিয়ে যেতে হবে?"

"তিনটি layer," Priya নিশ্চিত করল। "Defense in depth।"

**NAT Gateway: Private Subnet যা এখনো জিনিস ডাউনলোড করতে পারে**

Private subnet ইন্টারনেটে পৌঁছাতে পারে না। কিন্তু কখনো কখনো, তাদের দরকার হয়। আপনার EC2 instance-কে একটি software update ডাউনলোড করতে হবে। আপনার অ্যাপ্লিকেশনকে একটি external API call করতে হবে।

এখানেই **NAT Gateway** (Network Address Translation) আসে।

একটি NAT Gateway একটি public subnet-এ বসে। Private subnet-এর resource NAT Gateway-এ outbound ট্রাফিক পাঠাতে পারে, যা এটি ইন্টারনেটে relay করে — কিন্তু ইন্টারনেট সংযোগ ফিরিয়ে শুরু করতে পারে না।

এটি একটি one-way revolving door-এর মতো। আপনি বাইরে যেতে পারেন। বাইরে কেউ ঢুকতে পারে না।

"NAT Gateway-এর দাম কত?" Tom জিজ্ঞেস করল।

প্রশ্নটি কাউকে অবাক করেনি।

NAT Gateway pricing-এ দুটি component আছে: প্রতিটি NAT Gateway-এর জন্য একটি ঘণ্টার চার্জ, plus একটি per-GB ডেটা processing ফি। এটি অপ্রত্যাশিতভাবে যোগ হতে পারে (অধ্যায় ৩০ এটি বিস্তারিতভাবে কভার করে)। এখনকার জন্য: প্রয়োজনের চেয়ে বেশি NAT Gateway ব্যবহার করবেন না এবং সচেতন থাকুন যে বড় পরিমাণ outbound ডেটা আপনার বিলে দেখা দেবে।

**Route Table: ট্রাফিক কীভাবে তার পথ খুঁজে পায়**

প্রতিটি subnet-এ একটি **route table** আছে যা ট্রাফিক কোথায় যাবে তা বলে।

একটি সাধারণ public subnet route table এভাবে দেখায়:

| Destination | Target                      |
|-------------|-----------------------------|
| 10.0.0.0/16 | local                       |
| 0.0.0.0/0   | igw-xxxx (Internet Gateway) |

প্রথম নিয়ম: আপনার VPC range-এ যেকোনো IP-তে ট্রাফিক local থাকে। দ্বিতীয় নিয়ম: অন্য সমস্ত ট্রাফিক (`0.0.0.0/0` মানে "সবকিছু") Internet Gateway-এ যায়।

একটি private subnet route table:

| Destination | Target                 |
|-------------|------------------------|
| 10.0.0.0/16 | local                  |
| 0.0.0.0/0   | nat-xxxx (NAT Gateway) |

Private subnet ট্রাফিক local থাকে বা NAT Gateway-এর মাধ্যমে বের হয়। Internet Gateway-এ কোনো সরাসরি route নেই।

**Security Group বনাম NACL (Preview)**

VPC-এর ভেতরে, resource level-এ ট্রাফিক নিয়ন্ত্রণের জন্য আপনার দুটি সরঞ্জাম আছে:

**Security Groups** (অধ্যায় ১৫ এটি গভীরে কভার করে) পৃথক resource-এর জন্য virtual firewall হিসেবে কাজ করে — একটি EC2 instance, একটি RDS instance, একটি load balancer। এগুলি *stateful*: ট্রাফিক ভেতরে আসার অনুমতি পেলে, response ট্রাফিক স্বয়ংক্রিয়ভাবে বাইরে যাওয়ার অনুমতি পায়।

**Network ACL (NACL)** subnet level-এ কাজ করে এবং *stateless*: আপনাকে inbound এবং outbound ট্রাফিক আলাদাভাবে স্পষ্টভাবে allow করতে হবে।

বেশিরভাগ ব্যবহারের ক্ষেত্রে, Security Group যথেষ্ট। NACL একটি অতিরিক্ত layer যোগ করে যখন আপনার subnet-level control দরকার — উদাহরণস্বরূপ, একটি নির্দিষ্ট IP range-কে কখনো subnet-এ পৌঁছাতে block করা।

"Instance level-এ security group," Leo whiteboard-এ লিখল। "Subnet level-এ NACL।"

"এবং port 22 কখনো 0.0.0.0/0-এ খোলা রাখবেন না," Priya যোগ করল, Leo-র দিকে তাকিয়ে।

"সেটা একবার ছিল," Leo বলল।

"এটা সবসময় ঠিক একবার," Priya বলল, "যতক্ষণ না হয়।"

**VPC Peering: Private Network সংযোগ**

Nimbus যদি একাধিক VPC-তে বাড়ে? (এটি ঘটে। দল বড় হয়। পরিষেবাগুলি পৃথক account-এ বিচ্ছিন্ন হয়।)

**VPC Peering** দুটি VPC-কে একই network-এর মতো privately যোগাযোগ করতে দেয়। ট্রাফিক AWS-এর private network ছেড়ে যায় না।

গুরুত্বপূর্ণ সীমা:

- VPC peering transitive নয়। VPC A যদি VPC B-এর সাথে peer করে, এবং VPC B যদি VPC C-এর সাথে peer করে, A এবং C কথা বলতে পারে না — সরাসরি A-C peer বা Transit Gateway ছাড়া।
- CIDR block peered VPC-এর মধ্যে overlap করতে পারে না।

অনেক VPC সহ বড় architecture-এর জন্য, **AWS Transit Gateway** (অধ্যায় ২৫) peer connection-এর পূর্ণ mesh ছাড়া transitive routing সামলায়।

## শক্তি এবং সীমাবদ্ধতা

**VPC design কেন গুরুত্বপূর্ণ**:

- Network isolation হলো defense in depth — একটি layer লঙ্ঘন করলে সবকিছু compromise হয় না
- Private subnet attack surface উল্লেখযোগ্যভাবে কমায়
- Route table এবং security group ট্রাফিক flow-এর উপর নির্ভুল নিয়ন্ত্রণ দেয়
- VPC প্রতিটি AWS networking পরিষেবার সাথে integrate করে (Direct Connect, VPN, Transit Gateway)

**যেখানে জটিল হয়**:

- VPC design-এর জন্য upfront পরিকল্পনা প্রয়োজন — CIDR block পরে পরিবর্তন করা কঠিন
- অনেক ছোট VPC peering complexity তৈরি করে (n-squared সমস্যা)
- VPC-তে network সমস্যা debug করার জন্য একসাথে route table, security group, NACL এবং subnet association বোঝা প্রয়োজন
- স্কেলে NAT Gateway খরচ অবাক করতে পারে (per-GB processing ফি)

## সারসংক্ষেপ

- একটি **VPC** হলো AWS-এ একটি logically isolated private network — public cloud-এর ভেতরে আপনার fenced lot।
- **Subnet** আপনার VPC-কে Availability Zone দ্বারা বিভক্ত করে। Public subnet Internet Gateway-এর সাথে সংযুক্ত; private subnet নয়।
- Internet-facing resource (load balancer) public subnet-এ রাখুন। বাকি সবকিছু (EC2, ডেটাবেস, cache) private subnet-এ রাখুন।
- **Route table** ট্রাফিক কোথায় flow করে তা নিয়ন্ত্রণ করে। প্রতিটি subnet-এ একটি আছে।
- **NAT Gateway** (একটি public subnet-এ) private resource-কে inbound connection গ্রহণ না করে outbound ইন্টারনেট connection শুরু করতে দেয়।
- **VPC Peering** দুটি VPC-কে privately সংযুক্ত করে। Transitive নয় — বড়-মাপের connectivity-র জন্য Transit Gateway ব্যবহার করুন।
- **Security group** পৃথক resource রক্ষা করে (stateful)। **NACL** সম্পূর্ণ subnet রক্ষা করে (stateless)।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Secure Architectures (ডোমেন ১, টাস্ক ১.২)*

- **Public বনাম private subnet**: পার্থক্য হলো route table। Public subnet-এ Internet Gateway-এ একটি route আছে। Private subnet-এ নেই।
- **NAT Gateway placement**: সর্বদা *public* subnet-এ। Private subnet resource outbound ট্রাফিক এতে route করে।
- **NAT-এর জন্য High availability**: প্রতি AZ-এ একটি NAT Gateway তৈরি করুন। যদি আপনার AZ-a-তে একটি NAT Gateway থাকে এবং AZ-b instance এটির মাধ্যমে route করে, AZ-a ব্যর্থতা AZ-b-এর ইন্টারনেট অ্যাক্সেসও নামিয়ে দেয়।
- **VPC Peering transitive নয়**: পরীক্ষায় তিনটি VPC বর্ণনা করা হবে এবং জিজ্ঞেস করা হবে মাঝেরটির মাধ্যমে কথা বলতে পারে কিনা — সরাসরি peering বা Transit Gateway ছাড়া উত্তর না।
- **CIDR overlap**: Peered VPC-এর overlapping CIDR block থাকতে পারে না। Classic exam trap।
- **Bastion host (jump box)**: একটি private EC2 instance-এ SSH করতে, আপনার public subnet-এ একটি bastion host দরকার। Bastion একমাত্র machine যার public IP আছে; private instance শুধুমাত্র bastion-এর security group থেকে SSH গ্রহণ করে।
- **VPC Endpoint**: Private resource-কে NAT Gateway ছাড়াই AWS পরিষেবায় (S3, DynamoDB) পৌঁছাতে দেয়। দুটি type: **Gateway endpoint** (S3, DynamoDB — বিনামূল্যে) এবং **Interface endpoint** (অন্যান্য পরিষেবা — ঘণ্টা plus ডেটায় দাম)।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

ব্যাখ্যা করুন কেন একটি ডেটাবেস একটি private subnet-এ থাকা উচিত। এটি কোন নির্দিষ্ট হুমকি প্রশমিত করে?

*(ইঙ্গিত: public ইন্টারনেটে থাকা একটি ডেটাবেসে কেউ কী করতে পারে যা শুধুমাত্র VPC-এর ভেতর থেকে accessible একটি ডেটাবেসে করতে পারে না?)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি কোম্পানি AWS-এ একটি three-tier ওয়েব অ্যাপ্লিকেশন design করছে। Web tier (ALB + EC2) ইন্টারনেট ট্রাফিক গ্রহণ করতে হবে। Application tier (EC2) শুধুমাত্র web tier থেকে ট্রাফিক গ্রহণ করতে হবে। Database tier (RDS) শুধুমাত্র application tier থেকে ট্রাফিক গ্রহণ করতে হবে। Application tier EC2 instance-গুলিকে ইন্টারনেট থেকে software package ডাউনলোড করতে হবে। সমাধান highly available হতে হবে।

কোন architecture এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) সব tier public subnet-এ; security group tier-এর মধ্যে ট্রাফিক সীমাবদ্ধ করে  
B) Web tier public subnet-এ; app এবং database tier private subnet-এ; একটি public subnet-এ একটি NAT Gateway  
C) Web tier public subnet-এ; app এবং database tier private subnet-এ; প্রতি AZ-এ একটি NAT Gateway  
D) সব tier private subnet-এ; একটি Internet Gateway সব tier-এ bidirectional ইন্টারনেট অ্যাক্সেস প্রদান করে

**ইঙ্গিত ১**: "Highly available" মানে কোনো single point of failure নেই। কোন বিকল্পটি একটি single point of failure হিসেবে একটি NAT Gateway পরিচয় করিয়ে দেয়?

**ইঙ্গিত ২**: NAT Gateway-এর AZ ডাউন হলে, কোন instance ইন্টারনেট অ্যাক্সেস হারায়?

**ইঙ্গিত ৩**: প্রয়োজনীয়তা সাবধানে পড়ুন — application tier-এর *outbound* ইন্টারনেট অ্যাক্সেস দরকার, inbound নয়।

**উত্তর**: C

**ব্যাখ্যা**: Public subnet-এ web tier ALB-এর মাধ্যমে internet-facing অ্যাক্সেস প্রদান করে। Private subnet-এ app এবং database tier নিশ্চিত করে সেগুলি সরাসরি ইন্টারনেট থেকে পৌঁছানো যায় না। প্রতি AZ-এ একটি NAT Gateway (প্রতিটি public subnet-এ একটি) private-subnet instance-এর জন্য high-availability outbound ইন্টারনেট অ্যাক্সেস প্রদান করে — একটি AZ ব্যর্থ হলে, অন্য AZ-এর NAT Gateway ট্রাফিক পরিবেশন চালিয়ে যায়।

**কেন A নয়?** সব tier-এর জন্য public subnet সরাসরি ইন্টারনেটে application এবং ডেটাবেস expose করে, tiered security model-এর উদ্দেশ্য পরাজিত করে।

**কেন B নয়?** একটি single AZ-এ একটি NAT Gateway single point of failure। সেই AZ-এর NAT Gateway ব্যর্থ হলে, সমস্ত private instance outbound ইন্টারনেট অ্যাক্সেস হারায়।

**কেন D নয়?** Internet Gateway bidirectional connectivity প্রদান করে — Internet Gateway-এ route সহ private subnet কার্যকরভাবে public subnet।

*SAA-C03 ডোমেন: Design Secure Architectures — টাস্ক ১.২*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus বাড়ছে। Engineering team "menu service" তাদের নিজস্ব account-এ তাদের নিজস্ব VPC-তে আলাদা করতে চায়, মূল Nimbus অ্যাপ্লিকেশনকে একটি পৃথক account এবং VPC-তে রেখে।

মূল অ্যাপ্লিকেশন menu service query করতে পারে তার জন্য কীভাবে এই দুটি VPC সংযুক্ত করবেন? আপনাকে কোন constraint পরিকল্পনা করতে হবে? যদি Nimbus-এর দশটি পৃথক microservice VPC থাকত যার সবাইকে যোগাযোগ করতে হত তাহলে আপনি কী ব্যবহার করতেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো multi-VPC network design অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Priya network redesign করল।

তিন দিন পরে, প্রতিটি resource সঠিক জায়গায় ছিল। EC2 instance private subnet-এ। Load balancer public subnet-এ। RDS এবং ElastiCache শুধুমাত্র application layer থেকে accessible। ন্যূনতম প্রয়োজনীয় port সহ security group।

Leo সরাসরি ডেটাবেসে SSH করার চেষ্টা করেছিল কিছু check করতে। সে পারেনি। Connection timeout হয়েছিল।

"ভালো," Priya বলল।

"আমার শুধু একটি জিনিস check করতে হত," Leo বলল।

"কী?"

"Index সঠিকভাবে সেটআপ হয়েছে কিনা।"

Priya তার laptop তুলল। "আমি bastion host থেকে check করতে পারি, application instance-এর মাধ্যমে, যার Secrets Manager-এ সঠিক ডেটাবেস credential আছে।"

"এটা চারটি hop।"

"এটা সঠিক।" সে কিছু টাইপ করল। "Index সেটআপ হয়েছে। Welcome।"

Leo একটি মুহূর্তের জন্য screen দেখল।

"আমি এটা শিখব," সে বলল।

"আপনি ইতিমধ্যে আছেন," সে বলল। "আপনি কেবল security control সম্পর্কে অভিযোগ করলেন সেগুলি না থাকার অভিযোগের পরিবর্তে।"

পরবর্তী অধ্যায়ে: ইন্টারনেট কীভাবে Nimbus খুঁজে পায় — domain name-এর অদৃশ্য যন্ত্রপাতি।
