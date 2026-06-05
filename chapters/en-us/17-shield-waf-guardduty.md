# Chapter 17: The Watchers

The incident with the Romanian IP had been contained. Secrets were in Secrets Manager. Credentials were rotated. Network controls were tightened.

But Priya had asked the question that ended Chapter 16: "If something unusual appeared in CloudTrail, how would we know?"

The honest answer was: they probably wouldn't.

---

*Everything that could be locked had been locked. Secrets were in Secrets Manager. Encryption keys were in KMS. Network traffic was controlled by security groups and NACLs. The perimeter defenses were solid. But perimeter defenses assume you know what an attack looks like before it arrives. The question Priya was asking was different: what about the attacks you don't see coming?*

---

CloudTrail logs thousands of events per day. No human reads all of them. Priya checked manually every week, but that meant something could happen on a Tuesday and not be noticed until the following Monday.

"We need something that watches the logs for us," she said.

Maya looked up. "Automatically?"

"Automatically."

"And what if someone tries to break in?" Priya continued. "Not just a compromised credential — what if someone launches a DDoS? What if they start probing our API endpoints for injection vulnerabilities? What if they're already inside and we don't know it?"

"Those are three different problems," Leo said.

"Yes," Priya said. "And AWS has three different services to address them."

**Three Threat Categories**

Security threats against a cloud application generally fall into three categories:

**Volume attacks (DDoS)**: An attacker sends so much traffic that your application can't respond to legitimate users. The attack might be millions of HTTP requests, or a flood of TCP SYN packets designed to exhaust your server's connection table.

**Application attacks (Exploits)**: An attacker sends specifically crafted requests designed to exploit weaknesses in your application — SQL injection, cross-site scripting, malformed input that crashes a parser.

**Behavioral anomalies (Reconnaissance and compromise)**: API calls that shouldn't be happening (someone querying your entire user database at 3 AM), unusual IAM activity (credentials being used from a new country), or network traffic to unexpected destinations.

AWS has a dedicated service for each:

- **AWS Shield**: DDoS protection
- **AWS WAF**: Application-layer protection
- **Amazon GuardDuty**: Behavioral threat detection

**AWS Shield: The DDoS Absorber**

**AWS Shield Standard** is enabled automatically for all AWS customers at no additional charge. It protects against the most common layer 3 (network) and layer 4 (transport) DDoS attacks — SYN floods, UDP floods, DNS amplification attacks.

CloudFront, Route 53, and Elastic Load Balancing sit at the edge of AWS's network. When a DDoS attack targets your application, it hits these managed services first. AWS's network infrastructure absorbs the attack before it reaches your EC2 instances.

**AWS Shield Advanced** is the premium tier ($3,000/month per organization, with a one-year commitment). It is a separate subscription — it is *not* included in any AWS Support plan. It adds:

- Protection for EC2, ELB, CloudFront, Global Accelerator, and Route 53
- Near-real-time attack notifications
- Access to the AWS Shield Response Team (SRT) — security engineers who can help you respond to attacks (engaging the SRT additionally requires a Business or Enterprise Support plan)
- Cost protection: if an attack causes your bill to spike, AWS credits the surge costs
- Enhanced DDoS detection and mitigation at layer 7 (application layer)

"How much does that cost per month?" Tom asked.

"Three thousand dollars," Priya said. "Per organization."

Tom was silent for a moment.

"For enterprises handling millions in revenue, a DDoS that takes them down for two hours costs more than three thousand dollars," Priya said.

Tom did the math silently.

"We'll start with Standard," he said finally.

---

**The DDoS Incident: What Shield Looks Like in Action**

Eight months after launch, Nimbus got its first real DDoS attack.

It started at 11:43 AM on a Tuesday. The CloudWatch dashboard for the load balancer showed incoming connection requests spiking from the normal 3,000 per minute to 180,000 per minute in under ninety seconds. The source IPs were distributed across forty countries, and the inbound volume peaked around fifty gigabits per second. The pattern was unmistakable: a botnet launching a SYN flood.

Leo saw the CloudFront metrics first. "Request rate is up sixty times. Response time is spiking."

Priya pulled up the CloudWatch metrics side by side: connection attempts at the edge climbing vertically, requests actually reaching the origin — flat. "Shield Standard is eating it," she said. There was no alert, no dashboard event, no notification. Shield Standard works silently: it's always on, it's free, and it gives you **no attack visibility** — no event console, no notifications, no DDoS response team. (That visibility — near-real-time attack dashboards and alerts — is precisely what Shield *Advanced* sells.) The only way Priya could see the attack at all was through her own CloudWatch metrics.

Shield Standard had automatically detected the SYN flood and engaged mitigation within the first two minutes. The attack traffic was being absorbed at CloudFront's edge nodes globally — the same 750+ points of presence that served legitimate content also absorbed the attack volume.

By 11:52 AM — nine minutes after the attack started — Shield's mitigation had brought the request rate at the origin back to normal. The attack was still running at the network level, but the mitigation was handling it. The Nimbus application continued serving users throughout.

"The users didn't notice?" Leo asked, looking at the error rate metric.

"Error rate went up about two percent for about four minutes," Priya said. "Some users got a slightly slower response. No outages. The application stayed up."

"Because Shield absorbed the flood at the edge."

"Before it reached our load balancer. The fifty gigabit SYN flood hit CloudFront. By the time the traffic pattern was recognized and mitigated, our origin had only seen the normal request volume."

The attack lasted forty-seven minutes. By 12:30 PM the edge metrics had returned to baseline — the only "resolved" signal Shield Standard gives you.

"And this is Shield Standard," Tom said. "The free version."

"Layer 3 and 4 attacks. Standard protects against those automatically. If the attack had been more sophisticated — a layer 7 HTTP flood, for example, where every request looked legitimate — Standard would not have been sufficient. That requires Shield Advanced plus WAF."

Tom wrote down "Monitor for layer 7 DDoS patterns" in his security roadmap.

---

**AWS WAF: The Application Filter**

**AWS WAF (Web Application Firewall)** operates at the HTTP level — it inspects the content of web requests before they reach your application.

WAF is configured with **Web ACLs (Access Control Lists)** — rule sets that define what to allow, block, or count.

WAF can be attached to:

- CloudFront distributions (inspect requests at the edge, globally)
- Application Load Balancers (inspect requests at the regional level)
- API Gateway
- AWS AppSync

**WAF Managed Rules**: AWS and third-party vendors publish pre-built rule sets:

- **AWS Managed Rules - Core Rule Set**: Together with companion rule groups (SQL database, Known Bad Inputs), covers the OWASP Top 10 vulnerabilities (SQL injection, XSS, command injection, path traversal, etc.)
- **AWS Managed Rules - Known Bad Inputs**: Blocks requests matching known attack patterns
- **AWS Managed Rules - Amazon IP Reputation List**: Blocks IPs known to be associated with botnets and scanners
- **AWS Managed Rules - Bot Control**: Identifies and manages bot traffic

You can also create custom rules:

- "Block any request with a User-Agent header containing 'sqlmap'" (a common SQL injection scanner)
- "Rate limit: allow no more than 1000 requests per IP per 5 minutes"
- "Block requests that contain `<script>` in any parameter value"

For Nimbus, the practical setup: WAF on the CloudFront distribution with the Core Rule Set enabled. This blocks the most common attack patterns before requests ever reach the EC2 instances.

You might be wondering: if WAF blocks known attack patterns, what happens when a new attack pattern appears that WAF doesn't know about? WAF managed rule sets are updated by AWS and third-party vendors as new threats emerge — you don't have to update rules manually. But you're right that WAF is fundamentally reactive to known patterns. New, novel attack techniques won't be blocked by a rule that doesn't exist yet. This is why GuardDuty exists alongside WAF: WAF filters the front door, GuardDuty watches for unusual behavior inside the house. A new attack type might get through WAF, but GuardDuty can still flag the anomalous activity it causes — unusual API calls, unexpected network destinations, access patterns that don't match the baseline.

**Have we thought about what happens if WAF causes false positives?** Priya asked. "A legitimate user's request that gets blocked by the Core Rule Set?"

"WAF has a 'Count' mode," Leo said. "Instead of blocking, it just counts matching requests. You run it in Count mode first, review what it would have blocked, verify there are no false positives, then switch to Block."

"Good," Priya said. "We start in Count mode."

---

**Creating a WAF Rule: The Rate Limit Story**

Two weeks after enabling WAF in Count mode, Priya reviewed the logs. The Core Rule Set findings were clean — no false positives on legitimate traffic, a handful of blocked SQL injection attempts from automated scanners.

But she noticed a pattern the Core Rule Set was not flagging: one IP address had made 847 requests to `/api/search` in five minutes. Every request was structurally valid. But 847 searches in five minutes was not a human.

"Price scraper," she said. "Someone is automatically querying our restaurant search to build a competitive price database."

"Do we care?" Leo asked.

"It uses our compute resources and it is against our terms of service," Tom said.

"We care," Priya confirmed.

She created a custom WAF rate-based rule:

```
Rule name: RateLimitSearchAPI
Rule type: Rate-based rule
Rate limit: 100 requests per IP address
Evaluation window: 5 minutes (configurable: 1, 2, 5, or 10 minutes)
Scope-down statement: URI path starts with /api/search
Action: Block
```

The scope-down statement is important — the rate limit applies only to `/api/search`. Legitimate API traffic to other endpoints is unaffected. And note how the blocking works: there is no fixed "punishment" period — WAF re-evaluates each IP's request rate continuously, blocks it while the rate stays above the limit, and unblocks it (typically within seconds) once the rate drops back under.

She set it to Count mode first. Ran it for 24 hours. The only IP that tripped the rule was the scraper. No legitimate user had ever sent more than 12 requests to the search endpoint in five minutes.

She switched to Block mode. The scraper's next request received a 403. It switched to a different IP. The rate limit caught that one too.

"They will get around it eventually," Leo said. "Distribute across more IPs."

"At which point they are using more infrastructure, paying more, and getting less data," Priya said. "We do not need to stop them completely. We need to make it expensive enough not to be worth it."

"How much does that cost per month?" Tom asked.

WAF pricing is per Web ACL per month, per rule per month, and per million requests. For the Nimbus setup — one Web ACL, five rules on CloudFront — approximately $15 per month plus request charges.

Tom approved it immediately.

---

**Amazon GuardDuty: The Behavioral Analyst**

"Wait — but *why* would we do it that way?" Maya asked. "If WAF is blocking attacks and Shield is absorbing floods, why do we need a third service? What's GuardDuty actually watching for?"

WAF and Shield are filters — they intercept bad traffic before it reaches your application. GuardDuty watches what happens after traffic arrives. It looks at what your infrastructure is doing: which IAM credentials are being used, which domains your instances are contacting, what API calls are happening at 3 AM. An attacker who gets through the front door via a legitimate-looking request won't be stopped by WAF — but GuardDuty will notice that the same credential is suddenly making API calls from Romania.

GuardDuty is fundamentally different from Shield and WAF. It doesn't block attacks — it **detects unusual behavior**.

GuardDuty continuously analyzes several streams of activity to detect threats: **CloudTrail management and data events** (API calls and actions), **VPC Flow Logs** (network traffic patterns), and **DNS query logs** (domain lookups). These are the three foundational sources that GuardDuty has always relied on:

- **AWS CloudTrail logs**: IAM changes, API calls, console logins
- **VPC Flow Logs**: network traffic patterns within your VPC
- **DNS query logs**: what your instances are resolving (known malware often resolves specific C2 domains)

But GuardDuty has expanded significantly beyond these three. AWS calls the optional add-ons **protection plans** — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring, and Malware Protection — each enabled individually. Depending on which you enable, GuardDuty can also analyze **S3 data events** (unusual access patterns to your buckets), **EKS audit logs and runtime activity** (malicious behavior inside running containers), **RDS login events** (anomalous database login attempts), **Lambda network traffic** (functions calling unexpected external destinations), **ECS/EC2 runtime behavior**, and **EBS volumes scanned for malware**. For the exam, know the three core sources by heart; the protection plans appear in scenarios about specific threat detection contexts — "detect anomalous login attempts to RDS" or "identify malicious behavior inside a running container" are signals to think about GuardDuty's optional protection plans.

Machine learning models identify patterns that deviate from your baseline. GuardDuty generates **findings** — categorized alerts — when it detects anomalies.

Examples of what GuardDuty can detect:

- An IAM user logging in from an unrecognized IP address (in a country they've never used before)
- API calls being made from a Tor exit node
- An EC2 instance communicating with a known cryptocurrency mining pool
- Unusually high API call volume (credential abuse or scanning)
- An S3 bucket being accessed by an IP address that has been flagged for malicious activity
- Outbound traffic to a domain known to be associated with malware command-and-control

"This is what would have caught the Romanian IP," Leo said quietly.

"If we'd had GuardDuty enabled, it would have flagged the EC2 instance making outbound connections to an unrecognized external IP at 2 AM," Priya confirmed.

---

**Five GuardDuty Finding Types and What To Do**

Priya created a runbook for the five most common GuardDuty findings. When a finding fires, the team knows immediately what it means and what to do.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

An IAM user successfully logged into the AWS Console from an IP address that has not been seen for this account before, or from a geographic location inconsistent with prior logins.

Response: Verify with the user that they initiated the login. If they did not — or cannot be reached — immediately: disable the user's access key and console password, revoke active sessions, and begin a CloudTrail audit of everything that user has done in the past 24 hours. This finding often precedes credential abuse.

**2. CryptoCurrency:EC2/BitcoinTool.B**

An EC2 instance is querying IP addresses or domain names associated with cryptocurrency mining pools. This is almost always the result of an EC2 instance being compromised and used as a mining bot.

Response: Isolate the instance immediately — modify its security group to block all inbound and outbound traffic except for your bastion host. Take a forensic snapshot of the EBS volume. Then terminate the instance and launch a replacement from a clean AMI.

**3. Recon:EC2/PortProbeUnprotectedPort**

An EC2 instance has a port open to the internet that is being probed by known scanners or from a Tor exit node. GuardDuty flags ports that appear in the flow logs as accessible from external sources.

Response: Review the security group rules. If the port is intentionally open, mark the finding as resolved with a note. If it is not intentional, close the port immediately. Check CloudTrail for any access that may have occurred through that port.

**4. Trojan:EC2/BlackholeTraffic**

An EC2 instance is attempting to communicate with an IP address that has been identified as a "black hole" — a destination associated with malware command-and-control infrastructure. Traffic to these IPs suggests the instance has been infected and is attempting to call home.

Response: Same as CryptoCurrency findings — isolate, snapshot, replace. This finding indicates active malware on the instance. Do not attempt to clean the instance in place; build a new one from a clean AMI.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Someone has disabled the Block Public Access setting on an S3 bucket. This does not mean the bucket is public — it means the safety mechanism that prevents accidental public exposure has been turned off for that bucket. This is often done accidentally or as part of a misconfigured deployment.

Response: Investigate who made the change (CloudTrail will have the API call). Re-enable Block Public Access unless there is a documented reason it should be disabled. Consider enabling the account-level Block Public Access setting to prevent this finding from occurring in the future.

"The most important thing about GuardDuty findings," Priya said, "is that they are not alerts — they are hypotheses. Each finding says 'this pattern looks anomalous.' You verify, you investigate, you respond. Some will be false positives. Most will not."

"How do we prioritize?" Rafael asked.

"GuardDuty assigns severity levels: Low, Medium, High. High severity findings require same-day response. Trojan and credential compromise findings are always High. Port probe findings might be Medium or Low. Start with High, work down."

---

"How much does it cost?" Tom asked.

GuardDuty pricing is based on the volume of logs analyzed — CloudTrail events, VPC flow data, DNS queries. For a small to medium application, typically $50-150/month. At scale, it's still a small fraction of infrastructure costs.

Tom pulled up the console and enabled it.

"It'll be fine," Leo said. "It's just monitoring. It's not like it's going to break anything."

"I already deployed it," Leo added — and then checked the GuardDuty dashboard. "Oh. Sample findings only. The real ones take a while."

"GuardDuty needs time to build a baseline of what normal looks like," Priya said. "Give it a couple of days. The first real finding will arrive — they always do."

She turned out to be right about that. But the first finding is a story for the end of this chapter.

**Connecting the Three Services**

Shield, WAF, and GuardDuty work at different layers and complement each other:

| Service    | Layer                     | Protects Against                            | Action                             |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Network/Transport (L3/L4) | DDoS floods                                 | Absorbs/mitigates attacks          |
| AWS WAF    | Application (L7)          | OWASP Top 10, bots, scrapers                | Allows, blocks, or counts requests |
| GuardDuty  | Behavioral (all logs)     | Anomalies, compromised credentials, malware | Detects and alerts                 |

Shield stops the flood. WAF filters the water. GuardDuty watches the plumbing for unusual flow patterns. Macie audits what's stored in the reservoirs. Security Hub is the control room where all the dashboards are visible at once.

The failure mode of each explains why you need all of them:

- A 50 Gbps SYN flood is not a web request. WAF cannot inspect it. GuardDuty might notice the associated CloudTrail events. Shield stops it.
- A single SQL injection request is not a flood. Shield ignores it. GuardDuty does not know the content of HTTP requests. WAF catches it.
- A legitimate AWS user using their own credentials to exfiltrate data slowly — no DDoS, no injection, valid HTTP — Shield and WAF see nothing unusual. GuardDuty notices the credentials are being used from a new country at 3 AM.
- A developer who accidentally uploads customer data to a public-accessible bucket generates no anomalous behavior at all. GuardDuty has nothing to flag. Macie scans the bucket and finds the PII.

Each service has a blind spot. The combination covers those blind spots.

**CloudTrail: The Foundation**

All three services rely on logs. **AWS CloudTrail** is the logging service that captures every API call in your AWS account — who called what, when, from where, with what result.

CloudTrail is enabled by default for a 90-day history in the console. To retain logs long-term:

1. Create a trail that writes to an S3 bucket
2. Optionally, send to CloudWatch Logs for real-time alerting
3. Enable log file validation (to detect if logs are tampered with)

GuardDuty, AWS Config, Security Hub, and IAM Access Analyzer all read from CloudTrail. Without CloudTrail logs, these services have nothing to analyze.

"What if someone tries to disable CloudTrail?" Priya asked. "If an attacker gains administrator access, their first action might be to disable logging — cover their tracks."

"That's what the SCP from Chapter 14 prevents," Leo said. "No one in this account can disable CloudTrail, even administrators."

"And if they somehow did?"

"Security Hub would generate a finding. CloudTrail sends a notification to SNS on configuration changes. We get an alert within two minutes of any CloudTrail modification."

"And GuardDuty would flag the API call," Rafael added, "as an unusual IAM action — disabling logging is not a normal operational activity."

Multiple layers of detection for one of the most critical security actions: tampering with logs. This was not an accident. Priya had designed it deliberately.

"Defense in depth applies to the monitoring layer too," she said. "Not just the application layer."

**Amazon Macie: Sensitive Data in S3**

"Have we thought about what happens if someone accidentally uploads a file with customer credit card numbers to S3?" Priya asked. "Not maliciously — just a developer exporting data for debugging and uploading the wrong file?"

"We'd never know," Leo said.

"Exactly. Unless we have Macie."

**Amazon Macie** is a data security service that uses machine learning to automatically discover and protect sensitive data in S3. It continuously scans S3 buckets and identifies:

- PII (Personally Identifiable Information): names, email addresses, phone numbers, dates of birth
- Financial data: credit card numbers, bank account numbers
- Credentials: passwords, access keys, private keys embedded in files
- Health information: patient records, diagnoses

Macie generates findings when it detects sensitive data in places it shouldn't be — or when S3 buckets have overly permissive access configurations.

"Is this the same as GuardDuty?" Maya asked.

"Different purpose," Priya said. "GuardDuty watches behavior — what actions are being taken, whether those actions look anomalous. Macie watches data — what content is stored, whether that content is sensitive. GuardDuty would flag an EC2 instance making unusual API calls. Macie would flag an S3 bucket containing credit card numbers."

"So GuardDuty is the behavioral analyst," Leo said, "and Macie is the data auditor."

"Exactly. You need both. An attacker who exfiltrates data through a legitimate-looking API call might get flagged by GuardDuty for the unusual API pattern. But if an employee uploads a file with 10,000 customer records to a development bucket, there is no anomalous behavior to detect — just sensitive data in the wrong place. Macie catches that."

For Nimbus, Macie's most immediate value was on the `nimbus-debug-exports` bucket — a bucket developers used to dump data for debugging. Macie found three files containing order histories with customer names and delivery addresses. Not payment data, but personal data that should not have been in an unencrypted development bucket.

The files were removed. A policy was added: the debug bucket was restricted to synthetic test data only. Real customer data required Priya's approval to export to any environment outside production.

"How much does that cost per month?" Tom asked.

Macie charges based on the number of S3 buckets evaluated per month and the volume of data scanned. For a startup with a moderate number of buckets, approximately $10-50 per month. Free for the first 30 days.

Tom enabled it before lunch.

---

**AWS Security Hub: The Dashboard**

If you're running multiple AWS accounts or need a consolidated view of security findings, **AWS Security Hub** aggregates findings from GuardDuty, Inspector (vulnerability assessment), Macie (data privacy), Config, and Firewall Manager into a single dashboard.

It also checks your configuration against security best practices (the AWS Foundational Security Best Practices standard) and the CIS AWS Foundations Benchmark.

Security Hub is the answer to "how do I see all my security findings in one place without switching between five different consoles?" When GuardDuty generates a finding, it appears in GuardDuty and in Security Hub. When Macie finds sensitive data in an S3 bucket, it appears in Macie and in Security Hub. When a Config rule detects a misconfiguration, it appears in Config and in Security Hub.

For a single-account team, Security Hub adds marginal value — it's another console to check. Its power emerges at scale: three accounts, ten accounts, fifty accounts. All findings from all accounts aggregate into a management account's Security Hub. One team monitors one dashboard. One set of alerts. No account-by-account log checking.

For Nimbus: Security Hub wasn't needed yet. When they grew to three accounts (dev, staging, production), it would become essential.

"Set it up now," Soo-Jin said, on her third week. "It takes fifteen minutes to enable. It takes three months to wish you had done it earlier."

They enabled it.

**Amazon Inspector: Vulnerability Assessment**

A week after enabling Macie, a CVE was published for the version of OpenSSL running across the Nimbus production fleet. Priya read the advisory over coffee.

"We need to know which of our instances are affected," she said.

"I can run a manual scan," Leo said.

"For nine instances, sure. For ninety? For containers?" Priya opened the Inspector console. "This is what Inspector is for."

**Amazon Inspector** is an automated vulnerability assessment service. Where GuardDuty watches behavior — what your infrastructure is doing right now — Inspector looks at what's present that could be exploited.

- **EC2 instances:** Inspector scans the operating system and installed packages against the NVD (National Vulnerability Database) — the authoritative catalog of known CVEs. If you're running OpenSSL 1.1.1 and a CVE targets that version, Inspector flags it.
- **ECR container images:** Inspector scans container images in Elastic Container Registry before they're deployed. A vulnerable package in a base image shows up as a finding before the container ever runs in production.
- **Lambda function packages:** Inspector analyzes the dependencies bundled into your Lambda functions — Python packages, Node modules, Java dependencies — for known vulnerabilities.

The critical difference from a one-time scan: Inspector runs **continuously**. It doesn't just check your instances once when you enable it and declare them clean. When a new CVE is published, Inspector automatically re-evaluates your existing resources against the new vulnerability. When an EC2 instance changes — new package installed, AMI updated — Inspector rescans it. Priya's EC2 fleet was flagged for the OpenSSL CVE within minutes of enabling Inspector, not because she'd asked it to scan, but because that's what it does.

Findings are severity-rated: Critical, High, Medium, Low, Informational. They flow to Security Hub alongside GuardDuty and Macie findings. One dashboard. All three lenses.

"Three instances affected," Leo said, reading the Inspector findings. "The other six are on a patched version."

"Patch those three this week," Priya said.

"What about the container images?"

Priya looked at the Inspector ECR findings. Two base images in their container registry had known vulnerabilities — older versions of packages that had since been patched. She tagged them for rebuild.

"The important thing," Priya said, "is that we found this before it was exploited. Not after."

**The Three-Lens Model**

GuardDuty, Inspector, and Macie each watch a different thing:

- **GuardDuty** is behavioral. It asks: *what is happening right now that looks wrong?* API calls from unexpected locations, EC2 instances contacting command-and-control servers, credentials being used at unusual hours. It catches active threats and anomalies.
- **Inspector** is structural. It asks: *what is present in our environment that could be exploited?* Unpatched packages, vulnerable dependencies, outdated runtimes. It catches the conditions that make attacks possible.
- **Macie** is about data. It asks: *what sensitive information is sitting in our S3 buckets that shouldn't be there?* PII, financial records, credentials left in files. It catches exposure that generates no anomalous behavior — just data in the wrong place.

A compromise involving a known CVE might appear in all three: Inspector would have flagged the vulnerability before the attack. GuardDuty would flag the anomalous behavior during the attack. Macie would flag the exfiltrated data after it landed in S3.

Three different lenses, three different time horizons, none of them substitutes for the others.

**AWS Network Firewall: The Traffic Inspector**

One more specialist deserves a mention before the toolbox closes. Security groups and NACLs (Chapter 15) filter traffic by IP, port, and protocol — they can say *who* may talk to *what*, but they can't look inside the conversation. **AWS Network Firewall** is a managed, stateful firewall that you deploy at the VPC level. It performs deep packet inspection: filtering by domain name (allow outbound only to `*.eatnimbus.com` and your package repositories), blocking traffic that matches intrusion signatures (IDS/IPS, compatible with Suricata rules), and inspecting flows that security groups would simply wave through because the port number looked fine.

"So it's a security group with a brain," Leo said.

"It's the appliance you'd buy from a firewall vendor," Priya said, "except managed, auto-scaling, and deployed in its own subnet so all traffic in and out of the VPC routes through it."

Exam signals: "inspect or filter traffic by domain name or payload," "intrusion detection/prevention (IDS/IPS) for a VPC," or "centralized egress filtering for outbound traffic" → Network Firewall. Security groups and NACLs are the answer for instance-level and subnet-level allow/deny by port and IP; Network Firewall is the answer when the question demands inspection *inside* the traffic. And when the question asks how to manage WAF rules, Shield Advanced, security groups, *and* Network Firewall policies consistently across many accounts — that's **AWS Firewall Manager**, the policy administration layer on top.

## Strengths and Limitations

**AWS Shield**:

- Standard: free and automatic — no reason not to use it
- Advanced: excellent for high-profile targets; expensive for small teams
- Standard absorbs layer 3/4 attacks (SYN floods, UDP floods, DNS amplification) automatically
- Advanced adds layer 7 protection, real-time notifications, and the Shield Response Team

**AWS WAF**:

- Managed rule groups simplify setup significantly — OWASP Top 10 protection with a few clicks
- Custom rules require understanding of HTTP attack patterns
- Rate limiting is a powerful feature often overlooked — effective against scrapers and brute force
- WAF is not a substitute for secure application code — it's a defense-in-depth layer
- Start in Count mode, validate, then switch to Block

**GuardDuty**:

- Extremely low effort to enable (a few clicks, 30-day free trial)
- Findings require human review and response — GuardDuty detects, it doesn't fix
- False positives occur — some legitimate activity looks anomalous to ML models
- Severity levels (Low/Medium/High) help prioritize response
- Integrates with Security Hub, EventBridge, and Lambda for automated response workflows

**Amazon Inspector**:

- Continuous, automated vulnerability scanning — not a one-time check
- Re-scans automatically when new CVEs are published or when resources change
- Covers EC2 instances (OS and application packages), ECR container images, and Lambda function packages
- Findings flow to Security Hub; severity ratings help prioritize patching
- Does not block attacks — it surfaces the conditions that make attacks possible

**Amazon Macie**:

- Automatically discovers sensitive data (PII, credentials, financial data) in S3
- Catches data exposure that has no anomalous behavior pattern — GuardDuty would miss it
- 30-day free trial; pay per bucket per month after that
- Most valuable for teams with many S3 buckets and varying sensitivity levels

**AWS Security Hub**:

- Aggregates findings from GuardDuty, Macie, Inspector, Config, and Firewall Manager
- Checks configuration against security benchmarks (CIS, NIST, PCI-DSS)
- Most valuable at multi-account scale
- Enable early, even if you only have one account — findings history is cumulative

## Summary

Five services, five layers. Each one addresses a different kind of threat — and none of them replaces the others. A DDoS attack bypasses WAF and GuardDuty. A SQL injection attempt bypasses Shield. A compromised credential used slowly and carefully might bypass Shield and WAF entirely — but GuardDuty will see the anomaly. A developer accidentally uploading customer PII to a debug S3 bucket bypasses all three — but Macie catches it.

- **AWS Shield Standard**: Free, automatic DDoS protection at layer 3/4. Always on. Absorbed the 50 Gbps SYN flood before it reached the Nimbus load balancer.
- **AWS Shield Advanced**: Premium DDoS protection with SRT access and cost protection. Enterprise use case.
- **AWS WAF**: Application-layer firewall. Inspect and filter HTTP requests. Attach to CloudFront, ALB, or API Gateway. Use Managed Rule Groups for OWASP Top 10 protection. Rate-based rules for scraper defense.
- **Amazon GuardDuty**: Behavioral threat detection. Core data sources: CloudTrail events, VPC Flow Logs, and DNS logs. Optional extended protections add S3 events, EKS/ECS runtime monitoring, RDS login events, and Lambda network activity. Generates categorized findings for anomalous activity. Five key finding types: UnauthorizedAccess (console login), CryptoCurrency (mining), Recon (port probe), Trojan (C2 traffic), Policy (S3 misconfiguration).
- **Amazon Inspector**: Automated vulnerability assessment. Scans EC2 instances, ECR container images, and Lambda function packages for known CVEs. Runs continuously and re-evaluates when new vulnerabilities are published. Findings flow to Security Hub.
- **Amazon Macie**: Sensitive data discovery in S3. Detects PII, credentials, and financial data. Catches exposure that has no anomalous behavior pattern.
- **AWS Security Hub**: Aggregates findings from all security services into one dashboard. Enables centralized monitoring across multiple accounts.
- **CloudTrail**: The foundation of all AWS security logging. Enable a trail writing to S3 for long-term retention. Every security service reads from it.

## Exam Tips

*SAA-C03 Domain: Design Secure Architectures (Domain 1, Task 1.2)*

- **Shield Standard vs Advanced**: Standard is free and automatic. Advanced costs money and adds the SRT, cost protection, and better detection. Exam signals for Advanced: "large-scale DDoS," "SLA guarantee during attacks," "financial protection against DDoS-related cost spikes."
- **WAF use case signals**: "block SQL injection," "block cross-site scripting," "rate limit API calls," "block specific user-agents," "OWASP Top 10 protection" → WAF.
- **GuardDuty signals**: "detect unusual API activity," "identify compromised credentials," "flag anomalous EC2 network connections," "threat intelligence" → GuardDuty.
- **WAF attachment**: Can attach to CloudFront (global), ALB (regional), API Gateway (regional), AppSync.
- **GuardDuty data sources**: Three core sources — CloudTrail events, VPC Flow Logs, DNS logs. Extended optional sources include S3 data events, EKS audit logs, RDS login events, Lambda network activity, and ECS runtime. Exam may ask which data source is relevant to a specific detection scenario: "anomalous RDS logins" → GuardDuty RDS Protection; "container runtime threats" → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie vs GuardDuty**: This is a common exam distractor. **Macie** uses ML to detect sensitive data in S3 (PII, credentials, financial data). **GuardDuty** detects threats and anomalies in behavior. Macie is about content. GuardDuty is about behavior.
- **Inspector vs. GuardDuty vs. Macie:** Three different lenses, none substituting for the others. **Inspector** = vulnerability scanning — CVEs on EC2 instances, container images in ECR, and Lambda function packages. Runs continuously and re-scans when new CVEs are published. **GuardDuty** = behavioral threat detection — what's happening right now that looks anomalous. **Macie** = sensitive data discovery in S3 — PII, credentials, and financial data that shouldn't be there. Exam trigger: "identify unpatched vulnerabilities on EC2" or "scan container images for CVEs" → Inspector. "Detect unusual API calls or compromised credentials" → GuardDuty. "Find PII or sensitive data in S3" → Macie.
- **Security Hub**: Aggregates security findings from multiple services and accounts. Exam scenario: "company has multiple AWS accounts and wants a single view of all security findings" → Security Hub.
- **Rate-based rules in WAF**: Used to limit requests per IP within a time window. Different from the Core Rule Set (which matches attack patterns). Exam uses rate-based rules for "prevent brute force login attempts" or "mitigate scraping."
- **CloudTrail + GuardDuty + Security Hub**: These three together form the core of AWS security observability. Enable CloudTrail first (GuardDuty and Security Hub depend on it), then GuardDuty, then Security Hub to aggregate findings.

## Exercises

**Exercise 1 — Recall**

Explain the difference between AWS WAF and Amazon GuardDuty. What does each service protect against, and at what layer does each operate?

*(Hint: Think about WAF as a filter on incoming requests, and GuardDuty as a behavioral analyst watching your logs.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A retail company's website is being targeted by a botnet that sends millions of requests per hour to their product search API. The requests appear legitimate (valid User-Agent strings, valid session cookies) but don't result in purchases — they're scraping product prices. The attack is causing legitimate customers to experience slow response times.

Which combination of services BEST addresses this threat?

A) AWS WAF with rate limiting rules and CloudFront  
B) AWS Shield Advanced and CloudFront  
C) Amazon GuardDuty and AWS Shield Standard  
D) Network ACLs blocking the botnet's IP ranges

**Hint 1**: The requests are HTTP-level (application layer). Which service operates at the HTTP layer?

**Hint 2**: Botnets use many different IP addresses — blocking specific IP ranges at the NACL level is ineffective against large botnets.

**Hint 3**: Rate limiting by IP address can slow down the scraping even if you can't block it entirely.

**Answer**: A

**Explanation**: AWS WAF can rate limit requests per IP address, reducing the impact of high-volume scraping from any single source. CloudFront distributes the incoming traffic across AWS's edge network, absorbing the volume and protecting the origin. WAF rules can also match on request patterns (rapid sequential requests to the same API endpoint) to identify scraping behavior.

**Why not B?** Shield Advanced protects against DDoS floods (layer 3/4). The scenario describes application-layer scraping (layer 7 HTTP requests), which Shield doesn't inspect.

**Why not C?** GuardDuty detects anomalies in your AWS account behavior — it doesn't block incoming HTTP requests. Shield Standard doesn't handle application-layer attacks.

**Why not D?** Large botnets use thousands of IP addresses from distributed sources. Blocking specific ranges is a whack-a-mole approach that fails against sophisticated botnets.

*SAA-C03 Domain: Design Secure Architectures — Task 1.2*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is considering their threat model as they prepare to handle credit card data. A PCI-DSS compliance review requires:

- Protection against network-layer DDoS attacks
- Application-layer filtering for known web exploits
- Logging of all API calls to a tamper-evident, long-term store
- Detection of unusual access patterns to the payment service

Map each requirement to a specific AWS service or configuration. Is Shield Standard sufficient, or does the PCI-DSS context suggest Advanced? Where would you attach WAF?

*(There is no single correct answer. The goal is to practice mapping compliance requirements to AWS services.)*

## Post-Credits Scene

GuardDuty was enabled.

Forty-eight hours later, it generated its first finding: *"EC2 Instance i-0abc123 is communicating with a known Tor exit node."*

Leo looked at the instance ID.

"That's the internal monitoring instance," he said. "The one I set up to run network diagnostics."

"Is it supposed to communicate with Tor exit nodes?"

"No." He paused. "Why would it?"

He pulled up the instance. Someone had installed a tool on it — a legitimate open-source network scanner that, it turned out, also communicated with Tor infrastructure for anonymized data collection.

"So the tool was calling home," Priya said.

"Without my knowledge," Leo confirmed.

"That's a supply chain risk. A dependency that does things you didn't authorize."

Leo uninstalled the tool. He set up a process to review every third-party tool before installation.

"Is this the level of paranoia we're at now?" Maya asked.

"Yes," said Priya.

"Is this the level we should have always been at?" Maya asked.

"Also yes," said Priya.

In the next chapter: what happens when the data center in Oregon disappears — and why Nimbus keeps running.
