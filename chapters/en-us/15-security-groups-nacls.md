# Chapter 15: The Guards at the Gate

The office was quiet on a Tuesday morning when Priya opened the VPC flow logs and started reading. Outside the window, the city was waking up. Inside, the screen showed something that shouldn't be there: an outbound connection from an EC2 instance at 2:17 AM to an IP address in Romania.

The old deploy key from the first version of Nimbus was still active. It had made three API calls last week. Leo didn't know what had made them.

---

*The IAM overhaul had replaced access keys with roles. Every service now had exactly the permissions it needed. But while that work was happening, an older problem had been quietly getting worse: an active credential from a decommissioned deployment pipeline was still alive, and something had used it. The IAM layer had been strengthened. The network controls that might have contained the damage needed the same attention.*

---

Priya pulled up the VPC flow logs — network traffic records that show every connection into and out of the VPC.

"On Tuesday at 2:17 AM," she said, "there was an outbound connection from the EC2 instance running the old API to an IP address in Romania."

"That's not our infrastructure," Leo said.

"No."

"So someone was on our EC2 instance."

"Or something."

They traced it back: the old deploy key had been used to upload a small script to the EC2 instance. The script had tried to scan ports on adjacent servers. Most of the scans had failed.

"I already deployed it — oh." Leo had deployed a fix to the security group rule before the investigation was complete. The fix was correct, but he had done it before Priya had finished reading the flow logs. She had had to pause and verify the change had not affected anything unexpected.

"Next time, wait until the investigation is closed before pushing changes," she said.

"The security groups blocked them," Priya said. "The attacker got onto one EC2 instance. They couldn't reach the others because the security groups only allowed traffic from the load balancer."

"So the damage was contained."

"Because we had correctly configured security groups. Imagine if we'd left port 5432 open to any EC2 instance in the account."

Leo did not need to imagine. He had seen that configuration in the original setup.

"Have we thought about what that would mean?" Priya continued. "Any EC2 instance in the account — including the one with the compromised key — could have connected directly to the database. Run arbitrary SQL. Downloaded the order history of every customer. Dropped tables."

"Instead they got rejected every time they tried," Leo said.

"Yes. Because the database security group only accepts connections from the API security group. Not from any EC2 in the account. Not from any IP. Specifically from the API security group."

"That one design decision," Maya said, "was the difference between a contained incident and a full data breach."

"Security group design is not a checkbox," Priya said. "It is the actual security of the system."

Rafael had been listening. "How do you learn what the right configuration is? The rules seem arbitrary at first."

"You start by listing what each component needs to do," Priya said. "The load balancer needs to accept HTTPS from anywhere. The API server needs to accept HTTP from the load balancer only. The database needs to accept PostgreSQL from the API server only. Redis needs to accept port 6379 from the API server only. Those requirements map directly to inbound rules. Everything else is denied by default."

"And outbound?"

"Outbound is where people get lazy. Most teams leave outbound as allow-all. That means a compromised instance can call anything. We'll tighten that."

**Two Layers of Network Security**

In a VPC, you have two distinct tools for controlling network traffic:

**Security Groups**: Virtual firewalls attached to individual resources (EC2 instances, RDS databases, load balancers, Lambda functions in a VPC). They operate at the resource level.

**Network ACLs (NACLs)**: Firewall rules attached to subnets. They operate at the subnet boundary — before traffic reaches any resource in that subnet.

Understanding both requires understanding one critical difference: **stateful vs stateless**.

**Stateful: Security Groups**

A security group is **stateful**.

When you allow inbound traffic on a specific port, the response traffic is automatically allowed out, even if there's no explicit outbound rule for it.

When you allow outbound traffic to a destination, the response coming back in is automatically allowed.

Think of a stateful security guard at an office building. You show your badge to enter. You walk out later. The guard doesn't need to check you again on the way out — the system knows you were let in, and you're allowed to leave.

**Security Group Rules for the Nimbus API EC2 instance:**

- **Inbound — TCP 8080 — from Load Balancer SG** → Accept API traffic from ALB
- **Inbound — TCP 22 — from Bastion Host SG** → SSH from bastion only
- **Outbound — TCP 5432 — to RDS SG** → Connect to PostgreSQL
- **Outbound — TCP 6379 — to ElastiCache SG** → Connect to Redis
- **Outbound — TCP 443 — to 0.0.0.0/0** → HTTPS to external APIs

Notice: no explicit outbound rule for port 8080. The inbound rule is stateful — response traffic (the API's reply to the load balancer) is automatically allowed.

Also notice: security group rules reference *other security groups*, not IP addresses. "Allow inbound from the load balancer security group" means "allow traffic from any resource that has this security group attached." This is more flexible and maintainable than tracking IP addresses.

**Default behavior:**

- By default, all inbound traffic is denied
- By default, all outbound traffic is allowed
- All rules are evaluated (security groups don't have ordered rules — all matching rules apply)
- Security groups can only **allow** traffic — you cannot create explicit deny rules

**Stateless: Network ACLs**

A NACL is **stateless**.

When you allow inbound traffic on port 8080, that only covers inbound. The response (outbound traffic on ephemeral ports) must be explicitly allowed with an outbound rule.

Think of a metal detector. You pass through it on the way in. The metal detector doesn't know you've already been through — you have to pass through again on the way out.

**NACL rules are numbered and evaluated in order.** The first rule that matches wins. Rule 100 is evaluated before rule 200. If rule 100 denies traffic and rule 200 allows it, the traffic is denied.

NACLs can explicitly **deny** traffic — unlike security groups, which can only allow. This makes them useful for blocking specific IP ranges.

**Default NACL behavior:**

- The default NACL (created with your VPC) allows all inbound and outbound traffic
- A custom NACL denies all traffic by default (you must explicitly allow what you want)

**NACL for the public subnet (simplified):**

*Inbound rules (evaluated in order — first match wins):*

- Rule 100: TCP 443, from 0.0.0.0/0 → **Allow** (HTTPS)
- Rule 110: TCP 80, from 0.0.0.0/0 → **Allow** (HTTP)
- Rule 120: TCP 1024–65535, from 0.0.0.0/0 → **Allow** (ephemeral return ports)
- Rule \*: All traffic → **Deny**

*Outbound rules:*

- Rule 100: TCP 443, to 0.0.0.0/0 → **Allow** (HTTPS)
- Rule 110: TCP 80, to 0.0.0.0/0 → **Allow** (HTTP)
- Rule 120: TCP 1024–65535, to 0.0.0.0/0 → **Allow** (ephemeral return ports)
- Rule \*: All traffic → **Deny**

Rule 120 (ports 1024-65535) allows ephemeral ports — the temporary high-numbered ports used for TCP response traffic. Because NACLs are stateless, you must explicitly allow these outbound, or your server's responses won't get through.

**When to Use Which**

"Wait — but *why* would we do it that way?" Maya asked. "Why have two separate tools — security groups *and* NACLs — if security groups already work? What's the point of the extra complexity?"

The answer is that they operate at different levels and have different capabilities. Security groups protect individual resources and can only allow traffic. NACLs protect entire subnets and can explicitly deny. Having both means you can apply fine-grained allow rules at the resource level and broad deny rules at the subnet level — without one interfering with the other.

Use **security groups** for the primary layer of access control. They're easier to manage, stateful (less chance of accidental blocks from forgetting ephemeral ports), and support referencing other security groups.

Use **NACLs** for subnet-level controls, especially:

- **Explicit deny rules**: Block a specific IP address or range from reaching an entire subnet
- **Emergency blocking**: An IP is actively attacking — add a NACL deny rule to block the entire subnet before it reaches any resource

You might be wondering: if security groups are stateful and block all inbound by default, when would you actually need NACLs? Security groups handle most cases well. But there's one thing they can't do: explicitly deny. A security group can only allow traffic — if a rule doesn't match, traffic is denied by default. You can't add a rule that says "block this specific IP." For that, you need a NACL: a numbered deny rule that stops a specific address range before it reaches any resource in the subnet. NACLs are most useful for emergency response (blocking an active attacker) and for enforcing subnet-level boundaries that shouldn't depend on individual resource configuration.

"So the security group is the fine-grained control," Maya said, "and the NACL is the broad stroke?"

"Security groups protect individual resources," Priya confirmed. "NACLs protect entire subnets. When you want to block an IP from reaching anything in your network, NACL. When you want to allow only the load balancer to reach the API server, security group."

"Have we thought about what happens if the attacker comes back with a different IP?" Priya said. "The NACL blocks one range. They shift to another."

"That's what GuardDuty is for," Leo said. "Behavioral detection. If the same script runs from a new IP, the traffic pattern looks the same."

"We'll get there," Priya said. "First things first."

"How much does all this cost per month?" Tom asked.

Security groups and NACLs themselves are free. AWS does not charge for the number of security groups, the number of rules, or the number of NACL entries. The cost consideration is indirect: tighter outbound security group rules may route less traffic through NAT Gateway, reducing data processing charges.

"So the security controls are free," Rafael said. "The cost is the infrastructure that supports them."

"Correct. NAT Gateways for high availability. Interface VPC Endpoints for services that would otherwise go through NAT. Those have costs. The security group rules themselves do not."

**Putting It Together: The Layered Defense**

After the incident, Priya drew the Nimbus defense layers on the whiteboard:

```
Internet
  ↓
CloudFront + Shield (DDoS absorption)
  ↓
WAF (application-layer filtering)
  ↓
Internet Gateway
  ↓
NACL on public subnet (subnet-level rules, emergency blocking)
  ↓
ALB Security Group (HTTPS from anywhere)
  ↓
NACL on private app subnet
  ↓
EC2 API Security Group (port 8080 from ALB SG only)
  ↓
NACL on private data subnet
  ↓
RDS Security Group (port 5432 from API SG only)
```

"Each layer assumes the previous one might fail," she said. "The database does not trust that the network layer stopped the attacker. The EC2 instance does not trust that the ALB stopped the attacker. Each layer enforces its own rules independently."

"Defense in depth," Maya said.

"Defense in depth. An attacker who gets through one layer still faces the next. No single misconfiguration is catastrophic. It means one layer fails, and the others hold."

Leo looked at the diagram. The attacker had compromised one EC2 instance. They had gotten through the credentials layer. But every subsequent layer had held.

That was what defense in depth looked like in practice.

**The Incident: What the Layers Caught**

Going back to the Romanian IP attack:

**What happened**: The attacker used the compromised deploy key to upload a scanning script to one EC2 instance. The script tried to connect to other services.

**What stopped them**:

- The RDS security group only allowed inbound on port 5432 from the API EC2 security group. The script couldn't reach the database from a scanning tool — it wasn't attaching the right security group.
- The ElastiCache security group only allowed inbound on port 6379 from the API EC2 security group.
- Other EC2 instances only allowed SSH from the bastion host security group.

**What didn't stop them**: 

- The EC2 instance's outbound rules allowed HTTPS to 0.0.0.0/0 (needed for package downloads). The script used this to make outbound connections to the attacker's server.

After the incident, Priya added:

- A NACL rule blocking the Romanian IP range
- A more restrictive outbound rule on the EC2 instances (only allowed specific known-good destinations)
- A check that **IMDSv2 was enforced** (`HttpTokens=required`) on every instance — the script had run *on* the instance, which meant it could have queried the metadata service for the instance role's temporary credentials. IMDSv2 had been enabled back in Chapter 4; Priya verified it was still required everywhere, because an attacker with code execution plus IMDSv1 equals stolen AWS credentials.

---

**Reading the Flow Logs: What Priya Saw**

The investigation started with the VPC flow logs. Priya opened CloudWatch Logs Insights and ran a query against the flow log group for the past 48 hours:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` was the compromised EC2 instance. The REJECT filter showed connection attempts that had been blocked.

The results:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Other EC2 instance — SSH blocked
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Another EC2 — SSH blocked
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — blocked by security group
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # RDS replica — blocked
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — blocked
```

The scan had hit every internal service. Every attempt had been rejected. The security group design had held.

But there was also an outbound ACCEPT entry:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

That was the data exfiltration attempt — 2.8 kilobytes sent to the Romanian IP over HTTPS. The security group allowed HTTPS outbound for legitimate package downloads. The attacker had used that rule.

"The security groups stopped the lateral movement," Priya said, walking the team through the logs. "But the outbound rule was too permissive. We allowed HTTPS to any destination. We should allow HTTPS only to known AWS endpoints — CloudWatch, Secrets Manager, S3 — and to the package repository CDNs."

She showed the updated security group outbound rules:

```
TCP 443 → pl-68a54001 (AWS S3 gateway endpoint prefix list)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (AWS package repos — narrows over time)
```

"That eliminates the general HTTPS outbound rule. Outbound HTTPS now only goes to known-good destinations."

"What about Lambda functions calling third-party APIs?" Leo asked.

"Those go through NAT Gateway, which has its own dedicated outbound rule," Priya said. "Lambda does not use the EC2 security group. Different network interface, different rule set."

---

**The Stateless Debugging Story**

Two weeks after the incident, Rafael — still in his first month — was helping set up a new data pipeline. It involved a Lambda function in a VPC that needed to call an internal API running on EC2.

The Lambda function timed out. Every call timed out.

Rafael checked the security groups. The Lambda security group had an outbound rule for TCP 8080 to the EC2 security group. The EC2 security group had an inbound rule for TCP 8080 from the Lambda security group. The rules looked correct.

He turned to Leo. "The security groups look fine. Why is it timing out?"

Leo looked at the subnet configuration. The Lambda function was in a private subnet. The subnet had a custom NACL that Priya had applied during the security hardening.

He looked at the NACL outbound rules:

```
Rule 100: TCP 443  → 0.0.0.0/0  ALLOW
Rule 110: TCP 5432 → 10.0.20.0/24 ALLOW
Rule *:   All      → 0.0.0.0/0  DENY
```

"The NACL allows HTTPS outbound and PostgreSQL outbound," Leo said. "It does not allow TCP 8080 outbound."

"The security group allows it," Rafael said.

"The NACL doesn't. And the NACL is stateless. Even if the Lambda function's security group allows the outbound connection, the NACL at the subnet boundary still evaluates the outbound traffic. The NACL is blocking the Lambda's call before it leaves the subnet."

"But if I add ALLOW for TCP 8080 outbound to the NACL—"

"You also need to add ALLOW for ephemeral ports inbound," Leo said. "The response from the EC2 instance comes back on a random port between 1024 and 65535. If the NACL's inbound rules don't allow those, the response is blocked on the return trip."

Rafael updated the NACL:

```
Rule 100:  TCP 443       → 0.0.0.0/0      ALLOW  (outbound)
Rule 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (outbound to EC2 subnet)
Rule 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (outbound to DB subnet)
Rule *:    All           → 0.0.0.0/0      DENY
```

And on the inbound side:

```
Rule 100:  TCP 1024-65535 from 10.0.10.0/24  ALLOW  (return traffic from EC2)
Rule *:    All                               DENY
```

The Lambda function connected immediately.

"This is why people hate NACLs," Rafael said.

"This is why you need to understand them," Priya said. "The bugs they create are precisely the bugs they are designed to prevent — unexpected traffic flows. Understanding the stateless model tells you exactly where to look when a connection mysteriously fails."

"Security group stateful — return traffic automatic. NACL stateless — return traffic needs explicit rules," Rafael repeated.

"Say it until it is part of how you think," Priya said.

---

**NACL Emergency Blocking: The /24 Rule**

After identifying the attacker's source IP range, Priya's response was immediate: add a NACL deny rule.

But she didn't block only the single IP. She blocked the entire `/24` — the 256-address subnet the attacker was operating from.

"Why the whole /24?" Leo asked.

"Because individual IP blocking is a losing game. Attackers use multiple IPs within a range, rotating through them when one gets blocked. Blocking the /24 makes it harder — they would need to shift to a different address block, which costs them time and effort."

The NACL rule:

```
Rule 90:  ALL from 185.220.101.0/24 → DENY
```

Rule 90 is evaluated before any allow rules (which start at rule 100). The entire range is blocked before any allow rule is considered.

"And this applies to every resource in the subnet?" Leo asked.

"Every resource. That is the point of a NACL — it applies before traffic reaches any individual resource's security group. A NACL deny at rule 90 means the packet never gets to the security group evaluation."

"Could we do this with a security group instead?"

"No. Security groups can only allow traffic. There is no deny rule. If you want to block a specific IP from reaching any resource in a subnet, NACL is the only option."

This is the primary use case for NACL deny rules: emergency response to active attacks. The security group is the primary control mechanism. The NACL is the emergency brake.

---

**Security Group Design Patterns: Reference by ID**

"Have we thought about what happens when our EC2 instances get replaced?" Priya asked. "Auto Scaling terminates old instances and launches new ones. New instances get new private IP addresses."

"If security group rules reference IP addresses," Leo said slowly, "we'd have to update the rules every time an instance is replaced."

"Exactly. Which is why you don't reference IP addresses in security group rules for intra-VPC traffic."

Security groups can reference other security groups instead of IP addresses. When a rule says "allow inbound from the load balancer security group," it means "allow traffic from any resource that has the load balancer security group attached." Auto Scaling can launch a thousand new instances with a new IP each, and the rule remains valid.

The Nimbus security group structure:

```
nimbus-alb-sg (Load Balancer)
  - Inbound: TCP 443 from 0.0.0.0/0
  - Inbound: TCP 80 from 0.0.0.0/0

nimbus-api-sg (EC2 API instances)
  - Inbound: TCP 8080 from nimbus-alb-sg
  - Inbound: TCP 22 from nimbus-bastion-sg
  - Outbound: TCP 5432 to nimbus-rds-sg
  - Outbound: TCP 6379 to nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Inbound: TCP 5432 from nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Inbound: TCP 6379 from nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Inbound: TCP 22 from <office VPN IP>
```

No IP addresses for internal traffic. Security group IDs only. When an instance is replaced, the security group membership transfers automatically to the new instance.

"And for the microservices we're planning?" Rafael asked. "We'll have a dozen services eventually. Each one needs to talk to some others, but not all others."

"Each service gets its own security group," Priya said. "Service A's security group is referenced in the inbound rules of every service that Service A is allowed to call. Services that should not communicate simply don't reference each other's security groups."

This is the **hub-and-spoke security group pattern** for microservices. A shared database security group has inbound rules from five different service security groups. If a sixth service needs database access, you add its security group to the database's inbound rule. If access should be removed, you remove the reference. No IP management. No stale rules pointing to decommissioned servers.

"The security group is the identity," Priya said. "The IP address is an accident of scheduling."

---

**Least-Privilege Firewall: The Discipline**

"Have we thought about what the correct posture is for outbound rules?" Priya asked during the post-incident review.

Most teams leave EC2 security group outbound rules at the default: allow all outbound. This is convenient — the application can call anything — but it is not least privilege.

Priya's principle: outbound rules should be as specific as inbound rules.

Nimbus API security group outbound rules, after hardening:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL to RDS)
TCP 6379 → nimbus-redis-sg     (Redis to ElastiCache)
TCP 443  → s3.amazonaws.com prefix list    (S3 gateway endpoint)
TCP 443  → secretsmanager endpoint         (Secrets Manager)
TCP 443  → logs endpoint                   (CloudWatch Logs)
```

No "allow all outbound." Every destination named.

"This is a lot of maintenance," Leo said.

"It is more maintenance than allow-all," Priya acknowledged. "It is less cleanup than a data breach. The attacker who compromised the EC2 instance could have exfiltrated more data if the outbound rules were open. They used the HTTPS-to-anywhere rule because it was there."

"And with specific outbound rules, even a compromised instance can only send data to approved destinations."

"Exactly. The security group becomes the last line of containment, not just the first line of defense."

---

## Strengths and Limitations

**Security Groups**:

- Stateful (no ephemeral port headaches)
- Can reference other security groups (more flexible than IPs)
- Only allow rules — no explicit deny
- Operate at resource level — granular
- Rules apply immediately — no ordering, no priority
- Multiple security groups can be attached to one resource — rules from all are combined

**NACLs**:

- Stateless (requires explicit rules for both directions including ephemeral ports)
- Can explicitly deny — useful for blocking known-bad IPs
- Operate at subnet level — broader stroke
- Numbered rules evaluated in order — predictable but requires careful management
- Apply before traffic reaches any resource in the subnet — first line of defense
- Effective for emergency IP blocking across an entire subnet

**Where each tool fits**:

Use security groups for everything by default. Add NACLs when you need explicit deny rules — blocking an IP range, blocking a port at the subnet level regardless of individual resource configuration, or enforcing that a data subnet can never receive traffic from a specific source. NACLs are not a replacement for security groups; they are a supplement for situations where security groups' allow-only design is insufficient.

## Summary

The Romanian IP incident had been contained by security controls that were already in place — not by luck, but by design. Security groups had prevented lateral movement within the VPC. After the incident, NACLs added the ability to explicitly block the attacker's IP range at the subnet boundary. VPC flow logs made the attack visible. Two tools, two layers, two different jobs — with logging to prove what happened.

- **Security Groups** are stateful virtual firewalls for individual resources. Allow rules only. All rules evaluated simultaneously.
- **NACLs** are stateless firewalls for entire subnets. Allow and deny rules. Rules evaluated in number order — first match wins.
- **Stateful** means response traffic is automatically permitted. **Stateless** means you must explicitly allow traffic in both directions, including ephemeral return ports.
- Security groups are your primary access control layer. NACLs are the subnet-level override — especially for emergency blocking.
- When a NACL allows inbound traffic, you must also allow outbound ephemeral ports (1024-65535) for the TCP response to get through.
- **Reference security groups by ID**, not IP address, for intra-VPC traffic. Auto Scaling replaces instances; security group membership transfers automatically.
- **Specific outbound rules** on EC2 instances limit what a compromised instance can do — least-privilege firewall.
- Use flow logs to see what the security groups and NACLs are actually doing. Rules are theory. Logs are evidence.

## Exam Tips

*SAA-C03 Domain: Design Secure Architectures (Domain 1, Task 1.2)*

- **Stateful vs stateless**: This distinction is the most tested concept in this chapter. Security groups = stateful = response allowed automatically. NACLs = stateless = must explicitly allow response traffic.
- **Security group rules**: No explicit deny. When multiple security groups are attached to an instance, the union of all rules applies. All matching rules are evaluated simultaneously.
- **NACL rule order**: Rules are evaluated from lowest number to highest. Rule 100 before 200. The first match wins. The `*` (asterisk) rule at the bottom is the implicit deny. Adding a deny rule at rule 90 blocks before any allow rule at 100.
- **Ephemeral ports**: The classic NACL mistake is forgetting to allow outbound on ports 1024-65535. If your NACL allows inbound HTTP (port 80) but doesn't allow outbound ephemeral ports, users can send requests but never receive responses. This is the most common NACL exam scenario.
- **Security group referencing**: You can allow traffic from another security group (not just an IP). This is the recommended pattern for intra-VPC traffic. The exam frequently uses "allow inbound from the ALB security group" as the correct answer for restricting EC2 access.
- **Default NACL vs custom NACL**: Default NACL allows all traffic. A custom NACL (one you create) denies all traffic by default. Exam scenario: "created a new NACL and now traffic is blocked" → check for missing allow rules.
- **Blocking an attacker's IP**: Security groups cannot block specific IPs (allow only). NACLs can explicitly deny a specific IP or CIDR. Exam scenario: "block a specific IP from reaching any resource in the subnet" → NACL deny rule.
- **Debugging connection failures**: Check the order: security group on source (outbound) → security group on destination (inbound) → NACL on source subnet (outbound + ephemeral ports) → NACL on destination subnet (inbound). Most exam connection failures are caused by a missing NACL outbound rule or missing ephemeral port allowance.
- **Multiple subnets and NACLs**: One NACL applies to all subnets associated with it. One subnet can only be associated with one NACL. Exam may ask which NACL to update when a specific subnet's traffic is affected.

## Exercises

**Exercise 1 — Recall**

A developer adds an inbound rule to a security group allowing traffic on port 443. Does she also need to add an outbound rule to allow the server's response? Why or why not?

If instead she adds an inbound rule to a NACL allowing traffic on port 443, does she need to add an outbound rule? Why or why not?

**Hint**: Think back to the chapter's analogies — is each one the security guard who remembers letting you in, or the metal detector you have to pass through again on the way out?

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company has a web application running on EC2 instances in a public subnet. The application accepts HTTPS traffic (port 443) from the internet. Users are reporting that they can connect to the application but cannot receive responses — requests hang and time out.

The EC2 security group has an inbound rule allowing TCP 443 from 0.0.0.0/0. The subnet's NACL has an inbound rule (rule 100) allowing TCP 443 from 0.0.0.0/0 and an outbound rule (rule 100) allowing TCP 443 to 0.0.0.0/0.

What is the MOST likely cause of the issue?

A) The security group is missing an outbound rule for TCP 443  
B) The EC2 instances don't have Elastic IP addresses  
C) The security group is missing an inbound rule for ephemeral ports  
D) The NACL is missing an outbound rule allowing ephemeral ports (1024-65535)

**Hint 1**: Security groups are stateful — they automatically allow responses. NACLs are stateless — they don't.

**Hint 2**: When a browser connects to a web server on port 443, the server's response travels back on a random ephemeral port (1024-65535), not port 443.

**Hint 3**: The NACL has an outbound rule for 443, but the response doesn't go to port 443.

**Answer**: D

**Explanation**: The NACL is stateless. When users connect to the server on port 443, the server's TCP response travels back on an ephemeral port (randomly chosen from 1024-65535). The NACL outbound rule only allows port 443, so the response is blocked by the default deny rule. Adding an outbound NACL rule allowing TCP 1024-65535 would fix this.

**Why not A?** Security groups are stateful — response traffic is automatically permitted regardless of outbound rules. No outbound security group rule is needed.

**Why not B?** Elastic IPs affect whether instances have public IPs, not whether established connections can receive responses.

**Why not C?** Ephemeral ports are for outbound response traffic, not inbound. The inbound connection from users comes in on port 443, which is already allowed.

*SAA-C03 Domain: Design Secure Architectures — Task 1.2*

**Exercise 3 — Architecture Challenge** *(Optional)*

After the Romanian IP attack, Priya wants to implement two additional controls:

1. Block the entire 185.0.0.0/8 IP range from reaching any resource in the public subnet
2. Ensure that the private subnet containing the database can never communicate with the internet, even if someone misconfigures a security group

Which tools would you use for each requirement, and how would you configure them? Could you use security groups for both? Could you use NACLs for both?

*(There is no single correct answer. The goal is to understand which tool fits which problem.)*

## Post-Credits Scene

The incident was contained. The compromised deploy key was deactivated. The Romanian IP range was blocked at the NACL. The old script had been removed from the EC2 instance.

Priya wrote an incident report. She shared it with the team.

The last line of the report: "Root cause: an active credential from a decommissioned deployment pipeline was never rotated or revoked. Recommendation: automated credential rotation and regular audit of all IAM credentials."

Leo read it three times.

"I should have rotated that key," he said.

"Yes," said Priya.

"How do we make sure this doesn't happen again?"

"Automation," she said. "And something that watches the watchers."

In the next chapter: the lockbox where Nimbus keeps its secrets — and the rotation that makes stolen keys useless.
