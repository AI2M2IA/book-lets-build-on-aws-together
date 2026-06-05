# Chapter 30: The Hidden Cost

Tom had a whiteboard in the meeting room with three columns: compute, storage, networking. The first two were filled in — numbers, dates, names of optimizations completed. He stood at the whiteboard for a moment before writing anything in the third column. The networking lines on the AWS bill scattered across the page in a way the others didn't. Each one had a different name, a different unit, a different justification for why money was leaving.

He uncapped the marker.

**Recap: The Last Unknown on the Bill**

The database audit had closed the last major line item Tom had been actively working on — $491/month recovered, $5,892 per year. Add the EC2 Savings Plans, S3 lifecycle policies, and storage cleanup, and the running total was $34,092 in annual savings across three months of work. But Tom had noticed, during the database deep-dive, that one category had barely been examined. Storage costs showed up as one line: "S3: $198." Compute costs showed up as one line: "EC2: $2,340" — before the Chapter 27 Savings Plan discounts landed. Networking costs scattered across a dozen entries with names like "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer," and "CloudFront Data Transfer." He had never added them up and looked at the sum. That was today's work.

Tom pulled up the bill. Found the data transfer section. Added up all the line items.

Networking costs in AWS are like a city's toll system: driving into the city is free, but every tunnel you take outbound costs money, and driving between neighborhoods costs a little too. Most people don't think about the tolls until they get a bill at the end of the month and realize they've been taking the tunnel every single day when there was a free surface road the whole time. The goal of this chapter is to understand every toll booth — and decide which ones are worth paying.

$847/month.

"We're spending $847 a month on data transfer," he said.

"Is that a lot?" Leo asked.

"It's exactly as much as our S3 bill was before we optimized it. And I didn't even know we had a data transfer bill this size."

Maya looked over. "What exactly is data transfer?"

"It's what AWS charges for moving bytes around. Bytes into AWS: usually free. Bytes out of AWS to the internet: charged. Bytes between services in different regions: charged. Bytes going through a NAT Gateway: charged."

"Can you break it down?"

Tom could. But he didn't stop at the billing console this time. He enabled VPC Flow Logs across all their VPCs and fed them into CloudWatch Logs Insights. This let him query actual traffic flows — not just dollar amounts, but which sources were sending data where, and how much.

The query took two minutes to run. Combined with one more log source he'd pull in shortly, the output was specific enough to act on.

**Traffic Analysis: What's Actually Generating the Bill**

The top five traffic flows by volume, in order:

1. EC2 application servers → NAT Gateway → AWS services (SSM, Secrets Manager, CloudWatch, SQS): 3.9TB/month
2. EC2 application servers → NAT Gateway → external APIs: 1.3TB/month
3. Aurora reader endpoint → EC2 application servers (cross-AZ): 0.4TB/month
4. Analytics pipeline → S3 bucket in us-east-1 (cross-region): 0.3TB/month
5. CloudFront → S3 origin (cache misses): 0.2TB/month

The first four came straight out of the Flow Logs. The fifth couldn't have: VPC Flow Logs only see traffic crossing network interfaces inside your VPCs, and a CloudFront cache miss fetching from S3 never touches the VPC at all — it's CloudFront talking directly to S3. For that flow, Tom pulled CloudFront's standard access logs and filtered on the `x-edge-result-type` field: every entry marked `Miss` is a request CloudFront had to fetch from the origin, and summing the bytes gave him the 0.2TB. One bill, two instruments — each one blind to what the other sees.

"Flow number four," Priya said. "Why is our analytics pipeline talking to a bucket in us-east-1?"

Leo had a look on his face that Tom recognized.

"I already deployed it — oh," Leo said. "Six months ago I was testing whether our analytics pipeline could fan out to multiple regions in parallel. I spun up a test bucket in us-east-1, pointed the pipeline at it, and ran it for a week. The test ended but I forgot to remove the us-east-1 destination from the pipeline config."

"So for five months," Tom said, "we've been writing a copy of every analytics result to a bucket in Virginia."

"How much does that cost per month?" Tom asked.

Cross-region transfer from us-west-2 to us-east-1: $0.02/GB. 300GB/month = $6/month for the transfer. Plus S3 storage for the duplicate data in us-east-1: 300GB × 5 months × $0.023/GB = $34.50 in stored data.

"Not huge," Leo said.

"Not huge per month," Tom said. "But it's been running for five months and nobody knew. It's unintentional cost. The question isn't whether $6 matters — it's whether we know why every dollar is being spent."

Leo deleted the us-east-1 test bucket and removed the destination from the pipeline configuration.

The most actionable finding in the flow log output was flow number one: EC2 application servers calling AWS services through the NAT Gateway.

Tom pulled the specific log entries for the CloudWatch Logs Insights query, filtered to show only traffic destined for AWS service IP ranges:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

The output showed something he hadn't expected: roughly 300 GB per month of same-region S3 traffic — separate from the cross-region flow to Leo's us-east-1 bucket — was passing through the NAT Gateway. But Tom had already configured S3 Gateway Endpoints months ago.

"We have an S3 Gateway Endpoint," Leo said. "Why is S3 traffic still going through NAT?"

Tom looked at the route table. The Gateway Endpoint was configured — but only for the application VPC. The analytics pipeline ran in a separate VPC that had been created nine months ago for data isolation. That VPC had no S3 Gateway Endpoint. Every S3 call from the analytics pipeline's EC2 instances routed through that VPC's NAT Gateway.

"0.3TB of analytics pipeline traffic × $0.045/GB = $13.50/month," Tom said. "Just from the missing endpoint in the second VPC."

"How much would it cost to add the endpoint?" Leo asked.

"Zero," Tom said. "S3 Gateway Endpoints are free. It's a route table entry."

Adding the Gateway Endpoint to the analytics VPC would take four minutes and trim $13.50 from the monthly NAT Gateway charge — a small absolute number, but the finding was the principle. They had added a cost control in one VPC and forgotten to replicate it when they created the second. Consistency required process, not just knowledge.

Tom added to the deployment checklist: when creating a new VPC, add S3 and DynamoDB Gateway Endpoints before attaching any workloads.

The second specific finding from the flow logs was more expensive. Traffic from the Lambda functions that ran the order notification system — S3 access for reading restaurant configuration files — was going through NAT Gateway instead of the S3 endpoint. The Lambda functions ran inside the VPC (for RDS access), and the VPC's S3 endpoint was configured only for EC2 instances in the application subnet. Lambda functions in the Lambda subnet were routing through NAT.

"Wait — but *why* would we do it that way?" Maya asked. "We have the endpoint. Why isn't Lambda using it?"

"VPC Gateway Endpoints apply per subnet based on route tables," Tom said. "The Lambda functions are in their own subnet with their own route table. That route table didn't have the endpoint route. I added it for the application subnet. I missed the Lambda subnet."

Adding the S3 endpoint route to the Lambda subnet route table would save another $41/month in NAT Gateway processing fees that had been charging for S3 calls that should have been free.

The flow log analysis had paid for itself. Three hours of query time, three concrete findings: the forgotten analytics VPC endpoint ($13.50/month), the Lambda subnet routing gap ($41/month), and the original large finding that became the basis for the Interface Endpoint decisions. Total additional monthly saving identified by the flow log analysis: $54.50, on top of the $78 from Interface Endpoints the analysis had already surfaced. Those two smaller fixes went on the backlog for next sprint; the savings table at the end of this chapter counts only what shipped.

"The lesson is that VPC endpoints are not a one-time configuration," Tom said. "Every new VPC, every new subnet, every new workload type requires the same check. The default for anything in a private subnet is to route through NAT. The check is: does this workload call S3, DynamoDB, or any of the high-traffic AWS services? If yes, does it have an endpoint route?"

"Have we thought about automating that check?" Priya asked. "An AWS Config rule that alerts when a private subnet is created without an S3 endpoint route?"

"It's on the list," Tom said. "Right after the orphaned volume alert."


And with that, Tom had his answer to the question that had started the analysis. Networking costs were not a single problem. They were five different problems, each with a different solution.

**How AWS Charges for Data Transfer**

AWS's data transfer pricing is asymmetric:

**Into AWS (inbound)**: Free. You can upload as much data as you want.

**Out of AWS to the internet (outbound)**: Charged. First 100GB/month is free. After that:

- $0.09/GB for the first 10TB/month (US regions)
- $0.085/GB for the next 40TB
- Lower at higher volumes

**Within the same Availability Zone**: Free. EC2 instances talking to each other in the same AZ pay nothing.

**Between Availability Zones (same region)**: $0.01/GB in each direction. A small but real cost.

**Between Regions**: $0.02-0.08/GB depending on regions. Cross-region traffic is significantly more expensive.

**NAT Gateway**: $0.045/GB processed. Every byte your private EC2 instance sends through the NAT Gateway to reach the internet — and every byte coming back — is charged.

**CloudFront**: Lower data transfer rates than direct AWS-to-internet. $0.085/GB for the first 10TB (slightly less than direct data transfer out). CloudFront often reduces total transfer costs because its edge caching means the origin serves data less often.

**Tom's Breakdown**

"How much does that cost per month?" Tom asked, for each line item in turn. He added them to a separate tab in the spreadsheet — not the monthly total, but each category broken out. The total was less useful than understanding which part of the bill was which kind of cost.

After categorizing every line item:

**Outbound data to internet**: $214/month

- API responses to customers globally
- Assets still served straight from S3 and the ALB to clients, bypassing CloudFront (cache fills themselves — CloudFront fetching from an AWS origin — are free: AWS waives origin-to-CloudFront transfer)

**NAT Gateway processing**: $289/month

- Application servers calling external APIs (payment processor, email service, map data)
- DynamoDB calls going through NAT Gateway (before VPC endpoints were set up for some tables)

**Cross-AZ data transfer**: $178/month

- Load balancer to EC2 instances (the load balancer is in one AZ, some instances in another)
- Application server to RDS read replica (in a different AZ)

**Cross-region data transfer**: $166/month

- Aurora Global Database replication (primary in us-west-2, reader in us-east-1)
- S3 Cross-Region Replication for backups
- Leo's forgotten test pipeline ($6/month of this total)

**NAT Gateway: The Biggest Surprise**

$289/month in NAT Gateway processing fees was the largest item. And the VPC Flow Log analysis had made it specific: the top consumer was application servers calling AWS service APIs (SSM, Secrets Manager, CloudWatch Logs) through NAT Gateway.

In Chapter 11, Tom had set up VPC Gateway Endpoints for S3 and DynamoDB. These were free. But he had missed setting up Interface Endpoints for several other services:

- Systems Manager (SSM) for patch management
- Secrets Manager for credential retrieval
- CloudWatch for metric and log shipping
- SQS for message polling

Every call to these services from private EC2 instances was going through the NAT Gateway. Each call charged $0.045/GB.

You might be wondering why AWS charges for traffic going through the NAT Gateway when you're already inside AWS's network. The answer is that the NAT Gateway itself is a managed service — it costs money to run, and AWS passes that cost through per gigabyte. VPC Endpoints eliminate the middleman, which is why they reduce the bill.

"Wait — but *why* would we do it that way?" Maya asked, when Tom showed the numbers. "We set up Gateway Endpoints for S3 and DynamoDB. Why didn't we do the same for SSM and CloudWatch?"

"Gateway Endpoints are only available for S3 and DynamoDB," Tom said. "For everything else — SSM, Secrets Manager, SQS — you need Interface Endpoints. They're not free, but they're cheaper than routing through the NAT at the volume we're generating."

**Interface Endpoints** for these services: $0.01/hour per AZ + $0.01/GB data processed.

At Nimbus's volume, the SSM Interface Endpoint would cost about $25/month (hourly charges plus per-GB processing) and save about $45/month in NAT Gateway charges (because SSM generates significant data volume for patch management and parameter store calls).

Endpoint costs and savings varied by service and volume. Tom calculated that setting up Interface Endpoints for the four high-traffic services — two AZs each, plus the $0.01/GB processing on the 3.9TB they'd carry — would cost about $97/month total and save approximately $176/month in NAT Gateway processing.

Net saving: $78/month from endpoint setup alone.

"And what if someone tries to break in?" Priya said, when the VPC endpoint conversation turned to implementation. "The VPC endpoint means the traffic never touches the public internet — that's not just cost, that's threat surface reduction. We should have done this for the security benefit alone."

"Agreed," Tom said. "The cost savings are a bonus."

Leo looked at the list of services that had been routing through NAT. "I may have set up the CloudWatch logging endpoints without checking if there was a VPC endpoint for it," he said. "It'll be fine for now — but yeah, that's been going through NAT for six months."

"That's on the list," Tom said. "CloudWatch is one of the four we're fixing."

**The PrivateLink Calculation: When It Makes Sense**

There's a more complex version of this conversation that comes up as architectures grow: using AWS PrivateLink to provide private connectivity to services hosted by other AWS customers (or your own services in other VPCs).

PrivateLink Interface Endpoints cost $0.01/hour per AZ plus $0.01/GB. For a service that generates 1TB/month of traffic through the endpoint:

- PrivateLink cost: $0.01 × 2 AZs × 730 hours + $0.01 × 1,000GB = $14.60 + $10 = $24.60/month
- Routing the same traffic through the existing NAT Gateway instead: $0.045 × 1,000GB = $45/month of incremental processing charges

The comparison is *incremental*, because the NAT Gateway stays either way — it still serves the rest of the internet-bound traffic, so its hourly cost ($0.045 × 2 × 730 = $65.70) doesn't disappear when this one service moves to an endpoint. For this traffic volume, PrivateLink saves approximately $20/month. The break-even point is roughly 420GB/month — below that, the endpoint's own hourly cost outweighs the per-GB savings relative to NAT processing.

"Wait — but *why* would we use PrivateLink instead of just a VPN or peering?" Maya asked.

"VPC Peering is simpler and free for intra-region transfers," Tom said. "But peering creates a fully routed connection between VPCs — anything in VPC A can potentially reach anything in VPC B. PrivateLink is more surgical. The endpoint exposes a specific service, not a full network route. For security-conscious architectures, that specificity matters."

"And what if someone tries to break in to a peered VPC?" Priya asked. "Full peering means a compromised instance in one VPC has a route to every instance in the peered VPC."

"That's the argument for PrivateLink over peering when you're connecting to a third-party service or a service owned by a separate team," Tom said. "Peering for trusted intra-company VPCs. PrivateLink for anything where you want the minimum-exposure connection."

**Cross-AZ Traffic: An Architectural Question**

The $178/month in cross-AZ data transfer was trickier.

Some of it was unavoidable: the load balancer distributes traffic across AZs, so some requests originate in one AZ and the load balancer forwards them to an instance in another AZ.

Some of it was optimizable: the application was configured to write to the RDS primary (in us-west-2a) and read from the read replica (in us-west-2b). Every read query crossed AZ boundaries.

For the reads, one solution: configure the application to prefer a read replica in the same AZ as the requesting instance. Each AZ gets its own read replica. Traffic stays local.

Trade-off: more read replicas = more cost. If the cross-AZ traffic cost is $50/month and an additional read replica costs $190/month, the AZ-local optimization doesn't pay off.

Tom calculated: at their current query volume, the cross-AZ traffic was only $31/month of the $178. Not worth adding replicas for.

The other cross-AZ costs were load balancer routing and service-to-service communication — largely unavoidable at the current architecture level.

"This is one of those cases where understanding the cost doesn't mean you should fix it," Tom said.

"How much would it cost to eliminate the cross-AZ traffic entirely?" Maya asked.

"Everything in one AZ defeats the purpose of Multi-AZ. That's a $31/month savings at the cost of losing high availability."

"So we leave it," she said.

"We leave it."

**S3 Select: Reducing Data Transfer in Queries**

While reviewing the analytics pipeline, Tom found another optimization specific to how the analytics team was querying large S3 files.

The pattern: every morning, an analytics job downloaded a 500MB Parquet file from S3 to filter it in-memory for restaurant-specific order data. Roughly 95% of the file was discarded after download.

**S3 Select** allows you to retrieve only the rows and columns you need from an S3 object (CSV, JSON, Parquet), rather than downloading the entire file to filter it in your application.

> **Important update**: in mid-2024, AWS stopped offering S3 Select to new customers — existing users keep it, but it's a dead end for new architectures. The principle this section teaches (filter at the storage layer, don't ship the whole file) is timeless; the modern tool for it is **Amazon Athena** (SQL directly over S3, including joins and aggregations S3 Select never had). **S3 Object Lambda**, once the other alternative, followed S3 Select into legacy status: as of November 7, 2025 it's closed to new customers too (existing workloads keep running). On a current exam, "query data in place on S3" points to Athena. The story below is preserved because the *reasoning* — measure first, move the filter to the data — is the lesson.

Without S3 Select:
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

With S3 Select:
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select reduces the data moved from S3 into your application. For large files with selective queries, this can be a 10-100x reduction in data volume — and, since the analytics instance runs in the same region as the bucket, the win isn't a transfer bill (same-region S3-to-EC2 transfer is free): it's the compute, memory, and time spent downloading and filtering data you immediately throw away.

Tom raised it with the analytics team. They pushed back initially.

"We already know how to write pandas," one analyst said.

"This isn't about pandas," Tom said. "It's about the fact that you're downloading 500MB to get 2MB of data. The download itself is free — same region — but the instance isn't. You run this for every restaurant: 287 restaurants, 287 queries, 140GB pulled and filtered in pandas every night. That's what keeps the analytics box busy for two hours — and that's why it's an xlarge."

"And S3 Select?"

"S3 Select charges $0.002 per GB scanned and $0.0007 per GB returned — about a tenth of a cent per query. In exchange, the instance receives 600MB a night instead of 140GB, the job finishes in minutes, and the box can drop a size."

"That's $450 a month," the analyst said, after doing the instance math — a back-of-the-envelope estimate from the instance's hourly rate and the hours it spent grinding.

"That's why I'm here," Tom said. The real number would turn out to be lower — when Tom later pulled the actual compute spend attributable to the nightly job, it came to $202/month, not $450. Napkin math finds the problem; measurement sizes it.

Tom raised it with Leo first, before bringing the analytics team into the conversation. He knew Leo would push back, and he wanted to understand the pushback before it became a room-level debate.

"S3 Select would save $180/month on the analytics pipeline queries," Tom said.

"That requires rewriting every query," Leo said.

"It requires changing the data access pattern from 'download and filter' to 'query via S3 Select API.'"

"Which is a rewrite."

"It's a change in the client library calls," Tom said. "The query logic — the filtering expressions — stays the same. What changes is where the filtering happens. Currently: EC2. With S3 Select: S3."

"I've read the S3 Select docs," Leo said. "You can't do joins. You can't do aggregations more complex than basic SUM and COUNT. Some of our analytics queries are more sophisticated than that."

"I know," Tom said. "Which is why I'm not proposing S3 Select for all queries. I'm proposing it for the restaurant-specific daily summary queries. That's the 500MB Parquet file filtered by restaurant_id, pulling two columns. That query is a pure filter-and-project. S3 Select is exactly the right tool for that case."

Leo was quiet for a moment. He pulled up the query in question.

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"The S3 Select version would be what — the select_object_content call?"

"Yes," Tom said. "You'd replace the read_parquet call with a select_object_content call that pushes the WHERE clause to S3. The result comes back already filtered. You get a stream of matching records instead of the entire Parquet file."

"And I'd have to handle the response differently."

"The response format is CSV by default. You'd need a small wrapper to parse it back into a DataFrame, or you use the Parquet output format if you want to keep the current parsing logic."

Leo looked at it. "How much work is that?"

"Half a day," Tom said. "Maybe a day if you want to test it thoroughly across all 287 restaurant IDs in the nightly batch."

"For $180/month."

"$2,160 per year," Tom said. "And the approach scales. At 2,000 restaurants, the same query on the same file size costs even more without S3 Select. You're investing a day today to avoid a much larger problem later."

Leo closed the notebook. "The queries where S3 Select doesn't work — the aggregation queries, the cross-restaurant comparisons — those stay as-is?"

"Those stay as-is," Tom confirmed. "I'm not trying to rewrite the analytics pipeline. I'm trying to stop downloading 500 MB to use 2 MB of it."

"Okay," Leo said. "I'll do it this week."

He did. The implementation took six hours. He wrapped the S3 Select call in a utility function that matched the same interface as the existing read_parquet call — the calling code in the nightly batch needed no changes at all. Only the data access layer changed.

The following month, the analytics pipeline's nightly compute bill dropped from $202 to $22 — the job finished in minutes instead of hours, on a smaller instance. The $180/month saving had cost six hours of engineering time. Annualized, that was a 1,800% return on the time investment.

"The part I resisted," Leo said, in the monthly review, "was the rewrite. It turned out to be a function replacement, not a rewrite. I was solving an imagined problem."

"That's worth noting," Tom said. "When you're evaluating whether to implement an optimization, be specific about what the work actually is. 'Requires rewriting queries' was the imagined version. 'Requires changing the data access function' was the real version."


**"Intentional vs Unintentional Cost"**

At the end of the three-week networking analysis, Tom brought the full breakdown back to the team. He had a new column in his spreadsheet: "Intentional?" with a yes or no for each line item.

"That's the frame I'm using now," he said. "Not just 'how much does it cost' but 'did we decide to spend this?'"

"What's an intentional cost?" Maya asked.

"The Aurora Global Database replication. We decided to replicate to us-east-1 because we have restaurant partners on the East Coast. That's $120/month in cross-region replication — roughly double the back-of-envelope estimate from the DR planning days. We chose that cost for a specific reason."

"And unintentional?"

"Leo's analytics pipeline writing to us-east-1 for five months after a test ended. Nobody chose that. It was happening because nobody was watching."

"And the NAT Gateway charges for AWS service calls?"

"Somewhere in between," Tom said. "We didn't explicitly decide to route SSM through NAT Gateway — that was the default. We didn't know there was a cheaper option. Is that intentional? We made a choice, we just didn't know what we were choosing."

"That's the most dangerous category," Priya said. "The decisions you don't know you're making."

"Which is why the VPC Flow Logs analysis matters," Tom said. "It makes the invisible visible. Every byte that crosses a boundary now has a story we can trace."

"Have we thought about what happens if we let this drift again?" Priya asked. "We've done a one-time analysis. In six months, Leo will have created another test bucket somewhere."

"I'll be right here," Leo said. "I'm going to do it in eu-west-1 next time so at least it costs more per GB and you notice faster."

"Monthly VPC Flow Log review," Tom said. "I'll add it to the quarterly cost review. If we see a new cross-region flow or a NAT Gateway spike, we trace it before the next bill."

**Variation: The Trade-Off You Accept**

If you eliminate cross-AZ traffic by running everything in a single Availability Zone, you save approximately $31/month at Nimbus's current volume — but you lose Multi-AZ redundancy worth far more than that in incident risk. The mature cost conversation isn't always about finding savings; sometimes it's about understanding exactly what you're paying for and deciding it's worth it.

The cross-AZ charge is the price of resilience. Some networking costs are architectural commitments, not inefficiencies.

SAA-C03 connection: the exam frequently presents scenarios where a "cost optimization" would eliminate a redundancy. The correct answer is usually to preserve the redundancy and optimize elsewhere — know the difference between waste and the cost of reliability.

**CloudFront: The Data Transfer Discount**

Here's a counterintuitive fact: serving data through CloudFront is generally cheaper than serving it directly from EC2 or S3.

**Direct EC2 to internet**: $0.09/GB
**CloudFront to internet**: $0.085/GB (slightly cheaper)

But the real saving isn't the per-GB rate — it's that CloudFront caches data at edge locations. If 1,000 users request the same menu photo:

- **Without CloudFront**: 1,000 requests leave S3 directly to the internet × photo size × $0.09/GB
- **With CloudFront**: clients get the photo from the edge at CloudFront's rate ($0.085/GB), and the cache fill — CloudFront fetching from S3 on the 1 miss — is **free** (AWS waives origin-to-CloudFront transfer; you pay only the origin GET requests)

For Nimbus with an 83% cache hit rate (from Chapter 13), 83% of requests never touched the origin at all — fewer origin requests, less origin load, and every byte billed at the edge rate instead of S3's internet rate.

"CloudFront is not just a CDN for performance," Tom said. "It's also a cost optimization for data transfer."

Leo looked thoughtful. "We should move all static content delivery through CloudFront, even for assets that aren't latency-sensitive."

"Correct. If users are downloading it from AWS, it should go through CloudFront."

**The Full Networking Optimization**

After three weeks of analysis and implementation:

| Cost Item                                  | Before   | After    | Monthly Saving |
|--------------------------------------------|----------|----------|----------------|
| NAT Gateway (Interface Endpoints)          | $289     | $211     | $78            |
| CloudFront optimization (move more assets) | $214     | $147     | $67            |
| Cross-AZ traffic (accepted as-is)          | $178     | $178     | $0             |
| Cross-region traffic (Leo's test bucket)   | $166     | $160     | $6             |
| **Total**                                  | **$847** | **$696** | **$151/month** |

$151/month, $1,812/year in networking savings. Modest compared to compute and storage, but meaningful.

More importantly: Tom now understood every line of the networking bill. He could explain each cost and had consciously decided which to optimize and which to accept. The distinction between intentional and unintentional cost was now explicit and documented.

## Strengths and Limitations

**NAT Gateway costs**:

- Large data volumes through NAT Gateway accumulate quickly
- VPC Endpoints eliminate some NAT costs entirely
- Review which services your private instances call and whether endpoints are available

**CloudFront for cost**:

- Cache hit rate directly determines cost savings
- High cache hit rate = fewer origin requests and less origin load, plus more bytes billed at CloudFront's cheaper viewer-side rate (origin-to-CloudFront transfer from AWS origins isn't charged at all)
- Move all static asset delivery through CloudFront

**Cross-AZ trade-offs**:

- Eliminating cross-AZ traffic usually requires architectural changes that cost more than the savings
- Calculate carefully before optimizing

**S3 Select** (legacy — unavailable to new customers since 2024; use Athena instead. S3 Object Lambda is also legacy now — closed to new customers as of November 2025, existing workloads unaffected):

- The principle stands: filter at the storage layer instead of downloading large S3 objects — the savings show up in compute time, instance size, and job duration (same-region S3 transfer is already free)
- Doesn't help when you need the entire file

## Summary

Tom closed the networking analysis with a number on the whiteboard and a clearer understanding of what the last unknown on the bill actually was. The $847/month in networking costs hadn't been a mystery of incompetence — it was the expected cost of a distributed system that spanned availability zones, served global users, and replicated data across regions. Most of it was worth paying. Some of it wasn't. The key advance was being able to tell which was which.

- AWS charges for **outbound data** (internet: ~$0.09/GB), **cross-AZ traffic** ($0.01/GB each direction), **cross-region traffic** ($0.02-0.08/GB), and **NAT Gateway processing** ($0.045/GB).
- **Inbound data** is free. **Same-AZ traffic** is free.
- **VPC Flow Logs** reveal which specific traffic flows inside your VPCs are generating each category of cost — essential for targeted optimization. Flows that never cross a VPC network interface (like CloudFront fetching from an S3 origin) need their own instruments: CloudFront standard logs or S3 server access logs.
- **VPC Gateway Endpoints** (S3, DynamoDB): Free. Eliminate NAT Gateway costs for these services.
- **VPC Interface Endpoints**: Priced per hour plus per GB. Cheaper than NAT Gateway for high-volume services.
- **CloudFront** serves data at lower rates than direct EC2-to-internet and dramatically reduces origin transfer volume through caching.
- The critical question is not just "how much" but "is this cost intentional?" Unintentional costs — forgotten test pipelines, default routing through NAT — are where the real savings hide.

## Exam Tips

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.4)*

- **NAT Gateway vs VPC Endpoints**: Exam scenario: "EC2 in private subnet frequently calls S3/DynamoDB — how to reduce NAT Gateway costs?" → VPC Gateway Endpoints (free for S3 and DynamoDB).
- **Data transfer pricing rules**:
  - Into AWS: free
  - Same-AZ: free
  - Cross-AZ: charged
  - Cross-region: charged (higher rate)
  - Internet: charged (significant rate)
- **CloudFront as cost optimization**: "Reduce data transfer costs for global content delivery" → CloudFront. The cache layer reduces origin requests.
- **S3 Transfer Acceleration**: Speeds up uploads *to* S3 using CloudFront edge locations. Higher cost than standard S3. Use for customers uploading large files from geographically distant locations.
- **Cross-region replication costs**: Replicating data across regions incurs data transfer charges. For S3 CRR, you pay both the data transfer out rate and the S3 request cost.
- **PrivateLink (VPC Interface Endpoints)**: Provides private connectivity to AWS services and to services hosted by other AWS customers. More secure than going through NAT, often cheaper for high-volume services. Break-even vs NAT Gateway processing is approximately 420GB/month (counting the endpoint's own per-AZ hourly cost, and assuming the NAT Gateway remains for other traffic).

## Exercises

**Exercise 1 — Recall**

Explain the difference between a VPC Gateway Endpoint and a VPC Interface Endpoint. For which AWS services is each available, and what is the cost of each?

*(Hint: Gateway Endpoints are free but only for S3 and DynamoDB. Interface Endpoints cost per hour but work for most other AWS services.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A company's application runs on EC2 instances in private subnets. The instances make frequent API calls to Amazon SQS and Amazon S3. Currently, all traffic exits through a NAT Gateway. The team wants to reduce NAT Gateway costs. Data security must be maintained — no traffic should traverse the public internet.

Which approach BEST meets these requirements with minimum ongoing cost?

A) Create a Gateway Endpoint for SQS and a Gateway Endpoint for S3  
B) Create Interface Endpoints for both SQS and S3  
C) Create an Interface Endpoint for SQS and a Gateway Endpoint for S3  
D) Remove the NAT Gateway and use the internet gateway directly for API calls

**Hint 1**: Gateway Endpoints are only available for S3 and DynamoDB.

**Hint 2**: Interface Endpoints are available for SQS and many other services (but cost money).

**Hint 3**: An Internet Gateway in the private subnet route table would make it a public subnet — violating security requirements.

**Answer**: C

**Explanation**: S3 uses a Gateway Endpoint (free). SQS requires an Interface Endpoint (priced). This combination eliminates NAT Gateway data processing costs for both services. All traffic remains within AWS's private network — no public internet traversal.

**Why not A?** Gateway Endpoints are not available for SQS. Only S3 and DynamoDB have Gateway Endpoints.

**Why not B?** While this works, using an Interface Endpoint for S3 (instead of the free Gateway Endpoint) incurs unnecessary hourly charges. Always use the free Gateway Endpoint for S3 and DynamoDB.

**Why not D?** Adding a route to the Internet Gateway from the private subnet makes it a public subnet. EC2 instances in private subnets typically don't have Elastic IPs, so they couldn't actually route through an Internet Gateway without additional changes — and doing so would expose them to inbound internet traffic.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.4*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus's East Coast users generate significant traffic. The application serves them from us-west-2 (Oregon). Currently:

- API responses go directly from us-west-2 EC2 instances to East Coast users (~80ms, $0.09/GB)
- Menu photos go from S3 us-west-2 through CloudFront edge in Boston (~8ms after caching)

The team is considering adding a second application region in us-east-1 (Northern Virginia) for East Coast users to reduce API latency.

Analyze the data transfer costs of this change. What new cross-region data transfer costs would the dual-region setup incur? Would Route 53 latency-based routing reduce or increase total transfer costs? Under what conditions (traffic volume, latency sensitivity) would the dual-region setup pay off?

*(There is no single correct answer. The goal is to practice multi-region cost-benefit analysis.)*

## Post-Credits Scene

Tom closed the networking analysis.

Total three-month optimization project impact:

- EC2 Savings Plans: -$14,200/year
- S3 lifecycle policies: -$7,800/year
- Storage (S3 + EBS): -$6,200/year
- Database tier: -$5,892/year
- Networking: -$1,812/year
- **Total: -$35,904/year**

He wrote it on a whiteboard in the meeting room.

Leo stared at it. "Thirty-five thousand."

"And change," Tom said.

"Per year."

"Per year."

Priya did the math. "That's $2,992 per month we were spending on things that weren't creating value."

"Not all of it," Tom corrected. "Some of it was things we were getting value from, but paying too much for. The Savings Plans — we were getting exactly the same EC2 capacity, just at a better price."

Maya stood at the whiteboard for a long time.

"When we started Nimbus," she said, "every dollar counted. We could barely afford the first EC2 instance."

"Yes," Tom said.

"And somewhere along the way, we stopped watching the dollars as carefully."

"Growth does that," Priya said. "The focus shifts to building, not optimizing."

"Both matter," Maya said. "Both, always. Add this to the wiki. And set a quarterly review for cost."

Tom was already opening his calendar.

In the next few chapters: we zoom out from individual services and start thinking like architects.
