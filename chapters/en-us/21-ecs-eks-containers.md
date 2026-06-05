# Chapter 21: Shipping Containers for Code

Before 1956, loading cargo onto a ship was a skilled and specialized negotiation. Every ship had different holds. Every port had different cranes. Every carrier had different systems for tracking what went where. A crate of goods moved from truck to dock to ship to dock to truck through a chain of people who all handled it differently. Cargo got lost. Cargo got damaged. The same goods, shipped twice, arrived in different condition because the handling had been different both times.

The answer, when someone finally asked it clearly, was: standardize the container. Don't solve the problem at every port. Solve it once, at the container level. Ship the box, not just the contents.

The standardized shipping container didn't just make shipping faster. It made shipping *predictable*. The contents of a container in Shanghai were in exactly the same condition when they arrived in Rotterdam — because the container protected them from variability at every transfer point.

That's the exact same problem Leo had. The Nimbus API was being "loaded" differently at every "port": staging deployed differently from production, instance one deployed differently from instance three, and six weeks of undocumented changes had made the fleet unpredictable.

The container would not make Leo a faster developer. It would make deployments predictable.

---

The Lambda migration had reduced the EC2 bill for smaller services. But the core API was different — it ran continuously, carried all order traffic, and had been accumulating configuration history for eight months. Lambda solved idleness. Containers would solve inconsistency.

The core API wasn't idle; it couldn't move to Lambda. But it had a different problem: the EC2 instances running it had diverged from each other.

---

Leo had learned not to say "it works on my machine" out loud. It wasn't a defense — it was a diagnosis. And the diagnosis this time was production EC2 instance number three, which had received a library patch six weeks ago that nobody had documented, that the other two instances hadn't received, and that was now causing a bug that existed only there, in that one instance, invisible everywhere else.

He had spent three hours the night before tracking it down.

"Every time we deploy," he said the next morning, "we coordinate across multiple instances. New version, different dependencies. Works in staging, breaks in production because the environments have diverged."

"Because someone updated a package on instance three without updating the others," Priya said. Not unkindly.

"I needed a specific version of—"

"I know," she said. "And now instance three has a different history from instance one and two. That's configuration drift. It's quiet until it isn't."

"What's the actual solution?" Maya asked.

"Stop treating servers like permanent things you configure," Priya said. "Start treating them like disposable units you replace."

**What Is a Container?**

"Think of it like a shipping container," Leo said, grabbing a marker. "The container doesn't care what ship it's on. The ship doesn't care what's in the container. They agreed on the dimensions and the locking mechanism. Everything else is inside the box."

A **container** is a lightweight, portable unit that packages your application together with everything it needs to run: the runtime (Python 3.11, Node.js 20, Java 17), the libraries and dependencies, configuration files, and the application code itself.

Unlike a virtual machine (which emulates an entire computer, including the operating system kernel), a container shares the host OS kernel while keeping everything else isolated. This makes containers fast to start (seconds, sometimes milliseconds) and small (megabytes, not gigabytes).

The most popular container technology is **Docker**. A Docker image is the blueprint — a snapshot of the application and its environment. A Docker container is a running instance of that image.

The key property: **immutability**. An image built today will run identically on any host that supports Docker — a laptop, an EC2 instance, a server in a different data center. The environment is baked in. Configuration drift is impossible.

"So instead of worrying about what's installed on the EC2 instance," Leo said, "we build an image that has everything. The image runs the same way everywhere."

"And if you need to test it locally, you run the same image," Priya added. "No more 'it works on my machine.'"

**Building the Docker Image and Pushing to ECR**

Before any orchestrator could manage the container, Leo had to build it and store it somewhere ECS could pull from.

He wrote the Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

The key line: `FROM python:3.11-slim`. Not Python 3.9. Not Python 3.10. 3.11 — the specific version the team had agreed on, baked into the image. Every instance running this image would use exactly Python 3.11. The decimal module rounding behavior would be identical everywhere.

He built the image locally: `docker build -t nimbus-api:1.0.0 .`

The build took 4 minutes. Docker pulled the base image, installed dependencies, copied the application code, and produced an image tagged `nimbus-api:1.0.0`.

He ran it locally: `docker run -p 8000:8000 nimbus-api:1.0.0`

The API started. Same port, same behavior as the production server — because the environment was identical.

Then he pushed it to ECR:

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Tag the image for ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Push
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

The push took 2 minutes. ECR stored the image, immediately triggered an image scan, and reported results within 5 minutes.

**Amazon ECS: The Orchestrator**

Running one container is simple. Running dozens of containers across multiple hosts, routing traffic between them, restarting failed containers, deploying new versions without downtime — that requires an **orchestrator**.

**Amazon ECS (Elastic Container Service)** is AWS's managed container orchestration service. You define:

- **Task definition**: What container image to run, how much CPU and memory, what environment variables, what ports to expose
- **Service**: How many copies of the task to run, how to handle failures and deployments
- **Cluster**: The underlying compute infrastructure

ECS handles the rest: placing tasks on available capacity, restarting failed tasks, draining connections during deployments, registering healthy tasks with the load balancer.

For Nimbus, the API moved from EC2 instances with manually managed deployments to ECS. Each new deployment pushed a new Docker image to **Amazon ECR (Elastic Container Registry)** — AWS's managed container registry — and ECS rolled it out across all tasks with zero downtime.

**Fargate vs EC2 Launch Type**

ECS can run containers in two modes:

**EC2 launch type**: You manage the underlying EC2 instances. You're responsible for patching the instances, right-sizing them, and ensuring there's enough capacity for your containers. More control, more responsibility.

**Fargate (serverless compute for containers)**: AWS manages the underlying infrastructure entirely. You specify CPU and memory per task; Fargate provisions the right capacity automatically. No EC2 instances to manage. You pay per vCPU-second and GB-second of memory.

Fargate is the "serverless containers" model — you get the environment isolation of containers without managing servers. The trade-off: less control over the underlying instance configuration and slightly higher per-unit cost.

"How much does that cost per month?" Tom asked, pulling up the pricing calculator. "Fargate versus EC2 launch type — I want to see the actual numbers."

Leo's gut estimate — the one everyone carries around — was that Fargate would cost more. Serverless convenience, premium price. He guessed maybe twenty or thirty percent over EC2.

"Run the actual numbers," Tom said, because that was Tom.

The Nimbus API service ran 3 tasks, each needing 0.5 vCPU and 1GB memory, 24/7:

**Fargate**: $0.04048/vCPU-hour × 0.5 × 3 × 720 hours = $43.72/month for CPU. $0.004445/GB-hour × 1 × 3 × 720 = $9.60/month for memory. Total: $53.32/month.

**EC2 launch type** (3 × t3.medium at $0.0416/hour): $0.0416 × 3 × 720 = $89.86/month.

"Wait," Tom said. "Fargate is cheaper?"

"At this size, yes," Leo said. "Fargate charges exactly for what you allocate. EC2 instances have overhead — the OS and the ECS agent consume some CPU and memory before your containers even start. A t3.medium gives 2 vCPU and 4GB, but you're using 0.5 vCPU and 1GB per container. The rest is wasted."

"But EC2 launch type lets you pack multiple tasks onto one instance."

"Yes. At larger scales, with careful bin-packing, EC2 launch type becomes cheaper. At our scale — three tasks — Fargate wins."

Tom wrote this down.

For Nimbus: Fargate for the API service. They didn't want to manage EC2 instances for containers.

If you containerize with Fargate, you eliminate all EC2 management overhead — but you give up the ability to customize instance types, which matters for GPU workloads or specialized networking. If you choose ECS for AWS-native simplicity, you gain tight IAM and ALB integration — but you're locked out of the Kubernetes ecosystem, which requires rearchitecting if you later need multi-cloud portability.

**Amazon EKS: When You Need Kubernetes**

**Kubernetes** is an open-source container orchestration system — essentially the industry standard for managing containers at scale. It's powerful, extensible, and complex.

**Amazon EKS (Elastic Kubernetes Service)** is AWS's managed Kubernetes service. It runs the Kubernetes control plane (the management layer) for you, while you manage the worker nodes (or use Fargate for those too).

You might be wondering: if Kubernetes is the industry standard and every job posting mentions it, why wouldn't we just use it? Because "industry standard" describes what large companies with dedicated platform teams use. For a six-person team building a food-ordering app, Kubernetes adds operational complexity with no practical benefit right now. The complexity is real; the benefit is theoretical at this scale.

Kubernetes provides value at a level of complexity that most teams don't need: custom resource definitions for building internal platforms, advanced scheduling constraints, pod disruption budgets for fine-grained deployment control, and service mesh integration for traffic management between hundreds of microservices. These are genuine capabilities. They're also capabilities that a startup of Nimbus's size will never exercise.

The engineering principle here is sometimes called YAGNI: You Aren't Gonna Need It. ECS gives Nimbus everything they currently need. EKS gives them more than they need, plus a significant learning curve and operational overhead. "It'll be useful later" is not a good reason to add complexity now.

When should you use EKS vs ECS?

**Use ECS** if:

- You're primarily on AWS and want the simpler, more AWS-native experience
- Your team doesn't have existing Kubernetes expertise
- You want less operational overhead

**Use EKS** if:

- You need Kubernetes-specific features (Custom Resource Definitions, Helm charts, the Kubernetes ecosystem)
- Your team already knows Kubernetes
- You're running a hybrid environment (some on-premises, some in AWS) and want a consistent orchestration layer
- Your workload has requirements that match Kubernetes's extensibility

**Container Networking: Ephemeral IPs and Service Discovery**

One thing that catches teams off guard when moving to containers: the IP address of a container changes every time it restarts.

In the EC2 world, instances had relatively stable private IPs. You could (though you shouldn't) hardcode them in configuration files. Services knew each other by IP.

In the container world, each task in ECS gets an IP from the VPC subnet when it starts. When it stops and a new task starts (as part of a deployment or a restart), that new task gets a different IP.

"What happens when a service is hardcoded to call `10.0.1.45` and that container gets replaced with `10.0.1.82`?" Priya asked. "The calling service starts hitting nothing."

This is why service discovery matters in container environments. ECS + Application Load Balancer handles this automatically: the ALB's DNS name is stable; ECS registers healthy tasks with the target group; the ALB routes to whatever tasks are currently healthy. The calling service talks to the ALB DNS name, not to individual container IPs.

For internal service-to-service communication (not user-facing), **AWS Cloud Map** provides service discovery: each ECS service registers with Cloud Map, which provides a stable DNS name. The order service calls `http://notification.nimbus.local:8080`, and Cloud Map resolves that to whichever tasks in the notification service are currently healthy.

"So containers talk to each other through DNS names, not IPs?" Leo confirmed.

"Correct. The IP is ephemeral. The DNS name is the contract."

**Secrets Injection: No Secrets in Environment Variables**

The original EC2 deployment had a problem Priya had flagged for months: secrets (database password, API keys, SES credentials) were stored in environment variables on the EC2 instance, set via a deployment script.

Environment variables are accessible to any process running on the instance. They show up in debugging tools, in some crash reports, and in process lists. They're also visible in CloudWatch if you log them (which some development tools do by default).

Containers don't solve this automatically — you could still pass secrets as environment variables in the ECS task definition. And ECS task definitions are stored in the AWS console, visible to anyone with ECS access.

The correct pattern: **AWS Secrets Manager + ECS task definition integration**.

Instead of storing the database password in the task definition:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS retrieves the secret from Secrets Manager at task launch time and injects it into the container as an environment variable. The secret value is never stored in the task definition — only the ARN of the Secrets Manager secret. The container receives the value at runtime. Secrets Manager can rotate the value without changing the task definition.

"And if someone reads the task definition?" Priya asked. "They'd see the Secrets Manager ARN, but not the value."

"And without the right IAM permissions," Leo confirmed, "they can't retrieve the value from Secrets Manager either."

"That's the design," Priya said. "The task's execution role has permission to read that specific secret. Nothing else. Compromising the task definition gives you an ARN, not a password." 

"Which one should we use?" Maya asked. "And why not Kubernetes? It's in every job description. Every conference talk."

"ECS," said Priya immediately. "We don't have Kubernetes expertise. ECS does everything we need. Adding Kubernetes right now would be adding operational complexity for no practical benefit."

Soo-Jin, who had run Kubernetes clusters at her last company, nodded. "I've carried that pager. You don't want it until you need it."

"We can always migrate to EKS later if we outgrow ECS," Leo added.

This is a correct senior answer: choose the simpler tool that fits your current needs.

**ECR: Securing Your Images**

"And what if someone tries to break in through a vulnerable base image?" Priya asked. "Someone grabs an old image with a known CVE and uses it to get a foothold in the application container?"

It was the right question to ask before deploying any container in production.

**Amazon ECR (Elastic Container Registry)** stores your Docker images and can scan them for known vulnerabilities before deployment. ECR image scanning checks the image against a database of known CVEs (Common Vulnerabilities and Exposures) and flags issues by severity.

The policy Priya wrote: no image with a CRITICAL severity CVE would be deployed to production. The CI/CD pipeline would check the scan results before updating the ECS service. If a critical vulnerability was found, the pipeline would fail and alert the team.

"That's not paranoia," Priya said. "That's just having a check before you deploy."

**How Containers Change Deployments**

Before containers, deploying a new version of the Nimbus API meant:

1. SSH into each EC2 instance
2. Pull the latest code from Git
3. Install/update dependencies
4. Restart the application process
5. Verify health
6. Move to the next instance

This was error-prone and slow. It required coordination. If step 3 failed on instance 4, you had a mixed deployment with some instances running the old version and some failing to run the new version.

With ECS and containers:

1. Build a new Docker image (automated in CI/CD pipeline)
2. Push to ECR
3. Update the ECS service to use the new image version

ECS handles the rolling deployment: starts new tasks with the new image, waits for them to be healthy, then stops old tasks. Zero-downtime deployment, automated.

If the new version fails health checks, ECS stops the deployment and the old version continues serving traffic.

**The Deployment Minimum Config: Health Checks**

The entire safety of container deployments depends on health checks actually working.

ECS uses two types of health checks:

**Container-level health check**: Defined in the Dockerfile or task definition. Runs inside the container to verify the application is responding.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**ALB target group health check**: The load balancer periodically sends HTTP requests to a health endpoint. Tasks that fail the health check are removed from the target group.

If neither health check is configured properly, ECS considers every task healthy — and will deploy a broken image without stopping. This is the most common container deployment mistake.

"Could the health check endpoint leak internal information?" Priya asked.

The health check endpoint at `/health` returned only: `{"status": "ok"}`. No version numbers, no dependency states, no internal configuration. Any information in the health response could be useful to someone mapping the application. Keep health endpoints minimal.

For detailed internal health status (database connectivity, dependency checks), use a separate authenticated `/health/detail` endpoint — accessible only from within the VPC.

**Structured Logging: The Only Window Into a Running Container**

On EC2, something went wrong and you SSH in. You tail the log file. You look at the process table. You check disk usage. You poke around.

In a container, there is no SSH. The container is ephemeral — it may be running on any host in the cluster, and ECS will replace it without warning if it fails health checks. By the time you think about SSHing in, the container you wanted to examine may no longer exist.

Logs are not a debugging convenience in containerized environments. They are the only evidence that something happened.

"And what if a container silently fails and we have no logs?" Priya asked during the containers architecture review. "We could have a task exit with code 1 and never know the cause if the logs weren't captured before it terminated."

This is not hypothetical. It happens on first container deployments, consistently.

The correct pattern: configure every container to send structured logs to **Amazon CloudWatch Logs** using the `awslogs` log driver. ECS handles the shipping automatically — no log agent to install, no sidecar container needed.

In the task definition:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Every line written to stdout or stderr inside the container is captured and sent to the log group `/ecs/nimbus-api`, organized by task ID. ECS creates a new log stream for each task, so you can find the logs for the specific container that failed — even after it's been replaced.

The task execution role needs permission to write to CloudWatch Logs. Without it, the log driver silently fails and all log output is lost.

**Structured logs vs plain text**: Plain text logs ("Order 7741 placed") require grep. Structured JSON logs (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) can be queried with CloudWatch Logs Insights using a syntax that resembles SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

That query runs against the log group directly. No database. No data pipeline. No ETL job. The answer is there in seconds.

This doesn't replace the analytics data lake we'll build in chapter 26. It answers operational questions — "how many orders from restaurant 47 in the last 30 minutes?" — in the middle of an incident, when you don't have time to run an Athena query.

**CloudWatch Container Insights**

**Container Insights** is a CloudWatch feature that collects and aggregates container-level metrics — CPU, memory, network I/O, storage I/O — per ECS cluster, service, and task. Instead of EC2-level metrics (how is the host doing?), you see task-level metrics (how is this specific ECS service doing?).

Enable it with one setting on the ECS cluster:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

After enabling:

- You see a dashboard per service: task count, CPU utilization, memory utilization
- You can alarm on task-level CPU (rather than EC2 host CPU, which is a much blunter signal)
- You can correlate memory spikes with log events — task memory climbed to 95% at 14:22; the logs show a spike in inbound requests from restaurant 47's menu import at exactly 14:21

"How much does that cost per month?" Tom asked.

Container Insights charges for the custom metrics and log storage it generates. At Nimbus's scale (three services, 3-6 tasks each), this was approximately $12/month — a reasonable trade for task-level operational visibility.

Leo had it enabled within the day.

The first time a task failed a health check and was replaced by ECS, the Container Insights dashboard captured the event automatically: task ID, start time, failure time, exit code. The CloudWatch log stream for that task preserved the last 40 lines of output before termination — which showed an uncaught exception triggered by a malformed menu JSON from a new restaurant partner.

Without Container Insights and structured logging: a mysterious spike in error rates, investigation required SSHing to a host that no longer runs the failed task, 45 minutes of guesswork.

With them: a log stream link in the CloudWatch dashboard, the exact exception, the restaurant ID, the offending field — in under five minutes.

"No SSH," Leo said, reviewing the post-mortem. "No downtime to investigate. The logs did the work."

"The logs only do the work," Priya said, "if you configured them to be captured."


**When Containers Are the Wrong Choice**

"Wait — but *why* would we not containerize everything?" Maya asked. "You've just convinced me that containers solve all the configuration drift problems. Why not run every single service as a container?"

It was the same question she'd asked about Lambda. The answer was similar.

Containers add operational requirements: you need a container registry (ECR), a CI/CD pipeline that builds and pushes images, an orchestrator (ECS), monitoring configured for task-level rather than instance-level visibility, and a team that understands Docker and image versioning.

For a service that's already working well on EC2, stable, and not suffering from configuration drift, the cost of containerizing it may exceed the benefit.

Specific cases where containers are the wrong choice:

**Stateful services that aren't built for container mobility**: Databases in containers require careful persistent volume management. Most teams running databases in containers eventually move them back to managed services (RDS, ElastiCache) after encountering this complexity.

**Services with specialized hardware requirements**: GPU workloads, specific network interface configurations, or FPGA-based processing require EC2 instances with specific hardware. Containers don't change this — you'd still use EC2 launch type, just with containers on top, and the container abstraction adds complexity without benefit.

**Very simple scripts and jobs**: A 40-line Python script that runs once a week and has no dependency drift issues. Adding Docker, ECR, ECS task definitions, and a CI/CD pipeline for this is disproportionate. Lambda is simpler. A plain EC2 cron job might be simpler still.

"The principle," Leo said, "is the same as always: match the tool to the problem. Containers solve configuration drift and deployment consistency. If you don't have that problem, you don't need containers."

## AWS Batch: Containers for Large-Scale Jobs

ECS and EKS are designed for long-running services — applications that run continuously, accept requests, and scale with traffic. But some workloads are different: they run for a fixed duration, process a defined dataset, then stop. Generating end-of-month invoices for hundreds of restaurants. Running a machine learning training job. Processing a nightly analytics export.

For these workloads, you don't want a service — you want a job.

**AWS Batch** is a fully managed service that runs batch computing jobs at any scale. You define your job as a Docker container (the same container format ECS uses), and Batch handles the rest: provisioning EC2 or Fargate compute, scheduling jobs into queues, scaling capacity up when jobs arrive and back to zero when they're done.

Key concepts:

- **Job definition:** the Docker container, resource requirements (vCPU, memory), and command to run
- **Job queue:** where submitted jobs wait before running; each queue is associated with one or more compute environments
- **Compute environment:** the underlying EC2 or Fargate capacity. Can use Spot Instances for up to 90% cost savings — Batch handles interruptions and retries automatically

"Wait — but *why* would we use Batch instead of just running an ECS task?" Maya asked.

"Because an ECS service is always on," Leo said. "It waits for requests. A Batch job runs, finishes, and Batch scales the compute back to zero. You pay nothing between runs."

Tom looked up from the pricing page. "And Spot Instances?"

"Batch can run on Spot. If a Spot Instance gets reclaimed mid-job, Batch retries automatically. For a 45-minute invoice job, that's fine."

**vs. ECS/EKS:** ECS/EKS run services — always on, request-driven. Batch runs jobs — finite duration, data-driven, scale to zero when idle.

**vs. Lambda:** Lambda has a 15-minute timeout. Batch jobs can run for hours or days.

Nimbus context: the nightly invoice generation job takes 45 minutes for hundreds of restaurant partners. Lambda times out at 15 minutes. An always-on ECS service wastes money 23 hours a day. Batch runs the job on Spot Instances, finishes in 38 minutes, costs $1.20, and shuts down.

"That's cheaper than the coffee I bought while waiting for the old script to finish," Leo said.

"And no EC2 to manage," Priya added. "Batch provisions it, runs it, terminates it."

## Strengths and Limitations

**Containers**:

- Eliminate environment inconsistency ("works on my machine")
- Enable fast, reliable deployments
- Immutable — the same image runs identically everywhere
- Efficient — lighter than VMs, faster startup

**ECS**:

- Simpler than Kubernetes for AWS-centric workloads
- Tight AWS integration (IAM, ALB, CloudWatch, Secrets Manager)
- Fargate option removes EC2 management entirely

**EKS**:

- Full Kubernetes compatibility — use the entire ecosystem
- Better for hybrid environments or teams with Kubernetes expertise
- More complex to set up and operate than ECS

**Where it gets complicated**:

- Container images must be built and versioned — requires a CI/CD pipeline
- Debugging containers requires different tooling than debugging traditional processes
- Stateful containers (databases in containers) require careful persistent storage configuration
- Networking between containers (service-to-service communication) requires understanding container networking concepts

## Summary

Lambda made idle compute free. Containers made deployment deterministic. Together, they resolved two of the most common causes of operational pain for growing engineering teams.

- **Containers** package application code, runtime, and dependencies together — run identically anywhere.
- **Docker** is the standard container technology. Images are blueprints; containers are running instances.
- **ECR (Elastic Container Registry)** is AWS's managed Docker registry — store, version, and scan your images here. Enable image scanning to catch CVEs before deployment.
- **ECS (Elastic Container Service)** orchestrates containers. You define tasks and services; ECS manages placement and lifecycle.
- **Fargate** is serverless compute for containers — no EC2 instances to manage. Often cheaper than EC2 launch type at small scales due to elimination of EC2 overhead. At larger scales with careful task bin-packing, EC2 launch type can become more cost-effective.
- **EKS (Elastic Kubernetes Service)** is managed Kubernetes — for teams that need Kubernetes features or compatibility.
- **Secrets Manager integration**: inject secrets into containers at launch time via the task definition — don't store secret values in environment variables or task definitions directly.
- **Service discovery**: container IPs are ephemeral. Use ALB DNS names or Cloud Map for stable service addressing.
- Choose ECS for simplicity on AWS; choose EKS for Kubernetes ecosystem compatibility.

## Exam Tips

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **ECS vs EKS signals**: Exam scenarios that mention "Kubernetes," "Helm," "existing Kubernetes expertise," or "multi-cloud container orchestration" → EKS. Everything else → ECS.
- **Fargate vs EC2 launch type**: "Don't want to manage EC2 instances for containers," "serverless containers," "no infrastructure management" → Fargate. "Need specific instance types," "GPU workloads," "fine-grained instance control" → EC2 launch type.
- **Task role vs. task execution role** — a real exam discriminator. The **task execution role** is used by the ECS *agent* on the task's behalf, before and around your code: pull the image from ECR, fetch secrets from Secrets Manager, write logs to CloudWatch. The **task role** is what *your application code inside the container* uses to call AWS services: read from S3, write to DynamoDB — like EC2 instance roles, but per task, so each task can have different permissions. "Container needs to read from S3" → **task role** (attached in the task definition). "Task fails to pull its image / can't fetch its secret" → **execution role** is missing permissions.
- **Fargate Spot**: run fault-tolerant containers on spare capacity for up to ~70% off, with a two-minute interruption warning — Fargate's equivalent of EC2 Spot, configured via capacity providers. Exam trigger: "run interruption-tolerant containers at the lowest cost without managing instances" → Fargate Spot.
- **ECR image scanning**: ECR can scan container images for known vulnerabilities (CVEs). Exam signal: "scan containers for security vulnerabilities" → ECR image scanning.
- **Blue/green deployments**: ECS supports blue/green deployments via CodeDeploy integration. Zero-downtime deployment with automatic rollback. Exam pattern: "deploy without downtime with automatic rollback" → ECS + CodeDeploy blue/green.
- **Secrets Manager integration**: Exam signal: "inject secrets into containers without storing values in task definitions" → use the `secrets` field in the task definition referencing a Secrets Manager ARN. The task execution role needs `secretsmanager:GetSecretValue` permission.
- **ECS Service Auto Scaling**: Scale the number of tasks based on CPU, memory, or custom CloudWatch metrics. Works with ALB to route traffic to the right number of running tasks.
- **AWS Batch:** Managed batch compute for Docker containers. Job queue → compute environment (EC2 or Fargate, supports Spot). Use when: Lambda timeout is too short, ECS service is wasteful for finite jobs. Exam trigger: "large-scale batch processing" or "job that runs for hours" → AWS Batch.

## Exercises

**Exercise 1 — Recall**

Explain the difference between a Docker image and a Docker container. Explain the difference between ECS and ECR.

*(Hint: Image is to container what a recipe is to a cooked dish. ECR stores images; ECS runs them.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company has a microservices application currently running on EC2 instances managed manually. The team struggles with inconsistent deployments — different EC2 instances have different library versions, causing hard-to-reproduce bugs. They want to standardize deployments while minimizing operational overhead for managing the underlying servers. The team has no Kubernetes experience.

Which solution BEST meets these requirements?

A) Containerize the application with Docker; use Amazon ECS with the Fargate launch type  
B) Deploy on EC2 with AWS Systems Manager Patch Manager to keep instances consistent  
C) Containerize the application with Docker; use Amazon EKS with self-managed node groups  
D) Use AWS Elastic Beanstalk to manage deployments and instance configuration automatically

**Hint 1**: Containers solve the "inconsistent environment" problem directly. Which options use containers?

**Hint 2**: "Minimize operational overhead for managing servers" → Fargate (no EC2 management) vs self-managed nodes (still manage EC2).

**Hint 3**: "No Kubernetes experience" → EKS is more operational complexity than ECS.

**Answer**: A

**Explanation**: Containerizing with Docker ensures every deployment uses the same image with the same dependencies — eliminating configuration drift. ECS with Fargate means no EC2 instances to manage. The team focuses on application code and container definitions, not server maintenance. ECS (not EKS) is appropriate for teams without Kubernetes experience.

**Why not B?** Patch Manager keeps EC2 instances updated but doesn't solve the library version inconsistency between applications. The fundamental problem (different code environments on different instances) remains.

**Why not C?** EKS with self-managed node groups requires managing EC2 instances *and* learning Kubernetes. Neither aligns with the requirements.

**Why not D?** Elastic Beanstalk manages application deployment on EC2 but doesn't solve the fundamental environment inconsistency unless containers are used. Beanstalk doesn't use Docker images by default (though it can be configured to).

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus is splitting the monolithic API into three microservices: the order service, the menu service, and the notification service. Each service has different scaling requirements (the order service scales with traffic; the menu service is mostly read-only and stable; the notification service has spiky bursts).

Design the ECS architecture for these three services. How would you handle service-to-service communication? Would you use one ECS cluster or three? How would you configure Auto Scaling differently for each service?

Consider: the menu service is read-heavy and could serve stale data for 60 seconds — would you add caching in front of it? The notification service burst-scales heavily on Friday evenings — would you set Fargate Min capacity to 1 and Max to 20? What happens to in-flight notifications during a scale-down event?

*(There is no single correct answer. The goal is to practice microservices architecture on ECS.)*

## Post-Credits Scene

The first container deployment was flawless.

New version of the API: zero downtime. ECS rolled it out, health checks passed, old tasks drained, new tasks took over. Leo watched the task status in the console with something approaching disbelief.

"It just worked," he said.

"Last week you said the same thing about the manual SSH deploy before it failed on instance three," Priya said.

"I already deployed it — oh." Leo paused. "I deployed without tagging the image version. Let me fix that."

"That's the point," Priya said. "Image versioning is how you track what's running."

"How do you know what version is in production right now?" Maya asked.

Leo pulled up the ECS console. Under the running task, the image was listed: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Version 1.0.3. Built at 14:22 UTC. Deployed at 14:31 UTC.

"On the old EC2 setup," Leo said, "I would have had to SSH into an instance and run `pip show` to see what version of each dependency was installed. And it might have been different on the other instances."

"And now?"

"The tag on the image tells me exactly what's running. The ECR scan history tells me whether it was scanned. The ECS deployment history tells me when it was deployed and what the previous version was."

"No SSH. No downtime. No 'wait for it to restart.'"

"The image is the deployment artifact," Priya said. "The environment is immutable. The deployment process is declarative. This is how software should be shipped."

Leo stared at the console for another moment.

"I spent three years coordinating EC2 deployments," he said. "Coordinating SSH scripts. Writing deployment runbooks."

"You were solving a problem," Priya said, "that containers solve by design."

He didn't say anything after that. But the next morning, he started writing documentation on the container build process, so no one else would have to spend three years figuring it out.

The instance-three bug, the six weeks of undocumented drift, and the issues like it they hadn't caught yet — all of it had a single root cause. Not a malicious actor. Not a hardware failure. Just a server that had been treated like a permanent fixture instead of a disposable unit.

The container was the answer to that. Not because it was new and interesting. Because it made the question impossible to ask.

In the next chapter: the flowchart that runs itself — and remembers where it stopped.
