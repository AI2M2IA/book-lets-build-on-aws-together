# অধ্যায় ১৭: পাহারাদাররা

Romanian IP-র সাথে ঘটনা contained হয়েছিল। Secret Secrets Manager-এ ছিল। Credential rotate হয়েছিল। Network control কঠোর হয়েছিল।

কিন্তু Priya অধ্যায় ১৬ শেষ করা প্রশ্নটি করেছিল: "CloudTrail-এ কিছু unusual দেখা দিলে, আমরা কীভাবে জানতাম?"

সৎ উত্তর ছিল: তারা সম্ভবত জানত না।

---

*যা lock করা যেত তা lock করা হয়েছিল। Secret Secrets Manager-এ ছিল। Encryption key KMS-এ ছিল। Network ট্রাফিক security group এবং NACL দ্বারা নিয়ন্ত্রিত ছিল। Perimeter defense শক্ত ছিল। কিন্তু perimeter defense ধরে নেয় একটি attack আসার আগে আপনি জানেন এটি কেমন দেখায়। Priya যে প্রশ্ন করছিল তা ভিন্ন ছিল: যে attack-গুলি আপনি আসতে দেখেন না সেগুলি সম্পর্কে কী?*

---

CloudTrail প্রতিদিন হাজার হাজার event log করে। কোনো মানুষ সেগুলির সব পড়ে না। Priya প্রতি সপ্তাহে manually check করত, কিন্তু এর মানে কিছু মঙ্গলবার ঘটতে পারত এবং পরের সোমবার পর্যন্ত notice না হওয়া।

"আমাদের এমন কিছু দরকার যা আমাদের জন্য log দেখে," সে বলল।

Maya মাথা তুলল। "স্বয়ংক্রিয়ভাবে?"

"স্বয়ংক্রিয়ভাবে।"

"আর কেউ যদি ভাঙার চেষ্টা করে?" Priya চালিয়ে গেল। "শুধু একটি compromised credential নয় — কেউ যদি একটি DDoS launch করে? তারা যদি injection vulnerability-র জন্য আমাদের API endpoint probe শুরু করে? তারা যদি ইতিমধ্যে ভেতরে থাকে এবং আমরা না জানি?"

"সেগুলি তিনটি ভিন্ন সমস্যা," Leo বলল।

"হ্যাঁ," Priya বলল। "এবং AWS-এর সেগুলি address করতে তিনটি ভিন্ন service আছে।"

**তিনটি Threat Category**

একটি ক্লাউড অ্যাপ্লিকেশনের বিরুদ্ধে নিরাপত্তা হুমকি সাধারণত তিনটি category-তে পড়ে:

**Volume attack (DDoS)**: একজন attacker এত বেশি ট্রাফিক পাঠায় যে আপনার অ্যাপ্লিকেশন legitimate user-দের সাড়া দিতে পারে না। Attack লক্ষ লক্ষ HTTP request হতে পারে, বা আপনার সার্ভারের connection table নিঃশেষ করার জন্য ডিজাইন করা TCP SYN packet-এর একটি flood হতে পারে।

**Application attack (Exploit)**: একজন attacker আপনার অ্যাপ্লিকেশনের দুর্বলতা exploit করার জন্য বিশেষভাবে crafted request পাঠায় — SQL injection, cross-site scripting, একটি parser crash করা malformed input।

**Behavioral anomaly (Reconnaissance এবং compromise)**: API call যা হওয়া উচিত নয় (রাত ৩টায় কেউ আপনার পুরো user database query করছে), unusual IAM activity (একটি নতুন দেশ থেকে ব্যবহার করা credential), বা অপ্রত্যাশিত গন্তব্যে network ট্রাফিক।

AWS-এর প্রতিটির জন্য একটি dedicated service আছে:

- **AWS Shield**: DDoS protection
- **AWS WAF**: Application-layer protection
- **Amazon GuardDuty**: Behavioral threat detection

**AWS Shield: DDoS Absorber**

**AWS Shield Standard** কোনো অতিরিক্ত charge ছাড়াই সমস্ত AWS customer-এর জন্য স্বয়ংক্রিয়ভাবে সক্ষম। এটি সবচেয়ে সাধারণ layer 3 (network) এবং layer 4 (transport) DDoS attack-এর বিরুদ্ধে সুরক্ষা করে — SYN flood, UDP flood, DNS amplification attack।

CloudFront, Route 53 এবং Elastic Load Balancing AWS-এর network-এর edge-এ বসে। যখন একটি DDoS attack আপনার অ্যাপ্লিকেশন target করে, এটি প্রথমে এই managed service hit করে। AWS-এর নেটওয়ার্ক অবকাঠামো আপনার EC2 instance-এ পৌঁছানোর আগে attack absorb করে।

**AWS Shield Advanced** হলো premium tier (প্রতি organization-এ মাসে $3,000, এক-বছরের প্রতিশ্রুতি সহ)। এটি একটি আলাদা subscription — এটি কোনো AWS Support plan-এ অন্তর্ভুক্ত *নয়*। এটি যোগ করে:

- EC2, ELB, CloudFront, Global Accelerator এবং Route 53-এর জন্য Protection
- Near-real-time attack notification
- AWS Shield Response Team (SRT)-এ অ্যাক্সেস — security engineer যারা attack respond করতে আপনাকে সাহায্য করতে পারে (SRT engage করতে অতিরিক্তভাবে একটি Business বা Enterprise Support plan প্রয়োজন)
- Cost protection: একটি attack আপনার bill spike করলে, AWS surge cost credit করে
- Layer 7 (application layer)-এ enhanced DDoS detection এবং mitigation

"মাসে এর খরচ কত?" Tom জিজ্ঞেস করল।

"তিন হাজার ডলার," Priya বলল। "প্রতি organization।"

Tom এক মুহূর্ত চুপ ছিল।

"লক্ষ লক্ষ revenue handle করা enterprise-এর জন্য, দুই ঘণ্টা তাদের ডাউন নেওয়া একটি DDoS তিন হাজার ডলারের বেশি খরচ করে," Priya বলল।

Tom চুপচাপ হিসাব করল।

"আমরা Standard দিয়ে শুরু করব," সে অবশেষে বলল।

---

**DDoS ঘটনা: Shield কার্যকরভাবে কেমন দেখায়**

Launch-এর আট মাস পরে, Nimbus তার প্রথম প্রকৃত DDoS attack পেল।

এটি একটি মঙ্গলবার সকাল 11:43-এ শুরু হলো। Load balancer-এর CloudWatch dashboard নব্বই সেকেন্ডের কম সময়ে আসা connection request স্বাভাবিক প্রতি মিনিটে 3,000 থেকে প্রতি মিনিটে 180,000-এ spike হতে দেখাল। Source IP চল্লিশটি দেশ জুড়ে distributed ছিল, এবং inbound volume প্রায় পঞ্চাশ গিগাবিট প্রতি সেকেন্ডে peak করল। Pattern স্পষ্ট ছিল: একটি botnet একটি SYN flood launch করছে।

Leo প্রথমে CloudFront metrics দেখল। "Request rate ষাট গুণ বেড়েছে। Response time spike করছে।"

Priya CloudWatch metrics পাশাপাশি তুলল: edge-এ connection প্রচেষ্টা উল্লম্বভাবে আরোহণ করছে, request আসলে origin-এ পৌঁছাচ্ছে — সমতল। "Shield Standard এটা খাচ্ছে," সে বলল। কোনো alert নেই, কোনো dashboard event নেই, কোনো notification নেই। Shield Standard নীরবে কাজ করে: এটি সর্বদা চালু, এটি বিনামূল্যে, এবং এটি আপনাকে **কোনো attack visibility দেয় না** — কোনো event console নেই, কোনো notification নেই, কোনো DDoS response team নেই। (সেই visibility — near-real-time attack dashboard এবং alert — ঠিক যা Shield *Advanced* বিক্রি করে।) Priya attack-টি আদৌ দেখতে পারার একমাত্র উপায় ছিল তার নিজের CloudWatch metrics-এর মাধ্যমে।

Shield Standard স্বয়ংক্রিয়ভাবে SYN flood detect করেছিল এবং প্রথম দুই মিনিটের মধ্যে mitigation engage করেছিল। Attack ট্রাফিক বৈশ্বিকভাবে CloudFront-এর edge node-এ absorbed হচ্ছিল — একই 750+ point of presence যা legitimate content পরিবেশন করত তাও attack volume absorb করল।

সকাল 11:52-এর মধ্যে — attack শুরুর নয় মিনিট পরে — Shield-এর mitigation origin-এ request rate স্বাভাবিকে ফিরিয়ে এনেছিল। Attack এখনো network স্তরে চলছিল, কিন্তু mitigation এটি handle করছিল। Nimbus অ্যাপ্লিকেশন পুরোটা জুড়ে user-দের পরিবেশন চালিয়ে গেল।

"User-রা notice করেনি?" Leo জিজ্ঞেস করল, error rate metric দেখে।

"Error rate প্রায় চার মিনিটের জন্য প্রায় দুই শতাংশ বেড়েছিল," Priya বলল। "কিছু user সামান্য ধীর response পেয়েছিল। কোনো outage নেই। অ্যাপ্লিকেশন up থেকেছিল।"

"কারণ Shield edge-এ flood absorb করেছিল।"

"আমাদের load balancer-এ পৌঁছানোর আগে। পঞ্চাশ গিগাবিট SYN flood CloudFront hit করেছিল। ট্রাফিক pattern চিনে mitigate হওয়ার সময়, আমাদের origin শুধুমাত্র স্বাভাবিক request volume দেখেছিল।"

Attack সাতচল্লিশ মিনিট স্থায়ী হলো। দুপুর 12:30-এর মধ্যে edge metrics baseline-এ ফিরেছিল — Shield Standard আপনাকে দেওয়া একমাত্র "resolved" সংকেত।

"এবং এটা Shield Standard," Tom বলল। "বিনামূল্যে সংস্করণ।"

"Layer 3 এবং 4 attack। Standard স্বয়ংক্রিয়ভাবে সেগুলির বিরুদ্ধে সুরক্ষা করে। Attack যদি আরো sophisticated হত — একটি layer 7 HTTP flood, উদাহরণস্বরূপ, যেখানে প্রতিটি request legitimate দেখাত — Standard যথেষ্ট হত না। সেটির জন্য Shield Advanced plus WAF প্রয়োজন।"

Tom তার security roadmap-এ "Layer 7 DDoS pattern-এর জন্য monitor করুন" লিখল।

---

**AWS WAF: Application Filter**

**AWS WAF (Web Application Firewall)** HTTP স্তরে কাজ করে — এটি আপনার অ্যাপ্লিকেশনে পৌঁছানোর আগে web request-এর বিষয়বস্তু inspect করে।

WAF **Web ACL (Access Control List)** দিয়ে configure করা হয় — rule set যা define করে কী allow, block বা count করতে হবে।

WAF attach করা যায়:

- CloudFront distribution (edge-এ request inspect করুন, বৈশ্বিকভাবে)
- Application Load Balancer (regional স্তরে request inspect করুন)
- API Gateway
- AWS AppSync

**WAF Managed Rule**: AWS এবং third-party vendor pre-built rule set প্রকাশ করে:

- **AWS Managed Rules - Core Rule Set**: companion rule group (SQL database, Known Bad Inputs)-এর সাথে একসাথে, OWASP Top 10 vulnerability cover করে (SQL injection, XSS, command injection, path traversal, ইত্যাদি)
- **AWS Managed Rules - Known Bad Inputs**: known attack pattern match করা request block করে
- **AWS Managed Rules - Amazon IP Reputation List**: botnet এবং scanner-এর সাথে যুক্ত বলে জানা IP block করে
- **AWS Managed Rules - Bot Control**: bot ট্রাফিক identify এবং manage করে

আপনি custom rule-ও তৈরি করতে পারেন:

- "'sqlmap' ধারণকারী একটি User-Agent header সহ যেকোনো request block করুন" (একটি সাধারণ SQL injection scanner)
- "Rate limit: প্রতি 5 মিনিটে প্রতি IP 1000-এর বেশি request allow করবেন না"
- "যেকোনো parameter value-এ `<script>` ধারণকারী request block করুন"

Nimbus-এর জন্য, practical setup: Core Rule Set সক্ষম করে CloudFront distribution-এ WAF। এটি request কখনো EC2 instance-এ পৌঁছানোর আগে সবচেয়ে সাধারণ attack pattern block করে।

আপনি হয়তো ভাবছেন: WAF যদি known attack pattern block করে, WAF জানে না এমন একটি নতুন attack pattern দেখা দিলে কী হয়? WAF managed rule set নতুন threat দেখা দিলে AWS এবং third-party vendor দ্বারা আপডেট করা হয় — আপনাকে ম্যানুয়ালি rule আপডেট করতে হয় না। কিন্তু আপনি ঠিক যে WAF মূলত known pattern-এর প্রতি reactive। নতুন, novel attack technique এমন একটি rule দ্বারা block হবে না যা এখনো বিদ্যমান নেই। এজন্যই GuardDuty WAF-এর পাশাপাশি বিদ্যমান: WAF সদর দরজা filter করে, GuardDuty বাড়ির ভেতরে unusual behavior-এর জন্য দেখে। একটি নতুন attack type WAF পেরিয়ে যেতে পারে, কিন্তু GuardDuty এখনো এর ঘটানো anomalous activity flag করতে পারে — unusual API call, অপ্রত্যাশিত network গন্তব্য, baseline-এর সাথে না মেলা access pattern।

**WAF false positive ঘটালে কী হয় তা নিয়ে আমরা ভেবেছি কি?** Priya জিজ্ঞেস করল। "একটি legitimate user-এর request যা Core Rule Set দ্বারা block হয়?"

"WAF-এর একটি 'Count' mode আছে," Leo বলল। "Block করার পরিবর্তে, এটি শুধু matching request count করে। আপনি প্রথমে Count mode-এ চালান, এটি কী block করত তা review করেন, কোনো false positive নেই যাচাই করেন, তারপর Block-এ switch করেন।"

"ভালো," Priya বলল। "আমরা Count mode-এ শুরু করি।"

---

**একটি WAF Rule তৈরি করা: Rate Limit গল্প**

Count mode-এ WAF সক্ষম করার দুই সপ্তাহ পরে, Priya log review করল। Core Rule Set finding পরিষ্কার ছিল — legitimate ট্রাফিকে কোনো false positive নেই, automated scanner থেকে কয়েকটি blocked SQL injection প্রচেষ্টা।

কিন্তু সে একটি pattern লক্ষ্য করল যা Core Rule Set flag করছিল না: একটি IP address পাঁচ মিনিটে `/api/search`-এ 847টি request করেছিল। প্রতিটি request structurally valid ছিল। কিন্তু পাঁচ মিনিটে 847টি search একজন মানুষ নয়।

"Price scraper," সে বলল। "কেউ একটি competitive price database তৈরি করতে স্বয়ংক্রিয়ভাবে আমাদের restaurant search query করছে।"

"আমরা কি পরোয়া করি?" Leo জিজ্ঞেস করল।

"এটা আমাদের compute resource ব্যবহার করে এবং এটা আমাদের terms of service-এর বিরুদ্ধে," Tom বলল।

"আমরা পরোয়া করি," Priya নিশ্চিত করল।

সে একটি custom WAF rate-based rule তৈরি করল:

```
Rule name: RateLimitSearchAPI
Rule type: Rate-based rule
Rate limit: 100 requests per IP address
Evaluation window: 5 minutes (configurable: 1, 2, 5, or 10 minutes)
Scope-down statement: URI path starts with /api/search
Action: Block
```

Scope-down statement গুরুত্বপূর্ণ — rate limit শুধুমাত্র `/api/search`-এ প্রযোজ্য। অন্য endpoint-এ legitimate API ট্রাফিক অপ্রভাবিত। এবং লক্ষ্য করুন blocking কীভাবে কাজ করে: কোনো fixed "শাস্তি" period নেই — WAF ক্রমাগত প্রতিটি IP-র request rate পুনঃমূল্যায়ন করে, rate limit-এর উপরে থাকার সময় এটি block করে, এবং rate আবার সীমার নিচে নামলে এটি unblock করে (সাধারণত সেকেন্ডের মধ্যে)।

সে এটি প্রথমে Count mode-এ সেট করল। 24 ঘণ্টা চালাল। rule trip করা একমাত্র IP ছিল scraper। কোনো legitimate user কখনো পাঁচ মিনিটে search endpoint-এ 12টির বেশি request পাঠায়নি।

সে Block mode-এ switch করল। Scraper-এর পরবর্তী request একটি 403 পেল। এটি একটি ভিন্ন IP-তে switch করল। Rate limit সেটাও ধরল।

"তারা শেষ পর্যন্ত এর চারপাশে যাবে," Leo বলল। "আরো IP জুড়ে distribute করবে।"

"সেই সময়ে তারা আরো অবকাঠামো ব্যবহার করছে, আরো পেমেন্ট করছে এবং কম ডেটা পাচ্ছে," Priya বলল। "আমাদের তাদের সম্পূর্ণ থামানোর দরকার নেই। আমাদের এটিকে যথেষ্ট ব্যয়বহুল করতে হবে যাতে এটি মূল্যবান না হয়।"

"মাসে এর খরচ কত?" Tom জিজ্ঞেস করল।

WAF pricing প্রতি Web ACL প্রতি মাসে, প্রতি rule প্রতি মাসে এবং প্রতি মিলিয়ন request। Nimbus setup-এর জন্য — একটি Web ACL, CloudFront-এ পাঁচটি rule — প্রায় মাসে $15 plus request charge।

Tom এটি তাৎক্ষণিকভাবে অনুমোদন করল।

---

**Amazon GuardDuty: Behavioral Analyst**

"দাঁড়াও — কিন্তু আমরা *কেন* এভাবে করব?" Maya জিজ্ঞেস করল। "WAF যদি attack block করছে এবং Shield যদি flood absorb করছে, আমাদের একটি তৃতীয় service কেন দরকার? GuardDuty আসলে কীসের জন্য দেখছে?"

WAF এবং Shield হলো filter — তারা আপনার অ্যাপ্লিকেশনে পৌঁছানোর আগে খারাপ ট্রাফিক intercept করে। GuardDuty ট্রাফিক আসার পরে কী হয় তা দেখে। এটি আপনার অবকাঠামো কী করছে তা দেখে: কোন IAM credential ব্যবহার হচ্ছে, আপনার instance কোন domain-এর সাথে যোগাযোগ করছে, রাত ৩টায় কোন API call ঘটছে। একটি legitimate-দেখানো request-এর মাধ্যমে সদর দরজা পেরিয়ে যাওয়া একজন attacker WAF দ্বারা থামবে না — কিন্তু GuardDuty লক্ষ্য করবে যে একই credential হঠাৎ Romania থেকে API call করছে।

GuardDuty মূলত Shield এবং WAF থেকে ভিন্ন। এটি attack block করে না — এটি **unusual behavior detect করে**।

GuardDuty threat detect করতে activity-র বেশ কয়েকটি stream ক্রমাগত analyze করে: **CloudTrail management এবং data event** (API call এবং action), **VPC Flow Log** (network ট্রাফিক pattern), এবং **DNS query log** (domain lookup)। এই তিনটি foundational source যার উপর GuardDuty সবসময় নির্ভর করেছে:

- **AWS CloudTrail log**: IAM পরিবর্তন, API call, console login
- **VPC Flow Log**: আপনার VPC-এর মধ্যে network ট্রাফিক pattern
- **DNS query log**: আপনার instance কী resolve করছে (known malware প্রায়ই নির্দিষ্ট C2 domain resolve করে)

কিন্তু GuardDuty এই তিনটির বাইরে উল্লেখযোগ্যভাবে প্রসারিত হয়েছে। AWS ঐচ্ছিক add-on-গুলিকে **protection plan** বলে — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring এবং Malware Protection — প্রতিটি পৃথকভাবে সক্ষম করা। আপনি কোনটি সক্ষম করেন তার উপর নির্ভর করে, GuardDuty **S3 data event** (আপনার bucket-এ unusual access pattern), **EKS audit log এবং runtime activity** (চলমান container-এর ভেতরে malicious behavior), **RDS login event** (anomalous database login প্রচেষ্টা), **Lambda network ট্রাফিক** (অপ্রত্যাশিত external গন্তব্যে call করা function), **ECS/EC2 runtime behavior** এবং **malware-এর জন্য scan করা EBS volume**-ও analyze করতে পারে। পরীক্ষার জন্য, তিনটি core source মুখস্থ জানুন; protection plan নির্দিষ্ট threat detection context সম্পর্কে দৃশ্যকল্পে দেখা যায় — "RDS-এ anomalous login প্রচেষ্টা detect করুন" বা "একটি চলমান container-এর ভেতরে malicious behavior identify করুন" GuardDuty-এর ঐচ্ছিক protection plan নিয়ে ভাবার সংকেত।

Machine learning model আপনার baseline থেকে deviate করা pattern identify করে। GuardDuty anomaly detect করলে **finding** — categorized alert — তৈরি করে।

GuardDuty কী detect করতে পারে তার উদাহরণ:

- একটি unrecognized IP address থেকে login করা একটি IAM user (একটি দেশ থেকে যা তারা আগে কখনো ব্যবহার করেনি)
- একটি Tor exit node থেকে করা API call
- একটি known cryptocurrency mining pool-এর সাথে যোগাযোগ করা একটি EC2 instance
- Unusually high API call volume (credential abuse বা scanning)
- Malicious activity-র জন্য flagged একটি IP address দ্বারা অ্যাক্সেস করা একটি S3 bucket
- malware command-and-control-এর সাথে যুক্ত বলে জানা একটি domain-এ outbound ট্রাফিক

"এটাই Romanian IP catch করত," Leo চুপচাপ বলল।

"আমাদের GuardDuty enabled থাকলে, এটা রাত ২টায় একটি unrecognized external IP-এ outbound connection করা EC2 instance flag করত," Priya নিশ্চিত করল।

---

**পাঁচটি GuardDuty Finding Type এবং কী করতে হবে**

Priya পাঁচটি সবচেয়ে সাধারণ GuardDuty finding-এর জন্য একটি runbook তৈরি করল। একটি finding fire করলে, দল তাৎক্ষণিকভাবে জানে এর মানে কী এবং কী করতে হবে।

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

একটি IAM user এই account-এর জন্য আগে দেখা যায়নি এমন একটি IP address থেকে, বা পূর্ববর্তী login-এর সাথে অসামঞ্জস্যপূর্ণ একটি ভৌগোলিক অবস্থান থেকে সফলভাবে AWS Console-এ login করেছে।

Response: user-এর সাথে যাচাই করুন তারা login শুরু করেছিল কিনা। তারা না করে থাকলে — বা পৌঁছানো না গেলে — তাৎক্ষণিকভাবে: user-এর access key এবং console password disable করুন, active session revoke করুন, এবং সেই user গত 24 ঘণ্টায় যা করেছে তার একটি CloudTrail audit শুরু করুন। এই finding প্রায়ই credential abuse-এর আগে আসে।

**2. CryptoCurrency:EC2/BitcoinTool.B**

একটি EC2 instance cryptocurrency mining pool-এর সাথে যুক্ত IP address বা domain name query করছে। এটি প্রায় সবসময় একটি EC2 instance compromise হয়ে একটি mining bot হিসেবে ব্যবহার হওয়ার ফল।

Response: instance-টি তাৎক্ষণিকভাবে isolate করুন — আপনার bastion host ছাড়া সমস্ত inbound এবং outbound ট্রাফিক block করতে এর security group modify করুন। EBS volume-এর একটি forensic snapshot নিন। তারপর instance terminate করুন এবং একটি clean AMI থেকে একটি replacement launch করুন।

**3. Recon:EC2/PortProbeUnprotectedPort**

একটি EC2 instance-এর একটি port ইন্টারনেটে খোলা আছে যা known scanner দ্বারা বা একটি Tor exit node থেকে probe করা হচ্ছে। GuardDuty এমন port flag করে যা flow log-এ external source থেকে accessible বলে দেখা যায়।

Response: security group rule review করুন। Port যদি ইচ্ছাকৃতভাবে খোলা থাকে, একটি note সহ finding resolved চিহ্নিত করুন। এটি ইচ্ছাকৃত না হলে, তাৎক্ষণিকভাবে port বন্ধ করুন। সেই port-এর মাধ্যমে হয়ে থাকতে পারে এমন যেকোনো access-এর জন্য CloudTrail check করুন।

**4. Trojan:EC2/BlackholeTraffic**

একটি EC2 instance একটি "black hole" হিসেবে চিহ্নিত একটি IP address-এর সাথে যোগাযোগ করার চেষ্টা করছে — malware command-and-control infrastructure-এর সাথে যুক্ত একটি গন্তব্য। এই IP-তে ট্রাফিক ইঙ্গিত দেয় instance infected হয়েছে এবং call home করার চেষ্টা করছে।

Response: CryptoCurrency finding-এর মতোই — isolate, snapshot, replace। এই finding instance-এ active malware নির্দেশ করে। instance in place clean করার চেষ্টা করবেন না; একটি clean AMI থেকে একটি নতুন তৈরি করুন।

**5. Policy:S3/BucketBlockPublicAccessDisabled**

কেউ একটি S3 bucket-এ Block Public Access setting disable করেছে। এর মানে bucket public নয় — এর মানে সেই bucket-এর জন্য দুর্ঘটনাজনিত public exposure প্রতিরোধকারী safety mechanism বন্ধ করা হয়েছে। এটি প্রায়ই দুর্ঘটনাক্রমে বা একটি misconfigured deployment-এর অংশ হিসেবে করা হয়।

Response: কে পরিবর্তন করেছে তদন্ত করুন (CloudTrail-এ API call থাকবে)। এটি disable করা উচিত এমন একটি documented কারণ না থাকলে Block Public Access আবার সক্ষম করুন। ভবিষ্যতে এই finding ঘটা প্রতিরোধ করতে account-স্তরের Block Public Access setting সক্ষম করার কথা বিবেচনা করুন।

"GuardDuty finding সম্পর্কে সবচেয়ে গুরুত্বপূর্ণ বিষয়," Priya বলল, "হলো সেগুলি alert নয় — সেগুলি hypothesis। প্রতিটি finding বলে 'এই pattern anomalous দেখায়।' আপনি যাচাই করেন, আপনি তদন্ত করেন, আপনি respond করেন। কিছু false positive হবে। বেশিরভাগ হবে না।"

"আমরা কীভাবে prioritize করি?" Rafael জিজ্ঞেস করল।

"GuardDuty severity level assign করে: Low, Medium, High। High severity finding same-day response প্রয়োজন। Trojan এবং credential compromise finding সবসময় High। Port probe finding Medium বা Low হতে পারে। High দিয়ে শুরু করুন, নিচে কাজ করুন।"

---

"এর দাম কত?" Tom জিজ্ঞেস করল।

GuardDuty pricing analyze করা log-এর volume-এর উপর ভিত্তি করে — CloudTrail event, VPC flow ডেটা, DNS query। একটি ছোট থেকে মাঝারি অ্যাপ্লিকেশনের জন্য, সাধারণত মাসে $50-150। স্কেলে, এটি এখনো অবকাঠামো খরচের একটি ছোট ভগ্নাংশ।

Tom console তুলল এবং এটি সক্ষম করল।

"ঠিক হয়ে যাবে," Leo বলল। "এটা শুধু monitoring। এটা কিছু ভাঙবে এমন নয়।"

"আমি ইতিমধ্যে এটা deploy করেছি," Leo যোগ করল — এবং তারপর GuardDuty dashboard check করল। "ওহ। শুধু sample finding। প্রকৃতগুলি একটু সময় নেয়।"

"স্বাভাবিক কেমন দেখায় তার একটি baseline তৈরি করতে GuardDuty-র সময় দরকার," Priya বলল। "এটাকে কয়েক দিন দিন। প্রথম প্রকৃত finding আসবে — সেগুলি সবসময় আসে।"

সে সে সম্পর্কে ঠিক প্রমাণিত হলো। কিন্তু প্রথম finding এই অধ্যায়ের শেষের জন্য একটি গল্প।

**তিনটি Service সংযুক্ত করা**

Shield, WAF এবং GuardDuty বিভিন্ন স্তরে কাজ করে এবং একে অপরের পরিপূরক:

| Service    | Layer                     | কীসের বিরুদ্ধে সুরক্ষা করে                  | Action                          |
|------------|---------------------------|---------------------------------------------|---------------------------------|
| AWS Shield | Network/Transport (L3/L4) | DDoS flood                                  | Attack absorb/mitigate করে      |
| AWS WAF    | Application (L7)          | OWASP Top 10, bot, scraper                  | Request allow, block বা count করে |
| GuardDuty  | Behavioral (সমস্ত log)    | Anomaly, compromised credential, malware    | Detect এবং alert করে           |

Shield flood থামায়। WAF পানি filter করে। GuardDuty unusual flow pattern-এর জন্য plumbing দেখে। Macie reservoir-এ কী store করা তা audit করে। Security Hub হলো control room যেখানে সব dashboard একসাথে দৃশ্যমান।

প্রতিটির failure mode ব্যাখ্যা করে কেন আপনার সবগুলি দরকার:

- একটি 50 Gbps SYN flood একটি web request নয়। WAF এটি inspect করতে পারে না। GuardDuty সংশ্লিষ্ট CloudTrail event লক্ষ্য করতে পারে। Shield এটি থামায়।
- একটি একক SQL injection request একটি flood নয়। Shield এটি উপেক্ষা করে। GuardDuty HTTP request-এর বিষয়বস্তু জানে না। WAF এটি ধরে।
- একটি legitimate AWS user তাদের নিজস্ব credential ব্যবহার করে ধীরে ধীরে ডেটা exfiltrate করছে — কোনো DDoS নেই, কোনো injection নেই, valid HTTP — Shield এবং WAF unusual কিছু দেখে না। GuardDuty লক্ষ্য করে credential রাত ৩টায় একটি নতুন দেশ থেকে ব্যবহার হচ্ছে।
- একজন developer যে দুর্ঘটনাক্রমে একটি public-accessible bucket-এ গ্রাহক ডেটা upload করে আদৌ কোনো anomalous behavior তৈরি করে না। GuardDuty-র flag করার কিছু নেই। Macie bucket scan করে এবং PII খুঁজে পায়।

প্রতিটি service-এর একটি blind spot আছে। সংমিশ্রণ সেই blind spot cover করে।

**CloudTrail: ভিত্তি**

তিনটি service-ই log-এর উপর নির্ভর করে। **AWS CloudTrail** হলো logging service যা আপনার AWS account-এ প্রতিটি API call capture করে — কে কী call করল, কখন, কোথা থেকে, কোন ফলাফল সহ।

CloudTrail console-এ একটি 90-দিনের history-র জন্য ডিফল্টরূপে সক্ষম। দীর্ঘমেয়াদে log retain করতে:

1. একটি S3 bucket-এ লেখা একটি trail তৈরি করুন
2. Optionally, real-time alerting-এর জন্য CloudWatch Logs-এ পাঠান
3. Log file validation সক্ষম করুন (log tamper হয়েছে কিনা detect করতে)

GuardDuty, AWS Config, Security Hub এবং IAM Access Analyzer সবাই CloudTrail থেকে পড়ে। CloudTrail log ছাড়া, এই service-গুলির analyze করার কিছু নেই।

"কেউ যদি CloudTrail disable করার চেষ্টা করে?" Priya জিজ্ঞেস করল। "একজন attacker administrator access পেলে, তাদের প্রথম action logging disable করা হতে পারে — তাদের track ঢাকা।"

"সেটাই অধ্যায় ১৪-এর SCP প্রতিরোধ করে," Leo বলল। "এই account-এ কেউ CloudTrail disable করতে পারে না, এমনকি administrator-ও।"

"এবং তারা কোনোভাবে করলে?"

"Security Hub একটি finding তৈরি করত। CloudTrail configuration পরিবর্তনে SNS-এ একটি notification পাঠায়। আমরা যেকোনো CloudTrail modification-এর দুই মিনিটের মধ্যে একটি alert পাই।"

"এবং GuardDuty API call flag করত," Rafael যোগ করল, "একটি unusual IAM action হিসেবে — logging disable করা একটি স্বাভাবিক operational activity নয়।"

সবচেয়ে critical security action-এর একটির জন্য detection-এর একাধিক স্তর: log-এর সাথে tampering করা। এটি একটি দুর্ঘটনা ছিল না। Priya ইচ্ছাকৃতভাবে এটি ডিজাইন করেছিল।

"Defense in depth monitoring layer-এও প্রযোজ্য," সে বলল। "শুধু application layer-এ নয়।"

**Amazon Macie: S3-এ Sensitive ডেটা**

"কেউ যদি দুর্ঘটনাক্রমে গ্রাহক credit card number সহ একটি ফাইল S3-তে upload করে তা নিয়ে আমরা ভেবেছি কি?" Priya জিজ্ঞেস করল। "Malicious-ভাবে নয় — শুধু একজন developer debugging-এর জন্য ডেটা export করছে এবং ভুল ফাইল upload করছে?"

"আমরা কখনো জানতাম না," Leo বলল।

"ঠিক। যদি না আমাদের Macie থাকে।"

**Amazon Macie** হলো একটি data security service যা S3-এ sensitive ডেটা স্বয়ংক্রিয়ভাবে discover এবং রক্ষা করতে machine learning ব্যবহার করে। এটি ক্রমাগত S3 bucket scan করে এবং identify করে:

- PII (Personally Identifiable Information): নাম, email address, phone number, জন্মতারিখ
- Financial ডেটা: credit card number, bank account number
- Credential: password, access key, ফাইলে embedded private key
- Health information: patient record, diagnosis

Macie finding তৈরি করে যখন এটি sensitive ডেটা এমন জায়গায় detect করে যেখানে থাকা উচিত নয় — বা যখন S3 bucket-এর overly permissive access configuration থাকে।

"এটা কি GuardDuty-র মতো?" Maya জিজ্ঞেস করল।

"ভিন্ন উদ্দেশ্য," Priya বলল। "GuardDuty behavior দেখে — কোন action নেওয়া হচ্ছে, সেই action anomalous দেখায় কিনা। Macie ডেটা দেখে — কী content store করা, সেই content sensitive কিনা। GuardDuty unusual API call করা একটি EC2 instance flag করত। Macie credit card number ধারণকারী একটি S3 bucket flag করত।"

"তাহলে GuardDuty হলো behavioral analyst," Leo বলল, "এবং Macie হলো data auditor।"

"ঠিক। আপনার উভয় দরকার। একটি legitimate-দেখানো API call-এর মাধ্যমে ডেটা exfiltrate করা একজন attacker unusual API pattern-এর জন্য GuardDuty দ্বারা flagged হতে পারে। কিন্তু একজন কর্মচারী 10,000 গ্রাহক record সহ একটি ফাইল একটি development bucket-এ upload করলে, detect করার কোনো anomalous behavior নেই — শুধু ভুল জায়গায় sensitive ডেটা। Macie সেটা ধরে।"

Nimbus-এর জন্য, Macie-র সবচেয়ে তাৎক্ষণিক মূল্য ছিল `nimbus-debug-exports` bucket-এ — একটি bucket যা developer-রা debugging-এর জন্য ডেটা dump করতে ব্যবহার করত। Macie গ্রাহক নাম এবং delivery address সহ অর্ডার ইতিহাস ধারণকারী তিনটি ফাইল খুঁজে পেল। Payment ডেটা নয়, কিন্তু personal ডেটা যা একটি unencrypted development bucket-এ থাকা উচিত নয়।

ফাইলগুলি সরানো হয়েছিল। একটি policy যোগ করা হয়েছিল: debug bucket শুধুমাত্র synthetic test data-তে সীমাবদ্ধ। প্রকৃত গ্রাহক ডেটা production-এর বাইরে যেকোনো environment-এ export করতে Priya-র অনুমোদন প্রয়োজন।

"মাসে এর খরচ কত?" Tom জিজ্ঞেস করল।

Macie প্রতি মাসে evaluate করা S3 bucket-এর সংখ্যা এবং scan করা ডেটার volume-এর উপর ভিত্তি করে charge করে। মাঝারি সংখ্যক bucket সহ একটি startup-এর জন্য, প্রায় মাসে $10-50। প্রথম 30 দিনের জন্য বিনামূল্যে।

Tom দুপুরের খাবারের আগে এটি সক্ষম করল।

---

**AWS Security Hub: Dashboard**

আপনি একাধিক AWS account চালালে বা security finding-এর একটি consolidated view প্রয়োজন হলে, **AWS Security Hub** GuardDuty, Inspector (vulnerability assessment), Macie (data privacy), Config এবং Firewall Manager-এর finding একটি single dashboard-এ aggregate করে।

এটি AWS Foundational Security Best Practices standard এবং CIS AWS Foundations Benchmark-এর বিরুদ্ধেও আপনার configuration check করে।

Security Hub হলো "আমি কীভাবে পাঁচটি ভিন্ন console-এর মধ্যে switch না করে একটি জায়গায় আমার সমস্ত security finding দেখি?"-এর উত্তর। GuardDuty একটি finding তৈরি করলে, এটি GuardDuty-তে এবং Security Hub-এ দেখা যায়। Macie একটি S3 bucket-এ sensitive ডেটা খুঁজে পেলে, এটি Macie-তে এবং Security Hub-এ দেখা যায়। একটি Config rule একটি misconfiguration detect করলে, এটি Config-এ এবং Security Hub-এ দেখা যায়।

একটি single-account দলের জন্য, Security Hub marginal মূল্য যোগ করে — এটি check করার আরেকটি console। এর শক্তি স্কেলে আবির্ভূত হয়: তিনটি account, দশটি account, পঞ্চাশটি account। সমস্ত account থেকে সমস্ত finding একটি management account-এর Security Hub-এ aggregate হয়। একটি দল একটি dashboard monitor করে। একটি set of alert। কোনো account-by-account log checking নেই।

Nimbus-এর জন্য: Security Hub এখনো দরকার ছিল না। যখন তারা তিনটি account-এ (dev, staging, production) বাড়ত, এটি অপরিহার্য হয়ে উঠত।

"এখন এটা সেট আপ করুন," Soo-Jin তার তৃতীয় সপ্তাহে বলল। "এটা সক্ষম করতে পনেরো মিনিট লাগে। এটা আগে করলে ভালো হত এমন wish করতে তিন মাস লাগে।"

তারা এটি সক্ষম করল।

**Amazon Inspector: Vulnerability Assessment**

Macie সক্ষম করার এক সপ্তাহ পরে, Nimbus production fleet জুড়ে চলমান OpenSSL-এর version-এর জন্য একটি CVE প্রকাশিত হলো। Priya coffee-র সাথে advisory পড়ল।

"আমাদের জানতে হবে আমাদের কোন instance প্রভাবিত," সে বলল।

"আমি একটি manual scan চালাতে পারি," Leo বলল।

"নয়টি instance-এর জন্য, ঠিক আছে। নব্বইটির জন্য? Container-এর জন্য?" Priya Inspector console খুলল। "এটাই Inspector-এর জন্য।"

**Amazon Inspector** হলো একটি automated vulnerability assessment service। যেখানে GuardDuty behavior দেখে — আপনার অবকাঠামো এখন কী করছে — Inspector দেখে কী উপস্থিত যা exploit করা যেতে পারে।

- **EC2 instance:** Inspector operating system এবং installed package NVD (National Vulnerability Database)-এর বিরুদ্ধে scan করে — known CVE-র authoritative catalog। আপনি OpenSSL 1.1.1 চালালে এবং একটি CVE সেই version target করলে, Inspector এটি flag করে।
- **ECR container image:** Inspector deploy হওয়ার আগে Elastic Container Registry-তে container image scan করে। একটি base image-এ একটি vulnerable package container কখনো production-এ চলার আগে একটি finding হিসেবে দেখা যায়।
- **Lambda function package:** Inspector আপনার Lambda function-এ bundled dependency — Python package, Node module, Java dependency — known vulnerability-র জন্য analyze করে।

একটি one-time scan থেকে critical পার্থক্য: Inspector **ক্রমাগত** চলে। এটি শুধু আপনি এটি সক্ষম করলে একবার আপনার instance check করে এবং সেগুলিকে clean ঘোষণা করে না। একটি নতুন CVE প্রকাশিত হলে, Inspector স্বয়ংক্রিয়ভাবে নতুন vulnerability-র বিরুদ্ধে আপনার existing resource পুনঃমূল্যায়ন করে। একটি EC2 instance পরিবর্তিত হলে — নতুন package installed, AMI আপডেট — Inspector এটি rescan করে। Priya-র EC2 fleet Inspector সক্ষম করার মিনিটের মধ্যে OpenSSL CVE-র জন্য flagged হয়েছিল, সে এটি scan করতে বলেছিল বলে নয়, কিন্তু কারণ এটাই এটা করে।

Finding severity-rated: Critical, High, Medium, Low, Informational। সেগুলি GuardDuty এবং Macie finding-এর পাশাপাশি Security Hub-এ প্রবাহিত হয়। একটি dashboard। তিনটি lens।

"তিনটি instance প্রভাবিত," Leo বলল, Inspector finding পড়ে। "বাকি ছয়টি একটি patched version-এ।"

"এই সপ্তাহে সেই তিনটি patch করুন," Priya বলল।

"Container image সম্পর্কে কী?"

Priya Inspector ECR finding দেখল। তাদের container registry-তে দুটি base image-এর known vulnerability ছিল — package-এর পুরানো version যা তখন থেকে patched হয়েছিল। সে সেগুলিকে rebuild-এর জন্য tag করল।

"গুরুত্বপূর্ণ বিষয়," Priya বলল, "হলো আমরা এটা exploit হওয়ার আগে পেয়েছি। পরে নয়।"

**Three-Lens Model**

GuardDuty, Inspector এবং Macie প্রতিটি একটি ভিন্ন জিনিস দেখে:

- **GuardDuty** behavioral। এটি জিজ্ঞেস করে: *এখন কী ঘটছে যা ভুল দেখায়?* অপ্রত্যাশিত অবস্থান থেকে API call, command-and-control server-এর সাথে যোগাযোগ করা EC2 instance, unusual সময়ে ব্যবহার করা credential। এটি active threat এবং anomaly ধরে।
- **Inspector** structural। এটি জিজ্ঞেস করে: *আমাদের environment-এ কী উপস্থিত যা exploit করা যেতে পারে?* Unpatched package, vulnerable dependency, outdated runtime। এটি attack সম্ভব করা শর্ত ধরে।
- **Macie** ডেটা সম্পর্কে। এটি জিজ্ঞেস করে: *আমাদের S3 bucket-এ কোন sensitive information বসে আছে যা থাকা উচিত নয়?* PII, financial record, ফাইলে রেখে যাওয়া credential। এটি এমন exposure ধরে যা কোনো anomalous behavior তৈরি করে না — শুধু ভুল জায়গায় ডেটা।

একটি known CVE জড়িত একটি compromise তিনটিতেই দেখা দিতে পারে: Inspector attack-এর আগে vulnerability flag করত। GuardDuty attack-এর সময় anomalous behavior flag করত। Macie এটি S3-তে নামার পরে exfiltrated ডেটা flag করত।

তিনটি ভিন্ন lens, তিনটি ভিন্ন time horizon, কোনোটিই অন্যগুলির বিকল্প নয়।

**AWS Network Firewall: Traffic Inspector**

Toolbox বন্ধ হওয়ার আগে আরো একজন specialist উল্লেখের যোগ্য। Security group এবং NACL (অধ্যায় ১৫) IP, port এবং protocol দ্বারা ট্রাফিক filter করে — তারা বলতে পারে *কে* *কী*-এর সাথে কথা বলতে পারে, কিন্তু তারা কথোপকথনের ভেতরে দেখতে পারে না। **AWS Network Firewall** হলো একটি managed, stateful firewall যা আপনি VPC স্তরে deploy করেন। এটি deep packet inspection সম্পাদন করে: domain name দ্বারা filter করা (শুধুমাত্র `*.eatnimbus.com` এবং আপনার package repository-তে outbound allow করা), intrusion signature মিলে যাওয়া ট্রাফিক block করা (IDS/IPS, Suricata rule-এর সাথে compatible), এবং security group port number ঠিক দেখাত বলে যে flow সহজভাবে wave through করত তা inspect করা।

"তাহলে এটা একটা মস্তিষ্ক সহ security group," Leo বলল।

"এটা সেই appliance যা আপনি একটি firewall vendor থেকে কিনতেন," Priya বলল, "কিন্তু managed, auto-scaling এবং তার নিজস্ব subnet-এ deploy করা যাতে VPC-এর ভেতরে এবং বাইরে সমস্ত ট্রাফিক এর মধ্য দিয়ে route হয়।"

পরীক্ষার সংকেত: "domain name বা payload দ্বারা ট্রাফিক inspect বা filter করুন," "একটি VPC-র জন্য intrusion detection/prevention (IDS/IPS)," বা "outbound ট্রাফিকের জন্য centralized egress filtering" → Network Firewall। Security group এবং NACL হলো port এবং IP দ্বারা instance-স্তর এবং subnet-স্তরের allow/deny-এর উত্তর; প্রশ্ন যখন ট্রাফিকের *ভেতরে* inspection দাবি করে তখন Network Firewall উত্তর। এবং প্রশ্ন যখন জিজ্ঞেস করে কীভাবে WAF rule, Shield Advanced, security group *এবং* Network Firewall policy অনেক account জুড়ে সামঞ্জস্যপূর্ণভাবে manage করতে হবে — সেটা **AWS Firewall Manager**, উপরের policy administration layer।

## শক্তি এবং সীমাবদ্ধতা

**AWS Shield**:

- Standard: বিনামূল্যে এবং স্বয়ংক্রিয় — ব্যবহার না করার কোনো কারণ নেই
- Advanced: high-profile target-এর জন্য চমৎকার; ছোট দলের জন্য ব্যয়বহুল
- Standard স্বয়ংক্রিয়ভাবে layer 3/4 attack (SYN flood, UDP flood, DNS amplification) absorb করে
- Advanced layer 7 protection, real-time notification এবং Shield Response Team যোগ করে

**AWS WAF**:

- Managed rule group setup উল্লেখযোগ্যভাবে সহজ করে — কয়েকটি click-এ OWASP Top 10 protection
- Custom rule HTTP attack pattern বোঝা প্রয়োজন
- Rate limiting একটি শক্তিশালী feature প্রায়ই overlooked — scraper এবং brute force-এর বিরুদ্ধে কার্যকর
- WAF secure application code-এর বিকল্প নয় — এটি একটি defense-in-depth layer
- Count mode-এ শুরু করুন, validate করুন, তারপর Block-এ switch করুন

**GuardDuty**:

- Enable করা অত্যন্ত low effort (কয়েকটি click, 30-দিনের free trial)
- Finding-এর human review এবং response প্রয়োজন — GuardDuty detect করে, fix করে না
- False positive ঘটে — কিছু legitimate activity ML model-এ anomalous দেখায়
- Severity level (Low/Medium/High) response prioritize করতে সাহায্য করে
- Automated response workflow-এর জন্য Security Hub, EventBridge এবং Lambda-এর সাথে integrate করে

**Amazon Inspector**:

- Continuous, automated vulnerability scanning — একটি one-time check নয়
- নতুন CVE প্রকাশিত হলে বা resource পরিবর্তিত হলে স্বয়ংক্রিয়ভাবে re-scan করে
- EC2 instance (OS এবং application package), ECR container image এবং Lambda function package cover করে
- Finding Security Hub-এ প্রবাহিত হয়; severity rating patching prioritize করতে সাহায্য করে
- Attack block করে না — এটি attack সম্ভব করা শর্ত পৃষ্ঠে আনে

**Amazon Macie**:

- S3-এ sensitive ডেটা (PII, credential, financial ডেটা) স্বয়ংক্রিয়ভাবে discover করে
- এমন data exposure ধরে যার কোনো anomalous behavior pattern নেই — GuardDuty এটি miss করত
- 30-দিনের free trial; এর পরে প্রতি bucket প্রতি মাসে পেমেন্ট
- অনেক S3 bucket এবং varying sensitivity level সহ দলের জন্য সবচেয়ে মূল্যবান

**AWS Security Hub**:

- GuardDuty, Macie, Inspector, Config এবং Firewall Manager থেকে finding aggregate করে
- Security benchmark (CIS, NIST, PCI-DSS)-এর বিরুদ্ধে configuration check করে
- Multi-account স্কেলে সবচেয়ে মূল্যবান
- আগে সক্ষম করুন, এমনকি আপনার একটি মাত্র account থাকলেও — finding history cumulative

## সারসংক্ষেপ

পাঁচটি service, পাঁচটি layer। প্রতিটি একটি ভিন্ন ধরনের threat address করে — এবং কোনোটিই অন্যগুলির প্রতিস্থাপন করে না। একটি DDoS attack WAF এবং GuardDuty bypass করে। একটি SQL injection প্রচেষ্টা Shield bypass করে। ধীরে ও সাবধানে ব্যবহার করা একটি compromised credential Shield এবং WAF সম্পূর্ণ bypass করতে পারে — কিন্তু GuardDuty anomaly দেখবে। একজন developer দুর্ঘটনাক্রমে একটি debug S3 bucket-এ গ্রাহক PII upload করলে তিনটিই bypass করে — কিন্তু Macie এটি ধরে।

- **AWS Shield Standard**: বিনামূল্যে, স্বয়ংক্রিয় layer 3/4 DDoS protection। সর্বদা চালু। Nimbus load balancer-এ পৌঁছানোর আগে 50 Gbps SYN flood absorb করেছিল।
- **AWS Shield Advanced**: SRT access এবং cost protection সহ Premium DDoS protection। Enterprise use case।
- **AWS WAF**: Application-layer firewall। HTTP request inspect এবং filter করুন। CloudFront, ALB বা API Gateway-এ attach করুন। OWASP Top 10 protection-এর জন্য Managed Rule Group ব্যবহার করুন। Scraper defense-এর জন্য rate-based rule।
- **Amazon GuardDuty**: Behavioral threat detection। Core data source: CloudTrail event, VPC Flow Log এবং DNS log। ঐচ্ছিক extended protection S3 event, EKS/ECS runtime monitoring, RDS login event এবং Lambda network activity যোগ করে। Anomalous activity-র জন্য categorized finding তৈরি করে। পাঁচটি মূল finding type: UnauthorizedAccess (console login), CryptoCurrency (mining), Recon (port probe), Trojan (C2 traffic), Policy (S3 misconfiguration)।
- **Amazon Inspector**: Automated vulnerability assessment। known CVE-র জন্য EC2 instance, ECR container image এবং Lambda function package scan করে। ক্রমাগত চলে এবং নতুন vulnerability প্রকাশিত হলে পুনঃমূল্যায়ন করে। Finding Security Hub-এ প্রবাহিত হয়।
- **Amazon Macie**: S3-এ sensitive data discovery। PII, credential এবং financial ডেটা detect করে। এমন exposure ধরে যার কোনো anomalous behavior pattern নেই।
- **AWS Security Hub**: সমস্ত security service থেকে finding একটি dashboard-এ aggregate করে। একাধিক account জুড়ে centralized monitoring সক্ষম করে।
- **CloudTrail**: সমস্ত AWS security logging-এর ভিত্তি। দীর্ঘমেয়াদী retention-এর জন্য S3-তে লেখা একটি trail সক্ষম করুন। প্রতিটি security service এটি থেকে পড়ে।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Secure Architectures (ডোমেন ১, টাস্ক ১.২)*

- **Shield Standard বনাম Advanced**: Standard বিনামূল্যে এবং স্বয়ংক্রিয়। Advanced অর্থ ব্যয় করে এবং SRT, cost protection এবং ভালো detection যোগ করে। Advanced-এর জন্য পরীক্ষার সংকেত: "large-scale DDoS," "attack-এর সময় SLA guarantee," "DDoS-related cost spike-এর বিরুদ্ধে financial protection।"
- **WAF use case signal**: "SQL injection block করুন," "cross-site scripting block করুন," "API call rate limit করুন," "specific user-agent block করুন," "OWASP Top 10 protection" → WAF।
- **GuardDuty signal**: "unusual API activity detect করুন," "compromised credential identify করুন," "anomalous EC2 network connection flag করুন," "threat intelligence" → GuardDuty।
- **WAF attachment**: CloudFront (global), ALB (regional), API Gateway (regional), AppSync-এ attach করা যায়।
- **GuardDuty data source**: তিনটি core source — CloudTrail event, VPC Flow Log, DNS log। Extended ঐচ্ছিক source-এ S3 data event, EKS audit log, RDS login event, Lambda network activity এবং ECS runtime অন্তর্ভুক্ত। পরীক্ষা জিজ্ঞেস করতে পারে কোন data source একটি নির্দিষ্ট detection দৃশ্যকল্পের সাথে relevant: "anomalous RDS login" → GuardDuty RDS Protection; "container runtime threat" → GuardDuty EKS/ECS Runtime Monitoring।
- **Macie বনাম GuardDuty**: এটি একটি সাধারণ পরীক্ষার distractor। **Macie** S3-এ sensitive ডেটা (PII, credential, financial ডেটা) detect করতে ML ব্যবহার করে। **GuardDuty** behavior-এ threat এবং anomaly detect করে। Macie content সম্পর্কে। GuardDuty behavior সম্পর্কে।
- **Inspector বনাম GuardDuty বনাম Macie:** তিনটি ভিন্ন lens, কোনোটিই অন্যগুলির বিকল্প নয়। **Inspector** = vulnerability scanning — EC2 instance, ECR-এ container image এবং Lambda function package-এ CVE। ক্রমাগত চলে এবং নতুন CVE প্রকাশিত হলে re-scan করে। **GuardDuty** = behavioral threat detection — এখন কী ঘটছে যা anomalous দেখায়। **Macie** = S3-এ sensitive data discovery — PII, credential এবং financial ডেটা যা থাকা উচিত নয়। পরীক্ষার trigger: "EC2-তে unpatched vulnerability identify করুন" বা "CVE-র জন্য container image scan করুন" → Inspector। "unusual API call বা compromised credential detect করুন" → GuardDuty। "S3-এ PII বা sensitive ডেটা খুঁজুন" → Macie।
- **Security Hub**: একাধিক service এবং account থেকে security finding aggregate করে। পরীক্ষার দৃশ্যকল্প: "company-র একাধিক AWS account আছে এবং সমস্ত security finding-এর একটি single view চায়" → Security Hub।
- **WAF-এ Rate-based rule**: একটি time window-এর মধ্যে প্রতি IP request সীমিত করতে ব্যবহৃত। Core Rule Set (যা attack pattern match করে) থেকে ভিন্ন। পরীক্ষা rate-based rule "brute force login প্রচেষ্টা প্রতিরোধ করুন" বা "scraping mitigate করুন"-এর জন্য ব্যবহার করে।
- **CloudTrail + GuardDuty + Security Hub**: এই তিনটি একসাথে AWS security observability-র core গঠন করে। প্রথমে CloudTrail সক্ষম করুন (GuardDuty এবং Security Hub এর উপর নির্ভর করে), তারপর GuardDuty, তারপর finding aggregate করতে Security Hub।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

AWS WAF এবং Amazon GuardDuty-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। প্রতিটি service কীসের বিরুদ্ধে সুরক্ষা করে, এবং প্রতিটি কোন layer-এ কাজ করে?

*(ইঙ্গিত: WAF-কে আসা request-এর উপর একটি filter হিসেবে এবং GuardDuty-কে আপনার log দেখা একটি behavioral analyst হিসেবে মনে করুন।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি retail company-র ওয়েবসাইট একটি botnet দ্বারা targeted হচ্ছে যা তাদের product search API-তে প্রতি ঘণ্টায় লক্ষ লক্ষ request পাঠাচ্ছে। Request legitimate দেখায় (valid User-Agent string, valid session cookie) কিন্তু purchase-এ result করে না — তারা product price scrape করছে। Attack legitimate customer-কে slow response time অনুভব করাচ্ছে।

কোন service-এর সংমিশ্রণ এই threat সর্বোত্তমভাবে address করে?

A) Rate limiting rule এবং CloudFront সহ AWS WAF  
B) AWS Shield Advanced এবং CloudFront  
C) Amazon GuardDuty এবং AWS Shield Standard  
D) Botnet-এর IP range block করা Network ACL

**ইঙ্গিত ১**: Request HTTP-level (application layer)। কোন service HTTP layer-এ কাজ করে?

**ইঙ্গিত ২**: Botnet অনেক ভিন্ন IP address ব্যবহার করে — NACL স্তরে specific IP range block করা বড় botnet-এর বিরুদ্ধে ineffective।

**ইঙ্গিত ৩**: IP address দ্বারা rate limiting scraping কমাতে পারে এমনকি আপনি এটি সম্পূর্ণ block করতে না পারলেও।

**উত্তর**: A

**ব্যাখ্যা**: AWS WAF যেকোনো একটি উৎস থেকে high-volume scraping-এর impact কমাতে IP address প্রতি request rate limit করতে পারে। CloudFront আসা ট্রাফিক AWS-এর edge network জুড়ে বিতরণ করে, volume absorb করে এবং origin রক্ষা করে। WAF rule scraping behavior identify করতে request pattern-ও match করতে পারে (একই API endpoint-এ rapid sequential request)।

**কেন B নয়?** Shield Advanced DDoS flood-এর বিরুদ্ধে সুরক্ষা করে (layer 3/4)। দৃশ্যকল্পটি application-layer scraping (layer 7 HTTP request) বর্ণনা করে, যা Shield inspect করে না।

**কেন C নয়?** GuardDuty আপনার AWS account behavior-এ anomaly detect করে — এটি আসা HTTP request block করে না। Shield Standard application-layer attack handle করে না।

**কেন D নয়?** বড় botnet হাজার হাজার IP address distributed source থেকে ব্যবহার করে। Specific range block করা একটি whack-a-mole পদ্ধতি যা sophisticated botnet-এর বিরুদ্ধে ব্যর্থ হয়।

*SAA-C03 ডোমেন: Design Secure Architectures — টাস্ক ১.২*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus credit card ডেটা handle করার প্রস্তুতি নিতে তাদের threat model বিবেচনা করছে। একটি PCI-DSS compliance review প্রয়োজন:

- Network-layer DDoS attack-এর বিরুদ্ধে Protection
- পরিচিত web exploit-এর জন্য Application-layer filtering
- একটি tamper-evident, long-term store-এ সমস্ত API call-এর Logging
- Payment service-এ unusual access pattern-এর Detection

প্রতিটি requirement একটি specific AWS service বা configuration-এ map করুন। Shield Standard কি যথেষ্ট, নাকি PCI-DSS context Advanced সুপারিশ করে? আপনি WAF কোথায় attach করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো compliance requirement-কে AWS service-এ mapping অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

GuardDuty সক্ষম হয়েছিল।

আটচল্লিশ ঘণ্টা পরে, এটি তার প্রথম finding তৈরি করল: *"EC2 Instance i-0abc123 একটি known Tor exit node-এর সাথে যোগাযোগ করছে।"*

Leo instance ID দেখল।

"এটা internal monitoring instance," সে বলল। "যেটা আমি network diagnostics চালাতে সেটআপ করেছিলাম।"

"এটা কি Tor exit node-এর সাথে যোগাযোগ করার কথা?"

"না।" সে থামল। "কেন করবে?"

সে instance তুলল। কেউ এতে একটি tool install করেছিল — একটি legitimate open-source network scanner যা, জানা গেল, anonymized ডেটা collection-এর জন্য Tor infrastructure-এর সাথেও যোগাযোগ করে।

"তাহলে tool call home করছিল," Priya বলল।

"আমার জ্ঞান ছাড়াই," Leo নিশ্চিত করল।

"এটা একটা supply chain risk। এমন একটি dependency যা আপনি authorize করেননি এমন কাজ করে।"

Leo tool uninstall করল। সে install করার আগে প্রতিটি third-party tool review করার একটি process সেটআপ করল।

"এটাই কি paranoia-এর স্তর যেখানে আমরা এখন আছি?" Maya জিজ্ঞেস করল।

"হ্যাঁ," Priya বলল।

"এটাই কি স্তর আমাদের সবসময় থাকা উচিত ছিল?" Maya জিজ্ঞেস করল।

"এটাও হ্যাঁ," Priya বলল।

পরবর্তী অধ্যায়ে: Oregon-এর data center অদৃশ্য হলে কী হয় — এবং Nimbus কেন চলতে থাকে।
