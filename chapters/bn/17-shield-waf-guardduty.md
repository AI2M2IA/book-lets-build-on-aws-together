# অধ্যায় ১৭: পহারাদাররা

Romanian IP ঘটনা contained ছিল। Secret Secrets Manager-এ ছিল। Credential rotate হয়েছিল। Network control কঠোর হয়েছিল।

কিন্তু Priya অধ্যায় ১৬ শেষ করা প্রশ্নটি করেছিল: "CloudTrail-এ কিছু unusual দেখা গেলে, আমরা কীভাবে জানব?"

সৎ উত্তর ছিল: তারা সম্ভবত জানত না।

CloudTrail প্রতিদিন হাজার হাজার event log করে। কোনো মানুষ সেগুলির সবগুলি পড়ে না। Priya প্রতি সপ্তাহে manually check করত, কিন্তু এর মানে কোনো কিছু মঙ্গলবার ঘটতে পারত এবং পরের সোমবার পর্যন্ত notice না হওয়া।

"আমাদের এমন কিছু দরকার যা আমাদের জন্য log দেখে," সে বলল।

Maya মাথা তুলল। "স্বয়ংক্রিয়ভাবে?"

"স্বয়ংক্রিয়ভাবে।"

Tom-এর দিনের দ্বিতীয় প্রশ্ন: "এর দাম কত?"

**তিনটি Threat Category**

একটি ক্লাউড অ্যাপ্লিকেশনের বিরুদ্ধে নিরাপত্তা হুমকি সাধারণত তিনটি category-তে পড়ে:

**Volume attack (DDoS)**: একজন attacker এত বেশি ট্রাফিক পাঠায় যে আপনার অ্যাপ্লিকেশন legitimate user-দের সাড়া দিতে পারে না। Attack লক্ষ লক্ষ HTTP request হতে পারে, বা আপনার সার্ভারের connection table ক্লান্ত করার জন্য ডিজাইন TCP SYN packet-এর flood হতে পারে।

**Application attack (Exploit)**: একজন attacker আপনার অ্যাপ্লিকেশনের দুর্বলতা exploit করার জন্য বিশেষভাবে crafted request পাঠায় — SQL injection, cross-site scripting, একটি parser crash করা malformed input।

**Behavioral anomaly (Reconnaissance এবং compromise)**: API call যা হওয়া উচিত নয় (রাত ৩টায় কেউ আপনার পুরো user database query করছে), unusual IAM activity (একটি নতুন দেশ থেকে ব্যবহার করা credential), বা অপ্রত্যাশিত গন্তব্যে network ট্রাফিক।

AWS-এর প্রতিটির জন্য একটি dedicated service আছে:

- **AWS Shield**: DDoS protection
- **AWS WAF**: Application-layer protection
- **Amazon GuardDuty**: Behavioral threat detection

**AWS Shield: DDoS Absorber**

**AWS Shield Standard** কোনো অতিরিক্ত charge ছাড়াই সমস্ত AWS customer-এর জন্য স্বয়ংক্রিয়ভাবে সক্ষম। এটি সবচেয়ে সাধারণ layer 3 (network) এবং layer 4 (transport) DDoS attack-এর বিরুদ্ধে সুরক্ষা করে — SYN flood, UDP flood, DNS amplification attack।

CloudFront, Route 53 এবং Elastic Load Balancing AWS-এর network-এর edge-এ বসে। যখন একটি DDoS attack আপনার অ্যাপ্লিকেশন target করে, এটি প্রথমে এই managed service hit করে। AWS-এর নেটওয়ার্ক অবকাঠামো আপনার EC2 instance-এ পৌঁছানোর আগে attack absorb করে।

**AWS Shield Advanced** হলো premium tier (প্রতি organization-এ মাসে $৩,০০০)। এটি যোগ করে:

- EC2, ELB, CloudFront, Global Accelerator এবং Route 53-এর জন্য Protection
- Near-real-time attack notification
- AWS Shield Response Team (SRT)-এ অ্যাক্সেস — attack respond করতে সাহায্য করতে পারে security engineer
- Cost protection: attack আপনার bill spike করলে, AWS surge cost credit করে
- Layer 7 (application layer)-এ enhanced DDoS detection এবং mitigation

"মাসে তিন হাজার ডলার?" Tom বলল।

"লক্ষ লক্ষ revenue handle করা enterprise-এর জন্য, দুই ঘণ্টা তাদের ডাউন নেওয়া DDoS তিন হাজার ডলারের বেশি খরচ করে," Priya বলল।

Tom চুপচাপ হিসাব করল।

"আমরা Standard দিয়ে শুরু করব," সে অবশেষে বলল।

**AWS WAF: Application Filter**

**AWS WAF (Web Application Firewall)** HTTP level-এ কাজ করে — এটি আপনার অ্যাপ্লিকেশনে পৌঁছানোর আগে web request-এর বিষয়বস্তু inspect করে।

WAF **Web ACL (Access Control List)** দিয়ে configure করা হয় — rule set যা define করে কী allow, block বা count করতে হবে।

WAF attach করা যায়:

- CloudFront distribution (edge-এ request inspect করুন, বৈশ্বিকভাবে)
- Application Load Balancer (regional level-এ request inspect করুন)
- API Gateway
- AWS AppSync

**WAF Managed Rule**: AWS এবং third-party vendor pre-built rule set প্রকাশ করে:

- **AWS Managed Rules - Core Rule Set**: OWASP Top 10 vulnerability-এর বিরুদ্ধে সুরক্ষা করে (SQL injection, XSS, command injection, path traversal, ইত্যাদি)
- **AWS Managed Rules - Known Bad Input**: Known attack pattern match করা request block করে
- **AWS Managed Rules - Amazon IP Reputation List**: Botnet এবং scanner-এর সাথে সংযুক্ত বলে জানা IP block করে
- **AWS Managed Rules - Bot Control**: Bot ট্রাফিক identify এবং manage করে

আপনি custom rule-ও তৈরি করতে পারেন:

- "'sqlmap' ধারণ User-Agent header সহ যেকোনো request block করুন" (একটি সাধারণ SQL injection scanner)
- "Rate limit: ৫ মিনিটে প্রতি IP প্রতি ১০০০-এর বেশি request allow করবেন না"
- "যেকোনো parameter value-এ `<script>` ধারণ request block করুন"

Nimbus-এর জন্য, practical setup: Core Rule Set সক্ষম করে CloudFront distribution-এ WAF। এটি EC2 instance-এ পৌঁছানোর আগে সবচেয়ে সাধারণ attack pattern block করে।

**Amazon GuardDuty: Behavioral Analyst**

GuardDuty মূলত Shield এবং WAF থেকে ভিন্ন। এটি attack block করে না — এটি **unusual behavior detect** করে।

GuardDuty ক্রমাগত analyze করে:

- **AWS CloudTrail log**: IAM পরিবর্তন, API call, console login
- **VPC Flow Log**: আপনার VPC-এর মধ্যে network ট্রাফিক pattern
- **DNS query log**: আপনার instance কী resolve করছে (malware প্রায়ই নির্দিষ্ট C2 domain resolve করে)

Machine learning model আপনার baseline থেকে deviate pattern identify করে। GuardDuty anomaly detect করলে **finding** — categorized alert — তৈরি করে।

GuardDuty কী detect করতে পারে তার উদাহরণ:

- একটি unrecognized IP address থেকে login করা একটি IAM user (একটি দেশ থেকে যা তারা আগে কখনো ব্যবহার করেনি)
- Tor exit node থেকে করা API call
- একটি EC2 instance একটি পরিচিত cryptocurrency mining pool-এর সাথে যোগাযোগ করছে
- Unusually high API call volume (credential abuse বা scanning)
- Malicious activity-এর জন্য flagged করা একটি IP address দ্বারা S3 bucket অ্যাক্সেস
- Malware command-and-control-এর সাথে যুক্ত একটি domain-এ Outbound ট্রাফিক

"এটাই Romanian IP catch করত," Leo চুপচাপ বলল।

"GuardDuty enabled থাকলে, রাত ২টায় একটি unrecognized external IP-এ outbound connection করা EC2 instance flag করত," Priya নিশ্চিত করল।

"এর দাম কত?"

GuardDuty pricing analyze করা log-এর volume-এর উপর ভিত্তি করে — CloudTrail event, VPC flow ডেটা, DNS query। একটি ছোট থেকে মাঝারি অ্যাপ্লিকেশনের জন্য, সাধারণত মাসে $৫০-১৫০। স্কেলে, এটি এখনো অবকাঠামো cost-এর একটি ছোট ভগ্নাংশ।

Tom console তুলল এবং এটি সক্ষম করল।

**তিনটি Service সংযুক্ত করা**

Shield, WAF এবং GuardDuty বিভিন্ন layer-এ কাজ করে এবং একে অপরের পরিপূরক:

| Service    | Layer                     | কীসের বিরুদ্ধে সুরক্ষা করে                  | Action                          |
|------------|---------------------------|---------------------------------------------|---------------------------------|
| AWS Shield | Network/Transport (L3/L4) | DDoS flood                                  | Attack absorb/mitigate করে      |
| AWS WAF    | Application (L7)          | OWASP Top 10, bot, scraper                  | Request allow, block বা count করে |
| GuardDuty  | Behavioral (সমস্ত log)    | Anomaly, compromised credential, malware    | Detect এবং alert করে           |

Shield flood থামায়। WAF পানি filter করে। GuardDuty unusual flow pattern-এর জন্য plumbing দেখে।

**CloudTrail: ভিত্তি**

তিনটি service-ই log-এর উপর নির্ভর করে। **AWS CloudTrail** হলো logging service যা আপনার AWS account-এ প্রতিটি API call capture করে — কে কী call করল, কখন, কোথা থেকে, কোন ফলাফল সহ।

CloudTrail console-এ ৯০ দিনের history-এর জন্য ডিফল্টরূপে সক্ষম। দীর্ঘমেয়াদী log retain করতে:

১. একটি S3 bucket-এ লেখা একটি trail তৈরি করুন
২. Optionally, real-time alerting-এর জন্য CloudWatch Log-এ পাঠান
৩. Log file validation সক্ষম করুন (log tamper হয়েছে কিনা detect করতে)

GuardDuty, AWS Config এবং Security Hub সবাই CloudTrail থেকে পড়ে। CloudTrail log ছাড়া, এই service-গুলির analyze করার কিছু নেই।

**AWS Security Hub: Dashboard**

আপনি একাধিক AWS account চালালে বা security finding-এর একটি consolidated view প্রয়োজন হলে, **AWS Security Hub** GuardDuty, Inspector (vulnerability assessment), Macie (ডেটা privacy), Config এবং Firewall Manager-এর finding একটি single dashboard-এ aggregate করে।

এটি AWS Foundational Security Best Practices standard এবং CIS AWS Foundations Benchmark-এর বিরুদ্ধেও আপনার configuration check করে।

Nimbus-এর জন্য: Security Hub এখনো দরকার ছিল না। যখন তারা তিনটি account-এ (dev, staging, production) বাড়বে, এটি দরকারী হবে।

## শক্তি এবং সীমাবদ্ধতা

**AWS Shield**:

- Standard: বিনামূল্যে এবং স্বয়ংক্রিয় — ব্যবহার না করার কোনো কারণ নেই
- Advanced: high-profile target-এর জন্য চমৎকার; ছোট দলের জন্য ব্যয়বহুল

**AWS WAF**:

- Managed rule group setup উল্লেখযোগ্যভাবে সহজ করে
- Custom rule HTTP attack pattern বোঝা প্রয়োজন
- Rate limiting একটি শক্তিশালী feature প্রায়ই overlooked
- WAF secure application code-এর বিকল্প নয় — এটি defense-in-depth layer

**GuardDuty**:

- Enable করা অত্যন্ত low effort (কয়েকটি click)
- Finding-এর human review এবং response প্রয়োজন — GuardDuty detect করে, fix করে না
- False positive ঘটে — কিছু legitimate activity ML model-এ anomalous দেখায়
- ৩০-দিনের free trial — অবিলম্বে সক্ষম করার মূল্য আছে

## সারসংক্ষেপ

- **AWS Shield Standard**: বিনামূল্যে, স্বয়ংক্রিয় layer 3/4 DDoS protection। সর্বদা চালু।
- **AWS Shield Advanced**: SRT access এবং cost protection সহ Premium DDoS protection। Enterprise use case।
- **AWS WAF**: Application-layer firewall। HTTP request inspect এবং filter করুন। CloudFront, ALB বা API Gateway-এ attach করুন। OWASP Top 10 protection-এর জন্য Managed Rule Group ব্যবহার করুন।
- **Amazon GuardDuty**: Behavioral threat detection। CloudTrail, VPC Flow Log এবং DNS log analyze করে। Anomalous activity-এর জন্য finding তৈরি করে।
- **CloudTrail**: সমস্ত AWS security logging-এর ভিত্তি। দীর্ঘমেয়াদী retention-এর জন্য S3-এ লেখা একটি trail সক্ষম করুন।
- এই service গুলি একে অপরের পরিপূরক: network layer-এ Shield, application layer-এ WAF, behavioral layer-এ GuardDuty।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Secure Architectures (ডোমেন ১, টাস্ক ১.২)*

- **Shield Standard বনাম Advanced**: Standard বিনামূল্যে এবং স্বয়ংক্রিয়। Advanced অর্থ ব্যয় করে এবং SRT, cost protection এবং ভালো detection যোগ করে। Advanced-এর পরীক্ষার সংকেত: "large-scale DDoS," "attack-এর সময় SLA guarantee," "DDoS-related cost spike-এর বিরুদ্ধে financial protection।"
- **WAF use case signal**: "SQL injection block করুন," "cross-site scripting block করুন," "API call rate limit করুন," "specific user-agent block করুন," "OWASP Top 10 protection" → WAF।
- **GuardDuty signal**: "unusual API activity detect করুন," "compromised credential identify করুন," "anomalous EC2 network connection flag করুন," "threat intelligence" → GuardDuty।
- **WAF attachment**: CloudFront (global), ALB (regional), API Gateway (regional), AppSync-এ attach করা যায়।
- **GuardDuty data source**: CloudTrail management event, CloudTrail S3 data event, VPC Flow Log, DNS log। পরীক্ষা জিজ্ঞেস করতে পারে কোন data source একটি নির্দিষ্ট detection scenario-তে relevant।
- **Macie**: প্রায়ই GuardDuty-এর সাথে confused। **Macie** S3-এ sensitive ডেটা (PII, credential, financial ডেটা) detect করতে ML ব্যবহার করে। **GuardDuty** behavior-এ threat এবং anomaly detect করে। ভিন্ন use case।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

AWS WAF এবং Amazon GuardDuty-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। প্রতিটি service কীসের বিরুদ্ধে সুরক্ষা করে, এবং প্রতিটি কোন layer-এ কাজ করে?

*(ইঙ্গিত: WAF-কে আসা request-এর filter হিসেবে এবং GuardDuty-কে আপনার log দেখা behavioral analyst হিসেবে মনে করুন।)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি retail company-র ওয়েবসাইট একটি botnet দ্বারা targeted হচ্ছে যা তাদের product search API-তে প্রতি ঘণ্টায় লক্ষ লক্ষ request পাঠাচ্ছে। Request legitimate দেখায় (valid User-Agent string, valid session cookie) কিন্তু purchase-এ result করে না — তারা product price scrape করছে। Attack legitimate customer-কে slow response time অনুভব করাচ্ছে।

কোন service-এর সংমিশ্রণ এই threat সর্বোত্তমভাবে address করে?

A) AWS Shield Advanced এবং CloudFront  
B) Rate limiting rule এবং CloudFront সহ AWS WAF  
C) Amazon GuardDuty এবং AWS Shield Standard  
D) Botnet-এর IP range block করা Network ACL

**ইঙ্গিত ১**: Request HTTP-level (application layer)। কোন service HTTP layer-এ কাজ করে?

**ইঙ্গিত ২**: Botnet অনেক ভিন্ন IP address ব্যবহার করে — NACL level-এ specific IP range block করা বড় botnet-এর বিরুদ্ধে ineffective।

**ইঙ্গিত ৩**: Rate limiting by IP address scraping কমাতে পারে এমনকি আপনি এটি সম্পূর্ণ block করতে না পারলেও।

**উত্তর**: B

**ব্যাখ্যা**: AWS WAF যেকোনো একটি উৎস থেকে high-volume scraping-এর impact কমাতে IP address প্রতি request rate limit করতে পারে। CloudFront আসা ট্রাফিক AWS-এর edge network জুড়ে বিতরণ করে, volume absorb করে এবং origin রক্ষা করে। WAF rule request pattern-ও match করতে পারে (একই API endpoint-এ rapid sequential request) scraping behavior identify করতে।

**কেন A নয়?** Shield Advanced DDoS flood-এর বিরুদ্ধে সুরক্ষা করে (layer 3/4)। দৃশ্যকল্পটি application-layer scraping (layer 7 HTTP request) বর্ণনা করে, যা Shield inspect করে না।

**কেন C নয়?** GuardDuty আপনার AWS account behavior-এ anomaly detect করে — এটি আসা HTTP request block করে না। Shield Standard application-layer attack handle করে না।

**কেন D নয়?** বড় botnet হাজার হাজার IP address distributed source থেকে ব্যবহার করে। Specific range block করা sophisticated botnet-এর বিরুদ্ধে whack-a-mole পদ্ধতি যা ব্যর্থ হয়।

*SAA-C03 ডোমেন: Design Secure Architectures — টাস্ক ১.২*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus credit card ডেটা handle করার প্রস্তুতি নিতে তাদের threat model বিবেচনা করছে। একটি PCI-DSS compliance review প্রয়োজন:

- Network-layer DDoS attack-এর বিরুদ্ধে Protection
- পরিচিত web exploit-এর জন্য Application-layer filtering
- Tamper-evident, long-term store-এ সমস্ত API call logging
- Payment service-এ unusual access pattern detection

প্রতিটি requirement একটি specific AWS service বা configuration-এ map করুন। Shield Standard কি যথেষ্ট, নাকি PCI-DSS context Advanced সুপারিশ করে? আপনি WAF কোথায় attach করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো compliance requirement-কে AWS service-এ mapping অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

GuardDuty সক্ষম হয়েছিল।

আটচল্লিশ ঘণ্টা পরে, এটি তার প্রথম finding তৈরি করল: *"EC2 Instance i-0abc123 একটি পরিচিত Tor exit node-এর সাথে যোগাযোগ করছে।"*

Leo instance ID দেখল।

"এটা internal monitoring instance," সে বলল। "যেটা আমি network diagnostics চালাতে সেটআপ করেছিলাম।"

"এটা কি Tor exit node-এর সাথে যোগাযোগ করার কথা?"

"না।" সে থামল। "কেন করছে?"

সে instance তুলল। কেউ এতে একটি tool install করেছিল — একটি legitimate open-source network scanner যা, জানা গেল, anonymized ডেটা collection-এর জন্য Tor infrastructure-এর সাথেও যোগাযোগ করে।

"তাহলে tool call home করছিল," Priya বলল।

"আমার জ্ঞান ছাড়াই," Leo নিশ্চিত করল।

"এটি একটি supply chain risk। এমন একটি dependency যা আপনি authorized করেননি এমন কাজ করে।"

Leo tool uninstall করল। সে install করার আগে প্রতিটি third-party tool review করার একটি process সেটআপ করল।

"এটাই কি paranoia-এর স্তর আমরা এখন আছি?" Maya জিজ্ঞেস করল।

"হ্যাঁ," Priya বলল।

"এটাই কি স্তর আমাদের সবসময় ছিল?" Maya জিজ্ঞেস করল।

"এটাও হ্যাঁ," Priya বলল।

পরবর্তী অধ্যায়ে: Virginia-র data center অদৃশ্য হলে কী হয় — এবং Nimbus কেন চলতে থাকে।
