# Chapter 3: Who Are You, Exactly?

It was just past nine in the morning. Leo had been at his desk since seven, coffee gone cold beside the keyboard. The office was quiet — Maya hadn't arrived yet, Tom was on a call. Outside, someone was mowing a lawn.

Leo typed the command one more time.

The terminal returned two words: Access Denied.

The Singapore crisis was behind them. The region was fixed, the server was running in us-west-2, and the team felt briefly competent. That feeling had lasted about forty-eight hours before the new problem surfaced: Leo couldn't deploy to production. Nobody had set up his permissions. Nobody had set up anybody's permissions. The AWS account was wide open at the root level and locked shut everywhere else, and nobody had noticed because nobody had tried.

"I already deployed it — oh," Leo muttered, scrolling back through his terminal. He had been deploying to what he thought was production for a week. It was staging. The real production environment had never been touched.

Maya looked over his shoulder at the error message. "Who gave you that permission?"

Leo turned around. "What permission?"

"The permission to deploy to production. Who set that up?"

Leo opened the AWS console and started clicking through menus. Nobody had. There was
no policy, no role, no explicit grant. There was also no explicit denial — just an
absence. Nobody at Nimbus had ever sat down and thought about who could do what.

That was the problem.

**The Problem With Passwords**

Passwords are a bad model for computer systems.

Not because they're always weak. Because they're binary: you either have the password
or you don't. If you have it, you can do anything the account is allowed to do.

That's fine for a single user on their personal laptop. It's catastrophic for a
company's cloud infrastructure.

Consider what Nimbus needs to manage: the web server, the database, file storage,
networking, billing alerts, user accounts. If everything is protected by one password —
or even one set of credentials — then anyone who gets that password gets everything.

And "everything" on AWS means the ability to delete databases. Spin up servers that run
up a $50,000 bill. Exfiltrate every customer record. Destroy backup data.

There's another problem beyond the binary nature of passwords: passwords are static.
They don't expire automatically. They're often reused across services. They get written
down. They get stored in spreadsheets labeled "passwords DO NOT SHARE." They get shared
anyway, because convenience beats security when the security mechanism is friction.

The "shared credentials" problem is not a character flaw. It's a systems problem. When
the only way to grant someone temporary access to a system is to give them the permanent
password, people share passwords. The solution is to build a system where temporary,
scoped access is the default — not a workaround that requires heroic effort.

That's what IAM does. Not just "better passwords," but a fundamentally different model
where access is defined by identity and policy rather than by who knows a string of
characters.

Priya did not describe this in calm, abstract terms. She described it as a story.

**The Breach That Cost $80,000 in Four Hours**

A developer at a startup pushed a GitHub Actions deployment script to their public repository. The script contained AWS credentials hardcoded as environment variables — a mistake that's common enough to have its own category in cloud security post-mortems. The credentials had full admin access to the company's AWS account, because someone had configured them that way six months earlier to avoid dealing with IAM policies.

The credentials were in the file for approximately six minutes before an automated scanner — run by an attacker, not a security researcher — found them.

The scanner indexed the credentials, assessed the account permissions, and began spinning up GPU instances in multiple regions. GPU instances are expensive. They're also useful for cryptocurrency mining. Within the first hour, forty-seven `p3.8xlarge` instances were running across `us-east-1`, `eu-west-1`, and `ap-southeast-1`.

A `p3.8xlarge` costs about $12 per hour. Forty-seven of them cost $564 per hour.

By the time the startup's billing alert fired — configured at $1,000 per day, which nobody had thought to tighten — four hours had passed. The bill was approaching $2,200 and climbing.

By the time someone understood what was happening and revoked the credentials, the bill had reached $3,400 for those few hours. But the real cost came later: the audit revealed that the attacker had been mining for weeks already, quietly, at night, using a second set of leaked credentials that nobody had noticed. Total damage by the time the audit was complete: over $80,000.

"And they shut down?" Tom asked.

"Three months later," Priya said. "The investors pulled out. The breach was disclosed. The press coverage made fundraising impossible."

The room was quiet.

"So what's the alternative?" asked Tom.

**The Concept: Identity and Access Management**

The alternative is a system where you don't give everyone the same key.

Imagine an office building where every floor has different areas, and every employee
has a keycard that only opens the doors they need for their job. The intern's keycard
works on the third floor. The accountant's keycard opens the finance office but not
the server room. Nobody walks through a door they don't have a reason to walk through.

That's the model AWS uses.

AWS calls this system **IAM**: Identity and Access Management.

IAM is the keycard system for your entire cloud account. You define who exists
(identities), what they're allowed to do (permissions), and apply those permissions
through policies. The building has dozens of floors. IAM makes sure each person can
only reach the floors they need.

The keycard analogy extends further. In a well-run building, you know at any moment who has access to what. You can print a report: here are every keycard's access rights. Here is who has been in the server room in the past 30 days. Here are the cards that haven't been used in 90 days (a possible indicator of a terminated employee's card that wasn't deactivated).

IAM provides the same visibility. Every action taken through IAM — every API call, every console login, every permission grant — is logged in **AWS CloudTrail**. If you need to know who deleted a database at 2am on a Tuesday, CloudTrail has the answer. If you need to demonstrate to an auditor that only authorized users had access to production systems, CloudTrail provides the evidence.

AWS CloudTrail automatically keeps a 90-day history of management events, readable from the console. But 90 days has a way of being not quite enough when your security team needs to audit something from last quarter. For persistent, long-term logging — and for alerts — you need to create a **Trail**, which writes all events to an S3 bucket and can stream to CloudWatch Logs. The Trail is not automatic; it's something you configure once and then forget about. Until you need it.

The combination of IAM's access controls and CloudTrail's audit logging is what allows large organizations to run AWS accounts at scale with confidence: access is defined and enforced by IAM; every exercise of that access is recorded by CloudTrail.

**The Hospital Analogy**

Here's a second way to think about it — one that makes the access hierarchy more intuitive.

Imagine a hospital. Not just the physical building, but the complete organizational structure of people, roles, and data.

The **receptionist** can see patient appointment schedules and insurance information. They can check patients in and out. They cannot access medical records, cannot modify prescriptions, cannot view surgical histories.

The **nurse** can access medical records for patients on their ward. They can administer medications per doctor's orders. They cannot prescribe medications. They cannot authorize surgeries.

The **doctor** can view and modify medical records, write prescriptions, and order tests. They cannot access the payroll system. They cannot modify other doctors' prescriptions without a specific override.

The **surgeon** can access the operating room systems. They have specific permissions for surgical records that most doctors don't need.

The **cleaning staff** can access floor plans and room schedules. They cannot access any patient data.

Each person in the hospital has the access they need for their job — and only that. The receptionist does not have surgical access. The cleaning staff does not see patient records. And crucially: if a cleaning staff member's keycard is stolen, the attacker gets cleaning schedules. They don't get patient records. The blast radius of the breach is limited to what that keycard could access.

This is how IAM works. Each identity — each user, each service, each automated process — gets exactly the permissions it needs. Nothing more.

Tom leaned back. "So Leo is the nurse, and I'm the accountant."

"Something like that," Priya said. "And neither of you is the surgeon."

"Who's the surgeon?"

"Nobody, day to day," Priya said. "The root account is the surgeon. It only comes out for specific, documented procedures."

**The Building Blocks of IAM**

IAM has four core concepts. They build on each other.

**Users** are individual identities. Maya has an IAM user. Tom has an IAM user.
Each user has their own credentials — and should only have the permissions they
specifically need.

An IAM user has two types of credentials: a **password** for console access (logging into the AWS web interface) and **access keys** (a key ID and secret key) for programmatic access via the CLI or SDKs. You don't always need both. A developer who only uses the CLI doesn't need a console password. A non-technical user who only needs the console doesn't need access keys. Grant only what's needed.

**Groups** are collections of users. Instead of setting permissions for Maya, Tom,
Priya, and Leo individually, you create a "Developers" group with developer permissions
and add them to it. When a fifth person joins, you add them to the group and they
instantly inherit the right permissions.

The practical benefit of groups is maintainability. If the "Developers" group needs a new permission — say, access to a new S3 bucket — you add it to the group once and all developers immediately have it. Without groups, you'd update each user individually, which creates opportunities for inconsistency and misses people.

**Roles** are temporary identities that can be *assumed* by something — a person, a
service, or another AWS account. We'll go deep on roles in Chapter 14. For now: if
a User is a permanent employee, a Role is a visitor badge. It grants specific access
for a specific time or purpose.

The most important use of Roles for this chapter: IAM Roles for EC2 instances. When you attach a Role to an EC2 instance, the application running on that instance can make AWS API calls using the Role's permissions — without any static credentials stored anywhere. The credentials are temporary, rotated automatically by AWS, and scoped to the Role's policies. This eliminates the "credentials in config files" problem entirely.

**Policies** are the actual permission rules. A policy is a document (written in JSON
internally, but you don't need to memorize the format) that says: "The holder of this
policy is ALLOWED to perform action X on resource Y." Or "DENIED action Z."

AWS provides hundreds of **managed policies** — pre-written policies for common use cases. `AmazonS3ReadOnlyAccess` grants read access to all S3 buckets. `AmazonEC2FullAccess` grants full EC2 control. For production use, you often want **customer-managed policies** — policies you write yourself, scoped precisely to the resources and actions your application actually needs.

The IAM evaluation model is: by default, everything is denied. Permissions must be
explicitly granted. If a policy doesn't say you can do something, you can't.

**The Principle of Least Privilege**

Give people and systems only the access they need to do their job. Nothing more.

Priya called this "the principle of least privilege." It sounds obvious. In practice,
most teams violate it constantly — not maliciously, but out of convenience.

"Can we just give Leo admin access so he can deploy things faster?"

No.

"Can we just use the root account for everything?"

Absolutely not.

The root account is the master key to your entire AWS account. It can do anything,
including close the account itself. You should create it once, set up multi-factor
authentication, and then never use it again for day-to-day work.

There are exactly a handful of tasks that require the root account: changing the account email address, viewing billing information that isn't otherwise delegated, closing the account, and a few other administrative operations that AWS explicitly restricts to root. For everything else — creating users, deploying infrastructure, accessing databases — you use IAM users and roles. The root account is for the building manager. Everyone else has appropriate keycards.

Priya created separate IAM users for everyone that afternoon. She gave Leo permissions
to deploy to the development environment. Not production. Not billing. Not networking.
Just deployment.

"This feels restrictive," Leo said.

"That's how you know it's right," Priya replied.

The development-versus-production boundary was the first and most important least-privilege line Priya drew. Developers needed to move fast in development: create resources, test configurations, make mistakes. But production was different. Production changes needed to be deliberate, reviewed, and executed through a controlled process. Giving a developer direct production access was giving them the ability to make production mistakes at development speed.

Over time, Priya built a system where production access was granted temporarily through a role assumption process: a developer who needed to make a production change requested the access, got it for a 4-hour window, made the change, and the access expired automatically. The window was logged in CloudTrail. The access couldn't be used after it expired. Production was protected not by denying access permanently, but by making access time-bounded and auditable.

You might be wondering: if everything is denied by default, why does the root account have full access? The root account is special — it bypasses IAM entirely. That's precisely why you lock it away. Every other action in AWS goes through IAM's evaluation chain, where a missing Allow is the same as a Deny.

**Blast Radius: Why Least Privilege Saves Companies**

There is a concept that security engineers use to think about credential compromise: **blast radius**.

Blast radius is the maximum damage an attacker can do if they obtain a given credential.

An attacker with the root credentials of an AWS account has unlimited blast radius. They can delete every resource, exfiltrate every byte of data, spin up GPU instances in every Region, and close the account. The credential itself contains no limits.

An attacker with Leo's IAM credentials — scoped to deploying to the development environment and reading from one S3 bucket — has a tiny blast radius. They can deploy to dev. They can read some files. They cannot touch production. They cannot access the database. They cannot see billing. They cannot spin up GPU instances.

The breach story from earlier had a large blast radius because the developer's credentials were admin. If those same credentials had been scoped to their actual job — deploying to one specific environment — the damage would have been far smaller. The attack might still have happened. The outcome would have been different.

This is why least privilege isn't just policy. It's architecture. Every permission you don't grant is blast radius you don't have.

**What Happens When You Get This Wrong**

Three scenarios, in order of increasing severity:

**Scenario 1**: An employee with admin access leaves the company. Nobody deactivates
their account. Three months later, they still have access. This happens constantly.
IAM solves it: you disable the user. Instantly, everywhere.

This is the most common IAM failure mode, and it's entirely preventable. Most organizations
have a process for revoking physical access (returning a badge, returning a laptop) but
overlook IAM. The offboarding checklist that includes "disable the IAM user" and
"remove from all IAM groups" is not a complex engineering challenge — it's process
discipline. The teams that do it consistently are the ones who never find out what
happens when an ex-employee can still access the production database.

**Scenario 2**: A developer's laptop is compromised. The attacker finds AWS credentials
stored in a config file with full admin permissions. Because the credentials have broad
access, the attacker can do anything: mine cryptocurrency, steal data, delete backups.
With least privilege: the credentials only work for their limited scope. Blast radius is contained.

The credentials-in-a-config-file pattern is more common than it should be. Developers
often store AWS credentials in `~/.aws/credentials` for local development — which is
fine. The problem is when those credentials have production-level access instead of
being scoped to a sandbox environment. Development credentials should be scoped to a
development environment. Production access should require explicit steps to assume, not
be present on every laptop all the time.

**Scenario 3**: A badly written application accidentally exposes AWS credentials in its
logs. If those credentials have broad access, you have a catastrophic breach. If they
have narrow access — only to the specific S3 bucket the application needs — the exposure
is limited and contained.

The application-credentials-in-logs scenario is subtle. It often happens when debugging
code logs the full request context — including authorization headers — or when an error
handler serializes all environment variables (including `AWS_ACCESS_KEY_ID`) to a log
file. The safeguard here is IAM Roles for EC2, which eliminates static credentials from
the application environment entirely. If there are no static credentials, they can't
appear in logs.

The pattern: access should be scoped to the minimum. Always. Not because you distrust
your people, but because you can't control what happens to compromised credentials.

**If Broad Access Then Convenience But Exposure**

There is always a temptation to give teams wider access than they need — it makes
deployments faster, reduces friction, avoids the "Access Denied" moments that break
flow. If you give everyone admin access, then deployments are smooth and nobody gets
blocked — but when credentials leak (and they do), the attacker inherits full admin
rights. One compromised laptop becomes a complete account breach. Write the minimum
permission first. Expand only when something fails. That rule saves companies.

**Multi-Factor Authentication: The Second Lock**

Even with least privilege, credentials can be stolen. Passwords can be guessed,
phished, or leaked. IAM addresses this with **Multi-Factor Authentication (MFA)**.

MFA requires something you *know* (password) plus something you *have* (a phone, a
hardware key). Even if an attacker steals your password, they can't log in without
also having your phone.

MFA should be enabled for every IAM user. It is non-negotiable for the root account.

Priya spent the afternoon setting it up for everyone. It did not go smoothly.

Leo's authenticator app registered the wrong account twice. He had to scan the QR code three times because the clock on his laptop was slightly out of sync, which caused the time-based tokens to fail. On the third attempt, it worked.

"Is there a way to do this without the app?" Leo asked, looking at his phone.

"Hardware keys," Priya said. "A physical device that plugs into USB. More secure than the app. More expensive."

"How much more?"

"About $50 per key. You'd want two, in case you lose one."

Tom wrote "$100 per developer" in his notebook.

"We're buying them," Priya said. "For the root account at minimum."

Tom asked if it was too much friction overall. Priya pulled up the breach story again.

Tom set up MFA immediately.

"And what if someone tries to break in while we're in the middle of this transition?" Priya asked. "Before everyone has MFA enabled?"

Nobody had a good answer. She set up MFA for the root account first, before anyone else.

**IAM Access Analyzer: The Second Set of Eyes**

Priya had one more tool to show the team after the MFA setup was complete.

"This one runs automatically," she said, opening a new console tab.

**IAM Access Analyzer** is a service that continuously analyzes your IAM policies and flags anything that grants access to resources outside your account — or outside what you'd expect.

It found something on the first run.

An S3 bucket — one Leo had set up as "temporary" three weeks ago and then forgotten — had a bucket policy that allowed public read access. The bucket contained some test data files, nothing sensitive. But it also contained a folder that Leo had named `db-backups-staging` and populated with a few exported SQL files to test the import process.

"Is there anything sensitive in those SQL files?" Priya asked.

Leo looked at the folder name. Then at the files inside it. Then at the ceiling.

"I exported the staging database," he said. "Which has copies of early production customer data."

Priya closed her laptop slowly.

The bucket was set to private within five minutes. Access Analyzer continued to monitor for any future policies that opened resources unexpectedly.

"Think of it as a perimeter alarm," Priya said. "Every time someone accidentally leaves a door open, it tells us."

You might be wondering: does IAM Access Analyzer replace manual policy review? No. It's a detection tool, not a prevention tool. It tells you about access that's been granted — it can't tell you whether that access was intentional. The human review of "was this policy correct?" still has to happen. Access Analyzer just makes sure the open windows don't go unnoticed.

## Strengths and Limitations

**IAM is the right tool for**:

- Controlling who and what can access every AWS resource
- Implementing least-privilege across users, services, and cross-account boundaries
- Eliminating the need to share long-lived credentials between systems
- Every IAM action is logged automatically, giving you an audit trail of who did what and when (covered in Chapter 14)
- Cross-account access: an IAM Role in Account A can be assumed by a principal in Account B, allowing controlled sharing of resources between AWS accounts without credential sharing

**Where IAM becomes difficult**: IAM policies can grow into hundreds of statements across dozens of roles, and debugging an "Access Denied" error requires understanding which of those policies is the effective one — a task that is harder than it sounds. The most common IAM mistake is not too little access — it's too much. Over-permissive policies created to "just make it work" become security liabilities that are painful to roll back after the fact. Write the minimum permission first. Expand only when something fails.

There is a practical challenge with IAM at scale: **policy sprawl**. Organizations that have been running AWS for several years often have dozens or hundreds of custom policies, many of which overlap, some of which are never used, and a few of which contradict each other in ways nobody has noticed because the contradictions only matter for edge cases. AWS provides **IAM Access Analyzer** (which we introduced in this chapter) and **IAM policy simulation** tools to help audit and rationalize policies. But the most effective strategy is to build clean policies from the start and audit regularly — rather than letting policies accumulate and trying to untangle them later.

Priya set up a quarterly IAM review: list all roles and policies, check which ones are actively used via CloudTrail logs, flag any unused credentials or overly broad policies for removal or restriction. The review took two hours per quarter and caught three policy issues in its first year.

"It's not exciting work," she said. "But access reviews are how you find the things that would have been catastrophic if someone had noticed them first."

## Summary

The Admin123 password was the symptom. The disease was that Nimbus had no access control strategy at all — a shared root credential, no roles, no policies, no audit trail. IAM doesn't just fix the symptom; it forces the team to answer a question they'd been avoiding: who, exactly, is allowed to do what? The answer to that question is the foundation of every secure AWS architecture.

- **IAM** (Identity and Access Management) is how you control who can do what in AWS. The core building blocks are: **Users**, **Groups**, **Roles**, and **Policies**.
- By default, everything in AWS is **denied**. Permissions must be explicitly granted.
- The **Principle of Least Privilege** means giving each identity only the access it needs — minimizing the **blast radius** if a credential is ever compromised.
- The **root account** can do anything, including catastrophic things. Lock it behind MFA and use it as little as possible.
- Enable **MFA** for every IAM user. Non-negotiable — on the exam and in production.

## Exam Tips

*SAA-C03 Domain 1 — Task 1.1 (secure access to AWS resources)*

- **Everything is denied by default.** An explicit "Allow" is required. If a policy
  doesn't mention an action, the action is denied.
- **Explicit Deny always wins.** If any policy in the chain denies an action, that
  deny cannot be overridden by an Allow anywhere else in the chain. This catches many
  candidates off guard.
- **Root account ≠ IAM admin.** The root account is a separate credential from IAM.
  You cannot delete the root account. You *can* (and should) restrict when it's used.
- **IAM is global**, not Regional. IAM users, groups, roles, and policies exist
  across the entire AWS account, not per-Region.
- **Roles are the preferred way to grant access to AWS services.** If an EC2 instance
  needs to access S3, you attach an IAM Role to the instance — you don't store
  credentials on the machine. This pattern shows up constantly on the exam.
- **IAM Access Analyzer** generates findings when resources are accessible from outside the account or from outside the organization. When an exam scenario mentions detecting unintended external access to S3 or KMS, Access Analyzer is the answer.
- **MFA for the root account is mandatory**, not optional, in the context of AWS security best practices. Exam questions about securing the root account always include MFA as part of the correct answer.
- **Permission boundaries** are an advanced IAM feature (covered in Chapter 14) that limits the maximum permissions an IAM user or role can have, even if their policies grant more. Exam questions about "preventing privilege escalation" or "setting a maximum permission ceiling" point to permission boundaries.
- **Service Control Policies (SCPs)** are organizational-level policies that restrict what can be done in member accounts of an AWS Organization. They work above the IAM level — even an account administrator cannot exceed the limits set by an SCP. When an exam scenario involves multi-account security governance, think SCPs.
- **CloudTrail** records all IAM API calls. When an exam scenario asks "how would you audit which users made changes to IAM policies," the answer is CloudTrail. Every IAM action — creating a user, modifying a policy, assuming a role — is logged. The 90-day event history is automatic and free; for long-term retention and alerting, you must create a Trail that delivers logs to an S3 bucket.

## Exercises

**Exercise 1 — Recall**

In your own words: what is the difference between an IAM User, a Group, and a Role?
When would you use each one?

*(Hint: Think about the keycard building analogy — which one is a permanent card,
which is a department grouping, and which is a visitor badge?)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company runs a web application on EC2 instances that need to read files
from an S3 bucket. A junior developer suggests storing AWS access keys directly in
the application code on the EC2 instances. The security team objects.

What is the MOST secure and operationally appropriate solution?

A) Store the access keys in environment variables on the EC2 instance instead of the
   code  
B) Create a dedicated IAM user with S3 read permissions and share the credentials
   with the development team  
C) Attach an IAM Role with the appropriate S3 read permissions directly to the EC2
   instances  
D) Use the root account credentials to give the application full access to all AWS
   resources

**Hint 1**: The problem with storing credentials anywhere on the instance is that
credentials can be leaked. Is there a way to give the EC2 instance access without
using credentials at all?

**Hint 2**: AWS has a mechanism where services can be granted permissions without
needing static credentials. What is that mechanism called?

**Hint 3**: IAM Roles can be attached to EC2 instances. When they are, the instance
automatically receives temporary credentials that are rotated by AWS. No static
credentials needed.

**Answer**: C

**Explanation**: Attaching an IAM Role to an EC2 instance is the correct pattern.
The instance automatically gets temporary, rotating credentials through the EC2
metadata service. There are no long-lived credentials to leak, rotate, or accidentally
commit to a repository.

**Why not A?** Environment variables on an EC2 instance can still be leaked —
through application logs, debugging endpoints, or if the instance is compromised.
Static credentials are the problem, not their location.

**Why not B?** Creating a shared IAM user and distributing credentials to a team
violates least privilege and makes credential rotation a nightmare. If one person
leaves, you can't easily revoke just their access without changing shared credentials.

**Why not D?** Using root account credentials for any application is a severe security
violation. The root account has unlimited access and its credentials should never
leave the account owner's control.

*SAA-C03 Domain 1 — Task 1.1 (IAM roles, least privilege)*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is onboarding three new developers next month. Each will need different levels
of access: one works on the database layer, one on the application servers, one on
the front-end static files. There's also a CI/CD pipeline that needs to deploy code.

Design an IAM structure for this scenario. What users, groups, roles, and policies
would you create? What would be the most important least-privilege boundary to enforce?

*(There is no single correct answer. Think about minimizing blast radius if any one
identity is compromised.)*

## Post-Credits Scene

By the end of the day, every IAM user had MFA enabled. Leo's account had been reduced
to developer-level access: deploy to the dev environment, read from the shared config
bucket, nothing else.

He had tried, once, to access the production database.

Access denied.

"Is this what it feels like to be trusted but not too much?" he asked.

"That's exactly what it feels like," Priya said.

The next morning, Tom arrived early and found something that made him immediately call
the team in.

On the AWS console, he could see that their website was getting traffic. More than
they'd expected. And the web server — Leo's original one — was running hot. Really hot.

"We have a hundred concurrent users," Tom said. "And one server."

In the next chapter: the first server — renting a computer in someone else's data center.
