# Chapter 28: The Storage Bill Surprise

The spreadsheet had sixteen tabs by now. Tom kept it open in a second window, the way some people keep a grocery list — always visible, always accumulating. He added a new row for EC2 (done, Savings Plan committed) and moved his cursor to the next line.

Storage.

**Recap: EC2 Sorted, One Line Item to Go**

The compute pricing work from Chapter 27 had locked in the EC2 strategy: a $0.45/hour Compute Savings Plan on a three-year term, plus Spot for the nightly batch — an estimated $42,500 in savings over the term. That work was done, and done well. But it was one line on the bill. Tom had learned, from six months of Athena cost analysis, that the bill had many lines — and that each one deserved the same scrutiny. S3 was next: $198/month, already improved from $847 after the lifecycle policy changes from Chapter 23. The number that caught his eye, though, was lower on the page. EBS: $440/month.

"That seems high," he said.

Leo pulled up the EBS volume list. There were 47 EBS volumes attached to instances. And then there were another 23 volumes not attached to any instance.

"These 23 volumes," Tom said. "What are they?"

**The Orphaned Volume Audit**

Leo started going through them one by one. This was not a quick process — the volumes weren't labeled uniformly, the tags were inconsistent, and some had been created so long ago that nobody remembered the context. Tom pulled a chair over and watched.

Volume ebs-021a4c. Created 16 months ago. Tag: "debug-prod-db-snapshot-restore." Size: 200GB. Last attached: never, or the attachment history was purged.

"That one I remember," Leo said. "We had a database query issue and I restored a snapshot to check the data. I checked it, didn't find the problem there, and forgot to delete the volume."

Volume ebs-07f38b. Created 11 months ago. Tag: "load-test-temp." Size: 400GB.

Leo was quiet for a moment. "I think that was the load test we did before the Series Seed pitch. We provisioned extra instances with extra storage to simulate peak load and then... I don't think I deleted any of them after."

"I already deployed it — oh," he said. "The load test was temporary. The volumes were not."

Volume ebs-0ab12c through ebs-0ab134. Eight consecutive volumes, created 9 months ago. Tag: "k8s-experiment." Size: 100GB each, 800GB total.

"That was the Kubernetes evaluation," Priya said, looking over Leo's shoulder. "We spent three weeks evaluating whether to migrate to ECS or EKS. EKS was the runner-up. We tore down the experiment cluster but apparently left the persistent volumes."

Tom was adding it up on a separate tab. Volume by volume, the numbers accumulated:

- Debug restore volumes: 4 volumes × 200GB = 800GB
- Load test volumes: six volumes between 200 and 400GB — roughly 1,200GB in total
- Kubernetes experiment volumes: 8 volumes × 100GB = 800GB
- Miscellaneous untagged: 5 volumes × various sizes = ~700GB

Total: approximately 3,500GB across 23 unattached volumes.

"How much does that cost per month?" Tom asked. The answer: gp3 at $0.08/GB/month. 3,500GB × $0.08 = $280/month.

He checked the oldest creation date. Sixteen months. He pulled out the calculator.

"We've been paying for some of these for sixteen months," he said. "Some for nine. Average probably ten months across all of them." 23 volumes, average $12/month each, average 10 months. That was approximately $2,760. Add the larger volumes and the math came out to roughly $3,200 in total waste.

"Three thousand two hundred dollars," Tom said. "From volumes nobody was using."

"And nobody noticed because the charge is spread across dozens of line items," Leo said. "It's not one $3,200 charge. It's 23 charges of $12 or $50 or $80 a month, each individually small enough to not trigger any alarm."

Tom deleted all 23 unattached volumes. He confirmed with Leo and Priya that each one had no data they needed — the debug volume was stale data from a database that had since been migrated, the load test data was irrelevant, the Kubernetes experiment volumes were empty. The deletion took fifteen minutes. The following month, the EBS bill dropped from $440 to $160.

"Wait — but *why* would we do it that way?" Maya asked, when Tom walked her through the finding. "Why isn't deleting the volume the default when you terminate an instance?"

"It depends on the volume," Tom said. "The **root** volume does get deleted by default — `DeleteOnTermination` is true for it. But any **additional** data volumes you attach default to being preserved. The assumption is that you might need the data that was on them. These 23 orphans were all data volumes — attached for a debug session or a load test, then left behind when the instance was terminated."

"So the default protects you from accidental data loss on data volumes."

"And costs you money if you're not paying attention. From now on: any additional data volumes get explicitly deleted when the instance terminates — or get `DeleteOnTermination` set at attach time — unless someone makes a documented case for why they need to keep them."

"Have we thought about what happens if someone forgets to document that case?" Priya asked. "We could delete something important."

"That's the trade-off," Tom said. "Right now the trade-off is in the other direction — we're assuming everything should be kept and paying for it when it's not. The discipline of documenting 'keep this volume' is less risky than the current default of 'keep everything silently.'"

**The Storage Cost Audit**

Tom's EBS discovery was a symptom of a broader pattern: storage costs accumulate invisibly. Unlike compute (you notice when 47 servers are running), storage silently adds up.

Think of it like a storage unit rental. Renting one unit is obvious on the credit card statement. But if you rent a second unit for a project, then a third for some old furniture, and you never go back to check what's inside — the charges keep appearing every month, quietly, long after you've forgotten what you're even storing. Cloud storage works the same way: the bytes sit there, the invoice arrives, and nobody questions it until someone finally opens the door and finds it full of things nobody needs anymore.

A thorough storage cost audit looks at:

**S3**:

- Are lifecycle policies in place for all buckets?
- Are there old snapshots (RDS, EBS) sitting in S3?
- Is Intelligent-Tiering appropriate for any buckets with uncertain access patterns?
- Are there versioned objects creating multiple copies that are never accessed?
- Are there incomplete multipart uploads accumulating silently?

**EBS**:

- Are any volumes unattached (no running instance using them)?
- Are gp3 volumes properly configured? (Default gp3 volumes may have excess provisioned throughput/IOPS that isn't needed)
- Are snapshots older than necessary being retained?

**RDS**:

- Are automated backup retention periods set appropriately? (Longer = more storage cost)
- Are manual snapshots from old instances still sitting around?
- Are read replicas from database migrations still running?

**EFS**:

- Is the EFS volume in the right storage class? (Standard vs Infrequent Access)

**S3 Versioning: The Hidden Cost**

In Chapter 5, we mentioned that S3 versioning keeps every previous version of an object. This is excellent for safety. It's terrible for costs if you don't also have lifecycle rules for the versions.

When versioning is enabled on a bucket, every time you overwrite an object, the old version is retained. Over time:

- Day 1: Image uploaded (v1)
- Day 30: Image updated (v1 is now a "noncurrent" version, v2 is current)
- Day 60: Image updated again (v1 and v2 are noncurrent, v3 is current)
- Day 365: v1, v2... v12 are all stored. You're paying for 12 copies of an image.

You might be wondering why versioning doesn't automatically clean up old versions. The answer is intentional — AWS doesn't want to automatically delete your data. But the consequence is that every version accumulates until you tell S3 explicitly how long to keep them. The fix: lifecycle rules for noncurrent versions.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom applied these rules to all versioned buckets. The following month, S3 storage decreased by 18%.

**Incomplete Multipart Uploads: The Invisible Accumulation**

There's a subtler S3 cost that most engineers miss entirely: incomplete multipart uploads.

When S3 uploads a large file, it breaks it into parts and uploads each separately. This is the multipart upload mechanism — more reliable than a single large PUT for files over a few hundred megabytes. But if an upload starts and then fails midway — a network interruption, a client crash, an application bug — the already-uploaded parts remain in S3. They're not visible as objects in your bucket. They don't appear in any list. But they're stored, and you're charged for them at standard S3 rates.

Tom found this by enabling the S3 Storage Lens dashboard in the S3 console and sorting by "incomplete multipart uploads." Nimbus had 340GB of incomplete multipart upload data sitting silently in buckets across four AWS accounts, some of it over a year old.

"How much does that cost per month?" Tom asked. $0.023/GB/month × 340GB = $7.82/month. Small individually. But it had been accumulating for a year without anyone noticing.

The fix: add a lifecycle rule to every bucket.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

After seven days, any incomplete multipart upload is automatically cleaned up. This runs indefinitely without any ongoing attention.

"If all of that had been sitting there a full year — call it $94 we've spent on failed uploads," Leo said.

"On failed uploads," Tom confirmed. "Not even on successful storage. This is the definition of infrastructure waste."

**EBS: Right-Sizing and the gp3 Upgrade**

EBS volume pricing has two components:

1. Storage (per GB per month)
2. Provisioned IOPS and throughput (if you're on io1/io2 or paying for extra gp3 performance)

**The gp3 opportunity**: In Chapter 6, we noted that gp3 is the current default and is cheaper than gp2. If Nimbus had volumes created before gp3 was available (it launched in December 2020), those might still be gp2.

The migration is straightforward: modify the volume type from gp2 to gp3 in the AWS console or via CLI. No downtime required. The volume remains available during the conversion. Performance characteristics are equal or better — gp3 provides 3,000 IOPS and 125 MB/s baseline throughput, compared to gp2's burstable model that could be inconsistent for smaller volumes.

"Wait — but *why* would we do it that way?" Maya asked. "If gp3 is cheaper and at least as good as gp2, why didn't AWS just migrate everyone automatically?"

"Because AWS doesn't make unilateral changes to customer infrastructure," Tom said. "Even beneficial ones. The modification could theoretically have side effects for some workload. The customer has to initiate it. Which is why thousands of teams are still paying gp2 prices years after gp3 launched, simply because nobody went looking."

Tom decided to do the gp3 migration on a Saturday morning — the same morning discipline he'd applied to the EC2 pricing analysis. Quiet time. No standups. Just the AWS console and a plan.

He had identified 8 volumes across the production environment that were still gp2: the four API server root volumes, two volumes attached to background processors, and two legacy data volumes that had been created before the gp3 migration had become standard practice for new deployments. Together they totaled 960 GB.

The migration process was a single API call per volume:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

The `--iops 3000` and `--throughput 125` parameters matched gp3's baseline defaults. For gp2, Tom had checked the CloudWatch metrics first: average IOPS on each volume was between 200 and 800. None of them needed more than the 3,000 IOPS baseline that gp3 provided for free. The throughput was similarly comfortable — well within the 125 MB/s default.

"What if a volume needs more IOPS after we switch?" Maya asked, when Tom explained the migration plan.

"We can increase the provisioned IOPS on a gp3 volume at any time," Tom said. "The migration doesn't lock anything in. If we go to gp3 at 3,000 IOPS and discover that's insufficient, we modify the volume again to add more. The modification is live — no downtime, no unmounting."

"And gp2 can't be modified in place?"

"gp2 can be modified to gp3 in place. What you can't do is go back from gp3 to gp2 — at least, not easily, and there's no reason to."

The actual migration took 73 minutes from first command to completion across all 8 volumes. AWS modified each volume while it was mounted and in use. The API servers continued receiving traffic throughout. CloudWatch showed no spikes in I/O latency during the conversion — the transition was completely transparent to the running application.

"That's what 'no downtime required' actually looks like," Leo said, looking at the before-and-after metrics Tom had captured. "I assumed 'no downtime' meant 'brief restart.' It means literally nothing changes from the application's perspective."

The saving: gp2 was $0.10/GB/month; gp3 was $0.08/GB/month. On 960 GB: $96/month vs $76.80/month. Monthly saving: $19.20. Not transformative on its own, but the discipline it represented was. Any new volume created from that point forward used gp3 by default. The organizational rule Tom wrote that morning: no gp2 volumes. Any engineer creating an EBS volume should use gp3 unless there's a specific, documented reason otherwise.

**IOPS and throughput**: gp3 volumes come with 3,000 IOPS and 125 MB/s throughput by default, at no extra charge. You can provision more if your workload needs it. Review whether provisioned performance is actually being utilized.

In the same audit, Tom found two volumes with 10,000 provisioned IOPS — a legacy setting from before he'd joined, sized for a database that had since migrated to Aurora. He checked the CloudWatch metrics: actual average IOPS was 1,200. He reduced the provisioned IOPS to 4,000 (a safety margin above the actual peak).

Monthly saving: $68 in provisioned IOPS costs that had been paying for performance headroom nobody was using.

**Snapshot lifecycle**: EBS snapshots are incremental (each snapshot only stores changes since the previous one), but they accumulate. Old snapshots from the early days of Nimbus still existed. Tom kept 30 days of daily snapshots and deleted the rest.

**EFS: Storage Classes and the Intelligent-Tiering Decision**

Amazon EFS has its own storage classes:

- **EFS Standard**: For files accessed frequently. Higher cost.
- **EFS Infrequent Access (IA)**: For files not accessed for 30 days. 92% cheaper than Standard.
- **EFS Archive**: For files not accessed for 90 days. Even cheaper than IA.

**EFS Intelligent-Tiering**: Automatically moves files between storage classes based on access patterns.

Tom enabled Intelligent-Tiering on the EFS volume. Six weeks later, 68% of the files had moved to Infrequent Access. Monthly EFS cost dropped from $89 to $31.

But the choice between Intelligent-Tiering and a manual lifecycle rule wasn't trivial. Tom had considered it.

"Wait — but *why* would we do Intelligent-Tiering versus just setting a manual lifecycle rule?" Maya asked. "If we know that files older than 30 days aren't being accessed, why not just set the rule and be done?"

"Intelligent-Tiering handles files that come back," Tom said. "If I set a lifecycle rule to move files to IA after 30 days, and then someone accesses a file that's been in IA for six months, it stays in IA. With Intelligent-Tiering, if access resumes, the file automatically moves back to Standard. It's bidirectional."

"When would you prefer the lifecycle rule then?"

"When you're certain the access pattern is one-directional. Archive logs — they're written, they age, they're accessed once for a compliance audit and then never again. For that pattern, a lifecycle rule that moves to Archive after 90 days is cheaper than Intelligent-Tiering because you're not paying the monitoring overhead."

"There's a monitoring fee?"

"For S3 Intelligent-Tiering, yes, which is why we covered small-object economics back in the S3 lifecycle chapter. For EFS, the decision is mostly about access pattern: if files may become hot again, Intelligent-Tiering is safer. If they only age in one direction, a lifecycle rule to Archive is cheaper and simpler."

**S3 Cost Allocation Tags: Finding Who's Spending What**

As Nimbus grew, multiple teams were storing data in S3. The analytics team had their own buckets. The engineering team had their buckets. The restaurant data team had their buckets.

The bill just showed "S3: $198." There was no breakdown by team.

**Cost allocation tags** let you tag AWS resources with business metadata (team, project, environment) and then see costs broken down by those tags in AWS Cost Explorer.

Tom added tags to all S3 buckets:
```
Team: analytics
Environment: production
Project: nimbus-core
```

After a billing cycle with tagging, he could see: "The analytics team's data lake is $74/month. Engineering backups are $43/month. Restaurant data is $81/month."

Now he could have budget conversations with each team instead of just looking at an aggregate number.

**AWS Cost Explorer and AWS Budgets**

**AWS Cost Explorer**: Visualizes historical and forecasted costs by service, region, tag, and usage type. Essential for understanding where money goes.

**AWS Budgets**: Sets alerts when costs exceed (or are forecast to exceed) a threshold. You can budget by service, region, tag, or account.

Tom set up three budgets:

1. Total monthly bill: Alert at 90% of the budgeted amount
2. EC2 On-Demand: Alert if On-Demand spend exceeds $500/month (signals a Savings Plan gap)
3. Data transfer out: Alert at $200/month (data transfer costs can spike unexpectedly)

The Budgets sent alerts to a Slack channel. The team saw when they were approaching limits, rather than discovering it on the monthly invoice.

**The Receipt With Every Line: Cost and Usage Reports**

Cost Explorer answered most of Tom's questions. Then he hit one it couldn't: "exactly which S3 buckets, hour by hour, drove last Tuesday's spike — and under which tags?"

For forensic-grade questions, AWS provides the **Cost and Usage Report (CUR)** — now delivered through **Data Exports** — the most detailed billing data AWS produces: every line item, **per resource, per hour**, with tags, delivered to an S3 bucket you own. It's not a dashboard; it's the raw ledger. The standard pattern is to query it with Athena (it lands in a columnar format) or feed it to QuickSight for dashboards.

The division of labor on the exam: **Cost Explorer** = interactive visualization and forecasts in the console. **Budgets** = alerts on thresholds. **CUR/Data Exports** = the most granular data, delivered to S3, for your own analysis. When a question says "resource-level, hourly cost data for custom analysis" — that's the CUR, not Cost Explorer.

"Have we thought about what happens if we just never look at this?" Priya asked. "We've found $6,700 in two days. What's still hiding?"

"Regular audits," she continued. "Monthly Cost Explorer reviews. AWS Trusted Advisor flags unattached volumes and idle resources automatically. Automate the cleanup of known waste patterns: delete snapshots older than N days, alert on unattached EBS volumes, expire old S3 versions."

**S3 Requester-Pays: Shifting the Transfer Cost**

During the storage audit, Tom found a situation he hadn't anticipated.

Nimbus's restaurant partners needed to download their menu photo assets — the processed, resized images that the ordering platform served to customers. For a restaurant updating its menu, this meant downloading anywhere from 50 MB (a small update) to 800 MB (a full seasonal refresh) of image files. Currently, Nimbus was paying the outbound data transfer cost on every download: $0.09/GB from S3 to the partner's location.

At 287 restaurant partners, with an average of one menu refresh per month and an average download of 200 MB, the math was: 287 × 0.2GB × $0.09 = $5.17/month. Not significant at current scale.

"What happens at 2,000 restaurants?" Tom asked.

"Same math," Maya said. "About $36/month."

"What about 10,000 restaurants, and partners are downloading large seasonal asset packs — say, 2 GB for holiday menu updates?"

He ran it. 10,000 × 2GB × $0.09 = $1,800/month in data transfer, just for partners downloading assets they needed.

"That's a real number," Priya said.

"Have we thought about what happens if that bill appears on the same month we're trying to close a Series B?" Priya continued.

"S3 Requester-Pays," Tom said.

S3 has a feature called Requester-Pays: when enabled on a bucket, the entity making the request — not the bucket owner — pays the data transfer and request costs. The bucket owner still pays for storage. But every download from the bucket is billed to the requester's AWS account.

The trade-off is access. Requester-Pays requires requesters to be AWS customers with a valid account — unauthenticated or anonymous access to a Requester-Pays bucket returns an error. For Nimbus's restaurant partners, who were businesses with varying levels of technical sophistication, requiring them to have an AWS account to download their own menu assets was not a feasible model.

"We can't do Requester-Pays for direct partner access," Maya said. "Most of our partners aren't going to set up an AWS account to download photos."

"Correct," Tom said. "But we can use it for the B2B integrations — the larger chains that have technical teams and AWS accounts. Not the small restaurant on the corner, but the 50-location burger chain that has an engineering team and integrates with our API directly. For that segment, Requester-Pays makes sense."

"And for the rest?"

"We give them a download portal that uses pre-signed S3 URLs. The transfer still goes through AWS, the cost is still ours — but it's also already factored into the partner pricing. The Requester-Pays option is something we'd build into contract negotiations for larger partners, not something we deploy today."

Tom added it to the spreadsheet under "future optimizations": S3 Requester-Pays for enterprise partners with AWS accounts. At 2,000 restaurants with 20% enterprise clients, at 2 GB monthly downloads: $72/month potentially shifted to partners. Small at that scale, but the same pattern becomes meaningful as asset packs grow. Review when partner count exceeds 1,000 or when enterprise partners start pulling larger seasonal packages.

"The lesson is the same one as always," Tom said. "Know what the cost becomes at scale before you're at scale. The $5 problem today is the $1,800 problem in three years. Designing for it now costs nothing."

**Governance: Auto-Delete vs Alert-Only**

The automation question was the one that generated the most disagreement.

"Should we auto-delete unattached EBS volumes after 14 days?" Tom asked. "AWS Config rules can flag them. Lambda can delete them automatically."

"No," Priya said immediately.

"Why not?"

"Because auto-deletion means we will eventually delete something that was unattached for a reason. Maybe someone detached a volume to move it to a different instance, and it's been sitting for 12 days while a change is reviewed. Auto-delete at day 14 destroys that data."

"So alert-only?" Tom said. "We get a notification but don't automatically delete."

"Alert first," Priya said. "Force a human to make the decision. The alert is: 'This volume has been unattached for 14 days. Tag it as `keep: true` if you need it, or it will be flagged for deletion in the next review.' The human decision is then documented by the presence or absence of the tag."

"That's slower," Leo said.

"It's slower and less likely to destroy data," Priya said. "We've already lost $3,200 to neglect. We haven't lost any data to automation. I know which I'd rather maintain."

Tom landed on a hybrid: auto-alert at 7 days, require a `keep: true` tag to suppress future alerts, and run a weekly report of all untagged-and-unattached volumes for the team to review together. No auto-deletion.

**Variation: When Cleanup Costs More Than It Saves**

If you need the safety of extra snapshots, keep them — but every snapshot older than 90 days with no access should be earning its place. The trade-off is asymmetric: deleting a snapshot you needed costs an incident; keeping a snapshot you didn't need costs only a small monthly fee. For compliance-sensitive data, the cost of keeping old snapshots is real but usually less than the cost of not having them when an auditor asks. For development snapshots from a test that ran 14 months ago, the calculation goes the other way.

If you enable EFS Intelligent-Tiering for files with uncertain access patterns, the automatic tiering saves money and requires no ongoing intervention. If the files predictably age toward archive access, a direct lifecycle rule is simpler. Measure before enabling.

SAA-C03 connection: The exam tests whether you can choose between S3 storage classes (Standard, IA, Glacier) given an access frequency scenario. The same logic applies here — the right class depends on how often the data is accessed.

**The Cost of Neglect**

Tom built a spreadsheet. He calculated how much Nimbus had spent on:

- Unattached EBS volumes (16 months): $3,200
- Old S3 snapshots (discovered and deleted): $890
- Unneeded provisioned IOPS: $816
- gp2 to gp3 migration savings (projected, if done earlier): $346 over 18 months
- Noncurrent S3 versions accumulating: $1,340
- Incomplete multipart uploads: $94

Total waste identified: approximately $6,700 over 18 months.

"Six thousand seven hundred dollars," Maya said.

"From neglect," Tom said. "Not from making wrong architectural decisions. From not cleaning up."

"What's the systematic fix?"

"And," Tom added, "make cost hygiene part of the deployment process. When an engineer terminates an EC2 instance, the EBS volume gets deleted automatically unless they explicitly opt out."

## Strengths and Limitations

**Cost optimization discipline**:

- Regular reviews catch accumulating waste before it becomes significant
- Tagging enables accountability — teams see their own costs
- Automated alerts prevent billing surprises
- Lifecycle policies and right-sizing are often set-and-forget savings

**Where it gets complicated**:

- Identifying waste across a large account with many teams requires centralized tooling
- Some waste is intentional (keeping extra snapshots "just in case") — the cost/risk trade-off is a judgment call
- gp3 migration requires careful validation (IOPS and throughput defaults may differ from gp2 behavior in some edge cases)
- Cost allocation tags require discipline across all teams — inconsistent tagging makes the data incomplete
- Auto-deletion automation is dangerous for storage — alert-and-review is safer for volumes and snapshots

## Summary

The storage audit had taken two days. The waste it uncovered — $6,700 across 18 months of invisible accumulation — was less a failure of decision-making than a failure of attention. Nothing had been configured wrong on purpose. The snapshots, the unattached volumes, the accumulating version history, the incomplete multipart uploads: each made sense at the time and was simply never revisited. The lesson was not about specific AWS services. It was about building the habit of looking.

- **Storage costs accumulate invisibly** — regular audits are essential.
- **Unattached EBS volumes** are a common source of waste. Delete them (or automate deletion when instances terminate).
- **EBS right-sizing**: Migrate gp2 to gp3 (typically 20% savings). Remove excess provisioned IOPS.
- **S3 versioning**: Enable lifecycle rules for noncurrent versions to avoid paying for unlimited version history.
- **Incomplete multipart uploads**: Add an `AbortIncompleteMultipartUpload` lifecycle rule to every bucket. This is often overlooked and accumulates silently.
- **EFS Intelligent-Tiering**: Automatically moves files to lower-cost tiers based on access frequency. For predictable access patterns, manual lifecycle rules may be cheaper.
- **Governance**: Alert on unattached volumes after 7-14 days; require explicit tagging to suppress. Avoid auto-deletion for storage resources.

## Exam Tips

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.1)*

- **Cost allocation tags**: Enable User-Defined Tags for cost allocation in the billing console; then tag resources. Cost Explorer shows breakdowns by tag. Exam scenario: "identify which department is generating the most S3 costs" → cost allocation tags.
- **AWS Trusted Advisor**: Identifies underutilized EC2 instances, unattached EBS volumes, idle load balancers, and other waste. Basic checks free; full checks require Business/Enterprise Support.
- **EBS cost components**: Storage (per GB), provisioned IOPS (if io1/io2 or extra gp3), throughput (if extra gp3). Know which components can be right-sized.
- **S3 versioning costs**: Noncurrent versions are stored and charged at the same rate as current versions. Lifecycle rules that expire noncurrent versions are critical for cost control in versioned buckets.
- **AWS Compute Optimizer**: Analyzes EC2 utilization and recommends right-sized instance types. Exam signal: "reduce EC2 costs by selecting the right instance type" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Uses ML to detect unusual spending patterns. Exam signal: "automatically detect unexpected cost increases" → Cost Anomaly Detection.
- **Cost tooling lineup**: interactive charts/forecasts → Cost Explorer. Threshold alerts → Budgets. "Most granular, resource-level/hourly billing data delivered to S3 for custom analysis (Athena/QuickSight)" → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: "share a large S3 dataset; consumers pay their own download costs" → S3 Requester Pays (owner keeps paying storage only; requesters must authenticate with an AWS account).

## Exercises

**Exercise 1 — Recall**

Explain why unattached EBS volumes generate costs even though no EC2 instance is using them. What process should engineers follow when terminating an EC2 instance to avoid this waste?

*(Hint: EBS volumes store data on physical disk, and that disk costs money regardless of whether it's being read.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company's AWS bill has grown from $5,000 to $9,000/month over six months, but they haven't added new services. The engineering team suspects storage costs are the issue. Which combination of AWS tools would BEST identify and explain the cost increase?

A) AWS CloudTrail to review API calls and identify who created new resources  
B) AWS Cost Explorer for service-level cost breakdown, and AWS Trusted Advisor for idle and unattached resource detection  
C) Amazon CloudWatch for monitoring resource utilization and creating cost alarms  
D) AWS Config for identifying all resources and their compliance status

**Hint 1**: "Identify the cost increase" → visualize cost breakdown by service.

**Hint 2**: "Idle and unattached resources" → a specific tool proactively identifies these.

**Hint 3**: CloudTrail logs API calls; Cost Explorer shows cost trends. Which is more useful for cost analysis?

**Answer**: B

**Explanation**: AWS Cost Explorer shows cost trends broken down by service, region, and usage type — perfect for identifying which service drove the increase. AWS Trusted Advisor's cost optimization checks identify unattached EBS volumes, idle EC2 instances, underutilized load balancers, and other common waste sources.

**Why not A?** CloudTrail logs who created resources and when, but doesn't directly show cost trends or identify waste.

**Why not C?** CloudWatch monitors resource performance (CPU, memory) — useful for right-sizing but not for identifying accumulated storage waste.

**Why not D?** AWS Config tracks resource configurations and compliance but isn't a cost analysis tool.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus's S3 bill shows $340/month for a bucket labeled "backups." The bucket has versioning enabled and contains:

- Daily database snapshots (7 days is enough for their policy)
- Weekly full backups (kept for 3 months)
- Quarterly archives (kept for 7 years for tax compliance)

Design a lifecycle policy for this bucket that minimizes cost while meeting these retention requirements. What storage class should each type of data use? How would you handle versioning to prevent old versions from accumulating?

*(There is no single correct answer. The goal is to practice lifecycle policy design.)*

## Post-Credits Scene

Tom published the cost audit findings to the team.

Waste identified: $6,700 over 18 months.
Expected annual savings from changes implemented: $6,200.

Then he added a line at the bottom: "This does not include the savings from Savings Plans ($14,200/year) or S3 lifecycle policies ($7,800/year). Combined annual optimization impact: approximately $28,200."

Maya read it twice.

"That's almost a junior engineer's salary," she said.

"In waste," Tom confirmed.

"Or," Leo said, "it's proof that doing these optimizations earlier would have funded that junior engineer."

Tom looked at him.

"That's the right way to think about it," he said. "Cost optimization isn't about cutting. It's about not paying for things that don't create value."

Maya pinned the document to the company wiki.

In the next chapter: the database tier gets the same treatment, and Tom discovers the one place he was actually underinvesting.
