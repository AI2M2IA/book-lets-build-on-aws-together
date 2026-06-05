# Chapter 13: Fast Everywhere

A photo traveling from a server in Oregon to a phone in Boston crosses roughly 4,100 kilometers of fiber optic cable. At two-thirds the speed of light, that's about 25 milliseconds of pure physics — unavoidable, non-negotiable, baked into the laws of the universe.

Then add the round trip. Then add processing time. The browser hasn't started rendering yet and 80 milliseconds are already gone.

---

*`eatnimbus.com` was live and the domain name was real. Users could find the app. But finding it wasn't the same as enjoying it. Tom had been running latency measurements from different cities, and the numbers from the East Coast and South America were not good. The domain name problem was solved. The physics problem was not.*

---

`eatnimbus.com` was live. Leo had checked the latency metrics from East Coast users: 80-100 milliseconds per request. That might sound small, but it compounds.

Load the menu: 90ms. Load the restaurant list: 80ms. Load the restaurant's photos: 200ms (images are big). Total time before a user could place an order: over half a second on a good connection.

"The physics is the problem," Leo said. "The servers are in Oregon. The growth is on the East Coast — and in São Paulo."

"So move the servers to the East Coast," Tom said.

"That costs money."

"How much does that cost per month?" Tom asked.

"Running a full duplicate of our infrastructure in us-east-1? Probably triple our current costs. And it creates a whole new problem: keeping the West Coast database and the East Coast database in sync."

Priya looked up from her laptop. "Or we don't move the servers. We move the *content*."

Maya looked up. "What's the difference? If the content is on a server, and the server is in Oregon, the content is in Oregon."

"Most of what a page delivers is static," Priya said. "Images, stylesheets, JavaScript files, fonts. Those are the same for every user. They do not come from the database. They live in S3. And S3 objects can be served from anywhere."

"So we copy them to servers closer to users?"

"We let a service manage that for us. One source of truth. Copies everywhere they are needed."

Tom had already opened the pricing page. He was calculating before Priya finished explaining.

**The Pre-Stocked Warehouse Analogy**

Imagine Amazon the retailer, not the cloud company. They have a massive warehouse in one location with every product. If they shipped every order from that one warehouse, customers in distant cities would wait days.

Instead, Amazon has fulfillment centers near major population centers. When a product is popular, they pre-stock those local warehouses. When a customer in Seattle orders a book, it ships from the local fulfillment center — not from across the country.

This is a **Content Delivery Network (CDN)**: a network of geographically distributed servers that cache copies of your content close to your users.

When a user in Boston requests your homepage, the CDN serves it from a server in Boston. Not Oregon. The request never crosses the country.

**Meet CloudFront**

Amazon CloudFront is AWS's CDN. It operates through a global network of **edge locations** — caching servers positioned in cities around the world. As of this writing, there are over 750 points of presence in 100+ cities.

When you configure CloudFront, you specify an **origin**: the source of your actual content. Your origin might be:

- An S3 bucket (static files: images, CSS, JavaScript, PDFs)
- An Application Load Balancer (dynamic content from your application)
- An EC2 instance
- An HTTP server anywhere on the internet

CloudFront sits in front of your origin. Requests come in at the nearest edge location. If the edge has the content cached, it returns it immediately. If not (a *cache miss*), it fetches from your origin, caches it, and returns it.

**How CloudFront Caching Works**

The first request for any piece of content is always a cache miss — it goes to the origin. Every subsequent request hits the cache at the edge location.

For Nimbus, the menu photos are perfect CloudFront candidates. Restaurant photos change infrequently (maybe when the restaurant updates their profile). With CloudFront:

1. User in Boston requests `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront checks the edge location in Boston — not cached yet (cache miss)
3. CloudFront fetches from S3 in us-west-2 (~80ms)
4. CloudFront stores the photo in the Boston edge location
5. Next user in Boston requests the same photo
6. CloudFront serves from the local edge cache (~5ms)

Same 80ms penalty for the first request. But the thousandth request from the same city is 5 milliseconds.

**Cache-Control headers** and **TTL settings** in CloudFront determine how long content stays cached at the edge. Image files can be cached for hours or days. HTML pages (which change more often) might be cached for minutes or seconds.

You might be wondering: why not just host the entire application in multiple regions instead of using a CDN? If the data is in Oregon, why not put a full copy in New York, Tokyo, and São Paulo? You could. But that means keeping multiple databases synchronized, managing deployments across regions simultaneously, handling split-brain scenarios where the regions disagree. A CDN is a much simpler answer for static and semi-static content: one origin, many cached copies at the edge. You only add multi-region complexity when you truly need compute or database operations near the user — for most content, edge caching is enough.

"Wait — but *why* would we do it that way?" Maya asked. "Why put the cache at the edge instead of just adding a bigger ElastiCache cluster in Oregon?"

"Because the physics is still the problem," Priya said. "Even if Oregon responds in one millisecond, that response still has to travel to Boston. The round-trip time is 70 milliseconds minimum — the speed of light doesn't care how fast our servers are. Edge caching moves the answer closer to the question."

**Dynamic Content: CloudFront for More Than Caching**

"But what about our API responses?" Leo asked. "Those are dynamic — they change per user, per request. You can't cache an order history page."

True. But CloudFront still helps with dynamic content.

Even when content can't be cached, CloudFront routes the request from the edge location to the origin via AWS's private backbone network — the high-speed fiber connecting AWS infrastructure globally. This is faster and more reliable than routing over the public internet, where traffic can bounce through multiple carriers.

The result: dynamic requests are still 20-40% faster through CloudFront than going directly to the origin over the public internet. Not because of caching, but because of the network path.

"That doesn't add up," Maya said. "If the API response still has to travel from Oregon to the edge and then to Boston, how is that faster than going directly from Oregon to Boston?"

"Two reasons," Priya said. "First, AWS's private backbone is faster and more reliable than the public internet. Public internet traffic routes through multiple carriers, each adding their own latency and variability. The backbone is direct, low-latency fiber. Second, SSL termination happens at the edge. The user establishes a TLS connection to the nearest CloudFront edge location — the handshake is fast. CloudFront then keeps a persistent, pre-established connection to the origin. Two short-distance connections instead of one long-distance one."

"So even for non-cached content, CloudFront shaves time off the connection overhead," Leo said.

"Usually ten to forty percent. Not as dramatic as caching. But real."

Additionally, CloudFront provides:

**SSL/TLS termination**: CloudFront handles HTTPS at the edge. The connection between the user and CloudFront is encrypted. CloudFront can connect to your origin over HTTP internally (reducing origin load) or HTTPS (for end-to-end encryption).

**DDoS protection**: CloudFront is integrated with AWS Shield Standard. Distributed traffic across hundreds of edge locations means attacks are absorbed at the edge rather than hammering your origin.

**Geo-restriction**: Block access from specific countries. If Nimbus is only licensed to operate in certain markets, CloudFront can enforce that at the edge without the request ever reaching your servers.

**And what if someone tries to break in through the CDN?** Priya asked. "Cache poisoning — what if someone manages to inject bad content into the edge cache?"

"CloudFront has cache key controls," Leo said. "You define exactly what attributes determine whether two requests get the same cached response. Headers, query strings, cookies. An attacker cannot inject a different cached response without matching the exact cache key."

"And Origin Access Control means the S3 bucket won't serve anything that doesn't come through CloudFront," Priya said. "One attack surface instead of two."

**CloudFront Behaviors: Fine-Grained Caching Rules**

A CloudFront distribution can have multiple **behaviors** — routing rules based on URL patterns.

For Nimbus:

- `/images/*` → Cache at edge for 7 days (photos don't change often)
- `/static/*` → Cache at edge for 30 days (CSS and JavaScript with versioned filenames)
- `/api/*` → Don't cache; forward directly to the load balancer
- `/*` → Cache for 5 minutes (HTML pages)

This lets CloudFront be smart: aggressively cache what's stable, pass through what's dynamic.

Behaviors are matched from most specific to least specific. `/images/hero.jpg` matches `/images/*` before it matches `/*`. The catch-all `/*` at the bottom is the default — it applies to anything that doesn't match a more specific pattern.

"What if we want different caching for authenticated vs unauthenticated users?" Priya asked. "The same URL might return different content depending on whether a user is logged in."

"Then you include the session cookie in the cache key," Leo said. "But that means every logged-in user gets their own cache entry. Your hit rate collapses for authenticated content."

"Which is why you separate authenticated content from public content at the URL level," Priya said. "Anything requiring authentication goes to `/app/*` and is not cached. Public content goes to `/browse/*` and is cached aggressively. One clear boundary."

The lesson: CloudFront works best when your URL structure reflects caching intent. URLs that point to fully public, static data should look different from URLs that return personalized, dynamic data. If they look the same to CloudFront, either the cache is broken or the wrong content gets served.

Leo restructured the Nimbus URL scheme over a weekend. Browsing endpoints moved to `/browse/`. API endpoints moved to `/api/`. The authenticated app UI moved to `/app/`. Three behaviors, three clear caching policies, zero ambiguity.

"It is a bit of a refactor," he said.

"It is the right structure," Priya said. "You would have needed it eventually."

**Origin Access Control: Securing S3 with CloudFront**

If your S3 bucket contains private content that should only be served through CloudFront (not directly), you can use **Origin Access Control (OAC)** to ensure S3 rejects requests that don't come from CloudFront.

This way:

- `d1234abcd.cloudfront.net/image.jpg` → Served (CloudFront has permission)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Blocked (direct S3 access denied)

Your content is only reachable through your distribution, with your cache rules and security settings applied.

---

**The Stale Photo Incident**

Restaurant 112 — the Colombian place in the Eastside — emailed support on a Thursday morning. A customer had complained that the restaurant's hero photo still showed the old storefront, even though the owner had uploaded a new one two days ago.

Leo pulled up the CloudFront distribution settings.

The behavior for `/images/*` had a TTL of seven days. The restaurant partner portal had uploaded a new photo two days ago, replacing the file at the same S3 key path: `restaurant-112/hero.jpg`. The old file was gone from S3. But CloudFront was still serving it from cache at every edge location that had fetched it in the last seven days.

"We changed the content at the origin," Leo said. "But CloudFront doesn't know that. It has a cached copy and it is not going to check for seven days."

"I already deployed it — oh." He had assumed replacing the S3 file would automatically refresh the CloudFront cache. It does not. CloudFront has no mechanism to detect that the content at an S3 key has changed — it simply serves whatever it cached until the TTL expires.

Two options:

**Option one: Invalidation.** Send CloudFront an invalidation request for `/images/restaurant-112/hero.jpg`. CloudFront marks that path stale at all edge locations. The next request for that path fetches fresh content from S3. Cost: the first 1,000 invalidation paths each month are free; beyond that, $0.005 *per path*. For one file, free. For invalidating thousands of files during a bulk update, costs add up.

**Option two: Versioned file names.** Instead of `hero.jpg`, name the file `hero-v2.jpg`. Update the reference in the database. CloudFront has no cached entry for `hero-v2.jpg` — the first request fetches it from S3, and users see it immediately. The old `hero.jpg` remains cached but is no longer referenced anywhere. It expires naturally after seven days.

"For user-uploaded content," Priya said, "versioned names are the right pattern. Add a hash or timestamp to the filename. Every new upload is a new cache entry. No invalidation cost, no stale content."

Leo updated the partner portal. New uploads would now be stored as `hero-{timestamp}.jpg`. The database record was updated with the new path. The old cached path was irrelevant.

"What about the deployment case?" Maya asked. "When we push a new version of the app and the JavaScript changes?"

"Same principle," Priya said. "Build tools like Webpack output hashed filenames: `app.a3b9c2d4.js`. Deploy a new version and the hash changes: `app.f7e1b3c5.js`. CloudFront serves both from cache — old users get the old file, new users get the new file. No invalidation, no coordination problem."

"The HTML page references the current hash," Leo said. "So new users get the new HTML with the new JS hash, and the CDN serves the right file."

"Standard practice," Priya confirmed.

---

**Latency With Real Numbers**

Tom had been running latency measurements from three cities.

| Location | Without CloudFront | With CloudFront | Improvement |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| New York | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tokyo | 260ms | 28ms | 89% |

"The improvement is biggest where the physics problem is worst," Tom observed. "São Paulo to Oregon is more than two hundred milliseconds. That's more than a quarter of a second, just to start the conversation."

"And the content never reaches São Paulo the second time," Leo said. "The first user in São Paulo fetches from Oregon and caches it locally. Every user after that gets thirty-five milliseconds."

"First user in São Paulo eats the cost," Tom said. "Everyone else benefits."

"That is how CDNs work," Priya said. "The first request populates the cache. Every cache hit after that is nearly free."

The implication for global products is significant. Without CloudFront, a user in Tokyo waiting 260 milliseconds for your hero image is waiting because of physics — fiber optic cables and the speed of light. With CloudFront, you put a copy of that image in Tokyo, and the physics problem essentially disappears.

---

**Multiple Origins: ALB and S3 Together**

"We have our images on S3 and our API on the load balancer," Maya said. "Do we need two CloudFront distributions?"

"No," Leo said. "One distribution, multiple origins."

A single CloudFront distribution can route different URL patterns to different origins. This is the multi-origin pattern:

```
eatnimbus.com/*         → Origin: ALB in us-west-2 (dynamic content)
eatnimbus.com/images/*  → Origin: S3 bucket (static images)
eatnimbus.com/static/*  → Origin: S3 bucket (CSS, JS, fonts)
```

CloudFront evaluates behaviors in order of specificity. A request to `/images/hero.jpg` matches the `/images/*` behavior and goes to S3. A request to `/api/orders` matches the `/*` catch-all and goes to the ALB.

The benefit: one domain, one SSL certificate, one CloudFront distribution, multiple backends. Users see a unified domain. The routing is invisible to them.

One operational detail that is also a guaranteed exam fact: that SSL certificate comes from AWS Certificate Manager (ACM), and **a certificate used by CloudFront must be requested or imported in `us-east-1`** — regardless of where your origins live. CloudFront is a global service whose control plane lives in us-east-1; a certificate sitting in us-west-2 simply won't appear in the distribution's dropdown. (For regional services like an ALB, the certificate lives in the ALB's own region.)

"And the ALB is not public-facing?" Priya asked.

"Only CloudFront talks to the ALB," Leo said. "We restrict the ALB's security group to CloudFront's managed prefix list. Direct connections to the ALB from the internet are blocked."

"So the only way to reach the application is through CloudFront."

"Which means WAF rules, SSL termination, and DDoS protection apply to all traffic before it reaches us."

---

**CloudFront Functions vs Lambda@Edge**

"Have we thought about what we would do if we needed to rewrite a URL at the edge?" Priya asked. "Or add a security header to every response?"

"Can't we do that in the application?" Leo asked.

"We can. But if it happens at the edge — before CloudFront serves from cache — we save a round trip to the origin."

CloudFront supports two mechanisms for running code at the edge:

**CloudFront Functions** are lightweight JavaScript functions that run at every edge location. They execute in sub-millisecond time, handle millions of requests per second, and are designed for simple transformations: URL rewrites, header manipulation, query string normalization, simple redirects. They can run on viewer requests and viewer responses (before and after the cache, from the user's perspective). They cannot make network calls. Cost: $0.10 per million invocations.

**Lambda@Edge** runs actual Lambda functions at CloudFront's regional edge locations (not every pop, but dozens of major ones globally). Lambda@Edge can make network calls, access databases, generate dynamic responses, do complex authentication logic. It runs on viewer requests, origin requests, origin responses, and viewer responses — giving you four points of intervention in the request lifecycle. Cost: higher than CloudFront Functions, billed per request and duration.

The mental model:

| Use case | Tool |
|---|---|
| Rewrite `/old-path` to `/new-path` | CloudFront Functions |
| Add `Strict-Transport-Security` header | CloudFront Functions |
| Normalize query strings before cache lookup | CloudFront Functions |
| A/B test: assign a test cookie on the viewer request | CloudFront Functions |
| A/B test: route 10% of users to a different origin | Lambda@Edge (origin request — CloudFront Functions can't change the origin) |
| Authenticate a JWT token (requires crypto library) | Lambda@Edge |
| Fetch personalized content from a database at the edge | Lambda@Edge |
| Generate an image thumbnail on-demand at the edge | Lambda@Edge |

For Nimbus: they used a CloudFront Function to add security headers to every response — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Two dozen lines of JavaScript. Sub-millisecond execution. No origin roundtrip needed.

"It would take longer to explain the headers to a junior engineer," Leo said, "than to write the function."

---

**Price Classes: Choosing Which Edge Locations**

"Have we thought about what this costs at scale?" Tom asked, scrolling through the CloudFront pricing page.

"How much does that cost per month?" was technically two questions here. The first: what does CloudFront charge? The second: do you need every edge location in the world?

CloudFront data transfer pricing varies by region. Traffic served from edge locations in North America and Europe is cheapest. Traffic from South America, Asia Pacific, Australia, and India is more expensive — because the infrastructure costs more there.

AWS lets you choose a **price class** for your distribution:

- **Price Class All**: Uses all edge locations globally. Best performance everywhere. Highest data transfer cost for regions outside North America and Europe.
- **Price Class 200**: Uses most edge locations (North America, Europe, Asia, Middle East, Africa). Excludes the most expensive South American and some Oceania locations.
- **Price Class 100**: Uses only North America and Europe edge locations. Cheapest. Users in São Paulo, Tokyo, and Sydney still get served — but from a North American or European edge, not their nearest one.

"So if we choose Price Class 100," Tom said, "a user in São Paulo gets served from... Miami? New York?"

"Wherever the nearest included edge is. Maybe 50 milliseconds instead of 230 milliseconds direct to Oregon," Priya said. "Still a meaningful improvement. Not as good as Price Class All."

"And the cost difference?"

"Data transfer out of South America is about twice the cost of North America. For a startup still building traffic, Price Class 200 is a reasonable compromise — you get Asia and Europe at lower cost than Price Class All, and most of your users are covered."

"Start with 200," Tom said. "When we have real traffic data from each region, we will decide if All is worth it."

The right price class depends on where your users are. If you have no users in South America, paying for South American edge locations is pure cost. If twenty percent of your revenue comes from Brazil, the performance improvement from Price Class All probably pays for itself.

---

**Cache Key Design**

"Have we thought about what happens when two different users request the same URL but get different content?" Priya asked.

Leo thought about it. "Personalized pages."

"Or language-specific pages. Or mobile versus desktop versions. Or pages that vary by cookie."

By default, CloudFront uses only the URL path as the cache key. Two requests to `/browse` get the same cached response, regardless of the user's language preference, device type, or session cookie.

If your application serves different content based on query strings, headers, or cookies — and you want CloudFront to cache those variations separately — you need to include those attributes in the **cache key**.

For Nimbus:

- `/browse?city=miami` should cache separately from `/browse?city=boston` — different restaurant lists. Include query strings in the cache key.
- Mobile users might get a different layout. Include a normalized device type (derived from the `User-Agent` header) in the cache key.
- The `Accept-Language` header determines which language the page renders in. Include it in the cache key.

Be careful, though. Every cache key attribute you add creates more cache variations. If you include the entire `User-Agent` string (which varies by browser version, OS version, and patch level), you effectively break caching — every user has a slightly different User-Agent, so every request is a cache miss.

The discipline: normalize before caching. Reduce "iPhone 15 Pro Safari 17.4.1" to "mobile." Reduce all the accepted languages to the two or three you actually support. Include only what genuinely changes the response.

"The more specific your cache key," Leo said, "the worse your hit rate."

"And the more generic," Priya said, "the more likely you serve the wrong content to the wrong user."

"So cache key design is the same tradeoff as everything else in caching."

"Yes," Priya said. "It is always the same tradeoff."

---

## When CloudFront Isn't the Answer: Global Accelerator

The Nimbus mobile app had a feature Tom had quietly been watching for two months: real-time order status. When a customer placed an order, the app stayed connected via WebSocket and the kitchen's order management screen updated in real time. No refresh button. No polling. A live connection that pushed updates the instant a kitchen marked an item ready.

"This is using WebSockets," Tom said, looking at the latency metrics one morning. "From users in São Paulo, the connection establishment is taking 340 milliseconds. Something's off."

"CloudFront doesn't cache WebSocket connections," Leo said. "It proxies them — passes them through to the origin. No caching benefit."

"Right. So why is it still slow?"

"Because the WebSocket is still traveling from São Paulo to our servers in Oregon over the public internet," Leo said. "CloudFront helps, because it terminates the TLS handshake at the edge and then uses AWS's backbone to the origin. But for a persistent WebSocket connection, that's still a long-distance connection."

"There's a service for exactly this problem," Priya said.

**AWS Global Accelerator** is not a CDN. It caches nothing. It doesn't serve content from edge locations. What it does is give you two static Anycast IP addresses that are globally advertised from all AWS edge locations simultaneously — and then route your users' traffic over AWS's private backbone instead of the public internet.

When a customer in São Paulo opens the Nimbus app, their device connects to the nearest AWS edge location (which might be in São Paulo itself). From that edge location, the traffic travels to Nimbus's servers in Oregon over AWS's private, monitored, optimized fiber network — not over the public internet where packets bounce through unpredictable carriers and routing hops.

The public internet is not designed for latency. It is designed for resilience — packets can take any available path. AWS's backbone is designed differently: it is direct, low-congestion, and under AWS's operational control.

Tom benchmarked the difference.

| Route | Latency (São Paulo to Oregon) |
|---|---|
| Public internet | 340ms |
| Via Global Accelerator | 180ms |

A 47% reduction. Not from caching — from a better network path.

"Then why wouldn't we just use CloudFront for everything?" Maya asked. "CloudFront already routes through AWS's backbone for dynamic content."

"CloudFront is HTTP and HTTPS only," Priya said. "WebSockets work with CloudFront, but only through HTTP upgrade. And some of our protocols — the IoT sensor data, for example — are pure TCP or UDP. CloudFront doesn't handle those. Global Accelerator is protocol-agnostic. TCP, UDP, WebSockets, whatever. It moves packets, not HTTP requests."

There was another difference that Priya noted in her security documentation.

"Global Accelerator gives us two static Anycast IPs," she said. "Those IPs never change. That means we can add them to our security policy, add them to partner whitelists, add them to firewall rules. CloudFront's IP addresses change over time — they're managed by AWS and are not fixed."

"What about failover?" Leo asked.

"Instant," Priya said. "If our us-west-2 application has a problem, Global Accelerator can shift traffic to a backup in us-east-1 in under 30 seconds — without changing the IP address the users are connecting to. DNS failover through Route 53 takes 60-300 seconds depending on TTL. Global Accelerator is faster."

**CloudFront vs. Global Accelerator — the mental model:**

CloudFront improves delivery by caching. It is built for HTTP/HTTPS and the benefit is largest when content can be cached close to users — static files, images, JavaScript. When content can't be cached, CloudFront still helps through backbone routing, but the improvement is smaller.

Global Accelerator improves delivery by routing. It moves no content. It caches nothing. The benefit applies to every packet — cached or not, HTTP or not, static or dynamic. The two static IPs work globally. Failover is near-instant. The use cases where CloudFront isn't sufficient — real-time WebSockets, UDP-based protocols, non-HTTP traffic, global applications requiring fixed IPs — are where Global Accelerator is the right tool.

Tom updated the Nimbus mobile app to connect to the Global Accelerator endpoint for the real-time order status feature. WebSocket connection establishment in São Paulo dropped from 340ms to 180ms. The kitchen updates still felt instant — because now, for users outside North America, they actually were.

## Strengths and Limitations

**Why CloudFront is powerful**:

- Over 750 points of presence in 100+ cities — most users get content from <20ms away
- Static content served in single-digit milliseconds after the first cache
- Reduces origin load significantly (repeat traffic never hits your servers)
- Integrated with AWS Shield, WAF, and Certificate Manager
- No capacity planning needed — CloudFront scales automatically
- Multi-origin distributions route different paths to different backends from one domain
- CloudFront Functions handle lightweight edge logic at sub-millisecond latency

**Where it gets complicated**:

- Cached content can be stale — invalidating cache costs money ($0.005 per path after the first 1,000 free paths each month). Use versioned filenames instead.
- Cache-Control headers must be set correctly at the origin — mistakes cause stale content
- Dynamic content benefits from routing optimization but not from caching
- Debugging cache behavior (what's cached where, for how long) requires understanding multiple layers: origin headers, CloudFront TTL settings, behavior rules
- Data transfer out through CloudFront costs money, though less than standard data transfer
- Cache key design requires careful thought — too specific breaks caching, too generic serves wrong content

## Summary

CloudFront didn't change the physics. Light still travels at the same speed. But it changed where the answer lived — and for most users, the answer was now a few milliseconds away instead of a few hundred. Cache hit rate after deployment: 83%. That meant 830,000 out of every million requests never reached the origin servers at all. Users in São Paulo went from 290 milliseconds to 35 milliseconds. Users in Tokyo from 260 to 28.

- A **CDN** caches copies of your content at edge locations close to your users — reducing latency and origin load.
- **CloudFront** is AWS's CDN, with 750+ points of presence globally.
- Cache misses fetch from the **origin** (S3, ALB, EC2). Cache hits serve from the edge — milliseconds, not hundreds of milliseconds.
- **Behaviors** let you set different caching rules for different URL patterns. One distribution can serve `/images/*` from S3 and `/*` from an ALB.
- Dynamic content isn't cached, but CloudFront still improves performance through AWS's private backbone network.
- **Avoid stale content** by using versioned filenames (e.g., `hero-v2.jpg`) instead of invalidations — cheaper and more reliable.
- **CloudFront Functions** handle lightweight edge logic (header manipulation, URL rewrites) at sub-millisecond speed. **Lambda@Edge** handles heavier processing that requires network calls.
- **Price classes** let you control which edge locations serve your traffic — and therefore your data transfer cost.
- **Cache key design** determines which request attributes create separate cached variations. More specific keys = lower hit rate. Less specific = risk of serving wrong content.

## Exam Tips

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **CloudFront + S3**: Classic exam pattern for serving static websites globally. S3 bucket as origin, CloudFront as CDN, Origin Access Control to prevent direct S3 access.
- **Edge locations vs Regions vs AZs**: Edge locations are more numerous and exist only for caching/CDN purposes. They are not the same as AZs (which run your compute).
- **Cache invalidation**: Creates a `/images/*` invalidation to force CloudFront to fetch fresh content. Costs money — exam may ask for the cost-effective alternative: versioned URLs (`image-v2.jpg` instead of `image.jpg`), which naturally bypass the cache.
- **TTL control**: `Cache-Control: max-age=3600` at the origin sets a 1-hour cache TTL. CloudFront honors these headers. Minimum TTL, maximum TTL, and default TTL can also be set in the distribution behavior.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions run at the edge for lightweight request/response manipulation (sub-millisecond). Lambda@Edge runs your Lambda code at regional edge locations for heavier processing. Exam distinguishes them by use case complexity. CloudFront Functions cannot make network calls; Lambda@Edge can.
- **Signed URLs and Signed Cookies**: Control who can access content through CloudFront. Signed URLs give access to specific files; signed cookies give access to multiple files. Exam uses these for "paid subscriber content."
- **Price Class**: Exam may ask which price class to choose for a global audience vs. a North America/Europe audience. Price Class All = best performance, highest cost. Price Class 100 = North America and Europe only, lowest cost.
- **Cache key**: Default cache key is the URL. Adding query strings, headers, or cookies to the cache key creates separate cached variations — but increases cache miss rate. Exam may present a scenario where content varies by a query parameter and ask how to configure caching.
- **Origin failover**: CloudFront supports an origin group with a primary and secondary origin. If the primary origin returns a 5xx error, CloudFront automatically retries with the secondary. Different from Route 53 failover — this is within a single CloudFront distribution.
- **Multi-origin behaviors**: A single distribution can route `/images/*` to S3 and `/*` to an ALB. The exam may present this as "how to serve static and dynamic content from one domain without two distributions."
- **CloudFront vs. Global Accelerator:** CloudFront = HTTP/HTTPS CDN, caches content at edge locations, reduces origin load, best for static and cacheable content. Global Accelerator = any TCP/UDP protocol, caches nothing, routes traffic over AWS's private backbone, provides 2 static Anycast IPs, supports near-instant regional failover. Exam trigger: "improve latency for non-HTTP traffic" or "static IP for a global application" or "WebSocket performance for global users" or "faster regional failover than DNS" → Global Accelerator. "Serve static files globally with low latency" → CloudFront.

## Exercises

**Exercise 1 — Recall**

Explain the difference between a CloudFront cache hit and a cache miss. What happens in each case?

*(Hint: Think about where the content comes from, and how the response time differs between the two cases.)*

**Exercise 2 — SAA-C03 Scenario**

*Scenario*: A software company distributes large installer files (~2GB each) from an S3 bucket to customers worldwide. Download speeds are slow for customers in Asia. The team wants to improve performance without replicating the S3 bucket to multiple regions. They also need to ensure that only paying customers can download the installers.

Which solution BEST meets these requirements?

A) Enable S3 Transfer Acceleration on the bucket and generate pre-signed URLs for paying customers  
B) Use CloudFront with the S3 bucket as origin, enable Origin Access Control, and use CloudFront Signed URLs for paying customers  
C) Create an S3 bucket in each AWS region and use Route 53 geolocation routing to direct customers to the nearest bucket  
D) Use an Application Load Balancer in each region with EC2 instances that serve the installer files

**Hint 1**: The requirement is to improve global performance *without* replicating the bucket. Which option doesn't require multiple buckets?

**Hint 2**: Which service specifically controls who can access content served through CloudFront?

**Hint 3**: S3 Transfer Acceleration is optimized for long-distance uploads *to* S3. For delivering content *from* S3 to end users globally, CloudFront is the right tool.

**Answer**: B

**Explanation**: CloudFront caches the installer files at edge locations globally after the first download. Subsequent downloads from the same region come from the edge — much faster than crossing the Pacific from S3 in us-west-2. Origin Access Control ensures the S3 bucket is only accessible through CloudFront. Signed URLs restrict access to paying customers.

**Why not A?** S3 Transfer Acceleration is optimized for long-distance uploads *into* S3 — not for distributing content *from* S3 to a global audience. For that, CloudFront is the correct tool. Pre-signed URLs control access but don't improve global performance.

**Why not C?** Creating an S3 bucket per region does work for performance, but it contradicts the requirement to avoid replication. It also requires a data synchronization strategy across buckets.

**Why not D?** EC2 instances behind a load balancer in each region is significantly more expensive than CloudFront and requires managing servers in multiple regions.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus wants to add video content — short cooking tutorial videos from restaurant partners. Videos can be 50-500MB. They expect the same video to be watched by thousands of users in the same city within hours of publishing.

Design the storage and delivery architecture. Would you use S3 and CloudFront? How would you handle the first request (cold start) to minimize the delay before the video is cached? What cache TTL would you set for a video that won't change after publishing?

*(There is no single correct answer. The goal is to practice CDN design decisions.)*

## Post-Credits Scene

"I already deployed it — oh." Leo had pointed the CloudFront distribution at the wrong origin — the development S3 bucket instead of the production one. For about four minutes, some West Coast users had seen an old version of the app. He'd fixed the origin settings, invalidated the cache, and quietly updated the incident log.

Priya watched the CloudFront metrics after the deployment.

Cache hit rate: 83%.

"What does that mean?" Tom asked.

"It means 83% of our users are getting content from an edge location near them, not from us-west-2."

"And the other 17%?"

"First-time requests. Content that hasn't been cached yet at that edge location."

Tom stared at the metrics. "So we're serving almost a million requests a day from CloudFront edge nodes. And only 170,000 of those actually hit our servers."

"Yes."

"So if we didn't have CloudFront, our servers would be handling a million requests."

"At 140-160 milliseconds each, for global users."

Tom sat back. He had a look that Maya recognized — the look of someone recalculating cost in real time.

"This is worth it," he said.

Maya was already on her laptop. "Two new engineers join us next week. Soo-Jin from the platform team at her last company, and Rafael — he specialized in security. I want them onboarded on IAM before their first day."

"IAM advanced?" Leo asked.

"Roles, policies, cross-account access. The real stuff."

In the next chapter: the fine-grained permissions that let one part of the system talk to another — safely.
