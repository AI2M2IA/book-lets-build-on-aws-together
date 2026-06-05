# Chapter 2: Where in the World Is Your Server?

Stand up. Walk to a window if there's one nearby.

Look outside. Whatever you see — buildings, trees, a parking lot, someone's backyard —
none of that is where your data lives. Your data lives somewhere else entirely. Probably
somewhere you've never been.

That's not a problem. But understanding *where* makes a surprising number of things
click into place.

After the whiteboard session, the decision was made: Nimbus would use AWS. The cloud was the answer. But "the cloud" turned out to be a specific thing in a specific location — and Leo had chosen that location without meaning to.

The next morning, Maya noticed the server was in Singapore.

"Why Singapore?" she asked.

"It was the default," Leo said.

Tom looked up from his coffee. "How much does it cost to run a server in Singapore when
all our customers are on the West Coast?"

Leo didn't have an answer.

Priya already had a different concern. "And who knows what jurisdictions that data is passing through?"

This chapter is about fixing that decision — and understanding why it matters.

**The Problem With "Somewhere"**

When you use AWS, you're not using one data center. You're using a global network of
them. AWS has infrastructure in dozens of countries.

That's a feature, not just a fact. But it means you have to make a choice: *where* do
you want your infrastructure to run?

The choice matters for three reasons:

**Performance.** The closer your servers are to your users, the faster the response.
Physics is non-negotiable. Data travels at roughly two-thirds the speed of light
through fiber optic cables. A round trip from Seattle to Singapore takes roughly 170
milliseconds just in transit — before your application does anything. That same
request from Seattle to Oregon (`us-west-2`) takes roughly 20 milliseconds. The
difference is not a rounding error. For a restaurant ordering app where customers
expect pages to feel instant — and where a single page triggers several round
trips — 170ms of base latency per round trip is the difference between a fast
product and a sluggish one.

Tom pulled up his phone, opened the Nimbus app, and loaded a restaurant page. He timed it with a stopwatch app.

"Almost three seconds," he said.

Leo checked the latency breakdown in the server logs. Just the round-trip to Singapore — nothing to do with database queries — was adding roughly 170 milliseconds per request, and the app made multiple round trips per page.

"And if we move the server to Oregon?" Tom asked.

"Twenty milliseconds," Leo said. "Maybe less."

"How much does that cost per month?"

The pricing difference was a few percent. Not zero, but not the main variable. They moved the server to `us-west-2` that afternoon.

"I already deployed the monitoring agent to the Singapore instance," Leo said, half to himself. "Oh." He paused. "I'll set it up in Oregon instead."

**Compliance.** Some industries have laws about where data can be stored. US healthcare
data may need to stay within the country. Financial data may need to stay within a specific
region. Choosing the wrong Region can create legal problems.

Priya had researched this before anyone asked her to.

"GDPR," she said, looking up from her notes at the next morning's standup. "If Nimbus ever serves customers in the European Union — even one customer — personal data about them may need to stay within the EU or in a country with equivalent protections. That's not optional. That's the law."

"We're a restaurant ordering app," Leo said. "In California."

"For now," Priya said. "Have we thought about what happens if we expand to Europe in eighteen months and realize we've been storing European customer data in Oregon for a year and a half?"

A pause.

"We'd fix it then," Leo said.

"You can't fix retroactive data residency violations," Priya said. "The violation already happened."

She wasn't being dramatic. GDPR fines run up to 4% of annual global revenue. HIPAA violations in US healthcare can reach over $2 million per violation category per year. These aren't hypotheticals — they're the reason that large enterprise cloud decisions start with compliance mapping, not infrastructure configuration.

For Nimbus, the immediate regulatory exposure was low: US customers, no healthcare data, no financial services. But choosing a Region for a business that intends to grow means choosing with the growth in mind.

**Disaster resilience.** If one location has a power outage, an earthquake, or a network
failure, you want your system to survive. Spreading infrastructure across multiple
locations is how you protect against local disasters.

**How AWS Organizes Its Infrastructure**

AWS breaks its global infrastructure into three nested concepts. Think of them like
Russian nesting dolls, from largest to smallest: a big doll that opens to reveal a
medium doll, which opens to reveal a small one. Each layer nested inside the next.

The outermost doll is what AWS calls a **Region**. Inside a Region sits a cluster of
**Availability Zones**. And scattered everywhere across the globe, independent of both,
are **Edge Locations**.

Let's open each one.

**Regions: The Big Boxes**

A **Region** is a geographic area where AWS has a cluster of data centers. Each Region
is named after its location: `us-west-2` is Oregon, `us-east-1` is Northern Virginia,
`eu-west-1` is Ireland, `ap-southeast-1` is Singapore — where Leo's server was hiding.

There are nearly 40 Regions worldwide, and AWS adds more regularly. The list keeps growing
as AWS expands: there are Regions in North America, South America, Europe, the Middle East,
Asia Pacific, and Africa. Each new Region typically announces months before it opens,
includes at least three Availability Zones at launch, and takes a few years before all AWS
services are available in it.

Each Region is completely independent. Data in `us-west-2` stays in `us-west-2` unless
you explicitly move it. This is critical for compliance and for resilience — a major
outage in one Region doesn't automatically affect others. An event that disrupts the power
grid in Northern Virginia doesn't affect Oregon. A natural disaster in Ireland doesn't
affect Singapore. The Regions are genuinely isolated from each other at the physical
infrastructure level.

The independence is so complete that if a Region is experiencing a major outage, even the
AWS management console might load slowly — because the console itself runs in AWS
infrastructure. This is worth knowing: during a real AWS incident, you may find it hard to
access the monitoring tools you need precisely when you need them most. This is part of why
experienced teams monitor their own services independently of AWS's console.

"So we should pick `us-west-2` for Nimbus?" Tom asked.

Yes. For a US business targeting West Coast customers, yes. Lower latency and your users
get faster responses.

"How much more expensive is it than Singapore?" Tom added.

The pricing varies by Region — usually by a few percent. The performance and compliance
benefit of the right Region is worth the small price difference.

**The Region Selection Debate Nimbus Nearly Got Wrong**

Before the team settled on `us-west-2`, there was a brief argument about whether `us-east-1` (Northern Virginia) made more sense. It's the oldest Region, the largest, the one where AWS releases new services first. It's also the cheapest Region on most pricing pages. Tom liked this.

"But our users are in California, Oregon, and Washington," Maya said. "Why would we run our servers on the other side of the country?"

"Cheaper," Tom said. "And more services available."

"Wait — but *why* would we do it that way?" Maya said. "Our users are on the West Coast. Our servers should be on the West Coast. The price difference is what, six percent? Seven? We'd spend more on the extra latency in lost customers than we'd save in compute bills."

She was right. The right Region for a workload is the Region closest to the users who matter most — unless compliance, service availability, or cost differential justifies the trade-off. For Nimbus, none of those did.

This is a decision that feels small and isn't. Teams that choose `us-east-1` because "it's the default" and then serve West Coast users from the East Coast are leaving real performance on the table. The AWS console defaults to `us-east-1` for historical reasons. It's not a recommendation.

**Availability Zones: The Real Redundancy**

Here's where it gets interesting.

Each Region is not a single data center. It's a cluster of multiple, physically separate
data centers called **Availability Zones** (or AZs).

Oregon (`us-west-2`) has four Availability Zones: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. These are real buildings, separated by meaningful distances — far enough
apart that a fire, flood, or power outage in one won't affect the others, but close
enough that the network between them is extremely fast (single-digit millisecond latency).

How far apart is "meaningful distance"? AWS doesn't publish exact coordinates, but independent researchers estimate AZs within a Region are typically separated by tens of miles — far enough to be on different power grids and different fiber paths, not so far that the speed of light becomes a limiting factor for synchronous replication.

This separation is deliberate and important. If two AZs shared the same power substation, a substation failure would take both AZs down simultaneously — eliminating the redundancy. The physical separation ensures that common-mode failures (the kind that affect an entire geographic area) are genuinely rare events rather than foreseeable risks.

This is the architecture that makes AWS reliable at a level no single data center can match.

Priya leaned forward. "So if we run our application across two Availability Zones and
one goes down—"

"The other keeps running," Maya finished.

"Exactly."

Leo, who had been listening quietly: "I deployed everything in one AZ."

"Yes," said Priya. "We noticed."

The concept of spreading your application across multiple AZs — called **Multi-AZ
deployment** — is one of the most important resilience patterns in AWS. We go deep on
it in Chapter 18. For now, understand that AZs exist specifically to make this possible.

One nuance worth knowing: the AZ names (`us-west-2a`, `us-west-2b`, etc.) are not consistent across AWS accounts. What appears as `us-west-2a` in your account may be a different physical data center than what appears as `us-west-2a` in a colleague's account. AWS randomizes the mapping to prevent all customers from deploying to the same physical AZ when they default to "a." If you need to coordinate which physical AZ you're in with another account (for low-latency inter-account communication, for instance), AWS provides AZ IDs — stable identifiers that map to the same physical location across accounts. The named AZs (`2a`, `2b`) are account-relative. The AZ IDs (`usw2-az1`, `usw2-az2`) are physical. The exam tests this distinction occasionally.

**What an AZ Failure Actually Looks Like**

This is not abstract. Let me walk through a real timeline.

It is 2:47pm on a Tuesday. An electrical fault in one of the transformers supplying power to `us-west-2b` causes an outage in that data center. The event is not predicted.

If Nimbus runs entirely in `us-west-2b`:
- 2:47pm: the EC2 instance loses power. The database server loses power.
- 2:47pm: incoming requests to the Nimbus app start failing with connection timeouts.
- 2:47pm: Tom's monitoring alerts fire.
- 2:50pm: Leo begins the recovery process. He launches a new EC2 instance in `us-west-2a`.
- 3:05pm: the database comes back online from a snapshot restore.
- 3:12pm: the application is reconfigured to point at the new database endpoint.
- 3:20pm: Nimbus is serving traffic again.

That's 33 minutes of downtime. During Friday dinner service, 33 minutes could cost thousands in lost orders and the kind of reputation damage that doesn't show up in the incident report.

If Nimbus runs across `us-west-2a` and `us-west-2b` with proper Multi-AZ deployment:
- 2:47pm: the EC2 instance in `us-west-2b` loses power.
- 2:47pm: the Application Load Balancer detects the unhealthy instance via health checks.
- 2:47pm: the ALB stops routing traffic to the failed instance, automatically.
- 2:47pm: traffic continues flowing to the instance in `us-west-2a`.
- 2:48pm: the Auto Scaling Group launches a replacement instance.
- 2:55pm: the replacement passes health checks and rejoins the fleet.

Downtime: zero. Customer impact: near zero. Tom's monitoring fires, but Leo's action is "watch and confirm the recovery completed," not "rebuild everything manually."

This is the difference between Multi-AZ and single-AZ. The AZ boundary is where AWS's redundancy design becomes your application's resilience.

**Multi-AZ Reliability Math**

AWS designs each AZ to be independent — not just physically, but with separate power, cooling, and networking. The probability of two AZs in the same Region failing simultaneously is designed to be extremely low.

If a single AZ has 99.9% availability (about 8.7 hours of downtime per year), then a two-AZ architecture treating failures as independent events has roughly 99.9999% availability for the same failure mode — about 31 seconds of downtime per year from AZ failures.

In practice, the limiting factor for most applications isn't AZ availability. It's the application code, the deployment process, and the database. But the math illustrates why Multi-AZ is the standard baseline: the cost of running across two AZs is modest; the availability improvement is large.

**Edge Locations: Speed, Everywhere**

AZs solve resilience. They don't solve the problem of serving content fast to users in
cities far from your main Region.

Enter **Edge Locations**.

Edge Locations are small, lightweight infrastructure points — over 750 points of
presence spread across 100+ cities worldwide. They're not full data centers — they
can't run your application.
What they *can* do is cache content close to your users.

Imagine a menu image stored on a server in Virginia. Every time someone in Tokyo wants
to see it, the request travels across the Pacific and back. With Edge Locations, AWS can store a
copy of that file in Tokyo and serve it locally — milliseconds instead of hundreds of
milliseconds.

This is the backbone of CloudFront, AWS's content delivery network. We dig into
CloudFront in Chapter 13. For now: Edge Locations are about speed for static content.

You might be wondering: if Edge Locations cache content, do they also store your data permanently? No. Edge Locations hold temporary copies of content to serve it faster — the original always lives in your Region. If the cache expires or the content changes, the Edge Location fetches a fresh copy from the source.

The Edge Location network is separate from the Region and AZ structure. When you think about where your application *runs*, you think about Regions and AZs. When you think about how content gets to your users *quickly*, you think about Edge Locations and CloudFront. They solve different problems and operate at different layers.

AWS also has a related concept called **Regional Edge Caches** — larger caching nodes that sit between your Region and the Edge Locations. If an Edge Location in a city doesn't have a cached copy of a file, it fetches from the Regional Edge Cache rather than going all the way back to your Region. This reduces load on your origin and improves cache hit rates for less popular content. You don't configure Regional Edge Caches directly — they're part of the CloudFront infrastructure that operates automatically.

The practical upshot for Nimbus: when the team adds CloudFront in Chapter 13, menu images that used to travel from Oregon to a customer's browser on every request will instead be served from the nearest Edge Location — Dallas for Texas customers, Atlanta for Georgia customers, Chicago for Illinois customers. The user in Chicago gets their menu image from a server 300 miles away instead of 2,000 miles away. The difference is measurable and meaningful.

**A Caveat About Cached Copies**

There is one detail about Edge Locations worth flagging now, even though the full story belongs to Chapter 13: a cached copy is a *copy*, and copies can go stale. If the original changes in your Region, the Edge Location may keep serving the old version for a while. How long, and what you can do about it, are exactly the kinds of controls a CDN gives you — and exactly what the team will wrestle with when Nimbus actually deploys CloudFront. For now, carry forward just this: content can live close to the user, and "close" sometimes means "slightly out of date."

**Choosing a Region: The Senior Engineer's Checklist**

If Nimbus one day expands to serve users in Mexico and Colombia — a scenario we'll
practice in this chapter's exercises — the Region decision isn't arbitrary. Here is the thinking:

**1. Where are your users?**

Start here. Pick the Region closest to the majority of your users. Latency is the most
direct, measurable impact of Region choice.

The physical distance between a user and a server matters in a way that's easy to
underestimate. A 170ms round-trip to Singapore versus a 20ms round-trip to Oregon is
not an abstract performance metric — it's the difference between a page that feels
instant and a page that feels sluggish. On a mobile device with additional radio
latency, the Singapore penalty compounds further. For a user in San Jose, `us-west-2`
(Oregon) is the right Region before you even consider any other factors.

**2. Are there compliance requirements?**

Healthcare, finance, and government workloads often have strict data residency rules.
Know your regulatory environment before choosing. GDPR requires that personal data from EU residents be stored in jurisdictions with adequate data protection — either the EU itself or a country with an adequacy decision. HIPAA requires documented safeguards for US healthcare data. These are not optional considerations to revisit later.

In practice: talk to your legal team before choosing a Region for any regulated workload. AWS maintains extensive compliance documentation for each Region, including certifications like SOC 2, ISO 27001, PCI DSS, and HIPAA eligibility. But the certifications tell you what AWS has done; your legal team tells you whether that's sufficient for your specific regulatory context.

**3. Which services do you need?**

Not every AWS service is available in every Region. New services launch in `us-east-1`
first. If you need a specific service, verify your target Region supports it.

This is less of a concern for the services in this book — all the major services are
broadly available — but matters for newer services, specialized hardware (some GPU
instance types only exist in certain Regions), and AWS GovCloud (a separate Region
designed for US government workloads with specific regulatory requirements).

**4. What is the pricing?**

Regions vary in price. `us-east-1` (Northern Virginia) tends to be cheapest because of
its scale and age. South America is slightly more expensive. Check the AWS pricing page
before finalizing.

The pricing differential is usually small — a few to ten percent between popular Regions. It's rarely the deciding factor. But for a cost-sensitive workload running thousands of instances, even a 5% price difference compounds over time. Tom would check the number and factor it in, as Tom checked all numbers and factored them in.

**5. Do you need multi-Region?**

For most applications, multiple AZs within one Region is sufficient resilience. For
critical applications where even a regional outage is unacceptable, you design for
multi-Region — but that's a significant architectural commitment. Don't do it
speculatively.

"What's the rule for when we add a second Region?" Leo asked.

"When we have a documented requirement that says 'must remain operational if an entire AWS Region is unavailable,'" Priya said. "Not 'it would be nice.' A specific requirement, with a specific business justification, that we've weighed against the complexity and cost."

"What does that look like in practice?"

"A customer contract with an SLA that requires 99.99% uptime. A regulatory mandate for geographic redundancy. A loss-of-region scenario that we can actually quantify in revenue terms. Not just 'what if us-west-2 goes down.'"

Leo looked at the current Nimbus architecture. They were still on one AZ.

"Multi-AZ first," he said.

"Multi-AZ first," Priya confirmed.

**The Limitation Nobody Talks About**

Regions are powerful, but they create one important tension.

Running in multiple Regions is genuinely hard.

Data replication between Regions has latency. Keeping two Regions in sync — so that a
transaction in Region A is instantly visible in Region B — is one of the hardest
problems in distributed systems. AWS provides tools for it, but it costs money and adds
operational complexity.

Most applications should start with one Region, multiple AZs, and expand to multi-Region
only when they have a clear requirement: regulatory mandates, contractual SLAs requiring
near-zero regional downtime, or a user base genuinely distributed across continents.

Replicating data across regions adds cost — cross-region data transfer is one of the most underestimated line items on an AWS bill. It also adds operational complexity: every write that must be consistent across regions adds latency.

Most failures that affect real applications are not cross-region catastrophes. They're within-region issues like a misconfigured security group or a botched deployment. The dramatic "entire region goes down" scenario makes headlines precisely because it's rare. Invest in multi-AZ before multi-region. Add multi-region when the business case is clear.

To put specific numbers to it: AWS has had a small number of significant single-region events over its history. Full regional outages are genuinely uncommon. AZ-level events — brief outages affecting one data center within a region — are less rare and are exactly what Multi-AZ deployment is designed to absorb. The frequency of AZ events compared to regional events is roughly an order of magnitude higher. Spending architectural effort on the more common failure mode first is the rational choice.

Premature multi-Region architecture is one of the most common and expensive mistakes
junior engineers make when they start feeling confident.

Tom nodded. "So we don't do multi-Region just because we can."

"Not until we need to," Maya said. "And we'll know when we need to."

"How will we know?" Leo asked.

"When your architecture review doc has a requirement that says 'must survive a regional
outage,'" said Priya. "Have we thought about what happens if an entire AZ goes down before we've even set up Multi-AZ? We should fix that first. Until then: multi-AZ."

You might be wondering: how do you verify that your Multi-AZ deployment actually works before you need it? You test it. AWS provides a tool called **AWS Fault Injection Service (FIS)** — formerly Fault Injection Simulator — that can simulate AZ failures, instance terminations, and other fault conditions against your running architecture — so you can observe how your system behaves under failure conditions in a controlled way, rather than discovering the behavior during an actual incident. Testing your resilience architecture is as important as building it. Priya put "fault injection test" in the quarterly architecture review calendar immediately after reading about it.

## When AWS Comes to You: Outposts and Wavelength

Regions and Availability Zones cover the world — but not every problem is solved by moving data to AWS. Some workloads must stay on-premises: manufacturing floor systems that need sub-millisecond latency, healthcare applications with data residency requirements, retail point-of-sale systems in stores without reliable internet. For these, AWS extends its infrastructure to the customer's location.

"Wait — what if we eventually work with a hospital system?" Priya asked. "Their patient monitoring software literally cannot tolerate a cloud round-trip. And it may not legally be allowed to leave the building."

Maya pulled up the AWS docs. Two services kept appearing.

**AWS Outposts**

A fully managed rack of AWS hardware installed in your own data center or co-location facility. Outposts runs the same AWS infrastructure, services, APIs, and tools as the AWS cloud — EC2, EBS, RDS, EKS, S3 on Outposts — but physically in your building.

Use cases: latency-sensitive manufacturing workloads, data residency requirements where data must physically stay in a specific location, applications that need AWS APIs but can't tolerate connectivity gaps to the public cloud.

Key point: Outposts is still managed by AWS. AWS installs it, patches it, and monitors it. You own the rack space and power. The APIs and tooling are identical to the public cloud — the same CloudFormation templates, the same IAM policies, the same CLI commands. The distinction on the exam is physical location, not operational model.

"So it's AWS, but in our customer's building," Leo said.

"Exactly," Maya said. "Same APIs. Different zip code."

**AWS Wavelength**

AWS infrastructure deployed inside telecommunications providers' 5G networks. Wavelength Zones sit at the edge of 5G networks, physically close to mobile users, enabling single-digit millisecond latency for mobile applications.

Use cases: real-time gaming, AR/VR, autonomous vehicle telemetry, live video processing at the 5G edge.

"That one's not for a hospital," Tom said. "That's for someone building the next generation of multiplayer mobile games."

"Or self-driving car telemetry," Priya said. "Anything where a mobile device needs to talk to a server and 50 milliseconds is too slow."

**The difference:** Outposts brings AWS to your data center — your building, your rack, your power. Wavelength brings AWS to the telecom network edge — physically co-located with the 5G radio infrastructure, close to mobile users who never touch your private network.

**AWS Local Zones**

There's a third sibling in this family — and on the exam, it's the most frequently tested of the three. **Local Zones** are AWS infrastructure deployed in large metropolitan areas that don't have a full Region — Los Angeles, Houston, Miami, Lagos, and dozens more. A Local Zone is an extension of a parent Region: you run EC2, EBS, and a subset of other services *in the metro itself*, getting single-digit-millisecond latency to users in that city, while everything else (and all management) stays in the parent Region.

The pattern to memorize — three "edge compute" siblings, three triggers:

- "Single-digit millisecond latency to end users **in a specific city/metro area**" → **Local Zones**
- "Ultra-low latency for **5G mobile devices**" → **Wavelength**
- "AWS services running **in our own data center** / data must stay on premises" → **Outposts**

None of the three is the answer for a typical web application. All of them appear on the SAA-C03 exam as pattern-matching traps: the trigger phrase matters.

## Strengths and Limitations

**Use multi-region and multi-AZ design when**: your application has users in multiple geographies and latency matters; your SLA requires 99.99% or higher availability; regulatory requirements mandate data residency in specific regions; you need disaster recovery with an RTO under one hour.

**The trade-offs are real**: Running in multiple Regions gives you redundancy against regional outages — but at significant cost and complexity.

Remember the cost warning from earlier in this chapter: every byte that moves between regions costs money. In an active-active multi-region setup where writes must be consistent, you're paying that cost constantly.

Operational complexity scales too. Debugging an incident in one region is hard. Debugging a distributed, cross-region incident — where the same request touched infrastructure in two continents — is a different kind of hard entirely.

**The right progression for most applications**: Start with a single Region and multiple AZs. That gives you resilience against the failures that actually happen — AZ-level outages, hardware failures, power events — at a fraction of the complexity of a multi-region architecture. Add multi-region when a specific, documented requirement makes it necessary. Not before.

The common pattern for teams that jump to multi-region too early: the complexity of managing two regions introduces its own failure modes — data synchronization bugs, split-brain scenarios, inconsistent deployments. The very resiliency architecture designed to prevent failures sometimes introduces new categories of failure that wouldn't have existed in a simpler design.

Priya had a document she called "the complexity budget." The idea: every architectural decision that adds operational complexity has a cost, and the organization has a finite capacity to manage that complexity. Spending the complexity budget on multi-region architecture before you've mastered single-region reliability is a poor investment. The complexity should go toward the failure modes you actually face, not the ones that make good disaster recovery stories.

"We have one region, one AZ, and a deployment process that makes Leo nervous every time he runs it," Priya said. "The right next step is multi-AZ, not multi-region."

Tom wrote "complexity budget" in his notebook. He would use that phrase regularly for the next two years.

## Summary

Leo's Singapore accident turned out to be a useful lesson — not because it caused lasting damage, but because it forced the team to understand something that usually gets skipped: where your infrastructure runs is not a cosmetic decision. Physics is non-negotiable. A hundred and seventy milliseconds of base latency per round trip is the difference between a fast product and a sluggish one, and compliance rules about where data lives don't care how fast you moved.

- AWS organizes its global infrastructure into **Regions**, **Availability Zones**, and **Edge Locations**.
- A **Region** is a geographic cluster of data centers. Each Region is isolated — data stays in the Region unless you explicitly move it.
- **Availability Zones** are physically separate data centers within a Region, connected by low-latency networking. Deploying across multiple AZs is the standard way to survive local failures.
- Choose your Region based on user location, compliance requirements, service availability, and price — in that order.
- Multi-AZ is the standard resilience baseline. Multi-Region is for critical workloads with specific, documented requirements — not a default starting point.

## Exam Tips

*SAA-C03 Domain 1 — Task 1.1 / Domain 2 — Task 2.2*

- **Regions are isolated by default.** Data does not replicate between Regions unless
  you configure it. This is important for data sovereignty and compliance scenarios.
- **AZs are the resilience unit for most questions.** When the exam asks how to survive
  a data center failure, the answer involves multiple AZs within one Region.
- **Multi-Region is for regional outage resilience.** If the scenario says "must remain
  operational even if an entire AWS Region fails," the answer involves multi-Region
  architecture.
- **Edge Locations ≠ AZs.** Edge Locations cache content — they cannot run your
  application server. Don't confuse them with data centers.
- The exam frequently tests the relationship between compliance and Region selection.
  If a scenario mentions data residency requirements, Region choice is part of the answer.
- **GDPR and data residency** scenarios on the exam typically point toward keeping data within a specific Region and ensuring cross-region replication is disabled or controlled.
- **Outposts vs Wavelength vs Local Zones:** Outposts = AWS rack in your data center (on-premises, data residency, local latency). Wavelength = AWS in the 5G network edge (mobile users, ultra-low latency). Local Zones = AWS compute in a metro area without a full Region. Exam triggers: "run AWS in your own facility" → Outposts. "Ultra-low latency for 5G mobile users" → Wavelength. "Single-digit millisecond latency to users in a specific city" → Local Zones.

## Exercises

**Exercise 1 — Recall**

In your own words: what is the difference between a Region and an Availability Zone?
Why does that distinction matter when designing a resilient web application?

*(Hint: Think about the two different types of failure each one protects against.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A US healthcare company must store all patient data within a single AWS
Region to comply with internal data residency policies. They are designing a new cloud
application on the West Coast and want to maximize resilience without moving data to
another Region.

Which configuration BEST meets their requirements?

A) Deploy in `us-east-1` and use CloudFront Edge Locations in Oregon to serve content
   faster  
B) Deploy in `us-west-2` in a single Availability Zone to minimize costs  
C) Deploy in multiple Regions including `us-west-2` and `us-east-1` with cross-Region
   data replication  
D) Deploy in `us-west-2` (Oregon) across multiple Availability Zones

**Hint 1**: The policy means data must stay in a single Region. Which options
move data to another Region?

**Hint 2**: Among options that keep data in `us-west-2`, which provides the most resilience?

**Hint 3**: Multiple AZs within a single Region provides resilience without crossing
Region boundaries.

**Answer**: D

**Explanation**: `us-west-2` keeps all data in a single Region, satisfying the policy
requirement. Deploying across multiple AZs within that Region protects against
data center failures without moving data to another Region. This is the correct balance
of compliance and resilience.

**Why not A?** Option A deploys in `us-east-1`, far from the West Coast users — and
CloudFront would cache patient-adjacent content at Edge Locations outside the chosen
Region, violating the residency policy.

**Why not B?** A single AZ has no resilience. If that AZ experiences an outage,
the application fails completely.

**Why not C?** Replicating to `us-east-1` moves patient data to the East Coast,
directly violating the single-Region requirement.

*SAA-C03 Domain 1 — Task 1.1 (global infrastructure, data sovereignty)*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is expanding to serve customers in Mexico and Colombia. Currently everything
runs in `us-west-2`. The team is debating: should they add a `us-east-1` second Region,
or stay single-Region with multiple AZs?

What questions would you ask before deciding? What are the main costs and risks of
adding a second Region? What is the main cost of *not* adding one?

*(There is no single correct answer. Practice the multi-Region trade-off reasoning.)*

## Post-Credits Scene

Leo fixed the Singapore problem. Nimbus moved to `us-west-2`. The latency dropped.
Tom's one follow-up question — "did that change our bill?" — was answered with a
slightly higher number, which he accepted with visible reluctance.

That lasted two days before the next problem.

Leo came to the standup with the expression Maya had learned to recognize: the look of
someone who'd done something they couldn't undo.

"So," he said carefully. "I set up the server. And I needed a way to log in.
So I created a username."

"And?" Priya asked.

"'Admin'."

Silence.

"And the password?"

A longer silence.

"'Admin123'."

Priya stood up.

In the next chapter: how Nimbus controls who can touch what — and what happens when they get it wrong.
