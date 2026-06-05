# অধ্যায় ১৫: ফটকের পাহারাদার

Nimbus-এর প্রথম সংস্করণের পুরানো deploy key এখনো active ছিল। এটি গত সপ্তাহে তিনটি API call করেছিল। Leo জানত না কী করেছে।

Priya VPC flow log তুলল — নেটওয়ার্ক ট্রাফিক রেকর্ড যা VPC-এ এবং থেকে প্রতিটি connection দেখায়।

"মঙ্গলবার রাত ২:১৭-এ," সে বলল, "পুরানো API চালানো EC2 instance থেকে Romania-র একটি IP address-এ একটি outbound connection ছিল।"

"এটা আমাদের অবকাঠামো নয়," Leo বলল।

"না।"

"তাহলে কেউ আমাদের EC2 instance-এ ছিল।"

"অথবা কিছু।"

তারা trace করল: পুরানো deploy key একটি ছোট script EC2 instance-এ upload করতে ব্যবহার করা হয়েছিল। Script সন্নিহিত server-এ port scan করার চেষ্টা করেছিল। বেশিরভাগ scan ব্যর্থ হয়েছিল।

"Security group block করেছে," Priya বলল। "Attacker একটি EC2 instance-এ পৌঁছেছিল। তারা অন্যগুলিতে পৌঁছাতে পারেনি কারণ security group শুধুমাত্র load balancer থেকে ট্রাফিক allow করে।"

"তাহলে ক্ষতি contained ছিল।"

"কারণ আমাদের correctly configure করা security group ছিল। যদি আমরা account-এর যেকোনো EC2 instance-এ port 5432 খোলা রাখতাম তাহলে কল্পনা করুন।"

Leo সেটা কল্পনা করার দরকার ছিল না। মূল setup-এ সে সেই configuration দেখেছিল।

**Network Security-এর দুটি Layer**

VPC-তে, network ট্রাফিক নিয়ন্ত্রণের জন্য আপনার দুটি আলাদা সরঞ্জাম আছে:

**Security Group**: পৃথক resource-এ attached ভার্চুয়াল firewall (EC2 instance, RDS database, load balancer, VPC-এ Lambda function)। তারা resource level-এ কাজ করে।

**Network ACL (NACL)**: Subnet-এ attached Firewall নিয়ম। তারা subnet boundary-তে কাজ করে — যেকোনো resource-এ ট্রাফিক পৌঁছানোর আগে।

উভয় বোঝার জন্য একটি critical পার্থক্য বোঝা দরকার: **stateful বনাম stateless**।

**Stateful: Security Group**

একটি security group **stateful**।

যখন আপনি একটি নির্দিষ্ট port-এ inbound ট্রাফিক allow করেন, response ট্রাফিক স্বয়ংক্রিয়ভাবে বাইরে allow হয়, এমনকি এর জন্য কোনো explicit outbound নিয়ম না থাকলেও।

যখন আপনি একটি গন্তব্যে outbound ট্রাফিক allow করেন, ফিরে আসা response স্বয়ংক্রিয়ভাবে allow হয়।

একটি office building-এ stateful security guard-এর মতো মনে করুন। আপনি প্রবেশ করতে আপনার badge দেখান। আপনি পরে বাইরে হাঁটেন। Guard-কে আবার check করার দরকার নেই — সিস্টেম জানে আপনাকে ঢুকতে দেওয়া হয়েছিল, এবং আপনাকে যাওয়ার অনুমতি আছে।

**Nimbus API EC2 instance-এর জন্য Security Group নিয়ম:**

- **Inbound — TCP 8080 — Load Balancer SG থেকে** → ALB থেকে API ট্রাফিক গ্রহণ করুন
- **Inbound — TCP 22 — Bastion Host SG থেকে** → Bastion থেকে SSH
- **Outbound — TCP 5432 — RDS SG-তে** → PostgreSQL-এ connect করুন
- **Outbound — TCP 6379 — ElastiCache SG-তে** → Redis-এ connect করুন
- **Outbound — TCP 443 — 0.0.0.0/0-তে** → External API-তে HTTPS

লক্ষ্য করুন: port 8080-এর জন্য কোনো explicit outbound নিয়ম নেই। Inbound নিয়ম stateful — response ট্রাফিক (API-র load balancer-এ reply) স্বয়ংক্রিয়ভাবে allow।

এছাড়াও লক্ষ্য করুন: security group নিয়ম *অন্য security group* reference করে, IP address নয়। "Load balancer security group থেকে inbound allow করুন" মানে "এই security group attached যেকোনো resource থেকে ট্রাফিক allow করুন।" এটি IP address tracking-এর চেয়ে আরো নমনীয় এবং maintainable।

**Default behavior:**

- ডিফল্টরূপে, সমস্ত inbound ট্রাফিক denied
- ডিফল্টরূপে, সমস্ত outbound ট্রাফিক allowed
- সমস্ত নিয়ম evaluate করা হয় (security group-এর ordered নিয়ম নেই — সমস্ত matching নিয়ম apply)
- Security group শুধুমাত্র ট্রাফিক **allow** করতে পারে — আপনি explicit deny নিয়ম তৈরি করতে পারেন না

**Stateless: Network ACL**

একটি NACL **stateless**।

আপনি port 8080-এ inbound ট্রাফিক allow করলে, এটি শুধুমাত্র inbound cover করে। Response (ephemeral port-এ outbound ট্রাফিক) একটি explicit outbound নিয়ম দিয়ে স্পষ্টভাবে allow করতে হবে।

একটি metal detector-এর মতো মনে করুন। আপনি ভেতরে যাওয়ার সময় এটির মধ্য দিয়ে যান। Metal detector জানে না আপনি ইতিমধ্যে এর মধ্য দিয়ে গেছেন — আপনাকে বের হওয়ার সময় আবার যেতে হবে।

**NACL নিয়ম numbered এবং ক্রমানুসারে evaluate করা হয়।** প্রথম matching নিয়ম জেতে। নিয়ম ১০০ নিয়ম ২০০-এর আগে evaluate হয়। নিয়ম ১০০ ট্রাফিক deny করলে এবং নিয়ম ২০০ allow করলে, ট্রাফিক denied।

NACL স্পষ্টভাবে ট্রাফিক **deny** করতে পারে — security group-এর বিপরীতে যা শুধুমাত্র allow করতে পারে। এটি নির্দিষ্ট IP range block করার জন্য দরকারী।

**Default NACL behavior:**

- আপনার VPC-এর সাথে তৈরি default NACL সমস্ত inbound এবং outbound ট্রাফিক allow করে
- একটি custom NACL (আপনি যেটি তৈরি করেন) ডিফল্টরূপে সমস্ত ট্রাফিক deny করে (আপনি যা চান তা explicitly allow করতে হবে)

**Public subnet-এর NACL (সরলীকৃত):**

*Inbound নিয়ম (ক্রমানুসারে evaluate — প্রথম match জেতে):*

- নিয়ম ১০০: TCP 443, 0.0.0.0/0 থেকে → **Allow** (HTTPS)
- নিয়ম ১১০: TCP 80, 0.0.0.0/0 থেকে → **Allow** (HTTP)
- নিয়ম ১২০: TCP 1024–65535, 0.0.0.0/0 থেকে → **Allow** (ephemeral return port)
- নিয়ম \*: সমস্ত ট্রাফিক → **Deny**

*Outbound নিয়ম:*

- নিয়ম ১০০: TCP 443, 0.0.0.0/0-এ → **Allow** (HTTPS)
- নিয়ম ১১০: TCP 80, 0.0.0.0/0-এ → **Allow** (HTTP)
- নিয়ম ১২০: TCP 1024–65535, 0.0.0.0/0-এ → **Allow** (ephemeral return port)
- নিয়ম \*: সমস্ত ট্রাফিক → **Deny**

নিয়ম ১২০ (port 1024-65535) ephemeral port allow করে — TCP response ট্রাফিকের জন্য ব্যবহৃত অস্থায়ী high-numbered port। NACL stateless হওয়ায়, আপনাকে এটি explicitly outbound allow করতে হবে, নয়তো আপনার সার্ভারের response pass হবে না।

**কোনটি কখন ব্যবহার করবেন**

Primary access control layer-এর জন্য **Security group** ব্যবহার করুন। সেগুলি manage করা সহজ, stateful (ephemeral port headache নেই), এবং অন্য security group reference সমর্থন করে।

Subnet-level control-এর জন্য **NACL** ব্যবহার করুন, বিশেষ করে:

- **Explicit deny নিয়ম**: একটি নির্দিষ্ট IP address বা range-কে পুরো subnet-এ পৌঁছানো থেকে block করুন
- **Emergency blocking**: একটি IP সক্রিয়ভাবে attack করছে — যেকোনো resource-এ পৌঁছানোর আগে পুরো subnet block করতে একটি NACL deny নিয়ম যোগ করুন

"তাহলে security group হলো fine-grained control," Maya বলল, "এবং NACL হলো broad stroke?"

"Security group পৃথক resource রক্ষা করে," Priya নিশ্চিত করল। "NACL পুরো subnet রক্ষা করে। আপনি যখন কিছুকে আপনার network-এ কিছুতে পৌঁছানো থেকে block করতে চান, NACL। আপনি যখন শুধুমাত্র load balancer-কে API server-এ পৌঁছানোর অনুমতি দিতে চান, security group।"

**ঘটনা: Layer গুলি কী Caught করেছিল**

Romanian IP attack-এ ফিরে:

**কী হয়েছিল**: Attacker compromised deploy key ব্যবহার করে একটি EC2 instance-এ একটি scanning script upload করেছিল। Script অন্য service-এ connect করার চেষ্টা করেছিল।

**কী থামিয়েছিল**:

- RDS security group শুধুমাত্র API EC2 security group থেকে port 5432-এ inbound allow করে। Script ডেটাবেসে পৌঁছাতে পারেনি কারণ এটি সঠিক security group attach করছিল না।
- ElastiCache security group শুধুমাত্র API EC2 security group থেকে port 6379-এ inbound allow করে।
- অন্যান্য EC2 instance শুধুমাত্র bastion host security group থেকে SSH allow করে।

**কী থামায়নি**: 

- EC2 instance-এর outbound নিয়ম 0.0.0.0/0-এ HTTPS allow করে (package download-এর জন্য দরকার)। Script এটি attacker-এর server-এ outbound connection করতে ব্যবহার করেছিল।

ঘটনার পরে, Priya যোগ করল:

- Romanian IP range block করা একটি NACL নিয়ম
- EC2 instance-এ আরো restrictive outbound নিয়ম (শুধুমাত্র specific known-good destination allow)

## শক্তি এবং সীমাবদ্ধতা

**Security Group**:

- Stateful (ephemeral port headache নেই)
- অন্য security group reference করতে পারে (IP-এর চেয়ে আরো নমনীয়)
- শুধুমাত্র allow নিয়ম — কোনো explicit deny নেই
- Resource level-এ কাজ করে — granular

**NACL**:

- Stateless (উভয় direction-এ ephemeral port সহ explicit নিয়ম প্রয়োজন)
- Explicitly deny করতে পারে — known-bad IP block করার জন্য দরকারী
- Subnet level-এ কাজ করে — broader stroke
- Numbered নিয়ম ক্রমানুসারে evaluate করা হয় — predictable কিন্তু careful management প্রয়োজন

## সারসংক্ষেপ

- **Security Group** পৃথক resource-এর জন্য stateful ভার্চুয়াল firewall। শুধুমাত্র allow নিয়ম। সমস্ত নিয়ম evaluate করা হয়।
- **NACL** পুরো subnet-এর জন্য stateless firewall। Allow এবং deny নিয়ম। নিয়ম number ক্রমে evaluate হয়।
- **Stateful** মানে response ট্রাফিক স্বয়ংক্রিয়ভাবে permitted। **Stateless** মানে আপনাকে উভয় direction-এ ট্রাফিক explicitly allow করতে হবে।
- Security group হলো আপনার primary access control layer। NACL হলো subnet-level control এবং explicit blocking-এর জন্য একটি অতিরিক্ত layer।
- NACL inbound ট্রাফিক allow করলে, TCP response pass হওয়ার জন্য আপনাকে outbound ephemeral port (1024-65535) allow করতে হবে।
- Security group একে অপর reference করতে পারে — IP address tracking-এর চেয়ে intra-VPC ট্রাফিকের জন্য load balancer security group থেকে ট্রাফিক allow করা আরো maintainable।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Secure Architectures (ডোমেন ১, টাস্ক ১.২)*

- **Stateful বনাম stateless**: এই অধ্যায়ে সবচেয়ে tested concept। Security group = stateful = response automatically allowed। NACL = stateless = response ট্রাফিক explicitly allow করতে হবে।
- **Security group নিয়ম**: কোনো explicit deny নেই। যখন একটি instance-এ একাধিক security group attached থাকে, সমস্ত নিয়মের union apply করে। সমস্ত matching নিয়ম evaluate করা হয়।
- **NACL নিয়ম ক্রম**: নিয়ম সর্বনিম্ন number থেকে সর্বোচ্চে evaluate করা হয়। নিয়ম ১০০ নিয়ম ২০০-এর আগে। প্রথম match জেতে। নিচে `*` (asterisk) নিয়ম implicit deny।
- **Ephemeral port**: Classic NACL ভুল হলো outbound port 1024-65535 allow করতে ভুলে যাওয়া। আপনার NACL HTTP (port 80) inbound allow করলে কিন্তু outbound ephemeral port allow না করলে, ব্যবহারকারীরা request পাঠাতে পারে কিন্তু কখনো response পায় না।
- **Security group referencing**: আপনি অন্য security group থেকে ট্রাফিক allow করতে পারেন (শুধু IP নয়)। এটি intra-VPC ট্রাফিকের জন্য recommended pattern।
- **Default NACL বনাম custom NACL**: Default NACL সমস্ত ট্রাফিক allow করে। আপনি যেটি তৈরি করেন সেটি ডিফল্টরূপে সমস্ত ট্রাফিক deny করে। পরীক্ষার দৃশ্যকল্প: "নতুন NACL তৈরি করা হয়েছে এবং এখন ট্রাফিক blocked" → missing allow নিয়ম check করুন।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

একজন developer একটি security group-এ port 443-এ ট্রাফিক allow করা একটি inbound নিয়ম যোগ করে। সার্ভারের response allow করার জন্য তাকে কি একটি outbound নিয়মও যোগ করতে হবে? কেন বা কেন নয়?

পরিবর্তে যদি সে port 443-এ ট্রাফিক allow করা একটি NACL-এ একটি inbound নিয়ম যোগ করে, তাকে কি একটি outbound নিয়ম যোগ করতে হবে? কেন বা কেন নয়?

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি কোম্পানির public subnet-এ EC2 instance-এ একটি ওয়েব অ্যাপ্লিকেশন চলছে। অ্যাপ্লিকেশন ইন্টারনেট থেকে HTTPS ট্রাফিক (port 443) গ্রহণ করে। ব্যবহারকারীরা জানাচ্ছে তারা অ্যাপ্লিকেশনের সাথে connect করতে পারছে কিন্তু response পাচ্ছে না — request hang করে এবং timeout হয়।

EC2 security group-এ `0.0.0.0/0` থেকে TCP 443 allow করা একটি inbound নিয়ম আছে। Subnet-এর NACL-এ `0.0.0.0/0` থেকে TCP 443 allow করা একটি inbound নিয়ম (নিয়ম ১০০) এবং `0.0.0.0/0`-এ TCP 443 allow করা একটি outbound নিয়ম (নিয়ম ১০০) আছে।

সমস্যার সবচেয়ে সম্ভাবনাময় কারণ কী?

A) Security group TCP 443-এর জন্য একটি outbound নিয়ম missing
B) NACL ephemeral port (1024-65535) allow করা একটি outbound নিয়ম missing
C) Security group ephemeral port-এর জন্য একটি inbound নিয়ম missing
D) EC2 instance-এর Elastic IP address নেই

**ইঙ্গিত ১**: Security group stateful — তারা স্বয়ংক্রিয়ভাবে response allow করে। NACL stateless — তারা করে না।

**ইঙ্গিত ২**: ব্রাউজার port 443-এ web server-এ connect করলে, সার্ভারের TCP response port 443-এ নয়, একটি random ephemeral port (1024-65535)-এ ফিরে যায়।

**ইঙ্গিত ৩**: NACL-এ শুধুমাত্র port 443-এর জন্য outbound নিয়ম আছে, কিন্তু response port 443-এ যায় না।

**উত্তর**: B

**ব্যাখ্যা**: NACL stateless। ব্যবহারকারীরা port 443-এ server-এ connect করলে, সার্ভারের TCP response একটি ephemeral port (1024-65535 থেকে randomly chosen)-এ ফিরে যায়। NACL outbound নিয়ম শুধুমাত্র port 443 allow করে, তাই response ডিফল্ট deny নিয়ম দ্বারা blocked। TCP 1024-65535 outbound allow করা একটি NACL outbound নিয়ম যোগ করলে এটি ঠিক হবে।

**কেন A নয়?** Security group stateful — response ট্রাফিক inbound নিয়ম নির্বিশেষে স্বয়ংক্রিয়ভাবে permitted। Security group outbound নিয়ম দরকার নেই।

**কেন C নয়?** Ephemeral port outbound response ট্রাফিকের জন্য, inbound নয়। ব্যবহারকারীদের কাছ থেকে inbound connection port 443-এ আসে, যা ইতিমধ্যে allowed।

**কেন D নয়?** Elastic IP instance-এর public IP আছে কিনা affect করে, established connection response পায় কিনা নয়।

*SAA-C03 ডোমেন: Design Secure Architectures — টাস্ক ১.২*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Romanian IP attack-এর পরে, Priya দুটি অতিরিক্ত control implement করতে চায়:

১. Public subnet-এ যেকোনো resource-এ পৌঁছানো থেকে পুরো 185.0.0.0/8 IP range block করুন
২. Database সহ private subnet কখনো ইন্টারনেটের সাথে যোগাযোগ করতে পারবে না নিশ্চিত করুন, এমনকি কেউ security group misconfigure করলেও

আপনি প্রতিটি প্রয়োজনীয়তার জন্য কোন সরঞ্জাম ব্যবহার করবেন এবং কীভাবে configure করবেন? উভয়ের জন্য কি security group ব্যবহার করতে পারতেন? উভয়ের জন্য কি NACL ব্যবহার করতে পারতেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো কোন সরঞ্জাম কোন সমস্যার সাথে fit করে তা বোঝা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

ঘটনা contained ছিল। Compromised deploy key deactivate করা হয়েছিল। Romanian IP range NACL-এ blocked হয়েছিল। পুরানো script EC2 instance থেকে সরানো হয়েছিল।

Priya একটি incident report লিখল। সে দলের সাথে share করল।

Report-এর শেষ লাইন: "Root cause: একটি decommissioned deployment pipeline থেকে একটি active credential কখনো rotate বা revoke করা হয়নি। সুপারিশ: automated credential rotation এবং সমস্ত IAM credential-এর নিয়মিত audit।"

Leo এটি তিনবার পড়ল।

"আমার সেই key rotate করা উচিত ছিল," সে বলল।

"হ্যাঁ," Priya বলল।

"আমরা এটা আবার না হওয়া নিশ্চিত কীভাবে করি?"

"Automation," সে বলল। "এবং এমন কিছু যা watchers-দের দেখে।"

পরবর্তী অধ্যায়ে: lockbox যেখানে Nimbus তার secret রাখে — এবং rotation যা চুরি হওয়া key অকেজো করে।
