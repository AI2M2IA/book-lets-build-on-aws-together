# অধ্যায় ১৫: ফটকের পাহারাদার

এক মঙ্গলবার সকালে অফিস শান্ত ছিল যখন Priya VPC flow log খুলল এবং পড়তে শুরু করল। জানালার বাইরে, শহর জেগে উঠছিল। ভেতরে, screen এমন কিছু দেখাচ্ছিল যা সেখানে থাকা উচিত নয়: রাত ২:১৭-এ একটি EC2 instance থেকে Romania-র একটি IP address-এ একটি outbound connection।

Nimbus-এর প্রথম সংস্করণের পুরানো deploy key এখনো active ছিল। এটি গত সপ্তাহে তিনটি API call করেছিল। Leo জানত না কী সেগুলি করেছে।

---

*IAM overhaul access key-কে role দিয়ে প্রতিস্থাপন করেছিল। প্রতিটি service-এর এখন ঠিক প্রয়োজনীয় অনুমতি ছিল। কিন্তু সেই কাজ যখন হচ্ছিল, একটি পুরানো সমস্যা নীরবে খারাপ হচ্ছিল: একটি decommissioned deployment pipeline থেকে একটি active credential এখনো জীবিত ছিল, এবং কিছু একটা এটি ব্যবহার করেছিল। IAM layer শক্তিশালী করা হয়েছিল। ক্ষতি contain করতে পারত এমন network control-এর একই মনোযোগ দরকার ছিল।*

---

Priya VPC flow log তুলল — নেটওয়ার্ক ট্রাফিক রেকর্ড যা VPC-এ এবং থেকে প্রতিটি connection দেখায়।

"মঙ্গলবার রাত ২:১৭-এ," সে বলল, "পুরানো API চালানো EC2 instance থেকে Romania-র একটি IP address-এ একটি outbound connection ছিল।"

"এটা আমাদের অবকাঠামো নয়," Leo বলল।

"না।"

"তাহলে কেউ আমাদের EC2 instance-এ ছিল।"

"অথবা কিছু।"

তারা এটি trace করল: পুরানো deploy key একটি EC2 instance-এ একটি ছোট script upload করতে ব্যবহার করা হয়েছিল। Script সন্নিহিত server-এ port scan করার চেষ্টা করেছিল। বেশিরভাগ scan ব্যর্থ হয়েছিল।

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo তদন্ত সম্পূর্ণ হওয়ার আগে security group নিয়মে একটি fix deploy করেছিল। Fix সঠিক ছিল, কিন্তু Priya flow log পড়া শেষ করার আগে সে এটি করেছিল। তাকে থামতে হয়েছিল এবং যাচাই করতে হয়েছিল যে পরিবর্তন অপ্রত্যাশিত কিছু প্রভাবিত করেনি।

"পরের বার, পরিবর্তন push করার আগে তদন্ত বন্ধ না হওয়া পর্যন্ত অপেক্ষা করুন," সে বলল।

"Security group তাদের block করেছে," Priya বলল। "Attacker একটি EC2 instance-এ পৌঁছেছিল। তারা অন্যগুলিতে পৌঁছাতে পারেনি কারণ security group শুধুমাত্র load balancer থেকে ট্রাফিক allow করে।"

"তাহলে ক্ষতি contained ছিল।"

"কারণ আমাদের correctly configure করা security group ছিল। কল্পনা করুন যদি আমরা account-এর যেকোনো EC2 instance-এ port 5432 খোলা রাখতাম।"

Leo সেটা কল্পনা করার দরকার ছিল না। মূল setup-এ সে সেই configuration দেখেছিল।

"সেটার মানে কী হত তা নিয়ে আমরা ভেবেছি কি?" Priya চালিয়ে গেল। "account-এর যেকোনো EC2 instance — compromised key সহেরটি সহ — সরাসরি ডেটাবেসে connect হতে পারত। arbitrary SQL চালাতে পারত। প্রতিটি গ্রাহকের অর্ডার ইতিহাস ডাউনলোড করতে পারত। Table drop করতে পারত।"

"পরিবর্তে তারা প্রতিবার চেষ্টা করার সময় rejected হয়েছিল," Leo বলল।

"হ্যাঁ। কারণ ডেটাবেস security group শুধুমাত্র API security group থেকে connection গ্রহণ করে। account-এর যেকোনো EC2 থেকে নয়। যেকোনো IP থেকে নয়। বিশেষভাবে API security group থেকে।"

"সেই একটি design সিদ্ধান্ত," Maya বলল, "একটি contained ঘটনা এবং একটি পূর্ণ data breach-এর মধ্যে পার্থক্য ছিল।"

"Security group design একটি checkbox নয়," Priya বলল। "এটি সিস্টেমের প্রকৃত নিরাপত্তা।"

Rafael শুনছিল। "আপনি সঠিক configuration কী তা কীভাবে শেখেন? নিয়মগুলি প্রথমে arbitrary মনে হয়।"

"আপনি প্রতিটি component-এর কী করার দরকার তা তালিকাভুক্ত করে শুরু করেন," Priya বলল। "Load balancer-কে যেকোনো জায়গা থেকে HTTPS গ্রহণ করতে হবে। API server-কে শুধুমাত্র load balancer থেকে HTTP গ্রহণ করতে হবে। ডেটাবেসকে শুধুমাত্র API server থেকে PostgreSQL গ্রহণ করতে হবে। Redis-কে শুধুমাত্র API server থেকে port 6379 গ্রহণ করতে হবে। সেই প্রয়োজনীয়তাগুলি সরাসরি inbound নিয়মে map করে। বাকি সবকিছু ডিফল্টরূপে denied।"

"এবং outbound?"

"Outbound যেখানে মানুষ অলস হয়। বেশিরভাগ দল outbound allow-all রাখে। এর মানে একটি compromised instance যেকোনো কিছু call করতে পারে। আমরা সেটা শক্ত করব।"

**Network Security-এর দুটি Layer**

একটি VPC-তে, network ট্রাফিক নিয়ন্ত্রণের জন্য আপনার দুটি স্বতন্ত্র সরঞ্জাম আছে:

**Security Group**: পৃথক resource-এ attached ভার্চুয়াল firewall (EC2 instance, RDS database, load balancer, একটি VPC-তে Lambda function)। তারা resource স্তরে কাজ করে।

**Network ACL (NACL)**: Subnet-এ attached firewall নিয়ম। তারা subnet boundary-তে কাজ করে — সেই subnet-এর যেকোনো resource-এ ট্রাফিক পৌঁছানোর আগে।

উভয় বোঝার জন্য একটি critical পার্থক্য বোঝা দরকার: **stateful বনাম stateless**।

**Stateful: Security Group**

একটি security group **stateful**।

যখন আপনি একটি নির্দিষ্ট port-এ inbound ট্রাফিক allow করেন, response ট্রাফিক স্বয়ংক্রিয়ভাবে বাইরে allow হয়, এমনকি এর জন্য কোনো explicit outbound নিয়ম না থাকলেও।

যখন আপনি একটি গন্তব্যে outbound ট্রাফিক allow করেন, ফিরে আসা response স্বয়ংক্রিয়ভাবে allow হয়।

একটি office building-এ একজন stateful security guard-এর মতো মনে করুন। আপনি প্রবেশ করতে আপনার badge দেখান। আপনি পরে বাইরে হাঁটেন। Guard-কে বের হওয়ার পথে আবার আপনাকে check করার দরকার নেই — সিস্টেম জানে আপনাকে ঢুকতে দেওয়া হয়েছিল, এবং আপনাকে যাওয়ার অনুমতি আছে।

**Nimbus API EC2 instance-এর জন্য Security Group নিয়ম:**

- **Inbound — TCP 8080 — Load Balancer SG থেকে** → ALB থেকে API ট্রাফিক গ্রহণ করুন
- **Inbound — TCP 22 — Bastion Host SG থেকে** → শুধুমাত্র bastion থেকে SSH
- **Outbound — TCP 5432 — RDS SG-তে** → PostgreSQL-এ connect করুন
- **Outbound — TCP 6379 — ElastiCache SG-তে** → Redis-এ connect করুন
- **Outbound — TCP 443 — 0.0.0.0/0-তে** → External API-তে HTTPS

লক্ষ্য করুন: port 8080-এর জন্য কোনো explicit outbound নিয়ম নেই। Inbound নিয়ম stateful — response ট্রাফিক (load balancer-এ API-র reply) স্বয়ংক্রিয়ভাবে allow।

এছাড়াও লক্ষ্য করুন: security group নিয়ম *অন্য security group* reference করে, IP address নয়। "Load balancer security group থেকে inbound allow করুন" মানে "এই security group attached যেকোনো resource থেকে ট্রাফিক allow করুন।" এটি IP address tracking-এর চেয়ে আরো নমনীয় এবং maintainable।

**Default behavior:**

- ডিফল্টরূপে, সমস্ত inbound ট্রাফিক denied
- ডিফল্টরূপে, সমস্ত outbound ট্রাফিক allowed
- সমস্ত নিয়ম evaluate করা হয় (security group-এর ordered নিয়ম নেই — সমস্ত matching নিয়ম apply)
- Security group শুধুমাত্র ট্রাফিক **allow** করতে পারে — আপনি explicit deny নিয়ম তৈরি করতে পারেন না

**Stateless: Network ACL**

একটি NACL **stateless**।

আপনি port 8080-এ inbound ট্রাফিক allow করলে, এটি শুধুমাত্র inbound cover করে। Response (ephemeral port-এ outbound ট্রাফিক) একটি outbound নিয়ম দিয়ে স্পষ্টভাবে allow করতে হবে।

একটি metal detector-এর মতো মনে করুন। আপনি ভেতরে যাওয়ার পথে এটির মধ্য দিয়ে যান। Metal detector জানে না আপনি ইতিমধ্যে এর মধ্য দিয়ে গেছেন — আপনাকে বের হওয়ার পথে আবার যেতে হবে।

**NACL নিয়ম numbered এবং ক্রমানুসারে evaluate করা হয়।** প্রথম matching নিয়ম জেতে। নিয়ম ১০০ নিয়ম ২০০-এর আগে evaluate হয়। নিয়ম ১০০ ট্রাফিক deny করলে এবং নিয়ম ২০০ এটি allow করলে, ট্রাফিক denied।

NACL স্পষ্টভাবে ট্রাফিক **deny** করতে পারে — security group-এর বিপরীতে যা শুধুমাত্র allow করতে পারে। এটি নির্দিষ্ট IP range block করার জন্য তাদের দরকারী করে।

**Default NACL behavior:**

- Default NACL (আপনার VPC-এর সাথে তৈরি) সমস্ত inbound এবং outbound ট্রাফিক allow করে
- একটি custom NACL ডিফল্টরূপে সমস্ত ট্রাফিক deny করে (আপনি যা চান তা explicitly allow করতে হবে)

**Public subnet-এর NACL (সরলীকৃত):**

*Inbound নিয়ম (ক্রমানুসারে evaluate — প্রথম match জেতে):*

- নিয়ম ১০০: TCP 443, 0.0.0.0/0 থেকে → **Allow** (HTTPS)
- নিয়ম ১১০: TCP 80, 0.0.0.0/0 থেকে → **Allow** (HTTP)
- নিয়ম ১২০: TCP 1024–65535, 0.0.0.0/0 থেকে → **Allow** (ephemeral return port)
- নিয়ম \*: সমস্ত ট্রাফিক → **Deny**

*Outbound নিয়ম:*

- নিয়ম ১০০: TCP 443, 0.0.0.0/0-তে → **Allow** (HTTPS)
- নিয়ম ১১০: TCP 80, 0.0.0.0/0-তে → **Allow** (HTTP)
- নিয়ম ১২০: TCP 1024–65535, 0.0.0.0/0-তে → **Allow** (ephemeral return port)
- নিয়ম \*: সমস্ত ট্রাফিক → **Deny**

নিয়ম ১২০ (port 1024-65535) ephemeral port allow করে — TCP response ট্রাফিকের জন্য ব্যবহৃত অস্থায়ী high-numbered port। NACL stateless হওয়ায়, আপনাকে এগুলি explicitly outbound allow করতে হবে, নয়তো আপনার সার্ভারের response pass হবে না।

**কোনটি কখন ব্যবহার করবেন**

"দাঁড়াও — কিন্তু আমরা *কেন* এভাবে করব?" Maya জিজ্ঞেস করল। "Security group ইতিমধ্যে কাজ করলে দুটি আলাদা সরঞ্জাম — security group *এবং* NACL — কেন রাখব? অতিরিক্ত জটিলতার মানে কী?"

উত্তর হলো তারা ভিন্ন স্তরে কাজ করে এবং ভিন্ন ক্ষমতা আছে। Security group পৃথক resource রক্ষা করে এবং শুধুমাত্র ট্রাফিক allow করতে পারে। NACL সম্পূর্ণ subnet রক্ষা করে এবং explicitly deny করতে পারে। উভয় থাকার মানে আপনি resource স্তরে fine-grained allow নিয়ম এবং subnet স্তরে broad deny নিয়ম প্রয়োগ করতে পারেন — একটি অন্যটিতে হস্তক্ষেপ না করে।

Primary access control layer-এর জন্য **security group** ব্যবহার করুন। সেগুলি manage করা সহজ, stateful (ephemeral port ভুলে যাওয়া থেকে দুর্ঘটনাজনিত block-এর কম সম্ভাবনা), এবং অন্য security group reference করা সমর্থন করে।

Subnet-স্তরের control-এর জন্য **NACL** ব্যবহার করুন, বিশেষ করে:

- **Explicit deny নিয়ম**: একটি নির্দিষ্ট IP address বা range-কে একটি সম্পূর্ণ subnet-এ পৌঁছানো থেকে block করুন
- **Emergency blocking**: একটি IP সক্রিয়ভাবে attack করছে — যেকোনো resource-এ পৌঁছানোর আগে সম্পূর্ণ subnet block করতে একটি NACL deny নিয়ম যোগ করুন

আপনি হয়তো ভাবছেন: security group যদি stateful এবং ডিফল্টরূপে সমস্ত inbound block করে, আপনার আসলে কখন NACL দরকার হবে? Security group বেশিরভাগ ক্ষেত্রে ভালোভাবে সামলায়। কিন্তু একটি জিনিস তারা করতে পারে না: explicitly deny। একটি security group শুধুমাত্র ট্রাফিক allow করতে পারে — একটি নিয়ম না মিললে, ট্রাফিক ডিফল্টরূপে denied। আপনি এমন একটি নিয়ম যোগ করতে পারেন না যা বলে "এই নির্দিষ্ট IP block করুন।" সেটির জন্য, আপনার একটি NACL দরকার: একটি numbered deny নিয়ম যা একটি নির্দিষ্ট address range-কে subnet-এর যেকোনো resource-এ পৌঁছানোর আগে থামায়। NACL emergency response (একটি active attacker block করা) এবং পৃথক resource configuration-এর উপর নির্ভর করা উচিত নয় এমন subnet-স্তরের boundary প্রয়োগ করার জন্য সবচেয়ে উপযোগী।

"তাহলে security group হলো fine-grained control," Maya বলল, "এবং NACL হলো broad stroke?"

"Security group পৃথক resource রক্ষা করে," Priya নিশ্চিত করল। "NACL সম্পূর্ণ subnet রক্ষা করে। আপনি যখন আপনার network-এ একটি IP-কে কিছুতে পৌঁছানো থেকে block করতে চান, NACL। আপনি যখন শুধুমাত্র load balancer-কে API server-এ পৌঁছানোর অনুমতি দিতে চান, security group।"

"Attacker একটি ভিন্ন IP নিয়ে ফিরে এলে কী হয় তা নিয়ে আমরা ভেবেছি কি?" Priya বলল। "NACL একটি range block করে। তারা অন্যটিতে shift করে।"

"সেটাই GuardDuty-র জন্য," Leo বলল। "Behavioral detection। একই script একটি নতুন IP থেকে চললে, ট্রাফিক pattern একই দেখায়।"

"আমরা সেখানে পৌঁছাব," Priya বলল। "প্রথম জিনিস প্রথমে।"

"এই সব মাসে কত খরচ করে?" Tom জিজ্ঞেস করল।

Security group এবং NACL নিজেরা বিনামূল্যে। AWS security group-এর সংখ্যা, নিয়মের সংখ্যা, বা NACL entry-র সংখ্যার জন্য charge করে না। খরচের বিবেচনা পরোক্ষ: শক্ত outbound security group নিয়ম NAT Gateway-এর মাধ্যমে কম ট্রাফিক route করতে পারে, ডেটা processing চার্জ কমায়।

"তাহলে security control বিনামূল্যে," Rafael বলল। "খরচ হলো সেগুলিকে সমর্থনকারী অবকাঠামো।"

"সঠিক। High availability-র জন্য NAT Gateway। NAT-এর মধ্য দিয়ে যেত এমন service-এর জন্য Interface VPC Endpoint। সেগুলির খরচ আছে। Security group নিয়ম নিজেরা নেই।"

**একসাথে রাখা: Layered Defense**

ঘটনার পরে, Priya whiteboard-এ Nimbus defense layer আঁকল:

```
Internet
  ↓
CloudFront + Shield (DDoS absorption)
  ↓
WAF (application-layer filtering)
  ↓
Internet Gateway
  ↓
NACL on public subnet (subnet-level rules, emergency blocking)
  ↓
ALB Security Group (HTTPS from anywhere)
  ↓
NACL on private app subnet
  ↓
EC2 API Security Group (port 8080 from ALB SG only)
  ↓
NACL on private data subnet
  ↓
RDS Security Group (port 5432 from API SG only)
```

"প্রতিটি layer ধরে নেয় আগেরটি ব্যর্থ হতে পারে," সে বলল। "ডেটাবেস বিশ্বাস করে না যে network layer attacker-কে থামিয়েছে। EC2 instance বিশ্বাস করে না যে ALB attacker-কে থামিয়েছে। প্রতিটি layer স্বাধীনভাবে তার নিজস্ব নিয়ম enforce করে।"

"Defense in depth," Maya বলল।

"Defense in depth। একটি layer পেরিয়ে যাওয়া একজন attacker এখনো পরেরটির মুখোমুখি হয়। কোনো একক misconfiguration catastrophic নয়। এর মানে একটি layer ব্যর্থ হয়, এবং অন্যগুলি ধরে রাখে।"

Leo diagram দেখল। Attacker একটি EC2 instance compromise করেছিল। তারা credential layer পেরিয়ে গিয়েছিল। কিন্তু প্রতিটি পরবর্তী layer ধরে রেখেছিল।

বাস্তবে defense in depth এমনই দেখায়।

**ঘটনা: Layer গুলি কী Caught করেছিল**

Romanian IP attack-এ ফিরে যাওয়া:

**কী হয়েছিল**: Attacker compromised deploy key ব্যবহার করে একটি EC2 instance-এ একটি scanning script upload করেছিল। Script অন্য service-এ connect করার চেষ্টা করেছিল।

**কী তাদের থামিয়েছিল**:

- RDS security group শুধুমাত্র API EC2 security group থেকে port 5432-এ inbound allow করে। Script একটি scanning tool থেকে ডেটাবেসে পৌঁছাতে পারেনি — এটি সঠিক security group attach করছিল না।
- ElastiCache security group শুধুমাত্র API EC2 security group থেকে port 6379-এ inbound allow করে।
- অন্যান্য EC2 instance শুধুমাত্র bastion host security group থেকে SSH allow করে।

**কী তাদের থামায়নি**: 

- EC2 instance-এর outbound নিয়ম 0.0.0.0/0-এ HTTPS allow করে (package download-এর জন্য দরকার)। Script এটি attacker-এর server-এ outbound connection করতে ব্যবহার করেছিল।

ঘটনার পরে, Priya যোগ করল:

- Romanian IP range block করা একটি NACL নিয়ম
- EC2 instance-এ আরো restrictive একটি outbound নিয়ম (শুধুমাত্র নির্দিষ্ট known-good destination allow করা)
- প্রতিটি instance-এ **IMDSv2 enforced ছিল** (`HttpTokens=required`) এমন একটি check — script instance-*এ* চলেছিল, যার মানে এটি instance role-এর temporary credential-এর জন্য metadata service query করতে পারত। IMDSv2 অধ্যায় ৪-এ সক্ষম করা হয়েছিল; Priya যাচাই করল এটি এখনো সর্বত্র required ছিল, কারণ code execution plus IMDSv1 সহ একজন attacker সমান চুরি হওয়া AWS credential।

---

**Flow Log পড়া: Priya যা দেখল**

তদন্ত VPC flow log দিয়ে শুরু হয়েছিল। Priya CloudWatch Logs Insights খুলল এবং গত 48 ঘণ্টার জন্য flow log group-এর বিরুদ্ধে একটি query চালাল:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` ছিল compromised EC2 instance। REJECT filter blocked হওয়া connection প্রচেষ্টা দেখিয়েছিল।

ফলাফল:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Other EC2 instance — SSH blocked
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Another EC2 — SSH blocked
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — blocked by security group
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # RDS replica — blocked
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — blocked
```

Scan প্রতিটি internal service-এ আঘাত করেছিল। প্রতিটি প্রচেষ্টা rejected হয়েছিল। Security group design ধরে রেখেছিল।

কিন্তু একটি outbound ACCEPT entry-ও ছিল:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

সেটা ছিল data exfiltration প্রচেষ্টা — HTTPS-এর মাধ্যমে Romanian IP-তে পাঠানো 2.8 কিলোবাইট। Security group বৈধ package download-এর জন্য HTTPS outbound allow করেছিল। Attacker সেই নিয়ম ব্যবহার করেছিল।

"Security group lateral movement থামিয়েছিল," Priya বলল, দলকে log-এর মধ্য দিয়ে নিয়ে। "কিন্তু outbound নিয়ম খুব permissive ছিল। আমরা যেকোনো গন্তব্যে HTTPS allow করেছিলাম। আমাদের শুধুমাত্র known AWS endpoint-এ HTTPS allow করা উচিত — CloudWatch, Secrets Manager, S3 — এবং package repository CDN-এ।"

সে আপডেট করা security group outbound নিয়ম দেখাল:

```
TCP 443 → pl-63a5400a (AWS S3 gateway endpoint prefix list)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (AWS package repos — narrows over time)
```

"এটা সাধারণ HTTPS outbound নিয়ম নির্মূল করে। Outbound HTTPS এখন শুধুমাত্র known-good destination-এ যায়।"

"Third-party API call করা Lambda function সম্পর্কে কী?" Leo জিজ্ঞেস করল।

"সেগুলি NAT Gateway-এর মাধ্যমে যায়, যার নিজস্ব dedicated outbound নিয়ম আছে," Priya বলল। "Lambda EC2 security group ব্যবহার করে না। ভিন্ন network interface, ভিন্ন নিয়ম set।"

---

**Stateless Debugging গল্প**

ঘটনার দুই সপ্তাহ পরে, Rafael — এখনো তার প্রথম মাসে — একটি নতুন data pipeline সেট আপ করতে সাহায্য করছিল। এতে একটি VPC-তে একটি Lambda function জড়িত ছিল যার EC2-তে চলমান একটি internal API call করতে হবে।

Lambda function timeout হলো। প্রতিটি call timeout হলো।

Rafael security group চেক করল। Lambda security group-এ EC2 security group-এ TCP 8080-এর জন্য একটি outbound নিয়ম ছিল। EC2 security group-এ Lambda security group থেকে TCP 8080-এর জন্য একটি inbound নিয়ম ছিল। নিয়মগুলি সঠিক দেখাচ্ছিল।

সে Leo-র দিকে ফিরল। "Security group ঠিক দেখাচ্ছে। এটা timeout হচ্ছে কেন?"

Leo subnet configuration দেখল। Lambda function একটি private subnet-এ ছিল। Subnet-এর একটি custom NACL ছিল যা Priya security hardening-এর সময় প্রয়োগ করেছিল।

সে NACL outbound নিয়ম দেখল:

```
Rule 100: TCP 443  → 0.0.0.0/0  ALLOW
Rule 110: TCP 5432 → 10.0.20.0/24 ALLOW
Rule *:   All      → 0.0.0.0/0  DENY
```

"NACL HTTPS outbound এবং PostgreSQL outbound allow করে," Leo বলল। "এটি TCP 8080 outbound allow করে না।"

"Security group এটা allow করে," Rafael বলল।

"NACL করে না। এবং NACL stateless। এমনকি Lambda function-এর security group outbound connection allow করলেও, subnet boundary-তে NACL এখনো outbound ট্রাফিক evaluate করে। NACL subnet ছাড়ার আগে Lambda-র call block করছে।"

"কিন্তু আমি যদি NACL-এ TCP 8080 outbound-এর জন্য ALLOW যোগ করি—"

"আপনাকে ephemeral port inbound-এর জন্যও ALLOW যোগ করতে হবে," Leo বলল। "EC2 instance থেকে response 1024 এবং 65535-এর মধ্যে একটি random port-এ ফিরে আসে। NACL-এর inbound নিয়ম সেগুলি allow না করলে, return trip-এ response blocked।"

Rafael NACL আপডেট করল:

```
Rule 100:  TCP 443       → 0.0.0.0/0      ALLOW  (outbound)
Rule 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (outbound to EC2 subnet)
Rule 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (outbound to DB subnet)
Rule *:    All           → 0.0.0.0/0      DENY
```

এবং inbound দিকে:

```
Rule 100:  TCP 1024-65535 from 10.0.10.0/24  ALLOW  (return traffic from EC2)
Rule *:    All                               DENY
```

Lambda function তাৎক্ষণিকভাবে connect হলো।

"এজন্যই মানুষ NACL ঘৃণা করে," Rafael বলল।

"এজন্যই আপনাকে সেগুলি বুঝতে হবে," Priya বলল। "তারা যে bug তৈরি করে তা ঠিক সেই bug যা তারা প্রতিরোধ করার জন্য ডিজাইন করা — অপ্রত্যাশিত ট্রাফিক flow। Stateless model বোঝা আপনাকে ঠিক বলে দেয় একটি connection রহস্যজনকভাবে ব্যর্থ হলে কোথায় দেখতে হবে।"

"Security group stateful — return ট্রাফিক স্বয়ংক্রিয়। NACL stateless — return ট্রাফিকের explicit নিয়ম দরকার," Rafael পুনরাবৃত্তি করল।

"এটা আপনি কীভাবে ভাবেন তার অংশ না হওয়া পর্যন্ত বলুন," Priya বলল।

---

**NACL Emergency Blocking: /24 নিয়ম**

Attacker-এর source IP range চিহ্নিত করার পরে, Priya-র প্রতিক্রিয়া তাৎক্ষণিক ছিল: একটি NACL deny নিয়ম যোগ করুন।

কিন্তু সে শুধু একক IP block করেনি। সে সম্পূর্ণ `/24` block করল — attacker যে 256-address subnet থেকে পরিচালনা করছিল।

"পুরো /24 কেন?" Leo জিজ্ঞেস করল।

"কারণ পৃথক IP block করা একটি হারা খেলা। Attacker একটি range-এর মধ্যে একাধিক IP ব্যবহার করে, একটি block হলে সেগুলির মধ্যে rotate করে। /24 block করা এটিকে কঠিন করে — তাদের একটি ভিন্ন address block-এ shift করতে হবে, যা তাদের সময় এবং প্রচেষ্টা খরচ করে।"

NACL নিয়ম:

```
Rule 90:  ALL from 185.220.101.0/24 → DENY
```

নিয়ম 90 যেকোনো allow নিয়মের (যা নিয়ম 100-এ শুরু হয়) আগে evaluate হয়। সম্পূর্ণ range যেকোনো allow নিয়ম বিবেচনা করার আগে blocked।

"এবং এটা subnet-এর প্রতিটি resource-এ প্রযোজ্য?" Leo জিজ্ঞেস করল।

"প্রতিটি resource। সেটাই একটি NACL-এর point — এটি ট্রাফিক যেকোনো পৃথক resource-এর security group-এ পৌঁছানোর আগে প্রযোজ্য। নিয়ম 90-এ একটি NACL deny মানে packet কখনো security group evaluation-এ পৌঁছায় না।"

"আমরা কি এটা পরিবর্তে একটি security group দিয়ে করতে পারি?"

"না। Security group শুধুমাত্র ট্রাফিক allow করতে পারে। কোনো deny নিয়ম নেই। আপনি যদি একটি নির্দিষ্ট IP-কে একটি subnet-এর যেকোনো resource-এ পৌঁছানো থেকে block করতে চান, NACL একমাত্র বিকল্প।"

এটি NACL deny নিয়মের primary ব্যবহারের ক্ষেত্র: active attack-এ emergency response। Security group হলো primary control mechanism। NACL হলো emergency brake।

---

**Security Group Design Pattern: ID দ্বারা Reference**

"আমাদের EC2 instance প্রতিস্থাপিত হলে কী হয় তা নিয়ে আমরা ভেবেছি কি?" Priya জিজ্ঞেস করল। "Auto Scaling পুরানো instance terminate করে এবং নতুন launch করে। নতুন instance নতুন private IP address পায়।"

"Security group নিয়ম IP address reference করলে," Leo ধীরে ধীরে বলল, "আমাদের প্রতিবার একটি instance প্রতিস্থাপিত হলে নিয়ম আপডেট করতে হবে।"

"ঠিক। এজন্যই আপনি intra-VPC ট্রাফিকের জন্য security group নিয়মে IP address reference করেন না।"

Security group IP address-এর পরিবর্তে অন্য security group reference করতে পারে। যখন একটি নিয়ম বলে "load balancer security group থেকে inbound allow করুন," এর মানে "load balancer security group attached যেকোনো resource থেকে ট্রাফিক allow করুন।" Auto Scaling প্রতিটিতে একটি নতুন IP সহ হাজার নতুন instance launch করতে পারে, এবং নিয়ম বৈধ থাকে।

Nimbus security group structure:

```
nimbus-alb-sg (Load Balancer)
  - Inbound: TCP 443 from 0.0.0.0/0
  - Inbound: TCP 80 from 0.0.0.0/0

nimbus-api-sg (EC2 API instances)
  - Inbound: TCP 8080 from nimbus-alb-sg
  - Inbound: TCP 22 from nimbus-bastion-sg
  - Outbound: TCP 5432 to nimbus-rds-sg
  - Outbound: TCP 6379 to nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Inbound: TCP 5432 from nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Inbound: TCP 6379 from nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Inbound: TCP 22 from <office VPN IP>
```

Internal ট্রাফিকের জন্য কোনো IP address নেই। শুধুমাত্র security group ID। একটি instance প্রতিস্থাপিত হলে, security group membership স্বয়ংক্রিয়ভাবে নতুন instance-এ transfer হয়।

"এবং আমরা যে microservice পরিকল্পনা করছি তার জন্য?" Rafael জিজ্ঞেস করল। "আমাদের শেষ পর্যন্ত এক ডজন service থাকবে। প্রতিটিকে কিছু অন্যের সাথে কথা বলতে হবে, কিন্তু সব অন্যের সাথে নয়।"

"প্রতিটি service তার নিজস্ব security group পায়," Priya বলল। "Service A-র security group প্রতিটি service-এর inbound নিয়মে reference করা হয় যেটিকে Service A call করার অনুমতি পেয়েছে। যে service-গুলির যোগাযোগ করা উচিত নয় তারা কেবল একে অপরের security group reference করে না।"

এটি হলো microservice-এর জন্য **hub-and-spoke security group pattern**। একটি shared database security group-এ পাঁচটি ভিন্ন service security group থেকে inbound নিয়ম আছে। একটি ষষ্ঠ service-এর database access দরকার হলে, আপনি database-এর inbound নিয়মে এর security group যোগ করেন। Access সরানো উচিত হলে, আপনি reference সরান। কোনো IP management নেই। Decommissioned server-এ নির্দেশকারী কোনো stale নিয়ম নেই।

"Security group হলো identity," Priya বলল। "IP address হলো scheduling-এর একটি দুর্ঘটনা।"

---

**Least-Privilege Firewall: শৃঙ্খলা**

"Outbound নিয়মের জন্য সঠিক posture কী তা নিয়ে আমরা ভেবেছি কি?" Priya post-incident review-এর সময় জিজ্ঞেস করল।

বেশিরভাগ দল EC2 security group outbound নিয়ম ডিফল্টে রাখে: সমস্ত outbound allow। এটি সুবিধাজনক — অ্যাপ্লিকেশন যেকোনো কিছু call করতে পারে — কিন্তু এটি least privilege নয়।

Priya-র নীতি: outbound নিয়ম inbound নিয়মের মতোই নির্দিষ্ট হওয়া উচিত।

Hardening-এর পরে Nimbus API security group outbound নিয়ম:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL to RDS)
TCP 6379 → nimbus-redis-sg     (Redis to ElastiCache)
TCP 443  → s3.amazonaws.com prefix list    (S3 gateway endpoint)
TCP 443  → secretsmanager endpoint         (Secrets Manager)
TCP 443  → logs endpoint                   (CloudWatch Logs)
```

কোনো "allow all outbound" নেই। প্রতিটি গন্তব্য নামকৃত।

"এটা অনেক maintenance," Leo বলল।

"এটা allow-all-এর চেয়ে বেশি maintenance," Priya স্বীকার করল। "এটা একটা data breach-এর চেয়ে কম cleanup। EC2 instance compromise করা attacker outbound নিয়ম খোলা থাকলে আরো ডেটা exfiltrate করতে পারত। তারা HTTPS-to-anywhere নিয়ম ব্যবহার করেছিল কারণ এটি সেখানে ছিল।"

"এবং নির্দিষ্ট outbound নিয়ম সহ, এমনকি একটি compromised instance শুধুমাত্র অনুমোদিত গন্তব্যে ডেটা পাঠাতে পারে।"

"ঠিক। Security group শুধু প্রথম defense line নয়, শেষ containment line হয়ে ওঠে।"

---

## শক্তি এবং সীমাবদ্ধতা

**Security Group**:

- Stateful (কোনো ephemeral port headache নেই)
- অন্য security group reference করতে পারে (IP-এর চেয়ে আরো নমনীয়)
- শুধুমাত্র allow নিয়ম — কোনো explicit deny নেই
- Resource স্তরে কাজ করে — granular
- নিয়ম তাৎক্ষণিকভাবে প্রযোজ্য — কোনো ordering নেই, কোনো priority নেই
- একটি resource-এ একাধিক security group attach করা যায় — সবগুলির নিয়ম মিলিত হয়

**NACL**:

- Stateless (ephemeral port সহ উভয় direction-এর জন্য explicit নিয়ম প্রয়োজন)
- Explicitly deny করতে পারে — known-bad IP block করার জন্য দরকারী
- Subnet স্তরে কাজ করে — broader stroke
- Numbered নিয়ম ক্রমানুসারে evaluate করা হয় — predictable কিন্তু careful management প্রয়োজন
- Subnet-এর যেকোনো resource-এ ট্রাফিক পৌঁছানোর আগে প্রযোজ্য — প্রথম defense line
- একটি সম্পূর্ণ subnet জুড়ে emergency IP blocking-এর জন্য কার্যকর

**প্রতিটি সরঞ্জাম কোথায় fit করে**:

ডিফল্টরূপে সবকিছুর জন্য security group ব্যবহার করুন। আপনার যখন explicit deny নিয়ম দরকার তখন NACL যোগ করুন — একটি IP range block করা, পৃথক resource configuration নির্বিশেষে subnet স্তরে একটি port block করা, বা একটি data subnet কখনো একটি নির্দিষ্ট source থেকে ট্রাফিক পেতে পারে না তা enforce করা। NACL security group-এর প্রতিস্থাপন নয়; সেগুলি এমন পরিস্থিতির জন্য একটি সম্পূরক যেখানে security group-এর allow-only design অপর্যাপ্ত।

## সারসংক্ষেপ

Romanian IP ঘটনা ইতিমধ্যে জায়গায় থাকা security control দ্বারা contained হয়েছিল — ভাগ্য দ্বারা নয়, design দ্বারা। Security group VPC-এর মধ্যে lateral movement প্রতিরোধ করেছিল। ঘটনার পরে, NACL subnet boundary-তে attacker-এর IP range explicitly block করার ক্ষমতা যোগ করেছিল। VPC flow log attack-কে দৃশ্যমান করেছিল। দুটি সরঞ্জাম, দুটি layer, দুটি ভিন্ন কাজ — কী ঘটেছিল তা প্রমাণ করতে logging সহ।

- **Security Group** হলো পৃথক resource-এর জন্য stateful ভার্চুয়াল firewall। শুধুমাত্র allow নিয়ম। সমস্ত নিয়ম একসাথে evaluate করা হয়।
- **NACL** হলো সম্পূর্ণ subnet-এর জন্য stateless firewall। Allow এবং deny নিয়ম। নিয়ম number ক্রমে evaluate হয় — প্রথম match জেতে।
- **Stateful** মানে response ট্রাফিক স্বয়ংক্রিয়ভাবে permitted। **Stateless** মানে আপনাকে উভয় direction-এ ট্রাফিক explicitly allow করতে হবে, ephemeral return port সহ।
- Security group হলো আপনার primary access control layer। NACL হলো subnet-স্তরের override — বিশেষ করে emergency blocking-এর জন্য।
- একটি NACL inbound ট্রাফিক allow করলে, TCP response pass হওয়ার জন্য আপনাকে outbound ephemeral port (1024-65535)-ও allow করতে হবে।
- Intra-VPC ট্রাফিকের জন্য IP address নয়, **ID দ্বারা security group reference করুন**। Auto Scaling instance প্রতিস্থাপন করে; security group membership স্বয়ংক্রিয়ভাবে transfer হয়।
- EC2 instance-এ **নির্দিষ্ট outbound নিয়ম** একটি compromised instance কী করতে পারে তা সীমিত করে — least-privilege firewall।
- Security group এবং NACL আসলে কী করছে তা দেখতে flow log ব্যবহার করুন। নিয়ম তত্ত্ব। Log প্রমাণ।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Secure Architectures (ডোমেন ১, টাস্ক ১.২)*

- **Stateful বনাম stateless**: এটি এই অধ্যায়ের সবচেয়ে tested concept। Security group = stateful = response স্বয়ংক্রিয়ভাবে allowed। NACL = stateless = response ট্রাফিক explicitly allow করতে হবে।
- **Security group নিয়ম**: কোনো explicit deny নেই। যখন একটি instance-এ একাধিক security group attached থাকে, সমস্ত নিয়মের union apply করে। সমস্ত matching নিয়ম একসাথে evaluate করা হয়।
- **NACL নিয়ম ক্রম**: নিয়ম সর্বনিম্ন number থেকে সর্বোচ্চে evaluate করা হয়। নিয়ম ১০০ ২০০-এর আগে। প্রথম match জেতে। নিচে `*` (asterisk) নিয়ম implicit deny। নিয়ম 90-এ একটি deny নিয়ম যোগ করা 100-এ যেকোনো allow নিয়মের আগে block করে।
- **Ephemeral port**: Classic NACL ভুল হলো port 1024-65535-এ outbound allow করতে ভুলে যাওয়া। আপনার NACL inbound HTTP (port 80) allow করলে কিন্তু outbound ephemeral port allow না করলে, ব্যবহারকারীরা request পাঠাতে পারে কিন্তু কখনো response পায় না। এটি সবচেয়ে সাধারণ NACL পরীক্ষার দৃশ্যকল্প।
- **Security group referencing**: আপনি অন্য একটি security group থেকে ট্রাফিক allow করতে পারেন (শুধু একটি IP নয়)। এটি intra-VPC ট্রাফিকের জন্য recommended pattern। পরীক্ষা প্রায়ই EC2 access সীমাবদ্ধ করার সঠিক উত্তর হিসেবে "ALB security group থেকে inbound allow করুন" ব্যবহার করে।
- **Default NACL বনাম custom NACL**: Default NACL সমস্ত ট্রাফিক allow করে। একটি custom NACL (আপনি যেটি তৈরি করেন) ডিফল্টরূপে সমস্ত ট্রাফিক deny করে। পরীক্ষার দৃশ্যকল্প: "একটি নতুন NACL তৈরি করা হয়েছে এবং এখন ট্রাফিক blocked" → missing allow নিয়ম check করুন।
- **Attacker-এর IP block করা**: Security group নির্দিষ্ট IP block করতে পারে না (শুধু allow)। NACL একটি নির্দিষ্ট IP বা CIDR explicitly deny করতে পারে। পরীক্ষার দৃশ্যকল্প: "subnet-এর যেকোনো resource-এ পৌঁছানো থেকে একটি নির্দিষ্ট IP block করুন" → NACL deny নিয়ম।
- **Connection failure debug করা**: ক্রম check করুন: source-এর security group (outbound) → destination-এর security group (inbound) → source subnet-এর NACL (outbound + ephemeral port) → destination subnet-এর NACL (inbound)। বেশিরভাগ পরীক্ষার connection failure একটি missing NACL outbound নিয়ম বা missing ephemeral port allowance দ্বারা ঘটে।
- **একাধিক subnet এবং NACL**: একটি NACL এর সাথে যুক্ত সমস্ত subnet-এ প্রযোজ্য। একটি subnet শুধুমাত্র একটি NACL-এর সাথে যুক্ত হতে পারে। পরীক্ষা জিজ্ঞেস করতে পারে একটি নির্দিষ্ট subnet-এর ট্রাফিক প্রভাবিত হলে কোন NACL আপডেট করতে হবে।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

একজন developer একটি security group-এ port 443-এ ট্রাফিক allow করা একটি inbound নিয়ম যোগ করে। সার্ভারের response allow করার জন্য তাকে কি একটি outbound নিয়মও যোগ করতে হবে? কেন বা কেন নয়?

পরিবর্তে যদি সে port 443-এ ট্রাফিক allow করা একটি NACL-এ একটি inbound নিয়ম যোগ করে, তাকে কি একটি outbound নিয়ম যোগ করতে হবে? কেন বা কেন নয়?

**ইঙ্গিত**: অধ্যায়ের উপমাগুলিতে ফিরে ভাবুন — প্রতিটি কি সেই security guard যে আপনাকে ঢুকতে দেওয়া মনে রাখে, নাকি সেই metal detector যার মধ্য দিয়ে আপনাকে বের হওয়ার পথে আবার যেতে হয়?

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি কোম্পানির একটি public subnet-এ EC2 instance-এ একটি ওয়েব অ্যাপ্লিকেশন চলছে। অ্যাপ্লিকেশন ইন্টারনেট থেকে HTTPS ট্রাফিক (port 443) গ্রহণ করে। ব্যবহারকারীরা জানাচ্ছে তারা অ্যাপ্লিকেশনের সাথে connect করতে পারছে কিন্তু response পাচ্ছে না — request hang করে এবং timeout হয়।

EC2 security group-এ 0.0.0.0/0 থেকে TCP 443 allow করা একটি inbound নিয়ম আছে। Subnet-এর NACL-এ 0.0.0.0/0 থেকে TCP 443 allow করা একটি inbound নিয়ম (নিয়ম ১০০) এবং 0.0.0.0/0-এ TCP 443 allow করা একটি outbound নিয়ম (নিয়ম ১০০) আছে।

সমস্যার সবচেয়ে সম্ভাবনাময় কারণ কী?

A) Security group TCP 443-এর জন্য একটি outbound নিয়ম missing  
B) EC2 instance-এর Elastic IP address নেই  
C) Security group ephemeral port-এর জন্য একটি inbound নিয়ম missing  
D) NACL ephemeral port (1024-65535) allow করা একটি outbound নিয়ম missing

**ইঙ্গিত ১**: Security group stateful — তারা স্বয়ংক্রিয়ভাবে response allow করে। NACL stateless — তারা করে না।

**ইঙ্গিত ২**: একটি browser port 443-এ একটি web server-এ connect করলে, সার্ভারের response port 443-এ নয়, একটি random ephemeral port (1024-65535)-এ ফিরে যায়।

**ইঙ্গিত ৩**: NACL-এ 443-এর জন্য একটি outbound নিয়ম আছে, কিন্তু response port 443-এ যায় না।

**উত্তর**: D

**ব্যাখ্যা**: NACL stateless। ব্যবহারকারীরা port 443-এ server-এ connect করলে, সার্ভারের TCP response একটি ephemeral port (1024-65535 থেকে randomly chosen)-এ ফিরে যায়। NACL outbound নিয়ম শুধুমাত্র port 443 allow করে, তাই response ডিফল্ট deny নিয়ম দ্বারা blocked। TCP 1024-65535 allow করা একটি outbound NACL নিয়ম যোগ করলে এটি ঠিক হবে।

**কেন A নয়?** Security group stateful — response ট্রাফিক outbound নিয়ম নির্বিশেষে স্বয়ংক্রিয়ভাবে permitted। কোনো outbound security group নিয়ম দরকার নেই।

**কেন B নয়?** Elastic IP instance-এর public IP আছে কিনা প্রভাবিত করে, established connection response পেতে পারে কিনা নয়।

**কেন C নয়?** Ephemeral port outbound response ট্রাফিকের জন্য, inbound নয়। ব্যবহারকারীদের কাছ থেকে inbound connection port 443-এ আসে, যা ইতিমধ্যে allowed।

*SAA-C03 ডোমেন: Design Secure Architectures — টাস্ক ১.২*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Romanian IP attack-এর পরে, Priya দুটি অতিরিক্ত control implement করতে চায়:

১. Public subnet-এ যেকোনো resource-এ পৌঁছানো থেকে সম্পূর্ণ 185.0.0.0/8 IP range block করুন
২. Database সহ private subnet কখনো ইন্টারনেটের সাথে যোগাযোগ করতে পারবে না নিশ্চিত করুন, এমনকি কেউ একটি security group misconfigure করলেও

আপনি প্রতিটি প্রয়োজনীয়তার জন্য কোন সরঞ্জাম ব্যবহার করবেন এবং কীভাবে configure করবেন? উভয়ের জন্য কি security group ব্যবহার করতে পারতেন? উভয়ের জন্য কি NACL ব্যবহার করতে পারতেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো কোন সরঞ্জাম কোন সমস্যার সাথে fit করে তা বোঝা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

ঘটনা contained ছিল। Compromised deploy key deactivate করা হয়েছিল। Romanian IP range NACL-এ blocked হয়েছিল। পুরানো script EC2 instance থেকে সরানো হয়েছিল।

Priya একটি incident report লিখল। সে দলের সাথে এটি share করল।

Report-এর শেষ লাইন: "Root cause: একটি decommissioned deployment pipeline থেকে একটি active credential কখনো rotate বা revoke করা হয়নি। সুপারিশ: automated credential rotation এবং সমস্ত IAM credential-এর নিয়মিত audit।"

Leo এটি তিনবার পড়ল।

"আমার সেই key rotate করা উচিত ছিল," সে বলল।

"হ্যাঁ," Priya বলল।

"আমরা এটা আবার না হওয়া কীভাবে নিশ্চিত করি?"

"Automation," সে বলল। "এবং এমন কিছু যা watchers-দের দেখে।"

পরবর্তী অধ্যায়ে: lockbox যেখানে Nimbus তার secret রাখে — এবং rotation যা চুরি হওয়া key অকেজো করে।
