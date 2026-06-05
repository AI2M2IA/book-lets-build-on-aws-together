# Chapter 33: It Depends

Take one final breath before this chapter.

The cursor was blinking on Maya's blank slide. Title: "Architecture at Nimbus." She deleted it and typed: "The Question." Then she looked at the room and realized she didn't need the slide at all.

**Recap: From Review to Presentation**

The architecture review with Carlos — six months and several hundred restaurant launches behind them now — had left the team with a stack of ADRs and a cleaner way of thinking about decisions before they shipped. Maya had been preparing for the investor presentation when she realized that everything Carlos had asked — and everything she'd answered confidently — came down to the same underlying logic. The investors would ask why. She had learned, across two years of building Nimbus, that the answer was never the service name. The answer was always the set of conditions that made one service right and another wrong. She was about to walk into a room of people who would ask her to defend every architectural choice. She was ready.

**The Question**

At the end of almost every architecture discussion, someone eventually asks: "What's the right answer?"

And the most useful, frustrating, honest, and misunderstood answer in all of software engineering is:

**It depends.**

Not because the question is unanswerable. Not because the expert is being evasive. But because the right answer genuinely, structurally depends on context that wasn't in the question.

This chapter is about learning to say "it depends" correctly — which means being able to complete the sentence.

Think of a doctor who is asked: "Is surgery the right treatment?" A bad doctor says yes or no without examining the patient. A good doctor says: "It depends — on the diagnosis, the patient's age, their other conditions, and what happens if we wait." The answer is not evasion. It's precision. "It depends" followed by a complete sentence is the most useful thing a doctor — or an architect — can say.

**The End of Nimbus**

Two and a half years after the beginning. Maya was standing in a conference room in Seattle, presenting to a room of venture capital investors.

Nimbus had grown: 947 restaurant partners. 18,000 daily orders. $18 million in monthly GMV. Three cities live, two more launching. A team of fourteen engineers across two time zones.

The investors had questions. One of them — a technical partner at the fund — leaned forward.

"What database are you using?" he asked.

Maya didn't hesitate.

"For orders and customer data: Aurora PostgreSQL. For the menu catalog: DynamoDB. For session management and caching: ElastiCache Redis. For analytics: Athena on top of S3 Parquet files, with Redshift for the high-frequency dashboard queries."

He nodded. "Why Aurora for orders and not DynamoDB?"

"Because orders have complex relational structure — they reference menu items, customer accounts, restaurant addresses, payment methods. We need transactional consistency across multiple entities. A relational database is the right tool for that. DynamoDB's strength is high-throughput key-value access with flexible schema, which is exactly the menu catalog's access pattern."

He wrote something down. "What about scaling? You said 18,000 daily orders. That's about 12 per minute average. How did you design for peak?"

"Friday dinner rush is about 25x average. We scale horizontally with ECS and Aurora Serverless v2, which handles burst automatically. CloudFront absorbs the static content load. The API is stateless, so horizontal scaling is clean."

"And if Aurora Serverless v2 can't scale fast enough?"

"We have load testing results. The time-to-scale for Aurora Serverless v2 is under 10 seconds. Our average Friday spike ramp takes 8 minutes from the baseline. We're comfortable with the headroom."

The technical partner looked at the rest of the investors. "She knows her system."

He had more questions.

"How do you handle deployment safety? At 947 restaurants, a bad deployment means 947 restaurants can't take orders."

Maya had been asked this before, internally. "Feature flags for all behavior changes. We deploy code continuously, but new behavior is gated behind flags that we enable gradually. A deployment that changes the order confirmation flow gets rolled out to 1% of restaurants for 24 hours, then 10%, then 50%, then 100% — with automated rollback if error rates exceed threshold at any stage."

"How long does a full rollout take?"

"Three days for a high-risk change. One day for low-risk. Emergency rollbacks are complete in under four minutes."

"What's your p99 Stripe latency?"

Tom answered before Maya could. "214 milliseconds."

"That's high," the investor said.

"Our SLA to restaurants is order placement to confirmation in under 5 seconds," Tom said. "214ms for the Stripe call is 4.3% of that budget. The remaining time is Aurora write, SQS message delivery, restaurant tablet push notification. We have headroom."

"What if Stripe has an incident?"

"We use Stripe's asynchronous payment capture. The order is accepted and the restaurant notified immediately. Payment capture happens asynchronously. If Stripe is slow, the order still goes through — the capture retries. If Stripe is fully down, we queue the capture attempt with exponential backoff and alert our on-call. We haven't held an order for Stripe in 14 months."

The investor wrote something. "Do you have any single points of failure?"

Priya answered. "Aurora in a single region is a single-region dependency. We have Multi-AZ for AZ-level failures, and an Aurora Global Database reader already running in us-east-1. A full regional failure would mean failing over to that reader — and the automated regional failover around it is what we're building this quarter. Until then, yes — a us-west-2 regional failure would take Nimbus down."

"Why haven't you built the multi-region failover yet?"

"Because until six months ago, the engineering cost of building it correctly exceeded the business risk of the outage," Priya said. "We've never had a regional AWS failure lasting more than 30 minutes in our operating region. At 287 restaurants — about 4,200 orders a day at a $34 average order value — a 2-hour regional outage costs us approximately $12,000 in GMV. The engineering cost of a correctly implemented warm standby is 3 months of senior engineer time. At our current revenue, the math favored deferring."

"And now?"

"At 947 restaurants and 18,000 daily orders, the same 2-hour outage costs roughly $51,000 in GMV and generates significant reputational damage with restaurant partners who depend on us for their dinner service. The math has changed. The failover project starts next sprint."

The investor looked at the other investors in the room. "She knows her risk profile, too."


**The Four Questions Beneath "It Depends"**

She had asked some version of each of these questions for two years without knowing she was asking the same question in four different ways. The investor session had made it clear. Every choice she'd explained confidently came back to the same four axes.

**1. What is the access pattern?**

How is the data written and read? At what frequency? By how many concurrent users? In what order? By what keys?

This question determines technology selection at the most fundamental level. DynamoDB vs Aurora vs Redshift vs Athena — the right answer depends almost entirely on the access pattern.

**2. What is the scale?**

Not just now — in 12 months, in 5 years. Scale changes the correct answer. What works at 100 requests per day breaks at 100 million. What's overkill at 10 users is necessary at 10,000.

And scale isn't just traffic. It's team size (architecture must be maintainable by the team you have). It's data volume. It's geographic reach.

**3. What is the failure consequence?**

If this breaks, what happens? Does a user see a slow page? Does an order fail? Does money move incorrectly? Does someone's medical record become inaccessible?

The consequence determines how much you invest in reliability. A slow menu page warrants eventual consistency. A failed payment warrants synchronous writes and explicit confirmation.

**4. What is the cost constraint?**

Not just money — also operational complexity (which is itself a form of cost). A solution that requires three additional services may be technically superior to a simpler one but too expensive to maintain with a four-person team.

"Wait — but *why* does the access pattern matter so much?" Maya had asked, two years earlier, when Tom first proposed separating the menu catalog from the orders database. "Can't we just optimize later?"

That question, it turned out, was the beginning of the answer. You cannot optimize a relational schema for key-value access patterns without rebuilding it. The access pattern had to be known at design time, not retrofitted. Every architecture decision she'd made since then had started with the same question.

You might be wondering: if "it depends" is always the right answer, how do you ever make a decision? The answer is that completing the sentence forces you to name the conditions, and once you've named them, you know what information you need. "It depends on the access pattern" becomes "go find out what the access pattern actually is." The four questions aren't a way to avoid decisions — they're a way to make them with the right information.

**"It Depends": How to Complete the Sentence**

The correct way to say "it depends" is to complete it immediately:

*"Should we use DynamoDB or Aurora?"*

"It depends on the access pattern. If you need high-throughput key-based lookups with flexible schema, DynamoDB. If you need transactional consistency across related entities with complex queries, Aurora."

*"Should we use Lambda or EC2?"*

"It depends on the workload characteristics. Lambda for event-driven, short-duration, variable workloads where zero idle cost matters. EC2 or ECS for persistent, stateful, or long-running processes where predictable performance is more important than idle cost."

*"Should we use Multi-AZ or Multi-Region?"*

"It depends on your RTO/RPO requirements and your threat model. Multi-AZ protects against AZ failures (the most common AWS failure mode) and provides RPO ~0 and RTO ~60 seconds for RDS. Multi-Region protects against regional failures (rare) and serves globally distributed users. If you need sub-minute failover from a regional disaster, Multi-Region. If AZ resilience is sufficient, Multi-AZ is much simpler and cheaper."

"It depends" is not the end of the answer. It's the beginning of the real answer.


*"Should we use EKS or ECS for container orchestration?"*

The investor had asked this one before Maya moved to the next slide. She paused.

"It depends on team size, existing Kubernetes expertise, and whether you need Kubernetes-specific features."

"Expand that," he said.

"Kubernetes is a powerful orchestration platform," Maya said. "It has a rich ecosystem — Helm charts, custom resource definitions, multi-cluster federation, advanced scheduling policies. If you have a team that knows Kubernetes, has tooling built around it, and needs those capabilities, EKS is the right choice. You get a managed control plane, but you're still managing the Kubernetes complexity of network policies, pod security, resource quotas, and the rest."

"And ECS?"

"ECS is simpler. No Kubernetes API. No etcd. No pod networking complexity. You define tasks, services, and clusters. IAM integrates natively without requiring additional plugins. The mental model is significantly smaller. For a team that doesn't already know Kubernetes, ECS eliminates months of learning curve."

"Which is Nimbus using?"

"ECS," she said. "We evaluated EKS eighteen months ago. We had one engineer with Kubernetes experience. The others would have needed 3 to 4 months to become productive in a production Kubernetes environment. The features EKS would have given us — multi-cluster management, custom scheduling — we didn't need. ECS with Fargate runs our containers. The team was productive in two weeks."

"Is that the right choice at 50 engineers?" he asked.

"It might not be," Maya said. "At 50 engineers with multiple product teams needing isolated namespaces, custom networking policies, and team-scoped resource quotas — Kubernetes's namespace model becomes genuinely valuable. ECS doesn't have equivalent namespace isolation. At that scale, the Kubernetes learning curve is amortized across a much larger team. The 'it depends' answer shifts."

"At what team size does the shift happen?" he asked.

She had thought about this. "The rule I use: when the operational overhead of Kubernetes becomes less than the organizational overhead of working around ECS's limitations, switch. For a 14-person team, ECS. For a 50-person team with multiple product verticals, probably EKS. The number isn't fixed — it depends on what you're building and who's building it."

"Wait — but *why* would we do it that way?" Maya asked herself, repeating the question she'd learned from two years of building. "Why not just pick one and stick with it?"

Because the right answer changes as the organization changes. An architecture decision made for a 4-person team is not necessarily correct for a 40-person team. The conditions change. The answer changes with them.

"That's the point," she said to the investor. "The correct answer today is ECS. The correct answer in three years might be EKS. We'll revisit when the conditions warrant it. We have an ADR documenting why we chose ECS, and it lists explicitly what would trigger reconsideration."

The investor wrote one more note. "That's a mature way to hold a technical decision."


**Variation: When "It Depends" Gets You in Trouble**

If the access pattern favors key-value lookups and you choose DynamoDB, you'll outperform Aurora at scale — but if you add a feature requiring JOIN queries across three entities, you've built the wrong foundation and will need to migrate under pressure. The "it depends" answer is only as good as your understanding of the conditions you're depending on.

If you optimize for the current scale and the current access pattern, you'll make the right decision for today — but if traffic grows 50x in a year without your architecture adapting, the correct decision for day one becomes the bottleneck for day 365. The four questions must be asked not just at design time but revisited as the system grows.

**The Patterns That Don't Change**

While specific technology choices evolve — new services launch, pricing changes, better alternatives emerge — some underlying patterns have remained stable for decades:

**Separation of concerns**: Components that do different things should be independent. A change in one shouldn't require a change in another. This is why you decouple with SQS, not direct calls. Why you use S3 for objects, not databases. Why the web tier and the database tier are separate.

**Defense in depth**: No single security control is sufficient. You have IAM, security groups, NACLs, WAF, GuardDuty, Secrets Manager, KMS. If one layer fails, the next catches it.

**Pay for what you use, when you use it**: The cloud's fundamental economic principle. Lambda scales to zero. Spot instances use spare capacity. S3 lifecycle policies move cold data to cheaper storage. DynamoDB on-demand charges per request. Tom had asked "How much does that cost per month?" ten thousand times over two years. That question — asked consistently, answered rigorously — had turned into nearly $36,000 in annual savings. The patterns are different; the principle is the same.

**Optimize for the failure that's most likely**: Multi-AZ first (AZ failures happen). Cross-region DR second (regional failures are rarer). Within-AZ redundancy (multiple instances) before cross-region complexity. Build for the realistic failure, not the catastrophic but unlikely one.

**Measure before optimizing**: Tom's approach — pull the CloudWatch metrics, understand the actual pattern, then make decisions — is more valuable than premature optimization based on assumptions. Leo's instinct on the nightly batch jobs — "It'll be fine" — was the most important thing to train yourself out of. It usually is fine, until the one time it isn't, and you haven't measured anything.


**The compounding cost of wrong defaults**.

Tom had another pattern to add to the list, one he had identified only after three months of cost review: the cost of not changing the default.

AWS services are designed to be safe and functional out of the box. The defaults are not designed to be optimal for every workload. gp2 was the default EBS volume type until gp3 launched in December 2020. After that, gp3 became the default for new volumes — but existing gp2 volumes were never converted, because AWS does not modify existing customer resources without explicit action.

The cost implication: every team that created EBS volumes before gp3 and never ran a migration audit paid 25% more per GB for years, not because they made the wrong decision, but because they made no decision. The default persisted, and the cost compounded silently.

This is why the question "wait, but why would we do it that way?" had become the most valuable thing the team asked. It was not always about challenging a decision that was made. Sometimes it was about questioning a non-decision: a default that was accepted without examination.

The pattern generalizes: revisit defaults when AWS launches a new option. gp2 to gp3. On-Demand DynamoDB to provisioned with Auto Scaling when traffic stabilizes. Standard S3 to Intelligent-Tiering when access patterns become uncertain. The revisit does not have to be expensive — an afternoon of analysis per category, quarterly. But it cannot be skipped. The defaults compound.

"Every dollar we are spending on something we chose is an intentional cost," Tom said, in the monthly review. "Every dollar we are spending on something we have not looked at since we provisioned it is a potential default that should be questioned."

"How many of those do we have?" Maya asked.

"Fewer than we did six months ago," he said. "More than zero."

That was the honest answer. It was always the honest answer.


**What This Book Can't Teach You**

Let's be direct about the limits.

This book has taught you:

- What each major AWS service does
- The analogies that make them intuitive
- The trade-offs between alternatives
- The exam knowledge you need for SAA-C03
- A framework for thinking about architectural decisions

This book cannot teach you:

- **Production instinct**: The gut feeling that says "this is going to get weird under load" before you've seen it happen. This comes from operating real systems.
- **Technical judgment under pressure**: Deciding what to do at 3 AM when the system is down and you have incomplete information. This comes from incidents.
- **Stakeholder intuition**: Knowing when to push back on a business requirement because the technical cost is too high. This comes from experience with both the technical and business sides.
- **The right question for the specific context**: Carlos could ask the right questions because he'd seen similar problems dozens of times. This knowledge is earned, not read.

You are not done learning. You have barely started.

**The Exam Is Not the Destination**

You picked up this book to prepare for the AWS Solutions Architect Associate exam. That's valid. The SAA-C03 certification is real, valued, and will open doors.

But the exam tests knowledge and pattern recognition. It doesn't test judgment. It doesn't test operational experience. It doesn't test what you do when the architecture you built stops working at 11 PM on a Friday.

The certification is a beginning credential. When you pass the exam, you'll know how AWS services work and how they combine. You'll have a framework for thinking about architecture. You won't have done it yet.

The next step after the exam: build something real. Deploy it. Operate it. Watch it fail. Fix it. Run out of money in one service and move the cost somewhere else. Get paged in the middle of the night and make a decision with insufficient information.

That's how the knowledge in this book becomes judgment.

**Maya's Final Answer**

At the end of the investor meeting, the technical partner had one more question.

"If you were starting over today, knowing what you know now, what would you do differently?"

Maya took a moment.

"I'd start with infrastructure as code from day one," she said. "Leo deployed the first EC2 instance manually. We spent six months migrating everything to Terraform. That was six months of technical debt that cost us real time."

"What else?"

"I'd be more conservative about managed services early on. We used DynamoDB when a simple RDS database would have been sufficient for months. The DynamoDB access pattern design required experienced thinking we didn't have yet. We redesigned the schema twice."

"So simpler is better early?"

"Simpler is better *always*. The question is always: what's the simplest thing that solves the actual problem, not the anticipated future problem? We added complexity to solve problems we didn't have yet. Some of that complexity caused its own problems."

The technical partner wrote that down.

"Last question," he said. "What's the most important thing you know about building on AWS that you didn't know when you started?"

Maya thought about the two years. The incidents. The cost reviews. The Well-Architected review. The architecture decisions made under pressure and the ones made carefully. The ones they got right and the ones they had to redo.

"That the cloud doesn't solve architecture problems," she said. "It amplifies them. A bad decision on-premises might cost you a week. A bad decision in the cloud can cost you money every month, at scale, until someone notices."

She paused.

"The cloud makes good decisions scale. And bad decisions too."

That evening, Maya told Tom, Priya, and Leo about the investor session.

"He asked about the database choices," she said. "All of them."

"How much does that cost per month?" Tom asked immediately, which was exactly the wrong question and also the right one. "Did he ask about the cost model?"

"He did. I explained the Savings Plans, the DynamoDB switch to provisioned. He nodded."

"And what if someone tries to break in?" Priya asked. "Did the security questions come up?"

"IAM, encryption, GuardDuty. Yes. He seemed satisfied."

Leo had been quiet. "Did he ask about the parts that didn't go well?"

"He asked what I'd do differently. I told him about starting with infrastructure as code, and being more conservative about managed services early."

"The DynamoDB schema we redesigned twice," Leo said. "I always felt like that was on me."

"It was on all of us," Maya said. "That's the point."

**Closing**

You've learned a great deal. The AWS services. The trade-offs. The patterns.

Now do something with it.

Build something. Make mistakes on purpose. Read post-mortems (they're public — AWS, Cloudflare, GitHub, Stripe all publish them). Work with teams that are better than you at the things you're weakest at.

The SAA-C03 exam will test whether you know the material. Your career will test whether you can apply it.

Both are worth doing. Neither is the final destination.

There is no final destination in this field. There is only the next problem, the next decision, and the habit of asking the right next question.

**The Lessons That Didn't Make the Slide Deck**

On the train back from Seattle, Maya told Leo and Priya about two things she had been glad the investor hadn't asked about directly — because the honest answers would have taken twenty minutes each.

**The analytics pipeline incident**.

Eight months earlier, the analytics pipeline had been coupled to the main order processing service. Order events were written to the same SQS queue that the analytics pipeline consumed. The coupling had seemed reasonable: analytics needed order data, order processing produced order data.

On a Wednesday evening, a bug in the analytics aggregation Lambda caused it to stop consuming from the queue. The queue depth grew. Because the order processing service shared the same SQS queue for its confirmation messages, both the analytics pipeline and the order confirmation path were backing up simultaneously. Restaurant partners started seeing confirmation delays. The SQS queue was approaching its message retention limit.

"I already deployed the fix," Leo had said, at 11 PM that night — and then stopped. The fix for the analytics bug would require a Lambda redeployment that would clear the queue, but he hadn't checked whether the order confirmation messages in the queue were still within their visibility timeout. If the timeout had expired, the Lambda would reprocess them, and restaurant partners would receive duplicate order confirmations.

The incident had lasted three hours and required two rollbacks.

The architectural lesson was simple: analytics and operational processing should never share the same queue. They have different performance characteristics, different failure modes, and different consequences when they fail. Coupling them meant a failure in the lower-priority path could degrade the higher-priority path.

After the incident, Nimbus separated the pipelines completely. Order events went to a dedicated operational queue. A separate EventBridge rule duplicated events to an analytics-only queue. The two pipelines had no shared infrastructure except the event source. The next time the analytics Lambda had a bug — and it did, two months later — it failed silently, the analytics queue backed up, the morning reports were late, and the order confirmation path was completely unaffected.

"Separation of concerns," Priya had said, after the second analytics Lambda bug. "Same principle at the infrastructure level as at the code level. Two things that fail differently should not share the same failure domain."

**The premature abstraction.**

Three months before the Series A, Leo had proposed building a generic restaurant configuration service. Nimbus had three types of restaurant-specific configuration at the time: menu settings, delivery zone parameters, and notification preferences. A generic configuration service, Leo had argued, would let them add new configuration types without building new storage and retrieval logic each time.

The team had built it. Two weeks to design the data model. One week to implement the service. Another week to migrate the three existing configuration types into it. Four weeks total.

By the time they finished building the generic configuration service, they had... three configuration types. The same three they'd had before. The generic service added no new capability; it just made the existing capability harder to understand. The key-value schema that made the service "generic" also made it impossible to add validation or type constraints without building a schema registry on top of it.

"We built a framework for a library," Tom said, when he told the investor story to Leo.

"What does that mean?" Leo asked.

"We had three books. We built a library management system to organize them. It would have been better to just put the three books on a shelf."

The configuration service had been quietly deprecated eight months later, when the team grew large enough that four engineers had spent non-trivial time learning how it worked before discovering it was a thin wrapper around a DynamoDB table. They migrated back to direct DynamoDB access with typed schemas per configuration type in two days.

"Four weeks building it," Tom said. "Two days undoing it. Plus the ongoing cost of explaining it to every new engineer."

"What was the right call?" Priya asked.

"Build the configuration service when you have more than ten configuration types and the pattern is clearly stable," Tom said. "Not when you have three and you're speculating about future needs. The abstraction was premature. The needs it was designed for didn't materialize."

"Have we thought about what happens if we build abstractions before we understand the problem space?" Priya asked.

"We just described it," Tom said. "You spend time maintaining an abstraction that costs more than the problem it was solving."

Maya added this to her mental model of architectural anti-patterns: the generic service built for three use cases. The coupled pipeline. The right-sizing decision made on an insufficient observation window. Each was a decision that made sense locally, in the moment, with the information available. Each turned out to be wrong in ways that became visible only later.

"The ones that look fine on paper," she said to Priya, "are the ones that cost you the most."

"Because you don't revisit them," Priya said. "You look at the design, it's coherent, the logic holds, and you move on. The failure mode is invisible until the system is under a load or a stress that the paper version never modeled."

"That's why the architecture review matters," Maya said. "Not because the reviewer knows more. Because they'll ask the question you didn't think to ask."


## Summary

The investor meeting had gone well. Not because Maya had memorized every service's pricing structure, but because she could answer *why* for every choice Nimbus had made. The "it depends" answers she'd given were precise, conditional, and grounded in the same four questions she'd been asking, in various forms, for two years.

- **"It depends" is the beginning of the answer**, not the end. Always complete the sentence with the conditions it depends on.
- The four questions beneath every architecture trade-off: access pattern, scale, failure consequence, cost constraint.
- The patterns that endure: separation of concerns, defense in depth, pay for what you use, optimize for the likely failure, measure before optimizing.
- **The cloud amplifies decisions** — good ones and bad ones. A bad decision on-premises costs a week; a bad decision in the cloud compounds monthly, at scale.
- The SAA-C03 certification tests knowledge and pattern recognition. Production experience turns that knowledge into judgment.

## Exam Tips

*SAA-C03 Domain: Cross-domain — all domains*

This chapter closes the exam content of this book. Before you sit the exam:

**Review the services you're least confident about**:

- For most people: Kinesis vs SQS (the stream vs queue distinction)
- VPC networking (route tables, subnets, NAT Gateway, Internet Gateway)
- IAM policy evaluation logic (explicit deny > explicit allow > implicit deny)
- Storage class selection (know all eight S3 storage classes and their trade-offs)
- RDS vs Aurora vs DynamoDB for specific use cases

**Know the exam's typical scenario structure**:

The SAA-C03 presents a business requirement ("the company needs 99.99% availability") and asks you to identify the architecture that meets it. Always read the requirement, identify the key constraint, and eliminate options that don't meet it.

**Practice distractor identification**:

Every wrong answer on the exam is wrong for a specific reason. Learning to identify *why* each wrong answer is wrong is more valuable than memorizing correct answers.

**The exam rewards pattern recognition**:

- "Decouple" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Global low latency" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Compliance/auditing" → CloudTrail, Config, Security Hub, Macie
- "Cost optimization" → Spot Instances, Savings Plans, lifecycle policies, right-sizing

**You are ready**. Not because this book covered everything — nothing does. But because you understand the principles well enough to reason your way to the answer even when you don't immediately recognize the exact scenario.

## Exercises

**Final Exercise**

There are no more structured exam questions after this chapter.

Instead: one open question.

What system would you build today, knowing what you know?

Write it down. Sketch the architecture. Identify the services. Note the trade-offs you would make and why. Anticipate the failure modes.

Then build it.

That is the assignment. There is no due date. There is no grade. There is just the work.

## Post-Credits Scene

The investment came through.

Series A. $4 million. Enough to expand to five new cities, triple the engineering team, and build Nimbus Instant.

That evening, Maya was at her family's restaurant. The original one. The one where Nimbus started, when she realized they were losing orders because the phone was always busy.

She ordered arepa — the same dish she always ordered.

While she waited, she opened her laptop and read the first chapter of this book.

*"Where does a website live?"*

She remembered not knowing the answer.

She smiled.

She closed the laptop.

The food arrived.

It was perfect.

In the next chapter: what changes when the job is no longer to build the system — but to be responsible for it.
