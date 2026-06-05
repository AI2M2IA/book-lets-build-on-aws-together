# অধ্যায় ১৬: Key, Lock এবং Secret

Leo git history review করছিল যখন সে এটি পেল। একটি database password। ছয় মাস আগে committed, plain text-এ, Nimbus-এ আর কাজ করে না এমন কারো দ্বারা। Commit public ছিল। Password তখন থেকে পরিবর্তন করা হয়েছিল — কিন্তু তারা নিশ্চিত ছিল না সেটার জন্য। তারা সেই credential কখনো touch করা প্রতিটি সিস্টেম check করল। চার ঘণ্টা লাগল। সেই দিনটাই Nimbus code-এ secret রাখা বন্ধ করার সিদ্ধান্ত নিল।

**দুটি সমস্যা: Secret সংরক্ষণ এবং ডেটা এনক্রিপ্ট করা**

সংবেদনশীল তথ্যের চারপাশে নিরাপত্তার দুটি আলাদা সমস্যা আছে:

**Credential সংরক্ষণ** (database password, API key, connection string): এগুলি কোথায় থাকে? কে অ্যাক্সেস করতে পারে? Application redeploy না করে কীভাবে rotate করেন?

**ডেটা এনক্রিপ্ট করা** (গ্রাহক তথ্য, payment record, PII): আপনি কীভাবে নিশ্চিত করেন যে কেউ আপনার database বা S3 bucket-এ unauthorized অ্যাক্সেস পেলেও, তারা ডেটা পড়তে পারে না?

AWS-এর প্রতিটি সমস্যার জন্য একটি dedicated service আছে:

- **AWS Secrets Manager**: Credential নিরাপদে সংরক্ষণ এবং পরিচালনা করে
- **AWS KMS (Key Management Service)**: ডেটা এনক্রিপ্ট এবং decrypt করার জন্য encryption key পরিচালনা করে

**AWS Secrets Manager: আর Hardcoded Credential নয়**

Secrets Manager হলো secret-এর জন্য একটি secure store: database credential, API key, OAuth token, SSH key, বা যেকোনো সংবেদনশীল।

আপনার application একটি environment variable বা config file থেকে password পড়ার পরিবর্তে, এটি startup-এ (বা প্রয়োজনে) Secrets Manager API call করে এবং secret retrieve করে। Secret কখনো disk স্পর্শ করে না। কখনো আপনার code-এ প্রদর্শিত হয় না। আপনার environment variable-এ নেই।

প্রবাহ এভাবে দেখায়:

**পুরানো উপায়**:
```
DB_PASSWORD=supersecretpassword123  # .env file বা environment variable-এ
```

**Secrets Manager উপায়**:
```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

EC2 instance-এর সেই নির্দিষ্ট secret-এর জন্য `secretsmanager:GetSecretValue` call করার অনুমতি সহ একটি IAM role প্রয়োজন। অন্য কোনো service এটি পড়তে পারে না। Secret কখনো code-এ নেই।

**Automatic Rotation: প্রকৃত শক্তি**

Secrets Manager-এর সবচেয়ে বড় feature secret সংরক্ষণ নয় — এটি সেগুলি স্বয়ংক্রিয়ভাবে rotate করা।

দৃশ্যকল্প: প্রতি ৩০ দিনে, Secrets Manager একটি নতুন database password তৈরি করে, RDS-এ আপডেট করে, stored secret আপডেট করে এবং আপনার application পরবর্তীবার প্রয়োজন হলে নতুন password retrieve করে। কোনো manual intervention নেই। কোনো deployment নেই। কোনো "এটা rotate করতে মনে রাখতে হবে।"

Rotation একটি Lambda function হিসেবে implement করা হয়। AWS RDS database (MySQL, PostgreSQL, Aurora)-এর জন্য template প্রদান করে। আপনি যেকোনো credential type-এর জন্য function customize করতে পারেন।

Tom cost সম্পর্কে একটি প্রশ্ন করল। (অবশ্যই।)

Secrets Manager প্রতি secret প্রতি মাসে plus প্রতি API call চার্জ করে। কম সংখ্যক database password এবং API key-এর জন্য, cost হলো মাসে কয়েক ডলার — একটি ঘটনার cost-এর তুলনায় negligible।

"গত সপ্তাহের compromise," Priya বলল, "investigate এবং remediate করতে কত খরচ হল?"

Tom একটি মুহূর্ত চুপ ছিল। "আমার সময়, আপনার সময়, Leo-র সপ্তাহান্ত সহ... কয়েক হাজার ডলার।"

"Secrets Manager static key exploit হওয়ার আগে catch করত। এবং এটি স্বয়ংক্রিয়ভাবে rotate করত।"

Tom pricing page তুলল।

**AWS KMS: Lock Factory**

AWS KMS (Key Management Service) **cryptographic key** পরিচালনা করে — encryption এবং decryption-এর জন্য ব্যবহৃত secret value।

উপমা: KMS একটি lockbox company-র মতো যা master key ধরে রাখে। আপনার ডেটা (box-এর বিষয়বস্তু) encrypted। শুধুমাত্র KMS key ব্যবহার করার অনুমতি সহ কেউ এটি decrypt করতে পারে। KMS CloudTrail-এ প্রতিটি key-এর প্রতিটি ব্যবহার log করে।

**Customer Master Key (CMK)** — এখন KMS key বলা হয় — দুটি type-এ আসে:

**AWS managed key**: S3, EBS, RDS-এর মতো service-এর জন্য AWS স্বয়ংক্রিয়ভাবে key তৈরি এবং পরিচালনা করে। আপনি সরাসরি key নিয়ন্ত্রণ করেন না, কিন্তু এটি ব্যবহার হচ্ছে দেখতে পারেন। বিনামূল্যে।

**Customer managed key**: আপনি KMS-এ key তৈরি করেন এবং এর প্রতিটি দিক নিয়ন্ত্রণ করেন: কে ব্যবহার করতে পারে, কখন rotate হয়, কে administer করতে পারে। আপনি স্বয়ংক্রিয় বার্ষিক rotation সক্ষম করতে পারেন। Cost: প্রতি মাসে $১/key plus per-API-call charge।

**AWS Service-এ Encryption: KMS Integration**

বেশিরভাগ AWS service encryption-এর জন্য KMS-এর সাথে integrate করে:

**S3**: একটি bucket-এ "server-side encryption with KMS" সক্ষম করুন। প্রতিটি object rest-এ একটি KMS key দিয়ে encrypted। একটি object পড়তে S3 bucket *এবং* KMS key উভয়ের অনুমতি প্রয়োজন।

**RDS**: তৈরির সময় encryption সক্ষম করুন। Database storage, backup এবং snapshot সব একটি KMS key দিয়ে encrypted। Note: একটি existing unencrypted RDS instance-এ encryption সক্ষম করা যায় না — snapshot করতে হবে, encryption সক্ষম করে snapshot copy করতে হবে এবং encrypted snapshot থেকে restore করতে হবে।

**EBS**: KMS দিয়ে volume encrypt করুন। Encrypted snapshot থেকে তৈরি নতুন volume স্বয়ংক্রিয়ভাবে encrypted।

**DynamoDB**: Rest-এ KMS দিয়ে encryption সমস্ত table-এ ডিফল্টরূপে সক্ষম।

**ElastiCache Redis**: সংবেদনশীল cached ডেটার জন্য KMS দিয়ে rest-এ encryption।

Principle: ডেটা rest-এ (disk-এ stored) এবং transit-এ (network-এর মাধ্যমে moving) encrypted হওয়া উচিত। KMS rest-এ encryption সামলায়। TLS/SSL (AWS service দ্বারা স্বয়ংক্রিয়ভাবে প্রদান) transit-এ encryption সামলায়।

**Envelope Encryption: KMS আসলে কীভাবে কাজ করে**

এখানে একটি বিস্তারিত যা KMS আচরণ এবং পরীক্ষার প্রশ্ন বুঝতে সাহায্য করে।

বেশিরভাগ ক্ষেত্রে KMS সরাসরি আপনার ডেটা encrypt করে না। এটি **envelope encryption** ব্যবহার করে:

১. KMS একটি **data key** তৈরি করে (একটি unique symmetric key)
২. Service data key ব্যবহার করে আপনার ডেটা locally encrypt করে (দ্রুত — symmetric encryption)
৩. Service KMS-কে data key নিজেই encrypt করতে বলে (আপনার KMS key ব্যবহার করে)
৪. Encrypted ডেটা এবং encrypted data key উভয়ই stored
৫. আপনার প্রকৃত ডেটা কখনো service ছেড়ে যায় না — শুধুমাত্র data key encryption/decryption-এর জন্য KMS-এ যায়

ডেটা পড়লে:

১. Service KMS-কে data key decrypt করতে বলে
২. KMS অনুমতি check করে, data key decrypt করে, return করে
৩. Service decrypted data key ব্যবহার করে আপনার ডেটা locally decrypt করে

এর মানে KMS সমস্ত ডেটা KMS API-এর মাধ্যমে না পাঠিয়ে খুব বড় ডেটা handle করতে পারে। শুধুমাত্র ছোট key KMS-এ যায়। CloudTrail প্রতিটি KMS API call log করে — প্রতিটি encrypt এবং decrypt operation।

**Secrets Manager বনাম Parameter Store**

AWS-এর **Systems Manager Parameter Store**-ও আছে, যা configuration value (শুধু secret নয়) store করে। Parameter Store সস্তা — standard parameter বিনামূল্যে। এটি KMS ব্যবহার করে encrypted parameter-ও store করতে পারে।

Rotation প্রয়োজন secret-এর জন্য: Secrets Manager।

General configuration value এবং non-sensitive parameter-এর জন্য: Parameter Store (free tier খুব generous)।

Application configuration-এর জন্য (port number, feature flag, environment-specific setting): Parameter Store।

## শক্তি এবং সীমাবদ্ধতা

**AWS Secrets Manager**:

- Code পরিবর্তন ছাড়া Automatic secret rotation
- প্রতি secret-এ fine-grained IAM access control
- Rotation-এর সময় versioning (পূর্ববর্তী version অ্যাক্সেস)
- CloudTrail-এর মাধ্যমে Audit
- Cost: ~$০.৪০/secret/month + API call

**AWS KMS**:

- Full audit trail সহ Centralized key management
- Customer-managed key-এর জন্য Automatic annual key rotation
- প্রতি key-এ fine-grained IAM permission (key policy + IAM policy)
- Hardware Security Module (HSM) backed — key কখনো HSM ছেড়ে যায় না
- Cost: $১/month প্রতি key + $০.০৩ প্রতি ১০,০০০ API call

**যেখানে জটিল হয়**:

- KMS key policy (IAM policy থেকে আলাদা এবং পাশাপাশি evaluate করা) — debug করা confusing হতে পারে
- Rest-এ encryption পরিকল্পনা করতে হবে — existing unencrypted RDS instance in-place encrypt করা যায় না
- KMS-এ Key deletion-এর ৭-৩০ দিনের waiting period আছে (safety mechanism — হারানো key মানে হারানো ডেটা)
- Secrets Manager cost scale-এ secret এবং API call সংখ্যার সাথে বাড়ে

## সারসংক্ষেপ

- Version control, environment variable, বা commit করা config file-এ credential কখনো store করবেন না।
- **Secrets Manager** credential নিরাপদে store করে এবং স্বয়ংক্রিয়ভাবে rotate করে। Application API-এর মাধ্যমে secret fetch করে।
- **KMS** encryption key পরিচালনা করে। বেশিরভাগ AWS service rest-এ encryption-এর জন্য KMS-এর সাথে integrate করে।
- **Rest-এ encryption** (disk-এ stored ডেটা) AWS বা আপনার দ্বারা managed KMS key ব্যবহার করে। **Transit-এ encryption** TLS ব্যবহার করে।
- **Envelope encryption**: KMS key encrypt করে, ডেটা সরাসরি নয়। Service একটি local data key ব্যবহার করে ডেটা encrypt করে।
- **Customer-managed KMS key**: rotation, access এবং audit-এর উপর সম্পূর্ণ নিয়ন্ত্রণ। **AWS-managed key**: স্বয়ংক্রিয়, কোনো configuration দরকার নেই।
- **Parameter Store** non-sensitive configuration value-এর জন্য একটি lighter বিকল্প।

## পরীক্ষার টিপস

*SAA-C03 ডোমেন: Design Secure Architectures (ডোমেন ১, টাস্ক ১.৩)*

- **Secrets Manager বনাম SSM Parameter Store**: Automatic rotation প্রয়োজন credential-এর জন্য Secrets Manager; general configuration-এর জন্য Parameter Store। পরীক্ষা rotation requirement এবং cost sensitivity দ্বারা তাদের আলাদা করে।
- **KMS key policy**: একটি KMS key-এর নিজস্ব key policy আছে (একটি resource-based policy)। IAM policy একা KMS key-এ অ্যাক্সেস grant করে না — key policy এটি explicitly allow করতে হবে।
- **RDS Encrypt করা**: Existing unencrypted RDS instance-এ encryption সক্ষম করা যায় না। Process: snapshot তৈরি করুন → encryption সক্ষম করে snapshot copy করুন → encrypted snapshot থেকে restore করুন → নতুন instance-এ ট্রাফিক migrate করুন।
- **EBS encryption**: নতুন volume encrypt করা যায়। Encrypted snapshot-এর snapshot সবসময় encrypted। Unencrypted volume সরাসরি encrypt করা যায় না — snapshot + copy + restore।
- **CloudTrail + KMS**: প্রতিটি KMS API call CloudTrail-এ logged। এটি একটি মূল compliance feature।
- **Multi-Region KMS key**: Multiple region-এ key material replicate করুন যাতে cross-region API call ছাড়া decryption হতে পারে। পরীক্ষা encrypted ডেটা সহ multi-region disaster recovery-এর জন্য এটি ব্যবহার করে।
- **KMS বনাম CloudHSM**: KMS multi-tenant (AWS দ্বারা managed)। CloudHSM একটি dedicated hardware security module যা শুধুমাত্র আপনি নিয়ন্ত্রণ করেন। পরীক্ষার সংকেত: "FIPS 140-2 Level 3," "dedicated HSM," "customer-managed cryptographic operation" → CloudHSM।

## অনুশীলন

**অনুশীলন ১ — স্মরণ**

Envelope encryption-এর ধারণা ব্যাখ্যা করুন। KMS সরাসরি আপনার application ডেটা encrypt করার পরিবর্তে কেন একটি ছোট data key encrypt করে?

*(ইঙ্গিত: ১GB ডেটা encrypt করতে হলে এবং ১GB একটি remote KMS service-এ পাঠানোর performance implication কী হবে সে সম্পর্কে ভাবুন।)*

**অনুশীলন ২ — পরীক্ষার অনুশীলন**

*দৃশ্যকল্প*: একটি financial services company একটি RDS MySQL database-এ সংবেদনশীল গ্রাহক ডেটা store করে। একটি নতুন compliance requirement mandate করে যে:

১. সমস্ত ডেটা rest-এ encrypted হতে হবে
২. সমস্ত encryption key usage auditable হতে হবে
৩. Encryption key customer-controlled হতে হবে (AWS দ্বারা managed নয়)
৪. Database password প্রতি ৯০ দিনে automatically rotate হতে হবে

Database ছয় মাস আগে encryption ছাড়া তৈরি হয়েছিল। কোন set of action সমস্ত চারটি প্রয়োজনীয়তা সর্বোত্তমভাবে পূরণ করে?

A) Existing database-এ RDS encryption সক্ষম করুন; একটি customer-managed KMS key তৈরি করুন; ৯০-day rotation সহ Secrets Manager configure করুন  
B) Existing database-এর snapshot তৈরি করুন; customer-managed KMS key ব্যবহার করে encryption সহ snapshot copy করুন; encrypted snapshot থেকে restore করুন; ৯০-day rotation সহ Secrets Manager configure করুন  
C) AWS-managed key সহ একটি নতুন encrypted RDS instance তৈরি করুন; পুরানো instance থেকে ডেটা migrate করুন; ৯০-day rotation সহ Secrets Manager configure করুন  
D) AWS-managed key ব্যবহার করে existing database-এ RDS at-rest encryption সক্ষম করুন; ৯০-day rotation সহ Secrets Manager configure করুন

**ইঙ্গিত ১**: Existing unencrypted RDS instance-এ directly encryption সক্ষম করা যায় না।

**ইঙ্গিত ২**: "Customer-controlled" key মানে customer-managed KMS key, AWS-managed key নয়।

**ইঙ্গিত ৩**: Snapshot copy process হলো encrypted RDS-এ standard migration path।

**উত্তর**: B

**ব্যাখ্যা**: RDS encryption existing instance-এ সক্ষম করা যায় না। Standard approach হলো: existing instance-এর snapshot → customer-managed KMS key ব্যবহার করে encryption সহ snapshot copy (requirement ১, ২, ৩ satisfy করে) → encrypted snapshot থেকে restore। Customer-managed KMS key CloudTrail-এ স্বয়ংক্রিয়ভাবে সমস্ত usage log করে (auditing) এবং আপনার নিয়ন্ত্রণে encryption key রাখে। Secrets Manager স্বয়ংক্রিয় ৯০-day password rotation handle করে (requirement ৪ satisfy করে)।

**কেন A নয়?** Existing unencrypted RDS instance-এ encryption in-place সক্ষম করা যায় না।

**কেন C নয়?** AWS-managed key "customer-controlled" requirement (requirement ৩) satisfy করে না।

**কেন D নয়?** A-এর মতো একই সমস্যা (in-place সক্ষম করা যায় না) plus AWS-managed key requirement ৩ satisfy করে না।

*SAA-C03 ডোমেন: Design Secure Architectures — টাস্ক ১.৩*

**অনুশীলন ৩ — আর্কিটেকচার চ্যালেঞ্জ** *(ঐচ্ছিক)*

Nimbus নিম্নলিখিত sensitive ডেটা store করতে হবে:

- Production RDS instance-এর database password
- Payment processing-এর জন্য Stripe API secret key
- DynamoDB-এ customer order history encrypt করার জন্য একটি symmetric encryption key
- Per-restaurant configuration value (API endpoint, feature flag — sensitive নয়)

আপনি প্রতিটির জন্য কোন AWS service বা approach ব্যবহার করবেন? প্রতিটিতে কোন rotation strategy apply করবেন?

*(একটি একক সঠিক উত্তর নেই। লক্ষ্য হলো security সরঞ্জামকে use case-এর সাথে matching অনুশীলন করা।)*

## পোস্ট-ক্রেডিটস দৃশ্য

Secret migrate করা হয়েছিল।

Database password: Secrets Manager, প্রতি ৩০ দিনে rotating।

API key: Secrets Manager, payment provider-এর API call করে একটি নতুন key generate করা rotation Lambda সহ।

গ্রাহকের অর্ডার ডেটা: customer-managed KMS key দিয়ে encrypted।

পুরানো credential: deactivate। পুরানো config file: deleted। পুরানো GitHub Actions secret: removed।

"আমরা এখন audit-ready," Priya বলল।

"Audit-ready সংজ্ঞায়িত করুন," Maya বলল।

"একজন compliance auditor যদি আমাদের প্রমাণ করতে বলে যে আমাদের code-এ বা অবকাঠামোতে কোনো credential hardcode নেই, আমরা দেখাতে পারি: প্রতিটি secret Secrets Manager-এ, প্রতিটি encryption key KMS-এ, প্রতিটি অ্যাক্সেস CloudTrail-এ logged।"

"শেষবার কেউ CloudTrail log check করেছে?"

একটি বিরতি।

"আমি প্রতি সপ্তাহে check করি," Priya বলল।

"কিছু unusual দেখা গেলে, আমরা কীভাবে জানব?"

"সেটাই," Priya বলল, তার laptop বন্ধ করে, "পরবর্তী কথোপকথন।"

পরবর্তী অধ্যায়ে: Nimbus এবং ইন্টারনেটের মধ্যে দাঁড়িয়ে তিনটি প্রতিরক্ষার স্তর।
