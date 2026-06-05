# Chapter 4: A Computer in Someone Else's Building

The CPU graph had become background music.

Tom's laptop sat open on the corner of his desk, CloudWatch refreshing every minute, the utilization line climbing at a slope that meant something was working hard. Maya had noticed it three days ago and mentioned it to no one. She'd been watching the order queue instead.

IAM was in place. Credentials were in order. Priya had MFA on everything. The team felt, for the first time, like they were being slightly responsible. But responsible didn't solve the problem Maya was watching: the numbers on the order dashboard climbing while the CPU line climbed with them.

The Nimbus app was running on the instance Leo had launched without thinking about it — the one he "deployed somewhere" back before anyone knew what a Region was.

That was fine for showing investors a demo. It was not fine when Maya pressed "launch" and two hundred sign-ups came in the first week — forty-seven restaurants actively taking orders every day. Leo's improvised instance was now handling real orders, real menus, and real customers — a machine chosen by accident, sized by default, configured by a person who had been learning AWS as he typed.

"We need a server," Maya said. "A real one. One somebody actually chose on purpose."

Tom looked at the CPU graph. The line was visible from across the room.

That was when they started looking at what it actually means to rent a computer.

**The Abstraction Nobody Explains**

When people say their application "runs on the cloud," they usually mean it runs on a
virtual machine — a computer that doesn't physically exist as dedicated hardware,
but that behaves in every way like it does.

Here's the mechanism.

A physical server in an AWS data center has a lot of resources: CPU cores, memory, disk,
and network bandwidth. AWS takes that physical server and divides it using software
called a **hypervisor** — software that acts like a building superintendent, dividing
the physical server's resources among multiple virtual tenants. The hypervisor creates
multiple virtual machines, each appearing to have its own dedicated CPU, memory, and
disk — but actually sharing the underlying physical hardware.

Think of it like renting an apartment in a large building, rather than buying a house.

The building owner (AWS) maintains the physical structure — the plumbing, the electrical,
the security. You get a unit. You furnish it however you want. You pay monthly (or
hourly). When you need more space, you move to a larger unit. When you move out, you
stop paying.

Each of those virtual machine rentals is what AWS calls an **EC2 instance** — Elastic
Compute Cloud.

EC2 stands for Elastic Compute Cloud. The "elastic" part is important, and we'll get
to it. For now: an EC2 instance is a computer you rent by the hour. It has an operating
system, a network connection, and computing power. It runs your application just like
a physical server would.

**Choosing Your Instance: Size Matters**

Not all EC2 instances are the same. AWS offers hundreds of instance types, organized
into families based on what they're optimized for.

**General purpose** (e.g., `t3`, `m6i`): Balanced CPU and memory. Good default choice
for most web applications. The `t3` family is burstable — it accumulates CPU credits
during low-utilization periods and spends them during bursts. Great for development
environments and workloads with variable CPU demand. The `m6i` family provides
consistent, non-burstable performance — better for production workloads with sustained CPU needs.

**Compute optimized** (e.g., `c7g`): More CPU relative to memory. Good for video
encoding, scientific modeling, batch processing. The "g" suffix in `c7g` means the
instance uses AWS Graviton processors — ARM-based chips that AWS designed in-house,
offering better price-to-performance for many workloads than equivalent x86 instances.

**Memory optimized** (e.g., `r7i`): More memory relative to CPU. Good for databases,
caching, in-memory analytics. If you're running a database where performance improves
dramatically by keeping more data in RAM, the R family is the right starting point.

**Storage optimized** (e.g., `i3`): High-speed local storage. Good for data-intensive
workloads that need very fast disk I/O. The local NVMe storage on these instances is
significantly faster than EBS — but it's also ephemeral. Use it for temporary data,
not for anything you can't afford to lose.

**Accelerated computing** (e.g., `p4`): GPUs attached. Good for machine learning
training and graphics rendering. These instances are expensive — a `p3.8xlarge` runs
over $12 per hour — but for workloads that benefit from GPU parallelism, there's no
substitute.

Each family has sizes. A `t3.micro` has 2 virtual CPUs and 1 GB of memory. A
`t3.xlarge` has 4 virtual CPUs and 16 GB. A `t3.2xlarge` doubles again. The naming
pattern is consistent: the suffix goes `nano`, `micro`, `small`, `medium`, `large`,
`xlarge`, `2xlarge`, `4xlarge`, `8xlarge`, and beyond.

Leo had chosen a `t3.micro`.

"How many users can a `t3.micro` handle?" Tom asked. "And how much more does a bigger one cost?"

"Depends on the application," Leo said. "But probably not a hundred concurrent users
running image uploads and database queries."

"How much does that cost per month?" Tom asked, looking at the instance type comparison page.

Leo pulled up the AWS pricing page. The t3.micro ran about $8 per month. The t3.small was $17. The t3.medium was $33. The t3.large was around $60. The gap widened fast as you moved up — not linearly, but roughly doubling with each size step. Tom wrote the numbers down, noting that each size step doubled the memory — but, curiously, not the CPU count. Every t3 from micro through large had the same 2 vCPUs; the count didn't increase until xlarge. What grew with each step was the **CPU credit baseline** — the share of those vCPUs the instance could use continuously without burning through its burst credits.

Tom wrote "t3.micro" on the whiteboard and drew a sad face next to it.

**The Right-Sizing Conversation**

The t3.micro lasted about a month before Friday-night traffic crushed it. Leo upgraded in a hurry — straight to a t3.large, reasoning that too big was safer than down. Two weeks after the move to the t3.large, Tom flagged something.

"The CPU is at 9%," he said. "Average. Over the past seven days."

Leo looked at the CloudWatch graph. 9% average CPU. Peaks of maybe 35% during Friday dinner. The rest of the time: barely ticking.

"We're running a $60-a-month server," Tom said, "at 9% of its capacity."

"But what about the Friday peaks?" Leo said. "We need headroom."

"The Friday peaks hit 35%," Tom said. "A t3.small has the same two vCPUs — what's smaller is the credit baseline, about 20% sustained. We average 9%. That means we'd be banking CPU credits all day, every day, and spending some of them for a few hours on Friday nights. I checked the `CPUCreditBalance` math — the balance never comes close to empty. It's $17 a month. We have headroom."

Leo looked at the numbers. He looked at the graph. He felt the discomfort of an engineer who has over-provisioned and knows it.

"But what if we get a spike?" he said.

"Then the metrics will tell us before it hurts," Priya said. "And eventually we'll set up Auto Scaling — that's literally what it's for. You won't need to provision for the spike manually once the system can add instances automatically."

They downsized to a t3.small. The monthly bill dropped by $40. Over a year, that was $480 — not nothing, especially for a startup. Tom noted it in his spreadsheet with the quiet satisfaction of someone who has been waiting to make this point for two weeks.

This pattern has a name: **right-sizing**. It means matching the instance size to the actual workload, not the imagined worst case. AWS tools like AWS Compute Optimizer and CloudWatch metrics make right-sizing a data-driven decision rather than a guess.

**The AMI: Your Machine's Starting State**

Before you launch an EC2 instance, you choose its operating system and initial
configuration. In AWS, this is called an **Amazon Machine Image** (AMI).

An AMI is a template. It defines:

- The operating system (Amazon Linux, Ubuntu, Windows Server, etc.)
- Pre-installed software
- The initial disk state

When you launch an instance from an AMI, AWS creates a fresh copy of that template
just for you. You can also create your own AMIs — if you configure a server exactly
the way you want it, you can "save" that state as a custom AMI and use it to launch
identical servers quickly. This is how you deploy consistent environments at scale.

Think of an AMI as a recipe. The recipe describes the meal. Each time you follow the
recipe, you get the same meal. If you want to change the meal permanently, you update
the recipe.

AWS provides a marketplace of AMIs — some are AWS-maintained (Amazon Linux 2, Amazon
Linux 2023), some are maintained by major Linux distributions (Ubuntu, Red Hat, SUSE),
and some come from third-party vendors (pre-configured database servers, security
appliances, commercial software). For most web applications, an AWS-maintained Amazon
Linux AMI or Ubuntu LTS AMI is the right starting point.

For Nimbus, Leo built a custom AMI that started from the latest Amazon Linux 2023 base
and added the Node.js runtime, the application's system dependencies, and a pre-created
service file for the application process. New instances launched from this AMI started
serving traffic in under 90 seconds — significantly faster than the four-minute boot
time when using UserData scripts to install everything from scratch.

There's a trade-off: custom AMIs need to be maintained. Every time you update a system
dependency or the runtime version, you need to rebuild the AMI. Teams that let their
AMIs go stale find themselves running instances with outdated software — a security
risk. Priya put "rebuild AMI with latest packages" on the monthly engineering checklist.

"How much does it cost to store AMIs?" Tom asked.

AMIs are stored as EBS snapshots — you pay the EBS snapshot rate (approximately $0.05
per GB per month) for the size of the AMI. A typical Amazon Linux AMI with the Nimbus
application stack ran about 4 GB. At $0.05/GB: $0.20 per month per AMI. Keeping five
historical AMIs for rollback purposes: $1/month. Not a meaningful cost.

**UserData: The Bootstrap Script**

There is one more configuration option on EC2 that Leo discovered when he was trying to avoid building a new AMI every time the application code changed.

When you launch an EC2 instance, you can provide a **UserData script** — a shell script that runs automatically when the instance starts for the first time. It runs as root, before the instance is considered "ready."

For Nimbus, the UserData script looked something like this:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

That script installs Node.js, pulls the latest application code, installs dependencies, and starts the application service. Every new instance that launches from the base AMI runs this script and comes up with the current version of the application installed — automatically.

This approach means the AMI stays simple (just a base OS), and the UserData handles application setup. The trade-off: UserData scripts take time to run. An instance might take three to five minutes to boot and become ready. For applications where startup time matters — for Auto Scaling, where you need new instances to be ready quickly — pre-baking the application into a custom AMI reduces boot time significantly.

"It'll be fine," Leo said, when Priya asked about the boot time.

"What's the boot time?" she asked.

"Four minutes."

"And during those four minutes, the instance is running but not serving traffic?"

"Yes."

"So during a sudden traffic spike, we could have four minutes where the new instances aren't helping yet?"

Leo looked at his UserData script. He started looking at how to build a custom AMI.

**Key Pairs: The Right Way to Access a Server**

Remember the "Admin123" disaster from last chapter?

The correct way to log into an EC2 instance is with a **key pair**.

A key pair is a cryptographic pair: a public key (stored by AWS on the server) and a
private key (a file you download and keep secret). To log in, you use SSH — a secure
protocol — with your private key. There's no password. If you lose the private key,
you lose access. There's no "forgot my password" for SSH.

This matters because key pairs are:

- Unique to you
- Cryptographically impossible to guess
- Not stored by AWS (you keep the private key)
- Easy to revoke (delete the key from the server, generate a new pair)

Priya had already set up key-based access on the Nimbus server. The Admin123 server
was decommissioned. Nobody was sad about it.

"And what if someone tries to break in and intercepts a key pair in transit?" Priya asked. She had already worked out the answer: the private key never travels over the network. You download it once. You keep it locally. It never leaves your machine.

**What Happens If You Lose the Key Pair**

Leo asked this question in week three, with the specific energy of someone who has not lost their key pair yet but is thinking about it.

"If I lose the private key file, what happens?"

"You lose SSH access to the instance," Priya said.

"Permanently?"

"Not necessarily. But the recovery process is unpleasant."

The recovery process: stop the instance, detach its root EBS volume, attach it to a different instance that you *do* have access to, mount the volume, add a new public key to the `authorized_keys` file on the mounted volume, detach and reattach it to the original instance, restart.

This works. It takes thirty to sixty minutes and requires careful execution. One wrong step and you can make things worse.

The alternative, if your application stores nothing critical on the root volume (because you've been following the advice in this book and storing data in S3 and EBS): terminate the instance and launch a fresh one from the AMI. Generate a new key pair when you do.

"Store the private key somewhere secure," Priya said. "And never on an EC2 instance."

Leo looked at his desktop folder labeled `AWS_keys`. Then at Priya. Then he moved the folder to his encrypted password manager.

**Security Groups: Your Instance's Firewall**

When an EC2 instance launches, it needs a **security group** — a virtual firewall that controls which network traffic can reach it and which traffic it can send out.

A security group has two sets of rules: **inbound** (traffic coming in) and **outbound** (traffic going out).

By default, a new security group blocks all inbound traffic and allows all outbound traffic. You add inbound rules to open specific ports to specific sources.

For the Nimbus web server, Priya configured:

- Allow TCP port 443 (HTTPS) from `0.0.0.0/0` (the entire internet)
- Allow TCP port 80 (HTTP) from `0.0.0.0/0` (redirected to 443 in the application)
- Allow TCP port 22 (SSH) from the office IP address only — not from the internet

"Wait — but *why* would we restrict SSH to just the office IP?" Maya asked.

"Because if SSH is open to the entire internet," Priya said, "automated bots will hit port 22 trying credential combinations twenty-four hours a day. Our logs will fill with failed attempts. And if there's ever a vulnerability in the SSH daemon itself, every attacker in the world can try to exploit it."

"But what if Leo needs to log in from home?"

"VPN," Priya said.

Leo already had a VPN set up. He had the expression of someone who had been asked this question before.

The database still lived on the same machine as the application — but Priya prepared a separate security group for the day it wouldn't: the database port open only to traffic from the web server's security group — not from the internet, not from SSH (for direct DB access), not from anywhere else. In the meantime, she made sure the shared instance's security group didn't expose the database port to the internet at all. The database would be invisible to everything except the application that needed it.

To reach the database directly, an attacker would need to compromise the web server first. That was the first layer of defense.

"And the second layer?" Tom asked.

"IAM authentication for the database. And encryption in transit."

She added both to the setup checklist.

**EC2 Instance Metadata and IMDSv2**

There is one more piece of EC2 security that matters in practice, even if it rarely gets explained in introductory content.

When an application runs on an EC2 instance, it can query a special internal endpoint at `http://169.254.169.254/latest/meta-data/` to retrieve information about the instance: its instance ID, its Region, its availability zone, and — critically — the temporary IAM credentials associated with any attached IAM Role.

This is how the application on the EC2 instance calls AWS services without having hardcoded credentials. It asks the metadata service: "What credentials should I use right now?" The metadata service returns temporary credentials that expire and rotate automatically.

The security problem: older versions of this metadata service (IMDSv1) would respond to any request from any process on the instance. If an application had a server-side request forgery (SSRF) vulnerability — a bug where an attacker could make the server fetch a URL of the attacker's choosing — the attacker could use that vulnerability to fetch `http://169.254.169.254/latest/meta-data/iam/security-credentials/` and retrieve the instance's IAM credentials.

This attack has been used in real breaches.

**IMDSv2** (Instance Metadata Service version 2) fixes this by requiring a session token before the metadata service responds. The token is obtained through a PUT request. SSRF attacks, which typically use GET requests, can't complete the PUT step — so they can't get the token, and the metadata is not returned.

"Should we enable IMDSv2?" Leo asked.

"It's the default for new instances now," Priya said. "But for existing instances, you have to opt in."

She enabled it on all existing Nimbus instances that afternoon.

**Instance Lifecycle: Not Forever**

This is something many beginners miss.

EC2 instances are not permanent by default. When you stop an instance, the compute
resource is released. When you start it again, it might run on different physical
hardware. Any data stored *on the instance itself* (on its root volume) survives
a stop/start cycle — but the public IP address changes.

When you *terminate* an instance, it's gone. Unless you have separate storage attached
(which we cover in Chapter 6), any data on the instance disappears.

The four states an EC2 instance can be in:

**Pending**: The instance is starting up. It's been allocated hardware but hasn't
finished booting. The UserData script is running.

**Running**: The instance is active and accessible. You're paying for it.

**Stopping/Stopped**: The instance is shut down. The EBS root volume is preserved.
You're not paying for compute, but you're still paying for the attached EBS storage.

**Shutting-down/Terminated**: The instance is being deleted. Unless you've configured
EBS volumes to persist, their data is gone.

This "ephemerality" is actually a feature, not a bug. It means you can spin up
servers, use them, and throw them away. It enables horizontal scaling. But it also
means you should never store important data *on* the EC2 instance itself.

Where does data live, then?

In separate storage. We get to that in the next two chapters.

You might be wondering: if an instance gets a new IP address every time it restarts, how does your application keep a stable address? AWS has a solution called an Elastic IP — a static public IP that you own and that stays the same even after restarts. A note on cost: since February 2024, AWS charges a small hourly fee for every public IPv4 address — Elastic IPs (attached or not) and the auto-assigned public IPs on instances alike. Public IPv4 is no longer free, which is one more reason to keep instances in private subnets behind a load balancer.

For applications behind a load balancer — which is the correct architecture for any
production web application — you don't need Elastic IPs at all. Users connect to the
load balancer's stable DNS name. The load balancer connects to instances by their
private IP addresses within the VPC. Instances can come and go, get new IPs, scale
in and out — the load balancer handles all of it transparently. Elastic IPs are for
specific use cases: a server that clients connect to directly by IP, a bastion host
with a stable address, an application that isn't behind a load balancer for some
specific reason.

Leo initially planned to use Elastic IPs for the Nimbus web servers. Priya pointed
out that with a load balancer, the web servers' IP addresses were irrelevant to
external clients. The load balancer had the stable DNS name. The instances behind it
were disposable by design.

"So Elastic IPs are for the exception, not the rule," Leo said.

"Correct," Priya said. "And if you see yourself reaching for one, ask whether the
architecture should have a load balancer instead."

**What "Elastic" Means**

We said EC2 stands for Elastic Compute Cloud. What's elastic about it?

Two things:

**Vertical elasticity**: You can change the size of an instance. Stop the instance,
change it from `t3.micro` to `t3.xlarge`, restart it. More CPU and memory, same
application, same setup.

**Horizontal elasticity**: You can add more instances. Instead of one large server,
run ten medium servers behind a load balancer. When traffic drops, remove instances
and stop paying for them.

Both approaches solve the "one server, too much traffic" problem. They have different
trade-offs, which we explore in Chapter 7 when we add Auto Scaling to the story.

The key insight: with EC2, computing power is something you *dial* rather than something
you *buy*. Need more? Turn up the dial. Need less? Turn it down. Pay accordingly.

Maya looked at the instance type table. "If we can just make the server bigger, why bother with ten medium ones?"

"Because," Leo said, "one big server is still one server. If it goes down, everything goes down. Ten medium servers means one can fail and nine keep running."

"And," Priya added, "you can't make a server bigger without restarting it. Ten small ones means you can add more without touching the ones that are running."

Tom had already written "restart = downtime" in his notebook.

## Strengths and Limitations

**Why EC2 is powerful**:

- Full control. You choose the OS, the software, the configuration. It's your computer.
- Flexible sizing. Hundreds of instance types across every use case.
- No hardware to manage. AWS handles the physical layer.
- Pay-per-second billing, with a 60-second minimum, for Amazon Linux, Windows, and Ubuntu AMIs. (Some commercial Linux AMIs, such as RHEL and SUSE, still bill per hour — check the AMI's billing terms.) You stop the instance, you stop paying.
- Works with everything. EC2 is the foundation that most other AWS services are built on.
- Multiple pricing models (On-Demand, Reserved, Spot) allow significant cost optimization
  for predictable or flexible workloads — covered in detail in Chapter 27.

**Where it gets complicated**:

- You're responsible for patching and updating the operating system. (Shared Responsibility
  Model — this is the "in the cloud" part that's yours.)
- OS patching is not optional. Unpatched EC2 instances are one of the most common
  attack vectors in cloud breaches. AWS Systems Manager Patch Manager can automate
  this — but you have to configure it and monitor it.
- Managing EC2 at scale means managing instance state, AMIs, security patches, and
  lifecycle across potentially thousands of machines. That's operational overhead.
- EC2 is not the right answer for everything. For event-driven code that runs
  infrequently, Lambda (Chapter 20) is cheaper and simpler. For containerized
  workloads, ECS and EKS (Chapter 21) offer better resource efficiency.
- Unused instances still cost money. If you stop an instance, you stop paying for
  compute — but if you have storage attached, you still pay for that.

**The when-not-to-use-EC2 judgment call**: EC2 gives you maximum control — but control has an operational cost. Every EC2 instance you run is something you have to patch, monitor, and eventually replace. For applications that run infrequently (Lambda is cheaper), for applications that need to scale horizontally to dozens or hundreds of instances (containers are more efficient), or for databases and other managed workloads (RDS, ElastiCache), the fully managed services eliminate significant operational overhead at a modest cost premium. EC2 is the right choice when you need the control it provides — not by default.

Priya had a heuristic: "If we'd be happy with a managed service that does what we need, use the managed service. Use EC2 when the managed option doesn't exist or doesn't fit."

Leo initially pushed back on this. "But EC2 gives us more options."

"Options are overhead," Priya said. "We don't need every option. We need the right configuration, reliably maintained."

**EC2 Placement Groups: Controlling Where Instances Land**

EC2 gives you control over what your instance is — its size, its OS, its configuration. It also gives you limited control over *where* it lands physically, through a feature called **placement groups**.

By default, AWS spreads instances across physical hardware to maximize availability. But for certain workloads, you want to override that default — either to get instances closer together, or to guarantee they stay far apart.

Three placement group types:

**Cluster**: Packs instances close together within a single Availability Zone, typically on the same physical rack or adjacent hardware. The result is the lowest network latency and highest network throughput between instances in the group — with network throughput of 10 Gbps or higher between instances (don't confuse this with Enhanced Networking/ENA, which is a per-instance networking feature independent of placement groups). This is the choice for HPC (high-performance computing), large-scale ML training jobs, and tightly-coupled parallel workloads where instances spend a lot of time sending data to each other. The trade-off is availability: if the underlying hardware segment fails, all instances in the cluster can be affected simultaneously.

**Partition**: Divides instances across logical partitions, where each partition sits on its own set of hardware — separate racks, separate power, separate network switches. Instances within a partition share hardware with each other, but partitions never share hardware with other partitions. This design limits the blast radius of a hardware failure: a rack going down affects one partition but not the others. Partition placement groups are built for large distributed and replicated workloads — Apache Hadoop, Apache Cassandra, Apache Kafka — where you want enough fault isolation that a rack-level failure doesn't take down your entire cluster.

**Spread**: Places each instance on completely separate underlying hardware. Maximum isolation between instances. If you have five critical application instances that must never share a physical host (because a single hardware failure should never take down more than one), Spread is the answer. The limit: **7 instances per Availability Zone per placement group**. Spread is designed for small numbers of critical instances that cannot tolerate co-location, not for large fleets.

"So Cluster is for speed, Spread is for isolation, and Partition is for distributed systems that need both some clustering and some isolation?" Maya asked.

"Close enough," Priya said. "Cluster: low latency between instances, one big risk. Spread: maximum isolation, hard limit of seven per AZ. Partition: structured isolation for big distributed systems — you control which partition each instance goes into."

For Nimbus's current architecture, none of these applied yet. But knowing they existed meant knowing when to reach for them — and more immediately, knowing what an exam question about "HPC workloads that need low inter-node latency" was actually asking for.

## Summary

An instance launched by accident was never going to be a production server. Understanding EC2 properly didn't just solve the capacity problem — it introduced a new set of concepts that would come up in nearly every subsequent chapter. Instance types, AMIs, key pairs, security groups, and right-sizing aren't EC2 trivia; they're the vocabulary the rest of the book is built on. Learn them here and everything else makes more sense.

- An **EC2 instance** is a virtual machine you rent in AWS. Instance types are organized by use case: general purpose, compute optimized, memory optimized, storage optimized. Pick the right family and right-size to actual workload metrics — not the imagined worst case.
- An **AMI** (Amazon Machine Image) is the template for your instance's OS and initial configuration. Custom AMIs enable consistent, repeatable deployments.
- **Key pairs** are the secure way to access EC2 instances. **Security groups** are your instance's firewall — restrict SSH to known IPs and lock database ports to the application's security group only.
- **IMDSv2** should be enabled on all instances to protect against SSRF-based credential theft from the instance metadata service.
- EC2 instances are not permanent by default. Terminated instances lose their local data — store important data in S3 or EBS, not on the instance disk.

## Exam Tips

*SAA-C03 Domain 3 — Task 3.2 (high-performing compute solutions)*

- **Shared Responsibility for EC2**: You are responsible for patching the OS.
  AWS maintains the physical hardware and hypervisor. This is a frequently tested
  distinction.
- **Instance families matter for scenario questions.** If a scenario mentions high
  memory requirements (in-memory cache, SAP HANA), the answer likely involves a
  memory-optimized instance. If it mentions batch processing or HPC, compute-optimized.
- **Stopping ≠ Terminating.** Stopping an instance preserves it (you can restart).
  Terminating deletes it. Exam scenarios test whether you know this distinction.
- **Public IP changes on restart.** If your application needs a stable IP address,
  use an **Elastic IP** — a static public IP that stays associated with your account.
  Since February 2024, AWS bills every public IPv4 address hourly — Elastic IPs
  (attached or not) and auto-assigned public IPs alike.
- **On-Demand, Reserved, and Spot** pricing models are tested heavily in Domain 4.
  We cover them in Chapter 27. For now, know that On-Demand means pay by the second
  with no commitment.
- **Security groups are stateful.** If you allow inbound traffic on a port, the
  return traffic is automatically allowed without an explicit outbound rule. NACLs
  (covered in Chapter 15) are stateless — they require both inbound and outbound rules.
- **Placement Groups:** Cluster = lowest latency between instances (HPC, ML training — but single-point-of-failure risk for the group); Partition = distributed systems (Hadoop, Kafka, Cassandra) with failure isolation per partition; Spread = maximum instance isolation, max 7 per AZ. Exam question pattern: "tightly-coupled HPC workload needs maximum network throughput between nodes" → Cluster placement group.

## Exercises

**Exercise 1 — Recall**

In your own words: what is an EC2 instance? What is an AMI? What is the relationship
between them?

*(Hint: Think about the recipe analogy — what's the recipe, and what's the meal?)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company is deploying a high-traffic web application. The application
handles product catalog searches with complex filtering logic that is CPU-intensive.
The team expects significant traffic spikes during sale events. They want to ensure
they choose the right EC2 instance type and are prepared for traffic surges.

Which combination of choices BEST meets their requirements?

A) Memory-optimized instances with a fixed number to ensure consistent performance  
B) Compute-optimized instances with Auto Scaling to handle traffic spikes  
C) General-purpose instances with a single large instance size  
D) Storage-optimized instances because the product catalog requires fast disk access

**Hint 1**: The workload is described as "CPU-intensive." Which instance family is
optimized for CPU?

**Hint 2**: The scenario mentions "traffic spikes during sale events." A fixed number
of instances won't efficiently handle variable traffic. What AWS feature handles this?

**Hint 3**: Compute-optimized instances handle CPU-heavy work. Auto Scaling adds
and removes instances based on demand. Together they answer both requirements.

**Answer**: B

**Explanation**: Compute-optimized instances (like the `c` family) provide more CPU
per dollar for CPU-intensive workloads. Auto Scaling automatically adjusts the number
of instances based on load — adding instances during sale events, removing them when
traffic returns to normal. This combination optimizes both performance and cost.

**Why not A?** Memory-optimized instances are designed for workloads that need large
amounts of RAM (databases, in-memory caches). This is a CPU-bound workload. And fixed
instance counts means either over-provisioning (waste) or under-provisioning (failure).

**Why not C?** General-purpose instances trade some CPU efficiency for balance. For
a known CPU-intensive workload, compute-optimized is more appropriate. And a single
large instance is a single point of failure.

**Why not D?** The bottleneck is CPU, not disk I/O. Storage-optimized instances
are designed for workloads that need very high throughput to local storage.

*SAA-C03 Domain 3 — Task 3.2*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus currently runs a single `t3.micro` EC2 instance for the entire application.
The team needs to decide: upgrade to a larger instance (`t3.2xlarge`) or add more
`t3.micro` instances behind a load balancer?

Walk through the trade-offs. What are the advantages of each approach? What
questions would you ask to decide? (Hint: think about single points of failure,
cost, deployment complexity, and what happens during maintenance.)

*(There is no single correct answer. This is about reasoning through vertical vs.
horizontal scaling.)*

## Post-Credits Scene

Leo spent the afternoon executing the downsize. He moved from the `t3.large` down to a `t3.small`,
using the right-sizing data Tom had gathered from CloudWatch. The CPU settled at around
12% during normal load. Pages loaded in under a second.

Tom watched the AWS bill update in real time. The t3.small still cost roughly twice as much per hour as the original micro — but a third of the t3.large they'd been over-paying for. He made a note: *$40/month saved vs. previous t3.large. Right decision.*

Maya was looking at something else on her screen.

"Leo," she said. "While you were resizing the instance, the website was down for
twelve minutes."

Leo looked up.

"We had a queue of two hundred unfulfilled orders."

He looked at the screen. Then at the ceiling. Then back at the screen.

"We need something for our images," he said, changing the subject slightly. "Right now,
uploaded menu photos are saved directly on the server. If we resize or restart the
instance, do we lose them?"

Priya already knew the answer.

In the next chapter: where files live when there is no hard drive to point to.
