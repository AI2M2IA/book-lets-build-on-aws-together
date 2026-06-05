# Chapter 5: The Filing Cabinet That Lives in the Cloud

Leo was cleaning up the EC2 instance at nine in the morning when he found the folder.

The office was quiet. Maya hadn't arrived yet. The coffee was still brewing. Outside the window, the early commuters were trickling past. Leo had his headphones in and was scrolling through directories when he stopped.

Eight hundred files. All of them menu photos. All of them on a single machine with no backup.

The EC2 instance where the Nimbus app ran had been upgraded once since the twelve-minute outage, but the photo storage had never moved. Every crispy arepa, every grilled salmon plate, every perfectly plated salad bowl — sitting on a single virtual machine that they'd already proved could go down without warning.

And if that machine was ever restarted, resized, or replaced?

Gone.

"How many photos have customers uploaded so far?" Maya asked, when she arrived.

Leo turned around. "About eight hundred."

"And what happens to those eight hundred photos if we restart the server?"

Another one of Leo's meaningful pauses.

This chapter is about where files actually belong in the cloud.

**The Problem With Storing Files "On the Server"**

When you store files directly on an EC2 instance — inside its filesystem — you're
tying those files to the lifecycle of that specific machine.

This creates several problems:

**Ephemeral by nature.** EC2 instances can be stopped, terminated, replaced. Their
local disk is not meant to be permanent. It's temporary scratch space.

**Single point of failure.** If the instance fails, the files go with it. No
redundancy. No backup. One bad morning and eight hundred menu photos disappear.

**Can't share across instances.** When you add a second server (which you will, in
Chapter 7), it won't see the files stored on the first server's disk. The two servers
are isolated. A user who uploads a photo might see it; another user hitting a different
server might not.

**No scale.** EC2 disk space is finite. If you fill it up, you either stop accepting
uploads or scramble to expand storage under pressure.

Leo had not considered what happened with multiple servers. He mentioned it casually to Priya.

"Wait — how would the photo issue work with two servers?" Priya asked.

"What do you mean?"

"If we have Server A and Server B behind a load balancer," Priya said, "and a customer uploads a photo — their request goes to Server A, right? So the photo is saved on Server A's disk. Now their next request goes to Server B. Server B doesn't have the photo. What does the customer see?"

Leo opened his mouth. Then closed it.

"A broken image," he said finally.

"Or a 404 error," Priya said. "Or, if the application tries to load it and crashes, an error page."

She sketched the load-balancer plan on the whiteboard — adding a second server was already on the roadmap. The moment it happened, every photo upload would become a coin flip: upload to Server A, possibly served from Server B, photo missing, customer confused.

"We'd have been debugging it for a week before figuring out what was wrong," Leo said.

"Have we thought about what happens when we turn on Auto Scaling and suddenly have three or four servers?" Priya asked. "We'd be missing photos constantly."

This is a class of bug that doesn't show up in unit tests. It only appears in production, under load, when real traffic is spread across multiple servers. The fix is to stop storing files on the servers entirely.

There's a better model. AWS built it in 2006, and it's still one of the most widely
used cloud services in the world.

**The Hard Drive That Lives Online**

Picture a hard drive that lives on the internet — one that scales to hold as much as
you ever need, and charges you only for what you actually use. You never provision it.
You never worry about running out of space. If you put eight hundred photos in today
and eight million in next year, nothing changes on your end except the bill line item.

That's what AWS offers. They call it **Amazon S3** — Simple Storage Service.

S3 is AWS's object storage service. It is not quite like a filesystem, and not quite
like a database. It stores files — called objects — in named containers called buckets.
The model is simple, and that simplicity is the point.

The key concept in S3 is the **object**.

An object is any file: a photo, a video, a PDF, a CSV, a backup, a log file. S3
doesn't care about the type or structure. It stores bytes and gives them back when
you ask.

Objects live inside **buckets**. A bucket is like a top-level folder — a named
container within S3 that holds your objects. Each bucket has a globally unique name
(no two buckets across all AWS accounts can share a name) and exists in a specific
Region.

**How S3 Works**

You **upload** an object to a bucket. S3 gives it a **key** — essentially a path name
like `menus/restaurant-001/photo-arepa.jpg`. That key uniquely identifies the object
within the bucket.

You **download** (or retrieve) the object using the bucket name and key.

You can also make objects publicly accessible — meaning anyone with the URL can download
them. This is how most websites serve images: store the image in S3, make it public,
embed the URL in your HTML.

Or you keep objects private — only accessible to authenticated requests. This is the
right model for customer data, backups, and anything sensitive.

S3 is not a filesystem. There are no real folders. The `/` in a key name is just
a convention — S3 treats the entire key as a flat string. But it looks like folders
and most tools present it as folders, so don't worry about this distinction in
practice.

There are a few operational characteristics of S3 that matter in practice but aren't
obvious from the description:

**Object immutability**: S3 objects are not edited in place. If you update a file, you
upload a new version of the object with the same key. S3 replaces the old object with
the new one (or, with versioning enabled, keeps both). Unlike a database where you
`UPDATE` a row, S3 objects are write-once, read-many. For text files and documents
you edit frequently, this is fine — just upload the new version. For very large files
where you only want to update part of the content, S3's object model means you
re-upload the entire file every time.

**Strong read-after-write consistency**: As of December 2020, S3 provides strong
consistency for all objects — new writes are immediately visible to subsequent reads.
Before 2020, S3 had eventual consistency for some operations, which caused subtle bugs
in applications that wrote an object and immediately tried to read it. The consistency
model improvement eliminated this class of bugs.

**Object URLs**: Every S3 object has a URL. For a public object, it looks like:
`https://bucket-name.s3.region.amazonaws.com/key/path`. For private objects, you
can generate pre-signed URLs that include authentication information and expire after
a configured time. Both URL formats are how applications and browsers actually retrieve
objects — there's no proprietary protocol involved.

**No directories to create**: Because S3 has no real folders, there are no directory
creation operations. You simply upload an object with a key that includes the path
prefix. The "folder" appears automatically in the console when objects with that prefix
exist, and disappears automatically when all objects with that prefix are deleted.

**Why S3 Is Different From a Regular Hard Drive**

Three things make S3 fundamentally different from file storage on an EC2 instance:

**Durability.** AWS designs S3 for 99.999999999% (eleven nines) durability. That means
that if you store ten million objects, you might expect to lose one object every ten
thousand years due to hardware failure. They achieve this by storing multiple copies
of every object across at least three Availability Zones automatically.

But durability protects against hardware failure — not against you accidentally deleting something. That's what versioning is for.

There's an important distinction between **durability** and **availability**. Durability is about whether your data still exists. Availability is about whether you can access it right now. S3 Standard offers 99.999999999% durability and 99.99% availability. The durability number is almost incomprehensibly high; the 99.99% availability figure is a *design target* — about 52 minutes of unavailability per year. The contractual *SLA* is actually lower (99.9% per month), and missing it earns you service credits, not uptime. In practice, S3 availability is much higher than either number — but it's worth understanding that durability and availability are separate guarantees, and that design targets and SLAs are separate promises.

**Availability.** S3 is designed to be accessible even when individual components
fail. You're not connecting to one server — you're connecting to a distributed system
that routes around failures.

**Scale.** S3 holds an essentially unlimited amount of data. A single bucket can hold
trillions of objects. Amazon itself uses S3 to store data at a scale that's hard to
comprehend. The largest S3 buckets in the world hold exabytes of data — millions of
terabytes. You don't manage this scale; you just upload objects and S3 handles
everything underneath.

**Cost.** S3 Standard costs approximately $0.023 per GB per month as of this writing.
For Nimbus's eight hundred menu photos at an average of 2MB each, that's 1.6 GB of
storage — about $0.04 per month. Even at 800,000 photos, you're looking at $37 per
month for storage. The cost of the same storage on an EBS volume would be approximately
$128 per month, with a fixed ceiling that required expansion before you could add more.
S3 grows automatically and charges proportionally. EBS has a fixed size and a fixed cost.

**Versioning: The Undo Button**

Here's something Maya found when she was exploring the S3 console.

S3 supports **versioning**. When you enable versioning on a bucket, S3 keeps every
version of every object — including previous versions and deleted versions.

This is the undo button for your files.

Priya wanted to test it before trusting it. She uploaded a menu photo to the bucket, then uploaded a new version with the wrong file — an all-black image she created in thirty seconds.

She opened the S3 console, clicked "Show versions," and found both: the bad version (current) and the original (previous). She restored the previous version by copying it back as the new current version.

"It works," she said.

"How much does it cost to keep all those versions?" Tom asked.

You pay for storage of every version. If you have many versions of large files, it
adds up. AWS has **lifecycle policies** that automatically delete old versions after
a certain time — we cover those in Chapter 23 when we go deep on cost optimization.

"So we enable versioning but set a lifecycle rule to delete old versions after thirty days," Priya said. "That way we have a recovery window without paying to store every version forever."

Tom wrote the number down. The storage cost for thirty days of versions was acceptable.

**S3 Event Notifications: Files That Do Things**

Leo was looking at the menu photos from a different angle.

"Right now," he said, "when a restaurant uploads a photo, we store the original at full resolution. Some of them are four thousand by three thousand pixels. Every time a customer loads the menu page on a phone, we're serving a four-megabyte image."

"How much does that cost in bandwidth?" Tom asked.

Leo pulled up the data transfer numbers on the bill. The answer was "more than it should be."

S3 has a feature called **Event Notifications**. When an object is uploaded to a bucket, S3 can automatically trigger another service — like Lambda, the serverless computing service we cover in Chapter 20. That trigger can run code in response to the upload without any manual intervention.

The Nimbus solution: every time a photo is uploaded to the raw photos bucket, an S3 Event Notification triggers a Lambda function. The Lambda function reads the original photo, generates a 400-pixel-wide thumbnail, and saves it to a processed photos bucket. The customer-facing app serves the thumbnail instead of the original.

The pipeline:

1. Restaurant uploads 4MB original photo to `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. S3 fires Event Notification
3. Lambda function reads the original, generates a 400x300 thumbnail
4. Lambda saves thumbnail to `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. Customer loads menu, app serves the 40KB thumbnail instead of the 4MB original

The result: 99% reduction in image bandwidth. Faster page loads. A smaller data transfer line on the bill. The originals are preserved in the raw bucket, so if Nimbus ever wants to generate higher-resolution versions, the source material is there.

"That runs automatically?" Maya asked.

"Every time anyone uploads a photo," Leo said. "We never touch it."

This pattern — event-driven processing triggered by storage events — is one of the most common and powerful patterns in modern cloud architecture. We revisit it thoroughly in Chapter 20.

**Cross-Region Replication: When One Copy Isn't Enough**

Priya raised a compliance question at the end of the week.

"If Nimbus expands to serve restaurants in the EU," she said, "and those restaurants upload photos — are those photos stored in our `us-west-2` bucket?"

"Yes," Leo said.

"And does GDPR have anything to say about where that data is stored?"

It does. GDPR's data transfer provisions mean that personal data about EU residents may require storage within the EU or in a jurisdiction with adequate data protection.

S3's answer to this is **Cross-Region Replication** (CRR). When you enable CRR on a bucket, every new object uploaded is automatically replicated to a bucket in another Region. You configure the source bucket, the destination bucket, and the IAM role that gives S3 permission to perform the replication.

When the EU expansion happens, the plan is this: photos uploaded by EU restaurants will go into an `eu-west-1` bucket, and CRR will replicate them to a backup bucket in `eu-central-1` (Frankfurt) for disaster recovery. EU data stays in EU Regions.

"How much would that cost?" Tom asked.

Cross-region data transfer and storage costs apply — roughly the per-GB transfer rate from the source Region to the destination, plus storage for the replicated copies. Tom did the math on Nimbus's projected EU photo volume and determined it would be acceptable.

"And what if someone tries to break in to the replication pipeline?" Priya asked. "The IAM role that performs replication should be scoped tightly — only S3 replication actions, only on the specific buckets."

She wrote that requirement into the expansion plan.

**Multipart Upload and the Incomplete Upload Problem**

Tom found an unexpected line item on the AWS bill.

"We're paying for storage in S3," he said, "but the amount is higher than I'd expect from the number of photos we have."

Leo investigated. He found a category in the S3 Storage Lens report: **incomplete multipart uploads**.

When S3 uploads a file larger than a certain size, it uses **multipart upload**: the file is split into parts, each part is uploaded separately, and then the parts are assembled into the final object. This makes large uploads more reliable — if one part fails, only that part needs to be retried, not the entire file.

But if a multipart upload is started and then abandoned — the user closed the browser, the network dropped, the application crashed — the partial parts remain in S3, accumulating storage charges. They're not visible as completed objects, but they're being billed as storage.

"How much?" Tom asked.

"About $12 a month," Leo said. "From partial uploads that were never completed."

The fix: an S3 **lifecycle rule** that automatically deletes incomplete multipart uploads after seven days. Any upload that hasn't completed in a week is abandoned, and the partial parts are cleaned up.

Tom added the lifecycle rule that afternoon. The $12/month charge disappeared within days.

"That's $144 a year," Tom said, looking at his spreadsheet. "For nothing."

"I already set up a load test that used multipart uploads," Leo said. "Oh." A pause. "That's probably most of them. I forgot to clean it up when the test was done."

Tom wrote it down anyway.

**Access Control: Public vs. Private**

By default, everything in S3 is private. Only your AWS account can access it.

You can make individual objects public — which is how you'd serve menu images to
website visitors. Or you can keep everything private and generate **pre-signed URLs**:
time-limited links that let someone download a specific object without needing AWS
credentials. Perfect for letting a customer download their invoice for 24 hours.

Priya had very strong opinions about this.

"And what if someone tries to break in through a misconfigured bucket?" she said. "Never make a bucket fully public unless you've consciously decided to make every
object in it accessible to the entire internet. The most common S3 security
mistake is accidentally exposing a bucket that contains sensitive data."

AWS now has a "Block Public Access" setting that you can apply at the account level,
forcing all buckets to be private unless you explicitly override it per-bucket.

Enable it. Always.

The history behind this: before AWS added account-level Block Public Access, the most
common S3 security incident was accidentally making a bucket public. A developer created
a bucket for testing, checked the "public" box for convenience, added some files including
a few from other folders they hadn't thought about, and then forgot about it. The bucket
sat there, publicly accessible, for months. In a few high-profile cases, the "forgotten
test bucket" contained customer data, internal documents, or credentials.

Account-level Block Public Access is a safeguard against this. Even if a developer
accidentally configures a bucket to be public, the account-level setting overrides it.
You have to explicitly disable the account-level setting before any bucket can become
public — which creates a deliberate speed bump that prevents accidents.

Nimbus had Block Public Access enabled at the account level. So how would menu images
that needed to be publicly accessible get served? The standard pattern — one Nimbus
would adopt later, in Chapter 13 — is to put a CDN like CloudFront in front of the
bucket with an Origin Access Control policy: the CDN can fetch objects from a private
S3 bucket, but no one can access the bucket directly. This pattern is more secure than
a public bucket and allows the CDN's caching to reduce S3 request costs.

"Wait — but *why* would we do it that way?" Maya asked. "The images are public anyway,
so why does it matter if the bucket is public?"

"Because a public bucket means anyone can enumerate what's in it," Priya said. "They
can list all the objects in the bucket. With CloudFront in front, they only see the
URLs we expose in the application. The bucket itself stays private."

Maya added "enumerate" to her mental model of attack surfaces.

**S3 Storage Classes: Not All Data Is Equal**

Not all data is accessed equally.

Your most popular menu photos are fetched dozens of times per second. Your logs from
three years ago are accessed maybe once a year, if at all. S3 recognizes this and offers
different **storage classes** with different performance and cost trade-offs.

| Storage Class           | Use Case                                      | Retrieval        | Cost                        |
|-------------------------|-----------------------------------------------|------------------|-----------------------------|
| S3 Standard             | Frequently accessed data                      | Immediate        | Higher per GB               |
| S3 Standard-IA          | Infrequent access, still needs fast retrieval | Immediate        | Lower per GB, retrieval fee |
| S3 Glacier Instant      | Archives accessed occasionally                | Immediate        | Much lower                  |
| S3 Glacier Flexible     | Archives rarely accessed                      | Minutes to hours | Very low                    |
| S3 Glacier Deep Archive | Compliance archives, accessed almost never    | Up to 12 hours   | Lowest                      |

We go deep on these in Chapter 23. For now: the concept is that you can automatically
move objects between storage classes based on their age and access patterns, saving
significant money on data you rarely touch.

There's also **S3 Intelligent-Tiering** — a storage class that automatically moves
objects between frequent-access and infrequent-access tiers based on observed access
patterns. You pay a small monitoring fee per object per month, and S3 handles the
tiering automatically. This is useful when you're not sure which objects will be
accessed frequently and which won't — the service learns the pattern and optimizes
accordingly.

Tom's approach was more manual: "I want to know where every dollar is going." He chose
explicit lifecycle rules over Intelligent-Tiering, because explicit rules are predictable
and auditable. After six months of operating Nimbus's S3 storage, he had a clear picture
of the access patterns and could set lifecycle rules that moved objects to Standard-IA
after 30 days and to Glacier Flexible Retrieval after 180 days.

The total storage savings from lifecycle management in the first year: approximately
$340. Not life-changing, but real — and the pattern repeats across dozens of buckets
in any serious AWS account.

"That's almost a round-trip flight," Maya said.

"It's good engineering practice," Tom said. He put it in the spreadsheet.

There is one trap in the storage class selection that catches many teams: **minimum
storage duration**. S3 Standard-IA has a minimum 30-day storage duration — if you
store an object in Standard-IA and delete it after 15 days, you still pay for 30 days.
Glacier Flexible Retrieval has a 90-day minimum. Glacier Deep Archive has a 180-day
minimum.

For objects that are deleted frequently or have short lifespans, these minimums make
the IA and Glacier classes more expensive than Standard, not less. Before moving to a
cheaper storage class, verify that the objects will actually live there long enough for
the savings to exceed the minimum duration penalties.

## Strengths and Limitations

**Why S3 is excellent**:

- Eleven-nines durability. Your data is safer in S3 than on almost any other system.
- Unlimited scale. You never need to provision storage — it just grows.
- Extremely cheap for what it provides (fractions of a cent per GB per month).
- Native integration with almost every other AWS service.
- Supports static website hosting — you can serve a complete static website
  directly from S3, no server required.
- Event-driven processing: S3 Event Notifications trigger Lambda, SQS, or SNS
  automatically when objects are created or deleted, enabling powerful processing
  pipelines without polling or scheduled jobs.
- Cross-Region Replication for compliance data residency and disaster recovery.

**Where S3 is not the right choice**:

- S3 is not a filesystem. If your application needs to mount a drive and use it like
  a local disk (reading, writing, modifying files in place), S3 is the wrong tool.
  Use EFS (Elastic File System, Chapter 6) or EBS instead.
- S3 has latency that's noticeably higher than a local disk. For databases or
  applications that need fast, random-access I/O, block storage (EBS, Chapter 6)
  is appropriate.
- Data transfer *into* S3 is free of bandwidth charges — but not entirely free:
  every upload is a PUT request, and S3 charges per request. Uploading millions of
  small objects can cost more in request fees than in storage. Data transfer *out*
  costs money per GB. Both are common billing surprises — we address them in Chapter 30.
- S3 is not a database. You can store and retrieve objects by key, but you can't
  query objects by their content, run aggregations, or do relational operations.
  If you need to query the contents of stored data (not just retrieve it by name),
  you need a database or a service like Athena (Chapter 26) that can query S3 objects
  using SQL.
- Object versioning stores costs that compound. Every previous version of every
  versioned object is billed as storage. Lifecycle rules that expire old versions
  are not optional — they're part of the cost management strategy for any bucket
  with versioning enabled.

**How S3 Objects Are Encrypted**

"And what if someone tries to break in?" Priya asked, predictably, the day the photos went live. "Are these objects encrypted at rest?"

They were — and that's worth understanding, because S3 encryption is one of the most-tested topics on the exam. Every object uploaded to S3 is encrypted at rest by default. The question is *who holds the key*:

**SSE-S3 (the default)**: S3 encrypts every object with keys that S3 itself manages, using AES-256. You do nothing, configure nothing, pay nothing. Since January 2023, this is automatic on every bucket. For most data, it's enough.

**SSE-KMS**: S3 encrypts objects with a KMS key — either the AWS managed `aws/s3` key or a customer managed key you control (Chapter 16 covers KMS in depth). What you gain: an audit trail in CloudTrail of every key use, the ability to control exactly who can decrypt via the key policy, and the ability to revoke access by disabling the key. What you pay: KMS API charges per request. At high request rates, enable **S3 Bucket Keys** — S3 derives a short-lived bucket-level key from your KMS key, cutting KMS API calls (and cost) by up to 99%.

**SSE-C**: You supply your own encryption key *with every request*. AWS uses it in memory and never stores it. For organizations whose compliance rules say AWS must never hold the key. Operationally demanding — lose the key, lose the data.

The exam pattern: "encryption with an audit trail of key usage" or "control who can decrypt" → SSE-KMS. "Company must manage its own keys and AWS must never store them" → SSE-C. "Encryption at rest with no management overhead" → SSE-S3 (already on).

**S3 Object Lock: Write Once, Read Many**

Some data must be *impossible* to delete — not protected by policy, structurally immutable. Financial trade records, audit logs, legal evidence. **S3 Object Lock** makes objects undeletable and unmodifiable for a retention period, even by administrators. It requires versioning, and it comes in two modes the exam loves to contrast: **governance mode** (users with a special permission can still bypass the lock) and **compliance mode** (nobody can shorten the retention or delete the object — not even the root user — until the period expires). Regulatory phrases like "WORM storage" or "SEC Rule 17a-4" are exam triggers for Object Lock in compliance mode.

**S3 Transfer Acceleration: Fast Uploads from Far Away**

When users upload large files to a bucket from the other side of the world, the slow part is the long public-internet path to the bucket's region. **S3 Transfer Acceleration** gives the bucket a special endpoint that routes uploads into the nearest AWS edge location, then carries them over AWS's private backbone to the bucket. Exam trigger: "users around the world upload large files to a central bucket; uploads are slow" → Transfer Acceleration (often paired with multipart upload). Note the direction: Transfer Acceleration is about getting data *into* S3; CloudFront is about serving data *out*.

One more storage class worth knowing now: **S3 One Zone-IA** — like Standard-IA but stored in a single Availability Zone, about 20% cheaper, for infrequently accessed data you could re-create if that AZ were lost (thumbnails, re-generable reports). It's a standard exam distractor; Chapter 23 covers the full storage-class spectrum.


## Summary

Eight hundred photos on a single instance was the problem. S3 solved it — but S3 is more than a place to stash files. It's a durable, scalable, globally accessible object store with its own access model, storage classes, lifecycle policies, and event system. Understanding what S3 is good at, and what it deliberately isn't, shapes every storage decision the team would make from here forward.

- **Amazon S3** is object storage — files (objects) in named containers (buckets). It stores copies across at least three Availability Zones for eleven-nines durability. S3 is not a filesystem: use EFS for shared mounts, EBS for single-instance block storage.
- Files stored on EC2 instances are tied to that instance's lifecycle, causing photo-missing bugs when traffic spreads across multiple servers. S3 solves this by being independent of any instance.
- **Versioning** preserves previous object versions. **Lifecycle rules** automate transitions between storage classes and clean up incomplete multipart uploads that would otherwise accumulate silent billing charges.
- By default, S3 is private. Enable "Block Public Access" at the account level. Serve public objects through CloudFront with Origin Access Control rather than making buckets directly public.
- S3 storage classes let you match cost to access frequency — but watch minimum storage duration charges before transitioning short-lived objects to Infrequent Access or Glacier tiers.

## Exam Tips

*SAA-C03 Domain 3 — Task 3.1 (high-performing storage solutions)*

- **S3 is object storage, not block storage.** When an exam scenario needs a
  filesystem that multiple servers can mount, that's EFS. When it needs a disk
  for a single EC2 instance, that's EBS. When it needs to store files, backups,
  images, or data that's accessed via HTTP — that's S3.
- **Eleven-nines durability** means S3 replicates data across multiple AZs
  automatically. You don't configure this — it's the default.
- **S3 is Regional**, but accessible globally. Buckets exist in a specific Region,
  but you can access them from anywhere.
- **Pre-signed URLs** allow time-limited access to private objects. Common pattern:
  your application generates a pre-signed URL valid for 15 minutes, gives it to the
  user, user downloads the file directly from S3.
- **S3 Standard-IA** has a minimum storage duration charge (30 days). Don't use it
  for data you'll delete quickly. The exam tests whether you know the trade-offs
  between storage classes.
- **Storage class decision tree**: *frequently accessed* → S3 Standard; *infrequently accessed but needs fast retrieval* → S3 Standard-IA; *archive accessed occasionally* → S3 Glacier Instant Retrieval; *archive rarely accessed* → S3 Glacier Flexible Retrieval; *compliance archive, almost never accessed* → S3 Glacier Deep Archive.
- **Cross-Region Replication** requires versioning to be enabled on both the source and destination buckets. Exam questions about disaster recovery or data sovereignty often involve CRR.

## Exercises

**Exercise 1 — Recall**

In your own words: what is an S3 object? What is an S3 bucket? Why is storing files
in S3 better than storing them on an EC2 instance's local disk?

*(Hint: Think about what happens to files on an EC2 instance if the instance is
terminated. What does S3 do differently?)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A media company produces documentary videos. They need to store original
4K footage (accessed frequently during production), edited final cuts (accessed monthly
for distribution), and archive masters (kept indefinitely but accessed at most once
a year for compliance purposes). They want to minimize storage costs while meeting
each tier's access requirements.

Which storage strategy BEST meets their needs?

A) Store original footage in S3 Standard, final cuts in S3 Standard-IA, and archives
   in S3 Glacier Deep Archive  
B) Store all content in S3 Standard for consistent performance and simplicity  
C) Store all content on EC2 instance storage for fastest access  
D) Store all content in S3 Glacier Deep Archive to minimize costs

**Hint 1**: Different files have different access patterns. S3 offers different storage
classes for different access frequencies. Which class matches "accessed frequently"?

**Hint 2**: Archives accessed "at most once a year" don't need immediate retrieval.
Which storage class is designed for long-term archival at minimum cost?

**Hint 3**: Match each tier's access frequency to the appropriate storage class.
Frequently accessed = Standard. Monthly = Standard-IA. Once a year = Glacier Deep Archive.

**Answer**: A

**Explanation**: This strategy correctly matches each data tier to the appropriate
S3 storage class. Frequently accessed original footage stays in Standard for
immediate access with no retrieval fees. Monthly-accessed final cuts go to Standard-IA
(lower storage cost, affordable retrieval fee). Archives accessed once yearly go to
Glacier Deep Archive for the lowest possible storage cost.

**Why not B?** Storing everything in Standard is simple but expensive.

**Why not C?** EC2 instance storage is ephemeral and not appropriate for long-term
media storage. If the instance is terminated, all content is lost.

**Why not D?** Glacier Deep Archive has retrieval times up to 12 hours. Storing
frequently accessed production footage there would make production work impossible.

*SAA-C03 Domain 3 — Task 3.1 / Domain 4 — Task 4.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus stores customer-uploaded order photos in S3. A data protection regulation
requires that customer photos must be stored for 7 years but can be deleted after
that. The team also wants to minimize the cost of storing old photos from previous years.

Design an S3 storage strategy for this requirement. Which storage classes would you
use, and when would you transition between them? What would you do about the deletion
requirement?

*(Hint: Think about lifecycle policies. There is no single correct answer — reason
through cost vs. retrieval time trade-offs.)*

## Post-Credits Scene

Leo migrated the menu photos to S3 that afternoon. Eight hundred objects, safely
stored across three Availability Zones, with versioning enabled.

"They're actually safer now than they were before," he said, with some satisfaction.

"They were always safer in S3," Priya said. "We just waited until after we built the
problem to fix it."

Leo accepted this.

The next morning, Tom arrived with a printout. The AWS bill, annotated in red pen.

"We have a database problem," he said. "We're running our order database on the same
EC2 instance as the web server. And our menu database. And our customer records."

He paused.

"Everything is in the same machine. One machine. All our data."

Maya looked at the printout. Then at Tom. Then at the ceiling.

"And if that machine breaks?"

Tom pointed at the red pen annotation.

In the next chapter: the difference between a hard drive you rent and a filing cabinet the whole office shares.
