# Chapter 1: Why Rent When You Could Own?

The notebook was open on the table, and Tom had crossed the same line out three times.

He had been up late. The question wouldn't let go. Around midnight he had written it down in full, then underlined it, then drawn a box around it, and then crossed it out because writing it down hadn't made it any clearer. He had written it again in the margin.

When Leo and Priya arrived the next morning — coffee in hand, arguing about something unrelated — Tom was already at the whiteboard. The third option was still there, untouched. A cloud shape, drawn by someone who'd admitted they didn't know what it meant.

The restaurant's ordering problem had crystallized something real. Maya had declared the cloud as the path forward. That decision was made. What remained was the question Tom couldn't shake, sitting in the margin of his notebook: if renting was the answer, why was it cheaper than owning?

"I need someone to explain something to me," Tom said, without turning around. "If we rent computers from Amazon instead of buying our own — why would that be *cheaper*?"

The room went quiet. It was the kind of question that sounds simple and isn't.

"Because," Leo started.

"No," said Tom. "I want to understand it. Not just hear the answer. Why is renting cheaper than owning?"

Leo sat down. He set his coffee on the table. He actually thought about it.

"Because," he said again, more carefully this time, "we'd be buying for the worst case. The biggest Friday night, the viral moment, the launch event. But most of the time it's not that busy."

"Right," said Tom. "Keep going."

"So we'd be paying for capacity we're not using. Every quiet Tuesday. Every Monday morning. We'd have a server sitting there, using electricity, doing almost nothing."

"And if we rent instead?"

"We pay for what we use," Leo said. "When it's quiet, we pay almost nothing. When it's busy, we pay more. But we never pay for capacity that's just sitting there."

Tom looked satisfied. Not because the answer was new to him — he'd worked it out the night before. But because saying it out loud made it real. He picked up his notebook and crossed out the question one final time.

That was the foundation. Everything else in this chapter builds on it.

**The Obvious Problem With Owning Servers**

Imagine you decide to open a restaurant. Not the Nimbus kind — a regular restaurant.

Before your first customer walks in, you need tables. Chairs. A kitchen. A stove.
Plates. Staff. You need all of this on day one, even if your first week is slow, even
if you spend three months with six customers per day before word gets around.

Physical servers work the same way.

If Nimbus buys their own servers, they have to buy them for the peak they expect.
The busiest Friday night they can imagine. The viral moment where a food blogger
posts about the arepa and ten thousand people try to order at once.

But most of the time, it's not that busy. Most of the time, those servers sit there,
using electricity, doing almost nothing.

"We'd be paying for capacity we're not using," Maya said.

"Exactly," said Tom, which surprised everyone because he was the one who'd asked
the question.

**The Real Cost of Hardware: Tom's Spreadsheet**

Tom had built a proper cost model by the time the team met. He walked them through it.

He had actually priced real hardware. A Dell PowerEdge R550 — a mid-range server capable of handling several hundred concurrent users — ran about $8,000 configured with enough RAM and storage for a production web application. That's one server. For redundancy (so that one failure didn't take down the whole system), you'd need at least two. Sixteen thousand dollars before you started.

The $2,000 whiteboard estimate was optimistic. Production hardware cost more. You needed enough memory for the application and the database to run simultaneously. You needed RAID for storage redundancy. You needed a network interface card fast enough to handle real traffic. By the time you configured a real production server, the $8,000 number was not an exaggeration.

"Two servers: $16,000," Tom said, writing it down.

Then the ongoing costs. Power: a server running 24/7 at 400 watts consumed about 3,500 kilowatt-hours per year. At $0.12 per kWh, that was roughly $420 a year, per server. Times two: $840 a year just in electricity.

Then internet. A business connection fast enough to handle real traffic — not the residential Wi-Fi the restaurant currently used, but a business-grade symmetric fiber connection with a service level agreement — ran $200 to $400 a month. That was $2,400 to $4,800 a year.

Then hardware lifecycle. Servers lasted three to five years before they became too slow or too unreliable to run a production workload. After year four, you were running on hardware that couldn't be patched against certain vulnerabilities and that your server vendor no longer supported. So you amortized the upfront cost: $16,000 over four years was $4,000 a year in capital depreciation.

Then the costs nobody wrote down: a UPS (uninterruptible power supply) battery backup to survive brief power outages, roughly $400. A managed network switch, $300. A firewall appliance with proper security features, $500 to $2,000. Spare hard drives on the shelf for the inevitable failure, $200. Cooling — if the servers lived in the restaurant's back office, someone needed to account for the heat they generated, which meant either a dedicated air conditioning circuit or a surprise electricity bill.

Add it all up: somewhere between $8,000 and $12,000 per year in capital depreciation and ongoing costs, before you paid anyone to maintain, configure, or fix the hardware. And "maintenance" wasn't just a line item — it was an expertise requirement. You either hired someone who knew how to run servers, or you were the person running them at 2am when something went wrong.

"And when it breaks," Tom said, "we don't know how to fix it. We'd pay someone emergency rates. And while we're waiting for them, the restaurant is dark."

"Compare that to AWS," Tom said. He pulled up the EC2 pricing page. A `t3.medium` instance — enough compute for Nimbus's starting workload — ran about $30 per month. Two of them, for redundancy, was $60 a month, or $720 a year.

Four thousand dollars a year in depreciation versus $720. The difference wasn't close. Even if you added networking, data transfer, and a managed database service on AWS, the cloud bill for a startup-scale workload was a fraction of the physical hardware cost.

"But," Tom said, because Tom always had a but, "we should be honest about when it stops being this clear-cut."

He was right. At enormous scale — thousands of servers, constant utilization — the economics shift. A company running 5,000 servers at 90% utilization around the clock might find that owning hardware is cheaper per unit than renting at those volumes. Large companies sometimes reach this point. Startups almost never do. For a startup with unpredictable growth, no hardware expertise, and uncertain scale, the cloud math was obvious.

**The Rental Model**

Here's what makes cloud computing different.

When you use AWS, you don't buy servers. You rent computing power, and you pay only
for what you use. It's closer to renting a venue than owning a restaurant building.

Think about it this way.

If you need to host a birthday party for fifty people, you could buy a house big
enough for fifty people and their tables and their chairs. Or you could rent a venue
for four hours on Saturday, pay for exactly the space and time you need, and hand
the keys back when the party's over.

The venue is still there when you need it. It's available again when something else
comes up. You didn't have to hire a building manager. You didn't pay property taxes
for it all year.

But here's the part the analogy doesn't capture fully: with AWS, the "venue" can grow or shrink to fit your party. If fifty people showed up and then two hundred more arrived unexpectedly, the venue would expand to accommodate them. If the party ended early, the venue would contract and you'd stop paying for the extra space immediately.

No venue rental works like that. Cloud computing does.

That's the cloud model. AWS has the "venues." You show up when you need them.

There's a second analogy that gets at a different part of the picture.

Imagine you're a startup that needs professional photography. You could hire a full-time photographer — salary, equipment, benefits, office space, the whole package. Or you could hire a photographer by the hour when you need one, pay for the work done, and let them go when the shoot is over.

The on-demand photographer costs more per hour than a salaried one. But unless you need photography every hour of every day, the on-demand model is dramatically cheaper in total. And you get to hire a different specialist for different jobs — a portrait photographer for headshots, a product photographer for catalog shots — without maintaining headcount for both.

Cloud computing has this same economics of specialization. AWS maintains teams of specialists for every layer of infrastructure: networking engineers, database administrators, security researchers, hardware procurement experts. You access the output of their expertise — a reliable database, a secure network, a well-configured server — by the hour, without hiring any of those specialists yourself.

You might be wondering: if renting per-hour is more expensive than buying outright per unit, how does the economics work? The answer is utilization. A physical server you own sits at 9% CPU on quiet Tuesdays. A cloud server you rent for the hours you actually need runs at whatever utilization the workload demands, and you stop paying when the workload stops. The total you pay for the hours you actually use is less than the total you'd pay for the server sitting idle in the corner.

**But Wait — There's More to It**

"Okay," said Leo, "but what if my venue burns down?"

Good instinct. Dark, but good.

One of the silent assumptions when you own your own servers is that *you* are
responsible for keeping them running. If the server in your office gets knocked over
by a clumsy intern, your website is down. If the building loses power, your website
is down. If the hard drive fails — and hard drives always fail eventually — your
website is down.

AWS operates data centers. Huge, professionally managed facilities with backup power,
redundant network connections, physical security, and teams of engineers whose only
job is to keep those machines running. They have redundant power supplies. They have
backup generators. They have redundant network connections from multiple providers.
They have physical security that most office buildings couldn't approach.

You're not just renting computing power. You're renting reliability.

"How much does that cost?" Tom asked.

We'll get to that. Pricing is its own chapter, and it deserves it.

**Three Things the Cloud Does Differently**

Let's make this concrete. Here are the three core differences between running your
own servers and using a cloud provider.

**1. You pay for what you use.**

No server sitting idle. No upfront purchase. If Nimbus gets zero orders on a Monday
morning, they pay almost nothing. If they get slammed on New Year's Eve, AWS
automatically has the capacity ready.

This model matches cost to value in a way that fixed infrastructure can't. When your
costs track your revenue, financial planning becomes simpler.

There's a term for this in accounting: shifting from capital expenditure to operational expenditure. CapEx is an upfront purchase that you depreciate over time — like buying the Dell PowerEdge. OpEx is an ongoing expense that you pay as you go — like the AWS bill. For a startup with limited capital and uncertain revenue, OpEx is dramatically preferable. You're not betting $16,000 on a demand forecast you can't be sure of.

"Every dollar we don't spend on hardware," Tom said, "is a dollar we can spend on actually building the product."

That's not a trivial point. The upfront hardware cost Tom had calculated — $16,000 for two production-grade servers — represented the kind of capital outlay that makes investors ask uncomfortable questions and forces founders to make hard choices about runway.

**2. Someone else handles the hardware.**

AWS maintains the physical machines. The networking cables. The power supplies.
The cooling systems. Nimbus doesn't hire anyone to do this. They focus on their
application, not on the infrastructure underneath it.

This is worth pausing on. The expertise required to run physical data center
infrastructure is real. Cooling systems, power management, hardware replacement
schedules, network redundancy — these are distinct disciplines. By using AWS, Nimbus
gets access to that expertise without hiring for it.

A systems administrator with the skills to properly maintain production servers earns $80,000 to $130,000 per year. A team that can handle hardware failures, OS-level security, network configuration, and storage management costs more. AWS's services cost a fraction of that — and the operational expertise comes included in the service.

This is the economies of scale argument that AWS makes explicitly. Because AWS runs infrastructure for thousands of customers simultaneously, the per-unit cost of maintaining that expertise is shared across all of them. Each individual customer gets access to world-class infrastructure operations for a bill that's a small fraction of what those operations would cost if they built them alone.

**3. You can scale up — and down — instantly.**

This is the one that takes a while to fully appreciate. With physical servers, scaling
up means ordering new hardware, waiting weeks for delivery, setting it up. With AWS,
scaling up means clicking a button (or having the system do it automatically). And when
you don't need the extra capacity anymore, you scale back down. You stop paying.

The "and down" part is underappreciated. Scaling down on physical hardware means you
still own the hardware, still pay the electricity, still maintain the system. You just
have more than you need. With cloud, scaling down is real — the resources go away, and
the cost goes away with them.

Leo described this as "the part that feels like cheating." He had spent years working around fixed-capacity systems — carefully estimating how much server he'd need, provisioning conservatively, watching the capacity meter, and sometimes being wrong in both directions. The idea that he could add a server, use it for four hours on a Friday night, and remove it — paying only for those four hours — felt wrong in the way that things that are too good to be true feel wrong.

It wasn't too good to be true. It was the business model. AWS makes money when you use their infrastructure. They have every incentive to make that usage as frictionless as possible.

Priya had been quiet during this explanation. She had a question.

"And what if someone tries to break in? Whose problem is that?"

And that's where it gets interesting.

**The Shared Responsibility Model**

This is one of the most important concepts in all of AWS. It's simple once you
understand it, but it trips up a lot of people — including on the exam.

AWS and you share responsibility for security. But each party is responsible for
different things.

**AWS is responsible for the security *of* the cloud.**

The physical data centers. The hardware. The network infrastructure. The hypervisors
that run the virtual machines. If someone breaks into an AWS data center, that's
Amazon's problem. If a physical disk fails and corrupts data, that's Amazon's problem.
If the network infrastructure between availability zones is compromised, that's
Amazon's problem.

**You are responsible for security *in* the cloud.**

Your data. Your application. Your user accounts and who has access to what. The
configurations you choose. If someone steals your password and logs into your AWS
account, that's your problem. If you misconfigure a database to be publicly accessible,
that's your problem. If your application has a vulnerability that allows SQL injection,
that's your problem.

Priya nodded slowly. "So they protect the building. We protect what's inside."

"Exactly," said Maya.

"So if Leo opens a port he shouldn't…"

"Still our problem," Maya confirmed, looking at Leo.

Leo was already typing something on his laptop and pretending not to hear.

You might be wondering: does this mean AWS is ever responsible for a data breach? Only if the breach happens at the physical or infrastructure level — a compromised data center, a hardware failure, a vulnerability in the hypervisor itself. Breaches caused by misconfigured applications, weak passwords, or poorly set access controls are always the customer's responsibility, regardless of how large or reputable the cloud provider is.

**The Airport Analogy**

Here's a second way to think about the Shared Responsibility Model, because it comes up enough on the exam that it's worth two angles.

Imagine an airport.

The airport operator secures the premises — the runways, the terminals, the fences, the screening checkpoints, what happens when someone unauthorized is found near the fuel depot.

But once inside, each airline is responsible for its own operations: its own aircraft maintenance, its own crew procedures, its own passenger manifests. If an airline loses a passenger's luggage or a pilot skips a checklist, that is not the airport's fault. The premises were secured. The airline operating inside them made a bad choice.

AWS is the airport. You are the airline operating inside it. AWS secures the physical structure and the core infrastructure. You secure your data, your access controls, and your application decisions.

This analogy matters because it clarifies where the line sits when things go wrong. "We're on AWS, so it's their problem" is always the wrong answer on the exam, and almost always the wrong answer in the real world.

**The Service Type Matters**

There's one more wrinkle worth knowing now, even if we'll revisit it throughout the book.

The split of responsibility shifts depending on how managed a service is.

For EC2 — the virtual machines you control — you're responsible for patching the operating system. AWS provides the physical machine and the hypervisor. Everything above the OS is yours.

For RDS — the managed database service we cover in Chapter 8 — AWS patches the database engine itself. You don't manage the OS. Your responsibility shrinks to the database configuration, the data inside it, and who has access.

For S3 — the file storage service — AWS manages the infrastructure completely. Your responsibility is access control (who can read and write to your buckets) and the data itself.

The more managed the service, the more responsibility shifts to AWS. This is a key exam pattern: when a question asks who is responsible for something, ask "how managed is this service?" first.

**If Cloud Then Convenience But Not Control**

The cloud model offers real advantages: no hardware to manage, elastic cost, instant scale. But it means trading away something, too.

If you move your infrastructure to the cloud, then you gain flexibility and reduce upfront capital costs — but you give up full control over the underlying machines. You can't physically inspect them. You can't guarantee where in a data center they sit. You depend on AWS's uptime, AWS's maintenance windows, and AWS's incident response when something goes wrong at the infrastructure level. For most teams, that's an excellent trade. For some regulated industries, it requires careful documentation and AWS's compliance certifications. Know what you're trading before you trade it.

## Strengths and Limitations

No tool is perfect. Let's be honest about both sides.

**Why the cloud is great**:

- No upfront hardware costs
- Pay only for what you use
- Scales instantly in both directions
- Professional reliability and physical security
- Access to hundreds of managed services (databases, queues, machine learning, and more)
  without having to build or maintain them yourself
- Global reach: deploying to a new geography is a configuration change, not a hardware
  procurement process

**Where it gets complicated**:

- Costs can be unpredictable if you're not paying attention (Tom's future nightmare)
- You depend on a third party for your infrastructure — if AWS has an outage in your
  region, your service is affected too
- There's a learning curve. AWS has hundreds of services. Knowing which one to use
  requires experience, or a book like this one.
- Data leaving the cloud can be expensive. Moving large amounts of data out of AWS
  costs money. (We'll revisit this in Chapter 30.)
- Vendor lock-in is real for higher-level services. Using a managed AWS database is
  easy to start and harder to move away from. The more AWS-specific services you use,
  the more committed you are to AWS's ecosystem and pricing.

"So we're trading control for convenience," said Tom.

"And trading upfront cost for ongoing cost," Maya added.

"And trading someone else's problem for our own problem, on the security side," said Priya.

"But we're also trading Leo's broken server for Amazon's very-not-broken server," said Leo,
who had apparently been listening the whole time.

He wasn't entirely wrong.

Tom had one more concern.

"If we build everything on AWS and AWS raises prices in three years, we can't exactly
move our database to the restaurant's back room."

"True," Maya said. "But Amazon's price trajectory has generally been downward — they've
cut prices over 100 times since 2006. The risk of lock-in is real, but the actual
historical risk of surprise price increases is low."

"Generally," Tom said. He wrote it down. He would revisit this calculation, as he
revisited all his calculations, on a future Saturday morning with a red pen and a coffee.

**When On-Premises Is the Right Choice**

The cloud wins the Nimbus comparison clearly. But intellectual honesty requires saying when it doesn't win.

**Large companies with stable, predictable workloads** sometimes find that owning hardware becomes cost-competitive with renting once utilization is consistently high. If you're running thousands of servers at 80% utilization around the clock, the economics of ownership look different than they do for a startup with variable traffic. The cloud's pay-per-use model is most advantageous when utilization is variable. When utilization is stable and high, the per-unit economics of ownership can be competitive. This is why some large enterprises run hybrid architectures: cloud for variable workloads, on-premises for stable ones.

**Regulated data environments with strict locality requirements** may have no option but on-premises. Government classified computing environments — systems that handle classified national security information — cannot use commercial cloud providers. The data cannot leave a physically controlled facility. Financial systems in certain jurisdictions have similar requirements. Healthcare organizations processing certain categories of data may face requirements that commercial cloud certifications don't fully satisfy. In these situations, on-premises is not a preference; it's a mandate.

**Extremely low latency, physical proximity requirements** create a third category. Some financial trading systems need sub-millisecond latency between their application and the exchange's matching engine. Co-location in the same physical data center as the exchange — with direct fiber connections — achieves latencies that no cloud region could match. Some scientific instruments — particle accelerators, seismic networks, radio telescopes — generate data that must be processed locally before transmission is feasible. These are real use cases that require physical proximity to hardware.

**Existing long-term contracts** are the most mundane but often most relevant constraint. A company that signed a five-year data center lease in 2022 has a contractual obligation. Moving to the cloud before the lease expires has a real cost — the remaining lease payments — that changes the economics significantly. Architectural decisions don't happen in a vacuum. They happen in organizations with existing contracts, existing hardware depreciation schedules, and existing staff expertise.

"Are any of those us?" Maya asked.

"No," Tom said. "We have no hardware. No contracts. No regulatory mandates. And a team with no server administration experience."

"So cloud it is."

"Cloud it is. But knowing when it's not the answer is part of knowing what you're doing."

None of the on-premises exceptions apply to Nimbus. But they're real, and a good cloud architect knows when to say "the cloud isn't the right answer here." The goal is not to be a cloud advocate. The goal is to be right.

## Summary

The question Tom couldn't shake — why is renting cheaper than owning? — turned out to have a simple answer and a complicated one. The simple answer is utilization: you stop paying for capacity that sits idle on quiet Tuesdays. The complicated answer involves the Shared Responsibility Model, the trade-off between CapEx and OpEx, and a few honest situations where the cloud is actually the wrong choice. Tom was right to ask the question. The answer changed how the team thought about everything that followed.

- The core benefit is pay-as-you-go scaling: you pay only for what you use, and you can scale up or down as needed.
- Tom's cost comparison showed the hardware economics clearly: $720/year for two EC2 instances vs. $8,000–$12,000/year for equivalent physical hardware, before maintenance costs.
- AWS handles the physical infrastructure. You handle your application, your data, and your configurations. This split is called the **Shared Responsibility Model**.
- The Shared Responsibility Model shifts depending on service type — more managed services mean more AWS responsibility.
- The cloud is not always cheaper or simpler — but it removes barriers to starting, and it makes scaling possible in ways that physical servers can't match.

## Exam Tips

*SAA-C03 Domain: Cross-domain — Cloud concepts fundamentals*

- The **Shared Responsibility Model** appears on the exam regularly. Remember: AWS
  is responsible for security *of* the cloud (hardware, data centers, global network).
  You are responsible for security *in* the cloud (data, identities, application config).
- **Critical nuance**: the split shifts depending on the service type. For EC2
  (a virtual machine you control), *you* patch the operating system. For RDS (a
  managed database), AWS patches the database engine. The more "managed" a service
  is, the more responsibility moves to AWS. Exam scenarios will describe an incident
  and ask who is responsible — always ask "how managed is this service?"
- Questions about cloud *benefits* often test CapEx vs. OpEx. On-premises hardware
  is capital expenditure (CapEx — buy once, depreciate over time). Cloud is
  operational expenditure (OpEx — pay monthly). AWS shifts costs from CapEx to OpEx.
- "Elasticity" — the ability to scale up *and down* automatically — is a core cloud
  benefit. You may see it paired with "scalability" on the exam. Elasticity means
  automatic, demand-driven scaling in both directions. Scalability means the system
  *can* grow, but doesn't necessarily shrink automatically.
- The exam may describe a scenario where a company is moving from "purchasing servers" to "cloud." The correct framing: moving from CapEx to OpEx, eliminating upfront costs, gaining elasticity, and shifting infrastructure responsibility to the cloud provider.

## Exercises

**Exercise 1 — Recall**

In your own words: explain the Shared Responsibility Model. Who is responsible for what,
and why does that distinction matter?

*(Hint: Think about Priya's analogy — who protects the building, and who protects what's
inside it.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company is migrating its web application from an on-premises data center
to AWS. The security team is concerned about maintaining compliance with their data
protection policies. A new engineer asks: "Now that we're on AWS, does Amazon handle
all our security requirements?"

Which of the following BEST describes how security responsibilities are divided?

A) AWS is fully responsible for all security once the application is hosted in the cloud  
B) The customer is fully responsible for all security, including physical data center security  
C) AWS manages security of the underlying infrastructure; the customer manages security of their data, applications, and configurations  
D) Security responsibilities are negotiated per account and depend on the customer's service tier

**Hint 1**: Think about what AWS physically controls versus what you control.

**Hint 2**: AWS owns the data centers. You chose what to put in them and how to configure
your application.

**Hint 3**: We introduced a specific name for this division of responsibilities in
this chapter.

**Answer**: C

**Explanation**: The AWS Shared Responsibility Model divides security into two domains.
AWS secures the physical infrastructure — data centers, hardware, and networking.
The customer secures everything they deploy on top of it: their data, their access
controls, their application configurations, and their network settings.

**Why not A?** AWS never takes full responsibility for customer application security.
The moment you configure something, that configuration is yours to manage.

**Why not B?** Customers are not responsible for physical data center security —
that's precisely one of the advantages of using AWS.

**Why not D?** The Shared Responsibility Model is a fixed framework, not a negotiated
arrangement.

*SAA-C03 Domain: Cross-domain — Cloud concepts / Shared Responsibility*

**Exercise 3 — Architecture Challenge** *(Optional)*

A friend is launching a new app and asks for your opinion. They're deciding between
buying two physical servers (one for the app, one for the database) or using a cloud
provider. Their projected traffic is 10–100 users per day, but they have a launch event
in three months that might bring 10,000 users in a single day.

Walk through the trade-offs. Which option would you recommend, and what's the main
reason? What would you give up with your choice?

*(There is no single correct answer. The goal is to practice thinking in trade-offs.)*

## Post-Credits Scene

Three days later, Nimbus had an AWS account.

Leo had created it at 11pm using his personal email address, a credit card he'd had to
borrow from Tom, and an enthusiasm that was, in retrospect, slightly alarming.

"I found something called EC2," he said the next morning, showing his laptop screen.
"It's like a computer you rent. I think I started one."

"You *think*?" Priya asked.

"I mean, I definitely started one." He scrolled down. "I just don't know where it is."

Maya leaned over and looked at the screen.

"Leo," she said. "Why does it say 'Region: ap-southeast-1'?"

"What does that mean?"

"Wait — but *why* would we be in Singapore?" Maya said. "All our customers are on the West Coast."

In the next chapter: the geography of AWS — where the servers actually are, and why it matters.
