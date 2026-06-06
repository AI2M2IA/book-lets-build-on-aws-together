# অধ্যায় ২১: কোডের জন্য শিপিং কন্টেইনার

১৯৫৬ সালের আগে, একটি জাহাজে cargo লোড করা একটি দক্ষ এবং বিশেষায়িত আলোচনা ছিল। প্রতিটি জাহাজের ভিন্ন hold ছিল। প্রতিটি বন্দরের ভিন্ন crane ছিল। প্রতিটি carrier-এর কী কোথায় গেল তা ট্র্যাক করার জন্য ভিন্ন সিস্টেম ছিল। পণ্যের একটি crate truck থেকে dock থেকে জাহাজ থেকে dock থেকে truck-এ সরে যেত একগুচ্ছ মানুষের মধ্য দিয়ে যারা সবাই এটিকে ভিন্নভাবে handle করত। Cargo হারিয়ে যেত। Cargo ক্ষতিগ্রস্ত হত। একই পণ্য, দুবার পাঠানো, ভিন্ন অবস্থায় পৌঁছাত কারণ handling উভয়বার ভিন্ন ছিল।

উত্তর, যখন কেউ অবশেষে এটি স্পষ্টভাবে জিজ্ঞেস করল, ছিল: container মানসম্মত করুন। প্রতিটি বন্দরে সমস্যা সমাধান করবেন না। একবার সমাধান করুন, container স্তরে। বাক্সটি পাঠান, শুধু বিষয়বস্তু নয়।

মানসম্মত shipping container কেবল shipping দ্রুত করেনি। এটি shipping-কে *পূর্বানুমেয়* করেছিল। Shanghai-তে একটি container-এর বিষয়বস্তু Rotterdam-এ পৌঁছানোর সময় ঠিক একই অবস্থায় ছিল — কারণ container তাদের প্রতিটি transfer point-এ পরিবর্তনশীলতা থেকে রক্ষা করেছিল।

সেটা ঠিক একই সমস্যা যা Leo-র ছিল। Nimbus API প্রতিটি "বন্দরে" ভিন্নভাবে "লোড" হচ্ছিল: staging production থেকে ভিন্নভাবে deploy হত, instance এক instance তিন থেকে ভিন্নভাবে deploy হত, এবং ছয় সপ্তাহের undocumented পরিবর্তন fleet-কে অপ্রত্যাশিত করে তুলেছিল।

Container Leo-কে একটি দ্রুত developer করবে না। এটি deployment-কে পূর্বানুমেয় করবে।

---

Lambda migration ছোট service-গুলির জন্য EC2 বিল কমিয়েছিল। কিন্তু core API ভিন্ন ছিল — এটি ক্রমাগত চলত, সমস্ত order traffic বহন করত, এবং আট মাস ধরে configuration history সংগ্রহ করছিল। Lambda নিষ্ক্রিয়তা সমাধান করেছিল। Container অসামঞ্জস্য সমাধান করবে।

Core API নিষ্ক্রিয় ছিল না; এটি Lambda-তে সরতে পারত না। কিন্তু এর একটি ভিন্ন সমস্যা ছিল: এটি চালানো EC2 instance-গুলি একে অপরের থেকে বিচ্যুত হয়ে গিয়েছিল।

---

Leo "এটা আমার মেশিনে কাজ করে" জোরে না বলতে শিখেছিল। এটা একটি প্রতিরক্ষা ছিল না — এটা একটি নির্ণয় ছিল। এবং এবারের নির্ণয় ছিল production EC2 instance নম্বর তিন, যেটি ছয় সপ্তাহ আগে একটি library patch পেয়েছিল যা কেউ নথিভুক্ত করেনি, অন্য দুটি instance যা পায়নি, এবং যা এখন একটি bug সৃষ্টি করছিল যা শুধুমাত্র সেখানে, সেই একটি instance-এ বিদ্যমান, অন্য সর্বত্র অদৃশ্য।

সে আগের রাতে এটি ট্র্যাক করতে তিন ঘণ্টা কাটিয়েছিল।

"প্রতিবার যখন আমরা deploy করি," সে পরের সকালে বলল, "আমরা একাধিক instance জুড়ে সমন্বয় করি। নতুন version, ভিন্ন dependency। staging-এ কাজ করে, production-এ ভেঙে যায় কারণ environment-গুলি বিচ্যুত হয়ে গেছে।"

"কারণ কেউ অন্যগুলি আপডেট না করে instance তিনে একটি package আপডেট করেছে," Priya বলল। নির্দয়ভাবে নয়।

"আমার একটি নির্দিষ্ট version-এর প্রয়োজন ছিল—"

"আমি জানি," সে বলল। "এবং এখন instance তিনের instance এক এবং দুই থেকে একটি ভিন্ন history আছে। এটা configuration drift। এটা শান্ত থাকে যতক্ষণ না হয়।"

"প্রকৃত সমাধান কী?" Maya জিজ্ঞেস করল।

"server-গুলিকে স্থায়ী জিনিস হিসেবে treat করা বন্ধ করুন যা আপনি configure করেন," Priya বলল। "সেগুলিকে disposable unit হিসেবে treat করা শুরু করুন যা আপনি প্রতিস্থাপন করেন।"

**কন্টেইনার কী?**

"একটি shipping container-এর মতো করে ভাবুন," Leo একটি marker ধরে বলল। "Container পরোয়া করে না এটা কোন জাহাজে আছে। জাহাজ পরোয়া করে না container-এ কী আছে। তারা dimension এবং locking mechanism-এ একমত হয়েছে। বাকি সব বাক্সের ভিতরে।"

একটি **container** হলো একটি lightweight, portable unit যা আপনার application-কে চালানোর জন্য প্রয়োজনীয় সব কিছুর সাথে package করে: runtime (Python 3.11, Node.js 20, Java 17), library এবং dependency, configuration file, এবং application কোড নিজেই।

একটি virtual machine-এর বিপরীতে (যা operating system kernel সহ একটি সম্পূর্ণ কম্পিউটার emulate করে), একটি container host OS kernel শেয়ার করে বাকি সব বিচ্ছিন্ন রেখে। এটা container-গুলিকে দ্রুত শুরু করতে (সেকেন্ড, কখনো কখনো মিলিসেকেন্ড) এবং ছোট (মেগাবাইট, গিগাবাইট নয়) করে।

সবচেয়ে জনপ্রিয় container প্রযুক্তি হলো **Docker**। একটি Docker image হলো blueprint — application এবং তার environment-এর একটি snapshot। একটি Docker container হলো সেই image-এর একটি চলমান instance।

মূল property: **immutability**। আজ build করা একটি image Docker সমর্থন করে এমন যেকোনো host-এ অভিন্নভাবে চলবে — একটি laptop, একটি EC2 instance, একটি ভিন্ন data center-এর একটি server। Environment-টি bake করা। Configuration drift অসম্ভব।

"তাহলে EC2 instance-এ কী install আছে তা নিয়ে চিন্তা করার পরিবর্তে," Leo বলল, "আমরা একটি image build করি যাতে সব কিছু আছে। Image সর্বত্র একইভাবে চলে।"

"এবং আপনার এটি locally test করার প্রয়োজন হলে, আপনি একই image চালান," Priya যোগ করল। "আর 'এটা আমার মেশিনে কাজ করে' নয়।"

**Docker Image Build করা এবং ECR-এ Push করা**

কোনো orchestrator container পরিচালনা করার আগে, Leo-কে এটি build করতে এবং কোথাও store করতে হত যেখান থেকে ECS pull করতে পারে।

সে Dockerfile লিখল:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

মূল লাইন: `FROM python:3.11-slim`। Python 3.9 নয়। Python 3.10 নয়। 3.11 — যে নির্দিষ্ট version-এ দল একমত হয়েছিল, image-এ bake করা। এই image চালানো প্রতিটি instance ঠিক Python 3.11 ব্যবহার করবে। Decimal module-এর rounding আচরণ সর্বত্র অভিন্ন হবে।

সে image-টি locally build করল: `docker build -t nimbus-api:1.0.0 .`

Build ৪ মিনিট নিল। Docker base image pull করল, dependency install করল, application কোড copy করল, এবং `nimbus-api:1.0.0` tag করা একটি image উৎপন্ন করল।

সে এটি locally চালাল: `docker run -p 8000:8000 nimbus-api:1.0.0`

API শুরু হল। একই port, production server-এর মতো একই আচরণ — কারণ environment অভিন্ন ছিল।

তারপর সে এটি ECR-এ push করল:

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Tag the image for ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Push
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Push ২ মিনিট নিল। ECR image store করল, সঙ্গে সঙ্গে একটি image scan trigger করল, এবং ৫ মিনিটের মধ্যে ফলাফল report করল।

**Amazon ECS: অর্কেস্ট্রেটর**

একটি container চালানো সহজ। একাধিক host জুড়ে ডজনখানেক container চালানো, তাদের মধ্যে traffic route করা, ব্যর্থ container restart করা, downtime ছাড়াই নতুন version deploy করা — এর জন্য একটি **orchestrator** প্রয়োজন।

**Amazon ECS (Elastic Container Service)** হলো AWS-এর managed container orchestration service। আপনি সংজ্ঞায়িত করেন:

- **Task definition**: কোন container image চালাতে হবে, কতটা CPU এবং memory, কোন environment variable, কোন port expose করতে হবে
- **Service**: task-এর কতগুলি copy চালাতে হবে, failure এবং deployment কীভাবে handle করতে হবে
- **Cluster**: অন্তর্নিহিত compute অবকাঠামো

ECS বাকিটা handle করে: available capacity-তে task স্থাপন করা, ব্যর্থ task restart করা, deployment-এর সময় connection drain করা, load balancer-এর সাথে healthy task নিবন্ধন করা।

Nimbus-এর জন্য, API ম্যানুয়ালি পরিচালিত deployment সহ EC2 instance থেকে ECS-এ সরে গেল। প্রতিটি নতুন deployment একটি নতুন Docker image **Amazon ECR (Elastic Container Registry)**-তে push করল — AWS-এর managed container registry — এবং ECS শূন্য downtime সহ সমস্ত task জুড়ে এটি roll out করল।

**Fargate বনাম EC2 Launch Type**

ECS দুটি mode-এ container চালাতে পারে:

**EC2 launch type**: আপনি অন্তর্নিহিত EC2 instance পরিচালনা করেন। আপনি instance patch করা, সঠিক আকার দেওয়া, এবং আপনার container-এর জন্য যথেষ্ট capacity নিশ্চিত করার দায়িত্বে। বেশি নিয়ন্ত্রণ, বেশি দায়িত্ব।

**Fargate (container-এর জন্য serverless compute)**: AWS সম্পূর্ণরূপে অন্তর্নিহিত অবকাঠামো পরিচালনা করে। আপনি প্রতি task CPU এবং memory নির্দিষ্ট করেন; Fargate স্বয়ংক্রিয়ভাবে সঠিক capacity provision করে। কোনো EC2 instance পরিচালনা করার নেই। আপনি প্রতি vCPU-second এবং GB-second memory দেন।

Fargate হলো "serverless container" মডেল — আপনি server পরিচালনা না করে container-এর environment isolation পান। Trade-off: অন্তর্নিহিত instance configuration-এর উপর কম নিয়ন্ত্রণ এবং প্রতি ইউনিটে সামান্য বেশি খরচ।

"এটার মাসে কত খরচ?" Tom pricing calculator টেনে জিজ্ঞেস করল। "Fargate বনাম EC2 launch type — আমি প্রকৃত সংখ্যা দেখতে চাই।"

Leo-র অন্তর্জ্ঞানগত অনুমান — যেটা সবাই বহন করে — ছিল যে Fargate বেশি খরচ করবে। Serverless সুবিধা, premium দাম। সে অনুমান করল হয়তো EC2-এর চেয়ে বিশ বা ত্রিশ শতাংশ বেশি।

"প্রকৃত সংখ্যা চালাও," Tom বলল, কারণ সেটাই Tom।

Nimbus API service ৩টি task চালাত, প্রতিটির ০.৫ vCPU এবং 1GB memory প্রয়োজন, ২৪/৭:

**Fargate**: $0.04048/vCPU-hour × 0.5 × 3 × 720 ঘণ্টা = CPU-এর জন্য $43.72/মাস। $0.004445/GB-hour × 1 × 3 × 720 = memory-র জন্য $9.60/মাস। মোট: $53.32/মাস।

**EC2 launch type** (৩ × t3.medium @ $0.0416/hour): $0.0416 × 3 × 720 = $89.86/মাস।

"দাঁড়াও," Tom বলল। "Fargate সস্তা?"

"এই আকারে, হ্যাঁ," Leo বলল। "Fargate আপনি যা allocate করেন ঠিক তার জন্য চার্জ করে। EC2 instance-এর overhead আছে — OS এবং ECS agent আপনার container শুরু হওয়ার আগেই কিছু CPU এবং memory consume করে। একটি t3.medium ২ vCPU এবং 4GB দেয়, কিন্তু আপনি প্রতি container ০.৫ vCPU এবং 1GB ব্যবহার করছেন। বাকিটা নষ্ট।"

"কিন্তু EC2 launch type আপনাকে একটি instance-এ একাধিক task pack করতে দেয়।"

"হ্যাঁ। বড় scale-এ, সাবধান bin-packing সহ, EC2 launch type সস্তা হয়। আমাদের scale-এ — তিনটি task — Fargate জেতে।"

Tom এটা লিখে রাখল।

Nimbus-এর জন্য: API service-এর জন্য Fargate। তারা container-এর জন্য EC2 instance পরিচালনা করতে চায়নি।

আপনি Fargate দিয়ে containerize করলে, আপনি সমস্ত EC2 management overhead দূর করেন — কিন্তু আপনি instance type customize করার ক্ষমতা ছেড়ে দেন, যা GPU workload বা specialized networking-এর জন্য গুরুত্বপূর্ণ। আপনি AWS-native সরলতার জন্য ECS বেছে নিলে, আপনি শক্ত IAM এবং ALB integration পান — কিন্তু আপনি Kubernetes ecosystem থেকে বঞ্চিত হন, যার জন্য rearchitect করতে হবে যদি আপনার পরে multi-cloud portability প্রয়োজন হয়।

**Amazon EKS: যখন আপনার Kubernetes প্রয়োজন**

**Kubernetes** হলো একটি open-source container orchestration system — মূলত scale-এ container পরিচালনার industry standard। এটি শক্তিশালী, extensible এবং জটিল।

**Amazon EKS (Elastic Kubernetes Service)** হলো AWS-এর managed Kubernetes service। এটি আপনার জন্য Kubernetes control plane (management layer) চালায়, যখন আপনি worker node পরিচালনা করেন (অথবা সেগুলির জন্যও Fargate ব্যবহার করেন)।

আপনি হয়তো ভাবছেন: Kubernetes industry standard হলে এবং প্রতিটি job posting এটি উল্লেখ করলে, আমরা কেন এটা ব্যবহার করব না? কারণ "industry standard" বর্ণনা করে dedicated platform team সহ বড় কোম্পানিগুলি কী ব্যবহার করে। একটি food-ordering app তৈরি করা ছয়-জনের দলের জন্য, Kubernetes এখন কোনো ব্যবহারিক সুবিধা ছাড়াই operational জটিলতা যোগ করে। জটিলতা বাস্তব; সুবিধা এই scale-এ তাত্ত্বিক।

Kubernetes এমন জটিলতার স্তরে মূল্য প্রদান করে যা বেশিরভাগ দলের প্রয়োজন নেই: internal platform তৈরির জন্য custom resource definition, advanced scheduling constraint, fine-grained deployment control-এর জন্য pod disruption budget, এবং শত শত microservice-এর মধ্যে traffic management-এর জন্য service mesh integration। এগুলি প্রকৃত capability। এগুলি এমন capability-ও যা Nimbus-এর আকারের একটি startup কখনো ব্যবহার করবে না।

এখানে engineering নীতিটিকে কখনো কখনো YAGNI বলা হয়: You Aren't Gonna Need It। ECS Nimbus-কে বর্তমানে প্রয়োজনীয় সব কিছু দেয়। EKS তাদের প্রয়োজনের চেয়ে বেশি দেয়, plus একটি উল্লেখযোগ্য learning curve এবং operational overhead। "এটা পরে দরকারি হবে" এখন জটিলতা যোগ করার ভালো কারণ নয়।

কখন EKS বনাম ECS ব্যবহার করবেন?

**ECS ব্যবহার করুন** যদি:

- আপনি প্রাথমিকভাবে AWS-এ থাকেন এবং সহজ, আরও AWS-native অভিজ্ঞতা চান
- আপনার দলের বিদ্যমান Kubernetes দক্ষতা নেই
- আপনি কম operational overhead চান

**EKS ব্যবহার করুন** যদি:

- আপনার Kubernetes-নির্দিষ্ট feature প্রয়োজন (Custom Resource Definition, Helm chart, Kubernetes ecosystem)
- আপনার দল ইতিমধ্যে Kubernetes জানে
- আপনি একটি hybrid environment চালাচ্ছেন (কিছু on-premises, কিছু AWS-এ) এবং একটি সামঞ্জস্যপূর্ণ orchestration layer চান
- আপনার workload-এর এমন প্রয়োজনীয়তা আছে যা Kubernetes-এর extensibility-র সাথে মেলে

**Container Networking: Ephemeral IP এবং Service Discovery**

container-এ যাওয়ার সময় একটি জিনিস দলগুলিকে অপ্রস্তুত করে: একটি container-এর IP address প্রতিবার restart হলে পরিবর্তন হয়।

EC2 জগতে, instance-গুলির অপেক্ষাকৃত স্থিতিশীল private IP ছিল। আপনি (যদিও আপনার করা উচিত নয়) configuration file-এ সেগুলি hardcode করতে পারতেন। Service-গুলি একে অপরকে IP দ্বারা জানত।

Container জগতে, ECS-এর প্রতিটি task শুরু হলে VPC subnet থেকে একটি IP পায়। যখন এটি থামে এবং একটি নতুন task শুরু হয় (একটি deployment বা একটি restart-এর অংশ হিসেবে), সেই নতুন task একটি ভিন্ন IP পায়।

"যখন একটি service `10.0.1.45` call করতে hardcode করা থাকে এবং সেই container `10.0.1.82` দিয়ে প্রতিস্থাপিত হয় তখন কী হয়?" Priya জিজ্ঞেস করল। "Calling service কিছুতে hit করা শুরু করে না।"

এই কারণেই container environment-এ service discovery গুরুত্বপূর্ণ। ECS + Application Load Balancer এটি স্বয়ংক্রিয়ভাবে handle করে: ALB-এর DNS name স্থিতিশীল; ECS healthy task target group-এর সাথে নিবন্ধন করে; ALB বর্তমানে যে task healthy সেগুলিতে route করে। Calling service ALB DNS name-এর সাথে কথা বলে, individual container IP-এর সাথে নয়।

Internal service-to-service communication-এর জন্য (user-facing নয়), **AWS Cloud Map** service discovery প্রদান করে: প্রতিটি ECS service Cloud Map-এর সাথে নিবন্ধন করে, যা একটি স্থিতিশীল DNS name প্রদান করে। Order service `http://notification.nimbus.local:8080` call করে, এবং Cloud Map সেটাকে notification service-এর বর্তমানে যে task healthy সেগুলিতে resolve করে।

"তাহলে container-গুলি IP নয়, DNS name-এর মাধ্যমে একে অপরের সাথে কথা বলে?" Leo নিশ্চিত করল।

"সঠিক। IP ephemeral। DNS name হলো contract।"

**Secret Injection: Environment Variable-এ কোনো Secret নয়**

মূল EC2 deployment-এ একটি সমস্যা ছিল যা Priya মাসের পর মাস flag করেছিল: secret (database password, API key, SES credential) একটি deployment script-এর মাধ্যমে সেট করা EC2 instance-এর environment variable-এ store করা ছিল।

Environment variable instance-এ চলা যেকোনো process-এর কাছে accessible। তারা debugging tool-এ, কিছু crash report-এ, এবং process list-এ দেখা যায়। আপনি সেগুলি log করলে (যা কিছু development tool ডিফল্টভাবে করে) সেগুলি CloudWatch-এও দৃশ্যমান।

Container এটি স্বয়ংক্রিয়ভাবে সমাধান করে না — আপনি এখনও ECS task definition-এ environment variable হিসেবে secret pass করতে পারেন। এবং ECS task definition AWS console-এ store করা হয়, ECS access সহ যে কারো কাছে দৃশ্যমান।

সঠিক pattern: **AWS Secrets Manager + ECS task definition integration**।

task definition-এ database password store করার পরিবর্তে:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS task launch-এর সময় Secrets Manager থেকে secret পুনরুদ্ধার করে এবং একটি environment variable হিসেবে container-এ এটি inject করে। Secret value কখনো task definition-এ store করা হয় না — শুধুমাত্র Secrets Manager secret-এর ARN। Container runtime-এ value পায়। Secrets Manager task definition পরিবর্তন না করে value rotate করতে পারে।

"এবং কেউ যদি task definition পড়ে?" Priya জিজ্ঞেস করল। "তারা Secrets Manager ARN দেখবে, কিন্তু value নয়।"

"এবং সঠিক IAM permission ছাড়া," Leo নিশ্চিত করল, "তারা Secrets Manager থেকে value-ও পুনরুদ্ধার করতে পারবে না।"

"এটাই design," Priya বলল। "task-এর execution role-এর সেই নির্দিষ্ট secret পড়ার permission আছে। আর কিছু নয়। task definition compromise করলে আপনি একটি ARN পান, একটি password নয়।"

"আমাদের কোনটি ব্যবহার করা উচিত?" Maya জিজ্ঞেস করল। "এবং Kubernetes কেন নয়? এটা প্রতিটি job description-এ আছে। প্রতিটি conference talk-এ।"

"ECS," Priya সঙ্গে সঙ্গে বলল। "আমাদের Kubernetes দক্ষতা নেই। ECS আমাদের প্রয়োজনীয় সব কিছু করে। এখন Kubernetes যোগ করা কোনো ব্যবহারিক সুবিধা ছাড়াই operational জটিলতা যোগ করবে।"

Soo-Jin, যে তার শেষ কোম্পানিতে Kubernetes cluster চালিয়েছিল, মাথা নাড়ল। "আমি সেই pager বহন করেছি। প্রয়োজন না হওয়া পর্যন্ত আপনি এটা চান না।"

"আমরা ECS ছাড়িয়ে গেলে পরে সবসময় EKS-এ migrate করতে পারি," Leo যোগ করল।

এটি একটি সঠিক senior উত্তর: আপনার বর্তমান প্রয়োজন fit করে এমন সহজ tool বেছে নিন।

**ECR: আপনার Image সুরক্ষিত করা**

"এবং কেউ যদি একটি vulnerable base image-এর মাধ্যমে ভাঙার চেষ্টা করে?" Priya জিজ্ঞেস করল। "কেউ একটি পরিচিত CVE সহ একটি পুরানো image নেয় এবং এটি application container-এ পা রাখার জন্য ব্যবহার করে?"

production-এ যেকোনো container deploy করার আগে জিজ্ঞাসা করার সঠিক প্রশ্ন ছিল।

**Amazon ECR (Elastic Container Registry)** আপনার Docker image store করে এবং deployment-এর আগে পরিচিত vulnerability-র জন্য সেগুলি scan করতে পারে। ECR image scanning পরিচিত CVE (Common Vulnerabilities and Exposures)-এর একটি database-এর বিপরীতে image check করে এবং severity অনুযায়ী issue flag করে।

Priya যে policy লিখল: একটি CRITICAL severity CVE সহ কোনো image production-এ deploy হবে না। CI/CD pipeline ECS service আপডেট করার আগে scan ফলাফল check করত। একটি critical vulnerability পাওয়া গেলে, pipeline ব্যর্থ হত এবং দলকে alert করত।

"সেটা paranoia নয়," Priya বলল। "সেটা কেবল deploy করার আগে একটি check থাকা।"

**Container কীভাবে Deployment পরিবর্তন করে**

Container-এর আগে, Nimbus API-এর একটি নতুন version deploy করার মানে:

1. প্রতিটি EC2 instance-এ SSH করুন
2. Git থেকে সর্বশেষ কোড pull করুন
3. Dependency install/update করুন
4. Application process restart করুন
5. Health যাচাই করুন
6. পরবর্তী instance-এ যান

এটি error-prone এবং ধীর ছিল। এটি সমন্বয় প্রয়োজন ছিল। Step 3 instance 4-এ ব্যর্থ হলে, আপনার একটি mixed deployment ছিল যেখানে কিছু instance পুরানো version চালাচ্ছে এবং কিছু নতুন version চালাতে ব্যর্থ হচ্ছে।

ECS এবং container সহ:

1. একটি নতুন Docker image build করুন (CI/CD pipeline-এ স্বয়ংক্রিয়)
2. ECR-এ push করুন
3. নতুন image version ব্যবহার করতে ECS service আপডেট করুন

ECS rolling deployment handle করে: নতুন image সহ নতুন task শুরু করে, সেগুলি healthy হওয়ার জন্য অপেক্ষা করে, তারপর পুরানো task থামায়। শূন্য-downtime deployment, স্বয়ংক্রিয়।

নতুন version health check-এ ব্যর্থ হলে, ECS deployment থামায় এবং পুরানো version traffic পরিবেশন করতে থাকে।

**Deployment-এর ন্যূনতম Config: Health Check**

container deployment-এর সম্পূর্ণ নিরাপত্তা health check আসলে কাজ করার উপর নির্ভর করে।

ECS দুই ধরনের health check ব্যবহার করে:

**Container-level health check**: Dockerfile বা task definition-এ সংজ্ঞায়িত। application সাড়া দিচ্ছে কিনা যাচাই করতে container-এর ভিতরে চলে।

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**ALB target group health check**: load balancer পর্যায়ক্রমে একটি health endpoint-এ HTTP request পাঠায়। যে task health check-এ ব্যর্থ হয় সেগুলি target group থেকে সরিয়ে দেওয়া হয়।

কোনো health check সঠিকভাবে configure না হলে, ECS প্রতিটি task healthy বিবেচনা করে — এবং না থামিয়ে একটি broken image deploy করবে। এটি সবচেয়ে সাধারণ container deployment ভুল।

"Health check endpoint কি internal তথ্য leak করতে পারে?" Priya জিজ্ঞেস করল।

`/health`-এ health check endpoint শুধুমাত্র return করত: `{"status": "ok"}`। কোনো version number নেই, কোনো dependency state নেই, কোনো internal configuration নেই। Health response-এর যেকোনো তথ্য application map করা কারো কাছে দরকারি হতে পারে। Health endpoint minimal রাখুন।

বিস্তারিত internal health status-এর জন্য (database connectivity, dependency check), একটি পৃথক authenticated `/health/detail` endpoint ব্যবহার করুন — শুধুমাত্র VPC-এর ভিতর থেকে accessible।

**Structured Logging: একটি চলমান Container-এ একমাত্র জানালা**

EC2-তে, কিছু ভুল হল এবং আপনি SSH করেন। আপনি log file tail করেন। আপনি process table দেখেন। আপনি disk usage check করেন। আপনি ঘাঁটাঘাঁটি করেন।

একটি container-এ, কোনো SSH নেই। Container ephemeral — এটি cluster-এর যেকোনো host-এ চলতে পারে, এবং এটি health check-এ ব্যর্থ হলে ECS সতর্কতা ছাড়াই এটি প্রতিস্থাপন করবে। আপনি SSH করার কথা ভাবার সময়, আপনি যে container পরীক্ষা করতে চেয়েছিলেন তা আর বিদ্যমান নাও থাকতে পারে।

Containerized environment-এ log একটি debugging সুবিধা নয়। এগুলি একমাত্র প্রমাণ যে কিছু ঘটেছে।

"এবং একটি container নীরবে ব্যর্থ হলে এবং আমাদের কোনো log না থাকলে কী?" container architecture review-এর সময় Priya জিজ্ঞেস করল। "একটি task code 1 দিয়ে exit করতে পারে এবং terminate হওয়ার আগে log capture না হলে আমরা কখনো কারণ জানব না।"

এটা কাল্পনিক নয়। এটা প্রথম container deployment-এ ঘটে, ধারাবাহিকভাবে।

সঠিক pattern: প্রতিটি container-কে `awslogs` log driver ব্যবহার করে **Amazon CloudWatch Logs**-এ structured log পাঠাতে configure করুন। ECS স্বয়ংক্রিয়ভাবে shipping handle করে — install করার কোনো log agent নেই, প্রয়োজনীয় কোনো sidecar container নেই।

task definition-এ:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

container-এর ভিতরে stdout বা stderr-এ লেখা প্রতিটি লাইন capture করা হয় এবং log group `/ecs/nimbus-api`-তে পাঠানো হয়, task ID দ্বারা সংগঠিত। ECS প্রতিটি task-এর জন্য একটি নতুন log stream তৈরি করে, তাই আপনি যে নির্দিষ্ট container ব্যর্থ হয়েছে তার log খুঁজে পেতে পারেন — এমনকি এটি প্রতিস্থাপিত হওয়ার পরেও।

task execution role-এর CloudWatch Logs-এ লেখার permission প্রয়োজন। এটা ছাড়া, log driver নীরবে ব্যর্থ হয় এবং সমস্ত log output হারিয়ে যায়।

**Structured log বনাম plain text**: Plain text log ("Order 7741 placed") grep প্রয়োজন। Structured JSON log (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) SQL-এর সাথে সাদৃশ্যপূর্ণ একটি syntax ব্যবহার করে CloudWatch Logs Insights দিয়ে query করা যায়:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

সেই query সরাসরি log group-এর বিপরীতে চলে। কোনো database নেই। কোনো data pipeline নেই। কোনো ETL job নেই। উত্তরটি কয়েক সেকেন্ডে সেখানে থাকে।

এটি অধ্যায় ২৬-এ আমরা যে analytics data lake তৈরি করব তা প্রতিস্থাপন করে না। এটি operational প্রশ্নের উত্তর দেয় — "গত ৩০ মিনিটে রেস্তোরাঁ 47 থেকে কতগুলি order?" — একটি incident-এর মাঝখানে, যখন আপনার একটি Athena query চালানোর সময় নেই।

**CloudWatch Container Insights**

**Container Insights** হলো একটি CloudWatch feature যা container-level metric — CPU, memory, network I/O, storage I/O — সংগ্রহ এবং একত্রিত করে প্রতি ECS cluster, service, এবং task। EC2-level metric-এর পরিবর্তে (host কেমন করছে?), আপনি task-level metric দেখেন (এই নির্দিষ্ট ECS service কেমন করছে?)।

ECS cluster-এ একটি setting দিয়ে এটি সক্ষম করুন:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

সক্ষম করার পরে:

- আপনি প্রতি service একটি dashboard দেখেন: task count, CPU utilization, memory utilization
- আপনি task-level CPU-তে alarm করতে পারেন (EC2 host CPU-এর পরিবর্তে, যা একটি অনেক ভোঁতা সংকেত)
- আপনি memory spike-কে log event-এর সাথে সম্পর্কিত করতে পারেন — task memory ১৪:২২-এ ৯৫%-এ উঠেছিল; log ঠিক ১৪:২১-এ রেস্তোরাঁ 47-এর menu import থেকে inbound request-এ একটি spike দেখায়

"এটার মাসে কত খরচ?" Tom জিজ্ঞেস করল।

Container Insights এটি যে custom metric এবং log storage উৎপন্ন করে তার জন্য চার্জ করে। Nimbus-এর scale-এ (তিনটি service, প্রতিটি 3-6 task), এটা ছিল প্রায় $12/মাস — task-level operational দৃশ্যমানতার জন্য একটি যুক্তিসঙ্গত trade।

Leo সেদিনের মধ্যেই এটি সক্ষম করল।

প্রথমবার একটি task health check-এ ব্যর্থ হল এবং ECS দ্বারা প্রতিস্থাপিত হল, Container Insights dashboard event-টি স্বয়ংক্রিয়ভাবে capture করল: task ID, start time, failure time, exit code। সেই task-এর জন্য CloudWatch log stream termination-এর আগে output-এর শেষ ৪০ লাইন সংরক্ষণ করল — যা একটি নতুন রেস্তোরাঁ partner-এর একটি malformed menu JSON দ্বারা trigger করা একটি uncaught exception দেখাল।

Container Insights এবং structured logging ছাড়া: error rate-এ একটি রহস্যময় spike, তদন্তের জন্য একটি host-এ SSH করা প্রয়োজন যা আর ব্যর্থ task চালায় না, ৪৫ মিনিটের অনুমান।

সেগুলি সহ: CloudWatch dashboard-এ একটি log stream link, সঠিক exception, রেস্তোরাঁ ID, আপত্তিকর field — পাঁচ মিনিটের মধ্যে।

"কোনো SSH নেই," post-mortem পর্যালোচনা করে Leo বলল। "তদন্ত করার জন্য কোনো downtime নেই। Log কাজটি করেছে।"

"Log কেবল তখনই কাজ করে," Priya বলল, "যদি আপনি সেগুলি capture করার জন্য configure করেন।"


**যখন Container ভুল পছন্দ**

"দাঁড়াও — কিন্তু আমরা কেন সবকিছু containerize করব না?" Maya জিজ্ঞেস করল। "তুমি এইমাত্র আমাকে বোঝালে যে container সব configuration drift সমস্যা সমাধান করে। প্রতিটি single service container হিসেবে চালাব না কেন?"

এটা সেই একই প্রশ্ন যা সে Lambda সম্পর্কে জিজ্ঞেস করেছিল। উত্তর অনুরূপ ছিল।

Container operational প্রয়োজনীয়তা যোগ করে: আপনার একটি container registry (ECR) প্রয়োজন, একটি CI/CD pipeline যা image build এবং push করে, একটি orchestrator (ECS), instance-level-এর পরিবর্তে task-level দৃশ্যমানতার জন্য configure করা monitoring, এবং একটি দল যারা Docker এবং image versioning বোঝে।

যে service ইতিমধ্যে EC2-তে ভালো কাজ করছে, স্থিতিশীল, এবং configuration drift-এ ভুগছে না, তার জন্য containerize করার cost benefit-কে ছাড়িয়ে যেতে পারে।

নির্দিষ্ট ক্ষেত্রে যেখানে container ভুল পছন্দ:

**Stateful service যা container mobility-র জন্য তৈরি নয়**: container-এ database-এর সাবধান persistent volume management প্রয়োজন। container-এ database চালানো বেশিরভাগ দল এই জটিলতার সম্মুখীন হওয়ার পর শেষ পর্যন্ত সেগুলিকে managed service-এ (RDS, ElastiCache) ফিরিয়ে নেয়।

**Specialized hardware প্রয়োজনীয়তা সহ service**: GPU workload, নির্দিষ্ট network interface configuration, বা FPGA-ভিত্তিক processing-এর নির্দিষ্ট hardware সহ EC2 instance প্রয়োজন। Container এটি পরিবর্তন করে না — আপনি এখনও EC2 launch type ব্যবহার করবেন, শুধু উপরে container সহ, এবং container abstraction benefit ছাড়াই জটিলতা যোগ করে।

**খুব সহজ script এবং job**: একটি ৪০-লাইনের Python script যা সপ্তাহে একবার চলে এবং কোনো dependency drift issue নেই। এর জন্য Docker, ECR, ECS task definition, এবং একটি CI/CD pipeline যোগ করা অসামঞ্জস্যপূর্ণ। Lambda সহজ। একটি plain EC2 cron job আরও সহজ হতে পারে।

"নীতি," Leo বলল, "সবসময়ের মতো একই: সমস্যার সাথে tool মেলান। Container configuration drift এবং deployment consistency সমাধান করে। আপনার সেই সমস্যা না থাকলে, আপনার container প্রয়োজন নেই।"

## AWS Batch: বড়-স্কেল Job-এর জন্য Container

ECS এবং EKS long-running service-এর জন্য design করা — application যা ক্রমাগত চলে, request গ্রহণ করে, এবং traffic-এর সাথে scale করে। কিন্তু কিছু workload ভিন্ন: তারা একটি নির্দিষ্ট সময়ের জন্য চলে, একটি সংজ্ঞায়িত dataset process করে, তারপর থামে। শত শত রেস্তোরাঁর জন্য মাস-শেষের invoice তৈরি করা। একটি machine learning training job চালানো। একটি রাতের analytics export process করা।

এই workload-গুলির জন্য, আপনি একটি service চান না — আপনি একটি job চান।

**AWS Batch** হলো একটি fully managed service যা যেকোনো scale-এ batch computing job চালায়। আপনি আপনার job-কে একটি Docker container হিসেবে সংজ্ঞায়িত করেন (ECS যে একই container format ব্যবহার করে), এবং Batch বাকিটা handle করে: EC2 বা Fargate compute provision করা, queue-তে job schedule করা, job আসলে capacity scale up করা এবং সেগুলি শেষ হলে শূন্যে ফিরিয়ে নেওয়া।

মূল concept:

- **Job definition:** Docker container, resource প্রয়োজনীয়তা (vCPU, memory), এবং চালানোর command
- **Job queue:** submit করা job চালানোর আগে যেখানে অপেক্ষা করে; প্রতিটি queue এক বা একাধিক compute environment-এর সাথে যুক্ত
- **Compute environment:** অন্তর্নিহিত EC2 বা Fargate capacity। ৯০% পর্যন্ত cost সাশ্রয়ের জন্য Spot Instance ব্যবহার করতে পারে — Batch স্বয়ংক্রিয়ভাবে interruption এবং retry handle করে

"দাঁড়াও — কিন্তু আমরা কেন কেবল একটি ECS task চালানোর পরিবর্তে Batch ব্যবহার করব?" Maya জিজ্ঞেস করল।

"কারণ একটি ECS service সবসময় চালু," Leo বলল। "এটা request-এর জন্য অপেক্ষা করে। একটি Batch job চলে, শেষ হয়, এবং Batch compute-কে শূন্যে ফিরিয়ে নেয়। রানের মধ্যে আপনি কিছু দেন না।"

Tom pricing page থেকে চোখ তুলল। "এবং Spot Instance?"

"Batch Spot-এ চলতে পারে। একটি Spot Instance job-এর মাঝখানে reclaim হলে, Batch স্বয়ংক্রিয়ভাবে retry করে। একটি ৪৫-মিনিটের invoice job-এর জন্য, সেটা ঠিক।"

**বনাম ECS/EKS:** ECS/EKS service চালায় — সবসময় চালু, request-driven। Batch job চালায় — সসীম সময়, data-driven, নিষ্ক্রিয় হলে শূন্যে scale।

**বনাম Lambda:** Lambda-র একটি ১৫-মিনিটের timeout আছে। Batch job ঘণ্টা বা দিন ধরে চলতে পারে।

Nimbus প্রসঙ্গ: রাতের invoice generation job শত শত রেস্তোরাঁ partner-এর জন্য ৪৫ মিনিট নেয়। Lambda ১৫ মিনিটে timeout হয়। একটি always-on ECS service দিনে ২৩ ঘণ্টা অর্থ নষ্ট করে। Batch Spot Instance-এ job চালায়, ৩৮ মিনিটে শেষ করে, $1.20 খরচ করে, এবং বন্ধ হয়ে যায়।

"সেটা পুরানো script শেষ হওয়ার জন্য অপেক্ষা করার সময় আমি যে coffee কিনেছিলাম তার চেয়ে সস্তা," Leo বলল।

"এবং পরিচালনা করার কোনো EC2 নেই," Priya যোগ করল। "Batch এটা provision করে, চালায়, terminate করে।"

## শক্তি এবং সীমাবদ্ধতা

**Container**:

- environment অসামঞ্জস্য দূর করে ("আমার মেশিনে কাজ করে")
- দ্রুত, নির্ভরযোগ্য deployment সক্ষম করে
- immutable — একই image সর্বত্র অভিন্নভাবে চলে
- দক্ষ — VM-এর চেয়ে হালকা, দ্রুত startup

**ECS**:

- AWS-কেন্দ্রিক workload-এর জন্য Kubernetes-এর চেয়ে সহজ
- শক্ত AWS integration (IAM, ALB, CloudWatch, Secrets Manager)
- Fargate option সম্পূর্ণরূপে EC2 management দূর করে

**EKS**:

- সম্পূর্ণ Kubernetes compatibility — সম্পূর্ণ ecosystem ব্যবহার করুন
- hybrid environment বা Kubernetes দক্ষতা সহ দলের জন্য ভালো
- ECS-এর চেয়ে সেট আপ এবং operate করা আরও জটিল

**যেখানে জটিল হয়**:

- container image build এবং version করতে হবে — একটি CI/CD pipeline প্রয়োজন
- container debug করতে ঐতিহ্যবাহী process debug করার চেয়ে ভিন্ন tooling প্রয়োজন
- stateful container (container-এ database) সাবধান persistent storage configuration প্রয়োজন
- container-গুলির মধ্যে networking (service-to-service communication) container networking concept বোঝা প্রয়োজন

## সারসংক্ষেপ

Lambda নিষ্ক্রিয় compute বিনামূল্যে করেছিল। Container deployment-কে deterministic করেছিল। একসাথে, তারা বর্ধনশীল engineering দলের জন্য operational ব্যথার সবচেয়ে সাধারণ দুটি কারণ সমাধান করেছিল।

- **Container** application কোড, runtime, এবং dependency একসাথে package করে — যেকোনো জায়গায় অভিন্নভাবে চলে।
- **Docker** হলো standard container প্রযুক্তি। Image হলো blueprint; container হলো চলমান instance।
- **ECR (Elastic Container Registry)** হলো AWS-এর managed Docker registry — আপনার image এখানে store, version, এবং scan করুন। deployment-এর আগে CVE ধরতে image scanning সক্ষম করুন।
- **ECS (Elastic Container Service)** container orchestrate করে। আপনি task এবং service সংজ্ঞায়িত করেন; ECS placement এবং lifecycle পরিচালনা করে।
- **Fargate** হলো container-এর জন্য serverless compute — পরিচালনা করার কোনো EC2 instance নেই। EC2 overhead দূর করার কারণে ছোট scale-এ প্রায়ই EC2 launch type-এর চেয়ে সস্তা। সাবধান task bin-packing সহ বড় scale-এ, EC2 launch type আরও cost-effective হতে পারে।
- **EKS (Elastic Kubernetes Service)** হলো managed Kubernetes — যে দলগুলির Kubernetes feature বা compatibility প্রয়োজন তাদের জন্য।
- **Secrets Manager integration**: task definition-এর মাধ্যমে launch-এর সময় container-এ secret inject করুন — environment variable বা task definition-এ সরাসরি secret value store করবেন না।
- **Service discovery**: container IP ephemeral। স্থিতিশীল service addressing-এর জন্য ALB DNS name বা Cloud Map ব্যবহার করুন।
- AWS-এ সরলতার জন্য ECS বেছে নিন; Kubernetes ecosystem compatibility-র জন্য EKS বেছে নিন।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Resilient Architectures (ডোমেন ২, টাস্ক ২.১)*

- **ECS বনাম EKS সংকেত**: পরীক্ষার scenario যা "Kubernetes," "Helm," "বিদ্যমান Kubernetes দক্ষতা," বা "multi-cloud container orchestration" উল্লেখ করে → EKS। বাকি সব → ECS।
- **Fargate বনাম EC2 launch type**: "container-এর জন্য EC2 instance পরিচালনা করতে চান না," "serverless container," "কোনো infrastructure management নেই" → Fargate। "নির্দিষ্ট instance type প্রয়োজন," "GPU workload," "fine-grained instance নিয়ন্ত্রণ" → EC2 launch type।
- **Task role বনাম task execution role** — একটি প্রকৃত পরীক্ষার পার্থক্যকারী। **Task execution role** ECS *agent* task-এর পক্ষে ব্যবহার করে, আপনার কোডের আগে এবং চারপাশে: ECR থেকে image pull করা, Secrets Manager থেকে secret আনা, CloudWatch-এ log লেখা। **Task role** হলো যা *container-এর ভিতরে আপনার application কোড* AWS service call করতে ব্যবহার করে: S3 থেকে পড়া, DynamoDB-তে লেখা — EC2 instance role-এর মতো, কিন্তু প্রতি task, তাই প্রতিটি task-এর ভিন্ন permission থাকতে পারে। "Container-এর S3 থেকে পড়া দরকার" → **task role** (task definition-এ সংযুক্ত)। "Task তার image pull করতে ব্যর্থ / তার secret আনতে পারে না" → **execution role**-এর permission অনুপস্থিত।
- **Fargate Spot**: ~৭০% পর্যন্ত ছাড়ে spare capacity-তে fault-tolerant container চালান, একটি দুই-মিনিটের interruption warning সহ — EC2 Spot-এর Fargate সমতুল্য, capacity provider-এর মাধ্যমে configure করা। পরীক্ষার trigger: "instance পরিচালনা না করে সর্বনিম্ন cost-এ interruption-tolerant container চালান" → Fargate Spot।
- **ECR image scanning**: ECR পরিচিত vulnerability (CVE)-র জন্য container image scan করতে পারে। পরীক্ষার সংকেত: "security vulnerability-র জন্য container scan করুন" → ECR image scanning।
- **Blue/green deployment**: ECS CodeDeploy integration-এর মাধ্যমে blue/green deployment সমর্থন করে। স্বয়ংক্রিয় rollback সহ শূন্য-downtime deployment। পরীক্ষার pattern: "স্বয়ংক্রিয় rollback সহ downtime ছাড়াই deploy করুন" → ECS + CodeDeploy blue/green।
- **Secrets Manager integration**: পরীক্ষার সংকেত: "task definition-এ value store না করে container-এ secret inject করুন" → একটি Secrets Manager ARN reference করে task definition-এ `secrets` field ব্যবহার করুন। task execution role-এর `secretsmanager:GetSecretValue` permission প্রয়োজন।
- **ECS Service Auto Scaling**: CPU, memory, বা custom CloudWatch metric-এর উপর ভিত্তি করে task-এর সংখ্যা scale করুন। সঠিক সংখ্যক চলমান task-এ traffic route করতে ALB-এর সাথে কাজ করে।
- **AWS Batch:** Docker container-এর জন্য managed batch compute। Job queue → compute environment (EC2 বা Fargate, Spot সমর্থন করে)। কখন ব্যবহার করবেন: Lambda timeout অনেক ছোট, ECS service সসীম job-এর জন্য অপচয়। পরীক্ষার trigger: "large-scale batch processing" বা "ঘণ্টা ধরে চলা job" → AWS Batch।

## অনুশীলনী

**অনুশীলন ১ — স্মরণ**

একটি Docker image এবং একটি Docker container-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। ECS এবং ECR-এর মধ্যে পার্থক্য ব্যাখ্যা করুন।

*(ইঙ্গিত: Image container-এর কাছে যা একটি recipe একটি রান্না করা খাবারের কাছে। ECR image store করে; ECS সেগুলি চালায়।)*

**অনুশীলন ২ — SAA-C03 দৃশ্যকল্প**

*দৃশ্যকল্প*: একটি কোম্পানির একটি microservices application আছে যা বর্তমানে ম্যানুয়ালি পরিচালিত EC2 instance-এ চলছে। দল অসামঞ্জস্যপূর্ণ deployment-এর সাথে লড়াই করছে — ভিন্ন EC2 instance-এর ভিন্ন library version আছে, যা পুনরুৎপাদন-কঠিন bug সৃষ্টি করছে। তারা অন্তর্নিহিত server পরিচালনার জন্য operational overhead minimize করার সময় deployment মানসম্মত করতে চায়। দলের কোনো Kubernetes অভিজ্ঞতা নেই।

কোন সমাধান এই প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) Docker দিয়ে application containerize করুন; Fargate launch type সহ Amazon ECS ব্যবহার করুন  
B) instance সামঞ্জস্যপূর্ণ রাখতে AWS Systems Manager Patch Manager সহ EC2-তে deploy করুন  
C) Docker দিয়ে application containerize করুন; self-managed node group সহ Amazon EKS ব্যবহার করুন  
D) deployment এবং instance configuration স্বয়ংক্রিয়ভাবে পরিচালনা করতে AWS Elastic Beanstalk ব্যবহার করুন

**ইঙ্গিত ১**: Container সরাসরি "অসামঞ্জস্যপূর্ণ environment" সমস্যা সমাধান করে। কোন option container ব্যবহার করে?

**ইঙ্গিত ২**: "server পরিচালনার জন্য operational overhead minimize করুন" → Fargate (কোনো EC2 management নেই) বনাম self-managed node (এখনও EC2 পরিচালনা করুন)।

**ইঙ্গিত ৩**: "কোনো Kubernetes অভিজ্ঞতা নেই" → EKS ECS-এর চেয়ে বেশি operational জটিলতা।

**উত্তর**: A

**ব্যাখ্যা**: Docker দিয়ে containerize করা নিশ্চিত করে যে প্রতিটি deployment একই dependency সহ একই image ব্যবহার করে — configuration drift দূর করে। Fargate সহ ECS মানে পরিচালনা করার কোনো EC2 instance নেই। দল server maintenance নয়, application কোড এবং container definition-এ মনোযোগ দেয়। Kubernetes অভিজ্ঞতা ছাড়া দলের জন্য ECS (EKS নয়) উপযুক্ত।

**কেন B নয়?** Patch Manager EC2 instance আপডেট রাখে কিন্তু application-গুলির মধ্যে library version অসামঞ্জস্য সমাধান করে না। মৌলিক সমস্যা (ভিন্ন instance-এ ভিন্ন কোড environment) থেকে যায়।

**কেন C নয়?** Self-managed node group সহ EKS-এ EC2 instance পরিচালনা করতে *এবং* Kubernetes শিখতে হয়। কোনোটিই প্রয়োজনীয়তার সাথে সামঞ্জস্যপূর্ণ নয়।

**কেন D নয়?** Elastic Beanstalk EC2-তে application deployment পরিচালনা করে কিন্তু container ব্যবহার না করলে মৌলিক environment অসামঞ্জস্য সমাধান করে না। Beanstalk ডিফল্টভাবে Docker image ব্যবহার করে না (যদিও এটি configure করা যায়)।

*SAA-C03 ডোমেন: Design Resilient Architectures — টাস্ক ২.১*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus monolithic API-কে তিনটি microservice-এ বিভক্ত করছে: order service, menu service, এবং notification service। প্রতিটি service-এর ভিন্ন scaling প্রয়োজনীয়তা আছে (order service traffic-এর সাথে scale করে; menu service বেশিরভাগ read-only এবং স্থিতিশীল; notification service-এ spiky burst থাকে)।

এই তিনটি service-এর জন্য ECS architecture design করুন। আপনি service-to-service communication কীভাবে handle করবেন? আপনি কি একটি ECS cluster ব্যবহার করবেন নাকি তিনটি? আপনি প্রতিটি service-এর জন্য Auto Scaling কীভাবে আলাদাভাবে configure করবেন?

বিবেচনা করুন: menu service read-heavy এবং ৬০ সেকেন্ডের জন্য stale data পরিবেশন করতে পারে — আপনি কি এর সামনে caching যোগ করবেন? notification service শুক্রবার সন্ধ্যায় ব্যাপকভাবে burst-scale করে — আপনি কি Fargate Min capacity 1 এবং Max 20 সেট করবেন? একটি scale-down event-এর সময় in-flight notification-এর কী হয়?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো ECS-এ microservices architecture অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

প্রথম container deployment নিখুঁত ছিল।

API-এর নতুন version: শূন্য downtime। ECS এটি roll out করল, health check পাস হল, পুরানো task drain হল, নতুন task নিয়ন্ত্রণ নিল। Leo console-এ task status অবিশ্বাসের কাছাকাছি কিছু নিয়ে দেখল।

"এটা শুধু কাজ করল," সে বলল।

"গত সপ্তাহে তুমি ম্যানুয়াল SSH deploy সম্পর্কে একই কথা বলেছিলে instance তিনে ব্যর্থ হওয়ার আগে," Priya বলল।

"আমি ইতিমধ্যে এটা deploy করেছি — ওহ।" Leo থামল। "আমি image version tag না করে deploy করেছি। আমাকে সেটা ঠিক করতে দাও।"

"সেটাই পয়েন্ট," Priya বলল। "Image versioning হলো আপনি কীভাবে ট্র্যাক করেন কী চলছে।"

"এখন production-এ কোন version আছে তুমি কীভাবে জানো?" Maya জিজ্ঞেস করল।

Leo ECS console টেনে আনল। চলমান task-এর অধীনে, image তালিকাভুক্ত ছিল: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`। Version 1.0.3। ১৪:২২ UTC-তে build করা। ১৪:৩১ UTC-তে deploy করা।

"পুরানো EC2 setup-এ," Leo বলল, "প্রতিটি dependency-র কোন version install ছিল তা দেখতে আমাকে একটি instance-এ SSH করে `pip show` চালাতে হত। এবং এটা অন্য instance-এ ভিন্ন হতে পারত।"

"আর এখন?"

"image-এর tag আমাকে ঠিক বলে কী চলছে। ECR scan history আমাকে বলে এটা scan করা হয়েছে কিনা। ECS deployment history আমাকে বলে এটা কখন deploy করা হয়েছিল এবং পূর্ববর্তী version কী ছিল।"

"কোনো SSH নেই। কোনো downtime নেই। কোনো 'restart হওয়ার জন্য অপেক্ষা করুন' নেই।"

"Image হলো deployment artifact," Priya বলল। "Environment immutable। Deployment process declarative। এভাবেই software পাঠানো উচিত।"

Leo আরও এক মুহূর্ত console-এর দিকে তাকিয়ে রইল।

"আমি EC2 deployment সমন্বয় করতে তিন বছর কাটিয়েছি," সে বলল। "SSH script সমন্বয় করা। Deployment runbook লেখা।"

"তুমি একটি সমস্যা সমাধান করছিলে," Priya বলল, "যা container design দ্বারা সমাধান করে।"

সে এরপর আর কিছু বলল না। কিন্তু পরের সকালে, সে container build process-এর উপর documentation লেখা শুরু করল, যাতে আর কাউকে এটা বের করতে তিন বছর কাটাতে না হয়।

instance-তিনের bug, ছয় সপ্তাহের undocumented drift, এবং তাদের মতো issue যা তারা এখনো ধরেনি — সবগুলির একটি মাত্র root cause ছিল। কোনো malicious actor নয়। কোনো hardware failure নয়। শুধু একটি server যাকে একটি disposable unit-এর পরিবর্তে একটি স্থায়ী fixture-এর মতো treat করা হয়েছিল।

Container ছিল তার উত্তর। এটি নতুন এবং আকর্ষণীয় বলে নয়। কারণ এটি প্রশ্নটি জিজ্ঞাসা করা অসম্ভব করে তুলেছিল।

পরবর্তী অধ্যায়ে: সেই flowchart যা নিজেই চলে — এবং কোথায় থেমেছিল তা মনে রাখে।
