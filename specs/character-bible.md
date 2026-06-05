# Character Bible — Let's Build on AWS Together

---

## Cast Overview

| Name  | Role at Nimbus              | Domain Affinity              | First Chapter |
|-------|-----------------------------|------------------------------|---------------|
| Maya  | Product & Strategy          | Synthesis / Architecture     | 00            |
| Tom   | Operations & Infrastructure | Cost Optimization (D4)       | 00            |
| Priya | Engineering & Security      | Secure Architectures (D1)    | 01            |
| Leo   | Development & Deployment    | Resilient Architectures (D2) | 01            |

---

## Maya

**Full name**: Maya Okonkwo

**Age**: 28

**Background**: Studied business administration. Switched to tech after running her family's
restaurant (the one where Nimbus started — its first restaurant partner). Knows how to talk
to people. Doesn't know how to talk to servers — yet.

**Personality**: Curious before skeptical. Always asks "why" before "how." Refuses to accept
"that's just how it works" as an answer. Drives the team forward by asking the uncomfortable
questions everyone else is thinking but not saying.

**Verbal tic**: "Wait — but *why* would we do it that way?"

**Domain affinity**: None at first. By the end, she becomes the team's architect — the one
who synthesizes trade-offs and makes decisions when the engineers disagree.

**Arc**:

- Chapters 00–07: The non-technical person asking naive questions that turn out to be smart.
- Chapters 08–17: Starting to connect the dots between services. Begins participating in
  technical decisions, not just asking questions.
- Chapters 18–26: Confidently evaluating trade-offs. Occasionally wrong, learns loudly.
- Chapters 27–33: The architect. Can run a design review. Can explain *why* to a client.

**Important**: Maya must never be the comic relief. Her "naive" questions are always the
right questions. She is the reader's proxy — treat her with the same respect you treat
the reader.

---

## Tom

**Full name**: Tom Ferreira

**Age**: 32

**Background**: Sysadmin for 8 years. Used to managing physical servers in a closet.
Coming to terms with the fact that the cloud exists and he can't fight it.

**Personality**: Pragmatic. Skeptical of complexity. Allergic to overspending. The person
who will immediately ask "but how much does that cost per month?" before any other question.
Not a pessimist — he just knows that good ideas become bad ideas when the bill arrives.

**Verbal tic**: "How much does that cost per month?"
Also common: "We could just…" (followed by the simpler solution)

**Domain affinity**: Cost Optimization (Domain 4). His instinct to keep things simple and
cheap turns out to be aligned with AWS cost best practices more often than anyone expects.

**Arc**:

- Chapters 00–07: Reluctant. Misses the old server room. Suspicious of "managed" services.
- Chapters 08–17: Grudgingly impressed. Starts to see that managed services can actually
  save time and therefore money.
- Chapters 18–26: Still the most cost-conscious person in the room, but now he knows *why*
  something costs what it costs and can make the argument.
- Chapters 27–33: The team's financial architect. The person who can look at an AWS bill and
  tell you exactly where the money went and whether it was worth it.

**Important**: Tom must never be the obstacle. His cost questions are always valid. When the
team ignores him, they regret it. When they listen, they make better decisions.

---

## Priya

**Full name**: Priya Iyer

**Age**: 26

**Background**: Computer science degree. Interned at a security company. Has a habit of
reading breach post-mortems for fun on weekends. Joined Nimbus because she wanted to build
something, not just audit it.

**Personality**: Methodical. Never ships something she hasn't thought about three times.
Her default assumption is that someone, somewhere, is trying to break whatever they're building.
Not paranoid — just appropriately cautious. Often right.

**Verbal tic**: "And what if someone tries to break in?"
Also common: "Have we thought about what happens if…"

**Domain affinity**: Secure Architectures (Domain 1). Her instincts map almost perfectly to
IAM least privilege, network segmentation, and encryption best practices.

**Arc**:

- Chapters 00–07: The quiet one who occasionally says something alarming ("Leo, why does
  the database have a public IP?"). Mostly building.
- Chapters 08–17: Increasingly vocal. Starts teaching the team about security in a way
  that doesn't make them feel stupid.
- Chapters 18–26: The person who catches problems before they become incidents. Her
  instincts have been proven right enough times that the team now listens.
- Chapters 27–33: The security architect. Can translate security requirements into AWS
  service choices and explain the trade-offs between them.

**Important**: Priya must never be annoying about security. She raises concerns clearly and
explains them without lecturing. When she's overruled and something goes wrong, she doesn't
say "I told you so." She just fixes it.

---

## Leo

**Full name**: Leo Santos

**Age**: 24

**Background**: Self-taught developer. Built his first app at 16. Deployed it incorrectly
at 16 and a half. Has been learning from deployment disasters ever since. Enthusiastic to
the point of occasionally reckless.

**Personality**: Optimistic. Builds first, asks questions later (usually after something
breaks). The team's momentum engine — nothing stays theoretical when Leo is around because
he's already deployed a proof of concept. Learns loudly and without shame.

**Verbal tic**: "I already deployed it — oh." (pause) "Okay, so that didn't work."
Also common: "It'll be fine." (famous last words)

**Domain affinity**: Resilient Architectures (Domain 2). His repeated experience of things
breaking teaches the team, organically, why resilience matters.

**Arc**:

- Chapters 00–07: The one who deploys things that break in interesting ways. Each break
  is a lesson. He's never upset about it.
- Chapters 08–17: Starting to build instincts. Still breaks things, but now he has a
  hypothesis about *why* before it breaks.
- Chapters 18–26: Becoming the team's resilience expert, precisely because he has the
  most experience with things going wrong.
- Chapters 27–33: The engineer who can design for failure. Can articulate RTO/RPO,
  knows when to use Multi-AZ vs Multi-Region, and has strong opinions about circuit breakers.

**Important**: Leo must never be stupid. His mistakes are the mistakes of someone moving
fast and learning. He is always learning. By the end of the book, he is genuinely impressive.

---

## Supporting Cast

Short profiles for recurring secondary characters. They support lessons; they do not carry arcs.

### Soo-Jin

Engineer hired by Nimbus (announced ch. 13, starts ch. 14). Came from a platform team at a
company with hundreds of engineers and five hundred AWS accounts; has run Kubernetes clusters
and carried the pager. Voice of large-scale, multi-account operational experience — IAM Identity
Center, Control Tower, GuardDuty ("set it up now"). Appears in chs. 13–14, 17, 21.

### Rafael

Engineer hired alongside Soo-Jin (announced ch. 13, starts ch. 14). Specialized in security.
Asks how to learn the right configuration, debugs the stateful-vs-stateless security group/NACL
lesson hands-on in his first month, and drafts column-level Lake Formation rules.
Appears in chs. 13–17, 26.

### Sam

Backend engineer who joins a few weeks before ch. 24 to take database work off Leo's plate.
Quiet; runs the production migration script without its WHERE clause — the incident that
motivates the point-in-time recovery (PITR) lesson and the "test against a clone first" rule.
Appears only in ch. 24; the manuscript never mentions him again (no explicit farewell).

### Carlos

Senior architect Maya met at an AWS community event; external facilitator/consultant.
Runs the Well-Architected review in ch. 31 and the pre-build architecture review in ch. 32 —
questions, not answers; trade-offs, not judgment. Referenced afterward by the team in
chs. 33–34 as a model of how architects think.

---

## Character Interaction Dynamics

**Maya ↔ Tom**: Maya pushes for capability; Tom pushes for cost control. Their debates
are where the best architectural decisions come from.

**Priya ↔ Leo**: Priya is cautious; Leo moves fast. Their interactions are where security
and resilience lessons emerge most naturally. Leo deploys something insecure; Priya explains
why; Leo fixes it and remembers.

**Maya ↔ Priya**: Maya asks why security requirements exist; Priya explains in plain
language. This pair produces the book's clearest security explanations.

**Tom ↔ Leo**: Tom asks how much something costs; Leo realizes he has no idea. This pair
produces the book's best cost surprises.

---

## Appearance Constraints

- Every character MUST appear at least once every 3 chapters.
- All four characters MUST be present in chapters 31, 32, and 33.
- No character may be absent for more than 3 consecutive chapters without a narrative
  reason (travel, sick, working on another feature).
- Characters' verbal tics must appear in their dialogue at least once every 3 chapters.
