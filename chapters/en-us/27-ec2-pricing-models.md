# Chapter 27: Paying for What You Need

Tom made coffee before he opened the billing tab. He always did — some reports were better approached warm. He settled into the chair by the window, mug in hand, the Saturday morning still quiet outside. No pings, no standups. Just the spreadsheet and the numbers.

He opened the tab.

**Recap: From Athena's Insight to the Bill**

The previous chapter's Athena analytics had done something unexpected: by querying the cost and usage reports directly from S3, Tom could finally see not just a total AWS bill, but a breakdown of what each service was actually costing, week by week, over six months. The picture that emerged was clear enough to be alarming. EC2 was the single largest line item, and the pattern was unmistakable — the team had been paying walk-in prices for a hotel they lived in full-time. That realization sent Tom to the EC2 pricing page on a Saturday morning with a fresh mug of coffee and a determination to understand every option before the next monthly invoice arrived.

Tom had reviewed the AWS bill every month since Nimbus started. For the first year, he understood roughly 60% of what he saw. By now, he understood almost everything — except why the EC2 section always made him feel like they were overpaying. The EC2 section was a mix of "On-Demand instances" at various instance types, all priced per hour, all adding up to $2,340/month.

Before he called anyone, he spent an hour going through the instance list himself — not to conclude anything, but to form assumptions he could test.

He saw four r6g.large instances tagged as "api-prod." He saw two c6g.medium instances running the background job processors. He saw a t3.medium labeled "vpn-server" that had been running since month three of the company's existence. He saw a pair of instances tagged "analytics-batch" that showed up at 3 AM and disappeared before 7 AM every night.

He wrote down a column of assumptions:

- API servers: predictable, always running.
- Background processors: probably predictable.
- VPN server: always running, never changes.
- Batch analytics: maybe Spot-eligible?

Then he wrote in the margin: *verify each one before deciding anything.*

That discipline — of separating "what I assume" from "what I know" — was what made Tom's cost reviews useful. He called the others.

"We could just keep paying the walk-in rate," Tom said, when the others joined the call. "But we won't."

"The walk-in rate?" Leo asked.

"On-Demand pricing," Tom said. "It's like booking a hotel room the morning you need it. Maximum flexibility. Maximum price."

"What's the alternative?"

**The Hotel Analogy**

Tom thought about it for a moment. "You know how some people book a hotel room the morning they arrive? That's us right now. There are better strategies — book six months in advance and get a discount, take an unsold room at the last minute for a steep deal, or rent the whole floor if you need the whole floor. Same hotel, four different prices."

Leo looked at him. "And the AWS versions of those are?"

Tom pulled up the EC2 pricing page. "There are four pricing models. And we're only using one."

EC2 pricing maps surprisingly well to hotel room booking strategies:

**On-Demand**: Walk up to the front desk without a reservation. You pay the full rack rate, but you can check out whenever you want. Perfect for unpredictable stays.

**Reserved Instances/Savings Plans**: Book a room for the whole year in advance. You get a significant discount — 30-72% off — in exchange for committing to use it.

**Spot Instances**: Take an unsold room at the hotel's heavily discounted going rate — no haggling, the hotel sets the price based on how empty it is. Up to 90% off. But the hotel can ask you to leave with two minutes' notice if they need the room for a full-price customer. (Years ago you had to *bid* for Spot capacity; AWS retired bidding in 2017 — you simply pay the current Spot price.)

**Dedicated Hosts**: Rent the entire floor of the hotel exclusively for yourself. No sharing with other guests. Significantly more expensive. Required when software licensing or compliance rules prohibit sharing a physical host.

Each model has a use case. The mistake Nimbus was making: using On-Demand for everything, including workloads that ran 24/7 and were entirely predictable.

**On-Demand Instances: Maximum Flexibility, Maximum Cost**

**When to use**:

- Unpredictable workloads (traffic spikes you can't forecast)
- Development and testing (start and stop frequently)
- Short-term workloads (running an experiment for a week)
- First deployment (before you understand your usage patterns)

**When not to use**:

- Steady-state production workloads you know will run for more than a year
- Anything with predictable baseline load

**EC2 Hibernation: Pausing Without Losing State**

One cost optimization technique that doesn't get enough attention is **EC2 Hibernation**. When you stop a regular instance, the RAM contents are gone — the next start is a cold start. The operating system boots, the application initializes, database connections are re-established. For most production web servers, this is fine. For certain workloads, it's expensive.

When you hibernate an instance, the RAM contents are saved to the EBS root volume before shutdown. On the next start, the instance resumes exactly where it left off — processes running, connections established, application state intact — in a fraction of the time a cold start would take. It's particularly useful for long-running analysis jobs that you want to pause overnight without losing state, or for development instances that take several minutes to boot and configure their environment.

"I have a data science instance," Leo said, looking at the printout. "It takes nine minutes to start up. Custom environment, a dozen Python packages, some model weights preloaded. I stop it every night and restart it every morning."

"So you spend nine minutes watching it boot every day," Tom said.

"Yes."

"That's 45 minutes a week of engineering time waiting for an EC2 instance."

"Yes."

"Hibernate it."

With hibernation, Leo's instance paused at the end of the day, saved its RAM to the EBS root volume, and resumed in under 90 seconds the next morning. The analysis sessions continued exactly where he'd left them.

Hibernation requirements: hibernation must be **enabled at launch** — you cannot turn it on for an already-running instance (Leo had to relaunch his data science box from an AMI to get it). Instances must have RAM up to 150 GB (the RAM contents have to fit on the EBS root volume), the root volume must be large enough to hold both the OS and the RAM dump, and the root volume must be encrypted (hibernation saves sensitive in-memory data to disk). Bare-metal instances and instances with more than 150 GB RAM do not support hibernation. One more limit: an instance can stay hibernated for at most **60 days** — after that it must be started, stopped, or terminated; it can't sleep indefinitely.

Tom identified Nimbus's On-Demand instances:

- Web API servers: 4 EC2 instances, running 24/7 for 18 months. *Predictable baseline.*
- VPN server: Always running. *Predictable baseline.*
- Additional API servers for traffic spikes: Unpredictable. *On-Demand is correct here.*

"Wait — but *why* would the spike servers stay On-Demand?" Maya asked. "If we get spikes every Friday, isn't that predictable enough to commit?"

Tom considered it. "The baseline is predictable. The spike is predictable in timing, but not in magnitude. Some Friday nights are 30% above normal; some are 150% above. If I buy Reserved capacity for six instances and a spike only needs two extra, I've over-committed. If I buy for two and the spike needs eight, I'm short and the overflow runs On-Demand anyway. For the burst capacity specifically, On-Demand or Spot is correct — you can't buy a Reserved Instance in real time when traffic starts climbing."

There's a reason the "when not to use" list matters: if you've been running the same instances for six months and you can predict they'll keep running, every month on On-Demand is a month you're paying the walk-in rate for a room you permanently occupy.

**Reserved Instances: The Year-Long Commitment**

**Reserved Instances (RIs)** are a billing commitment — you agree to use a specific instance type in a specific region for 1 or 3 years. In exchange, AWS charges a lower hourly rate.

**Discount tiers**:

- 1-year, No Upfront: ~30-40% discount vs On-Demand
- 1-year, Partial Upfront: ~35-45% discount (pay some now, less per hour)
- 1-year, All Upfront: ~40-50% discount (pay the full year now)
- 3-year, All Upfront: ~55-72% discount (maximum discount, maximum commitment)

**Standard vs Convertible RIs**:

- **Standard**: Locked to the exact instance type and region. Can be sold on the Reserved Instance Marketplace if you no longer need it.
- **Convertible**: Can change instance type, OS, and tenancy during the commitment period. Less discount than Standard (up to ~66% vs 72%).

Tom did the math for the 4 API servers (r6g.large, about $0.101/hour On-Demand):

- Annual On-Demand cost: $0.101 × 24 × 365 × 4 ≈ $3,540
- 1-year All Upfront RI (1 instance): ~$520 upfront (≈41% off)
- 4 instances: ~$2,080 upfront = **about $1,460 saved in the first year**

"We could save almost fifteen hundred dollars in the first year just by committing," Tom said. "How much does that cost per month, exactly — each reserved instance compared to what we're paying now?"

"It's front-loaded," Maya said. "You pay the full year upfront."

"Wait — but *why* would we commit to the Standard RI if the instance types are still evolving?" Maya asked. "What if r6g becomes obsolete next year?"

"We get Convertible RIs if we think we might need to change. Less discount — up to ~66% instead of 72% — but the flexibility to switch instance families during the commitment period."

"And if AWS releases a better instance type after we commit?"

"We check when the RI expires. If the new type is better, we buy a new RI for the next term. The current RI still runs its course at the committed price."

Tom pulled the break-even comparison onto the shared screen so everyone could follow along:

**Three-way comparison: r6g.large, 4 instances, 12 months**

| Option | Annual Cost | Monthly Equivalent | Flexibility |
|---|---|---|---|
| On-Demand ($0.101/hr × 4) | $3,540 | $295 | Full |
| Compute Savings Plan (~34% off 1-yr, $0.27/hr committed) | $2,365 | $197 | High |
| Standard RI, 1-yr All Upfront (4 × $520) | $2,080 | $173 | Low |

"Wait," Leo said. "The RI is cheaper than the Savings Plan?"

"At the same term, yes — that's the price of flexibility," Tom said. "A Compute Savings Plan applies to *any* instance type, size, region, even Fargate and Lambda, so its maximum discount is lower — up to 66% at the 3-year tier. A Standard RI, or an EC2 Instance Savings Plan, locks you to an instance family and pays you for that lock-in with discounts up to 72%. The more freedom you keep, the less AWS discounts."

"What's the break-even for the 3-year RI?"

"3-year All Upfront: about $1,060 per instance, so $4,240 total for all four — that buys 36 months. Monthly equivalent: $118, versus $295 On-Demand. The upfront pays for itself around month fourteen; after that you're in savings territory for nearly two more years."

"So if we decide in month four that we need a different instance family," Priya said, "we're still paying for the original commitment."

"Correct. You can sell Standard RIs on the RI Marketplace, but not always at full value. Convertible RIs can be exchanged but not sold. This is why the Savings Plan is often the safer choice — same principle, less lock-in."

**Savings Plans: The Flexible Commitment**

**Savings Plans** are a newer, more flexible alternative to Reserved Instances. Instead of committing to a specific instance type, you commit to a specific *amount of hourly spend* (in dollars).

**Compute Savings Plans**: Apply to any EC2 instance, regardless of type, size, region, or OS. Most flexible. Up to 66% discount.

**EC2 Instance Savings Plans**: Apply to a specific instance family in a region (e.g., "c6g instances in us-west-2"). More restrictive than Compute, but up to 72% discount (same as RI maximum).

**SageMaker Savings Plans**: Specific to SageMaker ML training and inference.

For Nimbus: Compute Savings Plans for their API servers. They committed to $0.45/hour of compute spend. Any instance type, any size — and the commitment also covers Fargate and Lambda, which mattered for what came next. When they scale up the fleet or change instance types, the Savings Plan still applies.

"This is better than Reserved Instances for us," Leo said. "We're still experimenting with instance types. The Compute Savings Plan gives us the discount without locking us to r6g specifically."

"What happens when we commit to $0.45/hour and only use $0.36 some months?" Maya asked.

"You pay $0.45 regardless," Tom said. "The commitment is unconditional. The Savings Plan applies to whatever usage you have up to the committed amount. Anything above runs at On-Demand rates. The discipline is setting the commitment at a level you're confident you'll always reach."

"And we shouldn't commit to our average — we should commit to our floor," Priya said.

"Exactly. Look at the last six months. Find the lowest week. Commit to 90% of that number. Then review quarterly as we grow."

"Have we thought about what happens if we over-commit?" Priya continued. "We buy a $2/hour plan, then next quarter we optimize and our compute usage drops to $1.50?"

"The $0.50/hour gap becomes waste," Tom said. "We're paying for capacity that no longer exists. That's the risk of setting the commitment too high. The quarterly review is exactly for catching this — if our usage has dropped below the commitment, we know the next purchase should be smaller. One important nuance: a *Compute* Savings Plan follows you to Fargate and Lambda — migrating EC2 workloads to containers wouldn't strand it. What strands commitment is genuinely using less compute, or holding an *EC2 Instance* Savings Plan or RI for an instance family you stopped using."

You might be wondering: why not just always buy Savings Plans at the maximum affordable amount and let AWS sort it out? The answer is that the commitment is a floor, not a ceiling. If you commit $5/hour but only use $3/hour, you pay $5/hour. Every dollar of committed spend that doesn't match actual usage is a dollar wasted. The quarterly review isn't optional — it's what keeps the Savings Plan an optimization rather than an over-commitment.

**Spot Instances: The 90% Discount**

**Spot Instances** use AWS's spare EC2 capacity. When AWS has unused servers, you can rent them at 60-90% below On-Demand price. When AWS needs the capacity back (for On-Demand or Reserved customers), they give you a 2-minute warning and terminate your instance.

You might be wondering: who would design a system around instances that can vanish with two minutes' notice? The answer is: anyone whose work can be restarted from scratch. Batch jobs, analytics, rendering pipelines — none of these require the specific instance that started the work to be the one that finishes it. The 2-minute warning is enough to save a checkpoint, drain connections, and exit cleanly.

The interruption risk is the defining characteristic. Spot Instances are only appropriate for:

- **Fault-tolerant workloads**: If an instance terminates mid-task, the task can restart without corrupting anything
- **Stateless processing**: Image resizing, video encoding, batch analytics, ML training
- **Short-lived batch jobs**: The 2-minute warning is enough to save state and checkpoint
- **Auto Scaling mixed fleets**: Use Spot for the majority of your ASG with On-Demand as a baseline

For Nimbus: Spot Instances made sense for the batch analytics jobs that ran every night (processing the day's order data into aggregated reports). If a Spot Instance is terminated mid-job, the job fails, but it restarts from the beginning on a new instance. The data in S3 is safe.

But Leo found this out the hard way before the team fully understood the pattern.

Three months earlier, he had moved the nightly batch job to Spot without building in checkpoint logic. The first night, the Spot Instance ran fine. The second night, it was interrupted at 4:47 AM — forty-seven minutes into a job that took an hour and twenty minutes to complete. The job failed. The final report for the previous day's orders was missing when restaurant partners logged in that morning.

"I already deployed it — oh," Leo had said, looking at the failed job notification. "I assumed it would be fine. It was fine the first night."

"What happened?" Maya had asked.

"Spot interruption. AWS needed the capacity back, gave us two minutes, instance terminated. The job had no checkpoint. When a new Spot Instance launched at 5 AM to retry, it started from zero. Finished at 6:40 AM. The reports were two hours late."

The fix was straightforward: write intermediate results to S3 every fifteen minutes. Each checkpoint was a complete partial state — enough for a new instance to read the last checkpoint and continue from that point rather than restarting from the beginning.

"Using Spot for the nightly job dropped its cost from $12/night to $2/night," Leo reported, after the fix was in place. "Even with the one bad night, the total cost of running it for three months was less than two weeks of On-Demand pricing."

"It'll be fine," Leo added, "even if it gets interrupted mid-run — right?"

"With the checkpointing in place, yes," Tom said. "Without it, no. The interruption tolerance has to be built into the job, not assumed."

"And what if someone tries to break in?" Priya asked. "The Spot Instance is on shared hardware. If it gets interrupted and a new one launches, is there any data exposure between instances?"

"No," Tom said. "AWS wipes the instance storage on termination. The next customer getting that hardware sees a clean slate. But it's a good instinct — any time you're using shared capacity, it's worth verifying the isolation model."

**Spot Fleet Diversification**

Leo had learned one more thing from the interrupted batch job: when you request a single Spot Instance type, you're betting on the availability of that specific type in that AZ. If Spot capacity for c5.2xlarge in us-west-2a is depleted, your job waits — or fails.

**Spot Fleet** solves this by letting you specify multiple instance types and AZs in a single request. AWS fulfills the fleet from whichever combination has available capacity at the lowest price.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

With a diversified fleet, an interruption in one instance type or AZ affects only a portion of the fleet. The rest continues running. For the Nimbus batch job, running a four-instance Spot Fleet instead of a single large instance meant that even a partial interruption allowed the job to finish — slower, but without the complete restart.

"The diversified fleet also tends to get better pricing," Tom said. "AWS gives you the lowest price across all the types in your fleet. On some nights you're getting c5a at a price lower than c5 because capacity happened to be there."

"How much does that cost per month compared to just using a single instance type?" Tom asked himself aloud — the habit was completely reflexive now. He ran the number. Spot Fleet at mixed pricing averaged $1.80/night versus $2.00/night with a single-type request. Small difference in absolute terms, but the reliability improvement alone justified the change.

"And what if someone tries to break in to the Spot Fleet?" Priya asked.

"Same answer as always," Tom said. "Each instance is isolated from the others. The Fleet doesn't put them on a shared private segment automatically. Your security groups still apply to each instance individually."

Checkpointing had made interruptions manageable, not eliminated. The job still restarted from the last checkpoint, and if the restart coincided with a period of Spot price spikes, the replacement instance might take 10 to 20 minutes to become available. Work already covered by the last checkpoint was skipped on restart; work since then was redone. Total rework overhead: small, but real.

The Spot Fleet solved the availability problem cleanly. By specifying five instance types across three AZs, Leo reduced the probability of a complete capacity gap to near zero. AWS's allocation strategy — diversified — distributed the four-instance fleet across the pools, so no single pool's interruption could halt the job. When one instance was interrupted, the remaining three continued processing, and the checkpoint meant the replacement instance picked up only the work the interrupted one had been mid-processing. End-to-end, the job never missed its 7 AM report deadline again.

"What did the diversification cost in complexity?" Maya asked, when Leo documented this.

"Three extra lines in the Spot Fleet request," Leo said. "The processing code doesn't know or care which instance type it's running on. The complexity lives entirely in the fleet configuration, not in the application."

That was the advantage of designing the application to be stateless from the beginning: scaling and fault-tolerance decisions became infrastructure decisions, not code decisions.


**Dedicated Hosts: The Compliance Option**

Some software licenses (Oracle, Windows Server in some configurations) are priced per physical socket or core. When you run this software on a shared host (the default for EC2), you might be paying for capacity you're not using.

**Dedicated Hosts** give you access to a physical server entirely for your use. You can bring your existing per-socket licenses. No other AWS customer's instances run on the same hardware.

Dedicated Hosts are significantly more expensive than standard EC2. They're a compliance and licensing tool, not a cost optimization tool.

Nimbus had no licensing requirements that needed Dedicated Hosts. Most cloud-native applications don't.

**Variation: When the Commitment Backfires**

If your workload is predictable and stable for 12 months, Reserved Instances deliver the maximum discount — but if your instance type needs may change significantly during that period, that lock-in will cost you flexibility worth more than the price delta. Convertible RIs solve some of that, but at a reduced discount. Compute Savings Plans solve most of it, at a slightly lower maximum discount than Standard RIs.

If you use Spot Instances for fault-tolerant batch jobs, you can achieve 60-90% savings — but if the same instances serve live user requests, a mid-request interruption means failed transactions and unhappy customers. The workload's tolerance for interruption is the deciding variable.

There is a subtler wrong-choice case: over-committing a Savings Plan. If you buy a $3.00/hour Compute Savings Plan because your compute usage averaged $3.00/hour last quarter, then optimize your services this quarter (dropping total usage to $1.80/hour), you pay the committed $3.00/hour regardless. The $1.20/hour gap is waste. (Note that moving EC2 workloads to Fargate or Lambda would *not* strand a Compute Savings Plan — it covers all three. The stranding risks are real usage reduction, or family lock-in with EC2 Instance Savings Plans and RIs.) This is why the floor strategy matters: commit to your minimum, not your average. And review quarterly.

The rule: commit to what you're certain about. Use On-Demand for what you're not. Use Spot only for what can survive a hard stop.

**Building a Mixed Fleet**

The mature approach: use multiple pricing models together.

For Nimbus's API fleet:

- **Baseline load (4 instances, always running)**: Covered by Savings Plan commitment
- **Predictable peak (2 additional instances during business hours)**: Covered by Savings Plan if the commitment covers them, otherwise On-Demand
- **Traffic spike overflow**: Spot Instances (acceptable because the API servers are stateless — requests redistribute if an instance terminates)

The result: a fleet that optimizes cost at every layer — committed pricing for the predictable part, On-Demand for unpredictable growth, Spot for burst capacity.

**Monitoring Savings Plan Utilization**

Buying a Savings Plan is not the end of the work. It's the beginning of a recurring obligation: knowing whether the commitment is being earned.

Tom set a calendar reminder for the first Monday of each quarter: Savings Plan utilization review. The tool was AWS Cost Explorer. Specifically, the "Savings Plans" tab under "Reservations and Savings Plans," which showed three numbers he cared about:

- **Utilization rate**: What percentage of the committed spend was actually matched by eligible usage? A number below 100% meant he was paying for commitment that wasn't being used.
- **Coverage rate**: What percentage of eligible EC2 usage was being covered by the Savings Plan, versus running at On-Demand rates? A number below 80% meant there was uncovered usage that a larger commitment would capture.
- **On-Demand spend**: The portion of EC2 spend not covered by any Savings Plan. If this was growing, either the Savings Plan was under-sized or new workloads had been added outside the commitment's scope.

At the first quarterly review, the numbers looked like this:

- Utilization: 97%. Three percent of the committed spend was going unmatched — $9.90 per month on a $330/month commitment. That was acceptable; it meant the commitment was set slightly above actual floor usage, which was intentional.
- Coverage: 84%. Sixteen percent of eligible EC2 usage was running On-Demand. That was the burst capacity — the overflow instances that spun up during traffic spikes and weren't covered by the commitment.
- On-Demand EC2 spend: $147/month. Spot Instances (not covered by Savings Plans, priced separately) accounted for most of the rest.

"The 97% utilization is healthy," Tom said. "It means we're not over-committed. If this were 80%, I'd know we had over-purchased."

"And 84% coverage?" Maya asked.

"That's fine too. The 16% that's On-Demand is the burst capacity — instances that run for hours during peak, not all day. We'd need to buy significantly more Savings Plan commitment to cover them, and they might not justify it." He ran the math: the uncovered On-Demand instances were running maybe 40 hours per month at $0.101/hour per instance. Covering them with a Savings Plan would require a commitment we'd be under-utilizing 90% of the time. Better to leave them On-Demand.

At the second quarterly review, six months in, one metric had changed: On-Demand EC2 spend had grown to $290/month. The Nimbus Instant feature had launched, and several new background service instances had been added without Tom noticing.

"These three instances," Tom said, pointing at the Cost Explorer breakdown. "They've been running On-Demand for three months. If they're going to keep running, we should add them to the Savings Plan commitment."

The quarterly review had caught it. Without the review, those three instances would have continued at walk-in rates indefinitely.

"How do you adjust the commitment?" Priya asked.

"You purchase a new, additional Savings Plan on top of the existing one," Tom said. "Savings Plans stack. I'd add a $0.10/hour Compute Savings Plan for the new baseline. The existing $0.45/hour plan continues until its three-year term ends. The new plan starts its own three-year term."

"So we'd have two overlapping Savings Plans."

"Yes. They apply independently to whatever eligible usage exists. AWS matches them in order of most beneficial to least beneficial."

"Have we thought about what happens if we sell one of those background services next year?" Priya asked. "We've committed to $0.55/hour for three years."

"That's the risk of the three-year term," Tom said. "Which is why the new commitment is smaller — I'm committing to the floor of the new workloads, not the average. If we decommission one service and the usage drops, the remaining services should still consume the full committed amount."

The discipline of quarterly review wasn't glamorous. It was fifteen minutes in Cost Explorer, three numbers checked, a decision made or deferred. But over three years, that discipline was the difference between a Savings Plan that delivered 90%+ utilization — genuine savings — and one that drifted into partial waste as the infrastructure evolved around it.

## Strengths and Limitations

**On-Demand**: No commitment. Full price. Use for unpredictable or short-term workloads.

**Reserved Instances**: Up to 72% discount. Locked to specific instance type/region/OS. Sell unused capacity on the RI Marketplace.

**Savings Plans**: Up to 66-72% discount. More flexible than RIs (Compute Savings Plans apply to any instance type). Automatic application to matching usage.

**Spot Instances**: Up to 90% discount. Risk of 2-minute interruption. Only for fault-tolerant, stateless, interruptible workloads.

**Dedicated Hosts**: Full physical server. Most expensive. Required for certain licensing or compliance scenarios.

## Summary

Tom spent the rest of Saturday mapping every Nimbus workload to its ideal pricing model — baseline to Savings Plans, nightly batch jobs to Spot, unpredictable overflow to On-Demand. The exercise turned three months of paying the walk-in rate into a deliberate strategy. The numbers, once calculated, were hard to ignore.

- EC2 pricing has four models: **On-Demand** (full price, no commitment), **Reserved Instances/Savings Plans** (committed spend for significant discount), **Spot** (spare capacity at 60-90% off, interruptible), **Dedicated Hosts** (physical server exclusivity).
- **Savings Plans** are generally preferred over Reserved Instances for flexibility.
- **Spot Instances** require fault-tolerant, stateless workloads — only for batch jobs, ML training, and interruptible processing.
- **Checkpointing to durable storage** (S3) is required for Spot-based batch jobs — interrupted jobs should resume from the last checkpoint, not restart from zero.
- **Spot Fleet diversification** across multiple instance types and AZs reduces interruption risk and often yields better pricing.
- The optimal strategy is a **mixed fleet**: Savings Plans for baseline, On-Demand for unpredictable growth, Spot for interruptible batch work.
- Review pricing models when workloads have been running steadily for 3+ months — that's when On-Demand starts being waste.
- **Review Savings Plan commitments quarterly** — commit to your floor, not your average, and adjust as usage patterns change.

## Exam Tips

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.2)*

- **Savings Plans vs Reserved Instances**: Savings Plans are more flexible (apply to any EC2 instance for Compute Savings Plans). Reserved Instances lock to a specific instance type. Exam scenarios: "need maximum flexibility while still getting discounts" → Savings Plans. "Know the exact instance type for 3 years" → Standard RI for maximum discount.
- **Spot signals**: "cost-sensitive," "fault-tolerant," "batch processing," "can handle interruptions," "stateless workloads," "ML training" → Spot.
- **Spot interruption handling**: Spot instances get a 2-minute warning before termination. Your application must handle this gracefully (save state, drain connections, exit cleanly).
- **On-Demand vs Spot for web servers**: Web servers serving live user traffic should NOT use Spot (interruption causes failed requests). Use On-Demand or Savings Plans for the web tier.
- **EC2 Savings Plans vs Compute Savings Plans**: EC2 Savings Plans apply to a specific instance family and region (higher discount). Compute Savings Plans apply to any EC2 instance, Lambda, and Fargate (lower maximum discount, more flexible).
- **RI Marketplace**: Unused Standard Reserved Instances can be sold to other AWS customers. Convertible RIs cannot be sold.
- **Hibernation:** Saves RAM contents to the EBS root volume on stop; restores them on start. The instance resumes faster than a cold start with all processes and state intact. Use when instance state must be preserved between sessions. Requires: enabled at launch (cannot be added to an existing instance), RAM ≤ 150 GB, encrypted EBS root volume, not available for bare-metal instances; maximum 60 days hibernated. Exam signal: "resume instance quickly with in-memory state preserved" or "development instance takes too long to initialize" → Hibernation.

## Exercises

**Exercise 1 — Recall**

Explain when Spot Instances are appropriate and when they are not. What characteristic makes a workload suitable for Spot?

*(Hint: Think about what happens when the instance is terminated with 2 minutes' notice. Which workloads recover cleanly? Which ones don't?)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A media company runs a video transcoding pipeline that converts uploaded videos into multiple formats. Transcoding jobs run continuously whenever videos are uploaded (24/7 operation, variable volume). Each job takes 5-30 minutes. If a transcoding job is interrupted, the job can be restarted from the beginning without data loss. The company wants to minimize cost.

Which EC2 pricing model BEST meets these requirements?

A) On-Demand instances in an Auto Scaling Group  
B) Reserved Instances (1-year, All Upfront)  
C) Spot Instances with Spot Fleet for automatic instance diversification  
D) Dedicated Hosts with the company's existing media software licenses

**Hint 1**: "Can be restarted from the beginning without data loss" — this is the key phrase that enables a specific pricing model.

**Hint 2**: "Minimize cost" with an interruptible workload points to the maximum-discount option.

**Hint 3**: Spot Fleet requests instances from multiple instance types and AZs, reducing the chance of interruption.

**Answer**: C

**Explanation**: Transcoding jobs are fault-tolerant — they can be restarted if interrupted. This makes them ideal for Spot Instances, which offer 60-90% discount over On-Demand. Spot Fleet diversifies across instance types and Availability Zones, reducing the likelihood of mass interruption.

**Why not A?** On-Demand is the highest-cost option. For a continuously running, fault-tolerant workload, this is wasteful.

**Why not B?** Reserved Instances provide a 50-72% discount but don't offer the potential 90% discount of Spot for fault-tolerant workloads. Also, RIs are for predictable, steady-state workloads — Spot is specifically for interruptible batch processing.

**Why not D?** Dedicated Hosts are for licensing compliance, not cost optimization. They're the most expensive option.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.2*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus's infrastructure has these workloads:

1. API servers: 6 instances, running 24/7, been stable for 2 years, use r6g.large
2. Nightly analytics batch jobs: 4 instances, run 3AM-6AM every night, always the same instance type
3. Testing environment: 2 instances, used by engineers 9 AM-6 PM on weekdays
4. Traffic spike overflow: 0-8 instances, spin up during peak hours, completely unpredictable

Design the optimal pricing strategy for each workload type. What Savings Plan commitment amount would cover workloads 1 and 2? For workload 3, is there a smarter strategy than On-Demand?

*(There is no single correct answer. The goal is to practice EC2 pricing strategy.)*

## Post-Credits Scene

Tom submitted the Savings Plan purchase.

$0.45/hour commitment. Three-year term. Compute Savings Plans for flexibility.

Combined with the Spot fleet for the nightly batch, the estimated savings: $42,500 over three years — just over $14,000 a year.

Maya read the number. "Forty-two thousand dollars."

"Compared to running everything On-Demand, over three years."

"What did it cost to do this?"

"One afternoon of analysis," Tom said. "And the decision to commit."

"Three years is a long time," Leo said. "What if we change instance types?"

"Compute Savings Plans apply to any EC2 instance type. And in three years, we're big enough that this conversation looks different anyway."

Leo thought about that.

"How long have you known about Savings Plans?" he asked.

"Since we started," Tom said. "I was waiting until the workload was stable enough to commit."

"Eighteen months of paying On-Demand while waiting."

"Yes." Tom closed the console. "Sometimes the most expensive thing you do is wait to save money."

In the next chapter: the same discipline applied to storage costs, with a few surprises about what's driving the bill.
