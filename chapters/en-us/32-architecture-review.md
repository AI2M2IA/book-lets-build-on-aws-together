# Chapter 32: Defending the Plan

Carlos was back, a few weeks after the Well-Architected session. This time the laptop stayed in his bag; he picked up a whiteboard marker instead, greeted each person in the room, found a spot near the board, and uncapped the marker.

"Tell me about Nimbus," he said. As if he'd never heard of it.

**Recap: From Review to Reckoning**

The Well-Architected review from Chapter 31 had surfaced three high-risk findings and Maya's growing awareness that there was a gap between the decisions the team had made and the decisions they had *thought through*. The framework had given them a vocabulary for the gap. What it couldn't give them was the practice of closing it in real time — before a feature shipped, not after. That was what Carlos was here for. Maya had invited him specifically because Nimbus was about to build something significant, and she wanted a structured challenge before the first line of production code was written.

A good architecture review is like a pre-flight checklist for a pilot. The plane might look perfectly ready to fly — engines running, fuel full, passengers boarded. But the checklist exists because experienced pilots know that the things most likely to cause problems are precisely the things that feel fine right up until they aren't. The checklist doesn't mean the pilot doesn't know what they're doing. It means they've internalized that even experts miss things when they skip the structured process.

**The Architect's First Move**

What happened next surprised the team.

Maya started to describe the system — EC2 instances, Aurora, CloudFront, ElastiCache, DynamoDB for the menu, VPC with private subnets...

Carlos stopped her gently.

"Start with the business," he said. "Not the technology."

She paused. Then: "Nimbus is a restaurant ordering platform. We have 287 restaurant partners. We process about 4,200 orders per day. Average order value is $34. We're growing 18% quarter-over-quarter."

"Good. What's the most important thing Nimbus must do?"

"Process orders," Leo said.

"Specifically," Carlos pressed.

"An order must reach the restaurant within five seconds of placement," Priya said, "or the kitchen misses the timing window."

"What happens if it doesn't?"

"The restaurant makes a mistake. The customer gets the wrong food, or waits too long. They complain. We lose a restaurant partner."

"So the five-second SLA," Carlos said, "isn't a technical target. It's a business survival requirement."

Silence.

"That," he said, "is why architecture conversations must start with business requirements. The technology is downstream of the constraint."

**The Architecture Review Structure**

A real architecture review — the kind that happens before you build something important, or when you're evaluating whether to scale — has a structure.

Carlos wrote it on the whiteboard:

**1. Understand the constraints**

What must be true? What cannot happen? (Not "what do we want." What are the non-negotiables?)

**2. Understand the unknowns**

What do we not know? Where are we making assumptions? What happens if those assumptions are wrong?

**3. Evaluate the options**

What are the realistic alternatives? What are the trade-offs of each?

**4. Identify the failure modes**

How does this break? What's the sequence of events when each failure mode triggers?

**5. Validate the monitoring**

How will you know when something is wrong? Before users tell you?

**6. Define the runbook**

What does someone do at 3 AM when this breaks?

This is not a checklist to be followed mechanically. It's a thinking framework. The goal is to ensure the important questions get asked *before* you're in production.

**Running the Review: Nimbus's New Feature**

Carlos had been invited specifically because Nimbus was about to build something new.

**The feature**: "Nimbus Instant" — a 15-minute delivery guarantee. If a partner restaurant fails to meet the 15-minute window more than once per week, Nimbus would refund the customer automatically.

"Walk me through the technical requirements," Carlos said.

Priya started. "We need real-time tracking from order placement to delivery. We need to compare actual delivery time against the 15-minute SLA. We need to trigger refunds automatically."

"What's the latency requirement for the tracking data?"

"Near real-time. Customers see status updates on their phone."

"Within how long?"

"Five seconds probably."

"Probably?"

"Within five seconds. That's the product requirement."

"Good. Kinesis for the event stream, then. What's the failure mode if Kinesis is delayed?"

"Status updates are late to the customer."

"Is that acceptable?"

"For 10 seconds? Probably. For 60 seconds? No."

"So what's the SLA for the tracking system?"

Priya looked at Leo. "We don't have one yet."

Carlos wrote on the board: *Unknown: tracking SLA.*

"This matters," he said. "Because the SLA determines the infrastructure design. If your SLA is 5 seconds, you need a different solution than if it's 60 seconds."

"Wait — but *why* would we do it that way?" Maya asked. "Why not just use a polling mechanism the app checks every few seconds instead of a real-time push?"

"Latency and cost," Carlos said. "A polling approach at scale — say, 10,000 active orders, each app polling every 5 seconds — is 2,000 requests per second, or 120,000 requests per minute. A push model through Kinesis delivers updates only when the state changes. Fewer requests, lower latency, and the SLA commitment is easier to audit from an event log. Polling works at small scale. At the scale Nimbus is headed toward, push is the right foundation."

Leo had been quiet through Carlos's explanation. Then: "I was going to build this with WebSockets."

Carlos looked at him. "Walk me through it."

"Each order gets a WebSocket connection. The client connects when the order is placed. The server pushes state changes — confirmed, preparing, en route, delivered — as they happen. No polling, low latency, simple model."

"What maintains the WebSocket connection?"

"An API Gateway WebSocket endpoint. Lambda functions handle connection and message events. DynamoDB stores the connection IDs."

Carlos wrote it on the board. "And the failure mode when the client's network drops for 15 seconds?"

"The connection is terminated. The client reconnects and asks for the current state."

"From where?"

"From... the Lambda handler, which reads from DynamoDB."

"So you have both a push path and a pull path," Carlos said. "The WebSocket push is the happy path. The DynamoDB read is the recovery path. How do you ensure the connection is re-established before the customer notices the state is stale?"

Leo thought. "The client detects the disconnect and reconnects within a few seconds. Reconnect logic is straightforward."

"At 10,000 active orders simultaneously — which is where Nimbus is headed — how many concurrent WebSocket connections is that?"

"10,000."

"API Gateway WebSocket has a default quota of 500 **new connections per second** per account," Carlos said. "Not concurrent connections — connection *rate*. 10,000 steady connections is fine. The problem is the reconnect storm: when a network blip drops a few thousand clients at once and they all reconnect in the same two seconds, you hit the rate quota and reconnects start failing exactly when users are paying the most attention. You can request an increase, but it's a quota you'd be revisiting as you grow. Also: API Gateway WebSocket charges $0.25 per million connection-minutes, plus $1.00 per million messages. At 10,000 orders per day with an average 40-minute tracking window, that's only about 400,000 connection-minutes per day — pennies. At 10,000 active orders simultaneously, it is a different scale."

"That's not much," Leo said.

"Not at 10,000 active orders," Carlos said. "At that scale, call it roughly $150 a month with connection-minute and message charges. The cost isn't the argument against WebSockets here. The connection-rate quota under reconnect storms, and the connection-state management, are."

"So WebSockets get complicated at scale," Maya said.

"They get manageable at scale if you architect for it," Carlos said. "It's not wrong — it's a different set of trade-offs. Now let me show you the polling alternative."

He drew the second option.

"Polling: the client sends a GET request to `/orders/{order_id}/status` every 5 seconds. The backend reads from DynamoDB. Returns the current state."

"That's a lot of requests," Priya said.

"10,000 active orders × 1 poll per 5 seconds = 2,000 requests per second. Your API needs to handle 2,000 RPS. DynamoDB auto-scales. API Gateway handles the load. The cost: 2,000 RPS × 3,600 seconds × 24 hours × 30 days = 5.18 billion requests per month. API Gateway REST API pricing: $3.50 per million requests = $18,130/month."

The room was quiet.

"That's not a viable option at scale," Tom said.

"Correct," Carlos said. "Polling at 5-second intervals is the simplest implementation and the most expensive at scale. It also generates load proportional to active connections, not proportional to state changes. If an order sits in 'preparing' for 20 minutes, polling generates 240 requests that all return the same state. That's waste."

"And Kinesis?" Maya asked.

"Kinesis generates one event per state change. An order confirmation: one event. Kitchen acceptance: one event. Driver pickup: one event. Delivery: one event. Four events per order, regardless of how long each state takes. The consumer — your backend — reads from the Kinesis stream and pushes the update to the client through whatever delivery mechanism you choose."

"But the client still needs a way to receive the push," Leo said.

"Yes. You can use Server-Sent Events, a long-poll endpoint, or WebSockets for the last-mile delivery. Kinesis handles the reliable, ordered, replayable event stream for your backend. The client delivery mechanism is a separate decision. The key advantage: Kinesis decouples the event source from the consumer. The delivery tracking system, the refund system, the restaurant notification system, and the customer status display all consume from the same Kinesis stream independently."

"So it's not Kinesis instead of WebSockets," Maya said. "It's Kinesis plus a lighter-weight client delivery mechanism."

"Exactly. The trade-off analysis:"

He wrote it:

| Option | Latency | Cost (500 / 10K active orders) | Complexity |
|---|---|---|---|
| WebSockets only | ~50ms | $8 / $150 per month | Medium |
| Polling (5s) | 0–5s | $906 / $18,130 per month | Low |
| Kinesis + SSE | ~200ms | $8 / $75 per month | Medium-high |

"The polling option is eliminated by cost," Carlos said. "WebSockets are viable but require connection management at scale. Kinesis plus Server-Sent Events is slightly higher latency and comparable in cost — what it buys you is the durable, replayable event log you need for the refund system, and decoupled consumers."

"Wait — but *why* would we do it that way?" Maya asked. "If WebSockets have lower latency, why accept higher latency from Kinesis plus SSE?"

"Is 200ms versus 50ms perceptible to a customer watching a delivery status update?" Carlos asked.

"No," she said.

"Then the latency difference is below the perceptual threshold. The cost difference at ten thousand active orders is modest — $75 versus $150 a month. The architectural difference is the real argument: Kinesis gives you a durable, replayable event log — which you'll need for the refund audit trail — and decouples your tracking consumers. WebSockets would require you to rebuild the decoupling later."

Leo looked at the table. "We almost shipped the WebSocket version."

"It would have worked," Carlos said. "That's the important thing to understand. WebSockets would have worked. The question in architecture is rarely 'does this work?' The question is 'what does this cost as it grows, and what do we have to rebuild later?'"


**The Questions Architects Ask**

Over the next two hours, Carlos guided the team through the review. A selection of his questions:

**On data storage**:

"Where is the order state stored during fulfillment? If the application crashes mid-delivery, what's the recovery process? Can you reconstruct the state from events alone?"

**On the refund mechanism**:

"The refund is triggered automatically. What prevents a refund from being issued twice? What if the payment processor times out and you're not sure if the refund was accepted?"

**On the delivery tracking**:

"You're relying on courier GPS data. What happens if the GPS signal is lost for 90 seconds? How do you distinguish 'GPS lost' from 'delivery in progress' from 'delivery problem'?"

**On failure handling**:

"If the refund service is down, does the order still go through? Does the customer still get their food? What's the user experience during a partial system failure?"

**On observability**:

"How do you know right now how many orders are currently within 5 minutes of the 15-minute SLA? If that number spikes, who is notified?"

Each question revealed an assumption the team had been making without realizing it.

"I already deployed it — oh," Leo said. "The refund endpoint. I was just going to call the payment API directly. We hadn't thought about calling it twice." He paused. "So if the first call succeeds but our confirmation is lost in transit, we call again and the customer gets two refunds."

"Have we thought about what happens if the payment API accepts the first call but our confirmation is lost in transit?" Priya asked.

"That's idempotency," Carlos said.

"An idempotency key — a unique ID per refund attempt, stored in a DB before calling the payment API," Priya said. "If we call twice with the same key, the payment API ignores the second call."

"Which means," Carlos added, "that you need a persistent state store for refund operations, not just an event in a queue."


"The monitoring we've discussed," Carlos said, "is all infrastructure monitoring. CPU. Connection count. Kinesis lag. These are important — but they're not the monitoring that tells you if Nimbus Instant is working."

"What's the monitoring that tells us it's working?" Maya asked.

"P95 confirmation time per restaurant. How long, at the 95th percentile, does it take from order placement to restaurant confirmation — measured separately for each restaurant partner?"

"We don't have that metric," Priya said.

"That's the gap," Carlos said. "You can have perfect infrastructure — CloudWatch green on every alarm — and still have a restaurant partner whose confirmation latency has been degrading for three weeks because their tablet software has a bug. The infrastructure is fine. The business SLA is being violated. And you will not know until the restaurant calls to complain."

"How do we capture that?" Leo asked.

"Emit a custom CloudWatch metric or push to your analytics pipeline every time an order confirmation is received. Timestamp the order placement. Timestamp the confirmation. Compute the difference. Emit it tagged with `restaurant_id`. Build a CloudWatch dashboard that shows p95 confirmation time by restaurant over the trailing 7 days."

"And alarm when it degrades?" Tom asked.

"Alarm when the p95 for a specific restaurant exceeds 90 seconds for more than 5 consecutive minutes," Carlos said. "That's an anomaly that warrants a proactive reach-out, not a wait-for-complaint response."

"This is the difference between monitoring infrastructure and monitoring the product," Priya said.

"Exactly," Carlos said. "Infrastructure monitoring tells you if your systems are healthy. Business-level monitoring tells you if your customers are experiencing what you promised them. You need both. Most teams have only the first."

Maya added it to the ADR appendix: track p95 confirmation time per restaurant in addition to the infrastructure health metrics. Alarm thresholds to be defined by the product team in consultation with the restaurant success team.

"This is also where cost monitoring and business monitoring intersect," Tom said. "If our confirmation latency is spiking for a subset of restaurants on Friday evenings, the root cause might be a Lambda cold start hitting those restaurants' shards in Kinesis. The business metric reveals the symptom. The infrastructure metrics reveal the cause."

"And the solution might not be more infrastructure," Carlos said. "It might be provisioned concurrency on the specific Lambda function. Or it might be shard rebalancing. Or it might be a bug in the restaurant's confirmation endpoint. You cannot know which until you have both layers of observability."

"Have we thought about what happens if we fix the infrastructure and the business metric still doesn't improve?" Priya asked.

"Then the root cause is not in the infrastructure," Carlos said. "Which is valuable information. Without the business metric, you would be chasing infrastructure improvements for a problem that lives elsewhere."


"How much does that cost per month when we have 500 concurrent deliveries being tracked?" Tom asked. "The state store, the Kinesis stream, the Lambda functions processing the events?"

Carlos nodded. "That's the right question to ask now, while you're designing, not after you've built it."

This is the kind of architectural detail that emerges in a structured review — and often doesn't emerge when you're just building.

**The Architecture Decision Record**

After the review, Carlos recommended the team document their decisions in **Architecture Decision Records (ADRs)** — short documents that capture:

- **What decision was made**
- **What alternatives were considered**
- **Why this decision was made (the context and constraints at the time)**
- **What the trade-offs are**
- **What would cause us to revisit this decision**

You might be wondering: do ADRs need to be formal documents? No. An ADR can be a paragraph in a Slack thread if that's where your team works. The format is irrelevant. The act of writing down what you decided and why — before moving on — is what creates the institutional memory.

"ADRs are for your future self," Carlos said. "In 18 months, you'll look at a piece of architecture and wonder why it was done that way. If you have an ADR, you'll understand the context. If you don't, you'll either leave it alone (because you're afraid to touch it) or change it (because you didn't understand why it was done that way)."

Leo wrote the first ADR that afternoon: the decision to use Kinesis for delivery tracking events, with the context, alternatives considered (SQS, EventBridge, polling), and the trade-offs.

Carlos looked at the ADR Leo had drafted. He read it in thirty seconds. Then he said: "Show the team what ADR-007 looks like."

Leo projected it.

---

**ADR-007: Delivery Tracking Event Infrastructure**

**Date**: 2025-03-14
**Status**: Accepted
**Author**: Leo (with review from Carlos, Priya)

---

**Problem**

Nimbus Instant requires real-time delivery status tracking. Orders must update their status (confirmed → preparing → en route → delivered) and surface those updates to the customer's mobile app within 5 seconds of the state change. The refund system also needs an auditable, replayable log of delivery events to determine SLA compliance.

---

**Options Considered**

**Option 1: API Gateway WebSocket + DynamoDB state**
- Client maintains a WebSocket connection per order
- Backend pushes state changes over the open connection
- On reconnect, client pulls current state from DynamoDB
- Estimated cost at scale (10K simultaneously active orders): ~$150/month
- Weakness: Connection limit management at scale; no built-in replay for audit

**Option 2: Client polling (5-second interval)**
- Client polls `/orders/{order_id}/status` every 5 seconds
- Backend reads from DynamoDB on each poll
- Simplest implementation
- Estimated cost at scale (10K simultaneously active orders): $18,130/month
- Eliminated due to cost

**Option 3: Kinesis Data Streams + Server-Sent Events**
- Delivery state changes published to Kinesis stream, sized by throughput: one shard ingests 1 MB/s or 1,000 records/s. At 10K active orders (~4 state-change events per order, small JSON payloads), peak write rate is ~40-50 events/s — a single shard's worth. Provision 3 shards for partition spread and consumer headroom.
- SSE endpoint subscribes to Kinesis shard assigned to order partition
- Client receives SSE events; reconnects using standard EventSource API
- Estimated cost at scale (10K simultaneously active orders): ~$75/month
- Provides durable, replayable event log; decouples all consumers

---

**Decision**

Option 3: Kinesis Data Streams + SSE.

Rationale: cost advantage is significant at scale; the Kinesis event log satisfies the refund audit requirement without a separate audit trail implementation; SSE reconnect handling is simpler than WebSocket connection management at scale.

---

**Consequences**

- *Positive*: Refund system, restaurant notification system, and customer app all consume from the same Kinesis stream independently. New consumers can be added without modifying the producer.
- *Positive*: Events are replayable for up to 7 days (our configured extended retention; Kinesis supports up to 365 days at extra cost). If the refund processing Lambda fails, it can replay missed events.
- *Negative*: SSE latency (~200ms) is higher than WebSocket latency (~50ms). Acceptable because this difference is below customer perception threshold for status updates.
- *Negative*: Kinesis provisioned pricing scales with shard hours, and extended retention roughly doubles the per-shard cost. Throughput headroom is large (one shard ingests 1,000 records/s), but as consumer count and per-consumer read load grow past roughly 50K daily active orders, shard count — and a re-shard/consumer-fan-out strategy — will need to be revisited.

**What would cause us to revisit this decision**: If order volume grows to where Kinesis shard costs exceed WebSocket costs at the new scale, or if the 200ms SSE latency becomes a product differentiation issue.

---

"The last line," Maya said. "That's the one I hadn't thought about."

"The trigger for revisiting," Carlos said. "Every decision has conditions under which it becomes wrong. Writing them down means you will recognize them when they appear."

"Instead of discovering them in a post-mortem," Priya said.

"Instead of that, yes."

Tom was reading the cost consequence. "The re-shard and fan-out strategy — we do not have that yet."

"You do not need it until 50K daily active orders," Carlos said. "At your current 287 restaurants and 4,200 daily orders, you have significant headroom. The ADR tells you what to build before it becomes urgent, not before it becomes relevant."

Leo had been taking notes. "The ADR is doing two things," he said. "It is documenting what we decided. And it is documenting what we would need to decide next if the situation changes."

"That is what makes an ADR useful for eighteen months," Carlos said. "Not the decision itself — decisions become stale. The reasoning. The reasoning tells you whether the decision should be revisited, even when the decision is still in place."


**What Makes an Architect**

At the end of the session, Maya asked Carlos the original question: "What's the difference between making architectural decisions and thinking like an architect?"

He considered it.

"An architect doesn't know more technology than a senior engineer," he said. "A good architect probably knows a little less of the very latest frameworks. But an architect has a different default question set."

"What do you mean?"

"When you're a senior engineer looking at a new feature, your first questions are usually: 'What do we build? How does it work? What's the best library for this?' When an architect looks at the same feature, the first questions are: 'What problem does this solve? What breaks first when traffic doubles? How do we know when it's degraded? What does the user experience when the payment processor is slow?'"

"The architect asks about the system under stress," Leo said.

"And about the business consequence of each failure," Priya added.

"And," Tom said, "about what happens to the bill when this scales."

Carlos nodded. "All of you are already doing this. You've been doing it since Chapter 1. The difference between a senior engineer and an architect isn't a certification or a title. It's a habit of asking the next question — the one that reveals the thing you didn't think about yet."

**Variation: When an Architecture Review Adds Risk Instead of Removing It**

If your review is treated as an approval gate rather than a learning process, teams will start hiding design choices to avoid the delay — and the failure modes will still exist, just undocumented. An architecture review that slows shipping without improving quality is worse than no review at all.

If the idempotency problem for the refund service had been treated as an unexpected delay to the feature launch rather than a necessary discovery, Leo would have shipped the original endpoint, the double-refund would eventually occur, and the team would have learned about it from an angry customer. The review surfaces the problem at a point where fixing it costs a day, not a rollback.

The value of the review is proportional to how willing the team is to let it change the design.

## Strengths and Limitations

**Architecture reviews**:

- Catch failure modes before they're in production
- Create shared understanding between team members who often have siloed knowledge
- Generate documentation (ADRs) that pays dividends for years
- Slow down decision-making in beneficial ways — "move fast" without a review is "move fast and hit the wall you didn't see"

**Where they get complicated**:

- Require someone skilled enough to ask the right questions — the review is only as good as the reviewer
- Can become bureaucratic if treated as a checkbox rather than a conversation
- Some architectural decisions genuinely don't need a full review — knowing which ones do is itself an architectural skill
- The output (ADRs, diagrams, decision logs) must be maintained as the system evolves

## Summary

The review with Carlos had taken two hours and produced three ADRs, a list of six unknowns to resolve before the feature was built, and one architectural change (the idempotency state store) that would have been painful to retrofit after launch. The pre-flight checklist metaphor had held throughout: nothing catastrophic had been discovered, but several things that would have caused problems later had been caught and documented while they were still easy to fix.

- Architecture reviews start with **business requirements, not technology**.
- The review structure: constraints → unknowns → options → failure modes → monitoring → runbooks.
- Architects ask: What breaks first? How do we know it's degraded? What's the user experience during failure? What's the cost at scale?
- **Architecture Decision Records (ADRs)** capture what was decided, why, and what would cause reconsideration.
- Thinking like an architect is a habit: asking the next question, especially about failure modes, business consequence, and scale economics.

## Exam Tips

*SAA-C03 Domain: Cross-domain — architectural reasoning*

This chapter is less about specific exam topics and more about the mindset the exam tests.

- **SAA-C03 scenarios** almost always describe a business constraint first ("the company cannot afford more than 1 hour of downtime") and ask you to select the architecture that meets it. Practice translating business constraints into technical requirements.
- **Failure mode thinking**: Many exam questions describe a system and ask what happens when a component fails. Practice asking "what breaks first?" for the architectures you encounter.
- **Trade-off thinking**: The exam rarely has a "perfect" answer. It asks for the *best* answer given a set of constraints. Get comfortable with "this option is correct given these specific requirements, even though another option would be better under different requirements."
- **Architecture Decision Records**: Not an AWS service, but a best practice that reflects the Operational Excellence pillar of the Well-Architected Framework.
- **Kinesis for real-time event streaming**: The chapter's Nimbus Instant feature uses Kinesis for delivery event streaming. Exam signal: "real-time event ingestion with ordered processing" → Kinesis Data Streams. "Decouple components, at-least-once delivery" → SQS. Knowing when to reach for each is a recurring exam pattern.
- **Idempotency as a testable pattern**: The SAA-C03 frequently tests idempotency in distributed systems. The core pattern: generate a unique idempotency key before calling an external system; persist the key and the result; on retry, check for the existing key before re-executing. If found, return the previously stored result without re-executing. This prevents double-charges, double-sends, and duplicate state mutations when retries occur after a network timeout. Exam signal: "prevent duplicate operations when a service call is retried" or "ensure exactly-once processing of payment events" → idempotency key stored in DynamoDB with conditional write.
- **Server-Sent Events vs WebSockets**: SSE is unidirectional (server to client), uses standard HTTP, and reconnects automatically via the EventSource API. WebSockets are bidirectional, require connection management, and are appropriate when the client also needs to push data to the server. For delivery status updates (server-to-client only), SSE is simpler and cheaper than WebSockets at scale.

## Exercises

**Exercise 1 — Recall**

Carlos asked six types of questions during the architecture review. Can you reconstruct the six areas without looking at the chapter?

*(Hint: They're listed in the "Architecture Review Structure" section. Try to recall them from memory — the act of attempting recall (even if you fail) strengthens long-term retention.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company is building a real-time bid management system for online advertising. Bids must be evaluated and responded to within 100 milliseconds. The system processes 1 million bids per second at peak. If the bid system is down, the company loses ad revenue. The company's database team proposes using RDS Aurora with 10 read replicas. The solution architect must evaluate whether the proposal is fundamentally viable before reviewing its secondary characteristics.

Which concern should the architect raise FIRST?

A) The cost of 10 Aurora read replicas is too high for the budget  
B) Aurora read replicas have replication lag that may cause consistency issues  
C) Aurora's typical query latency of 1-5ms may not meet the 100ms response SLA  
D) RDS Aurora doesn't support the transaction volumes of 1 million requests per second at this latency requirement

**Hint 1**: The primary constraint is 100ms total response time at 1 million requests/second. Which of these concerns, if valid, makes the proposal unworkable no matter how the other three are addressed?

**Hint 2**: Aurora query latency is typically 1-5ms. 1-5ms for the database query leaves 95-99ms for network, application logic, and serialization. Is the 100ms constraint at risk?

**Hint 3**: Aurora can handle high IOPS, but 1 million requests per second is an extraordinary rate. What happens to the architecture at that scale?

**Answer**: D

**Explanation**: While Aurora is high-performance, 1 million requests per second at 100ms total response time is an extreme requirement — it is the architectural blocker that determines whether the proposal can exist at all. The architect should first question whether Aurora (or any relational database) can serve as the primary lookup system at this scale and latency. Systems like this typically use in-memory data stores (Redis) or specialized low-latency databases, not relational databases with full SQL semantics. The 100ms SLA is achievable for Aurora queries alone, but the combination of 1M RPS and 100ms total SLA exceeds typical Aurora throughput characteristics. "FIRST" means feasibility before refinement: if the engine cannot sustain the load, every other concern about the proposal is moot.

**Why not A?** Cost is a valid concern, but the first concern should be whether the architecture is technically feasible at the stated requirements.

**Why not B?** Replication lag is a real but *secondary* characteristic of the proposal — a property you tune once the architecture is viable. Aurora replica lag is typically <100ms and acceptable for most use cases; raising it first would mean debating the consistency behavior of a system that cannot sustain the required throughput in the first place. The feasibility question (D) subsumes it.

**Why not C?** Aurora latency of 1-5ms is well within the 100ms SLA for the database query portion. This is not the primary concern.

*SAA-C03 Domain: Cross-domain — system design*

**Exercise 3 — Architecture Challenge** *(Optional)*

Apply the architecture review structure to a real or hypothetical system:

A startup wants to build a real-time multiplayer trivia game. Players join game rooms (up to 10 players each). Each round shows a question for 15 seconds; all players answer simultaneously. Scores are tabulated instantly after each question. Games last 10 rounds. Peak usage: 50,000 concurrent games.

Run through the six-step review:

1. What are the non-negotiable constraints?
2. What are the unknowns and assumptions?
3. What are the realistic technology options?
4. What are the failure modes?
5. How will you know when it's degraded?
6. What does the 3 AM runbook look like?

*(There is no single correct answer. The goal is to practice the review structure as a thinking tool.)*

## Post-Credits Scene

Carlos left the office at 6 PM.

The team sat for a while afterward, not doing anything in particular.

"I feel like I learned more in those two hours than in any individual AWS service chapter," Leo said.

"That's because those chapters were about tools," Maya said. "This was about judgment."

"Is judgment teachable?" he asked.

"Yes," said Priya. "But not through reading. Through practice. Through making decisions, seeing what breaks, thinking about why."

"Through experience," Tom said.

"Through structured experience," Priya corrected. "Experience without reflection doesn't build judgment. You have to ask the questions after."

Maya looked at the whiteboard. The review notes were still there — constraints, unknowns, failure modes, monitoring questions. It filled two whiteboards.

"This should go in the ADR," she said.

Leo was already typing.

In the final chapter: the one thing no tool or framework can give you — and why "it depends" is the most honest and powerful answer in software architecture.
