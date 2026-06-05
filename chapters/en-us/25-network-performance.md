# Chapter 25: The Private Highway

Stand up for a moment. Shake out your hands.

Feel the distance between your fingertips and something on the other side of the country. Imagine sending a message that has to travel that distance, find its way through a dozen carrier handoffs, and come back before you can continue working. Now imagine doing that thousands of times per second.

That's what data transfer actually is — physical distance, physical infrastructure, physical constraints.

We're going to talk about moving data. Not between services in AWS, but between the real world and AWS — between your office and your cloud infrastructure, between continents.

---

With the database scaled and the storage costs reduced, Tom had turned to the networking bill. But Leo had a more immediate problem — moving 4 terabytes of historical order data to AWS was exposing the limits of their current connection.

---

Nimbus's infrastructure team (now four engineers) worked from a shared office in Seattle. They needed access to the AWS infrastructure they managed. Some operations required connecting to resources in the VPC.

Currently, they used a VPN on their laptops to access the bastion host in the public subnet, then SSH to resources from there.

It worked. It was slow. The VPN connection routed through the public internet: Seattle → multiple carrier hops → us-west-2. Round trips were inconsistent — 30 to 80 milliseconds depending on the hour — and throughput was capped by the office uplink and the public path.

"For day-to-day SSH, that's acceptable," Leo said. "But we're about to start moving our analytics database. 4 terabytes of historical order data. Over this connection, the migration will take weeks."

"We need a better connection," Maya said.

"A private connection," Priya added. "Not through the public internet. And what if someone tries to break in during the data transfer? 4TB of order history over the public internet — even encrypted — feels like a target."

Think of it like commuting to work. A Site-to-Site VPN is like driving on public roads: you lock your car doors (encryption), but you still share lanes with everyone else, and traffic jams slow you down unpredictably. Direct Connect is like renting a dedicated private lane on the highway — no shared traffic, consistent speed, and a higher monthly toll. Most days the public road is fine. When you're moving a truck full of valuable cargo on a tight schedule, you pay for the private lane.

Snow Family is the option that most people don't consider: chartering an actual cargo flight. It's not always available. It's not right for small loads. But for a full truck, it arrives faster than driving and doesn't depend on highway conditions at all. The physics haven't changed — you're still moving the same bits — but the mechanism is fundamentally different.

**AWS Site-to-Site VPN: The Quick Option**

**AWS Site-to-Site VPN** creates an encrypted tunnel between your on-premises network and your VPC, traversing the public internet.

Setup:

1. Create a Virtual Private Gateway (VGW) attached to your VPC
2. Create a Customer Gateway representing your on-premises router
3. Establish two VPN tunnels (for redundancy) between them

Traffic is encrypted (AES-256). It travels over the public internet, which means the latency depends on internet conditions. AWS provides two tunnels automatically for redundancy — if one tunnel has issues, traffic shifts to the other.

**When to use Site-to-Site VPN**:

- Quick setup (minutes to hours)
- Cost-effective ($0.05/hour per VPN connection)
- Bandwidth: up to 1.25 Gbps per tunnel
- Acceptable internet latency for the use case

**Accelerated Site-to-Site VPN** routes VPN traffic over AWS's global network rather than the public internet — the same optimization Global Accelerator provides, applied to VPN tunnels. Latency is lower and more consistent than standard VPN. The cost is slightly higher (Global Accelerator data transfer charges apply). For teams that want VPN's fast setup and lower cost but need better latency, Accelerated VPN is the practical middle path between standard VPN and Direct Connect.

For Nimbus's 4TB migration, internet-based VPN at 1.25 Gbps maximum would take: 4TB / 1.25 Gbps ≈ 7 hours minimum, with real-world overhead closer to 12-20 hours. Acceptable, but congestion on the public internet path makes it unpredictable.

Leo ran the math more carefully, because the theoretical calculation and the actual transfer time had never once matched in his experience.

**Theoretical**: 4 TB = 4,096 GB = 32,768 Gb. At 1 Gbps: 32,768 seconds ≈ 9.1 hours. Round to 9 hours.

**Actual**: Leo had run a test transfer the previous week — 50 GB from the Seattle office to S3. Theoretical time at their measured upstream speed (875 Mbps): 457 seconds. Actual time: 724 seconds. Overhead factor: 1.58.

Applied to the 4TB transfer at 875 Mbps upstream: 32,768 Gb / 0.875 Gbps × 1.58 overhead ≈ **59,200 seconds ≈ 16.4 hours**.

The overhead came from several sources: TCP slow-start on connection establishment, packet loss requiring retransmission (the public path from Seattle to us-west-2 averaged 0.2% packet loss — small, but multiplicative over millions of packets), HTTPS handshake overhead for each multipart upload segment, and the processing time for S3 to assemble multipart uploads.

"Sixteen hours is fine for a one-time migration," Leo said. "The real problem is if the transfer gets interrupted at hour 14."

S3 multipart upload solves the interruption problem: if the transfer fails at hour 14, only the current part needs to be re-uploaded. The previous parts are stored in S3 and the transfer can resume. But the overhead of managing multipart uploads added approximately 3% to total transfer time.

The final real-world estimate: **about 9 hours theoretical over 1 Gbps internet, about 17 hours actual** — accounting for their office's 875 Mbps measured upstream speed, packet loss overhead, and multipart upload processing.

Leo considered this for a moment. Then he looked at the Snow Family pricing page.

"What's the other option?" Tom asked.

"Wait — but *why* would we need anything more than a VPN?" Maya asked. "The 4TB migration is a one-time event."

"It's not," Priya said. "Once the data is in AWS, the team still needs to access it daily. And the VPN latency compounds."

**AWS Direct Connect: The Dedicated Line**

**AWS Direct Connect** establishes a dedicated, private network connection between your location (or your colocation facility) and AWS. Traffic never touches the public internet.

Direct Connect is a physical connection — a fiber line from your network to an AWS Direct Connect location. You work with a telecom provider to establish the physical circuit. AWS provides the port on their side.

**Benefits**:

- Consistent, predictable latency (no public internet variance)
- Speeds from 50 Mbps to 100 Gbps (with native 400 Gbps dedicated ports at select locations since 2024)
- Lower data transfer costs than internet (Direct Connect data transfer rates are cheaper than standard AWS data transfer out rates)
- More secure (private circuit, not public internet)

**Trade-offs**:

- Setup takes weeks to months (physical infrastructure provisioning)
- Significantly higher cost than VPN
- No built-in redundancy (you establish redundant circuits yourself)
- Not suitable for geographically distributed offices without multiple circuits

You might be wondering: if Direct Connect is a physical fiber cable, what happens if someone accidentally cuts it? That's the single-point-of-failure problem with a single circuit — which is why production Direct Connect setups use redundant circuits in geographically separate paths, or maintain a VPN as a backup. The cable can be cut; the business continues.

"How much does that cost per month?" Tom asked. He'd already looked it up. "A dedicated 1Gbps port is $216/month," he said. "Plus the circuit from our office, which a telecom quoted at $800/month."

"So about a thousand a month total."

For Nimbus: Direct Connect was overkill for their current size. But for enterprises with significant data transfer volumes or compliance requirements for private network connections, Direct Connect pays for itself.

**Hosted Connections: The Middle Ground**

Not every organization can commit to a 100 Gbps dedicated fiber circuit. **Direct Connect Hosted Connections** allow AWS Direct Connect Partners (approved telecoms) to provision sub-1Gbps connections that you share with other customers.

Setup is faster (days to weeks, not months) and costs less than a dedicated connection. The trade-off: shared capacity means less consistent throughput.

For Nimbus (as they grow): a hosted 500 Mbps connection through a partner would provide private connectivity at a reasonable price point.

The practical difference that matters at exam time: Hosted Connections are available in speeds from 50 Mbps to 10 Gbps (some partners offer up to 25 Gbps), provisioned by an AWS Partner. Dedicated Connections go directly to AWS and are available at 1 Gbps, 10 Gbps, and 100 Gbps (plus 400 Gbps at select locations). For speeds below 1 Gbps, a Hosted Connection is the only Direct Connect option — Dedicated Connections start at 1 Gbps minimum.

**AWS Transit Gateway: Hub-and-Spoke for VPCs**

As Nimbus grew, they'd accumulate multiple VPCs: the production VPC, the staging VPC, the analytics VPC, the security tooling VPC.

Without careful planning, connecting these VPCs requires a full mesh of VPC peering connections. For 4 VPCs: 6 peering connections. For 10 VPCs: 45 peering connections. For 20 VPCs: 190 connections. This doesn't scale.

**AWS Transit Gateway** is a network hub that connects multiple VPCs and on-premises networks. Instead of a mesh of peering connections, each VPC connects to the Transit Gateway. Transit Gateway routes traffic between them.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitive routing**: If VPC A and VPC B both connect to Transit Gateway, they can communicate — without a direct peer. Transit Gateway handles the routing. Unlike VPC peering (which is not transitive), Transit Gateway enables hub-and-spoke topology.

**Transit Gateway costs**: charged per attachment (VPC or VPN/Direct Connect connection) plus per GB of data processed. At scale, this is worth the simplicity.

For Nimbus, the triggering event for Transit Gateway was the addition of a fourth VPC. They had: production, staging, analytics, and now security tooling (a VPC for vulnerability scanning and SOC2 compliance monitoring that should not be on the same network segment as production).

Without Transit Gateway, connecting four VPCs requires six peering connections:
- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

Six peering connections, six route table entries per VPC, six security group rules to review. And VPC peering is non-transitive: if Production and Analytics are peered, and Analytics and Security are peered, Production cannot reach Security through the Analytics VPC. You need the Production ↔ Security peering explicitly.

With Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

Four attachments. One route table to manage. Transitive routing: Production can reach Security through Transit Gateway without a direct peer.

"And what if someone tries to break in through the Transit Gateway?" Priya asked. "If all four VPCs share a Transit Gateway, a compromised resource in the Staging VPC could reach Production."

Transit Gateway supports **route tables with isolation**: you can define which VPCs are allowed to communicate through the Transit Gateway and which are isolated. The security tooling VPC can reach all others (it needs to scan them). Staging cannot reach Production. Production cannot reach Analytics directly (Analytics queries data through a specific read-only endpoint).

"One Transit Gateway," Priya said, "with routing policies that express the actual access model. Versus six peering connections with no centralized way to audit what reaches what." 

**VPC Endpoints: Private Access to AWS Services**

A subtle cost and security issue: when your EC2 instance (in a private subnet) calls the S3 API, that traffic routes through the NAT Gateway (to reach the internet, where S3's public endpoint is). You pay for NAT Gateway processing.

**VPC Endpoints** allow resources in your VPC to communicate with AWS services privately, without going through the public internet — and without NAT Gateway.

Two types:

**Gateway endpoints** (free): For S3 and DynamoDB. You add a route in your route table that directs S3 or DynamoDB traffic to the endpoint instead of the NAT Gateway. Free to create; free to use.

**Interface endpoints** (priced): For other AWS services (SQS, SNS, Secrets Manager, SSM, etc.). Creates an ENI (Elastic Network Interface) in your subnet with a private IP. Traffic to the service uses this private IP. Costs ~$0.01/hour per AZ plus data processing.

Leo had already created the Gateway endpoints the previous week without updating the route tables. "I already deployed it — oh," he said, checking the configuration. "The routes weren't updated. Let me fix that."

Tom immediately created Gateway endpoints for S3 and DynamoDB after learning they were free. The NAT Gateway data processing fee dropped by 65%.

The math on why: Nimbus's Lambda functions and ECS tasks in private subnets were making constant requests to S3 (reading config files, writing log exports) and to DynamoDB (reading restaurant data, writing order records). Each request routed through the NAT Gateway, which charged $0.045 per GB of data processed.

Nimbus's monthly NAT Gateway data processing: 533 GB. Cost: $24/month. After adding S3 and DynamoDB Gateway Endpoints and updating the route tables: the S3 and DynamoDB traffic bypassed the NAT Gateway entirely. Monthly NAT Gateway processing dropped to 187 GB — the remaining traffic was API calls to other services (Secrets Manager, SES, external webhooks). Cost: $8.40/month.

Savings: $15.60/month, $187/year, for two free Gateway Endpoint configurations that took 10 minutes to set up.

"Free," Tom said, for the third time.

"Gateway endpoints are free to create and free to use," Leo confirmed. "They're not just a security improvement — routing S3 and DynamoDB traffic through a private endpoint rather than NAT Gateway removes it from the public internet entirely."

"And what if someone tries to break in through the NAT Gateway traffic?" Priya asked. "If traffic to S3 goes through NAT, it's addressable from the internet. Via Gateway Endpoint, it's private."

This is the secondary benefit of Gateway Endpoints that the cost discussion sometimes overshadows. Traffic to S3 and DynamoDB through a VPC Gateway Endpoint never leaves the AWS network, never traverses a public IP address, and is governed by the endpoint policy (a resource-based policy that can restrict which S3 buckets or DynamoDB tables the endpoint can access). A Gateway Endpoint on a bucket that stores customer data adds an extra layer: even with a misconfigured bucket policy, the endpoint policy can restrict access to traffic originating from within the specific VPC. 

**AWS Global Accelerator: Routing at the Edge**

When Nimbus served East Coast users from us-west-2 (Oregon), the latency was 80ms. Not because the server was prohibitively far, but because the public internet routing between Boston and Oregon was suboptimal, bouncing through multiple carrier networks.

**AWS Global Accelerator** uses AWS's private global backbone — a distributed network of edge locations that route traffic to your application through AWS-controlled paths rather than public internet carrier hops. Instead of public internet routing, traffic enters AWS's network at the nearest edge location and travels the optimized private path to your application.

For Nimbus, a user in Boston would:

- **Without Global Accelerator**: Route through public internet carriers → ~80ms
- **With Global Accelerator**: Hit the nearest AWS edge in Boston → travel AWS backbone → reach us-west-2 → ~60ms

Global Accelerator doesn't cache content (that's CloudFront). It optimizes the network path for dynamic requests.

Leo ran a latency comparison across several cities after enabling Global Accelerator for the Nimbus API:

| City | Before | After | Improvement |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

The improvement was most dramatic for geographically distant users — Tokyo from 180ms to 95ms, Sydney from 210ms to 118ms. For Seattle (close to the us-west-2 data centers in Oregon), the improvement was smaller — there were fewer public internet hops to optimize.

"Wait — but *why* is Tokyo getting a 47% improvement?" Maya asked. "If the data center is still in us-west-2, isn't the speed of light the actual constraint?"

"The speed of light is the floor," Leo said. "The actual constraint is public internet routing. Traffic from Tokyo to us-west-2 crosses dozens of autonomous systems — different carriers, different routers, different peering agreements. Each hop adds latency. Global Accelerator routes the traffic from the Tokyo edge location to us-west-2 over AWS's private fiber, which has shorter paths and better-tuned routing."

The theoretical minimum from Tokyo to us-west-2 (based on speed of light over fiber, approximately 15,500 km round trip): ~77ms. The 95ms with Global Accelerator is approaching that theoretical minimum. The 180ms without it reflects the inefficiency of public internet routing, not the laws of physics.

Global Accelerator provides two static **anycast IP addresses** that route to the nearest edge location. Unlike CloudFront (which uses dynamic IP addresses that change), these IPs are stable — useful for firewall allowlisting and for applications that require a fixed IP for clients to connect to.

**When to use Global Accelerator vs CloudFront**:

- CloudFront: static and cacheable content, CDN use case
- Global Accelerator: dynamic content, non-HTTP protocols (UDP, gaming, IoT), or when you need a static Anycast IP address

## Moving Data, Not Just Traffic: DataSync and Transfer Family

While the networking architecture was taking shape, Maya had three new restaurant chain onboarding projects land simultaneously. Each one had a data migration requirement — and each requirement was different.

The first chain, Pacific Table, needed to move 40 TB of NFS file shares to S3. Their current file storage was on-premises, spread across four file servers in their Seattle headquarters. Leo started writing a migration plan.

The second chain, Marisol Group, had an accounting team that uploaded invoices daily to a local SFTP server. The SFTP workflow had been running since 2015. The accounting staff knew one thing: they opened their SFTP client every morning at 9 AM, dropped their invoices, and closed it. Nobody wanted to change this. "Their accountants use WinSCP," Maya said. "That's not negotiable."

"Those are two different tools," Priya said.

"Yes," Leo said. "But both of them exist."

**AWS DataSync: rsync on Steroids, With an AWS Console**

For Pacific Table's 40 TB migration, the challenge wasn't bandwidth — the Seattle office had a solid upstream connection. The challenge was orchestration: discovering which files existed, transferring them reliably, verifying checksums, scheduling the transfer to avoid saturating the office network during business hours, and monitoring progress over what would be several days of continuous operation.

**AWS DataSync** is an agent-based data migration and replication service. You install a lightweight DataSync agent in your on-premises environment — a virtual machine that runs on VMware or as an EC2 instance. The agent connects to your file servers over NFS or SMB, discovers your shares, and synchronizes them to a destination in AWS: an S3 bucket, an EFS filesystem, or an FSx filesystem.

Think of it as rsync on steroids, with an AWS console. DataSync handles:

- **Discovery**: the agent inventories your source shares automatically
- **Scheduling**: transfers can run on a defined schedule (outside business hours) or continuously
- **Verification**: DataSync computes checksums on both ends and alerts you to any inconsistencies
- **Monitoring**: transfer progress, file counts, error reports, and bandwidth utilization are all visible in the console
- **Encryption in transit**: all data is encrypted using TLS during transfer

For Pacific Table, Leo installed the DataSync agent on a VM in their Seattle network, pointed it at the four NFS shares, and configured a transfer schedule: 8 PM to 6 AM on weekdays, continuous on weekends. After six days, all 40 TB had landed in S3. He verified the transfer with DataSync's built-in checksum report. Zero discrepancies.

"And for ongoing replication?" Maya asked. "Pacific Table will still be adding files after the migration."

"DataSync supports incremental transfers," Leo said. "After the initial sync, it only copies what's changed. We can run it nightly as a replication job."

**AWS Transfer Family: Your SFTP Workflow, Backed by S3**

For Marisol Group's accounting team, the requirement was different. Nobody was moving away from SFTP. The accountants were going to keep using WinSCP. The question was: where do those SFTP uploads land?

Currently, they landed on a local Linux server in the Marisol back office. The files were then manually moved to their accounting system. The local server required maintenance, backups, and someone with SSH access to manage it.

**AWS Transfer Family** is a fully managed SFTP, FTPS, and FTP server — backed by S3 or EFS as the storage destination. You provision a Transfer Family endpoint (it gets a hostname and, optionally, a static IP address). Your clients connect to it using their existing SFTP software. When they upload files, those files land directly in an S3 bucket.

The accounting team doesn't change anything. They still open WinSCP every morning at 9 AM. They still connect to an SFTP server with their existing credentials. They still drop their invoices in the same folder. The difference is invisible to them: on the server side, the files now go directly into S3 instead of onto a local Linux server.

"And from S3, we can trigger the rest of the workflow automatically," Priya said. "An S3 event triggers a Lambda function that processes the invoice and inserts it into the accounting system. No manual step."

"So the accountants' workflow doesn't change," Maya said, "but on our side, the whole thing is automated."

"Yes. And the SFTP server itself is fully managed — no patching, no backups, no server to maintain."

Tom had already looked up the pricing. Transfer Family charges per hour of endpoint availability plus per GB transferred. For Marisol Group's invoice volume, the monthly cost was well under $30. The cost of maintaining the local server it was replacing — hardware depreciation, engineering time for maintenance, backup management — was considerably more.

---

> **Exam Tip — DataSync and Transfer Family**
>
> *SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.1)*
>
> - **DataSync** = moving data in bulk from on-premises to AWS (NFS or SMB file shares → S3, EFS, or FSx). The exam signals: "migrate file shares," "replicate NFS data to S3," "on-premises to AWS data transfer," "ongoing replication of file data." DataSync uses an agent installed on-premises; the agent handles discovery, scheduling, and verification.
> - **Transfer Family** = ongoing file transfer using SFTP, FTPS, or FTP protocols, without changing client tools. The exam signals: "existing SFTP workflow," "partners upload files via SFTP," "SFTP server backed by S3," "lift-and-shift SFTP," "cannot change the file transfer process." Transfer Family is the answer when the requirement is SFTP compatibility, not data volume.
> - **The distinction matters**: DataSync is for bulk migration and replication (agent-based, schedule-driven, network-optimized). Transfer Family is for protocol-compatible file transfer services (endpoint-based, always-on, client-transparent). They solve different problems.
> - DataSync supports S3, EFS, and FSx as destinations. Transfer Family supports S3 and EFS as storage backends.

---

**Migrating Servers, Not Just Files: The 7 Rs and MGN**

The third chain in Maya's pipeline didn't just have files — it had whole servers: a custom reservations application running on two on-premises machines that nobody wanted to rewrite before the move. Moving *applications* is its own discipline, and AWS describes **seven ways to migrate** (the "7 Rs") that you mostly need to recognize:

- **Rehost** ("lift and shift"): move servers as they are. Fastest, least change.
- **Replatform** ("lift, tinker, and shift"): small upgrades on the way — like moving a self-managed database to RDS.
- **Repurchase**: drop the old system, buy SaaS instead.
- **Refactor**: redesign cloud-native. Most effort, most payoff.
- **Retire**: turns out nobody used it. Delete it.
- **Retain**: leave it where it is, for now.
- **Relocate**: move at the hypervisor level without changing anything.

For the rehost case, the tool is **AWS Application Migration Service (MGN)**: an agent replicates the source servers' disks, block by block, into a low-cost staging area in AWS; you launch test copies whenever you like; at cutover, MGN converts the replicated servers into native EC2 instances. Lift, shift, done — refactoring can come later, on cloud time. (Its companions for portfolio planning, Application Discovery Service and Migration Hub, closed to new customers in late 2025 — know their names as "inventory discovery" and "central migration tracking" if the exam mentions them.)

---

**AWS Snow Family: The Physical Option**

There was still the matter of the 4TB historical dataset and the 17-hour internet estimate. After calculating it, Leo had looked at the Snow Family pricing page and made the call immediately.

For migrations above a few terabytes where time matters more than simplicity, AWS ships physical storage appliances to your location. You fill them with data. You ship them back. AWS ingests the data directly into S3.

**Snowball Edge Storage Optimized**: 80 TB usable capacity, hardened enclosure. Ships to your location in 2-5 business days. You load data using the local interface (NFS, S3 interface). You ship it back. AWS ingests the data in approximately 1-3 business days after receipt.

For Nimbus's 4TB migration, the process:

1. **Order** a Snowball Edge through the AWS console (takes 2 minutes, ships in 3 days)
2. **Connect** the appliance to the Seattle office network; it presents as an NFS mount point
3. **Copy** the 4TB of historical order data using the device's S3-compatible interface: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Copy completes** in about 2 hours (local network, no internet)
5. **Ship** the appliance back to AWS (prepaid label included)
6. AWS **ingests** data to S3 within 72 hours of receipt
7. **Verify** — S3 provides a job completion report showing every transferred file and checksum

Total elapsed time: 3 days for delivery + 2 hours to copy + 1 day shipping + 2 days ingestion = approximately 7 calendar days. Versus about 17 hours continuously — which would have required a stable, uninterrupted internet connection, saturating the office uplink overnight and through most of a business day.

Cost: Snowball Edge device rental is $300 for 10 days. Shipping (two-way): approximately $80. S3 data transfer in is free. Total migration cost: **$380**.

Compare to about 17 hours of 875 Mbps sustained internet usage: VPN tunnel was free ($0.05/hour but the tunnel was already running); S3 transfer in was free. The "free" internet path had a real cost in engineering time (monitoring a 17-hour transfer), risk (any interruption requiring restart), and opportunity cost (their internet connection was saturated during the transfer window). Leo placed the order. How it played out is in this chapter's post-credits scene.

---

## Strengths and Limitations

**Site-to-Site VPN**:

- Quick setup, low cost
- Public internet path means variable latency
- Limited bandwidth ceiling (1.25 Gbps per tunnel)
- Accelerated VPN option improves latency at slightly higher cost

**Direct Connect**:

- Consistent, private, high-bandwidth
- Slow to set up, significant recurring cost
- Physical circuit is a single point of failure (add redundancy or maintain VPN backup)
- Break-even with egress cost savings at roughly 10-15 TB/month depending on pricing scenario

**AWS Snow Family**:

- For one-time migrations above 1-2 TB, often faster and cheaper than network transfer
- No internet bandwidth consumption during migration
- 10-day device rental window; prepaid shipping

**Transit Gateway**:

- Simplifies multi-VPC connectivity dramatically
- Transitive routing (unlike VPC peering)
- Isolation route tables allow segmentation without separate peering connections
- Cost adds up for many attachments

**VPC Endpoints**:

- Security and cost benefit for S3/DynamoDB (free gateway endpoints)
- Eliminates NAT Gateway costs for AWS service traffic
- Endpoint policies add an extra access control layer beyond IAM and bucket policies
- Interface endpoints for other services (Secrets Manager, SSM, SES) keep traffic private but cost ~$0.01/hour per AZ

**Global Accelerator**:

- Improves dynamic application latency for global users: 33-47% improvement in practice for distant users
- Fixed Anycast IPs (unlike CloudFront's dynamic IPs) — useful for firewall allowlisting
- Non-HTTP protocols (UDP, TCP) — CloudFront is HTTP/HTTPS only
- Additional cost ($0.025/hour per accelerator + data transfer)

## Summary

The Aurora work in chapter 24 optimized how Nimbus serves data to its own application. This chapter is about how data moves between the outside world and AWS — and how to make that movement more reliable, faster, and less expensive.

- **Site-to-Site VPN**: Encrypted tunnel over public internet between on-premises and VPC. Quick setup, lower cost, variable latency. Two tunnels for redundancy. Maximum 1.25 Gbps per tunnel.
- **Direct Connect**: Private, dedicated fiber connection to AWS. Predictable latency, higher bandwidth, weeks to set up, significant cost. Break-even with VPN's egress savings at approximately 13.5 TB/month for Nimbus's pricing scenario.
- **AWS Snow Family**: Physical storage appliances for bulk data migration. Faster than internet transfer for multi-TB migrations. $380 total for Nimbus's 4TB migration vs. about 17 hours of network saturation.
- **Transit Gateway**: Hub for VPC and on-premises connectivity. Enables transitive routing (unlike VPC peering). Supports isolation route tables to control which VPCs can reach which. Scales to hundreds of connections.
- **VPC Endpoints**: Private access to AWS services without NAT Gateway. Gateway endpoints (S3, DynamoDB) are free — add them to every VPC that accesses S3 or DynamoDB. Saved Nimbus $15.60/month and removed S3/DynamoDB traffic from NAT Gateway.
- **Global Accelerator**: Routes dynamic traffic over AWS private backbone for lower, more consistent latency globally. Static Anycast IPs. Latency improvements of 33-47% for distant users (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms). Not a CDN — doesn't cache.
- **AWS DataSync**: Agent-based service for migrating and replicating on-premises NFS/SMB file data to S3, EFS, or FSx. Handles scheduling, checksum verification, monitoring. Used for one-time migrations and ongoing replication of file shares.
- **AWS Transfer Family**: Managed SFTP, FTPS, and FTP server backed by S3 or EFS. Allows existing SFTP clients to upload files to S3 without changing their workflow.

## Exam Tips

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **VPN vs Direct Connect signals**: VPN = "encrypt traffic to VPC," "quick setup," "cost-sensitive." Direct Connect = "consistent low latency," "large data transfers," "private connection," "compliance requiring private network."
- **Transit Gateway vs VPC Peering**: Peering is non-transitive (A→B→C doesn't allow A→C). Transit Gateway is transitive. "Many VPCs needing to communicate" → Transit Gateway.
- **VPC Gateway Endpoints**: Free. S3 and DynamoDB only. Route table change. No extra cost. Exam scenario: "reduce data transfer costs for S3 access from private subnet" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = dynamic content, non-HTTP, static IP, network optimization. CloudFront = caching, HTTP content, CDN.
- **Direct Connect + VPN**: You can use a VPN as backup for a Direct Connect connection. If the Direct Connect circuit fails, traffic fails over to the VPN. More expensive than VPN alone, more reliable than Direct Connect alone.
- **Direct Connect Gateway**: Connect a Direct Connect circuit to multiple VPCs across multiple regions or accounts. Without it, a Direct Connect circuit connects to one VGW in one region.
- **AWS Snow Family**: "Large data migration," "transfer speed is too slow," "petabyte-scale migration" → Snow Family. Snowball Edge = up to 80TB. Do the transfer math first: if moving the data over the available network would take roughly a week or more, the answer is a physical device. *Reality check (2026)*: AWS has been retiring the family — Snowmobile was withdrawn in 2024, Snowcone was discontinued in late 2024, and as of November 2025 Snow devices are no longer offered to new customers (AWS now points to DataSync over fast links and to **Data Transfer Terminals**, secure locations where you bring your own drives). The SAA-C03 question bank predates all of this, so on the exam, "weeks of network transfer, limited bandwidth" still points to Snowball.
- **Transit Gateway route tables**: Transit Gateway supports multiple route tables for network segmentation. Exam signal: "isolate production VPC from staging" with shared connectivity through Transit Gateway → separate route tables.
- **Global Accelerator fixed IPs**: Unlike CloudFront, Global Accelerator provides two static Anycast IPs. Exam signal: "application needs a fixed IP address for clients to allowlist" or "UDP traffic" → Global Accelerator (CloudFront is HTTP/HTTPS only).
- **AWS DataSync signals**: "migrate NFS/SMB file shares to S3/EFS/FSx," "ongoing replication of on-premises file data," "agent-based file migration." DataSync is not for protocol-compatible SFTP transfer — it's for bulk file share migration and replication.
- **AWS Transfer Family signals**: "existing SFTP workflow," "partners or customers upload files via SFTP," "lift SFTP server to cloud without changing client tools," "SFTP/FTPS/FTP backed by S3." Transfer Family is not a data migration tool — it's a managed protocol endpoint. The distinction: DataSync moves data in bulk on a schedule; Transfer Family provides an always-on SFTP/FTP endpoint for ongoing file uploads.
- **MGN (Application Migration Service)**: "migrate hundreds of VMs quickly, no code changes," "rehost / lift-and-shift servers to EC2" → MGN (block-level replication, test launches, cutover to native EC2 instances). DataSync moves *files*; DMS moves *databases*; MGN moves *whole servers*.

## Exercises

**Exercise 1 — Recall**

Explain the difference between AWS Site-to-Site VPN and AWS Direct Connect. In what scenario would you choose each?

*(Hint: Think about setup time, cost, latency consistency, and bandwidth requirements.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A financial services company requires a private, encrypted, dedicated network connection from their on-premises data center to AWS. They transfer 500GB of sensitive financial data daily. The connection must have consistent, predictable latency and must not traverse the public internet. They also need a backup connection in case the primary fails.

Which architecture BEST meets these requirements?

A) A Site-to-Site VPN with BGP routing and a second VPN for redundancy  
B) A Direct Connect Hosted Connection with Direct Connect Gateway  
C) Two Site-to-Site VPN connections through different internet providers  
D) A Direct Connect connection with a Site-to-Site VPN as backup

**Hint 1**: "Must not traverse the public internet" — VPN traffic goes over the public internet (encrypted). Only Direct Connect is private.

**Hint 2**: "Consistent, predictable latency" — public internet VPN performance varies. Direct Connect is consistent.

**Hint 3**: "Backup connection" — what's the recommended approach when Direct Connect is the primary?

**Answer**: D

**Explanation**: Direct Connect provides a private, dedicated connection that doesn't traverse the public internet — meeting the privacy and latency requirements. A Site-to-Site VPN as backup provides redundancy: if the Direct Connect circuit fails, traffic fails over to the encrypted VPN. This is the standard HA pattern for Direct Connect.

**Why not A?** Site-to-Site VPN traffic traverses the public internet, which violates the "must not traverse the public internet" requirement.

**Why not B?** A Hosted Connection provides a Direct Connect connection but option B doesn't include a backup. Single Direct Connect without backup is a single point of failure — the physical fiber can be cut.

**Why not C?** Two VPN connections through different ISPs still traverse the public internet, even if encrypted. Doesn't meet the private network requirement.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is expanding to have regional engineering teams in Seattle, Berlin, and Singapore. Each regional team needs access to:

- The production VPC (read-only for debugging)
- The staging VPC (full access for testing)
- The analytics VPC (read-only for reporting)

Design the network connectivity. Would you use Transit Gateway? Direct Connect in each region or Site-to-Site VPN? How would you enforce the read-only access for production? (Hint: this is both a network and IAM question.)

*(There is no single correct answer. The goal is to practice multi-region, multi-team network design.)*

**Extension**: The Berlin team reports that their VPN latency to the production VPC (us-west-2) averages 160ms. At what data volume would Accelerated Site-to-Site VPN or a Direct Connect Hosted Connection become the better option? Research the current Direct Connect Hosted Connection pricing from a European AWS Partner. Would the latency improvement alone justify the cost at your estimated data volume?

## Post-Credits Scene

The data migration completed in 8 calendar days — 3 days for the Snowball Edge to arrive, 94 minutes to copy the data, 4 days for AWS to receive the device and ingest the data, then a final sync of the delta that had accumulated while the Snowball was in transit. Hands-on time for the whole thing: under four hours.

That last step mattered. The Snowball Edge copied a point-in-time snapshot of the 4TB dataset. While it was in transit, the production database had continued running — new orders were being placed, new records were being created. The delta sync over VPN was 12GB, completed in 18 minutes.

"The bulk transfer was the Snowball," Leo said. "The sync was just the net-new data from the 8 days it took."

"I already deployed it — oh," Leo said, watching the copy complete on the Snowball Edge after 94 minutes. "I should have set the bandwidth throttle on the local copy to avoid saturating the office network during business hours."

He had not set the throttle. The office internet was fine — the Snowball was a local network operation. But the network switch briefly became a bottleneck as the copy approached 9 Gbps local throughput.

"The point," he said, after fixing the throttle setting, "is that physical mail is faster than the internet above a certain data volume."

"That's either obvious or counterintuitive," Maya said, "depending on how you think about it."

"Next time," Leo said, "we should set up a Direct Connect."

Tom didn't reach for the calculator — he'd already run the math earlier, when Direct Connect first came up: about a thousand a month, port plus circuit.

"For what we do now, probably not worth it. But if we start moving more than 10TB a month between our office and AWS, the data transfer savings on Direct Connect would offset the cost."

"So we monitor the data transfer volume," Priya said, "and revisit when it crosses the threshold."

"That's cost-aware architecture," Tom said.

"That's always been the point," said Maya.

Priya had watched the migration from across the room. "Next time we do something like this," she said, "can we do it before the data is in production and the business depends on it? Migrating live data is always riskier than migrating at-rest data."

"It's never at-rest when the business is running," Leo said.

"I know," she said. "That's the point. Plan the migration before you need it. Not after."

Tom had already calculated what it would cost to have a second set of infrastructure in us-east-1 ready to receive a migration at any time. He kept the number to himself for now. There were more immediate chapters to close.

In the next chapter: what happens when you have more data than any database can reasonably store, and you need to make sense of all of it.
