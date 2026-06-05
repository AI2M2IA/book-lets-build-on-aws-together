# Chapter 23: The Filing System That Sorts Itself

A law firm keeps active case files on the desk. Completed cases go into a filing cabinet. Cases from three years ago go into storage boxes in the basement. Cases from ten years ago go into an off-site archive facility that costs cents per box but takes two days to retrieve anything from.

The same information, stored at different costs based on how often it's accessed.

---

With the workflow automation in place and the order flow finally stable, Tom had returned to his cost review. The S3 bill had been sitting in the back of his mind since the previous quarter — one of those line items that kept growing without anyone looking directly at it. He finally had time to look.

He called Leo over.

"We have 4.2 terabytes in S3," Leo said after checking.

"Of what?"

"Restaurant photos. Order receipts. Analytics exports. Backup snapshots from 18 months ago."

"When was the last time someone accessed a backup from 18 months ago?"

Leo checked the access logs.

"Last October," he said. "Once. To verify the backup format."

"So we're paying for 18 months of backups at full S3 Standard pricing."

"Yes."

"How much does that cost per month — Glacier vs Standard?" Tom asked, already pulling up the pricing page.

S3 Standard: $0.023 per GB per month. S3 Glacier Instant Retrieval: $0.004 per GB per month.

Tom did the math.

"We could reduce this bill significantly," he said, "just by moving old data to cheaper storage."

"We'd need to know what's old," Leo said.

"S3 knows. It tracks last access time."

**S3 Storage Classes: The Full Spectrum**

Chapter 5 introduced S3 Standard as the primary storage class. S3 actually has eight storage classes, each designed for different access patterns (the eighth, **S3 Express One Zone**, is a specialized single-AZ class for latency-critical workloads and rarely appears outside of high-performance scenarios):

**S3 Standard**: For frequently accessed data. Low latency (milliseconds). Highest cost. No minimum storage duration. Use for active data: the current menu photos, today's orders, recent logs.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: For data accessed less than once a month. Same millisecond retrieval as Standard, but lower storage cost + per-GB retrieval fee. 30-day minimum storage duration. Use for data you need immediately when you access it, but rarely do: older order receipts, 6-month-old analytics exports.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Same as S3 Standard-IA (including the 30-day minimum) but stored in only one Availability Zone (instead of three). Less durable (if that AZ has a disaster, data can be lost), but 20% cheaper. Use for data that can be recreated if lost: thumbnail cache, temporary processing outputs.

**S3 Glacier Instant Retrieval**: Archived data you need occasionally. Millisecond retrieval. Very low storage cost, higher per-GB retrieval cost. 90-day minimum storage. Use for data accessed once per quarter or less: quarterly compliance reports, 12-month-old backup snapshots.

**S3 Glacier Flexible Retrieval**: Deep archive, retrieved in minutes to hours. Lower cost than Glacier Instant Retrieval. Use for archival data with less urgency.

**S3 Glacier Deep Archive**: Lowest-cost option. Retrieved in 12 hours. 180-day minimum storage. Use for data that must be kept for regulatory compliance but is never expected to be accessed: 7-year tax records, 10-year audit logs.

The pattern: as access frequency decreases, cost decreases but retrieval time increases (and per-retrieval cost increases). Choose the class that matches your access pattern.

**S3 Lifecycle Policies: The Automated Filing System**

Manually moving files between storage classes is error-prone and time-consuming. S3 **lifecycle policies** automate this based on rules you define.

A lifecycle rule has two components:

**Filter**: Which objects the rule applies to (all objects, objects with a specific prefix, objects with specific tags).

**Actions**: What to do, after how many days.

Example lifecycle policy for Nimbus's order receipts:

```
Transition to S3 Standard-IA after 90 days
Transition to S3 Glacier Instant Retrieval after 365 days
Transition to S3 Glacier Flexible Retrieval after 540 days (18 months)
Transition to S3 Glacier Deep Archive after 2555 days (7 years)
Delete after 2920 days (8 years)
```

This single policy ensures:

- Active receipts (< 90 days): S3 Standard, fast access
- Recent receipts (90-365 days): Standard-IA, cheap but instantly available
- Older receipts (1 year to 18 months): Glacier Instant, very cheap, milliseconds when needed
- Historical receipts (18 months to 7 years): Glacier Flexible, cheaper still — retrieval takes hours, not milliseconds
- Expired receipts (> 8 years): Automatically deleted

One catch nearly derailed the plan. Since late 2024, lifecycle rules **don't
transition objects smaller than 128 KB by default** — and Nimbus's receipts
averaged 18 KB each. To make the policy actually move them, Leo had to
override the default minimum object size on the rule (lifecycle filters can
also select by size with `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). The
default exists for a good reason: archive classes bill ~40 KB of metadata
overhead per object and every transition costs a request fee, so for millions
of tiny objects the transition can cost more than it saves. Leo ran the math
for the receipts — at seven-year retention, it still paid off.

Tom reviewed the projected savings: from $847/month to about $220/month.

"By just... defining what's old and where it should go?" he said.

"And S3 moves it automatically," Leo confirmed. "No cron job. No manual migration. No forgetting."

"Wait — but *why* doesn't S3 just do this by default?" Maya asked from across the room. "Why do you have to define a policy at all?"

"Because 'old' is different for every bucket," Leo said. "A compliance archive and a photo upload need completely different retention rules. S3 can't guess which is which."

You might be wondering: what happens if the wrong data gets moved to Glacier and you need it urgently? You'd pay a retrieval fee and wait — which is why you should test your lifecycle rules on a small, non-critical bucket first, and verify the access logs before rolling out to production data. A retrieval mistake on 18 months of backups would cost far less than a customer-facing incident, but it's still worth testing first.

If your data's access pattern is predictable (logs are always cold after 30 days), use explicit lifecycle rules — they're more cost-efficient than Intelligent-Tiering's per-object monitoring fee. If your access patterns change over time or are hard to predict, use Intelligent-Tiering — but be aware that it simply ignores objects smaller than 128 KB: they aren't monitored, aren't charged the monitoring fee, and never leave the Frequent Access tier.

**S3 Intelligent-Tiering: The Self-Organizing Class**

What if you don't know how often you'll access your data?

**S3 Intelligent-Tiering** monitors access patterns for each object and automatically moves it between access tiers:

- **Frequent Access tier**: For objects accessed recently
- **Infrequent Access tier**: Objects not accessed for 30 days
- **Archive Instant Access tier**: Objects not accessed for 90 days
- **Archive Access tier**: Objects not accessed for 90-730 days (optional)
- **Deep Archive Access tier**: Objects not accessed for 180-730+ days (optional)

S3 Intelligent-Tiering charges a small monitoring fee per object per month ($0.0025 per 1,000 objects), but no retrieval fee for the Frequent and Infrequent tiers.

Use Intelligent-Tiering when:

- Access patterns are unpredictable or change over time
- You have a mix of hot and cold data that you can't easily classify
- You have objects larger than 128KB (smaller objects aren't monitored or auto-tiered at all)

Use explicit storage classes (with lifecycle policies) when:

- Access patterns are predictable
- You want every object — including small ones — to actually move to cheaper classes
- Objects are small (< 128KB)

The small-file caveat deserves emphasis. Nimbus had 2.3 million order receipt objects in S3 — each one was a small JSON file, averaging about 18KB. Tom had initially considered Intelligent-Tiering for the receipts bucket, until he read the fine print.

Objects smaller than 128KB are **not monitored and not auto-tiered** in Intelligent-Tiering. They don't pay the monitoring fee ($0.0025 per 1,000 objects per month) — but they also never move: they sit in the Frequent Access tier, at Standard-equivalent prices, forever.

So for the 18KB receipts, Intelligent-Tiering wouldn't have cost Nimbus anything extra — it just wouldn't have *done* anything. 2.3 million cold receipts would have kept paying hot-storage prices ($0.023/GB) indefinitely, while the Archive tiers ($0.00099/GB) sat out of reach.

"So Intelligent-Tiering is designed for large objects," Maya said.

"Or for workloads where you genuinely don't know the access pattern," Tom said. "For a bucket of tiny files where we know the receipts are hot for 90 days and cold after that, an explicit lifecycle rule — with the small-object override from earlier — is the only thing that actually moves them."

Intelligent-Tiering is an excellent service. It's just not the right tool for every bucket: below the 128KB threshold it's harmless but useless, and only explicit lifecycle rules (with a size override) will tier small objects.

**When You Actually Need the Data Back: A Glacier Retrieval Story**

Three months after the lifecycle policies were deployed, Nimbus received a legal notice. A former restaurant partner was disputing a contract term, and Nimbus's lawyers needed 18 months of order records for that partner — everything from opening through contract termination.

"And what if someone tries to break in through the legal discovery process?" Priya said. She wasn't joking. "Lawyers requesting bulk data exports is a common social engineering vector. Verify the request is legitimate before opening any data store."

The request was legitimate. The records were in S3, across three storage classes: the most recent 90 days in Standard-IA, the previous year in Glacier Instant Retrieval, the remainder in Glacier Flexible Retrieval (the lifecycle policy had used Flexible for data over 18 months old).

The Glacier Instant records were immediately available. Leo filtered by restaurant ID, ran an Athena query to identify the matching order records, and exported them to a secure S3 location. Five minutes of work.

The Glacier Flexible records required a restore request:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **Standard tier**: 3-5 hours. The records would be available as a temporary copy in S3 Standard for 7 days, then automatically removed. The original archived copy remains in Glacier.

Cost of the entire retrieval: $0.01 per GB retrieved at the Standard tier, for 4.2 GB of archived records. About four cents. (The Expedited tier — 1 to 5 minutes — costs $0.03 per GB, but its availability isn't guaranteed the way Standard is.)

"Four cents," Maya said, when Leo reported back. "For 18 months of records."

"We stored 4.2GB at $0.0036 per GB per month for a year and a half," Leo said. "The storage cost was about twenty-seven cents total. The retrieval cost was four. Versus a dollar seventy-four if we'd kept it in S3 Standard for 18 months."

"And the only thing that mattered," Priya said, "was that we remembered it was in Flexible Retrieval and planned for the 3-5 hour wait. If the lawyers needed this in 30 minutes, we would have had a problem."

This is the important operational lesson about Glacier: it's not just a cost decision, it's a retrieval SLA decision. Before archiving data to Glacier Flexible or Deep Archive, document the retrieval time for anyone who might need it. "The data exists" and "we can get it in 30 minutes" are two different guarantees.

**Multipart Upload: For Large Objects**

S3 has a 5GB single upload limit. For larger objects, you must use **multipart upload**: split the object into parts, upload each in parallel, and S3 assembles them.

Benefits:

- Faster uploads (parallel)
- Can resume failed uploads (only re-upload failed parts)
- Required for objects > 5GB

Lifecycle rule tip: Set a lifecycle rule to delete incomplete multipart uploads after 7 days. If an upload fails halfway through and isn't cleaned up, those partial parts are stored and charged — without an assembled object to show for it.

Tom appreciated this tip enormously.

He ran the AWS CLI command to list incomplete multipart uploads across all Nimbus buckets:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

The output was longer than he expected. He piped it to a counter.

340 incomplete uploads. The oldest was from 8 months ago — Leo's load test of the restaurant photo upload flow. The load test had generated hundreds of partial uploads, none of which had been completed (the test hadn't been designed to complete them, just to test the initiation endpoint). 340 incomplete uploads, sitting in S3, each representing partial data that AWS was storing and charging for.

"How much does that cost per month?" Tom said. He wasn't asking for information. He was calculating out loud.

The combined size of the incomplete parts: 48 GB. At $0.023/GB: $1.10/month. For eight months: $8.80 already spent.

At current growth rate, if not cleaned up: continuing indefinitely.

"Leo," Tom said.

"I already deployed it — oh," Leo said, coming over. "The load test. I forgot to clean up the partial uploads."

"Eight months ago."

"I didn't know S3 stores the parts even if the upload never completes."

"It stores them. It charges for them. And there is no dashboard warning you about it. They just accumulate."

The fix: a lifecycle rule to delete incomplete multipart upload parts after 7 days.

```
Rule: Delete incomplete multipart upload parts
Prefix: (all objects)
Action: Delete incomplete multipart uploads after 7 days
```

The existing 340 uploads were cleaned up manually. The lifecycle rule ensures no future load tests or failed uploads accumulate in the same way. The $1.10/month that had been quietly building for eight months stopped — small in dollars, but the pattern (invisible, growing, uncapped) was the part worth killing.

"The rule is three lines," Tom said. "I should have set it on every bucket at creation." He updated the bucket creation checklist: every new S3 bucket gets a multipart upload cleanup rule by default. 

**Three Security Layers: A Quick Recap Before the Detour**

"And what if someone tries to break in and delete the audit logs?" Priya asked again — this time in the context of a specific threat model. "Not just a misconfigured lifecycle rule. A malicious insider. A compromised IAM key with write access."

The team had the answers already — they just hadn't applied them to this bucket. Three layers, each covered earlier in the book, each addressing a different threat vector:

**Versioning** (chapter 5) makes deletions reversible — a DELETE becomes a delete marker, and the previous versions stay restorable. For write-once data like order receipts, the storage overhead is minimal: there's only ever one version per object.

**S3 Object Lock** (chapter 5) makes objects truly immutable — WORM storage that even an admin key can't delete during the retention period. For the receipts, with their 7-year tax retention requirement, the team chose Compliance mode: no lifecycle misconfiguration, no IAM mistake, no compromised credential can remove them before the auditor asks. And Object Lock coexists with lifecycle transitions — a rule moving the receipts to Glacier Deep Archive still works; the data gets cheaper and stays immutable.

**CloudTrail S3 data events** (chapters 16-17) tell you what happened to the data: every GET, PUT, DELETE, and COPY logged with who, from where, and when — the raw material GuardDuty (chapter 17) uses to alert on anomalies.

"Versioning for accident recovery. Object Lock for compliance immutability. CloudTrail for forensics," Priya summarized. "We covered each of these on its own. The new decision today is turning all three on for this bucket."

**Cross-Region Replication: Order Records as Disaster Recovery**

The Nimbus order receipts bucket was in us-west-2. That was intentional — us-west-2 is where the application ran. But "the application is in us-west-2" and "all order records are only in us-west-2" are different risk profiles.

If Nimbus needed to activate a disaster recovery site in us-east-1, the order records would need to be there too. Waiting to copy them in the middle of a regional failure is not a recovery plan.

Priya recommended **Cross-Region Replication (CRR)** for the order receipts bucket. The rule:

```
Source: nimbus-order-receipts (us-west-2)
Destination: nimbus-order-receipts-dr (us-east-1)
Replication: All objects
Storage class in destination: S3 Standard-IA (cheaper — this is the DR copy, rarely accessed)
```

The mechanics were familiar from chapter 5: asynchronous replication of new writes (most objects within 15 minutes; a guaranteed SLA requires paying for **S3 Replication Time Control**), versioning required on both buckets, an IAM role with read-source/write-destination permission. The detail worth noticing in the rule above: the destination uses a *different storage class* than the source — Standard-IA for the DR copy, instead of paying for a second Standard copy that's rarely read. And the versioning prerequisite cost nothing extra — they were already enabling versioning for accident recovery. (CRR's sibling, **Same-Region Replication (SRR)**, copies objects between buckets in the *same* region — useful for a compliance copy in a separate account, log aggregation, or test environments seeded from production data.)

One gotcha Priya called out before anyone hit it: replication is **not retroactive**. Objects that already exist in the bucket when you enable the rule are not replicated — only new writes are. Teams enable CRR expecting all their existing data to appear in the destination, then discover the DR bucket is nearly empty. For pre-existing objects, you run **S3 Batch Replication**, a separate operation that applies the replication rules to objects that were already there. Nimbus ran it once to seed the DR bucket with the existing 0.8 TB of receipts.

"And delete markers?" Priya asked. "If someone deletes a receipt in us-west-2, does it replicate the deletion to us-east-1?"

By default, no — in current replication configurations (the V2 schema the console creates), **delete markers are not replicated**. Someone deletes a receipt in us-west-2, and the us-east-1 copy keeps serving it as if nothing happened. If you *want* the DR bucket to mirror deletions, you enable delete marker replication explicitly on the rule (not supported on rules with tag filters) — that was the default in the legacy V1 schema, which older material still describes. Either way, lifecycle expirations never replicate their delete markers.

Replication still is *not* a backup solution, though — for the opposite reasons: it won't protect against permanent version deletions or malicious overwrites replicating to the mirror, and it has no retention semantics. For true backup, pair versioning with Object Lock, or use AWS Backup.

"How much does that cost per month?" Tom asked.

Storage for 0.8 TB in S3 Standard-IA in us-east-1: $10.00/month. Plus replication data transfer (charged per GB transferred cross-region): minimal at their current write volume. Total additional cost: roughly $10-11/month for a complete cross-region copy of all order records.

Tom wrote this down without complaint.

**S3 Storage Lens: Seeing the Full Picture**

Tom had done his audit manually — opening the AWS console bucket by bucket, running AWS CLI commands to count objects, checking the billing explorer for storage costs by bucket. It had taken him most of an afternoon to build that spreadsheet.

**S3 Storage Lens** is the AWS tool that replaces that manual process. It provides organization-wide visibility into S3 usage and activity across all buckets, all accounts, and all regions — in a single dashboard.

The metrics that matter most for cost optimization:

**Non-current version bytes**: How much storage is consumed by older versions (when versioning is enabled). Versioning is essential for safety, but if a document is updated frequently, older versions accumulate. A lifecycle rule to expire non-current versions after 30 days prevents version bloat.

**Incomplete multipart upload bytes**: Exactly the problem Leo had caused with the load test, surfaced automatically. Without Storage Lens, Tom had to know to look for incomplete multipart uploads. With Storage Lens, they show up in the dashboard as a line item.

**% requests returning 403**: A spike in 403 (Forbidden) responses on a bucket that should be publicly accessible might indicate a misconfigured bucket policy. A spike on a private bucket might indicate a scanning or probing attempt. Either way, it's a signal worth investigating.

**Average object size**: A bucket of tiny objects (average 2KB) behaves differently from a bucket of large objects (average 50MB) in terms of Intelligent-Tiering economics, request costs, and query performance for Athena.

S3 Storage Lens has a free tier that covers the essential metrics. The advanced metrics (request statistics, lens groups for filtering) have an additional cost per million objects per month — small relative to the savings it enables.

"Why didn't we use this from the start?" Maya asked.

"We didn't have 4.2 terabytes from the start," Tom said. "At small scale, a spreadsheet works. At this scale, the scale itself becomes an argument for the tool."

This is a recurring theme in the Nimbus architecture: the right tool for a given scale is not always the right tool for the next scale. S3 Storage Lens is worth configuring as soon as your S3 usage grows beyond what you can manually audit in an afternoon — which is roughly when the savings it enables start to meaningfully exceed the time it saves.

## Strengths and Limitations

**Why S3 storage tiers matter**:

- Significant cost reduction without sacrificing durability or availability for what's actually accessed
- Lifecycle policies automate the entire process — no operational burden
- S3 Intelligent-Tiering removes the need to predict access patterns

**Where it gets complicated**:

- Minimum storage duration charges apply to Glacier classes (90 days for Glacier Instant, 180 days for Deep Archive) — deleting early still incurs the minimum charge
- Retrieval fees can surprise you if you access archived data frequently
- Lifecycle transitions take time — objects are not moved instantly after the rule triggers
- Intelligent-Tiering ignores objects under 128KB — no fee, but no tiering either; and lifecycle rules skip them by default unless you override the minimum object size

## Summary

The workflow automation from chapter 22 optimized how Nimbus processes requests. This chapter optimizes what Nimbus pays for data it's keeping but not accessing. The principle is the same: stop paying for the wrong tier.

- S3 has eight storage classes: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — plus Express One Zone (specialized low-latency, single AZ).
- **Lifecycle policies** automate transitions between storage classes based on age — define once, S3 handles it forever.
- **S3 Intelligent-Tiering** automatically moves objects between tiers based on actual access patterns — use for unpredictable workloads with objects larger than 128KB. Smaller objects are not monitored or auto-tiered (and pay no monitoring fee) — they stay in the Frequent Access tier.
- **Glacier retrieval** requires a restore request for Flexible and Deep Archive tiers. Plan retrieval time (minutes to 12 hours) before archiving any data with an SLA for retrieval.
- **Incomplete multipart uploads** accumulate silently and incur storage charges. Add a lifecycle rule to delete incomplete parts after 7 days on every bucket.
- **Three security layers**: versioning (reversible deletes), Object Lock (immutability for compliance), CloudTrail data events (forensics and anomaly detection).
- **Cross-Region Replication (CRR)**: replicate order records to a DR region automatically. Requires versioning on both buckets. Configure whether delete markers replicate based on whether the DR copy is a mirror or a backup.
- **Multipart upload** is required for objects > 5GB and recommended for anything > 100MB.
- **S3 Object Lock** provides WORM storage for compliance scenarios — Governance mode can be overridden by admins; Compliance mode cannot be overridden by anyone.

## Exam Tips

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.1)*

- **Storage class selection signals**:
  - "Frequently accessed" → Standard
  - "Accessed once a month, need instant retrieval" → Standard-IA
  - "Can tolerate hours of retrieval time, rarely accessed" → Glacier Flexible Retrieval
  - "Regulatory compliance, 7+ year retention, never accessed" → Glacier Deep Archive
  - "Unknown or changing access patterns" → Intelligent-Tiering
- **Lifecycle policy exam patterns**: "automatically reduce storage costs as data ages," "transition to archive after 90 days" → lifecycle policies.
- **Intelligent-Tiering and small objects**: objects under 128KB are not monitored, pay no monitoring fee, and never auto-tier — they stay in Frequent Access. Lifecycle rules also skip sub-128KB objects by default (overridable). Exam may test either fact.
- **CRR requirements**: Versioning must be enabled on both source and destination buckets. Source and destination must be in different regions.
- **S3 Object Lock**: "WORM," "immutable," "SEC 17a-4," "cannot be deleted or modified" → Object Lock. Governance mode (can be overridden by admins). Compliance mode (cannot be overridden by anyone, including root).
- **Glacier restore**: Objects in Glacier are not immediately available. You must "restore" a copy to S3 Standard for access. The restored copy is temporary (you set the duration). The original stays in Glacier.

## Exercises

**Exercise 1 — Recall**

Explain the difference between S3 Standard-IA and S3 Glacier Instant Retrieval. What access pattern makes each appropriate?

*(Hint: Think about how often you'd access the data and how quickly you need it when you do access it.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company generates 500GB of application logs daily. Logs are heavily queried for the first 7 days (debugging and monitoring). After 7 days, logs are rarely accessed but must be available within 30 minutes if needed. After 1 year, logs must be retained for compliance but are never accessed. The company needs to minimize storage costs while meeting these requirements.

Which S3 lifecycle policy BEST meets these requirements?

A) Store in S3 Standard for 7 days; transition to S3 Glacier Deep Archive after 7 days; expire after 365 days  
B) Store in S3 Standard for 7 days; transition to S3 Standard-IA after 7 days; transition to S3 Glacier Flexible Retrieval after 365 days  
C) Store all logs in S3 Intelligent-Tiering from day 1  
D) Store in S3 Standard for 7 days; transition to S3 Glacier Instant Retrieval after 7 days; transition to S3 Glacier Deep Archive after 365 days

**Hint 1**: "Available within 30 minutes" rules out which storage class?

**Hint 2**: Deep Archive takes 12 hours to retrieve — doesn't meet the 30-minute requirement for days 7-365.

**Hint 3**: After 365 days, retrieval time doesn't matter (never accessed), so the cheapest option applies.

**Answer**: D

**Explanation**: S3 Standard for 7 days handles frequent access. Glacier Instant Retrieval provides millisecond access for days 7-365 — meeting the 30-minute requirement at significantly lower cost than Standard-IA. After 365 days, Glacier Deep Archive is the cheapest option for data that's never accessed.

**Why not A?** Glacier Deep Archive takes 12 hours to retrieve — doesn't meet the "30-minute availability" requirement for days 7-365.

**Why not B?** Standard-IA can't even be the first stop here: S3 requires objects to age 30 days in Standard before a lifecycle rule may transition them to Standard-IA or One Zone-IA — so "Standard-IA after 7 days" is an invalid rule. (The 30-day rule doesn't apply to Glacier classes, which is exactly why D works.) And even setting that aside, Glacier Instant Retrieval is significantly cheaper for data that's rarely accessed after day 7.

**Why not C?** Intelligent-Tiering has a monitoring fee per object and might not move the logs to archive tiers as aggressively as explicit lifecycle rules. For a large volume of logs with a predictable access pattern, explicit lifecycle rules are more cost-effective.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus has three types of S3 data with different characteristics:

- Restaurant photos: uploaded once, accessed many times by customers, never deleted
- Order receipts: accessed by customers in the first month, kept 7 years for tax purposes
- Analytics exports: generated daily, analyzed in the following week, kept 2 years

Design a lifecycle policy for each. For the restaurant photos, would Intelligent-Tiering make sense? For the order receipts, what storage class covers the 1-month to 7-year window? For analytics exports, how would you structure the bucket to apply different policies to different prefixes?

*(There is no single correct answer. The goal is to practice storage tier selection for real-world data.)*

## Post-Credits Scene

Tom implemented the lifecycle policies.

Leo had helped configure the first rule. "It'll be fine," he'd said. "The minimum storage duration only applies if we delete early — and we're not deleting anything." He checked the Glacier minimum duration requirements halfway through. "Actually, let me re-read this."

On a different bucket — the temporary analytics staging exports — he had almost combined a 30-day transition to Glacier Instant Retrieval with a 60-day expiration rule. The minimum storage duration for Glacier Instant is 90 days: those objects would have entered Glacier at day 30 and been deleted at day 60, and S3 would still have billed the full 90 days for every one of them — paying archive prices for storage that no longer existed. He dropped the Glacier transition for that bucket entirely; data deleted at 60 days never lives long enough to amortize a 90-day minimum. The receipts policy was safe as designed: transition to Standard-IA at 90 days, Glacier Instant Retrieval at 365 days, Glacier Flexible Retrieval at 540 days, Glacier Deep Archive at 2,555 days.

He also set the multipart upload cleanup rule on every bucket. Not because there were more abandoned uploads — there weren't — but because there would be. Load tests happen. Deployments fail midway. The rule was cheaper than the memory required to remember to clean up manually.

The S3 bill dropped from $847 to $198 the following month.

He printed the comparison and put it on Maya's desk without saying anything.

Maya looked at it. Then at the date. Then at Tom.

"Three weeks," she said.

"One afternoon to design the policies," he said. "One hour to implement them. Three weeks to see the first full billing cycle."

"Three-quarters reduction in S3 costs."

"For data we don't access."

"And the cross-region replication?" Leo asked.

"Ten dollars a month more," Tom said. "For a complete copy of every order receipt in a second region."

"That's the cheapest disaster recovery decision we've made."

Maya looked at the numbers again.

"Tom," she said, "I want you to do this review for every AWS service we use. Storage, compute, networking. Find the waste."

He was already back at his desk.

"I started last week," he said.

In the next chapter: the database tier has its own version of this conversation, and Aurora is the answer Tom didn't expect to like.
