# Chapter 20: The Freelancer Model

It was a quiet Wednesday afternoon. Priya had her headphones off for once, and the office had the kind of low hum that meant everyone was concentrating but nobody was panicking. Leo had a cost dashboard open on one screen and the EC2 instance list on the other.

Think of a freelancer who works on-call. They don't sit at a desk from nine to five. They wait. The phone rings, they do the work, they send an invoice, they go back to waiting. No work, no cost. A burst of requests, they handle all of them simultaneously. You only pay for the hours actually worked — not the hours they spent available.

That's the model this chapter is about.

There's a subtlety here worth holding onto. The traditional model is: hire an employee, pay for 8 hours, get variable output. The freelancer model is: pay only when the phone rings, get exactly what was requested. For a company with predictable, constant demand, the employee model is more efficient — you know the phone will ring constantly, so paying hourly is equivalent and there's no overhead of engagement and disengagement. For a company with variable, spiky, or infrequent demand, the freelancer model is dramatically cheaper.

AWS offers that model for compute — and whether it makes sense depends on your demand pattern. The first question is never "is this model good?" but "what does my workload actually look like?"

For most workloads larger than a startup: a mix. Some things run constantly (the API server, the database). Some things run only when triggered (event processing, report generation, image resizing). The freelancer model is for the second category — and Nimbus was about to discover how much of its bill belonged there.

---

The SQS/SNS fan-out had decoupled the order flow, but the workers consuming those queues still ran on EC2 instances that charged by the hour — regardless of how many emails they actually sent. The architecture was right; the cost model still had a leak.

Priya had noticed it first.

"The email service," she said. "How many emails do we send per day?"

Leo checked the metrics. "Average 400 a day. Peak about 1,200 on Friday nights."

"And the EC2 instance running the email service — how long does it run?"

"Always. 24/7."

"Even at 3 AM when we send zero emails?"

Silence.

Leo pulled up the CloudWatch CPU graph for the email service EC2 instance. The graph showed 18 hours of continuous operation. On the Friday peak: CPU at 38%, handling the email burst. After midnight: CPU dropped to 3%. Stayed there until the lunch orders started.

Three percent CPU for 18 hours straight. The instance was running. It was billing. It was not doing anything meaningful.

"We're paying for a computer to sit there doing nothing," Leo said.

"For how many hours a day?"

More silence.

"About 18."

Tom was very attentive now.

"And it's not just the email service," Priya added. "The image resizing service for restaurant photos runs at 1% CPU most of the time. It only spikes when a restaurant uploads a new menu. Which happens, what, a few times a day per restaurant?"

"Yes," Leo confirmed.

"The nightly cleanup job that deletes temp files — that runs for 4 minutes at 2 AM and then sits completely idle for 23 hours and 56 minutes."

"Also yes."

The pattern was the same across all of Nimbus's smaller services: compute paid for 24 hours a day, used for a fraction of that.

---

**The Server Isn't Always the Answer**

EC2 instances are permanent. You start one and it runs until you stop it — 24 hours a day, 7 days a week, regardless of actual usage. For your web server (which handles traffic at all hours), that's correct. For the email service (which sends bursts of emails and then is idle for hours), it's wasteful.

The Auto Scaling Group can scale the email service down to one instance during off-peak hours. But one instance still runs constantly.

This is the question Tom kept returning to when looking at the bill: what was each service actually doing during those 18 hours of 3% CPU? Not nothing, technically — the instance was waiting, checking for events, maintaining its state. But from a business perspective: nothing. The service wasn't delivering value. It was billing.

For workloads that are truly idle most of the time, an always-on EC2 instance is paying rent on an apartment you only visit on weekends. The apartment is yours; the rent doesn't stop.

The freelancer model solves this completely. The code exists. It just doesn't run until there's a reason to run it. No idle cost. No reserved capacity. No server waiting by the phone.

That's the premise of **serverless computing**.

**AWS Lambda: Code Without Servers**

**AWS Lambda** lets you run code in response to events without provisioning or managing servers. You upload a function, specify what triggers it, and Lambda runs it when the trigger fires.

A Lambda function:

- Has no persistent state (each invocation is independent)
- Runs for up to 15 minutes per invocation
- Scales automatically from 0 to thousands of concurrent invocations
- Is billed only when running (per 1 ms of execution, rounded up, per GB of memory allocated)

When there's no trigger, Lambda costs nothing. When triggers fire, Lambda runs and charges. When 10,000 triggers fire simultaneously, Lambda runs 10,000 concurrent invocations. The scaling is automatic and near-instant.

**Event Triggers: What Wakes Lambda Up**

Lambda functions don't run on their own — they respond to events. Common triggers include:

- **SQS queue**: Process messages from a queue. Lambda polls the queue and invokes the function with batches of messages.
- **API Gateway**: HTTP request comes in. API Gateway triggers Lambda. Lambda generates a response.
- **S3 event**: A file is uploaded to S3. Lambda processes it (resize an image, parse a CSV, validate a document).
- **SNS**: A message is published to a topic. Lambda is notified.
- **DynamoDB Streams**: A record in DynamoDB changes. Lambda processes the change.
- **CloudWatch Events (EventBridge)**: A scheduled event (like a cron job) runs at a defined time.
- **ALB**: An HTTP request arrives at the load balancer. Lambda can handle certain routes.

For Nimbus, the email service became a Lambda function triggered by its SQS queue. When a message arrives in the queue, Lambda is invoked with the message content, sends the email via SES (Simple Email Service), and exits.

Zero servers. Zero idle time. Zero cost when idle.

The pattern of Lambda + SQS is worth internalizing: SQS handles the queue, durability, retry logic, and DLQ. Lambda handles the processing. You get the decoupling benefits of SQS with the scale-to-zero economics of Lambda. Neither service does the other's job. They compose cleanly.

"What happens with a malformed message in the queue?" Priya asked. "Can bad input crash Lambda in a way that affects other functions in the account?"

Lambda invocations are isolated from each other. A crashing function doesn't affect other functions. A Lambda that throws an unhandled exception on a malformed message: the message goes back to the queue, retries up to the configured limit, then moves to the DLQ. The Lambda itself remains available for the next message. Input validation inside the Lambda handler is still important — to catch malformed data before attempting to process it — but a single bad message can't take down the function.

**The Cold Start Problem**

Lambda functions run in **execution environments** — small, isolated containers. When a function is invoked:

1. AWS checks if a warm execution environment is available (one that handled a recent invocation)
2. If warm: the function runs immediately
3. If cold: AWS initializes a new execution environment — downloads your code, starts the runtime, runs your initialization code — then runs the function

A **cold start** adds 100ms to several seconds of latency depending on the runtime (Java and .NET have longer cold starts than Python and Node.js) and the size of your code package.

You might be wondering: if Lambda starts from scratch each time, doesn't that make it slower than a server that's already running? Yes — sometimes. That's the cold start problem, and it matters for time-sensitive user-facing APIs. It doesn't matter at all for background jobs where the user has already received their confirmation. A 200ms cold start on an email service that runs in the background is invisible to anyone.

For asynchronous processing (email sending, image resizing), cold starts are invisible to users.

For synchronous APIs (HTTP requests where a user is waiting for a response), cold starts can cause occasional slow responses.

**Mitigations**:

- **Provisioned concurrency**: Pre-warm a specified number of execution environments. They're always ready. You pay for this even when they're not processing requests.
- **Smaller package sizes**: Smaller code initializes faster.
- **Warm-up invocations**: Scheduled pings to keep functions warm (a common but inelegant approach).
- **Choose the right runtime**: Python and Node.js cold start faster than Java.

**A Real Cold Start Investigation**

Two weeks after the Lambda migration, Leo got a Slack message from a restaurant partner: "The order confirmation sometimes takes 3 seconds. Usually it's fast. What's happening?"

Leo pulled up CloudWatch metrics for the Lambda function. In the "Duration" graph, he could see a pattern: the first invocation after any gap of more than 15-20 minutes would spike to 2,800-3,200 milliseconds. Subsequent invocations: 180-220 milliseconds.

Classic cold starts.

He pulled the X-Ray trace for one of the 3-second invocations. The timeline showed it clearly:

- Initialization phase: 2,640ms (downloading the function code, starting the Node.js runtime, running the module-level initialization code)
- Handler function execution: 290ms

The initialization phase was the problem. He looked at the initialization code. The function was importing a large SDK, initializing a database connection, and loading configuration from AWS Secrets Manager — all at startup.

"Some of this initialization only needs to happen once per execution environment," Leo said. "But it's happening on every cold start."

He restructured the Lambda code to initialize the database connection outside the handler function (so it's reused across warm invocations) and reduced the package size by removing unused SDK modules. He also switched from bundling the entire AWS SDK to importing only the specific services he needed.

After the optimization:

- Cold start duration: 1,100ms (still present, but less severe)
- Warm invocations: 165ms

The 1.1-second cold start still happened occasionally. For the email service (asynchronous, user-facing delay invisible), this was acceptable. For the restaurant notification Lambda (customer-facing, ordered from a tablet), Priya pushed for provisioned concurrency: two pre-warmed environments always ready.

"How much does that cost per month?" Tom asked.

Two provisioned concurrency environments at 256MB: about $5.40/month. The latency spikes stopped.

**Lambda Pricing: Why Tom Smiled**

Lambda pricing has two components:

1. **Request charge**: $0.20 per million invocations
2. **Duration charge**: $0.0000166667 per GB-second (memory allocated × seconds running)

The first million requests per month are free (always, not just in the first year).

"How much does that cost per month?" Tom asked before Leo could open the calculator.

Tom did the math for the email service himself:

- Assume every day is a Friday — worst case: 1,200 emails per day × 30 days = 36,000 invocations per month
- Each invocation takes ~2 seconds at 256MB memory
- Duration: 36,000 × 2 × 0.25GB × $0.0000166667 = $0.30/month
- Requests: 36,000 << 1,000,000 (free tier) = $0.00/month

"And that 18,000 GB-seconds is well inside the 400,000 GB-seconds of duration that's always free," Tom added. "So the actual charge would be zero. But I'm ignoring the free tier on purpose — I want to know the real unit cost."

The EC2 instance for the email service: $18/month.

"I already deployed it — oh." Leo stopped himself. He'd pushed the email service Lambda to production before finishing the DLQ configuration. "Give me five minutes."

Tom was quiet for a moment. Then: "We should do this for everything."

**What Lambda Is Good At (and What It Isn't)**

"Wait — but *why* would we not just use Lambda for everything, then?" Maya asked. "If it's cheaper and scales automatically, what's the catch?"

"The 15-minute limit," Leo said. "And cold starts for anything user-facing. And statelessness — you can't keep anything in memory between invocations."

If your workload is spiky, event-driven, and completes in under 15 minutes, Lambda will cost a fraction of an always-on EC2 instance — but if your workload is a long-running data processing job that approaches or exceeds the 15-minute limit, Lambda is the wrong tool and you'll need ECS, Batch, or an EC2-based approach.

Lambda is excellent for:

- **Event-driven processing**: Respond to events (file uploads, queue messages, scheduled tasks)
- **Short-running tasks**: Processing that completes well within 15 minutes
- **Spiky, unpredictable traffic**: Lambda scales from 0 to thousands instantly — no pre-provisioning
- **Infrequent operations**: A report that runs at 2 AM daily. A cleanup job that runs weekly.
- **Glue code**: Small functions that move data between services

You might be wondering: what happens to Lambda's scaling when a sudden burst of 10,000 events arrive simultaneously? Lambda's default concurrency limit is 1,000 concurrent executions per account. If 10,000 events arrive at once, up to 1,000 invocations run immediately; the rest wait in the SQS queue (if triggered via SQS) and are processed as capacity frees up. This is usually fine for queue-based processing. For latency-sensitive use cases, Lambda's burst limit (the initial rate at which new concurrent executions are added) can cause brief throttling during sudden spikes — provisioned concurrency sidesteps this by having capacity pre-allocated.

For Nimbus's email service at their current scale, 1,000 concurrent invocations was far more than they'd ever need. But it's the right constraint to know about before you hit it.

Lambda is poor for:

- **Long-running processes**: The 15-minute limit is a hard wall
- **Stateful applications**: Lambda functions are stateless by design — each invocation is independent
- **High-throughput, low-latency APIs**: Cold starts can cause latency spikes; provisioned concurrency mitigates this but adds cost
- **Applications that need persistent connections**: Lambda can't maintain a long-lived database connection pool easily (though connection pooling tools like RDS Proxy help)
- **Traditional web servers**: Possible, but not the natural fit

**The 15-Minute Wall: When Lambda Is the Wrong Tool**

Three weeks after the migration, Leo tried to move one more workload to Lambda: the nightly analytics report generator. It pulled order data from the database, joined it with restaurant metadata, calculated statistics, and generated a PDF.

On the first night, the Lambda invocation failed with a timeout error.

"The report generation took 17 minutes," Leo said the next morning.

"Lambda's maximum is 15," Priya said.

"Yes. I know that now."

He had checked the average processing time (8 minutes) and assumed Lambda would work. He hadn't checked the tail — the nights when the data volume was higher and the query took longer. On those nights, 15 minutes wasn't enough.

"So the report is just... not generated?" Maya asked.

"Correct. No error notification. No partial report. Just silence."

"I already deployed it — oh," Leo said.

This was one of the specific ways Lambda fails ungracefully: a timeout produces no output, no error message in the application, just a CloudWatch error log. If you're not monitoring Lambda timeout errors specifically, you might not notice for days.

The fix: move the report generator to ECS Fargate — containers without managing servers; next chapter — which has no time limit. Lambda was the wrong tool for workloads that might exceed 15 minutes even occasionally. The lesson wasn't "Lambda is bad." The lesson was "Lambda is the right tool for workloads that fit within its constraints — and a source of surprising failures when they don't."

**RDS Proxy: Connection Pooling for Lambda**

Lambda's stateless nature creates a specific database problem.

When an EC2 instance connects to RDS, it maintains a persistent connection pool. The application reuses connections from the pool. RDS can handle, say, 200 simultaneous connections.

When Lambda handles 500 simultaneous invocations, each invocation tries to open its own database connection. That's 500 new connections — overwhelming a database that supports 200.

**Amazon RDS Proxy** sits between Lambda functions and RDS, maintaining a persistent connection pool and multiplexing Lambda's short-lived connections through it.

Instead of: Lambda invocation → new RDS connection (for each of 500 concurrent invocations)

With RDS Proxy: Lambda invocation → RDS Proxy → pool of 20 persistent RDS connections

"The proxy needs RDS credentials," Priya said. "Where do those live? Does it store them?"

RDS Proxy stores credentials in Secrets Manager and rotates them automatically. The Lambda function's IAM role grants it access to the proxy (using IAM authentication), not to the RDS credentials directly. The credentials are never exposed to the Lambda code.

"So the Lambda function authenticates via IAM," Leo confirmed, "and the proxy handles the actual database credentials."

For Nimbus's order processing Lambda (the one querying RDS for order validation), RDS Proxy eliminated connection pool exhaustion during peak Friday traffic.

**Lambda Layers: Shared Dependencies**

The email service Lambda, the notification Lambda, and the report Lambda all shared the same internal library code: utility functions for formatting currency, sanitizing inputs, logging in the standard format.

Without Lambda Layers, that shared code had to be bundled into each function's deployment package. Three functions, three copies of the same 2MB library. When the library updated, all three functions needed new deployments.

**Lambda Layers** are separate packages that Lambda functions can reference at runtime. The shared library was extracted into a layer. The three functions referenced the layer. Updates to the shared library meant updating the layer version — not redeploying all three functions.

Additional benefit: smaller individual function packages mean faster cold starts.

"One thing layers don't change: the execution role," Priya said. "If a Lambda has too-broad permissions, a compromised function can access everything in the account."

"Same principle as EC2 roles," Leo said. "Least privilege. Each Lambda gets only the permissions it actually needs."

"So Lambda is not a replacement for EC2," Maya said. "It's a different tool for different jobs."

"The Nimbus web API stays on EC2 or ECS," Leo confirmed. "The email service, the image resizer, the nightly report generator, the log cleaner — those move to Lambda."

**The Serverless Philosophy**

Lambda is part of a broader concept: **serverless** — building applications where you manage no servers, only code.

A fully serverless Nimbus stack might look like:

- API Gateway + Lambda (instead of EC2 with a web server)
- DynamoDB (instead of RDS — also serverless, no server management)
- S3 (static assets — inherently serverless)
- SNS + SQS (messaging — serverless)
- Lambda (all background processing)

The appeal: you write code; AWS manages everything else. No patching, no scaling configuration, no capacity planning.

## Amazon API Gateway

The Lambda trigger list mentioned API Gateway briefly: HTTP request comes in, API Gateway triggers Lambda. That's accurate, but it undersells what API Gateway actually is.

"Wait — but *why* would we put API Gateway in front of Lambda?" Maya asked. "Can't Lambda just receive HTTP requests directly?"

Lambda can receive HTTP requests via a function URL — a simple, direct HTTPS endpoint. But it doesn't handle routing, authorization, throttling, caching, or request transformation. For a production API, those concerns exist regardless of whether your backend is Lambda or EC2.

**Amazon API Gateway** is a fully managed service for creating, deploying, and managing APIs at any scale. It handles traffic management, authorization, throttling, caching, and monitoring so your Lambda function (or EC2, or any HTTP backend) doesn't have to implement them itself.

**Three API types:**

**REST API** is the most feature-rich option. It supports request and response transformation, response caching, usage plans tied to API keys, and all authorization types. Most SAA-C03 exam questions that mention API Gateway involve the REST API.

**HTTP API** is simpler and cheaper — roughly 70% less cost than REST API. It's designed for Lambda backends and HTTP proxies. It supports OIDC and OAuth 2.0 authorization but not request transformation or caching. If you don't need REST API's advanced features, HTTP API is the right choice.

**WebSocket API** manages persistent two-way connections. API Gateway handles the connection lifecycle and routes messages to Lambda based on message content. The Lambda function doesn't need to manage socket state — API Gateway does that.

**Authorization options** (the ones the exam tests):

**Cognito User Pool authorizer** validates a JWT from a Cognito User Pool. No Lambda required. API Gateway checks the token itself. If it's valid, the request passes through.

**Lambda authorizer** runs your own Lambda function to validate a token — a custom JWT, an OAuth token from a third-party identity provider, an API key in a proprietary format. The Lambda returns an IAM policy. If the policy allows the action, the request proceeds.

**API key** is a simple key passed in a request header. API keys are for rate limiting by client, not for authentication. Don't use them as a security mechanism — they're not secrets, they're identifiers.

**Throttling and usage plans:**

By default, API Gateway allows 10,000 requests per second at the account level (a soft limit), with a burst of 5,000. Exceed it and clients receive a `429 Too Many Requests` — your backend never even feels it. When you need per-client limits, you create a usage plan: attach it to an API key, set a request rate and daily or monthly quota. One client's bursts don't consume another client's allocation.

Two numbers worth keeping: the maximum payload is **10 MB**, and the default integration timeout is **29 seconds** — if your backend takes longer, the gateway gives up. (Since 2024, that timeout can be raised beyond 29 seconds for Regional and private REST APIs via a quota increase — but the 29-second default is still what the exam expects.) API Gateway is for request/response APIs, not long-running jobs; for those, hand the work to SQS or Step Functions and reply immediately.

"How much does this cost per month?" Tom asked.

For the REST API: $3.50 per million API calls, plus $0.09 per GB of data transfer. For small-to-medium traffic, it's essentially free. For high-volume APIs, the HTTP API's lower price point becomes meaningful.

Leo pointed at the Lambda trigger list he'd written earlier. "So API Gateway is not just a way to trigger Lambda. It's the thing that makes Lambda feel like a real API."

"The Lambda function handles the business logic," Priya said. "API Gateway handles everything in front of it — routing, auth, throttling, monitoring. Each one does one thing."

"And what if someone tries to call the Lambda directly, bypassing API Gateway?"

"The Lambda execution policy only allows invocations from API Gateway," Priya said. "The resource-based policy on the Lambda denies everything else."

The reality: serverless has operational complexity of its own — debugging distributed Lambda functions, managing cold starts, understanding concurrency limits. It's not simpler, just different.

"Wait — but *why* is serverless 'not simpler'?" Maya asked. "The whole pitch is that it removes operational burden."

"It removes some operational burden," Leo said. "Infrastructure provisioning, patching, scaling configuration — those go away. What's left is different: cold start management, distributed tracing across functions you can't SSH into, concurrency limits, managing function versions and aliases, understanding how Layer updates propagate, dealing with 15-minute timeouts gracefully."

"So the burden shifts," Priya said. "From infrastructure operations to function operations."

"Yes. For a lot of workloads — especially event-driven, small, spiky ones — that's a better trade. For a long-running application server that engineers need to interact with and debug, EC2 or containers often remain the right choice."

You might be wondering: is serverless the future, and should everything eventually move to Lambda? The honest answer is that it depends on the workload. Serverless has dominated event-driven processing. It's made significant inroads in HTTP APIs (via API Gateway + Lambda). It has not replaced always-on application servers, long-running batch processing, or stateful services — and probably won't, because those use cases don't benefit from Lambda's model. The right tool question never goes away; it just applies to different options over time.

## Strengths and Limitations

**Why Lambda is powerful**:

- True pay-per-use — zero cost when idle
- Automatic scaling without configuration
- No servers to patch or maintain
- Generous free tier (1 million requests per month, free forever)
- Tight integration with the rest of AWS
- RDS Proxy and Lambda Layers address two of the most common Lambda pain points (connection pooling and code sharing) without requiring architectural changes

**Where it gets complicated**:

- Cold starts are real and require careful handling for latency-sensitive workloads
- 15-minute execution limit excludes long-running tasks
- Debugging is harder — no persistent server to SSH into
- Stateless design requires externalizing all state (database, cache, S3)
- Concurrency limits (default 1,000 concurrent invocations per account) can throttle at scale
- VPC-connected Lambda functions have additional latency and cold start issues

**Monitoring Lambda Without SSH**

The first time something broke in a Lambda function, Leo's instinct was to SSH in and look at the process. There's no process to SSH into. Lambda's execution environments are ephemeral and inaccessible.

Debugging Lambda requires learning a different toolkit:

**CloudWatch Logs**: Every Lambda invocation writes its stdout/stderr to a CloudWatch Log Group. Structured logging (JSON format) makes these filterable. The most useful fields: function name, invocation ID, duration, error type, and your custom correlation ID.

**CloudWatch Metrics**: Lambda publishes Invocations, Duration, Errors, Throttles, and ConcurrentExecutions metrics automatically. Setting alarms on Errors and Throttles should be day one of any Lambda deployment.

**AWS X-Ray**: Distributed tracing for Lambda. Adds a small overhead (2-5ms per invocation) but gives you a flame graph of where time is spent inside the function. Essential for cold start analysis — X-Ray shows the initialization phase separately from the handler phase.

**Lambda Insights**: Enhanced monitoring for Lambda, available via CloudWatch Lambda Insights. Adds memory usage, CPU time, and init duration to the standard metrics. Costs slightly extra but worth it for production functions.

"And what if someone tries to break in through the execution environment?" Priya asked. "Lambda functions run in isolated containers, but if a dependency has a vulnerability, could an attacker get code execution inside our Lambda?"

The mitigations: keep dependencies minimal and up-to-date (the cold start analysis had already pushed Leo to reduce package sizes), use Lambda Layers to version shared libraries, and grant the Lambda execution role the minimum required permissions. If the function can only write to one specific S3 bucket and query one specific DynamoDB table, a compromised function's blast radius is limited to exactly that.

"Least privilege for Lambda execution roles is not optional," Priya said. "It's what limits the damage when something goes wrong."

She was right. And like most security advice, it was also just good engineering.

## Summary

The SQS/SNS architecture from chapter 19 separated the concerns of accepting work and processing it. Lambda takes that further: it separates the concerns of processing work and paying for the capacity to do it.

- **AWS Lambda** runs code in response to events without managing servers.
- **Pay per use**: billed per invocation and per 1 ms of execution (rounded up). Zero cost when idle.
- Scales automatically from 0 to thousands of concurrent invocations.
- **Cold starts**: initialization latency when no warm execution environment exists. Mitigated with provisioned concurrency or lightweight runtimes.
- **Lambda Layers**: shared code packages that multiple functions can reference, reducing duplication and package size.
- **RDS Proxy**: solves Lambda's connection exhaustion problem by maintaining a persistent database connection pool between Lambda and RDS.
- **Monitoring**: use CloudWatch Logs, Metrics, X-Ray tracing, and Lambda Insights — there's no server to SSH into.
- Best for: event-driven, short-running, spiky, or infrequent workloads.
- Not ideal for: long-running tasks (15-minute hard limit), stateful applications, high-throughput low-latency APIs without provisioned concurrency.
- **Serverless** is a design philosophy — you manage code, not infrastructure. The operational complexity shifts, not disappears.

## Exam Tips

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **Lambda + S3**: Classic pattern — file uploaded to S3 triggers Lambda for processing (thumbnail generation, virus scanning, data transformation). No server needed.
- **Lambda + SQS**: Lambda polls SQS and processes batches. SQS provides the retry/DLQ mechanism. Lambda provides the processing.
- **Lambda + API Gateway**: Serverless HTTP API. API Gateway handles routing, auth, throttling. Lambda handles business logic.
- **API Gateway types:** REST API = full features, request transformation, caching, usage plans. HTTP API = simpler, cheaper, OIDC/OAuth only. WebSocket API = persistent bidirectional connections. **Authorization:** Cognito authorizer = validate Cognito JWT natively. Lambda authorizer = custom token validation logic. API key = rate limiting per client (not authentication). Exam trigger: "serverless REST API" → API Gateway + Lambda.
- **Cold start signals**: "latency spikes on first request," "inconsistent response times" → cold start. Solution: provisioned concurrency (costs money), smaller package, lighter runtime.
- **Execution limits**: 15-minute max. 10GB max memory. 512MB /tmp ephemeral storage by default (configurable up to 10GB). These limits appear in exam scenarios.
- **Lambda timeout errors are silent**: If a Lambda function times out, it produces a CloudWatch error but no application-level error response. Monitor CloudWatch Lambda Timeout errors explicitly. This is how Leo's 17-minute report generator failed on its first night without any application-level alarm.
- **VPC Lambda cold starts**: Lambda functions inside a VPC have additional cold start latency (ENI provisioning). AWS improved this significantly with Hyperplane ENIs, but VPC Lambda cold starts are still slower than non-VPC. Avoid VPC for Lambda functions that don't need VPC resources (i.e., not connecting to RDS, ElastiCache, or other VPC-only resources).
- **Lambda concurrency**: Default 1,000 concurrent executions per account (can be increased). **Reserved concurrency**: guarantee a function gets a specific number of executions; prevents other functions from consuming them. **Provisioned concurrency**: pre-warm a number of execution environments.
- **Event source mapping**: The Lambda feature that connects SQS/DynamoDB Streams/Kinesis to Lambda. Lambda polls the source and batches records.
- **Hitting account limits**: "application is being throttled / LimitExceeded as it scales" → check the limit in **Service Quotas** and request an increase there (many quotas, like Lambda concurrency, are adjustable; some are hard limits).
- **RDS Proxy**: Exam signal: "Lambda functions causing too many database connections," "connection pool exhaustion with Lambda." → RDS Proxy maintains persistent connections and multiplexes Lambda's short-lived connections.
- **Lambda Layers**: Exam signal: "share code across multiple Lambda functions," "reduce deployment package size" → Lambda Layers.
- **Lambda + X-Ray**: Distributed tracing for Lambda. Exam scenario: "trace requests across multiple Lambda functions and services" → enable X-Ray tracing on Lambda.
- **Lambda Destinations:** For asynchronous Lambda invocations, you can configure a Destination for both success and failure outcomes. Send successful results to SQS, SNS, EventBridge, or another Lambda function. Send failures to SQS or SNS for alerting. This is the preferred alternative to DLQs for async invocations because it captures both success and failure, not just failure. Exam signal: "route successful Lambda results to another service" or "capture both success and failure outcomes from async Lambda" → Lambda Destinations. "Only capture failed messages for async invocation" → DLQ is still valid but Destinations is the more complete solution.

## Exercises

**Exercise 1 — Recall**

Explain the cold start problem. In what type of application would cold starts be most problematic? In what type would they be acceptable?

*(Hint: Compare a real-time API (user waiting for a response) with an asynchronous background job (user already got their confirmation and is doing other things).)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company receives product images from their suppliers via an S3 bucket. Each image needs to be resized to four standard dimensions (thumbnail, small, medium, large) and stored back in S3. The volume is unpredictable — some days 10 images, some days 100,000. Processing must complete within 10 minutes per image. Cost must be minimized.

Which architecture BEST meets these requirements?

A) EC2 instances in an Auto Scaling Group monitoring the S3 bucket with long polling  
B) A dedicated EC2 instance with a cron job that checks S3 every minute for new images  
C) ECS Fargate tasks triggered by an SQS queue, with S3 events publishing to the queue  
D) S3 event notification triggering a Lambda function that resizes images and stores results in S3

**Hint 1**: Unpredictable volume favors scaling-to-zero. Which option does that?

**Hint 2**: 10 minutes per image is within Lambda's 15-minute limit. Check whether the image resizing work fits Lambda's constraints.

**Hint 3**: A dedicated EC2 instance running 24/7 is expensive and doesn't scale.

**Answer**: D

**Explanation**: S3 event notifications trigger Lambda when an image is uploaded. Lambda resizes the image to four dimensions and stores results in S3. Lambda scales from 0 to thousands of concurrent invocations automatically, handling unpredictable volume without pre-provisioning. Zero cost when no images are being processed.

**Why not A?** EC2 in an ASG doesn't scale to zero — minimum one instance always running. Long polling S3 is not a native S3 event mechanism. Higher cost than Lambda for spiky workloads.

**Why not B?** A dedicated EC2 instance is a single point of failure, doesn't scale, runs 24/7, and a cron-based approach has up to 60-second detection lag.

**Why not C?** ECS Fargate works, but it's more complex (requires container management, ECR, task definitions) and Fargate task startup takes tens of seconds to minutes — far slower than a Lambda cold start — making it a poor fit for spiky, event-driven work. Lambda is simpler for this use case.

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus wants to generate a daily report at 5 AM with the previous day's top 10 restaurants by order volume. The report is generated from DynamoDB data, formatted as a PDF, stored in S3, and emailed to all restaurant partners.

Design the full Lambda-based pipeline for this. What triggers the Lambda? What happens if the PDF generation takes 12 minutes? What if there are 5,000 restaurant partners and emailing all of them takes time? Would you use one Lambda or multiple?

Consider also: what if the Lambda times out after 14 minutes, having processed 4,500 of 5,000 restaurant emails? How do you avoid sending duplicate emails when the Lambda is retried? What IAM permissions does this Lambda need, and what's the minimum necessary set?

*(There is no single correct answer. The goal is to practice composing Lambda with other services.)*

## Post-Credits Scene

Tom reviewed the bill at the end of the month.

The email service: was gone from the EC2 bill.
The image resizing job: gone.
The nightly cleanup task: gone.
The daily analytics report: gone. (The report generator had been moved to ECS Fargate after the 17-minute timeout incident, but the Lambda compute cost was zero because it was now orchestrated differently.)

Total Lambda charges for the month: $5.47.

"Five dollars," Tom said.

"And forty-seven cents," Leo added helpfully.

Tom looked at the previous month's bill, when those services were all on EC2 instances.

"We were paying $187 for those same workloads."

"Lambda doesn't charge for idle time," Leo said. "And most of those services were idle 90% of the time."

Tom pulled up the CloudWatch graphs one more time. The email service Lambda had been invoked 36,412 times. Total duration: about 18,200 GB-seconds. At $0.0000166667 per GB-second: $0.30 — and even that was notional, since 18,200 GB-seconds sat comfortably inside the 400,000 GB-seconds of always-free duration. The actual line item was zero.

"The EC2 instance was $18 a month," Tom said. "We spent thirty cents — and that's me ignoring the free tier, so we know the real unit cost. The bill says zero."

"Most of the $5.47 was the provisioned concurrency on the notification Lambda — that one bills whether it runs or not. The image resizer, the cleanup task, and the rest fit inside the free tier."

Tom stared at the screen for a long time.

"I take back everything I said about serverless being a hype word," he said.

"You never said that," Leo said.

"I thought it very loudly."

In the next chapter: the shipping container that makes any server feel like home.
