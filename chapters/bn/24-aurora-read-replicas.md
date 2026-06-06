# অধ্যায় ২৪: ডেটাবেস যা আপনার সাথে বৃদ্ধি পায়

দুটি shelf এবং একজন librarian দিয়ে শুরু হওয়া একটি library কল্পনা করুন। সেটা যথেষ্ট ছিল, কিছুক্ষণের জন্য। librarian জানত সব কিছু কোথায়। Request দ্রুত উত্তর পেত। তারপর library বাড়ল: দশটি shelf, বিশটি, চল্লিশটি। একই librarian, একই desk, একই card catalog। এখন কিছু খুঁজে পেতে অপেক্ষা প্রয়োজন। librarian ধীর নয় — মূল গতিতে একজন ব্যক্তি যা পরিবেশন করতে পারে তার চেয়ে বেশি library।

সমাধান একটি দ্রুত librarian নয়। এটা একটি ভিন্ন ধরনের library।

---

S3 cost reduction-এর পরে, Tom তার review চালিয়ে গেল। Database tier একটি ভিন্ন ধরনের সমস্যা ছিল — ভুল storage class-এ নিষ্ক্রিয় data নয়, বরং একটি সিস্টেম ছয় মাসের traffic growth-এর load-এর অধীনে সক্রিয়ভাবে লড়ছিল।

---

সংখ্যাগুলি স্বস্তিদায়ক ছিল না।

Nimbus RDS PostgreSQL চালাচ্ছিল: Multi-AZ, db.r6g.large instance। $340/মাস।

Leo CloudWatch metrics dashboard টেনে আনল। সংখ্যাগুলির একটি pattern ছিল।

**DatabaseConnections**: শুক্রবার peak-এ সর্বোচ্চ ২০০-এর মধ্যে ১৯৮। saturation থেকে দুটি connection। ২০০-তে, নতুন connection প্রচেষ্টা "too many connections" দিয়ে ব্যর্থ হত — একটি error যা ডিনার order করা গ্রাহকদের কাছে HTTP 500 হিসেবে সামনে আসত।

**CPUUtilization**: শুক্রবার ডিনার rush-এর সময় ৮৯% peak। instance spike handle করার জন্য design করা ছিল — একটি db.r6g.large-এ ২ vCPU এবং 16 GB memory আছে — কিন্তু টেকসই ৮৯% CPU মানে peak hour আসার আগেই database capacity-তে ছিল।

**ReadLatency**: ৮৪০ মিলিসেকেন্ড P95। ছয় মাস আগে, এটা ছিল 180ms। অবনতি ক্রমান্বয়ে হয়েছিল — সপ্তাহে ১০ থেকে ২০ms — catastrophic না হওয়া পর্যন্ত অদৃশ্য। Tom-এর review-এর আগের সপ্তাহে, P99 latency একটি পূর্ণ সেকেন্ড অতিক্রম করেছিল। একটি রেস্তোরাঁ menu-তে ক্লিক করা গ্রাহকরা page load হওয়ার জন্য এক সেকেন্ডের বেশি অপেক্ষা করছিল।

**FreeStorageSpace**: provisioned storage-এর ১৮% বাকি। বর্তমান growth rate-এ, database প্রায় ১১ সপ্তাহে provisioned storage শেষ করত।

"এগুলির প্রতিটি বিচ্ছিন্নভাবে সমাধানযোগ্য," dashboard দেখে Leo বলল। "কিন্তু আমাদের একসাথে চারটিই আছে।"

Connection count spike application-এ connection pooling সমস্যার দিকে নির্দেশ করছিল — অনেক ECS task তাদের নিজস্ব database connection খুলছিল। CPU issue ব্যয়বহুল query-র দিকে নির্দেশ করছিল। Latency issue এবং CPU issue প্রায় নিশ্চিতভাবে একই সমস্যা: একটি ধীর query অনেক বেশি চলছে।

"দাঁড়াও — কিন্তু আমরা কেন ১৯৮ connection-এ?" Maya জিজ্ঞেস করল। "আমাদের তিনটি ECS task আছে। আমাদের প্রায় ২০০ database connection কীভাবে আছে?"

প্রতিটি ECS task SQLAlchemy ব্যবহার করত একটি ডিফল্ট pool size ৫টি connection plus ১০টির একটি overflow সহ। তিনটি task × ১৫টি সম্ভাব্য connection = application থেকে ৪৫টি connection। বাকি ১৫৩টি ছিল analytics Lambda function, background job worker, Glue ETL job, bastion host-এর মাধ্যমে development team-এর local connection, এবং কোডের একটি পুরানো version দ্বারা খোলা কিন্তু সঠিকভাবে বন্ধ না করা বেশ কয়েকটি connection থেকে।

"Connection count সমস্যা," Leo বলল, "আসলে একটি application সমস্যা যা একটি database সমস্যার মতো দেখায়।" সে task list-এ PgBouncer (একটি connection pooler) যোগ করল — কিন্তু তাৎক্ষণিক bottleneck ছিল ধীর query।

Database CPU শুক্রবার ডিনার rush-এর সময় ৮৯%-এ spike করছিল। Read query queue হচ্ছিল। P95 query latency ছয় মাসে দ্বিগুণ হয়েছিল।

"Database হলো bottleneck," সে বলল। "Traffic বেড়েছে। Database এর সাথে scale করেনি।"

"আমরা কি শুধু instance বড় করতে পারি?" Maya জিজ্ঞেস করল। "দাঁড়াও — কিন্তু আমাদের কেন একটি single database সমস্ত read এবং write handle করছে? আমরা শুরু থেকে এটা distribute করিনি কেন?"

"হ্যাঁ," Leo বলল। "সেটা vertical scaling। আমরা r6g.large থেকে r6g.xlarge-এ যাই। আরও CPU, আরও memory। এটা বেশি খরচ করবে এবং আমাদের সময় কিনে দেবে।"

"কিন্তু এটা মূল সমস্যা সমাধান করে না," Priya বলল। "শেষ পর্যন্ত আমরা সবচেয়ে বড় instance-এ পৌঁছাব এবং একটি ভিন্ন পদ্ধতির প্রয়োজন হবে। এবং আমরা কি ভেবেছি একটি write দুর্ঘটনাক্রমে একটি read replica-তে গেলে কী হবে? Replica এটা reject করে এবং order নীরবে ব্যর্থ হয়।"

"দুটি পদ্ধতি আছে," Leo বলল। "Read replica, অথবা Aurora।"

"পার্থক্য কী?"

"একটি library-র মতো করে ভাবো," Leo একটি marker ধরে বলল। "একজন librarian যে বই check in এবং patron-এর প্রশ্ন উভয়ই উত্তর দেয়। library জনপ্রিয় হলে, একটি queue তৈরি হয়। Fix: আরও librarian নিয়োগ করুন — কিন্তু শুধুমাত্র প্রশ্নের উত্তর দেওয়ার জন্য। Check-in এখনও মূল desk-এর মাধ্যমে যায়।"

"সেটা একটি read replica," Priya বলল।

"ঠিক। Aurora একধাপ এগিয়ে যায় — এটা shelving system নিজেই পুনর্নকশা করে যাতে প্রতিটি librarian একই shelf শেয়ার করে এবং সবসময় একই বই দেখে, কোনো বিলম্ব ছাড়াই। এক desk থেকে অন্য desk-এ আপডেট ফোঁটা ফোঁটা করে আসার জন্য কোনো অপেক্ষা নেই।"

**Read Replica: Read Traffic বিতরণ করা**

বেশিরভাগ web application লেখার চেয়ে অনেক বেশি ঘন ঘন data পড়ে। menu browse করা একজন গ্রাহক ডজনখানেক SELECT query করে। একটি order দেওয়া কয়েকটি INSERT/UPDATE query করে। অনুপাত সাধারণত ১০:১ বা তার বেশি।

একটি **read replica** হলো একটি অতিরিক্ত RDS instance যা primary থেকে সমস্ত write-এর একটি copy পায় এবং SELECT query-র জন্য সেই write-গুলি উপলব্ধ করে।

এটা কীভাবে কাজ করে:

1. Application write (INSERT, UPDATE, DELETE) primary database-এ যায়
2. Primary সেই পরিবর্তনগুলি asynchronously read replica-তে replicate করে
3. Application read (SELECT) read replica জুড়ে বিতরণ করা হয়
4. Read replica load শেয়ার করে — প্রতিটি মোট read traffic-এর একটি ভগ্নাংশ handle করে

ফলাফল: primary database শুধুমাত্র write handle করে (এবং ঐচ্ছিকভাবে কিছু read)। Read replica read load handle করে। একটি ১০:১ read/write অনুপাতের জন্য, একটি read replica যোগ করা প্রায় primary-র মোট load অর্ধেক করে দেয়।

**গুরুত্বপূর্ণ সীমাবদ্ধতা**: Replication **asynchronous**। Replication lag আছে — সাধারণত মিলিসেকেন্ড, কিন্তু load-এর অধীনে সেকেন্ড হতে পারে। একটি replica থেকে একটি read primary-র চেয়ে সামান্য পিছনে থাকা data দেখতে পারে। বেশিরভাগ read-এর জন্য (menu browse করা, order history দেখা), এটা গ্রহণযোগ্য। "আমার order কি সবে হল?"-এর জন্য — primary থেকে পড়ুন।

**Read Replica: বিস্তারিত**

- আপনি প্রতি primary RDS instance-এ সর্বোচ্চ ১৫টি read replica রাখতে পারেন (MySQL, PostgreSQL, MariaDB)
- Read replica একই region-এ বা একটি ভিন্ন region-এ থাকতে পারে (cross-region replica)
- Read replica নিজেদের read replica থাকতে পারে (chaining)
- Read replica পৃথক endpoint — আপনার application-কে replica endpoint-এ read পরিচালিত করতে হবে
- Read replica standalone database-এ promote করা যায় (DR-এর জন্য উপযোগী)

Nimbus-এর জন্য, Leo একটি read replica যোগ করল। "এটা ঠিক থাকবে," Priya যখন জিজ্ঞেস করল সে traffic switch করার আগে application-এর read/write routing logic test করেছিল কিনা তখন সে বলল। সে করেনি। সে পরের চল্লিশ মিনিট যাচাই করতে ব্যয় করল যে write read replica endpoint-এ যাচ্ছিল না।

সে application আপডেট করল:

- Write operation → primary endpoint
- Menu browsing, order history → replica endpoint

Primary-তে CPU peak-এ ৮৯% থেকে ৪১%-এ নেমে এল।

**Read-After-Write Consistency সমস্যা**

Read replica সক্ষম করার তিন দিন পর, একটি support ticket এল। একটি রেস্তোরাঁ partner তাদের menu আপডেট করেছিল — একটি বন্ধ করা item সরিয়েছিল — এবং তারপর এটা সরানো হয়েছে নিশ্চিত করতে কল করেছিল। Customer service agent Nimbus interface থেকে menu টেনে আনল। Item এখনও সেখানে ছিল।

বিশ সেকেন্ড পরে, এটা চলে গেল।

Asynchronous replication lag। Write (DELETE menu item) primary-তে গিয়েছিল। Customer service agent-এর read replica-তে গিয়েছিল, যা এখনও পরিবর্তন পায়নি। Replica সেই মুহূর্তে ১৫ সেকেন্ড পিছনে ছিল — অস্বাভাবিক নয়, কিন্তু দৃশ্যমান।

"এবং কেউ যদি eventual consistency window-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "অথবা শুধু — একটি menu item-এর জন্য একটি order দেওয়া হলে কী যা সবেমাত্র delete করা হয়েছিল? আমরা গ্রাহককে charge করব এবং রেস্তোরাঁর item থাকবে না।"

এটা একটি প্রকৃত consistency উদ্বেগ ছিল, কেবল একটি UX বিরক্তি নয়।

সমাধান: কোন read-গুলির consistency প্রয়োজনীয়তা আছে তা শনাক্ত করুন এবং সেগুলি primary-তে route করুন।

**যে read replica-তে যেতে পারে** (eventual consistency ঠিক আছে):
- একটি রেস্তোরাঁর menu browse করা গ্রাহক (১-২ সেকেন্ড stale অদৃশ্য)
- Order history query (এক মিনিট আগের order history দেখা একজন ব্যবহারকারী)
- Analytics-ধরনের read (এই সপ্তাহের শীর্ষ রেস্তোরাঁ)

**যে read primary-তে যেতে হবে** (read-after-write consistency প্রয়োজন):
- একটি write-এর ঠিক পরে, যখন application-কে write সফল হয়েছে নিশ্চিত করতে হবে
- order placement-এর ঠিক পরে order status read
- রেস্তোরাঁ management interface দ্বারা trigger করা menu read (রেস্তোরাঁ সবেমাত্র menu পরিবর্তন করেছে)

Application database connection layer-এ একটি routing hint যোগ করল: request রেস্তোরাঁ management dashboard থেকে এলে, primary-তে route করুন। একজন গ্রাহক browse করা থেকে এলে, replica-তে route করুন। `X-Read-Consistency: strong` HTTP header signal হিসেবে কাজ করত।

"এটা তেমন কঠিন নয়," Leo বলল। "আপনাকে শুধু জানতে হবে কোন read-গুলির এটা প্রয়োজন।"

"এবং এটা নথিভুক্ত করুন," Priya বলল। "যাতে পরবর্তী ব্যক্তি যে একটি নতুন endpoint যোগ করে জানে কোন pool ব্যবহার করতে হবে।"

"এটার মাসে কত খরচ?" Tom জিজ্ঞেস করল। এটা ছিল যেকোনো নতুন service-এর জন্য তার standard opening প্রশ্ন।

একই instance type-এর একটি read replica primary-র মতো একই খরচ। $340/মাস থেকে $680/মাস।

"আমরা প্রায় load অর্ধেক করতে cost দ্বিগুণ করলাম," Tom বলল।

"হ্যাঁ। কিন্তু বিকল্প ছিল একটি বড় instance type-এ যাওয়া, যা বেশি খরচ করত এবং read load distribute করত না।"

Tom হিসাব করল। সে অনিচ্ছায় মাথা নাড়ল।

"Primary ব্যর্থ হলে কী?" Tom Aurora-তে pivot করার আগে Maya জিজ্ঞেস করল। "Read replica-র কী হয়?"

Leo replica promotion ব্যাখ্যা করল।

**Primary RDS instance ব্যর্থ হলে**, AWS স্বয়ংক্রিয়ভাবে Multi-AZ configuration-এর standby replica-তে failover করে (একটি ভিন্ন ধরনের replica — একটি synchronous standby, একটি read replica নয়)। Multi-AZ standby নতুন primary হয়ে যায়। Read replica read পরিবেশন করতে থাকে, এখন নতুন primary থেকে replicate করছে। Application-এর দৃষ্টিকোণ থেকে, primary endpoint DNS পূর্ববর্তী standby-কে নির্দেশ করতে পরিবর্তন হয়, এবং application reconnect করে।

Failover সাধারণত RDS PostgreSQL-এর জন্য ৬০-১২০ সেকেন্ড নেয়। সেই window-এর সময়, write ব্যর্থ হয়।

**Read replica promotion** একটি পৃথক operation — এবং একটি পৃথক scenario। আপনি একটি read replica নিয়ে এটাকে একটি স্বতন্ত্র, writable database করতে চাইলে (DR-এর জন্য, একটি নতুন region-এ migration-এর জন্য, বা কারণ primary চলে গেছে এবং আপনার Multi-AZ failover-এর জন্য অপেক্ষা না করে promote করতে হবে), আপনি একটি read replica-কে একটি standalone primary-তে promote করতে পারেন। Promotion কয়েক মিনিট নেয়, তারপর replica আর মূল primary থেকে replicate করছে না — এটা তার নিজস্ব database।

"আমরা কি ভেবেছি us-west-2 primary সম্পূর্ণভাবে ডাউন হলে কী হবে?" Priya জিজ্ঞেস করল। "শুধু Multi-AZ standby-তে একটি failover নয় — পুরো region।"

"Region ব্যর্থ হলে," Leo বলল, "Multi-AZ standby-ও us-west-2-এ। উভয় একসাথে ব্যর্থ হয়।"

"তাহলে একটি প্রকৃত regional DR scenario-এর জন্য," Tom বলল, "আমাদের us-east-1-এ একটি read replica দরকার যা আমরা promote করতে পারি।"

"হ্যাঁ। একটি cross-region read replica। আমাদের এখনও একটি নেই।"

"এটার মাসে কত খরচ?" Tom জিজ্ঞেস করল। সে ইতিমধ্যে জানত উত্তরে একটি সিদ্ধান্ত জড়িত থাকবে।

us-east-1-এ একটি db.r6g.large-এর একটি cross-region read replica: $340/মাস (একই instance cost)। Plus replication-এর জন্য cross-region data transfer: Nimbus-এর write volume-এ minimal। মোট: একটি DR replica-র জন্য প্রায় $350/মাস।

"সেটা বছরে $4,200," Tom বলল, "এমন একটি scenario-র বিরুদ্ধে রক্ষা করতে যা দশ বছরে AWS region-এ পাঁচবারেরও কম ঘটেছে।"

"এবং একটি regional event-এর সময় Nimbus ২৪ ঘণ্টা ডাউন থাকার cost?" Priya জিজ্ঞেস করল।

Tom হিসাব করল। সে জোরে উত্তর দিল না। কিন্তু সে DR backlog-এ "cross-region read replica" যোগ করল।

"Aurora কী?" সে জিজ্ঞেস করল।

**Amazon Aurora: Database Engine পুনর্ভাবনা করা**

Aurora হলো AWS-এর proprietary relational database engine, MySQL এবং PostgreSQL-এর সাথে সামঞ্জস্যপূর্ণ। এটা cloud workload-এর জন্য একদম শুরু থেকে design করা হয়েছিল, একটি relational database-এর storage layer কীভাবে কাজ করে তা পুনর্কল্পনা করে।

একটি ঐতিহ্যবাহী RDS setup-এ (MySQL, PostgreSQL), storage এবং compute শক্তভাবে coupled। Database engine data file পরিচালনা করে। Replication primary থেকে replica-তে data copy করে। Replica-কে প্রতিটি write operation redo করতে হবে।

এটা replication speed-এ একটি ceiling তৈরি করে: একটি replica শুধুমাত্র যত দ্রুত replication log process করতে পারে তত দ্রুত write প্রয়োগ করতে পারে। একটি write-heavy সময়ের সময় — একটি bulk import, একটি flash sale, একটি batch update — replica পিছিয়ে পড়তে পারে। Replication lag implementation-এ একটি ত্রুটি নয়; এটা architecture-এর একটি পরিণতি।

Leo read replica প্রস্তাব করার সময় Priya এটা সঙ্গে সঙ্গে flag করেছিল। "এবং আমরা কি ভেবেছি replication lag শুক্রবার rush-এর সময় ৩০ সেকেন্ডে spike করলে কী হবে? Replica ৩০ সেকেন্ড পিছনে। একজন গ্রাহক একটি order দেয়, kitchen slot primary-তে reserve হয়, কিন্তু replica query করা একজন দ্বিতীয় গ্রাহক reservation দেখে না। দুটি order, এক slot।"

"সেটা একটি inventory consistency সমস্যা," Leo বলল।

"সেটা ঠিক একটি inventory consistency সমস্যা," Priya নিশ্চিত করল। "এই কারণেই inventory read — 'এই item কি এখনও উপলব্ধ?' — primary-তে যেতে হবে।"

Aurora-র architecture lag সরাসরি address করে।

Aurora storage-কে compute থেকে আলাদা করে। এটা একটি distributed, fault-tolerant storage layer ব্যবহার করে যা তিনটি Availability Zone জুড়ে ছয়টি copy-তে data স্বয়ংক্রিয়ভাবে replicate করে। Compute layer (database instance) এই storage layer-এর উপরে বসে।

**এটা যা পরিবর্তন করে**:

**Read replica**: Aurora replica-কে data replicate করতে হয় না — তারা ইতিমধ্যে একই storage layer শেয়ার করে। এর মানে:

- সর্বোচ্চ ১৫টি Aurora Replica যা storage volume শেয়ার করে (নিয়মিত RDS-ও সর্বোচ্চ ১৫টি read replica অনুমতি দেয়, কিন্তু প্রতিটি একটি পূর্ণ data copy)
- Replication lag সাধারণত ১০০ মিলিসেকেন্ডের নিচে (load-এর অধীনে RDS-এর জন্য সেকেন্ডের বিপরীতে)
- Replica ৩০ সেকেন্ডের নিচে primary-তে promote করা যায় (মিনিটের বিপরীতে)

**Failover**: কারণ replica storage শেয়ার করে, failover অনেক দ্রুত — promotion-এ data transfer জড়িত নয়, শুধু write পুনর্নির্দেশনা।

**Storage**: Aurora স্বয়ংক্রিয়ভাবে 10GB বৃদ্ধিতে storage scale করে, 128 TiB পর্যন্ত (সাম্প্রতিক engine version-এ 256 TiB)। আপনি কখনো আগাম storage provision করেন না।

**Performance**: Aurora সমতুল্য instance type-এর জন্য standard MySQL-এর 5x throughput এবং standard PostgreSQL-এর 3x দাবি করে।

আপনি হয়তো ভাবছেন: সমস্ত replica একই storage শেয়ার করলে, সেই storage কি একটি single point of failure হয়ে যায় না? Aurora-র storage layer তিনটি Availability Zone-এ ছয়টি copy-তে data স্বয়ংক্রিয়ভাবে replicate করে। Storage নিজেই যেকোনো single RDS Multi-AZ setup-এর চেয়ে বেশি resilient — এটা শূন্য data loss এবং কোনো failover প্রয়োজন ছাড়াই একটি সম্পূর্ণ AZ-এর ক্ষতি থেকে বেঁচে থাকার জন্য design করা।

একটি দ্বিতীয় সাধারণ প্রশ্ন: Aurora MySQL/PostgreSQL compatible হলে, আপনি কি application কোড পরিবর্তন না করে RDS PostgreSQL থেকে Aurora PostgreSQL-এ migrate করতে পারেন? প্রায়। Aurora PostgreSQL compatibility মানে Aurora PostgreSQL wire protocol implement করে এবং অধিকাংশ PostgreSQL SQL syntax এবং feature সমর্থন করে। বেশিরভাগ application শূন্য কোড পরিবর্তন সহ migrate করে। edge case: অল্প সংখ্যক PostgreSQL extension Aurora-তে উপলব্ধ নয়, কিছু system catalog query ভিন্ন value return করে, এবং নির্দিষ্ট administrative operation ভিন্ন। production migration-এর জন্য, write switch করার আগে parallel read traffic দিয়ে test করুন।

Nimbus-এর জন্য, RDS PostgreSQL থেকে Aurora PostgreSQL-এ migration একটি বিকেল নিল। Application Aurora endpoint-এ নির্দেশ করল। Menu query — Leo Performance Insights database load-এর শীর্ষ consumer হিসেবে নির্দেশ করা index যোগ করার পরে — 620ms-এর পরিবর্তে 4ms-এ চলল। Connection pool আর ২০০-এর মধ্যে ১৯৮-এ পৌঁছাল না। P95 latency 28ms-এ নেমে এল।

"এটা একটি ভিন্ন database engine," Leo বলল, "যাকে application একই database engine মনে করে।"

"আর আকর্ষণীয় অংশটি?" Maya জিজ্ঞেস করল।

"দ্রুত database cloning।"

"নোট করা," ঘরের অন্য পাশ থেকে Sam শান্তভাবে বলল, ইতিমধ্যে টাইপ করছে। Sam একজন backend engineer ছিল যে কয়েক সপ্তাহ আগে Leo-র থালা থেকে কিছু database কাজ নিতে দলে যোগ দিয়েছিল। কেউ জিজ্ঞেস করল না সে কী করছিল।

**Aurora মূল্য নির্ধারণ: Tom-এর প্রশ্ন**

Aurora মূল্য নির্ধারণ RDS-এর থেকে ভিন্ন:

**Instance মূল্য**: type অনুযায়ী RDS instance মূল্যের অনুরূপ।

**Storage মূল্য**: প্রতি GB প্রতি মাসে $0.10 (আপনি যা store করা তার জন্য পেমেন্ট করেন, স্বয়ংক্রিয়ভাবে scale করা)।

**I/O মূল্য**: Aurora প্রতি I/O request (storage-এ read/write) চার্জ করে। write-heavy workload-এর জন্য এটা উল্লেখযোগ্য হতে পারে।

"দাঁড়াও," Tom বলল। "আমরা I/O-র জন্য আলাদাভাবে পেমেন্ট করছি?"

"Aurora Serverless v2 এবং Aurora I/O-Optimized এই মূল্য মডেল পরিবর্তন করে," Leo বলল। "Aurora I/O-Optimized কোনো I/O fee চার্জ করে না কিন্তু উচ্চতর storage এবং instance মূল্য। I/O-heavy workload-এর জন্য ভালো।"

Tom trade-off দেখল। Nimbus-এর জন্য, যা read-heavy ছিল (প্রচুর menu query, কম write), Aurora I/O-Optimized বেশি খরচ হতে পারে। Standard Aurora মূল্য উপযুক্ত হতে পারে।

একটি দরকারী heuristic: আপনার I/O চার্জ আপনার মোট Aurora বিলের মোটামুটি ২৫% অতিক্রম করলে, I/O-Optimized সম্ভবত সস্তা। Nimbus-এর read-heavy workload-এর জন্য, I/O চার্জ কম ছিল — standard মূল্য প্রযোজ্য। একটি event logging system-এর মতো একটি write-heavy workload-এর জন্য, I/O-Optimized উল্লেখযোগ্যভাবে cost কমাতে পারত।

এটা একটি প্রকৃত cost সিদ্ধান্ত যা senior engineer-রা করে: সঠিকভাবে বেছে নিতে আপনাকে আপনার workload-এর I/O pattern জানতে হবে।

আপনার workload ছোট, স্থিতিশীল, এবং পূর্বানুমেয় হলে, RDS PostgreSQL সহজ এবং অর্থপূর্ণভাবে সস্তা — কিন্তু আপনার traffic অপ্রত্যাশিত হলে, আপনার data volume আগাম provision করতে পারার বাইরে বাড়লে, বা আপনার ৩০ সেকেন্ডের নিচে automatic failover প্রয়োজন হলে, Aurora-র shared storage মডেল উচ্চতর base cost justify করে।

**Aurora Serverless: Instance নিয়ে না ভেবে Scaling**

**Aurora Serverless v2** হলো একটি configuration যা প্রকৃত database load-এর উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে compute capacity scale করে। একটি নির্দিষ্ট instance size (db.r6g.large) বেছে নেওয়ার পরিবর্তে, আপনি Aurora Capacity Units (ACUs)-এ একটি minimum এবং maximum capacity সেট করেন।

Aurora Serverless v2:

- load বাড়লে সেকেন্ডে scale up করে
- নিষ্ক্রিয় সময়ে scale down করে — এবং ২০২৪-এর শেষ থেকে, কোনো connection না থাকলে 0 ACU পর্যন্ত auto-pause করতে পারে (resume প্রায় ১৫ সেকেন্ড নেয়; auto-pause RDS Proxy বা অন্য connection-holding proxy-র সাথে কাজ করে না)
- খরচ: প্রতি ACU-hour $0.12 (plus storage এবং I/O)

পরিবর্তনশীল traffic সহ workload-এর জন্য — Nimbus-এর শুক্রবার spike বনাম সোমবার সকালের নীরবতা — Serverless v2 off-peak সময়ে cost কমায় এবং pre-provisioning ছাড়াই peak handle করে।

"তাহলে শুক্রবার spike-এর সময়," Leo বলল, "Aurora স্বয়ংক্রিয়ভাবে scale up করে। রবিবার সকালে যখন আমাদের প্রায় কোনো traffic নেই, এটা minimum-এ ফিরে scale করে।"

"এবং আমরা শুধুমাত্র যে capacity ব্যবহার করছি তার জন্য পেমেন্ট করি," Tom বলল।

"সঠিক।"

Aurora Serverless v2-তে এক মাস পর, Leo আগের সপ্তাহের ACU (Aurora Capacity Unit) graph টেনে আনল।

Graph দুটি স্বতন্ত্র pattern দেখাল। সপ্তাহের সময়, database ২-৪ ACU-তে চলত — background query, ECS health check, Glue ETL job, এবং development testing-এর একটি শান্ত গুঞ্জন। শুক্রবার সন্ধ্যায় ১৮:০০ এবং ২২:০০-এর মধ্যে, ACU count উঠল:

```
Friday 18:00  → 6 ACUs
Friday 19:00  → 14 ACUs
Friday 19:45  → 26 ACUs  (peak — pizza orders spike before NFL kickoff)
Friday 20:30  → 18 ACUs
Friday 21:00  → 12 ACUs
Friday 22:30  → 4 ACUs
Saturday 02:00 → 2 ACUs  (minimum)
```

Scaling প্রায়-তাৎক্ষণিক ছিল — Aurora Serverless v2 0.5 ACU বৃদ্ধিতে scale করে, এবং এটা একটি নতুন RDS instance provision করতে প্রয়োজনীয় মিনিটের পরিবর্তে সেকেন্ডে capacity যোগ করতে পারে।

"সেই শুক্রবার peak কত খরচ করল?" Tom জিজ্ঞেস করল।

প্রতি ACU-hour $0.12-এ: শুক্রবার peak ছিল ৪ ঘণ্টা গড়ে ১৮ ACU → peak সময়ের জন্য $8.64। বাকি সপ্তাহ গড়ে ৩ ACU × ১৬৪ ঘণ্টা × $0.12 = $59.04। সপ্তাহের মোট: $67.68।

শুক্রবার peak handle করার সমতুল্য provisioned instance (db.r6g.xlarge, ৪ vCPU, 32 GB) খরচ করত $0.937/hour × ১৬৮ ঘণ্টা = সপ্তাহের জন্য **$157.42** — শুক্রবারের peak কখনো বাস্তবায়িত হোক বা না হোক।

"Serverless v2 সপ্তাহের জন্য $67। peak-এর জন্য আকার দেওয়া একটি provisioned instance $157," Tom বলল। "সেটা ৫৭% হ্রাস।"

"একটি database-এ যা বৈধভাবে শুক্রবার চার ঘণ্টার জন্য 26 ACU এবং বাকি সপ্তাহের জন্য 2 ACU ব্যবহার করে," Leo বলল। "আপনার database সারা সপ্তাহ ধারাবাহিক high load-এ চললে, একটি provisioned instance সস্তা। সাশ্রয় variability থেকে আসে।"

Tom ধীরে মাথা নাড়ল। সে এটা তার নোটে একটি pattern-এ যোগ করছিল: এই quarter-এর প্রতিটি সাশ্রয় গল্পের একই আকার ছিল। আপনি যা ব্যবহার করেন তার জন্য পেমেন্ট করেন, যা প্রয়োজন হতে পারে তার জন্য নয়। S3 lifecycle policy শুধুমাত্র প্রতিটি object যে storage class warranted তার জন্য পেমেন্ট করত। Lambda শুধুমাত্র invocation time-এর জন্য পেমেন্ট করত। Fargate শুধুমাত্র task CPU এবং memory-র জন্য পেমেন্ট করত। Aurora Serverless v2 শুধুমাত্র database আসলে যে ACU consume করত তার জন্য পেমেন্ট করত।

Tom-এর সেই অভিব্যক্তি ছিল যে ঠিক যা খুঁজছিল তা খুঁজে পেয়েছে।

**একটি খারাপ Migration থেকে পুনরুদ্ধার: Clone, PITR, এবং Undo বোতাম**

Aurora-তে যাওয়ার দুই সপ্তাহ পর, Sam production-এ একটি database migration script চালাল। Script-টির `menu_items` table থেকে `legacy_menu_format` column সরানোর কথা ছিল। সে এটা WHERE clause ছাড়াই চালাল যা সে ভেবেছিল অন্তর্ভুক্ত করেছিল।

ফলাফল একটি column সরানো ছিল না। এটা ছিল একটি DELETE statement যা `menu_items` table থেকে ৪০,০০০ row পরিষ্কার করল — প্রায় ২০০টি রেস্তোরাঁর menu data, চলে গেল।

Alert ৩০ সেকেন্ডের মধ্যে fire হল। Order failure spike করল। Menu service ২০০টি রেস্তোরাঁর জন্য খালি ফলাফল return করতে শুরু করল।

"এটার একটি WHERE clause থাকার কথা ছিল," Sam console-এর দিকে তাকিয়ে বলল।

ঐতিহ্যবাহী recovery path: সবচেয়ে সাম্প্রতিক automated backup snapshot থেকে restore করুন। Automated backup প্রতি ২৪ ঘণ্টায় একবার চলে, এবং একটি পূর্ণ restore-and-swap ২০-৪০ মিনিট নিত — যার সময় *সমস্ত* রেস্তোরাঁ অন্ধকার থাকত, শুধু প্রভাবিত ২০০টি নয় — এবং backup-এর পর থেকে দেওয়া প্রতিটি order হারিয়ে যেত।

Leo সেটা করল না। Standard RDS-এর মতো, Aurora **point-in-time recovery (PITR)**-এর জন্য continuous backup রাখে — আপনি cluster-কে backup retention window-এর মধ্যে যেকোনো সেকেন্ডে restore করতে পারেন, শুধু শেষ nightly snapshot-এ নয়। এবং গুরুত্বপূর্ণভাবে, restore একটি *নতুন* cluster তৈরি করে; আপনি পুনরুদ্ধার করার সময় production চালু থাকে।

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

Timestamp: 15:42:00Z — Sam migration script চালানোর চার মিনিট আগে। Recovery cluster spin up হওয়ার সময়, বাকি production অপ্রভাবিত রেস্তোরাঁগুলি পরিবেশন করতে থাকল। এটা উপলব্ধ হলে, Leo recovery cluster থেকে ২০০টি প্রভাবিত রেস্তোরাঁর জন্য `menu_items` row dump করল এবং সেগুলি production-এ ফিরে insert করল। Alert থেকে সম্পূর্ণ restore করা menu পর্যন্ত মোট সময়: ৪০ মিনিটের কিছু কম — এবং কারণ সে পুরো database swap করার পরিবর্তে row-গুলি surgically মেরামত করল, 15:42-এর পরে দেওয়া কোনো order হারায়নি। Recovery cluster পরে delete করা হয়েছিল; এটা তার উদ্দেশ্য পূরণ করেছিল।

"আমরা কী হারালাম?" Maya জিজ্ঞেস করল।

সংক্ষিপ্তভাবে-খালি menu-র বিরুদ্ধে দেওয়া ছয়টি order checkout-এ ব্যর্থ হয়েছিল — সেগুলির সবগুলি SQS queue-তে ছিল এবং replay করা যেত। কোনো customer data স্থায়ীভাবে হারায়নি।

"এবং এখানেই **দ্রুত database cloning** আসে," Leo দলকে পরে একত্রিত করে বলল। Aurora copy-on-write ব্যবহার করে database আকার নির্বিশেষে কয়েক মিনিটে একটি cluster-এর একটি **clone** তৈরি করতে পারে: clone মূলের storage layer শেয়ার করে এবং শুধুমাত্র নতুন বা পরিবর্তিত page অতিরিক্ত স্থান consume করে। বর্তমান production database-এর একটি clone সস্তা, দ্রুত, এবং সম্পূর্ণভাবে isolated — clone-এ write কখনো production স্পর্শ করে না।

"যার মানে," Priya Sam-এর দিকে তাকিয়ে বলল, "migration script production-এ চালানোর আগে production data-র একটি clone-এর বিরুদ্ধে test করা হয়। সেটাই নতুন নিয়ম।"

Sam মাথা নাড়ল। সে ইতিমধ্যে এটা একটি sticky note-এ লিখেছিল।

আরও একটি tool এই চিত্রে অন্তর্গত। Aurora MySQL — Aurora PostgreSQL নয় — এর **Aurora Backtrack** আছে: একটি feature যা cluster-কে একটি নির্দিষ্ট point in time-এ *in place* rewind করে, একটি নতুন cluster-এ restore না করেই। Nimbus-এর cluster Aurora MySQL হলে, Leo এটাকে তিন মিনিটের নিচে 15:42-তে backtrack করতে পারত — যদিও পুরো cluster rewind করা deletion-এর পরে লেখা মুষ্টিমেয় বৈধ order-ও rollback করত, যা surgical PITR পদ্ধতি সংরক্ষণ করেছিল।

"এবং কেউ যদি Backtrack — বা একটি point-in-time restore — ব্যবহার করে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "একজন attacker কি audit log বা compliance data rewind করতে পারে?"

Backtrack-এর `rds:BacktrackDBCluster` API permission প্রয়োজন, এবং restore-এর `rds:RestoreDBClusterToPointInTime` প্রয়োজন — সাধারণ database operation থেকে পৃথক IAM action। Standard application role-এর এই permission নেই। শুধুমাত্র operations team, তাদের অনুমতি দেওয়া explicit IAM policy সহ, সেগুলি ব্যবহার করতে পারত। সে এটা IAM permission review checklist-এ যোগ করল।

গুরুত্বপূর্ণ caveat: Aurora Backtrack শুধুমাত্র Aurora MySQL-compatible cluster-এর জন্য উপলব্ধ, PostgreSQL নয়। Backtrack window cluster creation-এ configure করা হয় (১ ঘণ্টা থেকে ৭২ ঘণ্টা, backtrack window-এর প্রতি ঘণ্টায় চার্জ)। এবং Backtrack পুরো cluster প্রভাবিত করে — আপনি একটি table বা এক set row Backtrack করতে পারবেন না। surgical row-level recovery-র জন্য — যেকোনো engine-এ — Leo যে PITR-to-a-temporary-cluster পদ্ধতি ব্যবহার করেছিল তা হলো tool।

**Aurora Global Database: Multi-Region Read**

**Aurora Global Database** একাধিক AWS region জুড়ে Aurora প্রসারিত করে:

- **একটি primary region** সমস্ত write handle করে
- **পাঁচটি পর্যন্ত secondary region** সাধারণত <১ সেকেন্ড replication lag সহ read পরিবেশন করে
- Secondary region ১ মিনিটের নিচে primary-তে promote করা যায় (DR scenario-র জন্য)

Nimbus-এর global expansion-এর জন্য, Aurora Global Database লন্ডনের একজন রেস্তোরাঁ partner-কে EU read replica থেকে তাদের local menu query করতে দিত, যখন সমস্ত order (write) এখনও US primary-র মাধ্যমে যায়।

**RDS বনাম Aurora: কখন কোনটি বেছে নেবেন**

| ফ্যাক্টর           | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| খরচ              | ছোট workload-এর জন্য কম       | উচ্চতর base, কিন্তু আরও ভালো scale করে                    |
| সামঞ্জস্য         | সম্পূর্ণ                      | MySQL/PostgreSQL compatible (সামান্য পার্থক্য সহ)         |
| সর্বোচ্চ replica  | ১৫ (প্রতিটি একটি পূর্ণ data copy) | ১৫ (shared storage volume)                              |
| Replica lag      | সেকেন্ড হতে পারে               | সাধারণত <100ms                                             |
| Storage          | নির্দিষ্ট provisioning          | 128 TiB পর্যন্ত auto-scale (সাম্প্রতিক version-এ 256 TiB)  |
| Failover সময়     | ৬০-১২০ সেকেন্ড                | <৩০ সেকেন্ড                                                |
| Serverless option | সীমিত                         | Aurora Serverless v2                                       |
| সর্বোত্তম         | স্থিতিশীল, পূর্বানুমেয় workload | পরিবর্তনশীল traffic, উচ্চ read volume, দ্রুত failover-এর প্রয়োজন |

**Relational ছাড়িয়ে: Purpose-Built পরিবার**

অধ্যায় ৯ DocumentDB (MongoDB-compatible document), Neptune (graph relationship), এবং Keyspaces (Cassandra-compatible wide-column) পরিচয় করিয়েছিল, এবং অধ্যায় ১০ MemoryDB (durable Redis-compatible primary database) পরিচয় করিয়েছিল। আরও দুটি নাম পরিবারটি সম্পূর্ণ করে — আপনার সেগুলিতে গভীরতা প্রয়োজন নেই, শুধু কোন data shape কোন engine-এর দিকে নির্দেশ করে তা চিনতে পারার ক্ষমতা, কারণ তারা ক্রমাগত answer option হিসেবে আসে:

- **Amazon Timestream**: **time-series** data — sensor reading, metric, telemetry। পরীক্ষার সংকেত: "সময়ের সাথে IoT measurement।" (বাস্তব জগতে বর্তমান offering হলো Timestream for InfluxDB; মূল "LiveAnalytics" flavor ২০২৫-এ নতুন গ্রাহকদের জন্য বন্ধ হয়ে গেছে।)
- **Amazon QLDB**: আপনি এখনও পুরানো প্রশ্নে এটাকে "immutable, cryptographically verifiable ledger" হিসেবে দেখতে পারেন। AWS ২০২৫-এ QLDB বন্ধ করেছে (পরিবর্তে Aurora PostgreSQL সুপারিশ করে) — এটাকে একটি legacy distractor হিসেবে treat করুন, একটি building block নয়।

whiteboard-এ লেখার মতো নিয়ম: **relational row → RDS/Aurora; scale-এ key-value → DynamoDB; document → DocumentDB; relationship → Neptune; time → Timestream; Cassandra → Keyspaces; durable Redis → MemoryDB।** shape মেলান, এবং প্রশ্ন নিজেই উত্তর দেয়।

## শক্তি এবং সীমাবদ্ধতা

**Aurora শক্তি**:

- standard RDS-এর চেয়ে উল্লেখযোগ্যভাবে দ্রুত failover
- ন্যূনতম lag সহ সর্বোচ্চ ১৫টি read replica
- auto-scaling storage
- পরিবর্তনশীল workload-এর জন্য Serverless v2
- multi-region deployment-এর জন্য Global Database

**Aurora সীমাবদ্ধতা**:

- ছোট, স্থিতিশীল workload-এর জন্য উচ্চতর খরচ
- write-heavy workload-এর জন্য I/O মূল্য উল্লেখযোগ্য হতে পারে (এর জন্য I/O-Optimized ব্যবহার করুন)
- সামান্য MySQL/PostgreSQL সামঞ্জস্য পার্থক্য কোড পরিবর্তন প্রয়োজন হতে পারে
- Serverless v2 auto-pause থেকে resume (প্রায় ১৫ সেকেন্ড) এবং দ্রুত scale-up latency spike সৃষ্টি করতে পারে

## সারসংক্ষেপ

অধ্যায় ২৩-এর S3 lifecycle কাজ data-কে সঠিক storage tier-এ সরিয়ে cost কমিয়েছিল। Aurora compute-এর জন্য সমতুল্য করে: peak load-এর জন্য provision করে এবং সবসময় এর জন্য পেমেন্ট করার পরিবর্তে, Serverless v2 demand-এর সাথে মিলিয়ে scale করে।

- **Read replica** primary থেকে read traffic বিতরণ করে। Asynchronous replication — বেশিরভাগ read-এর জন্য সামান্য lag গ্রহণযোগ্য। যে read-এর write consistency প্রয়োজন (write-এর ঠিক পরে read, admin interface read) সেগুলি primary-তে route করুন, replica-তে নয়।
- **Aurora** storage layer পুনর্কল্পনা করে: distributed, replica জুড়ে shared, auto-scaling।
- Aurora offer করে: ১৫টি read replica, <100ms replica lag, <30s failover, 128 TiB পর্যন্ত (সাম্প্রতিক version-এ 256 TiB) auto-scaling storage।
- **Performance Insights**: কীভাবে scale করতে হবে তা সিদ্ধান্ত নেওয়ার আগে database load সৃষ্টিকারী নির্দিষ্ট SQL query শনাক্ত করুন। একটি অনুপস্থিত index একটি বড় instance-এর প্রয়োজন দূর করতে পারে।
- **CloudWatch database metric**: DatabaseConnections (saturation-এর কাছাকাছি মানে application connection pooling ভাঙা), CPUUtilization (টেকসই high CPU মানে ব্যয়বহুল query), ReadLatency (সময়ের সাথে অবনতি প্রায়ই একটি অনুপস্থিত index সহ একটি বর্ধনশীল table)।
- **Aurora Serverless v2**: 0.5 ACU বৃদ্ধিতে compute auto-scale করে। প্রতি ACU-hour চার্জ করা। peak এবং off-peak-এর মধ্যে উচ্চ variability সহ workload-এর জন্য provisioned instance-এর চেয়ে উল্লেখযোগ্যভাবে সস্তা।
- **Point-in-time recovery (PITR)**: backup retention window-এর মধ্যে যেকোনো সেকেন্ডে একটি Aurora cluster restore করুন — একটি *নতুন* cluster-এ, যাতে আপনি surgically হারানো row ফিরে copy করার সময় production চালু থাকে।
- **দ্রুত database cloning**: আকার নির্বিশেষে কয়েক মিনিটে একটি cluster-এর copy-on-write clone। সস্তা, isolated — production-এ চালানোর আগে production data-র বিরুদ্ধে migration test করতে এটা ব্যবহার করুন।
- **Aurora Backtrack** (শুধুমাত্র MySQL-compatible — PostgreSQL নয়): একটি backup থেকে restore না করে cluster-কে একটি point in time-এ in place rewind করুন। ৭২ ঘণ্টা পর্যন্ত window-এর জন্য উপলব্ধ। `rds:BacktrackDBCluster` IAM permission প্রয়োজন — operations team-এ সীমাবদ্ধ করুন।
- **Aurora Global Database**: একটি region-এ primary, পাঁচটি পর্যন্ত region-এ read replica।
- **Read replica promotion**: cross-region read replica regional DR-এর জন্য standalone primary-তে promote করা যায়। DR benefit-কে একটি দ্বিতীয় পূর্ণ instance চালানোর cost-এর বিপরীতে ভারসাম্য করুন।
- ছোট, স্থিতিশীল, পূর্বানুমেয় workload-এর জন্য RDS বেছে নিন। আপনার scale, দ্রুত failover, বা পরিবর্তনশীল traffic handling প্রয়োজন হলে Aurora বেছে নিন।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design High-Performing Architectures (ডোমেন ৩, টাস্ক ৩.৩)*

- **Aurora replica বনাম RDS read replica**: Aurora replica storage শেয়ার করে (প্রায়-শূন্য lag, <30s failover)। RDS read replica data replicate করে (lag সম্ভব, failover-এর জন্য মিনিট)।
- **Aurora Serverless v2**: "database capacity auto-scale করুন," "অপ্রত্যাশিত বা spiky database traffic" → Aurora Serverless v2। সতর্কতা: ঐতিহাসিকভাবে শুধুমাত্র Serverless **v1** শূন্যে scale করত; v2-এর minimum ২০২৪-এর শেষ পর্যন্ত 0.5 ACU ছিল, যখন v2 0 ACU-তে auto-pause পেল। পুরানো পরীক্ষার প্রশ্ন এখনও ধরে নিতে পারে v2 শূন্যে scale করতে পারে না।
- **Aurora Global Database**: "multi-region database," "US primary থেকে কম latency সহ EU থেকে read করুন," "regional failover-এর জন্য RTO < ১ মিনিট" → Aurora Global Database।
- **Failover timing**: Aurora < ৩০ সেকেন্ড। RDS Multi-AZ ৬০-১২০ সেকেন্ড। উভয় জানুন।
- **Data shape অনুযায়ী purpose-built database**: "social graph / recommendation / fraud ring" → Neptune। "MongoDB" → DocumentDB। "Cassandra" → Keyspaces। "time series / IoT telemetry" → Timestream। "Redis-compatible *primary* database (durable)" → MemoryDB (বনাম ElastiCache = cache)। "Immutable cryptographic ledger" → পুরানো প্রশ্নে QLDB (২০২৫-এ বন্ধ)।
- **Aurora I/O-Optimized**: উচ্চতর storage এবং instance cost, কোনো per-I/O চার্জ নেই। I/O cost আধিপত্য করলে ব্যবহার করুন (write-heavy)। Standard Aurora: কম storage cost, প্রতি I/O পেমেন্ট। read-heavy-র জন্য ব্যবহার করুন।
- **Aurora Backtrack**: একটি backup snapshot থেকে restore না করে database-কে একটি নির্দিষ্ট point in time-এ in place rewind করুন। শুধুমাত্র MySQL-compatible Aurora-র জন্য উপলব্ধ — Aurora PostgreSQL-এর জন্য, উত্তর হলো point-in-time restore (একটি নতুন cluster-এ) বা একটি দ্রুত clone। পরীক্ষার সংকেত: "ঘটনাক্রমে data delete করা হয়েছে, একটি পূর্ণ backup restore না করে দ্রুত পুনরুদ্ধার প্রয়োজন" + MySQL → Backtrack।
- **Aurora দ্রুত database cloning**: database আকার নির্বিশেষে কয়েক মিনিটে copy-on-write clone। পরীক্ষার সংকেত: "production data-র একটি copy-র বিরুদ্ধে দ্রুত এবং সস্তায় test করুন" → clone, snapshot-restore নয়।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

Aurora এবং standard RDS read replica-র মধ্যে পার্থক্য ব্যাখ্যা করুন। Aurora-র replication lag সাধারণত কম কেন?

*(ইঙ্গিত: মূল পার্থক্য হলো shared storage বনাম data replication। একটি write আসলে প্রতিটি replica-কে কী করতে হবে তা নিয়ে ভাবুন।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি social media platform-এর MySQL database বর্ধমান traffic-এর কারণে high read latency অনুভব করছে। Application read-heavy (৯৫% read, ৫% write)। দলের traffic spike-এর সময়ও read latency সামঞ্জস্যপূর্ণ হওয়া প্রয়োজন। তাদের ন্যূনতম downtime সহ automatic failover প্রয়োজন (target RTO < ৩০ সেকেন্ড)। Data volume অপ্রত্যাশিতভাবে বাড়ছে।

কোন database সমাধান এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) পাঁচটি read replica সহ RDS MySQL Multi-AZ  
B) Aurora Replicas এবং Aurora Serverless v2 সহ Aurora MySQL  
C) একটি বড় instance type (vertical scaling) সহ RDS MySQL  
D) read caching-এর জন্য DynamoDB DAX সহ DynamoDB

**ইঙ্গিত ১**: "RTO < ৩০ সেকেন্ড" — কোন service এটা অর্জন করে? প্রতিটি option-এর failover timing check করুন।

**ইঙ্গিত ২**: "spike-এর সময় সামঞ্জস্যপূর্ণ read latency" — কোন service-এর replica-র প্রায়-শূন্য lag বনাম সম্ভাব্য সেকেন্ডের lag আছে?

**ইঙ্গিত ৩**: "অপ্রত্যাশিতভাবে বর্ধনশীল data volume" — কোন service storage auto-scale করে?

**উত্তর**: B

**ব্যাখ্যা**: Aurora Replicas সহ Aurora MySQL load-এর অধীনে সামঞ্জস্যপূর্ণ read performance-এর জন্য প্রায়-শূন্য replication lag (সেকেন্ড নয়, মিলিসেকেন্ড) প্রদান করে। Aurora Serverless v2 over-provisioning ছাড়াই traffic spike-এর সময় compute auto-scale করে। Aurora storage data বাড়ার সাথে auto-scale করে। Aurora failover (একটি replica-র promotion) ৩০ সেকেন্ডের নিচে সম্পূর্ণ হয় — RTO প্রয়োজনীয়তা পূরণ করে।

**কেন A নয়?** RDS Multi-AZ failover ৬০-১২০ সেকেন্ড নেয় — RTO < ৩০ সেকেন্ড পূরণ করে না। Standard RDS read replica lag load-এর অধীনে সেকেন্ডে পৌঁছাতে পারে — "সামঞ্জস্যপূর্ণ" read latency গ্যারান্টি করা কঠিন।

**কেন C নয়?** Vertical scaling (বড় instance) capacity বাড়ায় কিন্তু read load distribute করে না। Database read-এর জন্য একটি single point of failure থাকে।

**কেন D নয়?** DynamoDB হলো NoSQL — MySQL থেকে DynamoDB-তে migrate করতে data model এবং application query পুনর্নকশা প্রয়োজন, যা এই performance improvement task-এর সুযোগের অনেক বাইরে।

*SAA-C03 ডোমেন: Design High-Performing Architectures — টাস্ক ৩.৩*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus একটি global expansion design করছে। তারা চায় East Coast, জার্মানি, এবং অস্ট্রেলিয়ার রেস্তোরাঁ partner-রা cross-region latency ছাড়াই তাদের নিজস্ব order data দ্রুত দেখুক। তবে, consistency বজায় রাখতে সমস্ত write একক us-west-2 primary-র মাধ্যমে যেতে হবে।

Aurora ব্যবহার করে database architecture design করুন। আপনি Global Database কীভাবে গঠন করবেন — উদাহরণস্বরূপ, us-east-1, eu-central-1, এবং ap-southeast-2-তে secondary cluster? us-west-2 primary ডাউন হলে কী হয়? আপনি promotion process কীভাবে handle করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো multi-region database design অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Leo Serverless v2 সহ Aurora-তে migrate করল।

শুক্রবার spike এল এবং গেল। CPU কখনো ৬০% ছাড়াল না। Query latency সামঞ্জস্যপূর্ণ থাকল। Aurora স্বয়ংক্রিয়ভাবে load handle করতে scale up করেছিল, তারপর rush-এর পরে ফিরে scale করেছিল।

"গত শুক্রবারের তুলনায় এটা কত খরচ করল?" Tom সোমবার সকালে জিজ্ঞেস করল।

Leo billing explorer টেনে আনল। "শুক্রবার সন্ধ্যার peak জুড়ে গড়ে প্রায় $2.16/hour। শনিবার সকাল ছিল $0.24/hour।"

Tom কিছু বলল না।

"পুরানো setup load নির্বিশেষে একটি নির্দিষ্ট $0.47/hour ছিল," Leo যোগ করল।

"তাহলে আমরা spike-এর সময় আগের চেয়ে বেশি দিলাম," Tom বলল।

"হ্যাঁ। কিন্তু off-peak-এর সময় উল্লেখযোগ্যভাবে কম। সপ্তাহব্যাপী net cost কম।"

Tom হিসাব করল। তারপর মাথা নাড়ল।

"এখানে একটি শিক্ষা আছে," সে বলল। "সঠিক প্রশ্ন 'এটা কি সস্তা?' নয়। এটা হলো 'এটা কি আমাদের প্রকৃত ব্যবহারের pattern-এর জন্য সস্তা?'"

"সেটা," ঘরের অন্য পাশ থেকে Priya বলল, "একজন senior engineer-এর প্রবৃত্তি।"

Tom সেভাবে বর্ণিত হতে সামান্য শঙ্কিত দেখাল।

পরবর্তী অধ্যায়ে: যখন আপনার network হলো bottleneck, এবং কেন একটি private highway টোলের মূল্যবান হতে পারে।
