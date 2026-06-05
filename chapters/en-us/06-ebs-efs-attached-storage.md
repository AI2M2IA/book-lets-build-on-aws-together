# Chapter 6: The Disk That Follows You Around

Tom had a red pen and a habit that made Leo nervous.

Every Saturday morning, he sat down with a coffee and printed something. Not email. Not reports. He printed the list of what Nimbus was running and read it like a ledger, line by line, pen in hand. He had been doing this since week two. The sound of the printer warming up had become part of the weekend.

Leo called it "the thing Tom does that makes Leo feel like he's done something wrong."

That Saturday, Tom circled something and left the printout on Maya's desk without a word.

She found it Monday morning. One circle. One note in the margin, three words:

*Everything. One machine.*

The photos were safely in S3 now — that problem was solved. But the database was still on the same EC2 instance as the web server. Order history, customer records, two months of transactions. The application and everything underneath it, sharing a single virtual disk.

"What happens to the database if the instance crashes?" Maya asked, the printout in her hand.

"It crashes too," Leo said.

"And the data?"

"Depends on how the database stores it."

That "depends" was the problem.

**How EC2 Instances Store Data**

When an EC2 instance runs, its operating system lives somewhere on a disk. That disk
is called the **root volume**. By default, this is an **EBS volume** — even when you
don't think about it.

But there's something else: EC2 instances also have **instance store** storage.

Instance store is temporary storage physically attached to the underlying hardware that
runs your virtual machine. It's extremely fast — faster than almost any other storage
option in AWS. But it comes with a catch.

Instance store is **ephemeral**.

When the instance stops or is terminated, instance store data is gone. Permanently.
Not recoverable. AWS doesn't warn you very loudly about this, which is how teams
discover it: by losing data.

Instance store is appropriate for caches, temporary processing files, and scratch
space. Never for data you care about.

**EBS: The Persistent Disk**

Imagine an external hard drive that you can plug into your EC2 instance — one that
doesn't disappear when you unplug it, and that you can move to a different machine
if you need to. AWS calls this **EBS**: Elastic Block Store.

EBS is persistent block storage for EC2 instances.

Block storage means it behaves like a real hard drive: your operating system can create
filesystems on it, read and write arbitrary bytes at arbitrary positions, run databases
on it, and treat it exactly like an attached disk.

The key properties:

**Persistent.** Unlike instance store, EBS volumes survive instance stops, starts, and
even instance termination (depending on configuration). The data stays on the volume
even when no instance is using it.

There's a configuration nuance here: when you create an EC2 instance, the root volume
has a setting called "Delete on Termination." By default, this is set to true — the
root volume is deleted when the instance is terminated. For additional data volumes
you attach, the default is false — they persist after the instance is terminated.
You can change both settings. If you want the root volume to survive instance termination
(for forensic analysis or data recovery), disable "Delete on Termination." If you want
data volumes to be cleaned up automatically, enable it.

**Attachable and detachable.** An EBS volume can be detached from one instance and
attached to another. If you need to migrate data or recover from a failed instance,
you can detach the volume and reattach it elsewhere.

The detach-and-reattach workflow is slower than a snapshot restore but preserves
the exact state of the volume — all uncommitted writes, all cached data, the exact
filesystem state. This makes it useful for forensic analysis (attach the volume to
an analysis instance without booting the original system) and for data migration
(move a database volume to a larger instance without taking a snapshot).

**Single attachment (mostly).** By default, an EBS volume is attached to exactly one
EC2 instance at a time. A single instance can have multiple EBS volumes, but a single
EBS volume can't be mounted by multiple instances simultaneously (with one exception:
EBS Multi-Attach, which has limited use cases and important restrictions).

EBS Multi-Attach allows io1/io2 (Provisioned IOPS) volumes to be attached to multiple instances simultaneously
in the same AZ. This sounds like it solves the "shared storage" problem, but it comes
with serious constraints: the applications on the attached instances must be able to
coordinate concurrent access — shared filesystem semantics (lock management, write
ordering) are not provided by EBS. In practice, EBS Multi-Attach is used for clustered
database applications that handle the coordination themselves. For general shared file
access, EFS is simpler and more appropriate.

The EBS analogy: an external hard drive plugged into one laptop. The laptop
(EC2 instance) can read and write to it. When you're done, you can unplug it and
plug it into a different laptop.

**EBS Volume Types**

Not all EBS volumes are the same. AWS offers several types with different performance
and cost profiles.

**gp3 (General Purpose SSD)**: The default choice for most workloads. Good balance of
performance and price. Suitable for boot volumes, small databases, and development
environments.

Before gp3 became the default, there was **gp2** — and you'll still encounter it in the wild. gp2 volumes tie their IOPS performance directly to volume size: you get 3 IOPS per gigabyte, up to a maximum of 16,000 IOPS (which requires a 5,334 GB volume). Throughput is capped at 250 MB/s. This coupling means that on gp2, the only way to get more IOPS is to make the volume bigger — even if you don't need the extra space. gp3 broke that dependency: it starts at 3,000 IOPS and 125 MB/s regardless of size, and lets you configure IOPS and throughput independently, at lower cost. AWS recommends gp3 for new volumes, but since many existing workloads still run on gp2, you need to know both.

**io2 (Provisioned IOPS SSD)**: High-performance option for I/O-intensive workloads.
You specify how many I/O operations per second (IOPS) you need, and AWS guarantees
that performance. Appropriate for large production databases.

**st1 (Throughput Optimized HDD)**: Magnetic storage optimized for large sequential
reads and writes. Lower cost than SSD, but slower for random I/O. Good for data
warehousing and log processing.

**sc1 (Cold HDD)**: The cheapest EBS option. For data accessed infrequently. Not
appropriate for anything time-sensitive.

"How much more does io2 cost compared to gp3?" Tom asked, looking up from his notebook.

Leo pulled up the pricing page. io2 ran roughly three times the per-GB cost of gp3,
plus a separate charge per IOPS provisioned. Tom noted the gap. "So we use gp3 until
the database actually needs the performance guarantee."

The exam doesn't require you to memorize all types. It does test your ability to
match requirements to the right type: IOPS requirements → io2. Cost-sensitive sequential
workloads → st1. General web applications → gp3.

**IOPS vs. Throughput: Why the Distinction Matters**

Tom came back to the EBS volume question the following Tuesday, after checking CloudWatch.

"I see two metrics on the EBS dashboard," he said. "IOPS and throughput. They're different things?"

They are.

**IOPS** (Input/Output Operations Per Second) measures how many read or write operations the disk can handle per second. Each operation is typically small — 4KB to 256KB. High IOPS matters for databases that do many small, random reads and writes: fetching individual rows, updating records, handling concurrent queries.

**Throughput** (measured in MB/s) measures how much data moves per second. High throughput matters for sequential workloads: reading large log files, streaming analytics, loading large datasets.

A database typically needs high IOPS and low-to-moderate throughput. A data warehouse scanning large tables needs high throughput and can live with moderate IOPS.

Tom had been watching the Nimbus database's CloudWatch metrics. The IOPS were spiking during the dinner rush — short, random reads as the application fetched menu items and order data. The throughput was low. The pattern matched a database workload that needed better IOPS, not better throughput.

"So if the database gets slow," Tom said, "we check whether it's IOPS-bound or throughput-bound before we upgrade the volume?"

"Right," Priya said. "Upgrading from gp3 to io2 adds IOPS at a cost. If the problem is throughput, that upgrade won't help. Check the metric first."

This is exactly how you avoid expensive storage upgrades that solve the wrong problem.

**EBS Snapshots: The Backup**

Here's something that saves companies regularly.

An **EBS snapshot** is a point-in-time backup of an EBS volume, stored in S3 (though
you access it through the EBS interface, not directly through S3). Snapshots are
incremental: the first snapshot captures the full volume; subsequent snapshots only
store what changed since the last one.

You can create a new EBS volume from a snapshot — restoring to a point in time before
a database corruption, a bad deployment, or an accidental deletion.

You should automate snapshots. AWS provides **Amazon Data Lifecycle Manager** for this
purpose: define a policy (take a snapshot every 6 hours, keep the last 7 days), and
it runs automatically.

Priya had this set up before the database even went into production.

Leo had not thought of it.

"Have we thought about what happens if the snapshot job fails silently?" Priya asked. "If the policy runs but the snapshots aren't actually valid?"

They tested the restore process that afternoon.

Priya's full snapshot backup policy for the Nimbus production database, once she had time to document it properly:

- **Daily snapshots**, retained for 7 days. These cover the normal recovery scenario: a bad deployment, an accidental deletion, a corruption event discovered within a week.
- **Weekly snapshots** (taken every Sunday at 2am), retained for 30 days. These cover the scenario where a problem isn't detected immediately — a subtle data corruption that's only noticed weeks later.
- Cross-region snapshot copy to `us-east-1`, once per week, retained for 30 days. These cover the scenario where the entire `us-west-2` Region is unavailable and Nimbus needs to reconstruct the database elsewhere.

"That seems like a lot of snapshots," Leo said.

"Each incremental snapshot after the first is small," Priya said. "You're only storing what changed. The total storage cost is modest."

Tom had already looked up the price. Daily snapshots of a 50GB database, kept for 7 days, plus weekly snapshots retained for 30 days — approximately $3 to $5 per month. The cost of not having them, if the database was ever corrupted, was immeasurably higher.

"And Fast Snapshot Restore?" Leo asked. "I saw that option when I was looking at the settings."

**Fast Snapshot Restore** (FSR) is an EBS feature that eliminates the I/O performance penalty that normally occurs when you first use a restored snapshot. Without FSR, a freshly restored EBS volume performs poorly for the first few minutes or hours as the data is lazily loaded from S3 — reads hit S3 for data that hasn't been pulled to the volume yet. With FSR enabled on a snapshot in a specific AZ, the restored volume is immediately ready for full performance.

FSR costs extra — you pay per snapshot per AZ per hour that FSR is enabled. For Nimbus's disaster recovery snapshots, the occasional use didn't justify the ongoing FSR cost. For a production database snapshot that needed to be restored and operational within minutes in an emergency, FSR was worth it.

"Enable FSR on the weekly snapshot we'd actually use for disaster recovery," Priya said. "Don't enable it on every daily snapshot in the retention window."

Tom added the cost calculation to his spreadsheet.

**Cross-Region Snapshot Copy for Disaster Recovery**

EBS snapshots live in the Region where they were created. If the entire `us-west-2` Region goes down, your snapshots in `us-west-2` are inaccessible.

The solution: **cross-region snapshot copy**. You can copy an EBS snapshot to another Region, giving you a usable backup even if your primary Region is unavailable.

AWS Data Lifecycle Manager supports automated cross-region copy as part of a snapshot policy: take a daily snapshot in `us-west-2`, automatically copy it to `us-east-1` once a week. If disaster strikes, launch a new EC2 instance in `us-east-1`, restore from the cross-region snapshot, update the DNS endpoint, and continue operating.

"This is our disaster recovery plan for the database," Priya said, presenting the policy documentation to the team. "Not a full multi-region architecture — that's more complexity than we need right now. But if `us-west-2` goes down completely, we can restore in `us-east-1` within two hours."

"Two hours of downtime," Tom said.

"Versus infinite downtime," Priya said.

Tom acknowledged the distinction.

**EBS Encryption: The Story of Why You Can't Encrypt In-Place**

The Nimbus production database had been running for six weeks when Priya flagged something.

"The EBS volume is not encrypted," she said.

"Can we encrypt it?" Leo asked.

"Yes. But not in-place."

Here's the thing about EBS encryption: you cannot encrypt an existing, unencrypted EBS volume directly. The data is already written in plaintext. To encrypt it, you have to:

1. Create a snapshot of the unencrypted volume
2. Copy the snapshot, enabling encryption on the copy
3. Create a new encrypted EBS volume from the encrypted snapshot
4. Stop the instance
5. Detach the old unencrypted volume
6. Attach the new encrypted volume
7. Start the instance and verify everything works

This process has a downtime window — the stop, detach, attach, start sequence. For Nimbus, with a small database, the window was about fifteen minutes. For a large production database with hundreds of GB, the snapshot and copy process can take longer, though the actual instance downtime is still just the stop/start cycle.

"Why can't we just flip a switch?" Leo asked.

"Because the existing data on disk is unencrypted bytes," Priya said. "AWS can't re-encrypt them without reading and rewriting every block — which is exactly what the snapshot copy process does. It reads every block from the source snapshot, encrypts each one, and writes it to the new snapshot."

Leo walked through the process. The new encrypted volume was attached. The instance came back online. The database was running on an encrypted volume.

"New EBS volumes can be created encrypted by default," Priya said. "There's an account-level setting. Every new volume is encrypted automatically. We should have enabled this on day one."

She enabled it. From that point forward, every EBS volume created in the Nimbus AWS account was encrypted by default — no extra steps required.

**EFS: The Shared Filing Cabinet**

EBS is a disk attached to one instance. What if multiple instances need to access the
same files simultaneously?

What you need is something like the filing cabinet in the center of an office — anyone
can walk up, pull a file, put it back, and the next person sees the change immediately.
Multiple people, simultaneously, accessing the same storage.

AWS calls this **EFS**: Elastic File System.

EFS is a managed network filesystem. Multiple EC2 instances can mount the same EFS
filesystem at the same time and read/write to shared files. This is the key capability
that EBS doesn't provide.

To put it plainly:

EBS is an external hard drive plugged into one laptop. Only that laptop can use it at
a time.

EFS is the filing cabinet in the center of the office. Any team member can walk up, open
a drawer, read a file, put something back.

**When do you need EFS?**

- When multiple EC2 instances need to share files — content management systems, shared
  configuration files, shared media libraries
- When you have a horizontally scaled application where all instances need access to
  the same data
- When you need a persistent filesystem that survives instance failures

EFS is accessed over the network using the NFS protocol (specifically NFSv4). Any EC2
instance that has network connectivity to the EFS mount target can mount it — including
instances in different AZs within the same Region. You configure mount targets in each
AZ, and instances connect to the nearest mount target for optimal performance.

The practical implication: EFS works across AZs out of the box. If you have web servers
in `us-west-2a` and `us-west-2b` both mounting the same EFS filesystem, a file written
by a server in `2a` is immediately visible to a server in `2b`. This is the shared
filesystem behavior that EBS cannot provide.

**EFS Performance Modes**

EFS has two throughput modes that matter for sizing:

**Elastic Throughput** (the default for most new filesystems): EFS automatically scales throughput up and down based on actual usage. You don't provision a throughput level. You pay for what you use. This is the right mode for variable workloads where throughput needs fluctuate — like Nimbus, where Monday morning traffic is different from Friday evening traffic.

**Provisioned Throughput**: You specify the throughput level regardless of the data stored. Useful when your workload needs consistently high throughput that exceeds what the stored data volume would provide in Elastic mode. If you're running a build system that reads tens of gigabytes per minute regardless of how much is stored, Provisioned Throughput is appropriate.

There's also a third mode, **Bursting Throughput**, which is the original EFS behavior and still the default for file systems created before Elastic became available. In Bursting mode, throughput scales with how much data you store: you get a baseline of 50 KB/s per GB, plus burst credits that accumulate when you're below the baseline and can be spent when you need higher throughput (up to 100 MB/s for smaller file systems, or up to a multiple of the baseline for larger ones). It's the right choice for workloads with unpredictable or spiky access patterns where the file system is large enough to earn meaningful burst credits. If your file system is small and your access pattern is bursty, you can burn through your credits quickly — watch the `BurstCreditBalance` CloudWatch metric to know where you stand.

Tom's question was immediate: "Is Elastic more expensive?"

"It depends on usage pattern," Leo said. "With Elastic, you pay for the throughput you actually consume. With Provisioned, you pay for the throughput you've specified even if you're not using it."

"So for variable workloads, Elastic is usually cheaper," Tom said.

"Usually," Priya said. "Check your actual throughput patterns in CloudWatch before deciding."

EFS also has two performance modes: **General Purpose** (low latency, suitable for most workloads, the default) and **Max I/O** (higher throughput for highly parallelized workloads at the cost of slightly higher latency). General Purpose handles the vast majority of use cases. Max I/O was designed for applications that need to make thousands of simultaneous filesystem operations — large-scale media processing pipelines, scientific computing workflows with many parallel readers.

**EFS vs. S3:** EFS is a filesystem (folders, files, permissions, locking). S3 is
object storage (upload, download, no filesystem semantics). EFS is much more expensive
than S3 — roughly $0.30 per GB per month for EFS Standard versus $0.023 per GB per month
for S3 Standard. Use S3 for files that are stored and retrieved whole. Use EFS for files
that applications actively read and write through standard filesystem operations.

**If EBS Then One Instance, But If EFS Then Many**

The EBS/EFS decision comes down to one question: how many instances need to access this storage at the same time?

If you build a horizontally scaled application on EBS, then each instance has its own disk — but when a user uploads a file to instance A, instance B can't see it. That's fine for databases (each DB has its own disk), but broken for shared content. If you need shared access, EFS is the answer — but EFS costs more per GB than S3, and has higher latency than EBS for random I/O. The right choice depends entirely on what your application does with the data.

**Choosing the Right Storage**

By now you've seen three types of storage in AWS. Let's make the decision crisp.

| Need                                  | Storage Type     |
|---------------------------------------|------------------|
| Database needs persistent, fast disk  | EBS (gp3 or io2) |
| Multiple servers need shared files    | EFS              |
| Files, backups, images, large objects | S3               |
| Temporary computation scratch space   | Instance Store   |
| Long-term archives at minimum cost    | S3 Glacier       |

You might be wondering: if EFS lets multiple instances share files, why not just use it for everything? Because EFS costs significantly more per GB than S3, and has higher latency than local EBS for random I/O. It's the right tool for shared filesystem access — not for general file storage or database storage.

Getting this decision right matters. Using S3 where you need EFS adds operational
complexity. Using EBS where you need EFS causes failures when you scale. Using
instance store where you need persistence loses data.

Priya printed this table and stuck it on the wall.

"Every time we add a storage requirement," she said, "we start here."

Let's walk through a few real scenarios to make the decision concrete:

**Scenario A**: A machine learning training job runs on a GPU EC2 instance and needs
to read a 200GB dataset. The job runs once a day and takes two hours. The dataset
is shared by multiple research teams.

Decision: S3. The dataset is large, read-once-per-job, and shared. S3 is cheap, durable,
and accessible from any EC2 instance or any team's account. The GPU instance reads
it via the S3 API. There's no need for a filesystem here.

**Scenario B**: A WordPress site runs on four EC2 instances behind a load balancer.
WordPress stores plugin files, theme files, and user uploads in a directory on the
server. All four instances need to read and write the same files.

Decision: EFS. WordPress uses filesystem semantics — it creates directories, writes
files, reads files by path. S3 would require rewriting the WordPress plugin ecosystem.
EFS mounts as a standard NFS filesystem, which WordPress works with natively.

**Scenario C**: A PostgreSQL database runs on an EC2 instance. It needs fast random I/O
for query execution and index lookups.

Decision: EBS (gp3 or io2). Databases need block storage with low latency for small,
random reads and writes. S3 is too slow and doesn't support filesystem semantics.
EFS has higher latency than EBS for random I/O.

The pattern: the default for files is S3. Add EBS when you need block storage for a
specific instance. Add EFS when multiple instances need to share a filesystem.
Instance store for temporary scratch space only.

## When EFS Isn't Enough: Amazon FSx

The next storage lesson didn't arrive as an outage or a whiteboard debate. It arrived as a sales contract — the kind Maya had been chasing since the portal launched, the kind that took a full quarter of demos and follow-up calls to close. Three months after the restaurant operator portal launched, Nimbus signed its first multi-location client: Copper Kettle, a family-owned group of a dozen locations across the midwest. Maya had run the deal. Tom had built the financial model. Leo had started planning the technical integration before the ink was dry.

Then he read the infrastructure notes from Copper Kettle's IT team.

"Their file servers are Windows," he said. "Everything is Windows. Their kitchen management software, their HR system, their scheduling tool — all of it writes to shared drives on Windows file servers. SMB protocol. Active Directory authentication."

"Can we lift them onto EFS?" Maya asked.

Leo shook his head. "EFS uses NFS. Their applications speak SMB. Those are different protocols. The Copper Kettle software doesn't know what NFS is. You can't just point it at an EFS mount."

"So we can't use EFS."

"Not for this. There's a different service."

**FSx for Windows File Server: EFS, But for Windows**

**Amazon FSx for Windows File Server** is a fully managed, Windows-native shared file system. It supports the SMB (Server Message Block) protocol — the same protocol that Windows servers, Windows applications, and on-premises Windows file shares have used for decades. It integrates with Active Directory, supports Windows ACLs (file-level permissions), and supports the Windows-specific features that Windows applications actually depend on.

Think of it as EFS, but for Windows — with all the Windows-specific features your Active Directory environment already expects. The Copper Kettle kitchen management software would connect to it exactly as it had connected to the on-premises file servers. The application doesn't change. The protocol doesn't change. The data just lives on a managed AWS service instead of a server in a basement somewhere in Chicago.

For the Copper Kettle migration: Leo provisioned an FSx for Windows File Server filesystem, connected it to the Copper Kettle Active Directory (extended to AWS via AWS Managed Microsoft AD), and mapped the existing drive letters. The kitchen software found its file shares exactly where it expected them.

"How much does that cost per month?" Tom asked.

Leo had already looked. FSx for Windows is priced per GB of storage per month — more expensive than EFS, significantly more than S3, but far cheaper than maintaining Windows file servers across a dozen locations. Tom wrote the number down without objection.

**FSx for Lustre: When Your ML Job Needs to Feed Hundreds of GPUs**

Meanwhile, Leo had started prototyping a recommendation engine on the side — predicting which dishes a customer was likely to order based on past behavior and what similar customers ordered. The training data was still small, but the experiment sent him down a rabbit hole of how serious ML teams feed their models: training jobs that read hundreds of gigabytes from S3 on every run.

"The pattern that keeps coming up in the case studies," he reported at the next team lunch, "is training jobs bottlenecked on I/O. Expensive GPUs sitting idle 40% of the time, waiting for the next batch of data."

This is a different problem from shared file storage. It's a high-performance computing (HPC) problem: when you have hundreds of processing units that all need to read data simultaneously, at very high throughput, from the same dataset.

**Amazon FSx for Lustre** is a fully managed implementation of the Lustre parallel file system. Lustre is purpose-built for exactly this scenario — parallel reads at extremely high throughput, across many simultaneous clients. It integrates natively with S3: you point FSx for Lustre at an S3 bucket, and it automatically makes that data available through the Lustre filesystem. The training job reads from a local mount point; FSx streams the data from S3 behind the scenes.

When your ML training job needs to feed data to hundreds of GPUs simultaneously, FSx for Lustre is the tool. The same applies to financial modeling, genomics workloads, and video rendering — any workload where the bottleneck is parallel I/O throughput rather than storage capacity.

The case study Leo had bookmarked told the story in two numbers: after migrating the training job to FSx for Lustre, GPU utilization climbed from 60% to 94%, and the training run that had taken six hours completed in three and a half. Nimbus wouldn't need that kind of horsepower for a long time — but Leo filed the pattern away for the day the recommendation engine grew up.

**The Other FSx Options**

AWS also offers **FSx for NetApp ONTAP** — for enterprises that already run NetApp storage on-premises and want multi-protocol access (NFS, SMB, and iSCSI from the same filesystem) — and **FSx for OpenZFS**, for workloads that need ZFS-specific features like snapshots and clones at the filesystem level. Both are specialized tools for organizations with specific existing infrastructure or requirements.

For most teams, the decision is between the four FSx variants and EFS. The question is always the same: what protocol does the workload speak, and what performance characteristics does it need?

---

> **Exam Tip — Amazon FSx**
>
> *SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + Windows workloads**. The exam signals: "Windows file server," "SMB protocol," "Active Directory integration," "lift-and-shift Windows applications." When you see any of those phrases, FSx for Windows is the answer.
> - **FSx for Lustre = HPC + ML training + parallel I/O + S3 integration**. The exam signals: "machine learning training," "high-performance computing," "HPC," "parallel file system," "I/O-intensive workloads," "GPU cluster," "integrate file system with S3." When you see those phrases, FSx for Lustre is the answer.
> - **EFS is not a substitute for either.** EFS is NFS for Linux workloads. It does not speak SMB. It is not a parallel high-performance file system. Using EFS where FSx is needed means the application doesn't work (Windows) or is I/O-bottlenecked (HPC).
> - **FSx for NetApp ONTAP and FSx for OpenZFS** appear less often, but the signals are distinctive. "Migrate existing NetApp/ONTAP storage," "multi-protocol access (NFS + SMB + iSCSI)," or "SnapMirror" → FSx for NetApp ONTAP. "ZFS," "NFS with instant snapshots/clones," or "migrate an on-premises ZFS file server" → FSx for OpenZFS.
> - Quick reference: "SMB or Windows file server" → FSx for Windows. "Machine learning training or high-performance computing" → FSx for Lustre. "NetApp/multi-protocol" → FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## The Bridge to the Cloud: AWS Storage Gateway

Nimbus's biggest prospect yet — a regional chain called Meridian Kitchen, twenty locations across three states — came with a problem that couldn't be solved with `aws s3 cp`.

Meridian had years of operational data living on on-premises file servers. Recipes, invoices, kitchen video footage, supplier contracts. Not a few gigabytes. Terabytes. And the software that generated and consumed this data — their kitchen management system, their invoicing platform, their HR tools — all of it wrote to local file shares using NFS or SMB. Rewriting those applications wasn't feasible. Moving all the data overnight wasn't feasible either.

"So how do we start getting their data into AWS," Maya asked, "without asking them to change a single application?"

"There's a service for exactly this," Priya said. "It runs in their data center as a VM, looks like a normal file server or storage device to their existing software, and quietly stores everything in AWS behind the scenes."

That service is **AWS Storage Gateway**: a hybrid storage service that connects on-premises environments to AWS storage. It presents storage to your applications using the protocols they already understand, while actually persisting data in S3, S3 Glacier, or as EBS snapshots.

There are three gateway types, each solving a different on-premises problem.

**File Gateway** presents an NFS or SMB interface to on-premises applications. Files written to the gateway are stored as objects in S3 — but the application doesn't know that. It sees a file system. Frequently accessed files are cached locally for low-latency reads; the rest live in S3. This is what Meridian needed: the kitchen management software writes to what looks like a file share, and the data ends up in S3 where Nimbus can analyze it, back it up, and search it.

"Wait — but *why* would we do it that way?" Maya asked. "Why not just point the software at S3 directly?"

Because NFS and SMB are not S3. The kitchen software doesn't speak S3's API. It opens file paths. It writes bytes to a directory. File Gateway translates that into S3 object operations without the application knowing anything changed.

**Volume Gateway** presents iSCSI block storage volumes to on-premises servers — the same interface a physical hard drive or SAN device would present. It has two modes: *stored volumes* keep the primary data on-premises with asynchronous backups to S3 as EBS snapshots (for on-premises-first workloads that also want cloud backup), and *cached volumes* keep primary data in S3 with frequently accessed data cached on-premises (for organizations ready to treat S3 as primary storage).

**Tape Gateway** presents a virtual tape library (VTL) to backup software like Veeam, Veritas, or NetBackup. The backup software writes to what looks like physical tape cartridges. Those virtual tapes are stored in S3 and can be archived to S3 Glacier. The backup software doesn't change. The physical tape robots and shelves go away.

"Meridian's backup team runs Veeam," Leo said. "They have actual physical tapes. Off-site storage, rotation schedules, the whole thing."

"Tape Gateway replaces the physical tapes," Priya said. "Same Veeam configuration. Same backup jobs. The tapes just live in S3 instead of a rack."

Tom looked up the cost of off-site tape storage. He closed that tab without comment and approved the migration plan.

---

> **Exam Tip — AWS Storage Gateway**
>
> *SAA-C03 Domain: Design High-Performing Architectures (Domain 3)*
>
> - **File Gateway = NFS/SMB → S3.** Files written by on-premises applications become S3 objects. Frequently accessed files are cached locally. Exam trigger: "on-premises application needs to store files in S3 without code changes."
> - **Volume Gateway = iSCSI block storage → S3 snapshots.** Stored mode: primary data on-premises, backed up to S3 as EBS snapshots. Cached mode: primary data in S3, frequently accessed blocks cached locally. Exam trigger: "on-premises server needs cloud-backed block storage."
> - **Tape Gateway = VTL → S3/Glacier.** Backup software writes to virtual tapes; tapes stored in S3 or archived to Glacier. Exam trigger: "replace physical tape backup infrastructure without changing backup software."
> - **Key exam pattern:** "on-premises application needs cloud storage without code changes" → Storage Gateway. "Replace tape backup" → Tape Gateway specifically.

---

## Strengths and Limitations

**EBS strengths**:

- Persistent, fast block storage for EC2
- Snapshots for point-in-time backup and recovery
- Multiple performance tiers for different workloads
- Encryption at rest supported natively — enable account-level encryption by default

**EBS limitations**:

- Attached to one instance at a time (with minor exceptions)
- In the same AZ as the EC2 instance (copying to another AZ requires a snapshot)
- You pay for provisioned storage, not just what you use
- Encrypting an existing unencrypted volume requires a snapshot-copy-restore cycle with a maintenance window

**EFS strengths**:

- Multi-instance shared filesystem — native NFS protocol
- Scales automatically, you don't provision capacity
- Accessible across AZs within a Region
- Elastic Throughput mode adjusts automatically to workload

**EFS limitations**:

- More expensive than S3 per GB
- Higher latency than EBS for random I/O
- Not available in all Regions

## Moving Data In Bulk: DataSync and the Snow Family

Storage Gateway keeps on-premises applications *continuously connected* to cloud storage. But two other migration scenarios appear constantly on the exam — and eventually in real projects:

**AWS DataSync** is for *online bulk transfer*: moving large datasets over the network between on-premises NFS/SMB file servers (or other clouds) and S3, EFS, or FSx — once, or on a schedule. It handles parallelization, integrity verification, retries, and bandwidth throttling, and it's roughly 10x faster than hand-rolled rsync-style scripts. Exam trigger: "migrate/transfer millions of files from an on-premises NFS server to Amazon EFS/S3" → DataSync. (Don't confuse it with Storage Gateway, which is for *ongoing hybrid access*, or DMS, which migrates *databases*.)

**The AWS Snow Family** is for when the network is the bottleneck. Moving 100 TB over a 100 Mbps line takes more than three months; a truck is faster. **Snowball Edge** is a ruggedized appliance AWS ships to you — load up to ~80 TB locally, ship it back, AWS imports it into S3. **Snowcone** was the small portable version (~8–14 TB) for edge locations — discontinued in late 2024, though it may still appear in older exam questions (see the reality check in Chapter 25). Exam math trigger: when the stem gives you a dataset size and a thin or unreliable link and asks for the fastest/most practical migration, compute the transfer time — if it's weeks or months, the answer is the Snow Family.

> **Exam Tip — AWS Backup**
>
> One more service that stitches this chapter together: **AWS Backup** centralizes and automates backups across EBS, EFS, RDS, DynamoDB, FSx, and Storage Gateway with a single backup plan — schedules, retention, cross-region and cross-account copies, and Backup Vault Lock for immutability. Exam trigger: "centrally manage backups across multiple AWS services/accounts" → AWS Backup, not per-service scripts.


## Summary

Tom's red pen circled the real problem: too much on one machine. Moving storage off the EC2 instance isn't just about capacity — it's about separating concerns so that each layer can be managed, scaled, and secured independently. The right storage choice depends on four questions: what needs the storage, how many things need it at once, how long does it live, and how is it accessed? Those four questions consistently lead to the right answer.

- **EBS** (Elastic Block Store) is persistent block storage for a single EC2 instance. It survives instance stops and can be snapshotted for backup. Use gp3 for general workloads, io2 for high-IOPS requirements. Instance store is temporary and fast but lost when the instance terminates.
- **EFS** (Elastic File System) is a shared network filesystem that multiple instances can mount simultaneously. EFS spans AZs within a Region; EBS is constrained to a single AZ.
- Match the storage type to the requirement: single EC2 database → EBS; shared files across servers → EFS; objects, media, backups → S3; archives → S3 Glacier.
- Encrypting an existing EBS volume requires: snapshot → encrypted copy → new volume → swap. Enable account-level encryption by default to avoid this for new volumes.
- **EBS "Delete on Termination"**: root volumes default to deleting on instance termination; data volumes default to persisting. Review both settings when designing instance lifecycle policies.

## Exam Tips

*SAA-C03 Domain 3 — Task 3.1 (storage solutions)*

- **EBS volumes live in one AZ.** They can only be attached to an instance in the
  same AZ. To use an EBS volume in a different AZ, you create a snapshot and restore
  it in the target AZ.
- **EBS snapshots are incremental and stored in S3.** First snapshot is full;
  subsequent ones only store changes. You can copy snapshots to other Regions for
  disaster recovery.
- **EFS is cross-AZ.** Multiple instances in different AZs within the same Region
  can mount the same EFS filesystem. This is a key differentiator from EBS.
- **When an exam scenario says "web application with shared content" or "multiple
  instances accessing the same files," think EFS.** When it says "database storage"
  or "persistent disk for one server," think EBS.
- **Instance store data survives a reboot but not a stop or termination.** A question
  might describe data that "disappears after the instance is stopped" — that's instance
  store in play.
- **gp3 vs. io2**: gp3 is the default for general use; io2 is for workloads that
  need guaranteed IOPS (large databases, mission-critical systems). Exam scenarios
  describing "IOPS requirements" or "consistent low-latency database performance"
  point toward io2.
- **gp2 vs. gp3:** gp2 IOPS are coupled to size (3 IOPS/GB, max 16,000 IOPS at 5,334 GB); gp3 IOPS are independent of size (3,000 base, configurable up to 80,000 since late 2025 — older material, and possibly the exam question bank, still assumes the previous 16,000 cap). Exam question pattern: a workload needs more IOPS without increasing storage — the answer is gp3 or io2, not gp2.
- **Encryption at rest for EBS**: You cannot encrypt an existing unencrypted volume
  in place — you must snapshot, copy encrypted, restore. Enable account-level encryption
  defaults to avoid creating unencrypted volumes accidentally. Encryption is AES-256
  using KMS keys.
- **Fast Snapshot Restore** eliminates the performance penalty on freshly restored
  volumes but costs money per snapshot per AZ. Exam questions about restoring volumes
  "immediately at full performance" point to FSR.
- **EFS performance modes**: General Purpose (low latency, suitable for most workloads)
  vs. Max I/O (higher throughput for highly parallelized workloads).
- **EFS throughput modes — three options:** Bursting (throughput scales with storage size, uses burst credits — good for spiky workloads), Elastic (auto-scales, pay per use — good for unpredictable workloads), Provisioned (fixed throughput regardless of storage — good for consistent high-throughput needs). The exam tests whether you know when to provision throughput vs. let it scale elastically or rely on burst credits.
- **Cross-region snapshot copy**: EBS snapshots can be copied to other Regions for
  disaster recovery. The copied snapshot is independent and does not add data transfer
  costs during restore — only during the copy operation itself.
- **Storage Gateway types:** File Gateway = NFS/SMB → S3 (files become objects). Volume Gateway = iSCSI block storage → S3 snapshots (stored: primary on-prem; cached: primary in S3). Tape Gateway = VTL → S3/Glacier (replaces physical tapes). Exam trigger: "on-premises app needs cloud storage without code changes" → Storage Gateway. "Replace tape backup" → Tape Gateway.

## Exercises

**Exercise 1 — Recall**

In your own words: what is the difference between EBS and EFS? When would you choose
one over the other?

*(Hint: Think about whether one instance or multiple instances need to access the
storage at the same time.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company runs a web application across four EC2 instances behind a load
balancer. Users can upload profile photos. Any photo must be viewable by users
immediately after upload, regardless of which instance handled it. The photos are
served to browsers over HTTP, are never modified in place, and the team wants the
MOST cost-effective, scalable solution with the least operational overhead.

Which storage solution BEST meets their requirements?

A) Attach an EBS gp3 volume to each EC2 instance and sync files between them using
   a cron job  
B) Store photos directly on the EC2 instance's instance store  
C) Use Amazon EFS, mounted on all four EC2 instances simultaneously  
D) Store photos in S3 and access them directly from the application code

**Hint 1**: The requirement is "all four instances must serve any photo." Which options
make a file immediately visible to all instances?

**Hint 2**: Instance store is ephemeral. EBS can't be mounted on multiple instances
simultaneously. That narrows it down.

**Hint 3**: Both C and D could theoretically work. Which is more appropriate for a
case where the application needs to access photos through filesystem operations vs.
HTTP requests?

**Answer**: D

**Explanation**: Storing photos in S3 and serving them via URL is the architecturally
correct choice for a web application. Uploaded photos are immediately accessible from
any server (and from any browser) through S3's URL. S3 is designed for exactly this
use case: storing user-uploaded files at scale with high availability and zero
management overhead.

Note: C (EFS) would technically work, but S3 is the preferred pattern for user-uploaded
binary files in web applications because it's cheaper, more scalable, and serves files
over HTTP directly without the application acting as a proxy.

**Why not A?** Syncing files via cron job creates race conditions and consistency
problems. Between uploads and the next sync, files would be missing on other instances.

**Why not B?** Instance store data is lost when the instance is stopped or terminated.
Photos would disappear.

**Why not C?** EFS is the right answer when the question demands filesystem semantics
(e.g., a CMS that modifies files in place). For user-uploaded photos served over the
web, S3 is simpler, cheaper, and more appropriate.

**Exam-keyword warning**: on the real exam, read the stem literally. If it says
"shared **file** storage," "file system," "NFS," or "POSIX," the keyed answer is
**EFS** — don't override the stated requirement with architectural taste. This
scenario keys to S3 because it asks for cost-effective object delivery over HTTP,
not for a file system.

*SAA-C03 Domain 3 — Task 3.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is adding a new feature: restaurant owners can upload PDF menus that are
then parsed and used to populate the Nimbus database. The PDF processing job runs
on a fleet of EC2 instances that need to: (a) read the uploaded PDF, (b) write
temporary processing files, (c) write the parsed output.

Which storage services would you use for each of these three steps, and why?

*(There is no single correct answer. Focus on matching storage type to the
characteristics of each step.)*

## Post-Credits Scene

That afternoon, Nimbus separated their storage properly. The database got its own
EBS volume with automated snapshots and encryption enabled. The menu photos moved to S3. The EC2 instance
finally had room to breathe.

Leo ran a load test. The site handled two hundred concurrent users without breaking
a sweat.

"It'll be fine from here," he said, watching the graphs plateau smoothly.

Tom looked at the bill. The EBS volume was adding $8 a month. He wrote it down.

"I keep adding things to this bill," he said. "When does it balance out?"

"When we stop having outages," Maya said. "Every outage costs more than the prevention."

Tom did not look convinced. He would be, eventually.

Three days later, a restaurant owner on the platform tried to place an order and got
an error. Maya checked the logs.

The database was there. The application was running. But twenty simultaneous users
were all trying to read the menu at once, and each one was hitting the database.

"Every page load is a database query," Leo said. "Every single one."

Priya was already Googling something.

In the next chapter: what happens when more customers arrive than the server can handle.
