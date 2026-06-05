# অধ্যায় ১৪: কে কী করার অনুমতি পেয়েছে

Tom একটি text file-এ access key খোলা রেখেছিল, paste করার জন্য প্রস্তুত।

"আপনি কী করছেন?" Priya জিজ্ঞেস করল।

"EC2 instance-কে S3 থেকে config file পড়তে হবে। আমি server configuration-এ credential রাখছি।"

সে একটি মুহূর্তের জন্য screen দেখল। "সেই file বন্ধ করুন।"

"আমি শুধু—"

"কেউ সেই server-এ ঢুকলে," সে বলল, "তারা সেই key পাবে। এবং সেই key IAM user যা করার অনুমতি পেয়েছে তার সবকিছু স্পর্শ করে। যা সম্ভবত শুধু S3-এর বাইরে আরো।"

Tom file বন্ধ করল।

"একটি ভালো উপায় আছে," সে বলল। "Server নিজেই একটি role থাকতে পারে। এটাকে একটি job title-এর মতো মনে করুন — instance-এর credential দরকার নেই কারণ সিস্টেম ইতিমধ্যে জানে এটি কী এবং কী করার অনুমতি পেয়েছে।"

Tom skeptical দেখাল। "তাহলে server নিজেই authenticate করে?"

"হ্যাঁ। কোনো password ছাড়া। কোনো config file-এ key ছাড়া। git-এ ঘটনাক্রমে commit করা যাবে এমন কিছু ছাড়া।"

শেষ অংশটা পৌঁছাল। দুই সপ্তাহ আগে Tom git history-তে একটি database password খুঁজে পেয়েছিল। সে একটি নতুন browser tab খুলল।

**IAM পুনরায় দেখা: সম্পূর্ণ চিত্র**

অধ্যায় ৩ IAM পরিচয় করিয়ে দিয়েছিল: user, group, role এবং policy। এখন গভীরে যাওয়ার সময়।

IAM policy হলো JSON document যা কোন resource-এ কোন action allow বা denied তা নির্দিষ্ট করে। এগুলি এভাবে দেখায়:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

এই policy `nimbus-assets` bucket-এ object পড়া এবং লেখার অনুমতি দেয়, এবং আর কিছু নয়। Delete করা নয়। Bucket list করা নয়। অন্য কোনো S3 operation নয়। অন্য কোনো AWS service নয়।

অনুমতি grant করার এটাই সঠিক উপায়: নির্দিষ্ট action, নির্দিষ্ট resource।

**"Administrator Access"-এর সমস্যা**

`AdministratorAccess`-এর মতো AWS Managed Policy দ্রুত শুরু করার জন্য ডিজাইন। Production system-এ বাস্তব team member-দের সাথে চালানোর জন্য ডিজাইন নয়।

`AdministratorAccess` প্রতিটি resource-এ প্রতিটি action grant করে। যদি এই policy সহ কোনো team member ভুল করে — ঘটনাক্রমে একটি S3 bucket মুছে ফেলে, ভুল EC2 instance terminate করে, security group নিয়ম পরিবর্তন করে — AWS সেগুলি থামাতে পারে না। অনুমতি grant করা হয়েছিল।

"তাহলে Soo-Jin-এর কী থাকা উচিত?" Leo জিজ্ঞেস করল।

"Soo-Jin-এর কী করার দরকার?" Priya জবাব দিল।

"API deploy করুন। Log check করুন। আর কিছু নয়।"

"তাহলে সে পায়: code pipeline-এ push করার ability, CloudWatch log-এ read access, এবং আর কিছু নয়।"

"এটা... খুব নির্দিষ্ট।"

"হ্যাঁ। এটাই point।"

**IAM Role: Service-এর জন্য পরিচয়**

অধ্যায় ৩ credential সংরক্ষণ না করে AWS service অ্যাক্সেস করার উপায় হিসেবে role পরিচয় করিয়ে দিয়েছিল। এটি concrete করা যাক।

Nimbus API চালানো EC2 instance-এর প্রয়োজন:

- DynamoDB থেকে read (মেনু)
- DynamoDB-তে write (অর্ডার)
- S3-এ object রাখুন (receipt, upload)
- CloudWatch-এ log লিখুন
- Secrets Manager থেকে secret পড়ুন

EC2 instance-এ কোনো access key সংরক্ষণ করার পরিবর্তে (একটি নিরাপত্তা nightmare — access key SSH access সহ যে কেউ পড়তে পারে), আপনি ঠিক এই অনুমতি সহ EC2 instance-এর জন্য একটি **IAM role** তৈরি করেন।

EC2 instance স্বয়ংক্রিয়ভাবে role assume করে। AWS instance metadata service-এর মাধ্যমে অস্থায়ী credential প্রদান করে। Credential স্বয়ংক্রিয়ভাবে rotate হয়। ফাঁস, rotate বা ঘটনাক্রমে repository-তে commit করার কোনো access key নেই।

"এবং কেউ EC2 instance hack করলে?" Leo জিজ্ঞেস করল।

"তারা EC2 role যা allow করে তা করতে পারে," Priya বলল। "যা মেনু পড়া, অর্ডার লেখা এবং log পাঠানো। তারা S3 bucket মুছতে পারে না। তারা EC2 instance terminate করতে পারে না। তারা IAM স্পর্শ করতে পারে না।"

"কারণ EC2 role-এর সেই অনুমতি নেই।"

"ঠিক।"

**Role Assumption: Service কীভাবে অন্য Service হয়**

Role assume করতে পারে:

- **AWS service** (EC2, Lambda, ECS task, ইত্যাদি)
- **আপনার নিজের account-এ IAM user** (role elevation — একটি নির্দিষ্ট কাজের জন্য আরো অনুমতি সহ একটি role assume করুন)
- **অন্য AWS account-এ IAM user** (cross-account access — অন্য সংস্থার account আপনারটিতে একটি role assume করতে পারে)
- **External identity provider** (Google, Active Directory, Okta — human user-এর জন্য federated access)

শেষ pattern — **identity federation** — হলো বড় সংস্থাগুলি প্রতিটি ব্যক্তির জন্য পৃথক IAM user তৈরি না করে তাদের কর্মচারীদের AWS access দেয়। আপনার কোম্পানির Active Directory-তে আপনার credential আছে। আপনি AWS-এ log in করলে, আপনি Active Directory-এর বিরুদ্ধে authenticate করেন এবং AWS আপনাকে একটি role grant করে।

**Permission Boundary: Role কী Grant করতে পারে তা সীমিত করা**

এখানে একটি সূক্ষ্ম কিন্তু গুরুত্বপূর্ণ সমস্যা: ডিফল্টরূপে, IAM কোনো user-কে তাদের বর্তমানে নেই এমন অনুমতি grant করা থেকে prevent করে না।

Soo-Jin-এর যদি `iam:CreatePolicy` এবং `iam:AttachUserPolicy` থাকে, সে S3 write access grant করা একটি policy তৈরি করতে পারে এবং নিজের সাথে attach করতে পারে — এমনকি তার বিদ্যমান policy শুধুমাত্র S3 read allow করলেও। এই দুর্বলতার class **privilege escalation** নামে পরিচিত, এবং এজন্যই permission boundary বিদ্যমান।

**Permission boundary** সর্বোচ্চ অনুমতি set করে যা কোনো identity-কে কখনো grant করা যাবে। এমনকি identity-র attached policy আরো broad হলেও, কার্যকর অনুমতি permission boundary দ্বারা bounded।

উদাহরণ: আপনি একজন team lead-কে IAM role তৈরির অনুমতি দেওয়া একটি policy দেন। কিন্তু আপনি একটি permission boundary attach করেন যা বলে "এই team lead দ্বারা তৈরি role-এ কখনো S3 delete access থাকতে পারে না।" Team lead যদি S3 full access সহ একটি role তৈরি করে, boundary S3 delete কার্যকর হতে prevent করে।

এটি একটি advanced concept, কিন্তু পরীক্ষায় দেখা যায় এবং স্কেলে IAM management কীভাবে delegate করা যায় তা প্রতিফলিত করে।

**IAM Access Analyzer: অনুমতি Auditing**

Priya দুই দিন দলের IAM setup পর্যালোচনা করতে কাটাল। সে পেল:

- Leo-র personal user-এর administrator access ছিল (আবিষ্কৃত হয়েছিল)
- একটি পুরানো Lambda function-এর সমস্ত S3 bucket পড়ার অনুমতি ছিল (একটি test থেকে বাকি)
- একটি service role-এর DynamoDB table-এ write access ছিল যা আর নেই

এটি স্বাভাবিক। IAM configuration সময়ের সাথে অপ্রয়োজনীয় জিনিস সংগ্রহ করে।

**IAM Access Analyzer** হলো একটি AWS service যা স্বয়ংক্রিয়ভাবে resource (S3 bucket, IAM role, KMS key, Lambda function) চিহ্নিত করে যা external entity-র সাথে shared। এটি overly permissive policy-ও চিহ্নিত করে।

নিয়মিত IAM audit আপনার operation-এর অংশ হওয়া উচিত। অনুমতি বাড়ে; তারা organically সংকুচিত হয় না। Access Analyzer invisible কে visible করতে সাহায্য করে।

**Service Control Policy: Organization-স্তরের Guardrail**

আপনার AWS environment একাধিক account-এ বাড়লে (একটি সাধারণ বড় দলের pattern — dev account, staging account, production account), **AWS Organizations** আপনাকে একটি central account থেকে সেগুলি manage করতে দেয়।

Organizations-এর মধ্যে, **Service Control Policy (SCP)** *প্রতিটি* IAM entity-কে প্রভাবিত করে guardrail প্রয়োগ করে, administrator সহ।

উদাহরণ SCP: "dev account-এ কেউ eu-west-1 region-এ EC2 instance তৈরি করতে পারবে না।"

এমনকি dev account-এ administrator access সহ কেউ এই SCP লঙ্ঘন করতে পারবে না। এটি account স্তরের উপরে, organization স্তরে enforce করা হয়।

SCP অনুমতি grant করে না — শুধু সীমাবদ্ধ করে। এগুলি সর্বোচ্চ অনুমতি সংজ্ঞায়িত করে যা একটি account-এর যেকোনো IAM entity কখনো থাকতে পারে।

## শক্তি এবং সীমাবদ্ধতা

**IAM role এবং least privilege কেন গুরুত্বপূর্ণ**:

- Credential আপস হলে blast radius সীমিত করে
- Attacker-কে তাৎক্ষণিকভাবে full access পাওয়ার পরিবর্তে একাধিক সিস্টেমের মাধ্যমে escalate করতে বাধ্য করে
- Audit trail প্রদান করে — CloudTrail log করে কোন role কী করল
- Access সম্পর্কে সচেতন সিদ্ধান্ত বাধ্য করে — "এই service-এর আসলে কী প্রয়োজন?"

**যেখানে জটিল হয়**:

- নির্ভুল IAM policy লিখতে প্রতিটি service-এর action/resource model বোঝা দরকার (এবং প্রতিটি service-এ ডজন ডজন action আছে)
- অতিরিক্ত restrictive policy application ভাঙে — একাধিক service জুড়ে "access denied" error debug করা সময়সাপেক্ষ
- IAM পরিবর্তন সামান্য বিলম্বে (সাধারণত সেকেন্ড, কখনো বেশি) propagate করে — confusing timing issue ঘটাতে পারে
- Cross-account role-এর সতর্ক trust policy configuration প্রয়োজন

## সারসংক্ষেপ

- Production-এ **administrator access** এড়িয়ে চলুন — এটি setup-এর জন্য, operation-এর জন্য নয়।
- IAM policy **Effect**, **Action** এবং **Resource** নির্দিষ্ট করে — সবগুলিতে নির্দিষ্ট হোন।
- **Group**-এ (human-এর জন্য) এবং **role**-এ (service-এর জন্য) policy attach করুন।
- EC2 instance, Lambda function এবং অন্যান্য AWS service **IAM role** ব্যবহার করা উচিত, access key নয়।
- **Permission boundary** যেকোনো identity-র সর্বোচ্চ অনুমতি cap করে, attached policy নির্বিশেষে।
- **SCP** (Service Control Policy) organization-wide restriction প্রয়োগ করে যা administrator-ও override করতে পারে না।
- **IAM Access Analyzer** overly permissive policy এবং resource-এ external access চিহ্নিত করে।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Secure Architectures (ডোমেন ১, টাস্ক ১.১)*

- **EC2-এর জন্য IAM role**: EC2-এর S3, DynamoDB, Secrets Manager বা যেকোনো AWS service অ্যাক্সেস করার প্রয়োজন হলে canonical উত্তর। Instance-এ access key কখনো সংরক্ষণ করবেন না।
- **Policy evaluation logic**: IAM একটি request evaluate করার সময়, এটি একটি explicit allow/deny hierarchy ব্যবহার করে। একটি explicit **Deny** সবসময় জেতে, এমনকি একটি explicit Allow-এর বিরুদ্ধেও। ডিফল্ট হলো Deny।
- **Permission boundary**: IAM administration delegate করার সময় ব্যবহার করা হয়। পরীক্ষার দৃশ্যকল্প: "developer-দের তাদের Lambda function-এর জন্য role তৈরি করার অনুমতি দিন, কিন্তু তাদের কাছে আছে তার বাইরে অনুমতি grant করা prevent করুন।" → Permission boundary।
- **SCP অনুমতি grant করে না**: এগুলি শুধু সীমাবদ্ধ করে। যদি SCP S3 allow করে কিন্তু IAM policy deny করে, S3 denied। যদি SCP S3 deny করে কিন্তু IAM policy allow করে, S3 denied।
- **Resource-based policy**: কিছু AWS service (S3, SQS, Lambda)-এর resource-based policy আছে — permission identity-র সাথে নয়, resource-এ attached। এগুলি IAM policy-র পাশাপাশি কাজ করে।
- **Cross-account access**: Account A-তে IAM role Account B-কে assume করার অনুমতি দেওয়া একটি trust policy সহ। Account B-এর user/role তারপর Account A-তে temporary credential পেতে `sts:AssumeRole` ব্যবহার করে।
- **IAM User বনাম Federated Access**: বড় সংস্থার জন্য, IAM Identity Center বা সরাসরি IdP-এর সাথে federation-এর মাধ্যমে federated access পৃথক IAM user-এর চেয়ে preferred।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

একটি user-এ attached IAM policy এবং একটি EC2 instance দ্বারা assumed IAM role-এর মধ্যে পার্থক্য ব্যাখ্যা করুন। আপনি কখন প্রতিটি ব্যবহার করবেন?

*(ইঙ্গিত: credential নিয়ে ভাবুন — সেগুলি কোথায় থাকে, এবং কে তাদের rotation পরিচালনা করে?)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি Lambda function একটি S3 bucket থেকে read করতে এবং একটি DynamoDB table-এ write করতে হবে। একজন developer development-এর সময় সরলতার জন্য Lambda function-কে `AdministratorAccess` সহ একটি role দিয়েছে। Production-এ যাওয়ার আগে, security team least privilege অনুসরণ করতে চায়।

নিচের কোনটি সর্বোত্তম পদ্ধতি?

A) S3 read এবং DynamoDB write অনুমতি সহ একটি নতুন IAM user তৈরি করুন; একটি access key তৈরি করুন; Lambda environment variable-এ key সংরক্ষণ করুন  
B) Specific bucket ARN-এ `s3:GetObject` এবং specific table ARN-এ `dynamodb:PutItem` grant করে Lambda function-এর execution role-এ একটি inline policy attach করুন  
C) `AdministratorAccess` রাখুন কিন্তু S3 এবং DynamoDB ছাড়া সব action block করা একটি SCP যোগ করুন  
D) S3 read এবং DynamoDB write অনুমতি সহ একটি IAM group তৈরি করুন এবং Lambda function-কে group-এ যোগ করুন

**ইঙ্গিত ১**: Lambda function execution role ব্যবহার করে, access key নয়। কোন বিকল্প এটি সম্মান করে?

**ইঙ্গিত ২**: Least privilege মানে নির্দিষ্ট resource-এ নির্দিষ্ট action, broad policy নয়।

**ইঙ্গিত ৩**: IAM group user ধারণ করে, Lambda function নয়।

**উত্তর**: B

**ব্যাখ্যা**: Lambda execution role-এ শুধুমাত্র function-এর প্রয়োজনীয় নির্দিষ্ট অনুমতি থাকা উচিত। নির্দিষ্ট action (`s3:GetObject`) এবং নির্দিষ্ট resource (bucket ARN, DynamoDB table ARN)-এ scoped inline policy হলো least-privilege implementation।

**কেন A নয়?** Lambda environment variable-এ access key সংরক্ষণ করা একটি নিরাপত্তা antipattern — key Lambda console access বা execution context-এর মাধ্যমে পড়া যায়। Lambda function IAM থেকে temporary credential সহ execution role ব্যবহার করে।

**কেন C নয়?** SCP Organization/account level-এ প্রযোজ্য এবং per-function permission control হিসেবে কাজ করে না। `AdministratorAccess` সহ SCP ভুল layer।

**কেন D নয়?** Lambda function IAM group-এ যোগ করা যায় না। Group শুধুমাত্র IAM user-এর জন্য।

*SAA-C03 ডোমেন: Design Secure Architectures — টাস্ক ১.১*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus তিনটি দলে বেড়েছে: core API team, রেস্তোরাঁ অংশীদার portal team এবং analytics team। প্রতিটি দলে পাঁচজন developer এবং একটি shared AWS account-এ deploy করে।

একটি IAM structure design করুন যা:

- প্রতিটি দলকে শুধুমাত্র তাদের service-এ access দেয়
- Analytics team-কে production database-এ লিখতে prevent করে
- প্রতিটি দলের team lead-কে তাদের service-এর জন্য IAM role তৈরি করার অনুমতি দেয়, কিন্তু তাদের নিজস্ব অনুমতি escalate করতে নয়
- Platform team-এর জন্য সমস্ত service manage করতে পারে এমন একটি admin group প্রদান করে

আপনি কোন IAM construct ব্যবহার করবেন? Permission boundary কোথায় প্রযোজ্য?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো multi-team IAM design অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Leo একটি সপ্তাহান্ত IAM rework করতে কাটাল।

সোমবারের মধ্যে, প্রতিটি service-এর ঠিক প্রয়োজনীয় অনুমতি সহ একটি role ছিল। Soo-Jin এবং Rafael-এর তাদের প্রকৃত job function-এর সাথে matching group membership ছিল। Leo নিজে administrator access drop করেছিল এবং একটি role ব্যবহার করছিল যা সে design করেছিল — তার কাজ করার অনুমতি সহ, এবং আর কিছু নয়।

প্রত্যাশার চেয়ে বেশি সময় নিয়েছিল।

Priya মঙ্গলবার সকালে তার কাজ review করল। সে সাবধানে policy document পড়ল।

"এটা ভালো," সে বলল।

"ধন্যবাদ," Leo বলল, এমন কারো স্বস্তি সহ যে একটি সপ্তাহান্ত JSON দ্বারা humbled হয়ে কাটিয়েছে।

"আপনি একটি জিনিস রেখেছেন।"

Leo কঠিন হয়ে গেল।

"প্রথম সংস্করণ থেকে পুরানো deploy key। একটি GitHub Actions secret-এ।"

"সেটা deactivate করা হয়েছিল।"

Priya কিছু টাইপ করল। "হয়েছিল কি?"

একটি বিরতি।

"আমি এটা deactivate করব," Leo বলল।

"CloudTrail log দেখায় এটা গত সপ্তাহে তিনটি API call করেছে।"

আরো একটি দীর্ঘ বিরতি।

"কিছু এটা ব্যবহার করছিল," Leo বলল। "আমি investigate করব।"

পরবর্তী অধ্যায়ে: security guard যে মুখ মনে রাখে এবং শুধু badge পড়া দরজার মধ্যে পার্থক্য।
